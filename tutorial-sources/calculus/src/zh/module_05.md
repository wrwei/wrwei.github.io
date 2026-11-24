---
title: 求导法则
part: 2
lead: 用法则求积、商、三角函数和复合函数的导数，并理解每条法则为什么成立。手算后用图像和 SymPy 复核。你还将看到程序如何用双数对另一个程序求导。
minutes: 255
needs: 模块 1 到 4，特别是导数及其基本法则（模块 4）
goals:
  - 证明并使用乘积法则和商法则，并将幂法则扩展到负整数
  - 对 模块 2 中的极限求导，导出六个三角函数的导数
  - 识别复合函数，并使用链式法则对其进行求导，适用于任意长度的复合链
  - 系统地综合各项规则，简化并检查结果
  - 使用 SymPy 进行求导，并判断两个形式不同的答案是否相等
  - 解释如何利用双精度数进行自动求导以精确计算导数
---

## 从片段构建导数 {#pieces}

模块 4 定义了函数 $f$ 在 $x$ 处的导数为一个极限，

$$f'(x) = \lim_{h\to0}\frac{f(x + h) - f(x)}{h},$$

并对最简单的函数进行了推导：常数的导数为 0，且 $\dfrac{d}{dx}x^n = nx^{n-1}$ 对于每个正整数 $n$（即 **幂法则**）都有导数。它还证明了两个规则，用于从已有导数构建新的导数：和或差的导数等于导数的和或差，即 $(f \pm g)' = f' \pm g'$，以及常数因子保持不变，即 $(cf)' = cf'$。利用这些规则，可以逐项对多项式进行求导：

$$\frac{d}{dx}\big(4x^3 - 5x^2 + 7\big) = 12x^2 - 10x.$$

```check
same(diff(4*x**3 - 5*x**2 + 7, x), 12*x**2 - 10*x)
```

大多数函数都是由和与常数倍以外的运算构建而成。$x^2\sin x$ 是一个乘积，$\dfrac{1}{1 + x^2}$ 是一个商，$\sin(x^2)$ 和$\sqrt{1 + x^2}$ 是复合运算（[第1.5节](module_01_ZH.html#composition)）。每种情况都可以从定义出发进行求导，每次都需推导一个新的极限。本模块一次完成这项工作：它为每种将两个函数组合的方式证明一个规则，并求出三角函数的导数。之后，一个公式的导数将按照该公式是如何构建的来求得。

| 构建为 | 其导数 | 证明于 |
|---|---|---|
| $f + g$ | $f' + g'$ | 模块 4 |
| $cf$, $c$ 是一个常数 | $cf'$ | 模块 4 |
| $fg$ | $f'g + fg'$ | 第5.2节 |
| $\dfrac{f}{g}$ | $\dfrac{f'g - fg'}{g^2}$ | 第5.3节 |
| $f\big(g(x)\big)$ | $f'\big(g(x)\big)\,g'(x)$ | 第5.5节 |

```check
fF, gF, kF = Function('f'), Function('g'), Function('k')
same(diff(fF(x) + gF(x), x), diff(fF(x), x) + diff(gF(x), x)); same(diff(c*fF(x), x), c*diff(fF(x), x))
same(diff(fF(x)*gF(x), x), diff(fF(x), x)*gF(x) + fF(x)*diff(gF(x), x))
same(diff(fF(x)/gF(x), x), (diff(fF(x), x)*gF(x) - fF(x)*diff(gF(x), x))/gF(x)**2)
same(diff(fF(gF(x)), x), diff(fF(u), u).subs(u, gF(x))*diff(gF(x), x))
```

证明使用了早期模块中的三个事实：在某一点可导的函数在该点连续（[定理 4.1](module_04_ZH.html#continuity)）；和、积、商的极限等于这些表达式的极限的和、积、商，前提是这些极限存在且分母不为零（[极限法则](module_02_ZH.html#laws) of 模块 2）；以及对于三角函数，[两个极限](module_02_ZH.html#trig-limits) 模块 2 证明了，

$$\lim_{\theta\to0}\frac{\sin\theta}{\theta} = 1, \qquad \lim_{\theta\to0}\frac{1 - \cos\theta}{\theta} = 0.$$

```check
limit_is(sin(theta)/theta, theta, 0, 1); limit_is((1 - cos(theta))/theta, theta, 0, 0)
```

第5.2至5.5节证明了规则。第5.6至5.8节将它们应用于实际：一种将它们结合起来的策略，使用SymPy计算导数的方法，以及程序计算导数的方式。

## 乘积法则 {#product}

和的导数是导数的和，因此你可能会希望积的导数是导数的积。实际上并非如此。取 $f(x) = x$ 和 $g(x) = x^2$。它们的积是 $x^3$，导数为 $3x^2$；它们的导数的积为 $1 \cdot 2x = 2x$。在 $x = 1$ 处，它们分别为 3 和 2。

```check
same(diff(x*x**2, x), 3*x**2); same(diff(x, x)*diff(x**2, x), 2*x)
same((3*x**2).subs(x, 1), 3); same((2*x).subs(x, 1), 2)
```

### 一个正在增长的矩形 {#rectangle}

为了找到正确的法则，想象一个乘积是一个面积。设 $u = f(x)$ 和 $v = g(x)$ 是一个矩形的边（为了图示，假设它们是正数），因此其面积是 $A = uv$。当 $x$ 增加 $h$ 时，边的变化为

$$\begin{aligned} \Delta u &= f(x + h) - f(x), \\ \Delta v &= g(x + h) - g(x), \end{aligned}$$

并且面积变为 $(u + \Delta u)(v + \Delta v)$。图 5.1 将新的矩形切割成旧矩形、顶部一条面积为 $u\,\Delta v$ 的条带、侧面一条面积为 $v\,\Delta u$ 的条带，以及一个面积为 $\Delta u\,\Delta v$ 的小角落：

$$\begin{aligned} \Delta A &= (u + \Delta u)(v + \Delta v) - uv \\ &= u\,\Delta v + v\,\Delta u + \Delta u\,\Delta v. \end{aligned}$$

::: figure id=fig-05-1
乘积法则作为边长为 $u = f(x)$ 和 $v = g(x)$ 的增长矩形。当 $x$ 变化 $h$ 时，面积 $uv$ 增加一个绿色条带 $u\,\Delta v$、一个橙色条带 $v\,\Delta u$ 和一个紫色角落 $\Delta u\,\Delta v$。在右边， $x$ 的变化减半，因此 $\Delta u$ 和 $\Delta v$ 大约减半：条带减半，但角落缩小到四分之一。
:::

用 $h$ 除以得到面积的平均变化率：

$$\frac{\Delta A}{h} = u\,\frac{\Delta v}{h} + v\,\frac{\Delta u}{h} + \Delta u\,\frac{\Delta v}{h}.$$

作为 $h \to 0$, $\Delta v/h \to g'(x)$ 和 $\Delta u/h \to f'(x)$, 而 $\Delta u \to 0$. 角落在这两个方向上都很小，因此即使除以 $h$ 之后也会消失，剩下的就是 $u\,g'(x) + v\,f'(x)$: 每一边的变化率乘以另一边。

```check
du_, dv_ = symbols('Delta_u Delta_v')
same(expand((u + du_)*(v + dv_) - u*v), u*dv_ + v*du_ + du_*dv_)
same((u + du_/2)*(v + dv_/2) - u*v - (u*dv_ + v*du_)/2, du_*dv_/4)   # halve the changes: the corner is a quarter
```

::: theorem 乘积法则
如果 $f$ 和 $g$ 在 $x$ 处可导，则它们的乘积 $fg$ 也可导，并

$$(fg)'(x) = f'(x)\,g(x) + f(x)\,g'(x).$$

在莱布尼茨记号中，对于 $u = f(x)$ 和 $v = g(x)$： $\dfrac{d}{dx}(uv) = \dfrac{du}{dx}\,v + u\,\dfrac{dv}{dx}$.
:::

::: proof
证明将图示转化为极限。设 $f$ 和 $g$ 分别为 $f(x)$ 和 $g(x)$，对于 $h \ne 0$ 设 $\Delta f = f(x + h) - f(x)$ 和 $\Delta g = g(x + h) - g(x)$，使得 $f(x + h) = f + \Delta f$ 和 $g(x + h) = g + \Delta g$。将乘积展开，如同矩形一样，并除以 $h$：

$$\begin{aligned} &\frac{f(x + h)\,g(x + h) - fg}{h} \\ &\quad= \frac{(f + \Delta f)(g + \Delta g) - fg}{h} \\ &\quad= \frac{\Delta f}{h}\,g + f\,\frac{\Delta g}{h} + \Delta f\,\frac{\Delta g}{h}. \end{aligned}$$

现在令 $h \to 0$。由于 $f$ 和 $g$ 在 $x$ 处可微，故有 $\Delta f/h \to f'(x)$ 和 $\Delta g/h \to g'(x)$。又因为在 $x$ 处可微的函数也在那里连续（定理 4.1），所以 $\Delta f \to 0$。由和与积的极限法则，该式趋于 $f'(x)\,g(x) + f(x)\,g'(x) + 0\cdot g'(x)$，这就是乘积法则。
:::

```check
fv_, gv_, df_, dg_ = symbols('f g Delta_f Delta_g')
steps(((fv_ + df_)*(gv_ + dg_) - fv_*gv_)/h, df_/h*gv_ + fv_*dg_/h + df_*dg_/h)
lhs_p = (fF(x + h)*gF(x + h) - fF(x)*gF(x))/h
same(lhs_p, (fF(x + h) - fF(x))/h*gF(x) + fF(x)*(gF(x + h) - gF(x))/h + (fF(x + h) - fF(x))*(gF(x + h) - gF(x))/h)
```

导数的乘积法则：第一个因子的导数乘以第二个因子，加上第一个因子乘以第二个因子的导数。证明的最后一项 $\Delta f\,\Delta g/h$ 是图的角落，而 $f$ 的连续性使其消失。

假设是证明所需要的，而不是乘积需要导数的条件。如果 $f$ 或 $g$ 在 $x$ 处不可导，定理则无话可说： $\abs{x}$ 在 0 处没有导数（其图像在该点有拐角），但 $\abs{x}\cdot\abs{x} = x^2$ 有。

```check
xr0 = symbols('x', real=True)
same(Abs(xr0)*Abs(xr0), xr0**2); limit_is(Abs(h)/h, h, 0, 1, '+'); limit_is(Abs(h)/h, h, 0, -1, '-')
```

::: example 乘积的两种求导方法
用乘积法则对 $F(x) = (x^2 + 1)(x^3 - 2x)$ 求导，并通过先展开来验证。

对于 $f(x) = x^2 + 1$ 和 $g(x) = x^3 - 2x$，导数分别是 $f'(x) = 2x$ 和 $g'(x) = 3x^2 - 2$，因此

$$\begin{aligned} F'(x) &= 2x(x^3 - 2x) \\ &\quad + (x^2 + 1)(3x^2 - 2) \\ &= (2x^4 - 4x^2) + (3x^4 + x^2 - 2) \\ &= 5x^4 - 3x^2 - 2. \end{aligned}$$

先展开： $F(x) = x^5 - 2x^3 + x^3 - 2x = x^5 - x^3 - 2x$，因此 $F'(x) = 5x^4 - 3x^2 - 2$，相同的结果。

```check
F1 = (x**2 + 1)*(x**3 - 2*x)
steps(Derivative(F1, x), 2*x*(x**3 - 2*x) + (x**2 + 1)*(3*x**2 - 2), (2*x**4 - 4*x**2) + (3*x**4 + x**2 - 2), 5*x**4 - 3*x**2 - 2)
same(expand(2*x*(x**3 - 2*x)), 2*x**4 - 4*x**2); same(expand((x**2 + 1)*(3*x**2 - 2)), 3*x**4 + x**2 - 2)
same(expand(F1), x**5 - x**3 - 2*x); same(diff(x**5 - x**3 - 2*x, x), 5*x**4 - 3*x**2 - 2)
```
:::

展开适用于多项式。乘积法则适用于所有乘积，包括无法展开的乘积，如 $x^2\sin x$（第 5.4 节），并且它仅需数字即可应用。

::: example 电路中的功率
一个元件所接收的电功率是 $P = VI$，等于其两端的电压乘以通过它的电流。假设在某一瞬间，电压为 12 V 并以 0.5 V 每秒的速率下降，而电流为 2 A 并以 0.1 A 每秒的速率上升。此时功率是增加还是减少？变化率是多少？

$V$ 和 $I$ 是时间 $t$ 的函数，且在该时刻 $V = 12$， $V' = -0.5$， $I = 2$ 和 $I' = 0.1$。根据乘积法则，

$$\begin{aligned} P' &= V'I + VI' \\ &= (-0.5)(2) + (12)(0.1) \\ &= -1 + 1.2 = 0.2. \end{aligned}$$

功率正在增加，增加速率为 0.2 瓦特每秒：电流的增加超过了电压的减少。

```check
V0, Vd, I0, Id = 12, Rational(-1, 2), 2, Rational(1, 10)
steps(Vd*I0 + V0*Id, -1 + Rational(12, 10), Rational(2, 10))
Vt, It = Function('V')(t), Function('I')(t)
same(diff(Vt*It, t), diff(Vt, t)*It + Vt*diff(It, t))
```
:::

乘积法则被使用两次，用于对三个函数的乘积进行求导：

$$\begin{aligned} (fgk)' &= \big((fg)k\big)' = (fg)'k + (fg)k' \\ &= f'gk + fg'k + fgk'. \end{aligned}$$

每一项对一个因子进行求导，而对其他因子保持不变；练习 5.10 进一步说明了这一点。

```check
same(diff(fF(x)*gF(x)*kF(x), x), diff(fF(x), x)*gF(x)*kF(x) + fF(x)*diff(gF(x), x)*kF(x) + fF(x)*gF(x)*diff(kF(x), x))
```

::: pitfall
$(fg)' = f'g'$ 是错误的，如 $x \cdot x^2$ 所示。记住正确法则的两种方法：每一项恰好对一个因子进行求导；在矩形中，每一边的变化在另一边扫出一个条带。
:::

## 商法则 {#quotient}

一个分数在分子变化时和分母变化时都会改变，这两种变化效果方向相反：分子变大使得分数变大，分母变大使得分数变小。这个规则包含这两种效果，中间用减号连接。

::: theorem 商法则
如果 $f$ 和 $g$ 在 $x$ 和 $g(x) \ne 0$ 处可导，则 $f/g$ 在 $x$ 处可导，并且

$$\Big(\frac{f}{g}\Big)'(x) = \frac{f'(x)\,g(x) - f(x)\,g'(x)}{g(x)^2}.$$
:::

::: proof
首先，$f/g$ 在 $x$ 附近有定义。$g$ 在 $x$ 处连续，因此 $h$ 充分接近 0 时，$g(x + h)$ 接近非零的 $g(x)$，所以 $g(x + h) \ne 0$。对这样的 $h \ne 0$，沿用定理 5.1 证明中的 $f$、$g$、$\Delta f$、$\Delta g$，把两个分式通分：

$$\begin{aligned} &\frac{f + \Delta f}{g + \Delta g} - \frac{f}{g} \\ &\quad= \frac{(f + \Delta f)\,g - f\,(g + \Delta g)}{g\,(g + \Delta g)} \\ &\quad= \frac{\Delta f\cdot g - f\cdot\Delta g}{g\,(g + \Delta g)}. \end{aligned}$$

用 $h$ 除以，

$$\begin{aligned} &\frac{1}{h}\Big(\frac{f(x + h)}{g(x + h)} - \frac{f(x)}{g(x)}\Big) \\ &\quad= \frac{\dfrac{\Delta f}{h}\,g - f\,\dfrac{\Delta g}{h}}{g\,(g + \Delta g)}. \end{aligned}$$

如 $h \to 0$，$\Delta f/h \to f'(x)$ 和 $\Delta g/h \to g'(x)$，以及 $\Delta g \to 0$ 因为 $g$ 在 $x$ 处连续。因此分母趋于 $g(x)^2$，不等于 0，根据极限法则，表达式趋于 $\dfrac{f'(x)g(x) - f(x)g'(x)}{g(x)^2}$。
:::

```check
steps((fv_ + df_)/(gv_ + dg_) - fv_/gv_, ((fv_ + df_)*gv_ - fv_*(gv_ + dg_))/(gv_*(gv_ + dg_)), (df_*gv_ - fv_*dg_)/(gv_*(gv_ + dg_)))
same(((fv_ + df_)/(gv_ + dg_) - fv_/gv_)/h, (df_/h*gv_ - fv_*dg_/h)/(gv_*(gv_ + dg_)))
lhs_q = (fF(x + h)/gF(x + h) - fF(x)/gF(x))/h
same(lhs_q, ((fF(x + h) - fF(x))/h*gF(x) - fF(x)*(gF(x + h) - gF(x))/h)/(gF(x)*gF(x + h)))
```

分子是乘积法则的 $f'g + fg'$ 带一个负号，因此顺序是有区别的：导数在上边的先求。有些人用口诀帮助记忆：“低导高减高导低，除以下面的平方”。

::: example 多项式的商
对 $y = \dfrac{x^2 - 1}{x^2 + 1}$ 求导，并找出其切线水平的点。

分母 $x^2 + 1$ 永远不为 0，因此规则在每个 $x$ 都适用。Both $x^2 - 1$ 和 $x^2 + 1$ 的导数都是 $2x$：

$$\begin{aligned} y' &= \frac{2x(x^2 + 1) - (x^2 - 1)(2x)}{(x^2 + 1)^2} \\ &= \frac{2x^3 + 2x - 2x^3 + 2x}{(x^2 + 1)^2} \\ &= \frac{4x}{(x^2 + 1)^2}. \end{aligned}$$

切线水平的点是 $y' = 0$。分数为 0 当其分子为 0，因此 $4x = 0$：仅在 $x = 0$ 处，点 $(0, -1)$。这是图像的最低点。确实，写出 $x^2 - 1 = (x^2 + 1) - 2$ 得到 $y = 1 - \dfrac{2}{x^2 + 1}$；由于 $x^2 + 1 \ge 1$，分数最大为 2，因此 $y \ge 1 - 2 = -1$。在 0 左边斜率为负，在右边斜率为正。

```check
y3 = (x**2 - 1)/(x**2 + 1)
steps(Derivative(y3, x), (2*x*(x**2 + 1) - (x**2 - 1)*(2*x))/(x**2 + 1)**2, (2*x**3 + 2*x - 2*x**3 + 2*x)/(x**2 + 1)**2, 4*x/(x**2 + 1)**2)
same(solve(4*x/(x**2 + 1)**2, x), [0]); same(y3.subs(x, 0), -1); same(y3, 1 - 2/(x**2 + 1))
same(function_range(2/(x**2 + 1), x, S.Reals), Interval.Lopen(0, 2)); same(function_range(y3, x, S.Reals), Interval.Ropen(-1, 1))   # y >= 1 - 2 = -1
xneg, xpos = symbols('x_n', negative=True), symbols('x_p', positive=True)
holds((4*xneg/(xneg**2 + 1)**2).is_negative); holds((4*xpos/(xpos**2 + 1)**2).is_positive)
```
:::

### 负幂 {#negative-powers}

商法则完成整数幂法则。

::: theorem 整数幂法则
对于每个整数 $n$，

$$\frac{d}{dx}x^n = nx^{n-1},$$

对于每个 $x$，如果 $n \ge 1$，并且对于每个 $x \ne 0$，如果 $n \le 0$。
:::

::: proof
模块 4 证明了 $n \ge 1$ 的情况。对于 $n = 0$， $x^0 = 1$ 是常数，导数为 $0 = 0 \cdot x^{-1}$。如果 $n$ 为负数，写成 $n = -m$，其中 $m$ 是正整数，使得 $x^n = 1/x^m$ 对于 $x \ne 0$。根据商法则，分子为 1（导数为 0），分母为 $x^m$（导数为 $mx^{m-1}$），

$$\begin{aligned} \frac{d}{dx}\frac{1}{x^m} &= \frac{0 \cdot x^m - 1 \cdot mx^{m-1}}{(x^m)^2} \\ &= \frac{-mx^{m-1}}{x^{2m}} = -mx^{-m-1}, \end{aligned}$$

和 $-mx^{-m-1} = nx^{n-1}$。
:::

```check
mp = symbols('m', positive=True, integer=True)
steps(Derivative(1/x**mp, x), (0*x**mp - 1*mp*x**(mp - 1))/(x**mp)**2, -mp*x**(mp - 1)/x**(2*mp), -mp*x**(-mp - 1))
same(-mp*x**(-mp - 1), (n*x**(n - 1)).subs(n, -mp))
for N_ in range(-6, 1):
    same(diff(x**N_, x), N_*x**(N_ - 1))
same(diff(1/x, x), -1/x**2)
```

例如， $\dfrac{d}{dx}\dfrac{1}{x} = \dfrac{d}{dx}x^{-1} = -x^{-2} = -\dfrac{1}{x^2}$，这个数是 $1/x$ 在区间 [练习 1.9](module_01_ZH.html#ex-1-9) 中差商的极限。

::: example 重力减弱的速度
距离为 $r$ 的两个物体之间的引力为 $F(r) = \dfrac{k}{r^2}$，其中 $k > 0$ 是一个依赖于它们质量的常数。 $F$ 随 $r$ 变化有多快？

写出 $F(r) = kr^{-2}$，并使用幂法则，其中 $n = -2$：

$$F'(r) = k \cdot (-2)r^{-3} = -\frac{2k}{r^3}.$$

导数为负：距离增大时，引力减弱。将其与 $F$ 本身进行比较：$F'(r) = -\dfrac{2}{r}\cdot\dfrac{k}{r^2} = -\dfrac{2}{r}F(r)$。在 $r$ 附近，函数 $F$ 的图像接近其切线（模块 4），因此向外迈出一个小步 $\Delta r$，引力的变化大约为

$$F'(r)\,\Delta r = -2\,\frac{\Delta r}{r}\,F(r):$$

向外移动 1% 的距离，引力减弱约 2%。（精确值：$1/1.01^2 \approx 0.9803$，损失约 1.97%。）

```check
kp, rp, drp = symbols('k r Delta_r', positive=True)
Fg = kp/rp**2
steps(Derivative(Fg, rp), kp*(-2)*rp**(-3), -2*kp/rp**3, -2/rp*Fg)
same(diff(Fg, rp)*drp, -2*drp/rp*Fg)
same((-2*drp/rp*Fg/Fg).subs(drp, rp/100), Rational(-2, 100))      # a 1% step: about -2%
rounds(1/Rational(101, 100)**2, '0.9803'); rounds((1 - 1/Rational(101, 100)**2)*100, '1.97')
```
:::

::: pitfall
$\Big(\dfrac{f}{g}\Big)' = \dfrac{f'}{g'}$ 是错误的。对于 $x \ne 0$，在 $\dfrac{x^2}{x} = x$ 处导数为 1，但 $\dfrac{(x^2)'}{(x)'} = \dfrac{2x}{1} = 2x$。保持分子中的顺序 $f'g - fg'$：交换顺序会改变答案的符号。使用最简单的工具：对于 $\dfrac{3}{x^4} = 3x^{-4}$，幂法则比商法则更快，而对于 $\dfrac{x^3 + x}{5}$，分母为常数时，常数倍法则适用。
:::

```check
same(diff(x**2/x, x), 1); same(diff(x**2, x)/diff(x, x), 2*x)
same(diff(3/x**4, x), -12/x**5); same(diff((x**3 + x)/5, x), (3*x**2 + 1)/5)
```

## 三角函数的导数 {#trig}

图5.2显示了$\sin x$的图像及其部分切线。在$x = 0$处，图像以斜率1上升；在峰顶$x = \pi/2$处，图像是水平的；在$x = \pi$处，图像以斜率$-1$下降；在谷底$x = 3\pi/2$处，图像再次是水平的；在$x = 2\pi$处，图像再次以斜率1上升。这些斜率，即$1, 0, -1, 0, 1$，是$\cos x$在相同点的值。该表格将$\sin x$的差商与$h = 0.001$在更多点与$\cos x$进行了比较：

```valuetable
x = 0, pi/6, pi/4, pi/3, pi/2, 2*pi/3, pi
$\dfrac{\sin(x + 0.001) - \sin x}{0.001}$ = (sin(x + 1/1000) - sin(x))/(1/1000)
$\cos x$ = cos(x)
decimals = 4
---
x | \dfrac{\sin(x + 0.001) - \sin x}{0.001} | \cos x
0 | 1.0000 | 1.0000
\frac{\pi}{6} | 0.8658 | 0.8660
\frac{\pi}{4} | 0.7068 | 0.7071
\frac{\pi}{3} | 0.4996 | 0.5000
\frac{\pi}{2} | -0.0005 | 0.0000
\frac{2 \pi}{3} | -0.5004 | -0.5000
\pi | -1.0000 | -1.0000
```

每一行的两列在0.0005以内一致，更小的$h$会使一致性更接近。

```check
same([cos(X_) for X_ in (0, pi/2, pi, 3*pi/2, 2*pi)], [1, 0, -1, 0, 1])                       # the slopes of Figure 5.2
for X_ in (0, pi/6, pi/4, pi/3, pi/2, 2*pi/3, pi):
    holds(Abs((sin(X_ + Rational(1, 1000)) - sin(X_))*1000 - cos(X_)) < Rational(5, 10000))
    holds(Abs((sin(X_ + Rational(1, 10000)) - sin(X_))*10000 - cos(X_)) < Rational(5, 100000))   # h = 0.0001: closer
```

::: figure id=fig-05-2
顶：$y = \sin x$ 在 $0$、$\pi/2$、$\pi$、$3\pi/2$ 和 $2\pi$ 处有切线，其斜率是 $1, 0, -1, 0, 1$。底：$y = \cos x$ 恰好通过那些值（橙色点）。当正弦曲线平坦时，即在波峰和波谷处，余弦曲线穿过零点。
:::

原因在于模块2中的加法公式和两个极限。

::: theorem 正弦和余弦的导数
对于每一个实数 $x$（以弧度为单位），

$$\begin{aligned} \frac{d}{dx}\sin x &= \cos x, \\ \frac{d}{dx}\cos x &= -\sin x. \end{aligned}$$
:::

::: proof
根据加法公式 $\sin(x + h) = \sin x\cos h + \cos x\sin h$（[第 1.4 节](module_01_ZH.html#trig)），

$$\begin{aligned} &\frac{\sin(x + h) - \sin x}{h} \\ &\quad= \frac{\sin x\cos h - \sin x + \cos x\sin h}{h} \\ &\quad= -\sin x\cdot\frac{1 - \cos h}{h} + \cos x\cdot\frac{\sin h}{h}. \end{aligned}$$

这里 $x$ 是固定的，只有 $h$ 变化。当 $h \to 0$ 时，两个分数分别趋近于 0 和 1（模块 2），因此差商趋近于 $-\sin x \cdot 0 + \cos x \cdot 1 = \cos x$。

对于余弦函数，加法公式 $\cos(x + h) = \cos x\cos h - \sin x\sin h$ 同样给出

$$\begin{aligned} &\frac{\cos(x + h) - \cos x}{h} \\ &\quad= -\cos x\cdot\frac{1 - \cos h}{h} - \sin x\cdot\frac{\sin h}{h}, \end{aligned}$$

其趋近于 $-\cos x \cdot 0 - \sin x \cdot 1 = -\sin x$。
:::

```check
steps((sin(x + h) - sin(x))/h, (sin(x)*cos(h) - sin(x) + cos(x)*sin(h))/h, -sin(x)*(1 - cos(h))/h + cos(x)*sin(h)/h)
steps((cos(x + h) - cos(x))/h, -cos(x)*(1 - cos(h))/h - sin(x)*sin(h)/h)
limit_is((sin(x + h) - sin(x))/h, h, 0, cos(x)); limit_is((cos(x + h) - cos(x))/h, h, 0, -sin(x))
same(diff(sin(x), x), cos(x)); same(diff(cos(x), x), -sin(x))
```

$(\cos x)' = -\sin x$ 中的负号在图中体现出来：当 $x$ 略大于 0 时，余弦函数从其峰值下降，而 $\sin x$ 为正。

::: deeper 加法公式来源于何处
模块 1 引用了学校三角学中的加法公式。这里有一个来自单位圆的证明。设 $P$ 和 $Q$ 是单位圆上角度为 $x$ 和 $y$ 的点。将整个图形绕角度 $-y$ 旋转，将 $Q$ 移动到 $(1, 0)$，将 $P$ 移动到角度为 $x - y$ 的点，旋转不会改变距离。因此，点 $P$ 到 $Q$ 的平方距离等于点 $\big(\cos(x - y), \sin(x - y)\big)$ 到 $(1, 0)$ 的平方距离：

$$\begin{aligned} &(\cos x - \cos y)^2 + (\sin x - \sin y)^2 \\ &\quad= \big(\cos(x - y) - 1\big)^2 + \sin^2(x - y). \end{aligned}$$

展开两边并使用 $\sin^2\theta + \cos^2\theta = 1$：左边是 $2 - 2(\cos x\cos y + \sin x\sin y)$，右边是 $2 - 2\cos(x - y)$。因此

$$\cos(x - y) = \cos x\cos y + \sin x\sin y.$$

一切其余内容由此推导得出。将 $y$ 替换为 $-y$（余弦是偶函数，正弦是奇函数）可得到以下第一个公式；取 $x = \pi/2$，其中余弦为 0，正弦为 1，可得到第二个公式：

$$\begin{aligned} \cos(x + y) &= \cos x\cos y - \sin x\sin y, \\ \cos(\tfrac{\pi}{2} - y) &= \sin y. \end{aligned}$$

用 $\pi/2 - y$ 替换 $y$，第二个公式表示 $\sin(\pi/2 - y) = \cos y$。最后，

$$\begin{aligned} \sin(x + y) &= \cos\big((\tfrac{\pi}{2} - x) - y\big) \\ &= \cos(\tfrac{\pi}{2} - x)\cos y \\ &\quad + \sin(\tfrac{\pi}{2} - x)\sin y \\ &= \sin x\cos y + \cos x\sin y. \end{aligned}$$

```check
xr, yr = symbols('x y', real=True)
same(expand((cos(xr) - cos(yr))**2 + (sin(xr) - sin(yr))**2), 2 - 2*(cos(xr)*cos(yr) + sin(xr)*sin(yr)))
same((cos(xr - yr) - 1)**2 + sin(xr - yr)**2, 2 - 2*cos(xr - yr))
same(cos(xr - yr), cos(xr)*cos(yr) + sin(xr)*sin(yr))
same(cos(xr)*cos(-yr) + sin(xr)*sin(-yr), cos(xr)*cos(yr) - sin(xr)*sin(yr))
same(cos(pi/2)*cos(yr) + sin(pi/2)*sin(yr), sin(yr)); same(cos(pi/2 - (pi/2 - yr)), cos(yr))
steps(sin(xr + yr), cos((pi/2 - xr) - yr), cos(pi/2 - xr)*cos(yr) + sin(pi/2 - xr)*sin(yr), sin(xr)*cos(yr) + cos(xr)*sin(yr))
```
:::

**为什么使用弧度.** 该极限 $\dfrac{\sin h}{h} \to 1$ 成立是因为 $h$ 以弧度为单位测量的，因为它是单位圆上的弧长（模块 2）。在度数中，导数中会出现一个额外因子 $\pi/180$（例 5.8）。弧度是使正弦函数导数恰好等于余弦函数的单位。

### 其他四个函数 {#other-trig}

商的法则从正弦和余弦的导数推导出其他四个三角函数的导数。

::: theorem tan、cot、sec 和 csc 的导数
其中 $\cos x \ne 0$，

$$\begin{aligned} \frac{d}{dx}\tan x &= \sec^2 x, \\ \frac{d}{dx}\sec x &= \sec x\tan x, \end{aligned}$$

以及其中 $\sin x \ne 0$，

$$\begin{aligned} \frac{d}{dx}\cot x &= -\csc^2 x, \\ \frac{d}{dx}\csc x &= -\csc x\cot x. \end{aligned}$$
:::

::: proof
每个都是正弦和余弦（或 1 和其中之一）的商，因此使用商的法则，然后 $\sin^2 x + \cos^2 x = 1$。其中 $\cos x \ne 0$，

$$\begin{aligned} &\frac{d}{dx}\frac{\sin x}{\cos x} \\ &\quad= \frac{\cos x\cos x - \sin x(-\sin x)}{\cos^2 x} \\ &\quad= \frac{\cos^2 x + \sin^2 x}{\cos^2 x} \\ &\quad= \frac{1}{\cos^2 x} = \sec^2 x, \\[6pt] &\frac{d}{dx}\frac{1}{\cos x} \\ &\quad= \frac{0\cdot\cos x - 1\cdot(-\sin x)}{\cos^2 x} \\ &\quad= \frac{1}{\cos x}\cdot\frac{\sin x}{\cos x} = \sec x\tan x. \end{aligned}$$

其中 $\sin x \ne 0$，

$$\begin{aligned} &\frac{d}{dx}\frac{\cos x}{\sin x} \\ &\quad= \frac{(-\sin x)\sin x - \cos x\cos x}{\sin^2 x} \\ &\quad= -\frac{\sin^2 x + \cos^2 x}{\sin^2 x} \\ &\quad= -\frac{1}{\sin^2 x} = -\csc^2 x, \\[6pt] &\frac{d}{dx}\frac{1}{\sin x} \\ &\quad= \frac{0\cdot\sin x - 1\cdot\cos x}{\sin^2 x} \\ &\quad= -\frac{1}{\sin x}\cdot\frac{\cos x}{\sin x} = -\csc x\cot x. \end{aligned}$$
:::

```check
steps(Derivative(sin(x)/cos(x), x), (cos(x)*cos(x) - sin(x)*(-sin(x)))/cos(x)**2, (cos(x)**2 + sin(x)**2)/cos(x)**2, 1/cos(x)**2, sec(x)**2)
steps(Derivative(1/cos(x), x), (0*cos(x) - 1*(-sin(x)))/cos(x)**2, 1/cos(x)*(sin(x)/cos(x)), sec(x)*tan(x))
steps(Derivative(cos(x)/sin(x), x), ((-sin(x))*sin(x) - cos(x)*cos(x))/sin(x)**2, -(sin(x)**2 + cos(x)**2)/sin(x)**2, -1/sin(x)**2, -csc(x)**2)
steps(Derivative(1/sin(x), x), (0*sin(x) - 1*cos(x))/sin(x)**2, -1/sin(x)*(cos(x)/sin(x)), -csc(x)*cot(x))
same(diff(tan(x), x), sec(x)**2); same(diff(sec(x), x), sec(x)*tan(x)); same(diff(cot(x), x), -csc(x)**2); same(diff(csc(x), x), -csc(x)*cot(x))
```

一个记忆模式：三个“余”函数——余弦、余切和余割——带有负号。

::: example 与正弦和余弦的乘积和商
对 (a) $x^2\sin x$、(b) $\sin x\cos x$ 和 (c) $\dfrac{\sin x}{x}$ 在 $x \ne 0$ 下求导。

**(a)** 乘积法则： $\dfrac{d}{dx}\big(x^2\sin x\big) = 2x\sin x + x^2\cos x$。

**(b)** 乘积法则再次应用：

$$\begin{aligned} &\frac{d}{dx}(\sin x\cos x) \\ &\quad= \cos x\cos x + \sin x(-\sin x) \\ &\quad= \cos^2 x - \sin^2 x. \end{aligned}$$

**(c)** 商法则： $\dfrac{d}{dx}\dfrac{\sin x}{x} = \dfrac{\cos x\cdot x - \sin x\cdot 1}{x^2} = \dfrac{x\cos x - \sin x}{x^2}$.

```check
same(diff(x**2*sin(x), x), 2*x*sin(x) + x**2*cos(x))
steps(Derivative(sin(x)*cos(x), x), cos(x)*cos(x) + sin(x)*(-sin(x)), cos(x)**2 - sin(x)**2)
steps(Derivative(sin(x)/x, x), (cos(x)*x - sin(x)*1)/x**2, (x*cos(x) - sin(x))/x**2)
```
:::

::: example 一个弹簧上的质量
一个质量在弹簧上上下弹跳。假设它在 $t$ 秒后相对于平衡点的高度为 $s(t) = 4\sin t + 3\cos t$ 厘米。求它的速度 $v = s'$ 和加速度 $a = v'$，并比较 $a$ 与 $s$。

$$\begin{aligned} v(t) &= 4\cos t - 3\sin t \ \text{cm/s}, \\ a(t) &= -4\sin t - 3\cos t \ \text{cm/s}^2. \end{aligned}$$

所以 $a(t) = -s(t)$ 在每一瞬间：加速度始终指向平衡点，并且与距离成正比。这就是弹簧的拉力（胡克定律），并且模块 13 表明，具有这种性质的任何运动都是正弦和余弦的组合。在 $t = 0$ 时，质量位于 3 厘米上方，并以 4 厘米/秒的速度向上运动。

```check
s6 = 4*sin(t) + 3*cos(t)
v6 = diff(s6, t); a6 = diff(v6, t)
same(v6, 4*cos(t) - 3*sin(t)); same(a6, -4*sin(t) - 3*cos(t)); same(a6, -s6)
same(s6.subs(t, 0), 3); same(v6.subs(t, 0), 4)
```
:::

::: pitfall
两个标牌： $(\cos x)' = -\sin x$，不是 $\sin x$；以及 $\cot x$ 和 $\csc x$ 的导数也带有负号。所有六个公式都假设使用弧度：用计算器的度数模式验证它们会失败。
:::

## 链式法则 {#chain}

合成函数无处不在：$\sin(2x)$, $(x^2 + 1)^{10}$, $\sqrt{1 + x^2}$。从数字开始。在 $x = 0$ 处 $y = \sin(2x)$ 的斜率是多少？那里的差商是 $\dfrac{\sin(2h) - \sin 0}{h} = \dfrac{\sin(2h)}{h}$：

```valuetable
h = 0.1, 0.01, 0.001
$\dfrac{\sin(2h)}{h}$ = sin(2*h)/h
digits = 7
---
h | \dfrac{\sin(2h)}{h}
0.1 | 1.986693
0.01 | 1.999867
0.001 | 1.999999
```

它们趋近于 2，而不是 $\cos(2 \cdot 0) = 1$。[第 1.5 ](module_01_ZH.html#transformations) 节解释了原因：函数 $\sin(2x)$ 的图像实际上是函数 $\sin x$ 水平方向被压缩了 2 倍，因此它上升得更陡峭，每个斜率都加倍。函数 $\sin(2x)$ 的导数是 $2\cos(2x)$：外层函数（正弦函数）在内层函数 $2x$ 处的导数乘以内层函数变化的速率 2。

```check
limit_is(sin(2*h)/h, h, 0, 2); same(diff(sin(2*x), x), 2*cos(2*x)); same(cos(2*0), 1)
```

### 速率相乘 {#rates-multiply}

在图 5.3 中，齿轮 A 有 36 齿，齿轮 B 有 18 齿，齿轮 C 有 6 齿。当 A 转动一圈时，36 齿经过与 B 相啮合的点，因此 B 转动 $36/18 = 2$ 圈。对于每转一圈 B，18 齿经过 C，因此 C 转动 $18/6 = 3$ 圈。因此，C 比 A 快 $3 \cdot 2 = 6$ 倍。如果 $\theta_A$、$\theta_B$ 和 $\theta_C$ 分别表示各齿轮转动的角度，每个角度按各自转动方向测量，

$$\frac{d\theta_C}{d\theta_A} = \frac{d\theta_C}{d\theta_B}\cdot\frac{d\theta_B}{d\theta_A} = 3 \cdot 2 = 6.$$

::: figure id=fig-05-3
速率相乘。齿轮 B 每转一圈，齿轮 A 转两圈；齿轮 C 每转一圈，齿轮 B 转三圈，因此 C 每转一圈，A 转 $3 \cdot 2 = 6$ 圈。相啮合的齿轮转动方向相反（箭头所示）。
:::

单位换算同样适用。假设一辆汽车每公里耗油 0.06 升，以 90 公里/小时速度行驶。则它每小时耗油 $0.06 \cdot 90 = 5.4$ 升，单位相乘如分数相乘：（升/公里）乘以（公里/小时）等于升/小时。

```check
same(Rational(36, 18), 2); same(Rational(18, 6), 3); same(3*2, 6); same(Rational(36, 6), 6)
same(Rational(6, 100)*90, Rational(54, 10))
```

对于齿轮和燃料，速率是恒定的。对于曲线，速率在各点之间变化，但在每个点附近，可导函数接近于其切线，而切线具有恒定的速率，即斜率。因此，逐点地，速率相乘。

::: theorem 链式法则
如果 $g$ 在 $x$ 处可导，且 $f$ 在 $g(x)$ 处可导，则复合函数 $F = f \circ g$, $F(x) = f\big(g(x)\big)$, 在 $x$ 处可导，并且

$$F'(x) = f'\big(g(x)\big)\,g'(x).$$

在莱布尼茨记号中，对于 $y = f(u)$ 和 $u = g(x)$，

$$\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx},$$

其中 $dy/du$ 在 $u = g(x)$ 处求值。
:::

用文字表述：对外层函数求导，保持内层函数不变，再乘以内层函数的导数。符号 $f'\big(g(x)\big)$ 读作“g of x 的 f 的导数”：即 $f$ 在数值 $g(x)$ 处的导数。莱布尼茨形式看起来像是在消去 $du$：这里 $dy/dx$ 表现得像分数，这使得该规则易于记忆。但这并非证明，因为 $dy/du$ 是一个表示极限的单一符号（模块 4），而非分数。

$f$必须在某点可导：在 $g(x)$ 这个使用该点，而不是在 $x$。没有这个假设，规则可能失效：对于 $f(u) = \abs{u}$ 和 $g(x) = x^2 - 1$，虽然 $f$ 在 1 处可导，但在 $g(1) = 0$ 处不可导，且 $f\big(g(x)\big) = \abs{x^2 - 1}$ 在 $x = 1$ 处有拐点。

```check
same(diff(fF(gF(x)), x), Subs(Derivative(fF(u), u), u, gF(x))*Derivative(gF(x), x))
same((x**2 - 1).subs(x, 1), 0); limit_is((Abs(1 + h) - 1)/h, h, 0, 1)        # |u| is differentiable at u = 1
cq = Abs(((1 + h)**2 - 1))/h                                  # the difference quotient of |x^2 - 1| at 1
limit_is(cq, h, 0, 2, '+'); limit_is(cq, h, 0, -2, '-')
```

**证明思想。** 设 $u = g(x)$，当 $x$ 改变 $h$ 时，设 $\Delta u = g(x + h) - g(x)$ 和 $\Delta y = f(u + \Delta u) - f(u)$ 分别为 $u$ 和 $y$ 的变化量。如果 $\Delta u \ne 0$，

$$\frac{\Delta y}{h} = \frac{\Delta y}{\Delta u}\cdot\frac{\Delta u}{h}.$$

与 $h \to 0$ 类似， $\Delta u \to 0$（因为 $g$ 在 $x$ 处连续），所以 $\Delta y/\Delta u \to f'(u)$，而 $\Delta u/h \to g'(x)$；乘积趋于 $f'(u)\,g'(x)$。这是极限的齿轮论证，几乎是一个证明。缺口：对于 $h \ne 0$ 接近 0 的值， $\Delta u$ 可以是 0（对于常数 $g$，它对所有 $h$ 都是 0；练习 5.11 给出一个不太明显的例子），然后 $\Delta y/\Delta u$ 是 $0/0$。下一个框用完整的证明填补了这个缺口；初次阅读可跳过。

::: deeper 链式法则的证明
关于除以 $\Delta u$ 的处理方式是描述 $f$ 的可导性而不进行除法。令 $u = g(x)$。由于 $f$ 在 $u$ 处可导，它定义在 $u$ 附近的一个开区间内；对于 $k \ne 0$ 使得 $u + k$ 在该区间内，令

$$E(k) = \frac{f(u + k) - f(u)}{k} - f'(u),$$

差商超过 $f'(u)$ 的量，令 $E(0) = 0$。 $f$ 在 $u$ 处可导的条件恰好说明 $E(k) \to 0$ 当 $k \to 0$；由于 $E(0) = 0$， $E$ 在 0 处连续。乘以 $k$，

$$f(u + k) - f(u) = \big(f'(u) + E(k)\big)\,k,$$

对于 $k \ne 0$，以及对于 $k = 0$，当两边都为 0 时。

现在令 $h \ne 0$ 足够小，使得 $g(x + h)$ 位于区间 (可能因为 $g$ 在 $x$ 处连续)，并令 $k = \Delta u = g(x + h) - g(x)$，无论 $\Delta u$ 是否为 0 都允许。除以 $h$，

$$\begin{aligned} &\frac{f\big(g(x + h)\big) - f\big(g(x)\big)}{h} \\ &\quad= \big(f'(u) + E(\Delta u)\big)\,\frac{\Delta u}{h}. \end{aligned}$$

设 $h \to 0$. 那么 $\Delta u/h \to g'(x)$，因为 $g$ 在 $x$ 处可导。同时 $\Delta u \to 0$，因为 $g$ 在 $x$ 处连续，因此 $E(\Delta u) \to E(0) = 0$，因为 $E$ 在 0 处连续（复合函数的极限，[定理 3.4](module_03_ZH.html#composition)）。所以右边趋近于 $f'(u)\,g'(x)$，这证明了链式法则。

每个假设都被使用了：$g$ 在 $x$ 处的可导性，用于 $\Delta u/h \to g'(x)$，并通过连续性用于 $\Delta u \to 0$；以及 $f$ 在 $u = g(x)$ 处的可导性，而非在 $x$ 处，用于 $E(k) \to 0$。

```check
kk = symbols('k')
Ek = (sin(u + kk) - sin(u))/kk - cos(u)          # E(k) for f = sin at u
same((cos(u) + Ek)*kk, sin(u + kk) - sin(u)); limit_is(Ek, kk, 0, 0)
Ek2 = ((u + kk)**3 - u**3)/kk - 3*u**2              # and for f(u) = u^3
same((3*u**2 + Ek2)*kk, (u + kk)**3 - u**3); limit_is(Ek2, kk, 0, 0)
```
:::

### 使用链式法则 {#using-chain}

要使用链式法则，需命名内部函数，对外部函数进行求导并将内部函数保留其中，再乘以内层函数的导数。

::: example 三个复合函数
求导 (a) $(2x + 1)^5$，(b) $\sin(x^2)$ 和 (c) $\sin^2 x$。

**(a)** 内函数是 $u = 2x + 1$，其中 $du/dx = 2$，外函数是 $u^5$:

$$\begin{aligned} \frac{d}{dx}(2x + 1)^5 &= 5(2x + 1)^4 \cdot 2 \\ &= 10(2x + 1)^4. \end{aligned}$$

展开 $(2x + 1)^5$ 也可以，但需要更多步骤。

**(b)** 内 $u = x^2$，外 $\sin u$: $\dfrac{d}{dx}\sin(x^2) = \cos(x^2)\cdot 2x = 2x\cos(x^2)$.

**(c)** $\sin^2 x$ 表示 $(\sin x)^2$: 内 $u = \sin x$，外 $u^2$. 所以 $\dfrac{d}{dx}\sin^2 x = 2\sin x\cdot\cos x$.

在 (b) 中正弦函数在外层，而在 (c) 中在内层：这两个函数以不同的顺序复合，其导数不同。

```check
steps(Derivative((2*x + 1)**5, x), 5*(2*x + 1)**4*2, 10*(2*x + 1)**4)
steps(Derivative(sin(x**2), x), cos(x**2)*2*x, 2*x*cos(x**2))
same(diff(sin(x)**2, x), 2*sin(x)*cos(x)); holds(Ne((2*x*cos(x**2)).subs(x, 1), (2*sin(x)*cos(x)).subs(x, 1)))    # different functions: compare at x = 1
```
:::

::: example 正弦函数以度数为单位
在度数模式下，计算器的正弦键计算 $S(x) = \sin(x^\circ) = \sin\Big(\dfrac{\pi x}{180}\Big)$。找出 $S'(x)$。

内层函数是 $u = \dfrac{\pi x}{180}$，其导数为 $du/dx = \dfrac{\pi}{180}$，外层函数是 $\sin u$：

$$\begin{aligned} S'(x) &= \cos\Big(\frac{\pi x}{180}\Big)\cdot\frac{\pi}{180} \\ &= \frac{\pi}{180}\cos(x^\circ). \end{aligned}$$

在 $x = 0$ 处，斜率是每度 $\pi/180 \approx 0.017453$。如果角度以度数为单位，所有三角函数的导数都会带有这个因子。

```check
S8 = sin(pi*x/180)
steps(Derivative(S8, x), cos(pi*x/180)*pi/180)
same(diff(S8, x).subs(x, 0), pi/180); rounds(pi/180, '0.017453')
```
:::

链式法则适用于更长的链式复合：从外层开始，逐个对每个部分应用链式法则。

::: example 三节链条
对 $y = \sin^3(4x)$ 求导，意味着 $\big(\sin(4x)\big)^3$。

三个函数依次作用：$v = 4x$，然后 $u = \sin v$，然后 $y = u^3$。链式法则使用两次，将三个变化率相乘：

$$\begin{aligned} \frac{dy}{dx} &= \frac{dy}{du}\cdot\frac{du}{dv}\cdot\frac{dv}{dx} = 3u^2\cdot\cos v\cdot 4 \\ &= 12\sin^2(4x)\cos(4x). \end{aligned}$$

一行说明：先立方，将 3 带下来，留下 $\sin(4x)$ 在内；然后是正弦函数，留下 $4x$ 在内；最后是 $4x$ 本身。

```check
steps(Derivative(sin(4*x)**3, x), 3*sin(4*x)**2*cos(4*x)*4, 12*sin(4*x)**2*cos(4*x))
vv = symbols('v')
same((diff(u**3, u)*diff(sin(vv), vv)*diff(4*x, x)).subs(u, sin(vv)).subs(vv, 4*x), 12*sin(4*x)**2*cos(4*x))
```
:::

### 函数的幂与根 {#powers}

以整数幂法则（定理 5.3）作为外层导数，链式法则给出，只要 $g$ 可导，对于每个整数 $n$（若 $n \le 0$ 则为 $g(x) \ne 0$），

$$\frac{d}{dx}\big(g(x)\big)^n = n\big(g(x)\big)^{n-1}g'(x).$$

```check
for N_ in (-3, -1, 2, 5):
    same(diff(gF(x)**N_, x), N_*gF(x)**(N_ - 1)*diff(gF(x), x))
```

::: example 函数的负幂
对 $y = \dfrac{1}{(x^2 + 1)^3}$ 求导。

写出 $y = (x^2 + 1)^{-3}$。对于 $n = -3$ 和 $g(x) = x^2 + 1$，

$$y' = -3(x^2 + 1)^{-4}\cdot 2x = -\frac{6x}{(x^2 + 1)^4}.$$

商法则在约去一个因子 $(x^2 + 1)^2$ 后给出相同结果，但需要更多步骤。

```check
steps(Derivative((x**2 + 1)**(-3), x), -3*(x**2 + 1)**(-4)*2*x, -6*x/(x**2 + 1)**4)
q10 = (0*(x**2 + 1)**3 - 1*3*(x**2 + 1)**2*2*x)/((x**2 + 1)**3)**2     # the quotient rule's form
same(q10, -6*x/(x**2 + 1)**4)
```
:::

分数指数的幂法则在模块 6 中被证明，适用于每个实数指数。已知的一个分数幂是：[例 4.5](module_04_ZH.html#derivative-function) 由定义得出]

$$\frac{d}{dx}\sqrt x = \frac{1}{2\sqrt x} \qquad (x > 0),$$

哪个是 $\tfrac12 x^{-1/2}$，幂法则与 $n = \tfrac12$。 （将差商的分子和分母同时乘以 $\sqrt{x + h} + \sqrt x$，将其转化为 $\dfrac{1}{\sqrt{x + h} + \sqrt x}$，它趋近于 $\dfrac{1}{2\sqrt x}$。） 在 $x = 0$ 处没有导数： $\sqrt x$ 在 0 的左侧未定义，从右侧的差商 $\dfrac{\sqrt h - 0}{h} = \dfrac{1}{\sqrt h}$ 随着 $h \to 0^+$ 趋向于无穷大，因此图像在原点处垂直离开。

```check
xp = symbols('x', positive=True)
same((sqrt(xp + h) - sqrt(xp))/h, 1/(sqrt(xp + h) + sqrt(xp)))
limit_is(1/(sqrt(xp + h) + sqrt(xp)), h, 0, 1/(2*sqrt(xp)))
same(diff(sqrt(xp), xp), 1/(2*sqrt(xp))); same(1/(2*sqrt(xp)), Rational(1, 2)*xp**Rational(-1, 2))
hpos = symbols('h', positive=True)
same((sqrt(hpos) - 0)/hpos, 1/sqrt(hpos)); limit_is(sqrt(h)/h, h, 0, oo, '+')
```

使用链式法则，只要 $g(x) > 0$ 和 $g$ 可导，

$$\frac{d}{dx}\sqrt{g(x)} = \frac{g'(x)}{2\sqrt{g(x)}}.$$

```check
same(diff(sqrt(gF(x)), x), diff(gF(x), x)/(2*sqrt(gF(x))))
```

::: example 多项式的平方根
对 (a) $\sqrt{1 + x^2}$ 和 (b) $(x^2 + 1)^{3/2}$ 求导。

**(a)** $1 + x^2 > 0$ 对于每一个 $x$，因此对于每一个 $x$

$$\frac{d}{dx}\sqrt{1 + x^2} = \frac{2x}{2\sqrt{1 + x^2}} = \frac{x}{\sqrt{1 + x^2}}.$$

**(b)** 幂 $\tfrac32$ 尚未覆盖，但 $(x^2 + 1)^{3/2} = (x^2 + 1)\sqrt{x^2 + 1}$ 是一个乘积。 通过乘积法则和 (a)，

$$\begin{aligned} &\frac{d}{dx}(x^2 + 1)^{3/2} \\ &\quad= 2x\sqrt{x^2 + 1} + (x^2 + 1)\frac{x}{\sqrt{x^2 + 1}} \\ &\quad= 2x\sqrt{x^2 + 1} + x\sqrt{x^2 + 1} \\ &\quad= 3x\sqrt{x^2 + 1}. \end{aligned}$$

与 $n = \tfrac32$ 相关的幂法则，由模块 6 证明，结果一致： $\tfrac32(x^2 + 1)^{1/2}\cdot 2x = 3x\sqrt{x^2 + 1}$。

```check
steps(Derivative(sqrt(1 + x**2), x), 2*x/(2*sqrt(1 + x**2)), x/sqrt(1 + x**2))
same((x**2 + 1)**Rational(3, 2), (x**2 + 1)*sqrt(x**2 + 1))
steps(Derivative((x**2 + 1)*sqrt(x**2 + 1), x), 2*x*sqrt(x**2 + 1) + (x**2 + 1)*x/sqrt(x**2 + 1), 2*x*sqrt(x**2 + 1) + x*sqrt(x**2 + 1), 3*x*sqrt(x**2 + 1))
same(Rational(3, 2)*(x**2 + 1)**Rational(1, 2)*2*x, 3*x*sqrt(x**2 + 1)); same(diff((x**2 + 1)**Rational(3, 2), x), 3*x*sqrt(x**2 + 1))
```
:::

::: pitfall
三个链式法则错误。忘记内层导数：$\dfrac{d}{dx}\sin(2x)$ 是 $2\cos(2x)$，而不是 $\cos(2x)$。改变内部函数：外层导数是在内部函数不变的情况下计算的，因此 $\dfrac{d}{dx}\sin(x^2) = \cos(x^2)\cdot 2x$，而不是 $\cos x\cdot 2x$ 和 $\cos(2x)$。混淆复合函数与乘积：$\sin(x^2)$ 需要链式法则，$x\sin x$ 需要乘积法则。
:::

## 组合规则 {#strategy}

真实的公式结合了多个规则。系统化的顺序有助于控制计算过程。

::: keyidea
对一个公式求导：

1. **如果有助于理解，可以重写它。** 使用负幂表示倒数（$\dfrac{3}{x^4} = 3x^{-4}$）；约去公共因子，注意省略的点；展开一个简短的多项式乘积。
2. **找出最后的操作**：当你计算公式在某个数的值时，最后进行的操作。它决定了规则：加法，使用加法法则；乘法，使用乘积法则；除法，使用商法则；对某个非 $x$ 自身的函数应用，使用链式法则。
3. **应用该规则**，并将它留下的每个部分以相同方式求导，直到只剩下基本导数。
4. **简化**: 提取公因式，合并分数，使用诸如 $\sin^2 x + \cos^2 x = 1$ 等恒等式，并说明结果成立的条件。
5. **检查**: 在有差商的点上，图上（下方图示），或用 SymPy（第 5.7 节）。
:::

| 公式 | 最后一步 | 第一条规则 |
|---|---|---|
| $x^2\sin x$ | 将 $x^2$ 乘以 $\sin x$ | 积 |
| $\sin(x^2)$ | 对 $x^2$ 取正弦 | 链式法则 |
| $\sin^2 x$ | 将 $\sin x$ 平方 | 链式法则 |
| $\dfrac{x}{\sin x}$ | 将 $x$ 除以 $\sin x$ | 商 |
| $\sin x\cos(3x)$ | 相乘 | 先相乘，再对 $\cos(3x)$ 使用链式法则 |

```check
same(diff(sin(x)*cos(3*x), x), cos(x)*cos(3*x) + sin(x)*(-3*sin(3*x)))
same(diff(x/sin(x), x), (sin(x) - x*cos(x))/sin(x)**2)
```

::: example 幂的乘积
对 $y = x^3(2x - 1)^4$ 求导，化简，并找出切线水平的点。

最后一步是 $x^3$ 和 $(2x - 1)^4$ 的乘积。第二个因子需要使用链式法则：其导数是 $4(2x - 1)^3 \cdot 2 = 8(2x - 1)^3$。因此

$$y' = 3x^2(2x - 1)^4 + x^3 \cdot 8(2x - 1)^3.$$

两个项都包含 $x^2(2x - 1)^3$，将其提出：

$$\begin{aligned} y' &= x^2(2x - 1)^3\big[3(2x - 1) + 8x\big] \\ &= x^2(2x - 1)^3(14x - 3). \end{aligned}$$

因式分解的形式立刻显示出 $y' = 0$ 的位置：在 $x = 0$、$x = \tfrac12$ 和 $x = \tfrac{3}{14}$ 处。这三个点的切线是水平的。展开形式 $112x^6 - 192x^5 + 120x^4 - 32x^3 + 3x^2$ 则隐藏了这一点。

```check
y13 = x**3*(2*x - 1)**4
steps(Derivative((2*x - 1)**4, x), 4*(2*x - 1)**3*2, 8*(2*x - 1)**3)
steps(Derivative(y13, x), 3*x**2*(2*x - 1)**4 + x**3*8*(2*x - 1)**3, x**2*(2*x - 1)**3*(3*(2*x - 1) + 8*x), x**2*(2*x - 1)**3*(14*x - 3))
same_set(solve(x**2*(2*x - 1)**3*(14*x - 3), x), [0, Rational(1, 2), Rational(3, 14)])
same(expand(x**2*(2*x - 1)**3*(14*x - 3)), 112*x**6 - 192*x**5 + 120*x**4 - 32*x**3 + 3*x**2)
```
:::

::: example 可以化简的分数
对 $y = \dfrac{\sin x}{1 + \cos x}$ 求导，其中 $\cos x \ne -1$。

使用商数法则，然后在分子中使用毕达哥拉斯恒等式：

$$\begin{aligned} y' &= \frac{\cos x\,(1 + \cos x) - \sin x\,(-\sin x)}{(1 + \cos x)^2} \\ &= \frac{\cos x + \cos^2 x + \sin^2 x}{(1 + \cos x)^2} \\ &= \frac{1 + \cos x}{(1 + \cos x)^2} = \frac{1}{1 + \cos x}. \end{aligned}$$

```check
y14 = sin(x)/(1 + cos(x))
steps(Derivative(y14, x), (cos(x)*(1 + cos(x)) - sin(x)*(-sin(x)))/(1 + cos(x))**2, (cos(x) + cos(x)**2 + sin(x)**2)/(1 + cos(x))**2,
      (1 + cos(x))/(1 + cos(x))**2, 1/(1 + cos(x)))
```
:::

::: example 一个链式结构围绕一个商数
对 $y = \Big(\dfrac{x - 1}{x + 1}\Big)^4$ 求导，其中 $x \ne -1$。

最后一步是四次方，因此首先使用链式法则，商数作为内函数。其导数，通过商数法则，是

$$\begin{aligned} \frac{d}{dx}\frac{x - 1}{x + 1} &= \frac{1\cdot(x + 1) - (x - 1)\cdot 1}{(x + 1)^2} \\ &= \frac{2}{(x + 1)^2}, \end{aligned}$$

因此

$$\begin{aligned} y' &= 4\Big(\frac{x - 1}{x + 1}\Big)^3\cdot\frac{2}{(x + 1)^2} \\ &= \frac{8(x - 1)^3}{(x + 1)^5}. \end{aligned}$$

```check
inner15 = (x - 1)/(x + 1)
steps(Derivative(inner15, x), (1*(x + 1) - (x - 1)*1)/(x + 1)**2, 2/(x + 1)**2)
steps(Derivative(inner15**4, x), 4*inner15**3*2/(x + 1)**2, 8*(x - 1)**3/(x + 1)**5)
```
:::

图形计算器同时绘制函数及其导数。它使用中心差分法（模块 4）计算 $f'$ 的数值，因此可以验证你手动推导的公式。

::: widget name=derivative-grapher
顶部的图显示 $y = f(x)$ 及其在 $x = a$ 处的切线；底部的图显示 $y = f'(x)$，是数值计算的结果，包含点 $(a, f'(a))$。使用滑块移动 $a$，或点击任一图。从 $x^3 - 3x$ 开始：找到读数显示图是平坦的两个点，并观察下图在这些点处穿过零点。然后选择 $x\sin x$ 并在移动 $a$ 到 0 之前，使用乘积法则预测 $f'(0)$。最后输入例 5.13 中的 `sin(x)/(1 + cos(x))`：其导数 $\dfrac{1}{1 + \cos x}$ 是正的，因此读数应在函数定义域内显示上升。
:::

```check
same(diff(x**3 - 3*x, x), 3*x**2 - 3); same_set(solve(3*x**2 - 3, x), [-1, 1])
same(diff(x*sin(x), x).subs(x, 0), 0)
same(diff(sin(x)/(1 + cos(x)), x), 1/(1 + cos(x)))
for v_ in (-3, -2, -1, 0, 1, 2, 3):
    holds(1/(1 + cos(v_)) > 0)
same(function_range(1 + cos(x), x, S.Reals), Interval(0, 2))      # so 1/(1 + cos x) > 0 wherever cos x != -1
```

::: pitfall
在求导前简化函数，当这样做成本较低时，但要注意简化所依赖的假设。对于 $x \ne 1$， $\dfrac{x^2 - 1}{x - 1} = x + 1$，因此其导数在每个 $x \ne 1$ 处为 1；在 $x = 1$ 处函数未定义，因此那里没有导数。未简化的答案并不错误，只是更难使用：例 5.12 需要因式分解形式来找出切线水平的位置。
:::

```check
same(cancel((x**2 - 1)/(x - 1)), x + 1); same(diff((x**2 - 1)/(x - 1), x), 1)
holds(((x**2 - 1)/(x - 1)).subs(x, 1) is S.NaN)
```

## 使用 SymPy 计算导数 {#sympy}

SymPy 的 `diff` (模块 4) 知道本模块中的所有规则。`sp.diff(expr, x)` 对 `expr` 关于 `x` 求导；`sp.factor` 和 `sp.simplify` (模块 1) 整理结果。

::: compute 用 SymPy 求导
```python
import sympy as sp
x = sp.symbols('x')
y = x**3*(2*x - 1)**4            # Example 5.12
dy = sp.diff(y, x)
print(dy)
print(sp.factor(dy))
print(sp.expand(dy))
```

```output
8*x**3*(2*x - 1)**3 + 3*x**2*(2*x - 1)**4
x**2*(2*x - 1)**3*(14*x - 3)
112*x**6 - 192*x**5 + 120*x**4 - 32*x**3 + 3*x**2
```

第一行是乘积法则应用后的结果，尚未进行任何化简，各项按照 SymPy 的顺序排列；`factor` 给出例 5.12 的形式，`expand` 是展开形式，虽然正确但无助于找出 $y' = 0$。SymPy 也会对它不认识的函数应用求导法则：

```python
f, g = sp.Function('f'), sp.Function('g')
print(sp.diff(f(x)*g(x), x))
print(sp.diff(f(g(x)), x))
print(sp.diff(sp.tan(x), x))
```

```output
f(x)*Derivative(g(x), x) + g(x)*Derivative(f(x), x)
Derivative(f(g(x)), g(x))*Derivative(g(x), x)
tan(x)**2 + 1
```

第一行是乘积法则，第二行是链式法则：`Derivative(f(g(x)), g(x))` 表示 $f'$ 在 $g(x)$ 处的值。第三行是 $\sec^2 x$ 的变形：将 $\sin^2 x + \cos^2 x = 1$ 除以 $\cos^2 x$ 得到 $\tan^2 x + 1 = \sec^2 x$。

SymPy 只能对 SymPy 表达式求导。Python 的 `math.sin` 接受数值，所以传入符号时会报错：

```python fails
import math
print(sp.diff(math.sin(x), x))
```

```output
TypeError: Cannot convert expression to float
```

在你希望求导的公式中使用 `sp.sin`、`sp.cos`、`sp.sqrt` 和其他 SymPy 函数。
:::

```check
same(tan(x)**2 + 1, sec(x)**2)
```

### 为什么答案看起来不同 {#different-looks}

SymPy 机械地应用规则，仅进行少量整理。其答案与你的答案可能在项的顺序、分组方式、所用恒等式（$\tan^2 x + 1$ 对应 $\sec^2 x$，或 $\cos^2 x - \sin^2 x$ 对应 $\cos 2x$，即带有 $y = x$ 的加法公式）上存在差异，也可能源于一方进行了简化而另一方未进行。两个表达式 $A$ 和 $B$ 相等当且仅当 $A - B = 0$，因此要比较两个答案，需简化它们的差。

::: compute 我的答案对吗？
```python
import sympy as sp
x = sp.symbols('x')
theirs = sp.diff(sp.sin(x)/(1 + sp.cos(x)), x)     # Example 5.13
mine = 1/(1 + sp.cos(x))
print(theirs)
print(sp.simplify(theirs - mine))
```

```output
cos(x)/(cos(x) + 1) + sin(x)**2/(cos(x) + 1)**2
0
```

两式之差化简为 0，所以答案一致。如果写错了，差就可能非零。假设求 $\sin(x^2)$ 的导数时忘了乘内层导数，写成 $\cos(x^2)$：

```python
wrong = sp.cos(x**2)
gap = sp.simplify(sp.diff(sp.sin(x**2), x) - wrong)
print(gap)
print([round(float(gap.subs(x, v)), 4) for v in (0.5, 1, 2)])
```

```output
(2*x - 1)*cos(x**2)
[0.0, 0.5403, -1.9609]
```

最后一行在三个数处计算差值。在 $x = 0.5$ 处，错误的答案恰好正确，因为在 $2x - 1 = 0$ 处；在 1 和 2 处则不正确，只要有一个非零值就足以证明两个表达式不同。
:::

```check
same(diff(sin(x)/(1 + cos(x)), x) - 1/(1 + cos(x)), 0)
same(simplify(diff(sin(x**2), x) - cos(x**2)), (2*x - 1)*cos(x**2))
same(((2*x - 1)*cos(x**2)).subs(x, Rational(1, 2)), 0); rounds(cos(1), '0.5403'); rounds(3*cos(4), '-1.9609')
```

::: keyidea
为检查两个答案 $A$ 和 $B$ 是否相等，化简 $A - B$。如果得到 0，则它们在定义域内处处相等。如果不为 0，则在几个数值上评估 $A - B$：一个非零值可证明它们不同。 `simplify` 并不找到所有化简方式，因此一个不化简为 0 的差异本身并不能证明答案不同；一个非零值则可以证明。
:::

::: pitfall
一个差值在一点或两点为 0 并不能证明什么： $(2x - 1)\cos(x^2)$ 在 $x = 0.5$ 处为 0。应测试多个点，而不仅仅是整数，或进行化简。
:::

## 自动微分 {#autodiff}

训练神经网络、将模型拟合到数据、控制机械臂：每种情况都需要函数的导数，而这些函数往往只以程序形式存在，通常包含循环和分支的较长程序。如何让一个程序对另一个程序求导？有三种方法。

- **有限差分** (模块 4): 在 $a$ 和 $a + h$ 处运行程序，并计算 $\dfrac{f(a + h) - f(a)}{h}$。这只需要程序本身，但这是一个近似：一个较大的 $h$ 会产生截断误差，一个较小的则会产生舍入误差，最佳折中方案只保留浮点数大约一半的有效数字，即 16 位中的约 8 位。
- **符号微分**，如在 SymPy 中：将程序转换为公式，并应用本模块的规则。结果是精确的，但公式可能会变得非常庞大，且循环和分支必须首先转换为公式。
- **自动微分**：在携带导数值的数值上运行程序，每一步都根据本模块的规则更新导数。不存在步 $h$，因此没有截断误差：结果仅受浮点数舍入误差影响，这种误差也会影响 $f$ 本身的值，且每一步需要额外几次运算。

最简单的方式是使用双数来携带导数。

::: definition 双数
**双数** 是一个表达式 $a + b\varepsilon$，其中 $a$ 和 $b$ 是实数，而 $\varepsilon$（希腊字母 epsilon）是一个新符号，具有 $\varepsilon^2 = 0$。双数像 $\varepsilon$ 的多项式一样进行加法和乘法运算，其中 $\varepsilon^2$ 被替换为 0：

$$\begin{aligned} &(a + b\varepsilon) + (c + d\varepsilon) \\ &\quad= (a + c) + (b + d)\varepsilon, \\ &(a + b\varepsilon)(c + d\varepsilon) \\ &\quad= ac + (ad + bc)\varepsilon. \end{aligned}$$

一个实数 $c$ 是双数 $c + 0\varepsilon$；$b$ 是 **$\varepsilon$-部分 ** 的 $a + b\varepsilon$。
:::

除了 0 以外，没有实数的平方为 0，因此 $\varepsilon$ 不是一个实数：它是一个具有一个规则的符号。（关于自动微分的书籍使用字母 $\varepsilon$ 表示它；它与 模块 2 的极限中的 $\varepsilon$ 或 模块 4 的机器 epsilon 无关。）看一下乘积。它的 $\varepsilon$ 部分 $ad + bc$ 是乘积法则：如果 $a$ 和 $c$ 是两个函数的值，而 $b$ 和 $d$ 是它们的导数，则乘积的值为 $ac$，导数为 $ad + bc$。这就是整个技巧。

```check
ep = symbols('epsilon')
same(expand((a + b*ep)*(c + ep*symbols('d'))).subs(ep**2, 0), a*c + (a*symbols('d') + b*c)*ep)
```

::: theorem 双数携带导数
若 $p$ 是一个多项式，则对于所有实数 $a$ 和 $b$，

$$p(a + b\varepsilon) = p(a) + p'(a)\,b\,\varepsilon.$$

特别地，函数 $p(a + \varepsilon)$ 的 $\varepsilon$ 部分是导数 $p'(a)$。
:::

::: proof
多项式是由常数和 $x$ 通过加法和乘法构造而成的。称一个函数 $q$ 为“好函数”，如果 $q(a + b\varepsilon) = q(a) + q'(a)\,b\,\varepsilon$ 对所有 $a$ 和 $b$ 成立。一个常数 $c$ 是好函数，因为 $c = c + 0\varepsilon$ 和 $c' = 0$；所以 $x$ 也是好函数，因为 $x' = 1$。若 $q$ 和 $r$ 是好函数，则 $q + r$ 也是好函数，根据和法则；同样， $qr$ 也是好函数：

$$\begin{aligned} &q(a + b\varepsilon)\,r(a + b\varepsilon) \\ &\quad= \big(q(a) + q'(a)b\varepsilon\big) \\ &\qquad \cdot \big(r(a) + r'(a)b\varepsilon\big) \\ &\quad= q(a)r(a) \\ &\qquad + \big(q'(a)r(a) + q(a)r'(a)\big)b\varepsilon, \end{aligned}$$

由乘积法则，这正好是 $(qr)(a) + (qr)'(a)\,b\,\varepsilon$。构造 $p$ 的每一步都保持这个性质，所以 $p$ 也具有这个性质。
:::

```check
q0, q1, r0, r1 = symbols('q0 q1 r0 r1')
same(expand((q0 + q1*b*ep)*(r0 + r1*b*ep)).subs(ep**2, 0), q0*r0 + (q1*r0 + q0*r1)*b*ep)
same(expand((3 + ep)**2).subs(ep**2, 0), 9 + 6*ep); same((x**2).subs(x, 3), 9); same(diff(x**2, x).subs(x, 3), 6)
```

例如， $(3 + \varepsilon)^2 = 9 + 6\varepsilon + \varepsilon^2 = 9 + 6\varepsilon$，且 $x^2$ 在 $x = 3$ 处的值为 9，导数为 6。

其他函数通过声明自己的导数来参与。对于正弦函数，定义 $\sin(a + b\varepsilon) = \sin a + (\cos a)\,b\,\varepsilon$。然后对于一个好函数 $g$，

$$\begin{aligned} &\sin\big(g(a + b\varepsilon)\big) \\ &\quad= \sin\big(g(a) + g'(a)\,b\,\varepsilon\big) \\ &\quad= \sin g(a) + \cos g(a)\,g'(a)\,b\,\varepsilon, \end{aligned}$$

其 $\varepsilon$ 部分是链式法则的 $(\sin g)'(a)$ 乘以 $b$。程序中的每个操作只知道自己的导数；链式法则在程序运行过程中逐步应用，其余工作由其完成。

```check
same(diff(sin(gF(x)), x), cos(gF(x))*diff(gF(x), x))
```

::: compute Python 中的双数
一个包含两个数的类，分别是值 `a` 和 $\varepsilon$-部分 `b`，并遵循定义 5.1 中的 `+` 和 `*` 的规则：

```python
class Dual:
    """A dual number a + b·ε, where ε² = 0."""
    def __init__(self, a, b=0.0):
        self.a, self.b = a, b              # the value and the ε-part
    def __add__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a + other.a, self.b + other.b)
    def __mul__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a*other.a, self.a*other.b + self.b*other.a)
    __radd__ = __add__                     # 1 + d and 3*d: number first
    __rmul__ = __mul__
```

Python 将 `__add__` 称为 `+`，将 `__mul__` 称为 `*`，因此任何使用 `+` 和 `*` 编写的函数现在都可以在双数上运行。取 $f(x) = x^3 - 2x + 1$ 在 $x = 1.5$ 处，并在 $1.5 + 1\varepsilon$ 上运行：

```python
def f(x):
    return x*x*x + (-2)*x + 1          # x³ − 2x + 1, with + and * only

y = f(Dual(1.5, 1.0))
print(y.a, y.b)                        # f(1.5) and f'(1.5)
```

```output
1.375 4.75
```

这些就是 $f(1.5) = 1.375$ 和 $f'(1.5) = 3(1.5)^2 - 2 = 4.75$，完全相同。同样的函数在普通数上运行时给出前向差分：

```python
for h in [1e-1, 1e-4, 1e-8, 1e-12]:
    print(f"h = {h:g}: {(f(1.5 + h) - f(1.5))/h}")
```

```output
h = 0.1: 5.210000000000008
h = 0.0001: 4.750450010000407
h = 1e-08: 4.749999993336473
h = 1e-12: 4.75042227776612
```

使用 $h = 0.1$ 时，截断误差约为 0.46。使用 $h = 10^{-8}$，即最佳步长时，误差约为 $7 \times 10^{-9}$；在 $h = 10^{-12}$ 处舍入误差占据主导，误差再次增长，约为 $4 \times 10^{-4}$。SymPy，给定公式，可以精确求导：

```python
import sympy as sp
x = sp.symbols('x')
fp = sp.diff(x**3 - 2*x + 1, x)
print(fp, '|', fp.subs(x, 1.5))
```

```output
3*x**2 - 2 | 4.75000000000000
```

给正弦函数加上它的导数规则；然后链式法则就自动适用。这是 $\sin(x^2)$ 在 1 处的导数，即 $2\cos 1$：

```python
import math
def sin(d):                            # sin(a + bε) = sin a + (cos a)·b ε
    return Dual(math.sin(d.a), math.cos(d.a)*d.b)

t = Dual(1.0, 1.0)
print(sin(t*t).b, 2*math.cos(1.0))
```

```output
1.0806046117362795 1.0806046117362795
```

自动微分同样适用于循环结构，而公式本身并不包含循环。这个函数三次平方并相加：

```python
def g(x):
    y = x
    for _ in range(3):                 # three times: y becomes y² + x
        y = y*y + x
    return y

print(g(Dual(0.5, 1.0)).b)
print(sp.diff(g(x), x).subs(x, sp.Rational(1, 2)))
```

```output
9.5
19/2
```

程序 `g` 计算出一个次数为 8 的多项式 $\big((x^2 + x)^2 + x\big)^2 + x$，并利用双数在 0.5 处找到了导数，而无需任何人写出那个公式。SymPy 也同意：运行在符号 `x` 上的同一程序构建了公式，然后 `sp.diff` 对其进行微分。
:::

```check
fd = lambda X: X**3 - 2*X + 1
same(fd(Rational(3, 2)), Rational(11, 8)); same(diff(fd(x), x).subs(x, Rational(3, 2)), Rational(19, 4))
same((fd(Rational(16, 10)) - fd(Rational(15, 10)))/Rational(1, 10), Rational(521, 100)); rounds(Rational(521, 100) - Rational(19, 4), '0.46')
ff_ = lambda X: X*X*X + (-2)*X + 1                       # the box's f, in floating point
rounds(abs((ff_(1.5 + 1e-8) - ff_(1.5))/1e-8 - 4.75), '7e-9'); rounds(abs((ff_(1.5 + 1e-12) - ff_(1.5))/1e-12 - 4.75), '4e-4')
gd = x
for _ in range(3):
    gd = gd*gd + x
same(gd, ((x**2 + x)**2 + x)**2 + x); same(degree(expand(gd), x), 8); same(diff(gd, x).subs(x, Rational(1, 2)), Rational(19, 2))
same(diff(sin(x**2), x).subs(x, 1), 2*cos(1))
```

图 5.4 比较了这些方法在整个步长范围 $h$ 上的表现。

::: figure id=fig-05-4
每种方法在 $f(x) = x^3 - 2x + 1$ 处能正确计算出 $f'(1.5) = 4.75$ 的多少位有效数字。前向差分（蓝色）最多只有约 9 位，中心差分（绿色）约 11 位：缩小 $h$ 有助于提升精度，直到舍入误差占据主导。双数（橙色）则精确地给出 4.75。
:::

```check
import math as _m
fl = lambda X: X*X*X - 2*X + 1
dig = lambda A: -_m.log10(abs(A - 4.75)/4.75) if A != 4.75 else 16
hs_ = [10.0**(-q/4) for q in range(2, 63)]
best_f = max(dig((fl(1.5 + H) - fl(1.5))/H) for H in hs_); best_c = max(dig((fl(1.5 + H) - fl(1.5 - H))/(2*H)) for H in hs_)
holds(8.5 < best_f < 9.5); holds(10.5 < best_c < 11.5)
```

### 前向与后向 {#backprop}

双数将导数向前传递，从输入经过程序的每一步直到输出：这就是 **前向模式**自动微分。一次运行可以得到一个输入的导数。然而，一个神经网络有数百万个参数，需要使训练数据上的误差变得很小，训练过程需要该误差对每个参数的导数。对每个参数进行一次前向运行将会非常缓慢。**反向传播** 应用了同样的链式法则，但方向相反：它记录一次运行的步骤，然后从输出向输入回溯，乘以各步骤的导数，并在一次反向传递中找到所有导数。反向传播是为多个输入组织的链式法则；模块 17 展示了它是如何工作的。

::: pitfall
自动微分对程序执行的步骤进行微分，而不是程序员心中所想的函数。一个在 $x = 1$ 时返回 1，否则返回 $x \cdot x$ 的程序，对每个 $x^2$ 计算 $x$，但在 $x = 1$ 处取常数分支，因此它在该点报告导数为 0 而不是 2。
:::

## 你所学到的内容 {#summary}

- **乘积法则** $(fg)' = f'g + fg'$ 以及 **商的法则** $\Big(\dfrac{f}{g}\Big)' = \dfrac{f'g - fg'}{g^2}$（其中 $g \ne 0$）；一个增长的矩形解释了第一个。乘积的导数不是导数的乘积。
- 幂法则 $\dfrac{d}{dx}x^n = nx^{n-1}$ 对于每一个整数 $n$（$x \ne 0$ 当 $n \le 0$ 时），以及 $\dfrac{d}{dx}\sqrt x = \dfrac{1}{2\sqrt x}$ 对于 $x > 0$。
- 以弧度为单位， $(\sin x)' = \cos x$ 和 $(\cos x)' = -\sin x$，来自加法公式和模块 2 的极限；然后 $(\tan x)' = \sec^2 x$， $(\sec x)' = \sec x\tan x$， $(\cot x)' = -\csc^2 x$ 和 $(\csc x)' = -\csc x\cot x$。
- 链式法则 ** ** $\big(f(g(x))\big)' = f'\big(g(x)\big)\,g'(x)$，或 $\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}$：速率相乘，如同齿轮比和单位换算。更长的链式相乘更多速率，从外向内。
- 为结合规则，找到最后的操作，应用其规则，对各个部分重复此过程，然后简化（因式分解）并检查。
- `sp.diff` 求导；SymPy 的答案可能与你的不同，因此通过简化它们的差值进行比较，并在多个点上评估，如果差值不简化为 0。
- 程序通过 **自动微分** 区分程序：带有 $a + b\varepsilon$ 的双精度数 $\varepsilon^2 = 0$ 能够精确地（除舍入误差外）跟踪每个值的导数，这不同于有限差分。反向传播是链式法则的逆向应用（模块 17）。

## 练习 {#exercises}

:::: exercise 乘积、商和幂 {#ex-5-1} ★
求导：

- (a) $y = (3x^2 - 1)(x^3 + 2x)$，使用乘积法则；然后通过展开来验证。
- (b) $y = \dfrac{2x + 1}{x - 3}$，用于 $x \ne 3$。
- (c) $y = \dfrac{5}{x^3} - \dfrac{1}{x}$，用于 $x \ne 0$。
- (d) $y = \dfrac{x^2}{x^2 + 4}$.

::: solution
**(a)** 使用 $f = 3x^2 - 1$ 和 $g = x^3 + 2x$，以及 $f' = 6x$ 和 $g' = 3x^2 + 2$：

$$\begin{aligned} y' &= 6x(x^3 + 2x) \\ &\quad + (3x^2 - 1)(3x^2 + 2) \\ &= (6x^4 + 12x^2) \\ &\quad + (9x^4 + 3x^2 - 2) \\ &= 15x^4 + 15x^2 - 2. \end{aligned}$$

展开后：$y = 3x^5 + 6x^3 - x^3 - 2x = 3x^5 + 5x^3 - 2x$，以及 $y' = 15x^4 + 15x^2 - 2$ 再次。

**(b)** 使用商法则，以及 $(2x + 1)' = 2$ 和 $(x - 3)' = 1$：

$$\begin{aligned} y' &= \frac{2(x - 3) - (2x + 1)\cdot 1}{(x - 3)^2} \\ &= \frac{2x - 6 - 2x - 1}{(x - 3)^2} \\ &= -\frac{7}{(x - 3)^2}. \end{aligned}$$

对于每一个 $x \ne 3$，它都是负数：每一条切线都是向下倾斜的，且图像在 $x = 3$ 的两侧下降（模块 8 证明了在一个区间内导数为负意味着图像下降）。

**(c)** 用负幂重写并使用幂法则：$y = 5x^{-3} - x^{-1}$，因此

$$\begin{aligned} y' &= -15x^{-4} + x^{-2} \\ &= -\frac{15}{x^4} + \frac{1}{x^2}. \end{aligned}$$

**(d)** 商的法则: $y' = \dfrac{2x(x^2 + 4) - x^2\cdot 2x}{(x^2 + 4)^2} = \dfrac{8x}{(x^2 + 4)^2}$.

```check
ya = (3*x**2 - 1)*(x**3 + 2*x)
steps(Derivative(ya, x), 6*x*(x**3 + 2*x) + (3*x**2 - 1)*(3*x**2 + 2), (6*x**4 + 12*x**2) + (9*x**4 + 3*x**2 - 2), 15*x**4 + 15*x**2 - 2)
same(expand((3*x**2 - 1)*(3*x**2 + 2)), 9*x**4 + 3*x**2 - 2)
same(expand(ya), 3*x**5 + 5*x**3 - 2*x); same(diff(3*x**5 + 5*x**3 - 2*x, x), 15*x**4 + 15*x**2 - 2)
steps(Derivative((2*x + 1)/(x - 3), x), (2*(x - 3) - (2*x + 1)*1)/(x - 3)**2, (2*x - 6 - 2*x - 1)/(x - 3)**2, -7/(x - 3)**2)
steps(Derivative(5/x**3 - 1/x, x), Derivative(5*x**(-3) - x**(-1), x), -15*x**(-4) + x**(-2), -15/x**4 + 1/x**2)
steps(Derivative(x**2/(x**2 + 4), x), (2*x*(x**2 + 4) - x**2*2*x)/(x**2 + 4)**2, 8*x/(x**2 + 4)**2)
```
:::
::::

:::: exercise 三角函数的导数 {#ex-5-2} ★
求导：

- (a) $x^3\cos x$
- (b) $\tan x - x$, 其中 $\cos x \ne 0$
- (c) $\dfrac{\sin x}{1 - \sin x}$, 其中 $\sin x \ne 1$

并且 (d) 求 $y = \sec x$ 在 $x = \pi/4$ 处的斜率。

::: solution
**(a)** 乘积法则： $3x^2\cos x + x^3(-\sin x) = 3x^2\cos x - x^3\sin x$。

**(b)** $\sec^2 x - 1$. 将 $\sin^2 x + \cos^2 x = 1$ 除以 $\cos^2 x$ 得到 $\tan^2 x + 1 = \sec^2 x$，因此这是 $\tan^2 x$。

**(c)** 商的法则，其中 $(1 - \sin x)' = -\cos x$。其分子是上函数的导数乘以下函数减去上函数乘以下函数的导数，即

$$\begin{aligned} &\cos x\,(1 - \sin x) \\ &\qquad - \sin x\,(-\cos x) \\ &\quad= \cos x - \sin x\cos x \\ &\qquad + \sin x\cos x \\ &\quad= \cos x, \end{aligned}$$

因此

$$\frac{d}{dx}\frac{\sin x}{1 - \sin x} = \frac{\cos x}{(1 - \sin x)^2}.$$

**(d)** $\dfrac{d}{dx}\sec x = \sec x\tan x$，并且在 $\pi/4$ 处， $\sec\dfrac{\pi}{4} = \dfrac{1}{\cos(\pi/4)} = \sqrt2$ 和 $\tan\dfrac{\pi}{4} = 1$。斜率是 $\sqrt2 \approx 1.414$。

```check
same(diff(x**3*cos(x), x), 3*x**2*cos(x) - x**3*sin(x))
same(diff(tan(x) - x, x), sec(x)**2 - 1); same(sec(x)**2 - 1, tan(x)**2)
steps(cos(x)*(1 - sin(x)) - sin(x)*(-cos(x)), cos(x) - sin(x)*cos(x) + sin(x)*cos(x), cos(x))    # the numerator
steps(Derivative(sin(x)/(1 - sin(x)), x), (cos(x)*(1 - sin(x)) - sin(x)*(-cos(x)))/(1 - sin(x))**2, cos(x)/(1 - sin(x))**2)
same(sec(pi/4), sqrt(2)); same(tan(pi/4), 1); same(diff(sec(x), x).subs(x, pi/4), sqrt(2)); rounds(sqrt(2), '1.414')
```
:::
::::

:::: exercise 链式法则 {#ex-5-3} ★
求导：

- (a) $(1 - 4x)^6$
- (b) $\cos(x^3)$
- (c) $\cos^3 x$
- (d) $\dfrac{1}{(x^2 + 9)^2}$
- (e) $\sqrt{4 - x^2}$，对于 $-2 < x < 2$

::: solution
在每一部分中，命名内函数 $u$，并将外函数的导数乘以 $du/dx$。

**(a)** $u = 1 - 4x$，外函数 $u^6$: $6(1 - 4x)^5\cdot(-4) = -24(1 - 4x)^5$.

**(b)** $u = x^3$，外函数 $\cos u$: $-\sin(x^3)\cdot 3x^2 = -3x^2\sin(x^3)$.

**(c)** 内层为 $u = \cos x$，外层为 $u^3$，结果为 $3\cos^2 x\cdot(-\sin x) = -3\cos^2 x\sin x$。

**(d)** 内层为 $u = x^2 + 9$，外层为 $u^{-2}$，结果为 $-2(x^2 + 9)^{-3}\cdot 2x = -\dfrac{4x}{(x^2 + 9)^3}$。

**(e)** $u = 4 - x^2$, 哪个在 $-2 < x < 2$ 上为正；外 $\sqrt u$: $\dfrac{-2x}{2\sqrt{4 - x^2}} = -\dfrac{x}{\sqrt{4 - x^2}}$。这是 [例 1.2](module_01_ZH.html#domains): 顶部为 0，$x = 0$，向右为负，且当 $x$ 趋近于 $\pm 2$ 时，大小趋于无限，此时半圆垂直地与 $x$ 轴相交。

```check
steps(Derivative((1 - 4*x)**6, x), 6*(1 - 4*x)**5*(-4), -24*(1 - 4*x)**5)
steps(Derivative(cos(x**3), x), -sin(x**3)*3*x**2, -3*x**2*sin(x**3))
steps(Derivative(cos(x)**3, x), 3*cos(x)**2*(-sin(x)), -3*cos(x)**2*sin(x))
steps(Derivative((x**2 + 9)**(-2), x), -2*(x**2 + 9)**(-3)*2*x, -4*x/(x**2 + 9)**3)
steps(Derivative(sqrt(4 - x**2), x), -2*x/(2*sqrt(4 - x**2)), -x/sqrt(4 - x**2))
same((-x/sqrt(4 - x**2)).subs(x, 0), 0); limit_is(-x/sqrt(4 - x**2), x, 2, -oo, '-'); limit_is(-x/sqrt(4 - x**2), x, -2, oo, '+')
```
:::
::::

:::: exercise 速率相乘 {#ex-5-4} ★
- (a) 一辆自行车的踏板转动前链轮，该链轮有 44 个齿；链条驱动后链轮，该链轮有 11 个齿，固定在后轮上，其周长为 2.1 米。你以每秒一圈的速度踩踏。自行车的速度是多少？以米每秒和公里每小时表示。
- (b) 假设 $g(2) = 5$, $g'(2) = 3$, $f'(2) = 7$ 和 $f'(5) = -2$。求 $f\big(g(x)\big)$ 在 $x = 2$ 处的导数。

::: solution
**(a)** 三个速率相乘。设 $p$ 和 $w$ 分别为踏板和车轮转动的圈数，$s$ 为行驶的距离，单位为米。每转一圈踏板，带动 44 链节，使后飞轮转动，进而使车轮转动 $44/11 = 4$ 次：$dw/dp = 4$。每转一圈车轮，自行车前进 2.1 米：$ds/dw = 2.1$。并且 $dp/dt = 1$ 转每秒。所以

$$\begin{aligned} \frac{ds}{dt} &= \frac{ds}{dw}\cdot\frac{dw}{dp}\cdot\frac{dp}{dt} \\ &= 2.1 \cdot 4 \cdot 1 = 8.4 \text{ m/s}. \end{aligned}$$

换算为公里每小时， $8.4 \cdot 3600/1000 = 30.24$：约 30 公里/小时。

**(b)** 根据链式法则， $(f \circ g)'(2) = f'\big(g(2)\big)\,g'(2) = f'(5)\cdot 3 = -2\cdot 3 = -6$。值 $f'(2) = 7$ 是一个陷阱：外层导数是在 $g(2) = 5$ 处计算，而不是在 2 处计算。错误答案 $f'(2)\,g'(2) = 21$ 是掉入这个陷阱得到的。

```check
same(Rational(44, 11), 4); same(Rational(21, 10)*4*1, Rational(84, 10)); same(Rational(84, 10)*3600/1000, Rational(3024, 100))
rounds(Rational(3024, 100), '30')
fv = {2: 7, 5: -2}
same(fv[5]*3, -6); same(fv[2]*3, 21)
```
:::
::::

:::: exercise 水平切线和一条切线 {#ex-5-5} ★★
设 $y = \sin x + \cos x$。

- (a) 找出图中 $0 \le x \le 2\pi$ 处的切线为水平的点。
- (b) 求 $x = \pi/2$ 处的切线方程。

::: solution
**(a)** $y' = \cos x - \sin x$. 切线水平出现在 $\cos x = \sin x$。在这样的 $x$ 点， $\cos x \ne 0$（如果 $\cos x = 0$，则 $\sin x = \pm 1$，它不等于它），因此你可以除以 $\cos x$： $\tan x = 1$。在 $[0, 2\pi]$ 中，这种情况发生在 $x = \pi/4$ 和 $x = 5\pi/4$ 处。

$$\begin{aligned} y\Big(\frac{\pi}{4}\Big) &= \frac{\sqrt2}{2} + \frac{\sqrt2}{2} = \sqrt2, \\ y\Big(\frac{5\pi}{4}\Big) &= -\frac{\sqrt2}{2} - \frac{\sqrt2}{2} = -\sqrt2. \end{aligned}$$

这些点是 $\big(\pi/4, \sqrt2\big)$ 和 $\big(5\pi/4, -\sqrt2\big)$。它们是图像的最高点和最低点。平方后， $y^2 = \sin^2 x + 2\sin x\cos x + \cos^2 x = 1 + 2\sin x\cos x$，和 $2\sin x\cos x \le \sin^2 x + \cos^2 x = 1$ 因为 $(\sin x - \cos x)^2 \ge 0$。因此 $y^2 \le 2$，即 $-\sqrt2 \le y \le \sqrt2$，这两个点达到这些极值。

**(b)** 在 $x = \pi/2$， $y = 1 + 0 = 1$ 和 $y' = 0 - 1 = -1$。通过 $(\pi/2, 1)$ 点，斜率为 $-1$ 的切线是 $y - 1 = -(x - \pi/2)$，即，

$$y = -x + 1 + \frac{\pi}{2}.$$

```check
y5 = sin(x) + cos(x)
same(diff(y5, x), cos(x) - sin(x))
same_set(solveset(cos(x) - sin(x), x, Interval(0, 2*pi)), [pi/4, 5*pi/4])
same(y5.subs(x, pi/4), sqrt(2)); same(y5.subs(x, 5*pi/4), -sqrt(2))
same(expand(y5**2), 1 + 2*sin(x)*cos(x)); same(expand((sin(x) - cos(x))**2), 1 - 2*sin(x)*cos(x))
same(y5.subs(x, pi/2), 1); same(diff(y5, x).subs(x, pi/2), -1)
same(solve(Eq(y - 1, -(x - pi/2)), y), [-x + 1 + pi/2])
```
:::
::::

:::: exercise 组合规则 {#ex-5-6} ★★
求导并化简：

- (a) $x^2(1 - 3x)^5$
- (b) $\sqrt{x^2 + 4x}$，对于 $x > 0$
- (c) $\sec(x^2)$, 其中 $\cos(x^2) \ne 0$
- (d) $\dfrac{x}{\sqrt{x^2 + 1}}$

::: solution
**(a)** 应用乘积法则，其中第二个因子用链式法则求导，导数为 $5(1 - 3x)^4(-3) = -15(1 - 3x)^4$。结果的两项都含有 $x(1 - 3x)^4$，提取这个因子后剩下 $2(1 - 3x) - 15x = 2 - 21x$，所以

$$\begin{aligned} y' &= 2x(1 - 3x)^5 \\ &\quad - 15x^2(1 - 3x)^4 \\ &= x(1 - 3x)^4(2 - 21x). \end{aligned}$$

**(b)** 对于 $x > 0$, $x^2 + 4x > 0$, 以及平方根的链式法则给出

$$\frac{2x + 4}{2\sqrt{x^2 + 4x}} = \frac{x + 2}{\sqrt{x^2 + 4x}}.$$

**(c)** 外层 $\sec u$, 内层 $u = x^2$: $\sec(x^2)\tan(x^2)\cdot 2x = 2x\sec(x^2)\tan(x^2)$.

**(d)** 商的法则，其中 $\big(\sqrt{x^2 + 1}\big)' = \dfrac{x}{\sqrt{x^2 + 1}}$ (例 5.11)。然后将分子和分母都乘以 $\sqrt{x^2 + 1}$:

$$\begin{aligned} y' &= \frac{\sqrt{x^2 + 1} - x\cdot\dfrac{x}{\sqrt{x^2 + 1}}}{x^2 + 1} \\ &= \frac{(x^2 + 1) - x^2}{(x^2 + 1)\sqrt{x^2 + 1}} \\ &= \frac{1}{(x^2 + 1)^{3/2}}. \end{aligned}$$

```check
y6a = x**2*(1 - 3*x)**5
steps(Derivative(y6a, x), 2*x*(1 - 3*x)**5 - 15*x**2*(1 - 3*x)**4, x*(1 - 3*x)**4*(2*(1 - 3*x) - 15*x), x*(1 - 3*x)**4*(2 - 21*x))
same(expand(2*(1 - 3*x) - 15*x), 2 - 21*x)
same(diff((1 - 3*x)**5, x), -15*(1 - 3*x)**4)
steps(Derivative(sqrt(x**2 + 4*x), x), (2*x + 4)/(2*sqrt(x**2 + 4*x)), (x + 2)/sqrt(x**2 + 4*x))
same(diff(sec(x**2), x), 2*x*sec(x**2)*tan(x**2))
steps(Derivative(x/sqrt(x**2 + 1), x), (sqrt(x**2 + 1) - x*x/sqrt(x**2 + 1))/(x**2 + 1), ((x**2 + 1) - x**2)/((x**2 + 1)*sqrt(x**2 + 1)), 1/(x**2 + 1)**Rational(3, 2))
```
:::
::::

:::: exercise 一个弹簧在两倍频率下振动 {#ex-5-7} ★★
一个质量在更硬的弹簧上振动，经过 $t$ 秒后高度为 $s(t) = 3\cos(2t) + 4\sin(2t)$ 厘米。

- (a) 求其速度 $v(t)$ 和加速度 $a(t)$。
- (b) 证明 $a = -4s$ 在每一时刻成立，并解释 4 的来源。
- (c) 求 $t = 0$ 和 $t = \pi/4$ 时的位置和速度。

::: solution
**(a)** 每一项都需要使用内函数 $2t$ 的链式法则，其导数为 2。以厘米/秒和厘米/秒²为单位，

$$\begin{aligned} v(t) &= -6\sin(2t) + 8\cos(2t), \\ a(t) &= -12\cos(2t) - 16\sin(2t). \end{aligned}$$

**(b)** $a(t) = -4\big(3\cos(2t) + 4\sin(2t)\big) = -4s(t)$. 每次求导都会从内部函数 $2t$ 中提取一个因子 2，两次求导则提取 $2 \cdot 2 = 4$。 (在例 5.6 中，对于 $\sin t$ 和 $\cos t$，因子为 $1 \cdot 1 = 1$。)

**(c)** 在 $t = 0$： $s = 3$ 厘米， $v = 8$ 厘米/秒，向上。在 $t = \pi/4$， $2t = \pi/2$，因此 $s = 3 \cdot 0 + 4 \cdot 1 = 4$ 厘米， $v = -6 \cdot 1 + 8 \cdot 0 = -6$ 厘米/秒：质量为 4 厘米向上运动，速度为 6 厘米/秒向下。

```check
s7 = 3*cos(2*t) + 4*sin(2*t)
v7 = diff(s7, t); a7 = diff(v7, t)
same(v7, -6*sin(2*t) + 8*cos(2*t)); same(a7, -12*cos(2*t) - 16*sin(2*t)); same(a7, -4*s7)
same([s7.subs(t, 0), v7.subs(t, 0)], [3, 8]); same([s7.subs(t, pi/4), v7.subs(t, pi/4)], [4, -6])
```
:::
::::

:::: exercise 相同导数，不同形式 {#ex-5-8} ★★
- (a) 对 $\tan^2 x$ 和 $\sec^2 x$ (在 $\cos x \ne 0$ 处) 求导，并证明两个导数相等。
- (b) 不通过求导解释为何它们必须相等。
- (c) 对于第一个，SymPy 输出 `(2*tan(x)**2 + 2)*tan(x)`。通过手动计算和 SymPy 验证，证明它与你的答案一致。

::: solution
**(a)** 通过外函数 $u^2$ 的链式法则： $\dfrac{d}{dx}\tan^2 x = 2\tan x\sec^2 x$，和 $\dfrac{d}{dx}\sec^2 x = 2\sec x\cdot\sec x\tan x = 2\sec^2 x\tan x$。它们相等。

**(b)** $\tan^2 x + 1 = \sec^2 x$ (用 $\cos^2 x$ 除以 $\sin^2 x + \cos^2 x = 1$). 所以这两个函数相差一个常数 1，而常数的导数是 0。

**(c)** $(2\tan^2 x + 2)\tan x = 2(\tan^2 x + 1)\tan x = 2\sec^2 x\tan x$. 使用 SymPy 简化它们的差：

```python
import sympy as sp
x = sp.symbols('x')
a = sp.diff(sp.tan(x)**2, x)
b = sp.diff(sp.sec(x)**2, x)
print(a, '|', b)
print(sp.simplify(a - b))
```

```output
(2*tan(x)**2 + 2)*tan(x) | 2*tan(x)*sec(x)**2
0
```

差为 0：这两个答案是同一个函数，只是写法不同。

```check
same(diff(tan(x)**2, x), 2*tan(x)*sec(x)**2); same(diff(sec(x)**2, x), 2*sec(x)**2*tan(x))
same(sec(x)**2 - tan(x)**2, 1)
steps((2*tan(x)**2 + 2)*tan(x), 2*(tan(x)**2 + 1)*tan(x), 2*sec(x)**2*tan(x))
```
:::
::::

:::: exercise 手动计算双数 {#ex-5-9} ★★
使用双数的运算规则，结合 $\varepsilon^2 = 0$。

- (a) 计算 $(2 + \varepsilon)^2$ 和 $(2 + \varepsilon)^3$。
- (b) 设 $f(x) = x^3 - 4x$。计算 $f(2 + \varepsilon)$，读出 $f(2)$ 和 $f'(2)$，并用幂法则验证 $f'(2)$。
- (c) 计算 $f(3 + 2\varepsilon)$，并用定理 5.7 解释其 $\varepsilon$ 部分。

::: solution
**(a)** $(2 + \varepsilon)^2 = 4 + 4\varepsilon + \varepsilon^2 = 4 + 4\varepsilon$，并

$$\begin{aligned} (2 + \varepsilon)^3 &= (4 + 4\varepsilon)(2 + \varepsilon) \\ &= 8 + 4\varepsilon + 8\varepsilon + 4\varepsilon^2 \\ &= 8 + 12\varepsilon. \end{aligned}$$

**(b)** $f(2 + \varepsilon) = (8 + 12\varepsilon) - 4(2 + \varepsilon) = 8 + 12\varepsilon - 8 - 4\varepsilon = 0 + 8\varepsilon$. 所以 $f(2) = 0$ 和 $f'(2) = 8$. 检查： $f'(x) = 3x^2 - 4$，和 $f'(2) = 12 - 4 = 8$。

**(c)** $(3 + 2\varepsilon)^2 = 9 + 12\varepsilon$ 和 $(3 + 2\varepsilon)^3 = (9 + 12\varepsilon)(3 + 2\varepsilon) = 27 + 54\varepsilon$，所以

$$\begin{aligned} f(3 + 2\varepsilon) &= 27 + 54\varepsilon - 12 - 8\varepsilon \\ &= 15 + 46\varepsilon. \end{aligned}$$

根据定理 5.7 以及 $a = 3$ 和 $b = 2$， $\varepsilon$ 部分是 $f'(3)\cdot 2$，并且确实 $f'(3) = 27 - 4 = 23$ 和 $23 \cdot 2 = 46$。将输入视为一个随时间变化的量 $x$，其值为 3，变化率是 $dx/dt = 2$：那么输出的 $\varepsilon$ 部分是 $\dfrac{df}{dx}\cdot\dfrac{dx}{dt}$，再次应用链式法则。

```check
dual = lambda expr: expand(expr).subs(ep**2, 0).subs(ep**3, 0)
same(dual((2 + ep)**2), 4 + 4*ep); same(dual((2 + ep)**3), 8 + 12*ep); same(dual((4 + 4*ep)*(2 + ep)), 8 + 12*ep)
f9 = lambda X: X**3 - 4*X
same(dual(f9(2 + ep)), 8*ep); same(f9(2), 0); same(diff(f9(x), x), 3*x**2 - 4); same(diff(f9(x), x).subs(x, 2), 8)
same(dual((3 + 2*ep)**2), 9 + 12*ep); same(dual((3 + 2*ep)**3), 27 + 54*ep); same(dual(f9(3 + 2*ep)), 15 + 46*ep)
same(f9(3), 15); same(diff(f9(x), x).subs(x, 3)*2, 46)
```
:::
::::

:::: exercise 幂法则的归纳证明 {#ex-5-10} ★★★
**数学归纳法**的证明表明，一个命题对每个正整数$n$的成立需要两个步骤。**基础情况**展示了它在$n = 1$时的成立。**归纳步骤**展示了每当它对某个$n$成立时，它对$n + 1$也成立。那么它对1成立，因此对2成立，对3成立，并对每个$n$如此，就像一排倒下的多米诺骨牌。（模块9再次使用了该方法。）

仅使用乘积法则和 $x$ 的导数（不使用模块 4 其他部分的幂法则）。

- (a) 用归纳法证明 $\dfrac{d}{dx}x^n = nx^{n-1}$ 对于每一个正整数 $n$ 成立。
- (b) 用相同的方法证明，如果 $f$ 在 $x$ 处可导，则对于每个正整数 $n$，都有 $\dfrac{d}{dx}f(x)^n = nf(x)^{n-1}f'(x)$：幂函数的链式法则，不使用链式法则。

::: solution
**(a)** *基础情形。* 对于 $n = 1$：函数 $x$ 在每个 $h \ne 0$ 处的差商为 $\dfrac{(x + h) - x}{h} = 1$，因此 $\dfrac{d}{dx}x = 1 = 1\cdot x^0$。

*归纳步骤。* 假设 $\dfrac{d}{dx}x^n = nx^{n-1}$ 在某个 $n \ge 1$ 处成立。则 $x^{n+1} = x \cdot x^n$，并由乘积法则

$$\begin{aligned} \frac{d}{dx}x^{n+1} &= 1 \cdot x^n + x \cdot nx^{n-1} \\ &= x^n + nx^n \\ &= (n + 1)x^n, \end{aligned}$$

得到 $n + 1$ 的陈述。通过归纳，对于每个正整数 $n$ 都成立。

**(b)** *基础情形。* 对于 $n = 1$，陈述为 $(f^1)' = 1\cdot f'$，这是正确的。

*归纳步骤。* 假设 $(f^n)' = nf^{n-1}f'$ 在 $x$ 处成立。则 $f^{n+1} = f\cdot f^n$，并由乘积法则

$$\begin{aligned} (f^{n+1})' &= f'\cdot f^n + f\cdot nf^{n-1}f' \\ &= (1 + n)f^n f', \end{aligned}$$

得到 $n + 1$ 的陈述。这是乘积法则的模式，每个项对一个因子求导： $f^n$ 有 $n$ 个因子 $f$，因此其导数有 $n$ 个相等的项 $f^{n-1}f'$。

```check
steps(((x + h) - x)/h, 1)
same(1*x**n + x*n*x**(n - 1), (n + 1)*x**n)
fx_, fpx_ = symbols('f fp')
same(fpx_*fx_**n + fx_*n*fx_**(n - 1)*fpx_, (n + 1)*fx_**n*fpx_)
for N_ in range(1, 7):
    same(diff(fF(x)**N_, x), N_*fF(x)**(N_ - 1)*diff(fF(x), x))
```
:::
::::

:::: exercise 当内部变化为零时 {#ex-5-11} ★★★
设 $g(x) = x^2\sin(1/x)$ 对于 $x \ne 0$，且 $g(0) = 0$.

- (a) 用定义和夹逼定理证明 $g'(0) = 0$。
- (b) 证明 $g(h) = 0$ 对于 $h = \dfrac{1}{k\pi}$, $k = 1, 2, 3, \dots$。为什么这会破坏链式法则证明在 $x = 0$ 处的思路？
- (c) 设 $f(u) = u^2 + u$ 和 $F(x) = f\big(g(x)\big)$。用链式法则求 $F'(0)$，并从定义进行验证。

::: solution
**(a)** 这是 [练习 4.11](module_04_ZH.html#ex-4-11)(b) 再次出现。对于 $h \ne 0$，差商是 $\dfrac{g(h) - g(0)}{h} = \dfrac{h^2\sin(1/h)}{h} = h\sin(1/h)$。由于 $-1 \le \sin(1/h) \le 1$，它介于 $-\abs{h}$ 和 $\abs{h}$ 之间，而这两个都趋于 0。根据夹逼定理，$h\sin(1/h) \to 0$: $g'(0) = 0$.

**(b)** $g\Big(\dfrac{1}{k\pi}\Big) = \dfrac{1}{k^2\pi^2}\sin(k\pi) = 0$，因为$\sin(k\pi) = 0$。因此，对于可以任意接近0的$h = 1/\pi, 1/(2\pi), 1/(3\pi), \dots$数，$\Delta u = g(0 + h) - g(0)$为0。对于这些$h$，证明思路中的商$\Delta y/\Delta u$为$0/0$，因此该论证在$x = 0$处无法完成。5.5节“深入一步”框中的证明从未除以$\Delta u$，因此它涵盖了这种情况。

**(c)** $f'(u) = 2u + 1$, 所以根据链式法则 $F'(0) = f'\big(g(0)\big)\,g'(0) = (2\cdot 0 + 1)\cdot 0 = 0$. 根据定义: $F(0) = f(0) = 0$, 并且对于 $h \ne 0$

$$\begin{aligned} &\frac{F(h) - F(0)}{h} \\ &\quad= \frac{g(h)^2 + g(h)}{h} \\ &\quad= g(h)\cdot\frac{g(h)}{h} + \frac{g(h)}{h}. \end{aligned}$$

由 (a), $g(h)/h \to 0$, 和 $g(h) \to 0$ 因为 $\abs{g(h)} \le h^2$. 所以商趋于 $0 \cdot 0 + 0 = 0$，正如链式法则所说。

```check
g11 = x**2*sin(1/x)
limit_is((g11.subs(x, h) - 0)/h, h, 0, 0); same(g11.subs(x, h)/h, h*sin(1/h))
same([g11.subs(x, 1/(j*pi)) for j in range(1, 7)], [0]*6)
f11 = u**2 + u
same(diff(f11, u), 2*u + 1); same((2*u + 1).subs(u, 0)*0, 0)
same((f11.subs(u, g11.subs(x, h)))/h, g11.subs(x, h)*(g11.subs(x, h)/h) + g11.subs(x, h)/h)
limit_is(f11.subs(u, g11.subs(x, h))/h, h, 0, 0)
```
:::
::::

:::: exercise 双数的除法 {#ex-5-12} ★★★
- (a) 设 $c \ne 0$. 求具有 $(c + d\varepsilon)(p + q\varepsilon) = a + b\varepsilon$ 的双数 $p + q\varepsilon$，即商 $\dfrac{a + b\varepsilon}{c + d\varepsilon}$。
- (b) 解释为什么结果是商的法则。
- (c) 将除法添加到第 5.8 节的 `Dual` 类中，并计算 $f(x) = \dfrac{1}{1 + x^2}$ 在 $x = 2$ 处的导数。与商的法则进行比较。

::: solution
**(a)** 展开： $(c + d\varepsilon)(p + q\varepsilon) = cp + (cq + dp)\varepsilon$. 这等于 $a + b\varepsilon$ 当 $cp = a$ 和 $cq + dp = b$. 由于 $c \ne 0$, $p = \dfrac{a}{c}$, 然后 $q = \dfrac{b - dp}{c} = \dfrac{b - ad/c}{c} = \dfrac{bc - ad}{c^2}$. 所以

$$\frac{a + b\varepsilon}{c + d\varepsilon} = \frac{a}{c} + \frac{bc - ad}{c^2}\,\varepsilon.$$

**(b)** 代入两个函数的值和导数： $a = f(x)$, $b = f'(x)$, $c = g(x)$, $d = g'(x)$. 的 $\varepsilon$ 部分变为 $\dfrac{f'(x)g(x) - f(x)g'(x)}{g(x)^2}$, 商的法则. (条件 $c \ne 0$ 是商的法则的 $g(x) \ne 0$.)

**(c)** 两种方法： `__truediv__` 对于 `d / e`, `__rtruediv__` 对于一个普通数除以一个双变量，如 `1/(1 + x*x)`:

```python
class Dual:
    def __init__(self, a, b=0.0):
        self.a, self.b = a, b
    def __add__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a + other.a, self.b + other.b)
    def __mul__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a*other.a, self.a*other.b + self.b*other.a)
    def __truediv__(self, other):            # (a + bε)/(c + dε), with c ≠ 0
        other = other if isinstance(other, Dual) else Dual(other)
        a, b, c, d = self.a, self.b, other.a, other.b
        return Dual(a/c, (b*c - a*d)/c**2)
    def __rtruediv__(self, other):           # number / dual
        return Dual(other)/self
    __radd__, __rmul__ = __add__, __mul__
```

```python
def f(x):
    return 1/(1 + x*x)

y = f(Dual(2.0, 1.0))
print(y.a, y.b)
```

```output
0.2 -0.16
```

商的法则给出 $f'(x) = \dfrac{0\cdot(1 + x^2) - 1\cdot 2x}{(1 + x^2)^2} = -\dfrac{2x}{(1 + x^2)^2}$, 所以 $f(2) = \dfrac15 = 0.2$ 和 $f'(2) = -\dfrac{4}{25} = -0.16$: 相同的数值.

```check
pq_, qq2 = symbols('p q')
dd = symbols('d')
sol12 = solve([Eq(c*pq_, a), Eq(c*qq2 + dd*pq_, b)], [pq_, qq2], dict=True)[0]
same(sol12[pq_], a/c); same(sol12[qq2], (b*c - a*dd)/c**2)
same(expand((c + dd*ep)*(a/c + (b*c - a*dd)/c**2*ep)).subs(ep**2, 0), a + b*ep)
same(((fF(x)/gF(x)).diff(x)), (diff(fF(x), x)*gF(x) - fF(x)*diff(gF(x), x))/gF(x)**2)
f12 = 1/(1 + x**2)
steps(Derivative(f12, x), (0*(1 + x**2) - 1*2*x)/(1 + x**2)**2, -2*x/(1 + x**2)**2)
same(f12.subs(x, 2), Rational(1, 5)); same(diff(f12, x).subs(x, 2), Rational(-4, 25)); same(Rational(-4, 25), Rational(-16, 100))
```
:::
::::

## 自测 {#quiz}

```quiz
? $\dfrac{d}{dx}\big(x^3\sin x\big)$等于
- [ ] $3x^2\cos x$
- [x] $3x^2\sin x + x^3\cos x$
- [ ] $3x^2\sin x - x^3\cos x$
- [ ] $x^3\cos x$
> 根据乘积法则，第一个因子的导数乘以第二个因子，加上第一个因子乘以第二个因子的导数： $3x^2\sin x + x^3\cos x$. $3x^2\cos x$ 乘以两个导数，这不是规则； $x^3\cos x$ 仅对第二个因子求导；而负号属于商的法则.

? $\dfrac{d}{dx}\dfrac{x}{x + 1}$ 对于 $x \ne -1$，等于
- [ ] $1$
- [ ] $-\dfrac{1}{(x + 1)^2}$
- [ ] $\dfrac{2x + 1}{(x + 1)^2}$
- [x] $\dfrac{1}{(x + 1)^2}$
> 商的法则: $\dfrac{1\cdot(x + 1) - x\cdot 1}{(x + 1)^2} = \dfrac{1}{(x + 1)^2}$. 答案 1 将导数相除， $1/1$; $-\dfrac{1}{(x + 1)^2}$ 的分子顺序颠倒； $\dfrac{2x + 1}{(x + 1)^2}$ 用加号代替减号。

? $y = \cos x$ 在 $x = \pi/2$ 处的斜率是
- [x] $-1$
- [ ] $0$
- [ ] $1$
- [ ] $\pi/2$
> $(\cos x)' = -\sin x$，和 $-\sin(\pi/2) = -1$: 余弦在穿过轴时递减。 0 是值 $\cos(\pi/2)$，不是斜率； 1 忘记了负号。

? $\dfrac{d}{dx}\sin(3x)$等于
- [ ] $\cos(3x)$
- [ ] $3\cos x$
- [x] $3\cos(3x)$
- [ ] $-3\cos(3x)$
> 链式法则，内函数为 $3x$: $\cos(3x)\cdot 3$。 $\cos(3x)$ 忘记了内函数的导数； $3\cos x$ 改变了余弦的内部； 负号属于余弦导数，而不是正弦导数。

? $\dfrac{d}{dx}(x^2 + 1)^{10}$等于
- [ ] $10(x^2 + 1)^9$
- [x] $20x(x^2 + 1)^9$
- [ ] $10(2x)^9$
- [ ] $20x(x^2 + 1)^{10}$
> 链式法则: $10(x^2 + 1)^9\cdot 2x$。 $10(x^2 + 1)^9$ 忘记了内函数导数 $2x$； $10(2x)^9$ 在幂内求导； 指数必须降到 9。

? 假设 $g(1) = 2$, $g'(1) = 3$, $f'(1) = 7$ 和 $f'(2) = 5$。 $f\big(g(x)\big)$ 在 $x = 1$ 处的导数是
- [x] $15$
- [ ] $21$
- [ ] $10$
- [ ] $5$
> $f'\big(g(1)\big)\,g'(1) = f'(2)\cdot 3 = 15$. 21 在 1 处计算 $f'$ 而不是在 $g(1) = 2$；10 乘以 $g(1)$ 而不是 $g'(1)$；5 忘记了内层导数。

? SymPy 打印 `tan(x)**2 + 1` 对应 `sp.diff(sp.tan(x), x)`。哪一个是正确的？
- [ ] SymPy 错误：导数是 $\sec^2 x$
- [ ] 它仅在 $x = 0$ 处等于 $\sec^2 x$
- [ ] 它仅在小的 $x$ 时等于 $\sec^2 x$
- [x] 它在 $\cos x \ne 0$ 处等于 $\sec^2 x$
> 将 $\sin^2 x + \cos^2 x = 1$ 除以 $\cos^2 x$ 得到 $\tan^2 x + 1 = \sec^2 x$，对于每个 $x$ 满足 $\cos x \ne 0$：两种写法表示同一个函数。简化两种形式的差值得到 0。

? 用 $\varepsilon^2 = 0$，将 $f(x) = x^2 + 3x$ 在 $2 + \varepsilon$ 处计算得到
- [ ] $10 + 4\varepsilon$
- [ ] $10 + \varepsilon$
- [x] $10 + 7\varepsilon$
- [ ] $10 + 7\varepsilon + \varepsilon^2$
> $(2 + \varepsilon)^2 + 3(2 + \varepsilon) = 4 + 4\varepsilon + 6 + 3\varepsilon = 10 + 7\varepsilon$：值为 $f(2) = 10$，导数为 $f'(2) = 2\cdot 2 + 3 = 7$。 $10 + 4\varepsilon$ 忘记了 $\varepsilon$ 来自 $3x$； $10 + \varepsilon$ 是 $f(2) + \varepsilon$，如同输入的变化未改变地传递到输出； $\varepsilon^2$ 由定义为 0。
```

```check
same(diff(x**3*sin(x), x), 3*x**2*sin(x) + x**3*cos(x))
same(diff(x/(x + 1), x), 1/(x + 1)**2)
same((x*1 - 1*(x + 1))/(x + 1)**2, -1/(x + 1)**2); same((1*(x + 1) + x*1)/(x + 1)**2, (2*x + 1)/(x + 1)**2)   # the numerator in the wrong order; a plus sign
same(diff(cos(x), x).subs(x, pi/2), -1); same(cos(pi/2), 0)
same(diff(sin(3*x), x), 3*cos(3*x))
same(diff((x**2 + 1)**10, x), 20*x*(x**2 + 1)**9)
same(5*3, 15); same(7*3, 21); same(5*2, 10)
same(tan(x)**2 + 1, sec(x)**2)
same(expand((2 + ep)**2 + 3*(2 + ep)).subs(ep**2, 0), 10 + 7*ep); same(diff(x**2 + 3*x, x).subs(x, 2), 7)
same(expand((2 + ep)**2 + 3*2).subs(ep**2, 0), 10 + 4*ep)                    # forgetting the epsilon from 3x
```
