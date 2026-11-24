---
title: 指数、对数与隐函数求导
part: 2
lead: 了解常数 e 的由来，以及为什么 e 的 x 次方的导数等于它自身。接着对对数函数、反函数、反三角函数、双曲函数和方程定义的曲线求导，并验证指数增长与衰减公式。
minutes: 270
needs: 模块 1 到 5，特别是链式法则
goals:
  - 解释复利和点 $a^x$ 在 0 处的斜率如何都导致数 $e$，并说明什么被证明了以及什么被假设了
  - 求导以任意底数为底的指数函数和对数函数
  - 求反函数的导数，包括 $\ln x$ 和反三角函数
  - 使用隐函数和对数求导法求斜率和切线方程
  - 处理双曲函数及其导数
  - 验证 $Ce^{kt}$ 解决 $y' = ky$，并计算倍增时间和半衰期
---

## 数 e {#number-e}

模块 1 引入了欧拉数 $e \approx 2.71828$，以及自然对数 $\ln$ 作为 $e^x$ 的反函数，并承诺展示 $e$ 的来源。它同时来自两个方面。一个是金钱：利息被越来越频繁地加入账户。另一个是斜率：在所有指数函数 $a^x$ 中，恰好有一个在穿过 $y$ 轴时斜率为 1。本节将沿着这两个方向进行，第 6.3 节将展示它们最终得到同一个数。

### 复利 {#compound-interest}

假设一家银行年利率为 100%（一个荒谬的利率，选择这个是为了让数字简单），你存入 £1。如果利息只在年底加入一次，那么一年后你将拥有 £2。如果银行每六个月加入一半的年利率，即 50%，那么第一半年获得的利息在第二半年将产生利息，一年后你将拥有 $(1 + \tfrac12)^2 = 2.25$ 英镑。如果每年加入 $n$ 次利息，每次利率为 $\tfrac1n$，那么每次加入都将使余额乘以 $1 + \tfrac1n$，因此一年后你将拥有

$$\Big(1 + \frac1n\Big)^n \text{ pounds.}$$

这里是按年、按半年、按季度、按月、按周、按日（$n = 365$）、按小时（$n = 8760$）和按分钟（$n = 525{,}600$）复利计算的：

```valuetable
n = 1, 2, 4, 12, 52, 365, 8760, 525600
$\Big(1 + \dfrac1n\Big)^n$ = (1 + 1/n)**n
digits = 7
---
n | \Big(1 + \dfrac1n\Big)^n
1 | 2
2 | 2.25
4 | 2.441406
12 | 2.613035
52 | 2.692597
365 | 2.714567
8760 | 2.718127
525600 | 2.718279
```

更频繁的复利计算更有利，但好处越来越小：从按日复利到按分钟复利，收益增加不到半便士。这些金额趋于一个极限，大约是 2.71828，这相当于利息连续地、在每一个瞬间被计算的情况：**连续复利**。第 6.3 节证明这个极限是$e$。

```check
same((1 + Rational(1, 2))**2, Rational(9, 4))
from sympy.calculus.util import function_range
cmp = lambda N_: (1 + 1/Float(N_, 40))**N_            # 40-digit arithmetic: the exact fractions are huge
same(365*24, 8760); same(365*24*60, 525600)
holds(all(cmp(p) < cmp(q) for p, q in [(1, 2), (2, 4), (4, 12), (12, 52), (52, 365), (365, 8760), (8760, 525600)]))
holds(cmp(525600) - cmp(365) < Rational(1, 200))      # less than half a penny
rounds(E, '2.71828')
```

### $a^x$在 0 点的斜率 {#slope-at-zero}

每个指数函数 $a^x$ 都经过 $(0, 1)$，因为 $a^0 = 1$。在该点处，它的图像有多陡？根据模块 4，切线在 $x = 0$ 处的斜率是差商的极限，当 $h \to 0$ 时，

$$\frac{a^{0+h} - a^0}{h} = \frac{a^h - 1}{h}.$$

对于 $a = 2$ 和 $a = 3$：

```valuetable
h = 0.1, 0.01, 0.001, 0.0001, -0.0001, -0.001, -0.01, -0.1
$\dfrac{2^h - 1}{h}$ = (2**h - 1)/h
$\dfrac{3^h - 1}{h}$ = (3**h - 1)/h
digits = 6
---
h | \dfrac{2^h - 1}{h} | \dfrac{3^h - 1}{h}
0.1 | 0.717735 | 1.16123
0.01 | 0.695555 | 1.10467
0.001 | 0.693387 | 1.09922
0.0001 | 0.693171 | 1.09867
-0.0001 | 0.693123 | 1.09855
-0.001 | 0.692907 | 1.09801
-0.01 | 0.690750 | 1.09260
-0.1 | 0.669670 | 1.04042
```

从两侧来看，这些商趋于稳定：$2^x$在 0 点的斜率约为 0.6931，而 $3^x$ 的斜率约为 1.0986。写出

$$m(a) = \lim_{h\to0}\frac{a^h - 1}{h},$$

读作 "a 的 m"，表示 $a^x$ 在 $x = 0$ 处的斜率（$m$ 表示斜率，如模块 1 中所示）。表格表明 $m(2) \approx 0.6931$ 和 $m(3) \approx 1.0986$。在 0 处的斜率决定了所有位置的斜率：

```check
rounds(log(2), '0.6931'); rounds(log(3), '1.0986')
limit_is((2**h - 1)/h, h, 0, log(2)); limit_is((3**h - 1)/h, h, 0, log(3))
```

::: theorem 指数函数的导数
设 $a > 0$，并假设极限 $m(a)$ 存在，即 $a^x$ 在 $x = 0$ 处可导。那么 $a^x$ 在每一个 $x$ 处均可导，并且

$$\frac{d}{dx}\big(a^x\big) = m(a)\,a^x.$$
:::

::: proof
固定 $x$。根据指数法则 $a^{x+h} = a^x a^h$，

$$\frac{a^{x+h} - a^x}{h} = \frac{a^x a^h - a^x}{h} = a^x\cdot\frac{a^h - 1}{h}.$$

如 $h \to 0$，第一个因子 $a^x$ 不变，第二个因子趋近于 $m(a)$，因此根据乘积的极限法则，差商趋近于 $a^x\,m(a)$。
:::

```check
ap = symbols('a', positive=True); xr = symbols('x', real=True)
steps((ap**(xr + h) - ap**xr)/h, (ap**xr*ap**h - ap**xr)/h, ap**xr*(ap**h - 1)/h)
limit_is(ap**xr*(ap**h - 1)/h, h, 0, ap**xr*limit((ap**h - 1)/h, h, 0, '+-'))
```

::: keyidea
指数函数在任意一点的斜率等于该点的函数值乘以其在 0 点的斜率。指数函数的增长率与其自身大小成比例；第 6.8 节说明了这在种群、资金和放射性衰变中的含义。
:::

### 斜率为 1 的底数 {#base-e}

自从 $m(2) < 1 < m(3)$，在 2 和 3 之间应该存在一个基数，其指数函数在 0 处的斜率恰好为 1。要找到它，观察将基数提升到某个幂次对 0 处斜率的影响。

::: theorem 改变基数
设 $a > 0$，且假设 $m(a)$ 存在。那么对于每一个实数 $c$， $m(a^c)$ 存在且

$$m\big(a^c\big) = c\,m(a).$$
:::

::: proof
对于 $c = 0$， $a^0 = 1$ 和 $1^h = 1$，因此每个商都是 0，且 $m(1) = 0 = 0 \cdot m(a)$。对于 $c \ne 0$， $(a^c)^h = a^{ch}$ 根据指数法则，因此对于 $h \ne 0$

$$\frac{(a^c)^h - 1}{h} = c\cdot\frac{a^{ch} - 1}{ch}.$$

写作 $k = ch$。当 $h \to 0$， $k \to 0$，和 $k \ne 0$ 时， $h \ne 0$；因此分数 $\dfrac{a^k - 1}{k}$ 趋近于 $m(a)$，整个表达式趋近于 $c\,m(a)$。
:::

```check
cr = symbols('c', real=True, nonzero=True)
same(((ap**cr)**h - 1)/h, cr*(ap**(cr*h) - 1)/(cr*h))
limit_is(((ap**cr)**h - 1)/h, h, 0, cr*limit((ap**h - 1)/h, h, 0, '+-'))
limit_is((1**h - 1)/h, h, 0, 0)
```

现在选择$c = 1/m(2)$，这是允许的，因为$m(2)$（约为0.69）不为0。根据定理6.2，底数$2^{1/m(2)}$在0处的斜率为$\dfrac{1}{m(2)}\cdot m(2) = 1$。为了找到它，更精确地估计$m(2)$。表格中离$h = 0$最近的两个商值的平均值，即0.693171和0.693123，是模块4的中心差分，其精度远高于其中任何一个：$m(2) \approx 0.693147$。因此$1/m(2) \approx 1.442695$，且底数约为$2^{1.442695} \approx 2.718282$：即模块1的$e$的数字。

```check
qp_, qm_ = (2**Rational(1, 10000) - 1)*10000, (1 - 2**Rational(-1, 10000))*10000     # the table at h = 0.0001 and -0.0001
rounds(qp_, '0.693171'); rounds(qm_, '0.693123'); same((Rational('0.693171') + Rational('0.693123'))/2, Rational('0.693147'))
same((qp_ + qm_)/2, (2**Rational(1, 10000) - 2**Rational(-1, 10000))/(2*Rational(1, 10000))); rounds((qp_ + qm_)/2, '0.693147')
rounds(log(2), '0.693147'); rounds(1/log(2), '1.442695')
rounds(2**Rational(1442695, 1000000), '2.718282'); rounds(2**(1/log(2)), '2.718282')
same(2**(1/log(2)), E)
```

::: definition 数 e
**欧拉数** $e$ 是这样一个底数，其指数函数在 $x = 0$ 处的斜率为 1：

$$\lim_{h\to0}\frac{e^h - 1}{h} = 1.$$

**自然对数** 是如模块 1 所述，$e^x$ 的反函数：对于 $x > 0$，$\ln x = y$ 表示 $e^y = x$。
:::

```check
limit_is((exp(h) - 1)/h, h, 0, 1)
```

::: note
**什么是被证明的，什么是被当作公理的。** 本节假定了两个前提。第一个前提是模块 1 的幂 $a^x$ 对于每一个实数 $x$，具有模块 1 所列出的性质：指数法则（对于无理数 $x$， $a^x$ 是那些有理指数幂接近 $x$ 的幂所趋近的数），以及对于一个底数 $a > 1$， $a^x$ 是递增的，并且恰好取每一个正数值一次，因此对数存在。第二个前提是极限 $m(2)$ 存在并且是正数：表格几乎没有疑问地表明它大约是 0.6931，而且本节后面“深入一步”一框中简要说明了这两个事实如何被证明。本节中的其他一切内容都是从这两个前提推导出来的。定理 6.2 表明底数 $2^{1/m(2)}$ 在 0 处的斜率为 1，因此 $e$ 存在，而下一个定理则表明没有其他底数具有这一性质。
:::

::: theorem $e^x$ 和 $a^x$ 的导数
对于每一个实数 $x$，

$$\frac{d}{dx}\big(e^x\big) = e^x.$$

对于每一个底数 $a > 0$： $a^x = e^{x\ln a}$， $a^x$ 在 0 处的斜率是 $m(a) = \ln a$，并且

$$\frac{d}{dx}\big(a^x\big) = a^x\ln a.$$
:::

::: proof
按定义 6.1，$m(e) = 1$，因此定理 6.1 给出 $(e^x)' = 1 \cdot e^x = e^x$。令 $a > 0$。则 $a = e^{\ln a}$（模块 1），因此根据法则 $(a^u)^v = a^{uv}$，得到 $a^x = \big(e^{\ln a}\big)^x = e^{x\ln a}$。定理 6.2，以底 $e$ 和 $c = \ln a$，给出 $m(a) = m\big(e^{\ln a}\big) = \ln a \cdot m(e) = \ln a$，且定理 6.1 完成证明。
:::

```check
same(diff(exp(x), x), exp(x))
same(exp(log(ap)), ap); same(exp(xr*log(ap)), ap**xr)
limit_is((ap**h - 1)/h, h, 0, log(ap))
same(diff(ap**x, x), ap**x*log(ap)); same(diff(exp(xr*log(ap)), xr), ap**xr*log(ap))
same(solve(log(ap) - 1, ap), [E])        # m(a) = ln a = 1 only for a = e
```

所以 $m(2) = \ln 2$ 和 $m(3) = \ln 3$，表中的极限，以及 $e$ 是唯一在 0 处斜率为 1 的底数：$m(a) = 1$ 表示 $\ln a = 1$，即 $a = e$。你也可以通过模块 5 的链式法则达到 $(a^x)' = a^x\ln a$：$e^{x\ln a}$ 的导数是 $e^{x\ln a}\cdot\ln a = a^x\ln a$。

::: figure id=fig-06-1
左: $2^x$, $e^x$ 和 $3^x$ 都经过 $(0, 1)$，它们的切线（虚线）的斜率分别为 $\ln 2 \approx 0.69$，恰好为 1，和 $\ln 3 \approx 1.10$。右: $y = e^x$ 在 $x = -1$ 处的切线，0 和 1。每条切线在 $x$ 轴上的截距都比其接触点左移 1 个单位，因此其斜率（即上升量除以运行量）等于该点的函数值 $e^x$：该函数是其自身的导数。
:::

```check
rounds(log(2), '0.69'); rounds(log(3), '1.10')
al = symbols('alpha', real=True)
same(solve(exp(al) + exp(al)*(x - al), x), [al - 1])     # the tangent at x = alpha meets the axis at alpha - 1
```

::: widget name=exp-slope
移动滑块，或输入一个基数，直到橙色切线 $x = 0$ 沿着斜率为 1 的虚线。读数估计在 0 处的斜率，并告诉你何时该斜率在 1 的 0.001 以内：你能找到多少位 $e$？然后按 **Show ln a**并比较几个基数下的斜率 $\ln a$，再按**Show e**。绿色线是 $x = 1$ 处的切线；检查其斜率是否为 0 处斜率的 $a$ 倍，如定理 6.1 所述。
:::

::: example $e^x$ 和 $a^x$ 的导数
对 (a) $e^{3x}$、(b) $x^2e^{-x}$ 和 (c) $10^x$ 求导，并 (d) 求曲线 $y = e^x$ 在点 $x = 1$ 处的切线方程。

**(a)** 用链式法则，内函数为 $3x$，导数为 $\dfrac{d}{dx}e^{3x} = e^{3x}\cdot 3 = 3e^{3x}$。同样地，对于每个常数 $k$，导数为 $\dfrac{d}{dx}e^{kx} = ke^{kx}$。

**(b)** 用乘积法则，并结合 (a) 中的 $k = -1$：

$$\begin{aligned} \frac{d}{dx}\big(x^2e^{-x}\big) &= 2x\,e^{-x} + x^2\big(-e^{-x}\big) \\ &= \big(2x - x^2\big)e^{-x}. \end{aligned}$$

**(c)** 用定理 6.3，其中 $a = 10$ 和 $\dfrac{d}{dx}10^x = 10^x\ln 10 \approx 2.303 \cdot 10^x$。

**(d)** 在 $x = 1$ 处，高度为 $e$，斜率为 $e^1 = e$，因此切线方程为 $y - e = e(x - 1)$，即 $y = ex$。该切线经过原点，如图 6.1 的右图所示。

```check
same(diff(exp(3*x), x), 3*exp(3*x)); same(diff(exp(k*x), x), k*exp(k*x))
steps(diff(x**2*exp(-x), x), 2*x*exp(-x) + x**2*(-exp(-x)), (2*x - x**2)*exp(-x))
same(diff(10**x, x), 10**x*log(10)); rounds(log(10), '2.303')
same(diff(exp(x), x).subs(x, 1), E)
steps(solve(Eq(y - E, E*(x - 1)), y)[0], E*x); same((E*x).subs(x, 0), 0)
```
:::

::: pitfall
幂法则适用于幂 $x^n$，其中变量在底数中。它不适用于 $e^x$ 或 $2^x$，其中变量在指数中： $\dfrac{d}{dx}e^x$ 不等于 $xe^{x-1}$，且 $\dfrac{d}{dx}2^x$ 既不等于 $x\,2^{x-1}$ 也不等于 $2^x$。并且 $e^2 \approx 7.39$ 是一个常数，因此其导数为 0。

```check
holds(Ne(diff(exp(x), x).subs(x, 0), (x*exp(x - 1)).subs(x, 0)))
holds(Ne(diff(2**x, x).subs(x, 0), (x*2**(x - 1)).subs(x, 0))); holds(Ne(diff(2**x, x).subs(x, 0), (2**x).subs(x, 0)))
rounds(exp(2), '7.39'); same(diff(exp(2), x), 0)
```
:::

::: deeper 为何极限存在，以及通往 e 的另一条道路
**极限$m(2)$.**对于$h \ne 0$，令$q(h) = \dfrac{2^h - 1}{h}$为函数$2^x$的图像从$(0, 1)$到$(h, 2^h)$的割线斜率。函数$2^x$的图像向上弯曲（它是**凸**的），因此当$h$向右移动时，该斜率增大：$q$在0的两侧均递增，且每个满足$h < 0$的值均小于每个满足$h > 0$的值。因此，当$h$递减至0时，$q(h)$递减但始终高于$q(-1) = \tfrac12$，而一个递减且始终高于固定数的量趋近于一个极限：这是实数的基本性质，在模块14中针对序列进行了精确表述。同理，当$h$递增至0时，$q(h)$递增至一个极限，且始终低于$q(1) = 1$。这两个单侧极限相等，因为$q(-h) = 2^{-h}q(h)$和$2^{-h} \to 1$。因此$m(2)$存在，且介于$\tfrac12$和1之间；特别地，它是正数。此处省略的步骤是证明$2^x$是凸函数，这需要针对实指数进行更多推导。

**另一条路：从对数开始。** 模块 10 提供了一条路径，无需假设幂的性质；它依赖于一个定理，该定理在模块 9 中被使用但未被证明，即连续函数有积分。定义，对于 $x > 0$，

$$\ln x = \int_1^x \frac{dt}{t},$$

曲线下的面积 $y = 1/t$ 从 1 到 $x$（当 $x < 1$ 时计为负值）。微积分基本定理立即给出 $(\ln x)' = 1/x$；对数的性质由此得出，结合模块 8 的一个定理； $\ln$ 是递增的并取所有实数值，因此它有一个反函数 ${\exp}$； $e$ 是 $\exp(1)$，即从 1 到 $e$ 的面积恰好为 1 的那个数；对于 $a > 0$ 和每个实数 $x$，定义 $a^x = \exp(x\ln a)$，这也确定了无理数幂的含义。下面的定理 6.4 则给出 $\exp' = {\exp}$。这些函数与本节相同；只是证明的顺序不同。

```check
qd = lambda H: (2**H - 1)/H
same(qd(-1), Rational(1, 2)); same(qd(1), 1)
same((2**(-h) - 1)/(-h), 2**(-h)*(2**h - 1)/h)
holds(Rational(1, 2) < log(2)); holds(log(2) < 1)
same(diff(Integral(1/t, (t, 1, x)), x), 1/x); same(integrate(1/t, (t, 1, E)), 1)
```
:::

::: compute 寻找 e
Python 可以用差商估计 $a^x$ 在 0 处的斜率。对称商 $\dfrac{a^h - a^{-h}}{2h}$，即模块 4 的中心差，比 $\dfrac{a^h - 1}{h}$ 在相同 $h$ 下更准确：

```python
import math
def slope_at_0(a, h=1e-6):
    return (a**h - a**(-h))/(2*h)      # central difference at x = 0
for a in [2, 2.5, 2.7, 2.72, 2.8, 3]:
    print(f"a = {a}: slope at 0 ≈ {slope_at_0(a):.6f}")
```

```output
a = 2: slope at 0 ≈ 0.693147
a = 2.5: slope at 0 ≈ 0.916291
a = 2.7: slope at 0 ≈ 0.993252
a = 2.72: slope at 0 ≈ 1.000632
a = 2.8: slope at 0 ≈ 1.029619
a = 3: slope at 0 ≈ 1.098612
```

斜率在 2.7 和 2.72 之间穿过 1。模块 3 的二分法不断逼近交叉点，每一步都保留使斜率穿过 1 的区间一半：

```python
lo, hi = 2.0, 3.0
for step in range(30):
    mid = (lo + hi)/2
    if slope_at_0(mid) < 1:
        lo = mid
    else:
        hi = mid
print(f"e lies between {lo:.10f} and {hi:.10f}")
print(f"math.e is      {math.e:.10f}")
```

```output
e lies between 2.7182818279 and 2.7182818288
math.e is      2.7182818285
```

三十次二分将区间缩小到宽度为 $2^{-30}$，小于 $10^{-9}$，并将 $e$ 精确定位到八位小数，2.71828182。复利计算是计算机计算 $e$ 的糟糕方式：

```python
for k in [4, 8, 12, 15, 16]:
    n = 10**k
    print(f"n = 10^{k}: {(1 + 1/n)**n}")
```

```output
n = 10^4: 2.7181459268249255
n = 10^8: 2.7182817983473577
n = 10^12: 2.7185234960372378
n = 10^15: 3.035035206549262
n = 10^16: 1.0
```

直到 $n = 10^8$ 为止，计算值都在趋近 $e$。随后计算失准，当 $n = 10^{16}$ 时结果已经变为 1。计算机把 $1 + 1/n$ 舍入到大约 16 位有效数字后存储。当 $n = 10^{16}$ 时，存储值恰为 1，因而 $1^n = 1$；当 $n = 10^{15}$ 时，存储值为 $1 + 1.11 \times 10^{-15}$，其与 1 的距离比正确值大 11%，取幂后这一误差变成 $e^{1.11} \approx 3.035$。原因与模块 2 的消去误差相同，浮点数只保留大约 16 位有效数字。
:::

```check
holds(log(Rational(27, 10)) < 1); holds(log(Rational(272, 100)) > 1)
holds(Rational(1, 2**30) < Rational(1, 10**9)); holds(Rational(27182818279, 10**10) < E); holds(E < Rational(27182818288, 10**10))
holds(Rational(2**52, 10**15) > Rational(9, 2))             # 10^-15 is nearer 5 * 2^-52 than 4 * 2^-52
stored = 5*Rational(10**15, 2**52)                          # 10^15 * (5 * 2^-52)
rounds(stored, '1.11'); rounds(exp(stored), '3.035')
```

## 反函数的导数 {#inverse-functions}

由 模块 1，反函数 $f^{-1}$ 的图像 是 $f$ 在直线 $y = x$ 上的镜像。反射将切线映射为切线，因此也应告诉你 $f^{-1}$ 的斜率。在 $y = x$ 上的反射交换了两个坐标，因此交换了上升量和运行量：斜率为 $\dfrac{\text{rise}}{\text{run}} = m$ 的直线变为斜率为 $\dfrac{\text{run}}{\text{rise}} = \dfrac1m$ 的直线（图 6.2）。因此，如果 $f$ 在 $(a, b)$ 处的斜率为 $m$，则 $f^{-1}$ 在镜像点 $(b, a)$ 处的斜率应为 $1/m$。

::: figure id=fig-06-2
$y = e^x$ 和其反函数 $y = \ln x$ 是直线 $y = x$（虚线）的镜像。在 $e^x$ 上 $\big(\tfrac12, e^{1/2}\big)$ 处的切线斜率为 $e^{1/2} \approx 1.65$：横坐标变化 1，纵坐标变化 1.65。其镜像为在 $\ln x$ 上 $\big(e^{1/2}, \tfrac12\big)$ 处的切线，横坐标变化 1.65，纵坐标变化 1：斜率为 $1/e^{1/2} \approx 0.61$。
:::

```check
rounds(exp(Rational(1, 2)), '1.65'); rounds(exp(-Rational(1, 2)), '0.61')
same(diff(log(x), x).subs(x, exp(Rational(1, 2))), 1/diff(exp(x), x).subs(x, Rational(1, 2)))
```

要将这张图变为定理，你需要一个关于连续性的事实，本系列在未证明的情况下使用了这个事实。

::: note
**关于反函数的一个事实。**如果$f$在开区间$I$上连续且单射，那么$f$在$I$上严格递增或在$I$上严格递减，其值构成开区间$J$，且$f^{-1}$在$J$上连续。思路：如果$f$先升后降，模块3的介值定理会使其取到某个值两次；并且，如模块3所述，仅上升（或仅下降）的连续图像的镜像仍然是连续的。
:::

::: theorem 反函数的导数
设 $f$ 在开区间 $I$ 上连续且单射，且设 $a$ 是 $I$ 中一点，其中 $f$ 可导且导数为 $f'(a) \ne 0$。则 $f^{-1}$ 在 $b = f(a)$ 处可导，并且

$$(f^{-1})'(b) = \frac{1}{f'(a)} = \frac{1}{f'\big(f^{-1}(b)\big)}.$$
:::

::: proof
设 $J$ 是 $f$ 的值域，如上所述的事实。对于 $y \ne b$ ∈ $J$，令 $x = f^{-1}(y)$。则 $f(x) = y$，且 $x \ne a$，因为 $f^{-1}$ 是单射的。因此

$$\begin{aligned} \frac{f^{-1}(y) - f^{-1}(b)}{y - b} &= \frac{x - a}{f(x) - f(a)} \\ &= \frac{1}{\dfrac{f(x) - f(a)}{x - a}}. \end{aligned}$$

当 $y \to b$， $x = f^{-1}(y)$ 接近 $f^{-1}(b) = a$ 时，因为 $f^{-1}$ 是连续的，且 $x \ne a$。因此分母中的差商趋于 $f'(a)$，它不等于 0，根据商的极限法则，整个表达式趋于 $1/f'(a)$。
:::

```check
fF = Function('f')
same((x - a)/(fF(x) - fF(a)), 1/((fF(x) - fF(a))/(x - a)))
gG = Function('g')      # if g is the inverse of f, the chain rule on f(g(x)) = x gives g'(x) = 1/f'(g(x))
same(solve(diff(fF(gG(x)), x) - 1, Derivative(gG(x), x))[0], 1/diff(fF(u), u).subs(u, gG(x)))
yp = symbols('y', positive=True)
same(diff(x**3, x).subs(x, 0), 0); same(real_root(yp, 3)/yp, yp**Rational(-2, 3)); limit_is(yp**Rational(-2, 3), yp, 0, oo, '+')
```

假设 $f'(a) \ne 0$ 是需要的。 $f(x) = x^3$ 与 $f'(0) = 0$ 单射，且其反函数 $\sqrt[3]{x}$ 在 0 处有垂直切线：对于 $y > 0$，其差商 $\dfrac{\sqrt[3]{y} - 0}{y - 0} = y^{-2/3}$ 在 $y \to 0$ 趋于无穷大。其他假设确保 $f^{-1}$ 存在且连续。

::: tip
为了记住公式，假设 $f^{-1}$ 可导，并用链式法则对 $f\big(f^{-1}(x)\big) = x$ 两边求导：$f'\big(f^{-1}(x)\big)\cdot(f^{-1})'(x) = 1$，然后相除。这个推导假设了定理所要证明的内容，即 $f^{-1}$ 可导，因此它是一个记忆技巧，而不是证明。
:::

::: example 没有公式的反函数
在模块 1 的 [练习 1.10](module_01_ZH.html#ex-1-10) 中你已证明 $f(x) = x^3 + x$ 在 $\R$ 上严格递增，因此它有一个反函数，尽管求解 $x^3 + x = y$ 对 $x$ 很困难。找出 $(f^{-1})'(2)$ 和 $(f^{-1})'(10)$，以及 $f^{-1}$ 图像在 $(2, 1)$ 处的切线。

$f$ 是一个多项式，因此在其定义域 $\R$ 上可导，从而连续，且 $f'(x) = 3x^2 + 1 \ge 1$：永不为 0。为在 $b = 2$ 处使用定理 6.4，你需要 $a = f^{-1}(2)$，即 $x^3 + x = 2$ 的解。尝试小的整数：$x = 1$ 起作用。所以

$$(f^{-1})'(2) = \frac{1}{f'(1)} = \frac{1}{3 + 1} = \frac14.$$

同样地 $f(2) = 8 + 2 = 10$，所以 $(f^{-1})'(10) = \dfrac{1}{f'(2)} = \dfrac{1}{13}$。图像 $f^{-1}$ 在 $(2, 1)$ 处的切线斜率为 $\tfrac14$：即 $y = 1 + \tfrac14(x - 2)$，也就是 $y = \tfrac14 x + \tfrac12$。

```check
f3 = x**3 + x
same(diff(f3, x), 3*x**2 + 1); same(function_range(3*x**2 + 1, x, S.Reals), Interval(1, oo))
same([s_ for s_ in solve(f3 - 2, x) if s_.is_real], [1]); same(f3.subs(x, 2), 10)
same(1/diff(f3, x).subs(x, 1), Rational(1, 4)); same(1/diff(f3, x).subs(x, 2), Rational(1, 13))
yv = symbols('y_v')
same(idiff(yv**3 + yv - x, yv, x).subs(yv, 1), Rational(1, 4))     # x = y^3 + y, differentiated for y = f^{-1}(x)
same(expand(1 + Rational(1, 4)*(x - 2)), x/4 + Rational(1, 2))
```
:::

::: pitfall
$f^{-1}$ 在 $b$ 处的斜率是 $f$ 在镜像点 $a = f^{-1}(b)$ 处斜率的倒数，而不是在 $b$ 处。在例 6.2 中是 $(f^{-1})'(2) = \tfrac14$，而不是 $\dfrac{1}{f'(2)} = \dfrac{1}{13}$。首先找到 $a$，然后计算 $1/f'(a)$。
:::

## 对数 {#logarithms}

### ln x 的导数 {#derivative-ln}

::: theorem 对数函数的导数
对于每一个 $x > 0$，
$$\frac{d}{dx}\ln x = \frac1x,$$
并且对于每一个 $x \ne 0$，
$$\frac{d}{dx}\ln\abs{x} = \frac1x.$$
:::

::: proof
将定理 6.4 应用于 $f(x) = e^x$ 在开区间 $I = \R$ 上。它可导，因此连续，且是单射的（模块 1）；其导数 $e^x$ 永远不为 0；其值域为 $J = (0, \infty)$；其反函数为 ${\ln}$。对于 $b > 0$，令 $a = \ln b$。则

$$(\ln)'(b) = \frac{1}{f'(a)} = \frac{1}{e^{\ln b}} = \frac1b.$$

对于 $x > 0$ 和 $\ln\abs{x} = \ln x$，其导数为 $\tfrac1x$。对于 $x < 0$ 和 $\ln\abs{x} = \ln(-x)$，根据链式法则，其导数为 $\dfrac{1}{-x}\cdot(-1) = \dfrac1x$。
:::

```check
xp = symbols('x', positive=True); xn = symbols('x', negative=True)
same(diff(log(xp), xp), 1/xp); same(1/exp(log(xp)), 1/xp)
same(diff(log(-xn), xn), 1/xn); same(diff(log(Abs(xn)), xn), 1/xn); same(diff(log(Abs(xp)), xp), 1/xp)
same(diff(log(x), x).subs(x, 1), 1)
```

曲线 $\ln x$（图 6.2）在 0 附近陡峭上升，此时 $1/x$ 较大，随着 $x$ 增大，曲线逐渐趋于平缓；但其斜率 $1/x$ 保持正数，因此 $\ln x$ 不断增加，但增速越来越慢。在 $x = 1$ 处，斜率为 1，与 $e^x$ 在 0 处的斜率 1 形成镜像关系。利用链式法则，对于可导函数 $u$ 的 $x$，

$$\begin{aligned} \frac{d}{dx}\ln u &= \frac{u'}{u} \quad \text{where } u > 0, \\ \frac{d}{dx}\ln\abs{u} &= \frac{u'}{u} \quad \text{where } u \ne 0. \end{aligned}$$

```check
uF = Function('u')
same(diff(log(uF(x)), x), diff(uF(x), x)/uF(x)); same(diff(log(-uF(x)), x), diff(uF(x), x)/uF(x))
```

::: example 使用对数求导的导数
求导（a） $\ln(x^2 + 1)$，（b） $\ln{\abs{\cos x}}$，其中 $\cos x \ne 0$，以及（c） $\ln\dfrac{x^3}{\sqrt{x^2 + 1}}$，对于 $x > 0$。

**(a)** 此时 $u = x^2 + 1 > 0$，因此 $\dfrac{d}{dx}\ln(x^2 + 1) = \dfrac{2x}{x^2 + 1}$。

**(b)** 此时 $u = \cos x$，因此 $\dfrac{d}{dx}\ln\abs{\cos x} = \dfrac{-\sin x}{\cos x} = -\tan x$。

**(c)** 首先使用对数法则：它们将商和幂转化为和。对于 $x > 0$，

$$\ln\frac{x^3}{\sqrt{x^2 + 1}} = 3\ln x - \tfrac12\ln(x^2 + 1),$$

因此导数为

$$\frac3x - \frac12\cdot\frac{2x}{x^2 + 1} = \frac3x - \frac{x}{x^2 + 1}.$$

```check
same(diff(log(x**2 + 1), x), 2*x/(x**2 + 1))
same(diff(log(cos(x)), x), -sin(x)/cos(x)); same(diff(log(-cos(x)), x), -tan(x))
same(expand_log(log(xp**3/sqrt(xp**2 + 1))), 3*log(xp) - log(xp**2 + 1)/2)
steps(diff(log(xp**3/sqrt(xp**2 + 1)), xp), 3/xp - Rational(1, 2)*2*xp/(xp**2 + 1), 3/xp - xp/(xp**2 + 1))
```
:::

::: pitfall
$\ln u$ 的导数是 $\dfrac{u'}{u}$，不是 $\dfrac1u$： $\dfrac{d}{dx}\ln(x^2 + 1)$ 不等于 $\dfrac{1}{x^2 + 1}$。而且 $\dfrac{d}{dx}\ln(5x) = \dfrac{5}{5x} = \dfrac1x$，与 $\ln x$ 的导数相同。这并非偶然： $\ln(5x) = \ln 5 + \ln x$，因此这两个函数相差一个常数。

```check
holds(Ne(diff(log(x**2 + 1), x).subs(x, 2), (1/(x**2 + 1)).subs(x, 2)))
steps(diff(log(5*xp), xp), 5/(5*xp), 1/xp); same(expand_log(log(5*xp)), log(5) + log(xp))
```
:::

### 其他底数 {#other-bases}

对于底数 $a > 0$ 有 $a \ne 1$， $\log_a x = \dfrac{\ln x}{\ln a}$（模 1），且 $\ln a$ 是一个常数，因此对于 $x > 0$

$$\frac{d}{dx}\log_a x = \frac{1}{x\ln a}.$$

例如 $\dfrac{d}{dx}\log_{10} x = \dfrac{1}{x\ln 10} \approx \dfrac{0.4343}{x}$ 和 $\dfrac{d}{dx}\log_2 x = \dfrac{1}{x\ln 2} \approx \dfrac{1.4427}{x}$。只有自然对数具有因子 1。这就是为什么微积分使用 ${\ln}$，正如它使用 $e^x$：公式 $\dfrac{d}{dx}a^x = a^x\ln a$ 和 $\dfrac{d}{dx}\log_a x = \dfrac{1}{x\ln a}$ 在 $a = e$ 时恰好失去因子 $\ln a$。

```check
same(diff(log(xp, ap), xp), 1/(xp*log(ap)))
rounds(1/log(10), '0.4343'); rounds(1/log(2), '1.4427')
same(diff(log(xp, E), xp), 1/xp)
```

### 两条路径交汇 {#two-routes}

现在可以解释复利表。 $\ln$ 在 1 处的导数是 $\tfrac11 = 1$，且 $\ln 1 = 0$，因此

$$\lim_{h\to0}\frac{\ln(1 + h)}{h} = \lim_{h\to0}\frac{\ln(1 + h) - \ln 1}{h} = 1.$$

```check
limit_is(log(1 + h)/h, h, 0, 1); same(log(1), 0)
```

::: theorem $e$ 作为极限
对于每一个实数 $x$，

$$\lim_{n\to\infty}\Big(1 + \frac{x}{n}\Big)^n = e^x,$$

特别地

$$\lim_{n\to\infty}\Big(1 + \frac1n\Big)^n = e.$$
:::

::: proof
对于 $x = 0$ 两边都是 1。令 $x \ne 0$，并取 $n > {\abs{x}}$，使得 $1 + x/n > 0$。每一个正数 $p$ 都是 $e^{\ln p}$，因此 $p^n = e^{n\ln p}$，并

$$\Big(1 + \frac{x}{n}\Big)^n = e^{\,n\ln(1 + x/n)}.$$

写作 $h = x/n$，使得 $n = x/h$。然后

$$n\ln\Big(1 + \frac{x}{n}\Big) = x\cdot\frac{\ln(1 + h)}{h}.$$

当 $n \to \infty$ 趋近于 $h \to 0$ 时，取 $h \ne 0$，因此这个趋于 $x \cdot 1 = x$。最后， $e^u$ 是连续的（它是可导的，且模块 4 显示可导函数是连续的），因此 $e^{\,n\ln(1 + x/n)}$ 趋近于 $e^x$。
:::

```check
limit_is((1 + x/n)**n, n, oo, exp(x)); limit_is((1 + 1/n)**n, n, oo, E)
np_ = symbols('n', positive=True)
same(exp(np_*log(1 + xp/np_)), (1 + xp/np_)**np_)
same((x*log(1 + h)/h).subs(h, x/n), n*log(1 + x/n))
limit_is(n*log(1 + x/n), n, oo, x)
```

所以两条路径都得到同一个数：复利的极限是那个指数函数在 0 处导数为 1 的底数。

::: example 连续复利
假设你投资 1000 英镑，年利率为 5%。比较一年后利息按年、按季度、按月、按日以及连续复利计算时的余额，并找出在连续复利下资金翻倍所需的时间。

每年加利息 $n$ 次，每次加息将余额乘以 $1 + \dfrac{0.05}{n}$，因此一年后的余额是 $1000\Big(1 + \dfrac{0.05}{n}\Big)^n$ 英镑：

```valuetable
n = 1, 4, 12, 365
$1000\Big(1 + \dfrac{0.05}{n}\Big)^n$ = 1000*(1 + 1/(20*n))**n
decimals = 2
---
n | 1000\Big(1 + \dfrac{0.05}{n}\Big)^n
1 | 1050.00
4 | 1050.95
12 | 1051.16
365 | 1051.27
```

根据定理 6.6 与 $x = 0.05$，连续复利计算后一年得到 $1000e^{0.05} \approx 1051.27$ 英镑：与每日复利计算结果相同，精确到便士。在 $t$ 年内，每年复利 $n$ 次，账户余额为

$$\begin{aligned} &1000\Big(1 + \frac{0.05}{n}\Big)^{nt} \\ &\quad= 1000\Big[\Big(1 + \frac{0.05}{n}\Big)^n\Big]^t, \end{aligned}$$

当 $n \to \infty$ 趋近于 $1000\big(e^{0.05}\big)^t = 1000e^{0.05t}$ 时，它在 $e^{0.05t} = 2$ 时加倍，即当 $0.05t = \ln 2$ 时：

$$t = \frac{\ln 2}{0.05} \approx 13.86 \text{ years}.$$

```check
rounds(1000*exp(Rational(5, 100)), '1051.27'); rounds(1000*(1 + Rational(5, 100)/365)**365, '1051.27')
tp = symbols('t', positive=True)
same(limit(1000*(1 + Rational(5, 100)/n)**(n*tp), n, oo), 1000*exp(Rational(5, 100)*tp))
same(solve(exp(Rational(5, 100)*tp) - 2, tp), [log(2)/Rational(5, 100)]); rounds(log(2)/Rational(5, 100), '13.86')
```
:::

## 隐函数求导 {#implicit}

圆 $x^2 + y^2 = 25$，以原点为中心，半径为 5，不是函数的图像：它不通过模块 1 中的垂直线测试。但在点 $(3, 4)$ 附近，它是函数图像：圆的上半部分是 $y = \sqrt{25 - x^2}$ 的图像，链式法则给出其斜率，

$$\frac{dy}{dx} = \frac{-2x}{2\sqrt{25 - x^2}} = -\frac{x}{\sqrt{25 - x^2}},$$

在 $x = 3$ 处的斜率为 $-\tfrac{3}{\sqrt{16}} = -\tfrac34$。

不必解出 $y$，也可以求这个斜率。在 $(3, 4)$ 附近，把 $y$ 看作 $x$ 的函数 $y = y(x)$，其图像就是圆上的这一段。这样，对每个靠近 3 的 $x$ 都有 $x^2 + y(x)^2 = 25$，两边是 $x$ 的同一个函数，导数相同。两边对 $x$ 求导，对 $y^2$ 使用链式法则：

$$2x + 2y\,\frac{dy}{dx} = 0, \quad\text{so}\quad \frac{dy}{dx} = -\frac{x}{y} \quad (y \ne 0).$$

在$(3, 4)$处这再次给出$-\tfrac34$。相同的公式在$y \ne 0$的圆周上的每一点都适用：在$(3, -4)$处，在下半部分，斜率是$+\tfrac34$。这是**隐函数微分**：方程将$y$定义为仅*隐式*依赖于$x$的函数，你直接对现有方程进行微分。答案具有几何意义（图6.3，左侧）：从原点到$(x, y)$的半径具有斜率$y/x$（当$x \ne 0$时），且两个斜率的乘积是$(y/x)(-x/y) = -1$，因此切线垂直于半径，正如中学几何所说的那样。

```check
same(diff(sqrt(25 - x**2), x), -x/sqrt(25 - x**2)); same((-x/sqrt(25 - x**2)).subs(x, 3), -3/sqrt(16)); same(-3/sqrt(16), -Rational(3, 4))
Yf = Function('Y')
same(diff(x**2 + Yf(x)**2, x), 2*x + 2*Yf(x)*diff(Yf(x), x))
same(idiff(x**2 + y**2 - 25, y, x), -x/y)
same((-x/y).subs({x: 3, y: 4}), -Rational(3, 4)); same((-x/y).subs({x: 3, y: -4}), Rational(3, 4))
same((y/x)*(-x/y), -1); same(3**2 + 4**2, 25)
```

::: figure id=fig-06-3
左：圆 $x^2 + y^2 = 25$ 及其在 $(3, 4)$ 处的切线，该切线垂直于半径。右：笛卡尔叶线 $x^3 + y^3 = 6xy$，其在 $(3, 3)$ 处的切线斜率为 $-1$，以及在环形顶端的水平切线 $\big(2^{4/3}, 2^{5/3}\big) \approx (2.52, 3.17)$。在原点处曲线自交，没有唯一的切线。其两个分支趋近于虚线 $x + y = -2$。
:::

```check
tq = symbols('t_q')
fxq, fyq = 6*tq/(1 + tq**3), 6*tq**2/(1 + tq**3)           # a parametrisation of the folium
same(fxq**3 + fyq**3, 6*fxq*fyq); same((fxq + fyq).subs(tq, 1), 6); same((fxq).subs(tq, 1), 3)
limit_is(fxq + fyq, tq, -1, -2); limit_is(fxq, tq, -1, -oo, '+'); limit_is(fxq, tq, -1, oo, '-')
```

::: keyidea
**隐函数求导。** 为了在由 $x$ 和 $y$ 给出的方程所定义的曲线上求 $\dfrac{dy}{dx}$：

1. 对两边关于 $x$ 求导，将 $y$ 视为 $x$ 的函数。每个包含 $y$ 的项都需要使用链式法则，如 $\dfrac{d}{dx}y^n = ny^{n-1}\dfrac{dy}{dx}$ 所示，乘积如 $xy$ 需要使用乘积法则。
2. 将含有 $\dfrac{dy}{dx}$ 的项移到一边，并将其提取出来。
3. 除以其系数（该系数不为 0）。答案通常包含 $x$ 和 $y$：在曲线上的某一点进行计算。
:::

该方法假设在该点附近，方程将 $y$ 定义为 $x$ 的可导函数。多元微积分中的一个定理——隐函数定理，保证了在曲线上某一点处，当第 3 步中 $dy/dx$ 的系数不为 0 时，该点处的函数可导，前提是方程由在该点附近具有连续导数的函数构成，如本模块中的方程在其使用点附近的情况。本系列不证明该定理；模块 17 中对其作了精确陈述。当系数为 0 时，需更仔细地分析：圆在 $(\pm5, 0)$ 处有垂直切线，其中 $y = 0$。

::: example 笛卡尔叶线
曲线 $x^3 + y^3 = 6xy$（图 6.3，右）称为笛卡尔叶线（拉丁语为“叶”）。证明 $(3, 3)$ 在其上，求出该点的切线，并找出切线水平的点。

在 $(3, 3)$ 处， $x^3 + y^3 = 27 + 27 = 54$ 和 $6xy = 6 \cdot 3 \cdot 3 = 54$，因此该点在曲线上。对两边进行求导，对 $y^3$ 使用链式法则，对 $6xy$ 使用乘积法则：

$$3x^2 + 3y^2\,y' = 6y + 6x\,y'.$$

收集左边带有 $y'$ 的项并提取公因式，然后除以 $3y^2 - 6x = 3\big(y^2 - 2x\big)$（当它不为 0 时）：

$$\begin{aligned} \big(3y^2 - 6x\big)\,y' &= 6y - 3x^2, \\ y' &= \frac{2y - x^2}{y^2 - 2x} \quad \big(y^2 \ne 2x\big). \end{aligned}$$

在 $(3, 3)$、$y' = \dfrac{6 - 9}{9 - 6} = -1$ 处，切线为 $y - 3 = -(x - 3)$，即 $y = 6 - x$。

切线水平处为 $y' = 0$：此时分子 $2y - x^2$ 为 0 而分母不为 0。将 $y = x^2/2$ 代入曲线方程，两边减去 $x^3$，再乘以 8：

$$\begin{aligned} x^3 + \frac{x^6}{8} &= 6x\cdot\frac{x^2}{2} = 3x^3, \\ x^6 &= 16x^3, \\ x^3\big(x^3 - 16\big) &= 0. \end{aligned}$$

根 $x = 0$ 给出原点，此时分母 $y^2 - 2x$ 也为 0，因此公式在该点无意义：曲线在此处自交。另一个根 $x^3 = 16$ 给出 $x = 16^{1/3} = 2^{4/3} \approx 2.520$ 和 $y = \tfrac12 x^2 = \tfrac12 \cdot 2^{8/3} = 2^{5/3} \approx 3.175$。在该点分母为 $2^{10/3} - 2 \cdot 2^{4/3} = 2^{10/3} - 2^{7/3} = 2^{7/3}$，不为 0。因此，曲线在恰好一点 $\big(2^{4/3}, 2^{5/3}\big)$（即环的顶部）处切线水平。交换 $x$ 和 $y$ 不改变方程，因此镜像点 $\big(2^{5/3}, 2^{4/3}\big)$ 处切线为垂直。

```check
fol = x**3 + y**3 - 6*x*y
same(fol.subs({x: 3, y: 3}), 0)
same(diff(x**3 + Yf(x)**3, x), 3*x**2 + 3*Yf(x)**2*diff(Yf(x), x)); same(diff(6*x*Yf(x), x), 6*Yf(x) + 6*x*diff(Yf(x), x))
yd = symbols('yd')
same(solve(Eq((3*y**2 - 6*x)*yd, 6*y - 3*x**2), yd)[0], (2*y - x**2)/(y**2 - 2*x))
same(idiff(fol, y, x), (2*y - x**2)/(y**2 - 2*x))
same(((2*y - x**2)/(y**2 - 2*x)).subs({x: 3, y: 3}), -1); same(expand(3 - (x - 3)), 6 - x)
same(3*y**2 - 6*x, 3*(y**2 - 2*x))
same(expand(x**3 + (x**2/2)**3 - 6*x*(x**2/2)), x**6/8 - 2*x**3); same(expand(8*(x**6/8 - 2*x**3)), x**6 - 16*x**3)
same(factor(x**6 - 16*x**3), x**3*(x**3 - 16))
x0 = Integer(2)**Rational(4, 3); y0 = Integer(2)**Rational(5, 3)
same(Integer(16)**Rational(1, 3), x0); same(x0**2/2, y0); rounds(x0, '2.520'); rounds(y0, '3.175'); rounds(x0, '2.52'); rounds(y0, '3.17')
steps(y0**2 - 2*x0, Integer(2)**Rational(10, 3) - Integer(2)**Rational(7, 3), Integer(2)**Rational(7, 3))
same(fol.subs({x: x0, y: y0}), 0); same(fol.subs({x: y0, y: x0}), 0)
same_set([s_ for s_ in solve(x**3*(x**3 - 16), x) if s_.is_real], [0, x0])
```
:::

::: pitfall
当你对一个方程进行隐式求导时，$y$ 是 $x$ 的函数：即 $\dfrac{d}{dx}y^2 = 2y\,y'$，而不是 $2y$，并且 $\dfrac{d}{dx}(xy) = y + x\,y'$ 是通过乘积法则求导，而不是 $y'$。对两边同时求导：常数 25 的导数是 0，而不是 25。

```check
same(diff(Yf(x)**2, x), 2*Yf(x)*diff(Yf(x), x)); same(diff(x*Yf(x), x), Yf(x) + x*diff(Yf(x), x)); same(diff(25, x), 0)
```
:::

## 反三角函数 {#inverse-trig}

要解 $\sin\theta = \tfrac12$ 中的角度，你需要正弦函数的反函数。但正弦函数不是单射的：即 $\sin\theta = \tfrac12$ 对应 $\theta = \pi/6$、$5\pi/6$、$13\pi/6$ 和无数多个角度。与模块 1 中的 $x^2$ 类似，需要将定义域限制在一个函数是单射的区间上，并且每个值只取一次。对于正弦函数，标准选择是 $[-\pi/2, \pi/2]$，其中它从 $-1$ 增加到 1；对于余弦函数，标准选择是 $[0, \pi]$，其中它从 1 减少到 $-1$；对于正切函数，标准选择是 $(-\pi/2, \pi/2)$，其中它通过每一个实数值（图 6.4）。

```check
same([sin(pi/6), sin(5*pi/6), sin(13*pi/6)], [Rational(1, 2)]*3)
same(sin(-pi/2), -1); same(sin(pi/2), 1); same(cos(0), 1); same(cos(pi), -1)
same(function_range(tan(x), x, Interval.open(-pi/2, pi/2)), S.Reals)
```

::: definition 反三角函数
- 对于 $-1 \le x \le 1$，$\arcsin x$ 是 $y$ 在 $[-\pi/2, \pi/2]$ 中的 $\sin y = x$。
- 对于 $-1 \le x \le 1$，$\arccos x$ 是 $y$ 在 $[0, \pi]$ 中的 $\cos y = x$。
- 对于每一个实数 $x$， $\arctan x$ 是 $(-\pi/2, \pi/2)$ 中的数 $y$，使得 $\tan y = x$。

它们读作“x 的反三角函数”，即“反正弦函数”、“反余弦函数”和“反正切函数”。它们的定义域分别是 $[-1, 1]$、$[-1, 1]$ 和 $\R$，它们的值域分别是 $[-\pi/2, \pi/2]$、$[0, \pi]$ 和 $(-\pi/2, \pi/2)$。
:::

名字说明了 $\arcsin x$ 是什么：弧度，即正弦值为 $x$ 的角。由于 $\arcsin$ 撤销了受限的正弦函数，$\sin(\arcsin x) = x$ 对于每个 $x$ 在 $[-1, 1]$ 中都有定义；但 $\arcsin(\sin\theta) = \theta$ 仅对 $\theta$ 在 $[-\pi/2, \pi/2]$ 中有效（例6.6）。其他两个函数也是如此，各自对应自己的区间。

```check
same(function_range(asin(x), x, Interval(-1, 1)), Interval(-pi/2, pi/2)); same(function_range(acos(x), x, Interval(-1, 1)), Interval(0, pi))
limit_is(atan(x), x, oo, pi/2); limit_is(atan(x), x, -oo, -pi/2)
for v_ in (Rational(-9, 10), Rational(-1, 2), 0, Rational(3, 10), 1):
    same(sin(asin(v_)), v_); same(cos(acos(v_)), v_); same(tan(atan(4*v_)), 4*v_)
```

::: figure id=fig-06-4
反三角函数。在每个图中，被反函数（橙色）和其反函数（蓝色）是直线 $y = x$（虚线）的镜像。左： $\sin x$ 在 $[-\pi/2, \pi/2]$ 和 $\arcsin x$ 上。中间： $\cos x$ 在 $[0, \pi]$ 和 $\arccos x$ 上。右： $\tan x$ 在 $(-\pi/2, \pi/2)$ 和 $\arctan x$ 上，其图像有水平渐近线 $y = \pm\pi/2$。
:::

::: pitfall
许多教材和计算器用 $\sin^{-1}x$ 表示 $\arcsin x$，也使用 $\cos^{-1}x$ 和 $\tan^{-1}x$。这里的 $-1$ 表示反函数，类似于 $f^{-1}$。它不表示指数，所以 $\sin^{-1}x$ 不等于 $(\sin x)^{-1} = \dfrac{1}{\sin x}$。这种记法容易和确实表示 $(\sin x)^2$ 的 $\sin^2 x$ 混淆。对于 $x = \tfrac12$，有 $\arcsin\tfrac12 = \tfrac{\pi}{6} \approx 0.524$，而 $\dfrac{1}{\sin(1/2)} \approx 2.086$。本系列记为 ${\arcsin}$。

```check
same(asin(Rational(1, 2)), pi/6); rounds(pi/6, '0.524'); rounds(1/sin(Rational(1, 2)), '2.086')
```
:::

::: example 反三角函数的值
求（a） $\arcsin\tfrac12$，（b） $\arccos\big(-\tfrac12\big)$，（c） $\arctan(-1)$ 和（d） $\arcsin\big(\sin\tfrac{3\pi}{4}\big)$。

**(a)** 以 $[-\pi/2, \pi/2]$ 为角，其正弦为 $\tfrac12$ 的角是 $\pi/6$ （模块 1 的表）： $\arcsin\tfrac12 = \tfrac{\pi}{6}$.

**(b)** $\cos\tfrac{\pi}{3} = \tfrac12$ 和 $\cos(\pi - \theta) = -\cos\theta$，因此 $\cos\tfrac{2\pi}{3} = -\tfrac12$；且 $\tfrac{2\pi}{3}$ 在 $[0, \pi]$ 中。因此 $\arccos\big(-\tfrac12\big) = \tfrac{2\pi}{3}$.

**(c)** $\tan\big(-\tfrac{\pi}{4}\big) = -\tan\tfrac{\pi}{4} = -1$，且 $-\tfrac{\pi}{4}$ 在 $(-\pi/2, \pi/2)$ 中： $\arctan(-1) = -\tfrac{\pi}{4}$.

**(d)** $\sin\tfrac{3\pi}{4} = \tfrac{\sqrt2}{2}$，因此 $\arcsin\big(\sin\tfrac{3\pi}{4}\big) = \arcsin\tfrac{\sqrt2}{2} = \tfrac{\pi}{4}$，不是 $\tfrac{3\pi}{4}$： $\arcsin$ 始终返回一个在 $[-\pi/2, \pi/2]$ 中的角，而 $\tfrac{3\pi}{4}$ 不是其中之一。

```check
same(asin(Rational(1, 2)), pi/6); same(sin(pi/6), Rational(1, 2))
same(cos(pi/3), Rational(1, 2)); same(cos(2*pi/3), -Rational(1, 2)); same(acos(-Rational(1, 2)), 2*pi/3)
same(tan(-pi/4), -1); same(atan(-1), -pi/4)
same(sin(3*pi/4), sqrt(2)/2); same(asin(sin(3*pi/4)), pi/4); holds(3*pi/4 > pi/2)
```
:::

::: theorem 反三角函数的导数
$$\begin{aligned} \frac{d}{dx}\arcsin x &= \frac{1}{\sqrt{1 - x^2}}, \\ \frac{d}{dx}\arccos x &= -\frac{1}{\sqrt{1 - x^2}}, \\ \frac{d}{dx}\arctan x &= \frac{1}{1 + x^2}, \end{aligned}$$

前两个用于 $-1 < x < 1$，第三个用于每个实数 $x$.
:::

::: proof
正弦函数是可导的，因此连续，并且在开区间 $(-\pi/2, \pi/2)$ 上是单射的，其导数在该区间为 $\cos y > 0$，其值域为 $(-1, 1)$。根据定理 6.4， $\arcsin$ 在 $(-1, 1)$ 中每个 $x$ 处均可导，并且导数为 $y = \arcsin x$。

$$\frac{d}{dx}\arcsin x = \frac{1}{\cos y}.$$

用 $x$ 表示 $\cos^2 y = 1 - \sin^2 y = 1 - x^2$ 和 $\cos y > 0$，因为 $y$ 在 $(-\pi/2, \pi/2)$ 中，所以 $\cos y$ 是正平方根，即 $\sqrt{1 - x^2}$。

对于 ${\arccos}$，用 $(0, \pi)$ 的余弦，导数为 $-\sin y < 0$；在那里 $\sin y > 0$，所以 $\sin y = \sqrt{1 - \cos^2 y} = \sqrt{1 - x^2}$ 和 $(\arccos x)' = -1/\sqrt{1 - x^2}$。对于 ${\arctan}$，用 $(-\pi/2, \pi/2)$ 的正切，导数为 $\sec^2 y$（模块 5）。将 $\cos^2 y + \sin^2 y = 1$ 除以 $\cos^2 y$ 得到 $\sec^2 y = 1 + \tan^2 y = 1 + x^2$，因此 $(\arctan x)' = 1/(1 + x^2)$。
:::

```check
same(diff(asin(x), x), 1/sqrt(1 - x**2)); same(diff(acos(x), x), -1/sqrt(1 - x**2)); same(diff(atan(x), x), 1/(1 + x**2))
same(1/cos(asin(x)), 1/sqrt(1 - x**2)); same(-1/sin(acos(x)), -1/sqrt(1 - x**2))
same(1/sec(atan(x))**2, 1/(1 + x**2)); same(sec(y)**2, 1 + tan(y)**2); same(diff(tan(y), y), sec(y)**2)
```

在$x = \pm1$处定理6.4不适用：正弦函数在$\pm\pi/2$、$\cos(\pm\pi/2)$处的导数为0，余弦函数在0和$\pi$处的导数也为0。$\arcsin$和$\arccos$的图像在这些点处有垂直切线（图6.4），且当$x$趋近于$\pm1$时$1/\sqrt{1 - x^2}$无界增长。$\arcsin$和$\arccos$的导数之和为0，因为对于$[-1, 1]$中的每个$x$都有$\arcsin x + \arccos x = \pi/2$：若$y = \arcsin x$，则由加法公式知$\pi/2 - y$位于$[0, \pi]$和$\cos(\pi/2 - y) = \sin y = x$中，故$\arccos x = \pi/2 - y$。

```check
same(cos(pi/2), 0); same(cos(-pi/2), 0); same(diff(cos(x), x).subs(x, 0), 0); same(diff(cos(x), x).subs(x, pi), 0)
limit_is(1/sqrt(1 - x**2), x, 1, oo, '-'); limit_is(1/sqrt(1 - x**2), x, -1, oo, '+')
limit_is(diff(asin(x), x), x, 1, oo, '-'); limit_is(diff(asin(x), x), x, -1, oo, '+'); limit_is(diff(acos(x), x), x, 1, -oo, '-')
same(expand_trig(cos(pi/2 - y)), sin(y)); same(diff(asin(x) + acos(x), x), 0)
for v_ in (-1, Rational(-1, 2), 0, Rational(1, 2), sqrt(3)/2, 1):
    same(asin(v_) + acos(v_), pi/2)
```

::: example 升起气球的角度
一个气球从你所在水平地面上某点垂直上升，该点距离你 100 米。当气球上升到 $h$ 米时，你观察到它的仰角为 $\theta = \arctan\dfrac{h}{100}$ 弧度。当 $h = 0$ 和 $h = 100$ 时， $\theta$ 随 $h$ 变化多快？

由链式法则，内函数为 $h/100$，

$$\begin{aligned} \frac{d\theta}{dh} &= \frac{1}{1 + (h/100)^2}\cdot\frac{1}{100} \\ &= \frac{100}{100^2 + h^2}, \end{aligned}$$

在将分子和分母同时乘以 $100^2$ 之后。在 $h = 0$ 处，其值为 $\dfrac{100}{10{,}000} = 0.01$ 弧度每米。在 $h = 100$ 处，其中 $\theta = \arctan 1 = \pi/4$，其值为 $\dfrac{100}{20{,}000} = 0.005$ 弧度每米，约为 $0.29^\circ$ 弧度每米。每米高度变化的角度随着气球上升而减小。模块 7 引入时间，要求计算角度每秒的变化率。

```check
Hh = symbols('H', nonnegative=True)
th_ = atan(Hh/100)
steps(diff(th_, Hh), 1/(1 + (Hh/100)**2)*Rational(1, 100), 100/(100**2 + Hh**2))
same((100/(100**2 + Hh**2)).subs(Hh, 0), Rational(1, 100)); same((100/(100**2 + Hh**2)).subs(Hh, 100), Rational(5, 1000))
same(th_.subs(Hh, 100), pi/4); rounds(Rational(5, 1000)*180/pi, '0.29')
```
:::

::: note
三个更多的反函数 ${\arccot}$、$\arcsec$ 和 ${\arccsc}$ 使用较少，不同书籍对其定义域意见不一。正割函数的值是所有 $x$ 且 $\abs{x} \ge 1$ 的数。对于这样的 $x$，该级数将 $\arcsec x$（读作“x 的反正割”）定义为 $y$，即 $[0, \pi/2) \cup (\pi/2, \pi]$ 中满足 $\sec y = x$ 的角，即 $\arcsec x = \arccos(1/x)$。对于 $\abs{x} > 1$，链式法则则给出

$$\begin{aligned} &\frac{d}{dx}\arcsec x \\ &\quad= -\frac{1}{\sqrt{1 - 1/x^2}}\cdot\Big(-\frac{1}{x^2}\Big) \\ &\quad= \frac{1}{x^2\sqrt{1 - 1/x^2}} = \frac{1}{\abs{x}\sqrt{x^2 - 1}}, \end{aligned}$$

因为 $x^2 = \abs{x}\sqrt{x^2}$ (模块 1) 和 $\sqrt{x^2}\sqrt{1 - 1/x^2} = \sqrt{x^2 - 1}$。绝对值起作用： $\arcsec$ 在其定义域的两个部分上都是递增的，因此对于 $x < -1$ 也是如此，其斜率为正。其他书籍选择范围 $[0, \pi/2) \cup [\pi, 3\pi/2)$，然后导数是 $\dfrac{1}{x\sqrt{x^2 - 1}}$，对于 $x < -1$ 为负。当你在别处遇到这些函数时，请检查该书使用的范围。
:::

```check
xm = symbols('x', negative=True); xq_ = symbols('x', positive=True)
for v_ in (Integer(-3), Integer(-1), Integer(1), Rational(5, 2)):
    same(sec(acos(1/v_)), v_)                                    # arccos(1/x) is an angle whose secant is x
holds(acos(-Rational(1, 3)) > pi/2); same(acos(-1), pi); same(acos(1), 0)
for X_ in (xm, xq_):
    steps(diff(acos(1/X_), X_), -1/sqrt(1 - 1/X_**2)*(-1/X_**2), 1/(X_**2*sqrt(1 - 1/X_**2)), 1/(Abs(X_)*sqrt(X_**2 - 1)))
    same(X_**2, Abs(X_)*sqrt(X_**2)); same(sqrt(X_**2)*sqrt(1 - 1/X_**2), sqrt(X_**2 - 1))
holds((1/(Abs(xm)*sqrt(xm**2 - 1))).subs(xm, -2) > 0)            # for x < -1 the two choices give derivatives of opposite signs
same(diff(2*pi - acos(1/xm), xm), 1/(xm*sqrt(xm**2 - 1))); holds((1/(xm*sqrt(xm**2 - 1))).subs(xm, -2) < 0)
same((2*pi - acos(1/xm)).subs(xm, -1), pi); same(sec(2*pi - acos(-Rational(1, 3))), -3)
```

## 对数求导法 {#log-differentiation}

### 实数指数的幂法则 {#real-powers}

模块 4 和 5 证明了 $\dfrac{d}{dx}x^n = nx^{n-1}$ 对于每一个整数 $n$，正、负或零都成立。使用 $e^x$ 和 $\ln x$，该法则可扩展到每一个实数指数。

::: theorem 实数指数的幂法则
对于每一个实数 $r$ 和每一个 $x > 0$，
$$\frac{d}{dx}x^r = r\,x^{r-1}.$$
:::

::: proof
对于 $x > 0$， $x = e^{\ln x}$，因此根据法则 $(a^u)^v = a^{uv}$， $x^r = e^{r\ln x}$。根据链式法则和定理 6.5，

$$\frac{d}{dx}x^r = e^{r\ln x}\cdot\frac{r}{x} = x^r\cdot\frac{r}{x} = r\,x^{r-1}.$$
:::

```check
rr = symbols('r', real=True)
same(exp(rr*log(xp)), xp**rr)
steps(diff(exp(rr*log(xp)), xp), exp(rr*log(xp))*rr/xp, xp**rr*rr/xp, rr*xp**(rr - 1))
```

所以 $\dfrac{d}{dx}\sqrt{x} = \dfrac{d}{dx}x^{1/2} = \dfrac{1}{2}x^{-1/2} = \dfrac{1}{2\sqrt x}$，且 $\dfrac{d}{dx}x^{\sqrt2} = \sqrt2\,x^{\sqrt2 - 1}$。在 $x^r$ 也对负数 $x$ 有定义的情况下，如 $x^{1/3} = \sqrt[3]{x}$ 所示，同样的公式也适用于那里：对于 $x < 0$，写成 $\sqrt[3]{x} = -\sqrt[3]{-x}$ 并使用链式法则。

```check
same(diff(sqrt(xp), xp), 1/(2*sqrt(xp))); same(diff(xp**sqrt(2), xp), sqrt(2)*xp**(sqrt(2) - 1))
same(real_root(xn, 3), -(-xn)**Rational(1, 3))
same(diff(-(-xn)**Rational(1, 3), xn), Rational(1, 3)*real_root(xn, 3)**(-2))     # (1/3) x^(-2/3) for x < 0
```

四个函数看起来相似：

| 函数 | 什么是 | 导数 |
|---|---|---|
| $e^2$ | 常数 | $0$ |
| $x^e$ | 幂函数：变量底数，常数指数 | $e\,x^{e-1}$ |
| $e^x$ | 指数函数：常数底数，变量指数 | $e^x$ |
| $x^x$ | 变量底数和变量指数 | 例6.8 |

```check
same(diff(exp(2), x), 0); same(diff(xp**E, xp), E*xp**(E - 1)); same(diff(exp(x), x), exp(x))
```

对于$x^x$，既不适用幂函数法则，也不适用指数函数法则。取对数可以将指数转化为因子。

::: example $x^x$的导数
对$y = x^x$关于$x > 0$求导，并找出其切线水平的位置。

由于 $y > 0$，你可以对两边取 $\ln$：$\ln y = \ln\big(x^x\big) = x\ln x$。函数 $y$ 是可导的，因为 $x^x = e^{x\ln x}$，如定理 6.8 的证明所示。因此，你可以对两边关于 $x$ 求导：左边使用链式法则和定理 6.5，如隐函数求导；右边使用乘积法则：

$$\frac{y'}{y} = 1\cdot\ln x + x\cdot\frac1x = \ln x + 1.$$

乘以$y = x^x$：

$$\frac{d}{dx}x^x = x^x(\ln x + 1).$$

因子$x^x$永远不会为0，因此切线水平的位置恰好在$\ln x = -1$：即在$x = e^{-1} = 1/e \approx 0.368$，其中$y = (1/e)^{1/e} = e^{-1/e} \approx 0.692$。

```check
same(expand_log(log(xp**xp)), xp*log(xp)); same(exp(xp*log(xp)), xp**xp); same(diff(xp*log(xp), xp), log(xp) + 1)
same(diff(xp**xp, xp), xp**xp*(log(xp) + 1))
same(solve(log(xp) + 1, xp), [exp(-1)]); rounds(exp(-1), '0.368')
same((1/E)**(1/E), exp(-1/E)); rounds(exp(-1/E), '0.692')
```
:::

::: keyidea
**对数微分法。**要对由乘积、商和幂构成的函数$y$求导，且变量可能出现在指数上：先取$\ln{\abs{y}}$，利用对数法则展开，然后求导（左侧由定理6.5给出$y'/y$），再乘以$y$。只要$y \ne 0$以及构成$y$的各部分可导，该方法即适用；若$y > 0$成立，则可用$\ln y$代替$\ln{\abs{y}}$。
:::

::: example 乘积与商
求 $y'(1)$ 的导数

$$y = \frac{x^2(x + 1)^3}{\sqrt{x^2 + 3}}, \quad x > 0.$$

当 $x > 0$ 的每个因子都是正数时，所以 $y > 0$，根据对数的性质

$$\begin{aligned} \ln y = {} & 2\ln x + 3\ln(x + 1) \\ & - \tfrac12\ln\big(x^2 + 3\big). \end{aligned}$$

两边求导：

$$\frac{y'}{y} = \frac2x + \frac{3}{x + 1} - \frac{x}{x^2 + 3}.$$

在 $x = 1$ 处， $y(1) = \dfrac{1 \cdot 8}{\sqrt4} = 4$ 和 $\dfrac{y'}{y} = 2 + \dfrac32 - \dfrac14 = \dfrac{13}{4}$，所以 $y'(1) = 4 \cdot \dfrac{13}{4} = 13$。乘积法则和商法则给出相同的结果，但需要更多代数运算。

```check
yq = xp**2*(xp + 1)**3/sqrt(xp**2 + 3)
same(expand_log(log(yq), force=True), 2*log(xp) + 3*log(xp + 1) - log(xp**2 + 3)/2)
same(diff(log(yq), xp), 2/xp + 3/(xp + 1) - xp/(xp**2 + 3))
same(yq.subs(xp, 1), 4); same((2/xp + 3/(xp + 1) - xp/(xp**2 + 3)).subs(xp, 1), Rational(13, 4))
same(diff(yq, xp).subs(xp, 1), 13)
```
:::

::: pitfall
$\dfrac{d}{dx}x^x$ 不等于 $x \cdot x^{x-1}$（幂法则需要常数指数），也不等于 $x^x\ln x$（指数法则需要常数底数）。正确答案 $x^x\ln x + x^x$ 是两者的和：每个规则对应 $x$ 出现的一个位置。只对正数取对数： $\ln y$ 需要 $y > 0$；否则使用 $\ln{\abs{y}}$。

```check
same(xp*xp**(xp - 1), xp**xp); same(xp**xp*log(xp) + xp*xp**(xp - 1), diff(xp**xp, xp))
```
:::

::: compute 使用 SymPy 计算导数
SymPy 知道这个模块的每一个导数。声明 $x$ 为正数可以让它使用需要 $x > 0$ 的规则：

```python
import sympy as sp
x = sp.symbols('x', positive=True)
for f in [2**x, sp.log(x, 10), x**sp.E, x**x, sp.asin(x), sp.tanh(x)]:
    print(f, '  ->  ', sp.diff(f, x))
```

```output
2**x   ->   2**x*log(2)
log(x)/log(10)   ->   1/(x*log(10))
x**E   ->   E*x**E/x
x**x   ->   x**x*(log(x) + 1)
asin(x)   ->   1/sqrt(1 - x**2)
tanh(x)   ->   1 - tanh(x)**2
```

SymPy 用 `log` 表示 ${\ln}$，用 `E` 表示 $e$，用 `asin` 表示 ${\arcsin}$，它的形式可能与页面上的不同。它在求导前将 `log(x, 10)` 转换为 `log(x)/log(10)`； `E*x**E/x` 等于 $e\,x^{e-1}$； `1 - tanh(x)**2` 等于 $1/\cosh^2 x$（第6.7节）。 `idiff` 进行隐函数求导：

```python
X, Y = sp.symbols('x y')
slope = sp.idiff(X**3 + Y**3 - 6*X*Y, Y, X)     # dy/dx on the folium of Descartes
print(slope)
print(slope.subs({X: 3, Y: 3}))
```

```output
(x**2 - 2*y)/(2*x - y**2)
-1
```

分数 $\dfrac{x^2 - 2y}{2x - y^2}$ 是例6.5的 $\dfrac{2y - x^2}{y^2 - 2x}$，其分子和分母都乘以 $-1$。
:::

```check
same(E*xp**E/xp, E*xp**(E - 1)); same(1 - tanh(x)**2, 1/cosh(x)**2)
same((x**2 - 2*y)/(2*x - y**2), (2*y - x**2)/(y**2 - 2*x))
```

## 双曲函数 {#hyperbolic}

一条悬挂在两根柱子之间的链条（图6.5，右）看起来像一条抛物线，但它的形状是由 $e^x$ 和 $e^{-x}$ 构成的，如本节末尾所示。两种由 $e^x$ 和 $e^{-x}$ 组合而成的函数在科学和工程中出现得如此频繁，以至于它们有了专门的名称。

::: definition 双曲函数
对于每一个实数 $x$，

$$\begin{aligned} \sinh x &= \frac{e^x - e^{-x}}{2}, \\ \cosh x &= \frac{e^x + e^{-x}}{2}, \\ \tanh x &= \frac{\sinh x}{\cosh x} = \frac{e^x - e^{-x}}{e^x + e^{-x}}. \end{aligned}$$

它们分别是 **双曲正弦**、 **双曲余弦** 和 **双曲正切**，读作“x 的双曲正弦”等。
:::

```check
same(sinh(x), (exp(x) - exp(-x))/2); same(cosh(x), (exp(x) + exp(-x))/2)
same(tanh(x), sinh(x)/cosh(x)); same(tanh(x).rewrite(exp), (exp(x) - exp(-x))/(exp(x) + exp(-x)))
```

它们的图像见图6.5（左）。 $\cosh x$ 是偶函数，最小值为 $\cosh 0 = 1$； $\sinh x$ 是奇函数且单调递增，具有 $\sinh 0 = 0$； $\tanh x$ 是奇函数且单调递增，位于 $-1$ 和 1 之间，当 $x \to \infty$ 趋于无穷大时趋近于 1，当 $-1$ 趋于无穷大时趋近于 $x \to -\infty$。对于大的 $x$， $e^{-x}$ 很小，因此 $\cosh x$ 和 $\sinh x$ 都接近 $\tfrac12 e^x$。S 形的 $\tanh$ 是神经网络的标准激活函数之一。

```check
same(cosh(-x), cosh(x)); same(sinh(-x), -sinh(x)); same(tanh(-x), -tanh(x)); same(cosh(0), 1); same(sinh(0), 0)
same(function_range(cosh(x), x, S.Reals), Interval(1, oo)); same(function_range(tanh(x), x, S.Reals), Interval.open(-1, 1))
limit_is(tanh(x), x, oo, 1); limit_is(tanh(x), x, -oo, -1)
limit_is(cosh(x) - exp(x)/2, x, oo, 0); limit_is(sinh(x) - exp(x)/2, x, oo, 0)
```

::: theorem 双曲恒等式和导数
对于每一个实数 $x$，

$$\cosh^2 x - \sinh^2 x = 1,$$

和

$$\begin{aligned} \frac{d}{dx}\sinh x &= \cosh x, \\ \frac{d}{dx}\cosh x &= \sinh x, \\ \frac{d}{dx}\tanh x &= \frac{1}{\cosh^2 x} = 1 - \tanh^2 x. \end{aligned}$$
:::

::: proof
展开平方，使用 $e^x e^{-x} = 1$：

$$\begin{aligned} \cosh^2 x &= \frac{e^{2x} + 2 + e^{-2x}}{4}, \\ \sinh^2 x &= \frac{e^{2x} - 2 + e^{-2x}}{4}. \end{aligned}$$

在差 $\cosh^2 x - \sinh^2 x$ 中，所有项相互抵消，只剩下 $\tfrac24 - \big(-\tfrac24\big) = 1$。

由于 $\dfrac{d}{dx}e^{-x} = -e^{-x}$， $\sinh x$ 的导数是 $\dfrac{e^x + e^{-x}}{2} = \cosh x$， $\cosh x$ 的导数是 $\dfrac{e^x - e^{-x}}{2} = \sinh x$。根据商法则和恒等式，

$$\begin{aligned} \frac{d}{dx}\tanh x &= \frac{\cosh^2 x - \sinh^2 x}{\cosh^2 x} \\ &= \frac{1}{\cosh^2 x}, \end{aligned}$$

并将恒等式除以 $\cosh^2 x$ 得到 $1 - \tanh^2 x = \dfrac{1}{\cosh^2 x}$。
:::

```check
same(expand(((exp(x) + exp(-x))/2)**2), (exp(2*x) + 2 + exp(-2*x))/4); same(expand(((exp(x) - exp(-x))/2)**2), (exp(2*x) - 2 + exp(-2*x))/4)
steps(cosh(x)**2 - sinh(x)**2, (exp(2*x) + 2 + exp(-2*x))/4 - (exp(2*x) - 2 + exp(-2*x))/4, 1); same(Rational(2, 4) - (-Rational(2, 4)), 1)
same(diff((exp(x) - exp(-x))/2, x), (exp(x) + exp(-x))/2); same(diff((exp(x) + exp(-x))/2, x), (exp(x) - exp(-x))/2)
same(diff(sinh(x), x), cosh(x)); same(diff(cosh(x), x), sinh(x))
steps(diff(sinh(x)/cosh(x), x), (cosh(x)*cosh(x) - sinh(x)*sinh(x))/cosh(x)**2, (cosh(x)**2 - sinh(x)**2)/cosh(x)**2, 1/cosh(x)**2, 1 - tanh(x)**2)
```

该恒等式解释了名称的由来。点 $(\cos t, \sin t)$ 位于圆 $x^2 + y^2 = 1$ 上；点 $(\cosh t, \sinh t)$ 位于双曲线 ** ** $x^2 - y^2 = 1$ 上，位于其右支，因为 $\cosh t \ge 1$。这些公式与三角函数的公式类似，只是符号有所变化：$\cos' = -\sin$ 但 $\cosh' = {\sinh}$，且 $\cos^2 + \sin^2 = 1$ 但 $\cosh^2 - \sinh^2 = 1$。其余三个双曲函数 $\sech x = 1/\cosh x$、$\csch x = 1/\sinh x$ 和 $\coth x = \cosh x/\sinh x$（最后两个用于 $x \ne 0$）使用较少。利用它们，$(\tanh x)' = \sech^2 x$，并应用商法则，同样可得 $(\coth x)' = -\csch^2 x$、$(\sech x)' = -\sech x\tanh x$ 和 $(\csch x)' = -\csch x\coth x$。

```check
same((cosh(t))**2 - (sinh(t))**2, 1); same(diff(tanh(x), x), sech(x)**2)
same(sech(x), 1/cosh(x)); same(csch(x), 1/sinh(x)); same(coth(x), cosh(x)/sinh(x))
same(diff(coth(x), x), -csch(x)**2); same(diff(sech(x), x), -sech(x)*tanh(x)); same(diff(csch(x), x), -csch(x)*coth(x))
same(diff(cosh(x)/sinh(x), x), -1/sinh(x)**2); same(diff(1/cosh(x), x), -(1/cosh(x))*tanh(x)); same(diff(1/sinh(x), x), -(1/sinh(x))*(cosh(x)/sinh(x)))
```

### 悬挂的链条 {#hanging-chain}

一串链条或缆绳在两个支撑点之间自由悬挂，仅受自身重力作用时，会形成一个 **悬链线**（来自拉丁语“chain”之意）：其最低点位于 $(0, a)$，其方程为

$$y = a\cosh\frac{x}{a},$$

其中常数 $a > 0$ 是链条的水平张力与其单位长度的重量之比。推导该方程需要弧长（第12模块）和微分方程（第13模块），本系列不进行推导。图6.5（右）比较了悬链线与抛物线：它们看起来相似，但实际上是不同的曲线。

::: figure id=fig-06-5
左：函数 $\cosh x$、$\sinh x$ 和 $\tanh x$ 的图像。对于大的 $x$， $\cosh x$ 和 $\sinh x$ 都趋近于 $\tfrac12 e^x$（虚线），而 $\tanh x$ 趋近于 1。右：悬链线 $y = \cosh x$ 对于 $-2 \le x \le 2$（蓝色），表示两个支撑点之间悬挂链条的形状，以及通过其最低点和两个端点的抛物线（橙色虚线）。
:::

```check
par = 1 + (cosh(2) - 1)*x**2/4
same(par.subs(x, 0), 1); same(par.subs(x, 2), cosh(2)); same(par.subs(x, -2), cosh(2))
holds(diff(cosh(x), x, 2).subs(x, 0) < diff(par, x, 2))          # flatter at the bottom
holds(diff(cosh(x), x).subs(x, 2) > diff(par, x).subs(x, 2))      # steeper at the ends
holds(cosh(1) < par.subs(x, 1))
```

现在你可以验证悬链线所满足的微分方程。

::: example 悬挂的链条
证明 $y = a\cosh(x/a)$，在 $a > 0$ 的条件下，满足

$$y'' = \frac1a\sqrt{1 + (y')^2},$$

那个悬挂链所遵循的方程。

根据链式法则和定理 6.9， $y' = a\sinh\dfrac{x}{a}\cdot\dfrac1a = \sinh\dfrac{x}{a}$，且 $y'' = \dfrac1a\cosh\dfrac{x}{a}$。另一方面，根据恒等式， $1 + (y')^2 = 1 + \sinh^2\dfrac{x}{a} = \cosh^2\dfrac{x}{a}$，由于 $\cosh$ 是正数， $\sqrt{1 + (y')^2} = \cosh\dfrac{x}{a}$。因此两边都等于 $\dfrac1a\cosh\dfrac{x}{a}$。

```check
yc = ap*cosh(xr/ap)
same(diff(yc, xr), sinh(xr/ap)); same(diff(yc, xr, 2), cosh(xr/ap)/ap)
same(1 + sinh(xr/ap)**2, cosh(xr/ap)**2); same(sqrt(1 + diff(yc, xr)**2), cosh(xr/ap))
same(diff(yc, xr, 2), sqrt(1 + diff(yc, xr)**2)/ap)
```
:::

::: pitfall
两个符号牌。 $\dfrac{d}{dx}\cosh x = +\sinh x$ 与 $\dfrac{d}{dx}\cos x = -\sin x$ 不同；而恒等式是 $\cosh^2 x - \sinh^2 x = 1$，带有负号。为了检验公式，尝试 $x = \ln 2$，其中 $\cosh x = \tfrac54$ 和 $\sinh x = \tfrac34$： $\big(\tfrac54\big)^2 - \big(\tfrac34\big)^2 = 1$，而 $\big(\tfrac54\big)^2 + \big(\tfrac34\big)^2 = \tfrac{17}{8}$。

```check
same(cosh(log(2)), Rational(5, 4)); same(sinh(log(2)), Rational(3, 4))
same(Rational(5, 4)**2 - Rational(3, 4)**2, 1); same(Rational(5, 4)**2 + Rational(3, 4)**2, Rational(17, 8))
```
:::

## 指数增长与衰减 {#growth-decay}

根据定理 6.1，指数函数的变化率与其大小成比例。许多量都表现出这种特性：在充足食物和空间下的人口增长速率与其数量成比例，连续复利下的钱数增长速率与其余额成比例，放射性物质的衰变速率与其剩余量成比例。每个情况都可以用以下方程描述

$$\frac{dy}{dt} = ky,$$

其中 $k$ 是一个常数。这是一个 **微分方程**：一个未知函数 $y(t)$ 的方程，它涉及该函数的导数。一个 **解决方案** 是使方程对所有 $t$ 成立的函数。

::: theorem 指数增长与衰减
对于任何常数 $C$ 和 $k$，函数 $y(t) = Ce^{kt}$ 满足

$$\begin{aligned} \frac{dy}{dt} &= ky \quad \text{for every } t, \\ y(0) &= C. \end{aligned}$$
:::

::: proof
根据链式法则， $\dfrac{d}{dt}\big(Ce^{kt}\big) = C\cdot ke^{kt} = k\cdot Ce^{kt} = ky$，和 $y(0) = Ce^0 = C$。
:::

```check
C = symbols('C')
same(diff(C*exp(k*t), t), k*C*exp(k*t)); same((C*exp(k*t)).subs(t, 0), C)
```

这个检查公式是否为解；它不是寻找解的方法。模块 13 解决微分方程，并展示这些是 $y' = ky$ 的唯一解：一个量的变化率是其大小的 $k$ 倍，该量为 $y(0)e^{kt}$。

### 倍增时间与半衰期 {#doubling}

如果 $k > 0$ 和 $C > 0$，$y = Ce^{kt}$ 会增长。它在时间 $T$ 内以 $e^{kT} = 2$ 倍增长，即，

$$T = \frac{\ln 2}{k},$$

无论起始值如何以及何时开始计时， **倍增时间** 都是 $y(t + T) = Ce^{kt}e^{kT} = 2y(t)$。如果 $k < 0$， $y$ 衰减，并且它在 **半衰期** 内减半。

$$T_{1/2} = \frac{\ln 2}{\abs{k}}.$$

自从 $\ln 2 \approx 0.693$，一个以 $p$% 每单位时间连续增长的量，使得 $k = p/100$，在大约 $69.3/p$ 个单位时间内翻倍。这就是金融中的“70法则”：年利率为 5% 时，资金大约在 $70/5 = 14$ 年内翻倍（例 6.4 得出 13.86）。

```check
Tp = symbols('T', positive=True); kp = symbols('k', positive=True); kn = symbols('k', negative=True)
same(solve(exp(kp*Tp) - 2, Tp), [log(2)/kp]); same(C*exp(kp*t)*exp(kp*log(2)/kp), 2*C*exp(kp*t))
same(solve(exp(kn*Tp) - Rational(1, 2), Tp), [log(2)/Abs(kn)])
rounds(log(2), '0.693'); same(log(2)/(Rational(1, 100)*symbols('p', positive=True)), 100*log(2)/symbols('p', positive=True)); rounds(100*log(2), '69.3')
same(Rational(70, 5), 14); rounds(log(2)/Rational(5, 100), '13.86')
```

::: example 模块 1 的细菌
模块 1 的 [例 1.6](module_01_ZH.html#exponential)] 用 $N(t) = 1000 \cdot 2^{t/3}$ 个细胞在 $t$ 小时后建模了一个细菌群落。写出 $N$ 的形式 $Ce^{kt}$，检查其翻倍时间，并找出该群落在 $t = 0$ 和 $t = 6$ 时的增长速率。

自从 $2 = e^{\ln 2}$， $2^{t/3} = e^{(\ln 2/3)t}$，和 $N(t) = 1000e^{kt}$ 有

$$k = \frac{\ln 2}{3} \approx 0.2310 \text{ per hour}.$$

翻倍时间为 $\dfrac{\ln 2}{k} = 3$ 小时，如前所述。根据定理 6.10， $N'(t) = kN(t)$。在 $t = 0$ 时，该群落以 $1000k \approx 231.0$ 个细胞每小时增长；在 $t = 6$ 时，当 $N = 1000 \cdot 2^2 = 4000$，其增长速率为 $4000k \approx 924.2$ 个细胞每小时，是原来的四倍。

```check
same((1000*2**(t/3)).rewrite(exp), 1000*exp(log(2)/3*t)); rounds(log(2)/3, '0.2310'); same(log(2)/(log(2)/3), 3)
same(diff(1000*2**(t/3), t), log(2)/3*1000*2**(t/3))
rounds(1000*log(2)/3, '231.0'); same(1000*2**(Integer(6)/3), 4000); rounds(4000*log(2)/3, '924.2')
```
:::

::: example 半衰期
假设一种放射性同位素的半衰期为 8 天。 (a) 求其衰变定律 $y = y_0e^{kt}$ 中的常数 $k$，单位为天 $t$。 (b) 30 天后样品剩余的分数是多少？ (c) 什么时候只剩下 1%？

**(a)** $\dfrac{\ln 2}{\abs{k}} = 8$ 和 $k < 0$，因此 $k = -\dfrac{\ln 2}{8} \approx -0.08664$ 每天。

**(b)** 经过 $t$ 天后的数量为 $y(t) = y_0e^{kt} = y_0e^{-(\ln 2/8)t} = y_0\,2^{-t/8}$，其中 $y_0$ 是初始数量 $t = 0$。30 天后剩余的分数为 $2^{-30/8} = 2^{-3.75} \approx 0.0743$，约为 7.4%。

**(c)** 解 $2^{-t/8} = 0.01$。两边取 $\ln$： $-\dfrac{t}{8}\ln 2 = \ln 0.01 = -\ln 100$，因此

$$t = \frac{8\ln 100}{\ln 2} \approx 53.15 \text{ days}.$$

```check
k8 = -log(2)/8
same(log(2)/Abs(k8), 8); rounds(k8, '-0.08664')
same(exp(k8*t), (2**(-t/8)).rewrite(exp)); same(Rational(30, 8), Rational(375, 100)); rounds(2**(-Rational(30, 8)), '0.0743'); rounds(100*2**(-Rational(30, 8)), '7.4')
same(log(Rational(1, 100)), -log(100))
same(solve(2**(-xr/8) - Rational(1, 100), xr), [8*log(100)/log(2)]); rounds(8*log(100)/log(2), '53.15')
```
:::

::: pitfall
两张带有指数模型的卡片。速率 $k$ 和时间 $t$ 必须使用相同的单位：每天的速率需要 $t$ 以天为单位。一个每 8 天减半的量在 16 天后不会消失：16 天后剩下四分之一，而在 $8m$ 天后剩下分数 $\big(\tfrac12\big)^m$，永远不会为零。

```check
same(2**(-Rational(16, 8)), Rational(1, 4)); same(2**(-(8*m)/8), (Rational(1, 2))**m)
```
:::

::: compute 使用 SymPy 进行增长和衰减
用符号表示，SymPy 检查 $Ce^{kt}$ 解决 $y' = ky$，并且 $Cte^{kt}$ 不解决：

```python
import sympy as sp
t, k, C = sp.symbols('t k C')
y = C*sp.exp(k*t)
print(sp.diff(y, t) - k*y)                    # 0: y' = ky for every t
w = C*t*sp.exp(k*t)
print(sp.simplify(sp.diff(w, t) - k*w))       # not 0: w is not a solution
print(sp.solve(sp.Eq(sp.exp(k*t), 2), t))     # the doubling time
```

```output
0
C*exp(k*t)
[log(2)/k]
```

调用 `sp.solve(equation, t)` 返回 `t` 的解列表。为求得倍增时间，`sp.Eq` 建立方程 $e^{kt} = 2$。

例 6.12 中的数值：

```python
k8 = -sp.log(2)/8
print(sp.N(k8, 4), sp.N(sp.exp(30*k8), 3), sp.N(sp.log(sp.Rational(1, 100))/k8, 4))
```

```output
-0.08664 0.0743 53.15
```

它们是 $k \approx -0.08664$，30 天后剩余的分数 0.0743，以及 1% 剩余所需的时间 53.15 天。
:::

## 你所学到的内容 {#summary}

- 复利，$\big(1 + \tfrac1n\big)^n$，以及 $a^x$ 在 0 处的斜率导致同一个数值 $e \approx 2.71828$。该级数通过 $\lim_{h\to0}(e^h - 1)/h = 1$ 定义 $e$，假定模块 1 的实数幂以及 $2^x$ 在 0 处有斜率，并证明 $\big(1 + \tfrac{x}{n}\big)^n \to e^x$。
- $a^x$ 的导数是其在 0 处的斜率乘以 $a^x$，且在 0 处的斜率为 $\ln a$：即 $(e^x)' = e^x$ 和 $(a^x)' = a^x\ln a$。
- 如果 $f$ 在一个开区间和 $f'(a) \ne 0$ 上连续且单射，则 $(f^{-1})'\big(f(a)\big) = 1/f'(a)$：在 $y = x$ 上的反射将斜率 $m$ 转换为斜率 $1/m$。
- $(\ln x)' = 1/x$ 对应 $x > 0$， $(\ln\abs{x})' = 1/x$ 对应 $x \ne 0$， $(\ln\abs{u})' = u'/u$ 在 $u \ne 0$ 处，且 $(\log_a x)' = 1/(x\ln a)$。
- 隐函数求导：对曲线方程使用 $y = y(x)$ 进行求导，对每个含有 $y$ 的项应用链式法则，然后解出 $y'$。当 $y'$ 的系数不为 0 时，隐函数定理保证 $y$ 是 $x$ 的可导函数。
- ${\arcsin}$, $\arccos$ 和 $\arctan$ 在 $\sin$ 上作用于 $[-\pi/2, \pi/2]$，$\cos$ 作用于 $[0, \pi]$ 和 $\tan$ 作用于 $(-\pi/2, \pi/2)$。它们的导数分别是 $1/\sqrt{1 - x^2}$、$-1/\sqrt{1 - x^2}$ 和 $1/(1 + x^2)$。$\sin^{-1}x$ 表示 $\arcsin x$，不是 $1/\sin x$。
- 对数求导法处理乘积、商和变量指数，如 $(x^x)' = x^x(\ln x + 1)$；幂法则 $(x^r)' = rx^{r-1}$ 对于每一个实数 $r$ 和 $x > 0$ 都成立。
- $\cosh^2 x - \sinh^2 x = 1$, $\sinh' = {\cosh}$, $\cosh' = {\sinh}$, $\tanh' = 1/\cosh^2$; 一条下垂的链是悬链线, $y = a\cosh(x/a)$.
- $y = Ce^{kt}$ 解决 $y' = ky$ 与 $y(0) = C$; 倍增时间是 $\ln 2/k$ 且半衰期 $\ln 2/{\abs{k}}$. 模块 13 解决此类方程.

## 练习 {#exercises}

:::: exercise 指数函数与对数函数的导数 {#ex-6-1} ★
求导：

- (a) $e^{-4x}$
- (b) $5^x$
- (c) $x^3e^{2x}$
- (d) $\ln\big(3x^2 + 1\big)$
- (e) $\log_2 x$，对于 $x > 0$
- (f) $\cosh\big(x^2\big)$

::: solution
**(a)** 通过链式法则，内函数为 $-4x$: $-4e^{-4x}$.

**(b)** 根据定理 6.3: $5^x\ln 5 \approx 1.609 \cdot 5^x$. 常见错误答案 $x\,5^{x-1}$ 使用幂法则，而幂法则适用于变量底数.

**(c)** 通过乘积法则:
$$\begin{aligned} &3x^2e^{2x} + x^3\cdot 2e^{2x} \\ &\quad= x^2e^{2x}(3 + 2x). \end{aligned}$$

**(d)** 与 $u = 3x^2 + 1 > 0$: $\dfrac{u'}{u} = \dfrac{6x}{3x^2 + 1}$. 答案不是 $\dfrac{1}{3x^2 + 1}$: 那个答案漏掉了因子 $u' = 6x$.

**(e)** $\log_2 x = \dfrac{\ln x}{\ln 2}$，因此其导数是 $\dfrac{1}{x\ln 2}$.

**(f)** 通过链式法则，内函数为 $x^2$，且 $\cosh' = {\sinh}$:

$$\begin{aligned} \frac{d}{dx}\cosh\big(x^2\big) &= \sinh\big(x^2\big)\cdot 2x \\ &= 2x\sinh\big(x^2\big). \end{aligned}$$

```check
same(diff(exp(-4*x), x), -4*exp(-4*x))
same(diff(5**x, x), 5**x*log(5)); rounds(log(5), '1.609')
steps(diff(x**3*exp(2*x), x), 3*x**2*exp(2*x) + x**3*2*exp(2*x), x**2*exp(2*x)*(3 + 2*x))
same(diff(log(3*x**2 + 1), x), 6*x/(3*x**2 + 1))
same(diff(log(xp, 2), xp), 1/(xp*log(2)))
same(diff(cosh(x**2), x), 2*x*sinh(x**2))
```
:::
::::

:::: exercise 反三角函数的值 {#ex-6-2} ★
- (a) 求 $\arcsin\dfrac{\sqrt3}{2}$, $\arccos\Big(-\dfrac{\sqrt2}{2}\Big)$ 和 $\arctan\big(-\sqrt3\big)$.
- (b) 求 $\arccos\Big(\cos\Big(-\dfrac{\pi}{4}\Big)\Big)$。
- (c) 一台计算器在弧度模式下显示 $\sin^{-1}(0.5) = 0.5236$（四舍五入）。这个数是什么？为什么它与 $\dfrac{1}{\sin 0.5} \approx 2.0858$ 不同？

::: solution
**(a)** 在每种情况下，找出一个具有相同正弦、余弦或正切值的角度，并检查该角度是否位于反函数的定义域内。

- $\sin\tfrac{\pi}{3} = \tfrac{\sqrt3}{2}$，且 $\tfrac{\pi}{3}$ 位于 $[-\pi/2, \pi/2]$: $\arcsin\tfrac{\sqrt3}{2} = \tfrac{\pi}{3}$。
- $\cos\tfrac{3\pi}{4} = \cos\big(\pi - \tfrac{\pi}{4}\big) = -\cos\tfrac{\pi}{4} = -\tfrac{\sqrt2}{2}$，且 $\tfrac{3\pi}{4}$ 位于 $[0, \pi]$: $\arccos\big({-\tfrac{\sqrt2}{2}}\big) = \tfrac{3\pi}{4}$。
- 正切是奇函数，因此 $\tan\big({-\tfrac{\pi}{3}}\big) = -\tan\tfrac{\pi}{3} = -\sqrt3$，且 $-\tfrac{\pi}{3}$ 位于 $(-\pi/2, \pi/2)$: $\arctan\big({-\sqrt3}\big) = -\tfrac{\pi}{3}$。

**(b)** $\cos\Big(-\dfrac{\pi}{4}\Big) = \cos\dfrac{\pi}{4} = \dfrac{\sqrt2}{2}$，且 $\arccos\dfrac{\sqrt2}{2} = \dfrac{\pi}{4}$。答案是 $\dfrac{\pi}{4}$，不是 $-\dfrac{\pi}{4}$: $\arccos$ 仅返回 $[0, \pi]$ 中的角度。

**(c)** $\sin^{-1}$ 在计算器上是 ${\arcsin}$: $\arcsin 0.5 = \dfrac{\pi}{6} \approx 0.5236$，其正弦值为 0.5 的角度（以弧度为单位）。数 $\dfrac{1}{\sin 0.5}$ 是角度 0.5 的正弦值的倒数，即 $\csc 0.5$: $-1$ 在 $\sin^{-1}$ 中不是指数。

```check
same(asin(sqrt(3)/2), pi/3); same(3*pi/4, pi - pi/4); same(cos(3*pi/4), -cos(pi/4)); same(cos(pi - pi/4), -sqrt(2)/2); same(acos(-sqrt(2)/2), 3*pi/4)
same(tan(-pi/3), -sqrt(3)); same(atan(-sqrt(3)), -pi/3)
same(cos(-pi/4), sqrt(2)/2); same(acos(cos(-pi/4)), pi/4)
same(asin(Rational(1, 2)), pi/6); rounds(pi/6, '0.5236'); rounds(1/sin(Rational(1, 2)), '2.0858'); same(1/sin(Rational(1, 2)), csc(Rational(1, 2)))
```
:::
::::

:::: exercise 隐函数求导得到的切线 {#ex-6-3} ★
证明 $(1, 2)$ 在曲线 $x^2 + xy + y^2 = 7$ 上。通过隐式求导找出 $\dfrac{dy}{dx}$，并求出在点 $(1, 2)$ 处的切线方程。

::: solution
在 $(1, 2)$ 处， $x^2 + xy + y^2 = 1 + 2 + 4 = 7$，因此该点在曲线上。对两边关于 $x$ 求导，对 $xy$ 使用乘积法则，对 $y^2$ 使用链式法则：

$$2x + \big(y + x\,y'\big) + 2y\,y' = 0.$$

收集含 $y'$ 的项： $(x + 2y)\,y' = -(2x + y)$，因此

$$y' = -\frac{2x + y}{x + 2y} \quad (x + 2y \ne 0).$$

在 $(1, 2)$ 处： $y' = -\dfrac{2 + 2}{1 + 4} = -\dfrac45$。切线方程为

$$y - 2 = -\frac45(x - 1),$$

即， $y = -\tfrac45x + \tfrac{14}{5}$。

```check
cur = x**2 + x*y + y**2 - 7
same(cur.subs({x: 1, y: 2}), 0)
same(diff(x**2 + x*Yf(x) + Yf(x)**2, x), 2*x + (Yf(x) + x*diff(Yf(x), x)) + 2*Yf(x)*diff(Yf(x), x))
yd3 = symbols('yd3')
same(expand(2*x + (y + x*yd3) + 2*y*yd3), expand((x + 2*y)*yd3 + (2*x + y)))      # collected: (x + 2y) y' = -(2x + y)
same(idiff(cur, y, x), -(2*x + y)/(x + 2*y)); same((-(2*x + y)/(x + 2*y)).subs({x: 1, y: 2}), -Rational(4, 5))
same(expand(2 - Rational(4, 5)*(x - 1)), -Rational(4, 5)*x + Rational(14, 5))
```
:::
::::

:::: exercise 反函数的斜率 {#ex-6-4} ★★
设 $f(x) = x + e^x$。

- (a) 证明 $f$ 在 $\R$ 上是单射的。
- (b) 求 $(f^{-1})'(1)$ 和 $(f^{-1})'(1 + e)$。
- (c) 求函数 $f^{-1}$ 在点 $(1, 0)$ 处的切线方程。

::: solution
**(a)** 设 $x_1 < x_2$. 那么 $e^{x_1} < e^{x_2}$，因为 $e^x$ 增加 ($e > 1$)，所以 $x_1 + e^{x_1} < x_2 + e^{x_2}$: $f$ 是严格递增的，因此是单射的 ([Exercise 1.10](module_01_ZH.html#ex-1-10)). 它也是可导的，因此在 $\R$ 上连续，且 $f'(x) = 1 + e^x$，它从不为 0，因此定理 6.4 在每一点都适用。

**(b)** $f(0) = 0 + 1 = 1$ 和 $f(1) = 1 + e$，而 $f'(0) = 1 + 1 = 2$ 和 $f'(1) = 1 + e$. 所以

$$\begin{aligned} (f^{-1})'(1) &= \frac{1}{f'(0)} = \frac12, \\ (f^{-1})'(1 + e) &= \frac{1}{f'(1)} = \frac{1}{1 + e}, \end{aligned}$$

和 $1/(1 + e) \approx 0.2689$。

常见的错误是写出 $(f^{-1})'(1) = \dfrac{1}{f'(1)}$: $f$ 的斜率必须在镜像点 $f^{-1}(1) = 0$ 处取得。

**(c)** 点 $(1, 0)$ 在 $f^{-1}$ 的图象上，因为 $f(0) = 1$，并且在该点的斜率是 $\tfrac12$（由 (b) 得出）。切线方程是 $y - 0 = \tfrac12(x - 1)$，即 $y = \dfrac{x - 1}{2}$。

```check
f4 = x + exp(x)
same(diff(f4, x), 1 + exp(x)); holds(diff(f4, x).subs(x, xr) > 0)
same(f4.subs(x, 0), 1); same(f4.subs(x, 1), 1 + E); same(diff(f4, x).subs(x, 0), 2); same(diff(f4, x).subs(x, 1), 1 + E)
same(1/diff(f4, x).subs(x, 0), Rational(1, 2)); same(1/diff(f4, x).subs(x, 1), 1/(1 + E)); rounds(1/(1 + E), '0.2689')
yv = symbols('y_v')
same(idiff(yv + exp(yv) - x, yv, x).subs(yv, 0), Rational(1, 2))       # y = f^{-1}(x) satisfies y + e^y = x
same(Rational(1, 2)*(x - 1), (x - 1)/2)
```
:::
::::

:::: exercise 对数求导法 {#ex-6-5} ★★
- (a) 对 $y = x^{\sin x}$ 求导，对于 $x > 0$。
- (b) 对 $y = x^{1/x}$ 求导，对于 $x > 0$，并找出其切线水平的点。
- (c) 求 $y'(0)$ 对于 $y = (x + 1)^2(x + 2)^3(x + 3)^4$。

::: solution
**(a)** $y > 0$，并且 $\ln y = \sin x\,\ln x$。根据乘积法则，
$$\begin{aligned} \frac{y'}{y} &= \cos x\,\ln x + \frac{\sin x}{x}, \\ y' &= x^{\sin x}\Big(\cos x\,\ln x + \frac{\sin x}{x}\Big). \end{aligned}$$

**(b)** $\ln y = \dfrac{\ln x}{x}$。根据商法则，
$$\begin{aligned} \frac{y'}{y} &= \frac{\tfrac1x\cdot x - \ln x\cdot 1}{x^2} = \frac{1 - \ln x}{x^2}, \\ y' &= x^{1/x}\,\frac{1 - \ln x}{x^2}. \end{aligned}$$
自 $x^{1/x} > 0$ 和 $x^2 > 0$，$y' = 0$ 恰好当 $\ln x = 1$，即在 $x = e$ 处，其中 $y = e^{1/e} \approx 1.4447$。水平切线在 $\big(e, e^{1/e}\big)$ 处。 （使用第 8 模块的方法可以证明这是图像的最高点：没有数 $x^{1/x}$ 超过 $e^{1/e}$。）

**(c)** 在 $x = 0$ 附近，每个因子都是正的，因此
$$\begin{aligned} \ln y = {} & 2\ln(x + 1) + 3\ln(x + 2) \\ & + 4\ln(x + 3), \end{aligned}$$
$$\frac{y'}{y} = \frac{2}{x + 1} + \frac{3}{x + 2} + \frac{4}{x + 3}.$$
在 $x = 0$：$y(0) = 1 \cdot 8 \cdot 81 = 648$ 和 $\dfrac{y'}{y} = 2 + \dfrac32 + \dfrac43 = \dfrac{29}{6}$，因此 $y'(0) = 648 \cdot \dfrac{29}{6} = 3132$。

当一个因子为负数时，例如在 $x = -2.5$ 中，其中 $y < 0$，应从 $\ln\abs{y} = 2\ln\abs{x + 1} + 3\ln\abs{x + 2} + 4\ln\abs{x + 3}$ 开始。由于 $(\ln\abs{u})' = u'/u$，同样的 $y'/y$ 公式得出。因此，只要 $y \ne 0$ 成立，即对于每一个 $x$ 除了 $-1$、$-2$ 和 $-3$，该公式都成立。

```check
same(diff(xp**sin(xp), xp), xp**sin(xp)*(cos(xp)*log(xp) + sin(xp)/xp))
steps(diff(log(xp)/xp, xp), (1/xp*xp - log(xp))/xp**2, (1 - log(xp))/xp**2)
same(diff(xp**(1/xp), xp), xp**(1/xp)*(1 - log(xp))/xp**2)
same(solve(1 - log(xp), xp), [E]); rounds(exp(exp(-1)), '1.4447'); same(E**(1/E), exp(exp(-1)))
y5 = (x + 1)**2*(x + 2)**3*(x + 3)**4
same(diff(2*log(x + 1) + 3*log(x + 2) + 4*log(x + 3), x), 2/(x + 1) + 3/(x + 2) + 4/(x + 3))
same(y5.subs(x, 0), 648); same((2/(x + 1) + 3/(x + 2) + 4/(x + 3)).subs(x, 0), Rational(29, 6))
same(648*Rational(29, 6), 3132); same(diff(y5, x).subs(x, 0), 3132)
holds(y5.subs(x, -Rational(5, 2)) < 0); same_set(solve(y5, x), [-1, -2, -3])
same(diff(2*log(-(x + 1)) + 3*log(-(x + 2)) + 4*log(x + 3), x), 2/(x + 1) + 3/(x + 2) + 4/(x + 3))   # ln|y| for -3 < x < -2
same(diff(y5, x), y5*(2/(x + 1) + 3/(x + 2) + 4/(x + 3)))                                          # so y' = y(...) wherever y is not 0
```
:::
::::

:::: exercise 反三角函数的导数 {#ex-6-6} ★★
- (a) 对 $\arcsin\dfrac{x}{3}$ 求导，对于 $-3 < x < 3$。
- (b) 求 $x\arctan x$ 的导数。
- (c) 证明 $\dfrac{d}{dx}\Big(\arctan x + \arctan\dfrac1x\Big) = 0$ 对于每一个 $x \ne 0$。计算 $\arctan x + \arctan\dfrac1x$ 在 $x = 1$ 和 $x = -1$ 处的值。你得出什么结论？

::: solution
**(a)** 根据链式法则，对于 $-3 < x < 3$（因此 $-1 < x/3 < 1$），
$$\begin{aligned} \frac{d}{dx}\arcsin\frac{x}{3} &= \frac{1}{\sqrt{1 - x^2/9}}\cdot\frac13 \\ &= \frac{1}{\sqrt{9 - x^2}}, \end{aligned}$$
因为 $3\sqrt{1 - x^2/9} = \sqrt{9(1 - x^2/9)} = \sqrt{9 - x^2}$。

**(b)** 根据乘积法则： $\arctan x + \dfrac{x}{1 + x^2}$。

**(c)** 根据链式法则，
$$\begin{aligned} \frac{d}{dx}\arctan\frac1x &= \frac{1}{1 + 1/x^2}\cdot\frac{-1}{x^2} \\ &= -\frac{1}{x^2 + 1}, \end{aligned}$$
这消去了 $\arctan x$ 的导数 $\dfrac{1}{1 + x^2}$：该和的导数为 0。在 $x = 1$ 处该和为 $\tfrac{\pi}{4} + \tfrac{\pi}{4} = \tfrac{\pi}{2}$；在 $x = -1$ 处为 $-\tfrac{\pi}{4} - \tfrac{\pi}{4} = -\tfrac{\pi}{2}$。一个在区间上导数为 0 的函数在该区间上是常数（模块 8 证明了这一点），因此 $\arctan x + \arctan(1/x)$ 等于 $\pi/2$ 对于每一个 $x > 0$，且 $-\pi/2$ 对于每一个 $x < 0$。这两个常数不同是因为定义域 $(-\infty, 0) \cup (0, \infty)$ 不是一个区间。

```check
steps(diff(asin(x/3), x), 1/sqrt(1 - x**2/9)*Rational(1, 3), 1/sqrt(9 - x**2))
same(diff(x*atan(x), x), atan(x) + x/(1 + x**2))
steps(diff(atan(1/x), x), 1/(1 + 1/x**2)*(-1/x**2), -1/(x**2 + 1)); same(diff(atan(x) + atan(1/x), x), 0)
same(atan(1) + atan(1), pi/2); same(atan(-1) + atan(-1), -pi/2)
for v_ in (Rational(1, 3), Integer(2), Integer(5)):                    # instances, to 25 decimals
    near(atan(v_) + atan(1/v_), pi/2, 1e-25); near(atan(-v_) + atan(-1/v_), -pi/2, 1e-25)
```
:::
::::

:::: exercise 增长的菌落 {#ex-6-7} ★★
假设一个酵母细胞的菌落以指数方式增长， $N(t) = N_0e^{kt}$，从 2000 个细胞增长到 3000 个细胞需要 5 小时。

- (a) 求 $k$。
- (b) 求倍增时间。
- (c) 12 小时后有多少个细胞？
- (d) 在 $t = 5$ 处，培养物的生长速度是多少？

::: solution
**(a)** $N_0 = N(0) = 2000$ 和 $N(5) = 2000e^{5k} = 3000$，所以 $e^{5k} = 1.5$，$5k = \ln 1.5$ 和
$$k = \frac{\ln 1.5}{5} \approx 0.08109 \text{ per hour}.$$

**(b)** $T = \dfrac{\ln 2}{k} = \dfrac{5\ln 2}{\ln 1.5} \approx 8.548$ 小时。

**(c)** $e^{k} = 1.5^{1/5}$，因此 $N(12) = 2000\,e^{12k} = 2000 \cdot 1.5^{12/5} = 2000 \cdot 1.5^{2.4} \approx 5292$ 个细胞。

**(d)** 根据定理 6.10，为 $N'(5) = kN(5) = 3000k \approx 243.3$ 个细胞每小时。

```check
kq = log(Rational(3, 2))/5
same(solve(2000*exp(5*xr) - 3000, xr), [kq]); rounds(kq, '0.08109')
same(log(2)/kq, 5*log(2)/log(Rational(3, 2))); rounds(log(2)/kq, '8.548')
same(2000*exp(12*kq), 2000*Rational(3, 2)**Rational(12, 5)); rounds(2000*Rational(3, 2)**Rational(12, 5), '5292')
same(diff(2000*exp(kq*t), t).subs(t, 5), 3000*kq); rounds(3000*kq, '243.3')
```
:::
::::

:::: exercise 圆上的二阶导数 {#ex-6-8} ★★
对于圆 $x^2 + y^2 = 25$，第 6.4 节求得 $y' = -x/y$。

- (a) 再次隐式求导，以证明 $y'' = -\dfrac{25}{y^3}$ 在 $y \ne 0$ 处成立。
- (b) 在 $(3, 4)$ 处验证值，通过两次对 $y = \sqrt{25 - x^2}$ 求导。
- (c) $y''$ 的符号对圆的上半部分和下半部分说明什么？

::: solution
**(a)** 对 $y' = -\dfrac{x}{y}$ 使用商法则求导，记住 $y$ 是 $x$ 的函数：
$$\begin{aligned} y'' &= -\frac{1\cdot y - x\,y'}{y^2} \\ &= -\frac{y - x(-x/y)}{y^2} \\ &= -\frac{y^2 + x^2}{y^3} \\ &= -\frac{25}{y^3}, \end{aligned}$$
其中第二步替换 $y' = -x/y$，第三步将分子和分母同时乘以 $y$，最后一步在曲线上使用 $x^2 + y^2 = 25$。

**(b)** 在上半部分，$y = (25 - x^2)^{1/2}$，因此 $y' = -x(25 - x^2)^{-1/2}$，根据乘积法则和链式法则，
$$\begin{aligned} y'' &= -(25 - x^2)^{-1/2} \\ &\qquad - x^2(25 - x^2)^{-3/2} \\ &= -\frac{(25 - x^2) + x^2}{(25 - x^2)^{3/2}} \\ &= -\frac{25}{(25 - x^2)^{3/2}}. \end{aligned}$$
在 $x = 3$，$(25 - 9)^{3/2} = 16^{3/2} = 64$，因此 $y'' = -\dfrac{25}{64}$；且 (a) 也给出 $-\dfrac{25}{4^3} = -\dfrac{25}{64}$。

**(c)** 在上半部分 $y > 0$，因此 $y'' < 0$：斜率随着 $x$ 增加而减小，曲线向下弯曲。在下半部分 $y < 0$，因此 $y'' > 0$，曲线向上弯曲。模块 8 称这种性质为凹凸性。

```check
same(idiff(x**2 + y**2 - 25, y, x, 2), -(x**2 + y**2)/y**3)
steps(-(1*y - x*(-x/y))/y**2, -(y - x*(-x/y))/y**2, -(y**2 + x**2)/y**3)
same(-(y**2 + x**2)/y**3 - (-25/y**3), (25 - x**2 - y**2)/y**3)     # equal wherever x^2 + y^2 = 25
sc = sqrt(25 - x**2)
same(diff(sc, x), -x*(25 - x**2)**Rational(-1, 2))
steps(diff(sc, x, 2), -(25 - x**2)**Rational(-1, 2) - x**2*(25 - x**2)**Rational(-3, 2), -((25 - x**2) + x**2)/(25 - x**2)**Rational(3, 2), -25/(25 - x**2)**Rational(3, 2))
same(diff(sc, x, 2), -25/(25 - x**2)**Rational(3, 2)); same(diff(sc, x, 2).subs(x, 3), -Rational(25, 64))
same(Integer(16)**Rational(3, 2), 64); same(-25/Integer(4)**3, -Rational(25, 64))
```
:::
::::

:::: exercise 悬挂的电缆 {#ex-6-9} ★★★
一根电缆在两根相距 20 米的杆子之间悬挂，两端处于同一高度。以电缆的最低点为 $(0, 10)$，以米为单位，并假设其形状为悬链线 $y = 10\cosh\dfrac{x}{10}$，在区间 $-10 \le x \le 10$ 上。

- (a) 电缆在两端下方下垂了多少？
- (b) 电缆在杆子处的斜率是多少？它与水平面的夹角是多少？
- (c) 抛物线通过最低点和两个端点是 $p(x) = 10 + s\Big(\dfrac{x}{10}\Big)^2$，其中 $s$ 是 (a) 的下垂量。在 $x = 5$ 处，抛物线和悬链线之间的距离是多少？

::: solution
**(a)** 两端点高度为 $y(\pm10) = 10\cosh 1$，最低点高度为 10，因此下垂量为
$$\begin{aligned} s &= 10\cosh 1 - 10 \\ &= 10(\cosh 1 - 1) \approx 5.431 \text{ m}. \end{aligned}$$

**(b)** $y' = 10\sinh\dfrac{x}{10}\cdot\dfrac{1}{10} = \sinh\dfrac{x}{10}$, 所以在 $x = 10$ 处斜率是 $\sinh 1 \approx 1.175$（并且 $-1.175$ 在 $x = -10$ 处）。斜率为 $m$ 的直线与水平线的夹角为 $\arctan m$，因为该角的 $\tan$ 是竖直变化量除以水平变化量。因此，缆线与杆的夹角为 $\arctan(\sinh 1) \approx 0.8658$ 弧度，约等于 $49.6^\circ$，相对于水平线。

**(c)** $p(5) = 10 + s \cdot \dfrac14 \approx 10 + 1.358 = 11.358$，而悬链线的下垂量为 $y(5) = 10\cosh 0.5 \approx 11.276$。它们之间的差异约为 0.081 m，即 8 cm，缆线位于抛物线的下方。在 5.4 m 的下垂量范围内，差异很小，这就是为什么悬挂的缆线看起来像抛物线；但它并不是抛物线。

```check
yh = 10*cosh(x/10)
sg = 10*cosh(1) - 10
same(yh.subs(x, 10) - yh.subs(x, 0), sg); same(sg, 10*(cosh(1) - 1)); rounds(sg, '5.431')
same(diff(yh, x), sinh(x/10)); same(diff(yh, x).subs(x, 10), sinh(1)); rounds(sinh(1), '1.175'); same(diff(yh, x).subs(x, -10), -sinh(1))
rounds(atan(sinh(1)), '0.8658'); rounds(atan(sinh(1))*180/pi, '49.6')
pp_ = 10 + sg*(x/10)**2
same(pp_.subs(x, 0), 10); same(pp_.subs(x, 10), yh.subs(x, 10)); same(pp_.subs(x, -10), yh.subs(x, -10))
rounds(sg/4, '1.358'); rounds(pp_.subs(x, 5), '11.358'); rounds(yh.subs(x, 5), '11.276')
rounds(pp_.subs(x, 5) - yh.subs(x, 5), '0.081'); holds(yh.subs(x, 5) < pp_.subs(x, 5))
rounds(100*(pp_.subs(x, 5) - yh.subs(x, 5)), '8'); rounds(sg, '5.4')                  # 8 cm, over a sag of 5.4 m
```
:::
::::

:::: exercise 反双曲正弦函数 {#ex-6-10} ★★★
- (a) 证明 $\sinh$ 在 $\R$ 上严格递增。然后求解 $\sinh y = x$ 得到 $y$，以表明 $\sinh$ 恰好取遍每个实值一次，且其反函数，即 **反双曲正弦**，为
$$\operatorname{arsinh} x = \ln\big(x + \sqrt{x^2 + 1}\big).$$
- (b) 使用定理 6.4 来证明 $\dfrac{d}{dx}\operatorname{arsinh} x = \dfrac{1}{\sqrt{1 + x^2}}$。
- (c) 直接对 $\ln\big(x + \sqrt{x^2 + 1}\big)$ 求导，并检查是否得到相同结果。

::: solution
**(a)** 设 $x_1 < x_2$。则 $e^{x_1} < e^{x_2}$ 且 $e^{-x_1} > e^{-x_2}$，因此 $e^{x_1} - e^{-x_1} < e^{x_2} - e^{-x_2}$，即 $\sinh x_1 < \sinh x_2$。现在设 $x$ 为任意实数，并解 $\sinh y = x$ 得 $y$：将 $\dfrac{e^y - e^{-y}}{2} = x$ 乘以 $2e^y$ 得

$$e^{2y} - 1 = 2xe^y.$$

用 $u = e^y$ 表示，这是二次方程 $u^2 - 2xu - 1 = 0$，其根为 $u = x \pm \sqrt{x^2 + 1}$。由于 $\sqrt{x^2 + 1} > \sqrt{x^2} = {\abs{x}}$，根 $x - \sqrt{x^2 + 1}$ 为负数，不能为 $e^y$，而 $x + \sqrt{x^2 + 1}$ 为正数。因此，恰好有一个解，

$$y = \ln\big(x + \sqrt{x^2 + 1}\big).$$

每个实数 $x$ 都是 ${\sinh}$ 的一个值，且只取一次，这个 $y$ 是 $\operatorname{arsinh} x$。

**(b)** $\sinh$ 是可导的，因此连续，并且在开区间 $\R$ 上是单射的，且其导数 $\cosh y \ge 1$ 永远不为 0。根据定理 6.4，结合 $y = \operatorname{arsinh} x$，
$$\frac{d}{dx}\operatorname{arsinh} x = \frac{1}{\cosh y}.$$
根据恒等式， $\cosh^2 y = 1 + \sinh^2 y = 1 + x^2$，以及 $\cosh y > 0$，因此 $\cosh y = \sqrt{1 + x^2}$。

**(c)** 根据链式法则， $\dfrac{d}{dx}\sqrt{x^2 + 1} = \dfrac{x}{\sqrt{x^2 + 1}}$，因此
$$\begin{aligned} &\frac{d}{dx}\ln\big(x + \sqrt{x^2 + 1}\big) \\ &\quad= \frac{1 + x/\sqrt{x^2 + 1}}{x + \sqrt{x^2 + 1}} \\ &\quad= \frac{\sqrt{x^2 + 1} + x}{\sqrt{x^2 + 1}\,\big(x + \sqrt{x^2 + 1}\big)} \\ &\quad= \frac{1}{\sqrt{x^2 + 1}}, \end{aligned}$$
与 (b) 相同。Python 和 SymPy 称这个函数为 `asinh`；许多教材写作 $\sinh^{-1}x$。

```check
same(diff(sinh(x), x), cosh(x)); same(function_range(cosh(x), x, S.Reals), Interval(1, oo))
holds(all(exp(p_) < exp(q_) and exp(-p_) > exp(-q_) for p_, q_ in [(-3, -1), (-1, 0), (0, Rational(1, 2)), (2, 5)]))
same(expand(2*exp(y)*(exp(y) - exp(-y))/2), exp(2*y) - 1)
wq = symbols('w_q')
same_set(solve(wq**2 - 2*xr*wq - 1, wq), [xr + sqrt(xr**2 + 1), xr - sqrt(xr**2 + 1)])
same((xr**2 + 1) - xr**2, 1)                                   # so sqrt(x^2 + 1) > sqrt(x^2) = |x|
holds(all(v_ - sqrt(v_**2 + 1) < 0 and v_ + sqrt(v_**2 + 1) > 0 for v_ in (-7, -1, 0, Rational(1, 3), 4)))
same(sinh(log(xr + sqrt(xr**2 + 1))).rewrite(exp), xr); same(asinh(xr).rewrite(log), log(xr + sqrt(xr**2 + 1)))
same(1/cosh(asinh(x)), 1/sqrt(1 + x**2)); same(diff(asinh(x), x), 1/sqrt(1 + x**2))
same(diff(sqrt(x**2 + 1), x), x/sqrt(x**2 + 1))
steps(diff(log(x + sqrt(x**2 + 1)), x), (1 + x/sqrt(x**2 + 1))/(x + sqrt(x**2 + 1)), (sqrt(x**2 + 1) + x)/(sqrt(x**2 + 1)*(x + sqrt(x**2 + 1))), 1/sqrt(x**2 + 1))
```
:::
::::

:::: exercise 拟合曲线与滑动梯子 {#ex-6-11} ★★★
**astroid** 是曲线 $x^{2/3} + y^{2/3} = 1$。考虑其一部分，其中 $x > 0$ 和 $y > 0$。

- (a) 通过隐函数求导找出 $\dfrac{dy}{dx}$。
- (b) 证明该部分上某一点 $(x_0, y_0)$ 的切线在坐标轴上分别截取 $\big(x_0^{1/3}, 0\big)$ 和 $\big(0, y_0^{1/3}\big)$。
- (c) 证明每条这样的切线在坐标轴之间的线段长度为 1。

::: solution
**(a)** 对两边求导，使用实指数的幂法则（定理 6.8）和 $y^{2/3}$ 上的链式法则：
$$\frac23x^{-1/3} + \frac23y^{-1/3}\,y' = 0,$$

因此

$$y' = -\frac{x^{-1/3}}{y^{-1/3}} = -\frac{y^{1/3}}{x^{1/3}}.$$

**(b)** 在 $(x_0, y_0)$ 处的切线为

$$y - y_0 = -\frac{y_0^{1/3}}{x_0^{1/3}}(x - x_0).$$

令 $y = 0$，并将两边乘以 $-x_0^{1/3}/y_0^{1/3}$： $x - x_0 = y_0 \cdot x_0^{1/3}/y_0^{1/3} = x_0^{1/3}y_0^{2/3}$，因此

$$\begin{aligned} x &= x_0 + x_0^{1/3}y_0^{2/3} \\ &= x_0^{1/3}\big(x_0^{2/3} + y_0^{2/3}\big) = x_0^{1/3}, \end{aligned}$$

因为 $x_0^{2/3} + y_0^{2/3} = 1$ 在曲线上。将 $x = 0$ 代入：

$$\begin{aligned} y &= y_0 + \frac{y_0^{1/3}}{x_0^{1/3}}\,x_0 = y_0 + y_0^{1/3}x_0^{2/3} \\ &= y_0^{1/3}\big(y_0^{2/3} + x_0^{2/3}\big) = y_0^{1/3}. \end{aligned}$$

**(c)** 根据勾股定理，点 $\big(x_0^{1/3}, 0\big)$ 与 $\big(0, y_0^{1/3}\big)$ 之间的距离为
$$\begin{aligned} &\sqrt{\big(x_0^{1/3}\big)^2 + \big(y_0^{1/3}\big)^2} \\ &\quad= \sqrt{x_0^{2/3} + y_0^{2/3}} = \sqrt1 = 1. \end{aligned}$$
反之，如果 $p > 0$、$q > 0$ 和 $p^2 + q^2 = 1$，则点 $\big(p^3, q^3\big)$ 在 astroid 上，且由 (b) 可知其切线在坐标轴上分别交于 $(p, 0)$ 和 $(0, q)$。因此，长度为 1 的梯子从墙滑下，脚在地面上，会在每个位置接触 astroid：astroid 是梯子扫过的区域的边界。

```check
x0p, y0p = symbols('x_0 y_0', positive=True)
xq_, yq_ = symbols('x_q y_q', positive=True)
same(idiff(xq_**Rational(2, 3) + yq_**Rational(2, 3) - 1, yq_, xq_), -yq_**Rational(1, 3)/xq_**Rational(1, 3))
same(diff(xq_**Rational(2, 3), xq_), Rational(2, 3)*xq_**Rational(-1, 3))
tan_ = y0p - y0p**Rational(1, 3)/x0p**Rational(1, 3)*(x - x0p)
xint = solve(tan_, x)[0]; yint = tan_.subs(x, 0)
same(y0p*x0p**Rational(1, 3)/y0p**Rational(1, 3), x0p**Rational(1, 3)*y0p**Rational(2, 3))
same(xint, x0p + x0p**Rational(1, 3)*y0p**Rational(2, 3)); same(expand(x0p**Rational(1, 3)*(x0p**Rational(2, 3) + y0p**Rational(2, 3))), xint)
same(yint, y0p + y0p**Rational(1, 3)/x0p**Rational(1, 3)*x0p); same(yint, y0p + y0p**Rational(1, 3)*x0p**Rational(2, 3))
same(expand(yint), expand(y0p**Rational(1, 3)*(y0p**Rational(2, 3) + x0p**Rational(2, 3))))
for p_, q_ in ((Rational(3, 5), Rational(4, 5)), (Rational(5, 13), Rational(12, 13)), (Rational(8, 17), Rational(15, 17))):
    pt = {x0p: p_**3, y0p: q_**3}                                          # points of the astroid: p^2 + q^2 = 1
    same((p_**3)**Rational(2, 3) + (q_**3)**Rational(2, 3), 1)
    same(xint.subs(pt), p_); same(yint.subs(pt), q_); same(sqrt(xint.subs(pt)**2 + yint.subs(pt)**2), 1)
```
:::
::::

:::: exercise 两条路线，一个数字 {#ex-6-12} ★★★
第六章 6.1 节将 $m(a)$ 定义为 $a^x$ 在 $x = 0$ 处的斜率，第六章 6.3 节证明了 $\big(1 + \tfrac{x}{n}\big)^n \to e^x$ 等于 $n \to \infty$。

- (a) 设 $a > 0$ 和 $b > 0$，并假设 $m(a)$ 和 $m(b)$ 存在。不用对数，证明 $m(ab)$ 存在且 $m(ab) = m(a) + m(b)$。 （提示：$(ab)^h = a^hb^h$。为什么 $a^h$ 在 $h \to 0$ 趋于 1？）
- (b) 使用 (a)，定理 6.2 以及第 6.1 节中 $m(2) \approx 0.6931$ 和 $m(3) \approx 1.0986$ 的估计式，估算 $m(6)$ 和 $m\big(\tfrac32\big)$，不使用计算器。 (a) 看起来像哪一条对数法则？为什么这不是偶然的？
- (c) 银行 A 每年支付 6% 的年利率，按月复利；银行 B 每年支付 5.9% 的年利率，连续复利。一年后，哪家银行将 £1000 转换为更多的金额？多出多少？

::: solution
**(a)** 对于 $h \ne 0$，在分子中减去并加上 $a^h$，并将分数拆开：

$$\begin{aligned} &\frac{(ab)^h - 1}{h} \\ &\quad= \frac{a^hb^h - a^h + a^h - 1}{h} \\ &\quad= a^h\cdot\frac{b^h - 1}{h} + \frac{a^h - 1}{h}. \end{aligned}$$

如同 $h \to 0$，右边的两个分数分别趋近于 $m(b)$ 和 $m(a)$。因子 $a^h$ 趋近于 $a^0 = 1$：由于 $m(a)$ 存在，$a^x$ 在 0 处可导，因此在该点连续（模块 4）。根据和与积的极限法则，右边趋近于 $1\cdot m(b) + m(a)$。因此 $m(ab)$ 存在，且 $m(ab) = m(a) + m(b)$。

**(b)** 由 (a)，$m(6) = m(2 \cdot 3) = m(2) + m(3) \approx 0.6931 + 1.0986 = 1.7917$。由定理 6.2 与 $c = -1$，$m\big(\tfrac12\big) = -m(2)$，因此再次由 (a) 得到

$$\begin{aligned} m\big(\tfrac32\big) &= m(3) + m\big(\tfrac12\big) \\ &= m(3) - m(2) \approx 0.4055. \end{aligned}$$

计算器给出 $\ln 6 \approx 1.7918$ 和 $\ln 1.5 \approx 0.4055$：除了 $m(6)$ 的最后一位数字外，其余相同，其中两个估计值的舍入误差相加。第 (a) 部分具有对数第一法则的形式，$\ln(xy) = \ln x + \ln y$，而定理 6.2 具有第三法则的形式，$\ln\big(x^r\big) = r\ln x$。这并非偶然：由定理 6.3，$m(a) = \ln a$ 对于每一个底数 $a$ 都成立。

**(c)** 银行 A 每月将余额乘以 $1 + \tfrac{0.06}{12} = 1.005$，因此 1000 英镑一年后变成 $1000 \cdot 1.005^{12} \approx 1061.68$ 英镑。对银行 B，用定理 6.6 和 $x = 0.059$ 得 $1000e^{0.059} \approx 1060.78$ 英镑，如例 6.4。银行 A 的收益约多 0.90 英镑。由每月复利改为连续复利所增加的收益，小于年利率提高 0.1 个百分点所增加的收益。在 5.9% 的利率下，连续复利只多赚约 0.15 英镑。

```check
aq_, bq_ = symbols('a b', positive=True)
same((aq_*bq_)**h, aq_**h*bq_**h)
steps(((aq_*bq_)**h - 1)/h, (aq_**h*bq_**h - aq_**h + aq_**h - 1)/h, aq_**h*(bq_**h - 1)/h + (aq_**h - 1)/h)
limit_is(aq_**h, h, 0, 1); limit_is(((aq_*bq_)**h - 1)/h, h, 0, log(aq_) + log(bq_))
same(Rational(6931, 10000) + Rational(10986, 10000), Rational(17917, 10000)); same(Rational(10986, 10000) - Rational(6931, 10000), Rational(4055, 10000))
limit_is((Rational(1, 2)**h - 1)/h, h, 0, -log(2))                         # m(1/2) = -m(2)
rounds(log(6), '1.7918'); rounds(log(Rational(3, 2)), '0.4055'); same(log(6), log(2) + log(3)); same(log(Rational(3, 2)), log(3) - log(2))
same(1 + Rational(6, 100)/12, Rational(1005, 1000))
bankA, bankB = 1000*Rational(1005, 1000)**12, 1000*exp(Rational(59, 1000)); monthly59 = 1000*(1 + Rational(59, 1000)/12)**12
rounds(bankA, '1061.68'); rounds(bankB, '1060.78'); rounds(bankA - bankB, '0.90')
same(limit(1000*(1 + Rational(59, 1000)/n)**n, n, oo), bankB)
rounds(bankB - monthly59, '0.15'); holds(bankB - monthly59 < bankA - monthly59)      # continuous vs monthly at 5.9%, against the extra 0.1%
```
:::
::::

## 自测 {#quiz}

```quiz
? $\dfrac{d}{dx}\big(2^x\big)$等于
- [x] $2^x\ln 2$
- [ ] $x\,2^{x-1}$
- [ ] $2^x$
- [ ] $\dfrac{2^x}{\ln 2}$
> 根据定理 6.3，$(a^x)' = a^x\ln a$。$x\,2^{x-1}$ 应用幂法则，该法则要求变量在底数中，而不是在指数中。$2^x$ 忽略了因子 $\ln 2$，该因子仅在底数 $e$ 时为 1。$\dfrac{2^x}{\ln 2}$ 是一个导数为 $2^x$（第 10 模块）的函数，而不是 $2^x$ 的导数。

? $\dfrac{d}{dx}\cosh x$等于
- [ ] $-\sinh x$
- [x] $\sinh x$
- [ ] $\cosh x$
- [ ] $\dfrac{1}{\cosh^2 x}$
> $\cosh x = \tfrac12\big(e^x + e^{-x}\big)$，因此其导数为 $\tfrac12\big(e^x - e^{-x}\big) = \sinh x$。负号属于 $(\cos x)' = -\sin x$，而不是双曲函数；$\cosh x$ 是 $\sinh x$ 的导数；$1/\cosh^2 x$ 是 $\tanh x$ 的导数。

? $\dfrac{d}{dx}\ln\big(x^2 + 1\big)$等于
- [ ] $\dfrac{1}{x^2 + 1}$
- [ ] $\dfrac{1}{2x}$
- [ ] $2x\ln\big(x^2 + 1\big)$
- [x] $\dfrac{2x}{x^2 + 1}$
> 根据链式法则，$(\ln u)' = u'/u$，其中$u = x^2 + 1$和$u' = 2x$。$\dfrac{1}{x^2 + 1}$遗漏了因子$u'$；$\dfrac{1}{2x}$是$1/u'$；而$2x\ln\big(x^2 + 1\big)$将$\ln$视为其自身的导数。

? $f$ 在 $\R$ 上连续且单射，带入 $f(1) = 3$ 和 $f'(1) = 4$。则 $(f^{-1})'(3)$ 等于
- [ ] $4$
- [ ] $\dfrac13$
- [x] $\dfrac14$
- [ ] $-\dfrac49$
> 点$(1, 3)$关于函数$f$的图像对称于点$(3, 1)$关于函数$f^{-1}$的图像，且斜率互为倒数：$(f^{-1})'(3) = 1/f'(1) = \tfrac14$。4是$f$的斜率，而非其反函数的斜率；$\tfrac13$等于$1/f(1)$；且$-\tfrac49 = -f'(1)/f(1)^2$是$1/f$在1处的导数，这导致将$f^{-1}$与$1/f$混淆。

? $\arcsin\Big(\sin\dfrac{5\pi}{6}\Big)$等于
- [ ] $\dfrac{5\pi}{6}$
- [x] $\dfrac{\pi}{6}$
- [ ] $\dfrac12$
- [ ] $-\dfrac{\pi}{6}$
> $\sin\dfrac{5\pi}{6} = \sin\Big(\pi - \dfrac{\pi}{6}\Big) = \dfrac12$与$\arcsin\dfrac12 = \dfrac{\pi}{6}$，$[-\pi/2, \pi/2]$中正弦值为$\tfrac12$的角。$\dfrac{5\pi}{6}$不在该区间内，因此$\arcsin$从不返回它；$\tfrac12$是正弦值而非角度；且$-\dfrac{\pi}{6}$的正弦值为$-\tfrac12$。

? 在圆 $x^2 + y^2 = 25$ 上，点 $(-3, 4)$ 处的斜率 $\dfrac{dy}{dx}$ 为
- [x] $\dfrac34$
- [ ] $-\dfrac34$
- [ ] $\dfrac43$
- [ ] $-\dfrac43$
> 隐含地，$2x + 2y\,y' = 0$，因此 $y' = -x/y = -(-3)/4 = \tfrac34$：在圆的左上部分，曲线向右上升。$-\tfrac34$ 是 $(3, 4)$ 处的斜率；$-\tfrac43$ 是 $y/x$，即指向 $(-3, 4)$ 的半径斜率，该半径垂直于切线；$\tfrac43$ 是 $-y/x$，即分数 $-x/y$ 翻转后的结果。

? 对于$x > 0$，$\dfrac{d}{dx}\big(x^x\big)$等于
- [ ] $x\cdot x^{x-1}$
- [ ] $x^x\ln x$
- [ ] $x^x$
- [x] $x^x(\ln x + 1)$
> 用 $\ln y = x\ln x$，$\dfrac{y'}{y} = \ln x + 1$。$x\cdot x^{x-1}$ 把幂法则当作指数为常数来使用，$x^x\ln x$ 把指数法则当作底数为常数来使用：正确答案是它们的和。$x^x$ 是 $x\cdot x^{x-1}$ 简化后的形式。

? 一个量在$t$年后变为$y = 50e^{-0.2t}$。
- [ ] 2.5 年
- [ ] 5 年
- [x] $\dfrac{\ln 2}{0.2} \approx 3.47$ 年
- [ ] 25 年
> 解 $e^{-0.2T} = \tfrac12$: $0.2T = \ln 2$, 所以 $T = \ln 2/0.2 \approx 3.47$, 无论起始量是多少。5 年是 $1/0.2$, 落到起始量的 $1/e$ 所需的时间，而不是降到一半；2.5 年是 $0.5/0.2$, 如果数量以起始速率持续下降所需的时间；而 25 是起始量的一半，不是时间。
```

```check
same(diff(2**x, x), 2**x*log(2)); same(diff(2**x/log(2), x), 2**x)
same(diff(cosh(x), x), sinh(x)); same(diff(sinh(x), x), cosh(x)); same(diff(tanh(x), x), 1/cosh(x)**2)
same(diff(log(x**2 + 1), x), 2*x/(x**2 + 1))
same(Rational(1, 4), 1/Integer(4)); same(-Rational(4, 9), -4/Integer(3)**2)
same(sin(5*pi/6), Rational(1, 2)); same(asin(sin(5*pi/6)), pi/6); same(sin(-pi/6), -Rational(1, 2))
same((-x/y).subs({x: -3, y: 4}), Rational(3, 4)); same((y/x).subs({x: -3, y: 4}), -Rational(4, 3)); same((-y/x).subs({x: -3, y: 4}), Rational(4, 3))
same(diff(xp**xp, xp), xp**xp*(log(xp) + 1)); same(xp*xp**(xp - 1), xp**xp)
same(solve(exp(-Rational(2, 10)*Tp) - Rational(1, 2), Tp), [log(2)/Rational(2, 10)]); rounds(log(2)/Rational(2, 10), '3.47')
same(exp(-Rational(2, 10)*5), exp(-1)); same(50*(1 - Rational(2, 10)*Rational(25, 10)), 25)
```
