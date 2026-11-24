---
title: 极限
part: 1
lead: 理解函数趋近某个值的含义，学会从表格、图像和代数式求极限。你将证明三角函数求导所需的基本极限，用严格的 ε–δ 定义写证明，并了解计算机何时会给出错误的极限。
minutes: 240
needs: 模块 1
goals:
  - 从值表或图像估计极限，并识别极限不存在的三种情况
  - 找出单侧极限，并利用它们判断极限是否存在
  - 使用极限法则、直接代入、因式分解、有理化和合并分数来计算极限
  - 使用夹逼定理，并证明当θ趋近于0时，sin θ/θ趋近于1
  - 陈述极限的ε–δ定义，并使用它来证明一次函数和二次函数的极限
  - 解释浮点运算中的取消误差，并使用SymPy计算极限
---

## 极限的概念 {#idea}

第1模块以一个下落的球结束。在 $t$ 秒后，它下落了 $s(t) = 4.9t^2$ 米，且在时间 $t = 1$ 和 $t = 1 + h$ 之间的平均速度是差商

$$\frac{s(1 + h) - s(1)}{h} = 9.8 + 4.9h \qquad (h \ne 0).$$

当 $h$ 从两侧趋近于 0 时，这些平均速度趋于 9.8 m/s，这是球在时刻 $t = 1$ 的瞬时速度（[第1.6节](module_01_ZH.html#shrinking)）。有两点值得注意。你不能将 $h = 0$ 带入：商将变为 $0/0$，这没有意义。而且 9.8 并不是平均速度之一，因为 $9.8 + 4.9h = 9.8$ 仅当 $h = 0$ 时成立。这个数是平均速度趋近的数。这样的数是一个 **极限**，整个微积分都建立在这个概念之上。

```check
s49 = Rational(49, 10)*t**2
dq = (s49.subs(t, 1 + h) - s49.subs(t, 1))/h
same(cancel(dq), Rational(98, 10) + Rational(49, 10)*h)
same(solve(Eq(Rational(98, 10) + Rational(49, 10)*h, Rational(98, 10)), h), [0])
holds(dq.subs(h, 0) is S.NaN)
limit_is(dq, h, 0, Rational(98, 10))
```

这里是没有物理的情境。函数

$$f(x) = \frac{x^2 - 1}{x - 1}$$

在 $x = 1$ 处未定义，那里它给出 $0/0$。在接近 1 的地方它是有定义的，其值的表格显示了它在那里行为：

```valuetable
x = 0.9, 0.99, 0.999, 0.9999, 1.0001, 1.001, 1.01, 1.1
$\dfrac{x^2-1}{x-1}$ = (x**2 - 1)/(x - 1)
---
x | \dfrac{x^2-1}{x-1}
0.9 | 1.9
0.99 | 1.99
0.999 | 1.999
0.9999 | 1.9999
1.0001 | 2.0001
1.001 | 2.001
1.01 | 2.01
1.1 | 2.1
```

$x$ 越接近 1（从任一侧），则 $f(x)$ 越接近 2。代数解释了这一点。将分子 $x^2 - 1 = (x - 1)(x + 1)$ 因式分解，并约去因子 $x - 1$，当 $x \ne 1$ 时，该因子不为 0：

$$f(x) = \frac{(x - 1)(x + 1)}{x - 1} = x + 1 \qquad (x \ne 1).$$

因此，$f$ 的图像是一条 $y = x + 1$ 的直线，但缺少一个点，在 $(1, 2)$ 处有一个空洞，就像 [例 1.5](module_01_ZH.html#rational) (图 2.1, left) 中的有理函数。当 $x$ 接近 1 时，$f(x) = x + 1$ 接近 2。

```check
f21 = (x**2 - 1)/(x - 1)
same(factor(x**2 - 1), (x - 1)*(x + 1)); same(cancel(f21), x + 1)
holds(f21.subs(x, 1) is S.NaN)
limit_is(f21, x, 1, 2)
```

::: definition 极限
设含数 $a$ 的开区间内，函数 $f$ 对每个 $x$ 都有定义，唯独可以在 $a$ 处没有定义。如果只要令 $x$ 足够接近 $a$ 且不等于 $a$，就能使 $f(x)$ 任意接近 $L$，则称 $L$ 是 $f(x)$ 在 $x$ 趋近 $a$ 时的**极限**，记作

$$\lim_{x\to a} f(x) = L.$$
:::

$\lim_{x\to a} f(x) = L$ 读作「x 趋近 a 时，f(x) 的极限为 L」。也可写作当 $x \to a$ 时 $f(x) \to L$，读作「x 趋近 a 时，f(x) 趋近 L」。如果没有满足条件的数 $L$，则极限**不存在**。目前的结论如下。

$$\begin{aligned} \lim_{x\to 1}\frac{x^2 - 1}{x - 1} &= 2, \\ \lim_{h\to 0}\frac{s(1 + h) - s(1)}{h} &= 9.8. \end{aligned}$$

变量的名称并不重要：在第二个极限中$h$起$x$的作用，0起$a$的作用。

定义2.1是不正式的：“任意接近”和“足够接近”尚未精确。第2.7节将它们转化为数值，并用这些数值进行证明。在那之前，表格、图像和代数将足够使用。

::: keyidea
一个极限描述的是$f(x)$在$x$趋近于$a$时的行为，而不是在$a$处发生的事情。值$f(a)$可能是未定义的、等于极限的或与极限不同的，而这三种情况下极限都是相同的（图2.1）。
:::

::: figure id=fig-02-1
三个函数在 $x = 1$ 处有相同的极限；左图：$f(x) = \dfrac{x^2 - 1}{x - 1}$ 在 1 处未定义；当 $x$ 从两侧趋近于 1（$x$ 轴上的橙色箭头），$f(x)$ 趋近于 2（$y$ 轴旁的橙色箭头）。中间：$g(x) = x + 1$，带有 $g(1) = 2$。右图：$h(x) = x + 1$ 对于 $x \ne 1$，以及 $h(1) = 1$。远离 $x = 1$ 时，三个图像都是同一条直线，因此在 1 处所有三个极限都是 2。
:::

::: example 从表格估计极限
估计 $\dfrac{\sin x}{x}$ 在 $x \to 0$ 处的极限，其中 $x$ 以弧度为单位。

该函数在 $x = 0$ 处未定义，因此计算其在 0 附近的值：

```valuetable
x = 1, 0.5, 0.1, 0.01, 0.001
$\dfrac{\sin x}{x}$ = sin(x)/x
digits = 8
---
x | \dfrac{\sin x}{x}
1 | 0.84147098
0.5 | 0.95885108
0.1 | 0.99833417
0.01 | 0.99998333
0.001 | 0.99999983
```

$x$ 的负值给出相同的结果：正弦函数是奇函数（[第 1.4 节](module_01_ZH.html#trig)]），因此

$$\frac{\sin(-x)}{-x} = \frac{-\sin x}{-x} = \frac{\sin x}{x}.$$

这些值趋近于 1，因此可以合理猜测

$$\lim_{x\to 0}\frac{\sin x}{x} = 1.$$

一张表格建议了一个极限，但并不能证明它。第 2.6 节证明了这个极限，它是微积分中最重要的极限之一。

```check
steps(sin(-x)/(-x), -sin(x)/(-x), sin(x)/x)
limit_is(sin(x)/x, x, 0, 1)
```
:::

::: pitfall
一张表格显示有限个值，这些值可能会产生误导。尝试 $f(x) = \sin(\pi/x)$ 在 $x = 0.1$，0.01 和 0.001 处：这些值分别是 $\sin(10\pi)$，$\sin(100\pi)$ 和 $\sin(1000\pi)$，全部精确为 0，因此表格暗示极限为 0，如 $x \to 0$ 所示。但在 $x = \tfrac{2}{21} \approx 0.095$ 处的值是 $\sin\tfrac{21\pi}{2} = 1$，在 $x = \tfrac{2}{201} \approx 0.00995$ 处的值又回到 $\sin\tfrac{201\pi}{2} = 1$。无论你如何接近 0，都存在使得 $f(x) = 0$ 的点和使得 $f(x) = 1$ 的点，因此极限不存在，原因如 例 2.3 所述，对于 $\sin(1/x)$。用表格来猜测；用代数或证明来确保正确。

```check
fpi = sin(pi/x)
same([fpi.subs(x, Rational(1, 10**j)) for j in (1, 2, 3)], [0, 0, 0])
same(pi/Rational(1, 10), 10*pi); same(sin(10*pi), 0); same(sin(100*pi), 0); same(sin(1000*pi), 0)
same(fpi.subs(x, Rational(2, 21)), 1); same(sin(21*pi/2), 1); rounds(Rational(2, 21), '0.095')
same(fpi.subs(x, Rational(2, 201)), 1); same(sin(201*pi/2), 1); rounds(Rational(2, 201), '0.00995')
```
:::

## 单侧极限 {#one-sided}

模块 1 绘制了分段函数

$$f(x) = \begin{cases} x^2 & \text{if } x < 1, \\ 3 - x & \text{if } x \ge 1, \end{cases}$$

其图像在 $x = 1$（[例 1.3](module_01_ZH.html#piecewise)）处跳跃。在 1 附近，其值为

```valuetable
x = 0.9, 0.99, 0.999, 1.001, 1.01, 1.1
$f(x)$ = Piecewise((x**2, x < 1), (3 - x, True))
---
x | f(x)
0.9 | 0.81
0.99 | 0.9801
0.999 | 0.998001
1.001 | 1.999
1.01 | 1.99
1.1 | 1.9
```

在 1 的左侧，$f(x) = x^2$ 接近 1；在 1 的右侧，$f(x) = 3 - x$ 接近 2。没有一个数是从两侧同时接近的，因此 $\lim_{x\to1} f(x)$ 不存在。但是每个单独的一侧都有一个极限。

::: definition 单侧极限
设 $f$ 在一个开区间 $(c, a)$ 上定义，该区间在 $a$ 处结束。如果通过取 $x$ 足够接近 $a$ 且满足 $x < a$，可以使 $f(x)$ 任意接近一个数 $L$，那么 $L$ 是 **左侧极限**（或 **左极限**）$f$ 在 $a$ 处的值，记作

$$\lim_{x\to a^-} f(x) = L.$$

**右极限**（或称**右侧极限**）$\lim_{x\to a^+} f(x) = L$ 的定义类似，其中 $f$ 在区间 $(a, d)$ 上有定义，且 $x > a$。
:::

将 $x \to a^-$ 读作 "x 从左侧趋近于 a"，通过小于 $a$ 的值；将 $x \to a^+$ 读作 "x 从右侧趋近于 a"。对于上面的分段函数，

$$\lim_{x\to 1^-} f(x) = 1, \quad \lim_{x\to 1^+} f(x) = 2, \quad f(1) = 2.$$

```check
fpw = Piecewise((x**2, x < 1), (3 - x, True))
hp = symbols('h', positive=True)                  # x = 1 - h is left of 1, and x = 1 + h right of it
same(fpw.subs(x, 1 - hp), (1 - hp)**2); same(fpw.subs(x, 1 + hp), 2 - hp)
limit_is((1 - hp)**2, hp, 0, 1, '+'); limit_is(2 - hp, hp, 0, 2, '+')
same(fpw.subs(x, 1), 2)
```

定义 2.1 中的双侧极限要求同时在两侧接近，因此它存在的条件是单侧极限存在且一致：

::: keyidea
$\lim_{x\to a} f(x) = L$ 恰当当 $\lim_{x\to a^-} f(x) = L$ 且 $\lim_{x\to a^+} f(x) = L$。如果单侧极限不同，或者其中一个不存在，则 $\lim_{x\to a} f(x)$ 不存在。（定理 2.7 从精确定义中证明了这一点。）
:::

::: example 在 0 处有跳跃
求 $f(x) = \dfrac{\abs{x}}{x}$ 在 0 处的单侧极限。$\lim_{x\to0} f(x)$ 是否存在？

$f$ 在每个 $x \ne 0$ 都有定义。对于 $x > 0$，$\abs{x} = x$，因此 $f(x) = x/x = 1$；对于 $x < 0$，$\abs{x} = -x$，因此 $f(x) = -x/x = -1$。每个部分都是常数，因此

$$\lim_{x\to0^-}\frac{\abs{x}}{x} = -1 \quad\text{and}\quad \lim_{x\to0^+}\frac{\abs{x}}{x} = 1.$$

单侧极限不同，因此 $\lim_{x\to0} \abs{x}/x$ 不存在。图（图 2.2，左）由两条水平射线组成，在 $x = 0$ 处有一个 2 的跳跃。

```check
xpos = symbols('x', positive=True); xneg = symbols('x', negative=True)
same(Abs(xpos)/xpos, 1); same(Abs(xneg)/xneg, -1)
limit_is(Abs(x)/x, x, 0, -1, '-'); limit_is(Abs(x)/x, x, 0, 1, '+')
same(1 - (-1), 2)
```
:::

跳跃在工程中很常见。一个开关在时间 $t = 0$ 闭合的电路，可以用 **单位阶跃函数** $u(t)$ 来描述，它在 $t < 0$ 时为 0，在 $t > 0$ 时为 1（关于其在 0 处的值，不同书有不同的定义）。无论 $u(0)$ 是什么，该函数在 0 处的左极限为 0，右极限为 1。信号处理利用它来构建开关信号。

```check
ustep = Piecewise((0, t < 0), (1, t > 0))
same(ustep.subs(t, -hp), 0); same(ustep.subs(t, hp), 1)
```

::: pitfall
两种对符号的误读。$x \to 1^-$ 表示 $x$ 从下方趋近于 1，通过 0.9、0.99 和 0.999 等值。这并不意味着 $x \to -1$，且 $x$ 的值也不必为负数。单侧极限不依赖于该点的函数值：对于上面的分段函数，$f(1) = 2$ 来自右侧的公式，但如果 $f(1)$ 改为 7，右侧的极限仍为 2。
:::

## 不存在的极限 {#no-limit}

极限可能以三种方式不存在。图 2.2 展示了其中一种情况。

::: figure id=fig-02-2
极限不存在的三种方式，全部在 $x = 0$ 处。左侧，跳跃：$\abs{x}/x$ 在 0 的左侧为 $-1$，右侧为 1。中间，无穷大：$1/x^2$ 超过每一个界限。右侧，震荡：$\sin(1/x)$ 在 $-1$ 和 1 之间摆动，且随着 $x$ 接近 0 越来越快；在接近 0 处，摆动过于密集以至于无法绘制，图像看起来像一条实线带。
:::

**跳变。** 单侧极限存在但不同，如 $\abs{x}/x$ 在 0 处（例 2.2）。

**爆炸。** 当 $x$ 接近 0 时，$1/x^2$ 的值超过任意界限：

```valuetable
x = 1, 0.1, 0.01, 0.001
$\dfrac{1}{x^2}$ = 1/x**2
---
x | \dfrac{1}{x^2}
1 | 1
0.1 | 100
0.01 | 10000
0.001 | 1\times10^{6}
```

且 $-x$ 给出的值与 $x$ 相同。无论你命名哪个数 $L$，$1/x^2 > \abs{L} + 1$ 对于每一个 $x \ne 0$ 满足 $x^2 < 1/(\abs{L} + 1)$，因此接近 0 时，$1/x^2$ 的值与 $L$ 的距离超过 1。没有数是极限。模块 3 通过写 $\lim_{x\to0} 1/x^2 = \infty$ 来描述这种行为，即 **无限极限**；但 $\infty$ 不是一个数，在定义 2.1 的意义上极限不存在。

```check
same((1/x**2).subs(x, -x), 1/x**2)
for Lv_ in (-3, 0, Rational(5, 2), 100):
    X_ = Rational(1, 2*(abs(Lv_) + 1))            # a value of x^2 below 1/(|L| + 1)
    holds(X_ < Rational(1, abs(Lv_) + 1)); holds(1/X_ > abs(Lv_) + 1); holds(1/X_ - Lv_ > 1)
```

**振荡。** 当 $x$ 接近 0 时，$\sin(1/x)$ 在 $-1$ 与 1 之间无限次摆动。

::: example 振荡
证明 $\lim_{x\to0}\sin(1/x)$ 不存在。

$\sin u = 1$ 当 $u = \tfrac{\pi}{2}, \tfrac{5\pi}{2}, \tfrac{9\pi}{2}, \dots$，且 $\sin u = -1$ 当 $u = \tfrac{3\pi}{2}, \tfrac{7\pi}{2}, \tfrac{11\pi}{2}, \dots$。取 $u = 1/x$，即 $x = 1/u$，得到越来越接近 0 的点，其中 $\sin(1/x)$ 是 1，而 $-1$ 依次：

```valuetable
x = 2/pi, 2/(3*pi), 2/(5*pi), 2/(7*pi), 2/(9*pi), 2/(11*pi)
$x\ (\text{decimal})$ = x
$\sin(1/x)$ = sin(1/x)
digits = 4
---
x | x\ (\text{decimal}) | \sin(1/x)
\frac{2}{\pi} | 0.6366 | 1
\frac{2}{3 \pi} | 0.2122 | -1
\frac{2}{5 \pi} | 0.1273 | 1
\frac{2}{7 \pi} | 0.09095 | -1
\frac{2}{9 \pi} | 0.07074 | 1
\frac{2}{11 \pi} | 0.05787 | -1
```

一般来说 $x = \dfrac{2}{(4k + 1)\pi}$ 给出 $\sin(1/x) = 1$，$x = \dfrac{2}{(4k + 3)\pi}$ 给出 $\sin(1/x) = -1$，对于 $k = 0, 1, 2, \dots$，并且当 $k$ 增大时，这些点可以任意接近 0。因此，每个包含 0 的开区间，无论多小，都包含使得 $\sin(1/x) = 1$ 成立的点和使得 $\sin(1/x) = -1$ 成立的点。如果 0 附近的所有值都保持在某个数 $L$ 的 $\tfrac12$ 之内，那么 1 和 $-1$ 都会在 $\tfrac12$ 之内 $L$，从而彼此之间不超过 1；但它们之间相差 2。没有数 $L$ 是极限。

```check
kk = symbols('k', integer=True, nonnegative=True)
same(sin(1/(2/((4*kk + 1)*pi))), 1); same(sin(1/(2/((4*kk + 3)*pi))), -1)
limit_is(2/((4*k + 1)*pi), k, oo, 0); limit_is(2/((4*k + 3)*pi), k, oo, 0)
same(1 - (-1), 2); holds(Rational(1, 2) + Rational(1, 2) < 2)
same(limit(sin(1/x), x, 0, '+-'), AccumBounds(-1, 1))
```
:::

::: pitfall
“极限不存在”和“函数在 $a$ 处未定义”是不同的陈述，彼此之间也不可相互推导。$\dfrac{x^2 - 1}{x - 1}$ 在 1 处未定义，但在那里有极限 2。对于 $x < 0$ 为 $-1$ 且 $x \ge 0$ 为 1 的函数，在 0 处定义，其值为 1，但在那里没有极限。
:::

## 极限法则 {#laws}

表格和图像提示极限；极限法则通过将复杂极限分解为简单极限来动手计算们。最简单的两个是

$$\lim_{x\to a} c = c \qquad\text{and}\qquad \lim_{x\to a} x = a$$

对于每一个常数 $c$ 和每一个数 $a$。第一个法则说明常数函数保持其常数值；第二个法则说明当 $x$ 趋近于 $a$ 时，函数值 $x$ 趋近于 $a$。第2.7节从精确定义出发证明了这两个法则。

::: theorem 极限法则
假设 $\lim_{x\to a} f(x) = L$ 和 $\lim_{x\to a} g(x) = M$，并且设 $c$ 为一个常数。那么：

| 法则 | 公式 |
|---|---|
| 和 | $\lim\limits_{x\to a}\big(f(x) + g(x)\big) = L + M$ |
| 差 | $\lim\limits_{x\to a}\big(f(x) - g(x)\big) = L - M$ |
| 常数倍 | $\lim\limits_{x\to a} c\,f(x) = cL$ |
| 积 | $\lim\limits_{x\to a} f(x)\,g(x) = LM$ |
| 商 | $\lim\limits_{x\to a} \dfrac{f(x)}{g(x)} = \dfrac{L}{M}$，如果 $M \ne 0$ |
| 幂 | $\lim\limits_{x\to a} \big(f(x)\big)^n = L^n$，对于 $n = 1, 2, 3, \dots$ |
| 根值判别法 | $\lim\limits_{x\to a} \sqrt[n]{f(x)} = \sqrt[n]{L}$，对于 $n = 2, 3, \dots$，如果 $L > 0$ 当 $n$ 为偶数时 |

对于单侧极限，相同的法则也成立。
:::

词语：和的极限是各极限之和，积的极限是各极限之积，依此类推，前提是各部分的极限存在，并且对于商的情况，分母的极限不为 0。这些法则如你所预期的那样：如果 $f(x)$ 接近 $L$ 且 $g(x)$ 接近 $M$，那么 $f(x) + g(x)$ 接近 $L + M$ 且 $f(x)g(x)$ 接近 $LM$。将“接近”转化为证明需要精确的定义，因此证明见第 2.7 节，其中有一个“深入一步”框证明了和、积和商法则。其余法则由这三个法则推导得出：$f - g$ 是 $f + (-1)g$；常数倍 $c\,f$ 是 $f$ 与常数函数 $c$ 的乘积；幂法则则是乘积法则使用 $n - 1$ 次。平方根的根法则见练习 2.9。其他根的处理方式类似，只是用 $n$ 次幂的差代替平方差；对于 $L = 0$ 的情况，奇数 $n$ 允许的，更简单，因为 $\abs{\sqrt[n]{f(x)}} < c$ 每当 $\abs{f(x)} < c^n$。

```check
fF, gF = Function('f')(x), Function('g')(x)
same(fF - gF, fF + (-1)*gF); same(fF**3, fF*fF*fF)
cpos = symbols('c', positive=True)
for n_ in (3, 5):                                  # odd n: the nth root of y = c^n or -c^n has absolute value c
    same(Abs(real_root(cpos**n_, n_)), cpos); same(Abs(real_root(-cpos**n_, n_)), cpos)
    holds(Abs(real_root(Rational(1, 10**(n_ + 1)), n_)) < Rational(1, 10)); holds(Abs(real_root(-Rational(1, 10**(n_ + 1)), n_)) < Rational(1, 10))
```

::: example 使用极限法则
求

$$\lim_{x\to2}\frac{2x^2 - 3x + 1}{x + 3},$$

用于每一步的定律名称。

从分子开始。根据和差法则，再根据常数倍法则，

$$\begin{aligned} &\lim_{x\to2}\big(2x^2 - 3x + 1\big) \\ &\quad= 2\lim_{x\to2} x^2 - 3\lim_{x\to2} x + \lim_{x\to2} 1. \end{aligned}$$

根据幂法则和两个基本极限 $\lim_{x\to2} x^2 = 2^2 = 4$、$\lim_{x\to2} x = 2$ 和 $\lim_{x\to2} 1 = 1$，因此分子趋近于 $2 \cdot 4 - 3 \cdot 2 + 1 = 3$。同样地，分母趋近于 $2 + 3 = 5$。这不等于 0，因此商法则适用：

$$\lim_{x\to2}\frac{2x^2 - 3x + 1}{x + 3} = \frac{3}{5}.$$

```check
num4 = 2*x**2 - 3*x + 1
steps(Limit(num4, x, 2), 2*Limit(x**2, x, 2) - 3*Limit(x, x, 2) + Limit(1, x, 2), 2*4 - 3*2 + 1, 3)
same(Limit(x**2, x, 2).doit(), 4); same(Limit(x + 3, x, 2).doit(), 5)
limit_is(num4/(x + 3), x, 2, Rational(3, 5))
```
:::

### 直接代入 {#substitution}

例 2.4 的答案 $\tfrac35$ 是函数在 2 处的值 $\dfrac{2 \cdot 2^2 - 3 \cdot 2 + 1}{2 + 3} = \dfrac35$。这并非偶然。

::: theorem 直接代入
如果 $p$ 是多项式，则 $\lim_{x\to a} p(x) = p(a)$ 对每个数 $a$ 都成立。如果 $r = p/q$ 是有理函数且 $q(a) \ne 0$，则 $\lim_{x\to a} r(x) = r(a)$。
:::

::: proof
写出 $p(x) = c_n x^n + \dots + c_1 x + c_0$。根据幂法则和基本极限 $\lim_{x\to a} x = a$，对于每个 $\lim_{x\to a} x^k = a^k$，$k \ge 1$ 成立；根据常数倍法则，$\lim_{x\to a} c_k x^k = c_k a^k$；再根据和法则，每个加号使用一次，结合 $\lim_{x\to a} c_0 = c_0$，

$$\begin{aligned} \lim_{x\to a} p(x) &= c_n a^n + \dots + c_1 a + c_0 \\ &= p(a). \end{aligned}$$

如果 $r = p/q$，则 $\lim_{x\to a} p(x) = p(a)$ 和 $\lim_{x\to a} q(x) = q(a)$，这不等于 0，因此商法则给出 $\lim_{x\to a} r(x) = p(a)/q(a) = r(a)$。
:::

```check
cs = symbols('c0:4')
pg = sum(cs[j]*x**j for j in range(4))
limit_is(pg, x, a, pg.subs(x, a))                  # two-sided, at a symbolic point a
limit_is(pg/(x**2 - 2*x + 5), x, a, pg.subs(x, a)/(a**2 - 2*a + 5))   # a rational function whose denominator is never 0 on the real line
same(Rational(2*2**2 - 3*2 + 1, 2 + 3), Rational(3, 5))
```

直接代入法也适用于根的情况，根据根的法则：例如，$\lim_{x\to4}\sqrt{x} = \sqrt4 = 2$。模块3显示，这种方法适用于模块1目录中所有函数在其定义域内的每个点；这样的函数被称为**连续**。在本模块中，直到那时为止，仅对多项式、有理函数和根使用直接代入法，第2.6节通过手动证明了$\sin\theta \to 0$和$\cos\theta \to 1$在$\theta \to 0$时的极限。

```check
limit_is(sqrt(x), x, 4, 2)
```

::: pitfall
两个法则的误用。首先，商法则需要$M \ne 0$。对于$\lim_{x\to1}\dfrac{x^2 - 1}{x - 1}$，它会给出$\dfrac00$，这不是一个数：法则不适用，极限2必须通过其他方法找到，如第2.1节所示。其次，法则仅单向适用。如果各个部分有极限，那么组合也有极限；但组合可能有极限，而各个部分却没有。尽管$\sin(1/x)$和$-\sin(1/x)$在0处都没有极限，它们的和对于每一个$x \ne 0$都是0，极限为0。

```check
same((x**2 - 1).subs(x, 1), 0); same((x - 1).subs(x, 1), 0)
same(sin(1/x) + (-sin(1/x)), 0)
```
:::

## 代数技巧 {#algebra}

### 0/0型 {#zero-over-zero}

当直接代入商式得到$0/0$时，极限仍可能存在，且可以是任何数。这四个商式在$0/0$处都给出$x = 1$：

| $f(x)$ | 当 $x \ne 1$ 时，$f(x)$ | $\lim\limits_{x\to1} f(x)$ |
|---|---|---|
| $\dfrac{x^2 - 1}{x - 1}$ | $x + 1$ | 2 |
| $\dfrac{3x - 3}{x - 1}$ | $3$ | 3 |
| $\dfrac{x^2 - 2x + 1}{x - 1}$ | $x - 1$ | 0 |
| $\dfrac{x - 1}{x^2 - 2x + 1}$ | $\dfrac{1}{x - 1}$ | 不存在 |

最后一个在 1 处发散，1 右侧有极大的正值，左侧有极大的负值。因此 $0/0$ 被称为一个 **不定式**：这种形式本身并不能确定极限。这是一个需要进一步工作的信号，而不是答案。这种工作是代数运算，将商式 $x \ne a$ 重写为一个可以直接代入的函数，而这个定理使得这种做法合法：

```check
for num_, den_, simp_ in ((x**2 - 1, x - 1, x + 1), (3*x - 3, x - 1, 3), (x**2 - 2*x + 1, x - 1, x - 1), (x - 1, x**2 - 2*x + 1, 1/(x - 1))):
    same(num_.subs(x, 1), 0); same(den_.subs(x, 1), 0); same(cancel(num_/den_), simp_)
limit_is((x**2 - 1)/(x - 1), x, 1, 2); limit_is((3*x - 3)/(x - 1), x, 1, 3); limit_is((x**2 - 2*x + 1)/(x - 1), x, 1, 0)
limit_is((x - 1)/(x**2 - 2*x + 1), x, 1, oo, '+'); limit_is((x - 1)/(x**2 - 2*x + 1), x, 1, -oo, '-')
```

::: theorem 在某一点附近相等的函数
如果 $f(x) = g(x)$ 对于每一个 $x \ne a$ 在包含 $a$ 的开区间内，且 $\lim_{x\to a} g(x) = L$，那么 $\lim_{x\to a} f(x) = L$。当考虑单侧极限时，同样的结论也成立，只要 $f(x) = g(x)$ 在一个以 $a$ 为端点的开区间内。
:::

::: proof
极限 $f$ 在 $a$ 处仅依赖于 $f(x)$ 在 $a$ 附近 $x$ 的值，且 $x \ne a$。足够接近 $a$ 时，每个这样的 $x$ 都在区间内，其中 $f(x) = g(x)$。因此，$f(x)$ 可以被任意接近 $L$，当且仅当 $g(x)$ 也可以被任意接近。 （用第 2.7 节的语言：一个对 $g$ 起作用的 $\delta$，如果需要的话可以减小，使得 $(a - \delta, a + \delta)$ 位于区间内，那么它对 $f$ 也起作用。）对于单侧极限，相同的论证只考虑 $a$ 一侧。
:::

### 因式分解并约分 {#factor}

如果替换后得到 $0/0$ 在多项式商中，则 $x - a$ 是分子和分母的公因式。原因：如果 $p(a) = 0$，则 $p(x) = p(x) - p(a) = c_n(x^n - a^n) + \dots + c_1(x - a)$，且每个 $x^k - a^k$ 都包含因式 $x - a$：

$$\begin{aligned} &x^k - a^k \\ &\quad= (x - a)\big(x^{k-1} + x^{k-2}a + \dots + a^{k-1}\big). \end{aligned}$$

因此，对分子和分母进行因式分解，约去 $x - a$（允许这样做，因为 $x \ne a$），然后替换；如果 $0/0$ 再次出现，则重复此过程。

```check
for N_ in range(1, 7):
    same((x - a)*sum(x**(N_ - 1 - j)*a**j for j in range(N_)), x**N_ - a**N_)
same(expand(pg - pg.subs(x, a)), expand(sum(cs[j]*(x**j - a**j) for j in range(1, 4))))
```

::: example 下落球的速度
求下落球的速度，$s(t) = 4.9t^2$，在时间 $t = a$ 时：

$$\lim_{h\to0}\frac{s(a + h) - s(a)}{h}.$$

代入 $h = 0$ 得到 $0/0$。展开 $s(a + h)$ 并减去 $s(a)$：

$$\begin{aligned} &s(a + h) - s(a) \\ &\quad= 4.9(a^2 + 2ah + h^2) - 4.9a^2 \\ &\quad= 9.8ah + 4.9h^2 = h(9.8a + 4.9h). \end{aligned}$$

对于 $h \ne 0$，因子 $h$ 抵消：

$$\frac{s(a + h) - s(a)}{h} = 9.8a + 4.9h.$$

根据定理 2.3 和直接代入（在变量 $h$ 中），

$$\lim_{h\to0}\frac{s(a + h) - s(a)}{h} = 9.8a.$$

在时间 $a$ 时，球下落速度为 $9.8a$ m/s：1 秒后为 9.8 m/s，如模块 1 所示，2 秒后为 19.6 m/s。其速度每秒增加 9.8 m/s，即模块 1 中的重力加速度。此类极限是模块 4 中的导数。

```check
sa = Rational(49, 10)*t**2
steps(sa.subs(t, a + h) - sa.subs(t, a), Rational(49, 10)*(a**2 + 2*a*h + h**2) - Rational(49, 10)*a**2,
      Rational(98, 10)*a*h + Rational(49, 10)*h**2, h*(Rational(98, 10)*a + Rational(49, 10)*h))
same(cancel((sa.subs(t, a + h) - sa.subs(t, a))/h), Rational(98, 10)*a + Rational(49, 10)*h)
limit_is((sa.subs(t, a + h) - sa.subs(t, a))/h, h, 0, Rational(98, 10)*a)
same(Rational(98, 10)*2, Rational(196, 10)); same(Rational(98, 10)*(a + 1) - Rational(98, 10)*a, Rational(98, 10))
```
:::

::: example 因式分解并约分
求

$$\lim_{x\to3}\frac{x^2 - x - 6}{x^2 - 9}.$$

在 $x = 3$ 时，分子是 $9 - 3 - 6 = 0$，分母是 $9 - 9 = 0$，因此两者都有因子 $x - 3$：$x^2 - x - 6 = (x - 3)(x + 2)$ 和 $x^2 - 9 = (x - 3)(x + 3)$。对于 $x \ne 3$（和 $x \ne -3$），

$$\frac{x^2 - x - 6}{x^2 - 9} = \frac{(x - 3)(x + 2)}{(x - 3)(x + 3)} = \frac{x + 2}{x + 3}.$$

新的分母在 $x = 3$ 时为 6，不是 0，因此根据定理 2.3 和直接代入

$$\lim_{x\to3}\frac{x^2 - x - 6}{x^2 - 9} = \frac{3 + 2}{3 + 3} = \frac56.$$

```check
n6, d6 = x**2 - x - 6, x**2 - 9
same(n6.subs(x, 3), 0); same(d6.subs(x, 3), 0); same(9 - 3 - 6, 0)
same(factor(n6), (x - 3)*(x + 2)); same(factor(d6), (x - 3)*(x + 3))
same(cancel(n6/d6), (x + 2)/(x + 3)); same((x + 3).subs(x, 3), 6)
limit_is(n6/d6, x, 3, Rational(5, 6))
```
:::

### 有理化 {#rationalise}

当 $0/0$ 来自一个包含平方根的差时，将分子和分母都乘以 **共轭**，即两个相同项之间符号相反的表达式。 $\sqrt{A} - B$ 的共轭是 $\sqrt{A} + B$，它们的乘积为

$$\big(\sqrt{A} - B\big)\big(\sqrt{A} + B\big) = A - B^2 \quad (A \ge 0),$$

不再含有平方根。

```check
Ann = symbols('A', nonnegative=True)
same(expand((sqrt(Ann) - b)*(sqrt(Ann) + b)), Ann - b**2)
```

::: example 有理化
求

$$\lim_{x\to0}\frac{\sqrt{x + 9} - 3}{x}.$$

替换得到 $(\sqrt9 - 3)/0 = 0/0$。将分子和分母乘以共轭 $\sqrt{x + 9} + 3$，其为正数。对于 $x \ne 0$（和 $x \ge -9$），

$$\begin{aligned} \frac{\sqrt{x + 9} - 3}{x} &= \frac{\big(\sqrt{x + 9} - 3\big)\big(\sqrt{x + 9} + 3\big)}{x\big(\sqrt{x + 9} + 3\big)} \\ &= \frac{(x + 9) - 9}{x\big(\sqrt{x + 9} + 3\big)} \\ &= \frac{1}{\sqrt{x + 9} + 3}. \end{aligned}$$

根据根的法则，$\sqrt{x + 9} \to \sqrt9 = 3$ 等于 $x \to 0$；然后利用和与商的法则得到

$$\lim_{x\to0}\frac{\sqrt{x + 9} - 3}{x} = \frac{1}{3 + 3} = \frac16.$$

```check
q7 = (sqrt(x + 9) - 3)/x
same(sqrt(9) - 3, 0)
steps(q7, (sqrt(x + 9) - 3)*(sqrt(x + 9) + 3)/(x*(sqrt(x + 9) + 3)), ((x + 9) - 9)/(x*(sqrt(x + 9) + 3)), 1/(sqrt(x + 9) + 3))
limit_is(sqrt(x + 9), x, 0, 3); limit_is(q7, x, 0, Rational(1, 6))
```
:::

### 合并分数 {#combine}

当商中含有分数时，先将其放在同一个分母上。

::: example 合并分数
求

$$\lim_{x\to3}\frac{\dfrac1x - \dfrac13}{x - 3}.$$

替换得到 $\big(\tfrac13 - \tfrac13\big)/0 = 0/0$。在公共分母 $3x$ 上，分子是

$$\frac1x - \frac13 = \frac{3 - x}{3x} = -\frac{x - 3}{3x}.$$

因此，对于 $x \ne 3$（和 $x \ne 0$），

$$\frac{\dfrac1x - \dfrac13}{x - 3} = -\frac{x - 3}{3x(x - 3)} = -\frac{1}{3x},$$

并且根据定理 2.3 和直接替换，极限是 $-\dfrac{1}{3 \cdot 3} = -\dfrac19$。这是 $1/x$ 在 $x = 3$ 处的变化率。[练习 1.9](module_01_ZH.html#ex-1-9) 发现 $1/x$ 在 $a$ 处的差商趋近于 $-1/a^2$，以及 $-1/3^2 = -\tfrac19$。

```check
same(1/x - Rational(1, 3), (3 - x)/(3*x)); same((3 - x)/(3*x), -(x - 3)/(3*x))
same(cancel((1/x - Rational(1, 3))/(x - 3)), -1/(3*x))
limit_is((1/x - Rational(1, 3))/(x - 3), x, 3, -Rational(1, 9))
same(-1/Integer(3)**2, -Rational(1, 9))
```
:::

::: pitfall
两张带有 $0/0$ 的卡片。"替换得到 $0/0$，因此极限是 0"（或 1，或"不存在"）是错误的：$0/0$ 是一种形式，而不是值，而且本节开头的表格显示了四种 $0/0$ 形式，对应四种不同的结果。并且要约去因子，不要约去项：在 $\dfrac{x^2 - x - 6}{x^2 - 9}$ 中，你可以在两个都分解后约去因子 $x - 3$，但你不能将 $x^2$ 上下交叉约去以得到 $\dfrac{-x - 6}{-9}$，这是不同的函数（在 $x = 1$ 处得到 $\tfrac79$，而原函数得到 $\tfrac34$）。

```check
same(((x**2 - x - 6)/(x**2 - 9)).subs(x, 1), Rational(3, 4)); same(((-x - 6)/(-9)).subs(x, 1), Rational(7, 9))
```
:::

## 夹逼定理 {#squeeze}

一些极限是通过夹逼找到的。将例 2.3 中振荡的 $\sin(1/x)$ 乘以 $x$。由于 $\abs{\sin(1/x)} \le 1$，

$$\abs{x\sin\frac1x} = \abs{x}\,\abs{\sin\frac1x} \le \abs{x}, \quad\text{that is,}$$

$$-\abs{x} \le x\sin\frac1x \le \abs{x} \qquad (x \ne 0).$$

图像仍然在 0 附近无限次振荡，但介于直线 $y = \abs{x}$ 和 $y = -\abs{x}$ 之间，这两条直线在原点处收敛（图 2.3，左图）。值无处可去，只能趋向于 0。

::: figure id=fig-02-3
夹逼定理的两个例子。左图中，$x\sin(1/x)$ 在零附近无限次振荡，但总在 $y = -\abs{x}$ 与 $y = \abs{x}$（虚线）之间。两条边界曲线在原点相交，所以它在零点的极限是零（例 2.9）。右图中，对 $0 < \abs{\theta} < \pi/2$，$\dfrac{\sin\theta}{\theta}$ 介于 $\cos\theta$ 和 1 之间；当 $\theta \to 0$ 时，两者都趋近 1（定理 2.5）。
:::

::: theorem 夹逼定理
假设对于包含 $a$ 的某个开区间内的每个 $x \ne a$ 都有 $g(x) \le f(x) \le h(x)$，并且

$$\lim_{x\to a} g(x) = \lim_{x\to a} h(x) = L.$$

那么 $\lim_{x\to a} f(x) = L$。单侧极限也适用，只需考虑 $a$ 一侧的不等式。
:::

原因是：在 $a$ 附近，值 $g(x)$ 和 $h(x)$ 都可以任意接近 $L$，介于它们之间的每个数，包括 $f(x)$，也是如此。第 2.7 节的“深入理解”框中用精确定义写出了这一点。该定理也被称为夹逼定理。

::: example 被夹逼的震荡
证明 $\lim_{x\to0} x\sin(1/x) = 0$。

该函数对于每一个 $x \ne 0$ 都有定义，对于那些 $x$，如上所示，$-\abs{x} \le x\sin(1/x) \le \abs{x}$。两个界都趋于 0。事实上 $\abs{x} = -x$ 对于 $x < 0$，$\abs{x} = x$ 对于 $x > 0$，因此 $\abs{x}$ 在 0 处的两个单侧极限都是 0，且 $\lim_{x\to0}\abs{x} = 0$；然后 $\lim_{x\to0}\big(-\abs{x}\big) = 0$ 由常数倍法则。根据夹逼定理，$\lim_{x\to0} x\sin(1/x) = 0$。因子 $x$ 抑制了例 2.3 中的振荡。

```check
for v in [Rational(1, j) for j in range(1, 40)] + [-Rational(1, j) for j in range(1, 40)] + [Rational(3, 1000), -Rational(2, 7)]:
    holds(-Abs(v) <= v*sin(1/v)); holds(v*sin(1/v) <= Abs(v))
limit_is(Abs(x), x, 0, 0, '-'); limit_is(Abs(x), x, 0, 0, '+'); limit_is(-Abs(x), x, 0, 0)
limit_is(x*sin(1/x), x, 0, 0)
```
:::

### 两个三角函数极限 {#trig-limits}

夹逼定理最重要的应用是例2.1中猜测的极限。它需要从单位圆的几何中得出一个不等式。设 $0 < \theta < \pi/2$。在图2.4中，$O$ 是原点，$A = (1, 0)$，$P = (\cos\theta, \sin\theta)$ 是单位圆上角度为 $\theta$ 的点，$Q = (1, \tan\theta)$ 是直线 $OP$ 与垂直直线 $x = 1$ 相交的点。三个区域依次嵌套：三角形 $OAP$，扇形 $OAP$（在半径 $OA$ 和 $OP$ 之间的圆盘切片）以及三角形 $OAQ$。因此它们的面积按此顺序递增。三角形 $OAP$ 的底边为 $OA = 1$，高为 $\sin\theta$。扇形是整个圆盘面积 $\theta/(2\pi)$ 的一部分，整个圆盘的面积是 $\pi$，因此扇形的面积是 $\theta/2$。三角形 $OAQ$ 的底边为1，高为 $\tan\theta$。因此

$$\begin{aligned} \frac12\sin\theta &< \frac12\theta < \frac12\tan\theta, \quad\text{so} \\ \sin\theta &< \theta < \tan\theta \qquad \Big(0 < \theta < \frac{\pi}{2}\Big). \end{aligned}$$

::: figure id=fig-02-4
定理 2.5 的面积比较，角 $\theta$ 在零与 $\pi/2$ 之间。左图的三角形 $OAP$ 包含在中图的扇形 $OAP$ 中，扇形又包含在右图的三角形 $OAQ$ 中，因此 $\tfrac12\sin\theta < \tfrac12\theta < \tfrac12\tan\theta$。
:::

```check
thp = symbols('theta', positive=True)
same(Rational(1, 2)*1*sin(thp), sin(thp)/2); same(thp/(2*pi)*pi*1**2, thp/2); same(Rational(1, 2)*1*tan(thp), tan(thp)/2)
same((sin(thp)/cos(thp)*x).subs(x, 1), tan(thp))          # the line OP, y = x tan(theta), meets x = 1 at height tan(theta)
for v in [Rational(j, 20) for j in range(1, 32)]:
    holds(sin(v) < v); holds(v < tan(v))
holds(Rational(31, 20) < pi/2)
```

::: example 正弦和余弦在0附近
证明 $\lim_{\theta\to0}\sin\theta = 0$ 和 $\lim_{\theta\to0}\cos\theta = 1$。

对于 $0 < \theta < \pi/2$，$\sin\theta > 0$（点 $P$ 位于 $x$ 轴上方），并且上面的不等式给出 $\sin\theta < \theta$；因此 $0 < \sin\theta < \theta$。正弦是奇函数，因此对于 $-\pi/2 < \theta < 0$ 这个变为 $\theta < \sin\theta < 0$。在两种情况下

$$-\abs{\theta} \le \sin\theta \le \abs{\theta} \qquad \Big(0 < \abs{\theta} < \frac{\pi}{2}\Big),$$

并且两个界都趋近于0（例2.9），因此 $\lim_{\theta\to0}\sin\theta = 0$ 由夹逼定理。

对于余弦，使用 $\sin^2\theta + \cos^2\theta = 1$。对于 $0 < \abs{\theta} < \pi/2$，点 $P$ 位于 $y$ 轴右侧，因此 $\cos\theta > 0$ 和 $1 + \cos\theta > 1$。将 $1 + \cos\theta$ 相乘相除：

$$\begin{aligned} 1 - \cos\theta &= \frac{(1 - \cos\theta)(1 + \cos\theta)}{1 + \cos\theta} \\ &= \frac{\sin^2\theta}{1 + \cos\theta}. \end{aligned}$$

这个值介于0和 $\sin^2\theta$ 之间，因为分母大于1，且 $\sin^2\theta \le \theta^2$ 由第一部分给出。因此 $0 \le 1 - \cos\theta \le \theta^2$。由于 $\theta^2 \to 0$，夹逼定理给出 $1 - \cos\theta \to 0$，差值法则给出 $\cos\theta = 1 - (1 - \cos\theta) \to 1 - 0 = 1$。

```check
thr = symbols('theta', real=True)
same(sin(-thr), -sin(thr))
steps(1 - cos(thr), (1 - cos(thr))*(1 + cos(thr))/(1 + cos(thr)), sin(thr)**2/(1 + cos(thr)))
for v in [Rational(j, 20) for j in range(-31, 32) if j != 0]:
    holds(-Abs(v) <= sin(v)); holds(sin(v) <= Abs(v)); holds(cos(v) > 0)
    holds((v > 0) == (sin(v) > 0))                      # 0 < sin(theta) < theta on the right, theta < sin(theta) < 0 on the left
    holds(0 <= 1 - cos(v)); holds(1 - cos(v) <= sin(v)**2); holds(sin(v)**2 <= v**2)
limit_is(sin(theta), theta, 0, 0); limit_is(1 - cos(theta), theta, 0, 0); limit_is(cos(theta), theta, 0, 1)
```
:::

::: theorem sin θ/θ 的极限
以弧度为单位的 $\theta$

$$\lim_{\theta\to0}\frac{\sin\theta}{\theta} = 1.$$
:::

::: proof
设 $0 < \theta < \pi/2$。将 $\sin\theta < \theta$ 除以 $\theta > 0$ 得到 $\dfrac{\sin\theta}{\theta} < 1$。将 $\theta < \tan\theta = \dfrac{\sin\theta}{\cos\theta}$ 乘以 $\dfrac{\cos\theta}{\theta} > 0$ 得到 $\cos\theta < \dfrac{\sin\theta}{\theta}$。因此

$$\cos\theta < \frac{\sin\theta}{\theta} < 1.$$

余弦函数是偶函数 ([小节 1.4](module_01_ZH.html#trig)), 同样 $\dfrac{\sin\theta}{\theta}$ (例 2.1) 也是偶函数，因此对于 $-\pi/2 < \theta < 0$ (图 2.3，右图) 也成立相同的不等式。如 $\theta \to 0$，$\cos\theta \to 1$ (例 2.10)，常数 1 保持为 1。根据夹逼定理，$\dfrac{\sin\theta}{\theta} \to 1$。
:::

```check
same(cos(-theta), cos(theta)); same(sin(-theta)/(-theta), sin(theta)/theta)
same(thp/thp, 1); same(tan(thp)*cos(thp)/thp, sin(thp)/thp)
for v in [Rational(j, 20) for j in range(-31, 32) if j != 0]:
    holds(cos(v) < sin(v)/v); holds(sin(v)/v < 1)
limit_is(sin(theta)/theta, theta, 0, 1)
```

::: theorem (1 − cos θ)/θ 的极限
以弧度为单位的 $\theta$

$$\lim_{\theta\to0}\frac{1 - \cos\theta}{\theta} = 0.$$
:::

::: proof
对于 $0 < \abs{\theta} < \pi/2$, $1 + \cos\theta > 0$. 将分子和分母同乘以 $1 + \cos\theta$，并使用 $1 - \cos^2\theta = \sin^2\theta$：

$$\begin{aligned} \frac{1 - \cos\theta}{\theta} &= \frac{1 - \cos^2\theta}{\theta(1 + \cos\theta)} \\ &= \frac{\sin\theta}{\theta}\cdot\frac{\sin\theta}{1 + \cos\theta}. \end{aligned}$$

如 $\theta \to 0$, $\dfrac{\sin\theta}{\theta} \to 1$ (定理 2.5), $\sin\theta \to 0$ 和 $1 + \cos\theta \to 2$ (例 2.10)。根据乘积与商的极限法则，极限为 $1 \cdot \dfrac02 = 0$。
:::

```check
steps((1 - cos(theta))/theta, (1 - cos(theta)**2)/(theta*(1 + cos(theta))), (sin(theta)/theta)*(sin(theta)/(1 + cos(theta))))
limit_is(1 + cos(theta), theta, 0, 2); limit_is(sin(theta)/(1 + cos(theta)), theta, 0, 0)
limit_is((1 - cos(theta))/theta, theta, 0, 0)
```

定理 2.5 表示 $\sin\theta \approx \theta$ 对于小的 $\theta$，误差即使与 $\theta$ 本身相比也很小：在 $\theta = 0.1$ 处，比值 $\sin\theta/\theta$ 大约是 0.99833。物理学家使用这个 **小角度近似**，例如用于摆动角度很小的单摆，以及模块 5 使用定理 2.5 和 2.6 来找出 $\sin x$ 的变化率。

```check
rounds(sin(Rational(1, 10))/Rational(1, 10), '0.99833')
```

::: example 使用两个极限
求 $x \to 0$ 时 (a) $\dfrac{\sin 3x}{x}$ 和 (b) $\dfrac{\tan x}{x}$ 的极限。

**(a)** 定理 2.5 需要相同的角度在上方和下方。因此，设 $\theta = 3x$ 并写出

$$\frac{\sin 3x}{x} = 3\cdot\frac{\sin 3x}{3x} = 3\cdot\frac{\sin\theta}{\theta}.$$

当 $x \to 0$ 与 $x \ne 0$，$\theta \to 0$ 与 $\theta \ne 0$，所以 $\sin\theta/\theta \to 1$。 （第 2.7 节使这一步精确：如果 $\sin\theta/\theta$ 在 $\varepsilon$ 之内为 1 时，只要 $0 < \abs{\theta} < \delta$，那么 $\sin 3x/(3x)$ 在 $\varepsilon$ 之内为 1 时，只要 $0 < \abs{x} < \delta/3$，因为此时 $0 < \abs{3x} < \delta$。）根据常数倍法则，

$$\lim_{x\to0}\frac{\sin 3x}{x} = 3 \cdot 1 = 3.$$

**(b)** 写

$$\frac{\tan x}{x} = \frac{\sin x}{x}\cdot\frac{1}{\cos x}.$$

第一个因子趋近于 1（定理 2.5）和 $\cos x \to 1$（例 2.10），因此根据乘积法则和商法则

$$\lim_{x\to0}\frac{\tan x}{x} = 1 \cdot \frac11 = 1.$$

```check
same(sin(3*x)/x, 3*sin(3*x)/(3*x)); same((3*sin(theta)/theta).subs(theta, 3*x), 3*sin(3*x)/(3*x))
limit_is(sin(3*x)/(3*x), x, 0, 1); limit_is(sin(3*x)/x, x, 0, 3)
same(tan(x)/x, (sin(x)/x)*(1/cos(x))); limit_is(tan(x)/x, x, 0, 1)
```
:::

::: pitfall
定理 2.5 需要以弧度为单位。一个 $x$ 度的角等于 $\pi x/180$ 弧度，因此以度数为单位时，例 2.11 中的参数给出

$$\begin{aligned} \lim_{x\to0}\frac{\sin(x^\circ)}{x} &= \lim_{x\to0}\frac{\pi}{180}\cdot\frac{\sin(\pi x/180)}{\pi x/180} \\ &= \frac{\pi}{180} \approx 0.01745, \end{aligned}$$

并不是 1：这是微积分在弧度下有效的一个原因。并且只有 $\sin\theta/\theta$，在上面和下面都使用相同的 $\theta$，才会趋近于 1：$\dfrac{\sin 3x}{x}$ 趋近于 3。

```check
same(sin(pi*x/180)/x, pi/180*sin(pi*x/180)/(pi*x/180))
limit_is(sin(pi*x/180)/x, x, 0, pi/180); rounds(pi/180, '0.01745')
```
:::

## 精确的定义 {#precise}

定义 2.1 依赖于两个短语，“接近到你想要的程度”和“足够接近”。要证明一个极限是 $L$，或者一个函数没有极限，你必须确切地说明它们的含义。答案是 19 世纪 20 年代的柯西和 19 世纪 60 年代和 70 年代的魏尔斯特拉斯为微积分所提供的基础。它通过距离来衡量接近程度：$\abs{f(x) - L}$ 是 $f(x)$ 和 $L$ 之间的距离，而 $\abs{x - a}$ 是 $x$ 和 $a$ 之间的距离（[第 1.3 节](module_01_ZH.html#piecewise)]）。对于一个正数 $\delta$，

$$\abs{x - a} < \delta \quad\text{means}\quad a - \delta < x < a + \delta,$$

除了上述内容，$0 < \abs{x - a} < \delta$ 还说明 $x \ne a$。同样地，$\abs{f(x) - L} < \varepsilon$ 表示 $L - \varepsilon < f(x) < L + \varepsilon$。希腊字母 $\varepsilon$（“epsilon”）和 $\delta$（“delta”）是这两个距离的传统名称。

```check
xr2, ar2 = symbols('x_r a_r', real=True); dl = symbols('delta', positive=True)
same(solveset(Abs(xr2 - ar2) < dl, xr2, S.Reals), Interval.open(ar2 - dl, ar2 + dl))
```

::: definition 极限，精确定义
设 $f$ 在包含 $a$ 的开区间上定义，除了可能在 $a$ 本身处未定义。那么 $\lim_{x\to a} f(x) = L$ 表示：对于每一个数 $\varepsilon > 0$，存在一个数 $\delta > 0$，使得对于每一个 $x$ 满足 $0 < \abs{x - a} < \delta$，

$$\abs{f(x) - L} < \varepsilon.$$
:::

定义 2.1 中的每一部分都有其精确的对应：

| 定义 2.1 | 定义 2.3 |
|---|---|
| $f(x)$ 接近 $L$ 到任意程度 | 对于每一个 $\varepsilon > 0$，$\abs{f(x) - L} < \varepsilon$ |
| 通过取 $x$ 足够接近 $a$ | 存在一个 $\delta > 0$ 满足 $\abs{x - a} < \delta$ |
| 但不等于 $a$ | $0 < \abs{x - a}$ |

单侧极限以相同方式精确化：对于 $\lim_{x\to a^-} f(x) = L$，将 $0 < \abs{x - a} < \delta$ 替换为 $a - \delta < x < a$，对于 $\lim_{x\to a^+} f(x) = L$ 替换为 $a < x < a + \delta$。

### 挑战与回应 {#game}

可以把定义 2.3 看成两人游戏。挑战者给出一个任意小的误差容许量 $\varepsilon > 0$，你选定一个 $\delta > 0$ 作答。若每个满足 $0 < \abs{x - a} < \delta$ 的 $x$ 都给出 $\abs{f(x) - L} < \varepsilon$，你就获胜。在图 2.5 中，除 $x = a$ 本身外，竖条 $a - \delta < x < a + \delta$ 内的图像必须全部落在水平带 $L - \varepsilon < y < L + \varepsilon$ 内。

- $\lim_{x\to a} f(x) = L$ 表示你可以赢得每一回合：无论挑战者指定的 $\varepsilon$ 是什么，你都有一个获胜的 $\delta$。
- 你的 $\delta$ 是在 $\varepsilon$ 之后选择的，可能依赖于它；通常一个更小的 $\varepsilon$ 需要一个更小的 $\delta$。
- 一旦一个 $\delta$ 获胜，每一个更小的正 $\delta$ 也会获胜，因为它允许的 $x$ 更少。
- 要证明 $L$ 不是极限，挑战者需要一个 $\varepsilon$，使得没有任何 $\delta$ 能够回应。

::: figure id=fig-02-5
对于 $y = x^2$ 接近 $a = 3$ 的情况，涉及 $L = 9$ 和挑战 $\varepsilon = 3$。橙色带是 $L - \varepsilon < y < L + \varepsilon$；绿色带状区域是 $a - \delta < x < a + \delta$。左图：在 $\delta = 0.4$ 的情况下，图像在带状区域内保持在带状区域中，因此 $\delta = 0.4$ 获胜。右图：在 $\delta = 0.8$ 的情况下，图像在带状区域的两侧附近离开带状区域（红色），因此 $\delta = 0.8$ 失败。
:::

```check
for v in [3 - Rational(2, 5) + Rational(j, 100)*Rational(4, 5) for j in range(1, 100)]:
    holds(Abs(v**2 - 9) < 3)                         # delta = 0.4: every x of the strip lands in the band
same(Rational(26, 10)**2, Rational(676, 100)); same(Rational(34, 10)**2, Rational(1156, 100))
holds(Rational(676, 100) > 6); holds(Rational(1156, 100) < 12)
holds(Abs(Rational(37, 10)**2 - 9) >= 3); holds(Abs(Rational(23, 10)**2 - 9) >= 3)   # delta = 0.8 lets in 2.3 and 3.7
```

::: analogy
一台机器切割应为 400 平方厘米面积的正方形瓷砖，因此边长应为 20 厘米。客户对面积的公差是挑战 $\varepsilon$；切割边长的精度是响应 $\delta$。更小的公差需要更高的精度，但每个公差都可以通过足够精确的切割来满足：这就是 $\lim_{s\to20} s^2 = 400$ 的含义。练习 2.8 计算了 1 平方厘米公差所需的精度。
:::

::: widget name=limit-explorer
玩这个游戏。在 $\dfrac{x^2 - 1}{x - 1}$ 处 $a = 1$，设定 $\varepsilon = 0.5$ 并找到滑块上最大的 $\delta$ 使得它获胜；然后让 $\varepsilon$ 更小，并再次找到 $\delta$。有什么规律吗？对 $\dfrac{\sin x}{x}$ 做同样的事情，其中 $\delta$ 可以比 $\varepsilon$ 大得多，并且对于 $x\sin(1/x)$，其中 $\delta = \varepsilon$ 始终获胜（例 2.9 展示了原因）。放大以查看接近该点的图像。然后选择 $\abs{x}/x$ 或 $\sin(1/x)$，它们在 0 处没有极限：尝试每个候选 $L$，并检查一旦 $\varepsilon \le 1$ 没有 $\delta$ 获胜。
:::

### 使用 ε 和 δ 的证明 {#proofs}

一个证明 $\lim_{x\to a} f(x) = L$ 是该游戏的策略：一个将任何 $\varepsilon$ 转换为获胜 $\delta$ 的规则。你分两个阶段找到它。在 **草稿工作** 中，你从 $\abs{f(x) - L} < \varepsilon$ 开始并反向推导出 $\abs{x - a}$ 上的条件。在 **证明** 中，你从 $0 < \abs{x - a} < \delta$ 向 $\abs{f(x) - L} < \varepsilon$ 正向运行论证。

::: example 一条直线的 ε–δ 证明
证明 $\lim_{x\to2}(3x - 1) = 5$。

*草稿.* $\abs{(3x - 1) - 5} = \abs{3x - 6} = 3\abs{x - 2}$, 并且这小于 $\varepsilon$ 恰好当 $\abs{x - 2} < \varepsilon/3$. 所以尝试 $\delta = \varepsilon/3$.

*证明.* 设 $\varepsilon > 0$, 并选择 $\delta = \varepsilon/3$. 如果 $0 < \abs{x - 2} < \delta$, 那么

$$\abs{(3x - 1) - 5} = 3\abs{x - 2} < 3\delta = \varepsilon.$$

所以每个挑战都被满足，且 $\lim_{x\to2}(3x - 1) = 5$. 例如，挑战 $\varepsilon = 0.3$ 被 $\delta = 0.1$ 满足：如果 $x$ 在 2 的 0.1 范围内，那么 $3x - 1$ 在 5 的 0.3 范围内。

```check
xr = symbols('x', real=True); ep = symbols('epsilon', positive=True)
steps(Abs((3*xr - 1) - 5), Abs(3*xr - 6), 3*Abs(xr - 2))
same(solveset(3*Abs(xr - 2) < ep, xr, S.Reals), Interval.open(2 - ep/3, 2 + ep/3))
same(3*(ep/3), ep); same(Rational(3, 10)/3, Rational(1, 10))
```
:::

相同的论证证明了 $\lim_{x\to a}(mx + b) = ma + b$ 对于每条斜率为 $m \ne 0$ 的直线都成立：由于 $\abs{(mx + b) - (ma + b)} = \abs{m}\,\abs{x - a}$，响应 $\delta = \varepsilon/\abs{m}$ 赢得。如果 $m = 0$，函数是常数 $b$，$\abs{f(x) - b} = 0 < \varepsilon$ 对于每个 $x$，每个 $\delta$ 都赢得。结合 $m = 0$ 和 $b = c$，以及 $m = 1$ 和 $b = 0$，这证明了第 2.4 节的两个基本极限 $\lim_{x\to a} c = c$ 和 $\lim_{x\to a} x = a$.

```check
mr, br, ar = symbols('m b a', real=True); mnz = symbols('m', real=True, nonzero=True)
same(Abs((mr*xr + br) - (mr*ar + br)), Abs(mr)*Abs(xr - ar))
same(Abs(mnz)*(ep/Abs(mnz)), ep)
```

::: example 一个关于抛物线的 ε–δ 证明
证明 $\lim_{x\to3} x^2 = 9$。

*草稿.* $\abs{x^2 - 9} = \abs{x - 3}\,\abs{x + 3}$. 这个因子 $\abs{x - 3}$ 可以小到你想要的程度；这个因子 $\abs{x + 3}$ 并不是常数，但当 $x$ 接近 3 时它并不大。因此事先约定取 $\delta \le 1$。那么 $\abs{x - 3} < 1$ 表示 $2 < x < 4$，因此 $5 < x + 3 < 7$ 和 $\abs{x + 3} < 7$。这样，$\abs{x^2 - 9} < 7\abs{x - 3}$，当 $\abs{x - 3} < \varepsilon/7$ 时它小于 $\varepsilon$。如果 $\delta$ 是 1 和 $\varepsilon/7$ 中的较小者，即 $\delta = \min(1, \varepsilon/7)$，那么这两个条件都成立。

*证明.* 设 $\varepsilon > 0$ 和 $\delta = \min(1, \varepsilon/7)$。假设 $0 < \abs{x - 3} < \delta$。由于 $\delta \le 1$，$2 < x < 4$，因此 $\abs{x + 3} < 7$。由于 $\delta \le \varepsilon/7$，$\abs{x - 3} < \varepsilon/7$。因此

$$\abs{x^2 - 9} = \abs{x + 3}\,\abs{x - 3} < 7 \cdot \frac{\varepsilon}{7} = \varepsilon.$$

对于挑战 $\varepsilon = 0.5$，证明给出 $\delta = \min(1, \tfrac{0.5}{7}) = \tfrac{1}{14} \approx 0.0714$。这并不是最大的 $\delta$ 能够获胜：当 $x < \sqrt{9.5} \approx 3.0822$ 时为 $x^2 < 9.5$，当 $x > \sqrt{8.5} \approx 2.9155$ 时为 $x^2 > 8.5$，因此每个 $\delta$ 直到 $\sqrt{9.5} - 3 \approx 0.0822$ 都能获胜。一个证明不需要最好的 $\delta$，只需要一个能够获胜的。

```check
same(expand((x - 3)*(x + 3)), x**2 - 9)
same(solveset(Abs(xr - 3) < 1, xr, S.Reals), Interval.open(2, 4))
same(Min(1, Rational(1, 2)/7), Rational(1, 14)); rounds(Rational(1, 14), '0.0714')
rounds(sqrt(Rational(19, 2)), '3.0822'); rounds(sqrt(Rational(17, 2)), '2.9155'); rounds(sqrt(Rational(19, 2)) - 3, '0.0822')
holds(sqrt(Rational(19, 2)) - 3 < 3 - sqrt(Rational(17, 2)))      # the right-hand side is the tighter one
holds(Rational(1, 14) < sqrt(Rational(19, 2)) - 3)
dd = symbols('d', positive=True)
same(expand((3 + dd)**2 - 9), 6*dd + dd**2); holds(6*Rational(1, 14) + Rational(1, 14)**2 < Rational(1, 2))
```
:::

### 证明一个极限不存在 {#no-limit-proof}

当挑战者有必胜策略时，$\lim_{x\to a} f(x) = L$ 不成立。即存在一个 $\varepsilon > 0$，使得对每个 $\delta > 0$ 都能找到某个满足 $0 < \abs{x - a} < \delta$ 的 $x$，且 $\abs{f(x) - L} \ge \varepsilon$。要证明极限不存在，需要对每个数 $L$ 都证明这一点。主要工具是**三角不等式**：

$$\abs{p + q} \le \abs{p} + \abs{q},$$

对于所有实数 $p$ 和 $q$。它成立是因为 $-\abs{p} \le p \le \abs{p}$ 和 $-\abs{q} \le q \le \abs{q}$；相加得到 $-\big(\abs{p} + \abs{q}\big) \le p + q \le \abs{p} + \abs{q}$，这说明 $\abs{p + q} \le \abs{p} + \abs{q}$。

```check
pr_, qr_ = symbols('p q', real=True)
same((Abs(pr_) + Abs(qr_))**2 - (pr_ + qr_)**2, 2*(Abs(pr_*qr_) - pr_*qr_))
for p_, q_ in ((3, -5), (-2, -7), (4, 6), (0, -1), (Rational(1, 2), -Rational(3, 4))):
    holds(Abs(p_ + q_) <= Abs(p_) + Abs(q_)); holds(Abs(p_*q_) >= p_*q_)
```

::: example 证明一个极限不存在
证明 $\dfrac{\abs{x}}{x}$ 在 0 处没有极限。

设 $L$ 为任意数。挑战者指定 $\varepsilon = 1$；令 $\delta > 0$ 为任意回应。点 $x = \delta/2$ 和 $x = -\delta/2$ 都满足 $0 < \abs{x} < \delta$，并且 $f(\delta/2) = 1$ 而 $f(-\delta/2) = -1$（例 2.2）。如果这两个值都在 $L$ 的 1 之内，三角不等式将给出

$$\begin{aligned} 2 &= \abs{1 - (-1)} = \abs{(1 - L) + (L + 1)} \\ &\le \abs{1 - L} + \abs{L + 1} < 1 + 1 = 2, \end{aligned}$$

这是不可能的。因此，这两个点中至少有一个位于 $L - 1 < y < L + 1$ 之外，$\delta$ 失败。由于 $\delta$ 是任意回应，$L$ 是任意数，因此没有数是 $\abs{x}/x$ 在 0 处的极限。

```check
Lsym = symbols('L', real=True)
same((1 - Lsym) + (Lsym + 1), 2); same(Abs(1 - (-1)), 2)
dp = symbols('delta', positive=True)
same(Abs(dp/2)/(dp/2), 1); same(Abs(-dp/2)/(-dp/2), -1); holds(dp/2 < dp)
```
:::

使用例2.3中的点，可以证明 $\sin(1/x)$ 在0处没有极限（练习2.10）。它还表明，当极限存在时，它是一个单一的数。假设 $f(x)$ 趋向于 $L$ 且趋向于 $M \ne L$，并用 $\varepsilon = \abs{L - M}/2$ 挑战这两个极限。对于足够接近 $a$ 的 $x \ne a$，两个 $\abs{f(x) - L} < \varepsilon$ 和 $\abs{f(x) - M} < \varepsilon$ 都成立，然后通过三角不等式，

$$\begin{aligned} \abs{L - M} &= \abs{\big(L - f(x)\big) + \big(f(x) - M\big)} \\ &\le \abs{L - f(x)} + \abs{f(x) - M} \\ &< \varepsilon + \varepsilon = \abs{L - M}, \end{aligned}$$

这是不可能的。精确的定义也证明了第2.2节的核心思想：

```check
LL, MM, FF = symbols('L M F', real=True)
same((LL - FF) + (FF - MM), LL - MM)
same(Abs(LL - MM)/2 + Abs(LL - MM)/2, Abs(LL - MM))
same(Intersection(solveset(Abs(FF - 1) < 1, FF, S.Reals), solveset(Abs(FF - 3) < 1, FF, S.Reals)), S.EmptySet)   # L = 1, M = 3, eps = 1: no value is within eps of both
```

::: theorem 单侧极限和双侧极限
$\lim_{x\to a} f(x) = L$ 当且仅当 $\lim_{x\to a^-} f(x) = L$ 和 $\lim_{x\to a^+} f(x) = L$。
:::

::: proof
假设 $\lim_{x\to a} f(x) = L$，并令 $\varepsilon > 0$。一个 $\delta$ 如果对两边极限成立，则对每个单侧极限也成立，因为 $a - \delta < x < a$ 和 $a < x < a + \delta$ 都蕴含 $0 < \abs{x - a} < \delta$。反之，假设两个单侧极限都是 $L$，并令 $\varepsilon > 0$。存在一个 $\delta_1 > 0$ 对 $x$ 与 $a - \delta_1 < x < a$ 成立，且存在一个 $\delta_2 > 0$ 对 $x$ 与 $a < x < a + \delta_2$ 成立。令 $\delta = \min(\delta_1, \delta_2)$。每一个 $x$ 与 $0 < \abs{x - a} < \delta$ 满足 $a - \delta_1 < x < a$ 或 $a < x < a + \delta_2$，因此 $\abs{f(x) - L} < \varepsilon$。
:::

::: pitfall
词语的顺序很重要。"对于每一个 $\varepsilon$ 存在一个 $\delta$" 允许 $\delta$ 依赖于 $\varepsilon$。"存在一个 $\delta$ 对每一个 $\varepsilon$ 成立" 表示更多：此时 $\abs{f(x) - L}$ 小于每一个正数，因此 $f(x) = L$ 对每一个 $x$ 与 $0 < \abs{x - a} < \delta$ 成立。赢得一轮并不能证明什么：$\delta = 0.1$ 在 $\varepsilon = 0.3$ 处对 $3x - 1$ 回答 2，但一个证明必须对每一个 $\varepsilon$ 回答，正如 $\delta = \varepsilon/3$ 所做的那样。
:::

::: deeper 夹逼定理和极限法则的证明
第一次阅读可以跳过这个框。在每个证明中，$\varepsilon > 0$ 是一个挑战，任务是找到一个获胜的 $\delta$。

**夹逼定理。** 假设 $g(x) \le f(x) \le h(x)$ 对于 $x \ne a$ 在包含 $a$ 的开区间内成立，并且 $g(x) \to L$ 和 $h(x) \to L$。选择 $\delta > 0$ 足够小，使得 $(a - \delta, a + \delta)$ 位于该区间内，并且 $\abs{g(x) - L} < \varepsilon$ 和 $\abs{h(x) - L} < \varepsilon$ 对于 $0 < \abs{x - a} < \delta$ 成立（三个 $\delta$ 中最小的那个将起作用）。对于这样的 $x$，

$$L - \varepsilon < g(x) \le f(x) \le h(x) < L + \varepsilon,$$

所以 $\abs{f(x) - L} < \varepsilon$。

从这里开始，$\lim_{x\to a} f(x) = L$ 和 $\lim_{x\to a} g(x) = M$。

**和积法则。** 挑战 $f$ 与 $\varepsilon/2$：存在一个 $\delta_1 > 0$，使得 $\abs{f(x) - L} < \varepsilon/2$ 每当 $0 < \abs{x - a} < \delta_1$ 时成立。同样地，存在一个 $\delta_2 > 0$ 对于 $g$。令 $\delta = \min(\delta_1, \delta_2)$。如果 $0 < \abs{x - a} < \delta$，两个不等式都成立，并且通过三角不等式

$$\begin{aligned} &\abs{\big(f(x) + g(x)\big) - (L + M)} \\ &\quad\le \abs{f(x) - L} + \abs{g(x) - M} \\ &\quad< \frac{\varepsilon}{2} + \frac{\varepsilon}{2} = \varepsilon. \end{aligned}$$

**乘积法则。** 首先， $g$ 在 $a$ 附近保持有界：挑战 1 给出一个 $\delta_0 > 0$ 使得 $\abs{g(x) - M} < 1$，因此 $\abs{g(x)} < \abs{M} + 1$，对于 $0 < \abs{x - a} < \delta_0$。接下来，

$$\begin{aligned} &f(x)g(x) - LM \\ &\quad= \big(f(x) - L\big)g(x) + L\big(g(x) - M\big), \end{aligned}$$

所以，根据三角不等式，对于那些 $x$

$$\begin{aligned} &\abs{f(x)g(x) - LM} \\ &\quad\le \abs{f(x) - L}\big(\abs{M} + 1\big) \\ &\qquad + \abs{L}\,\abs{g(x) - M}. \end{aligned}$$

现在选择 $\delta \le \delta_0$ 足够小，使得 $\abs{f(x) - L} < \dfrac{\varepsilon}{2(\abs{M} + 1)}$ 和 $\abs{g(x) - M} < \dfrac{\varepsilon}{2(\abs{L} + 1)}$ 对于 $0 < \abs{x - a} < \delta$。然后

$$\begin{aligned} \abs{f(x)g(x) - LM} &< \frac{\varepsilon}{2} + \frac{\abs{L}}{\abs{L} + 1}\cdot\frac{\varepsilon}{2} \\ &< \frac{\varepsilon}{2} + \frac{\varepsilon}{2} = \varepsilon. \end{aligned}$$

**商法则。** 由于 $f/g = f \cdot (1/g)$，乘积法则将此简化为 $\lim_{x\to a} 1/g(x) = 1/M$，对于 $M \ne 0$。挑战 $\abs{M}/2$ 给出了一个 $\delta_0 > 0$，其中 $\abs{g(x) - M} < \abs{M}/2$ 对于 $0 < \abs{x - a} < \delta_0$。对于那些 $x$，三角不等式 $\abs{M} \le \abs{M - g(x)} + \abs{g(x)}$ 给出 $\abs{g(x)} > \abs{M}/2$；特别是 $g(x) \ne 0$，因此 $1/g(x)$ 是定义的，并且

$$\begin{aligned} \abs{\frac{1}{g(x)} - \frac1M} &= \frac{\abs{M - g(x)}}{\abs{g(x)}\,\abs{M}} \\ &\le \frac{2}{\abs{M}^2}\,\abs{g(x) - M}. \end{aligned}$$

选择 $\delta \le \delta_0$ 足够小，使得 $\abs{g(x) - M} < \tfrac12\varepsilon\abs{M}^2$ 对于 $0 < \abs{x - a} < \delta$；然后 $\abs{1/g(x) - 1/M} < \varepsilon$。

```check
fS, gS, LS, MS = symbols('f g L M')
same(fS*gS - LS*MS, (fS - LS)*gS + LS*(gS - MS))
same(1/gS - 1/MS, (MS - gS)/(gS*MS))
same(ep/(2*(Abs(MS) + 1))*(Abs(MS) + 1), ep/2)
LN = symbols('L', nonnegative=True)
holds(ep/2 - LN/(LN + 1)*ep/2 > 0)
MP = symbols('M', positive=True)
same(2/MP**2*(ep*MP**2/2), ep); same(MP - MP/2, MP/2)
```
:::

## 计算机上的极限 {#computer}

### 测试一个 δ {#testing-delta}

第 2.7 节的探索者决定一个 $\delta$ 是否获胜，通过在带状区域的成千上万个点上计算 $f$。同样的测试用几行 Python 代码和 NumPy 即可实现。

::: compute 在许多点上测试一个 δ
函数 `wins` 在许多满足 $0 < \abs{x - a} < \delta$ 的点 $x$ 上检查 $\abs{f(x) - L} < \varepsilon$。这里针对挑战 $\varepsilon = 0.5$ 检验例 2.13 的抛物线：

```python
import numpy as np

def wins(f, a, L, eps, delta, n=200_000):
    # n points strictly inside (a - delta, a + delta), none of them equal to a
    xs = a + delta*np.linspace(-1, 1, n + 2)[1:-1]
    xs = xs[xs != a]
    return bool(np.all(np.abs(f(xs) - L) < eps))

for delta in [0.1, 0.0825, 0.082, 1/14]:
    print(f"delta = {delta:.4f}: {wins(lambda x: x**2, 3, 9, 0.5, delta)}")
```

```output
delta = 0.1000: False
delta = 0.0825: False
delta = 0.0820: True
delta = 0.0714: True
```

该测试与例 2.13 一致：证明中的 $\delta = \tfrac{1}{14} \approx 0.0714$ 赢得胜利，最佳 $\delta$ 值介于 0.082 和 0.0825 之间；它为 $\sqrt{9.5} - 3 \approx 0.0822$。但计算机测试，如同表格，一次只检查有限多个点和一个 $\varepsilon$，因此它只能提供证据，而非证明：像 $\sin(1/x)$ 这样的函数可能在被测试的点之间表现出不良行为。例 2.13 的证明同时覆盖了所有 $x$ 和所有 $\varepsilon$。
:::

```check
holds(Rational(82, 1000) < sqrt(Rational(19, 2)) - 3); holds(sqrt(Rational(19, 2)) - 3 < Rational(825, 10000))
holds(Rational(1, 14) < Rational(82, 1000)); rounds(Rational(1, 14), '0.0714'); rounds(sqrt(Rational(19, 2)) - 3, '0.0822')
import numpy as np
def wins_(f_, a_, L_, eps_, d_, n_=200_000):
    xs_ = a_ + d_*np.linspace(-1, 1, n_ + 2)[1:-1]; xs_ = xs_[xs_ != a_]
    return bool(np.all(np.abs(f_(xs_) - L_) < eps_))
same([wins_(lambda q: q**2, 3, 9, 0.5, d_) for d_ in (0.1, 0.0825, 0.082, 1/14)], [False, False, True, True])
```

### 消去 {#cancellation}

在模块 1 结束时，Python 计算出自由下落物体在 $[1, 1.001]$ 期间的平均速度为 9.804899999998895，其中精确值为 9.8049，而该级数承诺会给出解释。计算机将实数存储为 **浮点数**：以二进制形式存储，四舍五入到大约 16 位有效十进制数字。因此，几乎每个数都被存储为略微错误的值，通常是在第 16 位（甚至像 4.9 这样的数也没有精确的二进制表示）。这种误差在两个几乎相等的数相减时才变得有害。这里 $s(1.001) = 4.9098049$ 和 $s(1) = 4.9$ 在前三位数字上一致；在它们的差值 0.0098049 中，这些数字被抵消了，而原本在 $s(1.001)$ 的第 16 位的舍入误差现在出现在结果的第 13 位。除以 $h = 0.001$ 并不能修复这些误差。当两个几乎相等的数相减时，导致精度损失的现象称为 **消去误差**。两个数越接近，被抵消的位数越多：两个在前 $k$ 位上一致的数相减，会损失大约 $k$ 位的精度。

```check
holds(Rational(4.9) != Rational(49, 10)); holds(abs(Rational(4.9) - Rational(49, 10)) < Rational(49, 10)/10**15)   # 4.9 is stored slightly wrong, in about the 16th digit
same(Rational(49, 10)*Rational(1001, 1000)**2, Rational(49098049, 10**7))
same(Rational(49098049, 10**7) - Rational(49, 10), Rational(98049, 10**7)); same(Rational(98049, 10**7)/Rational(1, 1000), Rational(98049, 10**4))
s_ = lambda T: 4.9*T**2
holds((s_(1 + 1e-3) - s_(1))/1e-3 == 9.804899999998895)
holds(abs((s_(1 + 1e-3) - s_(1))/1e-3 - 9.8049) < 1e-11); holds(abs((s_(1 + 1e-3) - s_(1))/1e-3 - 9.8049) > 1e-13)
```

::: compute 浮点数中的消去
首先是一个下落的球体，其$h$收缩程度比模块1中更为剧烈：

```python
def s(t):
    return 4.9*t**2

for h in [1e-3, 1e-6, 1e-9, 1e-12, 1e-15]:
    print(h, (s(1 + h) - s(1))/h)
```

```output
0.001 9.804899999998895
1e-06 9.80000490002908
1e-09 9.800000810855636
1e-12 9.801048861390882
1e-15 10.658141036401503
```

精确的值是$9.8 + 4.9h$：9.8049，9.8000049，9.8000000049，依此类推。随着$h$收缩，$s(1 + h)$和$s(1)$共享更多位数，更多的数字被抵消，误差也随之增大，从大约$10^{-12}$在$h = 10^{-3}$时，到大约$10^{-3}$在$h = 10^{-12}$时；在$h = 10^{-15}$时，答案变为10.66而不是9.8。更小的$h$有助于公式，但会损害计算，模块4找到了最佳的折中方案。

现在是$\dfrac{1 - \cos x}{x^2}$，其在0处的极限是$\tfrac12$，如下文所示。第二列从重新排列的公式计算相同的函数：

```python
import math
for k in range(1, 10):
    x = 10.0**(-k)
    direct = (1 - math.cos(x))/x**2
    rearranged = (math.sin(x)/x)**2/(1 + math.cos(x))
    print(f"x = {x:.0e}:  {direct:.12f}  {rearranged:.12f}")
```

```output
x = 1e-01:  0.499583472197  0.499583472197
x = 1e-02:  0.499995833347  0.499995833347
x = 1e-03:  0.499999958326  0.499999958333
x = 1e-04:  0.499999996961  0.499999999583
x = 1e-05:  0.500000041370  0.499999999996
x = 1e-06:  0.500044450291  0.500000000000
x = 1e-07:  0.499600361081  0.500000000000
x = 1e-08:  0.000000000000  0.500000000000
x = 1e-09:  0.000000000000  0.500000000000
```

两列在$x = 0.1$和$x = 0.01$时一致。然后直接公式开始偏离：在$x = 10^{-6}$时，误差大约为$4 \times 10^{-5}$，从$x = 10^{-8}$开始它给出0，这是一个完全错误的答案。原因如下：

```python
print(math.cos(1e-8), math.cos(1e-8) == 1)
```

```output
1.0 True
```

$\cos(10^{-8}) = 1 - 5 \times 10^{-17} + \dots$ 比任何其他浮点数更接近 1，因此计算机存储的是精确的 1，而 $1 - \cos x$ 输出为 0：每一位数字都相互抵消了。重新排列的公式来源于定理 2.6 的证明。将分子和分母同时乘以 $1 + \cos x$，它在 $\abs{x} < \pi$ 时为正。对于 $0 < \abs{x} < \pi$，

$$\begin{aligned} \frac{1 - \cos x}{x^2} &= \frac{1 - \cos^2 x}{x^2(1 + \cos x)} \\ &= \Big(\frac{\sin x}{x}\Big)^2\cdot\frac{1}{1 + \cos x}. \end{aligned}$$

该公式并未减去任何内容，且其输出的每一位数字都是正确的。它还给出了极限：根据定理 2.5 和例 2.10，它趋近于 $1^2 \cdot \tfrac12 = \tfrac12$。
:::

```check
import math
err_ = lambda h_: abs((s_(1 + h_) - s_(1))/h_ - (9.8 + 4.9*h_))       # error of the computed average speed
holds(5e-13 < err_(1e-3) < 5e-12); holds(5e-4 < err_(1e-12) < 5e-3)     # "about 1e-12" and "about 1e-3"
rounds((s_(1 + 1e-15) - s_(1))/1e-15, '10.66')
steps((1 - cos(x))/x**2, (1 - cos(x)**2)/(x**2*(1 + cos(x))), (sin(x)/x)**2*(1/(1 + cos(x))))
for v in [Rational(j, 10) for j in range(-31, 32)]:
    holds(1 + cos(v) > 0)                                               # positive for |x| < pi
same(1 + cos(pi), 0); same(1 + cos(-pi), 0)                             # but 0 at x = pi and -pi
limit_is((1 - cos(x))/x**2, x, 0, Rational(1, 2))
for j in range(1, 10):
    xf = 10.0**(-j); xq = Rational(1, 10**j)
    exact_ = (1 - cos(xq))/xq**2
    rounds(exact_, f"{(math.sin(xf)/xf)**2/(1 + math.cos(xf)):.12f}")        # every printed digit is right
    if j <= 2:
        holds(f"{(1 - math.cos(xf))/xf**2:.12f}" == f"{(math.sin(xf)/xf)**2/(1 + math.cos(xf)):.12f}")
rounds(((1 - math.cos(1e-6))/1e-6**2 - Rational(1, 2))*10**5, '4')
holds((1 - math.cos(1e-8))/1e-8**2 == 0.0); holds((1 - math.cos(1e-9))/1e-9**2 == 0.0)
same(series(cos(x), x, 0, 4).removeO(), 1 - x**2/2); same((x**2/2).subs(x, Rational(1, 10**8)), Rational(5, 10**17))
holds(Rational(5, 10**17) < Rational(1, 2**54))                  # less than half the gap 2^-53 below 1
```

练习 2.11 提供了另一个会欺骗计算机的公式及其解决方法。

### 使用 SymPy 计算极限 {#sympy}

::: compute 使用 SymPy 计算极限
SymPy 用 `sp.limit(f, x, a, '+-')` 精确计算极限。它的参数是表达式、变量、点和侧边：`'+-'` 要求的是定义 2.1 中的双边极限，$x$ 从两侧趋近于 $a$。

```python
import sympy as sp
x = sp.symbols('x')
print(sp.limit((x**2 - 1)/(x - 1), x, 1, '+-'))
print(sp.limit((sp.sqrt(x + 9) - 3)/x, x, 0, '+-'))
print(sp.limit(sp.sin(x)/x, x, 0, '+-'))
print(sp.limit((1 - sp.cos(x))/x**2, x, 0, '+-'))
```

```output
2
1/6
1
1/2
```

这些是第2.1节，例2.7，定理2.5以及上面的框中的极限，它们是精确的：`1/6`，不是0.1666…。对于单侧极限，写`'-'`（从左侧）或`'+'`（从右侧）代替。省略侧边，会发生一些令人惊讶的事情：

```python
f = sp.Abs(x)/x
print(sp.limit(f, x, 0, '-'), sp.limit(f, x, 0, '+'))
print(sp.limit(f, x, 0))
```

```output
-1 1
1
```

看第二行：没有第四个参数时，SymPy计算的是右侧极限，并且没有提及左侧。两侧极限不存在，并且使用`'+-'`时，SymPy会说明这一点：

```python fails
print(sp.limit(f, x, 0, '+-'))
```

```output
ValueError: The limit does not exist since left hand limit = -1 and right hand limit = 1
```

SymPy解释了为什么极限不存在。对于另外两种失败的方式，它描述了值的行为：

```python
print(sp.limit(1/x**2, x, 0, '+-'))
print(sp.limit(sp.sin(1/x), x, 0, '+-'))
```

```output
oo
AccumBounds(-1, 1)
```

`oo`，两个字母o，是SymPy的$\infty$（`sp.oo`在程序中）：$1/x^2$的值会超过每一个界限，模块 3将其写为$\lim_{x\to0} 1/x^2 = \infty$的爆炸。`AccumBounds(-1, 1)`，即“积累界限”，表示在0附近，$\sin(1/x)$的值在$-1$和1之间不断摆动而无法稳定：即例2.3中的振荡。这两种情况都不符合定义2.1中的极限意义。
:::

```check
same(limit(Abs(x)/x, x, 0), 1); same(limit(Abs(x)/x, x, 0, '-'), -1)       # without a direction, SymPy goes from the right
limit_is((x**2 - 1)/(x - 1), x, 1, 2); limit_is((sqrt(x + 9) - 3)/x, x, 0, Rational(1, 6))   # the four two-sided limits printed
limit_is(sin(x)/x, x, 0, 1); limit_is((1 - cos(x))/x**2, x, 0, Rational(1, 2))
same(limit(1/x**2, x, 0, '+-'), oo)
```

::: pitfall
`sp.limit(f, x, a)` 是一个单侧极限：如果没有第四个参数，SymPy 默认从右侧趋近。因此 `sp.limit(sp.Abs(x)/x, x, 0)` 给出 1，`sp.limit(1/x, x, 0)` 给出 `oo`，尽管这两个函数在 0 处都没有极限：$\abs{x}/x$ 在那里跳跃，而 $1/x$ 在 0 的右侧极大正数，左侧极大负数。当你想表示定义 2.1 中的极限时，应使用 `'+-'`；对于 $1/x$，SymPy 则返回 `zoo`，这是它表示无限值但无确定符号的符号。

```check
same(limit(Abs(x)/x, x, 0), 1); same(limit(1/x, x, 0), oo); same(limit(1/x, x, 0, '-'), -oo)
same(limit(1/x, x, 0, '+-'), zoo)
```
:::

## 你所学到的内容 {#summary}

- $\lim_{x\to a} f(x) = L$ 表示，通过让 $x$ 足够接近 $a$（但不等于 $a$），可以使 $f(x)$ 任意接近 $L$。如果存在，$f(a)$ 的值并不起作用。
- 表格和图像可以提示极限，但可能产生误导；代数和证明可以确认极限。
- 单侧极限 $x \to a^-$ 和 $x \to a^+$ 仅考虑一侧。极限存在的条件是当且仅当两个单侧极限都存在且相等。
- 极限可能因跳跃、无穷大或震荡而不存在。
- 极限法则给出了和、差、常数倍、积、商（当分母的极限不为0时）、幂和根的极限。对于多项式，以及分母在 $a$ 处不为0的有理函数，极限是直接代入的值。
- $0/0$ 是一个不确定形式，提示需要做更多工作：因式分解并约分，用共轭有理化，或合并分数，然后代入。
- 夹逼定理将一个函数夹在两个具有相同极限的函数之间。在单位圆的面积中，它证明了 $\lim_{\theta\to0}\dfrac{\sin\theta}{\theta} = 1$ 和 $\lim_{\theta\to0}\dfrac{1 - \cos\theta}{\theta} = 0$，其中 $\theta$ 以弧度为单位。
- 精确地说，$\lim_{x\to a} f(x) = L$ 表示对于每一个 $\varepsilon > 0$，存在一个 $\delta > 0$，使得 $0 < \abs{x - a} < \delta$ 推出 $\abs{f(x) - L} < \varepsilon$。一个证明是一个规则，将任何 $\varepsilon$ 转换为一个成功的 $\delta$；要反驳一个极限，找到一个 $\varepsilon$，使得没有 $\delta$ 能够回答。
- 浮点数保留大约16位有效数字，相减几乎相等的数会丢失这些数字：抵消误差。重新排列公式可以避免这种情况。SymPy 的 `sp.limit` 可以精确计算极限；如果没有第四个参数，它计算的是右边的极限，因此要写 `'+-'` 来得到双边极限。

## 练习 {#exercises}

:::: exercise 阅读分段函数 {#ex-2-1} ★
设

$$f(x) = \begin{cases} 2x + 1 & \text{if } x < 1, \\ 5 & \text{if } x = 1, \\ 4 - x^2 & \text{if } x > 1. \end{cases}$$

- (a) 求 $\lim_{x\to1^-} f(x)$ 和 $\lim_{x\to1^+} f(x)$。$\lim_{x\to1} f(x)$ 是否存在？
- (b) 在 1 处的极限是否等于 $f(1)$？描述 $x = 1$ 附近的图像。
- (c) 求 $\lim_{x\to-2} f(x)$ 和 $\lim_{x\to2} f(x)$。

::: solution
**(a)** 在 1 的左侧，$f(x) = 2x + 1$，其趋近于 $2 \cdot 1 + 1 = 3$（定理 2.3 对一侧，以及线性公式中的直接代入）。在右侧，$f(x) = 4 - x^2$，其趋近于 $4 - 1 = 3$。两个单侧极限都是 3，因此 $\lim_{x\to1} f(x) = 3$。

**(b)** 否：$f(1) = 5$，而极限是 3。图像在左侧是直线 $y = 2x + 1$，在右侧是抛物线 $y = 4 - x^2$。它们在 $(1, 3)$ 处相交，该点不在图像上（空心点），图像在 $(1, 5)$ 处有一个实心点，位于空洞之上。极限忽略该点。

**(c)** 在包含 $(-\infty, 1)$ 的开区间 $-2$ 上，$f(x) = 2x + 1$；因此根据定理 2.3 和直接代入，$\lim_{x\to-2} f(x) = 2(-2) + 1 = -3$。在 $(1, \infty)$ 上，包含 2，$f(x) = 4 - x^2$，因此 $\lim_{x\to2} f(x) = 4 - 4 = 0$。

```check
f1e = Piecewise((2*x + 1, x < 1), (5, Eq(x, 1)), (4 - x**2, True))
same(f1e.subs(x, 1 - hp), 2*(1 - hp) + 1); same(f1e.subs(x, 1 + hp), 4 - (1 + hp)**2)
limit_is(2*(1 - hp) + 1, hp, 0, 3, '+'); limit_is(4 - (1 + hp)**2, hp, 0, 3, '+')
same(f1e.subs(x, 1), 5)
same(f1e.subs(x, -2), -3); limit_is(2*x + 1, x, -2, -3)
same(f1e.subs(x, 2), 0); limit_is(4 - x**2, x, 2, 0)
```
:::
::::

:::: exercise 极限法则的应用 {#ex-2-2} ★
假设 $\lim_{x\to a} f(x) = 4$ 和 $\lim_{x\to a} g(x) = -2$。求每个极限，指出你使用的法则，或解释为何法则无法给出该结果。

- (a) $\lim_{x\to a}\big(3f(x) - g(x)\big)$
- (b) $\lim_{x\to a} f(x)\big(g(x)\big)^2$
- (c) $\lim_{x\to a}\dfrac{\sqrt{f(x)}}{g(x)}$
- (d) $\lim_{x\to a}\dfrac{f(x)}{f(x) + 2g(x)}$

::: solution
**(a)** 根据差和常数倍法则，极限是 $3 \cdot 4 - (-2) = 14$。

**(b)** 根据幂法则，$\big(g(x)\big)^2 \to (-2)^2 = 4$；然后根据乘积法则，极限是 $4 \cdot 4 = 16$。

**(c)** 根据根法则（$f$ 的极限是 $4 > 0$），$\sqrt{f(x)} \to \sqrt4 = 2$。分母的极限是 $-2$，不是 0，因此根据商法则，极限是 $2/(-2) = -1$。

**(d)** 分母趋于 $4 + 2(-2) = 0$，因此商法则不适用。事实上这个极限不存在。称商为 $q(x)$。如果 $q(x)$ 有一个极限 $K$，乘积法则将给出 $f(x) = q(x)\big(f(x) + 2g(x)\big) \to K \cdot 0 = 0$；但 $f(x) \to 4$。例如， $f(x) = 4 + x$ 和 $g(x) = -2 + x$ 在 $a = 0$ 处给出 $q(x) = \dfrac{4 + x}{3x}$，它在 0 处发散。

```check
same(3*4 - (-2), 14); same(4*(-2)**2, 16); same(sqrt(4)/(-2), -1); same(4 + 2*(-2), 0)
fx2, gx2 = 4 + x, -2 + x
limit_is(fx2, x, 0, 4); limit_is(gx2, x, 0, -2)
limit_is(3*fx2 - gx2, x, 0, 14); limit_is(fx2*gx2**2, x, 0, 16); limit_is(sqrt(fx2)/gx2, x, 0, -1)
same(fx2 + 2*gx2, 3*x); same(fx2/(fx2 + 2*gx2), (4 + x)/(3*x))
limit_is(fx2/(fx2 + 2*gx2), x, 0, -oo, '-'); limit_is(fx2/(fx2 + 2*gx2), x, 0, oo, '+')
```
:::
::::

:::: exercise 极限是否存在？ {#ex-2-3} ★
求每个极限，或解释为什么不存在。

- (a) $\lim_{x\to2}\dfrac{x^2 + x - 6}{x - 2}$
- (b) $\lim_{x\to0}\dfrac1x$
- (c) $\lim_{x\to0}\cos\dfrac1x$
- (d) $\lim_{x\to0} x^2\cos\dfrac1x$

然后 (e) 从值表中估计 $\lim_{x\to0^+} x^x$。为什么这里只有右边的极限有意义？

::: solution
**(a)** 代入得到 $0/0$。因式分解：$x^2 + x - 6 = (x - 2)(x + 3)$，因此对于 $x \ne 2$，商为 $x + 3$，极限为 $2 + 3 = 5$。

**(b)** 它不存在：出现爆破现象。在 0 的右侧，$1/x$ 是一个非常大的正数 ($1/0.001 = 1000$); 在左侧，它是一个非常大的负数 ($1/(-0.001) = -1000$). 关于 $1/x^2$ 在第 2.3 节中，无论你命名哪个数 $L$，$1/x > \abs{L} + 1$ 对于 $0 < x < 1/(\abs{L} + 1)$，所以接近 0 的地方都有值与 $L$ 相距超过 1：没有数是极限。

**(c)** 它不存在：出现震荡现象。$\cos(1/x) = 1$ 在 $x = 1/(2k\pi)$ 处和 $\cos(1/x) = -1$ 在 $x = 1/\big((2k + 1)\pi\big)$ 处，对于 $k = 1, 2, 3, \dots$，并且这些点可以无限接近 0。如同例 2.3 中那样，值 1 和 $-1$ 相距 2，不能同时都在某个数的 $\tfrac12$ 邻域内。

**(d)** 它是 0，根据夹逼定理：$\abs{\cos(1/x)} \le 1$，因此 $-x^2 \le x^2\cos(1/x) \le x^2$ 对于 $x \ne 0$，并且两个界都趋近于 0。

**(e)** $x^x$ 是一个具有变量指数的幂，需要一个正底数（[第 1.4 节 ](module_01_ZH.html#exponential)）。因此 $x^x$ 对于每一个 $x > 0$ 都有定义，但在 0 左侧的任何区间上都没有定义（例如在 $x = -\tfrac12$ 处，它将是 $1/\sqrt{-1/2}$），只有从右侧的极限才有意义。其在 0 附近的值：

```valuetable
x = 0.1, 0.01, 0.001, 0.0001, 0.00001
$x^x$ = x**x
digits = 6
---
x | x^x
0.1 | 0.794328
0.01 | 0.954993
0.001 | 0.993116
0.0001 | 0.999079
0.00001 | 0.999885
```

这些值趋向于 1，一个合理的猜测是 $\lim_{x\to0^+} x^x = 1$。它们上升得缓慢：在 $x = 0.1$ 处，值仍然低于 0.8，因此只有非常接近 0 的值才能显示出它们的趋向。表格不能证明这个猜测；模块 7 会证明。

```check
same(factor(x**2 + x - 6), (x - 2)*(x + 3)); same(cancel((x**2 + x - 6)/(x - 2)), x + 3)
limit_is((x**2 + x - 6)/(x - 2), x, 2, 5)
same(1/Rational(1, 1000), 1000); same(1/Rational(-1, 1000), -1000)
limit_is(1/x, x, 0, oo, '+'); limit_is(1/x, x, 0, -oo, '-')
for Lv_ in (-3, 0, Rational(5, 2), 100):
    X_ = Rational(1, 2*(abs(Lv_) + 1))            # an x with 0 < x < 1/(|L| + 1)
    holds(X_ < Rational(1, abs(Lv_) + 1)); holds(1/X_ > abs(Lv_) + 1); holds(1/X_ - Lv_ > 1)
same(Rational(-1, 2)**Rational(-1, 2), 1/sqrt(Rational(-1, 2))); holds((1/sqrt(Rational(-1, 2))).is_real == False)
limit_is(x**x, x, 0, 1, '+'); holds(Rational(1, 10)**Rational(1, 10) < Rational(8, 10))
kp = symbols('k', integer=True, positive=True)
same(cos(1/(1/(2*kp*pi))), 1); same(cos(1/(1/((2*kp + 1)*pi))), -1)
same(limit(cos(1/x), x, 0, '+-'), AccumBounds(-1, 1))
limit_is(x**2, x, 0, 0); limit_is(-x**2, x, 0, 0); limit_is(x**2*cos(1/x), x, 0, 0)
```
:::
::::

:::: exercise 三种代数技巧 {#ex-2-4} ★★
求每个极限，展示代数过程。

- (a) $\lim_{x\to-2}\dfrac{x^2 + 5x + 6}{x^2 - 4}$
- (b) $\lim_{x\to9}\dfrac{x - 9}{\sqrt x - 3}$
- (c) $\lim_{h\to0}\dfrac{1}{h}\Big(\dfrac{1}{(1 + h)^2} - 1\Big)$

::: solution
**(a)** 在 $x = -2$ 处，分子是 $4 - 10 + 6 = 0$，分母是 $4 - 4 = 0$。因式分解：$x^2 + 5x + 6 = (x + 2)(x + 3)$ 和 $x^2 - 4 = (x + 2)(x - 2)$。对于 $x \ne -2$（以及 $x \ne 2$），

$$\begin{aligned} \frac{x^2 + 5x + 6}{x^2 - 4} &= \frac{x + 3}{x - 2} \\ &\to \frac{-2 + 3}{-2 - 2} = -\frac14. \end{aligned}$$

**(b)** 替换得到 $0/0$。将分子和分母乘以共轭 $\sqrt x + 3$，或者注意到对于 $x \ge 0$，$x - 9 = \big(\sqrt x - 3\big)\big(\sqrt x + 3\big)$。无论哪种方式，对于 $x \ge 0$ 中的 $x \ne 9$，

$$\begin{aligned} \frac{x - 9}{\sqrt x - 3} &= \sqrt x + 3 \\ &\to \sqrt9 + 3 = 6 \end{aligned}$$

根据根与和的法则。

**(c)** 替换得到 $0/0$。将括号放在公共分母 $(1 + h)^2$ 上并展开：

$$\begin{aligned} \frac{1}{(1 + h)^2} - 1 &= \frac{1 - (1 + h)^2}{(1 + h)^2} \\ &= \frac{-2h - h^2}{(1 + h)^2} \\ &= \frac{-h(2 + h)}{(1 + h)^2}. \end{aligned}$$

因此，对于 $h \ne 0$（和 $h \ne -1$），

$$\begin{aligned} \frac{1}{h}\Big(\frac{1}{(1 + h)^2} - 1\Big) &= -\frac{2 + h}{(1 + h)^2} \\ &\to -\frac{2}{1} = -2. \end{aligned}$$

这是 $1/x^2$ 在 $x = 1$ 处的变化率。

```check
same((x**2 + 5*x + 6).subs(x, -2), 0); same((x**2 - 4).subs(x, -2), 0)
same(factor(x**2 + 5*x + 6), (x + 2)*(x + 3)); same(factor(x**2 - 4), (x + 2)*(x - 2))
same(cancel((x**2 + 5*x + 6)/(x**2 - 4)), (x + 3)/(x - 2)); limit_is((x**2 + 5*x + 6)/(x**2 - 4), x, -2, -Rational(1, 4))
xnn = symbols('x', nonnegative=True)
same(expand((sqrt(xnn) - 3)*(sqrt(xnn) + 3)), xnn - 9); same(sqrt(9) + 3, 6)
limit_is((x - 9)/(sqrt(x) - 3), x, 9, 6)
steps(1/(1 + h)**2 - 1, (1 - (1 + h)**2)/(1 + h)**2, (-2*h - h**2)/(1 + h)**2, -h*(2 + h)/(1 + h)**2)
same(cancel((1/(1 + h)**2 - 1)/h), -(2 + h)/(1 + h)**2)
limit_is((1/(1 + h)**2 - 1)/h, h, 0, -2)
same((1/(1 + h)**2 - 1)/h, ((1/x**2).subs(x, 1 + h) - (1/x**2).subs(x, 1))/h)   # the difference quotient of 1/x^2 at 1
```
:::
::::

:::: exercise 三角函数极限 {#ex-2-5} ★★
以 $x$ 弧度为单位，求

- (a) $\lim_{x\to0}\dfrac{\sin 5x}{2x}$
- (b) $\lim_{x\to0}\dfrac{\sin 3x}{\sin 2x}$
- (c) $\lim_{x\to0}\dfrac{1 - \cos x}{x\sin x}$

::: solution
**(a)** 使角度出现在下方：$\dfrac{\sin 5x}{2x} = \dfrac52\cdot\dfrac{\sin 5x}{5x}$。如例 2.11 所示，$\dfrac{\sin 5x}{5x} \to 1$，因此极限是 $\dfrac52$。

**(b)** 将分子和分母都除以 $x$，并将两者按 (a) 的方式整理：

$$\begin{aligned} \frac{\sin 3x}{\sin 2x} &= \frac{\dfrac{\sin 3x}{x}}{\dfrac{\sin 2x}{x}} = \frac{3\cdot\dfrac{\sin 3x}{3x}}{2\cdot\dfrac{\sin 2x}{2x}} \\ &\to \frac{3 \cdot 1}{2 \cdot 1} = \frac32, \end{aligned}$$

根据商法则，因为分母的极限为 2（不为 0）。一个常见的错误答案是 1，来源于这样的想法：两个都趋于 0 的量的商趋于 1：这就是第 2.5 节中的 $0/0$ 错误。

**(c)** 将分子和分母都乘以 $1 + \cos x$，如定理 2.6 的证明所示。对于 $0 < \abs{x} < \pi/2$，其中 $\sin x \ne 0$ 和 $1 + \cos x > 0$，

$$\begin{aligned} \frac{1 - \cos x}{x\sin x} &= \frac{\sin^2 x}{x\sin x\,(1 + \cos x)} \\ &= \frac{\sin x}{x}\cdot\frac{1}{1 + \cos x} \\ &\to 1 \cdot \frac12 = \frac12. \end{aligned}$$

```check
same(sin(5*x)/(2*x), Rational(5, 2)*sin(5*x)/(5*x)); limit_is(sin(5*x)/(2*x), x, 0, Rational(5, 2))
same((sin(3*x)/x)/(sin(2*x)/x), sin(3*x)/sin(2*x))
same((3*sin(3*x)/(3*x))/(2*sin(2*x)/(2*x)), sin(3*x)/sin(2*x)); limit_is(sin(3*x)/sin(2*x), x, 0, Rational(3, 2))
steps((1 - cos(x))/(x*sin(x)), sin(x)**2/(x*sin(x)*(1 + cos(x))), (sin(x)/x)*(1/(1 + cos(x))))
limit_is((1 - cos(x))/(x*sin(x)), x, 0, Rational(1, 2))
```
:::
::::

:::: exercise 选择一个常数 {#ex-2-6} ★★
设

$$f(x) = \begin{cases} x^2 + c & \text{if } x < 2, \\ 3x - 1 & \text{if } x \ge 2, \end{cases}$$

其中 $c$ 是一个常数。

- (a) 以 $c$ 表示的形式，求 $f$ 在 2 处的单侧极限。
- (b) 当 $c$ 取何值时，$\lim_{x\to2} f(x)$ 存在？此时极限是多少？
- (c) 当 $c = 3$ 时，描述 $x = 2$ 附近的图像。

::: solution
**(a)** 从左侧趋近时，$f(x) = x^2 + c \to 4 + c$；从右侧趋近时，$f(x) = 3x - 1 \to 5$（每个公式直接代入）。

**(b)** 极限存在的充要条件是单侧极限相等：$4 + c = 5$，因此 $c = 1$。此时 $\lim_{x\to2} f(x) = 5$，这同样等于 $f(2)$：两部分连接处没有间隙。

**(c)** 以 $c = 3$ 为界，左侧极限为 7，右侧极限为 5。图象在 $x = 2$ 处跳跃下降 2：抛物线在 $(2, 7)$ 处以空点结束，直线从实点 $(2, 5)$ 开始。

```check
f6x = Piecewise((x**2 + c, x < 2), (3*x - 1, True))
same(f6x.subs(x, 2 - hp), (2 - hp)**2 + c); same(f6x.subs(x, 2 + hp), 3*(2 + hp) - 1)
limit_is((2 - hp)**2 + c, hp, 0, 4 + c, '+'); limit_is(3*(2 + hp) - 1, hp, 0, 5, '+')
same(solve(Eq(4 + c, 5), c), [1]); same(f6x.subs(x, 2), 5)
same((4 + c).subs(c, 3), 7); same(7 - 5, 2)
```
:::
::::

:::: exercise 一条直线的 ε–δ 证明 {#ex-2-7} ★★
- (a) 根据定义 2.3 证明 $\lim_{x\to-1}(5 - 2x) = 7$。
- (b) 你的证明为 $\varepsilon = 0.01$ 给出哪个 $\delta$？是否有更大的 $\delta$ 也成立？

::: solution
**(a)** *草稿工作。* $\abs{(5 - 2x) - 7} = \abs{-2x - 2} = 2\abs{x + 1}$ 小于 $\varepsilon$ 恰好当 $\abs{x + 1} < \varepsilon/2$。

*证明。* 设 $\varepsilon > 0$ 和 $\delta = \varepsilon/2$。若 $0 < \abs{x - (-1)} < \delta$，即 $0 < \abs{x + 1} < \delta$，则

$$\begin{aligned} \abs{(5 - 2x) - 7} &= 2\abs{x + 1} \\ &< 2\delta = \varepsilon. \end{aligned}$$

**(b)** $\delta = 0.01/2 = 0.005$。没有更大的 $\delta$ 成立：若 $\delta > 0.005$，点 $x = -1.005$ 满足 $0 < \abs{x + 1} = 0.005 < \delta$，但 $\abs{(5 - 2x) - 7} = \abs{7.01 - 7} = 0.01$，这不小于 $\varepsilon$。对于直线，草稿工作中的“恰好当”使证明的 $\delta$ 成为最佳可能；而对于例 2.13 中的抛物线则不是。

```check
steps(Abs((5 - 2*xr) - 7), Abs(-2*xr - 2), 2*Abs(xr + 1))
same(solveset(2*Abs(xr + 1) < ep, xr, S.Reals), Interval.open(-1 - ep/2, -1 + ep/2))
same(Rational(1, 100)/2, Rational(5, 1000))
x7 = -Rational(1005, 1000)
same(Abs(x7 + 1), Rational(5, 1000)); same(5 - 2*x7, Rational(701, 100)); same(Abs((5 - 2*x7) - 7), Rational(1, 100))
holds(Abs((5 - 2*x7) - 7) >= Rational(1, 100))
```
:::
::::

:::: exercise 瓷砖需要切割多精确？ {#ex-2-8} ★★
一个正方形瓷砖的面积应为 400 cm²，客户接受的面积范围在 399 到 401 cm² 之间。用第 2.7 节的语言来说，这是 $\varepsilon = 1$ 对 $\lim_{s\to20} s^2 = 400$ 的挑战，其中 $s$ 是以厘米为单位的边长。

- (a) 使用例 2.13 的方法，首先确定 $\delta \le 1$，找出一个 $\delta$，使得 $\abs{s - 20} < \delta$ 保证公差。
- (b) 找出最大的这样的 $\delta$，保留三位有效数字，并说明它在毫米中的含义。
- (c) 将 (a) 转化为定义 2.3 的证明，证明 $\lim_{s\to20} s^2 = 400$：给出一个 $\delta$，它能击败每一个 $\varepsilon > 0$。

::: solution
**(a)** $\abs{s^2 - 400} = \abs{s - 20}\,\abs{s + 20}$. 如果 $\abs{s - 20} < 1$，则 $19 < s < 21$，因此 $39 < s + 20 < 41$ 和 $\abs{s + 20} < 41$. 然后 $\abs{s^2 - 400} < 41\abs{s - 20}$，当 $\abs{s - 20} < \tfrac{1}{41}$ 时小于 1。因此 $\delta = \min\big(1, \tfrac{1}{41}\big) = \tfrac{1}{41} \approx 0.0244$ 厘米可行。

**(b)** 对于 $s > 0$，当 $\sqrt{399} < s < \sqrt{401}$ 时，容忍度 $399 < s^2 < 401$ 恰好成立，也就是说，大约 $19.97498 < s < 20.02498$。20 附近的区间必须在两侧都包含，并且两侧并不相等：$20 - \sqrt{399} \approx 0.025016$ 和 $\sqrt{401} - 20 \approx 0.024984$。最大的 $\delta$ 是较小的，$\sqrt{401} - 20 \approx 0.0250$ 厘米：边必须被切割到大约十分之一毫米以内。$\delta$ 的 (a) 是稍微小一点的，正如例 2.13 所预期的那样。

**(c)** 用 (a) 中的任意 $\varepsilon > 0$ 替换容忍度 1。*证明。* 设 $\varepsilon > 0$ 和 $\delta = \min(1, \varepsilon/41)$。假设 $0 < \abs{s - 20} < \delta$。由于 $\delta \le 1$，$19 < s < 21$，因此 $\abs{s + 20} < 41$。由于 $\delta \le \varepsilon/41$，$\abs{s - 20} < \varepsilon/41$。因此

$$\begin{aligned} \abs{s^2 - 400} &= \abs{s + 20}\,\abs{s - 20} \\ &< 41 \cdot \frac{\varepsilon}{41} = \varepsilon. \end{aligned}$$

每个挑战都被满足，且 $\lim_{s\to20} s^2 = 400$。对于 $\varepsilon = 1$，证明给出了 (a) 的 $\delta = \tfrac{1}{41}$。

```check
sp_ = symbols('s', positive=True)
same(expand((sp_ - 20)*(sp_ + 20)), sp_**2 - 400)
same(solveset(Abs(xr - 20) < 1, xr, S.Reals), Interval.open(19, 21))
same(Min(1, Rational(1, 41)), Rational(1, 41)); rounds(Rational(1, 41), '0.0244')
same(Intersection(solveset(sp_**2 > 399, sp_, Interval.open(0, oo)), solveset(sp_**2 < 401, sp_, Interval.open(0, oo))), Interval.open(sqrt(399), sqrt(401)))
rounds(sqrt(399), '19.97498'); rounds(sqrt(401), '20.02498')
rounds(20 - sqrt(399), '0.025016'); rounds(sqrt(401) - 20, '0.024984'); rounds(sqrt(401) - 20, '0.0250')
holds(sqrt(401) - 20 < 20 - sqrt(399)); holds(Rational(1, 41) < sqrt(401) - 20)
rounds((sqrt(401) - 20)*10, '0.25')                       # in millimetres
same(expand((xr + 20)*(xr - 20)), xr**2 - 400); same(41*(ep/41), ep)   # (c): |s^2 - 400| = |s + 20||s - 20| < 41 eps/41
same(solveset(Abs(xr - 20) < 1, xr, S.Reals), Interval.open(19, 21)); holds(Abs(21 + 20) == 41)
same(Min(1, ep/41).subs(ep, 1), Rational(1, 41))
```
:::
::::

:::: exercise 平方根的根律 {#ex-2-9} ★★★
假设 $\lim_{x\to a} f(x) = L$，其中 $L > 0$。

- (a) 证明存在一个 $\delta_0 > 0$，使得 $f(x) > L/2$ 当且仅当 $0 < \abs{x - a} < \delta_0$。 （因此，对于那些 $x$，$\sqrt{f(x)}$ 是定义良好的。）
- (b) 证明对于那些 $x$，$\big\lvert\sqrt{f(x)} - \sqrt{L}\big\rvert \le \dfrac{\abs{f(x) - L}}{\sqrt L}$。 （请合理化。）
- (c) 证明 $\lim_{x\to a}\sqrt{f(x)} = \sqrt L$。 推论 $\lim_{x\to a}\sqrt x = \sqrt a$ 对于每一个 $a > 0$ 都成立。

::: solution
**(a)** 使用定义 2.3 中的挑战 $\varepsilon = L/2$：存在一个 $\delta_0 > 0$，使得 $\abs{f(x) - L} < L/2$ 当且仅当 $0 < \abs{x - a} < \delta_0$。 然后 $f(x) > L - L/2 = L/2 > 0$。

**(b)** 对于这样的 $x$，$\sqrt{f(x)}$ 和 $\sqrt L$ 都是定义良好的，且它们的和至少为 $\sqrt L > 0$。 乘以并除以共轭 $\sqrt{f(x)} + \sqrt L$；由于 $\big(\sqrt{f(x)} - \sqrt L\big)\big(\sqrt{f(x)} + \sqrt L\big) = f(x) - L$，

$$\sqrt{f(x)} - \sqrt L = \frac{f(x) - L}{\sqrt{f(x)} + \sqrt L}.$$

取绝对值，并使用 $\sqrt{f(x)} + \sqrt L \ge \sqrt L$：

$$\begin{aligned} \big\lvert\sqrt{f(x)} - \sqrt L\big\rvert &= \frac{\abs{f(x) - L}}{\sqrt{f(x)} + \sqrt L} \\ &\le \frac{\abs{f(x) - L}}{\sqrt L}. \end{aligned}$$

**(c)** 设 $\varepsilon > 0$。 挑战 $f$ 与 $\varepsilon\sqrt L$：存在一个 $\delta_1 > 0$，使得 $\abs{f(x) - L} < \varepsilon\sqrt L$ 当且仅当 $0 < \abs{x - a} < \delta_1$。 设 $\delta = \min(\delta_0, \delta_1)$。 如果 $0 < \abs{x - a} < \delta$，则由 (b)

$$\begin{aligned} \big\lvert\sqrt{f(x)} - \sqrt L\big\rvert &\le \frac{\abs{f(x) - L}}{\sqrt L} \\ &< \frac{\varepsilon\sqrt L}{\sqrt L} = \varepsilon. \end{aligned}$$

所以 $\lim_{x\to a}\sqrt{f(x)} = \sqrt L$。对于 $f(x) = x$，其在 $a$ 处的极限是 $a$（第 2.7 节），这给出 $\lim_{x\to a}\sqrt x = \sqrt a$ 对于每个 $a > 0$。

```check
Fp, Lp = symbols('F L', positive=True)
same(Lp - Lp/2, Lp/2)
steps(sqrt(Fp) - sqrt(Lp), (sqrt(Fp) - sqrt(Lp))*(sqrt(Fp) + sqrt(Lp))/(sqrt(Fp) + sqrt(Lp)), (Fp - Lp)/(sqrt(Fp) + sqrt(Lp)))
holds(sqrt(Fp) + sqrt(Lp) >= sqrt(Lp))
same(ep*sqrt(Lp)/sqrt(Lp), ep)
ap_ = symbols('a', positive=True)
limit_is(sqrt(x), x, ap_, sqrt(ap_))
```
:::
::::

:::: exercise sin(1/x) 没有极限 {#ex-2-10} ★★★
从定义 2.3 证明 $\lim_{x\to0}\sin(1/x)$ 不存在。（使用例 2.3 中的点以及例 2.14 的策略。）

::: solution
设 $L$ 为任意数；挑战 $\varepsilon = 1$ 将击败它。设 $\delta > 0$ 为任意响应，并选择一个整数 $k \ge 1$ 满足 $k \ge 1/\delta$。这些点

$$\begin{aligned} x_1 &= \frac{2}{(4k + 1)\pi}, \\ x_2 &= \frac{2}{(4k + 3)\pi} \end{aligned}$$

是正的，并且

$$\begin{aligned} x_2 < x_1 &< \frac{2}{4k\pi} = \frac{1}{2k\pi} \\ &\le \frac{\delta}{2\pi} < \delta, \end{aligned}$$

所以这两个都满足 $0 < \abs{x} < \delta$。在这些点 $\sin(1/x_1) = \sin\dfrac{(4k + 1)\pi}{2} = 1$ 和 $\sin(1/x_2) = \sin\dfrac{(4k + 3)\pi}{2} = -1$。如果这两个值都在 $L$ 的 1 之内，三角不等式将给出

$$\begin{aligned} 2 &= \abs{(1 - L) + (L + 1)} \\ &\le \abs{1 - L} + \abs{L + 1} \\ &< 1 + 1 = 2, \end{aligned}$$

这是不可能的。因此，至少 $x_1$ 或 $x_2$ 中有一个给出 $\abs{\sin(1/x) - L} \ge 1$，并且 $\delta$ 失败。由于 $\delta$ 和 $L$ 是任意的，$\sin(1/x)$ 在 0 处没有极限。

```check
kq = symbols('k', integer=True, positive=True)
same(sin(1/(2/((4*kq + 1)*pi))), 1); same(sin(1/(2/((4*kq + 3)*pi))), -1)
same(2/(4*kq*pi), 1/(2*kq*pi)); holds(1/(2*pi) < 1)
for kv in range(1, 30):
    holds(2/((4*kv + 3)*pi) < 2/((4*kv + 1)*pi)); holds(2/((4*kv + 1)*pi) < 2/(4*kv*pi))
same((1 - Lsym) + (Lsym + 1), 2)
```
:::
::::

:::: exercise 一个欺骗计算机的公式 {#ex-2-11} ★★★
设 $f(x) = \dfrac{\sqrt{x^2 + 1} - 1}{x^2}$ 对于 $x \ne 0$。

- (a) 通过有理化求 $\lim_{x\to0} f(x)$。
- (b) 在 Python 中，`(math.sqrt(x**2 + 1) - 1)/x**2` 给出 `0.0` 对于 `x = 1e-8`。解释原因。
- (c) 找出一个公式 $f(x)$，使得计算机在小 $x$ 时能够准确计算，并比较 Python 中的两个公式。

::: solution
**(a)** 将分子和分母乘以共轭 $\sqrt{x^2 + 1} + 1$：

$$\begin{aligned} f(x) &= \frac{(x^2 + 1) - 1}{x^2\big(\sqrt{x^2 + 1} + 1\big)} \\ &= \frac{1}{\sqrt{x^2 + 1} + 1} \qquad (x \ne 0). \end{aligned}$$

根据根定律，$\sqrt{x^2 + 1} \to 1$，因此 $f(x) \to \dfrac{1}{1 + 1} = \dfrac12$。

**(b)** 对于 $x = 10^{-8}$，$x^2 + 1 = 1 + 10^{-16}$。1 之后的下一个浮点数大约是 $1 + 2.2 \times 10^{-16}$，因此 $1 + 10^{-16}$，更接近 1，被存储为恰好 1。然后 $\sqrt1 - 1 = 0$：每一位都抵消了，商为 $0/10^{-16} = 0$。

**(c)** (a) 中有理化公式 $\dfrac{1}{\sqrt{x^2 + 1} + 1}$，相加而非相减，因此没有抵消：

```python
import math
for x in [1e-2, 1e-4, 1e-6, 1e-7, 1e-8]:
    direct = (math.sqrt(x**2 + 1) - 1)/x**2
    rationalised = 1/(math.sqrt(x**2 + 1) + 1)
    print(f"x = {x:.0e}:  {direct:.12f}  {rationalised:.12f}")
```

```output
x = 1e-02:  0.499987500624  0.499987500625
x = 1e-04:  0.499999996961  0.499999998750
x = 1e-06:  0.500044450291  0.500000000000
x = 1e-07:  0.488498130835  0.500000000000
x = 1e-08:  0.000000000000  0.500000000000
```

直接公式随着 $x$ 变小而损失数字，并在 $x = 10^{-8}$ 处给出 0；有理化公式则保持准确并趋近于 $\tfrac12$，如 (a) 所述。

```check
steps((sqrt(x**2 + 1) - 1)/x**2, ((x**2 + 1) - 1)/(x**2*(sqrt(x**2 + 1) + 1)), 1/(sqrt(x**2 + 1) + 1))
limit_is(sqrt(x**2 + 1), x, 0, 1); limit_is((sqrt(x**2 + 1) - 1)/x**2, x, 0, Rational(1, 2))
import math
holds(1e-8**2 + 1 == 1.0); holds(math.sqrt(1e-8**2 + 1) - 1 == 0.0)
rounds(Rational(1, 2**52), '2.2e-16'); holds(1e-16 < 2.0**-53)          # 1 + 1e-16 is nearer to 1 than to 1 + 2^-52
for xv in (1e-2, 1e-4, 1e-6, 1e-7, 1e-8):
    xq = nsimplify(xv)
    rounds(1/(sqrt(xq**2 + 1) + 1), f"{1/(math.sqrt(xv**2 + 1) + 1):.12f}")   # the rationalised column is right
```
:::
::::

## 自测 {#quiz}

```quiz
? 如果 $f(x) = x + 1$ 对于每一个 $x \ne 1$，且 $f(1) = 5$，那么 $\lim_{x\to1} f(x)$ 是
- [ ] 5
- [x] 2
- [ ] 1
- [ ] 不存在，因为图在 $x = 1$ 处有间断点
> 在 1 附近，$f(x) = x + 1$，从两侧趋近于 2；极限忽略 1 处本身的值。5 是 $f(1)$，不是极限。在 $(1, 5)$ 处的单独点不会阻止两侧极限相等，因此极限存在。1 是 $x$ 的值，而不是 $f(x)$ 的值。

? $\lim_{x\to2^-}\dfrac{\abs{x - 2}}{x - 2}$等于
- [ ] 1
- [ ] 0
- [x] $-1$
- [ ] 不存在
> 对于 $x < 2$，$x - 2$ 是负数，因此 $\abs{x - 2} = -(x - 2)$ 和商为 $-1$，对于每一个这样的 $x$。右侧极限是 1，因此两侧极限不存在；但问题要求左侧极限，而该极限存在。0 来源于仅在分子中代入 $x = 2$。

? 直接代入 $\lim_{x\to2}\dfrac{x^2 - 4}{x - 2}$ 得到 $\dfrac00$。因此极限
- [ ] 是 0
- [ ] 是 1
- [ ] 不存在
- [x] 是 4
> $0/0$ 是一个不定式，提示需要进一步计算：对于 $x \ne 2$，$\dfrac{x^2 - 4}{x - 2} = x + 2$，其趋近于 4。其他三个答案将 $0/0$ 当作一个值来处理。

? $\lim_{x\to0}\dfrac{\sqrt{1 + x} - 1}{x}$等于
- [x] $\dfrac12$
- [ ] 0
- [ ] 2
- [ ] 1
> 有理化：$\dfrac{\sqrt{1 + x} - 1}{x} = \dfrac{1}{\sqrt{1 + x} + 1} \to \dfrac{1}{1 + 1} = \dfrac12$。0 来源于仅在分子中代入；2 是 $\sqrt{1 + x} + 1$ 的极限，但忽略了倒数；1 来源于舍去平方根。

? 以 $x$ 弧度计算，$\lim_{x\to0}\dfrac{\sin 4x}{x}$ 为
- [ ] 1
- [x] 4
- [ ] $\dfrac14$
- [ ] 0
> $\dfrac{\sin 4x}{x} = 4\cdot\dfrac{\sin 4x}{4x} \to 4 \cdot 1 = 4$。定理 2.5 仅在角度与分母相同的情况下给出 1。$\tfrac14$ 将因子倒置，0 来源于分子中 $\sin 0 = 0$ 单独代入。

? 如果 $1 - x^2 \le f(x) \le 1 + x^2$ 对于每一个 $x$，则 $\lim_{x\to0} f(x)$
- [ ] 在没有 $f$ 公式的情况下无法找到
- [ ] 是 0
- [ ] 仅当 $f(0) = 1$ 时才存在
- [x] 是 1
> 两个界值随着 $x \to 0$ 趋近于 1，因此根据夹逼定理 $f(x) \to 1$，无论公式如何，极限值都是 1。值 $f(0)$ 在极限中不起作用（此处不等式恰好强制 $f(0) = 1$ 为 1）。0 是 $x^2$ 的极限，而不是这些界值的极限。

? 对于 $\lim_{x\to1}(4x + 3) = 7$，哪个响应 $\delta$ 能够应对每一个挑战 $\varepsilon > 0$？
- [x] $\delta = \varepsilon/4$
- [ ] $\delta = \varepsilon$
- [ ] $\delta = 4\varepsilon$
- [ ] $\delta = 0.1$，无论 $\varepsilon$ 是什么
> $\abs{(4x + 3) - 7} = 4\abs{x - 1} < 4\delta$，取 $\delta = \varepsilon/4$ 时就有 $\varepsilon$。$\delta = \varepsilon$ 太大：$x = 1 + \varepsilon/2$ 与 1 的距离在 $\delta$ 以内，却得到 $4 \cdot \varepsilon/2 = 2\varepsilon$；$4\varepsilon$ 更差。把 $\delta$ 固定为 0.1 之类的值就无法应对更严格的挑战，所以 $\delta$ 必须取决于 $\varepsilon$。

? 在浮点运算中，`(1 - math.cos(x))/x**2` 在 `x = 1e-8` 处给出 `0.0`，尽管在 0 处的极限是 $\tfrac12$。为什么？
- [ ] 极限实际上为 0。
- [ ] $x^2 = 10^{-16}$ 对于计算机来说太小，因此变为 0。
- [x] $\cos(10^{-8})$ 非常接近 1，以至于被存储为恰好 1，因此分子为 0。
- [ ] Python 的 `math.cos` 以度数计算。
> $\cos(10^{-8}) = 1 - 5 \times 10^{-17} + \dots$ 比任何其他浮点数更接近 1，因此 $1 - \cos x$ 结果为 0：抵消。Python 处理的数值远小于 $10^{-16}$（小至约 $10^{-308}$），且 $0/10^{-16}$ 为 0，而非错误；`math.cos` 以弧度计算；并且极限确实为 $\tfrac12$，如第 2.8 节的重排公式和 SymPy 所证实。
```

```check
limit_is(x + 1, x, 1, 2)
same((Abs(x - 2)/(x - 2)).subs(x, 2 - hp), -1); limit_is(Abs(x - 2)/(x - 2), x, 2, -1, '-'); limit_is(Abs(x - 2)/(x - 2), x, 2, 1, '+')
same(cancel((x**2 - 4)/(x - 2)), x + 2); limit_is((x**2 - 4)/(x - 2), x, 2, 4)
same((sqrt(1 + x) - 1)/x, 1/(sqrt(1 + x) + 1)); limit_is((sqrt(1 + x) - 1)/x, x, 0, Rational(1, 2)); same(((1 + x) - 1)/x, 1)
limit_is(sqrt(1 + x) + 1, x, 0, 2)                  # the distractor 2: the reciprocal forgotten
limit_is(sin(4*x)/x, x, 0, 4); same(sin(4*x)/x, 4*sin(4*x)/(4*x))
limit_is(1 - x**2, x, 0, 1); limit_is(1 + x**2, x, 0, 1)
steps(Abs((4*xr + 3) - 7), 4*Abs(xr - 1)); same(4*(ep/4), ep); same(4*(ep/2), 2*ep)
import math, sys
holds(math.cos(1e-8) == 1.0); holds((1 - math.cos(1e-8))/1e-8**2 == 0.0)
holds(1e-309 < sys.float_info.min < 1e-307)
```
