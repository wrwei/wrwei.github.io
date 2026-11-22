---
title: Functions and change
part: 1
lead: Learn what calculus is for, then build its raw material, functions, and the families of functions it uses most. You will finish by computing average speeds over shorter and shorter time intervals, the first step towards the derivative, and, if you like, by setting up Python to check your work.
minutes: 240
needs: School algebra (fractions, powers, equations, graphs of straight lines)
goals:
  - Explain the two central problems of calculus, rates of change and accumulation
  - Find the domain and range of a function and write them in interval notation
  - Recognise and sketch the standard functions, including exponentials, logarithms and the trigonometric functions in radians
  - Transform, compose and invert functions, and predict the effect on a graph
  - Compute average rates of change and simplify difference quotients
  - Set up Python with SymPy, NumPy and matplotlib, and use them to check your work
---

## What calculus is about {#about}

Calculus is the mathematics of change. Whenever a quantity varies (the position of a car, the temperature of a cup of tea, the error of a machine-learning model as it trains), calculus asks two questions about it:

1. **How fast is it changing at this instant?** The answer is a **rate of change**.
2. **How much has built up** over a stretch of time, when the rate itself keeps changing? The answer is an **accumulation**.

::: analogy
A car's dashboard answers both questions. The speedometer shows how fast the distance travelled is changing at this instant; the odometer shows how much distance has built up. Add up the speedometer readings over time and you get the odometer reading; ask how fast the odometer reading grows and you get the speedometer reading. Calculus calls these processes **integration** and **differentiation**, and its central theorem, the Fundamental Theorem of Calculus (Module 10), says that each undoes the other.
:::

### The tangent problem and the area problem {#two-problems}

The two questions become two problems about graphs (Figure 1.1).

**The tangent problem.** A straight line has one slope, but a curve is steeper in some places than in others. What is the slope of a curve at a point $P$? Draw the line through $P$ and a second point $Q$ of the curve, a **secant line**; its slope is easy to compute. Now let $Q$ slide along the curve towards $P$. The secant lines settle on one line, the **tangent line** at $P$, and its slope is the slope of the curve at $P$. On a graph of distance against time, that slope is the speed at that instant.

**The area problem.** What is the area under a curve, between $x = a$ and $x = b$? Fill the region with thin rectangles: their total area is easy to compute and close to the area wanted. Thinner rectangles fit better, and the area is the number that their totals approach. On a graph of speed against time, that area is the distance travelled.

::: figure id=fig-01-1
The two problems of calculus. Left: as $Q$ slides along the curve towards $P$, the secant lines through $P$ and $Q$ approach the tangent line at $P$. Right: as the rectangles under the curve between $a$ and $b$ get thinner, their total area approaches the area under the curve.
:::

Both problems are solved by the same new idea: improve an approximation (the slope of a secant, a total of rectangles) step by step, and ask what number the approximations approach. That number is a **limit**, the subject of Module 2. The slope of the tangent is the **derivative** (Part II of the series); the area is the **integral** (Part III).

### A short history {#history}

The area problem is ancient. Archimedes, in the 3rd century BC, found areas and volumes with the method of exhaustion, approximating a region by simpler shapes that fill it more and more completely: an ancestor of the rectangles in Figure 1.1.

Calculus as a general method arrived in the seventeenth century, from two people working independently. Newton developed his calculus, which he called the method of fluxions, in 1665–1666, but published it late. Leibniz published the first account of the differential calculus in 1684 and of the integral calculus in 1686; his notation, with $dx$ and $\int$, is the one used today. The priority dispute that followed was bitter. Later, Cauchy in the 1820s and Weierstrass in the 1860s and 1870s gave calculus its rigorous foundation, the ε–δ definition of a limit that Module 2 presents, and Riemann defined the integral named after him in 1854 (published in 1868).

### Where calculus is used {#uses}

In science, velocity is the rate of change of position and acceleration that of velocity, so the laws of motion, like those of cooling and radioactive decay, are statements about rates: differential equations (Module 13). In engineering, electric current is the rate of change of charge, and beams, control systems and signal filters are described with derivatives and integrals. In computing, machine learning trains a model by **gradient descent**, repeatedly adjusting its parameters in the direction that reduces its error fastest, a direction computed from derivatives (Modules 8 and 17); backpropagation, which computes those derivatives in neural networks, is the chain rule of Module 5.

All these quantities are functions of something else, so this module starts with functions (Sections 1.3 to 1.5) and ends with the first step towards the derivative (Section 1.6).

## How this series works {#how-it-works}

Every idea arrives in the same order: a picture or a table of numbers, a precise definition, worked examples, and the mistakes that learners commonly make. The main theorems are proved; harder proofs and extensions sit in **Going deeper** boxes, which a first reading may skip.

The pages use these boxes:

| Box | What it holds |
|---|---|
| **Definition**, **Theorem**, **Example** | a new term, a precise statement, a worked example |
| **Proof** | why a theorem is true; it ends with ∎ |
| **Key idea**, **Tip**, **Good to know** | the point to remember, practical advice, a side remark |
| **Watch out** | a common mistake, why it is wrong, and the fix |
| **Think of it like this** | an analogy |
| **Going deeper** | optional, harder material |
| **Try it** | an interactive graph to experiment with |
| **Compute it** | optional Python |

Boxes, sections and figures are numbered within each module: Definition 1.2 is the second definition of Module 1, and Figure 1.3 its third figure.

**The Checked mark.** Worked examples and exercise solutions carry the mark ✓ Checked: their results, and the steps that lead to them, were verified with SymPy, a computer algebra system. Tables of values are computed from their formulas, and figures are drawn by plotting the functions they show.

**Exercises and quiz.** Each module ends with a summary, 10 to 12 exercises and an 8-question quiz. The exercises come at three levels: ★ check your understanding, ★★ apply, ★★★ stretch (a proof, a harder problem or an application). Each has a full worked solution under **Show solution**: try the exercise first.

**What you need.** Paper, a pencil and a scientific calculator, set to radians (Section 1.4 explains why). Python is optional: [Section 1.7](#python) shows how to install it, and every output in the Compute it boxes is what the code printed. The rest of the series makes sense without Python.

If your algebra is rusty, first work through the [Optional algebra refresher](../math/module_00_EN.html) of Mathematical Foundations for Computer Science and AI. That series also has compact calculus modules aimed at computing, from [its Module 15](../math/module_15_EN.html) on; this series is the full course.

::: tip
Read with a pencil. When an example shows a step, do it yourself before you read on; when it says "expand and collect", do the expanding.
:::

## Functions {#functions}

Drop a ball from rest. Near the Earth's surface, if air resistance is negligible, the distance it has fallen after $t$ seconds is

$$s(t) = 4.9t^2 \text{ metres}.$$

(The 4.9 is half of $g \approx 9.8$ m/s², the acceleration due to gravity.) Here is the distance at half-second intervals:

```valuetable
t = 0, 0.5, 1, 1.5, 2, 2.5, 3
$s(t)$ = 49*t**2/10
layout = columns
---
t | s(t)
0 | 0
0.5 | 1.225
1 | 4.9
1.5 | 11.025
2 | 19.6
2.5 | 30.625
3 | 44.1
```

```check
rounds(Rational(980665, 100000), '9.8')      # standard gravity is 9.80665 m/s^2
same(Rational(49, 10), Rational(98, 10)/2)   # 4.9 is half of 9.8
```

Each time $t$ gives exactly one distance $s(t)$. That is what makes $s$ a function.

::: definition Function
A **function** $f$ is a rule that assigns to each number $x$ in a set $D$ exactly one number $f(x)$. The set $D$ is the **domain** of $f$. The number $f(x)$, read "f of x", is the **value** of $f$ at $x$. The set of all values $f(x)$, as $x$ runs through the domain, is the **range** of $f$.
:::

The input $x$ is the **independent variable** and the output $y = f(x)$ the **dependent variable**. In the first four parts of this series, inputs and outputs are real numbers; the set of all real numbers is written $\R$. To say that $x$ belongs to a set $D$, write $x \in D$, read "x is in D".

"Exactly one" is the heart of the definition. The rule "the number whose square is $x$" is not a function: for $x = 9$ it gives two numbers, 3 and $-3$. A function may, however, give the same output for different inputs: $x^2$ gives 4 for both $x = 2$ and $x = -2$.

### Intervals {#intervals}

Domains and ranges are usually intervals: all the real numbers between two ends.

::: definition Intervals
For real numbers $a < b$:

| Interval | The numbers $x$ with |
|---|---|
| $[a, b]$ | $a \le x \le b$ |
| $(a, b)$ | $a < x < b$ |
| $[a, b)$ | $a \le x < b$ |
| $(a, b]$ | $a < x \le b$ |
| $[a, \infty)$ | $x \ge a$ |
| $(a, \infty)$ | $x > a$ |
| $(-\infty, b]$ | $x \le b$ |
| $(-\infty, b)$ | $x < b$ |
| $(-\infty, \infty)$ | every real $x$: this is $\R$ |

A square bracket means that the endpoint belongs to the interval; a round bracket means that it does not.
:::

$[a, b]$ is a **closed interval**, read "the closed interval from a to b"; $(a, b)$ is an **open interval**. The symbol $\infty$, read "infinity", is not a number: $[a, \infty)$ is shorthand for "all $x \ge a$", so the bracket beside $\infty$ is always round. To join intervals, use $\cup$, read "union": $(-\infty, 2) \cup (2, \infty)$ is the set of numbers in either interval, that is, every real number except 2.

::: pitfall
Writing $[3, \infty)$ for "$x > 3$". The 3 is not included, so its bracket must be round: $(3, \infty)$. And never write $[3, \infty]$: $\infty$ is not a number, so it cannot belong to an interval.
:::

### The domain of a formula {#domains}

When a function is given by a formula and nothing is said about its domain, the convention is this:

::: keyidea
The domain of a formula is the set of all real numbers for which the formula gives a real number. To find it, look for what could go wrong: so far, **division by zero** and the **square root of a negative number** (more generally, any even root). Section 1.4 adds a third: the **logarithm** of a number that is not positive.
:::

A model can have a smaller domain than its formula. $s(t) = 4.9t^2$ is defined for every real $t$, but as a description of the falling ball it applies only from $t = 0$, when the ball is dropped, until the ball lands.

::: example Domains from formulas
Find the domain of each function, in interval notation.

- (a) $f(x) = \dfrac{1}{x - 2}$
- (b) $g(x) = \sqrt{3 - x}$
- (c) $h(x) = \dfrac{\sqrt{x}}{x - 1}$

**(a)** The only danger is division by zero, which happens when $x - 2 = 0$, that is, at $x = 2$. Every other number is allowed: the domain is $(-\infty, 2) \cup (2, \infty)$.

**(b)** The square root needs $3 - x \ge 0$, that is, $x \le 3$ (add $x$ to both sides). The domain is $(-\infty, 3]$. The 3 is included, because $\sqrt{0} = 0$.

**(c)** Two conditions: $\sqrt{x}$ needs $x \ge 0$, and the denominator needs $x \ne 1$. Both must hold, so the domain is $[0, 1) \cup (1, \infty)$.

```check
from sympy.calculus.util import continuous_domain, function_range
R = S.Reals
same(solve(x - 2, x), [2])
same(continuous_domain(1/(x - 2), x, R), Union(Interval.open(-oo, 2), Interval.open(2, oo)))
same(solve_univariate_inequality(3 - x >= 0, x, relational=False), Interval(-oo, 3))
same(continuous_domain(sqrt(3 - x), x, R), Interval(-oo, 3))
same(continuous_domain(sqrt(x)/(x - 1), x, R), Union(Interval.Ropen(0, 1), Interval.open(1, oo)))
```
:::

Finding a range takes more work, because you must find which outputs actually occur. That takes two arguments: every value lies in the set you claim, and every number in that set is a value.

::: example Domain and range of a semicircle
Find the domain and the range of $f(x) = \sqrt{4 - x^2}$.

**Domain.** The square root needs $4 - x^2 \ge 0$, that is, $x^2 \le 4$, which holds exactly when $-2 \le x \le 2$. The domain is $[-2, 2]$.

**Range.** For $x$ in $[-2, 2]$, $x^2$ lies between 0 and 4, so $4 - x^2$ lies between 0 and 4, and its square root lies between $\sqrt0 = 0$ and $\sqrt4 = 2$. So every value is in $[0, 2]$. Conversely, every $y$ in $[0, 2]$ is a value: $x = \sqrt{4 - y^2}$ lies in $[0, 2]$, and, since $y \ge 0$,

$$f(x) = \sqrt{4 - (4 - y^2)} = \sqrt{y^2} = y.$$

The range is $[0, 2]$. Squaring $y = \sqrt{4 - x^2}$ gives $x^2 + y^2 = 4$ with $y \ge 0$, so the graph is the upper half of the circle of radius 2 centred at the origin. Figure 1.2 shows it with its domain and range.

```check
same(solve_univariate_inequality(x**2 <= 4, x, relational=False), Interval(-2, 2))
same(continuous_domain(sqrt(4 - x**2), x, R), Interval(-2, 2))
same(function_range(sqrt(4 - x**2), x, Interval(-2, 2)), Interval(0, 2))
same(function_range(sqrt(4 - y**2), y, Interval(0, 2)), Interval(0, 2))   # x = sqrt(4 - y^2) is in [0, 2]
yn = symbols('y', nonnegative=True)
steps(sqrt(4 - (4 - yn**2)), sqrt(yn**2), yn)
same(sqrt(4 - x**2)**2 + x**2, 4)
```
:::

### Graphs {#graphs}

::: definition Graph
The **graph** of a function $f$ is the set of all points $(x, f(x))$ in the coordinate plane with $x$ in the domain of $f$. It is the curve with equation $y = f(x)$.
:::

To read $f(a)$ from a graph, go to $x = a$ on the horizontal axis and then up or down to the graph: $f(a)$ is the height there. The domain is the set of $x$ where the graph has a point, its shadow on the $x$-axis; the range is its shadow on the $y$-axis.

**The vertical line test.** A curve in the plane is the graph of a function of $x$ exactly when no vertical line meets it more than once: the line $x = a$ meets the graph of $f$ only at $(a, f(a))$ if $a$ is in the domain, and not at all otherwise, and a second meeting point would give $a$ two values. The whole circle $x^2 + y^2 = 4$ fails the test: the line $x = 1$ meets it at $(1, \sqrt3)$ and at $(1, -\sqrt3)$. Its upper half passes: it is the graph of Example 1.2.

```check
same_set(solve(Eq(1 + y**2, 4), y), [sqrt(3), -sqrt(3)])
```

::: figure id=fig-01-2
Left: the graph of $y = \sqrt{4 - x^2}$ from Example 1.2. Its shadow on the $x$-axis (orange) is the domain $[-2, 2]$; its shadow on the $y$-axis (green) is the range $[0, 2]$. Right: the piecewise function of Example 1.3. The filled dot at $(1, 2)$ is on the graph; the hollow dot at $(1, 1)$ is not.
:::

### Piecewise functions {#piecewise}

A **piecewise** function uses different formulas on different parts of its domain. The most important one is the **absolute value**, $\abs{x}$, read "the absolute value of x":

$$\abs{x} = \begin{cases} x & \text{if } x \ge 0, \\ -x & \text{if } x < 0. \end{cases}$$

It makes every number non-negative: $\abs{5} = 5$ and $\abs{-3} = -(-3) = 3$. Geometrically, $\abs{x}$ is the distance from $x$ to 0 on the number line, and $\abs{a - b}$ the distance between $a$ and $b$; the graph of $\abs{x}$ is a V with its corner at the origin. Neural networks use another piecewise function, the **rectified linear unit**:

$$\operatorname{ReLU}(x) = \begin{cases} 0 & \text{if } x < 0, \\ x & \text{if } x \ge 0. \end{cases}$$

It is the same as $\max(0, x)$, the larger of 0 and $x$.

```check
same(Abs(5), 5); same(Abs(-3), 3); same(-(-3), 3)
xr = symbols('x', real=True)
relu = Piecewise((0, xr < 0), (xr, True))
same([relu.subs(xr, v) for v in (-2, 0, 3)], [Max(0, v) for v in (-2, 0, 3)])
```

::: example A piecewise function
Let

$$f(x) = \begin{cases} x^2 & \text{if } x < 1, \\ 3 - x & \text{if } x \ge 1. \end{cases}$$

Find $f(-1)$, $f(0.5)$, $f(1)$ and $f(2)$, and sketch the graph.

For each input, first decide which piece applies, then use its formula.

- $-1 < 1$, so $f(-1) = (-1)^2 = 1$.
- $0.5 < 1$, so $f(0.5) = 0.5^2 = 0.25$.
- $1 \ge 1$, so $f(1) = 3 - 1 = 2$. A boundary point belongs to the piece whose condition includes it, here the second.
- $2 \ge 1$, so $f(2) = 3 - 2 = 1$.

The graph (Figure 1.2, right) is the parabola $y = x^2$ to the left of $x = 1$ and the line $y = 3 - x$ from $x = 1$ on. The parabola heads for the point $(1, 1)$, but $x = 1$ is not in its piece, so a hollow dot marks the gap; the filled dot at $(1, 2)$ shows the value $f(1) = 2$. The graph jumps at $x = 1$.

```check
fpw = Piecewise((x**2, x < 1), (3 - x, True))
same([fpw.subs(x, v) for v in (-1, Rational(1, 2), 1, 2)], [1, Rational(1, 4), 2, 1])
same((x**2).subs(x, 1), 1)      # where the first piece heads: the hollow dot (1, 1)
```
:::

::: deeper What a function is, precisely
Definition 1.1 speaks of a "rule", but only the pairing of inputs with outputs matters. So mathematicians define a function to be its graph: a set $f$ of ordered pairs $(x, y)$ in which each $x$ of the domain appears exactly once, with $f(x) = y$ meaning that $(x, y)$ belongs to $f$. Then $(x + 1)^2$ and $x^2 + 2x + 1$ define the same function. One also writes $f\colon D \to \R$, read "f maps D to R".

A function in a program can print, read the clock or change other variables, so equal inputs may give different outputs. Programmers call a function **pure** if its output depends only on its input and it does nothing else; mathematical functions are pure.

```check
same(expand((x + 1)**2), x**2 + 2*x + 1)
```
:::

## A catalogue of functions {#catalogue}

A handful of families supplies almost every function in this series; Figure 1.3 shows them, and the function explorer of [Section 1.5](#transformations) draws most of them. Learn their shapes: recognising a shape saves work throughout calculus.

::: figure id=fig-01-3
The catalogue. Top row: lines with slopes 2 and $-\tfrac12$; the powers $x^2$ and $x^3$; the cubic of Example 1.4 with its zeros $-2$, 0 and 3; the rational function $1/x$. Bottom row: $\sqrt x$ and $\sqrt[3]{x}$; the exponentials $2^x$, $e^x$ and $(\tfrac12)^x$, all through $(0, 1)$; $e^x$ and its inverse $\ln x$, mirror images in the line $y = x$; and $\tan x$, undefined where $\cos x = 0$, as at $x = \pm\tfrac{\pi}{2}$ (dashed).
:::

### Linear functions {#linear}

A **linear function** has the form $f(x) = mx + b$, where $m$ and $b$ are constants. Its graph is a straight line that crosses the $y$-axis at height $b$ (the **intercept**) and has **slope** $m$. The slope is the change in $y$ per unit change in $x$: for any two points $(x_1, y_1)$ and $(x_2, y_2)$ on the line (read "x one, y one" and so on), with $x_1 \ne x_2$,

$$m = \frac{y_2 - y_1}{x_2 - x_1}.$$

The answer does not depend on which two points you take: $y_2 - y_1 = (mx_2 + b) - (mx_1 + b) = m(x_2 - x_1)$, and dividing by $x_2 - x_1$ leaves $m$.

So a linear function changes at the same rate everywhere: each step of 1 in $x$ changes $y$ by $m$. The conversion from degrees Celsius to degrees Fahrenheit, $F = 1.8C + 32$, is an example: a rise of 1 °C is a rise of 1.8 °F, whatever the temperature. For a line, "rate of change" needs no calculus. Calculus is what extends the idea to curves, whose steepness changes from point to point.

The line through $(x_1, y_1)$ with slope $m$ has the **point-slope equation** $y - y_1 = m(x - x_1)$. For example, the line through $(1, 3)$ and $(4, 9)$ has slope $\tfrac{9 - 3}{4 - 1} = 2$, so its equation is $y - 3 = 2(x - 1)$, that is, $y = 2x + 1$.

```check
x1, x2 = symbols('x1 x2')
same(expand((m*x2 + b) - (m*x1 + b)), m*(x2 - x1))
same(Rational(9 - 3, 4 - 1), 2); same(solve(Eq(y - 3, 2*(x - 1)), y), [2*x + 1]); same((2*x + 1).subs(x, 4), 9)
same(Rational(9, 5)*(c + 1) + 32 - (Rational(9, 5)*c + 32), Rational(18, 10))   # 1 degree C more is 1.8 degrees F more
```

### Powers and polynomials {#polynomials}

A **power function** is $f(x) = x^n$. For $n = 1, 2, 3, \dots$ it is defined for every real $x$. Figure 1.3 shows the two basic shapes: $x^2$ is a U-shaped parabola, symmetric about the $y$-axis, and $x^3$ climbs through the origin, symmetric about the origin. Higher even powers ($x^4, x^6, \dots$) look like $x^2$, and higher odd powers like $x^3$, but flatter near 0 and steeper further out. Negative powers are reciprocals, $x^{-n} = 1/x^n$, defined for $x \ne 0$; fractional powers are roots (below).

The two symmetries have names. A function is **even** if $f(-x) = f(x)$ for every $x$ in its domain: its graph is its own mirror image in the $y$-axis. It is **odd** if $f(-x) = -f(x)$: a half turn about the origin leaves its graph unchanged. $x^2$ is even, since $(-x)^2 = x^2$; $x^3$ is odd, since $(-x)^3 = -x^3$.

```check
same((-x)**2, x**2); same((-x)**3, -x**3); same((-x)**4, x**4); same(x**(-3), 1/x**3)
```

::: definition Polynomial
A **polynomial** is a function of the form

$$p(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_1 x + a_0,$$

where $n \ge 0$ is a whole number and the **coefficients** $a_0, a_1, \dots, a_n$ are constants. If $a_n \ne 0$, the polynomial has **degree** $n$. Its domain is $\R$.
:::

Polynomials of degree 1, 2 and 3 are linear, **quadratic** and **cubic**. A number $r$ with $p(r) = 0$ is a **zero** (or **root**) of $p$: the graph meets the $x$-axis at $x = r$. Factoring finds zeros.

::: example Zeros of a cubic
Find the zeros of $p(x) = x^3 - x^2 - 6x$.

Every term contains $x$, so take it out: $p(x) = x(x^2 - x - 6)$. To factor the quadratic, look for two numbers with product $-6$ and sum $-1$: they are $-3$ and $2$. So

$$p(x) = x(x - 3)(x + 2).$$

A product is 0 exactly when one of its factors is 0, so the zeros are $x = 0$, $x = 3$ and $x = -2$. Check by expanding: $x(x - 3)(x + 2) = x(x^2 - x - 6) = x^3 - x^2 - 6x$. The graph in Figure 1.3 meets the $x$-axis at these three points.

```check
pcub = x**3 - x**2 - 6*x
holds((-3)*2 == -6 and (-3) + 2 == -1)
same(factor(pcub), x*(x - 3)*(x + 2))
steps(x*(x - 3)*(x + 2), x*(x**2 - x - 6), pcub)
same_set(solve(pcub, x), [0, 3, -2])
```
:::

### Rational functions {#rational}

::: definition Rational function
A **rational function** is a quotient $f(x) = \dfrac{p(x)}{q(x)}$ of two polynomials, where $q$ is not the zero polynomial. Its domain is the set of all $x$ with $q(x) \ne 0$.
:::

The simplest is $f(x) = 1/x$, with domain $(-\infty, 0) \cup (0, \infty)$. Its graph (Figure 1.3) has two branches. Near $x = 0$ the values become huge, positive on the right and negative on the left; far from 0 they shrink towards 0. Module 3 studies such behaviour.

::: example A rational function with a hole
Find the domain of $r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$, and simplify the formula.

Factor the top and the bottom: $x^2 - 4 = (x - 2)(x + 2)$ (a difference of squares) and $x^2 - x - 2 = (x - 2)(x + 1)$. The denominator is 0 at $x = 2$ and at $x = -1$, so the domain is $(-\infty, -1) \cup (-1, 2) \cup (2, \infty)$.

For $x$ in the domain, $x - 2 \ne 0$, so you may cancel it: for $x \ne 2$ and $x \ne -1$,

$$r(x) = \frac{(x - 2)(x + 2)}{(x - 2)(x + 1)} = \frac{x + 2}{x + 1}.$$

The conditions matter. The formula $\dfrac{x + 2}{x + 1}$ makes sense at $x = 2$, where it gives $\tfrac43$, but $r(2)$ is not defined. So the graph of $r$ is the graph of $\dfrac{x + 2}{x + 1}$ with one point missing: a hole at $\big(2, \tfrac43\big)$. What $r$ does near $x = 2$ is the kind of question that limits answer (Module 2).

```check
rr = (x**2 - 4)/(x**2 - x - 2)
same(factor(x**2 - 4), (x - 2)*(x + 2)); same(factor(x**2 - x - 2), (x - 2)*(x + 1))
same_set(solve(x**2 - x - 2, x), [2, -1])
same(continuous_domain(rr, x, R), Union(Interval.open(-oo, -1), Interval.open(-1, 2), Interval.open(2, oo)))
same(cancel(rr), (x + 2)/(x + 1))
same(((x + 2)/(x + 1)).subs(x, 2), Rational(4, 3))
holds(rr.subs(x, 2) is S.NaN)      # r(2) is 0/0: not defined
```
:::

::: pitfall
Cancelling a factor can change the domain: carry the condition along, as in $r(x) = \dfrac{x + 2}{x + 1}$ for $x \ne 2$. And cancel common factors, never terms: $\dfrac{x + 2}{x + 1}$ is not $\dfrac{2}{1}$.
:::

### Roots {#roots}

For $x \ge 0$, the **square root** $\sqrt{x}$ is the non-negative number whose square is $x$. So $\sqrt{9} = 3$, not $\pm 3$. The equation $x^2 = 9$ has two solutions, $\sqrt9 = 3$ and $-\sqrt9 = -3$, but the symbol $\sqrt9$ means only the first. The domain and the range of $\sqrt x$ are both $[0, \infty)$; its graph is half of a parabola lying on its side (Figure 1.3).

The **cube root** $\sqrt[3]{x}$ is the number whose cube is $x$. Every real number has exactly one real cube root, so the domain is $\R$: $\sqrt[3]{8} = 2$ and $\sqrt[3]{-8} = -2$. In general the $n$th root $\sqrt[n]{x}$ is defined for every $x$ when $n$ is odd, and for $x \ge 0$ when $n$ is even. Roots are powers with fractional exponents: $x^{1/n} = \sqrt[n]{x}$ and $x^{m/n} = \big(\sqrt[n]{x}\big)^m$ (with $m/n$ in lowest terms), so $8^{2/3} = 2^2 = 4$. For a negative $x$, this series follows most calculus books and reads $x^{1/3}$ as the real cube root; Python does not, as Section 1.7 shows.

```check
same(sqrt(9), 3); same_set(solve(x**2 - 9, x), [3, -3])
same(real_root(8, 3), 2); same(real_root(-8, 3), -2); same(Integer(8)**Rational(2, 3), 4)
```

::: pitfall
$\sqrt{x^2}$ is not always $x$. For $x = -3$, $\sqrt{(-3)^2} = \sqrt9 = 3$. The square root is never negative, so

$$\sqrt{x^2} = \abs{x} \quad \text{for every real } x,$$

and $\sqrt{x^2} = x$ only when $x \ge 0$. Nor do roots split over sums: $\sqrt{9 + 16} = \sqrt{25} = 5$, not $\sqrt9 + \sqrt{16} = 7$.

```check
xr = symbols('x', real=True)
same(sqrt(xr**2), Abs(xr)); same(sqrt((-3)**2), 3)
same(sqrt(9 + 16), 5); same(sqrt(9) + sqrt(16), 7)
```
:::

### Exponential functions {#exponential}

In a power function such as $x^2$ the variable is the base. Put it in the exponent instead and you get an **exponential function** $f(x) = a^x$, with a fixed base $a > 0$. The laws of exponents hold for all bases $a, b > 0$ and all real numbers $x$ and $y$:

$$\begin{aligned} a^{x+y} &= a^x a^y, & a^{x-y} &= \frac{a^x}{a^y}, & a^0 &= 1, \\ (a^x)^y &= a^{xy}, & (ab)^x &= a^x b^x, & a^{-x} &= \frac{1}{a^x}. \end{aligned}$$

For whole-number exponents they follow from counting factors, as in $2^3 \cdot 2^2 = (2 \cdot 2 \cdot 2)(2 \cdot 2) = 2^5$; fractional exponents are roots, $a^{1/2} = \sqrt a$; and for an irrational exponent such as $\sqrt2 = 1.41421\ldots$, $a^{\sqrt2}$ is the number that $a^{1.4}, a^{1.41}, a^{1.414}, \dots$ approach. So $a^x$ is defined, and positive, for every real $x$.

```check
ap, bp = symbols('a b', positive=True)
xr, yr = symbols('x y', real=True)
same(ap**(xr + yr), ap**xr*ap**yr); same(ap**(xr - yr), ap**xr/ap**yr); same(ap**0, 1)
same((ap**xr)**yr, ap**(xr*yr)); same((ap*bp)**xr, ap**xr*bp**xr); same(ap**(-xr), 1/ap**xr)
same(2**3*2**2, 2**5); same(ap**Rational(1, 2), sqrt(ap))
rounds(sqrt(2), '1.41421')
```

If $a > 1$, $a^x$ grows: $2^x$ doubles with every step of 1 in $x$. If $0 < a < 1$, it decays: $(\tfrac12)^x$ halves with every step. Every exponential passes through $(0, 1)$, because $a^0 = 1$. For $a \ne 1$ the domain is $\R$ and the range is $(0, \infty)$.

**The number e.** One base is special: the number

$$e = 2.718281828\ldots,$$

known as Euler's number. Like $\pi$ it is irrational: its decimals never end and never repeat. The function $e^x$, read "e to the x", is called *the* exponential function, because the formulas of calculus are simplest with base $e$; Module 6 shows where $e$ comes from and why. For now, $e$ is a number between 2 and 3, $e \approx 2.71828$, so the graph of $e^x$ lies between those of $2^x$ and $3^x$.

```valuetable
x = -2, -1, 0, 1, 2, 3
$2^x$ = 2**x
$e^x$ = exp(x)
$(\tfrac12)^x$ = (1/2)**x
digits = 5
---
x | 2^x | e^x | (\tfrac12)^x
-2 | 0.25 | 0.13534 | 4
-1 | 0.5 | 0.36788 | 2
0 | 1 | 1 | 1
1 | 2 | 2.7183 | 0.5
2 | 4 | 7.3891 | 0.25
3 | 8 | 20.086 | 0.125
```

```check
rounds(E, '2.718281828'); rounds(E, '2.71828')
holds(E > 2); holds(E < 3)
holds(2**Rational(1, 2) < exp(Rational(1, 2))); holds(exp(Rational(1, 2)) < 3**Rational(1, 2))
holds(3**Rational(-1, 2) < exp(Rational(-1, 2))); holds(exp(Rational(-1, 2)) < 2**Rational(-1, 2))
```

::: example A doubling model
Suppose a colony of bacteria starts with 1000 cells and doubles every 3 hours. (The numbers are made up, but real colonies grow like this while food and space last.) After $t$ hours it has

$$N(t) = 1000 \cdot 2^{t/3}$$

cells. Find $N(0)$, $N(3)$, $N(12)$ and $N(1)$, and show that $N(t + 3) = 2N(t)$ for every $t$.

$N(0) = 1000 \cdot 2^0 = 1000$, $N(3) = 1000 \cdot 2^1 = 2000$ and $N(12) = 1000 \cdot 2^4 = 16{,}000$. For $N(1)$ you need a calculator: $N(1) = 1000 \cdot 2^{1/3} \approx 1259.9$, about 1260 cells.

By the first law of exponents,

$$\begin{aligned} N(t + 3) &= 1000 \cdot 2^{(t+3)/3} = 1000 \cdot 2^{t/3 + 1} \\ &= 1000 \cdot 2^{t/3} \cdot 2 = 2N(t). \end{aligned}$$

So the colony doubles every 3 hours, whenever you start the clock. That is the signature of exponential growth: equal steps in time multiply the quantity by equal factors.

```check
Nb = lambda T: 1000*2**(sympify(T)/3)
same(Nb(0), 1000); same(Nb(3), 2000); same(Nb(12), 16000)
rounds(Nb(1), '1259.9'); rounds(Nb(1), '1260')
steps(Nb(t + 3), 1000*2**(t/3 + 1), 1000*2**(t/3)*2, 2*Nb(t))
```
:::

::: pitfall
Two classic slips. First, $x^2$ and $2^x$ are different functions: in $x^2$ the variable is the base, in $2^x$ it is the exponent, and at $x = 10$ they are 100 and 1024. Second, exponents do not split over sums: $2^{x+3} = 2^x \cdot 2^3 = 8 \cdot 2^x$, not $2^x + 2^3$.

```check
same(10**2, 100); same(2**10, 1024); same(2**(x + 3), 8*2**x)
holds(Ne((2**(x + 3)).subs(x, 1), 2**1 + 2**3))
```
:::

### Logarithms {#logarithms}

The exponential function answers questions like "what is $2^5$?" The logarithm answers the reverse question: "what power of 2 gives 32?"

::: definition Logarithm
Let $a > 0$ with $a \ne 1$. For $x > 0$, the **logarithm of $x$ to base $a$**, written $\log_a x$ and read "log to base a of x", is the number $y$ with $a^y = x$:

$$\log_a x = y \quad\text{means}\quad a^y = x.$$

The **natural logarithm** $\ln x$, read "the natural log of x", is the logarithm to base $e$: $\ln x = y$ means $e^y = x$.
:::

For example, $\log_2 32 = 5$ because $2^5 = 32$; $\log_{10} 1000 = 3$; $\log_2 \tfrac14 = -2$ because $2^{-2} = \tfrac14$; $\ln 1 = 0$ because $e^0 = 1$; and $\ln e = 1$. Since $a^y$ is always positive, the logarithm of 0 or of a negative number is not defined: the domain of $\ln$ is $(0, \infty)$, and its range is $\R$.

The logarithm undoes the exponential, and the exponential undoes the logarithm:

$$\begin{aligned} e^{\ln x} &= x \quad \text{for } x > 0, \\ \ln\!\big(e^{y}\big) &= y \quad \text{for every real } y. \end{aligned}$$

In the language of Section 1.5, $\ln$ is the **inverse function** of $e^x$, and the graph of $\ln x$ is the graph of $e^x$ reflected in the line $y = x$ (Figure 1.3).

```check
same(log(32, 2), 5); same(log(1000, 10), 3); same(log(Rational(1, 4), 2), -2); same(log(1), 0); same(log(E), 1)
xp = symbols('x', positive=True)
same(exp(log(xp)), xp); same(log(exp(yr)), yr)
same(function_range(log(x), x, Interval.open(0, oo)), S.Reals)
```

::: theorem Laws of logarithms
For all $x > 0$, $y > 0$ and every real number $r$:

$$\begin{aligned} \ln(xy) &= \ln x + \ln y, \\ \ln\frac{x}{y} &= \ln x - \ln y, \\ \ln\big(x^r\big) &= r\ln x. \end{aligned}$$

The same laws hold for $\log_a$, for any base $a > 0$ with $a \ne 1$.
:::

::: proof
Let $p = \ln x$ and $q = \ln y$, so that $e^p = x$ and $e^q = y$. By the laws of exponents, $e^{p+q} = e^p e^q = xy$. So $p + q$ is the power of $e$ that gives $xy$, which is what $\ln(xy) = p + q$ says. In the same way, $e^{p-q} = e^p/e^q = x/y$ gives the second law, and $e^{rp} = (e^p)^r = x^r$ gives the third. The same argument works with any base $a$ in place of $e$.
:::

```check
xp, yp = symbols('x y', positive=True)
rr_ = symbols('r', real=True)
same(expand_log(log(xp*yp)), log(xp) + log(yp))
same(expand_log(log(xp/yp)), log(xp) - log(yp))
same(expand_log(log(xp**rr_)), rr_*log(xp))
same(log(xp*yp, 7), log(xp, 7) + log(yp, 7))
```

Two consequences follow. To convert between bases, write $y = \log_a x$, so that $a^y = x$; take $\ln$ of both sides and use the third law: $y \ln a = \ln x$. Since $a \ne 1$, $\ln a \ne 0$, and

$$\log_a x = \frac{\ln x}{\ln a}.$$

And to solve an equation with the unknown in an exponent, take logarithms of both sides (Example 1.7).

In computing, $\log_2 n$ counts halvings. Binary search in a sorted list of $n$ items halves the part still to be searched at every step, so it takes about $\log_2 n$ steps: only about 20 for a million items, since $\log_2 10^6 \approx 19.93$.

```check
same(log(xp, 5), log(xp)/log(5))
rounds(log(10**6, 2), '19.93'); rounds(log(10**6, 2), '20')
```

::: example Solving an exponential equation
When does the colony of Example 1.6 reach 10,000 cells?

Solve $1000 \cdot 2^{t/3} = 10{,}000$. Divide by 1000: $2^{t/3} = 10$. Take the natural logarithm of both sides and use the third law:

$$\frac{t}{3}\ln 2 = \ln 10, \quad\text{so}\quad t = \frac{3\ln 10}{\ln 2} \approx 9.966.$$

The colony passes 10,000 cells after about 9.97 hours, a little under 10 hours. Check: $9.966/3 = 3.322$, and $2^{3.322} \approx 10.00$.

```check
tr = symbols('t', real=True)
tsol = 3*log(10)/log(2)
same(solve(Eq(1000*2**(tr/3), 10000), tr), [tsol])
same(expand_log(log(2**(tr/3))), tr/3*log(2))
rounds(tsol, '9.966'); rounds(tsol, '9.97'); holds(tsol < 10)
same(Rational(9966, 1000)/3, Rational(3322, 1000))
rounds(2**Rational(3322, 1000), '10.00')
```
:::

::: pitfall
The laws of logarithms are about products, quotients and powers, not sums: $\ln(x + y)$ is not $\ln x + \ln y$, and $\dfrac{\ln x}{\ln y}$ is not $\ln\dfrac{x}{y}$. Watch the notation too: some books and calculators write $\log x$ for $\log_{10} x$, while others, and Python, write $\log x$ for $\ln x$. This series always writes the base, except in $\ln$.
:::

### Trigonometric functions {#trig}

School trigonometry measures angles in degrees. Calculus measures them in radians.

::: definition Radian
The **unit circle** is the circle of radius 1 centred at the origin. An angle at its centre that cuts off an arc of length $\theta$ on the unit circle measures $\theta$ **radians**. (The letter $\theta$ is the Greek "theta".) Angles are measured from the positive $x$-axis, anticlockwise for positive angles and clockwise for negative ones.
:::

The circumference of the unit circle is $2\pi$, so a full turn is $2\pi$ radians: $360^\circ = 2\pi$ and $180^\circ = \pi$. To convert degrees to radians, multiply by $\pi/180$. So $90^\circ = \pi/2$, $60^\circ = \pi/3$, $45^\circ = \pi/4$ and $30^\circ = \pi/6$, and one radian is $180^\circ/\pi \approx 57.30^\circ$.

Radians make calculus simplest: for a small angle $\theta$ in radians, $\sin\theta$ is almost exactly $\theta$ ($\sin 0.01 \approx 0.0099998$), and Module 5 shows that the rate of change of $\sin x$ is then $\cos x$, with no stray factor $\pi/180$. From now on, angles are in radians unless a page says otherwise.

```check
same(360*pi/180, 2*pi); same(90*pi/180, pi/2); same(60*pi/180, pi/3); same(45*pi/180, pi/4); same(30*pi/180, pi/6)
rounds(180/pi, '57.30'); rounds(sin(Rational(1, 100)), '0.0099998')
```

::: definition Sine and cosine
Let $\theta$ be any real number, and let $P$ be the point of the unit circle reached by turning from $(1, 0)$ through $\theta$ radians. Then $\cos\theta$, the **cosine** of $\theta$, is the $x$-coordinate of $P$, and $\sin\theta$, the **sine** of $\theta$, is its $y$-coordinate:

$$P = (\cos\theta, \sin\theta).$$

The other four trigonometric functions are defined from these two, wherever the denominator is not 0:

$$\begin{aligned} \tan\theta &= \frac{\sin\theta}{\cos\theta}, & \cot\theta &= \frac{\cos\theta}{\sin\theta}, \\ \sec\theta &= \frac{1}{\cos\theta}, & \csc\theta &= \frac{1}{\sin\theta}. \end{aligned}$$
:::

They are read "tangent", "cotangent", "secant" and "cosecant" (the first and third share their names with the lines of Section 1.1). For $0 < \theta < \pi/2$, the origin, $P$ and the point $(\cos\theta, 0)$ below it form a right triangle with hypotenuse 1, so these definitions agree with the school ones, "opposite over hypotenuse" and "adjacent over hypotenuse"; but the unit-circle definition works for every angle.

::: figure id=fig-01-4
Left: the point $P$ at angle $\theta$ on the unit circle has coordinates $(\cos\theta, \sin\theta)$; the orange arc has length $\theta$. Right: the graphs of $\sin x$ and $\cos x$. The blue segment has height $\sin\theta$ in both panels: as $P$ goes round the circle, its height traces the sine curve.
:::

Everything about sine and cosine can be read from the circle:

- **Range.** $P$ is on a circle of radius 1, so the domain of $\sin$ and of $\cos$ is $\R$ and their range is $[-1, 1]$.
- **The Pythagorean identity.** $P$ lies on the circle $x^2 + y^2 = 1$, so for every $\theta$
  $$\sin^2\theta + \cos^2\theta = 1,$$
  where $\sin^2\theta$ means $(\sin\theta)^2$.
- **Periodicity.** Adding $2\pi$ to $\theta$ takes $P$ once round the circle, so $\sin(\theta + 2\pi) = \sin\theta$ and $\cos(\theta + 2\pi) = \cos\theta$: sine and cosine are **periodic** with period $2\pi$ (Figure 1.4). The tangent has period $\pi$; it is undefined where $\cos\theta = 0$, at $\theta = \pi/2 + k\pi$ for every integer $k$.
- **Symmetry.** Turning through $-\theta$ gives the mirror image of $P$ in the $x$-axis, so $\cos(-\theta) = \cos\theta$ and $\sin(-\theta) = -\sin\theta$: cosine is even and sine is odd.

```check
same(sin(theta)**2 + cos(theta)**2, 1)
same(sin(theta + 2*pi), sin(theta)); same(cos(theta + 2*pi), cos(theta)); same(tan(theta + pi), tan(theta))
same_set(solveset(cos(x), x, Interval(-2*pi, 2*pi)), [-3*pi/2, -pi/2, pi/2, 3*pi/2])
same(cos(-theta), cos(theta)); same(sin(-theta), -sin(theta))
same(function_range(sin(x), x, R), Interval(-1, 1)); same(function_range(cos(x), x, R), Interval(-1, 1))
```

The exact values at the standard angles come from two triangles of school geometry, half a square and half an equilateral triangle:

| $\theta$ | $\sin\theta$ | $\cos\theta$ | $\tan\theta$ |
|---|---|---|---|
| $0$ | $0$ | $1$ | $0$ |
| $\pi/6$ | $1/2$ | $\sqrt3/2$ | $1/\sqrt3$ |
| $\pi/4$ | $\sqrt2/2$ | $\sqrt2/2$ | $1$ |
| $\pi/3$ | $\sqrt3/2$ | $1/2$ | $\sqrt3$ |
| $\pi/2$ | $1$ | $0$ | undefined |

```check
table = {0: (0, 1, 0), pi/6: (Rational(1, 2), sqrt(3)/2, 1/sqrt(3)), pi/4: (sqrt(2)/2, sqrt(2)/2, 1), pi/3: (sqrt(3)/2, Rational(1, 2), sqrt(3))}
for th_, (sv, cv, tv) in table.items():
    same(sin(th_), sv); same(cos(th_), cv); same(tan(th_), tv)
same(sin(pi/2), 1); same(cos(pi/2), 0); holds(tan(pi/2) == zoo)
```

For other angles, use the symmetry of the circle. The point at angle $\pi - \theta$ is the mirror image in the $y$-axis of the point at angle $\theta$, and the point at angle $\pi + \theta$ is its reflection through the origin, so

$$\begin{aligned} \sin(\pi - \theta) &= \sin\theta, & \cos(\pi - \theta) &= -\cos\theta, \\ \sin(\pi + \theta) &= -\sin\theta, & \cos(\pi + \theta) &= -\cos\theta. \end{aligned}$$

```check
same(sin(pi - theta), sin(theta)); same(cos(pi - theta), -cos(theta))
same(sin(pi + theta), -sin(theta)); same(cos(pi + theta), -cos(theta))
```

::: example Exact values at $2\pi/3$
Find the exact values of $\sin$, $\cos$ and $\tan$ at $\theta = 2\pi/3$, and the point of the unit circle at that angle.

$2\pi/3$ is $120^\circ$, and $2\pi/3 = \pi - \pi/3$. By the mirror symmetry in the $y$-axis,

$$\begin{aligned} \sin\frac{2\pi}{3} &= \sin\frac{\pi}{3} = \frac{\sqrt3}{2}, \\ \cos\frac{2\pi}{3} &= -\cos\frac{\pi}{3} = -\frac12, \end{aligned}$$

so

$$\tan\frac{2\pi}{3} = \frac{\sqrt3/2}{-1/2} = -\sqrt3.$$

The point is $\big(-\tfrac12, \tfrac{\sqrt3}{2}\big)$: left of the $y$-axis and above the $x$-axis, as an angle of $120^\circ$ should be. Check with the Pythagorean identity: $\big(\tfrac{\sqrt3}{2}\big)^2 + \big(-\tfrac12\big)^2 = \tfrac34 + \tfrac14 = 1$.

```check
same(2*pi/3*180/pi, 120); same(2*pi/3, pi - pi/3)
same(sin(2*pi/3), sqrt(3)/2); same(cos(2*pi/3), -Rational(1, 2))
same((sqrt(3)/2)/(-Rational(1, 2)), -sqrt(3)); same(tan(2*pi/3), -sqrt(3))
steps((sqrt(3)/2)**2 + (-Rational(1, 2))**2, Rational(3, 4) + Rational(1, 4), 1)
```
:::

::: note
Two identities from school trigonometry, the **addition formulas**, are used from Module 5 on:

$$\begin{aligned} \sin(x + y) &= \sin x\cos y + \cos x\sin y, \\ \cos(x + y) &= \cos x\cos y - \sin x\sin y. \end{aligned}$$

```check
same(expand_trig(sin(x + y)), sin(x)*cos(y) + cos(x)*sin(y))
same(expand_trig(cos(x + y)), cos(x)*cos(y) - sin(x)*sin(y))
```
:::

::: pitfall
Three common slips with trigonometric functions. A calculator in degree mode gives $\sin 30 = 0.5$; in radians, $\sin 30 \approx -0.988$, since 30 radians is almost five turns. $\sin x^2$ means $\sin(x^2)$, while $\sin^2 x$ means $(\sin x)^2$. And $\sin(x + y)$ is not $\sin x + \sin y$: use the addition formula.

```check
same(sin(30*pi/180), Rational(1, 2)); rounds(sin(30), '-0.988')
holds(Rational(9, 2) < 30/(2*pi)); holds(30/(2*pi) < 5)
holds(Ne(sin(pi/2 + pi/2), sin(pi/2) + sin(pi/2)))
```
:::

## New functions from old {#new-from-old}

### Shifting and stretching graphs {#transformations}

Compare $f(x) = x^2$ with $g(x) = (x - 2)^2$. At $x = 5$, $g$ gives $3^2 = 9$, the value that $f$ has at $x = 3$; at $x = 2$, $g$ gives 0, the value of $f$ at 0. In general $g(x) = f(x - 2)$: $g$ does at $x$ what $f$ did two units earlier. So the whole graph moves 2 units to the right.

```check
fsq = x**2
same((x - 2)**2, fsq.subs(x, x - 2)); same(((x - 2)**2).subs(x, 5), fsq.subs(x, 3)); same(((x - 2)**2).subs(x, 2), 0)
```

Each simple change to a formula moves the graph in a simple way. For a constant $c > 0$:

| Formula | The graph of $y = f(x)$ is |
|---|---|
| $f(x) + c$, $f(x) - c$ | shifted up, down by $c$ |
| $f(x - c)$, $f(x + c)$ | shifted right, left by $c$ |
| $c\,f(x)$ | stretched vertically by the factor $c$ (squashed if $c < 1$) |
| $f(cx)$ | squashed horizontally by the factor $c$ (stretched if $c < 1$) |
| $-f(x)$ | reflected in the $x$-axis |
| $f(-x)$ | reflected in the $y$-axis |

Changes outside $f$ act the way they look. Changes inside $f$ act the opposite way, because the new function reaches each value of $f$ at a different $x$: $f(x - c)$ moves the graph right, and $f(2x)$ reaches the value that $f$ has at 6 already at $x = 3$, so everything happens twice as early and the graph is squashed towards the $y$-axis.

::: widget name=function-explorer
Choose a function, then move one slider at a time: the sliders give $y = a\,f\big(b(x - c)\big) + d$, and the dashed curve is the original $y = f(x)$. Predict each move before you make it. With $f(x) = x^2$, set $c = 1$, then $d = 2$, and follow the bottom of the U; set $a = -1$ to flip the graph. Choose $\sin x$ and set $b = 2$: two waves now fit where there was one. Then build the function of Example 1.9.
:::

::: example Building a graph from $y = x^2$
Describe how to obtain the graph of $g(x) = -(x + 2)^2 + 4$ from the graph of $y = x^2$. Find the highest point of the graph of $g$, its zeros and the range of $g$.

Build $g$ in three steps, following the bottom point $(0, 0)$ of the parabola:

1. $(x + 2)^2$ is $x^2$ with $x + 2$ in place of $x$: shift left by 2. The point $(0, 0)$ moves to $(-2, 0)$.
2. $-(x + 2)^2$: reflect in the $x$-axis. The parabola now opens downwards, and $(-2, 0)$ stays where it is.
3. $-(x + 2)^2 + 4$: shift up by 4. The point moves to $(-2, 4)$.

So the graph is an upside-down parabola with its highest point at $(-2, 4)$. For the zeros, $-(x + 2)^2 + 4 = 0$ means $(x + 2)^2 = 4$, so $x + 2 = 2$ or $x + 2 = -2$, that is, $x = 0$ or $x = -4$. Since $(x + 2)^2 \ge 0$, every value of $g$ is at most 4; and every number $y \le 4$ is a value, taken at $x = -2 + \sqrt{4 - y}$. So the range is $(-\infty, 4]$. In the explorer: $f(x) = x^2$, $a = -1$, $c = -2$, $d = 4$.

```check
gq = -(x + 2)**2 + 4
same(gq, -fsq.subs(x, x + 2) + 4); same(gq.subs(x, -2), 4)
same(expand(gq), -x**2 - 4*x)
same_set(solve(Eq((x + 2)**2, 4), x), [0, -4]); same_set(solve(gq, x), [0, -4])
same(simplify(gq.subs(x, -2 + sqrt(4 - y))), y)
same(function_range(gq, x, R), Interval(-oo, 4))
```
:::

::: pitfall
$f(x - 3)$ moves the graph 3 units to the **right**, not to the left: the minus sign inside $f$ works against intuition. Check with one point: the value $f(0)$ is now reached at $x = 3$.
:::

### Composition {#composition}

To compute $\sqrt{x^2 + 1}$, you first square and add 1, then take the square root: the function is a chain of two simpler ones, $g(x) = x^2 + 1$ followed by $f(u) = \sqrt u$.

::: definition Composition
The **composition** $f \circ g$, read "f composed with g" or "f after g", is the function

$$(f \circ g)(x) = f\big(g(x)\big).$$

Its domain is the set of all $x$ in the domain of $g$ for which $g(x)$ is in the domain of $f$.
:::

The function written next to $x$ acts first: in $f \circ g$, first $g$, then $f$. In a program, composition is a pipeline in which the output of one function becomes the input of the next; a neural network is a long composition of simple functions, its layers.

::: example Composition in both orders
Let $f(x) = \sqrt{x}$ and $g(x) = x - 3$. Find $f \circ g$ and $g \circ f$ with their domains, and evaluate both at $x = 7$.

$(f \circ g)(x) = f(x - 3) = \sqrt{x - 3}$. Here $g$ accepts every $x$, and $f$ needs its input $x - 3$ to be at least 0, so the domain is $[3, \infty)$.

$(g \circ f)(x) = g(\sqrt x) = \sqrt x - 3$. Here $f$ needs $x \ge 0$, and $g$ accepts any input, so the domain is $[0, \infty)$.

At $x = 7$: $(f \circ g)(7) = \sqrt4 = 2$, while $(g \circ f)(7) = \sqrt7 - 3 \approx -0.354$. The two orders give different functions, with different domains: in composition, order matters.

```check
fc, gc = sqrt(x), x - 3
same(fc.subs(x, gc), sqrt(x - 3)); same(gc.subs(x, fc), sqrt(x) - 3)
same(continuous_domain(sqrt(x - 3), x, R), Interval(3, oo)); same(continuous_domain(sqrt(x) - 3, x, R), Interval(0, oo))
same(sqrt(x - 3).subs(x, 7), 2); rounds(sqrt(7) - 3, '-0.354')
```
:::

Seeing a complicated function as a composition is a skill that the chain rule of Module 5 depends on. For example, $h(x) = (2x + 1)^5$ is $f\big(g(x)\big)$ with **inner function** $g(x) = 2x + 1$ and **outer function** $f(u) = u^5$; and $e^{-x^2}$ is $f\big(g(x)\big)$ with $g(x) = -x^2$ and $f(u) = e^u$.

```check
same((u**5).subs(u, 2*x + 1), (2*x + 1)**5); same(exp(u).subs(u, -x**2), exp(-x**2))
same(sqrt(u).subs(u, x**2 + 1), sqrt(x**2 + 1))
```

::: pitfall
The domain of a composition comes from its pieces, not from the simplified formula. With $f(x) = x^2$ and $g(x) = \sqrt x$, $(f \circ g)(x) = (\sqrt x)^2 = x$, but only for $x \ge 0$: $g(-4)$ is not defined, so neither is $f\big(g(-4)\big)$.

```check
xnn = symbols('x', nonnegative=True)
same((xnn**2).subs(xnn, sqrt(xnn)), xnn); holds(sqrt(-4).is_real == False)
```
:::

### Inverse functions {#inverse}

The formula $F = 1.8C + 32$ turns degrees Celsius into degrees Fahrenheit, and $C = (F - 32)/1.8$ turns them back: 100 °C becomes 212 °F, and 212 °F becomes 100 °C again. Each formula undoes the other. Not every function can be undone: $x^2$ sends both 2 and $-2$ to 4, so the output 4 does not tell you the input.

```check
Fc = Rational(9, 5)*c + 32
same(solve(Eq(y, Fc), c), [(y - 32)/Rational(9, 5)])
same(Fc.subs(c, 100), 212); same((212 - 32)/Rational(9, 5), 100)
```

::: definition One-to-one function
A function $f$ is **one-to-one** if different inputs always give different outputs: whenever $x_1 \ne x_2$, $f(x_1) \ne f(x_2)$.
:::

A horizontal line $y = k$ meets the graph of $f$ where $f(x) = k$, so $f$ is one-to-one exactly when no horizontal line meets its graph more than once: the **horizontal line test**. $x^3$ and $e^x$ pass it; $x^2$ and $\sin x$ fail it.

::: definition Inverse function
Let $f$ be a one-to-one function with domain $D$ and range $R$. Its **inverse function** $f^{-1}$, read "f inverse", has domain $R$ and range $D$, and is defined by

$$f^{-1}(y) = x \quad\text{exactly when}\quad f(x) = y.$$
:::

In words, $f^{-1}$ sends each output of $f$ back to the input it came from. So the two undo each other:

$$\begin{aligned} f^{-1}\big(f(x)\big) &= x \quad \text{for every } x \text{ in } D, \\ f\big(f^{-1}(y)\big) &= y \quad \text{for every } y \text{ in } R. \end{aligned}$$

$e^x$ and $\ln x$ are the pair you met in Section 1.4: $\ln(e^x) = x$ for every real $x$, and $e^{\ln y} = y$ for every $y > 0$.

::: pitfall
$f^{-1}(x)$ does not mean $\dfrac{1}{f(x)}$: here the $-1$ is not an exponent but part of the name of the inverse. For $f(x) = 2x$, $f^{-1}(x) = x/2$, while $1/f(x) = 1/(2x)$. When you mean the reciprocal, write $\dfrac{1}{f(x)}$ or $\big(f(x)\big)^{-1}$.

```check
same(solve(Eq(y, 2*x), x), [y/2]); holds(Ne((x/2).subs(x, 2), (1/(2*x)).subs(x, 2)))   # different at x = 2
```
:::

To find a formula for $f^{-1}$, write $y = f(x)$ and solve for $x$. If each $y$ in the range comes from exactly one $x$, then $f$ is one-to-one and the solution is $x = f^{-1}(y)$. At the end, rename $y$ as $x$, so that $x$ is the input of $f^{-1}$ as usual.

::: example Finding an inverse
Show that $f(x) = \dfrac{x + 1}{x - 2}$, with $x \ne 2$, is one-to-one, and find its range and its inverse.

Write $y = \dfrac{x + 1}{x - 2}$ and solve for $x$. Multiply both sides by $x - 2$, collect the terms with $x$ on the left, and factor:

$$\begin{aligned} y(x - 2) &= x + 1 \\ yx - x &= 2y + 1 \\ x(y - 1) &= 2y + 1. \end{aligned}$$

If $y = 1$, the last line says $0 = 3$, which is impossible: the value 1 is never reached. If $y \ne 1$, divide by $y - 1$:

$$x = \frac{2y + 1}{y - 1}.$$

This $x$ is never 2 (that would need $2y + 1 = 2y - 2$, that is, $1 = -2$), so it is in the domain. Each $y \ne 1$ therefore comes from exactly one $x$: $f$ is one-to-one, its range is $(-\infty, 1) \cup (1, \infty)$, and, renaming $y$ as $x$,

$$f^{-1}(x) = \frac{2x + 1}{x - 1}, \qquad x \ne 1.$$

Check one value: $f(3) = 4/1 = 4$, and $f^{-1}(4) = 9/3 = 3$.

```check
fr = (x + 1)/(x - 2)
steps(y*(x - 2) - (x + 1), y*x - x - (2*y + 1), x*(y - 1) - (2*y + 1))   # each line as "left - right"
holds((x*(y - 1) - (2*y + 1)).subs(y, 1) == -3)                         # y = 1 gives 0 = 3
same(solve(Eq(y, fr), x), [(2*y + 1)/(y - 1)])
same(solve(Eq((2*y + 1)/(y - 1), 2), y), [])
finv = (2*x + 1)/(x - 1)
same(simplify(fr.subs(x, finv)), x); same(simplify(finv.subs(x, fr)), x)
same(function_range(fr, x, R - FiniteSet(2)), Union(Interval.open(-oo, 1), Interval.open(1, oo)))
same(fr.subs(x, 3), 4); same(finv.subs(x, 4), 3)
```
:::

The graph of an inverse comes free with the graph of $f$.

::: theorem The graph of an inverse
If $f$ is one-to-one, the graph of $f^{-1}$ is the reflection of the graph of $f$ in the line $y = x$.
:::

::: proof
A point $(p, q)$ lies on the graph of $f$ exactly when $f(p) = q$, that is, exactly when $f^{-1}(q) = p$, that is, exactly when $(q, p)$ lies on the graph of $f^{-1}$. So the graph of $f^{-1}$ consists of the points of the graph of $f$ with their coordinates swapped. Swapping the coordinates is reflection in the line $y = x$: if $p \ne q$, the midpoint $\big(\tfrac{p+q}{2}, \tfrac{p+q}{2}\big)$ of $(p, q)$ and $(q, p)$ lies on the line, and the segment joining them has slope $\tfrac{p - q}{q - p} = -1$, so it is perpendicular to the line, whose slope is 1. If $p = q$, the point is on the line and is its own mirror image.
:::

```check
pp, qq = symbols('p q')
same((pp - qq)/(qq - pp), -1); same((-1)*1, -1)
```

A function that fails the horizontal line test can often be made one-to-one by **restricting its domain**: on $[0, \infty)$, $x^2$ is one-to-one, and its inverse is $\sqrt x$. Reflecting the right half of the parabola in $y = x$ gives the half parabola lying on its side.

```check
same(sqrt(xnn**2), xnn); same(sqrt(xnn)**2, xnn)
```

## Average rates of change {#rates}

Back to the falling ball and its table in Section 1.3. Between $t = 1$ and $t = 3$ it falls $s(3) - s(1) = 44.1 - 4.9 = 39.2$ metres in 2 seconds, an average speed of $39.2/2 = 19.6$ metres per second (m/s). Between $t = 1$ and $t = 2$ it falls $19.6 - 4.9 = 14.7$ metres in 1 second: 14.7 m/s. The ball is speeding up, so the average depends on the interval. What is its speed at the instant $t = 1$, the number a speedometer on the ball would show?

```check
sb = lambda T: Rational(49, 10)*sympify(T)**2
same(sb(3), Rational(441, 10)); same(sb(1), Rational(49, 10)); same(sb(2), Rational(196, 10))
same(sb(3) - sb(1), Rational(392, 10)); same((sb(3) - sb(1))/2, Rational(196, 10))
same(sb(2) - sb(1), Rational(147, 10))
```

::: definition Average rate of change
The **average rate of change** of $f$ over the interval $[a, b]$ is

$$\frac{f(b) - f(a)}{b - a} = \frac{\Delta y}{\Delta x}.$$
:::

$\Delta$ is the Greek capital delta, used for "change in": $\Delta x = b - a$ is the change in the input, $\Delta y = f(b) - f(a)$ the change in the output, and $\Delta y/\Delta x$ is read "delta y over delta x". Its units are output units per input unit: metres per second for the ball, degrees per minute for a cooling cup of tea.

Geometrically, $\Delta y/\Delta x$ is the slope of the **secant line** through the points $(a, f(a))$ and $(b, f(b))$ of the graph. For a linear function every secant is the line itself, so the average rate of change over every interval is the slope $m$. For a curve it depends on the interval, as Figure 1.5 shows.

::: figure id=fig-01-5
The falling ball, $s(t) = 4.9t^2$. The secant lines from $(1, 4.9)$ to the points at $t = 1 + h$, for $h = 2$, 1 and 0.5, have slopes 19.6, 14.7 and 12.25: the average speeds over $[1, 3]$, $[1, 2]$ and $[1, 1.5]$. As $h$ shrinks, the secants approach the dashed tangent line at $t = 1$, whose slope is 9.8.
:::

### The difference quotient {#difference-quotient}

To study rates over shorter and shorter intervals, fix the starting point $a$ and call the length of the interval $h$.

::: definition Difference quotient
For a function $f$, a number $a$ and a number $h \ne 0$, with $a$ and $a + h$ in the domain of $f$, the **difference quotient** is

$$\frac{f(a + h) - f(a)}{h}.$$

It is the average rate of change of $f$ between $a$ and $a + h$: over $[a, a + h]$ if $h > 0$, and over $[a + h, a]$ if $h < 0$.
:::

```check
fq = Function('f')
same((fq(a + h) - fq(a))/h, (fq(a) - fq(a + h))/(a - (a + h)))   # the same number when h < 0
```

::: example The difference quotient of the falling ball
Simplify the difference quotient of $s(t) = 4.9t^2$ at $t = 1$.

Substitute $1 + h$ for $t$, keeping the brackets, and expand:

$$\begin{aligned} s(1 + h) &= 4.9(1 + h)^2 \\ &= 4.9(1 + 2h + h^2) \\ &= 4.9 + 9.8h + 4.9h^2. \end{aligned}$$

Subtract $s(1) = 4.9$: the constant terms cancel, and $s(1 + h) - s(1) = 9.8h + 4.9h^2$. Every remaining term contains $h$, so dividing by $h$ (allowed, since $h \ne 0$) gives

$$\begin{aligned} \frac{s(1 + h) - s(1)}{h} &= \frac{9.8h + 4.9h^2}{h} \\ &= 9.8 + 4.9h \qquad (h \ne 0). \end{aligned}$$

For $h = 2$, 1 and 0.5 this gives 19.6, 14.7 and 12.25, the slopes in Figure 1.5.

```check
s49 = Rational(49, 10)*t**2
steps(s49.subs(t, 1 + h), Rational(49, 10)*(1 + 2*h + h**2), Rational(49, 10) + Rational(98, 10)*h + Rational(49, 10)*h**2)
same(s49.subs(t, 1 + h) - s49.subs(t, 1), Rational(98, 10)*h + Rational(49, 10)*h**2)
steps((s49.subs(t, 1 + h) - s49.subs(t, 1))/h, (Rational(98, 10)*h + Rational(49, 10)*h**2)/h, Rational(98, 10) + Rational(49, 10)*h)
same([Rational(98, 10) + Rational(49, 10)*hh for hh in (2, 1, Rational(1, 2))], [Rational(196, 10), Rational(147, 10), Rational(1225, 100)])
```
:::

### Shrinking the interval {#shrinking}

Now let $h$ shrink. The table shows the distance fallen and the average speed over intervals that start at $t = 1$ ($h > 0$) or end there ($h < 0$):

```valuetable
h = 1, 0.1, 0.01, 0.001, -0.001, -0.01, -0.1, -1
$s(1+h) - s(1)$ = 49*(1 + h)**2/10 - 49/10
$\dfrac{s(1+h) - s(1)}{h}$ = (49*(1 + h)**2/10 - 49/10)/h
---
h | s(1+h) - s(1) | \dfrac{s(1+h) - s(1)}{h}
1 | 14.7 | 14.7
0.1 | 1.029 | 10.29
0.01 | 0.09849 | 9.849
0.001 | 0.0098049 | 9.8049
-0.001 | -0.0097951 | 9.7951
-0.01 | -0.09751 | 9.751
-0.1 | -0.931 | 9.31
-1 | -4.9 | 4.9
```

As $h$ shrinks towards 0, from either side, the average speeds settle down to 9.8 m/s. The formula $9.8 + 4.9h$ of Example 1.12 shows why: the term $4.9h$ shrinks to nothing. It is natural to call 9.8 m/s the speed of the ball at the instant $t = 1$, its **instantaneous speed**. In Figure 1.5 it is the slope of the tangent line.

::: keyidea
The instantaneous rate of change is the number that the average rates of change approach as the interval shrinks. You cannot set $h = 0$ in the difference quotient, which would become $0/0$; instead you watch what happens as $h$ gets close to 0. Module 2 makes "approach" precise: it is the idea of a **limit**. Module 4 calls the result the **derivative**.
:::

::: pitfall
When you substitute $a + h$ into a formula, replace every $x$ and keep the brackets. For $f(x) = x^2$, $f(1 + h) = (1 + h)^2 = 1 + 2h + h^2$. It is not $f(1) + h = 1 + h$, and it is not $f(1) + f(h) = 1 + h^2$. Losing the middle term $2h$ is the most common error in difference quotients.

```check
same(expand((1 + h)**2), 1 + 2*h + h**2)
```
:::

## Setting up Python {#python}

This section is optional: you need Python only for the Compute it boxes. Three free packages turn the Python programming language into a mathematical workbench: **SymPy** does exact algebra and calculus with symbols, **NumPy** computes with arrays of numbers, and **matplotlib** draws graphs.

The outputs on these pages were produced with Python 3.11.18, SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6 and matplotlib 3.11.2. At the time of writing (November 2026) the latest Python is 3.15.2; the current NumPy (2.5.5) needs Python 3.12 or later and the current matplotlib (3.11.2) needs 3.11 or later, and both offer ready-built packages for Python 3.12 to 3.15 on Windows, macOS and Linux. Newer versions may print some results differently, for example with terms in another order.

### Install Python {#install}

:::: tabs
::: tab Windows
1. In a web browser, open python.org/downloads and click **Download Python install manager**. (The **Python install manager** is also in the Microsoft Store; the two versions are identical.)
2. Double-click the downloaded file and select **Install**.
3. Open PowerShell from the Start menu and type `python`. No Python runtime is installed yet, so the install manager installs the latest release automatically. When Python starts, it shows its prompt `>>>`; type `exit()` and press Enter to leave it.

   ```terminal
   PS> python
   ```

When you first install a runtime, you will probably be asked whether to add a folder, `%LocalAppData%\Python\bin`, to your PATH. This is optional, because this series uses the `py` command, which works either way. After installation the commands `python`, `py` and `pymanager` are available.

Guides that describe the traditional full installer are out of date: it has been deprecated since Python 3.14, and it will not be produced for Python 3.16 or later.
:::
::: tab macOS
1. In a web browser, open python.org/downloads and download the macOS installer package (`.pkg`) of the latest release. It is a universal2 build, for both Apple Silicon and Intel Macs.
2. Double-click it. Click **Continue** (the Read Me), **Continue** and **Agree** (the licence), then **Install**. Installing needs an administrator account.
3. To finish, double-click **Install Certificates.command** in the `/Applications/Python 3.15/` window.
4. Open Terminal and check the version:

   ```terminal
   $ python3 --version
   ```

You start the new Python with `python3` (or `python3.15`). macOS also has its own `/usr/bin/python3`, which belongs to Apple and is usually older: do not modify or delete it.
:::
::: tab Linux
Python comes preinstalled on most Linux distributions. You need two extra parts, `venv` (virtual environments) and `pip` (the package installer). On Debian and Ubuntu:

```terminal
$ sudo apt update
$ sudo apt install python3-venv python3-pip
```

On Fedora, `sudo dnf install python3-pip python3-wheel`; on Arch, `sudo pacman -S python-pip`. Then check the version:

```terminal
$ python3 --version
```

Python 3.12 or later lets pip install the current versions of all three packages.
:::
::::

### Create a virtual environment {#venv}

A **virtual environment** is a folder with its own set of Python packages, kept apart from the rest of your computer: packages that you install while it is active go into that folder, and deleting the folder removes them. Create one for this series, in the folder where you keep your work, and activate it:

:::: tabs
::: tab Windows
```terminal
PS> py -m venv calculus_env
PS> calculus_env\Scripts\Activate.ps1
```

If PowerShell refuses to run `Activate.ps1`, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once, then activate again. (In the older Command Prompt, the second command is `calculus_env\Scripts\activate`.)
:::
::: tab macOS
```terminal
$ python3 -m venv calculus_env
$ source calculus_env/bin/activate
```
:::
::: tab Linux
```terminal
$ python3 -m venv calculus_env
$ source calculus_env/bin/activate
```
:::
::::

`deactivate` leaves the environment. Each time you open a new terminal to work on the series, go to the same folder and activate the environment again with the second command.

### Install SymPy, NumPy and matplotlib {#packages}

With the environment active, check that pip, Python's package installer, works, and then install the three packages:

:::: tabs
::: tab Windows
```terminal
PS> py -m pip --version
PS> py -m pip install sympy numpy matplotlib
```
:::
::: tab macOS
```terminal
$ python3 -m pip --version
$ python3 -m pip install sympy numpy matplotlib
```
:::
::: tab Linux
```terminal
$ python3 -m pip --version
$ python3 -m pip install sympy numpy matplotlib
```
:::
::::

Installing SymPy also installs mpmath, which SymPy uses for numbers with many digits.

To run Python code, start Python in the activated environment, with `py` on Windows or `python3` on macOS and Linux, and type the lines at the prompt `>>>`; or save them in a file such as `first.py` and run `py first.py` or `python3 first.py`. All the code of the series is in [calculus-code.zip](calculus-code.zip), one script per module.

::: trouble
- **macOS: `python3 --version` shows an older version than the one you installed.** That is Apple's own Python. Use `python3.15` in place of `python3` to create the environment (`python3.15 -m venv calculus_env`); once the environment is active, `python3` is the right one. Leave Apple's Python alone.
- **Linux: `python3 -m venv` fails.** On Debian and Ubuntu, install the missing parts with `sudo apt install python3-venv python3-pip` and try again.
- **`ModuleNotFoundError: No module named 'sympy'`.** Python cannot find the packages, usually because the environment is not active in this terminal. Activate it and try again; if the error remains, install the packages again with the environment active.
:::

### A first session {#first-session}

The four boxes below revisit this module with Python; compare what you see with the outputs shown.

::: compute Symbols, substitution, factoring and expanding
SymPy works with **symbols**, names for unknown numbers, which you create with `symbols`. Then you can build expressions, substitute numbers into them with `subs`, and `factor` and `expand` them:

```python
import sympy as sp
x = sp.symbols('x')            # x is now a symbol, a name for a number
p = x**3 - x**2 - 6*x          # ** is a power; write * for every product
print(p.subs(x, 4))            # substitute 4 for x: p(4)
print(sp.factor(p))
print(sp.expand((x + 2)*(x - 3)))
```

```output
24
x*(x - 3)*(x + 2)
x**2 - x - 6
```

These are the polynomial of Example 1.4, its value $p(4) = 64 - 16 - 24 = 24$, its factored form, and one product expanded. Powers need `**`: in Python the symbol `^` means something else.

```python fails
print(x^2)
```

```output
TypeError: unsupported operand type(s) for ^: 'Symbol' and 'int'
```

Between whole numbers, `^` combines their binary digits, so `2^3` is 1, without complaint. Next, `simplify` looks for a simpler form of an expression; try it on the rational function of Example 1.5:

```python
r = (x**2 - 4)/(x**2 - x - 2)
print(sp.simplify(r))
print(r.subs(x, 2))
```

```output
(x + 2)/(x + 1)
nan
```

SymPy cancels the factor $x - 2$ without mentioning that $x \ne 2$: the pitfall of Section 1.4 is yours to remember. Substituting 2 into $r$ itself gives `nan`, "not a number", since it is $0/0$.
:::

```check
same((x**3 - x**2 - 6*x).subs(x, 4), 24); same(64 - 16 - 24, 24)
```

::: compute Exact numbers and decimals
SymPy keeps numbers exact unless you ask for decimals. Write 4.9 as the fraction `sp.Rational(49, 10)` and let SymPy simplify the difference quotient of Example 1.12:

```python
import sympy as sp
t, h = sp.symbols('t h')
s = sp.Rational(49, 10)*t**2                 # 4.9 t^2, with 4.9 kept exact
q = (s.subs(t, 1 + h) - s.subs(t, 1))/h      # the difference quotient at t = 1
print(q)
print(sp.simplify(q))
```

```output
(49*(h + 1)**2/10 - 49/10)/h
49*h/10 + 49/5
```

$\tfrac{49h}{10} + \tfrac{49}{5}$ is $4.9h + 9.8$, the answer of Example 1.12, with the terms in SymPy's order. `sp.N` turns an exact number into a decimal, with 15 significant digits unless you ask for more:

```python
print(sp.sqrt(8), sp.N(sp.sqrt(8)))
print(sp.N(sp.E), sp.N(sp.pi, 30))
print(sp.N(3*sp.log(10)/sp.log(2), 4))       # Example 1.7; log is ln
```

```output
2*sqrt(2) 2.82842712474619
2.71828182845905 3.14159265358979323846264338328
9.966
```

SymPy keeps $\sqrt8$ exact, as $2\sqrt2$. In SymPy, as in Python's `math` module, `log` is the natural logarithm $\ln$; write `sp.log(x, 10)` for $\log_{10} x$.
:::

```check
same(Rational(49, 10)*h + Rational(49, 5), Rational(98, 10) + Rational(49, 10)*h)
same(sqrt(8), 2*sqrt(2))
```

::: compute Python's own arithmetic: radians, rounding and domains
Python's `math` module computes with **floating-point numbers**, the computer's fast approximations to real numbers, which keep about 16 significant digits:

```python
import math
print(math.sin(math.pi/6))           # sin(pi/6) is exactly 1/2
print(math.sin(30))                  # 30 radians, not 30 degrees
print(math.sin(math.radians(30)))    # convert 30 degrees to radians first
print(math.log(math.e**2), math.log10(1000))
```

```output
0.49999999999999994
-0.9880316240928618
0.49999999999999994
2.0 3.0
```

Three lessons. Python's trigonometric functions work in radians; `math.radians` converts degrees. Floating-point results can be off in the last digit, so $\sin(\pi/6)$ comes out a hair below 0.5 (SymPy's `sp.sin(sp.pi/6)` is exactly `1/2`); Module 2 shows when such errors matter. And `math.log` is $\ln$. Two more surprises:

```python
print((-8)**(1/3))
print(math.cbrt(-8))
```

```output
(1.0000000000000002+1.7320508075688772j)
-2.0
```

Python raises a negative number to a fractional power as a complex number (the `j` marks its imaginary part), not as the real cube root $-2$ that this series means by $(-8)^{1/3}$; `math.cbrt` gives the real cube root. And outside the domain of a function, Python refuses:

```python fails
print(math.sqrt(-4))
```

```output
ValueError: math domain error
```

Python 3.11 calls this a "math domain error"; other versions may word the message differently.
:::

::: compute Numbers and pictures: lambdify, NumPy and matplotlib
`sp.lambdify` turns a SymPy formula into a fast numerical function, which accepts a NumPy **array**, a list of numbers that arithmetic acts on all at once:

```python
import sympy as sp
import numpy as np
t = sp.symbols('t')
s = sp.lambdify(t, 4.9*t**2)       # the formula as a numerical function
ts = np.linspace(0, 3, 7)          # 7 equally spaced times from 0 to 3
print(ts)
print(s(ts))                       # s at all seven times at once
```

```output
[0.  0.5 1.  1.5 2.  2.5 3. ]
[ 0.     1.225  4.9   11.025 19.6   30.625 44.1  ]
```

The second line is the table of Section 1.3. Now the average speeds of Section 1.6:

```python
for h in [0.1, 0.01, 0.001]:
    print(h, (s(1 + h) - s(1))/h)
```

```output
0.1 10.290000000000008
0.01 9.848999999999997
0.001 9.804899999998895
```

The exact values are 10.29, 9.849 and 9.8049, so the computer's answers are wrong in their last few digits. Module 2 explains why, and why the error grows if $h$ shrinks much further. Finally, a graph:

```python
import matplotlib.pyplot as plt
ts = np.linspace(0, 3, 200)
plt.plot(ts, s(ts))
plt.xlabel('t (seconds)')
plt.ylabel('distance fallen (metres)')
plt.show()
```

A window opens with the graph of $s$: the curve of Figure 1.5, without its secant lines. Close the window to finish.
:::

```check
for hh in (Rational(1, 10), Rational(1, 100), Rational(1, 1000)):
    same(Rational(98, 10) + Rational(49, 10)*hh, (Rational(49, 10)*(1 + hh)**2 - Rational(49, 10))/hh)
same([Rational(98, 10) + Rational(49, 10)*hh for hh in (Rational(1, 10), Rational(1, 100), Rational(1, 1000))], [Rational(1029, 100), Rational(9849, 1000), Rational(98049, 10000)])
```

## What you learned {#summary}

- Calculus studies how fast quantities change (the tangent problem, leading to derivatives) and how much builds up (the area problem, leading to integrals); both are answered with limits.
- A function assigns to each input in its domain exactly one output; the range is the set of outputs. Intervals such as $[0, 2]$ and $(-\infty, 2) \cup (2, \infty)$ describe domains and ranges.
- The domain of a formula leaves out division by zero, even roots of negative numbers and logarithms of numbers that are not positive; a model may restrict it further.
- The graph of $f$ is the set of points $(x, f(x))$; no vertical line meets it twice. Piecewise functions use different formulas on different parts of the domain, with filled and hollow dots at the boundaries.
- The catalogue: linear functions (constant rate of change $m$), powers and polynomials, rational functions, roots, exponentials $a^x$ and $e^x$ with $e \approx 2.71828$, logarithms with $\ln$ the inverse of $e^x$, and the trigonometric functions, defined from the unit circle in radians.
- $f(x - c)$ shifts a graph right and $f(x) + c$ up; $c\,f(x)$ stretches it vertically and $f(cx)$ squashes it horizontally. $(f \circ g)(x) = f\big(g(x)\big)$ applies $g$ first. A one-to-one function has an inverse, whose graph is the mirror image in $y = x$.
- The average rate of change $\dfrac{f(b) - f(a)}{b - a}$ is the slope of a secant line, and the difference quotient $\dfrac{f(a + h) - f(a)}{h}$ is the average rate over an interval of length $h$. As $h$ shrinks, it approaches the instantaneous rate: the idea behind limits (Module 2) and derivatives (Module 4).
- SymPy (`symbols`, `subs`, `expand`, `factor`, `simplify`, `N`, `lambdify`), NumPy and matplotlib check and explore all of this; floating-point arithmetic is approximate in its last digits.

```check
rounds(E, '2.71828')
```

## Exercises {#exercises}

:::: exercise Domains in interval notation {#ex-1-1} ★
Find the domain of each function, and write it in interval notation.

- (a) $f(x) = \sqrt{5 - 2x}$
- (b) $g(x) = \dfrac{1}{x^2 - 9}$
- (c) $h(x) = \dfrac{\ln(x + 4)}{x}$

::: solution
**(a)** The square root needs $5 - 2x \ge 0$, that is, $2x \le 5$, that is, $x \le \tfrac52$. The domain is $\big(-\infty, \tfrac52\big]$, with $\tfrac52$ included because $\sqrt0 = 0$.

**(b)** The denominator must not be 0. $x^2 - 9 = 0$ when $x^2 = 9$, at $x = 3$ and at $x = -3$. The domain is $(-\infty, -3) \cup (-3, 3) \cup (3, \infty)$. Forgetting $x = -3$ is the common slip: $x^2 = 9$ has two solutions.

**(c)** Two conditions. The logarithm needs $x + 4 > 0$, that is, $x > -4$; the division needs $x \ne 0$. The domain is $(-4, 0) \cup (0, \infty)$. The $-4$ is excluded, because $\ln 0$ is not defined.

```check
same(solve_univariate_inequality(5 - 2*x >= 0, x, relational=False), Interval(-oo, Rational(5, 2)))
same(continuous_domain(sqrt(5 - 2*x), x, R), Interval(-oo, Rational(5, 2)))
same_set(solve(x**2 - 9, x), [3, -3])
same(continuous_domain(1/(x**2 - 9), x, R), Union(Interval.open(-oo, -3), Interval.open(-3, 3), Interval.open(3, oo)))
same(continuous_domain(log(x + 4)/x, x, R), Union(Interval.open(-4, 0), Interval.open(0, oo)))
```
:::
::::

:::: exercise Reading a piecewise function {#ex-1-2} ★
Let

$$f(x) = \begin{cases} 2x + 1 & \text{if } x \le 1, \\ x^2 - 1 & \text{if } x > 1. \end{cases}$$

- (a) Find $f(-2)$, $f(1)$, $f(2)$ and $f(3)$.
- (b) Solve $f(x) = 3$.
- (c) Describe the graph near $x = 1$: where is there a filled dot, and where a hollow one?

::: solution
**(a)** Decide the piece first. $-2 \le 1$, so $f(-2) = 2(-2) + 1 = -3$. $1 \le 1$, so $f(1) = 2 + 1 = 3$. $2 > 1$, so $f(2) = 4 - 1 = 3$. $3 > 1$, so $f(3) = 9 - 1 = 8$.

**(b)** Solve on each piece, and keep only the solutions that lie in that piece. On the first piece, $2x + 1 = 3$ gives $x = 1$, and $1 \le 1$, so it counts. On the second, $x^2 - 1 = 3$ gives $x = 2$ or $x = -2$, but only $x = 2$ satisfies $x > 1$ (indeed $f(-2) = -3$). The solutions are $x = 1$ and $x = 2$.

**(c)** The line $y = 2x + 1$ ends at $(1, 3)$, which is on the graph: a filled dot. To the right of $x = 1$ the graph follows the parabola $y = x^2 - 1$, which heads for $(1, 0)$; that point is not on the graph: a hollow dot. The graph jumps down at $x = 1$.

```check
fe = Piecewise((2*x + 1, x <= 1), (x**2 - 1, True))
same([fe.subs(x, v) for v in (-2, 1, 2, 3)], [-3, 3, 3, 8])
same(solve(Eq(2*x + 1, 3), x), [1]); same_set(solve(Eq(x**2 - 1, 3), x), [2, -2])
same_set([v for v in (1, 2, -2) if fe.subs(x, v) == 3], [1, 2])
same((x**2 - 1).subs(x, 1), 0)
```
:::
::::

:::: exercise Radians and exact values {#ex-1-3} ★
- (a) Convert $225^\circ$ and $-60^\circ$ to radians, and $5\pi/6$ to degrees.
- (b) Find the exact values of $\sin\theta$ and $\cos\theta$ for $\theta = 3\pi/4$, $7\pi/6$ and $-\pi/3$.

::: solution
**(a)** Multiply degrees by $\pi/180$: $225 \cdot \dfrac{\pi}{180} = \dfrac{5\pi}{4}$ and $-60 \cdot \dfrac{\pi}{180} = -\dfrac{\pi}{3}$. To go back, multiply by $180/\pi$: $\dfrac{5\pi}{6} \cdot \dfrac{180}{\pi} = 150^\circ$.

**(b)** Use the standard angles and the symmetries of the circle.

- $3\pi/4 = \pi - \pi/4$, the mirror image of $\pi/4$ in the $y$-axis: $\sin\dfrac{3\pi}{4} = \sin\dfrac{\pi}{4} = \dfrac{\sqrt2}{2}$ and $\cos\dfrac{3\pi}{4} = -\cos\dfrac{\pi}{4} = -\dfrac{\sqrt2}{2}$.
- $7\pi/6 = \pi + \pi/6$, the reflection of $\pi/6$ through the origin: $\sin\dfrac{7\pi}{6} = -\sin\dfrac{\pi}{6} = -\dfrac12$ and $\cos\dfrac{7\pi}{6} = -\cos\dfrac{\pi}{6} = -\dfrac{\sqrt3}{2}$.
- $-\pi/3$ is the mirror image of $\pi/3$ in the $x$-axis: $\sin\Big(-\dfrac{\pi}{3}\Big) = -\sin\dfrac{\pi}{3} = -\dfrac{\sqrt3}{2}$ and $\cos\Big(-\dfrac{\pi}{3}\Big) = \cos\dfrac{\pi}{3} = \dfrac12$.

```check
same(225*pi/180, 5*pi/4); same(-60*pi/180, -pi/3); same(5*pi/6*180/pi, 150)
same(sin(3*pi/4), sqrt(2)/2); same(cos(3*pi/4), -sqrt(2)/2)
same(sin(7*pi/6), -Rational(1, 2)); same(cos(7*pi/6), -sqrt(3)/2)
same(sin(-pi/3), -sqrt(3)/2); same(cos(-pi/3), Rational(1, 2))
same(3*pi/4, pi - pi/4); same(7*pi/6, pi + pi/6)
```
:::
::::

:::: exercise Logarithms and exponentials {#ex-1-4} ★
Without a calculator, find:

- (a) $\log_2 32$
- (b) $\log_{10} 0.001$
- (c) $\ln\big(e^5\big)$
- (d) $e^{\ln 7}$
- (e) $\ln 12 - \ln 3 + \ln 2$, written as a single logarithm.

Then (f) solve $e^{2x} = 7$, giving the exact answer and its value to three decimal places.

::: solution
**(a)** $2^5 = 32$, so $\log_2 32 = 5$.

**(b)** $0.001 = 10^{-3}$, so $\log_{10} 0.001 = -3$.

**(c)** $\ln$ undoes $e^x$: $\ln\big(e^5\big) = 5$.

**(d)** $e^x$ undoes $\ln$, for positive inputs: $e^{\ln 7} = 7$.

**(e)** By the laws of logarithms, $\ln 12 - \ln 3 = \ln\dfrac{12}{3} = \ln 4$, and $\ln 4 + \ln 2 = \ln 8$. Since $8 = 2^3$, this is also $3\ln 2$.

**(f)** Take $\ln$ of both sides: $\ln\big(e^{2x}\big) = 2x$, so $2x = \ln 7$ and
$$x = \frac{\ln 7}{2} \approx 0.973.$$
Check: $e^{2 \cdot 0.973} = e^{1.946} \approx 7.00$.

```check
same(log(32, 2), 5); same(log(Rational(1, 1000), 10), -3); same(log(exp(5)), 5); same(exp(log(7)), 7)
same(log(12) - log(3) + log(2), log(8)); same(log(8), 3*log(2))
xs = solve(Eq(exp(2*symbols('x', real=True)), 7))
same(xs, [log(7)/2]); rounds(log(7)/2, '0.973')
same(2*Rational(973, 1000), Rational(1946, 1000)); rounds(exp(Rational(1946, 1000)), '7.00')
```
:::
::::

:::: exercise Transforming the square root {#ex-1-5} ★★
Start from the graph of $y = \sqrt x$.

- (a) Write the formula of the graph obtained by shifting it 3 units to the left, then stretching it vertically by the factor 2, then shifting it down by 1.
- (b) Find the domain and the range of the new function.
- (c) Where does its graph cross the $x$-axis?

Check your answers with the function explorer of Section 1.5.

::: solution
**(a)** Shifting left by 3 replaces $x$ by $x + 3$: $y = \sqrt{x + 3}$. Stretching vertically by 2 multiplies the outputs by 2: $y = 2\sqrt{x + 3}$. Shifting down by 1 subtracts 1:
$$y = 2\sqrt{x + 3} - 1.$$

**(b)** The square root needs $x + 3 \ge 0$, so the domain is $[-3, \infty)$. As $x$ runs through $[-3, \infty)$, $x + 3$ runs through $[0, \infty)$, so $\sqrt{x + 3}$ takes every value in $[0, \infty)$; doubling keeps $[0, \infty)$, and subtracting 1 gives $[-1, \infty)$. The range is $[-1, \infty)$: the starting point $(0, 0)$ of the graph has moved to $(-3, -1)$.

**(c)** Solve $2\sqrt{x + 3} - 1 = 0$: $\sqrt{x + 3} = \tfrac12$, so $x + 3 = \tfrac14$ (square both sides) and $x = -\tfrac{11}{4} = -2.75$. Squaring can introduce false solutions, so check: $2\sqrt{0.25} - 1 = 2 \cdot 0.5 - 1 = 0$.

In the explorer: $f(x) = \sqrt x$, $a = 2$, $c = -3$, $d = -1$.

```check
g5 = 2*sqrt(x + 3) - 1
same(g5, 2*sqrt(x).subs(x, x + 3) - 1)
same(continuous_domain(g5, x, R), Interval(-3, oo)); same(function_range(g5, x, Interval(-3, oo)), Interval(-1, oo))
same(g5.subs(x, -3), -1)
same(solve(Eq(g5, 0), x), [-Rational(11, 4)]); same(-Rational(11, 4), -Rational(275, 100))
same(g5.subs(x, -Rational(11, 4)), 0)
```
:::
::::

:::: exercise Composition and domains {#ex-1-6} ★★
Let $f(x) = \dfrac{1}{x}$ and $g(x) = x^2 - 4$. Find each composition and its domain:

- (a) $f \circ g$
- (b) $g \circ f$
- (c) $f \circ f$

::: solution
**(a)** $(f \circ g)(x) = f(x^2 - 4) = \dfrac{1}{x^2 - 4}$. $g$ accepts every $x$, and $f$ needs its input $x^2 - 4$ to be non-zero, so $x \ne 2$ and $x \ne -2$. The domain is $(-\infty, -2) \cup (-2, 2) \cup (2, \infty)$.

**(b)** $(g \circ f)(x) = g\Big(\dfrac1x\Big) = \dfrac{1}{x^2} - 4$. $f$ needs $x \ne 0$, and $g$ accepts any input, so the domain is $(-\infty, 0) \cup (0, \infty)$.

**(c)** $(f \circ f)(x) = f\Big(\dfrac1x\Big) = \dfrac{1}{1/x} = x$, but only for $x \ne 0$: $f(0)$ is not defined, so neither is $f\big(f(0)\big)$. The domain is $(-\infty, 0) \cup (0, \infty)$, not $\R$. The common wrong answer, $\R$, reads the domain off the simplified formula $x$; the domain comes from the pieces. (On its domain, $f$ undoes itself: $f$ is its own inverse.)

```check
f6, g6 = 1/x, x**2 - 4
same(f6.subs(x, g6), 1/(x**2 - 4)); same(g6.subs(x, f6), 1/x**2 - 4); same(f6.subs(x, f6), x)
same(continuous_domain(1/(x**2 - 4), x, R), Union(Interval.open(-oo, -2), Interval.open(-2, 2), Interval.open(2, oo)))
same(continuous_domain(1/x**2 - 4, x, R), Union(Interval.open(-oo, 0), Interval.open(0, oo)))
same(continuous_domain(f6, x, R), Union(Interval.open(-oo, 0), Interval.open(0, oo)))
```
:::
::::

:::: exercise An inverse with a logarithm {#ex-1-7} ★★
Let $f(x) = e^{x - 1} + 2$.

- (a) Find the domain and the range of $f$.
- (b) Show that $f$ is one-to-one, and find $f^{-1}(x)$.
- (c) State the domain and the range of $f^{-1}$, and check that $f\big(f^{-1}(x)\big) = x$.

::: solution
**(a)** $e^{x - 1}$ is defined for every $x$, so the domain is $\R$. As $x$ runs through $\R$, so does $x - 1$, and $e^{x-1}$ takes every positive value (each $v > 0$ is $e^u$ for $u = \ln v$) and no other. So $e^{x - 1} + 2$ takes every value greater than 2: the range is $(2, \infty)$.

**(b)** Write $y = e^{x - 1} + 2$ and solve for $x$. Subtract 2: $y - 2 = e^{x - 1}$. For $y$ in the range, $y - 2 > 0$, so you may take $\ln$ of both sides: $\ln(y - 2) = x - 1$, and
$$x = 1 + \ln(y - 2).$$
Each $y$ in the range comes from exactly this one $x$, so $f$ is one-to-one. Renaming $y$ as $x$: $f^{-1}(x) = 1 + \ln(x - 2)$.

**(c)** The domain of $f^{-1}$ is the range of $f$, $(2, \infty)$; this is exactly where $\ln(x - 2)$ is defined. The range of $f^{-1}$ is the domain of $f$, $\R$. Check, for $x > 2$:
$$\begin{aligned} f\big(f^{-1}(x)\big) &= e^{(1 + \ln(x - 2)) - 1} + 2 \\ &= e^{\ln(x - 2)} + 2 \\ &= (x - 2) + 2 = x. \end{aligned}$$

```check
f7 = exp(x - 1) + 2
same(function_range(f7, x, R), Interval.open(2, oo))
yb = symbols('y', real=True)
same(solve(Eq(yb, f7), x), [1 + log(yb - 2)])
xg = symbols('x', positive=True)
xg2 = xg + 2                       # an x greater than 2
finv7 = 1 + log(xg2 - 2)
steps(f7.subs(x, finv7), exp(log(xg2 - 2)) + 2, (xg2 - 2) + 2, xg2)
same(continuous_domain(1 + log(x - 2), x, R), Interval.open(2, oo))
same(function_range(1 + log(x - 2), x, Interval.open(2, oo)), S.Reals)
```
:::
::::

:::: exercise Average rates of a cube {#ex-1-8} ★★
Let $f(x) = x^3$.

- (a) Find the average rate of change of $f$ over $[1, 2]$, over $[1, 1.1]$ and over $[1, 1.01]$.
- (b) Simplify the difference quotient $\dfrac{f(1 + h) - f(1)}{h}$, for $h \ne 0$.
- (c) What number do the average rates approach as $h$ shrinks?

::: solution
**(a)** Use $\dfrac{f(b) - f(a)}{b - a}$:
$$\begin{aligned} \frac{8 - 1}{2 - 1} &= 7, \\ \frac{1.331 - 1}{0.1} &= 3.31, \\ \frac{1.030301 - 1}{0.01} &= 3.0301. \end{aligned}$$

**(b)** Expand $(1 + h)^3$: first $(1 + h)^2 = 1 + 2h + h^2$, then multiply by $1 + h$ and collect terms, to get $(1 + h)^3 = 1 + 3h + 3h^2 + h^3$. So
$$\begin{aligned} \frac{f(1 + h) - f(1)}{h} &= \frac{3h + 3h^2 + h^3}{h} \\ &= 3 + 3h + h^2 \qquad (h \ne 0). \end{aligned}$$
This agrees with (a): $h = 1$, 0.1 and 0.01 give 7, 3.31 and 3.0301.

**(c)** As $h$ shrinks, $3h$ and $h^2$ shrink to nothing, so the average rates approach 3. This is the slope of the curve $y = x^3$ at the point $(1, 1)$, its instantaneous rate of change there.

```check
fc8 = lambda X: sympify(X)**3
same((fc8(2) - fc8(1))/1, 7)
same(fc8(Rational(11, 10)), Rational(1331, 1000)); same((fc8(Rational(11, 10)) - 1)/Rational(1, 10), Rational(331, 100))
same(fc8(Rational(101, 100)), Rational(1030301, 1000000)); same((fc8(Rational(101, 100)) - 1)/Rational(1, 100), Rational(30301, 10000))
same(expand((1 + h)**3), 1 + 3*h + 3*h**2 + h**3)
steps((fc8(1 + h) - fc8(1))/h, (3*h + 3*h**2 + h**3)/h, 3 + 3*h + h**2)
same([(3 + 3*h + h**2).subs(h, v) for v in (1, Rational(1, 10), Rational(1, 100))], [7, Rational(331, 100), Rational(30301, 10000)])
```
:::
::::

:::: exercise The difference quotient of 1/x {#ex-1-9} ★★
Let $f(x) = \dfrac1x$, and let $a \ne 0$.

- (a) Show that, for $h \ne 0$ with $a + h \ne 0$,
  $$\frac{f(a + h) - f(a)}{h} = -\frac{1}{a(a + h)}.$$
- (b) Evaluate it for $a = 2$ with $h = 0.1$ and with $h = -0.1$, to four decimal places.
- (c) What does it approach as $h$ shrinks? Why is it negative?

::: solution
**(a)** Put the two fractions over the common denominator $a(a + h)$:
$$\begin{aligned} f(a + h) - f(a) &= \frac{1}{a + h} - \frac1a \\ &= \frac{a - (a + h)}{a(a + h)} = \frac{-h}{a(a + h)}. \end{aligned}$$
Dividing by $h$ (allowed, since $h \ne 0$) gives $-\dfrac{1}{a(a + h)}$.

**(b)** For $a = 2$ and $h = 0.1$: $-\dfrac{1}{2 \cdot 2.1} = -\dfrac{1}{4.2} \approx -0.2381$. For $h = -0.1$: $-\dfrac{1}{2 \cdot 1.9} = -\dfrac{1}{3.8} \approx -0.2632$.

**(c)** As $h$ shrinks, $a + h$ approaches $a$, so the quotient approaches $-\dfrac{1}{a^2}$; for $a = 2$ that is $-\tfrac14 = -0.25$, between the two values of (b). It is negative because $1/x$ decreases on each side of 0: when the input increases, the output decreases, so $\Delta y$ and $\Delta x$ have opposite signs.

```check
steps((1/(a + h) - 1/a), (a - (a + h))/(a*(a + h)), -h/(a*(a + h)))
same((1/(a + h) - 1/a)/h, -1/(a*(a + h)))
q9 = lambda hv: -1/(2*(2 + hv))
same(q9(Rational(1, 10)), -1/Rational(42, 10)); rounds(q9(Rational(1, 10)), '-0.2381')
same(q9(-Rational(1, 10)), -1/Rational(38, 10)); rounds(q9(-Rational(1, 10)), '-0.2632')
same((-1/(a*(a + h))).subs(h, 0), -1/a**2); same(-1/Integer(2)**2, -Rational(1, 4))
holds(q9(Rational(1, 10)) > -Rational(1, 4)); holds(-Rational(1, 4) > q9(-Rational(1, 10)))
```
:::
::::

:::: exercise Increasing functions are one-to-one {#ex-1-10} ★★★
A function $f$ is **strictly increasing** if, for all $x_1$ and $x_2$ in its domain, $x_1 < x_2$ implies $f(x_1) < f(x_2)$.

- (a) Prove that a strictly increasing function is one-to-one.
- (b) Prove that its inverse is strictly increasing too.
- (c) Show that $f(x) = x^3 + x$ is strictly increasing on $\R$, and so has an inverse function. (Hint: $x_2^3 - x_1^3 = (x_2 - x_1)\big(x_2^2 + x_1 x_2 + x_1^2\big)$.)

::: solution
**(a)** Let $x_1 \ne x_2$ be in the domain, named so that $x_1 < x_2$. Since $f$ is strictly increasing, $f(x_1) < f(x_2)$; in particular $f(x_1) \ne f(x_2)$. Different inputs give different outputs, so $f$ is one-to-one.

**(b)** By (a), $f$ has an inverse. Let $y_1 < y_2$ be in the range of $f$, and let $x_1 = f^{-1}(y_1)$ and $x_2 = f^{-1}(y_2)$, so that $f(x_1) = y_1$ and $f(x_2) = y_2$. If $x_1 = x_2$, then $y_1 = y_2$; if $x_2 < x_1$, then $f(x_2) < f(x_1)$, that is, $y_2 < y_1$. Both contradict $y_1 < y_2$, so $x_1 < x_2$: $f^{-1}$ is strictly increasing.

**(c)** Let $x_1 < x_2$. Using the hint,
$$\begin{aligned} &f(x_2) - f(x_1) \\ &\quad= \big(x_2^3 - x_1^3\big) + (x_2 - x_1) \\ &\quad= (x_2 - x_1)\big(x_2^2 + x_1 x_2 + x_1^2 + 1\big). \end{aligned}$$
The first factor is positive. For the second, complete the square:
$$x_2^2 + x_1 x_2 + x_1^2 = \Big(x_2 + \frac{x_1}{2}\Big)^2 + \frac34 x_1^2 \ge 0,$$
so the second factor is at least 1. A product of two positive numbers is positive, so $f(x_1) < f(x_2)$: $f$ is strictly increasing. By (a) it has an inverse function, which by (b) is strictly increasing too. A formula for $f^{-1}$ would mean solving the cubic equation $x^3 + x = y$, but the inverse exists all the same, and Theorem 1.2 gives its graph.

```check
x1, x2 = symbols('x1 x2', real=True)
same(expand(x2**3 - x1**3), expand((x2 - x1)*(x2**2 + x1*x2 + x1**2)))
same(expand((x2**3 + x2) - (x1**3 + x1)), expand((x2 - x1)*(x2**2 + x1*x2 + x1**2 + 1)))
same(expand((x2 + x1/2)**2 + Rational(3, 4)*x1**2), x2**2 + x1*x2 + x1**2)
holds(((x2 + x1/2)**2 + Rational(3, 4)*x1**2 + 1).subs({x1: -3, x2: Rational(3, 2)}) >= 1)
```
:::
::::

:::: exercise Symmetric intervals for a quadratic {#ex-1-11} ★★★
Let $f(x) = px^2 + qx + r$, with constants $p$, $q$ and $r$.

- (a) Show that the average rate of change of $f$ over $[a - h, a + h]$, for $h > 0$, is $2pa + q$, whatever the value of $h$.
- (b) What does (a) say about the secant lines through the points of the graph at $a - h$ and $a + h$, and about the instantaneous rate of change of $f$ at $a$?
- (c) For the falling ball, $s(t) = 4.9t^2$, find the average speed over $[0.5, 1.5]$ and over $[0.9, 1.1]$ without computing any value of $s$. Compare with Section 1.6.

::: solution
**(a)** The interval has length $\Delta x = (a + h) - (a - h) = 2h$. For the change in $f$, group the terms:
$$\begin{aligned} &f(a + h) - f(a - h) \\ &\quad= p\big[(a + h)^2 - (a - h)^2\big] \\ &\qquad + q\big[(a + h) - (a - h)\big] + (r - r). \end{aligned}$$
Expanding, $(a + h)^2 - (a - h)^2 = (a^2 + 2ah + h^2) - (a^2 - 2ah + h^2) = 4ah$, and $(a + h) - (a - h) = 2h$. So $f(a + h) - f(a - h) = 4pah + 2qh$, and
$$\begin{aligned} \frac{f(a + h) - f(a - h)}{2h} &= \frac{4pah + 2qh}{2h} \\ &= 2pa + q. \end{aligned}$$
The $h$ cancels completely: the answer is the same for every $h > 0$.

**(b)** All these secant lines have the same slope, $2pa + q$, so they are parallel, however wide the interval. As $h$ shrinks, the average rate stays at $2pa + q$, so that is the number it approaches: the instantaneous rate of change of $f$ at $a$ is $2pa + q$.

**(c)** Here $p = 4.9$ and $q = r = 0$. Both intervals are centred on $a = 1$ (with $h = 0.5$ and $h = 0.1$), so the average speed over each is $2 \cdot 4.9 \cdot 1 = 9.8$ m/s: exactly the instantaneous speed found in Section 1.6, where intervals starting at $t = 1$ only approached 9.8. Module 4 uses centred intervals, the central difference, for other functions, where they are very accurate though not exact.

```check
pq, qq_, rq = symbols('p q r')
fq2 = lambda X: pq*X**2 + qq_*X + rq
same((a + h) - (a - h), 2*h)
same(expand((a + h)**2 - (a - h)**2), 4*a*h)
same(expand(fq2(a + h) - fq2(a - h)), 4*pq*a*h + 2*qq_*h)
steps((fq2(a + h) - fq2(a - h))/(2*h), (4*pq*a*h + 2*qq_*h)/(2*h), 2*pq*a + qq_)
sq2 = lambda T: Rational(49, 10)*sympify(T)**2
same((sq2(Rational(3, 2)) - sq2(Rational(1, 2)))/1, Rational(98, 10))
same((sq2(Rational(11, 10)) - sq2(Rational(9, 10)))/Rational(2, 10), Rational(98, 10))
same(2*Rational(49, 10)*1, Rational(98, 10))
```
:::
::::

## Check yourself {#quiz}

```quiz
? The domain of $f(x) = \dfrac{\sqrt{x - 3}}{x - 5}$ is
- [ ] $(3, 5) \cup (5, \infty)$
- [ ] $[3, \infty)$
- [x] $[3, 5) \cup (5, \infty)$
- [ ] $(-\infty, 5) \cup (5, \infty)$
> The square root needs $x \ge 3$ (3 itself is allowed, since $\sqrt0 = 0$), and the denominator needs $x \ne 5$. $[3, \infty)$ forgets that $x = 5$ makes the denominator 0; $(3, 5) \cup (5, \infty)$ wrongly leaves out 3.

? If $f(x) = x^2$ and $g(x) = x + 1$, then $(f \circ g)(x)$ is
- [ ] $x^2 + 1$
- [x] $(x + 1)^2$
- [ ] $x^2 + x$
- [ ] $2x + 1$
> $f \circ g$ applies $g$ first: $f\big(g(x)\big) = f(x + 1) = (x + 1)^2$. The answer $x^2 + 1$ is $(g \circ f)(x)$, the other order.

? The graph of $y = f(x + 2) - 1$ is the graph of $y = f(x)$ shifted
- [ ] 2 units right and 1 unit down
- [ ] 2 units left and 1 unit up
- [ ] 2 units right and 1 unit up
- [x] 2 units left and 1 unit down
> Inside $f$, $x + 2$ moves the graph 2 units to the left: the value $f(0)$ is now reached at $x = -2$. Subtracting 1 outside $f$ moves it 1 unit down.

? $\cos\dfrac{2\pi}{3}$ equals
- [x] $-\dfrac12$
- [ ] $\dfrac12$
- [ ] $\dfrac{\sqrt3}{2}$
- [ ] $-\dfrac{\sqrt3}{2}$
> $\dfrac{2\pi}{3} = \pi - \dfrac{\pi}{3}$, and the point at angle $\pi - \theta$ is the mirror image in the $y$-axis of the point at $\theta$, so $\cos\dfrac{2\pi}{3} = -\cos\dfrac{\pi}{3} = -\dfrac12$. The angle is $120^\circ$, left of the $y$-axis, where the $x$-coordinate is negative.

? For $x > 0$, $\ln\big(x^3\big) - \ln x$ equals
- [ ] $\ln\big(x^3 - x\big)$
- [ ] $3$
- [x] $2\ln x$
- [ ] $(\ln x)^2$
> $\ln\big(x^3\big) - \ln x = \ln\dfrac{x^3}{x} = \ln\big(x^2\big) = 2\ln x$, by the second and third laws of logarithms. $\ln\big(x^3 - x\big)$ is a different number: the laws are about products, quotients and powers, not differences.

? If $f(x) = 3x - 6$, then $f^{-1}(x)$ is
- [ ] $\dfrac{1}{3x - 6}$
- [x] $\dfrac{x}{3} + 2$
- [ ] $3x + 6$
- [ ] $\dfrac{x}{3} - 2$
> Solve $y = 3x - 6$ for $x$: $x = \dfrac{y + 6}{3} = \dfrac{y}{3} + 2$, then rename $y$ as $x$. $\dfrac{1}{3x - 6}$ is $\dfrac{1}{f(x)}$, not the inverse. Check: $f(4) = 6$, and $\dfrac63 + 2 = 4$.

? The average rate of change of $f(x) = x^2$ over $[2, 5]$ is
- [x] $7$
- [ ] $21$
- [ ] $3$
- [ ] $14.5$
> $\dfrac{f(5) - f(2)}{5 - 2} = \dfrac{25 - 4}{3} = \dfrac{21}{3} = 7$. 21 is the change in $f$ alone, not divided by the change in $x$; 14.5 is the average of the values $f(2)$ and $f(5)$, a different thing.

? For $f(x) = x^2$ and $h \ne 0$, the difference quotient $\dfrac{f(3 + h) - f(3)}{h}$ simplifies to
- [ ] $h$
- [ ] $6$
- [ ] $9 + h$
- [x] $6 + h$
> $(3 + h)^2 - 9 = 9 + 6h + h^2 - 9 = 6h + h^2$, and dividing by $h$ gives $6 + h$. It approaches 6 as $h$ shrinks, but never equals 6 for an allowed $h$. The answer $h$ comes from writing $f(3 + h)$ as $9 + h^2$ and losing the middle term $6h$.
```

```check
same(continuous_domain(sqrt(x - 3)/(x - 5), x, R), Union(Interval.Ropen(3, 5), Interval.open(5, oo)))
same((x**2).subs(x, x + 1), (x + 1)**2); same((x + 1).subs(x, x**2), x**2 + 1)
same(cos(2*pi/3), -Rational(1, 2)); same(2*pi/3*180/pi, 120)
xq = symbols('x', positive=True)
same(expand_log(log(xq**3) - log(xq)), 2*log(xq))
same(solve(Eq(y, 3*x - 6), x), [y/3 + 2]); same((3*x - 6).subs(x, 4), 6); same(Rational(6, 3) + 2, 4)
same(Rational(5**2 - 2**2, 5 - 2), 7); same(Rational(5**2 + 2**2, 2), Rational(29, 2))
same(cancel(((3 + h)**2 - 9)/h), 6 + h); same(((9 + h**2) - 9)/h, h)
```
