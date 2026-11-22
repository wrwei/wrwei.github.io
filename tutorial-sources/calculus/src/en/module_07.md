---
title: Rates, approximation and L'Hôpital's rule
part: 2
lead: Put derivatives to work. Find how fast one quantity changes from how fast another does, approximate a function by its tangent line, estimate how errors in measurements spread into results, solve equations with Newton's method, and evaluate the limits that the limit laws cannot, with L'Hôpital's rule.
minutes: 255
needs: Modules 1 to 6 (the rules of differentiation, $e^x$, $\ln x$, implicit differentiation)
goals:
  - Solve related-rates problems with a diagram, an equation that holds at every instant and the chain rule
  - Approximate a function near a point by its linearisation, use differentials, and judge how good the approximation is
  - Estimate how a measurement error spreads into a computed result, as an absolute and as a relative error
  - Solve equations with Newton's method, explain why its correct digits roughly double, and recognise when it fails
  - Evaluate limits of the forms $0/0$, $\infty/\infty$, $0\cdot\infty$, $\infty-\infty$, $1^\infty$, $0^0$ and $\infty^0$ with L'Hôpital's rule and logarithms
  - Prove that logarithms grow more slowly than powers, and powers more slowly than exponentials
---

## Related rates {#related-rates}

When two quantities are linked by an equation and both change with time, their rates of change are linked too. Module 5's chain rule, "rates multiply", turns the equation between the quantities into an equation between their rates: if you know how fast one changes, you can work out how fast the other does. Such problems are called **related rates** problems.

Here is one. A ladder 5 metres long leans against a vertical wall, on level ground. Its foot starts 1 metre from the wall and is pulled away at a steady 0.5 m/s. After $t$ seconds the foot is $x = 1 + 0.5t$ metres from the wall, and by Pythagoras' theorem the top is $y = \sqrt{25 - x^2}$ metres up the wall:

```valuetable
t = 0, 1, 2, 3, 4, 5, 6, 7
$x$ = 1 + t/2
$y = \sqrt{25 - x^2}$ = sqrt(25 - (1 + t/2)**2)
digits = 4
---
t | x | y = \sqrt{25 - x^2}
0 | 1 | 4.899
1 | 1.5 | 4.770
2 | 2 | 4.583
3 | 2.5 | 4.330
4 | 3 | 4
5 | 3.5 | 3.571
6 | 4 | 3
7 | 4.5 | 2.179
```

The foot moves steadily, but the top does not. In the first second the top falls $4.899 - 4.770 \approx 0.13$ metres; in the eighth second, from $t = 7$ until it reaches the ground at $t = 8$, when $x = 5$, it falls the remaining $2.179$ metres. How fast is the top falling at the instant when the foot is 3 metres from the wall, at $t = 4$? The drops in the seconds on either side of $t = 4$ suggest a speed between 0.330 and 0.429 m/s. To find it exactly, you do not need the formula for $y$ at all: you need the equation that links $x$ and $y$ at every instant.

```check
tl = symbols('t', real=True)
Xl = 1 + tl/2; Yl = sqrt(25 - Xl**2)
rounds(Yl.subs(tl, 0), '4.899'); rounds(Yl.subs(tl, 1), '4.770'); rounds(Yl.subs(tl, 0) - Yl.subs(tl, 1), '0.13')
rounds(Yl.subs(tl, 7) - Yl.subs(tl, 8), '2.179'); same(Yl.subs(tl, 8), 0); same(Xl.subs(tl, 8), 5); same(Xl.subs(tl, 4), 3)
rounds(Yl.subs(tl, 3) - Yl.subs(tl, 4), '0.330'); rounds(Yl.subs(tl, 4) - Yl.subs(tl, 5), '0.429')
```

::: keyidea
**A strategy for related rates.**

1. Draw a diagram. Give a letter to every quantity that changes with time, and write in the constants.
2. Write the rate you know and the rate you want as derivatives with respect to time $t$, with units: "$dx/dt = 0.5$ m/s; find $dy/dt$ when $x = 3$ m".
3. Find an equation that links the changing quantities and holds at every instant: from geometry (Pythagoras' theorem, similar triangles, the formula for a volume) or from physics.
4. Differentiate both sides with respect to $t$. Each changing quantity is a function of $t$, so the chain rule applies to each: $\dfrac{d}{dt}\big(x^2\big) = 2x\,\dfrac{dx}{dt}$.
5. Only now substitute the values at the instant you care about, and solve for the rate you want. Check its sign and its units.
:::

::: figure id=fig-07-1
The four related-rates problems of this section, with the changing quantities named by letters: a ladder whose foot is pulled away from a wall (Example 7.1), a cone-shaped tank filling with water (Example 7.2), a person walking away from a street lamp (Example 7.3), and a balloon rising while an observer watches it (Example 7.4).
:::

::: example The sliding ladder
Find how fast the top of the ladder is falling when its foot is 3 metres from the wall.

Let $x$ be the distance from the wall to the foot and $y$ the height of the top, both in metres, at time $t$ in seconds (Figure 7.1, top left). You know $dx/dt = 0.5$ and want $dy/dt$ when $x = 3$. At every instant the ladder, the wall and the ground form a right triangle with hypotenuse 5, so

$$x^2 + y^2 = 25.$$

Differentiate both sides with respect to $t$. By the chain rule the derivative of $x^2$ is $2x\,dx/dt$, and the derivative of the constant 25 is 0:

$$\begin{aligned} 2x\,\frac{dx}{dt} + 2y\,\frac{dy}{dt} &= 0, \\ \text{so}\qquad \frac{dy}{dt} &= -\frac{x}{y}\,\frac{dx}{dt}. \end{aligned}$$

Now substitute the values at the instant. When $x = 3$, $y = \sqrt{25 - 9} = 4$, and

$$\frac{dy}{dt} = -\frac{3}{4} \cdot 0.5 = -0.375 \text{ m/s}.$$

The minus sign says that $y$ is decreasing: the top slides down at 0.375 m/s, between the two estimates from the table.

```check
xt, yt = Function('x')(t), Function('y')(t)
same(diff(xt**2 + yt**2, t), 2*xt*diff(xt, t) + 2*yt*diff(yt, t))
same(solve(2*xt*diff(xt, t) + 2*yt*diff(yt, t), diff(yt, t)), [-xt/yt*diff(xt, t)])
same(sqrt(25 - 9), 4); same(-Rational(3, 4)*Rational(1, 2), -Rational(375, 1000))
same(diff(Yl, tl).subs(tl, 4), -Rational(3, 8))          # the same rate from the formula y(t) of the table
holds(Rational(330, 1000) < Rational(3, 8)); holds(Rational(3, 8) < Rational(429, 1000))
```
:::

The formula $dy/dt = -(x/y)\,dx/dt$ also explains the table: as the top nears the ground, $y$ approaches 0 and the speed of the top grows without bound. No real ladder can move like that, so the model, which assumes that the top stays on the wall, must break down before the top reaches the ground.

::: pitfall
Do not substitute the values of the instant before you differentiate. If you put $x = 3$ into $x^2 + y^2 = 25$ first, you get $9 + y^2 = 25$, and differentiating that gives $2y\,dy/dt = 0$: the top does not move, which is wrong. The equation you differentiate must hold at every instant, not only at the one you care about.
:::

### Volumes, shadows and angles {#more-rates}

::: example Filling a cone-shaped tank
A tank has the shape of a cone with its vertex at the bottom. It is 4 m deep, and its top is a circle of radius 2 m. Water runs in at 2 m³ per minute. How fast is the water level rising when the water is 3 m deep?

Let $h$ be the depth of the water and $r$ the radius of its surface, in metres, at time $t$ in minutes (Figure 7.1, top right). You know $dV/dt = 2$ and want $dh/dt$ when $h = 3$. The water forms a cone of volume

$$V = \frac{1}{3}\pi r^2 h.$$

This links three changing quantities, so eliminate one first. A vertical cut through the axis shows two similar right triangles, the tank's with legs 4 and 2 and the water's with legs $h$ and $r$. So $r/h = 2/4$ at every instant, that is, $r = h/2$, and

$$V = \frac{1}{3}\pi\Big(\frac{h}{2}\Big)^2 h = \frac{\pi}{12}h^3.$$

Differentiate with respect to $t$, by the chain rule:

$$\frac{dV}{dt} = \frac{\pi}{4}h^2\,\frac{dh}{dt}.$$

At $h = 3$ this reads $2 = \dfrac{9\pi}{4}\,\dfrac{dh}{dt}$, so

$$\frac{dh}{dt} = \frac{8}{9\pi} \approx 0.283 \text{ m/min}.$$

The level rises about 28 cm per minute at that moment. It rises more slowly as the water deepens, because the same 2 m³ spreads over a wider surface.

```check
hp = symbols('h', positive=True)
same(Rational(1, 3)*pi*(hp/2)**2*hp, pi/12*hp**3)
ht = Function('h')(t)
same(diff(pi/12*ht**3, t), pi/4*ht**2*diff(ht, t))
same((pi/4*hp**2).subs(hp, 3), 9*pi/4)
qq = symbols('q')
dhdt = solve(Eq(2, 9*pi/4*qq), qq)[0]
same(dhdt, 8/(9*pi)); rounds(dhdt, '0.283'); rounds(100*dhdt, '28')
```
:::

::: example A walker's shadow
A street lamp is at the top of a 6 m pole. A person 1.8 m tall walks straight away from the pole at 1.5 m/s. How fast does the shadow lengthen, and how fast does the tip of the shadow move?

Let $x$ be the person's distance from the pole and $s$ the length of the shadow, in metres (Figure 7.1, bottom left). The ray of light from the lamp to the tip of the shadow grazes the top of the person's head, so the large triangle (pole, ground, ray) and the small one (person, shadow, ray) are similar. Height over base is the same in both:

$$\frac{6}{x + s} = \frac{1.8}{s}.$$

Multiply both sides by $s(x + s)$: $6s = 1.8x + 1.8s$, so $4.2s = 1.8x$ and $s = \dfrac{3}{7}x$. Differentiating,

$$\frac{ds}{dt} = \frac{3}{7}\,\frac{dx}{dt} = \frac{3}{7} \cdot 1.5 = \frac{9}{14} \approx 0.643 \text{ m/s}.$$

The tip is $x + s = \dfrac{10}{7}x$ from the pole, so it moves at $\dfrac{10}{7} \cdot 1.5 = \dfrac{15}{7} \approx 2.14$ m/s, faster than the person walks. Neither answer depends on where the person is: here the relation is linear, so the rates are constant.

```check
xs7, ss7 = symbols('x s', positive=True)
same(solve(Eq(6/(xs7 + ss7), Rational(18, 10)/ss7), ss7), [Rational(3, 7)*xs7])
same(6*ss7 - Rational(18, 10)*(xs7 + ss7), Rational(42, 10)*ss7 - Rational(18, 10)*xs7)
same(Rational(18, 10)/Rational(42, 10), Rational(3, 7))
same(Rational(3, 7)*Rational(3, 2), Rational(9, 14)); rounds(Rational(9, 14), '0.643')
same(xs7 + Rational(3, 7)*xs7, Rational(10, 7)*xs7); same(Rational(10, 7)*Rational(3, 2), Rational(15, 7)); rounds(Rational(15, 7), '2.14')
```
:::

::: example Watching a balloon rise
A balloon rises straight up at a steady 2 m/s from a point on level ground 400 m from an observer. How fast is the angle of elevation of the observer's line of sight increasing when the balloon is 300 m up?

Let $h$ be the balloon's height in metres and $\theta$ the angle of elevation in radians, at time $t$ in seconds (Figure 7.1, bottom right). You know $dh/dt = 2$ and want $d\theta/dt$ when $h = 300$. In the right triangle formed by the observer, the launch point and the balloon,

$$\tan\theta = \frac{h}{400}.$$

Differentiate both sides with respect to $t$. The derivative of $\tan\theta$ is $\sec^2\theta$ (Module 5), so by the chain rule

$$\sec^2\theta\,\frac{d\theta}{dt} = \frac{1}{400}\,\frac{dh}{dt}.$$

When $h = 300$, the line of sight has length $\sqrt{400^2 + 300^2} = 500$, so $\cos\theta = 400/500 = 4/5$ and $\sec^2\theta = 25/16$. Then

$$\frac{d\theta}{dt} = \frac{1}{400} \cdot 2 \cdot \frac{16}{25} = 0.0032 \text{ rad/s},$$

about $0.18^\circ$ per second (multiply by $180/\pi$). Differentiating $\theta = \arctan(h/400)$ instead (Module 6) gives the same answer.

```check
tht = Function('theta')(t)
same(diff(tan(tht), t), sec(tht)**2*diff(tht, t))
same(sqrt(400**2 + 300**2), 500)
th0 = atan(Rational(300, 400))
same(cos(th0), Rational(4, 5)); same(sec(th0)**2, Rational(25, 16))
rate7 = Rational(1, 400)*2*Rational(16, 25)
same(rate7, Rational(32, 10000)); rounds(rate7*180/pi, '0.18')
same(2*diff(atan(hp/400), hp).subs(hp, 300), rate7)      # from theta = arctan(h/400)
```
:::

::: pitfall
Two more slips are common. The first is a wrong sign: a quantity that decreases has a negative rate, so a tank that drains at 2 m³/min has $dV/dt = -2$. The second is degrees: the derivative of $\tan\theta$ is $\sec^2\theta$ only when $\theta$ is in radians ([Section 1.4](module_01_EN.html#trig)), so work in radians and convert the answer at the end, as in Example 7.4.
:::

::: compute Related rates with SymPy
SymPy can carry out step 4 of the strategy. Make $x$ and $y$ functions of $t$ with `sp.Function`, differentiate the equation of Example 7.1, and solve for $dy/dt$:

```python
import sympy as sp
t = sp.symbols('t')
x = sp.Function('x')(t)          # the foot's distance from the wall at time t
y = sp.Function('y')(t)          # the height of the top
link = x**2 + y**2 - 25          # zero at every instant
dlink = sp.diff(link, t)
print(dlink)
dydt = sp.solve(dlink, sp.Derivative(y, t))[0]
print(dydt)
```

```output
2*x(t)*Derivative(x(t), t) + 2*y(t)*Derivative(y(t), t)
-x(t)*Derivative(x(t), t)/y(t)
```

SymPy writes $dx/dt$ as `Derivative(x(t), t)`. Now substitute the values at the instant, the rate first:

```python
print(dydt.subs(sp.Derivative(x, t), sp.Rational(1, 2)).subs({x: 3, y: 4}))
print(dydt.subs({x: 3, y: 4}))
```

```output
-3/8
-3*Derivative(3, t)/4
```

The first line is Example 7.1's answer, $-3/8 = -0.375$. The second is the pitfall after that example, in SymPy: substituting $x = 3$ first also replaces the $x(t)$ inside $dx/dt$, which becomes `Derivative(3, t)`, the derivative of a constant, 0.
:::

## Linear approximation and differentials {#linear-approximation}

Zoom in on the graph of a differentiable function near a point, and it looks more and more like a straight line: its tangent line. Near the point, then, the tangent line, which is easy to compute with, is a good stand-in for the function, which may not be. This section makes that precise and measures how good the stand-in is.

::: definition Linearisation
Let $f$ be differentiable at $a$. The **linearisation** of $f$ at $a$ is the function

$$L(x) = f(a) + f'(a)(x - a),$$

whose graph is the tangent line to $y = f(x)$ at $\big(a, f(a)\big)$. Using $f(x) \approx L(x)$ for $x$ near $a$ is the **linear approximation**, or tangent line approximation, of $f$ at $a$.
:::

$L$ is the line through $\big(a, f(a)\big)$ with slope $f'(a)$, in the point-slope form of [Section 1.4](module_01_EN.html#linear). It matches $f$ in value and in slope at $a$: $L(a) = f(a)$ and $L'(a) = f'(a)$.

::: figure id=fig-07-2
Left: the graph of $y = \sqrt x$ and its tangent line $y = L(x)$ at $a = 4$; near $a$ they are hard to tell apart. From $a$ to $a + dx$ (here $dx = 3$, exaggerated so that the gap shows), the curve rises by $\Delta y$ and the tangent line by $dy$, the differentials defined later in this section. Right: $y = \sin\theta$ and its tangent line $y = \theta$ at 0; in the green band, $\abs{\theta} \le 0.5$, they almost coincide.
:::

::: example Square roots near 4
Use the linearisation of $f(x) = \sqrt x$ at $a = 4$ to estimate $\sqrt{4.1}$ and $\sqrt{3.9}$.

Here $f(4) = 2$ and $f'(x) = \dfrac{1}{2\sqrt x}$, so $f'(4) = \dfrac14$ and

$$L(x) = 2 + \frac{1}{4}(x - 4).$$

So $\sqrt{4.1} \approx L(4.1) = 2 + \tfrac14(0.1) = 2.025$ and $\sqrt{3.9} \approx L(3.9) = 2 - \tfrac14(0.1) = 1.975$. A calculator gives $\sqrt{4.1} \approx 2.024846$ and $\sqrt{3.9} \approx 1.974842$: both estimates are within 0.0002 of the true values, and both are a little too big, because the graph of $\sqrt x$ bends away below its tangent line (Figure 7.2, left).

```check
fsq = sqrt(x)
same(diff(fsq, x), 1/(2*sqrt(x))); same(diff(fsq, x).subs(x, 4), Rational(1, 4))
Lsq = 2 + (x - 4)/4
same(Lsq.subs(x, Rational(41, 10)), Rational(2025, 1000)); same(Lsq.subs(x, Rational(39, 10)), Rational(1975, 1000))
rounds(sqrt(Rational(41, 10)), '2.024846'); rounds(sqrt(Rational(39, 10)), '1.974842')
holds(abs(sqrt(Rational(41, 10)) - Rational(2025, 1000)) < Rational(2, 10000)); holds(abs(sqrt(Rational(39, 10)) - Rational(1975, 1000)) < Rational(2, 10000))
holds(sqrt(Rational(41, 10)) < Rational(2025, 1000)); holds(sqrt(Rational(39, 10)) < Rational(1975, 1000))
```
:::

How good is the approximation further from 4, and closer to it? The table compares $\sqrt x$ with $L(x)$:

```valuetable
x = 3, 3.9, 3.99, 4.01, 4.1, 5
$\sqrt{x}$ = sqrt(x)
$L(x)$ = 2 + (x - 4)/4
$\sqrt{x} - L(x)$ = sqrt(x) - 2 - (x - 4)/4
digits = 6
---
x | \sqrt{x} | L(x) | \sqrt{x} - L(x)
3 | 1.73205 | 1.75 | -0.0179492
3.9 | 1.97484 | 1.975 | -0.000158234
3.99 | 1.99750 | 1.9975 | -1.56446\times10^{-6}
4.01 | 2.00250 | 2.0025 | -1.56055\times10^{-6}
4.1 | 2.02485 | 2.025 | -0.000154327
5 | 2.23607 | 2.25 | -0.0139320
```

Two things stand out. The error $\sqrt x - L(x)$ is always negative: the tangent line lies above the graph. And each time $x$ moves ten times closer to 4, the error shrinks about a hundred times: it is 0.014 or 0.018 at distance 1, 0.00015 or 0.00016 at distance 0.1, and 0.0000016 at distance 0.01. The error behaves like a constant times $(x - 4)^2$.

```check
err4 = lambda v: sqrt(v) - Lsq.subs(x, v)
rounds(abs(err4(5)), '0.014'); rounds(abs(err4(3)), '0.018')
rounds(abs(err4(Rational(41, 10))), '0.00015'); rounds(abs(err4(Rational(39, 10))), '0.00016')
rounds(abs(err4(Rational(401, 100))), '0.0000016'); rounds(abs(err4(Rational(399, 100))), '0.0000016')
holds(all(err4(v) < 0 for v in (3, Rational(39, 10), Rational(399, 100), Rational(401, 100), Rational(41, 10), 5)))
```

### How good is it? {#how-good}

::: theorem The tangent line is the best linear approximation
Let $f$ be differentiable at $a$, with linearisation $L$, and let $E(x) = f(x) - L(x)$ be the error of the linear approximation. Then

$$\lim_{x\to a}\frac{E(x)}{x - a} = 0.$$

That is, the error is small even compared with the distance $x - a$. Moreover, $L$ is the only linear function with this property: if $\ell(x) = c + m(x - a)$ and $\big(f(x) - \ell(x)\big)/(x - a) \to 0$ as $x \to a$, then $c = f(a)$ and $m = f'(a)$.
:::

::: proof
For $x \ne a$,

$$\begin{aligned} \frac{E(x)}{x - a} &= \frac{f(x) - f(a) - f'(a)(x - a)}{x - a} \\ &= \frac{f(x) - f(a)}{x - a} - f'(a). \end{aligned}$$

As $x \to a$ the difference quotient approaches $f'(a)$, by the definition of the derivative (Module 4), so the whole expression approaches 0.

Now suppose $\ell(x) = c + m(x - a)$ has the property. Then $f(x) - \ell(x) = \dfrac{f(x) - \ell(x)}{x - a}\,(x - a)$ approaches $0 \cdot 0 = 0$. But $f$ is continuous at $a$, because it is differentiable there (Module 4), so $f(x) - \ell(x)$ also approaches $f(a) - c$. Hence $c = f(a)$, and then

$$\begin{aligned} \frac{f(x) - \ell(x)}{x - a} &= \frac{f(x) - f(a)}{x - a} - m \\ &\to f'(a) - m. \end{aligned}$$

This limit is 0, so $m = f'(a)$.
:::

Differentiability is needed. At the corner of $\abs{x}$ at 0, no line $c + mx$ will do: $c$ must be $\abs{0} = 0$, and then $\big(\abs{x} - mx\big)/x$ approaches $1 - m$ from the right and $-1 - m$ from the left, which cannot both be 0.

```check
ff = Function('f'); fpa, mm_ = symbols('fpa m')                  # fpa stands for f'(a)
same((ff(x) - ff(a) - fpa*(x - a))/(x - a), (ff(x) - ff(a))/(x - a) - fpa)
same((ff(x) - (ff(a) + mm_*(x - a)))/(x - a), (ff(x) - ff(a))/(x - a) - mm_)
limit_is((sqrt(x) - Lsq)/(x - 4), x, 4, 0)                 # an instance: f = sqrt, a = 4
limit_is((Abs(x) - mm_*x)/x, x, 0, 1 - mm_, '+'); limit_is((Abs(x) - mm_*x)/x, x, 0, -1 - mm_, '-')
same(solve([1 - mm_, -1 - mm_], mm_), [])                    # no m makes both one-sided limits 0
```

Theorem 7.1 says that the error is small compared with $x - a$, but not how small. The table suggests a constant times $(x - a)^2$, and that is the usual case: if $f''$ is continuous near $a$, then

$$f(x) - L(x) \approx \frac{f''(a)}{2}(x - a)^2 \quad\text{for } x \text{ near } a,$$

and if $\abs{f''} \le M$ between $a$ and $x$, then $\abs{f(x) - L(x)} \le \dfrac{M}{2}(x - a)^2$. Both follow from Taylor's theorem, which Module 15 proves. For $\sqrt x$ at 4, $f''(x) = -\tfrac14 x^{-3/2}$, so $f''(4) = -\tfrac{1}{32}$, and the error at $x = 4.1$ should be about $-\tfrac{1}{64}(0.1)^2 \approx -0.000156$; the table gives $-0.000154$.

```check
same(diff(sqrt(x), x, 2), -x**Rational(-3, 2)/4); same(diff(sqrt(x), x, 2).subs(x, 4), -Rational(1, 32))
same(-Rational(1, 32)/2, -Rational(1, 64)); rounds(-Rational(1, 64)*Rational(1, 100), '-0.000156')
rounds(err4(Rational(41, 10)), '-0.000154')
holds(abs(err4(Rational(41, 10))) <= Rational(1, 64)*Rational(1, 100))      # the bound with M = |f''(4)|, the largest on [4, 4.1]
```

::: pitfall
A linear approximation is good only near $a$. Far away the tangent line and the curve part company: $L(9) = 2 + \tfrac54 = 3.25$, while $\sqrt9 = 3$. Before trusting $f(x) \approx L(x)$, ask how far $x$ is from $a$, and how sharply the graph bends in between.

```check
same(Lsq.subs(x, 9), Rational(13, 4)); same(2 + Rational(5, 4), Rational(325, 100)); same(sqrt(9), 3)
```
:::

::: example The small-angle approximation
Find the linearisation of $\sin\theta$ at 0, and the angles for which it is accurate to within 1%.

$\sin 0 = 0$, and the derivative of $\sin\theta$ is $\cos\theta$ (Module 5), with $\cos 0 = 1$. So $L(\theta) = 0 + 1\cdot(\theta - 0) = \theta$:

$$\sin\theta \approx \theta \quad\text{for } \theta \text{ near } 0,$$

with $\theta$ in radians. The table gives the relative error $(\theta - \sin\theta)/\sin\theta$, the error as a fraction of the true value (Section 7.3):

```valuetable
theta = 0.01, 0.05, 0.1, 0.2, 0.5, 1
$\sin\theta$ = sin(theta)
$\dfrac{\theta - \sin\theta}{\sin\theta}$ = (theta - sin(theta))/sin(theta)
digits = 4
---
\theta | \sin\theta | \dfrac{\theta - \sin\theta}{\sin\theta}
0.01 | 0.01000 | 1.667\times10^{-5}
0.05 | 0.04998 | 0.0004168
0.1 | 0.09983 | 0.001669
0.2 | 0.1987 | 0.006698
0.5 | 0.4794 | 0.04291
1 | 0.8415 | 0.1884
```

The relative error stays below 0.01, that is 1%, for $\abs{\theta}$ up to about 0.24 radians, about $14^\circ$ (a calculator shows that it passes 0.01 between $\theta = 0.24$ and $\theta = 0.25$); at $\theta = 0.1$ it is about 0.17%. Like the error of the linearisation of $\sqrt x$ above, it shrinks about a hundredfold when $\theta$ shrinks tenfold. (The relative error is an even function of $\theta$, so negative angles behave the same.)

```check
same(diff(sin(theta), theta).subs(theta, 0), 1); same(sin(0) + 1*(theta - 0), theta)
rel = (theta - sin(theta))/sin(theta)
th1 = nsolve(rel - Rational(1, 100), theta, 0.24)
rounds(th1, '0.24'); rounds(th1*180/pi, '14')
holds(rel.subs(theta, Rational(24, 100)) < Rational(1, 100)); holds(rel.subs(theta, Rational(25, 100)) > Rational(1, 100))
rounds(100*rel.subs(theta, Rational(1, 10)), '0.17'); rounds(rel.subs(theta, Rational(1, 10))/rel.subs(theta, Rational(1, 100)), '100')
same(rel.subs(theta, -theta), rel)
```
:::

Physics and engineering use the small-angle approximation constantly. For a pendulum, replacing $\sin\theta$ by $\theta$ turns its equation of motion into one that Module 13 solves exactly, which is why the usual formula for a pendulum's period holds only for small swings. In degrees the approximation reads $\sin(\theta^\circ) \approx \pi\theta/180$, with an awkward factor: one more reason calculus works in radians.

### Differentials {#differentials}

Leibniz's notation $dy/dx$ looks like a fraction. Differentials give its two halves a meaning of their own.

::: definition Differentials
Let $y = f(x)$, with $f$ differentiable. The **differential** $dx$ is an independent variable: it can be any real number. The **differential** $dy$ is then defined by

$$dy = f'(x)\,dx.$$

So $dy$ depends on two numbers, $x$ and $dx$.
:::

For $dx \ne 0$, dividing by $dx$ gives $dy/dx = f'(x)$: the derivative is a quotient of differentials after all. Compare $dy$ with the actual change of $y$ when $x$ changes by $\Delta x = dx$,

$$\Delta y = f(x + dx) - f(x).$$

In Figure 7.2 (left), $\Delta y$ is the rise of the curve and $dy$ the rise of the tangent line between $a$ and $a + dx$: $dy = L(a + dx) - L(a)$. By Theorem 7.1, $\Delta y - dy$ is small compared with $dx$ when $dx$ is small, so $\Delta y \approx dy$.

```check
dxs = symbols('dx')
same((ff(a) + fpa*((a + dxs) - a)) - (ff(a) + fpa*(a - a)), fpa*dxs)        # L(a + dx) - L(a) = f'(a) dx
```

::: example $dy$ and $\Delta y$ for a cube
Let $y = x^3$. Find $dy$ and $\Delta y$ when $x = 2$ and $dx = 0.05$.

$dy = 3x^2\,dx = 3 \cdot 4 \cdot 0.05 = 0.6$. The actual change is

$$\begin{aligned} \Delta y &= 2.05^3 - 2^3 \\ &= 8.615125 - 8 = 0.615125. \end{aligned}$$

The differential is off by $0.015125$, about 2.5% of $\Delta y$. Expanding shows where the difference comes from: $(2 + dx)^3 - 8 = 12\,dx + 6\,(dx)^2 + (dx)^3$, and $dy = 12\,dx$ keeps only the first term.

```check
same(3*2**2*Rational(5, 100), Rational(6, 10))
same(Rational(205, 100)**3, Rational(8615125, 1000000)); same(Rational(205, 100)**3 - 8, Rational(615125, 1000000))
same(Rational(615125, 1000000) - Rational(6, 10), Rational(15125, 1000000)); rounds(100*Rational(15125, 615125), '2.5')
same(expand((2 + dxs)**3 - 8), 12*dxs + 6*dxs**2 + dxs**3); same(diff(x**3, x).subs(x, 2), 12)
```
:::

::: pitfall
$dy$ is not $\Delta y$. The differential is the change along the tangent line, $\Delta y$ the change along the curve. They are close only when $dx$ is small, and $dy$ is the one that is easy to compute, which is why it is useful.
:::

## Propagating measurement errors {#errors}

Every measurement has an error, and whatever you compute from a measured quantity inherits an error too. Differentials estimate it: if $x$ is measured with an error $\Delta x$, then $y = f(x)$ is computed with an error

$$\Delta y \approx dy = f'(x)\,\Delta x.$$

::: definition Absolute and relative error
Suppose a quantity whose true value is $x$ is measured, or computed, as $x + \Delta x$. The **absolute error** is $\abs{\Delta x}$. For $x \ne 0$, the **relative error** is $\abs{\Delta x}/\abs{x}$; written as a percentage, it is the **percentage error**.
:::

In practice you know neither the true value nor the error, only the measured value and a bound on the error, such as "10.0 cm, to within 0.1 cm"; you then divide the bound by the measured value. When the error is small, the difference does not matter.

::: example The volume of a ball
Suppose the radius of a ball is measured as 10.0 cm, with an error of at most 0.1 cm.

- (a) Estimate the largest possible error in the volume computed from it, as an absolute and as a relative error.
- (b) How accurately must the radius be measured to know the volume to within 1%?

**(a)** $V = \tfrac43\pi r^3$, so $dV = 4\pi r^2\,dr$. With $r = 10$ and $\abs{dr} \le 0.1$,

$$\abs{dV} \le 4\pi \cdot 10^2 \cdot 0.1 = 40\pi \approx 126 \text{ cm}^3.$$

The computed volume is $V = \tfrac{4000\pi}{3} \approx 4189$ cm³, so the relative error is at most about

$$\frac{40\pi}{4000\pi/3} = \frac{3}{100} = 3\%.$$

The exact changes confirm the estimate: $V(10.1) - V(10) \approx 126.9$ cm³ and $V(9.9) - V(10) \approx -124.4$ cm³.

**(b)** Divide $dV = 4\pi r^2\,dr$ by $V = \tfrac43\pi r^3$:

$$\frac{dV}{V} = 3\,\frac{dr}{r}.$$

The relative error of the volume is three times that of the radius. For a volume within 1%, the radius must be within $\tfrac13\%$: for $r = 10$ cm, within $10 \times \tfrac{1}{300} \approx 0.033$ cm, a third of a millimetre.

```check
rp = symbols('r', positive=True)
Vb = Rational(4, 3)*pi*rp**3
same(diff(Vb, rp), 4*pi*rp**2); same(4*pi*10**2*Rational(1, 10), 40*pi); rounds(40*pi, '126')
same(Vb.subs(rp, 10), 4000*pi/3); rounds(4000*pi/3, '4189'); same(40*pi/(4000*pi/3), Rational(3, 100))
rounds(Vb.subs(rp, Rational(101, 10)) - Vb.subs(rp, 10), '126.9'); rounds(Vb.subs(rp, Rational(99, 10)) - Vb.subs(rp, 10), '-124.4')
same(diff(Vb, rp)/Vb, 3/rp)
same(Rational(1, 100)/3, Rational(1, 300)); rounds(10*Rational(1, 300), '0.033')
```
:::

The same computation works for any power. If $y = c\,x^k$, with constants $c \ne 0$ and $k$, then $dy = ck\,x^{k-1}\,dx$, and dividing by $y$,

$$\frac{dy}{y} = k\,\frac{dx}{x}.$$

So the relative error of a $k$th power is about $\abs{k}$ times the relative error of $x$. A square doubles it, a cube triples it and a square root halves it, whatever the constant $c$.

```check
kk = symbols('k')
same(diff(c*x**kk, x)/(c*x**kk), kk/x)
```

::: pitfall
The estimate $\Delta y \approx dy$ is a linear approximation, so it is good only for small errors. With a 50% error in the radius, the formula says that the volume is out by $3 \times 50\% = 150\%$, but $1.5^3 = 3.375$, so the true error is $237.5\%$. For large errors, compute $f(x + \Delta x) - f(x)$ itself.

```check
same(3*50, 150); same(Rational(3, 2)**3, Rational(3375, 1000)); same(100*(Rational(3, 2)**3 - 1), Rational(2375, 10))
```
:::

::: note
Computers make relative errors too: a floating-point number carries a relative error of up to about $10^{-16}$. The rule above says how such an error grows when you compute $f(x)$: it is multiplied by $\abs{x f'(x)/f(x)}$, the **condition number** of $f$ at $x$. For $x^k$ the condition number is $\abs{k}$; for $x - 1$ it is $\abs{x/(x - 1)}$, huge near $x = 1$, which is the cancellation error of Module 2. Exercise 7.12 explores condition numbers.

```check
same(x*diff(x**kk, x)/x**kk, kk); same(x*diff(x - 1, x)/(x - 1), x/(x - 1))
```
:::

## Newton's method {#newton}

Most equations cannot be solved exactly by algebra: no rearrangement of $\cos x = x$ leaves $x$ alone on one side, and even where a formula exists, as for cubic equations such as $x^3 - 2x - 5 = 0$, it is usually easier to compute the root numerically. Module 3's bisection method halves an interval that contains a root, gaining one binary digit, about 0.3 decimal digits, per step. **Newton's method** (also called the Newton–Raphson method) uses the derivative, and is far faster.

```check
rounds(log(2, 10), '0.3')
```

**The idea.** Near a root $r$ of $f$, replace the graph of $f$ by its tangent line at a point $x_0$ that you have, and solve the easy equation instead: where does the tangent line cross the $x$-axis? Call that point $x_1$. It is usually much closer to $r$ (Figure 7.3). Then repeat from $x_1$.

The tangent line at $\big(x_n, f(x_n)\big)$, where $x_n$ is read "x sub n", is $y = f(x_n) + f'(x_n)(x - x_n)$, the linearisation of $f$ at $x_n$. It meets the $x$-axis where $y = 0$. If $f'(x_n) \ne 0$, solving $0 = f(x_n) + f'(x_n)(x - x_n)$ for $x$ gives $x = x_n - f(x_n)/f'(x_n)$.

```check
xn_s, fn_s, dn_s = symbols('x_n f_n d_n')
same(solve(fn_s + dn_s*(x - xn_s), x), [xn_s - fn_s/dn_s])
```

::: definition Newton's method
To solve $f(x) = 0$, where $f$ is differentiable, choose a starting value $x_0$ and compute

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}, \qquad n = 0, 1, 2, \dots,$$

as long as $f'(x_n) \ne 0$. The numbers $x_0, x_1, x_2, \dots$ are the **iterates**. Stop when they no longer change to the accuracy you need.
:::

::: figure id=fig-07-3
Newton's method for $f(x) = x^2 - 2$, starting from $x_0 = 3$. The tangent line at $\big(x_0, f(x_0)\big)$ meets the $x$-axis at $x_1 \approx 1.83$; the tangent line at $\big(x_1, f(x_1)\big)$ meets it at $x_2 \approx 1.46$. The next iterate, $x_3 \approx 1.415$, is too close to the root $\sqrt2$ to tell apart at this scale.
:::

```check
it3 = [Integer(3)]
for _ in range(3):
    it3.append(it3[-1] - (it3[-1]**2 - 2)/(2*it3[-1]))
same(it3[1:], [Rational(11, 6), Rational(193, 132), Rational(72097, 50952)])
rounds(it3[1], '1.83'); rounds(it3[2], '1.46'); rounds(it3[3], '1.415')
```

To say how good an iterate is, count its correct decimals. An approximation $\tilde x$ (read "x tilde") of a number $r$ is **correct to $d$ decimal places** if $\abs{\tilde x - r} < 0.5 \times 10^{-d}$.

::: example Newton's method for $\sqrt2$
Use Newton's method to compute $\sqrt2$, starting from $x_0 = 1$.

$\sqrt2$ is the positive root of $f(x) = x^2 - 2$, with $f'(x) = 2x$. The step simplifies:

$$\begin{aligned} x_{n+1} &= x_n - \frac{x_n^2 - 2}{2x_n} = \frac{2x_n^2 - x_n^2 + 2}{2x_n} \\ &= \frac12\Big(x_n + \frac{2}{x_n}\Big). \end{aligned}$$

From $x_0 = 1$:

$$\begin{aligned} x_1 &= \tfrac12(1 + 2) = \tfrac32, \\ x_2 &= \tfrac12\Big(\tfrac32 + \tfrac43\Big) = \tfrac{17}{12}, \\ x_3 &= \tfrac12\Big(\tfrac{17}{12} + \tfrac{24}{17}\Big) = \tfrac{577}{408}. \end{aligned}$$

Two more steps, done exactly by computer, give the table; compare $\sqrt2 = 1.414213562373095\ldots$:

```valuetable
x_n = 1, 3/2, 17/12, 577/408, 665857/470832, 886731088897/627013566048
$x_n\text{ in decimals}$ = x_n
$x_n - \sqrt{2}$ = x_n - sqrt(2)
decimals = 15
---
x_{n} | x_n\text{ in decimals} | x_n - \sqrt{2}
1 | 1.000000000000000 | -0.414213562373095
\frac{3}{2} | 1.500000000000000 | 0.085786437626905
\frac{17}{12} | 1.416666666666667 | 0.002453104293572
\frac{577}{408} | 1.414215686274510 | 0.000002123901415
\frac{665857}{470832} | 1.414213562374690 | 0.000000000001595
\frac{886731088897}{627013566048} | 1.414213562373095 | 0.000000000000000
```

The iterates $x_0, \dots, x_5$ are correct to 0, 0, 2, 5, 11 and 23 decimal places: from $x_2$ on, each step roughly doubles the number of correct decimals. (The table shows 15 decimals, so the last row looks exact; its error is about $9 \times 10^{-25}$.)

```check
it2 = [Integer(1)]
for _ in range(5):
    it2.append((it2[-1] + 2/it2[-1])/2)
same(it2[1:4], [Rational(3, 2), Rational(17, 12), Rational(577, 408)])
same(it2[4:], [Rational(665857, 470832), Rational(886731088897, 627013566048)])
X2 = symbols('X', positive=True)
steps(X2 - (X2**2 - 2)/(2*X2), (2*X2**2 - X2**2 + 2)/(2*X2), (X2 + 2/X2)/2)
same((1 + 2)/Integer(2), Rational(3, 2)); same((Rational(3, 2) + Rational(4, 3))/2, Rational(17, 12)); same((Rational(17, 12) + Rational(24, 17))/2, Rational(577, 408))
same(2/Rational(3, 2), Rational(4, 3)); same(2/Rational(17, 12), Rational(24, 17))
rounds(sqrt(2), '1.414213562373095')
def correct_dp(v, r):
    """The number of correct decimal places of v as an approximation of r: the largest d with |v - r| < 0.5*10^(-d)."""
    e = abs(N(v - r, 80)); d = 0
    while e < Rational(1, 2)*Rational(1, 10)**(d + 1):
        d += 1
    return d
same([correct_dp(v, sqrt(2)) for v in it2], [0, 0, 2, 5, 11, 23])
rounds(it2[5] - sqrt(2), '9e-25')
```
:::

::: example Solving $\cos x = x$
Show that $\cos x = x$ has exactly one solution in $[0, 1]$, and find it with Newton's method from $x_0 = 1$.

Let $f(x) = \cos x - x$. Then $f(0) = 1 > 0$ and $f(1) = \cos 1 - 1 < 0$, so by the Intermediate Value Theorem (Module 3) $f$ has a root in $(0, 1)$. There is only one: on $[0, 1]$, $\cos x$ decreases (on the unit circle, the $x$-coordinate of the point at angle $x$ decreases as $x$ goes from 0 to $\pi$) and $-x$ decreases too, so $f$ is strictly decreasing and takes the value 0 only once.

With $f'(x) = -\sin x - 1$, Newton's step is

$$\begin{aligned} x_{n+1} &= x_n - \frac{\cos x_n - x_n}{-\sin x_n - 1} \\ &= x_n + \frac{\cos x_n - x_n}{\sin x_n + 1}. \end{aligned}$$

From $x_0 = 1$: $x_1 = 1 + \dfrac{\cos 1 - 1}{\sin 1 + 1} \approx 1 + \dfrac{-0.45970}{1.84147} \approx 0.75036$. Further steps (the compute box below does them) give

$$\begin{aligned} x_2 &\approx 0.7391129, \\ x_3 &\approx 0.739085133385, \\ x_4 &\approx 0.739085133215161, \end{aligned}$$

correct to 1, 4, 9 and 19 decimal places for $x_1, \dots, x_4$. The solution is $x \approx 0.739085133215161$, to 15 decimal places.

```check
fcx = cos(x) - x
holds(fcx.subs(x, 0) > 0); holds(fcx.subs(x, 1) < 0)
steps(x - fcx/diff(fcx, x), x - (cos(x) - x)/(-sin(x) - 1), x + (cos(x) - x)/(sin(x) + 1))
itc = [Integer(1)]
for _ in range(4):
    v_ = itc[-1]
    itc.append(N(v_ + (cos(v_) - v_)/(sin(v_) + 1), 80))
rounds(cos(1) - 1, '-0.45970'); rounds(sin(1) + 1, '1.84147')
rounds(itc[1], '0.75036'); rounds(itc[2], '0.7391129'); rounds(itc[3], '0.739085133385'); rounds(itc[4], '0.739085133215161')
rcos = nsolve(fcx, x, 0.74, prec=80)
same([correct_dp(v, rcos) for v in itc], [0, 1, 4, 9, 19])
rounds(rcos, '0.739085133215161')
```
:::

::: compute Newton's method in Python
A few lines of Python carry out Newton's method. Here are the iterates of Example 7.10, in floating point:

```python
import math

def newton(f, df, x, steps):
    for n in range(1, steps + 1):
        x = x - f(x)/df(x)
        print(f"x{n} = {x:.16f}   f(x{n}) = {f(x):.1e}")
    return x

f = lambda x: math.cos(x) - x
df = lambda x: -math.sin(x) - 1
root = newton(f, df, 1.0, 5)
```

```output
x1 = 0.7503638678402439   f(x1) = -1.9e-02
x2 = 0.7391128909113617   f(x2) = -4.6e-05
x3 = 0.7390851333852840   f(x3) = -2.8e-10
x4 = 0.7390851332151607   f(x4) = 0.0e+00
x5 = 0.7390851332151607   f(x5) = 0.0e+00
```

After four steps $f(x_4)$ is exactly 0 in floating point, and the fifth step changes nothing: the iterates have reached the limit of double precision, about 16 significant digits. Bisection would need more than 50 halvings of $[0, 1]$ to get as close.

Square roots work the same way. This function computes $\sqrt a$ with the step of Example 7.9, $x_{n+1} = \tfrac12(x_n + a/x_n)$. It starts above $\sqrt a$; Theorem 7.2 below shows that the iterates then decrease towards $\sqrt a$, so the function stops as soon as they stop decreasing:

```python
def my_sqrt(a):
    x = max(a, 1.0)               # a starting value above sqrt(a)
    steps = 0
    while True:
        new = (x + a/x)/2
        steps += 1
        if new >= x:              # no longer decreasing: as good as it gets
            return x, steps
        x = new

for a in [2.0, 3.0, 1e6]:
    print(a, my_sqrt(a), math.sqrt(a))
```

```output
2.0 (1.414213562373095, 6) 1.4142135623730951
3.0 (1.7320508075688772, 6) 1.7320508075688772
1000000.0 (1000.0, 16) 1000.0
```

For 3 and $10^6$ the answers agree with `math.sqrt` to the last digit. For 2 they differ by one unit in the 16th significant digit: `math.sqrt` returns the floating-point number closest to $\sqrt2$, and getting that last digit right takes more care than this short function does. The 16 steps for $10^6$ show the cost of a poor start: from $x_0 = 10^6$, each early step only halves $x$, because $a/x$ is tiny next to $x$; the digits start to double only near the root.
:::

```check
holds(Rational(1, 2)**50 > Rational(1, 10)**16)            # after 50 halvings the interval is still longer than 1e-16
rounds(53*log(2, 10), '16')                                # double precision: 53 binary digits, about 16 decimal digits
```

### Why the digits double {#quadratic}

For square roots, the doubling can be proved in a few lines.

::: theorem Newton's method for square roots
Let $a > 0$ and $x_0 > 0$, and let $x_{n+1} = \tfrac12\big(x_n + a/x_n\big)$ for $n = 0, 1, 2, \dots$. Then

$$x_{n+1} - \sqrt a = \frac{(x_n - \sqrt a)^2}{2x_n}.$$

Consequently $x_n \ge \sqrt a$ for every $n \ge 1$, the iterates decrease from $x_1$ on, and they approach $\sqrt a$.
:::

::: proof
All the iterates are positive: $x_0 > 0$, and each step averages two positive numbers. Put the step over a common denominator and subtract $\sqrt a$:

$$\begin{aligned} x_{n+1} - \sqrt a &= \frac{x_n^2 + a}{2x_n} - \sqrt a \\ &= \frac{x_n^2 - 2\sqrt a\,x_n + a}{2x_n} \\ &= \frac{(x_n - \sqrt a)^2}{2x_n}. \end{aligned}$$

The right side is never negative, so $x_{n+1} \ge \sqrt a$ for every $n \ge 0$: all the iterates from $x_1$ on are at least $\sqrt a$. For such an $x_n$, $a/x_n \le \sqrt a \le x_n$, so $x_{n+1}$, the average of $a/x_n$ and $x_n$, is at most $x_n$: the iterates decrease. Finally, write $e_n = x_n - \sqrt a$ for the error. For $n \ge 1$, $0 \le e_n < x_n$, so

$$e_{n+1} = e_n \cdot \frac{e_n}{2x_n} \le \frac{e_n}{2},$$

and $e_n \le e_1/2^{n-1}$, which approaches 0.
:::

```check
ap_, xp_ = symbols('a x', positive=True)
steps((xp_ + ap_/xp_)/2 - sqrt(ap_), (xp_**2 + ap_)/(2*xp_) - sqrt(ap_), (xp_**2 - 2*sqrt(ap_)*xp_ + ap_)/(2*xp_), (xp_ - sqrt(ap_))**2/(2*xp_))
```

The identity explains the table of Example 7.9. Near the root $2x_n \approx 2\sqrt2 \approx 2.8$, so $e_{n+1} \approx e_n^2/2.8$: an error of $10^{-5}$ becomes one of about $4 \times 10^{-11}$. Squaring the error doubles the number of zeros after the decimal point, so the number of correct digits doubles.

```check
rounds(2*sqrt(2), '2.8'); rounds(Rational(1, 10)**10/(2*sqrt(2)), '4e-11')
```

The same happens for any function with a nonzero derivative at its root.

::: theorem Newton's method converges quadratically
Let $f(r) = 0$. Suppose that $f'$ and $f''$ are continuous on an open interval containing $r$, and that $f'(r) \ne 0$. Then there is a $\delta > 0$ such that, for every starting value $x_0$ with $\abs{x_0 - r} < \delta$, Newton's method never meets $f'(x_n) = 0$, the iterates approach $r$, and their errors $e_n = x_n - r$ satisfy

$$\lim_{n\to\infty}\frac{e_{n+1}}{e_n^2} = \frac{f''(r)}{2f'(r)}$$

(if no iterate lands exactly on $r$). Each error is roughly a fixed multiple of the square of the one before: Newton's method **converges quadratically**.
:::

**The idea of the proof.** Newton's step solves $L_n(x) = 0$, where $L_n$ is the linearisation of $f$ at $x_n$. The root solves $f(r) = 0$ instead, and by Section 7.2 the error of the linearisation at $r$ is $f(r) - L_n(r) \approx \tfrac12 f''(x_n)(r - x_n)^2$, so $L_n(r) \approx -\tfrac12 f''(x_n)\,e_n^2$. But $L_n$ is a line of slope $f'(x_n)$ that is 0 at $x_{n+1}$, so $L_n(r) = f'(x_n)(r - x_{n+1}) = -f'(x_n)\,e_{n+1}$. Equating the two expressions for $L_n(r)$ gives

$$e_{n+1} \approx \frac{f''(x_n)}{2f'(x_n)}\,e_n^2.$$

Taylor's theorem (Module 15) controls the error of the first $\approx$ and turns this idea into a proof. For $f(x) = x^2 - a$ the constant is $\dfrac{2}{2 \cdot 2\sqrt a} = \dfrac{1}{2\sqrt a}$, as in Theorem 7.2; for $\sqrt2$ it is $1/(2\sqrt2) \approx 0.354$, and in Example 7.9 the errors indeed give $e_5/e_4^2 \approx 0.354$.

```check
rr_, xn1, d1 = symbols('r x_n1 d1')
Ln = lambda X: fn_s + d1*(X - xn_s)
xnext = solve(Ln(x), x)[0]
same(Ln(rr_), d1*(rr_ - xnext))                          # L_n(r) = f'(x_n)(r - x_{n+1})
same((diff(x**2 - ap_, x, 2)/(2*diff(x**2 - ap_, x))).subs(x, sqrt(ap_)), 1/(2*sqrt(ap_)))
rounds(1/(2*sqrt(2)), '0.354'); rounds((it2[5] - sqrt(2))/(it2[4] - sqrt(2))**2, '0.354')
```

### How computers compute square roots {#square-roots}

Programs compute square roots constantly, in graphics, physics simulations and machine learning, and a few Newton steps from a good starting value are one standard way to do it. Two ideas make it fast.

**A good start.** A floating-point number is stored as $a = m \times 2^e$, with $1 \le m < 2$ and a whole-number exponent $e$. Moving one factor 2 into $m$ if $e$ is odd makes $e$ even and $1 \le m < 4$, and then $\sqrt a = \sqrt m \times 2^{e/2}$. So only square roots of numbers between 1 and 4 are ever needed, and a small table, or a simple formula, can give a starting value with a small relative error, say at most 1%.

**Few steps.** Write $x_n = \sqrt a\,(1 + \varepsilon_n)$, so that $\varepsilon_n$ (Greek "epsilon") is the relative error of $x_n$. Dividing the identity of Theorem 7.2 by $\sqrt a$ gives

$$\varepsilon_{n+1} = \frac{\varepsilon_n^2}{2(1 + \varepsilon_n)}.$$

From $\abs{\varepsilon_0} \le 0.01$: $\varepsilon_1 \le 0.0001/(2 \times 0.99) \approx 5.1 \times 10^{-5}$, and from then on $\varepsilon_n \ge 0$, so $\varepsilon_{n+1} \le \varepsilon_n^2/2$, which gives $\varepsilon_2 \le 1.3 \times 10^{-9}$ and $\varepsilon_3 \le 8.1 \times 10^{-19}$. That is far below the precision of double-precision numbers, a relative error of about $1.1 \times 10^{-16}$: three steps are enough.

```check
ep = symbols('epsilon')
same(((sqrt(ap_)*(1 + ep) + ap_/(sqrt(ap_)*(1 + ep)))/2 - sqrt(ap_))/sqrt(ap_), ep**2/(2*(1 + ep)))
b1 = Rational(1, 10000)/(2*Rational(99, 100)); b2 = b1**2/2; b3 = b2**2/2
holds(b1 >= Rational(1, 10000)/(2*(1 - Rational(1, 100))))
rounds(b1, '5.1e-5'); rounds(b2, '1.3e-9'); rounds(b3, '8.1e-19'); rounds(Rational(1, 2)**53, '1.1e-16'); holds(b3 < Rational(1, 2)**53)
```

Division is slower than multiplication on most processors, so where speed matters a division-free variant is popular: Newton's method applied to $1/y^2 - a = 0$, whose root is $1/\sqrt a$, needs only multiplications (Exercise 7.10). Graphics programs, for example, need $1/\sqrt a$ to scale vectors to length 1.

### When Newton's method fails {#newton-failures}

Theorem 7.3 promises success when $x_0$ is close enough to a root at which $f'$ is not 0, and nothing otherwise. Outside those conditions Newton's method can fail in several ways (Figure 7.4):

- **A horizontal tangent.** If $f'(x_n) = 0$, the tangent line is horizontal and never meets the $x$-axis: there is no next iterate. For $f(x) = x^2 - 2$ this happens at $x_0 = 0$. If $f'(x_n)$ is merely small, the next iterate lands far away: from $x_0 = 0.1$, $x_1 = 10.05$.
- **A cycle.** For $f(x) = x^3 - 2x + 2$ from $x_0 = 0$: $f(0) = 2$ and $f'(0) = -2$, so $x_1 = 0 - 2/(-2) = 1$; then $f(1) = 1$ and $f'(1) = 1$, so $x_2 = 1 - 1 = 0$. The iterates alternate between 0 and 1 for ever, while the only real root is near $-1.769$.
- **Running away.** The iterates move further and further from the root (Example 7.11).
- **Leaving the domain.** For $f(x) = \ln x$ from $x_0 = 3$, $x_1 = 3 - 3\ln 3 \approx -0.296$, where $\ln$ is not defined.
- **Slow convergence.** At a root where $f'(r) = 0$ as well, such as the double root 1 of $(x - 1)^2$, the step is $x_{n+1} = x_n - \tfrac12(x_n - 1)$: the error only halves at each step, no better than bisection.

```check
same((x - (x**2 - 2)/(2*x)).subs(x, Rational(1, 10)), Rational(1005, 100)); same(diff(x**2 - 2, x).subs(x, 0), 0)
fcy = x**3 - 2*x + 2
same([fcy.subs(x, 0), diff(fcy, x).subs(x, 0)], [2, -2]); same([fcy.subs(x, 1), diff(fcy, x).subs(x, 1)], [1, 1])
same(0 - Rational(2, -2), 1); same(1 - Rational(1, 1), 0)
rcy = real_roots(fcy); same(len(rcy), 1); rounds(rcy[0], '-1.769')
same(x - log(x)/diff(log(x), x), x - x*log(x)); rounds(3 - 3*log(3), '-0.296')
same(simplify(x - (x - 1)**2/diff((x - 1)**2, x)), x - (x - 1)/2)
```

::: example A root that Newton's method cannot find
Show that Newton's method for $f(x) = \sqrt[3]{x}$ moves away from the root 0, from every starting value $x_0 \ne 0$.

For $x \ne 0$, $f'(x) = \dfrac{1}{3\sqrt[3]{x}^{\,2}}$: $\sqrt[3]{x}$ is the inverse of $x^3$, and the derivative of an inverse function (Module 6) is $1/\big(3u^2\big)$ at $u = \sqrt[3]{x}$. So, writing $u = \sqrt[3]{x_n}$, so that $x_n = u^3$,

$$\begin{aligned} x_{n+1} &= x_n - \frac{u}{1/(3u^2)} = x_n - 3u^3 \\ &= x_n - 3x_n = -2x_n. \end{aligned}$$

Each step doubles the distance from the root and switches sides: from $x_0 = 1$ the iterates are $-2, 4, -8, 16, \dots$ (Figure 7.4, right). Theorem 7.3 does not apply, because $f'(0)$ does not exist: the graph has a vertical tangent at its root, and the tangent lines near it are so flat that each one overshoots.

```check
up = symbols('u', nonzero=True, real=True)
same(1/diff(up**3, up), 1/(3*up**2))
steps(up**3 - up/(1/(3*up**2)), up**3 - 3*up**3, -2*up**3)
itr = [1]
for _ in range(4):
    itr.append(-2*itr[-1])
same(itr, [1, -2, 4, -8, 16])
limit_is(real_root(x, 3)/x, x, 0, oo, '+')        # the graph is vertical at 0: no derivative there
```
:::

::: figure id=fig-07-4
Two failures of Newton's method. Left: for $f(x) = x^3 - 2x + 2$ from $x_0 = 0$, the tangent at $x_0$ leads to $x_1 = 1$, and the tangent at $x_1$ leads back to 0; the only root, near $-1.769$ (green), is never reached. Right: for $f(x) = \sqrt[3]{x}$ from $x_0 = 1$, each tangent overshoots the root 0 (green) and lands twice as far away on the other side.
:::

::: tip
In practice: start close to the root (a graph, a table of values or a few steps of bisection tell you where it is), watch $\abs{f(x_n)}$ and the step $\abs{x_{n+1} - x_n}$ shrink, and give up after a fixed number of steps if they do not. Good equation solvers combine the safety of bisection with the speed of Newton's method.
:::

::: widget name=newton-method
Choose a function and a starting point $x_0$, then press **Step**: each step draws the tangent line at the current point down to the $x$-axis, and the table lists $x_n$, its number of correct decimal places, and $f(x_n)$. With $x^2 - 2$ from $x_0 = 1$, watch the correct decimals go 0, 0, 2, 5, 11, 15; the last is the limit of double precision. Then try the failures: $x_0 = 0$ for $x^2 - 2$; $x^3 - 2x + 2$ from $x_0 = 0$; $\sqrt[3]{x}$ from any $x_0$; and type `ln(x)` with $x_0 = 3$. Finally try $x^3 - 2x - 5$ from $x_0 = 0.8$, near a point where $f'(x) = 0$, and see how far the first step goes.
:::

```check
fcu = x**3 - 2*x - 5
same((x - fcu/diff(fcu, x)).subs(x, Rational(8, 10)), Rational(8, 10) - Rational(-6088, 1000)/Rational(-8, 100))
rounds((x - fcu/diff(fcu, x)).subs(x, Rational(8, 10)), '-75.3')
```

## L'Hôpital's rule {#lhopital}

Module 2 evaluated limits of the form $0/0$ by algebra: factor and cancel, rationalise, or squeeze. Many such limits resist algebra. What is

$$\lim_{x\to0}\frac{e^{2x} - 1}{\sin 3x}?$$

The numerator and the denominator both approach 0, and there is nothing to cancel. The numbers suggest $2/3$:

```valuetable
x = 0.1, 0.01, 0.001, -0.001, -0.01, -0.1
$e^{2x} - 1$ = exp(2*x) - 1
$\sin 3x$ = sin(3*x)
$\dfrac{e^{2x} - 1}{\sin 3x}$ = (exp(2*x) - 1)/sin(3*x)
digits = 6
---
x | e^{2x} - 1 | \sin 3x | \dfrac{e^{2x} - 1}{\sin 3x}
0.1 | 0.221403 | 0.295520 | 0.749197
0.01 | 0.0202013 | 0.0299955 | 0.673479
0.001 | 0.00200200 | 0.00300000 | 0.667335
-0.001 | -0.00199800 | -0.00300000 | 0.666001
-0.01 | -0.0198013 | -0.0299955 | 0.660143
-0.1 | -0.181269 | -0.295520 | 0.613390
```

Figure 7.5 shows why. Near 0 each function is close to its tangent line there: $e^{2x} - 1 \approx 2x$, since its derivative at 0 is 2, and $\sin 3x \approx 3x$, since its derivative at 0 is 3. So the ratio is close to $2x/3x = 2/3$: the ratio of the slopes.

```check
same(diff(exp(2*x) - 1, x).subs(x, 0), 2); same(diff(sin(3*x), x).subs(x, 0), 3)
```

::: figure id=fig-07-5
Left: $e^{2x} - 1$ and $\sin 3x$ both pass through the origin, close to their tangent lines $y = 2x$ and $y = 3x$ (dashed). Right: their ratio, which is not defined at 0 (the hollow dot), approaches $2/3$, the ratio of the slopes of the tangent lines.
:::

::: definition Indeterminate forms $0/0$ and $\infty/\infty$
If $f(x) \to 0$ and $g(x) \to 0$ as $x \to a$, the limit of $f(x)/g(x)$ has the **indeterminate form** $0/0$. If $f(x) \to \pm\infty$ and $g(x) \to \pm\infty$, it has the indeterminate form $\infty/\infty$. Here $a$ may be a number, $\infty$ or $-\infty$, and the limits may be one-sided.
:::

"Indeterminate" means that the form alone does not decide the limit. As $x \to 0$, $x/x \to 1$, $x^2/x \to 0$ and $x/x^3 \to \infty$, all of the form $0/0$: you must look more closely at $f$ and $g$.

```check
limit_is(x/x, x, 0, 1); limit_is(x**2/x, x, 0, 0); limit_is(x/x**3, x, 0, oo)
```

### The rule {#the-rule}

::: theorem L'Hôpital's rule, simple form
Let $f$ and $g$ be defined on an open interval containing $a$, with $f(a) = g(a) = 0$. If $f'(a)$ and $g'(a)$ exist and $g'(a) \ne 0$, then

$$\lim_{x\to a}\frac{f(x)}{g(x)} = \frac{f'(a)}{g'(a)}.$$
:::

::: proof
For $x \ne a$ in the interval, subtract $f(a) = 0$ and $g(a) = 0$, then divide the numerator and the denominator by $x - a \ne 0$:

$$\frac{f(x)}{g(x)} = \frac{f(x) - f(a)}{g(x) - g(a)} = \frac{\dfrac{f(x) - f(a)}{x - a}}{\dfrac{g(x) - g(a)}{x - a}}.$$

As $x \to a$, the numerator approaches $f'(a)$ and the denominator approaches $g'(a)$, by the definition of the derivative (Module 4). Since $g'(a) \ne 0$, the quotient law for limits (Module 2) gives the limit $f'(a)/g'(a)$.

One detail remains: $f(x)/g(x)$ must be defined for $x$ near $a$, that is, $g(x) \ne 0$. The difference quotient of $g$ approaches $g'(a) \ne 0$, so for $x$ close enough to $a$ it lies within $\abs{g'(a)}/2$ of $g'(a)$ and is not 0; then $g(x) = (x - a) \cdot \dfrac{g(x) - g(a)}{x - a} \ne 0$ for those $x \ne a$.
:::

```check
gg = Function('g')
same((ff(x) - 0)/(gg(x) - 0), ((ff(x) - 0)/(x - a))/((gg(x) - 0)/(x - a)))
```

::: example The ratio of the slopes
Find $\displaystyle\lim_{x\to0}\frac{e^{2x} - 1}{\sin 3x}$.

Let $f(x) = e^{2x} - 1$ and $g(x) = \sin 3x$. Both are differentiable everywhere, with $f(0) = e^0 - 1 = 0$ and $g(0) = \sin 0 = 0$. By the chain rule $f'(x) = 2e^{2x}$ and $g'(x) = 3\cos 3x$, so $f'(0) = 2$ and $g'(0) = 3 \ne 0$. By Theorem 7.4,

$$\lim_{x\to0}\frac{e^{2x} - 1}{\sin 3x} = \frac{f'(0)}{g'(0)} = \frac{2}{3},$$

as the table and Figure 7.5 suggested.

```check
same((exp(2*x) - 1).subs(x, 0), 0); same(sin(3*x).subs(x, 0), 0)
same(diff(exp(2*x) - 1, x), 2*exp(2*x)); same(diff(sin(3*x), x), 3*cos(3*x))
limit_is((exp(2*x) - 1)/sin(3*x), x, 0, Rational(2, 3))
```
:::

The simple form needs $f(a) = g(a) = 0$ and $g'(a) \ne 0$, and often one of these fails: $f$ and $g$ may not be defined at $a$, $a$ may be $\infty$, or $g'(a)$ may be 0 as well. The general rule compares the limit of $f/g$ with the limit of $f'/g'$ instead of with values at $a$.

::: theorem L'Hôpital's rule
Let $f$ and $g$ be differentiable on an open interval $I$ containing $a$, except possibly at $a$ itself, with $g'(x) \ne 0$ for every $x \ne a$ in $I$. Suppose that the limit of $f(x)/g(x)$ as $x \to a$ has one of the indeterminate forms $0/0$ or $\infty/\infty$. If

$$\lim_{x\to a}\frac{f'(x)}{g'(x)} = L,$$

where $L$ is a real number, $\infty$ or $-\infty$, then

$$\lim_{x\to a}\frac{f(x)}{g(x)} = L.$$

The same holds for one-sided limits, with $I$ an open interval that has $a$ as an endpoint, and for $x \to \infty$ or $x \to -\infty$, with $I$ an interval $(b, \infty)$ or $(-\infty, b)$.
:::

Module 8 proves this general form, in a Going deeper box, with Cauchy's mean value theorem; the proof needs tools that you do not have yet. Each hypothesis is needed. The form must be indeterminate (the first pitfall below); $g'$ must not be 0 near $a$, so that $f'/g'$ is defined there; and the limit of $f'/g'$ must exist: if it does not, the rule says nothing (the third pitfall).

::: example Using the rule twice
Find $\displaystyle\lim_{x\to0}\frac{e^x - 1 - x}{x^2}$.

At $x = 0$ the numerator is $1 - 1 - 0 = 0$ and the denominator is 0: the form is $0/0$. The simple form does not apply, because the derivative of $x^2$, $2x$, is 0 at 0. Theorem 7.5 applies (near 0, $2x \ne 0$ except at 0) and says that the limit equals

$$\lim_{x\to0}\frac{e^x - 1}{2x},$$

if this limit exists. It has the form $0/0$ again, and now the simple form applies: $f_1(x) = e^x - 1$ and $g_1(x) = 2x$ have $f_1(0) = g_1(0) = 0$, $f_1'(0) = e^0 = 1$ and $g_1'(0) = 2 \ne 0$, so this limit is $\tfrac12$. Therefore

$$\lim_{x\to0}\frac{e^x - 1 - x}{x^2} = \frac12.$$

The answer says something about $e^x$: near 0, $e^x - 1 - x \approx \tfrac12 x^2$, that is, $e^x \approx 1 + x + \tfrac12 x^2$, a better approximation than the linearisation $1 + x$. Module 15 takes this idea much further.

```check
same((exp(x) - 1 - x).subs(x, 0), 0); same(diff(x**2, x).subs(x, 0), 0)
same(diff(exp(x) - 1 - x, x), exp(x) - 1); same(diff(x**2, x), 2*x)
same(diff(exp(x) - 1, x).subs(x, 0), 1); same(diff(2*x, x), 2)
limit_is((exp(x) - 1)/(2*x), x, 0, Rational(1, 2)); limit_is((exp(x) - 1 - x)/x**2, x, 0, Rational(1, 2))
```
:::

::: example A limit at infinity
In machine learning, the **softplus** function $s(x) = \ln(1 + e^x)$ is a smooth version of the function $\operatorname{ReLU}(x) = \max(0, x)$ of [Section 1.3](module_01_EN.html#piecewise). Show that $s(x)/x \to 1$ as $x \to \infty$.

As $x \to \infty$, $\ln(1 + e^x) \to \infty$ and $x \to \infty$: the form is $\infty/\infty$. The derivatives are $\dfrac{e^x}{1 + e^x}$ (chain rule) and 1, which is never 0, and dividing the numerator and the denominator by $e^x$,

$$\begin{aligned} \lim_{x\to\infty}\frac{e^x/(1 + e^x)}{1} &= \lim_{x\to\infty}\frac{1}{e^{-x} + 1} \\ &= \frac{1}{0 + 1} = 1. \end{aligned}$$

By Theorem 7.5, $s(x)/x \to 1$: for large $x$, softplus behaves like ReLU, which equals $x$ there.

```check
limit_is(log(1 + exp(x)), x, oo, oo)
same(diff(log(1 + exp(x)), x), exp(x)/(1 + exp(x))); same(exp(x)/(1 + exp(x)), 1/(exp(-x) + 1))
limit_is(1/(exp(-x) + 1), x, oo, 1); limit_is(log(1 + exp(x))/x, x, oo, 1)
```
:::

### Using the rule correctly {#using-the-rule}

::: pitfall
**Check the form first.** L'Hôpital's rule applies only to $0/0$ and $\infty/\infty$. Take $\displaystyle\lim_{x\to0}\frac{1 - \cos x}{x + x^2}$. It has the form $0/0$, and the rule gives $\displaystyle\lim_{x\to0}\frac{\sin x}{1 + 2x} = \frac{0}{1} = 0$, the right answer. Applying the rule again, to $\dfrac{\sin x}{1 + 2x}$, which is not indeterminate, gives $\dfrac{\cos x}{2} \to \dfrac12$: wrong. At each stage, substitute first, and differentiate only if the result is $0/0$ or $\infty/\infty$.

```check
limit_is((1 - cos(x))/(x + x**2), x, 0, 0); limit_is(sin(x)/(1 + 2*x), x, 0, 0)
same(diff(sin(x), x)/diff(1 + 2*x, x), cos(x)/2); limit_is(cos(x)/2, x, 0, Rational(1, 2))
```
:::

::: pitfall
**Differentiate the top and the bottom separately.** The rule uses $\dfrac{f'(x)}{g'(x)}$, the quotient of two derivatives, not $\Big(\dfrac{f}{g}\Big)'(x)$, the derivative of the quotient. Reaching for the quotient rule of Module 5 here is a common slip, and it gives a different expression with, in general, a different limit.
:::

::: pitfall
**The converse is false.** If $f'/g'$ has no limit, the rule says nothing about $f/g$. As $x \to \infty$, $\dfrac{x + \sin x}{x} = 1 + \dfrac{\sin x}{x} \to 1$ (by the squeeze theorem, since $\abs{\sin x/x} \le 1/x$), but the quotient of the derivatives, $\dfrac{1 + \cos x}{1}$, keeps swinging between 0 and 2 and has no limit.

```check
limit_is((x + sin(x))/x, x, oo, 1); same(diff(x + sin(x), x)/diff(x, x), 1 + cos(x))
same([(1 + cos(x)).subs(x, 2*k*pi) for k in (1, 2, 3)], [2, 2, 2]); same([(1 + cos(x)).subs(x, (2*k + 1)*pi) for k in (1, 2, 3)], [0, 0, 0])
```
:::

::: note
L'Hôpital's rule gives $\displaystyle\lim_{\theta\to0}\frac{\sin\theta}{\theta} = \frac{\cos 0}{1} = 1$ in one line, but as a proof that would be circular: the derivative of $\sin$, which the rule uses, was found from this very limit (Modules 2 and 5). The rule is a tool for limits whose ingredients you can already differentiate.

```check
limit_is(sin(theta)/theta, theta, 0, 1); same(cos(0)/1, 1)
```
:::

## Other indeterminate forms {#other-forms}

Products, differences and powers have indeterminate forms too. As $x \to \infty$, $1/x \to 0$ and $x \to \infty$, yet

$$\frac{1}{x}\cdot x \to 1, \qquad \frac{1}{x^2}\cdot x \to 0, \qquad \frac{1}{x}\cdot x^2 \to \infty.$$

A product of the form $0\cdot\infty$ can approach anything. The same is true of differences of the form $\infty - \infty$ and of powers of the forms $1^\infty$, $0^0$ and $\infty^0$; these are **indeterminate forms** too. The strategy for each is to rewrite the expression as a quotient of the form $0/0$ or $\infty/\infty$, and use L'Hôpital's rule.

```check
limit_is(1/x*x, x, oo, 1); limit_is(1/x**2*x, x, oo, 0); limit_is(1/x*x**2, x, oo, oo)
```

### Products and differences {#products-differences}

**A product** $fg$ of the form $0\cdot\infty$ becomes a quotient when you divide by the reciprocal of one factor: $fg = \dfrac{f}{1/g}$, of the form $0/0$, or $fg = \dfrac{g}{1/f}$, of the form $\infty/\infty$. Choose the one with the simpler derivatives.

::: example $x\ln x$ near 0
Find $\displaystyle\lim_{x\to0^+} x\ln x$.

As $x \to 0^+$, $x \to 0$ and $\ln x \to -\infty$: the form is $0\cdot\infty$. Write the product as $\dfrac{\ln x}{1/x}$, of the form $\infty/\infty$ (the top approaches $-\infty$, the bottom $\infty$). The quotient of the derivatives is

$$\frac{1/x}{-1/x^2} = -x \;\to\; 0,$$

and $-1/x^2 \ne 0$, so by Theorem 7.5

$$\lim_{x\to0^+} x\ln x = 0.$$

The factor $x$ wins against $\ln x$. The other choice, $\dfrac{x}{1/\ln x}$, leads to $\dfrac{1}{-1/\big(x(\ln x)^2\big)} = -x(\ln x)^2$, which is worse than where you started.

```check
limit_is(log(x), x, 0, -oo, '+'); limit_is(1/x, x, 0, oo, '+')
same(diff(log(x), x)/diff(1/x, x), -x); limit_is(x*log(x), x, 0, 0, '+')
same(diff(1/log(x), x), -1/(x*log(x)**2)); same(diff(x, x)/diff(1/log(x), x), -x*log(x)**2)
```
:::

**A difference** of the form $\infty - \infty$ usually becomes a quotient when you put it over a common denominator; sometimes factoring or rationalising does it.

::: example A difference of the form $\infty - \infty$
Find $\displaystyle\lim_{x\to1}\Big(\frac{x}{x - 1} - \frac{1}{\ln x}\Big)$.

As $x \to 1^+$ both terms approach $\infty$, and as $x \to 1^-$ both approach $-\infty$. Over the common denominator $(x - 1)\ln x$,

$$\frac{x}{x - 1} - \frac{1}{\ln x} = \frac{x\ln x - (x - 1)}{(x - 1)\ln x},$$

of the form $0/0$ at $x = 1$. Differentiate the top and the bottom, each with the product rule:

$$\frac{\ln x + 1 - 1}{\ln x + (x - 1)/x} = \frac{\ln x}{\ln x + 1 - 1/x}.$$

Theorem 7.5 needs the derivative of the bottom to be non-zero near 1, except at 1, and it is: for $x > 1$, $\ln x$ and $1 - 1/x$ are both positive, and for $0 < x < 1$ both are negative. The new quotient is $0/0$ again, and now the simple form applies with $f(x) = \ln x$ and $g(x) = \ln x + 1 - 1/x$: $f'(1) = 1$ and, since $g'(x) = 1/x + 1/x^2$, $g'(1) = 2$. So, by Theorems 7.4 and 7.5,

$$\lim_{x\to1}\Big(\frac{x}{x - 1} - \frac{1}{\ln x}\Big) = \frac12.$$

```check
e716 = x/(x - 1) - 1/log(x)
same(e716, (x*log(x) - (x - 1))/((x - 1)*log(x)))
same(diff(x*log(x) - (x - 1), x), log(x)); same(diff((x - 1)*log(x), x), log(x) + (x - 1)/x); same(log(x) + (x - 1)/x, log(x) + 1 - 1/x)
same(diff(log(x) + 1 - 1/x, x), 1/x + 1/x**2); same((1/x + 1/x**2).subs(x, 1), 2); same(diff(log(x), x).subs(x, 1), 1)
holds((log(x) + 1 - 1/x).subs(x, Rational(11, 10)) > 0); holds((log(x) + 1 - 1/x).subs(x, Rational(9, 10)) < 0)
limit_is(e716, x, 1, Rational(1, 2), '+'); limit_is(e716, x, 1, Rational(1, 2), '-')
limit_is(log(x)/(log(x) + 1 - 1/x), x, 1, Rational(1, 2))
```
:::

### Powers {#powers}

The forms $1^\infty$, $0^0$ and $\infty^0$ arise in limits of $f(x)^{g(x)}$, with $f(x) > 0$. Take logarithms: if $y = f(x)^{g(x)}$, then

$$\ln y = g(x)\ln f(x),$$

which has the form $0\cdot\infty$ in all three cases. Find the limit $L$ of $\ln y$; then, because $e^x$ is continuous (Module 3), $y = e^{\ln y}$ approaches $e^L$.

::: example The limit that defines $e$
Show that $\displaystyle\lim_{x\to\infty}\Big(1 + \frac{a}{x}\Big)^x = e^a$ for every real number $a$, and deduce that $\Big(1 + \dfrac1n\Big)^n \to e$ as $n \to \infty$.

For $a = 0$ every value is $1^x = 1 = e^0$. For $a \ne 0$ the form is $1^\infty$. Let $y = (1 + a/x)^x$, for $x > \abs{a}$, so that $1 + a/x > 0$. Then

$$\ln y = x\ln\Big(1 + \frac{a}{x}\Big) = \frac{\ln(1 + a/x)}{1/x},$$

of the form $0/0$. Differentiate the top (chain rule) and the bottom:

$$\frac{\dfrac{1}{1 + a/x}\cdot\Big(-\dfrac{a}{x^2}\Big)}{-\dfrac{1}{x^2}} = \frac{a}{1 + a/x} \;\to\; a.$$

So $\ln y \to a$ by Theorem 7.5, and $y \to e^a$. With $a = 1$, $(1 + 1/x)^x \to e$ as $x \to \infty$, and therefore also as $x$ runs through the whole numbers $n = 1, 2, 3, \dots$.

```check
ar = symbols('a', real=True)
same(x*log(1 + ar/x), log(1 + ar/x)/(1/x))
same(diff(log(1 + ar/x), x), 1/(1 + ar/x)*(-ar/x**2)); same(diff(1/x, x), -1/x**2)
same(diff(log(1 + ar/x), x)/diff(1/x, x), ar/(1 + ar/x)); limit_is(ar/(1 + ar/x), x, oo, ar)
limit_is(log(1 + ar/x), x, oo, 0); limit_is((1 + ar/x)**x, x, oo, exp(ar)); limit_is((1 + 1/n)**n, n, oo, E)
```
:::

This is the compound interest of Module 6. Interest at a rate $a$ a year, added $n$ times a year, multiplies money by $(1 + a/n)^n$ in a year, and as $n$ grows that approaches $e^a$, the factor for interest added continuously.

::: example $0^0$ and $\infty^0$
Find $\displaystyle\lim_{x\to0^+} x^x$ and $\displaystyle\lim_{x\to\infty} x^{1/x}$.

**$x^x$, of the form $0^0$.** $\ln\big(x^x\big) = x\ln x \to 0$ as $x \to 0^+$, by Example 7.15. So $x^x \to e^0 = 1$.

**$x^{1/x}$, of the form $\infty^0$.** $\ln\big(x^{1/x}\big) = \dfrac{\ln x}{x}$, of the form $\infty/\infty$, and the quotient of the derivatives is $\dfrac{1/x}{1} \to 0$. So $x^{1/x} \to e^0 = 1$; for example, $1000^{1/1000} \approx 1.0069$.

```check
xq = symbols('x', positive=True)
same(expand_log(log(xq**xq)), xq*log(xq)); same(expand_log(log(xq**(1/xq))), log(xq)/xq)
limit_is(x**x, x, 0, 1, '+'); same(diff(log(x), x)/diff(x, x), 1/x); limit_is(x**(1/x), x, oo, 1)
rounds(Integer(1000)**Rational(1, 1000), '1.0069')
```
:::

::: pitfall
Indeterminate means undecided, not "equal to 1". By Example 7.17, forms $1^\infty$ can approach $e$, or any positive number $e^a$. Forms $0^0$ need not approach 1 either: for $0 < x < 1$, $x^{1/\ln x} = e^{\ln x/\ln x} = e$, so as $x \to 0^+$, where it has the form $0^0$, it approaches $e$. And remember the last step: when $\ln y \to L$, the answer is $e^L$, not $L$.

```check
same(exp(log(xq)/log(xq)), E); limit_is(x**(1/log(x)), x, 0, E, '+'); limit_is(1/log(x), x, 0, 0, '+')
```
:::

::: compute Limits with SymPy, and indeterminate forms in floating point
SymPy's `limit` evaluates the limits of this section and the last. Its fourth argument is the direction: `'+-'` for a two-sided limit, `'+'` or `'-'` for a one-sided one. Leave it out and SymPy takes the limit from the right, which is not what $x \to 0$ means. The answers agree with the examples:

```python
import sympy as sp
x = sp.symbols('x')
print(sp.limit((sp.exp(2*x) - 1)/sp.sin(3*x), x, 0, '+-'))
print(sp.limit((sp.exp(x) - 1 - x)/x**2, x, 0, '+-'))
print(sp.limit(x*sp.log(x), x, 0, '+'))
print(sp.limit(x/(x - 1) - 1/sp.log(x), x, 1, '+-'))
print(sp.limit((1 + 1/x)**x, x, sp.oo))
```

```output
2/3
1/2
0
1/2
E
```

Floating-point arithmetic has its own answers to indeterminate forms, mostly fixed by the IEEE 754 standard for floating-point arithmetic. The forms $0\cdot\infty$, $\infty - \infty$ and $\infty/\infty$ give `nan`, "not a number", and in Python $0/0$ raises an error:

```python
import math
inf = math.inf
print(0.0*inf, inf - inf, inf/inf)
print(0.0**0.0, 1.0**inf, inf**0.0)
```

```output
nan nan nan
1.0 1.0 1.0
```

```python fails
print(0.0/0.0)
```

```output
ZeroDivisionError: float division by zero
```

The three powers come out as 1.0. That is a convention, convenient in programs, not a limit: $(1 + 1/n)^n$ has the form $1^\infty$ and approaches $e$. Floating point can even get that limit badly wrong:

```python
for n in [10, 10**6, 10**12, 10**15, 10**16]:
    print(n, (1 + 1/n)**n)
```

```output
10 2.5937424601000023
1000000 2.7182804690957534
1000000000000 2.7185234960372378
1000000000000000 3.035035206549262
10000000000000000 1.0
```

Up to $n = 10^6$ the values approach $e = 2.71828\ldots$; then they go wrong. For $n = 10^{16}$, $1 + 10^{-16}$ rounds to exactly 1, and $1^n = 1$. For $n = 10^{12}$ and $10^{15}$, $1 + 1/n$ is stored with a tiny relative error, and raising it to the power $n$ multiplies that error by about $n$: the condition number of $u^n$ is $n$ (the note in Section 7.3). The cure is to avoid forming $1 + 1/n$ at all: `math.log1p(u)` computes $\ln(1 + u)$ accurately for small $u$, and $(1 + 1/n)^n = e^{n\ln(1 + 1/n)}$.

```python
n = 10**15
print(math.exp(n*math.log1p(1/n)), math.e)
```

```output
2.7182818284590438 2.718281828459045
```
:::

```check
rounds(E, '2.71828'); same(x*diff(x**n, x)/x**n, n)
holds(Rational(1, 10**16) < Rational(1, 2)**53)            # 1 + 10^-16 is nearer 1 than the next double, 1 + 2^-52
```

## Comparing growth rates {#growth}

Module 3 ranked functions by how fast they grow as $x \to \infty$: logarithms grow more slowly than powers, and powers more slowly than exponentials. That ranking is why an algorithm whose running time grows like $n^2$ beats one that grows like $2^n$ on large inputs. L'Hôpital's rule proves it.

::: theorem Logarithms grow more slowly than powers
For every $p > 0$,

$$\lim_{x\to\infty}\frac{\ln x}{x^p} = 0.$$
:::

::: proof
As $x \to \infty$, $\ln x \to \infty$ and $x^p \to \infty$, and the derivative of $x^p$, $px^{p-1}$ (Module 6), is not 0 for $x > 0$. The quotient of the derivatives is

$$\frac{1/x}{px^{p-1}} = \frac{1}{px^p} \;\to\; 0,$$

so by L'Hôpital's rule (Theorem 7.5) $\ln x/x^p \to 0$.
:::

```check
pp_ = symbols('p', positive=True)
same(diff(x**pp_, x), pp_*x**(pp_ - 1)); same((1/x)/(pp_*x**(pp_ - 1)), 1/(pp_*x**pp_))
limit_is(log(x)/x**pp_, x, oo, 0)
```

The theorem holds for every $p > 0$, however small, but for small $p$ the limit takes its time. The table shows $\ln x/x^{0.1}$: it climbs to a largest value of $10/e \approx 3.68$, at $x = e^{10} \approx 22\,026$ (Module 8 shows how to find such maxima), and only then falls, slowly.

```valuetable
x = 10, Pow(10, 4, evaluate=False), Pow(10, 10, evaluate=False), Pow(10, 20, evaluate=False), Pow(10, 50, evaluate=False), Pow(10, 100, evaluate=False)
$\dfrac{\ln x}{x^{0.1}}$ = log(x)/x**(1/10)
digits = 4
---
x | \dfrac{\ln x}{x^{0.1}}
10 | 1.829
10^{4} | 3.667
10^{10} | 2.303
10^{20} | 0.4605
10^{50} | 0.001151
10^{100} | 2.303\times10^{-8}
```

```check
gr = log(x)/x**Rational(1, 10)
same(gr.subs(x, exp(10)), 10/E); rounds(10/E, '3.68'); rounds(exp(10), '22026')
same(solve(diff(gr, x), x), [exp(10)])
```

::: theorem Powers grow more slowly than exponentials
For every real number $p$ and every $a > 1$,

$$\lim_{x\to\infty}\frac{x^p}{a^x} = 0.$$
:::

::: proof
First let $a = e$ and let $p = n$ be a whole number, $n \ge 1$. The quotient $x^n/e^x$ has the form $\infty/\infty$, and the derivative of $e^x$ is never 0. L'Hôpital's rule turns it into $nx^{n-1}/e^x$, which has the form $\infty/\infty$ again if $n \ge 2$. After $n$ applications,

$$\frac{x^n}{e^x},\; \frac{nx^{n-1}}{e^x},\; \frac{n(n-1)x^{n-2}}{e^x},\; \dots,\; \frac{n!}{e^x},$$

where $n! = n(n-1)\cdots2\cdot1$ (Module 3). The last quotient approaches 0. By Theorem 7.5 each quotient in the list has the same limit as the next one, so, working backwards, all of them approach 0. (For $n = 0$, $1/e^x \to 0$ directly.)

Next, any real $p$: choose a whole number $n \ge p$. For $x \ge 1$, $x^p \le x^n$, so $0 < x^p/e^x \le x^n/e^x$, and the squeeze theorem (Module 2) gives $x^p/e^x \to 0$.

Finally, any $a > 1$: then $\ln a > 0$ and $a^x = e^{x\ln a}$. Put $u = x\ln a$, which approaches $\infty$ with $x$; then

$$\frac{x^p}{a^x} = \frac{(u/\ln a)^p}{e^u} = \frac{1}{(\ln a)^p}\cdot\frac{u^p}{e^u} \;\to\; 0.$$
:::

```check
same(diff(x**5, x, 5), factorial(5)); same(factorial(5), 5*4*3*2*1)      # n differentiations of x^n leave n!, here n = 5
limit_is(x**5/exp(x), x, oo, 0); limit_is(factorial(5)/exp(x), x, oo, 0)
ell = symbols('ell', positive=True); up_ = symbols('u', positive=True)     # ell = ln a > 0, so a = e^ell > 1
same((up_/ell)**pp_/exp(up_), 1/ell**pp_*up_**pp_/exp(up_))
same((x**pp_/exp(ell)**x).subs(x, up_/ell), (up_/ell)**pp_/exp(up_))
limit_is(x**Rational(5, 2)/2**x, x, oo, 0); limit_is(x**pp_/exp(x), x, oo, 0)
```

Again the limit can take its time. With $p = 10$:

```valuetable
x = 10, 20, 30, 40, 50, 100
$\dfrac{x^{10}}{e^x}$ = x**10/exp(x)
digits = 3
---
x | \dfrac{x^{10}}{e^x}
10 | 454000
20 | 21100
30 | 55.3
40 | 0.0445
50 | 1.88\times10^{-5}
100 | 3.72\times10^{-24}
```

At $x = 10$, $x^{10}$ is about 450,000 times as large as $e^x$; at $x = 100$ it is smaller by a factor of about $3 \times 10^{23}$.

```check
rounds(10**10/exp(10)/10**4, '45'); rounds(exp(100)/100**10, '3e23')        # about 450,000; about 3 x 10^23
```

::: keyidea
As $x \to \infty$, for every $p > 0$, $q > 0$ and $a > 1$: $\;\ln x \ll x^p \ll a^x\;$ and $\;(\ln x)^q \ll x^p$, where $f \ll g$, read "f is much smaller than g", means $f(x)/g(x) \to 0$. The last follows from the first: $(\ln x)^q/x^p = \big(\ln x/x^{p/q}\big)^q \to 0$. Any power of a logarithm loses to any positive power of $x$, and any power of $x$ loses to any exponential with base greater than 1, whatever the constants.
:::

```check
qp_ = symbols('q', positive=True)
Lp = symbols('L', positive=True)                          # L = ln x > 0 for x > 1
same((Lp/xq**(pp_/qp_))**qp_, Lp**qp_/xq**pp_)
limit_is(log(x)**3/x**Rational(1, 2), x, oo, 0)
```

::: pitfall
A growth rate is a statement about large $x$ only. $x^{10}$ is larger than $e^x$ at $x = 10$ and at $x = 30$, and $\ln x$ is larger than $x^{0.1}$ for every $x$ from about 3 to about $3 \times 10^{15}$. The same caution applies to algorithms: one that takes $n^2$ steps beats one that takes $2^n$ steps for large $n$, but for $n = 3$ the second takes 8 steps and the first 9.

```check
holds(30**10 > exp(30))
c1g = nsolve(log(x) - x**Rational(1, 10), x, 3); c2g = nsolve(log(x) - x**Rational(1, 10), x, 3*10**15)
rounds(c1g, '3'); rounds(c2g, '3e15')
holds(10**10 > exp(10)); holds(log(Integer(10)**15) > Integer(10)**Rational(15, 10)); holds(log(Integer(10)**16) < Integer(10)**Rational(16, 10))
same(2**3, 8); same(3**2, 9)
```
:::

## What you learned {#summary}

- **Related rates**: draw a diagram, find an equation that links the changing quantities at every instant, differentiate it with respect to time (each quantity is a function of $t$, so the chain rule applies), and only then substitute the values at the instant.
- The **linearisation** $L(x) = f(a) + f'(a)(x - a)$ is the tangent line at $a$, and $f(x) \approx L(x)$ near $a$. Its error is small compared with $x - a$ (Theorem 7.1), and usually close to $\tfrac12 f''(a)(x - a)^2$. Examples: $\sqrt{4.1} \approx 2.025$, $\sin\theta \approx \theta$.
- **Differentials**: $dy = f'(x)\,dx$ is the change along the tangent line, $\Delta y$ the change along the curve, and $\Delta y \approx dy$ when $dx$ is small.
- **Errors** propagate as $\Delta y \approx f'(x)\,\Delta x$. The relative error of $x^k$ is about $\abs{k}$ times that of $x$, so a ball's volume has three times the relative error of its radius.
- **Newton's method** $x_{n+1} = x_n - f(x_n)/f'(x_n)$ follows tangent lines to the $x$-axis. Near a root with $f'(r) \ne 0$ it converges quadratically, roughly doubling the correct digits at each step; for square roots, $x_{n+1} = \tfrac12(x_n + a/x_n)$. It fails at horizontal tangents, can cycle, run away or leave the domain, and is slow at multiple roots.
- **L'Hôpital's rule**: for the forms $0/0$ and $\infty/\infty$, $\lim f/g = \lim f'/g'$ whenever the second limit exists. The simple form, $f'(a)/g'(a)$, follows from the definition of the derivative. Check the form before each use, and differentiate the top and the bottom separately.
- The other **indeterminate forms**: turn $0\cdot\infty$ into a quotient, put $\infty - \infty$ over a common denominator, and take logarithms of $1^\infty$, $0^0$ and $\infty^0$. In particular $(1 + a/x)^x \to e^a$.
- **Growth rates**: $\ln x \ll x^p \ll a^x$ for $p > 0$ and $a > 1$, though "eventually" may mean "only for very large $x$".

```check
same(Lsq.subs(x, Rational(41, 10)), Rational(2025, 1000))
```

## Exercises {#exercises}

:::: exercise A spherical balloon {#ex-7-1} ★
Air is pumped into a spherical balloon at 100 cm³ per second.

- (a) How fast is the radius increasing when the radius is 10 cm?
- (b) How fast is the surface area $S = 4\pi r^2$ increasing at that moment?
- (c) How fast is the radius increasing when the radius is 20 cm? Why is it slower?

::: solution
**(a)** The volume is $V = \tfrac43\pi r^3$. Differentiate with respect to $t$ (chain rule): $\dfrac{dV}{dt} = 4\pi r^2\,\dfrac{dr}{dt}$. With $dV/dt = 100$ and $r = 10$: $100 = 400\pi\,\dfrac{dr}{dt}$, so

$$\frac{dr}{dt} = \frac{1}{4\pi} \approx 0.0796 \text{ cm/s}.$$

**(b)** $\dfrac{dS}{dt} = 8\pi r\,\dfrac{dr}{dt} = 8\pi \cdot 10 \cdot \dfrac{1}{4\pi} = 20$ cm²/s.

**(c)** At $r = 20$: $100 = 4\pi \cdot 400\,\dfrac{dr}{dt}$, so $\dfrac{dr}{dt} = \dfrac{1}{16\pi} \approx 0.0199$ cm/s, a quarter of the rate in (a). The same 100 cm³ per second is spread over a surface $4\pi r^2$ that is four times as large, so the radius grows four times as slowly.

```check
rb = Function('r')(t)
same(diff(Rational(4, 3)*pi*rb**3, t), 4*pi*rb**2*diff(rb, t))
dr10 = Rational(100)/(4*pi*10**2); same(dr10, 1/(4*pi)); rounds(dr10, '0.0796')
same(8*pi*10*dr10, 20)
dr20 = Rational(100)/(4*pi*20**2); same(dr20, 1/(16*pi)); rounds(dr20, '0.0199'); same(dr20/dr10, Rational(1, 4))
same((4*pi*20**2)/(4*pi*10**2), 4)
```
:::
::::

:::: exercise Linear approximations {#ex-7-2} ★
- (a) Find the linearisation of $f(x) = \sqrt[3]{x}$ at $a = 27$, and use it to estimate $\sqrt[3]{26}$ and $\sqrt[3]{28}$.
- (b) Find the linearisation of $\ln x$ at $a = 1$, and use it to estimate $\ln 1.1$ and $\ln 0.9$.
- (c) Compare all four estimates with a calculator. Are they too big or too small?

::: solution
**(a)** $f(27) = 3$ and $f'(x) = \tfrac13 x^{-2/3}$, so $f'(27) = \dfrac{1}{3 \cdot 9} = \dfrac{1}{27}$ and

$$L(x) = 3 + \frac{x - 27}{27}.$$

So $\sqrt[3]{26} \approx 3 - \tfrac{1}{27} = \tfrac{80}{27} \approx 2.96296$ and $\sqrt[3]{28} \approx 3 + \tfrac{1}{27} = \tfrac{82}{27} \approx 3.03704$.

**(b)** $\ln 1 = 0$ and the derivative of $\ln x$ is $1/x$, which is 1 at $x = 1$. So $L(x) = x - 1$, and $\ln 1.1 \approx 0.1$, $\ln 0.9 \approx -0.1$.

**(c)** A calculator gives $\sqrt[3]{26} \approx 2.96250$, $\sqrt[3]{28} \approx 3.03659$, $\ln 1.1 \approx 0.09531$ and $\ln 0.9 \approx -0.10536$. All four estimates are slightly too big: by 0.00047 and 0.00045 for the cube roots, and by 0.0047 and 0.0054 for the logarithms. Both graphs bend downwards, so their tangent lines lie above them. The sizes of the errors match the rule $f(x) - L(x) \approx \tfrac12 f''(a)(x - a)^2$ of Section 7.2. For $\sqrt[3]{x}$, $f''(x) = -\tfrac29 x^{-5/3}$, so $f''(27) = -\tfrac{2}{2187} \approx -0.00091$ and $\tfrac12(0.00091)(1)^2 \approx 0.00046$. For $\ln x$, $f''(1) = -1$ and $\tfrac12(1)(0.1)^2 = 0.005$.

```check
cr = x**Rational(1, 3)
same(diff(cr, x), x**Rational(-2, 3)/3); same(diff(cr, x).subs(x, 27), Rational(1, 27)); same(cr.subs(x, 27), 3)
Lcr = 3 + (x - 27)/27
same(Lcr.subs(x, 26), Rational(80, 27)); same(Lcr.subs(x, 28), Rational(82, 27)); rounds(Rational(80, 27), '2.96296'); rounds(Rational(82, 27), '3.03704')
same(diff(log(x), x).subs(x, 1), 1)
rounds(Integer(26)**Rational(1, 3), '2.96250'); rounds(Integer(28)**Rational(1, 3), '3.03659'); rounds(log(Rational(11, 10)), '0.09531'); rounds(log(Rational(9, 10)), '-0.10536')
rounds(Rational(80, 27) - Integer(26)**Rational(1, 3), '0.00047'); rounds(Rational(82, 27) - Integer(28)**Rational(1, 3), '0.00045')
rounds(Rational(1, 10) - log(Rational(11, 10)), '0.0047'); rounds(-Rational(1, 10) - log(Rational(9, 10)), '0.0054')
same(diff(cr, x, 2), -Rational(2, 9)*x**Rational(-5, 3)); same(diff(cr, x, 2).subs(x, 27), -Rational(2, 2187)); rounds(Rational(2, 2187), '0.00091')
rounds(Rational(1, 2)*Rational(2, 2187), '0.00046'); same(diff(log(x), x, 2).subs(x, 1), -1); same(Rational(1, 2)*1*Rational(1, 10)**2, Rational(5, 1000))
```
:::
::::

:::: exercise Is it indeterminate? {#ex-7-3} ★
For each limit, say whether L'Hôpital's rule applies, then find the limit.

- (a) $\displaystyle\lim_{x\to0}\frac{e^{3x} - 1}{x}$
- (b) $\displaystyle\lim_{x\to\pi}\frac{\sin x}{x - \pi}$
- (c) $\displaystyle\lim_{x\to0}\frac{\cos x}{1 + x}$
- (d) $\displaystyle\lim_{x\to\infty}\frac{2x + 3}{5x - 1}$

::: solution
**(a)** At $x = 0$ the top is $e^0 - 1 = 0$ and the bottom is 0: the form is $0/0$, and the rule applies. The quotient of the derivatives is $\dfrac{3e^{3x}}{1} \to 3$, so the limit is 3.

**(b)** $\sin\pi = 0$ and $\pi - \pi = 0$: the form is $0/0$. The quotient of the derivatives is $\dfrac{\cos x}{1} \to \cos\pi = -1$, so the limit is $-1$. (The simple form, Theorem 7.4, gives the same: $f'(\pi)/g'(\pi) = -1/1$.)

**(c)** At $x = 0$ the top is $\cos 0 = 1$ and the bottom is 1: not an indeterminate form, so the rule does not apply. Substitute: the limit is $1/1 = 1$. Applying the rule anyway would give $\dfrac{-\sin x}{1} \to 0$, which is wrong.

**(d)** Both the top and the bottom approach $\infty$: the form is $\infty/\infty$. The quotient of the derivatives is $2/5$, so the limit is $\tfrac25$. Dividing the top and the bottom by $x$ (Module 3) gives the same: $\dfrac{2 + 3/x}{5 - 1/x} \to \dfrac25$.

```check
same((exp(3*x) - 1).subs(x, 0), 0); same(diff(exp(3*x) - 1, x), 3*exp(3*x)); limit_is((exp(3*x) - 1)/x, x, 0, 3)
same(sin(pi), 0); limit_is(cos(x), x, pi, -1); limit_is(sin(x)/(x - pi), x, pi, -1)
same(cos(0)/(1 + 0), 1); limit_is(cos(x)/(1 + x), x, 0, 1); limit_is(-sin(x)/1, x, 0, 0)
limit_is((2*x + 3)/(5*x - 1), x, oo, Rational(2, 5)); same(diff(2*x + 3, x)/diff(5*x - 1, x), Rational(2, 5))
```
:::
::::

:::: exercise Newton's method by hand {#ex-7-4} ★
The equation $x^3 - 2x - 5 = 0$ has a root near 2.

- (a) Write down Newton's step for $f(x) = x^3 - 2x - 5$, and simplify it to a single fraction.
- (b) Starting from $x_0 = 2$, compute $x_1$ and $x_2$ by hand ($x_2$ as a fraction and to six decimal places).
- (c) The root is $r = 2.0945514815\ldots$; to how many decimal places are $x_0$, $x_1$ and $x_2$ correct?

::: solution
**(a)** $f'(x) = 3x^2 - 2$, and

$$\begin{aligned} x_{n+1} &= x_n - \frac{x_n^3 - 2x_n - 5}{3x_n^2 - 2} \\ &= \frac{3x_n^3 - 2x_n - x_n^3 + 2x_n + 5}{3x_n^2 - 2} \\ &= \frac{2x_n^3 + 5}{3x_n^2 - 2}. \end{aligned}$$

**(b)** $x_1 = \dfrac{2 \cdot 8 + 5}{3 \cdot 4 - 2} = \dfrac{21}{10} = 2.1$. Then, with $2.1^3 = 9.261$ and $2.1^2 = 4.41$,

$$\begin{aligned} x_2 &= \frac{2 \cdot 9.261 + 5}{3 \cdot 4.41 - 2} = \frac{23.522}{11.23} \\ &= \frac{11761}{5615} \approx 2.094568. \end{aligned}$$

**(c)** The errors are $\abs{x_0 - r} \approx 0.095$, $\abs{x_1 - r} \approx 0.0054$ and $\abs{x_2 - r} \approx 0.000017$. Compare them with $0.5 \times 10^{-d}$: $x_0$ is correct to 0 decimal places ($0.095 < 0.5$ but not $< 0.05$), $x_1$ to 1 ($0.0054 < 0.05$ but not $< 0.005$) and $x_2$ to 4 ($0.000017 < 0.00005$ but not $< 0.000005$). The next iterate is correct to 9 decimal places.

```check
fn4 = x**3 - 2*x - 5
steps(x - fn4/diff(fn4, x), (3*x**3 - 2*x - x**3 + 2*x + 5)/(3*x**2 - 2), (2*x**3 + 5)/(3*x**2 - 2))
st4 = lambda v: (2*v**3 + 5)/(3*v**2 - 2)
same(st4(Integer(2)), Rational(21, 10)); same(Rational(21, 10)**3, Rational(9261, 1000)); same(Rational(21, 10)**2, Rational(441, 100))
same(st4(Rational(21, 10)), Rational(23522, 1000)/Rational(1123, 100)); same(st4(Rational(21, 10)), Rational(11761, 5615)); rounds(Rational(11761, 5615), '2.094568')
r4 = nsolve(fn4, x, 2.09, prec=60); rounds(r4, '2.0945514815')
it4 = [Integer(2), Rational(21, 10), Rational(11761, 5615), st4(Rational(11761, 5615))]
rounds(abs(it4[0] - r4), '0.095'); rounds(abs(it4[1] - r4), '0.0054'); rounds(abs(it4[2] - r4), '0.000017')
same([correct_dp(v, r4) for v in it4], [0, 1, 4, 9])
```
:::
::::

:::: exercise Two cars {#ex-7-5} ★★
Car A is 0.3 km north of a crossroads, driving south towards it at 90 km/h. Car B is 0.4 km east of the crossroads, driving west towards it at 60 km/h. How fast is the distance between the cars changing? Is it growing or shrinking?

::: solution
Let $x$ be B's distance east of the crossroads, $y$ A's distance north of it, and $z$ the distance between the cars, in kilometres, at time $t$ in hours. Both cars approach the crossroads, so $x$ and $y$ decrease: $dx/dt = -60$ and $dy/dt = -90$. By Pythagoras' theorem, at every instant

$$z^2 = x^2 + y^2.$$

Differentiate with respect to $t$: $2z\,\dfrac{dz}{dt} = 2x\,\dfrac{dx}{dt} + 2y\,\dfrac{dy}{dt}$. At the instant, $x = 0.4$ and $y = 0.3$, so $z = \sqrt{0.16 + 0.09} = 0.5$, and

$$\begin{aligned} \frac{dz}{dt} &= \frac{x\,dx/dt + y\,dy/dt}{z} \\ &= \frac{0.4(-60) + 0.3(-90)}{0.5} \\ &= \frac{-24 - 27}{0.5} = -102 \text{ km/h}. \end{aligned}$$

The distance is shrinking at 102 km/h. The common slip is to take both rates as positive, which gives $+102$: a distance that decreases has a negative rate.

```check
xt5, yt5, zt5 = Function('x')(t), Function('y')(t), Function('z')(t)
same(diff(zt5**2 - xt5**2 - yt5**2, t), 2*zt5*diff(zt5, t) - 2*xt5*diff(xt5, t) - 2*yt5*diff(yt5, t))
same(sqrt(Rational(16, 100) + Rational(9, 100)), Rational(1, 2))
same(Rational(4, 10)*(-60), -24); same(Rational(3, 10)*(-90), -27)
same((Rational(4, 10)*(-60) + Rational(3, 10)*(-90))/Rational(1, 2), -102)
```
:::
::::

:::: exercise Measuring a cube {#ex-7-6} ★★
The edge of a cube is measured as 30 cm, with an error of at most 0.1 cm.

- (a) Estimate the largest error in the computed volume, as an absolute and as a relative error.
- (b) Do the same for the computed surface area.
- (c) How accurately must the edge be measured for the volume to be within 0.5%?

::: solution
**(a)** $V = x^3$, so $dV = 3x^2\,dx$. With $x = 30$ and $\abs{dx} \le 0.1$: $\abs{dV} \le 3 \cdot 900 \cdot 0.1 = 270$ cm³. The volume is $30^3 = 27\,000$ cm³, so the relative error is at most $270/27\,000 = 0.01 = 1\%$. As a check, the rule for powers gives $3 \times \tfrac{0.1}{30} = 1\%$.

**(b)** $S = 6x^2$, so $dS = 12x\,dx$, and $\abs{dS} \le 12 \cdot 30 \cdot 0.1 = 36$ cm². The area is $6 \cdot 900 = 5400$ cm², so the relative error is at most $36/5400 = \tfrac{1}{150} \approx 0.67\%$: twice the relative error of the edge, since $S$ is a square.

**(c)** $\dfrac{dV}{V} = 3\,\dfrac{dx}{x}$, so the volume is within 0.5% when $\dfrac{\abs{dx}}{x} \le \dfrac{0.005}{3} = \dfrac{1}{600}$, that is, $\abs{dx} \le \dfrac{30}{600} = 0.05$ cm: half a millimetre.

```check
same(3*30**2*Rational(1, 10), 270); same(30**3, 27000); same(Rational(270, 27000), Rational(1, 100)); same(3*Rational(1, 10)/30, Rational(1, 100))
same(diff(6*x**2, x), 12*x); same(12*30*Rational(1, 10), 36); same(6*30**2, 5400); same(Rational(36, 5400), Rational(1, 150)); rounds(100*Rational(1, 150), '0.67')
same(2*Rational(1, 10)/30, Rational(1, 150))
same(Rational(5, 1000)/3, Rational(1, 600)); same(30*Rational(1, 600), Rational(5, 100))
same(diff(x**3, x)/x**3, 3/x)
```
:::
::::

:::: exercise L'Hôpital's rule in practice {#ex-7-7} ★★
Find each limit.

- (a) $\displaystyle\lim_{x\to0}\frac{x - \sin x}{x^3}$
- (b) $\displaystyle\lim_{x\to0^+} x^2\ln x$
- (c) $\displaystyle\lim_{x\to0}\Big(\frac{1}{x} - \frac{1}{e^x - 1}\Big)$

::: solution
**(a)** The form is $0/0$. Apply the rule three times, checking the form each time (the derivatives of the bottom, $3x^2$ and $6x$, are not 0 near 0 except at 0):

$$\frac{x - \sin x}{x^3},\; \frac{1 - \cos x}{3x^2},\; \frac{\sin x}{6x},\; \frac{\cos x}{6}.$$

The first three have the form $0/0$; the last approaches $\tfrac16$. Working backwards with Theorem 7.5, the limit is $\tfrac16$. (At the third stage the simple form also applies: $\dfrac{\cos 0}{6} = \dfrac16$.)

**(b)** The form is $0\cdot(-\infty)$. Write $x^2\ln x = \dfrac{\ln x}{x^{-2}}$, of the form $\infty/\infty$. The quotient of the derivatives is

$$\frac{1/x}{-2x^{-3}} = -\frac{x^2}{2} \;\to\; 0,$$

so the limit is 0.

**(c)** The form is $\infty - \infty$ (from the right; $-\infty + \infty$ from the left). Over a common denominator,

$$\frac1x - \frac{1}{e^x - 1} = \frac{e^x - 1 - x}{x(e^x - 1)},$$

of the form $0/0$. Differentiating the top, and the bottom with the product rule, gives $\dfrac{e^x - 1}{e^x - 1 + xe^x}$, again $0/0$, and once more gives $\dfrac{e^x}{2e^x + xe^x} = \dfrac{1}{2 + x} \to \dfrac12$. The limit is $\tfrac12$. (The derivatives of the bottoms, $e^x - 1 + xe^x$ and $2e^x + xe^x$, are not 0 near 0 except at 0: the first has the sign of $x$, and the second is positive near 0.)

```check
e7a = [x - sin(x), x**3]
for _ in range(3):
    e7a = [diff(e7a[0], x), diff(e7a[1], x)]
same(e7a, [cos(x), 6]); limit_is((x - sin(x))/x**3, x, 0, Rational(1, 6))
same([diff(x**3, x), diff(x**3, x, 2)], [3*x**2, 6*x])
limit_is((1 - cos(x))/(3*x**2), x, 0, Rational(1, 6)); limit_is(sin(x)/(6*x), x, 0, Rational(1, 6))
same(diff(log(x), x)/diff(x**-2, x), -x**2/2); limit_is(x**2*log(x), x, 0, 0, '+')
e7c = 1/x - 1/(exp(x) - 1)
same(e7c, (exp(x) - 1 - x)/(x*(exp(x) - 1)))
same(diff(x*(exp(x) - 1), x), exp(x) - 1 + x*exp(x)); same(diff(exp(x) - 1 + x*exp(x), x), 2*exp(x) + x*exp(x))
same(exp(x)/(2*exp(x) + x*exp(x)), 1/(2 + x)); limit_is(e7c, x, 0, Rational(1, 2))
holds((exp(x) - 1 + x*exp(x)).subs(x, Rational(-1, 10)) < 0); holds((exp(x) - 1 + x*exp(x)).subs(x, Rational(1, 10)) > 0)
```
:::
::::

:::: exercise Exponential forms {#ex-7-8} ★★
- (a) A data set has $n$ items. A **bootstrap sample**, used in statistics and machine learning, draws $n$ items from it at random, one at a time, with replacement. The chance that a given item is never drawn is $(1 - 1/n)^n$. What does it approach as $n \to \infty$?
- (b) Find $\displaystyle\lim_{x\to0^+}(\sin x)^x$.
- (c) Find $\displaystyle\lim_{x\to\infty}(\ln x)^{1/x}$.

::: solution
**(a)** The form is $1^\infty$. By Example 7.17 with $a = -1$, $(1 - 1/x)^x \to e^{-1}$ as $x \to \infty$, so

$$\Big(1 - \frac1n\Big)^n \to \frac1e \approx 0.368.$$

For a large data set, about 36.8% of the items are left out of any one bootstrap sample.

**(b)** The form is $0^0$. Let $y = (\sin x)^x$, for $0 < x < \pi$. Then $\ln y = x\ln\sin x = \dfrac{\ln\sin x}{1/x}$, of the form $\infty/\infty$ (the top approaches $-\infty$). The quotient of the derivatives is

$$\begin{aligned} \frac{\cos x/\sin x}{-1/x^2} &= -x \cdot \frac{x}{\sin x} \cdot \cos x \\ &\to 0 \cdot 1 \cdot 1 = 0, \end{aligned}$$

using $x/\sin x \to 1$ (Module 2). So $\ln y \to 0$ and $y \to e^0 = 1$.

**(c)** The form is $\infty^0$. Let $y = (\ln x)^{1/x}$, for $x > 1$. Then $\ln y = \dfrac{\ln(\ln x)}{x}$, of the form $\infty/\infty$. The derivative of $\ln(\ln x)$ is $\dfrac{1}{x\ln x}$ (chain rule), so the quotient of the derivatives is $\dfrac{1}{x\ln x} \to 0$. So $\ln y \to 0$ and $y \to 1$.

```check
limit_is((1 - 1/n)**n, n, oo, exp(-1)); rounds(exp(-1), '0.368'); rounds(100*exp(-1), '36.8')
same(diff(log(sin(x)), x)/diff(1/x, x), -x**2*cos(x)/sin(x)); same(-x*(x/sin(x))*cos(x), -x**2*cos(x)/sin(x))
limit_is(-x**2*cos(x)/sin(x), x, 0, 0, '+'); limit_is(sin(x)**x, x, 0, 1, '+')
same(diff(log(log(x)), x), 1/(x*log(x))); limit_is(1/(x*log(x)), x, oo, 0); limit_is(log(x)**(1/x), x, oo, 1)
```
:::
::::

:::: exercise Solving $e^{-x} = x$ {#ex-7-9} ★★
- (a) Show that the equation $e^{-x} = x$ has exactly one solution in $[0, 1]$.
- (b) Show that Newton's method for $f(x) = x - e^{-x}$ has the step $x_{n+1} = \dfrac{1 + x_n}{1 + e^{x_n}}$.
- (c) Starting from $x_0 = 0.5$, compute $x_1$ and $x_2$. Given that the solution is $0.5671432904\ldots$, how many decimal places of each are correct?

::: solution
**(a)** $f(x) = x - e^{-x}$ is continuous, with $f(0) = -1 < 0$ and $f(1) = 1 - 1/e > 0$, so it has a root in $(0, 1)$ by the Intermediate Value Theorem. It has only one: $x$ increases, and $e^{-x}$ decreases, so $-e^{-x}$ increases, and $f$ is the sum of two increasing functions, strictly increasing because $x$ is.

**(b)** $f'(x) = 1 + e^{-x}$. Then

$$\begin{aligned} &x - \frac{x - e^{-x}}{1 + e^{-x}} \\ &\quad= \frac{x + xe^{-x} - x + e^{-x}}{1 + e^{-x}} \\ &\quad= \frac{(1 + x)e^{-x}}{1 + e^{-x}} = \frac{1 + x}{e^x + 1}, \end{aligned}$$

multiplying the top and the bottom by $e^x$ in the last step.

**(c)** $x_1 = \dfrac{1.5}{e^{0.5} + 1} \approx \dfrac{1.5}{2.648721} \approx 0.566311$, and $x_2 = \dfrac{1.566311\ldots}{e^{0.566311\ldots} + 1} \approx 0.5671431650$. The errors are about 0.067, 0.00083 and $1.3 \times 10^{-7}$, so $x_0$, $x_1$ and $x_2$ are correct to 0, 2 and 6 decimal places; $x_3$ is correct to 14 and $x_4$ to 29. The pattern 0, 2, 6, 14, 29 is the doubling of Theorem 7.3.

```check
f9 = x - exp(-x)
same(f9.subs(x, 0), -1); holds(f9.subs(x, 1) > 0)
steps(x - f9/diff(f9, x), (x + x*exp(-x) - x + exp(-x))/(1 + exp(-x)), (1 + x)*exp(-x)/(1 + exp(-x)), (1 + x)/(exp(x) + 1))
it9 = [Rational(1, 2)]
for _ in range(4):
    it9.append(N((1 + it9[-1])/(exp(it9[-1]) + 1), 80))
rounds(exp(Rational(1, 2)) + 1, '2.648721'); rounds(it9[1], '0.566311'); rounds(it9[2], '0.5671431650')
r9 = nsolve(f9, x, 0.567, prec=80); rounds(r9, '0.5671432904')
rounds(abs(it9[0] - r9), '0.067'); rounds(abs(it9[1] - r9), '0.00083'); rounds(abs(it9[2] - r9), '1.3e-7')
same([correct_dp(v, r9) for v in it9], [0, 2, 6, 14, 29])
```
:::
::::

:::: exercise The reciprocal square root {#ex-7-10} ★★★
Programs that must avoid division compute $1/\sqrt a$, for $a > 0$, as the positive root of $g(y) = \dfrac{1}{y^2} - a$.

- (a) Show that Newton's method for $g$ has the step $y_{n+1} = \tfrac12 y_n\big(3 - ay_n^2\big)$, which needs no division.
- (b) Write $y_n = (1 + \varepsilon_n)/\sqrt a$, so that $\varepsilon_n$ is the relative error. Show that $\varepsilon_{n+1} = -\tfrac12\varepsilon_n^2(3 + \varepsilon_n)$.
- (c) If $\abs{\varepsilon_0} \le 0.01$, how many steps make the relative error smaller than $10^{-15}$?

::: solution
**(a)** $g(y) = y^{-2} - a$, so $g'(y) = -2y^{-3}$. Then

$$\begin{aligned} y - \frac{g(y)}{g'(y)} &= y - \frac{y^{-2} - a}{-2y^{-3}} \\ &= y + \frac{y^3\big(y^{-2} - a\big)}{2} \\ &= y + \frac{y - ay^3}{2} \\ &= \frac{3y - ay^3}{2} \\ &= \frac12 y\big(3 - ay^2\big). \end{aligned}$$

The step uses only multiplications, a subtraction and the halving, which in binary is exact and cheap.

**(b)** With $y_n = (1 + \varepsilon_n)/\sqrt a$, $ay_n^2 = (1 + \varepsilon_n)^2$, so

$$\begin{aligned} y_{n+1} &= \frac{1 + \varepsilon_n}{2\sqrt a}\big(3 - (1 + \varepsilon_n)^2\big) \\ &= \frac{(1 + \varepsilon_n)\big(2 - 2\varepsilon_n - \varepsilon_n^2\big)}{2\sqrt a}. \end{aligned}$$

Expanding, $(1 + \varepsilon)(2 - 2\varepsilon - \varepsilon^2) = 2 - 3\varepsilon^2 - \varepsilon^3$, so

$$y_{n+1} = \frac{1 - \tfrac32\varepsilon_n^2 - \tfrac12\varepsilon_n^3}{\sqrt a},$$

that is, $\varepsilon_{n+1} = -\tfrac32\varepsilon_n^2 - \tfrac12\varepsilon_n^3 = -\tfrac12\varepsilon_n^2(3 + \varepsilon_n)$: quadratic convergence again.

**(c)** While $\abs{\varepsilon_n} \le 0.01$, $\abs{\varepsilon_{n+1}} \le \tfrac12\varepsilon_n^2 \cdot 3.01$. From $\abs{\varepsilon_0} \le 0.01$ this gives the bounds $\abs{\varepsilon_1} \le 1.5 \times 10^{-4}$, $\abs{\varepsilon_2} \le 3.4 \times 10^{-8}$, $\abs{\varepsilon_3} \le 1.7 \times 10^{-15}$ and $\abs{\varepsilon_4} \le 4.6 \times 10^{-30}$. Three steps are not quite enough by this bound; four steps are.

```check
yy, ae = symbols('y a', positive=True)
gy = 1/yy**2 - ae
steps(yy - gy/diff(gy, yy), yy + yy**3*(yy**-2 - ae)/2, yy + (yy - ae*yy**3)/2, (3*yy - ae*yy**3)/2, yy*(3 - ae*yy**2)/2)
yn = (1 + ep)/sqrt(ae)
same(ae*yn**2, (1 + ep)**2)
same(expand((1 + ep)*(2 - 2*ep - ep**2)), 2 - 3*ep**2 - ep**3)
same(expand((yn*(3 - ae*yn**2)/2)*sqrt(ae) - 1), -Rational(3, 2)*ep**2 - Rational(1, 2)*ep**3)
same(-Rational(3, 2)*ep**2 - Rational(1, 2)*ep**3, -ep**2*(3 + ep)/2)
bd = [Rational(1, 100)]
for _ in range(4):
    bd.append(bd[-1]**2*Rational(301, 100)/2)
rounds(bd[1], '1.5e-4'); rounds(bd[2], '3.4e-8'); rounds(bd[3], '1.7e-15'); rounds(bd[4], '4.6e-30')
holds(bd[3] > Rational(1, 10)**15); holds(bd[4] < Rational(1, 10)**15)
holds(all(b <= Rational(1, 100) for b in bd))
```
:::
::::

:::: exercise How late is "eventually"? {#ex-7-11} ★★★
- (a) Prove that $\displaystyle\lim_{x\to\infty}\frac{(\ln x)^{10}}{x^{0.1}} = 0$.
- (b) Show that, nevertheless, $(\ln x)^{10}$ is much larger than $x^{0.1}$ at $x = 10^{100}$.
- (c) With $u = \ln x$, the two functions are equal where $10\ln u = 0.1u$, that is, where $g(u) = u - 100\ln u$ is 0. Use Newton's method from $u_0 = 600$ to find the large solution to 5 decimal places, and write the corresponding $x$ as a power of 10.

::: solution
**(a)** Write the quotient as a tenth power:

$$\frac{(\ln x)^{10}}{x^{0.1}} = \Big(\frac{\ln x}{x^{0.01}}\Big)^{10}.$$

By Theorem 7.6 with $p = 0.01$, the quotient in brackets approaches 0, and $t \mapsto t^{10}$ is continuous, so the tenth power approaches $0^{10} = 0$.

**(b)** At $x = 10^{100}$, $\ln x = 100\ln 10 \approx 230.26$, so $(\ln x)^{10} \approx 4.19 \times 10^{23}$, while $x^{0.1} = 10^{10}$. The logarithm's power is still more than $10^{13}$ times larger.

**(c)** $g'(u) = 1 - 100/u$, so the step is $u_{n+1} = u_n - \dfrac{u_n - 100\ln u_n}{1 - 100/u_n}$. From $u_0 = 600$: $u_1 \approx 647.63156$, $u_2 \approx 647.27753$, $u_3 \approx 647.27751$, and $u_4$ agrees with $u_3$ to many more places. So $u \approx 647.27751$, and

$$\begin{aligned} x = e^{647.27751} &= 10^{647.27751/\ln 10} \\ &\approx 10^{281.1}. \end{aligned}$$

So $(\ln x)^{10}$ stays ahead of $x^{0.1}$ until about $x = 10^{281}$. (Module 8's tools show that $g$ increases for $u > 100$, so beyond this point $x^{0.1}$ stays ahead for good.)

```check
xq11 = symbols('x', positive=True)
same((log(xq11)/xq11**Rational(1, 100))**10, log(xq11)**10/xq11**Rational(1, 10))
limit_is(log(x)/x**Rational(1, 100), x, oo, 0)
rounds(100*log(10), '230.26'); rounds((100*log(10))**10, '4.19e23'); holds((100*log(10))**10/10**10 > 10**13)
gu = u - 100*log(u)
same(diff(gu, u), 1 - 100/u)
it11 = [Integer(600)]
for _ in range(4):
    it11.append(N(it11[-1] - gu.subs(u, it11[-1])/diff(gu, u).subs(u, it11[-1]), 60))
rounds(it11[1], '647.63156'); rounds(it11[2], '647.27753'); rounds(it11[3], '647.27751'); near(it11[4], it11[3], 1e-9)
rounds(it11[3]/log(10), '281.1')
```
:::
::::

:::: exercise Condition numbers {#ex-7-12} ★★★
Suppose $x$ is known with a small relative error $\rho$ (Greek "rho"), and $y = f(x)$ is computed from it.

- (a) Use differentials to show that the relative error of $y$ is about $\kappa(x)\,\rho$, where $\kappa(x) = \abs{\dfrac{x f'(x)}{f(x)}}$ (Greek "kappa") is the **condition number** of $f$ at $x$.
- (b) Find the condition number of $x^k$, of $e^x$, of $\ln x$ and of $x - 1$.
- (c) A computer stores $x = 1 + 10^{-8}$ with a relative error of about $10^{-16}$. About how large is the relative error of $\ln x$ computed from it? Explain the result for $(1 + 1/n)^n$ in the last compute box of Section 7.6.

::: solution
**(a)** If $x$ is off by $dx$, then $y$ is off by about $dy = f'(x)\,dx$, so the relative error of $y$ is about

$$\begin{aligned} \abs{\frac{dy}{y}} &= \abs{\frac{f'(x)\,dx}{f(x)}} \\ &= \abs{\frac{xf'(x)}{f(x)}}\cdot\abs{\frac{dx}{x}} = \kappa(x)\,\rho. \end{aligned}$$

**(b)** For $x^k$: $\abs{\dfrac{x \cdot kx^{k-1}}{x^k}} = \abs{k}$, the rule of Section 7.3. For $e^x$: $\abs{\dfrac{xe^x}{e^x}} = \abs{x}$. For $\ln x$: $\abs{\dfrac{x \cdot (1/x)}{\ln x}} = \dfrac{1}{\abs{\ln x}}$. For $x - 1$: $\abs{\dfrac{x}{x - 1}}$.

**(c)** For $\ln x$ at $x = 1 + 10^{-8}$, $\ln x \approx 10^{-8}$ (the linear approximation $\ln x \approx x - 1$ of Exercise 7.2), so $\kappa \approx 10^8$, and the relative error of $\ln x$ is about $10^8 \times 10^{-16} = 10^{-8}$: about half of the 16 digits are lost. Both $\ln x$ and $x - 1$ are badly conditioned near 1, which is why `math.log1p(u)` takes the small number $u$ itself, not $1 + u$. In the compute box, $(1 + 1/n)^n = u^n$ with $u = 1 + 1/n$, and $u^n$ has condition number $n$: the relative error of about $10^{-16}$ in storing $u$ grows to about $n \times 10^{-16}$, which is about $10^{-4}$ for $n = 10^{12}$ (the computed value was off by about $9 \times 10^{-5}$ relative to $e$) and about $0.1$ for $n = 10^{15}$ (off by about 12%).

```check
kp = symbols('k')
same(x*diff(x**kp, x)/x**kp, kp); same(x*diff(exp(x), x)/exp(x), x); same(x*diff(log(x), x)/log(x), 1/log(x)); same(x*diff(x - 1, x)/(x - 1), x/(x - 1))
x12 = 1 + Rational(1, 10)**8
rounds(log(x12), '1.0e-8'); rounds(1/log(x12), '1.0e8')
rounds((Rational(27185234960372378, 10**16) - E)/E, '9e-5'); rounds(100*(Rational(3035035206549262, 10**15) - E)/E, '12')
same(x*diff(x**n, x)/x**n, n)
```
:::
::::

## Check yourself {#quiz}

```quiz
? The radius of a circle grows at 2 cm/s. How fast does its area grow when the radius is 5 cm?
- [x] $20\pi$ cm²/s
- [ ] $10\pi$ cm²/s
- [ ] $4\pi$ cm²/s
- [ ] $25\pi$ cm²/s
> $A = \pi r^2$, so $dA/dt = 2\pi r\,dr/dt = 2\pi \cdot 5 \cdot 2 = 20\pi$. $10\pi$ is $dA/dr$ at $r = 5$, without the factor $dr/dt = 2$; $4\pi$ leaves out $r$; $25\pi$ is the area itself, not its rate of change.

? Using the linearisation of $\sqrt x$ at 9, $\sqrt{9.6}$ is approximately
- [ ] $3.2$
- [ ] $3.6$
- [x] $3.1$
- [ ] $3.05$
> $f'(9) = \dfrac{1}{2\sqrt9} = \dfrac16$, so $L(x) = 3 + \dfrac{x - 9}{6}$ and $L(9.6) = 3 + 0.1 = 3.1$ (the true value is $3.098\ldots$). $3.2$ uses the slope $\tfrac13$, forgetting the 2 in $\dfrac{1}{2\sqrt x}$; $3.6$ uses slope 1; $3.05$ uses slope $\tfrac{1}{12}$.

? The radius of a sphere is measured with a relative error of at most 1%. The relative error of its computed surface area $4\pi r^2$ is about
- [ ] $1\%$
- [x] $2\%$
- [ ] $3\%$
- [ ] $4\%$
> For $S = cr^2$, $dS/S = 2\,dr/r$: the relative error doubles, to 2%. 3% is the relative error of the volume, a cube; the constant $4\pi$ does not change relative errors, so 4% is wrong; 1% forgets the power.

? One step of Newton's method for $f(x) = x^2 - 5$ from $x_0 = 2$ gives
- [ ] $1.75$
- [ ] $2.5$
- [ ] $2.236$
- [x] $2.25$
> $x_1 = 2 - \dfrac{f(2)}{f'(2)} = 2 - \dfrac{-1}{4} = 2.25$. $1.75$ comes from a sign slip ($f(2) = -1$ is negative); $2.5$ divides by $x_0$ instead of $f'(x_0) = 2x_0$; $2.236 \approx \sqrt5$ is the root itself, which the iterates only approach.

? Newton's method for $f(x) = \sqrt[3]{x}$ from $x_0 = 1$ produces
- [x] $-2, 4, -8, \dots$: the iterates run away from the root 0
- [ ] the root 0 after one step
- [ ] an error, because $f'(1) = 0$
- [ ] iterates that approach 0 slowly
> Each step gives $x_{n+1} = -2x_n$ (Example 7.11). $f'(1) = \tfrac13$, not 0; the trouble is at the root, where $f'(0)$ does not exist and the graph has a vertical tangent.

? $\displaystyle\lim_{x\to0}\frac{x + 1}{x + 2}$ equals
- [ ] $1$
- [ ] $0$
- [x] $\dfrac12$
- [ ] it does not exist
> The form is not indeterminate: substitute $x = 0$ to get $\tfrac12$. Applying L'Hôpital's rule anyway gives $\tfrac11 = 1$, which is wrong: the rule needs $0/0$ or $\infty/\infty$.

? $\displaystyle\lim_{x\to\infty}\Big(1 + \frac{3}{x}\Big)^x$ equals
- [ ] $1$
- [ ] $e$
- [ ] $3$
- [x] $e^3$
> By Example 7.17 with $a = 3$, the limit is $e^3$. The answer 1 treats the form $1^\infty$ as if it were 1; $e$ is the case $a = 1$; 3 is the limit of the logarithm, $x\ln(1 + 3/x) \to 3$, without the last step $y = e^{\ln y}$.

? Which function grows fastest as $x \to \infty$?
- [ ] $x^{100}$
- [x] $1.01^x$
- [ ] $(\ln x)^{100}$
- [ ] $x^{100}\ln x$
> Any power of $x$ loses to an exponential with base greater than 1 (Theorem 7.7): $x^{100}/1.01^x \to 0$, and $x^{100}\ln x \le x^{101}$ for $x \ge 1$, so it loses too. $(\ln x)^{100}$ grows more slowly than $x^{100}$ (the key idea of Section 7.7). The exponential overtakes the powers only for very large $x$.
```

```check
same(2*pi*5*2, 20*pi); same(diff(pi*r**2, r).subs(r, 5), 10*pi)
same(diff(sqrt(x), x).subs(x, 9), Rational(1, 6)); same(3 + Rational(6, 10)/6, Rational(31, 10)); rounds(sqrt(Rational(96, 10)), '3.098')
same(3 + Rational(6, 10)/3, Rational(32, 10)); same(3 + Rational(6, 10)/12, Rational(305, 100))
same(diff(4*pi*r**2, r)/(4*pi*r**2), 2/r)
same(2 - Rational(2**2 - 5, 2*2), Rational(9, 4)); same(2 - Rational(2**2 - 5, 2), Rational(5, 2)); rounds(sqrt(5), '2.236')
same(Rational(0 + 1, 0 + 2), Rational(1, 2))
limit_is((1 + 3/x)**x, x, oo, exp(3)); limit_is(x*log(1 + 3/x), x, oo, 3)
limit_is(x**100/Rational(101, 100)**x, x, oo, 0); limit_is(log(x)**100/x**100, x, oo, 0)
```
