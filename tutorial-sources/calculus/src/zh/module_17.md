---
title: 偏导数与梯度
part: 5
lead: 把导数推广到多元函数。你将读懂曲面与等值线图，计算偏导数、切平面与线性近似，并借助树状图应用链式法则。最后，用梯度找出最陡上升方向，并理解梯度下降和反向传播在机器学习中的作用。
minutes: 270
needs: 模块 1 到 16，特别是极限（模块 2）、链式法则（模块 5）、线性化（模块 7）、梯度下降（模块 8），以及向量、点积和平面（模块 16）
goals:
  - 通过定义域、图像及其等值曲线或等值曲面来描述一个二元或三元函数
  - 通过比较路径或夹逼定理判断二元函数的极限是否存在
  - 计算所有阶的偏导数，并使用克莱因定理
  - 求切平面和线性近似，并解释可微性需要的条件比偏导数更多
  - 使用树状图应用链式法则，包括隐函数求导
  - 计算方向导数和梯度，并将其用于最陡上升、梯度下降和反向传播
---

## 多元函数 {#functions}

到目前为止，这个系列主要集中在只有一个自变量的函数上。大多数量都依赖于多个变量。一个圆柱形罐子的体积取决于它的半径 $r$ 和它的高度 $h$: $V = \pi r^2 h$。天气图上的温度取决于两个坐标，房间内的温度取决于三个坐标，机器学习模型的误差则取决于其所有的参数，通常有数百万个参数。本模块将导数扩展到这样的函数。两个变量已经展示了主要的新思想，而接下来的大部分内容，无论是三个变量还是数百万个变量，都不会改变。

::: definition 二元函数
一个 **二元函数**$f$ 是一个规则，它将集合 $D$ 中的每一个有序实数对 $(x, y)$ 恰好对应一个实数 $f(x, y)$，读作 "f of x, y"。集合 $D$，即平面上的点集，是 $f$ 的**定义域**，而所有 $(x, y)$ 在 $D$ 中的取值所组成的集合 $f(x, y)$ 是它的 **值域**。一个 **三元函数** 将空间中集合 $D$ 的每一个点 $(x, y, z)$ 对应一个数 $f(x, y, z)$。
:::

如模块 1 所述，当一个函数由公式给出且未说明其定义域时，定义域是使公式给出实数的所有点的集合。通常写作 $z = f(x, y)$，并称 $x$ 和 $y$ 为 **自变量**，称 $z$ 为 **因变量**。

::: example 定义域与值域
求 (a) $f(x, y) = \sqrt{9 - x^2 - y^2}$ 和 (b) $g(x, y) = \ln(y - x^2)$ 的定义域和值域。

**(a)** 需要 $9 - x^2 - y^2 \ge 0$，即 $x^2 + y^2 \le 9$。由于 $x^2 + y^2$ 是 $(x, y)$ 到原点的距离的平方（模块 16），定义域是以原点为中心、半径为 3 的圆盘，包括其边界，即圆 $x^2 + y^2 = 9$。在该定义域上，$9 - x^2 - y^2$ 介于 0 与 9 之间，因此 $f(x, y)$ 介于 0 与 3 之间。$[0, 3]$ 中的每个数都是值：沿 $x$ 轴，当 $x$ 从 3 降到 0 时，$f(x, 0) = \sqrt{9 - x^2}$ 覆盖 $[0, 3]$ 的所有值。值域是 $[0, 3]$。

**(b)** 对数需要 $y - x^2 > 0$，即 $y > x^2$：定义域是抛物线 $y = x^2$ 上方的区域，不包括抛物线本身。沿 $y$ 轴，当 $y$ 遍历 $(0, \infty)$ 时，$g(0, y) = \ln y$ 取遍所有实数值，因此值域是 $\R$。

```check
r_ = symbols('r', nonnegative=True)                                       # r_ = the distance from the origin
same(solve_univariate_inequality(9 - r_**2 >= 0, r_, relational=False).intersect(Interval(0, oo)), Interval(0, 3))
f171 = sqrt(9 - x**2 - y**2)
same(f171.subs({x: 0, y: 0}), 3); same(f171.subs({x: 3, y: 0}), 0)
same(function_range(sqrt(9 - x**2), x, Interval(0, 3)), Interval(0, 3))   # f(x, 0) for 0 <= x <= 3
same(function_range(log(y), y, Interval.open(0, oo)), S.Reals)            # g(0, y) = ln y
```
:::

### 图像 {#graphs}

函数$f$的**图**是空间中满足$z = f(x, y)$和$(x, y)$在定义域内的点$(x, y, z)$的集合。在定义域的每个点$(x, y)$上方，它恰好有一个点，高度为$f(x, y)$。对于平面区域上的连续函数，可将图视为一个**曲面**（图17.1，左侧）。例17.1中$f(x, y) = \sqrt{9 - x^2 - y^2}$的图是一个穹顶：对$z = \sqrt{9 - x^2 - y^2}$平方得到$x^2 + y^2 + z^2 = 9$，其中$z \ge 0$是中心在原点、半径为3的球体的上半部分。线性函数$f(x, y) = ax + by + c$的图是一个平面（模块16）。

```check
same(f171**2 + x**2 + y**2, 9)
```

用手绘制曲面很困难，即使计算机绘制的图像也会将某些部分隐藏在另一些部分之后。制图师早已解决了这个问题。

### 等高线与等值线图 {#level-curves}

徒步地图并不以三维方式显示山地。它绘制 **等高线**，这些线连接的是同一海拔高度上的点，并标注相应的高度。天气图也采用相同的方式绘制 **等温线**，即温度相等的曲线，以及 **等压线**，即气压相等的曲线。

::: definition 等高线
对二元函数 $f$，每取其值域中的一个常数 $k$，所有满足 $f(x, y) = k$ 的点就组成 $f$ 的一个**等值集**。等值集通常是曲线，称为**等值线**，也可以是一个点或整个区域。按等间隔选取常数 $k$，画出各等值线并标注对应的数值，就得到 $f$ 的**等值线图**。
:::

等高线 $f(x, y) = k$ 是定义域内使曲面高度为 $k$ 的点的集合：用水平平面 $z = k$ 剖开曲面，并从上方观察剖面。图 17.1 展示了一个有两个峰的曲面，其等高线在相应高度上绘制在曲面上，并形成了等高线图。

::: figure id=fig-17-1
左：函数 $f(x, y) = (x^2 + 3y^2)e^{1 - x^2 - y^2}$ 的图像，是一个有两个高度为 $(0, \pm1)$ 的峰的地形，原点处有一个凹陷，两个山口位于 $(\pm1, 0)$ 处。其等高线 $f = 0.5, 1, 1.5, 2, 2.5$ 在曲面上相应高度处绘制。右：从上方观察的相同等高线，即等高线图。等高线 $f = 1$ 在山口处交叉。
:::

```check
fL = (x**2 + 3*y**2)*exp(1 - x**2 - y**2)
same([fL.subs({x: 0, y: 1}), fL.subs({x: 0, y: -1}), fL.subs({x: 1, y: 0}), fL.subs({x: -1, y: 0}), fL.subs({x: 0, y: 0})], [3, 3, 1, 1, 0])
same_set(solve([diff(fL, x), diff(fL, y)], [x, y], dict=True), [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}])
holds(diff(fL.subs(y, 0), x, 2).subs(x, 1) < 0); holds(diff(fL.subs(x, 1), y, 2).subs(y, 0) > 0)   # a pass: down along x, up along y
holds(diff(fL.subs(x, 0), y, 2).subs(y, 1) < 0); holds(diff(fL.subs(y, 1), x, 2).subs(x, 0) < 0)   # a peak at (0, 1)
```

等高线图的读法如下：

- 等高线密集的地方，曲面陡峭；等高线稀疏的地方，曲面平缓。在陡峭的坡度上，高度相等的步长所对应的水平距离较小。
- 小的闭合等高线围绕一点，表示峰或凹陷；标签会告诉你具体是哪一个。
- 在图 17.1 中的山口处，等高线 $f = 1$ 交叉自身。

::: example 一个穹顶的等高线
描述$k = 0, 1, 2, 3$的$f(x, y) = \sqrt{9 - x^2 - y^2}$的水平集$f(x, y) = k$，并解释它们如何显示圆顶的形状。

对于 $0 \le k \le 3$， $\sqrt{9 - x^2 - y^2} = k$ 表示 $9 - x^2 - y^2 = k^2$ （两边均为非负数，因此平方不会丢失信息），即，

$$x^2 + y^2 = 9 - k^2,$$

以原点为中心，半径为 $\sqrt{9 - k^2}$ 的圆。半径分别为 3， $\sqrt8 \approx 2.83$， $\sqrt5 \approx 2.24$ 和 0：对于 $k = 3$，“圆”是穹顶顶部的单点 $(0, 0)$。相邻圆之间的间隔约为 0.17，0.59 和 2.24。这些圆在穹顶边缘附近密集（那里穹顶陡峭，其侧面是垂直的），而在顶部附近扩散（那里穹顶几乎平坦）。

```check
kk = symbols('k', nonnegative=True)
same(sqrt(9 - (9 - kk**2)), kk)                                         # on x^2 + y^2 = 9 - k^2, f = k
same([sqrt(9 - kv**2) for kv in (0, 1, 2, 3)], [3, sqrt(8), sqrt(5), 0])
rounds(sqrt(8), '2.83'); rounds(sqrt(5), '2.24')
rounds(3 - sqrt(8), '0.17'); rounds(sqrt(8) - sqrt(5), '0.59')
holds(3 - sqrt(8) < sqrt(8) - sqrt(5)); holds(sqrt(8) - sqrt(5) < sqrt(5))
```
:::

::: pitfall
无标签的等高线图无法区分峰顶和凹陷：两者都可以有嵌套的闭合曲线。请阅读标签。不要将等值线与图形混淆： $f(x, y) = x^2 + y^2$ 的正等值线是圆，而其在 0 处的等值集是一个点。其图形是一个碗形曲面 $z = x^2 + y^2$，在正高度处的水平截面即为这些圆。
:::

### 三个变量和等值面 {#level-surfaces}

三元函数的图像需要四维空间。因此，人们研究其**水平面** $f(x, y, z) = k$。对于房间内的温度，它们是等温面。对于$f(x, y, z) = x^2 + y^2 + z^2$，即原点的距离平方，水平面$f = k$是当$k > 0$时以原点为中心、半径为$\sqrt k$的球面，当$k = 0$时是单点$(0, 0, 0)$，当$k < 0$时为空集。第17.6节求水平面的切平面。

## 极限与连续性 {#limits}

在数轴上， $x$ 只能从两个方向趋近于 $a$。在平面上， $(x, y)$ 可以从任何方向趋近于 $(a, b)$，沿直线、螺旋线或其他任何路径，且极限不应依赖于路径。

::: definition 极限
设 $f$ 在以 $(a, b)$ 为中心的圆盘上每一点都有定义，除了可能在 $(a, b)$ 本身。那么

$$\lim_{(x, y)\to(a, b)} f(x, y) = L,$$

读作“f(x, y) 的极限，当 (x, y) 趋近于 (a, b) 时为 L”，如果对于每一个数 $\varepsilon > 0$，存在一个数 $\delta > 0$，使得 $\abs{f(x, y) - L} < \varepsilon$ 对于每一个点 $(x, y)$ 满足

$$0 < \sqrt{(x - a)^2 + (y - b)^2} < \delta.$$
:::

这就是[第 2.7 节](module_02_ZH.html#precise)的 ε–δ 定义，只是把数轴上的距离 $\abs{x - a}$ 换成了平面距离。无论从哪个方向接近，只要各点足够靠近 $(a, b)$，函数值 $f(x, y)$ 就能任意接近 $L$。这里以 $(a, b)$ 为圆心的圆盘指到它的距离小于某个半径 $\rho > 0$ 的点集。如果 $(a, b)$ 在定义域边界上，例如例 17.1 的穹顶上的 $(3, 0)$，则定义不变，只把 $(x, y)$ 限制在定义域内，就像单侧极限把 $x$ 限制在一侧。

模块 2 中的极限法则同样成立，证明相同：和、积、商的极限分别是和、积、商的极限（对于商，当分母的极限不为 0 时）。特别地，对于 $x$ 和 $y$ 的多项式，或分母在 $(a, b)$ 处不为 0 的有理函数，极限等于该值。例如， $\lim_{(x,y)\to(1,2)} \dfrac{x^2 y + 1}{x + y} = \dfrac{2 + 1}{3} = 1$。

```check
same(((x**2*y + 1)/(x + y)).subs({x: 1, y: 2}), 1)
```

### 路径 {#paths}

这是一个在原点处没有极限的函数：

$$f(x, y) = \frac{xy}{x^2 + y^2}, \qquad (x, y) \ne (0, 0).$$

沿着四条直线趋近于原点，以 $x = t$ 逐渐趋近于 0：

```valuetable
t = 0.1, 0.01, 0.001, -0.001
$f(t, 0)$ = (t*0)/(t**2 + 0)
$f(t, t)$ = (t*t)/(t**2 + t**2)
$f(t, 2t)$ = (t*2*t)/(t**2 + 4*t**2)
$f(t, -t)$ = (t*(-t))/(t**2 + t**2)
---
t | f(t, 0) | f(t, t) | f(t, 2t) | f(t, -t)
0.1 | 0 | 0.5 | 0.4 | -0.5
0.01 | 0 | 0.5 | 0.4 | -0.5
0.001 | 0 | 0.5 | 0.4 | -0.5
-0.001 | 0 | 0.5 | 0.4 | -0.5
```

沿每条直线，函数值完全不变，但不同直线间取值不同：沿 $x$ 轴为 0，沿 $y = x$ 为 0.5，沿 $y = 2x$ 为 0.4，沿 $-0.5$ 为 $y = -x$。无论离原点多近，总存在接近 0.5 的值和接近 $-0.5$ 的值，因此不存在满足定义 17.3 的单一数值 $L$。

::: theorem 沿路径取极限
设 $\lim_{(x, y)\to(a, b)} f(x, y) = L$，并设函数 $x(t)$、$y(t)$ 满足当 $t \to t_0$ 时 $x(t) \to a$、$y(t) \to b$。再设当 $t \ne t_0$ 接近 $t_0$ 时，$\big(x(t), y(t)\big)$ 属于 $f$ 的定义域且不同于 $(a, b)$。则

$$\lim_{t\to t_0} f\big(x(t), y(t)\big) = L.$$

所以如果 $f$ 沿着两条这样的路径趋近于不同的数，或者沿着其中一条路径不趋近于任何数，则 $\lim_{(x, y)\to(a, b)} f(x, y)$ 不存在。
:::

::: proof
设 $\varepsilon > 0$，并取 $\delta$ 如定义 17.3 所示。由于 $t \to t_0$，距离 $\sqrt{(x(t) - a)^2 + (y(t) - b)^2}$ 趋于 0，因此对于足够接近 $t_0$ 的每个 $t \ne t_0$，该距离都小于 $\delta$；并且在这些点上它不为 0，因为该点不是 $(a, b)$。对于那些 $t$，$\abs{f(x(t), y(t)) - L} < \varepsilon$，这是 $\lim_{t\to t_0} f(x(t), y(t)) = L$ 所表示的含义。如果极限存在，则它沿每条路径都相同，但当两条路径给出不同数值时这是不可能的。
:::

::: example 依赖路径的极限
证明 $\lim_{(x, y)\to(0, 0)} \dfrac{xy}{x^2 + y^2}$ 不存在。

沿着直线 $y = mx$，带 $x \ne 0$，

$$f(x, mx) = \frac{x \cdot mx}{x^2 + m^2x^2} = \frac{m x^2}{(1 + m^2)x^2} = \frac{m}{1 + m^2}.$$

所以 $f$ 在通过原点的每条直线上都是常数：0 沿着 $x$ 轴（$m = 0$），而 $\tfrac12$ 沿着 $y = x$（$m = 1$）。两条路径给出不同的极限，因此根据定理 17.1，极限不存在。在原点附近，图像是一个扭曲的曲面：从 $-\tfrac12$ 到 $\tfrac12$（即 $m/(1 + m^2)$ 的取值范围）的每一个值，都在通过原点的整条直线上被取到，且可以任意接近原点。

```check
fp172 = x*y/(x**2 + y**2)
steps(fp172.subs(y, m*x), m*x**2/((1 + m**2)*x**2), m/(1 + m**2))
same((m/(1 + m**2)).subs(m, 0), 0); same((m/(1 + m**2)).subs(m, 1), Rational(1, 2)); same((m/(1 + m**2)).subs(m, 2), Rational(2, 5))
same(function_range(m/(1 + m**2), m, S.Reals), Interval(-Rational(1, 2), Rational(1, 2)))
limit_is(fp172.subs(y, 0), x, 0, 0); limit_is(fp172.subs(y, x), x, 0, Rational(1, 2)); same(fp172.subs(x, 0), 0)
```
:::

::: pitfall
沿着每一条直线一致并不证明极限存在。对于 $g(x, y) = \dfrac{x^2 y}{x^4 + y^2}$，通过原点的每一条直线都给出极限 0：沿 $y = mx$， $g = \dfrac{mx}{x^2 + m^2}$，其趋于 0（对于 $m = 0$ 也是 0），沿 $y$ 轴 $g = 0$。但沿抛物线 $y = x^2$， $g = \dfrac{x^4}{2x^4} = \dfrac12$。极限不存在。要证明极限存在，你需要一个覆盖所有接近 $(a, b)$ 的点的论证。

```check
g173 = x**2*y/(x**4 + y**2)
same(g173.subs(y, m*x), m*x/(x**2 + m**2)); limit_is(m*x/(x**2 + m**2), x, 0, 0)
same(g173.subs(y, 0), 0); same(g173.subs(x, 0), 0); same(g173.subs(y, x**2), Rational(1, 2))
```
:::

### 夹逼法 {#squeeze}

[第 2.6 节](module_02_ZH.html#squeeze)的夹逼定理可用于这样的论证。

::: theorem 二维中的夹逼定理
假设 $\abs{f(x, y) - L} \le g(x, y)$ 对于以 $(a, b)$ 为中心的圆盘内的每一个点 $(x, y) \ne (a, b)$，且 $\lim_{(x, y)\to(a, b)} g(x, y) = 0$。那么 $\lim_{(x, y)\to(a, b)} f(x, y) = L$。
:::

::: proof
设 $\varepsilon > 0$。由于 $g \to 0$，存在一个 $\delta > 0$，可以取不超过圆盘的半径，使得 $g(x, y) < \varepsilon$ 当 $0 < \sqrt{(x - a)^2 + (y - b)^2} < \delta$ 时成立。对于这些点， $\abs{f(x, y) - L} \le g(x, y) < \varepsilon$。
:::

::: example 通过夹逼法求极限
求 $\lim_{(x, y)\to(0, 0)} \dfrac{3x^2 y}{x^2 + y^2}$。

沿着线 $y = mx$ 函数是 $\dfrac{3m x^3}{(1 + m^2)x^2} = \dfrac{3m x}{1 + m^2}$，趋于 0，且沿 $y$ 轴其值为 0。因此如果极限存在，则为 0（定理 17.1）。为证明其存在，使用夹逼定理。对于 $(x, y) \ne (0, 0)$， $x^2 \le x^2 + y^2$，所以 $\dfrac{x^2}{x^2 + y^2} \le 1$ 和

$$\abs{\frac{3x^2 y}{x^2 + y^2} - 0} = 3\abs{y}\,\frac{x^2}{x^2 + y^2} \le 3\abs{y}.$$

如 $(x, y) \to (0, 0)$， $3\abs{y} \to 0$，因为 $\abs{y} \le \sqrt{x^2 + y^2}$。根据定理 17.2，极限为 0。用 ε–δ 术语， $\delta = \varepsilon/3$ 成立： $\sqrt{x^2 + y^2} < \varepsilon/3$ 给出 $3\abs{y} < \varepsilon$。

```check
f174 = 3*x**2*y/(x**2 + y**2)
same(f174.subs(y, m*x), 3*m*x/(1 + m**2)); limit_is(3*m*x/(1 + m**2), x, 0, 0); same(f174.subs(x, 0), 0)
xr, yr = symbols('x y', real=True)
same(3*Abs(yr) - Abs(3*xr**2*yr/(xr**2 + yr**2)), 3*Abs(yr)*yr**2/(xr**2 + yr**2))   # the gap below 3|y| is >= 0
holds(all(abs(f174.subs({x: p_, y: q_})) <= 3*abs(q_) for p_ in (Rational(1, 3), -2, Rational(7, 10)) for q_ in (Rational(1, 5), -1, 3)))
```
:::

### 连续性 {#continuity}

::: definition 连续性
设 $f$ 定义在以 $(a, b)$ 为圆心的一个圆盘上。若满足下式，则 $f$ **在 $(a, b)$ 处连续**：

$$\lim_{(x, y)\to(a, b)} f(x, y) = f(a, b).$$

若 **在集合** 上连续，则其在该集合的每一点处连续（在定义域边缘的点，极限取定义域内的点）。
:::

如[模块 3](module_03_ZH.html#continuous-functions)]所述，连续函数的和、积、商（分母不为 0）都是连续的，复合函数也是如此：如果 $g(x, y)$ 在 $(a, b)$ 处连续，且一个变量函数 $h$ 在 $g(a, b)$ 处连续，则 $h\big(g(x, y)\big)$ 在 $(a, b)$ 处连续。由于 $x$ 和 $y$ 本身是连续的，因此所有关于 $x$ 和 $y$ 的多项式函数在全定义域内连续，所有有理函数在其分母不为 0 的地方连续，以及如 $e^{xy}\sin y$ 和 $\ln(x^2 + y^2)$ 这样的函数在其定义域内连续。

在公式失效的点上，仔细观察。例 17.3 和 17.4 中的函数在原点处均未定义。在原点处给每个函数赋予值 0：例 17.4 中的函数在原点处连续，因为其在原点处的极限为 0，而例 17.3 中的函数在原点处不连续，因为其在该点处无极限。此内容将在第 17.4 节中再次提及，作为警告。

## 偏导数 {#partial-derivatives}

取一个半径为 $r = 3$ cm、高为 $h = 10$ cm 的圆柱形罐子，体积为 $V(3, 10) = 90\pi \approx 282.7$ cm³。当半径变化而高度不变时，体积如何变化？将罐子加宽 $\Delta$ cm，或使其增高 $\Delta$ cm，并将每次体积变化除以 $\Delta$：

```valuetable
Delta = 1, 0.1, 0.01, 0.001, -0.001
$\dfrac{V(3 + \Delta, 10) - V(3, 10)}{\Delta}$ = (pi*(3 + Delta)**2*10 - 90*pi)/Delta
$\dfrac{V(3, 10 + \Delta) - V(3, 10)}{\Delta}$ = (pi*9*(10 + Delta) - 90*pi)/Delta
---
\Delta | \dfrac{V(3 + \Delta, 10) - V(3, 10)}{\Delta} | \dfrac{V(3, 10 + \Delta) - V(3, 10)}{\Delta}
1 | 219.911 | 28.2743
0.1 | 191.637 | 28.2743
0.01 | 188.810 | 28.2743
0.001 | 188.527 | 28.2743
-0.001 | 188.464 | 28.2743
```

保持高度为 10，$V = 10\pi r^2$ 是 $r$ 的函数，第一列趋近于其在 $r = 3$、$20\pi r = 60\pi \approx 188.5$ 处的导数。保持半径为 3，$V = 9\pi h$ 是 $h$ 的线性函数，第二列是其斜率 $9\pi \approx 28.27$，无论 $\Delta$ 为何值。这两个数是 **偏导数**，即 $V$ 在 $(3, 10)$ 处的偏导数：在该尺寸附近，体积随半径每增加 1 厘米而增加约 188.5 立方厘米，随高度每增加 1 厘米而增加约 28.3 立方厘米。扩大罐体的体积增长速度比延长罐体快六倍以上。

```check
Vc = pi*r**2*h
same(Vc.subs({r: 3, h: 10}), 90*pi); rounds(90*pi, '282.7')
same(diff(10*pi*r**2, r).subs(r, 3), 60*pi); rounds(60*pi, '188.5'); same(diff(9*pi*h, h), 9*pi); rounds(9*pi, '28.27'); rounds(9*pi, '28.3')
holds(6 < 60*pi/(9*pi)); holds(60*pi/(9*pi) < 7)
```

::: definition 偏导数
设二元函数 $f$ 定义在以 $(a, b)$ 为圆心的一个圆盘上。$f$ 在 $(a, b)$ 处**对 $x$ 的偏导数**为

$$f_x(a, b) = \lim_{h\to0}\frac{f(a + h, b) - f(a, b)}{h},$$

而**对 $y$ 的偏导数**为

$$f_y(a, b) = \lim_{h\to0}\frac{f(a, b + h) - f(a, b)}{h},$$

该结果成立的条件是极限存在。
:::

$f_x$ 读作 "f 下标 x"。其他记号：$\dfrac{\partial f}{\partial x}$ 读作 "对 x 求偏导的 f"（圆弧符号 $\partial$ 读作 "偏导"，表示 $f$ 有其他变量被固定），而 $\dfrac{\partial z}{\partial x}$ 当 $z = f(x, y)$。让点变化得到两个新的二元函数 $f_x(x, y)$ 和 $f_y(x, y)$。

定义说明 $f_x(a, b)$ 是函数 $x \mapsto f(x, b)$ 关于 $a$ 的普通导数，其中 $y$ 在 $b$ 处被固定。这给出了计算偏导数的规则。

::: keyidea
求 $f_x$ 时，将 $y$ 视为常数，按 Modules 4 到 6 的规则对 $x$ 求导。求 $f_y$ 时，将 $x$ 视为常数，对 $y$ 求导。
:::

从几何上看，竖直平面 $y = b$ 与曲面 $z = f(x, y)$ 相交于曲线 $z = f(x, b)$，$f_x(a, b)$ 就是这条曲线在点 $P(a, b, f(a, b))$ 处的斜率，表示从 $P$ 沿 $x$ 轴正向移动时，曲面的升高率。类似地，$f_y(a, b)$ 是由平面 $x = a$ 截出的曲线的斜率（图 17.2 左）。对 $f(x, y) = 6 - x^2 - 2y^2$ 在 $P(1, 1, 3)$ 处，平面 $y = 1$ 截出曲线 $z = 4 - x^2$，在 $x = 1$ 处的斜率为 $-2x = -2$。平面 $x = 1$ 截出曲线 $z = 5 - 2y^2$，在 $y = 1$ 处的斜率为 $-4y = -4$。所以 $f_x(1, 1) = -2$，且 $f_y(1, 1) = -4$。由求导法则，处处有 $f_x = -2x$ 和 $f_y = -4y$。

```check
fd = 6 - x**2 - 2*y**2
same(fd.subs({x: 1, y: 1}), 3); same(fd.subs(y, 1), 4 - x**2); same(fd.subs(x, 1), 5 - 2*y**2)
same(diff(4 - x**2, x).subs(x, 1), -2); same(diff(5 - 2*y**2, y).subs(y, 1), -4)
same(diff(fd, x), -2*x); same(diff(fd, y), -4*y)
limit_is((fd.subs({x: 1 + h, y: 1}) - fd.subs({x: 1, y: 1}))/h, h, 0, -2)      # both partials from their two-sided definitions
limit_is((fd.subs({x: 1, y: 1 + h}) - fd.subs({x: 1, y: 1}))/h, h, 0, -4)
```

::: figure id=fig-17-2
左：曲面 $z = 6 - x^2 - 2y^2$ 和点 $P(1, 1, 3)$。平面 $y = 1$ 截出蓝色曲线 $z = 4 - x^2$，其在点 $P$（暗色）处的切线斜率为 $f_x(1, 1) = -2$；平面 $x = 1$ 截出橙色曲线 $z = 5 - 2y^2$，其切线（红色）斜率为 $f_y(1, 1) = -4$。右：点 $P$ 处的切平面 $z = 9 - 2x - 4y$（第 17.4 节）包含这两条切线。
:::

### 计算偏导数 {#computing}

::: example 依据规则计算偏导数
求（a）曲面 $f(x, y) = x^3y^2 - 5xy + 2y^3$ 的偏导数及其在点 $(1, 2)$ 处的值，（b）曲面 $g(x, y) = \sin(xy^2)$ 和（c）曲线 $q(x, y) = \dfrac{x}{x^2 + y^2}$ 的偏导数。

**(a)** 保持 $y$ 不变时， $y^2$ 是 $x^3y^2$ 的常数因子， $-5y$ 是 $x$ 的常数因子， $2y^3$ 是常数：

$$f_x = 3x^2y^2 - 5y, \qquad f_y = 2x^3y - 5x + 6y^2.$$

在 $(1, 2)$： $f_x(1, 2) = 12 - 10 = 2$ 和 $f_y(1, 2) = 4 - 5 + 24 = 23$。

**(b)** 由链式法则，内函数为 $xy^2$，其偏导数为 $y^2$ 和 $2xy$：

$$g_x = y^2\cos(xy^2), \qquad g_y = 2xy\cos(xy^2).$$

**(c)** 根据商的法则。当 $y$ 为常数时，分母的导数是 $2x$，因此

$$\begin{aligned} q_x &= \frac{(x^2 + y^2) - x \cdot 2x}{(x^2 + y^2)^2} \\ &= \frac{y^2 - x^2}{(x^2 + y^2)^2}. \end{aligned}$$

当 $x$ 为常数时，分子是一个常数，因此

$$q_y = -\frac{x \cdot 2y}{(x^2 + y^2)^2} = -\frac{2xy}{(x^2 + y^2)^2},$$

对于 $(x, y) \ne (0, 0)$ 都是如此。

```check
f175 = x**3*y**2 - 5*x*y + 2*y**3
same(diff(f175, x), 3*x**2*y**2 - 5*y); same(diff(f175, y), 2*x**3*y - 5*x + 6*y**2)
same((3*x**2*y**2 - 5*y).subs({x: 1, y: 2}), 2); same((2*x**3*y - 5*x + 6*y**2).subs({x: 1, y: 2}), 23)
g175 = sin(x*y**2)
same(diff(g175, x), y**2*cos(x*y**2)); same(diff(g175, y), 2*x*y*cos(x*y**2))
q175 = x/(x**2 + y**2)
steps(diff(q175, x), ((x**2 + y**2) - x*2*x)/(x**2 + y**2)**2, (y**2 - x**2)/(x**2 + y**2)**2)
steps(diff(q175, y), -x*2*y/(x**2 + y**2)**2, -2*x*y/(x**2 + y**2)**2)
```
:::

::: pitfall
当对 $x$ 求导时，包含仅 $y$ 的因子是一个常数：即 $\dfrac{\partial}{\partial x}\big(x^3y^2\big) = 3x^2y^2$，而不是 $3x^2y^2 + 2x^3y$，以及 $\dfrac{\partial}{\partial x}\big(y^3\big) = 0$。只有当两个因子都包含 $x$ 时，才需要使用乘积法则。

```check
same(diff(x**3*y**2, x), 3*x**2*y**2); same(diff(y**3, x), 0)
```
:::

对于一个三变量函数，$f_x$、$f_y$ 和 $f_z$ 定义方式相同，每个都保持另外两个变量固定。对于 $w = xy^2z^3$：$w_x = y^2z^3$、$w_y = 2xyz^3$ 和 $w_z = 3xy^2z^2$。

```check
w3 = x*y**2*z**3
same(diff(w3, x), y**2*z**3); same(diff(w3, y), 2*x*y*z**3); same(diff(w3, z), 3*x*y**2*z**2)
```

### 高阶偏导数 {#higher}

偏导数 $f_x$ 和 $f_y$ 仍然是 $x$ 和 $y$ 的函数。在这些偏导数存在的情况下，它们是 $f$ 的四个 **二阶偏导数**。

$$\begin{aligned} f_{xx} &= (f_x)_x = \frac{\partial^2 f}{\partial x^2}, & f_{xy} &= (f_x)_y = \frac{\partial^2 f}{\partial y\,\partial x}, \\ f_{yx} &= (f_y)_x = \frac{\partial^2 f}{\partial x\,\partial y}, & f_{yy} &= (f_y)_y = \frac{\partial^2 f}{\partial y^2}. \end{aligned}$$

$f_{xy}$ 读作「f 下标 x y」。注意求导顺序。$f_{xy}$ 的下标从左向右读，先对 $x$ 求导，再对 $y$ 求导。表示同一导数的 $\dfrac{\partial^2 f}{\partial y\,\partial x}$ 按从右向左的顺序读。$f_{xy}$ 和 $f_{yx}$ 称为**混合偏导数**。

::: example 第二偏导数
求$f(x, y) = x^3y^2 - 5xy + 2y^3$（例17.5）的四个二阶偏导数，以及$g(x, y) = \sin(xy^2)$的混合偏导数。

由$f_x = 3x^2y^2 - 5y$和$f_y = 2x^3y - 5x + 6y^2$可得：

$$\begin{aligned} f_{xx} &= 6xy^2, & f_{xy} &= 6x^2y - 5, \\ f_{yx} &= 6x^2y - 5, & f_{yy} &= 2x^3 + 12y. \end{aligned}$$

对于 $g$，对 $g_x = y^2\cos(xy^2)$ 关于 $y$ 求导，对 $g_y = 2xy\cos(xy^2)$ 关于 $x$ 求导，每次均使用乘积法则和链式法则：

$$\begin{aligned} g_{xy} &= 2y\cos(xy^2) - y^2\sin(xy^2)\cdot 2xy \\ &= 2y\cos(xy^2) - 2xy^3\sin(xy^2), \\ g_{yx} &= 2y\cos(xy^2) - 2xy\sin(xy^2)\cdot y^2 \\ &= 2y\cos(xy^2) - 2xy^3\sin(xy^2). \end{aligned}$$

两次混合偏导数一致，尽管它们是通过不同的方法计算得到的。

```check
same(diff(f175, x, x), 6*x*y**2); same(diff(f175, x, y), 6*x**2*y - 5); same(diff(f175, y, x), 6*x**2*y - 5); same(diff(f175, y, y), 2*x**3 + 12*y)
steps(diff(y**2*cos(x*y**2), y), 2*y*cos(x*y**2) - y**2*sin(x*y**2)*2*x*y, 2*y*cos(x*y**2) - 2*x*y**3*sin(x*y**2))
steps(diff(2*x*y*cos(x*y**2), x), 2*y*cos(x*y**2) - 2*x*y*sin(x*y**2)*y**2, 2*y*cos(x*y**2) - 2*x*y**3*sin(x*y**2))
same(diff(g175, x, y), diff(g175, y, x))
```
:::

这种一致并非偶然。

::: theorem 克莱罗定理
设 $f$ 定义在包含点 $(a, b)$ 的圆盘 $D$ 上。若函数 $f_{xy}$ 和 $f_{yx}$ 在 $D$ 上都连续，则 $f_{xy}(a, b) = f_{yx}(a, b)$。
:::

混合偏导数在例题 17.5 和 17.6 中，只要函数有定义，它们在定义域内是连续的，因此在这些地方求导的顺序无关紧要。这个条件不能省略：练习 17.10 给出一个函数，它具有 $f_{xy}(0, 0) = -1$ 但不具有 $f_{yx}(0, 0) = 1$。这个定理可以推广到更高阶导数：例如，对于一个圆盘上的点，只要所有三阶偏导数存在且连续，则 $f_{xyy} = f_{yxy} = f_{yyx}$ 成立。

::: deeper 拉格朗日定理的证明
第一次阅读可以跳过这个证明。它使用了中值定理（[定理 8.4](module_08_ZH.html#mvt)）四次。对于一个非常小的 $h \ne 0$，小到以 $(a, b)$ 和 $(a + h, b + h)$ 为顶点的正方形位于 $D$ 内，考虑四个值的组合

$$\begin{aligned} \Delta(h) &= f(a + h, b + h) - f(a + h, b) \\ &\quad - f(a, b + h) + f(a, b). \end{aligned}$$

**第一组。** 设 $G(x) = f(x, b + h) - f(x, b)$，使得 $\Delta(h) = G(a + h) - G(a)$。偏导数 $f_x$ 在 $D$ 上存在（否则 $f_{xy}$ 在那里不存在），因此 $G$ 是可微的，且 $G'(x) = f_x(x, b + h) - f_x(x, b)$。根据中值定理，存在一个数 $c$ 在 $a$ 和 $a + h$ 之间，使得

$$\begin{aligned} \Delta(h) &= h\,G'(c) \\ &= h\big(f_x(c, b + h) - f_x(c, b)\big). \end{aligned}$$

函数 $y \mapsto f_x(c, y)$ 的导数是 $f_{xy}(c, y)$，因此根据中值定理，存在一个数 $d$ 在 $b$ 与 $b + h$ 之间，使得 $f_x(c, b + h) - f_x(c, b) = h\,f_{xy}(c, d)$。所以 $\Delta(h) = h^2 f_{xy}(c, d)$。

**第二组。** 设 $H(y) = f(a + h, y) - f(a, y)$，使得 $\Delta(h) = H(b + h) - H(b)$。同样的两步，首先在 $y$，然后在 $x$，得到数 $c'$ 和 $d'$，分别在 $\abs{h}$ 附近 $a$ 和 $b$，使得 $\Delta(h) = h^2 f_{yx}(c', d')$。

因此$f_{xy}(c, d) = f_{yx}(c', d')$对于每个小$h \ne 0$。如$h \to 0$所示，当点$(c, d)$和$(c', d')$都趋近于$(a, b)$时，由于$f_{xy}$和$f_{yx}$在该处连续，两侧分别趋近于$f_{xy}(a, b)$和$f_{yx}(a, b)$。等量有相等的极限。

```check
Fq = Function('F')
D_ = Fq(a + h, b + h) - Fq(a + h, b) - Fq(a, b + h) + Fq(a, b)
G_ = lambda X: Fq(X, b + h) - Fq(X, b); H_ = lambda Y: Fq(a + h, Y) - Fq(a, Y)
same(G_(a + h) - G_(a), D_); same(H_(b + h) - H_(b), D_)
```
:::

许多物理定律是偏导数之间的方程，称为 **偏微分方程**。对于一根细长、均匀且侧面绝缘、无内部热源的杆，温度 $u(x, t)$ 由 **热方程**$u_t = k\,u_{xx}$ 描述，其中常数 $k > 0$ 由材料决定。对于一个细长、均匀且两面绝缘、无内部热源的薄板，稳定温度满足**拉普拉斯方程** $u_{xx} + u_{yy} = 0$（练习 17.9）。求解此类方程超出了本课程范围，但验证一个解只需使用偏导数： $u = e^{-t}\sin x$ 满足热方程，因为 $k = 1$，由于 $u_t = -e^{-t}\sin x$ 和 $u_{xx} = -e^{-t}\sin x$。

```check
uh = exp(-t)*sin(x)
same(diff(uh, t), -exp(-t)*sin(x)); same(diff(uh, x, 2), -exp(-t)*sin(x))
```

::: compute 偏导数与 SymPy
`sp.diff` 计算偏导数：指定变量名称，SymPy 保持其他变量固定。连续多个变量表示高阶导数，按书写顺序依次计算：

```python
import sympy as sp
x, y = sp.symbols('x y')
f = x**3*y**2 - 5*x*y + 2*y**3                  # Example 17.5
print(sp.diff(f, x), '|', sp.diff(f, y))
print(sp.diff(f, x, y), '|', sp.diff(f, y, x))  # f_xy and f_yx
print(sp.diff(f, x).subs({x: 1, y: 2}))         # f_x(1, 2)
```

```output
3*x**2*y**2 - 5*y | 2*x**3*y - 5*x + 6*y**2
6*x**2*y - 5 | 6*x**2*y - 5
2
```

`sp.diff(f, x, y)` 首先对 $x$ 求导，然后对 $y$ 求导：结果为 $f_{xy}$。重复的变量可以用次数表示： `sp.diff(f, x, 2)` 是 $f_{xx}$。本节开头的示例：

```python
r, h = sp.symbols('r h', positive=True)
V = sp.pi*r**2*h
print(sp.diff(V, r), '|', sp.diff(V, h))
Vr = sp.diff(V, r).subs({r: 3, h: 10})     # V_r(3, 10)
print(Vr, '=', sp.N(Vr))
```

```output
2*pi*h*r | pi*r**2
60*pi = 188.495559215388
```

SymPy 将 $2\pi rh$ 写作 `2*pi*h*r`，其中因子的顺序是它自己的顺序。在 $(3, 10)$ 处，它为 $60\pi \approx 188.5$，即本节开头表格中第一列所趋近的数。
:::

```check
same(2*pi*h*r, 2*pi*r*h); rounds(60*pi, '188.495559215388')
```

## 切平面与线性近似 {#tangent-planes}

放大一个一元可导函数的图像，它会越来越像一条直线，即它的切线；[第7.2节](module_07_ZH.html#linear-approximation)将其转化为线性近似。放大一个光滑曲面，它会越来越像一个平面，即它的 **切平面**。

哪个平面？通过点 $P(a, b, c)$ 且不垂直的平面，其方程为 $z - c = A(x - a) + B(y - b)$（模块16）。垂直平面 $y = b$ 将它沿着直线 $z - c = A(x - a)$ 剖开，该直线的斜率为 $A$。如果平面要与曲面在 $P$ 处相切，这条直线应为同一垂直平面从曲面中截出的曲线的切线，其斜率为 $f_x(a, b)$。因此 $A = f_x(a, b)$，同理 $B = f_y(a, b)$：切平面是图17.2中两条切线所确定的平面。

::: definition 切平面
假设 $f$ 在以 $(a, b)$ 为中心的圆盘上存在偏导数，并且在 $(a, b)$ 处连续。曲面 $z = f(x, y)$ 在点 $P(a, b, f(a, b))$ 处的 **切平面** 是以下平面

$$\begin{aligned} z = f(a, b) &+ f_x(a, b)(x - a) \\ &+ f_y(a, b)(y - b). \end{aligned}$$
:::

这个连续性条件保证了该平面在每一个方向上都贴合曲面，而不仅仅是在两个切片方向上。下面关于可微性的子节解释了为什么仅有偏导数是不够的。

::: example 切平面
求曲面 $z = 6 - x^2 - 2y^2$ 在 $P(1, 1, 3)$ 处的切平面。

偏导数 $f_x = -2x$ 和 $f_y = -4y$ 是多项式，处处连续，并且在 $(1, 1)$ 处分别为 $-2$ 和 $-4$（第 17.3 节）。切平面为

$$\begin{aligned} z &= 3 - 2(x - 1) - 4(y - 1), \\ \text{that is,}\quad z &= 9 - 2x - 4y. \end{aligned}$$

它经过 $P$: $9 - 2 - 4 = 3$。曲面位于其下方，因为差值为

$$\begin{aligned} &(6 - x^2 - 2y^2) - (9 - 2x - 4y) \\ &\quad= -(x - 1)^2 - 2(y - 1)^2, \end{aligned}$$

该差值在 $(1, 1)$ 以外的点都是负数。就像凹函数及其切线的图像（模块 8）一样，曲面在它的切平面下方弯曲（图 17.2，右图）。

```check
plane177 = 3 - 2*(x - 1) - 4*(y - 1)
same(expand(plane177), 9 - 2*x - 4*y); same((9 - 2*x - 4*y).subs({x: 1, y: 1}), 3)
same(expand(fd - (9 - 2*x - 4*y)), expand(-(x - 1)**2 - 2*(y - 1)**2))
```
:::

其图像为切平面的函数，

$$\begin{aligned} L(x, y) = f(a, b) &+ f_x(a, b)(x - a) \\ &+ f_y(a, b)(y - b), \end{aligned}$$

是 $f$ 在 $(a, b)$ 处的**线性化**。当 $(x, y)$ 接近 $(a, b)$ 时，$f(x, y) \approx L(x, y)$ 是 $f$ 在 $(a, b)$ 处的**线性近似**。用 $\Delta x = x - a$ 和 $\Delta y = y - b$，可写成

$$\begin{aligned} f(a + \Delta x, b + \Delta y) &\approx f(a, b) \\ &\quad + f_x(a, b)\,\Delta x \\ &\quad + f_y(a, b)\,\Delta y: \end{aligned}$$

每个变量贡献其自身的速率乘以其自身的改变量。

::: example 斜边长度的线性近似
一个直角三角形，其直角边分别为 3 和 4，斜边为 5。使用 $f(x, y) = \sqrt{x^2 + y^2}$ 在 $(3, 4)$ 处的线性近似（linearisation）来估计当直角边分别为 3.02 和 3.97 时的斜边长度。

根据链式法则（chain rule），$f_x = \dfrac{x}{\sqrt{x^2 + y^2}}$ 和 $f_y = \dfrac{y}{\sqrt{x^2 + y^2}}$ 在 $(x, y) \ne (0, 0)$ 连续的区域中是连续的。在 $(3, 4)$ 处，它们分别为 $\tfrac35$ 和 $\tfrac45$，因此

$$L(x, y) = 5 + \tfrac35(x - 3) + \tfrac45(y - 4).$$

用 $\Delta x = 0.02$ 和 $\Delta y = -0.03$，

$$\begin{aligned} L(3.02, 3.97) &= 5 + 0.6(0.02) + 0.8(-0.03) \\ &= 5 + 0.012 - 0.024 = 4.988. \end{aligned}$$

计算器给出 $\sqrt{3.02^2 + 3.97^2} = \sqrt{24.8813} \approx 4.98812$：估计值的误差约为 0.00012。

```check
fh = sqrt(x**2 + y**2)
same(diff(fh, x), x/sqrt(x**2 + y**2)); same(diff(fh, y), y/sqrt(x**2 + y**2))
same(diff(fh, x).subs({x: 3, y: 4}), Rational(3, 5)); same(diff(fh, y).subs({x: 3, y: 4}), Rational(4, 5)); same(fh.subs({x: 3, y: 4}), 5)
Lh = 5 + Rational(3, 5)*(x - 3) + Rational(4, 5)*(y - 4)
X1, Y1 = Rational(302, 100), Rational(397, 100)
steps(Lh.subs({x: X1, y: Y1}), 5 + Rational(6, 10)*Rational(2, 100) + Rational(8, 10)*(-Rational(3, 100)), 5 + Rational(12, 1000) - Rational(24, 1000), Rational(4988, 1000))
same(X1**2 + Y1**2, Rational(248813, 10000)); rounds(fh.subs({x: X1, y: Y1}), '4.98812'); rounds(fh.subs({x: X1, y: Y1}) - Rational(4988, 1000), '0.00012')
```
:::

一般情况下，这种近似有多好？从 $(3, 4)$ 移动到 $(3 + t, 4 - t)$，距离为 $\sqrt2\,\abs{t}$，并比较 $f$ 与 $L$：

```valuetable
t = 0.1, 0.01, 0.001
$f$ = sqrt((3 + t)**2 + (4 - t)**2)
$L$ = 5 + 3*t/5 - 4*t/5
$f - L$ = sqrt((3 + t)**2 + (4 - t)**2) - 5 + t/5
$\dfrac{f - L}{\sqrt2\,t}$ = (sqrt((3 + t)**2 + (4 - t)**2) - 5 + t/5)/(sqrt(2)*t)
---
t | f | L | f - L | \dfrac{f - L}{\sqrt2\,t}
0.1 | 4.98197 | 4.98 | 0.00196748 | 0.0139122
0.01 | 4.99802 | 4.998 | 1.96078\times10^{-5} | 0.00138648
0.001 | 4.99980 | 4.9998 | 1.96008\times10^{-7} | 0.000138598
```

如在模块 7 所述，误差 $f - L$ 每次距离缩小十倍时，误差就会缩小约一百倍，因此误差除以距离，在最后一列趋于 0：在 $(3, 4)$ 附近，误差即使与到 $(3, 4)$ 的距离相比也很小。这种性质使得平面具有切平面的性质。

```check
E_ = lambda T: fh.subs({x: 3 + T, y: 4 - T}) - Lh.subs({x: 3 + T, y: 4 - T})
same(Lh.subs({x: 3 + t, y: 4 - t}), 5 + 3*t/5 - 4*t/5); same(Lh.subs({x: 3 + t, y: 4 - t}), 5 - t/5)
rounds(E_(Rational(1, 10))/E_(Rational(1, 100)), '100'); rounds(E_(Rational(1, 100))/E_(Rational(1, 1000)), '100')
limit_is(E_(t)/(sqrt(2)*Abs(t)), t, 0, 0)   # error divided by distance, from either side
```

### 可导性 {#differentiability}

::: definition 可导性
设函数 $f$ 在以 $(a, b)$ 为中心的圆盘上有定义。若 $f_x(a, b)$、$f_y(a, b)$ 存在，且其线性化误差 $E(x, y) = f(x, y) - L(x, y)$ 满足下式，则称它**在 $(a, b)$ 处可微**：

$$\lim_{(x, y)\to(a, b)}\frac{E(x, y)}{\sqrt{(x - a)^2 + (y - b)^2}} = 0.$$

如果它在一个集合的每一点都可微，就称它**在该集合上可微**。
:::

对于一元函数，[定理 7.1](module_07_ZH.html#how-good) 已证明，$f'(a)$ 存在时就有 $E(x)/(x - a) \to 0$。对二元函数，仅有两个偏导数还不够，下文的「深入一步」栏目给出例子。可微要求同一个平面能同时沿所有方向逼近。下面两个定理使定义便于应用，第一个与[定理 4.1](module_04_ZH.html#continuity)类似。

::: theorem 可微函数连续
若 $f$ 在 $(a, b)$ 可微，则 $f$ 在 $(a, b)$ 连续。
:::

::: proof
写 $\rho = \sqrt{(x - a)^2 + (y - b)^2}$。对于 $(x, y) \ne (a, b)$，

$$f(x, y) = L(x, y) + \frac{E(x, y)}{\rho}\,\rho.$$

当 $(x, y) \to (a, b)$：$L(x, y) \to L(a, b) = f(a, b)$，因为 $L$ 是多项式；$E/\rho \to 0$，由可导性；且 $\rho \to 0$。因此 $f(x, y) \to f(a, b) + 0 \cdot 0 = f(a, b)$。
:::

::: theorem 偏导数连续推出可微
若 $f_x$、$f_y$ 在以 $(a, b)$ 为中心的圆盘上存在，并且在 $(a, b)$ 处连续，则 $f$ 在 $(a, b)$ 处可微。
:::

证明见下方“深入理解”框中。定理 17.5 是在实践中如何检验可微性的方法。多项式在所有点都可微，且如 $e^{xy}\sin y$ 或 $\ln(x^2 + y^2)$ 这样的函数在其定义域内也均可微：规则给出的偏导数仍是相同类型的公式，并且在该域内连续。切平面的定义（定义 17.6）使用了这个充分条件。更一般地，即使偏导数不连续，可微性本身也能通过相同公式给出切平面。

::: deeper 偏导数本身是不够的
第一次阅读可以跳过这个框。令 $f(x, y) = \dfrac{xy}{x^2 + y^2}$ 为 $(x, y) \ne (0, 0)$ 和 $f(0, 0) = 0$，即例 17.3 中的函数。在两个坐标轴上 $f$ 都为 0，因此

$$\begin{aligned} f_x(0, 0) &= \lim_{h\to0}\frac{f(h, 0) - f(0, 0)}{h} \\ &= \lim_{h\to0}\frac{0 - 0}{h} = 0, \end{aligned}$$

以及 $f_y(0, 0) = 0$ 同理。两个偏导数均存在，且原点的线性化是 $L(x, y) = 0$。但 $f$ 在原点不连续（第17.2节），因此由定理17.4可知其在该点不可微，且平面 $z = 0$ 不是切平面：沿直线 $y = x$，曲面保持在高度 $\tfrac12$，无论多么接近原点。偏导数仅观察沿两个坐标轴的切片，在此处曲面高度为0；而沿其他过原点的直线，其高度则不同。

**定理17.5的证明.** 设 $(x, y) \ne (a, b)$ 在圆盘内，并写成 $\Delta x = x - a$, $\Delta y = y - b$ 和 $\rho = \sqrt{\Delta x^2 + \Delta y^2} > 0$. 从 $(a, b)$ 到 $(x, y)$ 分两步进行，首先改变 $y$，然后 $x$:

$$\begin{aligned} f(x, y) - f(a, b) &= \big[f(x, y) - f(a, y)\big] \\ &\quad + \big[f(a, y) - f(a, b)\big]. \end{aligned}$$

对每一段非零位移，可将 $f$ 看作只依赖该变量的函数，应用微分中值定理。两个方括号内的量分别是 $f_x(c, y)\,\Delta x$ 和 $f_y(a, d)\,\Delta y$，其中 $c$ 介于 $a$ 和 $x$ 之间，$d$ 介于 $b$ 和 $y$ 之间。若 $\Delta x = 0$，第一个方括号内的量为 0，取 $c = a$；若 $\Delta y = 0$，同理取 $d = b$。两边同减 $f_x(a, b)\,\Delta x + f_y(a, b)\,\Delta y$：

$$\begin{aligned} E(x, y) &= \big[f_x(c, y) - f_x(a, b)\big]\Delta x \\ &\quad + \big[f_y(a, d) - f_y(a, b)\big]\Delta y. \end{aligned}$$

由于 $\abs{\Delta x} \le \rho$ 和 $\abs{\Delta y} \le \rho$，

$$\begin{aligned} \frac{\abs{E(x, y)}}{\rho} &\le \abs{f_x(c, y) - f_x(a, b)} \\ &\quad + \abs{f_y(a, d) - f_y(a, b)}. \end{aligned}$$

当 $(x, y) \to (a, b)$ 时，点 $(c, y)$ 和 $(a, d)$ 也趋近于 $(a, b)$，因此由 $f_x$ 和 $f_y$ 在 $(a, b)$ 处的连续性可知右边趋于 0。同样， $\abs{E}/\rho$ 也趋于 0： $f$ 在 $(a, b)$ 处可导。

```check
same((x*y/(x**2 + y**2)).subs({x: h, y: 0}), 0); same((x*y/(x**2 + y**2)).subs({x: 0, y: h}), 0)
limit_is((0 - 0)/h, h, 0, 0); same(fp172.subs(y, x), Rational(1, 2))
Fxc, Fyd, fx0, fy0, dX, dY = symbols('F_xc F_yd f_x0 f_y0 dX dY')
same((Fxc*dX + Fyd*dY) - (fx0*dX + fy0*dY), (Fxc - fx0)*dX + (Fyd - fy0)*dY)   # the error E after the two legs
```
:::

### 总微分 {#differential}

[第7.2节 ](module_07_ZH.html#differentials) 有一个适用于多个变量的版本。

::: definition 总微分
设 $z = f(x, y)$ 可微，并取**微分**$dx$ 和 $dy$ 为独立变量。$z$ 的**全微分**为

$$dz = f_x(x, y)\,dx + f_y(x, y)\,dy = \frac{\partial z}{\partial x}\,dx + \frac{\partial z}{\partial y}\,dy.$$
:::

当$x$和$y$分别变化$dx$和$dy$时，$z$的实际变化为$\Delta z = f(x + dx, y + dy) - f(x, y)$，而$dz$是线性化的变化；当$dx$和$dy$较小时，$\Delta z \approx dz$成立。如[[小节 7.3](module_07_ZH.html#errors)所述，这会传播测量误差，且现在来自多个测量值。

::: example 一个圆柱体的测量误差
一个圆柱体的半径和高度分别测量为 $r = 3$ 厘米和 $h = 10$ 厘米，其中半径 $r$ 的绝对误差不超过 0.02 厘米，高度 $h$ 的绝对误差不超过 0.05 厘米。估计计算出的体积 $V = \pi r^2 h$ 的最大可能绝对误差和相对误差。

在 $dV = V_r\,dr + V_h\,dh = 2\pi rh\,dr + \pi r^2\,dh$ 处，以及在 $(3, 10)$ 处， $V_r = 60\pi$ 和 $V_h = 9\pi$。设 $dr$ 和 $dh$ 为真实值减去测量值，因此 $dV$ 估计误差，并遵循模块 7 中的符号约定。当两个项符号相同时，误差的绝对值 $\abs{dV}$ 最大，且每个测量误差都达到允许的最大值：

$$\begin{aligned} \abs{dV} &\le 60\pi(0.02) + 9\pi(0.05) \\ &= 1.2\pi + 0.45\pi = 1.65\pi \approx 5.18 \text{ cm}^3. \end{aligned}$$

所以计算出的体积，$90\pi \approx 282.7$ cm³，可能误差约为 5.2 cm³。这是从切平面得到的估计，不是对精确体积误差的界限。将 $dV$ 除以测得的体积 $V = \pi r^2 h$ 得到

$$\begin{aligned} \frac{dV}{V} &= \frac{2\pi rh\,dr + \pi r^2\,dh}{\pi r^2 h} \\ &= 2\,\frac{dr}{r} + \frac{dh}{h}, \end{aligned}$$

相对误差估计为 $\abs{dV}/V$。这里这个估计最多为 $2 \cdot \tfrac{0.02}{3} + \tfrac{0.05}{10} \approx 0.0133 + 0.005 = 0.0183$，约为 1.8%。在这个估计中，半径的相对误差计算了两次，因为半径是平方出现的。

```check
same(diff(Vc, r), 2*pi*r*h); same(diff(Vc, h), pi*r**2)
same(diff(Vc, r).subs({r: 3, h: 10}), 60*pi); same(diff(Vc, h).subs({r: 3, h: 10}), 9*pi)
steps(60*pi*Rational(2, 100) + 9*pi*Rational(5, 100), Rational(12, 10)*pi + Rational(45, 100)*pi, Rational(165, 100)*pi)
rounds(Rational(165, 100)*pi, '5.18'); rounds(Rational(165, 100)*pi, '5.2')
dr_, dh_ = symbols('dr dh')
same(60*pi*dr_ + 9*pi*dh_, diff(Vc, r).subs({r: 3, h: 10})*dr_ + diff(Vc, h).subs({r: 3, h: 10})*dh_)
same(max(Abs(60*pi*er + 9*pi*eh) for er in (-Rational(2, 100), Rational(2, 100)) for eh in (-Rational(5, 100), Rational(5, 100))), Rational(165, 100)*pi)
holds(Vc.subs({r: Rational(302, 100), h: Rational(1005, 100)}) - 90*pi > Rational(165, 100)*pi)  # the differential bound is not an exact-error bound
same((2*pi*r*h*dr_ + pi*r**2*dh_)/(pi*r**2*h), 2*dr_/r + dh_/h)
rounds(2*Rational(2, 100)/3, '0.0133'); same(Rational(5, 100)/10, Rational(5, 1000)); rounds(2*Rational(2, 100)/3 + Rational(5, 1000), '0.0183')
rounds(100*(2*Rational(2, 100)/3 + Rational(5, 1000)), '1.8'); same(Rational(165, 100)*pi/(90*pi), 2*Rational(2, 100)/3 + Rational(5, 1000))
```
:::

::: pitfall
$dz$ 不等于 $\Delta z$：$dz$ 是切平面方向的变化，$\Delta z$ 是曲面上方向的变化。可微性使得对于足够小的变化，近似是准确的。为了估计最大的绝对误差，将各项的大小相加，$\abs{f_x}\abs{dx} + \abs{f_y}\abs{dy}$：两个测量中的误差可能以相同方向影响结果。这限制了微分；一个精确的误差界限需要对剩余项进行控制。
:::

## 链式法则 {#chain-rule}

在单变量情形下，速率相乘（[小节 5.5](module_05_ZH.html#chain))。当$z$依赖于$x$和$y$，且两者均依赖于时间$t$时，$t$的变化通过两条路径影响$z$，即经由$x$和经由$y$，且这两部分贡献相加。

::: theorem 链式法则
假设 $x = x(t)$ 和 $y = y(t)$ 在 $t_0$ 处可导，且 $z = f(x, y)$ 在 $\big(x(t_0), y(t_0)\big)$ 处可导。那么 $z = f\big(x(t), y(t)\big)$ 在 $t_0$ 处可导，并

$$\frac{dz}{dt} = \frac{\partial z}{\partial x}\,\frac{dx}{dt} + \frac{\partial z}{\partial y}\,\frac{dy}{dt},$$

且偏导数在 $\big(x(t_0), y(t_0)\big)$ 处取，其余导数在 $t_0$ 处取。
:::

::: proof
设 $\Delta t \ne 0$，并设 $\Delta x$、$\Delta y$ 和 $\Delta z$ 分别为 $x$、$y$ 和 $z$ 在 $t$ 从 $t_0$ 变化到 $t_0 + \Delta t$ 时的改变量。写出 $\rho = \sqrt{\Delta x^2 + \Delta y^2}$。根据可微性的定义，

$$\Delta z = f_x\,\Delta x + f_y\,\Delta y + E,$$

其中 $E/\rho \to 0$ 作为 $(\Delta x, \Delta y) \to (0, 0)$。令 $\varepsilon = E/\rho$ 当 $\rho \ne 0$ 且 $\varepsilon = 0$ 当 $\rho = 0$。那么 $E = \varepsilon\rho$ 在两种情况下：如果 $\rho = 0$，则 $x$ 和 $y$ 不变，因此 $z$ 也不变，且 $E = 0$。两边除以 $\Delta t$：

$$\frac{\Delta z}{\Delta t} = f_x\,\frac{\Delta x}{\Delta t} + f_y\,\frac{\Delta y}{\Delta t} + \varepsilon\,\frac{\rho}{\Delta t}.$$

设 $\Delta t \to 0$。商 $\Delta x/\Delta t$ 和 $\Delta y/\Delta t$ 趋于 $dx/dt$ 和 $dy/dt$。变化量 $\Delta x$ 和 $\Delta y$ 趋于 0，因为可导函数是连续的，所以 $\varepsilon \to 0$；且 $\abs{\rho/\Delta t} = \sqrt{(\Delta x/\Delta t)^2 + (\Delta y/\Delta t)^2}$ 有界，因为它趋于 $\sqrt{(dx/dt)^2 + (dy/dt)^2}$。因此最后一项趋于 0，且 $\Delta z/\Delta t$ 趋于 $f_x\,\dfrac{dx}{dt} + f_y\,\dfrac{dy}{dt}$。
:::

::: example 变化的圆柱体
圆柱体的半径以 0.1 cm/s 的速度增长，而高度以 0.3 cm/s 的速度减少。当半径为 $r = 3$ cm，高度为 $h = 10$ cm 时，体积是增大还是减小？变化率是多少？

根据定理 17.6，

$$\begin{aligned} \frac{dV}{dt} &= \frac{\partial V}{\partial r}\,\frac{dr}{dt} + \frac{\partial V}{\partial h}\,\frac{dh}{dt} \\ &= 2\pi rh\,\frac{dr}{dt} + \pi r^2\,\frac{dh}{dt}. \end{aligned}$$

在这个时刻 $\partial V/\partial r = 60\pi$， $\partial V/\partial h = 9\pi$， $dr/dt = 0.1$ 和 $dh/dt = -0.3$，因此

$$\begin{aligned} \frac{dV}{dt} &= 60\pi(0.1) + 9\pi(-0.3) = 6\pi - 2.7\pi \\ &= 3.3\pi \approx 10.37 \text{ cm}^3/\text{s}. \end{aligned}$$

体积在增大。高度减少的速度是半径增长速度的三倍，但体积对半径的变化更为敏感，超过六倍。

```check
Rt, Ht = Function('R')(t), Function('H')(t)
same(diff(pi*Rt**2*Ht, t), 2*pi*Rt*Ht*diff(Rt, t) + pi*Rt**2*diff(Ht, t))
same(diff(pi*r**2*h, r).subs({r: 3, h: 10}), 60*pi); same(diff(pi*r**2*h, h).subs(r, 3), 9*pi)
holds(60*pi/(9*pi) > 6)
steps(60*pi*Rational(1, 10) + 9*pi*(-Rational(3, 10)), 6*pi - Rational(27, 10)*pi, Rational(33, 10)*pi)
rounds(Rational(33, 10)*pi, '10.37'); holds(Rational(33, 10)*pi > 0); same(Rational(3, 10)/Rational(1, 10), 3)
```
:::

### 树状图 {#tree-diagrams}

用更多变量时，一个 **树图** 可以追踪路线（图 17.3）。将依赖变量放在顶部，中间变量放在其下方，独立变量放在底部，并将每个变量连接到它直接依赖的变量上。用上层变量对下层变量的导数标记每条分支。

::: keyidea
顶部变量对底部变量的导数等于从顶部到该变量的所有路径上的标签乘积之和。
:::

::: figure id=fig-17-3
链式法则的树状图。左图：$z = f(x, y)$，其中$x$和$y$是$t$的函数；从$z$到$t$的两条路径对应定理17.6中的两项。右图：$x$和$y$是$s$和$t$的函数；从$z$到$s$的两条彩色路径给出$\partial z/\partial s$，而到$t$的两条路径以相同方式给出$\partial z/\partial t$。
:::

当 $x$ 和 $y$ 依赖于两个变量 $s$ 和 $t$，保持 $t$ 固定：那么 $x$ 和 $y$ 是 $s$ 的函数，且定理 17.6 适用，其中 $s$ 代替 $t$。对 $s$ 的导数，当 $t$ 固定时为偏导数，因此：

::: theorem 两个参数的链式法则
假设 $x = x(s, t)$ 和 $y = y(s, t)$ 在 $(s, t)$ 处有偏导数，且 $z = f(x, y)$ 在 $\big(x(s, t), y(s, t)\big)$ 处可导。那么

$$\begin{aligned} \frac{\partial z}{\partial s} &= \frac{\partial z}{\partial x}\,\frac{\partial x}{\partial s} + \frac{\partial z}{\partial y}\,\frac{\partial y}{\partial s}, \\ \frac{\partial z}{\partial t} &= \frac{\partial z}{\partial x}\,\frac{\partial x}{\partial t} + \frac{\partial z}{\partial y}\,\frac{\partial y}{\partial t}. \end{aligned}$$
:::

相同的证明，包含更多项，给出关键思想的一般规则。可导性对于 $n$ 变量的定义与两个变量的情形相同，只是距离在 $n$ 维度中；如果 $u$ 是 $x_1, \dots, x_n$ 的可导函数，而每个变量对 $t_1, \dots, t_m$ 都有偏导数，那么对于每个 $i$

$$\frac{\partial u}{\partial t_i} = \frac{\partial u}{\partial x_1}\frac{\partial x_1}{\partial t_i} + \frac{\partial u}{\partial x_2}\frac{\partial x_2}{\partial t_i} + \dots + \frac{\partial u}{\partial x_n}\frac{\partial x_n}{\partial t_i}.$$

::: example 极坐标
设 $z = x^2y$，其中 $x = r\cos\theta$ 和 $y = r\sin\theta$ 由极坐标给出（模块 16）。求 $\partial z/\partial r$ 和 $\partial z/\partial\theta$ 在 $r = 2$， $\theta = \pi/6$ 处的值，并通过代入进行验证。

树是图17.3中的右树，其中 $r$ 和 $\theta$ 代替 $s$ 和 $t$。标签为 $z_x = 2xy$, $z_y = x^2$, $x_r = \cos\theta$, $y_r = \sin\theta$, $x_\theta = -r\sin\theta$ 和 $y_\theta = r\cos\theta$，因此

$$\begin{aligned} \frac{\partial z}{\partial r} &= 2xy\cos\theta + x^2\sin\theta, \\ \frac{\partial z}{\partial \theta} &= -2xy\,r\sin\theta + x^2\,r\cos\theta. \end{aligned}$$

在 $r = 2$ 和 $\theta = \pi/6$ 处， $x = 2\cos\frac{\pi}{6} = \sqrt3$ 和 $y = 2\sin\frac{\pi}{6} = 1$，因此

$$\begin{aligned} \frac{\partial z}{\partial r} &= 2\sqrt3\cdot\frac{\sqrt3}{2} + 3\cdot\frac12 = 3 + \frac32 = \frac92, \\ \frac{\partial z}{\partial \theta} &= -2\sqrt3\cdot 2\cdot\frac12 + 3\cdot 2\cdot\frac{\sqrt3}{2} \\ &= -2\sqrt3 + 3\sqrt3 = \sqrt3. \end{aligned}$$

检查：先代入， $z = r^3\cos^2\theta\sin\theta$，因此 $\partial z/\partial r = 3r^2\cos^2\theta\sin\theta = 3 \cdot 4 \cdot \tfrac34 \cdot \tfrac12 = \tfrac92$。同时 $\partial z/\partial\theta = r^3\cos\theta(\cos^2\theta - 2\sin^2\theta)$，在该点为 $8\cdot\tfrac{\sqrt3}{2}(\tfrac34 - \tfrac12) = \sqrt3$。链式法则不需要这样的代入，对于复杂的 $f$ 可能不切实际。

```check
xp_, yp_ = r*cos(theta), r*sin(theta)
zp = x**2*y
same(diff(zp, x), 2*x*y); same(diff(zp, y), x**2)
same([diff(xp_, r), diff(yp_, r), diff(xp_, theta), diff(yp_, theta)], [cos(theta), sin(theta), -r*sin(theta), r*cos(theta)])
same(diff(zp.subs({x: xp_, y: yp_}), r), (2*x*y*cos(theta) + x**2*sin(theta)).subs({x: xp_, y: yp_}))
same(diff(zp.subs({x: xp_, y: yp_}), theta), (-2*x*y*r*sin(theta) + x**2*r*cos(theta)).subs({x: xp_, y: yp_}))
P_ = {r: 2, theta: pi/6}
same(xp_.subs(P_), sqrt(3)); same(yp_.subs(P_), 1)
steps(2*sqrt(3)*sqrt(3)/2 + 3*Rational(1, 2), 3 + Rational(3, 2), Rational(9, 2))
steps(-2*sqrt(3)*2*Rational(1, 2) + 3*2*sqrt(3)/2, -2*sqrt(3) + 3*sqrt(3), sqrt(3))
same(zp.subs({x: xp_, y: yp_}), r**3*cos(theta)**2*sin(theta))
same(diff(r**3*cos(theta)**2*sin(theta), r).subs(P_), Rational(9, 2)); same(3*4*Rational(3, 4)*Rational(1, 2), Rational(9, 2))
same(diff(r**3*cos(theta)**2*sin(theta), theta).subs(P_), sqrt(3))
same(diff(r**3*cos(theta)**2*sin(theta), theta), r**3*cos(theta)*(cos(theta)**2 - 2*sin(theta)**2))
steps(8*sqrt(3)/2*(Rational(3, 4) - Rational(1, 2)), sqrt(3))
```
:::

::: pitfall
每条路径都起作用。常见的错误是写出 $\dfrac{\partial z}{\partial s} = \dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s}$，仿佛 $\partial x$ 消去了，而忘记通过 $y$ 的路径。偏导数不是分数，当有两个中间变量时，链式法则有两个项。
:::

### 隐函数求导 {#implicit}

[小节 6.4](module_06_ZH.html#implicit)] 找到曲线如圆 $x^2 + y^2 = 25$ 的切线斜率，通过对其方程进行求导。链式法则解释了该方法并将其转化为公式。将曲线写成 $F(x, y) = 0$，其中 $F$ 在所讨论的点附近可导，且假设在该点附近曲线是某个可导函数 $y = y(x)$ 的图像。则 $F\big(x, y(x)\big) = 0$ 对所有 $x$ 附近的点成立。根据定理 17.6 对 $x$ 求导，其中 $x$ 本身作为第一个中间变量（$dx/dx = 1$）：

$$F_x + F_y\,\frac{dy}{dx} = 0, \quad\text{so}\quad \frac{dy}{dx} = -\frac{F_x}{F_y} \quad (F_y \ne 0).$$

```check
Yi = Function('Y')(x)
for Fi in (x**3*y**2 + sin(x*y), exp(x - y**2) + x/y):                     # instances of F(x, y(x)) = 0, differentiated
    same(diff(Fi.subs(y, Yi), x), (diff(Fi, x) + diff(Fi, y)*diff(Yi, x)).subs(y, Yi))
```

模块 6 承诺了一个定理，当 $dy/dx$ 的系数，此处为 $F_y$，不为 0 时，该定理保证函数 $y(x)$ 可导：

::: theorem 隐函数定理
设 $F$ 在以 $(a, b)$ 为中心的圆盘上有连续偏导数，且 $F(a, b) = 0$、$F_y(a, b) \ne 0$。则在 $(a, b)$ 附近，曲线 $F(x, y) = 0$ 上的点构成一个可微函数 $y = y(x)$ 的图像。该函数定义在含 $a$ 的开区间上，且 $y(a) = b$，并满足

$$\frac{dy}{dx} = -\frac{F_x(x, y)}{F_y(x, y)}.$$
:::

其证明属于分析课程的内容；本系列使用该定理而不予证明。

::: example 笛卡尔叶线再次出现
找出 $dy/dx$ 在叶线 $x^3 + y^3 = 6xy$ 上的 [例 6.5](module_06_ZH.html#implicit) 的公式]，并求出 $(3, 3)$ 处的斜率。

将曲线写成 $F(x, y) = x^3 + y^3 - 6xy = 0$。然后 $F_x = 3x^2 - 6y$ 和 $F_y = 3y^2 - 6x$，因此在 $y^2 \ne 2x$，

$$\frac{dy}{dx} = -\frac{3x^2 - 6y}{3y^2 - 6x} = \frac{2y - x^2}{y^2 - 2x},$$

例 6.5 的答案。在 $(3, 3)$， $F_y = 27 - 18 = 9 \ne 0$，斜率是 $\dfrac{6 - 9}{9 - 6} = -1$。在原点 $F_x = F_y = 0$：隐函数定理在那里无能为力，事实上曲线在此处交叉。

```check
Ff = x**3 + y**3 - 6*x*y
same(diff(Ff, x), 3*x**2 - 6*y); same(diff(Ff, y), 3*y**2 - 6*x)
same(-(3*x**2 - 6*y)/(3*y**2 - 6*x), (2*y - x**2)/(y**2 - 2*x)); same(idiff(Ff, y, x), (2*y - x**2)/(y**2 - 2*x))
same(Ff.subs({x: 3, y: 3}), 0); same((3*y**2 - 6*x).subs({x: 3, y: 3}), 9); same(((2*y - x**2)/(y**2 - 2*x)).subs({x: 3, y: 3}), -1)
same([diff(Ff, x).subs({x: 0, y: 0}), diff(Ff, y).subs({x: 0, y: 0})], [0, 0])
```
:::

同样地，如果 $F$ 在 $F(x, y, z) = 0$ 上某点附近具有连续偏导数，并且 $F_z \ne 0$ 在该点处存在，则方程定义 $z$ 为 $x$ 和 $y$ 在该点附近的可微函数（定理有一个三变量版本）。固定 $y$ 并对 $F\big(x, y, z(x, y)\big) = 0$ 关于 $x$ 求导得到 $F_x + F_z\,\dfrac{\partial z}{\partial x} = 0$，对 $y$ 同样如此：

$$\frac{\partial z}{\partial x} = -\frac{F_x}{F_z}, \qquad \frac{\partial z}{\partial y} = -\frac{F_y}{F_z}.$$

例 17.14 使用了这些公式。

## 方向导数与梯度 {#gradient}

站在山脊上。地面的陡峭程度取决于你面对的方向：直上山坡时最陡，沿山坡则平坦。偏导数 $f_x$ 和 $f_y$ 只能给出东、北两个方向上的坡度。本节将找出所有方向上的坡度，并确定最陡的方向。

::: definition 方向导数
设 $\vb{u} = \langle u_1, u_2\rangle$ 为一个单位向量。函数 $f$ 在点 $(a, b)$ 沿 $\vb{u}$ 方向的 **方向导数** 是

$$D_{\vb{u}} f(a, b) = \lim_{h\to0}\frac{f(a + hu_1, b + hu_2) - f(a, b)}{h},$$

当该极限存在时成立。
:::

$D_{\vb{u}} f$读作“f在u处的子D”。点$(a + hu_1, b + hu_2)$位于通过$(a, b)$且方向为$\vb{u}$的直线上，距离$(a, b)$为$\abs{h}$，因为$\norm{\vb{u}} = 1$；因此$D_{\vb{u}} f(a, b)$表示从$(a, b)$沿该方向移动时，$f$每单位距离的变化率。对于$\vb{u} = \vb{i} = \langle 1, 0\rangle$，其值为$f_x(a, b)$，对于$\vb{u} = \vb{j} = \langle 0, 1\rangle$，其值为$f_y(a, b)$。

::: definition 梯度
假设其偏导数存在，函数 $f$ 在点 $(a, b)$ 处的 **梯度** 是向量

$$\nabla f(a, b) = \big\langle f_x(a, b), f_y(a, b)\big\rangle.$$

对于一个三变量函数， $\nabla f = \langle f_x, f_y, f_z\rangle$。
:::

符号 $\nabla$ 称为“nabla”，而 $\nabla f$ 读作“del f”或“grad f”。一个二变量函数的梯度是一个在其定义域平面内的向量；当非零时，它在等值线图上给出一个方向。如果 $f$ 在 $(a, b)$ 处可微，则第17.4节中的线性近似为 $f(a + \Delta x, b + \Delta y) \approx f(a, b) + \nabla f(a, b)\cdot\langle\Delta x, \Delta y\rangle$，其中模块16中的点积适用。方向导数来源于梯度的相同方式。

::: theorem 用梯度计算方向导数
若 $f$ 在 $(a, b)$ 处可微，则 $f$ 在 $(a, b)$ 处沿任意单位向量 $\vb{u} = \langle u_1, u_2\rangle$ 的方向导数都存在，且

$$\begin{aligned} D_{\vb{u}} f(a, b) &= \nabla f(a, b)\cdot\vb{u} \\ &= f_x(a, b)\,u_1 + f_y(a, b)\,u_2. \end{aligned}$$
:::

::: proof
设 $g(h) = f(a + hu_1, b + hu_2)$。定义 $D_{\vb{u}} f(a, b)$ 的极限为 $\lim_{h\to0}\dfrac{g(h) - g(0)}{h} = g'(0)$。此处 $g$ 是 $f$ 与 $x(h) = a + hu_1$ 和 $y(h) = b + hu_2$ 的复合，其导数为 $u_1$ 和 $u_2$。根据链式法则（定理17.6）， $g'(0)$ 存在且

$$\begin{aligned} g'(0) &= f_x(a, b)\,u_1 + f_y(a, b)\,u_2 \\ &= \nabla f(a, b)\cdot\vb{u}. \end{aligned}$$
:::

::: example 一个方向导数
设 $f(x, y) = xe^y$。求 $f$ 在 $(2, 0)$ 处沿点 $(5, 4)$ 方向的变化率。

$f_x = e^y$ 和 $f_y = xe^y$ 是连续的，因此 $f$ 是可微的（定理 17.5），且 $\nabla f(2, 0) = \langle e^0, 2e^0\rangle = \langle 1, 2\rangle$。从 $(2, 0)$ 到 $(5, 4)$ 的方向为 $\vb{v} = \langle 3, 4\rangle$，长度为 5，因此该方向的单位向量为 $\vb{u} = \vb{v}/\norm{\vb{v}} = \big\langle \tfrac35, \tfrac45\big\rangle$。根据定理 17.9，

$$\begin{aligned} D_{\vb{u}} f(2, 0) &= \langle 1, 2\rangle\cdot\big\langle \tfrac35, \tfrac45\big\rangle \\ &= \frac35 + \frac85 = \frac{11}{5} = 2.2. \end{aligned}$$

从 $(2, 0)$ 向 $(5, 4)$ 移动时， $f$ 每单位距离增加 2.2 个单位，比沿任一坐标轴（$f_x = 1$， $f_y = 2$）更快。

```check
fe = x*exp(y)
gfe = Matrix([diff(fe, x), diff(fe, y)])
same(gfe, Matrix([exp(y), x*exp(y)])); same(gfe.subs({x: 2, y: 0}), Matrix([1, 2]))
vv = Matrix([3, 4]); same(vv.norm(), 5); uu = vv/vv.norm(); same(uu, Matrix([Rational(3, 5), Rational(4, 5)]))
steps(gfe.subs({x: 2, y: 0}).dot(uu), Rational(3, 5) + Rational(8, 5), Rational(11, 5)); same(Rational(11, 5), Rational(22, 10))
limit_is((fe.subs({x: 2 + h*uu[0], y: h*uu[1]}) - fe.subs({x: 2, y: 0}))/h, h, 0, Rational(11, 5))   # both sides, from the definition
```
:::

### 最陡上升方向 {#steepest-ascent}

::: theorem 最速上升方向
设 $f$ 在 $(a, b)$ 可微，且 $\nabla f(a, b) \ne \vb{0}$。在所有单位向量 $\vb{u}$ 给出的方向上，方向导数 $D_{\vb{u}} f(a, b)$

- 当 $\vb{u}$ 指向 $\nabla f(a, b)$ 时最大，等于 $\norm{\nabla f(a, b)}$；
- 当 $\vb{u}$ 指向相反方向时最小，等于 $-\norm{\nabla f(a, b)}$；
- 当 $\vb{u}$ 垂直于 $\nabla f(a, b)$ 时为零。
:::

::: proof
设 $\theta$ 为 $\nabla f(a, b)$ 与 $\vb{u}$ 之间的角。根据定理 17.9 以及点积的角形式（模块 16），

$$\begin{aligned} D_{\vb{u}} f(a, b) &= \nabla f(a, b)\cdot\vb{u} \\ &= \norm{\nabla f(a, b)}\,\norm{\vb{u}}\cos\theta \\ &= \norm{\nabla f(a, b)}\cos\theta, \end{aligned}$$

因为 $\norm{\vb{u}} = 1$。当 $\vb{u}$ 转动时，只有 $\cos\theta$ 发生变化。它最大为 1，恰好在 $\theta = 0$ 时；最小为 $-1$，恰好在 $\theta = \pi$ 时；并在 $\theta = \pi/2$ 时为 0。
:::

因此，非零梯度指向 uphill（上坡），即最陡的方向，其长度为该方向上的斜率。对于 $f(x, y) = xe^y$ 在 $(2, 0)$ 处（例 17.13），最陡的速率是 $\norm{\langle 1, 2\rangle} = \sqrt5 \approx 2.236$，方向为 $\langle 1, 2\rangle/\sqrt5$。向 $(5, 4)$ 方向的速率 2.2 接近这个值，因为 $\langle 3, 4\rangle$ 方向与 $\langle 1, 2\rangle$ 方向之间的夹角约为 $10.3^\circ$（$\cos\theta = 2.2/\sqrt5$）。最快下降的速率 $-\sqrt5$ 是在 $\langle -1, -2\rangle/\sqrt5$ 方向，而在 $\pm\langle 2, -1\rangle/\sqrt5$ 方向上的变化速率为 0。第 17.7 节使用沿 $-\nabla f$ 的步骤来寻找 $f$ 的更小值。如果梯度为 $\vb{0}$，则每个方向导数都为 0，此时没有唯一的最陡方向。

```check
gg = Matrix([1, 2])
same(gg.norm(), sqrt(5)); rounds(sqrt(5), '2.236'); same(gg.dot(gg/gg.norm()), sqrt(5)); same(gg.dot(-gg/gg.norm()), -sqrt(5))
rounds(acos(Rational(11, 5)/sqrt(5))*180/pi, '10.3'); same(gg.dot(Matrix([2, -1])), 0)
ph_ = symbols('phi', real=True); ue_ = Matrix([cos(ph_), sin(ph_)])
same(gg.dot(gg) - gg.dot(ue_)**2, (gg[0]*sin(ph_) - gg[1]*cos(ph_))**2)      # no unit vector beats |grad f|
```

### 梯度与等值线 {#perpendicular}

沿着通过 $(a, b)$ 的等值线，$f$ 没有发生变化，因此其沿该曲线的变化率应为 0。根据定理 17.10，这种情况发生在梯度垂直的方向上。

::: theorem 梯度垂直于等值线
设 $f$ 在 $(a, b)$ 处可微，且设 $\vb{r}(t) = \langle x(t), y(t)\rangle$ 是通过 $(a, b)$ 的等值线 $f(x, y) = k$ 上的一条曲线，且 $\vb{r}(t_0) = \langle a, b\rangle$ 在 $t_0$ 处可微，且 $\vb{r}'(t_0) \ne \vb{0}$。则

$$\nabla f(a, b)\cdot\vb{r}'(t_0) = 0:$$

当梯度非零时，它垂直于等值线的切向量。零梯度满足相同的点积恒等式，但不提供法向方向。
:::

::: proof
对于每一个 $t$， $f\big(x(t), y(t)\big) = k$。对两边在 $t_0$ 处求导，左边使用链式法则： $f_x(a, b)\,x'(t_0) + f_y(a, b)\,y'(t_0) = 0$，即 $\nabla f(a, b)\cdot\vb{r}'(t_0) = 0$。
:::

所以在等高线图中，每个点的梯度（在该点不为 $\vb{0}$ 时），垂直于通过该点的等高线，并指向数值较大的方向。当等高线代表等间距的值时，等高线密集表示梯度较大，等高线稀疏表示梯度较小（图 17.4，左图）。对于 $f(x, y) = x^2 + y^2$， $\nabla f = \langle 2x, 2y\rangle$ 指向原点，穿过 $x^2 + y^2 = k$ 所在的圆，并且与圆垂直；其长度 $2\sqrt{x^2 + y^2}$ 随着离原点的距离增加而增大，其中对于 $k$ 的等间距正数值，圆会密集地排列。

```check
gq = Matrix([diff(x**2 + y**2, x), diff(x**2 + y**2, y)]); same(gq, 2*Matrix([x, y]))
kp = symbols('k', positive=True); rc = Matrix([sqrt(kp)*cos(t), sqrt(kp)*sin(t)])        # the circle x^2 + y^2 = k
same(rc[0]**2 + rc[1]**2, kp); same(gq.subs({x: rc[0], y: rc[1]}).dot(rc.diff(t)), 0)
same(Matrix([2*xr, 2*yr]).norm(), 2*sqrt(xr**2 + yr**2))
```

::: figure id=fig-17-4
左图：图17.1的等高线图，绘制了三个水平曲线上的梯度，其长度为其实际长度的0.13倍。每个箭头均与其水平曲线垂直相交并指向高处；在等高线密集处箭头最长。右图：从$(3, 1)$出发对$f(x, y) = x^2 + 3y^2$进行梯度下降（第17.7节）。采用步长$\eta = 0.1$（蓝色）时，点平滑滑入谷底；采用$\eta = 0.3$（橙色）时，点则呈之字形穿越谷底，并在陡峭的$y$方向上发生超调。
:::

::: widget name=contour-gradient
选择一个函数，然后点击地图，或使用滑块设置 $x$ 和 $y$ 来选择一个点。红色箭头显示梯度的数值估计，按比例绘制；读数显示估计的长度 $\norm{\nabla f}$。绿色箭头是单位向量 $\vb{u}$，其角度由滑块设置；紫色曲线是通过该点的等高线。对于在所选点附近可微且梯度非零的函数，转动 $\vb{u}$ 并观察 $D_{\vb{u}} f = \nabla f\cdot\vb{u}$ 的估计值：当 $\vb{u}$ 指向 $\nabla f$ 时最大，当指向相反方向时最小，当与等高线相切时为零。使用 $x^2 + y^2$，每个非零梯度都指向原点。在图 17.1 的地形上，选择一个接近 $(\pm1, 0)$ 处的山口，此时 $\nabla f$ 接近 $\vb{0}$。然后输入 `x e^y`，选择点 $(2, 0)$ 并将角度设置为 $53^\circ$，接近 $\langle 3, 4\rangle$ 的方向：读数约为 2.199，接近例 17.13 中的值 2.2。
:::

### 水平曲面与切平面 {#tangent-planes-3d}

对于三元可微函数，同样成立，其中 $\nabla f = \langle f_x, f_y, f_z\rangle$ 和空间中的单位向量 $\vb{u}$ 为： $D_{\vb{u}} f = \nabla f\cdot\vb{u}$，非零梯度指向最陡上升方向，并且根据定理 17.11 的证明（三元情况），它垂直于通过该点且位于等值面上的每一条可微曲线的切向量。一个平面由一点和一个非零法向量确定（模块 16），因此梯度给出正则等值面的切平面。

::: definition 等值面的切平面
设 $P(x_0, y_0, z_0)$ 是等值集 $F(x, y, z) = k$ 上的一点，$F$ 在该点的邻域内具有连续的偏导数，且 $\nabla F(P) \ne \vb{0}$。由隐函数定理可知，该等值集在这点附近为曲面。它在 $P$ 处的**切平面**是经过 $P$ 且以 $\nabla F(P)$ 为法向量的平面：

$$\begin{aligned} &F_x(P)(x - x_0) + F_y(P)(y - y_0) \\ &\quad + F_z(P)(z - z_0) = 0. \end{aligned}$$
:::

对于 $f$ 具有连续偏导数的情况，图 $z = f(x, y)$ 是等值面 $F(x, y, z) = f(x, y) - z = 0$，且 $\nabla F = \langle f_x, f_y, -1\rangle$；在 $P(a, b, c)$ 处，定义 17.11 给出 $f_x(a, b)(x - a) + f_y(a, b)(y - b) - (z - c) = 0$，即定义 17.6 中的切平面。

```check
fg_ = Function('f')
Fg = fg_(x, y) - z
same(diff(Fg, z), -1); same(diff(Fg, x), diff(fg_(x, y), x))
c0, fx0_, fy0_ = symbols('c0 f_x0 f_y0')
same(solve(fx0_*(x - a) + fy0_*(y - b) - (z - c0), z), [c0 + fx0_*(x - a) + fy0_*(y - b)])
```

::: example 等值面的切平面
求曲面 $x^2 + 2y^2 + 3z^2 = 6$ 在 $P(1, 1, 1)$ 处的切平面，以及该点处的偏导数 $\partial z/\partial x$ 和 $\partial z/\partial y$。

该点在曲面上，因为 $1 + 2 + 3 = 6$。带入 $F(x, y, z) = x^2 + 2y^2 + 3z^2$， $\nabla F = \langle 2x, 4y, 6z\rangle$，所以 $\nabla F(1, 1, 1) = \langle 2, 4, 6\rangle$，切平面为

$$\begin{aligned} 2(x - 1) + 4(y - 1) + 6(z - 1) &= 0, \\ \text{that is,}\quad x + 2y + 3z &= 6. \end{aligned}$$

通过隐函数求导（第17.5节）， $\dfrac{\partial z}{\partial x} = -\dfrac{F_x}{F_z} = -\dfrac{2}{6} = -\dfrac13$ 和 $\dfrac{\partial z}{\partial y} = -\dfrac{F_y}{F_z} = -\dfrac46 = -\dfrac23$。两个答案一致：解出 $z$，切平面为 $z = 2 - \tfrac13 x - \tfrac23 y$，恰好有这些斜率。

```check
Fs = x**2 + 2*y**2 + 3*z**2
same(Fs.subs({x: 1, y: 1, z: 1}), 6)
gFs = Matrix([diff(Fs, v_) for v_ in (x, y, z)]); same(gFs, Matrix([2*x, 4*y, 6*z])); same(gFs.subs({x: 1, y: 1, z: 1}), Matrix([2, 4, 6]))
same(expand(2*(x - 1) + 4*(y - 1) + 6*(z - 1)), 2*(x + 2*y + 3*z - 6))
same(solve(x + 2*y + 3*z - 6, z), [2 - x/3 - 2*y/3])
same((-gFs[0]/gFs[2]).subs({x: 1, y: 1, z: 1}), -Rational(1, 3)); same((-gFs[1]/gFs[2]).subs({x: 1, y: 1, z: 1}), -Rational(2, 3))
same(idiff(Fs - 6, z, x).subs({x: 1, y: 1, z: 1}), -Rational(1, 3)); same(idiff(Fs - 6, z, y).subs({x: 1, y: 1, z: 1}), -Rational(2, 3))
```
:::

::: pitfall
方向导数需要单位向量。在例17.13中将 $\vb{v} = \langle 3, 4\rangle$ 代入 $\vb{u}$， $\nabla f\cdot\vb{v} = 11$，五倍于原值，因为 $\vb{v}$ 的长度为5：先除以长度。 $\nabla f$ 是一个向量，不是数字；其长度 $\norm{\nabla f}$ 是最陡的斜率。

```check
same(Matrix([1, 2]).dot(Matrix([3, 4])), 11); same(11/Rational(11, 5), 5)
```
:::

::: compute 使用 SymPy 和 NumPy 计算梯度
一个 SymPy `Matrix` 保存梯度； `.dot` 进行点积运算， `.norm()` 计算长度。例17.13再次：

```python
import sympy as sp
x, y = sp.symbols('x y')
f = x*sp.exp(y)
grad = sp.Matrix([sp.diff(f, x), sp.diff(f, y)])
g = grad.subs({x: 2, y: 0})
u = sp.Matrix([3, 4])/5
print(grad.T, '|', g.T, '|', g.dot(u), '|', g.norm())
```

```output
Matrix([[exp(y), x*exp(y)]]) | Matrix([[1, 2]]) | 11/5 | sqrt(5)
```

`.T` 将梯度的列向量转为行向量以便打印: $\nabla f = \langle e^y, xe^y\rangle$，然后 $\langle 1, 2\rangle$ 在 $(2, 0)$， $D_{\vb{u}} f = \tfrac{11}{5}$ 和 $\norm{\nabla f} = \sqrt5$。

定理 17.10 表明，函数在 $\norm{\nabla f} = \sqrt5$ 方向上增长最快。用 NumPy 每隔 0.5 度取一个方向，共试算 720 个方向：

```python
import numpy as np
gx, gy = 1.0, 2.0                               # grad f(2, 0)
alpha = np.radians(np.arange(0, 360, 0.5))      # the angles of u = <cos a, sin a>
D = gx*np.cos(alpha) + gy*np.sin(alpha)         # D_u f for each direction
k = np.argmax(D)
print(f"largest D_u f: {D[k]:.6f}, at {np.degrees(alpha[k])} degrees")
angle = np.degrees(np.arctan2(gy, gx))           # the direction of grad f
print(f"|grad f| = {np.hypot(gx, gy):.6f}, at {angle:.4f} degrees")
```

```output
largest D_u f: 2.236067, at 63.50000000000001 degrees
|grad f| = 2.236068, at 63.4349 degrees
```

在 $63.5^\circ$ 的 720 个方向中，最接近梯度方向 $63.4349^\circ$ 的那个方向，其速率仅在第六位小数处略逊于 $\norm{\nabla f}$。（数字 `00000000000001` 是由于将弧度转换回度数时的浮点数舍入误差。）
:::

```check
rounds(atan2(2, 1)*180/pi, '63.4349'); rounds(sqrt(5), '2.236068')
rounds(sqrt(5)*cos((Rational(635, 10) - atan2(2, 1)*180/pi)*pi/180), '2.236067')
holds(abs(Rational(635, 10) - atan2(2, 1)*180/pi) < Rational(1, 4))
rounds(cos(53*pi/180) + 2*sin(53*pi/180), '2.199')
```

## 梯度下降 {#gradient-descent}

[第 8.7 节 ](module_08_ZH.html#gradient-descent) 通过沿导数 $x_{k+1} = x_k - \eta f'(x_k)$ 的反方向进行步进，来最小化单变量函数。在多变量情况下，梯度取代导数，定理 17.10 表示应沿 $-\nabla f$（最陡下降方向）进行步进。]

::: definition 梯度下降
要极小化一个含两个或更多变量的可微函数 $f$，先选取初始点 $\vb{x}_0$ 和**步长** $\eta > 0$（学习率），再计算

$$\vb{x}_{k+1} = \vb{x}_k - \eta\,\nabla f(\vb{x}_k), \qquad k = 0, 1, 2, \dots$$

这里 $\vb{x}_k = \langle x_k, y_k\rangle$ 是 $k$ 点，写成向量形式，且 $f(\vb{x}_k)$ 表示 $f(x_k, y_k)$。迭代过程要求每个新点仍保留在 $f$ 的定义域内。
:::

当梯度非零时，每一步都沿着最陡下降方向移动，移动的距离为 $\eta\norm{\nabla f(\vb{x}_k)}$：在曲面陡峭处走长步，在平坦处走短步。根据梯度形式的线性近似（第 17.6 节），

$$\begin{aligned} f(\vb{x}_{k+1}) &\approx f(\vb{x}_k) + \nabla f(\vb{x}_k)\cdot(\vb{x}_{k+1} - \vb{x}_k) \\ &= f(\vb{x}_k) - \eta\norm{\nabla f(\vb{x}_k)}^2, \end{aligned}$$

当 $\nabla f(\vb{x}_k) \ne \vb{0}$ 时，预测的变化为负。可微性使得误差除以步长趋于 0；在固定这样的点处，对于足够小的 $\eta > 0$，误差的绝对值小于 $\tfrac12\eta\norm{\nabla f(\vb{x}_k)}^2$，因此实际变化也为负。需要多小的 $\eta$ 取决于点本身。点停止移动仅当 $\nabla f = \vb{0}$；模块 18 研究这些临界点。

```check
g1_, g2_, et_ = symbols('g1 g2 eta')
gv_ = Matrix([g1_, g2_])
same(gv_.dot(-et_*gv_), -et_*(g1_**2 + g2_**2))
```

::: example 碗状函数上的梯度下降
将梯度下降应用于 $f(x, y) = x^2 + 3y^2$，从 $(3, 1)$ 出发，初始点为 $\eta = 0.1$。找出第 $k$ 个点的公式，以及使点趋近于 $(0, 0)$ 最小值的步长。

这里 $\nabla f = \langle 2x, 6y\rangle$。第一步：$\nabla f(3, 1) = \langle 6, 6\rangle$，所以

$$\vb{x}_1 = \langle 3, 1\rangle - 0.1\,\langle 6, 6\rangle = \langle 2.4, 0.4\rangle,$$

且 $f$ 从 12 下降到 $5.76 + 0.48 = 6.24$。第二步：$\nabla f(2.4, 0.4) = \langle 4.8, 2.4\rangle$，因此 $\vb{x}_2 = \langle 1.92, 0.16\rangle$，其中 $f = 3.7632$。每一步都将每个坐标乘以一个固定的因子，

$$\begin{aligned} x_{k+1} &= x_k - 2\eta x_k = (1 - 2\eta)x_k, \\ y_{k+1} &= y_k - 6\eta y_k = (1 - 6\eta)y_k, \end{aligned}$$

所以对于 $\eta = 0.1$，$x_k = 3(0.8)^k$ 和 $y_k = (0.4)^k$：

```valuetable
k = 0, 1, 2, 3, 4, 5, 6
$x_k$ = 3*(4/5)**k
$y_k$ = (2/5)**k
$f(x_k, y_k)$ = 9*(16/25)**k + 3*(4/25)**k
---
k | x_k | y_k | f(x_k, y_k)
0 | 3 | 1 | 12
1 | 2.4 | 0.4 | 6.24
2 | 1.92 | 0.16 | 3.7632
3 | 1.536 | 0.064 | 2.37158
4 | 1.2288 | 0.0256 | 1.51192
5 | 0.98304 | 0.01024 | 0.966682
6 | 0.786432 | 0.004096 | 0.618526
```

由$(3, 1)$可知，点趋近于$(0, 0)$当且仅当两个因子均严格介于$-1$与1之间，如同第8.7节的抛物线，对每个坐标各出现一次。$\abs{1 - 2\eta} < 1$需要$0 < \eta < 1$，且$\abs{1 - 6\eta} < 1$需要$0 < \eta < \tfrac13$；因此梯度下降在$0 < \eta < \tfrac13$时恰好收敛。在$\eta = 0.3$下，因子为0.4和$-0.8$：$y_k$在每一步改变符号，点在山谷间之字形摆动并缓慢收敛（图17.4，右侧）。

```check
fb = x**2 + 3*y**2
same(Matrix([diff(fb, x), diff(fb, y)]), Matrix([2*x, 6*y]))
p1 = Matrix([3, 1]) - Rational(1, 10)*Matrix([6, 6]); same(p1, Matrix([Rational(24, 10), Rational(4, 10)]))
same(fb.subs({x: 3, y: 1}), 12); steps(fb.subs({x: p1[0], y: p1[1]}), Rational(576, 100) + Rational(48, 100), Rational(624, 100))
same(Matrix([2*p1[0], 6*p1[1]]), Matrix([Rational(48, 10), Rational(24, 10)]))
p2 = p1 - Rational(1, 10)*Matrix([2*p1[0], 6*p1[1]]); same(p2, Matrix([Rational(192, 100), Rational(16, 100)])); same(fb.subs({x: p2[0], y: p2[1]}), Rational(37632, 10000))
eta_ = symbols('eta', positive=True); xk_, yk_ = symbols('x_k y_k')
same(xk_ - eta_*2*xk_, (1 - 2*eta_)*xk_); same(yk_ - eta_*6*yk_, (1 - 6*eta_)*yk_)
pts_ = [Matrix([3, 1])]
for _ in range(6):
    pts_.append(pts_[-1] - Rational(1, 10)*Matrix([2*pts_[-1][0], 6*pts_[-1][1]]))
same([q_[0] for q_ in pts_], [3*Rational(4, 5)**k_ for k_ in range(7)]); same([q_[1] for q_ in pts_], [Rational(2, 5)**k_ for k_ in range(7)])
same([fb.subs({x: q_[0], y: q_[1]}) for q_ in pts_], [9*Rational(16, 25)**k_ + 3*Rational(4, 25)**k_ for k_ in range(7)])
er_ = symbols('eta', real=True)
same(solve_univariate_inequality(Abs(1 - 2*er_) < 1, er_, relational=False), Interval.open(0, 1))
same(solve_univariate_inequality(Abs(1 - 6*er_) < 1, er_, relational=False), Interval.open(0, Rational(1, 3)))
same([1 - 2*Rational(3, 10), 1 - 6*Rational(3, 10)], [Rational(2, 5), -Rational(4, 5)])
```
:::

::: compute 使用 NumPy 的梯度下降
每一步是一行：

```python
import numpy as np

def grad(p):                            # f(x, y) = x**2 + 3*y**2
    return np.array([2*p[0], 6*p[1]])

def descent(eta, steps, p=(3.0, 1.0)):
    p = np.array(p)
    for _ in range(steps):
        p = p - eta*grad(p)
    return p

for eta in (0.1, 0.3):
    for k in (1, 2, 5, 10, 20):
        x, y = descent(eta, k)
        print(f"eta = {eta}, k = {k:2d}: ({x:9.6f}, {y:9.6f})")
```

```output
eta = 0.1, k =  1: ( 2.400000,  0.400000)
eta = 0.1, k =  2: ( 1.920000,  0.160000)
eta = 0.1, k =  5: ( 0.983040,  0.010240)
eta = 0.1, k = 10: ( 0.322123,  0.000105)
eta = 0.1, k = 20: ( 0.034588,  0.000000)
eta = 0.3, k =  1: ( 1.200000, -0.800000)
eta = 0.3, k =  2: ( 0.480000,  0.640000)
eta = 0.3, k =  5: ( 0.030720, -0.327680)
eta = 0.3, k = 10: ( 0.000315,  0.107374)
eta = 0.3, k = 20: ( 0.000000,  0.011529)
```

用 $\eta = 0.1$ 的 $y$ 坐标，每一步乘以 0.4，很快变得可以忽略；而 $x$ 坐标乘以 0.8，落后很多：在 20 步后仍约为 0.035。用 $\eta = 0.3$ 时，角色互换： $x$ 每步缩小 0.4 倍，但 $y$ 每步改变符号且仅缩小 0.8 倍。不同步长下，需要多少步才能使 $\norm{\nabla f} < 10^{-8}$ 满足条件？

```python
def steps_needed(eta, tol=1e-8, max_steps=10000):
    p = np.array([3.0, 1.0])
    for k in range(max_steps + 1):
        size = np.linalg.norm(grad(p))
        if size < tol:
            return k
        if size >= 1e6 or k == max_steps:
            return None
        p = p - eta*grad(p)

for eta in (0.05, 0.1, 0.2, 0.25, 0.3, 0.33, 0.34):
    k = steps_needed(eta)
    print(f"eta = {eta}: " + (f"{k} steps" if k is not None else "tolerance not reached"))
```

```output
eta = 0.05: 192 steps
eta = 0.1: 91 steps
eta = 0.2: 40 steps
eta = 0.25: 30 steps
eta = 0.3: 91 steps
eta = 0.33: 1001 steps
eta = 0.34: tolerance not reached
```

循环最多进行 10,000 次更新，或在梯度增长到 $10^6$ 时提前终止。这也处理了那些永远不会达到容忍度的有界序列，例如在 $\eta = \tfrac13$ 处的振荡； `None` 表示在停止前未达到容忍度，并不单独证明发散。

这些步长中最好的是0.25，此时因子$1 - 2\eta = 0.5$和$1 - 6\eta = -0.5$同样小。在$\eta = 0.33$处，因子$1 - 6\eta = -0.98$接近$-1$，且锯齿现象需一千步才能平息；在0.34处，超出$\tfrac13$，它开始增长，梯度下降发散，公式证明了这一点。陡峭方向限制了步长，而平缓方向则希望长步。当不同方向的曲率差异很大时，即使最好的固定步长也会导致缓慢的梯度下降；模块18研究了这个问题，称为病态条件。
:::

```check
rounds(3*Rational(4, 5)**20, '0.034588'); rounds(3*Rational(4, 5)**20, '0.035'); holds(Rational(2, 5)**20 < Rational(5, 10**7))
same([1 - 2*Rational(1, 4), 1 - 6*Rational(1, 4)], [Rational(1, 2), -Rational(1, 2)]); same(1 - 6*Rational(33, 100), -Rational(98, 100))
holds(abs(1 - 6*Rational(34, 100)) > 1); rounds(Rational(4, 5)**20, '0.011529')
```

在许多机器学习模型中，$\vb{x}$ 是权重和偏置等参数组成的列表，参数可能多达数百万个。函数 $f$ 表示**损失**，衡量模型在训练数据上的误差。训练常用梯度下降或其变体。随机梯度下降在每一步从训练数据随机抽取一个样本或一个批次，用于估计梯度。动量法和 Adam 在计算下一次更新时还会用到之前各步的梯度。每一步都需要一个梯度，其中每个参数对应一个偏导数。下一节将说明如何高效地计算梯度。[人工智能：从机器学习到大语言模型](../ai/index_ZH.html)将这些方法用于实际模型。

## 反向传播 {#backpropagation}

神经网络的损失是通过一系列简单的运算计算得到的：权重的乘法、求和以及单变量的简单函数。[第5.8](module_05_ZH.html#autodiff)节展示了如何使用双重数对这种计算进行微分，逐个输入向前传播导数。使用这种实现方式，一百万个参数需要进行一百万次运行。对于在输入处可微的运算，**反向传播**可以在一次反向传播过程中找到损失相对于每个参数的导数，其计算成本仅为计算损失本身的少量倍数。这是第17.5节中的链式法则，按图结构组织起来。

::: definition 计算图
A **计算图**是一个无环的有向图：它为每个输入和每个中间结果都有一个节点，每个节点作为另一个节点的输入的使用对应一条箭头。一个节点指向的节点是它的**子节点**，而它是由哪些节点计算得到的则是它的 **父节点**。对于可微操作，每条箭头携带一个 **局部导数**：即相对于该输入参数的子节点操作的偏导数，其他参数保持不变。如果一个节点提供两个参数，如 $e\cdot e$，则会有两条箭头，每条箭头携带 $e$。如果计算以数字 $L$ 结束，则节点 $v$ 的 **伴随量** 是 $\bar v = \partial L/\partial v$，读作 "v 条"。
:::

图的计算分为两个阶段进行。

1. **前向传播** 计算每个节点的值，从输入到输出，并保存这些值。
2. **反向传播** 计算伴随量，从输出反向传播到输入。它从 $\bar L = 1$ 开始，并为每个其他节点 $v$ 计算其箭头指向子节点 $c$ 的求和，单独统计重复输入的使用次数：

$$\bar v = \sum_{v\to c}\,\bar c\,\frac{\partial c}{\partial v},$$

其中每个 $\partial c/\partial v$ 是该箭头上的局部导数。

为什么这样是对的？ $L$ 仅通过 $v$ 的子节点依赖 $v$，因此根据第 17.5 节的一般链式法则，将子节点作为中间变量，正好得到这个求和。展开来看，这是第 17.5 节的核心思想： $\partial L/\partial v$ 是所有从 $v$ 到 $L$ 的路径上的局部导数乘积之和。反向传播以经济的方式累加这些乘积。每个伴随量 $\bar c$ 仅计算一次，然后服务于所有经过 $c$ 的路径，因此每个箭头仅使用一次，反向传播的代价是前向传播的少量倍数，无论输入有多少个。

::: figure id=fig-17-5
损失 $L(w, b) = (1 - w - b)^2 + (3 - 2w - b)^2$ 的计算图，如例 17.16 中的 $w = b = 0$。每条箭头表示其局部导数。前向传播给出值（蓝色）；从 $\bar L = 1$ 回到输入的反向传播给出伴随量（橙色），而 $\bar w = -14$ 和 $\bar b = -8$ 是 $L$ 的两个偏导数。
:::

::: example 前向传播和反向传播
一个模型从输入 $x$ 预测值 $wx + b$，有两个参数 $w$ 和 $b$。在两个数据点 $(x, t) = (1, 1)$ 和 $(2, 3)$ 上，其中 $t$ 是真实值，其误差（真实值减去预测值）分别为 $e_1 = 1 - w \cdot 1 - b$ 和 $e_2 = 3 - w \cdot 2 - b$，其损失为 $L = e_1^2 + e_2^2$。从 $w = b = 0$ 开始，通过一次前向传播和一次反向传播（图 17.5）找到 $\partial L/\partial w$ 和 $\partial L/\partial b$，并使用 $\eta = 0.05$ 进行一次梯度下降更新。

**前向传播。** $e_1 = 1$， $e_2 = 3$ 和 $L = 1 + 9 = 10$。

**反向传播。** 从 $\bar L = 1$ 开始。的 $L = e_1^2 + e_2^2$ 的局部导数是 $2e_1$ 和 $2e_2$，因此是 $\bar e_1 = \bar L \cdot 2e_1 = 2$ 和 $\bar e_2 = \bar L \cdot 2e_2 = 6$。节点 $w$ 有两个子节点 $e_1$ 和 $e_2$，其局部导数为 $-1$ 和 $-2$，即两点输入 $x$ 的负数； $b$ 有相同的子节点，其局部导数为 $-1$ 和 $-1$：

$$\begin{aligned} \bar w &= \bar e_1 \cdot (-1) + \bar e_2 \cdot (-2) = -2 - 12 = -14, \\ \bar b &= \bar e_1 \cdot (-1) + \bar e_2 \cdot (-1) = -2 - 6 = -8. \end{aligned}$$

| 节点 | 正向传播 | 反向传播 |
|---|---|---|
| $w$, $b$ | $0$, $0$ | $\bar w = -14$, $\bar b = -8$ |
| $e_1 = 1 - w - b$ | $1$ | $\bar e_1 = \bar L \cdot 2e_1 = 2$ |
| $e_2 = 3 - 2w - b$ | $3$ | $\bar e_2 = \bar L \cdot 2e_2 = 6$ |
| $L = e_1^2 + e_2^2$ | $10$ | $\bar L = 1$ |

因此 $\nabla L(0, 0) = \langle -14, -8\rangle$。通过直接对 $L(w, b) = (1 - w - b)^2 + (3 - 2w - b)^2$ 求导来验证： $L_w = -2(1 - w - b) - 4(3 - 2w - b)$ 和 $L_b = -2(1 - w - b) - 2(3 - 2w - b)$，即 $-2 - 12 = -14$ 和 $-2 - 6 = -8$ 在 $(0, 0)$ 处的值。

一次梯度下降步骤得到 $\langle w, b\rangle = \langle 0, 0\rangle - 0.05\,\langle -14, -8\rangle = \langle 0.7, 0.4\rangle$，其中 $e_1 = -0.1$、 $e_2 = 1.2$ 和 $L = 0.01 + 1.44 = 1.45$ 从 10 下降到。进一步的步骤接近 $w = 2$、 $b = -1$，即两点之间的直线 $t = 2x - 1$，其中 $L = 0$；模块 18 直接通过最小二乘法找到这样的最佳拟合直线。

```check
W_, B_ = symbols('w b')
e1_, e2_ = 1 - W_ - B_, 3 - 2*W_ - B_
Lw = e1_**2 + e2_**2
same([e1_.subs({W_: 0, B_: 0}), e2_.subs({W_: 0, B_: 0}), Lw.subs({W_: 0, B_: 0})], [1, 3, 10])
same([2*1, 2*3], [2, 6]); same([diff(e1_, W_), diff(e2_, W_), diff(e1_, B_), diff(e2_, B_)], [-1, -2, -1, -1])
steps(2*(-1) + 6*(-2), -2 - 12, -14); steps(2*(-1) + 6*(-1), -2 - 6, -8)
same(diff(Lw, W_), -2*(1 - W_ - B_) - 4*(3 - 2*W_ - B_)); same(diff(Lw, B_), -2*(1 - W_ - B_) - 2*(3 - 2*W_ - B_))
same(Matrix([diff(Lw, W_), diff(Lw, B_)]).subs({W_: 0, B_: 0}), Matrix([-14, -8]))
st1 = Matrix([0, 0]) - Rational(5, 100)*Matrix([-14, -8]); same(st1, Matrix([Rational(7, 10), Rational(4, 10)]))
same([e1_.subs({W_: st1[0], B_: st1[1]}), e2_.subs({W_: st1[0], B_: st1[1]})], [-Rational(1, 10), Rational(12, 10)])
steps(Lw.subs({W_: st1[0], B_: st1[1]}), Rational(1, 100) + Rational(144, 100), Rational(145, 100))
same(solve([e1_, e2_], [W_, B_]), {W_: 2, B_: -1})
```
:::

::: pitfall
每个节点的子节点都会对其邻接点做出贡献。此处 $w$ 通过两个数据点同时影响 $L$；只保留经过 $e_1$ 的路径将得到 $\bar w = -2$ 而不是 $-14$。因此，一个程序会累积邻接点：每个邻接点初始为 0，每个子节点将其部分加到邻接点上。
:::

::: compute Python 中的反向传播
几行 Python 代码在计算过程中记录图，然后运行反向传播。每个 `Var` 保存一个值，其父节点保存局部导数，以及其邻接点 `grad`：

```python
class Var:
    """A node of a computational graph."""
    def __init__(self, value, parents=()):
        self.value, self.parents, self.grad = value, parents, 0.0
    def __add__(self, other):
        other = other if isinstance(other, Var) else Var(other)
        return Var(self.value + other.value, [(self, 1.0), (other, 1.0)])
    def __mul__(self, other):
        other = other if isinstance(other, Var) else Var(other)
        a, b = self.value, other.value
        return Var(a*b, [(self, b), (other, a)])
    def __sub__(self, other):
        return self + (-1.0)*other
    def __rsub__(self, other):
        return (-1.0)*self + other
    __radd__, __rmul__ = __add__, __mul__
```

反向传播按节点顺序排列，使得每个节点在它被计算出的节点之后，将邻接点重置为 0，然后按此列表反向遍历；每个节点将其邻接点乘以局部导数传递给每个父节点，父节点将收到的值相加。重置邻接点使我们可以在同一图上再次运行反向传播：

```python
def backward(out):
    order, seen = [], set()
    def visit(v):
        if id(v) not in seen:
            seen.add(id(v))
            for p, _ in v.parents:
                visit(p)
            order.append(v)
    visit(out)
    for v in order:
        v.grad = 0.0
    out.grad = 1.0
    for v in reversed(order):
        for p, local in v.parents:
            p.grad += v.grad*local
```

示例 17.16，损失由一个普通的 Python 函数计算得出：

```python
data = [(1, 1), (2, 3)]                 # the points (x, t)

def loss(w, b):
    L = 0
    for x, t in data:
        e = t - (w*x + b)               # true value minus prediction
        L = L + e*e
    return L

w, b = Var(0.0), Var(0.0)
L = loss(w, b)
backward(L)
print(L.value, w.grad, b.grad)
```

```output
10.0 -14.0 -8.0
```

乘积 `e*e` 将 `e` 列为两次父节点，每次都有局部导数 $e$，因此 `e` 接收 $2e$ 倍的乘积的伴随：这就是通过图完成的乘积法则。SymPy 在给定公式的情况下也同意这一点：

```python
import sympy as sp
ws, bs = sp.symbols('w b')
Ls = sum((t - (ws*x + bs))**2 for x, t in data)
print(sp.expand(Ls), '|', [sp.diff(Ls, v).subs({ws: 0, bs: 0}) for v in (ws, bs)])
```

```output
2*b**2 + 6*b*w - 8*b + 5*w**2 - 14*w + 10 | [-14, -8]
```

SymPy 将损失展开为 $L = 5w^2 + 6wb + 2b^2 - 14w - 8b + 10$，其中各项按其自身的顺序排列，且在 $(0, 0)$ 处的偏导数即为反向传播的导数。

训练是一个正向传播、反向传播和梯度下降步骤的循环：

```python
w, b = Var(0.0), Var(0.0)
for step in range(501):
    L = loss(w, b)
    if step in (0, 1, 2, 10, 100, 500):
        Lv, wv, bv = L.value, w.value, b.value
        print(f"step {step:3d}: L = {Lv:.3g}, w = {wv:.4f}, b = {bv:.4f}")
    if step < 500:
        backward(L)
        w, b = Var(w.value - 0.05*w.grad), Var(b.value - 0.05*b.grad)
```

```output
step   0: L = 10, w = 0.0000, b = 0.0000
step   1: L = 1.45, w = 0.7000, b = 0.4000
step   2: L = 0.59, w = 0.9300, b = 0.5100
step  10: L = 0.393, w = 1.1367, b = 0.3969
step 100: L = 0.0279, w = 1.7700, b = -0.6279
step 500: L = 2.19e-07, w = 1.9994, b = -0.9990
```

每个打印的步骤都计数了已完成的更新：步骤 0 是起始点，第二行是例 17.16 的步骤。损失在初期迅速下降，随后逐渐变慢：在 100 步后损失仍约为 0.0279，而 $w$ 和 $b$ 才在 2 和 $-1$ 附近稳定下来。该损失的谷底狭长且漫长，这种情况在模块 18 中有解释。
:::

```check
Lq = 5*W_**2 + 6*W_*B_ + 2*B_**2 - 14*W_ - 8*B_ + 10; same(expand(Lw), Lq)
st2 = st1 - Rational(5, 100)*Matrix([diff(Lw, W_), diff(Lw, B_)]).subs({W_: st1[0], B_: st1[1]})
same(st2, Matrix([Rational(93, 100), Rational(51, 100)])); rounds(Lw.subs({W_: st2[0], B_: st2[1]}), '0.59')
wb_ = Matrix([0, 0])
for _ in range(100):
    wb_ -= Rational(1, 20)*Matrix([10*wb_[0] + 6*wb_[1] - 14, 6*wb_[0] + 4*wb_[1] - 8])
rounds(Lw.subs({W_: wb_[0], B_: wb_[1]}), '0.0279')
```

神经网络也有前向和反向两个阶段，只是用数组代替单个数，在各层间使用非线性函数，并且运算次数可能达到数百万次。参数可用梯度下降的变体来更新。[人工智能：从机器学习到大语言模型](../ai/index_ZH.html)在[模块 2](../ai/module_02_ZH.html)中讲解神经网络的反向传播。[数学基础[模块 18](../math/module_18_ZH.html)则用矩阵写出同一条链式法则。

## 你所学到的内容 {#summary}

- 一个二元或三元函数的定义域在平面上或空间中。曲面图展示函数的图像 $z = f(x, y)$；等高线图展示水平集 $f(x, y) = k$，通常是曲线，尽管某些水平可以是点或更大的集合。当等高线等间距时，密集的等高线表示地形陡峭。在三元函数中，水平集 $f(x, y, z) = k$ 通常是曲面。
- $\lim_{(x,y)\to(a,b)} f(x, y) = L$ 需要函数值沿定义域中的每条路径都趋于 $L$。两条极限不同的路径证明极限不存在；所有直线上的一致并不证明极限存在；夹逼定理 $\abs{f - L} \le g \to 0$ 证明极限存在。
- 部分导数 $f_x = \partial f/\partial x$ 和 $f_y$ 是通过保持另一个变量固定来求得的；它们是曲面切片的斜率。克莱因定理给出 $f_{xy} = f_{yx}$，当混合偏导数在该点的邻域内连续时成立。
- 对于可微函数，切平面 $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$ 给出线性近似。可微意味着误差除以距离趋于 0；连续偏导数保证这一点，偏导数本身并不足够。全微分 $dz = f_x\,dx + f_y\,dy$ 估计 $z$ 的变化，并提供测量误差传播的一阶估计。
- 对于可微函数，链式法则在树状图中每一条路径增加一个乘积，如 $\dfrac{dz}{dt} = \dfrac{\partial z}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial z}{\partial y}\dfrac{dy}{dt}$ 所示。在 $F = 0$ 和 $F_y \ne 0$ 上某点附近偏导数连续时，隐函数求导给出 $dy/dx = -F_x/F_y$ 的局部图像。
- 对可微函数 $f$ 和一个单位向量 $\vb{u}$，梯度 $\nabla f = \langle f_x, f_y\rangle$ 给出 $D_{\vb{u}} f = \nabla f\cdot\vb{u}$。非零梯度指向最陡上升方向，其速率是 $\norm{\nabla f}$；如果梯度为零，则每个方向导数都为零。在点附近连续偏导数且梯度非零时，等值线在二维情况下是曲线，在三维情况下是曲面，该梯度为其法向量。
- 梯度下降 $\vb{x}_{k+1} = \vb{x}_k - \eta\nabla f(\vb{x}_k)$ 在梯度非零且步长足够小时，可使可微函数下降。较大步长可能导致震荡或发散。反向传播在一个反向遍历过程中，计算损失函数的所有输入偏导数，对每个节点的子节点进行累加：链式法则，用于多个输入的组织。

## 练习 {#exercises}

:::: exercise 定义域、值域和等值线 {#ex-17-1} ★
设 $f(x, y) = \sqrt{16 - x^2 - 4y^2}$。

- (a) 找出并描述 $f$ 的定义域和值域。
- (b) 描述 $f(x, y) = k$ 的等值线 $k = 0, 1, 2, 3, 4$。曲线最密集的地方在哪里？这说明了什么关于曲面？

::: solution
**(a)** 开方需要$16 - x^2 - 4y^2 \ge 0$，即$x^2 + 4y^2 \le 16$，或$\dfrac{x^2}{16} + \dfrac{y^2}{4} \le 1$：半轴分别为沿$x$轴的4和沿$y$轴的2的椭圆及其内部。在定义域上，$16 - x^2 - 4y^2$介于0和16之间，因此$f$取值于$[0, 4]$；沿$x$轴，当$x$从4递减至0时，$f(x, 0) = \sqrt{16 - x^2}$取遍0到4之间的所有值。值域为$[0, 4]$。

**(b)** 对于$0 \le k \le 4$，$f(x, y) = k$意味着$x^2 + 4y^2 = 16 - k^2$（两边平方，二者非负）。对于$k < 4$，这是一个以原点为中心、半轴为$\sqrt{16 - k^2}$和$\tfrac12\sqrt{16 - k^2}$的椭圆，形状始终相同。对于$k = 0$，它是定义域的边界。它在正$x$轴上于4、$\sqrt{15} \approx 3.87$、$\sqrt{12} \approx 3.46$和$\sqrt7 \approx 2.65$处相交，对应于$k = 0, 1, 2, 3$；对于$k = 4$，水平集是单个点$(0, 0)$，即顶点。间隙从约0.13增大到0.41、0.82和2.65：水平曲线在边缘附近最密集，此处曲面（椭球的上半部分）最陡峭。

```check
f_e1 = sqrt(16 - x**2 - 4*y**2)
same(function_range(sqrt(16 - x**2), x, Interval(0, 4)), Interval(0, 4)); same(f_e1.subs({x: 0, y: 0}), 4)
same([sqrt(16 - kv**2) for kv in range(5)], [4, sqrt(15), sqrt(12), sqrt(7), 0])
rounds(sqrt(15), '3.87'); rounds(sqrt(12), '3.46'); rounds(sqrt(7), '2.65')
same(f_e1.subs({x: sqrt(15), y: 0}), 1); same(f_e1.subs({x: 0, y: sqrt(15)/2}), 1)
gaps_ = [4 - sqrt(15), sqrt(15) - sqrt(12), sqrt(12) - sqrt(7), sqrt(7)]
rounds(gaps_[0], '0.13'); rounds(gaps_[1], '0.41'); rounds(gaps_[2], '0.82'); rounds(gaps_[3], '2.65')
holds(gaps_[0] < gaps_[1] < gaps_[2] < gaps_[3])
```
:::
::::

:::: exercise 偏导数 {#ex-17-2} ★
求所有一阶偏导数：

- (a) $f(x, y) = x^4y - 3x^2y^3 + 7$，及其在 $(1, -1)$ 处的值
- (b) $g(x, y) = \ln(x^2 + y^2)$
- (c) $h(x, y, z) = \dfrac{xy^2}{z}$

::: solution
**(a)** 保持 $y$ 固定， $f_x = 4x^3y - 6xy^3$；保持 $x$ 固定， $f_y = x^4 - 9x^2y^2$。在 $(1, -1)$： $f_x = -4 + 6 = 2$ 和 $f_y = 1 - 9 = -8$。

**(b)** 根据链式法则，内函数为 $x^2 + y^2$，导数为 $1/u$ 的 $\ln u$： $g_x = \dfrac{2x}{x^2 + y^2}$ 和 $g_y = \dfrac{2y}{x^2 + y^2}$，对于 $(x, y) \ne (0, 0)$。

**(c)** 对于 $z \ne 0$： $h_x = \dfrac{y^2}{z}$ 和 $h_y = \dfrac{2xy}{z}$，因为 $\dfrac{1}{z}$ 是 $z$ 固定时的常数因子；以及 $h_z = -\dfrac{xy^2}{z^2}$，常数 $xy^2$ 乘以 $\dfrac1z$ 的导数。使用商法则虽然可以得到相同答案，但需要更多步骤。

```check
f_e2 = x**4*y - 3*x**2*y**3 + 7
same(diff(f_e2, x), 4*x**3*y - 6*x*y**3); same(diff(f_e2, y), x**4 - 9*x**2*y**2)
same(diff(f_e2, x).subs({x: 1, y: -1}), 2); same(diff(f_e2, y).subs({x: 1, y: -1}), -8)
same(diff(log(x**2 + y**2), x), 2*x/(x**2 + y**2)); same(diff(log(x**2 + y**2), y), 2*y/(x**2 + y**2))
h_e2 = x*y**2/z
same(diff(h_e2, x), y**2/z); same(diff(h_e2, y), 2*x*y/z); same(diff(h_e2, z), -x*y**2/z**2)
```
:::
::::

:::: exercise 两个极限 {#ex-17-3} ★
- (a) 证明 $\lim_{(x, y)\to(0, 0)} \dfrac{x^2 - y^2}{x^2 + y^2}$ 不存在。
- (b) 求 $\lim_{(x, y)\to(0, 0)} \dfrac{x^2 + y^2}{\sqrt{x^2 + y^2 + 1} - 1}$。

::: solution
**(a)** 沿着 $x$ 轴（$y = 0$， $x \ne 0$）函数为 $\dfrac{x^2}{x^2} = 1$；沿着 $y$ 轴它为 $\dfrac{-y^2}{y^2} = -1$。两条路径给出不同的极限，因此根据定理 17.1 极限不存在。（沿 $y = mx$ 为 $\dfrac{1 - m^2}{1 + m^2}$，这取决于 $m$。）

**(b)** 直接代入得到 $\tfrac00$。函数仅通过 $s = x^2 + y^2$ 依赖于 $x$ 和 $y$，因此可以参照 [第 2.5 节](module_02_ZH.html#rationalise)：对于 $s > 0$，

$$\begin{aligned} \frac{s}{\sqrt{s + 1} - 1} &= \frac{s\big(\sqrt{s + 1} + 1\big)}{(s + 1) - 1} \\ &= \sqrt{s + 1} + 1. \end{aligned}$$

$(x, y) \to (0, 0)$, $s \to 0$, 和 $\sqrt{x^2 + y^2 + 1} + 1$ 在原点处连续且值为 2。极限为 2。

```check
f_e3 = (x**2 - y**2)/(x**2 + y**2)
same(f_e3.subs(y, 0), 1); same(f_e3.subs(x, 0), -1); same(simplify(f_e3.subs(y, m*x)), (1 - m**2)/(1 + m**2))
sp_ = symbols('s', positive=True)
steps(sp_/(sqrt(sp_ + 1) - 1), sp_*(sqrt(sp_ + 1) + 1)/((sp_ + 1) - 1), sqrt(sp_ + 1) + 1)
limit_is(s/(sqrt(s + 1) - 1), s, 0, 2, '+'); same((sqrt(x**2 + y**2 + 1) + 1).subs({x: 0, y: 0}), 2)
```
:::
::::

:::: exercise 梯度及其方向 {#ex-17-4} ★
设 $f(x, y) = x^2y - y^3$。

- (a) 求 $\nabla f(2, 1)$。
- (b) 求 $f$ 在 $(2, 1)$ 处沿 $\langle 1, -1\rangle$ 方向的方向导数。
- (c) $f$ 在 $(2, 1)$ 处哪个方向增加最快，速率是多少？速率为 0 的方向是哪些？

::: solution
**(a)** $f_x = 2xy$ 和 $f_y = x^2 - 3y^2$，所以 $\nabla f(2, 1) = \langle 4, 4 - 3\rangle = \langle 4, 1\rangle$。

**(b)** $\langle 1, -1\rangle$ 的长度为 $\sqrt2$，所以 $\vb{u} = \langle 1, -1\rangle/\sqrt2$，并且根据定理 17.9

$$D_{\vb{u}} f(2, 1) = \frac{4 \cdot 1 + 1 \cdot (-1)}{\sqrt2} = \frac{3}{\sqrt2} \approx 2.121.$$

使用 $\langle 1, -1\rangle$ 本身会得到 3，这是错误的：它不是单位法向量。

**(c)** 最快增加方向为 $\nabla f(2, 1)$，即 $\vb{u} = \langle 4, 1\rangle/\sqrt{17}$，速率为 $\norm{\langle 4, 1\rangle} = \sqrt{17} \approx 4.123$（定理 17.10）。速率为 0 的方向是梯度 $\pm\langle 1, -4\rangle/\sqrt{17}$ 垂直的两个方向，即通过 $(2, 1)$ 的等值线的切向方向：确实为 $\langle 4, 1\rangle\cdot\langle 1, -4\rangle = 4 - 4 = 0$。

```check
f_e4 = x**2*y - y**3
g_e4 = Matrix([diff(f_e4, x), diff(f_e4, y)]); same(g_e4, Matrix([2*x*y, x**2 - 3*y**2])); same(g_e4.subs({x: 2, y: 1}), Matrix([4, 1]))
G4 = Matrix([4, 1]); u4 = Matrix([1, -1])/sqrt(2)
same(G4.dot(u4), 3/sqrt(2)); rounds(3/sqrt(2), '2.121'); same(G4.dot(Matrix([1, -1])), 3)
same(G4.norm(), sqrt(17)); rounds(sqrt(17), '4.123'); same(G4.dot(Matrix([1, -4])), 0)
```
:::
::::

:::: exercise 通过夹逼法求极限 {#ex-17-5} ★★
证明 $\lim_{(x, y)\to(0, 0)} \dfrac{x^3 + y^3}{x^2 + y^2} = 0$。

::: solution
设 $(x, y) \ne (0, 0)$，并记 $\rho = \sqrt{x^2 + y^2}$ 为它到原点的距离。由于 $\abs{x} \le \rho$，有 $\abs{x^3} = \abs{x}\,x^2 \le \rho\,x^2$。同理有 $\abs{y^3} \le \rho\,y^2$。所以

$$\begin{aligned} \abs{\frac{x^3 + y^3}{x^2 + y^2}} &\le \frac{\abs{x^3} + \abs{y^3}}{x^2 + y^2} \\ &\le \frac{\rho\,(x^2 + y^2)}{x^2 + y^2} = \rho. \end{aligned}$$

由$(x, y) \to (0, 0)$、$\rho \to 0$，根据夹逼定理（定理17.2，其中$g = \rho$和$L = 0$）可知极限为0。检验路径仅能提示答案：沿$y = mx$函数为$\dfrac{(1 + m^3)x}{1 + m^2}$，其趋于0，但例17.3后的陷阱表明，仅凭直线无法证明任何结论。

```check
xr2, yr2 = symbols('x y', real=True)
rho_ = sqrt(xr2**2 + yr2**2)
holds(all(abs(((x**3 + y**3)/(x**2 + y**2)).subs({x: p_, y: q_})) <= sqrt(p_**2 + q_**2) for p_ in (Rational(1, 2), -3, Rational(2, 7)) for q_ in (-Rational(1, 3), 2, 5)))
same(Abs(xr2**3), Abs(xr2)*xr2**2); same(rho_**2 - xr2**2, yr2**2)                # |x^3| = |x| x^2, and |x| <= rho since rho^2 - x^2 = y^2 >= 0
same(Abs(yr2**3), Abs(yr2)*yr2**2); same(rho_**2 - yr2**2, xr2**2)
holds(rho_**2 - xr2**2 >= 0); holds(rho_**2 - yr2**2 >= 0)
same(simplify(((x**3 + y**3)/(x**2 + y**2)).subs(y, m*x)), (1 + m**3)*x/(1 + m**2)); limit_is((1 + m**3)*x/(1 + m**2), x, 0, 0)
same(rho_*(xr2**2 + yr2**2)/(xr2**2 + yr2**2), rho_)
```
:::
::::

:::: exercise 切平面与一个估计 {#ex-17-6} ★★
设 $f(x, y) = xe^{xy}$。

- (a) 求曲面 $z = f(x, y)$ 在 $(1, 0, 1)$ 处的切平面。
- (b) 使用线性近似估计 $f(1.1, -0.1)$，并与计算器上的值进行比较。

::: solution
**(a)** 根据乘积法则和链式法则，$f_x = e^{xy} + xye^{xy} = (1 + xy)e^{xy}$ 和 $f_y = x \cdot xe^{xy} = x^2e^{xy}$，两者在全平面连续。在 $(1, 0)$ 处：$f(1, 0) = 1$，$f_x(1, 0) = 1$ 和 $f_y(1, 0) = 1$。切平面为 $z = 1 + (x - 1) + (y - 0)$，即 $z = x + y$。

**(b)** $f(1.1, -0.1) \approx 1.1 + (-0.1) = 1$. 一台计算器给出 $1.1e^{-0.11} \approx 0.98542$，因此误差（精确值减去近似值）为 $1.1e^{-0.11} - 1 \approx -0.015$：估计值过高。该点到 $(1, 0)$ 的距离为 $\sqrt{0.1^2 + 0.1^2} \approx 0.14$。距离本身并不能说明线性近似有多准确；此处通过与计算值的比较显示出其准确性。

```check
f_e6 = x*exp(x*y)
same(diff(f_e6, x), (1 + x*y)*exp(x*y)); same(diff(f_e6, y), x**2*exp(x*y))
same([f_e6.subs({x: 1, y: 0}), diff(f_e6, x).subs({x: 1, y: 0}), diff(f_e6, y).subs({x: 1, y: 0})], [1, 1, 1])
same(expand(1 + (x - 1) + (y - 0)), x + y); same((x + y).subs({x: Rational(11, 10), y: -Rational(1, 10)}), 1)
same(f_e6.subs({x: Rational(11, 10), y: -Rational(1, 10)}), Rational(11, 10)*exp(-Rational(11, 100)))
rounds(f_e6.subs({x: Rational(11, 10), y: -Rational(1, 10)}), '0.98542'); rounds(Rational(11, 10)*exp(-Rational(11, 100)) - 1, '-0.015')
rounds(sqrt(Rational(2, 100)), '0.14')
```
:::
::::

:::: exercise 三个路径的链式法则 {#ex-17-7} ★★
设 $w = x^2 + yz$，其中 $x = t^2$， $y = \cos t$ 和 $z = \sin t$。

- (a) 画出树状图，并利用它将 $dw/dt$ 表示为 $t$ 的函数。
- (b) 通过代入进行验证。
- (c) 求 $dw/dt$ 在 $t = 0$ 和 $t = \pi/4$ 处的值。

::: solution
**(a)** 树状图顶部为 $w$，向下有三条分支分别到达 $x$， $y$ 和 $z$，分别标记为 $w_x = 2x$， $w_y = z$ 和 $w_z = y$，从这些点再向下各有一条分支到达 $t$，分别标记为 $dx/dt = 2t$， $dy/dt = -\sin t$ 和 $dz/dt = \cos t$。三条路径给出三个乘积：

$$\begin{aligned} \frac{dw}{dt} &= 2x\cdot 2t + z\cdot(-\sin t) + y\cos t \\ &= 4t^3 - \sin^2 t + \cos^2 t = 4t^3 + \cos 2t, \end{aligned}$$

模块 1 的加法公式，使用 $x = t^2$, $y = \cos t$, $z = \sin t$ 和 $\cos^2 t - \sin^2 t = \cos 2t$（两个角 $t$ 的加法公式）。

**(b)** $w = t^4 + \cos t\sin t = t^4 + \tfrac12\sin 2t$，因此 $\dfrac{dw}{dt} = 4t^3 + \cos 2t$，如 (a) 所示。

**(c)** 在 $t = 0$： $\dfrac{dw}{dt} = 0 + 1 = 1$。在 $t = \pi/4$： $4\Big(\dfrac{\pi}{4}\Big)^3 + \cos\dfrac{\pi}{2} = \dfrac{\pi^3}{16} \approx 1.938$。

```check
xw, yw, zw = t**2, cos(t), sin(t)
ww = x**2 + y*z
steps((diff(ww, x)*diff(xw, t) + diff(ww, y)*diff(yw, t) + diff(ww, z)*diff(zw, t)).subs({x: xw, y: yw, z: zw}), 4*t**3 - sin(t)**2 + cos(t)**2, 4*t**3 + cos(2*t))
same(ww.subs({x: xw, y: yw, z: zw}), t**4 + sin(2*t)/2); same(diff(t**4 + sin(2*t)/2, t), 4*t**3 + cos(2*t))
same((4*t**3 + cos(2*t)).subs(t, 0), 1); same((4*t**3 + cos(2*t)).subs(t, pi/4), pi**3/16); rounds(pi**3/16, '1.938')
```
:::
::::

:::: exercise 一个等值面 {#ex-17-8} ★★
点 $(1, 2, 3)$ 位于曲面 $xyz = 6$ 上。

- (a) 求该曲面在该点的切平面。
- (b) 在 $(1, 2, 3)$ 附近，曲面是函数 $z(x, y)$ 的图像。通过隐函数求导，求 $\partial z/\partial x$ 和 $\partial z/\partial y$ 在 $(1, 2)$ 处的值。
- (c) 用两种方法验证 (b)：使用 (a) 的切平面，以及通过求解 $z$ 来验证。

::: solution
**(a)** 用 $F(x, y, z) = xyz$， $\nabla F = \langle yz, xz, xy\rangle$，因此 $\nabla F(1, 2, 3) = \langle 6, 3, 2\rangle$。切平面为

$$\begin{aligned} 6(x - 1) + 3(y - 2) + 2(z - 3) &= 0, \\ \text{that is,}\quad 6x + 3y + 2z &= 18. \end{aligned}$$

**(b)** $F_z(1, 2, 3) = 2 \ne 0$，因此 $\dfrac{\partial z}{\partial x} = -\dfrac{F_x}{F_z} = -\dfrac62 = -3$ 和 $\dfrac{\partial z}{\partial y} = -\dfrac{F_y}{F_z} = -\dfrac32$。

**(c)** 解出 $z$，切平面为 $z = 9 - 3x - \tfrac32 y$，其斜率为 $-3$ 和 $-\tfrac32$。并且 $z = \dfrac{6}{xy}$，所以在 $(1, 2)$ 处， $z_x = -\dfrac{6}{x^2y} = -\dfrac62 = -3$ 和 $z_y = -\dfrac{6}{xy^2} = -\dfrac64 = -\dfrac32$。

```check
F_e8 = x*y*z; P8 = {x: 1, y: 2, z: 3}
same(F_e8.subs(P8), 6)
g8 = Matrix([diff(F_e8, v_) for v_ in (x, y, z)]); same(g8, Matrix([y*z, x*z, x*y])); same(g8.subs(P8), Matrix([6, 3, 2]))
same(expand(6*(x - 1) + 3*(y - 2) + 2*(z - 3)), 6*x + 3*y + 2*z - 18)
same((-g8[0]/g8[2]).subs(P8), -3); same((-g8[1]/g8[2]).subs(P8), -Rational(3, 2))
same(solve(6*x + 3*y + 2*z - 18, z), [9 - 3*x - Rational(3, 2)*y])
zf8 = 6/(x*y); same(diff(zf8, x), -6/(x**2*y)); same(diff(zf8, y), -6/(x*y**2))
same(diff(zf8, x).subs({x: 1, y: 2}), -3); same(diff(zf8, y).subs({x: 1, y: 2}), -Rational(3, 2))
```
:::
::::

:::: exercise 拉普拉斯方程 {#ex-17-9} ★★
证明 $u(x, y) = \ln(x^2 + y^2)$ 满足拉普拉斯方程 $u_{xx} + u_{yy} = 0$ 对于 $(x, y) \ne (0, 0)$，并验证 $u_{xy} = u_{yx}$。

::: solution
由练习 17.2(b)， $u_x = \dfrac{2x}{x^2 + y^2}$ 和 $u_y = \dfrac{2y}{x^2 + y^2}$。根据商法则，保持 $y$ 不变，

$$\begin{aligned} u_{xx} &= \frac{2(x^2 + y^2) - 2x\cdot 2x}{(x^2 + y^2)^2} \\ &= \frac{2(y^2 - x^2)}{(x^2 + y^2)^2}, \end{aligned}$$

同样地，保持 $x$ 不变， $u_{yy} = \dfrac{2(x^2 - y^2)}{(x^2 + y^2)^2}$。两者相消： $u_{xx} + u_{yy} = 0$。

对于混合偏导数，当 $x$ 保持不变时， $u_x$ 的分子 $2x$ 是常数，因此

$$u_{xy} = 2x\cdot\frac{-2y}{(x^2 + y^2)^2} = -\frac{4xy}{(x^2 + y^2)^2},$$

同样地， $u_{yx} = 2y\cdot\dfrac{-2x}{(x^2 + y^2)^2} = -\dfrac{4xy}{(x^2 + y^2)^2}$。它们相等，正如克莱因定理所预测的：两者在原点以外都是连续的。

```check
uL = log(x**2 + y**2)
steps(diff(uL, x, 2), (2*(x**2 + y**2) - 2*x*2*x)/(x**2 + y**2)**2, 2*(y**2 - x**2)/(x**2 + y**2)**2)
same(diff(uL, y, 2), 2*(x**2 - y**2)/(x**2 + y**2)**2); same(diff(uL, x, 2) + diff(uL, y, 2), 0)
steps(diff(uL, x, y), 2*x*(-2*y)/(x**2 + y**2)**2, -4*x*y/(x**2 + y**2)**2); same(diff(uL, y, x), -4*x*y/(x**2 + y**2)**2)
```
:::
::::

:::: exercise 当克莱因定理不适用时 {#ex-17-10} ★★★
设 $f(x, y) = \dfrac{xy(x^2 - y^2)}{x^2 + y^2}$ 对于 $(x, y) \ne (0, 0)$，且 $f(0, 0) = 0$.

- (a) 证明 $f_x(0, y) = -y$ 对于每一个 $y$，并且 $f_y(x, 0) = x$ 对于每一个 $x$。
- (b) 推导出 $f_{xy}(0, 0) = -1$ 和 $f_{yx}(0, 0) = 1$。
- (c) 哪个克莱因定理的假设不成立？

::: solution
**(a)** 固定 $y \ne 0$。由于 $f(0, y) = 0$，定义给出

$$\begin{aligned} f_x(0, y) &= \lim_{h\to0}\frac{f(h, y) - 0}{h} = \lim_{h\to0}\frac{y(h^2 - y^2)}{h^2 + y^2} \\ &= \frac{y(-y^2)}{y^2} = -y, \end{aligned}$$

通过直接代入，由于分母趋于 $y^2 \ne 0$。对于 $y = 0$： $f(h, 0) = 0$ 对于每一个 $h$，因此 $f_x(0, 0) = 0 = -0$。所以 $f_x(0, y) = -y$ 对于每一个 $y$。同样地，对于 $x \ne 0$，由于 $f(x, 0) = 0$，

$$\begin{aligned} f_y(x, 0) &= \lim_{h\to0}\frac{f(x, h)}{h} \\ &= \lim_{h\to0}\frac{x(x^2 - h^2)}{x^2 + h^2} = x, \end{aligned}$$

并且 $f_y(0, 0) = 0$ 因为 $f(0, h) = 0$。因此 $f_y(x, 0) = x$ 对于每一个 $x$。

**(b)** $f_{xy}(0, 0)$ 是 $y \mapsto f_x(0, y) = -y$ 在 $y = 0$ 处的导数，即 $-1$。 $f_{yx}(0, 0)$ 是 $x \mapsto f_y(x, 0) = x$ 在 $x = 0$ 处的导数，即 $1$。

**(c)** 克莱因定理需要 $f_{xy}$ 和 $f_{yx}$ 在原点附近的一个圆盘上连续。它们不能同时连续，否则定理会使它们在该区域相等。事实上，对于 $(x, y) \ne (0, 0)$，规则给出

$$f_{xy} = \frac{x^6 + 9x^4y^2 - 9x^2y^4 - y^6}{(x^2 + y^2)^3},$$

该点在 $x$ 轴上为 1，在 $-1$ 轴上距离原点 $y$ 的位置，因此在该点处无极限。函数本身是连续的：由于 $\abs{x^2 - y^2} \le x^2 + y^2$，它在原点处被 $\abs{f} \le \abs{xy} \to 0$ 夹逼。它在所有点处都有一阶偏导数；混合偏导数的连续性是失败的假设。

```check
fC = x*y*(x**2 - y**2)/(x**2 + y**2)
same(simplify(fC.subs(x, h)/h), y*(h**2 - y**2)/(h**2 + y**2)); limit_is(y*(h**2 - y**2)/(h**2 + y**2), h, 0, -y)
same(fC.subs({x: h, y: 0}), 0); same(fC.subs({x: 0, y: h}), 0)
same(simplify(fC.subs(y, h)/h), x*(x**2 - h**2)/(x**2 + h**2)); limit_is(x*(x**2 - h**2)/(x**2 + h**2), h, 0, x)
same(diff(-y, y), -1); same(diff(x, x), 1)
same(diff(fC, x, y), (x**6 + 9*x**4*y**2 - 9*x**2*y**4 - y**6)/(x**2 + y**2)**3)
same(diff(fC, x, y).subs(y, 0), 1); same(diff(fC, x, y).subs(x, 0), -1)
same(Abs(xr*yr) - Abs(fC.subs({x: xr, y: yr})), Abs(xr*yr)*(1 - Abs(xr**2 - yr**2)/(xr**2 + yr**2)))
same(expand((xr**2 + yr**2)**2 - (xr**2 - yr**2)**2), 4*xr**2*yr**2)
holds(4*xr**2*yr**2 >= 0)                                              # |x^2 - y^2| <= x^2 + y^2 for all real x, y
holds(all(abs(fC.subs({x: p_, y: q_})) <= abs(p_*q_) for p_ in (Rational(1, 2), -3, 2) for q_ in (Rational(1, 3), 1, -4)))
```
:::
::::

:::: exercise 通过共享权重的反向传播 {#ex-17-11} ★★★
循环网络应用相同的步骤两次，使用相同的参数 $w$ 和 $b$：从输入 $x$ 计算 $h_1 = wx + b$，然后 $h_2 = wh_1 + b$，其损失为 $L = (h_2 - t)^2$，以目标 $t$ 为基准。

- (a) 画出计算图，并标出其局部导数。哪些节点有两个子节点？
- (b) 使用 $x = 1$、$t = 5$、$w = 2$ 和 $b = 1$，进行一次前向传播和一次反向传播，以求得 $\partial L/\partial w$ 和 $\partial L/\partial b$。
- (c) 通过将 $L$ 表示为 $w$ 和 $b$ 的函数并求导来验证。
- (d) 使用 $\eta = 0.01$ 进行一次梯度下降步骤。损失是否减少？

::: solution
**(a)** 节点是 $w$, $b$, $h_1 = wx + b$, $h_2 = wh_1 + b$ 和 $L = (h_2 - t)^2$；输入 $x$ 和 目标 $t$ 是 常量。箭头运行 $w \to h_1$ 和 $b \to h_1$； $w \to h_2$, $b \to h_2$ 和 $h_1 \to h_2$； 和 $h_2 \to L$。参数 $w$ 和 $b$ 每个都有两个子节点 $h_1$ 和 $h_2$，因为它们在两个步骤中都被使用。局部导数是 $\partial h_1/\partial w = x$, $\partial h_1/\partial b = 1$, $\partial h_2/\partial w = h_1$, $\partial h_2/\partial b = 1$, $\partial h_2/\partial h_1 = w$ 和 $\partial L/\partial h_2 = 2(h_2 - t)$。

**(b)** 前向： $h_1 = 2 \cdot 1 + 1 = 3$, $h_2 = 2 \cdot 3 + 1 = 7$ 和 $L = (7 - 5)^2 = 4$。后向： $\bar L = 1$； $\bar h_2 = \bar L \cdot 2(h_2 - t) = 4$； $\bar h_1 = \bar h_2 \cdot w = 8$。每个参数将其两个子节点的贡献相加：

$$\begin{aligned} \bar w &= \bar h_2 \cdot h_1 + \bar h_1 \cdot x = 4 \cdot 3 + 8 \cdot 1 = 20, \\ \bar b &= \bar h_2 \cdot 1 + \bar h_1 \cdot 1 = 4 + 8 = 12. \end{aligned}$$

所以 $\partial L/\partial w = 20$ 和 $\partial L/\partial b = 12$。

**(c)** $h_2 = w(wx + b) + b = w^2x + wb + b$，所以 $L = (w^2x + wb + b - t)^2$，并且根据链式法则

$$\begin{aligned} L_w &= 2(h_2 - t)(2wx + b) = 2 \cdot 2 \cdot 5 = 20, \\ L_b &= 2(h_2 - t)(w + 1) = 2 \cdot 2 \cdot 3 = 12. \end{aligned}$$

**(d)** $\langle w, b\rangle = \langle 2, 1\rangle - 0.01\,\langle 20, 12\rangle = \langle 1.8, 0.88\rangle$。然后 $h_1 = 1.8 + 0.88 = 2.68$, $h_2 = 1.8 \cdot 2.68 + 0.88 = 5.704$, 和 $L = 0.704^2 \approx 0.496$：损失值从 4 下降了。

```check
wv, bv, xv, tv = 2, 1, 1, 5
h1v = wv*xv + bv; h2v = wv*h1v + bv; Lv = (h2v - tv)**2
same([h1v, h2v, Lv], [3, 7, 4])
hb2 = 2*(h2v - tv); hb1 = hb2*wv; same([hb2, hb1], [4, 8])
steps(hb2*h1v + hb1*xv, 4*3 + 8*1, 20); steps(hb2 + hb1, 4 + 8, 12)
Ws, Bs = symbols('w b')
Ls11 = (Ws*(Ws*xv + Bs) + Bs - tv)**2
same(expand(Ws*(Ws*x + Bs) + Bs), Ws**2*x + Ws*Bs + Bs)
same(diff(Ls11, Ws), 2*(Ws**2*xv + Ws*Bs + Bs - tv)*(2*Ws*xv + Bs)); same(diff(Ls11, Bs), 2*(Ws**2*xv + Ws*Bs + Bs - tv)*(Ws + 1))
same([diff(Ls11, Ws).subs({Ws: 2, Bs: 1}), diff(Ls11, Bs).subs({Ws: 2, Bs: 1})], [20, 12])
w1, b1 = 2 - Rational(1, 100)*20, 1 - Rational(1, 100)*12; same([w1, b1], [Rational(18, 10), Rational(88, 100)])
same(w1*xv + b1, Rational(268, 100)); same(w1*(w1*xv + b1) + b1, Rational(5704, 1000)); rounds(Ls11.subs({Ws: w1, Bs: b1}), '0.496')
```
:::
::::

## 自测 {#quiz}

```quiz
? $f(x, y) = x^2 + 4y^2$ 的水平集，对于其值域中的值，是
- [ ] 以原点为中心的圆
- [ ] 抛物线
- [x] 以原点为中心的椭圆，以及单点 $(0, 0)$
- [ ] 通过原点的直线
> 对于 $k > 0$， $x^2 + 4y^2 = k$ 是一个椭圆，它沿 $x$ 轴达到 $\sqrt k$，但在 $y$ 轴上仅达到 $\sqrt k/2$；对于 $k = 0$，它仅包含原点。它们不是圆，因为两个半轴长度不同。两个平方项都有正系数，因此得到的是这些椭圆，而不是抛物线或直线。

? 对于 $f(x, y) = x^2y^3$， $f_x$ 是
- [x] $2xy^3$
- [ ] $3x^2y^2$
- [ ] $2xy^3 + 3x^2y^2$
- [ ] $6xy^2$
> 固定 $y$： $y^3$ 是一个常数因子， $x^2$ 的导数是 $2x$。 $3x^2y^2$ 是 $f_y$； $2xy^3 + 3x^2y^2$ 对两个变量同时求导； $6xy^2$ 是混合偏导数 $f_{xy}$。

? 沿着直线 $y = 2x$，带 $x \ne 0$，函数 $\dfrac{xy}{x^2 + y^2}$ 等于
- [ ] $\dfrac12$
- [x] $\dfrac25$
- [ ] $0$
- [ ] $2$
> $\dfrac{x \cdot 2x}{x^2 + 4x^2} = \dfrac{2x^2}{5x^2} = \dfrac25$. $\tfrac12$ 是沿 $y = x$ 的值，而 0 是沿坐标轴的值；由于不同的直线给出不同的值，函数在原点处没有极限。2 是直线的斜率，不是函数的值。

? 在 $(1, 2, 5)$ 处，曲面 $z = x^2 + y^2$ 的切平面是
- [ ] $z = 2x + 4y$
- [ ] $z = 5 + 2x + 4y$
- [ ] $z = 5 + 2x(x - 1) + 2y(y - 2)$
- [x] $z = 5 + 2(x - 1) + 4(y - 2)$
> $f_x = 2x$ 和 $f_y = 2y$ 在 $(1, 2)$ 处分别为 2 和 4，因此平面是 $z = f(1, 2) + 2(x - 1) + 4(y - 2)$。 $z = 2x + 4y$ 的斜率正确，但在 $(1, 2)$ 处高度为 10，不是 5； $z = 5 + 2x + 4y$ 忘记了减去 $a$ 和 $b$；第三个保持了 $f_x = 2x$ 和 $f_y = 2y$，但未在该点进行计算，因此不是一个平面。

? $f$ 在 $\nabla f = \langle 3, -4\rangle$ 处可微。哪一项是正确的？
- [ ] 那里的最大方向导数是 7。
- [ ] $f$ 在 $\langle -3, 4\rangle/5$ 方向增长最快。
- [x] 那里的最大方向导数是 5，方向为 $\langle 3, -4\rangle/5$。
- [ ] $D_{\vb{u}} f = 0$ 对 $\vb{u} = \langle 3, -4\rangle/5$。
> 最大速率为$\norm{\nabla f} = \sqrt{9 + 16} = 5$，方向为$\nabla f$（定理17.10）。7将各分量的大小相加而非取长度；$\langle -3, 4\rangle/5$是最快减少的方向；而在与$\nabla f$垂直的方向$\pm\langle 4, 3\rangle/5$上，速率为0，而非沿其方向。

? 克莱罗定理说明当 $f_{xy}(a, b) = f_{yx}(a, b)$ 满足
- [x] $f_{xy}$ 和 $f_{yx}$ 在以 $(a, b)$ 为中心的开圆盘上连续
- [ ] $f_x$ 和 $f_y$ 在 $(a, b)$ 处存在
- [ ] $f$ 在 $(a, b)$ 处连续
- [ ] 没有更多要求：它对所有函数都成立
> 假设是混合偏导数在该点附近连续。 $f_x$ 和 $f_y$ 的存在，以及 $f$ 的连续性，并不足以保证结论成立：练习 17.10 中的函数是连续的，在所有点都有两个一阶偏导数，并且有 $f_{xy}(0, 0) = -1$ 但没有 $f_{yx}(0, 0) = 1$。

? 从 $(1, 2)$ 出发，以 $\eta = 0.25$ 为步长进行一次梯度下降在 $f(x, y) = x^2 + y^2$ 上得到
- [ ] $(1.5, 3)$
- [x] $(0.5, 1)$
- [ ] $(0.75, 1.75)$
- [ ] $(0, 0)$
> $\nabla f(1, 2) = \langle 2, 4\rangle$, 所以新的点是 $(1, 2) - 0.25\,\langle 2, 4\rangle = (0.5, 1)$。 $(1.5, 3)$ 添加 $\eta\nabla f$ 并向上爬； $(0.75, 1.75)$ 减去 $\eta$ 本身而不是 $\eta\nabla f$； $(0, 0)$，即最小值，是用 $\eta = 0.5$ 一步就能到达的地方。

? 在反向传播中，一个值被两个后续节点 $c_1$ 和 $c_2$ 使用的节点 $v$ 会获得对应的共轭量
- [ ] $\bar c_1\,\dfrac{\partial c_1}{\partial v}\cdot\bar c_2\,\dfrac{\partial c_2}{\partial v}$
- [ ] $\bar c_1$ 和 $\bar c_2$ 中较大的那个
- [ ] $\bar c_1\,\dfrac{\partial c_1}{\partial v}$ 仅来自两个子节点中的第一个
- [x] $\bar c_1\,\dfrac{\partial c_1}{\partial v} + \bar c_2\,\dfrac{\partial c_2}{\partial v}$
> $L$ 通过 $c_1$ 和 $c_2$ 两个路径依赖于 $v$，链式法则为每个路径添加一项，如同树状图所示。相乘两个项、取较大共轭量或仅保留一项都会丢失部分依赖关系。
```

```check
same((x**2 + 4*y**2).subs({x: sqrt(k), y: 0}), k); same((x**2 + 4*y**2).subs({x: 0, y: sqrt(k)/2}), k)
same(diff(x**2*y**3, x), 2*x*y**3); same(diff(x**2*y**3, y), 3*x**2*y**2); same(diff(x**2*y**3, x, y), 6*x*y**2)
same((x*y/(x**2 + y**2)).subs(y, 2*x), Rational(2, 5))
pl_ = 5 + 2*(x - 1) + 4*(y - 2); same(pl_.subs({x: 1, y: 2}), 5); same((2*x + 4*y).subs({x: 1, y: 2}), 10)
same([diff(x**2 + y**2, x).subs({x: 1, y: 2}), diff(x**2 + y**2, y).subs({x: 1, y: 2})], [2, 4]); same((x**2 + y**2).subs({x: 1, y: 2}), 5)
same(Matrix([3, -4]).norm(), 5); same(Matrix([3, -4]).dot(Matrix([4, 3])), 0)
same(Matrix([1, 2]) - Rational(1, 4)*Matrix([2, 4]), Matrix([Rational(1, 2), 1])); same(Matrix([1, 2]) - Rational(1, 2)*Matrix([2, 4]), Matrix([0, 0]))
```
