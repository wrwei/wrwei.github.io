---
title: 微分方程
part: 3
lead: 为增长、冷却、下落与混合现象建立微分方程，先从图像了解解的趋势，再用欧拉法逐步近似。你将求出可分离变量方程、线性方程和弹簧振动等问题的精确解，并通过代入原方程检验答案。
minutes: 270
needs: 模块 1 到 12，尤其是求导法则（模块 4 到 6）和积分技巧（模块 10 和 11）
goals:
  - 解释什么是微分方程、它的阶以及它的解，并通过代入检验一个解
  - 用微分方程建模增长、冷却、下落物体和混合罐
  - 阅读方向场，找出平衡解并判断它们是否稳定
  - 用欧拉方法近似解，并解释其误差与步长成正比的原因
  - 解可分离变量、Logistic 和一阶线性微分方程，以及常系数二阶线性微分方程
  - 使用 SymPy 解并检验微分方程，以及进行数值求解
---

## 什么是微分方程 {#what}

[第 1.3 节 ](module_01_ZH.html#functions) 丢了一个球，并给出了它在 $t$ 秒内下落的距离为 $s(t) = 4.9t^2$ 米。物理学不会直接给你这个公式。它给出的是一条关于变化率的陈述：在地球表面附近，若忽略空气阻力，下落物体的加速度为 $g \approx 9.8$ m/s²。用符号表示为，

$$s''(t) = 9.8.$$

这是一个未知函数 $s$ 的方程，它涉及 $s$ 的导数。两次积分（模块 10）得到 $s'(t) = 9.8t + C_1$ 和 $s(t) = 4.9t^2 + C_1t + C_2$。一个从静止下落的球具有 $s(0) = 0$ 和 $s'(0) = 0$，因此得到 $C_2 = 0$ 和 $C_1 = 0$：即 $s(t) = 4.9t^2$，这是模块 1 的公式。

```check
rounds(Rational(980665, 100000), '9.8')          # standard gravity is 9.80665 m/s^2
C1, C2 = symbols('C1 C2')
s13 = Rational(49, 10)*t**2 + C1*t + C2
same(diff(s13, t, 2), Rational(98, 10)); same(diff(s13, t), Rational(98, 10)*t + C1)
same(solve([s13.subs(t, 0), diff(s13, t).subs(t, 0)], [C1, C2]), {C1: 0, C2: 0})
```

模块 6 遇到了另一个这样的方程，$y' = ky$，指数增长和衰减定律， 并检查了 $y = Ce^{kt}$ 是否满足它。大多数科学定律都是关于变化率的陈述：牛顿运动定律、冷却定律和放射性衰减定律、电路定律。它们的自然形式是一个像这两个方程一样的方程，本模块是关于找出它们所描述的函数。

::: definition 微分方程
一个 **微分方程**是一个包含未知函数及其一个或多个导数的方程。它的**阶** 是其中最高阶导数的阶数。
:::

因此$y' = ky$和$y' = t - y$的阶为1，而$s'' = 9.8$和$mx'' + cx' + kx = 0$（振动弹簧，第13.8节）的阶为2。在本模块中，未知量是一个单变量（通常为时间$t$）的函数；此类方程称为**ordinary**微分方程。涉及多个变量的函数方程（含偏导数，模块17）为偏微分方程，超出本课程范围。遵循惯例，方程将$y$写作$y(t)$，将$y'$写作$dy/dt$：$y' = t - y$表示对于所考虑的每个$t$，$y'(t) = t - y(t)$均成立。

::: definition 解与初始值问题
微分方程在开区间 $I$ 上的一个**解**是一个函数，它在 $I$ 的每一点都有方程所需的导数，且对 $I$ 中的每个 $t$ 都使方程成立。含任意常数且能表示所有解的公式称为**通解**；任取其中一个解称为**特解**。**初值问题**要求解还在时刻 $t_0$ 满足给定的**初始条件**：一阶方程须满足 $y(t_0) = y_0$，二阶方程须满足 $y(t_0) = y_0$ 和 $y'(t_0) = v_0$。
:::

$t_0$ 和 $y_0$ 读作 "t nought" 和 "y nought"。要验证一个函数是否为解，将其代入：计算其导数，将所有内容代入方程，检查两边是否对每个 $t$ 相等。

::: example 检查解
证明对于每个常数 $C$，$y = t - 1 + Ce^{-t}$ 是 $y' = t - y$ 的解，并找出满足 $y(0) = 1$ 的解。

求导：$y' = 1 - Ce^{-t}$。方程右边为

$$\begin{aligned} t - y &= t - \big(t - 1 + Ce^{-t}\big) \\ &= 1 - Ce^{-t}. \end{aligned}$$

两个边对每个 $t$ 都一致，因此每个函数族中的函数都是 $(-\infty, \infty)$ 上的解。对于初始条件 $y(0) = 0 - 1 + C = C - 1$，当 $C = 2$ 时为 1。解为

$$y = t - 1 + 2e^{-t}.$$

第 13.7 节表明，该函数族包含所有解：它是通解。

```check
yC = t - 1 + c*exp(-t)                      # c stands for C
same(diff(yC, t), 1 - c*exp(-t)); steps(t - yC, 1 - c*exp(-t)); same(diff(yC, t) - (t - yC), 0)
same(yC.subs(t, 0), c - 1); same(solve(Eq(yC.subs(t, 0), 1), c), [2])
y131 = t - 1 + 2*exp(-t)
yf = Function('y')
holds(checkodesol(Eq(yf(t).diff(t), t - yf(t)), Eq(yf(t), y131))[0]); same(y131.subs(t, 0), 1)
```
:::

::: example 二阶方程
证明 $x = \cos 3t$ 和 $x = \sin 3t$ 是 $x'' + 9x = 0$ 的解，并找出满足 $x(0) = 2$ 和 $x'(0) = 3$ 的解。

对于 $x = \cos 3t$，链式法则给出 $x' = -3\sin 3t$ 和 $x'' = -9\cos 3t$，因此 $x'' + 9x = -9\cos 3t + 9\cos 3t = 0$。对于 $x = \sin 3t$， $x'' = -9\sin 3t$，再次 $x'' + 9x = 0$。无论常数 $C_1$ 和 $C_2$ 为何值，对于 $x = C_1\cos 3t + C_2\sin 3t$，其二阶导数始终为 $-9x$。现在满足两个条件。 $x(0) = C_1$，因此 $C_1 = 2$。并且

$$x'(t) = -3C_1\sin 3t + 3C_2\cos 3t,$$

所以 $x'(0) = 3C_2 = 3$ 和 $C_2 = 1$。解为 $x = 2\cos 3t + \sin 3t$。二阶方程需要两个条件，此处解中包含两个常数；第 13.8 节表明这是巧合。

```check
for xs_ in (cos(3*t), sin(3*t)):
    same(diff(xs_, t, 2) + 9*xs_, 0)
x2_ = C1*cos(3*t) + C2*sin(3*t)
same(diff(x2_, t, 2), -9*x2_); same(diff(x2_, t), -3*C1*sin(3*t) + 3*C2*cos(3*t))
same(solve([x2_.subs(t, 0) - 2, diff(x2_, t).subs(t, 0) - 3], [C1, C2]), {C1: 2, C2: 1})
same(diff(2*cos(3*t) + sin(3*t), t, 2) + 9*(2*cos(3*t) + sin(3*t)), 0)
```
:::

::: pitfall
一个解必须在区间内的每一个 $t$ 满足方程，而不是在几个点上。函数 $y = t^2$ 不是 $y' = 2y$ 的解：这里 $y' = 2t$ 和 $2y = 2t^2$ 在 $t = 0$ 和 $t = 1$ 处相等，但在 $t = 2$ 处分别为 4 和 8。

```check
same((2*t).subs(t, 0), (2*t**2).subs(t, 0)); same((2*t).subs(t, 1), (2*t**2).subs(t, 1))
same((2*t).subs(t, 2), 4); same((2*t**2).subs(t, 2), 8)
```
:::

### 当恰好存在一个解时 {#existence}

在例 13.1 中，恰好有一个函数族中的函数具有 $y(0) = 1$。对于写成 $y' = F(t, y)$ 形式的一阶方程，恰好通过给定点存在一个解是常见情况，定理说明了何时可以保证这一点。它需要一个新的符号： $F_y$，读作 "F 下标 y"，表示 $F(t, y)$ 关于 $y$ 的导数，且 $t$ 被视为常数。对于 $F(t, y) = t - y^2$， $F_y = -2y$。（这是 **偏导数**，是模块 17 的主题。）

```check
same(diff(t - y**2, y), -2*y)
```

::: theorem 存在性与唯一性
假设 $F$ 和 $F_y$ 在一个含点 $(t_0, y_0)$ 的开矩形 $R$ 上连续。该矩形由满足 $a < t < b$ 和 $c < y < d$ 的点 $(t, y)$ 组成。端点 $a$、$b$、$c$、$d$ 可以为无穷，因此 $R$ 可以是整个平面。此时初值问题

$$y' = F(t, y), \qquad y(t_0) = y_0$$

在包含 $t_0$ 的某个开区间内有解，并且只有一个：两个解的图像位于 $R$ 内，在包含 $t_0$ 的每一个开区间上，只要两个解都有定义，它们在该区间上就一致。
:::

该证明通过一系列更精确的近似方法，属于常微分方程课程的内容；本系列使用该定理而不证明。在 $R$ 之外，它没有任何保证，因此图像必须保持在 $R$ 内。两个例子将展示它保证什么以及不保证什么。

- **区间可以很短。**$F(t, y) = y^2$和$F_y = 2y$处处连续，但$y' = y^2$、$y(0) = 1$的解是$y = \dfrac{1}{1 - t}$（验证：$y' = \dfrac{1}{(1 - t)^2} = y^2$），它仅在$t < 1$存在：它**爆炸**，当$t$趋近于1时无界增长。方程中没有任何内容会警告你。
- **在 $F_y$ 上没有假设的情况下，唯一性可能失效。** 问题 $y' = 3y^{2/3}$, $y(0) = 0$ 有两个解 $y = 0$ 和 $y = t^3$：对于 $y = t^3$， $y' = 3t^2$ 和 $3y^{2/3} = 3(t^3)^{2/3} = 3t^2$（其中 $y^{2/3}$ 是实数立方根的平方）。此处 $F_y = 2y^{-1/3}$ 在 $y = 0$ 处未定义。

```check
same(diff(1/(1 - t), t), (1/(1 - t))**2); same((1/(1 - t)).subs(t, 0), 1); limit_is(1/(1 - t), t, 1, oo, '-')
tp = symbols('t', positive=True)
same(diff(tp**3, tp), 3*(tp**3)**Rational(2, 3))                       # t > 0
same(3*real_root(Integer(-8), 3)**2, 3*(-2)**2); same(diff(t**3, t).subs(t, -2), 12)   # and t < 0, at t = -2
same(diff(3*y**Rational(2, 3), y), 2*y**Rational(-1, 3))
```

唯一性有一个图像。当 $F$ 和 $F_y$ 连续时，两个不同解 $y' = F(t, y)$ 的图像从不相交或相切：在公共点处，它们都会满足相同的初值问题，因此它们必须是同一个解。

## 模型 {#models}

大多数科学中的微分方程都源于一个原理：一个量的变化率等于其生成或流入的速率减去其被破坏或流出的速率。将这句话用符号表示就是 **建模**，这个方程是一个 **模型**：一个简化的描述，在其假设成立时是适用的。本模块中出现的四个模型是假设性的，选择这些数字是为了保持计算的简洁。

**增长与衰减。**一个拥有充足食物和空间的种群，其出生和死亡数量与其规模成比例，因此其变化率与其规模成比例：$y' = ky$，其中$k$，即每个个体的出生率减去死亡率，当出生数量多于死亡数量时为正。常数$k$以单位时间衡量：若$t$为年，则$k = 0.02$表示每年以当前规模的2%增长。在放射性样本中，每个原子在每一秒内衰变的概率相同，因此每秒衰变的数量与剩余数量成比例：$y' = ky$，其中$k < 0$，现在以秒为单位（模块6）。

**牛顿冷却定律。** 一杯温度远高于室温的热饮会迅速冷却，随着温度接近室温，冷却速度变慢。牛顿冷却定律指出冷却速率与温度差成正比：如果 $T(t)$ 是物体在恒定温度 $T_s$ 的环境中的温度，那么

$$\frac{dT}{dt} = -k(T - T_s),$$

速率由一个常数 $k > 0$ 决定，该常数取决于物体及其周围环境，单位为时间单位（例如每分钟）。符号是正确的：当 $T > T_s$ 时右边为负， $T$ 降低；当 $T < T_s$ 时 $T$ 增加。像所有模型一样，这个模型只是一个近似；例如，它忽略了杯子外侧比内侧冷却更快这一事实。

**有空气阻力的下落物体。** 取向下为正方向。质量为 $m$ 的物体以速度 $v$ 下落时，受到重力 $mg$ 向下拉，以及空气阻力向上推。对于小而慢的物体，阻力大致与速度成正比， $cv$ 且常数 $c > 0$ 的单位为千克每秒（使得 $cv$ 是牛顿力），牛顿第二定律（质量乘以加速度等于总力）给出

$$m\frac{dv}{dt} = mg - cv.$$

速度停止变化时为 $mg - cv = 0$，此时达到 **终端速度** $v_T = mg/c$。假设 $c/m = 0.2$ 每秒：除以 $m$， $v' = 9.8 - 0.2v$，和 $v_T = 49$ m/s。对于大型快速物体，如跳伞者，阻力与 $v^2$ 成正比更合适（练习 13.11）。

```check
same(solve(Rational(98, 10) - Rational(2, 10)*v, v), [49]); same(Rational(98, 10)/Rational(2, 10), 49)
```

**混合。** 一个搅拌的储液罐，液体流入和流出：

::: example 混合储罐
一个储罐含有 100 升盐水，其中溶解了 5 kg 盐。每分钟流入 3 升盐水，盐的浓度为 0.2 kg/升；储罐被搅拌以保持均匀，流出的混合液流速相同。写出盐量 $y(t)$ kg 在 $t$ 分钟后的初始值问题，并求出盐量停止变化时的值。

体积保持在 100 升，因为每分钟流入 3 升，同时流出 3 升。盐以 $0.2 \times 3 = 0.6$ 千克每分钟的速率流入。在时间 $t$ 时，储罐中的浓度为 $y/100$ 千克每升，因此盐以 $\tfrac{y}{100} \times 3 = 0.03y$ 千克每分钟的速率流出。变化率等于流入率减去流出率：

$$y' = 0.6 - 0.03y, \qquad y(0) = 5.$$

每一项的单位都是千克每分钟，符合预期。当 $0.6 - 0.03y = 0$ 为 $y = 20$ 千克时，数量停止变化；此时储罐中的浓度等于流入浓度 $20/100 = 0.2$ 千克每升。常数函数 $y = 20$ 是一个解，即平衡状态（第 13.3 节）。练习 13.6 找出 $y$ 如何达到该状态。

```check
same(Rational(2, 10)*3, Rational(6, 10)); same(y/100*3, Rational(3, 100)*y)
same(solve(Rational(6, 10) - Rational(3, 100)*y, y), [20]); same(Rational(20, 100), Rational(2, 10))
```
:::

::: keyidea
变化率 = 流入率 − 流出率。在解决模型之前，请检查每一项的单位是否相同，并确保符号使量值朝正确方向变化。
:::

::: pitfall
一个错误的符号会导致模型失控。$T' = k(T - T_s)$ 与 $k > 0$ 组合会使一杯热茶进一步、更快地升温。询问该量必须如何变化，并检查方程是否一致。保持单位一致：当流量以升每分钟为单位时，$t$ 以分钟为单位，每小时的速率必须首先转换。
:::

## 方向场与平衡点 {#direction-fields}

你可以在解方程之前画出 $y' = F(t, y)$ 的解。在每个点 $(t, y)$，方程告诉你通过该点的解必须具有的斜率。对于 $y' = t - y$，在 $(0, 1)$ 处的斜率为 $0 - 1 = -1$；在 $(1, 1)$ 处为 0；在 $(2, 1)$ 处为 1。在网格的每个点上画出具有该斜率的短线段，解就会显现为沿着这些线段的曲线（图 13.1）。

::: definition 方向场
方程 $y' = F(t, y)$ 的 **方向场**，或称斜率场，是在网格的每个点 $(t, y)$ 上画出一个具有斜率 $F(t, y)$ 的短线段的图像。解的图像在每个点上都与该点处的方向场相切。
:::

::: figure id=fig-13-1
两个方向场，其解绘制其中。左图：$y' = t - y$。每个解都趋近于直线$y = t - 1$（橙色），该直线本身也是一个解；蓝色曲线是例13.1中通过$(0, 1)$的解。右图：$y' = (y - 1)(y - 3)$。斜率仅取决于$y$。常数解为$y = 1$（稳定，绿色）和$y = 3$（不稳定，红色）：从3以下开始的解趋近于1，而从3以上开始的解无界增长。
:::

图13.1左侧的线段沿直线 $t - y = 0$，即 $y = t$；更一般地，沿直线 $t - y = m$ 的斜率是相同的数 $m$。沿斜率恒定的曲线称为 **isoclines（等斜线）**，它们使得方向场易于手工绘制：画一条等斜线，并在其上画出相应斜率的线段。对于 $m = 1$，即直线 $y = t - 1$，其等斜线是特殊的：其自身斜率为1，正是方向场在该线上所要求的斜率，因此它是一个解，即例13.1中 $C = 0$ 的解。图中显示，随着 $t$ 增大，其他每个解都趋近于它，这与公式 $y = t - 1 + Ce^{-t}$ 一致：项 $Ce^{-t}$ 逐渐消失。

```check
same((t - y).subs(t, 0).subs(y, 1), -1); same((t - y).subs({t: 1, y: 1}), 0); same((t - y).subs({t: 2, y: 1}), 1)
same(diff(t - 1, t), t - (t - 1)); limit_is(c*exp(-t), t, oo, 0)
```

::: example 阅读方向场
对于 $y' = t - y$：(a) 解在何处增加，在何处减少？(b) 经过 $(0, 1)$ 的解的最低点在哪里？

**(a)** 解决方案在 $y' > 0$ 增加，即在 $t - y > 0$ 以下的区域：在直线 $y = t$ 以下。在该直线以上，解减少。在图 13.1 中，直线 $y = t$ 以下的线段向上倾斜，而在其以上则向下倾斜。

**(b)** 经过 $(0, 1)$ 的解最初在直线 $y = t$ 之上，因此它首先减少；其最低点位于 $y' = 0$，即在等斜线 $y = t$ 上。根据例 13.1 的公式 $y = t - 1 + 2e^{-t}$，即在 $t - 1 + 2e^{-t} = t$，即 $e^{-t} = \tfrac12$，因此 $t = \ln 2$，并在 $y = t = \ln 2$ 处。最低点为 $(\ln 2, \ln 2) \approx (0.693, 0.693)$：图 13.1 中蓝色曲线的底部。

```check
same(solve(Eq(y131, t), t), [log(2)]); same(y131.subs(t, log(2)), log(2)); rounds(log(2), '0.693')
same(diff(y131, t).subs(t, log(2)), 0); holds(diff(y131, t, 2).subs(t, log(2)) > 0)
```
:::

### 平衡点与稳定性 {#equilibria}

当$F$不依赖于$t$时，方程$y' = f(y)$被称为**autonomous**。其斜率仅取决于高度$y$，因此其方向场在每条水平线上都相同（图13.1，右）。第13.2节的所有四个模型都是autonomous。

::: definition 平衡点与稳定性
一个 **平衡解** of $y' = f(y)$ 是一个常数解 $y = y^*$（读作 "y 星"）。它的导数为 0，因此平衡点是满足 $f(y^*) = 0$ 的数 $y^*$。一个平衡点 **稳定**，如果所有从它附近开始的解都随着 $t \to \infty$ 趋近于它；而 **不稳定**，如果存在一些从它附近任意接近处开始的解会远离它。
:::

在两个相邻的平衡点之间，一个连续的 $f$ 没有零点，因此它在整个区间内符号一致（根据模块 3 的中间值定理）。因此，在该区间内每个解要么持续上升（如果 $f > 0$），要么持续下降（如果 $f < 0$）；并且由于唯一性，它永远不会穿过一个平衡点。在 $y$ 轴上画出带有箭头的图示，向上处为 $f > 0$，向下处为 $f < 0$，这就是方程的 **相线**：它能迅速显示每个解的走向。导数 $f$ 的符号提供了一个快速判断方法。

::: theorem 稳定性测试
设 $f$ 的导数连续，且 $f(y^*) = 0$。若 $f'(y^*) < 0$，则 $y' = f(y)$ 的平衡解 $y^*$ 稳定；若 $f'(y^*) > 0$，则该平衡解不稳定。
:::

**证明思路。** 若 $f'(y^*) < 0$，则在 $y^*$ 附近某区间上有 $f' < 0$（因为 $f'$ 连续），所以 $f$ 在该区间递减（模块 8）。由于 $f(y^*) = 0$，$f$ 在区间中低于 $y^*$ 的部分为正，在较高的部分为负。所以略低于 $y^*$ 的解上升并趋向它，略高的解则下降并趋向它。若 $f'(y^*) > 0$，符号反转，解将远离平衡点。要说明趋向 $y^*$ 的解确实以它为极限，还需两点。单调增加且有上界的函数有极限（数列情形见模块 14 单调收敛定理），而该极限必为 $f$ 的零点，该区间内唯一的零点是 $y^*$。模块 7 的线性近似解释了原因：在 $y^*$ 附近有 $f(y) \approx f'(y^*)(y - y^*)$，所以距离 $u = y - y^*$ 满足 $u' \approx f'(y^*)\,u$。当 $f'(y^*) < 0$ 时指数衰减，当 $f'(y^*) > 0$ 时指数增长。

::: example $y' = (y - 1)(y - 3)$ 的平衡点
找出 $y' = (y - 1)(y - 3)$ 的平衡点，判断它们是否稳定，并描述解。

这里 $f(y) = (y - 1)(y - 3) = y^2 - 4y + 3$，在 $y = 1$ 和 $y = 3$ 处为 0：这些是平衡点。由于 $f'(y) = 2y - 4$， $f'(1) = -2 < 0$ 和 $f'(3) = 2 > 0$，因此 1 是稳定的，3 是不稳定的。

相线确认这一点并提供了更多信息。对于 $y < 1$，两个因子都是负的，因此 $f > 0$ 和解趋向于 1。对于 $1 < y < 3$， $f < 0$ 和解趋向于 1。对于 $y > 3$， $f > 0$ 和解远离 3，越来越快：它们无界增长，如图 13.1 所示。因此，所有从低于 3 开始的解都趋向于 1，所有从高于 3 开始的解都会逃离。

```check
f135 = (y - 1)*(y - 3)
same(expand(f135), y**2 - 4*y + 3); same_set(solve(f135, y), [1, 3])
same(diff(f135, y), 2*y - 4); same(diff(f135, y).subs(y, 1), -2); same(diff(f135, y).subs(y, 3), 2)
holds(f135.subs(y, 0) > 0); holds(f135.subs(y, 2) < 0); holds(f135.subs(y, 4) > 0)
```
:::

::: pitfall
平衡点是 $f(y) = 0$，而不是 $f'(y) = 0$；导数只决定稳定性。当 $f'(y^*) = 0$ 时，测试结果无意义： $y' = -y^3$， $y' = y^3$ 和 $y' = y^2$ 都有 $f'(0) = 0$，但第一个 0 是稳定的，第二个 0 是不稳定的，第三个 0 吸引其下方的解并排斥其上方的解（因此它是不稳定的）。应使用 $f$ 在两侧的符号来判断。

```check
for fq_ in (-y**3, y**3, y**2):
    same(diff(fq_, y).subs(y, 0), 0)
holds((-y**3).subs(y, Rational(1, 2)) < 0); holds((-y**3).subs(y, -Rational(1, 2)) > 0)       # towards 0 from both sides
holds((y**3).subs(y, Rational(1, 2)) > 0); holds((y**3).subs(y, -Rational(1, 2)) < 0)         # away from 0 on both sides
holds((y**2).subs(y, -Rational(1, 2)) > 0); holds((y**2).subs(y, Rational(1, 2)) > 0)         # up from below, up and away above
```
:::

第13.4节末尾的控件绘制五个方程，或您输入的方程，以及通过您点击的任意点的解的斜率场。

## 欧拉方法 {#euler}

大多数微分方程没有解析解的公式，而对于那些有解析解的方程，实际应用通常只需要数值解。最简单的数值方法将斜率场转化为一个算法。

从点$(t_0, y_0)$开始。该方程给出了该处解的斜率$F(t_0, y_0)$，因此你知道解在该点的切线。沿切线行进一小段时间$h$，即**步长**。由[第7.2节](module_07_ZH.html#linear-approximation)的线性近似，

$$y(t_0 + h) \approx y_0 + h\,F(t_0, y_0).$$

将这个值称为 $y_1$，新的时间称为 $t_1 = t_0 + h$。在 $(t_1, y_1)$ 处，方程给出一个新的斜率 $F(t_1, y_1)$；沿着这个斜率再前进一个长度为 $h$ 的步长，依此类推。

::: definition 欧拉方法
为了近似解 $y' = F(t, y)$， $y(t_0) = y_0$，选择一个步长 $h > 0$，并计算对于 $n = 0, 1, 2, \dots$，

$$\begin{aligned} t_{n+1} &= t_n + h, \\ y_{n+1} &= y_n + h\,F(t_n, y_n). \end{aligned}$$

数值 $y_n$ 是 $y(t_n)$ 的近似值。
:::

::: example 手动使用欧拉方法
使用欧拉法以 $h = 0.5$ 近似 $y(2)$ 在 $y' = t - y$, $y(0) = 1$ 下的值，并与例 13.1 的精确解进行比较。

这里 $F(t, y) = t - y$，从 $t = 0$ 到 $t = 2$ 采用四个步长为 0.5 的步骤。每一行计算 $(t_n, y_n)$ 处的斜率，并沿该斜率进行一步计算，即 $y_{n+1} = y_n + 0.5 \times \text{slope}$：

| $n$ | $t_n$ | $y_n$ | 斜率 $t_n - y_n$ | $y_{n+1}$ |
|---|---|---|---|---|
| 0 | 0 | 1 | $-1$ | 0.5 |
| 1 | 0.5 | 0.5 | 0 | 0.5 |
| 2 | 1 | 0.5 | 0.5 | 0.75 |
| 3 | 1.5 | 0.75 | 0.75 | 1.125 |
| 4 | 2 | 1.125 |  |  |

所以 $y(2) \approx y_4 = 1.125$。精确值为 $y(2) = 2 - 1 + 2e^{-2} = 1 + 2e^{-2} \approx 1.2707$，因此误差（精确值减去近似值）约为 0.146。每个近似值都偏低。原因是解是上凹的（$y'' = 2e^{-t} > 0$；模块 8），沿上凹曲线的切线进行一步计算会位于曲线之下。练习 13.10 证明了所有近似值在每一步都位于解的下方。

```check
F136 = lambda T, Y: T - Y
ts6, ys6 = [Integer(0)], [Integer(1)]
for _ in range(4):
    ys6.append(ys6[-1] + Rational(1, 2)*F136(ts6[-1], ys6[-1])); ts6.append(ts6[-1] + Rational(1, 2))
same(ts6, [0, Rational(1, 2), 1, Rational(3, 2), 2]); same(ys6, [1, Rational(1, 2), Rational(1, 2), Rational(3, 4), Rational(9, 8)])
same([F136(T, Y) for T, Y in zip(ts6[:4], ys6[:4])], [-1, 0, Rational(1, 2), Rational(3, 4)])
ex2 = y131.subs(t, 2)
same(ex2, 1 + 2*exp(-2)); rounds(ex2, '1.2707'); rounds(ex2 - Rational(9, 8), '0.146')
same(diff(y131, t, 2), 2*exp(-t))
for T_, Y_ in zip(ts6[1:], ys6[1:]):
    holds(y131.subs(t, T_) > Y_)                    # every approximation is below the solution
```
:::

::: figure id=fig-13-2
欧拉法用于 $y' = t - y$, $y(0) = 1$ 在其方向场（浅灰色）上的应用。用 $h = 0.5$（橙色）表示例 13.6 的四步结束于 1.125；用 $h = 0.25$（绿色）表示八步结束于 1.2002。精确值为 $y(2) = 1 + 2e^{-2} \approx 1.2707$（蓝色）。每一步都沿着其起始点的斜率进行。将步长减半大致将误差减半，从 $t = 2$ 的 0.146 减少到 0.070。
:::

```check
ys8 = [Integer(1)]; ts8 = [Integer(0)]
for _ in range(8):
    ys8.append(ys8[-1] + Rational(1, 4)*(ts8[-1] - ys8[-1])); ts8.append(ts8[-1] + Rational(1, 4))
same(ts8[-1], 2); rounds(ys8[-1], '1.2002'); rounds(ex2 - ys8[-1], '0.070')
```

### 误差如何依赖于步长 {#euler-error}

对于 $y' = y$, $y(0) = 1$，其解为 $e^t$，欧拉法尤为清晰。每一步计算 $y_{n+1} = y_n + h\,y_n = (1 + h)\,y_n$：它乘以 $1 + h$。因此 $y_n = (1 + h)^n$。达到 $t = 1$ 需要 $n = 1/h$ 步，因此欧拉法对 $y(1) = e$ 的近似值为 $(1 + h)^{1/h} = \big(1 + \tfrac1n\big)^n$：即模块 6 中的复利，每个步骤为一个复利周期。表格不断将 $h$ 减半；误差为 $e - (1 + h)^{1/h}$：

```valuetable
h = 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.001
$(1 + h)^{1/h}$ = (1 + h)**(1/h)
$\text{error}$ = E - (1 + h)**(1/h)
$\text{error}/h$ = (E - (1 + h)**(1/h))/h
digits = 4
---
h | (1 + h)^{1/h} | \text{error} | \text{error}/h
0.5 | 2.25 | 0.4683 | 0.9366
0.25 | 2.441 | 0.2769 | 1.108
0.125 | 2.566 | 0.1525 | 1.220
0.0625 | 2.638 | 0.08035 | 1.286
0.03125 | 2.677 | 0.04129 | 1.321
0.001 | 2.717 | 0.001358 | 1.358
```

每次将 $h$ 减半，误差大致也减半，误差除以 $h$ 趋于稳定，接近 $e/2 \approx 1.359$：对于小的 $h$，误差约为 $\tfrac{e}{2}h$。

```check
rounds(E/2, '1.359')
for hv_ in (Rational(1, 2), Rational(1, 4), Rational(1, 8), Rational(1, 16)):
    holds(Rational(16, 10) < (E - (1 + hv_)**(1/hv_))/(E - (1 + hv_/2)**(2/hv_)) < Rational(21, 10))   # halving h roughly halves the error
holds(Abs((E - Rational(1001, 1000)**1000)/Rational(1, 1000) - E/2) < Rational(2, 1000))
```

为何与$h$成正比？每一步都沿切线前进，而[第7.2节](module_07_ZH.html#how-good)指出（模块15已证明）]，在长度为$h$的步长内，切线与曲线偏离约$\tfrac{h^2}{2}y''$。因此，每一步产生量级为$h^2$的新误差。达到固定时间$T$需要$(T - t_0)/h$步，$(T - t_0)/h$个大小约为$\text{constant} \times h^2$的误差累加后约为常数乘以$h$。早期产生的误差也会被后续步骤携带，后者可能放大或缩小它们；这改变了常数但不改变$h$的幂次。对于$y' = y$上的$[0, 1]$，在时间$t$的步长产生约$\tfrac{h^2}{2}e^t$的误差，该方程在时间$t = 1$前将其放大$e^{1-t}$倍（$y' = y$的解像$e^t$一样发散）。因此，每一步贡献约$\tfrac{h^2}{2}e$，$1/h$步累加得$\tfrac{e}{2}h$：即表中常数。

```check
same(diff(exp(t), t, 2)*h**2/2*exp(1 - t), h**2/2*E); same(h**2/2*E*(1/h), E*h/2)
```

::: keyidea
欧拉方法具有 **阶 1**：在固定时间点，其误差约为一个常数乘以 $h$，即 $O(h)$，如 [第 4.7 节](module_04_ZH.html#truncation)] 中的记号。将 $h$ 粗略地减半，误差也大致减半，但工作量加倍；获得一个更精确的小数位需要大约十倍的步数。
:::

::: deeper 欧拉方法误差的上界
假设解 $y$ 的 $y' = F(t, y)$， $y(t_0) = y_0$，满足 $\abs{y''} \le M$ 在 $[t_0, T]$ 上，并且 $\abs{F_y(t, y)} \le L$ 对于 $t_0 \le t \le T$ 和每个 $y$，有 $L > 0$。则欧拉方法的误差 $e_n = y(t_n) - y_n$ 满足，每当 $t_n \le T$，

$$\abs{e_n} \le \frac{Mh}{2L}\Big(e^{L(t_n - t_0)} - 1\Big).$$

该上界与 $h$ 成正比。这是为什么。根据线性逼近的误差界（[第 7.2 节](module_07_ZH.html#how-good)；模块 15 证明了它）， $y(t_{n+1}) = y(t_n) + h\,y'(t_n) + \tau_n$ 与 $\abs{\tau_n} \le \tfrac{M}{2}h^2$，且 $y'(t_n) = F\big(t_n, y(t_n)\big)$。减去 $y_{n+1} = y_n + h\,F(t_n, y_n)$：

$$\begin{aligned} e_{n+1} &= e_n + \tau_n \\ &\quad + h\Big[F\big(t_n, y(t_n)\big) - F(t_n, y_n)\Big]. \end{aligned}$$

根据中值定理（模块 8），将 $F(t_n, y)$ 视为 $y$ 的函数，其在 $y_n$ 与 $y(t_n)$ 之间的某点处的导数为 $F_y$，乘以 $e_n$；因此其绝对值不超过 $L\abs{e_n}$，

$$\abs{e_{n+1}} \le (1 + hL)\abs{e_n} + \tfrac{M}{2}h^2.$$

从 $e_0 = 0$ 开始，应用此 $n$ 次。结合 $q = 1 + hL$，并计算总和 $1 + q + \dots + q^{n-1} = \dfrac{q^n - 1}{q - 1}$（展开 $(q - 1)(1 + q + \dots + q^{n-1})$ 即可看出），

$$\begin{aligned} \abs{e_n} &\le \frac{M}{2}h^2\,\frac{(1 + hL)^n - 1}{hL} \\ &= \frac{Mh}{2L}\Big((1 + hL)^n - 1\Big). \end{aligned}$$

最后，$1 + hL \le e^{hL}$，因为 $e^x$ 的图像在 0 点处位于其切线 $y = 1 + x$ 之上（它向上凹，模块 8）。所以 $(1 + hL)^n \le e^{nhL} = e^{L(t_n - t_0)}$。

该界值通常过于悲观。例如例 13.6 中， $F_y = -1$ 给出 $L = 1$， $y'' = 2e^{-t} \le 2$ 给出 $M = 2$；在 $t = 2$ 处的界值为 $(e^2 - 1)h \approx 6.4h$，而实际误差约为 $0.27h$。但它证明了误差为 $O(h)$。

```check
Fy_ = diff(t - y, y); same(Fy_, -1)
Mb, Lb, hb, en = symbols('M L h e_n', positive=True)
qb = 1 + hb*Lb
nb = symbols('n', integer=True, positive=True)
same(expand((qb - 1)*Sum(qb**k, (k, 0, nb - 1)).doit()), expand(qb**nb - 1))
same(Mb/2*hb**2*(qb**nb - 1)/(hb*Lb), Mb*hb/(2*Lb)*(qb**nb - 1))
same((Mb*hb/(2*Lb)*(exp(Lb*2) - 1)).subs({Mb: 2, Lb: 1}), (exp(2) - 1)*hb); rounds(exp(2) - 1, '6.4')
holds(exp(Rational(1, 3)) > 1 + Rational(1, 3)); holds(exp(Rational(2, 1)) > 3)
```
:::

### 龙格-库塔方法 {#rk4}

欧拉法在每一步只使用一个斜率，即起始点的斜率。更好的方法会在每一步的多个点上采样方向场并取平均值。最著名的是一种经典的 **四阶龙格–库塔方法**，称为 RK4：

$$\begin{aligned} k_1 &= F(t_n, y_n), \\ k_2 &= F\big(t_n + \tfrac{h}{2},\ y_n + \tfrac{h}{2}k_1\big), \\ k_3 &= F\big(t_n + \tfrac{h}{2},\ y_n + \tfrac{h}{2}k_2\big), \\ k_4 &= F(t_n + h,\ y_n + h\,k_3), \\ y_{n+1} &= y_n + \tfrac{h}{6}\big(k_1 + 2k_2 + 2k_3 + k_4\big). \end{aligned}$$

$k_1$ 是欧拉法在步长开始时的斜率；$k_2$ 和 $k_3$ 是步长中间的斜率，在使用 $k_1$ 和随后使用 $k_2$ 到达的点处；$k_4$ 是步长结束时的斜率。当 $F$ 仅依赖于 $t$，使得方程为 $y' = F(t)$，并且答案是一个积分时，$k_2 = k_3$，该步长使用辛普森法则（模块 11）对 $\int F(t)\,dt$ 在该步长上的积分进行近似。当 $F$ 是光滑函数时，RK4 在固定时间点的误差为 $O(h^4)$：将 $h$ 减半会使误差减少约 16 倍。这类方法的步长由程序在运行过程中自动调整，是数值软件中的标准方法。SciPy 中的 `solve_ivp` 函数是一个 Python 库，本系列未安装该库，除非特别说明，否则默认使用 RK45，这是一种五阶四阶的龙格–库塔方法。其每一步都进行两个估计，分别为五阶和四阶，它们的差值用于根据误差容限调整步长。

```check
Ft = Function('F')
tn_, hh_ = symbols('t_n h')
simp = hh_/6*(Ft(tn_) + 2*Ft(tn_ + hh_/2) + 2*Ft(tn_ + hh_/2) + Ft(tn_ + hh_))
same(simp, hh_/6*(Ft(tn_) + 4*Ft(tn_ + hh_/2) + Ft(tn_ + hh_)))        # Simpson's rule on [t_n, t_n + h]
same((h/2)**4/h**4, Rational(1, 16))
```

::: compute 欧拉法与 Python 中的 RK4
欧拉方法的函数及其在 $y' = t - y$、$y(0) = 1$ 处的误差，当 $t = 2$ 减半时为 $h$：

```python
import math

def euler(F, t, y, h, n):
    """n steps of Euler's method from (t, y) with step h; returns the last y."""
    for _ in range(n):
        y, t = y + h*F(t, y), t + h
    return y

F = lambda t, y: t - y                 # y' = t - y, y(0) = 1
exact = 1 + 2*math.exp(-2)             # y(2), from Example 13.1
for n in [10, 20, 40, 80]:
    h = 2/n
    err = exact - euler(F, 0, 1, h, n)
    print(f"h = {h:<6} error = {err:.6f}   error/h = {err/h:.4f}")
```

```output
h = 0.2    error = 0.055922   error/h = 0.2796
h = 0.1    error = 0.027517   error/h = 0.2752
h = 0.05   error = 0.013646   error/h = 0.2729
h = 0.025  error = 0.006795   error/h = 0.2718
```

将 $h$ 减半会使误差减半，误差除以 $h$ 后趋于 0.27。 (`y, t = y + h*F(t, y), t + h` 同时更新两个变量，右边使用旧值。) 现在考虑 RK4，在相同步长下：

```python
def rk4(F, t, y, h, n):
    """n steps of the classical Runge-Kutta method; returns the last y."""
    for _ in range(n):
        k1 = F(t, y)
        k2 = F(t + h/2, y + h/2*k1)
        k3 = F(t + h/2, y + h/2*k2)
        k4 = F(t + h, y + h*k3)
        y, t = y + h/6*(k1 + 2*k2 + 2*k3 + k4), t + h
    return y

for n in [10, 20, 40]:
    h = 2/n
    e1, e4 = exact - euler(F, 0, 1, h, n), exact - rk4(F, 0, 1, h, n)
    print(f"h = {h:<5} Euler error = {e1:.2e}   RK4 error = {e4:.2e}")
```

```output
h = 0.2   Euler error = 5.59e-02   RK4 error = -8.53e-06
h = 0.1   Euler error = 2.75e-02   RK4 error = -4.90e-07
h = 0.05  Euler error = 1.36e-02   RK4 error = -2.94e-08
```

RK4 的误差为负，因为它略微超调，每次将 $h$ 减半会使误差约除以 16（从 $8.5 \times 10^{-6}$ 到 $4.9 \times 10^{-7}$ 到 $2.9 \times 10^{-8}$）。RK4 每步需要对 $F$ 进行四次计算，因此比较相同工作量：RK4 用 $h = 0.2$ 时计算 $F$ 40 次，误差约为 $10^{-5}$；欧拉方法用 $h = 0.05$ 时也计算 $F$ 40 次，误差约为 $10^{-2}$。
:::

```check
import math as _m
def _euler(F_, t_, y_, h_, n_):
    for _ in range(n_):
        y_, t_ = y_ + h_*F_(t_, y_), t_ + h_
    return y_
def _rk4(F_, t_, y_, h_, n_):
    for _ in range(n_):
        k1_ = F_(t_, y_); k2_ = F_(t_ + h_/2, y_ + h_/2*k1_); k3_ = F_(t_ + h_/2, y_ + h_/2*k2_); k4_ = F_(t_ + h_, y_ + h_*k3_)
        y_, t_ = y_ + h_/6*(k1_ + 2*k2_ + 2*k3_ + k4_), t_ + h_
    return y_
_F = lambda T, Y: T - Y
_ex = 1 + 2*_m.exp(-2)
e4s = [_ex - _rk4(_F, 0, 1, 2/n_, n_) for n_ in (10, 20, 40)]
rounds(-e4s[0], '8.5e-6'); rounds(-e4s[1], '4.9e-7'); rounds(-e4s[2], '2.9e-8')
for k_ in range(2):
    holds(15 < e4s[k_]/e4s[k_ + 1] < 18)
holds(abs(e4s[0]) < 1e-5); rounds(_ex - _euler(_F, 0, 1, 0.05, 40), '0.01')
for n_ in (10, 20, 40, 80):
    holds(Rational(27, 100) < (_ex - _euler(_F, 0, 1, 2/n_, n_))/(2/n_) < Rational(28, 100))
rounds(2*exp(-2), '0.27'); rounds((_ex - _euler(_F, 0, 1, 2/80, 80))/(2/80), '0.27')      # the limit of error/h, and its last value
```

::: pitfall
步长过大可能使欧拉法失效，而不仅仅是误差较大。对于$y' = -20y$、$y(0) = 1$，解$e^{-20t}$衰减迅速。欧拉法计算$y_{n+1} = y_n - 20h\,y_n = (1 - 20h)\,y_n$，因此$y_n = (1 - 20h)^n$。当$h = 0.15$时，因子为$-2$，且近似值$1, -2, 4, -8, \dots$振荡愈发剧烈。它们像解一样衰减，仅当$\abs{1 - 20h} < 1$时，即对于$h < 0.1$。具有此类快速衰减部分的方程被称为**stiff**，数值软件对此有专门方法。

```check
same(1 - 20*Rational(15, 100), -2); same([(-2)**k_ for k_ in range(4)], [1, -2, 4, -8])
hpos = symbols('h', positive=True)
same(solve_univariate_inequality(Abs(1 - 20*hpos) < 1, hpos, relational=False), Interval.open(0, Rational(1, 10)))
```
:::

::: widget name=slope-field
选择一个方程，然后单击绘图，或使用 $t_0$ 和 $y_0$ 滑块，以选择一个起始点。蓝色曲线是通过该点的精确解，使用 RK4 计算得出；橙色点是步长为 $h$ 的欧拉法，直到结束时间 $T$（虚线），读数比较了两者在 $T$ 处的情况。通过 $y' = t - y$ 从 $(0, 1)$ 和 $h = 0.5$ 可以看到例 13.6。每次将 $h$ 滑块移动一个刻度：每个刻度使 $h$ 减半，误差也大致减半，且误差除以 $h$ 趋于稳定。从直线 $y = t - 1$ 开始：为什么欧拉法在那里是精确的？然后尝试从 $(0, 1)$ 得到的 $y' = y$，这给出了上面的表格，从几个高度得到的逻辑方程 $y' = y(1 - y)$，以及从 $t$ 轴下方的点得到的 $y' = t - y^2$。
:::

## 可分离方程 {#separable}

欧拉方法给出数值。一些方程可以用公式精确求解，最常见的类型如下。

::: definition 可分离方程
一阶微分方程是 **separable**，如果它可以写成

$$y' = g(t)\,h(y),$$

一个关于 $t$ 的函数乘以一个关于 $y$ 的函数。
:::

$y' = ky$, $y' = 2ty^2$, 冷却方程 $T' = -k(T - T_s)$ 以及混合罐方程是可分离的。 $y' = t - y$ 不是： $t - y$ 不是一个关于 $t$ 的函数与一个关于 $y$ 的函数的乘积（第 13.7 节用另一种方法求解）。

在莱布尼茨记号中，这种方法最快。将 $y'$ 写作 $\dfrac{dy}{dt}$，将包含 $y$ 的所有项移到一边，包含 $t$ 的所有项移到另一边，如同 $dy$ 和 $dt$ 是常数一样，然后两边积分：

$$\begin{aligned} \frac{dy}{dt} &= g(t)h(y), \\ \frac{dy}{h(y)} &= g(t)\,dt, \\ \int\frac{dy}{h(y)} &= \int g(t)\,dt. \end{aligned}$$

目前还没有办法像分数那样拆分 $\dfrac{dy}{dt}$：它是一个极限的符号（[第 4.2 节 ](module_04_ZH.html#derivative)]）。链式法则使得结果正确。

::: theorem 变量分离法
设 $g$ 在开区间 $I$ 上连续，且设 $h$ 在开区间 $J$ 上连续且恒不为零。设 $G$ 是 $g$ 在 $I$ 上的原函数，且 $H$ 是 $1/h$ 在 $J$ 上的原函数。一个在 $I$ 上可导且取值于 $J$ 的函数 $y$ 是 $y' = g(t)h(y)$ 的解，当且仅当对于某个常数 $C$，

$$H\big(y(t)\big) = G(t) + C \quad\text{for every } t \text{ in } I.$$
:::

::: proof
根据 [链式法则](module_05_ZH.html#chain)， $H\big(y(t)\big)$ 的导数是 $H'\big(y(t)\big)\,y'(t) = \dfrac{y'(t)}{h\big(y(t)\big)}$。由于 $h\big(y(t)\big) \ne 0$，方程 $y' = g(t)h(y)$ 在 $t$ 处成立当且仅当 $\dfrac{y'(t)}{h(y(t))} = g(t)$，即当

$$\frac{d}{dt}\Big[H\big(y(t)\big) - G(t)\Big] = 0.$$

一个在区间上每一点导数都为零的函数在该区间上是常数（这是中值定理的一个结果，模块 8），而常数的导数为零。因此， $y$ 在 $I$ 上是解当且仅当 $H\big(y(t)\big) - G(t)$ 是常数 $C$。
:::

```check
Hf, Gf, yy = Function('H'), Function('G'), Function('y')
same(diff(Hf(yy(t)) - Gf(t), t), Subs(Derivative(Hf(u), u), u, yy(t))*Derivative(yy(t), t) - Derivative(Gf(t), t))
```

::: keyidea
解 $y' = g(t)h(y)$：

1. 分离变量： $\dfrac{dy}{h(y)} = g(t)\,dt$，其中 $h(y) \ne 0$。
2. 两边积分；一边只需一个常数 $C$ 即可。
3. 解出 $y$，如果可以的话，并利用初始条件找出 $C$。
4. 寻找常数解 $y = y^*$ 与 $h(y^*) = 0$：它们是解，且步骤 1 没有找到它们。
:::

当 $g$ 连续且 $h$ 有连续导数时，这些步骤找到所有解。定理 13.1 适用，因为 $F = g(t)h(y)$ 和 $F_y = g(t)h'(y)$ 是连续的：一个解在某一时刻取值 $y^*$ 且 $h(y^*) = 0$ 时，将是常数解 $y^*$。因此，所有其他解保持 $h(y) \ne 0$，并且对 $h(y)$ 进行除法是允许的。如果没有对 $h'$ 的条件，这可能会失败： $y = t^3$ 解 $y' = 3y^{2/3}$（第 13.1 节）并通过 0，即 $h(y) = 3y^{2/3}$ 的一个零点。

```check
gfn, hfn = Function('g'), Function('h')
same(diff(gfn(t)*hfn(y), y), gfn(t)*Derivative(hfn(y), y))      # F_y = g(t) h'(y)
same(3*Integer(0)**Rational(2, 3), 0); same((t**3).subs(t, 0), 0)  # h(0) = 0, and t^3 passes through 0
```

::: example 一个解爆炸的情况
解 $y' = 2ty^2$，分别用 (a) $y(0) = 1$，(b) $y(0) = -1$，(c) $y(0) = 0$。

$g(t) = 2t$ 和 $h(y) = y^2$，其导数是连续的，因此，根据上面的段落，唯一在某处为 0 的解是常数解 $y = 0$。 (a) 和 (b) 的解从不为 0，因此可以除以 $y^2$。分离变量并积分：

$$\begin{aligned} \int \frac{dy}{y^2} &= \int 2t\,dt, \\ -\frac1y &= t^2 + C, \\ y &= -\frac{1}{t^2 + C}. \end{aligned}$$

**(a)** $y(0) = -\dfrac1C = 1$ 得到 $C = -1$，所以 $y = \dfrac{1}{1 - t^2}$。 公式对每个 $t \ne \pm1$ 都有意义，但解存在于一个区间内，包含 $t = 0$ 的区间是 $(-1, 1)$。当 $t$ 接近 1 或 $-1$ 时， $y$ 无界增长：解趋于爆炸（图 13.3）。图中 $\abs{t} > 1$ 部分属于方程的其他解，不属于这个解：它们与 $y(0) = 1$ 没有联系。

**(b)** $y(0) = -\dfrac1C = -1$ 得到 $C = 1$，所以 $y = -\dfrac{1}{1 + t^2}$，对每个 $t$ 都有定义。

**(c)** 没有常数 $C$ 能给出 $y(0) = 0$，因为 $-\dfrac{1}{t^2 + C}$ 永远不为 0。除以 $y^2$ 假设了 $y \ne 0$。常数函数 $y = 0$ 满足 $y' = 0 = 2t \cdot 0^2$，因此是一个解：这是该方法丢失的那个解。根据定理 13.1（$F = 2ty^2$ 和 $F_y = 4ty$ 在全实数范围内连续），这是唯一一个满足 $y(0) = 0$ 的解。

```check
same(integrate(1/y**2, y), -1/y); same(integrate(2*t, t), t**2)
same(solve(Eq(-1/y, t**2 + c), y), [-1/(t**2 + c)])
same(solve(Eq(-1/c, 1), c), [-1]); same(solve(Eq(-1/c, -1), c), [1])
ya = 1/(1 - t**2); yb = -1/(1 + t**2)
for sol_, y0_ in ((ya, 1), (yb, -1)):
    same(diff(sol_, t), 2*t*sol_**2); same(sol_.subs(t, 0), y0_)
holds(checkodesol(Eq(yf(t).diff(t), 2*t*yf(t)**2), Eq(yf(t), ya))[0])
limit_is(ya, t, 1, oo, '-'); limit_is(ya, t, -1, oo, '+')
same(diff(2*t*y**2, y), 4*t*y); same(solve(-1/(t**2 + c), t), [])
same(diff(0*t, t), 2*t*(0*t)**2)                    # (c): the constant solution y = 0
```
:::

::: figure id=fig-13-3
$y' = 2ty^2$的解（例13.7）在其方向场中。带有$y(0) = 1$、$y = 1/(1 - t^2)$（深蓝色）的解仅存在于$-1 < t < 1$；外部的虚线属于其他解。带有$y(0) = \tfrac14$、$y = 1/(4 - t^2)$的解持续到$t = \pm2$；带有$y(0) = -1$（橙色）的解对每个$t$均存在。常数解$y = 0$（绿色）是除以$y^2$时丢失的那个解。
:::

```check
same((1/(4 - t**2)).subs(t, 0), Rational(1, 4)); same(diff(1/(4 - t**2), t), 2*t*(1/(4 - t**2))**2)
```

::: pitfall
两个可分离变量方程的解法。第一，常数：从 $\ln\abs{y} = kt + C$，下一步是 $\abs{y} = e^{C}e^{kt}$，不是 $y = e^{kt} + C$；在指数化之前加上的常数会变成之后的因子。第二，除以 $h(y)$ 会丢失 $h(y) = 0$ 为 0 的解：每次都要寻找这些解。
:::

### 增长与衰减 {#growth-decay}

模块6验证了$Ce^{kt}$是$y' = ky$的解，并承诺没有其他解。分离变量法求出了永不为0的解：$\displaystyle\int\frac{dy}{y} = \int k\,dt$给出$\ln\abs{y} = kt + C$，因此$\abs{y} = e^Ce^{kt}$和$y = Ae^{kt}$带有$A = \pm e^C$，一个非0常数；丢失的解$y = 0$是$A = 0$的情况。但解是否可能在某些时候为0而在其他时候不为0，从而使得定理13.3在整个区间上不适用于它？定理13.1排除了这种情况，正如它对每个具有连续$h'$的可分离方程所做的那样。下一个定理直接证明了这一点，其论证过程从不除以$y$，也不需要定理13.1，而本系列并未证明该定理。

::: theorem 指数增长与衰减
设 $k$ 为常数， $I$ 为包含 $t_0$ 的开区间。一个可导函数 $y$ 满足 $y' = ky$ 在 $I$ 上当且仅当

$$y(t) = y(t_0)\,e^{k(t - t_0)} \quad\text{for every } t \text{ in } I.$$
:::

::: proof
若 $y(t) = y(t_0)e^{k(t - t_0)}$，则由链式法则得 $y' = ky$。反之，假设 $y' = ky$ 在 $I$ 上成立，令 $w(t) = y(t)e^{-kt}$。由乘积法则，

$$\begin{aligned} w' &= y'e^{-kt} - k\,y\,e^{-kt} \\ &= (y' - ky)\,e^{-kt} = 0 \end{aligned}$$

on $I$, 所以 $w$ 在 $I$ 上为常数 (模块 8): $w(t) = w(t_0)$, 即 $y(t)e^{-kt} = y(t_0)e^{-kt_0}$. 两边同乘以 $e^{kt}$.
:::

```check
yfun = Function('y'); t0s, y0s = symbols('t_0 y_0')
same(diff(yfun(t)*exp(-k*t), t), (Derivative(yfun(t), t) - k*yfun(t))*exp(-k*t))
same(diff(y0s*exp(k*(t - t0s)), t), k*y0s*exp(k*(t - t0s))); same((y0s*exp(k*(t - t0s))).subs(t, t0s), y0s)
same(y0s*exp(-k*t0s)*exp(k*t), y0s*exp(k*(t - t0s)))
```

一个变化率等于其大小乘以 $k$ 的量是 $y(t_0)e^{k(t - t_0)}$, 且除此之外别无他物: 如果 $k > 0$, 则呈指数增长; 如果 $k < 0$, 则呈指数衰减, 其倍增时间或半衰期为 $\ln 2/\abs{k}$ (模块 6).

### 牛顿冷却定律 {#cooling}

冷却方程 $T' = -k(T - T_s)$ 在以 $T_s$ 为温度基准时变为衰减方程. 设 $u = T - T_s$; 由于 $T_s$ 为常数, $u' = T' = -ku$. 根据定理 13.4, $u = u(0)e^{-kt}$, 即,

$$T(t) = T_s + \big(T(0) - T_s\big)e^{-kt}.$$

与环境的温差呈指数衰减: 温度趋近于 $T_s$, 即一个稳定平衡点, 但永远不会完全达到. 同样的平移可解所有形如 $y' = -k(y - A)$ 的方程, 其中 $k$ 和 $A$ 为常数: 自由下落物体 $v' = 9.8 - 0.2v = -0.2(v - 49)$ 和混合储罐 $y' = 0.6 - 0.03y = -0.03(y - 20)$ 是两个额外的例子 (练习 13.6).

```check
Ts, T0 = symbols('T_s T_0')
Tc = Ts + (T0 - Ts)*exp(-k*t)
same(diff(Tc, t), -k*(Tc - Ts)); same(Tc.subs(t, 0), T0)
same(Rational(98, 10) - Rational(2, 10)*v, -Rational(2, 10)*(v - 49)); same(Rational(6, 10) - Rational(3, 100)*y, -Rational(3, 100)*(y - 20))
```

::: keyidea
对于常数 $k > 0$ 和 $A$，方程 $y' = -k(y - A)$ 的解为 $y = A + \big(y(0) - A\big)e^{-kt}$。它以指数方式趋近于平衡点 $A$；在每个时间 $1/k$，称为 **时间常数**，它与 $A$ 的距离缩小为原来的 $e$ 倍。
:::

::: example 一杯正在冷却的茶
假设一杯茶初始温度为 90 °C，放在 20 °C 的房间中，5 分钟后温度降至 70 °C。假设符合牛顿冷却定律，求 $k$，即 15 分钟后的温度，以及茶温度降至 40 °C 时的时间。

根据公式，$T(t) = 20 + 70e^{-kt}$。在 $t = 5$：$70 = 20 + 70e^{-5k}$，所以 $e^{-5k} = \tfrac{50}{70} = \tfrac57$ 和

$$k = \frac{1}{5}\ln\frac75 \approx 0.0673 \text{ per minute}.$$

15 分钟后，$e^{-15k} = \big(e^{-5k}\big)^3 = \big(\tfrac57\big)^3$，所以 $T(15) = 20 + 70 \cdot \tfrac{125}{343} \approx 45.5$ °C。对于 40 °C，解方程 $20 + 70e^{-kt} = 40$：$e^{-kt} = \tfrac27$，所以

$$t = \frac{\ln(7/2)}{k} = \frac{5\ln 3.5}{\ln 1.4} \approx 18.6 \text{ minutes}.$$

前 20 摄氏度用了 5 分钟；接下来的 30 摄氏度大约需要 13.6 分钟。茶越接近室温，冷却速度越慢。

```check
kt_ = log(Rational(7, 5))/5
Ttea = 20 + 70*exp(-kt_*t)
same(Ttea.subs(t, 5), 70); rounds(kt_, '0.0673'); same(Rational(50, 70), Rational(5, 7))
same(Ttea.subs(t, 15), 20 + 70*Rational(125, 343)); rounds(Ttea.subs(t, 15), '45.5')
t40 = solve(Eq(Ttea, 40), t)
same(t40, [5*log(Rational(7, 2))/log(Rational(7, 5))]); same(log(Rational(7, 2))/kt_, 5*log(Rational(35, 10))/log(Rational(14, 10)))
rounds(t40[0], '18.6'); rounds(t40[0] - 5, '13.6')
```
:::

## 逻辑斯蒂方程 {#logistic}

指数增长不能一直持续。若种群按每年 5% 的连续增长率 $k = 0.05$ 增长，两个世纪后将达到原来的 $e^{0.05 \cdot 200} = e^{10} \approx 22{,}000$ 倍，但食物和空间远在那之前就会不足，增长将放缓。最简单的减速模型从人均增长率 $y'/y$ 出发，它在指数增长模型中是常数 $k$。在新模型中，该增长率随种群规模线性下降，从 $y$ 很小时的 $r$，降到 $y$ 达到**环境容纳量** $K$ 时的 0。因此 $y'/y = r(1 - y/K)$，即

$$y' = r\,y\Big(1 - \frac{y}{K}\Big),$$

其中常数 $r > 0$ 以时间单位（如 $k$）衡量，而 $K > 0$ 的单位与 $y$ 相同（例如动物数量）。这是 **逻辑斯蒂方程**。

```check
rounds(exp(10)/1000, '22'); same(Rational(5, 100)*200, 10)
```

它是自治的。其右侧 $f(y) = ry(1 - y/K)$ 在 $y = 0$、$y = K$ 以及 $f'(y) = r - 2ry/K$、$f'(0) = r > 0$ 和 $f'(K) = -r < 0$ 处为 0；由定理 13.2，0 是不稳定的，而 $K$ 是稳定的。在 0 与 $K$ 之间，$f > 0$ 及解趋向于 $K$ 上升；在 $K$ 之上，$f < 0$ 及它们趋向于它下降。小种群起初几乎呈指数增长，因为当 $y$ 远小于 $K$ 时 $y' \approx ry$ 成立；每个正种群都趋近于 $K$。

```check
rp, Kp = symbols('r K', positive=True)
flog = rp*y*(1 - y/Kp)
same_set(solve(flog, y), [0, Kp]); same(diff(flog, y), rp - 2*rp*y/Kp)
same(diff(flog, y).subs(y, 0), rp); same(diff(flog, y).subs(y, Kp), -rp)
```

为了解它，取 $0 < y_0 < K$，其中 $y_0 = y(0)$；然后 $0 < y < K$ 对所有 $t$ 成立（解不能穿过平衡点）。分离变量：

$$\int\frac{dy}{y(1 - y/K)} = \int r\,dt.$$

通过部分分式（模块 11），

$$\frac{1}{y(1 - y/K)} = \frac{K}{y(K - y)} = \frac{1}{y} + \frac{1}{K - y},$$

并且由于 $\displaystyle\int\frac{dy}{K - y} = -\ln\abs{K - y}$，左边为 $\ln y - \ln(K - y) = \ln\dfrac{y}{K - y}$（两者 $y$ 和 $K - y$ 都为正）。因此 $\ln\dfrac{y}{K - y} = rt + C$，并且

$$\frac{y}{K - y} = Ae^{rt}, \qquad A = e^C = \frac{y_0}{K - y_0},$$

来自 $t = 0$ 的 $A$ 的值。解出 $y$： $y = Ae^{rt}(K - y)$，因此 $y\big(1 + Ae^{rt}\big) = KAe^{rt}$；除以 $1 + Ae^{rt}$，然后将分子和分母都除以 $Ae^{rt}$：

$$y(t) = \frac{K}{1 + \dfrac{K - y_0}{y_0}\,e^{-rt}}.$$

代入方程可验证其成立，并表明同一公式对每个$y_0 > 0$且高于$K$的情况均为解；它对所有$t \ge 0$均有定义。其图像从较小的$y_0$开始，呈S形的**逻辑斯蒂曲线**（图13.4）。

```check
y0p = symbols('y_0', positive=True)
same(apart(1/(y*(1 - y/Kp)), y), 1/y - 1/(y - Kp)); same(1/y + 1/(Kp - y), Kp/(y*(Kp - y)))
same(integrate(1/(Kp - y), y).diff(y), 1/(Kp - y)); antideriv(-log(Kp - y), 1/(Kp - y), y)
same(solve(Eq(y/(Kp - y), c*exp(rp*t)), y), [Kp*c*exp(rp*t)/(c*exp(rp*t) + 1)])
ylog = Kp/(1 + (Kp - y0p)/y0p*exp(-rp*t))
same(simplify(Kp*c*exp(rp*t)/(c*exp(rp*t) + 1) - ylog.subs(y0p, Kp*c/(1 + c))), 0)
same(diff(ylog, t), rp*ylog*(1 - ylog/Kp)); same(ylog.subs(t, 0), y0p)
holds(checkodesol(Eq(yf(t).diff(t), rp*yf(t)*(1 - yf(t)/Kp)), Eq(yf(t), ylog))[0])
den_ = 1 + (Kp - y0p)/y0p*exp(-rp*t)                       # the denominator: K/y0 > 0 at t = 0, and for y0 > K
same(den_.subs(t, 0), Kp/y0p); same(diff(den_, t), rp*(y0p - Kp)/y0p*exp(-rp*t))   # it increases, so it stays positive for t >= 0
```

**最快增长。** 速率 $y' = ry(1 - y/K)$ 在 $y$ 中是一个向下的抛物线，最大值在 $y = K/2$ 处，此时为 $rK/4$。根据链式法则 $y'' = f'(y)\,y' = r\big(1 - \tfrac{2y}{K}\big)y'$，当 $y$ 超过 $K/2$ 时，符号发生变化：一个从 $K/2$ 下方开始的 logistic 曲线，其拐点位于环境承载力的一半，即在时间 $t^*$ 满足 $y(t^*) = K/2$，即 $\dfrac{K - y_0}{y_0}e^{-rt^*} = 1$，或

$$t^* = \frac1r\ln\frac{K - y_0}{y_0}.$$

```check
same(solve(diff(flog, y), y), [Kp/2]); same(flog.subs(y, Kp/2), rp*Kp/4)
same(simplify(diff(ylog, t, 2) - rp*(1 - 2*ylog/Kp)*diff(ylog, t)), 0)
tstar = log((Kp - y0p)/y0p)/rp
same(simplify(ylog.subs(t, tstar)), Kp/2)
```

::: example 湖中的鱼
假设一个湖可以支持 $K = 10{,}000$ 条某种鱼类，引入 1000 条，其种群遵循带有 $r = 0.5$ 年增长率的 logistic 方程。求 10 年后的种群数量，当其达到环境承载力的一半时，以及其最大增长率。

此时 $\dfrac{K - y_0}{y_0} = \dfrac{9000}{1000} = 9$，所以

$$y(t) = \frac{10{,}000}{1 + 9e^{-0.5t}}.$$

经过 10 年后，$y(10) = \dfrac{10{,}000}{1 + 9e^{-5}} \approx 9428$ 鱼。当 $9e^{-0.5t} = 1$ 达到容量的一半时，时间为 $t = 2\ln 9 \approx 4.39$ 年，之后种群增长最快，每年增长 $rK/4 = 0.5 \cdot 10{,}000/4 = 1250$ 条鱼。

```check
yfish = 10000/(1 + 9*exp(-t/2))
same(yfish, ylog.subs({Kp: 10000, y0p: 1000, rp: Rational(1, 2)})); rounds(yfish.subs(t, 10), '9428')
same(solve(Eq(yfish, 5000), t), [2*log(9)]); rounds(2*log(9), '4.39')
same(diff(yfish, t).subs(t, 2*log(9)), 1250); same(Rational(1, 2)*10000/4, 1250)
```
:::

::: figure id=fig-13-4
逻辑斯蒂增长 $y' = 0.5y(1 - y/10{,}000)$，其中 $y$ 以千为单位。从 $y(0) = 1000$（深蓝色，例 13.9）可知，种群遵循 S 型曲线，其拐点位于 $y = K/2$ 处，在 $2\ln 9 \approx 4.39$ 年之后。从 100 开始，S 型曲线出现较晚；从 6000 开始，在 $K/2$ 之上，曲线没有拐点；从 15,000 开始，在 $K$ 之上，种群数量趋向于 $K$ 下降。
:::

在机器学习中，带有$r = 1$、$K = 1$和$y(0) = \tfrac12$的逻辑斯谛曲线，即函数$\sigma(t) = \dfrac{1}{1 + e^{-t}}$（读作“t的sigma”），被称为**sigmoid**。因为它满足$y' = y(1 - y)$，其导数为$\sigma' = \sigma(1 - \sigma)$：一旦程序计算出$\sigma(t)$，求导仅需一次减法和一次乘法。

```check
sig = 1/(1 + exp(-t))
same(diff(sig, t), sig*(1 - sig)); same(sig.subs(t, 0), Rational(1, 2))
same(sig, ylog.subs({Kp: 1, rp: 1, y0p: Rational(1, 2)}))
```

::: pitfall
注意 $\displaystyle\int\frac{dy}{K - y} = -\ln\abs{K - y} + C$ 中的符号：根据链式法则， $\ln\abs{K - y}$ 的导数是 $-\dfrac{1}{K - y}$。符号错误会导致得到 $\ln\big(y(K - y)\big) = rt + C$，其解不会在 $K$ 处趋于稳定；方向场中，所有解都趋向于 $K$，从而发现这个错误。

```check
same(diff(log(Kp - y), y), -1/(Kp - y))
```
:::

## 一阶线性方程 {#linear}

例 13.1 验证了 $y = t - 1 + Ce^{-t}$ 是 $y' = t - y$ 的解。但你是如何找到这个公式的？你如何知道没有其他解？这个方程不可分离。它属于另一类方程，有其自身的解法。

::: definition 一阶线性方程
一阶微分方程称为 **线性**，如果它可以写成 **标准形式**

$$y' + p(t)\,y = q(t),$$

其中 $p$ 和 $q$ 是 $t$ 的函数。
:::

"线性" 指 $y$ 和 $y'$：每个变量都是一次方，未被相乘，也未被包含在另一函数中。 $y' = t - y$ 是线性的，标准形式为 $y' + y = t$，因此 $p(t) = 1$ 和 $q(t) = t$ 也是线性的；冷却方程、自由落体方程和混合槽方程也是如此。 $y' = 2ty^2$ 和逻辑斯蒂方程不是线性的。

左边 $y' + py$ 看起来几乎像是乘积法则的结果。将方程乘以一个函数 $\mu(t)$（读作 "mu of t"），仍需选择： $\mu y' + \mu p\,y = \mu q$。若 $\mu' = \mu p$，左边就恰好等于 $(\mu y)' = \mu y' + \mu' y$。函数 $\mu = e^{P(t)}$，其中 $P$ 是 $p$ 的原函数，这样做：根据链式法则， $\mu' = e^{P}P' = \mu p$。然后方程表示 $(\mu y)' = \mu q$，积分后得到 $\mu y$。

::: theorem 一阶线性方程
设 $p$ 和 $q$ 在开区间 $I$ 上连续。取 $P$ 为 $p$ 在 $I$ 上的原函数，记 $\mu = e^{P}$ 为**积分因子**，并取 $R$ 为 $\mu q$ 在 $I$ 上的原函数。则 $y' + p(t)y = q(t)$ 在 $I$ 上的全部解恰为下列函数：

$$y = \frac{R(t) + C}{\mu(t)}, \qquad C \text{ a constant}.$$

对于 $I$ 中的每一个 $t_0$ 和每一个数 $y_0$，恰好有一个满足 $y(t_0) = y_0$，且它在整个 $I$ 上都有定义。
:::

::: proof
抗导数 $P$ 和 $R$ 存在是因为 $p$ 和 $\mu q$ 是连续的（微积分基本定理，模块 10）。函数 $\mu$ 是正的，而 $\mu' = p\mu$ 由链式法则得出。对于任何在 $I$ 上可导的 $y$，乘积法则给出 $(\mu y)' = \mu y' + p\mu y = \mu(y' + py)$。由于 $\mu \ne 0$，当 $y$ 在 $I$ 上成立时，即当 $(\mu y)' = \mu q = R'$，也就是当 $(\mu y - R)' = 0$，即当 $\mu y - R$ 是常数 $C$ 在 $I$ 上（模块 8）。这是公式。条件 $y(t_0) = y_0$ 恰好对应一个常数 $C = \mu(t_0)y_0 - R(t_0)$。
:::

```check
pf, qf, Pf = Function('p'), Function('q'), Function('P')
muf = exp(Pf(t))
same(diff(muf, t).subs(Derivative(Pf(t), t), pf(t)), pf(t)*muf)
same(diff(muf*yfun(t), t).subs(Derivative(Pf(t), t), pf(t)), muf*(Derivative(yfun(t), t) + pf(t)*yfun(t)))
Rf, C0 = Function('R'), symbols('C')
same(solve(Eq((Rf(t0s) + C0)/exp(Pf(t0s)), y0s), C0), [exp(Pf(t0s))*y0s - Rf(t0s)])
```

比较定理 13.1：对于线性方程，解在整个 $p$ 和 $q$ 连续的区间上都存在。线性方程不会像 $y = 1/(1 - t^2)$ 那样“爆炸”。

::: keyidea
解 $y' + p(t)y = q(t)$：

1. 将方程化为标准形式，使 $y'$ 系数为 1。
2. 计算 $\mu = e^{\int p\,dt}$；任何原函数都可以，因此省略常数。
3. 将方程乘以 $\mu$：左边为 $(\mu y)'$。
4. 两边积分，加上常数 $C$，再除以 $\mu$。
:::

::: example 求解 $y' = t - y$
求 $y' = t - y$ 的通解。

标准形式为 $y' + y = t$，因此 $p = 1$ 和 $\mu = e^{t}$。乘以 $e^t$，左边变为乘积的导数：

$$\begin{aligned} e^t y' + e^t y &= te^t, \\ \big(e^t y\big)' &= te^t. \end{aligned}$$

分部积分（模块 11），设 $u = t$ 和 $dv = e^t\,dt$：$\displaystyle\int te^t\,dt = te^t - \int e^t\,dt = (t - 1)e^t + C$。因此 $e^t y = (t - 1)e^t + C$，且

$$y = t - 1 + Ce^{-t}.$$

这是例题 13.1 的解族，通过推导而非猜测得到，根据定理 13.5，没有其他解。

```check
same(diff(exp(t)*yfun(t), t), exp(t)*(Derivative(yfun(t), t) + yfun(t)))
steps(Integral(t*exp(t), t), t*exp(t) - Integral(exp(t), t), (t - 1)*exp(t))
antideriv((t - 1)*exp(t), t*exp(t), t)
same(((t - 1)*exp(t) + c)/exp(t), t - 1 + c*exp(-t))
same(dsolve(Eq(yf(t).diff(t), t - yf(t))).rhs.subs('C1', c), t - 1 + c*exp(-t))
```
:::

::: example 一个正在注水的水箱
例题 13.3 中的水箱重新开始，现在水箱内有 100 升纯水，最多可容纳 200 升。盐水以每升 0.2 千克盐的流速流入，流速为 3 升/分钟，但混合液流出的速度仅为 2 升/分钟。当水箱注满时，其中含有多少盐？

体积每分钟增加 1 升，因此经过 $t$ 分钟后体积为 $100 + t$ 升，储水罐在 $t = 100$ 时满。浓度为 $\dfrac{y}{100 + t}$，因此盐以 $\dfrac{2y}{100 + t}$ 千克每分钟的速度流出，并且

$$y' = 0.6 - \frac{2y}{100 + t}, \qquad y(0) = 0.$$

这个方程是线性的但不是自治的。标准形式为 $y' + \dfrac{2}{100 + t}\,y = 0.6$。对于 $t > -100$， $p$ 的一个原函数是 $2\ln(100 + t)$，因此

$$\mu = e^{2\ln(100 + t)} = (100 + t)^2.$$

然后 $\big((100 + t)^2y\big)' = 0.6(100 + t)^2$，积分后 $(100 + t)^2y = 0.2(100 + t)^3 + C$。在 $t = 0$ 时： $0 = 0.2 \cdot 10^6 + C$，因此 $C = -200{,}000$ 并且

$$y = 0.2(100 + t) - \frac{200{,}000}{(100 + t)^2}.$$

当储水罐满时，盐的量为 $y(100) = 40 - \dfrac{200{,}000}{40{,}000} = 35$ 千克，浓度为 $35/200 = 0.175$ 千克每升，仍低于流入的 0.2。

```check
p1311 = 2/(100 + t)
same(integrate(p1311, t), 2*log(t + 100)); same(exp(2*log(100 + t)), (100 + t)**2)
antideriv(Rational(1, 5)*(100 + t)**3, Rational(6, 10)*(100 + t)**2, t)
same(solve(Eq(0, Rational(1, 5)*100**3 + c), c), [-200000])
ytank = Rational(1, 5)*(100 + t) - 200000/(100 + t)**2
same(diff(ytank, t), Rational(6, 10) - 2*ytank/(100 + t)); same(ytank.subs(t, 0), 0)
same(ytank.subs(t, 100), 35); same(Rational(35, 200), Rational(175, 1000))
holds(checkodesol(Eq(yf(t).diff(t), Rational(3, 5) - 2*yf(t)/(100 + t)), Eq(yf(t), ytank))[0])
```
:::

::: example 给电容器充电
在一个电路中，一个 $R$ 欧姆的电阻器和一个 $C$ 法拉的电容器串联连接到一个恒定电压为 $E$ 伏特的电池上。电阻器两端的电压 $Ri$ 与电流 $i = q'$，以及电容器两端的电压 $q/C$ 与电容器上的电荷 $q$，加起来等于电池的电压：

$$Rq' + \frac{q}{C} = E.$$

假设 $R = 10{,}000$ 欧姆， $C = 100$ 微法拉 $= 10^{-4}$ 法拉， $E = 5$ 伏特，且电容器初始未充电。求 $q(t)$ 和电容器上的电压。

除以 $R$: $q' + \dfrac{q}{RC} = \dfrac{E}{R}$。这里 $RC = 10^4 \cdot 10^{-4} = 1$ 秒和 $E/R = 5 \times 10^{-4}$ 安培，因此，以 $t$ 为秒， $q' + q = 5 \times 10^{-4}$，和 $\mu = e^t$。然后 $(e^tq)' = 5 \times 10^{-4}e^t$，和 $e^tq = 5 \times 10^{-4}e^t + A$，其中常数称为 $A$，因为 $C$ 已被使用。所以 $q = 5 \times 10^{-4} + Ae^{-t}$，和 $q(0) = 0$ 给出 $A = -5 \times 10^{-4}$:

$$\begin{aligned} q(t) &= 5 \times 10^{-4}\big(1 - e^{-t}\big) \text{ coulombs}, \\ \frac{q}{C} &= 5\big(1 - e^{-t}\big) \text{ volts}. \end{aligned}$$

1 秒后电容器电压为 $5(1 - e^{-1}) \approx 3.16$ 伏特，达到 5 伏特的 63%；5 秒后约为 4.97 伏特。

```check
Rr, Cc, Ee = 10**4, Rational(1, 10**4), 5
same(Rr*Cc, 1); same(Rational(Ee, Rr), Rational(5, 10**4))
qc = Rational(5, 10**4)*(1 - exp(-t))
same(Rr*diff(qc, t) + qc/Cc, Ee); same(qc.subs(t, 0), 0)
same(solve(Eq(Rational(5, 10**4) + c, 0), c), [-Rational(5, 10**4)])
same(qc/Cc, 5*(1 - exp(-t))); rounds(5*(1 - exp(-1)), '3.16'); rounds(100*(1 - exp(-1)), '63'); rounds(5*(1 - exp(-5)), '4.97')
```
:::

一般解为 $q = CE\big(1 - e^{-t/(RC)}\big)$: 乘积 $\tau = RC$（读作“tau”），以秒为单位，是电路的时间常数，如第 13.5 节的关键思想所示。此类电路是最简单的 **低通滤波器**: 它跟随输入电压的缓慢变化并平滑快速变化（练习 13.12）。

```check
Rs, Cs, Es = symbols('R C E', positive=True)
qg = Cs*Es*(1 - exp(-t/(Rs*Cs)))
same(Rs*diff(qg, t) + qg/Cs, Es); same(qg.subs(t, 0), 0)
```

::: pitfall
两个使用积分因子的题目。计算 $\mu$ 时，从标准形式进行：对于 $2y' + 4y = 6$，先除以 2，因此得到 $p = 2$ 和 $\mu = e^{2t}$，而不是 $e^{4t}$。同时，也要将常数除以 $\mu$：从 $\mu y = R + C$，得到 $y = \dfrac{R}{\mu} + \dfrac{C}{\mu}$。在例题 13.10 中，若忘记这一点，则得到 $t - 1 + C$ 而不是 $t - 1 + Ce^{-t}$，且 $y = t - 1 + C$ 不是解，除非 $C = 0$。

```check
y2p = Function('w')
same(solve(Eq(2*Derivative(y2p(t), t) + 4*y2p(t), 6), Derivative(y2p(t), t)), [3 - 2*y2p(t)])
same(exp(integrate(2, t)), exp(2*t)); same(diff(exp(2*t)*y2p(t), t), exp(2*t)*(Derivative(y2p(t), t) + 2*y2p(t)))   # mu = e^(2t)
same(diff(t - 1 + c, t) - (t - (t - 1 + c)), c)
```
:::

## 二阶线性方程 {#second-order}

拉动弹簧一端的物体后松手，物体会来回振动，振幅逐渐减小，最后静止。设 $m$ 千克的物体放在光滑水平桌面上并连接弹簧，$x(t)$ 表示 $t$ 秒后相对平衡位置的位移，单位为米。弹簧伸长时位移为正，压缩时为负。物体受到两个力。弹簧施加与位移成正比、方向相反的回复力 $-kx$（**胡克定律**）。常数 $k > 0$ 是劲度系数，单位为牛顿每米。阻尼器（例如汽车减振器）施加与速度成正比、方向相反的阻力 $-cx'$，其**阻尼系数**为 $c \ge 0$，单位为牛顿秒每米。合力等于质量乘以加速度，所以 $mx'' = -kx - cx'$，即

$$mx'' + cx' + kx = 0.$$

用电荷代替位移的相同方程，描述一个包含电感器、电阻器和电容器的电路： $Lq'' + Rq' + q/C = 0$。

**无阻尼。**有 $c = 0$ 时，方程表示 $x'' = -\tfrac{k}{m}x$：二阶导数是函数的负倍数。例13.2提示应尝试什么：带 $\omega = \sqrt{k/m}$（读作“角频率”），$(\cos\omega t)'' = -\omega^2\cos\omega t$ 和 $(\sin\omega t)'' = -\omega^2\sin\omega t$，因此 $x = C_1\cos\omega t + C_2\sin\omega t$ 是一个解。质量将永远振动，其周期为 $2\pi/\omega = 2\pi\sqrt{m/k}$：**简谐运动**。更硬的弹簧或更轻的质量振动得更快。

长度为 $\ell$ 的单摆遵循 $\theta'' = -\tfrac{g}{\ell}\sin\theta$，其中 $\theta$ 是其与竖直方向的夹角。对于小幅度摆动，将 $\sin\theta$ 用 $\theta$（第 7.2 节）代替，得到 $\theta'' = -\tfrac{g}{\ell}\theta$，即相同方程，只不过 $\omega = \sqrt{g/\ell}$：只要摆动幅度保持小，无论幅度大小，单摆的周期都是 $2\pi\sqrt{\ell/g}$。

```check
mp_, kp_ = symbols('m k', positive=True)
w_ = sqrt(kp_/mp_)
xsh = C1*cos(w_*t) + C2*sin(w_*t)
same(mp_*diff(xsh, t, 2) + kp_*xsh, 0); same(2*pi/w_, 2*pi*sqrt(mp_/kp_))
gl_, ell_ = symbols('g ell', positive=True)
thp = C1*cos(sqrt(gl_/ell_)*t) + C2*sin(sqrt(gl_/ell_)*t)
same(diff(thp, t, 2), -gl_/ell_*thp); same(2*pi/sqrt(gl_/ell_), 2*pi*sqrt(ell_/gl_))   # the small-angle pendulum
```

**一般方程。** 弹簧方程是

$$ay'' + by' + cy = 0,$$

带有常数 $a \ne 0$、$b$ 和 $c$ 的二阶 **线性齐次方程，系数为常数**（“齐次”是因为右边为 0）。两个事实使其易于处理。

::: theorem 叠加原理
如果 $y_1$ 和 $y_2$ 是 $ay'' + by' + cy = 0$ 的解，那么对于所有常数 $C_1$ 和 $C_2$，$C_1y_1 + C_2y_2$ 也是解。
:::

::: proof
设 $Y = C_1y_1 + C_2y_2$。和的导数与常数倍的导数分别是导数的和与常数倍（模块 4），因此 $Y' = C_1y_1' + C_2y_2'$ 和 $Y'' = C_1y_1'' + C_2y_2''$。将含有 $C_1$ 的项与含有 $C_2$ 的项合并：

$$\begin{aligned} &aY'' + bY' + cY \\ &\quad= C_1\big(ay_1'' + by_1' + cy_1\big) \\ &\qquad + C_2\big(ay_2'' + by_2' + cy_2\big) \\ &\quad= C_1 \cdot 0 + C_2 \cdot 0 = 0. \end{aligned}$$
:::

::: theorem $ay'' + by' + cy = 0$ 的存在性与唯一性
设 $a \ne 0$、$b$ 和 $c$ 为常数。对任意数 $t_0$、$y_0$ 和 $v_0$，方程 $ay'' + by' + cy = 0$ 都有一个满足 $y(t_0) = y_0$ 和 $y'(t_0) = v_0$ 的解，定义于每个 $t$，且此解唯一：在含 $t_0$ 的任何开区间上，满足这两个初值的解都与它重合。
:::

就像定理 13.1 一样，这个级数使用定理而不加证明，尽管下面定理 13.8 的公式可以证明存在性部分。它说明解由两个数决定，即初始位置和初始速度，这也是为何出现两个常数的原因。

```check
y1f, y2f = Function('y1'), Function('y2')
L_ = lambda Y: a*diff(Y, t, 2) + b*diff(Y, t) + c*Y
same(expand(L_(C1*y1f(t) + C2*y2f(t)) - C1*L_(y1f(t)) - C2*L_(y2f(t))), 0)
```

**尝试指数函数。** 指数函数在求导时保持其形状，因此尝试 $y = e^{rt}$。然后 $y' = re^{rt}$ 和 $y'' = r^2e^{rt}$，

$$ay'' + by' + cy = \big(ar^2 + br + c\big)e^{rt}.$$

由于 $e^{rt}$ 永远不为 0，$y = e^{rt}$ 是解当且仅当

$$ar^2 + br + c = 0,$$

微分方程的 **特征方程**。其根为 $r = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$，且判别式 $b^2 - 4ac$ 的符号决定了解的形态。

```check
same(L_(exp(r*t)), (a*r**2 + b*r + c)*exp(r*t))
```

::: theorem $ay'' + by' + cy = 0$ 的解
设 $a \ne 0$、$b$ 和 $c$ 为常数。微分方程 $ay'' + by' + cy = 0$ 的每一个解都具有如下形式，其中 $C_1$ 和 $C_2$ 为某些常数，且每种这种形式的函数都是解。

1. 若 $b^2 - 4ac > 0$，特征方程有两个实根 $r_1 \ne r_2$，和 $y = C_1e^{r_1t} + C_2e^{r_2t}$。
2. 若 $b^2 - 4ac = 0$，它有一个根 $r = -\dfrac{b}{2a}$，和 $y = (C_1 + C_2t)\,e^{rt}$。
3. 若 $b^2 - 4ac < 0$，它没有实根，而是 $y = e^{\alpha t}\big(C_1\cos\beta t + C_2\sin\beta t\big)$，其中 $\alpha = -\dfrac{b}{2a}$ 和 $\beta = \dfrac{\sqrt{4ac - b^2}}{2a}$（读作“阿尔法”和“贝塔”）。
:::

::: proof
**每个公式都是解。** 根据定理13.6，只需检查每个公式所结合的两个函数。在情况1中， $e^{r_1t}$ 和 $e^{r_2t}$ 是解，如上所示。在情况2中， $e^{rt}$ 也是解；对于 $y = te^{rt}$，乘积法则给出 $y' = (1 + rt)e^{rt}$ 和 $y'' = (2r + r^2t)e^{rt}$，因此

$$\begin{aligned} &ay'' + by' + cy \\ &\quad= \Big[\big(ar^2 + br + c\big)t + (2ar + b)\Big]e^{rt} \\ &\quad= 0, \end{aligned}$$

因为 $ar^2 + br + c = 0$ 和 $2ar + b = 0$ 当 $r = -b/(2a)$。在情况3中，对于 $y = e^{\alpha t}\cos\beta t$，

$$\begin{aligned} y' &= e^{\alpha t}\big(\alpha\cos\beta t - \beta\sin\beta t\big), \\ y'' &= e^{\alpha t}\big((\alpha^2 - \beta^2)\cos\beta t \\ &\qquad - 2\alpha\beta\sin\beta t\big), \end{aligned}$$

所以 $ay'' + by' + cy = e^{\alpha t}\big(P\cos\beta t - Q\sin\beta t\big)$，其中

$$\begin{aligned} P &= a(\alpha^2 - \beta^2) + b\alpha + c, \\ Q &= (2a\alpha + b)\beta. \end{aligned}$$

这里 $2a\alpha + b = 0$，因此 $Q = 0$；并且由于 $a\alpha^2 = \dfrac{b^2}{4a}$， $a\beta^2 = \dfrac{4ac - b^2}{4a}$ 和 $b\alpha = -\dfrac{b^2}{2a}$，

$$P = \frac{b^2}{4a} - \frac{4ac - b^2}{4a} - \frac{b^2}{2a} + c = 0.$$

同样的计算适用于 $e^{\alpha t}\sin\beta t$。

**每个解都有这种形式。** 设 $y$ 为任意一个解，假设它在包含 0 的区间上定义（在另一个区间上，用该区间内的某一点代替 0；代数运算相同，只需额外乘上指数因子）。在每种情况下，选择常数使得公式在 $t = 0$ 处与 $y$ 有相同的值和导数。在情况 1 中这意味着 $C_1 + C_2 = y(0)$ 和 $r_1C_1 + r_2C_2 = y'(0)$，由于 $r_1 \ne r_2$ 可以求解；在情况 2 中是 $C_1 = y(0)$ 和 $rC_1 + C_2 = y'(0)$；在情况 3 中是 $C_1 = y(0)$ 和 $\alpha C_1 + \beta C_2 = y'(0)$，由于 $\beta \ne 0$ 可以求解。然后 $y$ 和公式解同一个初值问题，因此根据定理 13.7， $y$ 在其区间上与公式一致。
:::

```check
rr0 = -b/(2*a)
same(L_(t*exp(r*t)), ((a*r**2 + b*r + c)*t + (2*a*r + b))*exp(r*t)); same(2*a*rr0 + b, 0)
same(diff(t*exp(r*t), t), (1 + r*t)*exp(r*t)); same(diff(t*exp(r*t), t, 2), (2*r + r**2*t)*exp(r*t))
al, be = symbols('alpha beta')
yc_ = exp(al*t)*cos(be*t)
same(diff(yc_, t), exp(al*t)*(al*cos(be*t) - be*sin(be*t))); same(diff(yc_, t, 2), exp(al*t)*((al**2 - be**2)*cos(be*t) - 2*al*be*sin(be*t)))
same(L_(yc_), exp(al*t)*((a*(al**2 - be**2) + b*al + c)*cos(be*t) - (2*a*al + b)*be*sin(be*t)))
ap_ = symbols('a', positive=True); bq_, cq_ = symbols('b c', real=True)
al3, be3 = -bq_/(2*ap_), sqrt(4*ap_*cq_ - bq_**2)/(2*ap_)
steps(ap_*(al3**2 - be3**2) + bq_*al3 + cq_, bq_**2/(4*ap_) - (4*ap_*cq_ - bq_**2)/(4*ap_) - bq_**2/(2*ap_) + cq_, 0)
same(2*ap_*al3 + bq_, 0); same(ap_*al3**2, bq_**2/(4*ap_)); same(ap_*be3**2, (4*ap_*cq_ - bq_**2)/(4*ap_)); same(bq_*al3, -bq_**2/(2*ap_))
Lp = lambda Y: ap_*diff(Y, t, 2) + bq_*diff(Y, t) + cq_*Y
same(Lp(exp(al3*t)*sin(be3*t)), 0); same(Lp(exp(al3*t)*cos(be3*t)), 0)
r1_, r2_ = symbols('r1 r2'); u0_, v0_ = symbols('u0 v0')
holds(Matrix([[1, 1], [r1_, r2_]]).det() == r2_ - r1_)
holds(Matrix([[1, 0], [al, be]]).det() == be)
```

在情况 3 中特征方程没有实根。在复数域中，其中 $i^2 = -1$，其根为 $\alpha \pm \beta i$，模块 15 展示了如何利用欧拉公式 $e^{i\theta} = \cos\theta + i\sin\theta$，由 $e^{(\alpha + \beta i)t}$ 得到 $e^{\alpha t}\cos\beta t$ 和 $e^{\alpha t}\sin\beta t$。这里它们被直接验证，这正是证明所需要的。

**弹簧再次出现。** 对于 $mx'' + cx' + kx = 0$ 与 $m > 0$，$k > 0$ 和 $c \ge 0$，判别式是 $c^2 - 4mk$，并且三种情况有名称：

- **过阻尼**， $c^2 > 4mk$：两个负根（它们的和 $-c/m$ 为负，乘积 $k/m$ 为正），因此 $x$ 是两个衰减指数函数的组合，不发生振荡。
- **临界阻尼**， $c^2 = 4mk$： $x = (C_1 + C_2t)e^{-ct/(2m)}$，也不发生振荡。
- **欠阻尼**， $c^2 < 4mk$： $x = e^{-ct/(2m)}\big(C_1\cos\beta t + C_2\sin\beta t\big)$ 与 $\beta = \sqrt{4mk - c^2}/(2m)$，一个振荡幅度逐渐减小如 $e^{-ct/(2m)}$ 的情况。当 $c = 0$ 时，为简谐运动。

```check
cd_ = symbols('c', nonnegative=True)
rts = solve(mp_*r**2 + cd_*r + kp_, r)
same(rts[0] + rts[1], -cd_/mp_); same(expand(rts[0]*rts[1]), kp_/mp_)
same(solve((mp_*r**2 + cd_*r + kp_).subs(cd_, 2*sqrt(mp_*kp_)), r), [-2*sqrt(mp_*kp_)/(2*mp_)])   # critical: the one root -c/(2m)
same((sqrt(4*a*c - b**2)/(2*a)).subs({a: mp_, b: cd_, c: kp_}, simultaneous=True), sqrt(4*mp_*kp_ - cd_**2)/(2*mp_))
same(-cd_/(2*mp_), (-b/(2*a)).subs({a: mp_, b: cd_}))
```

::: example 一个欠阻尼弹簧
一个质量为 1 kg 的物体连接到一个劲度系数为 $k = 5$ N/m、阻尼系数为 $c = 2$ N·s/m 的弹簧上。将其从平衡位置拉 1 m 后释放，因此 $x(0) = 1$ 和 $x'(0) = 0$。求 $x(t)$。

方程是 $x'' + 2x' + 5x = 0$，其特征方程是 $r^2 + 2r + 5 = 0$。其判别式是 $4 - 20 = -16 < 0$，因此运动是欠阻尼的，具有 $\alpha = -\tfrac22 = -1$ 和 $\beta = \tfrac{\sqrt{16}}{2} = 2$：

$$x = e^{-t}\big(C_1\cos 2t + C_2\sin 2t\big).$$

$x(0) = C_1 = 1$. 根据乘积法则， $x' = e^{-t}\big((2C_2 - C_1)\cos 2t - (C_2 + 2C_1)\sin 2t\big)$，因此 $x'(0) = 2C_2 - C_1 = 0$，且 $C_2 = \tfrac12$：

$$x = e^{-t}\Big(\cos 2t + \tfrac12\sin 2t\Big).$$

质量每 $\pi/2$ 秒通过一次平衡位置，一次完整振动需要 $\pi$ 秒，摆动的幅度按 $e^{-t}$ 的比例衰减。

```check
x1313 = exp(-t)*(cos(2*t) + sin(2*t)/2)
same(4 - 20, -16); same(solve(r**2 + 2*r + 5, r), [-1 - 2*I, -1 + 2*I])
xg_ = exp(-t)*(C1*cos(2*t) + C2*sin(2*t))
same(diff(xg_, t), exp(-t)*((2*C2 - C1)*cos(2*t) - (C2 + 2*C1)*sin(2*t)))
same(solve([xg_.subs(t, 0) - 1, diff(xg_, t).subs(t, 0)], [C1, C2]), {C1: 1, C2: Rational(1, 2)})
same(diff(x1313, t, 2) + 2*diff(x1313, t) + 5*x1313, 0); same(x1313.subs(t, 0), 1); same(diff(x1313, t).subs(t, 0), 0)
bra = cos(2*t) + sin(2*t)/2
same(bra.subs(t, (pi - atan(2))/2), 0); same(simplify(bra.subs(t, t + pi/2) + bra), 0)   # a zero, and a sign change every pi/2
same(bra.subs(t, t + pi), bra)
```
:::

::: example 临界阻尼
一个 1 kg 的质量连接到一个 $k = 4$ N/m 的弹簧上。哪个阻尼常数会使运动呈现临界阻尼？找出该阻尼下的运动，从 $x(0) = 1$、$x'(0) = 0$ 和 $c = 10$ 开始：

临界阻尼需要 $c^2 = 4mk = 16$，因此 $c = 4$。然后 $r^2 + 4r + 4 = (r + 2)^2 = 0$，其单根为 $r = -2$，且 $x = (C_1 + C_2t)e^{-2t}$。 $x(0) = C_1 = 1$ 和 $x'(0) = -2C_1 + C_2 = 0$ 给出 $C_2 = 2$：

$$x = (1 + 2t)\,e^{-2t}.$$

$c = 10$ 特征方程 $r^2 + 10r + 4 = 0$ 的根为 $r = -5 \pm \sqrt{21}$，约 $-0.417$ 和 $-9.58$：过阻尼。相同的初始条件给出 $C_1 + C_2 = 1$ 和 $r_1C_1 + r_2C_2 = 0$，因此 $C_1 \approx 1.046$ 和 $C_2 \approx -0.046$。缓慢衰减的项 $1.046e^{-0.417t}$ 占主导地位：在 $t = 3$ 时，过阻尼质量仍约在 0.30 m 处，而临界阻尼质量则在 $7e^{-6} \approx 0.017$ m 处。阻尼越大并不意味着返回越快。临界阻尼是防止振荡的最小阻尼，从长远来看，它以最快指数速率使质量静止：此处为 $e^{-2t}$，而 $e^{-0.417t}$ 对应 $c = 10$ 和 $e^{-t/2}$ 对应 $c = 1$（图 13.5）。

```check
same(solve(Eq(c**2, 16), c), [-4, 4]); same(expand((r + 2)**2), r**2 + 4*r + 4)
xcr = (1 + 2*t)*exp(-2*t)
same(diff(xcr, t, 2) + 4*diff(xcr, t) + 4*xcr, 0); same(xcr.subs(t, 0), 1); same(diff(xcr, t).subs(t, 0), 0)
r1o, r2o = -5 + sqrt(21), -5 - sqrt(21)
same_set(solve(r**2 + 10*r + 4, r), [r1o, r2o]); rounds(r1o, '-0.417'); rounds(r2o, '-9.58')
C1o, C2o = -r2o/(r1o - r2o), r1o/(r1o - r2o)
same(C1o + C2o, 1); same(r1o*C1o + r2o*C2o, 0); rounds(C1o, '1.046'); rounds(C2o, '-0.046')
xov = C1o*exp(r1o*t) + C2o*exp(r2o*t)
same(diff(xov, t, 2) + 10*diff(xov, t) + 4*xov, 0)
rounds(xov.subs(t, 3), '0.30'); same(xcr.subs(t, 3), 7*exp(-6)); rounds(7*exp(-6), '0.017')
holds(r1o > -2); holds(-Rational(1, 2) > -2)                       # e^(-2t) decays fastest
for cv_ in (5, 10, 20):
    holds((cv_ - sqrt(cv_**2 - 16))/2 < 2)                         # overdamped (m = 1, k = 4): slowest rate below 2
for cv_ in (1, 2, 3):
    holds(Rational(cv_, 2) < 2)                                    # underdamped: rate c/2 below 2
```
:::

::: figure id=fig-13-5
一个 1 kg 的质量在 $k = 4$ N/m 的弹簧上，从 $x = 1$ 处静止释放。左：当 $c = 1$ 时，运动为欠阻尼；它在虚线包络线 $\pm 1.03e^{-t/2}$ 内振荡。右：当 $c = 4$（临界阻尼）和 $c = 10$（过阻尼）时，不振荡，临界阻尼质量更快地静止。
:::

```check
w15 = sqrt(15)/2
xu1 = exp(-t/2)*(cos(w15*t) + sin(w15*t)/sqrt(15))
same(diff(xu1, t, 2) + diff(xu1, t) + 4*xu1, 0); same(xu1.subs(t, 0), 1); same(diff(xu1, t).subs(t, 0), 0)
same(sqrt(1 + Rational(1, 15)), 4/sqrt(15)); rounds(4/sqrt(15), '1.03')
```

::: pitfall
重根 $r$ 的情况下，公式 $C_1e^{rt} + C_2e^{rt}$ 不是通解：它是 $(C_1 + C_2)e^{rt}$，一个常数乘以 $e^{rt}$，无法满足两个初始条件。对于 $x'' + 4x' + 4x = 0$ 中的 $x(0) = 1$ 和 $x'(0) = 0$，它需要同时满足 $C_1 + C_2 = 1$ 和 $-2(C_1 + C_2) = 0$。第二个解是 $te^{rt}$。在情况3中，$\beta$ 是 $\sqrt{4ac - b^2}/(2a)$，即正数 $4ac - b^2$ 的平方根。

```check
same(solve([C1 + C2 - 1, -2*(C1 + C2)], [C1, C2]), [])
```
:::

## 使用计算机求解 {#computer}

SymPy 可以用 `dsolve` 求解许多微分方程的精确解，且 `checkodesol` 通过将解代入方程来验证所提出的解，正如你在例 13.1 中手动进行的一样。未知数必须是 SymPy 的 **function**，由 `sp.Function` 构造，而不是符号；导数用 `.diff` 表示，方程用 `sp.Eq` 表示。

::: compute 使用 dsolve 求精确解
例 13.1 和 13.10 中的方程，分别没有初始条件和带有初始条件的情况：

```python
import sympy as sp
t = sp.symbols('t')
y = sp.Function('y')                   # an unknown function of t
ode = sp.Eq(y(t).diff(t), t - y(t))    # y' = t - y
print(sp.dsolve(ode))
sol = sp.dsolve(ode, ics={y(0): 1})    # with the initial condition y(0) = 1
print(sol)
print(sp.checkodesol(ode, sol))
```

```output
Eq(y(t), C1*exp(-t) + t - 1)
Eq(y(t), t - 1 + 2*exp(-t))
(True, 0)
```

第一行是一般解，使用 SymPy 的名称 `C1` 表示常数；第二行是例题 13.1 的解。`checkodesol` 将解代入方程：`(True, 0)` 表示两边相差为 0。接下来是逻辑斯蒂方程和例题 13.13 的弹簧方程；一个导数的条件用 `.diff(t).subs(t, 0)` 表示：

```python
logistic = sp.Eq(y(t).diff(t), y(t)*(1 - y(t)))
print(sp.dsolve(logistic, ics={y(0): sp.Rational(1, 10)}))
x = sp.Function('x')
spring = sp.Eq(x(t).diff(t, 2) + 2*x(t).diff(t) + 5*x(t), 0)
print(sp.dsolve(spring))
print(sp.dsolve(spring, ics={x(0): 1, x(t).diff(t).subs(t, 0): 0}))
```

```output
Eq(y(t), 1/(1 + 9*exp(-t)))
Eq(x(t), (C1*sin(2*t) + C2*cos(2*t))*exp(-t))
Eq(x(t), (sin(2*t)/2 + cos(2*t))*exp(-t))
```

逻辑斯蒂解是第 13.6 节的公式，使用 $K = 1$、$r = 1$ 和 $y_0 = \tfrac{1}{10}$，因此 $(K - y_0)/y_0 = 9$。在弹簧方程的一般解中，SymPy 将正弦项标记为 `C1`，余弦项标记为 `C2`，与定理 13.8 的顺序相反；这不会改变结果，因为两个常数都是任意的。最后一行是例题 13.13 的答案。最常见的错误是将未知数当作符号：

```python fails
z = sp.symbols('z')                    # a symbol, not a function
print(sp.dsolve(sp.Eq(z(t).diff(t), z(t))))
```

```output
TypeError: 'Symbol' object is not callable
```

符号代表一个数，而 `z(t)` 要求的是“z 在 t 处的值”，这只有在函数有意义时才有意义。
:::

```check
yq = Function('y')
same(dsolve(Eq(yq(t).diff(t), yq(t)*(1 - yq(t))), ics={yq(0): Rational(1, 10)}).rhs, 1/(1 + 9*exp(-t)))
same(ylog.subs({Kp: 1, rp: 1, y0p: Rational(1, 10)}), 1/(1 + 9*exp(-t)))
xq = Function('x')
same(dsolve(xq(t).diff(t, 2) + 2*xq(t).diff(t) + 5*xq(t), ics={xq(0): 1, xq(t).diff(t).subs(t, 0): 0}).rhs, x1313)
```

并非每个方程都有解析解。对于 $y' = t - y^2$，该 widget 中的一个方程，无法用本课程中函数构造的公式来求解（其解需要特殊的函数，即 Airy 函数），而 `dsolve` 无法产生这样的解：SymPy 1.14 会报错。数值方法则不关心这一点。运行 RK4 方法，使用步长 $h$ 和再使用 $h/2$：通常不变的数字才是你可以信赖的。

```check
try:
    dsolve(Eq(yf(t).diff(t), t - yf(t)**2)); _gave = True
except Exception:
    _gave = False
holds(not _gave)                                            # dsolve gives no formula (SymPy 1.14 raises an error)
_u = Symbol('A')*airyai(t) + Symbol('B')*airybi(t)
same(diff(diff(_u, t)/_u, t), t - (diff(_u, t)/_u)**2)      # y = u'/u, u made of Airy functions, solves y' = t - y^2
```

::: compute 数值解
$y' = t - y^2$、$y(0) = 0$ 在 $t = 2$ 处的解，使用第 13.4 节中的 `rk4` 函数和三个步长：

```python
def rk4(F, t, y, h, n):
    """n steps of the classical Runge-Kutta method; returns the last y."""
    for _ in range(n):
        k1 = F(t, y)
        k2 = F(t + h/2, y + h/2*k1)
        k3 = F(t + h/2, y + h/2*k2)
        k4 = F(t + h, y + h*k3)
        y, t = y + h/6*(k1 + 2*k2 + 2*k3 + k4), t + h
    return y

F = lambda t, y: t - y**2
for n in [20, 40, 80]:
    print(f"h = {2/n:<6} y(2) = {rk4(F, 0.0, 0.0, 2/n, n):.10f}")
```

```output
h = 0.1    y(2) = 1.1935739964
h = 0.05   y(2) = 1.1935758583
h = 0.025  y(2) = 1.1935759682
```

从 $h = 0.05$ 开始，数值在小数点后六位一致：$y(2) \approx 1.193576$。一个二阶方程可以转化为一对一阶方程。对于例 13.13 中的弹簧，设 $x'' = -2x' - 5x$，将速度设为 $v = x'$；则 $x' = v$ 和 $v' = -2v - 5x$。同样的 `rk4` 也可以用于一个 NumPy 数组 $u = (x, v)$ 代替一个数，因为它只进行加法和乘法：

```python
import numpy as np
G = lambda t, u: np.array([u[1], -2*u[1] - 5*u[0]])   # (x, v) -> (x', v')
u = rk4(G, 0.0, np.array([1.0, 0.0]), 0.01, 300)     # 300 steps, to t = 3
exact = np.exp(-3)*(np.cos(6) + np.sin(6)/2)          # Example 13.13, t = 3
print(f"RK4: x(3) = {u[0]:.10f}   exact: {exact:.10f}")
```

```output
RK4: x(3) = 0.0408484252   exact: 0.0408484245
```

两者相差小于 $10^{-9}$。像 SciPy 这样的库也以更谨慎的方式做到这一点：它们的求解器会自动选择和调整步长，以满足你设定的误差容忍度。
:::

```check
import mpmath as _mp
_mp.mp.dps = 25
y2r = _mp.odefun(lambda T_, Y_: T_ - Y_**2, 0, 0)(2)
rounds(Float(y2r, 25), '1.193576')
v20, v40, v80 = [_rk4(lambda T_, Y_: T_ - Y_**2, 0.0, 0.0, 2/n_, n_) for n_ in (20, 40, 80)]
rounds(v40, '1.193576'); rounds(v80, '1.193576'); holds(round(v20, 6) != round(v40, 6))
import numpy as _np
G_ = lambda T_, U_: _np.array([U_[1], -2*U_[1] - 5*U_[0]])
u_ = _rk4(G_, 0.0, _np.array([1.0, 0.0]), 0.01, 300)
same(x1313.subs(t, 3), exp(-3)*(cos(6) + sin(6)/2)); rounds(x1313.subs(t, 3), '0.0408484245'); rounds(u_[0], '0.0408484252')
holds(abs(u_[0] - float(N(x1313.subs(t, 3), 20))) < 1e-9)
```

## 你所学到的内容 {#summary}

- 微分方程将一个未知函数与其导数联系起来；其阶数为最高导数的阶数。一个解使方程在一个区间内成立，你通过代入来验证它。一个初值问题会添加 $y(t_0) = y_0$，并为二阶方程添加 $y'(t_0) = v_0$。
- 如果 $F$ 和 $F_y$ 是连续的，$y' = F(t, y)$、$y(t_0) = y_0$ 在 $t_0$ 附近有且仅有一个解（定理 13.1），尽管它可能在有限时间内发散；没有 $F_y$ 的条件时，唯一性可能失效。
- 模型来源于“变化率 = 输入率 − 输出率”：增长与衰减 $y' = ky$，冷却 $T' = -k(T - T_s)$，下落物体 $mv' = mg - cv$，以及混合储罐。
- 方向场在求解之前显示解的图像。对于 $y' = f(y)$，平衡点是 $f$ 的零点；一个平衡点稳定当 $f'(y^*) < 0$，不稳定当 $f'(y^*) > 0$，并且相线上 $f$ 的符号表示每个解的走向。
- 欧拉法 $y_{n+1} = y_n + h\,F(t_n, y_n)$ 是沿着切线进行的。在固定时间点的误差为 $O(h)$，因此将 $h$ 减半大致也将误差减半；对于光滑的 $F$，RK4 的误差为 $O(h^4)$。步长过大可能会使欧拉法失去控制。
- 可分离变量方程 $y' = g(t)h(y)$： $\int\frac{dy}{h(y)} = \int g(t)\,dt$，由链式法则证明；具有 $h(y^*) = 0$ 的常数解会被遗漏，必须重新添加回来。方程 $y' = ky$ 的解恰好是 $y(t_0)e^{k(t - t_0)}$，而方程 $y' = -k(y - A)$ 的解是 $A + \big(y(0) - A\big)e^{-kt}$：冷却、自由落体、储水箱和 RC 电路。
- 逻辑斯蒂方程 $y' = ry(1 - y/K)$ 的解是 S 型曲线 $y = K\big/\big(1 + \frac{K - y_0}{y_0}e^{-rt}\big)$，其环境承载能力为 $K$，最大增长率出现在 $y = K/2$。
- 线性方程 $y' + p(t)y = q(t)$: 乘以 $\mu = e^{\int p\,dt}$，使得左边为 $(\mu y)'$，并进行积分；解在 $p$ 和 $q$ 连续的区域存在。
- $ay'' + by' + cy = 0$: $ar^2 + br + c = 0$ 的根给出 $C_1e^{r_1t} + C_2e^{r_2t}$， $(C_1 + C_2t)e^{rt}$ 或 $e^{\alpha t}(C_1\cos\beta t + C_2\sin\beta t)$；对于弹簧系统，这些根对应于过阻尼、临界阻尼和欠阻尼运动。
- SymPy: `sp.Function`， `sp.dsolve(ode, ics=...)` 和 `sp.checkodesol`；数值上，使用 RK4 方法，将二阶方程转化为一阶系统。

## 练习 {#exercises}

:::: exercise 阶数与解 {#ex-13-1} ★
- (a) 说明每个方程的阶数：(i) $y' + ty = e^t$；(ii) $y'' = 6y - y'$；(iii) $(y')^2 + y = t$。
- (b) 证明 $y = 3 + Ce^{-2t}$ 是 $y' = 6 - 2y$ 的解，对于任意常数 $C$，并求出满足 $y(0) = 1$ 的解。
- (c) 哪个解是常数解？其他解在 $t \to \infty$ 时会怎样变化？

::: solution
**(a)** (i) 一阶. (ii) 二阶: 最高阶导数是 $y''$. (iii) 一阶: 最高阶导数是 $y'$, 平方它不会改变阶数.

**(b)** 求导: $y' = -2Ce^{-2t}$. 右边是 $6 - 2y = 6 - 2\big(3 + Ce^{-2t}\big) = -2Ce^{-2t}$. 两边对于每一个 $t$ 都一致, 所以每个解族中的函数都是解. 然后 $y(0) = 3 + C = 1$ 给出 $C = -2$:

$$y = 3 - 2e^{-2t}.$$

**(c)** $C = 0$ 给出常数解 $y = 3$, 即平衡点: $6 - 2 \cdot 3 = 0$. 对于每一个其他 $C$, $Ce^{-2t} \to 0$, 所以每个解都趋向于 3: 平衡点是稳定的, 如定理 13.2 所示, 因为 $f(y) = 6 - 2y$ 有 $f'(3) = -2 < 0$.

```check
y1e = 3 + c*exp(-2*t)
same(diff(y1e, t), -2*c*exp(-2*t)); same(6 - 2*y1e, -2*c*exp(-2*t))
same(solve(Eq(y1e.subs(t, 0), 1), c), [-2]); same(diff(3 - 2*exp(-2*t), t), 6 - 2*(3 - 2*exp(-2*t)))
same(solve(6 - 2*y, y), [3]); same(diff(6 - 2*y, y), -2); limit_is(c*exp(-2*t), t, oo, 0)
holds(ode_order(Derivative(yf(t), t) + t*yf(t) - exp(t), yf(t)) == 1); holds(ode_order(Derivative(yf(t), t, 2) - 6*yf(t) + Derivative(yf(t), t), yf(t)) == 2)
holds(ode_order(Derivative(yf(t), t)**2 + yf(t) - t, yf(t)) == 1)
```
:::
::::

:::: exercise 平衡点与稳定性 {#ex-13-2} ★
对于 $y' = y^2 - y - 2$:

- (a) 找出平衡点, 并判断每个是稳定还是不稳定.
- (b) 描述当 $t$ 增加时, $y(0) = 0$, $y(0) = 3$ 和 $y(0) = -2$ 的解的行为.

::: solution
**(a)** $f(y) = y^2 - y - 2 = (y - 2)(y + 1)$, 哪在 $y = 2$ 和 $y = -1$ 处为 0。由于 $f'(y) = 2y - 1$, $f'(-1) = -3 < 0$ 和 $f'(2) = 3 > 0$: $-1$ 是稳定的，2 是不稳定的。

**(b)** $f$ 的符号：对于 $y < -1$，两个因子都是负数，因此 $f > 0$；对于 $-1 < y < 2$， $f < 0$；对于 $y > 2$， $f > 0$。

- $y(0) = 0$ 位于两个平衡点之间，其中 $f < 0$：解减少并趋近于 $-1$，但永远不会达到它。
- $y(0) = 3$ 位于 2 之上，其中 $f > 0$：解增加，远离 2，趋于无穷大。
- $y(0) = -2$ 位于 $-1$ 之下，其中 $f > 0$：解增加并从下方趋近于 $-1$。

```check
f2e = y**2 - y - 2
same(factor(f2e), (y - 2)*(y + 1)); same_set(solve(f2e, y), [2, -1])
same(diff(f2e, y).subs(y, -1), -3); same(diff(f2e, y).subs(y, 2), 3)
holds(f2e.subs(y, -2) > 0); holds(f2e.subs(y, 0) < 0); holds(f2e.subs(y, 3) > 0)
```
:::
::::

:::: exercise 手动使用欧拉方法 {#ex-13-3} ★
对于 $y' = y + t$， $y(0) = 1$：

- (a) 使用欧拉法以 $h = 0.25$ 为步长近似 $y(1)$。
- (b) 检查 $y = 2e^t - t - 1$ 是精确解，并求出你近似值的误差。
- (c) 不进行计算，以 $h = 0.125$ 为步长的误差大约是多少？

::: solution
**(a)** 这里 $F(t, y) = y + t$，四个步长为 0.25 的步骤达到 $t = 1$。每个步骤加上 0.25 倍的斜率： $y_{n+1} = y_n + 0.25\,(y_n + t_n)$。

| $n$ | $t_n$ | $y_n$ | 斜率 $y_n + t_n$ |
|---|---|---|---|
| 0 | 0 | 1 | 1 |
| 1 | 0.25 | 1.25 | 1.5 |
| 2 | 0.5 | 1.625 | 2.125 |
| 3 | 0.75 | 2.15625 | 2.90625 |
| 4 | 1 | 2.8828125 |  |

So $y(1) \approx 2.8828$.

**(b)** 对于 $y = 2e^t - t - 1$： $y' = 2e^t - 1$，以及 $y + t = 2e^t - t - 1 + t = 2e^t - 1$，相同；还有 $y(0) = 2 - 0 - 1 = 1$。因此这是解，且 $y(1) = 2e - 2 \approx 3.4366$。误差约为 $3.4366 - 2.8828 = 0.554$。

**(c)** 欧拉方法的阶数为 1，因此将 $h$ 减半应大致将误差减半，约为 0.28。 （八个步长为 0.125 的步骤得到 3.1316，误差为 0.305：略多于一半，因为 $h$ 还未足够小。不断将 $h$ 减半，相继误差的比值为 1.82，1.90，1.95，1.97：趋近于 2。）

```check
F3e = lambda T, Y: Y + T
def eul_(F_, y0_, h_, n_):
    T_, Y_ = Integer(0), y0_
    for _ in range(n_):
        Y_, T_ = Y_ + h_*F_(T_, Y_), T_ + h_
    return Y_
same([eul_(F3e, Integer(1), Rational(1, 4), k_) for k_ in range(1, 5)], [Rational(5, 4), Rational(13, 8), Rational(69, 32), Rational(369, 128)])
same([Y_ + T_ for T_, Y_ in zip((0, Rational(1, 4), Rational(1, 2), Rational(3, 4)), (1, Rational(5, 4), Rational(13, 8), Rational(69, 32)))], [1, Rational(3, 2), Rational(17, 8), Rational(93, 32)])
same([Rational(3, 2), Rational(17, 8), Rational(93, 32)], [Rational(15, 10), Rational(2125, 1000), Rational(290625, 100000)])
same(Rational(369, 128), Rational(28828125, 10**7)); rounds(Rational(369, 128), '2.8828')
y3e = 2*exp(t) - t - 1
same(diff(y3e, t), y3e + t); same(y3e.subs(t, 0), 1); same(y3e.subs(t, 1), 2*E - 2); rounds(2*E - 2, '3.4366')
rounds(2*E - 2 - Rational(369, 128), '0.554'); rounds((2*E - 2 - Rational(369, 128))/2, '0.28')
e8 = 2*E - 2 - eul_(F3e, Integer(1), Rational(1, 8), 8)
rounds(eul_(F3e, Integer(1), Rational(1, 8), 8), '3.1316'); rounds(e8, '0.305')
errs3 = [2*E - 2 - eul_(F3e, Integer(1), Rational(1, 4*2**k_), 4*2**k_) for k_ in range(5)]
for k_, r_ in zip(range(4), ('1.82', '1.90', '1.95', '1.97')):
    rounds(errs3[k_]/errs3[k_ + 1], r_)
```
:::
::::

:::: exercise 两个可分离变量的方程 {#ex-13-4} ★
求解：

- (a) $y' = 3t^2y$, $y(0) = 5$;
- (b) $y' = \dfrac{t}{y}$, $y(0) = -2$.

::: solution
**(a)** 解不能触及平衡点 $y = 0$（根据定理 13.1，因为 $F = 3t^2y$ 和 $F_y = 3t^2$ 是连续的），因此它保持正数，你可以除以 $y$。分离变量并积分：

$$\begin{aligned} \int\frac{dy}{y} &= \int 3t^2\,dt, \\ \ln y &= t^3 + C, \\ y &= e^{C}e^{t^3}. \end{aligned}$$

$y(0) = e^C = 5$，因此 $y = 5e^{t^3}$。检验： $y' = 5e^{t^3} \cdot 3t^2 = 3t^2y$。

**(b)** 乘以 $y$ 并积分： $\displaystyle\int y\,dy = \int t\,dt$，因此 $\tfrac12y^2 = \tfrac12t^2 + C$，即 $y^2 = t^2 + 2C$。在 $t = 0$ 时： $4 = 2C$，因此

$$y^2 = t^2 + 4.$$

所以 $y = \sqrt{t^2 + 4}$ 或 $y = -\sqrt{t^2 + 4}$。只有第二个包含 $y(0) = -2$，而且因为 $t^2 + 4$ 永远不为 0，解不能从一个分支切换到另一个分支： $y = -\sqrt{t^2 + 4}$ 对于每个 $t$。常见的错误答案 $\sqrt{t^2 + 4}$ 包含 $y(0) = 2$。检验： $y' = -\dfrac{t}{\sqrt{t^2 + 4}} = \dfrac{t}{y}$。

```check
same(integrate(1/y, y), log(y)); same(integrate(3*t**2, t), t**3)
y4a = 5*exp(t**3); same(diff(y4a, t), 3*t**2*y4a); same(y4a.subs(t, 0), 5)
same(integrate(y, y), y**2/2); same(solve(Eq(Integer(4), 2*c), c), [2])
y4b = -sqrt(t**2 + 4); same(diff(y4b, t), t/y4b); same(y4b.subs(t, 0), -2); same(sqrt(t**2 + 4).subs(t, 0), 2)
holds(checkodesol(Eq(yf(t).diff(t), t/yf(t)), Eq(yf(t), y4b))[0])
```
:::
::::

:::: exercise 温度计 {#ex-13-5} ★★
一个读数为 5 °C 的温度计被带入一个 22 °C 的房间。1 分钟后读数为 12 °C。假设牛顿冷却定律，何时读数会达到 21 °C？

::: solution
牛顿定律也涵盖升温：当 $T < T_s$, $T' = -k(T - T_s) > 0$。根据第13.5节， $T(t) = 22 + (5 - 22)e^{-kt} = 22 - 17e^{-kt}$，其中 $t$ 以分钟为单位， $k$ 每分钟。在 $t = 1$：

$$\begin{aligned} 12 &= 22 - 17e^{-k}, \\ e^{-k} &= \frac{10}{17}, \\ k &= \ln 1.7 \approx 0.531. \end{aligned}$$

对于21 °C： $22 - 17e^{-kt} = 21$ 给出 $e^{-kt} = \tfrac{1}{17}$，因此 $t = \dfrac{\ln 17}{k}$，即，

$$t = \frac{\ln 17}{\ln 1.7} \approx 5.34 \text{ minutes}.$$

```check
k5e = log(Rational(17, 10)); T5e = 22 - 17*exp(-k5e*t)
same(T5e.subs(t, 0), 5); same(T5e.subs(t, 1), 12); rounds(k5e, '0.531')
same(diff(T5e, t), -k5e*(T5e - 22))
same(solve(Eq(T5e, 21), t), [log(17)/log(Rational(17, 10))]); rounds(log(17)/log(Rational(17, 10)), '5.34')
```
:::
::::

:::: exercise 水箱与下落物体 {#ex-13-6} ★★
- (a) 解决混合水箱的初值问题，例13.3： $y' = 0.6 - 0.03y$, $y(0) = 5$。水箱何时含有15 kg盐？
- (b) 解决 $v' = 9.8 - 0.2v$, $v(0) = 0$，第13.2节的下落物体。物体需要多长时间才能达到终端速度的95%？

::: solution
两个方程都具有第13.5节关键思想形式 $y' = -k(y - A)$，解为 $A + \big(y(0) - A\big)e^{-kt}$。

**(a)** $y' = -0.03(y - 20)$，所以

$$\begin{aligned} y &= 20 + (5 - 20)e^{-0.03t} \\ &= 20 - 15e^{-0.03t}. \end{aligned}$$

水箱含有15 kg盐时 $15e^{-0.03t} = 5$，即 $e^{-0.03t} = \tfrac13$，在 $t = \dfrac{\ln 3}{0.03} \approx 36.6$ 分钟。

**(b)** $v' = -0.2(v - 49)$, 因此 $v = 49 + (0 - 49)e^{-0.2t} = 49\big(1 - e^{-0.2t}\big)$。当 $1 - e^{-0.2t} = 0.95$ 时，它达到 49 m/s 的 95%，即 $e^{-0.2t} = 0.05$，在 $t = \dfrac{\ln 20}{0.2}$ 处：

$$t = 5\ln 20 \approx 15.0 \text{ seconds}.$$

```check
y6a = 20 - 15*exp(-Rational(3, 100)*t)
same(diff(y6a, t), Rational(6, 10) - Rational(3, 100)*y6a); same(y6a.subs(t, 0), 5)
tre = symbols('t', real=True)
same(solve(Eq(y6a.subs(t, tre), 15), tre), [log(3)/Rational(3, 100)]); rounds(log(3)/Rational(3, 100), '36.6')
v6b = 49*(1 - exp(-t/5))
same(diff(v6b, t), Rational(98, 10) - Rational(2, 10)*v6b); same(v6b.subs(t, 0), 0)
same(solve(Eq(v6b.subs(t, tre), Rational(95, 100)*49), tre), [5*log(20)]); rounds(5*log(20), '15.0')
```
:::
::::

:::: exercise 积分因子 {#ex-13-7} ★★
在$y(1) = 2$的条件下，求解$ty' + 2y = 4t^2$关于$t > 0$的方程。当$t \to 0^+$时，哪个解保持有限？

::: solution
对于$t > 0$，你可以除以$t$，这给出了标准形式

$$y' + \frac{2}{t}\,y = 4t.$$

此处$p(t) = 2/t$在$(0, \infty)$上连续，且拥有原函数$2\ln t$，故$\mu = e^{2\ln t} = t^2$。两边同乘：$t^2y' + 2ty = 4t^3$，即$(t^2y)' = 4t^3$。积分得：$t^2y = t^4 + C$，因此

$$y = t^2 + \frac{C}{t^2}.$$

由 $y(1) = 1 + C = 2$ 得 $C = 1$，因此当 $t > 0$ 时，解为 $y = t^2 + \dfrac{1}{t^2}$。由定理 13.5，这是在 $(0, \infty)$ 上满足 $y(1) = 2$ 的唯一解。考虑 $t \to 0^+$（[单侧极限](module_02_ZH.html#one-sided)）。除非 $C = 0$，否则 $C/t^2$ 无界（若 $C > 0$，则趋于 $\infty$；若 $C < 0$，则趋于 $-\infty$）。所以保持有限的唯一解是 $y = t^2$。实际上它对于每个 $t$ 都满足原方程，因为 $t \cdot 2t + 2t^2 = 4t^2$。

```check
tq = symbols('t', positive=True)
same(integrate(2/tq, tq), 2*log(tq)); same(exp(2*log(tq)), tq**2)
same(diff(tq**2*yfun(tq), tq), tq**2*(Derivative(yfun(tq), tq) + 2/tq*yfun(tq)))
antideriv(tq**4, 4*tq**3, tq)
y7e = tq**2 + 1/tq**2
same(tq*diff(y7e, tq) + 2*y7e, 4*tq**2); same(y7e.subs(tq, 1), 2)
limit_is(1/t**2, t, 0, oo, '+'); limit_is(-1/t**2, t, 0, -oo, '+')                 # C/t^2 is unbounded unless C = 0
same(t*diff(t**2, t) + 2*t**2, 4*t**2)
```
:::
::::

:::: exercise 一个谣言 {#ex-13-8} ★★
一个谣言在一所1000名学生的学校中传播。假设其传播速度与已经听到这个谣言的学生数 $y$ 和尚未听到这个谣言的学生数 $1000 - y$ 成正比。

- (a) 证明 $y$ 满足一个逻辑斯蒂方程。
- (b) 初始时有100名学生已经听到这个谣言，一天后有200名学生已经听到。求 $r$。
- (c) 当有多少名学生已经听到这个谣言时，达到900名？

::: solution
**(a)** $y' = a\,y(1000 - y)$ 是一个常数 $a > 0$。将1000提出括号外，得到 $y' = 1000a\,y\big(1 - \tfrac{y}{1000}\big)$：一个具有参数 $K = 1000$ 和 $r = 1000a$ 的逻辑斯蒂方程。

**(b)** 用 $y_0 = 100$ 和 $\dfrac{K - y_0}{y_0} = 9$，因此 $y = \dfrac{1000}{1 + 9e^{-rt}}$。然后 $y(1) = 200$ 表示 $1 + 9e^{-r} = 5$，因此 $e^{-r} = \tfrac49$ 且

$$r = \ln\frac94 \approx 0.811 \text{ per day}.$$

**(c)** $y = 900$ 表示 $1 + 9e^{-rt} = \tfrac{10}{9}$，因此 $e^{-rt} = \tfrac{1}{81}$ 且

$$\begin{aligned} t &= \frac{\ln 81}{r} = \frac{\ln 81}{\ln(9/4)} \\ &= \frac{2\ln 3}{\ln 1.5} \approx 5.42 \text{ days}. \end{aligned}$$

这正好是半数学生已知此消息所需时间的两倍 $\dfrac{\ln 9}{r} \approx 2.71$ 天：逻辑斯蒂曲线从 100 增长到 500 的速度与从 500 增长到 900 的速度相同。

```check
a8 = symbols('a', positive=True)
same(expand(a8*y*(1000 - y) - 1000*a8*y*(1 - y/1000)), 0)
r8 = log(Rational(9, 4)); y8 = 1000/(1 + 9*exp(-r8*t))
same(y8, ylog.subs({Kp: 1000, y0p: 100, rp: r8})); same(y8.subs(t, 0), 100); same(simplify(y8.subs(t, 1)), 200); rounds(r8, '0.811')
t9 = log(81)/r8
same(simplify(y8.subs(t, t9)), 900); same(t9, 2*log(3)/log(Rational(3, 2))); rounds(t9, '5.42')
same(simplify(y8.subs(t, log(9)/r8)), 500); same(t9, 2*log(9)/r8); rounds(log(9)/r8, '2.71')
```
:::
::::

:::: exercise 三个二阶方程 {#ex-13-9} ★★
求解：

- (a) $y'' - y' - 6y = 0$, $y(0) = 1$, $y'(0) = 8$;
- (b) $y'' + 6y' + 9y = 0$, $y(0) = 2$, $y'(0) = -1$;
- (c) $y'' + 4y' + 13y = 0$, $y(0) = 0$, $y'(0) = 6$.

::: solution
**(a)** $r^2 - r - 6 = (r - 3)(r + 2) = 0$ 给出 $r = 3$ 和 $r = -2$，因此 $y = C_1e^{3t} + C_2e^{-2t}$。条件： $C_1 + C_2 = 1$ 和 $3C_1 - 2C_2 = 8$。将第一个方程乘以两倍加到第二个方程上得到 $5C_1 = 10$，因此 $C_1 = 2$ 和 $C_2 = -1$：

$$y = 2e^{3t} - e^{-2t}.$$

**(b)** $r^2 + 6r + 9 = (r + 3)^2 = 0$ 有一个单根 $r = -3$，因此 $y = (C_1 + C_2t)e^{-3t}$。 $y(0) = C_1 = 2$； $y' = \big(C_2 - 3C_1 - 3C_2t\big)e^{-3t}$，因此 $y'(0) = C_2 - 3C_1 = -1$ 和 $C_2 = 5$：

$$y = (2 + 5t)\,e^{-3t}.$$

**(c)** $r^2 + 4r + 13 = 0$ 的判别式为 $16 - 52 = -36 < 0$，因此 $\alpha = -\tfrac42 = -2$ 和 $\beta = \tfrac{\sqrt{36}}{2} = 3$： $y = e^{-2t}\big(C_1\cos 3t + C_2\sin 3t\big)$。 $y(0) = C_1 = 0$，因此 $y = C_2e^{-2t}\sin 3t$，其中 $y' = C_2e^{-2t}\big(3\cos 3t - 2\sin 3t\big)$； $y'(0) = 3C_2 = 6$ 给出 $C_2 = 2$：

$$y = 2e^{-2t}\sin 3t.$$

```check
same(factor(r**2 - r - 6), (r - 3)*(r + 2)); same(solve([C1 + C2 - 1, 3*C1 - 2*C2 - 8], [C1, C2]), {C1: 2, C2: -1})
L9 = lambda Y, p_, q_: diff(Y, t, 2) + p_*diff(Y, t) + q_*Y
y9a = 2*exp(3*t) - exp(-2*t); same(L9(y9a, -1, -6), 0); same(y9a.subs(t, 0), 1); same(diff(y9a, t).subs(t, 0), 8)
same(factor(r**2 + 6*r + 9), (r + 3)**2)
same(diff((C1 + C2*t)*exp(-3*t), t), (C2 - 3*C1 - 3*C2*t)*exp(-3*t))
y9b = (2 + 5*t)*exp(-3*t); same(L9(y9b, 6, 9), 0); same(y9b.subs(t, 0), 2); same(diff(y9b, t).subs(t, 0), -1)
same(16 - 52, -36); same(solve(r**2 + 4*r + 13, r), [-2 - 3*I, -2 + 3*I])
same(diff(C2*exp(-2*t)*sin(3*t), t), C2*exp(-2*t)*(3*cos(3*t) - 2*sin(3*t)))
y9c = 2*exp(-2*t)*sin(3*t); same(L9(y9c, 4, 13), 0); same(y9c.subs(t, 0), 0); same(diff(y9c, t).subs(t, 0), 6)
```
:::
::::

:::: exercise 欧拉法，精确解 {#ex-13-10} ★★★
用步长 $h$ 运行欧拉法，其中 $0 < h < 1$，在 $y' = t - y$， $y(0) = 1$，使得 $t_n = nh$。

- (a) 用数学归纳法证明 $y_n = t_n - 1 + 2(1 - h)^n$ 对于 $n = 0, 1, 2, \dots$
- (b) 推导出当 $n$ 步骤到 $t = 2$（因此 $h = 2/n$），欧拉法对 $y(2)$ 的近似值为 $1 + 2\big(1 - \tfrac2n\big)^n$，并证明当 $n \to \infty$ 时它趋于精确值 $1 + 2e^{-2}$。
- (c) 对比例 13.6 和图 13.2，证明每个近似值 $y_n$ 在 $n \ge 1$ 下方且位于精确值 $y(t_n)$ 之下。

::: solution
**(a)** 对于 $n = 0$： $t_0 - 1 + 2(1 - h)^0 = 0 - 1 + 2 = 1 = y_0$。现在假设 $y_n = t_n - 1 + 2(1 - h)^n$ 对于某个 $n$。那么

$$\begin{aligned} y_{n+1} &= y_n + h(t_n - y_n) \\ &= (1 - h)y_n + ht_n \\ &= (1 - h)(t_n - 1) + ht_n \\ &\qquad + 2(1 - h)^{n+1} \\ &= t_n - 1 + h + 2(1 - h)^{n+1} \\ &= t_{n+1} - 1 + 2(1 - h)^{n+1}, \end{aligned}$$

其中第三步代入 $y_n$ 的公式并展开，第四步展开 $(1 - h)(t_n - 1) + ht_n = t_n - 1 - ht_n + h + ht_n = t_n - 1 + h$，最后使用 $t_{n+1} = t_n + h$。因此公式对 $n + 1$ 成立，并通过归纳法对所有 $n$ 成立。

**(b)** 与 $h = 2/n$, $t_n = 2$, 所以 $y_n = 2 - 1 + 2\big(1 - \tfrac2n\big)^n = 1 + 2\big(1 - \tfrac2n\big)^n$. 模块 6 证明了 $\big(1 + \tfrac{x}{n}\big)^n \to e^x$ 对于每一个 $x$; 与 $x = -2$, $\big(1 - \tfrac2n\big)^n \to e^{-2}$, 所以 $y_n \to 1 + 2e^{-2} = y(2)$. (或者直接: $\ln\big(1 - \tfrac2n\big)^n = n\ln\big(1 - \tfrac2n\big) \to -2$, 一种形如 $\infty \cdot 0$ 的极限 [洛必达法则](module_07_ZH.html#products-differences) 可以解决.) 欧拉方法随着步长减小收敛到解.

**(c)** $n = 4$ ($h = 0.5$): $1 + 2\big(\tfrac12\big)^4 = 1.125$, 如例 13.6 所示. $n = 8$ ($h = 0.25$): $1 + 2\big(\tfrac34\big)^8 = 1 + \tfrac{6561}{32768} \approx 1.2002$, 如图 13.2 所示.

对于比较，例题13.1的精确解给出 $y(t_n) = t_n - 1 + 2e^{-nh} = t_n - 1 + 2\big(e^{-h}\big)^n$。因此 $y_n < y(t_n)$ 恰好当 $(1 - h)^n < \big(e^{-h}\big)^n$。现在 $1 + x \le e^x$ 对于每一个 $x$，仅在 $x = 0$ 处相等：函数 $e^x$ 的图像是向上凹的，因此它位于其在 0 处的切线 $y = 1 + x$ 之上，仅在该点相切。利用 $x = -h$ 和 $0 < h < 1$，这给出 $0 < 1 - h < e^{-h}$。将两边同时提升到 $n \ge 1$ 次方保持不等式成立，因为两边都是正数。因此，每个近似值都位于精确值之下，原因如例题13.6所述：向上凹的曲线位于其切线之上。特别地，欧拉近似 $1 + 2\big(1 - \tfrac2n\big)^n$ 对于 $y(2)$ 是低于 $1 + 2e^{-2}$ 的，对每一个 $n \ge 3$ 都成立。

```check
hs, ns = symbols('h n', positive=True)
yn_ = lambda N_: N_*hs - 1 + 2*(1 - hs)**N_
same(yn_(0), 1)
steps(yn_(ns) + hs*(ns*hs - yn_(ns)), (1 - hs)*yn_(ns) + hs*ns*hs, (1 - hs)*(ns*hs - 1) + 2*(1 - hs)**(ns + 1) + hs*ns*hs, ns*hs - 1 + hs + 2*(1 - hs)**(ns + 1), yn_(ns + 1))
same(expand((1 - hs)*(t - 1)), t - 1 - hs*t + hs)
same(yn_(ns).subs(hs, 2/ns), 1 + 2*(1 - 2/ns)**ns)
limit_is((1 - 2/n)**n, n, oo, exp(-2), '+'); limit_is(n*log(1 - 2/n), n, oo, -2, '+')
same((1 + 2*(1 - 2/n)**n).subs(n, 4), Rational(9, 8)); same((1 + 2*(1 - 2/n)**n).subs(n, 8), 1 + Rational(6561, 32768)); rounds(1 + Rational(6561, 32768), '1.2002')
same(y131.subs(t, ns*hs), ns*hs - 1 + 2*exp(-hs)**ns)                    # y(t_n) = t_n - 1 + 2(e^(-h))^n
for hv_ in (Rational(1, 100), Rational(1, 4), Rational(1, 2), Rational(9, 10)):
    holds(0 < 1 - hv_ < exp(-hv_))
    for N_ in (1, 2, 5, 20):
        holds(yn_(N_).subs(hs, hv_) < y131.subs(t, N_*hv_))                  # y_n < y(t_n) at every step
for N_ in (3, 4, 10, 100):
    holds((1 - Rational(2, N_))**N_ < exp(-2))
```
:::
::::

:::: exercise 空气阻力与 $v^2$ 成正比 {#ex-13-11} ★★★
对于快速运动的物体，空气阻力更接近于与 $v^2$ 成正比。假设一个从静止开始下落的物体满足 $v' = 9.8 - \dfrac{v^2}{245}$， $v(0) = 0$（假设的数值）。

- (a) 求终端速度。
- (b) 用部分分式解方程，并证明 $v = 49\tanh(t/5)$。
- (c) 物体经过多长时间达到终端速度的 95%？与练习 13.6 比较，其中的阻力为 $0.2v$，终端速度同样是 49 米/秒。

::: solution
**(a)** $v' = 0$ 当 $v^2 = 9.8 \cdot 245 = 2401$ 时，达到终端速度 $v = 49$ m/s。

**(b)** 写出 $v' = \dfrac{2401 - v^2}{245}$。解从 0 开始，低于平衡点 49，因此 $0 \le v < 49$ 对于 $t \ge 0$（它上升，因为在 $v' > 0$ 那里，且无法穿过平衡点），你可以分离变量：

$$\int\frac{dv}{2401 - v^2} = \int\frac{dt}{245}.$$

通过部分分式分解，得到 $\dfrac{1}{2401 - v^2} = \dfrac{1}{(49 - v)(49 + v)} = \dfrac{1}{98}\Big(\dfrac{1}{49 - v} + \dfrac{1}{49 + v}\Big)$，因此左边为

$$\begin{aligned} &\frac{1}{98}\Big(-\ln(49 - v) + \ln(49 + v)\Big) \\ &\quad= \frac{1}{98}\ln\frac{49 + v}{49 - v}. \end{aligned}$$

在 $t = 0$ 时， $v = 0$ 和两边均为 0，因此常数为 0，且 $\ln\dfrac{49 + v}{49 - v} = \dfrac{98t}{245} = \dfrac{2t}{5}$。因此 $\dfrac{49 + v}{49 - v} = e^{2t/5}$，所以 $49 + v = e^{2t/5}(49 - v)$， $v\big(1 + e^{2t/5}\big) = 49\big(e^{2t/5} - 1\big)$，且乘以 $e^{-t/5}$ 的分子和分母，

$$\begin{aligned} v &= 49\,\frac{e^{2t/5} - 1}{e^{2t/5} + 1} \\ &= 49\,\frac{e^{t/5} - e^{-t/5}}{e^{t/5} + e^{-t/5}} \\ &= 49\tanh\frac{t}{5}, \end{aligned}$$

因为 $\tanh x = \dfrac{\sinh x}{\cosh x} = \dfrac{e^x - e^{-x}}{e^x + e^{-x}}$（模块 6）。

**(c)** $\tanh\dfrac t5 = 0.95$ 表示 $\dfrac{e^{2t/5} - 1}{e^{2t/5} + 1} = 0.95$，因此 $e^{2t/5} = \dfrac{1.95}{0.05} = 39$ 且

$$t = \frac52\ln 39 \approx 9.16 \text{ seconds},$$

对于练习 13.6 中的 15.0 秒。对于 $0 < v < 49$, $\dfrac{v^2}{245} < \dfrac{49v}{245} = 0.2v$: 在达到终端速度之前，任何速度下二次阻力是两者中较弱的，因此该物体加速更快。

```check
same(Rational(98, 10)*245, 2401); same(sqrt(2401), 49)
same_set(solve(Rational(98, 10) - v**2/245, v), [-49, 49]); holds((Rational(98, 10) - v**2/245).subs(v, 0) > 0)   # v' > 0 for -49 < v < 49
same(apart(1/(2401 - v**2), v), Rational(1, 98)*(1/(49 - v) + 1/(49 + v)))
antideriv(log((49 + v)/(49 - v))/98, 1/(2401 - v**2), v)
same(Rational(98, 245), Rational(2, 5))
sol11 = solve(Eq((49 + v)/(49 - v), exp(2*t/5)), v)
same(len(sol11), 1); same(sol11[0].rewrite(exp), 49*(exp(2*t/5) - 1)/(exp(2*t/5) + 1))
v11 = 49*tanh(t/5)
steps(49*(exp(2*t/5) - 1)/(exp(2*t/5) + 1), 49*(exp(t/5) - exp(-t/5))/(exp(t/5) + exp(-t/5)), v11.rewrite(exp))
same(diff(v11, t), Rational(98, 10) - v11**2/245); same(v11.subs(t, 0), 0)
same(solve(Eq((exp(x) - 1)/(exp(x) + 1), Rational(95, 100)), x), [log(39)]); same(Rational(195, 100)/Rational(5, 100), 39)
rounds(Rational(5, 2)*log(39), '9.16'); rounds(5*log(20), '15.0')
vq = symbols('v', positive=True); same(49*vq/245, vq/5)
```
:::
::::

:::: exercise RC 电路作为滤波器 {#ex-13-12} ★★★
一个 $R = 1$ 欧姆和 $C = 1$ 法拉的 RC 电路，其时间常数为 $RC = 1$ 秒，由交流电压 $\sin t$ 伏驱动。其电荷满足 $q' + q = \sin t$，和 $q(0) = 0$。

- (a) 解初始值问题。
- (b) 证明一旦 $e^{-t}$ 项衰减消失， $q(t) = \dfrac{1}{\sqrt2}\sin\Big(t - \dfrac{\pi}{4}\Big)$: 一个与输入频率相同的波，幅度减小 $\tfrac{1}{\sqrt2}$ 倍，并延迟 $\tfrac{\pi}{4}$。

::: solution
**(a)** 方程为标准形式，具有 $p = 1$，因此 $\mu = e^t$ 和 $(e^tq)' = e^t\sin t$。通过分部积分两次（模块 11）。令 $J = \int e^t\sin t\,dt$。带入 $u = \sin t$ 和 $dv = e^t\,dt$，得到 $J = e^t\sin t - \int e^t\cos t\,dt$；带入 $u = \cos t$，得到 $\int e^t\cos t\,dt = e^t\cos t + \int e^t\sin t\,dt = e^t\cos t + J$。因此 $J = e^t\sin t - e^t\cos t - J$，

$$\begin{aligned} &\int e^t\sin t\,dt \\ &\quad= \frac{e^t(\sin t - \cos t)}{2} + C. \end{aligned}$$

然后 $e^tq = \tfrac12 e^t(\sin t - \cos t) + C$，所以 $q = \tfrac12(\sin t - \cos t) + Ce^{-t}$，并且 $q(0) = -\tfrac12 + C = 0$ 给出 $C = \tfrac12$：

$$q(t) = \frac{\sin t - \cos t + e^{-t}}{2}.$$

**(b)** 过了几秒后，$e^{-t}$ 可以忽略，且 $q \approx \tfrac12(\sin t - \cos t)$。由[第 1.4 节](module_01_ZH.html#trig)的加法公式得 $\sin\big(t - \tfrac\pi4\big) = \sin t\cos\tfrac\pi4 - \cos t\sin\tfrac\pi4$，又有 $\cos\tfrac\pi4 = \sin\tfrac\pi4 = \tfrac{1}{\sqrt2}$，因此

$$\sin\Big(t - \frac\pi4\Big) = \frac{\sin t - \cos t}{\sqrt2},$$

所以 $\tfrac12(\sin t - \cos t) = \tfrac{1}{\sqrt2}\sin\big(t - \tfrac\pi4\big)$。输入的振幅为 1；输出的振幅为 $\tfrac{1}{\sqrt2} \approx 0.707$，并且滞后一个周期的八分之一。对于输入 $\sin\omega t$，同样的步骤给出振幅 $1/\sqrt{1 + \omega^2}$：输入振荡得越快，输出响应就越小。这就是低通滤波器的作用。

```check
same(diff(exp(t)*yfun(t), t), exp(t)*(Derivative(yfun(t), t) + yfun(t)))
steps(Integral(exp(t)*sin(t), t), exp(t)*sin(t) - Integral(exp(t)*cos(t), t))
steps(Integral(exp(t)*cos(t), t), exp(t)*cos(t) + Integral(exp(t)*sin(t), t))
antideriv(exp(t)*(sin(t) - cos(t))/2, exp(t)*sin(t), t)
q12 = (sin(t) - cos(t) + exp(-t))/2
same(diff(q12, t) + q12, sin(t)); same(q12.subs(t, 0), 0)
same(expand_trig(sin(t - pi/4)), sin(t)*cos(pi/4) - cos(t)*sin(pi/4)); same(cos(pi/4), 1/sqrt(2)); same(sin(pi/4), 1/sqrt(2))
same(sin(t - pi/4), (sin(t) - cos(t))/sqrt(2)); same((sin(t) - cos(t))/2, sin(t - pi/4)/sqrt(2)); rounds(1/sqrt(2), '0.707')
wq = symbols('omega', positive=True)
qw = (sin(wq*t) - wq*cos(wq*t))/(1 + wq**2)
same(diff(qw, t) + qw, sin(wq*t)); same(sqrt(1 + wq**2)/(1 + wq**2), 1/sqrt(1 + wq**2))
```
:::
::::

## 自测 {#quiz}

```quiz
? 微分方程 $y'' + (y')^3 = t$ 的阶数是
- [ ] 3
- [x] 2
- [ ] 1
- [ ] 6
> 阶数是方程中最高阶导数的阶数，这里 $y''$，因此是 2。 $(y')^3$ 中的指数是第一导数的幂，而不是第三导数：3 和 6 混淆了幂和阶数，而 1 忽略了 $y''$。

? 哪个函数是 $y' = 2y$ 在 $y(0) = 3$ 条件下的解？
- [x] $3e^{2t}$
- [ ] $e^{2t} + 2$
- [ ] $2e^{3t}$
- [ ] $3e^{t/2}$
> 根据定理 13.4，方程 $y' = 2y$ 的解为 $y(0)e^{2t}$，此处 $3e^{2t}$。 $e^{2t} + 2$ 在 0 处的值正确，但其导数 $2e^{2t}$ 不是 $2y = 2e^{2t} + 4$。 $2e^{3t}$ 交换了两个常数，而 $3e^{t/2}$ 的增长率为 $\tfrac12y$。

? 在 $y' = t - y$ 的方向场中，点 $(2, -1)$ 处的线段斜率为
- [ ] $1$
- [ ] $-3$
- [ ] $-\tfrac12$
- [x] $3$
> $(t, y)$ 处的斜率为 $t - y = 2 - (-1) = 3$。答案 1 添加了 $t$ 和 $y$ 而非； $-3$ 计算 $y - t$； $-\tfrac12$ 是从原点到该点连线的斜率，与场无关。

? 方程 $y' = y(2 - y)$ 的平衡点为
- [ ] 0，稳定，和 2，不稳定
- [ ] 0 和 2，两者均稳定
- [x] 0，不稳定，和 2，稳定
- [ ] 仅 2，其为稳定
> $f(y) = y(2 - y)$ 在 $y = 0$ 和 $y = 2$ 处为 0，且 $f'(y) = 2 - 2y$ 给出 $f'(0) = 2 > 0$（不稳定）和 $f'(2) = -2 < 0$（稳定）：介于 0 和 2 之间，即 $f > 0$，因此解从 0 增长远离 0 趋向于 2。常数解 $y = 0$ 也是一个平衡点，因此“仅 2”漏掉了它。

? 使用 $h = 0.5$ 作为步长的欧拉方法，对 $y' = y$、$y(0) = 1$ 进行近似，用以下公式近似 $y(1)$：
- [ ] 1.5
- [x] 2.25
- [ ] 2
- [ ] 2.718
> 每一步乘以 $1 + h = 1.5$，两步到达 $t = 1$：$1.5^2 = 2.25$。1.5 是一步后的值，在 $t = 0.5$；2 是一步使用 $h = 1$ 得到的值，或两步保持初始斜率 1 的值；2.718 是精确值 $e$，有限步数的欧拉方法无法达到。

? 使用步长 $h = 0.1$，欧拉方法在 $t = 2$ 处的误差为 0.04。在 $t = 2$ 处，使用 $h = 0.05$ 时的误差约为
- [ ] 0.04
- [ ] 0.01
- [ ] 0.0025
- [x] 0.02
> 欧拉方法的阶数为 1：其误差大约是一个常数乘以 $h$，因此将 $h$ 减半大致会使误差减半。0.01 是二阶方法的行为，0.0025 是四阶方法（如 RK4）的行为，误差不会保持在 0.04：更小的步长会使数值解更接近真实解。

? 方程 $y' + 3y = e^t$ 的一个积分因子为
- [x] $e^{3t}$
- [ ] $e^{t}$
- [ ] $3t$
- [ ] $e^{-3t}$
> 标准形式为 $p(t) = 3$，因此 $\mu = e^{\int 3\,dt} = e^{3t}$，然后 $\big(e^{3t}y\big)' = e^{4t}$。 $e^t$ 来自右边，右边在 $\mu$ 中不起作用； $3t$ 是 $p$ 的原函数，不包含指数项；当使用 $e^{-3t}$ 时，左边不是乘积的导数。

? 方程 $y'' + 2y' + 5y = 0$ 的通解为
- [ ] $C_1e^{t} + C_2e^{-5t}$
- [ ] $e^{-2t}\big(C_1\cos t + C_2\sin t\big)$
- [x] $e^{-t}\big(C_1\cos 2t + C_2\sin 2t\big)$
- [ ] $(C_1 + C_2t)\,e^{-t}$
> 特征方程 $r^2 + 2r + 5 = 0$ 的判别式为 $4 - 20 = -16 < 0$，因此 $\alpha = -1$ 和 $\beta = \sqrt{16}/2 = 2$。交换 $\alpha$ 和 $\beta$ 得到第二种情况；实指数需要实根（1 和 $-5$ 是方程 $r^2 + 4r - 5$ 的根）； $(C_1 + C_2t)e^{-t}$ 需要重根。
```

```check
holds(ode_order(Derivative(yf(t), t, 2) + Derivative(yf(t), t)**3 - t, yf(t)) == 2)
same(diff(3*exp(2*t), t), 2*3*exp(2*t)); same((3*exp(2*t)).subs(t, 0), 3); same(diff(exp(2*t) + 2, t) - 2*(exp(2*t) + 2), -4)
same((t - y).subs({t: 2, y: -1}), 3)
same_set(solve(y*(2 - y), y), [0, 2]); same(diff(y*(2 - y), y).subs(y, 0), 2); same(diff(y*(2 - y), y).subs(y, 2), -2)
same(Rational(3, 2)**2, Rational(9, 4)); same(1 + Rational(1, 2), Rational(3, 2)); same(1 + 1*1, 2); same(1 + Rational(1, 2)*1 + Rational(1, 2)*1, 2); rounds(E, '2.718')
same(Rational(4, 100)/2, Rational(2, 100))
same(exp(integrate(3, t)), exp(3*t)); same(diff(exp(3*t)*yf(t), t), exp(3*t)*(Derivative(yf(t), t) + 3*yf(t))); same(exp(3*t)*exp(t), exp(4*t))
same(solve(r**2 + 2*r + 5, r), [-1 - 2*I, -1 + 2*I]); same(solve(r**2 + 4*r - 5, r), [-5, 1])
same(diff(exp(-t)*cos(2*t), t, 2) + 2*diff(exp(-t)*cos(2*t), t) + 5*exp(-t)*cos(2*t), 0)
```
