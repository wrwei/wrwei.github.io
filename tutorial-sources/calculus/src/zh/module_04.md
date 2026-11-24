---
title: 导数
part: 2
lead: 从模块 1 的平均变化率过渡到瞬时变化率。你将用极限定义导数，理解导数与切线斜率、速度的关系，再证明基本求导法则。用 SymPy 作精确计算，并比较数值求导在小步长下受到的浮点误差。
minutes: 255
needs: 模块 1, 2 和 3
goals:
  - 从极限定义计算导数，并写出切线方程
  - 将导数解释为斜率、速度和变化率，并标明其单位
  - 从 f 的图像绘制 f′ 的图像，并识别函数无导数的点
  - 证明幂函数、常数倍和和法则，并利用它们对多项式求导
  - 求高阶导数，以及运动物体的速度、加速度和冲击加速度
  - 数值估计导数，并选择一个平衡截断误差和舍入误差的步长
---

## 切线与速度 {#tangents}

在模块 1 中你掉了一个球。经过 $t$ 秒后，它下落了 $s(t) = 4.9t^2$ 米，且从 $t = 1$ 到 $t = 1 + h$ 之间的平均速度是

$$\frac{s(1 + h) - s(1)}{h} = 9.8 + 4.9h \qquad (h \ne 0),$$

如 [例 1.12](module_01_ZH.html#difference-quotient)] 所示。当 $h$ 从两侧趋近于 0 时，这些平均值趋于 9.8 m/s。模块 2 给出了这个趋近的精确含义，即极限，并求出了球在任意时刻 $a$ 的速度，而不仅是在 $t = 1$ 时的速度：

$$\begin{aligned} \lim_{h\to0}\frac{s(a + h) - s(a)}{h} &= \lim_{h\to0}\,(9.8a + 4.9h) \\ &= 9.8a \text{ m/s}. \end{aligned}$$

商等于 $9.8a + 4.9h$ 对于每一个 $h \ne 0$ 都成立，且极限作为 $h \to 0$ 从不使用 $h = 0$ 自身的值；因此直接代入得到 $9.8a$。所以球在第一秒后下落速度为 9.8 m/s，在第二秒后为 19.6 m/s。这个极限就是球上速度表所显示的数值。

```check
s49 = Rational(49, 10)*t**2
dq1 = (s49.subs(t, a + h) - s49.subs(t, a))/h
same(cancel(dq1.subs(a, 1)), Rational(98, 10) + Rational(49, 10)*h)   # the quotient at t = 1 (Example 1.12)
same(cancel(dq1), Rational(98, 10)*a + Rational(49, 10)*h)
limit_is(dq1, h, 0, Rational(98, 10)*a)
same((Rational(98, 10)*a + Rational(49, 10)*h).subs(h, 0), Rational(98, 10)*a)
same([Rational(98, 10)*T_ for T_ in (1, 2)], [Rational(98, 10), Rational(196, 10)])
```

::: definition 瞬时速度
假设一个物体沿一条直线运动，且 $s(t)$ 是它在时间 $t$ 时的位置，从固定点测量。它在时间 $a$ 时的 **瞬时速度**，或简称为 **速度**，为

$$v(a) = \lim_{h\to0}\frac{s(a + h) - s(a)}{h},$$

该极限存在的前提下。它在时间 $a$ 时的 **速度** 为 $\abs{v(a)}$。
:::

速度有正负号：正速度表示物体沿正方向运动，负速度表示物体沿相反方向运动。速度忽略方向。对于向下测量距离的下落球来说，两者是相同的。

::: example 刹车的汽车
假设一辆车匀速刹车，刹车开始后 $t$ 秒，车已行驶 $s(t) = 20t - 2t^2$ 米。（数字是虚构的。）求 $a$ 时刻的瞬时速度，以及速度表在 $t = 0$ 和 $t = 2$ 时显示的数值，以及车何时、何处停止。

将 $a + h$ 代入 $t$，保持括号，展开，并使用 $(a + h)^2 = a^2 + 2ah + h^2$：

$$\begin{aligned} &s(a + h) \\ &\quad= 20(a + h) - 2(a + h)^2 \\ &\quad= 20a + 20h - 2(a^2 + 2ah + h^2) \\ &\quad= 20a + 20h - 2a^2 - 4ah - 2h^2. \end{aligned}$$

减去 $s(a) = 20a - 2a^2$：项 $20a$ 和 $-2a^2$ 抵消，剩下 $s(a + h) - s(a) = 20h - 4ah - 2h^2$。每个剩余项都包含 $h$，因此除以 $h$（允许，因为 $h \ne 0$），然后令 $h \to 0$：

$$\begin{aligned} v(a) &= \lim_{h\to0}\frac{20h - 4ah - 2h^2}{h} \\ &= \lim_{h\to0}\,(20 - 4a - 2h) \\ &= 20 - 4a \text{ m/s}. \end{aligned}$$

在 $t = 0$ 时，速度表显示 20 m/s，即 72 km/h（将 m/s 乘以 3.6 得到 km/h）；在 $t = 2$ 时显示 $20 - 8 = 12$ m/s。速度每秒减少 4 m/s，当 $20 - 4a = 0$ 时速度降为 0，此时已过 $t = 5$ 秒。到那时，车已行驶 $s(5) = 100 - 50 = 50$ 米。该公式仅适用于 $0 \le t \le 5$：在 $t = 5$ 之后，车将反向行驶，而刹车不会这样做。

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

### 切线 {#tangent-line}

模块 1 描述了曲线在点 $P$ 处的切线，作为通过 $P$ 的割线在第二点 $Q$ 滑动靠近 $P$ 时所趋近的直线（[图 1.5](module_01_ZH.html#fig-01-5) 展示了球的情况）。通过 $P = (a, f(a))$ 和 $Q = (a + h, f(a + h))$ 的割线的斜率是差商，因此切线的斜率是差商的极限：与速度相同的极限。

::: definition 切线
设 $f$ 在包含 $a$ 的开区间上定义，且 $P = (a, f(a))$。如果极限

$$m = \lim_{h\to0}\frac{f(a + h) - f(a)}{h}$$

存在，函数 $f$ 在点 $P$ 处的 **切线** 是经过点 $P$ 且斜率为 $m$ 的直线。根据 [第 1.4 节](module_01_ZH.html#linear) 的点斜式，其方程为

$$y = f(a) + m(x - a).$$
:::

开区间确保 $f(a + h)$ 在每一个小的 $h$（正或负）都有定义，因此割线可以从两侧趋近。

::: example 曲线 $y = x^3$ 在 $(1, 1)$ 处的切线
求曲线 $y = x^3$ 在点 $(1, 1)$ 处的切线，并找出它在曲线上的其他交点。

在[练习 1.8](module_01_ZH.html#ex-1-8) 中你展开 $(1 + h)^3 = 1 + 3h + 3h^2 + h^3$ 并发现，对于 $h \ne 0$，

$$\begin{aligned} \frac{(1 + h)^3 - 1}{h} &= \frac{3h + 3h^2 + h^3}{h} \\ &= 3 + 3h + h^2. \end{aligned}$$

该表显示了 $P$ 两侧的割线斜率：

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

它们趋近于 3，当 $h > 0$ 时从上方趋近，当 $h < 0$ 时从下方趋近。直接代入得到 $m = \lim_{h\to0}(3 + 3h + h^2) = 3$，因此切线为 $y = 1 + 3(x - 1)$，即，

$$y = 3x - 2.$$

它与曲线相交于 $x^3 = 3x - 2$，即 $x^3 - 3x + 2 = 0$ 处。由于 $x = 1$ 是一个解，因此 $x - 1$ 是一个因子（[模块 2](module_02_ZH.html#factor)）。为找到另一个因子，将 $-3x + 2$ 写成 $-x - (2x - 2)$ 并分组：

$$\begin{aligned} &x^3 - 3x + 2 \\ &\quad= (x^3 - x) - (2x - 2) \\ &\quad= x(x - 1)(x + 1) - 2(x - 1) \\ &\quad= (x - 1)(x^2 + x - 2) \\ &\quad= (x - 1)^2(x + 2), \end{aligned}$$

其中最后一步将 $x^2 + x - 2 = (x - 1)(x + 2)$ 因式分解。因此，直线再次与曲线相交于 $x = -2$，在点 $(-2, -8)$ 处。重复因子 $(x - 1)^2$ 是切线的代数标志：直线在 $x = 1$ 处“两次”相交。

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
"一条切线只在曲线上一点接触。" 这对圆来说是对的，但不是普遍情况：例4.2中的切线在 $(-2, -8)$ 处再次穿过 $y = x^3$。而且一条只与曲线相交一次的直线未必是切线：垂直线 $x = 1$ 仅在 $(1, 1)$ 处与 $y = x^3$ 相交。使一条直线成为 $P$ 点的切线的是它的斜率，即割线斜率的极限。
:::

放大切点，你就会明白为什么这条直线被称为切线。图4.1将 $y = x^3$ 在 $(1, 1)$ 附近的图像放大了十倍，然后再放大十倍。在第一个窗口中，曲线偏离其切线，第二个窗口中偏离程度更小，第三个窗口中两者无法分辨。在切点附近，曲线看起来是直的，它看起来像的那条直线就是切线。

::: figure id=fig-04-1
放大 $y = x^3$（蓝色）在 $(1, 1)$ 点处，其切线为 $y = 3x - 2$（虚线）。每个方框标记下一个面板的窗口，每个方向缩小十倍。在最后一个窗口（宽0.03）中，曲线和切线看起来一模一样。
:::

## 导数 {#derivative}

速度和切线的斜率是同一个极限。其他任何瞬时变化率也是如此：水从水箱中流出的速度，以升每秒为单位；一杯茶冷却的速度，以度每分钟为单位；机器学习模型的误差随其参数变化的速度。这个极限有其自己的名称。

::: definition 某点的导数
设 $f$ 在包含 $a$ 的开区间上定义。函数 $f$ 在 $a$**处的**导数为

$$f'(a) = \lim_{h\to0}\frac{f(a + h) - f(a)}{h},$$

假设这个极限存在（作为一个实数）。那么 $f$ 是 **在 $a$** 处可导。符号 $f'(a)$ 表示 “a 的导数 f'”。
:::

将 $x = a + h$ 代入可得到第二种形式，通常更方便：

$$f'(a) = \lim_{x\to a}\frac{f(x) - f(a)}{x - a}.$$

这两种形式表达的是同一个意思。对于每一个 $x \ne a$，第二种形式在 $x$ 处的商等于定义形式在 $h = x - a$ 处的商；且 $\abs{x - a} < \delta$ 与 $\abs{h} < \delta$ 是相同的条件，因此根据模块 2 中的 ε–δ 定义，一个极限存在当且仅当另一个极限存在，且值相同。

以此名称，三个概念合而为一。

::: keyidea
导数 $f'(a)$ 是

- 曲线 $y = f(x)$ 在点 $(a, f(a))$ 处切线的 **斜率**，即 $y = f(a) + f'(a)(x - a)$；
- 函数 $f$ 在点 $a$ 处的 **瞬时变化率**，单位为 $f$ 每 $x$；
- 时间 $a$ 时的 **速度**，此时 $f(t)$ 是运动物体在时间 $t$ 时的位置。
:::

::: example 由定义求导
设 $f(x) = 2x^2 - 5x + 1$。求 $f'(2)$ 以及图象在 $x = 2$ 处的切线。

首先， $f(2) = 8 - 10 + 1 = -1$。接着代入 $2 + h$，保持括号，展开，用 $(2 + h)^2 = 4 + 4h + h^2$：

$$\begin{aligned} &f(2 + h) \\ &\quad= 2(2 + h)^2 - 5(2 + h) + 1 \\ &\quad= 2(4 + 4h + h^2) - 10 - 5h + 1 \\ &\quad= 8 + 8h + 2h^2 - 10 - 5h + 1 \\ &\quad= -1 + 3h + 2h^2. \end{aligned}$$

所以 $f(2 + h) - f(2) = 3h + 2h^2$，且

$$\begin{aligned} f'(2) &= \lim_{h\to0}\frac{3h + 2h^2}{h} \\ &= \lim_{h\to0}\,(3 + 2h) = 3. \end{aligned}$$

切线为 $y = -1 + 3(x - 2)$，即 $y = 3x - 7$。检查是否经过该点：当 $x = 2$ 时，结果为 $6 - 7 = -1 = f(2)$。

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
从$f(x) = x^2$和$a = 1$开始；$\abs{h}$的滑块在对数刻度上运行，从1递减至0.001。紫色直线是过$(a, f(a))$和$(a + h, f(a + h))$的割线；橙色虚线是$a$处的切线。反复按**Halve h**，观察割线趋近切线，且差商趋近$f'(1) = 2$：对于$x^2$，商为$2a + h$，因此每次减半使差距减半。切换$h$的符号以查看来自左侧的割线。然后尝试$\sqrt x$在$a = 0$处，此时商无界增长，并输入`|x|`与$a = 0$，此时两侧不一致（第4.4节）。对于$\sin x$和$e^x$，小部件从模块5和6证明的公式中获取$f'(a)$；对于你输入的函数，它数值估计$f'(a)$，正如第4.7节所解释的那样。
:::

```check
same(expand(((a + h)**2 - a**2)/h), 2*a + h)
```

::: example 从定义出发的两个更多导数
求 (a) $f'(2)$ 在 $f(x) = \dfrac1x$ 处的值，使用第二种形式；并求 (b) $g'(4)$ 在 $g(x) = \sqrt x$ 处的值，使用第一种形式。每种情况给出切线方程。

**(a)** 将分数合并，公分母为 $2x$：

$$\begin{aligned} f(x) - f(2) &= \frac1x - \frac12 = \frac{2 - x}{2x} \\ &= -\frac{x - 2}{2x}. \end{aligned}$$

用 $x - 2$ 除（允许，因为 $x \ne 2$ 在极限内），然后令 $x \to 2$：

$$f'(2) = \lim_{x\to2}\left(-\frac{1}{2x}\right) = -\frac14.$$

切线方程为 $y = \tfrac12 - \tfrac14(x - 2)$，即 $y = 1 - \tfrac{x}{4}$。斜率为负，因为 $1/x$ 减小；[练习 1.9](module_01_ZH.html#ex-1-9) 得到相同数值 $-1/a^2$ 在 $a = 2$ 处，使用第一种形式。

**(b)** 将 $h = 0$ 代入商 $\dfrac{\sqrt{4 + h} - 2}{h}$ 得到 $\tfrac00$，商中包含平方根，因此需要有理化，如模块 2 所示：将分子和分母同时乘以 $\sqrt{4 + h} + 2$，对分子使用 $(p - q)(p + q) = p^2 - q^2$，并约去因子 $h$（允许，因为 $h \ne 0$）：

$$\begin{aligned} \frac{\sqrt{4 + h} - 2}{h} &= \frac{(4 + h) - 4}{h\big(\sqrt{4 + h} + 2\big)} \\ &= \frac{1}{\sqrt{4 + h} + 2}. \end{aligned}$$

平方根在 4 处连续（模块 3），因此 $\sqrt{4 + h} \to 2$ 作为 $h \to 0$，并 $g'(4) = \dfrac{1}{2 + 2} = \dfrac14$。切线是 $y = 2 + \tfrac14(x - 4)$，即 $y = 1 + \tfrac{x}{4}$。在 $x = 4$ 附近，它是曲线的良好替代：在 $x = 4.1$ 处，它给出 2.025，而 $\sqrt{4.1} \approx 2.0248$。模块 7 将这一观察转化为一种方法，即线性近似。

```check
steps(1/x - Rational(1, 2), (2 - x)/(2*x), -(x - 2)/(2*x))
same((1/x - Rational(1, 2))/(x - 2), -1/(2*x))
limit_is((1/x - Rational(1, 2))/(x - 2), x, 2, -Rational(1, 4)); same((-1/a**2).subs(a, 2), -Rational(1, 4))
same(expand(Rational(1, 2) - Rational(1, 4)*(x - 2)), 1 - x/4)
same((sqrt(4 + h) - 2).subs(h, 0), 0)
steps((sqrt(4 + h) - 2)/h, ((sqrt(4 + h) - 2)*(sqrt(4 + h) + 2))/(h*(sqrt(4 + h) + 2)), ((4 + h) - 4)/(h*(sqrt(4 + h) + 2)), 1/(sqrt(4 + h) + 2))
limit_is(sqrt(4 + h), h, 0, 2); limit_is((sqrt(4 + h) - 2)/h, h, 0, Rational(1, 4)); same(1/(2 + 2), Rational(1, 4))
same(expand(2 + Rational(1, 4)*(x - 4)), 1 + x/4); same((1 + x/4).subs(x, Rational(41, 10)), Rational(2025, 1000))
rounds(sqrt(Rational(41, 10)), '2.0248')
```
:::

::: pitfall
从定义出发求导时的两个错误。第一，继续书写 "$\lim$" 直到让 $h \to 0$ 的步骤： $\dfrac{3h + 2h^2}{h} = 3 + 2h$ 对于 $h \ne 0$ 是正确的，但它不是 3；它的极限是 3。第二，不要在约分前将 $h = 0$ 放入商中：这会得到 $\tfrac00$，这不是一个数。首先约去因子 $h$（允许这样做，因为 $h \ne 0$），然后让 $h \to 0$。
:::

## 导数作为函数 {#derivative-function}

模块 2 和例 4.1 同时找到了每个时刻的速度： $9.8a$ 对于球， $20 - 4a$ 对于汽车。让点变化将导数转化为一个新的函数。

::: definition 导数函数
$f$ 的**导数**是由下式给出的函数 $f'$：

$$f'(x) = \lim_{h\to0}\frac{f(x + h) - f(x)}{h}$$

在每一个 $x$ 处，只要 $f$ 可导，即在该点此极限按定义 4.3 的意义存在。其定义域是那些 $x$ 的集合，可能比 $f$ 的定义域更小。求 $f'$ 的过程称为 **求导** $f$。
:::

在极限中， $x$ 保持不变，而 $h$ 变动。

::: example $x^2$ 和 $\sqrt x$ 的导数
求 $f'(x)$ 对 $f(x) = x^2$ 的导数，以及 $g'(x)$ 对 $g(x) = \sqrt x$ 的导数，并写出它们的定义域。

对于 $f$： $(x + h)^2 - x^2 = (x^2 + 2xh + h^2) - x^2 = 2xh + h^2$，因此对于 $h \ne 0$，差商是 $\dfrac{2xh + h^2}{h} = 2x + h$，并且 $f'(x) = \lim_{h\to0}(2x + h) = 2x$ 对于每一个实数 $x$ 都存在。

对于 $g$，如例 4.4 所示进行有理化：对于 $x > 0$（且 $h \ne 0$ 足够小使得 $x + h > 0$），

$$\begin{aligned} \frac{\sqrt{x + h} - \sqrt x}{h} &= \frac{(x + h) - x}{h\big(\sqrt{x + h} + \sqrt x\big)} \\ &= \frac{1}{\sqrt{x + h} + \sqrt x}. \end{aligned}$$

作为 $h \to 0$, $\sqrt{x + h} \to \sqrt x$, 因为平方根是连续的，所以 $g'(x) = \dfrac{1}{\sqrt x + \sqrt x} = \dfrac{1}{2\sqrt x}$ 对于 $x > 0$。 (在 $x = 4$ 这里得到 $\tfrac14$，如前所述。) 在 $x = 0$ 处定义不适用，因为 $\sqrt x$ 在 0 的左侧未定义；而且即使从右侧来看，商 $\dfrac{\sqrt h - 0}{h} = \dfrac{1}{\sqrt h}$ 也会随着 $h \to 0^+$ 无限增大。因此 $g$ 的定义域是 $[0, \infty)$，但 $g'$ 的定义域是 $(0, \infty)$：函数 $\sqrt x$ 的图像从原点开始垂直向上。

```check
steps((x + h)**2 - x**2, (x**2 + 2*x*h + h**2) - x**2, 2*x*h + h**2)
steps(((x + h)**2 - x**2)/h, (2*x*h + h**2)/h, 2*x + h)
limit_is(((x + h)**2 - x**2)/h, h, 0, 2*x)
xp = symbols('x', positive=True)
steps((sqrt(xp + h) - sqrt(xp))/h, ((xp + h) - xp)/(h*(sqrt(xp + h) + sqrt(xp))), 1/(sqrt(xp + h) + sqrt(xp)))
limit_is(sqrt(xp + h), h, 0, sqrt(xp)); same(1/(sqrt(xp) + sqrt(xp)), 1/(2*sqrt(xp)))
limit_is((sqrt(xp + h) - sqrt(xp))/h, h, 0, 1/(2*sqrt(xp)))
same((1/(2*sqrt(x))).subs(x, 4), Rational(1, 4))
hp = symbols('h', positive=True)
same((sqrt(hp) - 0)/hp, 1/sqrt(hp)); limit_is(sqrt(h)/h, h, 0, oo, '+')
```
:::

### 阅读 $f'$ 的图像 {#graph-of-derivative}

$f'$ 的图像在 $x$ 处的高度是 $f$ 的图像在 $x$ 处的斜率。这句话让你可以根据 $f$ 的图像直接绘制 $f'$，而不需要公式。图 4.2 显示了 $f(x) = x^3 - 3x$ 及其在五个点处的切线，下方是其导函数的图像：下图中的每个点记录了上方切线的斜率。

::: figure id=fig-04-2
顶：$f(x) = x^3 - 3x$ 与其在 $x = -2, -1, 0, 1, 2$ 处的切线。底：其导数 $f'(x) = 3x^2 - 3$；点表示这五条切线的斜率（9，0，$-3$，0，9）。当切线水平时，在 $x = \pm1$（虚线）处，$f'$ 为零；当 $f$ 上升时，$f'$ 为正；当 $f$ 下降时，$f'$ 为负。
:::

::: example 阅读图 4.2
对于 $f(x) = x^3 - 3x$，根据定义找出 $f'(x)$，并与 $f$ 的图像进行比较。

展开 $(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$（将 $x^2 + 2xh + h^2$ 乘以 $x + h$ 并合并同类项）。然后

$$\begin{aligned} &f(x + h) - f(x) \\ &\quad= \big[(x + h)^3 - x^3\big] - 3\big[(x + h) - x\big] \\ &\quad= 3x^2h + 3xh^2 + h^3 - 3h, \end{aligned}$$

因此，差商为 $3x^2 + 3xh + h^2 - 3$ 在 $h \ne 0$ 处，且

$$\begin{aligned} f'(x) &= \lim_{h\to0}\big(3x^2 + 3xh + h^2 - 3\big) \\ &= 3x^2 - 3. \end{aligned}$$

现在与顶部图像进行比较。

- $f$ 的图像在其峰值 $(-1, 2)$ 和谷值 $(1, -2)$ 处有水平切线。确实，当 $x = \pm1$ 时，$f'(x) = 3x^2 - 3 = 0$ 恰好为零。
- 在 $-1$ 左侧和 1 右侧，图像上升，且 $f'(x) = 3(x^2 - 1) > 0$，因为 $x^2 > 1$。
- 在 $-1$ 和 1 之间，图像下降，且 $f'(x) < 0$。它在 $x = 0$ 处下降最陡，此时 $f'(0) = -3$ 是 $f'$ 的最小值。
- 关于原点的一次旋转使 $f$ 的图像保持不变（$f$ 是奇函数），因此它将 $x$ 处的点映射到 $-x$ 处的点，并将该处的切线映射到 $-x$ 处的切线。一次旋转将每条直线变为一条平行直线，因此这两条切线的斜率相同： $f'$ 是偶函数， $f'(-x) = f'(x)$。

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

这种读法适用于任何图像。

::: keyidea
从 $f$ 的图像来绘制 $f'$：

- 当 $f$ 的切线水平（在峰值、谷值和某些平坦点）时， $f' = 0$： $f'$ 的图像与 $x$ 轴相交；
- 当 $f$ 上升时， $f' \ge 0$；当 $f$ 下降时， $f' \le 0$；
- $f$ 越陡， $f'$ 的图像离 $x$ 轴越远；
- 其中 $f$ 有拐点、尖点、垂直切线或跳跃间断点，$f'$ 未定义（第4.4节）。
:::

第二条规则可从定义推出。若区间内凡有 $x_1 < x_2$ 总有 $f(x_1) < f(x_2)$，就称 $f$ 在该区间上**递增**（严格递增，见[练习 1.10](module_01_ZH.html#ex-1-10)）；若总有 $f(x_1) > f(x_2)$，则称**递减**。设 $f$ 在含 $x$ 的开区间上递增，并且在 $x$ 处可微。对每个足够小、使 $x + h$ 仍在该区间内的 $h \ne 0$，分子 $f(x + h) - f(x)$ 与 $h$ 同号，所以这些差商全为正。它们的极限 $f'(x)$ 不能为负，因为如果为负，当 $h$ 足够小时，差商与该极限的距离小于 $\abs{f'(x)}/2$，于是差商本身也为负。不过极限可以为 0：$x^3$ 递增，但在 0 处切线水平。同理，$f$ 递减时 $f'(x) \le 0$。部分逆命题也成立：若区间内每一点都有 $f' > 0$，则 $f$ 在该区间递增。这需要模块 8 的微分中值定理来证明。

```check
same(diff(x**3, x).subs(x, 0), 0)
holds(all((x**3).subs(x, p_) < (x**3).subs(x, q_) for p_, q_ in ((-2, -1), (-1, 0), (0, 1), (Rational(-1, 10), Rational(1, 10)))))
```

::: pitfall
图形 $f'$ 记录的是斜率，而不是高度。在 $f$ 的顶点处，当 $f$ 在附近达到最大值时， $f'$ 为 0；并且当 $f$ 为负数时， $f'$ 可以很大，如图 4.2 中的 $x = -2$ 所示，其中 $f(-2) = -2$ 但 $f'(-2) = 9$。在你绘制 $f'$ 之前，请在每个点上问自己：“斜率多大？是上坡还是下坡？”而不是“高度多高？”。

```check
same(f46.subs(x, -2), -2); same((3*x**2 - 3).subs(x, -2), 9)
```
:::

### 符号 {#notation}

有几种导数的表示法，你将都会遇到。如果 $y = f(x)$，这些都表示导数：

$$f'(x) = y' = \frac{dy}{dx} = \frac{df}{dx} = \frac{d}{dx}f(x) = Df(x).$$

| 符号 | 读法 |
|---|---|
| $f'(x)$, $y'$ | “x 的 f 的导数”，“y 的导数” |
| $\dfrac{dy}{dx}$ | “y 对 x 的导数” |
| $\dfrac{d}{dx}f(x)$ | “x 对 f 的导数” |
| $Df(x)$ | “D 对 x 的 f” |

先生符号简洁，表示函数。莱布尼茨的表示法 $\dfrac{dy}{dx}$ 显示了哪个变量在变化，并提示了它所代表的商 $\dfrac{\Delta y}{\Delta x}$ 的极限。符号 $\dfrac{d}{dx}$ 是一个指令，“对 $x$ 求导”： $\dfrac{d}{dx}\big(x^2\big) = 2x$。在某一点的值，写作 $f'(a)$ 或，在莱布尼茨的表示法中，

$$\left.\frac{dy}{dx}\right|_{x=a},$$

读作 "dee y 由 dee x 在 x 等于 a 处"。对于下落的球，$\dfrac{ds}{dt} = 9.8t$ 和 $\left.\dfrac{ds}{dt}\right|_{t=2} = 19.6$ m/s。物理学家也用点表示对时间的导数：$\dot s$，读作 "s dot"，表示 $\dfrac{ds}{dt}$。

单位随符号一起给出：$\dfrac{ds}{dt}$ 的单位是 $s$ 每 $t$ 的单位，此处为米每秒；温度（摄氏度）对时间（分钟）的导数单位是摄氏度每分钟。

```check
same(diff(x**2, x), 2*x); same(diff(s49, t), Rational(98, 10)*t); same(diff(s49, t).subs(t, 2), Rational(196, 10))
```

::: pitfall
$\dfrac{dy}{dx}$ 不是分数：$dy$ 和 $dx$ 这里不是数，也不能约去 $d$ 来得到 $\dfrac{y}{x}$。 （对于 $y = x^2$，$\dfrac{dy}{dx} = 2x$，虽然 $\dfrac{y}{x} = x$。） 模块 5 表明它通常表现得像分数，这也是它吸引人的地方。第二个错误：$f'(3)$ 表示“先求导，再代入 $x = 3$”。先代入 $x = 3$ 会得到一个数，而数不会变化，因此它的导数为 0：对于 $f(x) = x^2$，$f'(3) = 2 \cdot 3 = 6$，但 $\dfrac{d}{dx}\big(f(3)\big) = \dfrac{d}{dx}(9) = 0$。

```check
same(diff(x**2, x), 2*x); same((x**2)/x, x)
same(diff(x**2, x).subs(x, 3), 6); same(diff((x**2).subs(x, 3), x), 0)
```
:::

## 可导性 {#differentiability}

### 导数失效的情况 {#failures}

并非每个函数在每一点都有导数。图4.3展示了四个在0处均无导数的函数。其中，$x^{1/3} = \sqrt[3]{x}$是实数立方根，对每个$x$有定义（[第1.4节](module_01_ZH.html#roots)），$x^{2/3} = \big(\sqrt[3]{x}\big)^2$，而$H$是**单位阶跃函数**，$H(x) = 0$对应于$x < 0$，$H(x) = 1$对应于$x \ge 0$。

::: figure id=fig-04-3
在0点处不可导的四种情况：一个角点：$\abs{x}$在左侧斜率为$-1$，在右侧斜率为1（虚线所示）；一个尖点：$x^{2/3}$的斜率在左侧趋向于$-\infty$，在右侧趋向于$\infty$；一条垂直切线：$x^{1/3}$的图像在0点处变为垂直（虚线所示）；一个跳跃：阶跃函数$H$在0点处不连续。
:::

由于前三个函数都是$f(0) = 0$，它们在0处的差商都是$f(h)/h$：

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

三列在不同方式下表现。对于 $\abs{x}$，商在 0 的一侧为 1，另一侧为 $-1$；对于 $x^{2/3}$，它们在右侧趋向正无穷，在左侧趋向负无穷；对于 $x^{1/3}$，它们在两侧都趋向正无穷。如模块 2 所示，从一侧取极限可以精确描述每一列的行为。

::: definition 单侧导数
函数 $f$ 在 $a$ 处的 **右导数**和**左导数** 为

$$\begin{aligned} f'_+(a) &= \lim_{h\to0^+}\frac{f(a + h) - f(a)}{h}, \\ f'_-(a) &= \lim_{h\to0^-}\frac{f(a + h) - f(a)}{h}, \end{aligned}$$

当这些极限存在（作为实数）时。函数在开区间**上**可微，如果它在区间的每一点都可微，并且函数在闭区间**$[a, b]$上**可微，如果它在$(a, b)$上可微，且在$a$处有右导数，在$b$处有左导数。
:::

读作 "a 的 f 的右导数" 和 "a 的 f 的左导数"。一个双边极限存在的条件是两个单边极限都存在并且相等（模块 2），因此 $f'(a)$ 存在当且仅当两个单边导数都存在并且相等，此时三个极限都是同一个数。现在依次分析这四个函数。

- **尖角。**对于 $\abs{x}$，当 $h > 0$ 时差商 $\abs{h}/h$ 总为 1，当 $h < 0$ 时总为 $-1$。所以 $f'_+(0) = 1$ 且 $f'_-(0) = -1$。两个单侧导数都存在，但不相等，因此 $f'(0)$ 不存在。图像在这里有一个**尖角**，没有唯一切线。在 0 以外，$\abs{x}$ 可微：$x < 0$ 时导数为 $-1$，$x > 0$ 时为 1。神经网络的 ReLU $\max(0, x)$（见[第 1.3 节](module_01_ZH.html#piecewise)）在 0 处也有尖角，两个单侧导数分别为 0 和 1。训练软件仍要在此返回一个数值，通常取 0。
- **尖点.**对于 $x^{2/3}$，商是 $h^{2/3}/h = h^{-1/3} = 1/\sqrt[3]{h}$，当 $h \to 0^+$ 时趋于 $\infty$，当 $h \to 0^-$ 时趋于 $-\infty$。图像在原点处跌落并陡峭地离开：一个**尖点**，其中连续函数的商在一边趋于 $\infty$，另一边趋于 $-\infty$。
- **垂直切线.**对于 $x^{1/3}$，商是 $h^{-2/3} = 1\big/\big(\sqrt[3]{h}\big)^2$，从两侧都趋于 $\infty$，因此割线变得垂直。当 $f$ 在 $a$ 处连续且其差商从两侧趋于 $\infty$（或从两侧趋于 $-\infty$），图像在 $a$ 处有**垂直切线**，即直线 $x = a$。放大后，图像看起来像这条直线，如图 4.1 所示；但垂直直线没有斜率，因此 $f'(0)$ 仍然不存在。
- **Jump.** 对于 $H$，当 $H(0) = 1$ 时，商 $h < 0$ 的值为 $\dfrac{H(h) - H(0)}{h} = \dfrac{0 - 1}{h} = -\dfrac1h$，它随着 $h \to 0^-$ 而无界增长。下一个定理表明这并非偶然：一个函数在其不连续的点上永远不会可导。

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

### 可微函数连续 {#continuity}

::: theorem 可导蕴含连续
若 $f$ 在 $a$ 可微，则 $f$ 在 $a$ 连续。
:::

::: proof
对于 $x \ne a$ 在 $f$ 定义的开区间内，写出

$$f(x) - f(a) = \frac{f(x) - f(a)}{x - a}\cdot(x - a).$$

如 $x \to a$，根据定义的第二种形式，第一个因子趋于 $f'(a)$，第二个因子趋于 0。根据极限的乘积法则（模块 2），

$$\lim_{x\to a}\big(f(x) - f(a)\big) = f'(a)\cdot0 = 0,$$

因此 $\lim_{x\to a}f(x) = f(a)$，这正是 $a$ 处连续性的含义（模块 3）。
:::

假设在乘积法则中起作用，该法则需要两个因子的极限都是数。对于 $x^{1/3}$ 在 0 处的情形，第一个因子趋于 $\infty$，而该论证证明了什么都没有（尽管 $x^{1/3}$ 恰好是连续的）。

```check
F = Function('F')
same((F(x) - F(a))/(x - a)*(x - a), F(x) - F(a))
```

两个结论值得分开。

- **反言（Contrapositive）**: 如果 $f$ 在 $a$ 处不连续，则它在 $a$ 处不可导。这消除了图 4.3 中的跳跃间断点，以及其他所有间断点，立即成立。
- **逆命题（Converse）是错误的**: 一个连续函数不一定可导。 $\abs{x}$、 $x^{2/3}$ 和 $x^{1/3}$ 在 0 处都是连续的（模块 3），且它们在该点均不可导。

因此，可导性是一个更强的性质。连续性在 $a$ 处表示图像在那里不会断裂；可导性则进一步要求：在 $a$ 处放大观察，图像看起来像一条非垂直的直线。这排除了尖点、拐点和垂直切线等情况，以及其他可能的失败情形：在 [练习 4.11](#ex-4-11) 中，一个连续函数在 0 附近振荡得如此之快，以至于从原点引出的割线从两侧都不会稳定在任何斜率上。

```check
limit_is(Abs(x), x, 0, 0); limit_is(real_root(x**2, 3), x, 0, 0); limit_is(real_root(x, 3), x, 0, 0)
limit_is(x*sin(1/x), x, 0, 0); same(x*sin(1/x)/x, sin(1/x))                     # Exercise 4.11: continuous, and the quotient is sin(1/h)
same(limit(sin(1/h), h, 0, '+'), AccumBounds(-1, 1)); same(limit(sin(1/h), h, 0, '-'), AccumBounds(-1, 1))
```

::: pitfall
$f$在$a$处连续，因此$f'(a)$存在，这是定理4.1的逆命题，且为假：$\abs{x}$在0处是标准反例。另一个相关错误是信任在推导$f'$的点之外使用的公式。$\abs{x}$的导数是$-1$，对于$x < 0$成立，对于$x > 0$成立，某些程序将其写为$\operatorname{sign}(x)$；但$\operatorname{sign}(0) = 0$并不使$\abs{x}$在0处可导。第4.5节展示了SymPy正是这样做的。
:::

::: deeper 可导意味着局部线性
图 4.1 表示了可导的几何意义：在 $a$ 附近，图像几乎是一条直线。以下是精确的陈述。对于斜率 $m$，令

$$E(h) = f(a + h) - \big(f(a) + mh\big)$$

为直线 $y = f(a) + m(x - a)$ 在 $x = a + h$ 处的误差。则 **$f$ 在 $a$ 处可导，当且仅当 $f'(a) = m$ 恰好等于 $E(h)/h \to 0$ 时 $h \to 0$。** 实际上，

$$\frac{E(h)}{h} = \frac{f(a + h) - f(a)}{h} - m,$$

当差商趋于$m$时，它恰好趋于0。对于任何其他斜率$m_1 \ne f'(a)$，相同的计算给出$E_1(h)/h \to f'(a) - m_1 \ne 0$。因此，切线是通过$(a, f(a))$的直线中，其误差比$h$本身收缩得更快的那一条。对于$f(x) = x^3$在$a = 1$处，$E(h) = (1 + h)^3 - (1 + 3h) = 3h^2 + h^3$，因此$E(h)/h = 3h + h^2 \to 0$；在图4.1的最后一个窗口中，其中$\abs{h} \le 0.015$，误差最多约为0.0007，小到看不见。模块7在此基础上构建线性近似，模块17使用相同的想法为多变量函数定义可微性。

```check
m1_ = symbols('m_1')
same((F(a + h) - (F(a) + m*h))/h, (F(a + h) - F(a))/h - m)
same(expand((1 + h)**3 - (1 + 3*h)), 3*h**2 + h**3); same(expand((3*h**2 + h**3)/h), 3*h + h**2)
limit_is(((1 + h)**3 - (1 + m1_*h))/h, h, 0, 3 - m1_)
same(3*Rational(15, 1000)**2 + Rational(15, 1000)**3, Rational(678375, 1000000000)); rounds(Rational(678375, 1000000000), '0.0007')
holds(3*Rational(15, 1000)**2 + Rational(15, 1000)**3 < Rational(9, 100)/100)
```
:::

## 第一条规则 {#rules}

每次从定义出发计算导数都很慢。少数几条规则，每条只需从定义证明一次，就能快速进行计算：使用本节的规则，你可以在一行内求导任何多项式。模块5添加了乘积法则、商法则和链式法则。

### 常数与幂 {#power-rule}

看一下目前定义所给出的内容：$\big(x^2\big)' = 2x$（例 4.5），例 4.6 中的计算显示 $\big(x^3\big)' = 3x^2$。模式是：指数会降到前面，新的指数比原来小 1。例 4.6 也说明了这一点。

$$(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3,$$

$x^3$ 与 $-x^3$ 抵消，除以 $h$ 后，项 $3x^2h$ 变为 $3x^2$，其余每一项都包含 $h^2$，因此在除后仍包含 $h$，并在极限下消失。这就是证明的思路，下面的证明对每一项都进行这样的处理。

::: theorem 常数法则与幂法则
对于每一个常数 $c$，每一个正整数 $n$ 和每一个实数 $x$，

$$\frac{d}{dx}(c) = 0 \quad\text{and}\quad \frac{d}{dx}\big(x^n\big) = nx^{n-1}.$$

特别地，$\dfrac{d}{dx}(x) = 1$（此处 $x^0$ 表示 1，也见于 $x = 0$）。
:::

::: proof
**常数。** 若 $f(x) = c$，则每一个差商都是 $\dfrac{c - c}{h} = 0$，因此极限为 0。

**幂。**写出$(x + h)^n = (x + h)(x + h)\cdots(x + h)$，包含$n$个因子。展开后，结果的每一项从$n$个因子中各选$x$或$h$之一并将所选项相乘。每次选$x$得到$x^n$。恰好从一个因子选$h$而其余$n - 1$个因子选$x$得到$x^{n-1}h$，且有$n$种方式选择该因子，因此这些项之和为$nx^{n-1}h$。其余每项至少选$h$两次，故含$h^2$。收集这些项，

$$(x + h)^n = x^n + nx^{n-1}h + h^2\,Q(x, h),$$

其中 $Q(x, h)$ 是 $x$ 和 $h$ 的多项式（当 $n = 1$ 时还包括 $Q = 0$）。因此，对于 $h \ne 0$，

$$\frac{(x + h)^n - x^n}{h} = nx^{n-1} + h\,Q(x, h).$$

当 $h \to 0$， $Q(x, h)$ 趋于 $Q(x, 0)$ 时，可以直接代入，因为它是 $h$ 的多项式；因此 $h\,Q(x, h)$ 趋于 $0 \cdot Q(x, 0) = 0$，商趋于 $nx^{n-1}$。
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
准确数出选法，就得到**二项式定理**。从 $n$ 个因子中选出 $k$ 个贡献一个 $h$，每种选法都产生一次 $x^{n-k}h^k$ 这一项，故

$$\begin{aligned} (x + h)^n &= x^n + \binom{n}{1}x^{n-1}h \\ &\quad + \binom{n}{2}x^{n-2}h^2 + \dots + h^n, \end{aligned}$$

其中 $\binom{n}{k} = \dfrac{n!}{k!\,(n - k)!}$ 读作「从 n 中选 k」，表示从 $n$ 个对象中选出 $k$ 个的选法数（其中 $0! = 1$）。例如 $(x + h)^4 = x^4 + 4x^3h + 6x^2h^2 + 4xh^3 + h^4$。上面的证明只用到前两项。

```check
same(expand((x + h)**4), x**4 + 4*x**3*h + 6*x**2*h**2 + 4*x*h**3 + h**4)
same([binomial(4, k_) for k_ in range(5)], [1, 4, 6, 4, 1]); same(binomial(4, 2), factorial(4)/(factorial(2)*factorial(2)))
for N_ in range(1, 8):
    same(expand((x + h)**N_), sum(binomial(N_, k_)*x**(N_ - k_)*h**k_ for k_ in range(N_ + 1)))
same(factorial(0), 1)
```
:::

公式 $nx^{n-1}$ 看起来不仅适用于正整数：例 4.4 求得 $1/x = x^{-1}$ 在 2 处的斜率为 $-\tfrac14 = (-1) \cdot 2^{-2}$，例 4.5 求得 $\big(\sqrt x\big)' = \dfrac{1}{2\sqrt x} = \tfrac12 x^{-1/2}$。定理 4.2 并未证明这些，因为其证明过程需要展开 $n$ 个因子。模块 5 证明了负整数的情况，模块 6 证明了所有实数指数的情况。

```check
same(-1*Integer(2)**(-2), -Rational(1, 4)); same(Rational(1, 2)*x**Rational(-1, 2), 1/(2*sqrt(x)))
```

### 常数倍与和 {#sum-rule}

::: theorem 常数倍法则与和法则
设 $f$、$g$ 在 $x$ 处可微，$c$ 为常数。则 $cf$、$f + g$ 和 $f - g$ 在 $x$ 处可微，且

$$\begin{aligned} (cf)'(x) &= c\,f'(x), \\ (f + g)'(x) &= f'(x) + g'(x), \\ (f - g)'(x) &= f'(x) - g'(x). \end{aligned}$$
:::

::: proof
每个法则均可由模块 2 的极限法则推导得出。对于常数倍法则，函数 $cf$ 的差商为

$$\begin{aligned} &\frac{cf(x + h) - cf(x)}{h} \\ &\quad= c\cdot\frac{f(x + h) - f(x)}{h}, \end{aligned}$$

哪个趋于 $c\,f'(x)$ 依据常数倍法则。对于和，写 $\Delta f = f(x + h) - f(x)$ 和 $\Delta g = g(x + h) - g(x)$ 表示 $f$ 和 $g$ 的变化，依据模块 1 的 $\Delta$。重新组合项后， $f + g$ 的变化为

$$\begin{aligned} &\big(f(x + h) + g(x + h)\big) \\ &\quad - \big(f(x) + g(x)\big) = \Delta f + \Delta g, \end{aligned}$$

因此， $f + g$ 的差商是 $\dfrac{\Delta f + \Delta g}{h} = \dfrac{\Delta f}{h} + \dfrac{\Delta g}{h}$，依据和法则趋于 $f'(x) + g'(x)$。最后， $f - g = f + (-1)g$，因此前两条规则给出 $(f - g)' = f' + (-1)g' = f' - g'$。
:::

```check
G = Function('G')
same((c*F(x + h) - c*F(x))/h, c*(F(x + h) - F(x))/h)
same((F(x + h) + G(x + h)) - (F(x) + G(x)), (F(x + h) - F(x)) + (G(x + h) - G(x)))
same(((F(x + h) + G(x + h)) - (F(x) + G(x)))/h, (F(x + h) - F(x))/h + (G(x + h) - G(x))/h)
same(diff(c*F(x), x), c*diff(F(x), x)); same(diff(F(x) + G(x), x), diff(F(x), x) + diff(G(x), x))
same(diff(F(x) - G(x), x), diff(F(x), x) - diff(G(x), x))
```

假设很重要：公式需要 $f'(x)$ 和 $g'(x)$ 存在。没有它们，和可能可导也可能不可导： $\abs{x}$ 和 $-\abs{x}$ 在 0 处没有导数，但它们的和，即常数 0，有导数。

```check
same(Abs(x) + (-Abs(x)), 0); same(diff(Abs(x) + (-Abs(x)), x), 0)
limit_is((Abs(h) - 0)/h, h, 0, 1, '+'); limit_is((-Abs(h) - 0)/h, h, 0, 1, '-')
```

反复应用和法则，可以处理任意数量的项的和。换句话说：和的导数是导数的和，常数因子保持不变。这两条规则共同说明微分是 **线性**。

### 多项式 {#polynomials}

用这些规则，多项式逐项求导：

$$\begin{aligned} &\frac{d}{dx}\big(a_nx^n + \dots + a_1x + a_0\big) \\ &\quad= na_nx^{n-1} + \dots + 2a_2x + a_1. \end{aligned}$$

常数项 $a_0$ 消失。因此，每个多项式在 $\R$ 上均可导，其导数仍然是一个多项式，当次数至少为 1 时，次数减少 1。

```check
for N_ in range(1, 6):
    cs = symbols(f'c0:{N_ + 1}')
    poly_ = sum(cs[i]*x**i for i in range(N_ + 1))
    same(diff(poly_, x), sum(i*cs[i]*x**(i - 1) for i in range(1, N_ + 1)))
```

::: example 多项式的求导
对 $p(x) = 4x^5 - 3x^3 + 7x - 2$ 求导，并求出在 $x = 1$ 处的切线方程。

根据和与差法则，逐项求导；根据常数倍法则，保持每个系数不变；然后使用幂法则和常数法则：

$$\begin{aligned} p'(x) &= 4\frac{d}{dx}\big(x^5\big) - 3\frac{d}{dx}\big(x^3\big) \\ &\quad + 7\frac{d}{dx}(x) - \frac{d}{dx}(2) \\ &= 4 \cdot 5x^4 - 3 \cdot 3x^2 + 7 \cdot 1 - 0 \\ &= 20x^4 - 9x^2 + 7. \end{aligned}$$

在 $x = 1$ 处： $p(1) = 4 - 3 + 7 - 2 = 6$ 和 $p'(1) = 20 - 9 + 7 = 18$，因此切线方程为 $y = 6 + 18(x - 1)$，即 $y = 18x - 12$。

```check
p47 = 4*x**5 - 3*x**3 + 7*x - 2
steps(Derivative(p47, x), 4*Derivative(x**5, x) - 3*Derivative(x**3, x) + 7*Derivative(x, x) - Derivative(2, x), 4*5*x**4 - 3*3*x**2 + 7*1 - 0, 20*x**4 - 9*x**2 + 7)
same(p47.subs(x, 1), 6); same(diff(p47, x).subs(x, 1), 18)
same(expand(6 + 18*(x - 1)), 18*x - 12)
```
:::

::: example 水平切线
找出 $g(x) = 2x^3 - 9x^2 + 12x - 4$ 图像上具有水平切线的点。

水平切线的斜率为 0，因此解 $g'(x) = 0$。根据法则，

$$\begin{aligned} g'(x) &= 6x^2 - 18x + 12 \\ &= 6(x^2 - 3x + 2) \\ &= 6(x - 1)(x - 2), \end{aligned}$$

哪里恰好为 0 在 $x = 1$ 和 $x = 2$。由于 $g(1) = 2 - 9 + 12 - 4 = 1$ 和 $g(2) = 16 - 36 + 24 - 4 = 0$，图在 $(1, 1)$ 和 $(2, 0)$ 处有水平切线。对于 $1 < x < 2$，一个因子为正，另一个为负，因此 $g'(x) < 0$：那里的切线向下倾斜。模块 8 证明了图从 $(1, 1)$ 下降到 $(2, 0)$，并将这种推理转化为寻找极值的方法。

```check
g48 = 2*x**3 - 9*x**2 + 12*x - 4
steps(diff(g48, x), 6*x**2 - 18*x + 12, 6*(x**2 - 3*x + 2), 6*(x - 1)*(x - 2))
same_set(solve(diff(g48, x), x), [1, 2])
same(g48.subs(x, 1), 1); same(2 - 9 + 12 - 4, 1); same(g48.subs(x, 2), 0); same(16 - 36 + 24 - 4, 0)
same(solve_univariate_inequality(6*(x - 1)*(x - 2) < 0, x, relational=False), Interval.open(1, 2))
```
:::

::: pitfall
三个诱人的错误规则。**(1)**乘积的导数不是导数的乘积：$\big(x \cdot x\big)' = \big(x^2\big)' = 2x$，而非$1 \cdot 1 = 1$。在模块5的乘积法则之前，先展开：$\dfrac{d}{dx}\big((x^2 + 1)(x - 3)\big) = \dfrac{d}{dx}\big(x^3 - 3x^2 + x - 3\big) = 3x^2 - 6x + 1$。**(2)**常数的导数为0，无论其形式如何：$\dfrac{d}{dx}\big(\pi^2\big) = 0$，而非$2\pi$，因为$\pi^2$是一个数。**(3)** 幂法则要求变量在底数且指数为常数：$\dfrac{d}{dx}\big(2^x\big)$，而非$x \cdot 2^{x-1}$；模块6中推导它。

```check
same(diff(x*x, x), 2*x); same(diff(x*x, x).subs(x, 1), 2)
same(expand((x**2 + 1)*(x - 3)), x**3 - 3*x**2 + x - 3); same(diff(x**3 - 3*x**2 + x - 3, x), 3*x**2 - 6*x + 1)
same(diff(pi**2, x), 0)
holds(Ne(diff(2**x, x).subs(x, 1), (x*2**(x - 1)).subs(x, 1)))
```
:::

::: compute 使用 SymPy 计算导数
SymPy 使用 `sp.diff` 进行求导，它了解本节及更多规则。以下是例 4.7，即某点的导数，以及作为极限的定义本身：

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

`sp.limit` 的第四个参数 `'+-'` 要求双边极限；若不使用它，SymPy 仅从右侧趋近。答案可能与你的不同，因为 SymPy 可能因式分解或重新排列：

```python
print(sp.diff(p, x, 2))            # the second derivative (Section 4.6)
print(sp.diff(sp.sqrt(x), x))      # Example 4.5
```

```output
2*x*(40*x**2 - 9)
1/(2*sqrt(x))
```

实际上，$80x^3 - 18x$ 是 `2*x*(40*x**2 - 9)` 的因式分解形式，是 $20x^4 - 9x^2 + 7$ 的导数。现在注意第 4.4 节的警告。声明 $x$ 为实数（对于复数，SymPy 的答案更复杂）：

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

对于实数 $x \ne 0$，`sign(x)` 是正确的：对于 $x < 0$ 为 $-1$，对于 $x > 0$ 为 1。但代入 0 时得到 0，仿佛 $\abs{x}$ 在那里导数为 0，而其差商的一边极限 1 和 $-1$ 显示它不存在导数；使用 `'+-'` 时，SymPy 将拒绝双边极限，如模块 2 所示。一个关于 $f'$ 的公式在 $f$ 不可导的点上告诉你什么也没有。
:::

```check
same(expand(2*x*(40*x**2 - 9)), 80*x**3 - 18*x); same(diff(20*x**4 - 9*x**2 + 7, x), 80*x**3 - 18*x)
xr_ = symbols('x', real=True)
same(diff(Abs(xr_), xr_), sign(xr_)); same(sign(xr_).subs(xr_, 0), 0)
```

## 高阶导数和运动 {#higher-derivatives}

导数 $f'$ 是一个函数，因此也可以对其求导。

::: definition 高阶导数
**二阶导数**是$f$关于$f'$的导数：$f'' = (f')'$。**三阶导数**是$f''' = (f'')'$，一般地，**$n$阶导数**$f^{(n)}$是$f^{(n-1)}$的导数，只要这些导数存在。在莱布尼茨记号中，对于$y = f(x)$，

$$\begin{aligned} f''(x) &= \frac{d^2y}{dx^2} = \frac{d}{dx}\left(\frac{dy}{dx}\right), \\ f^{(n)}(x) &= \frac{d^ny}{dx^n}. \end{aligned}$$
:::

读作： $f''(x)$ 是 “f 双撇号在 x 处”， $f'''(x)$ 是 “f 三撇号在 x 处”， $f^{(4)}(x)$ 是 “f 在 x 处的四阶导数”， $\dfrac{d^2y}{dx^2}$ 是 “二阶导数 dy/dx 平方”。这里的 2 表示求导次数，不是幂次。式子 $f^{(4)}$ 中的括号将其与幂 $f^4$ 区分开。

::: example 多项式的全部导数
求 $p(x) = x^4 - 2x^3 + 5x$ 的所有导数。

不断应用这些规则：

$$\begin{aligned} p'(x) &= 4x^3 - 6x^2 + 5, \\ p''(x) &= 12x^2 - 12x, \\ p'''(x) &= 24x - 12, \\ p^{(4)}(x) &= 24, \\ p^{(5)}(x) &= 0, \end{aligned}$$

和每一个后续导数也都为 0。每次求导都会使次数降低 1，因此一个次数为 $n$ 的多项式，其常数项的 $n$ 阶导数为非零，而所有高于 $n$ 阶的导数均为 0。对于 $x^n$ 本身，其 $n$ 阶导数为 $n(n - 1)\cdots2 \cdot 1 = n!$；这里为 $p^{(4)} = 24 = 4!$，因为 $p$ 的主项系数为 1。

```check
p49 = x**4 - 2*x**3 + 5*x
same(diff(p49, x), 4*x**3 - 6*x**2 + 5); same(diff(p49, x, 2), 12*x**2 - 12*x); same(diff(p49, x, 3), 24*x - 12)
same(diff(p49, x, 4), 24); same(diff(p49, x, 5), 0); same(diff(p49, x, 6), 0); same(factorial(4), 24)
for N_ in range(1, 8):
    same(diff(x**N_, x, N_), factorial(N_)); same(diff(x**N_, x, N_ + 1), 0)
```
:::

### 速度、加速度和加加速度 {#motion}

对于沿直线运动的物体，设在时间 $t$ 时的位置为 $s(t)$，则前三个导数分别称为：

| 量 | 定义 | 单位 |
|---|---|---|
| 速度 | $v(t) = s'(t) = \dfrac{ds}{dt}$ | m/s |
| 加速度 | $a(t) = v'(t) = s''(t) = \dfrac{d^2s}{dt^2}$ | m/s² |
| 加加速度 | $j(t) = a'(t) = s'''(t) = \dfrac{d^3s}{dt^3}$ | m/s³ |

单位是 $s$ 以米为单位，$t$ 以秒为单位。加速度是速度的变化率：下落的球具有 $v(t) = 9.8t$，因此其加速度恒定，为 $a(t) = 9.8$ m/s²，即 模块 1 中的重力加速度。例 4.1 中的刹车汽车具有 $v(t) = 20 - 4t$ 和 $a(t) = -4$ m/s²：为负值，因为其速度在减小。加加速度（jerk）是加速度的变化率，当你乘坐电梯或火车突然启动或停止时，你会感受到这种加加速度；电梯、火车和机械臂的设计旨在使其尽可能小。

$a$ 的符号表明 $v$ 是在增加还是减少（模块 8 证明了正导数意味着函数递增）。因此，当速度和加速度符号相同时，物体 **加速**；当它们符号不同时，物体 **减速**。

```check
same(diff(Rational(98, 10)*t, t), Rational(98, 10)); same(diff(s49, t, 2), Rational(98, 10))
same(diff(20*t - 2*t**2, t), 20 - 4*t); same(diff(20*t - 2*t**2, t, 2), -4)      # the braking car
```

::: example 一个来回运动的粒子
假设一个粒子沿一条直线运动，其在 $t$ 秒后的位移为 $s(t) = t^3 - 6t^2 + 9t$ 米，对于 $t \ge 0$；该运动由一些数值构成，便于计算。求其速度、加速度和冲击加速度。何时静止？何时向后运动？何时加速？

求三阶导数：

$$\begin{aligned} v(t) &= 3t^2 - 12t + 9 = 3(t - 1)(t - 3), \\ a(t) &= 6t - 12 = 6(t - 2), \\ j(t) &= 6. \end{aligned}$$

粒子静止时 $v(t) = 0$：在 $t = 1$ 时，在位置 $s(1) = 4$ 米处，以及在 $t = 3$ 时回到 $s(3) = 0$。对于 $1 < t < 3$，因数 $t - 1$ 和 $t - 3$ 符号相反，所以 $v < 0$，粒子向后运动；在 $t = 1$ 之前和 $t = 3$ 之后， $v > 0$，粒子向前运动。前 4 秒内，它从 0 米前进到 4 米，再回到 0 米，然后再次前进至 $s(4) = 4$ 米：它总共移动了 $4 + 4 + 4 = 12$ 米，尽管最终只偏离起点 4 米。

加速度在 $t = 2$ 处改变符号。比较 $v$ 和 $a$ 的符号：

| 区间 | $v$ | $a$ | 粒子 |
|---|---|---|---|
| $0 < t < 1$ | $+$ | $-$ | 向前运动，减速 |
| $1 < t < 2$ | $-$ | $-$ | 向后运动，加速 |
| $2 < t < 3$ | $-$ | $+$ | 向后移动，速度减慢 |
| $t > 3$ | $+$ | $+$ | 向前移动，速度加快 |

图4.4显示了三个图。其中$s$处有水平切线，$v$为0；其中$v$处有水平切线，且在最低点$t = 2$，$a$为0：每个图都是其上方图的斜率图。

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
例4.10中的粒子。上图：其位置$s(t)$，在$t = 1$和$t = 3$处有水平切线。中图：其速度$v(t) = s'(t)$，在$t = 1$和$t = 3$为0，在中间为负值，此时粒子向后移动；其最低点在$t = 2$。下图：其加速度$a(t) = v'(t)$， 在$t = 2$为0。
:::

::: pitfall
速度不是速率，负加速度并不意味着减速。在例题4.10中，标记$t = 1$和$t = 2$之间的加速度是负的，但粒子却在加速：它以越来越快的速度向后运动，其速度从0变为$-3$ m/s，速率从0变为3 m/s。物体是否加速取决于标记$v$和$a$的符号是否相同，而不是仅取决于标记$a$的符号。

```check
same(v410.subs(t, 1), 0); same(v410.subs(t, 2), -3); same(Abs(v410.subs(t, 2)), 3); holds(a410.subs(t, Rational(3, 2)) < 0)
```
:::

## 数值微分 {#numerical}

有时并没有可以求导的公式。一个函数可能仅以程序的形式已知，例如需要几分钟才能运行的模拟程序，或者仅通过测量得到，例如每秒记录一次的汽车位置。此时，导数是通过函数的几个值，利用差商和一个小的步长$h$来估计的。两个选择决定了估计的精度：使用哪种商，以及使用哪种$h$。

### 前向差分和中心差分 {#differences}

::: definition 前向差分和中心差分
取步长 $h > 0$，则 $f$ 在 $a$ 处的**前向差分**和**中心差分**分别为

$$\begin{aligned} &\text{forward:} && \frac{f(a + h) - f(a)}{h}, \\ &\text{central:} && \frac{f(a + h) - f(a - h)}{2h}. \end{aligned}$$

此类估计的**误差**为$f'(a)$减去该估计值：即精确值减去近似值，正如本系列中每个近似值的情况。当估计值偏小时，误差为正；当估计值偏大时，误差为负。
:::

前向差商本身就是差商，即从$a$到$a + h$的割线斜率。中心差商是从$a - h$到$a + h$的割线斜率，其区间以$a$为中心。它是前向差商与**后向差商** $\dfrac{f(a) - f(a - h)}{h}$的平均值，即用$-h$代替$h$的商。若$f$在$a$处可微，则前向差商与后向差商在$h \to 0$时均趋于$f'(a)$，它们的平均值亦然。

```check
same(((F(a + h) - F(a))/h + (F(a) - F(a - h))/h)/2, (F(a + h) - F(a - h))/(2*h))
same((F(a + (-h)) - F(a))/(-h), (F(a) - F(a - h))/h)
```

::: example $x^3$ 的两种差分
对于 $f(x) = x^3$，求出 $a$ 处的前向差和中心差及其误差。

由例 4.6 的展开可得 $(a + h)^3 = a^3 + 3a^2h + 3ah^2 + h^3$。再用 $-h$ 代替 $h$，得 $(a - h)^3 = a^3 - 3a^2h + 3ah^2 - h^3$。所以

$$\begin{aligned} \frac{(a + h)^3 - a^3}{h} &= 3a^2 + 3ah + h^2, \\ \frac{(a + h)^3 - (a - h)^3}{2h} &= \frac{6a^2h + 2h^3}{2h} \\ &= 3a^2 + h^2. \end{aligned}$$

由于$f'(a) = 3a^2$，误差，即$f'(a)$减去估计值，恰好是$-3ah - h^2$和$-h^2$。在$a = 1$处，当$h = 0.1$时，前向差分为3.31，中心差分为3.01；当$h = 0.01$时，它们分别为3.0301和3.0001。两个估计值都过大，因此两个误差均为负值。$h$的十分之一削减使前向误差大约缩小十倍，而中心误差缩小百倍。在中心差分中，不随$h$改变符号的项$3ah^2$相互抵消：这就是中心化的优势所在。

```check
steps((a + h)**3, a**3 + 3*a**2*h + 3*a*h**2 + h**3); same(expand((a - h)**3), a**3 - 3*a**2*h + 3*a*h**2 - h**3)
same(cancel(((a + h)**3 - a**3)/h), 3*a**2 + 3*a*h + h**2)
steps(((a + h)**3 - (a - h)**3)/(2*h), (6*a**2*h + 2*h**3)/(2*h), 3*a**2 + h**2)
same(diff(x**3, x).subs(x, a), 3*a**2)
same(3*a**2 - (3*a**2 + 3*a*h + h**2), -3*a*h - h**2); same(3*a**2 - (3*a**2 + h**2), -h**2)   # error = f'(a) - estimate
fw_ = lambda hv: 3 + 3*hv + hv**2; cw_ = lambda hv: 3 + hv**2
same(fw_(Rational(1, 10)), Rational(331, 100)); same(cw_(Rational(1, 10)), Rational(301, 100))
same(fw_(Rational(1, 100)), Rational(30301, 10000)); same(cw_(Rational(1, 100)), Rational(30001, 10000))
holds(all(3 - est_ < 0 for est_ in (fw_(Rational(1, 10)), cw_(Rational(1, 10)), fw_(Rational(1, 100)), cw_(Rational(1, 100)))))   # too large: negative errors
```
:::

这种模式适用于其他函数。表格显示了 $\sqrt x$ 在 $a = 4$ 处的两个误差，其中 $f'(4) = \tfrac14$（例 4.4）精确计算：

```valuetable
h = 0.1, 0.01, 0.001, 0.0001
$\tfrac14 - \text{forward}$ = 1/4 - (sqrt(4 + h) - 2)/h
$\tfrac14 - \text{central}$ = 1/4 - (sqrt(4 + h) - sqrt(4 - h))/(2*h)
digits = 4
---
h | \tfrac14 - \text{forward} | \tfrac14 - \text{central}
0.1 | 0.001543 | -1.954\times10^{-5}
0.01 | 0.0001561 | -1.953\times10^{-7}
0.001 | 1.562\times10^{-5} | -1.953\times10^{-9}
0.0001 | 1.562\times10^{-6} | -1.953\times10^{-11}
```

每一行将 $h$ 除以 10；向前误差缩小为原来的 1/10，中心误差缩小为原来的 1/100。符号不同：此处向前差分太小，而中心差分太大。

中心差分也是在等时间间隔测量数据时的自然选择：每个内部时间点的估计值使用其两侧的测量值。并且 [练习 1.11](module_01_ZH.html#ex-1-11) 显示，对于一个二次函数，例如下落球的 $s(t) = 4.9t^2$，中心差分在每个 $h$ 处都是精确的。

::: compute 从测量中得到的速度
假设你只通过第 1.3 节中每隔 0.5 秒测量的位置表知道下落球。中心差分用于估计内部时间点的速度；NumPy 的 `np.gradient` 计算相同的中心差分，两端使用向前和向后差分：

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

`s[2:] - s[:-2]` 从每个位置减去它前面两个位置的值。中心差分是精确的，正如练习 1.11 预测的那样。两端的估计值 2.45 和 26.95 m/s 各自偏离了 2.45 m/s。它们是模块 2 中的单边商 $9.8a + 4.9h$，其中 $h = 0.5$ 在 $t = 0$，而 $h = -0.5$ 在 $t = 3$，因此它们的误差是 $9.8a - (9.8a + 4.9h) = -4.9h$：起始端为 $-2.45$ m/s，末端为 $2.45$ m/s。
:::

```check
same(Rational(98, 10)*0 + Rational(49, 10)*Rational(1, 2), Rational(245, 100))
same((s49.subs(t, 3) - s49.subs(t, Rational(5, 2)))/Rational(1, 2), Rational(2695, 100)); same(Rational(294, 10) - Rational(2695, 100), Rational(245, 100))
same(Rational(98, 10)*a - (Rational(98, 10)*a + Rational(49, 10)*h), -Rational(49, 10)*h)
same((Rational(98, 10)*3 + Rational(49, 10)*(-Rational(1, 2))), Rational(2695, 100))          # the end value: the quotient with h = -0.5 at t = 3
same([-Rational(49, 10)*hv_ for hv_ in (Rational(1, 2), -Rational(1, 2))], [-Rational(245, 100), Rational(245, 100)])
same(0 - Rational(245, 100), -Rational(245, 100))                                            # error at t = 0: exact 0 minus 2.45
same((s49.subs(t, Rational(3, 2)) - s49.subs(t, Rational(1, 2)))/1, Rational(98, 10))
```

### 截断误差 {#truncation}

当运算精确时剩余的误差来自于在步骤 $h > 0$ 停止而不是趋向于极限；这种误差称为 **截断误差**。为了比较此类误差，使用模块 3 中的大 O 记号，现在用 $h \to 0$ 表示，而不是用于大输入的情况。

::: definition Big-O 作为 $h \to 0$
一个误差 $E(h)$ 被称为 $O(h^p)$ 为 $h \to 0$，读作“h 的 p 次方的大 O”，如果存在常数 $C$ 和 $\delta > 0$ 使得 $\abs{E(h)} \le C\abs{h}^p$，当 $0 < \abs{h} < \delta$ 时。
:::

对于$x^3$在$a$处，前向误差$-3ah - h^2$为$O(h)$，因为对于$0 < h < 1$，$h^2 \le h$以及如此$\abs{3ah + h^2} \le (3\abs{a} + 1)h$；中心误差$-h^2$为$O(h^2)$。误差为$O(h^p)$且无更优的方法具有**阶**$p$：前向差分具有1阶，中心差分具有2阶。减半$h$大致将1阶误差减半，将2阶误差减为四分之一。

```check
hq = symbols('h', positive=True)
same(3*a**2 - (3*a**2 + 3*a*hq + hq**2), -3*a*hq - hq**2); same(Abs(-3*a*hq - hq**2), Abs(3*a*hq + hq**2))
same(expand((3*Abs(a) + 1)*hq - (3*Abs(a)*hq + hq**2)), hq*(1 - hq))
holds(Abs(3*a*hq + hq**2).subs({a: -2, hq: Rational(1, 2)}) <= ((3*Abs(a) + 1)*hq).subs({a: -2, hq: Rational(1, 2)}))
same((h/2)**2/h**2, Rational(1, 4))
```

这并不特指 $x^3$：

::: keyidea
如果 $f''$ 在 $a$ 附近连续，则前向差分的误差约为 $-\tfrac{h}{2}f''(a)$，即 $O(h)$。如果 $f'''$ 在 $a$ 附近连续，则中心差分的误差约为 $-\tfrac{h^2}{6}f'''(a)$，即 $O(h^2)$。模块 15 用泰勒定理证明了这两点。
:::

对于 $x^3$，带入 $f''(a) = 6a$ 和 $f'''(a) = 6$，可得 $-3ah$ 和 $-h^2$，即例 4.11 中误差的主导部分。对于 $\sqrt x$ 在 4 处，其中 $f''(4) = -\tfrac{1}{32}$ 和 $f'''(4) = \tfrac{3}{256}$（根据分数指数幂的幂法则，模块 6 证明了这一点），它们预测 $\tfrac{h}{64}$ 和 $-\tfrac{h^2}{512}$；对于 $h = 0.1$，即 $0.00156$ 和 $-0.0000195$，接近上表中的第一行。

```check
same(diff(x**3, x, 2).subs(x, a), 6*a); same(diff(x**3, x, 3), 6)
same(-diff(x**3, x, 2).subs(x, a)*h/2, -3*a*h); same(-diff(x**3, x, 3)*h**2/6, -h**2)              # -(h/2) f''(a), -(h^2/6) f'''(a)
same(diff(sqrt(x), x, 2).subs(x, 4), -Rational(1, 32)); same(diff(sqrt(x), x, 3).subs(x, 4), Rational(3, 256))
same(-diff(sqrt(x), x, 2).subs(x, 4)*h/2, h/64); same(-diff(sqrt(x), x, 3).subs(x, 4)*h**2/6, -h**2/512)
rounds(Rational(1, 640), '0.00156'); rounds(-Rational(1, 51200), '-0.0000195')
err_fw4 = Rational(1, 4) - (sqrt(Rational(41, 10)) - 2)/Rational(1, 10)                          # the table's first row
err_ce4 = Rational(1, 4) - (sqrt(Rational(41, 10)) - sqrt(Rational(39, 10)))/Rational(2, 10)
holds(Abs(err_fw4 - Rational(1, 640)) < Rational(2, 10**5)); holds(Abs(err_ce4 + Rational(1, 51200)) < Rational(1, 10**7))
holds(err_fw4 > 0); holds(err_ce4 < 0)                                                              # forward too small, central too large
```

### 四舍五入误差与最佳步长 {#rounding}

在纸上，越小的 $h$ 越好。但在计算机上则不然。浮点数（[第 1.7 节 ](module_01_ZH.html#first-session)）大约携带 16 位有效数字：计算机能够存储的 1 与下一个更大的数之间的差距是 **机器精度**。

$$\varepsilon = 2^{-52} \approx 2.2 \times 10^{-16},$$

和一个计算值 $f$ 可能相差几个 $\varepsilon\abs{f(a)}$ 单位。在前向差分中，当 $h$ 很小时，$f(a + h)$ 和 $f(a)$ 几乎相等，因此它们的差值只保留它们不同的几位数字：这种现象称为消去，如模块 2 所示。除以小的 $h$ 会放大舍入后剩余的部分。商的误差中由舍入引起的部分，其 **舍入误差**，可以是正负任意符号；其大小约为 $\varepsilon\abs{f(a)}/h$，并且随着 $h$ 变小而增大。

```check
rounds(Integer(2)**-52, '2.2e-16'); same(Integer(2)**-52, Rational(1, 4503599627370496))
```

因此总误差有两部分，$h$ 减小时，这两部分的变化趋势相反。对于 $x^3$ 在 1 处的前向差分，此时 $\abs{f(1)} = 1$，总误差的绝对值大致不超过

$$3h + \frac{\varepsilon}{h}.$$

第一部分，截断误差的大小，当 $h$ 较大时较大；第二部分，舍入误差的大小，当 $h$ 较小时较大。

::: compute 舍入误差实例
Python 的浮点数是上述描述的 16 位数字。机器 epsilon 及其含义：

```python
import sys
print(sys.float_info.epsilon)
print(1.0 + 1e-16 == 1.0, 1.0 + 1e-15 == 1.0)
```

```output
2.220446049250313e-16
True False
```

1 加上 $10^{-16}$ 后仍舍入为 1。来看看 $f(x) = x^3$ 在 $a = 1$ 处的两种差分，其中 $f'(1) = 3$。当 $h$ 从 $10^{-1}$ 缩小到 $10^{-15}$ 时，误差（精确值减估计值）如下：

```python
def f(x):
    return x**3

a, exact = 1.0, 3.0
print(f"{'h':>7}  {'forward error':>13}  {'central error':>13}")
for k in range(1, 16):
    h = 10.0**(-k)
    forward = (f(a + h) - f(a))/h
    central = (f(a + h) - f(a - h))/(2*h)
    print(f"{h:7.0e}  {exact - forward:13.2e}  {exact - central:13.2e}")
```

```output
      h  forward error  central error
  1e-01      -3.10e-01      -1.00e-02
  1e-02      -3.01e-02      -1.00e-04
  1e-03      -3.00e-03      -1.00e-06
  1e-04      -3.00e-04      -1.00e-08
  1e-05      -3.00e-05      -9.74e-11
  1e-06      -3.00e-06       8.03e-11
  1e-07      -3.02e-07      -8.63e-11
  1e-08      -3.97e-09       7.13e-09
  1e-09      -2.48e-07      -8.17e-08
  1e-10      -2.48e-07      -2.48e-07
  1e-11      -2.48e-07      -2.48e-07
  1e-12      -2.67e-04      -1.00e-04
  1e-13       2.40e-03       7.32e-04
  1e-14       2.40e-03       2.40e-03
  1e-15      -3.31e-01      -1.64e-01
```

读列。在前几行中，两个误差都是负数，接近例 4.11 中的截断误差 $-3h - h^2$ 和 $-h^2$：两个估计值都太大。前向误差的大小每行缩小十倍，正如 $3h$ 所预测的，直到 $h = 10^{-7}$ 时约等于 $-3 \times 10^{-7}$。在 $h = 10^{-8}$ 处，它更小，约等于 $-4 \times 10^{-9}$，但这是偶然的：此时截断误差 $-3h - h^2 \approx -3.0 \times 10^{-8}$ 和舍入误差，约等于 $+2.6 \times 10^{-8}$，几乎相互抵消。对于更小的 $h$，舍入误差占主导地位，误差又开始增大，正负都有可能。中心误差每行缩小一百倍，直到 $h = 10^{-5}$ 时约等于 $10^{-10}$，之后保持近似大小直到 $h = 10^{-7}$，然后又开始增大。在 $h = 10^{-15}$ 处，两个估计值在小数点后第一位都出现了错误。
:::

```check
err_f = lambda hv: 3.0 - ((1.0 + hv)**3 - 1.0)/hv                            # the table above: exact minus estimate,
err_c = lambda hv: 3.0 - ((1.0 + hv)**3 - (1.0 - hv)**3)/(2*hv)               # in floating point
fwd_f = lambda hv: abs(err_f(hv)); cen_f = lambda hv: abs(err_c(hv))           # their sizes
for k_ in range(1, 5):                                                         # first rows: negative, close to -3h - h^2 and -h^2
    holds(err_f(10.0**-k_) < 0); holds(err_c(10.0**-k_) < 0)
    near(err_f(10.0**-k_)/(-(3*10.0**-k_ + 10.0**(-2*k_))), 1, 1e-3); near(err_c(10.0**-k_)/(-10.0**(-2*k_)), 1, 1e-3)
rounds(err_f(1e-8), '-4e-9'); holds(fwd_f(1e-8) < min(fwd_f(10.0**-k_) for k_ in range(1, 16) if k_ != 8))
for k_ in range(1, 8):
    holds(Rational(8, 100) < fwd_f(10.0**-k_)/10.0**-k_/3 < 2)              # about 3h in size: tenfold per row
rounds(err_f(1e-7), '-3e-7'); holds(fwd_f(1e-8) < Rational(3, 10**8)/5)      # at 1e-8 far below 3h = 3e-8 in size
tr8 = -(3*Rational(1, 10**8) + Rational(1, 10**16)); rounds(tr8, '-3.0e-8')    # the truncation error at 1e-8
rnd8 = err_f(1e-8) - tr8; rounds(rnd8, '2.6e-8'); holds(rnd8 > 0)            # the rounding error: opposite sign, about as large
holds(err_f(1e-9) < 0); holds(err_f(1e-13) > 0); holds(err_c(1e-6) > 0)       # rounding-dominated rows: either sign
for k_ in range(1, 5):
    near(cen_f(10.0**-k_)/10.0**(-2*k_), 1, 1e-3)                           # h^2: a hundredfold per row
for k_ in (5, 6, 7):
    rounds(cen_f(10.0**-k_), '1e-10')
holds(cen_f(1e-8) > 10*cen_f(1e-7)); holds(fwd_f(1e-9) > 10*fwd_f(1e-8))
holds(Abs(((1.0 + 1e-15)**3 - 1.0)/1e-15 - 3.0) > 0.1); holds(Abs(((1.0 + 1e-15)**3 - (1.0 - 1e-15)**3)/2e-15 - 3.0) > 0.1)
same(1.0 + 1e-16 == 1.0, True); same(1.0 + 1e-15 == 1.0, False)
```

图4.5 绘制了在481个$h$值下相同误差的大小。在对数坐标轴上，幂$Ch^p$表现为斜率为$p$的直线，因为$\log\big(Ch^p\big) = \log C + p\log h$：截断误差的大小是斜率为1和2的直线，而舍入误差的大小则沿$\varepsilon/h$形成一条不规则的带，其斜率为$-1$。

::: figure id=fig-04-5
在浮点运算中，对$f(x) = x^3$在$a = 1$处的向前（蓝色）和中心（橙色）差分，在$10^{-16}$与1之间执行481步$h$计算得到的误差大小，采用对数尺度。右侧截断误差占主导，沿虚线$3h$和$h^2$。左侧舍入误差占主导，呈锯齿状且接近$\varepsilon/h$（灰色虚线）。点线标记最佳步长，向前差分约为$10^{-8}$，中心差分约为$5 \times 10^{-6}$。
:::

最佳步长出现在两类误差相互平衡之处。对于前向差分，当$3h + \varepsilon/h$的两部分相等时其界最小（习题4.12证明了这一点），在$h = \sqrt{\varepsilon/3} \approx 9 \times 10^{-9}$处，其值约为$2\sqrt{3\varepsilon} \approx 5 \times 10^{-8}$。对于中心差分，误差大小至多约为$h^2 + \varepsilon/h$，在$h = (\varepsilon/2)^{1/3} \approx 5 \times 10^{-6}$处最小（模块8展示了如何找到此类极小值），其值约为$7 \times 10^{-11}$。表格相符：其最小误差的大小位于那些步长附近。中心差分的结果，约为$10^{-10}$，与估计值吻合；前向差分的结果，在$h = 10^{-8}$处为$-4 \times 10^{-9}$，得益于幸运的抵消，其表现更优（习题4.12考察了最佳步长附近的行）。

```check
eps_ = Integer(2)**-52
rounds(sqrt(eps_/3), '9e-9'); rounds(2*sqrt(3*eps_), '5e-8'); rounds(sqrt(eps_/3), '1e-8')
hstar = (eps_/2)**Rational(1, 3)
rounds(hstar, '5e-6'); rounds(hstar**2 + eps_/hstar, '7e-11')
same(diff(h**2 + eps_/h, h).subs(h, hstar), 0); holds(diff(h**2 + eps_/h, h, 2).subs(h, hstar) > 0)
same(3*sqrt(eps_/3), eps_/sqrt(eps_/3))
holds(fwd_f(1e-8) < 2*sqrt(3*eps_))                                          # the table's 4e-9 is below the estimate 5e-8
```

::: keyidea
16位浮点数的一个经验法则：前向差分使用 $h \approx 10^{-8}$ 时，大约能获得8位正确数字；中心差分使用 $h \approx 10^{-5}$ 时，大约能获得10位正确数字。使 $h$ 更小，结果反而变差，而不是变好。当 $a$ 远离1时，应使用 $h = 10^{-5}(1 + \abs{a})$ 来缩放步长，如第4.2节中的小部件所用的那样，使用中心差分来计算你输入的函数。
:::

::: pitfall
"误差越小 $h$，导数越准确。" 精确算术中成立，浮点运算中不成立。对于 $h = 10^{-15}$，在 1 处的前向差分 $x^3$ 的误差约为 0.33，出现在第一位小数；对于 $h = 10^{-16}$，$1 + h$ 舍入为 1，前向差分为 0。按经验法则选择 $h$，或避免该问题：SymPy 可进行精确求导，自动微分（模块 5）可计算程序的导数，且无任何 $h$。

```check
rounds(abs(((1.0 + 1e-15)**3 - 1.0)/1e-15 - 3.0), '0.33'); same(((1.0 + 1e-16)**3 - 1.0)/1e-16, 0)
```
:::

## 你所学到的内容 {#summary}

- 运动物体的速度和图象上切线的斜率都是差商的极限。这个极限称为导数，$f'(a) = \lim_{h\to0}\dfrac{f(a + h) - f(a)}{h} = \lim_{x\to a}\dfrac{f(x) - f(a)}{x - a}$。
- 在 $(a, f(a))$ 处的切线是 $y = f(a) + f'(a)(x - a)$；放大来看，可导函数的图象看起来就是这样。导数的单位是 $f$ 每 $x$ 单位。
- 导数是一个函数 $f'$，在 $x$ 处的函数值是 $f$ 在 $x$ 处的斜率；它写作 $f'(x)$、$y'$、$\dfrac{dy}{dx}$、$\dfrac{d}{dx}f(x)$ 或 $Df(x)$。
- 一个函数在拐点、尖点、垂直切线或间断点处没有导数，也不在差商持续震荡的地方有导数。可导意味着连续；连续并不意味着可导（$\abs{x}$ 在 0 处）。
- $\dfrac{d}{dx}(c) = 0$、$\dfrac{d}{dx}\big(x^n\big) = nx^{n-1}$ 对于正整数 $n$、$(cf)' = cf'$ 和 $(f \pm g)' = f' \pm g'$：多项式逐项求导。
- 高阶导数 $f''$、$f'''$、$f^{(n)}$。沿直线运动时，速度 $v = s'$，加速度 $a = s''$ 和急动度 $j = s'''$；当 $v$ 和 $a$ 符号相同时，物体加速。
- 数值上，前向差分的截断误差为 $O(h)$，中心差分的截断误差为 $O(h^2)$。舍入误差随 $\varepsilon/h$ 增长，因此在浮点运算中，最佳步长约为 $10^{-8}$ 和 $10^{-5}$，更小的步长会使情况恶化。
- SymPy：`sp.diff(f, x)`、`sp.diff(f, x, 2)` 和 `sp.limit(q, h, 0, '+-')` 用于定义；一个关于 $f'$ 的公式在 $f$ 不可导的点上说明不了什么。

## 练习 {#exercises}

:::: exercise 从定义出发的导数 {#ex-4-1} ★
- (a) 使用定义 $f'(a) = \lim_{h\to0}\dfrac{f(a + h) - f(a)}{h}$ 来求 $f'(-1)$ 在 $f(x) = 3x^2 - x$ 处的值，以及在 $x = -1$ 处的切线方程。
- (b) 使用形式 $\lim_{x\to a}\dfrac{g(x) - g(a)}{x - a}$ 来求 $g'(3)$ 在 $g(x) = x^2 - 4x$ 处的值。

::: solution
**(a)** 首先 $f(-1) = 3 + 1 = 4$。将 $-1 + h$ 代入，用括号括起来，并展开，用 $(-1 + h)^2 = 1 - 2h + h^2$：

$$\begin{aligned} &f(-1 + h) \\ &\quad= 3(-1 + h)^2 - (-1 + h) \\ &\quad= 3(1 - 2h + h^2) + 1 - h \\ &\quad= 3 - 6h + 3h^2 + 1 - h \\ &\quad= 4 - 7h + 3h^2. \end{aligned}$$

减去 $f(-1) = 4$： $f(-1 + h) - f(-1) = -7h + 3h^2$。因此

$$\begin{aligned} f'(-1) &= \lim_{h\to0}\frac{-7h + 3h^2}{h} \\ &= \lim_{h\to0}\,(-7 + 3h) = -7. \end{aligned}$$

切线方程为 $y = 4 - 7(x + 1)$，即 $y = -7x - 3$。当 $x = -1$ 时，得到 $7 - 3 = 4$。常见错误是漏掉 $-x$ 中 $-1 + h$ 外的括号，这会得到 $-1 + h$，而正确结果是 $+1 - h$。

**(b)** $g(3) = 9 - 12 = -3$，因此 $g(x) - g(3) = x^2 - 4x + 3 = (x - 1)(x - 3)$。消去因子 $x - 3$（允许这样做，因为 $x \ne 3$ 在极限内）：

$$\begin{aligned} g'(3) &= \lim_{x\to3}\frac{(x - 1)(x - 3)}{x - 3} \\ &= \lim_{x\to3}\,(x - 1) = 2. \end{aligned}$$

```check
fe1 = 3*x**2 - x
same(fe1.subs(x, -1), 4)
same(expand((-1 + h)**2), 1 - 2*h + h**2)
steps(fe1.subs(x, -1 + h), 3*(1 - 2*h + h**2) + 1 - h, 3 - 6*h + 3*h**2 + 1 - h, 4 - 7*h + 3*h**2)
same(fe1.subs(x, -1 + h) - fe1.subs(x, -1), -7*h + 3*h**2)
steps(Limit((-7*h + 3*h**2)/h, h, 0, '+-'), Limit(-7 + 3*h, h, 0, '+-'), -7)
same((fe1.subs(x, -1 + h) - 4)/h, -7 + 3*h); limit_is((fe1.subs(x, -1 + h) - fe1.subs(x, -1))/h, h, 0, -7)
same(expand(4 - 7*(x + 1)), -7*x - 3); same((-7*x - 3).subs(x, -1), 4)
ge1 = x**2 - 4*x
same(ge1.subs(x, 3), -3); same(factor(ge1 - ge1.subs(x, 3)), (x - 1)*(x - 3))
limit_is((ge1 - ge1.subs(x, 3))/(x - 3), x, 3, 2); same(diff(ge1, x).subs(x, 3), 2)
```
:::
::::

:::: exercise 按规则对多项式求导 {#ex-4-2} ★
求导：

- (a) $f(x) = 7x^4 - 2x^3 + x - 9$
- (b) $g(x) = (2x - 1)(x^2 + 3)$
- (c) $k(x) = \dfrac{x^3 - 4x}{x}$，用于 $x \ne 0$
- (d) $s(t) = \pi t^2 + \pi^2$

::: solution
**(a)** 逐项进行： $f'(x) = 7 \cdot 4x^3 - 2 \cdot 3x^2 + 1 - 0 = 28x^3 - 6x^2 + 1$。

**(b)** 先展开： $g(x) = 2x^3 + 6x - x^2 - 3 = 2x^3 - x^2 + 6x - 3$，因此 $g'(x) = 6x^2 - 2x + 6$。将因子的导数相乘 $2 \cdot 2x = 4x$ 是错误的：乘积的导数不是导数的乘积（模块 5 给出了正确的规则）。

**(c)** 对于 $x \ne 0$，将每一项除以 $x$： $k(x) = x^2 - 4$。因此 $k'(x) = 2x$，对于 $x \ne 0$： $k$ 在 0 处未定义，因此 $k'$ 也未定义。

**(d)** $\pi$ 和 $\pi^2$ 是常数： $s'(t) = 2\pi t$，而常数项 $\pi^2$ 贡献 0。

```check
same(diff(7*x**4 - 2*x**3 + x - 9, x), 28*x**3 - 6*x**2 + 1)
same(expand((2*x - 1)*(x**2 + 3)), 2*x**3 - x**2 + 6*x - 3); same(diff((2*x - 1)*(x**2 + 3), x), 6*x**2 - 2*x + 6)
holds(Ne((6*x**2 - 2*x + 6).subs(x, 1), (2*2*x).subs(x, 1)))
same(cancel((x**3 - 4*x)/x), x**2 - 4); same(diff((x**3 - 4*x)/x, x), 2*x)
same(diff(pi*t**2 + pi**2, t), 2*pi*t)
```
:::
::::

:::: exercise 一杯正在冷却的茶 {#ex-4-3} ★
假设一杯茶被倒入时温度为 $t = 0$，经过 $t$ 分钟后的温度为 $T(t)$ 摄氏度，其中 $T(10) = 62$ 和 $T'(10) = -1.5$。 （这些数字是虚构的。）

- (a) $T'(10)$ 的单位是什么？ $T'(10) = -1.5$ 用文字怎么说？
- (b) 使用 $t = 10$ 处的切线来估计 $t = 10.5$ 和 $t = 12$ 处的温度。
- (c)  $\left.\dfrac{dT}{dt}\right|_{t=10} = -1.5$ 与 $T'(10) = -1.5$ 是否相同？$\dfrac{d}{dt}\big(T(10)\big) = -1.5$ 是否相同？

::: solution
**(a)** 摄氏度每分钟。倒入后十分钟，茶的冷却速率是每分钟 1.5 摄氏度：温度在下降，负号表示这一点。

**(b)** 切线是 $T \approx 62 - 1.5(t - 10)$。在 $t = 10.5$ 时，它给出 $62 - 0.75 = 61.25$ °C，在 $t = 12$ 时，它给出 $62 - 3 = 59$ °C。第二个估计值不太可靠：切线只在 $t = 10$ 附近跟随曲线，茶在接近室温时冷却得更慢。

**(c)** 是的： $\left.\dfrac{dT}{dt}\right|_{t=10} = -1.5$ 在莱布尼茨记号中是 $T'(10) = -1.5$。否： $\dfrac{d}{dt}\big(T(10)\big)$ 是常数 $T(10) = 62$ 的导数，因此是 0，而不是 $-1.5$。

```check
same(62 - Rational(15, 10)*(Rational(105, 10) - 10), Rational(6125, 100)); same(62 - Rational(15, 10)*(12 - 10), 59)
same(diff(Integer(62), t), 0)
```
:::
::::

:::: exercise 它在哪些点不可导？ {#ex-4-4} ★
对每个函数，找出它不可导的点，并说明每个点是拐点、尖点、垂直切线还是间断点。存在单侧导数时给出。

- (a) $f(x) = \abs{x - 2}$
- (b) $g(x) = (x + 1)^{2/3}$，使用实数立方根
- (c) $k(x) = x^2$ 对于 $x < 1$，以及 $k(x) = 2x$ 对于 $x \ge 1$

::: solution
**(a)** 在 2 以外任一点附近，$f$ 都等于 $x - 2$ 或 $2 - x$，因此可微，导数为 1 或 $-1$。在 2 处，$f(2) = 0$，差商为 $\dfrac{\abs{h}}{h}$。与 $\abs{x}$ 在 0 处的情形一样，$f'_+(2) = 1$，而 $f'_-(2) = -1$。于是图像在 $x = 2$ 处有尖角。

**(b)** 在$-1$处，$g(-1) = 0$且商为$\dfrac{(h^2)^{1/3}}{h} = h^{-1/3}$，当$h \to 0^+$时它趋于$\infty$，当$h \to 0^-$时它趋于$-\infty$。在$x = -1$处有一个尖点，$x^{2/3}$的尖点向左移动了1；此处不存在单侧导数。在其他地方$g$是可微的：模块5的链式法则和模块6中分数指数的幂法则给出$x \ne -1$的$g'(x) = \tfrac23(x + 1)^{-1/3}$。

**(c)** $k(1) = 2$，但当 $x \to 1^-$ 时，$k(x) = x^2 \to 1$。因此 $k$ 在 1 处不连续，由定理 4.1 它在该处也不可导。这里出现的是跳跃间断。取 $k(1) = 2$，$h > 0$ 与 $h < 0$ 的差商分别为

$$\begin{aligned} \frac{2(1 + h) - 2}{h} &= 2, \\ \frac{(1 + h)^2 - 2}{h} &= \frac{-1 + 2h + h^2}{h}. \end{aligned}$$

所以 $k'_+(1) = 2$，虽然左边的商随着 $h \to 0^-$ 趋向于无穷大（其分子趋向于 $-1$），并且不存在左边导数。在远离 1 的地方，$k$ 在每个点附近都是多项式，因此可导。

```check
hp = symbols('h', positive=True); hn = symbols('h', negative=True)
same(Abs((2 + hp) - 2)/hp, 1); same(Abs((2 + hn) - 2)/hn, -1)
limit_is(real_root(h**2, 3)/h, h, 0, oo, '+'); limit_is(real_root(h**2, 3)/h, h, 0, -oo, '-')
same(real_root(((-1 + hp) + 1)**2, 3)/hp, hp**Rational(-1, 3))
up_ = symbols('u', positive=True); un_ = symbols('u', negative=True)            # u = x + 1, on each side of -1
same(diff(real_root(up_**2, 3), up_), Rational(2, 3)*up_**Rational(-1, 3)); same(diff(real_root(un_**2, 3), un_), Rational(2, 3)/real_root(un_, 3))
same((2*(1 + h) - 2)/h, 2); same(expand((1 + h)**2 - 2), -1 + 2*h + h**2)
limit_is(((1 + h)**2 - 2)/h, h, 0, oo, '-'); limit_is(x**2, x, 1, 1, '-')
```
:::
::::

:::: exercise 切线与给定斜率 {#ex-4-5} ★★
设 $f(x) = x^3 - 3x^2$。

- (a) 找出切线与直线 $y = 9x + 1$ 平行的点，以及这些切线的方程。
- (b) 是否存在一点，使得切线斜率为 $-4$？

::: solution
**(a)** 平行线有相等的斜率，所以解 $f'(x) = 9$. By the rules $f'(x) = 3x^2 - 6x$, and

$$\begin{aligned} &3x^2 - 6x = 9 \\ &\iff x^2 - 2x - 3 = 0 \\ &\iff (x - 3)(x + 1) = 0, \end{aligned}$$

所以 $x = 3$ 或 $x = -1$。由于 $f(3) = 27 - 27 = 0$，在 $(3, 0)$ 处的切线为 $y = 9(x - 3)$，即 $y = 9x - 27$。由于 $f(-1) = -1 - 3 = -4$，在 $(-1, -4)$ 处的切线为 $y = -4 + 9(x + 1)$，即 $y = 9x + 5$。

**(b)** 完成平方： $f'(x) = 3(x^2 - 2x) = 3(x - 1)^2 - 3 \ge -3$ 对于每一个 $x$。 每一条切线的斜率至少为 $-3$，因此没有一条切线的斜率为 $-4$。 （方程 $3x^2 - 6x + 4 = 0$ 没有实数解：其判别式为 $36 - 48 < 0$。）

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

:::: exercise 从定义出发的导数函数 {#ex-4-6} ★★
设 $f(x) = \dfrac{1}{x + 1}$。

- (a) 使用定义来证明 $f'(x) = -\dfrac{1}{(x + 1)^2}$ 对于 $x \ne -1$。
- (b) 求在 $x = 1$ 处的切线。
- (c) 从公式解释为什么该图像的每一条切线都是向下倾斜的。

::: solution
**(a)** 设 $x \ne -1$。以 $(x + h + 1)(x + 1)$ 为公分母，将分式通分：

$$\begin{aligned} &f(x + h) - f(x) \\ &\quad= \frac{1}{x + h + 1} - \frac{1}{x + 1} \\ &\quad= \frac{(x + 1) - (x + h + 1)}{(x + h + 1)(x + 1)} \\ &\quad= \frac{-h}{(x + h + 1)(x + 1)}. \end{aligned}$$

除以 $h \ne 0$ 并令 $h \to 0$。由于 $x + 1 \ne 0$，可以直接代入：

$$\begin{aligned} f'(x) &= \lim_{h\to0}\frac{-1}{(x + h + 1)(x + 1)} \\ &= -\frac{1}{(x + 1)^2}. \end{aligned}$$

在 $x = -1$ 处，$f$ 无定义，故 $f'$ 也无定义。

**(b)** $f(1) = \tfrac12$ 和 $f'(1) = -\tfrac14$，因此切线是 $y = \tfrac12 - \tfrac14(x - 1)$，即 $y = \tfrac34 - \tfrac{x}{4}$。

**(c)** 对于 $x \ne -1$， $(x + 1)^2 > 0$，因此 $f'(x) = -\dfrac{1}{(x + 1)^2} < 0$：每条切线都有负斜率。

```check
fe6 = 1/(x + 1)
steps(fe6.subs(x, x + h) - fe6, ((x + 1) - (x + h + 1))/((x + h + 1)*(x + 1)), -h/((x + h + 1)*(x + 1)))
limit_is((fe6.subs(x, x + h) - fe6)/h, h, 0, -1/(x + 1)**2); same(diff(fe6, x), -1/(x + 1)**2)
same(fe6.subs(x, 1), Rational(1, 2)); same((-1/(x + 1)**2).subs(x, 1), -Rational(1, 4))
same(expand(Rational(1, 2) - Rational(1, 4)*(x - 1)), Rational(3, 4) - x/4)
```
:::
::::

:::: exercise 一个向上抛出的球 {#ex-4-7} ★★
假设你从离地面 1.5 米高处以 14.7 m/s 的速度垂直向上抛出一个球。如果忽略空气阻力，它在 $t$ 秒后的高度是 $y(t) = 1.5 + 14.7t - 4.9t^2$ 米，直到落地。

- (a) 找出它的速度和加速度，并说明它们的符号含义。
- (b) 球何时达到最高点？此时高度是多少？
- (c) 它何时落地？落地时的速度是多少？均保留两位小数。

::: solution
**(a)** $v(t) = y'(t) = 14.7 - 9.8t$ m/s 和 $a(t) = v'(t) = -9.8$ m/s²。高度向上测量，因此 $v > 0$ 表示上升， $v < 0$ 表示下降；恒定的负加速度是重力，向下拉。当球上升时， $v > 0$ 和 $a < 0$ 符号相反，因此速度减小；一旦下落，两者均为负，速度加快。

**(b)** 在顶部球停止上升且尚未开始下落： $v(t) = 0$，因此 $t = 14.7/9.8 = 1.5$ s。然后 $y(1.5) = 1.5 + 22.05 - 11.025 = 12.525$ m。

**(c)** 球落地时 $y(t) = 0$，即 $4.9t^2 - 14.7t - 1.5 = 0$。根据求根公式，

$$\begin{aligned} t &= \frac{14.7 \pm \sqrt{14.7^2 + 4 \cdot 4.9 \cdot 1.5}}{2 \cdot 4.9} \\ &= \frac{14.7 \pm \sqrt{245.49}}{9.8}. \end{aligned}$$

负号给出负时间，即投掷前，因此 $t = \dfrac{14.7 + \sqrt{245.49}}{9.8} \approx 3.10$ s。然后 $9.8t = 14.7 + \sqrt{245.49}$，因此 $v = 14.7 - 9.8t = -\sqrt{245.49} \approx -15.67$ m/s。球以约 15.67 m/s 落地，比投掷速度更快，因为它比手部释放点低 1.5 m：从顶部下落 12.525 m，比上升的 11.025 m 更远。

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
same(yb.subs(t, Rational(3, 2)) - yb.subs(t, 0), Rational(11025, 1000))    # it rises 11.025 m, then falls 12.525 m
```
:::
::::

:::: exercise 构造一个分段函数使其可导 {#ex-4-8} ★★
求常数 $b$ 和 $c$，使得

$$f(x) = \begin{cases} x^2 & \text{if } x \le 1, \\ bx + c & \text{if } x > 1 \end{cases}$$

在 $x = 1$ 处可导。

::: solution
需要两个条件。

**连续性。** 根据定理 4.1， $f$ 在 1 处必须连续。从左侧， $f(x) = x^2 \to 1 = f(1)$；从右侧， $f(x) = bx + c \to b + c$。因此 $b + c = 1$。

**单侧导数。** 用 $f(1) = 1$，左导数商为 $\dfrac{(1 + h)^2 - 1}{h} = 2 + h$，因此 $f'_-(1) = 2$。对于 $h > 0$，右导数商为

$$\begin{aligned} &\frac{b(1 + h) + c - 1}{h} \\ &\quad= \frac{(b + c - 1) + bh}{h} = b, \end{aligned}$$

使用 $b + c = 1$。因此 $f'_+(1) = b$，且当 $b = 2$ 时两者完全一致。然后 $c = 1 - b = -1$。

所以 $b = 2$ 和 $c = -1$。用这些值，1 处的两个单侧导数都是 2，因此 $f'(1) = 2$。直线 $y = 2x - 1$ 是 $y = x^2$ 在 $(1, 1)$ 处的切线：图像沿其自身的切线离开抛物线。如果 $b + c \ne 1$，右导数商包含项 $\dfrac{b + c - 1}{h}$，该项随着 $h \to 0^+$ 趋于无穷大：不存在右导数，且 $f$ 在 1 处不可导，正如定理 4.1 预测的那样，对于在该点不连续的函数。

```check
bb, cc = symbols('b c')
same(solve(Eq(bb + cc, 1), cc), [1 - bb])
same(((1 + h)**2 - 1)/h, 2 + h); limit_is(((1 + h)**2 - 1)/h, h, 0, 2, '-')
same(((bb*(1 + h) + (1 - bb)) - 1)/h, bb)
same(solve([Eq(bb + cc, 1), Eq(bb, 2)], [bb, cc]), {bb: 2, cc: -1})
same(((2*(1 + h) - 1) - 1)/h, 2)                                         # with b = 2, c = -1 the right-hand quotient is 2
same(expand(1 + 2*(x - 1)), 2*x - 1)
limit_is(((2*(1 + h) + 3) - 1)/h, h, 0, oo, '+')
```
:::
::::

:::: exercise 1/x 的前向差与中心差 {#ex-4-9} ★★
设 $f(x) = \dfrac1x$ 和 $a = 1$，使得 $f'(1) = -1$（例 4.4 的方法给出 $f'(a) = -1/a^2$）。

- (a) 证明，对于 $0 < h < 1$，前向差等于 $-\dfrac{1}{1 + h}$，中心差等于 $-\dfrac{1}{1 - h^2}$。
- (b) 计算两者及其误差，对于 $h = 0.1$ 和 $h = 0.01$，保留六位小数。
- (c) 在精确运算中，大致需要 $h$ 小到什么程度，才能使每个误差的大小小于 $10^{-6}$？

::: solution
**(a)** 前向差分：将两个项放在公共分母 $1 + h$ 上，

$$\begin{aligned} \frac{1}{1 + h} - 1 &= \frac{1 - (1 + h)}{1 + h} \\ &= \frac{-h}{1 + h}, \end{aligned}$$

并除以 $h$ 得到 $-\dfrac{1}{1 + h}$。 中心差分：将两个项放在公共分母 $(1 + h)(1 - h) = 1 - h^2$ 上，

$$\begin{aligned} &\frac{1}{1 + h} - \frac{1}{1 - h} \\ &\quad= \frac{(1 - h) - (1 + h)}{1 - h^2} \\ &\quad= \frac{-2h}{1 - h^2}, \end{aligned}$$

并除以 $2h$ 得到 $-\dfrac{1}{1 - h^2}$。

**(b)** 误差为 $f'(1) = -1$ 减去估计值：

$$\begin{aligned} -1 + \frac{1}{1 + h} &= -\frac{h}{1 + h}, \\[6pt] -1 + \frac{1}{1 - h^2} &= \frac{h^2}{1 - h^2}. \end{aligned}$$

在两个步骤中：

- $h = 0.1$：前向差分 $-0.909091$，误差 $-0.090909$；中心差分 $-1.010101$，误差 $0.010101$。
- $h = 0.01$：前向差分 $-0.990099$，误差 $-0.009901$；中心差分 $-1.000100$，误差 $0.000100$。

前向差分太大，中心差分太小，因此它们的误差符号相反。

**(c)** 误差的大小为

$$\begin{aligned} \frac{h}{1 + h} &< h, \\[6pt] \frac{h^2}{1 - h^2} &> h^2. \end{aligned}$$

前向误差的大小略小于 $h$，因此当 $h$ 接近 $10^{-6}$ 时，其大小会低于 $10^{-6}$；在 $h = 10^{-6}$ 处，它等于 $10^{-6}/(1 + 10^{-6}) < 10^{-6}$。中心误差略大于 $h^2$，因此 $h$ 在约 $10^{-3}$ 时就足够了： $h = 0.000999$ 给出约 $9.98 \times 10^{-7}$。中心差分达到相同精度时，步长可以大一千倍；在浮点运算中这一点很重要，因为较大的步长所受的舍入误差更少。

```check
same(cancel((1/x - 1/a)/(x - a)), -1/(a*x)); limit_is((1/x - 1/a)/(x - a), x, a, -1/a**2); same((-1/a**2).subs(a, 1), -1)
steps((1/(1 + h) - 1)/h, ((1 - (1 + h))/(1 + h))/h, -1/(1 + h))
steps(1/(1 + h) - 1/(1 - h), ((1 - h) - (1 + h))/(1 - h**2), -2*h/(1 - h**2)); same((-2*h/(1 - h**2))/(2*h), -1/(1 - h**2))
same(-1 - (-1/(1 + h)), -h/(1 + h)); same(-1 - (-1/(1 - h**2)), h**2/(1 - h**2))          # error = f'(1) - estimate
fwd9 = lambda hv: -1/(1 + hv); cen9 = lambda hv: -1/(1 - hv**2)
rounds(fwd9(Rational(1, 10)), '-0.909091'); rounds(-1 - fwd9(Rational(1, 10)), '-0.090909'); rounds(cen9(Rational(1, 10)), '-1.010101'); rounds(-1 - cen9(Rational(1, 10)), '0.010101')
rounds(fwd9(Rational(1, 100)), '-0.990099'); rounds(-1 - fwd9(Rational(1, 100)), '-0.009901'); rounds(cen9(Rational(1, 100)), '-1.000100'); rounds(-1 - cen9(Rational(1, 100)), '0.000100')
holds(all(fwd9(hv_) > -1 and cen9(hv_) < -1 for hv_ in (Rational(1, 10), Rational(1, 100))))   # forward too large, central too small
holds(Rational(1, 10**6)/(1 + Rational(1, 10**6)) < Rational(1, 10**6))
hh9 = Rational(999, 10**6)
holds(hh9**2/(1 - hh9**2) < Rational(1, 10**6)); rounds(hh9**2/(1 - hh9**2), '9.98e-7')
```
:::
::::

:::: exercise 幂法则的因式分解法 {#ex-4-10} ★★★
- (a) 证明对于每一个正整数 $n$，
  $$\begin{aligned} &x^n - a^n \\ &\quad= (x - a)\big(x^{n-1} + x^{n-2}a \\ &\qquad + \dots + xa^{n-2} + a^{n-1}\big). \end{aligned}$$
- (b) 利用 (a) 和定义的第二种形式 $f'(a) = \lim_{x\to a}\dfrac{f(x) - f(a)}{x - a}$，给出幂法则的另一种证明。

::: solution
**(a)** 展开右边。将长括号乘以 $x$ 得到

$$\begin{aligned} &x^n + x^{n-1}a + x^{n-2}a^2 \\ &\quad + \dots + xa^{n-1}, \end{aligned}$$

并将其乘以 $-a$ 得到

$$\begin{aligned} &-x^{n-1}a - x^{n-2}a^2 \\ &\quad - \dots - xa^{n-1} - a^n. \end{aligned}$$

每一项的第1行除了 $x^n$ 之外，都与第2行的一项相消，第2行除了 $-a^n$ 之外的每一项都与第1行的一项相消。剩下的为 $x^n - a^n$。（对于 $n = 1$，括号内是单项 1，恒等式为 $x - a = x - a$。）

**(b)** 对于 $x \ne a$，将 (a) 除以 $x - a$：

$$\begin{aligned} &\frac{x^n - a^n}{x - a} \\ &\quad= x^{n-1} + x^{n-2}a \\ &\qquad + \dots + xa^{n-2} + a^{n-1}. \end{aligned}$$

右边是一个以 $x$ 为变量的多项式，共有 $n$ 项。当 $x \to a$ 时，直接代入将每一项变为 $a^{n-1}$，因此极限为 $na^{n-1}$。因此 $\big(x^n\big)' = nx^{n-1}$ 在每一点 $a$ 处：再次应用幂法则，这次不需要二项式展开。

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

:::: exercise 起伏点在原点 {#ex-4-11} ★★★
设 $f(x) = x\sin\dfrac1x$ 和 $g(x) = x^2\sin\dfrac1x$ 为 $x \ne 0$，且 $f(0) = g(0) = 0$。

- (a) 证明 $f$ 在 0 处连续但不可导。
- (b) 证明 $g$ 在 0 处可导，导数为 $g'(0) = 0$。

（使用模块2中的夹逼定理。）

::: solution
**(a)** 对于 $x \ne 0$, $\abs{\sin(1/x)} \le 1$, 所以 $-\abs{x} \le x\sin\dfrac1x \le \abs{x}$. 两个边界都趋于 0, 所以根据夹逼定理 $\lim_{x\to0}f(x) = 0 = f(0)$: $f$ 在 0 处连续. 其在 0 处的差商是

$$\begin{aligned} \frac{f(h) - f(0)}{h} &= \frac{h\sin(1/h)}{h} \\ &= \sin\frac1h, \end{aligned}$$

这在 $h \to 0$ 时没有极限. 在 $h = \dfrac{1}{\pi/2 + 2k\pi}$ 时等于 1, 在 $h = \dfrac{1}{3\pi/2 + 2k\pi}$ 时等于 $-1$, 对于每个正整数 $k$; 两个序列 $h$ 都趋于 0. 如果极限 $L$ 要同时在 $\tfrac12$ 内接近 1 和 $-1$, 对于所有足够小的 $h$ 都不可能. 所以 $f'(0)$ 不存在: 从原点出发的割线斜率在 $-1$ 和 1 之间无限摆动.

**(b)** $g$ 在 0 处的差商是

$$\begin{aligned} \frac{g(h) - g(0)}{h} &= \frac{h^2\sin(1/h)}{h} \\ &= h\sin\frac1h, \end{aligned}$$

与 $-\abs{h} \le h\sin\dfrac1h \le \abs{h}$，因此根据夹逼定理趋于 0：$g'(0) = 0$。函数 $g$ 在 0 附近无限震荡，但震荡被 $y = x^2$ 和 $y = -x^2$ 所限制，两者在原点处都有水平切线 $y = 0$，$g$ 也是如此。

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

:::: exercise 最佳步长 {#ex-4-12} ★★★
第4.7节 限定了 $x^3$ 在 1 处的前向差分误差大小约为 $3h + \varepsilon/h$。更一般地，设 $E(h) = Ch + \dfrac{K}{h}$，其中 $C$ 和 $K$ 是正数常数。

- (a) 证明对每个 $h > 0$ 都有 $E(h) \ge 2\sqrt{CK}$，等号恰在 $h = \sqrt{K/C}$ 时成立。（展开 $\big(\sqrt{Ch} - \sqrt{K/h}\big)^2 \ge 0$。）
- (b) 因此，最佳步长是 $h^* = \sqrt{K/C}$，其中 $E$ 的两个部分相等。找出 $h^*$ 和 $E(h^*)$ 对于 $C = 3$ 和 $K = \varepsilon \approx 2.2 \times 10^{-16}$ 的值，并与第4.7节的表格进行比较。
- (c) 假设 $f$ 的值仅保留约8位有效数字，如同有噪声的测量值，因此 $K = 10^{-8}$。此时的最佳步长和 $E$ 的最小值是多少？

::: solution
**(a)** 当 $h > 0$ 时，两个平方根均有定义，且

$$\begin{aligned} &\Big(\sqrt{Ch} - \sqrt{K/h}\Big)^2 \\ &\quad= Ch - 2\sqrt{Ch \cdot K/h} + \frac{K}{h} \\ &\quad= Ch - 2\sqrt{CK} + \frac{K}{h}. \end{aligned}$$

平方永远不会为负，所以 $Ch + \dfrac{K}{h} \ge 2\sqrt{CK}$。等号成立当且仅当平方为 0，即当 $\sqrt{Ch} = \sqrt{K/h}$，这意味着 $Ch = K/h$，或 $h^2 = K/C$，或者（由于 $h > 0$） $h = \sqrt{K/C}$。在该点 $h$，两部分 $Ch$ 和 $K/h$ 相等。

**(b)** $h^* = \sqrt{\varepsilon/3} \approx 8.6 \times 10^{-9}$ 和 $E(h^*) = 2\sqrt{3\varepsilon} \approx 5.2 \times 10^{-8}$。第 4.7 节的表格在 $h = 10^{-8}$ 处，即最接近 $h^*$ 的步长，其前向误差最小，如预测。该处的误差，约 $-4 \times 10^{-9}$，其大小远小于模型的 $5.2 \times 10^{-8}$，因为舍入误差恰好与截断误差符号相反，抵消了大部分。在相邻步长 $10^{-7}$ 和 $10^{-9}$ 处的误差，约 $-3 \times 10^{-7}$ 和 $-2.5 \times 10^{-7}$，其大小与模型预测的（$3.0 \times 10^{-7}$ 和 $2.3 \times 10^{-7}$）一致。

**(c)** $h^* = \sqrt{10^{-8}/3} \approx 5.8 \times 10^{-5}$，和 $E(h^*) = 2\sqrt{3 \times 10^{-8}} \approx 3.5 \times 10^{-4}$。对于 8 位有效数字的值，前向差分仅提供约 4 位正确数字，且需要更大的步长。噪声数据给出粗糙的导数。

```check
Cp, Kp, hp_ = symbols('C K h', positive=True)
same(expand((sqrt(Cp*hp_) - sqrt(Kp/hp_))**2), Cp*hp_ - 2*sqrt(Cp*Kp) + Kp/hp_)
same((Cp*hp_ + Kp/hp_).subs(hp_, sqrt(Kp/Cp)), 2*sqrt(Cp*Kp)); same(solve(Eq(Cp*hp_, Kp/hp_), hp_), [sqrt(Kp/Cp)])
eps_ = Integer(2)**-52
rounds(sqrt(eps_/3), '8.6e-9'); rounds(2*sqrt(3*eps_), '5.2e-8')
E12 = lambda hv: 3*hv + eps_/hv
rounds(E12(Rational(1, 10**7)), '3.0e-7'); rounds(E12(Rational(1, 10**9)), '2.3e-7')
err_float = lambda hv: 3.0 - ((1.0 + hv)**3 - 1.0)/hv            # the table of Section 4.7: exact minus estimate, in floating point
fwd_float = lambda hv: abs(err_float(hv))
rounds(err_float(1e-8), '-4e-9'); rounds(err_float(1e-7), '-3e-7'); rounds(err_float(1e-9), '-2.5e-7')
holds(-err_float(1e-8) < Rational(52, 10)*Rational(1, 10**8)/10)    # much smaller in size than 5.2e-8
holds(fwd_float(1e-8) < min(fwd_float(10.0**-k_) for k_ in range(1, 16) if k_ != 8))
rounds(sqrt(Rational(1, 10**8)/3), '5.8e-5'); rounds(2*sqrt(3*Rational(1, 10**8)), '3.5e-4')
```
:::
::::

## 自测 {#quiz}

```quiz
? 对于 $f(x) = x^2$，哪个表达式是 $f'(3)$？
- [ ] $\dfrac{(3 + h)^2 - 9}{h}$
- [x] $\lim\limits_{h\to0}\dfrac{(3 + h)^2 - 9}{h}$
- [ ] $\lim\limits_{h\to0}\dfrac{(9 + h) - 9}{h}$
- [ ] $\lim\limits_{x\to3}\dfrac{x^2 - 9}{x + 3}$
> 导数是差商的极限：$\lim_{h\to0}\dfrac{(3 + h)^2 - 9}{h} = \lim_{h\to0}(6 + h) = 6$. 差商本身（无极限）是某一条割线的斜率，不是切线的斜率。$(9 + h)$ 替换 $f(3 + h)$ 为 $f(3) + h$，且该极限为 1，不是 6。最后一个表达式中 $x + 3$ 应为 $x - 3$；其极限为 0。

? 若 $f(2) = 5$ 和 $f'(2) = -3$ 成立，则函数 $f$ 在点 $x = 2$ 处的图像的切线为
- [ ] $y = -3x + 5$
- [ ] $y = 5x - 3$
- [x] $y = -3x + 11$
- [ ] $y = -3x - 1$
> 切线为 $y = f(2) + f'(2)(x - 2) = 5 - 3(x - 2) = -3x + 11$；在 $x = 2$ 处其值为 5，正如它应当的那样。 $y = -3x + 5$ 的斜率正确，但经过 $(0, 5)$ 而非 $(2, 5)$； $y = -3x - 1$ 来自 $5 - 3(x + 2)$，是符号错误； $y = 5x - 3$ 将斜率与函数值交换了。

? 下列函数中，哪一个在 0 处连续但不可导？
- [ ] $x^2$
- [ ] $H(x)$，等于 0 时 $x < 0$，等于 1 时 $x \ge 0$
- [ ] $x^3$
- [x] $\abs{x}$
> $\abs{x}$ 在 0 处连续，但其单侧导数分别为 $-1$ 和 1，因此它有一个拐点且无导数。 $x^2$ 和 $x^3$ 是多项式，各处均可导（两者在 0 处导数均为 0）。步 $H$ 在 0 处甚至不连续，因此根据定理 4.1，它在该点也不可导。

? $\dfrac{d}{dx}\big(5x^4 - 2x + 7\big)$ 是
- [x] $20x^3 - 2$
- [ ] $20x^4 - 2$
- [ ] $20x^3 - 2 + 7$
- [ ] $5x^3 - 2$
> 逐项求导： $5 \cdot 4x^3 - 2 \cdot 1 + 0 = 20x^3 - 2$。 $20x^4$ 忘记降低指数；保持 $+7$ 忘记常数导数为 0； $5x^3$ 降低指数但忘记将 4 带到前面。

? 若 $y = x^3$，则 $\left.\dfrac{dy}{dx}\right|_{x=2}$ 等于
- [ ] $8$
- [x] $12$
- [ ] $6$
- [ ] $0$
> 先求导，后代入： $\dfrac{dy}{dx} = 3x^2$，其在 $x = 2$ 处为 12。8 是 $y$ 的值，不是其导数的值；6 是 $3x$ 在 $x = 2$ 处的值，它忘记在 $3x^2$ 中保留平方；0 是先代入再对常数 8 求导所得。

? 在 $f$ 的图像在某点有水平切线时， $f'$ 的图像
- [x] 与 $x$ 轴相交
- [ ] 有水平切线
- [ ] 达到最高点
- [ ] 未定义
> $f'$ 的高度是 $f$ 的斜率，水平切线的斜率为 0，因此 $f'$ 在那里为 0：其图像与 $x$ 轴相交。其他答案描述的是 $f'$ 本身的形状，水平切线 $f$ 并不能确定；在图 4.2 中，$f'$ 在 $x = \pm1$ 处穿过轴线，那里既没有水平切线也没有最大值。$f'$ 仅在 $f$ 不可导处未定义。

? 一个粒子沿直线运动，经过 $t$ 秒后位置为 $s(t) = t^3 - 3t$ 米。其在 $t = 2$ 处的加速度为
- [ ] $9$ m/s
- [ ] $2$ m
- [x] $12$ m/s²
- [ ] $6$ m/s³
> $v(t) = 3t^2 - 3$ 和 $a(t) = 6t$，因此 $a(2) = 12$ m/s²。9 m/s 是在 $t = 2$ 处的速度，2 m 是位置；6 m/s³ 是加速度的导数 $s'''(t) = 6$，即 jerk。

? 在浮点运算中，为什么 $x^3$ 在 1 处的前向差分用 $h = 10^{-14}$ 比用 $h = 10^{-8}$ 更差？
- [ ] 截断误差随着 $h$ 变小而增大
- [ ] $x^3$ 在 1 处不可导
- [ ] Python 无法存储数字 $10^{-14}$
- [x] 舍入误差，关于 $\varepsilon/h$，随着 $h$ 变小而增大
> $f(1 + h)$ 和 $f(1)$ 几乎在所有小数位上一致，因此它们的差失去大部分精度，除以极小的 $h$ 会放大舍入误差，关于 $\varepsilon/h$ 与 $\varepsilon \approx 2.2 \times 10^{-16}$。截断误差 $-3h - h^2$ 随着 $h$ 变小而减小； $x^3$ 在所有点均可导； $10^{-14}$ 可以存储到约 16 位有效数字。
```

```check
limit_is(((3 + h)**2 - 9)/h, h, 0, 6); limit_is(((9 + h) - 9)/h, h, 0, 1); limit_is((x**2 - 9)/(x + 3), x, 3, 0)
same(expand(5 - 3*(x - 2)), -3*x + 11); same(expand(5 - 3*(x + 2)), -3*x - 1)
limit_is(Abs(h)/h, h, 0, 1, '+'); same(diff(x**2, x).subs(x, 0), 0); same(diff(x**3, x).subs(x, 0), 0)
same(diff(5*x**4 - 2*x + 7, x), 20*x**3 - 2)
same(diff(x**3, x).subs(x, 2), 12); same((x**3).subs(x, 2), 8)
sq = t**3 - 3*t
same(diff(sq, t).subs(t, 2), 9); same(sq.subs(t, 2), 2); same(diff(sq, t, 2).subs(t, 2), 12); same(diff(sq, t, 3), 6)
same(expand(3 - ((1 + h)**3 - 1)/h), -3*h - h**2)
```
