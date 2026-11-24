---
title: 积分的应用与反常积分
part: 3
lead: 用同一套方法求曲线间的面积、体积、弧长、变力做的功和质心。先切成小片，再近似、求和、取极限。接着把积分推广到无穷区间和被积函数无界的情形，并用积分计算概率。
minutes: 270
needs: 模块 1 到 11，特别是定积分（模块 9）、微积分基本定理和替换法（模块 10），以及分部积分和辛普森法则（模块 11）
goals:
  - 通过切片、近似每个切片、相加切片并取极限来建立一个量的积分
  - 用垂直或水平条带找出曲线之间的面积，用切片、盘法、 washer 法和圆柱壳法找出体积
  - 计算曲线的弧长、变力所做的功，以及杆和板的质心
  - 利用定义、$p$-积分和比较判别法判断反常积分是否收敛，并在收敛时求其值
  - 从概率密度计算概率和期望值，包括指数分布和正态分布
---

## 切割、近似、相加 {#method}

模块 9 通过将区域切割成细条，用矩形近似每个条，相加矩形并取和的极限来求曲线下的面积；模块 10 用原函数来计算这样的极限。同样的四个步骤可以计算比面积更多的内容：体积、长度、功、质量、质心和概率。本节展示该方法在一个例子上的应用。模块其余部分将反复使用该方法。

假设一根 2 米长的金属杆一端较粗，因此其 **密度**，即单位长度的质量，是

$$\rho(x) = 1 + x^2 \text{ kg/m}$$

在薄端点 $x$ 米处的点。 （杆是假设的；$\rho$ 是希腊字母“rho”。）它的质量是多少？如果密度是常数，质量就是密度乘以长度。密度不是常数，但在杆的一小段上几乎不变。因此将杆切成 $n$ 个长度为 $\Delta x = 2/n$ 的小段，两端为 $x_0 = 0, x_1, \dots, x_n = 2$。第 $i$ 段的密度接近 $\rho(x_{i-1})$，即该段左端的密度值，因此其质量约为 $\rho(x_{i-1})\,\Delta x$。将这些小段相加得到杆质量的估计值 $L_n$；用右端代替左端则得到另一个估计值 $R_n$：

$$\begin{aligned} L_n &= \sum_{i=1}^{n} \rho(x_{i-1})\,\Delta x, \\ R_n &= \sum_{i=1}^{n} \rho(x_i)\,\Delta x. \end{aligned}$$

```valuetable
n = 4, 10, 100, 1000
$L_n$ = Sum((1 + (2*(i - 1)/n)**2)*2/n, (i, 1, n))
$R_n$ = Sum((1 + (2*i/n)**2)*2/n, (i, 1, n))
digits = 6
---
n | L_n | R_n
4 | 3.75 | 5.75
10 | 4.28 | 5.08
100 | 4.6268 | 4.7068
1000 | 4.66267 | 4.67067
```

密度沿杆增加，因此每个小段的质量比其左端估计值大，比其右端估计值小：杆的真实质量 $M$ 满足 $L_n \le M \le R_n$ 对于每个 $n$。这两个和都是 $\rho$ 在 $[0, 2]$ 上的黎曼和，因此当 $n \to \infty$ 趋近于 0 时（模块 9），它们都趋近于 $\int_0^2 \rho(x)\,dx$，而 $M$ 被这两个和夹在中间，因此必须等于该积分：

$$\begin{aligned} M &= \int_0^2 (1 + x^2)\,dx = \Big[x + \frac{x^3}{3}\Big]_0^2 \\ &= 2 + \frac83 = \frac{14}{3} \approx 4.667 \text{ kg}. \end{aligned}$$

表格一致：对于 $n = 1000$，两个和将质量夹在 4.66267 和 4.67067 kg 之间。

```check
rho12 = 1 + x**2
Ln12 = lambda N: sum(rho12.subs(x, 2*Rational(i_ - 1, N))*Rational(2, N) for i_ in range(1, N + 1))
Rn12 = lambda N: sum(rho12.subs(x, 2*Rational(i_, N))*Rational(2, N) for i_ in range(1, N + 1))
for N_ in (4, 10, 100, 1000):
    holds(Ln12(N_) < Rational(14, 3)); holds(Rational(14, 3) < Rn12(N_))
same(Ln12(4), Rational(375, 100)); same(Rn12(100), Rational(47068, 10000))
rounds(Ln12(1000), '4.66267'); rounds(Rn12(1000), '4.67067')
antideriv(x + x**3/3, rho12, x)
steps(Integral(rho12, (x, 0, 2)), 2 + Rational(8, 3), Rational(14, 3))
rounds(Rational(14, 3), '4.667')
nn12 = symbols('n', positive=True, integer=True)
limit_is(summation(rho12.subs(x, 2*(u - 1)/nn12)*2/nn12, (u, 1, nn12)), nn12, oo, Rational(14, 3))
limit_is(summation(rho12.subs(x, 2*u/nn12)*2/nn12, (u, 1, nn12)), nn12, oo, Rational(14, 3))
```

::: keyidea
**切分，近似，相加，取极限。** 要计算一个在区间 $[a, b]$ 上分布的量 $Q$：

1. 把 $[a, b]$ **切分**为 $n$ 个宽度为 $\Delta x$ 的小片。
2. 用 $q(x)\,\Delta x$ **近似**$Q$ 在 $x$ 附近小片中的份额，其中 $q$ 为连续函数。例子包括密度乘长度、高度乘宽度、力乘距离。
3. **添加** 各部分：$Q \approx \sum_{i=1}^{n} q(x_i^*)\,\Delta x$，一个黎曼和。
4. **取极限** 作为 $n \to \infty$: $Q = \int_a^b q(x)\,dx$.
:::

为什么极限恰好是$Q$，而不仅仅是接近它？杆子展示了原因。在每一段上，一个连续的$q$都有最小值和最大值（极值定理，模块3）。如果每段中的真实量介于$\Delta x$乘以最小值和$\Delta x$乘以最大值之间，那么$Q$就介于$q$的两个黎曼和之间：一个是在每段中$q$取最小值时采样的和，另一个是在每段中$q$取最大值时采样的和。这两个和都趋近于$\int_a^b q(x)\,dx$，因此$Q$被挤压到该值，如[第2.6节](module_02_ZH.html#squeeze)的夹逼定理所示。当你设置一个新的应用时，这是需要寻找的性质。没有这种保证的近似可能会给出错误的答案，正如第12.5节所示。

莱布尼茨的记号保持了方法的直观。 将宽度为 $dx$ 的小段上的量写作 $dQ = q(x)\,dx$，这里为 $dm = \rho(x)\,dx$，总和写作 $Q = \int_a^b dQ$。

::: tip
单位检查：被积函数乘以 $dx$ 必须具有答案的单位，这里为 $\text{kg/m} \times \text{m} = \text{kg}$；对于体积，是一个面积乘以长度；对于功，是一个力乘以距离。
:::

::: pitfall
每一项是切片中的量 $q(x_i)\,\Delta x$，而不是单独的值 $q(x_i)$。杆的右端密度之和为 $1.25 + 2 + 3.25 + 5 = 11.5$ 对于 $n = 4$，约为 2335 对于 $n = 1000$：没有因子 $\Delta x$，这些和将无限增长而不是收敛到质量。

```check
same(sum(rho12.subs(x, Rational(i_, 2)) for i_ in range(1, 5)), Rational(115, 10))
same([rho12.subs(x, Rational(i_, 2)) for i_ in range(1, 5)], [Rational(125, 100), 2, Rational(325, 100), 5])
rounds(sum(rho12.subs(x, Rational(2*i_, 1000)) for i_ in range(1, 1001)), '2335')
```
:::

## 曲线之间的面积 {#area}

当一个区域位于两条曲线之间，即 $y = f(x)$ 在上， $y = g(x)$ 在下，对于 $a \le x \le b$，用垂直线切分该区域。在 $x$ 处的条带，宽度为 $\Delta x$，近似为高度为 $f(x) - g(x)$ 的矩形，即上边减去下边。将这些条带相加并取极限得到面积。

::: definition 曲线之间的面积
设 $f$ 和 $g$ 在 $[a, b]$ 上连续，且 $g(x) \le f(x)$ 对于 $a \le x \le b$。两曲线之间区域的 **面积**，即点集 $(x, y)$ 满足 $a \le x \le b$ 且 $g(x) \le y \le f(x)$，是

$$A = \int_a^b \big(f(x) - g(x)\big)\,dx.$$
:::

与 $g = 0$ 相关的是曲线下的面积，如第 9 模块所示。曲线可能低于 $x$ 轴：只关心每个矩形条的 $f(x) - g(x)$ 高度，且将两条曲线同时向上移动相同距离不会改变面积。对于“由两条曲线围成的区域”，积分限 $a$ 和 $b$ 是曲线相交的点：解方程 $f(x) = g(x)$。

::: example 两条抛物线
求由抛物线 $y = 4 - x^2$ 和 $y = x^2 - 2x$ 围成的区域的面积。

曲线相交于 $4 - x^2 = x^2 - 2x$，即 $2x^2 - 2x - 4 = 0$，或 $x^2 - x - 2 = 0$。这可以因式分解为 $(x - 2)(x + 1) = 0$，因此曲线在 $x = -1$ 和 $x = 2$ 相交。在两个交点之间，同一曲线始终在上方（否则根据第 3 模块的中间值定理，连续函数 $f - g$ 在中间某处会为 0），因此测试一个点：在 $x = 0$， $4 - x^2 = 4$ 和 $x^2 - 2x = 0$，所以 $y = 4 - x^2$ 在上方。上减下为 $(4 - x^2) - (x^2 - 2x) = 4 + 2x - 2x^2$，

$$\begin{aligned} A &= \int_{-1}^{2} \big(4 + 2x - 2x^2\big)\,dx \\ &= \Big[4x + x^2 - \frac{2x^3}{3}\Big]_{-1}^{2} \\ &= \frac{20}{3} - \Big(-\frac{7}{3}\Big) = 9. \end{aligned}$$

```check
same_set(solve(Eq(4 - x**2, x**2 - 2*x), x), [-1, 2]); same(factor(x**2 - x - 2), (x - 2)*(x + 1))
same(expand(4 - x**2 - (x**2 - 2*x)), 4 + 2*x - 2*x**2); holds((4 - x**2).subs(x, 0) > (x**2 - 2*x).subs(x, 0))
F121 = 4*x + x**2 - 2*x**3/3
antideriv(F121, 4 + 2*x - 2*x**2, x); same(F121.subs(x, 2), Rational(20, 3)); same(F121.subs(x, -1), -Rational(7, 3))
steps(Integral(4 + 2*x - 2*x**2, (x, -1, 2)), Rational(20, 3) + Rational(7, 3), 9)
```
:::

当曲线相交时，每处相交点处上方和下方的曲线互换。面积计算将每一条条带都视为正数，因此应在相交点处将区间分割；在一个公式中，面积为 $\int_a^b \abs{f(x) - g(x)}\,dx$。

::: example 相交曲线
求 $0 \le x \le \pi$ 下 $y = \sin x$ 和 $y = \cos x$ 之间的区域的面积。

曲线在 $\sin x = \cos x$ 处相交，即 $\tan x = 1$；在 $[0, \pi]$ 中，这种情况仅在 $x = \pi/4$ 发生。在 $x = 0$， $\cos x = 1$ 和 $\sin x = 0$，因此 $\cos x$ 在 $[0, \pi/4]$ 上方；在 $x = \pi/2$， $\sin x = 1$ 和 $\cos x = 0$，因此 $\sin x$ 在 $[\pi/4, \pi]$ 上方。因此

$$\begin{aligned} A &= \int_0^{\pi/4} (\cos x - \sin x)\,dx \\ &\qquad + \int_{\pi/4}^{\pi} (\sin x - \cos x)\,dx \\ &= \big[\sin x + \cos x\big]_0^{\pi/4} \\ &\qquad + \big[-\cos x - \sin x\big]_{\pi/4}^{\pi} \\ &= \big(\sqrt2 - 1\big) + \big(1 + \sqrt2\big) \\ &= 2\sqrt2 \approx 2.828. \end{aligned}$$

```check
same(solveset(tan(x) - 1, x, Interval(0, pi)), FiniteSet(pi/4))
antideriv(sin(x) + cos(x), cos(x) - sin(x), x); antideriv(-cos(x) - sin(x), sin(x) - cos(x), x)
same(integrate(cos(x) - sin(x), (x, 0, pi/4)), sqrt(2) - 1); same(integrate(sin(x) - cos(x), (x, pi/4, pi)), 1 + sqrt(2))
same(integrate(Abs(sin(x) - cos(x)), (x, 0, pi)), 2*sqrt(2)); rounds(2*sqrt(2), '2.828')
```
:::

::: pitfall
不进行分割时，积分结果不是面积： $\int_0^\pi (\cos x - \sin x)\,dx = \big[\sin x + \cos x\big]_0^\pi = -1 - 1 = -2$。其中 $\sin x$ 在上方的条带被计为负数，而面积永远不会为负数。在积分前，应先找出曲线的交点，并确定在交点之间的曲线哪一条在上方。

```check
same(integrate(cos(x) - sin(x), (x, 0, pi)), -2); same((sin(x) + cos(x)).subs(x, pi), -1); same((sin(x) + cos(x)).subs(x, 0), 1)
```
:::

### 水平条带 {#horizontal-strips}

有些区域更适合反向切片：选择每个条带在相同两条曲线之间延伸的方向。图 12.1 显示了抛物线 $x = y^2$ 与直线 $y = x - 2$ 之间的区域。当 $0 \le x \le 1$ 时，垂直条带从抛物线的下半部分 $y = -\sqrt x$ 延伸到上半部分，但当 $1 \le x \le 4$ 时，则从直线延伸到上半部分：两个公式，因此需要两个积分。每个水平条带都从左侧的抛物线延伸到右侧的直线。对于左边界为 $x = x_L(y)$、右边界为 $x = x_R(y)$ 的区域，当 $c \le y \le d$ 时，高度为 $\Delta y$ 的水平条带长度为 $x_R(y) - x_L(y)$，即右减左，且

$$A = \int_c^d \big(x_R(y) - x_L(y)\big)\,dy.$$

::: figure id=fig-12-1
抛物线 $x = y^2$ 和直线 $y = x - 2$ 之间的区域，它们在 $(1, -1)$ 和 $(4, 2)$ 处相交。左图：当 $x < 1$ 时，一条垂直条带从 $y = -\sqrt x$ 运行到 $y = \sqrt x$，但当 $x > 1$ 时，条带从 $y = x - 2$ 运行到 $y = \sqrt x$，因此垂直条带需要两个积分。右图：每一条水平条带从 $x = y^2$ 运行到 $x = y + 2$，因此只需一个积分即可（例12.3）。
:::

::: example 水平条带
求 $x = y^2$ 和 $y = x - 2$ 之间区域的面积，用水平条带和用垂直条带。

**水平条带。** 将直线写成 $x = y + 2$。曲线相交于 $y^2 = y + 2$，即 $(y - 2)(y + 1) = 0$：在 $y = -1$ 和 $y = 2$ 处，点 $(1, -1)$ 和 $(4, 2)$。在 $y = 0$ 处，直线在 $x = 2$，抛物线在 $x = 0$，因此直线在右边：

$$\begin{aligned} A &= \int_{-1}^{2} \big((y + 2) - y^2\big)\,dy \\ &= \Big[\frac{y^2}{2} + 2y - \frac{y^3}{3}\Big]_{-1}^{2} \\ &= \frac{10}{3} - \Big(-\frac{7}{6}\Big) = \frac{9}{2}. \end{aligned}$$

**垂直条带。** 从 $x = 0$ 到 $x = 1$，一条条带从 $-\sqrt x$ 到 $\sqrt x$；从 $x = 1$ 到 $x = 4$，从 $x - 2$ 到 $\sqrt x$。使用原函数 $\tfrac43 x^{3/2}$ 和 $\tfrac23 x^{3/2} - \tfrac12 x^2 + 2x$，

$$\begin{aligned} A &= \int_0^1 2\sqrt x\,dx \\ &\qquad + \int_1^4 \big(\sqrt x - x + 2\big)\,dx \\ &= \frac43 + \frac{19}{6} = \frac{9}{2}. \end{aligned}$$

相同的面积，如所必须的，但需要更多计算。

```check
same_set(solve(Eq(y**2, y + 2), y), [-1, 2]); same(factor(y**2 - y - 2), (y - 2)*(y + 1))
G123 = y**2/2 + 2*y - y**3/3
antideriv(G123, y + 2 - y**2, y); same(G123.subs(y, 2), Rational(10, 3)); same(G123.subs(y, -1), -Rational(7, 6))
steps(Integral(y + 2 - y**2, (y, -1, 2)), Rational(10, 3) + Rational(7, 6), Rational(9, 2))
xp12 = symbols('x', positive=True)
antideriv(Rational(4, 3)*xp12**Rational(3, 2), 2*sqrt(xp12), xp12)
antideriv(Rational(2, 3)*xp12**Rational(3, 2) - xp12**2/2 + 2*xp12, sqrt(xp12) - xp12 + 2, xp12)
same(integrate(2*sqrt(x), (x, 0, 1)), Rational(4, 3)); same(integrate(sqrt(x) - x + 2, (x, 1, 4)), Rational(19, 6))
same(Rational(4, 3) + Rational(19, 6), Rational(9, 2))
```
:::

::: pitfall
在关于 $y$ 的积分中，所有内容都用 $y$ 来表示：边界为 $x = \dots$，条形的长度为右减左（不是上减下），积分限为 $y$ 的值。在例 12.3 中，积分限是 $-1$ 和 $2$，即交点的 $y$ 坐标，而不是它们的 $x$ 坐标 1 和 4。
:::

## 切片法求体积 {#volumes}

### 横截面 {#slicing}

切一片面包：每一片近似为一个扁平的薄片，其体积为其底面面积乘以厚度。同样的想法可用于计算任何已知横截面的立体的体积。在立体中引入一个 $x$ 轴，设 $A(x)$ 为通过该轴上点 $x$ 的垂直平面所截得的横截面的面积。在 $x$ 处厚度为 $\Delta x$ 的薄片体积约为 $A(x)\,\Delta x$。将这些相加并取极限：

::: definition 切片法求体积
设一立体位于垂直于$x$轴的平面$x = a$与$x = b$之间，且其在$x$处的截面面积为$A(x)$，其中$A$在$[a, b]$上连续。该立体的**体积**为

$$V = \int_a^b A(x)\,dx.$$
:::

检查：一个高度为 $h$ 的棱柱或圆柱，其所有横截面面积相同，均为 $B$，则体积为 $V = \int_0^h B\,dx = Bh$，即底面积乘以高度，这是熟知的公式。

::: example 一个棱锥
一个棱锥有一个边长为 $s$ 的正方形底面和高度为 $h$。求其体积。

将顶点放在原点，使 $x$ 轴穿过底面中心向下，这样 $x$ 是从顶点向下到底面的深度，底面位于 $x = h$。深度为 $x$ 处的横截面是一个正方形。由相似三角形可知，其边长随深度按比例增长，从顶点处的 0 增长到底面处的 $s$，因此为 $sx/h$。所以 $A(x) = (sx/h)^2 = s^2x^2/h^2$，

$$V = \int_0^h \frac{s^2}{h^2}x^2\,dx = \frac{s^2}{h^2}\cdot\frac{h^3}{3} = \frac{1}{3}s^2h.$$

一个金字塔占据与之同底同高的盒子的三分之一。这个论证适用于任何形状的底面：在深度 $x$ 处的横截面是底面按因子 $x/h$ 缩放，因此其面积为 $B\,x^2/h^2$，其中 $B$ 是底面的面积（面积按因子的平方缩放），且 $V = \int_0^h Bx^2/h^2\,dx = \tfrac13 Bh$。半径为 $r$ 的圆锥是情形 $B = \pi r^2$：即 $V = \tfrac13\pi r^2h$。

```check
sq, hq, Bq, rq = symbols('s h B r', positive=True)
same((sq*x/hq)**2, sq**2*x**2/hq**2); same((sq*x/hq).subs(x, 0), 0); same((sq*x/hq).subs(x, hq), sq)
steps(Integral(sq**2*x**2/hq**2, (x, 0, hq)), sq**2/hq**2*hq**3/3, sq**2*hq/3)
same(integrate(Bq*x**2/hq**2, (x, 0, hq)), Bq*hq/3); same((Bq*hq/3).subs(Bq, pi*rq**2), pi*rq**2*hq/3)
same(integrate(Bq, (x, 0, hq)), Bq*hq)
```
:::

### 圆盘与圆环 {#washers}

旋转连续函数 $f \ge 0$ 的图像，对于 $a \le x \le b$，关于 $x$ 轴。它扫出一个 **旋转体**。区域中的每个点绕轴旋转成一个圆，因此在 $x$ 处的横截面是一个半径为 $f(x)$、面积为 $\pi f(x)^2$ 的圆盘，

$$V = \pi\int_a^b f(x)^2\,dx \qquad\text{(discs)}.$$

::: example 一个球体的体积
求半径为 $a$ 的球体的体积。

球体是由 $y = \sqrt{a^2 - x^2}$ 下方的半圆盘 $-a \le x \le a$ 扫出的。这里 $f(x)^2 = a^2 - x^2$，因此平方根消失：

$$\begin{aligned} V &= \pi\int_{-a}^{a} \big(a^2 - x^2\big)\,dx \\ &= \pi\Big[a^2x - \frac{x^3}{3}\Big]_{-a}^{a} \\ &= \pi\Big(\frac{2a^3}{3} + \frac{2a^3}{3}\Big) = \frac43\pi a^3. \end{aligned}$$

```check
aq = symbols('a', positive=True)
same(sqrt(aq**2 - x**2)**2, aq**2 - x**2)
antideriv(aq**2*x - x**3/3, aq**2 - x**2, x)
same((aq**2*x - x**3/3).subs(x, aq), 2*aq**3/3); same((aq**2*x - x**3/3).subs(x, -aq), -2*aq**3/3)
same(pi*integrate(aq**2 - x**2, (x, -aq, aq)), Rational(4, 3)*pi*aq**3)
```
:::

若区域未触及轴，则所得立体存在孔洞。设区域位于$y = R(x)$与$y = r(x)$之间，且满足$0 \le r(x) \le R(x)$。则在$x$处的截面为**washer**，即半径为$R(x)$的圆盘挖去半径为$r(x)$的孔（图12.2），其面积为$\pi R(x)^2 - \pi r(x)^2$，且

$$V = \pi\int_a^b \big(R(x)^2 - r(x)^2\big)\,dx \quad\text{(washers)}.$$

**外半径** $R(x)$ 是从轴线到较远边界的距离，而 **内半径** $r(x)$ 是到较近边界的距离。

::: figure id=fig-12-2
左图：$y = \sqrt x$与$y = x^2$之间、$0 \le x \le 1$（深蓝色）的区域绕$x$轴旋转扫出一个形似厚碗的立体（例12.6）；其外表面以透明壳绘制，紫色圆位于其内表面。$x$处的切片（橙色）为圆环。右图：沿轴观察该圆环，外半径为$R = \sqrt x$，内半径为$r = x^2$。
:::

::: example 有孔的立体
求当区域在 $y = \sqrt x$ 和 $y = x^2$ 之间绕 $x$ 轴旋转时所扫过的立体的体积。

曲线在 $\sqrt x = x^2$ 处相交；平方后，得到 $x = x^4$，即 $x(x^3 - 1) = 0$，因此在 $x = 0$ 和 $x = 1$ 处相交。对于 $0 < x < 1$，在 $\sqrt x > x^2$（在 $x = \tfrac14$， $\tfrac12 > \tfrac{1}{16}$ 处），因此 $R(x) = \sqrt x$ 和 $r(x) = x^2$：

$$\begin{aligned} V &= \pi\int_0^1 \big(x - x^4\big)\,dx = \pi\Big(\frac12 - \frac15\Big) \\ &= \frac{3\pi}{10} \approx 0.942. \end{aligned}$$

```check
same(solveset(x - x**4, x, S.Reals), FiniteSet(0, 1)); same_set(solve(Eq(sqrt(x), x**2), x), [0, 1])
holds(sqrt(Rational(1, 4)) > Rational(1, 4)**2)
same(sqrt(x)**2 - (x**2)**2, x - x**4)
steps(pi*Integral(x - x**4, (x, 0, 1)), pi*(Rational(1, 2) - Rational(1, 5)), 3*pi/10)
rounds(3*pi/10, '0.942')
```
:::

::: pitfall
洗涤器的面积是 $\pi R^2 - \pi r^2$，不是 $\pi(R - r)^2$。用 $R = 2$ 和 $r = 1$ 作为洗涤器的面积是 $4\pi - \pi = 3\pi$，而 $\pi(R - r)^2 = \pi$。将每个半径平方，然后相减。

```check
same(pi*2**2 - pi*1**2, 3*pi); same(pi*(2 - 1)**2, pi)
```
:::

### 其他坐标轴 {#other-axes}

对任何坐标轴都适用同样的推理：沿轴垂直切片，并从轴测量每个半径。对于 $y$ 轴，切片是水平的，因此半径是 $y$ 的函数，以及 $V = \pi\int_c^d \big(R(y)^2 - r(y)^2\big)\,dy$。对于一条水平线 $y = k$，高度为 $y$ 的点到轴的距离是 $\abs{y - k}$。

::: example 绕其他直线旋转
(a) 一个碗的形状是当抛物线 $y = x^2$ 绕 $y$ 轴旋转时所扫出的曲面。当水深为 $h$ 时，求碗中水的体积。

(b) 在 $y = x$ 和 $y = x^2$ 之间的区域 $0 \le x \le 1$ 绕直线 $y = -1$ 旋转，求所得立体的体积。

**(a)** 水是被 $y$ 轴和抛物线所扫出的立体，对于 $0 \le y \le h$ 的高度。在高度 $y$ 处的横截面是一个圆盘，其半径是 $x \ge 0$ 与 $x^2 = y$ 的关系，即 $\sqrt y$。因此

$$\begin{aligned} V &= \pi\int_0^h \big(\sqrt y\big)^2\,dy \\ &= \pi\int_0^h y\,dy = \frac{\pi h^2}{2}. \end{aligned}$$

一个高度相同为 $h$ 且顶部半径相同为 $\sqrt h$ 的圆柱体的体积为 $\pi\big(\sqrt h\big)^2 h = \pi h^2$：碗的体积恰好是它的二分之一。

**(b)** 垂直于轴 $y = -1$ 的横截面是竖直的，因此积分在 $x$ 进行。两条曲线都在轴上方，对于 $0 < x < 1$，线 $y = x$ 距离轴更远，因为 $x > x^2$。半径是到轴的距离：即 $R(x) = x - (-1) = x + 1$ 和 $r(x) = x^2 + 1$。因此

$$\begin{aligned} V &= \pi\int_0^1 \big((x + 1)^2 - (x^2 + 1)^2\big)\,dx \\ &= \pi\int_0^1 \big(2x - x^2 - x^4\big)\,dx \\ &= \pi\Big(1 - \frac13 - \frac15\Big) = \frac{7\pi}{15} \approx 1.466. \end{aligned}$$

```check
hb = symbols('h', positive=True)
same(pi*integrate(y, (y, 0, hb)), pi*hb**2/2); same(pi*sqrt(hb)**2*hb, pi*hb**2); same((pi*hb**2/2)/(pi*hb**2), Rational(1, 2))
same(x - (-1), x + 1); same(expand((x + 1)**2 - (x**2 + 1)**2), 2*x - x**2 - x**4)
holds(Rational(1, 2) > Rational(1, 2)**2)
steps(pi*Integral((x + 1)**2 - (x**2 + 1)**2, (x, 0, 1)), pi*(1 - Rational(1, 3) - Rational(1, 5)), 7*pi/15)
rounds(7*pi/15, '1.466')
```
:::

::: pitfall
半径是从旋转轴到曲线的距离，不是高度。绕 $y = -1$ 旋转时，曲线 $y = x$ 的半径是 $x + 1$，而不是 $x$。将同一区域绕 $y = 2$ 旋转，该轴位于其上方，外半径属于下边的曲线：即 $R(x) = 2 - x^2$ 和 $r(x) = 2 - x$。

```check
same(pi*integrate((2 - x**2)**2 - (2 - x)**2, (x, 0, 1)), 8*pi/15)
holds(all(2 - v**2 >= 2 - v for v in (0, Rational(1, 4), Rational(1, 2), 1)))
```
:::

## 圆柱壳法 {#shells}

将曲线 $y = 4x - x^3$、$0 \le x \le 2$ 下方的区域绕 $y$ 轴旋转。使用 washer 法则需要水平切片，且高度为 $y$ 的切片的半径是立方方程 $4x - x^3 = y$ 的解 $x$：难以求解。改用垂直切片，将区域分割成垂直条带。一个距离轴为 $x$、宽度为 $\Delta x$、高度为 $f(x)$ 的细条，在旋转时形成一个细长的 **圆柱壳**，其半径为 $x$，高度为 $f(x)$，厚度为 $\Delta x$（图 12.3）。将圆柱壳沿高度切开并展开：它近似为一个扁平的板，长度为 $2\pi x$（周长），高度为 $f(x)$，厚度为 $\Delta x$，体积约为 $2\pi x\,f(x)\,\Delta x$。

这个近似足够好。在半径 $x$ 和 $x + \Delta x$ 之间、高度为 $h$ 的圆柱体的体积为

$$\pi(x + \Delta x)^2h - \pi x^2h = 2\pi\Big(x + \frac{\Delta x}{2}\Big)h\,\Delta x,$$

管中部的周长乘以高度和厚度。用$x$表示半径，这最多改变$\pi h(\Delta x)^2$，若$H$是区域的最大高度，则最多为$\pi H(\Delta x)^2$；对所有$n$个壳求和，最多为$\pi H(b - a)\,\Delta x$，其趋于0。高度在条带上略有变化，但如第12.1节所示，条扫过的固体位于具有条带最小和最大高度的管之间。将壳相加并取极限，得到**壳方法**：当连续函数$f \ge 0$在$0 \le a \le x \le b$下的区域绕$y$轴旋转时，

$$V = 2\pi\int_a^b x\,f(x)\,dx.$$

对于其他区域和垂直轴 $V = 2\pi\int (\text{radius})(\text{height})\,dx$，半径是从轴测量的，高度为上边界减去下边界。当壳法和盘法（washer method）都适用时，它们总是给出相同的体积；练习 12.11 证明了对于一个递减曲线下的区域，这一结论成立。

```check
xs12, dxs, hs = symbols('x Delta_x h', positive=True)
same(pi*(xs12 + dxs)**2*hs - pi*xs12**2*hs, 2*pi*(xs12 + dxs/2)*hs*dxs)
same(2*pi*(xs12 + dxs/2)*hs*dxs - 2*pi*xs12*hs*dxs, pi*hs*dxs**2)
```

::: figure id=fig-12-3
圆柱壳法。左图：区域$y = 4x - x^3$、$0 \le x \le 2$下方，距$y$轴距离$x$处有一条宽度为$\Delta x$的条带。右图：绕$y$轴（虚线）旋转，该条带扫出一个半径为$x$、高为$f(x)$、厚度为$\Delta x$的薄壳，位于蓝色轮廓所示的实体内部。展开后，该壳近似为一个体积为$2\pi x \cdot f(x) \cdot \Delta x$的板。
:::

::: example 当壳法优于盘法时
求当区域在 $y = 4x - x^3$ 和 $0 \le x \le 2$ 下方绕 $y$ 轴旋转时，所扫出的实体的体积。

该区域位于 $x$ 轴上方：对于 $0 \le x \le 2$，有 $4x - x^3 = x(2 - x)(2 + x) \ge 0$。使用壳法，半径为 $x$，高度为 $4x - x^3$，

$$\begin{aligned} V &= 2\pi\int_0^2 x\big(4x - x^3\big)\,dx \\ &= 2\pi\int_0^2 \big(4x^2 - x^4\big)\,dx \\ &= 2\pi\Big(\frac{32}{3} - \frac{32}{5}\Big) = \frac{128\pi}{15} \approx 26.81. \end{aligned}$$

```check
same(factor(4*x - x**3), -x*(x - 2)*(x + 2)); holds(all((4*x - x**3).subs(x, v) >= 0 for v in (0, Rational(1, 2), 1, Rational(3, 2), 2)))
same(expand(x*(4*x - x**3)), 4*x**2 - x**4)
same(integrate(4*x**2, (x, 0, 2)), Rational(32, 3)); same(integrate(x**4, (x, 0, 2)), Rational(32, 5))
steps(2*pi*Integral(4*x**2 - x**4, (x, 0, 2)), 2*pi*(Rational(32, 3) - Rational(32, 5)), 128*pi/15)
rounds(128*pi/15, '26.81')
```
:::

::: keyidea
洗盘法（Washers）的切片垂直于轴；壳层法（Shells）的切片平行于轴。关于水平轴，洗盘法积分在 $x$，壳层法在 $y$；关于垂直轴，洗盘法积分在 $y$，壳层法在 $x$。选择一种方法，其切片只需一个公式，且半径容易写出：当求解 $x$ 时壳层法会很困难，如例 12.8 所示。
:::

::: pitfall
壳层法的半径是其到轴的距离。旋转区域 $y = x$ 和 $y = x^2$ 之间的 $0 \le x \le 1$ 关于直线 $x = 2$，位于 $x$ 处的条带距离轴为 $2 - x$，因此 $V = 2\pi\int_0^1 (2 - x)(x - x^2)\,dx = \pi/2$。使用 $x$ 作为半径将给出 $y$ 轴的体积，即 $\pi/6$。

```check
same(2*pi*integrate((2 - x)*(x - x**2), (x, 0, 1)), pi/2); same(2*pi*integrate(x*(x - x**2), (x, 0, 1)), pi/6)
```
:::

::: compute 使用 SymPy 计算面积和体积
SymPy 通过 `solve` 找出曲线的交点，并通过 `integrate` 计算积分。对于例 12.6 的区域：

```python
import sympy as sp
x, y = sp.symbols('x y')
print(sp.solve(sp.Eq(sp.sqrt(x), x**2), x))       # where the curves meet
print(sp.integrate(sp.sqrt(x) - x**2, (x, 0, 1)))  # the area between them
print(sp.pi*sp.integrate(x - x**4, (x, 0, 1)))     # the volume by washers
```

```output
[0, 1]
1/3
3*pi/10
```

现在用两种方法计算同一体积：区域在 $y = x$ 和 $y = x^2$、$0 \le x \le 1$ 之间，绕 $y$ 轴旋转。壳层的半径为 $x$，高度为 $x - x^2$。水平切片在高度 $y$ 处从 $x = y$ 到 $x = \sqrt y$，因此洗盘的外半径为 $R = \sqrt y$，内半径为 $r = y$：

```python
shells = 2*sp.pi*sp.integrate(x*(x - x**2), (x, 0, 1))
washers = sp.pi*sp.integrate(sp.sqrt(y)**2 - y**2, (y, 0, 1))
print(shells, washers)
```

```output
pi/6 pi/6
```

两种方法结果一致，正如它们必须如此：它们以不同的方式切分同一个立体。
:::

```check
same(integrate(sqrt(x) - x**2, (x, 0, 1)), Rational(1, 3)); same(pi*integrate(y - y**2, (y, 0, 1)), pi/6)
holds(all(sqrt(v) >= v for v in (0, Rational(1, 4), Rational(1, 2), 1)))
```

## 弧长 {#arc-length}

曲线 $y = \sin x$ 从 $x = 0$ 到 $x = \pi$ 一个拱的长度是多少？直尺测量直线段，因此用多边形近似曲线。选择 $n + 1$ 个等间距的点 $x_0 = 0, x_1, \dots, x_n = \pi$，并将曲线邻近点用直线连接。根据勾股定理，从 $\big(x_{i-1}, f(x_{i-1})\big)$ 到 $\big(x_i, f(x_i)\big)$ 的弦长为 $\sqrt{(\Delta x)^2 + (\Delta y_i)^2}$，其中 $\Delta y_i = f(x_i) - f(x_{i-1})$。随着 $n$ 增大，多边形更贴近曲线：

| 弦 $n$ | 多边形的长度 |
|---|---|
| 1 | 3.14159 |
| 2 | 3.72419 |
| 4 | 3.79009 |
| 8 | 3.81253 |
| 16 | 3.81827 |
| 64 | 3.82008 |

长度增加：每个多边形的顶点都是下一个多边形的顶点，用两个弦代替一条弦不会缩短路径，因为直线段是其两端点之间的最短路径。并且它们趋于接近 3.820。这个数就是曲线长度的含义。

```check
import mpmath
mpmath.mp.dps = 30
def poly12(n_):
    return mpmath.fsum(mpmath.sqrt((mpmath.pi/n_)**2 + (mpmath.sin(i_*mpmath.pi/n_) - mpmath.sin((i_ - 1)*mpmath.pi/n_))**2) for i_ in range(1, n_ + 1))
for n_, txt in ((1, '3.14159'), (2, '3.72419'), (4, '3.79009'), (8, '3.81253'), (16, '3.81827'), (64, '3.82008')):
    rounds(poly12(n_), txt)
holds(all(poly12(n_) < poly12(2*n_) for n_ in (1, 2, 4, 8, 16, 32)))
rounds(poly12(64), '3.820')
```

::: definition 弧长
**长度**（或**弧长**）是$f$从$x = a$到$x = b$的图形的长度，即当$n \to \infty$时，其顶点为$n + 1$处等距值$a = x_0 < x_1 < \dots < x_n = b$的图形上各点的多边形长度的极限，如果该极限存在。
:::

::: theorem 弧长公式
如果 $f'$ 在 $[a, b]$ 上连续，那么曲线 $f$ 从 $x = a$ 到 $x = b$ 的长度是

$$L = \int_a^b \sqrt{1 + f'(x)^2}\,dx.$$
:::

::: proof
根据中值定理（模块 8），应用于 $f$ 在 $[x_{i-1}, x_i]$ 上，存在该区间内的一个点 $x_i^*$，使得 $\Delta y_i = f'(x_i^*)\,\Delta x$。因此，第 $i$ 条弦的长度为

$$\begin{aligned} &\sqrt{(\Delta x)^2 + f'(x_i^*)^2(\Delta x)^2} \\ &\qquad= \sqrt{1 + f'(x_i^*)^2}\,\Delta x, \end{aligned}$$

和这个多边形的长度为 $\sum_{i=1}^{n} \sqrt{1 + f'(x_i^*)^2}\,\Delta x$。这是函数 $\sqrt{1 + f'(x)^2}$ 的一个黎曼和，该函数在 $[a, b]$ 上连续，因为 $f'$ 是连续的。因此，当 $n \to \infty$ 趋于 0 时，多边形的长度趋近于 $\int_a^b \sqrt{1 + f'(x)^2}\,dx$（模块 9）。
:::

```check
dxp, fp_ = symbols('Delta_x f_p', positive=True)
same(sqrt(dxp**2 + fp_**2*dxp**2), sqrt(1 + fp_**2)*dxp)
```

在莱布尼茨记号中，曲线的一小段是直角三角形斜边，该直角三角形的两条直角边分别为 $dx$ 和 $dy$： $dL = \sqrt{(dx)^2 + (dy)^2} = \sqrt{1 + (dy/dx)^2}\,dx$。模块 16 将公式推广到由参数方程给出的曲线。

::: example 悬挂的电缆
一根缆绳或链条在自身重力作用下会形成一个悬链线（模块 6），即函数 $y = a\cosh(x/a)$ 的图像，其中 $a > 0$ 为常数，而 $\cosh$ 是双曲余弦函数。求悬链线 $y = \cosh x$ 从 $x = -1$ 到 $x = 1$ 的长度。

这里 $f'(x) = \sinh x$，且由恒等式 $\cosh^2 x - \sinh^2 x = 1$（模块 6）可得 $1 + \sinh^2 x = \cosh^2 x$。由于 $\cosh x > 0$， $\sqrt{1 + f'(x)^2} = \cosh x$，和

$$\begin{aligned} L &= \int_{-1}^{1} \cosh x\,dx = \big[\sinh x\big]_{-1}^{1} \\ &= 2\sinh 1 = e - e^{-1} \approx 2.350. \end{aligned}$$

以米为单位：一根 2.350 米长的缆绳，挂在两个高度为 $\cosh 1 \approx 1.543$ 米的钩子之间，两钩相距 2 米，缆绳下垂至最低点距离地面 1 米。

```check
same(diff(cosh(x), x), sinh(x)); same(1 + sinh(x)**2, cosh(x)**2)
xr12 = symbols('x', real=True); same(sqrt(1 + sinh(xr12)**2), cosh(xr12))
same(integrate(cosh(x), (x, -1, 1)), 2*sinh(1)); same(2*sinh(1), E - exp(-1))
rounds(2*sinh(1), '2.350'); rounds(cosh(1), '1.543'); same(cosh(0), 1)
```
:::

当弧长公式中的平方根没有初等原函数时，数值积分可以近似长度。

::: example 一个正弦曲线的拱形
求 $y = \sin x$、$0 \le x \le \pi$ 的长度。

这里 $f'(x) = \cos x$，所以 $L = \int_0^\pi \sqrt{1 + \cos^2 x}\,dx$。这是一个椭圆积分。它的被积函数没有初等原函数，这是一个我们不加证明而直接使用的事实。[模块 11](module_11_ZH.html#nonelementary) 解释了这意味着什么。使用辛普森法则来近似长度。利用 $n = 4$ 和 $\Delta x = \pi/4$，你需要在五个点 $g(x) = \sqrt{1 + \cos^2 x}$：$g(0) = g(\pi) = \sqrt2$、$g(\pi/4) = g(3\pi/4) = \sqrt{3/2}$ 和 $g(\pi/2) = 1$。因此

$$\begin{aligned} S_4 &= \frac{\pi/4}{3}\Big[\sqrt2 + 4\sqrt{\tfrac32} + 2 \cdot 1 \\ &\qquad + 4\sqrt{\tfrac32} + \sqrt2\Big] \\ &= \frac{\pi}{12}\Big(2\sqrt2 + 8\sqrt{\tfrac32} + 2\Big) \\ &\approx 3.8292. \end{aligned}$$

使用更多点时，辛普森法则给出 $S_8 \approx 3.82028$ 和 $S_{16} \approx 3.8201978$（下面的“动手计算”框中），因此拱形的长度为 $L \approx 3.8202$，正如多边形所暗示的那样。这比其底边 $\pi$ 约长 21.6%：一种波浪形金属板，其轮廓为正弦曲线，需要比其宽度多出这么多的平直金属板。

```check
g1210 = sqrt(1 + cos(x)**2)
same([g1210.subs(x, v) for v in (0, pi/4, pi/2, 3*pi/4, pi)], [sqrt(2), sqrt(Rational(3, 2)), 1, sqrt(Rational(3, 2)), sqrt(2)])
S4_12 = (pi/4)/3*(sqrt(2) + 4*sqrt(Rational(3, 2)) + 2 + 4*sqrt(Rational(3, 2)) + sqrt(2))
same(S4_12, pi/12*(2*sqrt(2) + 8*sqrt(Rational(3, 2)) + 2)); rounds(S4_12, '3.8292')
def simp12(n_):
    h_ = mpmath.pi/n_
    gg = lambda X: mpmath.sqrt(1 + mpmath.cos(X)**2)
    return h_/3*(gg(0) + gg(mpmath.pi) + mpmath.fsum((4 if i_ % 2 else 2)*gg(i_*h_) for i_ in range(1, n_)))
rounds(simp12(8), '3.82028'); rounds(simp12(16), '3.8201978')
L1210 = mpmath.quad(lambda X: mpmath.sqrt(1 + mpmath.cos(X)**2), [0, mpmath.pi])
rounds(L1210, '3.8202'); rounds(100*(L1210/mpmath.pi - 1), '21.6')
same(diff(sin(x), x), cos(x))
```
:::

::: pitfall
逼近必须遵循曲线的方向。一个由 $n$ 水平步和 $n$ 垂直步组成的阶梯，每个步长为 $1/n$，沿着单位正方形的对角线从一个角到另一个角。它的长度为 $2n \cdot \tfrac1n = 2$，无论 $n$ 取何值，它可以任意接近对角线；然而，对角线的长度为 $\sqrt2 \approx 1.414$。每个步将对角线长度为 $\sqrt{(\Delta x)^2 + (\Delta y)^2}$ 的一段替换为 $\Delta x + \Delta y$，无论将这段分成多小的部分，替换后的长度都不接近原长度。弦沿着曲线方向，而阶梯则不然。

```check
nst = symbols('n', positive=True, integer=True)
same(2*nst*(1/nst), 2); rounds(sqrt(2), '1.414')
same((Rational(1, 7) + Rational(1, 7))/sqrt(Rational(1, 7)**2 + Rational(1, 7)**2), sqrt(2))
```
:::

::: compute 用计算机计算弧长
多边形和辛普森法则只需几行 Python 代码。 `math.hypot(dx, dy)` 是 $\sqrt{dx^2 + dy^2}$，毕达哥拉斯定理：

```python
import math

def polygon(f, a, b, n):
    """Polygon through n + 1 equally spaced points of y = f(x)."""
    xs = [a + (b - a)*i/n for i in range(n + 1)]
    return sum(math.hypot(xs[i + 1] - xs[i], f(xs[i + 1]) - f(xs[i]))
               for i in range(n))

def simpson(g, a, b, n):
    """Simpson's rule with n subintervals (n even)."""
    h = (b - a)/n
    inner = sum((4 if i % 2 else 2)*g(a + i*h) for i in range(1, n))
    return h/3*(g(a) + inner + g(b))

P = polygon(math.sin, 0, math.pi, 1000)
print(f"polygon, 1000 chords: {P:.10f}")
g = lambda x: math.sqrt(1 + math.cos(x)**2)
for n in [4, 8, 16, 32]:
    print(f"Simpson, n = {n:2d}:     {simpson(g, 0, math.pi, n):.10f}")
```

```output
polygon, 1000 chords: 3.8201972963
Simpson, n =  4:     3.8291789256
Simpson, n =  8:     3.8202824061
Simpson, n = 16:     3.8201978136
Simpson, n = 32:     3.8201977890
```

即使有上千条弦，误差也大约为 $5 \times 10^{-7}$，而使用 $n = 32$ 的辛普森法则与真实长度在显示的十位小数上完全一致。SymPy 可以计算出任意多的小数位的积分结果。当要求反函数时，它返回未计算的积分形式：它没有找到初等反函数。（虽然确实不存在，但 SymPy 的失败并不能单独证明这一点。）

```python
import sympy as sp
x = sp.symbols('x')
print(sp.Integral(sp.sqrt(1 + sp.cos(x)**2), (x, 0, sp.pi)).evalf(20))
print(sp.integrate(sp.sqrt(1 + sp.cos(x)**2), x))
```

```output
3.8201977890277120179
Integral(sqrt(cos(x)**2 + 1), x)
```
:::

```check
Lp12 = mpmath.quad(lambda X: mpmath.sqrt(1 + mpmath.cos(X)**2), [0, mpmath.pi])
rounds((Lp12 - poly12(1000))*10**7, '5'); rounds(poly12(1000), '3.8201972963')
rounds(Lp12, '3.8201977890'); rounds(simp12(32), '3.8201977890'); rounds(simp12(4), '3.8291789256')
```

## 功 {#work}

匀速提起一袋2 kg的面粉1.5 m。你施加的力等于其重量，$mg = 2 \times 9.8 = 19.6$ 牛顿（N），其中 $g \approx 9.8$ m/s² 是重力加速度（模块1）。恒力 $F$ 作用距离 $d$ 所做的功为 **功** $W = Fd$，此处 $19.6 \times 1.5 = 29.4$ 焦耳（J）：1 牛顿的力作用1米所做的功为1焦耳。当力沿路径变化时，将路径分段。在长度为 $\Delta x$ 的短段上，力几乎恒定，因此该段所做的功约为 $F(x)\,\Delta x$。

```check
same(2*Rational(98, 10), Rational(196, 10)); same(Rational(196, 10)*Rational(15, 10), Rational(294, 10))
```

::: definition 功
如果一个连续的力 $F(x)$ 沿一条直线作用，使物体从 $x = a$ 移动到 $x = b$，则所做的 **功** 为

$$W = \int_a^b F(x)\,dx.$$
:::

**弹簧.**拉伸一个弹簧 $x$ 米超过其自然长度，它会以与 $x$: $F(x) = kx$ 成正比的力拉回，其中**弹簧常数**$k$ 的单位是 N/m。这就是**虎克定律**。它适用于不太大的拉伸（在弹簧的弹性限度内），也适用于压缩。要拉伸弹簧，你必须自己施加这个力 $kx$。

::: example 拉伸弹簧
一个 30 N 的力使弹簧拉伸到其自然长度以外 0.15 m 处。将其拉伸（a）从自然长度到其自然长度以外 0.15 m 处，以及（b）从自然长度以外 0.15 m 到 0.30 m 处，需要做多少功？

根据虎克定律 $30 = k \times 0.15$，因此 $k = 200$ N/m，且在拉伸 $x$ 处所需的力为 $200x$ N。 $200x$ 的一个原函数是 $100x^2$。

**(a)** $W = \int_0^{0.15} 200x\,dx = \big[100x^2\big]_0^{0.15} = 100 \times 0.0225 = 2.25$ J.

**(b)** $W = \big[100x^2\big]_{0.15}^{0.30} = 9 - 2.25 = 6.75$ J: 三倍于相同额外 0.15 m 的功，因为弹簧被拉伸得越多，拉力越强。

```check
k12 = Rational(30)/Rational(15, 100); same(k12, 200)
antideriv(100*x**2, 200*x, x)
steps(Integral(200*x, (x, 0, Rational(15, 100))), 100*Rational(225, 10000), Rational(225, 100))
steps(Integral(200*x, (x, Rational(15, 100), Rational(30, 100))), 9 - Rational(225, 100), Rational(675, 100))
same(Rational(675, 100)/Rational(225, 100), 3)
```
:::

::: pitfall
“力乘以距离”仅适用于恒定的力。在 (a) 中， $30 \times 0.15 = 4.5$ J 是真实功的两倍：力从 0 增加到 30 N，其在拉伸过程中的平均值为 15 N。而 $x$ 是超出自然长度的部分，不是弹簧的总长度。

```check
same(30*Rational(15, 100), Rational(45, 10)); same(Rational(45, 10)/Rational(225, 100), 2)
same(integrate(200*x, (x, 0, Rational(15, 100)))/Rational(15, 100), 15)
```
:::

**提起一根绳子。** 当物体的不同部分移动不同距离时，将物体切片，而不是路径。

::: example 提起一根绳子
一根 20 m 长的绳子，每米质量为 0.4 kg，从建筑物顶部垂下（图 12.4，左图）。将整根绳子提起至顶部需要做多少功？

从顶部向下测量深度 $y$。深度 $y$ 和 $y + \Delta y$ 之间的绳子质量为 $0.4\,\Delta y$ kg，重力为 $0.4 \times 9.8\,\Delta y = 3.92\,\Delta y$ N，被提起约 $y$ 米。因此其功约为 $3.92\,y\,\Delta y$ J，

$$\begin{aligned} W &= \int_0^{20} 3.92\,y\,dy \\ &= 3.92 \times \frac{20^2}{2} = 784 \text{ J}. \end{aligned}$$

切割运动反而得到相同的结果：当 $x$ 米被拉起时，悬挂部分的重量为 $3.92(20 - x)$ N，且做功为 $\int_0^{20} 3.92(20 - x)\,dx = 784$ J。

```check
same(Rational(4, 10)*Rational(98, 10), Rational(392, 100))
steps(Integral(Rational(392, 100)*y, (y, 0, 20)), Rational(392, 100)*20**2/2, 784)
same(integrate(Rational(392, 100)*(20 - x), (x, 0, 20)), 784)
```
:::

::: pitfall
绳子的重量为 $3.92 \times 20 = 78.4$ N，但所做的功不是 $78.4 \times 20 = 1568$ J：只有绳子的末端上升了 20 m，而顶端几乎不动。平均而言，绳子上升了 10 m，因此做功为 $78.4 \times 10 = 784$ J。这个平均值即为绳子质心的深度（第 12.7 节）。

```check
same(Rational(392, 100)*20, Rational(784, 10)); same(Rational(784, 10)*20, 1568); same(Rational(784, 10)*10, 784)
```
:::

**抽水液体。** 为了排空一个储罐，将液体切成薄的水平层：每一层整体被提升至出口。

::: figure id=fig-12-4
左图：一根 20 m 长的绳子从建筑物顶部垂下；深度为 $y$ 的部分，长度为 $\Delta y$，被拉起了 $y$ 米（例 12.12）。右图：例 12.13 中的锥形储罐，深 4 m，顶部半径为 2 m；高度为 $y$ 处的水层，半径为 $y/2$，被抽到顶部提升了 $4 - y$ 米。
:::

::: example 排空储罐
圆锥形水箱如[例7.2](module_07_ZH.html#more-rates)]，深4米，顶点在底部，顶部半径为2米，装满水，水的密度为1000 kg/m³。将所有水抽到顶部需要做多少功？

设$y$为顶点以上的高度（图12.4，右）。如例7.2所示，相似三角形给出高度为$y$时水面的半径为$y/2$。高度在$y$到$y + \Delta y$之间的水层近似为一个半径为$y/2$、厚度为$\Delta y$的圆盘，因此

- 体积约为$\pi(y/2)^2\,\Delta y = \tfrac{\pi}{4}y^2\,\Delta y$ m³，
- 质量约为$1000 \cdot \tfrac{\pi}{4}y^2\,\Delta y = 250\pi y^2\,\Delta y$ kg，
- 重力约为$9.8 \times 250\pi y^2\,\Delta y = 2450\pi y^2\,\Delta y$ N，

并被提升到顶部，即提升$4 - y$米。因此

$$\begin{aligned} W &= \int_0^4 2450\pi y^2(4 - y)\,dy \\ &= 2450\pi\Big[\frac{4y^3}{3} - \frac{y^4}{4}\Big]_0^4 \\ &= 2450\pi\Big(\frac{256}{3} - 64\Big) \\ &= \frac{156\,800\pi}{3} \approx 1.64 \times 10^5 \text{ J}, \end{aligned}$$

约需164 kJ。一台500瓦的泵，即每秒500焦耳，若无能量损耗，大约需要5.5分钟。

```check
same(pi*(y/2)**2, pi*y**2/4); same(1000*pi*y**2/4, 250*pi*y**2); same(Rational(98, 10)*250*pi*y**2, 2450*pi*y**2)
antideriv(4*y**3/3 - y**4/4, y**2*(4 - y), y)
same((4*y**3/3 - y**4/4).subs(y, 4), Rational(256, 3) - 64)
W1213 = integrate(2450*pi*y**2*(4 - y), (y, 0, 4))
same(W1213, 156800*pi/3); rounds(W1213/10**5, '1.64'); rounds(W1213/1000, '164')
rounds(W1213/500/60, '5.5')
```
:::

::: pitfall
使用重量，而不是质量：质量为 $m$ 千克的一层需要 $mg$ 牛顿的力才能将其提起，因此必须出现因子 $g = 9.8$，否则答案不会以焦耳为单位。并测量该层到液体顶部的距离：到顶部这里为 $4 - y$；到顶部上方 1 米的出水口为 $5 - y$。
:::

## 质心与形心 {#centre-of-mass}

跷跷板平衡时满足杠杆定律，两侧的质量与到支点距离的乘积相同。在一条直线上，位于 $x_1, \dots, x_n$ 的质量 $m_1, \dots, m_n$ 在它们的**质心**处平衡：

$$\bar x = \frac{m_1x_1 + \dots + m_nx_n}{m_1 + \dots + m_n} = \frac{\sum m_ix_i}{\sum m_i},$$

读作「x 加横线」。和 $\sum m_ix_i$ 是这些质量相对于原点的**矩**。改从 $\bar x$ 计量时，各矩相互抵消，即 $\sum m_i(x_i - \bar x) = \sum m_ix_i - \bar x\sum m_i = 0$。例如，质量分别为 30 千克和 20 千克的孩子坐在 $x = 0$ 与 $x = 3$ 米处，平衡点在 $\bar x = (30 \cdot 0 + 20 \cdot 3)/50 = 1.2$ 米处，靠近较重的孩子。

```check
same((30*0 + 20*3)/Rational(50), Rational(12, 10)); same(30*(0 - Rational(12, 10)) + 20*(3 - Rational(12, 10)), 0)
```

**细杆。** 将沿 $[a, b]$、密度为 $\rho(x)$ 的细杆切成许多小段。$x$ 处小段的质量约为 $\rho(x)\,\Delta x$，对原点的矩约为 $x\,\rho(x)\,\Delta x$。求和再取极限：

::: definition 细杆的质心
沿 $[a, b]$ 的细杆具有连续的密度 $\rho(x) > 0$，其质量为 $M = \int_a^b \rho(x)\,dx$，**质心**为

$$\bar x = \frac{1}{M}\int_a^b x\,\rho(x)\,dx.$$
:::

::: example 第 12.1 节的细杆
求第 12.1 节中细杆的质心。其密度为 $\rho(x) = 1 + x^2$ 千克/米，其中 $0 \le x \le 2$。

它的质量为 $M = \tfrac{14}{3}$ 千克。它对原点的矩为

$$\begin{aligned} \int_0^2 x\big(1 + x^2\big)\,dx &= \Big[\frac{x^2}{2} + \frac{x^4}{4}\Big]_0^2 \\ &= 2 + 4 = 6 \text{ kg m}, \end{aligned}$$

因此，质心距密度较小的一端 $\bar x = 6 \big/ \tfrac{14}{3} = \tfrac{9}{7} \approx 1.29$ 米，越过中点而靠近密度较大的一端，符合预期。

```check
antideriv(x**2/2 + x**4/4, x*(1 + x**2), x)
steps(Integral(x*(1 + x**2), (x, 0, 2)), 2 + 4, 6)
same(6/Rational(14, 3), Rational(9, 7)); rounds(Rational(9, 7), '1.29'); holds(Rational(9, 7) > 1)
```
:::

**薄板。**一块很薄的平板称为**薄片**。这里假定各点的面密度（单位面积的质量）相同，模块 19 将讨论密度变化的情形。薄板的质心是所在平面内的点 $(\bar x, \bar y)$。设薄板占据 $y = g(x)$ 与 $y = f(x)$ 之间的区域，其中 $a \le x \le b$。沿竖直方向将它切成细条。$x$ 处的细条近似为宽 $\Delta x$、高 $f(x) - g(x)$ 的矩形。由于对称，它在中心 $\big(x, \tfrac12(f(x) + g(x))\big)$ 平衡，质量为面密度乘面积。用每条的质量对其坐标加权，再取极限，便得到下面的公式。密度约去，因此质心只由形状决定。计算 $\bar y$ 时，每条中心的高度乘以面积等于 $\tfrac12(f + g)(f - g)\,\Delta x = \tfrac12\big(f^2 - g^2\big)\,\Delta x$。

::: definition 薄板的形心
设 $f$ 和 $g$ 在 $[a, b]$ 上连续，且 $g \le f$。假设两图像之间区域的面积为 $A > 0$。该区域的**形心**是点 $(\bar x, \bar y)$，其坐标满足

$$\begin{aligned} \bar x &= \frac1A\int_a^b x\big(f(x) - g(x)\big)\,dx, \\ \bar y &= \frac1A\int_a^b \frac12\big(f(x)^2 - g(x)^2\big)\,dx. \end{aligned}$$

占据该区域的均匀薄板在其形心处平衡。
:::

**对称性。** 若一个区域关于某条直线对称，其形心便在这条直线上，因为两侧互为镜像的细条关于该直线的矩彼此抵消。

::: example 半圆盘
求半圆盘 $x^2 + y^2 \le a^2$、$y \ge 0$ 的形心，其中半径 $a > 0$。

半圆盘关于 $y$ 轴对称，因此 $\bar x = 0$。其面积为 $A = \tfrac12\pi a^2$，代入 $f(x) = \sqrt{a^2 - x^2}$ 与 $g(x) = 0$ 得

$$\begin{aligned} \bar y &= \frac{2}{\pi a^2}\int_{-a}^{a} \frac12\big(a^2 - x^2\big)\,dx \\ &= \frac{2}{\pi a^2}\cdot\frac12\cdot\frac{4a^3}{3} = \frac{4a}{3\pi} \approx 0.424a. \end{aligned}$$

半圆薄板的平衡点在从直边向上约半径的 42% 处，低于一半高度，因为靠近直边的部分面积更大。

```check
same(integrate(x*sqrt(aq**2 - x**2), (x, -aq, aq)), 0)
same(integrate(aq**2 - x**2, (x, -aq, aq)), 4*aq**3/3)
same(1/(pi*aq**2/2)*integrate((aq**2 - x**2)/2, (x, -aq, aq)), 4*aq/(3*pi))
rounds(4/(3*pi), '0.424'); holds(4/(3*pi) < Rational(1, 2))
```
:::

::: pitfall
计算 $\bar y$ 时，分子中的式子是 $\tfrac12\big(f^2 - g^2\big)$，容易误写成 $\tfrac12(f - g)^2$。两个坐标都要除以面积（细杆的质心则除以质量）。可快速检查结果：形心的横坐标应介于区域最左端与最右端之间，纵坐标应介于最低点与最高点之间。
:::

## 反常积分 {#improper}

到目前为止，每一个积分都有一个有限区间和一个有界的被积函数。概率，以及许多物理问题，需要更多：比如 $y = 1/x^2$ 在所有 $x \ge 1$ 下的面积，或者 $y = 1/\sqrt x$ 在 $0 < x \le 1$ 下的面积，其中曲线在 0 附近迅速上升。这样的积分称为 **不正确定积分（improper integral）**。它们被定义为普通积分的极限。

### 无限区间 {#infinite-intervals}

$y = 1/x^2$ 从 1 到 $t$ 下的面积是 $\int_1^t x^{-2}\,dx = \big[-\tfrac1x\big]_1^t = 1 - \tfrac1t$，而 $y = 1/x$ 下的面积是 $\int_1^t x^{-1}\,dx = \ln t$：

```valuetable
t = 10, 100, Pow(10, 4, evaluate=False), Pow(10, 6, evaluate=False)
$\int_1^t dx/x^2$ = 1 - 1/t
$\int_1^t dx/x$ = log(t)
digits = 6
---
t | \int_1^t dx/x^2 | \int_1^t dx/x
10 | 0.9 | 2.30259
100 | 0.99 | 4.60517
10^{4} | 0.9999 | 9.21034
10^{6} | 0.999999 | 13.8155
```

当 $t \to \infty$ 趋于无穷时，第一个积分趋近于 1，而第二个积分无限增长，但增长缓慢。曲线 $1/x^2$ 下的区域，虽然无限长，但面积有限，为 1；而曲线 $1/x$ 下的区域则没有有限面积。两条曲线看起来相似，但 $1/x^2$ 趋于 0 的速度更快。

```check
antideriv(-1/x, x**-2, x); same(integrate(x**-2, (x, 1, t)), 1 - 1/t)
tp12 = symbols('t', positive=True); same(integrate(1/x, (x, 1, tp12)), log(tp12))
limit_is(1 - 1/t, t, oo, 1); limit_is(log(t), t, oo, oo)
```

::: definition 无限区间上的不正确定积分
设 $f$ 在 $[a, \infty)$ 上连续。则

$$\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx.$$

不正积分 **收敛**如果这个极限存在（作为一个有限数），并且**发散** 否则。同样地，对于 $f$ 在 $(-\infty, b]$ 上连续， $\int_{-\infty}^b f(x)\,dx = \lim_{t\to-\infty}\int_t^b f(x)\,dx$。对于 $f$ 在 $\R$ 上连续，

$$\begin{aligned} \int_{-\infty}^{\infty} f(x)\,dx &= \int_{-\infty}^{c} f(x)\,dx \\ &\qquad + \int_{c}^{\infty} f(x)\,dx, \end{aligned}$$

对于任何数 $c$，只要右边的两个积分都收敛；如果其中任何一个发散，左边的积分也发散。
:::

$\int_{-\infty}^{\infty}$ 读作“从负无穷到正无穷的积分”。选择 $c$ 不影响结果：移动它只是将一个普通积分从一边移到另一边。 $t \to \pm\infty$ 的极限是模块 3 中的无穷远极限。

::: example 无限区间上的积分
评价 (a) $\displaystyle\int_0^\infty e^{-x}\,dx$, (b) $\displaystyle\int_0^\infty xe^{-x}\,dx$ 和 (c) $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{1 + x^2}$。

**(a)** $\int_0^t e^{-x}\,dx = \big[-e^{-x}\big]_0^t = 1 - e^{-t} \to 1$ 作为 $t \to \infty$。积分收敛，结果为 1。

**(b)** 分部积分（模块 11），使用 $u = x$ 和 $dv = e^{-x}\,dx$，得到原函数 $-xe^{-x} - e^{-x}$，因此 $\int_0^t xe^{-x}\,dx = 1 - (t + 1)e^{-t}$。当 $t \to \infty$ 时， $te^{-t} = t/e^t \to 0$，因为幂函数增长比指数函数慢（[定理 7.7](module_07_ZH.html#growth))，且 $e^{-t} \to 0$。积分收敛，结果为 1。

**(c)** 分割于 $c = 0$。如同 $t \to \infty$， $\int_0^t \frac{dx}{1 + x^2} = \arctan t \to \frac{\pi}{2}$（模块 6）；如同 $t \to -\infty$， $\int_t^0 \frac{dx}{1 + x^2} = -\arctan t \to \frac{\pi}{2}$。两个部分都收敛，因此积分收敛，结果为 $\pi$。

```check
limit_is(integrate(exp(-x), (x, 0, t)), t, oo, 1); same(integrate(exp(-x), (x, 0, t)), 1 - exp(-t))
antideriv(-x*exp(-x) - exp(-x), x*exp(-x), x)
same(integrate(x*exp(-x), (x, 0, t)), 1 - (t + 1)*exp(-t)); limit_is(t*exp(-t), t, oo, 0); limit_is(1 - (t + 1)*exp(-t), t, oo, 1)
antideriv(atan(x), 1/(1 + x**2), x); limit_is(atan(t), t, oo, pi/2); limit_is(-atan(t), t, -oo, pi/2)
same(integrate(1/(1 + x**2), (x, 0, t)), atan(t)); same(integrate(1/(1 + x**2), (x, t, 0)), -atan(t))
same(integrate(1/(1 + x**2), (x, -oo, oo)), pi)
```
:::

::: pitfall
$\int_{-\infty}^{\infty} x\,dx$ 不等于 0。对于每一个 $t$，确实成立 $\int_{-t}^{t} x\,dx = 0$，但定义将两个部分分开考虑，而 $\int_0^\infty x\,dx = \lim_{t\to\infty} t^2/2$ 不存在：积分发散。对称极限在积分发散时可以有限，因此不能用于计算 $\int_{-\infty}^{\infty}$。

```check
same(integrate(x, (x, -t, t)), 0); limit_is(integrate(x, (x, 0, t)), t, oo, oo)
```
:::

### 无界被积函数 {#unbounded}

::: definition 无界函数的瑕积分
设 $f$ 在 $[a, b)$ 上连续，并且在 $b$ 附近无界。则

$$\int_a^b f(x)\,dx = \lim_{t\to b^-}\int_a^t f(x)\,dx,$$

若定义积分的极限存在且有限，则积分**收敛**，否则积分**发散**。类似地，若 $f$ 在 $(a, b]$ 上连续且在 $a$ 附近无界，则 $\int_a^b f(x)\,dx = \lim_{t\to a^+}\int_t^b f(x)\,dx$。若 $f$ 在 $[a, b]$ 上除内点 $c$ 外连续，并在该点附近无界，则 $\int_a^b f(x)\,dx = \int_a^c f(x)\,dx + \int_c^b f(x)\,dx$，且只有右侧两个积分都收敛时，原积分才收敛。
:::

::: example 无界被积函数
计算 (a) $\displaystyle\int_0^1 \frac{dx}{\sqrt x}$ 和 (b) $\displaystyle\int_0^1 \ln x\,dx$。

**(a)** 被积函数在 0 附近无界。对于 $0 < t < 1$, $\int_t^1 x^{-1/2}\,dx = \big[2\sqrt x\big]_t^1 = 2 - 2\sqrt t$，其趋于 2 当 $t \to 0^+$。积分收敛，结果为 2。

**(b)** $\ln x \to -\infty$ 作为 $x \to 0^+$。$\ln x$ 的一个原函数是 $x\ln x - x$（通过分部积分，模块 11），因此

$$\begin{aligned} \int_t^1 \ln x\,dx &= (0 - 1) - (t\ln t - t) \\ &= -1 - t\ln t + t. \end{aligned}$$

当 $t \to 0^+$, $t\ln t \to 0$ ([例 7.15](module_07_ZH.html#products-differences))，因此积分收敛，结果为 $-1$。图象与 $x$ 轴之间的区域无限深，但其面积为 1；积分为负，因为该区域位于轴下方。

```check
same(integrate(x**Rational(-1, 2), (x, t, 1)), 2 - 2*sqrt(t)); limit_is(2 - 2*sqrt(t), t, 0, 2, '+')
antideriv(x*log(x) - x, log(x), x)
same((x*log(x) - x).subs(x, 1) - (x*log(x) - x).subs(x, t), -1 - t*log(t) + t)
limit_is(t*log(t), t, 0, 0, '+'); limit_is(-1 - t*log(t) + t, t, 0, -1, '+'); same(integrate(log(x), (x, 0, 1)), -1)
```
:::

::: pitfall
无界被积函数可能隐藏在区间内。盲目应用微积分基本定理，

$$\int_{-1}^{1}\frac{dx}{x^2} \overset{?}{=} \Big[-\frac1x\Big]_{-1}^{1} = -1 - 1 = -2,$$

这显然不对：被积函数为正。微积分基本定理要求被积函数在 $[-1, 1]$ 上连续，而 $1/x^2$ 在 0 处未定义。积分在 0 处为瑕积分，其右半部分发散： $\int_t^1 x^{-2}\,dx = \tfrac1t - 1 \to \infty$ 当 $t \to 0^+$。因此积分发散。在积分前，应先寻找被积函数发散的点。

```check
same((-1/x).subs(x, 1) - (-1/x).subs(x, -1), -2)
same(integrate(x**-2, (x, t, 1)), 1/t - 1); limit_is(1/t - 1, t, 0, oo, '+'); same(integrate(1/x**2, (x, -1, 1)), oo)
```
:::

### $p$-积分 {#p-integrals}

这些例子表明了一种积分类型，可以用它来衡量其他积分。

::: theorem $p$-积分
设 $p$ 为一个实数。

(a) 若 $p > 1$，则 $\displaystyle\int_1^\infty \frac{dx}{x^p}$ 收敛于 $\dfrac{1}{p - 1}$；若 $p \le 1$，则发散。

(b) 若 $p < 1$，则 $\displaystyle\int_0^1 \frac{dx}{x^p}$ 收敛于 $\dfrac{1}{1 - p}$；若 $p \ge 1$，则发散。
:::

::: proof
对于 $p \ne 1$，若 $x^{-p}$ 的一个原函数为 $\dfrac{x^{1-p}}{1-p}$（幂法则，第 10 模块）。

(a) 对于 $t > 1$，若 $\int_1^t x^{-p}\,dx = \dfrac{t^{1-p} - 1}{1 - p}$。若 $p > 1$，则 $1 - p < 0$ 和 $t^{1-p} = 1/t^{p-1} \to 0$ 当 $t \to \infty$，因此积分趋近于 $\dfrac{-1}{1 - p} = \dfrac{1}{p - 1}$。若 $p < 1$，则 $t^{1-p} \to \infty$，积分发散。若 $p = 1$，则 $\int_1^t dx/x = \ln t \to \infty$。

(b) 对于 $0 < t < 1$，若 $\int_t^1 x^{-p}\,dx = \dfrac{1 - t^{1-p}}{1 - p}$。若 $p < 1$，则 $t^{1-p} \to 0$ 当 $t \to 0^+$，积分趋近于 $\dfrac{1}{1 - p}$。若 $p > 1$，则 $t^{1-p} = 1/t^{p-1} \to \infty$，积分发散。若 $p = 1$，则 $\int_t^1 dx/x = -\ln t \to \infty$。
:::

```check
pr = symbols('p', real=True)
antideriv(x**(1 - pr)/(1 - pr), x**(-pr), x)
q12 = symbols('q', positive=True)                         # p = 1 + q > 1, and p = 1 - q < 1
tq = symbols('t', positive=True)
same(integrate(x**(-(1 + q12)), (x, 1, tq)), (tq**(-q12) - 1)/(-q12)); limit_is((tq**(-q12) - 1)/(-q12), tq, oo, 1/q12)
same(1/q12, 1/((1 + q12) - 1)); limit_is((tq**q12 - 1)/q12, tq, oo, oo)
same(integrate(x**(-(1 - q12)), (x, tq, 1)), (1 - tq**q12)/q12); limit_is((1 - tq**q12)/q12, tq, 0, 1/q12, '+')
same(1/q12, 1/(1 - (1 - q12))); limit_is((1 - tq**(-q12))/(-q12), tq, 0, oo, '+')
limit_is(log(tq), tq, oo, oo); limit_is(-log(tq), tq, 0, oo, '+')
for pv in (Rational(1, 2), 2, 3):
    same(integrate(x**(-pv), (x, 1, oo)), 1/(pv - 1) if pv > 1 else oo)
for pv in (Rational(1, 2), Rational(-1, 2), 2):
    same(integrate(x**(-pv), (x, 0, 1)), 1/(1 - pv) if pv < 1 else oo)
```

对于 $p \le 0$，(b) 中的积分是一个普通积分，因为 $x^{-p}$ 在 $[0, 1]$ 上连续，且公式 $1/(1 - p)$ 仍给出其值。

::: keyidea
在无穷远处， $1/x^p$ 必须比 $1/x$ 下降得更快，才能使面积有限；在 0 附近，它必须比 $1/x$ 增长得更慢。边界函数 $1/x$ 在两端都失效，因此 $\int_0^\infty dx/x^p$ 对于每个 $p$ 都发散：其两个部分中的一个总是发散。
:::

### 比较 {#comparison}

大多数瑕积分无法精确计算，但你常常可以通过将其与已知收敛的积分进行比较，来判断它们是否收敛。

::: theorem 比较判别法
设 $f$ 和 $g$ 在 $[a, \infty)$ 上连续，且 $0 \le f(x) \le g(x)$ 对所有 $x \ge a$ 成立。

(a) 如果 $\int_a^\infty g(x)\,dx$ 收敛，则 $\int_a^\infty f(x)\,dx$ 也收敛，且 $\int_a^\infty f(x)\,dx \le \int_a^\infty g(x)\,dx$ 也收敛。

(b) 如果 $\int_a^\infty f(x)\,dx$ 发散，则 $\int_a^\infty g(x)\,dx$ 也发散。

对于积分在端点附近被积函数无界而导致瑕积分的情况，同样适用上述结论。
:::

条件 $f \ge 0$ 有影响： $f(x) = -1$ 和 $g(x) = 1/x^2$ 满足 $f \le g$ 在 $[1, \infty)$ 上，且 $\int_1^\infty g$ 收敛，但 $\int_1^\infty f$ 发散。

::: proof
(a) 设 $F(t) = \int_a^t f(x)\,dx$ 对于 $t \ge a$，令 $G = \int_a^\infty g(x)\,dx$。由于 $f \ge 0$，$F$ 是递增的：使 $t$ 变大就加上了一个非负函数的积分。同样地，$\int_a^t g(x)\,dx$ 随着 $t$ 增加，趋近于其极限 $G$，因此它最多为 $G$。由于 $f \le g$，积分比较定理（模块 9）给出

$$F(t) \le \int_a^t g(x)\,dx \le G$$

对于每一个$t \ge a$。因此，当$t$增大时，$F(t)$随之上升但从不越过$G$。一个递增且有上界的函数在$t \to \infty$处存在极限，且该极限不超过该上界。这是实数完备性的一种形式，即数轴上没有空隙的性质，[模块 3](module_03_ZH.html#ivt); 模块 14 针对序列陈述了该性质，即单调收敛定理。因此，$\int_a^\infty f(x)\,dx = \lim_{t\to\infty} F(t)$存在且至多为$G$。

(b) 如果 $\int_a^\infty g$ 收敛，则由 (a) 可知 $\int_a^\infty f$ 也收敛。
:::

::: example 两个比较
判断 (a) $\displaystyle\int_1^\infty e^{-x^2}\,dx$ 和 (b) $\displaystyle\int_2^\infty \frac{dx}{\ln x}$ 是否收敛。

**(a)** 对于 $x \ge 1$, $x^2 \ge x$, 所以 $-x^2 \le -x$ 和 $0 < e^{-x^2} \le e^{-x}$。如例 12.16(a) 所示， $\int_1^\infty e^{-x}\,dx = \lim_{t\to\infty}\big(e^{-1} - e^{-t}\big) = e^{-1}$，它收敛。由比较判别法可知， $\int_1^\infty e^{-x^2}\,dx$ 收敛，且其值不超过 $1/e \approx 0.368$。（其值通过数值计算约为 0.1394。）

**(b)** 函数 $x - \ln x$ 的导数为 $1 - 1/x > 0$，在 $x > 1$ 处且在 $x = 1$ 处的值为 1，因此它在 $x \ge 1$ 处为正： $\ln x < x$。因此，对于 $x \ge 2$， $0 < \ln x < x$ 和 $\frac{1}{\ln x} > \frac1x > 0$。由于 $\int_2^\infty dx/x = \lim_{t\to\infty}(\ln t - \ln 2)$ 发散，由比较判别法 (b) 可知 $\int_2^\infty dx/\ln x$ 也发散。

```check
holds(all(v**2 >= v for v in (1, Rational(3, 2), 2, 5, 10)))
same(integrate(exp(-x), (x, 1, oo)), exp(-1)); rounds(exp(-1), '0.368')
holds(Integral(exp(-x**2), (x, 1, oo)).evalf() <= exp(-1)); rounds(Integral(exp(-x**2), (x, 1, oo)).evalf(30), '0.1394')
same(diff(x - log(x), x), 1 - 1/x); same((x - log(x)).subs(x, 1), 1); holds(all(1 - 1/v > 0 for v in (Rational(11, 10), 2, 10)))
limit_is(log(t) - log(2), t, oo, oo); holds(all(1/log(v) > 1/Integer(v) for v in (2, 3, 10, 100)))
```
:::

部分 (a) 解决了一个下面重要的问题：$\int_{-\infty}^{\infty} e^{-x^2}\,dx$ 收敛。区间 $[1, \infty)$ 是部分 (a)，$[0, 1]$ 给出一个普通积分，$e^{-x^2}$ 是偶函数，因此负半部分的行为类似于正半部分。

::: pitfall
比较必须朝正确方向进行。要证明 $\int_1^\infty \frac{dx}{\sqrt x + 1}$ 发散，与 $\frac{1}{\sqrt x}$ 比较并不能说明问题：$\frac{1}{\sqrt x + 1} \le \frac{1}{\sqrt x}$，并且一个低于一的函数，其积分发散，其积分可能收敛也可能发散。应从下方进行比较：对于 $x \ge 1$，$\sqrt x + 1 \le 2\sqrt x$，因此 $\frac{1}{\sqrt x + 1} \ge \frac{1}{2\sqrt x}$，其积分发散（$p = \tfrac12$）。

```check
holds(all(1/(sqrt(v) + 1) <= 1/sqrt(v) for v in (1, 2, 9, 100))); holds(all(sqrt(v) + 1 <= 2*sqrt(v) for v in (1, 2, 9, 100)))
same(integrate(1/(2*sqrt(x)), (x, 1, oo)), oo)
```
:::

找到正确的不等式需要一些注意。通常，比较大 $x$ 的行为更容易：

::: theorem 极限比较
设 $f$ 和 $g$ 在 $[a, \infty)$ 上连续且非负，且 $f(x)/g(x) \to L$ 为 $x \to \infty$，其中 $0 < L < \infty$。则 $\int_a^\infty f(x)\,dx$ 和 $\int_a^\infty g(x)\,dx$ 或者同时收敛，或者同时发散。
:::

::: proof
由于$f(x)/g(x) \to L > 0$，对于所有足够大的$x$（例如$x \ge N$，其中$N \ge a$），比值介于$\tfrac{L}{2}$和$\tfrac{3L}{2}$之间；因此$\tfrac{L}{2}g(x) \le f(x) \le \tfrac{3L}{2}g(x)$成立。如果$\int_a^\infty g$收敛，则通过与$\tfrac{3L}{2}g$比较可知$\int_N^\infty f$收敛。如果$\int_a^\infty g$发散，则$\int_N^\infty g$也发散，进而通过与$\tfrac{L}{2}g$比较可知$\int_N^\infty f$发散。加上普通积分$\int_a^N f$不会改变积分的收敛性。
:::

对于上述陷阱 $\dfrac{1/(\sqrt x + 1)}{1/\sqrt x} = \dfrac{\sqrt x}{\sqrt x + 1} \to 1$，因此 $\int_1^\infty \frac{dx}{\sqrt x + 1}$ 与 $\int_1^\infty \frac{dx}{\sqrt x}$ 发散，无法找到不等式。

```check
limit_is(sqrt(x)/(sqrt(x) + 1), x, oo, 1); same((1/(sqrt(x) + 1))/(1/sqrt(x)), sqrt(x)/(sqrt(x) + 1))
same(integrate(1/sqrt(x), (x, 1, oo)), oo)
```

### 加布里埃尔号角 {#gabriel}

::: example 加布里埃尔号角
旋转曲线 $y = 1/x$ 和 $x \ge 1$ 下方的区域，绕 $x$ 轴旋转。所得立体，是一个不断变细而无限延伸的号角，称为 **加布里埃尔号角**。求其体积。

用圆盘法，涉及一个不正确定积分，

$$\begin{aligned} V &= \pi\int_1^\infty \Big(\frac1x\Big)^2\,dx = \pi\int_1^\infty \frac{dx}{x^2} \\ &= \pi \cdot 1 = \pi, \end{aligned}$$

根据定理 12.2 与 $p = 2$。该号角具有有限体积，为 $\pi$ 立方单位，尽管形成该立体的区域具有无限面积： $\int_1^\infty dx/x$ 发散。

```check
same(pi*integrate((1/x)**2, (x, 1, oo)), pi); same(1/(2 - 1), 1); same(integrate(1/x, (x, 1, oo)), oo)
```
:::

::: deeper 号角的表面积
当 $f \ge 0$ 的图像，其中 $f'$ 在 $[a, b]$ 上连续，绕 $x$ 轴旋转时，它扫出一个曲面，其面积为

$$S = 2\pi\int_a^b f(x)\sqrt{1 + f'(x)^2}\,dx.$$

证明思路：第 12.5 节中多边形的每一条弦都会扫出一个带状区域，该区域是被截去顶点的圆锥的曲面侧边。将带状区域剪开并展平后，其面积为 $\pi(r_1 + r_2)\ell$，其中 $r_1$ 和 $r_2$ 是该带状区域两端的半径，而 $\ell$ 是其斜边长度，此处为弦的长度 $\sqrt{1 + f'(x_i^*)^2}\,\Delta x$。随着 $r_1 + r_2 \approx 2f(x_i^*)$，这些带状区域的总面积近似为 $2\pi f(x)\sqrt{1 + f'(x)^2}$ 的一个黎曼和。（模块 20 讨论曲面的一般面积。）验证：对于半径为 $a$ 的球体， $f(x) = \sqrt{a^2 - x^2}$ 给出 $f(x)\sqrt{1 + f'(x)^2} = a$ 对于 $-a < x < a$。公式需要 $f'$ 连续，且 $f'$ 在 $\pm a$ 附近无界，因此取球体在 $x = -b$ 和 $x = b$ 之间的带状区域，对于 $0 < b < a$：其面积为 $2\pi \cdot a \cdot 2b = 4\pi ab$，当 $b \to a$ 时，其面积趋近于 $4\pi a^2$，即球体的熟知面积。

对于螺号，$f(x) = 1/x$ 和 $f'(x) = -1/x^2$，因此被积函数是

$$\frac{2\pi}{x}\sqrt{1 + \frac{1}{x^4}} \ge \frac{2\pi}{x},$$

并且 $\int_1^\infty 2\pi\,dx/x$ 发散，因此根据比较判别法，海螺曲面的面积是无限的。这个海螺可以容纳 $\pi$ 个立方单位的油漆，然而任何有限量的油漆都无法用固定厚度的一层覆盖其外侧 $d$，这层油漆需要大约 $S\,d$ 的量。并没有矛盾：在海螺的远端，填满它的油漆形成一层比任何固定 $d$ 更薄的层。

```check
fsph = sqrt(aq**2 - x**2)
same(simplify(1 + diff(fsph, x)**2), aq**2/(aq**2 - x**2))
dpos = symbols('d', positive=True)                         # d = a^2 - x^2 > 0 for -a < x < a
same(sqrt(dpos)*sqrt(aq**2/dpos), aq)
limit_is(diff(fsph, x), x, aq, -oo, '-')                    # f' is unbounded near a
bq = symbols('b', positive=True)
same(2*pi*integrate(aq, (x, -bq, bq)), 4*pi*aq*bq); limit_is(4*pi*aq*bq, bq, aq, 4*pi*aq**2, '-')
xh = symbols('x', positive=True)
same(diff(1/xh, xh), -1/xh**2); holds(all(sqrt(1 + 1/Integer(v)**4) >= 1 for v in (1, 2, 10)))
same(integrate(2*pi/x, (x, 1, oo)), oo)
```
:::

::: compute 使用 SymPy 计算瑕积分
SymPy 的 `integrate` 接受 `sp.oo`，无穷大，作为极限，并在积分发散到无穷大时给出 `oo`：

```python
import sympy as sp
x = sp.symbols('x')
print(sp.integrate(1/x**2, (x, 1, sp.oo)))
print(sp.integrate(1/x, (x, 1, sp.oo)))
print(sp.integrate(sp.exp(-x**2), (x, -sp.oo, sp.oo)))
print(sp.integrate(1/x**2, (x, -1, 1)))
```

```output
1
oo
sqrt(pi)
oo
```

最后一行是第 12.8 节的陷阱：SymPy 注意到区间内部 0 处的困难。你自行使用原函数的做法则不会：

```python
F = sp.integrate(1/x**2, x)
print(F, F.subs(x, 1) - F.subs(x, -1))
```

```output
-1/x -2
```

使用一个符号表示幂次，SymPy 会说明 $p$-积分何时收敛：

```python
p = sp.symbols('p', positive=True)
print(sp.integrate(x**(-p), (x, 1, sp.oo)))
```

```output
Piecewise((1/(p - 1), p > 1), (Integral(x**(-p), (x, 1, oo)), True))
```

一个 `Piecewise` 结果读起来像分段定义：$1/(p - 1)$ 当 $p > 1$ 时，否则积分未被计算：对于 $p \le 1$，它发散，因此没有值可给。
:::

## 概率 {#probability}

### 概率密度 {#densities}

一些量是随机的：从下一个请求到达网络服务器的时间，到一个元件的寿命，再到一个测量的误差。它们的值无法预测，但它们的概率是可以预测的。一个事件 **probability**的概率 $P(\text{event})$ 是一个介于 0 到 1 之间的数，表示在长期重复中该事件发生的频率；1 表示必然发生。一个**random variable** $X$ 是一个由随机决定的量。等待时间或寿命可以在一个区间内取任意值，因此它们的概率不能逐个列出；而是用一条曲线来描述。

测量这样一个 $X$ 很多次，画一个直方图，其中每个条形的面积是其区间内测量值的比例。随着测量次数增多且区间变窄，条形的顶部会趋近于一条曲线 $y = f(x)$，并且值在 $a$ 和 $b$ 之间的比例会趋近于曲线从 $a$ 到 $b$ 下方的面积。

::: definition 概率密度函数
一个 **概率密度函数** 是一个函数 $f$，对于每一个 $x$ 都有 $f(x) \ge 0$。

$$\int_{-\infty}^{\infty} f(x)\,dx = 1.$$

如果一个随机变量 $X$ 有密度 $f$，则对于所有数 $a \le b$，都有

$$P(a \le X \le b) = \int_a^b f(x)\,dx.$$

一个具有密度的随机变量称为 **连续型** 变量。
:::

总面积为 1 表示 $X$ 必然取某个值。密度函数可能在某些点跳跃，如下面的指数分布密度在 0 处跳跃；在跳跃点处分割积分。两个结果：一个单独的值的概率为 $P(X = a) = \int_a^a f(x)\,dx = 0$，因此不等式是否严格（$<$）或非严格（$\le$）都无关紧要；并且 $f(x)$ 不是概率，而是单位长度上的概率，$P(x \le X \le x + \Delta x) \approx f(x)\,\Delta x$ 对于一个小的 $\Delta x$，因此 $f(x)$ 可以大于 1。

最简单的密度是 **均匀** 密度在 $[0, 1]$ 上，等于 1 那里，其他地方为 0：对于 $0 \le a \le b \le 1$， $P(a \le X \le b) = b - a$，区间的长度。计算机的随机数生成器，如 Python 的 `random.random()`，模拟它。

::: example 区间上的密度
求常数 $c$，使得 $f(x) = cx(2 - x)$ 对于 $0 \le x \le 2$ 成立，而 $f(x) = 0$ 否则不成立，是一个概率密度函数。然后求随机变量 $X$ 具有该密度时的 $P\big(X \le \tfrac12\big)$。

对于 $c \ge 0$， $f \ge 0$，由于 $x(2 - x) \ge 0$ 在 $[0, 2]$ 上。总面积必须为 1：

$$\begin{aligned} &\int_0^2 cx(2 - x)\,dx = c\Big[x^2 - \frac{x^3}{3}\Big]_0^2 \\ &\qquad= c\Big(4 - \frac83\Big) = \frac{4c}{3} = 1, \end{aligned}$$

所以 $c = \tfrac34$。然后，由于 $f = 0$ 在 0 左边，

$$\begin{aligned} P\Big(X \le \frac12\Big) &= \frac34\int_0^{1/2} \big(2x - x^2\big)\,dx \\ &= \frac34\Big(\frac14 - \frac{1}{24}\Big) \\ &= \frac{5}{32} \approx 0.156. \end{aligned}$$

```check
antideriv(x**2 - x**3/3, x*(2 - x), x); same(integrate(c*x*(2 - x), (x, 0, 2)), 4*c/3); same(solve(Eq(4*c/3, 1), c), [Rational(3, 4)])
same(Rational(3, 4)*integrate(2*x - x**2, (x, 0, Rational(1, 2))), Rational(5, 32)); same(Rational(3, 4)*(Rational(1, 4) - Rational(1, 24)), Rational(5, 32))
rounds(Rational(5, 32), '0.156')
```
:::

### 期望值 {#expected-value}

平均许多 $X$ 的值。大约有 $f(x)\,\Delta x$ 分数的值落在 $x$ 附近的一个薄片中，它们对平均值的贡献大约为 $x \cdot f(x)\,\Delta x$。将薄片相加并取极限得到期望值。

::: definition 期望值
随机变量 $X$ 的 **期望值**，或 **均值**，其密度为 $f$ 是

$$\mu = E(X) = \int_{-\infty}^{\infty} x\,f(x)\,dx,$$

当积分收敛时成立。 ($\mu$ 是希腊字母 "mu"。)
:::

这是密度为 $f$ 且总质量为 1 的杆的质心（定义 12.5）：均值是密度函数图像能够平衡的点。例 12.20 中的密度函数关于 $x = 1$ 对称，因此其均值为 1，积分也一致：$\tfrac34\int_0^2 x^2(2 - x)\,dx = \tfrac34 \cdot \tfrac43 = 1$。

```check
same(Rational(3, 4)*integrate(x**2*(2 - x), (x, 0, 2)), 1); same(integrate(x**2*(2 - x), (x, 0, 2)), Rational(4, 3))
same((x*(2 - x)).subs(x, 1 + h), (x*(2 - x)).subs(x, 1 - h))
```

::: pitfall
并非每个密度函数都有均值。函数 $f(x) = \dfrac{1}{\pi(1 + x^2)}$ 是一个密度函数（例 12.16(c) 表明其总面积为 1），其图像关于 0 对称。但使用替换 $u = 1 + x^2$，

$$\int_0^t \frac{x}{\pi(1 + x^2)}\,dx = \frac{\ln(1 + t^2)}{2\pi} \to \infty,$$

因此均值的积分发散，这个随机变量（它服从柯西分布）没有期望值。只有当积分收敛时，对称性才给出均值。

```check
same(integrate(1/(pi*(1 + x**2)), (x, -oo, oo)), 1)
tp2 = symbols('t', positive=True); same(integrate(x/(pi*(1 + x**2)), (x, 0, tp2)), log(1 + tp2**2)/(2*pi)); limit_is(log(1 + t**2)/(2*pi), t, oo, oo)
```
:::

### 指数分布 {#exponential-distribution}

某些事件以$\lambda$每单位时间的稳定平均速率随机发生，彼此独立（$\lambda$是希腊字母“lambda”）：例如放射性样本中原子的衰变，或繁忙服务器接收到的请求。下一个此类事件的等待时间$X$由**指数密度**建模，其**速率**为$\lambda > 0$，

$$f(x) = \begin{cases} \lambda e^{-\lambda x} & \text{if } x \ge 0, \\ 0 & \text{if } x < 0. \end{cases}$$

它是一个密度函数： $f \ge 0$，和 $\int_0^\infty \lambda e^{-\lambda x}\,dx = \lim_{t\to\infty}\big(1 - e^{-\lambda t}\big) = 1$。同样地，对于 $t \ge 0$，

$$P(X > t) = \int_t^\infty \lambda e^{-\lambda x}\,dx = e^{-\lambda t}:$$

等待时间超过 $t$ 的概率呈指数衰减（模块 6）。对于均值，替换 $u = \lambda x$ 并使用例 12.16(b)：

$$\begin{aligned} E(X) &= \int_0^\infty x\,\lambda e^{-\lambda x}\,dx \\ &= \frac{1}{\lambda}\int_0^\infty ue^{-u}\,du = \frac1\lambda. \end{aligned}$$

在平均每 $\lambda$ 个事件/秒的情况下，平均等待时间为 $1/\lambda$ 秒。

```check
lam = symbols('lambda', positive=True)
same(integrate(lam*exp(-lam*x), (x, 0, t)), 1 - exp(-lam*t)); limit_is(1 - exp(-lam*t), t, oo, 1)
same(integrate(lam*exp(-lam*x), (x, tp2, oo)), exp(-lam*tp2))
same((x*lam*exp(-lam*x)).subs(x, u/lam)/lam, u*exp(-u)/lam)
same(integrate(x*lam*exp(-lam*x), (x, 0, oo)), 1/lam)
```

::: example 等待一个请求
假设请求以平均速率 2 次每秒随机到达服务器（一个假设的服务器），因此下一个请求的等待时间 $X$（秒）具有指数密度，参数为 $\lambda = 2$（图 12.5，左图）。求 (a) $P(X > 1)$，(b) $P(0.5 \le X \le 1)$，(c) 平均等待时间，(d) 中位等待时间 $m$，满足 $P(X \le m) = \tfrac12$。

**(a)** $P(X > 1) = e^{-2 \cdot 1} = e^{-2} \approx 0.135$.

**(b)** $P(0.5 \le X \le 1) = P(X \ge 0.5) - P(X > 1) = e^{-1} - e^{-2} \approx 0.233$.

**(c)** $E(X) = 1/\lambda = 0.5$ s.

**(d)** $P(X \le m) = 1 - e^{-2m} = \tfrac12$ 给出 $e^{-2m} = \tfrac12$，因此 $-2m = \ln\tfrac12 = -\ln 2$，且 $m = \tfrac12\ln 2 \approx 0.347$ 秒。一半的等待时间短于 0.347 秒，尽管平均值为 0.5 秒：罕见的长等待时间拉高了平均值。对于放射性原子，中位寿命 $\ln 2/\lambda$ 是指数衰变的半衰期（模块 6）。

```check
same(exp(-2*1), exp(-2)); rounds(exp(-2), '0.135'); rounds(exp(-1) - exp(-2), '0.233')
same(integrate(2*exp(-2*x), (x, Rational(1, 2), 1)), exp(-1) - exp(-2))
mm = symbols('m', positive=True); same(solve(Eq(1 - exp(-2*mm), Rational(1, 2)), mm), [log(2)/2]); rounds(log(2)/2, '0.347')
```
:::

::: figure id=fig-12-5
概率是密度曲线下的面积。左图：例 12.21 中的指数密度 $f(x) = 2e^{-2x}$；阴影区域是 $P(0.5 \le X \le 1) = e^{-1} - e^{-2} \approx 0.233$。填充的点表示 $f(0) = 2$：密度可以超过 1。右图：下面将介绍的标准正态密度 $\varphi$；阴影区域 $P(-1 \le Z \le 1) \approx 0.683$ 是落在均值一个标准差范围内的概率。
:::

指数分布具有一个显著的性质。**条件概率** $P(A \mid B)$，读作“在 B 发生的情况下 A 发生的概率”，是 $A$ 在 $B$ 发生的场合中发生的概率：

$$P(A \mid B) = \frac{P(A \text{ and } B)}{P(B)}, \quad\text{for } P(B) > 0.$$

::: theorem 指数分布没有记忆性
如果 $X$ 具有速率为 $\lambda$ 的指数密度, 那么对于所有 $s \ge 0$ 和 $t \ge 0$,

$$P(X > s + t \mid X > s) = P(X > t).$$
:::

::: proof
如果 $X > s + t$ 那么 $X > s$, 所以事件 "$X > s + t$ 和 $X > s$" 就是事件 $X > s + t$。因此

$$\begin{aligned} &P(X > s + t \mid X > s) \\ &\quad= \frac{P(X > s + t)}{P(X > s)} = \frac{e^{-\lambda(s + t)}}{e^{-\lambda s}} \\ &\quad= e^{-\lambda t} = P(X > t). \end{aligned}$$
:::

```check
sm, tm = symbols('s t', nonnegative=True)
same(exp(-lam*(sm + tm))/exp(-lam*sm), exp(-lam*tm))
```

已经等待了 $s$ 秒请求并未使下一个请求更接近: 剩余等待时间的分布与全新等待时间的分布相同。作为寿命模型, 指数分布描述的是不会磨损的事物, 例如尚未衰变的原子; 它不适合作为会老化的事物的模型, 例如轮胎或人。

::: pitfall
条件改变了答案。已知 $\lambda = 2$, 在已经等待了 1 秒的情况下, 等待超过 1.5 秒的总概率是 $P(X > 0.5) = e^{-1} \approx 0.368$, 而不是 $P(X > 1.5) = e^{-3} \approx 0.050$: 第二个是开始等待前等待这么久的概率。

```check
same(exp(-2*Rational(3, 2))/exp(-2*1), exp(-2*Rational(1, 2))); rounds(exp(-1), '0.368'); rounds(exp(-3), '0.050')
```
:::

### 正态分布 {#normal}

统计学中最重要的密度函数是钟形的 **标准正态密度函数**

$$\varphi(z) = \frac{1}{\sqrt{2\pi}}\,e^{-z^2/2},$$

其中 $\varphi$ 是希腊字母 "phi"（图12.5，右）。测量误差，以及许多由许多小的独立效应相加而成的量，都近似服从这种分布，经过平移和缩放；其原因，概率论中的中心极限定理，超出了本系列的范围。

为什么有这个因子 $1/\sqrt{2\pi}$？因为总面积必须为 1。第12.8节在例12.18之后表明， $\int_{-\infty}^{\infty} e^{-x^2}\,dx$ 是收敛的。其值为 **高斯积分**

$$\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}.$$

这里没有原函数可用，因为 $e^{-x^2}$ 没有初等原函数（模块11）。本模块引用该值；[模块19](module_19_ZH.html#gaussian) 通过将积分平方，将其转化为二重积分，并在极坐标下计算该积分来证明它， $z = \sqrt2\,x$ 用 $dz = \sqrt2\,dx$（模块10；无穷限保持无穷），给出

$$\int_{-\infty}^{\infty} e^{-z^2/2}\,dz = \sqrt2\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{2\pi},$$

所以 $\varphi$ 的总面积为 1。其均值为 0：积分 $\int_0^\infty z e^{-z^2/2}\,dz$ 收敛，结果为 1（代入 $u = z^2/2$），且 $z\varphi(z)$ 为奇函数，因此积分用于均值的两个部分相互抵消。

```check
same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi)); same(integrate(exp(-z**2/2), (z, -oo, oo)), sqrt(2*pi))
same((exp(-z**2/2)).subs(z, sqrt(2)*x)*sqrt(2), sqrt(2)*exp(-x**2))
phi12 = exp(-z**2/2)/sqrt(2*pi)
same(integrate(phi12, (z, -oo, oo)), 1); same(integrate(z*exp(-z**2/2), (z, 0, oo)), 1); same(integrate(z*phi12, (z, -oo, oo)), 0)
```

更一般地，均值为 $\mu$、**标准差**为 $\sigma > 0$（希腊字母「西格玛」）的**正态分布**，其概率密度为

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}\,e^{-(x - \mu)^2/(2\sigma^2)},$$

一个以 $\mu$ 为中心、宽度与 $\sigma$ 成比例的钟形曲线。练习 12.12 表明 $\sigma^2$ 是均方差，且该钟形曲线的拐点位于 $\mu \pm \sigma$。替换 $z = (x - \mu)/\sigma$ 将 $f$ 转换为 $\varphi$：如果 $X$ 具有该密度，而 $Z$ 具有标准正态密度，则

$$P(a \le X \le b) = P\Big(\frac{a - \mu}{\sigma} \le Z \le \frac{b - \mu}{\sigma}\Big).$$

同样的替换 $x = \mu + \sigma z$ 与 $dx = \sigma\,dz$ 表明 $X$ 的均值为 $\mu$，正如其名称所示，因为 $\varphi$ 的总面积为 1，均值为 0：

$$\begin{aligned} \int_{-\infty}^{\infty} x f(x)\,dx &= \int_{-\infty}^{\infty} (\mu + \sigma z)\varphi(z)\,dz \\ &= \mu \cdot 1 + \sigma \cdot 0 = \mu. \end{aligned}$$

一个函数 $\varphi$ 适用于所有正态分布。

```check
mu_ = symbols('mu', real=True); sg = symbols('sigma', positive=True); aa, bb = symbols('a b', real=True)
fN = exp(-(x - mu_)**2/(2*sg**2))/(sg*sqrt(2*pi))
same(fN.subs(x, mu_ + sg*z)*sg, phi12); same(integrate(fN, (x, -oo, oo)), 1)
same(integrate(fN, (x, aa, bb)), integrate(phi12, (z, (aa - mu_)/sg, (bb - mu_)/sg)))
same((x*fN).subs(x, mu_ + sg*z)*sg, (mu_ + sg*z)*phi12)     # the mean after the substitution
same(integrate(phi12, (z, -oo, oo)), 1); same(integrate(z*phi12, (z, -oo, oo)), 0); same(integrate(x*fN, (x, -oo, oo)), mu_)
```

**计算正态概率。**由于 $\varphi$ 没有初等原函数，正态概率通常通过数值方法计算，例如使用辛普森法则（模块 11），或者使用模块 11 中的**误差函数**，

$$\operatorname{erf}(x) = \frac{2}{\sqrt\pi}\int_0^x e^{-t^2}\,dt,$$

这些函数由计算器和编程语言提供（在 Python 中， `math.erf`）。由于 $\varphi$ 是偶函数， $P(-c \le Z \le c) = 2\int_0^c \varphi(z)\,dz$ 对于 $c > 0$，并使用替换 $z = \sqrt2\,t$ 将其转换为误差函数：

$$\begin{aligned} P(-c \le Z \le c) &= \frac{2}{\sqrt{2\pi}}\int_0^{c} e^{-z^2/2}\,dz \\ &= \frac{2}{\sqrt\pi}\int_0^{c/\sqrt2} e^{-t^2}\,dt \\ &= \operatorname{erf}\Big(\frac{c}{\sqrt2}\Big). \end{aligned}$$

```valuetable
c = 1, 1.645, 1.96, 2, 2.576, 3
$P(-c \le Z \le c) = \operatorname{erf}(c/\sqrt2)$ = erf(c/sqrt(2))
digits = 4
---
c | P(-c \le Z \le c) = \operatorname{erf}(c/\sqrt2)
1 | 0.6827
1.645 | 0.9000
1.96 | 0.9500
2 | 0.9545
2.576 | 0.9900
3 | 0.9973
```

第 1、2 和 3 行对应 **68–95–99.7 规则**：一个正态随机变量大约 68% 的时间落在均值的一个标准差内，大约 95% 的时间落在两个标准差内，大约 99.7% 的时间落在三个标准差内。数值 1.645、1.96 和 2.576 分别对应 90%、95% 和 99% 的置信度；统计学家使用它们来说明估计的精确程度。

```check
cp_ = symbols('c', positive=True)
same(2*integrate(phi12, (z, 0, cp_)), erf(cp_/sqrt(2)))
same((2/sqrt(2*pi)*exp(-z**2/2)).subs(z, sqrt(2)*t)*sqrt(2), 2/sqrt(pi)*exp(-t**2))
for cv, txt in ((1, '0.68'), (2, '0.95'), (3, '0.997')):
    rounds(erf(cv/sqrt(2)), txt)
```

::: example 传感器的误差
假设一个温度计的误差（即读数减去真实温度）服从均值为 0 °C、标准差为 0.4 °C 的正态分布（一个假设的传感器）。求（a）读数与真实温度的差在 0.5 °C 以内的概率，以及（b）误差在 ±1 °C 以外的概率。

**(a)** 标准化为 $z = x/0.4$: $0.5$ °C 转换为 $z = 1.25$，因此

$$\begin{aligned} &P(-0.5 \le X \le 0.5) \\ &\qquad= P(-1.25 \le Z \le 1.25) \\ &\qquad= \operatorname{erf}\Big(\frac{1.25}{\sqrt2}\Big) \approx 0.789. \end{aligned}$$

**(b)** 现在 1 °C 转换为 $z = 2.5$，误差在 ±1 °C 以外的概率等于误差不在 1 °C 以内的概率：

$$\begin{aligned} P(\abs{X} > 1) &= 1 - P(-2.5 \le Z \le 2.5) \\ &= 1 - \operatorname{erf}\Big(\frac{2.5}{\sqrt2}\Big) \approx 0.0124, \end{aligned}$$

因此，大约 1.2% 的读数误差超过这个范围。

```check
same(Rational(5, 10)/Rational(4, 10), Rational(125, 100)); same(1/Rational(4, 10), Rational(25, 10))
rounds(erf(Rational(125, 100)/sqrt(2)), '0.789'); P1222 = 1 - erf(Rational(25, 10)/sqrt(2)); rounds(P1222, '0.0124'); rounds(100*P1222, '1.2')
fS = exp(-x**2/(2*Rational(4, 10)**2))/(Rational(4, 10)*sqrt(2*pi))
near(Integral(fS, (x, -Rational(1, 2), Rational(1, 2))).evalf(30), erf(Rational(125, 100)/sqrt(2)).evalf(30), 1e-20)
```
:::

::: pitfall
在使用表格或误差函数前，请先进行标准化。在例 12.22 中，$P(-0.5 \le X \le 0.5)$ 不等于 $\operatorname{erf}(0.5/\sqrt2) \approx 0.383$：那将是标准差为 1 °C 时的答案，而不是 0.4 °C。

```check
rounds(erf(Rational(1, 2)/sqrt(2)), '0.383')
```
:::

::: compute 用计算机计算概率
Python 的 `math` 模块包含 `exp`、`log` 和 `erf`，足以计算例题 12.21 和 12.22 的概率：

```python
import math
lam = 2.0
print("P(X > 1)         =", math.exp(-lam*1))
print("P(0.5 <= X <= 1) =", math.exp(-lam*0.5) - math.exp(-lam*1))
print("median wait      =", math.log(2)/lam)
print("P(|Z| <= 1.25)   =", math.erf(1.25/math.sqrt(2)))
```

```output
P(X > 1)         = 0.1353352832366127
P(0.5 <= X <= 1) = 0.23254415793482963
median wait      = 0.34657359027997264
P(|Z| <= 1.25)   = 0.7887004526662894
```

你也可以通过模拟数据观察概率的出现。如果 $U$ 在 $[0, 1)$ 上均匀分布，则 $X = -\ln(1 - U)/\lambda$ 具有指数密度，因为 $P(X > t) = P\big(1 - U < e^{-\lambda t}\big) = e^{-\lambda t}$。模拟 100,000 次等待时间（种子固定随机数，因此你将看到与此处相同的输出）：

```python
import random
random.seed(2026)
waits = [-math.log(1 - random.random())/lam for _ in range(100_000)]
long_waits = [w for w in waits if w > 1]
longer = [w for w in long_waits if w > 1.5]
print("mean of the waits:   ", round(sum(waits)/len(waits), 4))
print("fraction over 1 s:   ", round(len(long_waits)/len(waits), 4))
print("of those, over 1.5 s:", round(len(longer)/len(long_waits), 4))
```

```output
mean of the waits:    0.498
fraction over 1 s:    0.1343
of those, over 1.5 s: 0.3658
```

模拟的均值接近 $1/\lambda = 0.5$，等待时间超过 1 秒的比例接近 $e^{-2} \approx 0.135$，而在这些中，持续时间至少再 0.5 秒的比例接近 $e^{-1} \approx 0.368$：这是数据中观察到的无记忆性性质。
:::

```check
same(solve(Eq(-log(1 - u)/lam, tp2), u), [1 - exp(-lam*tp2)])   # X = t exactly when U = 1 - e^(-lambda t)
same(diff(-log(1 - u)/lam, u), 1/(lam*(1 - u)))                  # and X increases with U, so X > t when U > 1 - e^(-lambda t)
same(1 - (1 - exp(-lam*tp2)), exp(-lam*tp2))                     # P(U > s) = 1 - s for a uniform U
same(1/Rational(2), Rational(1, 2)); rounds(exp(-2), '0.135'); rounds(exp(-1), '0.368')
```

## 你所学到的内容 {#summary}

- **分割，近似，相加，取极限。** 一个分布在 $[a, b]$ 上的量，其在 $x$ 附近的小片近似为 $q(x)\,\Delta x$，则该量为 $\int_a^b q(x)\,dx$。每个小片的真实值必须介于 $\Delta x$ 乘以该小片内 $q$ 的最小值与最大值之间；检查 $q(x)\,dx$ 的单位。
- **面积**: $\int_a^b (\text{top} - \text{bottom})\,dx$ 用垂直条形计算， $\int_c^d (\text{right} - \text{left})\,dy$ 用水平条形计算。找出曲线的交点，并在它们相交处分割。
- **体积**: $\int_a^b A(x)\,dx$ 对于已知截面（棱锥或圆锥的体积为 $\tfrac13$ 底面积乘以高度）。对于旋转体：圆盘法 $\pi\int f^2$，圆环法 $\pi\int (R^2 - r^2)$，壳层法 $2\pi\int (\text{radius})(\text{height})$，半径从轴线测量。
- **弧长**: $L = \int_a^b \sqrt{1 + f'(x)^2}\,dx$，即内接多边形长度的极限（利用勾股定理和平均值定理）。大多数弧长积分需要数值计算。
- **功**: $W = \int_a^b F(x)\,dx$，当力的单位为牛顿时，距离的单位为米时，功的单位为焦耳。弹簧遵循 $F = kx$（胡克定律）；对于绳子和油罐，将物体切片，将每一片的重量乘以其自身的距离。
- **质心**: $\bar x = \int x\rho\,dx \big/ \int \rho\,dx$ 对于一根杆；对于一个平板，其重心 $\bar x = \frac1A\int x(f - g)\,dx$， $\bar y = \frac1A\int \tfrac12\big(f^2 - g^2\big)\,dx$ 在任何对称轴上。
- **瑕积分** 是普通积分在无限区间或非有界被积函数上的极限；它们收敛或发散。 $\int_1^\infty dx/x^p$ 收敛当且仅当 $p > 1$， $\int_0^1 dx/x^p$ 收敛当且仅当 $p < 1$。 比较法和极限比较法可在不计算积分的情况下判断收敛性。在使用基本定理前，应先寻找隐藏的无穷大。Gabriel 的号角有体积 $\pi$ 但表面积无限。
- **概率**：密度 $f \ge 0$ 的总面积为 1 时，得到 $P(a \le X \le b) = \int_a^b f(x)\,dx$ 和均值 $\mu = \int x f(x)\,dx$（当它收敛时）。指数密度 $\lambda e^{-\lambda x}$ 有 $P(X > t) = e^{-\lambda t}$，均值 $1/\lambda$ 且无记忆性。正态密度依赖于高斯积分 $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$（在模块 19 中证明）；其概率由误差函数或数值积分得出： $P(\abs{Z} \le c) = \operatorname{erf}(c/\sqrt2)$，即 68–95–99.7 规则。

```check
same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi))
```

## 练习 {#exercises}

:::: exercise 相交曲线 {#ex-12-1} ★
求由曲线 $y = x^3$ 和 $y = x$ 所围成的区域的面积。解释为何 $\int_{-1}^{1} (x - x^3)\,dx$ 不是答案。

::: solution
曲线相交于 $x^3 = x$，即 $x(x - 1)(x + 1) = 0$：在 $x = -1$，0 和 1 处。在 $[0, 1]$，在 $x = \tfrac12$ 处，直线给出 $\tfrac12$，而三次曲线给出 $\tfrac18$，因此直线在上。在 $[-1, 0]$，在 $x = -\tfrac12$ 处，三次曲线给出 $-\tfrac18$，而直线给出 $-\tfrac12$，因此三次曲线在上。交叉点分割区域：

$$\begin{aligned} A &= \int_{-1}^{0} \big(x^3 - x\big)\,dx \\ &\qquad + \int_0^1 \big(x - x^3\big)\,dx \\ &= \Big[\frac{x^4}{4} - \frac{x^2}{2}\Big]_{-1}^{0} \\ &\qquad + \Big[\frac{x^2}{2} - \frac{x^4}{4}\Big]_0^1 \\ &= \frac14 + \frac14 = \frac12. \end{aligned}$$

$\int_{-1}^{1}(x - x^3)\,dx = 0$，因为在 $[-1, 0]$ 处直线在三次曲线下方，该部分计入 $-\tfrac14$：积分是一个净（有符号）面积，不是面积。该区域由两个部分组成，彼此通过原点对称，每个部分的面积为 $\tfrac14$。

```check
same_set(solve(x**3 - x, x), [-1, 0, 1])
holds(Rational(1, 2) > Rational(1, 8)); holds(-Rational(1, 8) > -Rational(1, 2))
same(integrate(x**3 - x, (x, -1, 0)), Rational(1, 4)); same(integrate(x - x**3, (x, 0, 1)), Rational(1, 4))
antideriv(x**4/4 - x**2/2, x**3 - x, x); same(integrate(Abs(x - x**3), (x, -1, 1)), Rational(1, 2))
same(integrate(x - x**3, (x, -1, 1)), 0)
```
:::
::::

:::: exercise 圆盘与壳法 {#ex-12-2} ★
区域在 $y = \sqrt x$ 和 $0 \le x \le 4$ 下方，绕（a） $x$ 轴旋转，（b） $y$ 轴旋转。求两个体积，使用壳法求解（b）。

::: solution
**(a)** 圆盘半径为 $\sqrt x$：

$$\begin{aligned} V &= \pi\int_0^4 \big(\sqrt x\big)^2\,dx \\ &= \pi\int_0^4 x\,dx \\ &= \pi\cdot\frac{16}{2} = 8\pi \approx 25.13. \end{aligned}$$

**(b)** 在 $x$ 处的条带，半径为 $x$，高度为 $\sqrt x$：

$$\begin{aligned} V &= 2\pi\int_0^4 x\sqrt x\,dx \\ &= 2\pi\int_0^4 x^{3/2}\,dx \\ &= 2\pi\cdot\frac25\cdot 4^{5/2} = 2\pi\cdot\frac25\cdot 32 \\ &= \frac{128\pi}{5} \approx 80.42. \end{aligned}$$

洗碗法检查：在高度 $y$，对于 $0 \le y \le 2$，区域从 $x = y^2$ 到 $x = 4$，因此 $R = 4$， $r = y^2$，和 $\pi\int_0^2 \big(16 - y^4\big)\,dy = \pi\big(32 - \tfrac{32}{5}\big) = \tfrac{128\pi}{5}$。

```check
same(pi*integrate(x, (x, 0, 4)), 8*pi); rounds(8*pi, '25.13')
xq2 = symbols('x', positive=True); same(xq2*sqrt(xq2), xq2**Rational(3, 2)); antideriv(Rational(2, 5)*xq2**Rational(5, 2), xq2**Rational(3, 2), xq2)
same(Integer(4)**Rational(5, 2), 32); same(2*pi*Rational(2, 5)*32, 128*pi/5); same(2*pi*integrate(x*sqrt(x), (x, 0, 4)), 128*pi/5)
rounds(128*pi/5, '80.42'); same(pi*integrate(16 - y**4, (y, 0, 2)), 128*pi/5); same(pi*(32 - Rational(32, 5)), 128*pi/5)
```
:::
::::

:::: exercise 弹簧 {#ex-12-3} ★
一个弹簧的自然长度为 20 cm。一个 12 N 的力将其拉伸至 25 cm。将其从 25 cm 拉伸至 35 cm 需要做多少功？

::: solution
功以米为单位。在 25 cm 处，弹簧被拉伸了 $0.05$ m，因此胡克定律给出 $12 = k \times 0.05$ 和 $k = 240$ N/m。从 25 cm 拉伸至 35 cm 的过程中，拉伸量从 0.05 m 变到 0.15 m：

$$\begin{aligned} W &= \int_{0.05}^{0.15} 240x\,dx \\ &= \big[120x^2\big]_{0.05}^{0.15} \\ &= 120\,(0.0225 - 0.0025) \\ &= 2.4 \text{ J}. \end{aligned}$$

常见的错误答案是在长度 0.25 到 0.35 之间积分，得到 $120(0.1225 - 0.0625) = 7.2$ J；但胡克定律是关于超出自然长度的拉伸量，而不是长度本身。

```check
same(Rational(12)/Rational(5, 100), 240); antideriv(120*x**2, 240*x, x)
steps(Integral(240*x, (x, Rational(5, 100), Rational(15, 100))), 120*(Rational(225, 10000) - Rational(25, 10000)), Rational(24, 10))
same(integrate(240*x, (x, Rational(25, 100), Rational(35, 100))), Rational(72, 10)); same(120*(Rational(1225, 10000) - Rational(625, 10000)), Rational(72, 10))
```
:::
::::

:::: exercise 收敛还是发散？ {#ex-12-4} ★
判断每个积分是否收敛。在 (a) 到 (d) 中，若收敛则求其值；在 (e) 和 (f) 中，使用比较法。

- (a) $\displaystyle\int_1^\infty \frac{dx}{x^{3/2}}$
- (b) $\displaystyle\int_0^1 \frac{dx}{x^{3/2}}$
- (c) $\displaystyle\int_0^\infty e^{-3x}\,dx$
- (d) $\displaystyle\int_0^4 \frac{dx}{\sqrt{4 - x}}$
- (e) $\displaystyle\int_1^\infty \frac{\cos^2 x}{x^2}\,dx$
- (f) $\displaystyle\int_1^\infty \frac{x}{\sqrt{x^3 + 1}}\,dx$

::: solution
**(a)** A $p$-积分在 $p = \tfrac32 > 1$：它收敛，值为 $\dfrac{1}{3/2 - 1} = 2$。直接计算： $\int_1^t x^{-3/2}\,dx = 2 - \dfrac{2}{\sqrt t} \to 2$。

**(b)** 在 0 附近， $p$-积分需要 $p < 1$，且 $p = \tfrac32$：它发散。直接计算： $\int_t^1 x^{-3/2}\,dx = \dfrac{2}{\sqrt t} - 2 \to \infty$ 作为 $t \to 0^+$。

**(c)** $\int_0^t e^{-3x}\,dx = \Big[-\dfrac{e^{-3x}}{3}\Big]_0^t = \dfrac{1 - e^{-3t}}{3} \to \dfrac13$：它收敛，值为 $\tfrac13$。

**(d)** 被积函数在 $x = 4$ 附近无界。 $(4 - x)^{-1/2}$ 的一个原函数是 $-2\sqrt{4 - x}$（代入 $u = 4 - x$），因此对于 $0 < t < 4$

$$\int_0^t \frac{dx}{\sqrt{4 - x}} = 4 - 2\sqrt{4 - t},$$

当 $t \to 4^-$ 趋近于 4 时，它收敛，值为 4。

**(e)** 对于任意 $x$， $0 \le \cos^2 x \le 1$，因此对于 $x \ge 1$

$$0 \le \frac{\cos^2 x}{x^2} \le \frac{1}{x^2}.$$

$p$-积分 $\int_1^\infty dx/x^2$ 收敛 ($p = 2$), 所以根据比较判别法，积分收敛，其值不超过 1。 (其数值解约为 0.327。)

**(f)** 对于大的 $x$，被积函数的行为类似于 $x/x^{3/2} = 1/\sqrt x$，其积分发散，因此需要寻找一个下界。对于 $x \ge 1$，$x^3 \ge 1$，所以 $x^3 + 1 \le 2x^3$ 和 $\sqrt{x^3 + 1} \le \sqrt2\,x^{3/2}$。因此

$$\begin{aligned} \frac{x}{\sqrt{x^3 + 1}} &\ge \frac{x}{\sqrt2\,x^{3/2}} \\ &= \frac{1}{\sqrt2\,\sqrt x} > 0. \end{aligned}$$

$\int_1^t \frac{dx}{\sqrt2\,\sqrt x} = \sqrt2\big(\sqrt t - 1\big) \to \infty$，因此根据比较判别法 (b) 积分发散。极限比较判别法在一行中给出相同结论，如 $x \to \infty$：

$$\frac{x/\sqrt{x^3 + 1}}{1/\sqrt x} = \frac{x^{3/2}}{\sqrt{x^3 + 1}} \to 1.$$

该界 $x/\sqrt{x^3 + 1} \le 1/\sqrt x$ 是正确的，但它证明不了任何东西：它将被积函数置于一个积分发散的函数之下。

```check
same(integrate(x**Rational(-3, 2), (x, 1, t)), 2 - 2/sqrt(t)); limit_is(2 - 2/sqrt(t), t, oo, 2); same(1/(Rational(3, 2) - 1), 2)
same(integrate(x**Rational(-3, 2), (x, t, 1)), 2/sqrt(t) - 2); limit_is(2/sqrt(t) - 2, t, 0, oo, '+')
antideriv(-exp(-3*x)/3, exp(-3*x), x); same(integrate(exp(-3*x), (x, 0, t)), (1 - exp(-3*t))/3); limit_is((1 - exp(-3*t))/3, t, oo, Rational(1, 3))
antideriv(-2*sqrt(4 - x), 1/sqrt(4 - x), x)
same((-2*sqrt(4 - x)).subs(x, t) - (-2*sqrt(4 - x)).subs(x, 0), 4 - 2*sqrt(4 - t))    # the integral from 0 to t
tq4 = symbols('t', positive=True); same(integrate(1/sqrt(4 - x), (x, 0, tq4)).subs(tq4, Rational(3)), 4 - 2*sqrt(4 - 3))
limit_is(4 - 2*sqrt(4 - t), t, 4, 4, '-'); same(integrate(1/sqrt(4 - x), (x, 0, 4)), 4)
xr4 = symbols('x', real=True); same(function_range(cos(xr4)**2, xr4, S.Reals), Interval(0, 1))
same(integrate(x**-2, (x, 1, oo)), 1)
I4e = (1 + cos(2) - pi + 2*Si(2))/2                          # by parts: the integral of (1 + cos 2x)/(2x^2) over [1, oo)
near(N(I4e, 30), 0.5 + 0.5*mpmath.quadosc(lambda X: mpmath.cos(2*X)/X**2, [1, mpmath.inf], omega=2), 1e-20)
rounds(I4e, '0.327'); holds(I4e <= 1)
same(solve_univariate_inequality(x**3 + 1 <= 2*x**3, x, relational=False), Interval(1, oo))
xp4 = symbols('x', positive=True); same(xp4/(sqrt(2)*xp4**Rational(3, 2)), 1/(sqrt(2)*sqrt(xp4))); same(xp4/sqrt(xp4**3), 1/sqrt(xp4))
same(integrate(1/(sqrt(2)*sqrt(x)), (x, 1, t)), sqrt(2)*(sqrt(t) - 1)); limit_is(sqrt(2)*(sqrt(t) - 1), t, oo, oo)
same((xp4/sqrt(xp4**3 + 1))/(1/sqrt(xp4)), xp4**Rational(3, 2)/sqrt(xp4**3 + 1)); limit_is(x**Rational(3, 2)/sqrt(x**3 + 1), x, oo, 1)
```
:::
::::

:::: exercise 水平条带 {#ex-12-5} ★★
求由抛物线 $x = y^2 - 4$ 和直线 $x + y = 2$ 所围成的区域的面积。为什么用垂直条形图会使这个问题变得更难？

::: solution
画出直线 $x = 2 - y$。曲线相交于 $y^2 - 4 = 2 - y$，即 $y^2 + y - 6 = 0$，或 $(y + 3)(y - 2) = 0$：在 $y = -3$ 和 $y = 2$ 处，点 $(5, -3)$ 和 $(0, 2)$。在 $y = 0$ 处，直线位于 $x = 2$，抛物线位于 $x = -4$，因此直线在右侧。右减左为 $(2 - y) - (y^2 - 4) = 6 - y - y^2$，且

$$\begin{aligned} A &= \int_{-3}^{2} \big(6 - y - y^2\big)\,dy \\ &= \Big[6y - \frac{y^2}{2} - \frac{y^3}{3}\Big]_{-3}^{2} \\ &= \frac{22}{3} - \Big(-\frac{27}{2}\Big) \\ &= \frac{125}{6} \approx 20.83. \end{aligned}$$

用垂直条带，下边界是抛物线的下半部分 $y = -\sqrt{x + 4}$，一直到底。但上边界在 $x = 0$ 处发生变化：对于 $-4 \le x \le 0$，上边界是抛物线的上半部分 $y = \sqrt{x + 4}$，对于 $0 \le x \le 5$，上边界是直线 $y = 2 - x$。这意味着需要两个积分，都涉及平方根。

```check
same_set(solve(Eq(y**2 - 4, 2 - y), y), [-3, 2]); same(factor(y**2 + y - 6), (y + 3)*(y - 2))
same(((y**2 - 4).subs(y, -3), (2 - y).subs(y, -3)), (5, 5)); same(((y**2 - 4).subs(y, 2), (2 - y).subs(y, 2)), (0, 0))
H125 = 6*y - y**2/2 - y**3/3
antideriv(H125, 6 - y - y**2, y); same(H125.subs(y, 2), Rational(22, 3)); same(H125.subs(y, -3), -Rational(27, 2))
same(Rational(22, 3) + Rational(27, 2), Rational(125, 6)); rounds(Rational(125, 6), '20.83')
same(integrate(sqrt(x + 4) - (-sqrt(x + 4)), (x, -4, 0)) + integrate(2 - x - (-sqrt(x + 4)), (x, 0, 5)), Rational(125, 6))
```
:::
::::

:::: exercise 两段弧长 {#ex-12-6} ★★
- (a) 求 $y = \dfrac{x^2}{4} - \dfrac{\ln x}{2}$ 在 $1 \le x \le e$ 处的精确长度。(提示： $1 + f'(x)^2$ 是一个完全平方。)
- (b) 写出 $y = x^3$ 在 $0 \le x \le 1$ 处的长度积分表达式，并用 $n = 4$ 个 Simpson 规则进行估算。

::: solution
**(a)** $f'(x) = \dfrac{x}{2} - \dfrac{1}{2x}$，所以

$$\begin{aligned} 1 + f'(x)^2 &= 1 + \frac{x^2}{4} - \frac12 + \frac{1}{4x^2} \\ &= \frac{x^2}{4} + \frac12 + \frac{1}{4x^2} \\ &= \Big(\frac{x}{2} + \frac{1}{2x}\Big)^2. \end{aligned}$$

对于 $x > 0$，括号内为正数，因此平方根为 $\dfrac{x}{2} + \dfrac{1}{2x}$，并且

$$\begin{aligned} L &= \int_1^e \Big(\frac{x}{2} + \frac{1}{2x}\Big)\,dx \\ &= \Big[\frac{x^2}{4} + \frac{\ln x}{2}\Big]_1^e \\ &= \frac{e^2}{4} + \frac12 - \frac14 \\ &= \frac{e^2 + 1}{4} \approx 2.097. \end{aligned}$$

**(b)** $f'(x) = 3x^2$，所以 $L = \int_0^1 \sqrt{1 + 9x^4}\,dx$。使用辛普森法则，步长为 $n = 4$ 和 $\Delta x = 0.25$。对于 $g(x) = \sqrt{1 + 9x^4}$，数值分别为 $g(0) = 1$, $g(0.25) \approx 1.01743$, $g(0.5) = 1.25$, $g(0.75) \approx 1.96154$ 和 $g(1) = \sqrt{10} \approx 3.16228$。辛普森法则给出

$$\begin{aligned} S_4 &= \frac{0.25}{3}\big[1 + 4(1.01743) \\ &\qquad + 2(1.25) + 4(1.96154) \\ &\qquad + 3.16228\big] \approx 1.5482. \end{aligned}$$

更精确的值为 $L \approx 1.5479$。

```check
f126 = x**2/4 - log(x)/2
same(diff(f126, x), x/2 - 1/(2*x)); same(expand(1 + diff(f126, x)**2), expand((x/2 + 1/(2*x))**2))
antideriv(x**2/4 + log(x)/2, x/2 + 1/(2*x), x); same(integrate(x/2 + 1/(2*x), (x, 1, E)), (E**2 + 1)/4); rounds((E**2 + 1)/4, '2.097')
g126 = sqrt(1 + 9*x**4); same(diff(x**3, x), 3*x**2)
same(g126.subs(x, 0), 1); rounds(g126.subs(x, Rational(1, 4)), '1.01743'); same(g126.subs(x, Rational(1, 2)), Rational(5, 4)); rounds(g126.subs(x, Rational(3, 4)), '1.96154'); rounds(sqrt(10), '3.16228')
S4_126 = Rational(1, 4)/3*(g126.subs(x, 0) + 4*g126.subs(x, Rational(1, 4)) + 2*g126.subs(x, Rational(1, 2)) + 4*g126.subs(x, Rational(3, 4)) + g126.subs(x, 1))
rounds(S4_126, '1.5482'); rounds(Integral(g126, (x, 0, 1)).evalf(30), '1.5479')
```
:::
::::

:::: exercise 抽水 {#ex-12-7} ★★
一个圆柱形水箱，轴线垂直，半径为 1 米，高度为 3 米。水箱中水深 2 米。将水全部抽到水箱顶部需要做多少功？（水的密度为 1000 kg/m³；取 $g = 9.8$ m/s²。）

::: solution
设 $y$ 为距离底部的高度。高度在 $y$ 到 $y + \Delta y$ 之间的水层，对于 $0 \le y \le 2$，是一个半径为 1 米、厚度为 $\Delta y$ 的圆盘：体积为 $\pi\,\Delta y$ m³，质量为 $1000\pi\,\Delta y$ kg，重量为 $9800\pi\,\Delta y$ N。它被提升 $3 - y$ 米到水箱顶部。因此

$$\begin{aligned} W &= \int_0^2 9800\pi(3 - y)\,dy \\ &= 9800\pi\Big[3y - \frac{y^2}{2}\Big]_0^2 \\ &= 9800\pi(6 - 2) = 39\,200\pi \\ &\approx 1.23 \times 10^5 \text{ J}. \end{aligned}$$

用质心检查：水的质量是 $2000\pi$ kg，其质心距离底部 1 m。每一层最终都到达顶部，距离底部 3 m，因此平均而言，水上升 2 m，得到 $2000\pi \times 9.8 \times 2 = 39\,200\pi$ J。需避免两个错误：距离是到水箱顶部 $3 - y$，而不是到水面 $2 - y$；积分限是 0 和 2，即水所在区域，而不是 0 和 3。

```check
same(1000*pi*Rational(98, 10), 9800*pi); antideriv(3*y - y**2/2, 3 - y, y)
steps(Integral(9800*pi*(3 - y), (y, 0, 2)), 9800*pi*(6 - 2), 39200*pi)
rounds(39200*pi/10**5, '1.23'); same(1000*pi*1**2*2*Rational(98, 10)*2, 39200*pi)
same(integrate(y*pi, (y, 0, 2))/integrate(pi, (y, 0, 2)), 1)
```
:::
::::

:::: exercise 求形心 {#ex-12-8} ★★
求 $y = x$ 与 $y = x^2$ 之间区域的形心，其中 $0 \le x \le 1$，并检验形心确实位于区域内。

::: solution
当 $0 \le x \le 1$ 时，$x \ge x^2$，所以 $f(x) = x$、$g(x) = x^2$。面积为 $A = \int_0^1 (x - x^2)\,dx = \tfrac12 - \tfrac13 = \tfrac16$。于是

$$\begin{aligned} \bar x &= 6\int_0^1 x\big(x - x^2\big)\,dx \\ &= 6\Big(\frac13 - \frac14\Big) = \frac12, \\ \bar y &= 6\int_0^1 \frac12\big(x^2 - x^4\big)\,dx \\ &= 3\Big(\frac13 - \frac15\Big) = \frac25. \end{aligned}$$

形心为 $\big(\tfrac12, \tfrac25\big)$。在 $x = \tfrac12$ 处，区域从 $y = \tfrac14$ 延伸到 $y = \tfrac12$，而 $\tfrac25 = 0.4$ 介于两者之间，所以该形心位于区域内部。

```check
A128 = integrate(x - x**2, (x, 0, 1)); same(A128, Rational(1, 6))
same(integrate(x*(x - x**2), (x, 0, 1))/A128, Rational(1, 2)); same(6*(Rational(1, 3) - Rational(1, 4)), Rational(1, 2))
same(integrate((x**2 - x**4)/2, (x, 0, 1))/A128, Rational(2, 5)); same(3*(Rational(1, 3) - Rational(1, 5)), Rational(2, 5))
holds(Rational(1, 4) < Rational(2, 5)); holds(Rational(2, 5) < Rational(1, 2))
```
:::
::::

:::: exercise 一个部件能使用多长时间？ {#ex-12-9} ★★
一种电子元件的寿命（单位：小时）服从指数分布，其均值为 2000 小时（假设数据）。

- (a) 求 $\lambda$，以及元件寿命超过 3000 小时的概率。
- (b) 一个元件已经工作了 1000 小时。求它再工作至少 3000 小时的概率。
- (c) 求中位寿命。

::: solution
**(a)** 均值为 $1/\lambda = 2000$，因此 $\lambda = \tfrac{1}{2000}$ 每小时，且 $P(X > 3000) = e^{-3000/2000} = e^{-1.5} \approx 0.223$。

**(b)** 根据无记忆性（定理 12.5）且 $s = 1000$ 和 $t = 3000$，

$$\begin{aligned} &P(X > 4000 \mid X > 1000) \\ &\qquad= P(X > 3000) \approx 0.223. \end{aligned}$$

直接计算：$\dfrac{P(X > 4000)}{P(X > 1000)} = \dfrac{e^{-2}}{e^{-0.5}} = e^{-1.5}$。元件过去的 1000 小时不影响结果。

**(c)** $1 - e^{-m/2000} = \tfrac12$ 给出 $e^{-m/2000} = \tfrac12$，因此 $m = 2000\ln 2 \approx 1386$ 小时，远低于均值。

```check
lam129 = Rational(1, 2000); same(1/lam129, 2000); same(exp(-lam129*3000), exp(-Rational(3, 2))); rounds(exp(-Rational(3, 2)), '0.223')
same(exp(-lam129*4000)/exp(-lam129*1000), exp(-Rational(3, 2))); same(exp(-2)/exp(-Rational(1, 2)), exp(-Rational(3, 2)))
same(solve(Eq(1 - exp(-mm/2000), Rational(1, 2)), mm), [2000*log(2)]); rounds(2000*log(2), '1386')
```
:::
::::

:::: exercise 通过质心求体积 {#ex-12-10} ★★★
- (a) $y = g(x)$与$y = f(x)$、$a \le x \le b$之间由$0 \le g(x) \le f(x)$围成的区域绕$x$轴旋转，证明该立体的体积为$V = 2\pi\bar yA$，其中$A$为区域面积，$\bar y$为其形心高度，即面积乘以形心移动的距离。
- (b) 检查 (a) 中的区域，对应练习 12.8 的区域。
- (c) 一个 **torus**（环形面包圈），是当一个半径为 $a$ 的圆盘绕其平面内一条距离其圆心 $R > a$ 的直线旋转时所形成的形状。用 (a) 的方法求其体积，并用 washer 法验证结果。

::: solution
**(a)** 用 washer 法，外半径为 $f(x)$，内半径为 $g(x)$，绕 $V = \pi\int_a^b \big(f(x)^2 - g(x)^2\big)\,dx$ 轴。根据质心的定义（定义 12.6），

$$\begin{aligned} \bar yA &= \int_a^b \frac12\big(f(x)^2 - g(x)^2\big)\,dx \\ &= \frac{V}{2\pi}, \end{aligned}$$

所以 $V = 2\pi\bar yA$。质心绕半径为 $\bar y$ 的圆周运动，路径长度为 $2\pi\bar y$。

**(b)** $A = \tfrac16$ 和 $\bar y = \tfrac25$，因此 $2\pi\bar yA = 2\pi \cdot \tfrac25 \cdot \tfrac16 = \tfrac{2\pi}{15}$。用 washer 法，得到 $\pi\int_0^1 \big(x^2 - x^4\big)\,dx = \pi\big(\tfrac13 - \tfrac15\big) = \tfrac{2\pi}{15}$。

**(c)** 将轴沿 $x$-轴，圆盘中心位于 $(0, R)$。圆盘关于其中心对称，因此其质心为 $\bar y = R$，即 $A = \pi a^2$。所以

$$V = 2\pi R \cdot \pi a^2 = 2\pi^2Ra^2.$$

用 washer 法：圆盘是 $x^2 + (y - R)^2 \le a^2$，所以在 $x$ 处从 $y = R - \sqrt{a^2 - x^2}$ 到 $y = R + \sqrt{a^2 - x^2}$，且两者至少为 $R - a > 0$。平方半径之差为 $\big(R + \sqrt{a^2 - x^2}\big)^2 - \big(R - \sqrt{a^2 - x^2}\big)^2 = 4R\sqrt{a^2 - x^2}$，所以

$$\begin{aligned} V &= \pi\int_{-a}^{a} 4R\sqrt{a^2 - x^2}\,dx \\ &= 4\pi R \cdot \frac{\pi a^2}{2} = 2\pi^2Ra^2, \end{aligned}$$

因为 $\int_{-a}^{a} \sqrt{a^2 - x^2}\,dx$ 是半径为 $a$ 的半圆的面积。

```check
fF, gF = Function('f'), Function('g')
same(pi*Integral(fF(x)**2 - gF(x)**2, (x, a, b)), 2*pi*Integral((fF(x)**2 - gF(x)**2)/2, (x, a, b)))
same(2*pi*Rational(2, 5)*Rational(1, 6), 2*pi/15); same(pi*integrate(x**2 - x**4, (x, 0, 1)), 2*pi/15)
Rt, at = symbols('R a', positive=True)
same(expand((Rt + sqrt(at**2 - x**2))**2 - (Rt - sqrt(at**2 - x**2))**2), 4*Rt*sqrt(at**2 - x**2))
same(integrate(sqrt(at**2 - x**2), (x, -at, at)), pi*at**2/2)
same(pi*integrate(4*Rt*sqrt(at**2 - x**2), (x, -at, at)), 2*pi**2*Rt*at**2); same(2*pi*Rt*pi*at**2, 2*pi**2*Rt*at**2)
```
:::
::::

:::: exercise 壳法与 washer 法一致 {#ex-12-11} ★★★
设 $f$ 在 $[0, b]$ 上严格递减，且 $f'$ 连续， $f(0) = h$ 和 $f(b) = 0$，令 $g$ 是其反函数（模块 1）。区域在 $y = f(x)$， $0 \le x \le b$ 下，绕 $y$-轴旋转。

- (a) 解释为何垂直于轴的切片给出 $V = \pi\int_0^h g(y)^2\,dy$。
- (b) 代入 $y = f(x)$，然后进行分部积分，以证明这等于 $2\pi\int_0^b x\,f(x)\,dx$，即壳公式。
- (c) 用 $f(x) = 1 - x^2$ 在 $[0, 1]$ 上验证两个公式。

::: solution
**(a)** 截面在高度 $y$, $0 \le y \le h$ 处。由于 $f$ 是严格递减的，所以 $f(x) \ge y$ 恰好当 $x \le g(y)$，因此在高度 $y$ 处的区域是线段 $0 \le x \le g(y)$。绕 $y$ 轴旋转，扫出一个半径为 $g(y)$ 的圆盘，面积为 $\pi g(y)^2$，所以 $V = \pi\int_0^h g(y)^2\,dy$。

**(b)** 代入 $y = f(x)$, $dy = f'(x)\,dx$（模块 10）。当 $x = 0$ 时， $y = h$；当 $x = b$ 时， $y = 0$；且 $g(y) = g\big(f(x)\big) = x$。因此

$$\begin{aligned} &\pi\int_0^h g(y)^2\,dy \\ &\quad= -\pi\int_h^0 g(y)^2\,dy \\ &\quad= -\pi\int_0^b x^2f'(x)\,dx. \end{aligned}$$

分部积分（模块 11）令 $u = x^2$ 和 $dv = f'(x)\,dx$，所以 $du = 2x\,dx$ 和 $v = f(x)$：

$$\begin{aligned} &\int_0^b x^2f'(x)\,dx \\ &\quad= \big[x^2f(x)\big]_0^b - \int_0^b 2x\,f(x)\,dx \\ &\quad= -2\int_0^b x\,f(x)\,dx, \end{aligned}$$

因为 $b^2f(b) = 0$ 和 $0^2f(0) = 0$。因此 $\pi\int_0^h g(y)^2\,dy = 2\pi\int_0^b x\,f(x)\,dx$。

**(c)** 此处 $h = 1$ 和 $g(y) = \sqrt{1 - y}$。切片法： $\pi\int_0^1 (1 - y)\,dy = \tfrac{\pi}{2}$。壳层法： $2\pi\int_0^1 x\big(1 - x^2\big)\,dx = 2\pi\big(\tfrac12 - \tfrac14\big) = \tfrac{\pi}{2}$。

```check
fS_ = Function('f')
same(x**2*diff(fS_(x), x), diff(x**2*fS_(x), x) - 2*x*fS_(x))      # the product rule behind the parts step
same((x**2*fS_(x)).subs(x, b) - (x**2*fS_(x)).subs(x, 0), b**2*fS_(b)); same((b**2*fS_(b)).subs(fS_(b), 0), 0)
yq = symbols('y', nonnegative=True)
for f_try, g_try in ((1 - x**2, sqrt(1 - y)), ((1 - x)**3, 1 - y**Rational(1, 3)), (cos(pi*x/2), 2*acos(y)/pi)):
    # instances: decreasing on [0, 1] from f(0) = 1 to f(1) = 0, with g the inverse function
    same(f_try.subs(x, 0), 1); same(f_try.subs(x, 1), 0); same(f_try.subs(x, g_try.subs(y, yq)), yq)
    steps(pi*integrate(g_try**2, (y, 0, 1)), -pi*integrate(x**2*diff(f_try, x), (x, 0, 1)), 2*pi*integrate(x*f_try, (x, 0, 1)))
same((1 - x**2).subs(x, sqrt(1 - yq)), yq); same(pi*integrate(1 - y, (y, 0, 1)), pi/2); same(2*pi*integrate(x*(1 - x**2), (x, 0, 1)), pi/2)
```
:::
::::

:::: exercise 正态分布的展开 {#ex-12-12} ★★★
设 $\varphi(z) = \dfrac{1}{\sqrt{2\pi}}e^{-z^2/2}$。

- (a) 证明 $\varphi''(z) = (z^2 - 1)\varphi(z)$，并推导出 $\varphi$ 的图像在 $z = \pm1$ 处发生凹凸性变化（模块 8）。正态密度函数均值为 $\mu$、标准差为 $\sigma$ 的拐点在哪里？
- (b) 用 $u = z$ 和 $dv = z\varphi(z)\,dz$ 分部积分，以证明 $\int_{-\infty}^{\infty} z^2\varphi(z)\,dz = 1$。你可以使用高斯积分。
- (c) 推导出，对于均值为 $\mu$、标准差为 $\sigma$ 的正态密度 $f$，有 $\int_{-\infty}^{\infty} (x - \mu)^2f(x)\,dx = \sigma^2$。（这个均值与均值的平方距离称为 **方差**。）

::: solution
**(a)** 根据链式法则， $\varphi'(z) = -z\varphi(z)$。根据乘积法则，

$$\begin{aligned} \varphi''(z) &= -\varphi(z) - z\varphi'(z) \\ &= -\varphi(z) + z^2\varphi(z) \\ &= \big(z^2 - 1\big)\varphi(z). \end{aligned}$$

由于 $\varphi(z) > 0$， $\varphi''$ 的符号由 $z^2 - 1$ 决定：在 $\abs{z} < 1$ 时为负（向下凹），在 $\abs{z} > 1$ 时为正（向上凹）。因此在 $z = \pm1$ 处凹凸性发生变化，即拐点。正态密度为 $f(x) = \tfrac1\sigma\varphi\big(\tfrac{x - \mu}{\sigma}\big)$，因此根据链式法则 $f''(x) = \tfrac{1}{\sigma^3}\varphi''\big(\tfrac{x - \mu}{\sigma}\big)$，其符号在 $\tfrac{x - \mu}{\sigma} = \pm1$ 处发生变化：即在 $x = \mu \pm \sigma$ 处。

**(b)** 用 $u = z$ 和 $dv = z\varphi(z)\,dz$，以及 $du = dz$ 和 $v = -\varphi(z)$（由 (a) 中的 $\varphi' = -z\varphi$）。对于 $t > 0$，

$$\begin{aligned} &\int_0^t z^2\varphi(z)\,dz \\ &\quad= \big[-z\varphi(z)\big]_0^t + \int_0^t \varphi(z)\,dz \\ &\quad= -t\varphi(t) + \int_0^t \varphi(z)\,dz. \end{aligned}$$

当 $t \to \infty$ 时，$t\varphi(t) \to 0$。事实上，对于 $t \ge 2$，有 $t^2/2 \ge t$，所以 $0 < te^{-t^2/2} \le te^{-t}$，后者趋近于零（定理 7.7）。又因为 $\varphi$ 是偶函数，$\int_0^t \varphi \to \tfrac12$ 等于总面积 1 的一半。因此 $\int_0^\infty z^2\varphi(z)\,dz = \tfrac12$；再由 $z^2\varphi(z)$ 是偶函数，得到 $\int_{-\infty}^{\infty} z^2\varphi(z)\,dz = 1$。

**(c)** 代入 $z = (x - \mu)/\sigma$，因此 $x - \mu = \sigma z$ 和 $dx = \sigma\,dz$：

$$\begin{aligned} &\int_{-\infty}^{\infty} (x - \mu)^2\,\frac1\sigma\varphi\Big(\frac{x - \mu}{\sigma}\Big)\,dx \\ &\qquad= \int_{-\infty}^{\infty} \sigma^2z^2\varphi(z)\,dz = \sigma^2. \end{aligned}$$

```check
same(diff(phi12, z), -z*phi12); same(diff(phi12, z, 2), (z**2 - 1)*phi12)
holds((z**2 - 1).subs(z, Rational(1, 2)) < 0); holds((z**2 - 1).subs(z, 2) > 0)
same(diff(phi12.subs(z, (x - mu_)/sg)/sg, x, 2), ((z**2 - 1)*phi12).subs(z, (x - mu_)/sg)/sg**3)
same(solve(((x - mu_)/sg)**2 - 1, x), [mu_ - sg, mu_ + sg])
tz = symbols('t', positive=True)
same(integrate(z**2*phi12, (z, 0, tz)), -tz*phi12.subs(z, tz) + integrate(phi12, (z, 0, tz)))
limit_is(t*exp(-t**2/2), t, oo, 0); holds(all(Integer(v)**2/2 >= v for v in (2, 3, 10)))
same(integrate(phi12, (z, 0, oo)), Rational(1, 2)); same(integrate(z**2*phi12, (z, -oo, oo)), 1)
same(integrate((x - mu_)**2*fN, (x, -oo, oo)), sg**2)
```
:::
::::

## 自测 {#quiz}

```quiz
? 区域在 $y = x$ 和 $y = x^2$ 之间，对于 $0 \le x \le 1$ 的面积是
- [ ] $\tfrac12$
- [x] $\tfrac16$
- [ ] $-\tfrac16$
- [ ] $\tfrac13$
> 上减下：$\int_0^1 (x - x^2)\,dx = \tfrac12 - \tfrac13 = \tfrac16$。$\tfrac12$ 是直线下方的面积，$\tfrac13$ 是抛物线下方的面积；$-\tfrac16$ 是反向相减，即下减上，而面积永远不会为负。

? $y = x^2$ 和 $y = 2$ 之间的区域，对于 $0 \le x \le \sqrt2$，绕 $x$ 轴旋转。其体积是
- [ ] $\pi\displaystyle\int_0^{\sqrt2} \big(2 - x^2\big)^2\,dx$
- [ ] $\pi\displaystyle\int_0^{\sqrt2} \big(2 - x^2\big)\,dx$
- [x] $\pi\displaystyle\int_0^{\sqrt2} \big(4 - x^4\big)\,dx$
- [ ] $2\pi\displaystyle\int_0^{\sqrt2} x\big(2 - x^2\big)\,dx$
> 每一片都是一个 washer，外半径为 2，内半径为 $x^2$，面积为 $\pi\big(2^2 - (x^2)^2\big) = \pi\big(4 - x^4\big)$。 $\pi(2 - x^2)^2$ 是 $\pi(R - r)^2$，错误的面积； $\pi(2 - x^2)$ 忘记了平方半径；最后一个积分是绕 $y$ 轴旋转的壳公式，对应不同的立体。

? 在 $y = x$ 和 $y = x^2$ 之间的区域 $0 \le x \le 1$ 绕直线 $x = 2$ 旋转。用壳公式，其体积为
- [x] $2\pi\displaystyle\int_0^1 (2 - x)\big(x - x^2\big)\,dx$
- [ ] $2\pi\displaystyle\int_0^1 x\big(x - x^2\big)\,dx$
- [ ] $2\pi\displaystyle\int_0^1 (x - 2)\big(x - x^2\big)\,dx$
- [ ] $\pi\displaystyle\int_0^1 \big(x^2 - x^4\big)\,dx$
> 在 $x$ 处的条带距离轴 $x = 2$ 为 $2 - x$，高度为 $x - x^2$。半径 $x$ 属于绕 $y$ 轴旋转； $x - 2$ 在 $[0, 1]$ 上为负，因此给出负的“体积”；最后一个积分是绕 $x$ 轴旋转的 washer 公式。

? 哪个积分是曲线 $y = x^3$ 从 $x = 0$ 到 $x = 1$ 的长度？
- [ ] $\displaystyle\int_0^1 \sqrt{1 + x^6}\,dx$
- [ ] $\displaystyle\int_0^1 \big(1 + 3x^2\big)\,dx$
- [ ] $\displaystyle\int_0^1 \sqrt{1 + 3x^2}\,dx$
- [x] $\displaystyle\int_0^1 \sqrt{1 + 9x^4}\,dx$
> 公式使用了导数 $f'(x) = 3x^2$ 的平方：$1 + (3x^2)^2 = 1 + 9x^4$。$\sqrt{1 + x^6}$ 用 $f$ 的平方代替了 $f'$；$1 + 3x^2$ 将阶梯的步长相加，这些步长并不沿曲线；而 $\sqrt{1 + 3x^2}$ 忘记了平方 $f'$。

? 一条 10 米长的链条，每米质量为 2 千克，悬挂在绞盘上。将它全部卷起需要做多少功？（取 $g = 9.8$ m/s²。）
- [ ] 1960 J
- [x] 980 J
- [ ] 100 J
- [ ] 196 J
> 深度为 $y$ 的部分重 $2 \times 9.8\,\Delta y$ 牛顿，上升 $y$ 米：$W = \int_0^{10} 19.6\,y\,dy = 19.6 \times 50 = 980$ 焦耳。1960 焦耳将整个重量 196 牛顿提升 10 米，但只有底部末端上升那么远；100 焦耳忽略了 $g$（单位是千克·米，不是焦耳）；196 牛顿是链条的重量，是一个力，不是功。

? 下列哪些广义积分收敛？
- [ ] $\displaystyle\int_1^\infty \frac{dx}{x^{0.9}}$
- [ ] $\displaystyle\int_{-1}^{1} \frac{dx}{x^2}$
- [x] $\displaystyle\int_1^\infty \frac{dx}{x^{1.1}}$
- [ ] $\displaystyle\int_0^1 \frac{dx}{x}$
> 在无穷远处，一个 $p$-积分 收敛 当且仅当 $p > 1$，因此 $p = 1.1$ 收敛（到 10）且 $p = 0.9$ 发散。 $\int_{-1}^{1} dx/x^2$ 在 0 处是瑕积分，其中其右半部分发散；从原函数得到的值 $-2$ 是错误的。 $\int_0^1 dx/x$ 发散：在 0 附近，积分需要 $p < 1$。

? 帮助台的来电是随机到达的，下一个来电的等待时间（以分钟为单位）服从指数分布，其 $\lambda = 0.1$（均值为 10 分钟）。你已经等待了 5 分钟。你再等待超过 10 分钟的概率是
- [x] $e^{-1} \approx 0.368$
- [ ] $e^{-1.5} \approx 0.223$
- [ ] $e^{-0.5} \approx 0.607$
- [ ] $0.5$
> 指数分布没有记忆性： $P(X > 15 \mid X > 5) = P(X > 10) = e^{-0.1 \times 10} = e^{-1}$。 $e^{-1.5}$ 是 $P(X > 15)$，即你在开始等待前的概率； $e^{-0.5}$ 是 $P(X > 5)$；而 0.5 混淆了均值与中位数。

? 一个量 $X$ 服从均值为 50、标准差为 10 的正态分布。 $P(X \le 70)$ 约为
- [ ] 0.954
- [ ] 0.683
- [ ] 1.000
- [x] 0.977
> 标准化：$z = (70 - 50)/10 = 2$. $P(Z \le 2) = \tfrac12 + \tfrac12P(-2 \le Z \le 2) \approx 0.5 + 0.477 = 0.977$. 0.954 是 $P(-2 \le Z \le 2)$，这省略了下尾部分；0.683 是一个标准差内的概率；而 1.000 则是忘记标准化，将 70 当作 $Z$ 的值。
```

```check
same(integrate(x - x**2, (x, 0, 1)), Rational(1, 6)); same(integrate(x, (x, 0, 1)), Rational(1, 2)); same(integrate(x**2, (x, 0, 1)), Rational(1, 3))
same(pi*(2**2 - (x**2)**2), pi*(4 - x**4)); holds(pi*integrate((2 - x**2)**2, (x, 0, sqrt(2))) < pi*integrate(4 - x**4, (x, 0, sqrt(2))))
holds(integrate((x - 2)*(x - x**2), (x, 0, 1)) < 0); same(2*pi*integrate((2 - x)*(x - x**2), (x, 0, 1)), pi/2)
same(1 + diff(x**3, x)**2, 1 + 9*x**4)
same(integrate(2*Rational(98, 10)*y, (y, 0, 10)), 980); same(2*10*Rational(98, 10)*10, 1960); same(integrate(2*y, (y, 0, 10)), 100); same(2*10*Rational(98, 10), 196)
same(integrate(x**Rational(-11, 10), (x, 1, oo)), 10); same(integrate(x**Rational(-9, 10), (x, 1, oo)), oo); same(integrate(1/x, (x, 0, 1)), oo); same(integrate(1/x**2, (x, -1, 1)), oo)
lq = Rational(1, 10)
same(exp(-lq*15)/exp(-lq*5), exp(-1)); rounds(exp(-1), '0.368'); rounds(exp(-Rational(15, 10)), '0.223'); rounds(exp(-Rational(5, 10)), '0.607')
rounds(Rational(1, 2) + erf(2/sqrt(2))/2, '0.977'); rounds(erf(2/sqrt(2)), '0.954'); rounds(erf(1/sqrt(2)), '0.683'); rounds(erf(2/sqrt(2))/2, '0.477')
rounds(1/2 + erf(70/sqrt(2))/2, '1.000')
```
