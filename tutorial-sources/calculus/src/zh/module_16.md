---
title: 曲线与向量
part: 5
lead: 用动点和极坐标描述曲线，求斜率、弧长和面积。接着用平面与空间中的向量描述直线、平面以及沿曲线的运动，为多元微积分打下基础。
minutes: 270
needs: 模块 1 到 15，特别是链式法则（模块 5）、反函数的导数（模块 6）、闭区间方法（模块 8）、替换法（模块 10）和弧长（模块 12）
goals:
  - 用参数方程和极坐标描述曲线，并在不同描述之间进行转换
  - 求参数曲线的切线和弧长，以及极坐标曲线的斜率和面积
  - 在平面和空间中进行向量运算，包括长度、角度、投影以及点积和叉积
  - 在空间中写出直线和平面的方程，并求点到平面的距离
  - 对向量函数进行求导和积分，以求速度、加速度和空间曲线的长度
  - 模拟抛射运动，并求出获得最大射程的发射角
---

## 参数曲线 {#parametric}

到目前为止，该系列中的曲线大多为函数的图像，$y = f(x)$。许多曲线并非如此：圆不满足[小节 1.3](module_01_ZH.html#graphs)中的竖直线检验，卫星的轨道和滚动轮上一点的轨迹也是如此。诸如圆的方程$x^2 + y^2 = 25$（[小节 6.4](module_06_ZH.html#implicit)）说明了此类曲线的位置，但未说明点如何沿其运动。本模块以物理学描述运动的方式描述曲线：通过移动点在每个时间$t$的位置。

假设一个点运动，使得在时间 $t$ 时它位于 $x = t^2$, $y = t^3 - 3t$。它在一些时间点的位置如下：

```valuetable
t = -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2
$x = t^2$ = t**2
$y = t^3 - 3t$ = t**3 - 3*t
---
t | x = t^2 | y = t^3 - 3t
-2 | 4 | -2
-1.5 | 2.25 | 1.125
-1 | 1 | 2
-0.5 | 0.25 | 1.375
0 | 0 | 0
0.5 | 0.25 | -1.375
1 | 1 | -2
1.5 | 2.25 | -1.125
2 | 4 | 2
```

按照 $t$ 的顺序绘制这些点并连接起来（图 16.1，左图）。该点从右下方向来，在 $t = -2$ 时位于 $(4, -2)$，然后上升到 $(1, 2)$ 时的 $t = -1$。之后它转向，经过原点 $t = 0$ 在 $(1, -2)$ 时到达 $t = 1$，再次转向并向上移动至 $(4, 2)$。在移动过程中，它在 $(3, 0)$ 处两次经过，分别在 $t = -\sqrt3$ 和 $t = \sqrt3$ 时，因为之后 $x = 3$ 和 $y = t(t^2 - 3) = 0$。这条曲线不是 $x$ 的函数图像：垂直线 $x = 1$ 与它在 $(1, 2)$ 和 $(1, -2)$ 处相交。

```check
xq1, yq1 = t**2, t**3 - 3*t
same([(xq1.subs(t, v), yq1.subs(t, v)) for v in (-2, -1, 0, 1, 2)], [(4, -2), (1, 2), (0, 0), (1, -2), (4, 2)])
same(yq1, t*(t**2 - 3)); same_set(solve(xq1 - 3, t), [sqrt(3), -sqrt(3)])
same([yq1.subs(t, v) for v in (sqrt(3), -sqrt(3))], [0, 0])
same_set(solve(diff(yq1, t), t), [-1, 1])             # where y(t) turns: t = -1 and t = 1
holds(diff(yq1, t, 2).subs(t, -1) < 0); holds(diff(yq1, t, 2).subs(t, 1) > 0)
```

::: figure id=fig-16-1
左：曲线 $x = t^2$, $y = t^3 - 3t$ 对于 $-2 \le t \le 2$，表格中的点位于整数 $t$ 处；箭头表示 $t$ 增加的方向。它在 $(3, 0)$ 处自交，此处有两个切线（虚线；例 16.3）。右：函数 $x(t) = t^2$ 和 $y(t) = t^3 - 3t$ 对 $t$ 的图，这是构成曲线的两个函数。
:::

::: definition 参数曲线
设 $f$ 和 $g$ 是区间 $I$ 上的连续函数。随着 $t$ 取遍 $I$，点 $\big(f(t), g(t)\big)$ 描绘出一条**参数曲线**，由下列**参数方程**给出：

$$x = f(t), \qquad y = g(t).$$

变量 $t$ 称为**参数**。若 $I = [a, b]$，则曲线从**起点**$\big(f(a), g(a)\big)$ 出发，在**终点** $\big(f(b), g(b)\big)$ 结束。
:::

参数通常是时间，但不一定是：在第16.3节中，它是角度。方程 $x = f(t)$, $y = g(t)$ 描绘一条给定曲线，这是它的 **参数化**，当 $t$ 增加时点的运动方向是曲线的 **方向**，在图中用箭头表示。

::: example 圆和椭圆
描述 $0 \le t \le 2\pi$ 由 (a) $x = \cos t$, $y = \sin t$；(b) $x = 3\cos t$, $y = 2\sin t$；(c) $x = \cos 2t$, $y = \sin 2t$；(d) $x = \sin t$, $y = \cos t$ 所描绘的曲线。

**(a)** 根据[第1.4节](module_01_ZH.html#trig)中正弦和余弦的定义，$(\cos t, \sin t)$ 是角度为 $t$ 的单位圆上的点。因此，当 $t$ 从 0 变到 $2\pi$ 时，该点沿单位圆逆时针方向绕行一周，从 $(1, 0)$ 回到 $(1, 0)$。每个点都满足 $x^2 + y^2 = \cos^2 t + \sin^2 t = 1$。

**(b)** 此处 $x/3 = \cos t$ 和 $y/2 = \sin t$，所以

$$\frac{x^2}{9} + \frac{y^2}{4} = \cos^2 t + \sin^2 t = 1.$$

这是一个 **椭圆**：单位圆在水平方向被拉伸了 3 倍，在垂直方向被拉伸了 2 倍（[小节 1.5](module_01_ZH.html#transformations)）。它在 $x$轴上交于 $\pm3$，在 $y$轴上交于 $\pm2$，并且点从 $(3, 0)$出发逆时针绕行一周。一般来说，对于 $a, b > 0$, $x = a\cos t$, $y = b\sin t$ 描绘出椭圆 $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$；当 $a = b = r$时，它是以原点为中心、半径为 $r$的圆。

**(c)** 再次 $x^2 + y^2 = 1$，但点在角度 $2t$：它绕单位圆的速度是两倍，且 $t$ 从 0 到 $2\pi$。

**(d)**Again $x^2 + y^2 = \sin^2 t + \cos^2 t = 1$. 点从 $(0, 1)$ 开始，当 $t = 0$ 时，到达 $(1, 0)$，当 $t = \pi/2$ 时：它沿圆** 顺时针 ** 绕行一周，从顶部开始。

因此，一条曲线可以有多种参数化方式，它们在起始点、速度和方向上有所不同。

```check
same(cos(t)**2 + sin(t)**2, 1); same((cos(0), sin(0)), (1, 0)); same((cos(2*pi), sin(2*pi)), (1, 0)); same((cos(pi/2), sin(pi/2)), (0, 1))
same((3*cos(t))**2/9 + (2*sin(t))**2/4, 1); same((3*cos(0), 2*sin(0)), (3, 0)); same((3*cos(pi/2), 2*sin(pi/2)), (0, 2))
ap_, bp_, rp_ = symbols('a b r', positive=True)
same((ap_*cos(t))**2/ap_**2 + (bp_*sin(t))**2/bp_**2, 1); same((rp_*cos(t))**2 + (rp_*sin(t))**2, rp_**2)
same(cos(2*t)**2 + sin(2*t)**2, 1); same((cos(2*2*pi), sin(2*2*pi)), (1, 0)); same((cos(2*pi/2), sin(2*pi/2)), (-1, 0))
same(sin(t)**2 + cos(t)**2, 1); same((sin(0), cos(0)), (0, 1)); same((sin(pi/2), cos(pi/2)), (1, 0)); same((sin(pi), cos(pi)), (0, -1))
```
:::

::: pitfall
不要将曲线与 $x(t)$ 和 $y(t)$ 的图（图 16.1，右）混淆。那些图的横轴是 $t$；该曲线位于 $xy$ 平面，其中 $t$ 不是坐标，而是其点上的标签。
:::

### 消去参数 {#eliminating}

要识别参数曲线，需寻找其点所满足的仅含$x$和$y$的方程。即**消去参数**：从一个方程解出$t$并代入另一个，或联立两方程使$t$消失，如同例16.1中$\cos^2 t + \sin^2 t = 1$的做法。

::: example 消去参数
消去参数，并描述每条曲线，对于所有实数 $t$：(a) $x = 1 + 2t$, $y = 3 - t$；(b) $x = t^2$, $y = t^3 - 3t$；(c) $x = e^t$, $y = e^{2t}$。

**(a)** 解第一个方程求 $t$： $t = (x - 1)/2$。代入第二个方程：

$$y = 3 - \frac{x - 1}{2} = \frac{7 - x}{2}.$$

曲线是通过点 $(1, 3)$（位于 $t = 0$ 的点）的斜率为 $-\tfrac12$ 的直线，当 $t$ 遍历 $\R$ 时， $x = 1 + 2t$ 也随之遍历，因此整条直线从左到右被描绘出来。

**(b)** 解方程 $x = t^2$ 得到 $t$ 的两个解 $t = \pm\sqrt{x}$。相反，平方 $y$：

$$y^2 = t^2\big(t^2 - 3\big)^2 = x(x - 3)^2.$$

反之，每一个具有 $y^2 = x(x - 3)^2$ 的点都在曲线上：这样的点满足 $x \ge 0$（对于 $x < 0$，右边为负），并且其两个可能的值 $y = \pm\sqrt{x}\,(x - 3)$ 来自 $t = \sqrt x$ 和 $t = -\sqrt x$。因此，曲线恰好是 $y^2 = x(x - 3)^2$；图 16.1 显示了其 $-2 \le t \le 2$ 部分。

**(c)** $y = e^{2t} = \big(e^t\big)^2 = x^2$。但 $x = e^t$ 始终为正，并且取所有正数值。因此，曲线只是抛物线 $y = x^2$ 的右半部分，即 $x > 0$ 的部分：原点和左半部分从未被达到。

```check
same(solve(Eq(x, 1 + 2*t), t), [(x - 1)/2]); same((3 - t).subs(t, (x - 1)/2), (7 - x)/2); same(((7 - x)/2).subs(x, 1), 3)
steps((t**3 - 3*t)**2, t**2*(t**2 - 3)**2, (t**2)*((t**2) - 3)**2)
xn_ = symbols('x', negative=True); holds(xn_*(xn_ - 3)**2 < 0)
xnn_ = symbols('x', nonnegative=True)
same((t*(t**2 - 3)).subs(t, sqrt(xnn_)), sqrt(xnn_)*(xnn_ - 3)); same((t*(t**2 - 3)).subs(t, -sqrt(xnn_)), -sqrt(xnn_)*(xnn_ - 3))
same((sqrt(xnn_)*(xnn_ - 3))**2, xnn_*(xnn_ - 3)**2)
tr16 = symbols('t', real=True)
same(exp(2*tr16), exp(tr16)**2); same(function_range(exp(x), x, S.Reals), Interval.open(0, oo))
```
:::

::: pitfall
消除参数会忽略曲线的哪些部分被描绘以及如何描绘。例如 16.2(c) 中的方程 $y = x^2$ 描述的是整个抛物线，但点只到达其右半部分。曲线 $x = \sin t$、$y = \sin^2 t$ 也满足 $y = x^2$，但它却在 $(-1, 1)$ 到 $(1, 1)$ 弧段上无限来回移动。消去参数 $t$ 后，始终要检查 $x$ 和 $y$ 可取的值。

```check
same(sin(t)**2, (sin(t))**2); same(function_range(sin(x), x, S.Reals), Interval(-1, 1))
same((sin(-pi/2), sin(-pi/2)**2), (-1, 1)); same((sin(pi/2), sin(pi/2)**2), (1, 1))
```
:::

### 摆线 {#cycloid}

一个 **摆线** 是一个轮子沿直线滚动时，轮缘上一点所描绘的曲线：从侧面看自行车轮上的反光片所形成的曲线。它在 $x$ 和 $y$ 中没有简单的方程，但其参数方程可由一个关于滚动的事实推导出来。

一个半径为 $r > 0$ 的圆沿 $x$ 轴向右滚动，不打滑，设 $P$ 是圆上初始时接触原点的点。取参数为圆转过的角度 $t$（以弧度为单位）。滚动不打滑意味着圆上接触地面的弧长等于圆所滚过的地面距离。半径为 $r$ 的圆上角度为 $t$ 的弧长为 $rt$，因此圆滚动的距离为 $rt$：其圆心位于 $C = (rt, r)$，在接触点 $T = (rt, 0)$ 上方（图 16.2）。

$P$ 在哪里？从 $C$ 看，它最初在角度 $-\pi/2$ 处直下，圆向右滚动并顺时针旋转，因此在转过 $t$ 后，点 $P$ 处于角度 $-\pi/2 - t$。根据正弦和余弦的定义，它相对于 $C$ 的位移为

$$\Big(r\cos\big(-\tfrac{\pi}{2} - t\big),\ r\sin\big(-\tfrac{\pi}{2} - t\big)\Big) = (-r\sin t,\ -r\cos t).$$

对于 $0 < t < \pi/2$，如图 16.2 所示，它位于 $C$ 左侧 $r\sin t$ 处，下方 $r\cos t$。加上 $C = (rt, r)$：

$$x = r(t - \sin t), \qquad y = r(1 - \cos t).$$

当 $t$ 从 0 变到 $2\pi$ 时，$P$ 描绘出一个 cycloid 的一个 **弧**：从原点上升到最高点 $(\pi r, 2r)$，位于 $t = \pi$ 处，再下降至 $(2\pi r, 0)$，再次触地。整个 cycloid 是这样一些弧的连续排列，每个 $2\pi r$ 宽，$2r$ 高。

```check
same(cos(-pi/2 - t), -sin(t)); same(sin(-pi/2 - t), -cos(t))
cyx, cyy = r*(t - sin(t)), r*(1 - cos(t))
same(cyx, r*t - r*sin(t)); same(cyy, r - r*cos(t))
same((cyx.subs(t, 0), cyy.subs(t, 0)), (0, 0)); same((cyx.subs(t, pi), cyy.subs(t, pi)), (pi*r, 2*r))
same((cyx.subs(t, 2*pi), cyy.subs(t, 2*pi)), (2*pi*r, 0))
same(maximum(1 - cos(x), x, Interval(0, 2*pi)), 2); same(solve(1 - cos(x), x), [0, 2*pi])
same(cyx.subs(t, t + 2*pi) - cyx, 2*pi*r); same(cyy.subs(t, t + 2*pi), cyy)
```

::: figure id=fig-16-2
一个半径为 $r$ 的圆沿着 $x$ 轴向右滚动。当它转过角度 $t$ 时，它滚动的距离为 $rt$（即绿色线段，长度等于绿色弧长），因此圆心位于 $C = (rt, r)$，原来在原点的点 $P$ 现在位于 $C$ 左侧 $r\sin t$ 处，下方 $r\cos t$ 处。拱形的虚线部分还未出现。
:::

**李萨如曲线。**设 $x$ 和 $y$ 以不同的频率振荡： $x = \sin 2t$, $y = \sin 3t$, $0 \le t \le 2\pi$。 点保持在正方形 $-1 \le x \le 1$, $-1 \le y \le 1$ 内，向左向右摆动两次，同时上下摆动三次，最终回到起点 $t = 2\pi$。 这样的**李萨如曲线（Lissajous curve）** 出现在示波器上，当水平和垂直偏转分别由两个正弦波驱动时，可以通过图像读取这两个正弦波的频率比：该曲线在正方形的顶部和底部各触碰三次（在 $t = \pi/6, 5\pi/6, 3\pi/2$ 和 $t = \pi/2, 7\pi/6, 11\pi/6$ 处），在每条边上各触碰两次。 在第 16.2 节的控件中追踪该曲线。

```check
same_set(solveset(Eq(sin(3*x), 1), x, Interval.Ropen(0, 2*pi)), [pi/6, 5*pi/6, 3*pi/2])
same_set(solveset(Eq(sin(3*x), -1), x, Interval.Ropen(0, 2*pi)), [pi/2, 7*pi/6, 11*pi/6])
same_set(solveset(Eq(sin(2*x), 1), x, Interval.Ropen(0, 2*pi)), [pi/4, 5*pi/4])
same_set(solveset(Eq(sin(2*x), -1), x, Interval.Ropen(0, 2*pi)), [3*pi/4, 7*pi/4])
same((sin(2*(t + 2*pi)), sin(3*(t + 2*pi))), (sin(2*t), sin(3*t)))
```

## 参数曲线的微积分 {#parametric-calculus}

### 切线 {#tangents}

在大多数点附近，参数曲线是某个函数的图像，并具有切线，其斜率由链式法则给出。 如果在某个 $t$ 点附近，曲线 $x = f(t)$, $y = g(t)$ 是某个可导函数 $y = F(x)$ 的图像，那么 $g(t) = F\big(f(t)\big)$，并且链式法则（[第 5.5 节](module_05_ZH.html#chain)）给出 $g'(t) = F'\big(f(t)\big)\,f'(t)$，即，

$$\frac{dy}{dt} = \frac{dy}{dx}\cdot\frac{dx}{dt},$$

在 $dx/dt \ne 0$ 成立的点可以除以它。下面的定理给出这种做法成立的条件。

::: theorem 参数曲线的斜率
设 $f$ 和 $g$ 在开区间 $I$ 上可微，$f'$ 在 $I$ 上连续，且 $I$ 中的点 $t_0$ 满足 $f'(t_0) \ne 0$。则 $t_0$ 周围存在开区间 $J$，使得 $f$ 在此区间上是单射。曲线 $x = f(t)$、$y = g(t)$ 上 $t$ 属于 $J$ 的部分是函数 $y = F(x)$ 的图像，且 $F$ 在 $x_0 = f(t_0)$ 处可微，满足

$$F'(x_0) = \frac{g'(t_0)}{f'(t_0)}, \quad\text{that is,}\quad \frac{dy}{dx} = \frac{dy/dt}{dx/dt}.$$
:::

::: proof
因为 $f'$ 连续，当 $t \to t_0$ 时有 $f'(t) \to f'(t_0)$。由 $f'(t_0) \ne 0$，在 $t_0$ 周围某个开区间 $J$ 内，对每个 $t$，$f'(t)$ 与 $f'(t_0)$ 同号。导数在区间上为正的函数在其中严格递增，导数为负则严格递减（模块 8 中值定理的推论）。两种情形下 $f$ 在 $J$ 上都是单射，也因可微而连续。所以 $t$ 属于 $J$ 时，每个值 $x = f(t)$ 都恰由一个 $t = f^{-1}(x)$ 产生，且 $t$ 在 $J$ 内的那段曲线是 $F(x) = g\big(f^{-1}(x)\big)$ 的图像。由反函数求导定理（见[第 6.2 节](module_06_ZH.html#inverse-functions)），$f^{-1}$ 在 $x_0$ 处可微，导数为 $1/f'(t_0)$。再由链式法则，$F$ 在 $x_0$ 处可微，且

$$F'(x_0) = g'\big(f^{-1}(x_0)\big)\,\big(f^{-1}\big)'(x_0) = \frac{g'(t_0)}{f'(t_0)}.$$
:::

```check
fP, gP, FP = Function('f'), Function('g'), Function('F')
same(diff(FP(fP(t)), t), Subs(Derivative(FP(u), u), u, fP(t))*Derivative(fP(t), t))   # the chain rule step
import mpmath
mpmath.mp.dps = 30
finv16 = lambda X: mpmath.findroot(lambda T: T**3 + T - X, 1)   # a test case: x = t^3 + t, y = sin t, t0 = 1, x0 = 2
near(mpmath.diff(lambda X: mpmath.sin(finv16(X)), 2), cos(1)/(3*1**2 + 1), 1e-20)
```

$f'$ 的连续性使得 $f$ 在 $t_0$ 附近是单射的。莱布尼茨形式很容易记住，仿佛 $dt$ 被约掉了。两个特殊情况最为重要。

::: keyidea
在曲线 $x = f(t)$, $y = g(t)$ 上，且 $f'$ 和 $g'$ 在所讨论的参数值附近连续：

- 在 $\dfrac{dy}{dt} = 0$ 和 $\dfrac{dx}{dt} \ne 0$ 处，切线是 **水平的**；
- 在 $\dfrac{dx}{dt} = 0$ 和 $\dfrac{dy}{dt} \ne 0$ 处，切线是 **垂直的**（定理 16.1，将 $x$ 和 $y$ 的角色互换：在这样的点附近，曲线是一个以 $x = G(y)$ 为自变量、以 $dx/dy = 0$ 为因变量的图像）；
- 当两者均为 0 时，公式无意义：需更仔细地分析。
:::

::: example 自交曲线的切线
对图 16.1 中的曲线 $x = t^2$, $y = t^3 - 3t$，求 $dy/dx$，找出切线为水平或垂直的点，以及在 $(3, 0)$ 处的切线。

这里是 $\dfrac{dx}{dt} = 2t$ 和 $\dfrac{dy}{dt} = 3t^2 - 3 = 3(t - 1)(t + 1)$。对于 $t \ne 0$，

$$\frac{dy}{dx} = \frac{3t^2 - 3}{2t}.$$

**水平线：** $dy/dt = 0$ 在 $t = \pm1$ 处，其中 $dx/dt = \pm2 \ne 0$。切线在 $(1, -2)$（$t = 1$）和 $(1, 2)$（$t = -1$）处水平，其中 $y(t)$ 转折。

**垂直：** $dx/dt = 0$ 仅在 $t = 0$ 处，其中 $dy/dt = -3 \ne 0$。在原点处切线垂直，其中 $x(t)$ 转折。

**在 $(3, 0)$：** 该点被到达两次，分别在 $t = \sqrt3$ 和 $t = -\sqrt3$。在 $t = \sqrt3$ 处斜率为 $\dfrac{9 - 3}{2\sqrt3} = \dfrac{3}{\sqrt3} = \sqrt3$；在 $t = -\sqrt3$ 处斜率为 $\dfrac{6}{-2\sqrt3} = -\sqrt3$。因此，曲线在该点处有两条切线，分别对应两次经过：

$$y = \sqrt3\,(x - 3) \quad\text{and}\quad y = -\sqrt3\,(x - 3).$$

斜率是 $t$ 的函数，而不是点的函数：要找到某点的斜率，首先找出给出该斜率的 $t$ 的值。

```check
xe3, ye3 = t**2, t**3 - 3*t
same(diff(xe3, t), 2*t); steps(diff(ye3, t), 3*t**2 - 3, 3*(t - 1)*(t + 1))
same(diff(ye3, t)/diff(xe3, t), (3*t**2 - 3)/(2*t))
same_set(solve(diff(ye3, t), t), [1, -1]); same([diff(xe3, t).subs(t, v) for v in (1, -1)], [2, -2])
same([(xe3.subs(t, v), ye3.subs(t, v)) for v in (1, -1)], [(1, -2), (1, 2)])
same(solve(diff(xe3, t), t), [0]); same(diff(ye3, t).subs(t, 0), -3); same((xe3.subs(t, 0), ye3.subs(t, 0)), (0, 0))
sl3 = (3*t**2 - 3)/(2*t)
steps(sl3.subs(t, sqrt(3)), (9 - 3)/(2*sqrt(3)), 3/sqrt(3), sqrt(3)); steps(sl3.subs(t, -sqrt(3)), 6/(-2*sqrt(3)), -sqrt(3))
same((sqrt(3)*(x - 3)).subs(x, 3), 0)
```
:::

::: example 圆周线的斜率
求圆周线 $x = r(t - \sin t)$、$y = r(1 - \cos t)$ 的斜率，并描述其触地的曲线。

$\dfrac{dx}{dt} = r(1 - \cos t)$ 和 $\dfrac{dy}{dt} = r\sin t$。第一个在 $\cos t = 1$ 时恰好为 0，即在 $t = 0, \pm2\pi, \pm4\pi, \dots$：$P$ 触地的位置。其他地方

$$\frac{dy}{dx} = \frac{r\sin t}{r(1 - \cos t)} = \frac{\sin t}{1 - \cos t}.$$

这可以简化。[第 1.4 节](module_01_ZH.html#trig)] 中的加法公式，当两个角都等于 $t/2$ 时，给出 **双角公式**

$$\begin{aligned} \sin t &= 2\sin\tfrac{t}{2}\cos\tfrac{t}{2}, \\ \cos t &= \cos^2\tfrac{t}{2} - \sin^2\tfrac{t}{2} = 1 - 2\sin^2\tfrac{t}{2}, \end{aligned}$$

最后一步用 $\cos^2 + \sin^2 = 1$。因此 $1 - \cos t = 2\sin^2\tfrac{t}{2}$，并

$$\frac{dy}{dx} = \frac{2\sin\frac{t}{2}\cos\frac{t}{2}}{2\sin^2\frac{t}{2}} = \frac{\cos\frac{t}{2}}{\sin\frac{t}{2}} = \cot\frac{t}{2}.$$

在拱顶 $t = \pi$ 处，斜率为 $\cot\tfrac{\pi}{2} = 0$。当 $t \to 0^+$ 时，有 $\cos\tfrac{t}{2} \to 1$ 和 $\sin\tfrac{t}{2} \to 0^+$，故斜率趋于 $+\infty$。当 $t \to 2\pi^-$ 时，斜率趋于 $-\infty$。因此每一拱都竖直离开地面，也竖直落回地面，相邻两拱交于一个**尖点**。此处 $dx/dt$ 和 $dy/dt$ 都为 0，即 $P$ 瞬时静止，正如滚动轮子与地面接触的点。

```check
same(diff(r*(t - sin(t)), t), r*(1 - cos(t))); same(diff(r*(1 - cos(t)), t), r*sin(t))
same_set(solveset(1 - cos(x), x, Interval(-4*pi, 4*pi)), [-4*pi, -2*pi, 0, 2*pi, 4*pi])
same(expand_trig(sin(2*u)), 2*sin(u)*cos(u)); same(expand_trig(cos(2*u)), cos(u)**2 - sin(u)**2); same(cos(u)**2 - sin(u)**2, 1 - 2*sin(u)**2)
same(1 - cos(t), 2*sin(t/2)**2)
steps(r*sin(t)/(r*(1 - cos(t))), sin(t)/(1 - cos(t)), 2*sin(t/2)*cos(t/2)/(2*sin(t/2)**2), cos(t/2)/sin(t/2), cot(t/2))
same(cot(pi/2), 0); limit_is(cot(t/2), t, 0, oo, '+'); limit_is(cot(t/2), t, 2*pi, -oo, '-')
same((r*(1 - cos(t))).subs(t, 0), 0); same((r*sin(t)).subs(t, 0), 0); same((r*sin(t)).subs(t, 2*pi), 0)
```
:::

::: pitfall
斜率是$\dfrac{dy/dt}{dx/dt}$，而非$\dfrac{dx/dt}{dy/dt}$：后者是$dx/dy$，即坐标轴互换后的斜率。当$dx/dt$和$dy/dt$均为0时，无法得出任何结论。曲线$x = t^3$, $y = t^2$在原点处有尖点（它是$y = x^{2/3}$），而$x = t^3$, $y = t^3$是光滑直线$y = x$，在原点处有停顿；两者在$t = 0$处均有$dx/dt = dy/dt = 0$。

```check
same(diff(t**3, t).subs(t, 0), 0); same(diff(t**2, t).subs(t, 0), 0)
tp16 = symbols('t', positive=True); same(real_root(tp16**3, 3)**2, tp16**2); limit_is(diff(t**2, t)/diff(t**3, t), t, 0, oo, '+')
same(diff(t**3, t)/diff(t**3, t), 1)                     # x = t^3, y = t^3: slope 1 wherever t != 0
```
:::

**速度。**若$t$为时间，则从点$(x, y)$画一箭头，其水平分量为$dx/dt$、垂直分量为$dy/dt$，即该点横向与纵向的移动速率。当$dx/dt \ne 0$时，其斜率为$\dfrac{dy/dt}{dx/dt} = \dfrac{dy}{dx}$；当$dx/dt = 0$且$dy/dt \ne 0$时，箭头垂直。无论哪种情况，箭头均沿切线方向，指向曲线追踪的方向。其长度$\sqrt{(dx/dt)^2 + (dy/dt)^2}$为该点的**速率**（积分可得行进距离，如下一个小节所示）。若两个导数均为0，则速率为0，箭头无方向。第16.4节称此类箭头为向量，第16.8节称此箭头为**速度**。

::: widget name=parametric-curve
选择一条曲线并按下 **播放**，或移动滑块。蓝色曲线被绘制到当前参数值为止，橙色箭头是速度 $\langle x', y'\rangle$，按图下方标明的刻度绘制；读数显示其分量和速度，必要时进行四舍五入。对于圆，检查示例 16.1(a) 在 $t = \pi/2$：点在哪里，箭头指向哪个方向？对于摆线，观察当 $P$到达地面时箭头如何缩小至无（示例 16.4）。对于第 16.3 节的极坐标曲线，参数是角度 $\theta$，虚线射线显示方向 $\theta$：对于玫瑰曲线 $r = \cos 3\theta$，观察当 $r < 0$ 时点的位置。
:::

### 弧长 {#arc-length}

模块 12 定义了函数图像的长度为内接多边形长度的极限，并推导出公式 $L = \int_a^b \sqrt{1 + f'(x)^2}\,dx$。同样的多边形也可用于测量参数曲线。将 $[a, b]$ 切分成 $n$ 等份，在 $a = t_0 < t_1 < \dots < t_n = b$ 处进行划分，用 $\Delta t = (b - a)/n$ 表示分点，按顺序连接点 $P_i = \big(f(t_i), g(t_i)\big)$。使用 $\Delta x_i = f(t_i) - f(t_{i-1})$ 和 $\Delta y_i = g(t_i) - g(t_{i-1})$，从 $P_{i-1}$ 到 $P_i$ 的弦长为

$$\sqrt{(\Delta x_i)^2 + (\Delta y_i)^2} = \sqrt{\Big(\frac{\Delta x_i}{\Delta t}\Big)^2 + \Big(\frac{\Delta y_i}{\Delta t}\Big)^2}\;\Delta t.$$

如$\Delta t \to 0$所示，两个差商分别趋近于$f'(t)$和$g'(t)$，因此弦长之和应趋近于一个积分。从$t = a$到$t = b$所描绘路径**的长度**是这些多边形长度在$n \to \infty$时的极限（若极限存在）；当路径描绘一条曲线一次时，即为该曲线的长度。

```check
dxq, dyq = symbols('Delta_x Delta_y', real=True)
dtq = symbols('Delta_t', positive=True)
same(sqrt((dxq/dtq)**2 + (dyq/dtq)**2)*dtq, sqrt(dxq**2 + dyq**2))
```

::: theorem 参数曲线的弧长
若 $f'$ 与 $g'$ 在 $[a, b]$ 上连续，则路径 $x = f(t)$、$y = g(t)$、$a \le t \le b$ 的长度为

$$L = \int_a^b \sqrt{\Big(\frac{dx}{dt}\Big)^2 + \Big(\frac{dy}{dt}\Big)^2}\,dt.$$
:::

**证明思路。** 由模块 8 的中值定理，$[t_{i-1}, t_i]$ 内存在点 $t_i^*$、$t_i^{**}$，使得 $\Delta x_i = f'(t_i^*)\,\Delta t$、$\Delta y_i = g'(t_i^{**})\,\Delta t$。因此折线的长度为

$$\sum_{i=1}^{n} \sqrt{f'(t_i^*)^2 + g'(t_i^{**})^2}\;\Delta t.$$

如果 $t_i^{**}$ 等于 $t_i^*$，那么这将是连续函数 $\sqrt{f'(t)^2 + g'(t)^2}$ 的一个黎曼和，并且它将趋近于积分（模块 9），与模块 12 中的情形完全相同。两个点可能不同，但它们之间的距离最多为 $\Delta t$，因此当 $\Delta t$ 很小时， $g'(t_i^{**})$ 会接近 $g'(t_i^*)$。深入理解的框图使“接近”变得精确。

::: deeper 为什么多边形趋近于积分
设 $P_n$ 为多边形的长度， $Q_n = \sum \sqrt{f'(t_i^*)^2 + g'(t_i^*)^2}\,\Delta t$ 是一个趋近于 $L$（模块 9）的黎曼和。对于任意数 $p$、 $q$ 和 $q'$，

$$\Big|\sqrt{p^2 + q^2} - \sqrt{p^2 + q'^2}\Big| \le \abs{q - q'}:$$

平方根分别是点 $(p, q)$ 和 $(p, q')$ 到原点的距离，这两个点之间的距离为 $\abs{q - q'}$，根据三角不等式，这两个距离的差不超过这个量。因此

$$\abs{P_n - Q_n} \le \sum_{i=1}^{n} \abs{g'(t_i^{**}) - g'(t_i^*)}\,\Delta t.$$

一个在闭区间上连续的函数在该区间上 **一致连续**：对于每一个 $\varepsilon > 0$，存在一个 $\delta > 0$，使得 $\abs{g'(s) - g'(s')} < \varepsilon$ 当 $s$ 和 $s'$ 在 $[a, b]$ 中的距离小于 $\delta$ 时。 (这个定理，像模块 9 中连续函数的可积性一样，需要实数的完备性；该系列中使用它但不证明。) 一旦 $\Delta t < \delta$，该和式的每一项都小于 $\varepsilon\,\Delta t$，因此 $\abs{P_n - Q_n} < \varepsilon(b - a)$。由此 $P_n - Q_n \to 0$，且 $P_n \to L$。

```check
for vals in ((1, 2, 5), (-3, 1, -2), (0, 4, 4), (2, -7, 3)):
    holds(Abs(sqrt(vals[0]**2 + vals[1]**2) - sqrt(vals[0]**2 + vals[2]**2)) <= Abs(vals[1] - vals[2]))
```
:::

如果 $t$ 是时间，被积函数是速度，定理 16.2 表示行驶的距离是速度的积分：就像 [1.1 节](module_01_ZH.html#about)] 中的汽车，其里程表累计速度表的读数。对于函数 $y = f(x)$ 的图像，取 $x = t$， $y = f(t)$：被积函数变为 $\sqrt{1 + f'(t)^2}$，定理 16.2 给出模块 12 的公式。

```check
same(sqrt(diff(t, t)**2 + diff(fP(t), t)**2), sqrt(1 + Derivative(fP(t), t)**2))
```

::: example 两个长度
设 $r > 0$。求 (a) 圆 $x = r\cos t$，$y = r\sin t$，$0 \le t \le 2\pi$ 的长度，以及 (b) 摆线 $x = r(t - \sin t)$，$y = r(1 - \cos t)$，$0 \le t \le 2\pi$ 的一个拱的长度。

**(a)** $\dfrac{dx}{dt} = -r\sin t$ 与 $\dfrac{dy}{dt} = r\cos t$，因此被积函数为 $\sqrt{r^2\sin^2 t + r^2\cos^2 t} = r$，且

$$L = \int_0^{2\pi} r\,dt = 2\pi r,$$

周长，应如此。

**(b)** 平方并相加例16.4中的导数，然后使用 $\cos^2 t + \sin^2 t = 1$ 和 $1 - \cos t = 2\sin^2\tfrac{t}{2}$：

$$\begin{aligned} \Big(\frac{dx}{dt}\Big)^2 + \Big(\frac{dy}{dt}\Big)^2 &= r^2(1 - \cos t)^2 + r^2\sin^2 t \\ &= r^2\big(1 - 2\cos t + \cos^2 t + \sin^2 t\big) \\ &= r^2(2 - 2\cos t) = 4r^2\sin^2\tfrac{t}{2}. \end{aligned}$$

对于 $0 \le t \le 2\pi$，角 $t/2$ 位于 $[0, \pi]$ 区间内，其中 $\sin\tfrac{t}{2} \ge 0$；因此平方根为 $2r\sin\tfrac{t}{2}$。代入 $u = t/2$，$du = \tfrac12\,dt$（[第10.7节](module_10_ZH.html#definite-substitution)）；极限 $t = 0$ 和 $t = 2\pi$ 分别变为 $u = 0$ 和 $u = \pi$：

$$\begin{aligned} L &= \int_0^{2\pi} 2r\sin\tfrac{t}{2}\,dt = 4r\int_0^{\pi} \sin u\,du \\ &= 4r\big[-\cos u\big]_0^{\pi} = 4r(1 + 1) = 8r. \end{aligned}$$

摆线的一拱长度恰好为$8r$，等于车轮直径的四倍，尽管其底边长度仅为$2\pi r \approx 6.28r$。自行车车轮转动一圈时，反光板行驶的距离是自行车行驶距离的$8/(2\pi) \approx 1.273$倍：大约远27%。

```check
same(sqrt(diff(rp_*cos(t), t)**2 + diff(rp_*sin(t), t)**2), rp_); same(integrate(r, (t, 0, 2*pi)), 2*pi*r)
cxs = diff(r*(t - sin(t)), t)**2 + diff(r*(1 - cos(t)), t)**2
steps(cxs, r**2*(1 - cos(t))**2 + r**2*sin(t)**2, r**2*(1 - 2*cos(t) + cos(t)**2 + sin(t)**2), r**2*(2 - 2*cos(t)), 4*r**2*sin(t/2)**2)
holds(minimum(sin(x/2), x, Interval(0, 2*pi)) >= 0)
xr16 = symbols('x', real=True); same(sqrt(4*rp_**2*sin(xr16/2)**2), 2*rp_*Abs(sin(xr16/2)))
steps(Integral(2*r*sin(t/2), (t, 0, 2*pi)), 4*r*Integral(sin(u), (u, 0, pi)), 4*r*(-cos(pi) + cos(0)), 4*r*(1 + 1), 8*r)
rounds(2*pi, '6.28'); rounds(8/(2*pi), '1.273'); rounds(100*(8/(2*pi) - 1), '27')
```
:::

::: pitfall
$\sqrt{\sin^2(t/2)}$ 是 $\abs{\sin(t/2)}$，不是 $\sin(t/2)$。在两个拱形上，$0 \le t \le 4\pi$，$\sin\tfrac{t}{2}$ 在 $2\pi < t < 4\pi$ 时为负，且 $\int_0^{4\pi} 2r\sin\tfrac{t}{2}\,dt = 0$：长度的无意义。在符号变化的区间内分割，或利用对称性：两个拱形的长度为 $16r$。同样地，一条路径若自身重叠，则每次经过都计入长度：$x = \cos 2t$，$y = \sin 2t$，$0 \le t \le 2\pi$，速度为 2，给出 $\int_0^{2\pi} 2\,dt = 4\pi$，即绕单位圆两次的路径长度，而非圆的周长。

```check
same(integrate(2*r*sin(t/2), (t, 0, 4*pi)), 0); holds(sin(Rational(5, 2)*pi/2) < 0)
same(integrate(2*r*sin(t/2), (t, 0, 2*pi)) + integrate(-2*r*sin(t/2), (t, 2*pi, 4*pi)), 16*r)
same(sqrt(diff(cos(2*t), t)**2 + diff(sin(2*t), t)**2), 2); same(integrate(2, (t, 0, 2*pi)), 4*pi)
```
:::

## 极坐标 {#polar}

雷达站不会报告一架飞机为“东40公里、北30公里”。它会报告一个距离，50公里，以及一个方向。用距离和角度来描述点，称为 **极坐标**，其中以原点为中心的圆、螺旋线和花形曲线都有简短的方程。

```check
same(sqrt(40**2 + 30**2), 50)
```

::: definition 极坐标
固定原点 $O$，称为 **极点**，以及正 $x$轴，称为 **极轴**。一点 $P$ 有 **极坐标** $(r, \theta)$ 如果

$$x = r\cos\theta, \qquad y = r\sin\theta.$$

对于 $r > 0$，$r$ 是从 $O$ 到 $P$ 的距离，而 $\theta$ 是从极轴到通过 $O$ 和 $P$ 的射线的角（以弧度为单位），按逆时针方向测量。对于 $r < 0$，点 $(r, \theta)$ 位于相反射线上，距离 $O$ 为 $\abs{r}$。极点 $(0, \theta)$ 对于每个 $\theta$ 都是相同的。
:::

图 16.3（左上）展示了一个点的极坐标。与笛卡尔坐标不同，极坐标不是唯一的：$(r, \theta)$、$(r, \theta + 2\pi)$ 和 $(-r, \theta + \pi)$ 表示同一个点，因为正弦和余弦的周期为 $2\pi$，而 $\cos(\theta + \pi) = -\cos\theta$ 和 $\sin(\theta + \pi) = -\sin\theta$。要转换回去，平方相加，再除以：

$$r^2 = x^2 + y^2, \qquad \tan\theta = \frac{y}{x} \quad (x \ne 0).$$

```check
same((r*cos(theta + 2*pi), r*sin(theta + 2*pi)), (r*cos(theta), r*sin(theta)))
same((-r*cos(theta + pi), -r*sin(theta + pi)), (r*cos(theta), r*sin(theta)))
same((r*cos(theta))**2 + (r*sin(theta))**2, r**2); same((r*sin(theta))/(r*cos(theta)), tan(theta))
```

::: example 坐标转换
(a) 求极坐标 $(4, 5\pi/6)$ 和 $(-2, \pi/4)$ 所对应点的笛卡尔坐标。 (b) 求点 $(-1, \sqrt3)$ 和 $(-3, -3)$ 的极坐标，其中 $r > 0$ 和 $0 \le \theta < 2\pi$ 为极径。

**(a)** 对于 $(4, 5\pi/6)$： $x = 4\cos\tfrac{5\pi}{6} = 4\big(-\tfrac{\sqrt3}{2}\big) = -2\sqrt3$ 和 $y = 4\sin\tfrac{5\pi}{6} = 4\cdot\tfrac12 = 2$，因此该点是 $\big(-2\sqrt3, 2\big)$。对于 $(-2, \pi/4)$： $x = -2\cos\tfrac{\pi}{4} = -\sqrt2$ 和 $y = -2\sin\tfrac{\pi}{4} = -\sqrt2$。点 $\big(-\sqrt2, -\sqrt2\big)$ 位于第三象限，与方向 $\pi/4$ 相反，因为负的 $r$ 要求如此。

**(b)** 对于 $(-1, \sqrt3)$： $r = \sqrt{1 + 3} = 2$，且 $\theta$ 必须满足 $\cos\theta = x/r = -\tfrac12$ 和 $\sin\theta = y/r = \tfrac{\sqrt3}{2}$，因此 $\theta = \tfrac{2\pi}{3}$（例 1.8）。对于 $(-3, -3)$： $r = \sqrt{18} = 3\sqrt2$，且 $\cos\theta = \sin\theta = -\tfrac{1}{\sqrt2}$，因此 $\theta = \tfrac{5\pi}{4}$。

```check
same((4*cos(5*pi/6), 4*sin(5*pi/6)), (-2*sqrt(3), 2)); same((-2*cos(pi/4), -2*sin(pi/4)), (-sqrt(2), -sqrt(2)))
same(sqrt(1 + 3), 2); same((cos(2*pi/3), sin(2*pi/3)), (-Rational(1, 2), sqrt(3)/2)); same((2*cos(2*pi/3), 2*sin(2*pi/3)), (-1, sqrt(3)))
same(sqrt(18), 3*sqrt(2)); same((cos(5*pi/4), sin(5*pi/4)), (-1/sqrt(2), -1/sqrt(2))); same((3*sqrt(2)*cos(5*pi/4), 3*sqrt(2)*sin(5*pi/4)), (-3, -3))
```
:::

::: pitfall
当选择 $r > 0$ 时， $\theta = \arctan(y/x)$ 只有在 $x > 0$ 时才正确：反正切函数给出的是 $-\pi/2$ 和 $\pi/2$ 之间的角度，该角度指向平面的右半部分。对于 $(-3, -3)$， $\arctan\dfrac{-3}{-3} = \arctan 1 = \dfrac{\pi}{4}$ 指向第一象限，正好是错误的方向；直角是 $\dfrac{\pi}{4} + \pi = \dfrac{5\pi}{4}$。首先根据 $x$ 和 $y$ 的符号决定象限。（Python 的 `math.atan2(y, x)` 会这样做，并返回一个 $[-\pi, \pi]$ 中的角度。）

```check
same(atan(Rational(-3, -3)), pi/4); same(pi/4 + pi, 5*pi/4); same(atan2(-3, -3), -3*pi/4); same(-3*pi/4 + 2*pi, 5*pi/4)
import math
same(math.atan2(0.0, -1.0), math.pi); same(math.atan2(-0.0, -1.0), -math.pi)   # both endpoint signs occur
```
:::

### 极坐标曲线 {#polar-curves}

极坐标方程 $r = f(\theta)$ 的图像是具有极坐标 $\big(f(\theta), \theta\big)$ 的点的集合。它是一个参数曲线，角度是参数：

$$x = f(\theta)\cos\theta, \qquad y = f(\theta)\sin\theta.$$

最简单的形式是 $r = a$，对于常数 $a > 0$，它是以极点为中心、半径为 $a$ 的圆，以及 $\theta = \alpha$，即通过极点、角度为 $\alpha$ 的直线（包含负 $r$，即整条直线）。其他曲线需要计算。将 $r = 2\sin\theta$ 乘以 $r$ 得到 $r^2 = 2r\sin\theta$，即 $x^2 + y^2 = 2y$；通过配方得到 $x^2 + (y - 1)^2 = 1$。因此 $r = 2\sin\theta$ 是以 $(0, 1)$ 为中心、半径为 1 的圆，当 $\theta$ 从 0 运动到 $\pi$ 时，该圆被画出一次（图 16.3，右上角）。对于 $\pi \le \theta \le 2\pi$， $r = 2\sin\theta \le 0$，点再次绕同一圆周运动。

```check
same(expand((2*sin(theta))**2 - 2*(2*sin(theta))*sin(theta)), 0)
same(expand(x**2 + (y - 1)**2 - 1), x**2 + y**2 - 2*y)
X_, Y_ = 2*sin(theta)*cos(theta), 2*sin(theta)*sin(theta)
same(X_**2 + (Y_ - 1)**2, 1); same((X_.subs(theta, 0), Y_.subs(theta, 0)), (0, 0)); same((X_.subs(theta, pi/2), Y_.subs(theta, pi/2)), (0, 2))
same((X_.subs(theta, theta + pi), Y_.subs(theta, theta + pi)), (X_, Y_))
```

一张表格展示了一个不太常见的曲线——**心形线** $r = 1 + \cos\theta$（希腊语为“心形”）是如何被描绘出来的：

```valuetable
theta = 0, pi/6, pi/3, pi/2, 2*pi/3, 5*pi/6, pi
$r = 1 + \cos\theta$ = 1 + cos(theta)
$x = r\cos\theta$ = (1 + cos(theta))*cos(theta)
$y = r\sin\theta$ = (1 + cos(theta))*sin(theta)
digits = 4
---
\theta | r = 1 + \cos\theta | x = r\cos\theta | y = r\sin\theta
0 | 2 | 2 | 0
\frac{\pi}{6} | 1.866 | 1.616 | 0.9330
\frac{\pi}{3} | 1.5 | 0.75 | 1.299
\frac{\pi}{2} | 1 | 0 | 1
\frac{2 \pi}{3} | 0.5 | -0.25 | 0.4330
\frac{5 \pi}{6} | 0.1340 | -0.1160 | 0.06699
\pi | 0 | 0 | 0
```

当 $\theta$ 从 0 增加到 $\pi$ 时，$r$ 从 2 缩小到 0：点从 $(2, 0)$ 开始，经过上半平面绕行，到达极点。由于 $\cos(-\theta) = \cos\theta$，下半平面是上半平面关于 $x$ 轴的镜像，当 $\theta$ 从 $\pi$ 变到 $2\pi$ 时被描绘出来（图 16.3，左下）。

::: figure id=fig-16-3
极坐标与极曲线，位于灰色极坐标网格上。左上：点 $(r, \theta) = (2, \pi/3)$ 是 $(r\cos\theta, r\sin\theta) = \big(1, \sqrt3\big)$。左中：由极曲线和两条射线围成的区域，被从极点发出的射线分割；阴影部分近似为面积 $\tfrac12 r^2\,\Delta\theta$ 的扇形（定理 16.3）。右上：圆 $r = 2\sin\theta$。底部：心形线 $r = 1 + \cos\theta$（面积 $3\pi/2$），一朵花瓣的玫瑰线 $r = \cos 3\theta$（面积 $\pi/12$ 被阴影表示），以及螺旋线 $r = \theta/2$ 对应 $0 \le \theta \le 4\pi$。
:::

```check
same((2*cos(pi/3), 2*sin(pi/3)), (1, sqrt(3)))
```

另外两类。**玫瑰**$r = \cos 3\theta$（图16.3，底部中间）有三个花瓣。对于$-\pi/6 \le \theta \le \pi/6$，$r \ge 0$，且该点沿极轴绘制花瓣。对于$\pi/6 \le \theta \le \pi/2$，$r \le 0$，因此该点位于与$\theta$相反的射线上，并绘制指向方向$4\pi/3$的花瓣（其尖端$r = -1$出现在$\theta = \pi/3$处）；第三个花瓣指向方向$2\pi/3$。在$\theta = \pi$之后，曲线重复，因为$\cos\big(3(\theta + \pi)\big) = -\cos 3\theta$和$(-r, \theta + \pi)$是与$(r, \theta)$相同的点。一般而言，对于正整数$n$，$r = \cos n\theta$在$n$为奇数时有$n$个花瓣，在$n$为偶数时有$2n$个花瓣。

```check
same(cos(3*(theta + pi)), -cos(3*theta)); same(cos(3*0), 1); same(cos(3*pi/3), -1); same(cos(3*2*pi/3), 1)
same(solveset(cos(3*x), x, Interval(-pi/2, pi/2)), FiniteSet(-pi/2, -pi/6, pi/6, pi/2))
holds(pi/6 < 1); holds(1 < pi/2); holds(cos(3*1) < 0)                # theta = 1 lies in (pi/6, pi/2): r < 0
same((-1*cos(pi/3), -1*sin(pi/3)), (cos(4*pi/3), sin(4*pi/3)))
same(cos(2*(theta + pi)), cos(2*theta)); same(cos(5*(theta + pi)), -cos(5*theta))
```

螺旋 $r = \theta/2$， $\theta \ge 0$（图16.3，右下角），是一个 **阿基米德螺旋线**：每一圈完整旋转增加 $2\pi$ 到 $\theta$ 和 $\pi$ 到 $r$，因此连续的旋转之间的距离为 $\pi$，如同从一端看被卷起的地毯的层。

```check
same((theta + 2*pi)/2 - theta/2, pi)
```

### 极坐标曲线的斜率 {#polar-slopes}

对于具有连续导数的 $f$，极曲线 $r = f(\theta)$ 是参数曲线 $x = f(\theta)\cos\theta$, $y = f(\theta)\sin\theta$，因此定理 16.1 给出了其斜率。根据乘积法则，

$$\begin{aligned} \frac{dx}{d\theta} &= f'(\theta)\cos\theta - f(\theta)\sin\theta, \\ \frac{dy}{d\theta} &= f'(\theta)\sin\theta + f(\theta)\cos\theta, \end{aligned}$$

并且，在 $dx/d\theta \ne 0$ 处，

$$\frac{dy}{dx} = \frac{f'(\theta)\sin\theta + f(\theta)\cos\theta}{f'(\theta)\cos\theta - f(\theta)\sin\theta}.$$

在极点处，公式特别简单。如果 $f(\theta_0) = 0$ 且 $f'(\theta_0) \ne 0$，则含有 $f(\theta_0)$ 的项消失，斜率为 $\tan\theta_0$（当 $\cos\theta_0 \ne 0$；若 $\cos\theta_0 = 0$，则切线垂直）：曲线沿 $\theta = \theta_0$ 这条直线通过极点。玫瑰线 $r = \cos 3\theta$ 在 $\theta = \pi/6$, $\pi/2$ 和 $5\pi/6$ 处为 0，因此其花瓣在这些角度对应的直线上通过极点。

```check
fpo = Function('f')
same(diff(fpo(theta)*cos(theta), theta), Derivative(fpo(theta), theta)*cos(theta) - fpo(theta)*sin(theta))
same(diff(fpo(theta)*sin(theta), theta), Derivative(fpo(theta), theta)*sin(theta) + fpo(theta)*cos(theta))
dpo = symbols('d', nonzero=True)
same(((dpo*sin(theta) + 0*cos(theta))/(dpo*cos(theta) - 0*sin(theta))), tan(theta))
same_set(solveset(cos(3*x), x, Interval.Ropen(0, pi)), [pi/6, pi/2, 5*pi/6])
same([diff(cos(3*theta), theta).subs(theta, v) for v in (pi/6, pi/2, 5*pi/6)], [-3, 3, -3])
```

::: example 心形线的切线
求心形线 $r = 1 + \cos\theta$ 在 $\theta = \pi/2$ 处的切线，以及切线水平的点。

此时 $f(\theta) = 1 + \cos\theta$ 和 $f'(\theta) = -\sin\theta$，因此

$$\begin{aligned} \frac{dx}{d\theta} &= -\sin\theta\cos\theta - (1 + \cos\theta)\sin\theta = -\sin\theta\,(1 + 2\cos\theta), \\ \frac{dy}{d\theta} &= -\sin^2\theta + (1 + \cos\theta)\cos\theta \\ &= 2\cos^2\theta + \cos\theta - 1, \end{aligned}$$

其中最后一步将 $\sin^2\theta$ 替换为 $1 - \cos^2\theta$。关于 $\cos\theta$ 的二次方程可分解为 $\dfrac{dy}{d\theta} = (2\cos\theta - 1)(\cos\theta + 1)$。

**在 $\theta = \pi/2$:** $r = 1$，所以该点是 $(0, 1)$，且 $\dfrac{dx}{d\theta} = -1$，$\dfrac{dy}{d\theta} = -1$。斜率是 $\dfrac{-1}{-1} = 1$，切线是 $y = x + 1$。

**水平切线：** $dy/d\theta = 0$当$\cos\theta = \tfrac12$时，在$\theta = \pi/3$和$5\pi/3$处，或当$\cos\theta = -1$时，在$\theta = \pi$处。在$\theta = \pi/3$处，$r = \tfrac32$且该点为$\big(\tfrac34, \tfrac{3\sqrt3}{4}\big) \approx (0.75, 1.299)$；此处$\dfrac{dx}{d\theta} = -\tfrac{\sqrt3}{2}\cdot 2 = -\sqrt3 \ne 0$，因此切线是水平的：这是心形线的顶部。由对称性，$\theta = 5\pi/3$给出底部，$\big(\tfrac34, -\tfrac{3\sqrt3}{4}\big)$。在$\theta = \pi$处，该点为极点，且$dx/d\theta = 0$亦然，因此导数公式无信息。相反，考虑从极点到曲线附近一点的割线。其斜率为

$$\frac{y}{x} = \frac{(1 + \cos\theta)\sin\theta}{(1 + \cos\theta)\cos\theta} = \tan\theta \longrightarrow 0 \qquad (\theta \to \pi).$$

因此，极点处的尖点也具有水平切线，$y = 0$。具有水平切线的三个点是顶部、底部和极点。

```check
fc_ = 1 + cos(theta)
dxc = diff(fc_*cos(theta), theta); dyc = diff(fc_*sin(theta), theta)
same(diff(fc_, theta), -sin(theta))
steps(dxc, -sin(theta)*cos(theta) - (1 + cos(theta))*sin(theta), -sin(theta)*(1 + 2*cos(theta)))
steps(dyc, -sin(theta)**2 + (1 + cos(theta))*cos(theta), 2*cos(theta)**2 + cos(theta) - 1, (2*cos(theta) - 1)*(cos(theta) + 1))
same((fc_*cos(theta)).subs(theta, pi/2), 0); same((fc_*sin(theta)).subs(theta, pi/2), 1)
same(dxc.subs(theta, pi/2), -1); same(dyc.subs(theta, pi/2), -1); same(expand(1 + 1*(x - 0)), x + 1)
same_set(solveset(dyc, theta, Interval.Ropen(0, 2*pi)), [pi/3, 5*pi/3, pi])
same(fc_.subs(theta, pi/3), Rational(3, 2)); same(((fc_*cos(theta)).subs(theta, pi/3), (fc_*sin(theta)).subs(theta, pi/3)), (Rational(3, 4), 3*sqrt(3)/4))
rounds(3*sqrt(3)/4, '1.299'); same(dxc.subs(theta, pi/3), -sqrt(3))
same(((fc_*cos(theta)).subs(theta, 5*pi/3), (fc_*sin(theta)).subs(theta, 5*pi/3)), (Rational(3, 4), -3*sqrt(3)/4)); holds(Ne(dxc.subs(theta, 5*pi/3), 0))
same(fc_.subs(theta, pi), 0); same(dxc.subs(theta, pi), 0)
same((fc_*sin(theta))/(fc_*cos(theta)), tan(theta)); limit_is(tan(theta), theta, pi, 0)
limit_is(dyc/dxc, theta, pi, 0)
same(maximum(fc_*sin(theta), theta, Interval(0, pi)), 3*sqrt(3)/4)
```
:::

### 用极坐标求面积 {#polar-area}

极坐标中面积的自然基本单元不是一个矩形，而是一个扇形。半径为 $r$、夹角为 $\Delta\theta$（弧度）的圆扇形是圆盘的 $\Delta\theta/(2\pi)$ 分数，因此其面积为

$$\frac{\Delta\theta}{2\pi}\cdot\pi r^2 = \frac12 r^2\,\Delta\theta.$$

```check
same(theta/(2*pi)*pi*r**2, r**2*theta/2)
```

::: theorem 用极坐标求面积
设 $f$ 在 $[\alpha, \beta]$ 上连续且 $f(\theta) \ge 0$，其中 $0 < \beta - \alpha \le 2\pi$。由极坐标曲线 $r = f(\theta)$ 与两条射线 $\theta = \alpha$、$\theta = \beta$ 围成的区域，其面积为

$$A = \int_\alpha^\beta \frac12 f(\theta)^2\,d\theta = \frac12\int_\alpha^\beta r^2\,d\theta.$$
:::

::: proof
将 $[\alpha, \beta]$ 分成 $n$ 段，每段宽为 $\Delta\theta = (\beta - \alpha)/n$。由分点对应的射线将区域分成 $n$ 个窄片（图 16.3 上方中间）。条件 $\beta - \alpha \le 2\pi$ 保证各片的内部互不重叠。记 $[\alpha, \beta]$ 的第 $i$ 段上 $f$ 的最小值和最大值为 $m_i$、$M_i$。由模块 3 的极值定理，它们存在。第 $i$ 片包含半径为 $m_i$ 的扇形，并且包含在半径为 $M_i$ 的扇形内；两个扇形的圆心角都是 $\Delta\theta$。因此该片的面积介于 $\tfrac12 m_i^2\,\Delta\theta$ 与 $\tfrac12 M_i^2\,\Delta\theta$ 之间。将各片相加：

$$\sum_{i=1}^{n} \frac12 m_i^2\,\Delta\theta \le A \le \sum_{i=1}^{n} \frac12 M_i^2\,\Delta\theta.$$

由于 $f \ge 0$, $\tfrac12 m_i^2$ 和 $\tfrac12 M_i^2$ 是 $\tfrac12 f^2$ 在第 $i$ 个区间上的最小值和最大值，因此两边是连续函数 $\tfrac12 f(\theta)^2$ 的黎曼和，具有 $n$ 个等分区间。当 $n \to \infty$ 两者都趋于 $\int_\alpha^\beta \tfrac12 f(\theta)^2\,d\theta$（模块 9）时，夹在它们之间的 $A$，对于每个 $n$ 都是那个积分。
:::

::: example 心脏线的面积和花瓣的面积
求（a）心脏线 $r = 1 + \cos\theta$ 内部的面积，以及（b）玫瑰线 $r = \cos 3\theta$ 的一个花瓣的面积。

两者都需要平方余弦的积分。对于 $\cos(u + u)$ 的加法公式给出 $\cos 2u = \cos^2 u - \sin^2 u = 2\cos^2 u - 1$，因此

$$\cos^2 u = \frac{1 + \cos 2u}{2}.$$

**(a)** 心脏线随着 $\theta$ 从 0 到 $2\pi$ 变化而被绘制一次，其中 $r \ge 0$。展开平方并替换 $\cos^2\theta$：

$$\begin{aligned} A &= \frac12\int_0^{2\pi} (1 + \cos\theta)^2\,d\theta = \frac12\int_0^{2\pi} \big(1 + 2\cos\theta + \cos^2\theta\big)\,d\theta \\ &= \frac12\int_0^{2\pi} \Big(\frac32 + 2\cos\theta + \frac12\cos 2\theta\Big)\,d\theta \\ &= \frac12\Big[\frac{3\theta}{2} + 2\sin\theta + \frac14\sin 2\theta\Big]_0^{2\pi} \\ &= \frac12\cdot 3\pi = \frac{3\pi}{2}. \end{aligned}$$

心脏线包含 $3\pi/2 \approx 4.712$，其面积是单位圆面积的一点五倍。

**(b)** 一个花瓣被描绘当 $\theta$ 从 $-\pi/6$ 跑到 $\pi/6$，其中 $r = \cos 3\theta \ge 0$。在 $u = 3\theta$ 的公式中对于 $\cos^2 u$：

$$\begin{aligned} A &= \frac12\int_{-\pi/6}^{\pi/6} \cos^2 3\theta\,d\theta = \frac12\int_{-\pi/6}^{\pi/6} \frac{1 + \cos 6\theta}{2}\,d\theta \\ &= \frac14\Big[\theta + \frac{\sin 6\theta}{6}\Big]_{-\pi/6}^{\pi/6} \\ &= \frac14\cdot\frac{\pi}{3} = \frac{\pi}{12}, \end{aligned}$$

因为 $\sin 6\theta = \sin(\pm\pi) = 0$ 在两个极限处。一个花瓣的面积是 $\pi/12 \approx 0.2618$，三个花瓣一起是 $3\cdot\pi/12 = \pi/4$。

```check
same(expand_trig(cos(2*u)), 2*cos(u)**2 - 1); same(cos(u)**2, (1 + cos(2*u))/2)
steps(Integral((1 + cos(theta))**2/2, (theta, 0, 2*pi)), Integral((1 + 2*cos(theta) + cos(theta)**2)/2, (theta, 0, 2*pi)),
      Integral((Rational(3, 2) + 2*cos(theta) + cos(2*theta)/2)/2, (theta, 0, 2*pi)), Rational(1, 2)*3*pi, 3*pi/2)
antideriv(3*theta/2 + 2*sin(theta) + sin(2*theta)/4, Rational(3, 2) + 2*cos(theta) + cos(2*theta)/2, theta)
same((3*theta/2 + 2*sin(theta) + sin(2*theta)/4).subs(theta, 2*pi) - (3*theta/2 + 2*sin(theta) + sin(2*theta)/4).subs(theta, 0), 3*pi)
rounds(3*pi/2, '4.712'); same((3*pi/2)/(pi*1**2), Rational(3, 2))
holds(minimum(1 + cos(x), x, Interval(0, 2*pi)) >= 0)
holds(minimum(cos(3*x), x, Interval(-pi/6, pi/6)) >= 0)
steps(Integral(cos(3*theta)**2/2, (theta, -pi/6, pi/6)), Integral((1 + cos(6*theta))/4, (theta, -pi/6, pi/6)),
      Rational(1, 4)*((pi/6 + sin(pi)/6) - (-pi/6 + sin(-pi)/6)), Rational(1, 4)*pi/3, pi/12)
antideriv(theta + sin(6*theta)/6, 1 + cos(6*theta), theta)
rounds(pi/12, '0.2618'); same(3*pi/12, pi/4)
```
:::

::: pitfall
选择恰好描绘该区域一次的积分上下限。$\tfrac12\int_0^{2\pi} \cos^2 3\theta\,d\theta = \pi/2$，是玫瑰线内部面积的两倍，因为 $\theta$ 从 0 变化到 $2\pi$ 时，玫瑰线被描绘了两次。对于两条极坐标曲线之间的区域，设 $f$、$g$ 连续，在 $[\alpha, \beta]$ 上有 $0 \le g(\theta) \le f(\theta)$，且 $0 < \beta - \alpha \le 2\pi$。用外扇形减去内扇形，所得面积为 $\tfrac12\int_\alpha^\beta \big(f(\theta)^2 - g(\theta)^2\big)\,d\theta$，不能写成 $\tfrac12\int_\alpha^\beta \big(f(\theta) - g(\theta)\big)^2\,d\theta$。负半径指向相反的射线，使用此公式前应先将其换算为非负半径。

```check
same(integrate(cos(3*theta)**2/2, (theta, 0, 2*pi)), pi/2); same(pi/2, 2*(pi/4))
fo_, gi_ = 3*cos(theta), 1 + cos(theta)                     # the circle and the cardioid of Exercise 16.7
holds(Ne(integrate((fo_**2 - gi_**2)/2, (theta, -pi/3, pi/3)), integrate((fo_ - gi_)**2/2, (theta, -pi/3, pi/3))))
```
:::

::: compute 对称曲线与 SymPy
SymPy 找到斜率以及它们为 0 或未定义的点。对于例 16.3 中的曲线：

```python
import sympy as sp
t = sp.symbols('t')
x, y = t**2, t**3 - 3*t
slope = sp.diff(y, t)/sp.diff(x, t)
print(slope)
print(sp.solve(sp.diff(y, t), t), sp.solve(sp.diff(x, t), t))
print([slope.subs(t, v) for v in (sp.sqrt(3), -sp.sqrt(3))])
```

```output
(3*t**2 - 3)/(2*t)
[-1, 1] [0]
[sqrt(3), -sqrt(3)]
```

第一个列表给出水平切线（$t = \pm1$），第二个给出垂直切线（$t = 0$），最后一行给出交叉点处的两个斜率 $(3, 0)$。弧长更难。要求计算摆线拱的长度，SymPy 可以简化速度但无法积分：

```python
r = sp.symbols('r', positive=True)
X, Y = r*(t - sp.sin(t)), r*(1 - sp.cos(t))
speed = sp.sqrt(sp.diff(X, t)**2 + sp.diff(Y, t)**2)
print(sp.simplify(speed))
print(sp.integrate(speed, (t, 0, 2*sp.pi)))
```

```output
r*sqrt(2 - 2*cos(t))
r*Integral(sqrt(sin(t)**2 + cos(t)**2 - 2*cos(t) + 1), (t, 0, 2*pi))
```

SymPy 返回未计算的积分：它没有识别出 $2 - 2\cos t = 4\sin^2\tfrac{t}{2}$，也没有识别出该表达式的平方根为 $2\sin\tfrac{t}{2}$ 对于 $0 \le t \le 2\pi$。如果给它以例 16.5 中简化后的积分表达式，它就能找到长度。许多长度无法用初等函数表示：例 16.1(b) 中椭圆的周长是一个 **椭圆积分**，其积分表达式没有初等反函数，因此必须数值计算：

```python
print(sp.integrate(2*r*sp.sin(t/2), (t, 0, 2*sp.pi)))
ellipse = sp.Integral(sp.sqrt(9*sp.sin(t)**2 + 4*sp.cos(t)**2), (t, 0, 2*sp.pi))
print(ellipse.evalf(10))
```

```output
8*r
15.86543959
```

极坐标下的面积是 $\theta$ 中的普通积分；以下是例 16.8 中的卡迪奥德和花瓣：

```python
th = sp.symbols('theta')
print(sp.integrate((1 + sp.cos(th))**2/2, (th, 0, 2*sp.pi)))
print(sp.integrate(sp.cos(3*th)**2/2, (th, -sp.pi/6, sp.pi/6)))
```

```output
3*pi/2
pi/12
```
:::

## 向量 {#vectors}

多元微积分需要一种语言来描述既有大小又有方向的量：位移、速度、力，以及在模块17中的梯度。这种语言是 **向量**，它在平面和空间中都以相同的方式工作。首先，空间本身。

### 空间中的点 {#space}

为了在空间中定位一个点，取三条数轴通过同一点 $O$，即原点，每条数轴都垂直于另外两条：分别是 $x$-轴、$y$-轴和$z$-轴。想象房间的一个角落，其中 $x$-轴和 $y$-轴沿着地板的边，而 $z$-轴沿着垂直的边。数轴的排列遵循 **右手法则**：当你的右手手指从正 $x$-轴向正 $y$-轴弯曲时，拇指指向正 $z$-轴方向。点 $P$ 的坐标为 $(a, b, c)$，表示从 $O$ 出发，沿 $x$-轴移动 $a$，然后平行于 $y$-轴移动 $b$，再平行于 $z$-轴移动 $c$（图16.4，左图）。平面 $z = 0$ 是 **$xy$-平面**（即地板）； $x = 0$ 和 $y = 0$ 分别是 $yz$-平面和 $xz$-平面。

$P_1(x_1, y_1, z_1)$ 与 $P_2(x_2, y_2, z_2)$ 之间的距离是

$$\abs{P_1P_2} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}.$$

这是两次应用勾股定理：点$Q(x_2, y_2, z_1)$与$P_1$同高且位于$P_2$正上方或正下方，具有$\abs{P_1Q}^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2$，且三角形$P_1QP_2$在$Q$处为直角，因此$\abs{P_1P_2}^2 = \abs{P_1Q}^2 + (z_2 - z_1)^2$。例如，从$(1, 2, -1)$到$(3, -1, 5)$的距离为$\sqrt{4 + 9 + 36} = \sqrt{49} = 7$。与点$(a, b, c)$距离为$R$的点构成**球面**$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$。

```check
x1_, y1_, z1_, x2_, y2_, z2_ = symbols('x1 y1 z1 x2 y2 z2', real=True)
P1m, Qm, P2m = Matrix([x1_, y1_, z1_]), Matrix([x2_, y2_, z1_]), Matrix([x2_, y2_, z2_])
same((Qm - P1m).dot(P2m - Qm), 0)                                  # the right angle at Q
same((Qm - P1m).dot(Qm - P1m) + (P2m - Qm).dot(P2m - Qm), (x2_ - x1_)**2 + (y2_ - y1_)**2 + (z2_ - z1_)**2)
steps(sqrt((3 - 1)**2 + (-1 - 2)**2 + (5 - (-1))**2), sqrt(4 + 9 + 36), sqrt(49), 7)
```

### 向量及其分量 {#components}

::: definition 向量
一个 **向量** 是一个具有长度和方向的量。它被画作一个箭头；无论从哪里开始，长度和方向相同的箭头表示相同的向量。从 $A(x_1, y_1, z_1)$ 到 $B(x_2, y_2, z_2)$ 的向量是

$$\overrightarrow{AB} = \langle x_2 - x_1,\ y_2 - y_1,\ z_2 - z_1\rangle,$$

而这三个数是它的 **分量**。向量 $\vb{a} = \langle a_1, a_2, a_3\rangle$ 的 **长度**（或 **模长**）是

$$\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2 + a_3^2}.$$

平面上的向量有两个分量， $\vb{a} = \langle a_1, a_2\rangle$ 和 $\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2}$。
:::

向量以粗体打印，$\vb{a}$，手写时加箭头，$\vec a$。尖括号将向量$\langle a_1, a_2, a_3\rangle$与点$(a_1, a_2, a_3)$区分开来；从$O$指向该点的箭头代表该向量，即该点的**位置向量**。$\norm{\vb{a}}$读作“长度”（也称其范数）。根据距离公式，$\overrightarrow{AB}$的长度是从$A$到$B$的距离。**零向量**$\vb{0} = \langle 0, 0, 0\rangle$长度为0且无方向，普通数称为**标量**。

### 加法与标量乘法 {#arithmetic}

沿箭头$\vb{a}$行走，再沿从$\vb{a}$终点引出的$\vb{b}$行走：从起点到终点的箭头是**和**$\vb{a} + \vb{b}$（图16.4，中部）。先沿$\vb{b}$再沿$\vb{a}$行走会到达同一位置：两条路线是平行四边形的边，$\vb{a} + \vb{b}$是其对角线。**标量倍数**$c\,\vb{a}$是$\vb{a}$按因子$\abs{c}$拉伸，若$c < 0$则反向（图16.4，右侧）。在分量上，两者均按分量逐一作用：

$$\begin{aligned} \vb{a} + \vb{b} &= \langle a_1 + b_1,\ a_2 + b_2,\ a_3 + b_3\rangle, \\ c\,\vb{a} &= \langle c a_1,\ c a_2,\ c a_3\rangle. \end{aligned}$$

向量 $c\,\vb{a}$ 的长度是 $\sqrt{c^2a_1^2 + c^2a_2^2 + c^2a_3^2} = \abs{c}\,\norm{\vb{a}}$。向量 **与** 的差是 $\vb{a} - \vb{b} = \vb{a} + (-1)\vb{b}$；当 $\vb{a}$ 和 $\vb{b}$ 从同一点出发时，$\vb{a} - \vb{b}$ 是从 $\vb{b}$ 的终点指向 $\vb{a}$ 的终点的箭头。两个非零向量是 **平行** 的，如果其中一个向量是另一个的标量倍数。由于所有运算都是分量进行的，普通代数的规则也适用，例如 $\vb{a} + \vb{b} = \vb{b} + \vb{a}$，$(\vb{a} + \vb{b}) + \vb{c} = \vb{a} + (\vb{b} + \vb{c})$，$c(\vb{a} + \vb{b}) = c\vb{a} + c\vb{b}$ 和 $(c + d)\vb{a} = c\vb{a} + d\vb{a}$。

```check
A3, B3, C3 = Matrix(symbols('a1:4')), Matrix(symbols('b1:4')), Matrix(symbols('c1:4'))
cs_, ds_ = symbols('c d', real=True)
same(A3 + B3, B3 + A3); same((A3 + B3) + C3, A3 + (B3 + C3)); same(A3 + zeros(3, 1), A3); same(A3 + (-A3), zeros(3, 1))
same(cs_*(A3 + B3), cs_*A3 + cs_*B3); same((cs_ + ds_)*A3, cs_*A3 + ds_*A3); same((cs_*ds_)*A3, cs_*(ds_*A3))
Ar = Matrix(symbols('a1:4', real=True)); same((cs_*Ar).norm(), Abs(cs_)*Ar.norm())
```

::: figure id=fig-16-4
左：点 $P(2, 4, 3)$，从原点出发，沿 $x$ 轴移动 2 个单位，平行于 $y$ 轴移动 4 个单位，并向上移动 3 个单位，其位置向量为 $\langle 2, 4, 3\rangle$，单位向量为 $\vb{i}$、$\vb{j}$、$\vb{k}$。中间：$\vb{a} = \langle 3, 1\rangle$ 与 $\vb{b} = \langle 1, 2\rangle$ 相加得到 $\vb{a} + \vb{b} = \langle 4, 3\rangle$，即它们平行四边形的对角线，无论先画哪一条。右：$\vb{v} = \langle 2, 1\rangle$ 的倍数。
:::

```check
same(Matrix([3, 1]) + Matrix([1, 2]), Matrix([4, 3]))
```

一个 **单位向量** 的长度为 1。**标准单位向量**

$$\vb{i} = \langle 1, 0, 0\rangle, \qquad \vb{j} = \langle 0, 1, 0\rangle, \qquad \vb{k} = \langle 0, 0, 1\rangle$$

沿坐标轴方向的向量，且每个向量均由它们构成：$\langle a_1, a_2, a_3\rangle = a_1\vb{i} + a_2\vb{j} + a_3\vb{k}$。（在平面中，为$\vb{i} = \langle 1, 0\rangle$和$\vb{j} = \langle 0, 1\rangle$。）对于向量$\vb{a} \ne \vb{0}$，与其同方向的单位向量为

$$\vb{u} = \frac{\vb{a}}{\norm{\vb{a}}},$$

，因为其长度是 $\norm{\vb{a}}/\norm{\vb{a}} = 1$。 将向量除以其长度称为 **标准化**。

```check
iv, jv, kv = Matrix([1, 0, 0]), Matrix([0, 1, 0]), Matrix([0, 0, 1])
a1_, a2_, a3_ = symbols('a1 a2 a3'); same(a1_*iv + a2_*jv + a3_*kv, Matrix([a1_, a2_, a3_]))
same((Ar/Ar.norm()).norm(), 1)
```

::: example 向量运算
设 $\vb{a} = \langle 2, -1, 2\rangle$ 和 $\vb{b} = \langle 1, 3, 0\rangle$。 求 $\vb{a} + \vb{b}$，$2\vb{a} - 3\vb{b}$，$\norm{\vb{a}}$，$\norm{\vb{b}}$，以及 $\vb{a}$ 方向的单位向量。 用 $\vb{a}$ 表示 $\vb{i}$，$\vb{j}$ 和 $\vb{k}$。

分部分进行工作：

$$\begin{aligned} \vb{a} + \vb{b} &= \langle 2 + 1,\ -1 + 3,\ 2 + 0\rangle = \langle 3, 2, 2\rangle, \\ 2\vb{a} - 3\vb{b} &= \langle 4 - 3,\ -2 - 9,\ 4 - 0\rangle = \langle 1, -11, 4\rangle. \end{aligned}$$

这些长度分别是 $\norm{\vb{a}} = \sqrt{4 + 1 + 4} = 3$ 和 $\norm{\vb{b}} = \sqrt{1 + 9 + 0} = \sqrt{10}$。方向为 $\vb{a}$ 的单位法向量是 $\tfrac13\vb{a} = \big\langle \tfrac23, -\tfrac13, \tfrac23\big\rangle$；检查： $\tfrac49 + \tfrac19 + \tfrac49 = 1$。最后是 $\vb{a} = 2\vb{i} - \vb{j} + 2\vb{k}$。

这两个向量在第 16.5 节和第 16.6 节中返回。

```check
av, bv = Matrix([2, -1, 2]), Matrix([1, 3, 0])
same(av + bv, Matrix([3, 2, 2])); same(2*av - 3*bv, Matrix([1, -11, 4]))
same(av.norm(), 3); same(bv.norm(), sqrt(10)); same(av/av.norm(), Matrix([Rational(2, 3), -Rational(1, 3), Rational(2, 3)]))
same(Rational(4, 9) + Rational(1, 9) + Rational(4, 9), 1); same(2*iv - jv + 2*kv, av)
```
:::

在应用中，一个 **位移**是从某物开始位置指向结束位置的向量；一个非零**速度**具有运动的方向和速度的长度；一个非零**力** 具有推或拉的方向和其强度（以牛顿，N 为单位）作为长度。作用在某一物体上的力作为向量相加，作用在保持静止的物体上的力相加等于 $\vb{0}$。仅仅暂时静止是不够的：一个竖直上抛运动到达顶点的球体上仍然有重力作用。

::: example 速度和力
(a) 一船以 4 m/s 的速度相对于水流向正北行驶，而水流以 3 m/s 的速度向东流动。求船相对于地面的速度及其速率。 (b) 一个 100 N 的重物静止地悬挂在两条绳子上，这两条绳子分别与水平方向成 $30^\circ$ 和 $60^\circ$ 的角度，分别在两侧。求每条绳子的张力。（两部分中的数字均为虚构。）

**(a)** 取 $x$ 为东方向， $y$ 为北方向。相对于水流，船以速度 $\langle 0, 4\rangle$ 行驶，水流以速度 $\langle 3, 0\rangle$ 流动，因此相对于地面，船以

$$\langle 0, 4\rangle + \langle 3, 0\rangle = \langle 3, 4\rangle,$$

速率 $\sqrt{9 + 16} = 5$ m/s 向北偏东 $\arctan\tfrac34 \approx 36.87^\circ$ 角度的方向运动。

**(b)** 设两条绳子的张力分别为 $T_1$ （左侧的 $30^\circ$ 绳）和 $T_2$ （右侧的 $60^\circ$ 绳），作为向量 $T_1\langle -\cos 30^\circ, \sin 30^\circ\rangle$ 和 $T_2\langle \cos 60^\circ, \sin 60^\circ\rangle$。重物的重力为 $\langle 0, -100\rangle$。静止时，三个力的矢量和为 $\vb{0}$；比较分量，

$$-\frac{\sqrt3}{2}T_1 + \frac12 T_2 = 0, \qquad \frac12 T_1 + \frac{\sqrt3}{2}T_2 - 100 = 0.$$

第一个方程给出 $T_2 = \sqrt3\,T_1$；然后第二个方程变为 $\tfrac12 T_1 + \tfrac32 T_1 = 100$，因此 $T_1 = 50$ N 和 $T_2 = 50\sqrt3 \approx 86.60$ N。更陡峭的绳子承载更多的重量。两个张力相加大于 100 N，因为它们的水平拉力相互抵消，对支撑重量没有贡献。

```check
same(Matrix([0, 4]) + Matrix([3, 0]), Matrix([3, 4])); same(sqrt(9 + 16), 5); rounds(atan(Rational(3, 4))*180/pi, '36.87')
T1_, T2_ = symbols('T1 T2')
c30, s30, c60, s60 = cos(pi/6), sin(pi/6), cos(pi/3), sin(pi/3)
same(T1_*Matrix([-c30, s30]) + T2_*Matrix([c60, s60]) + Matrix([0, -100]), Matrix([-sqrt(3)/2*T1_ + T2_/2, T1_/2 + sqrt(3)/2*T2_ - 100]))
sol_ = solve([-sqrt(3)/2*T1_ + T2_/2, T1_/2 + sqrt(3)/2*T2_ - 100], [T1_, T2_])
same(sol_[T1_], 50); same(sol_[T2_], 50*sqrt(3)); rounds(50*sqrt(3), '86.60')
same(solve(-sqrt(3)/2*T1_ + T2_/2, T2_), [sqrt(3)*T1_]); same(Rational(1, 2) + sqrt(3)/2*sqrt(3), 2); holds(50 + 50*sqrt(3) > 100)
```
:::

::: pitfall
长度一般不具可加性：$\norm{\vb{a} + \vb{b}}$ 不一定等于 $\norm{\vb{a}} + \norm{\vb{b}}$。在例 16.10(a) 中，4 m/s 和 3 m/s 的速度合成为 5 m/s，而非 7 m/s。图 16.4（中间）中三角形的边展示了 **三角不等式**，即 $\norm{\vb{a} + \vb{b}} \le \norm{\vb{a}} + \norm{\vb{b}}$，当其中一个向量为零或两个向量均非零且指向相同时取等号（练习 16.11 证明了这一点）。

```check
same(Matrix([3, 4]).norm(), 5); holds(Matrix([3, 4]).norm() < 3 + 4)
same(Matrix([3, 1]).norm(), sqrt(10)); same(Matrix([1, 2]).norm(), sqrt(5)); holds(Matrix([4, 3]).norm() < sqrt(10) + sqrt(5))
same((av + zeros(3, 1)).norm(), av.norm() + zeros(3, 1).norm())
same((av + 2*av).norm(), av.norm() + (2*av).norm())
```
:::

## 点积 {#dot}

拉着一个雪橇沿水平地面以与地面成 $\theta$ 角度的绳子前进。只有拉力沿地面的那部分，即 $\norm{\vb{F}}\cos\theta$，使雪橇向前移动。因此物理学定义恒力 $\vb{F}$ 沿直线位移 $\vb{D}$ 所做的 **功** 为该力沿位移方向的分量乘以移动的距离：

$$W = \norm{\vb{F}}\,\norm{\vb{D}}\cos\theta.$$

两个长度与它们夹角余弦的乘积在分量形式下有一个简单的公式。

::: definition 数量积
向量 $\vb{a} = \langle a_1, a_2, a_3\rangle$ 与 $\vb{b} = \langle b_1, b_2, b_3\rangle$ 的 **点积** 是一个数

$$\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3,$$

读作 "a dot b"。在平面中， $\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2$。
:::

两个向量的点积是一个标量，而不是向量；它也被称为 **标量积**。根据定义，对于所有向量 $\vb{a}$, $\vb{b}$, $\vb{c}$ 和标量 $k$：

$$\begin{aligned} \vb{a}\cdot\vb{a} &= \norm{\vb{a}}^2, \qquad \vb{a}\cdot\vb{b} = \vb{b}\cdot\vb{a}, \\ \vb{a}\cdot(\vb{b} + \vb{c}) &= \vb{a}\cdot\vb{b} + \vb{a}\cdot\vb{c}, \\ (k\vb{a})\cdot\vb{b} &= k(\vb{a}\cdot\vb{b}) = \vb{a}\cdot(k\vb{b}). \end{aligned}$$

例如，使用例 16.9 中的 $\vb{a} = \langle 2, -1, 2\rangle$ 和 $\vb{b} = \langle 1, 3, 0\rangle$，向量 $\vb{a}\cdot\vb{b} = 2 - 3 + 0 = -1$ 与 $\vb{a}\cdot\vb{a} = 4 + 1 + 4 = 9 = \norm{\vb{a}}^2$。

```check
same(A3.dot(A3), sum(ai**2 for ai in A3)); same(Ar.dot(Ar), Ar.norm()**2); same(A3.dot(B3), B3.dot(A3))
same(A3.dot(B3 + C3), A3.dot(B3) + A3.dot(C3)); same((k*A3).dot(B3), k*A3.dot(B3)); same(A3.dot(k*B3), k*A3.dot(B3))
same(av.dot(bv), -1); steps(av.dot(bv), 2 - 3 + 0, -1); same(av.dot(av), 9); same(av.norm()**2, 9)
```

::: theorem 点积与角度
如果 $\theta$ 是从同一点（$0 \le \theta \le \pi$）出发的非零向量 $\vb{a}$ 和 $\vb{b}$ 之间的夹角，则

$$\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta.$$
:::

::: proof
该证明使用了 **余弦定理**：在一边为 $p$, $q$ 和 $s$ 的三角形中，其中 $\gamma$ 是边 $p$ 和 $q$ 之间的夹角，

$$s^2 = p^2 + q^2 - 2pq\cos\gamma.$$

为证明这一点，将角 $\gamma$ 放在原点，边 $p$ 沿正 $x$ 轴方向，终点为 $(p, 0)$。根据正弦和余弦的定义，边 $q$ 的终点为 $(q\cos\gamma, q\sin\gamma)$，距离公式给出

$$\begin{aligned} s^2 &= (q\cos\gamma - p)^2 + q^2\sin^2\gamma \\ &= q^2\big(\cos^2\gamma + \sin^2\gamma\big) - 2pq\cos\gamma + p^2 \\ &= p^2 + q^2 - 2pq\cos\gamma. \end{aligned}$$

如果 $\vb{a}$ 和 $\vb{b}$ 不平行，它们是三角形的两条边，第三条边为 $\vb{a} - \vb{b}$，从 $\vb{b}$ 的端点到 $\vb{a}$ 的端点，且 $\vb{a}$ 与 $\vb{b}$ 之间的夹角为 $\theta$。余弦定理给出

$$\norm{\vb{a} - \vb{b}}^2 = \norm{\vb{a}}^2 + \norm{\vb{b}}^2 - 2\norm{\vb{a}}\,\norm{\vb{b}}\cos\theta.$$

点积的规则以另一种方式给出相同的左边：

$$\begin{aligned} \norm{\vb{a} - \vb{b}}^2 &= (\vb{a} - \vb{b})\cdot(\vb{a} - \vb{b}) \\ &= \vb{a}\cdot\vb{a} - 2\,\vb{a}\cdot\vb{b} + \vb{b}\cdot\vb{b} \\ &= \norm{\vb{a}}^2 - 2\,\vb{a}\cdot\vb{b} + \norm{\vb{b}}^2. \end{aligned}$$

比较两者，$\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta$。如果 $\vb{a}$ 和 $\vb{b}$ 平行，则 $\vb{b} = k\vb{a}$ 与 $k \ne 0$；则 $\vb{a}\cdot\vb{b} = k\norm{\vb{a}}^2$，而 $\theta = 0$（如果 $k > 0$）或 $\pi$（如果 $k < 0$），以及 $\norm{\vb{a}}\,\norm{\vb{b}}\cos\theta = \abs{k}\,\norm{\vb{a}}^2\cdot(\pm1) = k\norm{\vb{a}}^2$ 也如此。
:::

```check
pp_, qq_, gm_ = symbols('p q gamma', positive=True)
steps((qq_*cos(gm_) - pp_)**2 + qq_**2*sin(gm_)**2, qq_**2*(cos(gm_)**2 + sin(gm_)**2) - 2*pp_*qq_*cos(gm_) + pp_**2, pp_**2 + qq_**2 - 2*pp_*qq_*cos(gm_))
same((A3 - B3).dot(A3 - B3), A3.dot(A3) - 2*A3.dot(B3) + B3.dot(B3))
kp_ = symbols('k', positive=True); kn_ = symbols('k', negative=True)
same(factor((kp_*Ar).norm()), kp_*Ar.norm()); same(factor((kn_*Ar).norm()), -kn_*Ar.norm())
same(Ar.dot(kp_*Ar), Ar.norm()*(kp_*Ar.norm())*cos(0)); same(Ar.dot(kn_*Ar), Ar.norm()*(-kn_*Ar.norm())*cos(pi))
```

因此，点积衡量两个向量朝同一方向延伸的程度。解出角度，

$$\cos\theta = \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}.$$

对于非零向量，向量 $\vb{a}\cdot\vb{b}$ 的符号与向量 $\cos\theta$ 的符号相同：正号对应 $0 \le \theta < \pi/2$，负号对应 $\pi/2 < \theta \le \pi$，在直角时为 0。两个向量 **正交**（垂直）当且仅当 $\vb{a}\cdot\vb{b} = 0$；零向量被认为是与所有向量正交，尽管它没有方向或角度。对于例 16.9 中的向量， $\cos\theta = \dfrac{-1}{3\sqrt{10}} \approx -0.1054$，因此 $\theta \approx 96.05^\circ$，略大于直角。

```check
th9 = acos(av.dot(bv)/(av.norm()*bv.norm()))
same(av.dot(bv)/(av.norm()*bv.norm()), -1/(3*sqrt(10))); rounds(-1/(3*sqrt(10)), '-0.1054'); rounds(th9*180/pi, '96.05')
```

### 角度与正交性 {#angles}

::: example 甲烷分子中的角度
在一个甲烷分子 CH₄ 中，碳原子位于一个正四面体的中心，四个氢原子位于该正四面体的顶点。将碳原子置于原点，氢原子分别置于 $(1, 1, 1)$、$(1, -1, -1)$、$(-1, 1, -1)$ 和 $(-1, -1, 1)$，这四个点是立方体的四个顶点，且任意两个顶点之间不通过立方体的边相连。求两个键之间的角度。

碳原子到第一个和第二个氢原子的键分别为 $\vb{a} = \langle 1, 1, 1\rangle$ 和 $\vb{b} = \langle 1, -1, -1\rangle$。然后 $\vb{a}\cdot\vb{b} = 1 - 1 - 1 = -1$ 和 $\norm{\vb{a}} = \norm{\vb{b}} = \sqrt3$，因此

$$\cos\theta = \frac{-1}{\sqrt3\cdot\sqrt3} = -\frac13, \qquad \theta = \arccos\Big(-\frac13\Big) \approx 1.9106 \approx 109.47^\circ.$$

每一对四个键向量的点积为 $-1$，因此每两个键之间的角度相同：这是 **四面体角**，约为 $109.5^\circ$，即甲烷分子中键之间的角度。

```check
Hs = [Matrix([1, 1, 1]), Matrix([1, -1, -1]), Matrix([-1, 1, -1]), Matrix([-1, -1, 1])]
same(Hs[0].dot(Hs[1]), -1); same(Hs[0].norm(), sqrt(3)); same(Hs[1].norm(), sqrt(3)); same(-1/(sqrt(3)*sqrt(3)), -Rational(1, 3))
holds(all(Hs[i_].dot(Hs[j_]) == -1 for i_ in range(4) for j_ in range(i_ + 1, 4)))
holds(all((Hs[i_] - Hs[j_]).norm() == 2*sqrt(2) for i_ in range(4) for j_ in range(i_ + 1, 4)))   # a regular tetrahedron
rounds(acos(-Rational(1, 3)), '1.9106'); rounds(acos(-Rational(1, 3))*180/pi, '109.47'); rounds(acos(-Rational(1, 3))*180/pi, '109.5')
```
:::

公式 $\cos\theta = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}$ 对于任何数量分量的非零向量都有意义。一个应用是用向量表示词语和文档，并比较它们的方向：它们之间的角度的余弦是它们的 **余弦相似度**。作为相似度的用途取决于向量是如何选择的。(练习 16.11 显示该分数始终介于 $-1$ 和 1 之间，因此角度存在。) 如果任意向量为零，则未定义。

### 投影 {#projections}

从$\vb{b}$的尖端向$\vb{a}$所在的直线作垂线（图16.5，左侧）。它截取了$\vb{b}$在该直线上的投影，即$\vb{b}$中沿$\vb{a}$方向的部分。其带符号长度$\norm{\vb{b}}\cos\theta$是$\vb{b}$在$\vb{a}$上的**标量投影**，而投影本身是**向量投影**。由定理16.4，对于$\vb{a} \ne \vb{0}$，

$$\begin{aligned} \operatorname{comp}_{\vb{a}}\vb{b} &= \norm{\vb{b}}\cos\theta = \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}, \\ \operatorname{proj}_{\vb{a}}\vb{b} &= \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}\cdot\frac{\vb{a}}{\norm{\vb{a}}} = \frac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,\vb{a}, \end{aligned}$$

读作“b 沿 a 的分量”和“b 在 a 上的投影”。角度公式也假设 $\vb{b} \ne \vb{0}$；点积公式也定义了 $\vb{0}$ 的投影，给出标量投影 0 和向量投影 $\vb{0}$。其余部分 $\vb{b}$ 与 $\vb{a}$ 正交：

$$\vb{a}\cdot\big(\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}\big) = \vb{a}\cdot\vb{b} - \frac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,(\vb{a}\cdot\vb{a}) = 0.$$

所以每个向量 $\vb{b}$ 都可以分解为沿 $\vb{a}$ 的部分和与其垂直的部分，$\vb{b} = \operatorname{proj}_{\vb{a}}\vb{b} + \big(\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}\big)$；工程师就是这样将箱子在斜面上的重量分解为沿斜面的部分和压向斜面的部分。

```check
projv = lambda A_, B_: (A_.dot(B_)/A_.dot(A_))*A_
same(A3.dot(B3 - projv(A3, B3)), 0); same(projv(A3, B3) + (B3 - projv(A3, B3)), B3)
same((Ar.dot(Matrix(symbols('b1:4', real=True)))/Ar.norm())*(Ar/Ar.norm()), projv(Ar, Matrix(symbols('b1:4', real=True))))
same(av.dot(zeros(3, 1))/av.norm(), 0); same(projv(av, zeros(3, 1)), zeros(3, 1))
```

::: example 投影
求 $\vb{b} = \langle 3, 4\rangle$ 在 $\vb{a} = \langle 2, 1\rangle$ 上的标量投影和向量投影，并把 $\vb{b}$ 分解为平行于 $\vb{a}$ 与垂直于该方向的两部分。

$\vb{a}\cdot\vb{b} = 6 + 4 = 10$ 和 $\vb{a}\cdot\vb{a} = 5$，因此

$$\begin{aligned} \operatorname{comp}_{\vb{a}}\vb{b} &= \frac{10}{\sqrt5} = 2\sqrt5 \approx 4.472, \\ \operatorname{proj}_{\vb{a}}\vb{b} &= \frac{10}{5}\,\vb{a} = \langle 4, 2\rangle. \end{aligned}$$

垂直部分是 $\vb{b} - \langle 4, 2\rangle = \langle -1, 2\rangle$；检查： $\langle -1, 2\rangle\cdot\langle 2, 1\rangle = -2 + 2 = 0$。所以 $\langle 3, 4\rangle = \langle 4, 2\rangle + \langle -1, 2\rangle$ （图 16.5，左图）。 $\vb{a}$ 和 $\vb{b}$ 之间的夹角为 $\cos\theta = 10/(\sqrt5\cdot5) = 2/\sqrt5$，大约为 $26.57^\circ$。

```check
a2v, b2v = Matrix([2, 1]), Matrix([3, 4])
same(a2v.dot(b2v), 10); same(a2v.dot(a2v), 5); steps(a2v.dot(b2v)/a2v.norm(), 10/sqrt(5), 2*sqrt(5)); rounds(2*sqrt(5), '4.472')
same(projv(a2v, b2v), Matrix([4, 2])); same(b2v - projv(a2v, b2v), Matrix([-1, 2])); same(Matrix([-1, 2]).dot(a2v), 0)
same(Matrix([4, 2]) + Matrix([-1, 2]), b2v); same(a2v.dot(b2v)/(a2v.norm()*b2v.norm()), 2/sqrt(5)); rounds(acos(2/sqrt(5))*180/pi, '26.57')
```
:::

::: pitfall
向量投影是除以 $\vb{a}\cdot\vb{a} = \norm{\vb{a}}^2$，而不是除以 $\norm{\vb{a}}$：一个因子 $\norm{\vb{a}}$ 将 $\vb{a}\cdot\vb{b}$ 转换为长度，另一个因子将 $\vb{a}$ 转换为单位向量。在例 16.12 中， $\dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}\,\vb{a} = 2\sqrt5\,\langle 2, 1\rangle$ 比 $\sqrt5$ 长。而且顺序是有区别的： $\operatorname{proj}_{\vb{b}}\vb{a} = \tfrac{10}{25}\langle 3, 4\rangle = \big\langle \tfrac65, \tfrac85\big\rangle$ 沿着 $\vb{b}$，而不是沿着 $\vb{a}$。

```check
same((a2v.dot(b2v)/a2v.norm())*a2v, 2*sqrt(5)*a2v); same(((a2v.dot(b2v)/a2v.norm())*a2v).norm()/projv(a2v, b2v).norm(), sqrt(5))
same(projv(b2v, a2v), Matrix([Rational(6, 5), Rational(8, 5)])); same(Rational(10, 25)*b2v, Matrix([Rational(6, 5), Rational(8, 5)]))
```
:::

### 功 {#work}

用点积，常量力 $\vb{F}$ 沿直线位移 $\vb{D}$ 所做的功为

$$W = \vb{F}\cdot\vb{D} = \norm{\vb{F}}\,\norm{\vb{D}}\cos\theta.$$

角度形式假设两个向量均非零；若任一为零，则点积形式给出$W = 0$。当$\vb{F}$以牛顿为单位且$\vb{D}$以米为单位时，$W$的单位为**焦耳**（J）。与运动方向垂直的力不做功，而与运动方向相反的力做负功。模块12计算沿直线变化的力所做的功$W = \int_a^b F(x)\,dx$；模块20将这两个概念结合，用于沿曲线路径变化的力。

::: example 拉雪橇
(a) 一个雪橇被一根与水平面成 $30^\circ$ 角的绳子拉过 50 米的水平地面，拉力恒为 40 牛。绳子做了多少功？(b) 一个恒定的力 $\vb{F} = \langle 3, 4, 5\rangle$ 牛使物体沿直线从 $(2, 1, 0)$ 移动到 $(4, 6, 2)$，单位为米。它做了多少功？

**(a)** $W = \norm{\vb{F}}\,\norm{\vb{D}}\cos\theta = 40\cdot 50\cdot\cos 30^\circ = 2000\cdot\tfrac{\sqrt3}{2} = 1000\sqrt3 \approx 1732$ J。在分量中， $\vb{F} = \langle 40\cos 30^\circ, 40\sin 30^\circ\rangle = \big\langle 20\sqrt3, 20\big\rangle$ 和 $\vb{D} = \langle 50, 0\rangle$，以及 $\vb{F}\cdot\vb{D} = 1000\sqrt3$ 再次：拉力的向上部分不做功。

**(b)** 位移为 $\vb{D} = \langle 4 - 2, 6 - 1, 2 - 0\rangle = \langle 2, 5, 2\rangle$，因此 $W = \vb{F}\cdot\vb{D} = 6 + 20 + 10 = 36$ J。

```check
steps(40*50*cos(pi/6), 2000*sqrt(3)/2, 1000*sqrt(3)); rounds(1000*sqrt(3), '1732')
same(Matrix([40*cos(pi/6), 40*sin(pi/6)]), Matrix([20*sqrt(3), 20])); same(Matrix([20*sqrt(3), 20]).dot(Matrix([50, 0])), 1000*sqrt(3))
same(Matrix([4, 6, 2]) - Matrix([2, 1, 0]), Matrix([2, 5, 2])); same(Matrix([3, 4, 5]).dot(Matrix([2, 5, 2])), 36)
```
:::

::: figure id=fig-16-5
左：将 $\vb{b} = \langle 3, 4\rangle$ 投影到 $\vb{a} = \langle 2, 1\rangle$ （例 16.12）。虚线段与 $\vb{a}$ 的直线垂直；$\operatorname{proj}_{\vb{a}}\vb{b} = \langle 4, 2\rangle$ 是 $\vb{b}$ 在该直线上的投影，且 $\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b} = \langle -1, 2\rangle$ 垂直于 $\vb{a}$。右：叉乘 $\vb{a} \times \vb{b}$ （第 16.6 节）垂直于 $\vb{a}$ 和 $\vb{b}$，其长度是它们所张成的平行四边形的面积，且方向与你右手食指从 $\vb{a}$ 向 $\vb{b}$ 卷曲时拇指所指的方向一致。
:::

## 叉乘 {#cross}

空间中许多问题需要两个给定向量 $\vb{a}$ 和 $\vb{b}$ 垂直的向量：例如一个平面的方向，或使力使扳手转动的轴。寻找同时垂直于 $\vb{n} = \langle n_1, n_2, n_3\rangle$ 和 $\vb{a}\cdot\vb{n} = 0$ 的 $\vb{b}\cdot\vb{n} = 0$：

$$a_1n_1 + a_2n_2 + a_3n_3 = 0, \qquad b_1n_1 + b_2n_2 + b_3n_3 = 0.$$

将第一个方程乘以$b_3$，第二个方程乘以$a_3$，然后相减：$n_3$被消去，留下$(a_1b_3 - a_3b_1)\,n_1 + (a_2b_3 - a_3b_2)\,n_2 = 0$。一个解是$n_1 = a_2b_3 - a_3b_2$和$n_2 = a_3b_1 - a_1b_3$，且$n_3 = a_1b_2 - a_2b_1$满足两个方程（代入并展开）。该解即为叉积。

```check
nn_ = Matrix([a2_*symbols('b3') - a3_*symbols('b2'), a3_*symbols('b1') - a1_*symbols('b3'), a1_*symbols('b2') - a2_*symbols('b1')])
b1_, b2_, b3_ = symbols('b1 b2 b3')
same(expand(b3_*(a1_*nn_[0] + a2_*nn_[1] + a3_*nn_[2]) - a3_*(b1_*nn_[0] + b2_*nn_[1] + b3_*nn_[2])), expand((a1_*b3_ - a3_*b1_)*nn_[0] + (a2_*b3_ - a3_*b2_)*nn_[1]))
same(expand((a1_*b3_ - a3_*b1_)*nn_[0] + (a2_*b3_ - a3_*b2_)*nn_[1]), 0)
same(expand(a1_*nn_[0] + a2_*nn_[1] + a3_*nn_[2]), 0); same(expand(b1_*nn_[0] + b2_*nn_[1] + b3_*nn_[2]), 0)
```

::: definition 叉乘
$\vb{a} = \langle a_1, a_2, a_3\rangle$ 和 $\vb{b} = \langle b_1, b_2, b_3\rangle$ 的**叉积**是向量

$$\vb{a}\times\vb{b} = \langle a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1\rangle,$$

读作「a 叉乘 b」。这就是通常的三维向量叉积。
:::

这个公式作为行列式更容易记忆。一个 $2 \times 2$ **行列式** 是 $\begin{vmatrix} p & q \\ r & s \end{vmatrix} = ps - qr$，并且 $\vb{a}\times\vb{b}$ 的每个分量都是其中之一。将 $\vb{i}$、$\vb{j}$、$\vb{k}$ 以及 $\vb{a}$ 和 $\vb{b}$ 的分量排列成三行，并沿第一行展开，每次覆盖一个元素所在的行和列：

$$\begin{aligned} \vb{a}\times\vb{b} &= \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ a_1 & a_2 & a_3 \\ b_1 & b_2 & b_3 \end{vmatrix} \\ &= \begin{vmatrix} a_2 & a_3 \\ b_2 & b_3 \end{vmatrix}\vb{i} - \begin{vmatrix} a_1 & a_3 \\ b_1 & b_3 \end{vmatrix}\vb{j} + \begin{vmatrix} a_1 & a_2 \\ b_1 & b_2 \end{vmatrix}\vb{k}. \end{aligned}$$

注意中间项的负号。（第一行包含向量，而不是数字，因此这是记忆技巧，而非真正的行列式。）例如，$\vb{i}\times\vb{j} = \langle 0\cdot0 - 0\cdot1,\ 0\cdot0 - 1\cdot0,\ 1\cdot1 - 0\cdot0\rangle = \vb{k}$。

```check
A3v, B3v = Matrix([a1_, a2_, a3_]), Matrix([b1_, b2_, b3_])
same(A3v.cross(B3v), nn_)
same(Matrix([[a2_, a3_], [b2_, b3_]]).det(), a2_*b3_ - a3_*b2_); same(-Matrix([[a1_, a3_], [b1_, b3_]]).det(), a3_*b1_ - a1_*b3_); same(Matrix([[a1_, a2_], [b1_, b2_]]).det(), a1_*b2_ - a2_*b1_)
I_, J_, K_ = symbols('I J K')
same(Matrix([[I_, J_, K_], [a1_, a2_, a3_], [b1_, b2_, b3_]]).det(), (a2_*b3_ - a3_*b2_)*I_ + (a3_*b1_ - a1_*b3_)*J_ + (a1_*b2_ - a2_*b1_)*K_)
same(iv.cross(jv), kv)
```

::: theorem 叉乘的性质
对空间向量 $\vb{a}$、$\vb{b}$、$\vb{c}$ 和任意标量 $k$，有以下性质。

1. $\vb{a}\times\vb{b}$ 同时与 $\vb{a}$ 和 $\vb{b}$ 正交。
2. 若 $\vb{a}$、$\vb{b}$ 均非零，夹角为 $\theta$，则 $\norm{\vb{a}\times\vb{b}} = \norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$，即以 $\vb{a}$、$\vb{b}$ 为邻边的平行四边形的面积。
3. $\vb{b}\times\vb{a} = -(\vb{a}\times\vb{b})$。$\vb{a}\times\vb{b} = \vb{0}$ 当且仅当 $\vb{a}$ 和 $\vb{b}$ 平行，或其中有一个等于 $\vb{0}$。
4. $\vb{a}\times(\vb{b} + \vb{c}) = \vb{a}\times\vb{b} + \vb{a}\times\vb{c}$，且 $(k\vb{a})\times\vb{b} = k(\vb{a}\times\vb{b}) = \vb{a}\times(k\vb{b})$。
:::

::: proof
(1) 展开 $\vb{a}\cdot(\vb{a}\times\vb{b}) = a_1(a_2b_3 - a_3b_2) + a_2(a_3b_1 - a_1b_3) + a_3(a_1b_2 - a_2b_1)$：六项成对抵消。$\vb{b}\cdot(\vb{a}\times\vb{b})$ 同样也是如此。

(2) 展开两边并收集相同乘积可证明 **拉格朗日恒等式**，

$$\norm{\vb{a}\times\vb{b}}^2 = \norm{\vb{a}}^2\norm{\vb{b}}^2 - (\vb{a}\cdot\vb{b})^2.$$

根据定理 16.4，右边为 $\norm{\vb{a}}^2\norm{\vb{b}}^2 - \norm{\vb{a}}^2\norm{\vb{b}}^2\cos^2\theta = \norm{\vb{a}}^2\norm{\vb{b}}^2\sin^2\theta$，而 $\sin\theta \ge 0$ 对于 $0 \le \theta \le \pi$，因此取平方根得到 $\norm{\vb{a}\times\vb{b}} = \norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$。平行四边形的底为 $\norm{\vb{a}}$，高为 $\norm{\vb{b}}\sin\theta$（图 16.5，右），因此这是其面积。

(3) 交换 $\vb{a}$ 和 $\vb{b}$ 会交换每个分量中的两个乘积，从而改变其符号。由 (2) 可知，对于非零向量，$\vb{a}\times\vb{b} = \vb{0}$ 当且仅当 $\sin\theta = 0$，即当 $\theta = 0$ 或 $\pi$ 时：当向量平行时。

(4) 每个 $\vb{a}\times\vb{b}$ 的分量都是 $\vb{a}$ 的分量乘以 $\vb{b}$ 的分量的和，因此它在求和时保持一致，并且与 $k$ 成比例。
:::

```check
same(expand(A3v.dot(A3v.cross(B3v))), 0); same(expand(B3v.dot(A3v.cross(B3v))), 0)
same(expand(A3v.cross(B3v).dot(A3v.cross(B3v))), expand(A3v.dot(A3v)*B3v.dot(B3v) - A3v.dot(B3v)**2))
same(expand(A3v.dot(A3v)*B3v.dot(B3v)*(1 - cos(theta)**2)), expand(A3v.dot(A3v)*B3v.dot(B3v)*sin(theta)**2))
same(B3v.cross(A3v), -A3v.cross(B3v)); same(A3v.cross(k*A3v), zeros(3, 1))
C3v = Matrix(symbols('c1:4'))
same(A3v.cross(B3v + C3v), A3v.cross(B3v) + A3v.cross(C3v)); same((k*A3v).cross(B3v), k*A3v.cross(B3v)); same(A3v.cross(k*B3v), k*A3v.cross(B3v))
```

对于两个非零且不平行的向量，定理 16.5 确定 $\vb{a}\times\vb{b}$ 所指的直线及其长度，这仅留下两个相反方向。由于 $\vb{i}\times\vb{j} = \vb{k}$，选择遵循右手定则来安排坐标轴：如果右手手指从 $\vb{a}$ 朝 $\vb{b}$ 旋转通过角度 $\theta$，拇指则指向 $\vb{a}\times\vb{b}$（图 16.5，右）。（证明思路：将 $\vb{a}$ 和 $\vb{b}$ 逐渐变为 $\vb{i}$ 和 $\vb{j}$，始终不平行； $\vb{a}\times\vb{b}$ 逐渐变化，始终不等于 $\vb{0}$，因此不能跳到相反方向。）如果任一向量为零或两者平行，它们的叉乘为零，没有方向。对于单位向量，

$$\begin{aligned} \vb{i}\times\vb{j} &= \vb{k}, & \vb{j}\times\vb{k} &= \vb{i}, & \vb{k}\times\vb{i} &= \vb{j}, \\ \vb{j}\times\vb{i} &= -\vb{k}, & \vb{k}\times\vb{j} &= -\vb{i}, & \vb{i}\times\vb{k} &= -\vb{j}, \end{aligned}$$

和 $\vb{i}\times\vb{i} = \vb{j}\times\vb{j} = \vb{k}\times\vb{k} = \vb{0}$。

```check
same([iv.cross(jv), jv.cross(kv), kv.cross(iv)], [kv, iv, jv]); same([jv.cross(iv), kv.cross(jv), iv.cross(kv)], [-kv, -iv, -jv])
same([iv.cross(iv), jv.cross(jv), kv.cross(kv)], [zeros(3, 1)]*3)
```

::: pitfall
叉乘不满足交换律， $\vb{b}\times\vb{a} = -(\vb{a}\times\vb{b})$，也不满足结合律： $(\vb{i}\times\vb{i})\times\vb{j} = \vb{0}\times\vb{j} = \vb{0}$，但 $\vb{i}\times(\vb{i}\times\vb{j}) = \vb{i}\times\vb{k} = -\vb{j}$。保持顺序和括号。并且不要在行列式中间项的负号上省略。

```check
same(iv.cross(iv).cross(jv), zeros(3, 1)); same(iv.cross(iv.cross(jv)), -jv)
```
:::

::: example 叉乘与面积
(a) 对于 $\vb{a} = \langle 2, -1, 2\rangle$ 和 $\vb{b} = \langle 1, 3, 0\rangle$ (例 16.9)，求 $\vb{a}\times\vb{b}$，检查它是否与两个向量正交，并求出它们所张平行四边形的面积。(b) 求顶点为 $P(1, 0, 1)$、 $Q(2, 2, 0)$ 和 $R(0, 1, 3)$ 的三角形的面积。

**(a)** 展开行列式：

$$\begin{aligned} \vb{a}\times\vb{b} &= \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ 2 & -1 & 2 \\ 1 & 3 & 0 \end{vmatrix} \\ &= \big((-1)\cdot0 - 2\cdot3\big)\vb{i} - \big(2\cdot0 - 2\cdot1\big)\vb{j} \\ &\qquad + \big(2\cdot3 - (-1)\cdot1\big)\vb{k} \\ &= -6\vb{i} + 2\vb{j} + 7\vb{k} = \langle -6, 2, 7\rangle. \end{aligned}$$

检查： $\langle 2, -1, 2\rangle\cdot\langle -6, 2, 7\rangle = -12 - 2 + 14 = 0$ 和 $\langle 1, 3, 0\rangle\cdot\langle -6, 2, 7\rangle = -6 + 6 + 0 = 0$。面积是 $\norm{\vb{a}\times\vb{b}} = \sqrt{36 + 4 + 49} = \sqrt{89} \approx 9.434$。拉格朗日恒等式一致： $\norm{\vb{a}}^2\norm{\vb{b}}^2 - (\vb{a}\cdot\vb{b})^2 = 9\cdot10 - (-1)^2 = 89$。

**(b)** 三角形是向量 $\overrightarrow{PQ} = \langle 1, 2, -1\rangle$ 和 $\overrightarrow{PR} = \langle -1, 1, 2\rangle$ 所张平行四边形的一半。它们的叉乘是

$$\begin{aligned} \overrightarrow{PQ}\times\overrightarrow{PR} &= \big\langle 2\cdot2 - (-1)\cdot1,\ (-1)(-1) - 1\cdot2,\ 1\cdot1 - 2\cdot(-1)\big\rangle \\ &= \langle 5, -1, 3\rangle, \end{aligned}$$

长度为 $\sqrt{25 + 1 + 9} = \sqrt{35}$，因此三角形的面积是 $\tfrac12\sqrt{35} \approx 2.958$。

```check
cr = av.cross(bv)
steps(cr, Matrix([(-1)*0 - 2*3, -(2*0 - 2*1), 2*3 - (-1)*1]), Matrix([-6, 2, 7]))
same(Matrix([[I_, J_, K_], [2, -1, 2], [1, 3, 0]]).det(), -6*I_ + 2*J_ + 7*K_)
same(av.dot(cr), 0); same(bv.dot(cr), 0); steps(av.dot(cr), -12 - 2 + 14, 0); steps(bv.dot(cr), -6 + 6 + 0, 0)
steps(cr.norm(), sqrt(36 + 4 + 49), sqrt(89)); rounds(sqrt(89), '9.434'); same(av.norm()**2*bv.norm()**2 - av.dot(bv)**2, 89)
Pp, Qp, Rp = Matrix([1, 0, 1]), Matrix([2, 2, 0]), Matrix([0, 1, 3])
same(Qp - Pp, Matrix([1, 2, -1])); same(Rp - Pp, Matrix([-1, 1, 2]))
same((Qp - Pp).cross(Rp - Pp), Matrix([5, -1, 3])); same(Matrix([5, -1, 3]).norm(), sqrt(35)); rounds(sqrt(35)/2, '2.958')
```
:::

**力矩。**在位置矢量$\vb{r}$处施加力$\vb{F}$（从选定点$O$测量），关于$O$**$\boldsymbol{\tau} = \vb{r}\times\vb{F}$（$\tau$为希腊字母tau）的力矩为**。这衡量了其转动效应，如扳手转动螺栓。对于非零且不平行的$\vb{r}$和$\vb{F}$，其长度为$\norm{\vb{r}}\,\norm{\vb{F}}\sin\theta$，方向由右手定则垂直于其所在平面；否则力矩为零。对于通过$O$且具有单位方向$\vb{u}$的固定旋转轴，关于该轴的有符号力矩为分量$\boldsymbol{\tau}\cdot\vb{u}$。对于垂直于螺栓平面内的扳手和力，力矩沿螺栓方向。在距螺栓0.25 m处施加垂直于扳手的40 N力，产生长度为$0.25\cdot40 = 10$牛顿米（N·m）的力矩；在$60^\circ$处，为$10\sin 60^\circ = 5\sqrt3 \approx 8.66$ N·m。

```check
same(Rational(1, 4)*40*sin(pi/2), 10); steps(10*sin(pi/3), 5*sqrt(3)); rounds(5*sqrt(3), '8.66')
same(Matrix([Rational(1, 4), 0, 0]).cross(Matrix([0, 40, 0])), Matrix([0, 0, 10]))
same(Matrix([Rational(1, 4), 0, 0]).cross(Matrix([40*cos(pi/3), 40*sin(pi/3), 0])), Matrix([0, 0, 5*sqrt(3)]))
```

**三维运算。** 对于平面中的向量，写作 $\langle a_1, a_2, 0\rangle$ 和 $\langle b_1, b_2, 0\rangle$，叉乘 $\langle 0, 0, a_1b_2 - a_2b_1\rangle$ 垂直于该平面，其长度 $\abs{a_1b_2 - a_2b_1}$ 是这两个向量所张平行四边形的面积。三维空间中两个不平行的向量确定一条垂直线。在四维或更高维空间中，同时垂直于这两个向量的向量填满至少一个平面，这些条件不会唯一确定一条直线。因此，此处的构造方式不像点积那样可以推广到更高维空间。

```check
same(Matrix([a1_, a2_, 0]).cross(Matrix([b1_, b2_, 0])), Matrix([0, 0, a1_*b2_ - a2_*b1_]))
same(Matrix([[3, 1], [1, 2]]).det(), 5); same(Matrix([3, 1, 0]).cross(Matrix([1, 2, 0])).norm(), 5)
w4 = Matrix(symbols('w1:5')); e1_, e2_ = Matrix([1, 0, 0, 0]), Matrix([0, 1, 0, 0])
sol4 = solve([e1_.dot(w4), e2_.dot(w4)], list(w4)); same(sol4, {w4[0]: 0, w4[1]: 0})   # in 4D, w3 and w4 stay free: a whole plane
```

## 直线与平面 {#lines-planes}

### 直线 {#lines}

平面中一条非垂直直线由一个点和一个斜率确定。方向向量也可用于处理垂直直线和空间中的直线：选择 $\vb{v} \ne \vb{0}$ 平行于该直线。若 $\vb{r}_0$ 是直线上的点 $P_0$ 的位置向量，那么位置向量为 $\vb{r}$ 的点位于该直线上，当且仅当 $\vb{r} - \vb{r}_0$ 是 $\vb{v}$ 的一个倍数，即

$$\vb{r} = \vb{r}_0 + t\,\vb{v}$$

对于某个数 $t$。这是该直线的一个 **向量方程**。利用 $\vb{r} = \langle x, y, z\rangle$、 $\vb{r}_0 = \langle x_0, y_0, z_0\rangle$ 和 $\vb{v} = \langle a, b, c\rangle$，比较分量可得到 **参数方程**，

$$x = x_0 + at, \qquad y = y_0 + bt, \qquad z = z_0 + ct,$$

空间中以参数 $t$ 表示的参数曲线：沿直线以恒定速度 $\vb{v}$ 运动的点。若 $a$、$b$ 和 $c$ 均非零，将每个方程解出 $t$ 并令结果相等，得到 **对称方程**，

$$\frac{x - x_0}{a} = \frac{y - y_0}{b} = \frac{z - z_0}{c}.$$

::: example 通过两点的直线
求通过 $A(1, 2, 3)$ 和 $B(3, 3, 1)$ 的直线的向量方程、参数方程和对称方程。它在 $xy$ 平面上的交点在哪里？$C(5, 4, -1)$ 和 $D(7, 5, -2)$ 是否在该直线上？

一个方向是 $\vb{v} = \overrightarrow{AB} = \langle 2, 1, -2\rangle$。对于 $P_0 = A$：

$$\begin{aligned} &\vb{r} = \langle 1, 2, 3\rangle + t\langle 2, 1, -2\rangle; \\ &x = 1 + 2t, \quad y = 2 + t, \quad z = 3 - 2t; \\ &\frac{x - 1}{2} = \frac{y - 2}{1} = \frac{z - 3}{-2}. \end{aligned}$$

参数在 $A$ 处为 $t = 0$，在 $B$ 处为 $t = 1$。直线在 $xy$ 平面上的交点为 $z = 3 - 2t = 0$，在 $t = \tfrac32$ 处：点 $\big(4, \tfrac72, 0\big)$。对于 $C$，需要 $1 + 2t = 5$ 的 $x$ 坐标，因此 $t = 2$；然后 $y = 4$ 和 $z = -1$，它们一致： $C$ 在直线上。对于 $D$， $1 + 2t = 7$ 给出 $t = 3$，然后 $y = 5$ 但 $z = -3 \ne -2$： $D$ 不在直线上。

```check
Ap_, Bp_ = Matrix([1, 2, 3]), Matrix([3, 3, 1]); vv = Bp_ - Ap_
same(vv, Matrix([2, 1, -2])); Lr = Ap_ + t*vv
same(Lr.subs(t, 0), Ap_); same(Lr.subs(t, 1), Bp_)
same(solve(Lr[2], t), [Rational(3, 2)]); same(Lr.subs(t, Rational(3, 2)), Matrix([4, Rational(7, 2), 0]))
same(solve(Lr[0] - 5, t), [2]); same(Lr.subs(t, 2), Matrix([5, 4, -1]))
same(solve(Lr[0] - 7, t), [3]); same(Lr.subs(t, 3), Matrix([7, 5, -3]))
same([((Lr[0] - 1)/2), (Lr[1] - 2)/1, (Lr[2] - 3)/(-2)], [t, t, t])
```
:::

平面上的两条直线要么相交，要么平行。在空间中还存在第三种可能性：既不平行又永不相交的直线，例如一条公路在桥上跨越铁路，这样的直线称为 **skew**。

### 平面 {#planes}

空间中由平面上一点 $P_0$ 及其指向由垂直于该平面的法向量 $\vb{n} \ne \vb{0}$（**normal vector**）所确定的方向固定的平面。位置向量为 $\vb{r}$ 的点 $P$ 位于该平面上，当且仅当从 $P_0$ 到 $P$ 的向量 $\vb{r} - \vb{r}_0$ 位于该平面内，即与 $\vb{n}$ 正交：

$$\vb{n}\cdot(\vb{r} - \vb{r}_0) = 0.$$

用 $\vb{n} = \langle a, b, c\rangle$ 表示，即

$$a(x - x_0) + b(y - y_0) + c(z - z_0) = 0,$$

或者展开为 $ax + by + cz = d$，其中 $d = ax_0 + by_0 + cz_0$。

反之，如果 $a$, $b$ 和 $c$ 并非全为 0，那么 $ax + by + cz = d$ 的解构成一个平面，其法向量为 $\langle a, b, c\rangle$：选取一个解作为 $P_0$，方程表示为 $\vb{n}\cdot(\vb{r} - \vb{r}_0) = 0$。因此，一个关于 $x$, $y$ 和 $z$ 的线性方程描述的是一个平面，而不是一条直线。一条直线可以用参数方程描述，也可以描述为两个非平行法向量平面的交线。

```check
xs_, ys_, zs_, x0_, y0_, z0_, aa_, bb_, cc_ = symbols('x y z x0 y0 z0 a b c')
same(Matrix([aa_, bb_, cc_]).dot(Matrix([xs_ - x0_, ys_ - y0_, zs_ - z0_])), aa_*(xs_ - x0_) + bb_*(ys_ - y0_) + cc_*(zs_ - z0_))
same(expand(aa_*(xs_ - x0_) + bb_*(ys_ - y0_) + cc_*(zs_ - z0_)), aa_*xs_ + bb_*ys_ + cc_*zs_ - (aa_*x0_ + bb_*y0_ + cc_*z0_))
```

::: example 通过三个点的平面
求通过 $P(1, 0, 1)$, $Q(2, 2, 0)$ 和 $R(0, 1, 3)$ 的平面方程。

向量 $\overrightarrow{PQ}$ 和 $\overrightarrow{PR}$ 位于该平面内，因此它们的叉乘是一个法向量。例 16.14(b) 求得该法向量为 $\vb{n} = \langle 5, -1, 3\rangle$。通过点 $P$ 且具有该法向量的平面为

$$5(x - 1) - (y - 0) + 3(z - 1) = 0, \quad\text{that is,}\quad 5x - y + 3z = 8.$$

用三个点 $5 - 0 + 3 = 8$, $10 - 2 + 0 = 8$ 和 $0 - 1 + 9 = 8$ 验证：任何非零倍数的 $\vb{n}$ 也是该平面的法向量： $10x - 2y + 6z = 16$ 表示的是同一个平面。

```check
nP = (Qp - Pp).cross(Rp - Pp); same(nP, Matrix([5, -1, 3]))
same(expand(5*(x - 1) - (y - 0) + 3*(z - 1)), 5*x - y + 3*z - 8)
same([5*q_[0] - q_[1] + 3*q_[2] for q_ in (Pp, Qp, Rp)], [8, 8, 8])
same(solve(10*x - 2*y + 6*z - 16, x), solve(5*x - y + 3*z - 8, x))
```
:::

两个平面之间的夹角是它们法向量之间的夹角（或 $\pi$ 减去该角，取其中不超过 $\pi/2$ 者）。法向量平行意味着平面平行或是同一平面。

::: theorem 点到平面的距离
点 $P_1(x_1, y_1, z_1)$ 到平面 $ax + by + cz = d$ 的距离为下式，其中 $a$、$b$、$c$ 不全为零：

$$D = \frac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}}.$$
:::

::: proof
如果 $P_1$ 位于平面内，其距离为 0，且公式的分子为 0。否则，令 $\vb{n} = \langle a, b, c\rangle$，令 $P_0$ 为平面内的任意一点，令 $F$ 为从 $P_1$ 向平面作垂线的垂足，即通过 $P_1$ 且方向为 $\vb{n}$ 的直线与平面的交点。对于平面内的任意其他点 $X$，三角形 $P_1FX$ 在 $F$ 处有一个直角，因此 $\abs{P_1X}^2 = \abs{P_1F}^2 + \abs{FX}^2 \ge \abs{P_1F}^2$: $F$ 是平面内最接近 $P_1$ 的点，且 $D = \abs{P_1F}$。现在 $\overrightarrow{P_0P_1} = \overrightarrow{P_0F} + \overrightarrow{FP_1}$，其中 $\overrightarrow{P_0F}$ 位于平面内，垂直于 $\vb{n}$，且 $\overrightarrow{FP_1}$ 平行于 $\vb{n}$。因此 $\overrightarrow{FP_1}$ 是 $\overrightarrow{P_0P_1}$ 在 $\vb{n}$ 上的向量投影，其长度是标量投影的绝对值：

$$\begin{aligned} D &= \frac{\abs{\vb{n}\cdot\overrightarrow{P_0P_1}}}{\norm{\vb{n}}} = \frac{\abs{a(x_1 - x_0) + b(y_1 - y_0) + c(z_1 - z_0)}}{\sqrt{a^2 + b^2 + c^2}} \\ &= \frac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}}, \end{aligned}$$

因为 $ax_0 + by_0 + cz_0 = d$。
:::

```check
x1s, y1s, z1s, sF = symbols('x1 y1 z1 s', real=True)
nv_ = Matrix([aa_, bb_, cc_]); P1v = Matrix([x1s, y1s, z1s])
sF_ = solve(nv_.dot(P1v + sF*nv_) - (aa_*x0_ + bb_*y0_ + cc_*z0_), sF)[0]            # where the line through P1 along n meets the plane
Fv = P1v + sF_*nv_; same(nv_.dot(Fv), aa_*x0_ + bb_*y0_ + cc_*z0_)
P0v = Matrix([x0_, y0_, z0_])
same(P1v - Fv, (nv_.dot(P1v - P0v)/nv_.dot(nv_))*nv_)                               # F P1 is the projection of P0 P1 onto n
same(nv_.dot(P1v - P0v), aa_*x1s + bb_*y1s + cc_*z1s - (aa_*x0_ + bb_*y0_ + cc_*z0_))
```

::: example 到平面的距离
求点 $S(2, 3, 4)$ 和原点到例 16.16 中平面 $5x - y + 3z = 8$ 的距离。

这里 $\sqrt{a^2 + b^2 + c^2} = \sqrt{25 + 1 + 9} = \sqrt{35}$。对于 $S$，

$$D = \frac{\abs{5\cdot2 - 3 + 3\cdot4 - 8}}{\sqrt{35}} = \frac{11}{\sqrt{35}} \approx 1.859,$$

而对于原点， $D = \dfrac{\abs{0 - 8}}{\sqrt{35}} = \dfrac{8}{\sqrt{35}} \approx 1.352$。

```check
Dpl = lambda X_, Y_, Z_: Abs(5*X_ - Y_ + 3*Z_ - 8)/sqrt(25 + 1 + 9)
same(sqrt(25 + 1 + 9), sqrt(35)); same(Dpl(2, 3, 4), 11/sqrt(35)); rounds(11/sqrt(35), '1.859'); same(Dpl(0, 0, 0), 8/sqrt(35)); rounds(8/sqrt(35), '1.352')
same(Dpl(1, 0, 1), 0)                                                # a point already in the plane
sS = symbols('s'); foot = Matrix([2, 3, 4]) + sS*Matrix([5, -1, 3]); sf_ = solve(5*foot[0] - foot[1] + 3*foot[2] - 8, sS)[0]
same((foot.subs(sS, sf_) - Matrix([2, 3, 4])).norm(), 11/sqrt(35))        # the same distance through the foot of the perpendicular
```
:::

::: compute 向量与 SymPy 和 NumPy
在 SymPy 中，向量是一个 `Matrix` 且具有一个列。 `dot`、`cross` 和 `norm` 的作用与其名称一致：

```python
import sympy as sp
a = sp.Matrix([2, -1, 2])
b = sp.Matrix([1, 3, 0])
print(a.dot(b), a.norm(), b.norm())
print(a.cross(b).T, a.cross(b).norm())
angle = sp.acos(a.dot(b)/(a.norm()*b.norm()))
print(angle, sp.N(angle*180/sp.pi, 6))
```

```output
-1 3 sqrt(10)
Matrix([[-6, 2, 7]]) sqrt(89)
acos(-sqrt(10)/30) 96.0508
```

SymPy 将列向量打印为矩阵； `.T`（转置）将向量打印为一行。角度以精确形式输出， $-\tfrac{1}{3\sqrt{10}}$ 以 $-\tfrac{\sqrt{10}}{30}$ 形式表示（SymPy 将根号移出分母），然后以度数表示。通过三个点确定的平面，以及 $S$ 到该平面的距离：

```python
P, Q, R = sp.Matrix([1, 0, 1]), sp.Matrix([2, 2, 0]), sp.Matrix([0, 1, 3])
n = (Q - P).cross(R - P)
x, y, z = sp.symbols('x y z')
print(n.T, sp.expand(n.dot(sp.Matrix([x, y, z]) - P)))
S = sp.Matrix([2, 3, 4])
print(sp.Abs(n.dot(S - P))/n.norm())
```

```output
Matrix([[5, -1, 3]]) 5*x - y + 3*z - 8
11*sqrt(35)/35
```

平面以等于 0 的表达式打印， $5x - y + 3z - 8 = 0$，距离 $11/\sqrt{35}$ 以 $11\sqrt{35}/35$ 表示。NumPy 使用十进制，适用于大量或测量数据：

```python
import numpy as np
a, b = np.array([2, -1, 2]), np.array([1, 3, 0])
print(np.dot(a, b), np.cross(a, b), np.linalg.norm(a))
cos_t = np.dot(a, b)/(np.linalg.norm(a)*np.linalg.norm(b))
print(np.degrees(np.arccos(cos_t)))
```

```output
-1 [-6  2  7] 3.0
96.05074601591174
```
:::

## 向量函数与运动 {#motion}

一个在空间中运动的点有三个坐标，每个坐标都是时间的函数。将它们合并为一个向量。

::: definition 向量函数
一个 **向量函数** 将其定义域中的每个数 $t$ 分配一个向量：

$$\vb{r}(t) = \langle f(t), g(t), h(t)\rangle = f(t)\,\vb{i} + g(t)\,\vb{j} + h(t)\,\vb{k}.$$

$f$、$g$、$h$ 称为它的**分量函数**。极限按分量计算。若三个极限均存在，则 $\lim_{t\to a}\vb{r}(t) = \big\langle \lim_{t\to a} f(t), \lim_{t\to a} g(t), \lim_{t\to a} h(t)\big\rangle$。若 $f$、$g$、$h$ 在该点连续，则 $\vb{r}$ **在 $a$ 处连续**。如果分量函数在某个区间上连续，从原点画出的 $\vb{r}(t)$ 的端点就会随 $t$ 在该区间内变化而描绘出一条**空间曲线**。
:::

第16.1节的参数曲线是平面上的向量函数，具有两个分量，而第16.7节的直线$\vb{r} = \vb{r}_0 + t\vb{v}$是空间中的一条。一个新例子：$\vb{r}(t) = \langle \cos t, \sin t, t\rangle$。其前两个分量绕单位圆旋转（例16.1），而其高度$z = t$稳步上升。因此，该曲线绕圆柱$x^2 + y^2 = 1$缠绕，每转一圈上升$2\pi$：它是一条**螺旋线**，即弹簧、螺旋楼梯以及DNA每条链的形状。

```check
tR = symbols('t', real=True); rh = Matrix([cos(tR), sin(tR), tR])
same(rh[0]**2 + rh[1]**2, 1); same(rh.subs(tR, tR + 2*pi) - rh, Matrix([0, 0, 2*pi]))
```

### 速度与加速度 {#velocity}

::: definition 向量函数的导数
$\vb{r}$ 的**导数**定义为

$$\vb{r}'(t) = \lim_{h\to0} \frac{\vb{r}(t + h) - \vb{r}(t)}{h},$$

前提是该极限存在。差商按分量计算，所以 $\vb{r}'(t) = \langle f'(t), g'(t), h'(t)\rangle$，即对各个分量分别求导。
:::

几何上，$\vb{r}(t + h) - \vb{r}(t)$是从曲线上一点到邻近一点的向量，即割线；除以$h$对其进行缩放，当$h \to 0$时，其方向变为切线的方向。因此，在$\vb{r}'(t) \ne \vb{0}$处，它是一个**切向量**，指向曲线追踪的方向。如果$t$是时间，导数具有模块4中沿直线运动的名称（[第4.6节](module_04_ZH.html#motion)]），现在作为向量：**速度**是$\vb{v}(t) = \vb{r}'(t)$，**速率**是其长度$\norm{\vb{v}(t)}$，**加速度**是$\vb{a}(t) = \vb{v}'(t) = \vb{r}''(t)$。对于平面中的参数曲线，速度是第16.2节中的箭头$\langle x'(t), y'(t)\rangle$。一次处理一个分量，模块4和5的规则延续：$(\vb{u} + \vb{w})' = \vb{u}' + \vb{w}'$，$(f\vb{u})' = f'\vb{u} + f\vb{u}'$对于标量函数$f$，链式法则$\big(\vb{u}(f(t))\big)' = f'(t)\,\vb{u}'\big(f(t)\big)$，以及两个乘积法则：

$$(\vb{u}\cdot\vb{w})' = \vb{u}'\cdot\vb{w} + \vb{u}\cdot\vb{w}', \qquad (\vb{u}\times\vb{w})' = \vb{u}'\times\vb{w} + \vb{u}\times\vb{w}'.$$

对于第一个，$\vb{u}\cdot\vb{w} = u_1w_1 + u_2w_2 + u_3w_3$；对每个项使用乘积法则进行求导，并将作用在$\vb{u}$上的导数项和作用在$\vb{w}$上的导数项分别收集起来。第二个也是用相同的方法证明，且其因子的顺序必须保持不变。

```check
U_ = Matrix([Function('u1')(t), Function('u2')(t), Function('u3')(t)]); W_ = Matrix([Function('w1')(t), Function('w2')(t), Function('w3')(t)])
fS = Function('f')(t)
same(diff(U_ + W_, t), diff(U_, t) + diff(W_, t)); same(diff(fS*U_, t), diff(fS, t)*U_ + fS*diff(U_, t))
same(diff(U_.dot(W_), t), diff(U_, t).dot(W_) + U_.dot(diff(W_, t))); same(diff(U_.cross(W_), t), diff(U_, t).cross(W_) + U_.cross(diff(W_, t)))
same(diff(rh.subs(tR, tR**2), tR), 2*tR*diff(rh, tR).subs(tR, tR**2))
```

一个后果被反复使用。**如果$\norm{\vb{r}(t)}$是常数，那么$\vb{r}(t)\cdot\vb{r}'(t) = 0$**：对$\vb{r}\cdot\vb{r} = c^2$求导得到$2\,\vb{r}\cdot\vb{r}' = 0$。在中心位于原点的球面上运动的点始终以其位置向量为垂直方向运动，因为圆的切线垂直于半径。

```check
rS = Matrix([cos(t)*cos(t**2), cos(t)*sin(t**2), sin(t)])            # a path on the unit sphere
same(rS.dot(rS), 1); same(rS.dot(diff(rS, t)), 0); same(diff(U_.dot(U_), t), 2*U_.dot(diff(U_, t)))
```

::: example 沿螺线运动
一个粒子沿螺线$\vb{r}(t) = \langle \cos t, \sin t, t\rangle$运动。求其速度、速率和加速度，并证明加速度与速度垂直。

对每个分量进行求导：

$$\vb{v}(t) = \langle -\sin t, \cos t, 1\rangle, \qquad \vb{a}(t) = \langle -\cos t, -\sin t, 0\rangle.$$

速率是$\norm{\vb{v}(t)} = \sqrt{\sin^2 t + \cos^2 t + 1} = \sqrt2$，在每一时刻都相同。加速度是水平方向的，长度为1：它是$-\langle \cos t, \sin t, 0\rangle$，指向粒子到螺线轴线的直线方向。并且$\vb{v}\cdot\vb{a} = \sin t\cos t - \sin t\cos t + 0 = 0$。这并非偶然：因为速率恒定，所以$\vb{v}\cdot\vb{v}$恒定，其导数$2\,\vb{v}\cdot\vb{a}$为0（练习16.10）。

```check
vh = diff(rh, tR); ah = diff(vh, tR)
same(vh, Matrix([-sin(tR), cos(tR), 1])); same(ah, Matrix([-cos(tR), -sin(tR), 0]))
steps(vh.norm(), sqrt(sin(tR)**2 + cos(tR)**2 + 1), sqrt(2)); same(ah.norm(), 1); same(ah, -Matrix([cos(tR), sin(tR), 0]))
steps(vh.dot(ah), sin(tR)*cos(tR) - sin(tR)*cos(tR) + 0, 0)
```
:::

### 积分与弧长 {#integrals}

积分同样逐分量进行：$\int_a^b \vb{r}(t)\,dt = \Big\langle \int_a^b f(t)\,dt, \int_a^b g(t)\,dt, \int_a^b h(t)\,dt\Big\rangle$. 应用基本定理（[第10.5节](module_10_ZH.html#ftc2)) 到每个分量：若 $\vb{R}'(t) = \vb{r}(t)$，且 $\vb{r}$ 连续，则

$$\int_a^b \vb{r}(t)\,dt = \vb{R}(b) - \vb{R}(a),$$

且 $\vb{r}$ 的每个原函数都是 $\vb{R}(t) + \vb{C}$ 加上一个常向量 $\vb{C}$。特别地，积分速度得到位置的变化：$\int_a^b \vb{v}(t)\,dt = \vb{r}(b) - \vb{r}(a)$。

```check
same(integrate(vh, (tR, 0, 2*pi)), rh.subs(tR, 2*pi) - rh.subs(tR, 0)); same(integrate(vh, (tR, 0, 2*pi)), Matrix([0, 0, 2*pi]))
```

空间曲线的长度来源于第16.2节中的多边形，每个弦都有一个第三分量。若 $\vb{r}'$ 在 $[a, b]$ 上连续，则路径 $\vb{r}(t)$，$a \le t \le b$ 的长度为

$$L = \int_a^b \norm{\vb{r}'(t)}\,dt = \int_a^b \sqrt{f'(t)^2 + g'(t)^2 + h'(t)^2}\,dt:$$

行驶的距离是速度的积分。螺旋线的一圈长度为

$$L = \int_0^{2\pi} \sqrt2\,dt = 2\pi\sqrt2 \approx 8.886.$$

几何上也是一致的。将圆柱沿垂直直线切开并展开成平面：单位圆变为长度为 $2\pi$ 的一段弧，螺旋线的一圈则变为直角三角形的斜边，其边长为 $2\pi$（绕一圈）和 $2\pi$（上升高度），长度为 $\sqrt{(2\pi)^2 + (2\pi)^2} = 2\pi\sqrt2$。

```check
same(integrate(vh.norm(), (tR, 0, 2*pi)), 2*pi*sqrt(2)); rounds(2*pi*sqrt(2), '8.886'); same(sqrt((2*pi)**2 + (2*pi)**2), 2*pi*sqrt(2))
```

其中 $\vb{r}'(t) \ne \vb{0}$，将其除以长度得到 **单位切向量**

$$\vb{T}(t) = \frac{\vb{r}'(t)}{\norm{\vb{r}'(t)}}.$$

对于螺旋线，$\vb{T}(t) = \tfrac{1}{\sqrt2}\langle -\sin t, \cos t, 1\rangle$；由于$\vb{T}\cdot\vb{k} = \tfrac{1}{\sqrt2} = \cos\tfrac{\pi}{4}$，螺旋线以恒定的角度$\pi/4$沿垂直方向上升。**弧长函数**$s(t) = \int_a^t \norm{\vb{r}'(u)}\,du$测量自时间$a$以来行进的距离，根据微积分基本定理第1部分（[第10.4节](module_10_ZH.html#ftc1)），$ds/dt = \norm{\vb{r}'(t)}$：距离的增长速率由速度给出。

```check
Th = vh/vh.norm(); same(Th, Matrix([-sin(tR), cos(tR), 1])/sqrt(2)); same(Th.norm(), 1); same(Th.dot(kv), 1/sqrt(2)); same(cos(pi/4), 1/sqrt(2))
sfun = Integral(vh.norm().subs(tR, u), (u, 0, tR)); same(diff(sfun, tR), sqrt(2))
```

### 抛体运动 {#projectiles}

抛出一个球或瞄准一股水流。在地球表面附近，忽略空气阻力，将重力建模为大小约为 9.8 m/s² 的恒定向下加速度 $g > 0$。以发射点为原点，$x$ 为水平方向，$y$ 为向上方向，$\vb{a}(t) = \langle 0, -g\rangle$。设抛射体以速度 $v_0 > 0$ 在水平面上方角度 $\alpha$（alpha）处射出，其中 $0 < \alpha < \pi/2$，使得 $\vb{v}(0) = \langle v_0\cos\alpha, v_0\sin\alpha\rangle$ 和 $\vb{r}(0) = \vb{0}$ 成立。在落地前的时间 $t \ge 0$ 内，如模块 13 对 $s'' = 9.8$ 所做的那样，对每个分量进行积分，并通过 $\vb{v}(0)$ 和 $\vb{r}(0)$ 确定常数：

$$\begin{aligned} \vb{v}(t) &= \langle v_0\cos\alpha,\ v_0\sin\alpha - gt\rangle, \\ \vb{r}(t) &= \big\langle (v_0\cos\alpha)\,t,\ (v_0\sin\alpha)\,t - \tfrac12 gt^2\big\rangle. \end{aligned}$$

水平速度永远不会改变；只有垂直速度受到重力影响。对于 $0 < \alpha < \pi/2$，消去 $t = x/(v_0\cos\alpha)$ 得到 $y = (\tan\alpha)\,x - \dfrac{g}{2v_0^2\cos^2\alpha}\,x^2$：轨迹是一条抛物线。

```check
g_, v0_, al_ = symbols('g v_0 alpha', positive=True)
vproj = Matrix([integrate(0, t) + v0_*cos(al_), integrate(-g_, t) + v0_*sin(al_)])
same(vproj, Matrix([v0_*cos(al_), v0_*sin(al_) - g_*t])); same(diff(vproj, t), Matrix([0, -g_])); same(vproj.subs(t, 0), Matrix([v0_*cos(al_), v0_*sin(al_)]))
rproj = Matrix([v0_*cos(al_)*t, v0_*sin(al_)*t - g_*t**2/2])
same(diff(rproj, t), vproj); same(rproj.subs(t, 0), Matrix([0, 0]))
same(rproj[1].subs(t, x/(v0_*cos(al_))), tan(al_)*x - g_/(2*v0_**2*cos(al_)**2)*x**2)
```

**飞行时间、射程和高度。**在水平地面上，抛体在$y = 0$时着陆，即当$t\big(v_0\sin\alpha - \tfrac12 gt\big) = 0$时：在$t = 0$发射时，以及在**飞行时间**$t_f = \dfrac{2v_0\sin\alpha}{g}$时。此时它已行进**射程**

$$R = (v_0\cos\alpha)\,t_f = \frac{2v_0^2\sin\alpha\cos\alpha}{g} = \frac{v_0^2\sin 2\alpha}{g},$$

使用例 16.4 中的倍角公式 $\sin 2\alpha = 2\sin\alpha\cos\alpha$。当垂直速度为 0 时，它达到最高点，即在 $t = v_0\sin\alpha/g$，即飞行时间的一半，此时高度为 $H = \dfrac{v_0^2\sin^2\alpha}{2g}$。以下是在发射速度为 $v_0 = 20$ m/s 且角度分别为 $\pi/12$、 $\pi/6$、 $\pi/4$、 $\pi/3$ 和 $5\pi/12$，即 $15^\circ$、 $30^\circ$、 $45^\circ$、 $60^\circ$ 和 $75^\circ$ 时的三种情况：

```valuetable
alpha = pi/12, pi/6, pi/4, pi/3, 5*pi/12
$t_f\text{ (s)}$ = 40*sin(alpha)/(49/5)
$R\text{ (m)}$ = 400*sin(2*alpha)/(49/5)
$H\text{ (m)}$ = 400*sin(alpha)**2/(98/5)
digits = 4
---
\alpha | t_f\text{ (s)} | R\text{ (m)} | H\text{ (m)}
\frac{\pi}{12} | 1.056 | 20.41 | 1.367
\frac{\pi}{6} | 2.041 | 35.35 | 5.102
\frac{\pi}{4} | 2.886 | 40.82 | 10.20
\frac{\pi}{3} | 3.535 | 35.35 | 15.31
\frac{5 \pi}{12} | 3.943 | 20.41 | 19.04
```

```check
same(solve(t*(v0_*sin(al_) - g_*t/2), t), [0, 2*v0_*sin(al_)/g_]); same(factor(rproj[1]), factor(t*(v0_*sin(al_) - g_*t/2)))
tf_ = 2*v0_*sin(al_)/g_
steps(rproj[0].subs(t, tf_), 2*v0_**2*sin(al_)*cos(al_)/g_, v0_**2*sin(2*al_)/g_)
same(solve(vproj[1], t), [v0_*sin(al_)/g_]); same(v0_*sin(al_)/g_, tf_/2); same(rproj[1].subs(t, v0_*sin(al_)/g_), v0_**2*sin(al_)**2/(2*g_))
same([d_*pi/180 for d_ in (15, 30, 45, 60, 75)], [pi/12, pi/6, pi/4, pi/3, 5*pi/12])
```

**最佳角度。** 哪个角度能获得最远射程？将射程公式扩展到 $[0, \pi/2]$：极限水平发射没有在地面以上的飞行时间，垂直发射没有水平位移，因此两者射程均为 0。在这个闭区间上， $R(\alpha) = \dfrac{v_0^2}{g}\sin 2\alpha$ 是连续的，因此模块 8 中的闭区间方法适用。 $R'(\alpha) = \dfrac{2v_0^2}{g}\cos 2\alpha$ 仅在 $2\alpha = \pi/2$ 处为 0，即 $\alpha = \pi/4$；比较 $R(0) = R(\pi/2) = 0$ 与 $R(\pi/4) = v_0^2/g$，最大射程 $v_0^2/g$ 出现在 $45^\circ$：约 40.82 米，对应 $v_0 = 20$ 米/秒。表格还显示了一种对称性：由于 $\sin(\pi - 2\alpha) = \sin 2\alpha$， $R(\pi/2 - \alpha) = R(\alpha)$，因此互补角度如 $30^\circ$ 和 $60^\circ$ 产生相同的射程。投掷角度越陡，球飞得越高，滞空时间越长，但水平速度越慢。

```check
Ra = v0_**2*sin(2*al_)/g_
same(diff(Ra, al_), 2*v0_**2*cos(2*al_)/g_); same(solveset(cos(2*x), x, Interval(0, pi/2)), FiniteSet(pi/4))
same([Ra.subs(al_, 0), Ra.subs(al_, pi/2), Ra.subs(al_, pi/4)], [0, 0, v0_**2/g_])
rounds(400/Rational(98, 10), '40.82'); same(sin(pi - 2*al_), sin(2*al_)); same(Ra.subs(al_, pi/2 - al_), Ra)
```

::: example 被踢的球
一个球以 20 米/秒的速度从水平地面踢出，角度为 $30^\circ$ 以上水平方向（数值是编造的）。忽略空气阻力，求其飞行 1 秒后的速度、飞行时间、射程和最大高度，以及落地时的速度。

由$v_0 = 20$、$\alpha = \pi/6$和$g = 9.8$可得$v_0\cos\alpha = 10\sqrt3$和$v_0\sin\alpha = 10$，因此$\vb{v}(t) = \big\langle 10\sqrt3, 10 - 9.8t\big\rangle$。1秒后，速度为$\vb{v}(1) = \big\langle 10\sqrt3, 0.2\big\rangle \approx \langle 17.32, 0.2\rangle$ m/s：球仍在上升，但速度较慢。然后

$$\begin{aligned} t_f &= \frac{2\cdot10}{9.8} \approx 2.041\text{ s}, \\ R &= \frac{400\sin 60^\circ}{9.8} = \frac{200\sqrt3}{9.8} \approx 35.35\text{ m}, \\ H &= \frac{400\cdot\frac14}{2\cdot9.8} \approx 5.102\text{ m}. \end{aligned}$$

落地时，$\vb{v}(t_f) = \big\langle 10\sqrt3,\ 10 - 9.8\cdot\tfrac{20}{9.8}\big\rangle = \big\langle 10\sqrt3, -10\big\rangle$，速度为 $\sqrt{300 + 100} = 20$ m/s，方向在水平线下 $30^\circ$：飞行轨迹对称，球落地时的速度与被踢出时的速度相同。

```check
gn = Rational(98, 10); vb = lambda T: Matrix([20*cos(pi/6), 20*sin(pi/6) - gn*T])
same(vb(t), Matrix([10*sqrt(3), 10 - gn*t])); same(vb(1), Matrix([10*sqrt(3), Rational(2, 10)])); rounds(10*sqrt(3), '17.32')
tfb = 2*20*sin(pi/6)/gn; same(tfb, 20/gn); rounds(tfb, '2.041')
steps(400*sin(pi/3)/gn, 200*sqrt(3)/gn); rounds(200*sqrt(3)/gn, '35.35'); same(400*sin(pi/6)**2/(2*gn), 400*Rational(1, 4)/(2*gn)); rounds(100/(2*gn), '5.102')
same(vb(tfb), Matrix([10*sqrt(3), -10])); same(vb(tfb).norm(), 20); same(atan(Rational(10, 1)/(10*sqrt(3))), pi/6)
```
:::

::: pitfall
$45^\circ$ 规则假设投射体落在其发射高度，并且忽略空气阻力。一个从 2 米高处以 14 m/s 发射的铅球（虚构数据，仍忽略空气阻力）在约 $42^\circ$ 角度发射时射程最远，而不是 $45^\circ$。空气阻力也会改变计算；最优角度取决于阻力模型和风速。

```check
import mpmath
mpmath.mp.dps = 30
Rh = lambda A: 14*mpmath.cos(A)/mpmath.mpf('9.8')*(14*mpmath.sin(A) + mpmath.sqrt((14*mpmath.sin(A))**2 + 2*mpmath.mpf('9.8')*2))
abest = mpmath.findroot(lambda A: mpmath.diff(Rh, A), 0.7)
rounds(abest*180/mpmath.pi, '42'); holds(Rh(abest) > Rh(mpmath.pi/4))
yh = 2 + 14*sin(al_)*t - Rational(49, 10)*t**2                       # height of the shot; it lands at the positive root
tl = [s_ for s_ in solve(yh, t) if s_.subs(al_, 1).is_positive][0]
near(N((14*cos(al_)*tl).subs(al_, Rational(7, 10)), 30), Rh(mpmath.mpf('0.7')), 1e-20)
qlaunch = symbols('q_launch', nonnegative=True)                 # q_launch = tan(alpha), 0 <= alpha < pi/2
rangeq = Rational(14, 1)/Rational(49, 5)*(14*qlaunch + sqrt((14**2 + 2*Rational(49, 5)*2)*qlaunch**2 + 2*Rational(49, 5)*2))/(1 + qlaunch**2)
qbest = sqrt(30)/6
same(solve(diff(rangeq, qlaunch), qlaunch), [qbest])             # the only stationary point for q_launch >= 0
same(simplify(rangeq.subs(qlaunch, qbest)), 4*sqrt(30)); same(rangeq.subs(qlaunch, 0), 4*sqrt(5))
limit_is(rangeq, qlaunch, oo, 0); holds(4*sqrt(30) > 4*sqrt(5)); rounds(atan(qbest)*180/pi, '42')
near(abest, N(atan(qbest), 30), 1e-25)
```
:::

::: deeper 曲率
曲线弯曲程度有多高？测量其方向随距离变化的速率。假设 $\vb{r}$ 在考虑区间内具有连续的一阶和二阶导数，且 $\vb{r}'(t) \ne \vb{0}$，因此其单位切向量 $\vb{T}$ 是可导的。其 **曲率** 为

$$\kappa = \Big\|\frac{d\vb{T}}{ds}\Big\| = \frac{\norm{\vb{T}'(t)}}{\norm{\vb{r}'(t)}},$$

其中第二种形式使用了链式法则、$\vb{T}'(t) = \dfrac{d\vb{T}}{ds}\,\dfrac{ds}{dt}$ 和 $ds/dt = \norm{\vb{r}'(t)}$（$\kappa$ 是希腊字母 kappa）。对于半径为 $R$ 的圆，$\vb{r}(t) = \langle R\cos t, R\sin t\rangle$：$\vb{r}'(t) = \langle -R\sin t, R\cos t\rangle$ 的长度为 $R$，因此 $\vb{T} = \langle -\sin t, \cos t\rangle$，$\vb{T}' = \langle -\cos t, -\sin t\rangle$ 的长度为 1，且 $\kappa = 1/R$。小圆弯曲剧烈，大圆弯曲平缓；其 $\vb{T}$ 永不变化的直线曲率为 0。

一个不含$\vb{T}$ 的公式：$\kappa = \dfrac{\norm{\vb{r}'(t)\times\vb{r}''(t)}}{\norm{\vb{r}'(t)}^3}$。为了证明它，写出$s' = \norm{\vb{r}'}$，使得$\vb{r}' = s'\vb{T}$。根据乘积法则，$\vb{r}'' = s''\vb{T} + s'\vb{T}'$，且由于$\vb{T}\times\vb{T} = \vb{0}$，

$$\vb{r}'\times\vb{r}'' = s's''\,(\vb{T}\times\vb{T}) + (s')^2\,(\vb{T}\times\vb{T}') = (s')^2\,(\vb{T}\times\vb{T}').$$

$\vb{T}$ 有常数长度 1，因此 $\vb{T}\cdot\vb{T}' = 0$，如上所示，对于所有常数长度的向量函数均成立。如果 $\vb{T}' \ne \vb{0}$，向量互相垂直，定理 16.5 给出 $\norm{\vb{T}\times\vb{T}'} = 1\cdot\norm{\vb{T}'}\cdot\sin\tfrac{\pi}{2} = \norm{\vb{T}'}$；如果 $\vb{T}' = \vb{0}$，两边均为 0。因此 $\norm{\vb{r}'\times\vb{r}''} = (s')^2\,\norm{\vb{T}'} = (s')^3\kappa$。对于螺旋线 $\vb{r}'\times\vb{r}'' = \langle -\sin t, \cos t, 1\rangle\times\langle -\cos t, -\sin t, 0\rangle = \langle \sin t, -\cos t, 1\rangle$，长度为 $\sqrt2$，且 $\norm{\vb{r}'}^3 = 2\sqrt2$：$\kappa = \tfrac12$。螺旋线弯曲程度是它缠绕的单位圆的一半；爬升使其变直。

同样的计算解释了为什么急转弯是危险的。如果一辆汽车以恒定速度 $v$ 行驶，那么 $s'' = 0$ 且加速度是 $\vb{r}'' = s'\vb{T}'$，其长度为 $v\cdot\kappa v = \kappa v^2$：在半径为 $R$ 的弯道上，汽车需要一个横向加速度 $v^2/R$，该加速度由轮胎的抓地力提供。速度加倍时，所需加速度将变为四倍。

```check
Rr = symbols('R', positive=True)
rc = Matrix([Rr*cos(tR), Rr*sin(tR)]); Tc = diff(rc, tR)/diff(rc, tR).norm()
same(diff(rc, tR).norm(), Rr); same(Tc, Matrix([-sin(tR), cos(tR)])); same(diff(Tc, tR).norm(), 1); same(diff(Tc, tR).norm()/diff(rc, tR).norm(), 1/Rr)
sp_, Tf = Function('s')(t), Matrix([Function('T1')(t), Function('T2')(t), Function('T3')(t)])
r1_ = diff(sp_, t)*Tf; r2_ = diff(r1_, t)
same(r2_, diff(sp_, t, 2)*Tf + diff(sp_, t)*diff(Tf, t)); same(r1_.cross(r2_), diff(sp_, t)**2*Tf.cross(diff(Tf, t)))
same(vh.cross(ah), Matrix([sin(tR), -cos(tR), 1])); same(vh.cross(ah).norm(), sqrt(2)); same(vh.norm()**3, 2*sqrt(2)); same(vh.cross(ah).norm()/vh.norm()**3, Rational(1, 2))
same(diff(Th, tR).norm()/vh.norm(), Rational(1, 2))
vc = symbols('v', positive=True); rcar = Matrix([Rr*cos(vc*tR/Rr), Rr*sin(vc*tR/Rr)])
same(diff(rcar, tR).norm(), vc); same(diff(rcar, tR, 2).norm(), vc**2/Rr)
```
:::

::: compute 带 SymPy 的运动分析
仅从加速度分析抛体运动：进行两次积分，从初始条件选择常数，然后求解落地时间并最大化射程。

```python
import sympy as sp
t, alpha = sp.symbols('t alpha', positive=True)
g, v0 = sp.Rational(98, 10), 20
a = sp.Matrix([0, -g])                       # the acceleration
v_start = sp.Matrix([v0*sp.cos(alpha), v0*sp.sin(alpha)])
v = v_start + sp.integrate(a, (t, 0, t))
r = sp.integrate(v, (t, 0, t))               # starts at the origin
print(r.T)
t_f = sp.solve(r[1], t)
print(t_f)
R = sp.simplify(r[0].subs(t, t_f[0]))
print(R)
critical = sp.solveset(sp.diff(R, alpha), alpha, domain=sp.Interval(0, sp.pi/2))
best = max([0, sp.pi/2, *critical], key=lambda angle: R.subs(alpha, angle))
print(critical, best, R.subs(alpha, best), sp.N(R.subs(alpha, best), 6))
```

```output
Matrix([[20*t*cos(alpha), -49*t**2/10 + 20*t*sin(alpha)]])
[200*sin(alpha)/49]
2000*sin(2*alpha)/49
{pi/4} pi/4 2000/49 40.8163
```

`integrate` 在限 0 和 $t$ 下给出的原函数在 $t = 0$ 处为 0，因此加上初始速度即可确定常数。着陆时间为 $t_f = \tfrac{200}{49}\sin\alpha$，即 $\tfrac{2v_0\sin\alpha}{g}$ 中 $v_0 = 20$ 与 $g = \tfrac{49}{5}$（根 $t = 0$ 被忽略，因为 `t` 被声明为正数），射程为 $R = \tfrac{2000}{49}\sin 2\alpha$。`solveset` 在所给区间 $[0, \pi/2]$ 内找出临界角，仅得到 $\pi/4$。将其射程与端点处的射程比较，选择 $\pi/4$，其中 $R = \tfrac{2000}{49} \approx 40.82$ m。这应用了与上述计算相同的闭区间方法。相同的工具也可用于空间曲线。螺线一匝的长度及其曲率：

```python
r = sp.Matrix([sp.cos(t), sp.sin(t), t])
v, a = r.diff(t), r.diff(t, 2)
speed = sp.simplify(v.norm())
print(speed, sp.integrate(speed, (t, 0, 2*sp.pi)))
print(sp.simplify(v.cross(a).norm()/speed**3))
```

```output
sqrt(2) 2*sqrt(2)*pi
1/2
```
:::

## 你所学到的内容 {#summary}

- 一条参数曲线 $x = f(t)$, $y = g(t)$ 是由一个动点描绘而成的。消去 $t$ 得到一个关于 $x$ 和 $y$ 的方程，但会丢失方向以及描绘的部分。例子：椭圆 $x = a\cos t$, $y = b\sin t$；摆线 $x = r(t - \sin t)$, $y = r(1 - \cos t)$；李萨如曲线。
- 参数曲线的斜率是 $\dfrac{dy}{dx} = \dfrac{dy/dt}{dx/dt}$，其中 $dx/dt \ne 0$：水平切线出现在 $dy/dt = 0$ 和 $dx/dt \ne 0$ 处，垂直切线出现在 $dx/dt = 0$ 和 $dy/dt \ne 0$ 处。如果两个导数都为零，则需单独分析曲线。路径的长度是 $\int_a^b \sqrt{(dx/dt)^2 + (dy/dt)^2}\,dt$，即速度的积分；一个摆线拱的长度是 $8r$。
- 极坐标： $x = r\cos\theta$, $y = r\sin\theta$, $r^2 = x^2 + y^2$，其中 $\theta$ 位于右象限。极坐标曲线 $r = f(\theta)$（圆、心脏线、玫瑰线、螺线）是参数曲线，参数为 $\theta$；它们扫过的面积是 $\tfrac12\int_\alpha^\beta r^2\,d\theta$，其积分限能一次描绘出该区域。
- 向量 $\langle a_1, a_2, a_3\rangle = a_1\vb{i} + a_2\vb{j} + a_3\vb{k}$ 有长度，当非零时还有方向。它们按首尾相接的方式相加，按分量分别进行缩放，用于表示位移、速度和力。
- 点积 $\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3$ 可给出角度、正交性（$\vb{a}\cdot\vb{b} = 0$）、投影和功， $W = \vb{F}\cdot\vb{D}$。对于非零向量， $\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta$。
- 在三维空间中，叉乘 $\vb{a}\times\vb{b}$ 与 $\vb{a}$ 和 $\vb{b}$ 垂直。其长度是它们所张平行四边形的面积：$\norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$ 对于非零输入。当非零时，它遵循右手定则；$\vb{b}\times\vb{a} = -\vb{a}\times\vb{b}$。关于选定点的力矩是 $\vb{r}\times\vb{F}$，其中 $\vb{r}$ 从该点指向力的作用点。
- 一条直线是 $\vb{r} = \vb{r}_0 + t\vb{v}$ 与 $\vb{v} \ne \vb{0}$；一个平面是 $\vb{n}\cdot(\vb{r} - \vb{r}_0) = 0$ 与 $\vb{n} \ne \vb{0}$，即 $ax + by + cz = d$。两个非平行方向的叉乘给出一个法向量；点到平面的距离是 $\abs{ax_1 + by_1 + cz_1 - d}/\sqrt{a^2 + b^2 + c^2}$。
- 向量函数按分量进行求导和积分：速度 $\vb{r}'$，速度大小 $\norm{\vb{r}'}$，加速度 $\vb{r}''$，单位切向量 $\vb{T}$，长度 $\int_a^b \norm{\vb{r}'(t)}\,dt$。
- 没有空气阻力的抛射体遵循 $\vb{r}(t) = \big\langle (v_0\cos\alpha)t, (v_0\sin\alpha)t - \tfrac12gt^2\big\rangle$；在水平地面上，其射程 $v_0^2\sin 2\alpha/g$ 在 $45^\circ$ 时最大。

## 练习 {#exercises}

:::: exercise 消去参数 {#ex-16-1} ★
消去参数，并描述曲线：它从哪里到哪里被描绘？

- (a) $x = 2t - 1$, $y = 4 - t$, $0 \le t \le 2$
- (b) $x = 2\cos t$, $y = 5\sin t$, $0 \le t \le \pi$
- (c) $x = \cosh t$，$y = \sinh t$，其中 $t$ 可取任意实数（双曲函数见[第 6.7 节](module_06_ZH.html#hyperbolic)）
- (d) $x = \sqrt t$, $y = 1 - t$, $t \ge 0$

::: solution
**(a)** $t = \dfrac{x + 1}{2}$, 所以 $y = 4 - \dfrac{x + 1}{2} = \dfrac{7 - x}{2}$: 一条斜率为 $-\tfrac12$ 的直线。仅使用 $0 \le t \le 2$，因此曲线是从 $(-1, 4)$（在 $t = 0$ 处）到 $(3, 2)$（在 $t = 2$ 处）的线段。

**(b)** $\dfrac{x^2}{4} + \dfrac{y^2}{25} = \cos^2 t + \sin^2 t = 1$: 一个椭圆，交 $x$ 轴于 $\pm2$，交 $y$ 轴于 $\pm5$。对于 $0 \le t \le \pi$, $y = 5\sin t \ge 0$: 上半部分，从 $(2, 0)$ 逆时针追踪至 $(-2, 0)$。

**(c)** 根据 模块 6 中的恒等式 $\cosh^2 t - \sinh^2 t = 1$， $x^2 - y^2 = 1$: 双曲线。但 $x = \cosh t \ge 1$，因此只追踪其右支；当 $t$ 增加时， $y = \sinh t$ 通过每一个实数，因此从下到上追踪整个右支（在 $\sinh t = y$, $x = \cosh t = \sqrt{1 + y^2}$ 点处）。

**(d)** 由 $x = \sqrt t$, $x \ge 0$ 和 $t = x^2$，所以 $y = 1 - x^2$ 与 $x \ge 0$: 抛物线右半部分，开口向下，从 $(0, 1)$ 向右下方追踪。忽略 $x \ge 0$ 会得到整个抛物线。

```check
same(solve(Eq(x, 2*t - 1), t), [(x + 1)/2]); same((4 - t).subs(t, (x + 1)/2), (7 - x)/2); same([((7 - x)/2).subs(x, v) for v in (-1, 3)], [4, 2])
same(((2*t - 1).subs(t, 0), (4 - t).subs(t, 0)), (-1, 4)); same(((2*t - 1).subs(t, 2), (4 - t).subs(t, 2)), (3, 2))
same((2*cos(t))**2/4 + (5*sin(t))**2/25, 1); same(((2*cos(0)), 5*sin(0)), (2, 0)); same((2*cos(pi), 5*sin(pi)), (-2, 0))
same(cosh(t)**2 - sinh(t)**2, 1); same(minimum(cosh(x), x, S.Reals), 1); same(diff(sinh(t), t), cosh(t))
same(sinh(asinh(y)), y); same(cosh(asinh(y)), sqrt(1 + y**2))
tpos = symbols('t', nonnegative=True); same(sqrt(tpos)**2, tpos); same((1 - x**2).subs(x, sqrt(tpos)), 1 - tpos)
```
:::
::::

:::: exercise 极坐标 {#ex-16-2} ★
- (a) 求极坐标点 $(6, -\pi/3)$ 和 $(-4, 7\pi/6)$ 的直角坐标。
- (b) 求 $(0, -5)$ 和 $(\sqrt3, -1)$ 的极坐标，分别对应 $r > 0$ 和 $0 \le \theta < 2\pi$。
- (c) 将 $r = 4\cos\theta$ 表示为 $x$ 和 $y$ 的方程，并描述该曲线。

::: solution
**(a)** $\big(6\cos(-\tfrac{\pi}{3}), 6\sin(-\tfrac{\pi}{3})\big) = \big(3, -3\sqrt3\big)$. 对于 $(-4, 7\pi/6)$: $x = -4\cos\tfrac{7\pi}{6} = -4\big(-\tfrac{\sqrt3}{2}\big) = 2\sqrt3$ 和 $y = -4\sin\tfrac{7\pi}{6} = -4\big(-\tfrac12\big) = 2$: 点 $\big(2\sqrt3, 2\big)$，位于第一象限，方向与 $7\pi/6$ 相反。

**(b)** $(0, -5)$ 在原点下方 5 个单位：$r = 5$, $\theta = \tfrac{3\pi}{2}$. (此处 $\tan\theta = y/x$ 未定义，因为 $x = 0$：从图中读取角度.) 对于 $\big(\sqrt3, -1\big)$：$r = \sqrt{3 + 1} = 2$, $\cos\theta = \tfrac{\sqrt3}{2}$ 和 $\sin\theta = -\tfrac12$，因此该点位于第四象限且 $\theta = \tfrac{11\pi}{6}$. (反正切给出 $-\tfrac{\pi}{6}$，方向相同，但超出 $[0, 2\pi)$.)

**(c)** 乘以 $r$： $r^2 = 4r\cos\theta$，即 $x^2 + y^2 = 4x$。完成平方： $(x - 2)^2 + y^2 = 4$，以 $(2, 0)$ 为圆心、半径为 2 的圆，经过极点。 (乘以 $r$ 只能添加极点，而极点已经在曲线上，位于 $\theta = \pi/2$。)

```check
same((6*cos(-pi/3), 6*sin(-pi/3)), (3, -3*sqrt(3))); same((-4*cos(7*pi/6), -4*sin(7*pi/6)), (2*sqrt(3), 2))
same((5*cos(3*pi/2), 5*sin(3*pi/2)), (0, -5)); same(sqrt(3 + 1), 2); same((2*cos(11*pi/6), 2*sin(11*pi/6)), (sqrt(3), -1))
same(atan(-1/sqrt(3)), -pi/6); same(-pi/6 + 2*pi, 11*pi/6)
same(expand((x - 2)**2 + y**2 - 4), x**2 + y**2 - 4*x)
Xc4, Yc4 = 4*cos(theta)*cos(theta), 4*cos(theta)*sin(theta); same((Xc4 - 2)**2 + Yc4**2, 4); same((Xc4.subs(theta, pi/2), Yc4.subs(theta, pi/2)), (0, 0))
```
:::
::::

:::: exercise 向量运算 {#ex-16-3} ★
设 $\vb{u} = \langle 1, -2, 2\rangle$ 和 $\vb{w} = \langle 3, 0, -4\rangle$。

- (a) 求 $\vb{u} + \vb{w}$ 和 $3\vb{u} - 2\vb{w}$。
- (b) 求 $\norm{\vb{u}}$、$\norm{\vb{w}}$ 以及 $\vb{w}$ 方向的单位向量。
- (c) 求 $\vb{u}\cdot\vb{w}$，以及 $\vb{u}$ 与 $\vb{w}$ 之间的夹角。
- (d) 求 $\vb{u}\times\vb{w}$，验证它与 $\vb{u}$ 和 $\vb{w}$ 正交，并求由 $\vb{u}$ 和 $\vb{w}$ 所张平行四边形的面积。

::: solution
**(a)** $\vb{u} + \vb{w} = \langle 4, -2, -2\rangle$ 和 $3\vb{u} - 2\vb{w} = \langle 3 - 6, -6 - 0, 6 + 8\rangle = \langle -3, -6, 14\rangle$。

**(b)** $\norm{\vb{u}} = \sqrt{1 + 4 + 4} = 3$ 和 $\norm{\vb{w}} = \sqrt{9 + 0 + 16} = 5$，因此单位向量是 $\tfrac15\vb{w} = \big\langle \tfrac35, 0, -\tfrac45\big\rangle$。

**(c)** $\vb{u}\cdot\vb{w} = 3 + 0 - 8 = -5$，因此 $\cos\theta = \dfrac{-5}{3\cdot5} = -\dfrac13$ 和 $\theta = \arccos\big(-\tfrac13\big) \approx 109.47^\circ$：例 16.11 中的四面体角。

**(d)** 展开行列式，

$$\begin{aligned} \vb{u}\times\vb{w} &= \big((-2)(-4) - 2\cdot0\big)\vb{i} - \big(1\cdot(-4) - 2\cdot3\big)\vb{j} \\ &\qquad + \big(1\cdot0 - (-2)\cdot3\big)\vb{k} = \langle 8, 10, 6\rangle. \end{aligned}$$

检查： $\vb{u}\cdot\langle 8, 10, 6\rangle = 8 - 20 + 12 = 0$ 和 $\vb{w}\cdot\langle 8, 10, 6\rangle = 24 + 0 - 24 = 0$。面积是 $\sqrt{64 + 100 + 36} = \sqrt{200} = 10\sqrt2 \approx 14.14$；根据拉格朗日恒等式，它也是 $\sqrt{9\cdot25 - (-5)^2} = \sqrt{200}$。中间项是容易出错的地方：忘记它的负号会得到 $\langle 8, -10, 6\rangle$，这与 $\vb{u}$ 不正交。

```check
uu, ww = Matrix([1, -2, 2]), Matrix([3, 0, -4])
same(uu + ww, Matrix([4, -2, -2])); same(3*uu - 2*ww, Matrix([-3, -6, 14]))
same(uu.norm(), 3); same(ww.norm(), 5); same(ww/ww.norm(), Matrix([Rational(3, 5), 0, -Rational(4, 5)]))
same(uu.dot(ww), -5); same(uu.dot(ww)/(uu.norm()*ww.norm()), -Rational(1, 3)); rounds(acos(-Rational(1, 3))*180/pi, '109.47')
same(uu.cross(ww), Matrix([8, 10, 6])); same(Matrix([[I_, J_, K_], [1, -2, 2], [3, 0, -4]]).det(), 8*I_ + 10*J_ + 6*K_)
same(uu.dot(uu.cross(ww)), 0); same(ww.dot(uu.cross(ww)), 0); steps(uu.cross(ww).norm(), sqrt(200), 10*sqrt(2)); rounds(10*sqrt(2), '14.14')
same(sqrt(9*25 - (-5)**2), sqrt(200)); holds(Ne(uu.dot(Matrix([8, -10, 6])), 0))
```
:::
::::

:::: exercise 空间中的一条直线 {#ex-16-4} ★
设 $L$ 是通过 $P(2, 0, -1)$ 和 $Q(5, 2, 3)$ 的直线。

- (a) 给出 $L$ 的向量方程、参数方程和对称方程。
- (b) $(8, 4, 7)$ 是否位于 $L$ 上？是否位于 $(-1, -2, -4)$ 上？
- (c) $L$ 在 $xy$ 平面上的交点在哪里？
- (d) 证明 $L$ 与平面 $2x + y - 2z = 7$ 平行，但不位于该平面内。

::: solution
**(a)** 方向是 $\overrightarrow{PQ} = \langle 3, 2, 4\rangle$，因此 $\vb{r} = \langle 2, 0, -1\rangle + t\langle 3, 2, 4\rangle$；即 $x = 2 + 3t$， $y = 2t$， $z = -1 + 4t$；和 $\dfrac{x - 2}{3} = \dfrac{y}{2} = \dfrac{z + 1}{4}$。

**(b)** 对于 $(8, 4, 7)$： $2 + 3t = 8$ 给出 $t = 2$，然后 $y = 4$ 和 $z = 7$：是的。对于 $(-1, -2, -4)$： $2 + 3t = -1$ 给出 $t = -1$，然后 $y = -2$ 但 $z = -5 \ne -4$：不是。

**(c)** $z = -1 + 4t = 0$ 在 $t = \tfrac14$ 处，点 $\big(\tfrac{11}{4}, \tfrac12, 0\big)$。

**(d)** 平面有法向量 $\vb{n} = \langle 2, 1, -2\rangle$，且 $\vb{n}\cdot\langle 3, 2, 4\rangle = 6 + 2 - 8 = 0$： $L$ 的方向与法向量正交，因此 $L$ 与平面平行。但 $P$ 给出 $2\cdot2 + 0 - 2\cdot(-1) = 6 \ne 7$，因此 $L$ 不在平面内：确实 $2(2 + 3t) + 2t - 2(-1 + 4t) = 6$ 对于每个 $t$，从不为 7，因此 $L$ 永远不相交。

```check
P4, Q4 = Matrix([2, 0, -1]), Matrix([5, 2, 3]); v4 = Q4 - P4; same(v4, Matrix([3, 2, 4])); L4 = P4 + t*v4
same(L4, Matrix([2 + 3*t, 2*t, -1 + 4*t])); same([(L4[0] - 2)/3, L4[1]/2, (L4[2] + 1)/4], [t, t, t])
same(solve(L4[0] - 8, t), [2]); same(L4.subs(t, 2), Matrix([8, 4, 7])); same(solve(L4[0] + 1, t), [-1]); same(L4.subs(t, -1), Matrix([-1, -2, -5]))
same(solve(L4[2], t), [Rational(1, 4)]); same(L4.subs(t, Rational(1, 4)), Matrix([Rational(11, 4), Rational(1, 2), 0]))
same(Matrix([2, 1, -2]).dot(v4), 0); same(2*2 + 0 - 2*(-1), 6); same(expand(2*L4[0] + L4[1] - 2*L4[2]), 6)
```
:::
::::

:::: exercise 八字形 {#ex-16-5} ★★
拉索曲线 $x = \sin t$， $y = \sin 2t$， $0 \le t \le 2\pi$，看起来像一个侧躺的八字形。

- (a) 找出 $[0, 2\pi)$ 中曲线通过原点的两个参数值，并找出该处的两条切线。端点 $t = 2\pi$ 重复起点。
- (b) 找出切线水平和垂直的点。
- (c) 证明曲线上的每一点都满足 $y^2 = 4x^2\big(1 - x^2\big)$。

::: solution
这里 $\dfrac{dx}{dt} = \cos t$ 和 $\dfrac{dy}{dt} = 2\cos 2t$。

**(a)** $x = \sin t = 0$ 在 $t = 0$， $\pi$ 和 $2\pi$，而且那里 $y = \sin 2t = 0$ 也有； $t = 2\pi$ 是环的终点，回到起点，因此曲线在 $t = 0$ 和 $t = \pi$ 处经过原点。在 $t = 0$ 处斜率为 $\dfrac{2\cos 0}{\cos 0} = 2$；在 $t = \pi$ 处斜率为 $\dfrac{2\cos 2\pi}{\cos\pi} = -2$。切线为 $y = 2x$ 和 $y = -2x$。

**(b)** 水平： $\cos 2t = 0$ 在 $t = \tfrac{\pi}{4}, \tfrac{3\pi}{4}, \tfrac{5\pi}{4}, \tfrac{7\pi}{4}$，其中 $\cos t = \pm\tfrac{\sqrt2}{2} \ne 0$。这些点是 $\big(\tfrac{\sqrt2}{2}, 1\big)$、 $\big(\tfrac{\sqrt2}{2}, -1\big)$、 $\big(-\tfrac{\sqrt2}{2}, 1\big)$ 和 $\big(-\tfrac{\sqrt2}{2}, -1\big)$，分别是两个环的顶部和底部。垂直： $\cos t = 0$ 在 $t = \tfrac{\pi}{2}$ 和 $\tfrac{3\pi}{2}$，其中 $\dfrac{dy}{dt} = 2\cos\pi = 2\cos 3\pi = -2 \ne 0$。这些点是 $(1, 0)$ 和 $(-1, 0)$，分别是“八”字的两个端点。

**(c)** 根据二倍角公式， $y = \sin 2t = 2\sin t\cos t$，因此 $y^2 = 4\sin^2 t\cos^2 t = 4\sin^2 t\big(1 - \sin^2 t\big) = 4x^2\big(1 - x^2\big)$。

```check
xf, yf = sin(t), sin(2*t)
same(diff(xf, t), cos(t)); same(diff(yf, t), 2*cos(2*t))
same_set(solveset(sin(x), x, Interval(0, 2*pi)), [0, pi, 2*pi]); same([yf.subs(t, v) for v in (0, pi, 2*pi)], [0, 0, 0])
slf = diff(yf, t)/diff(xf, t); same(slf.subs(t, 0), 2); same(slf.subs(t, pi), -2)
same_set(solveset(cos(2*x), x, Interval.Ropen(0, 2*pi)), [pi/4, 3*pi/4, 5*pi/4, 7*pi/4])
same([(xf.subs(t, v), yf.subs(t, v)) for v in (pi/4, 3*pi/4, 5*pi/4, 7*pi/4)], [(sqrt(2)/2, 1), (sqrt(2)/2, -1), (-sqrt(2)/2, 1), (-sqrt(2)/2, -1)])
holds(all(cos(v) != 0 for v in (pi/4, 3*pi/4, 5*pi/4, 7*pi/4)))
same_set(solveset(cos(x), x, Interval.Ropen(0, 2*pi)), [pi/2, 3*pi/2]); same([diff(yf, t).subs(t, v) for v in (pi/2, 3*pi/2)], [-2, -2])
same([(xf.subs(t, v), yf.subs(t, v)) for v in (pi/2, 3*pi/2)], [(1, 0), (-1, 0)])
same(yf**2, 4*xf**2*(1 - xf**2))
```
:::
::::

:::: exercise 拓扑星形线（astroid）的长度 {#ex-16-6} ★★
星形线 **astroid** 是曲线 $x = \cos^3 t$, $y = \sin^3 t$, $0 \le t \le 2\pi$。

- (a) 证明其点满足 $x^{2/3} + y^{2/3} = 1$.
- (b) 找出 $dx/dt$ 和 $dy/dt$ 都为 0 的点.
- (c) 求双纽线的长度.

::: solution
**(a)** 用实数立方根， $x^{1/3} = \cos t$ 和 $y^{1/3} = \sin t$，因此 $x^{2/3} + y^{2/3} = \cos^2 t + \sin^2 t = 1$.

**(b)** $\dfrac{dx}{dt} = -3\cos^2 t\,\sin t$ 和 $\dfrac{dy}{dt} = 3\sin^2 t\,\cos t$ 都为 0 恰好当 $\sin t\cos t = 0$，在 $t = 0, \tfrac{\pi}{2}, \pi, \tfrac{3\pi}{2}, 2\pi$ 处。这些给出四个点 $(1, 0)$, $(0, 1)$, $(-1, 0)$ 和 $(0, -1)$，其中 $2\pi$ 重复第一个。双纽线在这些点处都有一个尖点。

**(c)** 平方，相加并因式分解：

$$\begin{aligned} \Big(\frac{dx}{dt}\Big)^2 + \Big(\frac{dy}{dt}\Big)^2 &= 9\cos^4 t\sin^2 t + 9\sin^4 t\cos^2 t \\ &= 9\sin^2 t\cos^2 t\big(\cos^2 t + \sin^2 t\big) = 9\sin^2 t\cos^2 t. \end{aligned}$$

平方根是 $3\abs{\sin t\cos t}$。双纽线的四个象限彼此镜像，且在 $[0, \pi/2]$ 上 $\sin t$ 和 $\cos t$ 都非负。因此，用替换 $u = \sin t$, $du = \cos t\,dt$,

$$L = 4\int_0^{\pi/2} 3\sin t\cos t\,dt = 12\int_0^1 u\,du = 12\cdot\frac12 = 6.$$

常见的错误答案是 0: $\int_0^{2\pi} 3\sin t\cos t\,dt = 0$，因为没有绝对值，负值会抵消正值。

```check
xa, ya = cos(t)**3, sin(t)**3
tq_ = symbols('t', positive=True)
same(real_root(cos(Rational(1, 3))**3, 3), cos(Rational(1, 3))); same(real_root(cos(Rational(5, 2))**3, 3), cos(Rational(5, 2)))
same(cos(t)**2 + sin(t)**2, 1)
same(diff(xa, t), -3*cos(t)**2*sin(t)); same(diff(ya, t), 3*sin(t)**2*cos(t))
same_set(solveset(sin(x)*cos(x), x, Interval(0, 2*pi)), [0, pi/2, pi, 3*pi/2, 2*pi])
same((xa.subs(t, 2*pi), ya.subs(t, 2*pi)), (1, 0))
same([(xa.subs(t, v), ya.subs(t, v)) for v in (0, pi/2, pi, 3*pi/2)], [(1, 0), (0, 1), (-1, 0), (0, -1)])
steps(diff(xa, t)**2 + diff(ya, t)**2, 9*cos(t)**4*sin(t)**2 + 9*sin(t)**4*cos(t)**2, 9*sin(t)**2*cos(t)**2*(cos(t)**2 + sin(t)**2), 9*sin(t)**2*cos(t)**2)
steps(4*Integral(3*sin(t)*cos(t), (t, 0, pi/2)), 12*Integral(u, (u, 0, 1)), 12*Rational(1, 2), 6)
near(Integral(3*Abs(sin(t)*cos(t)), (t, 0, 2*pi)).evalf(30), 6, 1e-20); same(integrate(3*sin(t)*cos(t), (t, 0, 2*pi)), 0)
```
:::
::::

:::: exercise 极坐标曲线之间的面积 {#ex-16-7} ★★
求位于圆 $r = 3\cos\theta$ 内且在心脏线 $r = 1 + \cos\theta$ 外的区域的面积。

::: solution
远离极点，曲线在 $3\cos\theta = 1 + \cos\theta$ 相交，即 $\cos\theta = \tfrac12$：在 $\theta = \pm\tfrac{\pi}{3}$ 处。它们也在极点相交，圆在 $\theta = \pi/2$ 处达到极点，心脏线在 $\theta = \pi$ 处达到极点；在相同角度下等同半径会忽略这一点。

圆位于右半平面，且在 $-\pi/2 \le \theta \le \pi/2$ 上半径非负。在这些射线上，它在 $\cos\theta > \tfrac12$ 时超出心脏线，因此具有正面积的区域位于角度 $-\pi/3$ 和 $\pi/3$ 之间。在 $0 < 1 + \cos\theta \le 3\cos\theta$ 处，该区域为 $1 + \cos\theta \le r \le 3\cos\theta$。相关的边界弧被追踪一次；孤立的公共极点不增加面积。根据定理 16.3 及其后的陷阱，减去这些面积，并使用 $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$：

$$\begin{aligned} A &= \frac12\int_{-\pi/3}^{\pi/3} \Big(9\cos^2\theta - (1 + \cos\theta)^2\Big)\,d\theta \\ &= \frac12\int_{-\pi/3}^{\pi/3} \big(8\cos^2\theta - 2\cos\theta - 1\big)\,d\theta \\ &= \frac12\int_{-\pi/3}^{\pi/3} \big(3 + 4\cos 2\theta - 2\cos\theta\big)\,d\theta \\ &= \frac12\Big[3\theta + 2\sin 2\theta - 2\sin\theta\Big]_{-\pi/3}^{\pi/3}. \end{aligned}$$

在 $\theta = \tfrac{\pi}{3}$ 处，括号内为 $\pi + \sqrt3 - \sqrt3 = \pi$，在 $-\tfrac{\pi}{3}$ 处为 $-\pi$。因此 $A = \tfrac12(\pi + \pi) = \pi$。

```check
same_set(solveset(Eq(3*cos(x), 1 + cos(x)), x, Interval(-pi, pi)), [-pi/3, pi/3])
same((3*cos(pi/2)*cos(pi/2), 3*cos(pi/2)*sin(pi/2)), (0, 0))
same(((1 + cos(pi))*cos(pi), (1 + cos(pi))*sin(pi)), (0, 0))
same(3*cos(theta) - (1 + cos(theta)), 2*cos(theta) - 1)
holds(minimum(cos(x), x, Interval(-pi/2, pi/2)) >= 0)
holds(minimum(3*cos(x) - (1 + cos(x)), x, Interval(-pi/3, pi/3)) >= 0); holds(minimum(1 + cos(x), x, Interval(-pi/3, pi/3)) >= 0)
same(expand(9*cos(theta)**2 - (1 + cos(theta))**2), 8*cos(theta)**2 - 2*cos(theta) - 1)
same(8*cos(theta)**2 - 2*cos(theta) - 1, 3 + 4*cos(2*theta) - 2*cos(theta))
antideriv(3*theta + 2*sin(2*theta) - 2*sin(theta), 3 + 4*cos(2*theta) - 2*cos(theta), theta)
Fa = 3*theta + 2*sin(2*theta) - 2*sin(theta); same(Fa.subs(theta, pi/3), pi); same(Fa.subs(theta, -pi/3), -pi)
same(integrate((9*cos(theta)**2 - (1 + cos(theta))**2)/2, (theta, -pi/3, pi/3)), pi)
```
:::
::::

:::: exercise 平面、三角形和距离 {#ex-16-8} ★★
设 $A(1, 0, 0)$, $B(0, 2, 0)$ 和 $C(0, 0, 3)$。

- (a) 求通过 $A$, $B$ 和 $C$ 的平面方程。
- (b) 求三角形 $ABC$ 的面积。
- (c) 求原点 $O$ 到平面的距离。
- (d) 检查答案：四面体 $OABC$ 的体积为 $\tfrac13\times(\text{area of a face})\times(\text{height above it})$。用面 $ABC$ 和面 $OAB$ 在 $xy$ 平面上计算该体积。

::: solution
**(a)** $\overrightarrow{AB} = \langle -1, 2, 0\rangle$ 和 $\overrightarrow{AC} = \langle -1, 0, 3\rangle$，因此法向量为

$$\begin{aligned} \vb{n} = \overrightarrow{AB}\times\overrightarrow{AC} &= \big\langle 2\cdot3 - 0\cdot0,\ 0\cdot(-1) - (-1)\cdot3,\ (-1)\cdot0 - 2\cdot(-1)\big\rangle \\ &= \langle 6, 3, 2\rangle. \end{aligned}$$

通过 $A$： $6(x - 1) + 3y + 2z = 0$，即 $6x + 3y + 2z = 6$。检查： $B$ 给出 $6$， $C$ 给出 $6$。

**(b)** $\norm{\vb{n}} = \sqrt{36 + 9 + 4} = 7$，因此三角形的面积为 $\tfrac72$。

**(c)** $D = \dfrac{\abs{0 + 0 + 0 - 6}}{7} = \dfrac67 \approx 0.857$.

**(d)** 面$ABC$：$\tfrac13\cdot\tfrac72\cdot\tfrac67 = 1$。面$OAB$，直角三角形，直角边1和2，面积1，高3（$C$到$xy$-平面的距离）：$\tfrac13\cdot1\cdot3 = 1$。答案一致。

```check
A9, B9, C9 = Matrix([1, 0, 0]), Matrix([0, 2, 0]), Matrix([0, 0, 3])
same(B9 - A9, Matrix([-1, 2, 0])); same(C9 - A9, Matrix([-1, 0, 3])); n9 = (B9 - A9).cross(C9 - A9); same(n9, Matrix([6, 3, 2]))
same(expand(6*(x - 1) + 3*y + 2*z), 6*x + 3*y + 2*z - 6); same([6*q_[0] + 3*q_[1] + 2*q_[2] for q_ in (A9, B9, C9)], [6, 6, 6])
same(n9.norm(), 7); same(n9.norm()/2, Rational(7, 2)); same(Abs(0 - 6)/n9.norm(), Rational(6, 7)); rounds(Rational(6, 7), '0.857')
same(Rational(1, 3)*Rational(7, 2)*Rational(6, 7), 1); same(Rational(1, 3)*(Rational(1, 2)*1*2)*3, 1)
same(Abs(Matrix([1, 0, 0]).dot(Matrix([0, 2, 0]).cross(Matrix([0, 0, 3]))))/6, 1)
```
:::
::::

:::: exercise 击中目标 {#ex-16-9} ★★
一个球从地面以 15 m/s 的速度投掷，朝向 20 m 远的地面目标。忽略空气阻力，重力加速度为 $g = 9.8$ m/s²，以什么角度投掷可以击中目标？每次投掷所需时间是多少？以这个速度能击中的最远目标距离是多少？

::: solution
范围必须为 $R = \dfrac{v_0^2\sin 2\alpha}{g} = 20$，所以

$$\sin 2\alpha = \frac{20\cdot9.8}{15^2} = \frac{196}{225} \approx 0.8711.$$

重力加速度为 $0 < \alpha < \tfrac{\pi}{2}$， $2\alpha$ 介于 0 和 $\pi$ 之间，其中正弦函数取该值两次： $2\alpha = \arcsin\tfrac{196}{225} \approx 60.59^\circ$ 和 $2\alpha \approx 180^\circ - 60.59^\circ = 119.41^\circ$。因此， $\alpha \approx 30.29^\circ$ 或 $\alpha \approx 59.71^\circ$，两个互补角。飞行时间 $t_f = \dfrac{2v_0\sin\alpha}{g}$ 分别约为 $1.544$ 秒（低角度投掷）和 $2.643$ 秒（高角度投掷）。最远目标距离为 $45^\circ$ 角度时的射程，即 $\dfrac{v_0^2}{g} = \dfrac{225}{9.8} \approx 22.96$ m；超过该距离， $\sin 2\alpha$ 将超过 1。

```check
gq_ = Rational(98, 10)
same(20*gq_/15**2, Rational(196, 225)); rounds(Rational(196, 225), '0.8711')
a2a = asin(Rational(196, 225)); rounds(a2a*180/pi, '60.59'); rounds(180 - a2a*180/pi, '119.41')
al1, al2 = a2a/2, (pi - a2a)/2; rounds(al1*180/pi, '30.29'); rounds(al2*180/pi, '59.71'); same(al1 + al2, pi/2)
same(15**2*sin(2*al1)/gq_, 20); same(15**2*sin(2*al2)/gq_, 20)
rounds(2*15*sin(al1)/gq_, '1.544'); rounds(2*15*sin(al2)/gq_, '2.643'); rounds(225/gq_, '22.96')
```
:::
::::

:::: exercise 匀速 {#ex-16-10} ★★★
假设位置 $\vb{r}(t)$ 在一段时间区间内是二阶可导的。

- (a) 证明：如果一个粒子以恒定速度运动，那么它的加速度始终与其速度垂直。
- (b) 一个粒子以恒定速度 $v > 0$: $\vb{r}(t) = \big\langle R\cos\omega t, R\sin\omega t\big\rangle$ 沿着以原点为中心、半径为 $R > 0$ 的圆周运动，其中 $\omega = v/R$。证明其加速度为 $-\omega^2\,\vb{r}(t)$：它指向圆心，大小为 $v^2/R$。
- (c) (a) 的逆命题是否成立：如果 $\vb{a}(t)\cdot\vb{v}(t) = 0$ 对所有 $t$ 成立，速度是否恒定？

::: solution
**(a)** 速度 $\norm{\vb{v}}$ 是常数，因此 $\vb{v}\cdot\vb{v} = \norm{\vb{v}}^2 = c$ 对于常数 $c$ 成立。使用点积的乘积法则求导： $\vb{v}'\cdot\vb{v} + \vb{v}\cdot\vb{v}' = 0$，即 $2\,\vb{a}\cdot\vb{v} = 0$。因此 $\vb{a}\cdot\vb{v} = 0$ 在所有时间点成立： $\vb{a}$ 与 $\vb{v}$（或 $\vb{0}$）正交。

**(b)** 根据链式法则，

$$\begin{aligned} \vb{v}(t) &= \langle -R\omega\sin\omega t,\ R\omega\cos\omega t\rangle, \\ \vb{a}(t) &= \langle -R\omega^2\cos\omega t,\ -R\omega^2\sin\omega t\rangle = -\omega^2\,\vb{r}(t). \end{aligned}$$

速度是 $\norm{\vb{v}} = R\omega = v$，恒定，如所需。加速度方向与位置矢量相反，指向中心，其大小为 $\omega^2\norm{\vb{r}} = \omega^2 R = \dfrac{v^2}{R^2}\,R = \dfrac{v^2}{R}$。这种 **向心加速度** 是“深入一步”框中关于曲率的 $\kappa v^2$，带 $\kappa = 1/R$；它也证实了 (a)，因为 $\vb{a}$ 沿半径方向，而 $\vb{v}$ 沿切线方向。

**(c)** 是的。如果 $\vb{a}\cdot\vb{v} = 0$ 对所有 $t$ 在一个区间内成立，则 $\dfrac{d}{dt}(\vb{v}\cdot\vb{v}) = 2\,\vb{a}\cdot\vb{v} = 0$ 那里成立，因此 $\norm{\vb{v}}^2$ 是常数（模块 8），速度也是如此。对于质量恒定的粒子，合力垂直于其速度不能改变其速度。

```check
Vv = Matrix([Function('v1')(t), Function('v2')(t), Function('v3')(t)])
same(diff(Vv.dot(Vv), t), 2*diff(Vv, t).dot(Vv))
Rq, wq = symbols('R omega', positive=True); rq = Matrix([Rq*cos(wq*tR), Rq*sin(wq*tR)])
same(diff(rq, tR), Matrix([-Rq*wq*sin(wq*tR), Rq*wq*cos(wq*tR)])); same(diff(rq, tR, 2), -wq**2*rq)
same(diff(rq, tR).norm(), Rq*wq); same((wq**2*rq).norm(), wq**2*Rq)
vq = symbols('v', positive=True); same((wq**2*Rq).subs(wq, vq/Rq), vq**2/Rq); same(diff(rq, tR, 2).dot(diff(rq, tR)), 0)
```
:::
::::

:::: exercise 柯西–施瓦茨不等式 {#ex-16-11} ★★★
对于具有 $n$ 个实数分量的向量 $\vb{a} = \langle a_1, \dots, a_n\rangle$，定义 $\vb{a}\cdot\vb{b} = a_1b_1 + \dots + a_nb_n$ 和 $\norm{\vb{a}} = \sqrt{\vb{a}\cdot\vb{a}}$；第 16.5 节中点积的规则同样成立，证明相同。

- (a) 证明 **柯西–施瓦茨不等式** $\abs{\vb{a}\cdot\vb{b}} \le \norm{\vb{a}}\,\norm{\vb{b}}$。 （提示：对于 $\vb{a} \ne \vb{0}$，二次式 $q(s) = \norm{s\vb{a} + \vb{b}}^2$ 永远非负。）
- (b) 推导出三角不等式 $\norm{\vb{a} + \vb{b}} \le \norm{\vb{a}} + \norm{\vb{b}}$。
- (c) 解释为什么 $\cos\theta = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}$ 定义了任意两个非零向量之间的角度 $\theta$，这两个向量具有 $n$ 分量，并求 $\langle 1, 1, 0, 1\rangle$ 与 $\langle 1, 0, 1, 1\rangle$ 之间的角度。

::: solution
**(a)** 若 $\vb{a} = \vb{0}$，两边均为 0。否则按点积规则展开：

$$q(s) = (s\vb{a} + \vb{b})\cdot(s\vb{a} + \vb{b}) = \norm{\vb{a}}^2 s^2 + 2(\vb{a}\cdot\vb{b})\,s + \norm{\vb{b}}^2.$$

这是一个关于 $s$ 的二次方程，首项系数为正，且 $q(s) \ge 0$ 对于每个 $s$ 都表示平方长度。若存在两个不同的实根，则其在根之间为负值，因此该方程最多只有一个实根，其判别式不为正：

$$4(\vb{a}\cdot\vb{b})^2 - 4\norm{\vb{a}}^2\norm{\vb{b}}^2 \le 0.$$

所以 $(\vb{a}\cdot\vb{b})^2 \le \norm{\vb{a}}^2\norm{\vb{b}}^2$；取平方根。

**(b)** 由 (a) 得 $\vb{a}\cdot\vb{b} \le \abs{\vb{a}\cdot\vb{b}} \le \norm{\vb{a}}\,\norm{\vb{b}}$，因此

$$\begin{aligned} \norm{\vb{a} + \vb{b}}^2 &= \norm{\vb{a}}^2 + 2\,\vb{a}\cdot\vb{b} + \norm{\vb{b}}^2 \\ &\le \norm{\vb{a}}^2 + 2\norm{\vb{a}}\,\norm{\vb{b}} + \norm{\vb{b}}^2 = \big(\norm{\vb{a}} + \norm{\vb{b}}\big)^2. \end{aligned}$$

两边均为非负数，取平方根即得三角不等式。

**(c)** 由 (a) 可知，该分数位于 $[-1, 1]$ 内，且在该区间上反余弦函数在 $[0, \pi]$ 中恰好给出一个 $\theta$。在三维空间中，此 $\theta$ 为几何角（定理 16.4）；在更高维空间中，它是角的定义，这也是余弦相似度工作原理。对于这两个向量，$\vb{a}\cdot\vb{b} = 1 + 0 + 0 + 1 = 2$ 和 $\norm{\vb{a}} = \norm{\vb{b}} = \sqrt3$，因此有 $\cos\theta = \tfrac23$ 和 $\theta \approx 48.19^\circ$。

```check
s_ = symbols('s', real=True)
An, Bn = Matrix(symbols('a1:5', real=True)), Matrix(symbols('b1:5', real=True))
same(expand((s_*An + Bn).dot(s_*An + Bn)), expand(An.dot(An)*s_**2 + 2*An.dot(Bn)*s_ + Bn.dot(Bn)))
same(discriminant(An.dot(An)*s_**2 + 2*An.dot(Bn)*s_ + Bn.dot(Bn), s_), 4*An.dot(Bn)**2 - 4*An.dot(An)*Bn.dot(Bn))
same(expand((An + Bn).dot(An + Bn)), expand(An.dot(An) + 2*An.dot(Bn) + Bn.dot(Bn)))
a4, b4 = Matrix([1, 1, 0, 1]), Matrix([1, 0, 1, 1])
same(a4.dot(b4), 2); same(a4.norm(), sqrt(3)); same(b4.norm(), sqrt(3)); same(a4.dot(b4)/(a4.norm()*b4.norm()), Rational(2, 3)); rounds(acos(Rational(2, 3))*180/pi, '48.19')
holds(Abs(a4.dot(b4)) <= a4.norm()*b4.norm()); holds((a4 + b4).norm() <= a4.norm() + b4.norm())
```
:::
::::

## 自测 {#quiz}

```quiz
? 对于曲线 $x = t^2$，$y = t^3$，在 $t = 2$ 处的斜率 $dy/dx$ 是
- [ ] $\dfrac13$
- [ ] $12$
- [x] $3$
- [ ] $4$
> $\dfrac{dy}{dx} = \dfrac{dy/dt}{dx/dt} = \dfrac{3t^2}{2t} = \dfrac{3t}{2}$，其值为 3 在 $t = 2$。$\tfrac13$ 是倒数关系，$dx/dy$；12 是 $dy/dt$ 单独存在，4 是 $dx/dt$ 单独存在。

? 曲线 $x = \cos t$，$y = \sin t$，$0 \le t \le \pi$ 是
- [x] 单位圆的上半部分，从 $(1, 0)$ 逆时针追踪至 $(-1, 0)$
- [ ] 整个单位圆，追踪一次
- [ ] 单位圆的上半部分，从 $(-1, 0)$ 顺时针追踪至 $(1, 0)$
- [ ] 单位圆的右半部分
> 点位于单位圆上的角度 $t$ 处，且 $y = \sin t \ge 0$ 对应 $0 \le t \le \pi$：它从 $(\cos 0, \sin 0) = (1, 0)$ 到 $(\cos\pi, \sin\pi) = (-1, 0)$ 逆时针方向覆盖上半圆一次。整个圆需要 $0 \le t \le 2\pi$，右半圆则需要 $-\pi/2 \le t \le \pi/2$。

? 极坐标为 $(-2, \pi/3)$ 的点的直角坐标为
- [ ] $\big(1, \sqrt3\big)$
- [x] $\big(-1, -\sqrt3\big)$
- [ ] $\big(-1, \sqrt3\big)$
- [ ] $\big(\sqrt3, 1\big)$
> $x = r\cos\theta = -2\cdot\tfrac12 = -1$ 和 $y = r\sin\theta = -2\cdot\tfrac{\sqrt3}{2} = -\sqrt3$：当 $r < 0$ 时，点位于与方向 $\pi/3$ 相反的射线上。 $\big(1, \sqrt3\big)$ 忽略 $r$ 的符号， $\big(\sqrt3, 1\big)$ 交换余弦和正弦。

? 区域在圆 $r = 2\sin\theta$ 内的面积为
- [ ] $2\pi$
- [ ] $4\pi$
- [ ] $\pi/2$
- [x] $\pi$
> $r = 2\sin\theta$ 是半径为 1 的圆，对于 $0 \le \theta \le \pi$ 和 $\tfrac12\int_0^\pi 4\sin^2\theta\,d\theta = \pi$ 被遍历一次。积分从 0 到 $2\pi$ 得到 $2\pi$，因为圆被遍历两次。 $4\pi$ 表示半径为 2 的圆的面积，但此处 2 是直径。

? 哪个向量与 $\langle 2, -1, 3\rangle$ 正交？
- [ ] $\langle 1, 2, 1\rangle$
- [x] $\langle 1, 5, 1\rangle$
- [ ] $\langle -2, 1, -3\rangle$
- [ ] $\langle 3, -1, 2\rangle$
> 正交意味着点积为 0： $\langle 2, -1, 3\rangle\cdot\langle 1, 5, 1\rangle = 2 - 5 + 3 = 0$。其余情况分别给出 $2 - 2 + 3 = 3$、 $-4 - 1 - 9 = -14$（与给定向量平行但方向相反）和 $6 + 1 + 6 = 13$。

? $(\vb{i}\times\vb{j})\times\vb{j}$等于
- [ ] $\vb{0}$
- [ ] $\vb{i}$
- [x] $-\vb{i}$
- [ ] $\vb{k}$
> $\vb{i}\times\vb{j} = \vb{k}$, 和 $\vb{k}\times\vb{j} = -(\vb{j}\times\vb{k}) = -\vb{i}$. 答案 $\vb{0}$ 是通过计算 $\vb{i}\times(\vb{j}\times\vb{j})$ 得到的：叉乘不满足结合律，因此括号的位置很重要。$\vb{k}$ 只是第一步，而 $\vb{i}$ 符号错误：$\vb{k}\times\vb{j}$ 是 $-\vb{i}$，根据右手法则。

? 过点 $(1, 3, 2)$ 且法向量为 $\langle 2, -1, 4\rangle$ 的平面方程为
- [x] $2x - y + 4z = 7$
- [ ] $x + 3y + 2z = 7$
- [ ] $2x - y + 4z = 0$
- [ ] $\dfrac{x - 1}{2} = \dfrac{y - 3}{-1} = \dfrac{z - 2}{4}$
> $2(x - 1) - (y - 3) + 4(z - 2) = 0$ 得到 $2x - y + 4z = 2 - 3 + 8 = 7$。第二个交换了点与法向量的角色；第三个是通过原点的平行平面；第四个描述的是通过该点并沿法向量方向的直线，而不是平面。

? 螺旋线 $\vb{r}(t) = \langle 3\cos t, 3\sin t, 4t\rangle$，从 $t = 0$ 到 $t = 2\pi$，其长度为
- [ ] $6\pi$
- [ ] $8\pi$
- [ ] $14\pi$
- [x] $10\pi$
> 对于每一个 $t$，$\vb{r}'(t) = \langle -3\sin t, 3\cos t, 4\rangle$ 的长度为 $\sqrt{9 + 16} = 5$，所以 $L = \int_0^{2\pi} 5\,dt = 10\pi$. $6\pi$ 是螺旋线绕行的圆的周长，$8\pi$ 是螺旋线上升的高度；将速度 3 和 4 直接相加，而不是用勾股定理相加，得到 $14\pi$.
```

```check
same(diff(t**3, t)/diff(t**2, t), 3*t/2); same((3*t/2).subs(t, 2), 3); same(diff(t**3, t).subs(t, 2), 12); same(diff(t**2, t).subs(t, 2), 4)
holds(minimum(sin(x), x, Interval(0, pi)) >= 0); same((cos(pi), sin(pi)), (-1, 0))
same((-2*cos(pi/3), -2*sin(pi/3)), (-1, -sqrt(3)))
same(integrate(4*sin(theta)**2/2, (theta, 0, pi)), pi); same(integrate(4*sin(theta)**2/2, (theta, 0, 2*pi)), 2*pi)
nq = Matrix([2, -1, 3]); same([nq.dot(Matrix(w_)) for w_ in ([1, 2, 1], [1, 5, 1], [-2, 1, -3], [3, -1, 2])], [3, 0, -14, 13])
same(iv.cross(jv).cross(jv), -iv); same(iv.cross(jv.cross(jv)), zeros(3, 1))
same(expand(2*(x - 1) - (y - 3) + 4*(z - 2)), 2*x - y + 4*z - 7); same(1*1 + 3*3 + 2*2, 14); same(2*1 - 3 + 4*2, 7)
rq8 = Matrix([3*cos(tR), 3*sin(tR), 4*tR]); same(diff(rq8, tR).norm(), 5); same(integrate(5, (tR, 0, 2*pi)), 10*pi)
```
