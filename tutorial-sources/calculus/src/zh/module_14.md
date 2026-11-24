---
title: 数列与级数
part: 4
lead: 判断无穷数列是否趋于极限，并理解无穷多个数相加的含义。你将求等比级数与裂项相消级数的和，解释调和级数的项趋于零却仍然发散的原因，运用判别法判断收敛性，并在估计级数和时给出误差上界。
minutes: 270
needs: 模块 1 到 13，特别是极限（模块 2 和 3），洛必达法则（模块 7）和反常积分（模块 12）
goals:
  - 使用极限法则、夹逼定理和函数极限来求解数列的极限，并用 ε 和 N 证明简单的极限
  - 使用单调收敛定理证明一个数列收敛，并求递归数列的极限
  - 求和几何级数和裂项相消级数，并解释为什么调和级数虽然其项趋于 0 却发散
  - 使用发散测试、积分测试、比较测试、交错级数测试、比值测试和根值判别法判断级数是否收敛，并根据策略选择合适的测试方法
  - 利用积分测试或交错级数测试估计级数的和，并保证误差界
  - 区分绝对收敛与条件收敛，并解释重新排列级数对其和的影响
---

## 数列 {#sequences}

微积分不断产生旨在趋近于某个值的数字列表。牛顿法用于 $\sqrt2$ 给出 $1, \tfrac32, \tfrac{17}{12}, \tfrac{577}{408}, \dots$（[模块 7](module_07_ZH.html#newton)）；年利率 100%，按 $n$ 次每年复利，将 £1 变为 $(1 + \tfrac1n)^n$ 英镑，对于 $n = 1, 2, 3, \dots$（[模块 6](module_06_ZH.html#compound-interest)）；二分法给出的区间长度每次减半（[模块 3](module_03_ZH.html#bisection)）。每个都是一个数列，每个的问题都是相同的：它是否会趋于一个极限？本模块作为课程第四部分的开篇，首先回答这个问题。然后转向赋予第四部分名称的问题：如何理解无限多个数的相加？

::: definition 数列
一个 **数列** 是一个按确定顺序排列的无限数列，

$$a_1, a_2, a_3, \dots, a_n, \dots$$

数 $a_n$ 读作「a 下标 n」，是数列的第 $n$ **项**，$n$ 是它的**下标**。整个数列记为 $(a_n)$。严格来说，数列是定义在某个起始下标及其后各整数上的函数，起始下标通常为 $n \ge 1$，有时为 $n \ge 0$；$a_n$ 是它在 $n$ 处的值。
:::

序列可以用三种方式给出：

- 通过第 $n$ 项的公式：$a_n = \dfrac1n$ 给出 $1, \tfrac12, \tfrac13, \tfrac14, \dots$；
- 通过一个规则，从前面的项计算出当前项，如牛顿法所做的（第 14.2 节）；
- 通过描述："$\sqrt2$ 向下取整到 $n$ 位小数" 给出 $1.4, 1.41, 1.414, 1.4142, \dots$

序列的图像不是一条曲线，而是一排点，每个整数 $n$ 对应一个高度 $a_n$。图 14.1 展示了这个序列

$$a_n = 1 + \frac{(-1)^n}{n}: \qquad 0, \ \frac32, \ \frac23, \ \frac54, \ \frac45, \ \frac76, \ \dots$$

它的项在 1 的两侧跳跃，且每个项都比前一个更接近 1。

```check
afig = lambda j: 1 + Rational((-1)**j, j)
same([afig(j) for j in range(1, 7)], [0, Rational(3, 2), Rational(2, 3), Rational(5, 4), Rational(4, 5), Rational(7, 6)])
holds(all(Abs(afig(j + 1) - 1) < Abs(afig(j) - 1) for j in range(1, 300)))
holds(all((afig(j) - 1)*(afig(j + 1) - 1) < 0 for j in range(1, 300)))      # the terms alternate sides of 1
```

### 序列的极限 {#limit}

数列 $(a_n)$ 有极限 $L$，如果对于每一个足够大的 $n$，$a_n$ 都可以任意接近 $L$。这是 [定义 3.7](module_03_ZH.html#limits-at-infinity)] 中 $n$ 仅遍历整数的情况下的无穷极限。它被精确地定义为模块 2 对函数极限定义的方式 ([第 2.7 节](module_02_ZH.html#precise)])，其表述如下：

::: definition 序列的极限
$\displaystyle\lim_{n\to\infty} a_n = L$，读作“当 n 趋于无穷时，子列 a_n 的极限是 L”，表示：对于任意数 $\varepsilon > 0$，存在一个数 $N$，使得对于每一个索引 $n > N$，

$$\abs{a_n - L} < \varepsilon.$$

此时数列**收敛**于 $L$，也可记作 $a_n \to L$。不收敛的数列称为**发散**。若对每个数 $M$，都存在 $N$，使每个 $n > N$ 都满足 $a_n > M$，则称数列**发散到正无穷**，记为 $a_n \to \infty$；$a_n \to -\infty$ 的定义类似。
:::

这是第2模块的游戏。挑战者提出一个容忍度 $\varepsilon$；你回应一个 $N$，即序列中某个位置之后，每一项都位于 $\varepsilon$ 之内 $L$。其中 $\delta$ 表示 $x$ 必须接近 $a$ 的程度，而 $N$ 表示你必须沿序列走多远。在图上，从某个索引开始的所有点都必须位于带状区域 $L - \varepsilon < y < L + \varepsilon$ 内。

对于图14.1中的序列，当 $\abs{a_n - 1} = \dfrac1n$ 小于 $\varepsilon$ 时，正好等于 $n > \dfrac1\varepsilon$。因此 $N = \dfrac1\varepsilon$ 每一轮都获胜，而 $a_n \to 1$。对于 $\varepsilon = 0.25$，它给出 $N = 4$：从第四项开始，每一项都在带状区域内。

::: figure id=fig-14-1
序列 $a_n = 1 + (-1)^n/n$，以点的形式绘制。它的各项在极限 1 的两侧来回跳跃，越来越接近。对于挑战 $\varepsilon = 0.25$（橙色带状区域，从 0.75 到 1.25）， $N = 4$ 是一个胜利的回应：从第四项（绿色）开始，每一项都在带状区域内。第四项 $a_4 = 1.25$ 位于带状区域的边缘。一个更小的 $\varepsilon$ 需要一个更大的 $N$。
:::

```check
same(Abs(afig(7) - 1), Rational(1, 7))
holds(all(Abs(afig(j) - 1) == Rational(1, j) for j in range(1, 200)))
holds(all(Abs(afig(j) - 1) < Rational(1, 4) for j in range(5, 400)))
same(afig(4), Rational(5, 4)); holds(Abs(afig(4) - 1) >= Rational(1, 4))
same(1/Rational(1, 4), 4)
```

::: example ε–N 证明
证明 $\displaystyle\lim_{n\to\infty}\frac{3n + 1}{n + 2} = 3$，并为挑战 $\varepsilon = 0.01$ 找到一个 $N$。

*草稿工作。* 把差值放在一个分母下。其分子是 $3n + 1 - 3(n + 2) = -5$，且 $n + 2 > 0$，因此

$$\abs{\frac{3n + 1}{n + 2} - 3} = \abs{\frac{-5}{n + 2}} = \frac{5}{n + 2}.$$

当$n + 2 > 5/\varepsilon$时，该式小于$\varepsilon$，而$n > 5/\varepsilon$显然满足此条件。因此尝试$N = 5/\varepsilon$。

*证明。* 设 $\varepsilon > 0$，选择 $N = 5/\varepsilon$。如果 $n > N$，则 $n + 2 > 5/\varepsilon$，因此

$$\abs{\frac{3n + 1}{n + 2} - 3} = \frac{5}{n + 2} < \varepsilon.$$

每个挑战都被满足，因此极限是 3。对于 $\varepsilon = 0.01$，证明给出 $N = 500$：例如，第 500 项之后的每一项都在 3 的 0.01 之内，比如 $a_{501} = \tfrac{1504}{503} \approx 2.99006$。最小的获胜 $N$ 是 498，因为 $\dfrac{5}{n + 2} < 0.01$ 恰好当 $n + 2 > 500$；如模块 2 所示，一个证明需要一个获胜回应，而不是最好的一个。

```check
nn = symbols('n', positive=True, integer=True); ep = symbols('epsilon', positive=True)
an1 = (3*nn + 1)/(nn + 2)
steps(an1 - 3, (3*nn + 1 - 3*(nn + 2))/(nn + 2), -5/(nn + 2))
same(Abs(an1 - 3), 5/(nn + 2))
same(solve(Eq(5/(x + 2), ep), x), [5/ep - 2])                 # 5/(n + 2) = eps where n = 5/eps - 2
holds((ep - 5/(5/ep + 2)).factor().is_positive)                # at n = N = 5/eps the distance is already below eps
same(5/Rational(1, 100), 500); same(an1.subs(nn, 501), Rational(1504, 503)); rounds(Rational(1504, 503), '2.99006')
holds(Rational(5, 501) < Rational(1, 100)); holds(not (Rational(5, 500) < Rational(1, 100)))   # n = 499 wins, n = 498 does not
limit_is((3*n + 1)/(n + 2), n, oo, 3)
```
:::

数列发散当它的项永不趋于稳定。$(-1)^n$ 的项无限交替于 $-1$ 和 $1$；[例 2.14](module_02_ZH.html#no-limit-proof)] 中的三角不等式论证表明，没有数 $L$ 是它们的极限（练习 14.1 有类似的数列）。$n^2$ 的项无限增大：$n^2 \to \infty$。趋向无穷的数列在定义 14.2 的意义上没有极限；写作 $a_n \to \infty$ 表示它如何发散。收敛数列只有一个极限，如例 2.14 后的论证在 [第 2.7 节](module_02_ZH.html#no-limit-proof)] 中所示。而且最初的项并不重要：改变、添加或删除有限项不会改变数列是否收敛或其极限。

```check
same([(-1)**j for j in range(1, 7)], [-1, 1, -1, 1, -1, 1]); limit_is(n**2, n, oo, oo)
```

::: pitfall
极限是关于序列的尾部，而不是它的前几项，而前几项可能会误导很长一段时间。序列 $a_n = n^{10}/2^n$ 在它的前 14 项中上升，到 $n = 14$ 时达到约 1770 万，之后趋向于它的极限 0（参见 [模块 7](module_07_ZH.html#growth) 的定理 7.7）。

```check
holds(all(Integer(j + 1)**10/2**(j + 1) > Integer(j)**10/2**j for j in range(1, 14)))
holds(all(Integer(j + 1)**10/2**(j + 1) < Integer(j)**10/2**j for j in range(14, 200)))
rounds(Integer(14)**10/2**14/10**6, '17.7'); limit_is(n**10/2**n, n, oo, 0)
```
:::

### 极限法则和夹逼定理 {#laws}

数列的极限遵循与函数极限相同的法则，且证明方法相同（[小节 2.4](module_02_ZH.html#laws)] 和 [小节 2.7](module_02_ZH.html#no-limit-proof)] 的 Going deeper 框：用 $N$ 替代 $\delta$，当 模块 2 的证明取两个 $\delta$ 中的较小者时，数列的证明取两个 $N$ 中的较大者。

::: theorem 数列的极限法则
假设 $a_n \to L$ 和 $b_n \to M$，且 $c$ 是一个常数。则

$$\begin{aligned} a_n + b_n &\to L + M, & a_n - b_n &\to L - M, \\ c\,a_n &\to cL, & a_n b_n &\to LM, \end{aligned}$$

且 $\dfrac{a_n}{b_n} \to \dfrac{L}{M}$ 如果 $M \ne 0$。如果 $a_n \to L$ 且函数 $f$ 在 $L$ 处连续，则 $f(a_n) \to f(L)$。
:::

最后一个法则对应 [定理 3.4](module_03_ZH.html#composition)]：极限可以进入连续函数内部。例如， $\sqrt{4 + 1/n} \to \sqrt{4 + 0} = 2$，因为 $1/n \to 0$ 且平方根在 4 处连续。

```check
limit_is(sqrt(4 + 1/n), n, oo, 2); limit_is(1/n, n, oo, 0)
```

::: theorem 数列的夹逼定理
如果 $b_n \le a_n \le c_n$ 对于某个索引之后的每一个 $n$，且 $b_n \to L$ 和 $c_n \to L$，则 $a_n \to L$。特别是，如果 $\abs{a_n} \to 0$，则 $a_n \to 0$。
:::

第二个句子由第一个句子推出，因为 $-\abs{a_n} \le a_n \le \abs{a_n}$ 和 $-\abs{a_n} \to 0$ 满足常数倍法则。第一个句子的证明见 [定理 2.4](module_02_ZH.html#squeeze)，第 2.7 节“深入理解”框中，用 $N$ 代替 $\delta$]。

本模块中最重要的数列是固定数 $r$ 的幂 $r^n$。

::: theorem 等比数列
对于常数 $r$，数列 $r^n$，对于 $n = 0, 1, 2, \dots$：

- 当 $-1 < r < 1$ 时，收敛于 0；
- 当 $r = 1$ 时，收敛于 1；
- 当 $r > 1$ 时，发散到无穷大；
- 若 $r \le -1$，则数列发散，且无极限。
:::

::: proof
对于 $r > 1$，写成 $r = 1 + q$ 与 $q > 0$。[第 3.7 节](module_03_ZH.html#other-limits) 显示 $(1 + q)^n \ge 1 + nq$ 对于每个 $n \ge 1$ 都成立，因此 $r^n$ 超过任何数 $M$ 一旦 $n > M/q$： $r^n \to \infty$。]

对于 $0 < \abs{r} < 1$，数 $1/\abs{r}$ 大于 1，因此 $(1/\abs{r})^n \to \infty$ 由第一种情况。一个趋向于无穷大的数列的倒数趋向于 0（如果 $b_n > 1/\varepsilon$ 对于每一个 $n > N$，则 $0 < 1/b_n < \varepsilon$ 对于这些 $n$），所以 $\abs{r^n} = 1/(1/\abs{r})^n \to 0$，并且 $r^n \to 0$ 由夹逼定理。对于 $r = 0$，每个 $r^0 = 1$ 之后的项都是 0，而对于 $r = 1$，每个项都是 1。

对于 $r = -1$，项是 $1, -1, 1, -1, \dots$，没有极限。对于 $r < -1$， $\abs{r^n} = \abs{r}^n \to \infty$，因此项是没有界的，而收敛数列是有界的：从某个索引开始，其项都在极限值附近 1 范围内，且在此之前的项是有限的。
:::

```check
qp = symbols('q', positive=True)
for j in (1, 2, 5, 12):
    holds(expand((1 + qp)**j - (1 + j*qp)).subs(qp, Rational(1, 3)) >= 0)
holds(all((1 + Rational(1, 10))**j >= 1 + j*Rational(1, 10) for j in range(1, 60)))
limit_is(Rational(3, 2)**n, n, oo, oo); limit_is(Rational(1, 2)**n, n, oo, 0); limit_is(Rational(-1, 2)**n, n, oo, 0)
same((Rational(1, 2)**n)*(2**n), 1)                       # |r^n| = 1/(1/|r|)^n
same([(-1)**j for j in range(0, 6)], [1, -1, 1, -1, 1, -1]); limit_is(2**n, n, oo, oo)
```

::: example 数列的极限
求以下数列的极限

- (a) $\dfrac{2n^2 - 3n}{5n^2 + 4}$
- (b) $\dfrac{(-1)^n}{n}$
- (c) $\dfrac{\cos n}{\sqrt n}$
- (d) $\dfrac{3^n + 4^n}{5^n}$

**(a)** 将分子和分母都除以 $n^2$，即分母中最高次幂，如同处理无穷大的有理函数（[定理 3.10](module_03_ZH.html#rational-at-infinity)）：

$$\frac{2n^2 - 3n}{5n^2 + 4} = \frac{2 - 3/n}{5 + 4/n^2} \to \frac{2 - 0}{5 + 0} = \frac25,$$

由极限法则，因为 $1/n \to 0$ 和 $1/n^2 \to 0$。

**(b)** 项的符号交替变化，但其绝对值 $\abs{(-1)^n/n} = 1/n$ 趋于 0。根据夹逼定理， $(-1)^n/n \to 0$。

**(c)** 由于 $-1 \le \cos n \le 1$，

$$-\frac{1}{\sqrt n} \le \frac{\cos n}{\sqrt n} \le \frac{1}{\sqrt n},$$

且两个界都趋于 0，因为 $1/\sqrt n = 1/n^{1/2}$ ([小节 3.7](module_03_ZH.html#limits-at-infinity))。根据夹逼定理， $\cos n/\sqrt n \to 0$。

**(d)** 分拆分数： $\dfrac{3^n + 4^n}{5^n} = \Big(\dfrac35\Big)^n + \Big(\dfrac45\Big)^n$。两个比值都在 $-1$ 和 1 之间，因此根据定理 14.3 和和法则，极限是 $0 + 0 = 0$。

```check
steps((2*n**2 - 3*n)/(5*n**2 + 4), (2 - 3/n)/(5 + 4/n**2)); limit_is((2*n**2 - 3*n)/(5*n**2 + 4), n, oo, Rational(2, 5))
holds(all(Abs(Rational((-1)**j, j)) == Rational(1, j) for j in range(1, 100))); limit_is(1/n, n, oo, 0)
for j in range(1, 60):
    holds(-1/sqrt(j) <= cos(j)/sqrt(j)); holds(cos(j)/sqrt(j) <= 1/sqrt(j))
limit_is(1/sqrt(n), n, oo, 0); limit_is(-1/sqrt(n), n, oo, 0); limit_is(cos(n)/sqrt(n), n, oo, 0)
holds(all((Integer(3)**j + Integer(4)**j)/Integer(5)**j == Rational(3, 5)**j + Rational(4, 5)**j for j in range(0, 30)))
limit_is(Rational(3, 5)**n, n, oo, 0); limit_is(Rational(4, 5)**n, n, oo, 0)
```
:::

::: pitfall
幂法则适用于固定幂的情况。在 $\big(1 + \tfrac1n\big)^n$ 中，底数趋于 1，但指数随着 $n$ 增长，极限是 $e$ ([定理 6.6](module_06_ZH.html#two-routes))，不是 $1^n = 1$。形如 $1^\infty$ 的表达式是不定式 ([模块 7](module_07_ZH.html#powers))。

```check
limit_is((1 + 1/n)**n, n, oo, E); limit_is(1 + 1/n, n, oo, 1)
```
:::

### 函数的序列 {#from-functions}

许多序列是函数在整数点处的值： $a_n = (\ln n)/n$ 是 $f(n)$ 在 $f(x) = (\ln x)/x$ 处的值。因此，所有关于无穷远处极限的知识都适用，包括洛必达法则。

::: theorem 函数的序列
如果 $\displaystyle\lim_{x\to\infty} f(x) = L$ 和 $a_n = f(n)$ 对于每一个自然数 $n \ge 1$ 都成立，则 $\displaystyle\lim_{n\to\infty} a_n = L$。同样的情况也适用于将 $\infty$ 或 $-\infty$ 替换 $L$ 的情形。
:::

::: proof
设 $\varepsilon > 0$。由于当 $x \to \infty$ 时有 $f(x) \to L$，存在一个数 $N$，使每个实数 $x > N$ 都满足 $\abs{f(x) - L} < \varepsilon$。这是定义 3.7 的严格表述，见第 3.7 节末尾的「深入一步」。特别地，每个非负整数 $n > N$ 也满足此条件，因此对这些 $n$ 有 $\abs{a_n - L} < \varepsilon$。$\pm\infty$ 的证明类似，只需将带状范围替换为界 $M$。
:::

你不能对 $a_n$ 关于 $n$ 求导，因为序列只在自然数上定义。对函数 $f(x)$ 应用洛必达法则，然后使用定理 14.4。

::: example 函数的极限
求下列各项的极限：(a) $\dfrac{\ln n}{n}$，(b) $n^{1/n}$ 和 (c) $\Big(1 + \dfrac2n\Big)^n$。

**(a)** 如$x \to \infty$所示，$(\ln x)/x$具有形式$\infty/\infty$，且导数的商为$\dfrac{1/x}{1} = \dfrac1x \to 0$；因此由洛必达法则得$(\ln x)/x \to 0$（此为[定理7.6](module_07_ZH.html#growth)，其中$p = 1$）。由定理14.4，$(\ln n)/n \to 0$。

**(b)** [例7.18](module_07_ZH.html#powers) 表明 $x^{1/x} \to 1$ 当 $x \to \infty$：其对数为 $(\ln x)/x$，由 (a) 得到趋于 0，且 $e^0 = 1$。因此 $n^{1/n} \to 1$；例如，$1000^{1/1000} \approx 1.0069$。

**(c)** [例7.17](module_07_ZH.html#powers)，当 $a = 2$，表明 $(1 + 2/x)^x \to e^2$ 当 $x \to \infty$。因此 $(1 + 2/n)^n \to e^2 \approx 7.389$。

```check
same(diff(log(x), x)/diff(x, x), 1/x); limit_is(1/x, x, oo, 0); limit_is(log(x)/x, x, oo, 0)
xq = symbols('x', positive=True)
same(expand_log(log(xq**(1/xq))), log(xq)/xq); limit_is(x**(1/x), x, oo, 1); rounds(Integer(1000)**Rational(1, 1000), '1.0069')
limit_is((1 + 2/x)**x, x, oo, exp(2)); rounds(exp(2), '7.389')
limit_is(log(n)/n, n, oo, 0); limit_is(n**(1/n), n, oo, 1); limit_is((1 + 2/n)**n, n, oo, exp(2))
```
:::

::: pitfall
定理14.4的逆命题是错误的。序列 $a_n = \sin(\pi n)$ 对于每一个整数 $n$ 都等于 0，因此它收敛于 0；但 $\sin(\pi x)$ 在 $x \to \infty$ 时没有极限，因为它在 $-1$ 和 $1$ 之间来回震荡。一个序列只在整数点采样 $f$。当 $f(x)$ 没有极限时，应根据序列本身来判断该序列的情况。

```check
ni = symbols('n', integer=True)
same(sin(pi*ni), 0); same(limit(sin(pi*x), x, oo), AccumBounds(-1, 1))
same(sin(pi*Rational(5, 2)), 1); same(sin(pi*Rational(7, 2)), -1)     # between the whole numbers it reaches 1 and -1
```
:::

## 单调序列 {#monotone}

为证明 $a_n \to L$ 根据定义 14.2，你需要知道 $L$。通常你并不需要：极限正是你想要找到的。对于一种重要的序列类型，有一种方法可以在不知道极限值的情况下确定极限存在。

再看把 $\sqrt2$ 向下舍入到 $n$ 位小数得到的数列 $1, 1.4, 1.41, 1.414, 1.4142, \dots$（从 $n = 0$ 开始）。每一项都不小于前一项，并且都小于 1.5。各项逐渐上升，但不会超过 1.5，因此必在不超过 1.5 的某个数附近聚集。它们趋近于 $\sqrt2$。

```check
dec = [floor(sqrt(2)*10**j)/Integer(10)**j for j in range(0, 5)]
same(dec, [1, Rational(14, 10), Rational(141, 100), Rational(1414, 1000), Rational(14142, 10000)])
holds(all(dec[j] <= dec[j + 1] for j in range(4))); holds(all(d < Rational(3, 2) for d in dec))
holds(all(sqrt(2) - floor(sqrt(2)*10**j)/Integer(10)**j < Rational(1, 10**j) for j in range(0, 12)))
```

::: definition 单调且有界的序列
若对每个 $n$ 都有 $a_n \le a_{n+1}$，则称数列 $(a_n)$ **递增**。若对每个 $n$ 都有 $a_n \ge a_{n+1}$，则称它**递减**。递增或递减的数列称为**单调数列**。若存在数 $M$ 作为**上界**，使每个 $n$ 都满足 $a_n \le M$，则称数列**有上界**。若存在数 $m$ 作为**下界**，使每个 $n$ 都满足 $a_n \ge m$，则称数列**有下界**。既有上界又有下界的数列称为**有界**。
:::

递增序列可以重复某一项；若对每个$a_n < a_{n+1}$都有$n$，则**严格递增**，严格递减的定义方式相同。有些书籍将定义中的序列称为“非递减”和“非递增”。注意与模块4和[[小节 8.3](module_08_ZH.html#monotonic)]]的区别，其中递增函数是严格上升的：对于序列，本模块允许相邻项相等。

### 单调收敛定理 {#mct}

::: theorem 单调收敛定理
递增且有上界的数列收敛，其极限至少等于每一个项，至多等于每一个上界。递减且有下界的数列收敛，其极限至多等于每一个项，至少等于每一个下界。
:::

本定理不是从课程中更早的内容推导而来的。它是实数的 **完备性** 的一种形式，即数轴上没有间隙的性质。实分析课程要么构造实数并证明完备性，要么将其作为公理，即从其出发证明其余性质的基本属性。本课程将其作为公理，单调收敛定理是课程中以该形式陈述的定理。 $\sqrt2$ 的十进制近似值说明了为何这是实数的性质，而不是所有数的性质。每一个项都是分数，数列是递增且有上界的，但没有分数是它的极限，因为 $\sqrt2$ 是无理数。在分数范围内，该数列逐渐逼近一个间隙，却没有极限。

每个陈述的后半部分均可证明。极限保持非严格不等式：如果对每个 $n$ 和 $a_n \to L$ 都有 $a_n \le M$，则 $L \le M$。事实上，如果 $L$ 大于 $M$，挑战 $\varepsilon = L - M$ 将给出具有 $a_n > L - \varepsilon = M$ 的项。同理，如果对从某个索引开始的每个 $n$ 都有 $a_n \ge c$，则 $L \ge c$。应用于上界 $M$，第一个陈述表明极限至多为 $M$。当序列递增时，项 $a_m, a_{m+1}, \dots$ 均至少为 $a_m$，因此第二个陈述（取 $c = a_m$）表明极限至少为 $a_m$。

```check
LL_, MM_ = symbols('L M', real=True)
same(LL_ - (LL_ - MM_), MM_)           # the challenge eps = L - M leaves terms above L - eps = M
same(LL_ + (MM_ - LL_), MM_)           # and if L < c = M, the challenge eps = c - L leaves terms below L + eps = c
```

模块 3 证明介值定理时（[第 3.3 节](module_03_ZH.html#ivt)）使用了完备性的另一种形式。若区间 $[a_0, b_0], [a_1, b_1], [a_2, b_2], \dots$ 中每个区间都包含在前一个区间内，则存在同时属于所有区间的数 $c$。单调收敛定理可用来证明这一点。左端点单调递增，即 $a_0 \le a_1 \le a_2 \le \cdots$，而每个右端点 $b_m$ 都是这些左端点的上界：$n \ge m$ 时有 $a_n \le b_n \le b_m$，$n < m$ 时有 $a_n \le a_m \le b_m$。因此 $a_n$ 收敛于数 $c$，它不小于任何 $a_n$，也不大于任何 $b_m$。于是 $c$ 属于每个区间，正如模块 3 所需。

::: keyidea
单调收敛定理证明了极限的存在，而无需说明极限是什么。这是它的作用。模块3利用它来证明介值定理。模块6、12和13使用了函数的相同性质（一个递增且有上界的函数有极限），用来说明为什么点 $2^x$ 在0处的斜率存在（[第6.1节](module_06_ZH.html#base-e)）），用来比较反常积分（[第12.8节](module_12_ZH.html#comparison)）），并用来解释为什么解会趋近于一个稳定平衡点（[第13.3节](module_13_ZH.html#equilibria)）。最重要的是，正项级数的部分和是递增的，因此这样的级数收敛当且仅当其部分和有界：第14.5节和14.6节中所有关于正项的收敛性判别法都基于这一性质。
:::

::: deeper 完备性与最小上界
第一次阅读可以跳过这个框。分析课程通常将完备性表述为 **最小上界性质**：每个非空的有上界的实数集合都有一个最小上界，即一个比所有其他上界都小的上界。单调收敛定理只需几行即可推出。设 $(a_n)$ 是递增且有上界的，设 $s$ 是其各项的最小上界。设 $\varepsilon > 0$。数 $s - \varepsilon$ 比 $s$ 小，因此不是上界：存在一项 $a_N$ 大于 $s - \varepsilon$。对于每一个 $n > N$，则

$$s - \varepsilon < a_N \le a_n \le s,$$

所以 $\abs{a_n - s} < \varepsilon$：该序列收敛于 $s$。反之，最小上界性质可以从单调收敛定理推出，因此任一陈述都可以作为公理。
:::

### 递推序列 {#recursive}

当序列的首项给定且后续每一项均通过固定规则由前一项计算得出时，该序列被**递归地**定义，$a_{n+1} = g(a_n)$。程序通过循环计算此类序列，而牛顿法等数值方法也是递归。单调收敛定理为它们提供了一种三步法：证明序列是单调的，证明其有界，然后才根据规则求出极限。

::: example 牛顿法作为平方根的序列
牛顿法用于 $\sqrt2$ 是递归 $x_0 = 1$， $x_{n+1} = \tfrac12\big(x_n + 2/x_n\big)$ （[例7.9](module_07_ZH.html#newton)）。证明它收敛，并用单调收敛定理找出其极限。

[定理7.2](module_07_ZH.html#quadratic)表明$x_n \ge \sqrt2$对每个$n \ge 1$成立，且迭代值从$x_1$开始递减：$\tfrac32 \ge \tfrac{17}{12} \ge \tfrac{577}{408} \ge \cdots$。因此从$x_1$开始，该序列递减且由$\sqrt2$下界有界，由单调收敛定理知它收敛于某数$L \ge \sqrt2$。

为求 $L$，对递推式的两边取极限。左边 $x_{n+1}$ 是同一序列向右移动一位，因此它也趋于 $L$。右边 $L \ne 0$，因此极限法则给出 $\tfrac12\big(x_n + 2/x_n\big) \to \tfrac12\big(L + 2/L\big)$。因此

$$\begin{aligned} L &= \frac12\Big(L + \frac2L\Big), \quad\text{so} \\ 2L &= L + \frac2L, \quad L = \frac2L, \quad L^2 = 2. \end{aligned}$$

由于 $L \ge \sqrt2 > 0$， $L = \sqrt2$。模块 7 证明得更多：其公式 $x_{n+1} - \sqrt2 = \dfrac{(x_n - \sqrt2)^2}{2x_n}$ 表示迭代值接近 $\sqrt2$ 的速度。这个论证不需要这样的公式，且相同的三步法适用于许多没有公式的递推式。

```check
itn = [Integer(1)]
for _ in range(8):
    itn.append((itn[-1] + 2/itn[-1])/2)
same(itn[1:4], [Rational(3, 2), Rational(17, 12), Rational(577, 408)])
holds(all(itn[j]**2 >= 2 for j in range(1, 9)))         # x_n >= sqrt(2), compared through squares
holds(all(itn[j + 1] <= itn[j] for j in range(1, 8)))   # decreasing from x_1 on
Lp = symbols('L', positive=True)
same(solve(Eq(Lp, (Lp + 2/Lp)/2), Lp), [sqrt(2)])
steps(2*Lp - (Lp + 2/Lp), Lp - 2/Lp); same(solve(Eq(Lp, 2/Lp), Lp), [sqrt(2)])
xpos = symbols('x', positive=True)
same((xpos + 2/xpos)/2 - sqrt(2), (xpos - sqrt(2))**2/(2*xpos))   # Module 7's formula, with a = 2
```
:::

要证明一个递推序列的每一项具有某种性质，使用数学归纳法（[第 9.2 节](module_09_ZH.html#power-sums)）：证明首项具有该性质（基础情形），并且当某一项 $a_n$ 具有该性质时，下一项 $a_{n+1}$ 也具有该性质（归纳步骤）。因此 $a_1$ 具有该性质，所以 $a_2$ 具有该性质，所以 $a_3$ 具有该性质，依此类推，所有 $n$ 都具有该性质。模块 3 就是用这种方式证明 $(1 + q)^n \ge 1 + nq$ 的。

::: example 递推序列
设 $a_1 = 1$ 和 $a_{n+1} = \sqrt{2 + a_n}$ 对于 $n \ge 1$。证明该序列收敛，并求其极限。

第一项，精确形式和小数形式：

```valuetable
a_n = 1, sqrt(3), sqrt(2 + sqrt(3)), sqrt(2 + sqrt(2 + sqrt(3))), sqrt(2 + sqrt(2 + sqrt(2 + sqrt(3))))
$a_n\text{ in decimals}$ = a_n
$2 - a_n$ = 2 - a_n
digits = 6
---
a_{n} | a_n\text{ in decimals} | 2 - a_n
1 | 1 | 1
\sqrt{3} | 1.73205 | 0.267949
\sqrt{\sqrt{3} + 2} | 1.93185 | 0.0681483
\sqrt{\sqrt{\sqrt{3} + 2} + 2} | 1.98289 | 0.0171103
\sqrt{\sqrt{\sqrt{\sqrt{3} + 2} + 2} + 2} | 1.99572 | 0.00428215
```

它们似乎趋向于 2，图 14.2 展示了这一点。用三个步骤证明。

*有界性。* 每一项都是正数，因为 $a_1 = 1$ 和正数的平方根都是正数。而且每一项都小于 2： $a_1 = 1 < 2$，如果 $a_n < 2$，则 $2 + a_n < 4$，所以 $a_{n+1} = \sqrt{2 + a_n} < \sqrt4 = 2$。通过归纳法， $0 < a_n < 2$ 对于每一个 $n$ 都成立。

*单调递增。* 比较平方。对于 $0 < a_n < 2$，

$$\begin{aligned} a_{n+1}^2 - a_n^2 &= 2 + a_n - a_n^2 \\ &= (2 - a_n)(1 + a_n) > 0, \end{aligned}$$

因为两个因子都是正数。所以 $a_{n+1}^2 > a_n^2$，由于两个项都是正数， $a_{n+1} > a_n$。

*极限。* 根据单调收敛定理，该数列收敛于一个数 $L$，满足 $1 = a_1 \le L \le 2$。平方根是连续的，所以 $\sqrt{2 + a_n} \to \sqrt{2 + L}$，对递归式两边取极限得到 $L = \sqrt{2 + L}$。平方后， $L^2 - L - 2 = 0$，即 $(L - 2)(L + 1) = 0$，所以 $L = 2$ 或 $L = -1$。由于 $L \ge 1$，极限是 2。

表格显示了收敛速度：在第一步之后，每一步都将距离 2 除以几乎精确的 4。原因是恒等式 $2 - a_{n+1} = \dfrac{2 - a_n}{2 + a_{n+1}}$（将 $2 - \sqrt{2 + a_n}$ 上下同时乘以 $2 + \sqrt{2 + a_n}$，并利用 $2 + a_{n+1} \to 4$）。

```check
sq = [Integer(1)]
for _ in range(7):
    sq.append(sqrt(2 + sq[-1]))
same(sq[1:5], [sqrt(3), sqrt(2 + sqrt(3)), sqrt(2 + sqrt(2 + sqrt(3))), sqrt(2 + sqrt(2 + sqrt(2 + sqrt(3))))])
holds(all(0 < q_ < 2 for q_ in sq)); holds(all(sq[j] < sq[j + 1] for j in range(7)))
ap = symbols('a', positive=True)
same(2 + ap - ap**2, (2 - ap)*(1 + ap))
Lr = symbols('L', real=True)
same_set(solve(Lr**2 - Lr - 2, Lr), [2, -1]); same(solve(Eq(Lr, sqrt(2 + Lr)), Lr), [2])
same((2 - sqrt(2 + ap))*(2 + sqrt(2 + ap)), 2 - ap)            # so 2 - a_(n+1) = (2 - a_n)/(2 + a_(n+1))
rat = [(2 - sq[j + 1])/(2 - sq[j]) for j in range(1, 6)]
holds(all(Rational(1, 4) < q_ < Rational(26, 100) for q_ in rat))     # the distance to 2 shrinks by almost exactly 4
```
:::

::: figure id=fig-14-2
递推式 $a_{n+1} = \sqrt{2 + a_n}$ 从 $a_1 = 1$ 出发。左图：蛛网图。从直线 $y = x$ 上的点 $(a_n, a_n)$ 出发，向上到曲线 $y = \sqrt{2 + x}$，其高度为 $a_{n+1}$；然后水平移动到直线 $(a_{n+1}, a_{n+1})$，重复此过程。步骤逐渐趋近于交点 $(2, 2)$，其中 $L = \sqrt{2 + L}$。右图：各项本身逐渐趋近于极限 2（虚线），但永远不会达到它。
:::

::: pitfall
解决 $L = g(L)$ 是最后一步，不是第一步。这个等式说的是如果存在极限，它必须是什么；它并没有说明极限一定存在。对于 $a_1 = 1$ 和 $a_{n+1} = 2a_n$，它给出 $L = 2L$，因此 $L = 0$，然而项 $1, 2, 4, 8, \dots$ 趋向于无穷大。对于 $a_1 = 0$ 和 $a_{n+1} = 1 - a_n$，它给出 $L = \tfrac12$，然而项 $0, 1, 0, 1, \dots$ 没有极限。首先证明序列收敛，例如使用单调收敛定理。

```check
seq2 = [1]
for _ in range(4):
    seq2.append(2*seq2[-1])
same(seq2, [1, 2, 4, 8, 16]); same(solve(Eq(Lr, 2*Lr), Lr), [0])
seq3 = [0]
for _ in range(4):
    seq3.append(1 - seq3[-1])
same(seq3, [0, 1, 0, 1, 0]); same(solve(Eq(Lr, 1 - Lr), Lr), [Rational(1, 2)])
```
:::

::: compute Python 和 SymPy 中的序列
循环计算一个递归序列。以下是例 14.5 的前几项：

```python
import math
a = 1.0
for n in range(1, 9):
    print(f"a_{n} = {a:.10f}   2 - a_{n} = {2 - a:.3e}")
    a = math.sqrt(2 + a)        # the next term
```

```output
a_1 = 1.0000000000   2 - a_1 = 1.000e+00
a_2 = 1.7320508076   2 - a_2 = 2.679e-01
a_3 = 1.9318516526   2 - a_3 = 6.815e-02
a_4 = 1.9828897227   2 - a_4 = 1.711e-02
a_5 = 1.9957178465   2 - a_5 = 4.282e-03
a_6 = 1.9989291750   2 - a_6 = 1.071e-03
a_7 = 1.9997322758   2 - a_7 = 2.677e-04
a_8 = 1.9999330678   2 - a_8 = 6.693e-05
```

SymPy 的 `limit` 可以找出由公式给出的序列的极限，使用 `sp.oo` 对于 $\infty$：

```python
import sympy as sp
n = sp.symbols('n')
print(sp.limit((2*n**2 - 3*n)/(5*n**2 + 4), n, sp.oo))
print(sp.limit(n**(1/n), n, sp.oo), sp.limit((1 + 2/n)**n, n, sp.oo))
print(sp.limit(sp.sin(sp.pi*n), n, sp.oo))
```

```output
2/5
1 exp(2)
AccumBounds(-1, 1)
```

前两行与例题 14.2 和 14.3 一致。最后一行显示 `limit` 将 `n` 视为实变量：它计算函数 $\sin(\pi x)$ 的极限，该函数在 $-1$ 和 1 之间无限摆动（`AccumBounds(-1, 1)`，"积累界"），而不是序列 $\sin(\pi n)$ 的极限，该序列的所有项都是 0。声明该符号为整数，SymPy 会简化各项本身：

```python
k = sp.symbols('k', integer=True)
print(sp.sin(sp.pi*k))
```

```output
0
```
:::

## 级数 {#series}

要走到一扇门，你必须首先走完一半的距离，然后走完剩下一半的一半，再走完那一半的一半，如此无限进行下去。公元前五世纪，希腊哲学家埃利亚的芝诺提出了一个关于运动的悖论，问如何完成无限多个阶段。作为整体距离的分数，这些阶段的总和为 $\tfrac12, \tfrac14, \tfrac18, \dots$，一旦你能说出它们的总和，悖论就解决了。

图 14.3 显示了相同的总面积。将面积为 1 的正方形切成一半；将剩下的那一半再切成一半；将剩下的四分之一再切成一半，如此继续下去。经过 $N$ 次切割后，各块的总面积为

$$S_N = \frac12 + \frac14 + \cdots + \frac{1}{2^N} = 1 - \frac{1}{2^N},$$

由于尚未覆盖的部分是最后被切下的那一块，面积为 $1/2^N$。随着 $N$ 增大，未覆盖的部分逐渐缩小至 0 并趋于 $S_N \to 1$：无限多个部分精确地填满正方形。

::: figure id=fig-14-3
将正方形一分为二。左图：面积为 1 的正方形被分割成面积为 $\tfrac12, \tfrac14, \tfrac18, \dots$ 的若干部分；每一部分是剩余部分的一半，这些部分填满整个正方形。右图：部分和 $S_N = \tfrac12 + \tfrac14 + \cdots + \tfrac{1}{2^N} = 1 - \tfrac{1}{2^N}$ 向 1 上升（虚线）；每一步与 1 的差距减半。
:::

```check
same([sum(Rational(1, 2**j) for j in range(1, Nn + 1)) for Nn in range(1, 13)], [1 - Rational(1, 2**Nn) for Nn in range(1, 13)])
NNp = symbols('N', positive=True, integer=True)
same(summation(Rational(1, 2)**n, (n, 1, NNp)), 1 - Rational(1, 2)**NNp); limit_is(1 - Rational(1, 2)**n, n, oo, 1)
```

### 部分和 {#partial-sums}

::: definition 级数及其和
设 $(a_n)$ 是一个数列。其对应的**级数**

$$\sum_{n=1}^{\infty} a_n = a_1 + a_2 + a_3 + \cdots,$$

读作「对 a 下标 n 从 n 等于 1 求和到无穷」。其**部分和**$S_N = a_1 + a_2 + \cdots + a_N$ 是前 $N$ 项之和。如果部分和数列收敛于数 $S$，则级数**收敛**，$S$ 称为它的**和**：

$$\sum_{n=1}^{\infty} a_n = S \quad\text{means}\quad \lim_{N\to\infty} S_N = S.$$

否则该级数 **发散**。
:::

无穷级数是一个极限：你不能一个一个地相加无限多个数，但你可以先相加前 $N$ 个数，然后问当 $N$ 增大时会发生什么。求和符号与第 9 模块相同，其中 $\infty$ 表示上限。一个级数可能从另一个下标开始，通常为 $n = 0$。在本模块中， $S_N$ 表示前 $N$ 项的和，因此对于 $\sum_{n=0}^{\infty} a_n$ 来说，它等于 $a_0 + a_1 + \cdots + a_{N-1}$。

每个级数都涉及两个数列：它的项 $a_n$ 和它的部分和 $S_N$。要将它们区分开。在芝诺级数中，项 $1/2^n$ 趋于 0，而部分和趋于 1，即级数的和。

级数可以逐项地相加和乘以常数，它们的第一项并不决定级数是否收敛。

::: theorem 级数的和的法则
如果 $\sum a_n = A$ 和 $\sum b_n = B$ 收敛且 $c$ 是一个常数，那么 $\sum (a_n + b_n) = A + B$、 $\sum (a_n - b_n) = A - B$ 和 $\sum c\,a_n = cA$。改变、添加或删除一个级数的有限项不会改变它是否收敛；如果它收敛，其和将改变量等于改变的总和。
:::

::: proof
$\sum (a_n + b_n)$ 的部分和为 $A_N + B_N$，其中 $A_N$ 和 $B_N$ 分别为两个级数的部分和，因此它们根据数列的和法则趋于 $A + B$；其余两个法则以相同方式成立。如果两个级数仅在前 $k$ 项不同，则对于 $N \ge k$，它们的部分和相差一个固定的数 $d$，即前 $k$ 项和的差；因此，一个部分和序列收敛当且仅当另一个也收敛，且它们的极限相差 $d$。在开头添加或删除项会改变索引，但这不会改变任何内容。
:::

::: pitfall
不存在关于乘积的此类法则： $\sum a_n b_n$ 不等于 $\big(\sum a_n\big)\big(\sum b_n\big)$。对于 $a_n = b_n = 1/2^n$， $\sum a_n b_n = \sum 1/4^n = \tfrac13$，虽然 $\big(\sum 1/2^n\big)^2 = 1$。并且和法则需要两个级数都收敛： $\sum (1 - 1)$ 为 0，而 $\sum 1$ 和 $\sum 1$ 发散。

```check
same(summation(Rational(1, 4)**n, (n, 1, oo)), Rational(1, 3)); same(summation(Rational(1, 2)**n, (n, 1, oo))**2, 1)
```
:::

### 几何级数 {#geometric}

锡诺的级数是最重要的一种级数：每一项都是前一项的固定倍数。

::: theorem 几何级数
设 $a \ne 0$。首项为 $a$、**公比**为 $r$ 的**等比级数**为

$$\sum_{n=0}^{\infty} ar^n = a + ar + ar^2 + ar^3 + \cdots,$$

收敛当 $\abs{r} < 1$，其和为

$$\sum_{n=0}^{\infty} ar^n = \frac{a}{1 - r},$$

并当 $\abs{r} \ge 1$ 时发散。
:::

::: proof
对于 $r \ne 1$，将部分和 $S_N = a + ar + \cdots + ar^{N-1}$ 乘以 $r$：

$$rS_N = ar + ar^2 + \cdots + ar^N.$$

相减：除了 $S_N$ 的第一个项和 $rS_N$ 的最后一个项外，其余所有项都相互抵消，因此 $S_N - rS_N = a - ar^N$，且

$$S_N = \frac{a(1 - r^N)}{1 - r} \qquad (r \ne 1).$$

若 $\abs{r} < 1$，则 $r^N \to 0$（定理 14.3），因此 $S_N \to \dfrac{a}{1 - r}$。若 $r = 1$，则 $S_N = Na$，其发散至 $\infty$ 或 $-\infty$。若 $\abs{r} \ge 1$ 且 $r \ne 1$，公式给出 $r^N = 1 - (1 - r)S_N/a$；若 $S_N$ 收敛，则 $r^N$ 也应收敛，根据极限法则，但定理 14.3 说明它并不收敛。因此该级数发散。
:::

```check
rr_ = symbols('r'); aa_ = symbols('a', nonzero=True)
for Nn in range(1, 9):
    same(sum(aa_*rr_**j for j in range(Nn)), aa_*(1 - rr_**Nn)/(1 - rr_))
    same(sum(aa_*rr_**j for j in range(Nn)) - rr_*sum(aa_*rr_**j for j in range(Nn)), aa_ - aa_*rr_**Nn)
SNs = aa_*(1 - rr_**NNp)/(1 - rr_)
same(1 - (1 - rr_)*SNs/aa_, rr_**NNp)
gsum = summation(rr_**n, (n, 0, oo)); same(aa_*gsum.args[0][0], aa_/(1 - rr_)); holds(gsum.args[0][1] == (Abs(rr_) < 1))
same(Rational(1, 2)/(1 - Rational(1, 2)), 1)               # Zeno: a = r = 1/2
```

锺子级数的第一项为 $a = \tfrac12$（在 $n = 1$ 处），公比为 $r = \tfrac12$，因此其和为 $\dfrac{1/2}{1 - 1/2} = 1$，正如平方所展示的。在公式中，无论级数的索引如何， $a$ 始终是级数的第一个项。

::: example 几何级数
求每个级数的和，或证明其发散：

- (a) $\displaystyle\sum_{n=1}^{\infty} 3\Big(-\frac23\Big)^n$
- (b) $\displaystyle\sum_{n=0}^{\infty} \frac{4^n}{3^{n+1}}$

**(a)** 第一项，在 $n = 1$ 处，是 $3 \cdot \big(-\tfrac23\big) = -2$，且每一项都是前一项乘以 $-\tfrac23$。因此，这个级数是一个等比级数，首项为 $a = -2$，公比为 $r = -\tfrac23$，其和为 $\abs{r} < 1$:

$$\begin{aligned} \sum_{n=1}^{\infty} 3\Big(-\frac23\Big)^n &= \frac{-2}{1 - (-2/3)} \\ &= \frac{-2}{5/3} = -\frac65. \end{aligned}$$

常见的错误是取 $a = 3$，即系数，这会得到 $\tfrac95$: 公式需要的是级数的首项，此处是含 $n = 1$ 的项。

**(b)** $\dfrac{4^n}{3^{n+1}} = \dfrac13\Big(\dfrac43\Big)^n$，因此该级数是一个公比为 $r = \tfrac43 > 1$ 的等比级数。它发散；事实上，其项是无界增长的。

```check
same(3*Rational(-2, 3), -2); same(summation(3*Rational(-2, 3)**n, (n, 1, oo)), Rational(-6, 5))
steps(-2/(1 - Rational(-2, 3)), -2/Rational(5, 3), Rational(-6, 5)); same(3/(1 - Rational(-2, 3)), Rational(9, 5))
holds(all(Integer(4)**j/Integer(3)**(j + 1) == Rational(1, 3)*Rational(4, 3)**j for j in range(0, 20)))
limit_is(Rational(1, 3)*Rational(4, 3)**n, n, oo, oo)
```
:::

::: example 循环小数
将 $0.272727\ldots$ 和 $2.3454545\ldots$ 写成分数。

一个小数是一个和：即 $0.272727\ldots = \dfrac{27}{100} + \dfrac{27}{100^2} + \dfrac{27}{100^3} + \cdots$，是一个首项为 $a = \tfrac{27}{100}$、公比为 $r = \tfrac{1}{100}$ 的等比级数。其和为

$$\frac{27/100}{1 - 1/100} = \frac{27/100}{99/100} = \frac{27}{99} = \frac{3}{11}.$$

对于第二个数，只有数字 45 从第二位小数开始循环：

$$\begin{aligned} 2.3454545\ldots &= 2.3 + \Big(\frac{45}{1000} + \frac{45}{100\,000} + \cdots\Big) \\ &= \frac{23}{10} + \frac{45/1000}{1 - 1/100} \\ &= \frac{23}{10} + \frac{1}{22} = \frac{129}{55}. \end{aligned}$$

相同的推理得到 $0.999\ldots = \dfrac{9/10}{1 - 1/10} = 1$。一个无限小数是级数的和，且部分和 $0.9, 0.99, 0.999, \dots$ 收敛于 1：即 $0.999\ldots$ 和 1 是同一个数，只是写法不同。

```check
steps(Rational(27, 100)/(1 - Rational(1, 100)), Rational(27, 100)/Rational(99, 100), Rational(27, 99), Rational(3, 11)); rounds(Rational(3, 11), '0.272727')
steps(Rational(23, 10) + Rational(45, 1000)/(1 - Rational(1, 100)), Rational(23, 10) + Rational(1, 22), Rational(129, 55)); rounds(Rational(129, 55), '2.3454545')
same(Rational(9, 10)/(1 - Rational(1, 10)), 1); same([1 - Rational(1, 10**j) for j in (1, 2, 3)], [Rational(9, 10), Rational(99, 100), Rational(999, 1000)])
```
:::

几何级数出现在一个量被反复乘以相同因子的任何地方。例如，在强化学习中，程序通过收集奖励来学习行为，而$n$步之后到达的奖励会被因子$\gamma^n$折现，其中$0 < \gamma < 1$（$\gamma$是希腊字母gamma）。每一步奖励为1时，总价值为$\sum_{n=0}^{\infty} \gamma^n = \dfrac{1}{1 - \gamma}$，当$\gamma = 0.99$时该值为100。

```check
same(1/(1 - Rational(99, 100)), 100)
```

::: pitfall
公式 $\dfrac{a}{1 - r}$ 仅在 $\abs{r} < 1$ 时成立。将其应用于 $1 + 2 + 4 + 8 + \cdots$ 时得到 $\dfrac{1}{1 - 2} = -1$，这与正数之和显然矛盾：部分和 $2^N - 1$ 会无限增大。在使用公式前请检查 $\abs{r} < 1$。

```check
same(1/(1 - 2), -1); same([sum(2**j for j in range(Nn)) for Nn in range(1, 10)], [2**Nn - 1 for Nn in range(1, 10)])
```
:::

### 裂项相消级数 {#telescoping}

对于大多数级数，没有公式用于计算 $S_N$。几何级数是一个例外；裂项相消级数是另一个例外。它们的项是差值 $a_n = b_n - b_{n+1}$，在部分和中，所有项都会相互抵消，只剩下两端，就像一个折叠的裂项相消的各个部分：

$$\begin{aligned} S_N &= (b_1 - b_2) + (b_2 - b_3) + \cdots \\ &\qquad + (b_N - b_{N+1}) \\ &= b_1 - b_{N+1}. \end{aligned}$$

因此，该级数收敛当且仅当 $b_n$ 有极限，此时其和为 $b_1 - \lim b_n$。标准例子是

$$\sum_{n=1}^{\infty}\frac{1}{n(n + 1)}, \qquad \frac{1}{n(n + 1)} = \frac1n - \frac{1}{n + 1}$$

(将右边的表达式放在公共分母 $n(n + 1)$ 上进行检验). 此时 $b_n = 1/n$，因此 $S_N = 1 - \dfrac{1}{N + 1} \to 1$.

```check
same(1/(n*(n + 1)), 1/n - 1/(n + 1)); same((n + 1 - n)/(n*(n + 1)), 1/(n*(n + 1)))
same(summation(1/(nn*(nn + 1)), (nn, 1, NNp)), 1 - 1/(NNp + 1)); limit_is(1 - 1/(n + 1), n, oo, 1)
bs = Function('b')
same(sum(bs(j) - bs(j + 1) for j in range(1, 7)), bs(1) - bs(7))
```

::: example 两个裂项相消级数
(a) 求 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n + 2)}$. (b) 证明 $\displaystyle\sum_{n=1}^{\infty}\ln\Big(1 + \frac1n\Big)$ 发散.

**(a)** 通过部分分式分解 (模块 11)，得到 $\dfrac{1}{n(n + 2)} = \dfrac12\Big(\dfrac1n - \dfrac{1}{n + 2}\Big)$；通过合并右边，可验证 $\tfrac12\cdot\dfrac{(n + 2) - n}{n(n + 2)}$. 现在每个负项都会与后面两个正项相消：

$$\begin{aligned} S_N &= \frac12\Big[\Big(1 - \frac13\Big) + \Big(\frac12 - \frac14\Big) + \Big(\frac13 - \frac15\Big) \\ &\qquad + \cdots + \Big(\frac1N - \frac{1}{N + 2}\Big)\Big] \\ &= \frac12\Big(1 + \frac12 - \frac{1}{N + 1} - \frac{1}{N + 2}\Big). \end{aligned}$$

仅第一个两个正项和最后两个负项保留下来。当 $N \to \infty$ 时， $S_N \to \tfrac12 \cdot \tfrac32 = \tfrac34$.

**(b)** $\ln\big(1 + \tfrac1n\big) = \ln\dfrac{n + 1}{n} = \ln(n + 1) - \ln n$，根据对数的性质。因此该级数为裂项相消级数：

$$\begin{aligned} S_N &= (\ln 2 - \ln 1) + (\ln 3 - \ln 2) + \cdots \\ &\qquad + \big(\ln(N + 1) - \ln N\big) \\ &= \ln(N + 1), \end{aligned}$$

因为 $\ln 1 = 0$。当 $N \to \infty$ 时， $\ln(N + 1) \to \infty$：该级数发散，尽管其项趋于 $\ln 1 = 0$.

```check
same(1/(n*(n + 2)), (1/n - 1/(n + 2))/2); same(apart(1/(n*(n + 2)), n), 1/(2*n) - 1/(2*(n + 2)))
for Nn in range(1, 12):
    same(sum(Rational(1, j*(j + 2)) for j in range(1, Nn + 1)), (1 + Rational(1, 2) - Rational(1, Nn + 1) - Rational(1, Nn + 2))/2)
limit_is((1 + Rational(1, 2) - 1/(n + 1) - 1/(n + 2))/2, n, oo, Rational(3, 4)); same(summation(1/(n*(n + 2)), (n, 1, oo)), Rational(3, 4))
npos = symbols('n', positive=True)
same(expand_log(log((npos + 1)/npos)), log(npos + 1) - log(npos)); same(1 + 1/npos, (npos + 1)/npos)
for Nn in range(1, 10):
    same(expand_log(sum(log(1 + Rational(1, j)) for j in range(1, Nn + 1)), force=True), log(Nn + 1))
limit_is(log(n + 1), n, oo, oo); limit_is(log(1 + 1/n), n, oo, 0)
```
:::

第(b)部分是一个警告：趋于 0 的项并不保证级数收敛。第14.4节给出了最著名的例子。在此之前，可以尝试计算部分和进行实验。

::: widget name=series-explorer
选择一个级数并观察其部分和 $S_1, \dots, S_N$（点）及其各项（下方的线段）。虚线是级数的和，理论给出了这个值；结论来自本模块的定理，而不是这些点。从几何级数开始：设置 $r = 0.5$，然后 $r = 0.9$ 和 $0.99$，并观察当 $r$ 接近 1 时，收敛速度变慢；然后尝试 $r = -0.9$（交错和），以及 $r = -1$ 和 $r = 1.1$。选择调和级数并将 $N$ 移动到 200：点不断上升，但速度越来越慢，结论却是“发散”（第 14.4 节）。然后比较 $p$ 系列对于 $p = 2$、 $p = 1.1$ 和 $p = 0.9$（第 14.5 节）的和，交替调和级数（第 14.7 节），以及 $\sum 1/n!$ 和 $\sum (-1)^n$。
:::

::: compute 使用 SymPy 计算和
`sp.summation` 在可以时精确地添加一个级数，无论是有限还是无限。声明 `n` 和 `N` 为正整数有助于它：

```python
import sympy as sp
n, N = sp.symbols('n N', integer=True, positive=True)
print(sp.summation(1/(n*(n + 1)), (n, 1, N)))       # the partial sum S_N
print(sp.summation(1/(n*(n + 1)), (n, 1, sp.oo)))   # the sum
print(sp.apart(1/(n*(n + 2)), n))                   # partial fractions
print(sp.summation(3*sp.Rational(-2, 3)**n, (n, 1, sp.oo)))
```

```output
1 - 1/(N + 1)
1
-1/(2*(n + 2)) + 1/(2*n)
-6/5
```

这是第14.3节的裂项相消求和，第14.8例的分式分解（按SymPy的顺序排列两个分式）以及第14.6例的和。对于一个比值未知的几何级数，SymPy说明的条件为：

```python
r = sp.symbols('r')
print(sp.summation(r**n, (n, 0, sp.oo)))
```

```output
Piecewise((1/(1 - r), Abs(r) < 1), (Sum(r**n, (n, 0, oo)), True))
```

`Piecewise` 读作：$\dfrac{1}{1 - r}$ 如果 $\abs{r} < 1$，否则和未被计算，因为它发散。尽管如此，SymPy并非总是正确。级数 $\sum 1/(2n^2 - n)$ 收敛（可与第14.6节的 $\sum 1/n^2$ 比较），但：

```python
print(sp.summation(1/(2*n**2 - n), (n, 1, sp.oo)))
s = sum(1/(2*k**2 - k) for k in range(1, 10**6 + 1))   # 10^6 terms
print(f"{s:.6f}  {float(2*sp.log(2)):.6f}")
```

```output
nan
1.386294  1.386294
```

`nan` 表示「非数值」，说明 SymPy 没有算出结果。前一百万项的部分和与真实和 $2\ln 2$ 在六位小数上相符。由部分分式得 $\dfrac{1}{2n^2 - n} = 2\Big(\dfrac{1}{2n - 1} - \dfrac{1}{2n}\Big)$，即第 14.7 节交错调和级数相邻两项分组后再乘以 2。若计算机代数系统的答案无法直接验证，可以换一种方法检验。
:::

```check
same(1/(2*n**2 - n), 2*(1/(2*n - 1) - 1/(2*n))); rounds(2*log(2), '1.386294')
for M_ in range(1, 12):     # the partial sums are 2(H_2M - H_M), twice partial sums of the alternating harmonic series
    same(sum(Rational(1, 2*k_**2 - k_) for k_ in range(1, M_ + 1)), 2*(harmonic(2*M_) - harmonic(M_)))
rounds(2*(harmonic(Float(2*10**6, 50)) - harmonic(Float(10**6, 50))), '1.386294')
```

## 调和级数与发散性检验 {#harmonic}

如果一个级数收敛，其项必须趋于0：否则每个新项都会使部分和移动相当大的幅度。

::: theorem 收敛级数的项趋于 0
如果 $\sum a_n$ 收敛，则 $\displaystyle\lim_{n\to\infty} a_n = 0$。
:::

::: proof
每一项是两个连续部分和的差：$a_n = S_n - S_{n-1}$。如果 $S_N \to S$，则 $S_{N-1} \to S$（同一序列，向后移一位），因此 $a_n = S_n - S_{n-1} \to S - S = 0$。
:::

反过来理解，这个定理是一个判别法。

::: keyidea
**发散性判别法**。如果 $a_n$ 不趋于 0，要么因为它有另一个极限，要么因为它没有极限，那么 $\sum a_n$ 发散。如果 $a_n \to 0$，这个判别法无能为力：级数可能收敛也可能发散。
:::

::: example 发散性判别法
证明这些级数发散：(a) $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2n + 1}$，(b) $\displaystyle\sum_{n=0}^{\infty}(-1)^n$，(c) $\displaystyle\sum_{n=1}^{\infty}\cos\frac1n$。

**(a)** $\dfrac{n}{2n + 1} = \dfrac{1}{2 + 1/n} \to \dfrac12 \ne 0$.

**(b)** 项是 $1, -1, 1, -1, \dots$，它们没有极限（定理 14.3 与 $r = -1$）。部分和是 $1, 0, 1, 0, \dots$：它们永远不会稳定。

**(c)** $1/n \to 0$ 且余弦在 0 处连续，因此 $\cos(1/n) \to \cos 0 = 1 \ne 0$。

在每种情况下，各项都不趋于 0，因此级数发散。

```check
same(n/(2*n + 1), 1/(2 + 1/n)); limit_is(n/(2*n + 1), n, oo, Rational(1, 2))
same([sum((-1)**j for j in range(Nn)) for Nn in range(1, 9)], [1, 0, 1, 0, 1, 0, 1, 0])
limit_is(cos(1/n), n, oo, 1); same(cos(0), 1)
```
:::

### 调和级数发散。 {#harmonic-series}

是否成立：如果 $a_n \to 0$，那么 $\sum a_n$ 是否收敛？ 最著名的级数说明并不成立。 **调和级数** 是

$$\sum_{n=1}^{\infty}\frac1n = 1 + \frac12 + \frac13 + \frac14 + \cdots$$

它的各项趋于 0，且部分和增长非常缓慢：

```valuetable
N = 10, 100, 1000, 10000, 100000, 1000000
$S_N = 1 + \tfrac12 + \cdots + \tfrac1N$ = harmonic(N*Float(1, 40))
digits = 6
---
N | S_N = 1 + \tfrac12 + \cdots + \tfrac1N
10 | 2.92897
100 | 5.18738
1000 | 7.48547
10000 | 9.78761
100000 | 12.0901
1000000 | 14.3927
```

一百万项相加的和小于 15，而 $N$ 每增加十倍，只增加约 2.3。这些数字看起来似乎趋于稳定。实际上并非如此。

```check
holds(harmonic(Float(10**6, 40)) < 15)
for j in range(1, 6):
    dH = harmonic(Float(10**(j + 1), 40)) - harmonic(Float(10**j, 40))
    holds(Rational(22, 10) < dH); holds(dH < Rational(24, 10))
```

::: theorem 调和级数发散。
$\sum 1/n$ 的部分和趋于无穷大。
:::

::: proof
项都是正数，因此部分和递增。将前两项之后的项分成若干组，每组以 2 的幂结束：

$$\begin{aligned} S_{2^k} &= 1 + \frac12 + \Big(\frac13 + \frac14\Big) + \Big(\frac15 + \cdots + \frac18\Big) \\ &\qquad + \cdots + \Big(\frac{1}{2^{k-1} + 1} + \cdots + \frac{1}{2^k}\Big). \end{aligned}$$

结束于 $2^j$ 的一组有 $2^{j-1}$ 项，每一项都不小于最后一项 $1/2^j$。因此每一组都不小于 $2^{j-1}/2^j = \tfrac12$：例如 $\tfrac13 + \tfrac14 \ge \tfrac14 + \tfrac14 = \tfrac12$，以及 $\tfrac15 + \tfrac16 + \tfrac17 + \tfrac18 \ge 4 \cdot \tfrac18 = \tfrac12$。共有 $k - 1$ 组，因此

$$S_{2^k} \ge 1 + \frac12 + (k - 1)\cdot\frac12 = 1 + \frac{k}{2}.$$

给定任意数 $M$，选择 $k$ 使得 $1 + k/2 > M$。对于每一个 $N \ge 2^k$， $S_N \ge S_{2^k} > M$，因为部分和是递增的。所以 $S_N \to \infty$。
:::

```check
for j in range(2, 11):
    blk = sum(Rational(1, i) for i in range(2**(j - 1) + 1, 2**j + 1))
    holds(blk >= Rational(1, 2)); holds(all(Rational(1, i) >= Rational(1, 2**j) for i in range(2**(j - 1) + 1, 2**j + 1)))
    same(2**j - 2**(j - 1), 2**(j - 1))                     # the block ending at 2^j has 2^(j-1) terms
holds(Rational(1, 3) + Rational(1, 4) >= Rational(1, 2)); same(4*Rational(1, 8), Rational(1, 2))
for kk in range(1, 11):
    holds(harmonic(2**kk) >= 1 + Rational(kk, 2))
```

该证明展示了这些和增长得有多慢。它保证了 $S_N$ 至少为 10，由 $N = 2^{18} = 262{,}144$；实际上它在 $N = 12{,}367$ 时首次超过 10（第 14.5 节的计算框找到这个值）。要超过 100，需要超过 $10^{42}$ 项（第 14.5 节）。

```check
same(2**18, 262144); holds(1 + Rational(18, 2) >= 10)
holds(harmonic(12366) < 10); holds(harmonic(12367) > 10)
```

::: pitfall
级数中最常见的错误是“项趋于 0，因此级数收敛”。判别法仅在一个方向有效：收敛需要 $a_n \to 0$，但仅此并不足够。项 $1/n$ 趋于 0，但 $\sum 1/n$ 发散；同样 $\ln(1 + 1/n)$ 也发散，其级数也发散（例 14.8）。
:::

::: note
调和级数支撑着一摞著名的积木。在桌边堆叠$n$个长度为1的相同积木，每块积木都比下面那块多伸出一些：最上面那块伸出$\tfrac12$，下一块伸出$\tfrac14$，再下一块伸出$\tfrac16$，最下面那块伸出$\tfrac{1}{2n}$超出桌边。通过质心（模块12）的计算可知该堆叠保持平衡，此时最上面的积木到达

$$\frac12 + \frac14 + \cdots + \frac{1}{2n} = \frac12\Big(1 + \frac12 + \cdots + \frac1n\Big)$$

超出桌子的边缘。由于调和级数发散，悬垂的长度可以任意大。仅仅四个方块就已经让最上面的那个方块完全超出边缘，因为 $\tfrac12\big(1 + \tfrac12 + \tfrac13 + \tfrac14\big) = \tfrac{25}{24} > 1$；这样叠放，要得到10个长度的悬垂量需要272,400,600个方块。

```check
same(sum(Rational(1, 2*j) for j in range(1, 5)), Rational(25, 24)); holds(Rational(25, 24) > 1)
import mpmath
mpmath.mp.dps = 30
holds(mpmath.harmonic(272400600) > 20); holds(mpmath.harmonic(272400599) < 20)
```
:::

## 积分判别法 {#integral-test}

调和级数发散；那么 $\sum 1/n^2$ 又如何呢？它的部分和也是递增的，因此根据单调收敛定理，问题在于这些和是否保持有界。将和与积分进行比较可以回答这个问题。

在图14.4（左）中，标有$[n - 1, n]$的矩形宽度为1，高度为$1/n^2$，即其右端点的值$1/x^2$。曲线递减，因此该矩形位于曲线下方。将从$n = 2$到$N$的矩形相加，

$$\frac{1}{2^2} + \frac{1}{3^2} + \cdots + \frac{1}{N^2} \le \int_1^N \frac{dx}{x^2} = 1 - \frac1N < 1.$$

所以 $S_N < 2$ 对于每一个 $N$：部分和递增且有上界，并且 $\sum 1/n^2$ 收敛。图 14.4 右侧，位于 $[n, n + 1]$ 上的矩形其高度为 $1/n$，即 $1/x$ 在其左端点的值，因此该矩形位于曲线上方，

$$\begin{aligned} S_N &= 1 + \frac12 + \cdots + \frac1N \\ &\ge \int_1^{N+1}\frac{dx}{x} = \ln(N + 1) \to \infty: \end{aligned}$$

提供了调和级数发散的第二个证明。

::: figure id=fig-14-4
级数与积分。左：标有$y = 1/x^2$的矩形高度为$\tfrac{1}{2^2}, \tfrac{1}{3^2}, \dots, \tfrac{1}{6^2}$，因此$\tfrac{1}{2^2} + \cdots + \tfrac{1}{6^2}$小于从1到6的曲线下面积，该面积小于1。右：标有$y = 1/x$的矩形高度为$1, \tfrac12, \dots, \tfrac15$，因此$1 + \tfrac12 + \cdots + \tfrac15$大于从1到6的曲线下面积，该面积为$\ln 6$。
:::

```check
Np = symbols('N', positive=True)
same(integrate(1/x**2, (x, 1, Np)), 1 - 1/Np); same(integrate(1/x, (x, 1, Np + 1)), log(Np + 1))
for Nn in range(2, 40):
    holds(sum(Rational(1, j**2) for j in range(2, Nn + 1)) <= 1 - Rational(1, Nn)); holds(harmonic(Nn) >= log(Nn + 1))
same(sum(Rational(1, j**2) for j in range(2, 7)) < integrate(1/x**2, (x, 1, 6)), True); same(integrate(1/x**2, (x, 1, 6)), Rational(5, 6))
holds(harmonic(5) > log(6)); same(integrate(1/x, (x, 1, 6)), log(6)); limit_is(log(n + 1), n, oo, oo)
```

::: theorem 积分判别法
设 $f$ 在 $[1, \infty)$ 上连续、正且单调递减，且设 $a_n = f(n)$。则 $\sum_{n=1}^{\infty} a_n$ 与 $\displaystyle\int_1^{\infty} f(x)\,dx$ 均收敛或均发散。更精确地说，对于每一个 $N \ge 1$，

$$\int_1^{N+1} f(x)\,dx \le S_N \le f(1) + \int_1^N f(x)\,dx.$$

同样地，将 $[k, \infty)$ 替换为 $[1, \infty)$，并将级数从 $n = k$ 开始，也成立。
:::

::: proof
设 $n \ge 1$。由于 $f$ 是递减的，对每一个 $x$ ∈ $[n, n + 1]$，有 $f(n + 1) \le f(x) \le f(n)$，因此，根据模块 9 中积分的不等式，

$$f(n + 1) \le \int_n^{n+1} f(x)\,dx \le f(n).$$

将 $n = 1, \dots, N$ 的右边不等式相加得到 $\int_1^{N+1} f(x)\,dx \le a_1 + \cdots + a_N = S_N$。将 $n = 1, \dots, N - 1$ 的左边不等式相加得到 $a_2 + \cdots + a_N \le \int_1^N f(x)\,dx$，这即定理中的右边不等式。

各项为正，故 $(S_N)$ 递增。若 $\int_1^{\infty} f(x)\,dx$ 收敛至 $I$，则 $\int_1^N f(x)\,dx \le I$ 成立，因为 $f$ 为正；于是对任意 $N$ 有 $S_N \le f(1) + I$，由单调收敛定理知级数收敛。若积分发散，则 $\int_1^t f(x)\,dx$ 随 $t$ 递增且无上界（有上界的递增函数必有极限，见[第12.8节](module_12_ZH.html#comparison)），故其无界增长；从而 $S_N \ge \int_1^{N+1} f(x)\,dx \to \infty$ 成立，级数发散。
:::

每个假设都有其作用。连续性使积分存在（模块9），正性使部分和增加。递减性是将矩形放在曲线右侧的原因，没有它，测试可能会给出错误答案。对于 $f(x) = \sin^2(\pi x) + 1/x^2$，它是连续的、正的但不递减的，因此对于每个整数 $n$，都有 $f(n) = 1/n^2$，所以级数收敛；但每个区间 $[n, n + 1]$ 对积分的贡献都大于 $\tfrac12$，因此积分发散。

```check
ni = symbols('n', integer=True)
same(sin(pi*ni)**2 + 1/ni**2, 1/ni**2)
same(integrate(sin(pi*x)**2, (x, ni, ni + 1)), Rational(1, 2))
holds(Rational(1, 2) + integrate(1/x**2, (x, 3, 4)) > Rational(1, 2))
```

### p-级数 {#p-series}

::: theorem p-级数
**$p$ 级数** $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^p}$ 在 $p > 1$ 时收敛，在 $p \le 1$ 时发散。
:::

::: proof
若 $p \le 0$，则 $1/n^p = n^{-p} \ge 1$ 对于每一个 $n \ge 1$ 都成立，因此各项不趋于 0，由发散判别法可知该级数发散。若 $p > 0$，函数 $f(x) = 1/x^p$ 在 $[1, \infty)$ 上连续、正且递减。[定理 12.2](module_12_ZH.html#p-integrals) 表明，当 $p$-积分 $\int_1^{\infty} dx/x^p$ 收敛当且仅当 $p > 1$：对于 $p \ne 1$，

$$\int_1^t \frac{dx}{x^p} = \frac{t^{1-p} - 1}{1 - p},$$

其趋于 $\dfrac{1}{p - 1}$ 若 $p > 1$，趋于 $\infty$ 若 $p < 1$，而对于 $p = 1$ 的积分是 $\ln t \to \infty$。积分判别法完成其余的判断。
:::

```check
pp = symbols('p', positive=True); tp = symbols('t', positive=True)
antideriv(x**(1 - pp)/(1 - pp), 1/x**pp, x); same(((x**(1 - pp) - 1)/(1 - pp)).subs(x, 1), 0)
same(integrate(1/x**2, (x, 1, oo)), 1); same(integrate(1/x**Rational(3, 2), (x, 1, oo)), 2); same(integrate(1/x**Rational(1, 2), (x, 1, oo)), oo)
limit_is((tp**(1 - 3) - 1)/(1 - 3), tp, oo, Rational(1, 2)); limit_is((tp**(1 - Rational(1, 2)) - 1)/(1 - Rational(1, 2)), tp, oo, oo)
holds(Sum(1/n**2, (n, 1, oo)).is_convergent()); holds(not Sum(1/n, (n, 1, oo)).is_convergent()); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
```

$p$-级数是下一部分的基准。对于 $p = 2$，其和是已知的，

$$\sum_{n=1}^{\infty}\frac{1}{n^2} = \frac{\pi^2}{6} \approx 1.644934,$$

但其证明超出了本模块的范围。对于每一个偶数 $p$，都有这样的公式，例如 $\sum 1/n^4 = \pi^4/90$，但对于 $p = 3$ 没有已知的公式；下一子节将展示如何估计该和。

```check
same(summation(1/n**2, (n, 1, oo)), pi**2/6); rounds(pi**2/6, '1.644934'); same(summation(1/n**4, (n, 1, oo)), pi**4/90)
```

::: example 积分判别法在边界上的应用
判断 (a) $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n\ln n}$ 和 (b) $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n(\ln n)^2}$ 是否收敛。

两者都从 $n = 2$ 开始，因为 $\ln 1 = 0$。在 $[2, \infty)$ 上， $x\ln x$ 和 $x(\ln x)^2$ 是正的且递增的（正的递增函数的乘积），因此 $f(x) = \dfrac{1}{x\ln x}$ 和 $g(x) = \dfrac{1}{x(\ln x)^2}$ 在那里是连续的、正的且递减的：积分判别法适用。替换 $u = \ln x$， $du = dx/x$ （模块 10）。

**(a)** 对于 $t > 2$，

$$\begin{aligned} \int_2^t \frac{dx}{x\ln x} &= \int_{\ln 2}^{\ln t}\frac{du}{u} \\ &= \ln(\ln t) - \ln(\ln 2) \to \infty \quad (t \to \infty). \end{aligned}$$

积分发散，因此级数发散。

**(b)** 对于 $t > 2$，

$$\begin{aligned} \int_2^t \frac{dx}{x(\ln x)^2} &= \int_{\ln 2}^{\ln t}\frac{du}{u^2} \\ &= \frac{1}{\ln 2} - \frac{1}{\ln t} \to \frac{1}{\ln 2} \quad (t \to \infty). \end{aligned}$$

积分收敛，因此级数收敛。

(a) 中的级数即使比调和级数收敛得更慢。根据积分判别法（从 $n = 2$ 开始），其项数到 $n = N$ 的和最多为 $\dfrac{1}{2\ln 2} + \ln(\ln N) - \ln(\ln 2)$，因此其部分和在前 $10^{3000}$ 项内仍低于 10。

```check
tq = symbols('t', positive=True); xg = symbols('x', positive=True)
holds(all(diff(f_, xg).subs(xg, v) > 0 for f_ in (xg*log(xg), xg*log(xg)**2) for v in [2, Rational(5, 2), 3, 10, 100]))
same(diff(xg*log(xg), xg), log(xg) + 1); same(diff(xg*log(xg)**2, xg), log(xg)**2 + 2*log(xg))
antideriv(log(log(x)), 1/(x*log(x)), x); antideriv(-1/log(x), 1/(x*log(x)**2), x)
same(integrate(1/u, (u, log(2), log(tq))), log(log(tq)) - log(log(2)))
same(integrate(1/u**2, (u, log(2), log(tq))), 1/log(2) - 1/log(tq))
limit_is(log(log(x)) - log(log(2)), x, oo, oo); limit_is(1/log(2) - 1/log(x), x, oo, 1/log(2))
holds(not Sum(1/(n*log(n)), (n, 2, oo)).is_convergent()); holds(Sum(1/(n*log(n)**2), (n, 2, oo)).is_convergent())
holds((10 - 1/(2*log(2)) + log(log(2)))/log(10) > log(3000, 10) + log(log(10), 10))   # ln ln N >= 8.91 needs N > 10^3000
```
:::

### 估计和 {#remainder}

相同的矩形不仅仅用于决定，它们还限制了部分和的误差。当 $\sum a_n$ 收敛到 $S$ 时，**余项** 在 $N$ 项之后为

$$R_N = S - S_N = a_{N+1} + a_{N+2} + \cdots,$$

被省略项的和。它是近似值 $S \approx S_N$ 的误差：精确值减去近似值，如本课程中其他地方所定义的。

::: theorem 积分判别法的余项估计
在积分判别法的假设下，如果 $\sum a_n$ 收敛，则

$$\int_{N+1}^{\infty} f(x)\,dx \le R_N \le \int_N^{\infty} f(x)\,dx,$$

因此，和 $S$ 满足

$$S_N + \int_{N+1}^{\infty} f(x)\,dx \le S \le S_N + \int_N^{\infty} f(x)\,dx.$$
:::

::: proof
使用上一个证明中关于尾部的不等式 $f(n + 1) \le \int_n^{n+1} f(x)\,dx \le f(n)$。将 $n = N + 1, \dots, M$ 的右边相加得到 $\int_{N+1}^{M+1} f(x)\,dx \le a_{N+1} + \cdots + a_M$；将 $n = N, \dots, M - 1$ 的左边相加得到 $a_{N+1} + \cdots + a_M \le \int_N^M f(x)\,dx$。现在令 $M \to \infty$。中间项为 $S_M - S_N$，其趋于 $R_N$，且极限保持非严格不等式（第14.2节）。
:::

::: example 估计 $\sum 1/n^2$
用前10项估计 $\sum_{n=1}^{\infty} 1/n^2$，并保证误差有界。

部分和为 $S_{10} = 1 + \tfrac14 + \cdots + \tfrac{1}{100} \approx 1.549768$。由于 $f(x) = 1/x^2$， $\int_N^{\infty} dx/x^2 = 1/N$，因此定理给出

$$\begin{aligned} \frac{1}{11} &\le R_{10} \le \frac{1}{10}, \quad\text{so} \\ 1.640677 &\le S \le 1.649768. \end{aligned}$$

部分和的误差大约为 0.1，但区间将 $S$ 确定在 0.01 以内。其中点 $S \approx 1.645222$ 的误差最大不超过区间宽度的一半，约为 0.0045。事实上 $S = \pi^2/6 \approx 1.644934$，所以真实误差 $\pi^2/6$ 减去中点，约为 $-0.000288$：中点略微偏大。

对于高精度来说，差异非常明显。对于误差最大为 $10^{-6}$ 的情况，部分和单独需要大约一百万项，因为其误差 $R_N$ 至少为 $1/(N + 1)$。中点估计的误差最大不超过区间宽度 $\tfrac12\big(\tfrac1N - \tfrac{1}{N + 1}\big) = \dfrac{1}{2N(N + 1)}$ 的一半，即最多为 $10^{-6}$ 一次 $N \ge 707$。

```check
S10 = harmonic(10, 2); same(S10, sum(Rational(1, j**2) for j in range(1, 11))); rounds(S10, '1.549768')
holds(pi**2/6 - S10 > Rational(9, 100)); holds(pi**2/6 - S10 < Rational(1, 10))     # off by almost 0.1
same(integrate(1/x**2, (x, Np, oo)), 1/Np)
rounds(S10 + Rational(1, 11), '1.640677'); rounds(S10 + Rational(1, 10), '1.649768')
holds(S10 + Rational(1, 11) <= pi**2/6); holds(pi**2/6 <= S10 + Rational(1, 10)); holds(Rational(1, 10) - Rational(1, 11) < Rational(1, 100))
mid = S10 + (Rational(1, 11) + Rational(1, 10))/2; rounds(mid, '1.645222'); rounds((Rational(1, 10) - Rational(1, 11))/2, '0.0045')
rounds(pi**2/6 - mid, '-0.000288'); rounds(pi**2/6, '1.644934'); holds(mid > pi**2/6)
steps((1/Np - 1/(Np + 1))/2, 1/(2*Np*(Np + 1)))
holds(Rational(1, 2*707*708) <= Rational(1, 10**6)); holds(Rational(1, 2*706*707) > Rational(1, 10**6))
holds(Rational(1, 10**6 + 1) < Rational(1, 10**6)); holds(Rational(1, 999998 + 1) > Rational(1, 10**6))   # R_N >= 1/(N+1) > 1e-6 for N < 999999
```
:::

### 有多慢？ {#slow}

对于调和级数 $f(x) = 1/x$，积分判别法的不等式说明

$$\ln(N + 1) \le H_N \le 1 + \ln N,$$

其中 $H_N = 1 + \tfrac12 + \cdots + \tfrac1N$ 是第 $N$ 个 **阶调和数**。因此 $H_N$ 增长类似于 $\ln N$，而 $N$ 每增加一个数量级，$\ln 10 \approx 2.303$ 就增加约 $H_N$，如第 14.4 节的表格所示。要超过 100，$1 + \ln N \ge 100$ 需要 $N \ge e^{99} \approx 9.9 \times 10^{42}$，即 $H_N - \ln N$。更精确地说，$\gamma \approx 0.5772$ 会趋近于一个称为 **欧拉常数** 的数；练习 14.11 证明了该极限存在。

```check
for Nn in [1, 2, 5, 10, 100, 1000]:
    holds(log(Nn + 1) <= harmonic(Nn)); holds(harmonic(Nn) <= 1 + log(Nn))
rounds(log(10), '2.303'); rounds(exp(99), '9.9e42'); rounds(EulerGamma, '0.5772')
limit_is(harmonic(n) - log(n), n, oo, EulerGamma)
holds(all(harmonic(j) - log(j) > harmonic(j + 1) - log(j + 1) for j in range(1, 60)))
```

::: compute 如何缓慢地收敛
将调和级数和 $\sum 1/n^2$ 并排相加，与 $\ln N + \gamma$ 和 $\pi^2/6$ 进行比较：

```python
import math
gamma = 0.5772156649015329            # Euler's constant
H = S = 0.0
n = 0
for N in [10, 100, 1000, 10**4, 10**5, 10**6]:
    while n < N:
        n += 1
        H += 1/n                      # the harmonic series
        S += 1/n**2                   # the series of 1/n^2
    L = math.log(N) + gamma
    print(f"N = {N:>7}:  H_N = {H:9.6f}   ln N + gamma = {L:9.6f}"
          f"   pi^2/6 - S_N = {math.pi**2/6 - S:.3e}")
```

```output
N =      10:  H_N =  2.928968   ln N + gamma =  2.879801   pi^2/6 - S_N = 9.517e-02
N =     100:  H_N =  5.187378   ln N + gamma =  5.182386   pi^2/6 - S_N = 9.950e-03
N =    1000:  H_N =  7.485471   ln N + gamma =  7.484971   pi^2/6 - S_N = 9.995e-04
N =   10000:  H_N =  9.787606   ln N + gamma =  9.787556   pi^2/6 - S_N = 1.000e-04
N =  100000:  H_N = 12.090146   ln N + gamma = 12.090141   pi^2/6 - S_N = 1.000e-05
N = 1000000:  H_N = 14.392727   ln N + gamma = 14.392726   pi^2/6 - S_N = 1.000e-06
```

调和数始终接近 $\ln N + \gamma$，越来越接近。第二个级数收敛，但其在 $N$ 项后的误差约为 $1/N$，如余项估计所预测的：每增加一个正确的数字，就需要十倍的项数。调和级数何时超过 10？

```python
H, n = 0.0, 0
while H <= 10:
    n += 1
    H += 1/n
print(n, H)
```

```output
12367 10.000043008275778
```

超过 10 的第一个部分和是第 12,367 项。
:::

```check
for Nn in [10, 100, 1000, 10**4, 10**5, 10**6]:
    holds(Abs(harmonic(Float(Nn, 40)) - log(Nn) - EulerGamma) < Rational(6, 10*Nn))
    rem = pi**2/6 - harmonic(Float(Nn, 40), 2); holds(1/Rational(Nn + 1) < rem); holds(rem < Rational(1, Nn))
```

## 比较判别法 {#comparison}

许多级数不是几何级数、裂项相消级数或 $p$ 级数，但看起来像其中之一： $\dfrac{1}{n^2 + 1}$ 比 $\dfrac{1}{n^2}$ 稍小，且 $\dfrac{1}{2^n - 1}$ 接近 $\dfrac{1}{2^n}$。比较法将你熟悉的级数转化为对未知级数的判断依据。

::: theorem 比较判别法
假设 $0 \le a_n \le b_n$ 对于某个索引之后的所有 $n$ 成立。

- (a) 如果 $\sum b_n$ 收敛，则 $\sum a_n$ 收敛。
- (b) 如果 $\sum a_n$ 发散，则 $\sum b_n$ 发散。
:::

::: proof
根据定理 14.6，首项不影响结果，因此假设 $0 \le a_n \le b_n$ 对于每一个 $n$。设 $A_N$ 和 $B_N$ 分别为两个级数的部分和。两者都递增，因为项非负，且 $A_N \le B_N$。 (a) 如果 $\sum b_n$ 收敛到 $B$，那么 $A_N \le B_N \le B$ 对于每一个 $N$ 都成立，因为递增序列至多等于其极限（定理 14.5）。因此 $(A_N)$ 是递增且有上界的，根据单调收敛定理，它收敛。 (b) 如果 $\sum b_n$ 收敛，那么根据 (a)， $\sum a_n$ 也收敛。
:::

::: example 比较
判断 (a) $\displaystyle\sum_{n=1}^{\infty}\frac{5}{2n^2 + 4n + 3}$ 和 (b) $\displaystyle\sum_{n=1}^{\infty}\frac{\ln n}{n}$ 是否收敛。

**(a)** 对于 $n \ge 1$， $2n^2 + 4n + 3 > 2n^2$，所以

$$0 < \frac{5}{2n^2 + 4n + 3} < \frac{5}{2n^2} = \frac52\cdot\frac{1}{n^2}.$$

$\sum \tfrac52\cdot\tfrac{1}{n^2}$ 收敛 ($p = 2$，且和的性质)，因此根据比较判别法，该级数收敛。

**(b)** 对于 $n \ge 3$， $\ln n > 1$，因为 $3 > e$；因此 $\dfrac{\ln n}{n} > \dfrac1n \ge 0$。调和级数发散，因此根据比较判别法的 (b) 部分，以 $a_n = 1/n$ 和 $b_n = (\ln n)/n$ 从 $n = 3$ 开始，该级数也发散：较小的级数发散，因此较大的级数也发散。

```check
for j in range(1, 200):
    holds(0 < Rational(5, 2*j**2 + 4*j + 3)); holds(Rational(5, 2*j**2 + 4*j + 3) < Rational(5, 2*j**2))
same(Rational(5, 2)/n**2, 5/(2*n**2)); holds(Sum(5/(2*n**2 + 4*n + 3), (n, 1, oo)).is_convergent())
holds(Integer(3) > E); holds(log(3) > 1); holds(all(log(j)/j > Rational(1, j) for j in range(3, 300)))
holds(not Sum(log(n)/n, (n, 1, oo)).is_convergent())
```
:::

::: pitfall
比较方向错误无法证明任何结论。 $\dfrac{1}{n^2} \le \dfrac1n$ 和 $\sum 1/n$ 发散，但这对 $\sum 1/n^2$ 收敛与否没有任何说明。 $\dfrac{1}{2^n - 1} \ge \dfrac{1}{2^n}$ 和 $\sum 1/2^n$ 收敛，但这对 $\sum 1/(2^n - 1)$ 收敛与否也没有任何说明。 用一个收敛级数从上方界一个级数，或用一个发散级数从下方界一个级数。
:::

### 极限比较 {#limit-comparison}

第二个级数的陷阱确实收敛。它的项略大于 $1/2^n$，因此不等式方向错误，但它们与 $1/2^n$ 的比值趋于 1，这已经足够。

::: theorem 极限比较判别法
假设对于所有 $n$， $a_n > 0$ 和 $b_n > 0$ 满足条件，且

$$\lim_{n\to\infty}\frac{a_n}{b_n} = L, \qquad\text{with } 0 < L < \infty.$$

那么 $\sum a_n$ 和 $\sum b_n$ 同时收敛或同时发散。
:::

::: proof
用 $\varepsilon = L/2$ 挑战极限：存在一个 $N$，使得对于所有 $n > N$， $\abs{a_n/b_n - L} < L/2$，即 $\tfrac{L}{2} < \tfrac{a_n}{b_n} < \tfrac{3L}{2}$，因此

$$\frac{L}{2}\,b_n < a_n < \frac{3L}{2}\,b_n.$$

如果 $\sum b_n$ 收敛，那么 $\sum \tfrac{3L}{2}b_n$ 也收敛，右边的不等式和比较判别法表明 $\sum a_n$ 收敛。如果 $\sum b_n$ 发散，那么 $\sum \tfrac{L}{2}b_n$ 也发散，左边的不等式表明 $\sum a_n$ 发散。
:::

选择 $b_n$ 时，只需保留 $a_n$ 分子和分母中最高阶项，如同处理无穷远处的有理函数。

::: example 极限比较
判断以下是否收敛：(a) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{2^n - 1}$，(b) $\displaystyle\sum_{n=1}^{\infty}\frac{2n^2 + 3n}{\sqrt{n^5 + 1}}$，(c) $\displaystyle\sum_{n=1}^{\infty}\sin\frac1n$。

**(a)** 比较于 $b_n = 1/2^n$：

$$\frac{a_n}{b_n} = \frac{2^n}{2^n - 1} = \frac{1}{1 - 2^{-n}} \to 1.$$

$\sum 1/2^n$ 收敛（几何级数 $r = \tfrac12$），因此级数收敛。

**(b)** 主项给出 $\dfrac{2n^2}{\sqrt{n^5}} = \dfrac{2}{n^{1/2}}$，因此比较于 $b_n = 1/\sqrt n$。将分子和分母都除以 $n^{5/2} = n^2\sqrt n$：

$$\frac{a_n}{b_n} = \frac{(2n^2 + 3n)\sqrt n}{\sqrt{n^5 + 1}} = \frac{2 + 3/n}{\sqrt{1 + 1/n^5}} \to 2.$$

$\sum 1/\sqrt n$ 发散（$p = \tfrac12$），因此级数发散。

**(c)** 对于 $n \ge 1$, $0 < 1/n \le 1 < \pi$, 所以 $\sin(1/n) > 0$. 与 $b_n = 1/n$ 比较: $\dfrac{\sin(1/n)}{1/n} \to 1$, 根据定理 2.5 ($\sin\theta/\theta \to 1$ 作为 $\theta \to 0$, 此处为 $\theta = 1/n$, 通过定理 14.4). 调和级数发散, 所以 $\sum \sin(1/n)$ 发散.

```check
same(2**n/(2**n - 1), 1/(1 - 2**(-n))); limit_is(2**n/(2**n - 1), n, oo, 1); holds(all(Integer(2)**j - 1 > 0 for j in range(1, 50)))
npp = symbols('n', positive=True)
same((2*npp**2 + 3*npp)*sqrt(npp)/sqrt(npp**5 + 1), (2 + 3/npp)/sqrt(1 + 1/npp**5)); same(2*npp**2/sqrt(npp**5), 2/sqrt(npp))
limit_is(((2*n**2 + 3*n)/sqrt(n**5 + 1))/(1/sqrt(n)), n, oo, 2)
holds(all(sin(Rational(1, j)) > 0 for j in range(1, 100))); limit_is(sin(1/n)/(1/n), n, oo, 1); limit_is(sin(x)/x, x, 0, 1)
holds(not Sum(sin(1/n), (n, 1, oo)).is_convergent())
```
:::

::: pitfall
该测试需要 $0 < L < \infty$. 用 $L = 0$ 或 $L = \infty$ 时, 仅在一个方向有效. 如果 $a_n/b_n \to 0$, 则从某个索引开始 $a_n < b_n$, 所以 $\sum a_n$ 收敛当 $\sum b_n$ 收敛, 但 $\sum b_n$ 发散时则无结论; 如果 $a_n/b_n \to \infty$, 则相反. 例如 $\dfrac{\ln n}{n^2}$ 与 $\dfrac{1}{n^2}$ 比较得到 $L = \infty$ 而无结论, 但与 $\dfrac{1}{n^{3/2}}$ 比较得到 $\dfrac{\ln n}{\sqrt n} \to 0$ 且 $\sum 1/n^{3/2}$ 收敛, 所以 $\sum (\ln n)/n^2$ 收敛.

```check
limit_is((log(n)/n**2)/(1/n**2), n, oo, oo); same((log(npp)/npp**2)/(1/npp**Rational(3, 2)), log(npp)/sqrt(npp))
limit_is(log(n)/sqrt(n), n, oo, 0); holds(Sum(1/n**Rational(3, 2), (n, 1, oo)).is_convergent()); holds(Sum(log(n)/n**2, (n, 1, oo)).is_convergent())
```
:::

## 交错级数 {#alternating}

一个项符号交替变化的级数, 即使其项的绝对值之和为无穷大, 也可能收敛. 标准例子是 **交替调和级数**.

$$\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{n} = 1 - \frac12 + \frac13 - \frac14 + \frac15 - \cdots$$

其部分和上下波动： $S_1 = 1$, $S_2 = 0.5$, $S_3 \approx 0.833$, $S_4 \approx 0.583$，如此类推。每一步都与前一步方向相反，且幅度更小，因此部分和在越来越窄的范围内来回摆动（图14.5）。表格将它们与总和进行比较，总和为 $\ln 2 \approx 0.693147$：

```valuetable
N = 1, 2, 3, 4, 5, 6
$S_N$ = harmonic(N) - harmonic(floor(N/2))
$\abs{\ln 2 - S_N}$ = Abs(log(2) - harmonic(N) + harmonic(floor(N/2)))
$\dfrac{1}{N + 1}$ = 1/(N + 1)
digits = 6
---
N | S_N | \abs{\ln 2 - S_N} | \dfrac{1}{N + 1}
1 | 1 | 0.306853 | 0.5
2 | 0.5 | 0.193147 | 0.333333
3 | 0.833333 | 0.140186 | 0.25
4 | 0.583333 | 0.109814 | 0.2
5 | 0.783333 | 0.0901862 | 0.166667
6 | 0.616667 | 0.0764805 | 0.142857
```

误差$\ln 2 - S_N$在每一步都会改变符号，其大小始终小于被省略的第一个项$\tfrac{1}{N + 1}$（实际上约为它的二分之一）。下一个定理将证明这一性质适用于所有此类级数。

```check
altS = lambda Nn: sum(Rational((-1)**(j - 1), j) for j in range(1, Nn + 1))
for Nn in range(1, 40):
    same(altS(Nn), harmonic(Nn) - harmonic(floor(Rational(Nn, 2))))
    holds(Abs(log(2) - altS(Nn)) < Rational(1, Nn + 1)); holds((log(2) - altS(Nn))*(log(2) - altS(Nn + 1)) < 0)
same([altS(1), altS(2)], [1, Rational(1, 2)]); rounds(altS(3), '0.833'); rounds(altS(4), '0.583'); rounds(log(2), '0.693147')
holds(all(Rational(4, 10) < Abs(log(2) - altS(Nn))*(Nn + 1) < Rational(65, 100) for Nn in range(1, 200)))   # about half the bound
```

::: figure id=fig-14-5
交错调和级数$1 - \tfrac12 + \tfrac13 - \cdots$的部分和。奇数项（$S_1, S_3, S_5, \dots$，蓝色）递减，偶数项（$S_2, S_4, S_6, \dots$，橙色）递增，且每个奇数项都在所有偶数项之上。两者都趋近于总和$\ln 2$（虚线），该总和介于任意两个连续的部分和之间。
:::

::: theorem 交错级数判别法
设 $b_n > 0$，对每个 $n$ 都有 $b_{n+1} \le b_n$，且 $b_n \to 0$。那么**交错级数**

$$\sum_{n=1}^{\infty}(-1)^{n-1}b_n = b_1 - b_2 + b_3 - b_4 + \cdots$$

收敛。其和$S$介于任意两个连续的部分和之间，因此

$$\abs{S - S_N} \le b_{N+1}:$$

部分和 $S_N$ 的误差 $S - S_N$ 的大小不超过被省略的第一个项，且介于 0 与该项之间 $(-1)^N b_{N+1}$。同样的性质也适用于符号相反的级数，或从另一个索引开始的级数。如果 $b_n$ 从某个索引之后开始递减，则级数仍然收敛（定理 14.6），并且从该索引之后的部分和的误差界仍然成立。
:::

::: proof
*偶数次部分和递增且有上界。* $S_{2m+2} = S_{2m} + (b_{2m+1} - b_{2m+2}) \ge S_{2m}$，因为 $b_{2m+2} \le b_{2m+1}$。以不同的方式分组项，

$$\begin{aligned} S_{2m} &= b_1 - (b_2 - b_3) - (b_4 - b_5) - \cdots \\ &\qquad - (b_{2m-2} - b_{2m-1}) - b_{2m} \le b_1, \end{aligned}$$

因为每个括号内的量和 $b_{2m}$ 都非负。由单调收敛定理可知，存在实数 $S$，使 $S_{2m} \to S$，且对每个 $m$ 都有 $S_{2m} \le S$。

*奇数次部分和趋向于同一个极限。* $S_{2m+1} = S_{2m-1} - (b_{2m} - b_{2m+1}) \le S_{2m-1}$，且 $S_{2m+1} = S_{2m} + b_{2m+1} \to S + 0 = S$。一个递减序列至少等于其极限，因此 $S \le S_{2m+1}$ 对于每个 $m$ 成立。

*所以$S_N \to S$成立。* 给定$\varepsilon > 0$，从某个索引开始，偶数项部分和位于$\varepsilon$与$S$之间，奇数项部分和从另一个索引开始也如此；取这两个索引中较大的一个之后，所有项均满足此条件。最后，$S_{2m} \le S \le S_{2m+1}$和$S_{2m} \le S \le S_{2m-1}$表明：对于每个$N$，$S$都位于$S_N$和$S_{N+1}$之间。因此$\abs{S - S_N} \le \abs{S_{N+1} - S_N} = b_{N+1}$成立，且$S - S_N$位于0和$S_{N+1} - S_N = (-1)^N b_{N+1}$之间。
:::

```check
bsym = symbols('b1:8', positive=True)
Sp = lambda m: sum((-1)**(j)*bsym[j] for j in range(m))        # S_m = b_1 - b_2 + ... (m terms)
same(Sp(4) - Sp(2), bsym[2] - bsym[3]); same(Sp(5) - Sp(3), -(bsym[3] - bsym[4]))
same(Sp(6), bsym[0] - (bsym[1] - bsym[2]) - (bsym[3] - bsym[4]) - bsym[5]); same(Sp(5) - Sp(4), bsym[4])
```

交错调和级数满足假设，因为$b_n = 1/n$为正、递减且趋于0：它收敛。其和为$\ln 2$，此处陈述并在模块15中利用$\ln(1 + x)$的幂级数证明（练习14.11给出了另一个证明）。误差界显示了其收敛速度之慢：为确保由界$\tfrac{1}{N + 1}$给出的误差不超过0.001，你需要$N = 999$项。它收敛，但并非因为其项很小：它们的量级$1/n$加起来趋于无穷。正负项之间的抵消起到了作用。第14.8节命名了这种收敛性。

```check
same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2)); holds(Rational(1, 999 + 1) <= Rational(1, 1000)); holds(Rational(1, 998 + 1) > Rational(1, 1000))
```

::: example 交错级数的估计
估计 $\displaystyle\sum_{n=0}^{\infty}\frac{(-1)^n}{n!} = 1 - 1 + \frac{1}{2!} - \frac{1}{3!} + \cdots$ 的和，误差不超过 0.001。

这里 $b_n = 1/n!$ 对于 $n \ge 0$。这些数是正的；它们递减，因为 $b_{n+1} = \dfrac{b_n}{n + 1} \le b_n$；并且它们趋于 0，因为 $n! \ge n$，因此 $0 < 1/n! \le 1/n$ 对于 $n \ge 1$。该判别法从 $n = 0$ 开始适用。

被省略的第一个项的大小不得超过 0.001。由于 $\tfrac{1}{6!} = \tfrac{1}{720} \approx 0.00139$ 太大，而 $\tfrac{1}{7!} = \tfrac{1}{5040} \approx 0.000198$ 足够小，因此将项加到 $n = 6$：

$$\begin{aligned} S_7 &= 1 - 1 + \frac12 - \frac16 + \frac{1}{24} \\ &\qquad - \frac{1}{120} + \frac{1}{720} \\ &= \frac{53}{144} \approx 0.368056. \end{aligned}$$

误差 $S - S_7$ 的大小不超过 $\tfrac{1}{5040} \approx 0.000198$，并且它介于 0 和被省略的第一个项 $-\tfrac{1}{5040}$ 之间，因此和略小于 $S_7$：

$$0.367857 \le S \le 0.368056.$$

模块 15 表明，和为 $1/e \approx 0.367879$，位于该区间内。

```check
bf = lambda j: 1/factorial(j)
holds(all(bf(j + 1) == bf(j)/(j + 1) for j in range(0, 30))); holds(all(bf(j) <= Rational(1, j) for j in range(1, 30)))
rounds(Rational(1, 720), '0.00139'); rounds(Rational(1, 5040), '0.000198'); holds(Rational(1, 720) > Rational(1, 1000)); holds(Rational(1, 5040) <= Rational(1, 1000))
S7e = sum(Integer(-1)**j/factorial(j) for j in range(0, 7)); same(S7e, Rational(53, 144)); rounds(S7e, '0.368056')
rounds(S7e - Rational(1, 5040), '0.367857'); holds(S7e - Rational(1, 5040) <= exp(-1)); holds(exp(-1) <= S7e)
same(summation((-1)**n/factorial(n), (n, 0, oo)), exp(-1)); rounds(exp(-1), '0.367879')
```
:::

::: pitfall
所有三个假设都重要，而“递减”是常被遗忘的那个。级数

$$1 - 1 + \frac12 - \frac14 + \frac13 - \frac19 + \frac14 - \frac{1}{16} + \cdots,$$

项依次为 $\tfrac1k$ 和 $-\tfrac{1}{k^2}$，符号交替变化，且其项趋于 0，但其绝对值并不单调递减。其在 $2K$ 项后的部分和为 $\big(1 + \tfrac12 + \cdots + \tfrac1K\big) - \big(1 + \tfrac14 + \cdots + \tfrac{1}{K^2}\big)$，它大于 $H_K - 2$，因此趋于无穷大：级数发散。

```check
blk2 = lambda K: sum(Rational(1, kk) - Rational(1, kk**2) for kk in range(1, K + 1))
holds(all(blk2(K) > harmonic(K) - 2 for K in range(1, 200))); holds(all(harmonic(K, 2) < 2 for K in range(1, 300)))
holds(Rational(1, 4) < Rational(1, 3))                 # the sizes 1/4, 1/3 are not decreasing
limit_is(harmonic(n) - 2, n, oo, oo)
```
:::

## 绝对收敛与比值审敛法和根值审敛法 {#absolute}

一些级数的项既有正号也有负号，但并不交替，例如

$$\sum_{n=1}^{\infty}\frac{\sin n}{n^2} = \frac{\sin 1}{1} + \frac{\sin 2}{4} + \frac{\sin 3}{9} + \cdots,$$

其项从三个正项开始（因为 $1$、$2$ 和 $3$ 介于 0 和 $\pi$ 之间），然后是三个负项（因为 $4$、$5$ 和 $6$ 介于 $\pi$ 和 $2\pi$ 之间）。交错级数判别法不适用。但项的绝对值最大为 $1/n^2$，这就决定了结果。

```check
same([sign(sin(j)) for j in range(1, 8)], [1, 1, 1, -1, -1, -1, 1]); holds(Integer(3) < pi); holds(pi < 4); holds(Integer(6) < 2*pi); holds(2*pi < 7)
```

::: definition 绝对收敛与条件收敛
若级数 $\sum a_n$ **绝对收敛**，则 $\sum \abs{a_n}$ 收敛。若 **条件收敛**，则 $\sum a_n$ 收敛但 $\sum \abs{a_n}$ 发散。
:::

::: theorem 绝对收敛蕴含收敛
如果 $\sum \abs{a_n}$ 收敛，则 $\sum a_n$ 收敛，且 $\abs{\sum a_n} \le \sum \abs{a_n}$。
:::

::: proof
对每个 $n$ 都有 $0 \le a_n + \abs{a_n} \le 2\abs{a_n}$，其中间一项在 $a_n < 0$ 时为 0，在 $a_n \ge 0$ 时为 $2a_n$。因为级数 $\sum 2\abs{a_n}$ 收敛，由比较判别法，$\sum (a_n + \abs{a_n})$ 收敛，再由级数的加法性质，$\sum a_n = \sum (a_n + \abs{a_n}) - \sum \abs{a_n}$ 收敛。对于不等式，[模块 2](module_02_ZH.html#no-limit-proof) 的三角不等式表明对每个 $N$ 都有 $-\sum\abs{a_n} \le S_N \le \sum\abs{a_n}$，取极限后不等式仍成立。
:::

```check
ar_ = symbols('a', real=True)
for v in (-3, Rational(-1, 2), 0, Rational(2, 7), 5):
    holds(0 <= v + Abs(v)); holds(v + Abs(v) <= 2*Abs(v))
same((ar_ + Abs(ar_)).subs(ar_, -2), 0); same((ar_ + Abs(ar_)).subs(ar_, 3), 6)
```

::: example 绝对收敛还是条件收敛？
判断这些级数如何收敛：(a) $\displaystyle\sum_{n=1}^{\infty}\frac{\sin n}{n^2}$，(b) $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{n^2}$，(c) $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{\sqrt n}$。

**(a) ** $\abs{\dfrac{\sin n}{n^2}} \le \dfrac{1}{n^2}$，由于 $\abs{\sin n} \le 1$，且 $\sum 1/n^2$ 收敛。根据比较判别法，级数 $\sum \abs{\sin n}/n^2$ 收敛：级数绝对收敛。

**(b) ** $\sum \abs{a_n} = \sum 1/n^2$ 收敛：绝对收敛。

**(c)** 级数 $\sum \abs{a_n} = \sum 1/\sqrt n$ 发散（$p = \tfrac12$）。但 $b_n = 1/\sqrt n$ 为正、递减且趋于 0，由交错级数判别法，原级数收敛，因此它条件收敛。交错调和级数条件收敛的理由相同。

```check
holds(all(Abs(sin(j))/j**2 <= Rational(1, j**2) for j in range(1, 300))); holds(Sum(1/n**2, (n, 1, oo)).is_convergent())
same(summation(1/n**2, (n, 1, oo)), pi**2/6); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
holds(all(1/sqrt(j + 1) < 1/sqrt(j) for j in range(1, 300))); limit_is(1/sqrt(n), n, oo, 0)
holds(Sum((-1)**(n - 1)/sqrt(n), (n, 1, oo)).is_convergent())
```
:::

### 重排 {#rearrangements}

有限和无论以什么顺序相加，结果都相同。绝对收敛的级数也是如此：任何**重排**，即项的顺序改变后，仍收敛于相同和（分析课程中有证明）。条件收敛的级数则不同。取交错调和级数的项按以下顺序排列：一个正项，接着两个负项，

$$1 - \frac12 - \frac14 + \frac13 - \frac16 - \frac18 + \frac15 - \frac{1}{10} - \frac{1}{12} + \cdots$$

每个术语恰好出现一次：第 $k$ 组是 $\tfrac{1}{2k - 1} - \tfrac{1}{4k - 2} - \tfrac{1}{4k}$，各组之间每个奇数分母出现一次，每个偶数分母也出现一次。在每一组中，前两个项相加，$\tfrac{1}{2k - 1} - \tfrac{1}{4k - 2} = \tfrac{1}{4k - 2}$，因此前 $3K$ 项的和为

$$\begin{aligned} &\sum_{k=1}^{K}\Big(\frac{1}{4k - 2} - \frac{1}{4k}\Big) \\ &\quad= \frac12\sum_{k=1}^{K}\Big(\frac{1}{2k - 1} - \frac{1}{2k}\Big) = \frac12 S_{2K}, \end{aligned}$$

这是交错调和级数某个部分和的一半，趋于 $\tfrac12\ln 2$。取 $3K + 1$ 项或 $3K + 2$ 项的部分和与它的差的绝对值至多为 $\tfrac{1}{2K + 1}$，这也趋于 0。因此重排的级数收敛到 $\tfrac12 \ln 2$。各项完全相同，和却只有原来的一半。

```check
kk_ = symbols('k', positive=True, integer=True)
same(1/(2*kk_ - 1) - 1/(4*kk_ - 2), 1/(4*kk_ - 2)); same(1/(4*kk_ - 2) - 1/(4*kk_), (1/(2*kk_ - 1) - 1/(2*kk_))/2)
rearr = lambda K: sum(Rational(1, 2*k_ - 1) - Rational(1, 4*k_ - 2) - Rational(1, 4*k_) for k_ in range(1, K + 1))
terms_r = []                                                 # the rearranged series, term by term
for k_ in range(1, 41):
    terms_r += [Rational(1, 2*k_ - 1), -Rational(1, 4*k_ - 2), -Rational(1, 4*k_)]
T_ = [sum(terms_r[:m_]) for m_ in range(0, len(terms_r) + 1)]  # T_[m] = the sum of the first m terms
for K in range(1, 30):
    same(rearr(K), altS(2*K)/2); same(T_[3*K], altS(2*K)/2)
    holds(Abs(T_[3*K + 1] - T_[3*K]) <= Rational(1, 2*K + 1)); holds(Abs(T_[3*K + 2] - T_[3*K]) <= Rational(1, 2*K + 1))
dens = sorted([2*k_ - 1 for k_ in range(1, 51)] + [4*k_ - 2 for k_ in range(1, 51)] + [4*k_ for k_ in range(1, 51)])
same(dens[:100], list(range(1, 101)))                       # every denominator once (up to 100)
rounds(log(2)/2, '0.3466')
```

::: deeper 黎曼重排定理
初读时可跳过此框。这个例子并非偶然。 **黎曼重排定理** 表示，如果 $\sum a_n$ 条件收敛，则对于每一个数 $T$，存在一种重排使其收敛于 $T$，而其他重排则发散至 $\infty$ 或 $-\infty$。

证明的思路如下。设 $p_1, p_2, \dots$ 为正项，按原顺序排列，$q_1, q_2, \dots$ 为负项的绝对值。$\sum p_k$ 和 $\sum q_k$ 都发散。如果两者都收敛，$\sum \abs{a_n}$ 将收敛；如果其中一个收敛而另一个发散，则 $\sum a_n$ 的部分和将趋于 $\infty$ 或 $-\infty$。而 $p_k \to 0$ 和 $q_k \to 0$，因为 $a_n \to 0$。现在取正项直到总和首次超过 $T$，然后取负项直到总和首次低于 $T$，接着取正项直到总和再次超过 $T$，依此类推。每个阶段结束后仅使用有限项，因为未使用的 $p$ 或 $q$ 仍相加为无穷大，且每个项最终都会被使用。每次总和跨过 $T$ 时，最多超出最后一个添加的项，而这些项趋于 0，因此部分和逐渐逼近 $T$。对于 $\infty$ 的和，取正项直到总和超过 1，然后取一个负项，接着取正项直到总和超过 2，取一个负项，依此类推。

计算机即使在有限和中也会遇到这种效应的类似情况。浮点数加法会四舍五入每个结果，因此以不同的顺序相加相同的数可能会得到不同的答案：在 Python 中，`0.1 + 0.2 + 0.3` 给出 `0.6000000000000001`，而 `0.3 + 0.2 + 0.1` 给出 `0.6`。
:::

```check
holds(0.1 + 0.2 + 0.3 == 0.6000000000000001); holds(0.3 + 0.2 + 0.1 == 0.6)
```

### 比值判别法 {#ratio}

比较需要一个级数作为参照。对于由阶乘和幂构成的项，例如 $n!/n^n$ 或 $n^3/3^n$，合适的比较级数是几何级数，而连续项的比值显示出其特性。[小节 3.8](module_03_ZH.html#growth)] 中的“深入一步”部分使用了这一思想来证明 $n^p/a^n \to 0$。

::: theorem 比值判别法
假设对每个 $n$ 都有 $a_n \ne 0$，且

$$\lim_{n\to\infty}\abs{\frac{a_{n+1}}{a_n}} = \rho,$$

其中 $\rho$，希腊字母 rho，是一个数或 $\infty$。

- 如果 $\rho < 1$，级数 $\sum a_n$ 绝对收敛。
- 如果 $\rho > 1$ 或 $\rho = \infty$，级数发散。
- 如果 $\rho = 1$，该判别法无法得出结论。
:::

::: proof
假设 $\rho < 1$，并选择一个数 $r$ 满足 $\rho < r < 1$，例如 $r = \tfrac12(\rho + 1)$。由于比值趋于 $\rho$，存在一个指标 $k$，使得对于每一个 $n \ge k$，都有 $\abs{a_{n+1}} \le r\abs{a_n}$。然后 $\abs{a_{k+1}} \le r\abs{a_k}$， $\abs{a_{k+2}} \le r^2\abs{a_k}$，并且一般地 $\abs{a_{k+j}} \le \abs{a_k}r^j$。几何级数 $\sum_j \abs{a_k}r^j$ 收敛，因为 $0 < r < 1$，因此 $\sum \abs{a_n}$ 收敛，根据比较判别法。

假设 $\rho > 1$ 或 $\rho = \infty$。那么存在一个指标 $k$，使得对于每一个 $n \ge k$，都有 $\abs{a_{n+1}} > \abs{a_n}$，因此从 $a_k$ 开始，各项的大小增加，并且至少保持 $\abs{a_k} > 0$。各项不趋于 0，因此级数根据发散性判别法发散。

对于 $\rho = 1$，这里有两个级数，一个收敛，一个发散，它们都具有 $\rho = 1$。对于 $\sum 1/n$，比值是 $\dfrac{n}{n + 1} \to 1$；对于 $\sum 1/n^2$，比值是 $\dfrac{n^2}{(n + 1)^2} \to 1$。
:::

```check
rho_ = symbols('rho', nonnegative=True)
holds(((rho_ + 1)/2 - rho_).subs(rho_, Rational(1, 3)) > 0); same((rho_ + 1)/2 - rho_, (1 - rho_)/2)
limit_is((1/(n + 1))/(1/n), n, oo, 1); limit_is((1/(n + 1)**2)/(1/n**2), n, oo, 1)
same((1/(n + 1))/(1/n), n/(n + 1)); same((1/(n + 1)**2)/(1/n**2), n**2/(n + 1)**2)
```

比值审敛法适用于阶乘和指数函数。对于 $\sum 1/n!$，比值为 $\dfrac{n!}{(n + 1)!} = \dfrac{1}{n + 1} \to 0$，因此级数收敛；模块 15 显示 $\sum_{n=0}^{\infty} 1/n! = e$。该测试对 $p$-级数和由 $n$ 的幂次构成的项无效，这些项总是给出 $\rho = 1$：对这些情况使用比较审敛法。

```check
same(factorial(n)/factorial(n + 1), 1/(n + 1)); limit_is(1/(n + 1), n, oo, 0); same(summation(1/factorial(n), (n, 0, oo)), E)
```

::: example 比值判别法
判断以下是否收敛：(a) $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$，(b) $\displaystyle\sum_{n=1}^{\infty}\frac{n!}{n^n}$，(c) $\displaystyle\sum_{n=1}^{\infty}\frac{3^n}{n^2}$。

**(a)** 连续项的比值是

$$\begin{aligned} \abs{\frac{a_{n+1}}{a_n}} &= \frac{n + 1}{2^{n+1}}\cdot\frac{2^n}{n} = \frac{n + 1}{2n} \\ &= \frac12\Big(1 + \frac1n\Big) \to \frac12 < 1. \end{aligned}$$

级数收敛（SymPy 计算出其和为 2）。

**(b)** 使用 $(n + 1)! = (n + 1)\,n!$：

$$\begin{aligned} \abs{\frac{a_{n+1}}{a_n}} &= \frac{(n + 1)!}{(n + 1)^{n+1}}\cdot\frac{n^n}{n!} = \frac{(n + 1)\,n^n}{(n + 1)^{n+1}} \\ &= \Big(\frac{n}{n + 1}\Big)^n = \frac{1}{(1 + 1/n)^n} \to \frac1e. \end{aligned}$$

由于 $\tfrac1e < 1$，级数收敛。

**(c)** 连续项的比值是

$$\abs{\frac{a_{n+1}}{a_n}} = \frac{3^{n+1}}{(n + 1)^2}\cdot\frac{n^2}{3^n} = \frac{3}{(1 + 1/n)^2} \to 3 > 1.$$

级数发散；事实上其项无界增长。

```check
steps((n + 1)/2**(n + 1)*(2**n/n), (n + 1)/(2*n), (1 + 1/n)/2); limit_is((n + 1)/(2*n), n, oo, Rational(1, 2)); same(summation(n/2**n, (n, 1, oo)), 2)
same(factorial(n + 1), (n + 1)*factorial(n))
steps(factorial(npp + 1)/(npp + 1)**(npp + 1)*(npp**npp/factorial(npp)), (npp + 1)*npp**npp/(npp + 1)**(npp + 1), (npp/(npp + 1))**npp)
same((npp/(npp + 1))**npp, 1/(1 + 1/npp)**npp); limit_is((n/(n + 1))**n, n, oo, 1/E); holds(1/E < 1)
steps(3**(n + 1)/(n + 1)**2*(n**2/3**n), 3*n**2/(n + 1)**2, 3/(1 + 1/n)**2); limit_is(3/(1 + 1/n)**2, n, oo, 3); limit_is(3**n/n**2, n, oo, oo)
```
:::

::: pitfall
比值审敛法需要比值的极限；比值小于 1 并不足以保证收敛。对于调和级数， $\dfrac{a_{n+1}}{a_n} = \dfrac{n}{n + 1} < 1$ 对于每个 $n$ 都成立，但级数却发散：比值逐渐趋近于 1，且没有固定的 $r < 1$ 来限制它们。并且 $\rho = 1$ 表示“无法判断”，而不是“发散”： $\sum 1/n^2$ 有 $\rho = 1$ 且收敛。

```check
holds(all(Rational(j, j + 1) < 1 for j in range(1, 500))); limit_is(n/(n + 1), n, oo, 1)
```
:::

### 根值判别法 {#root}

对于形如 $n$ 次幂的项，例如 $\big(\tfrac{n}{2n + 1}\big)^n$，取 $n$ 次根可以消除幂次。

::: theorem 根值判别法
假设 $\displaystyle\lim_{n\to\infty}\abs{a_n}^{1/n} = \rho$ 是一个数或 $\infty$。如果 $\rho < 1$，则级数 $\sum a_n$ 绝对收敛；如果 $\rho > 1$ 或 $\rho = \infty$，它发散；如果 $\rho = 1$，该测试无法得出结论。
:::

::: proof
若$\rho < 1$，则选$r$使$\rho < r < 1$成立。从某指标起，$\abs{a_n}^{1/n} < r$，即$\abs{a_n} < r^n$，且$\sum r^n$收敛：比较。若$\rho > 1$或$\rho = \infty$，则从某指标起$\abs{a_n}^{1/n} > 1$，故$\abs{a_n} > 1$，且项不趋于0。对$\rho = 1$：$\sum 1/n$与$\sum 1/n^2$均有$\rho = 1$，因$n^{1/n} \to 1$（例14.3），故$(1/n)^{1/n} = 1/n^{1/n} \to 1$与$(1/n^2)^{1/n} = 1/\big(n^{1/n}\big)^2 \to 1$。
:::

例如，对于 $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{n}{2n + 1}\Big)^n$， $\abs{a_n}^{1/n} = \dfrac{n}{2n + 1} = \dfrac{1}{2 + 1/n} \to \dfrac12 < 1$：该级数收敛。

```check
same(((npp/(2*npp + 1))**npp)**(1/npp), npp/(2*npp + 1)); same(npp/(2*npp + 1), 1/(2 + 1/npp)); limit_is(n/(2*n + 1), n, oo, Rational(1, 2))
same((1/npp)**(1/npp), 1/npp**(1/npp)); same((1/npp**2)**(1/npp), 1/(npp**(1/npp))**2); limit_is((1/n)**(1/n), n, oo, 1); limit_is((1/n**2)**(1/n), n, oo, 1)
```

## 级数测试策略 {#strategy}

没有一个测试可以决定所有级数，且一个其假设不成立的测试无法提供任何信息。面对一个级数 $\sum a_n$，按以下顺序提出这些问题：

1. **项是否趋于 0？** 如果不是，级数发散（发散判别法）。如果是，继续：这还不能证明什么。
2. **这是一个你熟悉的级数吗？** 几何级数 $\sum ar^n$ 在 $\abs{r} < 1$ 时收敛，而 $p$ 级数 $\sum 1/n^p$ 在 $p > 1$ 时收敛。它是裂项相消级数吗？
3. **由 $n$** 构造的正项，如有理函数和根式：通常通过与 $p$ 级数（由主导项给出）的极限比较来比较。
4. **阶乘，或指数形式如 $2^n$**：使用比值判别法。 **整个表达式提升至 $n$** 次幂：使用根值判别法。
5. **项$f(n)$带有$f$，你可以对其积分**，例如$\dfrac{1}{n\ln n}$：积分判别法，在验证$f$连续、正值且递减之后。
6. **符号交替的项**：首先使用 $\sum \abs{a_n}$ 判别法（步骤 2 到 5）。如果收敛，则级数绝对收敛；如果不收敛，尝试交替级数判别法，可能显示条件收敛。
7. **其他混合符号**: 测试 $\sum \abs{a_n}$.

假设只需从某个索引开始成立，因为前几项不会决定收敛性（定理 14.6）。第 14.5 节和第 14.7 节中的误差界，然后适用于从该索引开始的部分和。

::: example 选择一个测试
判断每个级数是否收敛，并说明使用了哪种测试。

- (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n^2 + 1}{3n^2 - n}$
- (b) $\displaystyle\sum_{n=1}^{\infty}\frac{3n + 1}{n^3 + 2}$
- (c) $\displaystyle\sum_{n=1}^{\infty}\frac{n^3}{3^n}$
- (d) $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n\,n}{n^2 + 1}$
- (e) $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{2n}{3n + 1}\Big)^n$
- (f) $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n\sqrt{\ln n}}$

**(a)** 步骤 1: $\dfrac{n^2 + 1}{3n^2 - n} = \dfrac{1 + 1/n^2}{3 - 1/n} \to \dfrac13 \ne 0$. 该级数根据发散性判别法发散。

**(b)** 第3步。首项给出$\dfrac{3n}{n^3} = \dfrac{3}{n^2}$，因此与$\dfrac{1}{n^2}$比较：$\dfrac{a_n}{1/n^2} = \dfrac{3n^3 + n^2}{n^3 + 2} = \dfrac{3 + 1/n}{1 + 2/n^3} \to 3$。该级数通过与$p = 2$的$p$-级数进行极限比较判别法而收敛。

**(c)** 步骤 4，指数项: $\abs{\dfrac{a_{n+1}}{a_n}} = \dfrac{(n + 1)^3}{3^{n+1}}\cdot\dfrac{3^n}{n^3} = \dfrac13\Big(1 + \dfrac1n\Big)^3 \to \dfrac13 < 1$. 该级数根据比值判别法收敛。

**(d)** 第6步。 $\abs{a_n} = \dfrac{n}{n^2 + 1}$, 和 $\dfrac{n/(n^2 + 1)}{1/n} = \dfrac{n^2}{n^2 + 1} \to 1$, 所以 $\sum \abs{a_n}$ 通过与调和级数的极限比较发散：无绝对收敛。现在使用交错级数判别法，其中 $b_n = \dfrac{n}{n^2 + 1}$ 是正的且趋于0。它递减： $b_{n+1} \le b_n$ 表示 $(n + 1)(n^2 + 1) \le n\big((n + 1)^2 + 1\big)$，即 $n^3 + n^2 + n + 1 \le n^3 + 2n^2 + 2n$，即 $1 \le n^2 + n$，这在 $n \ge 1$ 时成立。因此级数条件收敛。(其符号从负号开始， $-b_1 + b_2 - \cdots$；定理14.15允许所有符号反转。)

**(e)** 第4步，一个 $n$ 次幂： $\abs{a_n}^{1/n} = \dfrac{2n}{3n + 1} \to \dfrac23 < 1$。通过根值判别法收敛。

**(f)** 第5步。 $f(x) = \dfrac{1}{x\sqrt{\ln x}}$ 是连续的、正的且在 $[2, \infty)$ 上递减，因为 $x\sqrt{\ln x}$ 在那里是正的且递增。结合 $u = \ln x$，

$$\begin{aligned} \int_2^t\frac{dx}{x\sqrt{\ln x}} &= \int_{\ln 2}^{\ln t}\frac{du}{\sqrt u} \\ &= 2\sqrt{\ln t} - 2\sqrt{\ln 2} \to \infty, \end{aligned}$$

所以通过积分判别法，级数发散。

```check
same((n**2 + 1)/(3*n**2 - n), (1 + 1/n**2)/(3 - 1/n)); limit_is((n**2 + 1)/(3*n**2 - n), n, oo, Rational(1, 3))
same(((3*n + 1)/(n**3 + 2))/(1/n**2), (3*n**3 + n**2)/(n**3 + 2)); same((3*n**3 + n**2)/(n**3 + 2), (3 + 1/n)/(1 + 2/n**3)); limit_is((3*n**3 + n**2)/(n**3 + 2), n, oo, 3)
steps((n + 1)**3/3**(n + 1)*(3**n/n**3), (1 + 1/n)**3/3); limit_is((1 + 1/n)**3/3, n, oo, Rational(1, 3))
same((npp/(npp**2 + 1))/(1/npp), npp**2/(npp**2 + 1)); limit_is(n**2/(n**2 + 1), n, oo, 1)
same(expand(npp*((npp + 1)**2 + 1) - (npp + 1)*(npp**2 + 1)), npp**2 + npp - 1); limit_is(n/(n**2 + 1), n, oo, 0)
same(expand((npp + 1)*(npp**2 + 1)), npp**3 + npp**2 + npp + 1); same(expand(npp*((npp + 1)**2 + 1)), npp**3 + 2*npp**2 + 2*npp)
holds(all(Rational(j + 1, (j + 1)**2 + 1) <= Rational(j, j**2 + 1) for j in range(1, 300)))
holds(Sum((-1)**n*n/(n**2 + 1), (n, 1, oo)).is_convergent()); holds(not Sum(n/(n**2 + 1), (n, 1, oo)).is_convergent())
same(((2*npp/(3*npp + 1))**npp)**(1/npp), 2*npp/(3*npp + 1)); limit_is(2*n/(3*n + 1), n, oo, Rational(2, 3))
same(diff(xg*sqrt(log(xg)), xg), sqrt(log(xg)) + 1/(2*sqrt(log(xg)))); antideriv(2*sqrt(log(x)), 1/(x*sqrt(log(x))), x)
same(integrate(1/sqrt(u), (u, log(2), log(tq))), 2*sqrt(log(tq)) - 2*sqrt(log(2))); limit_is(2*sqrt(log(x)) - 2*sqrt(log(2)), x, oo, oo)
```
:::

判断一个级数是否收敛是一个问题；求出它的和是另一个问题，通常更难。大多数收敛的级数，例如 $\sum 1/n^3$，没有已知的求和公式。然后用一个保证误差界限的估计来求和：正项递减级数的积分判别法（第14.5节）、交错级数的误差界（第14.7节），或者将余项与几何级数进行比较（练习14.10展示如何操作）。模块15转向那些项中包含变量 $x$ 的级数，即幂级数，它们表示诸如 $e^x$ 和 $\sin x$ 这样的函数，并证明了该模块所引用的和 $\ln 2$ 和 $e$。

## 你所学到的内容 {#summary}

- 序列$(a_n)$收敛于$L$，如果对每个$\varepsilon > 0$，存在一个$N$，使得对每个$n > N$都有$\abs{a_n - L} < \varepsilon$。极限运算法则、夹逼定理以及函数极限（$a_n = f(n)$，其中对$f$应用洛必达法则）用于计算极限。幂$r^n$趋于0当且仅当$\abs{r} < 1$。
- **单调收敛定理**，实数完备性的一种形式：一个递增且有上界的数列收敛，一个递减且有下界的数列也收敛。对于递推 $a_{n+1} = g(a_n)$：证明该数列是单调且有界的（通常用数学归纳法），然后再解 $L = g(L)$。
- 一个 **级数** $\sum a_n$ 收敛当且仅当它的部分和 $S_N$ 收敛，其和为这些部分和的极限。等比级数 $\sum_{n=0}^{\infty} ar^n$ 在 $\abs{r} < 1$ 时和为 $\dfrac{a}{1 - r}$，否则发散；一个裂项相消级数具有 $S_N = b_1 - b_{N+1}$。
- 如果 $\sum a_n$ 收敛，则 $a_n \to 0$，因此不趋于 0 的项意味着发散。其逆命题不成立：**调和级数** $\sum 1/n$ 发散，尽管其部分和仅增长像 $\ln N$。
- **积分判别法**（$f$ 连续、正且递减）： $\sum f(n)$ 与 $\int_1^{\infty} f(x)\,dx$ 同时收敛或发散，并且 $\int_{N+1}^{\infty} f(x)\,dx \le R_N \le \int_N^{\infty} f(x)\,dx$。 $p$ 级数 $\sum 1/n^p$ 收敛当且仅当 $p > 1$； $\sum 1/n^2 = \pi^2/6$。
- **比较**($0 \le a_n \le b_n$) 和**极限比较** ($a_n/b_n \to L$ 与 $0 < L < \infty$) 将一个级数与一个已知级数进行比较。
- **交错级数检验**($b_n$ 正项、递减、趋于 0)： $\sum (-1)^{n-1}b_n$ 收敛，且 $\abs{S - S_N} \le b_{N+1}$。交错调和级数收敛于 $\ln 2$，但仅**条件收敛**；重新排列它可能会改变其和。
- **绝对收敛**说明收敛。**比率**和**根值判别法**： $\rho < 1$ 表示绝对收敛， $\rho > 1$ 发散， $\rho = 1$ 无结论。
- **策略**： 首先使用发散性检验；然后使用已知级数；对 $n$ 的幂使用比较法；对阶乘和指数使用比率检验，对 $n$ 次幂使用根值判别法；对可积分函数使用积分检验；在使用交错级数检验前先检验绝对收敛。

```check
same(summation(Rational(1, 3)**n, (n, 0, oo)), 1/(1 - Rational(1, 3))); same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2))
```

## 练习 {#exercises}

:::: exercise 数列的极限 {#ex-14-1} ★
求每个数列的极限，或证明其发散。

- (a) $a_n = \dfrac{4n^2 - n}{2n^2 + 5}$
- (b) $a_n = \dfrac{(-1)^n\,n}{n + 1}$
- (c) $a_n = \Big(1 + \dfrac3n\Big)^n$
- (d) $a_n = \sqrt{n + 1} - \sqrt n$

::: solution
**(a)** 将分子和分母都除以 $n^2$： $a_n = \dfrac{4 - 1/n}{2 + 5/n^2} \to \dfrac{4}{2} = 2$。

**(b)** 项的大小， $\dfrac{n}{n + 1} = \dfrac{1}{1 + 1/n}$，趋于 1，而符号交替。对于 $n \ge 2$， $\dfrac{n}{n + 1} \ge \dfrac23$，因此每个偶数索引的项至少为 $\tfrac23$，而从 $n = 3$ 开始的每个奇数索引的项至多为 $-\tfrac23$。假设该序列有一个极限 $L$，并用 $\varepsilon = \tfrac23$ 挑战它。在任意 $N$ 之后，存在一个偶数索引 $p$ 和一个奇数索引 $q$，然后根据三角不等式，

$$\frac43 \le \abs{a_p - a_q} \le \abs{a_p - L} + \abs{L - a_q},$$

所以 $a_p$ 和 $a_q$ 不能同时位于 $\tfrac23$ 的 $L$ 附近。没有 $N$ 回应挑战，因此没有数是极限：该序列发散。

**(c)** 根据 [定理 6.6](module_06_ZH.html#two-routes)，带 $x = 3$， $a_n \to e^3 \approx 20.09$。答案 1，来自“基数趋于 1”，是第 14.1 节的陷阱：指数增长过快。

**(d)** 形式为 $\infty - \infty$，这决定不了什么；如模块 2 所示进行有理化。乘以并除以 $\sqrt{n + 1} + \sqrt n$：

$$a_n = \frac{(n + 1) - n}{\sqrt{n + 1} + \sqrt n} = \frac{1}{\sqrt{n + 1} + \sqrt n}.$$

分母大于 $2\sqrt n$，因此 $0 < a_n < \dfrac{1}{2\sqrt n}$，且 $\dfrac{1}{2\sqrt n} \to 0$。根据夹逼定理， $a_n \to 0$。

```check
same((4*n**2 - n)/(2*n**2 + 5), (4 - 1/n)/(2 + 5/n**2)); limit_is((4*n**2 - n)/(2*n**2 + 5), n, oo, 2)
same(n/(n + 1), 1/(1 + 1/n)); limit_is(n/(n + 1), n, oo, 1); holds(all(Rational(j, j + 1) >= Rational(2, 3) for j in range(2, 300)))
holds(all(Integer(-1)**j*Rational(j, j + 1) >= Rational(2, 3) for j in range(2, 300, 2))); holds(all(Integer(-1)**j*Rational(j, j + 1) <= -Rational(2, 3) for j in range(3, 300, 2)))
same(Rational(2, 3) - (-Rational(2, 3)), Rational(4, 3)); same(2*Rational(2, 3), Rational(4, 3))
limit_is((1 + 3/n)**n, n, oo, exp(3)); rounds(exp(3), '20.09')
same((sqrt(npp + 1) - sqrt(npp))*(sqrt(npp + 1) + sqrt(npp)), 1)
holds(all(sqrt(j + 1) + sqrt(j) > 2*sqrt(j) for j in range(1, 100))); limit_is(1/(2*sqrt(n)), n, oo, 0); limit_is(sqrt(n + 1) - sqrt(n), n, oo, 0)
```
:::
::::

:::: exercise 几何级数 {#ex-14-2} ★
- (a) 求 $\displaystyle\sum_{n=2}^{\infty}\Big(\frac34\Big)^n$。
- (b) 求 $\displaystyle\sum_{n=0}^{\infty}\frac{2^{n+1}}{5^n}$。
- (c) 将 $0.181818\ldots$ 和 $0.4999\ldots$ 写成分数。
- (d) 一个球从 2 米的高度掉落，每次弹起的高度为它下落高度的 $\tfrac34$（数值为假设值）。它总共行驶的距离是多少？

::: solution
**(a)** 第一项在 $n = 2$ 时为 $\tfrac{9}{16}$，且 $r = \tfrac34$：总和为 $\dfrac{9/16}{1 - 3/4} = \dfrac{9/16}{1/4} = \dfrac94$。

**(b)** $\dfrac{2^{n+1}}{5^n} = 2\Big(\dfrac25\Big)^n$，一个等比数列，首项为 $a = 2$，公比为 $r = \tfrac25$：总和为 $\dfrac{2}{1 - 2/5} = \dfrac{2}{3/5} = \dfrac{10}{3}$。

**(c)** $0.181818\ldots = \dfrac{18}{100} + \dfrac{18}{100^2} + \cdots = \dfrac{18/100}{1 - 1/100} = \dfrac{18}{99} = \dfrac{2}{11}$。并且

$$\begin{aligned} 0.4999\ldots &= \frac{4}{10} + \Big(\frac{9}{100} + \frac{9}{1000} + \cdots\Big) \\ &= \frac{4}{10} + \frac{9/100}{1 - 1/10} = \frac{4}{10} + \frac{1}{10} = \frac12. \end{aligned}$$

**(d)** 球下落 2 米。然后它上升 1.5 米并下落 1.5 米，上升 1.125 米并下落 1.125 米，依此类推：第一次之后的每个高度都被计算两次。高度 $1.5, 1.125, \dots$ 构成一个等比数列，首项为 $a = 1.5$，公比为 $r = \tfrac34$，因此总距离为

$$2 + 2\cdot\frac{1.5}{1 - 3/4} = 2 + 2 \cdot 6 = 14 \text{ metres}.$$

诱人的 $\dfrac{2}{1 - 3/4} = 8$ m 仅计算每个高度一次。

```check
same(summation(Rational(3, 4)**n, (n, 2, oo)), Rational(9, 4)); steps(Rational(9, 16)/(1 - Rational(3, 4)), Rational(9, 16)/Rational(1, 4), Rational(9, 4))
holds(all(Integer(2)**(j + 1)/Integer(5)**j == 2*Rational(2, 5)**j for j in range(0, 20))); same(summation(2**(n + 1)/5**n, (n, 0, oo)), Rational(10, 3))
steps(Rational(18, 100)/(1 - Rational(1, 100)), Rational(18, 99), Rational(2, 11)); rounds(Rational(2, 11), '0.181818')
steps(Rational(4, 10) + Rational(9, 100)/(1 - Rational(1, 10)), Rational(4, 10) + Rational(1, 10), Rational(1, 2))
same(2*Rational(3, 4), Rational(3, 2)); same(Rational(3, 2)*Rational(3, 4), Rational(9, 8))
steps(2 + 2*Rational(3, 2)/(1 - Rational(3, 4)), 2 + 2*6, 14); same(2/(1 - Rational(3, 4)), 8)
```
:::
::::

:::: exercise 快速判断 {#ex-14-3} ★
判断每个级数是否收敛或发散，并用一行说明理由。

- (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n}{3n + 2}$
- (b) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^{1.01}}$
- (c) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{\sqrt n}$
- (d) $\displaystyle\sum_{n=0}^{\infty}\Big(\frac{e}{\pi}\Big)^n$
- (e) $\displaystyle\sum_{n=1}^{\infty}(-1)^n$

::: solution
**(a)** 项趋于 $\tfrac13 \ne 0$：该级数根据发散判别法发散。

**(b)** 一个 $p$ 级数，其 $p = 1.01 > 1$：它收敛。

**(c)** 一个 $p$ 级数，其 $p = \tfrac12 \le 1$：它发散，尽管其项趋于 0（这里发散性判别法无能为力）。

**(d)** 一个等比级数，其公比为 $r = e/\pi \approx 0.865$，且 $\abs{r} < 1$：它收敛，和为 $\dfrac{1}{1 - e/\pi} = \dfrac{\pi}{\pi - e} \approx 7.42$。

**(e)** 项 $-1, 1, -1, \dots$ 不趋于 0（它们没有极限）：它发散。

```check
limit_is(n/(3*n + 2), n, oo, Rational(1, 3)); holds(Sum(1/n**Rational(101, 100), (n, 1, oo)).is_convergent()); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
rounds(E/pi, '0.865'); holds(E/pi < 1); same(1/(1 - E/pi), pi/(pi - E)); rounds(pi/(pi - E), '7.42')
same([(-1)**j for j in range(1, 5)], [-1, 1, -1, 1])
```
:::
::::

:::: exercise 望远镜级数 {#ex-14-4} ★
- (a) 证明 $\dfrac{2}{n^2 - 1} = \dfrac{1}{n - 1} - \dfrac{1}{n + 1}$ 对于 $n \ge 2$ 成立，并求 $\displaystyle\sum_{n=2}^{\infty}\frac{2}{n^2 - 1}$。
- (b) 求 $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{1}{\sqrt n} - \frac{1}{\sqrt{n + 1}}\Big)$。

::: solution
**(a)** 在公共分母 $(n - 1)(n + 1) = n^2 - 1$ 下，右边为 $\dfrac{(n + 1) - (n - 1)}{n^2 - 1} = \dfrac{2}{n^2 - 1}$。每个负项都会与后面两个位置的正项相消，因此从 $n = 2$ 到 $n = N$ 的各项之和为

$$\begin{aligned} &\Big(1 - \frac13\Big) + \Big(\frac12 - \frac14\Big) + \Big(\frac13 - \frac15\Big) + \cdots \\ &\qquad + \Big(\frac{1}{N - 1} - \frac{1}{N + 1}\Big) \\ &\quad= 1 + \frac12 - \frac1N - \frac{1}{N + 1}, \end{aligned}$$

该数列趋于 $\tfrac32$。其和为 $\tfrac32$。不要将级数拆分为 $\sum \tfrac{1}{n - 1} - \sum \tfrac{1}{n + 1}$：这两个级数都发散，且和的性质仅适用于收敛级数。

**(b)** 它是一个裂项相消级数，其和为 $b_n = 1/\sqrt n$： $S_N = 1 - \dfrac{1}{\sqrt{N + 1}} \to 1$。其和为 1，尽管 $\sum 1/\sqrt n$ 本身发散。

```check
same(1/(n - 1) - 1/(n + 1), 2/(n**2 - 1)); same((n - 1)*(n + 1), n**2 - 1)
for Nn in range(2, 15):
    same(sum(Rational(2, j**2 - 1) for j in range(2, Nn + 1)), 1 + Rational(1, 2) - Rational(1, Nn) - Rational(1, Nn + 1))
limit_is(1 + Rational(1, 2) - 1/n - 1/(n + 1), n, oo, Rational(3, 2)); same(summation(2/(n**2 - 1), (n, 2, oo)), Rational(3, 2))
for Nn in range(1, 12):
    same(sum(1/sqrt(j) - 1/sqrt(j + 1) for j in range(1, Nn + 1)), 1 - 1/sqrt(Nn + 1))
limit_is(1 - 1/sqrt(n + 1), n, oo, 1)
```
:::
::::

:::: exercise ε–N 证明 {#ex-14-5} ★★
- (a) 从定义 14.2 证明 $\displaystyle\lim_{n\to\infty}\frac{2n - 1}{n + 4} = 2$。
- (b) 找到最小的整数 $N$ 来满足挑战 $\varepsilon = 0.001$：从第 $N$ 项开始，每一项与 2 的差小于 0.001。

::: solution
**(a)** *草稿工作。* $\abs{\dfrac{2n - 1}{n + 4} - 2} = \abs{\dfrac{2n - 1 - 2(n + 4)}{n + 4}} = \dfrac{9}{n + 4}$，因为分子是 $-9$ 和 $n + 4 > 0$。当 $n + 4 > 9/\varepsilon$ 时，这小于 $\varepsilon$，因此 $N = 9/\varepsilon$ 将适用。

*证明。* 设 $\varepsilon > 0$ 和 $N = 9/\varepsilon$。对于每一个 $n > N$，都有 $n + 4 > 9/\varepsilon$，因此 $\abs{\dfrac{2n - 1}{n + 4} - 2} = \dfrac{9}{n + 4} < \varepsilon$。每一个挑战都被满足，极限为 2。

**(b)** $\dfrac{9}{n + 4} < 0.001$ 恰好当 $n + 4 > 9000$，也就是说，当 $n > 8996$。因此 $N = 8996$ 起作用：从第 8997 项开始，每一项都与 2 的差小于 0.001。没有更小的 $N$ 能做到这一点，因为第 8996 项与 2 的差正好是 0.001： $\dfrac{9}{9000} = 0.001$，这不小于 0.001。

```check
an5 = (2*nn - 1)/(nn + 4)
steps(an5 - 2, (2*nn - 1 - 2*(nn + 4))/(nn + 4), -9/(nn + 4)); same(Abs(an5 - 2), 9/(nn + 4))
holds((ep - 9/(9/ep + 4)).factor().is_positive)
holds(Rational(9, 8997 + 4) < Rational(1, 1000)); same(Rational(9, 8996 + 4), Rational(1, 1000))
same(solve(Eq(9/(x + 4), Rational(1, 1000)), x), [8996]); limit_is((2*n - 1)/(n + 4), n, oo, 2)
```
:::
::::

:::: exercise 递推序列 {#ex-14-6} ★★
设 $a_1 = 1.5$ 和 $a_{n+1} = \dfrac{a_n^2 + 2}{3}$。

- (a) 计算 $a_2$ 和 $a_3$。
- (b) 证明对于每一个 $n$， $1 < a_n < 2$ 成立，并且该数列是递减的。
- (c) 求其极限。
- (d) 如果改为 $a_1 = 3$ 呢？

::: solution
**(a)** $a_2 = \dfrac{2.25 + 2}{3} = \dfrac{17}{12} \approx 1.4167$，并且 $a_3 = \dfrac{(17/12)^2 + 2}{3} = \dfrac{577}{432} \approx 1.3356$。

**(b)** 用数学归纳法。 $a_1 = 1.5$ 介于 1 和 2 之间。如果 $1 < a_n < 2$，则 $1 < a_n^2 < 4$，因此 $3 < a_n^2 + 2 < 6$ 和 $1 < a_{n+1} < 2$。因此 $1 < a_n < 2$ 对于每一个 $n$ 成立。接下来，

$$\begin{aligned} a_{n+1} - a_n &= \frac{a_n^2 - 3a_n + 2}{3} \\ &= \frac{(a_n - 1)(a_n - 2)}{3} < 0, \end{aligned}$$

因为 $a_n - 1 > 0$ 和 $a_n - 2 < 0$。因此该数列是递减的。

**(c)** 它是递减的，并且下界为 1，因此根据单调收敛定理，它收敛于一个数 $L$，满足 $1 \le L \le a_1 = 1.5$。对递归式两边取极限，得到 $L = \dfrac{L^2 + 2}{3}$，因此 $L^2 - 3L + 2 = 0$，即 $(L - 1)(L - 2) = 0$。由于 $L \le 1.5$，所以 $L = 1$。

**(d)** 现在 $a_2 = \tfrac{11}{3} > a_1$。如果 $a_n > 2$，则 $a_{n+1} - a_n = \tfrac13(a_n - 1)(a_n - 2) > 0$，因此 $a_{n+1} > a_n > 2$：通过归纳法，该数列递增且始终大于 2。如果它收敛，则其极限至少为 $a_1 = 3$，且满足 $L^2 - 3L + 2 = 0$，其唯一解为 1 和 2：不可能。因此它发散；由于它是递增的，它没有上界（否则单调收敛定理会使它收敛），因此它发散到无穷大。方程 $L = g(L)$ 给出的候选值为 1 和 2，但都不是极限：这是第 14.2 节的陷阱。

```check
g6 = lambda v: (v**2 + 2)/3
s6 = [Rational(3, 2)]
for _ in range(12):
    s6.append(g6(s6[-1]))
same(s6[1], Rational(17, 12)); same(s6[2], Rational(577, 432)); rounds(s6[1], '1.4167'); rounds(s6[2], '1.3356')
holds(all(1 < v_ < 2 for v_ in s6)); holds(all(s6[j + 1] < s6[j] for j in range(12)))
same(expand(g6(ap) - ap), expand((ap - 1)*(ap - 2)/3)); same(factor(ap**2 - 3*ap + 2), (ap - 1)*(ap - 2))
same_set(solve(Eq(Lr, g6(Lr)), Lr), [1, 2])
t6 = [Integer(3)]
for _ in range(6):
    t6.append(g6(t6[-1]))
same(t6[1], Rational(11, 3)); holds(all(t6[j + 1] > t6[j] > 2 for j in range(6)))
```
:::
::::

:::: exercise 估计 $\sum 1/n^3$ {#ex-14-7} ★★
- (a) 用积分判别法证明 $\sum_{n=1}^{\infty} 1/n^3$ 收敛。
- (b) 利用 $S_5$ 和余项估计找出包含和的区间。
- (c) 有多少项 $N$ 能确保 $S_N$ 单独在总和的 0.0005 以内？

::: solution
**(a)** $f(x) = 1/x^3$ 在 $[1, \infty)$ 上连续、正且递减，且 $\displaystyle\int_1^{\infty}\frac{dx}{x^3} = \lim_{t\to\infty}\Big[-\frac{1}{2x^2}\Big]_1^t = \frac12$ 收敛（一个 $p$-积分，带 $p = 3$）。因此级数收敛。

**(b)** $S_5 = 1 + \tfrac18 + \tfrac{1}{27} + \tfrac{1}{64} + \tfrac{1}{125} \approx 1.185662$。一般来说 $\displaystyle\int_N^{\infty}\frac{dx}{x^3} = \frac{1}{2N^2}$，因此 $\int_6^{\infty} = \tfrac{1}{72} \approx 0.013889$ 和 $\int_5^{\infty} = \tfrac{1}{50} = 0.02$。余项估计给出

$$1.199551 \le S \le 1.205662.$$

（总和约为 1.202057，且没有已知的公式。）

**(c)** $R_N \le \displaystyle\int_N^{\infty}\frac{dx}{x^3} = \frac{1}{2N^2}$，且 $\dfrac{1}{2N^2} \le 0.0005$ 恰当当 $N^2 \ge 1000$。由于 $31^2 = 961$ 和 $32^2 = 1024$，需要 $N = 32$ 项。

```check
same(integrate(1/x**3, (x, 1, oo)), Rational(1, 2)); antideriv(-1/(2*x**2), 1/x**3, x)
S5c = sum(Rational(1, j**3) for j in range(1, 6)); rounds(S5c, '1.185662')
same(integrate(1/x**3, (x, Np, oo)), 1/(2*Np**2)); same(integrate(1/x**3, (x, 6, oo)), Rational(1, 72)); rounds(Rational(1, 72), '0.013889'); same(integrate(1/x**3, (x, 5, oo)), Rational(1, 50))
rounds(S5c + Rational(1, 72), '1.199551'); rounds(S5c + Rational(1, 50), '1.205662'); rounds(zeta(3), '1.202057')
holds(S5c + Rational(1, 72) <= zeta(3)); holds(zeta(3) <= S5c + Rational(1, 50))
same(31**2, 961); same(32**2, 1024); holds(Rational(1, 2*32**2) <= Rational(5, 10000)); holds(Rational(1, 2*31**2) > Rational(5, 10000))
```
:::
::::

:::: exercise 比较判别法 {#ex-14-8} ★★
判断每个级数是否收敛，并指出所用的判别法。

- (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n + 4}{n^3 + 2n}$
- (b) $\displaystyle\sum_{n=1}^{\infty}\frac{2 + \sin n}{n^2}$
- (c) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{3^n - 2^n}$
- (d) $\displaystyle\sum_{n=1}^{\infty}\frac{\sqrt n + 1}{n + 2}$

::: solution
**(a)** 主导项给出 $\dfrac{n}{n^3} = \dfrac{1}{n^2}$。与 $b_n = 1/n^2$ 做极限比较： $\dfrac{a_n}{b_n} = \dfrac{n^3 + 4n^2}{n^3 + 2n} = \dfrac{1 + 4/n}{1 + 2/n^2} \to 1$。由于 $\sum 1/n^2$ 收敛，因此该级数也收敛。

**(b)** $-1 \le \sin n \le 1$，因此 $0 < \dfrac{2 + \sin n}{n^2} \le \dfrac{3}{n^2}$。由于 $\sum 3/n^2$ 收敛，该级数根据比较判别法收敛。

**(c)** 比较与 $b_n = 1/3^n$（注意 $3^n - 2^n > 0$）： $\dfrac{a_n}{b_n} = \dfrac{3^n}{3^n - 2^n} = \dfrac{1}{1 - (2/3)^n} \to 1$. 几何级数 $\sum 1/3^n$ 收敛，因此该级数按极限比较收敛。直接与 $1/3^n$ 比较将指向错误的方向，因为 $\dfrac{1}{3^n - 2^n} > \dfrac{1}{3^n}$。

**(d)** 主项给出 $\dfrac{\sqrt n}{n} = \dfrac{1}{\sqrt n}$。极限比较与 $b_n = 1/\sqrt n$： $\dfrac{a_n}{b_n} = \dfrac{(\sqrt n + 1)\sqrt n}{n + 2} = \dfrac{n + \sqrt n}{n + 2} \to 1$. 由于 $\sum 1/\sqrt n$ 发散，因此该级数也发散。

```check
same(((n + 4)/(n**3 + 2*n))/(1/n**2), (n**3 + 4*n**2)/(n**3 + 2*n)); same((n**3 + 4*n**2)/(n**3 + 2*n), (1 + 4/n)/(1 + 2/n**2)); limit_is((n**3 + 4*n**2)/(n**3 + 2*n), n, oo, 1)
holds(all(0 < (2 + sin(j))/j**2 for j in range(1, 100))); holds(all((2 + sin(j))/j**2 <= Rational(3, j**2) for j in range(1, 100)))
holds(all(Integer(3)**j - Integer(2)**j > 0 for j in range(1, 60))); same(3**n/(3**n - 2**n), 1/(1 - Rational(2, 3)**n)); limit_is(3**n/(3**n - 2**n), n, oo, 1)
same(((sqrt(npp) + 1)/(npp + 2))/(1/sqrt(npp)), (npp + sqrt(npp))/(npp + 2)); limit_is((n + sqrt(n))/(n + 2), n, oo, 1)
holds(Sum((n + 4)/(n**3 + 2*n), (n, 1, oo)).is_convergent()); holds(not Sum((sqrt(n) + 1)/(n + 2), (n, 1, oo)).is_convergent())
```
:::
::::

:::: exercise 交错级数 {#ex-14-9} ★★
设 $S = \displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{n\,2^n} = \frac12 - \frac18 + \frac{1}{24} - \cdots$

- (a) 证明该级数收敛。
- (b) 多少项能保证误差小于 0.001？计算该部分和，并给出包含 $S$ 的区间。
- (c) 模块 15 显示 $S = \ln\tfrac32$。它是否在你的区间内？

::: solution
**(a)** $b_n = \dfrac{1}{n\,2^n}$ 为正；它递减，因为 $n\,2^n$ 随 $n$ 增加；并且它趋于 0。根据交错级数判别法，该级数收敛。（它甚至绝对收敛，因为 $b_n \le 1/2^n$。）

**(b)** 第一项被省略的项必须小于 0.001，在大小上，即 $(N + 1)2^{N+1} > 1000$。对于 $N + 1 = 7$， $7 \cdot 128 = 896$ 太小；对于 $N + 1 = 8$， $8 \cdot 256 = 2048$ 足够。因此 7 项：

$$\begin{aligned} S_7 &= \frac12 - \frac18 + \frac{1}{24} - \frac{1}{64} \\ &\qquad + \frac{1}{160} - \frac{1}{384} + \frac{1}{896} \\ &= \frac{909}{2240} \approx 0.405804. \end{aligned}$$

误差 $S - S_7$ 的大小最多为 $b_8 = \tfrac{1}{2048} \approx 0.000488$，并且它位于 0 和被省略的第一项 $-\tfrac{1}{2048}$ 之间。因此

$$0.405315 \le S \le 0.405804.$$

**(c)** $\ln 1.5 \approx 0.405465$ 位于该区间内。 $S_7$ 的误差为 $\ln 1.5 - S_7 \approx -0.000338$：负数，像被省略的第一项一样，且其大小小于该上界。

```check
holds(all((j + 1)*2**(j + 1) > j*2**j for j in range(1, 60))); limit_is(1/(n*2**n), n, oo, 0)
same(7*2**7, 896); same(8*2**8, 2048)
S7c = sum(Rational((-1)**(j - 1), j*2**j) for j in range(1, 8)); same(S7c, Rational(909, 2240)); rounds(S7c, '0.405804')
rounds(Rational(1, 2048), '0.000488'); rounds(S7c - Rational(1, 2048), '0.405315')
same(summation((-1)**(n - 1)/(n*2**n), (n, 1, oo)), log(Rational(3, 2))); rounds(log(Rational(3, 2)), '0.405465')
holds(S7c - Rational(1, 2048) <= log(Rational(3, 2))); holds(log(Rational(3, 2)) <= S7c); rounds(log(Rational(3, 2)) - S7c, '-0.000338')
holds(Abs(log(Rational(3, 2)) - S7c) < Rational(1, 2048))
```
:::
::::

:::: exercise 比值审敛法和根值判别法，以及一个几何上界 {#ex-14-10} ★★
- (a) 判断 $\displaystyle\sum_{n=1}^{\infty}\frac{n!}{10^n}$ 是否收敛。
- (b) 判断 $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{n}{n + 1}\Big)^{n^2}$ 是否收敛。
- (c) 比值审敛法对 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2 + 1}$ 说了什么？级数是否收敛？
- (d) 对于 $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$ （例 14.16），证明 $\dfrac{a_{n+1}}{a_n} \le \dfrac{6}{11}$ 对于每一个 $n \ge 11$ 成立，并推导出 $R_{10} \le \dfrac{a_{11}}{1 - 6/11}$。将其与真实的余项 $R_{10} = 2 - S_{10} = \tfrac{3}{256}$ 进行比较。

::: solution
**(a)** 比值审敛法: $\dfrac{a_{n+1}}{a_n} = \dfrac{(n + 1)!}{10^{n+1}}\cdot\dfrac{10^n}{n!} = \dfrac{n + 1}{10} \to \infty$. 级数发散: 从 $n = 10$ 开始, 项逐渐增大。

**(b)** 根值审敛法: $\abs{a_n}^{1/n} = \Big(\dfrac{n}{n + 1}\Big)^n = \dfrac{1}{(1 + 1/n)^n} \to \dfrac1e < 1$. 级数收敛。

**(c)** $\dfrac{a_{n+1}}{a_n} = \dfrac{n^2 + 1}{(n + 1)^2 + 1} \to 1$: 比值审敛法无法得出结论, 因为对于所有项由 $n$ 的幂构成的级数均如此。比较如下: $0 < \dfrac{1}{n^2 + 1} < \dfrac{1}{n^2}$, 所以级数收敛。

**(d)** $\dfrac{a_{n+1}}{a_n} = \dfrac{n + 1}{2n} = \dfrac12 + \dfrac{1}{2n}$, 其随着 $n$ 增大而减小, 所以对于 $n \ge 11$, 其最大值为 $\dfrac12 + \dfrac{1}{22} = \dfrac{6}{11}$。然后 $a_{12} \le \tfrac{6}{11}a_{11}$, $a_{13} \le \big(\tfrac{6}{11}\big)^2 a_{11}$, 依此类推, 所以余项不超过一个等比级数:

$$\begin{aligned} R_{10} &= a_{11} + a_{12} + \cdots \\ &\le a_{11}\Big(1 + \frac{6}{11} + \Big(\frac{6}{11}\Big)^2 + \cdots\Big) \\ &= \frac{a_{11}}{1 - 6/11} = \frac{11}{2048}\cdot\frac{11}{5} \\ &= \frac{121}{10\,240} \approx 0.01182. \end{aligned}$$

真实的余项为 $\tfrac{3}{256} \approx 0.01172$: 该上界比实际值大不到 1%。

```check
steps(factorial(n + 1)/10**(n + 1)*(10**n/factorial(n)), (n + 1)/10); limit_is((n + 1)/10, n, oo, oo)
holds(all(factorial(j + 1)/Integer(10)**(j + 1) > factorial(j)/Integer(10)**j for j in range(10, 60)))
same(((npp/(npp + 1))**(npp**2))**(1/npp), (npp/(npp + 1))**npp); limit_is((n/(n + 1))**n, n, oo, 1/E)
limit_is((n**2 + 1)/((n + 1)**2 + 1), n, oo, 1); holds(all(Rational(1, j**2 + 1) < Rational(1, j**2) for j in range(1, 100)))
same((n + 1)/(2*n), Rational(1, 2) + 1/(2*n)); same(Rational(1, 2) + Rational(1, 22), Rational(6, 11)); holds(all(Rational(j + 1, 2*j) <= Rational(6, 11) for j in range(11, 300)))
same(Rational(11, 2**11)/(1 - Rational(6, 11)), Rational(121, 10240)); rounds(Rational(121, 10240), '0.01182')
same(2 - sum(Rational(j, 2**j) for j in range(1, 11)), Rational(3, 256)); rounds(Rational(3, 256), '0.01172'); holds(Rational(121, 10240) < Rational(3, 256)*Rational(101, 100))
same(summation(n/2**n, (n, 1, oo)), 2)
```
:::
::::

:::: exercise 欧拉常数与 ln 2 的和 {#ex-14-11} ★★★
设 $H_N = 1 + \tfrac12 + \cdots + \tfrac1N$ 和 $d_N = H_N - \ln N$。

- (a) 证明 $d_N - d_{N+1} = \displaystyle\int_N^{N+1}\Big(\frac1x - \frac{1}{N + 1}\Big)dx$, 并推导出 $(d_N)$ 递减。
- (b) 证明 $d_N > 0$ 对于所有 $N$ 成立, 并推导出 $(d_N)$ 收敛。(其极限为欧拉常数 $\gamma \approx 0.5772$。)
- (c) 证明交错调和级数的第 $2N$ 项部分和为 $S_{2N} = H_{2N} - H_N$，并推导出 $\sum_{n=1}^{\infty} (-1)^{n-1}/n = \ln 2$。

::: solution
**(a)** $d_N - d_{N+1} = (H_N - H_{N+1}) + \big(\ln(N + 1) - \ln N\big) = \ln(N + 1) - \ln N - \dfrac{1}{N + 1}$。现在 $\ln(N + 1) - \ln N = \displaystyle\int_N^{N+1}\frac{dx}{x}$，且 $\dfrac{1}{N + 1} = \displaystyle\int_N^{N+1}\frac{dx}{N + 1}$，常数在长度为 1 的区间上的积分。相减得到公式。对于 $N \le x \le N + 1$， $\dfrac1x \ge \dfrac{1}{N + 1}$，因此被积函数从不为负，积分至少为 0： $d_{N+1} \le d_N$。

**(b)** 根据第 14.5 节的积分判别法不等式， $H_N \ge \ln(N + 1) > \ln N$，因此 $d_N > 0$。序列 $(d_N)$ 是递减的，并且下界为 0，因此根据单调收敛定理收敛。由于 $d_1 = 1$，其极限 $\gamma$ 介于 0 和 1 之间。

**(c)** $H_{2N}$ 的奇数项是 $S_{2N}$ 中带有加号的项，偶数项是带有减号的项，因此 $S_{2N} = H_{2N} - 2\big(\tfrac12 + \tfrac14 + \cdots + \tfrac{1}{2N}\big)$。并且 $2\big(\tfrac12 + \tfrac14 + \cdots + \tfrac{1}{2N}\big) = 1 + \tfrac12 + \cdots + \tfrac1N = H_N$。所以 $S_{2N} = H_{2N} - H_N$。现在将每个调和数写成 $d$ 加上一个对数：

$$\begin{aligned} S_{2N} &= \big(d_{2N} + \ln(2N)\big) - \big(d_N + \ln N\big) \\ &= d_{2N} - d_N + \ln 2, \end{aligned}$$

因为 $\ln(2N) - \ln N = \ln 2$。当 $N \to \infty$ 时，有 $d_N \to \gamma$ 和 $d_{2N} \to \gamma$。这是因为 $n$ 超过某个下标后，每个 $d_n$ 与 $\gamma$ 的距离小于 $\varepsilon$，而 $2N$ 最终也超过此下标。因此 $S_{2N} \to \gamma - \gamma + \ln 2 = \ln 2$。又有 $S_{2N+1} = S_{2N} + \tfrac{1}{2N + 1} \to \ln 2$。偶数项和奇数项的部分和都趋于 $\ln 2$，所以整个部分和数列也有同一极限，即 $\sum (-1)^{n-1}/n = \ln 2$。模块 15 用幂级数得到同一个值。

```check
Nq = symbols('N', positive=True, integer=True)
same(integrate(1/x - 1/(Nq + 1), (x, Nq, Nq + 1)), log(Nq + 1) - log(Nq) - 1/(Nq + 1))
same(expand_func(harmonic(Nq + 1)), harmonic(Nq) + 1/(Nq + 1))
same((harmonic(Nq) - log(Nq)) - (expand_func(harmonic(Nq + 1)) - log(Nq + 1)), log(Nq + 1) - log(Nq) - 1/(Nq + 1))
holds(all(harmonic(j) - log(j) > harmonic(j + 1) - log(j + 1) > 0 for j in range(1, 80))); same(harmonic(1) - log(1), 1)
limit_is(harmonic(n) - log(n), n, oo, EulerGamma); rounds(EulerGamma, '0.5772')
for Nn in range(1, 30):
    same(altS(2*Nn), harmonic(2*Nn) - harmonic(Nn)); same(2*sum(Rational(1, 2*j) for j in range(1, Nn + 1)), harmonic(Nn))
same(expand_log(log(2*Nq) - log(Nq), force=True), log(2)); limit_is(harmonic(2*n) - harmonic(n), n, oo, log(2))
```
:::
::::

:::: exercise 项的平方 {#ex-14-12} ★★★
- (a) 证明如果 $\sum a_n$ 绝对收敛, 则 $\sum a_n^2$ 收敛。
- (b) 举一个例子说明当 $\sum a_n$ 仅条件收敛时, (a) 可能不成立。
- (c) 证明如果 $\sum a_n^2$ 和 $\sum b_n^2$ 都收敛, 则 $\sum a_n b_n$ 绝对收敛。 (提示: $\big(\abs{a} - \abs{b}\big)^2 \ge 0$.)

::: solution
**(a)** 由于 $\sum \abs{a_n}$ 收敛，其各项趋于 0（定理 14.8）。因此存在一个索引 $k$，使得对于每一个 $n \ge k$，都有 $\abs{a_n} < 1$，并且对于这些 $n$

$$0 \le a_n^2 = \abs{a_n}\cdot\abs{a_n} \le \abs{a_n}.$$

根据比较判别法, $\sum a_n^2$ 收敛。

**(b)** 取 $a_n = \dfrac{(-1)^{n-1}}{\sqrt n}$。级数 $\sum a_n$ 由交错级数判别法收敛（$1/\sqrt n$ 为正、递减且趋于 0），但仅条件收敛（例 14.15）。而 $a_n^2 = \dfrac1n$： $\sum a_n^2$ 是调和级数，发散。

**(c)** 展开提示， $a^2 - 2\abs{a}\,\abs{b} + b^2 \ge 0$，因此 $\abs{ab} \le \tfrac12\big(a^2 + b^2\big)$ 对所有数 $a$ 和 $b$ 成立。级数 $\sum \tfrac12\big(a_n^2 + b_n^2\big)$ 由级数和的法则收敛，因此 $\sum \abs{a_n b_n}$ 由比较判别法收敛： $\sum a_n b_n$ 绝对收敛。

```check
for v in (Rational(-9, 10), Rational(-1, 3), 0, Rational(1, 5), Rational(99, 100)):
    holds(v**2 <= Abs(v))
holds(not (Rational(3, 2)**2 <= Abs(Rational(3, 2))))                # the index k is needed: for |a| > 1, a^2 > |a|
holds(Sum((-1)**(n - 1)/sqrt(n), (n, 1, oo)).is_convergent()); same(((-1)**(nn - 1)/sqrt(nn))**2, 1/nn); holds(not Sum(1/n, (n, 1, oo)).is_convergent())
ar2, br2 = symbols('a b', real=True)
same(expand((Abs(ar2) - Abs(br2))**2), ar2**2 - 2*Abs(ar2)*Abs(br2) + br2**2)
for p_, q_ in ((3, -5), (-2, -7), (Rational(1, 2), 4), (0, 3)):
    holds(Abs(p_*q_) <= (p_**2 + q_**2)/2)
```
:::
::::

## 自测 {#quiz}

```quiz
? 数列 $a_n = \dfrac{(-1)^n}{n}$
- [ ] 发散，因为其项符号交替
- [x] 收敛于 0
- [ ] 收敛于 1
- [ ] 没有极限，因为 $(-1)^n$ 没有极限
> $\abs{a_n} = \dfrac1n \to 0$，因此 $a_n \to 0$ 由夹逼定理。交错符号不会阻止一个数列在项的大小趋于 0 时收敛。乘积法则需要两个因子都有极限，因此 $(-1)^n$ 的发散对 $(-1)^n/n$ 没有任何说明。

? $\displaystyle\sum_{n=1}^{\infty}\Big(\frac23\Big)^n$等于
- [ ] 3
- [ ] $\dfrac23$
- [x] 2
- [ ] 没有：级数发散
> 它是一个等比数列，首项 $\tfrac23$（含 $n = 1$ 的项）和公比 $\tfrac23$，因此其和为 $\dfrac{2/3}{1 - 2/3} = 2$。答案 3 是 $\dfrac{1}{1 - 2/3}$，从 $n = 0$ 开始的和包含额外的项 1。 $\tfrac23$ 仅是首项，且级数收敛是因为 $\abs{r} < 1$。

? 如果 $a_n \to 0$，那么级数 $\sum a_n$
- [x] 可能收敛也可能发散
- [ ] 收敛
- [ ] 发散
- [ ] 收敛于 0
> 趋于 0 的项是收敛的必要条件，但不是充分条件： $\sum 1/n$ 发散， $\sum 1/n^2$ 收敛，且两者都有趋于 0 的项。“收敛到 0”混淆了趋于 0 的项与部分和。

? 这些级数中哪一个收敛？
- [ ] $\displaystyle\sum \frac{1}{\sqrt n}$
- [ ] $\displaystyle\sum \frac1n$
- [ ] $\displaystyle\sum n^{-0.9}$
- [x] $\displaystyle\sum n^{-1.1}$
> 所有四个都是 $p$ 级数，当且仅当 $p > 1$ 时收敛。只有 $n^{-1.1} = 1/n^{1.1}$ 有 $p > 1$；其他有 $p = \tfrac12$，1 和 0.9，尽管它们的项趋于 0，但仍发散。

? 对于 $\sum 1/n^2$，使用比值判别法
- [ ] 得到 $\rho = 1$，因此级数发散
- [x] 给出 $\rho = 1$ 且无结论；级数收敛，作为带有 $p = 2$ 的 $p$-级数
- [ ] 给出$\rho = 0$，因此级数收敛
- [ ] 给出$\rho = \tfrac12$，因此级数收敛
> $\dfrac{a_{n+1}}{a_n} = \dfrac{n^2}{(n + 1)^2} \to 1$. 当满足$\rho = 1$时，比值判别法无法得出结论：调和级数同样具有$\rho = 1$且发散。其收敛性由$p$-级数判别法（或积分判别法）保证。

? 交错调和级数的部分和$S_9 = 1 - \tfrac12 + \tfrac13 - \cdots + \tfrac19$以其和$\ln 2$近似，其误差大小至多为
- [ ] $\dfrac19$
- [ ] $\dfrac{1}{100}$
- [x] $\dfrac{1}{10}$
- [ ] $\dfrac{1}{81}$
> 根据交错级数判别法，$\abs{S - S_N} \le b_{N+1}$，被省略的第一个项的大小：$\tfrac{1}{10}$。$\tfrac19$ 是最后一个被包含的项。真实的误差 $\ln 2 - S_9 \approx -0.052$ 的大小确实小于 $\tfrac{1}{10}$。它是负的，且 $S_9$ 位于 $\ln 2$ 之上，因为被省略的第一个项 $-\tfrac{1}{10}$ 是负的。

? 级数 $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{\sqrt n}$
- [ ] 绝对收敛
- [ ] 发散，因为 $\sum 1/\sqrt n$ 发散
- [ ] 发散，因为其项符号交替
- [x] 条件收敛
> $1/\sqrt n$ 是正的，递减且趋于 0，因此该级数根据交错级数判别法收敛。 $\sum \abs{a_n} = \sum 1/\sqrt n$ 发散 ($p = \tfrac12$)，因此收敛是条件收敛，而非绝对收敛。一个发散的 $\sum \abs{a_n}$ 不会使 $\sum a_n$ 发散。

? 数列 $a_1 = 0$, $a_{n+1} = \sqrt{6 + a_n}$ 是递增且有上界 3，因此收敛。其极限是
- [ ] $-2$
- [x] 3
- [ ] $\sqrt6$
- [ ] 6
> 该极限满足 $L = \sqrt{6 + L}$，因此 $L^2 - L - 6 = (L - 3)(L + 2) = 0$。平方根永远不会为负，且 $L \ge a_1 = 0$，因此 $L = 3$。值 $-2$ 解决了平方方程但不解决 $L = \sqrt{6 + L}$； $\sqrt6$ 仅是 $a_2$。
```

```check
limit_is(1/n, n, oo, 0)
same(summation(Rational(2, 3)**n, (n, 1, oo)), 2); same(1/(1 - Rational(2, 3)), 3)
holds(not Sum(1/n, (n, 1, oo)).is_convergent()); holds(Sum(1/n**2, (n, 1, oo)).is_convergent())
holds(Sum(n**Rational(-11, 10), (n, 1, oo)).is_convergent()); holds(not Sum(n**Rational(-9, 10), (n, 1, oo)).is_convergent())
limit_is((1/(n + 1)**2)/(1/n**2), n, oo, 1)
S9q = altS(9); holds(Abs(S9q - log(2)) <= Rational(1, 10)); rounds(log(2) - S9q, '-0.052'); holds(S9q > log(2))
holds(Sum((-1)**n/sqrt(n), (n, 1, oo)).is_convergent()); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
q8 = [Integer(0)]
for _ in range(10):
    q8.append(sqrt(6 + q8[-1]))
holds(all(q8[j] < q8[j + 1] < 3 for j in range(10))); same(q8[1], sqrt(6))
same_set(solve(Lr**2 - Lr - 6, Lr), [3, -2]); same(solve(Eq(Lr, sqrt(6 + Lr)), Lr), [3])
```
