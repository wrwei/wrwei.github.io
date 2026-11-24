---
title: 积分方法
part: 3
lead: 学习为不同的被积函数选择积分方法。用分部积分、三角恒等式、三角换元和部分分式处理乘积、三角函数的幂、二次式的平方根及有理函数。你还将验证计算机的结果，识别没有初等原函数的被积函数，并在满足可微条件时给出数值积分的误差上界。
minutes: 270
needs: 模块 1 到 10，特别是乘积法则和链式法则（模块 5），模块 5 和 6 的导数，以及原函数和替换（模块 10）
goals:
  - 使用分部积分法，选择 $u$ 和 $dv$，在定积分中重复或使用表格法，推导降阶公式
  - 使用恒等式和替换积分正弦、余弦、正切和正割的幂
  - 通过三角替换计算包含 $\sqrt{a^2 - x^2}$、$\sqrt{a^2 + x^2}$ 或 $\sqrt{x^2 - a^2}$ 的积分，并用三角形返回 $x$
  - 通过长除法和部分分式积分有理函数
  - 选择方法，通过求导检查计算机的答案，并识别没有初等原函数的被积函数
  - 使用中点、梯形和辛普森法则近似积分，并对其误差进行界估计
---

## 分部积分法 {#parts}

模块 10 将链式法则转换为替换法则。本节将乘积法则转换为积分法则。乘积在积分中无处不在，$x\cos x$，$xe^{-x}$，$x^2\ln x$，$e^x\sin x$，且模块 10 已警告：不存在乘积法则用于原函数；一个函数 $x\cos x$ 的原函数不是 $\tfrac12x^2\sin x$（[第 10.1 节](module_10_ZH.html#antiderivatives)）

从模块 5 的 [乘积法则](module_05_ZH.html#product)，$(fg)' = f'g + fg'$ 开始。反向阅读，它表示 $fg$ 是 $f'g + fg'$ 的原函数。因此，如果你能积分其中一个项，就能积分另一个项。尝试对 $x\cos x$ 进行积分，令 $f(x) = x$ 和 $g(x) = \sin x$，使得 $fg' = x\cos x$ 是被积函数，而 $f'g = \sin x$ 是容易积分的：

$$\frac{d}{dx}(x\sin x) = \sin x + x\cos x.$$

所以 $x\cos x = (x\sin x)' - \sin x$，且右边的原函数是 $x\sin x - (-\cos x)$：

$$\int x\cos x\,dx = x\sin x + \cos x + C.$$

检查：$\dfrac{d}{dx}(x\sin x + \cos x) = \sin x + x\cos x - \sin x = x\cos x$。

```check
same(diff(x*sin(x), x), sin(x) + x*cos(x))
same(x*cos(x), diff(x*sin(x), x) - sin(x))
antideriv(x*sin(x) - (-cos(x)), x*cos(x), x)
steps(Derivative(x*sin(x) + cos(x), x), sin(x) + x*cos(x) - sin(x), x*cos(x))
```

::: theorem 分部积分法
设 $f$ 和 $g$ 在区间 $I$ 上具有连续导数。则在 $I$ 上，

$$\begin{aligned} &\int f(x)\,g'(x)\,dx \\ &\quad= f(x)\,g(x) - \int f'(x)\,g(x)\,dx. \end{aligned}$$

即：如果 $G$ 是 $f'g$ 在 $I$ 上的原函数，则 $fg - G$ 是 $fg'$ 的原函数。
:::

::: proof
函数$f'g$在$I$上连续，因此由微积分基本定理第一部分（[第10.4节](module_10_ZH.html#ftc1)）可知，它在该处存在原函数$G$。根据乘积法则，

$$(fg - G)' = f'g + fg' - f'g = fg'$$

在 $I$ 上。因此 $fg - G$ 是 $fg'$ 的原函数。
:::

```check
fF, gF, GF = Function('f'), Function('g'), Function('G')
same(diff(fF(x)*gF(x), x) - diff(fF(x), x)*gF(x), fF(x)*diff(gF(x), x))
expr_ = diff(fF(x)*gF(x) - GF(x), x).subs(Derivative(GF(x), x), diff(fF(x), x)*gF(x))
same(expr_, fF(x)*diff(gF(x), x))                       # (fg - G)' = fg' when G' = f'g
```

在莱布尼茨记号中，设 $u = f(x)$ 和 $v = g(x)$，使得 $du = f'(x)\,dx$ 和 $dv = g'(x)\,dx$ 是它们的 [微分](module_07_ZH.html#differentials)。公式变为

$$\int u\,dv = uv - \int v\,du,$$

读作：“∫u d v 等于 u v 减去 ∫v d u”。使用该公式时，将被积函数分为两个因子：将 $u$ 进行求导，将 $dv$ 包含 $dx$ 并且必须能够进行积分。该公式将 $\int u\,dv$ 与 $\int v\,du$ 交换，当新的积分比原来的积分更简单时，该方法特别有用。

::: example 三个分部积分
求 (a) $\displaystyle\int xe^{-x}\,dx$, (b) $\displaystyle\int \ln x\,dx$, 对于 $x > 0$, 和 (c) $\displaystyle\int \arctan x\,dx$.

**(a)** 设 $u = x$ 和 $dv = e^{-x}\,dx$. 那么 $du = dx$ 和 $v = -e^{-x}$; 任何 $e^{-x}$ 的原函数都可以, 所以取最简单的. 因此

$$\begin{aligned} &\int xe^{-x}\,dx \\ &\quad= x\big(-e^{-x}\big) - \int \big(-e^{-x}\big)\,dx \\ &\quad= -xe^{-x} + \int e^{-x}\,dx \\ &\quad= -xe^{-x} - e^{-x} + C. \end{aligned}$$

检查：$\dfrac{d}{dx}\big(-xe^{-x} - e^{-x}\big) = -e^{-x} + xe^{-x} + e^{-x} = xe^{-x}$。

**(b)** 看起来只有一个因子, 但 $\ln x\,dx$ 是 $u\,dv$ 与 $u = \ln x$ 和 $dv = dx$ 的乘积. 然后 $du = \dfrac{dx}{x}$ 和 $v = x$:

$$\begin{aligned} \int \ln x\,dx &= x\ln x - \int x\cdot\frac1x\,dx \\ &= x\ln x - x + C. \end{aligned}$$

**(c)** 同样的技巧: $u = \arctan x$ 和 $dv = dx$, 所以 $du = \dfrac{dx}{1 + x^2}$ 和 $v = x$. 然后

$$\begin{aligned} &\int \arctan x\,dx \\ &\quad= x\arctan x - \int \frac{x}{1 + x^2}\,dx \\ &\quad= x\arctan x - \tfrac12\ln\big(1 + x^2\big) + C, \end{aligned}$$

用替换 $w = 1 + x^2$, $dw = 2x\,dx$ (模块 10) 计算最后一个积分, 不需要绝对值符号, 因为 $1 + x^2 > 0$.

```check
steps(Integral(x*exp(-x), x), x*(-exp(-x)) - Integral(-exp(-x), x), -x*exp(-x) + Integral(exp(-x), x), -x*exp(-x) - exp(-x))
antideriv(-exp(-x), exp(-x), x); antideriv(-x*exp(-x) - exp(-x), x*exp(-x), x)
steps(Derivative(-x*exp(-x) - exp(-x), x), -exp(-x) + x*exp(-x) + exp(-x), x*exp(-x))
xp = symbols('x', positive=True)
same(diff(log(xp), xp), 1/xp); antideriv(xp, 1, xp)
steps(Integral(log(xp), xp), xp*log(xp) - Integral(xp*(1/xp), xp), xp*log(xp) - xp)
antideriv(xp*log(xp) - xp, log(xp), xp)
same(diff(atan(x), x), 1/(1 + x**2)); antideriv(log(1 + x**2)/2, x/(1 + x**2), x)
steps(Integral(atan(x), x), x*atan(x) - Integral(x/(1 + x**2), x), x*atan(x) - log(1 + x**2)/2)
antideriv(x*atan(x) - log(1 + x**2)/2, atan(x), x)
```
:::

### 选择 u 和 dv {#choosing}

选择很重要. 在 $\int x\cos x\,dx$ 中, 取相反的角色, $u = \cos x$ 和 $dv = x\,dx$. 然后 $du = -\sin x\,dx$ 和 $v = \tfrac12x^2$, 并

$$\int x\cos x\,dx = \tfrac12x^2\cos x + \tfrac12\int x^2\sin x\,dx.$$

那是正确的，但新的积分比原来的更难：$x$ 的幂次没有降低而是升高了。当对 $u$ 求导使其变得更简单，而对 $dv$ 积分不会变得太糟糕时，分部积分法才有效。

```check
steps(Integral(x*cos(x), x), cos(x)*x**2/2 - Integral(x**2/2*(-sin(x)), x), x**2*cos(x)/2 + Integral(x**2*sin(x), x)/2)
```

::: keyidea
选择 $u$ 的一个大致指南是单词 **LIATE**。取 $u$ 为列表中首先出现的类型的因子

1. **L** 对数函数： $\ln x$
2. **I** 反三角函数： $\arctan x$, $\arcsin x$
3. **A** 代数函数：幂函数和多项式，例如 $x$, $x^3$, $\sqrt x$
4. **T** 三角函数： $\sin x$, $\cos x$
5. **E** 指数函数： $e^x$, $e^{-2x}$, $2^x$

并让 $dv$ 为其余部分，按 $dx$ 排序。列表中较早的类型在求导时会变得更简单（$\ln x$ 变为 $1/x$， $\arctan x$ 变为 $1/(1 + x^2)$， $x^3$ 变为 $3x^2$）；列表中较晚的类型容易积分且保持原类型。
:::

在 $\int xe^{-x}\,dx$ 中，代数项在指数项之前，因此 $u = x$；在 $\int \ln x\,dx$ 和 $\int \arctan x\,dx$ 中，对数和反三角函数优先，因此 $dv = dx$。但 LIATE 只是一个经验法则，不是定理，且要求你能够积分 $dv$ 的条件优先。

::: example 当指南误导时
求 $\displaystyle\int x^3e^{x^2}\,dx$。

LIATE 建议 $u = x^3$ 和 $dv = e^{x^2}\,dx$。但随后 $v$ 将成为 $e^{x^2}$ 的原函数，而由 模块 1 目录中的函数构造的任何公式都不是（第 11.6 节）。以不同的方式拆分被积函数。因子 $e^{x^2}$ 只有与因子 $x$ 一起才能积分，通过替换 $w = x^2$， $dw = 2x\,dx$： $\int xe^{x^2}\,dx = \tfrac12e^{x^2} + C$。因此取

$$\begin{aligned} u &= x^2, & dv &= xe^{x^2}\,dx, \\ du &= 2x\,dx, & v &= \tfrac12e^{x^2}. \end{aligned}$$

然后

$$\begin{aligned} \int x^3e^{x^2}\,dx &= \tfrac12x^2e^{x^2} - \int \tfrac12e^{x^2}\cdot 2x\,dx \\ &= \tfrac12x^2e^{x^2} - \tfrac12e^{x^2} + C \\ &= \tfrac12\big(x^2 - 1\big)e^{x^2} + C, \end{aligned}$$

用同样的替换计算中间积分。检查： $\dfrac{d}{dx}\Big(\tfrac12\big(x^2 - 1\big)e^{x^2}\Big) = xe^{x^2} + \tfrac12\big(x^2 - 1\big)2xe^{x^2} = x^3e^{x^2}$。

```check
antideriv(exp(x**2)/2, x*exp(x**2), x); same(diff(x**2, x), 2*x)
steps(Integral(x**3*exp(x**2), x), x**2*exp(x**2)/2 - Integral(exp(x**2)/2*2*x, x), x**2*exp(x**2)/2 - exp(x**2)/2, (x**2 - 1)*exp(x**2)/2)
steps(Derivative((x**2 - 1)*exp(x**2)/2, x), x*exp(x**2) + (x**2 - 1)/2*2*x*exp(x**2), x**3*exp(x**2))
```
:::

::: pitfall
三张部分积分卡。 **(1)**符号： $\int u\,dv$ 是 $uv$ 减去 $\int v\,du$。**(2)**混淆 $dv$ 的积分。在 $\int xe^{3x}\,dx$ 中，带 $u = x$ 和 $dv = e^{3x}\,dx$， $v$ 是 $\tfrac13e^{3x}$，不是 $e^{3x}$，答案是 $\tfrac13xe^{3x} - \tfrac19e^{3x} + C$；带 $v = e^{3x}$ 你会得到 $xe^{3x} - e^{3x}$，其导数是 $3xe^{3x} - 2e^{3x}$。**(3)** 无法奏效的选择：一个 $dv$ 无法积分，如例 11.2，或一个 $u$ 没有变得更简单。对答案求导以捕捉所有三种情况。

```check
antideriv(x*exp(3*x)/3 - exp(3*x)/9, x*exp(3*x), x)
same(diff(x*exp(3*x) - exp(3*x), x), 3*x*exp(3*x) - 2*exp(3*x))
```
:::

### 重复部分与表格法 {#repeated}

有时新的积分更简单但仍为乘积，再进行一次部分积分即可完成。

::: example 两次部分积分
求 $\displaystyle\int x^2\sin x\,dx$。

按照 LIATE 顺序， $u = x^2$ 和 $dv = \sin x\,dx$，因此 $du = 2x\,dx$ 和 $v = -\cos x$：

$$\begin{aligned} &\int x^2\sin x\,dx \\ &\quad= -x^2\cos x + \int 2x\cos x\,dx. \end{aligned}$$

新的被积函数又是一个乘积，其中 $x$ 的幂次较低。它是本节开始时所求积分的两倍（使用 $u = x$ 和 $dv = \cos x\,dx$ 的分部积分法），即 $2(x\sin x + \cos x) + C$。因此

$$\begin{aligned} &\int x^2\sin x\,dx \\ &\quad= -x^2\cos x + 2x\sin x \\ &\qquad + 2\cos x + C. \end{aligned}$$

每一轮运算使 $x$ 的幂次降低一次，因此 $x^n$ 需要 $n$ 轮运算。

```check
same(diff(x**2, x), 2*x); antideriv(-cos(x), sin(x), x)
steps(Integral(x**2*sin(x), x), -x**2*cos(x) + Integral(2*x*cos(x), x), -x**2*cos(x) + 2*(x*sin(x) + cos(x)), -x**2*cos(x) + 2*x*sin(x) + 2*cos(x))
antideriv(-x**2*cos(x) + 2*x*sin(x) + 2*cos(x), x**2*sin(x), x)
```
:::

当$u$为多项式时，各轮次遵循由表格组织的模式：即**表格法**。在左列中从上至下写出$u$及其各阶导数直至0，在右列中写出函数$dv$及其各阶原函数。将左列的每一项与右列下一行的对应项相乘，依次赋予乘积符号$+, -, +, -, \dots$，并将它们求和。

::: example 表格法
求 $\displaystyle\int x^3e^{2x}\,dx$。

对 $x^3$ 不断求导直到变为 0，对 $e^{2x}$ 不断积分：

| 符号 | 求导 | 积分 |
|---|---|---|
| $+$ | $x^3$ | $e^{2x}$ |
| $-$ | $3x^2$ | $\tfrac12e^{2x}$ |
| $+$ | $6x$ | $\tfrac14e^{2x}$ |
| $-$ | $6$ | $\tfrac18e^{2x}$ |
|  | $0$ | $\tfrac1{16}e^{2x}$ |

沿着对角线相乘，符号按第一列的符号依次排列。

$$\begin{aligned} &\int x^3e^{2x}\,dx \\ &\quad= \tfrac12x^3e^{2x} - \tfrac34x^2e^{2x} \\ &\qquad + \tfrac34xe^{2x} - \tfrac38e^{2x} + C \\ &\quad= \tfrac18e^{2x}\big(4x^3 - 6x^2 + 6x - 3\big) + C. \end{aligned}$$

每条对角线代表一轮部分。第一轮给出 $x^3\cdot\tfrac12e^{2x} - \int 3x^2\cdot\tfrac12e^{2x}\,dx$：第一个乘积，减去下一行两个项的积分。该积分以相同方式处理，每个符号反转，依此类推。当左边的列达到 0 时，过程停止，因为此时剩余的积分也为 0。

```check
same([diff(x**3, x, k_) for k_ in range(5)], [x**3, 3*x**2, 6*x, 6, 0])
same([diff(exp(2*x)/2**k_, x) for k_ in range(1, 5)], [exp(2*x)/2**(k_ - 1) for k_ in range(1, 5)])   # each entry integrates the one above
steps(Integral(x**3*exp(2*x), x), x**3*exp(2*x)/2 - Integral(3*x**2*exp(2*x)/2, x))
diag_ = x**3*exp(2*x)/2 - 3*x**2*exp(2*x)/4 + 6*x*exp(2*x)/8 - 6*exp(2*x)/16
same(diag_, x**3*exp(2*x)/2 - Rational(3, 4)*x**2*exp(2*x) + Rational(3, 4)*x*exp(2*x) - Rational(3, 8)*exp(2*x))
same(diag_, exp(2*x)*(4*x**3 - 6*x**2 + 6*x - 3)/8); antideriv(diag_, x**3*exp(2*x), x)
```
:::

### 分部积分法计算定积分 {#definite-parts}

对于定积分，计算 $uv$ 在上下限之间的值。

::: theorem 定积分中的分部积分法
如果 $f$ 和 $g$ 在 $[a, b]$ 上有连续导数，则

$$\begin{aligned} &\int_a^b f(x)\,g'(x)\,dx \\ &\quad= \big[f(x)\,g(x)\big]_a^b - \int_a^b f'(x)\,g(x)\,dx. \end{aligned}$$
:::

::: proof
函数$fg'$和$f'g$在$[a, b]$上连续，因此两个积分均存在。设$G$是$f'g$在$[a, b]$上的一个原函数。由定理11.1，$fg - G$是$fg'$的一个原函数，因此由微积分基本定理第二部分（[小节 10.5](module_10_ZH.html#ftc2)）可知，左边为$\big[fg - G\big]_a^b = \big[fg\big]_a^b - \big[G\big]_a^b$，且由第二部分再次可得$\big[G\big]_a^b = \int_a^b f'g\,dx$。
:::

```check
same(integrate(x*cos(x), (x, 0, 2)), (x*sin(x)).subs(x, 2) - (x*sin(x)).subs(x, 0) - integrate(sin(x), (x, 0, 2)))   # an instance
same(integrate(log(x)*x, (x, 1, 3)), (log(x)*x**2/2).subs(x, 3) - (log(x)*x**2/2).subs(x, 1) - integrate(x/2, (x, 1, 3)))
```

当$u = f(x)$和$v = g(x)$永非负且均随$x$递增时，该定理具有几何图像（图11.1）。随着$x$从$a$变化至$b$，点$(u, v)$描绘出一条从$(u_1, v_1)$到$(u_2, v_2)$的曲线，其中涉及$u_1 = f(a)$、$v_1 = g(a)$、$u_2 = f(b)$和$v_2 = g(b)$。积分$\int v\,du = \int_a^b g(x)f'(x)\,dx$为该曲线与$u$轴之间的面积，而$\int u\,dv = \int_a^b f(x)g'(x)\,dx$为该曲线与$v$轴之间的面积。这两个区域共同填满矩形$u_2v_2$，仅除去矩形$u_1v_1$：

$$\int u\,dv + \int v\,du = u_2v_2 - u_1v_1 = \big[uv\big]_a^b,$$

该区域即为定理 11.2。

::: figure id=fig-11-1
分部积分作为面积。左图：由 $(u, v)$ 从 $(u_1, v_1)$ 到 $(u_2, v_2)$ 追踪的曲线。蓝色区域（曲线与 $u$ 轴之间）的面积为 $\int v\,du$；橙色区域（曲线与 $v$ 轴之间）的面积为 $\int u\,dv$。二者合起来等于大矩形 $u_2v_2$ 减去小矩形 $u_1v_1$。右图：$u = x$、$v = \ln x$ 对应于 $1 \le x \le e$ 的情况（例 11.5(a)）。蓝色区域 $\int_1^e \ln x\,dx$ 与橙色区域 $\int_0^1 e^v\,dv = e - 1$ 之和等于矩形 $e \times 1$，因此蓝色区域为 1。
:::

::: example 分部积分法计算定积分
计算 (a) $\displaystyle\int_1^e \ln x\,dx$ 和 (b) $\displaystyle\int_0^\pi x\sin x\,dx$。

**(a)** 以 $u = \ln x$ 和 $dv = dx$ 为例，如例 11.1(b)，

$$\begin{aligned} &\int_1^e \ln x\,dx \\ &\quad= \big[x\ln x\big]_1^e - \int_1^e x\cdot\frac1x\,dx \\ &\quad= (e\ln e - 1\cdot\ln 1) - (e - 1) \\ &\quad= e - (e - 1) = 1. \end{aligned}$$

图 11.1（右）将此面积表示为面积 $e$ 减去曲线左侧区域 $e - 1$ 的矩形。

**(b)** 以 $u = x$ 和 $dv = \sin x\,dx$，因此 $du = dx$ 和 $v = -\cos x$，

$$\begin{aligned} &\int_0^\pi x\sin x\,dx \\ &\quad= \big[-x\cos x\big]_0^\pi + \int_0^\pi \cos x\,dx \\ &\quad= (-\pi\cos\pi + 0) + \big[\sin x\big]_0^\pi \\ &\quad= \pi + 0 = \pi. \end{aligned}$$

```check
steps(Integral(log(x), (x, 1, E)), (E*log(E) - 1*log(1)) - Integral(x*(1/x), (x, 1, E)), E - (E - 1), 1)
same(integrate(exp(v), (v, 0, 1)), E - 1); same(E*1 - 1*0, E)                   # the picture: e - (e - 1) = 1
steps(Integral(x*sin(x), (x, 0, pi)), (-pi*cos(pi) + 0*cos(0)) + Integral(cos(x), (x, 0, pi)), pi + (sin(pi) - sin(0)), pi)
```
:::

### 当积分返回时 {#comes-back}

在一些积分中，对两个因子分别求导并不会使它们变得更简单。这时进行两次分部积分可能会使你回到最初的积分，从而可以解出它。

::: example 一个回到原积分的积分
求 $\displaystyle\int e^x\sin x\,dx$。

将积分称为 $I$。取 $u = \sin x$ 和 $dv = e^x\,dx$，因此得到 $du = \cos x\,dx$ 和 $v = e^x$：

$$I = e^x\sin x - \int e^x\cos x\,dx.$$

新的积分具有相同的形式。再次使用分部积分法，保持因子 $u = \cos x$ 和 $dv = e^x\,dx$ 的相同角色，因此得到 $du = -\sin x\,dx$：

$$\begin{aligned} &\int e^x\cos x\,dx \\ &\quad= e^x\cos x + \int e^x\sin x\,dx \\ &\quad= e^x\cos x + I. \end{aligned}$$

将这个结果代入第一个方程：

$$I = e^x\sin x - e^x\cos x - I.$$

未知积分出现在等式的两边，因此可以像解方程一样解出它：即 $2I = e^x(\sin x - \cos x)$，且

$$\int e^x\sin x\,dx = \tfrac12e^x(\sin x - \cos x) + C.$$

每个不定积分代表一个函数族，它们之间仅相差常数，因此这些等式在常数意义下成立；最后的 $+\,C$ 收集了这些常数。验证： $\dfrac{d}{dx}\Big(\tfrac12e^x(\sin x - \cos x)\Big) = \tfrac12e^x(\sin x - \cos x) + \tfrac12e^x(\cos x + \sin x) = e^x\sin x$。

```check
steps(Integral(exp(x)*sin(x), x), exp(x)*sin(x) - Integral(exp(x)*cos(x), x))
steps(Integral(exp(x)*cos(x), x), exp(x)*cos(x) - Integral(exp(x)*(-sin(x)), x), exp(x)*cos(x) + Integral(exp(x)*sin(x), x))
Iq = symbols('I_q')
same(solve(Eq(Iq, exp(x)*sin(x) - exp(x)*cos(x) - Iq), Iq), [exp(x)*(sin(x) - cos(x))/2])
antideriv(exp(x)*(sin(x) - cos(x))/2, exp(x)*sin(x), x)
steps(Derivative(exp(x)*(sin(x) - cos(x))/2, x), exp(x)*(sin(x) - cos(x))/2 + exp(x)*(cos(x) + sin(x))/2, exp(x)*sin(x))
```
:::

::: pitfall
在第二次分部积分中，保持第一个因子的角色不变。使用 $u = e^x$ 和 $dv = \cos x\,dx$ 时，第二次分部积分将抵消第一次的结果：即 $\int e^x\cos x\,dx = e^x\sin x - I$，从而使第一个方程变为 $I = e^x\sin x - e^x\sin x + I$，即 $I = I$。这虽然是正确的，但没有帮助。

```check
steps(Integral(exp(x)*cos(x), x), exp(x)*sin(x) - Integral(exp(x)*sin(x), x))
same(exp(x)*sin(x) - (exp(x)*sin(x) - Iq), Iq)
```
:::

### 降阶公式 {#reduction}

一些积分依赖于一个整数 $n$，例如 $\int \sin^n x\,dx$ 或 $\int x^ne^x\,dx$。分部积分法可以降低 $n$。一个 **降阶公式** 表示这样的积分用相同积分但更小的 $n$ 来表达；反复应用，它将 $n$ 降到 0 或 1。

::: theorem 正弦幂的降阶公式
对于每一个整数 $n \ge 2$，

$$\begin{aligned} \int \sin^n x\,dx &= -\frac{\sin^{n-1}x\cos x}{n} \\ &\quad + \frac{n - 1}{n}\int \sin^{n-2}x\,dx. \end{aligned}$$
:::

::: proof
写 $\sin^n x = \sin^{n-1}x\cdot\sin x$ 并用 $u = \sin^{n-1}x$ 和 $dv = \sin x\,dx$ 进行分部积分。根据链式法则 $du = (n - 1)\sin^{n-2}x\cos x\,dx$，以及 $v = -\cos x$：

$$\begin{aligned} &\int \sin^n x\,dx \\ &\quad= -\sin^{n-1}x\cos x \\ &\qquad + (n - 1)\int \sin^{n-2}x\cos^2 x\,dx. \end{aligned}$$

将 $\cos^2 x$ 替换为 $1 - \sin^2 x$ 并拆分积分：

$$\begin{aligned} &\int \sin^n x\,dx \\ &\quad= -\sin^{n-1}x\cos x \\ &\qquad + (n - 1)\int \sin^{n-2}x\,dx \\ &\qquad - (n - 1)\int \sin^n x\,dx. \end{aligned}$$

$\sin^n x$ 的积分又出现了，如例 11.6 所示。两边加上 $(n - 1)\int \sin^n x\,dx$ 并除以 $n$。
:::

```check
for N_ in range(2, 10):
    same(diff(-sin(x)**(N_ - 1)*cos(x)/N_, x) + Rational(N_ - 1, N_)*sin(x)**(N_ - 2), sin(x)**N_)
    same(diff(sin(x)**(N_ - 1), x), (N_ - 1)*sin(x)**(N_ - 2)*cos(x))
    steps(Integral(sin(x)**N_, x), -sin(x)**(N_ - 1)*cos(x) + (N_ - 1)*Integral(sin(x)**(N_ - 2)*cos(x)**2, x),
          -sin(x)**(N_ - 1)*cos(x) + (N_ - 1)*Integral(sin(x)**(N_ - 2), x) - (N_ - 1)*Integral(sin(x)**N_, x))
```

::: example 正弦的幂
求 (a) $\displaystyle\int \sin^2 x\,dx$，(b) $\displaystyle\int \sin^4 x\,dx$ 和 (c) $\displaystyle\int_0^{\pi/2} \sin^4 x\,dx$。

**(a)** 用 $n = 2$，以及 $\sin^0 x = 1$，

$$\int \sin^2 x\,dx = -\tfrac12\sin x\cos x + \tfrac12x + C.$$

**(b)** 用 $n = 4$，然后 (a)，

$$\begin{aligned} &\int \sin^4 x\,dx \\ &\quad= -\tfrac14\sin^3 x\cos x + \tfrac34\int \sin^2 x\,dx \\ &\quad= -\tfrac14\sin^3 x\cos x - \tfrac38\sin x\cos x \\ &\qquad + \tfrac38x + C. \end{aligned}$$

**(c)** 在定积分中，归约公式的第一项在积分限之间进行计算（在证明中使用定理 11.2）。在 $[0, \pi/2]$ 中，该项在两端都消失，因为 $\sin 0 = 0$, $\cos\tfrac{\pi}{2} = 0$ 和幂 $n - 1$ 至少为 1。因此，应用公式两次，

$$\begin{aligned} \int_0^{\pi/2} \sin^4 x\,dx &= \frac34\int_0^{\pi/2} \sin^2 x\,dx \\ &= \frac34\cdot\frac12\int_0^{\pi/2} 1\,dx \\ &= \frac34\cdot\frac12\cdot\frac{\pi}{2} \\ &= \frac{3\pi}{16} \approx 0.5890. \end{aligned}$$

第二行说明 $\int_0^{\pi/2} \sin^2 x\,dx = \tfrac12\cdot\tfrac{\pi}{2} = \tfrac{\pi}{4}$，如 [练习 10.12](module_10_ZH.html#ex-10-12) 通过对称性得出。

```check
antideriv(-sin(x)*cos(x)/2 + x/2, sin(x)**2, x)
steps(Integral(sin(x)**4, x), -sin(x)**3*cos(x)/4 + Rational(3, 4)*Integral(sin(x)**2, x), -sin(x)**3*cos(x)/4 - Rational(3, 8)*sin(x)*cos(x) + Rational(3, 8)*x)
antideriv(-sin(x)**3*cos(x)/4 - Rational(3, 8)*sin(x)*cos(x) + Rational(3, 8)*x, sin(x)**4, x)
for N_ in (2, 3, 4):
    same((-sin(x)**(N_ - 1)*cos(x)/N_).subs(x, pi/2) - (-sin(x)**(N_ - 1)*cos(x)/N_).subs(x, 0), 0)
steps(Integral(sin(x)**4, (x, 0, pi/2)), Rational(3, 4)*Integral(sin(x)**2, (x, 0, pi/2)), Rational(3, 4)*Rational(1, 2)*Integral(1, (x, 0, pi/2)), Rational(3, 4)*Rational(1, 2)*pi/2, 3*pi/16)
rounds(3*pi/16, '0.5890'); same(integrate(sin(x)**2, (x, 0, pi/2)), Rational(1, 2)*pi/2); same(Rational(1, 2)*pi/2, pi/4)
```
:::

## 三角积分 {#trig-integrals}

例 11.7 使用归约公式积分正弦的幂。大多数正弦和余弦幂的乘积可通过恒等式和替换更快地计算。三个恒等式完成工作。第一个是毕达哥拉斯恒等式 $\sin^2 x + \cos^2 x = 1$，来自 [模块 1](module_01_ZH.html#trig)；将其除以 $\cos^2 x$ 得到第二个恒等式 $\tan^2 x + 1 = \sec^2 x$。第三个恒等式来自模块 1 的加法公式 $\cos(x + y) = \cos x\cos y - \sin x\sin y$，其中 $y = x$：

$$\cos 2x = \cos^2 x - \sin^2 x.$$

将 $\cos^2 x$ 替换为 $1 - \sin^2 x$，或将 $\sin^2 x$ 替换为 $1 - \cos^2 x$，并求解，得到 **半角公式**

$$\begin{aligned} \sin^2 x &= \frac{1 - \cos 2x}{2}, \\ \cos^2 x &= \frac{1 + \cos 2x}{2}. \end{aligned}$$

他们用一个平方换取两倍角度的余弦，这很容易积分。同样地，正弦的加法公式给出 $\sin 2x = 2\sin x\cos x$。

```check
same(sin(x)**2 + cos(x)**2, 1); same(sin(x)**2/cos(x)**2 + 1, sec(x)**2); same(tan(x)**2 + 1, sec(x)**2)
same(expand_trig(cos(x + y)).subs(y, x), cos(x)**2 - sin(x)**2); same(cos(2*x), cos(x)**2 - sin(x)**2)
same(cos(2*x), 1 - 2*sin(x)**2); same(cos(2*x), 2*cos(x)**2 - 1)
same(sin(x)**2, (1 - cos(2*x))/2); same(cos(x)**2, (1 + cos(2*x))/2); same(sin(2*x), 2*sin(x)*cos(x))
```

### 正弦和余弦的幂 {#sin-cos}

::: keyidea
积分 $\sin^m x\cos^n x$，其中 $m$ 和 $n$ 是整数：

- 如果余弦的幂 $n$ 是奇数，保留一个因子 $\cos x$，将余下的偶次幂的余弦用正弦的 $\cos^2 x = 1 - \sin^2 x$ 表示，并进行 $u = \sin x$， $du = \cos x\,dx$ 的替换。
- 如果正弦的幂 $m$ 是奇数，保留一个因子 $\sin x$，使用 $\sin^2 x = 1 - \cos^2 x$，并进行 $u = \cos x$， $du = -\sin x\,dx$ 的替换。
- 如果两个幂都是偶数，使用半角公式，如需可重复使用，或使用定理 11.3 的降阶公式。
:::

::: example 奇数幂
求 (a) $\displaystyle\int \sin^3 x\,dx$ 和 (b) $\displaystyle\int \sin^2 x\cos^3 x\,dx$。

**(a)** 正弦的幂是奇数。保留一个 $\sin x$： $\sin^3 x = \sin^2 x\cdot\sin x = \big(1 - \cos^2 x\big)\sin x$。使用 $u = \cos x$ 和 $du = -\sin x\,dx$，

$$\begin{aligned} \int \sin^3 x\,dx &= -\int \big(1 - u^2\big)\,du \\ &= -u + \frac{u^3}{3} + C \\ &= -\cos x + \tfrac13\cos^3 x + C. \end{aligned}$$

**(b)** 余弦的幂是奇数。保留一个 $\cos x$: $\sin^2 x\cos^3 x = \sin^2 x\big(1 - \sin^2 x\big)\cos x$。使用 $u = \sin x$ 和 $du = \cos x\,dx$，

$$\begin{aligned} &\int \sin^2 x\cos^3 x\,dx \\ &\quad= \int \big(u^2 - u^4\big)\,du \\ &\quad= \tfrac13\sin^3 x - \tfrac15\sin^5 x + C. \end{aligned}$$

```check
same(sin(x)**3, (1 - cos(x)**2)*sin(x)); antideriv(-u + u**3/3, -(1 - u**2), u)
antideriv(-cos(x) + cos(x)**3/3, sin(x)**3, x)
same(sin(x)**2*cos(x)**3, sin(x)**2*(1 - sin(x)**2)*cos(x)); antideriv(u**3/3 - u**5/5, u**2 - u**4, u)
antideriv(sin(x)**3/3 - sin(x)**5/5, sin(x)**2*cos(x)**3, x)
```
:::

::: example 偶次幂
求 (a) $\displaystyle\int \cos^2 x\,dx$ 和 (b) $\displaystyle\int_0^\pi \sin^4 x\,dx$。

**(a)** 根据半角公式，并结合 模块 10 表格中的 $\int \cos 2x\,dx = \tfrac12\sin 2x + C$，

$$\begin{aligned} \int \cos^2 x\,dx &= \frac12\int (1 + \cos 2x)\,dx \\ &= \frac{x}{2} + \frac{\sin 2x}{4} + C. \end{aligned}$$

**(b)** 平方半角公式中的 $\sin^2 x$，然后再次使用 $\cos^2$ 的公式，将 $2x$ 替换 $x$：

$$\begin{aligned} \sin^4 x &= \Big(\frac{1 - \cos 2x}{2}\Big)^2 \\ &= \frac14\big(1 - 2\cos 2x + \cos^2 2x\big) \\ &= \frac14\Big(1 - 2\cos 2x + \frac{1 + \cos 4x}{2}\Big) \\ &= \frac38 - \frac12\cos 2x + \frac18\cos 4x. \end{aligned}$$

所以

$$\begin{aligned} &\int_0^\pi \sin^4 x\,dx \\ &\quad= \Big[\frac{3x}{8} - \frac{\sin 2x}{4} + \frac{\sin 4x}{32}\Big]_0^\pi \\ &\quad= \frac{3\pi}{8} \approx 1.178, \end{aligned}$$

因为所有正弦在 0 和 $\pi$ 处都为零。这等于例 11.7 中 $[0, \pi/2]$ 上找到的值 $\tfrac{3\pi}{16}$ 的两倍，正如所预期的那样：函数 $\sin^4 x$ 关于 $x = \pi/2$ 对称，因为 $\sin(\pi - x) = \sin x$。

```check
antideriv(x/2 + sin(2*x)/4, cos(x)**2, x); antideriv(sin(2*x)/2, cos(2*x), x)
steps(sin(x)**4, ((1 - cos(2*x))/2)**2, (1 - 2*cos(2*x) + cos(2*x)**2)/4, (1 - 2*cos(2*x) + (1 + cos(4*x))/2)/4, Rational(3, 8) - cos(2*x)/2 + cos(4*x)/8)
F4 = 3*x/8 - sin(2*x)/4 + sin(4*x)/32
antideriv(F4, Rational(3, 8) - cos(2*x)/2 + cos(4*x)/8, x)
same(F4.subs(x, pi) - F4.subs(x, 0), 3*pi/8); rounds(3*pi/8, '1.178'); same(3*pi/8, 2*(3*pi/16))
same(sin(pi - x), sin(x)); same(integrate(sin(x)**4, (x, 0, pi)), 3*pi/8)
```
:::

::: pitfall
三张卡片。 **(1)**$\sin^2 x$ 是 $(\sin x)^2$，不是 $\sin(x^2)$。**(2)**幂法则不适用于 $\sin^2 x$，如同 $\sin x$ 是 $x$： $\int \sin^2 x\,dx$ 不是 $\tfrac13\sin^3 x + C$，其导数是 $\sin^2 x\cos x$，根据链式法则。**(3)** $\int \cos 2x\,dx = \tfrac12\sin 2x + C$，不是 $\sin 2x + C$；且 $\cos 2x$ 不是 $2\cos x$。

```check
same(diff(sin(x)**3/3, x), sin(x)**2*cos(x)); holds(Ne(cos(2*1), 2*cos(1)))
antideriv(sin(2*x)/2, cos(2*x), x); same(diff(sin(2*x), x), 2*cos(2*x))
```
:::

### 正切与正割的幂 {#tan-sec}

对于正切和正割，导数 $(\tan x)' = \sec^2 x$ 和 $(\sec x)' = \sec x\tan x$ 的 [模块 5](module_05_ZH.html#other-trig)] 分别扮演 $\cos x$ 和 $\sin x$ 的角色，而 $\sec^2 x = 1 + \tan^2 x$ 则扮演毕达哥拉斯恒等式的作用。

::: keyidea
积分 $\tan^m x\sec^n x$，其中 $m$ 和 $n$ 是整数：

- 如果正割的幂 $n$ 是偶数且至少为 2，保留 $\sec^2 x$，将其他正割用正切的 $\sec^2 x = 1 + \tan^2 x$ 表示，并替换 $u = \tan x$、 $du = \sec^2 x\,dx$。
- 如果正切的幂 $m$ 是奇数且 $n \ge 1$，保留 $\sec x\tan x$，将其他正切用正割的 $\tan^2 x = \sec^2 x - 1$ 表示，并替换 $u = \sec x$、 $du = \sec x\tan x\,dx$。
- 否则使用恒等式，积分 $\tan x$ ([例 10.11](module_10_ZH.html#substitution)) 和 $\sec x$ (定理 11.4)，或部分 (例 11.11)。
:::

::: example 切线和正割
求 (a) $\displaystyle\int \tan^2 x\sec^4 x\,dx$，(b) $\displaystyle\int \tan^3 x\sec x\,dx$ 和 (c) $\displaystyle\int \tan^2 x\,dx$，在 $\cos x \ne 0$ 区间上。

**(a)** 正割的幂是偶数： $\tan^2 x\sec^4 x = \tan^2 x\big(1 + \tan^2 x\big)\sec^2 x$。 与 $u = \tan x$，

$$\begin{aligned} &\int \big(u^2 + u^4\big)\,du \\ &\quad= \tfrac13\tan^3 x + \tfrac15\tan^5 x + C. \end{aligned}$$

**(b)** 正切的幂是奇数： $\tan^3 x\sec x = \big(\sec^2 x - 1\big)\sec x\tan x$。 与 $u = \sec x$，

$$\int \big(u^2 - 1\big)\,du = \tfrac13\sec^3 x - \sec x + C.$$

**(c)** 没有正割，但恒等式仍然有帮助：

$$\begin{aligned} \int \tan^2 x\,dx &= \int \big(\sec^2 x - 1\big)\,dx \\ &= \tan x - x + C. \end{aligned}$$

```check
same(tan(x)**2*sec(x)**4, tan(x)**2*(1 + tan(x)**2)*sec(x)**2); antideriv(u**3/3 + u**5/5, u**2 + u**4, u)
antideriv(tan(x)**3/3 + tan(x)**5/5, tan(x)**2*sec(x)**4, x)
same(tan(x)**3*sec(x), (sec(x)**2 - 1)*sec(x)*tan(x)); antideriv(u**3/3 - u, u**2 - 1, u)
antideriv(sec(x)**3/3 - sec(x), tan(x)**3*sec(x), x)
same(tan(x)**2, sec(x)**2 - 1); antideriv(tan(x) - x, tan(x)**2, x)
```
:::

$\sec x$ 自身的积分需要一个技巧。

::: theorem 正割的积分
在 $\cos x \ne 0$ 的每一个区间上，

$$\int \sec x\,dx = \ln\abs{\sec x + \tan x} + C.$$
:::

::: proof
当 $\cos x \ne 0$， $\sec x + \tan x = \dfrac{1 + \sin x}{\cos x}$ 永远不为 0： $1 + \sin x = 0$ 将意味着 $\sin x = -1$，然后 $\cos x = 0$。 所以 $\ln\abs{\sec x + \tan x}$ 在那里可导，根据链式法则，与 $\dfrac{d}{dx}\ln\abs{w} = \dfrac{w'}{w}$ ([模块 6](module_06_ZH.html#derivative-ln))，

$$\begin{aligned} &\frac{d}{dx}\ln\abs{\sec x + \tan x} \\ &\quad= \frac{\sec x\tan x + \sec^2 x}{\sec x + \tan x} \\ &\quad= \frac{\sec x(\tan x + \sec x)}{\sec x + \tan x} = \sec x. \end{aligned}$$
:::

```check
same(sec(x) + tan(x), (1 + sin(x))/cos(x)); same(cos(x)**2, 1 - sin(x)**2); same((1 - sin(x)**2).subs(sin(x), -1), 0)   # sin x = -1 forces cos x = 0
nZ = symbols('n', integer=True); same(sin(2*nZ*pi - pi/2), -1); same(cos(2*nZ*pi - pi/2), 0)
antideriv(log(sec(x) + tan(x)), sec(x), x); antideriv(log(-(sec(x) + tan(x))), sec(x), x)    # where sec + tan > 0, and where it is < 0
steps(diff(sec(x) + tan(x), x)/(sec(x) + tan(x)), (sec(x)*tan(x) + sec(x)**2)/(sec(x) + tan(x)), sec(x))
```

证明检查公式；它并不展示任何人如何找到这个公式。这里有一种方法，带一个技巧：将被积函数乘以 1，形式为 $\dfrac{\sec x + \tan x}{\sec x + \tan x}$。然后

$$\int \sec x\,dx = \int \frac{\sec^2 x + \sec x\tan x}{\sec x + \tan x}\,dx,$$

分子是分母的导数，因此替换 $w = \sec x + \tan x$ 得到 $\int \dfrac{dw}{w} = \ln\abs{w} + C$。这种技巧来自于经验，这也是要检查每一个原函数是否正确的其中一个原因。用同样的技巧处理 $\csc x - \cot x$，其导数为 $\csc^2 x - \csc x\cot x$，在 $\sin x \ne 0$ 的每个区间上都得到 $\int \csc x\,dx = \ln\abs{\csc x - \cot x} + C$。

```check
same(sec(x)*(sec(x) + tan(x))/(sec(x) + tan(x)), (sec(x)**2 + sec(x)*tan(x))/(sec(x) + tan(x)))
same(diff(sec(x) + tan(x), x), sec(x)**2 + sec(x)*tan(x))
same(diff(csc(x) - cot(x), x), csc(x)**2 - csc(x)*cot(x)); same(csc(x)*(csc(x) - cot(x)), csc(x)**2 - csc(x)*cot(x))
same(csc(x) - cot(x), (1 - cos(x))/sin(x)); same((1 - cos(x)**2).subs(cos(x), 1), 0)    # csc - cot = 0 would need cos x = 1, so sin x = 0
antideriv(log(csc(x) - cot(x)), csc(x), x); antideriv(log(-(csc(x) - cot(x))), csc(x), x)   # where csc - cot > 0, and where it is < 0
```

::: example 正割的立方
求 $\displaystyle\int \sec^3 x\,dx$ 在 $\cos x \ne 0$ 成立的区间上。

正割的幂次是奇数，且没有正切，因此两种替换都不适用。用 $u = \sec x$ 和 $dv = \sec^2 x\,dx$ 进行分部积分，因此得到 $du = \sec x\tan x\,dx$ 和 $v = \tan x$：

$$\begin{aligned} &\int \sec^3 x\,dx \\ &\quad= \sec x\tan x - \int \sec x\tan^2 x\,dx \\ &\quad= \sec x\tan x \\ &\qquad - \int \sec x\big(\sec^2 x - 1\big)\,dx \\ &\quad= \sec x\tan x - \int \sec^3 x\,dx \\ &\qquad + \int \sec x\,dx. \end{aligned}$$

积分又出现了，如例 11.6 所示。解这个方程，并使用定理 11.4：

$$\begin{aligned} &\int \sec^3 x\,dx \\ &\quad= \tfrac12\sec x\tan x \\ &\qquad + \tfrac12\ln\abs{\sec x + \tan x} + C. \end{aligned}$$

```check
same(diff(sec(x), x), sec(x)*tan(x)); antideriv(tan(x), sec(x)**2, x)
steps(Integral(sec(x)**3, x), sec(x)*tan(x) - Integral(sec(x)*tan(x)**2, x), sec(x)*tan(x) - Integral(sec(x)*(sec(x)**2 - 1), x),
      sec(x)*tan(x) - Integral(sec(x)**3, x) + Integral(sec(x), x))
antideriv(sec(x)*tan(x)/2 + log(sec(x) + tan(x))/2, sec(x)**3, x); antideriv(sec(x)*tan(x)/2 + log(-sec(x) - tan(x))/2, sec(x)**3, x)
```
:::

## 三角换元 {#trig-substitution}

圆形的面积为半径 $r$ 时是 $\pi r^2$，模块 9 使用这个公式来计算积分，例如 $\int_0^3 \sqrt{9 - x^2}\,dx$（[练习 9.4](module_09_ZH.html#ex-9-4)）。现在积分本身就可以找到这样的面积。圆 $x^2 + y^2 = r^2$ 的上半部分是 $y = \sqrt{r^2 - x^2}$ 的图像，但模块 10 中的任何替换 $u = g(x)$ 都无法处理这个被积函数：没有与 $dx$ 相乘的因子 $g'(x)$。相反，换一种方式，将 $x$ 替换为新变量的函数。由于 $1 - \sin^2\theta = \cos^2\theta$，替换 $x = r\sin\theta$ 将 $\sqrt{r^2 - x^2}$ 转换为 $\sqrt{r^2\cos^2\theta}$，一个可以消去的平方根。

模块 10 的替换规则从右到左说明了这一点。

::: theorem 反向替换
设 $g$ 在区间 $J$ 上有连续导数。

- (a) 如果 $f$ 在包含 $g$ 所有值的区间 $J$ 上连续，那么对于所有 $\alpha$ 和 $\beta$ 在 $J$ 内，
  $$\begin{aligned} &\int_{g(\alpha)}^{g(\beta)} f(x)\,dx \\ &\quad= \int_\alpha^\beta f\big(g(\theta)\big)\,g'(\theta)\,d\theta. \end{aligned}$$
- (b) 假设 $J$ 是开集，$g$ 在 $J$ 上是一对一的，$f$ 在 $g$ 于 $J$ 上的值构成的区间 $I$ 上连续，且 $G$ 是 $f\big(g(\theta)\big)\,g'(\theta)$ 在 $J$ 上的一个原函数，则 $G\big(g^{-1}(x)\big)$ 是 $f$ 在 $I$ 上的一个原函数。
:::

::: proof
(a) 是定积分的替换法则（[定理 10.7](module_10_ZH.html#definite-substitution))，其中 $x = g(\theta)$ 从右向左读取。对于 (b)： $I$ 是开区间，因为 $g$ 在开区间 $J$ 上连续且单射。根据微积分基本定理第一部分， $f$ 在 $I$ 上有一个原函数 $F$，且根据替换法则（[定理 10.6](module_10_ZH.html#substitution))， $F\big(g(\theta)\big)$ 是 $f\big(g(\theta)\big)\,g'(\theta)$ 在 $J$ 上的原函数。因此 $G(\theta) = F\big(g(\theta)\big) + C_0$ 对于常数 $C_0$（[定理 10.1](module_10_ZH.html#antiderivatives))。对于 $x$ ∈ $I$，令 $\theta = g^{-1}(x)$：则 $G\big(g^{-1}(x)\big) = F(x) + C_0$ 是 $f$ 的原函数。
:::

```check
Fq, gq = Function('F'), Function('g')
same(diff(Fq(gq(theta)), theta), Subs(Derivative(Fq(u), u), u, gq(theta))*Derivative(gq(theta), theta))   # the chain rule behind (b)
same(integrate(sqrt(1 - x**2), (x, 0, 1)), integrate(cos(theta)*cos(theta), (theta, 0, pi/2)))   # (a), an instance: x = sin(theta)
near(N(Integral(sqrt(1 - x**2), (x, 0, 1)), 30), N(pi/4, 30), 1e-20); same(integrate(cos(theta)**2, (theta, 0, pi/2)), pi/4)
```

三种替换覆盖了形如 $\sqrt{\pm x^2 \pm a^2}$ 的三种实根。在每一行 $a > 0$ 中：

| 被积函数包含 | 代入 | 使用的恒等式 |
|---|---|---|
| $\sqrt{a^2 - x^2}$ | $x = a\sin\theta$, $-\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$ | $1 - \sin^2\theta = \cos^2\theta$ |
| $\sqrt{a^2 + x^2}$ | $x = a\tan\theta$, $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$ | $1 + \tan^2\theta = \sec^2\theta$ |
| $\sqrt{x^2 - a^2}$ | $x = a\sec\theta$, $0 \le \theta < \tfrac{\pi}{2}$ | $\sec^2\theta - 1 = \tan^2\theta$ |

$\theta$的范围执行两项任务。在其上$\cos\theta \ge 0$、$\sec\theta > 0$和$\tan\theta \ge 0$分别对应，因此平方根为$\sqrt{a^2 - x^2} = a\cos\theta$、$\sqrt{a^2 + x^2} = a\sec\theta$和$\sqrt{x^2 - a^2} = a\tan\theta$，无需绝对值符号。且在其上每个替换都是单射的，因此可从$x$恢复$\theta$：$\theta = \arcsin\dfrac{x}{a}$、$\theta = \arctan\dfrac{x}{a}$以及对于$x \ge a$为$\theta = \arccos\dfrac{a}{x}$（因为$\sec\theta = x/a$意味着$\cos\theta = a/x$）。

正割行仅覆盖 $x \ge a$。对于 $x \le -a$，取 $\tfrac{\pi}{2} < \theta \le \pi$ 代替，其中 $\sec\theta \le -1$。此时 $\tan\theta \le 0$，因此 $\sqrt{x^2 - a^2} = \abs{a\tan\theta} = -a\tan\theta$，且负号必须贯穿整个计算过程。在两种情况下 $\theta = \arccos\dfrac{a}{x}$，这在 [模块 6](module_06_ZH.html#inverse-trig) 的约定中表示 $\arcsec\dfrac{x}{a}$。通常更简单的是先写出 $x = -t$，因此 $t \ge a$。

```check
ap = symbols('a', positive=True)
same(ap**2 - (ap*sin(theta))**2, (ap*cos(theta))**2); same(ap**2 + (ap*tan(theta))**2, (ap*sec(theta))**2); same((ap*sec(theta))**2 - ap**2, (ap*tan(theta))**2)
for th_ in (-pi/2, -1, 0, Rational(1, 2), pi/2):
    holds(cos(th_) >= 0); same(sqrt(9 - (3*sin(th_))**2), 3*cos(th_)); same(asin(3*sin(th_)/3), th_)
for th_ in (Rational(-3, 2), -1, 0, 1, Rational(3, 2)):
    holds(sec(th_) > 0); near(sqrt(4 + (2*tan(th_))**2), 2*sec(th_), 1e-20); same(atan(2*tan(th_)/2), th_)
for th_ in (0, Rational(1, 2), 1, Rational(3, 2)):
    holds(tan(th_) >= 0); same(sqrt((2*sec(th_))**2 - 4), 2*tan(th_)); same(acos(2/(2*sec(th_))), th_)
for th_ in (Rational(17, 10), 2, Rational(5, 2), 3, pi):          # pi/2 < theta <= pi: x = 2 sec(theta) <= -2
    holds(sec(th_) <= -1); holds(tan(th_) <= 0); near(sqrt((2*sec(th_))**2 - 4), -2*tan(th_), 1e-25); near(acos(2/(2*sec(th_))), th_, 1e-25)
near(asec(-3), acos(-Rational(1, 3)), 1e-25); near(asec(3), acos(Rational(1, 3)), 1e-25)   # arcsec(x/a) = arccos(a/x), as in Module 6
holds(pi/2 < acos(-Rational(1, 3)) < pi)                                # x <= -a gives theta in (pi/2, pi]
```

::: example 圆和椭圆的面积
求由圆 $x^2 + y^2 = r^2$ 和椭圆 $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$ 所围成的区域的面积，其中 $r$、$a$ 和 $b$ 均为正数。

**圆。** 圆的上半部分是函数 $y = \sqrt{r^2 - x^2}$ 的图像下方区域，对于 $-r \le x \le r$，而下半部分是其在 $x$ 轴上的镜像。因此，圆的面积为 $\int_{-r}^{r} 2\sqrt{r^2 - x^2}\,dx$。将 $x = r\sin\theta$ 代入 $-\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$。则 $dx = r\cos\theta\,d\theta$，且 $\sqrt{r^2 - r^2\sin^2\theta} = \sqrt{r^2\cos^2\theta} = r\cos\theta$，因为在该区间内 $\cos\theta \ge 0$ 成立。积分限 $x = -r$ 和 $x = r$ 对应于 $\theta = -\tfrac{\pi}{2}$ 和 $\theta = \tfrac{\pi}{2}$。根据定理 11.5(a) 和例题 11.9(a)，

$$\begin{aligned} &\int_{-r}^{r} 2\sqrt{r^2 - x^2}\,dx \\ &\quad= \int_{-\pi/2}^{\pi/2} 2r\cos\theta\cdot r\cos\theta\,d\theta \\ &\quad= 2r^2\int_{-\pi/2}^{\pi/2} \cos^2\theta\,d\theta \\ &\quad= 2r^2\Big[\frac{\theta}{2} + \frac{\sin 2\theta}{4}\Big]_{-\pi/2}^{\pi/2} \\ &\quad= 2r^2\cdot\frac{\pi}{2} = \pi r^2. \end{aligned}$$

**椭圆。** 解其方程得 $y$ = $y = \pm\tfrac{b}{a}\sqrt{a^2 - x^2}$，对于 $-a \le x \le a$。同样地，椭圆内部区域的上半部分位于函数 $y = \tfrac{b}{a}\sqrt{a^2 - x^2}$ 的图像下方，下半部分是其镜像。因此，面积为 $\tfrac{b}{a}$ 乘以半径为 $a$ 的圆的面积：

$$\frac{b}{a}\int_{-a}^{a} 2\sqrt{a^2 - x^2}\,dx = \frac{b}{a}\cdot\pi a^2 = \pi ab.$$

对于 $a = b = r$ 椭圆即为圆，且 $\pi ab = \pi r^2$，正如所料。

```check
rp = symbols('r', positive=True); bp = symbols('b', positive=True)
same(diff(rp*sin(theta), theta), rp*cos(theta)); same(rp**2 - rp**2*sin(theta)**2, rp**2*cos(theta)**2)
same(rp*sin(-pi/2), -rp); same(rp*sin(pi/2), rp)
steps(Integral(2*sqrt(rp**2 - x**2), (x, -rp, rp)), Integral(2*rp*cos(theta)*rp*cos(theta), (theta, -pi/2, pi/2)), 2*rp**2*Integral(cos(theta)**2, (theta, -pi/2, pi/2)))
Fc = theta/2 + sin(2*theta)/4; antideriv(Fc, cos(theta)**2, theta)
same(2*rp**2*(Fc.subs(theta, pi/2) - Fc.subs(theta, -pi/2)), pi*rp**2); same(Fc.subs(theta, pi/2) - Fc.subs(theta, -pi/2), pi/2)
same_set(solve(Eq(x**2/ap**2 + y**2/bp**2, 1), y), [bp/ap*sqrt(ap**2 - x**2), -bp/ap*sqrt(ap**2 - x**2)])
steps(bp/ap*Integral(2*sqrt(ap**2 - x**2), (x, -ap, ap)), bp/ap*pi*ap**2, pi*ap*bp)
same((pi*ap*bp).subs({ap: rp, bp: rp}), pi*rp**2)
near(N(Integral(2*sqrt(4 - x**2), (x, -2, 2)), 30), N(4*pi, 30), 1e-20)                  # independent numerical value, r = 2
near(N(Rational(3, 2)*Integral(2*sqrt(4 - x**2), (x, -2, 2)), 30), N(pi*2*3, 30), 1e-20)   # a = 2, b = 3
same_set(solve(Eq(x**2 + y**2, rp**2), y), [sqrt(rp**2 - x**2), -sqrt(rp**2 - x**2)])   # the two halves, mirror images in the x-axis
```
:::

::: note
例 11.12 并没有从零证明一个圆盘的面积是 $\pi r^2$。它使用了正弦和余弦的导数（模块 5）。这些依赖于极限 $\sin\theta/\theta \to 1$，并且 [模块 2](module_02_ZH.html#trig-limits) 用半径为 1 的圆盘的面积 $\pi$ 证明了这个极限，该面积来自几何学。这个例子证明的是，这个单一的事实可以得出所有圆盘和所有椭圆的面积。
:::

### 回到 x 与一个三角形 {#triangle}

在不定积分中，答案以 $\theta$ 表示，必须再次以 $x$ 表示。一个直角三角形可以做到这一点。画一个角度为 $\theta$ 的直角三角形，其边满足替换条件；毕达哥拉斯定理给出第三边，其余三角函数的 $\theta$ 可以直接读出（图 11.2）。

::: figure id=fig-11-2
三个代换的参考三角形。左图：$x = a\sin\theta$ 表示 $\sin\theta = x/a$，即对边比斜边；第三边为 $\sqrt{a^2 - x^2}$，因此例如 $\cos\theta = \sqrt{a^2 - x^2}/a$ 和 $\cot\theta = \sqrt{a^2 - x^2}/x$。中图：$x = a\tan\theta$，斜边为 $\sqrt{a^2 + x^2}$。右图：$x = a\sec\theta$，即 $\cos\theta = a/x$，对边为 $\sqrt{x^2 - a^2}$。三角形展示了 $0 < \theta < \pi/2$；从中读取的公式在表格的整个范围内成立。
:::

::: example 返回 x
求 $\displaystyle\int \frac{\sqrt{9 - x^2}}{x^2}\,dx$ 对于 $0 < x < 3$。

将 $x = 3\sin\theta$ 用 $0 < \theta < \tfrac{\pi}{2}$ 替换，一对一映射到 $(0, 3)$。然后 $dx = 3\cos\theta\,d\theta$ 和 $\sqrt{9 - x^2} = 3\cos\theta$，因此

$$\begin{aligned} &\int \frac{\sqrt{9 - x^2}}{x^2}\,dx \\ &\quad= \int \frac{3\cos\theta}{9\sin^2\theta}\,3\cos\theta\,d\theta \\ &\quad= \int \cot^2\theta\,d\theta \\ &\quad= \int \big(\csc^2\theta - 1\big)\,d\theta \\ &\quad= -\cot\theta - \theta + C, \end{aligned}$$

其中$\cot^2\theta = \csc^2\theta - 1$由$\cos^2\theta + \sin^2\theta = 1$除以$\sin^2\theta$得到，$-\cot\theta$是$\csc^2\theta$的原函数（模块10的表格）。现在回到$x$，结合图11.2的左三角形和$a = 3$：$\cot\theta = \dfrac{\sqrt{9 - x^2}}{x}$和$\theta = \arcsin\dfrac{x}{3}$。根据定理11.5(b)，

$$\begin{aligned} &\int \frac{\sqrt{9 - x^2}}{x^2}\,dx \\ &\quad= -\frac{\sqrt{9 - x^2}}{x} - \arcsin\frac{x}{3} + C. \end{aligned}$$

相同的步骤，用 $-\tfrac{\pi}{2} < \theta < 0$，在 $(-3, 0)$ 得到相同的公式。通过求导验证： $-\sqrt{9 - x^2}/x$ 的导数是 $\dfrac{9}{x^2\sqrt{9 - x^2}}$（商法则，然后通分）， $-\arcsin\dfrac{x}{3}$ 的导数是 $-\dfrac{1}{\sqrt{9 - x^2}}$，它们的和是 $\dfrac{9 - x^2}{x^2\sqrt{9 - x^2}} = \dfrac{\sqrt{9 - x^2}}{x^2}$。

```check
same(diff(3*sin(theta), theta), 3*cos(theta)); same(9 - (3*sin(theta))**2, (3*cos(theta))**2)
same(3*cos(theta)/(9*sin(theta)**2)*3*cos(theta), cot(theta)**2); same(cot(theta)**2, csc(theta)**2 - 1)
antideriv(-cot(theta) - theta, csc(theta)**2 - 1, theta); antideriv(-cot(theta), csc(theta)**2, theta)
x3 = symbols('x', positive=True)
same(cot(asin(x3/3)), sqrt(9 - x3**2)/x3)
Fb = -sqrt(9 - x**2)/x - asin(x/3)
antideriv(Fb, sqrt(9 - x**2)/x**2, x)
same(diff(-sqrt(9 - x**2)/x, x), 9/(x**2*sqrt(9 - x**2))); same(diff(-asin(x/3), x), -1/sqrt(9 - x**2))
same(9/(x**2*sqrt(9 - x**2)) - 1/sqrt(9 - x**2), (9 - x**2)/(x**2*sqrt(9 - x**2))); same((9 - x**2)/(x**2*sqrt(9 - x**2)), sqrt(9 - x**2)/x**2)
```
:::

::: example 切线与正割替换法
求 (a) $\displaystyle\int \frac{dx}{\sqrt{x^2 + 4}}$ 和 (b) $\displaystyle\int \frac{\sqrt{x^2 - 4}}{x}\,dx$ 对于 $x > 2$。

**(a)** 用 $x = 2\tan\theta$ 替换为 $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$。然后 $dx = 2\sec^2\theta\,d\theta$ 和 $\sqrt{x^2 + 4} = \sqrt{4\tan^2\theta + 4} = 2\sec\theta$，因此，根据定理 11.4，

$$\begin{aligned} \int \frac{dx}{\sqrt{x^2 + 4}} &= \int \frac{2\sec^2\theta}{2\sec\theta}\,d\theta \\ &= \int \sec\theta\,d\theta \\ &= \ln\abs{\sec\theta + \tan\theta} + C_1. \end{aligned}$$

图 11.2 中间三角形，用 $a = 2$，给出 $\tan\theta = \dfrac{x}{2}$ 和 $\sec\theta = \dfrac{\sqrt{x^2 + 4}}{2}$。因此积分是

$$\begin{aligned} &\ln\Big|\frac{x + \sqrt{x^2 + 4}}{2}\Big| + C_1 \\ &\quad= \ln\big(x + \sqrt{x^2 + 4}\big) + C, \end{aligned}$$

其中 $C = C_1 - \ln 2$，绝对值符号可以去掉，因为 $x + \sqrt{x^2 + 4} > x + \abs{x} \ge 0$。同样地，对于每一个常数 $a \ne 0$，

$$\begin{aligned} &\int \frac{dx}{\sqrt{x^2 + a^2}} \\ &\quad= \ln\big(x + \sqrt{x^2 + a^2}\big) + C. \end{aligned}$$

对于 $a = 1$，这个原函数是反双曲正弦函数，即 $\operatorname{arsinh} x$，见[练习 6.10](module_06_ZH.html#ex-6-10)。

**(b)** 用 $x = 2\sec\theta$ 替换 $0 < \theta < \tfrac{\pi}{2}$，一对一映射到 $(2, \infty)$。然后 $dx = 2\sec\theta\tan\theta\,d\theta$ 和 $\sqrt{x^2 - 4} = 2\tan\theta$，因此，如例 11.10(c)，

$$\begin{aligned} &\int \frac{\sqrt{x^2 - 4}}{x}\,dx \\ &\quad= \int \frac{2\tan\theta}{2\sec\theta}\,2\sec\theta\tan\theta\,d\theta \\ &\quad= 2\int \tan^2\theta\,d\theta \\ &\quad= 2\tan\theta - 2\theta + C. \end{aligned}$$

图 11.2 的直角三角形给出 $\tan\theta = \dfrac{\sqrt{x^2 - 4}}{2}$，而 $\cos\theta = \dfrac{2}{x}$ 给出 $\theta = \arccos\dfrac{2}{x}$。因此，对于 $x > 2$，

$$\begin{aligned} &\int \frac{\sqrt{x^2 - 4}}{x}\,dx \\ &\quad= \sqrt{x^2 - 4} - 2\arccos\frac{2}{x} + C. \end{aligned}$$

```check
same(diff(2*tan(theta), theta), 2*sec(theta)**2); same(4*tan(theta)**2 + 4, (2*sec(theta))**2)
same(2*sec(theta)**2/(2*sec(theta)), sec(theta))
same(tan(atan(x/2)), x/2); same(sec(atan(x/2)), sqrt(x**2 + 4)/2)
xr = symbols('x', real=True)
same(log((xr + sqrt(xr**2 + 4))/2), log(xr + sqrt(xr**2 + 4)) - log(2))
same((sqrt(xr**2 + 4))**2 - Abs(xr)**2, 4); holds(all(v_ + sqrt(v_**2 + 4) > 0 for v_ in (-50, -3, -1, 0, 2)))
antideriv(log(x + sqrt(x**2 + 4)), 1/sqrt(x**2 + 4), x)
anz = symbols('a', real=True, nonzero=True); antideriv(log(x + sqrt(x**2 + anz**2)), 1/sqrt(x**2 + anz**2), x)
same(asinh(xr).rewrite(log), log(xr + sqrt(xr**2 + 1)))
same(diff(2*sec(theta), theta), 2*sec(theta)*tan(theta)); same((2*sec(theta))**2 - 4, (2*tan(theta))**2)
same(2*tan(theta)/(2*sec(theta))*2*sec(theta)*tan(theta), 2*tan(theta)**2); antideriv(2*tan(theta) - 2*theta, 2*tan(theta)**2, theta)
xg = symbols('x', positive=True)
same(tan(acos(2/(xg + 2))), sqrt((xg + 2)**2 - 4)/2)          # x = x_g + 2 > 2
Fsec = sqrt(x**2 - 4) - 2*acos(2/x)
same(diff(Fsec, x), x/sqrt(x**2 - 4) - 4/(x**2*sqrt(1 - 4/x**2)))
same((x**2*sqrt(1 - 4/x**2)).subs(x, xg + 2), (x*sqrt(x**2 - 4)).subs(x, xg + 2))      # for x > 2: x^2 sqrt(1 - 4/x^2) = x sqrt(x^2 - 4)
same(x/sqrt(x**2 - 4) - 4/(x*sqrt(x**2 - 4)), sqrt(x**2 - 4)/x)
antideriv(Fsec.subs(x, xg + 2), (sqrt(x**2 - 4)/x).subs(x, xg + 2), xg)
same((sqrt(x**2 - 4) - 2*acos(2/x)).diff(x).subs(x, 5), sqrt(21)/5)
```
:::

::: pitfall
四张三角替换练习题。 **(1)**忘记 $dx$ 也会变化：使用 $x = a\sin\theta$，$dx = a\cos\theta\,d\theta$，而不是 $d\theta$。**(2)**$\sqrt{\cos^2\theta} = \abs{\cos\theta}$；它只是 $\cos\theta$，因为 $\theta$ 的值域保持 $\cos\theta \ge 0$。**(3)**在定积分中，需将积分限改为 $\theta$ 的值，如例 11.12 所示，或在使用旧积分限前返回 $x$。**(4)** 含有 $x$ 项的二次函数需先配方：$\sqrt{5 - 4x - x^2} = \sqrt{9 - (x + 2)^2}$，然后 $x + 2 = 3\sin\theta$。

```check
same(9 - (x + 2)**2, 5 - 4*x - x**2); same(sqrt(cos(2*pi/3)**2), Abs(cos(2*pi/3))); holds(cos(2*pi/3) < 0)
```
:::

## 部分分式分解 {#partial-fractions}

分数相加是学校代数内容：

$$\begin{aligned} \frac{2}{x - 2} + \frac{3}{x + 1} &= \frac{2(x + 1) + 3(x - 2)}{(x - 2)(x + 1)} \\ &= \frac{5x - 4}{x^2 - x - 2}. \end{aligned}$$

左边容易积分，到 $2\ln\abs{x - 2} + 3\ln\abs{x + 1} + C$。因此右边也容易积分，只要能够反向进行加法运算。将一个有理函数写成这种更简单分数之和的过程称为分解为 **部分分式**。每一个有理函数都可以分解，当它为非正确定时，前面要加上一个多项式（下面）。

```check
steps(2/(x - 2) + 3/(x + 1), (2*(x + 1) + 3*(x - 2))/((x - 2)*(x + 1)), (5*x - 4)/(x**2 - x - 2))
antideriv(2*log(x - 2) + 3*log(x + 1), 2/(x - 2) + 3/(x + 1), x)
```

::: definition 正确与非正确的有理函数
一个有理函数 $\dfrac{P(x)}{Q(x)}$ ([模块 1](module_01_ZH.html#rational)) 是 **正确的**，如果多项式 $P$ 的次数小于 $Q$ 的次数，否则为 **非正确的**。
:::

多项式的长除法将假分式化为一个多项式与一个真分式之和：用$P$除以$Q$得到商$S$和余式$R$，它们分别是$P = SQ + R$次和$\deg R < \deg Q$次多项式，使得

$$\frac{P(x)}{Q(x)} = S(x) + \frac{R(x)}{Q(x)}.$$

多项式 $S$ 可以逐项积分；部分分式用于正确的部分。

### 不同的一次因子 {#linear-factors}

从分母为不同线性因子乘积的形式开始，例如 $x^2 - x - 2 = (x - 2)(x + 1)$，并假设你不知道上述答案。寻找常数 $A$ 和 $B$ 使得

$$\frac{5x - 4}{(x - 2)(x + 1)} = \frac{A}{x - 2} + \frac{B}{x + 1}.$$

两边同时乘以 $(x - 2)(x + 1)$：

$$5x - 4 = A(x + 1) + B(x - 2).$$

这个等式对于所有 $x$ 除 2 和 $-1$ 以外都成立，因此对于所有 $x$ 也成立，因为两边都是直线，而两条直线如果共享超过一个点，则是同一条直线。令 $x = 2$: $6 = 3A$，所以 $A = 2$。令 $x = -1$: $-9 = -3B$，所以 $B = 3$。（比较系数同样可行： $A + B = 5$ 和 $A - 2B = -4$。）

有一种快捷方法。为了找到 $A$，即 $\dfrac{1}{x - 2}$ 的系数，可以将左边分母中因子 $x - 2$ 盖住，并在剩余部分写上 $x = 2$： $\dfrac{5\cdot 2 - 4}{2 + 1} = 2$。对于 $B$，盖住 $x + 1$ 并写上 $x = -1$： $\dfrac{5(-1) - 4}{-1 - 2} = 3$。这就是 **覆盖法**。它之所以有效，是因为将分解式乘以 $x - 2$ 会得到

$$\frac{5x - 4}{x + 1} = A + B\,\frac{x - 2}{x + 1}$$

当 $x$ 趋近于 2 时；如 $x \to 2$ 所示，左侧趋近于其在 2 处的值，最后一项趋近于 0，从而得到 $A$。

```check
same(solve([Eq(6, 3*a), Eq(-9, -3*b)], [a, b]), {a: 2, b: 3}); same(solve([a + b - 5, a - 2*b + 4], [a, b]), {a: 2, b: 3})
same(expand(2*(x + 1) + 3*(x - 2)), 5*x - 4)
same(((5*x - 4)/(x + 1)).subs(x, 2), 2); same(((5*x - 4)/(x - 2)).subs(x, -1), 3)
same(expand((x - 2)*(2/(x - 2) + 3/(x + 1))), expand(2 + 3*(x - 2)/(x + 1))); limit_is(3*(x - 2)/(x + 1), x, 2, 0)
```

::: keyidea
**部分分分解的遮盖法。**若$x - r$是分母$Q(x)$中仅出现一次的因子，则$\dfrac{P(x)}{Q(x)}$分解式中$\dfrac{1}{x - r}$的系数等于将因子$x - r$遮盖后所得分式在$x = r$处的值。
:::

::: example 两个对数
求 (a) $\displaystyle\int \frac{5x - 4}{x^2 - x - 2}\,dx$ 和 (b) $\displaystyle\int \frac{dx}{x^2 - a^2}$，其中 $a \ne 0$ 是常数。

**(a)** 根据上述分解，在避开 2 和 $-1$ 的每个区间内，

$$\begin{aligned} &\int \frac{5x - 4}{x^2 - x - 2}\,dx \\ &\quad= 2\ln\abs{x - 2} + 3\ln\abs{x + 1} + C. \end{aligned}$$

**(b)** $x^2 - a^2 = (x - a)(x + a)$，由于 $a \ne 0$ 存在两个不同的因子。覆盖 $x - a$ 并代入 $x = a$：$\dfrac{1}{x - a}$ 的系数为 $\dfrac{1}{a + a} = \dfrac{1}{2a}$。覆盖 $x + a$ 并代入 $x = -a$：$\dfrac{1}{x + a}$ 的系数为 $\dfrac{1}{-a - a} = -\dfrac{1}{2a}$。因此

$$\frac{1}{x^2 - a^2} = \frac{1}{2a}\Big(\frac{1}{x - a} - \frac{1}{x + a}\Big),$$

并且对于 $x \ne \pm a$，

$$\begin{aligned} &\int \frac{dx}{x^2 - a^2} \\ &\quad= \frac{1}{2a}\big(\ln\abs{x - a} - \ln\abs{x + a}\big) + C \\ &\quad= \frac{1}{2a}\ln\Big|\frac{x - a}{x + a}\Big| + C. \end{aligned}$$

```check
same(apart((5*x - 4)/(x**2 - x - 2), x), 2/(x - 2) + 3/(x + 1))
antideriv(2*log(x - 2) + 3*log(x + 1), (5*x - 4)/(x**2 - x - 2), x); antideriv(2*log(2 - x) + 3*log(-1 - x), (5*x - 4)/(x**2 - x - 2), x)
anz = symbols('a', real=True, nonzero=True)
same((1/(x + anz)).subs(x, anz), 1/(2*anz)); same((1/(x - anz)).subs(x, -anz), -1/(2*anz))
same(1/(x**2 - anz**2), (1/(2*anz))*(1/(x - anz) - 1/(x + anz)))
antideriv(log((x - anz)/(x + anz))/(2*anz), 1/(x**2 - anz**2), x); antideriv(log(-(x - anz)/(x + anz))/(2*anz), 1/(x**2 - anz**2), x)
```
:::

当分母是不同的一次因子乘积时，该方法有效。

::: theorem 分母为不同的一次因子的分式分解
设 $Q(x) = (x - r_1)(x - r_2)\cdots(x - r_n)$，其中的数 $r_1, \dots, r_n$ 均不相同，令 $P$ 为一个次数小于 $n$ 的多项式。则存在唯一的常数 $A_1, \dots, A_n$ 使得

$$\begin{aligned} \frac{P(x)}{Q(x)} &= \frac{A_1}{x - r_1} + \frac{A_2}{x - r_2} \\ &\quad + \dots + \frac{A_n}{x - r_n} \end{aligned}$$

对于每一个 $x$（除 $r_1, \dots, r_n$ 外）均成立。每个 $A_k$ 可由覆盖法给出：

$$\begin{aligned} A_k &= \frac{P(r_k)}{Q_k(r_k)}, \quad\text{where} \\ Q_k(x) &= \frac{Q(x)}{x - r_k}. \end{aligned}$$
:::

::: proof
*存在性*。 $Q_k$ 是除去 $x - r_k$ 外的 $n - 1$ 因子的乘积，是一个次数为 $n - 1$ 的多项式，且 $Q_k(r_k) \ne 0$ 存在是因为数 $r_j$ 均不相同。定义 $A_k$ 为上述公式，考虑多项式

$$\begin{aligned} D(x) &= P(x) - A_1Q_1(x) - A_2Q_2(x) \\ &\quad - \dots - A_nQ_n(x). \end{aligned}$$

它的次数小于 $n$。在 $x = r_k$ 处，每个 $Q_j$ 与 $j \ne k$ 包含因子 $x - r_k$，因此消失，且 $D(r_k) = P(r_k) - A_kQ_k(r_k) = 0$ 由 $A_k$ 的选择决定。因此 $D$ 有 $n$ 个不同的零点 $r_1, \dots, r_n$。但次数小于 $n$ 且不是零多项式的多项式，其零点个数少于 $n$ 个（根据初等代数，每个零点 $r$ 对应一个因子 $x - r$，而 $n$ 个这样的因子会使次数至少为 $n$）。因此 $D$ 是零多项式： $P = A_1Q_1 + \dots + A_nQ_n$。用 $Q$ 除法，使用 $\dfrac{Q_k(x)}{Q(x)} = \dfrac{1}{x - r_k}$。

*唯一性*。假设常数 $A_k$ 满足方程。将其乘以 $x - r_k$：对于 $x$ 接近 $r_k$， $x \ne r_k$，

$$\frac{P(x)}{Q_k(x)} = A_k + (x - r_k)\sum_{j \ne k} \frac{A_j}{x - r_j}.$$

设 $x \to r_k$。两边在 $r_k$ 处连续，右边趋于 $A_k$，因此 $A_k = P(r_k)/Q_k(r_k)$：常数只能是公式的那些。
:::

```check
r1, r2, r3, p0, p1, p2 = symbols('r1 r2 r3 p0 p1 p2')
Pq = p2*x**2 + p1*x + p0; Qq = (x - r1)*(x - r2)*(x - r3)
Ak = [Pq.subs(x, rk)/(Qq/(x - rk)).cancel().subs(x, rk) for rk in (r1, r2, r3)]
same(cancel(Pq/Qq - sum(A_/(x - rk) for A_, rk in zip(Ak, (r1, r2, r3)))), 0)       # the decomposition, for every P of degree < 3
same((Qq/(x - r1)).cancel(), (x - r2)*(x - r3)); same(((x - r2)*(x - r3)).subs(x, r2), 0)
same(apart((x**2 + 1)/((x - 1)*(x - 2)*(x - 3)), x), Rational(1, 1)/(x - 1) - 5/(x - 2) + 5/(x - 3))   # an instance: 2/2, 5/(-1), 10/2
```

::: example 先做长除法
求 $\displaystyle\int \frac{x^3 + 2x^2 + 2x - 2}{x^2 + x - 2}\,dx$。

该分式是假分式，分子次数为3，分母次数为2，因此需要先进行多项式除法。$x^3$ 除以 $x^2$ 得到 $x$；从分子中减去 $x\big(x^2 + x - 2\big) = x^3 + x^2 - 2x$，剩余 $x^2 + 4x - 2$。接着 $x^2$ 除以 $x^2$ 得到 1；减去 $x^2 + x - 2$，剩余 $3x$。余式 $3x$ 的次数小于2，因此停止：商为 $x + 1$，余式为 $3x$，

$$\begin{aligned} &\frac{x^3 + 2x^2 + 2x - 2}{x^2 + x - 2} \\ &\quad= x + 1 + \frac{3x}{x^2 + x - 2}. \end{aligned}$$

现在 $x^2 + x - 2 = (x - 1)(x + 2)$，使用覆盖法可得系数 $\dfrac{3\cdot 1}{1 + 2} = 1$ 和 $\dfrac{3(-2)}{-2 - 1} = 2$：

$$\frac{3x}{(x - 1)(x + 2)} = \frac{1}{x - 1} + \frac{2}{x + 2}.$$

所以

$$\begin{aligned} &\int \frac{x^3 + 2x^2 + 2x - 2}{x^2 + x - 2}\,dx \\ &\quad= \frac{x^2}{2} + x + \ln\abs{x - 1} \\ &\qquad + 2\ln\abs{x + 2} + C. \end{aligned}$$

```check
Pd, Qd = x**3 + 2*x**2 + 2*x - 2, x**2 + x - 2
same(expand(Pd - x*Qd), x**2 + 4*x - 2); same(expand(x**2 + 4*x - 2 - Qd), 3*x)
same(div(Pd, Qd, x), (x + 1, 3*x)); same(Pd/Qd, x + 1 + 3*x/Qd)
same(factor(Qd), (x - 1)*(x + 2)); same((3*x/(x + 2)).subs(x, 1), 1); same((3*x/(x - 1)).subs(x, -2), 2)
same(apart(3*x/Qd, x), 1/(x - 1) + 2/(x + 2))
antideriv(x**2/2 + x + log(x - 1) + 2*log(x + 2), Pd/Qd, x); antideriv(x**2/2 + x + log(1 - x) + 2*log(-x - 2), Pd/Qd, x)
```
:::

### 重复和二次因子 {#repeated-factors}

分母可能因两种情况而复杂化：因子可能重复，如$(x - 1)^2(x + 1)$所示；而形如$x^2 + 1$的二次因子可能没有实根，因此无法分解为实线性因子。具有$p^2 < 4q$（负判别式）的二次因子$x^2 + px + q$被称为**不可约**。代数学的一个定理（本系列未加证明地使用）指出，任何具有实系数的多项式均可表示为一个常数、线性因子与不可约二次因子的乘积。（这由代数基本定理可得。）因此，下一个定理在原则上涵盖了所有真有理函数：找出$Q$的因子可能是困难的部分。

::: theorem 部分分式分解
设 $\dfrac{P(x)}{Q(x)}$ 为一个真分式函数，且 $Q$ 被分解为一个常数乘以不同的一次因子 $x - r$ 和不同的不可约二次因子 $x^2 + px + q$ 的幂次。那么 $\dfrac{P(x)}{Q(x)}$ 可以表示为以下各项的和，且各项的常数是唯一的：

- 对于 $Q$ 的每一个因子 $(x - r)^k$，对应 $k$ 的项 $\dfrac{A_1}{x - r} + \dfrac{A_2}{(x - r)^2} + \dots + \dfrac{A_k}{(x - r)^k}$；
- 对于 $Q$ 的每一个因子 $\big(x^2 + px + q\big)^m$，对应 $m$ 的项 $\dfrac{B_1x + C_1}{x^2 + px + q} + \dots + \dfrac{B_mx + C_m}{\big(x^2 + px + q\big)^m}$。
:::

定理 11.6 是指数列中每个幂次都是 1 且没有二次因子的情况；一般情况在代数课程中证明，本系列将直接使用而不加证明。为找到常数，可乘以 $Q(x)$ 并比较系数，或代入方便的 $x$ 值；覆盖法仍可给出每个线性因子最高幂次的系数。每个项随后都可以用你已知的方法进行积分：对 $x - r$ 的幂次使用幂法则或对数，对二次项则通过配方法、对数和反三角函数进行积分。（一个不可约二次幂次 $m \ge 2$ 需要三角替换。）

::: example 重复和二次因子
求 (a) $\displaystyle\int \frac{4x}{(x - 1)^2(x + 1)}\,dx$ 和 (b) $\displaystyle\int \frac{2x^2 + 4x + 4}{(x + 1)\big(x^2 + 1\big)}\,dx$。

**(a)** 根据定理 11.7，常数为 $A$、$B$ 和 $D$，

$$\begin{aligned} \frac{4x}{(x - 1)^2(x + 1)} &= \frac{A}{x - 1} + \frac{B}{(x - 1)^2} \\ &\quad + \frac{D}{x + 1}. \end{aligned}$$

覆盖法给出 $x - 1$、$B = \dfrac{4\cdot 1}{1 + 1} = 2$ 和 $D = \dfrac{4(-1)}{(-1 - 1)^2} = -1$ 的最高幂次的系数。对于 $A$，乘以分母，

$$\begin{aligned} 4x &= A(x - 1)(x + 1) \\ &\quad + B(x + 1) + D(x - 1)^2, \end{aligned}$$

并比较 $x^2$ 的系数：$0 = A + D$，因此 $A = 1$。然后

$$\begin{aligned} &\int \frac{4x}{(x - 1)^2(x + 1)}\,dx \\ &\quad= \int \Big(\frac{1}{x - 1} + \frac{2}{(x - 1)^2} \\ &\qquad - \frac{1}{x + 1}\Big)\,dx \\ &\quad= \ln\abs{x - 1} - \frac{2}{x - 1} \\ &\qquad - \ln\abs{x + 1} + C. \end{aligned}$$

**(b)** $x^2 + 1$ 是不可约的（$0^2 < 4\cdot 1$），所以

$$\frac{2x^2 + 4x + 4}{(x + 1)\big(x^2 + 1\big)} = \frac{A}{x + 1} + \frac{Bx + D}{x^2 + 1}.$$

覆盖法给出 $A = \dfrac{2 - 4 + 4}{(-1)^2 + 1} = 1$。乘以分母：$2x^2 + 4x + 4 = \big(x^2 + 1\big) + (Bx + D)(x + 1)$。比较 $x^2$ 的系数得到 $2 = 1 + B$，因此 $B = 1$，常数项给出 $4 = 1 + D$，因此 $D = 3$； $x$ 的系数一致， $4 = B + D$。所以被积函数是

$$\frac{1}{x + 1} + \frac{x}{x^2 + 1} + \frac{3}{x^2 + 1},$$

并且，用 $w = x^2 + 1$ 代入中间项，

$$\begin{aligned} &\int \frac{2x^2 + 4x + 4}{(x + 1)\big(x^2 + 1\big)}\,dx \\ &\quad= \ln\abs{x + 1} + \tfrac12\ln\big(x^2 + 1\big) \\ &\qquad + 3\arctan x + C. \end{aligned}$$

```check
Aq, Bq, Dq = symbols('A B D')
same((4*x/(x + 1)).subs(x, 1), 2); same((4*x/(x - 1)**2).subs(x, -1), -1)
same(Poly(expand(Aq*(x - 1)*(x + 1) + 2*(x + 1) - (x - 1)**2), x).coeff_monomial(x**2), Aq - 1); same(solve(Aq - 1, Aq), [1])
same(expand(1*(x - 1)*(x + 1) + 2*(x + 1) - 1*(x - 1)**2), 4*x)
same(apart(4*x/((x - 1)**2*(x + 1)), x), 1/(x - 1) + 2/(x - 1)**2 - 1/(x + 1))
antideriv(log(x - 1) - 2/(x - 1) - log(x + 1), 4*x/((x - 1)**2*(x + 1)), x); antideriv(-2/(x - 1), 2/(x - 1)**2, x)
holds(0**2 < 4*1); same(((2*x**2 + 4*x + 4)/(x**2 + 1)).subs(x, -1), 1)
same(solve(Poly(expand((x**2 + 1) + (Bq*x + Dq)*(x + 1) - (2*x**2 + 4*x + 4)), x).all_coeffs(), [Bq, Dq]), {Bq: 1, Dq: 3})
same(apart((2*x**2 + 4*x + 4)/((x + 1)*(x**2 + 1)), x), 1/(x + 1) + x/(x**2 + 1) + 3/(x**2 + 1))
antideriv(log(x**2 + 1)/2, x/(x**2 + 1), x)
antideriv(log(x + 1) + log(x**2 + 1)/2 + 3*atan(x), (2*x**2 + 4*x + 4)/((x + 1)*(x**2 + 1)), x)
```
:::

::: pitfall
四张部分分式卡片。 **(1)**未先分解。 $\dfrac{x^3}{x^2 - 1}$ 是非真分式；它等于 $x + \dfrac{x}{x^2 - 1}$，且只有第二部分具有形式 $\dfrac{A}{x - 1} + \dfrac{B}{x + 1}$。**(2)**忽略了重复因子的幂次。在例题 11.17(a) 中，形式 $\dfrac{B}{(x - 1)^2} + \dfrac{D}{x + 1}$ 未包含 $\dfrac{A}{x - 1}$ 时无解：在 $4x = B(x + 1) + D(x - 1)^2$ 中，$x^2$ 中的项给出 $D = 0$，然后 $x$ 中的项给出 $B = 4$，最后常数项说明 $0 = B + D = 4$。**(3)**一个常数分子除以不可约二次式：它必须为 $Bx + C$。**(4)** 缺少一个替换：$\displaystyle\int \frac{x^2 + 1}{x^3 + 3x}\,dx = \tfrac13\ln\abs{x^3 + 3x} + C$ 与 $u = x^3 + 3x$，无需部分分式分解。

```check
same(x**3/(x**2 - 1), x + x/(x**2 - 1)); same(apart(x/(x**2 - 1), x), 1/(2*(x - 1)) + 1/(2*(x + 1)))
same(solve(Poly(expand(Bq*(x + 1) + Dq*(x - 1)**2 - 4*x), x).all_coeffs(), [Bq, Dq]), [])
same(Poly(expand(Bq*(x + 1) + Dq*(x - 1)**2 - 4*x), x).all_coeffs(), [Dq, Bq - 2*Dq - 4, Bq + Dq])
same(diff(x**3 + 3*x, x), 3*(x**2 + 1)); antideriv(log(x**3 + 3*x)/3, (x**2 + 1)/(x**3 + 3*x), x)
```
:::

::: compute 使用 SymPy 进行部分分式
SymPy 的 `factor` 求因式，`div` 进行多项式除法，`apart` 将有理函数分解为部分分式：

```python
import sympy as sp
x = sp.symbols('x')
P = x**3 + 2*x**2 + 2*x - 2
Q = x**2 + x - 2
print(sp.factor(Q))
print(sp.div(P, Q, x))                  # (quotient, remainder)
print(sp.apart(P/Q, x))                 # Example 11.16
print(sp.apart((2*x**2 + 4*x + 4)/((x + 1)*(x**2 + 1)), x))
```

```output
(x - 1)*(x + 2)
(x + 1, 3*x)
x + 1 + 2/(x + 2) + 1/(x - 1)
(x + 3)/(x**2 + 1) + 1/(x + 1)
```

这些是 SymPy 按项顺序排列的例 11.16，以及例 11.17(b) 在最后分解前的版本。SymPy 在有理数范围内进行因式分解，因此像 $x^2 - 2$ 这样的分母，其零点 $\pm\sqrt2$ 是无理数，保持整体形式，除非你指定允许哪些数：

```python
print(sp.apart(1/(x**2 - 2), x))
print(sp.apart(1/(x**2 - 2), x, extension=sp.sqrt(2)))
```

```output
1/(x**2 - 2)
-sqrt(2)/(4*(x + sqrt(2))) + sqrt(2)/(4*(x - sqrt(2)))
```

第二个答案是例 11.15(b) 与 $a = \sqrt2$ 相关，因为 $\tfrac{1}{2\sqrt2} = \tfrac{\sqrt2}{4}$。
:::

```check
same(Rational(1, 1)/(2*sqrt(2)), sqrt(2)/4)
same(apart(1/(x**2 - 2), x, extension=sqrt(2)), (1/(2*sqrt(2)))*(1/(x - sqrt(2)) - 1/(x + sqrt(2))))
```

## 积分策略 {#strategy}

求导是机械的：模块 4 到 6 的规则可以对由模块 1 的公式库构建的任何公式进行求导。积分则不然。没有一套规则总能奏效，同一个被积函数可能适用于多种方法，而有些被积函数则可能无法求积（第 11.6 节）。你拥有的是一套工具和一个检查清单。

::: keyidea
**积分策略。**

1. **简化**被积函数：展开、约分、拆分分数、使用恒等式如 $\sin x\cos x = \tfrac12\sin 2x$ 或 $\tan^2 x = \sec^2 x - 1$。然后参阅 [第10.1节](module_10_ZH.html#table)]。
2. **替换**，如果被积函数包含一个函数及其导数，可能相差一个常数因子（[第10.7节](module_10_ZH.html#substitution)）。
3. **按形式分类** 被积函数：
   - 一个幂函数 $x$ 与 $e^{kx}$、$\sin kx$ 或 $\cos kx$ 相乘，或与 $\ln x$ 或反三角函数相乘：使用分部积分法（第11.1节）；
   - 三角函数的幂：使用恒等式和替换法（第11.2节）；
   - $\sqrt{a^2 - x^2}$、$\sqrt{a^2 + x^2}$ 或 $\sqrt{x^2 - a^2}$，可能在完成平方后：使用三角替换法（第11.3节）；
   - 有理函数：若为真分式则进行长除法，然后使用部分分式（第11.4节）；
   - 根号 $\sqrt[n]{g(x)}$：尝试 $u = \sqrt[n]{g(x)}$。
4. **再试一次**：结合方法（一个替换，然后分部积分），乘以一个巧妙形式的 1（如 $\sec x$），或将积分与你已做过的积分联系起来。如果都不行，被积函数可能没有初等原函数（第 11.6 节）：计算该积分的数值解（第 11.7 节）。
:::

::: example 方法选择
为每个积分选择一个方法并计算。

- (a) $\displaystyle\int \frac{x}{x^2 + 4}\,dx$
- (b) $\displaystyle\int e^{\sqrt x}\,dx$，对于 $x > 0$
- (c) $\displaystyle\int \frac{dx}{x^2 - 4x + 13}$
- (d) $\displaystyle\int \frac{\sqrt x}{1 + x}\,dx$，对于 $x > 0$

**(a)** 一个有理函数，但步骤 2 在前：分子是分母导数的一半。与 $u = x^2 + 4$， $du = 2x\,dx$：

$$\begin{aligned} \int \frac{x}{x^2 + 4}\,dx &= \frac12\int \frac{du}{u} \\ &= \frac12\ln\big(x^2 + 4\big) + C. \end{aligned}$$

**(b)** 一个根：令 $w = \sqrt x$，使得 $x = w^2$ 和 $dx = 2w\,dw$（定理 11.5(b)，使用单射的替换 $x = w^2$， $w > 0$）。积分变为 $2\int we^w\,dw$，一个分部积分的乘积：令 $u = w$ 和 $dv = e^w\,dw$，

$$\begin{aligned} 2\int we^w\,dw &= 2\big(we^w - e^w\big) + C \\ &= 2\big(\sqrt x - 1\big)e^{\sqrt x} + C. \end{aligned}$$

**(c)** 一个有理函数，其分母没有实数零点，因为 $(-4)^2 - 4\cdot 13 = -36 < 0$。完成平方， $x^2 - 4x + 13 = (x - 2)^2 + 9$，并使用 $\int \frac{du}{u^2 + a^2} = \frac1a\arctan\frac{u}{a} + C$（[例 10.11](module_10_ZH.html#substitution)）与 $u = x - 2$ 和 $a = 3$：

$$\begin{aligned} &\int \frac{dx}{x^2 - 4x + 13} \\ &\quad= \frac13\arctan\frac{x - 2}{3} + C. \end{aligned}$$

**(d)** 再次求根：$w = \sqrt x$, $dx = 2w\,dw$, 得到 $2\int \dfrac{w^2}{1 + w^2}\,dw$, 一个假分式。进行除法，或写成 $w^2 = (1 + w^2) - 1$:

$$\begin{aligned} &2\int \frac{w^2}{1 + w^2}\,dw \\ &\quad= 2\int \Big(1 - \frac{1}{1 + w^2}\Big)\,dw \\ &\quad= 2w - 2\arctan w + C \\ &\quad= 2\sqrt x - 2\arctan\sqrt x + C. \end{aligned}$$

```check
same(diff(x**2 + 4, x), 2*x); antideriv(log(x**2 + 4)/2, x/(x**2 + 4), x)
wq = symbols('w', positive=True)
same(diff(wq**2, wq), 2*wq); same(exp(sqrt(wq**2))*2*wq, 2*wq*exp(wq))
steps(Integral(2*wq*exp(wq), wq), 2*(wq*exp(wq) - Integral(exp(wq), wq)), 2*(wq*exp(wq) - exp(wq)))
xp2 = symbols('x', positive=True)
antideriv(2*(sqrt(xp2) - 1)*exp(sqrt(xp2)), exp(sqrt(xp2)), xp2)
same((-4)**2 - 4*13, -36); same(expand((x - 2)**2 + 9), x**2 - 4*x + 13)
antideriv(atan((x - 2)/3)/3, 1/(x**2 - 4*x + 13), x)
same(sqrt(wq**2)/(1 + wq**2)*2*wq, 2*wq**2/(1 + wq**2)); same(wq**2/(1 + wq**2), 1 - 1/(1 + wq**2))
antideriv(2*wq - 2*atan(wq), 2*wq**2/(1 + wq**2), wq)
antideriv(2*sqrt(xp2) - 2*atan(sqrt(xp2)), sqrt(xp2)/(1 + xp2), xp2)
```
:::

::: pitfall
当轻方法有效时，却去寻求重方法。$\int \dfrac{x}{x^2 + 4}\,dx$ 不需要分式分解，$\int x\sqrt{x^2 + 1}\,dx$ 也不需要三角替换：$u = x^2 + 1$ 用一行即可得到 $\tfrac13\big(x^2 + 1\big)^{3/2} + C$。在做任何事情之前，先寻找替换。

```check
antideriv((x**2 + 1)**Rational(3, 2)/3, x*sqrt(x**2 + 1), x)
```
:::

## 用计算机进行积分 {#by-computer}

如 SymPy 这样的计算机代数系统可以与本模块的方法以及处理整个积分函数族的算法相结合。模块 10 引入了 `sp.integrate`（[第 10.8 节](module_10_ZH.html#sympy)]）；此处是本模块积分的示例，考虑到模块 10 的经验：看起来不同的答案未必错误。

::: compute 本模块积分的计算机计算
```python
import sympy as sp
x = sp.symbols('x')
print(sp.integrate(x**2*sp.sin(x), x))                 # Example 11.3
print(sp.integrate(sp.exp(x)*sp.sin(x), x))            # Example 11.6
print(sp.integrate((5*x - 4)/(x**2 - x - 2), x))       # Example 11.15(a)
print(sp.integrate(1/sp.sqrt(x**2 + 4), x))            # Example 11.14(a)
print(sp.integrate(sp.sec(x), x))                      # Theorem 11.4
```

```output
-x**2*cos(x) + 2*x*sin(x) + 2*cos(x)
exp(x)*sin(x)/2 - exp(x)*cos(x)/2
2*log(x - 2) + 3*log(x + 1)
asinh(x/2)
-log(sin(x) - 1)/2 + log(sin(x) + 1)/2
```

前两个是例题 11.3 和 11.6 的答案，按照 SymPy 的项的顺序排列。第三个将 $\ln\abs{x - 2}$ 写成了 $\ln(x - 2)$，如模块 10 所解释：SymPy 的 `log` 可以处理复数，其答案在 $x > 2$ 处是正确的。第四个是 $\operatorname{arsinh}\dfrac{x}{2} = \ln\Big(\dfrac{x}{2} + \sqrt{\dfrac{x^2}{4} + 1}\Big) = \ln\big(x + \sqrt{x^2 + 4}\big) - \ln 2$，根据 [练习 6.10](module_06_ZH.html#ex-6-10)：例题 11.14 的答案减去常数 $\ln 2$。第五个看起来与 $\ln\abs{\sec x + \tan x}$ 一点也不像。在 $\cos x \ne 0$ 和 $\sin x - 1 < 0$ 处，SymPy 的 $\ln(\sin x - 1)$ 是一个复数，等于 $\ln(1 - \sin x)$ 加上常数 $\pi i$。因此，忽略常数的话，SymPy 的答案是

$$\begin{aligned} \frac12\ln\frac{1 + \sin x}{1 - \sin x} &= \frac12\ln\frac{(1 + \sin x)^2}{\cos^2 x} \\ &= \ln\abs{\sec x + \tan x}, \end{aligned}$$

其中间的步骤将分子和分母都乘以 $1 + \sin x$。再次有两个正确答案。要检查答案，可以对其进行求导：

```python
mine = sp.log(x + sp.sqrt(x**2 + 4))                   # Example 11.14(a)
print(sp.simplify(sp.diff(mine, x) - 1/sp.sqrt(x**2 + 4)))
print(sp.simplify(sp.diff(sp.log(sp.sec(x) + sp.tan(x)), x) - sp.sec(x)))
print(sp.N((mine - sp.asinh(x/2)).subs(x, 3)), sp.N(sp.log(2)))
```

```output
0
0
0.693147180559945 0.693147180559945
```

两个导数的差都是 0，例题 11.14 的答案与 SymPy 的答案在 $x = 3$ 或其他任何地方的差是 $\ln 2$。最后是一个让 SymPy 无法计算的积分，它是模块 12 中正弦曲线一段弧的长度：

```python
print(sp.integrate(sp.sqrt(1 + sp.cos(x)**2), x))
```

```output
Integral(sqrt(cos(x)**2 + 1), x)
```

SymPy 返回积分未计算：它没有找到原函数。
:::

```check
same(integrate(x**2*sin(x), x), -x**2*cos(x) + 2*x*sin(x) + 2*cos(x)); same(integrate(exp(x)*sin(x), x), exp(x)*(sin(x) - cos(x))/2)
xr2 = symbols('x', real=True)
same(asinh(xr2/2).rewrite(log), log(xr2/2 + sqrt(xr2**2/4 + 1))); same(log(xr2/2 + sqrt(xr2**2/4 + 1)), log(xr2 + sqrt(xr2**2 + 4)) - log(2))
same(log(sin(Rational(1, 3)) - 1), log(1 - sin(Rational(1, 3))) + pi*I)      # log of a negative number: ln|.| + pi i
Fsym = -log(sin(x) - 1)/2 + log(sin(x) + 1)/2                                       # SymPy's answer: up to -pi i/2, it is ln|sec x + tan x|
for v_ in (Rational(1, 2), 1, -Rational(13, 10), 2):                                # points on three intervals where cos x != 0
    near(Fsym.subs(x, v_) - log(Abs(sec(v_) + tan(v_))), -pi*I/2, 1e-25)
same((1 + sin(x))/(1 - sin(x)), (1 + sin(x))**2/cos(x)**2); same((1 + sin(x))**2/cos(x)**2, (sec(x) + tan(x))**2)
for v_ in (Rational(1, 2), 1, -Rational(13, 10)):
    near(log((1 + sin(v_))/(1 - sin(v_)))/2, log(Abs(sec(v_) + tan(v_))), 1e-25)
rounds(log(2), '0.693147180559945')
```

::: pitfall
关于计算机求得的原函数，有三点要记住。 **(1)**它省略了 "$+\,C$" 通常也省略绝对值符号，有时会使用复数对数。**(2)**一个看起来不同的答案可能是正确的：对它求导，或在某个区间内比较几个点，差值必须为相同常数。**(3)** 一个未计算的 `Integral(...)` 表示 SymPy 没有找到原函数，不表示不存在原函数；而且一个正确的答案可能非常长，以至于数值值（第 11.7 节）更有用。
:::

### 没有初等原函数的函数 {#nonelementary}

最后一个计算框的积分并不罕见。本模块示例中的大多数函数都是被选中的，因为它们的原函数可以写出来；许多在实际中出现的函数却无法用这种方式积分。

::: definition 初等函数
一个**初等函数**是一个函数，它可以通过常数和$x$经过有限次加法、减法、乘法、除法、幂运算、开方、指数、对数、三角函数与反三角函数以及这些函数的复合来构建。
:::

模块 1 目录中的每一个函数都是基本初等函数，像 $e^{-x^2}$、$\sqrt{1 + \cos^2 x}$、$\sinh x = \tfrac12\big(e^x - e^{-x}\big)$ 和 $\ln\big(x + \sqrt{x^2 + 1}\big)$ 这样的组合也是如此。基本初等函数的导数也是基本初等函数：模块 4 到 6 的规则可以产生它。但基本初等函数的原函数未必是基本初等函数。 **刘维尔定理（Liouville's theorem）** 描述了若存在初等原函数，它应该是什么样子；由此可以证明，以下函数

$$e^{-x^2}, \quad \frac{\sin x}{x}, \quad \frac{1}{\ln x}, \quad \frac{e^x}{x}, \quad \sin\big(x^2\big)$$

都没有初等原函数；同样，例 11.2 中遇到的 $e^{x^2}$ 也没有初等原函数。这个级数既不能证明刘维尔定理，也不能证明它的这些结论：这些证明需要用到本级数之外的代数知识。但它们的含义并不超出这个范围：用本模块的方法进行巧妙的尝试也无法找到这样的原函数，因为这样的原函数根本不存在。

这些函数都有原函数，而且都是一样的。每个函数在其定义域内的每个区间上都是连续的，因此根据基本定理的第一部分（[第10.4节](module_10_ZH.html#ftc1)）在这样的区间内，以 $a$ 为变量的面积函数 $\int_a^x f(t)\,dt$ 是一个原函数。其中最有用的函数有名称，它们的值以与计算器计算 $\sin x$ 和 $\ln x$ 相同的方式进行数值计算。

::: definition 由积分定义的三个函数
- **误差函数** 是 $\operatorname{erf} x = \dfrac{2}{\sqrt\pi}\displaystyle\int_0^x e^{-t^2}\,dt$，对于每个实数 $x$（模块 10）。
- 对于任意实数 $x$，**正弦积分**定义为 $\operatorname{Si} x = \displaystyle\int_0^x \frac{\sin t}{t}\,dt$。在 $t = 0$ 处将被积函数的值定义为它在该处的极限 1（见[模块 2](module_02_ZH.html#trig-limits)），使被积函数连续。
- 对$x > 1$而言，$\operatorname{Li} x = \displaystyle\int_2^x \frac{dt}{\ln t}$是**对数积分**。
:::

根据基本定理的第一部分， $(\operatorname{erf} x)' = \dfrac{2}{\sqrt\pi}e^{-x^2}$， $(\operatorname{Si} x)' = \dfrac{\sin x}{x}$ 对于 $x \ne 0$，以及 $(\operatorname{Li} x)' = \dfrac{1}{\ln x}$。图11.3显示了这三个函数，以下是前两个函数的一些值：

```valuetable
x = 0.5, 1, 2, 3
$\operatorname{erf} x$ = erf(x)
$\operatorname{Si} x$ = Si(x)
digits = 6
---
x | \operatorname{erf} x | \operatorname{Si} x
0.5 | 0.520500 | 0.493107
1 | 0.842701 | 0.946083
2 | 0.995322 | 1.60541
3 | 0.999978 | 1.84865
```

误差函数是概率论中的核心工具，其中 $e^{-x^2}$ 是正态分布的形状（模块 12）。正弦积分在信号处理和光学中出现。对数积分用于计算质数个数：不超过 $x$ 的质数个数在 $x$ 较大时接近 $\operatorname{Li} x$，即它们的比值趋于 1，当 $x \to \infty$。这就是质数定理，下面的“动手计算”部分将比较这两个函数在一百万时的值。

```check
xq = symbols('x', positive=True)
same(diff(Integral(exp(-t**2), (t, 0, x))*2/sqrt(pi), x), 2*exp(-x**2)/sqrt(pi)); same(diff(erf(x), x), 2*exp(-x**2)/sqrt(pi))
same(diff(Integral(sin(t)/t, (t, 0, x)), x), sin(x)/x); same(diff(Si(x), x), sin(x)/x); limit_is(sin(t)/t, t, 0, 1)
same(diff(Integral(1/log(t), (t, 2, xq)), xq), 1/log(xq)); same(diff(Li(x), x), 1/log(x)); same(Li(2), 0)
near(Integral(1/log(t), (t, 2, 10)).evalf(30), Li(10).evalf(30), 1e-20)
near(Integral(sin(t)/t, (t, 0, 2)).evalf(30), Si(2).evalf(30), 1e-20)
same(sinh(x), (exp(x) - exp(-x))/2)
same(integrate(exp(x**2), x), sqrt(pi)*erfi(x)/2)                      # e^{x^2}: SymPy too answers with a named non-elementary function
```

::: figure id=fig-11-3
三个没有初等原函数的被积函数（蓝色）和由它们的积分定义的原函数（橙色）。左图：$e^{-x^2}$ 和 $\int_0^x e^{-t^2}\,dt = \tfrac{\sqrt\pi}{2}\operatorname{erf} x$，它们在 $\tfrac{\sqrt\pi}{2} \approx 0.886$ 处趋于稳定。中间：$\dfrac{\sin x}{x}$ 和 $\operatorname{Si} x$，当被积函数为正时上升，为负时下降，并趋于 $\tfrac{\pi}{2} \approx 1.571$。右图：$\dfrac{1}{\ln x}$ 和 $\operatorname{Li} x$，用于 $x \ge 2$；$\operatorname{Li} x$ 持续增长，因为 $\dfrac{1}{\ln x}$ 始终为正。
:::

```check
limit_is(sqrt(pi)/2*erf(x), x, oo, sqrt(pi)/2); rounds(sqrt(pi)/2, '0.886'); limit_is(Si(x), x, oo, pi/2); rounds(pi/2, '1.571')
```

::: compute SymPy 中的特殊函数
当被要求这些原函数时，SymPy 会为它们命名：

```python
import sympy as sp
x = sp.symbols('x')
for f in [sp.exp(-x**2), sp.sin(x)/x, 1/sp.log(x), sp.exp(x)/x]:
    print(sp.integrate(f, x))
```

```output
sqrt(pi)*erf(x)/2
Si(x)
li(x)
Ei(x)
```

`Ei` 是指数积分，另一种不定积分。SymPy 的 `li` 是 $\dfrac{1}{\ln x}$ 的另一种不定积分，定义为从 0 开始的积分，在 $t = 1$ 处需要特别注意，因为 $\dfrac{1}{\ln t}$ 未定义；它与 $\operatorname{Li}$ 的区别在于常数 $\operatorname{li} 2$。小于一百万的质数个数，由 `primepi` 计算，与 $\operatorname{Li}$ 的一百万相比：

```python
print(sp.N(sp.li(2)))
print(sp.primepi(10**6), sp.N(sp.Li(10**6)))
print(sp.Integral(sp.exp(-x**2), (x, 0, 1)).evalf())
```

```output
1.04516378011749
78498 78626.5039956821
0.746824132812427
```

小于一百万的质数有 78,498 个，而 $\operatorname{Li} 10^6 \approx 78{,}627$：差异小于 0.2%。最后一行是 $\int_0^1 e^{-x^2}\,dx$，它由 `evalf` 数值计算得出，模块 9 用中点求和估计的值。
:::

```check
same(integrate(exp(-x**2), x), sqrt(pi)*erf(x)/2); same(integrate(sin(x)/x, x), Si(x)); same(integrate(1/log(x), x), li(x)); same(integrate(exp(x)/x, x), Ei(x))
same(diff(li(x), x), 1/log(x)); same(diff(Ei(x), x), exp(x)/x); same(Li(x).rewrite(li), li(x) - li(2))
rounds(li(2), '1.04516378011749'); same(primepi(10**6), 78498); rounds(Li(10**6), '78627')
holds((Li(10**6) - 78498)/78498 < Rational(2, 1000)); rounds(Integral(exp(-x**2), (x, 0, 1)).evalf(30), '0.746824132812427')
```

::: pitfall
“没有初等不定积分”并不意味着“没有不定积分”，也不妨碍你计算定积分：$\int_0^1 e^{-x^2}\,dx \approx 0.746824$ 是一个非常好的数值。微小的变化是有影响的。$\int xe^{-x^2}\,dx = -\tfrac12e^{-x^2} + C$ 和 $\int x\sin\big(x^2\big)\,dx = -\tfrac12\cos\big(x^2\big) + C$ 通过替换；没有因子 $x$，它们都没有初等不定积分。

```check
rounds(sqrt(pi)*erf(1)/2, '0.746824'); antideriv(-exp(-x**2)/2, x*exp(-x**2), x); antideriv(-cos(x**2)/2, x*sin(x**2), x)
```
:::

## 数值积分 {#numerical}

两种积分需要数值而非公式：没有初等原函数的积分，例如 $\int_0^1 e^{-x^2}\,dx$，以及仅通过测量已知的函数积分，例如每隔几秒读取的速度或功率。一个 **数值积分规则** 通过积分函数的值来计算积分。模块 9 中的中点和是其中之一，即 **中点规则**

$$M_n = \Delta x\,\big[f(\bar x_1) + f(\bar x_2) + \dots + f(\bar x_n)\big],$$

其中 $\Delta x = \tfrac{b - a}{n}$、$x_i = a + i\,\Delta x$ 和 $\bar x_i = \tfrac12(x_{i-1} + x_i)$ 是第 $i$ 个子区间（读作 "x bar i"；模块 9 中写作 $m_i$）的中点。其误差缩小得像 $\tfrac{1}{n^2}$（[第 9.3 节](module_09_ZH.html#riemann-sums)）。本节将添加两个规则，解释误差为何表现出这样的行为，并对它们进行界说。

### 梯形法则 {#trapezoidal}

在例 9.2 中，一辆汽车的速度每隔 2 秒被读取一次。左和右和分别给出了 100 米和 140 米，它们的平均值 120 米是一个更好的单一估计值。逐项平均 $L_n$ 和 $R_n$ 项得到

$$\frac{L_n + R_n}{2} = \sum_{i=1}^{n} \frac{f(x_{i-1}) + f(x_i)}{2}\,\Delta x,$$

且每一项均为一个梯形的面积：当$f$为正时，该区域为连接图$(x_{i-1}, f(x_{i-1}))$和$(x_i, f(x_i))$两点的弦下方的区域（图11.4，左侧）。除第一个和最后一个外的每个$f$值都属于两个相邻的梯形，因此合并各项可得以下规则。

::: definition 梯形法则
设 $f$ 定义在 $[a, b]$ 上，令 $n \ge 1$ 为非负整数，且 $\Delta x = \tfrac{b - a}{n}$、$x_i = a + i\,\Delta x$。使用 $n$ 个子区间的**梯形法则**为

$$\begin{aligned} T_n = \frac{\Delta x}{2}\big[&f(x_0) + 2f(x_1) \\ &+ 2f(x_2) + \dots \\ &+ 2f(x_{n-1}) + f(x_n)\big]. \end{aligned}$$

它是左和右和的平均值 $\tfrac12(L_n + R_n)$。
:::

一个规则的 **误差** 是积分减去近似值： $E_T = \int_a^b f(x)\,dx - T_n$ 和 $E_M = \int_a^b f(x)\,dx - M_n$。正误差意味着该规则低估了积分值。

```check
fT = Function('f'); dX = symbols('Delta_x', positive=True)
xs_ = [fT(k_) for k_ in range(4)]                                   # n = 3: values f(x_0), ..., f(x_3)
same(dX/2*(xs_[0] + 2*xs_[1] + 2*xs_[2] + xs_[3]), (dX*(xs_[0] + xs_[1] + xs_[2]) + dX*(xs_[1] + xs_[2] + xs_[3]))/2)
V92 = [0, 6, 11, 15, 18, 20]
same(Rational(2, 2)*(V92[0] + 2*sum(V92[1:5]) + V92[5]), 120); same((100 + 140)/Integer(2), 120)
```

::: example 对数 2 的梯形法则和中点法则
计算 $T_4$ 对于 $\displaystyle\int_1^2 \frac{dx}{x} = \ln 2$，并比较 $T_4$ 和 $M_4$ 的误差。

这里 $\Delta x = 0.25$，而 $\dfrac1x$ 取值 $1$, $\tfrac45$, $\tfrac23$, $\tfrac47$ 和 $\tfrac12$ 在 $x = 1$, 1.25, 1.5, 1.75 和 2 ([例 9.4](module_09_ZH.html#riemann-sums))。所以

$$\begin{aligned} T_4 &= \frac{0.25}{2}\Big[1 + 2\cdot\frac45 + 2\cdot\frac23 \\ &\qquad + 2\cdot\frac47 + \frac12\Big] \\ &= \frac{1171}{1680} \approx 0.69702, \end{aligned}$$

这是 例 9.4 中 $L_4 = \tfrac{319}{420}$ 和 $R_4 = \tfrac{533}{840}$ 的平均值。该例也计算出 $M_4 \approx 0.6912$，或 $0.69122$ 精确到五位小数。对于 $\ln 2 \approx 0.693147$，

$$\begin{aligned} E_T &= \ln 2 - T_4 \approx -0.00388, \\ E_M &= \ln 2 - M_4 \approx 0.00193. \end{aligned}$$

梯形法则高估，中点法则低估，且中点误差大约是梯形误差的一半。

```check
fr_ = lambda X: 1/sympify(X)
same([fr_(v_) for v_ in (1, Rational(5, 4), Rational(3, 2), Rational(7, 4), 2)], [1, Rational(4, 5), Rational(2, 3), Rational(4, 7), Rational(1, 2)])
T4 = Rational(1, 8)*(1 + 2*Rational(4, 5) + 2*Rational(2, 3) + 2*Rational(4, 7) + Rational(1, 2))
same(T4, Rational(1171, 1680)); rounds(T4, '0.69702'); same((Rational(319, 420) + Rational(533, 840))/2, T4)
M4 = Rational(1, 4)*sum(fr_(1 + (k_ + Rational(1, 2))/4) for k_ in range(4)); rounds(M4, '0.69122'); rounds(M4, '0.6912'); rounds(log(2), '0.693147')
same(M4, Rational(1, 4)*(Rational(8, 9) + Rational(8, 11) + Rational(8, 13) + Rational(8, 15)))     # Example 9.4's midpoint values
rounds(log(2) - T4, '-0.00388'); rounds(log(2) - M4, '0.00193'); holds(log(2) - T4 < 0); holds(log(2) - M4 > 0)
```
:::

更多子区间下的相同比较如下：

```valuetable
n = 4, 8, 16, 32
$E_T$ = log(2) - (1 + 2*Sum(1/(1 + i/n), (i, 1, n - 1)) + 1/2)/(2*n)
$E_M$ = log(2) - Sum(1/(1 + (i - 1/2)/n), (i, 1, n))/n
decimals = 7
---
n | E_T | E_M
4 | -0.0038766 | 0.0019273
8 | -0.0009747 | 0.0004866
16 | -0.0002440 | 0.0001220
32 | -0.0000610 | 0.0000305
```

两个模式显而易见。每次 $n$ 双倍，两个误差都约减少为原来的四分之一，如 模块 9 中对中点和的发现。并且在每个 $n$，都有 $E_T \approx -2E_M$。

```check
ET_ = lambda N_: log(2) - (1 + 2*sum(1/(1 + Rational(i_, N_)) for i_ in range(1, N_)) + Rational(1, 2))/(2*N_)
EM_ = lambda N_: log(2) - sum(1/(1 + (i_ - Rational(1, 2))/N_) for i_ in range(1, N_ + 1))/N_
for N_ in (4, 8, 16):
    holds(3.9 < N(ET_(N_)/ET_(2*N_), 20) < 4.1); holds(3.9 < N(EM_(N_)/EM_(2*N_), 20) < 4.1)
for N_ in (4, 8, 16, 32):
    holds(-2.02 < N(ET_(N_)/EM_(N_), 20) < -1.98)
```

误差的符号由图像形状决定。$\tfrac1x$ 的二阶导数为 $\tfrac{2}{x^3}$，对任意 $x > 0$ 均为正，所以图像在开区间 $(0, \infty)$ 上凹向上，该区间含 $[1, 2]$（见[第 8.4 节](module_08_ZH.html#concavity)）。图像在弦的下方，每个梯形的面积均大于曲线下相应区域的面积，所以 $T_n$ 偏大（图 11.4 左图）。对于中点法，在子区间的中点作切线。切线经过中点矩形上边的中点，并切出面积相等的两个三角形，分别位于矩形上边的一侧上方和另一侧下方。因此，矩形与切线下的梯形面积相等（图 11.4 右图）。凹向上的图像在切线上方（见[定理 8.11](module_08_ZH.html#concavity)），所以梯形在图像下方，$M_n$ 偏小。图像凹向下时，两项结论反转。如模块 9 的[练习 9.2](module_09_ZH.html#ex-9-2)所示，$M_4$ 就高估了 $\int_0^2 (4 - x^2)\,dx$。

```check
same(diff(1/x, x, 2), 2/x**3); holds(2/xp**3 > 0)                     # f'' > 0 on the open interval (0, oo)
same(diff(4 - x**2, x, 2), -2); same(Rational(43, 8) - integrate(4 - x**2, (x, 0, 2)), Rational(1, 24))   # Exercise 9.2: M_4 = 43/8 overestimates
mq, hq = symbols('m h', positive=True); fM = Function('f')
same(integrate(fM(mq) + Subs(Derivative(fM(x), x), x, mq)*(x - mq), (x, mq - hq, mq + hq)), 2*hq*fM(mq))   # the tangent trapezoid has the rectangle's area
```

::: figure id=fig-11-4
一个用于 $\int_1^2 \frac{dx}{x}$ 的两个规则中的子区间，用 $n = 1$ 使得误差可见。左图：弦下方的梯形面积为 0.75，比图下方的曲线面积 $\ln 2 \approx 0.693$ 大；曲线向上凹，位于弦下方，橙色部分为超出部分。右图：中点矩形（虚线）的面积为 $\tfrac23 \approx 0.667$，与中点处切线下方梯形的面积相同，因为它们之间的两个小三角形面积相等；曲线位于切线之上，因此矩形面积比绿色部分小。
:::

```check
same((1 + Rational(1, 2))/2, Rational(3, 4)); rounds(log(2), '0.693'); holds(Rational(3, 4) > log(2))
same(1/Rational(3, 2), Rational(2, 3)); rounds(Rational(2, 3), '0.667'); holds(Rational(2, 3) < log(2))
same(integrate(Rational(2, 3) + Rational(-4, 9)*(x - Rational(3, 2)), (x, 1, 2)), Rational(2, 3))   # the tangent at 3/2: slope -1/(3/2)^2
same(diff(1/x, x).subs(x, Rational(3, 2)), Rational(-4, 9))
```

### 误差界 {#error-bounds}

::: theorem 中点规则和梯形规则的误差界
设 $f''$ 在 $[a, b]$ 上连续，且设 $K$ 是一个数，使得对于每个 $\abs{f''(x)} \le K$ 在 $x$ 中都有 $[a, b]$。那么，对于每个 $n \ge 1$，

$$\begin{aligned} \abs{E_T} &\le \frac{K(b - a)^3}{12n^2} \quad\text{and} \\ \abs{E_M} &\le \frac{K(b - a)^3}{24n^2}. \end{aligned}$$

如果 $f''(x) \ge 0$ 对于 $x$ 中的每个 $[a, b]$ 都成立，则 $M_n \le \int_a^b f(x)\,dx \le T_n$；如果 $f''(x) \le 0$ 对于 $x$ 中的每个 $[a, b]$ 都成立，则 $T_n \le \int_a^b f(x)\,dx \le M_n$。
:::

存在这样一个 $K$： $\abs{f''}$ 在闭区间 $[a, b]$ 上连续，因此根据极值定理（[模块 3](module_03_ZH.html#evt)）在该区间上取得最大值。 上界收缩如 $\tfrac{1}{n^2}$，且 $M_n$ 的上界是 $T_n$ 的上界的一半。 一个上界只限制误差的大小，但误差本身通常遵循相同的模式：深入一步框中说明了为什么将 $n$ 加倍会使误差减少约 4 倍，也说明了 $E_T \approx -2E_M$。 它还证明了梯形法则定理的梯形部分；练习 11.12 以相同方式证明了中点法则部分。

```check
Kq, nq = symbols('K n', positive=True); aq, bq_ = symbols('a b', real=True)
same((Kq*(bq_ - aq)**3/(12*nq**2))/(Kq*(bq_ - aq)**3/(12*(2*nq)**2)), 4); same(Kq*(bq_ - aq)**3/(24*nq**2), (Kq*(bq_ - aq)**3/(12*nq**2))/2)
```

::: deeper 定理为何成立，以及因子 4 和 −2
取一个子区间 $[p, q]$，宽度为 $w = q - p$，函数为 $k(x) = \tfrac12(x - p)(q - x)$。 它在 $[p, q]$ 上至少为 0，且在两端均为 0； $k'(x) = \tfrac{p + q}{2} - x$，因此 $k'(p) = \tfrac{w}{2}$ 和 $k'(q) = -\tfrac{w}{2}$；以及 $k''(x) = -1$。 用分部积分法（定理 11.2）对 $\int_p^q k f''\,dx$ 积分两次，第一次用 $u = k$ 和 $dv = f''(x)\,dx$，第二次用 $u = k'$ 和 $dv = f'(x)\,dx$：

$$\begin{aligned} &\int_p^q k f''\,dx \\ &\quad= \big[kf'\big]_p^q - \int_p^q k'f'\,dx \\ &\quad= 0 - \big[k'f\big]_p^q + \int_p^q k''f\,dx \\ &\quad= \frac{w}{2}\big(f(p) + f(q)\big) - \int_p^q f\,dx. \end{aligned}$$

所以一个梯形的误差为

$$\begin{aligned} &\int_p^q f(x)\,dx - \frac{w}{2}\big(f(p) + f(q)\big) \\ &\quad= -\int_p^q k(x)\,f''(x)\,dx. \end{aligned}$$

**上界。** 由于 $k \ge 0$ 和 $-K \le f'' \le K$，比较定理（[定理 9.7](module_09_ZH.html#properties)）将右边夹在 $-K\int_p^q k\,dx$ 和 $K\int_p^q k\,dx$ 之间，并且 $\int_p^q k(x)\,dx = \tfrac{w^3}{12}$。因此，每个梯形的误差最多为 $\tfrac{Kw^3}{12}$。共有 $n$ 个梯形，每个梯形的宽度为 $w = \tfrac{b - a}{n}$，所以

$$\begin{aligned} \abs{E_T} &\le n\cdot\frac{K}{12}\Big(\frac{b - a}{n}\Big)^3 \\ &= \frac{K(b - a)^3}{12n^2}. \end{aligned}$$

**符号。** 如果 $f'' \ge 0$，每个 $-\int_p^q kf''\,dx$ 都不超过 0，因此 $E_T \le 0$： $T_n$ 是过估计。

**因子 4 和 $-2$。** 如果 $f''$ 在 $[p, q]$ 上几乎不变，那么一个梯形的误差接近 $-f''(p)\int_p^q k\,dx = -f''(p)\tfrac{w^3}{12}$。在子区间上累加，考虑 $w = \Delta x$，

$$\begin{aligned} E_T &\approx -\frac{\Delta x^2}{12}\sum_{i=1}^{n} f''(x_{i-1})\,\Delta x \\ &\approx -\frac{\Delta x^2}{12}\int_a^b f''(x)\,dx \\ &= -\frac{\Delta x^2}{12}\big(f'(b) - f'(a)\big), \end{aligned}$$

因为这个和是一个 $f''$ 的黎曼和。同样地，练习题 11.12(b) 的公式给出 $E_M \approx \tfrac{\Delta x^2}{24}\big(f'(b) - f'(a)\big)$。将 $\Delta x$ 二等分会使两者都除以 4，且 $E_T \approx -2E_M$。对于 $\ln 2$ 与 $n = 4$ 的情况， $f'(x) = -\tfrac{1}{x^2}$ 给出 $f'(2) - f'(1) = \tfrac34$，而这两个公式预测 $E_T \approx -0.00391$ 和 $E_M \approx 0.00195$，接近例题 11.19 中真实的 $-0.00388$ 和 $0.00193$。
:::

```check
pq_, qq_ = symbols('p q', real=True); kq = (x - pq_)*(qq_ - x)/2
same(diff(kq, x).subs(x, pq_), (qq_ - pq_)/2); same(diff(kq, x).subs(x, qq_), -(qq_ - pq_)/2); same(diff(kq, x, 2), -1)
same(kq.subs(x, pq_), 0); same(kq.subs(x, qq_), 0); same(integrate(kq, (x, pq_, qq_)), (qq_ - pq_)**3/12)
for fk in (x**5, exp(x), sin(3*x), 1/x):                  # the error formula, on instances with symbolic ends (p, q > 0 for 1/x)
    pp_, qp_ = (symbols('p q', positive=True) if fk == 1/x else (pq_, qq_))
    kk = (x - pp_)*(qp_ - x)/2
    same(integrate(fk, (x, pp_, qp_)) - (qp_ - pp_)/2*(fk.subs(x, pp_) + fk.subs(x, qp_)), -integrate(kk*diff(fk, x, 2), (x, pp_, qp_)))
same(nq*(Kq/12)*((bq_ - aq)/nq)**3, Kq*(bq_ - aq)**3/(12*nq**2))
dfp = -1/x**2; same(dfp.subs(x, 2) - dfp.subs(x, 1), Rational(3, 4))
rounds(-Rational(1, 16)/12*Rational(3, 4), '-0.00391'); rounds(Rational(1, 16)/24*Rational(3, 4), '0.00195')
```

::: example 有多少个子区间？
$n$ 至少要多大，才能使 $T_n$ 和 $M_n$ 对 $\ln 2 = \int_1^2 \frac{dx}{x}$ 的近似误差不超过 $10^{-6}$？

$f(x) = \tfrac1x$ 在 $f''(x) = \tfrac{2}{x^3}$ 上有 $[1, 2]$，它在 $x = 1$ 处为正且最大，因此取 $K = 2$。利用 $b - a = 1$，定理 11.8 保证

$$\abs{E_T} \le \frac{2}{12n^2} = \frac{1}{6n^2}.$$

这个误差不超过 $10^{-6}$ 当 $n^2 \ge \tfrac{10^6}{6} \approx 166{,}667$。由于 $408^2 = 166{,}464$ 太小，而 $409^2 = 167{,}281$ 足够大，因此 $n = 409$ 个子区间就足够了。对于中点法则， $\tfrac{1}{12n^2} \le 10^{-6}$ 需要 $n^2 \ge 83{,}334$，而 $n = 289$ 就足够了（$288^2 = 82{,}944$, $289^2 = 83{,}521$）。这些 $n$ 的值被保证足够使用；它们可能比实际需要的更大，因为在 $[1, 2]$ 的大部分区域，二阶导数远小于 $K$。

```check
same(diff(1/x, x, 2), 2/x**3); same(maximum(2/x**3, x, Interval(1, 2)), 2); holds(minimum(2/x**3, x, Interval(1, 2)) > 0)
same(diff(2/x**3, x), -6/x**4); same((2/x**3).subs(x, 1), 2); same((2/x**3).subs(x, 2), Rational(1, 4))   # decreasing, from 2 to 1/4
rounds(Rational(10**6, 6), '166667'); same(408**2, 166464); same(409**2, 167281)
holds(Rational(1, 6*408**2) > Rational(1, 10**6)); holds(Rational(1, 6*409**2) <= Rational(1, 10**6))
holds(Rational(10**6, 12) > 83333); same(288**2, 82944); same(289**2, 83521)
holds(Rational(1, 12*288**2) > Rational(1, 10**6)); holds(Rational(1, 12*289**2) <= Rational(1, 10**6))
```
:::

::: pitfall
$K$ 必须在整个区间上对 $\abs{f''}$ 进行限制：应取其最大值，而不是在某个方便点的值。对于 $K = f''(2) = \tfrac14$ 在 $\tfrac1x$ 上的 $[1, 2]$，"限制" 对 $T_4$ 来说将是 $\tfrac{1}{768} \approx 0.0013$，比实际误差 0.0039 更小。而一个限制是一个保证，而不是一个估计：真实误差可能小得多。

```check
same((2/x**3).subs(x, 2), Rational(1, 4)); same(Rational(1, 4)/(12*16), Rational(1, 768)); rounds(Rational(1, 768), '0.0013')
rounds(abs(log(2) - Rational(1171, 1680)), '0.0039'); holds(Rational(1, 768) < abs(log(2) - Rational(1171, 1680)))
```
:::

### 辛普森法则 {#simpson}

梯形法则用弦代替曲线，即通过两点的直线。通过三点的抛物线可以更贴近曲线，且其下方的面积容易计算。设 $y = Ax^2 + Bx + C$ 通过点 $(-h, y_0)$、$(0, y_1)$ 和 $(h, y_2)$，其中 $h > 0$。由于奇次项 $Bx$ 的贡献为 0，

$$\begin{aligned} \int_{-h}^{h} \big(Ax^2 + Bx + C\big)\,dx &= \frac23Ah^3 + 2Ch \\ &= \frac{h}{3}\big(2Ah^2 + 6C\big). \end{aligned}$$

三点给出 $y_0 = Ah^2 - Bh + C$、$y_1 = C$ 和 $y_2 = Ah^2 + Bh + C$，因此 $y_0 + 4y_1 + y_2 = 2Ah^2 + 6C$，且面积为

$$\frac{h}{3}\big(y_0 + 4y_1 + y_2\big).$$

这样的抛物线总是存在的：$C = y_1$, $B = \tfrac{y_2 - y_0}{2h}$ 和 $A = \tfrac{y_0 - 2y_1 + y_2}{2h^2}$（如果 $A = 0$ 是一条直线）。面积仅取决于三个高度和间距 $h$，因此对于 $x$ 轴上的任何三个等间距点，其面积都相同：将图向左右平移不会改变面积。现在将 $[a, b]$ 分成偶数 $n$ 个子区间，通过图中上方的 $x_0$, $x_1$ 和 $x_2$ 点画一条抛物线，再通过上方的 $x_2$, $x_3$ 和 $x_4$ 点画另一条抛物线，依此类推，然后将这些抛物线下方的面积相加（图 11.5，左图）。

```check
Ap, Bp, Cp, hp, y0p, y1p, y2p = symbols('A B C h y_0 y_1 y_2'); par = Ap*x**2 + Bp*x + Cp
steps(Integral(par, (x, -hp, hp)), Rational(2, 3)*Ap*hp**3 + 2*Cp*hp, hp/3*(2*Ap*hp**2 + 6*Cp))
same(par.subs(x, -hp) + 4*par.subs(x, 0) + par.subs(x, hp), 2*Ap*hp**2 + 6*Cp)
same(solve([par.subs(x, -hp) - y0p, par.subs(x, 0) - y1p, par.subs(x, hp) - y2p], [Ap, Bp, Cp]), {Ap: (y0p - 2*y1p + y2p)/(2*hp**2), Bp: (y2p - y0p)/(2*hp), Cp: y1p})
cs_ = symbols('c_s')
same(integrate(par.subs(x, x - cs_), (x, cs_ - hp, cs_ + hp)), integrate(par, (x, -hp, hp)))   # sliding sideways
```

::: definition 辛普森法则
设 $n$ 为偶函数，$\Delta x = \tfrac{b - a}{n}$ 和 $x_i = a + i\,\Delta x$。**辛普森法则** 用 $n$ 个子区间是

$$\begin{aligned} S_n = \frac{\Delta x}{3}\big[&f(x_0) + 4f(x_1) + 2f(x_2) \\ &+ 4f(x_3) + \dots + 2f(x_{n-2}) \\ &+ 4f(x_{n-1}) + f(x_n)\big]. \end{aligned}$$
:::

系数遵循模式 $1, 4, 2, 4, 2, \dots, 4, 1$：每个奇数索引的点是两个子区间的中点，权重为 4；每个偶数索引的内部点被两个相邻的点对共享，权重为 $1 + 1 = 2$。误差为 $E_S = \int_a^b f(x)\,dx - S_n$。

```check
fS = Function('f')
pairs_ = sum(dX/3*(fS(2*j_) + 4*fS(2*j_ + 1) + fS(2*j_ + 2)) for j_ in range(3))      # n = 6: three parabolas
same(pairs_, dX/3*(fS(0) + 4*fS(1) + 2*fS(2) + 4*fS(3) + 2*fS(4) + 4*fS(5) + fS(6)))
```

::: example 计算 ln 2 的辛普森法则
计算 $S_4$ 对于 $\displaystyle\int_1^2 \frac{dx}{x}$。

使用 $\Delta x = 0.25$ 以及例 11.19 中使用的 $\tfrac1x$ 的值，

$$\begin{aligned} S_4 &= \frac{0.25}{3}\Big[1 + 4\cdot\frac45 + 2\cdot\frac23 \\ &\qquad + 4\cdot\frac47 + \frac12\Big] \\ &= \frac{1747}{2520} \approx 0.693254. \end{aligned}$$

其误差为 $E_S = \ln 2 - S_4 \approx -0.000107$，约为 $T_4$ 的误差的 36 倍更小，来自相同的五个 $f$ 值。

辛普森法则实际上是另外两种方法的加权平均。 $S_{2n}$ 的点是 $T_n$ 的点加上 $M_n$ 所使用的中点，将项分组后可以看出这一点。

$$S_{2n} = \frac{T_n + 2M_n}{3}.$$

此处，使用 $T_2 = \tfrac{17}{24}$ 和 $M_2 = \tfrac{24}{35}$，得到 $\tfrac13\big(\tfrac{17}{24} + \tfrac{48}{35}\big) = \tfrac{1747}{2520} = S_4$。由于 $E_T \approx -2E_M$，权重 1 和 2 使两种误差几乎相互抵消。

```check
S4 = Rational(1, 12)*(1 + 4*Rational(4, 5) + 2*Rational(2, 3) + 4*Rational(4, 7) + Rational(1, 2))
same(S4, Rational(1747, 2520)); rounds(S4, '0.693254'); rounds(log(2) - S4, '-0.000107')
rounds((log(2) - Rational(1171, 1680))/(log(2) - S4), '36')
T2 = Rational(1, 4)*(1 + 2*Rational(2, 3) + Rational(1, 2)); M2 = Rational(1, 2)*(fr_(Rational(5, 4)) + fr_(Rational(7, 4)))
same(T2, Rational(17, 24)); same(M2, Rational(24, 35)); same((T2 + 2*M2)/3, S4); same(Rational(17, 24) + Rational(48, 35), 3*S4)
nS = 3; hS = symbols('h', positive=True)                       # S_2n = (T_n + 2 M_n)/3 for n = 3, any f and spacing
Tn_ = hS/2*(fS(0) + 2*fS(2) + 2*fS(4) + fS(6)); Mn_ = hS*(fS(1) + fS(3) + fS(5))     # f(k) = f at a + k h/2
S2n_ = (hS/2)/3*(fS(0) + 4*fS(1) + 2*fS(2) + 4*fS(3) + 2*fS(4) + 4*fS(5) + fS(6))
same(S2n_, (Tn_ + 2*Mn_)/3)
```
:::

一种为抛物线精确的规则，结果发现它对更多函数也精确。

::: theorem 辛普森法则对三次多项式精确
如果 $f$ 是次数不超过 3 的多项式，则 $S_n = \int_a^b f(x)\,dx$ 对于每个偶数 $n$ 都成立。
:::

::: proof
$S_n$ 对子区间成对地应用规则，积分也对它们进行求和，因此只需证明该规则在一个子区间对上是精确的，$[m - h, m + h]$。将 $x = m + s$ 代入并展开幂次 $(m + s)^k$，将 $f$ 写成 $c_0 + c_1(x - m) + c_2(x - m)^2 + c_3(x - m)^3$，其中常数为 $c_j$。部分 $c_0 + c_1(x - m) + c_2(x - m)^2$ 是一个抛物线或一条直线，因此根据构造，该规则对其积分是精确的。对于 $(x - m)^3$，在 $[m - h, m + h]$ 上的积分等于 0，因为该函数关于 $m$ 是奇函数；并且该规则也给出 $\tfrac{h}{3}\big((-h)^3 + 4\cdot 0 + h^3\big) = 0$。积分和规则都是线性的（函数和的积分等于积分的和，常数因子可以提出来），因此该规则在 $f$ 上是精确的。
:::

```check
c0_, c1_, c2_, c3_ = symbols('c0:4'); cub = c0_ + c1_*(x - mq) + c2_*(x - mq)**2 + c3_*(x - mq)**3
same(integrate(cub, (x, mq - hq, mq + hq)), hq/3*(cub.subs(x, mq - hq) + 4*cub.subs(x, mq) + cub.subs(x, mq + hq)))
same(integrate((x - mq)**3, (x, mq - hq, mq + hq)), 0); same(hq/3*((-hq)**3 + 4*0 + hq**3), 0)
same(expand((mq + s)**3), mq**3 + 3*mq**2*s + 3*mq*s**2 + s**3)
```

Simpson规则的误差界涉及第四导数 $f^{(4)}$。

::: theorem Simpson规则的误差界
设 $f^{(4)}$ 在 $[a, b]$ 上连续，且设 $K$ 是一个数，使得对于每个 $x$ 在 $[a, b]$ 中，都有 $\abs{f^{(4)}(x)} \le K$。那么，对于每个偶数 $n$，

$$\abs{E_S} \le \frac{K(b - a)^5}{180n^4}.$$
:::

该证明使用了“深入一步”框中的思想，但进行了更长的计算，此处省略。该界值与定理 11.9 一致：对于三次多项式，$f^{(4)} = 0$，因此 $K = 0$，误差为 0。它收缩得像 $\tfrac{1}{n^4}$：将 $n$ 双倍，误差就减少为 $2^4 = 16$，而对于光滑的 $f$，误差本身通常也会减少约相同的因子，如下面的“动手计算”框所示。对于 $\ln 2$，$f^{(4)}(x) = \tfrac{24}{x^5} \le 24$ 在 $[1, 2]$ 上，且 $\tfrac{24}{180n^4} \le 10^{-6}$ 需要 $n^4 \ge 133{,}334$，即 $n \ge 19.11$。当 $n$ 为偶数时，$n = 20$ 足够：二十个子区间，而梯形法则需要 409 个。

```check
same(diff(1/x, x, 4), 24/x**5); same(maximum(24/x**5, x, Interval(1, 2)), 24); same(diff(24/x**5, x), -120/x**6); same((24/x**5).subs(x, 1), 24)
same(Kq*(bq_ - aq)**5/(180*nq**4)/(Kq*(bq_ - aq)**5/(180*(2*nq)**4)), 16)
holds(Rational(24*10**6, 180) > 133333); rounds(Rational(24*10**6, 180)**Rational(1, 4), '19.11')
holds(Rational(24, 180*20**4) <= Rational(1, 10**6)); holds(Rational(24, 180*18**4) > Rational(1, 10**6))
```

::: compute 三个规则并排
每个规则只用了几行 Python 代码。测试积分 $\int_0^1 e^{-x^2}\,dx$ 没有初等原函数，但 Python 的 `math.erf` 可以给出其值 $\tfrac{\sqrt\pi}{2}\operatorname{erf} 1$，精确到约 16 位有效数字：

```python
import math

def midpoint(f, a, b, n):
    dx = (b - a)/n
    return dx*sum(f(a + (i + 0.5)*dx) for i in range(n))

def trapezoid(f, a, b, n):
    dx = (b - a)/n
    return dx*(f(a)/2 + sum(f(a + i*dx) for i in range(1, n)) + f(b)/2)

def simpson(f, a, b, n):                    # n must be even
    dx = (b - a)/n
    inner = sum((4 if i % 2 else 2)*f(a + i*dx) for i in range(1, n))
    return dx/3*(f(a) + inner + f(b))
```

现在误差随着 $n$ 倍增，每个误差与下一个误差的比值：

```python
f = lambda x: math.exp(-x**2)
exact = math.sqrt(math.pi)/2*math.erf(1)        # the integral from 0 to 1
ns = [4, 8, 16, 32, 64]
rules = {'M': midpoint, 'T': trapezoid, 'S': simpson}
err = {r: [exact - rule(f, 0, 1, n) for n in ns] for r, rule in rules.items()}
print('  n        E_M        E_T        E_S')
for k, n in enumerate(ns):
    print(f'{n:3d}' + ''.join(f'{err[r][k]:11.2e}' for r in rules))
for r in rules:
    print(r, [round(err[r][k - 1]/err[r][k], 2) for k in range(1, len(ns))])
```

```output
  n        E_M        E_T        E_S
  4  -1.92e-03   3.84e-03  -3.12e-05
  8  -4.79e-04   9.59e-04  -1.99e-06
 16  -1.20e-04   2.40e-04  -1.25e-07
 32  -2.99e-05   5.99e-05  -7.79e-09
 64  -7.48e-06   1.50e-05  -4.87e-10
M [4.01, 4.0, 4.0, 4.0]
T [4.01, 4.0, 4.0, 4.0]
S [15.72, 15.95, 15.99, 16.0]
```

中点和梯形误差在每次区间数加倍时减少为原来的四分之一，辛普森法则减少为接近十六分之一，正如定理11.8和11.10中的界所示。使用16个子区间时，辛普森法则已经接近$2 \times 10^{-7}$，比使用64个子区间的梯形法则更精确。中点法则在此处高估，因为$e^{-x^2}$的图像在$\big(-\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}\big)$上是凹向下的，该区间覆盖了$[0, 1]$的大部分（更准确地说，是因为$f'(1) - f'(0) = -\tfrac{2}{e}$在“深入一步”框的估计中为负）；以及$E_T \approx -2E_M$再次出现。
:::

```check
fg_ = lambda X: exp(-sympify(X)**2)
def Mq_(f_, a_, b_, n_):
    d_ = (sympify(b_) - a_)/n_; return d_*sum(f_(a_ + (i_ + Rational(1, 2))*d_) for i_ in range(n_))
def Tq_(f_, a_, b_, n_):
    d_ = (sympify(b_) - a_)/n_; return d_*(f_(a_)/2 + sum(f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_)/2)
def Sq_(f_, a_, b_, n_):
    d_ = (sympify(b_) - a_)/n_; return d_/3*(f_(a_) + sum((4 if i_ % 2 else 2)*f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_))
Jg = sqrt(pi)/2*erf(1)
eM = [N(Jg - Mq_(fg_, 0, 1, n_), 30) for n_ in (4, 8, 16, 32, 64)]
eT = [N(Jg - Tq_(fg_, 0, 1, n_), 30) for n_ in (4, 8, 16, 32, 64)]
eS = [N(Jg - Sq_(fg_, 0, 1, n_), 30) for n_ in (4, 8, 16, 32, 64)]
for k_ in range(4):
    holds(3.9 < eM[k_]/eM[k_ + 1] < 4.1); holds(3.9 < eT[k_]/eT[k_ + 1] < 4.1); holds(15.5 < eS[k_]/eS[k_ + 1] < 16.1)
holds(abs(eS[2]) < 2e-7); holds(abs(eS[2]) < abs(eT[4])); holds(all(e_ < 0 for e_ in eM))
for k_ in range(5):
    holds(-2.1 < eT[k_]/eM[k_] < -1.9)
holds((diff(exp(-x**2), x, 2)).subs(x, Rational(7, 10)) < 0); same(solve(diff(exp(-x**2), x, 2), x), [-sqrt(2)/2, sqrt(2)/2])
same(diff(exp(-x**2), x, 2), (4*x**2 - 2)*exp(-x**2)); same(solve_univariate_inequality(4*x**2 - 2 < 0, x, relational=False), Interval.open(-1/sqrt(2), 1/sqrt(2)))
holds(1/sqrt(2) > Rational(7, 10))                                     # concave down on more than 70% of [0, 1]
same(diff(exp(-x**2), x).subs(x, 1) - diff(exp(-x**2), x).subs(x, 0), -2/E); holds(-2/E < 0)
```

::: figure id=fig-11-5
辛普森法则。左图：利用$n = 4$，两条抛物线（紫色，虚线），每条穿过$f(x) = 1 + \tfrac12\sin 2x + \tfrac{x}{4}$（蓝色）图像的三点，在$[0, 4]$上替代原图像；它们下方的阴影区域之和为$S_4$。右图：三种规则对$\int_0^1 e^{-x^2}\,dx$相对于$n$的误差大小，在对数刻度上，其中幂$C/n^p$是一条斜率为$-p$的直线。中点和梯形法的误差沿斜率为$-2$的直线分布，辛普森法的误差沿斜率为$-4$的直线分布。
:::

::: widget name=riemann-sums
在$[0, 1]$上选择$e^x$，梯形法则和$n = 4$：阴影梯形紧贴曲线，且$T_4 \approx 1.72722$略大于积分$e - 1 \approx 1.71828$。按**“n加倍”**三次。表格将每次$n$的误差及每次误差与下一次误差的比率保持在接近4。切换到中点法则，将$n$移回4并执行相同操作：在每次$n$处，误差约为梯形法则的一半，符号相反，且比率再次接近4。然后对辛普森法则执行相同操作：紫色曲线为抛物线，且比率接近16。完成两个实验。选择**“输入你自己的”**，在$[0, 2]$上保持$x^3 - x$并选择辛普森法则：对于每个偶数$n$，误差为0（在舍入误差范围内）（定理11.9）。并在$[0, 1]$上选择$\sqrt x$，使用辛普森法则，再次加倍$n$：比率仅为约2.8，因为$\sqrt x$的导数在0附近无界，且定理11.10不适用。
:::

```check
Tw = Rational(1, 8)*(exp(0) + 2*(exp(Rational(1, 4)) + exp(Rational(1, 2)) + exp(Rational(3, 4))) + E)
rounds(Tw, '1.72722'); rounds(E - 1, '1.71828'); holds(Tw > E - 1)
Mw = Rational(1, 4)*sum(exp((k_ + Rational(1, 2))/4) for k_ in range(4)); holds(-0.55 < (E - 1 - Mw)/(E - 1 - Tw) < -0.45)
eWT = [N(E - 1 - Tq_(exp, 0, 1, n_), 30) for n_ in (4, 8, 16, 32)]; eWM = [N(E - 1 - Mq_(exp, 0, 1, n_), 30) for n_ in (4, 8, 16, 32)]
eWS = [N(E - 1 - Sq_(exp, 0, 1, n_), 30) for n_ in (4, 8, 16, 32)]
for k_ in range(3):                                                    # e^x on [0, 1]: the ratios the widget shows
    holds(3.9 < eWT[k_]/eWT[k_ + 1] < 4.1); holds(3.9 < eWM[k_]/eWM[k_ + 1] < 4.1); holds(15.5 < eWS[k_]/eWS[k_ + 1] < 16.5)
for k_ in range(4):
    holds(-0.55 < eWM[k_]/eWT[k_] < -0.45)                             # at each n, about half the trapezoidal error, opposite sign
same(Sq_(lambda X: sympify(X)**3 - sympify(X), 0, 2, 4), integrate(x**3 - x, (x, 0, 2)))
eR = [N(Rational(2, 3) - Sq_(lambda X: sqrt(sympify(X)), 0, 1, n_), 30) for n_ in (4, 8, 16, 32)]
for k_ in range(3):
    holds(2.7 < eR[k_]/eR[k_ + 1] < 2.9)
```

### 使用哪种规则 {#which-rule}

- **一个由公式给出的光滑函数。**辛普森法则，或库中的子程序。加倍 $n$ 是一个实用的检查方法：对于辛普森法则，$S_{2n}$ 的误差约为 $\tfrac{1}{15}(S_{2n} - S_n)$，因为 $S_{2n} - S_n = E_S(n) - E_S(2n) \approx 16E_S(2n) - E_S(2n)$。库中的子程序更进一步：它们使用**自适应** 规则，仅在被积函数变化较快的区间内不断将子区间减半。该控件通过这种方式计算积分的准确值，使用辛普森法则。
- **测量数据。** 等间距时间点的读数适合使用梯形法则，或当区间数为偶数时使用辛普森法则；中点法则需要中点处的值，而这些值你通常没有。不等间距的读数则逐个区间地作为梯形来累加。
- **一个拐点或无限斜率。** 误差界需要一个有界的 $f''$ 或 $f^{(4)}$。对于 $\sqrt x$ 在 $[0, 1]$ 上， $\big(\sqrt x\big)'' = -\tfrac14x^{-3/2}$ 在 0 附近无界，且将 $n$ 乘以 2 仅会使辛普森法则的误差减少约 2.8 倍，而不是 16 倍。在拐点处分割区间，或通过替换去除问题： $x = t^2$ 将 $\int_0^1 \sqrt x\,dx$ 转换为 $\int_0^1 2t^2\,dt$，辛普森法则可对其进行精确积分。
- **非常多子区间。** 每个 $f$ 的值都会产生约 $10^{-16}$ 的舍入误差（模块 2），将数百万个这样的值相加可能会累积这些误差。使用一个适中的 $n$ 的良好规则既更快又更准确。

```check
Ee = symbols('E_e')
same((16*Ee - Ee)/15, Ee)
same(diff(sqrt(x), x, 2), -x**Rational(-3, 2)/4)
tq = symbols('t', positive=True); same(sqrt(tq**2)*diff(tq**2, tq), 2*tq**2); same(integrate(2*tq**2, (tq, 0, 1)), Rational(2, 3)); same(integrate(sqrt(x), (x, 0, 1)), Rational(2, 3))
same(Sq_(lambda X: 2*sympify(X)**2, 0, 1, 2), Rational(2, 3))
```

::: pitfall
三张卡片，关于辛普森法则。 **(1)**使用的子区间数必须是偶数：五次读数产生四个区间，可以使用；六次读数产生五个区间，不能使用（可使用梯形法则，或在四个区间上使用辛普森法则，最后一个区间使用梯形法则）。**(2)**权重为 $1, 4, 2, 4, \dots, 2, 4, 1$，起始和结束为 1，两侧分别邻接 4。**(3)** 前面的系数为 $\tfrac{\Delta x}{3}$，而不是 $\tfrac{\Delta x}{2}$，如梯形法则中所示。
:::

## 你所学到的内容 {#summary}

- **分部积分** 反转乘积法则： $\int u\,dv = uv - \int v\,du$，且 $\int_a^b f g'\,dx = \big[fg\big]_a^b - \int_a^b f'g\,dx$ 对于定积分。选择 $u$ 使得其导数更简单（LIATE 是一个粗略的指导原则），并选择 $dv$ 使得其可积。重复使用，将各轮整理成表格，解出一个返回的积分（$\int e^x\sin x\,dx$），或推导出一个降阶公式（$\int \sin^n x\,dx$）。
- **三角积分**: 对于 $\sin^m x\cos^n x$，保留一个奇次幂因子并进行替换，或使用半角恒等式 $\sin^2 x = \tfrac12(1 - \cos 2x)$ 和 $\cos^2 x = \tfrac12(1 + \cos 2x)$；对于 $\tan^m x\sec^n x$，保留 $\sec^2 x$ 或 $\sec x\tan x$. $\int \sec x\,dx = \ln\abs{\sec x + \tan x} + C$.
- **三角代换**：$x = a\sin\theta$、$a\tan\theta$或$a\sec\theta$消去$\sqrt{a^2 - x^2}$、$\sqrt{a^2 + x^2}$或$\sqrt{x^2 - a^2}$；在$\theta$的表格范围内，平方根无需绝对值符号（正割行对应$x \ge a$），且利用直角三角形可将答案转换回$x$。它给出了圆盘面积$\pi r^2$和椭圆面积$\pi ab$。
- **部分分式**: 如果有理函数是不正确的，先进行除法；然后将其写成 $\dfrac{A}{(x - r)^j}$ 和 $\dfrac{Bx + C}{(x^2 + px + q)^j}$ 的和。覆盖法找出不同线性因子的系数，因为乘以 $x - r$ 并令 $x \to r$ 可以将它们孤立出来。
- **策略**: 简化、替换、分类（分部积分、三角替换、替换、部分分式、根式），再试一次。通过对每个不定积分进行求导来检查其正确性。
- **通过计算机**：SymPy 的不定积分可能与你的结果相差一个常数，可能省略绝对值或使用复数对数；通过求导来验证。**初等** 函数未必有初等不定积分：根据刘维尔定理（此处引用，不证明）$e^{-x^2}$，$\tfrac{\sin x}{x}$ 和 $\tfrac{1}{\ln x}$ 均无初等不定积分，它们的不定积分用积分符号命名：$\operatorname{erf}$，$\operatorname{Si}$，$\operatorname{Li}$。
- **数值积分**：中点法则 $M_n$，梯形法则 $T_n = \tfrac12(L_n + R_n)$ 和辛普森法则 $S_n$（$n$ 偶数，权重 $1, 4, 2, \dots, 4, 1$）。与 $\abs{f''} \le K$， $\abs{E_T} \le \tfrac{K(b - a)^3}{12n^2}$ 和 $\abs{E_M} \le \tfrac{K(b - a)^3}{24n^2}$；与 $\abs{f^{(4)}} \le K$， $\abs{E_S} \le \tfrac{K(b - a)^5}{180n^4}$。加倍 $n$ 会将误差约减少为 4， 4 和 16；辛普森法则对三次多项式精确；曲率给出 $E_T$ 和 $E_M$ 的符号。

## 练习 {#exercises}

:::: exercise 分部积分法 {#ex-11-1} ★
求：

- (a) $\displaystyle\int x\sin 2x\,dx$
- (b) $\displaystyle\int x^2\ln x\,dx$，对于 $x > 0$
- (c) $\displaystyle\int_0^1 xe^{-x}\,dx$，精确和保留四位小数

::: solution
**(a)** $u = x$， $dv = \sin 2x\,dx$，因此 $du = dx$ 和 $v = -\tfrac12\cos 2x$：

$$\begin{aligned} &\int x\sin 2x\,dx \\ &\quad= -\tfrac12x\cos 2x \\ &\qquad + \tfrac12\int \cos 2x\,dx \\ &\quad= -\tfrac12x\cos 2x + \tfrac14\sin 2x + C. \end{aligned}$$

**(b)** 由 LIATE， $u = \ln x$ 和 $dv = x^2\,dx$，因此 $du = \dfrac{dx}{x}$ 和 $v = \dfrac{x^3}{3}$：

$$\begin{aligned} &\int x^2\ln x\,dx \\ &\quad= \frac{x^3}{3}\ln x - \int \frac{x^3}{3}\cdot\frac{1}{x}\,dx \\ &\quad= \frac{x^3}{3}\ln x - \frac{x^3}{9} + C. \end{aligned}$$

另一种选择， $u = x^2$ 和 $dv = \ln x\,dx$，需要 $v = x\ln x - x$（例 11.1(b)），并且新的积分 $\int 2x(x\ln x - x)\,dx = 2\int x^2\ln x\,dx - 2\int x^2\,dx$ 包含原积分。如例 11.6 所示求解，得到相同答案，但需要更多步骤。

**(c)** 例 11.1(a) 给出原函数 $-xe^{-x} - e^{-x} = -(x + 1)e^{-x}$，因此

$$\begin{aligned} \int_0^1 xe^{-x}\,dx &= \big[-(x + 1)e^{-x}\big]_0^1 \\ &= -2e^{-1} + 1 \\ &= 1 - \frac{2}{e} \approx 0.2642. \end{aligned}$$

```check
antideriv(-cos(2*x)/2, sin(2*x), x)
steps(Integral(x*sin(2*x), x), -x*cos(2*x)/2 + Integral(cos(2*x), x)/2, -x*cos(2*x)/2 + sin(2*x)/4)
antideriv(-x*cos(2*x)/2 + sin(2*x)/4, x*sin(2*x), x)
steps(Integral(xp**2*log(xp), xp), xp**3/3*log(xp) - Integral(xp**3/3*(1/xp), xp), xp**3/3*log(xp) - xp**3/9)
antideriv(xp**3*log(xp)/3 - xp**3/9, xp**2*log(xp), xp)
antideriv(xp*log(xp) - xp, log(xp), xp); same(expand(2*xp*(xp*log(xp) - xp)), 2*xp**2*log(xp) - 2*xp**2)   # the other choice
steps(Integral(xp**2*log(xp), xp), xp**2*(xp*log(xp) - xp) - Integral(2*xp*(xp*log(xp) - xp), xp))
Ib = symbols('I_b'); same(solve(Eq(Ib, xp**2*(xp*log(xp) - xp) - 2*Ib + 2*xp**3/3), Ib), [xp**3*log(xp)/3 - xp**3/9])   # solving for it
same(-x*exp(-x) - exp(-x), -(x + 1)*exp(-x))
steps(Integral(x*exp(-x), (x, 0, 1)), -(1 + 1)*exp(-1) + (0 + 1)*exp(0), 1 - 2/E); rounds(1 - 2/E, '0.2642')
```
:::
::::

:::: exercise 三角积分 {#ex-11-2} ★
求：

- (a) $\displaystyle\int \cos^3 x\,dx$
- (b) $\displaystyle\int \sin^2 x\cos^2 x\,dx$
- (c) $\displaystyle\int_0^{\pi/4} \sec^4 x\,dx$

::: solution
**(a)** 余弦的幂是奇数： $\cos^3 x = \big(1 - \sin^2 x\big)\cos x$。使用 $u = \sin x$，

$$\begin{aligned} &\int \big(1 - u^2\big)\,du \\ &\quad= \sin x - \tfrac13\sin^3 x + C. \end{aligned}$$

**(b)** 两个幂都是偶数。使用 $\sin x\cos x = \tfrac12\sin 2x$，然后使用半角恒等式，其中 $2x$ 代替 $x$：

$$\begin{aligned} \sin^2 x\cos^2 x &= \tfrac14\sin^2 2x \\ &= \tfrac18\big(1 - \cos 4x\big), \end{aligned}$$

因此

$$\begin{aligned} &\int \sin^2 x\cos^2 x\,dx \\ &\quad= \frac{x}{8} - \frac{\sin 4x}{32} + C. \end{aligned}$$

**(c)** 正切的幂是偶数： $\sec^4 x = \big(1 + \tan^2 x\big)\sec^2 x$。使用 $u = \tan x$，积分限变为 $\tan 0 = 0$ 和 $\tan\tfrac{\pi}{4} = 1$：

$$\begin{aligned} &\int_0^{\pi/4} \sec^4 x\,dx \\ &\quad= \int_0^1 \big(1 + u^2\big)\,du \\ &\quad= 1 + \frac13 = \frac43. \end{aligned}$$

```check
same(cos(x)**3, (1 - sin(x)**2)*cos(x)); antideriv(sin(x) - sin(x)**3/3, cos(x)**3, x)
same(sin(x)**2*cos(x)**2, sin(2*x)**2/4); same(sin(2*x)**2/4, (1 - cos(4*x))/8)
antideriv(x/8 - sin(4*x)/32, sin(x)**2*cos(x)**2, x)
same(sec(x)**4, (1 + tan(x)**2)*sec(x)**2); same(tan(pi/4), 1)
steps(Integral(sec(x)**4, (x, 0, pi/4)), Integral(1 + u**2, (u, 0, 1)), 1 + Rational(1, 3), Rational(4, 3))
```
:::
::::

:::: exercise 部分分式分解 {#ex-11-3} ★
- (a) 求 $\displaystyle\int \frac{x + 7}{x^2 - x - 6}\,dx$。
- (b) 精确计算 $\displaystyle\int_0^1 \frac{dx}{(x + 1)(x + 2)}$，并保留四位小数。
- (c) 解释为什么 $\displaystyle\int \frac{x^2 + 1}{x^2 - 1}\,dx$ 需要先进行长除法，然后求出它。

::: solution
**(a)** $x^2 - x - 6 = (x - 3)(x + 2)$. 覆盖法：分子 $\dfrac{1}{x - 3}$ 的系数是 $\dfrac{3 + 7}{3 + 2} = 2$，分母 $\dfrac{1}{x + 2}$ 的系数是 $\dfrac{-2 + 7}{-2 - 3} = -1$。因此

$$\begin{aligned} &\int \frac{x + 7}{x^2 - x - 6}\,dx \\ &\quad= 2\ln\abs{x - 3} \\ &\qquad - \ln\abs{x + 2} + C. \end{aligned}$$

**(b)** 覆盖法： $\dfrac{1}{(x + 1)(x + 2)} = \dfrac{1}{x + 1} - \dfrac{1}{x + 2}$。在 $[0, 1]$ 两个因子都是正的，因此

$$\begin{aligned} &\int_0^1 \frac{dx}{(x + 1)(x + 2)} \\ &\quad= \big[\ln(x + 1) - \ln(x + 2)\big]_0^1 \\ &\quad= (\ln 2 - \ln 3) - (0 - \ln 2) \\ &\quad= 2\ln 2 - \ln 3 \\ &\quad= \ln\frac43 \approx 0.2877. \end{aligned}$$

**(c)** 分子和分母的次数相同，都是 2，因此这个分数是假分数，定理 11.7 不适用于它。进行除法： $x^2 + 1 = 1\cdot\big(x^2 - 1\big) + 2$，因此被积函数是 $1 + \dfrac{2}{x^2 - 1}$，根据例题 11.15(b) 且 $a = 1$，

$$\begin{aligned} &\int \frac{x^2 + 1}{x^2 - 1}\,dx \\ &\quad= x + \ln\Big|\frac{x - 1}{x + 1}\Big| + C. \end{aligned}$$

直接尝试 $\dfrac{A}{x - 1} + \dfrac{B}{x + 1}$ 失败：这个和总是真分数。

```check
same(factor(x**2 - x - 6), (x - 3)*(x + 2)); same(((x + 7)/(x + 2)).subs(x, 3), 2); same(((x + 7)/(x - 3)).subs(x, -2), -1)
same(apart((x + 7)/(x**2 - x - 6), x), 2/(x - 3) - 1/(x + 2)); antideriv(2*log(x - 3) - log(x + 2), (x + 7)/(x**2 - x - 6), x)
same(apart(1/((x + 1)*(x + 2)), x), 1/(x + 1) - 1/(x + 2))
steps(Integral(1/((x + 1)*(x + 2)), (x, 0, 1)), (log(2) - log(3)) - (0 - log(2)), 2*log(2) - log(3), log(Rational(4, 3))); rounds(log(Rational(4, 3)), '0.2877')
same(div(x**2 + 1, x**2 - 1, x), (1, 2)); same((x**2 + 1)/(x**2 - 1), 1 + 2/(x**2 - 1))
antideriv(x + log((x - 1)/(x + 1)), (x**2 + 1)/(x**2 - 1), x)
holds(Poly(together(a/(x - 1) + b/(x + 1)).as_numer_denom()[0], x).degree() < 2)
```
:::
::::

:::: exercise 幂对数，重新审视 {#ex-11-4} ★
在 [练习 9.9](module_09_ZH.html#ex-9-9)，一个程序在一次一分钟的任务中，每隔 10 秒记录了 GPU 的功耗。虚构的读数为 120, 180, 250, 260, 240, 200 和 150 W 在 $t = 0, 10, \dots, 60$ 秒。

- (a) 用梯形法则和辛普森法则估计能量 $E = \int_0^{60} P(t)\,dt$。
- (b) 比较梯形估计值与练习 9.9 中的左和右和，分别为 12,500 J 和 12,800 J。
- (c) 为什么在这里不能使用 6 个子区间中的中点法则？你可以做出哪种中点估计，它与其他估计值有何关系？

::: solution
**(a)** 有 $n = 6$ 个 $\Delta t = 10$ s 区间，是偶数个，因此两种规则都适用：

$$\begin{aligned} T_6 &= \frac{10}{2}\big[120 + 2(180 \\ &\qquad + 250 + 260 + 240 \\ &\qquad + 200) + 150\big] \\ &= 5\cdot 2530 = 12{,}650 \text{ J}, \\ S_6 &= \frac{10}{3}\big[120 + 4\cdot 180 \\ &\qquad + 2\cdot 250 + 4\cdot 260 \\ &\qquad + 2\cdot 240 + 4\cdot 200 \\ &\qquad + 150\big] \\ &= \frac{10}{3}\cdot 3810 \\ &= 12{,}700 \text{ J}. \end{aligned}$$

**(b)** $T_6 = 12{,}650$ J 是 12,500 J 和 12,800 J 的平均值，正如定义 11.4 所述。

**(c)** $M_6$ 需要计算中间时刻 5, 15, …, 55 s 的功率值，这些值未被测量。不过，使用 3 个 20 s 的子区间，中间时刻为 10, 30 和 50 s，这些时刻是： $M_3 = 20(180 + 260 + 200) = 12{,}800$ J。利用例 11.21 中的关系，结合 $T_3 = \tfrac{20}{2}(120 + 2\cdot 250 + 2\cdot 240 + 150) = 12{,}500$ J，可得辛普森估计值： $\tfrac13(T_3 + 2M_3) = \tfrac13(12{,}500 + 25{,}600) = 12{,}700$ J $= S_6$。这些估计值都没有保证：十秒一次的读数无法说明它们之间的功率变化。

```check
P9 = [120, 180, 250, 260, 240, 200, 150]
same(120 + 2*(180 + 250 + 260 + 240 + 200) + 150, 2530); same(5*2530, 12650); same(Rational(10, 2)*(P9[0] + 2*sum(P9[1:6]) + P9[6]), 12650)
same(sum(c_*p_ for c_, p_ in zip([1, 4, 2, 4, 2, 4, 1], P9)), 3810); same(Rational(10, 3)*3810, 12700)
same((12500 + 12800)/Integer(2), 12650)
M3 = 20*(P9[1] + P9[3] + P9[5]); T3 = 10*(P9[0] + 2*P9[2] + 2*P9[4] + P9[6])
same(M3, 12800); same(T3, 12500); same((T3 + 2*M3)/Integer(3), 12700)
```
:::
::::

:::: exercise 重复部分 {#ex-11-5} ★★
求：

- (a) $\displaystyle\int x^3e^{-x}\,dx$，使用表格法
- (b) $\displaystyle\int e^{2x}\cos x\,dx$
- (c) $\displaystyle\int (\ln x)^2\,dx$，用于 $x > 0$

::: solution
**(a)** 对 $x^3$ 进行微分，对 $e^{-x}$ 进行积分：

| 符号 | D | I |
|---|---|---|
| $+$ | $x^3$ | $e^{-x}$ |
| $-$ | $3x^2$ | $-e^{-x}$ |
| $+$ | $6x$ | $e^{-x}$ |
| $-$ | $6$ | $-e^{-x}$ |
|  | $0$ | $e^{-x}$ |

沿着对角线相乘并考虑符号，

$$\begin{aligned} &\int x^3e^{-x}\,dx \\ &\quad= -x^3e^{-x} - 3x^2e^{-x} \\ &\qquad - 6xe^{-x} - 6e^{-x} + C \\ &\quad= -e^{-x}\big(x^3 + 3x^2 \\ &\qquad + 6x + 6\big) + C. \end{aligned}$$

**(b)** 设为 $I$。结合 $u = \cos x$ 和 $dv = e^{2x}\,dx$，因此 $v = \tfrac12e^{2x}$：

$$\begin{aligned} I &= \tfrac12e^{2x}\cos x \\ &\quad + \tfrac12\int e^{2x}\sin x\,dx. \end{aligned}$$

同样，保持角色不变，使用 $u = \sin x$： $\int e^{2x}\sin x\,dx = \tfrac12e^{2x}\sin x - \tfrac12I$。因此

$$I = \tfrac12e^{2x}\cos x + \tfrac14e^{2x}\sin x - \tfrac14I,$$

并求解， $\tfrac54I = \tfrac14e^{2x}(2\cos x + \sin x)$：

$$\begin{aligned} &\int e^{2x}\cos x\,dx \\ &\quad= \tfrac15e^{2x}(2\cos x + \sin x) + C. \end{aligned}$$

**(c)** $u = (\ln x)^2$ 和 $dv = dx$，所以 $du = \dfrac{2\ln x}{x}\,dx$ 和 $v = x$。然后，根据例题 11.1(b)，

$$\begin{aligned} &\int (\ln x)^2\,dx \\ &\quad= x(\ln x)^2 - 2\int \ln x\,dx \\ &\quad= x(\ln x)^2 - 2x\ln x \\ &\qquad + 2x + C. \end{aligned}$$

```check
same([diff(x**3, x, k_) for k_ in range(5)], [x**3, 3*x**2, 6*x, 6, 0]); same([diff((-1)**k_*exp(-x), x) for k_ in range(1, 5)], [(-1)**(k_ - 1)*exp(-x) for k_ in range(1, 5)])
same(x**3*(-exp(-x)) - 3*x**2*exp(-x) + 6*x*(-exp(-x)) - 6*exp(-x), -(x**3 + 3*x**2 + 6*x + 6)*exp(-x))
antideriv(-(x**3 + 3*x**2 + 6*x + 6)*exp(-x), x**3*exp(-x), x)
steps(Integral(exp(2*x)*cos(x), x), exp(2*x)*cos(x)/2 + Integral(exp(2*x)*sin(x), x)/2)
steps(Integral(exp(2*x)*sin(x), x), exp(2*x)*sin(x)/2 - Integral(exp(2*x)*cos(x), x)/2)
Ic = symbols('I_c'); same(solve(Eq(Ic, exp(2*x)*cos(x)/2 + exp(2*x)*sin(x)/4 - Ic/4), Ic), [exp(2*x)*(2*cos(x) + sin(x))/5])
antideriv(exp(2*x)*(2*cos(x) + sin(x))/5, exp(2*x)*cos(x), x)
steps(Integral(log(xp)**2, xp), xp*log(xp)**2 - Integral(xp*2*log(xp)/xp, xp), xp*log(xp)**2 - 2*(xp*log(xp) - xp))
antideriv(xp*log(xp)**2 - 2*xp*log(xp) + 2*xp, log(xp)**2, xp)
```
:::
::::

:::: exercise 三角函数替换 {#ex-11-6} ★★
- (a) 求 $\displaystyle\int \frac{x^2}{\sqrt{9 - x^2}}\,dx$，在 $-3 < x < 3$ 上。
- (b) 求 $\displaystyle\int \frac{dx}{\big(x^2 + 9\big)^{3/2}}$。
- (c) 计算 $\displaystyle\int_0^1 \sqrt{1 + x^2}\,dx$，精确值和保留四位小数。（根据模块 12 的弧长公式，它是抛物线 $y = \tfrac12x^2$ 从 $x = 0$ 到 $x = 1$ 的长度。）

::: solution
**(a)** $x = 3\sin\theta$ 与 $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$，所以 $dx = 3\cos\theta\,d\theta$ 和 $\sqrt{9 - x^2} = 3\cos\theta$：

$$\begin{aligned} &\int \frac{9\sin^2\theta}{3\cos\theta}\,3\cos\theta\,d\theta \\ &\quad= 9\int \sin^2\theta\,d\theta \\ &\quad= \frac92(\theta - \sin\theta\cos\theta) + C, \end{aligned}$$

例如 11.7(a)。图 11.2 中的左三角形，带有 $a = 3$，给出 $\sin\theta = \tfrac{x}{3}$ 和 $\cos\theta = \tfrac{\sqrt{9 - x^2}}{3}$，因此

$$\begin{aligned} &\int \frac{x^2}{\sqrt{9 - x^2}}\,dx \\ &\quad= \frac92\arcsin\frac{x}{3} \\ &\qquad - \frac{x}{2}\sqrt{9 - x^2} + C. \end{aligned}$$

**(b)** $x = 3\tan\theta$ 与 $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$，因此 $dx = 3\sec^2\theta\,d\theta$ 和 $\big(x^2 + 9\big)^{3/2} = \big(9\sec^2\theta\big)^{3/2} = 27\sec^3\theta$：

$$\begin{aligned} &\int \frac{3\sec^2\theta}{27\sec^3\theta}\,d\theta \\ &\quad= \frac19\int \cos\theta\,d\theta \\ &\quad= \frac19\sin\theta + C. \end{aligned}$$

中间三角形给出 $\sin\theta = \dfrac{x}{\sqrt{x^2 + 9}}$，因此积分是 $\dfrac{x}{9\sqrt{x^2 + 9}} + C$。

**(c)** $x = \tan\theta$，因此 $dx = \sec^2\theta\,d\theta$ 和 $\sqrt{1 + x^2} = \sec\theta$；$x = 0$ 和 $x = 1$ 给出 $\theta = 0$ 和 $\theta = \tfrac{\pi}{4}$。根据例 11.11，

$$\begin{aligned} &\int_0^1 \sqrt{1 + x^2}\,dx \\ &\quad= \int_0^{\pi/4} \sec^3\theta\,d\theta \\ &\quad= \Big[\tfrac12\sec\theta\tan\theta \\ &\qquad + \tfrac12\ln\abs{\sec\theta + \tan\theta}\Big]_0^{\pi/4} \\ &\quad= \tfrac12\sqrt2 + \tfrac12\ln\big(\sqrt2 + 1\big) \\ &\quad\approx 1.1478, \end{aligned}$$

自 $\sec\tfrac{\pi}{4} = \sqrt2$、$\tan\tfrac{\pi}{4} = 1$ 以及在 $\theta = 0$ 处括号为 0。

```check
same(9*sin(theta)**2/(3*cos(theta))*3*cos(theta), 9*sin(theta)**2); antideriv(Rational(9, 2)*(theta - sin(theta)*cos(theta)), 9*sin(theta)**2, theta)
same(cos(asin(x/3)), sqrt(9 - x**2)/3)
antideriv(Rational(9, 2)*asin(x/3) - x*sqrt(9 - x**2)/2, x**2/sqrt(9 - x**2), x)
same(9*tan(theta)**2 + 9, 9*sec(theta)**2); same(3*sec(theta)**2/(27*sec(theta)**3), cos(theta)/9)
same(sin(atan(x/3)), x/sqrt(x**2 + 9)); antideriv(x/(9*sqrt(x**2 + 9)), 1/(x**2 + 9)**Rational(3, 2), x)
same(sec(pi/4), sqrt(2)); same(tan(pi/4), 1); same(sqrt(1 + tan(theta)**2)*sec(theta)**2, sqrt(sec(theta)**2)*sec(theta)**2)
holds(cos(pi/4) > 0); same(diff(cos(theta), theta), -sin(theta))     # cos decreases on [0, pi/4] from 1 to cos(pi/4) > 0, so sec > 0 there
for th_ in (0, Rational(1, 4), Rational(1, 2), Rational(3, 4), pi/4):
    near(sqrt(1 + tan(th_)**2), sec(th_), 1e-25)
Fs3 = sec(theta)*tan(theta)/2 + log(sec(theta) + tan(theta))/2
same(Fs3.subs(theta, pi/4) - Fs3.subs(theta, 0), sqrt(2)/2 + log(sqrt(2) + 1)/2); same(Fs3.subs(theta, 0), 0)
same(integrate(sqrt(1 + x**2), (x, 0, 1)), sqrt(2)/2 + log(1 + sqrt(2))/2); rounds(sqrt(2)/2 + log(1 + sqrt(2))/2, '1.1478')
near(N(Integral(sqrt(1 + x**2), (x, 0, 1)), 30), N(sqrt(2)/2 + log(1 + sqrt(2))/2, 30), 1e-20)
same(sqrt(1 + diff(x**2/2, x)**2), sqrt(1 + x**2))
```
:::
::::

:::: exercise 更多部分分式 {#ex-11-7} ★★
- (a) 求 $\displaystyle\int \frac{x^2 + 2}{x(x + 1)^2}\,dx$。
- (b) 求 $\displaystyle\int \frac{3x + 1}{x^3 + x}\,dx$。
- (c) 在一个种群 $y$ 的模型中，该种群不能超过大小 $K > 0$ （模块 13），积分 $\displaystyle\int \frac{dy}{y(K - y)}$ 出现，用于 $0 < y < K$。求解它。

::: solution
**(a)** 根据定理 11.7， $\dfrac{x^2 + 2}{x(x + 1)^2} = \dfrac{A}{x} + \dfrac{B}{x + 1} + \dfrac{D}{(x + 1)^2}$。覆盖法： $A = \dfrac{0 + 2}{(0 + 1)^2} = 2$，对于最高次幂 $x + 1$， $D = \dfrac{1 + 2}{-1} = -3$。乘以分母 $x^2 + 2 = A(x + 1)^2 + Bx(x + 1) + Dx$，以及 $x^2$ 的系数给出 $1 = A + B$，因此 $B = -1$。所以

$$\begin{aligned} &\int \frac{x^2 + 2}{x(x + 1)^2}\,dx \\ &\quad= \int \Big(\frac2x - \frac{1}{x + 1} \\ &\qquad - \frac{3}{(x + 1)^2}\Big)\,dx \\ &\quad= 2\ln\abs{x} - \ln\abs{x + 1} \\ &\qquad + \frac{3}{x + 1} + C. \end{aligned}$$

**(b)** $x^3 + x = x\big(x^2 + 1\big)$，其中 $x^2 + 1$ 不可约： $\dfrac{3x + 1}{x(x^2 + 1)} = \dfrac{A}{x} + \dfrac{Bx + D}{x^2 + 1}$。覆盖法： $A = \dfrac{1}{1} = 1$。然后 $3x + 1 = \big(x^2 + 1\big) + (Bx + D)x$； $x^2$ 的系数给出 $0 = 1 + B$，因此 $B = -1$，而 $x$ 的系数给出 $D = 3$。所以

$$\begin{aligned} &\int \frac{3x + 1}{x^3 + x}\,dx \\ &\quad= \int \Big(\frac1x - \frac{x}{x^2 + 1} \\ &\qquad + \frac{3}{x^2 + 1}\Big)\,dx \\ &\quad= \ln\abs{x} - \tfrac12\ln\big(x^2 + 1\big) \\ &\qquad + 3\arctan x + C. \end{aligned}$$

**(c)** 两个因子 $y$ 和 $K - y = -(y - K)$ 是不同的线性因子。覆盖法：在 $y = 0$ 处， $\dfrac1y$ 的系数是 $\dfrac{1}{K}$，覆盖 $K - y$ 并代入 $y = K$ 得到 $\dfrac{1}{K - y}$ 的系数 $\dfrac1K$。所以

$$\frac{1}{y(K - y)} = \frac1K\Big(\frac1y + \frac{1}{K - y}\Big),$$

并且，由于 $y > 0$ 和 $K - y > 0$，以及 $\int \frac{dy}{K - y} = -\ln(K - y) + C$（代入 $w = K - y$），

$$\begin{aligned} &\int \frac{dy}{y(K - y)} \\ &\quad= \frac{\ln y - \ln(K - y)}{K} + C \\ &\quad= \frac1K\ln\frac{y}{K - y} + C. \end{aligned}$$

```check
same(((x**2 + 2)/(x + 1)**2).subs(x, 0), 2); same(((x**2 + 2)/x).subs(x, -1), -3)
same(solve(Poly(expand(2*(x + 1)**2 + Bq*x*(x + 1) - 3*x - (x**2 + 2)), x).all_coeffs(), [Bq]), {Bq: -1})
same(apart((x**2 + 2)/(x*(x + 1)**2), x), 2/x - 1/(x + 1) - 3/(x + 1)**2)
antideriv(2*log(x) - log(x + 1) + 3/(x + 1), (x**2 + 2)/(x*(x + 1)**2), x)
same(solve(Poly(expand((x**2 + 1) + (Bq*x + Dq)*x - (3*x + 1)), x).all_coeffs(), [Bq, Dq]), {Bq: -1, Dq: 3})
same(apart((3*x + 1)/(x**3 + x), x), 1/x - x/(x**2 + 1) + 3/(x**2 + 1))
antideriv(log(x) - log(x**2 + 1)/2 + 3*atan(x), (3*x + 1)/(x**3 + x), x)
Kp = symbols('K', positive=True)
same(1/(y*(Kp - y)), (1/Kp)*(1/y + 1/(Kp - y))); antideriv(-log(Kp - y), 1/(Kp - y), y)
antideriv(log(y/(Kp - y))/Kp, 1/(y*(Kp - y)), y)
```
:::
::::

:::: exercise 方法选择 {#ex-11-8} ★★
为每个积分选择一个方法并计算。

- (a) $\displaystyle\int x\cos\big(x^2\big)\,dx$
- (b) $\displaystyle\int x^2\cos x\,dx$
- (c) $\displaystyle\int \frac{dx}{x^2 + 2x + 2}$
- (d) $\displaystyle\int \frac{x}{\sqrt{1 - x^4}}\,dx$，对于 $-1 < x < 1$
- (e) SymPy 的答案 $\int x^2e^{x^2}\,dx$ 是 $\tfrac12xe^{x^2} - \tfrac{\sqrt\pi}{4}\operatorname{erfi} x$，其中 $\operatorname{erfi}$ 是由积分定义的函数，像 $\operatorname{erf}$ 一样，导数为 $\tfrac{2}{\sqrt\pi}e^{x^2}$。通过对其求导来验证答案。然后用 $u = x$ 作分部积分，解释为何没有初等公式。

::: solution
**(a)** 一个 $x^2$ 的函数乘以 $x$，一半的 $x^2$ 的导数：代入 $u = x^2$， $du = 2x\,dx$，得到 $\tfrac12\int \cos u\,du = \tfrac12\sin\big(x^2\big) + C$。分部积分只会让情况更糟。

**(b)** 幂函数乘以余弦函数：分部积分，两次（表格法）。符号 $+, -, +$ 和反导函数 $\sin x$， $-\cos x$， $-\sin x$ 的 $\cos x$，

$$\begin{aligned} &\int x^2\cos x\,dx \\ &\quad= x^2\sin x + 2x\cos x \\ &\qquad - 2\sin x + C. \end{aligned}$$

**(c)** 一个分母不可约的有理函数: $2^2 - 4\cdot 2 = -4 < 0$。完成平方， $x^2 + 2x + 2 = (x + 1)^2 + 1$，并代入 $u = x + 1$:

$$\begin{aligned} &\int \frac{dx}{x^2 + 2x + 2} \\ &\quad= \int \frac{du}{u^2 + 1} \\ &\quad= \arctan(x + 1) + C. \end{aligned}$$

**(d)** 看起来像是三角替换，但首先进行替换: $x^4 = \big(x^2\big)^2$，且 $x$ 是 $x^2$ 的一半导数。带入 $u = x^2$， $du = 2x\,dx$，和 $0 \le u < 1$，

$$\begin{aligned} &\int \frac{x}{\sqrt{1 - x^4}}\,dx \\ &\quad= \frac12\int \frac{du}{\sqrt{1 - u^2}} \\ &\quad= \frac12\arcsin\big(x^2\big) + C. \end{aligned}$$

**(e)** 根据乘积法则和链式法则， $\dfrac{d}{dx}\big(\tfrac12xe^{x^2}\big) = \tfrac12e^{x^2} + x^2e^{x^2}$，和 $\dfrac{d}{dx}\big(\tfrac{\sqrt\pi}{4}\operatorname{erfi} x\big) = \tfrac{\sqrt\pi}{4}\cdot\tfrac{2}{\sqrt\pi}e^{x^2} = \tfrac12e^{x^2}$。两者的差异是 $x^2e^{x^2}$，因此 SymPy 的答案是正确的。使用分部积分法，带入 $u = x$ 和 $dv = xe^{x^2}\,dx$，使得 $du = dx$ 和 $v = \tfrac12e^{x^2}$:

$$\begin{aligned} &\int x^2e^{x^2}\,dx \\ &\quad= \tfrac12xe^{x^2} - \tfrac12\int e^{x^2}\,dx. \end{aligned}$$

如果 $x^2e^{x^2}$ 有一个初等原函数 $F$，那么 $xe^{x^2} - 2F$ 将是 $e^{x^2}$ 的一个初等原函数：其导数是 $e^{x^2} + 2x^2e^{x^2} - 2x^2e^{x^2} = e^{x^2}$。第 11.6 节指出不存在这样的原函数。因此答案需要像 $\operatorname{erfi}$ 这样的函数，如 SymPy 所得。奇次幂不同： $\int xe^{x^2}\,dx = \tfrac12e^{x^2} + C$，例 11.2 找到 $\int x^3e^{x^2}\,dx$。

```check
antideriv(sin(u)/2, cos(u)/2, u); antideriv(sin(x**2)/2, x*cos(x**2), x)
same([diff(x**2, x, k_) for k_ in range(3)], [x**2, 2*x, 2]); same([diff(F_, x) for F_ in (sin(x), -cos(x), -sin(x))], [cos(x), sin(x), -cos(x)])
same(x**2*sin(x) - 2*x*(-cos(x)) + 2*(-sin(x)), x**2*sin(x) + 2*x*cos(x) - 2*sin(x)); antideriv(x**2*sin(x) + 2*x*cos(x) - 2*sin(x), x**2*cos(x), x)
same(2**2 - 4*2, -4); same(expand((x + 1)**2 + 1), x**2 + 2*x + 2); antideriv(atan(x + 1), 1/(x**2 + 2*x + 2), x)
same(diff(x**2, x), 2*x); antideriv(asin(u)/2, 1/(2*sqrt(1 - u**2)), u); antideriv(asin(x**2)/2, x/sqrt(1 - x**4), x)
same(integrate(x**2*exp(x**2), x), x*exp(x**2)/2 - sqrt(pi)*erfi(x)/4); same(diff(erfi(x), x), 2*exp(x**2)/sqrt(pi))   # SymPy's answer, erfi'
same(diff(x*exp(x**2)/2, x), exp(x**2)/2 + x**2*exp(x**2)); same(diff(sqrt(pi)*erfi(x)/4, x), exp(x**2)/2)
antideriv(x*exp(x**2)/2 - sqrt(pi)*erfi(x)/4, x**2*exp(x**2), x)
antideriv(exp(x**2)/2, x*exp(x**2), x); steps(Integral(x**2*exp(x**2), x), x*exp(x**2)/2 - Integral(exp(x**2), x)/2)
Fe = Function('F'); same(diff(x*exp(x**2) - 2*Fe(x), x).subs(Derivative(Fe(x), x), x**2*exp(x**2)), exp(x**2))   # x e^{x^2} - 2F, when F' = x^2 e^{x^2}
```
:::
::::

:::: exercise 有多少个子区间？ {#ex-11-9} ★★
设 $f(x) = e^{-x^2}$。

- (a) 求 $f''(x)$ 和 $f^{(4)}(x)$，并证明 $\abs{f''(x)} \le 2$ 和 $\abs{f^{(4)}(x)} \le 20$ 对于 $0 \le x \le 1$。
- (b) $n$ 必须多大才能保证 $T_n$，并且 $S_n$ 近似 $\int_0^1 e^{-x^2}\,dx$ 的误差不超过 $10^{-6}$？
- (c) 与第 11.7 节 "Compute it" 框中打印的误差进行比较。

::: solution
**(a)** 根据链式法则和乘积法则，得到 $f'(x) = -2xe^{-x^2}$ 和 $f''(x) = \big(4x^2 - 2\big)e^{-x^2}$；再对导数求两次，得到 $f'''(x) = \big(12x - 8x^3\big)e^{-x^2}$ 和 $f^{(4)}(x) = \big(16x^4 - 48x^2 + 12\big)e^{-x^2}$。对于 $0 \le x \le 1$，得到 $0 < e^{-x^2} \le 1$。而 $4x^2 - 2$ 介于 $-2$ 和 2 之间，因此 $\abs{f''(x)} \le 2$。由于 $s = x^2$ 位于 $[0, 1]$ 中，多项式 $16s^2 - 48s + 12$ 的导数为 $32s - 48 < 0$，因此它从 $s = 0$ 处的 12 减少到 $-20$ 处的 $s = 1$；因此 $\abs{16x^4 - 48x^2 + 12} \le 20$，且 $\abs{f^{(4)}(x)} \le 20$。

**(b)** 梯形法则，带 $K = 2$ 和 $b - a = 1$： $\dfrac{2}{12n^2} \le 10^{-6}$ 需要 $n^2 \ge 166{,}667$，因此 $n = 409$ 足够，如例 11.20 所示。辛普森法则，带 $K = 20$： $\dfrac{20}{180n^4} \le 10^{-6}$ 需要 $n^4 \ge 111{,}112$，即 $n \ge 18.26$；当 $n$ 为偶数时， $n = 20$ 足够。

**(c)** 盒子显示 $\abs{E_T} \approx 1.5 \times 10^{-5}$ 在 $n = 64$，仍然太大；由于误差像 $\tfrac{1}{n^2}$ 一样衰减，梯形法则在 $n = 250$ 附近达到 $10^{-6}$，早于保证的 409。辛普森法则在 $n = 8$ 有 $\abs{E_S} \approx 2 \times 10^{-6}$，仍然太大，在 $n = 16$ 有 $1.25 \times 10^{-7}$。由于其误差像 $\tfrac{1}{n^4}$ 一样衰减， $n = 10$ 应该给出约 $2 \times 10^{-6}\cdot 0.8^4 \approx 8 \times 10^{-7}$，盒子的 `simpson` 函数证实了这一点： $\abs{E_S} \approx 8.2 \times 10^{-7}$ 在 $n = 10$。即为保证的 20 的一半。这些界限是保证，也是谨慎的： $\abs{f^{(4)}}$ 实际上在 $[0, 1]$ 上最多为 12，这将给出 $n = 18$。

```check
fe_ = exp(-x**2)
same(diff(fe_, x), -2*x*exp(-x**2)); same(diff(fe_, x, 2), (4*x**2 - 2)*exp(-x**2)); same(diff(fe_, x, 3), (12*x - 8*x**3)*exp(-x**2)); same(diff(fe_, x, 4), (16*x**4 - 48*x**2 + 12)*exp(-x**2))
same(function_range(4*x**2 - 2, x, Interval(0, 1)), Interval(-2, 2)); holds(exp(-Rational(1, 1)) > 0)
same(diff(4*x**2 - 2, x), 8*x); same((4*x**2 - 2).subs(x, 0), -2); same((4*x**2 - 2).subs(x, 1), 2)   # increasing on [0, 1]
sq_ = symbols('s'); same(diff(16*sq_**2 - 48*sq_ + 12, sq_), 32*sq_ - 48); same((16*sq_**2 - 48*sq_ + 12).subs(sq_, 0), 12); same((16*sq_**2 - 48*sq_ + 12).subs(sq_, 1), -20)
same(function_range(16*sq_**2 - 48*sq_ + 12, sq_, Interval(0, 1)), Interval(-20, 12))
holds(Rational(2*10**6, 12) > 166666); holds(Rational(2, 12*409**2) <= Rational(1, 10**6)); holds(Rational(2, 12*408**2) > Rational(1, 10**6))
holds(Rational(20*10**6, 180) > 111111); rounds(Rational(20*10**6, 180)**Rational(1, 4), '18.26')
holds(Rational(20, 180*20**4) <= Rational(1, 10**6)); holds(Rational(20, 180*18**4) > Rational(1, 10**6))
rounds(abs(eT[4]), '1.5e-5'); rounds(abs(eS[2]), '1.25e-7'); rounds(abs(eS[1]), '2e-6')
nT = sqrt(abs(eT[0])*16/Rational(1, 10**6)); holds(240 < nT < 260)
holds(abs(eS[2]) < 1e-6); holds(abs(eS[1]) > 1e-6)
rounds(abs(eS[1])*Rational(8, 10)**4, '8e-7')                       # the estimate for n = 10 from n = 8
eS10 = N(Jg - Sq_(fg_, 0, 1, 10), 30); rounds(abs(eS10), '8.2e-7'); holds(abs(eS10) < 1e-6)
fe4 = (16*x**4 - 48*x**2 + 12)*exp(-x**2); same(maximum(fe4, x, Interval(0, 1)), 12); holds(minimum(fe4, x, Interval(0, 1)) > -12)
same(diff(fe4, x), -8*x*(4*x**4 - 20*x**2 + 15)*exp(-x**2)); holds(all(-12 < fe4.subs(x, Rational(k_, 100)) <= 12 for k_ in range(101)))
holds(Rational(12, 180*18**4) <= Rational(1, 10**6)); holds(Rational(12, 180*16**4) > Rational(1, 10**6))
```
:::
::::

:::: exercise 哥特的积分 {#ex-11-10} ★★★
设 $I_n = \displaystyle\int_0^{\pi/2} \sin^n x\,dx$ 为 $n = 0, 1, 2, \dots$

- (a) 证明 $I_0 = \tfrac{\pi}{2}$, $I_1 = 1$, 和 $I_n = \dfrac{n - 1}{n}I_{n-2}$ 对于 $n \ge 2$ 成立。
- (b) 求 $I_5$ 和 $I_6$。
- (c) 证明 $nI_nI_{n-1} = \dfrac{\pi}{2}$ 对于每一个 $n \ge 1$ 成立。

::: solution
**(a)** $I_0 = \int_0^{\pi/2} 1\,dx = \tfrac{\pi}{2}$ 和 $I_1 = \big[-\cos x\big]_0^{\pi/2} = 0 + 1 = 1$。对于 $n \ge 2$，定理 11.3 的确定形式（例 11.7(c)）给出

$$\begin{aligned} I_n &= \Big[-\frac{\sin^{n-1}x\cos x}{n}\Big]_0^{\pi/2} \\ &\quad + \frac{n - 1}{n}I_{n-2}, \end{aligned}$$

并且括号为 0：在 $x = \tfrac{\pi}{2}$ 处因为 $\cos\tfrac{\pi}{2} = 0$，在 $x = 0$ 处因为 $\sin 0 = 0$ 和 $n - 1 \ge 1$。

**(b)** $I_5 = \tfrac45\cdot\tfrac23\cdot I_1 = \tfrac{8}{15}$ 和 $I_6 = \tfrac56\cdot\tfrac34\cdot\tfrac12\cdot I_0 = \tfrac{15}{48}\cdot\tfrac{\pi}{2} = \tfrac{5\pi}{32} \approx 0.4909$。

**(c)** 通过 $n$ 的归纳法。对于 $n = 1$： $1\cdot I_1I_0 = \tfrac{\pi}{2}$。假设 $nI_nI_{n-1} = \tfrac{\pi}{2}$ 对于某个 $n \ge 1$ 成立。由 (a)， $I_{n+1} = \tfrac{n}{n + 1}I_{n-1}$，因此

$$\begin{aligned} &(n + 1)I_{n+1}I_n \\ &\quad= (n + 1)\cdot\frac{n}{n + 1}I_{n-1}\cdot I_n \\ &\quad= nI_nI_{n-1} = \frac{\pi}{2}. \end{aligned}$$

所以对于每一个 $n \ge 1$，命题成立。

```check
Iw = [integrate(sin(x)**k_, (x, 0, pi/2)) for k_ in range(8)]
same(Iw[0], pi/2); same(Iw[1], 1); same(-cos(pi/2) + cos(0), 1)
for k_ in range(2, 8):
    same(Iw[k_], Rational(k_ - 1, k_)*Iw[k_ - 2]); same((-sin(x)**(k_ - 1)*cos(x)/k_).subs(x, pi/2) - (-sin(x)**(k_ - 1)*cos(x)/k_).subs(x, 0), 0)
same(Iw[5], Rational(8, 15)); same(Rational(4, 5)*Rational(2, 3), Rational(8, 15)); same(Iw[6], 5*pi/32); same(Rational(15, 48)*pi/2, 5*pi/32); rounds(5*pi/32, '0.4909')
for k_ in range(1, 8):
    same(k_*Iw[k_]*Iw[k_ - 1], pi/2)
nI = symbols('n', positive=True); I1_, I2_ = symbols('I_1 I_2')
same((nI + 1)*(nI/(nI + 1))*I1_*I2_, nI*I1_*I2_)
```
:::
::::

:::: exercise 拉格朗日乘数法和 x⁴ {#ex-11-11} ★★★
- (a) 证明 拉格朗日乘数法 用 $n = 2$ 时，给出 $\int_{-1}^{1} x^3\,dx$ 和 $\int_0^2 x^3\,dx$ 的精确值，但不给出 $\int_{-1}^{1} x^4\,dx$ 的精确值。
- (b) 求 $\int_{-1}^{1} x^4\,dx$ 在 $n = 2$ 下的误差 $E_S$，并与定理 11.10 的界进行比较。
- (c) 用 $n = 4$ 重复上述过程。你对这个界有什么结论？

::: solution
**(a)** 以 $n = 2$ 为 $[-1, 1]$，$\Delta x = 1$ 和 $S_2 = \tfrac13\big[f(-1) + 4f(0) + f(1)\big]$。对于 $x^3$：$\tfrac13(-1 + 0 + 1) = 0 = \int_{-1}^{1} x^3\,dx$。在 $[0, 2]$：$\tfrac13(0 + 4\cdot 1 + 8) = 4 = \int_0^2 x^3\,dx$。对于 $x^4$：$S_2 = \tfrac13(1 + 0 + 1) = \tfrac23$，但 $\int_{-1}^{1} x^4\,dx = \tfrac25$。

**(b)** $E_S = \tfrac25 - \tfrac23 = -\tfrac{4}{15}$。 $x^4$ 的四阶导数是常数 24，因此 $K = 24$，并且界是

$$\frac{24\cdot 2^5}{180\cdot 2^4} = \frac{768}{2880} = \frac{4}{15}.$$

误差 $\abs{E_S} = \tfrac{4}{15}$ 的大小等于界。

**(c)** 在 $n = 4$ 上， $\Delta x = \tfrac12$ 和点 $-1, -\tfrac12, 0, \tfrac12, 1$：

$$\begin{aligned} S_4 &= \frac{1}{6}\Big[1 + 4\cdot\frac{1}{16} + 0 \\ &\qquad + 4\cdot\frac{1}{16} + 1\Big] \\ &= \frac16\cdot\frac52 = \frac{5}{12}, \end{aligned}$$

所以 $E_S = \tfrac25 - \tfrac{5}{12} = -\tfrac{1}{60}$，恰好是 $n = 2$ 的 16 倍小。上界是 $\dfrac{24\cdot 2^5}{180\cdot 4^4} = \dfrac{1}{60}$: 再次等于 $\abs{E_S}$。因此，定理 11.10 中的常数 180 不能被更大的数代替：对于 $x^4$，上界被达到。（$x^2$ 的情况与定理 11.8 的上界相同。）

```check
same(Sq_(lambda X: sympify(X)**3, -1, 1, 2), 0); same(integrate(x**3, (x, -1, 1)), 0)
same(Sq_(lambda X: sympify(X)**3, 0, 2, 2), 4); same(Rational(1, 3)*(0 + 4 + 8), 4); same(integrate(x**3, (x, 0, 2)), 4)
same(Sq_(lambda X: sympify(X)**4, -1, 1, 2), Rational(2, 3)); same(integrate(x**4, (x, -1, 1)), Rational(2, 5))
same(Rational(2, 5) - Rational(2, 3), -Rational(4, 15)); same(diff(x**4, x, 4), 24); same(Rational(24*2**5, 180*2**4), Rational(4, 15)); same(Rational(768, 2880), Rational(4, 15))
same(Sq_(lambda X: sympify(X)**4, -1, 1, 4), Rational(5, 12)); same(Rational(1, 6)*(1 + Rational(4, 16) + 0 + Rational(4, 16) + 1), Rational(5, 12))
same(Rational(2, 5) - Rational(5, 12), -Rational(1, 60)); same((-Rational(4, 15))/(-Rational(1, 60)), 16); same(Rational(24*2**5, 180*4**4), Rational(1, 60))
same(integrate(x**2, (x, 0, 1)) - Mq_(lambda X: sympify(X)**2, 0, 1, 3), Rational(2, 24*9))     # midpoint: error = bound for x^2
same(Tq_(lambda X: sympify(X)**2, 0, 1, 3) - integrate(x**2, (x, 0, 1)), Rational(2, 12*9))     # trapezoid: |error| = bound for x^2
```
:::
::::

:::: exercise 中点误差 {#ex-11-12} ★★★
本练习证明定理 11.8 中关于中点法的结论。先把子区间的中心平移到 0。对于子区间 $[m - h, m + h]$，将下面的论证用于 $g(t) = f(m + t)$，它在 $[-h, h]$ 上的积分等于 $f$ 在 $[m - h, m + h]$ 上的积分。因此设 $f''$ 在 $[-h, h]$ 上连续，其中 $h > 0$。

- (a) 通过分部积分两次，证明以下公式
  $$\begin{aligned} &\int_0^h f(x)\,dx \\ &\quad= hf(0) + \frac{h^2}{2}f'(0) \\ &\qquad + \frac12\int_0^h (h - x)^2 f''(x)\,dx. \end{aligned}$$
  (从 $u = f(x)$ 和 $dv = dx$ 开始，取 $v = x - h$。)
- (b) 找出 $\int_{-h}^0 f(x)\,dx$ 对应的公式，并推导出
  $$\begin{aligned} &\int_{-h}^{h} f(x)\,dx - 2hf(0) \\ &\quad= \frac12\int_{-h}^{h} \big(h - \abs{x}\big)^2 f''(x)\,dx. \end{aligned}$$
- (c) 推导定理 11.8 中 $\abs{E_M}$ 的界，并推导当 $f'' \ge 0$ 时 $M_n \le \int_a^b f(x)\,dx$ 的结果。

::: solution
**(a)** 用 $u = f(x)$, $dv = dx$ 和 $v = x - h$，其中在 $x = h$ 处为 0，

$$\begin{aligned} &\int_0^h f\,dx \\ &\quad= \big[f(x)(x - h)\big]_0^h \\ &\qquad - \int_0^h f'(x)(x - h)\,dx \\ &\quad= hf(0) \\ &\qquad + \int_0^h (h - x)f'(x)\,dx. \end{aligned}$$

同样地，用 $u = f'(x)$ 和 $dv = (h - x)\,dx$，使得 $v = -\tfrac12(h - x)^2$：

$$\begin{aligned} &\int_0^h (h - x)f'(x)\,dx \\ &\quad= \Big[-\tfrac12(h - x)^2f'(x)\Big]_0^h \\ &\qquad + \frac12\int_0^h (h - x)^2f''(x)\,dx \\ &\quad= \frac{h^2}{2}f'(0) \\ &\qquad + \frac12\int_0^h (h - x)^2f''(x)\,dx. \end{aligned}$$

将此代入第一个结果得到公式。

**(b)** 用相同的方式，先用 $v = x + h$，然后用 $v = \tfrac12(x + h)^2$，

$$\begin{aligned} &\int_{-h}^0 f\,dx \\ &\quad= hf(0) - \frac{h^2}{2}f'(0) \\ &\qquad + \frac12\int_{-h}^0 (x + h)^2f''(x)\,dx. \end{aligned}$$

将两个公式相加：在 $f'(0)$ 中的项相互抵消。在 $[0, h]$ 上 $h - x = h - \abs{x}$，在 $[-h, 0]$ 上 $x + h = h - \abs{x}$，因此两个积分合并为所陈述的积分。

**(c)** $2hf(0)$ 是 $[-h, h]$ 上的中点公式，一个宽度为 $w = 2h$ 的子区间，因此 (b) 式左边是中点公式的误差。权重 $\tfrac12(h - \abs{x})^2$ 至少为 0，并且

$$\begin{aligned} &\frac12\int_{-h}^{h} \big(h - \abs{x}\big)^2\,dx \\ &\quad= \int_0^h (h - x)^2\,dx \\ &\quad= \frac{h^3}{3} = \frac{w^3}{24}. \end{aligned}$$

因此，若 $\abs{f''} \le K$，比较定理将一个子区间的误差限制为 $\tfrac{Kw^3}{24}$，并将 $n$ 个宽度为 $\tfrac{b - a}{n}$ 的子区间相加得到 $\abs{E_M} \le \tfrac{K(b - a)^3}{24n^2}$。若 $f'' \ge 0$，每个误差至少为 0，因此 $E_M \ge 0$，即 $M_n \le \int_a^b f(x)\,dx$。

```check
for fk in (x**5, exp(x), sin(3*x), cos(x)**2):
    same(integrate(fk, (x, 0, hq)), hq*fk.subs(x, 0) + hq**2/2*diff(fk, x).subs(x, 0) + integrate((hq - x)**2*diff(fk, x, 2), (x, 0, hq))/2)
    same(integrate(fk, (x, -hq, 0)), hq*fk.subs(x, 0) - hq**2/2*diff(fk, x).subs(x, 0) + integrate((x + hq)**2*diff(fk, x, 2), (x, -hq, 0))/2)
    same(integrate(fk, (x, -hq, hq)) - 2*hq*fk.subs(x, 0), (integrate((hq - x)**2*diff(fk, x, 2), (x, 0, hq)) + integrate((hq + x)**2*diff(fk, x, 2), (x, -hq, 0)))/2)
same(diff(x - hq, x), 1); same((x - hq).subs(x, hq), 0); same(-((x - hq).subs(x, 0)), hq); same(diff(-(hq - x)**2/2, x), hq - x)
same(diff(x + hq, x), 1); same((x + hq).subs(x, -hq), 0); same(diff((x + hq)**2/2, x), x + hq)
same(Rational(1, 2)*(integrate((hq - x)**2, (x, 0, hq)) + integrate((hq + x)**2, (x, -hq, 0))), hq**3/3)
same(integrate((hq - x)**2, (x, 0, hq)), hq**3/3); same(hq**3/3, (2*hq)**3/24)
near(N(Integral((1 - Abs(x))**2, (x, -1, 1)), 30)/2, Rational(1, 3), 1e-12)                  # h = 1, with the absolute value, numerically
same(integrate(sin(mq + t), (t, -hq, hq)), integrate(sin(x), (x, mq - hq, mq + hq)))      # translation: g(t) = f(m + t), an instance
same(nq*(Kq/24)*((bq_ - aq)/nq)**3, Kq*(bq_ - aq)**3/(24*nq**2))
```
:::
::::

## 自测 {#quiz}

```quiz
? 哪种选择的 $u$ 和 $dv$ 会使 $\displaystyle\int xe^{3x}\,dx$ 更容易？
- [ ] $u = e^{3x}$, $dv = x\,dx$
- [x] $u = x$, $dv = e^{3x}\,dx$
- [ ] $u = xe^{3x}$, $dv = dx$
- [ ] $u = 3x$, $dv = e^{x}\,dx$
> 用 $u = x$、$du = dx$ 和 $v = \tfrac13e^{3x}$，新的积分 $\int \tfrac13e^{3x}\,dx$ 就容易了，答案是 $\tfrac13xe^{3x} - \tfrac19e^{3x} + C$。用 $u = e^{3x}$ 和 $dv = x\,dx$，新的积分是 $\int \tfrac12x^2\cdot 3e^{3x}\,dx$：幂次 $x$ 上升了。用 $u = xe^{3x}$ 和 $dv = dx$，新的积分 $\int x\big(e^{3x} + 3xe^{3x}\big)\,dx$ 更糟糕。而 $3x\cdot e^x$ 并不是被积函数本身。

? $\displaystyle\int \sin^3 x\cos^2 x\,dx$ 最好的第一步是
- [x] 写出 $\sin^3 x = \big(1 - \cos^2 x\big)\sin x$ 并替换 $u = \cos x$
- [ ] 使用半角公式
- [ ] 替换 $u = \sin x$
- [ ] 用 $u = \sin^3 x$ 进行分部积分
> 正弦的幂次是奇数，因此保留一个 $\sin x$ 用于 $du = -\sin x\,dx$，其余用 $\cos x$ 表示：积分变为 $-\int \big(1 - u^2\big)u^2\,du$。半角公式用于偶数幂次。 $u = \sin x$ 需要一个额外的 $\cos x$ 因子，其余为偶数幂次，但此处余弦的幂次是偶数。只有在付出更多努力的情况下，分部积分才可能奏效。

? 哪种替换适合 $\displaystyle\int \frac{dx}{x^2\sqrt{x^2 + 16}}$？
- [ ] $x = 4\sin\theta$
- [ ] $x = 4\sec\theta$
- [x] $x = 4\tan\theta$
- [ ] $x = 16\tan\theta$
> $\sqrt{x^2 + a^2}$ 与 $a = 4$ 要求 $x = 4\tan\theta$，因为 $16\tan^2\theta + 16 = 16\sec^2\theta$。正弦适合 $\sqrt{16 - x^2}$，正割适合 $\sqrt{x^2 - 16}$。$x = 16\tan\theta$ 使用 $a^2$ 而不是 $a$：$256\tan^2\theta + 16$ 不是一个完全平方数。

? 部分分式分解 $\dfrac{x + 3}{x^2(x - 1)}$ 的形式为
- [ ] $\dfrac{A}{x^2} + \dfrac{B}{x - 1}$
- [ ] $\dfrac{A}{x} + \dfrac{B}{x - 1}$
- [ ] $\dfrac{A}{x^2(x - 1)}$
- [x] $\dfrac{A}{x} + \dfrac{B}{x^2} + \dfrac{C}{x - 1}$
> 因子 $x$ 是重复的，因此需要为每个幂次提供一项，$x$ 和 $x^2$（定理 11.7）；此处为 $A = -4$、$B = -3$ 和 $C = 4$。省略任一幂次会导致无解的方程，且 $\dfrac{A}{x^2(x - 1)}$ 无法等于分子为 $x + 3$ 的分数，其中 $A$ 为常数。

? 你求得 $\displaystyle\int \frac{dx}{\sqrt{x^2 + 4}} = \ln\big(x + \sqrt{x^2 + 4}\big) + C$，且 SymPy 输出 `asinh(x/2)`。哪一项是正确的？
- [ ] 你的答案错误
- [x] 两者都正确：它们相差一个常数 $\ln 2$
- [ ] SymPy 的答案错误
- [ ] 它们不能都对，因为它们是不同的函数
> $\operatorname{arsinh}\dfrac{x}{2} = \ln\Big(\dfrac{x}{2} + \sqrt{\dfrac{x^2}{4} + 1}\Big) = \ln\big(x + \sqrt{x^2 + 4}\big) - \ln 2$。区间上的原函数可能相差一个常数，因此两者都对；对任一原函数求导都得到 $\dfrac{1}{\sqrt{x^2 + 4}}$。不同的函数可以是同一函数的原函数，这正是 "$+\,C$" 所说的。

? 哪一个积分被积函数没有初等原函数？
- [ ] $xe^{-x^2}$
- [ ] $x^2e^{-x}$
- [x] $e^{-x^2}$
- [ ] $e^{-2x}$
> 根据刘维尔定理，$e^{-x^2}$ 没有初等原函数；其原函数是 $\tfrac{\sqrt\pi}{2}\operatorname{erf} x + C$。其余的都是初等函数：$-\tfrac12e^{-x^2}$ 用替换法，$-\big(x^2 + 2x + 2\big)e^{-x}$ 用分部积分两次，$-\tfrac12e^{-2x}$ 可以从积分表中找到。

? 如果 $\abs{f''(x)} \le 3$ 在 $[0, 2]$ 上连续，定理 11.8 对 $T_{10}$ 的误差界为
- [x] $0.02$
- [ ] $0.01$
- [ ] $0.2$
- [ ] $0.002$
> $\dfrac{K(b - a)^3}{12n^2} = \dfrac{3\cdot 2^3}{12\cdot 10^2} = \dfrac{24}{1200} = 0.02$. 0.01 是中点法的误差界，其区间数为 24 而非 12。0.2 是除以 $n$ 而非 $n^2$，0.002 是除以 $n^3$。

? 对于如 $e^x$ 在 $[0, 1]$ 上的光滑函数，辛普森法则中将 $n$ 加倍会使误差减少约
- [ ] 2
- [ ] 4
- [ ] 8
- [x] 16
> 当 $n$ 双倍时，界 $\dfrac{K(b - a)^5}{180n^4}$ 被 $2^4 = 16$ 分割，对于像 $e^x$ 这样的光滑函数，误差本身也会减少大约相同的因子，如 widget 和 Compute it 框所示。中点法和梯形法则的因子是 4，其界缩小得像 $\tfrac{1}{n^2}$；左和右求和的因子是 2。
```

```check
antideriv(x*exp(3*x)/3 - exp(3*x)/9, x*exp(3*x), x)
steps(Integral(x*exp(3*x), x), x**2/2*exp(3*x) - Integral(x**2/2*3*exp(3*x), x))
steps(Integral(x*exp(3*x), x), x*exp(3*x)*x - Integral(x*(exp(3*x) + 3*x*exp(3*x)), x))
same(sin(x)**3*cos(x)**2, (1 - cos(x)**2)*sin(x)*cos(x)**2); antideriv(-(u**3/3 - u**5/5), -(1 - u**2)*u**2, u)
antideriv(-cos(x)**3/3 + cos(x)**5/5, sin(x)**3*cos(x)**2, x)
same(16*tan(theta)**2 + 16, 16*sec(theta)**2); holds(Ne(sqrt(256*tan(Rational(1, 3))**2 + 16), 16*sec(Rational(1, 3))))
same(apart((x + 3)/(x**2*(x - 1)), x), -4/x - 3/x**2 + 4/(x - 1))
same(solve(Poly(expand(Aq*(x - 1) + Bq*x**2 - (x + 3)), x).all_coeffs(), [Aq, Bq]), []); same(solve(Poly(expand(Aq*x*(x - 1) + Bq*x**2 - (x + 3)), x).all_coeffs(), [Aq, Bq]), [])
same(asinh(xr2/2).rewrite(log), log(xr2 + sqrt(xr2**2 + 4)) - log(2)); same(diff(asinh(x/2), x), 1/sqrt(x**2 + 4))
same(integrate(exp(-x**2), x), sqrt(pi)*erf(x)/2); antideriv(-exp(-x**2)/2, x*exp(-x**2), x)
antideriv(-(x**2 + 2*x + 2)*exp(-x), x**2*exp(-x), x); antideriv(-exp(-2*x)/2, exp(-2*x), x)
same(Rational(3*2**3, 12*10**2), Rational(2, 100)); same(Rational(3*2**3, 24*10**2), Rational(1, 100)); same(Rational(3*2**3, 12*10), Rational(2, 10)); same(Rational(3*2**3, 12*10**3), Rational(2, 1000))
same(Rational(1, 2**4), Rational(1, 16)); holds(all(15.5 < eWS[k_]/eWS[k_ + 1] < 16.5 for k_ in range(3)))   # e^x on [0, 1]
```
