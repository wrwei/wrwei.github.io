---
title: Glossary
lead: Look up terms and symbols, see how to read the notation aloud, and go to the module that explains it.
---

Use the letter links to find a term. Section numbers identify a module and a section. For example, 8.3 is Section 3 of Module 8. On a narrow screen, scroll a table sideways to see the remaining columns. You can also jump to the [notation tables](#notation) or open the [formula sheet](formulas_EN.html).

[A](#g-a) · [B](#g-b) · [C](#g-c) · [D](#g-d) · [E](#g-e) · [F](#g-f) · [G](#g-g) · [H](#g-h) · [I](#g-i) · [J](#g-j) · [L](#g-l) · [M](#g-m) · [N](#g-n) · [O](#g-o) · [P](#g-p) · [Q](#g-q) · [R](#g-r) · [S](#g-s) · [T](#g-t) · [U](#g-u) · [V](#g-v) · [W](#g-w) · [Z](#g-z)

## Notation {#notation}

Read the symbols aloud as shown in the tables. The groups follow the parts of the series. Letters such as $f$, $a$ and $x$ stand for the function, number or variable in the example you are reading.

### Functions, limits and continuity {#notation-limits}

| Notation | Read aloud | Meaning | Section |
|---|---|---|---|
| $f(x)$ | "f of x" | The value of $f$ at $x$. | [1.3](module_01_EN.html#functions) |
| $\R$ | "the real numbers" | The set of all real numbers. | [1.3](module_01_EN.html#domains) |
| $[a,b],\ (a,b)$ | "the closed and open intervals from a to b" | Include both ends with square brackets and exclude them with round brackets. | [1.3](module_01_EN.html#domains) |
| $\abs{x}$ | "the absolute value of x" | The distance of $x$ from $0$. | [1.3](module_01_EN.html#functions) |
| $\sqrt{x},\ \sqrt[3]{x}$ | "square root and cube root of x" | The principal square root for $x\ge 0$ and the real cube root for any real $x$. | [1.4](module_01_EN.html#catalogue) |
| $e^x,\ \ln x$ | "e to the x, natural log of x" | The exponential with base $e$ and its inverse on positive inputs. | [1.4](module_01_EN.html#catalogue), [6.1](module_06_EN.html#number-e) |
| $\log_b x$ | "log base b of x" | The exponent $y$ for which $b^y=x$, with $b>0$, $b\ne1$ and $x>0$. | [1.4](module_01_EN.html#catalogue) |
| $\sin\theta,\ \cos\theta,\ \tan\theta$ | "sine, cosine and tangent of theta" | Trigonometric functions. The series uses radians unless it says otherwise. | [1.4](module_01_EN.html#trig) |
| $f\circ g$ | "f composed with g" | Apply $g$ first, then apply $f$ to its output. | [1.5](module_01_EN.html#new-from-old) |
| $f^{-1}$ | "f inverse" | The inverse function on the range of a one-to-one $f$. | [1.5](module_01_EN.html#new-from-old), [6.2](module_06_EN.html#inverse-functions) |
| $\lim_{x\to a}f(x)$ | "the limit of f of x as x approaches a" | The number that $f(x)$ approaches as $x$ tends to $a$. | [2.1](module_02_EN.html#idea) |
| $\lim_{x\to a^-}f(x),\ \lim_{x\to a^+}f(x)$ | "the limits from the left and from the right" | Approach $a$ with $x<a$ and with $x>a$, respectively. | [2.2](module_02_EN.html#one-sided) |
| $\varepsilon,\ \delta$ | "epsilon, delta" | Positive distances. For a given bound $\varepsilon$ on the output error, choose a bound $\delta$ on how close the input must be to $a$. | [2.7](module_02_EN.html#precise) |
| $\lim_{x\to\infty}f(x)$ | "the limit of f of x as x tends to infinity" | The limit of $f(x)$ as $x$ grows without bound. | [3.7](module_03_EN.html#limits-at-infinity) |
| $f\ll g$ | "f is much smaller than g" | The ratio $f(x)/g(x)$ tends to $0$ in the limit under discussion. | [3.8](module_03_EN.html#growth) |
| $O(g(x))$ | "big O of g of x" | A bound by a constant multiple of $\abs{g(x)}$ sufficiently near the limit under discussion. | [3.8](module_03_EN.html#growth), [4.7](module_04_EN.html#truncation) |

### Derivatives {#notation-derivatives}

| Notation | Read aloud | Meaning | Section |
|---|---|---|---|
| $f'(a),\ f'(x)$ | "f prime of a, f prime of x" | The derivative at $a$, or the derivative as a function of $x$. | [4.2](module_04_EN.html#derivative), [4.3](module_04_EN.html#derivative-function) |
| $\dfrac{dy}{dx},\ \dfrac{d}{dx}$ | "d y by d x, d by d x" | The derivative of $y$ with respect to $x$, or the operation of differentiating with respect to $x$. | [4.3](module_04_EN.html#derivative-function) |
| $f''(x),\ f^{(n)}(x)$ | "f double prime of x, the nth derivative of f at x" | Differentiate twice or $n$ times, respectively. | [4.6](module_04_EN.html#higher-derivatives) |
| $\dfrac{d^2y}{dx^2}$ | "d squared y by d x squared" | The second derivative of $y$ with respect to $x$. | [4.6](module_04_EN.html#higher-derivatives) |
| $\dfrac{df}{du}\dfrac{du}{dx}$ | "d f by d u times d u by d x" | The chain rule for a function of $u$ when $u$ depends on $x$. | [5.5](module_05_EN.html#chain) |
| $\arcsin x,\ \arccos x,\ \arctan x$ | "arc sine, arc cosine, arc tangent of x" | Inverses of the trigonometric functions on their chosen one-to-one branches. | [6.5](module_06_EN.html#inverse-trig) |
| $\sinh x,\ \cosh x,\ \tanh x$ | "hyperbolic sine, cosine and tangent of x" | The hyperbolic functions built from $e^x$ and $e^{-x}$. | [6.7](module_06_EN.html#hyperbolic) |
| $\Delta x,\ \Delta y$ | "delta x, delta y" | Actual changes in the input and output. In an equal-width partition, $\Delta x$ is the common width. | [7.2](module_07_EN.html#linear-approximation), [9.3](module_09_EN.html#riemann-sums) |
| $dx,\ dy$ | "d x, d y" | The input and output differentials, with $dy=f'(x)\,dx$. | [7.2](module_07_EN.html#linear-approximation) |
| $\tilde x$ | "x tilde" | A measurement or approximation of the true value $x$ in the error discussion. | [7.3](module_07_EN.html#errors) |
| $x_n,\ x_{n+1}$ | "x sub n, x sub n plus one" | The current and next iterates in Newton's method. | [7.4](module_07_EN.html#newton) |

### Integrals {#notation-integrals}

| Notation | Read aloud | Meaning | Section |
|---|---|---|---|
| $\sum_{i=m}^{n} a_i$ | "the sum of a sub i for i from m to n" | Add the terms indexed from $m$ through $n$, inclusive. | [9.2](module_09_EN.html#sigma) |
| $L_n,\ R_n,\ M_n$ | "left, right and midpoint sums with n pieces" | Rectangle approximations using the left end, right end or midpoint for each height. | [9.3](module_09_EN.html#riemann-sums) |
| $x_i^*,\ \norm{P}$ | "x sub i star, the norm of P" | The sample point in subinterval $i$ and the largest width in the partition $P$. | [9.4](module_09_EN.html#definite-integral) |
| $\int_a^b f(x)\,dx$ | "the integral from a to b of f of x, d x" | The definite integral. The variable $x$ is the variable of integration. | [9.4](module_09_EN.html#definite-integral) |
| $f_{\mathrm{avg}}$ | "f average" | The integral of $f$ over an interval divided by its length. | [9.7](module_09_EN.html#average) |
| $\int f(x)\,dx$ | "the indefinite integral of f of x, d x" | The family of antiderivatives on the interval, written with an arbitrary constant $C$. | [10.1](module_10_EN.html#antiderivatives) |
| $\big[F(x)\big]_a^b$ | "F of x evaluated from a to b" | The difference $F(b)-F(a)$. | [10.5](module_10_EN.html#ftc2) |
| $T_n,\ S_n$ | "the trapezoidal and Simpson approximations with n pieces" | Quadrature estimates using trapezoids or pairs of subintervals fitted by parabolas. | [11.7](module_11_EN.html#numerical) |
| $\int_a^\infty f(x)\,dx$ | "the integral from a to infinity of f of x, d x" | The limit of $\int_a^t f(x)\,dx$ as $t\to\infty$, when it exists as a finite number. | [12.8](module_12_EN.html#improper) |
| $\int_{-\infty}^\infty f(x)\,dx$ | "the integral from minus infinity to infinity" | Split at a finite point and add the two improper integrals if both converge. | [12.8](module_12_EN.html#improper) |
| $\bar x,\ \bar y$ | "x bar, y bar" | Coordinates of a centre of mass or centroid, or the sample means in least squares. | [12.7](module_12_EN.html#centre-of-mass), [18.5](module_18_EN.html#least-squares) |
| $P(a\le X\le b)$ | "the probability that X lies between a and b" | For a continuous random variable, integrate its density over $[a,b]$. | [12.9](module_12_EN.html#probability) |
| $y'=F(t,y)$ | "y prime equals F of t and y" | A first-order differential equation giving the derivative in terms of time and the current value. | [13.1](module_13_EN.html#what) |

### Sequences and series {#notation-series}

| Notation | Read aloud | Meaning | Section |
|---|---|---|---|
| $(a_n),\ a_n$ | "the sequence a sub n, a sub n" | The whole sequence and its term with index $n$. | [14.1](module_14_EN.html#sequences) |
| $\lim_{n\to\infty}a_n=L$ | "the limit of a sub n as n tends to infinity is L" | The sequence approaches $L$ as the indices grow. | [14.1](module_14_EN.html#sequences) |
| $\sum_{n=1}^{\infty}a_n,\ S_N$ | "the sum of a sub n from n equals one to infinity, S sub N" | The infinite series and its partial sum through index $N$. | [14.3](module_14_EN.html#series) |
| $\sum_{n=0}^{\infty}c_n(x-a)^n$ | "the sum from n equals zero to infinity of c sub n times x minus a to the nth power" | A power series in $x$ centred at $a$ with coefficients $c_n$. | [15.1](module_15_EN.html#power-series) |
| $R$ | "radius of convergence" | The distance from the centre within which a power series converges absolutely. Test finite endpoints separately. | [15.1](module_15_EN.html#power-series) |
| $T_n(x),\ R_n(x)$ | "T n of x, R n of x" | The Taylor polynomial through degree $n$ and its remainder $f(x)-T_n(x)$. | [15.4](module_15_EN.html#taylor-series), [15.5](module_15_EN.html#taylor-theorem) |
| $\binom{k}{n}$ | "k choose n" | The coefficient of $x^n$ in the binomial expansion of $(1+x)^k$. | [15.4](module_15_EN.html#taylor-series) |
| $n!$ | "n factorial" | The product of the integers from $1$ through $n$, with $0!=1$. | [14.8](module_14_EN.html#absolute), [15.4](module_15_EN.html#taylor-series) |
| $i,\ e^{i\theta}$ | "i, e to the i theta" | The imaginary unit with $i^2=-1$, and the complex exponential equal to $\cos\theta+i\sin\theta$. | [15.7](module_15_EN.html#euler) |

### Several variables {#notation-several}

| Notation | Read aloud | Meaning | Section |
|---|---|---|---|
| $x=f(t),\ y=g(t)$ | "x equals f of t, y equals g of t" | A parametric description of a plane curve. | [16.1](module_16_EN.html#parametric) |
| $(r,\theta)$ | "polar coordinates r and theta" | Radius and angle, related to Cartesian coordinates by $x=r\cos\theta$, $y=r\sin\theta$. | [16.3](module_16_EN.html#polar) |
| $\vb{a},\ \vec a,\ \langle a_1,a_2,a_3\rangle$ | "vector a, the vector with components a one, a two, a three" | The same vector in bold, with an arrow, or with components in angle brackets. | [16.4](module_16_EN.html#vectors) |
| $\norm{\vb{a}}$ | "the length of a, or norm of a" | The Euclidean length of the vector. | [16.4](module_16_EN.html#vectors) |
| $\vb{i},\ \vb{j},\ \vb{k}$ | "i, j and k" | The unit vectors along the positive coordinate axes. | [16.4](module_16_EN.html#vectors) |
| $\vb{a}\cdot\vb{b},\ \vb{a}\times\vb{b}$ | "a dot b, a cross b" | The scalar dot product and the vector cross product in three dimensions. | [16.5](module_16_EN.html#dot), [16.6](module_16_EN.html#cross) |
| $\operatorname{comp}_{\vb{a}}\vb{b},\ \operatorname{proj}_{\vb{a}}\vb{b}$ | "the component of b along a, the projection of b onto a" | The signed scalar projection and its vector counterpart, for $\vb{a}\ne\vb{0}$. | [16.5](module_16_EN.html#projections) |
| $\vb{r}(t),\ \vb{r}'(t)$ | "r of t, r prime of t" | Position and its derivative, the velocity vector when $t$ is time. | [16.7](module_16_EN.html#lines-planes), [16.8](module_16_EN.html#motion) |
| $f_x,\ \dfrac{\partial f}{\partial x}$ | "f sub x, partial f by partial x" | Differentiate $f$ with respect to $x$ while holding its other inputs fixed. | [17.3](module_17_EN.html#partial-derivatives) |
| $f_{xy},\ \dfrac{\partial^2 f}{\partial y\,\partial x}$ | "f sub x y, partial squared f by partial y partial x" | Differentiate first with respect to $x$, then with respect to $y$. | [17.3](module_17_EN.html#partial-derivatives) |
| $D_{\vb{u}}f$ | "D sub u of f" | Rate of change per unit distance in the direction of the unit vector $\vb{u}$. | [17.6](module_17_EN.html#gradient) |
| $\nabla f$ | "del f, or grad f" | The vector of first partial derivatives. | [17.6](module_17_EN.html#gradient) |
| $\lambda,\ \mu$ | "lambda, mu" | Multipliers for the constraints in Lagrange's method. | [18.4](module_18_EN.html#lagrange) |
| $H,\ D$ | "the Hessian and its determinant" | The matrix of second partial derivatives and its determinant. | [18.2](module_18_EN.html#second-derivative-test) |
| $\iint_R f\,dA$ | "the double integral over R of f, d A" | Integrate over a plane region, with $dA$ the area element. | [19.1](module_19_EN.html#double-integrals) |
| $\iiint_E f\,dV$ | "the triple integral over E of f, d V" | Integrate over a solid, with $dV$ the volume element. | [19.6](module_19_EN.html#triple) |
| $(\rho,\theta,\varphi)$ | "rho, theta, phi" | Spherical coordinates. $\varphi$ measures the angle from the positive $z$-axis. | [19.7](module_19_EN.html#cylindrical-spherical) |
| $\dfrac{\partial(x,y)}{\partial(u,v)}$ | "the Jacobian of x and y with respect to u and v" | The determinant of the matrix of partial derivatives of the coordinate map. | [19.8](module_19_EN.html#change-of-variables) |
| $\vb{F}(x,y)$ | "F of x, y" | The vector assigned by the field $\vb{F}$ at $(x,y)$. | [20.1](module_20_EN.html#fields) |
| $\int_C f\,ds$ | "the integral of f along C, d s" | Integrate a scalar function along a curve with respect to arc length. | [20.2](module_20_EN.html#line-integrals) |
| $\int_C \vb{F}\cdot d\vb{r}$ | "the line integral of F dot d r along C" | Integrate the tangential component of the vector field along the oriented curve. | [20.2](module_20_EN.html#line-integrals) |
| $\oint_C \vb{F}\cdot d\vb{r}$ | "the line integral of F dot d r round C" | The line integral around a closed curve. | [20.3](module_20_EN.html#conservative) |
| $\nabla\times\vb{F},\ \nabla\cdot\vb{F}$ | "curl F, div F" | The curl and divergence of a vector field. | [20.5](module_20_EN.html#curl-divergence) |
| $\iint_S f\,dS$ | "the surface integral of f over S" | Integrate a scalar function over a surface with respect to surface area. | [20.6](module_20_EN.html#surfaces) |
| $\iint_S\vb{F}\cdot d\vb{S}$ | "the flux of F through S" | Integrate the normal component of $\vb{F}$ with the chosen orientation of $S$. | [20.6](module_20_EN.html#surfaces) |

## Terms from A to Z {#terms}

<div class="section-anchor" id=g-a></div>

### A

| Term | Meaning | Section |
|---|---|---|
| **Abel's theorem** | If a power series with radius $0 < R < \infty$ converges at an endpoint, its sum there is the limit of its sums inside the interval, as $x$ approaches that endpoint. | [15.3](module_15_EN.html#endpoints) |
| **absolute convergence** | $\sum a_n$ converges absolutely if $\sum \abs{a_n}$ converges. Absolute convergence implies convergence, and every rearrangement of an absolutely convergent series has the same sum. | [14.8](module_14_EN.html#absolute) |
| **absolute error** | The absolute value $\abs{\Delta x}$ of the error $\Delta x = x - \tilde x$ of an approximation $\tilde x$ of $x$. | [7.3](module_07_EN.html#errors) |
| **absolute maximum** | $f(c)$ is the absolute (or global) maximum value of $f$ if $f(c) \ge f(x)$ for every $x$ in the domain; the absolute minimum value has $f(c) \le f(x)$. On an interval $I$, the domain is cut down to $I$. | [8.1](module_08_EN.html#extrema), [18.1](module_18_EN.html#critical-points) |
| **absolute value** | $\abs{x} = x$ if $x \ge 0$ and $\abs{x} = -x$ if $x < 0$: the distance from $x$ to 0. $\abs{a - b}$ is the distance between $a$ and $b$. | [1.3](module_01_EN.html#piecewise) |
| **acceleration** | The rate of change of velocity: $a(t) = v'(t) = s''(t)$ on a line, $\vb{a}(t) = \vb{v}'(t) = \vb{r}''(t)$ in space. An object speeds up when its velocity and acceleration have the same sign, and slows down when their signs differ. | [4.6](module_04_EN.html#motion), [16.8](module_16_EN.html#velocity) |
| **accumulation** | How much of a quantity has built up over a stretch of time when its rate keeps changing. Integration computes it. | [1.1](module_01_EN.html#about), [10.3](module_10_EN.html#area-function) |
| **adaptive rule** | A numerical integration rule that keeps halving the subintervals only where the integrand changes fast, as library routines do. | [11.7](module_11_EN.html#which-rule) |
| **addition formulas** | $\sin(x + y) = \sin x\cos y + \cos x\sin y$ and $\cos(x + y) = \cos x\cos y - \sin x\sin y$. | [1.4](module_01_EN.html#trig) |
| **additivity over intervals** | $\int_a^b f(x)\,dx + \int_b^c f(x)\,dx = \int_a^c f(x)\,dx$, when $f$ is continuous, or bounded with finitely many discontinuities, on an interval containing $a$, $b$ and $c$, in any order. | [9.5](module_09_EN.html#properties), [10.3](module_10_EN.html#area-function) |
| **adjoint** | In a computation that ends with the number $L$, the adjoint of a node $v$ is $\bar v = \partial L/\partial v$. The backward pass computes the adjoints from the output back to the inputs. | [17.8](module_17_EN.html#backpropagation) |
| **alternating harmonic series** | $1 - \tfrac12 + \tfrac13 - \tfrac14 + \cdots$. It converges, to $\ln 2$, but only conditionally. | [14.7](module_14_EN.html#alternating), [15.3](module_15_EN.html#endpoints) |
| **alternating series** | A series whose terms alternate in sign, such as $\sum (-1)^{n-1}b_n = b_1 - b_2 + b_3 - \cdots$ with $b_n > 0$. | [14.7](module_14_EN.html#alternating) |
| **alternating series test** | If $b_n > 0$, $b_{n+1} \le b_n$ for every $n$ and $b_n \to 0$, then $\sum (-1)^{n-1}b_n$ converges, and its sum $S$ satisfies $\abs{S - S_N} \le b_{N+1}$: the error is at most the first term left out. | [14.7](module_14_EN.html#alternating) |
| **analytic** | A function is analytic on an open interval if, around each point of it, it equals the sum of its Taylor series on an interval. $e^x$, $\sin x$ and $\cos x$ are analytic on the whole line. | [15.5](module_15_EN.html#series-equals-function) |
| **antiderivative** | $F$ is an antiderivative of $f$ on an interval $I$ if $F'(x) = f(x)$ for every $x$ in $I$; at an endpoint that belongs to $I$, $F'$ is a one-sided derivative. | [10.1](module_10_EN.html#antiderivatives) |
| **arc length** | The length of a curve: the limit of the lengths of inscribed polygons, if it exists. For $y = f(x)$ with $f'$ continuous on $[a, b]$, $L = \int_a^b \sqrt{1 + f'(x)^2}\,dx$; for a path, $\int_a^b \norm{\vb{r}'(t)}\,dt$. | [12.5](module_12_EN.html#arc-length), [16.2](module_16_EN.html#arc-length), [16.8](module_16_EN.html#integrals) |
| **arc length function** | $s(t) = \int_a^t \norm{\vb{r}'(u)}\,du$, the distance travelled along a curve since time $a$; $ds/dt = \norm{\vb{r}'(t)}$. | [16.8](module_16_EN.html#integrals) |
| **Archimedean spiral** | A spiral such as $r = \theta/2$, $\theta \ge 0$: each full turn adds the same amount to $r$, so successive turns are the same distance apart. | [16.3](module_16_EN.html#polar-curves) |
| **arcsec** | For $\abs{x} \ge 1$, this series takes $\arcsec x$ to be the $y$ in $[0, \pi/2) \cup (\pi/2, \pi]$ with $\sec y = x$, that is, $\arccos(1/x)$. Books differ about its range, and so about the sign of its derivative for $x < -1$. | [6.5](module_06_EN.html#inverse-trig) |
| **area between curves** | For $f$ and $g$ continuous on $[a, b]$ with $g \le f$, the area of the region between their graphs is $\int_a^b \big(f(x) - g(x)\big)\,dx$. | [12.2](module_12_EN.html#area) |
| **area function** | For $f$ integrable on every closed interval inside an interval $I$ and $a$ in $I$, $A(x) = \int_a^x f(t)\,dt$ for $x$ in $I$. Also called the accumulation function: it accumulates the signed area under $f$. | [10.3](module_10_EN.html#area-function) |
| **area in polar coordinates** | For $f$ continuous and $f \ge 0$ on $[\alpha, \beta]$, $0 < \beta - \alpha \le 2\pi$, the region bounded by $r = f(\theta)$ and the rays $\theta = \alpha$ and $\theta = \beta$ has area $\int_\alpha^\beta \tfrac12 f(\theta)^2\,d\theta$. | [16.3](module_16_EN.html#polar-area) |
| **array** | In NumPy, a list of numbers that arithmetic acts on all at once. | [1.7](module_01_EN.html#first-session) |
| **astroid** | The curve $x^{2/3} + y^{2/3} = 1$, traced by $x = \cos^3 t$, $y = \sin^3 t$. | [Ex. 6.11](module_06_EN.html#ex-6-11), [Ex. 16.6](module_16_EN.html#ex-16-6) |
| **automatic differentiation** | Computing the derivative of a program by running it once on numbers that carry a derivative along with their value, updated at every step by the rules of differentiation: exact apart from rounding. Dual numbers do it in forward mode. | [5.8](module_05_EN.html#autodiff), [5.8](module_05_EN.html#backprop) |
| **autonomous** | A differential equation $y' = f(y)$ whose right side does not depend on $t$. | [13.3](module_13_EN.html#equilibria) |
| **average rate of change** | The average rate of change of $f$ over $[a, b]$ is $\dfrac{f(b) - f(a)}{b - a} = \dfrac{\Delta y}{\Delta x}$, the slope of the secant line through $(a, f(a))$ and $(b, f(b))$. | [1.6](module_01_EN.html#rates) |
| **average value** | The average value of $f$ on $[a, b]$, where $a < b$, is $f_{\text{avg}} = \dfrac{1}{b - a}\int_a^b f(x)\,dx$. On a rectangle $R$ it is $\dfrac{1}{A(R)}\iint_R f\,dA$. | [9.7](module_09_EN.html#average), [19.2](module_19_EN.html#iterated) |

<div class="section-anchor" id=g-b></div>

### B

| Term | Meaning | Section |
|---|---|---|
| **backpropagation** | Automatic differentiation in the backward direction: run the computation once and keep the values (the forward pass), then go back from the output to the inputs, multiplying local derivatives by the chain rule (the backward pass). It gives the derivative of a loss with respect to every parameter at a cost of a small multiple of computing the loss. | [5.8](module_05_EN.html#backprop), [17.8](module_17_EN.html#backpropagation) |
| **base case** | The first step of a proof by induction: the statement for $n = 1$. | [Ex. 5.10](module_05_EN.html#ex-5-10), [9.2](module_09_EN.html#power-sums) |
| **big-O notation** | $f(n) = O\big(g(n)\big)$ as $n \to \infty$ if there are constants $C$ and $N$ with $\abs{f(n)} \le C\abs{g(n)}$ for every $n \ge N$. As $h \to 0$, $E(h) = O(h^p)$ if $\abs{E(h)} \le C\abs{h}^p$ whenever $0 < \abs{h} < \delta$, for some constants $C$ and $\delta > 0$. | [3.8](module_03_EN.html#big-o), [4.7](module_04_EN.html#truncation) |
| **binomial coefficient** | $\dbinom{n}{k} = \dfrac{n!}{k!\,(n - k)!}$, read "n choose k": the number of ways to choose $k$ things from $n$. For any real $k$, $\dbinom{k}{n} = \dfrac{k(k - 1)\cdots(k - n + 1)}{n!}$, the coefficients of the binomial series. | [4.5](module_04_EN.html#power-rule), [15.4](module_15_EN.html#standard) |
| **binomial series** | $(1 + x)^k = \sum_{n=0}^{\infty} \dbinom{k}{n}x^n$, for every real $k$ and every $x$ with $\abs{x} < 1$: the Maclaurin series of $(1 + x)^k$. | [15.4](module_15_EN.html#standard) |
| **binomial theorem** | $(x + h)^n = \sum_{k=0}^{n}\dbinom{n}{k}x^{n-k}h^k$ for every positive integer $n$: the term $x^{n-k}h^k$ arises once for each way of choosing which $k$ of the $n$ factors supply an $h$. | [4.5](module_04_EN.html#power-rule) |
| **bisection method** | A way to find a root of a continuous $f$ on $[a, b]$ with $f(a)$ and $f(b)$ of opposite signs: halve the bracket again and again, keeping the half where the sign changes. After $n$ steps the midpoint is within $(b - a)/2^{n+1}$ of a root. | [3.4](module_03_EN.html#bisection) |
| **blow up** | A solution blows up when it grows without bound as $t$ approaches a finite time: $y = 1/(1 - t)$, the solution of $y' = y^2$, $y(0) = 1$, blows up as $t \to 1$. | [13.1](module_13_EN.html#existence) |
| **bootstrap sample** | A sample of $n$ items drawn at random, one at a time with replacement, from a data set of $n$ items, as statistics and machine learning use. | [Ex. 7.8](module_07_EN.html#ex-7-8) |
| **boundary point** | A point $P$ such that every open disc centred at $P$ contains points of $R$ and points not in $R$. | [18.3](module_18_EN.html#absolute-extrema) |
| **bounded** | A sequence is bounded above if some number $M$, an upper bound, has $a_n \le M$ for every $n$; bounded below if some lower bound $m$ has $a_n \ge m$; and bounded if both. A set in the plane is bounded if it lies inside some disc. | [14.2](module_14_EN.html#monotone), [18.3](module_18_EN.html#absolute-extrema) |
| **bracket** | In the bisection method, an interval $[a_n, b_n]$ at whose ends $f$ has opposite signs, so that it contains a root. | [3.4](module_03_EN.html#bisection) |

<div class="section-anchor" id=g-c></div>

### C

| Term | Meaning | Section |
|---|---|---|
| **cancellation error** | The loss of accuracy when a computer subtracts two nearly equal floating-point numbers: if they agree in their first $k$ digits, about $k$ of the 16 significant digits are lost. | [2.8](module_02_EN.html#cancellation) |
| **cardioid** | The heart-shaped polar curve $r = 1 + \cos\theta$. | [16.3](module_16_EN.html#polar-curves) |
| **carrying capacity** | The level $K$ in the logistic equation at which the per-capita growth rate $y'/y$ falls to 0: a stable equilibrium that every positive population approaches. | [13.6](module_13_EN.html#logistic) |
| **catenary** | The shape of a chain or cable hanging under its own weight: the graph of $y = a\cosh(x/a)$, with its lowest point at $(0, a)$. | [6.7](module_06_EN.html#hanging-chain) |
| **Cauchy–Schwarz inequality** | $\abs{\vb{a}\cdot\vb{b}} \le \norm{\vb{a}}\,\norm{\vb{b}}$ for all vectors $\vb{a}$ and $\vb{b}$. | [Ex. 16.11](module_16_EN.html#ex-16-11) |
| **Cauchy's mean value theorem** | If $f$ and $g$ are continuous on $[a, b]$ and differentiable on $(a, b)$, then $\big(f(b) - f(a)\big)g'(c) = \big(g(b) - g(a)\big)f'(c)$ for some $c$ in $(a, b)$. It proves L'Hôpital's rule. | [8.2](module_08_EN.html#consequences) |
| **central difference** | $\dfrac{f(a + h) - f(a - h)}{2h}$, for a step $h > 0$: the average of the forward and backward differences, an estimate of $f'(a)$ with error $O(h^2)$. | [4.7](module_04_EN.html#differences) |
| **centre of mass** | The point at which a body balances. Masses $m_i$ at $x_i$ on a line have $\bar x = \sum m_ix_i/\sum m_i$; a rod along $[a, b]$ with continuous density $\rho > 0$ has $\bar x = \dfrac1M\int_a^b x\,\rho(x)\,dx$, where $M = \int_a^b \rho(x)\,dx$. A plate has $(\bar x, \bar y) = (M_y/m, M_x/m)$. | [12.7](module_12_EN.html#centre-of-mass), [19.5](module_19_EN.html#mass), [19.6](module_19_EN.html#triple) |
| **centripetal acceleration** | The acceleration of uniform motion round a circle of radius $R$ at speed $v$: it points to the centre and has length $v^2/R$. | [Ex. 16.10](module_16_EN.html#ex-16-10) |
| **centroid** | The centre of mass of a plate or solid of uniform positive density. For a plate between continuous $g\le f$ on $[a,b]$ with area $A>0$, $\bar x=\tfrac1A\int_a^b x(f-g)\,dx$ and $\bar y=\tfrac1A\int_a^b \tfrac12(f^2-g^2)\,dx$. | [12.7](module_12_EN.html#centre-of-mass), [19.5](module_19_EN.html#mass), [19.6](module_19_EN.html#triple) |
| **chain rule** | If $g$ is differentiable at $x$ and $f$ at $g(x)$, then $\big(f(g(x))\big)' = f'\big(g(x)\big)\,g'(x)$; in Leibniz's notation, $\dfrac{dy}{dx} = \dfrac{dy}{du}\,\dfrac{du}{dx}$: rates multiply. In several variables, $\dfrac{dz}{dt} = \dfrac{\partial z}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial z}{\partial y}\dfrac{dy}{dt}$. | [5.5](module_05_EN.html#rates-multiply), [17.5](module_17_EN.html#chain-rule) |
| **change of base** | For a positive base $a$, $a^x=e^{x\ln a}$. For logarithms, $\log_a x=\ln x/\ln a$ when $a\ne1$ and $x>0$. | [6.1](module_06_EN.html#base-e) |
| **change of variables** | $\iint_D f(x, y)\,dA = \iint_S f\big(x(u, v), y(u, v)\big)\abs{\dfrac{\partial(x, y)}{\partial(u, v)}}\,du\,dv$, for a transformation with continuous first partial derivatives that maps $S$ onto $D$ one-to-one, with nonzero Jacobian, except perhaps on the boundary of $S$; $S$ and $D$ of type I or II. | [19.8](module_19_EN.html#change-of-variables) |
| **characteristic equation** | $ar^2 + br + c = 0$, the equation for the numbers $r$ that make $y = e^{rt}$ a solution of $ay'' + by' + cy = 0$. Two real roots give the solutions $C_1e^{r_1t} + C_2e^{r_2t}$, one root gives $(C_1 + C_2t)e^{rt}$, and no real roots give $e^{\alpha t}(C_1\cos\beta t + C_2\sin\beta t)$ with $\alpha = -\dfrac{b}{2a}$ and $\beta = \dfrac{\sqrt{4ac - b^2}}{2a}$. | [13.8](module_13_EN.html#second-order) |
| **circulation** | $\oint_C \vb{F}\cdot\vb{T}\,ds = \oint_C \vb{F}\cdot d\vb{r}$: how strongly a field flows round a closed curve $C$. | [20.4](module_20_EN.html#flux-form) |
| **Clairaut's theorem** | If $f$ is defined on a disc $D$ containing $(a, b)$, and $f_{xy}$ and $f_{yx}$ are both continuous on $D$, then $f_{xy}(a, b) = f_{yx}(a, b)$. | [17.3](module_17_EN.html#higher) |
| **closed curve** | A curve that ends where it starts. $\oint_C$ marks a line integral round a closed curve. | [20.3](module_20_EN.html#conservative) |
| **closed interval** | $[a, b]$, for $a < b$: the numbers $x$ with $a \le x \le b$, both endpoints included. | [1.3](module_01_EN.html#intervals) |
| **closed interval method** | To find the absolute extreme values of a function continuous on $[a, b]$, compare its values at the endpoints and at the critical numbers in $(a, b)$: the largest is the maximum and the smallest the minimum. | [8.1](module_08_EN.html#closed-interval) |
| **closed region method** | To find the absolute extreme values of a continuous $f$ on a closed, bounded region: find the values at the critical points inside, find the largest and smallest values on the boundary, and compare them all. | [18.3](module_18_EN.html#absolute-extrema) |
| **closed set** | A set of the plane that contains all its boundary points. | [18.3](module_18_EN.html#absolute-extrema) |
| **coefficient** | A constant that multiplies a power of the variable: $a_k$ in a polynomial $\sum a_kx^k$, or $c_n$ in a power series $\sum c_n(x - a)^n$. | [1.4](module_01_EN.html#polynomials), [15.1](module_15_EN.html#power-series) |
| **comparison property** | For $a < b$ and integrable $f$ and $g$: if $f \le g$ on $[a, b]$, then $\int_a^b f \le \int_a^b g$; and if $m \le f(x) \le M$ there, then $m(b - a) \le \int_a^b f(x)\,dx \le M(b - a)$. | [9.5](module_09_EN.html#properties) |
| **comparison test** | For integrals: if $0 \le f(x) \le g(x)$ for $x \ge a$, with $f$ and $g$ continuous, then $\int_a^\infty f$ converges if $\int_a^\infty g$ does, and $\int_a^\infty g$ diverges if $\int_a^\infty f$ does. For series: if $0 \le a_n \le b_n$ from some index on, $\sum a_n$ converges if $\sum b_n$ does, and $\sum b_n$ diverges if $\sum a_n$ does. | [12.8](module_12_EN.html#comparison), [14.6](module_14_EN.html#comparison) |
| **completeness** | The property of the real numbers that the number line has no gaps. The proofs of the Intermediate Value Theorem and of the Monotone Convergence Theorem rest on it; analysis states it as the least upper bound property. | [3.3](module_03_EN.html#ivt), [14.2](module_14_EN.html#mct) |
| **complex analysis** | Calculus with functions of a complex variable, the setting of Euler's formula. | [20.8](module_20_EN.html#next) |
| **complex exponential** | $e^z = \sum_{n=0}^{\infty} \dfrac{z^n}{n!} = 1 + z + \dfrac{z^2}{2!} + \cdots$, for every complex number $z$. | [15.7](module_15_EN.html#complex) |
| **complex number** | A number $z = p + qi$, where $p$ and $q$ are real and $i^2 = -1$: $p$ is its real part and $q$ its imaginary part. Complex numbers are added and multiplied like expressions in $i$, with $i^2$ replaced by $-1$. | [15.7](module_15_EN.html#complex) |
| **complex plane** | The plane in which $z = p + qi$ is the point $(p, q)$, with real parts along the horizontal axis and imaginary parts up the vertical one. | [15.7](module_15_EN.html#complex) |
| **component** | One of the numbers $a_1, a_2, a_3$ of a vector $\langle a_1, a_2, a_3\rangle$: the vector from $A(x_1, y_1, z_1)$ to $B(x_2, y_2, z_2)$ has components $x_2 - x_1$, $y_2 - y_1$, $z_2 - z_1$. A vector field has component functions $P$, $Q$, $R$. | [16.4](module_16_EN.html#components), [20.1](module_20_EN.html#fields) |
| **composition** | $f \circ g$, the function $(f \circ g)(x) = f\big(g(x)\big)$. Its domain is the set of $x$ in the domain of $g$ for which $g(x)$ is in the domain of $f$. | [1.5](module_01_EN.html#composition) |
| **computational graph** | A graph of a computation with a node for each input and each intermediate result, and an arrow from each node to each node computed directly from it: its children; the nodes it is computed from are its parents. Each arrow carries a local derivative. | [17.8](module_17_EN.html#backpropagation) |
| **concave up** | The graph of $f$ is concave up on an open interval $I$, where $f$ is differentiable, if $f'$ is increasing on $I$; concave down if $f'$ is decreasing. A graph that is concave up lies above its tangent lines. | [8.4](module_08_EN.html#concavity) |
| **concavity test** | If $f''(x) > 0$ for every $x$ in an open interval $I$, the graph of $f$ is concave up on $I$; if $f''(x) < 0$, concave down. | [8.4](module_08_EN.html#concavity) |
| **condition number** | (1) $\abs{xf'(x)/f(x)}$, the factor by which computing $f(x)$ multiplies the relative error of $x$. (2) For the bowl $\tfrac12(ax^2 + cy^2)$, $0 < a \le c$, the ratio $\kappa = c/a$; gradient descent is slow when it is large. | [7.3](module_07_EN.html#errors), [18.6](module_18_EN.html#ill-conditioning) |
| **conditional convergence** | $\sum a_n$ converges conditionally if it converges but $\sum \abs{a_n}$ diverges. Rearranging such a series can change its sum. | [14.8](module_14_EN.html#absolute), [14.8](module_14_EN.html#rearrangements) |
| **conditional probability** | $P(A \mid B) = \dfrac{P(A \text{ and } B)}{P(B)}$, for $P(B) > 0$: the probability that $A$ happens among the occasions on which $B$ happens. | [12.9](module_12_EN.html#exponential-distribution) |
| **conjugate** | The same two terms with the opposite sign between them: $\sqrt{x} + 3$ is the conjugate of $\sqrt{x} - 3$. Multiplying a fraction above and below by it rationalises a difference that contains a square root. | [2.5](module_02_EN.html#rationalise) |
| **connected** | A region is connected if any two of its points can be joined by a piecewise smooth curve in it. | [20.3](module_20_EN.html#conservative) |
| **conservative field** | A vector field $\vb{F} = \nabla f$ for some function $f$, its potential. On an open connected region, a continuous field is conservative exactly when its line integrals are independent of the path, and exactly when they are 0 round every closed curve. | [20.3](module_20_EN.html#conservative) |
| **constant multiple rule** | If $f$ is differentiable at $x$ and $c$ is a constant, then $(cf)'(x) = c\,f'(x)$. | [4.5](module_04_EN.html#sum-rule) |
| **constant of integration** | The arbitrary constant $C$ in a general antiderivative or an indefinite integral, $\int f(x)\,dx = F(x) + C$. | [10.1](module_10_EN.html#antiderivatives) |
| **constant rule** | The derivative of a constant function is 0: $\dfrac{d}{dx}(c) = 0$. | [4.5](module_04_EN.html#power-rule) |
| **constraint** | An equation $g(x, y) = c$ that ties the variables of an optimisation problem together. | [18.4](module_18_EN.html#lagrange) |
| **continuity laws** | If $f$ and $g$ are continuous at $a$, so are $f + g$, $f - g$, $cf$, $fg$, and $f/g$ if $g(a) \ne 0$. Compositions of continuous functions are continuous. | [3.2](module_03_EN.html#laws) |
| **continuous** | $f$ is continuous at $a$ if $\lim_{x\to a} f(x) = f(a)$: $f(a)$ is defined, the limit exists and the two are equal. It is continuous on an interval if it is continuous at every number of the interval, except that at an endpoint that belongs to it, it need only be continuous from the side of the interval. Module 17 defines continuity in two variables. | [3.1](module_03_EN.html#continuity), [3.1](module_03_EN.html#one-sided), [17.2](module_17_EN.html#continuity) |
| **continuous compounding** | Adding interest continually, at every instant: the limit as $n \to \infty$ of adding it $n$ times a year. At 100% a year, £1 becomes $\lim_{n\to\infty}(1 + 1/n)^n = e$ pounds. | [6.1](module_06_EN.html#compound-interest) |
| **continuous from the right** | $f$ is continuous from the right at $a$ if $\lim_{x\to a^+} f(x) = f(a)$, and continuous from the left if $\lim_{x\to a^-} f(x) = f(a)$. | [3.1](module_03_EN.html#one-sided) |
| **contour lines** | Lines on a map joining points at one height above sea level. Isotherms join points of equal temperature, isobars points of equal air pressure. | [17.1](module_17_EN.html#level-curves) |
| **contrapositive** | For an implication from $P$ to $Q$, the equivalent implication from failure of $Q$ to failure of $P$. Since differentiability implies continuity, discontinuity rules out differentiability. | [4.4](module_04_EN.html#continuity) |
| **converge** | An improper integral converges if its defining limit exists as a finite number. A sequence converges if it has a limit $L$, a number. A series converges if its sequence of partial sums converges. Whatever does not converge diverges. | [12.8](module_12_EN.html#infinite-intervals), [14.1](module_14_EN.html#limit), [14.3](module_14_EN.html#partial-sums) |
| **convex** | A function whose graph is concave up, bending upwards, is called convex in optimisation and machine learning; one whose graph is concave down is called concave. | [6.1](module_06_EN.html#base-e), [8.4](module_08_EN.html#concavity) |
| **corner** | A point where both one-sided derivatives exist but differ, as for $\abs{x}$ at 0: no single line is the tangent there. | [4.4](module_04_EN.html#failures) |
| **correct to $d$ decimal places** | An approximation $\tilde x$ of $r$ is correct to $d$ decimal places if $\abs{r - \tilde x} < 0.5 \times 10^{-d}$. | [7.4](module_07_EN.html#newton) |
| **cosine similarity** | The cosine of the angle between two vectors, $\dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}$, which search engines and language models use to measure how alike two documents or words are. | [16.5](module_16_EN.html#angles) |
| **cover-up method** | For $Q(x) = (x - r_1)\cdots(x - r_n)$ with different $r_k$ and $P$ of degree less than $n$: the constant over $x - r_k$ in the partial fractions of $P/Q$ is $P(r_k)$ divided by the product of the other factors at $r_k$, found by covering up $x - r_k$. | [11.4](module_11_EN.html#linear-factors) |
| **critical number** | A number $c$ in the domain of $f$ at which $f'(c) = 0$ or $f'(c)$ does not exist. Every local extremum is at a critical number. Some books say critical point. | [8.1](module_08_EN.html#extrema) |
| **critical point** | A point $(a, b)$ of the domain of $f$ where $\nabla f(a, b) = \vb{0}$, or where $f_x$ or $f_y$ does not exist. Every local extremum is at a critical point. Some books say critical point for the critical number of a function of one variable. | [8.1](module_08_EN.html#extrema), [18.1](module_18_EN.html#critical-points) |
| **cross product** | $\vb{a}\times\vb{b} = \langle a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1\rangle$, for vectors in space. It is orthogonal to $\vb{a}$ and $\vb{b}$, has length $\norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$ (the area of their parallelogram), and $\vb{b}\times\vb{a} = -\vb{a}\times\vb{b}$. | [16.6](module_16_EN.html#cross) |
| **cube root** | $\sqrt[3]{x}$, the number whose cube is $x$, defined for every real $x$. The $n$th root $\sqrt[n]{x} = x^{1/n}$ is defined for every $x$ when $n$ is odd and for $x \ge 0$ when $n$ is even. | [1.4](module_01_EN.html#roots) |
| **cubic** | A polynomial of degree 3. | [1.4](module_01_EN.html#polynomials) |
| **curl** | $\operatorname{curl}\vb{F} = \nabla\times\vb{F} = \langle R_y - Q_z,\ P_z - R_x,\ Q_x - P_y\rangle$ for $\vb{F} = \langle P, Q, R\rangle$: the circulation per unit area round small loops, how strongly the field turns about each point. | [20.5](module_20_EN.html#curl-divergence), [20.5](module_20_EN.html#meaning) |
| **curvature** | $\kappa = \Big\lVert\dfrac{d\vb{T}}{ds}\Big\rVert = \dfrac{\norm{\vb{T}'(t)}}{\norm{\vb{r}'(t)}}$: how fast the direction of a curve turns per unit of distance travelled. A circle of radius $R$ has curvature $1/R$. | [16.8](module_16_EN.html#projectiles) |
| **curve sketching** | Drawing the graph of $f$ from its domain, intercepts, symmetry, asymptotes, a sign chart of $f'$ (rise, fall, local extrema) and one of $f''$ (concavity, inflection points). | [8.5](module_08_EN.html#sketching) |
| **cusp** | A sharp point of a graph where the difference quotients of a continuous function tend to $\infty$ on one side and $-\infty$ on the other, as for $x^{2/3}$ at 0; also where two arches of a cycloid meet. | [4.4](module_04_EN.html#failures), [16.2](module_16_EN.html#tangents) |
| **cycloid** | The curve traced by a point on the rim of a wheel of radius $r$ rolling along a line: $x = r(t - \sin t)$, $y = r(1 - \cos t)$. Each arch, for $t$ from 0 to $2\pi$, meets the next in a cusp. | [16.1](module_16_EN.html#cycloid) |
| **cylindrical coordinates** | $(r, \theta, z)$: the polar coordinates $(r, \theta)$ of a point's shadow on the $xy$-plane, and its height $z$. In them, $dV = r\,dz\,dr\,d\theta$. | [19.7](module_19_EN.html#cylindrical) |
| **cylindrical shell** | A thin tube of radius $x$, height $f(x)$ and thickness $\Delta x$, swept out when a thin strip rotates about the $y$-axis. | [12.4](module_12_EN.html#shells) |

<div class="section-anchor" id=g-d></div>

### D

| Term | Meaning | Section |
|---|---|---|
| **damping** | A resisting force $-cx'$ proportional to the velocity, with damping constant $c \ge 0$. A mass on a spring is overdamped if $c^2 > 4mk$, critically damped if $c^2 = 4mk$ (neither oscillates), and underdamped if $c^2 < 4mk$ (it oscillates with shrinking size). | [13.8](module_13_EN.html#second-order) |
| **decreasing** | (1) A function $f$ is decreasing on an interval if $x_1 < x_2$ in it always gives $f(x_1) > f(x_2)$. (2) A sequence $(a_n)$ is decreasing if $a_n \ge a_{n+1}$ for every $n$. | [4.3](module_04_EN.html#graph-of-derivative), [8.3](module_08_EN.html#monotonic), [14.2](module_14_EN.html#monotone) |
| **definite integral** | For $a < b$, $\int_a^b f(x)\,dx$ is the number $I$ that the Riemann sums of $f$ on $[a, b]$ approach as the norm of the partition tends to 0, whatever the sample points, when such a number exists. For $f \ge 0$ it is the area under the graph; in general, the net area. | [9.1](module_09_EN.html#area-distance), [9.4](module_09_EN.html#definite-integral) |
| **degree** | A polynomial $a_nx^n + \dots + a_0$ with $a_n \ne 0$ has degree $n$. | [1.4](module_01_EN.html#polynomials) |
| **density** | Mass per unit length of a rod, $\rho(x)$, or per unit area of a plate, $\rho(x, y)$. For probability densities, see probability density function. | [12.1](module_12_EN.html#method), [19.5](module_19_EN.html#mass) |
| **dependent variable** | The output of a function: $y$ in $y = f(x)$, or $z$ in $z = f(x, y)$. | [1.3](module_01_EN.html#functions), [17.1](module_17_EN.html#functions) |
| **derivative** | The derivative of $f$ at $a$ is $f'(a) = \lim_{h\to0}\dfrac{f(a + h) - f(a)}{h}$, when this limit exists as a real number: the slope of the tangent line and the instantaneous rate of change. The derivative function $f'$ takes this value at every $x$ where $f$ is differentiable. | [1.1](module_01_EN.html#two-problems), [4.2](module_04_EN.html#derivative), [4.3](module_04_EN.html#derivative-function) |
| **derivative function** | The function $f'$ with $f'(x) = \lim_{h\to0}\dfrac{f(x + h) - f(x)}{h}$ at every $x$ where this limit exists. Its domain may be smaller than that of $f$. | [4.3](module_04_EN.html#derivative-function) |
| **derivative of a vector function** | $\vb{r}'(t) = \lim_{h\to0}\dfrac{\vb{r}(t + h) - \vb{r}(t)}{h} = \langle f'(t), g'(t), h'(t)\rangle$. Where it is not $\vb{0}$, it is a tangent vector, pointing the way the curve is traced. | [16.8](module_16_EN.html#velocity) |
| **derivative of an inverse function** | If $f$ is continuous and one-to-one on an open interval and differentiable at $a$ with $f'(a) \ne 0$, then $(f^{-1})'(b) = \dfrac{1}{f'(a)}$ at $b = f(a)$. | [6.2](module_06_EN.html#inverse-functions) |
| **determinant** | The number $ps - qr$ of the $2 \times 2$ array with rows $p, q$ and $r, s$. Each component of a cross product is one; so are the determinant $D$ of the Hessian and the Jacobian. | [16.6](module_16_EN.html#cross), [18.2](module_18_EN.html#second-derivative-test), [19.8](module_19_EN.html#change-of-variables) |
| **difference quotient** | $\dfrac{f(a + h) - f(a)}{h}$, for $h \ne 0$ with $a$ and $a + h$ in the domain of $f$: the average rate of change of $f$ between $a$ and $a + h$. | [1.6](module_01_EN.html#difference-quotient) |
| **differentiable** | $f$ is differentiable at $a$ if $f'(a)$ exists as a real number. It is differentiable on an open interval if it is differentiable at every point of it, and on $[a, b]$ if it is differentiable on $(a, b)$ and the right-hand derivative at $a$ and the left-hand derivative at $b$ exist. | [4.2](module_04_EN.html#derivative), [4.4](module_04_EN.html#failures) |
| **differentiable implies continuous** | If $f$ is differentiable at $a$, then $f$ is continuous at $a$. The converse is false: $\abs{x}$ is continuous but not differentiable at 0. The same holds in two variables. | [4.4](module_04_EN.html#continuity), [17.4](module_17_EN.html#differentiability) |
| **differentiable (two variables)** | $f$ is differentiable at $(a, b)$ if $f_x$ and $f_y$ exist there and the error $E$ of the linearisation satisfies $E(x, y)/\sqrt{(x - a)^2 + (y - b)^2} \to 0$ as $(x, y) \to (a, b)$. Partial derivatives that exist on a disc around $(a, b)$ and are continuous at $(a, b)$ guarantee it. | [17.4](module_17_EN.html#differentiability) |
| **differential** | For $y = f(x)$ with $f$ differentiable, the differential $dx$ is an independent variable, any real number, and the differential $dy = f'(x)\,dx$ is the change along the tangent line. $\Delta y \approx dy$ when $dx$ is small. | [7.2](module_07_EN.html#differentials), [17.4](module_17_EN.html#differential) |
| **differential equation** | An equation that involves an unknown function and one or more of its derivatives, such as $y' = ky$. Its order is the order of the highest derivative in it. | [6.8](module_06_EN.html#growth-decay), [10.2](module_10_EN.html#initial-value), [13.1](module_13_EN.html#what) |
| **differential forms** | The language in which the fundamental theorems of the series become one theorem, $\int_M d\omega = \int_{\partial M}\omega$. | [20.8](module_20_EN.html#next) |
| **differential geometry** | The study of curves and surfaces with calculus: how they bend, and the shortest paths on them. | [20.8](module_20_EN.html#next) |
| **differentiation** | Finding a derivative. With integration it is one of the two processes of calculus, and the Fundamental Theorem of Calculus says that each undoes the other. | [1.1](module_01_EN.html#about), [4.3](module_04_EN.html#derivative-function) |
| **direct substitution** | Finding a limit by evaluating: $\lim_{x\to a} p(x) = p(a)$ for a polynomial $p$, and $\lim_{x\to a} r(x) = r(a)$ for a rational function $r$ with $r(a)$ defined. It works for every continuous function. | [2.4](module_02_EN.html#substitution) |
| **direction field** | The picture of a first-order equation $y' = F(t, y)$: a short segment of slope $F(t, y)$ at each point of a grid. Solution curves are tangent to it. Also called a slope field. | [13.3](module_13_EN.html#direction-fields) |
| **directional derivative** | For a unit vector $\vb{u} = \langle u_1, u_2\rangle$, $D_{\vb{u}} f(a, b) = \lim_{h\to0}\dfrac{f(a + hu_1, b + hu_2) - f(a, b)}{h}$: the rate of change of $f$ in the direction of $\vb{u}$. If $f$ is differentiable, it equals $\nabla f(a, b)\cdot\vb{u}$. | [17.6](module_17_EN.html#gradient) |
| **disc method** | The volume of the solid swept out when the region under $y = f(x) \ge 0$, $a \le x \le b$, rotates about the $x$-axis: $V = \pi\int_a^b f(x)^2\,dx$, adding discs of radius $f(x)$. | [12.3](module_12_EN.html#washers) |
| **discontinuity** | A number $a$ at which $f$ is not continuous, though $f$ is defined on an open interval around $a$ except perhaps at $a$; $f$ is then discontinuous at $a$. Its kinds are removable, jump, infinite and oscillating. | [3.1](module_03_EN.html#continuity), [3.1](module_03_EN.html#kinds) |
| **displacement** | The net change in position, $s(b) - s(a) = \int_a^b v(t)\,dt$. In space, the vector from where something starts to where it ends. | [9.4](module_09_EN.html#signed-area), [10.6](module_10_EN.html#net-change-theorem), [16.4](module_16_EN.html#arithmetic) |
| **distance from a point to a plane** | The distance from $(x_1, y_1, z_1)$ to the plane $ax + by + cz = d$ is $\dfrac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}}$. | [16.7](module_16_EN.html#planes) |
| **distance travelled** | $\int_a^b \abs{v(t)}\,dt$: the distance a moving object covers, with every movement counted as positive. | [9.4](module_09_EN.html#signed-area) |
| **diverge** | To fail to converge. A sequence diverges to infinity, $a_n \to \infty$, if for every number $M$ there is an $N$ with $a_n > M$ for every $n > N$. | [12.8](module_12_EN.html#infinite-intervals), [14.1](module_14_EN.html#limit), [14.3](module_14_EN.html#partial-sums) |
| **divergence** | $\operatorname{div}\vb{F} = \nabla\cdot\vb{F} = P_x + Q_y + R_z$: the rate at which the flow carries fluid out of small regions, per unit of volume (of area, in the plane). Where it is positive the flow spreads out; where it is negative, it gathers. | [20.5](module_20_EN.html#curl-divergence), [20.5](module_20_EN.html#meaning) |
| **divergence test** | If $\sum a_n$ converges, then $a_n \to 0$. So if $a_n$ does not tend to 0, the series diverges; if $a_n \to 0$, the test says nothing. | [14.4](module_14_EN.html#harmonic) |
| **divergence theorem** | For a bounded solid $E$ with piecewise smooth outward-oriented boundary $S$, $\iint_S\vb{F}\cdot d\vb{S}=\iiint_E\operatorname{div}\vb{F}\,dV$ if $\vb{F}$ has continuous first partial derivatives on an open neighbourhood of the solid, including its boundary. | [20.7](module_20_EN.html#divergence-theorem) |
| **division by zero** | A quotient with denominator zero is undefined. When finding a formula's domain, exclude every input that makes a denominator zero. | [1.3](module_01_EN.html#domains) |
| **does not exist (limit)** | A limit does not exist when no number $L$ fits the definition, as with a jump, a blow-up or an oscillation. An infinite limit does not exist in this sense either. | [2.1](module_02_EN.html#idea), [2.3](module_02_EN.html#no-limit) |
| **domain** | The set of inputs of a function. For a formula with no domain stated, the convention is the set of all real numbers for which the formula gives a real number. | [1.3](module_01_EN.html#functions), [17.1](module_17_EN.html#functions) |
| **dot product** | $\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3$, a number, also called the scalar product. For nonzero vectors at angle $\theta$, $0 \le \theta \le \pi$, $\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta$. | [16.5](module_16_EN.html#dot) |
| **double-angle formulas** | $\sin 2u = 2\sin u\cos u$ and $\cos 2u = \cos^2 u - \sin^2 u = 1 - 2\sin^2 u$: the addition formulas with both angles equal. | [16.2](module_16_EN.html#tangents) |
| **double integral** | $\iint_R f(x, y)\,dA$, the limit of double Riemann sums $\sum\sum f(x_{ij}^*, y_{ij}^*)\,\Delta A$ over a rectangle $R$, cut into $m \times n$ small rectangles of area $\Delta A$, when it exists. For $f \ge 0$ it is the volume under the surface $z = f(x, y)$. | [19.1](module_19_EN.html#double-integrals) |
| **doubling time** | The time $T = \dfrac{\ln 2}{k}$ in which $y = Ce^{kt}$, with $k > 0$, doubles, whatever the starting value and whenever the clock starts. | [6.8](module_06_EN.html#doubling) |
| **dual number** | An expression $a + b\varepsilon$ with real $a$ and $b$ and a new symbol $\varepsilon$ with $\varepsilon^2 = 0$; $b$ is its $\varepsilon$-part. For a polynomial $p$, $p(a + \varepsilon) = p(a) + p'(a)\,\varepsilon$, so the $\varepsilon$-part carries the derivative. | [5.8](module_05_EN.html#autodiff) |
| **dummy variable** | A variable whose name does not matter, such as the index of a sum or the variable of integration: $\int_a^x f(t)\,dt$ and $\int_a^x f(s)\,ds$ are the same number. | [9.2](module_09_EN.html#sigma), [10.3](module_10_EN.html#area-function) |

<div class="section-anchor" id=g-e></div>

### E

| Term | Meaning | Section |
|---|---|---|
| **eigenvalues** | For a bowl with tilted elliptical level curves, its curvatures along the axes of the ellipses: the eigenvalues of the Hessian matrix, which the Mathematical Foundations series studies. | [18.6](module_18_EN.html#rescaling) |
| **element of area** | $dA$ in $\iint_R f\,dA$, which recalls the areas $\Delta A$ of small rectangles: $dA = dx\,dy$, or $r\,dr\,d\theta$ in polar coordinates. | [19.1](module_19_EN.html#double-integrals), [19.4](module_19_EN.html#polar) |
| **elementary function** | A function built from constants and $x$ with finitely many additions, subtractions, multiplications, divisions, powers, roots, exponentials, logarithms, trigonometric and inverse trigonometric functions, and compositions of these. | [11.6](module_11_EN.html#nonelementary) |
| **eliminating the parameter** | Turning parametric equations into one equation in $x$ and $y$: solve one for $t$ and substitute into the other, or combine them, as $\cos^2 t + \sin^2 t = 1$ does. | [16.1](module_16_EN.html#eliminating) |
| **ellipse** | A circle stretched by different factors along two perpendicular directions: $x = 3\cos t$, $y = 2\sin t$ traces the ellipse $\dfrac{x^2}{9} + \dfrac{y^2}{4} = 1$. | [16.1](module_16_EN.html#parametric) |
| **elliptic integral** | An integral such as the perimeter of an ellipse, whose integrand has no elementary antiderivative, so that it is computed numerically. | [16.3](module_16_EN.html#polar-area) |
| **ε–δ definition of a limit** | $\lim_{x\to a} f(x) = L$ means: for every $\varepsilon > 0$ there is a $\delta > 0$ such that $\abs{f(x) - L} < \varepsilon$ for every $x$ with $0 < \abs{x - a} < \delta$; $f$ must be defined on an open interval around $a$, except possibly at $a$. | [2.7](module_02_EN.html#precise), [2.7](module_02_EN.html#proofs) |
| **equilibrium solution** | A constant solution $y = y^*$ of $y' = f(y)$: a number with $f(y^*) = 0$. It is stable if every solution that starts close enough to it approaches it as $t \to \infty$, and unstable if some solutions that start as close to it as you like move away. If $f'$ is continuous, $f'(y^*) < 0$ makes it stable and $f'(y^*) > 0$ unstable. | [13.3](module_13_EN.html#equilibria) |
| **error function** | $\operatorname{erf} x = \dfrac{2}{\sqrt\pi}\displaystyle\int_0^x e^{-t^2}\,dt$, for every real $x$: an antiderivative of $e^{-x^2}$ up to a constant factor, which has no elementary formula. Normal probabilities are computed with it. | [10.8](module_10_EN.html#special-functions), [11.6](module_11_EN.html#nonelementary), [12.9](module_12_EN.html#normal) |
| **error (of an approximation)** | The exact value minus the approximation. It is positive when the approximation is too small and negative when it is too large. | [4.7](module_04_EN.html#differences), [7.3](module_07_EN.html#errors), [9.3](module_09_EN.html#riemann-sums) |
| **Euler's constant** | $\gamma \approx 0.5772$, the limit of $H_N - \ln N$ as $N \to \infty$. | [14.5](module_14_EN.html#slow) |
| **Euler's formula** | $e^{i\theta} = \cos\theta + i\sin\theta$ for every real $\theta$. It explains why complex roots of a characteristic equation give solutions with $\cos$ and $\sin$. | [15.7](module_15_EN.html#euler-formula), [15.7](module_15_EN.html#oscillations) |
| **Euler's method** | A numerical method for $y' = F(t, y)$, $y(t_0) = y_0$: with a step size $h > 0$, compute $t_{n+1} = t_n + h$ and $y_{n+1} = y_n + h\,F(t_n, y_n)$, following the direction field in straight steps. It has order 1: its error at a fixed time is $O(h)$. | [13.4](module_13_EN.html#euler), [13.4](module_13_EN.html#euler-error) |
| **Euler's number** | $e = 2.718281828\ldots$, the base whose exponential has slope 1 at $x = 0$: $\lim_{h\to0}\dfrac{e^h - 1}{h} = 1$. Also $e = \lim_{n\to\infty}(1 + 1/n)^n$. | [1.4](module_01_EN.html#exponential), [6.1](module_06_EN.html#base-e), [6.3](module_06_EN.html#two-routes) |
| **even function** | A function with $f(-x) = f(x)$ for every $x$ in its domain. Its graph is its own mirror image in the $y$-axis, and $\int_{-a}^{a} f = 2\int_0^a f$. | [1.4](module_01_EN.html#polynomials), [9.6](module_09_EN.html#symmetry) |
| **existence and uniqueness theorem** | If $F$ and $F_y$ are continuous on an open rectangle containing $(t_0, y_0)$, then $y' = F(t, y)$, $y(t_0) = y_0$ has a solution on some open interval containing $t_0$, and only one there. The equation $ay'' + by' + cy = 0$, $a \ne 0$, has exactly one solution with given $y(t_0)$ and $y'(t_0)$, defined for every $t$. | [13.1](module_13_EN.html#existence), [13.8](module_13_EN.html#second-order) |
| **expected value** | The expected value, or mean, of a random variable $X$ with density $f$ is $\mu = E(X) = \int_{-\infty}^{\infty} x\,f(x)\,dx$, when the integral converges. | [12.9](module_12_EN.html#expected-value) |
| **exponential distribution** | The density $f(x) = \lambda e^{-\lambda x}$ for $x \ge 0$ and 0 for $x < 0$, with rate $\lambda > 0$: a model for the waiting time for events that happen at random, at a steady average rate $\lambda$. Its mean is $1/\lambda$, and it has no memory: $P(X > s + t \mid X > s) = P(X > t)$. | [12.9](module_12_EN.html#exponential-distribution) |
| **exponential function** | A function $a^x$ with a fixed base $a > 0$. For $a \ne 1$ its domain is $\R$ and its range $(0, \infty)$; *the* exponential function is $e^x$. | [1.4](module_01_EN.html#exponential) |
| **exponential growth and decay** | The solutions of $y' = ky$, for a constant $k$: exactly the functions $y = Ce^{kt}$, with $C = y(0)$. For $k > 0$ they grow, for $k < 0$ they decay. Module 6 checks that they are solutions; Module 13 proves that there are no others. | [6.8](module_06_EN.html#growth-decay), [13.5](module_13_EN.html#growth-decay) |
| **extreme value** | A maximum or minimum value, absolute or local; also called an extremum (plural extrema). | [3.5](module_03_EN.html#evt), [8.1](module_08_EN.html#extrema), [18.1](module_18_EN.html#critical-points) |
| **Extreme Value Theorem** | A function continuous on a closed interval $[a, b]$ has a maximum value and a minimum value there. In two variables: a function continuous on a closed, bounded set has an absolute maximum and an absolute minimum on it. | [3.5](module_03_EN.html#evt), [18.3](module_18_EN.html#absolute-extrema) |
| **extremum** | A maximum or minimum value, absolute or local; plural extrema. The same as an extreme value. | [8.1](module_08_EN.html#extrema), [18.1](module_18_EN.html#critical-points) |

<div class="section-anchor" id=g-f></div>

### F

| Term | Meaning | Section |
|---|---|---|
| **factorial** | $n! = 1 \cdot 2 \cdot 3 \cdots n$, the number of ways to put $n$ objects in a row; $0! = 1$. | [3.8](module_03_EN.html#growth) |
| **Fermat's principle** | Light takes the path of least time. It implies Snell's law of refraction. | [8.6](module_08_EN.html#optimisation) |
| **Fermat's theorem** | If $f$ has a local maximum or minimum at $c$ and $f'(c)$ exists, then $f'(c) = 0$. In two variables: if the first partial derivatives exist at a local extremum $(a, b)$, then $\nabla f(a, b) = \vb{0}$. | [8.1](module_08_EN.html#extrema), [18.1](module_18_EN.html#critical-points) |
| **finite differences** | Estimating a derivative by running a program at $a$ and at $a + h$ and computing the difference quotient. It needs nothing but the program, but a large $h$ gives a truncation error and a small one a rounding error. | [5.8](module_05_EN.html#autodiff) |
| **first derivative test** | At a critical number $c$ where $f$ is continuous: if $f'$ changes from positive to negative, $f(c)$ is a local maximum; from negative to positive, a local minimum; no change of sign, no extremum. If the signs hold on the whole of an interval $I$ around $c$, $f(c)$ is the absolute maximum or minimum on $I$. | [8.3](module_08_EN.html#first-derivative-test), [8.6](module_08_EN.html#optimisation) |
| **first-order linear equation** | A first-order differential equation that can be written in the standard form $y' + p(t)\,y = q(t)$, where $p$ and $q$ are functions of $t$ alone. | [13.7](module_13_EN.html#linear) |
| **floating point** | A computer representation that stores a finite number of significant digits and an exponent. It rounds results that the format cannot represent exactly. | [2.8](module_02_EN.html#cancellation) |
| **floating-point number** | A computer's fast approximation to a real number, stored in binary and rounded to about 16 significant decimal digits. | [1.7](module_01_EN.html#first-session), [2.8](module_02_EN.html#cancellation) |
| **floor function** | $\lfloor x\rfloor$, the largest integer less than or equal to $x$: $\lfloor 2.7\rfloor = 2$ and $\lfloor -2.7\rfloor = -3$. | [3.1](module_03_EN.html#one-sided) |
| **flow line** | A curve $\vb{r}(t)$ whose velocity is always the field at its position, $\vb{r}'(t) = \vb{F}\big(\vb{r}(t)\big)$: the path of a particle carried by the flow. Also called a streamline. | [20.1](module_20_EN.html#fields) |
| **flux** | The rate at which a field flows across a curve or surface. Across a closed curve $C$ in the plane, $\oint_C \vb{F}\cdot\vb{n}\,ds$ with $\vb{n}$ the outward unit normal; across an oriented surface $S$, $\iint_S \vb{F}\cdot d\vb{S} = \iint_S \vb{F}\cdot\vb{n}\,dS$. | [20.4](module_20_EN.html#flux-form), [20.6](module_20_EN.html#flux) |
| **force** | A vector with the direction of a push or pull and its strength, in newtons, as its length. | [16.4](module_16_EN.html#arithmetic) |
| **forward difference** | $\dfrac{f(a + h) - f(a)}{h}$, for a step $h > 0$: an estimate of $f'(a)$ with error $O(h)$. The backward difference $\dfrac{f(a) - f(a - h)}{h}$ uses $-h$ in place of $h$. | [4.7](module_04_EN.html#differences) |
| **forward mode** | Automatic differentiation that carries derivatives forwards, from the input through each step of the program to the output, as dual numbers do. | [5.8](module_05_EN.html#backprop) |
| **forward pass** | In backpropagation, the computation of every node's value from the inputs to the output, keeping the values; the backward pass then computes the adjoints from the output back to the inputs. | [17.8](module_17_EN.html#backpropagation) |
| **Fubini's theorem** | If $f$ is continuous on the rectangle $R = [a, b] \times [c, d]$, then $\iint_R f\,dA = \int_a^b\int_c^d f\,dy\,dx = \int_c^d\int_a^b f\,dx\,dy$: either order of the iterated integral gives the double integral. | [19.2](module_19_EN.html#iterated) |
| **function** | A rule $f$ that assigns to each number $x$ in a set $D$, its domain, exactly one number $f(x)$. | [1.3](module_01_EN.html#functions) |
| **function of two variables** | A rule $f$ that assigns to each ordered pair $(x, y)$ in a set $D$ of the plane, its domain, exactly one real number $f(x, y)$. A function of three variables assigns a number $f(x, y, z)$ to each point of a set in space. | [17.1](module_17_EN.html#functions) |
| **fundamental theorem for line integrals** | If $f$ is differentiable with a continuous gradient on an open region that contains a piecewise smooth curve $C$ from $A$ to $B$, then $\int_C \nabla f\cdot d\vb{r} = f(B) - f(A)$. | [20.3](module_20_EN.html#conservative) |
| **Fundamental Theorem of Calculus** | For $f$ continuous on $[a,b]$, Part 1 gives $A'(x)=f(x)$ for $A(x)=\int_a^x f(t)\,dt$ at interior points. Part 2 gives $\int_a^b f(x)\,dx=F(b)-F(a)$ if $F$ is continuous on $[a,b]$ and $F'=f$ on $(a,b)$. | [9.8](module_09_EN.html#faster-way), [10.4](module_10_EN.html#ftc1), [10.5](module_10_EN.html#ftc2) |

<div class="section-anchor" id=g-g></div>

### G

| Term | Meaning | Section |
|---|---|---|
| **Gabriel's horn** | The solid swept out when the graph of $y = 1/x$, $x \ge 1$, rotates about the $x$-axis: its volume is finite ($\pi$), but its surface area is infinite. | [12.8](module_12_EN.html#gabriel) |
| **Gaussian integral** | $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$: quoted in Module 12, proved in Module 19 with a double integral in polar coordinates. | [12.9](module_12_EN.html#normal), [19.4](module_19_EN.html#gaussian) |
| **general antiderivative** | $F(x) + C$, where $F$ is one antiderivative of $f$ on an interval and $C$ stands for any constant: on an interval, these are all the antiderivatives of $f$. | [10.1](module_10_EN.html#antiderivatives) |
| **general solution** | A formula, with arbitrary constants, that gives every solution of a differential equation; any one solution is a particular solution. | [13.1](module_13_EN.html#what) |
| **geometric sequence** | The sequence $r^n$, $n = 0, 1, 2, \dots$, for a constant $r$: it converges to 0 if $-1 < r < 1$ and to 1 if $r = 1$, diverges to infinity if $r > 1$, and has no limit if $r \le -1$. | [14.1](module_14_EN.html#laws) |
| **geometric series** | $\sum_{n=0}^{\infty} ar^n = a + ar + ar^2 + \cdots$, with first term $a \ne 0$ and ratio $r$: it converges to $\dfrac{a}{1 - r}$ if $\abs{r} < 1$ and diverges if $\abs{r} \ge 1$. | [14.3](module_14_EN.html#geometric) |
| **gradient** | The vector of partial derivatives, $\nabla f = \langle f_x, f_y\rangle$, or $\langle f_x, f_y, f_z\rangle$ in three variables. Where it is not $\vb{0}$, it points in the direction of steepest ascent, its length is the largest rate of increase, and it is perpendicular to the level curve. | [17.6](module_17_EN.html#gradient) |
| **gradient descent** | A method for minimising a differentiable function: from a starting point, repeat $x_{k+1} = x_k - \eta f'(x_k)$ in one variable, or $\vb{x}_{k+1} = \vb{x}_k - \eta\nabla f(\vb{x}_k)$ in several, with a step size $\eta > 0$. Machine learning trains models with it. | [1.1](module_01_EN.html#uses), [8.7](module_08_EN.html#gradient-descent), [17.7](module_17_EN.html#gradient-descent), [18.6](module_18_EN.html#gradient-descent) |
| **gradient field** | The vector field $\nabla f$ of a differentiable function $f$. | [20.1](module_20_EN.html#fields) |
| **graph** | The set of points $(x, f(x))$ with $x$ in the domain of $f$: the curve $y = f(x)$. For a function of two variables, the points $(x, y, f(x, y))$: a surface in space. | [1.3](module_01_EN.html#graphs), [17.1](module_17_EN.html#graphs) |
| **Green's theorem** | For a positively oriented, piecewise smooth, simple closed curve $C$ enclosing $D$, and $P$, $Q$ with continuous first partial derivatives on an open region containing $D$: $\oint_C P\,dx + Q\,dy = \iint_D (Q_x - P_y)\,dA$. Its flux form is $\oint_C \vb{F}\cdot\vb{n}\,ds = \iint_D (P_x + Q_y)\,dA$. | [20.4](module_20_EN.html#green), [20.4](module_20_EN.html#flux-form) |
| **grid curve** | A curve on a parametric surface along which one of $u$ and $v$ is fixed; its tangent vector is $\vb{r}_u$ or $\vb{r}_v$. | [20.6](module_20_EN.html#parametric-surfaces) |
| **grows more slowly** | For functions positive for all large $x$, $f$ grows more slowly than $g$, written $f \ll g$, if $\lim_{x\to\infty} f(x)/g(x) = 0$. For every $p > 0$ and $a > 1$, $\ln x \ll x^p \ll a^x$, and $a^n \ll n! \ll n^n$. | [3.8](module_03_EN.html#growth), [7.7](module_07_EN.html#growth) |

<div class="section-anchor" id=g-h></div>

### H

| Term | Meaning | Section |
|---|---|---|
| **half-angle identities** | $\sin^2 x = \tfrac12(1 - \cos 2x)$ and $\cos^2 x = \tfrac12(1 + \cos 2x)$. | [11.2](module_11_EN.html#trig-integrals) |
| **half-life** | The time $T_{1/2} = \dfrac{\ln 2}{\abs{k}}$ in which $y = Ce^{kt}$, with $k < 0$, halves. | [6.8](module_06_EN.html#doubling) |
| **harmonic number** | $H_N = 1 + \tfrac12 + \dots + \tfrac1N$, the $N$th partial sum of the harmonic series. | [14.5](module_14_EN.html#slow) |
| **harmonic series** | $\sum_{n=1}^{\infty} \dfrac1n = 1 + \tfrac12 + \tfrac13 + \cdots$. It diverges, though its terms tend to 0: its partial sums grow like $\ln N$. | [14.4](module_14_EN.html#harmonic-series) |
| **helix** | The space curve $\vb{r}(t) = \langle \cos t, \sin t, t\rangle$, which winds round the cylinder $x^2 + y^2 = 1$, climbing $2\pi$ in each turn: the shape of a spring. | [16.8](module_16_EN.html#motion) |
| **Hessian matrix** | The square array of the second partial derivatives of $f$ at a point, with $f_{xx}$, $f_{xy}$ in its first row and $f_{yx}$, $f_{yy}$ in its second; when $f_{xy} = f_{yx}$, its determinant is $D = f_{xx}f_{yy} - f_{xy}^2$. | [18.2](module_18_EN.html#second-derivative-test) |
| **higher derivatives** | The second derivative $f'' = (f')'$, the third derivative $f''' = (f'')'$, and in general the $n$th derivative $f^{(n)}$, the derivative of $f^{(n-1)}$, wherever these exist. In Leibniz's notation, $f''(x) = \dfrac{d^2y}{dx^2}$. | [4.6](module_04_EN.html#higher-derivatives) |
| **Hooke's law** | A spring stretched $x$ metres beyond its natural length pulls back with a force proportional to $x$: $F(x) = kx$, where the spring constant $k > 0$ is measured in N/m. | [12.6](module_12_EN.html#work), [13.8](module_13_EN.html#second-order) |
| **horizontal asymptote** | The line $y = L$ is a horizontal asymptote of the graph of $f$ if $\lim_{x\to\infty} f(x) = L$ or $\lim_{x\to-\infty} f(x) = L$. | [3.7](module_03_EN.html#limits-at-infinity) |
| **horizontal line test** | A function is one-to-one exactly when no horizontal line meets its graph more than once. | [1.5](module_01_EN.html#inverse) |
| **Horner's rule** | Evaluating a polynomial from the inside out, $c_0 + u\big(c_1 + u(c_2 + \cdots)\big)$: one multiplication and one addition per coefficient. | [15.6](module_15_EN.html#libraries) |
| **hyperbola** | The curve $x^2 - y^2 = 1$; the point $(\cosh t, \sinh t)$ moves along its right-hand branch, as $(\cos t, \sin t)$ moves round the unit circle. | [6.7](module_06_EN.html#hyperbolic) |
| **hyperbolic cosine** | $\cosh x=(e^x+e^{-x})/2$ for any real $x$. | [6.7](module_06_EN.html#hyperbolic) |
| **hyperbolic functions** | $\sinh x = \dfrac{e^x - e^{-x}}{2}$, $\cosh x = \dfrac{e^x + e^{-x}}{2}$ and $\tanh x = \dfrac{\sinh x}{\cosh x}$, for every real $x$: the hyperbolic sine, cosine and tangent. $\cosh^2 x - \sinh^2 x = 1$. | [6.7](module_06_EN.html#hyperbolic) |
| **hyperbolic sine** | $\sinh x=(e^x-e^{-x})/2$ for any real $x$. | [6.7](module_06_EN.html#hyperbolic) |
| **hyperbolic tangent** | $\tanh x=\sinh x/\cosh x$ for any real $x$. | [6.7](module_06_EN.html#hyperbolic) |

<div class="section-anchor" id=g-i></div>

### I

| Term | Meaning | Section |
|---|---|---|
| **ill-conditioned** | A function whose level curves near its minimum are long, thin ellipses (a large condition number): gradient descent zigzags and converges slowly on it. | [18.6](module_18_EN.html#ill-conditioning) |
| **imaginary unit** | The number $i$ with $i^2 = -1$. | [15.7](module_15_EN.html#complex) |
| **implicit differentiation** | Differentiating both sides of an equation in $x$ and $y$, such as $x^2 + y^2 = 25$, with respect to $x$, treating $y$ as a function of $x$ by the chain rule, then solving for $\dfrac{dy}{dx}$. | [6.4](module_06_EN.html#implicit) |
| **implicit function theorem** | If $F$ has continuous partial derivatives near $(a, b)$, $F(a, b) = 0$ and $F_y(a, b) \ne 0$, then near $(a, b)$ the curve $F(x, y) = 0$ is the graph of a differentiable function $y(x)$, with $\dfrac{dy}{dx} = -\dfrac{F_x}{F_y}$. | [17.5](module_17_EN.html#implicit) |
| **improper integral** | An integral over an infinite interval, or of a function unbounded near a point of the interval, defined as a limit of ordinary integrals: $\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx$, and so on. It converges if the limit exists as a finite number, and diverges otherwise. | [12.8](module_12_EN.html#improper), [12.8](module_12_EN.html#infinite-intervals), [12.8](module_12_EN.html#unbounded) |
| **increasing** | (1) A function $f$ is increasing on an interval if $x_1 < x_2$ in it always gives $f(x_1) < f(x_2)$; some books call this strictly increasing. (2) A sequence $(a_n)$ is increasing if $a_n \le a_{n+1}$ for every $n$, so equal neighbours are allowed. | [4.3](module_04_EN.html#graph-of-derivative), [8.3](module_08_EN.html#monotonic), [14.2](module_14_EN.html#monotone) |
| **increasing/decreasing test** | Let $f$ be continuous on an interval $I$ and differentiable at its points that are not endpoints. If $f' > 0$ at all of them, $f$ is increasing on $I$; if $f' < 0$, decreasing. | [8.3](module_08_EN.html#monotonic) |
| **indefinite integral** | $\int f(x)\,dx$, the general antiderivative of $f$ on an interval: $\int f(x)\,dx = F(x) + C$ means that $F'(x) = f(x)$ on the interval. A definite integral is a number; an indefinite integral is a family of functions. | [10.6](module_10_EN.html#indefinite) |
| **independent of the path** | A line integral is independent of the path if it depends only on the two ends of the curve, as for every continuous conservative field. | [20.3](module_20_EN.html#conservative) |
| **independent random variables** | Random variables $X$ and $Y$, with densities $f_1$ and $f_2$, whose joint density is the product $f_1(x)\,f_2(y)$. | [19.5](module_19_EN.html#joint-densities) |
| **independent variable** | The input of a function: $x$ in $y = f(x)$, or $x$ and $y$ in $z = f(x, y)$. | [1.3](module_01_EN.html#functions), [17.1](module_17_EN.html#functions) |
| **indeterminate form** | A form whose limit the form alone does not decide: $0/0$, $\infty/\infty$, $0\cdot\infty$, $\infty - \infty$, $1^\infty$, $0^0$ and $\infty^0$. L'Hôpital's rule handles the first two, and the others are turned into them. | [2.5](module_02_EN.html#zero-over-zero), [7.5](module_07_EN.html#lhopital), [7.6](module_07_EN.html#other-forms) |
| **index of summation** | The letter $i$ in $\sum_{i=m}^{n} a_i$. It is a dummy variable: $\sum_{i=1}^{5} i^2$ and $\sum_{k=1}^{5} k^2$ are the same number. The index of a sequence is the $n$ of its term $a_n$. | [9.2](module_09_EN.html#sigma), [14.1](module_14_EN.html#sequences) |
| **inductive step** | The second step of a proof by induction: whenever the statement holds for $k$, it also holds for $k + 1$. | [Ex. 5.10](module_05_EN.html#ex-5-10), [9.2](module_09_EN.html#power-sums) |
| **infinite discontinuity** | A discontinuity at $a$ where, from at least one side, $f(x)$ becomes and stays larger than any number you name, or smaller than any: an infinite one-sided limit. | [3.1](module_03_EN.html#kinds) |
| **infinite limit** | $\lim_{x\to a} f(x) = \infty$ means that for every number $M$, $f(x) > M$ for every $x \ne a$ close enough to $a$; $-\infty$ likewise. Such a limit does not exist as a number: $\infty$ describes how it fails. | [2.3](module_02_EN.html#no-limit), [3.6](module_03_EN.html#infinite-limits) |
| **inflection point** | A point $(c, f(c))$ of the graph where $f$ is continuous and the graph changes concavity, from up to down or from down to up. If $f''(c)$ exists there, it is 0, but $f''(c) = 0$ is not enough. | [8.4](module_08_EN.html#concavity) |
| **initial condition** | A value that the solution of a differential equation must take at a given point, such as $y(t_0) = y_0$; a second-order equation also needs $y'(t_0) = v_0$. | [10.2](module_10_EN.html#initial-value), [13.1](module_13_EN.html#what) |
| **initial value problem** | A differential equation together with initial conditions, such as $F'(x) = f(x)$ on an interval with $F(x_0) = y_0$. For a second-order equation the conditions give $y(t_0)$ and $y'(t_0)$. | [10.2](module_10_EN.html#initial-value), [13.1](module_13_EN.html#what) |
| **inner function** | In a composition $f\big(g(x)\big)$, the function $g$ applied first; $f$ is the outer function. | [1.5](module_01_EN.html#composition) |
| **instantaneous rate of change** | The derivative $f'(a)$, measured in units of $f$ per unit of $x$: the limit of average rates of change over shorter and shorter intervals. | [4.2](module_04_EN.html#derivative) |
| **instantaneous speed** | The speed at one instant: the number that average speeds over shorter and shorter time intervals approach. Module 4 defines it as the absolute value of the instantaneous velocity. | [1.6](module_01_EN.html#shrinking), [4.1](module_04_EN.html#tangents) |
| **integrable** | $f$ is integrable on $[a, b]$ if its definite integral there exists. Every continuous function is integrable, and so is every bounded function with only finitely many discontinuities. Module 19 defines integrability on a rectangle. | [9.4](module_09_EN.html#definite-integral), [19.1](module_19_EN.html#double-integrals) |
| **integral** | The area under a curve, found as the limit of sums of thin rectangles; made precise as the definite integral. The indefinite integral is the general antiderivative. | [1.1](module_01_EN.html#two-problems), [9.4](module_09_EN.html#definite-integral), [10.6](module_10_EN.html#indefinite) |
| **integral test** | If $f$ is continuous, positive and decreasing on $[1, \infty)$ and $a_n = f(n)$, then $\sum a_n$ and $\int_1^\infty f(x)\,dx$ both converge or both diverge. The same holds from any starting index $k$. | [14.5](module_14_EN.html#integral-test) |
| **integrand** | The function $f(x)$ in $\int_a^b f(x)\,dx$. | [9.4](module_09_EN.html#definite-integral) |
| **integrating factor** | For $y' + p(t)y = q(t)$, the function $\mu = e^{P}$, where $P$ is an antiderivative of $p$: multiplying by it makes the left side $(\mu y)'$, so $y = \dfrac{1}{\mu}\Big(\int \mu q\,dt + C\Big)$. | [13.7](module_13_EN.html#linear) |
| **integration** | Finding an integral: to integrate $f$ is to find its definite integral or its indefinite integral. | [1.1](module_01_EN.html#about), [10.6](module_10_EN.html#indefinite) |
| **integration by parts** | $\int u\,dv = uv - \int v\,du$, that is, $\int f(x)\,g'(x)\,dx = f(x)\,g(x) - \int f'(x)\,g(x)\,dx$, when $f$ and $g$ have continuous derivatives: the product rule in reverse. For definite integrals, $\int_a^b fg' = \big[fg\big]_a^b - \int_a^b f'g$. | [11.1](module_11_EN.html#parts), [11.1](module_11_EN.html#definite-parts) |
| **intercept** | The height $b$ at which the line $y = mx + b$ crosses the $y$-axis. | [1.4](module_01_EN.html#linear) |
| **interior point** | A point $P$ of a set $R$ such that some open disc centred at $P$ lies in $R$. | [18.3](module_18_EN.html#absolute-extrema) |
| **Intermediate Value Theorem** | If $f$ is continuous on $[a, b]$ and $N$ is any number strictly between $f(a)$ and $f(b)$, then $f(c) = N$ for at least one $c$ in $(a, b)$. | [3.3](module_03_EN.html#ivt) |
| **interval** | A set of real numbers such as $[a, b]$, $(a, b)$, $[a, b)$ or $[a, \infty)$: all the numbers between two ends, or beyond one end. A square bracket means that the endpoint belongs to the interval, a round one that it does not. | [1.3](module_01_EN.html#intervals) |
| **interval of convergence** | The set of all $x$ at which a power series converges: the interval from $a - R$ to $a + R$, with each endpoint included or not, which must be tested separately. | [15.1](module_15_EN.html#convergence) |
| **inverse function** | For a one-to-one $f$ with domain $D$ and range $R$, the function $f^{-1}$ with domain $R$ and range $D$ such that $f^{-1}(y) = x$ exactly when $f(x) = y$. Its graph is the reflection of the graph of $f$ in the line $y = x$. | [1.5](module_01_EN.html#inverse), [6.2](module_06_EN.html#inverse-functions) |
| **inverse hyperbolic sine** | The inverse of $\sinh$, which is strictly increasing on $\R$: $\operatorname{arsinh} x = \ln\big(x + \sqrt{x^2 + 1}\big)$. | [Ex. 6.10](module_06_EN.html#ex-6-10) |
| **inverse square field** | A field such as gravity, $\vb{F} = -\dfrac{GMm}{\norm{\vb{r}}^3}\,\vb{r}$, that points towards the origin with length proportional to $1/\norm{\vb{r}}^2$: twice as far away, a quarter of the pull. | [20.1](module_20_EN.html#fields) |
| **inverse trigonometric functions** | $\arcsin x$ is the $y$ in $[-\pi/2, \pi/2]$ with $\sin y = x$, for $-1 \le x \le 1$; $\arccos x$ the $y$ in $[0, \pi]$ with $\cos y = x$, for $-1 \le x \le 1$; and $\arctan x$ the $y$ in $(-\pi/2, \pi/2)$ with $\tan y = x$, for every real $x$. | [6.5](module_06_EN.html#inverse-trig) |
| **irreducible quadratic** | A quadratic $x^2 + px + q$ with $p^2 < 4q$ (a negative discriminant): it has no real zeros, so it has no real linear factors. | [11.4](module_11_EN.html#repeated-factors) |
| **isocline** | A curve along which the slope $F(t, y)$ of a direction field is constant. | [13.3](module_13_EN.html#direction-fields) |
| **iterate** | One of the numbers $x_0, x_1, x_2, \dots$ that a repeated method, such as Newton's method, produces. | [7.4](module_07_EN.html#newton) |
| **iterated integral** | An integral of an integral, such as $\int_a^b\int_c^d f(x, y)\,dy\,dx$, computed from the inside out: the inner integral treats the outer variable as a constant (partial integration). | [19.2](module_19_EN.html#iterated) |

<div class="section-anchor" id=g-j></div>

### J

| Term | Meaning | Section |
|---|---|---|
| **Jacobian** | For $x = x(u, v)$, $y = y(u, v)$ with continuous first partial derivatives, the determinant $\dfrac{\partial(x, y)}{\partial(u, v)} = x_uy_v - x_vy_u$: the factor by which the transformation multiplies small areas. | [19.8](module_19_EN.html#change-of-variables) |
| **jerk** | The rate of change of acceleration, $j(t) = a'(t) = s'''(t)$: what you feel as a jolt when a lift starts or stops abruptly. | [4.6](module_04_EN.html#motion) |
| **joint density** | A function $f(x, y) \ge 0$ whose integral over the whole plane is 1. A pair of random variables $(X, Y)$ has joint density $f$ if $P\big((X, Y) \in D\big) = \iint_D f\,dA$ for every region $D$. | [19.5](module_19_EN.html#joint-densities) |
| **joule** | The unit of work and energy: a force of 1 newton acting through 1 metre does 1 joule (J) of work. | [12.6](module_12_EN.html#work), [16.5](module_16_EN.html#work) |
| **jump discontinuity** | A discontinuity at which both one-sided limits exist but are different. | [3.1](module_03_EN.html#kinds) |

<div class="section-anchor" id=g-l></div>

### L

| Term | Meaning | Section |
|---|---|---|
| **Lagrange form (of the remainder)** | $R_n(x) = \dfrac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}$, for some $c$ between $a$ and $x$: the remainder in Taylor's theorem. | [15.5](module_15_EN.html#taylor-theorem) |
| **Lagrange multipliers** | If $f$, restricted to the curve $g(x, y) = c$, has a local extremum at a point where $\nabla g \ne \vb{0}$ (with continuous first partial derivatives), then $\nabla f = \lambda\nabla g$ there for some number $\lambda$, the Lagrange multiplier. With two constraints $g = c$ and $h = d$, $\nabla f = \lambda\nabla g + \mu\nabla h$. | [18.4](module_18_EN.html#lagrange), [18.4](module_18_EN.html#two-constraints) |
| **Lagrange's identity** | $\norm{\vb{a}\times\vb{b}}^2 = \norm{\vb{a}}^2\norm{\vb{b}}^2 - (\vb{a}\cdot\vb{b})^2$. | [16.6](module_16_EN.html#cross) |
| **lamina** | A thin flat plate. | [12.7](module_12_EN.html#centre-of-mass), [19.5](module_19_EN.html#mass) |
| **law of cosines** | In a triangle with sides $p$, $q$ and $s$, where $\gamma$ is the angle between $p$ and $q$: $s^2 = p^2 + q^2 - 2pq\cos\gamma$. | [16.5](module_16_EN.html#dot) |
| **laws of logarithms** | For $x > 0$, $y > 0$ and every real $r$: $\ln(xy) = \ln x + \ln y$, $\ln(x/y) = \ln x - \ln y$ and $\ln(x^r) = r\ln x$; the same for $\log_a$. | [1.4](module_01_EN.html#logarithms) |
| **learning rate** | Machine learning's name for the step size $\eta$ of gradient descent. On the bowl $\tfrac12(ax^2 + cy^2)$ with $0 < a \le c$, gradient descent converges exactly when $\eta < 2/c$. | [8.7](module_08_EN.html#gradient-descent), [18.6](module_18_EN.html#gradient-descent) |
| **least squares** | Fitting a line $y = mx + b$ to data points $(x_i, y_i)$ by minimising the sum of squared errors $E(m, b) = \sum (y_i - mx_i - b)^2$. The minimising line is the least-squares line, or regression line; it solves the normal equations and passes through the mean point $(\bar x, \bar y)$. | [18.5](module_18_EN.html#least-squares) |
| **least upper bound property** | Every non-empty set of real numbers that is bounded above has a least upper bound: an upper bound that is at most every other upper bound. Analysis states the completeness of the real numbers in this form. | [14.2](module_14_EN.html#mct) |
| **left-hand limit** | $\lim_{x\to a^-} f(x) = L$: $f(x)$ can be made as close to $L$ as you like by taking $x < a$ close enough to $a$; $f$ must be defined on an interval $(c, a)$. Also called the limit from the left. | [2.2](module_02_EN.html#one-sided) |
| **left sum** | With $n$ equal subintervals of width $\Delta x = (b - a)/n$ and cut points $x_i = a + i\,\Delta x$: the left sum is $L_n = \sum_{i=1}^{n} f(x_{i-1})\,\Delta x$, the right sum $R_n = \sum_{i=1}^{n} f(x_i)\,\Delta x$. | [9.3](module_09_EN.html#riemann-sums) |
| **Leibniz's notation** | Writing the derivative of $y = f(x)$ as $\dfrac{dy}{dx}$, which shows which variable changes and recalls the quotient $\dfrac{\Delta y}{\Delta x}$ whose limit it is. It is not a fraction, but often behaves like one. | [4.3](module_04_EN.html#notation) |
| **length (of a vector)** | $\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2 + a_3^2}$, also called its magnitude or norm. | [16.4](module_16_EN.html#components) |
| **level curve** | A curve $f(x, y) = k$, for a constant $k$ in the range of $f$. A drawing of level curves for equally spaced values of $k$, labelled with the values, is a contour map of $f$. | [17.1](module_17_EN.html#level-curves) |
| **level set** | The set of inputs where a function has a given value. Depending on the function and value it may be a curve, a surface, a point or another set. | [17.1](module_17_EN.html#level-curves) |
| **level surface** | A surface $f(x, y, z) = k$ of a function of three variables, for a constant $k$. | [17.1](module_17_EN.html#level-surfaces) |
| **L'Hôpital's rule** | If $f$ and $g$ are differentiable near $a$, with $g'(x) \ne 0$ there, and $f/g$ has the form $0/0$ or $\infty/\infty$ at $a$, then $\lim\dfrac{f(x)}{g(x)} = \lim\dfrac{f'(x)}{g'(x)}$ whenever the second limit exists or is $\pm\infty$. It holds for one-sided limits and as $x \to \pm\infty$; Module 8 proves it. | [7.5](module_07_EN.html#the-rule), [8.2](module_08_EN.html#consequences) |
| **LIATE** | A rough guide to the choice of $u$ in integration by parts: take as $u$ the factor that comes first in the list Logarithmic, Inverse trigonometric, Algebraic, Trigonometric, Exponential. | [11.1](module_11_EN.html#choosing) |
| **limit** | $\lim_{x\to a} f(x) = L$ if $f(x)$ can be made as close to $L$ as you like by taking $x$ close enough to $a$, but not equal to $a$; $f$ must be defined on an open interval around $a$, except possibly at $a$. Section 2.7 makes this precise with $\varepsilon$ and $\delta$; Section 17.2 extends it to two variables. | [1.1](module_01_EN.html#two-problems), [2.1](module_02_EN.html#idea), [2.7](module_02_EN.html#precise), [17.2](module_17_EN.html#limits) |
| **limit at infinity** | $\lim_{x\to\infty} f(x) = L$ means that $f(x)$ can be made as close to $L$ as you like by taking $x$ large enough; $f$ must be defined on an interval $(c, \infty)$. For $x \to -\infty$, $x$ is negative and large in size. | [3.7](module_03_EN.html#limits-at-infinity) |
| **limit comparison test** | If $f$ and $g$ are continuous and positive with $f(x)/g(x) \to L$ as $x \to \infty$, where $0 < L < \infty$, then $\int_a^\infty f$ and $\int_a^\infty g$ both converge or both diverge. For series with $a_n > 0$, $b_n > 0$ and $a_n/b_n \to L$, $0 < L < \infty$: $\sum a_n$ and $\sum b_n$ both converge or both diverge. | [12.8](module_12_EN.html#comparison), [14.6](module_14_EN.html#limit-comparison) |
| **limit in two variables** | For $f$ defined on a disc around $(a, b)$, except perhaps at $(a, b)$: $\lim_{(x, y)\to(a, b)} f(x, y) = L$ if for every $\varepsilon > 0$ there is a $\delta > 0$ with $\abs{f(x, y) - L} < \varepsilon$ for every $(x, y)$ at distance between 0 and $\delta$ from $(a, b)$. If $f$ approaches different numbers along two paths, the limit does not exist. | [17.2](module_17_EN.html#limits) |
| **limit laws** | If $\lim f = L$ and $\lim g = M$, the limits of $f + g$, $f - g$, $cf$, $fg$, $f/g$ (when $M \ne 0$), $f^n$ and $\sqrt[n]{f}$ are $L + M$, $L - M$, $cL$, $LM$, $L/M$, $L^n$ and $\sqrt[n]{L}$ (for even $n$, if $L > 0$). Sequences obey the same laws. | [2.4](module_02_EN.html#laws), [14.1](module_14_EN.html#laws) |
| **limit of a sequence** | $\lim_{n\to\infty} a_n = L$ means: for every $\varepsilon > 0$ there is a number $N$ such that $\abs{a_n - L} < \varepsilon$ for every $n > N$. Then the sequence converges to $L$, written $a_n \to L$; otherwise it diverges. | [14.1](module_14_EN.html#limit) |
| **limits of integration** | The numbers $a$ (lower) and $b$ (upper) in $\int_a^b f(x)\,dx$: the ends of the interval, not limits in the sense of Module 2. Reversing them changes the sign of the integral, and $\int_c^c f(x)\,dx = 0$. | [9.4](module_09_EN.html#definite-integral) |
| **line integral** | Of a function $f$ along a smooth curve $C$ traced by $\vb{r}(t)$, $a \le t \le b$: $\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\norm{\vb{r}'(t)}\,dt$. Of a vector field: $\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt$, the work done by a force $\vb{F}$; it changes sign when $C$ is traced the other way. | [20.2](module_20_EN.html#line-integrals), [20.2](module_20_EN.html#work) |
| **linear approximation** | Using $f(x) \approx L(x)$, the linearisation at $a$, for $x$ near $a$; also called the tangent line approximation. Its error is small even compared with $x - a$. | [7.2](module_07_EN.html#linear-approximation), [17.4](module_17_EN.html#tangent-planes) |
| **linear function** | A function $f(x) = mx + b$ with constants $m$ and $b$. Its graph is a straight line with slope $m$ and intercept $b$. | [1.4](module_01_EN.html#linear) |
| **linear homogeneous equation with constant coefficients** | A second-order equation $ay'' + by' + cy = 0$ with constants $a \ne 0$, $b$ and $c$. "Homogeneous" because the right side is 0. | [13.8](module_13_EN.html#second-order) |
| **linearisation** | The linearisation of $f$ at $a$ is $L(x) = f(a) + f'(a)(x - a)$, whose graph is the tangent line at $(a, f(a))$; $f$ must be differentiable at $a$. In two variables, $L(x, y) = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$. | [7.2](module_07_EN.html#linear-approximation), [17.4](module_17_EN.html#tangent-planes) |
| **linearity** | The constant multiple and sum rules together: differentiation is linear, $(cf + g)' = cf' + g'$. Integration is linear too: $\int_a^b \big(cf(x) + g(x)\big)\,dx = c\int_a^b f(x)\,dx + \int_a^b g(x)\,dx$. | [4.5](module_04_EN.html#sum-rule), [9.5](module_09_EN.html#properties) |
| **Liouville's theorem** | A theorem (quoted, not proved, in this series) that describes what an elementary antiderivative must look like. From it, $e^{-x^2}$, $\dfrac{\sin x}{x}$ and $\dfrac{1}{\ln x}$ have no elementary antiderivative. | [11.6](module_11_EN.html#nonelementary) |
| **Lissajous curve** | A curve traced when $x$ and $y$ oscillate at different rates, such as $x = \sin 2t$, $y = \sin 3t$. It appears on an oscilloscope driven by two sine waves, and the ratio of their frequencies can be read off it. | [16.1](module_16_EN.html#cycloid) |
| **local derivative** | On an arrow of a computational graph, the partial derivative of the child with respect to the node the arrow comes from. | [17.8](module_17_EN.html#backpropagation) |
| **local maximum** | $f(c)$ is a local maximum value of $f$ if $f(c) \ge f(x)$ for every $x$ in some open interval that contains $c$ and lies in the domain; a local minimum value has $f(c) \le f(x)$. In this series an endpoint of the domain is never a local extremum. In two variables, an open disc replaces the interval. | [8.1](module_08_EN.html#extrema), [18.1](module_18_EN.html#critical-points) |
| **logarithm** | For $a > 0$ with $a \ne 1$ and $x > 0$, $\log_a x$ is the number $y$ with $a^y = x$: $\log_a$ is the inverse of $a^x$. | [1.4](module_01_EN.html#logarithms) |
| **logarithmic differentiation** | Differentiating a function $y$ built from products, quotients and powers by taking $\ln\abs{y}$, expanding with the laws of logarithms, differentiating ($y'/y$ on the left) and multiplying by $y$. It works where $y \ne 0$. | [6.6](module_06_EN.html#real-powers) |
| **logarithmic integral** | $\operatorname{Li} x = \displaystyle\int_2^x \frac{dt}{\ln t}$, for $x > 1$. | [11.6](module_11_EN.html#nonelementary) |
| **logistic equation** | $y' = ry\Big(1 - \dfrac{y}{K}\Big)$, with constants $r > 0$ and $K > 0$: growth that is nearly exponential while $y$ is small and slows to 0 as $y$ approaches the carrying capacity $K$. Its solutions, $y = \dfrac{K}{1 + \frac{K - y_0}{y_0}e^{-rt}}$, trace S-shaped logistic curves. | [13.6](module_13_EN.html#logistic) |
| **loss** | In machine learning, a measure of a model's error on its training data, as a function of the model's parameters; training minimises it by gradient descent. | [8.7](module_08_EN.html#gradient-descent), [17.7](module_17_EN.html#gradient-descent) |
| **low-pass filter** | A circuit, such as a resistor and a capacitor in series, that follows slow changes of its input and smooths out fast ones. | [13.7](module_13_EN.html#linear) |

<div class="section-anchor" id=g-m></div>

### M

| Term | Meaning | Section |
|---|---|---|
| **machine epsilon** | The gap between 1 and the next larger floating-point number: $2^{-52} \approx 2.2 \times 10^{-16}$. | [4.7](module_04_EN.html#rounding) |
| **Machin's formula** | $\dfrac{\pi}{4} = 4\arctan\dfrac15 - \arctan\dfrac{1}{239}$: with the series of $\arctan$ at these small numbers, it computes $\pi$ fast. | [15.6](module_15_EN.html#constants) |
| **Maclaurin series** | A Taylor series about $a = 0$; its partial sums are the Maclaurin polynomials. | [15.4](module_15_EN.html#taylor-series) |
| **marginal cost** | The derivative $C'(q)$ of a cost function, about the cost $C(q + 1) - C(q)$ of one more unit. The average cost is $C(q)/q$, the cost per unit. | [8.6](module_08_EN.html#optimisation) |
| **mathematical induction** | A way to prove a statement $P(n)$ for every whole number $n \ge 1$: prove the base case $P(1)$, and the inductive step, that $P(k)$ implies $P(k + 1)$ for every $k \ge 1$. Then $P(1)$, $P(2)$, $P(3)$, … follow like falling dominoes. | [Ex. 5.10](module_05_EN.html#ex-5-10), [9.2](module_09_EN.html#power-sums), [14.2](module_14_EN.html#recursive) |
| **matplotlib** | A free Python package for plotting graphs. | [1.7](module_01_EN.html#python) |
| **matrix** | A rectangular array of numbers. | [18.2](module_18_EN.html#second-derivative-test) |
| **maximum power transfer theorem** | A source delivers the most power to a load whose resistance matches its own. | [Ex. 8.7](module_08_EN.html#ex-8-7) |
| **maximum value** | $f(c)$ is the maximum value of $f$ on a set $I$ if $c$ is in $I$ and $f(x) \le f(c)$ for every $x$ in $I$; the minimum value $f(d)$ has $f(x) \ge f(d)$ instead. | [3.5](module_03_EN.html#evt), [8.1](module_08_EN.html#extrema) |
| **mean squared error** | The average of the squares of a model's errors on its data points: a common loss in machine learning. | [Ex. 8.9](module_08_EN.html#ex-8-9) |
| **Mean Value Theorem** | If $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then $f'(c) = \dfrac{f(b) - f(a)}{b - a}$ for some $c$ in $(a, b)$: somewhere the instantaneous rate of change equals the average one. | [8.2](module_08_EN.html#mvt) |
| **Mean Value Theorem for integrals** | If $f$ is continuous on $[a, b]$, where $a < b$, then $f(c) = \dfrac{1}{b - a}\int_a^b f(x)\,dx$ for some $c$ in $[a, b]$: $f$ takes its average value. | [9.7](module_09_EN.html#average) |
| **midpoint rule** | The midpoint sum $M_n = \sum_{i=1}^{n} f(\bar x_i)\,\Delta x$, with $n$ equal subintervals and $\bar x_i$ the midpoint of the $i$th, used to approximate an integral. If $f''$ is continuous and $\abs{f''} \le K$ on $[a, b]$, its error is at most $\dfrac{K(b - a)^3}{24n^2}$. | [9.3](module_09_EN.html#riemann-sums), [11.7](module_11_EN.html#numerical) |
| **minimax polynomial** | A polynomial whose coefficients are tuned to spread the error evenly over an interval, so that a lower degree than a Taylor polynomial's reaches full precision. Mathematics libraries use them. | [15.6](module_15_EN.html#libraries) |
| **minimum value** | $f(d)$ is the minimum value of $f$ on a set $I$ if $d$ is in $I$ and $f(x) \ge f(d)$ for every $x$ in $I$. | [3.5](module_03_EN.html#evt), [8.1](module_08_EN.html#extrema) |
| **model** | A simplified description of a real situation in mathematical terms, often a differential equation, good when its assumptions hold. Writing it down is modelling. | [13.2](module_13_EN.html#models) |
| **modulus** | $\abs{z} = \sqrt{p^2 + q^2}$ for $z = p + qi$: the distance from $z$ to 0 in the complex plane. | [15.7](module_15_EN.html#complex) |
| **moment** | The moment of masses $m_i$ at $x_i$ about the origin is $\sum m_ix_i$. A plate with density $\rho$ has moments $M_y = \iint_D x\rho\,dA$ about the $y$-axis and $M_x = \iint_D y\rho\,dA$ about the $x$-axis. | [12.7](module_12_EN.html#centre-of-mass), [19.5](module_19_EN.html#mass) |
| **moments of inertia** | For a lamina with density $\rho$: $I_x = \iint_D y^2\rho\,dA$ about the $x$-axis, $I_y = \iint_D x^2\rho\,dA$ about the $y$-axis, and $I_0 = I_x + I_y$ about the origin. | [19.5](module_19_EN.html#inertia) |
| **monotone** | A sequence is monotone if it is increasing ($a_n \le a_{n+1}$ for every $n$) or decreasing ($a_n \ge a_{n+1}$ for every $n$). | [14.2](module_14_EN.html#monotone) |
| **Monotone Convergence Theorem** | An increasing sequence that is bounded above converges, and its limit is at least every term and at most every upper bound; likewise a decreasing sequence that is bounded below. It is a form of the completeness of the real numbers. | [14.2](module_14_EN.html#mct) |
| **Monte Carlo method** | Estimating an integral or a probability from many random trials. Its error shrinks only like $1/\sqrt{N}$, but it works in many dimensions, where grids need too many points. | [19.5](module_19_EN.html#joint-densities) |

<div class="section-anchor" id=g-n></div>

### N

| Term | Meaning | Section |
|---|---|---|
| **natural logarithm** | $\ln x$, the logarithm to base $e$: for $x > 0$, $\ln x = y$ means $e^y = x$. In Python, `math.log` and SymPy's `log` are $\ln$. | [1.4](module_01_EN.html#logarithms), [6.1](module_06_EN.html#base-e) |
| **net area** | The area above the $x$-axis minus the area below it, between the graph of $f$ and the axis: what $\int_a^b f(x)\,dx$ measures. Also called signed area. | [9.4](module_09_EN.html#signed-area) |
| **net change theorem** | If $F'$ is continuous on $[a, b]$, then $\int_a^b F'(x)\,dx = F(b) - F(a)$: the integral of a rate of change is the net change. | [10.6](module_10_EN.html#net-change-theorem) |
| **Newton's law of cooling** | The rate at which an object's temperature $T$ changes is proportional to its difference from the constant temperature $T_s$ of its surroundings: $T' = -k(T - T_s)$ with $k > 0$. Its solution is $T(t) = T_s + \big(T(0) - T_s\big)e^{-kt}$. | [13.2](module_13_EN.html#models), [13.5](module_13_EN.html#cooling) |
| **Newton's method** | To solve $f(x) = 0$ for differentiable $f$: choose $x_0$ and compute $x_{n+1} = x_n - \dfrac{f(x_n)}{f'(x_n)}$ while $f'(x_n) \ne 0$. Each step follows the tangent line to the $x$-axis. Also called the Newton–Raphson method. | [7.4](module_07_EN.html#newton) |
| **non-zero over zero** | If the numerator tends to a nonzero number and the denominator tends to zero, the magnitude of the quotient grows without bound. The sign of the denominator on the side of approach determines the sign along with that of the numerator. | [3.6](module_03_EN.html#infinite-limits) |
| **norm (of a partition)** | The largest width of the subintervals of a partition $P$, written $\norm{P}$. | [9.4](module_09_EN.html#definite-integral) |
| **normal distribution** | The distribution with density $\dfrac{1}{\sigma\sqrt{2\pi}}\,e^{-(x - \mu)^2/(2\sigma^2)}$, with mean $\mu$ and standard deviation $\sigma > 0$. A normal random variable lies within one, two and three standard deviations of its mean about 68%, 95% and 99.7% of the time: the 68–95–99.7 rule. | [12.9](module_12_EN.html#normal) |
| **normal equations** | $\big(\sum x_i^2\big)m + \big(\sum x_i\big)b = \sum x_iy_i$ and $\big(\sum x_i\big)m + nb = \sum y_i$: the equations $\partial E/\partial m = \partial E/\partial b = 0$ for the least-squares line. With at least two different $x_i$ they have exactly one solution. | [18.5](module_18_EN.html#least-squares) |
| **normal vector** | A nonzero vector perpendicular to a plane or surface. The plane through $P_0$ with normal $\vb{n} = \langle a, b, c\rangle$ is $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$; a parametric surface has the normal $\vb{r}_u\times\vb{r}_v$. | [16.7](module_16_EN.html#planes), [20.6](module_20_EN.html#parametric-surfaces) |
| **numerical integration** | Computing an integral approximately from values of the integrand, with a rule such as the midpoint, trapezoidal or Simpson's rule; needed when there is no elementary antiderivative or the integrand is known only through measurements. | [11.7](module_11_EN.html#numerical) |
| **NumPy** | A free Python package for computing with arrays of numbers. | [1.7](module_01_EN.html#python) |

<div class="section-anchor" id=g-o></div>

### O

| Term | Meaning | Section |
|---|---|---|
| **oblique asymptote** | The line $y = mx + c$, with $m \ne 0$, is an oblique (or slant) asymptote of the graph of $f$ if $f(x) - (mx + c) \to 0$ as $x \to \infty$ or as $x \to -\infty$. | [3.7](module_03_EN.html#oblique) |
| **odd function** | A function with $f(-x) = -f(x)$ for every $x$ in its domain. A half turn about the origin leaves its graph unchanged, and $\int_{-a}^{a} f = 0$. | [1.4](module_01_EN.html#polynomials), [9.6](module_09_EN.html#symmetry) |
| **the one pattern** | What every fundamental theorem of the series says: adding up a derivative over a region gives the values on the region's boundary. The Fundamental Theorem of Calculus, the fundamental theorem for line integrals, Green's, Stokes' and the divergence theorem are all cases. | [20.8](module_20_EN.html#pattern) |
| **one-sided limit** | A left-hand or right-hand limit. $\lim_{x\to a} f(x) = L$ exactly when both one-sided limits at $a$ exist and equal $L$. | [2.2](module_02_EN.html#one-sided), [2.7](module_02_EN.html#no-limit-proof) |
| **one-to-one** | A function is one-to-one if different inputs always give different outputs: $x_1 \ne x_2$ implies $f(x_1) \ne f(x_2)$. | [1.5](module_01_EN.html#inverse) |
| **open disc** | The open disc of radius $r > 0$ centred at $(a, b)$ is the set of points $(x, y)$ with $(x - a)^2 + (y - b)^2 < r^2$. | [18.1](module_18_EN.html#critical-points) |
| **open interval** | $(a, b)$, for $a < b$: the numbers $x$ with $a < x < b$, neither endpoint included. | [1.3](module_01_EN.html#intervals) |
| **open region** | A region with a disc (a ball, in space) around each of its points that lies in the region. | [20.3](module_20_EN.html#conservative) |
| **optimisation** | Finding the largest or smallest value of a quantity: write it as a function of one variable on an interval, find the critical numbers, and show by a theorem that you have the absolute extremum. Module 18 does it in several variables, with or without constraints. | [8.6](module_08_EN.html#optimisation), [18.4](module_18_EN.html#lagrange) |
| **order (of a differential equation)** | The order of the highest derivative in the equation: $y' = ky$ is first order, $my'' + ky = 0$ second order. | [13.1](module_13_EN.html#what) |
| **order (of a method)** | A method whose error is $O(h^p)$, and no better, has order $p$. The forward difference and Euler's method have order 1, the central difference order 2, RK4 order 4. | [4.7](module_04_EN.html#truncation), [13.4](module_13_EN.html#euler-error) |
| **orders of growth** | A comparison of how functions grow near a limit. An eventual bound by a constant multiple of another function is written with big O. A ratio tending to zero records a strict separation of growth rates. | [3.8](module_03_EN.html#growth) |
| **ordinary differential equation** | A differential equation whose unknown is a function of one variable, usually time $t$. | [13.1](module_13_EN.html#what) |
| **orientation** | The direction in which a parametrised curve is traced as $t$ increases. For a surface, a choice of unit normal at each point, varying continuously, which says which side counts as positive. | [16.1](module_16_EN.html#parametric), [20.6](module_20_EN.html#flux) |
| **oriented surface** | A surface with a choice of unit normal $\vb{n}$ at each point, varying continuously over it, which says which side counts as positive. A closed surface, the whole boundary of a solid, is usually given the outward orientation. | [20.6](module_20_EN.html#flux) |
| **orthogonal** | Perpendicular: $\vb{a}\cdot\vb{b} = 0$. The zero vector counts as orthogonal to every vector. | [16.5](module_16_EN.html#dot) |
| **oscillating discontinuity** | A discontinuity that is not removable, a jump or infinite: at least one one-sided limit fails to exist without becoming infinite, as when $\sin\big(1/(x - 2)\big)$ swings between $-1$ and 1 near 2. | [3.1](module_03_EN.html#kinds) |
| **outer function** | In a composition $f\big(g(x)\big)$, the function $f$ applied last, to the value of the inner function $g$. | [1.5](module_01_EN.html#composition) |
| **outer radius** | In the washer method, the distance $R(x)$ from the axis to the farther boundary of the region; the inner radius $r(x)$ is the distance to the nearer one. | [12.3](module_12_EN.html#washers) |
| **outward unit normal** | For a curve traced anticlockwise in the plane, the unit tangent turned a quarter turn clockwise, pointing out of the region; for a closed surface, the unit normal that points out of the solid. | [20.4](module_20_EN.html#flux-form), [20.6](module_20_EN.html#flux) |

<div class="section-anchor" id=g-p></div>

### P

| Term | Meaning | Section |
|---|---|---|
| **$p$-integrals** | $\int_1^\infty \dfrac{dx}{x^p}$ converges, to $\dfrac{1}{p - 1}$, if $p > 1$, and diverges if $p \le 1$; $\int_0^1 \dfrac{dx}{x^p}$ converges, to $\dfrac{1}{1 - p}$, if $p < 1$, and diverges if $p \ge 1$. | [12.8](module_12_EN.html#p-integrals) |
| **$p$-series** | $\sum_{n=1}^{\infty} \dfrac{1}{n^p}$: it converges if $p > 1$ and diverges if $p \le 1$. | [14.5](module_14_EN.html#p-series) |
| **parallel** | Two nonzero vectors are parallel if one is a scalar multiple of the other. | [16.4](module_16_EN.html#arithmetic) |
| **parameter** | The variable, usually $t$, whose values give the points $\big(f(t), g(t)\big)$ of a parametric curve. | [16.1](module_16_EN.html#parametric) |
| **parametric curve** | The path traced by the point $\big(f(t), g(t)\big)$ as the parameter $t$ runs through an interval; $x = f(t)$, $y = g(t)$ are its parametric equations. On $[a, b]$ it starts at the initial point $\big(f(a), g(a)\big)$ and ends at the terminal point $\big(f(b), g(b)\big)$. | [16.1](module_16_EN.html#parametric) |
| **parametric surface** | The set of points $\vb{r}(u, v) = \langle x(u, v), y(u, v), z(u, v)\rangle$ for $(u, v)$ in a region $D$ of the $uv$-plane. The parametrisation is smooth if $\vb{r}_u$ and $\vb{r}_v$ are continuous and $\vb{r}_u\times\vb{r}_v \ne \vb{0}$, except perhaps on the edge of $D$. | [20.6](module_20_EN.html#parametric-surfaces) |
| **parametrisation** | Equations $x = f(t)$, $y = g(t)$ (or a vector function $\vb{r}(t)$) that trace a given curve; for a surface, a function $\vb{r}(u, v)$ whose values fill it. | [16.1](module_16_EN.html#parametric), [20.6](module_20_EN.html#parametric-surfaces) |
| **partial derivative** | $f_x(a, b) = \lim_{h\to0}\dfrac{f(a + h, b) - f(a, b)}{h}$, the derivative with respect to $x$ with $y$ held fixed; $f_y$ holds $x$ fixed. Also written $\dfrac{\partial f}{\partial x}$ and $\dfrac{\partial f}{\partial y}$. | [13.1](module_13_EN.html#existence), [17.3](module_17_EN.html#partial-derivatives) |
| **partial differential equation** | An equation between partial derivatives of an unknown function of several variables, such as the heat equation $u_t = k\,u_{xx}$, with $k > 0$, or Laplace's equation $u_{xx} + u_{yy} = 0$. | [17.3](module_17_EN.html#higher), [20.8](module_20_EN.html#next) |
| **partial fractions** | Writing a proper rational function as a sum of simpler fractions, one or more for each factor of the denominator: $\dfrac{A}{x - r}, \dots, \dfrac{A_k}{(x - r)^k}$ for a factor $(x - r)^k$, and $\dfrac{Bx + C}{x^2 + px + q}, \dots$ for an irreducible quadratic factor. The constants are unique. | [11.4](module_11_EN.html#partial-fractions), [11.4](module_11_EN.html#repeated-factors) |
| **partial integration** | Integrating with respect to one variable while treating the other as a constant, as a partial derivative differentiates. | [19.2](module_19_EN.html#iterated) |
| **partial sum** | $S_N = a_1 + a_2 + \dots + a_N$, the sum of the first $N$ terms of a series. | [14.3](module_14_EN.html#partial-sums) |
| **particular solution** | Any one solution of a differential equation, as opposed to the general solution, which gives them all. | [13.1](module_13_EN.html#what) |
| **partition** | For $a < b$, a list of points $a = x_0 < x_1 < \dots < x_n = b$, which cuts $[a, b]$ into $n$ subintervals $[x_{i-1}, x_i]$ of widths $\Delta x_i = x_i - x_{i-1}$. | [9.4](module_09_EN.html#definite-integral) |
| **periodic** | Repeating at regular steps: $\sin(\theta + 2\pi) = \sin\theta$ and $\cos(\theta + 2\pi) = \cos\theta$, so sine and cosine are periodic with period $2\pi$; the tangent has period $\pi$. | [1.4](module_01_EN.html#trig) |
| **phase line** | A sketch of the $y$-axis with arrows, up where $f > 0$ and down where $f < 0$, which shows where every solution of $y' = f(y)$ goes. | [13.3](module_13_EN.html#equilibria) |
| **piecewise function** | A function that uses different formulas on different parts of its domain, such as $\abs{x}$. | [1.3](module_01_EN.html#piecewise) |
| **piecewise smooth path** | A path made of finitely many smooth pieces joined end to end, each with its own parameter interval. | [20.2](module_20_EN.html#line-integrals) |
| **point-slope equation** | $y - y_1 = m(x - x_1)$: the line through $(x_1, y_1)$ with slope $m$. | [1.4](module_01_EN.html#linear) |
| **polar coordinates** | A point has polar coordinates $(r, \theta)$ if $x = r\cos\theta$ and $y = r\sin\theta$: for $r > 0$, its distance from the origin (the pole) and the angle from the positive $x$-axis (the polar axis), measured anticlockwise. In polar coordinates $dA = r\,dr\,d\theta$. | [16.3](module_16_EN.html#polar), [19.4](module_19_EN.html#polar) |
| **polar rectangle** | A region $r_0 \le r \le r_1$, $\alpha \le \theta \le \beta$ in polar coordinates. | [19.4](module_19_EN.html#polar) |
| **pole** | The origin, in polar coordinates; it is $(0, \theta)$ for every $\theta$. The polar axis is the positive $x$-axis. | [16.3](module_16_EN.html#polar) |
| **polynomial** | A function $p(x) = a_nx^n + \dots + a_1x + a_0$, where $n \ge 0$ is a whole number and the coefficients $a_0, \dots, a_n$ are constants. Its domain is $\R$. | [1.4](module_01_EN.html#polynomials) |
| **position vector** | The vector from the origin to a point $(a_1, a_2, a_3)$, which is $\langle a_1, a_2, a_3\rangle$. | [16.4](module_16_EN.html#components) |
| **positively oriented** | A simple closed curve in the plane is positively oriented if it is traced anticlockwise, with the region it encloses on the left. The boundary of an oriented surface is positively oriented if the surface is on your left as you walk along it with your head along $\vb{n}$. | [20.4](module_20_EN.html#green), [20.7](module_20_EN.html#stokes) |
| **potential function** | A function $f$ with $\nabla f = \vb{F}$; physicists call $U = -f$ the potential energy. | [20.3](module_20_EN.html#conservative) |
| **power function** | A function $f(x) = x^n$. Negative powers are reciprocals, $x^{-n} = 1/x^n$, defined for $x \ne 0$; fractional powers are roots. | [1.4](module_01_EN.html#polynomials) |
| **power (physics)** | The rate at which energy is used or transferred, $P(t) = E'(t)$, in watts; its integral $\int_a^b P(t)\,dt$ is the energy used between $a$ and $b$. | [10.6](module_10_EN.html#net-change-theorem) |
| **power rule** | $\dfrac{d}{dx}x^n = nx^{n-1}$: for every $x$ when $n$ is a positive integer (Module 4), for $x \ne 0$ when $n$ is an integer $\le 0$ (Module 5), and for $x > 0$ when $n$ is any real number (Module 6). | [4.5](module_04_EN.html#power-rule), [5.3](module_05_EN.html#negative-powers), [6.6](module_06_EN.html#real-powers) |
| **power rule for antiderivatives** | $\int x^n\,dx = \dfrac{x^{n+1}}{n + 1} + C$ on $(0, \infty)$, for every real $n \ne -1$. For $n = -1$, $\int \dfrac{dx}{x} = \ln\abs{x} + C$ on any interval that does not contain 0. | [10.1](module_10_EN.html#table) |
| **power series** | A series $\sum_{n=0}^{\infty} c_n(x - a)^n$, centred at $a$, with constant coefficients $c_n$. Where it converges, its sum is a function of $x$. | [15.1](module_15_EN.html#power-series) |
| **probability** | The probability of an event, $P(\text{event})$, is a number from 0 to 1: the fraction of the time the event happens in a long run of repetitions. 1 means certain. | [12.9](module_12_EN.html#densities) |
| **probability density function** | A function $f$ with $f(x) \ge 0$ for every $x$ and $\int_{-\infty}^{\infty} f(x)\,dx = 1$. A random variable $X$ has density $f$ if $P(a \le X \le b) = \int_a^b f(x)\,dx$ for all $a \le b$. | [12.9](module_12_EN.html#densities) |
| **product rule** | If $f$ and $g$ are differentiable at $x$, then so is $fg$, and $(fg)'(x) = f'(x)\,g(x) + f(x)\,g'(x)$. | [5.2](module_05_EN.html#rectangle) |
| **projectile motion** | Motion under gravity alone, $\vb{a} = \langle 0, -g\rangle$. Launched at speed $v_0$ and angle $\alpha$ on level ground, a projectile lands after the flight time $\dfrac{2v_0\sin\alpha}{g}$, having travelled the range $\dfrac{v_0^2\sin 2\alpha}{g}$. | [16.8](module_16_EN.html#projectiles) |
| **proper rational function** | A rational function $P(x)/Q(x)$ in which the degree of $P$ is less than the degree of $Q$; otherwise it is improper, and long division turns it into a polynomial plus a proper one. | [11.4](module_11_EN.html#partial-fractions) |
| **pure function** | A function, in a program, whose output depends only on its input and which does nothing else. Mathematical functions are pure. | [1.3](module_01_EN.html#piecewise) |
| **Pythagorean identity** | $\sin^2\theta + \cos^2\theta = 1$ for every $\theta$, because $(\cos\theta, \sin\theta)$ lies on the unit circle. | [1.4](module_01_EN.html#trig) |

<div class="section-anchor" id=g-q></div>

### Q

| Term | Meaning | Section |
|---|---|---|
| **quadratic** | A polynomial of degree 2, $ax^2 + bx + c$ with $a \ne 0$. | [1.4](module_01_EN.html#polynomials) |
| **quadratic convergence** | Convergence in which each error is roughly a fixed multiple of the square of the one before, so that the number of correct digits roughly doubles at each step. Newton's method converges quadratically to a root $r$ with $f'(r) \ne 0$ when $f'$ and $f''$ are continuous near $r$ and $x_0$ is close enough to $r$. | [7.4](module_07_EN.html#quadratic) |
| **quadrature** | Numerical approximation of a definite integral, such as the midpoint, trapezoidal or Simpson rule. | [11.7](module_11_EN.html#numerical) |
| **quotient rule** | If $f$ and $g$ are differentiable at $x$ and $g(x) \ne 0$, then $\Big(\dfrac{f}{g}\Big)'(x) = \dfrac{f'(x)\,g(x) - f(x)\,g'(x)}{g(x)^2}$. | [5.3](module_05_EN.html#quotient) |

<div class="section-anchor" id=g-r></div>

### R

| Term | Meaning | Section |
|---|---|---|
| **radian** | The unit of angle in calculus: an angle at the centre of the unit circle that cuts off an arc of length $\theta$ measures $\theta$ radians. So $180^\circ = \pi$ radians. | [1.4](module_01_EN.html#trig) |
| **radius of convergence** | The number $R$ such that a power series $\sum c_n(x - a)^n$ converges absolutely for $\abs{x - a} < R$ and diverges for $\abs{x - a} > R$; $R = 0$ if it converges only at $a$, and $R = \infty$ if it converges for every $x$. | [15.1](module_15_EN.html#convergence) |
| **random variable** | A quantity whose value is decided by chance. It is continuous if it has a probability density. | [12.9](module_12_EN.html#densities), [19.5](module_19_EN.html#joint-densities) |
| **range** | (1) The set of all values of a function as its input runs through the domain. (2) The horizontal distance a projectile travels on level ground before it lands. | [1.3](module_01_EN.html#functions), [17.1](module_17_EN.html#functions), [16.8](module_16_EN.html#projectiles) |
| **range reduction** | The first step of a mathematics library computing $\sin x$ or $e^x$: use the function's symmetries to replace $x$ by a small number, for which a polynomial is accurate. | [15.6](module_15_EN.html#libraries) |
| **rate of change** | How fast one quantity changes as another changes, such as a speed. Over an interval it is the average rate of change; at an instant it is the instantaneous rate of change, the derivative. | [1.1](module_01_EN.html#about), [1.6](module_01_EN.html#rates), [4.2](module_04_EN.html#derivative) |
| **ratio test** | If $a_n \ne 0$ and $\abs{a_{n+1}/a_n} \to \rho$, a number or $\infty$: for $\rho < 1$, $\sum a_n$ converges absolutely; for $\rho > 1$ or $\rho = \infty$, it diverges; for $\rho = 1$, the test gives no conclusion. | [14.8](module_14_EN.html#ratio) |
| **rational function** | A quotient $\dfrac{p(x)}{q(x)}$ of two polynomials, where $q$ is not the zero polynomial. Its domain is the set of all $x$ with $q(x) \ne 0$. | [1.4](module_01_EN.html#rational) |
| **real analysis** | The study that proves, with $\varepsilon$–$\delta$ reasoning, the results this series quoted, such as the Extreme Value Theorem and the integrability of continuous functions. | [20.8](module_20_EN.html#next) |
| **rearrangement** | The same terms of a series added in another order. | [14.8](module_14_EN.html#rearrangements) |
| **rectified linear unit (ReLU)** | The piecewise function $\operatorname{ReLU}(x) = \max(0, x)$: 0 for $x < 0$ and $x$ for $x \ge 0$. Neural networks use it. | [1.3](module_01_EN.html#piecewise) |
| **recursive sequence** | A sequence defined by its first term and a fixed rule $a_{n+1} = g(a_n)$ that computes each further term from the one before. | [14.2](module_14_EN.html#recursive) |
| **reduction formula** | A formula that expresses an integral with a whole-number parameter $n$ through the same integral with a smaller $n$, such as $\int \sin^n x\,dx = -\dfrac{\sin^{n-1}x\cos x}{n} + \dfrac{n - 1}{n}\int\sin^{n-2}x\,dx$ for $n \ge 2$. | [11.1](module_11_EN.html#reduction) |
| **related rates** | Problems in which two quantities linked by an equation both change with time: differentiating the equation with respect to time, by the chain rule, links their rates of change. | [7.1](module_07_EN.html#related-rates) |
| **relative error** | $\abs{\Delta x}/\abs{x}$, for $x \ne 0$: the size of the error compared with the size of the true value. Written as a percentage, it is the percentage error. | [7.3](module_07_EN.html#errors) |
| **remainder** | (1) For a series that converges to $S$, $R_N = S - S_N$, the error of the $N$th partial sum; under the hypotheses of the integral test, $\int_{N+1}^\infty f \le R_N \le \int_N^\infty f$. (2) For a Taylor polynomial, $R_n(x) = f(x) - T_n(x)$. | [14.5](module_14_EN.html#remainder), [15.5](module_15_EN.html#taylor-theorem) |
| **removable discontinuity** | A discontinuity at $a$ where $\lim_{x\to a} f(x)$ exists. Redefining $f(a)$ as the limit makes $f$ continuous at $a$. | [3.1](module_03_EN.html#kinds) |
| **residual** | For a line $y = mx + b$ and a data point $(x_i, y_i)$, the error $y_i - (mx_i + b)$. | [18.5](module_18_EN.html#least-squares) |
| **restricting the domain** | Cutting down the domain of a function that is not one-to-one so that it becomes one-to-one, as $x^2$ on $[0, \infty)$, whose inverse is $\sqrt{x}$. | [1.5](module_01_EN.html#inverse) |
| **reversing the order of integration** | Rewriting an iterated integral over a region with the other order of integration, with new limits read from a sketch of the region; it can turn an impossible integral into an easy one. | [19.3](module_19_EN.html#general-regions) |
| **Riemann sum** | $\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i$, for a partition of $[a, b]$ with widths $\Delta x_i$ and a sample point $x_i^*$ in each subinterval: a total of rectangles. The left, right and midpoint sums are Riemann sums; double and triple Riemann sums add up boxes. | [9.3](module_09_EN.html#riemann-sums), [9.4](module_09_EN.html#definite-integral), [19.1](module_19_EN.html#double-integrals) |
| **Riemann's rearrangement theorem** | If $\sum a_n$ converges conditionally, then for every number $T$ some rearrangement converges to $T$, and others diverge. | [14.8](module_14_EN.html#rearrangements) |
| **right-hand derivative** | $f'_+(a) = \lim_{h\to0^+}\dfrac{f(a + h) - f(a)}{h}$, when this limit exists; the left-hand derivative $f'_-(a)$ takes $h \to 0^-$. $f'(a)$ exists exactly when both exist and are equal. | [4.4](module_04_EN.html#failures) |
| **right-hand limit** | $\lim_{x\to a^+} f(x) = L$: the same as a left-hand limit, with $x > a$ and $f$ defined on an interval $(a, d)$. Also called the limit from the right. | [2.2](module_02_EN.html#one-sided) |
| **right-hand rule** | When the fingers of your right hand curl from the first direction towards the second, your thumb points along the third: so the $x$-, $y$- and $z$-axes are arranged, $\vb{a}\times\vb{b}$ points, and the normal of a surface goes with its boundary in Stokes' theorem. | [16.4](module_16_EN.html#space), [16.6](module_16_EN.html#cross), [20.7](module_20_EN.html#stokes) |
| **right sum** | $R_n = \sum_{i=1}^{n} f(x_i)\,\Delta x$, with $n$ equal subintervals: each rectangle takes its height at the right end of its subinterval. | [9.3](module_09_EN.html#riemann-sums) |
| **Rolle's theorem** | If $f$ is continuous on $[a, b]$, differentiable on $(a, b)$, and $f(a) = f(b)$, then $f'(c) = 0$ for some $c$ in $(a, b)$. | [8.2](module_08_EN.html#mvt) |
| **root test** | If $\abs{a_n}^{1/n} \to \rho$, a number or $\infty$: for $\rho < 1$, $\sum a_n$ converges absolutely; for $\rho > 1$ or $\rho = \infty$, it diverges; for $\rho = 1$, no conclusion. | [14.8](module_14_EN.html#root) |
| **rose** | A flower-shaped polar curve such as $r = \cos 3\theta$, which has three petals. | [16.3](module_16_EN.html#polar-curves) |
| **rounding error** | The part of an error that comes from the computer's rounding. In a difference quotient its size is about $\varepsilon\abs{f(a)}/h$, where $\varepsilon$ is the machine epsilon, so it grows as $h$ shrinks. | [4.7](module_04_EN.html#rounding) |
| **rules for sums** | $\sum c\,a_i = c\sum a_i$, $\sum (a_i + b_i) = \sum a_i + \sum b_i$ (and the same with $-$), and $\sum_{i=1}^{n} c = nc$. | [9.2](module_09_EN.html#sigma) |
| **Runge–Kutta method (RK4)** | The classical fourth-order method for $y' = F(t, y)$: each step averages four slopes, $y_{n+1} = y_n + \tfrac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$. Its error at a fixed time is $O(h^4)$. | [13.4](module_13_EN.html#rk4) |

<div class="section-anchor" id=g-s></div>

### S

| Term | Meaning | Section |
|---|---|---|
| **saddle point** | A critical point at which $f$ has neither a local maximum nor a local minimum: every open disc around it contains points where $f$ is larger and points where it is smaller, as the origin for $x^2 - y^2$. | [18.1](module_18_EN.html#critical-points) |
| **sample point** | A point $x_i^*$ chosen in the $i$th subinterval of a partition (or in a small rectangle or box), at which the Riemann sum takes the value of $f$. | [9.4](module_09_EN.html#definite-integral), [19.1](module_19_EN.html#double-integrals) |
| **scalar** | An ordinary number, as opposed to a vector. | [16.4](module_16_EN.html#components) |
| **scalar multiple** | $c\vb{a} = \langle ca_1, ca_2, ca_3\rangle$: $\vb{a}$ stretched by the factor $\abs{c}$, and reversed if $c < 0$. | [16.4](module_16_EN.html#arithmetic) |
| **scalar projection** | $\operatorname{comp}_{\vb{a}}\vb{b} = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}$, for $\vb{a} \ne \vb{0}$: the signed length $\norm{\vb{b}}\cos\theta$ of the shadow of $\vb{b}$ on the line of $\vb{a}$. | [16.5](module_16_EN.html#projections) |
| **scratch work** | In an $\varepsilon$–$\delta$ proof, the working backwards from $\abs{f(x) - L} < \varepsilon$ to a condition on $\abs{x - a}$ that finds $\delta$. The proof then runs the argument forwards. | [2.7](module_02_EN.html#proofs) |
| **secant line** | The line through two points of a curve. For $y = f(x)$ and the points at $a$ and $b$, its slope is the average rate of change $\dfrac{f(b) - f(a)}{b - a}$. | [1.1](module_01_EN.html#two-problems), [1.6](module_01_EN.html#rates) |
| **second derivative test** | (1) If $f'(c) = 0$ and $f''(c) > 0$, $f(c)$ is a local minimum; if $f''(c) < 0$, a local maximum; if $f''(c) = 0$, no information. (2) For $f(x, y)$ with continuous second partial derivatives near a point where $\nabla f = \vb{0}$, with $D$ the determinant of the Hessian: $D > 0$ and $f_{xx} > 0$ give a local minimum, $D > 0$ and $f_{xx} < 0$ a local maximum, $D < 0$ a saddle point, $D = 0$ no information. | [8.4](module_08_EN.html#second-derivative-test), [18.2](module_18_EN.html#second-derivative-test) |
| **second derivative test in two variables** | At a stationary point with continuous second partials, a negative Hessian determinant gives a saddle. A positive determinant gives a local minimum if $f_{xx}>0$ or a local maximum if $f_{xx}<0$. A zero determinant leaves the test inconclusive. | [18.2](module_18_EN.html#second-derivative-test) |
| **second partial derivatives** | The partial derivatives $f_{xx}$, $f_{xy}$, $f_{yx}$ and $f_{yy}$ of $f_x$ and $f_y$. In $f_{xy}$ you differentiate first with respect to $x$, then $y$; $f_{xy}$ and $f_{yx}$ are the mixed partial derivatives. | [17.3](module_17_EN.html#higher) |
| **separable equation** | A first-order equation that can be written $y' = g(t)\,h(y)$. Separating the variables, $\int \dfrac{dy}{h(y)} = \int g(t)\,dt$, gives its solutions where $h \ne 0$. | [13.5](module_13_EN.html#separable) |
| **sequence** | An infinite list of numbers in a definite order, $a_1, a_2, a_3, \dots$, written $(a_n)$: precisely, a function whose domain is the whole numbers from some first index on. $a_n$ is its $n$th term, and $n$ its index. | [14.1](module_14_EN.html#sequences) |
| **series** | An infinite sum $\sum_{n=1}^{\infty} a_n = a_1 + a_2 + a_3 + \cdots$. It converges to the sum $S$ if its partial sums $S_N$ converge to $S$, and diverges otherwise. | [14.3](module_14_EN.html#partial-sums) |
| **shadow price** | The Lagrange multiplier $\lambda$ read as the rate at which the best value changes as the constraint is relaxed: what one more unit of budget is worth at the optimum. | [18.4](module_18_EN.html#lagrange) |
| **shell method** | When the region under the graph of a continuous $f \ge 0$, for $0 \le a \le x \le b$, rotates about the $y$-axis, the solid has volume $V = 2\pi\int_a^b x\,f(x)\,dx$; in general $2\pi\int (\text{radius})(\text{height})\,dx$. | [12.4](module_12_EN.html#shells) |
| **shoelace formula** | The area of a polygon with vertices $(x_1, y_1), \dots, (x_n, y_n)$, in order anticlockwise, from Green's theorem: $\tfrac12\sum (x_iy_{i+1} - x_{i+1}y_i)$, with $(x_{n+1}, y_{n+1}) = (x_1, y_1)$. Also called the surveyor's formula. | [20.4](module_20_EN.html#area) |
| **sigma notation** | $\sum_{i=m}^{n} a_i = a_m + a_{m+1} + \dots + a_n$, for whole numbers $m \le n$. The letter $i$ is the index of summation, and $m$ and $n$ are the lower and upper limits of the sum. | [9.2](module_09_EN.html#sigma) |
| **sigmoid** | The function $\sigma(x) = \dfrac{1}{1 + e^{-x}}$ of machine learning, which turns any real number into a number between 0 and 1. It is the logistic curve with $r = 1$, $K = 1$ and $y(0) = \tfrac12$. | [8.4](module_08_EN.html#concavity), [13.6](module_13_EN.html#logistic) |
| **sign chart** | A table of the signs of $f'$ (or $f''$) on the intervals between its zeros and the points where it is undefined, read from the signs of its factors. | [8.3](module_08_EN.html#monotonic) |
| **simple curve** | A curve that does not cross itself; a simple closed curve meets itself only where it ends at its start. | [20.3](module_20_EN.html#test) |
| **simple harmonic motion** | The undamped oscillation $x = C_1\cos\omega t + C_2\sin\omega t$, with $\omega = \sqrt{k/m}$, of a mass $m$ on a spring of stiffness $k$: it goes on for ever with period $2\pi/\omega$. | [13.8](module_13_EN.html#second-order) |
| **simply connected** | A connected region of the plane in which every simple closed curve encloses only points of the region: it has no holes. In space, a region in which every closed curve can be shrunk to a point without leaving it. | [20.3](module_20_EN.html#test), [20.5](module_20_EN.html#identities) |
| **Simpson's rule** | $S_n = \dfrac{\Delta x}{3}\big[f(x_0) + 4f(x_1) + 2f(x_2) + \dots + 4f(x_{n-1}) + f(x_n)\big]$, for even $n$. It is exact for polynomials of degree at most 3, and if $f^{(4)}$ is continuous and $\abs{f^{(4)}} \le K$ on $[a, b]$, its error is at most $\dfrac{K(b - a)^5}{180n^4}$. | [11.7](module_11_EN.html#simpson) |
| **sinc function** | $\dfrac{\sin x}{x}$ for $x \ne 0$, with the value 1 at 0, which makes it continuous; a function of signal processing. Some books put $\pi x$ in place of $x$. | [3.1](module_03_EN.html#kinds) |
| **sine and cosine** | Turn from $(1, 0)$ through $\theta$ radians round the unit circle to a point $P$: then $\cos\theta$ is the $x$-coordinate of $P$ and $\sin\theta$ its $y$-coordinate. Both have domain $\R$ and range $[-1, 1]$. | [1.4](module_01_EN.html#trig) |
| **sine integral** | $\operatorname{Si} x = \displaystyle\int_0^x \frac{\sin t}{t}\,dt$, for every real $x$, with the integrand given the value 1 at $t = 0$. | [11.6](module_11_EN.html#nonelementary) |
| **skew lines** | Lines in space that are not parallel and never meet. | [16.7](module_16_EN.html#lines) |
| **slice, approximate, add** | The way integrals arise in applications: slice $[a, b]$ into thin pieces, approximate the part of the quantity in each piece by $q(x)\,\Delta x$, add the pieces into a Riemann sum, and take the limit to get $\int_a^b q(x)\,dx$. | [12.1](module_12_EN.html#method) |
| **slope** | The change in $y$ per unit change in $x$ along a line: $m = \dfrac{y_2 - y_1}{x_2 - x_1}$ for any two of its points with $x_1 \ne x_2$. The slope of a curve at a point is the slope of its tangent line there. | [1.4](module_01_EN.html#linear) |
| **slope of a parametric curve** | $\dfrac{dy}{dx} = \dfrac{dy/dt}{dx/dt}$ where $dx/dt \ne 0$, if $f'$ is continuous. The tangent is horizontal where $dy/dt = 0 \ne dx/dt$, and vertical where $dx/dt = 0 \ne dy/dt$. | [16.2](module_16_EN.html#tangents) |
| **small-angle approximation** | $\sin\theta \approx \theta$ for $\theta$ near 0, in radians, because $\sin\theta/\theta \to 1$. It is the linearisation of $\sin$ at 0. | [2.6](module_02_EN.html#trig-limits), [7.2](module_07_EN.html#how-good) |
| **smooth curve** | A curve traced by a smooth path with continuous velocity that is nonzero at interior parameter values. The series allows the velocity to vanish at an endpoint. | [20.2](module_20_EN.html#line-integrals) |
| **smooth patch** | A surface patch with a continuously differentiable parametrisation on a neighbourhood of its parameter region, with the two parameter tangent vectors having nonzero cross product at interior points. | [20.6](module_20_EN.html#parametric-surfaces) |
| **smooth path** | A parametrised path on a closed interval with continuous velocity that is nonzero in the interior. The velocity may vanish at an endpoint. | [20.2](module_20_EN.html#line-integrals) |
| **Snell's law** | The law of refraction, $\dfrac{\sin\theta_1}{v_1} = \dfrac{\sin\theta_2}{v_2}$, for light passing between two media in which it has speeds $v_1$ and $v_2$; the angles are measured from the perpendicular to the boundary. | [8.6](module_08_EN.html#optimisation) |
| **softplus** | The function $s(x) = \ln(1 + e^x)$ of machine learning, a smooth version of $\operatorname{ReLU}(x) = \max(0, x)$. | [7.5](module_07_EN.html#the-rule) |
| **solid of revolution** | The solid swept out when a region of the plane rotates about a line in that plane, the axis. | [12.3](module_12_EN.html#washers) |
| **solution (of a differential equation)** | A function, on an open interval $I$, that has the derivatives the equation involves at every point of $I$ and makes the equation true for every $t$ in $I$. | [6.8](module_06_EN.html#growth-decay), [13.1](module_13_EN.html#what) |
| **source** | A vector field, such as $\langle x, y\rangle$, whose flow streams outwards as if pumped in at a point; its opposite, such as $\langle -x, -y\rangle$, is a sink. | [20.1](module_20_EN.html#fields) |
| **space curve** | The curve traced by the tip of $\vb{r}(t)$, drawn from the origin, as $t$ varies. | [16.8](module_16_EN.html#motion) |
| **speed** | The size of the velocity: $\abs{v(a)}$ on a line, $\norm{\vb{v}(t)}$ in space. | [4.1](module_04_EN.html#tangents), [16.8](module_16_EN.html#velocity) |
| **sphere** | The points at distance $R$ from a point $(a, b, c)$: $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$. | [16.4](module_16_EN.html#space) |
| **spherical coordinates** | $(\rho, \theta, \varphi)$: the distance $\rho \ge 0$ from the origin, the angle $\theta$ of cylindrical coordinates, and the angle $\varphi$ from the positive $z$-axis, $0 \le \varphi \le \pi$. Then $x = \rho\sin\varphi\cos\theta$, $y = \rho\sin\varphi\sin\theta$, $z = \rho\cos\varphi$, and $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$. | [19.7](module_19_EN.html#spherical) |
| **spherical wedge** | A solid cut out by intervals for the spherical radius and the two spherical angles. | [19.7](module_19_EN.html#spherical) |
| **spring constant** | The constant $k$ in Hooke's law $F = kx$, the spring's stiffness, in newtons per metre. | [12.6](module_12_EN.html#work) |
| **square root** | For $x \ge 0$, $\sqrt{x}$ is the non-negative number whose square is $x$. So $\sqrt{x^2} = \abs{x}$. | [1.4](module_01_EN.html#roots) |
| **squeeze theorem** | If $g(x) \le f(x) \le h(x)$ for every $x \ne a$ in an open interval around $a$, and $g$ and $h$ have the same limit $L$ at $a$, then $\lim_{x\to a} f(x) = L$. Module 14 states it for sequences and Module 17 for two variables. | [2.6](module_02_EN.html#squeeze), [14.1](module_14_EN.html#laws), [17.2](module_17_EN.html#squeeze) |
| **standard deviation** | The number $\sigma > 0$ that sets the width of a normal distribution; $\sigma^2$, the variance, is the mean squared distance from the mean. | [12.9](module_12_EN.html#normal), [Ex. 12.12](module_12_EN.html#ex-12-12) |
| **standard normal density** | $\varphi(z) = \dfrac{1}{\sqrt{2\pi}}\,e^{-z^2/2}$, the bell-shaped density of statistics, with mean 0 and standard deviation 1. | [12.9](module_12_EN.html#normal) |
| **standard unit vectors** | $\vb{i} = \langle 1, 0, 0\rangle$, $\vb{j} = \langle 0, 1, 0\rangle$ and $\vb{k} = \langle 0, 0, 1\rangle$, so that $\langle a_1, a_2, a_3\rangle = a_1\vb{i} + a_2\vb{j} + a_3\vb{k}$. | [16.4](module_16_EN.html#arithmetic) |
| **standardise** | To shift data to mean 0 and scale it to a similar spread, as is done to a model's input features before training, so that gradient descent is not ill-conditioned. | [18.6](module_18_EN.html#rescaling) |
| **steepest ascent** | For differentiable $f$ with $\nabla f(a, b) \ne \vb{0}$, the directional derivative is largest, $\norm{\nabla f}$, in the direction of $\nabla f$, smallest, $-\norm{\nabla f}$, in the opposite direction, and 0 perpendicular to it. | [17.6](module_17_EN.html#steepest-ascent) |
| **step size** | The size of each step of a numerical method: $\eta > 0$ in gradient descent, where machine learning calls it the learning rate; $h > 0$ in Euler's method. | [8.7](module_08_EN.html#gradient-descent), [13.4](module_13_EN.html#euler), [17.7](module_17_EN.html#gradient-descent) |
| **stiff** | A differential equation with fast-decaying parts, which force ordinary methods to take tiny steps; numerical software has special methods for it. | [13.4](module_13_EN.html#rk4) |
| **Stokes' theorem** | For an oriented piecewise smooth surface $S$ with a simple closed piecewise smooth boundary $C$ oriented by the right-hand rule, $\oint_C\vb{F}\cdot d\vb{r}=\iint_S\operatorname{curl}\vb{F}\cdot d\vb{S}$ if $\vb{F}$ has continuous first partial derivatives on an open neighbourhood of $S$. | [20.7](module_20_EN.html#stokes) |
| **strategy for integration** | Simplify the integrand; substitute if it contains a function with its derivative; classify it by its form (parts, trigonometric integral, trigonometric substitution, partial fractions, roots); and if that fails, try again, combining methods. | [11.5](module_11_EN.html#strategy) |
| **strategy for testing series** | First the divergence test; then the series you know (geometric, $p$-series); comparison for terms built from powers of $n$; the ratio test for factorials and exponentials; the root test for $n$th powers; the integral test for $f(n)$ with $f$ continuous, positive and decreasing; for signs that alternate, test $\sum\abs{a_n}$ first. | [14.9](module_14_EN.html#strategy) |
| **strictly increasing** | For functions, what this series calls increasing: $x_1 < x_2$ gives $f(x_1) < f(x_2)$. For sequences, $a_n < a_{n+1}$ for every $n$. Strictly decreasing is defined in the same way. | [Ex. 1.10](module_01_EN.html#ex-1-10), [8.3](module_08_EN.html#monotonic), [14.2](module_14_EN.html#monotone) |
| **substitution rule** | $\int f\big(g(x)\big)\,g'(x)\,dx = \int f(u)\,du$ with $u = g(x)$ and $du = g'(x)\,dx$: the chain rule in reverse. In a definite integral, $\int_a^b f\big(g(x)\big)g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du$, for continuous $g'$ and $f$. | [10.7](module_10_EN.html#substitution), [10.7](module_10_EN.html#definite-substitution) |
| **sum (of a series)** | The limit $S = \lim_{N\to\infty} S_N$ of the partial sums of a convergent series, written $\sum_{n=1}^{\infty} a_n = S$. Changing finitely many terms does not change whether a series converges. | [14.3](module_14_EN.html#partial-sums) |
| **sum rule** | If $f$ and $g$ are differentiable at $x$, then $(f + g)'(x) = f'(x) + g'(x)$, and $(f - g)'(x) = f'(x) - g'(x)$. | [4.5](module_04_EN.html#sum-rule) |
| **sums of powers** | For every whole number $n \ge 1$: $\sum_{i=1}^{n} i = \dfrac{n(n + 1)}{2}$, $\sum_{i=1}^{n} i^2 = \dfrac{n(n + 1)(2n + 1)}{6}$ and $\sum_{i=1}^{n} i^3 = \Big(\dfrac{n(n + 1)}{2}\Big)^2$. | [9.2](module_09_EN.html#power-sums) |
| **superposition** | If $y_1$ and $y_2$ solve $ay'' + by' + cy = 0$, so does $C_1y_1 + C_2y_2$ for all constants $C_1$ and $C_2$. | [13.8](module_13_EN.html#second-order) |
| **surface** | A two-dimensional shape in space, such as the graph $z = f(x, y)$ of a function of two variables, which has one point above each point of the domain, or a parametric surface $\vb{r}(u, v)$. | [17.1](module_17_EN.html#graphs), [20.6](module_20_EN.html#parametric-surfaces) |
| **surface area** | For a surface traced once by a smooth parametrisation $\vb{r}(u, v)$, $(u, v)$ in $D$: $A(S) = \iint_D \norm{\vb{r}_u\times\vb{r}_v}\,dA$. | [20.6](module_20_EN.html#surface-area) |
| **surface integral** | $\iint_S f\,dS = \iint_D f\big(\vb{r}(u, v)\big)\norm{\vb{r}_u\times\vb{r}_v}\,dA$, for $f$ continuous on a surface $S$ traced once by a smooth parametrisation: $f$ times small areas $dS$, added up. | [20.6](module_20_EN.html#surface-integrals) |
| **symbol (SymPy)** | A name for an unknown number in SymPy, created with `symbols`, so that formulas can be manipulated exactly. | [1.7](module_01_EN.html#first-session) |
| **symbolic differentiation** | Differentiating a formula exactly by the rules of differentiation, as SymPy does. | [5.8](module_05_EN.html#autodiff) |
| **symmetric equations** | $\dfrac{x - x_0}{a} = \dfrac{y - y_0}{b} = \dfrac{z - z_0}{c}$: the line through $(x_0, y_0, z_0)$ in the direction $\langle a, b, c\rangle$, when $a$, $b$ and $c$ are all nonzero. | [16.7](module_16_EN.html#lines) |
| **SymPy** | A free Python package for exact algebra and calculus with symbols. | [1.7](module_01_EN.html#python) |

<div class="section-anchor" id=g-t></div>

### T

| Term | Meaning | Section |
|---|---|---|
| **tabular method** | A table that organises repeated integration by parts when $u$ is a polynomial: differentiate $u$ down one column until it reaches 0, integrate $dv$ down the other, and add the diagonal products with alternating signs. | [11.1](module_11_EN.html#repeated) |
| **tangent line** | The line that secant lines through a point $P$ of a curve settle on as the second point approaches $P$. For $y = f(x)$ at $P = (a, f(a))$, when $f'(a)$ exists, it is $y = f(a) + f'(a)(x - a)$. | [1.1](module_01_EN.html#two-problems), [4.1](module_04_EN.html#tangent-line) |
| **tangent plane** | If the partial derivatives of $f$ exist near $(a, b)$ and are continuous at $(a, b)$, the tangent plane to $z = f(x, y)$ there is $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$. For a level surface $F = k$, it is the plane through the point with normal vector $\nabla F$, where $\nabla F \ne \vb{0}$. | [17.4](module_17_EN.html#tangent-planes), [17.6](module_17_EN.html#tangent-planes-3d) |
| **Taylor polynomial** | $T_n(x) = \sum_{k=0}^{n} \dfrac{f^{(k)}(a)}{k!}(x - a)^k$, the partial sum of degree $n$ of the Taylor series of $f$ about $a$. $T_1$ is the linearisation. | [15.4](module_15_EN.html#taylor-series) |
| **Taylor series** | For $f$ with derivatives of every order at $a$, the power series $\sum_{n=0}^{\infty} \dfrac{f^{(n)}(a)}{n!}(x - a)^n$. If $f$ is the sum of a power series centred at $a$, that series is its Taylor series. | [15.4](module_15_EN.html#taylor-series) |
| **Taylor's inequality** | If $\abs{f^{(n+1)}(t)} \le M$ for every $t$ between $a$ and $x$, then $\abs{f(x) - T_n(x)} \le \dfrac{M}{(n + 1)!}\abs{x - a}^{n+1}$. | [15.5](module_15_EN.html#taylor-theorem) |
| **Taylor's theorem** | If $f$ has derivatives through order $n+1$ on an open interval containing $a$ and $x\ne a$, there is a $c$ strictly between them with $f(x)-T_n(x)=\tfrac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$. At the centre the remainder is zero. | [15.5](module_15_EN.html#taylor-theorem) |
| **telescoping** | A sum of differences, $(b_1 - b_2) + (b_2 - b_3) + \dots + (b_N - b_{N+1})$, in which everything cancels except $b_1 - b_{N+1}$. A telescoping series converges exactly when $b_n$ has a limit, and then its sum is $b_1 - \lim b_n$. | [9.2](module_09_EN.html#power-sums), [14.3](module_14_EN.html#telescoping) |
| **term** | One of the numbers $a_n$ of a sequence, or one of the numbers added in a series. | [14.1](module_14_EN.html#sequences), [14.3](module_14_EN.html#partial-sums) |
| **term-by-term differentiation and integration** | A power series with radius of convergence $R > 0$ can be differentiated and integrated term by term for $\abs{x - a} < R$, and the new series have the same radius $R$. | [15.3](module_15_EN.html#term-by-term) |
| **terminal velocity** | The constant speed $v_T = mg/c$ at which a body falling with air resistance $cv$ stops speeding up: its weight $mg$ and the resistance balance. | [13.2](module_13_EN.html#models) |
| **test for conservative fields** | If $P$ and $Q$ have continuous first partial derivatives on an open region, a conservative $\langle P, Q\rangle$ has $P_y = Q_x$; on an open, simply connected region, $P_y = Q_x$ also makes $\langle P, Q\rangle$ conservative. | [20.3](module_20_EN.html#test) |
| **tetrahedral angle** | The angle between two lines from the centre of a regular tetrahedron to its vertices, $\arccos(-1/3)$. | [16.5](module_16_EN.html#angles) |
| **time constant** | For $y' = -k(y - A)$ with $k > 0$, the time $1/k$ in which the distance from the equilibrium $A$ shrinks by the factor $e$. For an RC circuit it is $\tau = RC$. | [13.5](module_13_EN.html#cooling), [13.7](module_13_EN.html#linear) |
| **torque** | The turning effect $\boldsymbol{\tau} = \vb{r}\times\vb{F}$ of a force $\vb{F}$ applied at the point with position vector $\vb{r}$ from the axis. | [16.6](module_16_EN.html#cross) |
| **torus** | The shape of a ring doughnut: the solid swept out when a disc of radius $a$ rotates about a line in its plane at distance $R > a$ from its centre. | [Ex. 12.10](module_12_EN.html#ex-12-10) |
| **total area** | The area between a graph and the $x$-axis with every part counted as positive: the area above the axis plus the area below it, $\int_a^b \abs{f(x)}\,dx$. | [9.4](module_09_EN.html#signed-area) |
| **total differential** | For differentiable $z = f(x, y)$: $dz = f_x\,dx + f_y\,dy = \dfrac{\partial z}{\partial x}\,dx + \dfrac{\partial z}{\partial y}\,dy$, where the differentials $dx$ and $dy$ are independent variables. | [17.4](module_17_EN.html#differential) |
| **transformation** | A function $T$ that sends each point $(u, v)$ of a region $S$ of the $uv$-plane to a point $(x, y) = T(u, v)$ of the $xy$-plane. | [19.8](module_19_EN.html#change-of-variables) |
| **trapezoidal rule** | $T_n = \dfrac{\Delta x}{2}\big[f(x_0) + 2f(x_1) + \dots + 2f(x_{n-1}) + f(x_n)\big]$, with $\Delta x = (b - a)/n$ and $x_i = a + i\,\Delta x$: the average of the left and right sums. If $f''$ is continuous and $\abs{f''} \le K$ on $[a, b]$, its error is at most $\dfrac{K(b - a)^3}{12n^2}$. | [11.7](module_11_EN.html#trapezoidal), [11.7](module_11_EN.html#error-bounds) |
| **tree diagram** | A diagram for the chain rule: the dependent variable at the top, the intermediate variables below it, the independent ones at the bottom, and each branch labelled with a derivative. The derivative of the top variable with respect to a bottom one is the sum, over all paths down to it, of the products of the labels. | [17.5](module_17_EN.html#tree-diagrams) |
| **triangle inequality** | $\abs{a + b} \le \abs{a} + \abs{b}$ for all real numbers $a$ and $b$. For vectors, $\norm{\vb{a} + \vb{b}} \le \norm{\vb{a}} + \norm{\vb{b}}$. | [2.7](module_02_EN.html#no-limit-proof), [16.4](module_16_EN.html#arithmetic) |
| **trigonometric functions** | Sine and cosine, and the four defined from them where the denominator is not 0: $\tan\theta = \sin\theta/\cos\theta$, $\cot\theta = \cos\theta/\sin\theta$, $\sec\theta = 1/\cos\theta$ and $\csc\theta = 1/\sin\theta$. | [1.4](module_01_EN.html#trig) |
| **trigonometric integral** | An integral of a product of powers of trigonometric functions, such as $\int \sin^m x\cos^n x\,dx$: save one factor of an odd power and substitute, or use the half-angle identities when both powers are even. | [11.2](module_11_EN.html#trig-integrals) |
| **trigonometric substitution** | Substituting $x = a\sin\theta$, $a\tan\theta$ or $a\sec\theta$ (with $a > 0$) to remove $\sqrt{a^2 - x^2}$, $\sqrt{a^2 + x^2}$ or $\sqrt{x^2 - a^2}$ from an integrand: the substitution rule read from right to left. A right triangle turns the answer back into $x$. | [11.3](module_11_EN.html#trig-substitution) |
| **triple integral** | $\iiint_E f(x, y, z)\,dV$, the limit of triple Riemann sums over small boxes of volume $\Delta V$, computed as an iterated integral in any of six orders. With $f = 1$ it is the volume of $E$. | [19.6](module_19_EN.html#triple) |
| **truncation error** | The error of a method that remains when the arithmetic is exact, because it stops at a step $h > 0$ instead of going to the limit. | [4.7](module_04_EN.html#truncation) |
| **type 1 solid** | A solid $u_1(x, y) \le z \le u_2(x, y)$ between two surfaces over a region $D$ of the $xy$-plane; its triple integral is $\iint_D \Big[\int_{u_1}^{u_2} f\,dz\Big]\,dA$. | [19.6](module_19_EN.html#triple) |
| **type I region** | A region $a \le x \le b$, $g_1(x) \le y \le g_2(x)$ between the graphs of two continuous functions of $x$; over it, $\iint_D f\,dA = \int_a^b\int_{g_1(x)}^{g_2(x)} f\,dy\,dx$. A type II region, $c \le y \le d$, $h_1(y) \le x \le h_2(y)$, lies between graphs of functions of $y$. | [19.3](module_19_EN.html#general-regions) |
| **type II region** | A planar region between two continuous functions of $y$ over a closed interval of $y$, with the left function at most the right one. | [19.3](module_19_EN.html#general-regions) |

<div class="section-anchor" id=g-u></div>

### U

| Term | Meaning | Section |
|---|---|---|
| **uniform density** | The density on $[0, 1]$ equal to 1 there and 0 elsewhere: for $0 \le a \le b \le 1$, $P(a \le X \le b) = b - a$. | [12.9](module_12_EN.html#densities) |
| **uniformly continuous** | $g$ is uniformly continuous on an interval if for every $\varepsilon > 0$ there is a $\delta > 0$ with $\abs{g(s) - g(s')} < \varepsilon$ for all points $s$, $s'$ of the interval with $\abs{s - s'} < \delta$. A function continuous on a closed interval is uniformly continuous there. | [16.2](module_16_EN.html#arc-length) |
| **unit circle** | The circle of radius 1 centred at the origin. | [1.4](module_01_EN.html#trig) |
| **unit step function** | The function that is 0 for negative inputs and 1 for positive ones, written $u(t)$ in Module 2, where its value at 0 is left open, and $H(x)$ with $H(0) = 1$ in Module 4. It jumps at 0, so it is not continuous or differentiable there. | [2.2](module_02_EN.html#one-sided), [4.4](module_04_EN.html#failures) |
| **unit tangent vector** | $\vb{T}(t) = \dfrac{\vb{r}'(t)}{\norm{\vb{r}'(t)}}$, where $\vb{r}'(t) \ne \vb{0}$. | [16.8](module_16_EN.html#integrals) |
| **unit vector** | A vector of length 1. $\vb{a}/\norm{\vb{a}}$ is the unit vector in the direction of $\vb{a} \ne \vb{0}$; finding it is normalising $\vb{a}$. | [16.4](module_16_EN.html#arithmetic) |
| **upper bound** | A number $M$ with $a_n \le M$ for every term of a sequence, or $x \le M$ for every element of a set; a lower bound $m$ has $a_n \ge m$. The least upper bound is the smallest upper bound. | [14.2](module_14_EN.html#monotone), [15.1](module_15_EN.html#convergence) |

<div class="section-anchor" id=g-v></div>

### V

| Term | Meaning | Section |
|---|---|---|
| **value** | The number $f(x)$ that a function $f$ assigns to $x$: the value of $f$ at $x$. | [1.3](module_01_EN.html#functions) |
| **variance** | The mean squared distance from the mean, $\int_{-\infty}^{\infty} (x - \mu)^2f(x)\,dx$; for the normal distribution it is $\sigma^2$. | [Ex. 12.12](module_12_EN.html#ex-12-12) |
| **vector** | A quantity with a length and a direction, drawn as an arrow; arrows with the same length and direction are the same vector. In components, $\vb{a} = \langle a_1, a_2, a_3\rangle$ in space and $\langle a_1, a_2\rangle$ in the plane. | [16.4](module_16_EN.html#components) |
| **vector equation of a line** | $\vb{r} = \vb{r}_0 + t\vb{v}$: the line through the point with position vector $\vb{r}_0$ in the direction of $\vb{v} \ne \vb{0}$. In components it gives parametric equations; solving each for $t$ gives symmetric equations. | [16.7](module_16_EN.html#lines) |
| **vector field** | A function $\vb{F}$ that assigns a vector to each point of a region: $\vb{F}(x, y) = \langle P, Q\rangle$ in the plane, $\langle P, Q, R\rangle$ in space. A function whose values are numbers is then called a scalar field. | [20.1](module_20_EN.html#fields) |
| **vector function** | A function $\vb{r}(t) = \langle f(t), g(t), h(t)\rangle$ that assigns a vector to each number $t$ of its domain; $f$, $g$ and $h$ are its component functions. Limits, continuity and derivatives are taken component by component. | [16.8](module_16_EN.html#motion) |
| **vector projection** | $\operatorname{proj}_{\vb{a}}\vb{b} = \dfrac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,\vb{a}$, for $\vb{a} \ne \vb{0}$: the shadow of $\vb{b}$ on the line of $\vb{a}$, the part of $\vb{b}$ that points along $\vb{a}$. | [16.5](module_16_EN.html#projections) |
| **vector sum** | $\vb{a} + \vb{b} = \langle a_1 + b_1, a_2 + b_2, a_3 + b_3\rangle$: walk along $\vb{a}$ and then along $\vb{b}$. The difference is $\vb{a} - \vb{b} = \vb{a} + (-1)\vb{b}$. | [16.4](module_16_EN.html#arithmetic) |
| **velocity** | For an object moving along a line with position $s(t)$, the instantaneous velocity at time $a$ is $v(a) = \lim_{h\to0}\dfrac{s(a + h) - s(a)}{h} = s'(a)$, when the limit exists. In space it is the vector $\vb{v}(t) = \vb{r}'(t)$. | [4.1](module_04_EN.html#tangents), [4.6](module_04_EN.html#motion), [16.8](module_16_EN.html#velocity) |
| **vertical asymptote** | The line $x = a$ is a vertical asymptote of the graph of $f$ if at least one of the one-sided limits of $f$ at $a$ is $\infty$ or $-\infty$. | [3.6](module_03_EN.html#infinite-limits) |
| **vertical line test** | A curve in the plane is the graph of a function of $x$ exactly when no vertical line meets it more than once. | [1.3](module_01_EN.html#graphs) |
| **vertical tangent** | The line $x = a$, when $f$ is continuous at $a$ and its difference quotients tend to $\infty$ from both sides, or to $-\infty$ from both sides, as for $x^{1/3}$ at 0. $f'(a)$ does not exist. | [4.4](module_04_EN.html#failures) |
| **virtual environment** | A folder with its own set of Python packages, kept apart from the rest of the computer: packages installed while it is active go into that folder. | [1.7](module_01_EN.html#venv) |
| **volume by slicing** | A solid between the planes $x = a$ and $x = b$ whose cross-section at $x$ has area $A(x)$, with $A$ continuous, has volume $\int_a^b A(x)\,dx$. | [12.3](module_12_EN.html#slicing) |

<div class="section-anchor" id=g-w></div>

### W

| Term | Meaning | Section |
|---|---|---|
| **washer** | A disc with a hole: the cross-section of a solid of revolution when the region does not reach the axis. With outer radius $R(x)$ and inner radius $r(x)$, the washer method gives $V = \pi\int_a^b \big(R(x)^2 - r(x)^2\big)\,dx$. | [12.3](module_12_EN.html#washers) |
| **work** | A constant force $F$ acting through a distance $d$ does work $W = Fd$; a continuous force $F(x)$ moving an object along a line from $a$ to $b$ does work $\int_a^b F(x)\,dx$. For a force vector, $W = \vb{F}\cdot\vb{D}$, and along a curve the line integral $\int_C \vb{F}\cdot d\vb{r}$. | [12.6](module_12_EN.html#work), [16.5](module_16_EN.html#dot), [20.2](module_20_EN.html#work) |

<div class="section-anchor" id=g-z></div>

### Z

| Term | Meaning | Section |
|---|---|---|
| **zero (of a function)** | A number $r$ with $p(r) = 0$, also called a root; there the graph meets the $x$-axis. | [1.4](module_01_EN.html#polynomials) |
| **zero vector** | $\vb{0} = \langle 0, 0, 0\rangle$, which has length 0 and no direction. | [16.4](module_16_EN.html#components) |
