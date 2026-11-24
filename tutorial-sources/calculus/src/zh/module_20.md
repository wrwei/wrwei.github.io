---
title: 向量微积分
part: 5
lead: 用向量场描述风、水流、重力和电场，计算沿曲线和穿过曲面的积分，再用旋度和散度衡量流动的旋转与发散。格林定理、斯托克斯定理与散度定理把微积分基本定理的思想推广到了曲线、曲面和立体。
minutes: 270
needs: 模块 1 到 19，特别是微积分基本定理（模块 10）、向量、点积和叉积以及向量函数（模块 16）、偏导数和梯度（模块 17）以及二重积分和三重积分（模块 19）
goals:
  - 在平面和空间中绘制并理解向量场，识别梯度场
  - 计算函数和向量场的线积分，并解释它们如何依赖于曲线及其方向
  - 判断一个向量场是否保守，求出势函数，并利用线积分基本定理计算线积分
  - 陈述格林定理及其假设条件，对简单区域进行证明，并用于计算环量、流量和面积
  - 计算旋度、散度、曲面面积、曲面积分和流量，并解释旋度和散度的物理意义
  - 陈述斯托克斯定理和散度定理，通过例子验证它们，并解释所有基本定理背后的一个统一模式
---

## 向量场 {#fields}

天气图用箭头表示风向：在每个位置，箭头指向风的吹向，其长度表示风速的大小。河流中水的流速、地球引力的拉力以及带电粒子周围的电场都属于同一类：它们在某一区域的每个点上附加一个向量，即一个方向和一个大小

这个模块将这些场沿曲线（力沿路径所做的功）和在曲面上（流体通过曲面的流速）进行积分，并对它们进行微分，以测量流体的旋转程度和扩散程度。其主要定理——格林定理、斯托克斯定理和散度定理——是模块10中微积分基本定理的新形式（第20.8节）。

::: definition 向量场
设 $D$ 是平面上的一组点。一个在 $D$ 上的 **向量场** 是一个函数 $\vb{F}$，它为 $D$ 中的每个点 $(x, y)$ 分配一个向量

$$\begin{aligned} \vb{F}(x, y) &= \big\langle P(x, y), Q(x, y)\big\rangle \\ &= P\,\vb{i} + Q\,\vb{j}. \end{aligned}$$

空间点集 $E$ 上的向量场为 $E$ 中的每个点 $(x, y, z)$ 指定一个向量 $\vb{F}(x, y, z) = \langle P, Q, R\rangle$。取值为标量的函数 $P$、$Q$ 和 $R$ 是 $\vb{F}$ 的**分量**。
:::

$\vb{F}(x, y)$ 读作 "F of x, y"。一个值为数的函数，例如金属板的温度，称为 **标量场**，当它必须与向量场区分开时。为了绘制向量场，应在网格点上画出箭头 $\vb{F}(x, y)$，其尾端位于 $(x, y)$，所有箭头按相同比例缩短，以避免重叠。

::: example 旋转与源
描述向量场 $\vb{F}(x, y) = \langle -y, x\rangle$ 和 $\vb{G}(x, y) = \langle x, y\rangle$。

从数字开始：

| 点 | $\vb{F} = \langle -y, x\rangle$ | $\vb{G} = \langle x, y\rangle$ |
|---|---|---|
| $(1, 0)$ | $\langle 0, 1\rangle$ | $\langle 1, 0\rangle$ |
| $(0, 1)$ | $\langle -1, 0\rangle$ | $\langle 0, 1\rangle$ |
| $(-1, 0)$ | $\langle 0, -1\rangle$ | $\langle -1, 0\rangle$ |
| $(0, -1)$ | $\langle 1, 0\rangle$ | $\langle 0, -1\rangle$ |
| $(2, 2)$ | $\langle -2, 2\rangle$ | $\langle 2, 2\rangle$ |

在$(1, 0)$处，$\vb{F}$点垂直向上；再转过四分之一圈，在$(0, 1)$处，它指向左侧。一般而言$\vb{F}(x, y)\cdot\langle x, y\rangle = -yx + xy = 0$，因此远离原点的$\vb{F}$垂直于位置向量$\langle x, y\rangle$：它与以原点为中心且经过$(x, y)$的圆相切，并沿其逆时针方向指向。其长度$\sqrt{y^2 + x^2}$即为原点的距离。因此$\vb{F}$是车轮以每秒一弧度逆时针旋转的速度场（图20.1，左侧）。

$\vb{G}$ 指向原点，长度等于其到原点的距离。速度为 $\vb{G}$ 的流体在各处扩散，因为离原点越远的点向外运动越快。这是一个 **源** 场的例子。其相反场 $-\vb{G} = \langle -x, -y\rangle$ 向内汇聚，是一个 **汇** 场的例子。这两个场在原点处均为零。

```check
F201 = lambda X, Y: Matrix([-Y, X]); G201 = lambda X, Y: Matrix([X, Y])
pts201 = [(1, 0), (0, 1), (-1, 0), (0, -1), (2, 2)]
same([F201(*p_) for p_ in pts201], [Matrix([0, 1]), Matrix([-1, 0]), Matrix([0, -1]), Matrix([1, 0]), Matrix([-2, 2])])
same([G201(*p_) for p_ in pts201], [Matrix(p_) for p_ in pts201])
same(F201(x, y).dot(Matrix([x, y])), 0)
xr, yr = symbols('x y', real=True)
same(F201(xr, yr).norm(), sqrt(xr**2 + yr**2)); same(G201(xr, yr).norm(), sqrt(xr**2 + yr**2))
```
:::

根据牛顿万有引力定律，位于原点的质点 $M > 0$ 对位于位置 $\vb{r} = \langle x, y, z\rangle \ne \vb{0}$ 的质点 $m > 0$ 施加的引力为

$$\vb{F}(x, y, z) = -\frac{GMm}{\norm{\vb{r}}^3}\,\vb{r},$$

where $G$ 是引力常数。力指向原点（负号表示），其大小为 $GMm/\norm{\vb{r}}^2$：距离加倍，引力减为四分之一。这样的 **反平方场**（图20.1，中间）也由库仑定律给出带电粒子的电场。

```check
Gc, Mc, mc = symbols('G M m', positive=True)
rv = Matrix([xr, yr, symbols('z', real=True)]); rn_ = sqrt(rv.dot(rv))
same(simplify((Gc*Mc*mc/rn_**3*rv).norm()), Gc*Mc*mc/rn_**2)
same((Gc*Mc*mc/rn_**2).subs({xr: 2*xr, yr: 2*yr, rv[2]: 2*rv[2]})/(Gc*Mc*mc/rn_**2), Rational(1, 4))
```

模块17涉及未命名的向量场：可微函数$f(x, y)$的梯度$\nabla f = \langle f_x, f_y\rangle$是一个向量场，即$f$的**梯度场**。在$\nabla f$非零处，它指向$f$增长最快的方向，其长度即为该增长速率。在梯度为零处，所有方向导数均为零。沿任何可微水平曲线，由链式法则可知，梯度垂直于其切向量。

::: example 梯度场
求 $f(x, y) = x^2 + 2y^2$ 的梯度场，并在点 $(2, 1)$ 检查其是否垂直于通过该点的等值线 $f$。

$\nabla f(x, y) = \langle 2x, 4y\rangle$，所以 $\nabla f(2, 1) = \langle 4, 4\rangle$。通过 $(2, 1)$ 的等值线是椭圆 $x^2 + 2y^2 = 6$。隐函数求导（[第 6.4 节 ](module_06_ZH.html#implicit)）给出 $2x + 4y\,y' = 0$，因此其斜率为 $y' = -x/(2y)$，即在 $(2, 1)$ 处为 $-1$：该点的切线方向为 $\langle 1, -1\rangle$。然后 $\langle 4, 4\rangle\cdot\langle 1, -1\rangle = 0$。对于 $c > 0$，箭头垂直穿过椭圆 $x^2 + 2y^2 = c$，并指向更大的 $f$ 值（图 20.1，右）。

```check
f202 = x**2 + 2*y**2
same(Matrix([diff(f202, x), diff(f202, y)]), Matrix([2*x, 4*y])); same(Matrix([2*x, 4*y]).subs({x: 2, y: 1}), Matrix([4, 4]))
same(f202.subs({x: 2, y: 1}), 6)
same(idiff(f202 - 6, y, x), -x/(2*y)); same((-x/(2*y)).subs({x: 2, y: 1}), -1)
same(Matrix([4, 4]).dot(Matrix([1, -1])), 0)
```
:::

::: figure id=fig-20-1
三个矢量场。左：例20.1中的旋转场$\langle -y, x\rangle$，与原点周围的圆相切，越远离原点越长；虚线圆是一条流线。中间：一个反平方场指向原点，如重力场，所有箭头长度相同，仅显示方向。空心圆标记场未定义的位置。右：例20.2中$f(x, y) = x^2 + 2y^2$的梯度场，与$f$的等值线（橙色椭圆）垂直相交。
:::

在速度场为$\vb{F}$的稳定流动中，粒子沿一条**流线**（或流线）运动：该曲线$\vb{r}(t)$在其位置处的速度等于该场，即$\vb{r}'(t) = \vb{F}\big(\vb{r}(t)\big)$。对于旋转场，原点静止，其他流线为圆。对于$a > 0$，$\vb{r}(t) = \langle a\cos t, a\sin t\rangle$具有$\vb{r}'(t) = \langle -a\sin t, a\cos t\rangle$，其在$\vb{r}(t)$处为$\vb{F}$。求流线意味着求解微分方程，如同[第13.3节](module_13_ZH.html#direction-fields)]中的方向场一样。

```check
rfl = Matrix([a*cos(t), a*sin(t)]); same(rfl.diff(t), F201(rfl[0], rfl[1]))
```

::: pitfall
一幅图在网格点上采样该矢量场。只有当箭头共享同一比例尺时才比较长度，从公式中取精确值。将矢量与数字分开：$\vb{F}(2, 2) = \langle -2, 2\rangle$ 是一个矢量，而其长度 $\norm{\vb{F}(2, 2)} = 2\sqrt2$ 和点积 $\vb{F}(2, 2)\cdot\vb{G}(2, 2) = 0$ 是数字。

```check
same(F201(2, 2).norm(), 2*sqrt(2)); same(F201(2, 2).dot(G201(2, 2)), 0)
```
:::

## 线积分 {#line-integrals}

一根细线被弯成圆 $x^2 + y^2 = 1$ 的上半部分，长度以米为单位，该线在点 $(x, y)$ 处的密度为 $\rho(x, y) = 1 + y$ 千克每米：其上部更重。它的质量是多少？将线分成 $n$ 段，每段长度为 $\pi/n$。在一段较短的弧上，密度几乎不变，因此该弧的质量约为该弧中点处的密度乘以其长度。第 $i$ 段弧的中点位于角度 $\theta_i = (i - \tfrac12)\pi/n$，高度为 $\sin\theta_i$，因此质量约为

```valuetable
n = 4, 16, 64, 256
$\sum_{i=1}^{n}\big(1 + \sin\theta_i\big)\dfrac{\pi}{n}$ = Sum((1 + sin((i - 1/2)*pi/n))*pi/n, (i, 1, n))
digits = 7
---
n | \sum_{i=1}^{n}\big(1 + \sin\theta_i\big)\dfrac{\pi}{n}
4 | 5.193937
16 | 5.144809
64 | 5.141793
256 | 5.141605
```

这些和值逐渐接近 5.1416。它们的极限是一种新的积分形式，即沿曲线的积分。

A **光滑路径**$C$ 由函数 $\vb{r}(t)$, $a \le t \le b$ 描绘，具有 $a < b$ 且导数连续并在 $a < t < b$ 处非零。速度在端点处可能为零。**分段光滑路径** 由有限段此类路径首尾相接构成。路径记录行进的方向和顺序，因此可以自交或回溯一段。积分计算每次经过。静止部分贡献为零。在短时间 $\Delta t$ 内，点 $\vb{r}(t)$ 移动的距离约为速度乘以时间，即 $\norm{\vb{r}'(t)}\,\Delta t$，这给出了模块16的弧长 $L = \int_a^b \norm{\vb{r}'(t)}\,dt$。

::: definition 函数的线积分
设 $C$ 为由 $\vb{r}(t)$ 描绘的光滑曲线，其中 $a \le t \le b$。若函数 $f$ 在 $C$ 上连续，则 $f$ 沿 $C$ 的**曲线积分**定义为

$$\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\,\norm{\vb{r}'(t)}\,dt.$$

对于分段光滑的曲线，将各光滑曲线段上的曲线积分相加。
:::

$\int_C f\,ds$表示“沿曲线C对f关于弧长s的积分”；$ds = \norm{\vb{r}'(t)}\,dt$代表曲线上一小段的长度，而$f$乘以此类长度的求和（如表中所示）是右侧积分的黎曼和（模块9）。当$f = 1$时，线积分即为$C$的长度；当存在密度时，表示沿$C$的导线的质量；而将$C$的长度（当其为正时）作除数，则给出$f$在$C$上的平均值。

::: example 线的质心质量
求上述线的质量，以及其质心的高度。

用 $\vb{r}(t) = \langle\cos t, \sin t\rangle$、$0 \le t \le \pi$ 跟踪半圆；然后 $\vb{r}'(t) = \langle -\sin t, \cos t\rangle$ 和 $\norm{\vb{r}'(t)} = \sqrt{\sin^2 t + \cos^2 t} = 1$：参数 $t$ 是弧长。在线 $\rho = 1 + y = 1 + \sin t$ 上，因此

$$\begin{aligned} M &= \int_C (1 + y)\,ds = \int_0^\pi (1 + \sin t)\,dt \\ &= \big[t - \cos t\big]_0^\pi = \pi + 2 \approx 5.142 \text{ kg}, \end{aligned}$$

即这些和所趋近的数。由对称性，质心位于 $y$ 轴上。其高度等于关于 $y$ 的一阶矩除以质量，类似[第 12.7 节](module_12_ZH.html#centre-of-mass)中的细杆，只需用 $y\,\rho\,ds$ 代替 $x\,\rho(x)\,dx$。代入 $\int_0^\pi \sin^2 t\,dt = \pi/2$（见[练习 10.12](module_10_ZH.html#ex-10-12)），

$$\begin{aligned} \bar y &= \frac{1}{M}\int_C y(1 + y)\,ds \\ &= \frac{1}{M}\int_0^\pi \big(\sin t + \sin^2 t\big)\,dt \\ &= \frac{2 + \pi/2}{\pi + 2} \approx 0.694 \text{ m}. \end{aligned}$$

一个均匀的半圆形细线，其质心位于高度 $\tfrac{1}{\pi}\int_0^\pi \sin t\,dt = 2/\pi \approx 0.637$ m 处；较重的一端将其抬起。

```check
r203 = Matrix([cos(t), sin(t)])
same(r203.diff(t), Matrix([-sin(t), cos(t)])); same(sqrt(r203.diff(t).dot(r203.diff(t))), 1)
M203 = integrate(1 + sin(t), (t, 0, pi))
antideriv(t - cos(t), 1 + sin(t), t)
steps(Integral(1 + sin(t), (t, 0, pi)), (pi - cos(pi)) - (0 - cos(0)), pi + 2); rounds(M203, '5.142'); rounds(M203, '5.1416')
iS = symbols('i', integer=True)
near(Sum((1 + sin((iS - Rational(1, 2))*pi/256))*pi/256, (iS, 1, 256)).evalf(30), M203, 2e-5)   # the sums approach the mass
same(integrate(sin(t)**2, (t, 0, pi)), pi/2)
ybar203 = integrate(sin(t) + sin(t)**2, (t, 0, pi))/M203
same(ybar203, (2 + pi/2)/(pi + 2)); rounds(ybar203, '0.694')
same(integrate(sin(t), (t, 0, pi))/pi, 2/pi); rounds(2/pi, '0.637'); holds(ybar203 > 2/pi)
```
:::

参数并不重要。以相同细线以两倍速度追踪，使用 $\vb{r}(u) = \langle\cos 2u, \sin 2u\rangle$，$0 \le u \le \pi/2$：此时速度为 $\norm{\vb{r}'(u)} = 2$，且 $\int_0^{\pi/2} (1 + \sin 2u)\cdot 2\,du = \pi + 2$ 再次出现。下面的定理 20.1 解释了原因。

```check
r2u = Matrix([cos(2*u), sin(2*u)]); same(sqrt(simplify(r2u.diff(u).dot(r2u.diff(u)))), 2)
same(integrate((1 + sin(2*u))*2, (u, 0, pi/2)), pi + 2)
```

### 功 {#work}

恒力$\vb{F}$沿直线位移$\vb{D}$做功$W = \vb{F}\cdot\vb{D}$（第16模块），而[[小节 12.6](module_12_ZH.html#work)]]对沿直线变化的力进行了积分。现在设力随点变化且路径弯曲。从$t$到$t + \Delta t$，沿$\vb{r}(t)$运动的物体位移约为$\vb{r}'(t)\,\Delta t$，因此力做功约为$\vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,\Delta t$。将这些相加并令$\Delta t \to 0$趋于零，即得积分。

::: definition 向量场的线积分
设 $C$ 为由 $\vb{r}(t)$ 描绘的光滑曲线，其中 $a \le t \le b$。若向量场 $\vb{F}$ 在 $C$ 上连续，则 $\vb{F}$ 沿 $C$ 的**曲线积分**定义为

$$\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt.$$

对于分段光滑路径，将各光滑段上的积分相加。如果 $\vb{F}$ 是一个力，这就是它使物体沿 $C$ 移动时所做的 **功**。
:::

读作“沿 C 的积分 F 点乘 d r”。还有两种常见的写法。使用模块 16 中的单位切向量 $\vb{T} = \vb{r}'/\norm{\vb{r}'}$，即 $\vb{F}\cdot\vb{r}'\,dt = (\vb{F}\cdot\vb{T})\,\norm{\vb{r}'}\,dt = (\vb{F}\cdot\vb{T})\,ds$，所以

$$\int_C \vb{F}\cdot d\vb{r} = \int_C \vb{F}\cdot\vb{T}\,ds,$$

曲线积分是力的切向分量 $\vb{F}$：只有力沿路径的分量做功。并且在分量形式中，使用 $\vb{F} = \langle P, Q\rangle$ 和 $\vb{r}(t) = \langle x(t), y(t)\rangle$，被积函数是 $P\,x'(t)\,dt + Q\,y'(t)\,dt$。写作 $dx = x'(t)\,dt$ 和 $dy = y'(t)\,dt$，

$$\int_C \vb{F}\cdot d\vb{r} = \int_C P\,dx + Q\,dy,$$

在空间中使用 $+\,R\,dz$。

::: example 三条路径上的功
求力 $\vb{F}(x, y) = \langle -y, x\rangle$ 作用下物体从 $(0, 0)$ 移动到 $(1, 1)$ 所做的功：(a) 沿直线 $y = x$，(b) 沿抛物线 $y = x^2$，((c) 沿 $x$ 轴移动到 $(1, 0)$，然后垂直向上移动到 $(1, 1)$。

**(a)** 取 $\vb{r}(t) = \langle t, t\rangle$， $0 \le t \le 1$。然后 $\vb{F}\big(\vb{r}(t)\big) = \langle -t, t\rangle$ 和 $\vb{r}'(t) = \langle 1, 1\rangle$，所以 $\vb{F}\cdot\vb{r}' = -t + t = 0$ 和 $W = 0$。这条线是圆 $\vb{F}$ 所遵循的圆的半径，因此力始终与运动方向垂直。

**(b)** 取 $\vb{r}(t) = \langle t, t^2\rangle$。然后 $\vb{F}\big(\vb{r}(t)\big) = \langle -t^2, t\rangle$ 和 $\vb{r}'(t) = \langle 1, 2t\rangle$，所以

$$\begin{aligned} W &= \int_0^1 \big(-t^2 + 2t^2\big)\,dt \\ &= \int_0^1 t^2\,dt = \frac13. \end{aligned}$$

**(c)** 两段光滑路径。沿 $x$ 轴， $\vb{r}(t) = \langle t, 0\rangle$：力 $\langle 0, t\rangle$ 与 $\vb{r}' = \langle 1, 0\rangle$ 垂直，因此不做功。沿直线 $x = 1$， $\vb{r}(t) = \langle 1, t\rangle$：力为 $\langle -t, 1\rangle$ 和 $\vb{r}' = \langle 0, 1\rangle$，因此 $\vb{F}\cdot\vb{r}' = 1$，功为 $\int_0^1 1\,dt = 1$。总计 $W = 0 + 1 = 1$。

三条路径具有相同的起点和终点，给出三种不同的功值， $0$、 $\tfrac13$ 和 $1$（图 20.2）。

```check
def lint(F_, r_, a_, b_, var=t):
    """The line integral of the field F_ (a Matrix in x, y or x, y, z) along r_(var), a_ <= var <= b_."""
    r_ = Matrix(r_); sub_ = dict(zip((x, y, z), r_))
    return integrate(simplify(F_.subs(sub_, simultaneous=True).dot(r_.diff(var))), (var, a_, b_))
F204 = Matrix([-y, x])
paths204 = [Matrix([t, t]), Matrix([t, t**2]), Matrix([t, 0]), Matrix([1, t])]
same([path.diff(t) for path in paths204], [Matrix([1, 1]), Matrix([1, 2*t]), Matrix([1, 0]), Matrix([0, 1])])
same(F204.subs({x: t, y: t}), Matrix([-t, t])); same(Matrix([-t, t]).dot(Matrix([1, 1])), 0); same(lint(F204, [t, t], 0, 1), 0)
same(F204.subs({x: t, y: t**2}), Matrix([-t**2, t])); same(Matrix([-t**2, t]).dot(Matrix([1, 2*t])), t**2)
steps(Integral(-t**2 + 2*t**2, (t, 0, 1)), Integral(t**2, (t, 0, 1)), Rational(1, 3)); same(lint(F204, [t, t**2], 0, 1), Rational(1, 3))
same(F204.subs({x: t, y: 0}).dot(Matrix([1, 0])), 0); same(F204.subs({x: 1, y: t}), Matrix([-t, 1])); same(Matrix([-t, 1]).dot(Matrix([0, 1])), 1)
same(lint(F204, [t, 0], 0, 1) + lint(F204, [1, t], 0, 1), 1)
```
:::

::: figure id=fig-20-2
例 20.4 中的力场 $\langle -y, x\rangle$ 和从 $(0, 0)$ 到 $(1, 1)$ 的三条路径。沿直线 $y = x$（绿色），力与运动垂直，不做功。沿抛物线 $y = x^2$（蓝色），做功 $\tfrac13$。沿角落路径（橙色），在底部边不做功，在右侧边做功 1。
:::

### 方向与参数化 {#direction}

逆向追踪抛物线，从 $(1, 1)$ 到 $(0, 0)$: $\vb{r}(t) = \langle 1 - t, (1 - t)^2\rangle$, $0 \le t \le 1$. 现在 $\vb{r}'(t) = \langle -1, -2(1 - t)\rangle$ 和 $\vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t) = (1 - t)^2 - 2(1 - t)^2 = -(1 - t)^2$, 所以功是 $-\tfrac13$: 沿相反方向运动时，力在之前帮助过的地方现在起阻碍作用。将曲线 $C$ 以相反方向追踪，记作 $-C$。

```check
rb = Matrix([1 - t, (1 - t)**2]); same(rb.diff(t), Matrix([-1, -2*(1 - t)]))
same(F204.subs({x: rb[0], y: rb[1]}, simultaneous=True).dot(rb.diff(t)), -(1 - t)**2); same(lint(F204, rb, 0, 1), -Rational(1, 3))
```

::: theorem 参数化与方向
设 $C$ 是由 $\vb{r}(t)$, $a \le t \le b$ 追踪的光滑曲线。设 $g$ 是定义在 $[c, d]$ 上的函数，其导数连续且恒不为零，其值域填满 $[a, b]$，且 $\tilde{\vb{r}}(u) = \vb{r}\big(g(u)\big)$, $c \le u \le d$。则 $\tilde{\vb{r}}$ 追踪相同的曲线，且对于每一个连续场 $\vb{F}$ 和函数 $f$ 在 $C$ 上：

- 若 $g' > 0$, $\tilde{\vb{r}}$ 沿相同方向追踪 $C$，则给出 $\vb{F}$ 的相同线积分；
- 若 $g' < 0$, $\tilde{\vb{r}}$ 追踪 $-C$，且 $\displaystyle\int_{-C} \vb{F}\cdot d\vb{r} = -\int_C \vb{F}\cdot d\vb{r}$；
- 在两种情况下，它给出相同的 $\displaystyle\int_C f\,ds$：特别是 $\displaystyle\int_{-C} f\,ds = \int_C f\,ds$。
:::

::: proof
由链式法则，$\tilde{\vb{r}}'(u) = \vb{r}'\big(g(u)\big)\,g'(u)$。若 $g' > 0$，则 $g$ 是递增的，具有 $g(c) = a$ 和 $g(d) = b$，且替换 $t = g(u)$（定理 10.7）给出

$$\begin{aligned} &\int_c^d \vb{F}\big(\vb{r}(g(u))\big)\cdot\vb{r}'\big(g(u)\big)\,g'(u)\,du \\ &\qquad= \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt. \end{aligned}$$

若 $g' < 0$，则 $g$ 是递减的，具有 $g(c) = b$ 和 $g(d) = a$，因此相同的替换给出 $\int_b^a$，即 $-\int_a^b$。对于 $\int_C f\,ds$，速度是 $\norm{\tilde{\vb{r}}'(u)} = \norm{\vb{r}'(g(u))}\,\abs{g'(u)}$。当 $g' < 0$，$\abs{g'} = -g'$，并且这个负号抵消了因反转积分限而产生的另一个负号。
:::

```check
gF = Function('g'); rF = Function('r')
same(diff(rF(gF(u)), u), Subs(Derivative(rF(t), t), t, gF(u))*Derivative(gF(u), u))
same(integrate((1 + sin(pi - u))*1, (u, 0, pi)), pi + 2)     # the wire traced backwards, t = pi - u
```

保持有序遍历的变速不会改变任一积分。反转遍历不会改变标量积分，但会改变功的积分。沿路径重复遍历两次则会计算两次遍历。

::: pitfall
两张卡片。 **(1)**忽略速度： $\int_C f\,ds$ 是 $\int_a^b f\big(\vb{r}(t)\big)\,\norm{\vb{r}'(t)}\,dt$，不是 $\int_a^b f\big(\vb{r}(t)\big)\,dt$。 使用 $\langle\cos 2u, \sin 2u\rangle$， $0 \le u \le \pi/2$， 忽略速度 2 会使得导线的质量为 $(\pi + 2)/2$，只有一半正确。**(2)** 使用位置代替速度：在例 20.4(b) 中， $\vb{F}$ 与 $\vb{r}(t) = \langle t, t^2\rangle$ 的点积代替 $\vb{r}'(t)$ 会得到 $-t^3 + t^3 = 0$，并得出错误的“功”为 0。

```check
same(integrate(1 + sin(2*u), (u, 0, pi/2)), (pi + 2)/2)
same(Matrix([-t**2, t]).dot(Matrix([t, t**2])), 0)
```
:::

::: compute 使用 SymPy 计算线积分
将一个场和一条路径存储为 SymPy 矩阵； `.subs` 将路径放入场中， `.diff(t)` 对路径求导， `.dot` 计算点积：

```python
import sympy as sp
x, y, t = sp.symbols('x y t')
F = sp.Matrix([-y, x])

def work(F, path, a, b):
    """The line integral of F along the path (x(t), y(t)), a <= t <= b."""
    r = sp.Matrix(path)
    on_path = F.subs({x: r[0], y: r[1]}, simultaneous=True)
    return sp.integrate(on_path.dot(r.diff(t)), (t, a, b))

print(work(F, [t, t], 0, 1), work(F, [t, t**2], 0, 1))
print(work(F, [t, 0], 0, 1) + work(F, [1, t], 0, 1))
print(work(F, [1 - t, (1 - t)**2], 0, 1))
```

```output
0 1/3
1
-1/3
```

这些是例 20.4 沿直线、抛物线和角落路径，以及沿抛物线反向的功。对于 $\int_C f\,ds$，应乘以速度；这里是例 20.3 中导线的质量：

```python
r = sp.Matrix([sp.cos(t), sp.sin(t)])
speed = sp.sqrt(r.diff(t).dot(r.diff(t)))
print(speed, sp.simplify(speed))
M = sp.integrate((1 + r[1])*sp.simplify(speed), (t, 0, sp.pi))
print(M, sp.N(M, 4))
```

```output
sqrt(sin(t)**2 + cos(t)**2) 1
2 + pi 5.142
```

只有调用 `sp.simplify` 时，SymPy 才会用到 $\sin^2 t + \cos^2 t = 1$。最后画一张图。matplotlib 的 `quiver` 在网格的每个点 `X`、`Y` 处，绘制分量为 `U`、`V` 的箭头。

```python
import numpy as np
import matplotlib.pyplot as plt
X, Y = np.meshgrid(np.linspace(-0.2, 1.2, 8), np.linspace(-0.2, 1.2, 8))
plt.quiver(X, Y, -Y, X, color='grey')            # the field <-y, x>
s = np.linspace(0, 1, 100)
plt.plot(s, s, s, s**2, [0, 1, 1], [0, 0, 1])   # the three paths
plt.gca().set_aspect('equal')
plt.show()
```

若使用 matplotlib 交互式后端，图像会在窗口中打开，显示图 20.2 中的向量场和三条路径。
:::

## 保守场 {#conservative}

如例 20.4 所示，做功一般与路径有关。近地面重力是个例外，把书从地板搬到书架，无论走哪条路径，克服重力所做的功都一样。本节将找出具有这种性质的向量场。此时可像模块 10 那样计算曲线积分，求出相应的势函数，再用终点的函数值减去起点的函数值。

::: theorem 曲线积分基本定理
设 $C$ 是由 $\vb{r}(t)$、$a \le t \le b$ 描出的分片光滑曲线，从点 $A = \vb{r}(a)$ 到点 $B = \vb{r}(b)$。设二元或三元函数 $f$ 在包含 $C$ 的开区域内可微且梯度连续。则

$$\int_C \nabla f\cdot d\vb{r} = f(B) - f(A).$$
:::

::: proof
先设 $C$ 是光滑曲线，并设 $g(t) = f\big(\vb{r}(t)\big)$ 为 $f$ 在动点处的值。由模块 17 的链式法则，

$$\begin{aligned} g'(t) &= f_x\,x'(t) + f_y\,y'(t) + f_z\,z'(t) \\ &= \nabla f\big(\vb{r}(t)\big)\cdot\vb{r}'(t) \end{aligned}$$

（在平面中不包含最后一项），并且这在 $[a, b]$ 上是连续的。根据净变化定理（[定理 10.5](module_10_ZH.html#net-change-theorem))，

$$\begin{aligned} \int_C \nabla f\cdot d\vb{r} &= \int_a^b g'(t)\,dt = g(b) - g(a) \\ &= f(B) - f(A). \end{aligned}$$

如果 $C$ 由从 $A = A_0$ 到 $A_1$、从 $A_1$ 到 $A_2$，依此类推直到 $A_n = B$ 的光滑片段组成，则将各片段的结果相加：和 $\big(f(A_1) - f(A_0)\big) + \dots + \big(f(A_n) - f(A_{n-1})\big)$ 会退化为 $f(B) - f(A)$。
:::

```check
grad3 = lambda f_: Matrix([diff(f_, w_) for w_ in (x, y, z)])
fT = x**2*y + y*z**2; rT = Matrix([cos(t), sin(t), t])                     # an instance, along a helix
onT = lambda e_: e_.subs({x: rT[0], y: rT[1], z: rT[2]}, simultaneous=True)
same(diff(onT(fT), t), onT(grad3(fT)).dot(rT.diff(t)))                     # g'(t) = grad f(r(t)) . r'(t)
same(lint(grad3(fT), rT, 0, pi/2), fT.subs({x: 0, y: 1, z: pi/2}) - fT.subs({x: 1, y: 0, z: 0}))
same(lint(grad3(fT), rT, 0, pi/2), pi**2/4)
```

::: definition 恒定场与势函数
设 $\vb{F}$ 是开区域 $D$ 上的向量场。若存在定义在 $D$ 上的可微函数 $f$，使 $\vb{F} = \nabla f$，则称该场为**保守场**。这样的 $f$ 称为 $\vb{F}$ 的**势函数**，或简称**势**。
:::

与不定积分类似，$f + K$也是一个势函数，对于任意常数$K$均成立。对于开连通区域上的连续场（定义见下文），不存在其他势函数：若$\nabla f = \nabla g$，则定理20.2对$h = f - g$给出$h(B) - h(A) = \int_C \vb{0}\cdot d\vb{r} = 0$，适用于由曲线$C$连接的任何两点。

由定理20.2，连续保守场$\vb{F} = \nabla f$的线积分仅取决于曲线的端点：它**与路径无关**。特别地，沿一条**闭合曲线**（即起点与终点重合的曲线），$B = A$且线积分为0。积分号上的圆圈标记闭合曲线：$\oint_C \vb{F}\cdot d\vb{r}$读作“F点乘dr沿C的积分”。

::: example 重力场是保守场
证明重力场$\vb{F} = -GMm\,\vb{r}/\norm{\vb{r}}^3$ 是空间中除去原点外的标量场$f = GMm/\norm{\vb{r}}$ 的梯度，并求重力在质量为$m$ 的物体从距离原点为$r_1$ 移动到距离原点为$r_2$ 的过程中所做的功，沿任何避开原点的路径。

写出$1/\norm{\vb{r}} = (x^2 + y^2 + z^2)^{-1/2}$。根据链式法则，

$$\begin{aligned} &\frac{\partial}{\partial x}\,(x^2 + y^2 + z^2)^{-1/2} \\ &\quad= -\tfrac12(x^2 + y^2 + z^2)^{-3/2}\cdot 2x \\ &\quad= -\frac{x}{\norm{\vb{r}}^3}, \end{aligned}$$

对 $y$ 和 $z$ 作同样的计算。故 $\nabla\big(1/\norm{\vb{r}}\big) = -\vb{r}/\norm{\vb{r}}^3$，且 $\nabla f = \vb{F}$。$f$ 的值只取决于到原点的距离，因此由定理 20.2，所做的功为

$$\begin{aligned} W &= f(B) - f(A) \\ &= GMm\Big(\frac{1}{r_2} - \frac{1}{r_1}\Big), \end{aligned}$$

无论路径如何：当物体下落靠近时为正（$r_2 < r_1$），当物体上升远离时为负。物理学家将$U = -f = -GMm/\norm{\vb{r}}$称为**势能**，因此重力所做的功即为下降量$U(A) - U(B)$。当重力是唯一作用力时，该功也等于动能的增加量。动能与势能之和保持恒定，故得名“保守力”。

```check
rnorm = sqrt(x**2 + y**2 + z**2)
same(diff((x**2 + y**2 + z**2)**Rational(-1, 2), x), -x/rnorm**3)
fgrav = Gc*Mc*mc/rnorm
same(grad3(fgrav), -Gc*Mc*mc*Matrix([x, y, z])/rnorm**3)
r1, r2 = symbols('r_1 r_2', positive=True)
same(fgrav.subs({x: r2, y: 0, z: 0}) - fgrav.subs({x: r1, y: 0, z: 0}), Gc*Mc*mc*(1/r2 - 1/r1))
holds((1/r2 - 1/r1).subs({r1: 2, r2: 1}) > 0); holds((1/r2 - 1/r1).subs({r1: 1, r2: 2}) < 0)
```
:::

一个区域 $D$，在平面或空间中，称为 **开集**，如果在其每个点附近存在一个圆盘（在空间中为一个球体），该圆盘完全包含在 $D$ 中，并且称为 **连通**，如果该区域中的任意两点都可以用一条分段光滑曲线连接起来，该曲线位于 $D$ 中。

::: theorem 保守场与闭合曲线
设 $\vb{F}$ 是开连通区域 $D$ 上的连续向量场。下列三个命题等价，每个都能推出另外两个。

1. $\vb{F}$ 在 $D$ 上是保守场。
2. 对于 $D$ 内的分片光滑曲线 $C$，$\int_C \vb{F}\cdot d\vb{r}$ 只取决于 $C$ 的两个端点。
3. 对于 $D$ 内的每条分片光滑闭合曲线 $C$，均有 $\oint_C \vb{F}\cdot d\vb{r} = 0$。
:::

::: proof
**1 ⇒ 2**是定理 20.2。**2 ⇒ 3：**在闭曲线 $C$ 上取两点 $A$、$B$，将它分成从 $A$ 到 $B$ 的 $C_1$，以及从 $B$ 返回 $A$ 的 $C_2$。$C_1$ 和 $-C_2$ 都从 $A$ 到 $B$，由命题 2 得 $\int_{C_1} = \int_{-C_2} = -\int_{C_2}$、$\oint_C = \int_{C_1} + \int_{C_2} = 0$。**3 ⇒ 2：**若 $C_1$、$C_2$ 都从 $A$ 到 $B$，先沿 $C_1$ 再沿 $-C_2$ 就构成一条闭曲线，所以 $0 = \int_{C_1} - \int_{C_2}$。

**2 ⇒ 1**（平面情形）。固定 $D$ 中一点 $A$。对于 $D$ 中任一点 $(x, y)$，沿 $D$ 中任一从 $A$ 到 $(x, y)$ 的分片光滑曲线 $C$ 定义 $f(x, y) = \int_C \vb{F}\cdot d\vb{r}$。由于 $D$ 连通，这样的曲线存在；由命题 2，定义值与路径的选择无关。因为 $D$ 是开集，它包含穿过 $(x, y)$ 的一小段水平线段。线段左端为满足 $x_1 < x$ 的点 $(x_1, y)$，右端在 $(x, y)$ 的右侧。对该线段上每个点 $(x', y)$，选取 $C$ 先从 $A$ 到 $(x_1, y)$，再沿线段到达 $(x', y)$。在线段上 $y$ 保持常值，所以 $dy = 0$，并且

$$f(x', y) = f(x_1, y) + \int_{x_1}^{x'} P(s, y)\,ds.$$

第一项与 $x'$ 无关，因此由微积分基本定理第一部分（[第 10.4 节](module_10_ZH.html#ftc1)）可得 $f_x(x, y) = P(x, y)$。用一小段竖直线段同理得到 $f_y = Q$。在空间中，第三条线段给出 $f_z = R$。由于 $\vb{F}$ 连续，这些偏导数连续。由模块 17，$f$ 可微，且 $\nabla f = \vb{F}$。
:::

```check
Ps = Function('P')
same(diff(Integral(Ps(s, y), (s, symbols('x_1'), x)), x), Ps(x, y))
```

### 保守场的判别法 {#test}

能否不求势函数就判断 $\vb{F} = \langle P, Q\rangle$ 是否为保守场？若 $\vb{F} = \nabla f$，则 $P = f_x$、$Q = f_y$。由模块 17 的克莱罗定理，$f$ 的混合偏导数相等。

::: theorem 保守场的必要条件
若 $\vb{F} = \langle P, Q\rangle$ 在开区域 $D$ 上是保守场，且 $P$ 与 $Q$ 在 $D$ 上具有连续的一阶偏导数，则

$$\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x} \quad\text{throughout } D.$$
:::

::: proof
设 $\vb{F} = \nabla f$，则 $P = f_x$、$Q = f_y$。于是 $f_{xy} = P_y$ 与 $f_{yx} = Q_x$ 在 $D$ 上连续，由克莱罗定理得 $f_{xy} = f_{yx}$，即 $P_y = Q_x$。
:::

因此，旋转场 $\langle -y, x\rangle$，具有 $P_y = -1$ 和 $Q_x = 1$，不是保守场，如例 20.4 所示：从 $(0, 0)$ 到 $(1, 1)$ 的功依赖于路径。其逆命题是否成立？不一定。

```check
same(diff(-y, y), -1); same(diff(x, x), 1)
```

::: example 存在“洞”的场
设 $\vb{F}(x, y) = \Big\langle \dfrac{-y}{x^2 + y^2}, \dfrac{x}{x^2 + y^2}\Big\rangle$，在平面除去原点的区域上。

- (a) 证明 $\partial P/\partial y = \partial Q/\partial x$ 在 $\vb{F}$ 有定义的任何地方成立。
- (b) 求 $\oint_C \vb{F}\cdot d\vb{r}$，其中 $C$ 是单位圆，沿逆时针方向绕行一次。
- (c) $\vb{F}$ 是保守场吗？

**(a)** 根据商的法则，

$$\begin{aligned} \frac{\partial P}{\partial y} &= \frac{-(x^2 + y^2) + y\cdot 2y}{(x^2 + y^2)^2} \\ &= \frac{y^2 - x^2}{(x^2 + y^2)^2}, \\ \frac{\partial Q}{\partial x} &= \frac{(x^2 + y^2) - x\cdot 2x}{(x^2 + y^2)^2} \\ &= \frac{y^2 - x^2}{(x^2 + y^2)^2}. \end{aligned}$$

**(b)** 取 $\vb{r}(t) = \langle\cos t, \sin t\rangle$、$0 \le t \le 2\pi$。在 $C$ 上有 $x^2 + y^2 = 1$，故 $\vb{F}\big(\vb{r}(t)\big) = \langle -\sin t, \cos t\rangle$，也就是 $\vb{r}'(t)$。于是 $\vb{F}\cdot\vb{r}' = \sin^2 t + \cos^2 t = 1$，且 $\oint_C \vb{F}\cdot d\vb{r} = 2\pi$。

**(c)** No. 根据定理 20.3，保守场在任意闭合曲线上的线积分等于 0，而该场在 $2\pi$ 上绕 $C$ 时积分不为 0，尽管 $P_y = Q_x$ 处处成立。在右半平面 $x > 0$ 上，$\vb{F}$ 是 $\theta(x, y) = \arctan(y/x)$ 的梯度，即模 16 的极角（可导性验证）。绕原点一周会使极角增加 $2\pi$：这就是 (b) 中的 $2\pi$。在整个平面除去原点处不存在势函数，因为极角无法在整个路径上连续定义：某处必须跳跃 $2\pi$。

```check
P206, Q206 = -y/(x**2 + y**2), x/(x**2 + y**2)
same(diff(P206, y), (y**2 - x**2)/(x**2 + y**2)**2); same(diff(Q206, x), (y**2 - x**2)/(x**2 + y**2)**2)
rc206 = Matrix([cos(t), sin(t)]); Fr206 = Matrix([P206, Q206]).subs({x: cos(t), y: sin(t)}, simultaneous=True)
same(Fr206, Matrix([-sin(t), cos(t)])); same(Fr206, rc206.diff(t)); same(Fr206.dot(rc206.diff(t)), 1)
same(lint(Matrix([P206, Q206]), rc206, 0, 2*pi), 2*pi)
xpos = symbols('x', positive=True)
same(diff(atan(y/xpos), xpos), P206.subs(x, xpos)); same(diff(atan(y/xpos), y), Q206.subs(x, xpos))
```
:::

问题出在区域有一个孔洞。单位圆上的每一点都在 $\vb{F}$ 的定义域中，但这个圆绕过了原点，而 $\vb{F}$ 在原点没有定义。

::: definition 单连通区域
**简单曲线**没有重复点，简单闭曲线的起点和终点可以重合。平面区域 $D$ 称为**单连通**的，如果它连通，且 $D$ 内的每条简单闭曲线所围成的区域完全包含在 $D$ 内。
:::

非正式地说，一个单连通区域没有“洞”。圆盘、半平面、整个平面以及任何简单闭合曲线内部都是单连通的；而两个圆之间的环形区域、以及不含原点的平面则不是单连通的。

::: theorem 保守场的判别法
设 $P$ 和 $Q$ 在平面上的开单连通区域 $D$ 内具有连续的一阶偏导数，且

$$\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x} \quad\text{throughout } D.$$

则 $\vb{F} = \langle P, Q\rangle$ 在 $D$ 上是保守场。
:::

第20.4节说明了这一点，使用格林定理（Green's theorem）。例20.6表明“单连通”不能省略。

::: pitfall
$P_y = Q_x$ 本身并不意味着该向量场是保守场：还需检查 $P$ 和 $Q$ 具有连续偏导数的区域是否单连通（例 20.6）。并比较右侧的偏导数，每个分量分别对另一个变量求导：对于旋转向量场 $\langle -y, x\rangle$, $P_x = 0 = Q_y$, 但 $P_y = -1 \ne 1 = Q_x$，该场不是保守场。
:::

### 寻找势函数 {#potential}

当测试结果为“是”时，通过逐个变量“撤销”偏导数来求 $f$。

::: example 寻找势函数
设 $\vb{F}(x, y) = \big\langle y\cos x + 2xe^y,\ \sin x + x^2e^y + 2y\big\rangle$。

- (a) 证明 $\vb{F}$ 在平面上是保守场。
- (b) 求 $f$ 的势函数。
- (c) 求 $\vb{F}$ 沿曲线 $\vb{r}(t) = \langle \pi t/2, t^2\rangle$，$0 \le t \le 1$ 所做的功。

**(a)** $P_y = \cos x + 2xe^y$ 和 $Q_x = \cos x + 2xe^y$ 在整个平面内相等且连续，该平面是单连通的，因此根据定理 20.5，$\vb{F}$ 是保守场。

**(b)** 由于 $f_x = P$，$f$ 是 $P$ 关于 $x$ 的原函数，且 $y$ 保持不变：

$$f(x, y) = y\sin x + x^2e^y + g(y).$$

积分常数可能依赖于 $y$，因为 $y$ 被固定住了。现在对 $y$ 求导并将其与 $Q$ 比较：

$$\begin{aligned} f_y &= \sin x + x^2e^y + g'(y) \\ &= \sin x + x^2e^y + 2y, \end{aligned}$$

所以 $g'(y) = 2y$ 和 $g(y) = y^2 + K$。对于 $K = 0$，

$$f(x, y) = y\sin x + x^2e^y + y^2.$$

检查：$\nabla f = \vb{F}$。

**(c)** 曲线从 $\vb{r}(0) = (0, 0)$ 到 $\vb{r}(1) = (\pi/2, 1)$。根据定理 20.2，无需沿曲线积分，

$$\begin{aligned} W &= f\big(\tfrac{\pi}{2}, 1\big) - f(0, 0) \\ &= 1 + \frac{\pi^2}{4}e + 1 - 0 \\ &= 2 + \frac{\pi^2 e}{4} \approx 8.707. \end{aligned}$$

从 $(0, 0)$ 到 $(\pi/2, 1)$ 的任何其他路径给出相同的功。

```check
P207 = y*cos(x) + 2*x*exp(y); Q207 = sin(x) + x**2*exp(y) + 2*y
same(diff(P207, y), cos(x) + 2*x*exp(y)); same(diff(Q207, x), cos(x) + 2*x*exp(y))
antideriv(y*sin(x) + x**2*exp(y), P207, x)
same(diff(y*sin(x) + x**2*exp(y), y), sin(x) + x**2*exp(y)); same(Q207 - (sin(x) + x**2*exp(y)), 2*y); antideriv(y**2, 2*y, y)
f207 = y*sin(x) + x**2*exp(y) + y**2
same(Matrix([diff(f207, x), diff(f207, y)]), Matrix([P207, Q207]))
r207 = Matrix([pi*t/2, t**2]); same(r207.subs(t, 0), Matrix([0, 0])); same(r207.subs(t, 1), Matrix([pi/2, 1]))
same(f207.subs({x: pi/2, y: 1}), 1 + pi**2*E/4 + 1); same(f207.subs({x: 0, y: 0}), 0)
W207 = f207.subs({x: pi/2, y: 1}) - f207.subs({x: 0, y: 0})
same(W207, 2 + pi**2*E/4); rounds(W207, '8.707')
near(Integral(Matrix([P207, Q207]).subs({x: r207[0], y: r207[1]}, simultaneous=True).dot(r207.diff(t)), (t, 0, 1)).evalf(30), W207, 1e-20)
```
:::

::: pitfall
两张卡片。 **(1)**对于积分常数，写作一个普通常数 $C$，相对于 $x$：它可能依赖于 $y$，在这里一个普通常数会丢失 $y^2$ 这一项。**(2)** 对 $P$ 关于 $x$ 积分，对 $Q$ 关于 $y$ 积分，然后将结果相加：这样会将它们共有的项 $y\sin x + x^2e^y$ 计算两次，而和的梯度不是 $\vb{F}$。检查一个势函数，可以通过计算其梯度来验证。

```check
wrong207 = (y*sin(x) + x**2*exp(y)) + (y*sin(x) + x**2*exp(y) + y**2)
same(diff(wrong207, x), 2*P207); holds(Ne(diff(wrong207, x).subs({x: 0, y: 1}), P207.subs({x: 0, y: 1})))
```
:::

## 格林定理 {#green}

抛物线和例20.4中的直线一起构成一个闭合曲线：从$(0, 0)$沿抛物线到$(1, 1)$，再沿直线返回。绕行时，旋转场$\langle -y, x\rangle$在向外路径上做功$\tfrac13$，在返回路径上做功$0$：总计为$\tfrac13$。两曲线之间的区域面积为$\int_0^1 (x - x^2)\,dx = \tfrac16$，且对于该场来说，处处为$\partial Q/\partial x - \partial P/\partial y = 1 - (-1) = 2$。并且$\tfrac13 = 2 \times \tfrac16$。这并非偶然。

```check
same(lint(F204, [t, t**2], 0, 1) - lint(F204, [t, t], 0, 1), Rational(1, 3))
same(integrate(x - x**2, (x, 0, 1)), Rational(1, 6)); same(diff(x, x) - diff(-y, y), 2); same(2*Rational(1, 6), Rational(1, 3))
```

这是想法。取一个以$(x, y)$为左下角、边长为$h > 0$的小正方形。逆时针遍历路径向上走右边，向下走左边，因此垂直边的贡献为

$$\int_y^{y+h} \big[Q(x+h,v)-Q(x,v)\big]\,dv.$$

如果一阶偏导数连续，则在这一短区间内，括号除以$h$近似等于$Q_x(x,y)$，根据平均值定理。因此贡献约为$Q_x(x,y)h^2$。遍历路径在底部向右，在顶部向左，因此水平边的贡献约为$-P_y(x,y)h^2$，根据相同理由。因此环流近似为$(Q_x-P_y)h^2$，误差相对于$h^2$来说很小。

对由小方格组成的区域（图20.3），加上这些环流。一条共享边被以相反方向各计算一次，因此其贡献相互抵消。只剩下边界积分。将 $(Q_x-P_y)$ 乘以小方格的面积之和，近似等于 $Q_x-P_y$ 在该区域上的二重积分。

::: figure id=fig-20-3
左：一个区域 $D$ 和它的边界 $C$，按逆时针方向追踪，使得 $D$ 在左侧；在某一点，单位切向量 $\vb{T}$ 和向外单位法向量 $\vb{n}$。右：同样的想法应用于小方格，每个方格按逆时针方向追踪。在每一条内部边，两个箭头指向相反方向（灰色），因此它们的线积分相互抵消；只剩下外边界（蓝色）。
:::

平面上一个简单闭合曲线 $C$ 被称为 **正向（positively oriented）**，如果它是按逆时针方向追踪的，也就是说，当你沿着曲线行走时，它所包围的区域在你的左侧。

::: theorem 格林定理
设 $C$ 是平面上一条正向、分片光滑的简单闭合曲线，$D$ 是由 $C$ 及其围成的内部点组成的区域。如果 $P$ 与 $Q$ 在包含 $D$ 的开区域内具有连续的一阶偏导数，则

$$\begin{aligned} &\oint_C P\,dx + Q\,dy \\ &\quad= \iint_D \Big(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\Big)\,dA. \end{aligned}$$
:::

下面证明区域同时为模块 19 定义的第 I 类和第 II 类时的结论，例如圆盘、三角形，以及抛物线与直线之间的区域。

::: proof 第 I 类且第 II 类区域上的格林定理
只需证明

$$\begin{aligned} \oint_C P\,dx &= -\iint_D \frac{\partial P}{\partial y}\,dA \quad\text{and} \\ \oint_C Q\,dy &= \iint_D \frac{\partial Q}{\partial x}\,dA, \end{aligned}$$

并相加。对于第一部分，将 $D$ 描述为类型 I 区域：即 $a \le x \le b$ 和 $g_1(x) \le y \le g_2(x)$。根据菲比定理（模块 19），并结合 $y$ 中的微积分基本定理第 2 部分，保持 $x$ 不变，

$$\begin{aligned} \iint_D \frac{\partial P}{\partial y}\,dA &= \int_a^b \int_{g_1(x)}^{g_2(x)} \frac{\partial P}{\partial y}\,dy\,dx \\ &= \int_a^b \Big[P\big(x, g_2(x)\big) \\ &\qquad\quad - P\big(x, g_1(x)\big)\Big]\,dx. \end{aligned}$$

现在沿$C$逆时针分四部分绕行，其中部分可能为单点。沿底部，$x$从$a$到$b$和$y=g_1(x)$。利用该弧的分段光滑参数化并将其$x$-坐标代入积分得$\int P\,dx = \int_a^b P\big(x, g_1(x)\big)\,dx$。这仅需$g_1$连续，故也适用于端点处有垂直切线的弧。沿右侧，$x = b$不变，故$dx = 0$和$\int P\,dx = 0$。沿顶部，从$x = b$回溯至$x = a$的$g_2$的图线，$\int P\,dx = -\int_a^b P\big(x, g_2(x)\big)\,dx$。沿左侧，$dx = 0$再次。将四部分相加，

$$\begin{aligned} \oint_C P\,dx &= \int_a^b \Big[P\big(x, g_1(x)\big) \\ &\qquad\quad - P\big(x, g_2(x)\big)\Big]\,dx \\ &= -\iint_D \frac{\partial P}{\partial y}\,dA. \end{aligned}$$

对于第二个公式，将 $D$ 描述为类型 II 区域，$c \le y \le d$ 和 $h_1(y) \le x \le h_2(y)$。同样地，$\iint_D Q_x\,dA = \int_c^d \big[Q\big(h_2(y), y\big) - Q\big(h_1(y), y\big)\big]\,dy$。按逆时针方向绕 $C$ 追踪，会向上追踪右边缘 $x = h_2(y)$，向下追踪左边缘 $x = h_1(y)$，而在水平部分 $dy = 0$，因此 $\oint_C Q\,dy$ 是相同的积分。
:::

```check
Pf_, g1_, g2_ = Function('P'), Function('g_1'), Function('g_2')
same(integrate(diff(Pf_(x, y), y), (y, g1_(x), g2_(x))), Pf_(x, g2_(x)) - Pf_(x, g1_(x)))
Qf_, h1_, h2_ = Function('Q'), Function('h_1'), Function('h_2')
same(integrate(diff(Qf_(x, y), x), (x, h1_(y), h2_(y))), Qf_(h2_(y), y) - Qf_(h1_(y), y))
# an instance: P = x*y**2 + y, Q = x**3 on the region between y = x**2 and y = x, edge by edge
P_i, Q_i = x*y**2 + y, x**3
bottom_ = lint(Matrix([P_i, Q_i]), [t, t**2], 0, 1); top_ = lint(Matrix([P_i, Q_i]), [1 - t, 1 - t], 0, 1)
same(bottom_ + top_, integrate(diff(Q_i, x) - diff(P_i, y), (y, x**2, x), (x, 0, 1)))
```

**其他区域。** 格林定理对于由分段光滑简单闭曲线围成的每一个区域都成立，但一般证明超出了本系列的范围。一个可以分割成有限个类型I和类型II区域的区域，可以通过将证明分别应用于每个子区域，然后相加得到：每个分割线被两次追踪，一次正方向，一次反方向，因此沿着分割线的线积分相互抵消，如图20.3所示。同样的抵消原理适用于有孔的区域，当每个边界曲线都按其左侧为 $D$ 的方向追踪时：外边界按逆时针方向，内边界按顺时针方向。

**为什么第20.3节的测试有效。** 设 $D$ 是开的且单连通的，且 $P_y = Q_x$ 始终在 $D$ 内。一个简单闭合曲线 $C$ 在 $D$ 内围成的区域 $R$ 也位于 $D$ 内，因为 $D$ 没有孔，Green 定理给出 $\oint_C \vb{F}\cdot d\vb{r} = \pm\iint_R (Q_x - P_y)\,dA = 0$（符号由 $C$ 的方向确定）。为了包含交叉或重复自身路径的闭合路径，首先考虑 $D$ 内的一个闭合折线。将折线的边在交叉点和任何重叠的端点处分开。该路径可以按重复顶点分割为简单的折线环和成对的边（即来回的边）。这些环由 Green 定理给出 0，而成对的边相互抵消。

对于一般的分段光滑闭合路径，用短弦连接路径上的相继点。该路径在开集 $D$ 内是紧致的，因此足够短的弦仍留在 $D$ 内。在每一段光滑路径上，所得到的折线参数化在一致收敛于路径，并且在子分点之外，其速度也一致收敛于路径的速度，这是由于 $\vb{r}'$ 的连续性。因此，折线路径的线积分趋近于路径的线积分。每个积分都是 0，因此路径上的积分也是 0。定理 20.3 现在给出定理 20.5。对于例 20.6 中的场，绿定理不能用于单位圆盘，因为该圆盘包含原点，而该场在原点处未定义。

::: example 简单的线积分
计算 $\displaystyle\oint_C \big(xy - e^{x^2}\big)\,dx + \big(x^2 + 3x + \ln(1 + y^2)\big)\,dy$，其中 $C$ 是圆 $x^2 + y^2 = 4$，按逆时针方向绕行。

直接参数化会产生诸如 $2e^{4\cos^2 t}\sin t$ 这样的项。绿定理避免了沿圆周积分这些项。这里 $P = xy - e^{x^2}$ 和 $Q = x^2 + 3x + \ln(1 + y^2)$ 在整个平面上都有连续的偏导数，并且

$$\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y} = (2x + 3) - x = x + 3.$$

不合适的术语已去除：$e^{x^2}$ 不依赖于 $y$，且 $\ln(1 + y^2)$ 不依赖于 $x$。对于 $D$ 的半径为 2 的圆盘，在极坐标下（模块 19），

$$\begin{aligned} &\oint_C P\,dx + Q\,dy = \iint_D (x + 3)\,dA \\ &\quad= \int_0^{2\pi}\!\!\int_0^2 (r\cos\theta + 3)\,r\,dr\,d\theta \\ &\quad= 0 + 3\cdot\pi\cdot 2^2 = 12\pi. \end{aligned}$$

$x$ 在该圆盘上的积分等于 0，因为该圆盘关于 $y$ 轴对称，且 $x$ 是奇函数：极坐标形式为 $\int_0^{2\pi}\cos\theta\,d\theta = 0$。

```check
P208 = x*y - exp(x**2); Q208 = x**2 + 3*x + log(1 + y**2)
same(diff(Q208, x), 2*x + 3); same(diff(P208, y), x)
same(diff(Q208, x) - diff(P208, y), x + 3)
same(integrate((r*cos(theta) + 3)*r, (r, 0, 2), (theta, 0, 2*pi)), 12*pi)
same(integrate(r*cos(theta)*r, (r, 0, 2), (theta, 0, 2*pi)), 0); same(3*pi*2**2, 12*pi)
same((-exp(x**2)).subs(x, 2*cos(t))*diff(2*cos(t), t), 2*exp(4*cos(t)**2)*sin(t))
rc208 = Matrix([2*cos(t), 2*sin(t)])
lhs208 = Integral(Matrix([P208, Q208]).subs({x: rc208[0], y: rc208[1]}, simultaneous=True).dot(rc208.diff(t)), (t, 0, 2*pi)).evalf(30)
near(lhs208, 12*pi, 1e-20)
```
:::

### 回路积分与通量 {#flux-form}

自从 $P\,dx + Q\,dy = \vb{F}\cdot\vb{T}\,ds$，格林定理的左边是 $\oint_C \vb{F}\cdot\vb{T}\,ds$，即 **环流量**，沿 $\vb{F}$ 围绕 $C$。如果 $\vb{F}$ 是流体的速度，它衡量流体沿 $C$，绕环流动的强度。

另一个自然的问题是流体有多少从 $C$ 流出，只有速度的法向分量携带流体穿过。将单位切向量 $\vb{T} = \langle x', y'\rangle/\norm{\vb{r}'}$ 顺时针旋转四分之一圈得到 **向外单位法向量**

$$\vb{n} = \frac{\langle y'(t), -x'(t)\rangle}{\norm{\vb{r}'(t)}},$$

其方向背离 $D$，因为行进时 $D$ 在左侧。例如，由 $\langle\cos t, \sin t\rangle$ 描绘的单位圆满足 $\vb{n} = \langle\cos t, \sin t\rangle$。$\vb{F}$ 穿过 $C$ 的**通量**为 $\oint_C \vb{F}\cdot\vb{n}\,ds$。

```check
rcu = Matrix([cos(t), sin(t)]); same(Matrix([rcu.diff(t)[1], -rcu.diff(t)[0]]), rcu)
```

::: theorem 格林定理的通量形式
在定理 20.6 的假设下，若 $\vb{n}$ 为 $C$ 的外法向单位向量，则

$$\oint_C \vb{F}\cdot\vb{n}\,ds = \iint_D \Big(\frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y}\Big)\,dA.$$
:::

::: proof
由于 $\vb{n}\,ds = \langle y'(t), -x'(t)\rangle\,dt$，

$$\begin{aligned} \vb{F}\cdot\vb{n}\,ds &= \big(P\,y'(t) - Q\,x'(t)\big)\,dt \\ &= -Q\,dx + P\,dy. \end{aligned}$$

该场 $\langle -Q, P\rangle$ 也具有连续偏导数的分量，其绿色定理为

$$\begin{aligned} &\oint_C (-Q)\,dx + P\,dy \\ &\quad= \iint_D \Big(\frac{\partial P}{\partial x} - \frac{\partial(-Q)}{\partial y}\Big)\,dA, \end{aligned}$$

即公式。
:::

如果 $\vb{F}$ 表示二维流动的速度，流量是流体穿过 $D$ 跨越 $C$ 的净速率（单位面积单位时间），而 $P_x + Q_y$，即第20.5节所命名的散度，衡量流体从每个点扩散的速度。对于源 $\vb{G} = \langle x, y\rangle$ 和单位圆， $\vb{G}\cdot\vb{n} = \cos^2 t + \sin^2 t = 1$，因此流量为 $2\pi$，确实 $\iint_D (1 + 1)\,dA = 2\pi$；由于 $\vb{G}$ 与圆垂直，环量为 0。对于旋涡场，情况相反：环量 $2\pi$，流量 0。

```check
Gs = Matrix([x, y]); on_c = lambda e_: e_.subs({x: cos(t), y: sin(t)}, simultaneous=True)
same(on_c(Gs).dot(rcu), 1); same(integrate(on_c(Gs).dot(rcu), (t, 0, 2*pi)), 2*pi); same(integrate(2*r, (r, 0, 1), (theta, 0, 2*pi)), 2*pi)
same(lint(Gs, rcu, 0, 2*pi), 0); same(lint(F204, rcu, 0, 2*pi), 2*pi); same(integrate(on_c(F204).dot(rcu), (t, 0, 2*pi)), 0)
```

::: widget name=vector-field
选择一个矢量场，然后使用滑块移动圆圈，或在图上拖动以移动圆心。读数显示圆圈周围的环量 $\oint \vb{F}\cdot d\vb{r}$（逆时针方向）和向外通量 $\oint \vb{F}\cdot\vb{n}\,ds$，每个值旁边都有格林定理所说的与圆盘上的二重积分相等的数值，所有计算都是数值进行的。对于旋转场，无论圆圈在哪里，环量都是 $2\pi r^2$，因为在任何地方 $Q_x - P_y = 2$。对于剪切场 $\langle y, 0\rangle$，每个箭头都是水平的，但环量却是 $-\pi r^2$。对于梯度场，每个圆的环量都是 0（定理 20.3）。然后选择你自己的场，输入 $P$ = `-y/(x^2+y^2)` 和 $Q$ = `x/(x^2+y^2)`（例 20.6），并比较原点严格在外部和严格在内部的圆。半径为 1 时，分别尝试中心 $(2,1)$ 和 $(0.3,0.2)$。环量在外部为 0，在内部为 $2\pi$（练习 20.11）。虽然 $Q_x-P_y=0$ 在场定义的任何地方都成立，但包含原点的圆盘不满足格林定理的假设。读数可以标记不匹配或不提供不可靠的估计。数值一致本身不能验证假设。
:::

### 从边界求面积 {#area}

在格林定理的假设下，若 $Q_x - P_y = 1$，则 $D$ 的面积是一个沿其正向边界环绕的线积分。三个简单的选择是 $P = 0$, $Q = x$； $P = -y$, $Q = 0$；和 $P = -y/2$, $Q = x/2$：

$$\begin{aligned} A &= \oint_C x\,dy = -\oint_C y\,dx \\ &= \frac12\oint_C x\,dy - y\,dx. \end{aligned}$$

::: example 椭圆的面积
求由椭圆 $x = a\cos t$, $y = b\sin t$, $0 \le t \le 2\pi$ 所围成的区域的面积，其中 $a, b > 0$.

椭圆按逆时针方向被描绘。对于 $dx = -a\sin t\,dt$ 和 $dy = b\cos t\,dt$，

$$\begin{aligned} A &= \frac12\oint_C x\,dy - y\,dx \\ &= \frac12\int_0^{2\pi} \big(ab\cos^2 t + ab\sin^2 t\big)\,dt \\ &= \pi ab. \end{aligned}$$

对于 $a = b = r$，这是圆的面积，即 $\pi r^2$.

```check
ae, be_ = symbols('a b', positive=True)
xe, ye = ae*cos(t), be_*sin(t)
same(xe*diff(ye, t) - ye*diff(xe, t), ae*be_)
same(integrate((xe*diff(ye, t) - ye*diff(xe, t))/2, (t, 0, 2*pi)), pi*ae*be_)
same(integrate(xe*diff(ye, t), (t, 0, 2*pi)), pi*ae*be_)
```
:::

**测量仪。** 测量仪是一种机械仪器，用于测量纸上绘制的区域的面积，例如地图上的田地，当其指针沿着边界走一圈时。当固定支点位于区域外部时，测量轮在指针绕行过程中累积一个线积分。格林定理将这个积分与面积联系起来。

**多边形。** 对于多边形，面积公式变为一个和。沿从 $(x_1, y_1)$ 到 $(x_2, y_2)$ 的边，由 $x = x_1 + t(x_2 - x_1)$, $y = y_1 + t(y_2 - y_1)$, $0 \le t \le 1$ 被描绘，

$$\begin{aligned} &x\,dy - y\,dx \\ &\quad= \big[x\,(y_2 - y_1) - y\,(x_2 - x_1)\big]\,dt \\ &\quad= (x_1y_2 - x_2y_1)\,dt, \end{aligned}$$

因为展开后，含有 $t$ 的项相互抵消。因此，每条边贡献 $x_1y_2 - x_2y_1$，一个简单多边形，其顶点 $(x_1, y_1), \dots, (x_n, y_n)$ 按逆时针顺序列出，其面积为

$$A = \frac12\sum_{k=1}^{n} \big(x_ky_{k+1} - x_{k+1}y_k\big),$$

其中 $(x_{n+1}, y_{n+1})$ 表示第一个角 $(x_1, y_1)$ 再次。这是 **鞋带公式**（或测地员公式），用于计算多边形的面积，被映射和图形软件所采用。

```check
x1s, y1s, x2s, y2s = symbols('x_1 y_1 x_2 y_2')
xs_, ys_ = x1s + t*(x2s - x1s), y1s + t*(y2s - y1s)
same(expand(xs_*diff(ys_, t) - ys_*diff(xs_, t)), x1s*y2s - x2s*y1s)
```

::: compute 由顶点计算面积
鞋带公式是几行 Python 代码：

```python
import math

def area(corners):
    """The signed area of a simple polygon, with corners in boundary order."""
    n = len(corners)
    total = 0
    for k in range(n):
        x1, y1 = corners[k]
        x2, y2 = corners[(k + 1) % n]    # next corner; wraps round to the first
        total += x1*y2 - x2*y1
    return total/2

print(area([(0, 0), (2, 0), (2, 1), (0, 1)]))
print(area([(0, 0), (0, 1), (2, 1), (2, 0)]))
print(area([(0, 0), (4, 0), (4, 3), (2, 1), (0, 3)]))
```

```output
2.0
-2.0
8.0
```

第一个矩形，2×1，面积为 2。第二个是相同矩形，但顶点按顺时针顺序列出：结果的符号表示边界的方向。第三个多边形在其顶部有一个凹陷；公式不需要多边形是凸的。正多边形内接于单位圆时，其面积随着边数的增加趋近于单位圆的面积：

```python
for n in [6, 100, 10000]:
    step = 2*math.pi/n          # angle between neighbouring corners
    corners = [(math.cos(k*step), math.sin(k*step)) for k in range(n)]
    print(f"{n} {area(corners):.10f}")
print(f"{math.pi:.10f}")
```

```output
6 2.5980762114
100 3.1395259765
10000 3.1415924469
3.1415926536
```

所示值保留到十位小数，趋近于 $\pi$，即单位圆的面积。
:::

```check
sh = lambda P_: Rational(sum(P_[k_][0]*P_[(k_ + 1) % len(P_)][1] - P_[(k_ + 1) % len(P_)][0]*P_[k_][1] for k_ in range(len(P_))), 2)
same(sh([(0, 0), (2, 0), (2, 1), (0, 1)]), 2); same(sh([(0, 0), (0, 1), (2, 1), (2, 0)]), -2)
same(sh([(0, 0), (4, 0), (4, 3), (2, 1), (0, 3)]), 8); same(4*3 - Rational(1, 2)*4*2, 8)     # the rectangle minus the notch
ak_, dk_ = symbols('alpha delta'); same(cos(ak_)*sin(ak_ + dk_) - cos(ak_ + dk_)*sin(ak_), sin(dk_))   # each term of a regular n-gon
nP = symbols('n', positive=True, integer=True); same(Sum(sin(2*pi/nP)/2, (Symbol('k'), 0, nP - 1)).doit(), nP/2*sin(2*pi/nP))
nL = symbols('n_L', positive=True); limit_is(nL/2*sin(2*pi/nL), nL, oo, pi)
for n_, shown_ in [(6, '2.5980762114'), (100, '3.1395259765'), (10000, '3.1415924469')]:
    rounds(n_*sin(2*pi/n_)/2, shown_)
rounds(pi, '3.1415926536')
```

## 旋度与散度 {#curl-divergence}

格林定理的两种形式对应两个被积函数，$Q_x - P_y$ 和 $P_x + Q_y$。在空间中它们分别对应旋度和散度。用 $\nabla$ 表示“del”运算符的向量，即偏导数运算符的向量 $\big\langle \partial/\partial x, \partial/\partial y, \partial/\partial z\big\rangle$。作用于一个函数 $f$ 时，得到梯度 $\nabla f$；与一个场 $\vb{F}$ “叉乘”或“点乘”时，得到以下结果。

::: definition 旋度与散度
设 $\vb{F} = \langle P, Q, R\rangle$ 是各分量均具有一阶偏导数的向量场。$\vb{F}$ 的**旋度**为向量场

$$\begin{aligned} &\operatorname{curl}\vb{F} = \nabla\times\vb{F} \\ &\quad= \big\langle R_y - Q_z,\ P_z - R_x,\ Q_x - P_y\big\rangle, \end{aligned}$$

而 $\vb{F}$ 的**散度**为函数

$$\operatorname{div}\vb{F} = \nabla\cdot\vb{F} = P_x + Q_y + R_z.$$

此处下标表示偏导数：$R_y = \partial R/\partial y$，依此类推。
:::

读作 “curl F”（或 “del cross F”）和 “div F”（或 “del dot F”）。旋度是模块 16 中的叉乘，运算符 $\nabla$ 排在行列式中间行：

$$\nabla\times\vb{F} = \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ \partial/\partial x & \partial/\partial y & \partial/\partial z \\ P & Q & R \end{vmatrix},$$

其中 “$\partial/\partial y$ times $R$” 表示 $\partial R/\partial y$。旋度是一个向量场；散度是一个标量场。平面上的场 $\langle P(x, y), Q(x, y)\rangle$ 被视为空间中的场 $\langle P, Q, 0\rangle$，然后

$$\begin{aligned} \operatorname{curl}\vb{F} &= \langle 0, 0, Q_x - P_y\rangle, \\ \operatorname{div}\vb{F} &= P_x + Q_y, \end{aligned}$$

Green 定理的两个被积函数。其两种形式如下

$$\begin{aligned} \oint_C \vb{F}\cdot\vb{T}\,ds &= \iint_D (\operatorname{curl}\vb{F})\cdot\vb{k}\,dA, \\ \oint_C \vb{F}\cdot\vb{n}\,ds &= \iint_D \operatorname{div}\vb{F}\,dA. \end{aligned}$$

```check
curl3 = lambda F_: Matrix([diff(F_[2], y) - diff(F_[1], z), diff(F_[0], z) - diff(F_[2], x), diff(F_[1], x) - diff(F_[0], y)])
div3 = lambda F_: diff(F_[0], x) + diff(F_[1], y) + diff(F_[2], z)
Pg_, Qg_, Rg_ = [Function(nm_)(x, y, z) for nm_ in ('P', 'Q', 'R')]
same(curl3(Matrix([Pg_, Qg_, Rg_])), Matrix([diff(Rg_, y) - diff(Qg_, z), diff(Pg_, z) - diff(Rg_, x), diff(Qg_, x) - diff(Pg_, y)]))
iv, jv, kv = Matrix([1, 0, 0]), Matrix([0, 1, 0]), Matrix([0, 0, 1])
detc = iv*(diff(Rg_, y) - diff(Qg_, z)) - jv*(diff(Rg_, x) - diff(Pg_, z)) + kv*(diff(Qg_, x) - diff(Pg_, y))   # the determinant, along its first row
same(detc, curl3(Matrix([Pg_, Qg_, Rg_])))
P2_, Q2_ = Function('P')(x, y), Function('Q')(x, y)
same(curl3(Matrix([P2_, Q2_, 0])), Matrix([0, 0, diff(Q2_, x) - diff(P2_, y)])); same(div3(Matrix([P2_, Q2_, 0])), diff(P2_, x) + diff(Q2_, y))
```

::: example 旋度与散度
(a) 求 $\vb{F} = \langle xy, yz, zx\rangle$ 的旋度和散度。 (b) 对于第 20.4 节演示中旋转场 $\langle -y, x\rangle$、源场 $\langle x, y\rangle$、汇场 $\langle -x, -y\rangle$、剪切场 $\langle y, 0\rangle$ 和常值场 $\langle 1, 0.5\rangle$，分别求 $Q_x - P_y$ 和 $P_x + Q_y$。

**(a)**  以 $P = xy$、$Q = yz$ 和 $R = zx$ 为条件：

$$\begin{aligned} \operatorname{curl}\vb{F} &= \langle 0 - y,\ 0 - z,\ 0 - x\rangle \\ &= \langle -y, -z, -x\rangle, \\ \operatorname{div}\vb{F} &= y + z + x. \end{aligned}$$

**(b)**  一次求一个导数：

| 场 | $Q_x - P_y$ | $P_x + Q_y$ |
|---|---|---|
| 旋转 $\langle -y, x\rangle$ | $1 - (-1) = 2$ | $0$ |
| 源 $\langle x, y\rangle$ | $0$ | $1 + 1 = 2$ |
| 汇 $\langle -x, -y\rangle$ | $0$ | $-2$ |
| 剪切 $\langle y, 0\rangle$ | $0 - 1 = -1$ | $0$ |
| 常值 $\langle 1, 0.5\rangle$ | $0$ | $0$ |

所以，对于半径为 $r$ 的每一个圆，Green 定理预测：对于旋转场，其环流量为 $2\pi r^2$，通量为 0；对于源场，环流量为 0，通量为 $2\pi r^2$；对于剪切场，环流量为 $-\pi r^2$，无论圆的位置如何。

```check
F210 = Matrix([x*y, y*z, z*x]); same(curl3(F210), Matrix([-y, -z, -x])); same(div3(F210), x + y + z)
fields210 = [Matrix([-y, x, 0]), Matrix([x, y, 0]), Matrix([-x, -y, 0]), Matrix([y, 0, 0]), Matrix([1, Rational(1, 2), 0])]
same([curl3(F_)[2] for F_ in fields210], [2, 0, 0, -1, 0]); same([div3(F_) for F_ in fields210], [0, 2, -2, 0, 0])
R210 = symbols('r_210', positive=True)
disc210 = lambda g_: integrate(g_*r, (r, 0, R210), (theta, 0, 2*pi))
same([disc210(curl3(F_)[2]) for F_ in fields210], [2*pi*R210**2, 0, 0, -pi*R210**2, 0])
same([disc210(div3(F_)) for F_ in fields210], [0, 2*pi*R210**2, -2*pi*R210**2, 0, 0])
```
:::

### 旋度和散度分别衡量什么 {#meaning}

**旋转。** 将一个微型桨轮放入流动的流体中。如果流体在桨轮轴的一侧对桨叶的推力大于另一侧，则桨轮会转动。格林定理对此进行了精确描述。假设 $\vb{F}$ 在 $P_0$ 附近具有连续的一阶偏导数。令 $C_r$ 为以 $P_0$ 为中心、半径为 $r > 0$ 的圆，按逆时针方向绕行，其内部区域为 $D_r$。则 $\oint_{C_r} \vb{F}\cdot d\vb{r} = \iint_{D_r} (Q_x - P_y)\,dA$。若 $Q_x - P_y$ 连续，则在足够小的圆盘内，它与在 $P_0$ 处的值之差小于你任意选择的数 $\varepsilon > 0$，因此二重积分与该值乘以 $\pi r^2$ 之差小于 $\varepsilon\pi r^2$。将结果除以面积并取极限 $r \to 0$：

$$(\operatorname{curl}\vb{F})(P_0)\cdot\vb{k} = \lim_{r\to0}\frac{1}{\pi r^2}\oint_{C_r} \vb{F}\cdot d\vb{r}.$$

旋度衡量单位面积的极限环流量。在空间中，当小环位于单位法向量为$\vb{n}$的平面内时，斯托克斯定理（第20.7节）给出了沿$\vb{n}$的分量。如果旋度非零，当$\vb{n}$沿旋度方向时，取得最大的代数值。这解释了微小轮子极限情况下的桨轮图像。对于刚体旋转，旋度是角速度的两倍：绕$z$轴以每秒$\omega$弧度旋转的轮子具有速度场$\vb{v} = \langle -\omega y, \omega x, 0\rangle$，且其旋度为$\operatorname{curl}\vb{v} = \langle 0, 0, \omega - (-\omega)\rangle = \langle 0, 0, 2\omega\rangle$。

**展开。** 同样地，格林定理的通量形式给出

$$(\operatorname{div}\vb{F})(P_0) = \lim_{r\to0}\frac{1}{\pi r^2}\oint_{C_r} \vb{F}\cdot\vb{n}\,ds.$$

因此，散度是流动将流体带出小区域的速率，按单位面积计算（在空间中按单位体积计算，依据第20.7节的散度定理）。在$\operatorname{div}\vb{F} > 0$处，流体向外扩散，如同从源点发出；在散度为负处，流体向内聚集，如同汇入汇点。一个没有源或汇的不可压缩流动满足$\operatorname{div}\vb{F} = 0$：流入某区域的流体量等于流出该区域的流体量。

```check
wv = symbols('omega', positive=True)
same(curl3(Matrix([-wv*y, wv*x, 0])), Matrix([0, 0, 2*wv]))
# circulation per unit area for <-y^3/3, x^3/3>, whose Q_x - P_y = x^2 + y^2, round circles about (1, 0)
Fq = Matrix([-y**3/3, x**3/3]); rho_ = symbols('rho', positive=True)
circq = lint(Fq, [1 + rho_*cos(t), rho_*sin(t)], 0, 2*pi)
same(circq/(pi*rho_**2), 1 + rho_**2/2); limit_is(circq/(pi*rho_**2), rho_, 0, 1, dir='+'); same(curl3(Matrix([Fq[0], Fq[1], 0]))[2].subs({x: 1, y: 0}), 1)
```

::: pitfall
一个矢量场可以不包含环绕的箭头，而环绕的箭头也不一定意味着旋转。剪切场 $\langle y, 0\rangle$ 有平行箭头，然而 $\operatorname{curl}\vb{F} = \langle 0, 0, -1\rangle$：在 $x$ 轴上方，流体向右运动，越往上速度越快，因此一个桨轮在其顶部受到的推力比底部更大，从而顺时针旋转。例 20.6 中矢量场的箭头环绕原点，但其旋度 $\vb{0}$ 在定义域内处处为零：远离原点的点处单位面积的循环量极限为零。

```check
same(curl3(Matrix([y, 0, 0])), Matrix([0, 0, -1])); same(curl3(Matrix([P206, Q206, 0])).applyfunc(simplify), zeros(3, 1))
```
:::

### 两个恒等式 {#identities}

::: theorem 两个恒等式
如果 $f$ 具有连续的二阶偏导数，则 $\operatorname{curl}(\nabla f) = \vb{0}$。如果 $\vb{F}$ 的分量具有连续的二阶偏导数，则 $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$。
:::

::: proof
对于 $\nabla f = \langle f_x, f_y, f_z\rangle$，

$$\begin{aligned} &\operatorname{curl}(\nabla f) \\ &\quad= \big\langle f_{zy} - f_{yz},\ f_{xz} - f_{zx},\ f_{yx} - f_{xy}\big\rangle, \end{aligned}$$

且每个分量由克莱因定理为零。同样地，

$$\begin{aligned} &\operatorname{div}(\operatorname{curl}\vb{F}) \\ &\quad= (R_y - Q_z)_x + (P_z - R_x)_y \\ &\qquad + (Q_x - P_y)_z \\ &\quad= R_{yx} - Q_{zx} + P_{zy} \\ &\qquad - R_{xy} + Q_{xz} - P_{yz}, \end{aligned}$$

六个项由克莱因定理再次相互抵消。
:::

```check
fg_ = Function('f')(x, y, z)
same(curl3(grad3(fg_)), zeros(3, 1)); same(div3(curl3(Matrix([Pg_, Qg_, Rg_]))), 0)
```

对于具有连续一阶偏导数的场 $\vb{F}$，非零旋度通过第一个恒等式排除了势函数的存在。反之，如果在空间的一个开且 **单连通**区域上 $\operatorname{curl}\vb{F} = \vb{0}$，则 $\vb{F}$ 是保守场。这里单连通意味着连通且每条闭曲线都可以在该区域内连续收缩为一点。例如，一个球体和去掉一个点的空间是单连通的。绕着被去掉的直线的环无法在不穿过该直线的情况下收缩为一点。第 20.7 节给出了逆命题背后的思想。

根据第二个恒等式，一个具有非零散度的场，如 $\langle x, y, z\rangle$，不能是具有连续二阶偏导数的场的旋度。

::: compute Curl 和 divergence 的 SymPy 实现
SymPy 的 `sympy.vector` 模块知道本节中的运算符。它在一个坐标系中工作，此处称为 `N`，其坐标为 `N.x`, `N.y`, `N.z`，单位矢量为 `N.i`, `N.j`, `N.k`：

```python
import sympy as sp
from sympy.vector import CoordSys3D, curl, divergence, gradient
N = CoordSys3D('N')
x, y, z = N.x, N.y, N.z
F = x*y*N.i + y*z*N.j + z*x*N.k          # Example 20.10
print(curl(F))
print(divergence(F))
print(divergence(curl(F)))
```

```output
(-N.y)*N.i + (-N.z)*N.j + (-N.x)*N.k
N.x + N.y + N.z
0
```

例20.10 的答案，用 SymPy 的单位矢量写出，并应用恒等式 $\operatorname{div}\operatorname{curl}\vb{F} = 0$。另一个恒等式，以及一个势函数：

```python
f = x**2*y*sp.sin(z)
print(gradient(f))
print(curl(gradient(f)))
from sympy.vector import is_conservative, scalar_potential
G = 2*x*y*N.i + (x**2 + 2*y*z)*N.j + y**2*N.k
print(is_conservative(G), scalar_potential(G, N))
```

```output
(2*N.x*N.y*sin(N.z))*N.i + (N.x**2*sin(N.z))*N.j + (N.x**2*N.y*cos(N.z))*N.k
0
True N.x**2*N.y + N.y**2*N.z
```

`is_conservative` 只检查旋度是否为 $\vb{0}$；`scalar_potential` 用例 20.7 的方法通过积分找势函数。这两个命令都不会检查定义区域：

```python
V = -y/(x**2 + y**2)*N.i + x/(x**2 + y**2)*N.j      # Example 20.6
print(is_conservative(V))
```

```output
True
```

SymPy 的判断是肯定的，但例 20.6 已表明，这个向量场在挖去原点的平面上并非保守场。需要自己检验「单连通」这一条件。
:::

```check
from sympy.vector import CoordSys3D as CS3_, curl as vcurl_, divergence as vdiv_, gradient as vgrad_
Nv = CS3_('Nv'); sv_ = {x: Nv.x, y: Nv.y, z: Nv.z}
Fv_ = F210[0].subs(sv_)*Nv.i + F210[1].subs(sv_)*Nv.j + F210[2].subs(sv_)*Nv.k
same(vcurl_(Fv_).to_matrix(Nv), curl3(F210).subs(sv_)); same(vdiv_(Fv_), div3(F210).subs(sv_))
same(grad3(x**2*y + y**2*z), Matrix([2*x*y, x**2 + 2*y*z, y**2])); same(curl3(Matrix([2*x*y, x**2 + 2*y*z, y**2])), zeros(3, 1))
```

## 曲面和曲面积分 {#surfaces}

### 参数曲面 {#parametric-surfaces}

一条空间曲线是由一个点随一个参数变化而描绘的，$\vb{r}(t)$。一个曲面是由一个点随两个参数变化而描绘的。

::: definition 参数曲面
**参数曲面** $S$ 由下列点组成：

$$\vb{r}(u, v) = \big\langle x(u, v), y(u, v), z(u, v)\big\rangle$$

其中 $(u, v)$ 取遍 $uv$ 平面内的区域 $D$。函数 $\vb{r}$ 是 $S$ 的一个**参数化**。
:::

三个例子反复出现。半径 $a$ 和圆柱高度 $h$ 均为正数：

- 以原点为球心、半径为 $a$ 的球面，取模块 19 中满足 $\rho = a$ 的球坐标：$\vb{r}(\varphi, \theta) = \langle a\sin\varphi\cos\theta, a\sin\varphi\sin\theta, a\cos\varphi\rangle$、$0 \le \varphi \le \pi$、$0 \le \theta \le 2\pi$；
- 圆柱 $x^2 + y^2 = a^2$, $0 \le z \le h$: $\vb{r}(\theta, z) = \langle a\cos\theta, a\sin\theta, z\rangle$, $0 \le \theta \le 2\pi$, $0 \le z \le h$;
- 函数 $z = g(x, y)$ 在区域 $D$ 上的图像: $\vb{r}(x, y) = \langle x, y, g(x, y)\rangle$，其中 $x$ 和 $y$ 本身作为参数。

保持 $v$ 固定，让 $u$ 变化在 $S$ 上描绘出一条曲线，即 **网格曲线**，其切向量为偏导数 $\vb{r}_u = \partial\vb{r}/\partial u$（对每个分量求导）；保持 $u$ 固定则得到另一条网格曲线，其切向量为 $\vb{r}_v$。当这些向量线性无关时，它们张成 $S$ 的切平面。它们的叉乘

$$\vb{N} = \vb{r}_u\times\vb{r}_v$$

与 $S$ 垂直：一个 **法向量**（图 20.4）。这里我们使用 **光滑曲面片**，其在 $D$ 和 $\vb{r}_u\times\vb{r}_v \ne \vb{0}$ 的邻域内具有连续可微的参数化。每个曲面片在其内部被遍历一次，除了可能在边缘处有重复。一个 **分片光滑曲面** 由有限多个这样的曲面片组成，这些曲面片仅在边或点处相交。

::: example 球面和图像的法向量
求 $\vb{r}_u\times\vb{r}_v$ (a) 球体半径 $a$ 的，以及 (b) 图形 $z = g(x, y)$ 的。

**(a)** 此处 $\vb{r}_\varphi = \langle a\cos\varphi\cos\theta, a\cos\varphi\sin\theta, -a\sin\varphi\rangle$ 和 $\vb{r}_\theta = \langle -a\sin\varphi\sin\theta, a\sin\varphi\cos\theta, 0\rangle$。叉乘简化为 $\cos^2\theta + \sin^2\theta = 1$，为

$$\begin{aligned} &\vb{r}_\varphi\times\vb{r}_\theta \\ &\quad= \big\langle a^2\sin^2\varphi\cos\theta, a^2\sin^2\varphi\sin\theta, \\ &\qquad\ a^2\sin\varphi\cos\varphi\big\rangle \\ &\quad= a\sin\varphi\;\vb{r}(\varphi, \theta). \end{aligned}$$

对于 $0 < \varphi < \pi$，这是 $\vb{r}$ 的正倍数，因此指向外侧。在极点处为零，因为经度网格曲线在此处坍缩。其长度为 $a\sin\varphi \cdot a = a^2\sin\varphi$。

**(b)** 此处 $\vb{r}_x = \langle 1, 0, g_x\rangle$ 和 $\vb{r}_y = \langle 0, 1, g_y\rangle$，因此 $\vb{r}_x\times\vb{r}_y = \langle -g_x, -g_y, 1\rangle$。它指向上方（其 $z$ 分量为 1），其长度为 $\sqrt{1 + g_x^2 + g_y^2}$。

```check
aS = symbols('a', positive=True); phs, ths = symbols('phi theta', real=True)
Sph = lambda A_: Matrix([A_*sin(phs)*cos(ths), A_*sin(phs)*sin(ths), A_*cos(phs)])
Sa = Sph(aS)
same(Sa.diff(phs), Matrix([aS*cos(phs)*cos(ths), aS*cos(phs)*sin(ths), -aS*sin(phs)])); same(Sa.diff(ths), Matrix([-aS*sin(phs)*sin(ths), aS*sin(phs)*cos(ths), 0]))
NSa = Sa.diff(phs).cross(Sa.diff(ths))
same(NSa, Matrix([aS**2*sin(phs)**2*cos(ths), aS**2*sin(phs)**2*sin(ths), aS**2*sin(phs)*cos(phs)])); same(NSa, aS*sin(phs)*Sa)
same(NSa.dot(NSa), (aS**2*sin(phs))**2)
same(NSa.subs(phs, 0), zeros(3, 1)); same(NSa.subs(phs, pi), zeros(3, 1))
gS = Function('g')(x, y); Gr = Matrix([x, y, gS])
same(Gr.diff(x).cross(Gr.diff(y)), Matrix([-diff(gS, x), -diff(gS, y), 1]))
```
:::

::: figure id=fig-20-4
参数曲面：例 20.11 中的球体。在 $\varphi\theta$ 平面上，边长为 $\Delta\varphi$ 和 $\Delta\theta$ 的小矩形（左）通过 $\vb{r}$ 映射到球面上的小区域（右，橙色），接近由 $\vb{r}_\varphi\Delta\varphi$ 和 $\vb{r}_\theta\Delta\theta$ 张成的平行四边形。法向量 $\vb{N} = \vb{r}_\varphi\times\vb{r}_\theta$ 垂直于球面，且 $\norm{\vb{N}}\,\Delta\varphi\,\Delta\theta$ 接近该区域的面积。
:::

### 表面积 {#surface-area}

将 $D$ 切分成边长为 $\Delta u$ 和 $\Delta v$ 的小矩形。以角点 $(u, v)$ 为顶点的小矩形被映射到 $S$ 的一个小曲面片，该曲面片的角点在 $\vb{r}(u, v)$。由于 $\vb{r}(u + \Delta u, v) - \vb{r}(u, v) \approx \vb{r}_u\,\Delta u$ 和 $\vb{r}(u, v + \Delta v) - \vb{r}(u, v) \approx \vb{r}_v\,\Delta v$，该曲面片接近由 $\vb{r}_u\,\Delta u$ 和 $\vb{r}_v\,\Delta v$ 张成的平行四边形，其面积为 $\norm{\vb{r}_u\times\vb{r}_v}\,\Delta u\,\Delta v$（模块 16）。对所有曲面片求和：

::: definition 表面积
若 $S$ 被一个光滑参数化 $\vb{r}(u, v)$ 在有界区域 $D$ 上沿分段光滑边界追踪一次，则其 **表面积** 为

$$A(S) = \iint_D \norm{\vb{r}_u\times\vb{r}_v}\,dA.$$
:::

“被追踪一次”允许在 $D$ 的边界上重复：球面的参数化使点 $\theta = 0$ 和 $\theta = 2\pi$ 被重复两次，每个极点对应 $D$ 的整个边界，但这些重复部分的表面积为零。对于分段光滑曲面，将各曲面片的面积相加。对于光滑曲面 $z = g(x, y)$，根据例 20.11(b)，

$$A(S) = \iint_D \sqrt{1 + g_x^2 + g_y^2}\,dA.$$

::: example 两个曲面面积
(a) 求半径为 $a$ 的球体的表面积。 (b) 求穹顶 $z = 1 - x^2 - y^2$， $z \ge 0$ 的表面积。

**(a)** 例20.11， $\norm{\vb{r}_\varphi\times\vb{r}_\theta} = a^2\sin\varphi$，因此

$$\begin{aligned} A &= \int_0^{2\pi}\!\!\int_0^\pi a^2\sin\varphi\,d\varphi\,d\theta \\ &= 2\pi a^2\big[-\cos\varphi\big]_0^\pi = 4\pi a^2, \end{aligned}$$

这个熟悉的公式，模块12也从旋转曲面推导得出。

**(b)** 这个穹顶是函数 $g(x, y) = 1 - x^2 - y^2$ 在单位圆盘 $D$（其中 $z \ge 0$）上的图像。用 $g_x = -2x$ 和 $g_y = -2y$，在极坐标下，

$$\begin{aligned} A &= \iint_D \sqrt{1 + 4x^2 + 4y^2}\,dA \\ &= \int_0^{2\pi}\!\!\int_0^1 \sqrt{1 + 4r^2}\,r\,dr\,d\theta. \end{aligned}$$

代入 $w = 1 + 4r^2$， $dw = 8r\,dr$： $\int_0^1 \sqrt{1 + 4r^2}\,r\,dr = \frac18\int_1^5 \sqrt w\,dw = \frac{1}{12}\big(5\sqrt5 - 1\big)$。因此

$$A = \frac{\pi}{6}\big(5\sqrt5 - 1\big) \approx 5.330,$$

与 $\pi \approx 3.142$ 对应于穹顶下的平坦圆盘进行比较。

```check
same(sqrt(NSa.dot(NSa)), aS**2*Abs(sin(phs))); holds(minimum(sin(x), x, Interval(0, pi)) >= 0)    # sin(phi) >= 0 for 0 <= phi <= pi
antideriv(-cos(phs), sin(phs), phs)
steps(Integral(aS**2*sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), 2*pi*aS**2*(-cos(pi) + cos(0)), 4*pi*aS**2)
gd = 1 - x**2 - y**2
same(diff(gd, x), -2*x); same(diff(gd, y), -2*y)
same(1 + diff(gd, x)**2 + diff(gd, y)**2, 1 + 4*x**2 + 4*y**2)
wq = symbols('w', positive=True)
steps(Integral(sqrt(1 + 4*r**2)*r, (r, 0, 1)), Integral(sqrt(wq), (wq, 1, 5))/8, (5*sqrt(5) - 1)/12)
Adome = integrate(sqrt(1 + 4*r**2)*r, (r, 0, 1), (theta, 0, 2*pi))
same(Adome, pi*(5*sqrt(5) - 1)/6); rounds(Adome, '5.330'); rounds(pi, '3.142')
```
:::

### 曲面积分 {#surface-integrals}

想象一个薄壳，其密度在其表面上各处不同。将其质量近似为将其分成若干小块，每个小块的面积乘以其某一点的密度。极限使用与之前相同的面积因子，并额外乘以密度因子。

::: definition 函数的曲面积分
设 $S$ 被光滑参数化 $\vb{r}(u, v)$ 一次， $(u, v)$ 在 $D$ 上，且 $f$ 在 $S$ 上连续。函数 $f$ 在 $S$ 上的 **曲面积分** 为

$$\begin{aligned} &\iint_S f\,dS \\ &\quad= \iint_D f\big(\vb{r}(u, v)\big)\,\norm{\vb{r}_u\times\vb{r}_v}\,dA. \end{aligned}$$
:::

当 $\int_C f\,ds$ 沿着 $f$ 个短长度累加时， $\iint_S f\,dS$ 沿着 $f$ 个微小面积 $dS = \norm{\vb{r}_u\times\vb{r}_v}\,dA$ 累加。用 $f = 1$ 表示的是 $S$ 的面积；用密度表示时，它给出薄壳的质量。如果面积为正，除以面积可得 $f$ 的平均值。对于由多个部分组成的曲面，将它们的积分相加。参数的光滑变化将叉乘乘以它的符号雅可比行列式，根据链式法则。长度取绝对值，正好是模块 19 中变量替换公式中的因子。这使得积分与光滑参数的选择无关。

::: example 薄壳的质心
求一个均匀正密度的薄壳的质心高度，该薄壳的形状为半球 $x^2 + y^2 + z^2 = a^2$， $z \ge 0$，其中 $a > 0$。

由对称性 $\bar x = \bar y = 0$。对于常密度， $\bar z$ 是 $z$ 在壳上的平均值， $\bar z = \frac{1}{A}\iint_S z\,dS$，其中 $A = 2\pi a^2$ 是球体表面积的一半。使用球体的参数化和 $0 \le \varphi \le \pi/2$，

$$\begin{aligned} &\iint_S z\,dS \\ &\quad= \int_0^{2\pi}\!\!\int_0^{\pi/2} (a\cos\varphi)(a^2\sin\varphi)\,d\varphi\,d\theta \\ &\quad= 2\pi a^3\Big[\tfrac12\sin^2\varphi\Big]_0^{\pi/2} = \pi a^3. \end{aligned}$$

所以 $\bar z = \pi a^3/(2\pi a^2) = a/2$：质心恰好位于正中间。对于一个均匀实心半球体，水平切片的面积为 $\pi(a^2-z^2)$，随着高度增加而减小。其质心位于较低的位置，即 $\dfrac{\int_0^a z(a^2-z^2)\,dz}{\int_0^a (a^2-z^2)\,dz} = 3a/8$。

```check
same(Sa[2], aS*cos(phs))
antideriv(sin(phs)**2/2, cos(phs)*sin(phs), phs)
steps(Integral(aS*cos(phs)*aS**2*sin(phs), (phs, 0, pi/2), (ths, 0, 2*pi)), 2*pi*aS**3*(sin(pi/2)**2/2 - 0), pi*aS**3)
same(integrate(aS**2*sin(phs), (phs, 0, pi/2), (ths, 0, 2*pi)), 2*pi*aS**2); same(pi*aS**3/(2*pi*aS**2), aS/2)
rs_ = symbols('rho_s', positive=True)
slice_area = pi*(aS**2 - z**2)
same(integrate(slice_area, (z, 0, aS)), 2*pi*aS**3/3)
same(integrate(z*slice_area, (z, 0, aS)), pi*aS**4/4)
same(integrate(z*slice_area, (z, 0, aS))/integrate(slice_area, (z, 0, aS)), 3*aS/8)
```
:::

### 方向与通量 {#flux}

一个球体，或一个穹顶，有两个面。为了 **确定**一个光滑曲面的方向，选择一个单位法向量 $\vb{n}$，它连续变化并指向所选的面。对于分段光滑曲面，相邻区域的选择必须指向同一侧，尽管在折痕处法向量可能不同。一个**封闭**曲面，如球面或立方体表面，没有边缘。当它包围一个实体时，**向外** 方向指向该实体的外部。在常规区域上， $\vb{n} = (\vb{r}_u\times\vb{r}_v)/\norm{\vb{r}_u\times\vb{r}_v}$ 选择一侧， $-\vb{n}$ 选择另一侧。并非所有曲面都有两个面：一个莫比乌斯带，即一条纸条在连接前旋转半圈后形成，只有一个面，无法确定方向。

现在考虑一个速度为 $\vb{F}$ 的流体通过 $S$，如同水流过一张网。通过一个面积小且近似为平面的区域 $\Delta S$，其单位法向量为 $\vb{n}$，在短时间内 $\Delta t$ 内穿过该区域的流体充满一个斜棱柱，其底面为 $\Delta S$，高度为 $\abs{\vb{F}\cdot\vb{n}}\,\Delta t$。穿过该区域的有符号流量为 $(\vb{F}\cdot\vb{n})\,\Delta S$，单位为体积每单位时间。负号表示流体流向与所选法向量相反。切向部分不穿过该区域。将各区域的流量相加：

::: definition 通量
设 $S$ 是单位法向量为 $\vb{n}$ 的定向曲面，$\vb{F}$ 是在 $S$ 上连续的向量场。$\vb{F}$ 穿过 $S$ 的**通量**为

$$\iint_S \vb{F}\cdot d\vb{S} = \iint_S \vb{F}\cdot\vb{n}\,dS.$$
:::

要计算该流量，沿着 $\vb{r}(u, v)$ 方向追踪 $S$，在 $D$ 上追踪 $(u, v)$，且 $\vb{r}_u\times\vb{r}_v$ 指向 $\vb{n}$ 所选择的一侧。此时长度相互抵消，

$$\begin{aligned} \vb{n}\,dS &= \frac{\vb{r}_u\times\vb{r}_v}{\norm{\vb{r}_u\times\vb{r}_v}}\,\norm{\vb{r}_u\times\vb{r}_v}\,dA \\ &= \big(\vb{r}_u\times\vb{r}_v\big)\,dA, \end{aligned}$$

因此

$$\iint_S \vb{F}\cdot d\vb{S} = \iint_D \vb{F}\big(\vb{r}(u, v)\big)\cdot\big(\vb{r}_u\times\vb{r}_v\big)\,dA.$$

如果 $\vb{r}_u\times\vb{r}_v$ 指向另一侧，则流量为上述值的负数。相同的定义可给出电通量、磁通量以及热量通过曲面的通量。

::: example 球体外的通量
求 $\vb{F}(x, y, z) = \langle x, y, z\rangle$ 通过以原点为中心、半径为 $a$ 的球面的向外通量。

根据例 20.11， $\vb{r}_\varphi\times\vb{r}_\theta = a\sin\varphi\,\vb{r}(\varphi, \theta)$ 指向两极之外，且 $\vb{F}\big(\vb{r}(\varphi, \theta)\big) = \vb{r}(\varphi, \theta)$ 的长度为 $a$。因此 $\vb{F}\cdot(\vb{r}_\varphi\times\vb{r}_\theta) = a\sin\varphi\,\norm{\vb{r}}^2 = a^3\sin\varphi$，

$$\begin{aligned} \iint_S \vb{F}\cdot d\vb{S} &= \int_0^{2\pi}\!\!\int_0^\pi a^3\sin\varphi\,d\varphi\,d\theta \\ &= 4\pi a^3. \end{aligned}$$

不使用参数化的方法：在球面 $\vb{n} = \vb{r}/a$ 上，因此 $\vb{F}\cdot\vb{n} = \norm{\vb{r}}^2/a = a$ 处处成立，通量为 $a$ 乘以面积，即 $a\cdot 4\pi a^2 = 4\pi a^3$。

```check
same(Sa.dot(Sa/aS), aS); same(aS*(4*pi*aS**2), 4*pi*aS**3)
same(Sa.dot(NSa), aS**3*sin(phs)); same(integrate(aS**3*sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), 4*pi*aS**3)
same(Sa.dot(Sa/aS), aS); same(aS*4*pi*aS**2, 4*pi*aS**3)
```
:::

::: pitfall
两个错误涉及曲面。 **(1)**忘记 $\norm{\vb{r}_u\times\vb{r}_v}$ 在 $\iint_S f\,dS$ 中：它是将 $du\,dv$ 转换为面积的因素，正如 $\norm{\vb{r}'(t)}$ 将 $dt$ 转换为长度。**(2)** 在通量积分中，使用向量 $\vb{r}_u\times\vb{r}_v$ 所属的长度 $\norm{\vb{r}_u\times\vb{r}_v}$，或未检查其指向：当 $\vb{r}_\theta\times\vb{r}_\varphi = -\vb{r}_\varphi\times\vb{r}_\theta$ 是球面的法向量时，它指向内部，而例 20.14 的通量结果为 $-4\pi a^3$。当方向反转时，通量符号改变，正如 $\int_C \vb{F}\cdot d\vb{r}$ 在 $C$ 反转时改变符号，而 $\iint_S f\,dS$，像 $\int_C f\,ds$ 一样，不改变符号。

```check
same(Sa.dot(Sa.diff(ths).cross(Sa.diff(phs))), -aS**3*sin(phs)); same(integrate(-aS**3*sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), -4*pi*aS**3)
```
:::

## 斯托克斯定理和散度定理 {#stokes-divergence}

### 斯托克斯定理 {#stokes}

格林定理将平面上闭曲线的环流量与该曲线所包围区域内旋度的积分联系起来。在空间中，同一个闭合曲线可以是平面上一个平面圆盘的边界，也可以是曲面穹顶的边界。当两个曲面具有相容的方向，并且场在每个曲面邻域内都是光滑的，斯托克斯定理说明闭合曲线的环流量等于旋度通过任一曲面的通量。

曲面$S$的边界曲线$C$是**正定向**的，条件是：当你沿$C$行走且头部指向$\vb{n}$方向时，曲面位于你的左侧。对于平面圆盘，将右手手指沿$C$方向卷曲，拇指指向$\vb{n}$方向（**右手法则**；图20.5，左侧）。

::: theorem 斯托克斯定理
设 $S$ 为定向的分片光滑曲面，其边界 $C$ 是取正向的分片光滑简单闭合曲线。若 $\vb{F}$ 的各分量在空间中包含 $S$ 的某个开区域上具有连续的一阶偏导数，则

$$\oint_C \vb{F}\cdot d\vb{r} = \iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}.$$
:::

若 $S$ 是 $xy$ 平面上的平面区域，且取向朝上，则 $\vb{n} = \vb{k}$、$\operatorname{curl}\vb{F}\cdot\vb{k} = Q_x - P_y$。此时，斯托克斯定理化为格林定理的环量形式。更一般地，边界积分是按各边界曲线的诱导定向计算的贡献之和。特别地，闭合曲面的边界积分为零。这些推广基于相邻曲面片的切边贡献相互抵消。

**证明思路。** 把 $S$ 切分成许多近似平坦的小曲面片。沿每一片边界的环量约为 $(\operatorname{curl}\vb{F}\cdot\vb{n})\,\Delta S$。这是第 20.4 节的小正方形近似，用在该曲面片的平面内，并以其法向量 $\vb{n}$ 代替 $\vb{k}$。对各片求和。两片共有的边会沿相反方向各走一次，贡献互相抵消，最终留下沿 $C$ 的环量。同时各项 $(\operatorname{curl}\vb{F}\cdot\vb{n})\,\Delta S$ 相加约为 $\iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}$。若曲面是一张函数图像，可以用链式法则经较长的计算将斯托克斯定理归结为格林定理。一般情形的证明超出本教程范围。

::: example 斯托克斯定理在穹顶上的应用
设 $\vb{F} = \langle z, x, y\rangle$，并设 $S$ 是上半球面 $z = 1 - x^2 - y^2$，$z \ge 0$，朝上定向。通过计算两边来验证斯托克斯定理。

**曲线积分。** 网球的边缘是 $xy$ 平面上的单位圆。对于图向上定向的情况，区域投影在逆时针绕行边缘的左侧，因此正方向是从上方逆时针观察：$\vb{r}(t) = \langle\cos t, \sin t, 0\rangle$，$0 \le t \le 2\pi$。然后 $\vb{F}\big(\vb{r}(t)\big) = \langle 0, \cos t, \sin t\rangle$ 和 $\vb{r}'(t) = \langle -\sin t, \cos t, 0\rangle$，所以

$$\oint_C \vb{F}\cdot d\vb{r} = \int_0^{2\pi} \cos^2 t\,dt = \pi.$$

**曲面积分。** 代入 $P = z$、$Q = x$ 和 $R = y$，得

$$\begin{aligned} \operatorname{curl}\vb{F} &= \langle 1 - 0,\ 1 - 0,\ 1 - 0\rangle \\ &= \langle 1, 1, 1\rangle. \end{aligned}$$

根据例 20.11(b) 与 $g = 1 - x^2 - y^2$，向上的法向量为 $\langle -g_x, -g_y, 1\rangle = \langle 2x, 2y, 1\rangle$，因此

$$\iint_S \operatorname{curl}\vb{F}\cdot d\vb{S} = \iint_D (2x + 2y + 1)\,dA$$

在单位圆盘 $D$ 上。 由于对称性，$2x$ 和 $2y$ 的积分均为 0，剩下的是 $D$ 的面积：$\pi$。 两边均为 $\pi$。

平面单位圆盘，朝上定向，具有相同的边界，在其上 $\operatorname{curl}\vb{F}\cdot\vb{k} = 1$，因此其通量也是 $\pi$。这并非偶然：根据斯托克斯定理，通过两个具有相同定向边界的曲面的 $\operatorname{curl}\vb{F}$ 的通量是相同的，只要该场在两个曲面上都满足相应的假设条件。

```check
F215 = Matrix([z, x, y]); rc215 = Matrix([cos(t), sin(t), 0])
same(F215.subs({x: cos(t), y: sin(t), z: 0}, simultaneous=True), Matrix([0, cos(t), sin(t)])); same(rc215.diff(t), Matrix([-sin(t), cos(t), 0]))
same(Matrix([0, cos(t), sin(t)]).dot(rc215.diff(t)), cos(t)**2); same(integrate(cos(t)**2, (t, 0, 2*pi)), pi); same(lint(F215, rc215, 0, 2*pi), pi)
same(curl3(F215), Matrix([1, 1, 1]))
same(Matrix([-diff(gd, x), -diff(gd, y), 1]), Matrix([2*x, 2*y, 1])); same(curl3(F215).dot(Matrix([2*x, 2*y, 1])), 2*x + 2*y + 1)
pol = {x: r*cos(theta), y: r*sin(theta)}
same(integrate((2*x + 2*y).subs(pol)*r, (r, 0, 1), (theta, 0, 2*pi)), 0); same(integrate((2*x + 2*y + 1).subs(pol)*r, (r, 0, 1), (theta, 0, 2*pi)), pi)
same(curl3(F215).dot(Matrix([0, 0, 1])), 1)
```
:::

::: figure id=fig-20-5
左：例20.15中穹顶的斯托克斯定理。法向量指向上方，边界圆从上方观察是逆时针方向：沿着边界行走时，头朝向法向量方向，穹顶在左侧。右：例20.16中实心圆柱体的散度定理。边界由三部分组成，顶部、底部和侧面，每个部分上的法向量都指向外部。
:::

**为什么空间中的测试有效。** 假设 $\vb{F}$ 在一个开的、单连通区域内具有连续的一阶偏导数且旋度为零。如果一个闭合曲线在该区域内包围一个定向曲面，则斯托克斯定理给出零环流量。对于一般情况，将闭合曲线收缩为一个点，得到一个从圆盘到该区域的连续映射。该图像可以自身重叠。用小三角形近似该映射，将邻近图像点用直线段连接。由于图像为紧集，而区域为开集，因此细度保证这些三角形仍位于区域内。斯托克斯定理给出每个三角形的零环流量。即使三角形在空间中重叠，共享的边也会相互抵消，剩余的边界线段会趋近于原始闭合曲线，如第20.4节所述。因此每个分段光滑的闭合曲线都有零环流量，这由定理20.3给出一个势函数。

### 散度定理 {#divergence-theorem}

格林定理的通量形式将平面区域的通量与内部的散度联系起来。以下是其在空间中的版本。

::: theorem 散度定理
设 $E$ 为含边界 $S$ 的有界立体区域，其中 $S$ 是外向定向的分片光滑闭曲面。若 $\vb{F}$ 的各分量在包含 $E$ 的开区域内具有连续的一阶偏导数，则

$$\iint_S \vb{F}\cdot d\vb{S} = \iiint_E \operatorname{div}\vb{F}\,dV.$$
:::

散度定理也称高斯定理。流体穿过边界向外流出的净速率，等于内部各处流体生成或膨胀速率的总和。

::: proof 关于盒子的散度定理
设 $E$ 为长方体 $a_1 \le x \le b_1$、$a_2 \le y \le b_2$、$a_3 \le z \le b_3$，并写出 $\vb{F} = \langle P, 0, 0\rangle + \langle 0, Q, 0\rangle + \langle 0, 0, R\rangle$。定理的两边分别是这三个向量场相应项的和，因此只需考虑 $\langle 0, 0, R\rangle$。在长方体的四个侧面上，$\vb{n}$ 为水平向量，且 $\langle 0, 0, R\rangle\cdot\vb{n} = 0$。顶面有 $\vb{n} = \vb{k}$，底面有 $\vb{n} = -\vb{k}$。以矩形 $a_1 \le x \le b_1$、$a_2 \le y \le b_2$ 为 $Z$，

$$\begin{aligned} &\iint_S \langle 0, 0, R\rangle\cdot d\vb{S} \\ &\quad= \iint_Z \big[R(x, y, b_3) - R(x, y, a_3)\big]\,dA \\ &\quad= \iint_Z \int_{a_3}^{b_3} \frac{\partial R}{\partial z}\,dz\,dA \\ &\quad= \iiint_E \frac{\partial R}{\partial z}\,dV, \end{aligned}$$

由基本定理第二部分在 $z$ 和 Fubini 定理推出。同样地， $\langle P, 0, 0\rangle$ 的通量为 $\iiint_E P_x\,dV$， $\langle 0, Q, 0\rangle$ 的通量为 $\iiint_E Q_y\,dV$。将这三项相加即得定理。
:::

```check
Rf_ = Function('R'); a1_, b1_, a2_, b2_, a3_, b3_ = symbols('a_1 b_1 a_2 b_2 a_3 b_3')
same(integrate(diff(Rf_(x, y, z), z), (z, a3_, b3_)), Rf_(x, y, b3_) - Rf_(x, y, a3_))
Fb = Matrix([x**2*y, y*z**2, x*z**3]); faces = 0
for i_, (lo_, hi_) in enumerate(((0, 1), (0, 2), (0, 3))):           # the box [0, 1] x [0, 2] x [0, 3], face by face
    others = [(w_, l_, h_) for j_, (w_, l_, h_) in enumerate(zip((x, y, z), (0, 0, 0), (1, 2, 3))) if j_ != i_]
    w_i = (x, y, z)[i_]
    faces += integrate(Fb[i_].subs(w_i, hi_) - Fb[i_].subs(w_i, lo_), *others)
same(faces, integrate(div3(Fb), (x, 0, 1), (y, 0, 2), (z, 0, 3)))
```

由盒子组成的实心物体（内部互不相交）可通过如下方式得出：在两个盒子共有的面上，它们的外法向量指向相反方向，因此通过该面的通量相互抵消。对于更一般的物体，需要更精细的论证，超出该系列内容。该定理也适用于有空腔的物体，例如厚壳球体，当其所有边界部分均朝向 $E$ 方向定向：外表面向外，空腔表面则朝向空腔内部。

::: example 柱体上的散度定理
设 $\vb{F} = \langle x, y, z^2\rangle$，令 $E$ 为柱体 $x^2 + y^2 \le 1$， $0 \le z \le 2$。通过计算两边来验证散度定理。

**体积积分。** $\operatorname{div}\vb{F} = 1 + 1 + 2z = 2 + 2z$。柱体的每一水平截面是一个面积为 $\pi$ 的圆盘，在该圆盘上 $2 + 2z$ 是常数，因此

$$\begin{aligned} \iiint_E (2 + 2z)\,dV &= \int_0^2 (2 + 2z)\,\pi\,dz \\ &= \pi\big[2z + z^2\big]_0^2 = 8\pi. \end{aligned}$$

**通量.** 边界由三个光滑部分组成. 在顶部 ($z = 2$, $\vb{n} = \vb{k}$), $\vb{F}\cdot\vb{n} = z^2 = 4$, 因此通量为 $4\times\pi = 4\pi$. 在底部 ($z = 0$, $\vb{n} = -\vb{k}$), $\vb{F}\cdot\vb{n} = -z^2 = 0$: 通量 0. 在侧面, 其中 $x^2 + y^2 = 1$, 向外单位法向量为 $\vb{n} = \langle x, y, 0\rangle$, 所以 $\vb{F}\cdot\vb{n} = x^2 + y^2 = 1$, 通量为侧面的面积 $2\pi\cdot 1\cdot 2 = 4\pi$. 总体而言 $4\pi + 0 + 4\pi = 8\pi$.

```check
F216 = Matrix([x, y, z**2]); same(div3(F216), 2 + 2*z)
antideriv(2*z + z**2, 2 + 2*z, z)
steps(Integral((2 + 2*z)*pi, (z, 0, 2)), pi*((2*2 + 2**2) - 0), 8*pi); same(integrate(div3(F216).subs(pol)*r, (r, 0, 1), (theta, 0, 2*pi), (z, 0, 2)), 8*pi)
top216 = integrate(F216[2].subs(z, 2)*r, (r, 0, 1), (theta, 0, 2*pi)); bot216 = integrate(-F216[2].subs(z, 0)*r, (r, 0, 1), (theta, 0, 2*pi))
same(top216, 4*pi); same(bot216, 0)
Cy = Matrix([cos(theta), sin(theta), z]); NCy = Cy.diff(theta).cross(Cy.diff(z)); same(NCy, Matrix([cos(theta), sin(theta), 0]))
side216 = integrate(F216.subs({x: Cy[0], y: Cy[1], z: Cy[2]}, simultaneous=True).dot(NCy), (theta, 0, 2*pi), (z, 0, 2))
same(side216, 4*pi); same(2*pi*1*2, 4*pi); same(top216 + bot216 + side216, 8*pi)
```
:::

如果 $\vb{F}$ 在 $P_0$ 附近具有连续的一阶偏导数, 可以将散度定理应用于以 $P_0$ 为中心的小球 $B_r$. 每个球上的平均散度随着球的缩小趋于该点 $P_0$ 的散度值. 因此 $(\operatorname{div}\vb{F})(P_0)$ 是通过 $B_r$ 表面的向外通量除以 $B_r$ 的体积, 即单位体积的流出量. 在定理的假设下, 如果 $\operatorname{div}\vb{F} = 0$ 在 $E$ 内成立, 则流入的通量等于流出的通量.

::: compute 两侧均使用 SymPy
两个定理可以用计算机验证。首先是例20.15中穹顶的斯托克斯定理。助手 `at` 在一个表达式中放入一个点，而 `curl` 遵循定义20.6：

```python
import sympy as sp
x, y, z, t, r, th = sp.symbols('x y z t r theta')

def at(e, p):
    """e (an expression or a Matrix in x, y, z) at the point p."""
    return e.subs({x: p[0], y: p[1], z: p[2]}, simultaneous=True)

def curl(F):
    P, Q, R = F
    return sp.Matrix([sp.diff(R, y) - sp.diff(Q, z),
                      sp.diff(P, z) - sp.diff(R, x),
                      sp.diff(Q, x) - sp.diff(P, y)])

F = sp.Matrix([z, x, y])
edge = sp.Matrix([sp.cos(t), sp.sin(t), 0])
print(sp.integrate(at(F, edge).dot(edge.diff(t)), (t, 0, 2*sp.pi)))
```

```output
pi
```

这是沿边界的线积分。对于曲面积分，用极坐标参数化穹顶， $\vb{r}(r, \theta) = \langle r\cos\theta, r\sin\theta, 1 - r^2\rangle$：

```python
dome = sp.Matrix([r*sp.cos(th), r*sp.sin(th), 1 - r**2])
N = dome.diff(r).cross(dome.diff(th))          # r_r x r_theta
print(sp.simplify(N[2]))
integrand = sp.simplify(at(curl(F), dome).dot(N))
print(sp.integrate(integrand, (r, 0, 1), (th, 0, 2*sp.pi)))
```

```output
r
pi
```

$\vb{r}_r\times\vb{r}_\theta$ 的 $z$ 分量 $r$ 在 $r>0$ 时为正，因此该法向量向上，符合方向要求，且两边均为 $\pi$。现在对于 $\vb{F} = \langle x^3, y^3, z^3\rangle$ 和单位球体的散度定理，其表面是例20.11中的单位球面：

```python
phi, rho = sp.symbols('phi rho')
G = sp.Matrix([x**3, y**3, z**3])
sphere = sp.Matrix([sp.sin(phi)*sp.cos(th), sp.sin(phi)*sp.sin(th),
                    sp.cos(phi)])
N = sphere.diff(phi).cross(sphere.diff(th))    # outwards
flux = sp.integrate(sp.simplify(at(G, sphere).dot(N)),
                    (phi, 0, sp.pi), (th, 0, 2*sp.pi))
divG = sp.diff(G[0], x) + sp.diff(G[1], y) + sp.diff(G[2], z)
dV = rho**2*sp.sin(phi)                         # spherical coordinates
inside = sp.integrate(at(divG, rho*sphere)*dV,
                      (rho, 0, 1), (phi, 0, sp.pi), (th, 0, 2*sp.pi))
print(divG)
print(flux, inside)
```

```output
3*x**2 + 3*y**2 + 3*z**2
12*pi/5 12*pi/5
```

体积积分使用球坐标， $dV = \rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta$（模块19）。两边再次一致。
:::

```check
domeS = Matrix([r*cos(theta), r*sin(theta), 1 - r**2]); Nd = domeS.diff(r).cross(domeS.diff(theta)); same(Nd[2], r)
same(integrate(simplify(curl3(F215).subs({x: domeS[0], y: domeS[1], z: domeS[2]}, simultaneous=True).dot(Nd)), (r, 0, 1), (theta, 0, 2*pi)), pi)
G3 = Matrix([x**3, y**3, z**3]); S1 = Sph(1); NS1 = S1.diff(phs).cross(S1.diff(ths))
same(div3(G3), 3*x**2 + 3*y**2 + 3*z**2)
same(integrate(simplify(G3.subs({x: S1[0], y: S1[1], z: S1[2]}, simultaneous=True).dot(NS1)), (phs, 0, pi), (ths, 0, 2*pi)), Rational(12, 5)*pi)
same(integrate(div3(G3).subs({x: rs_*S1[0], y: rs_*S1[1], z: rs_*S1[2]}, simultaneous=True)*rs_**2*sin(phs), (rs_, 0, 1), (phs, 0, pi), (ths, 0, 2*pi)), Rational(12, 5)*pi)
```

### 麦克斯韦方程组 {#maxwell}

这些定理的经典应用是电磁学。麦克斯韦方程组描述了电场 $\vb{E}$ 和磁场 $\vb{B}$ 是如何由电荷和电流产生的，以及它们如何随时间变化。在 SI 单位中，电场和总电荷、电流的方程使用通量和环流。对于一个向外定向的闭合曲面 $S$，其中 $Q$ 是其内部的电荷，

$$\begin{aligned} \iint_S \vb{E}\cdot d\vb{S} &= \frac{Q}{\varepsilon_0} \quad\text{(Gauss's law)}, \\ \iint_S \vb{B}\cdot d\vb{S} &= 0, \end{aligned}$$

并且对于一个固定定向的曲面 $S$，其边界为正向定向的 $C$，其中 $I$ 是沿所选法向量通过 $S$ 的带符号电流，

$$\begin{aligned} \oint_C \vb{E}\cdot d\vb{r} &= -\frac{d}{dt}\iint_S \vb{B}\cdot d\vb{S}, \\ \oint_C \vb{B}\cdot d\vb{r} &= \mu_0 I \\ &\quad+ \mu_0\varepsilon_0\frac{d}{dt}\iint_S \vb{E}\cdot d\vb{S}, \end{aligned}$$

其中 $\varepsilon_0$ 和 $\mu_0$ 是物理常数；这两个定律中的第一个是法拉第定律。在微分形式下，关于每个点的散度和旋度，麦克斯韦方程组如下

$$\begin{aligned} \operatorname{div}\vb{E} &= \frac{\rho}{\varepsilon_0}, & \operatorname{div}\vb{B} &= 0, \\ \operatorname{curl}\vb{E} &= -\frac{\partial\vb{B}}{\partial t}, & \operatorname{curl}\vb{B} &= \mu_0\vb{J} + \mu_0\varepsilon_0\frac{\partial\vb{E}}{\partial t}, \end{aligned}$$

其中 $\rho$ 是电荷密度（单位体积内的电荷）和 $\vb{J}$ 是电流密度，因此 $I=\iint_S \vb{J}\cdot d\vb{S}$。

散度定理和斯托克斯定理将每一法则从一种形式转换为另一种形式，其中场在空间和时间上具有连续的一阶导数，电荷和电流密度也是连续的。对于固定曲面，可以在通量积分内部取连续的时间导数。对于高斯定律，写出 $Q = \iiint_E \rho\,dV$ 对于固体 $E$ 内部 $S$；散度定理将左边转换为 $\iiint_E \operatorname{div}\vb{E}\,dV$，因此

$$\iiint_E \Big(\operatorname{div}\vb{E} - \frac{\rho}{\varepsilon_0}\Big)\,dV = 0$$

对于每一个固体 $E$。如果括号中的连续函数在某一点为正，则在该点附近的小球上该函数也为正，因此该球上的积分也为正；以同样的方式，它在任何点都不能为负。因此 $\operatorname{div}\vb{E} = \rho/\varepsilon_0$ 在每一点成立。对于环流定律，斯托克斯定理给出两个微分表达式之差通过每一个小圆盘的通量为零。如果该差在某一点不为零，则存在一个足够小的圆盘，其法向量沿该点的差方向，从而具有正通量，这由连续性保证。在真空空间中，四个微分方程结合成波方程，波速为 $1/\sqrt{\mu_0\varepsilon_0}$，即光速：光是一种电磁波。

```check
qch = symbols('q', real=True); e0 = symbols('varepsilon_0', positive=True)
Eq_ = qch/(4*pi*e0)*Matrix([x, y, z])/(x**2 + y**2 + z**2)**Rational(3, 2)     # the field of a point charge
same(simplify(div3(Eq_)), 0)
same(integrate(simplify(Eq_.subs({x: Sa[0], y: Sa[1], z: Sa[2]}, simultaneous=True).dot(NSa)), (phs, 0, pi), (ths, 0, 2*pi)), qch/e0)
```

## 一种模式 {#pattern}

[模块 1](module_01_ZH.html#about) 从汽车的速度表和里程表开始，伴随着一个承诺：微积分是关于变化率和累积的，而微积分基本定理将它们联系起来。本模块已经证明或陈述了四个类似的定理。并列展示：

| 定理与区域 | 区域上导数的积分 = 边界上的值 |
|---|---|
| 基本定理（模块 10）：一个区间 $[a, b]$ | $\displaystyle\int_a^b F'(x)\,dx = F(b) - F(a)$ |
| 线积分（定理 20.2）：一条从 $A$ 到 $B$ 的曲线 | $\displaystyle\int_C \nabla f\cdot d\vb{r} = f(B) - f(A)$ |
| 格林（定理 20.6）：一个平面区域 $D$ 与边界 $C$ | $\displaystyle\iint_D (Q_x - P_y)\,dA = \oint_C P\,dx + Q\,dy$ |
| 斯托克斯（定理 20.9）：一个曲面 $S$ 与边界 $C$ | $\displaystyle\iint_S \operatorname{curl}\vb{F}\cdot d\vb{S} = \oint_C \vb{F}\cdot d\vb{r}$ |
| 散度（定理 20.10）：一个立体 $E$ 与表面 $S$ | $\displaystyle\iiint_E \operatorname{div}\vb{F}\,dV = \iint_S \vb{F}\cdot d\vb{S}$ |

在各定理的假设下，左侧对区域积分一个导数，右侧仅涉及该导数在区域边界上的值。导数与维度匹配：$F'$ 对应单变量函数的导数，标量场沿曲线的梯度，沿曲面边缘的环流的旋度，以及流出实体的散度。每个边界都带有区域赋予它的方向：平面区域的边缘，区域在左侧；曲面的边缘，由右手定则确定；实体的表面，向外。即使第一行也有一个：$[a, b]$ 的两个端点带有符号，$+F(b)$ 和 $-F(a)$。

这些证明还有一个共同的思想。对于区域的一个小部分，该定理在一元情形下即为基本定理，如格林定理和盒状体散度定理的证明。将这些部分相加，所有内部边界都会相互抵消，因为每个内部边界都属于两个部分，这两个部分以相反方向追踪该边界；只剩下外部边界。

即使第20.5节中的恒等式也符合这一模式。一个区域的边界本身没有边界：一条闭合曲线没有端点，一个闭合曲面也没有边缘。相应地，$\operatorname{curl}(\nabla f) = \vb{0}$ 和 $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$。例如，如果 $\vb{F}$ 满足斯托克斯定理在闭合曲面上的假设，那么 $\operatorname{curl}\vb{F}$ 的通量为 0，因为曲面没有边缘。如果曲面包围一个实体且 $\vb{F}$ 在实体附近具有连续的二阶偏导数，那么散度定理从 $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$ 得出相同的结果。练习 20.10 使用了这一论证。

::: keyidea
每个基本定理都表达相同的意思：**在一个区域内对导数进行积分，得到区域边界的值**。模块1中的速度表和里程表是第一个例子：在一段时间内对速率进行积分，得到其两端之间的变化。在本模块中，同样的句子描述了在二维和三维空间中流动的流体、重力和电场。
:::

### 接下来该去哪里 {#next}

这是该系列的结尾，也是几条道路的起点。

- **微分方程.**第13模块 解析单变量函数的方程。物理学中的微分形式定律，如麦克斯韦方程组，是**偏微分方程**：热方程、波动方程和拉普拉斯方程 $\operatorname{div}(\nabla u) = 0$。散度定理是将守恒定律（“从一个区域流出的量等于该区域内损失的量”）转化为这种方程的方式，流体和热的数值模拟方法都是建立在它之上的。
- **实变分析** 通过 [第2.7节](module_02_ZH.html#precise)] 的 ε–δ 推理来证明，本系列使用的某些结果未给出完整证明，包括极值定理、连续函数的可积性、弗比尼定理的一般形式、变量替换公式以及一般区域上的格林定理。
- **复变函数** 是用复变量函数进行的微积分，如欧拉公式 $e^{i\theta} = \cos\theta + i\sin\theta$ 所在的模块 15。其核心定理，柯西定理，说明 $\oint_C f(z)\,dz = 0$ 对于一条分段光滑的闭合路径 $C$，当 $f$ 在包含 $C$ 的开单连通区域内复可微时。它是格林定理的近亲。例如 $1/z$，其定义域在 0 处有空洞，例 20.6 中的 $2\pi$ 在绕以 0 为中心、逆时针方向一周的圆上返回 $\oint_C dz/z = 2\pi i$。
- **微分几何**使用微积分研究曲线和曲面：它们的弯曲方式以及其上的最短路径。在其**微分形式**的语言中，表格中的五个定理是一个定理，写作$\int_M d\omega = \int_{\partial M} \omega$：$\omega$的导数在区域$M$上的积分等于$\omega$在其边界$\partial M$上的积分。

在这个网站上，[计算机科学与人工智能的数学基础](../math/index_ZH.html) 继续介绍线性代数、概率与统计、优化与数值计算，以及 [人工智能：从机器学习到大语言模型](../ai/index_ZH.html) 将梯度和链式法则应用于神经网络中。

```check
zc = symbols('z_c'); same(integrate(exp(I*t)**(-1)*diff(exp(I*t), t), (t, 0, 2*pi)), 2*pi*I)   # dz/z round the unit circle
uL = Function('u')(x, y, z); same(div3(grad3(uL)), diff(uL, x, 2) + diff(uL, y, 2) + diff(uL, z, 2))
```

## 你所学到的内容 {#summary}

- 一个 **向量场**是给每个点赋予一个向量：风、流体速度、重力、电场、函数的 $\nabla f$梯度。它的图像是在网格上画出的箭头，按比例缩放；一个**流线** 沿着箭头方向。
- **线积分**对函数$\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\norm{\vb{r}'(t)}\,dt$求和$f$乘以长度（质量、平均值）。场$\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt = \int_C P\,dx + Q\,dy$的线积分求和切向分量（功）。两者均不依赖于参数化；当方向反转时，后者变号。
- **微分形式基本定理**: $\int_C \nabla f\cdot d\vb{r} = f(B) - f(A)$. 一个向量场是 **保守场**, $\vb{F} = \nabla f$, 当且仅当其线积分与路径无关，当且仅当其在闭合曲线上的积分为零。对于一个在开区域上具有连续一阶偏导数的平面场， $P_y = Q_x$是必要的。在一个 **单连通**区域中，它是充分的； $\langle -y, x\rangle/(x^2 + y^2)$，绕原点的环流量 $2\pi$，说明了区域的重要性。通过逐个变量积分来寻找势函数。
- **格林定理**: $\oint_C P\,dx + Q\,dy = \iint_D (Q_x - P_y)\,dA$ 对于一个正向定向、分段光滑、简单闭合曲线，以及在所围区域邻域内具有连续一阶偏导数的分量。其流量形式是 $\oint_C \vb{F}\cdot\vb{n}\,ds = \iint_D (P_x + Q_y)\,dA$。面积是线积分， $A = \tfrac12\oint_C x\,dy - y\,dx$: 测量仪和鞋带公式。
- $\operatorname{curl}\vb{F} = \nabla\times\vb{F}$ 衡量旋转（单位面积上的环流量；刚体旋转角速度的两倍），而 $\operatorname{div}\vb{F} = \nabla\cdot\vb{F}$ 衡量膨胀（单位面积或体积上的流出量）。当具有连续二阶偏导数时， $\operatorname{curl}(\nabla f) = \vb{0}$ 和 $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$。
- **参数曲面**$\vb{r}(u, v)$ 的法向量为 $\vb{r}_u\times\vb{r}_v$，面积为 $\iint_D \norm{\vb{r}_u\times\vb{r}_v}\,dA$，曲面积分为 $\iint_S f\,dS$。当叉积的方向与所选定向一致时，**通量**为 $\iint_S \vb{F}\cdot d\vb{S} = \iint_D \vb{F}\big(\vb{r}(u,v)\big)\cdot(\vb{r}_u\times\vb{r}_v)\,dA$。
- **斯托克斯定理**，$\oint_C \vb{F}\cdot d\vb{r} = \iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}$（遵循右手定则），以及**散度定理**，$\iint_S \vb{F}\cdot d\vb{S} = \iiint_E \operatorname{div}\vb{F}\,dV$（外法线），将格林定理推广至空间。对于斯托克斯定理，场在曲面附近需具有一阶连续偏导数；对于散度定理，场在实体附近需具有一阶连续偏导数。这两个定理联系了麦克斯韦的积分与微分方程。
- 这些基本定理有共同的结构：区域上导数的积分等于相应的边界表达式。

## 练习 {#exercises}

:::: exercise 阅读一个向量场 {#ex-20-1} ★
设 $\vb{F}(x, y) = \langle x - y, x + y\rangle$。

- (a) 求 $\vb{F}$ 在 $(1, 0)$、$(0, 1)$、$(-1, 0)$、$(0, -1)$ 和 $(1, 1)$ 处的值，并描述所得到的图像。
- (b) 将 $\vb{F}$ 表示为例 20.1 中两个向量场的和，并求 $Q_x - P_y$ 和 $P_x + Q_y$。
- (c) $\vb{F}$ 是保守场吗？

::: solution
**(a)** $\vb{F}(1, 0) = \langle 1, 1\rangle$, $\vb{F}(0, 1) = \langle -1, 1\rangle$, $\vb{F}(-1, 0) = \langle -1, -1\rangle$, $\vb{F}(0, -1) = \langle 1, -1\rangle$ and $\vb{F}(1, 1) = \langle 0, 2\rangle$. 每个箭头都指向外部并逆时针旋转。一般来说 $\vb{F}\cdot\langle x, y\rangle = x^2 + y^2$ 和 $\norm{\vb{F}} = \sqrt{2}\sqrt{x^2 + y^2}$，因此远离原点的角度 $\alpha$ 在 $\vb{F}$ 和位置矢量之间有 $\cos\alpha = 1/\sqrt2$：每个箭头与远离原点的方向形成 $\pi/4$ 的角度。具有这种速度的流体呈螺旋状向外运动。

**(b)** $\langle x - y, x + y\rangle = \langle -y, x\rangle + \langle x, y\rangle$，旋转场加上源场。 $Q_x - P_y = 1 - (-1) = 2$ 和 $P_x + Q_y = 1 + 1 = 2$：该场像旋转场一样旋转，像源场一样扩散。

**(c)** 否： $P_y = -1$ 和 $Q_x = 1$ 不同，因此根据定理 20.4，它在任何开区域上都不是保守场。

```check
F_e1 = Matrix([x - y, x + y])
same([F_e1.subs({x: p_[0], y: p_[1]}) for p_ in [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1)]], [Matrix([1, 1]), Matrix([-1, 1]), Matrix([-1, -1]), Matrix([1, -1]), Matrix([0, 2])])
same(F_e1.dot(Matrix([x, y])), x**2 + y**2); same(F_e1.subs({x: xr, y: yr}).norm(), sqrt(2)*sqrt(xr**2 + yr**2))
same((xr**2 + yr**2)/(sqrt(2)*sqrt(xr**2 + yr**2)*sqrt(xr**2 + yr**2)), 1/sqrt(2)); same(acos(1/sqrt(2)), pi/4)
same(F_e1, Matrix([-y, x]) + Matrix([x, y]))
same(diff(F_e1[1], x) - diff(F_e1[0], y), 2); same(diff(F_e1[0], x) + diff(F_e1[1], y), 2)
```
:::
::::

:::: exercise 一根螺旋弹簧 {#ex-20-2} ★
一根导线沿着螺旋线 $\vb{r}(t) = \langle 3\cos t, 3\sin t, 4t\rangle$, $0 \le t \le 2\pi$ 的一个螺距缠绕，长度单位为厘米。

- (a) 求导线的长度。
- (b) 设 $C$ 为导线的路径。求 $\int_C z\,ds$ 和导线的平均高度。
- (c) 如果螺旋线从顶部向下追踪，(b) 的答案会改变吗？

::: solution
**(a)** $\vb{r}'(t) = \langle -3\sin t, 3\cos t, 4\rangle$, 所以 $\norm{\vb{r}'(t)} = \sqrt{9\sin^2 t + 9\cos^2 t + 16} = \sqrt{25} = 5$. 长度是 $\int_0^{2\pi} 5\,dt = 10\pi \approx 31.42$ cm。

**(b)** 在线 $z = 4t$ 上，因此

$$\begin{aligned} \int_C z\,ds &= \int_0^{2\pi} 4t\cdot 5\,dt \\ &= 20\Big[\frac{t^2}{2}\Big]_0^{2\pi} \\ &= 40\pi^2 \approx 394.8\text{ cm}^2. \end{aligned}$$

平均高度是 $40\pi^2/(10\pi) = 4\pi \approx 12.57$ cm：电线顶部高度 $8\pi$ 的一半，因为电线以恒定速率上升。

**(c)** 不会。根据定理 20.1， $\int_{-C} f\,ds = \int_C f\,ds$。例如， $\vb{r}(2\pi - t)$ 表示从顶部追踪螺旋线，且给出 $\int_0^{2\pi} 4(2\pi - t)\cdot 5\,dt = 40\pi^2$。

```check
hx = Matrix([3*cos(t), 3*sin(t), 4*t]); same(hx.diff(t), Matrix([-3*sin(t), 3*cos(t), 4])); same(sqrt(simplify(hx.diff(t).dot(hx.diff(t)))), 5)
same(integrate(5, (t, 0, 2*pi)), 10*pi); rounds(10*pi, '31.42')
steps(Integral(4*t*5, (t, 0, 2*pi)), 20*(2*pi)**2/2, 40*pi**2); rounds(40*pi**2, '394.8')
same(40*pi**2/(10*pi), 4*pi); rounds(4*pi, '12.57'); same(hx[2].subs(t, 2*pi)/2, 4*pi)
same(integrate(4*(2*pi - t)*5, (t, 0, 2*pi)), 40*pi**2)
```
:::
::::

:::: exercise 功与方向 {#ex-20-3} ★
设 $\vb{F}(x, y) = \langle y, 2x\rangle$。求 $\vb{F}$ 所做的功：

- (a) 沿单位圆从 $(1, 0)$ 到 $(0, 1)$ 的四分之一圆弧，逆时针方向；
- (b) 沿相同的四分之一圆弧从 $(0, 1)$ 到 $(1, 0)$；
- (c) 沿直线段从 $(1, 0)$ 到 $(0, 1)$。

(a) 与 (c) 的比较告诉了你关于 $\vb{F}$ 的什么信息？

::: solution
**(a)** 取 $\vb{r}(t) = \langle\cos t, \sin t\rangle$, $0 \le t \le \pi/2$. 然后 $\vb{F}\big(\vb{r}(t)\big) = \langle\sin t, 2\cos t\rangle$ 和 $\vb{r}'(t) = \langle -\sin t, \cos t\rangle$, 所以 $\vb{F}\cdot\vb{r}' = -\sin^2 t + 2\cos^2 t$. 由于 $\int_0^{\pi/2} \sin^2 t\,dt = \int_0^{\pi/2} \cos^2 t\,dt = \pi/4$ ([Exercise 10.12](module_10_ZH.html#ex-10-12)),

$$W = -\frac{\pi}{4} + 2\cdot\frac{\pi}{4} = \frac{\pi}{4} \approx 0.785.$$

**(b)** 同一条曲线反方向：由定理 20.1, $W = -\pi/4$.

**(c)** 取 $\vb{r}(t) = \langle 1 - t, t\rangle$, $0 \le t \le 1$. 然后 $\vb{F}\big(\vb{r}(t)\big) = \langle t, 2(1 - t)\rangle$ 和 $\vb{r}'(t) = \langle -1, 1\rangle$, 所以 $\vb{F}\cdot\vb{r}' = -t + 2 - 2t = 2 - 3t$, 并且 $W = \int_0^1 (2 - 3t)\,dt = 2 - \tfrac32 = \tfrac12$.

两条路径有相同的端点给出不同的功, $\pi/4$ 和 $\tfrac12$, 所以 $\vb{F}$ 不是保守场 (定理 20.3). 测试结果一致: $P_y = 1$ 和 $Q_x = 2$ 不同.

```check
F_e3 = Matrix([y, 2*x]); qc = Matrix([cos(t), sin(t)])
same(F_e3.subs({x: cos(t), y: sin(t)}), Matrix([sin(t), 2*cos(t)])); same(Matrix([sin(t), 2*cos(t)]).dot(qc.diff(t)), -sin(t)**2 + 2*cos(t)**2)
same(integrate(sin(t)**2, (t, 0, pi/2)), pi/4); same(integrate(cos(t)**2, (t, 0, pi/2)), pi/4)
same(lint(F_e3, qc, 0, pi/2), pi/4); rounds(pi/4, '0.785'); same(lint(F_e3, [cos(pi/2 - t), sin(pi/2 - t)], 0, pi/2), -pi/4)
sg = Matrix([1 - t, t]); same(F_e3.subs({x: 1 - t, y: t}).dot(sg.diff(t)), 2 - 3*t); same(lint(F_e3, sg, 0, 1), Rational(1, 2))
same(diff(y, y), 1); same(diff(2*x, x), 2)
```
:::
::::

:::: exercise 旋度与散度 {#ex-20-4} ★
设 $\vb{F}(x, y, z) = \langle x^2y, -xy^2, z\rangle$。

- (a) 求 $\operatorname{curl}\vb{F}$ 和 $\operatorname{div}\vb{F}$。
- (b) $\vb{F}$ 是否是保守场?
- (c) $\vb{F}$ 是某个分量具有连续二阶偏导数的向量场 $\vb{G}$ 的旋度吗？

::: solution
**(a)**  以 $P = x^2y$、$Q = -xy^2$ 和 $R = z$ 为条件：

$$\begin{aligned} &\operatorname{curl}\vb{F} \\ &\quad= \langle 0 - 0,\ 0 - 0,\ -y^2 - x^2\rangle \\ &\quad= \langle 0, 0, -(x^2 + y^2)\rangle, \\ &\operatorname{div}\vb{F} = 2xy - 2xy + 1 = 1. \end{aligned}$$

**(b)** 否. 如果 $\vb{F} = \nabla f$, 那么 $f$ 的二阶偏导数连续 (即 $P$, $Q$ 和 $R$ 的一阶偏导数), 所以由定理 20.8, $\operatorname{curl}\vb{F} = \operatorname{curl}(\nabla f) = \vb{0}$. 但在 $(1, 0, 0)$, $\operatorname{curl}\vb{F} = \langle 0, 0, -1\rangle$.

**(c)** 否。根据定理 20.8，$\operatorname{div}(\operatorname{curl}\vb{G}) = 0$，但 $\operatorname{div}\vb{F} = 1$.

```check
F_e4 = Matrix([x**2*y, -x*y**2, z]); same(curl3(F_e4), Matrix([0, 0, -(x**2 + y**2)])); same(div3(F_e4), 1)
same(curl3(F_e4).subs({x: 1, y: 0, z: 0}), Matrix([0, 0, -1]))
```
:::
::::

:::: exercise 平面上的势函数 {#ex-20-5} ★★
设 $\vb{F}(x, y) = \langle 3x^2y + y,\ x^3 + x + 2y\rangle$。

- (a) 证明 $\vb{F}$ 是保守场。
- (b) 求一个势函数。
- (c) 求 $\int_C \vb{F}\cdot d\vb{r}$，其中 $C$ 沿 $\vb{r}(t) = \langle t^2, t^3 + 1\rangle$ 的路径 $0 \le t \le 1$ 进行。
- (d) 沿任意闭曲线的 $\oint_C \vb{F}\cdot d\vb{r}$ 是多少？

::: solution
**(a)** $P_y = 3x^2 + 1$ 和 $Q_x = 3x^2 + 1$ 在整个平面内相等且连续，该平面是单连通的，因此 $\vb{F}$ 是保守场，根据定理 20.5。

**(b)** 对 $x$ 积分 $P$：$f = x^3y + xy + g(y)$。然后 $f_y = x^3 + x + g'(y)$，并与 $Q$ 比较得到 $g'(y) = 2y$，因此 $g(y) = y^2$（取常数为 0）且

$$f(x, y) = x^3y + xy + y^2.$$

检查：$f_x = 3x^2y + y$ 和 $f_y = x^3 + x + 2y$。

**(c)** 曲线从 $\vb{r}(0) = (0, 1)$ 到 $\vb{r}(1) = (1, 2)$。速度仅在第一个端点处为零，这在定理 20.2 中是允许的。所以

$$\begin{aligned} &\int_C \vb{F}\cdot d\vb{r} = f(1, 2) - f(0, 1) \\ &\quad= (2 + 2 + 4) - (0 + 0 + 1) \\ &\quad= 7. \end{aligned}$$

计算 $\int_0^1 \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt$ 直接展开一个 8 次多项式后也得到 7。

**(d)** 0，根据定理 20.3： $\vb{F}$ 在整个平面上是保守场。

```check
P_e5, Q_e5 = 3*x**2*y + y, x**3 + x + 2*y
same(diff(P_e5, y), 3*x**2 + 1); same(diff(Q_e5, x), 3*x**2 + 1)
antideriv(x**3*y + x*y, P_e5, x); same(Q_e5 - diff(x**3*y + x*y, y), 2*y)
f_e5 = x**3*y + x*y + y**2; same(Matrix([diff(f_e5, x), diff(f_e5, y)]), Matrix([P_e5, Q_e5]))
c_e5 = Matrix([t**2, t**3 + 1]); same(c_e5.subs(t, 0), Matrix([0, 1])); same(c_e5.subs(t, 1), Matrix([1, 2]))
same(f_e5.subs({x: 1, y: 2}) - f_e5.subs({x: 0, y: 1}), 7); same(lint(Matrix([P_e5, Q_e5]), c_e5, 0, 1), 7)
same(degree(expand(Matrix([P_e5, Q_e5]).subs({x: c_e5[0], y: c_e5[1]}, simultaneous=True).dot(c_e5.diff(t))), t), 8)
```
:::
::::

:::: exercise 空间中的势函数 {#ex-20-6} ★★
设 $\vb{F}(x, y, z) = \langle 2xy + z^2,\ x^2 + 2yz,\ y^2 + 2xz\rangle$。

- (a) 证明 $\operatorname{curl}\vb{F} = \vb{0}$。
- (b) 求 $f$ 的势函数。
- (c) 求 $\vb{F}$ 沿着螺旋线 $\vb{r}(t) = \langle\cos t, \sin t, t\rangle$， $0 \le t \le \pi$ 所做的功。

::: solution
**(a)**

$$\begin{aligned} &\operatorname{curl}\vb{F} \\ &\enspace= \langle 2y - 2y, 2z - 2z, 2x - 2x\rangle \\ &\enspace= \vb{0}. \end{aligned}$$

空间是单连通的，因此 $\vb{F}$ 是保守场（第 20.5 节）。

**(b)** 对 $P$ 关于 $x$ 积分： $f = x^2y + xz^2 + g(y, z)$，其中的“常数”可能依赖于 $y$ 和 $z$。然后 $f_y = x^2 + g_y = x^2 + 2yz$，所以 $g_y = 2yz$ 和 $g = y^2z + h(z)$。接着 $f_z = 2xz + y^2 + h'(z) = y^2 + 2xz$，所以 $h'(z) = 0$；取 $h = 0$：

$$f(x, y, z) = x^2y + xz^2 + y^2z.$$

**(c)** 螺旋线从 $\vb{r}(0) = (1, 0, 0)$ 到 $\vb{r}(\pi) = (-1, 0, \pi)$。根据定理 20.2，

$$\begin{aligned} W &= f(-1, 0, \pi) - f(1, 0, 0) \\ &= (0 - \pi^2 + 0) - 0 = -\pi^2. \end{aligned}$$

```check
F_e6 = Matrix([2*x*y + z**2, x**2 + 2*y*z, y**2 + 2*x*z]); same(curl3(F_e6), zeros(3, 1))
same(curl3(F_e6), Matrix([2*y - 2*y, 2*z - 2*z, 2*x - 2*x]))
antideriv(x**2*y + x*z**2, F_e6[0], x); same(F_e6[1] - diff(x**2*y + x*z**2, y), 2*y*z); antideriv(y**2*z, 2*y*z, y)
same(F_e6[2] - diff(x**2*y + x*z**2 + y**2*z, z), 0)
f_e6 = x**2*y + x*z**2 + y**2*z; same(grad3(f_e6), F_e6)
hl = Matrix([cos(t), sin(t), t]); same(hl.subs(t, 0), Matrix([1, 0, 0])); same(hl.subs(t, pi), Matrix([-1, 0, pi]))
same(f_e6.subs({x: -1, y: 0, z: pi}) - f_e6.subs({x: 1, y: 0, z: 0}), -pi**2); same(lint(F_e6, hl, 0, pi), -pi**2)
```
:::
::::

:::: exercise 绿色定理在正方形上 {#ex-20-7} ★★
设 $P = xy$ 和 $Q = x^2$，令 $C$ 为正方形 $0 \le x \le 1$， $0 \le y \le 1$ 的边界，按逆时针方向遍历。

- (a) 直接计算 $\oint_C P\,dx + Q\,dy$，逐边进行。
- (b) 使用格林定理进行计算。
- (c) 如果 $C$ 按顺时针方向进行，结果是什么？

::: solution
**(a)** 沿底部（$y = 0$，$x$ 从 0 到 1）：$P = 0$ 和 $dy = 0$，因此边贡献为 0。沿右侧（$x = 1$，$y$ 从 0 到 1）：$dx = 0$ 和 $Q = 1$，因此贡献为 $\int_0^1 1\,dy = 1$。沿顶部（$y = 1$，$x$ 从 1 返回 0）：$P = x$ 和 $dy = 0$，因此贡献为 $\int_1^0 x\,dx = -\tfrac12$。沿左侧（$x = 0$）：$dx = 0$ 和 $Q = 0$，因此贡献为 0。总计 $0 + 1 - \tfrac12 + 0 = \tfrac12$。

**(b)** $Q_x - P_y = 2x - x = x$，因此

$$\begin{aligned} \oint_C P\,dx + Q\,dy &= \int_0^1\!\!\int_0^1 x\,dx\,dy \\ &= \frac12. \end{aligned}$$

**(c)** $-\tfrac12$：改变方向会改变线积分的符号（定理 20.1），并且所陈述的格林定理需要逆时针方向。

```check
F_e7 = Matrix([x*y, x**2])
edges7 = [lint(F_e7, [t, 0], 0, 1), lint(F_e7, [1, t], 0, 1), lint(F_e7, [1 - t, 1], 0, 1), lint(F_e7, [0, 1 - t], 0, 1)]
same(edges7, [0, 1, -Rational(1, 2), 0]); same(integrate(x, (x, 1, 0)), -Rational(1, 2)); same(sum(edges7), Rational(1, 2))
same(diff(x**2, x) - diff(x*y, y), x); same(integrate(x, (x, 0, 1), (y, 0, 1)), Rational(1, 2))
same(lint(F_e7, [0, t], 0, 1) + lint(F_e7, [t, 1], 0, 1) + lint(F_e7, [1, 1 - t], 0, 1) + lint(F_e7, [1 - t, 0], 0, 1), -Rational(1, 2))
```
:::
::::

:::: exercise 边界所围区域的面积 {#ex-20-8} ★★
- (a) 使用鞋带公式（鞋带公式）求四边形 $(0, 0)$、$(4, 0)$、$(5, 3)$ 和 $(1, 4)$ 的面积，并通过将其分成两个三角形来验证答案。
- (b) 求由星形线（astroid） $x = \cos^3 t$、$y = \sin^3 t$、$0 \le t \le 2\pi$ 所围成的面积。

::: solution
**(a)** 四个顶点按逆时针顺序列出。四个项 $x_ky_{k+1} - x_{k+1}y_k$ 为

$$\begin{aligned} &0\cdot0 - 4\cdot0 = 0, \\ &4\cdot3 - 5\cdot0 = 12, \\ &5\cdot4 - 1\cdot3 = 17, \\ &1\cdot0 - 0\cdot4 = 0, \end{aligned}$$

所以 $A = \tfrac12(0 + 12 + 17 + 0) = \tfrac{29}{2} = 14.5$。从 $(0, 0)$ 到 $(5, 3)$ 的对角线将四边形分成两个三角形。从原点出发的两条边的叉乘的绝对值的一半（模块 16）给出它们的面积 $\tfrac12(4\cdot3 - 5\cdot0) = 6$ 和 $\tfrac12(5\cdot4 - 1\cdot3) = \tfrac{17}{2}$，以及 $6 + \tfrac{17}{2} = \tfrac{29}{2}$。

**(b)** 此处 $dx = -3\cos^2 t\sin t\,dt$ 和 $dy = 3\sin^2 t\cos t\,dt$，且星形线按逆时针方向绘制。在相邻坐标轴交叉点之间，速度非零；在四个拐点处速度为零。在拐点处分割边界，得到分段光滑路径。因此

$$\begin{aligned} &x\,dy - y\,dx \\ &\quad= \big(3\cos^4 t\sin^2 t \\ &\qquad\quad + 3\sin^4 t\cos^2 t\big)\,dt \\ &\quad= 3\sin^2 t\cos^2 t\,dt \\ &\quad= \tfrac34\sin^2 2t\,dt, \end{aligned}$$

提取因子 $3\sin^2 t\cos^2 t$ 并使用 $\cos^2 t + \sin^2 t = 1$ 和 $\sin 2t = 2\sin t\cos t$。由于 $\int_0^{2\pi} \sin^2 2t\,dt = \pi$，

$$\begin{aligned} A &= \frac12\int_0^{2\pi} \frac34\sin^2 2t\,dt \\ &= \frac{3\pi}{8} \approx 1.178. \end{aligned}$$

```check
same(sh([(0, 0), (4, 0), (5, 3), (1, 4)]), Rational(29, 2)); same(Rational(29, 2), Rational(145, 10))
quad20 = [(0, 0), (4, 0), (5, 3), (1, 4)]
same([a_[0]*b_[1] - b_[0]*a_[1] for a_, b_ in zip(quad20, quad20[1:] + quad20[:1])], [0, 12, 17, 0])
p20, q20, r20 = [Matrix([px_, py_, 0]) for px_, py_ in quad20[1:]]
same(p20.cross(q20).norm()/2, 6); same(q20.cross(r20).norm()/2, Rational(17, 2))
same(6 + Rational(17, 2), Rational(29, 2))
xa, ya = cos(t)**3, sin(t)**3; same(diff(xa, t), -3*cos(t)**2*sin(t)); same(diff(ya, t), 3*sin(t)**2*cos(t))
steps(xa*diff(ya, t) - ya*diff(xa, t), 3*cos(t)**4*sin(t)**2 + 3*sin(t)**4*cos(t)**2, 3*sin(t)**2*cos(t)**2, Rational(3, 4)*sin(2*t)**2)
same(integrate(sin(2*t)**2, (t, 0, 2*pi)), pi); same(integrate(Rational(3, 8)*sin(2*t)**2, (t, 0, 2*pi)), 3*pi/8); rounds(3*pi/8, '1.178')
```
:::
::::

:::: exercise 通过穹顶的通量 {#ex-20-9} ★★
设 $\vb{F} = \langle x, y, z\rangle$，令 $S$ 为穹顶 $z = 1 - x^2 - y^2$， $z \ge 0$，朝上定向。

- (a) 计算 $\vb{F}$ 通过 $S$ 的通量。
- (b) 用散度定理验证你的答案，应用在固体 $E$ 之间，即穹顶与 $xy$ 平面上的单位圆盘之间。

::: solution
**(a)** 如例 20.15 所示，图的向上法向量为 $\langle 2x, 2y, 1\rangle$，而在穹顶 $\vb{F} = \langle x, y, 1 - x^2 - y^2\rangle$ 上。因此

$$\begin{aligned} &\vb{F}\cdot\langle 2x, 2y, 1\rangle \\ &\quad= 2x^2 + 2y^2 + 1 - x^2 - y^2 \\ &\quad= 1 + x^2 + y^2, \end{aligned}$$

并在单位圆盘 $D$ 上，用极坐标表示，

$$\begin{aligned} &\iint_S \vb{F}\cdot d\vb{S} \\ &\quad= \int_0^{2\pi}\!\!\int_0^1 (1 + r^2)\,r\,dr\,d\theta \\ &\quad= 2\pi\Big(\frac12 + \frac14\Big) = \frac{3\pi}{2}. \end{aligned}$$

**(b)** $E$ 的边界是穹顶，朝外定向（向上），以及圆盘，朝外定向，此处表示向下： $\vb{n} = -\vb{k}$。在圆盘 $z = 0$ 上，因此 $\vb{F}\cdot\vb{n} = -z = 0$，其通量为 0。因此 $E$ 的通量为 $\tfrac{3\pi}{2} + 0$。在另一侧， $\operatorname{div}\vb{F} = 3$，且 $E$ 的体积为 $\int_0^{2\pi}\int_0^1 (1 - r^2)\,r\,dr\,d\theta = 2\pi\big(\tfrac12 - \tfrac14\big) = \tfrac{\pi}{2}$，因此 $\iiint_E 3\,dV = \tfrac{3\pi}{2}$。两者一致。

```check
F_e9 = Matrix([x, y, z]); same(F_e9.subs(z, gd).dot(Matrix([2*x, 2*y, 1])), 1 + x**2 + y**2)
same(integrate((1 + r**2)*r, (r, 0, 1), (theta, 0, 2*pi)), 3*pi/2); same(2*pi*(Rational(1, 2) + Rational(1, 4)), 3*pi/2)
same(F_e9.subs(z, 0).dot(Matrix([0, 0, -1])), 0); same(div3(F_e9), 3)
same(integrate((1 - r**2)*r, (r, 0, 1), (theta, 0, 2*pi)), pi/2); same(3*pi/2, 3*(pi/2))
```
:::
::::

:::: exercise 一个边界，两个曲面 {#ex-20-10} ★★★
设 $\vb{F} = \big\langle -y^3,\ x^3,\ e^z\sin(xy)\big\rangle$，设 $H$ 为朝外的半球 $x^2 + y^2 + z^2 = 1$，$z \ge 0$，设 $D$ 为位于 $xy$ 平面上的单位圆盘，方向向上。

- (a) 使用斯托克斯定理证明 $\iint_H \operatorname{curl}\vb{F}\cdot d\vb{S} = \iint_D \operatorname{curl}\vb{F}\cdot d\vb{S}$，并计算其公共值。
- (b) 用散度定理重新解释 (a) 中的等式。

::: solution
**(a)** 两个曲面具有相同的边界，即单位圆 $C$，并且 $H$ 上的外法向量与 $D$ 上的上法向量在从上方观察时均诱导逆时针方向。根据斯托克斯定理，两个通量均等于 $\oint_C \vb{F}\cdot d\vb{r}$。利用 $\vb{r}(t) = \langle\cos t, \sin t, 0\rangle$、$\vb{F}\big(\vb{r}(t)\big) = \langle -\sin^3 t, \cos^3 t, \sin(\cos t\sin t)\rangle$ 和 $\vb{r}'(t) = \langle -\sin t, \cos t, 0\rangle$，因此被积函数为 $\sin^4 t + \cos^4 t$。由于

$$\begin{aligned} &\sin^4 t + \cos^4 t \\ &\quad= \big(\sin^2 t + \cos^2 t\big)^2 \\ &\qquad - 2\sin^2 t\cos^2 t \\ &\quad= 1 - \tfrac12\sin^2 2t, \end{aligned}$$

旋度是 $2\pi - \tfrac12\cdot\pi = \tfrac{3\pi}{2}$. 在平面上的计算也很简单：$\operatorname{curl}\vb{F}\cdot\vb{k} = Q_x - P_y = 3x^2 + 3y^2$，并且 $\int_0^{2\pi}\int_0^1 3r^2\cdot r\,dr\,d\theta = \tfrac{3\pi}{2}$. 在球面部分，相比之下，$\operatorname{curl}\vb{F}$ 也有分量 $xe^z\cos(xy)$ 和 $-ye^z\cos(xy)$，直接计算较为麻烦。

**(b)** 向外定向的 $H$ 与向下定向的 $D$ 一起构成立体半球 $E$ 的向外定向闭曲面。由散度定理和定理 20.8，$\operatorname{curl}\vb{F}$ 穿出 $E$ 的通量为 $\iiint_E \operatorname{div}(\operatorname{curl}\vb{F})\,dV = 0$。因此向上穿过 $H$ 的通量与向下穿过 $D$ 的通量之和为 0。从而向上穿过 $H$ 的通量等于向上穿过 $D$ 的通量。

```check
F_e10 = Matrix([-y**3, x**3, exp(z)*sin(x*y)]); ce = Matrix([cos(t), sin(t), 0])
same(F_e10.subs({x: cos(t), y: sin(t), z: 0}, simultaneous=True), Matrix([-sin(t)**3, cos(t)**3, sin(cos(t)*sin(t))]))
same(F_e10.subs({x: cos(t), y: sin(t), z: 0}, simultaneous=True).dot(ce.diff(t)), sin(t)**4 + cos(t)**4)
steps(sin(t)**4 + cos(t)**4, (sin(t)**2 + cos(t)**2)**2 - 2*sin(t)**2*cos(t)**2, 1 - sin(2*t)**2/2)
same(integrate(1 - sin(2*t)**2/2, (t, 0, 2*pi)), 3*pi/2); same(lint(F_e10, ce, 0, 2*pi), 3*pi/2)
cF10 = curl3(F_e10); same(cF10, Matrix([x*exp(z)*cos(x*y), -y*exp(z)*cos(x*y), 3*x**2 + 3*y**2]))
same(integrate(3*r**2*r, (r, 0, 1), (theta, 0, 2*pi)), 3*pi/2); same(div3(cF10), 0)
import numpy as np_
fH = lambdify((phs, ths), cF10.subs({x: Sph(1)[0], y: Sph(1)[1], z: Sph(1)[2]}, simultaneous=True).dot(NS1), 'numpy')
gp, gw = np_.polynomial.legendre.leggauss(40); hp, hw = np_.polynomial.legendre.leggauss(80)
PH, TH = np_.meshgrid(np_.pi/4*(gp + 1), np_.pi*(hp + 1), indexing='ij')
near(float((np_.outer(gw, hw)*fH(PH, TH)).sum()*(np_.pi/4)*np_.pi), 3*pi/2, 1e-9)       # the flux through the hemisphere, numerically
```
:::
::::

:::: exercise 旋涡场沿任意曲线的积分 {#ex-20-11} ★★★
设 $\vb{F} = \big\langle -y, x\big\rangle/(x^2 + y^2)$，即例 20.6 中的向量场。

- (a) 证明向量场 $\vb{F}$ 沿着以原点为中心、半径为 $\varepsilon$ 的圆 $C_\varepsilon$ 逆时针方向的线积分等于 $2\pi$，对于每一个 $\varepsilon > 0$ 均成立。
- (b) 设 $C$ 是一个正向、分段光滑、简单闭合曲线，其内部包含原点。利用有孔区域的格林定理证明 $\oint_C \vb{F}\cdot d\vb{r} = 2\pi$。
- (c) 如果原点严格位于 $C$ 外侧，那么 $\oint_C \vb{F}\cdot d\vb{r}$ 是什么？

::: solution
**(a)** 与 $\vb{r}(t) = \langle\varepsilon\cos t, \varepsilon\sin t\rangle$，$x^2 + y^2 = \varepsilon^2$，因此 $\vb{F}\big(\vb{r}(t)\big) = \tfrac{1}{\varepsilon}\langle -\sin t, \cos t\rangle$，而 $\vb{r}'(t) = \varepsilon\langle -\sin t, \cos t\rangle$。它们的点积为 $\sin^2 t + \cos^2 t = 1$：$\varepsilon$ 的项相互抵消，且线积分是 $2\pi$。

**(b)** $C$ 的内部是开集，包含原点，因此包含一个小圆 $C_\varepsilon$ 及其圆盘。设 $R$ 为 $C$ 与 $C_\varepsilon$ 之间的区域，是一个有一个孔的区域。其边界，左侧用 $R$ 跟踪，是 $C$ 逆时针方向与 $C_\varepsilon$ 顺时针方向的组合。$P$ 和 $Q$ 在除原点外的所有点处都有连续偏导数，而原点不在 $R$ 中，根据例 20.6，$Q_x - P_y = 0$ 处。因此，Green 定理对于 $R$ 适用，给出

$$\begin{aligned} &\oint_C \vb{F}\cdot d\vb{r} + \oint_{-C_\varepsilon} \vb{F}\cdot d\vb{r} \\ &\quad= \iint_R 0\,dA = 0, \end{aligned}$$

由 (a) 又得 $\oint_C \vb{F}\cdot d\vb{r} = \oint_{C_\varepsilon} \vb{F}\cdot d\vb{r} = 2\pi$。

**(c)** 0. 现在区域 $D$ 位于 $C$ 内部，且不包含原点，且 $\vb{F}$ 在包含 $D$ 的开区域上具有连续的偏导数（即不含原点的平面）。格林定理给出 $\oint_C \vb{F}\cdot d\vb{r} = \iint_D 0\,dA = 0$。因此，场 $\vb{F}$ 沿简单闭合曲线的线积分等于 $2\pi$ 或 0，取决于曲线是否绕原点旋转：这就是 $\vb{F}$ 计算旋转次数的方式。当 $C$ 经过原点时，该点处的场未定义，因此普通线积分的定义不适用。

```check
ep = symbols('varepsilon', positive=True); ceps = Matrix([ep*cos(t), ep*sin(t)])
same(Matrix([P206, Q206]).subs({x: ceps[0], y: ceps[1]}, simultaneous=True), Matrix([-sin(t), cos(t)])/ep); same(ceps.diff(t), ep*Matrix([-sin(t), cos(t)]))
same(lint(Matrix([P206, Q206]), ceps, 0, 2*pi), 2*pi)
same(simplify(diff(Q206, x) - diff(P206, y)), 0)
same(lint(Matrix([P206, Q206]), [3 + cos(t), sin(t)], 0, 2*pi), 0)                   # a circle that does not go round the origin
near(Integral(Matrix([P206, Q206]).subs({x: 2*cos(t) + Rational(1, 2), y: sin(t)}, simultaneous=True).dot(Matrix([-2*sin(t), cos(t)])), (t, 0, 2*pi)).evalf(30), 2*pi, 1e-20)   # an ellipse round it
```
:::
::::

:::: exercise 高斯定理 {#ex-20-12} ★★★
设 $\vb{F} = \vb{r}/\norm{\vb{r}}^3$，其中 $\vb{r} = \langle x, y, z\rangle$，在不含原点的空间中。

- (a) 证明 $\operatorname{div}\vb{F} = 0$。
- (b) 证明场 $\vb{F}$ 沿以原点为中心的任意球面的向外通量为 $4\pi$。
- (c) 设 $S$ 是一个闭合的、分段光滑的曲面，其内部包含原点。证明场 $\vb{F}$ 沿 $S$ 的向外通量为 $4\pi$。
- (d) 点电荷 $q$ 在原点处的电场是 $\vb{E} = \dfrac{q}{4\pi\varepsilon_0}\vb{F}$。推导出高斯定律：从 $S$ 中流出 $\vb{E}$ 的通量是 $q/\varepsilon_0$。

::: solution
**(a)** 写出 $\norm{\vb{r}} = \rho$，因此 $P = x\rho^{-3}$ 与 $\rho^2 = x^2 + y^2 + z^2$。根据乘积法则和链式法则，得到 $\partial\rho/\partial x = x/\rho$ 和

$$\begin{aligned} P_x &= \rho^{-3} - 3x\rho^{-4}\cdot\frac{x}{\rho} \\ &= \frac{\rho^2 - 3x^2}{\rho^5}. \end{aligned}$$

同样地，得到 $Q_y = (\rho^2 - 3y^2)/\rho^5$ 和 $R_z = (\rho^2 - 3z^2)/\rho^5$，其和为 $\big(3\rho^2 - 3(x^2 + y^2 + z^2)\big)/\rho^5 = 0$。

**(b)** 在半径为 $a$ 的球面上， $\vb{n} = \vb{r}/a$ 和 $\norm{\vb{r}} = a$，因此 $\vb{F}\cdot\vb{n} = \dfrac{\vb{r}\cdot\vb{r}}{a\cdot a^3} = \dfrac{1}{a^2}$ 是一个常数。通量为 $\dfrac{1}{a^2}\cdot 4\pi a^2 = 4\pi$，无论半径如何。

**(c)** 高斯散度定理不能应用于内部区域 $S$，因为 $\vb{F}$ 在原点处未定义。相反，选择一个以原点为中心的球体 $S_a$，使其足够小以至于完全包含在 $S$ 内，令 $E$ 为 $S$ 和 $S_a$ 之间的区域：一个带有空腔的立体区域，该区域不包含原点。 $\vb{F}$ 在包含 $E$ 的开区域上具有连续的偏导数，因此根据高斯散度定理，考虑空腔表面朝向空腔内部（即朝向原点）的方向，

$$\begin{aligned} &\iint_S \vb{F}\cdot d\vb{S} + \iint_{S_a,\ \text{inwards}} \vb{F}\cdot d\vb{S} \\ &\quad= \iiint_E 0\,dV = 0. \end{aligned}$$

根据 (b)，穿过 $S_a$ 的内向通量为 $-4\pi$，因此穿过 $S$ 的通量为 $4\pi$。

**(d)** $\vb{E}$ 的通量为 $\dfrac{q}{4\pi\varepsilon_0}$ 乘以 $\vb{F}$ 的通量：即 $\dfrac{q}{4\pi\varepsilon_0}\cdot 4\pi = \dfrac{q}{\varepsilon_0}$，这是第 20.7 节中高斯定律的积分形式，适用于点电荷。

```check
F_e12 = Matrix([x, y, z])/(x**2 + y**2 + z**2)**Rational(3, 2); rq = sqrt(x**2 + y**2 + z**2)
same(diff(rq, x), x/rq)
same([diff(F_e12[i_], v_) for i_, v_ in enumerate((x, y, z))], [(rq**2 - 3*v_**2)/rq**5 for v_ in (x, y, z)])
same(simplify(div3(F_e12)), 0)
same(simplify(F_e12.subs({x: Sa[0], y: Sa[1], z: Sa[2]}, simultaneous=True).dot(Sa/aS)), 1/aS**2); same(1/aS**2*4*pi*aS**2, 4*pi)
same(integrate(simplify(F_e12.subs({x: Sa[0], y: Sa[1], z: Sa[2]}, simultaneous=True).dot(NSa)), (phs, 0, pi), (ths, 0, 2*pi)), 4*pi)
same(qch/(4*pi*e0)*4*pi, qch/e0)
```
:::
::::

## 自测 {#quiz}

```quiz
? 当你反转曲线 $C$ 的方向时，采用哪种符号规则？
- [ ] 两个积分都被取反
- [ ] $\int_C f\,ds$ 被取反，而 $\int_C \vb{F}\cdot d\vb{r}$ 保持不变
- [x] $\int_C f\,ds$ 保持不变，而 $\int_C \vb{F}\cdot d\vb{r}$ 被取反
- [ ] 两个积分保持不变
> $\int_C \vb{F}\cdot d\vb{r}$ 求取 $\vb{F}$ 沿运动方向的分量，反向运动则反向该分量：积分被取反，若为零则保持不变（定理 20.1）。$\int_C f\,ds$ 求取 $f$ 乘以长度，无论方向如何长度都是正的。一根导线从任一端计算质量都相同。

? 设 $\vb{F} = \langle 2x, 2y\rangle$。力 $\vb{F}$ 沿从 $(1, 0)$ 到 $(0, 2)$ 的任意分段光滑路径所做的功为
- [x] $3$
- [ ] $5$
- [ ] $-3$
- [ ] 不同路径结果不同
> $\vb{F} = \nabla f$ 与 $f = x^2 + y^2$，因此根据线积分基本定理，功为 $f(0, 2) - f(1, 0) = 4 - 1 = 3$，对任意路径均成立。$-3$ 顺序错误地相减，$5$ 本应相减却相加，保守场的功与路径无关。

? 哪些场在整个平面内是保守场？
- [ ] $\langle -y, x\rangle$
- [ ] $\langle y, -x\rangle$
- [ ] $\langle x^2, xy\rangle$
- [x] $\langle y, x\rangle$
> 对 $\langle y, x\rangle$，$P_y = 1 = Q_x$ 在单连通平面，确实它是 $\nabla(xy)$。$\langle -y, x\rangle$ 有 $P_y = -1 \ne 1 = Q_x$；$\langle y, -x\rangle$ 有 $P_y = 1 \ne -1 = Q_x$；$\langle x^2, xy\rangle$ 有 $P_y = 0$ 但 $Q_x = y$。

? 向量场 $\langle -y, x\rangle/(x^2 + y^2)$ 在其定义域内处处有 $P_y = Q_x$，但其沿单位圆的环流量为 $2\pi$。为什么这不违背保守场的判定定理？
- [ ] $P_y$ 和 $Q_x$ 在圆周上的点不连续
- [x] 平面除去原点后不是单连通的
- [ ] 单位圆不是一个光滑曲线
- [ ] 该定理仅适用于空间中的场
> 该定理需要一个单连通区域，而圆绕过了原点处的空洞，该处场未定义。在圆上，偏导数是连续的，且圆是光滑的（$\vb{r}' \ne \vb{0}$）。定理 20.5 的测试是关于平面中的场。

? 如果 $C$ 是圆 $x^2 + y^2 = 4$，按逆时针方向绘制，则 $\oint_C x\,dy$ 等于
- [ ] $0$
- [ ] $2\pi$
- [ ] $8\pi$
- [x] $4\pi$
> 由$P = 0$和$Q = x$，$Q_x - P_y = 1$，根据格林定理，该积分等于圆盘面积$\pi\cdot 2^2 = 4\pi$。$2\pi$是单位圆盘面积的两倍，$8\pi$使用了$2\pi r^2$。该积分在此处不能为0，因为其面积被积函数在圆盘上处处为1。

? $\vb{F} = \langle -y, x, 0\rangle$ 的旋度是
- [x] $\langle 0, 0, 2\rangle$
- [ ] $\langle 0, 0, 0\rangle$
- [ ] $\langle 0, 0, -2\rangle$
- [ ] 数字 2
> $\operatorname{curl}\vb{F} = \langle R_y - Q_z, P_z - R_x, Q_x - P_y\rangle = \langle 0, 0, 1 - (-1)\rangle = \langle 0, 0, 2\rangle$：旋转角速度的两倍。前两个分量消失，但第三个是 2。改变减法顺序会导致 $-2$ 出错，单独的数字 2 忽略了旋度的方向。

? $\vb{F} = \langle x, y, z\rangle$ 从原点为中心、半径为 2 的球体向外的通量是
- [ ] $16\pi$
- [x] $32\pi$
- [ ] $\dfrac{32\pi}{3}$
- [ ] $8\pi$
> 根据散度定理，通量为 $\operatorname{div}\vb{F} = 3$ 乘以体积 $\tfrac43\pi\cdot 2^3 = \tfrac{32\pi}{3}$: $32\pi$. 直接计算：在球面 $\vb{F}\cdot\vb{n} = 2$ 上，面积为 $16\pi$. $16\pi$ 是面积本身，$\tfrac{32\pi}{3}$ 是体积本身，而 $8\pi$ 将 $\vb{F}\cdot\vb{n}$ 视为 $\tfrac12$.

? 如果 $f$ 和 $\vb{F}$ 的分量具有连续的二阶偏导数，以下哪一个是始终为 0？
- [ ] $\operatorname{curl}\vb{F}$
- [ ] $\operatorname{div}(\nabla f)$
- [x] $\operatorname{div}(\operatorname{curl}\vb{F})$
- [ ] $\nabla(\operatorname{div}\vb{F})$
> $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$ 根据定理 20.8. $\operatorname{curl}\vb{F}$ 一般不为 0（对于 $\langle -y, x, 0\rangle$，它为 $\langle 0, 0, 2\rangle$）. $\operatorname{div}(\nabla f) = f_{xx} + f_{yy} + f_{zz}$，其值为 2 对于 $f = x^2$. 并且 $\nabla(\operatorname{div}\vb{F})$ 是 $\langle 2, 0, 0\rangle$ 对于 $\vb{F} = \langle x^2, 0, 0\rangle$.
```

```check
same(grad3(x**2 + y**2), Matrix([2*x, 2*y, 0]))
same((x**2 + y**2).subs({x: 0, y: 2}) - (x**2 + y**2).subs({x: 1, y: 0}), 3)
same(grad3(x*y)[:2, 0], Matrix([y, x])); same(diff(y, y), diff(x, x)); same(diff(x**2, y), 0); same(diff(x*y, x), y)
same(integrate(1*r, (r, 0, 2), (theta, 0, 2*pi)), 4*pi); same(lint(Matrix([0, x]), [2*cos(t), 2*sin(t)], 0, 2*pi), 4*pi)
same(curl3(Matrix([-y, x, 0])), Matrix([0, 0, 2])); same(div3(Matrix([-y, x, 0])), 0)
same(3*Rational(4, 3)*pi*2**3, 32*pi); same(4*pi*2**2, 16*pi); same(2*16*pi, 32*pi)
same(div3(grad3(x**2)), 2); same(grad3(div3(Matrix([x**2, 0, 0]))), Matrix([2, 0, 0]))
```
