---
title: 函数图像与优化
part: 2
lead: 用导数找最大值和最小值，判断图像的升降与凹凸，并解决几何、物理和经济学中的优化问题。你将证明微分中值定理及据此得到的判别法，根据导数描绘图像，并像训练机器学习模型一样用梯度下降法极小化函数。
minutes: 270
needs: 模块 1 到 7，特别是介值定理和极值定理以及渐近线（模块 3），导数的法则（模块 4 到 6）和线性化（模块 7）
goals:
  - 使用闭区间法找出连续函数在闭区间上的绝对极值
  - 证明罗尔定理和平均值定理，并利用它们证明增函数和常函数的判定法
  - 使用一阶和二阶导数检验分类临界点，并找出凹凸区间和拐点
  - 根据函数的定义域、截距、对称性、渐近线以及一阶和二阶导数的符号绘制函数图像
  - 解决优化问题，并证明答案是绝对最大值或最小值
  - 用梯度下降法最小化函数，并解释步长如何决定是否收敛
---

## 最大值和最小值 {#extrema}

许多问题要求找出一个最佳值。什么样的容器能以最少的金属材料容纳给定的体积？光在两点之间走什么路径？工厂应生产多少单位产品才能使每单位的成本最低？机器学习模型的哪种设置会使误差最小？每个问题都是在寻找一个函数的最大值或最小值，导数可以解答这些问题。[例4.8](module_04_ZH.html#polynomials)通过求解$f'(x) = 0$找到了函数图像的水平切线。本模块将说明为什么这样做可以找到函数的峰值和谷值，并解释$f'$和$f''$的符号对函数图像整体形状的影响。

图8.1展示了一个在区间$[-1, 5.5]$上的函数。它的最高点位于区间的左端；最低点位于$x = 5$，此时切线水平。在两者之间，位于$x = 2$的峰值和位于$x = 0$的谷值是附近区域的最高点和最低点，但并非整个图像的最高点和最低点；在这些点上切线同样水平。

::: figure id=fig-08-1
$f(x) = \tfrac14x^4 - \tfrac73x^3 + 5x^2$ 的图像在 $[-1, 5.5]$ 上。最大值出现在端点 $x = -1$，最小值出现在 $x = 5$；峰值 $x = 2$ 和谷值 $x = 0$ 仅为局部极值。在区间内的三个点处，切线（虚线）为水平；在端点处则不一定如此。
:::

```check
F81 = x**4/4 - Rational(7, 3)*x**3 + 5*x**2
same(factor(diff(F81, x)), x*(x - 2)*(x - 5))
same([F81.subs(x, v_) for v_ in (-1, 0, 2, 5)], [Rational(91, 12), 0, Rational(16, 3), -Rational(125, 12)])
same(maximum(F81, x, Interval(-1, Rational(11, 2))), Rational(91, 12)); same(minimum(F81, x, Interval(-1, Rational(11, 2))), -Rational(125, 12))
holds(F81.subs(x, Rational(11, 2)) > F81.subs(x, 5)); holds(F81.subs(x, Rational(11, 2)) < F81.subs(x, -1))
holds(diff(F81, x).subs(x, -1) != 0); holds(diff(F81, x).subs(x, Rational(11, 2)) != 0)
holds(diff(F81, x, 2).subs(x, 2) < 0); holds(diff(F81, x, 2).subs(x, 0) > 0); holds(diff(F81, x, 2).subs(x, 5) > 0)   # peak at 2, valleys at 0 and 5
```

::: definition 绝对极值和局部极值
设 $c$ 是函数 $f$ 定义域 $D$ 中的一个数。

- $f(c)$ 是 **绝对最大值**，当 $f$ 在 $f(c) \ge f(x)$ 对于每一个 $x$ 属于 $D$，并且 **绝对最小值**，当 $f(c) \le f(x)$ 对于每一个 $x$ 属于 $D$。
- $f(c)$ 是 **局部最大值**，当 $f$ 满足 $f(c) \ge f(x)$ 对于某个包含 $c$ 且位于 $D$ 内的开区间内的每个 $x$，以及 **局部最小值**，当 $f(c) \le f(x)$ 对于这样的区间内的每个 $x$。

最大值和最小值统称为**最值**，英文复数为**extrema**，单数为**extremum**。$f$ **在**区间 $I$ 上的全局最大值，是把 $f$ 的定义域限制到 $I$ 后得到的全局最大值。其他几种最值类似。
:::

绝对极值也称为**全局**。模块3中区间上的最大值即为该区间上的绝对最大值。“局部”意为“与两侧的点相比”，因此在本系列中，定义域的端点永远不是局部极值；部分书籍允许其为局部极值，故在阅读其他资料时需确认所用约定。

看几个例子。$x^2$ 在 0 处取全局最小值 0，这也是局部极小值，但它没有最大值。$x^3$ 没有极值，因为任意数 $c$ 附近既有使 $x^3$ 大于 $c^3$ 的点，也有使前者小于后者的点。$\cos x$ 在 $x = 0, \pm2\pi, \pm4\pi, \dots$ 处取全局最大值 1，在 $x = \pm\pi, \pm3\pi, \dots$ 处取全局最小值 $-1$，两者也是局部极值。图 8.1 的全局最大值为 $f(-1) = \tfrac{91}{12} \approx 7.58$，但因 $-1$ 是端点，所以它并非局部极大值。$f(5) = -\tfrac{125}{12} \approx -10.42$ 既是全局最小值，也是局部极小值；$f(2) = \tfrac{16}{3}$ 是局部极大值，$f(0) = 0$ 是局部极小值。

```check
same(minimum(x**2, x, S.Reals), 0); same(maximum(x**2, x, S.Reals), oo)
same(maximum(cos(x), x, S.Reals), 1); same(minimum(cos(x), x, S.Reals), -1)
same([cos(2*k_*pi) for k_ in (0, 1, 2)], [1, 1, 1]); same([cos((2*k_ + 1)*pi) for k_ in (-1, 0, 1)], [-1, -1, -1])
rounds(Rational(91, 12), '7.58'); rounds(-Rational(125, 12), '-10.42')
```

图 8.1 中的每一个局部极值点，导数都为零。这并非偶然。

::: theorem 弗拉芒定理
如果 $f$ 在 $c$ 处有局部最大值或局部最小值，且 $f'(c)$ 存在，则 $f'(c) = 0$。
:::

::: proof
假设首先 $f(c)$ 是一个局部最大值：$f(x) \le f(c)$ 对于围绕 $c$ 的某个开区间内的每个 $x$，$h \ne 0$，只要 $c + h$ 位于该区间内，$f(c + h) - f(c) \le 0$，因此差商

$$\frac{f(c + h) - f(c)}{h}$$

是 $\le 0$ 当 $h > 0$ 且 $\ge 0$ 当 $h < 0$。当 $h \to 0$ 时，它趋于 $f'(c)$。如果 $f'(c)$ 为正，则对于足够小的 $h$，商值将落在 $f'(c)/2$ 的 $f'(c)$ 附近，因此它们将是正的；但事实上它们不是，因为 $h > 0$。如果 $f'(c)$ 为负，则对于足够小的 $h < 0$，商值将是负的，但事实上它们也不是。因此 $f'(c) = 0$。如果 $f(c)$ 是局部最小值，则 $-f$ 在 $c$ 处有局部最大值，且第一部分给出 $-f'(c) = 0$。
:::

```check
ff = Function('f')
same((-ff(c + h) - (-ff(c)))/h, -((ff(c + h) - ff(c))/h))
```

::: pitfall
拉格朗日定理仅说明这一点：在局部极值点且 $f'$ 存在的情况下，有 $f' = 0$。它不能反过来使用，并且在假设不成立时它什么也没说。

- **水平切线但无极值。** 对于 $f(x) = x^3$, $f'(0) = 0$，但在 0 处无极值，如上所述。
- **无导数的极值。** $\abs{x}$ 在 0 处取得绝对最小值，且在该点无导数（模块 4）。
- **端点处的极值。** 在 $[0, 1]$ 上， $f(x) = x$ 在 1 处取得绝对最大值，此时斜率为 1。端点不是局部极值，因此定理不适用。
:::

```check
same(diff(x**3, x).subs(x, 0), 0); holds((-Rational(1, 10))**3 < 0); holds(Rational(1, 10)**3 > 0)
limit_is(Abs(h)/h, h, 0, 1, '+'); limit_is(Abs(h)/h, h, 0, -1, '-')
same(diff(x, x), 1)
```

因此，局部极值的候选点是 $f' = 0$ 处的点以及 $f'$ 不存在的点。

::: definition 临界数
一个 **极值点** of $f$ 是定义域 $c$ 中的一个数 $f$，在该点 $f'(c) = 0$ 或 $f'(c)$ 不存在。
:::

一些书称 **临界点**。用这些术语，费马定理说： **每个局部极值都在一个临界数处。** 并非每个临界数都给出极值（例如 $x^3$ 在 0 处不给出极值），因此临界数只是候选点。

::: example 临界数
求 (a) $f(x) = 2x^3 - 3x^2 - 12x + 1$ 和 (b) $g(x) = x^{2/3}(x - 5)$ 的临界点，其中 $x^{2/3} = \big(\sqrt[3]{x}\big)^2$ 表示实数立方根，如模块 4 所示。

**(a)** $f$ 是一个多项式，处处可导，因此其临界点是 $f'(x) = 0$ 的解：

$$\begin{aligned} f'(x) &= 6x^2 - 6x - 12 \\ &= 6(x^2 - x - 2) = 6(x - 2)(x + 1). \end{aligned}$$

临界点为 $-1$ 和 $2$。

**(b)** 展开 $g(x) = x^{5/3} - 5x^{2/3}$，并使用实数指数的幂法则（模块 6），该法则在实数立方根的任意 $x \ne 0$ 处均成立：

$$\begin{aligned} g'(x) &= \tfrac53 x^{2/3} - \tfrac{10}{3}x^{-1/3} \\ &= \tfrac53 x^{-1/3}(x - 2) = \frac{5(x - 2)}{3\sqrt[3]{x}}, \quad x \ne 0. \end{aligned}$$

（为因式分解，写出 $x^{2/3} = x^{-1/3}\cdot x$。）因此 $g'(x) = 0$ 在 $x = 2$ 处。在 0 处， $g$ 有定义， $g(0) = 0$，但 $g'(0)$ 不存在：差商

$$\frac{g(h) - g(0)}{h} = \frac{h^{2/3}(h - 5)}{h} = \frac{h - 5}{\sqrt[3]{h}}$$

趋向于 $-\infty$ 当 $h \to 0^+$ 时，趋向于 $\infty$ 当 $h \to 0^-$ 时：一个类似模块 4 中 $x^{2/3}$ 的拐点，但向上。 $g$ 的临界点为 0 和 2。

```check
f81 = 2*x**3 - 3*x**2 - 12*x + 1
steps(diff(f81, x), 6*x**2 - 6*x - 12, 6*(x**2 - x - 2), 6*(x - 2)*(x + 1))
same_set(solve(diff(f81, x), x), [-1, 2])
xp = symbols('x', positive=True); xn = symbols('x', negative=True)
gR = lambda X: real_root(X, 3)**2*(X - 5)                        # x^(2/3)(x - 5) with the real cube root
same(expand(gR(xp)), xp**Rational(5, 3) - 5*xp**Rational(2, 3))
same(diff(gR(xp), xp), Rational(5, 3)*xp**Rational(2, 3) - Rational(10, 3)*xp**Rational(-1, 3))
same(diff(gR(xp), xp), 5*(xp - 2)/(3*real_root(xp, 3)))
same(diff(gR(xn), xn), 5*(xn - 2)/(3*real_root(xn, 3)))          # the same formula for x < 0
same(Rational(5, 3)*xp**Rational(-1, 3)*(xp - 2), Rational(5, 3)*xp**Rational(2, 3) - Rational(10, 3)*xp**Rational(-1, 3))
same(gR(0), 0); same(gR(Integer(2)), -3*2**Rational(2, 3))
same((gR(xp) - 0)/xp, (xp - 5)/real_root(xp, 3))
limit_is((h - 5)/real_root(h, 3), h, 0, -oo, '+'); limit_is((h - 5)/real_root(h, 3), h, 0, oo, '-')
```
:::

### 闭区间方法 {#closed-interval}

模块3的极值定理承诺，在闭区间$[a, b]$上连续的函数在该区间内存在绝对最大值和绝对最小值。费马定理指出了寻找它们的位置。

::: theorem 闭区间方法
设 $f$ 在闭区间 $[a, b]$ 上连续。则 $f$ 在 $[a, b]$ 上取得绝对最大值和绝对最小值，且每个极值都是 $f$ 在端点 $a$ 或 $b$ 处，或在 $f$ 在 $(a, b)$ 内的临界点处取得的值。
:::

::: proof
由最值定理，$f$ 在 $[a, b]$ 上的全局最大值在 $[a, b]$ 中某点 $c$ 处取到。若 $c$ 是 $a$ 或 $b$，证明即告完成。否则 $a < c < b$，且对含 $c$ 的开区间 $(a, b)$ 中每个 $x$ 都有 $f(c) \ge f(x)$，所以 $f(c)$ 是局部极大值。若 $f'(c)$ 不存在，$c$ 即为临界值。若该导数存在，则由费马定理它等于 0，因此 $c$ 仍为临界值。最小值的证明类似。
:::

::: keyidea
**闭区间法.** 求连续函数 $f$ 在 $[a, b]$ 上的绝对最大值和最小值:

1. 找出 $f$ 在 $(a, b)$ 内的临界点.
2. 在这些临界点以及 $a$ 和 $b$ 处计算 $f$ 的值.
3. 这些值中最大的一个是绝对最大值；最小的一个是绝对最小值.
:::

不需要对临界点进行测试：你只需比较一个简短的数值列表.

::: example 闭区间方法
求 (a) $f(x) = 2x^3 - 3x^2 - 12x + 1$ 在 $[-2, 3]$ 上，以及 (b) $g(x) = x^{2/3}(x - 5)$ 在 $[-1, 4]$ 上的绝对最大值和最小值，即例 8.1 中的函数.

**(a)** $f$ 是一个多项式，因此是连续的，且它的两个临界点 $-1$ 和 2 都在 $(-2, 3)$ 内。在这些点以及端点处的值：

| $x$ | $-2$ | $-1$ | $2$ | $3$ |
|---|---|---|---|---|
| $f(x)$ | $-3$ | $8$ | $-19$ | $-8$ |

例如 $f(-1) = -2 - 3 + 12 + 1 = 8$。绝对最大值是 8，在 $x = -1$ 处；绝对最小值是 $-19$，在 $x = 2$ 处；此处两者都在区间内部。

**(b)** 实数的立方根在所有实数上都是连续的（模块 3），因此 $g$ 在 $[-1, 4]$ 上连续，且它的两个临界点 0 和 2 都位于 $(-1, 4)$ 内。由于 $(-1)^{2/3} = \big(\sqrt[3]{-1}\big)^2 = (-1)^2 = 1$，$4^{2/3} = \sqrt[3]{16}$ 和 $2^{2/3} = \sqrt[3]{4}$：

| $x$ | $-1$ | $0$ | $2$ | $4$ |
|---|---|---|---|---|
| $g(x)$ | $-6$ | $0$ | $-3\sqrt[3]{4} \approx -4.762$ | $-\sqrt[3]{16} \approx -2.520$ |

绝对最大值为 0，在拐点 $x = 0$ 处取得，此时 $g'$ 不存在；绝对最小值为 $-6$，在端点 $x = -1$ 处取得。单独求解 $g'(x) = 0$ 将无法找到这些极值。

```check
same([f81.subs(x, v_) for v_ in (-2, -1, 2, 3)], [-3, 8, -19, -8]); same(-2 - 3 + 12 + 1, 8)
same(maximum(f81, x, Interval(-2, 3)), 8); same(minimum(f81, x, Interval(-2, 3)), -19)
same(real_root(-1, 3)**2, 1); same(real_root(4, 3)**2, real_root(16, 3)); same(real_root(2, 3)**2, real_root(4, 3))
same([gR(Integer(v_)) for v_ in (-1, 0, 2, 4)], [-6, 0, -3*real_root(4, 3), -real_root(16, 3)])
rounds(-3*real_root(4, 3), '-4.762'); rounds(-real_root(16, 3), '-2.520')
holds(-6 < -3*real_root(4, 3)); holds(-real_root(16, 3) < 0)
```
:::

::: pitfall
使用闭区间法处理三张纸条。忽略端点：例8.2(b)中的最小值在1处。忽略$f'$不存在的点：最大值在1处。使用区间外的临界点：在$[0, 3]$上，(a)部分的函数仅有临界数2，其值$f(0) = 1$、$f(2) = -19$和$f(3) = -8$给出最大值1，且数$f(-1) = 8$根本不是$f$在$[0, 3]$上的值。最后，该方法需要一个在闭区间上连续的函数。$1/x$甚至在0处未定义，而0位于$[-1, 1]$中，且它在该处没有最大值：$1/x \to \infty$当$x \to 0^+$时。
:::

```check
same(f81.subs(x, 0), 1); same(maximum(f81, x, Interval(0, 3)), 1)
limit_is(1/x, x, 0, oo, '+')
```

::: compute 使用SymPy的闭区间法
`sp.solve(expr, x)`返回方程$\text{expr} = 0$的解列表。利用它，例8.2(a)的闭区间法只需几行代码：

```python
import sympy as sp
x = sp.symbols('x')
f = 2*x**3 - 3*x**2 - 12*x + 1
crit = sp.solve(sp.diff(f, x), x)       # where f'(x) = 0
print(crit)
for c in [-2] + crit + [3]:             # the critical numbers and the endpoints
    print(c, f.subs(x, c))
```

```output
[-1, 2]
-2 -3
-1 8
2 -19
3 -8
```

两个临界点都位于 $(-2, 3)$；一般来说，只保留区间内的那些。现在看第 (b) 部分。Python 和 SymPy 都将负数的 $x^{2/3}$ 次幂视为复数，如 [第 1.7 节 ](module_01_ZH.html#first-session) 所示对于 $(-8)^{1/3}$，因此将 $x^{2/3}$ 写成 `sp.cbrt(x**2)`，即 $x^2 \ge 0$ 的立方根，对于每个 $x$ 都是实数：

```python
g = sp.cbrt(x**2)*(x - 5)
dg = sp.simplify(sp.diff(g, x))
print(dg)
print(sp.solve(dg, x), dg.subs(x, 0))
print(sp.N((x**sp.Rational(2, 3)*(x - 5)).subs(x, -1)), g.subs(x, -1))
```

```output
5*(x - 2)*(x**2)**(1/3)/(3*x)
[2] nan
3.0 - 5.19615242270663*I -6
```

SymPy 的导数形式与例 8.1 不同，但对于 $x \ne 0$、$(x^2)^{1/3}/x = 1/\sqrt[3]{x}$，因此是 $\dfrac{5(x - 2)}{3\sqrt[3]{x}}$。`solve` 找到 $g'$ 的零点 2，但未找到临界点 0，因为在 $g'$ 处不存在；代入 0 得到 `nan`。你自己寻找 $f'$ 未定义的点。最后一行显示了陷阱：在 $-1$ 处的 `x**sp.Rational(2, 3)` 是复数 $3 - 5.196i$，而不是 $g(-1) = -6$。
:::

```check
same(simplify(real_root(xp**2, 3)/xp - 1/real_root(xp, 3)), 0); same(simplify(real_root(xn**2, 3)/xn - 1/real_root(xn, 3)), 0)
same(expand_complex((x**Rational(2, 3)*(x - 5)).subs(x, -1)), 3 - 3*sqrt(3)*I); rounds(3*sqrt(3), '5.196')
```

## 微分中值定理 {#mvt}

在一些道路上，使用 **平均速度摄像头** 来检测车速。一台摄像头记录一辆车通过它的时间，另一台位于已知距离更远的摄像头也做同样的记录，车辆的平均速度是距离除以时间。假设，从理论上讲，这两个摄像头相距 5 公里，限速为 80 公里/小时，一辆车通过第二个摄像头比第一个晚 3 分钟。它的平均速度是

$$\frac{5 \text{ km}}{\tfrac{1}{20} \text{ h}} = 100 \text{ km/h}.$$

其驾驶员可能会抗议说，没有任何摄像头显示他们以 100 公里/小时的速度行驶。但在两个摄像头之间某个时刻，车速表确实显示过恰好 100 公里/小时。保证这一点的定理是平均值定理，它将平均变化率与瞬时变化率联系起来，是本模块其余内容的关键。其特殊情形首先介绍。

```check
same(Rational(3, 60), Rational(1, 20)); same(5/Rational(1, 20), 100)
```

::: theorem 罗尔定理
设 $f$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导，且 $f(a) = f(b)$。则存在 $c$ 属于 $(a, b)$，使得 $f'(c) = 0$。
:::

::: proof
根据极值定理，$f$ 在 $[a, b]$ 上有绝对最大值和绝对最小值。如果这两个极值都在端点取得，它们相等，因为 $f(a) = f(b)$；则 $f$ 在 $[a, b]$ 上的最大值和最小值是同一个数，即 $f$ 是常数，且 $f'(c) = 0$ 对于 $c$ ∈ $(a, b)$ 恒成立。否则，其中一个极值在区间内部某点 $c$ 取得。如定理 8.2 的证明所示，此时 $f(c)$ 是局部极值；由于 $f$ 在 $(a, b)$ 上可导，所以 $f'(c)$ 存在；因此，根据费马定理，有 $f'(c) = 0$。
:::

图形上（图 8.2，左）：一个光滑的图像若开始和结束于同一高度，则中间必定有一个拐点，且在拐点处其切线是水平的。

::: figure id=fig-08-2
左：对于 $f(x) = x^3 - 3x$ 在 $[a, b] = [-2, 1]$ 上的罗尔定理，其中 $f(a) = f(b) = -2$：在 $c = -1$ 处的切线是水平的。右：同一函数在 $[-2, 2]$ 上的中值定理：从 $(-2, -2)$ 到 $(2, 2)$ 的割线斜率为 1，且在 $c_1 = -2/\sqrt3$ 和 $c_2 = 2/\sqrt3$ 处的切线斜率也为 1。中值定理是罗尔定理的倾斜版本：割线取代了水平线段，与之平行的切线取代了水平切线。
:::

```check
f82 = x**3 - 3*x
same(f82.subs(x, -2), -2); same(f82.subs(x, 1), -2); same_set(solve(diff(f82, x), x), [-1, 1]); same(f82.subs(x, -1), 2)
same((f82.subs(x, 2) - f82.subs(x, -2))/(2 - (-2)), 1); same_set(solve(diff(f82, x) - 1, x), [-2/sqrt(3), 2/sqrt(3)])
holds(-2 < -2/sqrt(3)); holds(2/sqrt(3) < 2)
```

每个假设都是必要的。若缺少闭区间上的连续性：$f(x) = x$对于$0 \le x < 1$且$f(1) = 0$成立$f(0) = f(1)$，但$f'(x) = 1$在$(0, 1)$上不成立。若缺少可微性：$\abs{x}$在$[-1, 1]$上端点值相等，但其导数在存在处为$-1$或1。若缺少$f(a) = f(b)$：$x$在$[0, 1]$上斜率处处为1。

```check
fjump = Piecewise((x, x < 1), (0, True))
same(fjump.subs(x, 0), fjump.subs(x, 1)); same(diff(x, x), 1)                     # f(0) = f(1) = 0, and slope 1 on (0, 1)
same(fjump.subs(x, Rational(99, 100)), Rational(99, 100)); limit_is(x, x, 1, 1, '-'); holds(fjump.subs(x, 1) != 1)   # left of 1, f(x) = x -> 1 != f(1): a jump
same(Abs(-1), Abs(1)); same(diff(Abs(xp), xp), 1); same(diff(Abs(xn), xn), -1)
```

::: example 恰好一个实根
证明方程 $x^5 + 3x - 1 = 0$ 有且仅有一个实数解。

设 $f(x) = x^5 + 3x - 1$ 为多项式，因此在全体实数上连续且可导。

**至少有一个。** $f(0) = -1 < 0$和 $f(1) = 3 > 0$，因此根据中间值定理（模块3），在0和1之间存在一个解。

**至多有一个。** 假设有两个， $r < s$，且 $f(r) = f(s) = 0$。根据罗尔定理作用于 $[r, s]$，其间会存在一个 $c$，使得 $f'(c) = 0$。但 $f'(x) = 5x^4 + 3 \ge 3$ 对于每一个 $x$ 都成立，因此 $f'$ 永远不为0。所以恰好有一个解；牛顿法（模块7）给出 $x \approx 0.33199$。

```check
p83 = x**5 + 3*x - 1
same(p83.subs(x, 0), -1); same(p83.subs(x, 1), 3)
same(diff(p83, x), 5*x**4 + 3); same(minimum(5*x**4 + 3, x, S.Reals), 3)
same(len(real_roots(p83)), 1); rounds(nsolve(p83, x, 0.3), '0.33199')
```
:::

现在倾斜图像。在图8.2右侧，图象的两端处于不同的高度，连接它们的割线斜率为1。在中间的 $c_1$ 和 $c_2$ 处，切线平行于割线。

::: theorem 微分中值定理
设 $f$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导。则存在 $c$ 属于 $(a, b)$，使得

$$f'(c) = \frac{f(b) - f(a)}{b - a},$$

即， $f(b) - f(a) = f'(c)(b - a)$。
:::

::: proof
设 $m = \dfrac{f(b) - f(a)}{b - a}$ 为割线的斜率，令

$$h(x) = f(x) - \big(f(a) + m(x - a)\big),$$

图形在割线以上的高度。与 $f$ 类似， $h$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导，因为它等于 $f$ 减去一个线性函数。在端点 $h(a) = 0$ 和 $h(b) = f(b) - f(a) - m(b - a) = 0$ 处。根据罗尔定理，在 $(a, b)$ 内存在一点 $c$，使得 $h'(c) = 0$。由于 $h'(c) = f'(c) - m$，这说明 $f'(c) = m$。
:::

```check
fm = Function('f')
mm = (fm(b) - fm(a))/(b - a)
hh = fm(x) - (fm(a) + mm*(x - a))
same(hh.subs(x, a), 0); same(hh.subs(x, b), 0); same(diff(hh, x), diff(fm(x), x) - mm)
```

名称中的 **mean** 指的是平均值： $f$ 在 $[a, b]$ 上的平均变化率等于其在某一点的瞬时变化率。

::: example 平均速度测速仪
证明关于通过两个测速仪的汽车的主张，两个测速仪相距 5 公里，时间间隔为 3 分钟。

以汽车通过第一台摄像机的时刻为起始点，用 $t$ 表示经过的时间（小时），用 $s(t)$ 表示此时汽车行驶的距离（公里）。因此 $s(0) = 0$ 和 $s\big(\tfrac{1}{20}\big) = 5$。汽车不会跳跃，且其瞬时速度 $s'(t)$ 在每一时刻都存在（即速度表所显示的数值），因此 $s$ 在 $\big[0, \tfrac{1}{20}\big]$ 上连续，在 $\big(0, \tfrac{1}{20}\big)$ 上可导。根据中值定理，在 0 与 $\tfrac{1}{20}$ 之间存在一个时刻 $c$，使得

$$s'(c) = \frac{s\big(\tfrac{1}{20}\big) - s(0)}{\tfrac{1}{20} - 0} = \frac{5}{1/20} = 100 \text{ km/h}.$$

在该时刻，汽车以 100 公里/小时的速度行驶，超过限速 20 公里/小时。定理并未说明何时发生，它只是说明这样的时刻存在。

```check
same((5 - 0)/(Rational(1, 20) - 0), 100); same(100 - 80, 20)
```
:::

::: pitfall
中值定理说明存在一个合适的 $c$，但并未说明具体位置，可能存在多个：如图 8.2 所示有两个。并且它需要满足其前提条件。在 $[-1, 2]$ 上， $\abs{x}$ 的割线斜率为 $\dfrac{2 - 1}{2 - (-1)} = \dfrac13$，但其导数在存在之处为 $-1$ 或 1，从不等于 $\tfrac13$： $\abs{x}$ 在区间内部的 0 处不可导。
:::

```check
same((Abs(2) - Abs(-1))/(2 - (-1)), Rational(1, 3))
```

### 后果 {#consequences}

拉格朗日中值定理将关于 $f'$ 的信息转化为关于 $f$ 的信息。第一个结论：一个函数在其定义域内的每个点导数为 0，则该函数保持不变。将其作为运动的陈述，它表示一个在一段时间内速度始终为 0 的物体不会移动；但即使如此也需要证明，而该证明需要中值定理。

::: theorem 导数为零的函数
如果 $f'(x) = 0$ 对于每一个 $x$ 在开区间 $I$ 内成立，则 $f$ 在 $I$ 上为常数。
:::

::: proof
设 $x_1 < x_2$ 为 $I$ 中的两个数。由于 $f$ 在 $I$ 上可导，因此它在 $[x_1, x_2]$ 上连续（[定理 4.1](module_04_ZH.html#continuity)），并在 $(x_1, x_2)$ 上可导。根据中值定理，存在某个 $c$ 介于它们之间，使得 $f(x_2) - f(x_1) = f'(c)(x_2 - x_1)$，且 $f'(c) = 0$。因此 $f(x_1) = f(x_2)$：在 $I$ 上，$f$ 的任意两个值相等。
:::

::: theorem 导数相等的函数
如果 $f'(x) = g'(x)$ 对于定义域 $I$ 内的每一个 $x$，则 $f - g$ 在 $I$ 上为常数：存在一个数 $C$，使得 $f(x) = g(x) + C$ 对于 $x$ ∈ $I$ 恒成立。
:::

::: proof
$(f - g)' = f' - g' = 0$ 在 $I$ 上成立，因此根据定理 8.5， $f - g$ 在 $I$ 上为常数。
:::

所以，两个在区间上导数相同的函数相差一个常数：它们的图像互为垂直平移。模块 10 建立在此基础上；这也是为什么每个原函数都以 "$+\,C$" 结尾。

```check
gm = Function('g')
same(diff(fm(x) - gm(x), x), diff(fm(x), x) - diff(gm(x), x))
same(diff(x**2 + 7, x), diff(x**2, x))
```

::: example 由导数得出的恒等式
证明对于 $x$ ∈ $[-1, 1]$， $\arcsin x + \arccos x = \dfrac{\pi}{2}$ 成立。

设 $F(x) = \arcsin x + \arccos x$。对于 $-1 < x < 1$，模块 6 中的导数给出

$$F'(x) = \frac{1}{\sqrt{1 - x^2}} - \frac{1}{\sqrt{1 - x^2}} = 0,$$

因此由定理8.5，$F$在$(-1, 1)$上为常数。其在0处的值为$0 + \dfrac{\pi}{2}$，故$F(x) = \dfrac{\pi}{2}$对$-1 < x < 1$成立。在端点处，$F(1) = \dfrac{\pi}{2} + 0$和$F(-1) = -\dfrac{\pi}{2} + \pi = \dfrac{\pi}{2}$。因此$F(x) = \dfrac{\pi}{2}$在$[-1, 1]$的整个区间上成立。模块6从加法公式证明了同一恒等式；此处一个导数为0的证明完成了它。

```check
same(diff(asin(x), x), 1/sqrt(1 - x**2)); same(diff(acos(x), x), -1/sqrt(1 - x**2)); same(diff(asin(x) + acos(x), x), 0)
same(asin(0) + acos(0), pi/2); same(asin(1) + acos(1), pi/2); same(asin(-1) + acos(-1), pi/2)
same(asin(-1), -pi/2); same(acos(-1), pi)
```
:::

::: pitfall
区间是有影响的。模块 6 发现 $\arctan x + \arctan\dfrac1x$ 在每个 $x \ne 0$ 处导数为 0，但它等于 $\dfrac{\pi}{2}$ 在 $x > 0$ 处，等于 $-\dfrac{\pi}{2}$ 在 $x < 0$ 处。它的定义域 $(-\infty, 0) \cup (0, \infty)$ 是两个区间，定理 8.5 对每个区间分别适用，每个区间都有自己的常数。
:::

```check
same(diff(atan(x) + atan(1/x), x), 0); same(atan(1) + atan(1), pi/2); same(atan(-1) + atan(-1), -pi/2)
```

:::: deeper 柯西中值定理与洛必达法则的证明
模块 7 一般地陈述了洛必达法则，仅证明了其简单形式，并承诺在此处给出一般形式的证明。它依赖于两个函数的中值定理。

::: theorem 柯西中值定理
设 $f$ 和 $g$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导。则存在 $c$ 属于 $(a, b)$，使得

$$\big(f(b) - f(a)\big)g'(c) = \big(g(b) - g(a)\big)f'(c).$$

如果对于 $(a, b)$ 中的每个 $x$，也有 $g'(x) \ne 0$，那么 $g(b) \ne g(a)$，且

$$\frac{f(b) - f(a)}{g(b) - g(a)} = \frac{f'(c)}{g'(c)}.$$
:::

::: proof
设$h(x) = \big(f(b) - f(a)\big)g(x) - \big(g(b) - g(a)\big)f(x)$。它在$[a, b]$上连续，在$(a, b)$上可微，展开后表明$h(a) = f(b)g(a) - f(a)g(b) = h(b)$。由罗尔定理，存在$(a, b)$中的某个$c$使得$h'(c) = 0$，此为第一个方程。若在$(a, b)$上$g' \ne 0$，则$g(b) \ne g(a)$，否则罗尔定理将给出$g'$的一个零点；因此你可以除以$\big(g(b) - g(a)\big)g'(c)$。
:::

对于$g(x) = x$而言，它是微分中值定理。回顾一般规则，如[定理7.5](module_07_ZH.html#the-rule)所述：设$f$和$g$在包含$a$的开区间$I$上可微，$a$处除外，且当$x \ne a$属于$I$时$g'(x) \ne 0$成立；若$f(x)/g(x)$具有$x \to a$所指的$0/0$或$\infty/\infty$的形式，且$f'(x)/g'(x) \to L$为实数或$\pm\infty$，则$f(x)/g(x) \to L$成立；该结论对单侧极限及$x \to \pm\infty$同样适用。

::: proof 洛必达法则
**从右边的表达式 $0/0$。** 假设 $f$ 和 $g$ 在 $(a, b)$ 上可导，且在 $g' \ne 0$ 处有 $f(x) \to 0$ 和 $g(x) \to 0$ 作为 $x \to a^+$，并有 $f'(x)/g'(x) \to L$。给 $f$ 和 $g$ 赋值 $f(a) = g(a) = 0$；这不会改变 $x \to a^+$ 的极限，且使 $f$ 和 $g$ 在 $[a, y]$ 上对每个 $y$ ∈ $(a, b)$ 连续。根据 $[a, y]$ 上的柯西定理，存在 $c_y$，使得 $a < c_y < y$ 和

$$\frac{f(y)}{g(y)} = \frac{f(y) - f(a)}{g(y) - g(a)} = \frac{f'(c_y)}{g'(c_y)}.$$

设 $L$ 为实数，且 $\varepsilon > 0$。存在 $\delta > 0$，使得 $a + \delta \le b$，当 $a < t < a + \delta$ 时 $\abs{f'(t)/g'(t) - L} < \varepsilon$。对于 $a < y < a + \delta$，数 $c_y$ 也在 $(a, a + \delta)$ 中，因此 $\abs{f(y)/g(y) - L} < \varepsilon$；即 $f(y)/g(y) \to L$ 当 $y \to a^+$。若 $L = \infty$，则用 "$f'(t)/g'(t) > M$" 替代 "$\abs{f'(t)/g'(t) - L} < \varepsilon$"，对任意 $M$，同样论证可得 $f(y)/g(y) > M$ 对 $a < y < a + \delta$ 成立； $L = -\infty$ 是相同的。

**其他方向。** 从左侧使用 $[y, a]$ 的方式相同。双边极限是一对单边极限。对于 $x \to \infty$，带 $I = (b, \infty)$，其中你可能通过收缩 $I$ 来取 $b > 0$，将 $F(t) = f(1/t)$ 和 $G(t) = g(1/t)$ 对应于 $0 < t < 1/b$。根据链式法则 $F'(t) = -f'(1/t)/t^2$ 和 $G'(t) = -g'(1/t)/t^2 \ne 0$，因此 $F'(t)/G'(t) = f'(1/t)/g'(1/t) \to L$ 作为 $t \to 0^+$，上述情况给出 $F(t)/G(t) \to L$，这说明 $f(x)/g(x) \to L$ 作为 $x \to \infty$。对于 $x \to -\infty$ 使用 $t = -1/x$。

**形式 $\infty/\infty$，从右侧，带 $L$ 实数。** 现在 $\abs{g(x)} \to \infty$ 作为 $x \to a^+$。令 $0 < \varepsilon < 1$，选择 $\delta$ 如前所述，并固定 $y = a + \delta$（如有必要，先收缩 $\delta$ 使得 $y < b$）。对于 $a < x < y$，柯西定理在 $[x, y]$ 上给出 $c$ 介于 $x$ 和 $y$ 之间。

$$Q = \frac{f(x) - f(y)}{g(x) - g(y)} = \frac{f'(c)}{g'(c)},$$

所以 $\abs{Q - L} < \varepsilon$ 和 $\abs{Q} < \abs{L} + 1$。对于 $x$ 非常接近 $a$ 使得 $g(x) \ne 0$，解 $f(x) = Q\big(g(x) - g(y)\big) + f(y)$ 得到比率。

$$\frac{f(x)}{g(x)} - L = (Q - L) - Q\,\frac{g(y)}{g(x)} + \frac{f(y)}{g(x)}.$$

由于 $y$ 是固定的，而 $\abs{g(x)} \to \infty$，最后两个分数在 $x \to a^+$ 趋于 0；对于 $x$ 足够接近 $a$，每个分数都小于 $\varepsilon$ 的大小，然后 $\abs{f(x)/g(x) - L} < \varepsilon + (\abs{L} + 1)\varepsilon + \varepsilon = (\abs{L} + 3)\varepsilon$。由于 $\varepsilon$ 是任意的，所以 $f(x)/g(x) \to L$。如果 $L = \infty$，取任意 $M > 0$，并选择 $y$ 在 $(a, b)$ 中使得 $f'(t)/g'(t) > 2M$ 对于 $a < t < y$；然后 $Q > 2M$ 对于每个 $x$ 在 $(a, y)$ 中。对于 $x$ 足够接近 $a$，也 $1 - g(y)/g(x) > \tfrac12$ 和 $\abs{f(y)/g(x)} < 1$，因此 $f(x)/g(x) = Q\big(1 - g(y)/g(x)\big) + f(y)/g(x) > M - 1$；由于 $M$ 是任意的，所以 $f(x)/g(x) \to \infty$。如果 $L = -\infty$，应用此结论于 $-f$。其他方向的证明与 $0/0$ 相同。
:::

形式为 $\infty/\infty$ 的证明只使用了 $\abs{g(x)} \to \infty$，而没有使用 $f(x) \to \pm\infty$：该规则在 $\abs{g(x)} \to \infty$ 和 $f'/g'$ 有极限时成立。

```check
Fc, Gc = Function('F'), Function('G')
hC = (Fc(b) - Fc(a))*Gc(x) - (Gc(b) - Gc(a))*Fc(x)
same(expand(hC.subs(x, a)), Fc(b)*Gc(a) - Fc(a)*Gc(b)); same(expand(hC.subs(x, b)), Fc(b)*Gc(a) - Fc(a)*Gc(b))
same(diff(Fc(1/t), t), -Subs(Derivative(Fc(u), u), u, 1/t)/t**2)
Q_, fx, fy, gx, gy, L_ = symbols('Q f_x f_y g_x g_y L')
same(solve(Eq(Q_*(gx - gy) + fy, fx), fx)[0]/gx - L_, (Q_ - L_) - Q_*gy/gx + fy/gx)
same(Q_*(1 - gy/gx) + fy/gx, (Q_*(gx - gy) + fy)/gx)
```
::::

## 单调函数（递增和递减函数） {#monotonic}

模块 4 观察到，当图像上升时，其切线的斜率向上，并承诺了一个部分的逆命题：在区间上，若 $f' > 0$，则 $f$ 上升。平均值定理可以给出这个结论。

::: definition 单调函数（递增和递减函数）
一个函数 $f$ 在一个区间 $I$ 上是 **增加**的，如果 $f(x_1) < f(x_2)$ 对于 $x_1 < x_2$ 在 $I$ 中的任意两点，且**减少** 在 $I$ 上是 $f(x_1) > f(x_2)$ 对于 $x_1 < x_2$ 在 $I$ 中的任意两点。
:::

这些是 [小节 4.3](module_04_ZH.html#graph-of-derivative)] 的定义。一些书称它们为 **严格** 增加和减少，并用“增加”表示较弱的 $f(x_1) \le f(x_2)$；本系列遵循 模块 4。

::: theorem 增加/减少判定法
设 $f$ 在区间 $I$ 上连续，并且在 $I$ 的每一点（除 $I$ 的端点外）处可导。

- 如果 $f'(x) > 0$ 在每一个这样的点处导数大于零，则 $f$ 在 $I$ 上是增加的。
- 如果 $f'(x) < 0$ 在每一个这样的点处导数小于零，则 $f$ 在 $I$ 上是减少的。
:::

::: proof
取 $I$ 中的 $x_1 < x_2$。于是 $f$ 在 $[x_1, x_2]$ 上连续，在 $(x_1, x_2)$ 上可微，后者的点都不是 $I$ 的端点。由微分中值定理，有 $f(x_2) - f(x_1) = f'(c)(x_2 - x_1)$，其中 $c$ 在 $x_1$ 和 $x_2$ 之间。若 $f' > 0$，两个因子均为正，故 $f(x_2) > f(x_1)$。若 $f' < 0$，乘积为负，故 $f(x_2) < f(x_1)$。
:::

端点可能属于 $I$： $x^2$ 在 $[0, \infty)$ 上递增，因为其导数 $2x$ 在 $x > 0$ 上为正，尽管在端点 0 处导数为 0。区间内导数 $f'$ 的一个零点也不会破坏结论： $x^3$ 在 $(-\infty, 0]$ 和 $[0, \infty)$ 上递增，因此对于 $x_1 < 0 < x_2$， $x_1^3 < 0 < x_2^3$， $x^3$ 在 $\R$ 上整体递增，尽管其导数在 0 处为 0。同样的论证适用于任意有限个零点。

```check
same(solve_univariate_inequality(2*x > 0, x, relational=False), Interval.open(0, oo))
same(diff(x**3, x), 3*x**2); same(solve(3*x**2, x), [0])
```

要使用该测试，你需要确定$f'$符号恒定的区间。如果$f'$在某个区间上连续且在该区间内永不为0，则它在该区间内不会变号，因为根据介值定理，变号必然需要中间存在零点。本模块中的每个导数在其存在的任何地方都是连续的，因此它只能在临界点和$f$定义域外的点处变号。在数轴上标记这些点；它们将数轴分割为若干区间，而$f'$在每个区间内一个测试点处的符号即为该区间整体的符号。这些符号的表格即为**符号表**。

::: note
并非每个导数都是连续的。函数 $x^2\sin(1/x)$ 在 [练习 4.11](module_04_ZH.html#ex-4-11)，在 0 处的值为 0] 中，每个点都有导数；但对于 $x \ne 0$，其导数为 $2x\sin(1/x) - \cos(1/x)$，当 $x \to 0$ 接近 $-1$ 与 1 之间时不断变化，因此在 0 处不连续。
:::

```check
gw = x**2*sin(1/x)
same(diff(gw, x), 2*x*sin(1/x) - cos(1/x)); limit_is(gw/x, x, 0, 0)                     # g'(0) = 0 from the definition
same([diff(gw, x).subs(x, 1/(2*k_*pi)) for k_ in (1, 2, 3)], [-1, -1, -1])                  # x = 1/(2k pi) -> 0
same([diff(gw, x).subs(x, 1/((2*k_ + 1)*pi)) for k_ in (1, 2, 3)], [1, 1, 1])              # x = 1/((2k+1) pi) -> 0
```

::: example 三次函数的增减变化
找出 $g(x) = 2x^3 - 9x^2 + 12x - 4$ 增加和减少的区间。

[例4.8](module_04_ZH.html#polynomials)发现$g'(x) = 6x^2 - 18x + 12 = 6(x - 1)(x - 2)$，它在1和2处连续且仅在这些点为0。符号图通过其因子的符号来判断$g'$的符号：

| 区间 | $x - 1$ | $x - 2$ | $g'(x)$ | $g$ |
|---|---|---|---|---|
| $x < 1$ | $-$ | $-$ | $+$ | 增加 |
| $1 < x < 2$ | $+$ | $-$ | $-$ | 减少 |
| $x > 2$ | $+$ | $+$ | $+$ | 增加 |

由于$g$是连续的，定理8.8允许你包含端点：$g$在$(-\infty, 1]$和$[2, \infty)$上递增，在$[1, 2]$上递减。特别是，图像从$(1, 1)$一直下降到$(2, 0)$，正如模块4所承诺的那样。

```check
g86 = 2*x**3 - 9*x**2 + 12*x - 4
same(factor(diff(g86, x)), 6*(x - 1)*(x - 2))
same(solve_univariate_inequality(diff(g86, x) > 0, x, relational=False), Union(Interval.open(-oo, 1), Interval.open(2, oo)))
same(solve_univariate_inequality(diff(g86, x) < 0, x, relational=False), Interval.open(1, 2))
same(g86.subs(x, 1), 1); same(g86.subs(x, 2), 0)
same([sign(v_ - 1) for v_ in (0, Rational(3, 2), 3)], [-1, 1, 1]); same([sign(v_ - 2) for v_ in (0, Rational(3, 2), 3)], [-1, -1, 1])
```
:::

### 一阶导数判别法 {#first-derivative-test}

在例8.6中，图像上升到$x = 1$然后下降：因此$g(1)$在该点有一个局部最大值。接着它下降到$x = 2$然后再次上升：$g(2)$是一个局部最小值。这种推理在每一个临界点都适用。

::: theorem 一阶导数判别法
设$c$为$f$的临界值，$f$在$c$处连续，$f$在$c$附近的开区间上可导，$c$本身除外。

- 如果 $f'$ 在 $c$ 处从正变负（即 $f'(x) > 0$ 对于 $x < c$ 和 $f'(x) < 0$ 对于 $x > c$，在该区间内），则 $f(c)$ 是一个局部最大值。
- 如果 $f'$ 在 $c$ 处由负变正，则 $f(c)$ 是一个局部最小值。
- 如果 $f'$ 在 $c$ 的两侧符号相同，则 $f$ 在 $c$ 处没有局部极值。
:::

::: proof
设区间为 $(p, q)$。假设在 $(p, c)$ 上有 $f' > 0$，在 $(c, q)$ 上有 $f' < 0$。在 $(p, c]$ 上，$f$ 连续（它在 $(p, c)$ 上可微，在 $c$ 处连续），由定理 8.8，它在该段递增，即 $p < x < c$ 时有 $f(x) < f(c)$。类似地，$f$ 在 $[c, q)$ 上递减，故 $c < x < q$ 时有 $f(x) < f(c)$。这样在整个 $(p, q)$ 上都有 $f(c) \ge f(x)$，所以这里是局部极大值。第二种情形类似，只需反转不等号。第三种情形中，若两侧均有 $f' > 0$，则 $f$ 在 $(p, c]$ 和 $[c, q)$ 上均递增，因此当 $p < x < c < y < q$ 时有 $f(x) < f(c) < f(y)$。在 $c$ 周围任一开区间内，都有使 $f$ 小于 $f(c)$ 的点，也有使它更大的点，因此 $f(c)$ 不是极值。$f' < 0$ 的情形类似。
:::

::: example 在拐点处的局部最大值
求 $g(x) = x^{2/3}(x - 5)$ 的局部极值，即例题 8.1 和 8.2 中的函数。

它的临界点是 0 和 2，且 $g'(x) = \dfrac{5(x - 2)}{3\sqrt[3]{x}}$ 对于 $x \ne 0$。立方根的符号由 $x$ 决定：

| 区间 | $x - 2$ | $\sqrt[3]{x}$ | $g'(x)$ | $g$ |
|---|---|---|---|---|
| $x < 0$ | $-$ | $-$ | $+$ | 增加 |
| $0 < x < 2$ | $-$ | $+$ | $-$ | 减少 |
| $x > 2$ | $+$ | $+$ | $+$ | 增加 |

$g$ 在 0 处连续，且 $g'$ 由正变负，因此 $g(0) = 0$ 是局部最大值，在 $g'$ 不存在的尖点处。在 2 处， $g'$ 由负变正，因此 $g(2) = -3\sqrt[3]{4} \approx -4.762$ 是局部最小值。

```check
same(solve_univariate_inequality(5*(xp - 2)/(3*real_root(xp, 3)) < 0, xp, relational=False), Interval.open(0, 2))
holds(5*(-1 - 2)/(3*real_root(-1, 3)) > 0); holds(5*(3 - 2)/(3*real_root(3, 3)) > 0); holds(5*(1 - 2)/(3*real_root(1, 3)) < 0)
same(sign(real_root(-8, 3)), -1); same(gR(0), 0)
```
:::

相同的推理可以证明一些用代数难以证明的不等式。

::: example $e^x$ 的一个不等式
证明对于每个实数 $x$， $e^x \ge 1 + x$ 都成立，仅在 $x = 0$ 处相等。

设 $f(x) = e^x - 1 - x$. 然后 $f'(x) = e^x - 1$. 由于 $e^x$ 是递增的且 $e^0 = 1$，$f'(x) < 0$ 对于 $x < 0$ 且 $f'(x) > 0$ 对于 $x > 0$. 根据定理 8.8，$f$ 在 $(-\infty, 0]$ 上递减，在 $[0, \infty)$ 上递增，因此 $f(x) > f(0) = 0$ 对于每一个 $x \ne 0$. 换句话说，$e^x > 1 + x$ 对于 $x \ne 0$，且 $e^0 = 1 + 0$. 从几何上看，$e^x$ 的图像位于其在 0 处的切线 $y = 1 + x$ 之上，即模块 7 的线性化；第 8.4 节解释了原因。

```check
f88 = exp(x) - 1 - x
same(diff(f88, x), exp(x) - 1); same(f88.subs(x, 0), 0)
same(solve_univariate_inequality(exp(x) - 1 < 0, x, relational=False), Interval.open(-oo, 0))
same(solve_univariate_inequality(exp(x) - 1 > 0, x, relational=False), Interval.open(0, oo))
same(minimum(f88, x, S.Reals), 0)
```
:::

::: pitfall
两个符号图。首先，$f'$ 也可能在定义域外的某一点变号，例如垂直渐近线，此时该点不存在极值：$f(x) = 1/x^2$ 在 $f'(x) = -2/x^3$ 处为正，在 $x < 0$ 处为负，但 $x > 0$ 没有最大值，因为 0 不在其定义域内，且 $f$ 在 $f(x) \to \infty$ 处趋近于 $x \to 0$。在图上标出这些点，但不要称它们为极值点。其次，“在 $(-\infty, 0)$ 和 $(0, \infty)$ 上递增”不等于“在 $(-\infty, 0) \cup (0, \infty)$ 上递增”：$-1/x$ 在每个区间上递增，但 $-1/(-1) = 1$ 大于 $-1/1 = -1$。
:::

```check
same(diff(1/x**2, x), -2/x**3); limit_is(1/x**2, x, 0, oo)
same(diff(-1/x, x), 1/x**2); same(-1/Integer(-1), 1); same(-1/Integer(1), -1)
```

## 凹凸性 {#concavity}

符号 $f'$ 表示图像是上升还是下降；它并不表示图像的弯曲程度。图 8.3 中的图像两部分都上升，但左侧部分向上弯曲，像碗的内侧；右侧部分向下弯曲，像穹顶。这条曲线是机器学习中的 **sigmoid 函数**。

$$\sigma(x) = \frac{1}{1 + e^{-x}},$$

读作“sigma of x”，它将任何实数转换为 0 和 1 之间的数。根据链式法则，$\sigma'(x) = \dfrac{e^{-x}}{(1 + e^{-x})^2}$。以下是它的导数：

```valuetable
x = -3, -2, -1, 0, 1, 2, 3
$\sigma'(x)$ = exp(-x)/(1 + exp(-x))**2
digits = 4
layout = columns
---
x | \sigma'(x)
-3 | 0.04518
-2 | 0.1050
-1 | 0.1966
0 | 0.25
1 | 0.1966
2 | 0.1050
3 | 0.04518
```

```check
sg = 1/(1 + exp(-x))
same(diff(sg, x), exp(-x)/(1 + exp(-x))**2)
holds(Integer(0) < sg.subs(x, -10)); holds(sg.subs(x, 10) < 1); same(function_range(sg, x, S.Reals), Interval.open(0, 1))
```

从左到右，斜率增加到 $x = 0$ 后再减少。在斜率增加的区域，曲线向上弯曲并位于其切线之上；在斜率减少的区域，曲线向下弯曲并位于其切线之下（图 8.3）。

::: figure id=fig-08-3
顶部：sigmoid 曲线 $y = \sigma(x)$ 在四个点处的切线。对于 $x < 0$（绿色），图像向上凹并位于其切线之上；对于 $x > 0$（紫色），图像向下凹并位于其切线之下。凹凸性在拐点 $(0, \tfrac12)$ 处发生变化。底部：斜率 $\sigma'(x)$ 在 $x < 0$ 时增加，在 $x > 0$ 时减少；它们在拐点 $\tfrac14$ 处达到最大值。
:::

::: definition 凹凸性
设$f$在开区间$I$上可微。若$f'$在$I$上递增，则$f$的图像在$I$上**凹向上**；若$f'$在$I$上递减，则**凹向下**在$I$上。
:::

在优化和机器学习中，一个图像向上凹的函数被称为 **凸函数**，而一个图像向下凹的函数被称为 **凹函数**。这两个词的范围稍广一些：它们也允许直线段，因此一条直线既被视为凸函数也视为凹函数。由于 $f''$ 是 $f'$ 的导数，将定理 8.8 应用于 $f'$ 可得到一个判定方法。

::: theorem 凹凸性判定
如果 $f''(x) > 0$ 对于每一个 $x$ 在一个开区间 $I$ 内，函数 $f$ 的图像在 $I$ 上向上凹；如果 $f''(x) < 0$ 对于每一个 $x$ 在 $I$ 内，函数在 $I$ 上向下凹。
:::

::: proof
$f'$ 在 $I$ 上可导，导数为 $f''$，因此它在 $I$ 上连续；根据定理 8.8 应用于 $f'$，若 $f'' > 0$ 则在 $I$ 上递增，若 $f'' < 0$ 则递减。
:::

图 8.3 中的切线行为适用于每一个函数。

::: theorem 凹凸性与切线
如果 $f$ 的图像在开区间 $I$ 上是凹向上，则对于 $I$ 中的每一个 $c$，它位于其在 $c$ 处的切线之上：

$$f(x) > f(c) + f'(c)(x - c)$$

对 $I$ 中的每个 $x \ne c$ 均成立。若图像在 $I$ 上凹向下，则它在切线下方。特别地，若图像在 $I$ 上凹向上且满足 $f'(c) = 0$，则 $f(c)$ 是 $f$ 在 $I$ 上的全局最小值，仅在 $c$ 处取到。若图像凹向下且 $f'(c) = 0$，则 $f(c)$ 是全局最大值。
:::

::: proof
取 $I$ 中的 $x > c$。由微分中值定理，有 $f(x) - f(c) = f'(t)(x - c)$，其中 $t$ 在 $(c, x)$ 中。由于 $f'$ 递增，且 $t > c$，故 $f'(t) > f'(c)$。乘以 $x - c > 0$ 得 $f(x) - f(c) > f'(c)(x - c)$。若 $x < c$，在 $[x, c]$ 上应用微分中值定理，得到 $f(c) - f(x) = f'(t)(c - x)$，其中 $x < t < c$，于是 $f'(t) < f'(c)$，且 $f(c) - f(x) < f'(c)(c - x)$。整理后得到相同的不等式。当 $f'(c) = 0$ 时，切线为 $y = f(c)$，所以对 $I$ 内其他每个 $x$ 都有 $f(x) > f(c)$。凹向下的情形类似，只需反转不等号方向。
:::

```check
D_ = symbols('D')                                       # D stands for f'(c)
same((fm(x) - fm(c)) - D_*(x - c), -((fm(c) - fm(x)) - D_*(c - x)))   # "f(c) - f(x) < D(c - x)" is "f(x) > f(c) + D(x - c)"
holds(exp(Rational(1, 2)) > 1 + Rational(1, 2)); holds(exp(-Rational(1, 2)) > 1 - Rational(1, 2))   # e^x above its tangent at 0
```

凹凸性发生变化的点有一个名称。

::: definition 拐点
函数 $f$ 的图像上一点 $(c, f(c))$ 是一个 **拐点**，如果 $f$ 在 $c$ 处连续，并且图像在 $c$ 处改变凹凸性：对于某个 $\delta > 0$，该点在 $(c - \delta, c)$ 上凹向上，在 $(c, c + \delta)$ 上凹向下，或者凹向下然后凹向上。
:::

::: theorem 拐点处的二阶导数
如果 $(c, f(c))$ 是拐点且 $f''(c)$ 存在，则 $f''(c) = 0$。
:::

::: proof
假设函数在$(c - \delta, c)$上凹向上，在$(c, c + \delta)$上凹向下，使得$f'$在第一区间递增，在第二区间递减。由于$f''(c)$存在，$f'$在$c$处可导，因此在该点连续。对于$c - \delta < x < y < c$，$f'(x) < f'(y)$，并令$y \to c$可得$f'(x) \le f'(c)$；同理，对于$c < x < c + \delta$有$f'(x) \le f'(c)$。因此$f'$在$c$处有局部最大值，根据费马定理，应用于$f'$，其在该点的导数为0：$f''(c) = 0$。另一种情况给出$f'$的局部最小值，结论相同。
:::

因此，拐点的候选点是 $f'' = 0$ 处的点以及 $f''$ 不存在的点，而 $f''$ 的符号图决定这一点。证明还表明，当 $f''$ 存在时，斜率 $f'$ 在拐点处有一个局部最大值或最小值：与邻域相比，图像在该点最陡或最平缓。

::: example S 型曲线的弯曲
对于 $\sigma(x) = \dfrac{1}{1 + e^{-x}}$，证明 $\sigma' = \sigma(1 - \sigma)$，求 $\sigma''$，函数的凹凸区间和拐点，以及 $\sigma'$ 的最大值。

由于 $1 - \sigma(x) = \dfrac{1 + e^{-x} - 1}{1 + e^{-x}} = \dfrac{e^{-x}}{1 + e^{-x}}$，

$$\begin{aligned} \sigma(x)\big(1 - \sigma(x)\big) &= \frac{1}{1 + e^{-x}}\cdot\frac{e^{-x}}{1 + e^{-x}} \\ &= \frac{e^{-x}}{(1 + e^{-x})^2} = \sigma'(x). \end{aligned}$$

对 $\sigma' = \sigma - \sigma^2$ 求导，使用链式法则对 $\sigma^2$：

$$\sigma'' = \sigma' - 2\sigma\sigma' = \sigma'(1 - 2\sigma).$$

由于 $\sigma' > 0$， $\sigma''$ 的符号由 $1 - 2\sigma$ 决定。现在 $1 - 2\sigma(x) > 0$ 恰好当 $\sigma(x) < \tfrac12$，即当 $1 + e^{-x} > 2$，即当 $e^{-x} > 1$，即当 $x < 0$。因此， $\sigma'' > 0$ 在 $x < 0$ 时成立， $\sigma'' < 0$ 在 $x > 0$ 时成立：函数在 $(-\infty, 0)$ 上凸向上，在 $(0, \infty)$ 上凸向下， $\big(0, \sigma(0)\big) = \big(0, \tfrac12\big)$ 是拐点。最后， $\sigma'$ 在 $(-\infty, 0]$ 上递增，在 $[0, \infty)$ 上递减（对 $\sigma'$ 应用定理 8.8，其导数为 $\sigma''$），因此其绝对最大值为 $\sigma'(0) = \tfrac14$：sigmoid 函数在拐点处最陡峭，如上表所示。

```check
steps(1 - sg, (1 + exp(-x) - 1)/(1 + exp(-x)), exp(-x)/(1 + exp(-x)))
steps(sg*(1 - sg), 1/(1 + exp(-x))*exp(-x)/(1 + exp(-x)), exp(-x)/(1 + exp(-x))**2, diff(sg, x))
same(diff(sg - sg**2, x), diff(sg, x) - 2*sg*diff(sg, x)); same(diff(sg, x, 2), diff(sg, x)*(1 - 2*sg))
same(solve_univariate_inequality(1 - 2*sg > 0, x, relational=False), Interval.open(-oo, 0))
same(solve_univariate_inequality(1 - 2*sg < 0, x, relational=False), Interval.open(0, oo))
same(sg.subs(x, 0), Rational(1, 2)); same(diff(sg, x).subs(x, 0), Rational(1, 4))
same(maximum(diff(sg, x), x, S.Reals), Rational(1, 4))
```
:::

在机器学习中，$\sigma(x)$ 将一个得分 $x$ 转换为概率。其斜率最大为 $\tfrac14$，并且当 $\abs{x}$ 很大时非常小，这在模型通过跟随斜率进行训练时（如第 8.7 节）非常重要。

::: pitfall
三个拐点问题。 **$f''(c) = 0$ 不够 **： $x^4$ 有 $f''(x) = 12x^2$，在 0 处为 0，但在两侧为正，因此图像在两侧均为上凸，没有拐点。 **$f''$ 在拐点处不一定存在 **： $x^{1/3}$ 有 $f''(x) = -\tfrac29x^{-5/3}$，在 $x < 0$ 处为正，在 $x > 0$ 处为负，因此原点是一个拐点（有垂直切线），尽管 $f''(0)$ 不存在。 **域外的凹凸性变化不是拐点**： $1/x$ 在 $x < 0$ 处为下凸，在 $x > 0$ 处为上凸，但 0 处没有定义点。 并且上凸不一定是递增的： $e^{-x}$ 是上凸且递减的。
:::

```check
same(diff(x**4, x, 2), 12*x**2); same(diff(xp**Rational(1, 3), xp, 2), -Rational(2, 9)*xp**Rational(-5, 3))
same(diff(-(-xn)**Rational(1, 3), xn, 2), -Rational(2, 9)*real_root(xn, 3)**(-5)); holds(-Rational(2, 9)*real_root(-1, 3)**(-5) > 0)
same(diff(1/x, x, 2), 2/x**3); same(diff(exp(-x), x, 2), exp(-x)); same(diff(exp(-x), x), -exp(-x))
```

### 二阶导数判别法 {#second-derivative-test}

在临界点 $f'(c) = 0$ 处，切线是水平的。如果该点处的图像向上凹，则在 $c$ 附近图像位于水平切线之上，形成一个山谷；如果向下凹，则图像位于水平切线之下，形成一个山峰。这就是二阶导数测试的思路，它不需要 $f'$ 的符号图。

::: theorem 二阶导数判别法
假设 $f'(c) = 0$ 和 $f''(c)$ 存在。

- 如果 $f''(c) > 0$，那么 $f(c)$ 是一个局部最小值。
- 如果 $f''(c) < 0$，那么 $f(c)$ 是一个局部最大值。
- 如果 $f''(c) = 0$，该测试无法提供信息。
:::

::: proof
假设 $f''(c) > 0$。由于 $f'(c) = 0$，

$$f''(c) = \lim_{x\to c}\frac{f'(x) - f'(c)}{x - c} = \lim_{x\to c}\frac{f'(x)}{x - c} > 0.$$

所以，正如费马定理的证明中那样，存在一个 $\delta > 0$，使得 $\dfrac{f'(x)}{x - c} > 0$ 当 $0 < \abs{x - c} < \delta$ 时：则 $f'(x) < 0$ 对于 $c - \delta < x < c$ 和 $f'(x) > 0$ 对于 $c < x < c + \delta$。 $f$ 在 $c$ 附近可导（因为 $f''(c)$ 存在），因此一阶导数判别法给出一个局部极小值。如果 $f''(c) < 0$，符号反转并给出一个局部极大值。对于第三种情况，三个函数 $x^4$、 $-x^4$ 和 $x^3$ 都在 $f'(0) = f''(0) = 0$ 处取得，它们在 0 处分别取得最小值、最大值和既不是极小值也不是极大值。
:::

```check
for f_, kind_ in ((x**4, 'min'), (-x**4, 'max'), (x**3, 'none')):
    same(diff(f_, x).subs(x, 0), 0); same(diff(f_, x, 2).subs(x, 0), 0)
same(minimum(x**4, x, S.Reals), 0); same(maximum(-x**4, x, S.Reals), 0)
```

::: example 当二阶导数检验失效时
求 $f(x) = x^4 - 4x^3$ 的局部极值和拐点。

导数为

$$\begin{aligned} f'(x) &= 4x^3 - 12x^2 = 4x^2(x - 3), \\ f''(x) &= 12x^2 - 24x = 12x(x - 2). \end{aligned}$$

**极值。**临界点为0和3。在3处，$f''(3) = 108 - 72 = 36 > 0$，因此$f(3) = 81 - 108 = -27$是局部极小值。在0处，$f''(0) = 0$，且该测试未给出结论。改用一阶导数测试：对于$x < 0$和$0 < x < 3$，$4x^2 > 0$和$x - 3 < 0$，因此$f'(x) < 0$在0的两侧。0处无极值：图像在下降过程中短暂变平。事实上，$f$在$(-\infty, 3]$上递减，在$[3, \infty)$上递增，因此$-27$是绝对极小值。

**凹凸性.** $f''(x) = 12x(x - 2)$ 在 $x < 0$ 处为正，在 $0 < x < 2$ 处为负，在 $x > 2$ 处为正。图像在 $(-\infty, 0)$ 上向上凹，在 $(0, 2)$ 上向下凹，在 $(2, \infty)$ 上向上凹，拐点为 $(0, 0)$ 和 $(2, f(2)) = (2, -16)$。在原点处，图像有水平切线且同时为拐点。

```check
f810 = x**4 - 4*x**3
steps(diff(f810, x), 4*x**3 - 12*x**2, 4*x**2*(x - 3)); steps(diff(f810, x, 2), 12*x**2 - 24*x, 12*x*(x - 2))
same_set(solve(diff(f810, x), x), [0, 3]); same(diff(f810, x, 2).subs(x, 3), 36); same(108 - 72, 36)
same(f810.subs(x, 3), -27); same(81 - 108, -27); same(diff(f810, x, 2).subs(x, 0), 0)
same(solve_univariate_inequality(diff(f810, x) < 0, x, relational=False), Union(Interval.open(-oo, 0), Interval.open(0, 3)))
same(solve_univariate_inequality(diff(f810, x) > 0, x, relational=False), Interval.open(3, oo))
same(minimum(f810, x, S.Reals), -27)
same(solve_univariate_inequality(diff(f810, x, 2) < 0, x, relational=False), Interval.open(0, 2))
same(solve_univariate_inequality(diff(f810, x, 2) > 0, x, relational=False), Union(Interval.open(-oo, 0), Interval.open(2, oo)))
same(f810.subs(x, 0), 0); same(f810.subs(x, 2), -16)
```
:::

::: tip
应该使用哪种测试？当 $f''$ 容易计算时，二阶导数测试非常快捷，并且可以决定大多数临界点，其中 $f'(c) = 0$。一阶导数测试在 $f'$ 在 $c$ 的两侧保持同号时适用，正如本模块中的每个函数所展示的那样，即使在 $f''(c) = 0$ 或 $f'(c)$ 不存在的地方也是如此。它的符号图还可以告诉你 $f$ 增加或减少的区间。
:::

## 曲线绘制 {#sketching}

计算机通过绘制许多点来画图；它不会告诉你哪些特征重要，而且它可能在点之间或窗口之外遗漏这些特征。导数可以找到这些特征，借助它们，你可以绘制出显示所有重要信息的图形。

::: keyidea
**绘制 $y = f(x)$ 的检查清单**

1. **定义域**： $f$ 在哪里有定义？
2. **截距**：当 0 在定义域内时， $y$ 轴截距 $f(0)$； $x$ 轴截距是方程 $f(x) = 0$ 的解，当你可以找到这些解时。
3. **对称性**: 是 $f$ 偶函数, $f(-x) = f(x)$, 或 $f(-x) = -f(x)$ ([小节 1.4](module_01_ZH.html#polynomials))? 是周期函数吗？
4. **渐近线**: 垂直渐近线, 水平渐近线和斜渐近线 (模块 3).
5. **增减性**: $f'$ 的符号图.
6. **局部极值**: 使用一阶导数或二阶导数检验.
7. **凹凸性与拐点**: $f''$ 的符号图.
8. **绘制**: 画出渐近线, 标出找到的点, 并用一条曲线连接, 使曲线按符号图所示上升, 下降和弯曲.
:::

::: example 绘制有理函数
绘制 $f(x) = \dfrac{x^2}{x^2 - 4}$ 的图像.

1. **定义域.** $x^2 - 4 = 0$ 在 $x = \pm2$, 因此定义域是所有 $x \ne \pm2$.
2. **截距.** $f(0) = 0$, 且 $f(x) = 0$ 仅当 $x^2 = 0$: 唯一的截距是原点.
3. **对称性.** $f(-x) = f(x)$: $f$ 是偶函数, 其图像关于 $y$ 轴对称.
4. **渐近线。** 当 $x \to \pm\infty$，将分子和分母同除以 $x^2$ 得到 $f(x) = \dfrac{1}{1 - 4/x^2} \to 1$：直线 $y = 1$ 是一条水平渐近线。由于 $f(x) - 1 = \dfrac{4}{x^2 - 4}$，对于 $\abs{x} > 2$ 而言为正，因此图像从上方趋近于该渐近线。当 $x \to 2^+$ 时，分子趋近于 4，分母趋近于 0 且始终为正数，因此 $f(x) \to \infty$；当 $x \to 2^-$ 时， $f(x) \to -\infty$。由对称性可知， $f(x) \to \infty$ 当 $x \to -2^-$ 时， $f(x) \to -\infty$ 当 $x \to -2^+$ 时。直线 $x = \pm2$ 是垂直渐近线。
5. **增减性。** 根据商法则（模块 5），

   $$f'(x) = \frac{2x(x^2 - 4) - x^2\cdot 2x}{(x^2 - 4)^2} = \frac{-8x}{(x^2 - 4)^2}.$$

   分母为正，因此 $f'(x) > 0$ 在 $x < 0$ 时为增函数， $f'(x) < 0$ 在 $x > 0$ 时为减函数（$x \ne \pm2$）。因此 $f$ 在 $(-\infty, -2)$ 和 $(-2, 0]$ 上递增，在 $[0, 2)$ 和 $(2, \infty)$ 上递减。
6. **局部极值。** 唯一的临界点是 0，此时 $f'$ 由正变负： $f(0) = 0$ 是局部最大值。它不是全局最大值，因为 $f(x) \to \infty$ 当 $x \to 2^+$ 时。
7. **凹凸性。** 写 $f'(x) = -8x(x^2 - 4)^{-2}$ 并使用乘积法则和链式法则：

   $$\begin{aligned} f''(x) &= -8(x^2 - 4)^{-2} + 32x^2(x^2 - 4)^{-3} \\ &= \frac{-8(x^2 - 4) + 32x^2}{(x^2 - 4)^3} = \frac{8(3x^2 + 4)}{(x^2 - 4)^3}. \end{aligned}$$

   顶部始终为正，因此 $f''$ 的符号与 $x^2 - 4$ 相同：图像在 $(-\infty, -2)$ 和 $(2, \infty)$ 上凹向上，在 $(-2, 2)$ 上凹向下。凹凸性仅在 $\pm2$ 处改变，而这些点不在定义域内：无拐点。
8. **作图。** 图8.4，左图：两个外侧分支在 $y = 1$ 上方，向上凹，从垂直渐近线向下延伸至 $y = 1$；一个中间分支，向下凹，其顶点在原点，并在两个渐近线处向下延伸至 $-\infty$。另外两个点有助于作图： $f(\pm1) = -\tfrac13$ 和 $f(\pm3) = \tfrac95$。

```check
f811 = x**2/(x**2 - 4)
same_set(solve(x**2 - 4, x), [-2, 2]); same(f811.subs(x, 0), 0); same(solve(x**2, x), [0]); same(f811.subs(x, -x), f811)
same(f811, 1/(1 - 4/x**2)); limit_is(f811, x, oo, 1); limit_is(f811, x, -oo, 1); same(f811 - 1, 4/(x**2 - 4))
limit_is(f811, x, 2, oo, '+'); limit_is(f811, x, 2, -oo, '-'); limit_is(f811, x, -2, oo, '-'); limit_is(f811, x, -2, -oo, '+')
steps(diff(f811, x), (2*x*(x**2 - 4) - x**2*2*x)/(x**2 - 4)**2, -8*x/(x**2 - 4)**2)
steps(diff(-8*x*(x**2 - 4)**(-2), x), -8*(x**2 - 4)**(-2) + 32*x**2*(x**2 - 4)**(-3), (-8*(x**2 - 4) + 32*x**2)/(x**2 - 4)**3, 8*(3*x**2 + 4)/(x**2 - 4)**3)
same(diff(f811, x, 2), 8*(3*x**2 + 4)/(x**2 - 4)**3)
same(solve_univariate_inequality(-8*x > 0, x, relational=False), Interval.open(-oo, 0))       # f' > 0 exactly for x < 0 (x != -2)
same(solve_univariate_inequality(x**2 - 4 < 0, x, relational=False), Interval.open(-2, 2)); same(minimum(3*x**2 + 4, x, S.Reals), 4)
same(f811.subs(x, 1), -Rational(1, 3)); same(f811.subs(x, -1), -Rational(1, 3)); same(f811.subs(x, 3), Rational(9, 5))
```
:::

::: example 作图 $x e^{-x}$
绘制 $f(x) = xe^{-x}$ 的图像.

1. **定义域。** 所有实数 $x$。
2. **截距。** $e^{-x} > 0$，因此 $f(x) = 0$ 仅在 $x = 0$ 处：原点。
3. **对称性。** $f(-1) = -e$ 和 $f(1) = e^{-1}$，因此 $f$ 既不是偶函数也不是奇函数。
4. **渐近线。** $f$ 是连续的，因此没有垂直渐近线。当 $x \to \infty$， $xe^{-x} = \dfrac{x}{e^x} \to 0$，因为指数函数增长快于幂函数（模块 7，使用洛必达法则）： $x$ 轴是右侧的水平渐近线。当 $x \to -\infty$， $x \to -\infty$ 和 $e^{-x} \to \infty$，因此 $f(x) \to -\infty$。
5. **增减性。** 由乘积法则， $f'(x) = e^{-x} - xe^{-x} = (1 - x)e^{-x}$。由于 $e^{-x} > 0$， $f'$ 的符号由 $1 - x$ 决定： $f$ 在 $(-\infty, 1]$ 上递增，在 $[1, \infty)$ 上递减。
6. **极值。** 所以 $f(1) = e^{-1} = \tfrac1e \approx 0.368$ 不仅是一个局部最大值，而且是全局最大值： $f$ 上升至该值，之后下降。
7. **凹凸性。** $f''(x) = -e^{-x} - (1 - x)e^{-x} = (x - 2)e^{-x}$，在 $x < 2$ 时为负，在 $x > 2$ 时为正。图像在 $(-\infty, 2)$ 上凹下，在 $(2, \infty)$ 上凹上，拐点在 $\big(2, 2e^{-2}\big) \approx (2, 0.271)$。
8. **草图。** 图8.4，右侧：从 $-\infty$ 陡峭上升穿过原点，达到 $\big(1, \tfrac1e\big)$ 的峰值，然后向 $x$ 轴衰减，曲线在 $x = 2$ 处发生弯曲变化。

```check
f812 = x*exp(-x)
same(solve(f812, x), [0]); same(f812.subs(x, -1), -E); same(f812.subs(x, 1), exp(-1))
limit_is(f812, x, oo, 0); limit_is(f812, x, -oo, -oo)
steps(diff(f812, x), exp(-x) - x*exp(-x), (1 - x)*exp(-x))
same(maximum(f812, x, S.Reals), exp(-1)); rounds(exp(-1), '0.368')
steps(diff(f812, x, 2), -exp(-x) - (1 - x)*exp(-x), (x - 2)*exp(-x))
same(solve_univariate_inequality((x - 2)*exp(-x) < 0, x, relational=False), Interval.open(-oo, 2))
same(solve_univariate_inequality((x - 2)*exp(-x) > 0, x, relational=False), Interval.open(2, oo))
rounds(2*exp(-2), '0.271')
```
:::

::: figure id=fig-08-4
两幅草图。左图：$y = \dfrac{x^2}{x^2 - 4}$，具有垂直渐近线$x = \pm2$、水平渐近线$y = 1$（虚线）以及位于原点的局部最大值；在$[-2, 2]$外部凹向上，在内部凹向下，且无拐点。右图：$y = xe^{-x}$，其最大值$\tfrac1e$位于$x = 1$，拐点位于$x = 2$。
:::

下方的工具可以为您生成符号图，数值计算。使用它来检查草图，而不是替代草图：它仅在其窗口内和网格点上进行分析。

::: widget name=shape-explorer
当$f$递增时曲线为蓝色，递减时为橙色；当图形凹向上时背景为绿色，凹向下时为紫色。圆点标记临界数，方块标记拐点，图下方的两个图表给出$f'$和$f''$的符号。选择$x^4 - 4x^3$并与例8.10比较：0处的平坦点是临界数但不是极值点，且它也是拐点。选择$x\,e^{-x}$并与例8.12比较。然后输入`x^2/(x^2 - 4)`（例8.11）和`x^(2/3)(x - 5)`，即例8.7的函数（与Python不同，小部件取$x^{2/3}$为实立方根，正如本系列所做），并通过滑块移动点以读取$f(x)$、$f'(x)$和$f''(x)$。
:::

::: compute 使用 SymPy 进行曲线绘制
SymPy 处理曲线绘制的代数。声明 $x$ 为实数，使得 `solve` 仅寻找实数解：

```python
import sympy as sp
x = sp.symbols('x', real=True)
f = x**2/(x**2 - 4)
d1 = sp.factor(sp.diff(f, x))
d2 = sp.factor(sp.diff(f, x, 2))
print(d1)
print(d2)
print(sp.solve(d1, x), sp.solve(d2, x))
print(sp.limit(f, x, sp.oo), sp.limit(f, x, 2, '+'), sp.limit(f, x, 2, '-'))
```

```output
-8*x/((x - 2)**2*(x + 2)**2)
8*(3*x**2 + 4)/((x - 2)**3*(x + 2)**3)
[0] []
1 oo -oo
```

这是例题 8.11 的导数，其中 $x^2 - 4$ 被因式分解；$f'' = 0$ 没有实数解。`solve` 也解决不等式，这给出了符号图：

```python
print(sp.solve(d1 > 0, x))
print(sp.solve(d2 < 0, x))
z = sp.symbols('z')                  # a symbol with no assumptions
print(sp.solve(3*z**2 + 4, z))
```

```output
(x < 0) & Ne(x, -2)
(-2 < x) & (x < 2)
[-2*sqrt(3)*I/3, 2*sqrt(3)*I/3]
```

将 `&` 看作 "and"，将 `Ne(x, -2)` 看作 $x \ne -2$：$f' > 0$ 对应 $x < 0$、$x \ne -2$ 和 $f'' < 0$ 在 $(-2, 2)$，如示例所示。不使用 `real=True` 时，`solve` 也会返回复数解：$3z^2 + 4 = 0$ 的解为 $\pm\tfrac{2}{\sqrt3}i$，其中 $i^2 = -1$，这些解在图上无用。
:::

```check
same(-2*sqrt(3)*I/3, -2/sqrt(3)*I); same(expand((2*sqrt(3)*I/3)**2*3 + 4), 0)
```

## 最优化问题 {#optimisation}

用文字描述的最优化问题转化为函数极值的问题。闭区间方法处理在闭区间上的连续函数；然而许多问题存在于开区间或无界区间上，例如所有长度 $r > 0$。在这些情况下，下一个定理，即定理 8.11，表明临界点给出绝对极值。

::: theorem 绝对极值的一阶导数判别法
设$f$在区间$I$上连续，设$c$属于$I$，且设$f$在$I$的每一点处可导，$c$及$I$的端点除外。若$f'(x) > 0$在每一点$x < c$处成立且$f'(x) < 0$在每一点$x > c$处成立，则$f(c)$为$f$在$I$上的绝对最大值，且仅在$c$处取得。若$f'(x) < 0$对$x < c$成立且$f'(x) > 0$对$x > c$成立，则$f(c)$为绝对最小值，且仅在$c$处取得。
:::

::: proof
$I$ 中满足 $\le c$ 的点构成一个区间，在该区间上 $f$ 连续，且在那些非端点的点处 $f' > 0$；根据定理 8.8，$f$ 在那里单调递增，因此 $f(x) < f(c)$ 对于每个 $x < c$ 在 $I$ 中成立。同样地，$f$ 在 $I$ 中满足 $\ge c$ 的点上单调递减，因此 $f(x) < f(c)$ 对于 $x > c$ 成立。所以 $f(x) < f(c)$ 对于每个 $x \ne c$ 在 $I$ 中成立。最小值相同。
:::

::: keyidea
**解决一个优化问题。**

1. 阅读问题并画出图形。命名各个量及其单位。
2. 将要最大化或最小化的量表示为其他量的函数。
3. 利用问题的条件将其表示为一个变量的函数，并找出该变量的取值范围。
4. 在该区间内找出临界点。
5. 证明你得到了极值：若区间是闭区间且有界，则使用闭区间方法；否则通过导数在区间两侧的符号（定理 8.14）或凹凸性（定理 8.11）来证明。
6. 回答原问题，带上单位，并检查答案是否合理。
:::

::: example 从一张纸板中得到的最大盒子
假设一张矩形纸板的尺寸为 24 厘米乘 45 厘米。从每个角剪去一个边长为 $x$ 厘米的正方形，并将侧面折叠起来制成一个无盖盒子。哪个 $x$ 会使得体积最大？

盒子的底面为 $(45 - 2x)$ 厘米乘 $(24 - 2x)$ 厘米，其高度为 $x$ 厘米，因此其体积为

$$V(x) = x(24 - 2x)(45 - 2x) \text{ cm}^3.$$

需要 $x \ge 0$ 和 $24 - 2x \ge 0$，因此 $0 \le x \le 12$（在盒子两端是平的，体积为 0）。先处理数字：

```valuetable
x = 1, 2, 3, 4, 5, 6, 7, 8, 10, 12
$V(x)$ = x*(24 - 2*x)*(45 - 2*x)
layout = columns
---
x | V(x)
1 | 946
2 | 1640
3 | 2106
4 | 2368
5 | 2450
6 | 2376
7 | 2170
8 | 1856
10 | 1000
12 | 0
```

最佳切割点似乎在 5 厘米附近。现在应用微积分。展开：$V(x) = 4x^3 - 138x^2 + 1080x$，因此

$$\begin{aligned} V'(x) &= 12x^2 - 276x + 1080 \\ &= 12(x^2 - 23x + 90) = 12(x - 5)(x - 18). \end{aligned}$$

关键点是 5 和 18，且只有 5 位于 $[0, 12]$ 内。通过闭区间法，比较 $V(0) = 0$、$V(5) = 5 \cdot 14 \cdot 35 = 2450$ 和 $V(12) = 0$：最大体积为 2450 cm³，约 2.45 升，当切割为 5 厘米时，得到一个 35 厘米 × 14 厘米 × 5 厘米深的盒子。关键点 18 是 $x$ 的一个值，此时不存在对应的盒子。

```check
V813 = x*(24 - 2*x)*(45 - 2*x)
same(expand(V813), 4*x**3 - 138*x**2 + 1080*x)
steps(diff(V813, x), 12*x**2 - 276*x + 1080, 12*(x**2 - 23*x + 90), 12*(x - 5)*(x - 18))
same_set(solve(diff(V813, x), x), [5, 18]); same(V813.subs(x, 5), 2450); same(5*14*35, 2450)
same(V813.subs(x, 0), 0); same(V813.subs(x, 12), 0); same(maximum(V813, x, Interval(0, 12)), 2450)
same(45 - 2*5, 35); same(24 - 2*5, 14); same(Rational(2450, 1000), Rational(245, 100))
```
:::

::: example 用最少金属制成的罐子
一个圆柱形罐子必须容纳 330 cm³（330 毫升，常见饮料容量）。需要哪种半径 $r$ 和高度 $h$ 才能使用最少的金属，即表面积最小（包括顶部和底部）？

面积是 $A = 2\pi r^2 + 2\pi rh$：两个圆盘和侧面，展开成一个宽度为 $2\pi r$、高度为 $h$ 的矩形。体积条件 $\pi r^2h = 330$ 给出 $h = \dfrac{330}{\pi r^2}$，因此

$$A(r) = 2\pi r^2 + 2\pi r\cdot\frac{330}{\pi r^2} = 2\pi r^2 + \frac{660}{r}, \qquad r > 0.$$

区间 $(0, \infty)$ 不是闭区间：不能使用闭区间方法。求导：

$$A'(r) = 4\pi r - \frac{660}{r^2} = \frac{4\pi r^3 - 660}{r^2},$$

当 $r^3 = \dfrac{660}{4\pi} = \dfrac{165}{\pi}$ 时为 0，在 $r^* = \sqrt[3]{165/\pi} \approx 3.745$ cm 处。对于 $r < r^*$，顶部 $4\pi r^3 - 660$ 为负，而对于 $r > r^*$ 为正，因此根据定理 8.14， $A(r^*)$ 是绝对最小值。此时高度为

$$h = \frac{330}{\pi r^{*2}} = \frac{330}{\pi r^{*3}}\,r^* = \frac{330}{165}\,r^* = 2r^* \approx 7.49 \text{ cm},$$

使用 $\pi r^{*3} = 165$，面积是 $A(r^*) \approx 264.4$ cm²。最佳的罐子高度恰好等于其宽度：其高度等于其直径。将任何体积 $V$ 替代 330，重复相同步骤得到 $r^{*3} = V/(2\pi)$ 和再次 $h = 2r^*$。实际饮料罐通常比其宽度高得多，因此制造商考虑的不仅仅是金属面积。

```check
rc = symbols('r', positive=True)
A814 = 2*pi*rc**2 + 2*pi*rc*330/(pi*rc**2)
same(A814, 2*pi*rc**2 + 660/rc); same(diff(A814, rc), (4*pi*rc**3 - 660)/rc**2)
rstar = (165/pi)**Rational(1, 3)
same(solve(diff(A814, rc), rc), [rstar]); same(Rational(660, 4), 165); rounds(rstar, '3.745')
holds(4*pi*3**3 - 660 < 0); holds(4*pi*4**3 - 660 > 0)
same(330/(pi*rstar**2), 2*rstar); rounds(2*rstar, '7.49'); rounds(A814.subs(rc, rstar), '264.4')
Vg = symbols('V', positive=True); AV = 2*pi*rc**2 + 2*pi*rc*Vg/(pi*rc**2); rV = (Vg/(2*pi))**Rational(1, 3)   # any volume V
same(solve(diff(AV, rc), rc), [rV]); same(Vg/(pi*rV**2), 2*rV)
```
:::

::: example 抛物线上最近的点
求抛物线 $y = x^2$ 上到点 $(3, 0)$ 最近的点。

$(x, x^2)$到$(3, 0)$的距离是$\sqrt{(x - 3)^2 + x^4}$。平方根是递增的，因此其平方最小的地方，距离也最小，而平方去掉根号后更容易求导：

$$D(x) = (x - 3)^2 + x^4, \qquad x \text{ real}.$$

$D'(x) = 2(x - 3) + 4x^3 = 2(2x^3 + x - 3)$. 尝试小整数，$x = 1$是$2x^3 + x - 3$的根，除以$x - 1$得到

$$D'(x) = 2(x - 1)(2x^2 + 2x + 3).$$

由于二次因式的判别式为$4 - 24 < 0$，故其无实根，因此唯一的临界点为1。且$D''(x) = 12x^2 + 2 > 0$处处成立：$D$在$\R$上凹，故由定理8.11，其临界点给出绝对最小值。最近点为$(1, 1)$，距离为$\sqrt{D(1)} = \sqrt{4 + 1} = \sqrt5 \approx 2.236$。验证：从$(3, 0)$到$(1, 1)$的线段斜率为$-\tfrac12$，且抛物线在$(1, 1)$处的切线斜率为2；由于$2 \cdot \big(-\tfrac12\big) = -1$，它们互相垂直，正如到曲线的最短路径应有的性质。

```check
D815 = (x - 3)**2 + x**4
steps(diff(D815, x), 2*(x - 3) + 4*x**3, 2*(2*x**3 + x - 3), 2*(x - 1)*(2*x**2 + 2*x + 3))
same(discriminant(2*x**2 + 2*x + 3, x), 4 - 24); same([r_ for r_ in solve(diff(D815, x), x) if r_.is_real], [1])
same(diff(D815, x, 2), 12*x**2 + 2); same(minimum(D815, x, S.Reals), 5)
same(sqrt(D815.subs(x, 1)), sqrt(5)); rounds(sqrt(5), '2.236')
same((1 - 0)/(1 - 3), -Rational(1, 2)); same(diff(x**2, x).subs(x, 1), 2)
```
:::

::: example 斯涅尔定律源于最短时间原理
一名救生员在海滩上奔跑的速度比游泳快。为了尽快到达海中的游泳者，她不应该直接朝他游去：沿着海滩再跑一段距离，可以缩短缓慢的游泳距离。光在从空气进入水中时也会遇到相同的问题，其中光的传播速度变慢，而 **费马原理** 表示光沿着耗时最少的路径传播。找出这条路径。

将边界放在 $x$ 轴上，起点 $A = (0, a)$ 放在它上方，终点 $B = (d, -b)$ 放在它下方，距离为 $a, b, d > 0$。光在边界上穿过点 $P = (x, 0)$，从 $A$ 到 $P$ 以速度 $v_1$ 传播，从 $P$ 到 $B$ 以速度 $v_2$ 传播。距离除以速度得到时间：

$$T(x) = \frac{\sqrt{a^2 + x^2}}{v_1} + \frac{\sqrt{b^2 + (d - x)^2}}{v_2}.$$

根据链式法则，

$$T'(x) = \frac{x}{v_1\sqrt{a^2 + x^2}} - \frac{d - x}{v_2\sqrt{b^2 + (d - x)^2}}.$$

设 $\theta_1$ 为 $AP$ 与垂直方向之间的夹角，设 $\theta_2$ 为 $PB$ 与垂直方向之间的夹角。对于点 $0 < x < d$，直角三角形给出 $\sin\theta_1 = \dfrac{x}{\sqrt{a^2 + x^2}}$ 和 $\sin\theta_2 = \dfrac{d - x}{\sqrt{b^2 + (d - x)^2}}$，因此

$$T'(x) = 0 \quad\iff\quad \frac{\sin\theta_1}{v_1} = \frac{\sin\theta_2}{v_2}.$$

这是 **斯涅尔折射定律**。这是最小值吗？再次求导，

$$T''(x) = \frac{a^2}{v_1(a^2 + x^2)^{3/2}} + \frac{b^2}{v_2\big(b^2 + (d - x)^2\big)^{3/2}} > 0,$$

所以 $T$ 是向上凹的 $\R$。同样 $T'(0) < 0 < T'(d)$，因此根据中间值定理 $T'$ 在 0 和 $d$ 之间有一个零点，而且只有一个，因为 $T'$ 是递增的。根据定理 8.11，这个零点给出 $T$ 的绝对最小值：最短时间路径遵循斯涅尔定律。用数字表示：光在空气中的传播速度大约是水中的 1.33 倍（水的折射率约为 1.33），因此取 $v_1/v_2 = \tfrac43$， $a = 3$， $b = 4$ 和 $d = 7$。在 $x = 4$， $\sin\theta_1 = \tfrac{4}{5}$ 和 $\sin\theta_2 = \tfrac{3}{5}$，以及 $\dfrac{4/5}{3/5} = \tfrac43 = \dfrac{v_1}{v_2}$：光在 $(4, 0)$ 处进入水中。

```check
ap_, bp_, dp_, v1_, v2_ = symbols('a b d v_1 v_2', positive=True)
T816 = sqrt(ap_**2 + x**2)/v1_ + sqrt(bp_**2 + (dp_ - x)**2)/v2_
same(diff(T816, x), x/(v1_*sqrt(ap_**2 + x**2)) - (dp_ - x)/(v2_*sqrt(bp_**2 + (dp_ - x)**2)))
same(diff(T816, x, 2), ap_**2/(v1_*(ap_**2 + x**2)**Rational(3, 2)) + bp_**2/(v2_*(bp_**2 + (dp_ - x)**2)**Rational(3, 2)))
same(diff(T816, x).subs(x, 0), -dp_/(v2_*sqrt(bp_**2 + dp_**2))); same(diff(T816, x).subs(x, dp_), dp_/(v1_*sqrt(ap_**2 + dp_**2)))
T816n = T816.subs({ap_: 3, bp_: 4, dp_: 7, v1_: Rational(4, 3), v2_: 1})
same(diff(T816n, x).subs(x, 4), 0); same(4/sqrt(3**2 + 4**2), Rational(4, 5)); same((7 - 4)/sqrt(4**2 + 3**2), Rational(3, 5))
same(Rational(4, 5)/Rational(3, 5), Rational(4, 3))
```
:::

::: example 每单位的最低成本
假设每周生产$q$单位产品的成本为$C(q) = 1800 + 6q + 0.02q^2$英镑（一种假设的成本：固定的1800英镑，加上随产量增长更快的成本）。如何使**平均成本** $A(q) = C(q)/q$（单位成本）最小化？

$$A(q) = \frac{1800}{q} + 6 + 0.02q, \qquad q > 0.$$

$A'(q) = -\dfrac{1800}{q^2} + 0.02$，当$q^2 = 90\,000$时其值为0，在$q = 300$处。且对于$A''(q) = \dfrac{3600}{q^3} > 0$，$q > 0$：$A$在$(0, \infty)$上凹向上，因此由定理8.11，$A(300)$是绝对最小值。每单位最低成本为$A(300) = 6 + 6 + 6 = 18$，即每周300单位时的£18。

经济学家将导数$C'(q)$称为**边际成本**：由线性近似（模块7），$C(q + 1) - C(q) \approx C'(q)$，即多生产一个单位的成本。此处$C'(q) = 6 + 0.04q$，以及$C'(300) = 18$：在最优产量处，边际成本等于平均成本。这并非巧合。根据商法则，

$$A'(q) = \frac{qC'(q) - C(q)}{q^2},$$

正好等于 0 当且仅当 $C'(q) = C(q)/q$。当生产一个额外单位的成本低于平均成本时，它会使平均成本下降；一旦成本高于平均成本，它会使平均成本上升。

```check
qp = symbols('q', positive=True)
C817 = 1800 + 6*qp + Rational(2, 100)*qp**2; A817 = C817/qp
same(expand(A817), 1800/qp + 6 + Rational(2, 100)*qp); same(diff(A817, qp), -1800/qp**2 + Rational(2, 100))
same(solve(diff(A817, qp), qp), [300]); same(1800/Rational(2, 100), 90000); same(diff(A817, qp, 2), 3600/qp**3)
same(A817.subs(qp, 300), 18); same(1800/Integer(300), 6); same(Rational(2, 100)*300, 6)
same(diff(C817, qp), 6 + Rational(4, 100)*qp); same(diff(C817, qp).subs(qp, 300), 18)
same(diff(A817, qp), (qp*diff(C817, qp) - C817)/qp**2)
```
:::

::: pitfall
优化中的三个问题。**忽略区间**：在例题 8.13 中，临界数 18 没有被框出，而在一个闭区间的问题中，答案可能在端点处。**停留在临界数**：$f'(c) = 0$ 并不使 $f(c)$ 成为最大或最小值；请说明是哪一theorem（定理）显示这一点，如例题所示。**回答不同的问题**：如果问题要求圆柱体的尺寸，仅给出最小面积并不能作为答案。
:::

## 梯度下降 {#gradient-descent}

到目前为止，每个例子都是通过代数方法解决的 $f'(x) = 0$。通常这是不可能的：方程没有解析解，或者在机器学习中，$f$ 是一个具有数百万参数的模型的误差。此时你可以改用搜索方法：从某个点出发，沿着下坡方向前进。

::: definition 梯度下降
要最小化一个可微函数 $f$，选择一个起始点 $x_0$ 和一个 **步长** $\eta > 0$，并计算

$$x_{k+1} = x_k - \eta f'(x_k), \qquad k = 0, 1, 2, \dots$$

希腊字母 $\eta$ 读作 "eta"。在机器学习中，步长被称为 **学习率**。
:::

为什么这会下降？如果 $f'(x_k) > 0$，图在 $x_k$ 处向上倾斜，且步长向左移动；如果 $f'(x_k) < 0$，图向下倾斜，且步长向右移动。根据模块 7 的线性化，

$$\begin{aligned} f(x_{k+1}) &\approx f(x_k) + f'(x_k)(x_{k+1} - x_k) \\ &= f(x_k) - \eta f'(x_k)^2, \end{aligned}$$

当 $f'(x_k) \ne 0$ 时，其值小于 $f(x_k)$，至少当步长足够小时近似值较好。步长在临界点恰好停止：$x_{k+1} = x_k$ 表示 $f'(x_k) = 0$。$\eta$ 应该多大？抛物线完全回答了这个问题。

```check
xk, eta_ = symbols('x_k eta', positive=True)
same(fm(xk) + diff(fm(xk), xk)*((xk - eta_*diff(fm(xk), xk)) - xk), fm(xk) - eta_*diff(fm(xk), xk)**2)
```

::: example 抛物线上梯度下降
设 $f(x) = \tfrac{q}{2}x^2$，其中 $q > 0$ 是常数，因此 $f'(x) = qx$， $f''(x) = q$，且最小值在 $x = 0$ 处。证明梯度下降得到 $x_k = (1 - q\eta)^kx_0$，并找出使得 $x_k$ 接近最小值的步长。

一步得到 $x_{k+1} = x_k - \eta qx_k = (1 - q\eta)x_k$。每一步都乘以相同的因子 $1 - q\eta$，因此经过 $k$ 步后得到 $x_k = (1 - q\eta)^kx_0$。介于 $-1$ 和 1 之间的数的幂趋向于 0，而大于 $\pm1$ 的数的幂则无限增长。对于 $x_0 \ne 0$：

| 步长 | 因子 $1 - q\eta$ | 步骤 |
|---|---|---|
| $0 < \eta < 1/q$ | 在 0 和 1 之间 | 从一侧趋近于 0；若 $\eta$ 很小则缓慢靠近 |
| $\eta = 1/q$ | 0 | 一步到达 0 |
| $1/q < \eta < 2/q$ | 在 $-1$ 和 0 之间 | 在 0 附近来回震荡，逐渐收敛 |
| $\eta = 2/q$ | $-1$ | 在 $x_0$ 和 $-x_0$ 之间无限震荡 |
| $\eta > 2/q$ | 在 $-1$ 以下 | 往外震荡：发散 |

所以梯度下降法在 $0 < \eta < 2/q$ 处恰好找到最小值：抛物线曲率越强，步长必须越小。

```check
qq8 = symbols('q', positive=True); x0_ = symbols('x_0')
xs8 = [x0_]
for _ in range(5):
    xs8.append(xs8[-1] - eta_*diff(qq8/2*x**2, x).subs(x, xs8[-1]))
same([expand(v_) for v_ in xs8], [expand((1 - qq8*eta_)**k_*x0_) for k_ in range(6)])
same(diff(qq8/2*x**2, x), qq8*x); same(diff(qq8/2*x**2, x, 2), qq8)
er_ = symbols('eta', real=True)                         # |1 - q eta| < 1 exactly when 0 < eta < 2/q, for instances of q
for qv_ in (Rational(1, 2), 1, 3, 10):
    same(solve_univariate_inequality(Abs(1 - qv_*er_) < 1, er_, relational=False), Interval.open(0, 2/qv_))
same((1 - qq8*eta_).subs(eta_, 1/qq8), 0); same((1 - qq8*eta_).subs(eta_, 2/qq8), -1)
```
:::

在最小值 $c$ 处，若 $f''(c) > 0$，函数的行为与该抛物线类似，此处同样适用该规则。

::: keyidea
**步长的粗略规则。** 在最小值 $c$ 处，若 $f''(c) > 0$，函数 $f'$ 在 $c$ 处的线性近似（第 7 模块）为 $f'(x) \approx f''(c)(x - c)$，因为 $f'(c) = 0$。因此，梯度下降法一步即可得到

$$x_{k+1} - c \approx \big(1 - \eta f''(c)\big)(x_k - c),$$

抛物线的例子 8.18 与 $q = f''(c)$。从接近 $c$ 开始，梯度下降在 $c$ 收敛，当 $0 < \eta < 2/f''(c)$ 时最快，当 $\eta$ 接近 $1/f''(c)$ 时最快。这个论点只是一个经验法则，不是证明：这个近似只在接近 $c$ 时成立。(当 $f''$ 在 $c$ 附近连续时，对 $f'$ 应用中值定理将其转化为一个证明，说明步骤 $0 < \eta < 2/f''(c)$ 收敛。)
:::

每一步都重新选择 $\eta = 1/f''(x_k)$，将梯度下降变为 $x_{k+1} = x_k - f'(x_k)/f''(x_k)$：方程 $f'(x) = 0$ 的牛顿法（模块 7）。它收敛得很快，但它需要 $f''$，对于包含数百万参数的模型来说计算成本太高；梯度下降只需要 $f'$。

图 8.5 尝试了三种步长在

$$f(x) = \tfrac12x^2 + e^{-x}.$$

这里 $f'(x) = x - e^{-x}$ 和 $f''(x) = 1 + e^{-x} > 0$，因此图像向上凹，只有一个临界点，即通过模块7中的牛顿法求得的 $x^* \approx 0.567143$ 的解 $x = e^{-x}$，给出绝对最小值（定理8.11）。由于 $e^{-x^*} = x^*$，$f''(x^*) = 1 + x^* \approx 1.567$：经验法则预测 $\eta < 2/1.567 \approx 1.28$ 收敛，最快收敛于 $\eta \approx 0.64$。

```check
f818 = x**2/2 + exp(-x)
same(diff(f818, x), x - exp(-x)); same(diff(f818, x, 2), 1 + exp(-x))
xstar8 = nsolve(x - exp(-x), x, 0.5, prec=30); rounds(xstar8, '0.567143')
near(exp(-xstar8), xstar8, 1e-25); rounds(1 + xstar8, '1.567'); rounds(2/(1 + xstar8), '1.28'); rounds(1/(1 + xstar8), '0.64')
```

::: figure id=fig-08-5
在 $f(x) = \tfrac12x^2 + e^{-x}$ 上从 $x_0 = 3$ 进行梯度下降；虚线标记最小值 $x^* \approx 0.567$。使用 $\eta = 0.1$ 时，步长缓慢趋近于它：12 步仅达到 $x \approx 1.004$。使用 $\eta = 0.6$ 时，第三步已经接近它，误差在 0.01 以内。使用 $\eta = 1.4$ 时，步长在最小值两侧来回跳跃，每次返回时在两侧的范围进一步扩大；第四步落在 $x_4 \approx 10.15$。
:::

::: compute Python 中的梯度下降
该方法是一个单行循环。使用 $f'(x) = x - e^{-x}$：

```python
import math

def df(x):                              # f(x) = x**2/2 + exp(-x)
    return x - math.exp(-x)

def gradient_descent(x, eta, steps):
    xs = [x]
    for _ in range(steps):
        x = x - eta*df(x)
        xs.append(x)
    return xs

for eta in (0.1, 0.6, 1.4):
    xs = gradient_descent(3.0, eta, 7)
    print(f"eta = {eta}:", " ".join(f"{v:.4g}" for v in xs))
```

```output
eta = 0.1: 3 2.705 2.441 2.206 1.996 1.81 1.646 1.5
eta = 0.6: 3 1.23 0.6673 0.5748 0.5676 0.5672 0.5671 0.5671
eta = 1.4: 3 -1.13 4.787 -1.903 10.15 -4.061 82.85 -33.14
```

用 $\eta = 1.4$ 作为步长，下一步落在 $3.5 \times 10^{14}$ 附近，再下一步 `math.exp` 会因溢出错误而失败：所求的数 $e^{x}$ 超过了浮点数的表示范围。程序需要一个停止的规则，通常是在 $\abs{f'(x_k)}$ 非常小时停止。每种步长需要多少步才能达到 $\abs{f'(x_k)} < 10^{-10}$？

```python
def steps_needed(eta, tol=1e-10):
    x, k = 3.0, 0
    while abs(df(x)) > tol and k < 10000:
        x, k = x - eta*df(x), k + 1
    return k

for eta in (0.1, 0.3, 0.6, 1.0, 1.2):
    print(f"eta = {eta}: {steps_needed(eta)} steps")
```

```output
eta = 0.1: 146 steps
eta = 0.3: 40 steps
eta = 0.6: 10 steps
eta = 1.0: 42 steps
eta = 1.2: 188 steps
```

通常认为最佳步长接近 $1/f''(x^*) \approx 0.64$。更小的步长浪费时间；更大的步长会在最小值附近来回震荡，收敛速度更慢，且当步长超过约 1.28 时会发散。
:::

```check
import math as _m
def _gd(eta, n):
    xs_ = [3.0]
    for _ in range(n):
        xs_.append(xs_[-1] - eta*(xs_[-1] - _m.exp(-xs_[-1])))
    return xs_
rounds(_gd(0.1, 12)[-1], '1.004'); holds(abs(_gd(0.6, 3)[-1] - float(xstar8)) < 0.01); holds(abs(_gd(0.6, 2)[-1] - float(xstar8)) > 0.01)
rounds(_gd(1.4, 4)[-1], '10.15'); rounds(_gd(1.4, 8)[-1], '3.5e14')
_g14 = _gd(1.4, 7); holds(all((_g14[k_] - float(xstar8))*(_g14[k_ + 1] - float(xstar8)) < 0 for k_ in range(7)))   # side to side
holds(_g14[0] < _g14[2] < _g14[4] < _g14[6]); holds(_g14[1] > _g14[3] > _g14[5] > _g14[7])                              # further out each time
_x9 = _gd(1.4, 9)[-1]; holds(-_x9 > 710)            # x_10 needs e^(-x_9): a float overflows beyond about e^709.8
```

在机器学习中，$x$ 是一个参数列表，$f$ 是 **损失**，是模型在训练数据上的误差度量，$f'$ 变为模块17的梯度，$\eta$ 是学习率。本节的要点同样适用：学习率太小会浪费计算时间，太大则会使损失发散，而损失的曲率决定了哪一种情况。模块17将梯度下降法扩展到多个变量，模块18研究步长以及当函数在某些方向上曲率更陡时会出现的问题。[数学基础系列](../math/module_19_ZH.html)] 从计算角度研究梯度方法和凸性。

::: pitfall
梯度下降法找到的是一个临界点，不一定是全局最小值。在一个有多个山谷的函数上，小步长会停留在初始点所在的山谷中，并且当 $f'$ 接近 0 时，步长可能停滞，即使那里并没有最小值。对于例 8.10 中的 $f(x) = x^4 - 4x^3$，从 $x_0 = -1$ 且 $\eta = 0.01$ 开始，它缓慢地向平坦点 0 移动，而 0 并不是一个最小值；经过 1000 次迭代后，它仍停留在 $x \approx -0.0081$，并且永远无法越过 0 去到真正的最小值 3。
:::

```check
xg = -1.0
for _ in range(1000):
    xg = xg - 0.01*4*xg**2*(xg - 3)
rounds(xg, '-0.0081'); holds(xg < 0)
```

## 你所学到的内容 {#summary}

- 绝对最大值或最小值是$f$在其整个定义域（或区间）上的最大或最小值；局部最大值或最小值是附近值中的最大或最小值。根据费马定理，局部极值出现在临界点，即$f' = 0$或$f'$不存在的点；并非每个临界点都给出极值。
- 闭区间方法：一个在 $[a, b]$ 上连续的函数在其区间内部的临界点或端点处取得全局极值；比较这些点的函数值。
- 罗尔定理和中值定理：如果 $f$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导，则 $f'(c) = \dfrac{f(b) - f(a)}{b - a}$ 存在某个 $c$ 属于 $(a, b)$。平均变化率等于某处的瞬时变化率。柯西版本证明了洛必达法则。
- 后果：$f' = 0$ 在一个区间内使 $f$ 那里恒定；在一个区间内相等的导数意味着函数之间相差一个常数；$f' > 0$ 使 $f$ 单调递增，$f' < 0$ 单调递减。
- 一阶导数检验法通过 $f'$ 的符号变化来判断临界点的性质；二阶导数检验法通过 $f''(c)$ 在 $f'(c) = 0$ 处的符号来判断，当 $f''(c) = 0$ 不存在时则无结论。
- $f'' > 0$ 使图像向上凹（凸），位于其切线之上；$f'' < 0$ 使图像向下凹。拐点是凹凸性变化的点；若 $f''(c)$ 存在则 $f''(c) = 0$ 为拐点，但 $f''(c) = 0$ 单独存在并不一定构成拐点。
- 绘制图像：定义域、截距、对称性、渐近线、导数 $f'$ 和 $f''$ 的符号图、极值和拐点。
- 最优化：将量表示为一个变量在允许的区间上的函数，找出临界点，并通过闭区间法、在每侧的 $f'$ 符号或凹凸性来证明绝对极值。
- 梯度下降， $x_{k+1} = x_k - \eta f'(x_k)$ ，沿下坡方向移动。通常情况下，接近最小值 $c$ 时，当 $0 < \eta < 2/f''(c)$ 收敛，最快在 $\eta = 1/f''(c)$ 附近；步长过大将导致发散，它可能收敛于局部最小值或在平坦点停滞。

## 练习 {#exercises}

:::: exercise 闭区间方法 {#ex-8-1} ★
找出每个函数在给定区间上的绝对最大值和最小值。

- (a) $f(x) = x^3 - 12x + 1$ on $[-3, 5]$
- (b) $g(x) = x - 2\sin x$ on $[0, 2\pi]$

::: solution
**(a)** $f'(x) = 3x^2 - 12 = 3(x - 2)(x + 2)$ ，因此临界点为 $\pm2$ ，都在 $(-3, 5)$ 内。值为：

| $x$ | $-3$ | $-2$ | $2$ | $5$ |
|---|---|---|---|---|
| $f(x)$ | $10$ | $17$ | $-15$ | $66$ |

绝对最大值为 66，在端点 5 处取得；绝对最小值为 $-15$ ，在 2 处取得。在 $-2$ 处的局部最大值不是绝对最大值。

**(b)** $g'(x) = 1 - 2\cos x = 0$ 当 $\cos x = \tfrac12$ ，这在 $(0, 2\pi)$ 中发生在 $x = \tfrac{\pi}{3}$ 和 $x = \tfrac{5\pi}{3}$ 。对于 $\sin\tfrac{\pi}{3} = \tfrac{\sqrt3}{2}$ 和 $\sin\tfrac{5\pi}{3} = -\tfrac{\sqrt3}{2}$ ：

| $x$ | $0$ | $\pi/3$ | $5\pi/3$ | $2\pi$ |
|---|---|---|---|---|
| $g(x)$ | $0$ | $\pi/3 - \sqrt3 \approx -0.685$ | $5\pi/3 + \sqrt3 \approx 6.968$ | $2\pi \approx 6.283$ |

绝对最大值是 $\tfrac{5\pi}{3} + \sqrt3 \approx 6.968$，在 $\tfrac{5\pi}{3}$ 处取得，绝对最小值是 $\tfrac{\pi}{3} - \sqrt3 \approx -0.685$，在 $\tfrac{\pi}{3}$ 处取得。

```check
fe1 = x**3 - 12*x + 1
same(factor(diff(fe1, x)), 3*(x - 2)*(x + 2)); same([fe1.subs(x, v_) for v_ in (-3, -2, 2, 5)], [10, 17, -15, 66])
same(maximum(fe1, x, Interval(-3, 5)), 66); same(minimum(fe1, x, Interval(-3, 5)), -15)
ge1 = x - 2*sin(x)
same_set(solveset(diff(ge1, x), x, Interval.open(0, 2*pi)), [pi/3, 5*pi/3])
same([ge1.subs(x, v_) for v_ in (0, pi/3, 5*pi/3, 2*pi)], [0, pi/3 - sqrt(3), 5*pi/3 + sqrt(3), 2*pi])
rounds(pi/3 - sqrt(3), '-0.685'); rounds(5*pi/3 + sqrt(3), '6.968'); rounds(2*pi, '6.283')
holds(5*pi/3 + sqrt(3) > 2*pi); holds(pi/3 - sqrt(3) < 0)
```
:::
::::

:::: exercise 中值定理的数 c {#ex-8-2} ★
- (a) 检查 $f(x) = x^2 - 4x$ 是否满足中值定理在 $[1, 5]$ 上的条件，并找出定理所保证的每一个 $c$。
- (b) 同样地，对 $f(x) = \dfrac1x$ 在 $[1, 3]$ 上进行分析。
- (c) 为什么中值定理不适用于 $f(x) = \abs{x - 1}$ 在 $[0, 3]$ 上？无论如何是否存在 $c$？
- (d) 证明对于每一个二次函数 $f(x) = px^2 + qx + r$，区间 $p \ne 0$，以及每一个区间 $[a, b]$，数 $c$ 是中点 $\tfrac{a + b}{2}$。

::: solution
**(a)** 多项式在全体实数上连续且可导。 $f(1) = -3$ 和 $f(5) = 5$，因此割线斜率是 $\dfrac{5 - (-3)}{5 - 1} = 2$，而 $f'(c) = 2c - 4 = 2$ 给出 $c = 3$，它位于 $(1, 5)$ 内。

**(b)** $\dfrac1x$ 是连续且可导的在 $x \ne 0$，所以于 $[1, 3]$。割线斜率是 $\dfrac{\tfrac13 - 1}{3 - 1} = -\dfrac13$，且 $f'(c) = -\dfrac{1}{c^2} = -\dfrac13$ 给出 $c^2 = 3$，因此 $c = \sqrt3 \approx 1.732$（解 $-\sqrt3$ 不在区间内）。

**(c)** $\abs{x - 1}$ 在 $x = 1$ 处有拐点，位于 $(0, 3)$ 内，因此它在 $(0, 3)$ 上不可导。并且不存在 $c$：割线斜率是 $\dfrac{2 - 1}{3 - 0} = \dfrac13$，而 $f'(x)$ 是 $-1$ 对于 $x < 1$ 和 1 对于 $x > 1$。

**(d)** 割线斜率是

$$\begin{aligned} \frac{f(b) - f(a)}{b - a} &= \frac{p(b^2 - a^2) + q(b - a)}{b - a} \\ &= p(b + a) + q, \end{aligned}$$

在因式分解 $b^2 - a^2 = (b - a)(b + a)$ 之后除以 $b - a$。并且当 $c = \tfrac{a + b}{2}$ 时， $f'(c) = 2pc + q$ 等于它。这是 [练习 1.11](module_01_ZH.html#ex-1-11) 反向阅读：割线除以 $[a, b]$ 与中点处的切线平行。

```check
fe2 = x**2 - 4*x
same(fe2.subs(x, 1), -3); same(fe2.subs(x, 5), 5); same((5 - (-3))/(5 - 1), 2); same(solve(diff(fe2, x) - 2, x), [3])
same((Rational(1, 3) - 1)/(3 - 1), -Rational(1, 3)); same_set(solve(-1/x**2 + Rational(1, 3), x), [sqrt(3), -sqrt(3)]); rounds(sqrt(3), '1.732')
same((Abs(3 - 1) - Abs(0 - 1))/(3 - 0), Rational(1, 3))
pq_, qq_, rq_ = symbols('p q r')
fq2 = lambda X: pq_*X**2 + qq_*X + rq_
same(cancel((fq2(b) - fq2(a))/(b - a)), pq_*(a + b) + qq_)
same(solve(Eq(diff(fq2(x), x), pq_*(a + b) + qq_), x), [(a + b)/2])
```
:::
::::

:::: exercise 立方函数的增减与弯曲 {#ex-8-3} ★
设 $f(x) = x^3 - 6x^2 + 9x + 2$。

- (a) 求 $f$ 在哪些区间上是递增或递减的，并找出其局部极值。
- (b) 求凹凸区间和拐点。
- (c) 证明拐点是局部最大值点和局部最小值点所连线段的中点。

::: solution
**(a)** $f'(x) = 3x^2 - 12x + 9 = 3(x - 1)(x - 3)$. 如例 8.6 所示，$f' > 0$ 对于 $x < 1$，$f' < 0$ 对于 $1 < x < 3$，$f' > 0$ 对于 $x > 3$。因此，$f$ 在 $(-\infty, 1]$ 和 $[3, \infty)$ 上是递增的，在 $[1, 3]$ 上是递减的。根据一阶导数判定法，$f(1) = 1 - 6 + 9 + 2 = 6$ 是一个局部最大值，$f(3) = 27 - 54 + 27 + 2 = 2$ 是一个局部最小值。

**(b)** $f''(x) = 6x - 12$ 在 $x < 2$ 上为负，在 $x > 2$ 上为正： $(-\infty, 2)$ 上函数向下凹， $(2, \infty)$ 上函数向上凹，拐点为 $(2, f(2)) = (2, 4)$。

**(c)** $(1, 6)$ 与 $(3, 2)$ 的中点为 $\big(\tfrac{1 + 3}{2}, \tfrac{6 + 2}{2}\big) = (2, 4)$，即拐点。 （每个有两个临界点的三次函数都如此：其图像关于拐点作半旋转对称。）

```check
fe3 = x**3 - 6*x**2 + 9*x + 2
steps(diff(fe3, x), 3*x**2 - 12*x + 9, 3*(x - 1)*(x - 3))
same(solve_univariate_inequality(diff(fe3, x) < 0, x, relational=False), Interval.open(1, 3))
same(fe3.subs(x, 1), 6); same(fe3.subs(x, 3), 2); same(diff(fe3, x, 2), 6*x - 12); same(solve(6*x - 12, x), [2]); same(fe3.subs(x, 2), 4)
same(((1 + 3)/Integer(2), (6 + 2)/Integer(2)), (2, 4))
same(expand(fe3.subs(x, 2 + u) + fe3.subs(x, 2 - u)), 8)      # symmetric about (2, 4)
A3, B3, C3, D3 = symbols('A B C D'); cub = A3*x**3 + B3*x**2 + C3*x + D3; x3 = -B3/(3*A3)   # every cubic, A != 0
same(solve(diff(cub, x, 2), x), [x3]); same(expand(cub.subs(x, x3 + u) + cub.subs(x, x3 - u) - 2*cub.subs(x, x3)), 0)
same(sum(solve(diff(cub, x), x))/2, x3)                         # the critical numbers are symmetric about the inflection point
```
:::
::::

:::: exercise 当二阶导数检验失效时 {#ex-8-4} ★
设 $g(x) = 3x^5 - 5x^3$。

- (a) 求 $g$ 的临界点，并在适用时使用二阶导数检验法。
- (b) 在哪个临界点处该测试失效？ 决定在该点发生什么情况，使用一阶导数判别法。
- (c) 找出拐点。

::: solution
**(a)** $g'(x) = 15x^4 - 15x^2 = 15x^2(x - 1)(x + 1)$, 所以临界点是 $-1$, 0 和 1. $g''(x) = 60x^3 - 30x = 30x(2x^2 - 1)$. 在 1 处, $g''(1) = 30 > 0$: $g(1) = 3 - 5 = -2$ 是局部最小值。在 $-1$ 处, $g''(-1) = -30 < 0$: $g(-1) = -3 + 5 = 2$ 是局部最大值。

**(b)** 在 0 处, $g''(0) = 0$, 并且测试无结论。对于 $0 < \abs{x} < 1$, $15x^2 > 0$ 和 $x^2 - 1 < 0$, 所以 $g'(x) < 0$ 在 0 的两侧：根据一阶导数判别法，0 处无极值。($g$ 在 $[-1, 1]$ 上递减。)

**(c)** $g''(x) = 30x(2x^2 - 1) = 0$ 在 $x = 0$ 和 $x = \pm\tfrac{1}{\sqrt2}$ 处，且 $g''$ 在每个点处变号，因为这些是多项式的三个简单零点。由于 $g\big(\tfrac{1}{\sqrt2}\big) = \tfrac{3}{4\sqrt2} - \tfrac{5}{2\sqrt2} = -\tfrac{7}{4\sqrt2} = -\tfrac{7\sqrt2}{8} \approx -1.237$ 和 $g$ 为奇数，拐点为 $(0, 0)$ 和 $\big(\pm\tfrac{1}{\sqrt2}, \mp\tfrac{7\sqrt2}{8}\big)$。

```check
ge4 = 3*x**5 - 5*x**3
same(factor(diff(ge4, x)), 15*x**2*(x - 1)*(x + 1)); same(factor(diff(ge4, x, 2)), 30*x*(2*x**2 - 1))
same(diff(ge4, x, 2).subs(x, 1), 30); same(diff(ge4, x, 2).subs(x, -1), -30); same(ge4.subs(x, 1), -2); same(ge4.subs(x, -1), 2)
same(diff(ge4, x, 2).subs(x, 0), 0)
same(solve_univariate_inequality(diff(ge4, x) < 0, x, relational=False), Union(Interval.open(-1, 0), Interval.open(0, 1)))
same_set(solve(diff(ge4, x, 2), x), [0, 1/sqrt(2), -1/sqrt(2)])
for r_ in (0, 1/sqrt(2), -1/sqrt(2)):
    holds(diff(ge4, x, 2).subs(x, r_ - Rational(1, 100))*diff(ge4, x, 2).subs(x, r_ + Rational(1, 100)) < 0)
steps(ge4.subs(x, 1/sqrt(2)), 3/(4*sqrt(2)) - 5/(2*sqrt(2)), -7/(4*sqrt(2)), -7*sqrt(2)/8); rounds(-7*sqrt(2)/8, '-1.237')
same(ge4.subs(x, -x), -ge4)
```
:::
::::

:::: exercise 有一条斜渐近线的图像 {#ex-8-5} ★★
画出 $f(x) = \dfrac{x^2}{x - 1}$ 的图像，按照第 8.5 节的检查清单进行。 （提示： $x^2 = (x - 1)(x + 1) + 1$ 。）

::: solution
1. **定义域。** 所有 $x \ne 1$ 。
2. **截距。** $f(0) = 0$ ，且 $f(x) = 0$ 仅在 $x = 0$ 处。
3. **对称性。** 无： $f(-1) = -\tfrac12$ ，而 $f(1)$ 并未定义为偶函数。
4. **渐近线。** 根据提示， $f(x) = x + 1 + \dfrac{1}{x - 1}$ 。当 $x \to \pm\infty$ ， $\dfrac{1}{x - 1} \to 0$ ，因此 $y = x + 1$ 是斜渐近线；图像在 $x > 1$ 时位于其上方，在 $x < 1$ 时位于其下方。当 $x \to 1^+$ ， $f(x) \to \infty$ ；当 $x \to 1^-$ ， $f(x) \to -\infty$ ： $x = 1$ 是垂直渐近线。
5. **增减性。** $f'(x) = 1 - \dfrac{1}{(x - 1)^2} = \dfrac{(x - 1)^2 - 1}{(x - 1)^2} = \dfrac{x(x - 2)}{(x - 1)^2}$ 。分母为正，因此 $f'$ 的符号由 $x(x - 2)$ 决定： $x < 0$ 和 $x > 2$ 时为正， $0 < x < 1$ 和 $1 < x < 2$ 时为负。因此 $f$ 在 $(-\infty, 0]$ 和 $[2, \infty)$ 上递增，在 $[0, 1)$ 和 $(1, 2]$ 上递减。
6. **极值.** $f(0) = 0$ 是一个局部最大值，而 $f(2) = 4$ 是一个局部最小值。注意，局部最小值大于局部最大值：它们位于不同的分支上。
7. **凹凸性.** $f''(x) = \dfrac{2}{(x - 1)^3}$ 为负， $x < 1$ 为正， $x > 1$ 为正：在 $(-\infty, 1)$ 上凹下，在 $(1, \infty)$ 上凹上，没有拐点，因为 1 不在定义域内。
8. **草图.** 两个分支紧贴着直线 $y = x + 1$：左侧上升至峰值 $(0, 0)$，然后沿着渐近线 $x = 1$ 下降；右侧从 $+\infty$ 下降到谷点 $(2, 4)$，然后沿着 $y = x + 1$ 上升。

```check
fe5 = x**2/(x - 1)
same(expand((x - 1)*(x + 1) + 1), x**2); same(fe5, x + 1 + 1/(x - 1)); same(fe5.subs(x, 0), 0); same(fe5.subs(x, -1), -Rational(1, 2))
limit_is(fe5 - (x + 1), x, oo, 0); limit_is(fe5 - (x + 1), x, -oo, 0); limit_is(fe5, x, 1, oo, '+'); limit_is(fe5, x, 1, -oo, '-')
same(solve_univariate_inequality(1/(x - 1) > 0, x, relational=False), Interval.open(1, oo))   # above y = x + 1 exactly for x > 1
steps(diff(fe5, x), 1 - 1/(x - 1)**2, ((x - 1)**2 - 1)/(x - 1)**2, x*(x - 2)/(x - 1)**2)
same(solve_univariate_inequality(x*(x - 2) < 0, x, relational=False), Interval.open(0, 2))
same(fe5.subs(x, 2), 4); same(diff(fe5, x, 2), 2/(x - 1)**3)
```
:::
::::

:::: exercise 由中值定理得到的界 {#ex-8-6} ★★
- (a) 证明 $\abs{\sin b - \sin a} \le \abs{b - a}$ 对所有实数 $a$ 和 $b$ 成立。
- (b) 证明 $\dfrac{x}{1 + x} < \ln(1 + x) < x$ 对于每个 $x > 0$ 成立。（将中值定理应用于 $\ln$ 在 $[1, 1 + x]$ 上。）
- (c) 利用 (b) 来限制 $\ln 1.1$，并与它的值进行比较。

::: solution
**(a)** 若 $a = b$，两边都为 0。否则，对 $\sin$ 在 $a$ 和 $b$ 之间的区间应用微分中值定理，得到 $\sin b - \sin a = \cos c\,(b - a)$，其中 $c$ 在两点之间。又因 $\abs{\cos c} \le 1$，故 $\abs{\sin b - \sin a} = \abs{\cos c}\,\abs{b - a} \le \abs{b - a}$。也就是说，正弦函数的输出变化量不会超过输入变化量，因为斜率的绝对值始终不超过 1。

**(b)** 函数 $\ln$ 在 $(0, \infty)$ 上连续可微，导数为 $\dfrac1t$（模块 6）。在 $[1, 1 + x]$ 上应用微分中值定理，得到一个 $c$，满足 $1 < c < 1 + x$，且

$$\ln(1 + x) - \ln 1 = \frac1c\cdot x,$$

与 $\ln 1 = 0$ 相同，这表示 $\ln(1 + x) = \dfrac{x}{c}$。由 $1 < c < 1 + x$ 得 $\dfrac{1}{1 + x} < \dfrac1c < 1$；乘以 $x > 0$ 得 $\dfrac{x}{1 + x} < \ln(1 + x) < x$。

**(c)** 用 $x = 0.1$： $\dfrac{0.1}{1.1} \approx 0.0909 < \ln 1.1 < 0.1$。事实上 $\ln 1.1 \approx 0.0953$，介于两个界之间。

```check
same(function_range(cos(x), x, S.Reals), Interval(-1, 1)); same(diff(sin(x), x), cos(x)); same(diff(log(x), x), 1/x); same(log(1), 0)
same(Rational(1, 10)/Rational(11, 10), Rational(1, 11)); rounds(Rational(1, 11), '0.0909'); rounds(log(Rational(11, 10)), '0.0953')
holds(Rational(1, 11) < log(Rational(11, 10))); holds(log(Rational(11, 10)) < Rational(1, 10))
for xv_ in (Rational(1, 100), 1, 5, 100):
    holds(xv_/(1 + xv_) < log(1 + xv_)); holds(log(1 + xv_) < xv_)
```
:::
::::

:::: exercise 最大功率传输 {#ex-8-7} ★★
一个电压为 $V$、内阻为 $r > 0$ 的电池驱动一个电阻为 $R$ 的设备。根据欧姆定律，电流为 $I = \dfrac{V}{R + r}$，传输到设备的功率为 $P = I^2R$。

- (a) 证明在所有 $R > 0$ 中，当 $R = r$ 时， $P(R) = \dfrac{V^2R}{(R + r)^2}$ 是最大的，并找出最大功率。
- (b) 假设 hypothetically $V = 12$ 伏特和 $r = 0.5$ 欧姆。找出最佳 $R$ 和最大功率（单位：瓦特）。

::: solution
**(a)** 根据商的法则，

$$\begin{aligned} P'(R) &= V^2\,\frac{(R + r)^2 - R\cdot2(R + r)}{(R + r)^4} \\ &= V^2\,\frac{(R + r) - 2R}{(R + r)^3} = \frac{V^2(r - R)}{(R + r)^3}, \end{aligned}$$

消去一个因子 $R + r$。对于 $R > 0$，分母为正，因此 $P'(R) > 0$ 对于 $R < r$， $P'(R) < 0$ 对于 $R > r$。根据定理 8.14（带 $I = (0, \infty)$）， $P(r)$ 是绝对最大值：

$$P(r) = \frac{V^2r}{(2r)^2} = \frac{V^2}{4r}.$$

这是电气工程中的 **最大功率传输定理**：一个电源将最大功率传输给与其自身电阻相匹配的负载。

**(b)** $R = 0.5$ 欧姆， $P = \dfrac{12^2}{4 \cdot 0.5} = \dfrac{144}{2} = 72$ 瓦特。

```check
Rr, rr8, VV = symbols('R r V', positive=True)
P8 = VV**2*Rr/(Rr + rr8)**2
steps(diff(P8, Rr), VV**2*((Rr + rr8)**2 - Rr*2*(Rr + rr8))/(Rr + rr8)**4, VV**2*((Rr + rr8) - 2*Rr)/(Rr + rr8)**3, VV**2*(rr8 - Rr)/(Rr + rr8)**3)
same(solve(diff(P8, Rr), Rr), [rr8]); same(P8.subs(Rr, rr8), VV**2/(4*rr8))
same((VV**2/(4*rr8)).subs({VV: 12, rr8: Rational(1, 2)}), 72); same(maximum(P8.subs({VV: 12, rr8: Rational(1, 2)}), Rr, Interval.open(0, oo)), 72)
```
:::
::::

:::: exercise 中心差分的最佳步骤 {#ex-8-8} ★★
第 4.7 节在浮点数中，对 $x^3$ 在 1 处的中心差分误差大小的上界约为 $E(h) = h^2 + \dfrac{\varepsilon}{h}$，其中 $\varepsilon = 2^{-52} \approx 2.2 \times 10^{-16}$，并指出该上界在 $h = (\varepsilon/2)^{1/3}$ 时最小。

- (a) 证明：证明 $E$ 在 $(0, \infty)$ 上 $h^* = (\varepsilon/2)^{1/3}$ 处取得绝对最小值，并且 $E(h^*) = 3h^{*2}$。
- (b) 计算 $h^*$ 和 $E(h^*)$，并与 [第4.7节](module_04_ZH.html#rounding) 进行比较。

::: solution
**(a)** $E'(h) = 2h - \dfrac{\varepsilon}{h^2}$，当$2h^3 = \varepsilon$时其值为0，即在$h^* = (\varepsilon/2)^{1/3}$处，这是$(0, \infty)$中唯一的临界数。且$E''(h) = 2 + \dfrac{2\varepsilon}{h^3} > 0$对于$h > 0$成立，因此$E$在$(0, \infty)$上凹向上，由定理8.11知$E(h^*)$为绝对最小值。由于$h^{*3} = \varepsilon/2$，$\dfrac{\varepsilon}{h^*} = \dfrac{\varepsilon h^{*2}}{h^{*3}} = 2h^{*2}$，故$E(h^*) = h^{*2} + 2h^{*2} = 3h^{*2}$：在最佳步长下，界限的舍入部分$\varepsilon/h^*$是截断部分$h^{*2}$的两倍。

**(b)** $h^* = \big(2^{-53}\big)^{1/3} \approx 4.8 \times 10^{-6}$ and $E(h^*) = 3h^{*2} \approx 6.9 \times 10^{-11}$. 第四节 4.7 给出了 "关于 $5 \times 10^{-6}$" 和 "关于 $7 \times 10^{-11}$"，相同的数值四舍五入，其表格在大小上具有最小的中心误差，约为 $10^{-10}$，接近

```check
eps8 = Integer(2)**-52
hpos = symbols('h', positive=True); epp = symbols('varepsilon', positive=True)
E8 = hpos**2 + epp/hpos
same(diff(E8, hpos), 2*hpos - epp/hpos**2); same(solve(diff(E8, hpos), hpos), [(epp/2)**Rational(1, 3)])
same(diff(E8, hpos, 2), 2 + 2*epp/hpos**3); same(E8.subs(hpos, (epp/2)**Rational(1, 3)), 3*((epp/2)**Rational(1, 3))**2)
hs8 = (eps8/2)**Rational(1, 3)
same(hs8, (Integer(2)**-53)**Rational(1, 3)); rounds(hs8, '4.8e-6'); rounds(3*hs8**2, '6.9e-11'); rounds(eps8, '2.2e-16')
rounds(hs8, '5e-6'); rounds(3*hs8**2, '7e-11')
cen8 = lambda hv: abs(3.0 - ((1.0 + hv)**3 - (1.0 - hv)**3)/(2*hv))      # Section 4.7's table of central errors, in floating point
err8 = {k_: cen8(10.0**-k_) for k_ in range(1, 16)}
holds(min(err8, key=err8.get) in (5, 6, 7)); rounds(min(err8.values()), '1e-10'); holds(10.0**-6 < float(hs8) < 10.0**-5)
```
:::
::::

:::: exercise 手动进行梯度下降 {#ex-8-9} ★★
一个机器学习模型从 $y = wx$ 预测 $x$，有一个参数 $w$。在三个（虚构的）测量值 $(x, y) = (1, 2)$、$(2, 3)$ 和 $(3, 7)$ 上，其 **均方误差** 为

$$L(w) = \frac{(w - 2)^2 + (2w - 3)^2 + (3w - 7)^2}{3}.$$

- (a) 展开 $L$，并找出使它最小化的 $w$。
- (b) 证明使用步长 $\eta$ 的梯度下降法满足 $w_{k+1} - w^* = \big(1 - \tfrac{28}{3}\eta\big)(w_k - w^*)$，其中 $w^*$ 是最小值点。对于哪类 $\eta$ 它会收敛？哪类 $\eta$ 在一步内到达 $w^*$？
- (c) 从 $w_0 = 0$ 开始，计算 $w_1$、$w_2$、$w_3$ 用 $\eta = 0.05$，然后再用 $\eta = 0.25$。

::: solution
**(a)** 展开平方项，得到 $(w^2 - 4w + 4) + (4w^2 - 12w + 9) + (9w^2 - 42w + 49) = 14w^2 - 58w + 62$，因此

$$\begin{aligned} L(w) &= \frac{14w^2 - 58w + 62}{3}, \\ L'(w) &= \frac{28w - 58}{3}. \end{aligned}$$

$L'(w) = 0$ 在 $w^* = \tfrac{58}{28} = \tfrac{29}{14} \approx 2.071$ 处，且 $L''(w) = \tfrac{28}{3} > 0$，因此根据定理 8.11，这是绝对最小值。

**(b)** 由于 $58 = 28w^*$，且 $L'(w) = \tfrac{28}{3}(w - w^*)$，一步计算得到

$$\begin{aligned} w_{k+1} - w^* &= (w_k - w^*) - \eta\cdot\tfrac{28}{3}(w_k - w^*) \\ &= \big(1 - \tfrac{28}{3}\eta\big)(w_k - w^*). \end{aligned}$$

这是例题 8.18，带标记 $q = L'' = \tfrac{28}{3}$：它在 $0 < \eta < \tfrac{2}{28/3} = \tfrac{3}{14} \approx 0.214$ 时收敛，且 $\eta = \tfrac{3}{28} \approx 0.107$ 在一步内落在 $w^*$。

**(c)** 根据 (b)，$w_k = w^* - \big(1 - \tfrac{28}{3}\eta\big)^k w^*$。当 $\eta = 0.05$ 为因子时，因子为 $1 - \tfrac{1.4}{3} = \tfrac{8}{15}$，且

$$\begin{aligned} w_1 &= \tfrac{29}{30} \approx 0.967, \\ w_2 &= \tfrac{667}{450} \approx 1.482, \\ w_3 &= \tfrac{11861}{6750} \approx 1.757, \end{aligned}$$

逐渐接近 2.071，每一步都去除剩余距离的相同分数 $\tfrac{7}{15}$。当 $\eta = 0.25$ 时，高于 $\tfrac{3}{14}$，因子为 $1 - \tfrac73 = -\tfrac43$，且

$$\begin{aligned} w_1 &= \tfrac{29}{6} \approx 4.833, \\ w_2 &= -\tfrac{29}{18} \approx -1.611, \\ w_3 &= \tfrac{377}{54} \approx 6.981: \end{aligned}$$

每一步的超调量都比上一步更大。

```check
wv = symbols('w')
L89 = ((wv - 2)**2 + (2*wv - 3)**2 + (3*wv - 7)**2)/3
same(expand(3*L89), 14*wv**2 - 58*wv + 62); same(diff(L89, wv), (28*wv - 58)/3); same(solve(diff(L89, wv), wv), [Rational(29, 14)])
rounds(Rational(29, 14), '2.071'); same(diff(L89, wv, 2), Rational(28, 3))
ws_ = Rational(29, 14)
same(diff(L89, wv), Rational(28, 3)*(wv - ws_)); same(expand(wv - eta_*diff(L89, wv) - ws_), expand((1 - Rational(28, 3)*eta_)*(wv - ws_)))
same(2/Rational(28, 3), Rational(3, 14)); rounds(Rational(3, 14), '0.214'); same(1/Rational(28, 3), Rational(3, 28)); rounds(Rational(3, 28), '0.107')
for et_, want_ in ((Rational(5, 100), [Rational(29, 30), Rational(667, 450), Rational(11861, 6750)]), (Rational(25, 100), [Rational(29, 6), -Rational(29, 18), Rational(377, 54)])):
    w_ = Integer(0); got_ = []
    for _ in range(3):
        w_ = w_ - et_*diff(L89, wv).subs(wv, w_); got_.append(w_)
    same(got_, want_)
same(1 - Rational(28, 3)*Rational(5, 100), Rational(8, 15)); same(1 - Rational(28, 3)*Rational(25, 100), -Rational(4, 3))
rounds(Rational(29, 30), '0.967'); rounds(Rational(667, 450), '1.482'); rounds(Rational(11861, 6750), '1.757')
rounds(Rational(29, 6), '4.833'); rounds(-Rational(29, 18), '-1.611'); rounds(Rational(377, 54), '6.981')
```
:::
::::

:::: exercise $e^\pi$ 或 $\pi^e$？ {#ex-8-10} ★★★
- (a) 求 $f(x) = \dfrac{\ln x}{x}$ 在 $(0, \infty)$ 上的绝对最大值。
- (b) 不使用计算器，判断 $e^\pi$ 和 $\pi^e$ 哪个更大。
- (c) 模块 6 发现 $y = x^{1/x}$ 在 $x = e$ 处有水平切线。证明 $e^{1/e}$ 是其在 $(0, \infty)$ 上的绝对最大值。

::: solution
**(a)** 根据商法则， $f'(x) = \dfrac{\frac1x\cdot x - \ln x}{x^2} = \dfrac{1 - \ln x}{x^2}$。由于 $\ln$ 随 $\ln e = 1$ 增加， $f'(x) > 0$ 对于 $0 < x < e$， $f'(x) < 0$ 对于 $x > e$。根据定理 8.14，绝对最大值是 $f(e) = \dfrac{1}{e}$，且 $f(x) < \dfrac1e$ 对于每一个 $x \ne e$。

**(b)** 由于 $\pi \ne e$，(a) 给出 $\dfrac{\ln\pi}{\pi} < \dfrac1e$。乘以 $e\pi > 0$： $e\ln\pi < \pi$，即 $\ln\big(\pi^e\big) < \ln\big(e^\pi\big)$。由于 $\ln$ 是递增的， $\pi^e < e^\pi$。 （实际上 $e^\pi \approx 23.14$ 和 $\pi^e \approx 22.46$。）

**(c)** 对于 $x > 0$， $x^{1/x} = e^{(\ln x)/x}$，且 $e^u$ 在 $u$ 中递增。根据 (a)，指数 $(\ln x)/x$ 最大， $\tfrac1e$，在 $x = e$ 处，其他地方则更小；因此 $x^{1/x}$ 在 $x = e$ 处最大，值为 $e^{1/e} \approx 1.4447$。这是模块 6 所承诺的。

```check
f810e = log(x)/x
same(diff(f810e, x), (1 - log(x))/x**2); same(f810e.subs(x, E), exp(-1))
same(maximum(f810e, x, Interval.open(0, oo)), exp(-1))
holds(log(pi)/pi < exp(-1)); holds(E*log(pi) < pi); holds(pi**E < E**pi)
rounds(E**pi, '23.14'); rounds(pi**E, '22.46'); rounds(exp(exp(-1)), '1.4447')
xpp = symbols('x', positive=True); same(xpp**(1/xpp), exp(log(xpp)/xpp))
```
:::
::::

:::: exercise 最长的绕过拐角的管道 {#ex-8-11} ★★★
一条宽 2.7 米的走廊与一条宽 0.8 米的走廊垂直相交。一根直的、足够细以至于可以忽略其厚度的管道，要从一条走廊移到另一条走廊。最长的管道长度是多少才能绕过这个拐角？

提示：一个线段如果接触内角，并且与宽走廊的墙壁形成角度 $\theta$，当其长度为 $L(\theta) = \dfrac{2.7}{\sin\theta} + \dfrac{0.8}{\cos\theta}$ 时，该线段会接触到外侧墙壁，对于 $0 < \theta < \dfrac{\pi}{2}$。当管道长度不超过所有这样的线段长度时，管道才能通过拐角。

::: solution
当管道长度不超过 $L$ 在 $\big(0, \tfrac{\pi}{2}\big)$ 上的最小值时，管道才能恰好通过拐角；在 $L$ 最小时，若管道更长则会卡住。因此需要最小化 $L$。根据链式法则，

$$\begin{aligned} L'(\theta) &= -\frac{2.7\cos\theta}{\sin^2\theta} + \frac{0.8\sin\theta}{\cos^2\theta} \\ &= \frac{0.8\sin^3\theta - 2.7\cos^3\theta}{\sin^2\theta\cos^2\theta}. \end{aligned}$$

顶部等于 $\cos^3\theta\,(0.8\tan^3\theta - 2.7)$，因此 $L'(\theta) = 0$ 当 $\tan^3\theta = \dfrac{2.7}{0.8} = 3.375 = 1.5^3$，即在 $\tan\theta^* = 1.5$ 处。由于 $\tan$ 在 $\big(0, \tfrac{\pi}{2}\big)$ 上递增，因此 $L' < 0$ 对于 $\theta < \theta^*$，而 $L' > 0$ 对于 $\theta > \theta^*$，所以根据定理 8.14， $L(\theta^*)$ 是绝对最小值。一个直角三角形，其直角边为 1 和 1.5，斜边为 $\sqrt{1 + 2.25} = \sqrt{3.25} = \tfrac{\sqrt{13}}{2}$，因此 $\sin\theta^* = \dfrac{3}{\sqrt{13}}$ 和 $\cos\theta^* = \dfrac{2}{\sqrt{13}}$，并且

$$\begin{aligned} L(\theta^*) &= \frac{2.7\sqrt{13}}{3} + \frac{0.8\sqrt{13}}{2} \\ &= (0.9 + 0.4)\sqrt{13} = 1.3\sqrt{13} \\ &\approx 4.687 \text{ m}. \end{aligned}$$

最长的管道长度约为 4.69 米。一般来说，对于宽度分别为 $p$ 和 $q$ 的走廊，同样的步骤得到 $(p^{2/3} + q^{2/3})^{3/2}$；检查此处是否得到 4.687。

```check
th = symbols('theta')
L811 = Rational(27, 10)/sin(th) + Rational(8, 10)/cos(th)
same(diff(L811, th), -Rational(27, 10)*cos(th)/sin(th)**2 + Rational(8, 10)*sin(th)/cos(th)**2)
same(diff(L811, th), (Rational(8, 10)*sin(th)**3 - Rational(27, 10)*cos(th)**3)/(sin(th)**2*cos(th)**2))
same(Rational(27, 10)/Rational(8, 10), Rational(3375, 1000)); same(Rational(3, 2)**3, Rational(3375, 1000))
ts = atan(Rational(3, 2))
same(sin(ts), 3/sqrt(13)); same(cos(ts), 2/sqrt(13)); same(sqrt(1 + Rational(9, 4)), sqrt(13)/2)
same(L811.subs(th, ts), Rational(13, 10)*sqrt(13)); rounds(Rational(13, 10)*sqrt(13), '4.687'); rounds(Rational(13, 10)*sqrt(13), '4.69')
same(diff(L811, th).subs(th, ts), 0); holds(diff(L811, th).subs(th, Rational(1, 2)) < 0); holds(diff(L811, th).subs(th, Rational(3, 2)) > 0)
near((Rational(27, 10)**Rational(2, 3) + Rational(8, 10)**Rational(2, 3))**Rational(3, 2), Rational(13, 10)*sqrt(13), 1e-20)
```
:::
::::

:::: exercise 方程 $f' = kf$ {#ex-8-12} ★★★
- (a) 设 $k$ 为常数，且 $f$ 在 $\R$ 上可导，且对所有 $x$ 有 $f'(x) = kf(x)$。证明对所有 $x$ 有 $f(x) = f(0)e^{kx}$。（考虑 $g(x) = f(x)e^{-kx}$。）
- (b) 推出 $e^x$ 是唯一满足 $f' = f$ 和 $f(0) = 1$ 的函数。
- (c) 同样地，证明如果 $f'(x) = 2xf(x)$ 对所有 $x$ 成立，则 $f(x) = f(0)e^{x^2}$。

::: solution
**(a)** 根据乘积法则和链式法则，

$$\begin{aligned} g'(x) &= f'(x)e^{-kx} + f(x)\cdot\big(-ke^{-kx}\big) \\ &= \big(f'(x) - kf(x)\big)e^{-kx} = 0 \end{aligned}$$

对于每一个 $x$，由于 $f' = kf$。根据定理 8.5，应用于区间 $\R$ 上， $g$ 是常数： $g(x) = g(0) = f(0)e^0 = f(0)$。因此 $f(x)e^{-kx} = f(0)$，乘以 $e^{kx}$ 得到 $f(x) = f(0)e^{kx}$。

**(b)** 设 $k = 1$ 和 $f(0) = 1$，(a) 给出 $f(x) = e^x$。模块 6 显示 $e^x$ 具有这两个性质；现在没有其他函数具有这些性质。同样地，模块 6 中的增长和衰减模型 $N(t) = N_0e^{kt}$ 是 $N' = kN$ 在 $N(0) = N_0$ 下的唯一解：一个按其大小比例增长的量必须按指数增长。模块 13 将再次遇到这样的方程。

**(c)** 设 $g(x) = f(x)e^{-x^2}$。则

$$\begin{aligned} g'(x) &= f'(x)e^{-x^2} - 2xf(x)e^{-x^2} \\ &= \big(f'(x) - 2xf(x)\big)e^{-x^2} = 0, \end{aligned}$$

所以 $g(x) = g(0) = f(0)$ 对于每一个 $x$，且 $f(x) = f(0)e^{x^2}$。

```check
kk8 = symbols('k')
gq = Function('f')
same(diff(gq(x)*exp(-kk8*x), x), (diff(gq(x), x) - kk8*gq(x))*exp(-kk8*x))
same(diff(gq(x)*exp(-kk8*x), x).subs(Derivative(gq(x), x), kk8*gq(x)), 0)
same(diff(c*exp(kk8*x), x), kk8*c*exp(kk8*x)); same((c*exp(kk8*x)).subs(x, 0), c)
same(diff(gq(x)*exp(-x**2), x).subs(Derivative(gq(x), x), 2*x*gq(x)), 0)
same(diff(c*exp(x**2), x), 2*x*c*exp(x**2))
```
:::
::::

## 自测 {#quiz}

```quiz
? 假设 $f'(3) = 0$。哪一个陈述必须为真？
- [ ] $f$ 在 3 处有局部最大值或局部最小值
- [x] $x = 3$ 处的切线是水平的，但 $f$ 在那里可能没有极值
- [ ] 3 不是 $f$ 的临界数
- [ ] $f$ 在 3 附近是常数
> $f'(3) = 0$ 表示在 3 处的斜率为 0，因此 3 是一个临界数，且有水平切线。费马定理不能反过来使用：$(x - 3)^3$ 在 3 处导数为 0，但那里并没有极值。导数在某一点为 0 并不能说明附近点的情况，因此 $f$ 不一定为常数

? $f(x) = x^2 - 2x$ 在 $[0, 3]$ 上的绝对最大值为
- [x] $3$
- [ ] $1$
- [ ] $0$
- [ ] $-1$
> 唯一的临界点是 1，其中 $f'(x) = 2x - 2 = 0$。这些值分别是 $f(0) = 0$、$f(1) = -1$ 和 $f(3) = 3$，因此最大值是 3，在端点 3 处取得。$-1$ 是最小值；1 是临界点本身，不是一个函数值；0 是在另一个端点处的函数值。

? $f$ 在 $\R$、$f(1) = 2$ 和 $f(4) = 11$ 上可导。平均值定理保证存在 $c$ 属于 $(1, 4)$，使得
- [ ] $f(c) = 3$
- [ ] $f'(c) = 9$
- [ ] $f'(c) = 0$
- [x] $f'(c) = 3$
> 平均变化率是 $\dfrac{11 - 2}{4 - 1} = 3$，定理说明对于某些 $c$ 在 $(1, 4)$ 内， $f'(c)$ 等于它。9 是 $f$ 的变化量，未除以 $x$ 的变化量； $f'(c) = 0$ 是罗尔定理，需要 $f(1) = f(4)$；定理是关于导数，而不是值 $f(c)$。

? $f'(x) = 0$ 对于 $f$ 的定义域 $(-\infty, 0) \cup (0, \infty)$ 中的每一个 $x$。接下来是什么？
- [ ] $f$ 是常数
- [ ] $f(x) = 0$ 对于每个 $x \ne 0$ 都成立
- [x] $f$ 在 $(-\infty, 0)$ 上为常数，在 $(0, \infty)$ 上也为常数，可能有不同的常数
- [ ] 没有内容：定理 8.5 需要 $f'(0) = 0$
> 定理 8.5 在每个区间上分别适用，因为定义域是两个区间。 $\arctan x + \arctan(1/x)$ 在一个区间上是 $\tfrac{\pi}{2}$，在另一个区间上是 $-\tfrac{\pi}{2}$，因此 $f$ 不必是一个常数，也不必为 0。定理只需要在应用的区间上满足 $f' = 0$。

? $f'(2) = 0$ 和 $f''(2) = -3$。然后
- [x] $f$ 在 2 处有局部最大值
- [ ] $f$ 在 2 处有局部最小值
- [ ] $f$ 在 2 处有拐点
- [ ] 二阶导数判别法无法提供信息
> 根据二阶导数判别法， $f''(2) < 0$ 在临界点处有水平切线，表示该点凹向下：一个峰值，一个局部最大值。一个局部最小值需要 $f''(2) > 0$。在拐点处，若 $f''$ 存在，则其值为 0（定理 8.12），而 $f''(2) = -3$ 不成立。当 $f''(2) = 0$ 时，该判别法无结论。

? 哪个函数在 $x = 0$ 处有拐点？
- [ ] $x^4$
- [x] $x^3 + x$
- [ ] $x^2$
- [ ] $e^x$
> 对于 $x^3 + x$， $f''(x) = 6x$ 在 0 处变号：左侧凹向下，右侧凹向上。对于 $x^4$， $f''(0) = 0$ 但 $f''(x) = 12x^2 \ge 0$，因此图像两侧均为凹向上：无变化，无拐点。 $x^2$ 和 $e^x$ 在 $f'' > 0$ 处处处成立。

? 一个矩形的周长为 20 厘米，其最大可能面积是多少？
- [ ] $24$ 平方厘米
- [ ] $100$ 平方厘米
- [x] $25$ 平方厘米
- [ ] $20$ 平方厘米
> 以边 $x$ 和 $10 - x$，面积为 $A(x) = x(10 - x)$ 在 $[0, 10]$ 上。在 $A'(x) = 10 - 2x = 0$ 处为 $x = 5$，且 $A(5) = 25$ 大于 $A(0) = A(10) = 0$：最优矩形是正方形。24 平方厘米是一个 4 乘 6 的矩形，不是最优的；100 平方厘米则需要一个 10 乘 10 的正方形，其周长为 40 厘米；20 是周长，不是面积。

? 梯度下降 $x_{k+1} = x_k - \eta f'(x_k)$ 在 $f(x) = 2x^2$ 上从每个 $x_0 \ne 0$ 准确地趋近于最小值 0
- [ ] $0 < \eta < 2$
- [ ] $0 < \eta < \tfrac14$
- [x] $0 < \eta < \tfrac12$
- [ ] $\eta > 0$
> $f'(x) = 4x$，因此 $x_{k+1} = (1 - 4\eta)x_k$，当 $\abs{1 - 4\eta} < 1$ 收缩到 0 时，即 $0 < \eta < \tfrac12 = 2/f''$。对于 $\tfrac14 < \eta < \tfrac12$，它仍然收敛，但呈锯齿状；而 $\eta = \tfrac14$ 在一步内到达。 $0 < \eta < 2$ 忽略曲率 $f'' = 4$：当 $\eta = 1$ 时，因子为 $-3$，步长会发散。
```

```check
same(diff((x - 3)**3, x).subs(x, 3), 0); holds((Rational(29, 10) - 3)**3 < 0); holds((Rational(31, 10) - 3)**3 > 0)
fq1 = x**2 - 2*x
same(solve(diff(fq1, x), x), [1]); same([fq1.subs(x, v_) for v_ in (0, 1, 3)], [0, -1, 3]); same(maximum(fq1, x, Interval(0, 3)), 3)
same((11 - 2)/Integer(4 - 1), 3)
same(diff(x**3 + x, x, 2), 6*x); same(diff(x**4, x, 2), 12*x**2); same(diff(x**2, x, 2), 2); same(diff(exp(x), x, 2), exp(x))
Aq = x*(10 - x)
same(solve(diff(Aq, x), x), [5]); same(Aq.subs(x, 5), 25); same(maximum(Aq, x, Interval(0, 10)), 25); same(4*6, 24); same(2*(10 + 10), 40)
same(diff(2*x**2, x), 4*x); same(solve_univariate_inequality(Abs(1 - 4*eta_) < 1, eta_, relational=False), Interval.open(0, Rational(1, 2)))
same(1 - 4*1, -3); same((1 - 4*eta_).subs(eta_, Rational(1, 4)), 0)
```
