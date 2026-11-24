---
title: 微积分基本定理
part: 3
lead: 把微分和积分联系起来。你将从导数还原函数，观察曲线下的面积怎样随右端点移动而变化，并证明其变化率等于曲线在端点处的高度。用原函数计算定积分，用换元法逆用链式法则，再用 SymPy 验证。
minutes: 255
needs: 模块1至9，特别是链式法则（模块5）、平均值定理及其后果（模块8）和定积分（模块9）
goals:
  - 用基本原函数表找出原函数，解释常数 $C$，并解决初始值问题，如由速度求位置
  - 从图和数字读取面积函数 $A(x) = \int_a^x f(t)\,dt$，并说明它何时增加、减少以及最大
  - 陈述微积分基本定理的两个部分及其条件，证明它们，并对限变动的积分求导
  - 用原函数计算定积分，并用净变化定理计算位移、路程和累积量
  - 用替换法进行不定积分和定积分，正确改变积分限
  - 使用 SymPy 进行积分，通过对其求导来验证不定积分，并解释那些相差常数或使用特殊函数的答案
---

## 原函数 {#antiderivatives}

模块 4 从一个位置出发并求得速度：对 $s(t)$ 求导你得到 $v(t)$。通常问题的反向情况也很常见。汽车的速度表记录其速度，你想要知道汽车的位置；手机的加速度计测量加速度，手机想要其速度；一个模型说明某个量的变化率，你想要该量本身。每次你都知道一个导数并想要得到其原始函数。本节和下一节将撤销导数。模块其余部分将展示撤销导数也是计算模块 9 中面积的方法，这种联系，即微积分基本定理，将微积分的两个部分结合为一个学科。

从猜测开始。哪个函数的导数是$2x$？你已知一个：$x^2$，因为$\big(x^2\big)' = 2x$。但$x^2 + 1$的导数也是$2x$，$x^2 - 7$和$x^2 + \pi$亦然：常数的导数为0，因此加上常数不会改变结果。

::: definition 原函数
设$f$是定义在区间$I$上的函数。若$F'(x) = f(x)$对$I$中每个$x$成立，则函数$F$是$f$在$I$上的**原函数**。（在属于$I$的$I$的端点处，$F'$表示Module 4的单侧导数。）
:::

所以 $x^2$ 是 $2x$ 在 $\R$ 上的原函数， $\sin x$ 是 $\cos x$ 的原函数， $-\cos x$ 是 $\sin x$ 的原原函数， $e^x$ 是它本身的原函数。根据模块 6， $\ln x$ 是 $1/x$ 在 $(0, \infty)$ 上的原函数。

```check
antideriv(x**2, 2*x, x); antideriv(x**2 + 1, 2*x, x); antideriv(x**2 - 7, 2*x, x); antideriv(x**2 + pi, 2*x, x)
antideriv(sin(x), cos(x), x); antideriv(-cos(x), sin(x), x); antideriv(exp(x), exp(x), x)
xp = symbols('x', positive=True)
antideriv(log(xp), 1/xp, xp)
```

图 10.1 展示了常数 $C$ 取五个不同值时， $f(x) = x^2 - 1$ 的原函数 $\tfrac13 x^3 - x + C$。加上一个常数会使图像上下平移而不倾斜，因此在每个 $x$ 处，所有这些曲线都有相同的斜率 $f(x)$：它们在该点的切线互相平行。

::: figure id=fig-10-1
图中是 $f(x) = x^2 - 1$ 的原函数 $\tfrac13 x^3 - x + C$，从下到上对应 $C = -2, -1, 0, 1, 2$。每条曲线都是下方一条向上平移 1 个单位所得，所以在每个 $x$ 处斜率相同。在 $x = 1.5$ 处，其切线（橙色）互相平行，斜率为 $f(1.5) = 1.25$。只有蓝色曲线经过点 $(0, 1)$，其对应 $C = 1$（第 10.2 节）。
:::

```check
F1 = x**3/3 - x + c
antideriv(F1, x**2 - 1, x); same((x**2 - 1).subs(x, Rational(3, 2)), Rational(5, 4))
same(F1.subs(c, c + 1) - F1, 1); same(solve(Eq(F1.subs(x, 0), 1), c), [1])
```

除了“其中一个加上一个常数”的形式之外，还有其他原函数吗？不，只要你在区间内保持不变。

::: theorem 函数的原函数
如果 $F$ 是 $f$ 在区间 $I$ 上的原函数，那么 $f$ 在 $I$ 上的原函数恰好是所有形如
$$F(x) + C,$$
其中 $C$ 是一个常数。
:::

::: proof
对每个常数 $C$，在 $I$ 上都有 $(F + C)' = F' + 0 = f$，所以 $F + C$ 是原函数。反过来，设 $G$ 是 $f$ 在 $I$ 上的任一原函数，并取 $H = G - F$，从而对 $I$ 中每个 $x$ 都有 $H'(x) = f(x) - f(x) = 0$。模块 8 已证明这样的函数在开区间上是常数（[定理 8.5](module_08_ZH.html#consequences)），同一论证也适用于其他区间。任取 $I$ 中两个数 $x_1 < x_2$。$H$ 在 $[x_1, x_2]$ 的每一点都有导数（在 $I$ 的端点为单侧导数），因此由[定理 4.1](module_04_ZH.html#continuity)，它在 $[x_1, x_2]$ 上连续。该定理的证明对单侧情形也成立。由微分中值定理，有 $H(x_2) - H(x_1) = H'(c)(x_2 - x_1) = 0$，其中 $c$ 介于 $x_1$ 与 $x_2$ 之间。故 $H$ 在 $I$ 的每一点都取同一值 $C$，即 $G = F + C$。
:::

函数 $F(x) + C$（其中 $C$ 表示任意常数）是 $f$ 在 $I$ 上的**一般原函数**，$C$ 称为**积分常数**。区间条件很重要。证明在 $[x_1, x_2]$ 上使用微分中值定理，所以整个 $[x_1, x_2]$ 必须位于 $I$ 内。$1/x$ 的定义域为 $(-\infty, 0) \cup (0, \infty)$，它不构成一个区间。模块 6 已证明对每个 $x \ne 0$ 都有 $\dfrac{d}{dx}\ln\abs{x} = \dfrac1x$，所以每一半上的原函数都是 $\ln\abs{x} + C$。但在 $x > 0$ 时取 $\ln\abs{x}$、在 $x < 0$ 时取 $\ln\abs{x} + 5$ 的函数，在每个 $x \ne 0$ 处的导数也为 $1/x$，同时无法用任何单一常数 $C$ 写成 $\ln\abs{x} + C$。因此不同区间可以选不同的积分常数。由于 $1/x$ 在 0 处无定义，其原函数无法跨越 0。第 10.5 节说明这对积分的影响。

```check
antideriv(log(x), 1/x, x); antideriv(log(-x), 1/x, x); antideriv(log(-x) + 5, 1/x, x)
xneg = symbols('x', negative=True)
same(log(Abs(xneg)), log(-xneg))      # for x < 0, ln|x| = ln(-x)
```

### 原函数表 {#table}

每一条求导法则，反过来读，就给出一个原函数。在表格中，中间列中每一项的导数是其左边的项；为了得到一般的原函数，每个公式成立的区间上加上 $C$。

| $f(x)$ | 原函数 $F(x)$ | 出处 |
|---|---|---|
| $x^n$, $n \ne -1$ | $\dfrac{x^{n+1}}{n + 1}$ | 参见下文 |
| $\dfrac{1}{x}$ | $\ln\abs{x}$ | $x \ne 0$ |
| $e^x$ | $e^x$ |  |
| $e^{kx}$, $k \ne 0$ | $\dfrac{e^{kx}}{k}$ |  |
| $a^x$, $a > 0$, $a \ne 1$ | $\dfrac{a^x}{\ln a}$ |  |
| $\sin x$ | $-\cos x$ |  |
| $\cos x$ | $\sin x$ |  |
| $\sin kx$, $k \ne 0$ | $-\dfrac{\cos kx}{k}$ |  |
| $\cos kx$, $k \ne 0$ | $\dfrac{\sin kx}{k}$ |  |
| $\sec^2 x$ | $\tan x$ | $\cos x \ne 0$ |
| $\csc^2 x$ | $-\cot x$ | $\sin x \ne 0$ |
| $\sec x\tan x$ | $\sec x$ | $\cos x \ne 0$ |
| $\csc x\cot x$ | $-\csc x$ | $\sin x \ne 0$ |
| $\dfrac{1}{1 + x^2}$ | $\arctan x$ |  |
| $\dfrac{1}{\sqrt{1 - x^2}}$ | $\arcsin x$ | $-1 < x < 1$ |
| $\sinh x$ | $\cosh x$ |  |
| $\cosh x$ | $\sinh x$ |  |

第一行，**原函数的幂法则**，在$(0, \infty)$对每个实数$n \ne -1$成立。当$n$为整数时，它对负数$x$也成立，且对$n = 0, 1, 2, \dots$在$\R$的整个区间成立。用文字表述：幂次加1，再除以新的幂次。对于$n = -1$，它将除以0；此时由第二行取代。带有$k$的行由链式法则（模块5）得出：$\dfrac{d}{dx}\dfrac{e^{kx}}{k} = \dfrac{k e^{kx}}{k} = e^{kx}$。其他行对应的导数来自模块4至6。

```check
for N_ in (-4, -2, 0, 1, 2, 5):
    antideriv(x**(N_ + 1)/(N_ + 1), x**N_, x)
nr = symbols('n', real=True)
antideriv(xp**(nr + 1)/(nr + 1), xp**nr, xp)
kn = symbols('k', nonzero=True); ap = symbols('a', positive=True)
antideriv(exp(kn*x)/kn, exp(kn*x), x); antideriv(-cos(kn*x)/kn, sin(kn*x), x); antideriv(sin(kn*x)/kn, cos(kn*x), x)
same(diff(exp(kn*x)/kn, x), kn*exp(kn*x)/kn)
antideriv(ap**x/log(ap), ap**x, x)
antideriv(tan(x), sec(x)**2, x); antideriv(-cot(x), csc(x)**2, x)
antideriv(sec(x), sec(x)*tan(x), x); antideriv(-csc(x), csc(x)*cot(x), x)
antideriv(atan(x), 1/(1 + x**2), x); antideriv(asin(x), 1/sqrt(1 - x**2), x)
antideriv(cosh(x), sinh(x), x); antideriv(sinh(x), cosh(x), x)
```

模块 4 的两条规则延续下来。如果 $F$ 和 $G$ 是 $f$ 和 $g$ 在一个区间上的原函数，且 $c$ 是一个常数，那么 $cF$ 是 $cf$ 的原函数，且 $F + G$ 是 $f + g$ 的原原函数，因为 $(cF + G)' = cF' + G' = cf + g$。因此，你可以逐项求原函数，保持常数因子不变。

::: example 表格中的原函数
求每个函数的一般原函数。

- (a) $f(x) = 6x^2 - 4x + 5$
- (b) $g(x) = 3\sqrt{x} - \dfrac{2}{x^2}$，对于 $x > 0$
- (c) $h(t) = 4e^{2t} - 3\cos t$
- (d) $q(x) = \dfrac{(x + 1)^2}{x}$，对于 $x \ne 0$

**(a)** 逐项进行，将每个幂次加 1 并除以新的幂次：$6 \cdot \dfrac{x^3}{3} - 4 \cdot \dfrac{x^2}{2} + 5x$，因此一般原函数是 $2x^3 - 2x^2 + 5x + C$。

**(b)** 首先将各项写成幂的形式：$g(x) = 3x^{1/2} - 2x^{-2}$。幂法则给出
$$3\cdot\frac{x^{3/2}}{3/2} - 2\cdot\frac{x^{-1}}{-1} = 2x^{3/2} + \frac{2}{x},$$
因此，一般原函数是 $2x^{3/2} + \dfrac2x + C$ 在 $(0, \infty)$ 上。

**(c)** 由于 $k = 2$ 在表格中，得到 $4\cdot\dfrac{e^{2t}}{2} = 2e^{2t}$；且 $-3\cos t$ 给出 $-3\sin t$。答案是 $2e^{2t} - 3\sin t + C$。

**(d)** 没有商的法则，因此展开并将每一项除以 $x$：$\dfrac{x^2 + 2x + 1}{x} = x + 2 + \dfrac1x$。一般原函数是 $\dfrac{x^2}{2} + 2x + \ln\abs{x} + C$ 在 $(0, \infty)$ 上，且在 $(-\infty, 0)$ 上使用相同公式，但常数可能不同。

通过对其求导来检查每一个答案。对于 (b)：$\dfrac{d}{dx}\Big(2x^{3/2} + 2x^{-1}\Big) = 3x^{1/2} - 2x^{-2}$，即 $g(x)$。

```check
same(6*x**3/3 - 4*x**2/2 + 5*x, 2*x**3 - 2*x**2 + 5*x); antideriv(2*x**3 - 2*x**2 + 5*x, 6*x**2 - 4*x + 5, x)
same(3*sqrt(xp) - 2/xp**2, 3*xp**Rational(1, 2) - 2*xp**(-2))
same(3*xp**Rational(3, 2)/Rational(3, 2) - 2*xp**(-1)/(-1), 2*xp**Rational(3, 2) + 2/xp)
antideriv(2*xp**Rational(3, 2) + 2/xp, 3*sqrt(xp) - 2/xp**2, xp)
steps(Derivative(2*xp**Rational(3, 2) + 2*xp**(-1), xp), 3*xp**Rational(1, 2) - 2*xp**(-2))
same(4*exp(2*t)/2, 2*exp(2*t)); antideriv(2*exp(2*t) - 3*sin(t), 4*exp(2*t) - 3*cos(t), t)
same(expand((x + 1)**2/x), x + 2 + 1/x)
antideriv(x**2/2 + 2*x + log(x), (x + 1)**2/x, x); antideriv(x**2/2 + 2*x + log(-x), (x + 1)**2/x, x)
```
:::

::: tip
求导比撤销导数更容易，因此始终通过对其求导来检查原函数。只需几秒钟，几乎能发现所有错误。
:::

::: pitfall
三张卡片。 **(1)**反向幂法则会提高幂并进行除法：$x^3$ 的一个原函数是 $\tfrac14 x^4$，而不是 $3x^2$（这是导数）也不是 $x^4$（其导数是 $4x^3$）。**(2)**原函数没有乘积法则：$x\cos x$ 的一个原函数不是 $\tfrac12 x^2\sin x$，其导数是 $x\sin x + \tfrac12 x^2\cos x$。模块 11 积分此类乘积；第 10.7 节处理其中一个因子是另一个因子内部导数的情况。**(3)** “$+\,C$”是求所有原函数时的一部分，当定义域由多个区间组成，如 $x \ne 0$，常数可能在每个区间上不同。

```check
antideriv(x**4/4, x**3, x); same(diff(x**3, x), 3*x**2); same(diff(x**4, x), 4*x**3)
same(diff(x**2*sin(x)/2, x), x*sin(x) + x**2*cos(x)/2); holds(Ne((x*sin(x) + x**2*cos(x)/2).subs(x, 1), cos(1)))
```
:::

## 初始值问题 {#initial-value}

图 10.1 展示了如何从原函数族中选择一个：要求图象通过给定点的那个。在曲线 $\tfrac13 x^3 - x + C$ 中，只有 $C = 1$ 通过 $(0, 1)$。

::: definition 初始值问题
一个 **初始值问题** 要求一个函数 $y = F(x)$ 满足
$$\begin{aligned} &F'(x) = f(x) \text{ for every } x \text{ in } I, \\ &F(x_0) = y_0, \end{aligned}$$
其中 $I$ 是一个区间，$x_0$ 是 $I$ 的一个点，$y_0$ 是一个数。方程 $F' = f$ 是最简单的 **differential equation**类型，即一个涉及未知函数导数的方程，而 $F(x_0) = y_0$ 是**initial condition**。
:::

如果 $f$ 在 $I$ 上有一个原函数 $G$，则该问题有且仅有一个解。根据定理 10.1，每个解都有形式 $G + C$；初始条件说明 $G(x_0) + C = y_0$，因此 $C = y_0 - G(x_0)$，解为
$$F(x) = G(x) - G(x_0) + y_0.$$
解决这个问题的方法是：找出一般的原函数，代入初始条件，然后解出 $C$。模块 13 研究的是微分方程，其中导数依赖于未知函数，例如 $y' = ky$。

```check
G_ = Function('G')
same((G_(x) - G_(a) + b).subs(x, a), b); same(diff(G_(x) - G_(a) + b, x), diff(G_(x), x))
```

::: example 初始值问题
求函数 $F$，使得 $F'(x) = 3\sqrt x - \dfrac{2}{x^2}$ 在 $x > 0$ 处，且 $F(1) = 5$。

根据例题 10.1(b)，一般的原函数是 $F(x) = 2x^{3/2} + \dfrac2x + C$。初始条件给出
$$F(1) = 2 + 2 + C = 4 + C = 5,$$
因此 $C = 1$ 且
$$F(x) = 2x^{3/2} + \frac2x + 1, \qquad x > 0.$$
检查：$F(1) = 2 + 2 + 1 = 5$，而$F'$ 是给定的函数，如例 10.1 所示。

```check
F2 = 2*xp**Rational(3, 2) + 2/xp
same((F2 + c).subs(xp, 1), 4 + c); same(solve(Eq(4 + c, 5), c), [1])
antideriv(F2 + 1, 3*sqrt(xp) - 2/xp**2, xp); same((F2 + 1).subs(xp, 1), 5)
```
:::

运动是初值问题的经典来源：速度是位置的导数，加速度是速度的导数（模块 4），因此，从加速度和两个初始条件可以恢复整个运动。

::: example 再次考虑下落的球
模块 1 将下落的球的下落距离 $s(t) = 4.9t^2$ 米作为已知。推导它。从释放点向下测量距离。在地球表面附近，忽略空气阻力时，球的加速度是常量，为 $a(t) = 9.8$ m/s²，且从静止释放：$v(0) = 0$ 和$s(0) = 0$。

- (a) 求速度 $v(t)$ 和下落距离 $s(t)$。
- (b) 一个球以 14.7 m/s 的初速度从离地面 1.5 m 高处竖直向上抛出。以 $y$ 为向上方向的坐标，求 $y(t)$。

**(a)** 速度是加速度的原函数： $v(t) = 9.8t + C_1$。 条件 $v(0) = 0$ 给出 $C_1 = 0$，因此 $v(t) = 9.8t$。 位置是速度的原函数： $s(t) = 4.9t^2 + C_2$，且 $s(0) = 0$ 给出 $C_2 = 0$。 所以
$$s(t) = 4.9t^2,$$
模块 1 的公式，现在由一个物理事实推导得出：加速度是恒定的。

**(b)** 高度向上测量，重力向下拉，因此 $a(t) = -9.8$。 然后 $v(t) = -9.8t + C_1$，且 $v(0) = 14.7$ 给出 $C_1 = 14.7$。 接下来 $y(t) = -4.9t^2 + 14.7t + C_2$，且 $y(0) = 1.5$ 给出 $C_2 = 1.5$：
$$y(t) = 1.5 + 14.7t - 4.9t^2,$$
高度 [练习 4.7](module_04_ZH.html#ex-4-7) 已求导。一般来说，一个初始速度为 $v_0$、初始位置为 $s_0$ 且加速度恒定为 $a$ 的物体，其位置为 $s(t) = s_0 + v_0 t + \tfrac12 a t^2$。

```check
C1, C2 = symbols('C1 C2')
antideriv(Rational(98, 10)*t + C1, Rational(98, 10), t); same(solve((Rational(98, 10)*t + C1).subs(t, 0), C1), [0])
antideriv(Rational(49, 10)*t**2 + C2, Rational(98, 10)*t, t); same(solve((Rational(49, 10)*t**2 + C2).subs(t, 0), C2), [0])
antideriv(-Rational(98, 10)*t + C1, -Rational(98, 10), t); same(solve(Eq((-Rational(98, 10)*t + C1).subs(t, 0), Rational(147, 10)), C1), [Rational(147, 10)])
yb3 = -Rational(49, 10)*t**2 + Rational(147, 10)*t + C2
antideriv(yb3, -Rational(98, 10)*t + Rational(147, 10), t); same(solve(Eq(yb3.subs(t, 0), Rational(3, 2)), C2), [Rational(3, 2)])
a0, v0, s0 = symbols('a_0 v_0 s_0')
sg = s0 + v0*t + a0*t**2/2
same(diff(sg, t, 2), a0); same(diff(sg, t).subs(t, 0), v0); same(sg.subs(t, 0), s0)
same(sg.subs({s0: Rational(3, 2), v0: Rational(147, 10), a0: -Rational(98, 10)}), Rational(3, 2) + Rational(147, 10)*t - Rational(49, 10)*t**2)
```
:::

::: pitfall
两个初始值问题的卡片。 **(1)**每次求原函数都会引入自己的常数。在例题 10.3 中，速度需要 $C_1$，由 $v(0)$ 确定，位置需要 $C_2$，由 $s(0)$ 确定；忽略 $C_1$ 会丢失初始速度。**(2)** $C$ 不一定总是初始值。如果 $s'(t) = \sin t$ 和 $s(0) = 0$，则 $s(t) = -\cos t + C$ 和 $s(0) = -1 + C = 0$，因此 $C = 1$ 和 $s(t) = 1 - \cos t$；设定 $C = 0$ 将得到 $s(0) = -1$。将条件代入整个原函数，然后解出 $C$。

```check
same(solve(Eq((-cos(t) + c).subs(t, 0), 0), c), [1]); antideriv(1 - cos(t), sin(t), t); same((1 - cos(t)).subs(t, 0), 0); same(-cos(0), -1)
```
:::

## 面积函数 {#area-function}

模块 9 定义了定积分 $\int_a^b f(x)\,dx$ 为黎曼和 $\sum f(x_i^*)\,\Delta x_i$ 的极限，当划分的范数，即最宽子区间的宽度，趋近于 0 时；当 $f$ 在 $[a, b]$ 上连续时，该极限存在，且 $f$ 可积。其中，当 $f$ 为正时，积分是其图像与 $x$ 轴之间的面积；当 $f$ 为负时，该面积计入负值，因此积分是一个有符号的面积。本模块使用了模块 9 中的以下性质：

- $\displaystyle\int_a^a f(x)\,dx = 0$ 和 $\displaystyle\int_b^a f(x)\,dx = -\int_a^b f(x)\,dx$；
- **分割**：对于 $\displaystyle\int_a^c f(x)\,dx = \int_a^b f(x)\,dx + \int_b^c f(x)\,dx$，当 $a$、 $b$ 和 $c$ 以任意顺序排列时，若 $f$ 在包含这三个点的闭区间上可积；
- **线性性**： $\displaystyle\int_a^b \big(c f(x) + g(x)\big)\,dx = c\int_a^b f(x)\,dx + \int_a^b g(x)\,dx$；
- **有界性**：若 $a < b$ 和 $m \le f(x) \le M$ 是 $a \le x \le b$ 的上界和下界，则 $m(b - a) \le \displaystyle\int_a^b f(x)\,dx \le M(b - a)$；
- **积分中值定理**：如果 $f$ 在 $[a, b]$ 上连续，其中 $a < b$，则存在 $c$ 属于 $[a, b]$，使得 $\displaystyle\int_a^b f(x)\,dx = f(c)\,(b - a)$。

现在保持左端固定，让右端移动。

::: definition 面积函数
设$I$为一个区间，设$f$在$I$内的每个闭区间上可积（当$f$在$I$上连续时即如此），并设$a$为$I$中的一个点。$f$从$a$出发的**面积函数**是
$$A(x) = \int_a^x f(t)\,dt, \qquad x \text{ in } I.$$
:::

读作 “A of x 是从 a 到 x 对 f of t 的积分”。它也被称为 **积累函数**：随着 $x$ 向右移动， $A(x)$ 积累 $f$ 下方的有符号面积。对于 $x < a$，积分方向相反，即 $A(x) = -\int_x^a f(t)\,dt$。如在模块 9 中，字母 $t$ 是一个哑变量： $\int_a^x f(t)\,dt$ 和 $\int_a^x f(s)\,ds$ 是同一个数，如同一个和 $\sum_{i=1}^n i^2$ 不依赖于变量 $i$ 的名称。写作 $\int_a^x f(x)\,dx$ 会使得 $x$ 同时表示右端点和从 $a$ 移动到它的变量，因此变量需要另一个名称。

::: figure id=fig-10-2
例 10.4 的分段线性函数 $f$（上图）及面积函数 $A(x) = \int_0^x f(t)\,dt$（下图）。图中标出了从 0 到 5 的面积：$f > 0$ 时为蓝色并按正值计入，$f < 0$ 时为橙色并按负值计入，因此 $A(5) = 5 - 2.5 = 2.5$。当 $f$ 为正时，$A$ 上升；当 $f$ 为负时下降。它在 $x = 3$ 处达到最大值，此时 $f$ 改变符号。虚线是 $A$ 在 $x = 5$ 处的切线，斜率为 $f(5) = -1$。
:::

::: example 阅读面积函数
设 $f$ 为图 10.2 中的函数，
$$f(t) = \begin{cases} 2 & \text{if } 0 \le t \le 2, \\ 6 - 2t & \text{if } 2 < t \le 4, \\ t - 6 & \text{if } 4 < t \le 6, \end{cases}$$
并设 $A(x) = \int_0^x f(t)\,dt$ 对应 $0 \le x \le 6$。

- (a) 求 $A(x)$ 对应 $x = 0, 1, 2, \dots, 6$。
- (b) 判断 $A$ 在何处递增、递减，以及在何处达到最大值？
- (c) 比较 $A$ 图像的斜率与 $f$ 图像的高度。

**(a)** 区域是矩形、三角形和梯形。$A(0) = 0$ 在 $[0, 2]$ 上， $f = 2$，所以 $A(1) = 2$ 和 $A(2) = 4$。从 2 到 3， $f$ 从 2 落到 0：一个面积为 $\tfrac12 \cdot 1 \cdot 2 = 1$ 的三角形，所以 $A(3) = 5$。从 3 到 4， $f$ 从 0 落到 $-2$：一个位于轴下方的三角形，其有符号面积为 $-1$，所以 $A(4) = 4$。从 4 到 5， $f$ 从 $-2$ 上升到 $-1$：一个位于轴下方的梯形，其有符号面积为 $-\tfrac{2 + 1}{2} \cdot 1 = -1.5$，所以 $A(5) = 2.5$。从 5 到 6，一个有符号面积为 $-0.5$ 的三角形： $A(6) = 2$。因此，对于 $x = 0, 1, \dots, 6$， $A(x)$ 为 0, 2, 4, 5, 4, 2.5 和 2。

**(b)** 当 $x$ 经过 $[0, 3]$, $f \ge 0$，因此每一步增加面积且 $A$ 增加，从 0 到 5。在 $[3, 6]$， $f \le 0$，因此每一步减少面积且 $A$ 减少，从 5 到 2。 $A$ 在 $x = 3$ 最大，此时 $f$ 由正变负： $A(3) = 5$。

**(c)** 在 $[0, 2]$， $A(x) = 2x$：一条斜率为 2 的直线，且在 $f$ 那里高度为 2。在 $x = 3$， $A$ 的图像在顶部平坦，且 $f(3) = 0$。对于 $4 \le x \le 6$，4 到 $x$ 之间的区域是一个在轴下方的梯形，两平行边分别为 2 和 $6 - x$，宽度为 $x - 4$，因此
$$\begin{aligned} A(x) &= 4 - \tfrac12\,\big(2 + (6 - x)\big)(x - 4) \\ &= \tfrac12 x^2 - 6x + 20. \end{aligned}$$
根据模块4的规则，$A'(x) = x - 6$即为该部分上的$f(x)$；在$x = 5$、$A'(5) = -1 = f(5)$处，图10.2中虚线切线的斜率。每次，$A$在$x$处的斜率等于$f$在$x$处的高度。第10.4节证明了当$f$连续时，这总是成立。

```check
fpw = Piecewise((2, t <= 2), (6 - 2*t, t <= 4), (t - 6, True))
Apw = lambda X: integrate(fpw, (t, 0, X))
same([Apw(k_) for k_ in range(7)], [0, 2, 4, 5, 4, Rational(5, 2), 2])
same(Rational(1, 2)*1*2, 1); same(-Rational(2 + 1, 2)*1, -Rational(3, 2)); same(Apw(6) - Apw(5), -Rational(1, 2))
same([fpw.subs(t, v_) for v_ in (2, 3, 4, 5, 6)], [2, 0, -2, -1, 0])
xx = symbols('xx')
same(Apw(xx).subs(xx, Rational(3, 2)), 3); same(2*xx, integrate(2, (t, 0, xx)))
steps(4 - Rational(1, 2)*(2 + (6 - xx))*(xx - 4), xx**2/2 - 6*xx + 20); same(4 + integrate(t - 6, (t, 4, xx)), xx**2/2 - 6*xx + 20)
same(diff(xx**2/2 - 6*xx + 20, xx), xx - 6); same((xx - 6).subs(xx, 5), -1)
```
:::

这里是另一个例子，使用数字而不是形状。设$f(t) = \cos t$ 和$A(x) = \int_0^x \cos t\,dt$。现在三角形不再有帮助。表格中$A$ 的值是数值计算得到的，就像使用大量矩形的黎曼和所给出的一样，而$A$ 的前向差值（步长为 0.001）也是如此，它们是其图像上短弦的斜率：

```valuetable
x = 0.5, 1, 1.5, 2, 3
$A(x)$ = Integral(cos(t), (t, 0, x))
$\dfrac{A(x + 0.001) - A(x)}{0.001}$ = (Integral(cos(t), (t, 0, x + 1/1000)) - Integral(cos(t), (t, 0, x)))*1000
$\cos x$ = cos(x)
digits = 6
---
x | A(x) | \dfrac{A(x + 0.001) - A(x)}{0.001} | \cos x
0.5 | 0.479426 | 0.877343 | 0.877583
1 | 0.841471 | 0.539881 | 0.540302
1.5 | 0.997495 | 0.0702384 | 0.0707372
2 | 0.909297 | -0.416601 | -0.416147
3 | 0.141120 | -0.990063 | -0.989992
```

$A$ 的斜率与$\cos x$ 相同，精确到小数点后三位，正如步长为 0.001 的前向差值所显示的（模块 4）。而$A$ 在$\cos x > 0$ 上升至$x = \pi/2 \approx 1.571$ 时增加，之后下降。你可能还认出$A$ 的值：$\sin 1 \approx 0.841471$ 和$\sin 2 \approx 0.909297$。这两个观察都是微积分基本定理在起作用。

```check
for v_ in (Rational(1, 2), 1, Rational(3, 2), 2, 3):
    near(integrate(cos(t), (t, 0, v_)), sin(v_), 1e-25)
    q_ = (sin(v_ + Rational(1, 1000)) - sin(v_))*1000
    holds(Abs(q_ - cos(v_)) < Rational(6, 10000))
rounds(pi/2, '1.571'); rounds(sin(1), '0.841471'); rounds(sin(2), '0.909297')
```

以下演示会绘制你所选函数的两个图像。

::: widget name=accumulation
从 $f(x) = \sin x$ 和 $a = 0$ 开始，用滑块、方向键或点击任一图像来移动 $x$。顶部图像会从 $a$ 到 $x$ 阴影出区域，正数部分用蓝色表示，负数部分用橙色表示；底部图像为 $A(x)$，是数值计算的结果。比较上方紫色高度 $f(x)$ 与下方紫色切线：无论你在哪里，读数都会显示 $A$ 在 $x$ 处的斜率等于 $f(x)$，并且当 $f$ 改变符号时， $A$ 会出现峰值或谷值。然后移动 $a$： $A$ 的图像会上下移动，它始终经过 $(a, 0)$，且斜率不会改变（第 10.4 节解释了原因）。最后输入 `sign(x)`，它在 0 处跳跃，设置 $a = -2$ 并将 $x$ 移动到 0： $A$ 在那里有一个拐点。
:::

::: pitfall
$A(x)$ 是一个面积，$f(x)$ 是一个高度：不同的数值。在例 10.4 中，$A(5) = 2.5$ 而 $f(5) = -1$。递减函数不必为负：$A$ 在 $[3, 6]$ 上递减但保持正值，因为在 $x = 3$ 之后损失的面积小于之前获得的面积。$f$ 的符号告诉你 $A$ 是上升还是下降，而不是 $A$ 是否为正。
:::

## 基本定理，第一部分 {#ftc1}

在第 10.3 节的两个例子中，面积函数在 $x$ 处的斜率等于 $f$ 在 $x$ 处的高度。这是为什么，用图表示。将右端从 $x$ 移动到 $x + h$，且 $h > 0$ 很小。面积增加由 $x$ 和 $x + h$ 之间的窄条（图 10.3）决定，因此根据分割性质
$$A(x + h) - A(x) = \int_x^{x + h} f(t)\,dt.$$
该条带近似为宽度为 $h$ 且高度为 $f(x)$ 的矩形，因此为 $A(x + h) - A(x) \approx f(x)\,h$，且 $A$ 的差商接近 $f(x)$。条带越窄，近似越精确：在极限情况下，为 $A'(x) = f(x)$。积分的中值定理将这个 "$\approx$" 转化为一个精确的陈述。

::: figure id=fig-10-3
第一部分证明思想。面积函数的值 $A(x)$ 是从 $a$ 到 $x$ 的浅色区域的面积。将右端从 $x$ 移动到 $x + h$，则添加了面积为 $A(x + h) - A(x)$ 的深色条带。积分的中值定理给出一个点 $c$，位于 $x$ 和 $x + h$ 之间，使得高度为 $f(c)$（虚线）的矩形恰好等于该条带的面积。当 $h \to 0$ 时， $c$ 被压向 $x$， $f(c)$ 接近 $f(x)$。
:::

::: theorem 微积分基本定理，第一部分
设 $f$ 在 $[a, b]$ 上连续，并设
$$A(x) = \int_a^x f(t)\,dt, \qquad a \le x \le b.$$
则 $A$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导，对每个 $x$ 属于 $(a, b)$，有 $A'(x) = f(x)$，且在端点处其单侧导数分别为 $A'_+(a) = f(a)$ 和 $A'_-(b) = f(b)$。因此 $A$ 是 $f$ 在 $[a, b]$ 上的原函数。在莱布尼茨记号中，
$$\frac{d}{dx}\int_a^x f(t)\,dt = f(x).$$
:::

最后一行读作：“积分从 a 到 x 的 f(t) dt 关于 x 的导数是 f(x)”。

::: proof
设 $x$ ∈ $[a, b]$，且 $h \ne 0$ 与 $x + h$ ∈ $[a, b]$。根据分割性质，
$$\begin{aligned} &A(x + h) - A(x) \\ &\quad= \int_a^{x + h} f(t)\,dt - \int_a^x f(t)\,dt \\ &\quad= \int_x^{x + h} f(t)\,dt. \end{aligned}$$
若 $h > 0$, $f$ 在 $[x, x + h]$ 上连续，则积分中值定理给出一个 $c_h$ ∈ $[x, x + h]$，使得 $\int_x^{x + h} f(t)\,dt = f(c_h)\,h$。若 $h < 0$，则给出 $c_h$ ∈ $[x + h, x]$，使得 $\int_{x + h}^x f(t)\,dt = f(c_h)\,(-h)$，且反转积分限会改变符号，因此仍为 $\int_x^{x + h} f(t)\,dt = f(c_h)\,h$。无论哪种情况，
$$\frac{A(x + h) - A(x)}{h} = f(c_h),$$
其中 $c_h$ 介于 $x$ 与 $x + h$ 之间。

*连续性。* $f$ 在闭区间 $[a, b]$ 上连续，因此根据极值定理（模块 3） $\abs{f}$ 在那里有最大值 $M$。然后 $\abs{A(x + h) - A(x)} = \abs{f(c_h)}\,\abs{h} \le M\abs{h}$，它在 $h \to 0$ 趋于 0 时趋于 0。所以 $A$ 在 $x$ 处连续（当 $x$ 为 $a$ 或 $b$ 时从一侧）。

*导数。* 现在设 $x$ 在 $(a, b)$ 内，因此 $h$ 可能为正或负。由于 $c_h$ 介于 $x$ 和 $x + h$ 之间，所以 $\abs{c_h - x} \le \abs{h}$。令 $\varepsilon > 0$。因为 $f$ 在 $x$ 处连续，存在一个 $\delta > 0$，使得 $\abs{f(c) - f(x)} < \varepsilon$ 每当 $c$ 在 $[a, b]$ 且 $\abs{c - x} < \delta$ 时成立。对于 $0 < \abs{h} < \delta$（其中 $x + h$ 在 $[a, b]$，如前所述），则 $\abs{c_h - x} < \delta$，所以
$$\begin{aligned} \left\lvert \frac{A(x + h) - A(x)}{h} - f(x)\right\rvert &= \abs{f(c_h) - f(x)} \\ &< \varepsilon. \end{aligned}$$
由极限的定义， $A$ 的差商当 $h \to 0$ 趋近于 $A'(x) = f(x)$ 时趋于 $f(x)$。在 $x = a$ 和 $x = b$ 处， $h$ 只能取一个符号，同样的论证表明 $A$ 的单侧导数分别为 $f(a)$ 和 $f(b)$。
:::

```check
fF = Function('f')
same(integrate(cos(t), (t, a, x + h)) - integrate(cos(t), (t, a, x)), integrate(cos(t), (t, x, x + h)))   # splitting, an instance
same(diff(Integral(fF(t), (t, a, x)), x), fF(x))
same(diff(integrate(cos(t)*exp(t), (t, 0, x)), x), cos(x)*exp(x))     # an instance
```

每个假设都被使用了。在 $[a, b]$ 上的连续性给出了积分的中值定理和 $M$ 的界；在 $x$ 处的连续性使得 $f(c_h)$ 趋近于 $f(x)$。没有连续性，结论可能不成立。令 $f(t) = 0$ 为 $t < 0$， $f(t) = 1$ 为 $t \ge 0$，这是一个可积的函数（其积分是矩形的面积），但在 0 处不连续。此时 $A(x) = \int_0^x f(t)\,dt$ 在 $x \le 0$ 处为 0，在 $x$ 处为 $x \ge 0$：其图像在 0 处有一个拐点，像 [小节 4.4](module_04_ZH.html#failures)] 中 $\abs{x}$ 的图像那样，而 $A'(0)$ 不存在。在第 10.3 节的证明中， `sign(x)` 展示了这样的拐点。

```check
step_ = Piecewise((0, t < 0), (1, True))
xq = symbols('x_q', positive=True); xn = symbols('x_n', negative=True)
same(integrate(step_, (t, 0, xq)), xq); same(integrate(step_, (t, 0, xn)), 0)
hq = symbols('h', positive=True)
same(integrate(step_, (t, 0, hq))/hq, 1); same(integrate(step_, (t, 0, -hq))/(-hq), 0)   # right and left difference quotients at 0
```

起点$a$可在任意位置，$x$在其任一侧。若$f$在开区间$I$上连续且$a$为$I$中一点，则$A(x) = \int_a^x f(t)\,dt$在$I$中$x$的任一侧处具有$A'(x) = f(x)$，且位于$a$的任一侧。事实上，在$I$中选取$p$和$q$，使$p$小于$a$和$x$，且$q$大于二者；由分裂性质，
$$A(x) = \int_p^x f(t)\,dt - \int_p^a f(t)\,dt,$$
第一部分关于 $[p, q]$ 表明，第一项进行求导，第二项是一个常数。同样的公式说明改变 $a$ 的影响：它会使 $A$ 改变一个常数 $\int_p^a f(t)\,dt$。从不同起始点得到的面积函数是相差常数的原函数，正如定理 10.1 所述；在推导过程中，移动 $a$ 会使 $A$ 的图像上下平移。

::: keyidea
第一部分说明求导可还原积分过程。把 $f$ 从一个固定点积分到 $x$，再对 $x$ 求导，就得到原来的 $f$。特别地，**区间上的每个连续函数在该区间都存在原函数**，$\int_a^x f(t)\,dt$ 就是其中一个。
:::

这包括那些用模块1目录中的函数无法表示原函数的函数。函数 $e^{-x^2}$ 是连续的，因此 $\int_0^x e^{-t^2}\,dt$ 是它的原函数，这是一个完全有效的函数，没有更简单的表达式；它在第10.8节下以它自己的名称出现。

### 变限积分 {#variable-limits}

部分1对一个上限为 $x$ 本身的积分进行求导。当极限是 $x$ 的函数时，模块5的链式法则 [5](module_05_ZH.html#chain)] 会参与进来。

::: theorem 变限积分
设 $f$ 在开区间 $I$ 上连续， $a$ 属于 $I$，且 $u$ 和 $v$ 是可导函数，其值域在 $I$ 内。则
$$\begin{aligned} \frac{d}{dx}\int_a^{u(x)} f(t)\,dt &= f\big(u(x)\big)\,u'(x), \\ \frac{d}{dx}\int_x^a f(t)\,dt &= -f(x) \quad (x \text{ in } I), \end{aligned}$$
和
$$\begin{aligned} &\frac{d}{dx}\int_{v(x)}^{u(x)} f(t)\,dt \\ &\quad= f\big(u(x)\big)\,u'(x) - f\big(v(x)\big)\,v'(x). \end{aligned}$$
:::

::: proof
设 $A(y) = \int_a^y f(t)\,dt$ 对于 $y$ 在 $I$；根据上述关于开区间的形式，由第一部分，$A'(y) = f(y)$。第一个积分是 $A\big(u(x)\big)$，链式法则给出其导数 $A'\big(u(x)\big)\,u'(x) = f\big(u(x)\big)\,u'(x)$。第二个是 $-A(x)$，导数为 $-f(x)$。根据拆分性质，第三个是 $A\big(u(x)\big) - A\big(v(x)\big)$，链式法则使用两次，得到最后一个公式。
:::

```check
uF, vF = Function('u'), Function('v')
same(diff(Integral(fF(t), (t, a, uF(x))), x), fF(uF(x))*diff(uF(x), x))
same(diff(Integral(fF(t), (t, x, a)), x), -fF(x))
same(diff(Integral(fF(t), (t, vF(x), uF(x))), x), fF(uF(x))*diff(uF(x), x) - fF(vF(x))*diff(vF(x), x))
```

::: example 导数的积分
求：

- (a) $\dfrac{d}{dx}\displaystyle\int_1^x \sqrt{1 + t^3}\,dt$，对于 $x > -1$
- (b) $\dfrac{d}{dx}\displaystyle\int_0^{x^2} e^{-t^2}\,dt$
- (c) $\dfrac{d}{dx}\displaystyle\int_x^{2x} \frac{1}{t}\,dt$，用于 $x > 0$

**(a)** $f(t) = \sqrt{1 + t^3}$ 在开区间 $(-1, \infty)$ 上连续，该区间包含 1，因此第一部分适用：导数为 $\sqrt{1 + x^3}$。不需要 $\sqrt{1 + t^3}$ 的原函数，这是幸运的：没有由模块 1 的函数库中函数构成的公式可以表示它。

**(b)** 上限为 $u(x) = x^2$，带 $u'(x) = 2x$。将 $u(x)$ 代入被积函数并乘以 $u'(x)$：
$$\frac{d}{dx}\int_0^{x^2} e^{-t^2}\,dt = e^{-(x^2)^2}\cdot 2x = 2x\,e^{-x^4}.$$

**(c)** $1/t$ 在 $(0, \infty)$ 上连续，且对于 $x > 0$ 两个极限都存在。在 $u(x) = 2x$ 和 $v(x) = x$ 的情况下，
$$\frac{d}{dx}\int_x^{2x} \frac{dt}{t} = \frac{1}{2x}\cdot 2 - \frac{1}{x}\cdot 1 = 0.$$
导数在区间 $(0, \infty)$ 上为 0，因此根据模块 8，积分对于每一个 $x > 0$ 都有相同的值：从 $x$ 到 $2x$ 的 $y = 1/t$ 下方的面积不依赖于 $x$，因为当区域变宽时，它以完全正确的比例变低。例 10.6 找到了这个值 $\ln 2$。

```check
same(diff(Integral(sqrt(1 + t**3), (t, 1, x)), x), sqrt(1 + x**3))
steps(Derivative(Integral(exp(-t**2), (t, 0, x**2)), x), exp(-(x**2)**2)*2*x, 2*x*exp(-x**4))
steps(Derivative(Integral(1/t, (t, xp, 2*xp)), xp), 1/(2*xp)*2 - 1/xp*1, 0)
same(integrate(1/t, (t, xp, 2*xp)), log(2))
```
:::

::: pitfall
三张卡片。 **(1)**忽略链式法则： $\dfrac{d}{dx}\displaystyle\int_0^{x^2} e^{-t^2}\,dt$ 是 $2x\,e^{-x^4}$，不是 $e^{-x^4}$ 也不是 $e^{-x^2}$。**(2)**代入错误的字母： $\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt$ 是 $f(x)$，关于 $x$ 的函数，不是 $f(t)$。**(3)** 两个常数限的积分是一个数，因此其导数为 0： $\dfrac{d}{dx}\displaystyle\int_0^1 e^{-t^2}\,dt = 0$，不是 $e^{-x^2}$。

```check
same(diff(Integral(exp(-t**2), (t, 0, 1)), x), 0)
holds(Ne((2*x*exp(-x**4)).subs(x, 2), exp(-2**4))); holds(Ne((2*x*exp(-x**4)).subs(x, 2), exp(-2**2)))
```
:::

## 微积分基本定理，第 2 部分 {#ftc2}

第 1 部分说明积分产生一个原函数。第 2 部分则反过来：计算积分时，只需找到任意一个原函数。

::: theorem 微积分基本定理，第 2 部分
设 $f$ 在 $[a, b]$ 上连续，且 $F$ 在 $[a, b]$ 上连续，且对于每个 $x$ 在 $(a, b)$ 中，$F'(x) = f(x)$ 成立；例如，$F$ 可以是 $f$ 在包含 $[a, b]$ 的区间上的任意原函数。则
$$\int_a^b f(x)\,dx = F(b) - F(a).$$
:::

差 $F(b) - F(a)$ 写作 $\big[F(x)\big]_a^b$，读作 "F of x 从 a 到 b 评价"。有些书写作 $F(x)\big|_a^b$。

::: proof
设 $A(x) = \int_a^x f(t)\,dt$ 对 $a \le x \le b$。由第 1 部分，可知 $A$ 在 $[a, b]$ 上连续，且对于 $(a, b)$ 中的每个 $x$，都有 $A'(x) = f(x) = F'(x)$。在开区间上，两个导数相同的函数相差一个常数（[定理 8.6](module_08_ZH.html#consequences))），因此 $F(x) - A(x) = C$ 对某个常数 $C$ 以及 $x$ 在 $(a, b)$ 上成立。由于 $F$ 和 $A$ 在 $a$ 和 $b$ 处连续，因此令 $x \to a^+$ 和 $x \to b^-$ 可得 $F(a) - A(a) = C$ 和 $F(b) - A(b) = C$ 也连续。因此
$$\begin{aligned} F(b) - F(a) &= \big(A(b) + C\big) - \big(A(a) + C\big) \\ &= A(b) - A(a) \\ &= \int_a^b f(t)\,dt - 0, \end{aligned}$$
由于 $A(a) = \int_a^a f(t)\,dt = 0$。积分变量的名称无关紧要，因此这等于 $\int_a^b f(x)\,dx$。
:::

所以在第2部分中，不定积分的常数从不重要：$(F(b) + C) - (F(a) + C) = F(b) - F(a)$. 任何不定积分都可以。

```check
Fg = Function('F')
same(integrate(diff(Fg(x), x), (x, a, b)), Fg(b) - Fg(a))
same((Fg(b) + c) - (Fg(a) + c), Fg(b) - Fg(a))
```

::: example 两行积分
评估 (a) $\displaystyle\int_0^1 x^2\,dx$, (b) $\displaystyle\int_0^\pi \sin x\,dx$, (c) $\displaystyle\int_1^2 \frac{dx}{x}$ 和 (d) $\displaystyle\int_0^1 \frac{dx}{1 + x^2}$。

对于每个问题，从第10.1节的积分表中选取一个在积分区间内有效的不定积分，然后相减。

**(a)** $\displaystyle\int_0^1 x^2\,dx = \Big[\frac{x^3}{3}\Big]_0^1 = \frac13 - 0 = \frac13.$

**(b)** $\displaystyle\int_0^\pi \sin x\,dx = \big[-\cos x\big]_0^\pi = -\cos\pi - (-\cos 0) = 1 + 1 = 2.$

**(c)** $\ln x$ 是 $1/x$ 在 $(0, \infty)$ 上的原函数，包含 $[1, 2]$: $\displaystyle\int_1^2 \frac{dx}{x} = \ln 2 - \ln 1 = \ln 2 \approx 0.6931.$

**(d)** $\displaystyle\int_0^1 \frac{dx}{1 + x^2} = \arctan 1 - \arctan 0 = \frac{\pi}{4} \approx 0.7854.$

所以正弦曲线的一个拱形所围成的面积恰好为2，且 $y = 1/(1 + x^2)$ 从 0 到 1 下的面积是 $\pi/4$： $\pi$ 来自一条没有圆的曲线。根据例题10.5(c)，(c) 也是 $1/t$ 从 $x$ 到 $2x$ 的面积，对于每一个 $x > 0$ 都成立。

```check
steps(Integral(x**2, (x, 0, 1)), Rational(1, 3) - 0, Rational(1, 3))
steps(Integral(sin(x), (x, 0, pi)), -cos(pi) - (-cos(0)), 1 + 1, 2)
steps(Integral(1/x, (x, 1, 2)), log(2) - log(1), log(2)); rounds(log(2), '0.6931')
steps(Integral(1/(1 + x**2), (x, 0, 1)), atan(1) - atan(0), pi/4); rounds(pi/4, '0.7854')
same(integrate(1/t, (t, xp, 2*xp)), integrate(1/x, (x, 1, 2)))
```
:::

::: pitfall
**(1)**第二部分需要 $f$ 在整个区间 $[a, b]$ 上连续，并且在整个区间上有原函数。"计算" $\displaystyle\int_{-1}^1 \frac{dx}{x^2} = \Big[-\frac1x\Big]_{-1}^1 = -1 - 1 = -2$ 是错误的：一个正函数不能有负的积分。函数 $1/x^2$ 在 0 处不连续，甚至在 0 附近也不 bounded，而且 $-1/x$ 并不是在包含 0 的任何区间上的原函数；模块 12 显示该区域实际上为无穷大。**(2)**$1/x$ 的情况也是如此。它的原函数 $\ln\abs{x}$ 在 $(0, \infty)$ 和 $(-\infty, 0)$ 上有效，因此 $\int_1^2 \frac{dx}{x} = \ln 2$ 和 $\int_{-2}^{-1} \frac{dx}{x} = \ln 1 - \ln 2 = -\ln 2$；但 $\big[\ln\abs{x}\big]_{-1}^{2} = \ln 2$ 并不是 $\int_{-1}^{2} \frac{dx}{x}$ 的值。该积分不存在：$1/x$ 在 0 附近无界。**(3)** 减去 $F(a)$ 的全部，括号内：$\big[x^2 - 3x\big]_1^2 = (4 - 6) - (1 - 3) = 0$，而不是 $(4 - 6) - 1 - 3 = -6$。

```check
same((-1/x).subs(x, 1) - (-1/x).subs(x, -1), -2); xnz = symbols('x', real=True, nonzero=True); holds(1/xnz**2 > 0)
same(integrate(1/x**2, (x, -1, 1)), oo)
same(integrate(1/x, (x, 1, 2)), log(2)); steps(Integral(1/x, (x, -2, -1)), log(Abs(-1)) - log(Abs(-2)), log(1) - log(2), -log(2))
same(log(Abs(2)) - log(Abs(-1)), log(2)); holds(integrate(1/x, (x, -1, 2)) is S.NaN); same(integrate(1/x, (x, 0, 2)), oo)
same((4 - 6) - (1 - 3), 0); same((x**2 - 3*x).subs(x, 2) - (x**2 - 3*x).subs(x, 1), 0); same((4 - 6) - 1 - 3, -6)
```
:::

### 为什么这个定理令人瞩目 {#remarkable}

比较例题 10.6 与模块 9 的方法。在那里，像 $\int_0^1 x^2\,dx$ 这样的积分是黎曼和的极限：使用 $n$ 个矩形和右端点，和为 $\dfrac{(n + 1)(2n + 1)}{6n^2}$，用模块 9 的公式 $1^2 + 2^2 + \dots + n^2$ 计算得出，其极限 $n \to \infty$ 是 $\tfrac13$。这需要一个和的公式，然后取极限，这种方法只适用于少数那些和有公式的函数。对于 $\sin x$ 在 $[0, \pi]$ 上的积分，中点和 $M_n$ 使用 $n$ 个矩形，每个宽度为 $\pi/n$，逐渐趋近于 2：

```valuetable
n = 10, 100, 1000
$M_n$ = Sum(sin((i - 1/2)*pi/n)*pi/n, (i, 1, n))
digits = 9
---
n | M_n
10 | 2.00824841
100 | 2.00008225
1000 | 2.00000082
```

而第 2 部分只需一行就得到 2。阿基米德在公元前 3 世纪用穷竭法求面积，这是黎曼和的前身，他为每种形状都使用了一个巧妙的论证。基本定理将所有这些替换为一个问题：什么函数的导数是这个？它将模块 1 中的面积问题转化为求导的逆运算，这也是为什么积分是一个实用工具而不是极限理论。它也兑现了 [第 1.1 节 ](module_01_ZH.html#about)] 中的承诺。

```check
nn = symbols('n', positive=True, integer=True); ii = symbols('i', integer=True)
same(summation((ii/nn)**2/nn, (ii, 1, nn)), (nn + 1)*(2*nn + 1)/(6*nn**2)); limit_is((nn + 1)*(2*nn + 1)/(6*nn**2), nn, oo, Rational(1, 3))
MN = lambda N_: (pi/N_)/sin(pi/(2*N_))      # the midpoint sum in closed form
near(sum(sin((k_ - Rational(1, 2))*pi/10) for k_ in range(1, 11))*pi/10, MN(10), 1e-25)
rounds(MN(10), '2.00824841'); rounds(MN(100), '2.00008225'); rounds(MN(1000), '2.00000082'); holds(MN(1000) > 2)
```

::: keyidea
模块 1 比较了汽车的速度表和里程表，并承诺微积分基本定理将表明它们彼此互为逆运算。现在我们兑现这个承诺。设 $s(t)$ 为时间 $t$ 时的里程表读数，而 $v(t) = s'(t)$ 是速度表读数，是一个连续函数。

- **Part 2:** 将速度表读数在一段时间内累加，你得到里程表读数的变化量： $\displaystyle\int_a^b v(t)\,dt = s(b) - s(a)$。
- **Part 1:** 问这个累积总量增长的速度，你将得到速度表读数： $\dfrac{d}{dt}\displaystyle\int_a^t v(u)\,du = v(t)$。

积分与微分是互为逆运算的过程，模块 1 中的切线问题和面积问题则是同一问题的两个方面。
:::

::: deeper Part 2 直接来自黎曼和
Part 2 也可以不借助 Part 1，从积分的定义来证明，且证明表明只要 $f$ 可积，无论是否连续，该结论都成立。设 $F$ 在 $[a, b]$ 上连续，且 $F' = f$ 在 $(a, b)$ 上，取任意分划 $a = x_0 < x_1 < \dots < x_n = b$。该和
$$\begin{aligned} &\big(F(x_1) - F(x_0)\big) \\ &\quad+ \big(F(x_2) - F(x_1)\big) \\ &\quad+ \dots + \big(F(x_n) - F(x_{n-1})\big) \end{aligned}$$
裂项相消法应用于$F(b) - F(a)$。由中值定理（模块8），每个括号对应于$(x_{i-1}, x_i)$中某个$c_i$的$F'(c_i)\,\Delta x_i = f(c_i)\,\Delta x_i$，其中$\Delta x_i = x_i - x_{i-1}$成立。因此，对于任意划分，都存在一个具有样本点$c_i$的$f$的黎曼和，其值恰好为$F(b) - F(a)$。若$f$可积，当子区间缩小时黎曼和趋近于$\int_a^b f(x)\,dx$，故积分等于$F(b) - F(a)$。

```check
F_t = Function('F')
same(sum(F_t(k_) - F_t(k_ - 1) for k_ in range(1, 6)), F_t(5) - F_t(0))      # the sum telescopes
```
:::

## 不定积分与净变化 {#net-change}

### 不定积分 {#indefinite}

第2部分将原函数作为计算积分的方法，这解释了用于它们的符号。

::: definition 不定积分
$f$ 的**不定积分**记作 $\int f(x)\,dx$，是它在某区间上的一般原函数：
$$\int f(x)\,dx = F(x) + C$$
表示对于每个 $x$ 在区间内，$F'(x) = f(x)$ 都成立。
:::

将 $\int f(x)\,dx$ 读作 "f(x) 关于 x 的积分"。定积分 $\int_a^b f(x)\,dx$ 是一个数；不定积分 $\int f(x)\,dx$ 是一个函数族。第2部分将它们联系起来： $\int_a^b f(x)\,dx = \Big[\int f(x)\,dx\Big]_a^b$，使用该族中的任意一个函数。对 **积分** $f$ 是找出其中任意一种。在此记号下，第10.1节的积分表读作
$$\begin{aligned} \int x^n\,dx &= \frac{x^{n+1}}{n + 1} + C \quad (n \ne -1), \\ \int \frac{dx}{x} &= \ln\abs{x} + C, \\ \int \cos x\,dx &= \sin x + C, \end{aligned}$$
以此类推，带有表中的条件，以及和数乘的规则读作 $\int \big(c f(x) + g(x)\big)\,dx = c\int f(x)\,dx + \int g(x)\,dx$。 $dx$ 表示哪个字母是变量： $\int x t^2\,dx = \tfrac12 x^2 t^2 + C$，而 $\int x t^2\,dt = \tfrac13 x t^3 + C$。

```check
antideriv(x**2*t**2/2, x*t**2, x); antideriv(x*t**3/3, x*t**2, t)
antideriv(sin(x), cos(x), x); antideriv(log(xp), 1/xp, xp)
```

::: pitfall
不定积分不是一个数，而定积分不是一个函数族。 $\int 2x\,dx = x^2 + C$，而不是 $x^2$ 单独，后者是众多原函数中的一个；而 $\int_0^1 2x\,dx = 1$ 是一个数，其中不含 $C$ 和 $x$。
:::

### 净变化定理 {#net-change-theorem}

第2部分还有另一种读法。一个具有连续导数的函数 $F$ 是其导数的原函数，因此第2部分中使用 $f = F'$ 给出：

::: theorem 净变化定理
如果 $F'$ 在 $[a, b]$ 上连续，则
$$\int_a^b F'(x)\,dx = F(b) - F(a).$$
:::

用文字表达：**积分是一个变化率的净变化**。如果 $s(t)$ 是位置，那么 $\int_a^b v(t)\,dt = s(b) - s(a)$ 是 **位移（即位置的变化）**。如果 $V(t)$ 是水箱中水的体积，水以速率 $r(t) = V'(t)$ 流入，则 $\int_a^b r(t)\,dt$ 是体积的变化。如果 $E(t)$ 是到时间 $t$ 为止所用的能量，其变化率是 **功率** $P(t) = E'(t)$，而 $\int_a^b P(t)\,dt$ 是在 $a$ 和 $b$ 之间所用的能量。单位相乘：升每分钟乘以分钟得到升；瓦特（即焦耳每秒）乘以秒得到焦耳。

::: example 位移与距离
模块 4 的 [例 4.10](module_04_ZH.html#motion) 跟随一个速度为 $v(t) = 3t^2 - 12t + 9$ 米每秒的粒子。不使用其位置函数，求（a）其位移和（b）它在 $0 \le t \le 4$ 内所行的路程。

**(a)** 根据净变化定理，位移是
$$\begin{aligned} &\int_0^4 (3t^2 - 12t + 9)\,dt \\ &\quad= \big[t^3 - 6t^2 + 9t\big]_0^4 \\ &\quad= 64 - 96 + 36 = 4 \text{ m}. \end{aligned}$$

**(b)** 距离计算所有前进或后退的路程，因此是速度 $\abs{v(t)}$ 的积分。因子：$v(t) = 3(t - 1)(t - 3)$，对于 $0 \le t < 1$ 为正，对于 $1 < t < 3$ 为负，对于 $3 < t \le 4$ 为正。在每个区间 $\abs{v}$ 是 $v$ 或 $-v$，因此分段积分，使用 $F(t) = t^3 - 6t^2 + 9t$：
$$\begin{aligned} \int_0^1 v\,dt &= F(1) - F(0) = 4, \\ \int_1^3 v\,dt &= F(3) - F(1) = 0 - 4 = -4, \\ \int_3^4 v\,dt &= F(4) - F(3) = 4 - 0 = 4. \end{aligned}$$
距离是 $4 + 4 + 4 = 12$ 米：粒子前进 4 米，后退 4 米，再前进 4 米，最终距离起点 4 米，如 模块 4 从 $s(t)$ 所得。图 10.4 显示两个积分作为面积。

```check
v7 = 3*t**2 - 12*t + 9; F7 = t**3 - 6*t**2 + 9*t
antideriv(F7, v7, t)
steps(Integral(v7, (t, 0, 4)), F7.subs(t, 4) - F7.subs(t, 0), 64 - 96 + 36, 4)
same(factor(v7), 3*(t - 1)*(t - 3))
holds(v7.subs(t, Rational(1, 2)) > 0); holds(v7.subs(t, 2) < 0); holds(v7.subs(t, Rational(7, 2)) > 0)
same(F7.subs(t, 1) - F7.subs(t, 0), 4); same(F7.subs(t, 3) - F7.subs(t, 1), -4); same(F7.subs(t, 4) - F7.subs(t, 3), 4)
tr = symbols('t', real=True)
same(integrate(Piecewise((3*tr**2 - 12*tr + 9, tr <= 1), (-(3*tr**2 - 12*tr + 9), tr <= 3), (3*tr**2 - 12*tr + 9, True)), (tr, 0, 4)), 12)
```
:::

::: figure id=fig-10-4
例 10.7 中粒子的位移和距离。左：速度 $v(t) = 3t^2 - 12t + 9$；带符号的面积 $4$、$-4$ 和 $4$ 相加得到位移 4 米。右：速度 $\abs{v(t)}$；所有面积均为正，相加得到路程 12 米。
:::

::: example 水箱中的水
假设一个水箱在时间 $t = 0$ 时含有 500 升水，水流以 $r(t) = 40 - 4t$ 升每分钟的速度流入，持续 $0 \le t \le 15$，其中负的速率表示水流出。15 分钟后水箱中有多少水？什么时候水箱最满？此时水箱中有多少水？

15 分钟内体积的变化为
$$\begin{aligned} \int_0^{15} (40 - 4t)\,dt &= \big[40t - 2t^2\big]_0^{15} \\ &= 600 - 450 = 150 \text{ litres}, \end{aligned}$$
因此，水箱在 $t = 15$ 时含有 $500 + 150 = 650$ 升水。当 $r(t) > 0$ 时体积增加，当 $r(t) < 0$ 时体积减少；在 $r(t) = 0$ 时达到 $t = 10$，因此水箱在 $t = 10$ 分钟时最满，此时含有 $500 + \big[40t - 2t^2\big]_0^{10} = 500 + 400 - 200 = 700$ 升水。从 $t = 10$ 到 $t = 15$ 期间损失了 50 升水。

```check
r8 = 40 - 4*t
antideriv(40*t - 2*t**2, r8, t)
steps(Integral(r8, (t, 0, 15)), (40*15 - 2*15**2) - 0, 600 - 450, 150); same(500 + 150, 650)
same(solve(r8, t), [10]); same(500 + integrate(r8, (t, 0, 10)), 700); same(500 + 400 - 200, 700); same(integrate(r8, (t, 10, 15)), -50)
```
:::

::: example 功率的能量
假设一个 GPU 在一分钟任务期间的功率消耗为 $P(t) = 250 + 150\sin\dfrac{\pi t}{60}$ 瓦特，持续 $0 \le t \le 60$ 秒。它使用了多少能量（以焦耳和千瓦时为单位，1 kWh 是 $3.6 \times 10^6$ J）？这分钟内的平均功率是多少？

能量是功率的积分。在表格中 $k = \pi/60$ 为已知， $\sin\dfrac{\pi t}{60}$ 的一个原函数是 $-\dfrac{60}{\pi}\cos\dfrac{\pi t}{60}$，因此
$$\begin{aligned} E &= \int_0^{60} P(t)\,dt \\ &= \Big[250t - \frac{9000}{\pi}\cos\frac{\pi t}{60}\Big]_0^{60} \\ &= 15000 - \frac{9000}{\pi}(\cos\pi - \cos 0) \\ &= 15000 + \frac{18000}{\pi} \approx 20729.6 \text{ J}. \end{aligned}$$
那大约是 20.7 kJ，或 $20729.6/(3.6 \times 10^6) \approx 0.00576$ kWh。平均功率是 $P$（模块 9）在最低功率 250 W 和最高功率 400 W 之间的平均值，即 $E/60 \approx 345.5$ W。

```check
P9 = 250 + 150*sin(pi*t/60); F9 = 250*t - 9000/pi*cos(pi*t/60)
same(150*60/pi, 9000/pi); antideriv(-60/pi*cos(pi*t/60), sin(pi*t/60), t); antideriv(F9, P9, t)
steps(Integral(P9, (t, 0, 60)), F9.subs(t, 60) - F9.subs(t, 0), 15000 - 9000/pi*(cos(pi) - cos(0)), 15000 + 18000/pi)
E9 = 15000 + 18000/pi
rounds(E9, '20729.6'); rounds(E9/1000, '20.7'); rounds(E9/(36*10**5), '0.00576'); rounds(E9/60, '345.5')
same(P9.subs(t, 0), 250); same(P9.subs(t, 30), 400); holds(250 < E9/60); holds(E9/60 < 400)
```
:::

::: pitfall
位移不是距离。 $\int_a^b v(t)\,dt$ 将正反方向的运动用相反符号相加，因此位移可以很小，甚至为 0，而物体却可能运动很远。对于距离，积分速度 $\abs{v(t)}$：找到 $v$ 变号的位置，将区间分割，然后相加各段的长度。并保持单位：速率的积分单位是速率单位乘以时间单位。
:::

## 替换法则 {#substitution}

第 10.1 节的积分表处理基本函数的和。它不能处理 $\int 2x\cos(x^2)\,dx$：积分函数是乘积，且不是表中任何函数的乘积。但你以前见过，作为导数。根据链式法则，
$$\frac{d}{dx}\sin(x^2) = \cos(x^2)\cdot 2x,$$
so $\int 2x\cos(x^2)\,dx = \sin(x^2) + C$. 被积函数具有形状 $f\big(g(x)\big)\,g'(x)$：一个外层函数 $f$ 在一个内层函数 $g(x)$ 处的值，乘以内层函数的导数。每当 $F' = f$，链式法则说明这样的被积函数是 $F\big(g(x)\big)$ 的导数。

```check
same(diff(sin(x**2), x), cos(x**2)*2*x); antideriv(sin(x**2), 2*x*cos(x**2), x)
```

莱布尼茨记号使这种模式变得机械。命名内层函数为 $u = g(x)$。其微分，定义在 [第7.2节](module_07_ZH.html#differentials)] 中，是 $du = g'(x)\,dx$。将 $g(x)$ 替换为 $u$，将 $g'(x)\,dx$ 替换为 $du$：
$$\begin{aligned} \int \cos(x^2)\cdot 2x\,dx &= \int \cos u\,du \\ &= \sin u + C = \sin(x^2) + C. \end{aligned}$$

::: theorem 替换法则
设 $g$ 在区间 $I$ 上可导，且设 $F$ 是 $f$ 在包含 $g$ 所有值的开区间上的原函数。那么
$$\int f\big(g(x)\big)\,g'(x)\,dx = F\big(g(x)\big) + C$$
在 $I$ 上。结合 $u = g(x)$ 和 $du = g'(x)\,dx$，这表示 $\int f\big(g(x)\big)\,g'(x)\,dx = \int f(u)\,du$，并将 $u = g(x)$ 放回最后。
:::

::: proof
根据链式法则，对于 $x$ 中的每一个 $I$，都有 $\dfrac{d}{dx}F\big(g(x)\big) = F'\big(g(x)\big)\,g'(x) = f\big(g(x)\big)\,g'(x)$。因此， $F\big(g(x)\big)$ 是 $f\big(g(x)\big)\,g'(x)$ 在 $I$ 上的原函数，定理10.1给出了所有其他的原函数。
:::

```check
gF = Function('g')
same(diff(Fg(gF(x)), x), Subs(Derivative(Fg(u), u), u, gF(x))*Derivative(gF(x), x))
```

::: keyidea
用替换法积分：

1. **选择** $u = g(x)$，一个内层函数，其导数作为被积函数的因子出现，可能相差一个常数因子。
2. **计算** $du = g'(x)\,dx$，并求解其替换的积分部分（例如 $x\,dx = \tfrac12\,du$）。
3. **将**整个积分重写为$u$的形式；$x$不得残留，即使在$dx$中也不得残留。
4. **对**在$u$中积分，然后将$u = g(x)$代回。
5. **通过求导验证**。
:::

::: example 四种替换方法
求：

- (a) $\displaystyle\int 2x(x^2 + 1)^3\,dx$
- (b) $\displaystyle\int x^2\sqrt{x^3 + 1}\,dx$，对于 $x > -1$
- (c) $\displaystyle\int \frac{e^x}{1 + e^x}\,dx$
- (d) $\displaystyle\int \frac{\ln x}{x}\,dx$，对于 $x > 0$

**(a)** 令 $u = x^2 + 1$; 则 $du = 2x\,dx$，正好剩下以下因子：
$$\int u^3\,du = \frac{u^4}{4} + C = \frac{(x^2 + 1)^4}{4} + C.$$

**(b)** 令 $u = x^3 + 1$，则 $du = 3x^2\,dx$ 且 $x^2\,dx = \tfrac13\,du$。对于 $x > -1$，$u > 0$，以及
$$\begin{aligned} \int \sqrt u\cdot\tfrac13\,du &= \frac13\cdot\frac23 u^{3/2} + C \\ &= \frac29 (x^3 + 1)^{3/2} + C. \end{aligned}$$
检查：$\dfrac{d}{dx}\,\dfrac29(x^3 + 1)^{3/2} = \dfrac29\cdot\dfrac32(x^3 + 1)^{1/2}\cdot 3x^2 = x^2\sqrt{x^3 + 1}$。

**(c)** 令 $u = 1 + e^x$，则 $du = e^x\,dx$：
$$\int \frac{du}{u} = \ln\abs{u} + C = \ln(1 + e^x) + C,$$
不使用绝对值符号，因为 $1 + e^x > 0$。

**(d)** 设$u = \ln x$，则$du = \dfrac{dx}{x}$：
$$\int u\,du = \frac{u^2}{2} + C = \frac{(\ln x)^2}{2} + C.$$

```check
same(diff(x**2 + 1, x), 2*x); antideriv(u**4/4, u**3, u); antideriv((x**2 + 1)**4/4, 2*x*(x**2 + 1)**3, x)
same(diff(x**3 + 1, x), 3*x**2); antideriv(Rational(1, 3)*Rational(2, 3)*u**Rational(3, 2), sqrt(u)/3, u)
steps(Derivative(Rational(2, 9)*(x**3 + 1)**Rational(3, 2), x), Rational(2, 9)*Rational(3, 2)*(x**3 + 1)**Rational(1, 2)*3*x**2, x**2*sqrt(x**3 + 1))
same(diff(1 + exp(x), x), exp(x)); antideriv(log(u), 1/u, u); antideriv(log(1 + exp(x)), exp(x)/(1 + exp(x)), x)
same(diff(log(xp), xp), 1/xp); antideriv(u**2/2, u, u); antideriv(log(xp)**2/2, log(xp)/xp, xp)
```
:::

下面三个需要再看一遍：第一个中内函数的导数隐藏在一个分数中，第二个需要安排一个常数，第三个则剩下一些 $x$。

::: example 需要再看一遍的替换方法
求：

- (a) $\displaystyle\int \tan x\,dx$
- (b) $\displaystyle\int \frac{dx}{a^2 + x^2}$，其中 $a \ne 0$ 是一个常数
- (c) $\displaystyle\int x\sqrt{x - 1}\,dx$，用于 $x > 1$

**(a)** 写 $\tan x = \dfrac{\sin x}{\cos x}$ 并令 $u = \cos x$，所以 $du = -\sin x\,dx$：
$$\begin{aligned} \int \frac{\sin x}{\cos x}\,dx &= -\int \frac{du}{u} = -\ln\abs{u} + C \\ &= -\ln\abs{\cos x} + C, \end{aligned}$$
在每个 $\cos x \ne 0$ 有效的区间内。由于 $-\ln\abs{\cos x} = \ln\dfrac{1}{\abs{\cos x}}$，答案也可以写成 $\ln\abs{\sec x} + C$。

**(b)** 将 $a^2$ 从分母中提出，令 $a^2 + x^2 = a^2\big(1 + (x/a)^2\big)$，并令 $u = x/a$，所以 $du = dx/a$ 和 $dx = a\,du$：
$$\begin{aligned} \int \frac{dx}{a^2 + x^2} &= \int \frac{a\,du}{a^2(1 + u^2)} \\ &= \frac1a \arctan u + C \\ &= \frac1a\arctan\frac{x}{a} + C. \end{aligned}$$
同样地，对于常数 $a > 0$，有 $\displaystyle\int \frac{dx}{\sqrt{a^2 - x^2}} = \arcsin\frac{x}{a} + C$ 对于 $-a < x < a$；练习 10.6 处理了 $a = 3$ 的情况。

**(c)** 令 $u = x - 1$，所以 $du = dx$。剩下的因子 $x$ 可以用 $u$ 表示为 $x = u + 1$。然后
$$\begin{aligned} \int (u + 1)\sqrt u\,du &= \int \big(u^{3/2} + u^{1/2}\big)\,du \\ &= \frac25 u^{5/2} + \frac23 u^{3/2} + C \\ &= \frac25 (x - 1)^{5/2} \\ &\qquad + \frac23 (x - 1)^{3/2} + C. \end{aligned}$$

```check
same(diff(cos(x), x), -sin(x)); antideriv(-log(u), -1/u, u)
antideriv(-log(cos(x)), tan(x), x); antideriv(-log(-cos(x)), tan(x), x)      # where cos x > 0, and where cos x < 0
yq = symbols('y', positive=True); same(-log(yq), log(1/yq))       # with y = |cos x| > 0
xr = symbols('x', real=True); same(1/Abs(cos(xr)), Abs(sec(xr)))
anz = symbols('a', real=True, nonzero=True)
same(anz**2*(1 + (x/anz)**2), anz**2 + x**2); same(anz/(anz**2*(1 + u**2)), (1/anz)/(1 + u**2))
antideriv(atan(u)/anz, (1/anz)/(1 + u**2), u); antideriv(atan(x/anz)/anz, 1/(anz**2 + x**2), x)
antideriv(asin(x/ap), 1/sqrt(ap**2 - x**2), x)
up = symbols('u', positive=True)
same(expand((up + 1)*sqrt(up)), up**Rational(3, 2) + up**Rational(1, 2))
antideriv(Rational(2, 5)*up**Rational(5, 2) + Rational(2, 3)*up**Rational(3, 2), up**Rational(3, 2) + up**Rational(1, 2), up)
antideriv(Rational(2, 5)*(x - 1)**Rational(5, 2) + Rational(2, 3)*(x - 1)**Rational(3, 2), x*sqrt(x - 1), x)
```
:::

::: pitfall
三张替换卡片。 **(1)**忘记 $du$：将 $\cos(x^2)\cdot 2x\,dx$ 替换为 "$\cos u\,dx$" 会在 $u$ 中的积分中留下一个 $dx$，这是无意义的； $2x\,dx$ 变为 $du$。**(2)**将剩余变量当作常数处理。对于 $u = x^2$， $\int \cos(x^2)\,dx$ 没有与 $dx$ 相乘的因子 $x$，并且在积分内部将 $2x$ 当作常数进行除法运算，导致错误答案 $\dfrac{\sin(x^2)}{2x}$。常数因子可以穿过积分号，变量则不能。（事实上，由 模块 1 的函数目录中构建的任何公式，其导数都不等于 $\cos(x^2)$。）**(3)** 在 $u$ 中留下答案，或忘记检查答案。

```check
holds(Ne(cos(1) - sin(1)/2, cos(1)))          # so the derivative of sin(x^2)/(2x) is not cos(x^2)
same(diff(sin(x**2)/(2*x), x).subs(x, 1), cos(1) - sin(1)/2)
```
:::

### 定积分 {#definite-substitution}

对于定积分，使用替换有两种方式。一种是在 $x$ 中找到原函数，如上所述，并使用原始上下限应用第 2 部分。另一种是将变量和上下限一起改变，从不返回到 $x$。图 10.5 展示了第二种方法的作用：它改变了区域，但不改变其面积。

::: theorem 替换在定积分中的应用
设 $g'$ 在 $[a, b]$ 上连续，且设 $f$ 在包含 $g(x)$ 的区间 $J$ 上连续，对于每一个 $x$ 在 $[a, b]$ 中。那么
$$\int_a^b f\big(g(x)\big)\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du.$$
:::

::: proof
如果 $J$ 包含某个端点，则用 $f$ 在该端点的值把它常值延拓到端点之外。延拓后的函数在包含 $J$ 的开区间上连续，并在 $J$ 上与 $f$ 一致，故公式两边都不变。于是可假设 $J$ 为开区间。由第一部分，$f$ 在 $J$ 上有原函数 $F$。由定理 10.6，$F\big(g(x)\big)$ 是 $f\big(g(x)\big)\,g'(x)$ 的原函数，后者在 $[a, b]$ 上连续。因此由第二部分，左边等于 $F\big(g(b)\big) - F\big(g(a)\big)$。在 $g(a)$ 与 $g(b)$ 之间的区间上再次应用第二部分，该区间位于 $J$ 内，得到右边也等于 $F\big(g(b)\big) - F\big(g(a)\big)$。（当 $g(b) < g(a)$ 时使用约定 $\int_p^q = -\int_q^p$；当 $g(a) = g(b)$ 时两边均为 0。）
:::

::: example 改变积分限
评价 (a) $\displaystyle\int_0^{\sqrt\pi} 2x\sin(x^2)\,dx$, (b) $\displaystyle\int_0^1 \frac{x}{1 + x^2}\,dx$ 和 (c) $\displaystyle\int_0^{\pi/2} \sin x\cos^2 x\,dx$。

**(a)** 设 $u = x^2$，所以 $du = 2x\,dx$。当 $x = 0$，得 $u = 0$；当 $x = \sqrt\pi$，得 $u = \pi$。所以
$$\begin{aligned} \int_0^{\sqrt\pi} 2x\sin(x^2)\,dx &= \int_0^\pi \sin u\,du \\ &= \big[-\cos u\big]_0^\pi = 2, \end{aligned}$$
一个正弦曲线拱形的面积（例 10.6(b)）。

**(b)** 设 $u = 1 + x^2$，所以 $du = 2x\,dx$ 和 $x\,dx = \tfrac12\,du$； $x = 0$ 给出 $u = 1$， $x = 1$ 给出 $u = 2$：
$$\begin{aligned} \int_0^1 \frac{x\,dx}{1 + x^2} &= \frac12\int_1^2 \frac{du}{u} = \frac12\big[\ln u\big]_1^2 \\ &= \frac{\ln 2}{2} \approx 0.3466. \end{aligned}$$
另一种方式：在 $x$ 中的一个原函数是 $\tfrac12\ln(1 + x^2)$，且 $\big[\tfrac12\ln(1 + x^2)\big]_0^1 = \tfrac12\ln 2 - \tfrac12\ln 1$，相同。

**(c)** 设 $u = \cos x$，所以 $du = -\sin x\,dx$； $x = 0$ 给出 $u = 1$， $x = \pi/2$ 给出 $u = 0$：
$$\begin{aligned} \int_0^{\pi/2} \cos^2 x\,\sin x\,dx &= \int_1^0 u^2\,(-du) \\ &= \int_0^1 u^2\,du = \frac13. \end{aligned}$$
新的积分限以相反的顺序出现，且来自 $du$ 的负号使它们反转。保持替换后的位置：积分符号下方应为 $u$ 在下限 $x$ 处的值，即使它是较大的数。

```check
steps(Integral(2*x*sin(x**2), (x, 0, sqrt(pi))), Integral(sin(u), (u, 0, pi)), -cos(pi) - (-cos(0)), 2)
steps(Integral(x/(1 + x**2), (x, 0, 1)), Rational(1, 2)*Integral(1/u, (u, 1, 2)), Rational(1, 2)*(log(2) - log(1)), log(2)/2); rounds(log(2)/2, '0.3466')
antideriv(log(1 + x**2)/2, x/(1 + x**2), x); same((log(1 + x**2)/2).subs(x, 1) - (log(1 + x**2)/2).subs(x, 0), log(2)/2)
same(cos(0), 1); same(cos(pi/2), 0)
steps(Integral(sin(x)*cos(x)**2, (x, 0, pi/2)), Integral(-u**2, (u, 1, 0)), Integral(u**2, (u, 0, 1)), Rational(1, 3))
```
:::

::: figure id=fig-10-5
替换变量会改变区域但不会改变其面积。左图：从 $x = 0$ 到 $\sqrt\pi$ 下方的 $y = 2x\sin(x^2)$ 区域，高而窄。右图：从 $u = 0$ 到 $\pi$ 下方的 $y = \sin u$ 区域，低而宽。根据 $u = x^2$，定理 10.7 说明这两个面积相等，例题 10.12(a) 计算出两者均为 2。两个图使用相同的刻度。
:::

::: pitfall
定积分中最常见的错误：改变变量但不改变积分限。对于 $u = x^2 + 1$，
$$\begin{aligned} \int_0^2 x(x^2 + 1)^2\,dx &= \frac12\int_1^5 u^2\,du \\ &= \frac12\cdot\frac{125 - 1}{3} = \frac{62}{3}. \end{aligned}$$
保持原极限得到 $\tfrac12\int_0^2 u^2\,du = \tfrac43$，这是错误的；使用 $u$ 的原函数 $\tfrac16 u^3$ 并取 $x$ 的极限 0 和 2 也是错误的。若省略因子 $\tfrac12$，则得到 $\tfrac{124}{3}$。要么改变极限，要么在使用旧极限前返回到 $x$。

```check
same(integrate(x*(x**2 + 1)**2, (x, 0, 2)), Rational(62, 3)); same(Rational(1, 2)*integrate(u**2, (u, 1, 5)), Rational(62, 3)); same(Rational(1, 2)*(125 - 1)/3, Rational(62, 3))
same(Rational(1, 2)*integrate(u**2, (u, 0, 2)), Rational(4, 3)); same((u**3/6).subs(u, 2) - (u**3/6).subs(u, 0), Rational(4, 3)); same(integrate(u**2, (u, 1, 5)), Rational(124, 3))
```
:::

### 奇函数与偶函数 {#symmetry}

模块9利用对称性求区间$[-a, a]$上的积分：对于偶函数，$y$轴左侧的面积是其右侧面积的镜像，而对于奇函数，两者相互抵消。它通过黎曼和证明了这一点（[第9.6节](module_09_ZH.html#symmetry)]）；对于连续函数，换元法给出了一个两行的证明。

::: theorem 偶函数与奇函数的积分
设 $f$ 在 $[-a, a]$ 上连续，其中 $a > 0$.

- 如果 $f$ 是偶函数，则 $\displaystyle\int_{-a}^a f(x)\,dx = 2\int_0^a f(x)\,dx$.
- 如果 $f$ 是奇函数，则 $\displaystyle\int_{-a}^a f(x)\,dx = 0$.
:::

::: proof
在 0 处分割：$\int_{-a}^a f(x)\,dx = \int_{-a}^0 f(x)\,dx + \int_0^a f(x)\,dx$. 在第一个积分中替换 $u = -x$，所以 $du = -dx$; $x = -a$ 给出 $u = a$ 和 $x = 0$ 给出 $u = 0$. 根据定理 10.7，
$$\begin{aligned} \int_{-a}^0 f(x)\,dx &= \int_a^0 f(-u)\,(-du) \\ &= \int_0^a f(-u)\,du. \end{aligned}$$
如果 $f$ 是偶函数，则 $f(-u) = f(u)$，因此这个是 $\int_0^a f(u)\,du$，总和为 $2\int_0^a f(x)\,dx$. 如果 $f$ 是奇函数，则 $f(-u) = -f(u)$，因此它为 $-\int_0^a f(u)\,du$，总和为 0.
:::

```check
fe_, fo_ = cos(x) + x**2, x**2*sin(x)
same(integrate(fe_, (x, -a, a)), 2*integrate(fe_, (x, 0, a))); same(integrate(fo_, (x, -a, a)), 0)
same(integrate(fe_.subs(x, -u)*(-1), (u, a, 0)), integrate(fe_.subs(x, -u), (u, 0, a)))
```

::: example 对称性节省工作
评价 (a) $\displaystyle\int_{-1}^1 (x^6 + 4x^3 - x + 1)\,dx$, (b) $\displaystyle\int_{-\pi/2}^{\pi/2} (x^3 + 1)\cos x\,dx$ 和 (c) $\displaystyle\int_{-1}^1 \frac{\tan x}{1 + x^2}\,dx$。

**(a)** $x^6 + 1$ 是偶函数，而 $4x^3 - x$ 是奇函数，因此
$$\begin{aligned} &\int_{-1}^1 (x^6 + 4x^3 - x + 1)\,dx \\ &\quad= 2\int_0^1 (x^6 + 1)\,dx + 0 \\ &\quad= 2\Big(\frac17 + 1\Big) = \frac{16}{7}. \end{aligned}$$

**(b)** $x^3\cos x$ 是奇函数（奇函数乘以偶函数），而 $\cos x$ 是偶函数，因此积分是 $0 + 2\int_0^{\pi/2}\cos x\,dx = 2\big[\sin x\big]_0^{\pi/2} = 2$。

**(c)** $\tan x$ 是奇函数，而 $1 + x^2$ 是偶函数，因此它们的商是奇函数；它在 $[-1, 1]$ 上连续，其中 $\cos x \ne 0$。积分结果为 0，无需原函数。

```check
same((x**6 + 1).subs(x, -x), x**6 + 1); same((4*x**3 - x).subs(x, -x), -(4*x**3 - x))
steps(Integral(x**6 + 4*x**3 - x + 1, (x, -1, 1)), 2*Integral(x**6 + 1, (x, 0, 1)) + 0, 2*(Rational(1, 7) + 1), Rational(16, 7))
same((x**3*cos(x)).subs(x, -x), -x**3*cos(x)); steps(Integral((x**3 + 1)*cos(x), (x, -pi/2, pi/2)), 2*Integral(cos(x), (x, 0, pi/2)), 2)
same((tan(x)/(1 + x**2)).subs(x, -x), -tan(x)/(1 + x**2)); holds(cos(1) > 0)
near(Integral(tan(x)/(1 + x**2), (x, -1, 1)).evalf(30), 0, 1e-20)
```
:::

::: pitfall
两种方法都需要对称区间和可积函数。 $\int_{-1}^2 x^3\,dx$ 不为 0：区间不对称，积分是 $\tfrac{16}{4} - \tfrac14 = \tfrac{15}{4}$。而 $\int_{-1}^1 \frac{dx}{x}$ 不为 0 “由对称性”： $1/x$ 是奇函数但未在 0 处定义，且在该点附近无界，因此积分在模块 9 的意义上不存在。

```check
same(integrate(x**3, (x, -1, 2)), Rational(15, 4)); same(Rational(16, 4) - Rational(1, 4), Rational(15, 4))
```
:::

## 使用 SymPy 进行积分 {#sympy}

SymPy 可以对 `sp.integrate` 进行积分。以变量作为第二个参数时返回原函数；以元组 `(x, a, b)` 作为参数时返回从 `a` 到 `b` 的定积分。

::: compute SymPy 中的积分
```python
import sympy as sp
x, t = sp.symbols('x t')
print(sp.integrate(x**2 - 1, x))                     # an antiderivative: no + C
print(sp.integrate(x**2, (x, 0, 1)))                 # a definite integral, exactly
print(sp.integrate(1/(1 + x**2), (x, 0, 1)))         # Example 10.6(d)
print(sp.integrate(2*x*sp.sin(x**2), (x, 0, sp.sqrt(sp.pi))))   # Example 10.12(a)
```

```output
x**3/3 - x
1/3
pi/4
2
```

SymPy 会省略 $+\,C$，并给出精确答案：`pi/4`，而不是 0.785。要检查你自己的原函数，对其求导并简化与被积函数的差；若差为 0，则说明正确：

```python
F = sp.Rational(2, 9)*(x**3 + 1)**sp.Rational(3, 2)   # Example 10.10(b)
print(sp.simplify(sp.diff(F, x) - x**2*sp.sqrt(x**3 + 1)))
```

```output
0
```

`sp.Integral` 写下一个积分表达式而没有进行计算，而 `.doit()` 进行了计算。`sp.diff` 应用第1部分和链式法则处理具有变量上下限的积分，而不需要找到任何原函数：

```python
I = sp.Integral(sp.exp(-t**2), (t, 0, x**2))
print(sp.diff(I, x))                                 # Example 10.5(b)
print(sp.diff(sp.Integral(1/t, (t, x, 2*x)), x))     # Example 10.5(c)
print(sp.Integral(x**2, (x, 0, 1)).doit())
```

```output
2*x*exp(-x**4)
0
1/3
```

对于每一个 $x$，中间答案都是 0，如例 10.5(c) 所示。SymPy 也了解第 10.5 节中的陷阱：

```python
print(sp.integrate(1/x**2, (x, -1, 1)))
```

```output
oo
```

`oo` 是 SymPy 的 $\infty$：从 $-1$ 到 1 的 $1/x^2$ 下面积分是无限的，而不是 $-2$。
:::

```check
same(integrate(x**2 - 1, x), x**3/3 - x); same(integrate(2*x*sin(x**2), (x, 0, sqrt(pi))), 2); rounds(pi/4, '0.785')
same(diff(Rational(2, 9)*(x**3 + 1)**Rational(3, 2), x) - x**2*sqrt(x**3 + 1), 0)
```

### 为什么 SymPy 的答案可能看起来不同 {#different-answers}

同一个函数的两个原函数看起来可能很不一样。根据定理 10.1，它们可以相差一个常数；也可能像[第 5.7 节](module_05_ZH.html#different-looks) 中的导数一样，写法不同但值相同。

::: compute 仅相差一个常数的答案
```python
import sympy as sp
x = sp.symbols('x')
mine = (x**2 + 1)**4/4                               # Example 10.10(a), by substitution
theirs = sp.integrate(2*x*(x**2 + 1)**3, x)
print(theirs)
print(sp.expand(mine - theirs))
```

```output
x**8/4 + x**6 + 3*x**4/2 + x**2
1/4
```

SymPy 展开被积函数并逐项积分，因此它的原函数没有常数项。展开后，$\tfrac14(x^2 + 1)^4$ 是同一个多项式加上$\tfrac14$：两个答案相差常数$\tfrac14$，且两者都正确。另一个积分可以用两种方式用替换法计算：

```python
print(sp.integrate(sp.sin(x)*sp.cos(x), x))
print(sp.simplify(sp.sin(x)**2/2 - (-sp.cos(x)**2/2)))
```

```output
sin(x)**2/2
1/2
```

使用 $u = \sin x$，$\int \sin x\cos x\,dx = \tfrac12\sin^2 x + C$ 是 SymPy 的答案。使用 $u = \cos x$ 和 $du = -\sin x\,dx$，同样的积分是 $-\tfrac12\cos^2 x + C$。两者都正确：由于 $\sin^2 x + \cos^2 x = 1$，它们相差 $\tfrac12$。另一个不同之处是：

```python
print(sp.integrate(1/x, x))
print(sp.integrate(1/x, (x, -2, -1)))
```

```output
log(x)
-log(2)
```

SymPy 给出 $\ln x$，而没有写成 $\ln\abs{x}$。在 $x > 0$ 时，它是 $1/x$ 的一个原函数。当 $x$ 为负时，SymPy 给出的 `log(x)` 不是实数，因为 SymPy 支持复数。若在 $(-\infty, 0)$ 上只做实数计算，则用 $\ln\abs{x}$。定积分仍能得到正确结果：$\big[\ln\abs{x}\big]_{-2}^{-1} = \ln 1 - \ln 2 = -\ln 2$。
:::

```check
same(integrate(2*x*(x**2 + 1)**3, x), x**8/4 + x**6 + 3*x**4/2 + x**2); same(expand((x**2 + 1)**4/4) - (x**8/4 + x**6 + 3*x**4/2 + x**2), Rational(1, 4))
same(integrate(sin(x)*cos(x), x), sin(x)**2/2); antideriv(-cos(x)**2/2, sin(x)*cos(x), x); same(sin(x)**2/2 + cos(x)**2/2, Rational(1, 2))
same(integrate(1/x, (x, -2, -1)), -log(2)); same(log(abs(-1)) - log(abs(-2)), -log(2))
```

::: pitfall
不要通过相减来检查你的原函数：两个正确的答案可能相差一个常数，如 $\tfrac14(x^2 + 1)^4$ 和 SymPy 的多项式也是如此，因此差值不必为 0。相反，你应该对你的答案进行求导并与被积函数进行比较，如第一框所示：`sp.simplify(sp.diff(F, x) - f)` 必须给出 0。如果差值是一个常数，也说明两个答案都是正确的。

```check
same(simplify(diff((x**2 + 1)**4/4, x) - 2*x*(x**2 + 1)**3), 0); same(diff((x**2 + 1)**4/4 - (x**8/4 + x**6 + 3*x**4/2 + x**2), x), 0)
```
:::

### 当不存在公式时 {#special-functions}

询问 SymPy 对 $e^{-x^2}$ 的原函数，它会给出一个你未曾见过的函数：

::: compute 涉及特殊函数的积分
```python
import sympy as sp
x = sp.symbols('x')
print(sp.integrate(sp.exp(-x**2), x))
print(sp.diff(sp.erf(x), x))
I = sp.integrate(sp.exp(-x**2), (x, 0, 1))
print(I, sp.N(I))
```

```output
sqrt(pi)*erf(x)/2
2*exp(-x**2)/sqrt(pi)
sqrt(pi)*erf(1)/2 0.746824132812427
```

`erf` 是 **错误函数**，定义为一个面积函数：
$$\operatorname{erf} x = \frac{2}{\sqrt\pi}\int_0^x e^{-t^2}\,dt.$$
根据第一部分，其导数是 $\dfrac{2}{\sqrt\pi}e^{-x^2}$，如第二行所示，因此 $\dfrac{\sqrt\pi}{2}\operatorname{erf} x$ 是 $e^{-x^2}$ 的原函数：SymPy 的答案是第一部分在起作用，附带了一个名称。它的值是数值计算得到的，与 $\sin x$ 和 $\ln x$ 的值相同。使用一千个矩形的中点和法与 SymPy 的值在前七位数字上一致：

```python
import numpy as np
n = 1000
mids = (np.arange(n) + 0.5)/n                        # midpoints of [0, 1] cut into n pieces
print(np.sum(np.exp(-mids**2))/n)
```

```output
0.7468241634690489
```

正弦积分 $\operatorname{Si} x = \int_0^x \frac{\sin t}{t}\,dt$ 是另一个这样的函数；在 $t = 0$ 处其被积函数被赋予值 1，其极限在那里（[模块 2](module_02_ZH.html#trig-limits))，因此它是连续的：

```python
print(sp.integrate(sp.sin(x)/x, x))
```

```output
Si(x)
```
:::

```check
same(integrate(exp(-x**2), x), sqrt(pi)*erf(x)/2); same(diff(erf(x), x), 2*exp(-x**2)/sqrt(pi))
same(diff(Integral(exp(-t**2), (t, 0, x))*2/sqrt(pi), x), 2*exp(-x**2)/sqrt(pi)); antideriv(sqrt(pi)*erf(x)/2, exp(-x**2), x)
rounds(sqrt(pi)*erf(1)/2, '0.746824'); rounds(sqrt(pi)*erf(1)/2, '0.746824132812427')
holds(Abs(Float('0.7468241634690489') - sqrt(pi)*erf(1)/2) < 4e-8); same(floor(Float('0.7468241634690489')*10**7), floor(sqrt(pi)*erf(1)/2*10**7))
same(integrate(sin(x)/x, x), Si(x)); same(diff(Si(x), x), sin(x)/x); limit_is(sin(t)/t, t, 0, 1)
```

由模块1目录中的函数构成的任何公式都没有导数$e^{-x^2}$或$\frac{\sin x}{x}$；这是一个定理，超出本系列范围，模块11将回到此类函数。误差函数在概率论和统计学中占据核心地位，其中$e^{-x^2}$是正态分布的形状（模块12）。当SymPy以`erf`、`Si`或其他特殊函数作答时，它并未失败：根据第一部分，该积分是一个完全有效的函数，而SymPy已为其命名。

## 你所学到的内容 {#summary}

- $f$在区间上的一个**反导函数**是满足$F$的函数$F' = f$。在区间上，所有反导函数都是$F + C$（定理10.1，来自模块8中导数相等意味着常数差的定理）；在由多个区间组成的定义域上，常数在每个区间上可能不同。
- 基本原函数表可由求导法则反向推导得出：$\dfrac{x^{n+1}}{n + 1}$ 对 $x^n$ ($n \ne -1$), $\ln\abs{x}$ 对 $\dfrac1x$, $-\cos x$ 对 $\sin x$, $\arctan x$ 对 $\dfrac{1}{1 + x^2}$，依此类推。每个原函数都应通过求导来验证。
- **初值问题** $F' = f$，$F(x_0) = y_0$ 在加速度为常数且有两个初始条件的情况下，有且仅有一个解存在于 $f$ 连续的区间内；其中 $v(t) = v_0 + at$ 和 $s(t) = s_0 + v_0t + \tfrac12at^2$ 是下落球的 $s = 4.9t^2$。
- **面积函数** $A(x) = \int_a^x f(t)\,dt$ 积累有符号面积：它在 $f > 0$ 处增加，在 $f < 0$ 处减少。
- **基本定理，第一部分：** 如果 $f$ 在包含 $a$ 的区间上连续，则 $\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt = f(x)$ 在该区间内（端点处为单侧导数）存在。因此，每个在区间上连续的函数都有一个原函数，并且结合链式法则可得 $\dfrac{d}{dx}\displaystyle\int_a^{u(x)} f(t)\,dt = f\big(u(x)\big)u'(x)$。
- **基本定理，第2部分：** 如果 $f$ 在 $[a, b]$ 上连续，且 $F$ 是 $f$ 在那里的一个原函数，那么 $\int_a^b f(x)\,dx = F(b) - F(a) = \big[F(x)\big]_a^b$。黎曼和的极限变为两行计算；速度表和里程表互为逆运算。
- **不定积分**$\int f(x)\,dx = F(x) + C$ 是一般的原函数。** 净变化定理**， $\int_a^b F'(x)\,dx = F(b) - F(a)$：速率的积分是净变化。位移是 $\int v\,dt$；路程是 $\int \abs{v}\,dt$。
- **替换法** 反转链式法则： $\int f\big(g(x)\big)g'(x)\,dx = \int f(u)\,du$ 与 $u = g(x)$， $du = g'(x)\,dx$；在定积分中，将积分限改为 $g(a)$ 和 $g(b)$。在 $[-a, a]$ 区间上，偶函数的积分是奇函数在 $[0, a]$ 区间积分的两倍，奇函数的积分是 0。
- SymPy: `sp.integrate(f, x)` （无 $+\,C$）， `sp.integrate(f, (x, a, b))`， `sp.Integral(...)` 和 `.doit()`。它的答案可能与你的答案相差一个常数，写 $\ln x$ 为 $\ln\abs{x}$，或使用特殊函数如 $\operatorname{erf}$，定义为面积函数。

## 练习 {#exercises}

:::: exercise 原函数 {#ex-10-1} ★
求每个函数的通积分，并通过对其求导来验证你的答案。

- (a) $f(x) = 8x^3 - 6x^2 + 1$
- (b) $g(x) = \dfrac{1}{x^3} - \dfrac{4}{\sqrt x}$，对于 $x > 0$
- (c) $h(t) = 3e^{-t} + 2\sin 3t$
- (d) $q(x) = \dfrac{(1 + x)^2}{\sqrt x}$，对于 $x > 0$

::: solution
**(a)** 逐项计算： $8\cdot\dfrac{x^4}{4} - 6\cdot\dfrac{x^3}{3} + x = 2x^4 - 2x^3 + x$，因此答案是 $2x^4 - 2x^3 + x + C$。验证： $8x^3 - 6x^2 + 1$。

**(b)** 以幂的形式表示， $g(x) = x^{-3} - 4x^{-1/2}$。幂法则给出
$$\frac{x^{-2}}{-2} - 4\cdot\frac{x^{1/2}}{1/2} = -\frac{1}{2x^2} - 8\sqrt x,$$
因此答案是 $-\dfrac{1}{2x^2} - 8\sqrt x + C$。验证： $\dfrac{d}{dx}\Big(-\tfrac12 x^{-2} - 8x^{1/2}\Big) = x^{-3} - 4x^{-1/2}$。

**(c)** 用 $k = -1$， $e^{-t}$ 的一个原函数是 $\dfrac{e^{-t}}{-1} = -e^{-t}$；用 $k = 3$， $\sin 3t$ 的一个原函数是 $-\dfrac{\cos 3t}{3}$。答案是 $-3e^{-t} - \dfrac23\cos 3t + C$。验证： $3e^{-t} + 2\sin 3t$。

**(d)** 展开分子并分别将每一项除以 $\sqrt x = x^{1/2}$：
$$\frac{1 + 2x + x^2}{x^{1/2}} = x^{-1/2} + 2x^{1/2} + x^{3/2}.$$
答案是 $2x^{1/2} + \dfrac43 x^{3/2} + \dfrac25 x^{5/2} + C$。将分子和分母分别积分的快捷方式是没有根据的：不存在原函数的商法则。

```check
antideriv(2*x**4 - 2*x**3 + x, 8*x**3 - 6*x**2 + 1, x)
same(1/xp**3 - 4/sqrt(xp), xp**(-3) - 4*xp**Rational(-1, 2))
same(xp**(-2)/(-2) - 4*xp**Rational(1, 2)/Rational(1, 2), -1/(2*xp**2) - 8*sqrt(xp))
antideriv(-1/(2*xp**2) - 8*sqrt(xp), 1/xp**3 - 4/sqrt(xp), xp)
antideriv(-exp(-t), exp(-t), t); antideriv(-cos(3*t)/3, sin(3*t), t); antideriv(-3*exp(-t) - Rational(2, 3)*cos(3*t), 3*exp(-t) + 2*sin(3*t), t)
same(expand((1 + xp)**2/sqrt(xp)), xp**Rational(-1, 2) + 2*xp**Rational(1, 2) + xp**Rational(3, 2))
antideriv(2*xp**Rational(1, 2) + Rational(4, 3)*xp**Rational(3, 2) + Rational(2, 5)*xp**Rational(5, 2), (1 + xp)**2/sqrt(xp), xp)
```
:::
::::

:::: exercise 分部积分法 2 {#ex-10-2} ★
计算：

- (a) $\displaystyle\int_1^3 (2x - 1)^2\,dx$
- (b) $\displaystyle\int_0^{\pi/3} \sec^2 x\,dx$
- (c) $\displaystyle\int_1^4 \Big(\sqrt x + \frac{1}{\sqrt x}\Big)\,dx$
- (d) $\displaystyle\int_0^{1/2} \frac{dx}{\sqrt{1 - x^2}}$

::: solution
**(a)** 展开: $(2x - 1)^2 = 4x^2 - 4x + 1$, 其原函数为 $F(x) = \tfrac43 x^3 - 2x^2 + x$。然后 $F(3) = 36 - 18 + 3 = 21$ 和 $F(1) = \tfrac43 - 2 + 1 = \tfrac13$，因此积分是 $21 - \tfrac13 = \tfrac{62}{3}$。(用 $u = 2x - 1$ 代换得到相同结果: $\tfrac12\int_1^5 u^2\,du = \tfrac12\cdot\tfrac{124}{3} = \tfrac{62}{3}$。)

**(b)** $\tan x$ 是 $\sec^2 x$ 在 $(-\pi/2, \pi/2)$ 上的原函数，包含 $[0, \pi/3]$: $\tan\dfrac{\pi}{3} - \tan 0 = \sqrt3$.

**(c)** 作为幂函数， $x^{1/2} + x^{-1/2}$，其原函数为 $\tfrac23 x^{3/2} + 2x^{1/2}$。在 4 处为 $\tfrac23\cdot 8 + 2\cdot 2 = \tfrac{28}{3}$；在 1 处为 $\tfrac23 + 2 = \tfrac83$。积分是 $\tfrac{28}{3} - \tfrac83 = \tfrac{20}{3}$。

**(d)** $\arcsin x$ 是 $(-1, 1)$ 的原函数，且包含 $[0, \tfrac12]$: $\arcsin\tfrac12 - \arcsin 0 = \dfrac{\pi}{6} \approx 0.5236$。

```check
same(expand((2*x - 1)**2), 4*x**2 - 4*x + 1); F_2a = Rational(4, 3)*x**3 - 2*x**2 + x
antideriv(F_2a, 4*x**2 - 4*x + 1, x); same(F_2a.subs(x, 3), 21); same(36 - 18 + 3, 21); same(F_2a.subs(x, 1), Rational(1, 3))
same(integrate((2*x - 1)**2, (x, 1, 3)), Rational(62, 3)); same(Rational(1, 2)*integrate(u**2, (u, 1, 5)), Rational(62, 3)); same(integrate(u**2, (u, 1, 5)), Rational(124, 3))
same(integrate(sec(x)**2, (x, 0, pi/3)), sqrt(3)); same(tan(pi/3) - tan(0), sqrt(3))
F_2c = Rational(2, 3)*x**Rational(3, 2) + 2*x**Rational(1, 2)
antideriv(F_2c, sqrt(x) + 1/sqrt(x), x); same(F_2c.subs(x, 4), Rational(28, 3)); same(F_2c.subs(x, 1), Rational(8, 3)); same(integrate(sqrt(x) + 1/sqrt(x), (x, 1, 4)), Rational(20, 3))
same(asin(Rational(1, 2)) - asin(0), pi/6); same(integrate(1/sqrt(1 - x**2), (x, 0, Rational(1, 2))), pi/6); rounds(pi/6, '0.5236')
```
:::
::::

:::: exercise 导数的积分 {#ex-10-3} ★
求每个函数的导数。

- (a) $F(x) = \displaystyle\int_2^x \ln(1 + t^2)\,dt$
- (b) $G(x) = \displaystyle\int_x^5 \sqrt{1 + t^4}\,dt$
- (c) $H(x) = \displaystyle\int_0^{\sin x} e^{t^2}\,dt$
- (d) $K(x) = \displaystyle\int_x^{x^2} t^3\,dt$，用两种方法：用定理 10.3，以及先计算积分。

::: solution
**(a)** $\ln(1 + t^2)$ 在 $\R$ 上连续，因此由第 1 部分， $F'(x) = \ln(1 + x^2)$。

**(b)** 变量是下限： $G(x) = -\int_5^x \sqrt{1 + t^4}\,dt$，因此 $G'(x) = -\sqrt{1 + x^4}$。

**(c)** 上限是 $u(x) = \sin x$，其中 $u'(x) = \cos x$: $H'(x) = e^{\sin^2 x}\cos x$.

**(d)** 根据定理 10.3，使用 $u(x) = x^2$ 和 $v(x) = x$:
$$\begin{aligned} K'(x) &= (x^2)^3\cdot 2x - x^3\cdot 1 \\ &= 2x^7 - x^3. \end{aligned}$$
先计算，$K(x) = \Big[\dfrac{t^4}{4}\Big]_x^{x^2} = \dfrac{x^8}{4} - \dfrac{x^4}{4}$，因此 $K'(x) = 2x^7 - x^3$: 相同的结果。

```check
same(diff(Integral(log(1 + t**2), (t, 2, x)), x), log(1 + x**2))
same(diff(Integral(sqrt(1 + t**4), (t, x, 5)), x), -sqrt(1 + x**4))
same(diff(Integral(exp(t**2), (t, 0, sin(x))), x), exp(sin(x)**2)*cos(x))
steps(Derivative(Integral(t**3, (t, x, x**2)), x), (x**2)**3*2*x - x**3*1, 2*x**7 - x**3)
same(integrate(t**3, (t, x, x**2)), x**8/4 - x**4/4); same(diff(x**8/4 - x**4/4, x), 2*x**7 - x**3)
```
:::
::::

:::: exercise 位移与距离 {#ex-10-4} ★
一名骑车人沿一条直线道路以 $v(t) = 2t - 4$ 米每秒的速度骑行 $0 \le t \le 5$ 秒，其中正速度表示向东。

- (a) 求 5 秒内的位移。
- (b) 求骑行的总距离。
- (c) 用三角形的面积验证这两个结果。

::: solution
**(a)** 位移是 $\displaystyle\int_0^5 (2t - 4)\,dt = \big[t^2 - 4t\big]_0^5 = 25 - 20 = 5$ 米：骑车人最终在起点东边 5 米处。

**(b)** $v(t) < 0$ 对于 $t < 2$ (向西骑行) 和 $v(t) > 0$ 对于 $t > 2$。带有 $F(t) = t^2 - 4t$、$\int_0^2 v\,dt = F(2) - F(0) = -4$ 和 $\int_2^5 v\,dt = F(5) - F(2) = 5 - (-4) = 9$。距离是 $\abs{-4} + 9 = 13$ 米：4 米向西，然后 9 米向东。

**(c)** 图形 $v$ 是一条经过 $(2, 0)$ 的直线。从 0 到 2，它在轴下方围成一个底为 2、高为 4 的三角形，面积为 4；从 2 到 5，它在轴上方围成一个底为 3、高为 6 的三角形，面积为 9。有符号面积为 $-4 + 9 = 5$；无符号面积为 $4 + 9 = 13$。

```check
F_4 = t**2 - 4*t; antideriv(F_4, 2*t - 4, t)
same(integrate(2*t - 4, (t, 0, 5)), 5); same(F_4.subs(t, 5) - F_4.subs(t, 0), 25 - 20)
same(solve(2*t - 4, t), [2]); same(F_4.subs(t, 2) - F_4.subs(t, 0), -4); same(F_4.subs(t, 5) - F_4.subs(t, 2), 9)
same(Rational(1, 2)*2*4, 4); same(Rational(1, 2)*3*6, 9); same((2*t - 4).subs(t, 0), -4); same((2*t - 4).subs(t, 5), 6)
```
:::
::::

:::: exercise 刹车的汽车 {#ex-10-5} ★★
一辆以 30 m/s 速度行驶的汽车以恒定的减速度 6 m/s²（其加速度为 $-6$ m/s²）刹车，直到停止。

- (a) 求其速度 $v(t)$ 和位置 $s(t)$，从刹车开始点起，刹车开始后 $t$ 秒时的数值。
- (b) 它何时停止？刹车过程中行驶了多少距离？
- (c) 如果减速度减半，它将行驶多远？如果以减速度 6 m/s² 起始速度为 60 m/s，又将行驶多远？

::: solution
**(a)** $v$ 是 $a = -6$ 的原函数： $v(t) = -6t + C_1$，且 $v(0) = 30$ 给出 $v(t) = 30 - 6t$。然后 $s(t) = 30t - 3t^2 + C_2$，且 $s(0) = 0$ 给出 $s(t) = 30t - 3t^2$。这些成立直到汽车停止；之后它保持静止。

**(b)** $v(t) = 0$ 当 $t = 5$ s，然后 $s(5) = 150 - 75 = 75$ m。

**(c)** 以 $a = -3$ 为条件： $v(t) = 30 - 3t$ 在 $t = 10$ 处为 0，且 $s(10) = 300 - 150 = 150$ m，是两倍的距离。一般地，以初始速度 $v_0$ 和减速度 $d$，汽车在行驶 $t = v_0/d$ 后停止。
$$v_0\cdot\frac{v_0}{d} - \frac{d}{2}\Big(\frac{v_0}{d}\Big)^2 = \frac{v_0^2}{2d}.$$
所以以 60 m/s 的速度行驶 $d = 6$，它行驶 $\dfrac{3600}{12} = 300$ m：两倍的速度意味着四倍的制动距离，这就是为什么道路速度如此重要。

```check
same(solve(Eq((-6*t + C1).subs(t, 0), 30), C1), [30]); antideriv(30*t - 3*t**2, 30 - 6*t, t); same((30*t - 3*t**2).subs(t, 0), 0)
same(solve(30 - 6*t, t), [5]); same((30*t - 3*t**2).subs(t, 5), 75)
same(solve(30 - 3*t, t), [10]); same((30*t - 3*t**2/2).subs(t, 10), 150); antideriv(30*t - 3*t**2/2, 30 - 3*t, t)
dd = symbols('d', positive=True); V0 = symbols('v_0', positive=True)
steps(V0*(V0/dd) - dd/2*(V0/dd)**2, V0**2/(2*dd)); same((V0**2/(2*dd)).subs({V0: 30, dd: 6}), 75); same((V0**2/(2*dd)).subs({V0: 60, dd: 6}), 300)
```
:::
::::

:::: exercise 换元法 {#ex-10-6} ★★
求：

- (a) $\displaystyle\int x(3x^2 + 1)^4\,dx$
- (b) $\displaystyle\int \frac{\sin x}{2 + \cos x}\,dx$
- (c) $\displaystyle\int \frac{e^{\sqrt x}}{\sqrt x}\,dx$，用于 $x > 0$
- (d) $\displaystyle\int \frac{dx}{\sqrt{9 - x^2}}$，对于 $-3 < x < 3$
- (e) $\displaystyle\int \sin x\cos x\,dx$，一次用 $u = \sin x$，一次用 $u = \cos x$。解释为什么两个答案看起来不同。

::: solution
**(a)** $u = 3x^2 + 1$， $du = 6x\,dx$，因此 $x\,dx = \tfrac16\,du$：
$$\begin{aligned} \frac16\int u^4\,du &= \frac{u^5}{30} + C \\ &= \frac{(3x^2 + 1)^5}{30} + C. \end{aligned}$$

**(b)** $u = 2 + \cos x$, $du = -\sin x\,dx$:
$$\begin{aligned} -\int \frac{du}{u} &= -\ln\abs{u} + C \\ &= -\ln(2 + \cos x) + C, \end{aligned}$$
不使用绝对值符号，因为 $2 + \cos x \ge 1$。

**(c)** $u = \sqrt x$， $du = \dfrac{dx}{2\sqrt x}$，因此 $\dfrac{dx}{\sqrt x} = 2\,du$： $\displaystyle 2\int e^u\,du = 2e^{\sqrt x} + C$。

**(d)** $9 - x^2 = 9\big(1 - (x/3)^2\big)$, 且 $\sqrt9 = 3$。设 $u = x/3$，则 $dx = 3\,du$：
$$\begin{aligned} \int \frac{3\,du}{3\sqrt{1 - u^2}} &= \arcsin u + C \\ &= \arcsin\frac{x}{3} + C. \end{aligned}$$

**(e)** 由$u = \sin x$和$du = \cos x\,dx$得$\int u\,du = \tfrac12\sin^2 x + C$。由$u = \cos x$和$du = -\sin x\,dx$得$-\int u\,du = -\tfrac12\cos^2 x + C$。两者均正确。它们的差$\tfrac12\sin^2 x + \tfrac12\cos^2 x = \tfrac12$为常数，且由定理10.1可知，区间上的原函数至多相差一个常数：每个答案中的“$+\,C$”吸收了该常数。

```check
same(diff(3*x**2 + 1, x), 6*x); antideriv((3*x**2 + 1)**5/30, x*(3*x**2 + 1)**4, x); antideriv(u**5/30, u**4/6, u)
same(diff(2 + cos(x), x), -sin(x)); antideriv(-log(2 + cos(x)), sin(x)/(2 + cos(x)), x); holds(2 + cos(pi) >= 1)
same(diff(sqrt(xp), xp), 1/(2*sqrt(xp))); antideriv(2*exp(sqrt(xp)), exp(sqrt(xp))/sqrt(xp), xp)
same(9*(1 - (x/3)**2), 9 - x**2); same(3/(3*sqrt(1 - u**2)), 1/sqrt(1 - u**2)); antideriv(asin(x/3), 1/sqrt(9 - x**2), x)
antideriv(sin(x)**2/2, sin(x)*cos(x), x); antideriv(-cos(x)**2/2, sin(x)*cos(x), x); same(sin(x)**2/2 - (-cos(x)**2/2), Rational(1, 2))
```
:::
::::

:::: exercise 用替换法计算定积分 {#ex-10-7} ★★
- (a) 精确计算并保留四位小数求值 $\displaystyle\int_0^1 x e^{-x^2}\,dx$。
- (b) 计算 $\displaystyle\int_0^{\pi/4} \tan x\sec^2 x\,dx$。
- (c) 计算 $\displaystyle\int_0^3 \frac{x}{\sqrt{x + 1}}\,dx$。
- (d) 一名学生写出 $\displaystyle\int_0^2 \frac{x}{x^2 + 1}\,dx = \frac12\int_0^2 \frac{du}{u}$。找出错误，并求出正确值。

::: solution
**(a)** $u = -x^2$, $du = -2x\,dx$, 所以 $x\,dx = -\tfrac12\,du$; $x = 0$ 给出 $u = 0$，$x = 1$ 给出 $u = -1$：
$$\begin{aligned} \int_0^1 x e^{-x^2}\,dx &= -\frac12\int_0^{-1} e^u\,du \\ &= \frac12\int_{-1}^0 e^u\,du \\ &= \frac12\big(1 - e^{-1}\big) \approx 0.3161. \end{aligned}$$

**(b)** $u = \tan x$, $du = \sec^2 x\,dx$；极限变为 $\tan 0 = 0$ 和 $\tan\dfrac{\pi}{4} = 1$：$\displaystyle\int_0^1 u\,du = \frac12$。

**(c)** $u = x + 1$，$du = dx$，以及剩余的 $x$ 是 $u - 1$；积分限变为 1 和 4:
$$\begin{aligned} &\int_1^4 \frac{u - 1}{\sqrt u}\,du \\ &\quad= \int_1^4 \big(u^{1/2} - u^{-1/2}\big)\,du \\ &\quad= \Big[\frac23 u^{3/2} - 2u^{1/2}\Big]_1^4 \\ &\quad= \Big(\frac{16}{3} - 4\Big) - \Big(\frac23 - 2\Big) = \frac83. \end{aligned}$$

**(d)** 用 $u = x^2 + 1$ 作为被积函数是正确的，$\tfrac12\cdot\tfrac{du}{u}$，但积分限仍是 $x$ 的。当 $x = 0$，$u = 1$；当 $x = 2$，$u = 5$。正确的值是
$$\frac12\int_1^5 \frac{du}{u} = \frac12\ln 5 \approx 0.8047.$$
学生的积分甚至未定义：$1/u$ 在 $u = 0$ 附近无界。

```check
steps(Integral(x*exp(-x**2), (x, 0, 1)), -Rational(1, 2)*Integral(exp(u), (u, 0, -1)), Rational(1, 2)*Integral(exp(u), (u, -1, 0)), Rational(1, 2)*(1 - exp(-1))); rounds((1 - exp(-1))/2, '0.3161')
same(diff(tan(x), x), sec(x)**2); same(tan(pi/4), 1); steps(Integral(tan(x)*sec(x)**2, (x, 0, pi/4)), Integral(u, (u, 0, 1)), Rational(1, 2))
steps(Integral(x/sqrt(x + 1), (x, 0, 3)), Integral((u - 1)/sqrt(u), (u, 1, 4)), (Rational(16, 3) - 4) - (Rational(2, 3) - 2), Rational(8, 3))
antideriv(Rational(2, 3)*up**Rational(3, 2) - 2*up**Rational(1, 2), (up - 1)/sqrt(up), up)
steps(Integral(x/(x**2 + 1), (x, 0, 2)), Rational(1, 2)*Integral(1/u, (u, 1, 5)), log(5)/2); rounds(log(5)/2, '0.8047')
same(integrate(1/u, (u, 0, 2)), oo)
```
:::
::::

:::: exercise 由公式定义的面积函数 {#ex-10-8} ★★
设 $g(x) = \displaystyle\int_0^x (t^2 - 4t + 3)\,dt$。

- (a) 不计算积分，求 $g'(x)$。
- (b) $g$ 在哪些区间上是递增的，在哪些区间上是递减的？它在哪些点有局部最大值和局部最小值？
- (c) $g$ 的图像在哪些区间上是向上凹的，在哪些区间上是向下凹的？
- (d) 求 $g(x)$ 的表达式，并利用它求出 (b) 中各点的 $g$。$g(3)$ 对面积有什么说法？

::: solution
**(a)** 被积函数在 $\R$ 上连续，因此根据第1部分， $g'(x) = x^2 - 4x + 3 = (x - 1)(x - 3)$。

**(b)** $g'(x) > 0$ 对于 $x < 1$ 和对于 $x > 3$，以及 $g'(x) < 0$ 对于 $1 < x < 3$。因此 $g$ 在 $(-\infty, 1]$ 和 $[3, \infty)$ 上是递增的，在 $[1, 3]$ 上是递减的。根据一阶导数判别法（模块 8）， $g$ 在 $x = 1$ 处有一个局部最大值，在 $x = 3$ 处有一个局部最小值。

**(c)** $g''(x) = 2x - 4$，其在 $x < 2$ 上为负，在 $x > 2$ 上为正：图像在 $(-\infty, 2)$ 上是向下凹的，在 $(2, \infty)$ 上是向上凹的，有一个拐点在 $x = 2$。

**(d)** 根据第 2 部分， $g(x) = \Big[\dfrac{t^3}{3} - 2t^2 + 3t\Big]_0^x = \dfrac{x^3}{3} - 2x^2 + 3x$。然后 $g(1) = \tfrac13 - 2 + 3 = \tfrac43$ 和 $g(3) = 9 - 18 + 9 = 0$。因此从 0 到 1 的面积，其中被积函数为正，是 $\tfrac43$，而从 1 到 3 的有符号面积，其中为负，是 $-\tfrac43$：在 $[0, 3]$ 上它们相互抵消。

```check
same(diff(Integral(t**2 - 4*t + 3, (t, 0, x)), x), x**2 - 4*x + 3); same(factor(x**2 - 4*x + 3), (x - 1)*(x - 3))
holds((x**2 - 4*x + 3).subs(x, 0) > 0); holds((x**2 - 4*x + 3).subs(x, 2) < 0); holds((x**2 - 4*x + 3).subs(x, 4) > 0)
same(diff(x**2 - 4*x + 3, x), 2*x - 4); same(solve(2*x - 4, x), [2])
g8 = x**3/3 - 2*x**2 + 3*x
same(integrate(t**2 - 4*t + 3, (t, 0, x)), g8); same(g8.subs(x, 1), Rational(4, 3)); same(g8.subs(x, 3), 0)
same(integrate(t**2 - 4*t + 3, (t, 1, 3)), -Rational(4, 3))
```
:::
::::

:::: exercise 电荷来自电流 {#ex-10-9} ★★
电流是电荷流动的速率：1 安培等于 1 库仑每秒。假设流入电容器的电流是 $I(t) = 0.2e^{-t/5}$ 安培持续 $t \ge 0$ 秒。

- (a) 在前5秒内有多少电荷流过？在前10秒内有多少？均保留三位小数。
- (b) 找出在前 $T$ 秒内流过的电荷 $Q(T)$，以及当 $T \to \infty$ 趋近于某个值时它所趋近的数值。

::: solution
**(a)** 根据净变化定理，电荷是电流的积分。利用$k = -\tfrac15$，$e^{-t/5}$的一个原函数是$\dfrac{e^{-t/5}}{-1/5} = -5e^{-t/5}$，因此$I(t)$之一为$0.2\cdot(-5e^{-t/5}) = -e^{-t/5}$。那么
$$\begin{aligned} \int_0^5 0.2e^{-t/5}\,dt &= \big[-e^{-t/5}\big]_0^5 \\ &= 1 - e^{-1} \approx 0.632 \text{ C}, \end{aligned}$$
并以相同方式得到 $\int_0^{10} 0.2e^{-t/5}\,dt = 1 - e^{-2} \approx 0.865$ C。

**(b)** $Q(T) = \big[-e^{-t/5}\big]_0^T = 1 - e^{-T/5}$ 库仑。当 $T \to \infty$ 时，根据 $e^{-T/5} \to 0$（模块3），因此 $Q(T) \to 1$：总体而言，电容器所带的电荷趋近于1库仑，在前5秒内大约有三分之二的电荷。

```check
antideriv(-5*exp(-t/5), exp(-t/5), t); antideriv(-exp(-t/5), Rational(2, 10)*exp(-t/5), t)
same(integrate(Rational(2, 10)*exp(-t/5), (t, 0, 5)), 1 - exp(-1)); rounds(1 - exp(-1), '0.632')
same(integrate(Rational(2, 10)*exp(-t/5), (t, 0, 10)), 1 - exp(-2)); rounds(1 - exp(-2), '0.865')
Tp = symbols('T', positive=True)
same(integrate(Rational(2, 10)*exp(-t/5), (t, 0, Tp)), 1 - exp(-Tp/5)); limit_is(1 - exp(-Tp/5), Tp, oo, 1)
holds(Abs((1 - exp(-1)) - Rational(2, 3)) < Rational(4, 100))
```
:::
::::

:::: exercise 对数作为面积 {#ex-10-10} ★★★
本练习通过积分重建自然对数，不使用你已知的 $\ln$ 相关知识。对于 $x > 0$，令
$$L(x) = \int_1^x \frac{dt}{t}.$$

- (a) 证明 $L$ 在 $(0, \infty)$ 上可导，导数为 $L'(x) = 1/x$，并且 $L(1) = 0$。
- (b) 修正 $y > 0$。证明函数 $x \mapsto L(xy)$ 和 $x \mapsto L(x) + L(y)$ 在 $(0, \infty)$ 上有相同的导数，并推导出 $L(xy) = L(x) + L(y)$ 对所有 $x, y > 0$ 成立。
- (c) 推导出 $L(1/x) = -L(x)$，并证明 $L(x^n) = nL(x)$ 对于每一个正整数 $n$ 成立。
- (d) 证明 $L(2) \ge \tfrac12$，并推导出 $L(x) \to \infty$ 当 $x \to \infty$ 趋于无穷时成立。

::: solution
**(a)** $1/t$ 在包含 1 的开区间 $(0, \infty)$ 上连续。根据第 1 部分（适用于开区间的形式），在每个 $x > 0$ 处 $L$ 可导，且导数为 $L'(x) = 1/x$。并且 $L(1) = \int_1^1 \frac{dt}{t} = 0$。

**(b)** 根据链式法则， $\dfrac{d}{dx}L(xy) = L'(xy)\cdot y = \dfrac{y}{xy} = \dfrac1x$。并且 $\dfrac{d}{dx}\big(L(x) + L(y)\big) = \dfrac1x + 0$，因为 $L(y)$ 不依赖于 $x$。两个函数在区间 $(0, \infty)$ 上有相同的导数，因此根据第 8 模块，它们相差一个常数： $L(xy) = L(x) + L(y) + C$ 对所有 $x > 0$ 成立。在 $x = 1$ 处，此式给出 $L(y) = 0 + L(y) + C$，因此 $C = 0$。

**(c)** 由 (b)，$L(x) + L(1/x) = L\big(x\cdot\tfrac1x\big) = L(1) = 0$，所以 $L(1/x) = -L(x)$。对于幂次使用数学归纳法：$L(x^1) = 1\cdot L(x)$，且如果 $L(x^n) = nL(x)$，则 $L(x^{n+1}) = L(x^n\cdot x) = nL(x) + L(x) = (n + 1)L(x)$。

**(d)** 对于 $1 \le t \le 2$，$\dfrac1t \ge \dfrac12$，因此根据积分的夹逼定理，$L(2) \ge \tfrac12(2 - 1) = \tfrac12$。由 (c)，$L(2^n) = nL(2) \ge \tfrac{n}{2}$。由于 $L' = 1/x > 0$，$L$ 是递增的（模块 8），因此 $L(x) \ge \tfrac{n}{2}$ 对于每个 $x \ge 2^n$。给定任意数 $M$，取 $n > 2M$：则 $L(x) > M$ 对所有 $x \ge 2^n$ 成立。因此 $L(x) \to \infty$。

这些是 $\ln$ 的性质，而且确实 $L = \ln$：两者在 $(0, \infty)$ 上都有导数 $1/x$，且在 1 处的值为 0。一些书在此处开始，并将 $\ln x$ 定义为此积分。

```check
same(diff(Integral(1/t, (t, 1, x)), x), 1/x); same(integrate(1/t, (t, 1, 1)), 0)
yp = symbols('y', positive=True)
same(diff(Integral(1/t, (t, 1, xp*yp)), xp), 1/xp); same((1/(xp*yp))*yp, 1/xp)
same(integrate(1/t, (t, 1, xp*yp)), integrate(1/t, (t, 1, xp)) + integrate(1/t, (t, 1, yp)))
same(integrate(1/t, (t, 1, 1/xp)), -integrate(1/t, (t, 1, xp)))
for N_ in range(1, 6):
    same(integrate(1/t, (t, 1, xp**N_)), N_*integrate(1/t, (t, 1, xp)))
same(integrate(1/t, (t, 1, 2)), log(2)); holds(log(2) >= Rational(1, 2)); holds(Rational(1, 2)*(2 - 1) == Rational(1, 2))
same(integrate(1/t, (t, 1, x)), log(x))
```
:::
::::

:::: exercise 周期函数 {#ex-10-11} ★★★
设 $f$ 在 $\R$ 上连续，并且以 $p > 0$ 为周期：$f(x + p) = f(x)$ 对于每个 $x$ 成立。

- (a) 证明 $I(a) = \displaystyle\int_a^{a + p} f(x)\,dx$ 在每个 $a$ 处的值相同。（对 $a$ 求导。）
- (b) 推导出 $\displaystyle\int_0^{np} f(x)\,dx = n\int_0^p f(x)\,dx$ 对于每一个正整数 $n$。
- (c) 利用 (a) 来计算 $\displaystyle\int_1^{1 + \pi} \abs{\sin x}\,dx$，并通过将 $\sin x$ 变号的区间分开来验证答案。

::: solution
**(a)** 根据分割性质， $I(a) = \int_0^{a + p} f(x)\,dx - \int_0^a f(x)\,dx$。根据定理 10.3，令 $u(a) = a + p$，
$$I'(a) = f(a + p)\cdot 1 - f(a) = 0,$$
由周期性。在区间 $\R$ 上导数为 0 的函数是常数（模块 8），因此 $I(a) = I(0)$ 对于每一个 $a$。

**(b)** 将 $[0, np]$ 分割为 $n$ 个区间 $[kp, (k + 1)p]$，对于 $k = 0, 1, \dots, n - 1$：
$$\begin{aligned} \int_0^{np} f(x)\,dx &= \sum_{k=0}^{n-1} I(kp) = n\,I(0) \\ &= n\int_0^p f(x)\,dx. \end{aligned}$$

**(c)** $\abs{\sin x}$ 是连续的，且以 $\pi$ 为周期，因为 $\abs{\sin(x + \pi)} = \abs{-\sin x} = \abs{\sin x}$。根据 (a)，
$$\begin{aligned} \int_1^{1 + \pi} \abs{\sin x}\,dx &= \int_0^\pi \abs{\sin x}\,dx \\ &= \int_0^\pi \sin x\,dx = 2. \end{aligned}$$
验证： $\sin x > 0$ 在 $(1, \pi)$ 上， $\sin x < 0$ 在 $(\pi, 1 + \pi)$ 上，因此积分是
$$\begin{aligned} &\int_1^\pi \sin x\,dx - \int_\pi^{1 + \pi} \sin x\,dx \\ &\quad= (1 + \cos 1) + (1 - \cos 1) = 2. \end{aligned}$$

```check
pp = symbols('p', positive=True); fP = Function('f')
same(diff(Integral(fP(x), (x, a, a + pp)), a), fP(a + pp) - fP(a))
same(sin(x + pi), -sin(x)); same(Abs(-sin(Rational(1, 3))), Abs(sin(Rational(1, 3))))
same(integrate(sin(x), (x, 0, pi)), 2)
same(integrate(sin(x), (x, 1, pi)), 1 + cos(1)); same(-integrate(sin(x), (x, pi, 1 + pi)), 1 - cos(1)); same((1 + cos(1)) + (1 - cos(1)), 2)
holds(sin(pi - Rational(1, 10)) > 0); holds(sin(pi + 1 - Rational(1, 10)) < 0)
for A_ in (0, Rational(1, 2), 1, 3):                    # the cosine over one period: the same for every a
    same(integrate(cos(x)**2, (x, A_, A_ + pi)), pi/2)
same(integrate(cos(x)**2, (x, 0, 3*pi)), 3*integrate(cos(x)**2, (x, 0, pi)))
```
:::
::::

:::: exercise 对称性下的正弦平方 {#ex-10-12} ★★★
- (a) 使用替换 $u = \dfrac{\pi}{2} - x$ 来证明 $\displaystyle\int_0^{\pi/2} \sin^n x\,dx = \int_0^{\pi/2} \cos^n x\,dx$ 对于每一个正整数 $n$。
- (b) 利用 $\sin^2 x + \cos^2 x = 1$ 推导出 $\displaystyle\int_0^{\pi/2} \sin^2 x\,dx = \frac{\pi}{4}$。
- (c) 求 $\displaystyle\int_0^\pi \sin^2 x\,dx$ 和 $\sin^2 x$ 在 $[0, \pi]$ 上的平均值。

::: solution
**(a)** 与 $u = \dfrac{\pi}{2} - x$，$du = -dx$；$x = 0$ 给出 $u = \dfrac{\pi}{2}$，$x = \dfrac{\pi}{2}$ 给出 $u = 0$。由模块 1 的加法公式，$\sin\Big(\dfrac{\pi}{2} - u\Big) = \sin\dfrac{\pi}{2}\cos u - \cos\dfrac{\pi}{2}\sin u = \cos u$。因此由定理 10.7
$$\begin{aligned} \int_0^{\pi/2} \sin^n x\,dx &= \int_{\pi/2}^0 \cos^n u\,(-du) \\ &= \int_0^{\pi/2} \cos^n u\,du. \end{aligned}$$

**(b)** 设 $S = \int_0^{\pi/2} \sin^2 x\,dx$。由 (a)，$\int_0^{\pi/2} \cos^2 x\,dx = S$ 同样成立。相加，
$$\begin{aligned} 2S &= \int_0^{\pi/2} \big(\sin^2 x + \cos^2 x\big)\,dx \\ &= \int_0^{\pi/2} 1\,dx = \frac{\pi}{2}, \end{aligned}$$
所以 $S = \dfrac{\pi}{4}$。未需要 $\sin^2 x$ 的原函数。

**(c)** 在 $[\tfrac{\pi}{2}, \pi]$ 中替换 $u = \pi - x$: 因为 $\sin(\pi - u) = \sin u$, $\int_{\pi/2}^\pi \sin^2 x\,dx = \int_0^{\pi/2} \sin^2 u\,du = \dfrac{\pi}{4}$. 所以 $\int_0^\pi \sin^2 x\,dx = \dfrac{\pi}{2}$，且平均值为 $\dfrac{1}{\pi}\cdot\dfrac{\pi}{2} = \dfrac12$. 这就是为什么一个交流电压 $V_0\sin\omega t$ 在平均上相当于一个恒定电压 $V_0/\sqrt2$ 的功率：功率与电压的平方成正比，且 $\sin^2$ 在半个周期内的平均值为 $\tfrac12$.

```check
same(sin(pi/2 - u), cos(u)); same(sin(pi/2)*cos(u) - cos(pi/2)*sin(u), cos(u))
for N_ in range(1, 7):
    same(integrate(sin(x)**N_, (x, 0, pi/2)), integrate(cos(x)**N_, (x, 0, pi/2)))
same(integrate(sin(x)**2 + cos(x)**2, (x, 0, pi/2)), pi/2); same(integrate(sin(x)**2, (x, 0, pi/2)), pi/4)
same(sin(pi - u), sin(u)); same(integrate(sin(x)**2, (x, pi/2, pi)), pi/4); same(integrate(sin(x)**2, (x, 0, pi)), pi/2); same((1/pi)*(pi/2), Rational(1, 2))
V0s, w_ = symbols('V_0 omega', positive=True)
same(integrate((V0s*sin(w_*t))**2, (t, 0, pi/w_))/(pi/w_), (V0s/sqrt(2))**2)
```
:::
::::

## 自测 {#quiz}

```quiz
? 哪个函数是 $\dfrac{1}{x^2}$ 在 $(0, \infty)$ 上的原函数？
- [ ] $\ln(x^2)$
- [x] $-\dfrac{1}{x}$
- [ ] $-\dfrac{2}{x^3}$
- [ ] $\dfrac{1}{x}$
> 写出 $\dfrac{1}{x^2} = x^{-2}$，将幂次加 1 并除以新的幂次：$\dfrac{x^{-1}}{-1} = -\dfrac1x$；检查：$\big(-x^{-1}\big)' = x^{-2}$。$-\dfrac{2}{x^3}$ 是 $\dfrac{1}{x^2}$ 的导数，不是原函数。$\ln(x^2) = 2\ln x$ 的导数是 $\dfrac2x$。$\dfrac1x$ 的导数是 $-\dfrac{1}{x^2}$：符号错误。

? 设 $f$ 在 $\R$ 和 $A(x) = \displaystyle\int_2^x f(t)\,dt$ 上连续。则 $A'(x)$ 是
- [ ] $f(x) - f(2)$
- [ ] $f'(x)$
- [x] $f(x)$
- [ ] $f(2)$
> 根据基本定理第一部分，面积函数的导数是积分上限处的被积函数：$f(x)$。下限 2 仅将 $A$ 移动一个常数，因此不会出现在 $A'$ 中；$f(x) - f(2)$ 和 $f(2)$ 错误地引入了它。$f'(x)$ 求导次数过多一次。

? $\dfrac{d}{dx}\displaystyle\int_0^{x^3} \cos t\,dt$等于
- [x] $3x^2\cos(x^3)$
- [ ] $\cos(x^3)$
- [ ] $\sin(x^3)$
- [ ] $3x^2\cos x$
> 由$u(x) = x^3$，定理10.3给出$\cos\big(u(x)\big)\,u'(x) = 3x^2\cos(x^3)$。$\cos(x^3)$忽略了因子$u'(x) = 3x^2$。$\sin(x^3)$是积分本身$\sin(x^3) - \sin 0$，而非其导数。$3x^2\cos x$将$x$代入余弦函数以替代$x^3$。

? $\displaystyle\int_1^3 3x^2\,dx$等于
- [ ] $12$
- [ ] $27$
- [ ] $28$
- [x] $26$
> $x^3$ 是一个原函数，因此积分是 $3^3 - 1^3 = 27 - 1 = 26$。27 忘记减去 $F(1)$，而 28 加上了它。12 是 $\big[6x\big]_1^3 = 18 - 6$，它使用了 $3x^2$ 的导数而不是一个原函数。

? 一个粒子沿直线运动，速度为 $v(t) = t - 2$ 米每秒持续 $0 \le t \le 4$。它行驶的距离是多少？
- [ ] 0 m
- [ ] 2 m
- [x] 4 m
- [ ] 8 m
> 速度 $\abs{t - 2}$ 限定了两个三角形，每个三角形的底为 2，高为 2，因此面积为 2：距离是 $2 + 2 = 4$ 米。0 米是位移，即 $\int_0^4 (t - 2)\,dt$：粒子先向后移动 2 米，再向前移动 2 米，最终回到起点。2 米只计算了其中一个运动阶段，而 8 米是 $\int_0^4 t\,dt$，它忽略了 $-2$。

? 用 $u = x^2 + 1$，积分 $\displaystyle\int_0^1 x(x^2 + 1)^3\,dx$ 变为
- [x] $\dfrac12\displaystyle\int_1^2 u^3\,du$
- [ ] $\displaystyle\int_1^2 u^3\,du$
- [ ] $\dfrac12\displaystyle\int_0^1 u^3\,du$
- [ ] $\displaystyle\int_0^1 u^3\,du$
> $du = 2x\,dx$，因此 $x\,dx = \tfrac12\,du$；并且积分限随变量变化： $x = 0$ 给出 $u = 1$， $x = 1$ 给出 $u = 2$。因此积分是 $\tfrac12\int_1^2 u^3\,du = \tfrac{15}{8}$。其他选项要么忽略了因子 $\tfrac12$，要么保留了旧的积分限 0 和 1，要么两者都忽略了。

? 积分 $\sin x\cos x$ 与 $u = \cos x$，你得到 $-\tfrac12\cos^2 x + C$；SymPy 打印 `sin(x)**2/2`。哪一个正确？
- [ ] 你的答案错误，而 SymPy 的正确
- [ ] SymPy 的答案错误，因为它没有包含 $+\,C$
- [ ] 两者都错误，因为它们是不同的函数
- [x] 两者都正确：它们相差一个常数 $\tfrac12$
> $\tfrac12\sin^2 x - \big(-\tfrac12\cos^2 x\big) = \tfrac12(\sin^2 x + \cos^2 x) = \tfrac12$ 是一个常数，且在区间上的原函数可能相差一个常数（定理 10.1）；对任一函数求导都得到 $\sin x\cos x$。SymPy 通常省略 "$+\,C$"，这并不使其答案错误，且两个不同的函数都可以是同一函数的原函数。

? $\displaystyle\int_{-1}^1 (x^3 + 3x^2)\,dx$等于
- [ ] $0$
- [x] $2$
- [ ] $4$
- [ ] $1$
> $x^3$ 是奇函数，因此在 $[-1, 1]$ 上的积分是 0；$3x^2$ 是偶函数，因此其积分是 $2\int_0^1 3x^2\,dx = 2\big[x^3\big]_0^1 = 2$。总和为 2。0 将整个被积函数视为奇函数；1 忘记加倍；4 双倍两次。
```

```check
antideriv(-1/xp, 1/xp**2, xp); same(diff(1/xp**2, xp), -2/xp**3); same(diff(log(xp**2), xp), 2/xp); same(diff(1/xp, xp), -1/xp**2)
same(diff(Integral(fF(t), (t, 2, x)), x), fF(x))
same(diff(Integral(cos(t), (t, 0, x**3)), x), 3*x**2*cos(x**3)); same(integrate(cos(t), (t, 0, x**3)), sin(x**3))
same(integrate(3*x**2, (x, 1, 3)), 26); same(6*3 - 6*1, 12)
same(integrate(t - 2, (t, 0, 4)), 0); same(integrate(Abs(tr - 2), (tr, 0, 4)), 4); same(integrate(t, (t, 0, 4)), 8)
same(integrate(2 - t, (t, 0, 2)) + integrate(t - 2, (t, 2, 4)), 4); same(Rational(1, 2)*2*2, 2)          # the two triangles
steps(Integral(x*(x**2 + 1)**3, (x, 0, 1)), Rational(1, 2)*Integral(u**3, (u, 1, 2)), Rational(15, 8))
same(sin(x)**2/2 - (-cos(x)**2/2), Rational(1, 2))
same(integrate(x**3 + 3*x**2, (x, -1, 1)), 2); same(integrate(x**3, (x, -1, 1)), 0); same(2*integrate(3*x**2, (x, 0, 1)), 2)
```
