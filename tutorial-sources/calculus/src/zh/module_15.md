---
title: 幂级数与泰勒级数
part: 4
lead: 用无限项的多项式来表示函数。你将求幂级数的收敛范围，构造常用函数的幂级数，并用泰勒定理控制近似误差。用级数计算 e、π 和 ln 2，求极限，简化物理公式，并理解计算机如何计算正弦。最后，把指数函数、正弦和余弦的级数组合起来，得到欧拉公式。
minutes: 270
needs: 模块 1 到 14，特别是求导法则（模块 4 到 7）、中值定理（模块 8）以及使用比值判别法的级数（模块 14）
goals:
  - 使用比值判别法求幂级数的收敛半径和收敛区间，并分别检查端点
  - 从几何级数构建幂级数，并逐项进行求导和积分
  - 从导数找到泰勒级数和麦克劳林级数，并了解标准级数及其收敛范围
  - 使用泰勒定理对泰勒多项式的误差进行估计，并证明 $e^x$、$\sin x$ 和 $\cos x$ 等于其级数
  - 使用级数计算常数和极限，并用于物理和数学库中的近似
  - 从级数推导欧拉公式 $e^{i\theta} = \cos\theta + i\sin\theta$，并用它解释微分方程的振荡解
---

## 幂级数 {#power-series}

模块 14 总结了几何级数：对于每一个 $x$ 与 $\abs{x} < 1$，

$$1 + x + x^2 + x^3 + \cdots = \frac{1}{1 - x}.$$

将其视为 $x$ 的函数，左边是一个永不结束的多项式。其部分和

$$\begin{aligned} S_n(x) &= 1 + x + x^2 + \cdots + x^n \\ &= \frac{1 - x^{n+1}}{1 - x} \qquad (x \ne 1) \end{aligned}$$

普通多项式，对于每个 $x$ 在 $-1$ 和 1 之间，当 $n$ 增大时，它们趋近于 $1/(1 - x)$。图 15.1（左）显示了它们：在区间 $(-1, 1)$ 内，多项式越来越贴近曲线；在区间外，它们则逐渐偏离。表格跟踪了 $x$ 的三个值：

```valuetable
n = 1, 2, 5, 10, 20, 50
$S_n(0.5)$ = (1 - (1/2)**(n + 1))/(1 - 1/2)
$S_n(-0.9)$ = (1 - (-9/10)**(n + 1))/(1 + 9/10)
$S_n(1.1)$ = (1 - (11/10)**(n + 1))/(1 - 11/10)
digits = 6
---
n | S_n(0.5) | S_n(-0.9) | S_n(1.1)
1 | 1.5 | 0.1 | 2.1
2 | 1.75 | 0.91 | 3.31
5 | 1.96875 | 0.24661 | 7.71561
10 | 1.99902 | 0.691479 | 18.5312
20 | 2.00000 | 0.583905 | 64.0025
50 | 2.00000 | 0.528757 | 1281.30
```

在 $x = 0.5$ 处，部分和迅速趋近于 $1/(1 - 0.5) = 2$。在 $x = -0.9$ 处，它们在 $1/1.9 \approx 0.526316$ 上下摆动并缓慢趋近。在 $x = 1.1$ 处，它们趋于无限大，尽管 $1/(1 - 1.1) = -10$ 是一个很好的数：在那里，级数与函数分道扬镳。

```check
S_geo = lambda X, N: sum(X**j for j in range(N + 1))
for N_ in range(8):
    same(S_geo(x, N_), (1 - x**(N_ + 1))/(1 - x))
same(1/(1 - Rational(1, 2)), 2); rounds(1/Rational(19, 10), '0.526316'); same(1/(1 - Rational(11, 10)), -10)
holds(S_geo(Rational(-9, 10), 20) > Rational(10, 19)); holds(S_geo(Rational(-9, 10), 21) < Rational(10, 19))   # above, then below
holds(S_geo(Rational(11, 10), 50) > 1000)
```

::: figure id=fig-15-1
左：对于 $n = 1$、2、5 和 10 的部分和 $S_n(x) = 1 + x + \cdots + x^n$，以 $y = 1/(1 - x)$（蓝色）表示。在绿色带内，即 $-1 < x < 1$，它们趋近于曲线；在绿色带外则不趋近。右：对于 $m = 1$、2、5 和 20 的部分和 $1 - x^2 + x^4 - \cdots \pm x^{2m}$，仅在 $-1 < x < 1$ 处趋近于 $y = 1/(1 + x^2)$，尽管该函数在整个实线上都是光滑的（第 15.2 节）。
:::

::: definition 幂级数
形如以下形式的级数称为**以 $a$ 为中心的幂级数**（亦称**在 $a$ 处的幂级数**）：

$$\begin{aligned} &\sum_{n=0}^{\infty} c_n (x - a)^n \\ &= c_0 + c_1(x - a) + c_2(x - a)^2 + \cdots, \end{aligned}$$

其中 $x$ 是变量，**系数** $c_0, c_1, c_2, \dots$ 是常数。每给定一个 $x$，便得到一个收敛或发散的数项级数。在收敛的地方，级数的和是 $x$ 的函数。
:::

级数为“从 $n = 0$ 到无穷大的级数，每一项为 $c_n$ 乘以 $x$ 减去 $a$ 的 $n$ 次方”。其首项为 $c_0(x - a)^0$，其中 $(x - a)^0$ 表示 1，即使 $x = a$。因此，每个幂级数在其中心处收敛，等于 $c_0$，因为在该点所有其他项均为 0。几何级数是中心为 0 且每一项均为 $c_n = 1$ 的幂级数；多项式是一个幂级数，其系数从某一点开始为 0。

### 幂级数的收敛范围 {#convergence}

几何级数在其中心附近的一个区间内收敛，在该区间外发散。每一个幂级数都具有这种性质。

::: theorem 幂级数的收敛范围
对于幂级数 $\sum c_n(x - a)^n$，以下三种情形恰有一种成立：

1. 它仅在 $x = a$ 处收敛；
2. 对于每一个实数 $x$，它绝对收敛；
3. 存在数 $R > 0$，使级数在 $\abs{x - a} < R$ 时绝对收敛，在 $\abs{x - a} > R$ 时发散。
:::

::: proof
证明的核心是将其与几何级数进行比较。假设级数在某个 $x_1 \ne a$ 处收敛，令 $x$ 更接近 $a$：即 $\abs{x - a} < \abs{x_1 - a}$。收敛级数的项趋于 0（否则根据第 14 模块的发散性检验，该级数将发散），因此项 $c_n(x_1 - a)^n$ 趋于 0，且有界：从某个 $n$ 开始，它们介于 $-1$ 和 1 之间，而前面有限个项的绝对值不大于这些项的最大值。因此存在一个数 $M$，使得对于每一个 $n$，都有 $\abs{c_n (x_1 - a)^n} \le M$。由于 $q = \abs{x - a}/\abs{x_1 - a}$ 小于 1，

$$\abs{c_n (x - a)^n} = \abs{c_n (x_1 - a)^n}\, q^n \le M q^n.$$

几何级数$\sum Mq^n$收敛，因此由比较判别法知$\sum \abs{c_n (x - a)^n}$收敛：该级数在$x$处绝对收敛。反之，若级数在某个$x_2$处发散，则它在每一个比$x_2$离$a$更远的$x$处均发散，因为在那里的收敛将迫使在$x_2$处收敛。

现在考察级数收敛的所有点 $x_1$ 对应的距离 $\abs{x_1 - a}$。如果只有距离 0，就属于第一种情形。若这些距离任意大，每个 $x$ 到 $a$ 的距离就比某个收敛点到中心的距离小，属于第二种情形。否则这些距离有界，因而有**最小上界** $R$，也就是不小于其中每个数的最小值。实数的完备性保证该数存在，这也是模块 14 单调收敛定理的基础。因为级数在某个 $x_1 \ne a$ 处收敛，所以 $R > 0$。若 $\abs{x - a} < R$，则 $\abs{x - a}$ 不是上界，存在一个收敛点 $x_1$ 满足 $\abs{x - a} < \abs{x_1 - a}$，所以级数在 $x$ 处绝对收敛。若 $\abs{x - a} > R$，级数在 $x$ 处发散，因为 $\abs{x - a}$ 大于每个收敛点到中心的距离。
:::

```check
cA, dA, d1A = symbols('C d d_1', positive=True)        # |c_n|, |x - a| and |x_1 - a|
same(cA*d1A**n*(dA/d1A)**n, cA*dA**n)                  # |c_n (x1 - a)^n| q^n = |c_n (x - a)^n|
qA = symbols('q', positive=True)
same(summation(qA**n, (n, 0, oo)).args[0][0], 1/(1 - qA))   # the geometric series sum M q^n converges for q < 1
```

::: definition 收敛半径与收敛区间
定理 15.1 中的数 $R$ 称为级数的**收敛半径**。第一种情形为 $R = 0$，第二种情形为 $R = \infty$。使级数收敛的全部 $x$ 构成它的**收敛区间**。
:::

当 $0 < R < \infty$ 时，收敛区间从 $a - R$ 延伸到 $a + R$。定理 15.1 并未判定两个**端点** $x = a - R$ 和 $x = a + R$。在各端点处，级数都可能收敛，也可能发散。因此收敛区间是 $(a - R, a + R)$、$[a - R, a + R)$、$(a - R, a + R]$、$[a - R, a + R]$ 中的一种。下面的例子包含这四种情形。

### 求收敛半径 {#radius}

模块 14 中的比值判别法通常用于找出 $R$。对于项 $c_n(x - a)^n$，对于每一个 $c_n \ne 0$ 和 $x \ne a$，连续项的比值是

$$\abs{\frac{c_{n+1}(x - a)^{n+1}}{c_n (x - a)^n}} = \abs{\frac{c_{n+1}}{c_n}}\,\abs{x - a}.$$

如果 $\abs{c_{n+1}/c_n}$ 趋近于极限 $L$，则该比值趋近于 $L\abs{x - a}$，比值判别法给出绝对收敛当 $L\abs{x - a} < 1$，发散当 $L\abs{x - a} > 1$。因此 $R = 1/L$，当 $R = \infty$ 若 $L = 0$，当 $R = 0$ 若 $\abs{c_{n+1}/c_n} \to \infty$。在端点处，比值的极限恰好为 1，此时比值判别法无结论：需分别测试，使用 模块 14 中的其他测试方法。

::: example 三种收敛区间
求 (a) $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n}$ 和 (b) $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n^2}$ 的收敛半径和收敛区间，并与几何级数 $\sum x^n$ 进行比较。

**(a)** 此处 $c_n = 1/n$，因此

$$\abs{\frac{c_{n+1}}{c_n}} = \frac{n}{n + 1} \to 1,$$

且 $R = 1$：级数在 $\abs{x} < 1$ 处绝对收敛，在 $\abs{x} > 1$ 处发散。在 $x = 1$ 处为调和级数 $\sum 1/n$，其发散。在 $x = -1$ 处为 $\sum (-1)^n/n$，根据交错级数判别法收敛，因为大小 $1/n$ 递减趋于 0。收敛区间为 $[-1, 1)$。

**(b)** 现在 $\abs{c_{n+1}/c_n} = n^2/(n + 1)^2 \to 1$，所以再次 $R = 1$。在 $x = \pm 1$ 处，绝对值的级数是 $\sum 1/n^2$，一个收敛的 $p$-级数，因此该级数在两个端点处都绝对收敛。区间是 $[-1, 1]$。

几何级数也有收敛半径 1，并且在 $x = \pm 1$ 处其项，1 或 $(-1)^n$，不趋于 0，因此其区间是 $(-1, 1)$。三个收敛半径相同的级数有三个不同的区间：端点必须始终检查。

```check
limit_is((1/(n + 1))/(1/n), n, oo, 1); same((1/(n + 1))/(1/n), n/(n + 1))
holds(Sum(1/n, (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**n/n, (n, 1, oo)).is_convergent())
same((1/(n + 1)**2)/(1/n**2), n**2/(n + 1)**2); limit_is(n**2/(n + 1)**2, n, oo, 1)
holds(Sum(1/n**2, (n, 1, oo)).is_convergent())
nI = symbols('n', integer=True, nonnegative=True)
same(Abs((-1)**nI), 1); holds(Sum((-1)**n, (n, 0, oo)).is_convergent() == False)
```
:::

::: example 收敛半径 $\infty$ 和收敛半径 0
求 $\displaystyle\sum_{n=0}^{\infty} \frac{x^n}{n!}$ 和 $\displaystyle\sum_{n=0}^{\infty} n!\,x^n$ 的收敛半径，其中 $0! = 1$。

对于第一个， $c_n = 1/n!$，并且由于 $(n + 1)! = (n + 1)\,n!$，

$$\abs{\frac{c_{n+1}}{c_n}} = \frac{n!}{(n + 1)!} = \frac{1}{n + 1} \to 0.$$

项的比值趋于 $0 \cdot \abs{x} = 0 < 1$ 对于每一个 $x$：该级数在每一个 $x$ 处绝对收敛，且 $R = \infty$。对于第二个， $\abs{c_{n+1}/c_n} = (n + 1)!/n! = n + 1 \to \infty$。对于每一个 $x \ne 0$，项的比值 $(n + 1)\abs{x}$ 趋于无穷大，因此级数发散，且 $R = 0$：它仅在其中心收敛。第一个级数在第 15.4 节中再次出现，作为 $e^x$ 级数。

```check
nP = symbols('n', integer=True, nonnegative=True)
same(factorial(nP + 1), (nP + 1)*factorial(nP)); same(factorial(0), 1)
same(factorial(nP)/factorial(nP + 1), 1/(nP + 1)); limit_is(1/(n + 1), n, oo, 0)
same(factorial(nP + 1)/factorial(nP), nP + 1); limit_is((n + 1)*Rational(1, 1000), n, oo, oo)   # even at x = 0.001
holds(Sum(x**n/factorial(n), (n, 0, oo)).subs(x, 7).is_convergent())
```
:::

::: example 以 3 为中心的级数
求 $\displaystyle\sum_{n=1}^{\infty} \frac{(-1)^n (x - 3)^n}{n\,2^n}$ 的收敛区间。

此处 $c_n = \dfrac{(-1)^n}{n\,2^n}$，且

$$\begin{aligned} \abs{\frac{c_{n+1}}{c_n}} &= \frac{n\,2^n}{(n + 1)\,2^{n+1}} \\ &= \frac{n}{2(n + 1)} \to \frac12. \end{aligned}$$

所以 $R = 2$：当 $\abs{x - 3} < 2$ 时，级数绝对收敛，即 $1 < x < 5$，当 $\abs{x - 3} > 2$ 时，级数发散。在 $x = 5$ 处， $(x - 3)^n = 2^n$，且级数为 $\sum (-1)^n/n$，根据交错级数判别法收敛。在 $x = 1$ 处， $(x - 3)^n = (-2)^n = (-1)^n 2^n$，且项为 $\dfrac{(-1)^n(-1)^n 2^n}{n\,2^n} = \dfrac1n$：即调和级数，它发散。收敛区间为 $(1, 5]$，以 3 为中心，收敛半径为 2。

```check
nQ = symbols('n', integer=True, positive=True)
cq = lambda N: (-1)**N/(N*2**N)
same(Abs(cq(nQ + 1)/cq(nQ)), nQ/(2*(nQ + 1))); limit_is(n/(2*(n + 1)), n, oo, Rational(1, 2))
same(solve_univariate_inequality(Abs(x - 3) < 2, x, relational=False), Interval.open(1, 5))
same(cq(nQ)*2**nQ, (-1)**nQ/nQ); holds(Sum((-1)**n/n, (n, 1, oo)).is_convergent())        # x = 5
same(cq(nQ)*(-2)**nQ, 1/nQ); holds(Sum(1/n, (n, 1, oo)).is_convergent() == False)          # x = 1
```
:::

::: pitfall
比值审敛法的两张卡片。它使用绝对值：例15.3中的条件是 $\abs{x - 3} < 2$，一个以3为中心的区间，不是 $x - 3 < 2$，后者会包含所有 $x < 5$。在端点处，当比值恰好趋于1时，该审敛法无从判断：在收敛区间内或外声明端点而不进行检验，是收敛区间中最常见的错误。
:::

## 函数作为幂级数 {#functions-as-series}

第15.1节从一个级数出发，求得了它的和。现在反过来：给定一个函数，找出一个幂级数，使其和为该函数。几何级数是许多级数的来源。对于每一个数 $u$ 满足 $\abs{u} < 1$，

$$\frac{1}{1 - u} = \sum_{n=0}^{\infty} u^n = 1 + u + u^2 + \cdots,$$

并且 $u$ 可以被任何关于 $x$ 的表达式代替，前提是条件 $\abs{u} < 1$ 也被相应地转换。对于 $u = -x$，当 $\abs{x} < 1$ 时，

$$\begin{aligned} \frac{1}{1 + x} &= 1 - x + x^2 - x^3 + \cdots \\ &= \sum_{n=0}^\infty (-1)^n x^n. \end{aligned}$$

对于 $u = -x^2$，它恰好在 $\abs{u} < 1$ 成立时，满足 $\abs{x} < 1$。

$$\begin{aligned} \frac{1}{1 + x^2} &= 1 - x^2 + x^4 - x^6 + \cdots \\ &= \sum_{n=0}^\infty (-1)^n x^{2n}. \end{aligned}$$

在 $x = \pm 1$ 处，两个级数的项的大小都是 1，且不趋于 0，因此两个收敛区间都是 $(-1, 1)$。第二个情况令人惊讶。函数 $1/(1 + x^2)$ 在整个实数轴上都有定义且光滑， $\pm 1$ 处也没有特别之处，但其级数却在该点处不再收敛（图 15.1，右图）。原因在于复数平面，第 15.7 节将揭示这一点。

```check
same(series(1/(1 + x), x, 0, 9).removeO(), sum((-1)**j*x**j for j in range(9)))
same(series(1/(1 + x**2), x, 0, 18).removeO(), sum((-1)**j*x**(2*j) for j in range(9)))
g_u = Sum(u**n, (n, 0, oo)).doit()
same(g_u.args[0][0], 1/(1 - u)); same(g_u.args[0][0].subs(u, -x), 1/(1 + x)); same(g_u.args[0][0].subs(u, -x**2), 1/(1 + x**2))
same(solve_univariate_inequality(Abs(-x**2) < 1, x, relational=False), Interval.open(-1, 1))
```

::: example 几何级数衍生的级数
为每个函数找到一个幂级数，以所给点为中心，并写出其收敛区间：

- (a) $\dfrac{1}{2 - x}$，以 0 为中心；
- (b) $\dfrac{x}{1 - x^2}$，以 0 为中心；
- (c) $\dfrac1x$，以 1 为中心。

**(a)** 通过提取因子 2，使 $1/(1 - u)$ 中的 1 显现出来：

$$\begin{aligned} \frac{1}{2 - x} &= \frac12\cdot\frac{1}{1 - x/2} = \frac12\sum_{n=0}^\infty \Big(\frac{x}{2}\Big)^n \\ &= \sum_{n=0}^\infty \frac{x^n}{2^{n+1}} \\ &= \frac12 + \frac{x}{4} + \frac{x^2}{8} + \cdots. \end{aligned}$$

这需要用到 $\abs{x/2} < 1$，即 $\abs{x} < 2$。在 $x = \pm 2$ 处，项的大小为 $\tfrac12$ 且不趋于 0，因此收敛区间为 $(-2, 2)$。

**(b)** 用 $u = x^2$，$\dfrac{1}{1 - x^2} = \sum x^{2n}$ 对于 $\abs{x} < 1$。将每一项乘以 $x$ 就是将和乘以 $x$，因此对于 $\abs{x} < 1$

$$\begin{aligned} \frac{x}{1 - x^2} &= \sum_{n=0}^\infty x^{2n+1} \\ &= x + x^3 + x^5 + \cdots. \end{aligned}$$

在 $x = \pm 1$ 处每一项都是 $\pm 1$，因此区间是 $(-1, 1)$。

**(c)** 在1处展开的级数是关于$x - 1$的幂级数。写出$x = 1 + (x - 1)$并使用$u = -(x - 1)$：

$$\frac1x = \frac{1}{1 + (x - 1)} = \sum_{n=0}^\infty (-1)^n (x - 1)^n,$$

对于$\abs{x - 1} < 1$，即$0 < x < 2$。在$x = 0$和$x = 2$处，各项的大小为1，因此区间为$(0, 2)$：以1为中心，半径为1。

```check
steps(1/(2 - x), Rational(1, 2)*1/(1 - x/2))
same(series(1/(2 - x), x, 0, 9).removeO(), sum(x**j/2**(j + 1) for j in range(9)))
same([x**j/2**(j + 1) for j in range(3)], [Rational(1, 2), x/4, x**2/8])
nR = symbols('n', integer=True, nonnegative=True)
same(Abs((2)**nR/2**(nR + 1)), Rational(1, 2)); same(Abs((-2)**nR/2**(nR + 1)), Rational(1, 2))
same(series(x/(1 - x**2), x, 0, 14).removeO(), sum(x**(2*j + 1) for j in range(7)))
same(series(1/x, x, 1, 9).removeO(), sum((-1)**j*(x - 1)**j for j in range(9)))
same(1/(1 + (x - 1)), 1/x); same(solve_univariate_inequality(Abs(x - 1) < 1, x, relational=False), Interval.open(0, 2))
```
:::

一个函数可以关于不同的中心有不同的级数。关于 0，$\dfrac{1}{2 - x} = \sum x^n/2^{n+1}$；关于 1，$\dfrac{1}{2 - x} = \dfrac{1}{1 - (x - 1)} = \sum (x - 1)^n$，对于 $\abs{x - 1} < 1$。每个级数在其各自的区间上描述该函数。

```check
same(series(1/(2 - x), x, 1, 9).removeO(), sum((x - 1)**j for j in range(9))); same(1/(1 - (x - 1)), 1/(2 - x))
```

::: pitfall
带替换的两张纸。丢失前面的因子：$\dfrac{1}{2 - x}$ 是 $\dfrac12\sum (x/2)^n$，且没有 $\tfrac12$ 时，该级数是 $\dfrac{2}{2 - x}$ 的级数。忘记翻译条件：$\sum (x/2)^n$ 在 $\abs{x} < 2$ 时收敛，而非 $\abs{x} < 1$。在一点处的快速测试可捕获两者：在 $x = 1$ 处，例 15.4(a) 的级数是 $\tfrac12 + \tfrac14 + \tfrac18 + \cdots = 1$，且确实为 $\dfrac{1}{2 - 1} = 1$。

```check
same(summation(Rational(1, 2)**(n + 1), (n, 0, oo)), 1); same(1/(2 - 1), 1)
same(summation(Rational(1, 2)**n, (n, 0, oo)), 2/(2 - 1))
```
:::

## 级数的求导与积分 {#term-by-term}

在收敛区间内，幂级数可以像多项式一样处理：逐项求导和积分。

::: theorem 逐项求导与积分
设 $\sum c_n(x - a)^n$ 的收敛半径为 $R > 0$（可能为 $R = \infty$），当 $\abs{x - a} < R$ 时定义

$$f(x) = \sum_{n=0}^\infty c_n (x - a)^n.$$

对于满足 $\abs{x - a} < R$ 的每个 $x$，有以下结论：

1. $f$ 在 $x$ 处可导，且 $\displaystyle f'(x) = \sum_{n=1}^\infty n\,c_n (x - a)^{n-1}$；
2. $\displaystyle \int_a^x f(t)\,dt = \sum_{n=0}^\infty \frac{c_n}{n + 1}(x - a)^{n+1}$.

两个新级数的收敛半径均为 $R$。
:::

反复应用第一部分表明，幂级数在其收敛区间内具有任意阶导数，每项均可逐项求导得到。收敛半径保持不变，但端点可能改变。例15.1中的级数$\sum x^n/n^2$在$x = 1$和$x = -1$处均收敛；其导数$\sum x^{n-1}/n$仅在$-1$处收敛；而下一阶导数$\sum (n - 1)x^{n-2}/n$在两者处均不收敛，因为其项在该处不趋于0。

```check
same(diff(x**n/n**2, x), x**(n - 1)/n); same(diff(x**(n - 1)/n, x), (n - 1)*x**(n - 2)/n)
holds(Sum(1/n**2, (n, 1, oo)).is_convergent()); holds(Sum((-1)**n/n**2, (n, 1, oo)).is_convergent())
holds(Sum(1/n, (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**(n - 1)/n, (n, 1, oo)).is_convergent())
limit_is((n - 1)/n, n, oo, 1)
```

证明见下方“深入理解”框中；其关键步骤是模块8中的中值定理。初次阅读可暂信任该定理。

::: pitfall
逐项求导是一个关于幂级数在其收敛区间内的定理，而不是关于所有函数级数的定理。级数 $\displaystyle\sum_{n=1}^\infty \frac{\sin(n^2x)}{n^2}$ 在所有 $x$ 处收敛，可通过与 $\sum 1/n^2$ 比较得出；但对其逐项求导得到 $\sum \cos(n^2x)$，在 $x = 0$ 处为 $1 + 1 + 1 + \cdots$ 且发散。

```check
same(diff(sin(n**2*x)/n**2, x), cos(n**2*x)); same(cos(n**2*0), 1)
xR = symbols('x', real=True); holds(Abs(sin(n**2*xR)/n**2).subs({xR: 3, n: 5}) <= Rational(1, 25))
holds(Sum(1/n**2, (n, 1, oo)).is_convergent()); holds(Sum(1, (n, 1, oo)).is_convergent() == False)
```
:::

::: deeper 为何逐项求导有效
取 $a = 0$；对于另一个中心，将 $x$ 全部替换为 $x - a$。

**导数级数有相同的收敛半径。** 设 $\abs{x} < R$，并选择 $r$ 使得 $\abs{x} < r < R$。级数在 $r$ 处收敛，因此其项是有界的，如定理 15.1 的证明中所示： $\abs{c_n} r^n \le M$ 对于每个 $n$。然后，对于 $q = \abs{x}/r < 1$，

$$\abs{n c_n x^{n-1}} = \frac{n\,\abs{c_n} r^n\, q^{n-1}}{r} \le \frac{M}{r}\, n q^{n-1},$$

由比值判别法，$\sum n q^{n-1}$在$q > 0$: $(n + 1)q^n/(n q^{n-1}) \to q < 1$时收敛。当$q = 0$时，仅其第一项非零，故亦收敛。因此导级数在$\abs{x} < R$绝对收敛。它在$\abs{x} > R$发散：否则，由定理15.1，它将在某个满足$R < \abs{y} < \abs{x}$的$y$处绝对收敛，且由于$\abs{c_n y^n} \le \abs{y}\,\abs{n c_n y^{n-1}}$对$n \ge 1$成立，原级数亦将如此，但这在其半径之外是不可能的。对导级数应用相同论证表明，二阶导级数$\sum n(n - 1)c_n x^{n-2}$的半径亦为$R$。

**导数.** 设 $g(x) = \sum n c_n x^{n-1}$, 固定 $x$ 与 $\abs{x} < r < R$, 并令 $h \ne 0$ 足够小使得 $\abs{x + h} < r$. 对于 $n \ge 2$, 拉格朗日中值定理给出 $(x + h)^n - x^n = n\xi^{n-1}h$, 对某个 $\xi$ 在 $x$ 与 $x + h$ 之间, 并再次应用, $n\xi^{n-1} - nx^{n-1} = n(n - 1)\eta^{n-2}(\xi - x)$ 对某个 $\eta$ 在 $x$ 与 $\xi$ 之间. 由于 $\abs{\xi}$ 和 $\abs{\eta}$ 小于 $r$ 和 $\abs{\xi - x} \le \abs{h}$,

$$\begin{aligned} &\abs{\frac{(x + h)^n - x^n}{h} - n x^{n-1}} \\ &\qquad\le n(n - 1)\, r^{n-2}\,\abs{h}, \end{aligned}$$

并且对于 $n = 0$ 和 $n = 1$ 左边为 0. $f(x + h)$, $f(x)$ 和 $g(x)$ 的三个级数收敛, 因此可以逐项相加:

$$\begin{aligned} &\abs{\frac{f(x + h) - f(x)}{h} - g(x)} \\ &\qquad\le \abs{h} \sum_{n=2}^\infty n(n - 1)\abs{c_n} r^{n-2}. \end{aligned}$$

最后一个级数收敛, 因为在 $r < R$ 处二阶导数级数绝对收敛. 所以当 $h \to 0$ 趋于 0 时, 左边趋于 0: $f'(x) = g(x)$.

**积分.** 级数 $F(x) = \sum c_n x^{n+1}/(n + 1)$ 的导数级数是原级数, 因此根据第一步, 其收敛半径为 $R$, 并根据第二步, $F' = f$ 在 $(-R, R)$ 上. 由于 $F(0) = 0$, 微积分基本定理(模块 10)给出 $\displaystyle\int_0^x f(t)\,dt = F(x) - F(0) = F(x)$.
:::

```check
qB = symbols('q', positive=True)
limit_is((n + 1)*qB**n/(n*qB**(n - 1)), n, oo, qB)
cB, rB, xB = symbols('C r x', positive=True)                       # |c_n|, r and |x|
same(n*cB*xB**(n - 1), n*cB*rB**n*(xB/rB)**(n - 1)/rB)            # |n c_n x^(n-1)| = n |c_n| r^n q^(n-1)/r
for N_ in (2, 3, 4, 6):    # |((x + h)^n - x^n)/h - n x^(n-1)| <= n(n - 1) r^(n-2) |h| when |x|, |x + h| <= r
    for (xv, hv, rv) in ((Rational(1, 2), Rational(1, 5), Rational(7, 10)), (Rational(-3, 4), Rational(1, 10), Rational(9, 10)), (Rational(9, 10), Rational(-1, 2), 1)):
        holds(Abs(((xv + hv)**N_ - xv**N_)/hv - N_*xv**(N_ - 1)) <= N_*(N_ - 1)*rv**(N_ - 2)*Abs(hv))
same(diff(x**(n + 1)/(n + 1), x), x**n)
```

### 对数与反正切 {#log-arctan}

对几何级数进行积分，得到两个没有几何性质的函数的级数。

::: example $\ln(1 + x)$ 和 $\arctan x$ 的级数
求 $\ln(1 + x)$ 和 $\arctan x$ 关于 0 的幂级数，并利用第一个级数的前四项估计 $\ln 1.1$。

对于 $\abs{t} < 1$， $\dfrac{1}{1 + t} = \sum (-1)^n t^n$。令 $\abs{x} < 1$。函数 $\ln(1 + t)$ 是 $\dfrac{1}{1 + t}$ 的原函数，且 $\ln 1 = 0$，因此根据微积分基本定理和定理 15.2，

$$\begin{aligned} \ln(1 + x) &= \int_0^x \frac{dt}{1 + t} \\ &= \sum_{n=0}^\infty (-1)^n\frac{x^{n+1}}{n + 1} \\ &= x - \frac{x^2}{2} + \frac{x^3}{3} - \frac{x^4}{4} + \cdots \end{aligned}$$

同样地， $\arctan x$ 是 $\dfrac{1}{1 + x^2}$ 的原函数（模块 6），且 $\arctan 0 = 0$，因此对于 $\abs{x} < 1$

$$\begin{aligned} \arctan x &= \int_0^x \frac{dt}{1 + t^2} \\ &= \sum_{n=0}^\infty (-1)^n\frac{x^{2n+1}}{2n + 1} \\ &= x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots \end{aligned}$$

两个级数的收敛半径都是 1，与被积分的级数相同。在 $x = 0.1$ 处，对数级数的前四项给出部分和

$$\begin{aligned} S_4 &= 0.1 - 0.005 \\ &\quad + \frac{1}{3000} - 0.000025 \\ &= \frac{11437}{120000} \approx 0.0953083. \end{aligned}$$

计算器给出 $\ln 1.1 \approx 0.0953102$: 两者 $S_4$ 和 $\ln 1.1$ 都四舍五入为 0.09531。各项符号交替变化，大小递减，因此根据模块 14 的交错级数定理，误差 $\ln 1.1 - S_4$ 是正数且小于被省略的第一个项 $0.1^5/5 = 0.000002$。此界适用于精确的部分和，在四舍五入之前。在 $x = \tfrac12$ 处，同一级数给出 $\ln\tfrac32 = \tfrac12 - \tfrac18 + \tfrac{1}{24} - \cdots$，即练习 14.9 的和。

```check
tt = symbols('t')
antideriv(log(1 + tt), 1/(1 + tt), tt); same(log(1), 0)
same(integrate(sum((-1)**j*tt**j for j in range(7)), (tt, 0, x)), sum((-1)**j*x**(j + 1)/(j + 1) for j in range(7)))
same(series(log(1 + x), x, 0, 10).removeO(), sum((-1)**j*x**(j + 1)/(j + 1) for j in range(9)))
same(diff(atan(x), x), 1/(1 + x**2)); same(atan(0), 0)
same(series(atan(x), x, 0, 14).removeO(), sum((-1)**j*x**(2*j + 1)/(2*j + 1) for j in range(7)))
xv_ = Rational(1, 10); terms = [(-1)**(j - 1)*xv_**j/j for j in range(1, 5)]
same(terms, [Rational(1, 10), -Rational(5, 1000), Rational(1, 3000), -Rational(25, 1000000)])
same(sum(terms), Rational(11437, 120000)); rounds(sum(terms), '0.0953083'); rounds(log(Rational(11, 10)), '0.0953102')
rounds(sum(terms), '0.09531'); rounds(log(Rational(11, 10)), '0.09531')
same(xv_**5/5, Rational(2, 1000000)); holds(0 < log(Rational(11, 10)) - sum(terms)); holds(log(Rational(11, 10)) - sum(terms) < xv_**5/5)
same(summation((-1)**(n - 1)/(n*2**n), (n, 1, oo)), log(Rational(3, 2))); same([(-1)**(j - 1)*Rational(1, 2)**j/j for j in range(1, 4)], [Rational(1, 2), -Rational(1, 8), Rational(1, 24)])
```
:::

对级数求导与积分一样有用，例如用于求和。

::: example 通过求导得到的和
求 $\displaystyle\sum_{n=1}^{\infty} n x^n$ 在 $\abs{x} < 1$ 处的和，以及 $\displaystyle\sum_{n=1}^{\infty} \frac{n}{2^n}$ 的值。

对几何级数逐项求导（定理 15.2）：对于 $\abs{x} < 1$，

$$\begin{aligned} \frac{1}{(1 - x)^2} &= \frac{d}{dx}\Big(\frac{1}{1 - x}\Big) \\ &= \sum_{n=1}^{\infty} n x^{n-1} \\ &= 1 + 2x + 3x^2 + \cdots. \end{aligned}$$

乘以 $x$ 得到 $\displaystyle\sum_{n=1}^{\infty} n x^n = \frac{x}{(1 - x)^2}$。在 $x = \tfrac12$ 处，

$$\sum_{n=1}^{\infty} \frac{n}{2^n} = \frac{1/2}{(1/2)^2} = 2.$$

该和在概率中有意义。抛一枚公平的硬币直到出现正面：第一次正面出现在第 $n$ 次抛掷的概率为 $1/2^n$，因此期望的抛掷次数，即每个可能的次数 $n$ 乘以其概率的和，为 $\sum n/2^n = 2$。

```check
same(diff(1/(1 - x), x), 1/(1 - x)**2)
same(series(1/(1 - x)**2, x, 0, 9).removeO(), sum((j + 1)*x**j for j in range(9)))
same(series(x/(1 - x)**2, x, 0, 9).removeO(), sum(j*x**j for j in range(1, 9)))
same((x/(1 - x)**2).subs(x, Rational(1, 2)), 2); same(summation(n/2**n, (n, 1, oo)), 2)
same(summation(1/2**n, (n, 1, oo)), 1)                       # the probabilities add up to 1
```
:::

### 区间端点 {#endpoints}

在 $x = 1$ 处，对于 $\ln(1 + x)$ 的级数变为交错调和级数 $1 - \tfrac12 + \tfrac13 - \cdots$，根据交错级数判别法，该级数收敛；模块 14 指出其和为 $\ln 2$。例 15.5 并未证明这一点，因为定理 15.2 仅允许对 $\abs{x} < 1$ 进行逐项积分。通过积分有限和（这总是允许的），可以证明这一点，并有误差界。

::: theorem 区间端点的两个和
对于每一个整数 $n \ge 1$，

$$\begin{aligned} &\abs{\ln 2 - \Big(1 - \frac12 + \frac13 - \cdots + \frac{(-1)^{n-1}}{n}\Big)} \\ &\qquad\le \frac{1}{n + 1} \end{aligned}$$

和

$$\begin{aligned} &\abs{\frac{\pi}{4} - \Big(1 - \frac13 + \frac15 - \cdots + \frac{(-1)^{n-1}}{2n - 1}\Big)} \\ &\qquad\le \frac{1}{2n + 1}. \end{aligned}$$

因此 $\ln 2 = 1 - \dfrac12 + \dfrac13 - \dfrac14 + \cdots$ 和 $\dfrac{\pi}{4} = 1 - \dfrac13 + \dfrac15 - \dfrac17 + \cdots$。
:::

::: proof
模块 14 中的有限几何级数求和给出，对于 $t \ne -1$， $1 - t + t^2 - \cdots + (-t)^{n-1} = \dfrac{1 - (-t)^n}{1 + t}$，即，

$$\frac{1}{1 + t} = \sum_{k=0}^{n-1} (-1)^k t^k + (-1)^n\frac{t^n}{1 + t}.$$

从 0 积分到 1。有限和的积分是积分的和， $\int_0^1 t^k\,dt = \dfrac{1}{k + 1}$，和 $\int_0^1 \dfrac{dt}{1 + t} = \ln 2$，因此

$$\ln 2 = \sum_{k=0}^{n-1} \frac{(-1)^k}{k + 1} + (-1)^n \int_0^1 \frac{t^n}{1 + t}\,dt.$$

该和为 $1 - \tfrac12 + \cdots + \tfrac{(-1)^{n-1}}{n}$。对于 $0 \le t \le 1$，$0 \le \dfrac{t^n}{1 + t} \le t^n$，因此最后一个积分介于 0 和 $\int_0^1 t^n\,dt = \dfrac{1}{n + 1}$ 之间（参见模块 9 的比较定理）。这是第一个不等式，由于 $\dfrac{1}{n + 1} \to 0$，部分和趋近于 $\ln 2$。对于 $\dfrac{\pi}{4}$，在恒等式中将 $t^2$ 代入 $t$：

$$\frac{1}{1 + t^2} = \sum_{k=0}^{n-1} (-1)^k t^{2k} + (-1)^n\frac{t^{2n}}{1 + t^2}.$$

从 0 到 1 积分，左边得到 $\arctan 1 = \dfrac{\pi}{4}$，右边为部分和加上 $\pm$，一个介于 0 和 $\int_0^1 t^{2n}\,dt = \dfrac{1}{2n + 1}$ 之间的积分。
:::

```check
for N_ in range(1, 7):
    same(sum((-1)**k*tt**k for k in range(N_)) + (-1)**N_*tt**N_/(1 + tt), 1/(1 + tt))
    same(sum((-1)**k*tt**(2*k) for k in range(N_)) + (-1)**N_*tt**(2*N_)/(1 + tt**2), 1/(1 + tt**2))
same(integrate(1/(1 + tt), (tt, 0, 1)), log(2)); same(integrate(1/(1 + tt**2), (tt, 0, 1)), pi/4); same(atan(1), pi/4)
nS = symbols('n', positive=True); same(integrate(tt**nS, (tt, 0, 1)), 1/(nS + 1)); same(integrate(tt**(2*nS), (tt, 0, 1)), 1/(2*nS + 1))
for N_ in (1, 2, 5, 10, 20):
    holds(Abs(log(2) - sum(Rational((-1)**(k - 1), k) for k in range(1, N_ + 1))) <= Rational(1, N_ + 1))
    holds(Abs(pi/4 - sum(Rational((-1)**k, 2*k + 1) for k in range(N_))) <= Rational(1, 2*N_ + 1))
    holds(0 <= integrate(tt**N_/(1 + tt), (tt, 0, 1))); holds(integrate(tt**N_/(1 + tt), (tt, 0, 1)) <= Rational(1, N_ + 1))
```

该界也说明了交错调和级数收敛得有多慢。在 10、100 和 1000 项之后，其部分和约为 0.6456、0.6882 和 0.6926，而 $\ln 2 \approx 0.693147$：误差幅度接近 $1/(2n)$，因此每个额外正确的十进制位需要十倍的项数。第 15.6 节找到了 $\ln 2$ 和 $\pi$ 的更快收敛级数。

```check
alt = lambda N: harmonic(N) - harmonic(N // 2)               # 1 - 1/2 + ... - 1/N, for even N
same(alt(10), sum(Rational((-1)**(k - 1), k) for k in range(1, 11)))
rounds(alt(10), '0.6456'); rounds(alt(100), '0.6882'); rounds(alt(1000), '0.6926'); rounds(log(2), '0.693147')
for N_ in (10, 100, 1000):
    holds(Abs((log(2) - alt(N_))*2*N_ - 1) < Rational(1, 10))   # the error is within 10% of 1/(2n)
```

该证明利用了 $\ln(1 + x)$ 和 $\arctan x$ 的特殊性质。一个通用定理涵盖了在收敛端点处的所有幂级数。

::: theorem 阿贝尔定理
设 $\sum c_n (x - a)^n$ 的收敛半径为 $R$，其中 $0 < R < \infty$，且级数在端点 $x = a + R$ 收敛。则该端点的级数和等于级数和从区间内部趋近端点时的极限：

$$\sum_{n=0}^\infty c_n R^n = \lim_{x\to (a + R)^-}\, \sum_{n=0}^\infty c_n (x - a)^n.$$

在 $x = a - R$ 处也成立，此时取右极限。
:::

本教程只陈述阿贝尔定理，证明可见实分析教材。它可这样应用：设 $f(x)$ 在区间内部等于其级数之和，$f$ 在某端点连续，并且级数在该端点收敛。该端点的级数和也等于 $f$，因为两者都等于 $x$ 从区间内趋近端点时 $f(x)$ 的极限。于是直接得到在 $(-1, 1]$ 上 $\ln(1 + x) = x - \tfrac{x^2}{2} + \cdots$，在 $[-1, 1]$ 上 $\arctan x = x - \tfrac{x^3}{3} + \cdots$。当 $x = -1$ 时，$\arctan$ 的级数为 $-\big(1 - \tfrac13 + \tfrac15 - \cdots\big)$，由交错级数判别法知其收敛。

```check
holds(Sum((-1)**n/(2*n + 1), (n, 0, oo)).is_convergent()); same(atan(-1), -pi/4)
same(summation((-1)**n*(-1)**(2*n + 1)/(2*n + 1), (n, 0, oo)), -pi/4)
limit_is(log(1 + x), x, 1, log(2), '-'); limit_is(atan(x), x, -1, -pi/4, '+')
```

::: pitfall
级数 $f$ 的收敛区间不是 $f$ 的定义域。 $\ln(1 + x)$ 对于每一个 $x > -1$ 都有定义，但它的级数只在 $(-1, 1]$ 上收敛：在 $x = 2$ 处，其项 $\pm 2^n/n$ 无界增长，尽管 $\ln 3$ 存在。在收敛区间之外，级数无法告诉你关于函数的任何信息。

```check
limit_is(2**n/n, n, oo, oo); same(log(1 + 2), log(3))
```
:::

## 泰勒级数 {#taylor-series}

到目前为止，每一个级数都来自于几何级数。大多数函数与几何级数无关：例如 $e^x$。 $e^x$ 是否有幂级数？如何找到它？如果一个函数有幂级数，那么它的导数确定了系数。取 $f(x) = \sum c_n(x - a)^n$，其半径为 $R > 0$，并逐项求导，反复进行（定理 15.2）：

$$\begin{aligned} f(x) &= c_0 + c_1(x - a) + c_2(x - a)^2 \\ &\qquad + c_3(x - a)^3 + \cdots \\ f'(x) &= c_1 + 2c_2(x - a) \\ &\qquad + 3c_3(x - a)^2 + \cdots \\ f''(x) &= 2c_2 + 3\cdot2\,c_3(x - a) + \cdots \\ f'''(x) &= 3\cdot2\cdot1\,c_3 + \cdots \end{aligned}$$

在 $x = a$ 处，所有包含 $x - a$ 的项都为 0，因此 $f(a) = c_0$、 $f'(a) = c_1$、 $f''(a) = 2c_2$ 和 $f'''(a) = 3!\,c_3$。

```check
cs = symbols('c0:7')
pa = sum(cs[j]*(x - a)**j for j in range(7))
same(diff(pa, x), cs[1] + 2*cs[2]*(x - a) + 3*cs[3]*(x - a)**2 + 4*cs[4]*(x - a)**3 + 5*cs[5]*(x - a)**4 + 6*cs[6]*(x - a)**5)
same(diff(pa, x, 2).subs(x, a), 2*cs[2]); same(diff(pa, x, 3), 6*cs[3] + 24*cs[4]*(x - a) + 60*cs[5]*(x - a)**2 + 120*cs[6]*(x - a)**3)
same([diff(pa, x, j).subs(x, a) for j in range(4)], [cs[0], cs[1], 2*cs[2], factorial(3)*cs[3]])
```

::: theorem 幂级数的系数
若 $f(x) = \sum c_n(x - a)^n$ 在 $\abs{x - a} < R$ 处展开，且 $R > 0$，则对于每一个 $n \ge 0$

$$c_n = \frac{f^{(n)}(a)}{n!}.$$

特别地， $f$ 在 $a$ 处只有一个幂级数。
:::

::: proof
根据定理 15.2，应用 $n$ 次，对于 $\abs{x - a} < R$

$$\begin{aligned} f^{(n)}(x) &= \sum_{k=n}^\infty k(k - 1)\cdots(k - n + 1) \\ &\qquad\times c_k (x - a)^{k-n}. \end{aligned}$$

在 $x = a$ 处，每个包含 $k > n$ 的项为 0，包含 $k = n$ 的项为 $n(n - 1)\cdots1\cdot c_n = n!\,c_n$。由于系数由 $f$ 确定，关于 $f$ 在 $a$ 处的两个幂级数具有相同的系数：它们是同一个级数。
:::

```check
for K_ in range(1, 7):
    for N_ in range(0, K_ + 1):
        same(diff((x - a)**K_, x, N_), ff(K_, N_)*(x - a)**(K_ - N_))
same([diff(pa, x, j).subs(x, a) for j in range(7)], [factorial(j)*cs[j] for j in range(7)])
```

此处 $f^{(0)}$ 表示 $f$ 本身和 $0! = 1$，因此公式也给出 $c_0 = f(a)$。唯一性在实践中很有用：无论通过何种方式找到 $f$ 关于 $a$ 的幂级数（通过替换、积分或导数），都会得到同一个级数。

::: definition 泰勒级数与泰勒多项式
设 $f$ 在 $a$ 处具有各阶导数。$f$ 在 $a$ 处（或称以 $a$ 为中心）的**泰勒级数**定义为

$$\begin{aligned} &\sum_{n=0}^\infty \frac{f^{(n)}(a)}{n!}(x - a)^n \\ &\quad= f(a) + f'(a)(x - a) \\ &\qquad + \frac{f''(a)}{2!}(x - a)^2 + \cdots. \end{aligned}$$

其部分和

$$T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x - a)^k$$

称为 $f$ 以 $a$ 为中心的 $n$ 次**泰勒多项式**。若 $a = 0$，则称为 $f$ 的**麦克劳林级数**及**麦克劳林多项式**。
:::

$T_n(x)$ 读作「T 下标 n，关于 x 的函数」。$T_1(x) = f(a) + f'(a)(x - a)$ 是[第 7.2 节](module_07_ZH.html#linear-approximation)的线性化。即使末项系数恰好为零，仍称 $T_n$ 为 $n$ 次泰勒多项式。定理 15.5 表明，若 $f$ 在 $a$ 附近可展开为幂级数，该级数就是泰勒级数。泰勒级数是否收敛、其和是否等于 $f$，需由第 15.5 节判断。

### 标准级数 {#standard}

::: example $e^x$ 的级数
求 $e^x$ 的麦克劳林级数及其收敛半径。

$e^x$ 的每一个导数都是 $e^x$（模块 6），因此 $f^{(n)}(0) = e^0 = 1$ 对于每一个 $n$ 都成立，且麦克劳林级数是

$$\sum_{n=0}^\infty \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots.$$

由例 15.2 可知，它在每个 $x$: $R = \infty$ 处收敛。它的泰勒多项式 $T_1(x) = 1 + x$ 和 $T_2(x) = 1 + x + \tfrac12 x^2$ 是例 7.13（[第 7.5 节](module_07_ZH.html#the-rule)) 中的近似值，其中洛必达法则表明 $e^x - 1 - x \approx \tfrac12 x^2$ 在 0 附近。第 15.5 节证明该级数在每个 $x$ 处等于 $e^x$。在 $x = 1$ 处其值为 $e = 1 + 1 + \tfrac{1}{2!} + \tfrac{1}{3!} + \cdots$，在 $x = -1$ 处其值为 $1/e = 1 - 1 + \tfrac{1}{2!} - \tfrac{1}{3!} + \cdots \approx 0.367879$，这是例 14.14 中估计的和。

```check
same([diff(exp(x), x, j).subs(x, 0) for j in range(8)], [1]*8)
same(series(exp(x), x, 0, 10).removeO(), sum(x**j/factorial(j) for j in range(10)))
same(sum(x**j/factorial(j) for j in range(3)), 1 + x + x**2/2); limit_is((exp(x) - 1 - x)/x**2, x, 0, Rational(1, 2))
same(summation((-1)**n/factorial(n), (n, 0, oo)), exp(-1)); rounds(exp(-1), '0.367879')
```
:::

::: example $\sin x$ 和 $\cos x$ 的级数
求 $\sin x$ 和 $\cos x$ 的麦克劳林级数及其收敛半径。

$\sin x$ 的导数依次为 $\cos x$、$-\sin x$、$-\cos x$、$\sin x$，然后四个导数的循环重复。在 0 处 $\sin x$ 及其导数的值为 $0, 1, 0, -1, 0, 1, 0, -1, \dots$。因此，仅奇次幂出现，且符号交替：

$$\begin{aligned} \sin x &= x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots \\ &= \sum_{n=0}^\infty (-1)^n \frac{x^{2n+1}}{(2n + 1)!}. \end{aligned}$$

对于 $\cos x$，0 处的值为 $1, 0, -1, 0, 1, \dots$，且仅偶次幂出现：

$$\begin{aligned} \cos x &= 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots \\ &= \sum_{n=0}^\infty (-1)^n \frac{x^{2n}}{(2n)!}. \end{aligned}$$

（等号预示第15.5节，该节将证明它们；目前这些是麦克劳林级数。）对于正弦级数，两个相邻非零项的比值是

$$\begin{aligned} &\abs{\frac{x^{2n+3}/(2n + 3)!}{x^{2n+1}/(2n + 1)!}} \\ &\quad= \frac{x^2}{(2n + 2)(2n + 3)} \to 0, \end{aligned}$$

因此，它对于每一个 $x$ 都收敛，余弦级数也是如此： $R = \infty$ 对两者都成立。每个级数是另一个的逐项导数，符号根据 $(\sin x)' = \cos x$ 和 $(\cos x)' = -\sin x$ 要求而定。奇函数 $\sin$ 只包含奇次幂，偶函数 $\cos$ 只包含偶次幂。

```check
same([diff(sin(x), x, j).subs(x, 0) for j in range(8)], [0, 1, 0, -1, 0, 1, 0, -1])
same([diff(cos(x), x, j).subs(x, 0) for j in range(8)], [1, 0, -1, 0, 1, 0, -1, 0])
same(series(sin(x), x, 0, 16).removeO(), sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(8)))
same(series(cos(x), x, 0, 16).removeO(), sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(8)))
nT = symbols('n', integer=True, nonnegative=True)
same((x**(2*nT + 3)/factorial(2*nT + 3))/(x**(2*nT + 1)/factorial(2*nT + 1)), x**2/((2*nT + 2)*(2*nT + 3)))
limit_is(x**2/((2*n + 2)*(2*n + 3)), n, oo, 0)
sinser = sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(8)); cosser = sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(8))
same(diff(sinser, x), cosser); same(expand(diff(cosser, x) + sinser), (-1)**7*x**15/factorial(15))   # up to the last term kept
```
:::

::: example 关于 4 的泰勒多项式
求 $\sqrt x$ 关于 4 的泰勒多项式 $T_3$，利用 $T_1$、$T_2$ 和 $T_3$ 来估计 $\sqrt{4.1}$。

$f(x) = x^{1/2}$ 的导数来自幂法则：

$$\begin{aligned} f'(x) &= \tfrac12 x^{-1/2}, & f''(x) &= -\tfrac14 x^{-3/2}, \\ f'''(x) &= \tfrac38 x^{-5/2}. & & \end{aligned}$$

在 4 处，由于 $4^{1/2} = 2$，$4^{3/2} = 8$ 和 $4^{5/2} = 32$，值分别为 $f(4) = 2$，$f'(4) = \tfrac14$，$f''(4) = -\tfrac{1}{32}$ 和 $f'''(4) = \tfrac{3}{256}$。除以 $0!$，$1!$，$2!$ 和 $3!$：

$$\begin{aligned} T_3(x) = 2 &+ \frac{x - 4}{4} - \frac{(x - 4)^2}{64} \\ &+ \frac{(x - 4)^3}{512}, \end{aligned}$$

并且 $T_1$ 和 $T_2$ 是其前两项和前三项。在 $x = 4.1$ 处，其中 $x - 4 = 0.1$，

$$\begin{aligned} T_1(4.1) &= 2.025, \\ T_2(4.1) &= 2.025 - 0.00015625 \\ &= 2.02484375, \\ T_3(4.1) &= T_2(4.1) + 0.000001953125 \\ &\approx 2.0248457. \end{aligned}$$

计算器给出 $\sqrt{4.1} \approx 2.02484567$: 误差约为 $-1.5 \times 10^{-4}$、$1.9 \times 10^{-6}$ 和 $-3.0 \times 10^{-8}$。此处每个新项大约增加两位有效数字。$T_1$ 是例题 7.5 的线性近似。

```check
fs_ = sqrt(x)
same(diff(fs_, x), x**Rational(-1, 2)/2); same(diff(fs_, x, 2), -x**Rational(-3, 2)/4); same(diff(fs_, x, 3), Rational(3, 8)*x**Rational(-5, 2))
same([diff(fs_, x, j).subs(x, 4) for j in range(4)], [2, Rational(1, 4), -Rational(1, 32), Rational(3, 256)])
same(4**Rational(3, 2), 8); same(4**Rational(5, 2), 32)
T3s = 2 + (x - 4)/4 - (x - 4)**2/64 + (x - 4)**3/512
same(series(fs_, x, 4, 4).removeO(), T3s)
same(sum(diff(fs_, x, j).subs(x, 4)/factorial(j)*(x - 4)**j for j in range(4)), T3s)
v41 = Rational(41, 10)
T1s, T2s = 2 + (x - 4)/4, 2 + (x - 4)/4 - (x - 4)**2/64
same(T1s.subs(x, v41), Rational(2025, 1000)); same(Rational(1, 100)/64, Rational(15625, 10**8)); same(T2s.subs(x, v41), Rational(202484375, 10**8))
same(Rational(1, 1000)/512, Rational(1953125, 10**12)); rounds(T3s.subs(x, v41), '2.0248457'); rounds(sqrt(v41), '2.02484567')
rounds(sqrt(v41) - T1s.subs(x, v41), '-1.5e-4'); rounds(sqrt(v41) - T2s.subs(x, v41), '1.9e-6'); rounds(sqrt(v41) - T3s.subs(x, v41), '-3.0e-8')
```
:::

**二项式级数。** 对于任意实数 $k$ 和 $x > -1$，$f(x) = (1 + x)^k$ 的导数可由模块 6 的幂法则得出：

$$\begin{aligned} f'(x) &= k(1 + x)^{k-1}, \\ f''(x) &= k(k - 1)(1 + x)^{k-2}, \end{aligned}$$

一般地 $f^{(n)}(x) = k(k - 1)\cdots(k - n + 1)(1 + x)^{k-n}$。在 0 处，$f^{(n)}(0) = k(k - 1)\cdots(k - n + 1)$，因此 Maclaurin 系数是 **二项式系数**

$$\begin{aligned} \binom{k}{n} &= \frac{k(k - 1)\cdots(k - n + 1)}{n!}, \\ \binom{k}{0} &= 1, \end{aligned}$$

读作 "k 选 n"。$(1 + x)^k$ 的 Maclaurin 级数是 **二项式级数**

$$\begin{aligned} \sum_{n=0}^\infty \binom{k}{n}x^n &= 1 + kx + \frac{k(k - 1)}{2!}x^2 \\ &\quad + \frac{k(k - 1)(k - 2)}{3!}x^3 + \cdots. \end{aligned}$$

当 $k$ 是整数时，$k \ge 0$，每个含有 $n > k$ 的系数都包含因子 $k - k = 0$，因此级数终止：这就是代数中的二项式定理，如在 $(1 + x)^3 = 1 + 3x + 3x^2 + x^3$ 中所示。对于每一个其他 $k$，没有系数为 0，且比值审敛法给出

$$\abs{\frac{\binom{k}{n+1}x^{n+1}}{\binom{k}{n}x^n}} = \frac{\abs{k - n}}{n + 1}\,\abs{x} \to \abs{x},$$

所以收敛半径是 1。

```check
same(diff((1 + x)**k, x, 3), k*(k - 1)*(k - 2)*(1 + x)**(k - 3))
same([expand_func(binomial(k, j)) for j in range(4)], [1, k, k*(k - 1)/2, k*(k - 1)*(k - 2)/6])
same(series((1 + x)**k, x, 0, 6).removeO(), sum(binomial(k, j)*x**j for j in range(6)))
same(expand((1 + x)**3), 1 + 3*x + 3*x**2 + x**3); same([binomial(3, j) for j in range(4, 8)], [0, 0, 0, 0])
nB = symbols('n', integer=True, nonnegative=True)
same(expand_func(binomial(k, nB + 1)/binomial(k, nB)), (k - nB)/(nB + 1))
limit_is((k - n)/(n + 1), n, oo, -1)                        # the ratio's size tends to 1
```

::: theorem 二项式级数
对于每个实数 $k$ 和每个满足 $\abs{x} < 1$ 的 $x$，有

$$(1 + x)^k = \sum_{n=0}^\infty \binom{k}{n}x^n.$$
:::

::: proof
设 $g(x)$ 为 $\abs{x} < 1$ 的级数和。根据定理 15.2，将 $n - 1$ 改为 $n$，

$$\begin{aligned} g'(x) &= \sum_{n=1}^\infty n\binom{k}{n}x^{n-1} \\ &= \sum_{n=0}^\infty (n + 1)\binom{k}{n+1}x^n. \end{aligned}$$

根据定义， $\binom{k}{n+1} = \binom{k}{n}\dfrac{k - n}{n + 1}$，因此 $(n + 1)\binom{k}{n+1} = (k - n)\binom{k}{n}$。此外 $x\,g'(x) = \sum n\binom{k}{n}x^n$（含 $n = 0$ 的项为 0）。相加，

$$\begin{aligned} &(1 + x)\,g'(x) \\ &\quad= \sum_{n=0}^\infty \big[(k - n) + n\big]\binom{k}{n}x^n \\ &\quad= k\,g(x). \end{aligned}$$

现在设 $h(x) = g(x)(1 + x)^{-k}$。根据乘积法则，

$$\begin{aligned} h'(x) &= \frac{g'(x)}{(1 + x)^k} - \frac{k\,g(x)}{(1 + x)^{k+1}} \\ &= \frac{(1 + x)g'(x) - k\,g(x)}{(1 + x)^{k+1}} = 0 \end{aligned}$$

对于 $\abs{x} < 1$。一个导数在区间内为 0 的函数是常数（模块 8），因此 $h(x) = h(0) = g(0) = 1$，即 $g(x) = (1 + x)^k$。
:::

```check
same(expand_func(binomial(k, nB)*(k - nB)/(nB + 1)), expand_func(binomial(k, nB + 1)))
wP = symbols('w', positive=True); gf = Function('g')          # w stands for 1 + x, positive for |x| < 1
same(diff(gf(wP)*wP**(-k), wP), wP**(-k - 1)*(wP*diff(gf(wP), wP) - k*gf(wP)))
Ncoef = 7    # the coefficients of (1 + x) g' and of k g agree, power by power
gp = sum(binomial(k, j)*x**j for j in range(Ncoef + 2))
lhs = expand((1 + x)*diff(gp, x)); rhs = expand(k*gp)
same([expand_func(lhs.coeff(x, j)) for j in range(Ncoef)], [expand_func(rhs.coeff(x, j)) for j in range(Ncoef)])
```

二项式级数在 $x = \pm1$ 处是否收敛取决于 $k$：对于 $k = \tfrac12$，它在两端都收敛；对于 $k = -1$，其中它是 $1/(1 + x)$ 的几何级数，在两端都不收敛。

```check
same(series((1 + x)**-1, x, 0, 8).removeO(), sum((-1)**j*x**j for j in range(8)))
same([binomial(-1, j) for j in range(6)], [1, -1, 1, -1, 1, -1])            # k = -1: terms of size 1 at x = 1 and x = -1
for N_ in (1, 2, 5, 10, 20):                                                    # k = 1/2:
    same(binomial(Rational(1, 2), N_), (-1)**(N_ - 1)*binomial(2*N_, N_)/(4**N_*(2*N_ - 1)))   # so |C(1/2, n)| <= 1/(2n - 1) -> 0
    same(sum(binomial(Rational(1, 2), j)*(-1)**j for j in range(N_ + 1)), binomial(2*N_, N_)/4**N_)   # x = -1: partial sums positive
holds(all(binomial(Rational(1, 2), j)*(-1)**j < 0 for j in range(1, 30)))     # ... and decreasing: they converge (monotone convergence)
holds(all(Abs(binomial(Rational(1, 2), j + 1)) < Abs(binomial(Rational(1, 2), j)) for j in range(1, 30)))   # x = 1: alternating, decreasing
```

::: example 两个二项式级数
求 (a) $\sqrt{1 + x}$ 和 (b) $\dfrac{1}{\sqrt{1 - x}}$ 的二项式级数的前四项。

**(a)** 此处 $k = \tfrac12$：

$$\begin{aligned} \binom{1/2}{1} &= \frac12, \\ \binom{1/2}{2} &= \frac{\tfrac12\cdot\big(-\tfrac12\big)}{2} = -\frac18, \\ \binom{1/2}{3} &= \frac{\tfrac12\cdot\big(-\tfrac12\big)\cdot\big(-\tfrac32\big)}{6} = \frac{1}{16}, \end{aligned}$$

因此对于 $\abs{x} < 1$

$$\sqrt{1 + x} = 1 + \frac{x}{2} - \frac{x^2}{8} + \frac{x^3}{16} - \cdots.$$

**(b)** 现在 $k = -\tfrac12$，以 $-x$ 代替 $x$。系数为 $\binom{-1/2}{1} = -\tfrac12$, $\binom{-1/2}{2} = \tfrac{(-1/2)(-3/2)}{2} = \tfrac38$ 和 $\binom{-1/2}{3} = \tfrac{(-1/2)(-3/2)(-5/2)}{6} = -\tfrac{5}{16}$，乘以 $(-x)^n$ 使所有符号变为正：

$$\frac{1}{\sqrt{1 - x}} = 1 + \frac{x}{2} + \frac{3x^2}{8} + \frac{5x^3}{16} + \cdots,$$

对于 $\abs{x} < 1$。

(a) 的前两项是 $\sqrt{1 + x} \approx 1 + \tfrac12 x$ 的线性近似；第三项表明它略微偏大，大约偏大 $\tfrac18 x^2$。级数 (b) 在第 15.6 节中再次出现，用于爱因斯坦的动能公式。

```check
same([binomial(Rational(1, 2), j) for j in range(4)], [1, Rational(1, 2), -Rational(1, 8), Rational(1, 16)])
same(series(sqrt(1 + x), x, 0, 4).removeO(), 1 + x/2 - x**2/8 + x**3/16)
same([binomial(-Rational(1, 2), j) for j in range(4)], [1, -Rational(1, 2), Rational(3, 8), -Rational(5, 16)])
same([binomial(-Rational(1, 2), j)*(-1)**j for j in range(4)], [1, Rational(1, 2), Rational(3, 8), Rational(5, 16)])
same(series(1/sqrt(1 - x), x, 0, 4).removeO(), 1 + x/2 + 3*x**2/8 + 5*x**3/16)
holds(series(sqrt(1 + x) - (1 + x/2), x, 0, 3).removeO() == -x**2/8)
```
:::

本节及上一节的级数构成一个值得牢记的简短列表：

| 函数 | 麦克劳林级数 | 在下列条件下等于原函数 |
|---|---|---|
| $\dfrac{1}{1 - x}$ | $\displaystyle\sum_{n=0}^\infty x^n = 1 + x + x^2 + \cdots$ | $-1 < x < 1$ |
| $\ln(1 + x)$ | $\displaystyle\sum_{n=1}^\infty (-1)^{n-1}\frac{x^n}{n} = x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots$ | $-1 < x \le 1$ |
| $\arctan x$ | $\displaystyle\sum_{n=0}^\infty (-1)^n\frac{x^{2n+1}}{2n + 1} = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots$ | $-1 \le x \le 1$ |
| $e^x$ | $\displaystyle\sum_{n=0}^\infty \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \cdots$ | 任意 $x$ |
| $\sin x$ | $\displaystyle\sum_{n=0}^\infty (-1)^n\frac{x^{2n+1}}{(2n + 1)!} = x - \frac{x^3}{3!} + \cdots$ | 任意 $x$ |
| $\cos x$ | $\displaystyle\sum_{n=0}^\infty (-1)^n\frac{x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \cdots$ | 任意 $x$ |
| $(1 + x)^k$ | $\displaystyle\sum_{n=0}^\infty \binom{k}{n}x^n = 1 + kx + \cdots$ | $-1 < x < 1$，且对于某些 $k$ 也在 $\pm1$ 处成立 |

当 $k$ 是非负整数时，二项式级数终止并等于 $(1 + x)^k$，对所有实数 $x$ 都成立，而不仅限于内部 $(-1, 1)$。对于其他所有 $k$，收敛半径为 1，端点需要单独检验。对于 $e^x$, $\sin x$ 和 $\cos x$ 的最后一列证明见第 15.5 节（定理 15.9）。

```check
for f_, ser_ in ((1/(1 - x), sum(x**j for j in range(12))), (log(1 + x), sum((-1)**(j - 1)*x**j/j for j in range(1, 12))),
                 (atan(x), sum((-1)**j*x**(2*j + 1)/(2*j + 1) for j in range(6))), (exp(x), sum(x**j/factorial(j) for j in range(12))),
                 (sin(x), sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(6))), (cos(x), sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(6)))):
    same(series(f_, x, 0, 12).removeO(), ser_)
inside = lambda cond, pts: [bool(cond.subs(x, p_)) for p_ in pts]
pts_ = (-2, -1, 0, 1, 2)
g1_ = summation(x**n, (n, 0, oo)); same(g1_.args[0][0], 1/(1 - x)); same(inside(g1_.args[0][1], pts_), [False, False, True, False, False])
g3_ = summation((-1)**n*x**(2*n + 1)/(2*n + 1), (n, 0, oo)); same(g3_.args[0][0], atan(x)); same(inside(g3_.args[0][1], pts_), [False, True, True, True, False])
for k_ in (0, 1, 3):
    same(sum(binomial(k_, j)*x**j for j in range(k_ + 1)), (1 + x)**k_)   # polynomial case: every real x
```

::: keyidea
一组级数几乎生成所有其他的级数：几何级数、$e^x$、$\sin x$ 和 $\cos x$ 级数以及二项式级数。新的级数可以通过这些级数进行替换、乘以 $x$ 的幂、求导和积分得到，这通常比计算导数要快得多，而且根据唯一性（定理 15.5），结果是泰勒级数。
:::

::: pitfall
泰勒级数需要在中心点处的所有导数。$\sqrt x$ 没有麦克劳林级数，因为 $\sqrt x$ 在 0 处不可导，而 $\ln x$ 也不可导，因为它在 0 处未定义。使用另一个中心（$\sqrt x$ 关于 4，$\ln x$ 关于 1），或移动函数（$\sqrt{1 + x}$，$\ln(1 + x)$）。
:::

级数为没有初等原函数的积分提供数值解，例如 $e^{-x^2}$ 从模块 11 中的积分。

::: example 没有初等原函数的积分
将 $\displaystyle\int_0^1 e^{-x^2}\,dx$ 精确到小数点后三位。

将 $u = -x^2$ 代入 $e^u$ 的级数中，该级数对每个 $u$ 都收敛：

$$\begin{aligned} e^{-x^2} &= \sum_{n=0}^\infty \frac{(-x^2)^n}{n!} \\ &= 1 - x^2 + \frac{x^4}{2!} - \frac{x^6}{3!} + \cdots. \end{aligned}$$

按项积分从 0 到 1（定理 15.2，带 $R = \infty$）：

$$\begin{aligned} \int_0^1 e^{-x^2}\,dx &= \sum_{n=0}^\infty \frac{(-1)^n}{(2n + 1)\,n!} \\ &= 1 - \frac13 + \frac{1}{10} - \frac{1}{42} + \frac{1}{216} \\ &\qquad - \frac{1}{1320} + \frac{1}{9360} - \cdots. \end{aligned}$$

项交替变号且大小递减至 0，因此适用交错级数定理：前六项之和，即 $0.746729$ 保留六位小数，与积分的差小于第七项 $1/9360 < 0.00011$。因此积分值介于 0.74672 和 0.74684 之间，保留三位小数为 0.747。按比例缩放， $e^{-x^2}$ 是正态分布的钟形曲线（模块 12），因此此类积分给出该分布的概率，而该概率在初等函数中没有解析表达式。

```check
same(series(exp(-x**2), x, 0, 12).removeO(), sum((-x**2)**j/factorial(j) for j in range(6)))
same(integrate(sum((-x**2)**j/factorial(j) for j in range(8)), (x, 0, 1)), sum(Rational((-1)**j, (2*j + 1)*factorial(j)) for j in range(8)))
same([Rational(1, (2*j + 1)*factorial(j)) for j in range(7)], [1, Rational(1, 3), Rational(1, 10), Rational(1, 42), Rational(1, 216), Rational(1, 1320), Rational(1, 9360)])
s6 = sum(Rational((-1)**j, (2*j + 1)*factorial(j)) for j in range(6)); rounds(s6, '0.746729')
I01 = integrate(exp(-x**2), (x, 0, 1)); holds(s6 < I01); holds(I01 < s6 + Rational(1, 9360)); holds(Rational(1, 9360) < Rational(11, 100000))
holds(Rational(74672, 100000) < s6); holds(s6 + Rational(1, 9360) < Rational(74684, 100000)); rounds(I01, '0.747')
holds(all(Rational(1, (2*j + 3)*factorial(j + 1)) < Rational(1, (2*j + 1)*factorial(j)) for j in range(20)))
```
:::

::: compute 使用 SymPy 进行泰勒级数展开
SymPy 的 `series` 计算泰勒级数。其参数是表达式、变量、中心点以及被省略的第一项的阶数：

```python
import sympy as sp
x = sp.symbols('x')
print(sp.series(sp.exp(x), x, 0, 6))
print(sp.series(sp.sin(x), x, 0, 8).removeO())
print(sp.series(sp.sqrt(x), x, 4, 3))
```

```output
1 + x + x**2/2 + x**3/6 + x**4/24 + x**5/120 + O(x**6)
-x**7/5040 + x**5/120 - x**3/6 + x
1 - (x - 4)**2/64 + x/4 + O((x - 4)**3, (x, 4))
```

`O(x**6)`，读作“x 的 6 次方的大 O”，表示被省略的 6 次及以上项，如模块 4 中的大 O 记号。`.removeO()` 舍去了它，留下一个泰勒多项式，此处为 $T_7$ 的 $\sin x$，SymPy 以最高次幂在前的方式打印。第三行是 $T_2$ 的 $\sqrt x$ 在 4 处的展开，来自例 15.9，多项式被重新排列：$2 + \tfrac{x - 4}{4}$ 是 $1 + \tfrac{x}{4}$。SymPy 也处理符号指数以及你不想手动计算其系数的函数：

```python
k = sp.symbols('k')
print(sp.series((1 + x)**k, x, 0, 4))
print(sp.series(sp.tan(x), x, 0, 10))
```

```output
1 + k*x + k*x**2*(k - 1)/2 + k*x**3*(k - 2)*(k - 1)/6 + O(x**4)
x + x**3/3 + 2*x**5/15 + 17*x**7/315 + 62*x**9/2835 + O(x**10)
```

第一行是二项式级数。$\tan x$ 的系数没有简单的模式，其级数仅在 $\abs{x} < \pi/2$ 收敛。注意参数的顺序：第三个参数是中心，不是项数。

```python
print(sp.series(x**3, x, 4))
```

```output
48*x + (x - 4)**3 + 12*(x - 4)**2 - 128
```

没有第四个参数时，SymPy 以中心 4 展开（默认阶数为 6）。多项式本身即为泰勒级数，因此答案是 $x^3$ 以 $x - 4$、$64 + 48(x - 4) + 12(x - 4)^2 + (x - 4)^3$ 的幂重新表示，$64 + 48(x - 4)$ 被合并到 $48x - 128$；没有 $O$ 项，因为没有被省略。
:::

```check
same(series(tan(x), x, 0, 10).removeO(), x + x**3/3 + 2*x**5/15 + 17*x**7/315 + 62*x**9/2835)
same(64 + 48*(x - 4) + 12*(x - 4)**2 + (x - 4)**3, x**3); same(64 + 48*(x - 4), 48*x - 128)
same([diff(x**3, x, j).subs(x, 4)/factorial(j) for j in range(4)], [64, 48, 12, 1])
same(1 + x/4, 2 + (x - 4)/4); same(series(sqrt(x), x, 4, 3).removeO(), 2 + (x - 4)/4 - (x - 4)**2/64)
```

### 泰勒多项式 {#taylor-polynomials}

在实践中，没有人会求和整个级数：你在某个$T_n$处停止。图15.2展示了$\sin x$的麦克劳林多项式如何

$$\begin{aligned} T_1(x) &= x, \\ T_3(x) &= x - \frac{x^3}{6}, \\ T_5(x) &= x - \frac{x^3}{6} + \frac{x^5}{120}, \end{aligned}$$

近似它。（由于每个偶数系数均为 0，$T_2 = T_1$ 和 $T_4 = T_3$。）每个都在 0 附近贴合曲线，且次数越高，其贴合的范围越宽。

::: figure id=fig-15-2
左图：$\sin x$（蓝色）及其麦克劳林多项式$T_1$、$T_3$和$T_5$。它们在0点附近贴合曲线，且随着次数增加，贴合范围更广，随后便偏离。右图：$0.01 \le x \le 2$的误差$\abs{\sin x - T_n(x)}$，采用对数刻度。它们近似为斜率分别为3、5和7的直线：将$x$减半，$T_n$的误差约除以$2^{n+2}$。
:::

```valuetable
x = 0.1, 0.5, 1, 2, 3
$\sin x$ = sin(x)
$T_1(x)$ = x
$T_3(x)$ = x - x**3/6
$T_5(x)$ = x - x**3/6 + x**5/120
digits = 6
---
x | \sin x | T_1(x) | T_3(x) | T_5(x)
0.1 | 0.0998334 | 0.1 | 0.0998333 | 0.0998334
0.5 | 0.479426 | 0.5 | 0.479167 | 0.479427
1 | 0.841471 | 1 | 0.833333 | 0.841667
2 | 0.909297 | 2 | 0.666667 | 0.933333
3 | 0.141120 | 3 | -1.5 | 0.525
```

在$x = 0.1$处，$T_5$与$\sin x$在所有六个显示的数字上一致，且与$T_3$在五个数字上一致。离0越远，需要的项越多：在$x = 2$处，$T_5$的误差为0.024，在$x = 3$处误差为0.38，而$T_1$的误差接近3。

```check
same(series(sin(x), x, 0, 6).removeO(), x - x**3/6 + x**5/120)
rounds(Rational(1, 10) - Rational(1, 10)**3/6 + Rational(1, 10)**5/120 - sin(Rational(1, 10)), '0.0000000')
rounds(sin(Rational(1, 10)), '0.0998334'); rounds(Rational(1, 10) - Rational(1, 10)**3/6, '0.0998333')
T5_ = lambda v: v - v**3/6 + v**5/120
rounds(T5_(2) - sin(2), '0.024'); rounds(T5_(3) - sin(3), '0.38'); holds(Rational(28, 10) < 3 - sin(3)); holds(3 - sin(3) < 3)
for n_, slope_ in ((1, 3), (3, 5), (5, 7)):                   # the error of T_n near 0 is about x^(n+2)/(n+2)!
    Tn_ = series(sin(x), x, 0, n_ + 1).removeO()
    limit_is((sin(x) - Tn_)/x**slope_, x, 0, (-1)**((n_ + 1)//2)/factorial(slope_))
    same(Rational(2)**slope_, 2**(n_ + 2))
```

为什么泰勒多项式拟合得这么好？因为 $T_n$ 在 $a$ 处与 $f$ 有相同的值和前 $n$ 个导数值：对 $T_n$ 求导 $k$ 次并在 $x = a$ 处代入，会留下 $k!$ 乘以它的 $k$ 次系数，该系数为 $f^{(k)}(a)$，对每个 $k \le n$ 都成立。 $T_1$ 与值和斜率一致，因此是切线； $T_2$ 也与二阶导数一致，这决定了图像的弯曲程度（模块 8）；依此类推。没有其他次数不超过 $n$ 的多项式能做到这一点，因为多项式在 $a$ 处的导数值确定了它的系数（定理 15.5 对多项式也成立，其级数是有限的）。

```check
for n_ in (1, 3, 5):
    Tn_ = series(sin(x), x, 0, n_ + 1).removeO()
    same([diff(Tn_, x, j).subs(x, 0) for j in range(n_ + 1)], [diff(sin(x), x, j).subs(x, 0) for j in range(n_ + 1)])
same([diff(T3s, x, j).subs(x, 4) for j in range(4)], [diff(sqrt(x), x, j).subs(x, 4) for j in range(4)])
```

::: widget name=taylor-explorer
选择一个函数，然后将次数 $n$ 从 0 开始升高，观察 $T_n$（橙色）在中心 $a$ 附近逼近 $f$（蓝色）。读数在探测点 $x_0$ 处比较 $T_n(x_0)$ 与 $f(x_0)$。对于 $e^x$、$\sin x$ 和 $\cos x$，在任意 $x_0$ 处的误差随 $n$ 增大而趋于 0；同时移动中心。对于其余四个函数，绿色带标示收敛半径：在其外部，增加次数并不能使误差趋于 0。尝试在 $\ln(1 + x)$ 处关于 0 使用 $x_0 = 1.5$：误差大小先减小后增大。将 $\arctan x$ 的中心移离 0 并注意半径 $\sqrt{1 + a^2}$；第 15.7 节对此进行了解释。
:::

```check
ln_probe = Rational(3, 2)
ln_errors = [Abs(log(1 + ln_probe) - sum((-1)**(j - 1)*ln_probe**j/j for j in range(1, N_ + 1))) for N_ in range(5)]
holds(ln_errors[0] > ln_errors[1]); holds(ln_errors[1] > ln_errors[2])
holds(ln_errors[2] < ln_errors[3]); holds(ln_errors[3] < ln_errors[4])
```

## 泰勒定理 {#taylor-theorem}

泰勒多项式只有在你知道它与函数之间的差距时才有用。差值

$$R_n(x) = f(x) - T_n(x)$$

是 **余项**，次数为 $n$（$R_n(x)$ 读作 "R n of x"）。由于 $T_n(x)$ 是泰勒级数的一个部分和，当 $R_n(x) \to 0$ 时，$f(x)$ 等于其泰勒级数的和恰好为 $n \to \infty$。泰勒定理给出了余项的一个公式。

::: theorem 泰勒定理
设 $n \ge 0$ 为一个整数，且设 $f$ 在包含 $a$ 的开区间 $I$ 内有直到 $n + 1$ 阶的导数。那么对于每个 $x$ ∈ $I$，

$$\begin{aligned} f(x) &= T_n(x) + R_n(x), \\ R_n(x) &= \frac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}, \end{aligned}$$

存在一个数 $c$ 在 $a$ 与 $x$ 之间（当 $x = a$ 时 $c = a$）。
:::

这种形式的 $R_n$ 是 **拉格朗日余项形式**。对于 $n = 0$，定理说明 $f(x) = f(a) + f'(c)(x - a)$，即平均值定理：泰勒定理是平均值定理的扩展，包含更多项。余项看起来像泰勒级数的下一项 $\dfrac{f^{(n+1)}(a)}{(n + 1)!}(x - a)^{n+1}$，只是导数是在一个未知点 $c$ 而不是 $a$ 处计算的。

::: proof
如果 $x = a$，两边都等于 $f(a)$。因此，设 $x \ne a$，并设 $K$ 是使得

$$f(x) = T_n(x) + \frac{K}{(n + 1)!}(x - a)^{n+1};$$

它存在是因为$(x - a)^{n+1} \ne 0$。任务是证明对于$a$和$x$之间的某个$c$，有$K = f^{(n+1)}(c)$。固定$x$，并定义，对于闭区间$a$到$x$之间的$t$，

$$\begin{aligned} g(t) &= f(x) - \sum_{k=0}^{n} \frac{f^{(k)}(t)}{k!}(x - t)^k \\ &\qquad - \frac{K}{(n + 1)!}(x - t)^{n+1}. \end{aligned}$$

在 $t = x$ 处，所有含有 $k \ge 1$ 的级数项都是 0，含有 $k = 0$ 的项是 $f(x)$，因此 $g(x) = 0$；并且 $g(a) = 0$ 由 $K$ 的选择决定。现在对 $t$ 求导。含有 $k = 0$ 的项 $f(t)$ 的导数是 $f'(t)$，并且根据乘积法则，含有 $k \ge 1$ 的项的导数为

$$\frac{f^{(k+1)}(t)}{k!}(x - t)^k - \frac{f^{(k)}(t)}{(k - 1)!}(x - t)^{k-1}.$$

这些的第二部分相加后，每个的第二部分抵消前一个的第一部分：和 **折叠（telescopes）**，只有 $\dfrac{f^{(n+1)}(t)}{n!}(x - t)^n$ 存在。因此

$$\begin{aligned} g'(t) &= -\frac{f^{(n+1)}(t)}{n!}(x - t)^n \\ &\qquad + \frac{K}{n!}(x - t)^n \\ &= \frac{(x - t)^n}{n!}\big(K - f^{(n+1)}(t)\big). \end{aligned}$$

函数$g$可微，且$g(a) = g(x) = 0$，因此由罗尔定理（模块8）知，存在某个严格介于$a$和$x$之间的$c$，使得$g'(c) = 0$成立。在此处$(x - c)^n \ne 0$，故$K = f^{(n+1)}(c)$。
:::

```check
Kc = symbols('K'); fT = Function('f')
for N_ in range(5):
    gT = fT(x) - sum(diff(fT(t), t, j)/factorial(j)*(x - t)**j for j in range(N_ + 1)) - Kc/factorial(N_ + 1)*(x - t)**(N_ + 1)
    same(diff(gT, t), (x - t)**N_/factorial(N_)*(Kc - diff(fT(t), t, N_ + 1)))
    same(gT.subs(t, x).doit(), 0)
for J_ in range(1, 5):                     # the derivative of the k-th term, k >= 1
    same(diff(diff(fT(t), t, J_)/factorial(J_)*(x - t)**J_, t), diff(fT(t), t, J_ + 1)/factorial(J_)*(x - t)**J_ - diff(fT(t), t, J_)/factorial(J_ - 1)*(x - t)**(J_ - 1))
cE = log(24*(E - Rational(8, 3)))          # the point c for e^x, n = 3, x = 1
same(exp(cE)/factorial(4), E - Rational(8, 3)); holds(0 < cE); holds(cE < 1); rounds(cE, '0.214'); rounds(E - Rational(8, 3), '0.0516')
```

例如，对于 $e^x$ 与 $a = 0$、$n = 3$ 和 $x = 1$，以及 $R_3(1) = e - \tfrac83 \approx 0.0516$，定理保证在 0 和 1 之间存在一个 $c$，满足 $e^c/4! = R_3(1)$：它就是 $c = \ln\big(24(e - \tfrac83)\big) \approx 0.214$。在实际应用中 $c$ 是未知的，你只需要一个界就足够了。

::: keyidea
**泰勒不等式。** 如果 $\abs{f^{(n+1)}(t)} \le M$ 对于每个 $t$ 在 $a$ 与 $x$ 之间，那么

$$\abs{f(x) - T_n(x)} \le \frac{M}{(n + 1)!}\,\abs{x - a}^{n+1}.$$
:::

泰勒定理还说明了 $T_n$ 在 $a$ 附近有多好。假设 $f^{(n+1)}$ 在 $I$ 上连续。在 $I$ 内部某个闭区间围绕 $a$ 上，它是有界的，比如被 $M$ 所限（模块 3 的极值定理），并且对于该区间内的 $x \ne a$

$$\abs{\frac{f(x) - T_n(x)}{(x - a)^n}} \le \frac{M}{(n + 1)!}\,\abs{x - a},$$

哪个在 $x \to a$ 时趋于 0。因此，$T_n$ 的误差即使与 $(x - a)^n$ 相比也很小；对于 $n = 1$，这是定理 7.1。从这个意义上说，$T_n$ 是在 $a$ 附近次数为 $n$ 的最佳多项式逼近。没有其他次数不超过 $n$ 的多项式 $p$ 能做到这一点：如果 $\big(f(x) - p(x)\big)/(x - a)^n$ 也趋于 0，那么 $q(x)/(x - a)^n$ 也会趋于 0，其中 $q = T_n - p$。写出 $q(x) = d_0 + d_1(x - a) + \cdots + d_n(x - a)^n$。然后 $q(x)$，$q(x)/(x - a)$，…，$q(x)/(x - a)^{n-1}$ 也会趋于 0，因为它们是 $q(x)/(x - a)^n$ 乘以 $x - a$ 的幂。第一个极限是 $d_0$，所以 $d_0 = 0$；第二个极限是 $d_1$，所以 $d_1 = 0$；依此类推直到 $d_n = 0$。因此 $p = T_n$。

```check
dq = symbols('d0:4')
qq_ = sum(dq[j]*(x - a)**j for j in range(4))
same(limit(qq_, x, a), dq[0]); same(limit((qq_.subs(dq[0], 0))/(x - a), x, a), dq[1]); same(limit((qq_.subs({dq[0]: 0, dq[1]: 0}))/(x - a)**2, x, a), dq[2])
same(cancel((qq_.subs({dq[0]: 0, dq[1]: 0, dq[2]: 0}))/(x - a)**3), dq[3])
```

### 误差界 {#error-bounds}

::: example 两个误差界
(a) 估计 $\sin 0.5$ 的误差作为 $T_5(0.5)$ 的估计。 (b) 估计 $T_2(4.1)$ 的误差作为 $\sqrt{4.1}$ 的估计（例 15.9），并判断 $T_2(4.1)$ 是太大还是太小。

**(a)** 每个 $\sin$ 的导数都是 $\pm\sin$ 或 $\pm\cos$，因此 $M = 1$ 可用于每个 $n$。利用 $n = 5$，泰勒不等式给出 $\abs{R_5(0.5)} \le 0.5^6/6! \approx 2.2 \times 10^{-5}$。你可以做得更好。在 $x^6$ 的级数中， $\sin x$ 的系数为 0，因此 $T_5 = T_6$，并且使用 $n = 6$

$$\begin{aligned} &\abs{\sin 0.5 - T_5(0.5)} = \abs{R_6(0.5)} \\ &\quad\le \frac{0.5^7}{7!} = \frac{0.0078125}{5040} \\ &\quad\approx 1.55 \times 10^{-6}. \end{aligned}$$

确实 $T_5(0.5) = \tfrac12 - \tfrac{1}{48} + \tfrac{1}{3840} \approx 0.4794271$，而 $\sin 0.5 \approx 0.4794255$：误差约为 $-1.54 \times 10^{-6}$，其大小非常接近上界。

**(b)** 此处 $n = 2$ 和 $f'''(t) = \tfrac38 t^{-5/2}$，随着 $t$ 增大而减小，因此在 $[4, 4.1]$ 上，它在 $t = 4$ 处达到最大值： $M = \tfrac38\cdot 4^{-5/2} = \tfrac{3}{256}$。因此

$$\begin{aligned} &\abs{\sqrt{4.1} - T_2(4.1)} \le \frac{3/256}{3!}\,(0.1)^3 \\ &\quad= \frac{1}{512\,000} \approx 1.95 \times 10^{-6}. \end{aligned}$$

实际误差约为 $1.92 \times 10^{-6}$。拉格朗日形式也给出了符号： $R_2(4.1) = \dfrac{f'''(c)}{3!}(0.1)^3$ 与 $f'''(c) > 0$，因此余项为正， $T_2(4.1) = 2.02484375$ 略微偏小。

```check
rounds(Rational(1, 2)**6/factorial(6), '2.2e-5')
same(series(sin(x), x, 0, 7).removeO(), x - x**3/6 + x**5/120)        # T_6 = T_5
same(Rational(1, 2)**7, Rational(78125, 10**7)); same(factorial(7), 5040); rounds(Rational(1, 2)**7/factorial(7), '1.55e-6')
same(Rational(1, 2)**3/6, Rational(1, 48)); same(Rational(1, 2)**5/120, Rational(1, 3840))
same(T5_(Rational(1, 2)), Rational(1, 2) - Rational(1, 48) + Rational(1, 3840)); rounds(T5_(Rational(1, 2)), '0.4794271')
rounds(sin(Rational(1, 2)), '0.4794255'); rounds(sin(Rational(1, 2)) - T5_(Rational(1, 2)), '-1.54e-6')
holds(Abs(sin(Rational(1, 2)) - T5_(Rational(1, 2))) <= Rational(1, 2)**7/factorial(7))
f3 = diff(sqrt(x), x, 3); same(f3, Rational(3, 8)*x**Rational(-5, 2))
tp = symbols('t_positive', positive=True); holds(diff(f3, x).subs(x, tp).is_negative)
same(f3.subs(x, 4), Rational(3, 256))
same(Rational(3, 256)/factorial(3)*Rational(1, 10)**3, Rational(1, 512000)); rounds(Rational(1, 512000), '1.95e-6')
rounds(sqrt(v41) - T2s.subs(x, v41), '1.92e-6'); holds(sqrt(v41) - T2s.subs(x, v41) > 0)
holds(sqrt(v41) - T2s.subs(x, v41) <= Rational(1, 512000))
```
:::

::: example $e^x$ 在 $[-1, 1]$ 上的多项式
找到一个次数 $n$，使得 $e^x$ 的麦克劳林多项式 $T_n$ 满足 $\abs{e^x - T_n(x)} < 10^{-6}$ 对于每个 $x$ 在 $[-1, 1]$ 内。

每个 $e^x$ 的导数都是 $e^x$，且对于 $t$ 在 0 和 $x$ 之间，满足 $\abs{x} \le 1$， $e^t \le e^1 < 3$。因此 $M = 3$ 就可以了，且

$$\begin{aligned} \abs{e^x - T_n(x)} &\le \frac{3}{(n + 1)!}\abs{x}^{n+1} \\ &\le \frac{3}{(n + 1)!}. \end{aligned}$$

当 $(n + 1)! > 3\,000\,000$ 时，这小于 $10^{-6}$。由于 $9! = 362\,880$ 和 $10! = 3\,628\,800$， $n + 1 = 10$ 就足够了： $T_9$ 在整个区间内与 $e^x$ 的误差不超过 $10^{-6}$。这里的界并不浪费。在 $x = 1$ 处， $T_8$ 的误差大约为 $3.1 \times 10^{-6}$，太大，而 $T_9$ 的误差大约为 $3.0 \times 10^{-7}$。

```check
holds(E < 3); same(factorial(9), 362880); same(factorial(10), 3628800)
holds(Rational(3, factorial(10)) < Rational(1, 10**6)); holds(Rational(3, factorial(9)) > Rational(1, 10**6))
sE = lambda N: sum(Rational(1, factorial(j)) for j in range(N + 1))
rounds(E - sE(8), '3.1e-6'); rounds(E - sE(9), '3.0e-7'); holds(E - sE(8) > Rational(1, 10**6))
for xv in (-1, Rational(-1, 2), Rational(1, 2), 1):
    holds(Abs(exp(xv) - sum(Rational(xv)**j/factorial(j) for j in range(10))) < Rational(1, 10**6))
```
:::

::: pitfall
Taylor 不等式需要 $M$ 来在整个区间 $a$ 和 $x$ 上对 $\abs{f^{(n+1)}}$ 进行限制，而不仅仅是在 $a$ 处。对于 $e^x$ 在 $[0, 1]$ 上，界 $M = f^{(n+1)}(0) = 1$ 太小了：在 $x = 1$ 处它会承诺 $\abs{e - T_9(1)} \le 1/10! \approx 2.8 \times 10^{-7}$，但实际误差是 $3.0 \times 10^{-7}$。应取区间内 $\abs{f^{(n+1)}}$ 的最大值，或任何比它大的数。

```check
rounds(Rational(1, factorial(10)), '2.8e-7'); holds(E - sE(9) > Rational(1, factorial(10)))
```
:::

### 更早近似值的误差 {#earlier-errors}

模块 4 和 7 说明了三种近似值的误差有多大，并将证明留到本模块。此处，与之前相同，误差是精确值减去近似值。

::: theorem 线性近似和差商的误差
1. 若 $f''$ 在含 $a$ 和 $x$ 的开区间内存在，且 $L$ 是 $f$ 在 $a$ 处的线性化，则 $f(x) - L(x) = \dfrac{f''(c)}{2}(x - a)^2$，其中存在一个介于 $a$ 和 $x$ 的 $c$（$x = a$ 时取 $c = a$）。若在 $a$ 和 $x$ 之间还满足 $\abs{f''} \le M$，则 $\abs{f(x) - L(x)} \le \dfrac{M}{2}(x - a)^2$。
2. 设 $h > 0$。如果 $f''$ 在包含 $a$ 和 $a + h$ 的开区间内存在，则前向差分的误差为
   $$f'(a) - \frac{f(a + h) - f(a)}{h} = -\frac{h}{2}f''(c)$$
   对于某些 $c$ 在 $a$ 和 $a + h$ 之间。
3. 设 $h > 0$。如果 $f'''$ 存在且在包含 $a - h$ 和 $a + h$ 的开区间内连续，则中心差分的误差为
   $$\begin{aligned} &f'(a) - \frac{f(a + h) - f(a - h)}{2h} \\ &\quad= -\frac{h^2}{6}f'''(c) \end{aligned}$$
   对于某些 $c$ 在 $a - h$ 和 $a + h$ 之间。
:::

::: proof
第一部分为带有$n = 1$的泰勒定理，因为$T_1 = L$。对于第二部分，将第一部分与$x = a + h$结合使用：$f(a + h) = f(a) + f'(a)h + \tfrac12 f''(c)h^2$。减去$f(a)$并除以$h$以得到前向差分，然后从$f'(a)$中减去该商。对于第三部分，在$x = a + h$和$x = a - h$处使用带有$n = 2$的泰勒定理可得

$$\begin{aligned} f(a \pm h) &= f(a) \pm f'(a)h + \frac{f''(a)}{2}h^2 \\ &\qquad \pm \frac{f'''(c_\pm)}{6}h^3, \end{aligned}$$

其中 $c_+$ 在 $a$ 和 $a + h$ 之间，且 $c_-$ 在 $a - h$ 和 $a$ 之间。相减：项 $f(a)$ 和 $\tfrac12 f''(a)h^2$ 抵消，且

$$\begin{aligned} &f(a + h) - f(a - h) \\ &\quad= 2f'(a)h + \frac{f'''(c_+) + f'''(c_-)}{6}h^3. \end{aligned}$$

除以 $2h$，再从 $f'(a)$ 中减去所得的商。误差等于 $-\dfrac{h^2}{6}$ 乘 $\tfrac12\big(f'''(c_+) + f'''(c_-)\big)$，而后者是 $f'''$ 两个值的平均数。这个平均数介于两值之间。由于 $f'''$ 连续，由中间值定理（模块 3）知，在 $c_-$ 和 $c_+$ 之间存在一个 $c$，使 $f'''(c)$ 恰好等于该平均数。
:::

```check
fd = Function('f'); f2a, f3p, f3m, cc_ = symbols('f2a f3p f3m c')
Tp = fd(a) + diff(fd(a), a)*h + f2a/2*h**2 + f3p/6*h**3          # f(a + h), Lagrange form, f''(a) = f2a, f'''(c+) = f3p
Tm = fd(a) - diff(fd(a), a)*h + f2a/2*h**2 - f3m/6*h**3          # f(a - h)
same(expand(Tp - Tm), expand(2*diff(fd(a), a)*h + (f3p + f3m)/6*h**3))
same(expand(diff(fd(a), a) - (Tp - Tm)/(2*h)), expand(-h**2/6*(f3p + f3m)/2))
same(expand(diff(fd(a), a) - ((fd(a) + diff(fd(a), a)*h + cc_/2*h**2) - fd(a))/h), -h/2*cc_)
a0 = Rational(1, 2)
for fn_ in (exp(x), sin(x), x**4):                                 # exact minus approximation: leading errors -h f''(a)/2 and -h^2 f'''(a)/6
    limit_is((diff(fn_, x).subs(x, a0) - (fn_.subs(x, a0 + h) - fn_.subs(x, a0))/h)/h, h, 0, -diff(fn_, x, 2).subs(x, a0)/2)
    limit_is((diff(fn_, x).subs(x, a0) - (fn_.subs(x, a0 + h) - fn_.subs(x, a0 - h))/(2*h))/h**2, h, 0, -diff(fn_, x, 3).subs(x, a0)/6)
```

如第2部分中的 $h \to 0$， $c$ 被夹逼至 $a$，因此如果 $f''$ 在 $a$ 处连续，误差约为 $-\tfrac{h}{2}f''(a)$；并且如果 $\abs{f''} \le M$ 接近 $a$，其绝对值最多为 $\tfrac{M}{2}h$，因此为 $O(h)$。同样地，第3部分中的误差约为 $-\tfrac{h^2}{6}f'''(a)$，且为 $O(h^2)$。这些是 [第4.7节](module_04_ZH.html#truncation)] 的主张。[第7.2节](module_07_ZH.html#how-good) 的主张由第1部分给出：界 $\tfrac{M}{2}(x - a)^2$，以及当 $f''$ 在 $a$ 处连续时， $f(x) - L(x) \approx \tfrac{f''(a)}{2}(x - a)^2$，因为 $\dfrac{f(x) - L(x)}{(x - a)^2} = \dfrac{f''(c)}{2} \to \dfrac{f''(a)}{2}$ 作为 $x \to a$。

模块7中的牛顿法是第三个受益者。设 $f(r) = 0$，假设 $f''$ 在包含 $x_n$ 和 $r$ 的开区间上存在，并假设 $f'(x_n) \ne 0$。保持模块7的约定 $e_n = x_n - r$ 表示迭代的符号误差：它是上述近似误差约定的反向。如果 $x_n \ne r$，将关于 $x_n$ 的一次泰勒定理在 $r$ 处求值，得到

$$\begin{aligned} 0 = f(r) &= f(x_n) + f'(x_n)(r - x_n) \\ &\qquad + \frac{f''(c_n)}{2}(r - x_n)^2 \end{aligned}$$

对于某个 $c_n$ 在 $x_n$ 和 $r$ 之间。除以 $f'(x_n)$，并使用 $x_{n+1} = x_n - f(x_n)/f'(x_n)$，使得 $f(x_n)/f'(x_n) = x_n - x_{n+1}$：

$$e_{n+1} = \frac{f''(c_n)}{2f'(x_n)}\,e_n^2.$$

如果 $x_n = r$，牛顿法的下一步仍保持在 $r$，因此两个误差都为 0，且关系式仍以 $c_n = r$ 保持成立。模块 7 近似地发现了这个关系，其中 $x_n$ 代替了 $c_n$；此处是精确的。练习 15.12 由此完成定理 7.3 的证明。

```check
fN, f1N, f2N, xN, rN = symbols('f_n f1_n f2_n x_n r')            # f(x_n), f'(x_n), f''(c_n)
eqn = Eq(0, fN + f1N*(rN - xN) + f2N/2*(rN - xN)**2)
fsol = solve(eqn, fN)[0]
same((xN - fsol/f1N) - rN, f2N/(2*f1N)*(xN - rN)**2)
```

### 当级数等于函数 {#series-equals-function}

::: theorem $e^x$， $\sin x$ 和 $\cos x$ 等于它们的级数
对于每一个实数 $x$，

$$\begin{aligned} e^x &= \sum_{n=0}^\infty \frac{x^n}{n!}, \\ \sin x &= \sum_{n=0}^\infty (-1)^n \frac{x^{2n+1}}{(2n + 1)!}, \\ \cos x &= \sum_{n=0}^\infty (-1)^n \frac{x^{2n}}{(2n)!}. \end{aligned}$$
:::

::: proof
固定 $x$；只需证明 $R_n(x) \to 0$ 当 $n \to \infty$。对于 $e^x$，每个导数都是 $e^t$，且对于 $t$ 在 0 和 $x$ 之间， $e^t \le e^{\abs{x}}$。因此泰勒不等式给出

$$\abs{R_n(x)} \le e^{\abs{x}}\,\frac{\abs{x}^{n+1}}{(n + 1)!}.$$

对于 $\sin x$ 和 $\cos x$，每个导数都在 $-1$ 和 1 之间，因此 $\abs{R_n(x)} \le \abs{x}^{n+1}/(n + 1)!$。最后，当 $\abs{x}^{m}/m! \to 0$ 趋于 $m \to \infty$ 时，对于每个 $x$：这些是级数 $\sum \abs{x}^m/m!$ 的项，该级数收敛（例 15.2），而收敛级数的项趋于 0。因此 $R_n(x) \to 0$ 在所有三种情况下都成立。
:::

```check
xa = symbols('x', positive=True)
limit_is(exp(xa)*xa**(n + 1)/factorial(n + 1), n, oo, 0); limit_is(xa**(n + 1)/factorial(n + 1), n, oo, 0)
same(summation(x**n/factorial(n), (n, 0, oo)), exp(x)); same(summation((-1)**n*x**(2*n + 1)/factorial(2*n + 1), (n, 0, oo)), sin(x))
same(summation((-1)**n*x**(2*n)/factorial(2*n), (n, 0, oo)), cos(x))
```

同样的论证适用于任何中心 $a$，因此 $e^x$、$\sin x$ 和 $\cos x$ 在每个点的任意邻域内都等于它们的泰勒级数，对于每个 $x$。在开区间内的每个点附近，等于其泰勒级数和的函数称为 **解析**；$e^x$、$\sin x$ 和 $\cos x$ 在整个实数线上都是解析的。

::: deeper 一个收敛到错误函数的泰勒级数
条件 $R_n(x) \to 0$ 真的需要吗？如果一个泰勒级数收敛，其和必须是 $f$ 吗？不。让

$$f(x) = \begin{cases} e^{-1/x^2} & \text{if } x \ne 0, \\ 0 & \text{if } x = 0. \end{cases}$$

图15.3显示了其图像在0附近多么平坦。事实上，$f$在0处的每阶导数均为0，因此其麦克劳林级数为$0 + 0x + 0x^2 + \cdots$，该级数对任意$x$均收敛于0。但$f(x) > 0$对任意$x \ne 0$成立：级数仅在0处等于$f$，且余项$R_n(x) = f(x)$从不趋于0。

为什么每个在0处的导数都等于0？首先，对于 $x \ne 0$， $f^{(n)}(x) = p_n(1/x)\,e^{-1/x^2}$ 可以表示为某个多项式 $p_n$。这在 $n = 0$ 与 $p_0 = 1$ 的情况下成立，并且如果它在 $n$ 成立，那么链式法则和乘积法则给出

$$\begin{aligned} &f^{(n+1)}(x) \\ &\quad= \Big[\frac{2}{x^3}\,p_n\Big(\frac1x\Big) - \frac{1}{x^2}\,p_n'\Big(\frac1x\Big)\Big]e^{-1/x^2}, \end{aligned}$$

这具有相同的形式，其中 $p_{n+1}(u) = 2u^3p_n(u) - u^2p_n'(u)$。其次，对于每个整数 $m \ge 0$， $u^me^{-u^2} \to 0$ 作为 $u \to \infty$ 和 $u \to -\infty$，因为指数函数增长速度比幂函数快（[第7.7节](module_07_ZH.html#growth)]：对于 $\abs{u} \ge 1$， $u^2 \ge \abs{u}$，所以 $\abs{u}^me^{-u^2} \le \abs{u}^me^{-\abs{u}}$。现在假设 $f^{(n)}(0) = 0$，正如 $n = 0$ 所示。根据导数的定义，带入 $u = 1/x$，

$$\begin{aligned} f^{(n+1)}(0) &= \lim_{x\to0}\frac{f^{(n)}(x) - 0}{x} \\ &= \lim_{x\to0}\frac1x\,p_n\Big(\frac1x\Big)e^{-1/x^2} \\ &= \lim_{u\to\pm\infty} u\,p_n(u)\,e^{-u^2} = 0, \end{aligned}$$

因为 $u\,p_n(u)$ 是 $u$ 的常数倍幂级数之和。通过归纳法， $f^{(n)}(0) = 0$ 对于每一个 $n$ 都成立。因此，这个 $f$ 在每一点都有任意阶导数，但它在 0 处不解析：没有任何以 0 为中心的幂级数等于它在 0 附近任何区间上的值，因为根据定理 15.5，该幂级数必须是它的 Maclaurin 级数，即 0。
:::

::: figure id=fig-15-3
左图： $f(x) = e^{-1/x^2}$ 的图像， $f(0) = 0$ 从原点上升至直线 $y = 1$（虚线）。它的 Maclaurin 级数是 0（橙色）：它在所有点都收敛，但仅在 $x = 0$ 处等于 $f$。右图：在 0 处放大五倍水平方向和约十五倍垂直方向，图像仍然平坦： $f(0.25) = e^{-16} \approx 1.1 \times 10^{-7}$。
:::

```check
fE = exp(-1/x**2); uu = symbols('u')
pE = [Integer(1)]
for N_ in range(1, 5):
    pE.append(expand(2*uu**3*pE[-1] - uu**2*diff(pE[-1], uu)))
for N_ in range(5):
    same(diff(fE, x, N_), pE[N_].subs(uu, 1/x)*fE)
for N_ in range(4):
    limit_is(diff(fE, x, N_)/x, x, 0, 0)
for m_ in range(6):
    limit_is(uu**m_*exp(-uu**2), uu, oo, 0); limit_is(uu**m_*exp(-uu**2), uu, -oo, 0)
same(series(fE, x, 0, 10), O(x**10)); holds(fE.subs(x, Rational(1, 10)) > 0)
rounds(exp(-16), '1.1e-7'); same(fE.subs(x, Rational(1, 4)), exp(-16))
```

## 级数的运算 {#applications}

### e，π 和 ln 2 {#constants}

根据定理 15.9 在 $x = 1$ 处，

$$e = \sum_{n=0}^\infty \frac{1}{n!} = 1 + 1 + \frac{1}{2!} + \frac{1}{3!} + \cdots.$$

它的部分和 $s_n = \sum_{k=0}^{n} 1/k!$ 收敛得很快：

```valuetable
n = 0, 1, 2, 3, 5, 8, 10, 12
$s_n$ = E*uppergamma(n + 1, 1)/factorial(n)
$e - s_n$ = E - E*uppergamma(n + 1, 1)/factorial(n)
digits = 10
---
n | s_n | e - s_n
0 | 1 | 1.718281828
1 | 2 | 0.7182818285
2 | 2.5 | 0.2182818285
3 | 2.666666667 | 0.05161516179
5 | 2.716666667 | 0.001615161792
8 | 2.718278770 | 3.058617775\times10^{-6}
10 | 2.718281801 | 2.731266076\times10^{-8}
12 | 2.718281828 | 1.728766714\times10^{-10}
```

泰勒定理说明了速度。在$a = 0$和$x = 1$的条件下，$e - s_n = R_n(1) = e^c/(n + 1)!$对于某个介于0和1之间的$c$成立，并且$1 < e^c < e < 3$，因此

$$0 < e - s_n < \frac{3}{(n + 1)!}.$$

对 $n = 10$ 的界是 $3/11! \approx 7.5 \times 10^{-8}$；表格显示误差为 $2.7 \times 10^{-8}$。前十三项，直到 $1/12!$，给出 $e$ 的十位有效数字。与 [第6.1节](module_06_ZH.html#compound-interest)，$(1 + 1/n)^n$] 的复利极限相比，即使使用 $n = 525\,600$ 仍只能得到 2.718279。

```check
for N_ in range(13):                                   # the formula of the table is the partial sum
    holds(expand(E*uppergamma(N_ + 1, 1)/factorial(N_)) == sum(Rational(1, factorial(j)) for j in range(N_ + 1)))
cR = symbols('c', positive=True); holds(E < 3); holds(exp(1) > exp(Rational(1, 2)))
rounds(Rational(3, factorial(11)), '7.5e-8'); rounds(E - sE(10), '2.7e-8'); holds(E - sE(10) < Rational(3, factorial(11)))
rounds(sE(12), '2.718281828'); rounds(E, '2.718281828'); rounds((1 + 1/Float(525600, 40))**525600, '2.718279')
```

定理 15.3 的级数对于 $\pi$、$\tfrac{\pi}{4} = 1 - \tfrac13 + \tfrac15 - \cdots$ 来说，计算起来是不可能的：其误差界 $1/(2n + 1)$ 只有在使用了五十万项之后才会低于 $10^{-6}$。解决方法是使用 $\arctan$ 在小数范围内，因为在小数范围内其级数收敛得很快。使用 **Machin's formula**，

$$\frac{\pi}{4} = 4\arctan\frac15 - \arctan\frac{1}{239},$$

习题 15.11 证明了这一点，只需在 $\arctan$ 处使用 $\tfrac15$ 和 $\tfrac{1}{239}$。该级数 $\arctan\tfrac15$ 的每一项的大小大约是前一项的 25 倍小。该级数交替变化，各项的大小递减，因此每个部分和的绝对误差小于被省略的第一项的大小。第一级数取五项，第二级数取两项，得到

$$\begin{aligned} \arctan\frac15 &\approx \frac15 - \frac{1}{3\cdot5^3} + \frac{1}{5\cdot5^5} \\ &\qquad - \frac{1}{7\cdot5^7} + \frac{1}{9\cdot5^9}, \\ \arctan\frac{1}{239} &\approx \frac{1}{239} - \frac{1}{3\cdot239^3}, \end{aligned}$$

绝对误差小于 $\tfrac{1}{11\cdot5^{11}} \approx 1.9 \times 10^{-9}$ 和 $\tfrac{1}{5\cdot239^5} \approx 2.6 \times 10^{-13}$。因此，合并的部分和的绝对误差最多为

$$\frac{16}{11\cdot5^{11}} + \frac{4}{5\cdot239^5} \approx 2.98 \times 10^{-8} < 3 \times 10^{-8}.$$

它们给出$\pi \approx 3.14159268$。在最后一步之前保持边界精确：先舍入边界可能会改变它们的和是否满足目标。这种公式由手工计算$\pi$到数百位数字，由计算机计算到数百万位数字。

```check
holds(Rational(1, 2*500000 + 1) < Rational(1, 10**6)); holds(Rational(1, 2*499999 + 1) > Rational(1, 10**6))
atn = lambda X, N: sum(Rational((-1)**j, 2*j + 1)*X**(2*j + 1) for j in range(N))
for j in range(10):
    same((Rational(1, 5)**(2*j + 3)/(2*j + 3))/(Rational(1, 5)**(2*j + 1)/(2*j + 1)), Rational(2*j + 1, 25*(2*j + 3)))
limit_is((2*n + 1)/(25*(2*n + 3)), n, oo, Rational(1, 25))
rounds(Rational(1, 11*5**11), '1.9e-9'); rounds(Rational(1, 5*239**5), '2.6e-13')
holds(Abs(atan(Rational(1, 5)) - atn(Rational(1, 5), 5)) < Rational(1, 11*5**11)); holds(Abs(atan(Rational(1, 239)) - atn(Rational(1, 239), 2)) < Rational(1, 5*239**5))
pM = 4*(4*atn(Rational(1, 5), 5) - atn(Rational(1, 239), 2)); rounds(pM, '3.14159268')
bound = 16*Rational(1, 11*5**11) + 4*Rational(1, 5*239**5); rounds(bound, '2.98e-8'); holds(bound < Rational(3, 10**8)); holds(Abs(pM - pi) < bound)
holds(Abs(Rational(314159268, 10**8) - pi) < Rational(3, 10**8))
near(4*(4*atan(Rational(1, 5)) - atan(Rational(1, 239))), pi, 1e-25)      # Machin's formula (proved in Exercise 15.11)
```

::: compute π 的前五十位小数
Python 的 `fractions` 模块使用精确分数进行计算，因此可以将 Machin 公式部分和 $\pi$ 比较至任意位数（SymPy 提供 $\pi$ 用于比较）：

```python
from fractions import Fraction
import sympy as sp

def arctan_sum(x, n):
    """The first n terms of x - x**3/3 + x**5/5 - ..., as an exact fraction."""
    return sum(Fraction((-1)**k, 2*k + 1)*x**(2*k + 1) for k in range(n))

def machin(n):
    """Pi from n terms of each series in Machin's formula."""
    p = 4*(4*arctan_sum(Fraction(1, 5), n) - arctan_sum(Fraction(1, 239), n))
    return sp.Rational(p.numerator, p.denominator)

for n in (2, 5, 10, 20, 36):
    print(f"{n:2d} terms: error {sp.N(sp.pi - machin(n), 2)}")
print(sp.N(machin(36), 52))
```

```output
 2 terms: error 0.0010
 5 terms: error -2.9E-8
10 terms: error 1.5E-15
20 terms: error 8.3E-30
36 terms: error 2.0E-52
3.141592653589793238462643383279502884197169399375106
```

打印错误是 $\pi$ 减去近似值。每个级数的每一项增加约 1.4 位有效数字，因为 $\log_{10} 25 \approx 1.4$；每个级数取 36 项，误差约为 $2 \times 10^{-52}$，结果四舍五入到与 $\pi$ 相同的 52 位有效数字。SymPy 用大写字母 `E` 表示十的幂。
:::

```check
rounds(log(25, 10), '1.4')
pF = 4*(4*atn(Rational(1, 5), 36) - atn(Rational(1, 239), 36)); holds(Abs(pF - pi) < Rational(3, 10**52)); holds(Abs(pF - pi) > Rational(1, 10**52))
rounds(pi - pF, '2.0e-52'); same(str(N(pF, 52)), str(N(pi, 52)))
```

对于 $\ln 2$，交错调和级数收敛速度同样缓慢。一个更快的级数来自于两个对数的相减。将 $x$ 替换为 $-x$ 在 $\ln(1 + x)$ 的级数中，得到 $\ln(1 - x) = -x - \tfrac{x^2}{2} - \tfrac{x^3}{3} - \cdots$ 对于 $\abs{x} < 1$。

::: example $\ln 2$ 的快速级数
证明对于 $\abs{x} < 1$

$$\ln\frac{1 + x}{1 - x} = 2\Big(x + \frac{x^3}{3} + \frac{x^5}{5} + \cdots\Big),$$

并用它来求 $\ln 2$ 的六位小数。

将两个级数逐项相减（两者在 $\abs{x} < 1$ 处都收敛）。偶次幂在两个级数中具有相同的系数并相互抵消；奇次幂具有相反的系数并加倍：

$$\begin{aligned} &\ln(1 + x) - \ln(1 - x) \\ &\quad= 2x + \frac{2x^3}{3} + \frac{2x^5}{5} + \cdots, \end{aligned}$$

左边是 $\ln\dfrac{1 + x}{1 - x}$，根据对数的法则。现在 $\dfrac{1 + x}{1 - x} = 2$ 当 $1 + x = 2 - 2x$，即 $x = \tfrac13$。因此

$$\begin{aligned} \ln 2 = 2\Big(&\frac13 + \frac{1}{3\cdot3^3} + \frac{1}{5\cdot3^5} \\ &+ \frac{1}{7\cdot3^7} + \cdots\Big). \end{aligned}$$

每一项都小于前一项的九分之一。如果你在 $n$ 项后停止，被省略的项 $\dfrac{2x^{2k+1}}{2k + 1}$ 对于 $k \ge n$ 来说，最多是 $\dfrac{2x^{2n+1}}{2n + 1}$ 乘以 $1, x^2, x^4, \dots$，这是一个等比数列，因此误差最多为

$$\frac{2x^{2n+1}}{2n + 1}\cdot\frac{1}{1 - x^2} = \frac{2}{(2n + 1)\,3^{2n+1}}\cdot\frac98.$$

对于 $n = 5$ 这个大约是 $1.2 \times 10^{-6}$，还不够；对于 $n = 6$ 这个大约是 $1.1 \times 10^{-7}$。六项的和大约是 $0.69314707$。将精确的误差界加上精确的部分和，得到的值小于 $0.69314719$，而部分和本身大于 $0.69314707$。因此 $\ln 2$ 介于 $0.69314707$ 和 $0.69314719$ 之间：两者都四舍五入到小数点后六位为 $0.693147$，所以 $\ln 2 \approx 0.693147$。交错调和级数要达到同样的精度大约需要一百万项。

```check
same(series(log(1 - x), x, 0, 8).removeO(), -sum(x**j/j for j in range(1, 8)))
same(expand(series(log(1 + x) - log(1 - x), x, 0, 12).removeO()), 2*sum(x**(2*j + 1)/(2*j + 1) for j in range(6)))
same(expand_log(log((1 + x)/(1 - x)), force=True), log(1 + x) - log(1 - x))
same(solve(Eq((1 + x)/(1 - x), 2), x), [Rational(1, 3)])
l2 = lambda N: 2*sum(Rational(1, (2*j + 1)*3**(2*j + 1)) for j in range(N))
holds(all(Rational(1, (2*j + 3)*3**(2*j + 3)) < Rational(1, 9)*Rational(1, (2*j + 1)*3**(2*j + 1)) for j in range(10)))
bd = lambda N: Rational(2, (2*N + 1)*3**(2*N + 1))*Rational(9, 8)
same(bd(5), 2*Rational(1, 3)**11/11/(1 - Rational(1, 9))); rounds(bd(5), '1.2e-6'); rounds(bd(6), '1.1e-7')
rounds(l2(6), '0.69314707'); holds(log(2) - l2(6) > 0); holds(log(2) - l2(6) < bd(6))
holds(Rational(69314707, 10**8) < l2(6)); holds(l2(6) + bd(6) < Rational(69314719, 10**8))
holds(Rational(69314707, 10**8) < log(2)); holds(log(2) < Rational(69314719, 10**8))
rounds(Rational(69314707, 10**8), '0.693147'); rounds(Rational(69314719, 10**8), '0.693147'); rounds(log(2), '0.693147')
holds(Abs(log(2) - l2(5)) > Rational(5, 10**7))                  # five terms are not enough for six decimals
same(Rational(1, 2*10**6), Rational(5, 10**7))                    # its leading error estimate 1/(2n) reaches 5e-7 at n = 10^6
```
:::

### 用级数求极限 {#limits}

级数将许多极限转化为代数。写 $O(x^m)$，如模块 4 所示，表示一个量的大小至多是常数乘以 $\abs{x}^m$，当 $x$ 接近 0 时。泰勒不等式为本模块中的每个函数提供这样的陈述：例如 $\sin x = x - \tfrac{x^3}{6} + O(x^5)$，因为 $T_3 = T_4$ 对于 $\sin$ 和 $\abs{R_4(x)} \le \abs{x}^5/5!$。三个规则由定义得出，当 $x$ 接近 0 时： $x^k\,O(x^m) = O(x^{k+m})$，一项项相加的 $O(x^m)$ 是 $O(x^m)$，且 $O(x^m)$ 也是 $O(x^k)$ 当 $k \le m$。

::: example 两个极限
求 (a) $\displaystyle\lim_{x\to0}\frac{\sin x - x}{x^3}$ 和 (b) $\displaystyle\lim_{x\to0}\frac{e^x\sin x - x - x^2}{x^3}$。

**(a)** 由于 $\sin x - x = -\tfrac{x^3}{6} + O(x^5)$，

$$\frac{\sin x - x}{x^3} = -\frac16 + O(x^2) \to -\frac16.$$

洛必达法则在应用三次后才得到相同的结果。

**(b)** 将 $e^x$ 和 $\sin x$ 的级数相乘，保留至 $x^3$ 的项；所有更高次的乘积归入 $O(x^4)$：

$$\begin{aligned} &e^x\sin x \\ &\quad= \Big(1 + x + \frac{x^2}{2} + O(x^3)\Big) \\ &\qquad\times\Big(x - \frac{x^3}{6} + O(x^5)\Big) \\ &\quad= x + x^2 + \Big(\frac12 - \frac16\Big)x^3 + O(x^4) \\ &\quad= x + x^2 + \frac{x^3}{3} + O(x^4). \end{aligned}$$

So $\dfrac{e^x\sin x - x - x^2}{x^3} = \dfrac13 + O(x) \to \dfrac13$.

```check
same(series(sin(x) - x, x, 0, 5).removeO(), -x**3/6); limit_is((sin(x) - x)/x**3, x, 0, -Rational(1, 6))
same(series((sin(x) - x)/x**3 + Rational(1, 6), x, 0, 3).removeO(), x**2/120)
same(series(exp(x)*sin(x), x, 0, 4).removeO(), x + x**2 + x**3/3)
prod_ = expand((1 + x + x**2/2)*(x - x**3/6)); same(sum(prod_.coeff(x, j)*x**j for j in range(4)), x + x**2 + x**3/3)
same(Rational(1, 2) - Rational(1, 6), Rational(1, 3)); limit_is((exp(x)*sin(x) - x - x**2)/x**3, x, 0, Rational(1, 3))
F_ = sin(x) - x; G_ = x**3                                   # three rounds of L'Hopital: the forms stay 0/0 until the third
same([diff(F_, x, j).subs(x, 0) for j in range(3)], [0, 0, 0]); same([diff(G_, x, j).subs(x, 0) for j in range(3)], [0, 0, 0])
same(diff(F_, x, 3).subs(x, 0)/diff(G_, x, 3).subs(x, 0), -Rational(1, 6))
```
:::

::: pitfall
保持足够的术语。当仅有 $\sin x \approx x$ 时，(a) 中的分子变为 $x - x = 0$，极限似乎为 0。被抵消掉的项中，决定极限的是最后一个未被抵消的项，因此应将每个函数展开，直到出现与分母同阶的非零项，并将 $O(\cdot)$ 项带入以查看你遗漏了什么。
:::

### 物理中的近似 {#physics}

物理学家经常用函数的前几项泰勒展开来代替函数，泰勒定理告诉他们因此损失了什么。

::: example 低速下的动能
在狭义相对论中，静止质量为 $m > 0$ 的物体以速度 $0 \le v < c$ 运动时，其动能为

$$E_k = mc^2\Big(\frac{1}{\sqrt{1 - v^2/c^2}} - 1\Big),$$

其中 $c = 299\,792\,458$ m/s 是光速。证明当 $v/c$ 较小时，这个表达式接近牛顿的 $\tfrac12 mv^2$，并估计牛顿公式的相对误差。

将 $x = v^2/c^2$ 代入例题 15.10(b)， $\dfrac{1}{\sqrt{1 - x}} = 1 + \dfrac{x}{2} + \dfrac{3x^2}{8} + \cdots$：

$$\begin{aligned} E_k &= mc^2\Big(\frac{v^2}{2c^2} + \frac{3v^4}{8c^4} + \cdots\Big) \\ &= \frac12 mv^2 + \frac{3mv^4}{8c^2} + \cdots. \end{aligned}$$

牛顿公式是第一项。第二项除以第一项是 $\tfrac34\,v^2/c^2$：即大致是 $\tfrac12mv^2$ 的相对误差。在 $v = 0.1c$ 时为 0.75%；精确值为 $E_k \approx 0.0050378\,mc^2$ 对 $\tfrac12mv^2 = 0.005\,mc^2$，相对误差确实为 0.75%。对于任何速度至多 300 m/s，即 $v^2/c^2 < 1.1 \times 10^{-12}$，牛顿公式精确到百万分之一百万。

```check
same(series(1/sqrt(1 - x) - 1, x, 0, 3).removeO(), x/2 + 3*x**2/8)
mm, vv, cc2 = symbols('m v c', positive=True)
Ek = mm*cc2**2*(1/sqrt(1 - vv**2/cc2**2) - 1)
same(series(Ek, vv, 0, 6).removeO(), mm*vv**2/2 + 3*mm*vv**4/(8*cc2**2))
same((3*mm*vv**4/(8*cc2**2))/(mm*vv**2/2), Rational(3, 4)*vv**2/cc2**2)
b_ = Rational(1, 10); g1 = 1/sqrt(1 - b_**2) - 1
rounds(g1, '0.0050378'); same(b_**2/2, Rational(5, 1000)); rounds(100*(g1 - b_**2/2)/g1, '0.75'); same(100*Rational(3, 4)*b_**2, Rational(75, 100))
holds((Rational(300, 299792458))**2 < Rational(11, 10**13))
holds(Rational(3, 4)*(Rational(300, 299792458))**2 < Rational(1, 10**12))
```
:::

例 7.6 中的小角度近似 $\sin\theta \approx \theta$ 是正弦函数的泰勒多项式 $T_1$。模块 7 用表格测量了其相对误差；级数解释了该表格。由于 $\theta - \sin\theta = \tfrac{\theta^3}{6} + O(\theta^5)$ 和 $\sin\theta = \theta\big(1 + O(\theta^2)\big)$，

$$\frac{\theta - \sin\theta}{\sin\theta} = \frac{\theta^2}{6} + O(\theta^4).$$

在 $\theta = 0.1$ 时，这给出 $0.001667$，相对于模块 7 表格中的 $0.001669$，并解释了为何误差随 $\theta$ 每增加十倍而增长约一百倍。对于长度为 $L$ 的单摆，小角度近似给出熟悉的周期 $2\pi\sqrt{L/g}$，无论小幅度摆动如何，周期相同。物理教科书通过一个更长的计算，其中二项式级数出现在积分中，表明幅度为 $\theta_0$（弧度）的摆动所需时间为

$$T = 2\pi\sqrt{\frac{L}{g}}\,\Big(1 + \frac{\theta_0^2}{16} + \cdots\Big).$$

所以一个摆角为 0.1 弧度（约 $6^\circ$）的摆动，比小角度公式所预测的时间长约 0.06%，一个摆角为 0.5 弧度的摆动则长约 1.6%。

```check
same(series((theta - sin(theta))/sin(theta), theta, 0, 4).removeO(), theta**2/6)
rounds(Rational(1, 100)/6, '0.001667'); rounds((Rational(1, 10) - sin(Rational(1, 10)))/sin(Rational(1, 10)), '0.001669')
mk = symbols('m', positive=True)
same(series(2/pi*elliptic_k(sin(theta/2)**2), theta, 0, 4).removeO(), 1 + theta**2/16)   # the exact period, divided by 2 pi sqrt(L/g)
rounds(Rational(1, 10)*180/pi, '6'); rounds(100*Rational(1, 100)/16, '0.06'); rounds(100*Rational(1, 4)/16, '1.6')
rounds(100*(2/pi*elliptic_k(sin(Rational(1, 4))**2) - 1), '1.6')
```

### 如何计算函数值 {#libraries}

数学库通常使用区间缩减和多项式逼近来计算如 $\sin x$ 和 $e^x$ 这样的函数。Python 的 `math` 函数大多调用平台的 C 数学库，因此具体实现依赖于系统。以下是两个步骤的思路。

**范围缩减。** 麦克劳林级数 $\sin$ 对于每一个 $x$ 都收敛，但对于较大的 $x$ 来说它无用：在 $x = 100$ 处，其项在缩小之前会增长到约 $10^{42}$，然后才缩小，在浮点运算中，这些项的和是一个介于 $-1$ 和 1 之间的数，会在舍入中丢失。因此，库函数首先利用 $\sin$ 的对称性使 $x$ 变小。写成 $x = k\cdot\tfrac{\pi}{2} + r$，其中 $k$ 是最接近 $x/(\pi/2)$ 的整数，使得 $\abs{r} \le \pi/4$。根据模块 1 的加法公式， $\sin x$ 是 $\sin r$、 $\cos r$、 $-\sin r$ 或 $-\cos r$，取决于 $k$ 除以 4 的余数为 0、1、2 或 3。

**多项式。** 对于 $\abs{r} \le \pi/4$ 泰勒多项式收敛迅速。由于 $T_{15} = T_{16}$ 对于 $\sin$，泰勒不等式给出

$$\abs{\sin r - T_{15}(r)} \le \frac{(\pi/4)^{17}}{17!} \approx 4.6 \times 10^{-17},$$

and $T_{16}$ 有更小的上界用于 $\cos r$。这限制了多项式近似误差；在浮点数中进行计算会引入舍入误差。对于 $\cos r$ 的偶多项式，以及在 $\sin r$ 近似中 $r$ 的多项式因子，可以从内向外计算为 $c_0 + u\big(c_1 + u(c_2 + \cdots)\big)$ 与 $u = r^2$。这是 **霍纳法则（Horner's rule）**：从最高次系数开始，每个剩余系数需要一次乘法和一次加法。

```check
mx = max(range(1, 300), key=lambda j: Rational(100)**j/factorial(j)); same(mx, 99)
rounds(Rational(100)**100/factorial(100), '1e42'); same(Rational(100)**99/factorial(99), Rational(100)**100/factorial(100))
for K_, val in ((0, sin(theta)), (1, cos(theta)), (2, -sin(theta)), (3, -cos(theta))):
    same(expand_trig(sin(K_*pi/2 + theta)), val)
same(series(sin(x), x, 0, 17).removeO(), series(sin(x), x, 0, 16).removeO())
rounds((pi/4)**17/factorial(17), '4.6e-17'); holds((pi/4)**18/factorial(18) < (pi/4)**17/factorial(17))
```

生产库对这两个步骤进行了优化。它们通常使用针对整个区间调优的系数，而不是泰勒级数的系数。一种方法是使用 **最小最大多项式（minimax polynomials）**，它在给定次数的多项式中最小化区间上的最大绝对误差。准确的范围缩减还需要额外的 $\pi$ 位，因为对于较大的 $x$，减法 $x - k\pi/2$ 会抵消前导数字，如模块 2 所示。指数函数也可以类似处理：写成 $x = k\ln 2 + r$ 与 $\abs{r} \le \tfrac12\ln 2$；然后 $e^x = 2^ke^r$。在该小区间上近似 $e^r$，并用 $2^k$ 进行重新缩放。

::: compute 你自己的正弦函数
范围缩减和一个 15 次泰勒多项式已经可以得到一个很好的正弦函数：

```python
import math

S = [(-1)**j/math.factorial(2*j + 1) for j in range(8)]    # sin: r, r^3, ..., r^15
C = [(-1)**j/math.factorial(2*j) for j in range(9)]        # cos: 1, r^2, ..., r^16

def poly(coeffs, u):
    """c0 + c1*u + c2*u**2 + ..., by Horner's rule."""
    total = 0.0
    for c in reversed(coeffs):
        total = total*u + c
    return total

def my_sin(x):
    k = round(x/(math.pi/2))           # x = k*(pi/2) + r with |r| <= pi/4
    r = x - k*(math.pi/2)
    s, c = r*poly(S, r*r), poly(C, r*r)
    return [s, c, -s, -c][k % 4]

for x in [0.5, 2.0, 10.0, 1000.0, 1e6]:
    print(f"x = {x:>9}: my_sin = {my_sin(x):+.16f}, math.sin = {math.sin(x):+.16f}")
```

```output
x =       0.5: my_sin = +0.4794255386042030, math.sin = +0.4794255386042030
x =       2.0: my_sin = +0.9092974268256817, math.sin = +0.9092974268256817
x =      10.0: my_sin = -0.5440211108893701, math.sin = -0.5440211108893698
x =    1000.0: my_sin = +0.8268795405320475, math.sin = +0.8268795405320025
x = 1000000.0: my_sin = -0.3499935020939287, math.sin = -0.3499935021712929
```

对于 $x = 0.5$ 和 2，两种算法在输出的每一位上都一致。对于 $x = 10$，只有最后一位不同。这些例子中，差异随 $x$ 增大，在 $x = 10^6$ 处约为 $8 \times 10^{-11}$。主要误差来自自变量约简。`math.pi/2` 是把 $\pi/2$ 舍入到约 16 位所得。$r = x - k\cdot\tfrac{\pi}{2}$ 继承了该舍入误差的 $k$ 倍，其中 $k$ 约为 $x/1.57$；它还受到对 $k\cdot\tfrac{\pi}{2}$ 舍入的影响，该数几乎与 $x$ 一样大。数学库可以在约简时使用更多位的 $\pi$ 来避免这种精度损失。具体算法及最后输出的数字取决于平台。
:::

```check
holds(Abs(N(pi/2, 30) - Float(1.5707963267948966, 30)) < 10**-16); holds(Abs(N(pi/2, 30) - Float(1.5707963267948966, 30)) > 5*10**-17)
rounds(Abs(-0.3499935020939287 - (-0.3499935021712929)), '8e-11'); rounds(1e6/1.5707963267948966, '636620')
holds(Abs(-0.3499935021712929 - sin(Integer(10**6))) < 10**-15)              # math.sin is right to the digits printed
holds(Abs(0.4794255386042030 - sin(Rational(1, 2))) < 10**-16); holds(Abs(-0.5440211108893701 - sin(10)) < 10**-15)
```

## 欧拉公式 {#euler}

三个标准级数看起来相似。 $e^x$ 的级数包含 $x$ 的所有幂次，符号为加号； $\sin x$ 包含奇数次幂， $\cos x$ 包含偶数次幂，符号交替变化，且具有相同的阶乘因子。复数表明这并非巧合：这三个级数代表同一个函数。

### 复数 {#complex}

方程 $x^2 + 1 = 0$ 没有实数解，因为 $x^2 \ge 0$ 对于每一个实数 $x$ 都不成立。数学家引入一个新的数 $i$，它与 $i^2 = -1$ 一起，像代数中的字母一样进行运算，将 $i^2$ 替换为 $-1$，只要它出现的地方。模块 13 遇到过这样的数，作为特征方程的复根；本节只需要它们后面的一些内容。

::: definition 复数
一个 **复数**是一个数 $z = p + qi$，其中 $p$ 和 $q$ 是实数，且 $i$，即**虚数单位**，满足 $i^2 = -1$。实数 $p$ 是 $z$ 的 **实部**，而 $q$ 是它的 **虚部**。复数的加法和乘法像字母 $i$ 的表达式一样进行，其中 $i^2$ 被替换为 $-1$：对于 $z = p + qi$ 和 $w = r + si$，

$$\begin{aligned} z + w &= (p + r) + (q + s)i, \\ zw &= (pr - qs) + (ps + qr)i. \end{aligned}$$

两个复数相等当且仅当它们的实部相等且虚部相等。复数 $z = p + qi$ 的 **模** 是 $\abs{z} = \sqrt{p^2 + q^2}$。
:::

实数是虚部为0的复数。将$z = p + qi$视为平面$(p, q)$上的点，即**复平面**，其实部沿水平轴，虚部沿垂直轴；则$\abs{z}$是$z$到0的距离，展开乘法可知$\abs{zw} = \abs{z}\,\abs{w}$。$i$的幂以4为周期循环：

$$\begin{aligned} &i^0 = 1, \quad i^1 = i, \quad i^2 = -1, \\ &i^3 = -i, \quad i^4 = 1, \quad i^5 = i, \ \dots \end{aligned}$$

乘以 $i$ 会使平面绕 0 点逆时针旋转四分之一圈：即 $i(p + qi) = -q + pi$，因此点 $(p, q)$ 移动到 $(-q, p)$。

```check
same(I**2, -1); same([I**j for j in range(6)], [1, I, -1, -I, 1, I])
pc, qc, rc, sc = symbols('p q r s', real=True)
same(expand((pc + qc*I) + (rc + sc*I)), (pc + rc) + (qc + sc)*I); same(expand((pc + qc*I)*(rc + sc*I)), (pc*rc - qc*sc) + (pc*sc + qc*rc)*I)
same(Abs(pc + qc*I), sqrt(pc**2 + qc**2)); same(expand((pc*rc - qc*sc)**2 + (pc*sc + qc*rc)**2), expand((pc**2 + qc**2)*(rc**2 + sc**2)))
same(expand(I*(pc + qc*I)), -qc + pc*I)
```

一列复数收敛当且仅当它们实部的级数与虚部的级数均收敛；此时其和为实部级数的和加上 $i$ 乘以虚部级数的和。若 $\sum \abs{z_n}$ 收敛，则 $\sum z_n$ 也收敛：复数 $z_n$ 的实部与虚部的绝对值均不超过 $\abs{z_n}$，因此两个实数级数均绝对收敛，由比较判别法可知。

::: definition 复数的指数函数
对于每一个复数 $z$，

$$e^z = \sum_{n=0}^\infty \frac{z^n}{n!} = 1 + z + \frac{z^2}{2!} + \frac{z^3}{3!} + \cdots.$$
:::

级数对于每一个 $z$ 都收敛，因为 $\abs{z^n/n!} = \abs{z}^n/n!$ 和 $\sum \abs{z}^n/n!$ 都收敛（例 15.2）。对于实数 $z$，它是熟悉的 $e^x$，根据定理 15.9。指数法则 $e^{z+w} = e^z e^w$ 对复数 $z$ 和 $w$ 也成立。其证明将两个级数逐项相乘并收集项，使用二项式定理；它依赖于一个关于绝对收敛级数相乘的定理，本课程不证明该定理。

```check
same(summation(rc**n/factorial(n), (n, 0, oo)), exp(rc)); same(Abs((3 + 4*I)**3), Abs(3 + 4*I)**3); same(Abs((3 + 4*I)*(1 - 2*I)), Abs(3 + 4*I)*Abs(1 - 2*I))
zA, wA = symbols('z w')
same(expand(sum(zA**j/factorial(j) for j in range(5))*sum(wA**j/factorial(j) for j in range(5))).as_poly(zA, wA).as_expr().subs({zA: 0}), sum(wA**j/factorial(j) for j in range(5)))
for N_ in range(1, 6):                          # the terms of degree N in e^z e^w add up to (z + w)^N/N!, by the binomial theorem
    same(sum(zA**j/factorial(j)*wA**(N_ - j)/factorial(N_ - j) for j in range(N_ + 1)), (zA + wA)**N_/factorial(N_))
```

### e 的虚数次幂 {#euler-formula}

::: theorem 欧拉公式
对于每一个实数 $\theta$，

$$e^{i\theta} = \cos\theta + i\sin\theta.$$
:::

::: proof
将 $z = i\theta$ 代入级数中。由于 $(i\theta)^n = i^n\theta^n$ 和 $i$ 的幂在 $1, i, -1, -i$ 上循环，

$$\begin{aligned} e^{i\theta} &= 1 + i\theta - \frac{\theta^2}{2!} - i\,\frac{\theta^3}{3!} \\ &\qquad + \frac{\theta^4}{4!} + i\,\frac{\theta^5}{5!} - \cdots. \end{aligned}$$

项的实部为 $1, 0, -\tfrac{\theta^2}{2!}, 0, \tfrac{\theta^4}{4!}, \dots$：即 $\cos\theta$ 的级数项，中间穿插零，这不会改变级数是否收敛或其和。虚部为 $0, \theta, 0, -\tfrac{\theta^3}{3!}, 0, \tfrac{\theta^5}{5!}, \dots$：即 $\sin\theta$ 的级数，中间穿插零。根据定理 15.9，这些收敛到 $\cos\theta$ 和 $\sin\theta$，因此 $e^{i\theta} = \cos\theta + i\sin\theta$。
:::

```check
thr = symbols('theta', real=True)
ser_ = expand(sum((I*thr)**j/factorial(j) for j in range(12))); re_, im_ = ser_.as_real_imag()
same(re_, sum((-1)**j*thr**(2*j)/factorial(2*j) for j in range(6))); same(im_, sum((-1)**j*thr**(2*j + 1)/factorial(2*j + 1) for j in range(6)))
same(expand(exp(I*thr), complex=True), cos(thr) + I*sin(thr))
```

在 $\theta = \pi$ 处， $\cos\pi = -1$ 和 $\sin\pi = 0$，因此

$$e^{i\pi} = -1, \qquad\text{that is,}\qquad e^{i\pi} + 1 = 0:$$

一个将数学中五个最重要的数字0、1、$e$、$i$和$\pi$联系起来的方程。图15.4展示了欧拉公式的含义。复数$e^{i\theta}$是点$(\cos\theta, \sin\theta)$，即[小节 1.4](module_01_ZH.html#trig)单位圆上角度为$\theta$的点，其模为1。随着$\theta$的增加，$e^{i\theta}$沿圆周逆时针移动，每经过$2\pi$完成一次循环。

::: figure id=fig-15-4
左图：由欧拉公式，$e^{i\theta} = \cos\theta + i\sin\theta$是复平面单位圆上角度为$\theta$的点，实部为$\cos\theta$（绿色），虚部为$\sin\theta$（蓝色）。右图：级数$e^{i\pi}$的级数$\sum (i\pi)^n/n!$的部分和$S_N$。每一项都是前一项乘以$i\pi/n$，因此路径在每一步都向左转直角，并螺旋收敛至$-1$。
:::

```check
same(exp(I*pi), -1); same(exp(I*pi) + 1, 0); same(Abs(exp(I*thr)), 1); same(exp(I*thr).as_real_imag(), (cos(thr), sin(thr)))
nQ2 = symbols('n', integer=True, positive=True)
same(((I*pi)**nQ2/factorial(nQ2))/((I*pi)**(nQ2 - 1)/factorial(nQ2 - 1)), I*pi/nQ2)
Sp = [sum((I*pi)**j/factorial(j) for j in range(N_ + 1)) for N_ in range(26)]
same(Sp[1], 1 + I*pi); same(Sp[2], 1 + I*pi - pi**2/2); holds(Abs(N(Sp[25]) + 1) < 10**-12)
```

将欧拉公式中的 $\theta$ 替换为 $-\theta$，得到 $e^{-i\theta} = \cos\theta - i\sin\theta$，因为 $\cos$ 是偶函数，而 $\sin$ 是奇函数。将这两个公式相加和相减，

$$\cos\theta = \frac{e^{i\theta} + e^{-i\theta}}{2}, \qquad \sin\theta = \frac{e^{i\theta} - e^{-i\theta}}{2i},$$

模块6中 $\cosh x = \tfrac12(e^x + e^{-x})$ 和 $\sinh x = \tfrac12(e^x - e^{-x})$ 的近亲。指数法则转化为模块1中的加法公式。从 $e^{i(x + y)} = e^{ix}e^{iy}$，

$$\begin{aligned} &\cos(x + y) + i\sin(x + y) \\ &\quad= (\cos x + i\sin x)(\cos y + i\sin y) \\ &\quad= (\cos x\cos y - \sin x\sin y) \\ &\qquad + i(\sin x\cos y + \cos x\sin y), \end{aligned}$$

比较实部，然后比较虚部，可以同时得到两个公式。

```check
same(expand(exp(-I*thr), complex=True), cos(thr) - I*sin(thr))
same(expand_complex((exp(I*thr) + exp(-I*thr))/2), cos(thr)); same(expand_complex((exp(I*thr) - exp(-I*thr))/(2*I)), sin(thr))
same(cosh(x).rewrite(exp), (exp(x) + exp(-x))/2); same(sinh(x).rewrite(exp), (exp(x) - exp(-x))/2)
xr2, yr2 = symbols('x y', real=True)
same(expand((cos(xr2) + I*sin(xr2))*(cos(yr2) + I*sin(yr2))), (cos(xr2)*cos(yr2) - sin(xr2)*sin(yr2)) + I*(sin(xr2)*cos(yr2) + cos(xr2)*sin(yr2)))
same(expand_trig(cos(xr2 + yr2)), cos(xr2)*cos(yr2) - sin(xr2)*sin(yr2)); same(expand_trig(sin(xr2 + yr2)), sin(xr2)*cos(yr2) + cos(xr2)*sin(yr2))
```

复数还回答了第 15.2 节的问题。为什么 $1/(1 + x^2)$ 的级数到了 $x = \pm1$ 就不再收敛，而原函数在那里却无异常？在 $1/(1 + z^2)$ 中允许 $z$ 为复数时，分母在 $z = \pm i$ 处为零，这些点在复平面上到 0 的距离为 1。复分析的一个定理（本教程范围之外）表明，既约有理函数在实数 $a$ 处展开时，泰勒级数的收敛半径为 $a$ 到最近的分母零点的距离。函数在实轴之外的 $\pm i$ 处无界，所以级数不能在超过该距离的点处收敛。以 $a = 1$ 为中心时，半径是 $\abs{1 - i} = \sqrt2$。由于 $\arctan x$ 是 $1/(1 + x^2)$ 的积分，而逐项积分保持收敛半径（定理 15.2），$\arctan x$ 在 $a$ 处的展开半径是 $\abs{a - i} = \sqrt{1 + a^2}$。第 15.4 节的交互演示展示了这一点。

```check
zc = symbols('z'); same_set(solve(1 + zc**2, zc), [I, -I]); same(Abs(I), 1); same(Abs(1 - I), sqrt(2))
arl = symbols('a', real=True); same(Abs(arl - I), sqrt(1 + arl**2))
cser = series(1/(1 + (1 + u)**2), u, 0, 16).removeO()          # about a = 1: |c_n| <= 2^(-(n+1)/2); for even n it equals 2^(-n/2-1)
for j in range(16):
    same(cser.coeff(u, j), (-1)**j*sin((j + 1)*pi/4)/2**(Rational(j + 1, 2)))
limit_is((2**(-n - 1))**(1/(2*n)), n, oo, 1/sqrt(2))          # even coefficients have this root limit, so the radius is sqrt(2)
```

::: pitfall
并非所有实数指数的规则都适用于复数。对于实数，$e^x = e^y$ 强制 $x = y$；对于复数则不成立，因为 $e^{2\pi i} = \cos 2\pi + i\sin 2\pi = 1 = e^0$，尽管 $2\pi i \ne 0$。复数指数具有周期 $2\pi i$，因此不能像实数那样进行约简或取对数。

```check
same(exp(2*pi*I), 1); same(exp(0), 1); same(exp(zA + 2*pi*I), exp(zA))
```
:::

### 振荡 {#oscillations}

模块 13 解决了如 $y'' + py' + qy = 0$ 这样的常系数方程，其中 $p$ 和 $q$ 是实常数，通过尝试 $y = e^{rt}$，从而得到特征方程 $r^2 + pr + q = 0$。当 $p^2 < 4q$ 时，该方程无实根。其实解包括 $e^{at}\cos bt$ 和 $e^{at}\sin bt$，其中 $a = -\tfrac{p}{2}$ 和 $b = \tfrac12\sqrt{4q - p^2}$。此处 $a$ 和 $b$ 是根的实部和虚部，称为 $\alpha$ 和 $\beta$，在模块 13 中它们不是 $y''$ 和 $y'$ 的系数。模块 13 通过代入验证了这些解。欧拉公式展示了它们的来源。

根据二次公式，根为 $r = -\tfrac{p}{2} \pm \tfrac12\sqrt{p^2 - 4q}$。当 $p^2 < 4q$ 时，数 $p^2 - 4q$ 为负数，且 $\big(i\sqrt{4q - p^2}\big)^2 = -(4q - p^2) = p^2 - 4q$；因此根为复数 $r = a \pm bi$。

**复数根给出复数解。** 一个实变量的函数 $t$ 有复值， $u(t) + i\,v(t)$，通过对其实部和虚部分别求导来求导。对于 $r = a + bi$，欧拉公式和指数法则给出 $e^{rt} = e^{at}e^{ibt} = e^{at}\cos bt + i\,e^{at}\sin bt$，并通过乘积法则

$$\begin{aligned} \frac{d}{dt}e^{rt} &= e^{at}(a\cos bt - b\sin bt) \\ &\qquad + i\,e^{at}(a\sin bt + b\cos bt) \\ &= (a + bi)\,e^{at}(\cos bt + i\sin bt) \\ &= r\,e^{rt}, \end{aligned}$$

乘开 $(a + bi)(\cos bt + i\sin bt)$ 可以确认。因此 $(e^{rt})'' = r^2e^{rt}$，且 $y = e^{rt}$ 给出 $y'' + py' + qy = (r^2 + pr + q)\,e^{rt} = 0$，与实根的情况完全相同。

**它们的实部和虚部是实数解。** 如果 $y = u + iv$ 解方程，其中 $u$ 和 $v$ 是实函数，那么，由于 $p$ 和 $q$ 是实数，

$$\begin{aligned} 0 &= y'' + py' + qy \\ &= (u'' + pu' + qu) + i\,(v'' + pv' + qv), \end{aligned}$$

并且复数为 0 当且仅当其实部和虚部都为 0。因此 $u$ 和 $v$ 是解。 $e^{(a+bi)t}$ 的实部和虚部分别为 $e^{at}\cos bt$ 和 $e^{at}\sin bt$：第 13 模块的解。根的虚部 $b$ 使它们振荡，因为 $e^{ibt}$ 绕单位圆旋转；实部 $a$ 决定振荡是衰减（$a < 0$）、增长（$a > 0$）还是保持不变（$a = 0$）。

```check
pq_, qq3 = symbols('p q', real=True)
same_set(solve(r**2 + pq_*r + qq3, r), [-pq_/2 - sqrt(pq_**2 - 4*qq3)/2, -pq_/2 + sqrt(pq_**2 - 4*qq3)/2])
dpos = symbols('d', positive=True); same((I*sqrt(dpos))**2, -dpos)
ar2, br2 = symbols('a b', real=True); tr = symbols('t', real=True)
Yc = exp(ar2*tr)*cos(br2*tr) + I*exp(ar2*tr)*sin(br2*tr)
same(expand(exp((ar2 + I*br2)*tr), complex=True), expand(Yc))
same(expand(diff(Yc, tr)), expand((ar2 + I*br2)*Yc))
same(expand(diff(exp(ar2*tr)*cos(br2*tr), tr)), expand(exp(ar2*tr)*(ar2*cos(br2*tr) - br2*sin(br2*tr))))
same(expand((ar2 + I*br2)*(cos(br2*tr) + I*sin(br2*tr))), expand((ar2*cos(br2*tr) - br2*sin(br2*tr)) + I*(ar2*sin(br2*tr) + br2*cos(br2*tr))))
same(expand((r**2 + pq_*r + qq3).subs({r: ar2 + I*br2, pq_: -2*ar2, qq3: ar2**2 + br2**2})), 0)   # a + bi is a root when p = -2a, q = a^2 + b^2
for part in (exp(ar2*tr)*cos(br2*tr), exp(ar2*tr)*sin(br2*tr)):
    same(simplify(diff(part, tr, 2) - 2*ar2*diff(part, tr) + (ar2**2 + br2**2)*part), 0)
```

::: example 阻尼弹簧
一个带有阻尼的弹簧上的质量按照 $y'' + 2y' + 10y = 0$ 运动，其中 $y$ 是位移， $t$ 是时间（例如，以秒为单位）。使用欧拉公式找出实数解，并描述这种运动。

特征方程 $r^2 + 2r + 10 = 0$ 的根为

$$\begin{aligned} r &= \frac{-2 \pm \sqrt{4 - 40}}{2} \\ &= \frac{-2 \pm 6i}{2} = -1 \pm 3i, \end{aligned}$$

因为 $\sqrt{-36} = 6i$ 按照上述意义： $(6i)^2 = -36$。因此 $e^{(-1+3i)t} = e^{-t}(\cos 3t + i\sin 3t)$ 是一个复数解，其实部和虚部分别给出实数解 $e^{-t}\cos 3t$ 和 $e^{-t}\sin 3t$；第13章的一般解为 $y = e^{-t}(C_1\cos 3t + C_2\sin 3t)$。三角函数因子的周期为 $2\pi/3 \approx 2.09$ 秒。位移本身不是周期性的：其振幅包络线按因子 $e^{-t}$ 减小，每 $\ln 2 \approx 0.69$ 秒减半。

```check
same_set(solve(r**2 + 2*r + 10, r), [-1 + 3*I, -1 - 3*I]); same((6*I)**2, -36); same((-2 + 6*I)/2, -1 + 3*I)
same(expand(exp((-1 + 3*I)*tr), complex=True), expand(exp(-tr)*cos(3*tr) + I*exp(-tr)*sin(3*tr)))
for part in (exp(-tr)*cos(3*tr), exp(-tr)*sin(3*tr)):
    same(simplify(diff(part, tr, 2) + 2*diff(part, tr) + 10*part), 0)
yf = Function('y'); C1, C2 = symbols('C1 C2')
same(dsolve(yf(tr).diff(tr, 2) + 2*yf(tr).diff(tr) + 10*yf(tr)).rhs, (C1*sin(3*tr) + C2*cos(3*tr))*exp(-tr))
rounds(2*pi/3, '2.09'); rounds(log(2), '0.69'); same(exp(-(tr + log(2)))/exp(-tr), Rational(1, 2))
same(expand_trig(cos(3*(tr + 2*pi/3))), cos(3*tr)); same(expand_trig(sin(3*(tr + 2*pi/3))), sin(3*tr))
same(exp(-(tr + 2*pi/3))/exp(-tr), exp(-2*pi/3)); holds(exp(-2*pi/3) < 1)
```
:::

::: compute Python 中的欧拉公式
Python 内置了复数。它将虚数单位写作 `j`，如工程师所用，因此 $i$ 是 `1j`，模块 `cmath` 包含复指数：

```python
import cmath
import math
print(1j**2)
print(cmath.exp(1j*math.pi))
theta = 1.0
print(cmath.exp(1j*theta))
print(math.cos(theta), math.sin(theta))
```

```output
(-1+0j)
(-1+1.2246467991473532e-16j)
(0.5403023058681398+0.8414709848078965j)
0.5403023058681398 0.8414709848078965
```

$e^{i\pi}$ 为 $-1$ 加上一个微小的虚部。该部分是 $\sin$ 的 `math.pi`，即 $\pi$ 保留到约 16 位小数：$\sin(\pi - \delta) \approx \delta$ 对于一个微小的 $\delta$，此处 $\delta$，$\pi$ 与 `math.pi` 之间的差异约为 $1.22 \times 10^{-16}$。SymPy 保持 $\pi$ 的精确性，因此得到 $-1$ 的精确值；使用实数符号时，它通过欧拉公式展开 $e^{it}$，其微分方程求解器产生例 15.17 中的振荡：

```python
import sympy as sp
t = sp.symbols('t', real=True)
y = sp.Function('y')
print(sp.exp(sp.I*sp.pi))
print(sp.expand(sp.exp(sp.I*t), complex=True))
print(sp.dsolve(y(t).diff(t, 2) + 2*y(t).diff(t) + 10*y(t)))
```

```output
-1
I*sin(t) + cos(t)
Eq(y(t), (C1*sin(3*t) + C2*cos(3*t))*exp(-t))
```
:::

```check
rounds(pi - Float(3.141592653589793, 40), '1.22e-16'); rounds(sin(Float(3.141592653589793, 40)), '1.22e-16')
```

## 你所学到的内容 {#summary}

- 幂级数 $\sum c_n(x - a)^n$ 在 $\abs{x - a} < R$ 处绝对收敛，在 $\abs{x - a} > R$ 处发散。收敛半径 $R$，可能是 0 或 $\infty$，通常由比值审敛法得出；端点 $a \pm R$ 必须单独检验。
- 将几何级数 $1/(1 - u) = \sum u^n$，$\abs{u} < 1$ 代入，可得到 $1/(1 + x)$，$1/(1 + x^2)$ 以及许多其他级数，一旦将条件 $\abs{u} < 1$ 转换即可。
- 在收敛区间内，幂级数可以逐项求导和积分，具有相同的收敛半径。这给出了系列 $\ln(1 + x)$ 和 $\arctan x$，以及在端点 $1 - \tfrac12 + \tfrac13 - \cdots = \ln 2$ 和 $1 - \tfrac13 + \tfrac15 - \cdots = \tfrac{\pi}{4}$ 处的情况。Abel 定理涵盖了所有在端点收敛的级数。
- 若$f$在$a$处有幂级数，其系数为$f^{(n)}(a)/n!$：它是$f$的泰勒级数（当$a = 0$时为麦克劳林级数）。掌握$1/(1 - x)$、$\ln(1 + x)$、$\arctan x$、$e^x$、$\sin x$、$\cos x$和$(1 + x)^k$的级数及其收敛区间。
- 泰勒多项式$T_n$与$f$及其前$n$阶导数在$a$处匹配。泰勒定理：$f(x) = T_n(x) + \dfrac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}$对于$a$和$x$之间的某个$c$成立，因此当$\abs{f^{(n+1)}} \le M$时$\abs{f(x) - T_n(x)} \le \dfrac{M}{(n + 1)!}\abs{x - a}^{n+1}$成立。它证明了模块4和7中的误差估计。
- 泰勒级数在余项趋于 0 的地方与 $f$ 完全相等：对于 $e^x$、$\sin x$ 和 $\cos x$，在每一个 $x$ 处均成立。一个收敛的泰勒级数可能有错误的和，如 $e^{-1/x^2}$ 所示。
- 级数计算 $e$、$\pi$ 和 $\ln 2$，将极限转化为代数，给出物理的近似值，并在范围缩减后，得到数学库中的多项式。
- $e^{i\theta} = \cos\theta + i\sin\theta$, 所以 $e^{i\pi} + 1 = 0$. 复根 $a \pm bi$ 特征方程给出振荡 $e^{at}\cos bt$ 和 $e^{at}\sin bt$，并且 $1 + z^2$ 的复零点 $\pm i$ 解释了 $1/(1 + x^2)$ 级数的半径 1。
- SymPy：`sp.series(f, x, a, n)` 给出到 $(x - a)^{n-1}$ 的项；`.removeO()` 去掉 $O$ 项。

## 练习 {#exercises}

:::: exercise 收敛区间 {#ex-15-1} ★
找出每个级数的收敛半径和收敛区间。

- (a) $\displaystyle\sum_{n=1}^\infty \frac{n\,x^n}{4^n}$
- (b) $\displaystyle\sum_{n=1}^\infty \frac{(x + 1)^n}{\sqrt n}$
- (c) $\displaystyle\sum_{n=0}^\infty \frac{(2x)^n}{n!}$

::: solution
**(a)** 此处 $c_n = n/4^n$，且 $\abs{\dfrac{c_{n+1}}{c_n}} = \dfrac{n + 1}{4n} \to \dfrac14$，因此 $R = 4$。在 $x = 4$ 处项为 $n$，在 $x = -4$ 处项为 $(-1)^n n$：在两种情况下它们都不趋于 0，因此级数发散。收敛区间为 $(-4, 4)$。

**(b)** 质心是 $-1$。这里 $c_n = 1/\sqrt n$ 和 $\abs{c_{n+1}/c_n} = \sqrt{n/(n + 1)} \to 1$，所以 $R = 1$：级数在 $\abs{x + 1} < 1$ 处绝对收敛，即 $-2 < x < 0$。在 $x = 0$ 处是 $\sum 1/\sqrt n$，是一个 $p$ 系列，其中 $p = \tfrac12 \le 1$，它发散。在 $x = -2$ 处是 $\sum (-1)^n/\sqrt n$，根据交错级数判别法收敛，因为 $1/\sqrt n$ 递减趋于 0。收敛区间是 $[-2, 0)$。

**(c)** 这里 $c_n = 2^n/n!$ 和 $\abs{c_{n+1}/c_n} = \dfrac{2}{n + 1} \to 0$，所以 $R = \infty$：级数在每个 $x$ 处收敛。这是一个 $e^{2x}$ 系列。

```check
nE = symbols('n', integer=True, positive=True)
ca = lambda N: N/4**N
same(ca(nE + 1)/ca(nE), (nE + 1)/(4*nE)); limit_is((n + 1)/(4*n), n, oo, Rational(1, 4))
same(ca(nE)*4**nE, nE); same(Abs(ca(nE)*(-4)**nE), nE)
same(sqrt(nE)/sqrt(nE + 1), (1/sqrt(nE + 1))/(1/sqrt(nE))); limit_is(sqrt(n/(n + 1)), n, oo, 1)
same(solve_univariate_inequality(Abs(x + 1) < 1, x, relational=False), Interval.open(-2, 0))
holds(Sum(1/sqrt(n), (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**n/sqrt(n), (n, 1, oo)).is_convergent())
cc3 = lambda N: 2**N/factorial(N)
same(cc3(nE + 1)/cc3(nE), 2/(nE + 1)); limit_is(2/(n + 1), n, oo, 0)
same(summation((2*x)**n/factorial(n), (n, 0, oo)), exp(2*x))
```
:::
::::

:::: exercise 几何级数衍生的级数 {#ex-15-2} ★
找出每个函数关于 0 的幂级数，以及它的收敛区间。

- (a) $\dfrac{1}{1 - 3x}$
- (b) $\dfrac{x^2}{1 + x}$
- (c) $\dfrac{1}{4 + x^2}$

::: solution
**(a)** 与 $u = 3x$： $\dfrac{1}{1 - 3x} = \sum 3^n x^n = 1 + 3x + 9x^2 + \cdots$，对于 $\abs{3x} < 1$，即 $\abs{x} < \tfrac13$。在 $x = \pm\tfrac13$ 处的项是 $(\pm1)^n$，它们不趋于 0。收敛区间是 $\big(-\tfrac13, \tfrac13\big)$。

**(b)** 将 $\dfrac{1}{1 + x}$ 的级数乘以 $x^2$： $\dfrac{x^2}{1 + x} = \sum (-1)^n x^{n+2} = x^2 - x^3 + x^4 - \cdots$，对于 $\abs{x} < 1$。在 $x = \pm1$ 处各项的大小为 1，因此区间是 $(-1, 1)$。

**(c)** 提取因子 4，使 1 出现：

$$\begin{aligned} \frac{1}{4 + x^2} &= \frac14\cdot\frac{1}{1 + x^2/4} \\ &= \frac14\sum_{n=0}^\infty (-1)^n\Big(\frac{x^2}{4}\Big)^n \\ &= \sum_{n=0}^\infty \frac{(-1)^n x^{2n}}{4^{n+1}}, \end{aligned}$$

对于 $x^2/4 < 1$，即 $\abs{x} < 2$。在 $x = \pm2$ 处各项为 $(-1)^n/4$，这些项不趋于 0，因此区间是 $(-2, 2)$。在 $x = 1$ 处进行测试：级数是 $\tfrac14 - \tfrac{1}{16} + \tfrac{1}{64} - \cdots = \dfrac{1/4}{1 + 1/4} = \tfrac15$，且 $\dfrac{1}{4 + 1} = \tfrac15$。

```check
same(series(1/(1 - 3*x), x, 0, 8).removeO(), sum(3**j*x**j for j in range(8)))
same(solve_univariate_inequality(Abs(3*x) < 1, x, relational=False), Interval.open(-Rational(1, 3), Rational(1, 3)))
same(series(x**2/(1 + x), x, 0, 10).removeO(), sum((-1)**j*x**(j + 2) for j in range(8)))
steps(1/(4 + x**2), Rational(1, 4)/(1 + x**2/4))
same(series(1/(4 + x**2), x, 0, 14).removeO(), sum((-1)**j*x**(2*j)/4**(j + 1) for j in range(7)))
same(solve_univariate_inequality(x**2/4 < 1, x, relational=False), Interval.open(-2, 2))
same(summation((-1)**n/4**(n + 1), (n, 0, oo)), Rational(1, 5)); same(Rational(1, 4)/(1 + Rational(1, 4)), Rational(1, 5))
```
:::
::::

:::: exercise 估计 cos 0.2 {#ex-15-3} ★
- (a) 写出 $\cos x$ 的麦克劳林多项式 $T_4$。
- (b) 用它来估计 $\cos 0.2$。
- (c) 用泰勒不等式对误差进行估计，并将该估计值与实际误差进行比较。

::: solution
**(a)** $T_4(x) = 1 - \dfrac{x^2}{2} + \dfrac{x^4}{24}$.

**(b)** $T_4(0.2) = 1 - 0.02 + \dfrac{0.0016}{24} = 0.98 + 0.0000666\ldots \approx 0.98006667$.

**(c)** 每个 $\cos$ 的导数都是 $\pm\sin$ 或 $\pm\cos$，因此 $M = 1$ 将适用。 $x^5$ 的系数为 0，因此 $T_4 = T_5$，并使用 $n = 5$ 的泰勒不等式得到

$$\begin{aligned} &\abs{\cos 0.2 - T_4(0.2)} \le \frac{0.2^6}{6!} \\ &\quad= \frac{0.000064}{720} \approx 8.9 \times 10^{-8}. \end{aligned}$$

计算器给出 $\cos 0.2 \approx 0.98006658$，因此误差约为 $-8.9 \times 10^{-8}$：这个界限几乎精确，因为级数的下一项 $-x^6/720$ 几乎弥补了所有的误差。对于 $n = 4$，不等式只给出 $0.2^5/5! \approx 2.7 \times 10^{-6}$，虽然正确但大了三十倍。

```check
T4c = 1 - x**2/2 + x**4/24; v2 = Rational(1, 5)
same(series(cos(x), x, 0, 6).removeO(), T4c)
same(T4c.subs(x, v2), 1 - Rational(2, 100) + Rational(16, 10000)/24); rounds(T4c.subs(x, v2), '0.98006667')
same(v2**6, Rational(64, 10**6)); same(factorial(6), 720); rounds(v2**6/factorial(6), '8.9e-8')
rounds(cos(v2), '0.98006658'); rounds(cos(v2) - T4c.subs(x, v2), '-8.9e-8'); holds(Abs(cos(v2) - T4c.subs(x, v2)) <= v2**6/factorial(6))
rounds(v2**5/factorial(5), '2.7e-6'); rounds((v2**5/factorial(5))/(v2**6/factorial(6)), '30')
```
:::
::::

:::: exercise 由旧级数生成新级数 {#ex-15-4} ★
利用标准级数找出每个函数的麦克劳林级数，写出其前三个非零项，并说明在哪些 $x$ 下该级数等于该函数。

- (a) $x^2e^{-x}$
- (b) $\sin(x^2)$
- (c) $\cosh x = \tfrac12(e^x + e^{-x})$

::: solution
**(a)** 在 $e^x$ 的级数中将 $-x$ 替换为 $x$，然后乘以 $x^2$：

$$\begin{aligned} x^2e^{-x} &= x^2\sum_{n=0}^\infty \frac{(-x)^n}{n!} \\ &= \sum_{n=0}^\infty (-1)^n\frac{x^{n+2}}{n!} \\ &= x^2 - x^3 + \frac{x^4}{2} - \cdots, \end{aligned}$$

对于每一个 $x$，由于 $e^x$ 的级数等于 $e^x$ 对于每一个 $x$。

**(b)** 在 $\sin x$ 的级数中将 $x^2$ 替换为 $x$：

$$\begin{aligned} \sin(x^2) &= \sum_{n=0}^\infty (-1)^n\frac{x^{4n+2}}{(2n + 1)!} \\ &= x^2 - \frac{x^6}{6} + \frac{x^{10}}{120} - \cdots, \end{aligned}$$

对于每一个 $x$。

**(c)** 将 $e^x$ 和 $e^{-x}$ 的级数相加：级数中 $x^n$ 的项为 $\big(1 + (-1)^n\big)\dfrac{x^n}{n!}$，当 $n$ 为奇数时为 0，当 $n$ 为偶数时为 $\dfrac{2x^n}{n!}$。取一半，

$$\begin{aligned} \cosh x &= \sum_{n=0}^\infty \frac{x^{2n}}{(2n)!} \\ &= 1 + \frac{x^2}{2} + \frac{x^4}{24} + \cdots, \end{aligned}$$

对于每个 $x$： $\cos x$ 级数去掉其负号。

```check
same(series(x**2*exp(-x), x, 0, 8).removeO(), sum((-1)**j*x**(j + 2)/factorial(j) for j in range(6)))
same([(-1)**j/factorial(j) for j in range(3)], [1, -1, Rational(1, 2)])
same(series(sin(x**2), x, 0, 16).removeO(), sum((-1)**j*x**(4*j + 2)/factorial(2*j + 1) for j in range(4)))
same([factorial(2*j + 1) for j in range(3)], [1, 6, 120])
same(cosh(x).rewrite(exp), (exp(x) + exp(-x))/2); same([1 + (-1)**j for j in range(6)], [2, 0, 2, 0, 2, 0])
same(series(cosh(x), x, 0, 12).removeO(), sum(x**(2*j)/factorial(2*j) for j in range(6)))
same(summation(x**(2*n)/factorial(2*n), (n, 0, oo)), cosh(x))
```
:::
::::

:::: exercise 通过求导求和 {#ex-15-5} ★★
示例 15.6 表明 $\displaystyle\sum_{n=1}^\infty n x^n = \frac{x}{(1 - x)^2}$ 对于 $\abs{x} < 1$。

- (a) 求 $\displaystyle\sum_{n=1}^\infty \frac{n}{3^n}$。
- (b) 证明 $\displaystyle\sum_{n=1}^\infty n^2x^n = \frac{x(1 + x)}{(1 - x)^3}$ 对于 $\abs{x} < 1$。
- (c) 求 $\displaystyle\sum_{n=1}^\infty \frac{n^2}{2^n}$.

::: solution
**(a)** 设 $x = \tfrac13$: $\dfrac{1/3}{(2/3)^2} = \dfrac{1/3}{4/9} = \dfrac34$.

**(b)** 对 $\sum n x^n = \dfrac{x}{(1 - x)^2}$ 逐项求导（定理 15.2，在半径 1 内）。右边使用商法则，然后约去因子 $1 - x$：

$$\begin{aligned} &\frac{d}{dx}\,\frac{x}{(1 - x)^2} \\ &\quad= \frac{(1 - x)^2 + 2x(1 - x)}{(1 - x)^4} \\ &\quad= \frac{(1 - x) + 2x}{(1 - x)^3} = \frac{1 + x}{(1 - x)^3}. \end{aligned}$$

左边的导数是 $\sum n^2 x^{n-1}$。乘以 $x$ 得到 $\sum n^2 x^n = \dfrac{x(1 + x)}{(1 - x)^3}$。

**(c)** 在 $x = \tfrac12$: $\dfrac{\tfrac12\cdot\tfrac32}{(1/2)^3} = \dfrac34\cdot8 = 6$.

```check
same((x/(1 - x)**2).subs(x, Rational(1, 3)), Rational(3, 4)); same(summation(n/3**n, (n, 1, oo)), Rational(3, 4))
steps(diff(x/(1 - x)**2, x), ((1 - x)**2 + 2*x*(1 - x))/(1 - x)**4, ((1 - x) + 2*x)/(1 - x)**3, (1 + x)/(1 - x)**3)
same(diff(n*x**n, x)*x, n**2*x**n)
same(series(x*(1 + x)/(1 - x)**3, x, 0, 10).removeO(), sum(j**2*x**j for j in range(1, 10)))
same((x*(1 + x)/(1 - x)**3).subs(x, Rational(1, 2)), 6); same(summation(n**2/2**n, (n, 1, oo)), 6)
```
:::
::::

:::: exercise 用二项式级数计算平方根 {#ex-15-6} ★★
- (a) 使用 $\sqrt{1 + x}$ 级数（示例 15.10）的前四项估计 $\sqrt{1.1}$。
- (b) 证明，对于 $0 < x < 1$，该级数的项在第一个之后交替变号且绝对值递减，并用此来估计 (a) 的误差。
- (c) 估计 $\sqrt{110}$，并给出误差界。

::: solution
**(a)** $\sqrt{1.1} \approx 1 + \dfrac{0.1}{2} - \dfrac{0.01}{8} + \dfrac{0.001}{16} = 1 + 0.05 - 0.00125 + 0.0000625 = 1.0488125$.

**(b)** 相邻系数的比值是

$$\binom{1/2}{n+1}\Big/\binom{1/2}{n} = \frac{\tfrac12 - n}{n + 1},$$

对于 $n \ge 1$ 来说，这个比值是负数，其绝对值为 $\dfrac{n - \tfrac12}{n + 1} < 1$。因此对于 $0 < x < 1$，从 $x$ 项开始，每一项的符号与前一项相反，且大小更小（其大小乘以 $\tfrac{n - 1/2}{n + 1}\,x < x < 1$）。将其与比值为 $x$ 的等比数列进行比较，可知各项趋于 0。根据模块 14 中的交错级数误差界，应用于该级数从第二项开始的部分，误差的大小小于被省略的第一个项的大小。在 $x = 0.1$ 处，该大小为

$$\begin{aligned} \abs{\binom{1/2}{4}(0.1)^4} &= \frac{5}{128}(0.1)^4 \\ &= 0.00000390625. \end{aligned}$$

确实 $\sqrt{1.1} \approx 1.0488088$，误差 1.0488125 大约是 $-3.7 \times 10^{-6}$。

**(c)** $\sqrt{110} = \sqrt{100 \times 1.1} = 10\sqrt{1.1} \approx 10.488125$，误差的绝对值小于 $10 \times 0.00000390625 = 0.0000390625 < 0.00004$。首个省略项为负，因此估计值偏大。所以 $\sqrt{110}$ 介于 10.488085 和 10.488125 之间，保留四位小数为 10.4881（计算器给出 10.488088）。

```check
v3 = Rational(1, 10); est = 1 + v3/2 - v3**2/8 + v3**3/16
same([v3/2, v3**2/8, v3**3/16], [Rational(5, 100), Rational(125, 100000), Rational(625, 10**7)]); same(est, Rational(10488125, 10**7))
for j in range(1, 30):
    same(binomial(Rational(1, 2), j + 1)/binomial(Rational(1, 2), j), (Rational(1, 2) - j)/(j + 1))
holds(all((Rational(1, 2) - j)/(j + 1) < 0 and Abs((Rational(1, 2) - j)/(j + 1)) < 1 for j in range(1, 60)))
same(binomial(Rational(1, 2), 4), -Rational(5, 128)); same(Rational(5, 128)*v3**4, Rational('0.00000390625'))
rounds(sqrt(Rational(11, 10)), '1.0488088'); rounds(sqrt(Rational(11, 10)) - est, '-3.7e-6'); holds(Abs(sqrt(Rational(11, 10)) - est) < Rational(5, 128)*v3**4)
same(sqrt(110), 10*sqrt(Rational(11, 10))); same(10*Rational(5, 128)*v3**4, Rational('0.0000390625'))
holds(10*Rational(5, 128)*v3**4 < Rational('0.00004')); same(10*est, Rational('10.488125'))
holds(sqrt(110) < 10*est); holds(sqrt(110) > Rational('10.488085'))
same(10*est - Rational('0.00004'), Rational('10.488085'))
holds(10*est - 10*Rational(5, 128)*v3**4 > Rational(10488085, 10**6)); rounds(Rational(10488085, 10**6), '10.4881'); rounds(10*est, '10.4881')
rounds(sqrt(110), '10.488088')
```
:::
::::

:::: exercise 估计 ln 0.8 {#ex-15-7} ★★
- (a) 使用 $T_3$ 的 Maclaurin 多项式 $\ln(1 + x)$ 来估计 $\ln 0.8$。
- (b) 用 Taylor 不等式来估计误差范围。
- (c) 为什么不能在这里使用交替级数误差界？将 (b) 中的误差界与实际误差进行比较。

::: solution
**(a)** $T_3(x) = x - \dfrac{x^2}{2} + \dfrac{x^3}{3}$ 和 $0.8 = 1 + x$ 与 $x = -0.2$，所以

$$\begin{aligned} &T_3(-0.2) = -0.2 - \frac{0.04}{2} - \frac{0.008}{3} \\ &\quad= -\frac15 - \frac1{50} - \frac1{375} \\ &\quad= -\frac{167}{750} \approx -0.2226667. \end{aligned}$$

所以 $\ln 0.8 \approx -0.2226667$。以下误差界适用于精确多项式值 $-167/750$ 在四舍五入之前的值。

**(b)** $f(x) = \ln(1 + x)$ 的导数是 $\dfrac{1}{1 + x}$, $-\dfrac{1}{(1 + x)^2}$, $\dfrac{2}{(1 + x)^3}$ 和 $f^{(4)}(x) = -\dfrac{6}{(1 + x)^4}$。对于 $t$ 在 $-0.2$ 和 0 之间， $1 + t \ge 0.8$，所以 $\abs{f^{(4)}(t)} \le \dfrac{6}{0.8^4} = 14.6484375$，并且

$$\begin{aligned} &\abs{\ln 0.8 - T_3(-0.2)} \\ &\quad\le \frac{14.6484375}{4!}\,(0.2)^4 \\ &\quad\approx 0.00098. \end{aligned}$$

**(c)** 在$x = -0.2$处，级数的每一项$-\tfrac15 - \tfrac1{50} - \tfrac1{375} - \tfrac1{2500} - \cdots$均为负：该级数不交错，因此交错级数误差界不适用。它本会声称误差小于下一项的大小0.0004，这是错误的：$\ln 0.8 \approx -0.2231436$，且误差约为$-0.00048$。泰勒不等式无需交错符号，给出安全界0.00098。拉格朗日形式甚至给出了符号：$f^{(4)} < 0$，因此$R_3 < 0$和$T_3$高估了。

```check
fl = log(1 + x)
same([diff(fl, x, j) for j in range(1, 5)], [1/(1 + x), -1/(1 + x)**2, 2/(1 + x)**3, -6/(1 + x)**4])
T3l = x - x**2/2 + x**3/3; vm = -Rational(1, 5)
same(T3l.subs(x, vm), -Rational(2, 10) - Rational(2, 100) - Rational(8, 3000)); rounds(T3l.subs(x, vm), '-0.2226667')
steps(T3l.subs(x, vm), -Rational(1, 5) - Rational(1, 50) - Rational(1, 375), -Rational(167, 750))
same(6/Rational(4, 5)**4, Rational(146484375, 10**7)); rounds(Rational(146484375, 10**7)/24*vm**4, '0.00098')
rounds(log(Rational(4, 5)), '-0.2231436'); rounds(log(Rational(4, 5)) - T3l.subs(x, vm), '-0.00048')
holds(Abs(log(Rational(4, 5)) - T3l.subs(x, vm)) <= Rational(146484375, 10**7)/24*vm**4)
holds(Rational(146484375, 10**7)/24*vm**4 < Rational('0.00098'))
holds(all((-1)**(j - 1)*vm**j/j < 0 for j in range(1, 12))); same(Abs(vm**4/4), Rational(4, 10000))
holds(Abs(log(Rational(4, 5)) - T3l.subs(x, vm)) > Rational(4, 10000)); holds(log(Rational(4, 5)) - T3l.subs(x, vm) < 0)
```
:::
::::

:::: exercise 用级数求极限 {#ex-15-8} ★★
用级数来求每个极限。

- (a) $\displaystyle\lim_{x\to0}\frac{e^x - 1 - x - x^2/2}{x^3}$
- (b) $\displaystyle\lim_{x\to0}\frac{x - \arctan x}{x^3}$
- (c) $\displaystyle\lim_{x\to0}\frac{e^{x^2} - \cos x}{x^2}$

::: solution
**(a)** $e^x = 1 + x + \dfrac{x^2}{2} + \dfrac{x^3}{6} + O(x^4)$，因此分子是 $\dfrac{x^3}{6} + O(x^4)$，商是 $\dfrac16 + O(x) \to \dfrac16$。

**(b)** $\arctan x = x - \dfrac{x^3}{3} + O(x^5)$（例如，对于 $\abs{x} \le \tfrac12$，交替级数的界使得误差大小最多为 $\abs{x}^5/5$）。因此 $x - \arctan x = \dfrac{x^3}{3} + O(x^5)$，极限为 $\dfrac13$。

**(c)** 用 $x^2$ 替换 $e^u = 1 + u + O(u^2)$: $e^{x^2} = 1 + x^2 + O(x^4)$。并且 $\cos x = 1 - \dfrac{x^2}{2} + O(x^4)$。因此 $e^{x^2} - \cos x = \dfrac32x^2 + O(x^4)$，极限是 $\dfrac32$。仅保留首项 $e^{x^2} \approx 1$ 和 $\cos x \approx 1$ 会留下 $0/x^2$，得出错误答案 0：保留与分母同阶的项。

```check
same(series(exp(x) - 1 - x - x**2/2, x, 0, 4).removeO(), x**3/6); limit_is((exp(x) - 1 - x - x**2/2)/x**3, x, 0, Rational(1, 6))
same(series(x - atan(x), x, 0, 5).removeO(), x**3/3); limit_is((x - atan(x))/x**3, x, 0, Rational(1, 3))
holds(all(Abs(atan(Rational(k_, 10)) - (Rational(k_, 10) - Rational(k_, 10)**3/3)) <= Abs(Rational(k_, 10))**5/5 for k_ in range(-5, 6)))
same(series(exp(x**2), x, 0, 4).removeO(), 1 + x**2); same(series(exp(x**2) - cos(x), x, 0, 4).removeO(), Rational(3, 2)*x**2)
limit_is((exp(x**2) - cos(x))/x**2, x, 0, Rational(3, 2))
```
:::
::::

:::: exercise 三角函数来自欧拉公式 {#ex-15-9} ★★
- (a) 使用 $\big(e^{i\theta}\big)^2 = e^{2i\theta}$ 来推导 $\cos 2\theta$ 和 $\sin 2\theta$ 的公式。
- (b) 使用 $\big(e^{i\theta}\big)^3 = e^{3i\theta}$ 来证明 $\cos 3\theta = 4\cos^3\theta - 3\cos\theta$ 和 $\sin 3\theta = 3\sin\theta - 4\sin^3\theta$。
- (c) 使用 $\cos\theta = \tfrac12\big(e^{i\theta} + e^{-i\theta}\big)$ 来证明 $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$，这是 模块 11 中 $\int\cos^2\theta\,d\theta$ 的恒等式。

::: solution
写出 $c = \cos\theta$ 和 $s = \sin\theta$，使得 $e^{i\theta} = c + is$。

**(a)** $(c + is)^2 = c^2 + 2ics + i^2s^2 = (c^2 - s^2) + i\,2sc$. And $e^{2i\theta} = \cos 2\theta + i\sin 2\theta$. 相等的复数有相等的实部和相等的虚部，因此 $\cos 2\theta = \cos^2\theta - \sin^2\theta$ 和 $\sin 2\theta = 2\sin\theta\cos\theta$.

**(b)** 展开立方，使用 $i^2 = -1$ 和 $i^3 = -i$：

$$\begin{aligned} (c + is)^3 &= c^3 + 3ic^2s \\ &\quad - 3cs^2 - is^3 \\ &= (c^3 - 3cs^2) \\ &\quad + i(3c^2s - s^3). \end{aligned}$$

使用 $s^2 = 1 - c^2$，实部为 $c^3 - 3c(1 - c^2) = 4c^3 - 3c$；使用 $c^2 = 1 - s^2$，虚部为 $3(1 - s^2)s - s^3 = 3s - 4s^3$。与 $e^{3i\theta} = \cos 3\theta + i\sin 3\theta$ 比较可得两个公式。

**(c)** 平方，使用 $e^{i\theta}e^{-i\theta} = e^0 = 1$：

$$\begin{aligned} \cos^2\theta &= \frac{e^{2i\theta} + 2 + e^{-2i\theta}}{4} \\ &= \frac12 + \frac12\cdot\frac{e^{2i\theta} + e^{-2i\theta}}{2} \\ &= \frac12(1 + \cos 2\theta). \end{aligned}$$

```check
cs_, sn_ = symbols('c s', real=True)
same(expand((cs_ + I*sn_)**2), cs_**2 - sn_**2 + 2*I*sn_*cs_); same(expand_trig(cos(2*theta)), cos(theta)**2 - sin(theta)**2)
same(expand_trig(sin(2*theta)), 2*sin(theta)*cos(theta))
same(expand((cs_ + I*sn_)**3), cs_**3 - 3*cs_*sn_**2 + I*(3*cs_**2*sn_ - sn_**3))
same(expand(cs_**3 - 3*cs_*(1 - cs_**2)), 4*cs_**3 - 3*cs_); same(expand(3*(1 - sn_**2)*sn_ - sn_**3), 3*sn_ - 4*sn_**3)
same(expand_trig(cos(3*theta)), 4*cos(theta)**3 - 3*cos(theta)); same(expand_trig(sin(3*theta)), 3*sin(theta) - 4*sin(theta)**3)
same(expand(((exp(I*thr) + exp(-I*thr))/2)**2), exp(2*I*thr)/4 + Rational(1, 2) + exp(-2*I*thr)/4)
same(expand_complex(exp(2*I*thr)/4 + Rational(1, 2) + exp(-2*I*thr)/4), (1 + cos(2*thr))/2); same((1 + cos(2*theta))/2, cos(theta)**2)
```
:::
::::

:::: exercise 数 e 是无理数 {#ex-15-10} ★★★
假设，反设 $e = p/q$ 为整数 $p$ 和 $q \ge 1$。由于也 $e = 2p/(2q)$，你可以假设 $q \ge 2$。令 $s_q = \sum_{k=0}^{q} 1/k!$。

- (a) 证明 $q!\,(e - s_q)$ 是整数。
- (b) 利用第 15.6 节中的界 $0 < e - s_n < \dfrac{3}{(n + 1)!}$ 来证明 $0 < q!\,(e - s_q) < 1$。
- (c) 推出 $e$ 是无理数。

::: solution
**(a)** $q!\,e = q!\,\dfrac{p}{q} = p\,(q - 1)!$，一个整数。且 $q!\,s_q = \sum_{k=0}^{q} \dfrac{q!}{k!}$，其中每个 $\dfrac{q!}{k!} = (k + 1)(k + 2)\cdots q$（或 1，当 $k = q$ 时）是一个整数。因此 $q!\,(e - s_q)$ 是两个整数之差：一个整数。

**(b)** 将 $0 < e - s_q < \dfrac{3}{(q + 1)!}$ 乘以 $q!$：

$$\begin{aligned} 0 < q!\,(e - s_q) &< \frac{3\,q!}{(q + 1)!} \\ &= \frac{3}{q + 1} \le 1, \end{aligned}$$

因为 $q \ge 2$。

**(c)** 由 (a) 和 (b)， $q!\,(e - s_q)$ 是一个严格介于 0 和 1 之间的整数。 不存在这样的数，因此假设 $e = p/q$ 是错误的： $e$ 是无理数。 该证明成立是因为 $e$ 的级数收敛得非常快，使得在 $1/q!$ 项之后的误差太小，无法是 $1/q!$ 的倍数。

```check
qI = symbols('q', integer=True, positive=True); pI = symbols('p', integer=True, positive=True)
same(factorial(qI)*(pI/qI), pI*factorial(qI - 1))
for Q_ in range(2, 9):
    holds(all((factorial(Q_)/factorial(j)).is_integer for j in range(Q_ + 1)))
    holds(0 < factorial(Q_)*(E - sE(Q_))); holds(factorial(Q_)*(E - sE(Q_)) < Rational(3, Q_ + 1)); holds(Rational(3, Q_ + 1) <= 1)
same(factorial(qI)*3/factorial(qI + 1), 3/(qI + 1))
```
:::
::::

:::: exercise 梅钦公式 {#ex-15-11} ★★★
设 $\alpha = \arctan\tfrac15$。 使用来自模块 1 的加法公式推导出的公式 $\tan(u + v) = \dfrac{\tan u + \tan v}{1 - \tan u\tan v}$。

- (a) 证明 $\tan 2\alpha = \tfrac{5}{12}$ 和 $\tan 4\alpha = \tfrac{120}{119}$。
- (b) 证明 $\tan\big(4\alpha - \tfrac{\pi}{4}\big) = \tfrac{1}{239}$，并得出 $\dfrac{\pi}{4} = 4\arctan\dfrac15 - \arctan\dfrac{1}{239}$。
- (c) 在第 15.6 节中，关于 $\arctan\tfrac15$ 中误差大小的界 $\tfrac{1}{11\cdot5^{11}}$ 变为对 $\pi$ 中误差贡献的界，其大小变为原来的 16 倍。 需要多少项的 $\arctan\tfrac15$ 级数才能使该贡献的大小小于 $10^{-12}$？

::: solution
**(a)** 用 $u = v$ 代入公式，得到 $\tan 2u = \dfrac{2\tan u}{1 - \tan^2u}$。 所以

$$\begin{aligned} \tan 2\alpha &= \frac{2/5}{1 - 1/25} = \frac{5}{12}, \\ \tan 4\alpha &= \frac{10/12}{1 - 25/144} = \frac{120}{119}. \end{aligned}$$

**(b)** 用 $-v$ 代替 $v$，并用 $\tan(-v) = -\tan v$，公式给出 $\tan(u - v) = \dfrac{\tan u - \tan v}{1 + \tan u\tan v}$。用 $u = 4\alpha$ 和 $v = \tfrac{\pi}{4}$，其中 $\tan\tfrac{\pi}{4} = 1$：

$$\begin{aligned} &\tan\Big(4\alpha - \frac{\pi}{4}\Big) \\ &\quad= \frac{120/119 - 1}{1 + 120/119} \\ &\quad= \frac{1/119}{239/119} = \frac{1}{239}. \end{aligned}$$

要得出 $4\alpha - \tfrac{\pi}{4} = \arctan\tfrac{1}{239}$，角必须位于 $\big(-\tfrac{\pi}{2}, \tfrac{\pi}{2}\big)$，即 $\arctan$ 的范围（模块 6）。对于 $x > 0$， $\arctan x = \int_0^x \dfrac{dt}{1 + t^2} < \int_0^x dt = x$，因此 $0 < \alpha < \tfrac15$，且 $-\tfrac{\pi}{4} < 4\alpha - \tfrac{\pi}{4} < \tfrac45 - \tfrac{\pi}{4} < \tfrac{\pi}{2}$。所以 $4\alpha - \tfrac{\pi}{4} = \arctan\tfrac{1}{239}$，重新排列得到 Machin 公式。

**(c)** 用 $n$ 项，误差 $\arctan\tfrac15$ 的大小小于第一个被省略项的大小 $\dfrac{(1/5)^{2n+1}}{2n + 1}$。其对 $\pi$ 误差的贡献小于 16 倍； $\arctan(1/239)$ 近似有其自身的误差。对于 $n = 8$， $16\cdot\dfrac{5^{-17}}{17} \approx 1.2 \times 10^{-12}$，因此这个界不够；对于 $n = 9$， $16\cdot\dfrac{5^{-19}}{19} \approx 4.4 \times 10^{-14}$。因此 9 项足够。

```check
same(expand_trig(tan(2*theta)), 2*tan(theta)/(1 - tan(theta)**2)); same(tan(2*atan(Rational(1, 5))), Rational(5, 12)); same(tan(4*atan(Rational(1, 5))), Rational(120, 119))
same(2*Rational(1, 5)/(1 - Rational(1, 25)), Rational(5, 12)); same(2*Rational(5, 12)/(1 - Rational(25, 144)), Rational(120, 119))
same(expand_trig(tan(theta - pi/4)), (tan(theta) - 1)/(1 + tan(theta))); same((Rational(120, 119) - 1)/(1 + Rational(120, 119)), Rational(1, 239))
al_ = atan(Rational(1, 5)); same(integrate(1/(1 + tt**2), (tt, 0, x)), atan(x))
holds(al_ < Rational(1, 5)); holds(Rational(4, 5) - pi/4 < pi/2); holds(4*al_ - pi/4 > -pi/4)
near(4*al_ - pi/4, atan(Rational(1, 239)), 1e-25)
rounds(16*Rational(1, 5)**17/17, '1.2e-12'); rounds(16*Rational(1, 5)**19/19, '4.4e-14')
holds(16*Rational(1, 5)**17/17 > Rational(1, 10**12)); holds(16*Rational(1, 5)**19/19 < Rational(1, 10**12))
```
:::
::::

:::: exercise 牛顿法收敛于二次速度 {#ex-15-12} ★★★
证明定理 7.3。设 $f(r) = 0$，设 $f'$ 和 $f''$ 在包含 $r$ 的开区间上连续，且 $f'(r) \ne 0$。

- (a) 证明存在数 $\delta > 0$ 和 $K \ge 0$ 满足 $K\delta \le \tfrac12$，使得 $f'(x) \ne 0$ 和 $\abs{\dfrac{f''(c)}{2f'(x)}} \le K$ 对所有 $x$ 和 $c$ 在 $[r - \delta, r + \delta]$ 中成立。
- (b) 利用第 15.5 节的恒等式 $e_{n+1} = \dfrac{f''(c_n)}{2f'(x_n)}\,e_n^2$，证明如果 $\abs{x_0 - r} \le \delta$，则 $\abs{e_{n+1}} \le \tfrac12\abs{e_n}$ 对于每个 $n$ 成立，因此 $x_n \to r$。
- (c) 推出 $e_{n+1}/e_n^2 \to f''(r)/\big(2f'(r)\big)$，如果没有任何 $x_n$ 等于 $r$。

::: solution
**(a)** 由于 $f'$ 在 $r$ 和 $f'(r) \ne 0$ 处连续，存在一个 $\delta_1 > 0$ 使得 $\abs{f'(x) - f'(r)} < \tfrac12\abs{f'(r)}$，因此 $\abs{f'(x)} > \tfrac12\abs{f'(r)} > 0$，对于 $\abs{x - r} \le \delta_1$（取 $\delta_1$ 足够小，使得这个闭区间包含在假设的开区间内）。在闭区间 $[r - \delta_1, r + \delta_1]$ 上，连续函数 $\abs{f''}$ 有最大值 $B$，根据极值定理（模块 3）。因此对于 $x$ 和 $c$ 在该区间内

$$\begin{aligned} \abs{\frac{f''(c)}{2f'(x)}} &\le \frac{B}{2\cdot\tfrac12\abs{f'(r)}} \\ &= \frac{B}{\abs{f'(r)}} = K. \end{aligned}$$

如果 $K = 0$，取 $\delta = \delta_1$；否则取 $\delta$ 为 $\delta_1$ 和 $\dfrac{1}{2K}$ 中较小者。一个更小的区间保持这两个性质，并且 $K\delta \le \tfrac12$。

**(b)** 使用模块 7 的约定 $e_n = x_n - r$，即精确值减去近似值的反向。通过 $n$ 上的归纳法，证明 $\abs{e_n} \le \delta$ 并且 $x_{n+1}$ 是定义的，具有 $\abs{e_{n+1}} \le \tfrac12\abs{e_n}$。假设 $\abs{e_n} \le \delta$，正如 $n = 0$ 所示。那么 $x_n$ 位于 $[r - \delta, r + \delta]$ 中，因此 $f'(x_n) \ne 0$ 且牛顿步长给出 $x_{n+1}$。如果 $x_n = r$，则每个后续迭代都是 $r$，并且两边的界都为 0。否则，恒等式在 $c_n$ 之间成立，即在 $x_n$ 和 $r$ 之间，因此也包含在该区间内，所以

$$\begin{aligned} \abs{e_{n+1}} &\le K e_n^2 = (K\abs{e_n})\,\abs{e_n} \\ &\le K\delta\,\abs{e_n} \le \tfrac12\abs{e_n} \le \delta. \end{aligned}$$

对于每一个 $n$，都有 $\abs{e_n} \le \delta/2^n$，它趋于 0： $x_n \to r$。

**(c)** $\dfrac{e_{n+1}}{e_n^2} = \dfrac{f''(c_n)}{2f'(x_n)}$。当 $n \to \infty$ 时， $x_n \to r$，并且 $c_n$ 位于 $x_n$ 和 $r$ 之间，根据夹逼定理，它也趋于 $r$。由于 $f''$ 和 $f'$ 在 $r$ 和 $f'(r) \ne 0$ 处连续，商趋于 $\dfrac{f''(r)}{2f'(r)}$。对于 $f(x) = x^2 - 2$，这是 $\dfrac{2}{4\sqrt2} = \dfrac{1}{2\sqrt2} \approx 0.354$，即例 7.9 中的常数。

```check
fq_ = x**2 - 2; r_ = sqrt(2)
xs_ = [Rational(3, 2)]
for _ in range(5):
    xs_.append(xs_[-1] - fq_.subs(x, xs_[-1])/diff(fq_, x).subs(x, xs_[-1]))
es_ = [v_ - r_ for v_ in xs_]
for j in range(5):
    holds(Abs(es_[j + 1]) <= Abs(es_[j])/2)
rounds(es_[4]/es_[3]**2, '0.354'); same((diff(fq_, x, 2)/(2*diff(fq_, x))).subs(x, r_), 1/(2*sqrt(2))); rounds(1/(2*sqrt(2)), '0.354')
same(2/(4*sqrt(2)), 1/(2*sqrt(2)))
same(r_ - fq_.subs(x, r_)/diff(fq_, x).subs(x, r_), r_)  # reaching the root keeps every later error at 0
Bs, Fs = symbols('B F', positive=True); same(Bs/(2*Fs/2), Bs/Fs)
```
:::
::::

## 自测 {#quiz}

```quiz
? $\displaystyle\sum_{n=1}^\infty \frac{x^n}{n\,3^n}$ 的收敛半径是
- [ ] $\dfrac13$
- [ ] $1$
- [x] $3$
- [ ] $\infty$
> $\abs{c_{n+1}/c_n} = \dfrac{n}{3(n + 1)} \to \dfrac13$, so $R = 3$. $\dfrac13$ 是 $L$ 本身，不是 $1/L$; 1 忽略了因子 $3^n$; $R = \infty$ 需要 $L = 0$.

? $\displaystyle\sum_{n=1}^\infty \frac{(x - 2)^n}{n}$ 的收敛区间是
- [ ] $(1, 3)$
- [x] $[1, 3)$
- [ ] $(1, 3]$
- [ ] $[1, 3]$
> 中心是 2 和 $R = 1$. 在 $x = 3$ 处，级数是调和级数 $\sum 1/n$，它发散；在 $x = 1$ 处，它是 $\sum (-1)^n/n$，根据交错级数判别法收敛。 $(1, 3)$ 忽略了 $x = 1$，而 $(1, 3]$ 和 $[1, 3]$ 错误地包含了 $x = 3$.

? $x^4$ 在 $e^{2x}$ 的 Maclaurin 级数中的系数是
- [ ] $\dfrac{1}{24}$
- [ ] $\dfrac{1}{12}$
- [ ] $16$
- [x] $\dfrac23$
> $e^{2x} = \sum (2x)^n/n!$，因此 $x^4$ 的系数是 $2^4/4! = 16/24 = \dfrac23$；等价地 $f^{(4)}(0)/4!$ 与 $f^{(4)}(x) = 16e^{2x}$. $\dfrac{1}{24}$ 忘记了因子 $2^4$， $\dfrac{1}{12}$ 用 $2$ 代替了 $2^4$，而 16 忘记了除以 $4!$.

? $\dfrac{1}{1 + x^2}$ 的 Maclaurin 级数，以及它收敛的地方是
- [x] $1 - x^2 + x^4 - x^6 + \cdots$，对于 $-1 < x < 1$
- [ ] $1 - x^2 + x^4 - x^6 + \cdots$，对于每一个 $x$
- [ ] $1 + x^2 + x^4 + x^6 + \cdots$，对于 $-1 < x < 1$
- [ ] $x - \dfrac{x^3}{3} + \dfrac{x^5}{5} - \cdots$，对于 $-1 \le x \le 1$
> $u = -x^2$ 放入 $\dfrac{1}{1 - u} = \sum u^n$，适用于 $\abs{u} < 1$，即 $\abs{x} < 1$。该函数在每一个 $x$ 处都有定义，但其级数在 $\abs{x} \ge 1$ 处发散；符号交替是因为 $u = -x^2$；最后一个级数是 $\arctan x$ 的原函数。

? 若 $f(1) = 2$，$f'(1) = 3$ 和 $f''(1) = 4$，则 $f$ 关于 1 的泰勒多项式 $T_2$ 为
- [ ] $2 + 3x + 2x^2$
- [ ] $2 + 3(x - 1) + 4(x - 1)^2$
- [x] $2 + 3(x - 1) + 2(x - 1)^2$
- [ ] $2 + 3(x - 1) + 8(x - 1)^2$
> $T_2(x) = f(1) + f'(1)(x - 1) + \dfrac{f''(1)}{2!}(x - 1)^2$，和 $4/2! = 2$。忘记除以 $2!$ 会得到 $4(x - 1)^2$，相乘则得到 $8(x - 1)^2$，而用 $x$ 的幂代替 $x - 1$ 会得到关于 0 的多项式。

? 用 $T_3 = T_4$ 表示 $\sin x$，泰勒不等式结合 $n = 4$ 和 $M = 1$ 会给 $\abs{\sin 0.1 - \big(0.1 - \dfrac{0.1^3}{6}\big)}$ 提供什么范围的界？
- [ ] $\dfrac{0.1^4}{4!} \approx 4.2 \times 10^{-6}$
- [x] $\dfrac{0.1^5}{5!} \approx 8.3 \times 10^{-8}$
- [ ] $\dfrac{0.1^3}{3!} \approx 1.7 \times 10^{-4}$
- [ ] $0.1^5 = 10^{-5}$
> $x^4$ 的系数为 0，因此 $T_3 = T_4$，且 $R_4$ 被 $M\abs{x}^5/5! = 10^{-5}/120 \approx 8.3 \times 10^{-8}$ 所界。 $0.1^4/4!$ 是 $R_3$ 的界，这是正确的但较弱； $0.1^3/3!$ 是保留的最后一项的大小，而非误差； $10^{-5}$ 忘记除以 $5!$。

? $\displaystyle\lim_{x\to0}\frac{x - \sin x}{x^3}$等于
- [x] $\dfrac16$
- [ ] $-\dfrac16$
- [ ] $0$
- [ ] $\dfrac13$
> $\sin x = x - \dfrac{x^3}{6} + O(x^5)$, 所以 $x - \sin x = \dfrac{x^3}{6} + O(x^5)$ 且商趋于 $\dfrac16$。 $-\dfrac16$ 是 $(\sin x - x)/x^3$ 的极限；0 来自于仅用 $\sin x$ 替换 $x$； $\dfrac13$ 是将 $\sin x$ 替换为 $\arctan x$ 后的极限。

? 根据欧拉公式， $e^{i\pi/2}$ 等于
- [ ] $-1$
- [ ] $1$
- [x] $i$
- [ ] $-i$
> $e^{i\pi/2} = \cos\dfrac{\pi}{2} + i\sin\dfrac{\pi}{2} = 0 + i = i$：绕单位圆四分之一转。 $-1$ 是 $e^{i\pi}$，即半转；1 是 $e^0$； $-i$ 是 $e^{-i\pi/2}$。
```

```check
same((1/((n + 1)*3**(n + 1)))/(1/(n*3**n)), n/(3*(n + 1))); limit_is(n/(3*(n + 1)), n, oo, Rational(1, 3))
holds(Sum(1/n, (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**n/n, (n, 1, oo)).is_convergent())
same(series(exp(2*x), x, 0, 5).removeO().coeff(x, 4), Rational(2, 3)); same(diff(exp(2*x), x, 4).subs(x, 0)/factorial(4), Rational(2, 3))
same(series(1/(1 + x**2), x, 0, 8).removeO(), 1 - x**2 + x**4 - x**6)
fQ = 2 + 3*(x - 1) + 2*(x - 1)**2; same([diff(fQ, x, j).subs(x, 1) for j in range(3)], [2, 3, 4])
rounds(Rational(1, 10)**5/120, '8.3e-8'); rounds(Rational(1, 10)**4/24, '4.2e-6'); rounds(Rational(1, 10)**3/6, '1.7e-4')
holds(Abs(sin(Rational(1, 10)) - (Rational(1, 10) - Rational(1, 6000))) <= Rational(1, 10)**5/120)
limit_is((x - sin(x))/x**3, x, 0, Rational(1, 6)); limit_is((sin(x) - x)/x**3, x, 0, -Rational(1, 6)); limit_is((x - atan(x))/x**3, x, 0, Rational(1, 3))
same(exp(I*pi/2), I); same(exp(-I*pi/2), -I); same(exp(I*pi), -1); same(exp(0), 1)
```
