---
title: 连续性与无穷远
part: 1
lead: 理解连续性的含义，学习何时能保证方程有解，以及连续函数何时达到最大值和最小值。你将用二分法把方程的解逼近到所需精度，再通过渐近线和无穷远处的极限，理解大 O 记号背后的增长阶。
minutes: 270
needs: 模块 1 和 2
goals:
  - 判断函数在一点是否连续，并分类其不连续点
  - 解释标准函数在其定义域上连续的原因，并利用连续性求极限
  - 使用中间值定理证明方程有解，并通过二分法找到保证精度的解
  - 陈述极值定理，并通过例子说明其每个假设条件的必要性
  - 求无限极限和无穷远处的极限，以及函数图像的垂直、水平和斜渐近线
  - 比较对数、幂函数、指数函数和阶乘的增长速度，并使用大O记号
---

## 一点连续性 {#continuity}

一杯茶从80°C冷却到60°C时，会经过中间的所有温度，因为温度逐渐变化。但停车场的收费则不然。假设（假设性地）停车场按每小时或每小时部分收费：59分钟收费3英镑，61分钟收费6英镑，而任何停留时间都不超过4.50英镑。收费会出现跳跃。

模块2讨论了极限不存在的三种方式：跳跃、无穷大和震荡。本模块则提出相反的问题：何时在每一点的极限等于该点的函数值？这样的函数是 **连续** 的，并且在区间内其图像可以不抬笔连续画出。连续性保证了方程有解（第3.3节），并且可以精确到任意程度（第3.4节），还保证了最大值和最小值存在（第3.5节）。第3.6至3.8节则追踪函数趋向无穷大的过程。

以下两个函数在2的左侧是相同的，而在2的右侧则不同：

$$h(x) = \begin{cases} x^2 & \text{if } x < 2, \\ 6 - x & \text{if } x \ge 2, \end{cases}$$

$$k(x) = \begin{cases} x^2 & \text{if } x < 2, \\ 5 - x & \text{if } x \ge 2. \end{cases}$$

```valuetable
x = 1.9, 1.99, 1.999, 2, 2.001, 2.01, 2.1
$h(x)$ = Piecewise((x**2, x < 2), (6 - x, True))
$k(x)$ = Piecewise((x**2, x < 2), (5 - x, True))
digits = 7
---
x | h(x) | k(x)
1.9 | 3.61 | 3.61
1.99 | 3.9601 | 3.9601
1.999 | 3.996001 | 3.996001
2 | 4 | 3
2.001 | 3.999 | 2.999
2.01 | 3.99 | 2.99
2.1 | 3.9 | 2.9
```

在 2 附近，$h$ 的值从两侧趋近于 4，而 $h(2) = 4$：该值与其邻近值一致。$k$ 的值从左侧趋近于 4，从右侧趋近于 3：它们不一致，没有在 2 处的单一值能同时符合两者。

对于一个多项式 $p$，模块 2 发现 $\lim_{x\to a} p(x) = p(a)$：极限等于该值。在某一点具有该性质的函数称为在该点连续。

::: definition 一点连续性
设 $f$ 在包含 $a$ 的开区间上定义，可能在 $a$ 本身处未定义。那么 $f$ 在 $a$**处** 连续，如果

$$\lim_{x\to a} f(x) = f(a).$$

这要求满足三个条件：

1. $f(a)$ 有定义；
2. $\lim_{x\to a} f(x)$ 存在；
3. 极限等于该值。

如果 $f$ 在 $a$ 处不连续，那么 $f$ 在 $a$ 处 **不连续**，而 $a$ 是 **不连续点** 于 $f$。
:::

用文字表达：接近 $a$ 的输入给出接近 $f(a)$ 的输出，且图像在 $(a, f(a))$ 处不中断。在模块2的ε–δ语言中：对于每一个 $\varepsilon > 0$，存在一个 $\delta > 0$，使得

$$\abs{f(x) - f(a)} < \varepsilon \quad\text{whenever}\quad \abs{x - a} < \delta.$$

（极限只关注 $x \ne a$，但 $x = a$ 这里没有害处，因为 $\abs{f(a) - f(a)} = 0$。）

::: example 检验三个条件
判断每个函数在2处是否连续。如果不连续，说明哪个条件不满足。

- (a) $f(x) = \dfrac{x^2 - 4}{x - 2}$
- （b） $g(x) = \dfrac{x^2 - 4}{x - 2}$ 对于 $x \ne 2$，并且 $g(2) = 1$
- （c）上面的函数 $h$
- （d）上面的函数 $k$

**(a)** 条件1不满足：$f(2) = 0/0$ 未定义。因此 $f$ 在2处不连续，尽管其在该点的极限存在：对于 $x \ne 2$，$f(x) = \dfrac{(x - 2)(x + 2)}{x - 2} = x + 2$，所以 $\lim_{x\to 2} f(x) = 4$。

**(b)** 现在 $g(2) = 1$ 有定义，且极限存在且为4，如（a）所示：条件1和2成立。条件3不成立，因为 $4 \ne 1$。因此 $g$ 在2处不连续。

**(c)** $h(2) = 6 - 2 = 4$. 公式在2处发生变化，因此使用单侧极限（模块2）：从左侧 $\lim_{x\to 2^-} x^2 = 4$，从右侧 $\lim_{x\to2^+} (6 - x) = 4$。它们一致，因此 $\lim_{x\to2} h(x) = 4 = h(2)$：所有三个条件成立，且 $h$ 在2处连续，尽管它由两个公式给出。

**(d)** 从左侧的极限再次为4；从右侧的极限是 $\lim_{x\to2^+}(5 - x) = 3$。单侧极限不同，因此条件2不满足：$k$ 在2处不连续，尽管 $k(2) = 3$ 有定义。

```check
fa = (x**2 - 4)/(x - 2)
holds(fa.subs(x, 2) is S.NaN)                      # f(2) = 0/0 is not defined
same(factor(x**2 - 4), (x - 2)*(x + 2)); same(cancel(fa), x + 2); limit_is(fa, x, 2, 4)
holds(Ne(4, 1))                                    # (b): the limit 4 is not g(2) = 1
hc = Piecewise((x**2, x < 2), (6 - x, True)); kd = Piecewise((x**2, x < 2), (5 - x, True))
same(hc.subs(x, 2), 4); limit_is(x**2, x, 2, 4, '-'); limit_is(6 - x, x, 2, 4, '+')
same(kd.subs(x, 2), 3); limit_is(5 - x, x, 2, 3, '+')
same([hc.subs(x, v) for v in (Rational(19, 10), Rational(21, 10))], [Rational(361, 100), Rational(39, 10)])
same([kd.subs(x, v) for v in (Rational(1999, 1000), Rational(2001, 1000))], [Rational(3996001, 1000000), Rational(2999, 1000)])
```
:::

::: pitfall
两个相反的错误。在 $a$ 处有定义且在 $a$ 处有极限并不足够：极限必须等于函数值，如（b）所示。并且一个分段定义的公式并不表示不连续：（c）中的 $h$ 在2处连续，因为其分段在该点相接。检查三个条件；不要仅凭公式的外观来判断。
:::

### 单侧连续性 {#one-sided}

一些函数会出现跳跃，但它们在跳跃点的函数值符合左右两边中的一个，例如地板函数。**floor** 函数 $x$，写作 $\lfloor x\rfloor$，读作 "floor $x$"，是指小于或等于 $x$ 的最大整数：$\lfloor 2.7\rfloor = 2$，$\lfloor 3\rfloor = 3$ 和 $\lfloor -2.7\rfloor = -3$。在 Python 中它表示为 `math.floor`，整数除法 `7 // 2` 会得到 $\lfloor 7/2\rfloor = 3$。其图像是一条阶梯线。在 $x = 3$：对于 $x$ 略小于 3 的值，$\lfloor x\rfloor = 2$，而对于 $3 \le x < 4$，$\lfloor x\rfloor = 3$。因此

$$\lim_{x\to3^-}\lfloor x\rfloor = 2, \qquad \lim_{x\to3^+}\lfloor x\rfloor = 3 = \lfloor 3\rfloor.$$

在 3 处的极限不存在，因此地板函数在 3 处不连续；但其函数值与从右侧的极限一致。

```check
same(floor(Rational(27, 10)), 2); same(floor(3), 3); same(floor(-Rational(27, 10)), -3); same(floor(Rational(7, 2)), 3)
limit_is(floor(x), x, 3, 2, '-'); limit_is(floor(x), x, 3, 3, '+')
```

::: definition 一侧连续性和区间上的连续性
若 $\lim_{x\to a^+} f(x) = f(a)$，则函数 $f$ 在 $a$ 处**右连续**；若 $\lim_{x\to a^-} f(x) = f(a)$，则它在 $a$ 处**左连续**。

如果 $f$ 在 $I$ 的每个点连续，就说它**在区间** $I$ 上连续。若端点属于 $I$，在该点只需从 $I$ 所在的一侧连续：左端点只要求右连续，右端点只要求左连续。
:::

因此 $\lfloor x\rfloor$ 在每一个整数处都是右连续的，并且在每个区间 $[n, n + 1)$ 上连续，但在 $[n, n + 1]$ 上不连续：在 $n + 1$ 处它不是左连续的。平方根函数只在 $x \ge 0$ 上有定义，因此在 0 处只有一个方向有效：$\lim_{x\to0^+}\sqrt x = 0 = \sqrt0$，并且 $\sqrt x$ 在 $[0, \infty)$ 上连续（第 3.2 节）。由于极限存在的充要条件是左右极限都存在且相等（模块 2），$f$ 在 $a$ 处连续当且仅当它在该点处左右都连续。

阶梯函数在计算中无处不在：一个显示整数度数的数字温度计，向下取整，当真实温度为 $T$ 时显示 $\lfloor T\rfloor$，并且在每一个整数度数处都会跳跃。

::: pitfall
从图中读出单侧连续性。每个步骤 $y = \lfloor x\rfloor$ 在其左端都有实心点，$(n, n)$，并且从那里向右延伸：因此 $\lfloor x\rfloor$ 是右连续的。称其为“左连续”是因为点在左边是常见的错误。
:::

### 不连续性的种类 {#kinds}

不连续性有几种类型（图 3.1），名称来源于图像在该点附近的行为。

::: figure id=fig-03-1
在 $x = 2$ 处有四种不连续性。可去的：$g$（例 3.1）的图像趋向于 $(2, 4)$，但 $g(2) = 1$；移动一个点可以填补空洞。跳跃的：$k$ 从两侧不同的高度到达。无限的：$1/(x - 2)^2$ 在虚线附近无界增长。振荡的：$\sin\big(1/(x - 2)\big)$ 在接近 2 的地方无限次地在 $-1$ 和 1 之间摆动。
:::

::: definition 不连续性的种类
设 $a$ 是 $f$ 的一个不连续点。该不连续性

- 是 **可去的** 如果 $\lim_{x\to a} f(x)$ 存在；
- 是一个 **跳跃的** 如果两个单侧极限都存在但不同；
- **无穷间断**：当 $x$ 至少从一侧趋近 $a$ 时，$f(x)$ 会最终超过任何指定的数，或最终小于任何指定的数（第 3.6 节用 $\lim_{x\to a^+} f(x) = \infty$、$\lim_{x\to a^-} f(x) = -\infty$ 等记号表示）；
- **摆动** 在所有其他情况下：此时至少有一个单侧极限不存在，但不趋于无穷，例如当 $f$ 在值之间不断摆动时；
:::

可去间断点可以通过在单点 $a$ 处定义或重新定义 $f$ 来消除：设 $f(a) = \lim_{x\to a} f(x)$。这修复了例3.1中的 $g$：在2处给它赋值4。没有单个值能够修复其他三种类型，因为在那些点 $\lim_{x\to a} f(x)$ 不存在；

::: example 分类间断点
找出并分类以下函数的间断点

- (a) $r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$，即[例 1.5](module_01_ZH.html#rational)中的有理函数；
- (b) $s(x) = \dfrac{\abs{x}}{x}$;
- (c) $q(x) = \dfrac{\sin x}{x}$.

**(a)** 模块 1 已将分子和分母分解因式，得 $r(x) = \dfrac{(x - 2)(x + 2)}{(x - 2)(x + 1)}$。所以 $r$ 在 2 和 $-1$ 处无定义，在其他每个 $x$ 处都有 $r(x) = \dfrac{x + 2}{x + 1}$。第 3.2 节说明 $r$ 在除此两点之外的各点都连续。在 2 处，把 2 代入约分后的式子，得到

$$\lim_{x\to2} r(x) = \lim_{x\to2}\frac{x + 2}{x + 1} = \frac43,$$

所以间断点是可去的：模块 1 找到的即是该点的“空洞”$\big(2, \tfrac43\big)$。在 $-1$ 处，分子 $x + 2$ 趋近于 1，分母 $x + 1$ 趋近于 0，因此 $r$ 的值无界增长：无限间断点（第 3.6 节找出单侧极限）。

**(b)** $s$ 在 0 处未定义。它在 $x < 0$ 处为 $-1$，在 $x > 0$ 处为 $1$，因此，如模块 2 所示，$\lim_{x\to0^-} s(x) = -1$ 和 $\lim_{x\to0^+} s(x) = 1$：0 是跳跃间断点。

**(c)**$q$ 在 0 处未定义，且模块 2 证明了 $\lim_{x\to0}\dfrac{\sin x}{x} = 1$。因此 0 是一个可去间断点：$\dfrac{\sin x}{x}$，在 0 处给定值 1，函数在 0 处连续。这个修复后的函数是信号处理中的**sinc** 函数（一些书将 $\pi x$ 替换为 $x$）。

```check
rr = (x**2 - 4)/(x**2 - x - 2)
same(factor(x**2 - x - 2), (x - 2)*(x + 1)); same(cancel(rr), (x + 2)/(x + 1))
same_set(solve(x**2 - x - 2, x), [2, -1])
limit_is(rr, x, 2, Rational(4, 3)); same(((x + 2)/(x + 1)).subs(x, 2), Rational(4, 3))
limit_is(x + 2, x, -1, 1); limit_is(x + 1, x, -1, 0)
limit_is(rr, x, -1, oo, '+'); limit_is(rr, x, -1, -oo, '-')
xr = symbols('x', real=True)
sx = Abs(xr)/xr
limit_is(sx, xr, 0, -1, '-'); limit_is(sx, xr, 0, 1, '+')
same(sx.subs(xr, 5), 1); same(sx.subs(xr, -5), -1)
limit_is(sin(x)/x, x, 0, 1)
```
:::

::: pitfall
分母为零并不总是意味着无穷间断点：$r$ 的分母在 2 处为零，但分子也为零，因子 $x - 2$ 可约去，因此间断点是可去的。先因式分解并约去，再判断。间断点的类型取决于 $a$ 附近的极限，而不是 $f(a)$：$s$ 和 $q$ 在 0 处都未定义，但类型不同。
:::

## 哪些函数是连续的 {#continuous-functions}

检查每个点的三个条件将永远不会结束。一些定理可以一次性确定由模块 1 中函数库构建的所有函数的连续性。

### 和、积与商 {#laws}

::: theorem 连续性法则
如果 $f$ 和 $g$ 在 $a$ 处连续，且 $c$ 是常数，那么函数

$$f + g, \qquad f - g, \qquad cf, \qquad fg$$

函数在 $a$ 处连续，如果 $f/g$ 在 $g(a) \ne 0$ 处也连续。单侧连续同样成立，区间上的连续也是如此。
:::

::: proof
每个陈述都是 模块 2 中极限法则的另一种表达方式。对于乘积法则：由于 $\lim_{x\to a} f(x) = f(a)$ 和 $\lim_{x\to a} g(x) = g(a)$ 都连续，乘积法则给出

$$\begin{aligned} \lim_{x\to a} f(x)\,g(x) &= \lim_{x\to a} f(x) \cdot \lim_{x\to a} g(x) \\ &= f(a)\,g(a), \end{aligned}$$

说明 $fg$ 在 $a$ 处连续。和、差以及常数倍的法则同样适用。商法则要求分母的极限不为零，而这里分母的极限是 $\lim_{x\to a} g(x) = g(a) \ne 0$。（因此 $g(x) \ne 0$ 在 $x$ 接近 $a$ 时成立，且 $f/g$ 在 $a$ 的一个开区间内有定义。）单侧极限同样遵循这些法则，从而得到单侧结论。
:::

::: theorem 多项式和有理函数
每个多项式在 $\R$ 上都是连续的。每个有理函数在其定义域内的每个点都是连续的。
:::

::: proof
这是 模块 2 中直接代入定理的新说法。对于多项式 $p$ 和每个数 $a$，$\lim_{x\to a} p(x) = p(a)$。对于有理函数 $p/q$ 和其定义域中的某个数 $a$，$q(a) \ne 0$，并且 $\lim_{x\to a} p(x)/q(x) = p(a)/q(a)$。每个陈述都表示极限等于函数值：在 $a$ 处连续。
:::

这完成了例3.2：$r$ 在除了2和$-1$以外的所有数处都是连续的。

### 目录是连续的 {#catalogue}

::: theorem 标准函数的连续性
这些函数在其定义域内的每个数（在偶次根函数的定义域的端点0处，从右边）都是连续的：

- 根 $\sqrt[n]{x}$，对于整数 $n \ge 2$；
- 三角函数 $\sin x$， $\cos x$， $\tan x$， $\cot x$， $\sec x$ 和 $\csc x$；
- 指数函数 $a^x$，对于 $a > 0$；
- 对数 $\log_a x$，对于 $a > 0$ 且 $a \ne 1$；特别是 $\ln x$。
:::

这里解释了每个函数族的连续性原因：正弦、余弦和根函数的证明，以及指数和对数函数证明的思路。初次阅读时，您可以信任这个定理。

**正弦和余弦。** 模块 2 已证明，当 $h \to 0$ 时 $\sin h \to 0 = \sin 0$、$\cos h \to 1 = \cos 0$，所以正弦和余弦在 0 处连续。对于任意其他数 $a$，写成 $x = a + h$，于是当 $x \to a$ 时 $h \to 0$。用[第 1.4 节](module_01_ZH.html#trig)的加法公式和这两个极限，可得

$$\begin{aligned} \sin(a + h) &= \sin a\cos h + \cos a\sin h \\ &\to \sin a \cdot 1 + \cos a \cdot 0 = \sin a. \end{aligned}$$

用同样的方式 $\cos(a + h) = \cos a\cos h - \sin a\sin h \to \cos a$。因此，正弦和余弦在 $\R$ 上连续，其余四个函数，由这两个函数构造的商函数，在分母不为 0 的地方连续（定理 3.1）：在其定义域上。

```check
limit_is(sin(h), h, 0, 0); limit_is(cos(h), h, 0, 1); same(sin(0), 0); same(cos(0), 1)
same(expand_trig(sin(a + h)), sin(a)*cos(h) + cos(a)*sin(h)); same(expand_trig(cos(a + h)), cos(a)*cos(h) - sin(a)*sin(h))
same((sin(a)*cos(h) + cos(a)*sin(h)).subs(h, 0), sin(a)); same((cos(a)*cos(h) - sin(a)*sin(h)).subs(h, 0), cos(a))
```

**根。** 根据模块 2 的根法则，$\lim_{x\to a}\sqrt[n]{x} = \sqrt[n]{a}$ 对于每个 $a > 0$，并且对于每个 $a$ 当 $n$ 为奇数时。在 0 处，偶次根从右边连续：$\sqrt[n]{x} < \varepsilon$ 当 $0 \le x < \varepsilon^n$ 时，这即是 ε–δ 条件，其中 $\delta = \varepsilon^n$。

```check
ap = symbols('a', positive=True); nr = symbols('n', positive=True, integer=True); ep = symbols('epsilon', positive=True)
limit_is(sqrt(x), x, ap, sqrt(ap)); limit_is(real_root(x, 3), x, -8, -2); limit_is(sqrt(x), x, 0, 0, '+')
same((ep**nr)**(1/nr), ep)                      # x < epsilon^n gives x^(1/n) < epsilon
```

**指数和对数。** 对于无理数 $x$ 如 $\sqrt2$，模块 1 定义 $a^x$ 为 $a^{1.4}, a^{1.41}, a^{1.414}, \dots$ 趋近于某个数。使这个定义精确化，就显示出 $a^x$ 是连续的；这属于分析课程的内容，本系列将其作为已知。对数 $\log_a$ 是 $a^x$ 的反函数，因此其图像为 $a^x$ 在直线 $y = x$ ([定理 1.2](module_01_ZH.html#inverse)) 中的镜像图像，而镜像图像保持连续性。这是分析课程中一个事实的证明思路：严格递增或递减区间上的连续函数的反函数也是连续的 ([练习 1.10](module_01_ZH.html#ex-1-10))。

::: keyidea
由模块 1 中的函数目录，使用 $+$、$-$、$\times$、$\div$ 以及复合运算（如下）构造的每一个函数在其定义域内的每一个区间上都是连续的。不连续性只能出现在公式失效的地方（如分母为零、对数为 0）或在分段定义改变表达式的地方。
:::

::: pitfall
"在定义域上连续" 不等于 "在整个定义域上连续"。$1/x$ 和 $\tan x$ 在它们定义域内的每个数处都是连续的，书籍称它们为连续函数；然而它们在 0 和 $\pi/2$ 处有无穷间断点，这些点不在它们的定义域内，图像是断裂的。被问到一个函数在何处连续，应给出区间：$1/x$ 在 $(-\infty, 0)$ 和 $(0, \infty)$ 上连续，但在 $[-1, 1]$ 上不连续。
:::

### 复合 {#composition}

大多数公式是将一个函数嵌套在另一个函数内部：$\sqrt{9 - x^2}$，$\ln(1 + \cos x)$，$e^{(\sin x)/x}$。只要外层函数是连续的，极限就可以被移到这样的嵌套结构内部。

::: theorem 复合函数的极限
如果 $\lim_{x\to a} g(x) = b$ 并且 $f$ 在 $b$ 处连续，那么

$$\lim_{x\to a} f\big(g(x)\big) = f(b) = f\Big(\lim_{x\to a} g(x)\Big).$$

一阶极限的情况也适用，以及当 $x \to \infty$ 或 $x \to -\infty$ 趋近于无穷时的极限（第 3.7 节）。
:::

用文字来说：如果内层函数趋近于 $b$，并且外层函数在 $b$ 处连续，那么复合函数就趋近于 $f(b)$。证明见下方“深入理解”框中的内容。使用 $b = g(a)$，该定理给出了复合函数的规则：

::: theorem 复合函数的连续性
如果 $g$ 在 $a$ 处连续，且 $f$ 在 $g(a)$ 处连续，那么 $f \circ g$ 在 $a$ 处连续。
:::

::: proof
由于 $g$ 在 $a$ 处连续，$\lim_{x\to a} g(x) = g(a)$。由于 $f$ 在 $g(a)$ 处连续，定理 3.4 与 $b = g(a)$ 给出

$$\lim_{x\to a} f\big(g(x)\big) = f\big(g(a)\big),$$

这说明 $f \circ g$ 在 $a$ 处连续。
:::

例如，$\abs{x} = \sqrt{x^2}$，将 $x^2$ 与平方根函数的复合函数，在每一个 $x \ne 0$ 处连续，其中 $x^2 > 0$ 与平方根函数连续。在 0 处定理不适用，因为平方根函数仅在该点右侧连续；但 $\lim_{x\to0}\abs{x} = 0 = \abs{0}$，如 [例 2.9](module_02_ZH.html#squeeze) 所示。因此 $\abs{x}$ 在 $\R$ 上连续。

```check
xr2 = symbols('x', real=True); same(sqrt(xr2**2), Abs(xr2)); limit_is(Abs(x), x, 0, 0); same(Abs(0), 0)
xnz = symbols('x', real=True, nonzero=True); holds(xnz**2 > 0)
```

::: deeper 为什么极限可以进入连续函数
这里是定理 3.4 的证明，使用模块 2 中的 ε–δ 定义。设 $\varepsilon > 0$。由于 $f$ 在 $b$ 处连续，存在一个数 $\eta > 0$（$\eta$ 是希腊字母 eta）使得

$$\abs{u - b} < \eta \ \text{implies}\ \abs{f(u) - f(b)} < \varepsilon.$$

因为 $g(x) \to b$ 作为 $x \to a$，应用该极限的定义，以 $\eta$ 的角色扮演 $\varepsilon$，得到一个 $\delta > 0$，使得

$$0 < \abs{x - a} < \delta \ \text{implies}\ \abs{g(x) - b} < \eta.$$

连接这两个：如果 $0 < \abs{x - a} < \delta$，则 $u = g(x)$ 满足 $\abs{u - b} < \eta$，所以 $\abs{f(g(x)) - f(b)} < \varepsilon$。这就是 $\lim_{x\to a} f(g(x)) = f(b)$ 的定义。

$f$ 在 $b$ 处的连续性，而不仅仅是 $f$ 在 $b$ 处的极限，是需要的。令 $f(u) = 0$ 对于 $u \ne 0$ 和 $f(0) = 1$，并且令 $g(x) = 0$ 对于每个 $x$。那么 $\lim_{u\to0} f(u) = 0$，但是 $f(g(x)) = f(0) = 1$ 对于每个 $x$，所以 $\lim_{x\to0} f(g(x)) = 1$。证明失败是因为 $u = g(x)$ 可以等于 $b$，而 $f$ 在 $b$ 处的极限对 $f(b)$ 本身没有任何说明；连续性才有。
:::

::: example 它在何处连续？
找出每个函数在其定义域上的连续区间。

- (a) $f(x) = \dfrac{\sin x}{x^2 + 1}$
- (b) $g(x) = \sqrt{9 - x^2}$
- (c) $h(x) = \ln(1 + \cos x)$

**(a)** $\sin x$ 和 $x^2 + 1$ 在 $\R$ 上连续，且 $x^2 + 1 \ge 1$ 永远不为 0，因此根据商法则 $f$ 在 $\R$ 上连续。

**(b)** $g$ 是平方根函数 $\sqrt u$ 与 $u = 9 - x^2$ 的复合，定义域由 $9 - x^2 \ge 0$ 给出，即 $-3 \le x \le 3$。当 $-3 < x < 3$ 时，$u$ 为正，且 $\sqrt u$ 在任一正的 $u$ 处连续，所以由定理 3.5，$g$ 在 $x$ 处连续。在端点 3，当 $x \to 3^-$ 时，$u = 9 - x^2$ 通过正值趋近于 0；当 $u \to 0^+$ 时 $\sqrt u \to 0$，所以 $g(x) \to 0 = g(3)$。因此 $g$ 在 3 处左连续，同理在 $-3$ 处右连续，故在 $[-3, 3]$ 上连续。它的图像是圆 $x^2 + y^2 = 9$ 的上半部（参见[例 1.2](module_01_ZH.html#domains)）。

**(c)** $\ln u$ 在 $u > 0$ 和 $1 + \cos x$ 处连续，因此 $h$ 在 $1 + \cos x > 0$ 处连续。由于 $\cos x \ge -1$，$1 + \cos x \ge 0$，当且仅当 $\cos x = -1$ 时成立：在 $\pi$ 的奇数倍处，$x = \pm\pi, \pm3\pi, \dots$。因此 $h$ 在每一个相邻的 $\pi$ 的奇数倍之间的区间上连续：在 $(-\pi, \pi)$ 上，在 $(\pi, 3\pi)$ 上，依此类推。在 $\pi$ 的奇数倍处，$h$ 未定义，其值趋向于无穷大（第 3.6 节）。

```check
from sympy.calculus.util import continuous_domain, function_range
same([s_ for s_ in solve(x**2 + 1, x) if s_.is_real], []); same(function_range(x**2 + 1, x, S.Reals), Interval(1, oo))
same(solve_univariate_inequality(9 - x**2 >= 0, x, relational=False), Interval(-3, 3))
same(continuous_domain(sqrt(9 - x**2), x, S.Reals), Interval(-3, 3))
limit_is(9 - x**2, x, 3, 0, '-'); holds((9 - x**2).subs(x, Rational(29, 10)) > 0)
limit_is(sqrt(9 - x**2), x, 3, 0, '-'); limit_is(sqrt(9 - x**2), x, -3, 0, '+'); same(sqrt(9 - x**2).subs(x, 3), 0)
same(x**2 + sqrt(9 - x**2)**2, 9)                  # the graph lies on the circle x^2 + y^2 = 9
same(function_range(1 + cos(x), x, S.Reals), Interval(0, 2))
same(solveset(1 + cos(x), x, Interval(-6*pi, 6*pi)), FiniteSet(-5*pi, -3*pi, -pi, pi, 3*pi, 5*pi))
limit_is(log(1 + cos(x)), x, pi, -oo)
```
:::

::: example 连续性求极限
求 (a) $\displaystyle\lim_{x\to 1} \ln\frac{x^2 - 1}{x - 1}$ 和 (b) $\displaystyle\lim_{x\to0} e^{(\sin x)/x}$。

**(a)** 内层函数 $g(x) = \dfrac{x^2 - 1}{x - 1}$ 在 1 处未定义，但对于 $x \ne 1$，它等于 $\dfrac{(x - 1)(x + 1)}{x - 1} = x + 1$，因此 $\lim_{x\to1} g(x) = 2$。对数函数在 2 处连续，因此根据定理 3.4

$$\begin{aligned} \lim_{x\to 1} \ln\frac{x^2 - 1}{x - 1} &= \ln\Big(\lim_{x\to1}\frac{x^2 - 1}{x - 1}\Big) \\ &= \ln 2 \approx 0.6931. \end{aligned}$$

该定理需要内层极限存在，而不是内层函数连续：此处内层函数在 1 处有一个可去间断点。

**(b)** 与 $x \to 0$ 相同，指数 $\dfrac{\sin x}{x}$ 趋近于 1（模块 2），且 $e^u$ 在 1 处连续，因此

$$\lim_{x\to0} e^{(\sin x)/x} = e^1 = e \approx 2.718.$$

```check
same(factor(x**2 - 1), (x - 1)*(x + 1)); same(cancel((x**2 - 1)/(x - 1)), x + 1); limit_is((x**2 - 1)/(x - 1), x, 1, 2)
limit_is(log((x**2 - 1)/(x - 1)), x, 1, log(2)); rounds(log(2), '0.6931')
limit_is(sin(x)/x, x, 0, 1); limit_is(exp(sin(x)/x), x, 0, E); rounds(E, '2.718')
```
:::

::: pitfall
一个极限进入函数内部只有在该函数在内部极限处连续时才成立。地板函数在 1 处不连续：如 $x \to 0$，$\cos x \to 1$，但对于 $0 < \abs{x} < \pi/2$，$0 < \cos x < 1$，所以 $\lfloor\cos x\rfloor = 0$。因此 $\lim_{x\to0}\lfloor\cos x\rfloor = 0$，而非 $\lfloor 1\rfloor = 1$。

```check
limit_is(cos(x), x, 0, 1); limit_is(floor(cos(x)), x, 0, 0); same(floor(cos(0)), 1)
same(floor(cos(Rational(1, 10))), 0); same(floor(cos(-Rational(3, 2))), 0); holds(Rational(3, 2) < pi/2)
```
:::

## 介值定理 {#ivt}

从海拔 1200 米的小屋沿山路走到海拔 2100 米的山顶。无论山路如何曲折起伏，总会有某一刻你恰在海拔 1500 米处，因为海拔连续变化，从低于 1500 米到高于 1500 米的途中必会经过这个高度。同理，对于介于 $f(a)$ 与 $f(b)$ 之间的任意高度 $N$，相应的水平线必在 $a$ 与 $b$ 之间某处和连续函数的图像相交（图 3.2）。

::: figure id=fig-03-2
中值定理。左：$f$ 在 $[a, b]$ 上连续，且 $N$ 介于 $f(a)$ 和 $f(b)$ 之间，因此直线 $y = N$ 与图像相交，此处相交于三个点 $c_1$、$c_2$ 和 $c_3$。右：一个有跳跃间断点的图像可能会跳过高度 $N$，此时没有 $c$ 满足 $f(c) = N$。
:::

::: theorem 介值定理
假设 $f$ 在闭区间 $[a, b]$ 上连续，且 $N$ 是 $f(a)$ 和 $f(b)$ 之间的任意数，则存在至少一个 $c$ 属于 $(a, b)$，使得 $f(c) = N$。
:::

你最常使用的形式是关于根的。如果 $f$ 在 $[a, b]$ 上连续，且 $f(a)$ 和 $f(b)$ 符号相反，则 0 严格介于它们之间，因此方程 $f(x) = 0$ 在 $(a, b)$ 内有解。

假设是整个闭区间上的连续性，包括端点，且该区间的每一部分都是必需的：

- *缺少连续性时。* 当 $x < 0$ 时令 $f(x) = -1$，当 $x \ge 0$ 时令 $f(x) = 1$。在 $[-1, 1]$ 上有 $f(-1) = -1 < 0 < 1 = f(1)$，但 $f$ 始终不为 0，因为在 0 处的跳跃越过了 $-1$ 与 1 之间的所有值。
- *没有在端点处连续。* 设 $g(0) = -1$ 和 $g(x) = x$ 为 $0 < x \le 1$。则 $g$ 在 $(0, 1]$ 上连续，并且 $g(0) = -1 < 0 < 1 = g(1)$，但 $g(x) = x$ 对于每个 $x$ 在 $(0, 1]$ 中都是正的： $g$ 没有根。罪魁祸首是端点 0，因为在该点 $g$ 并不从右边连续，因为 $\lim_{x\to0^+} g(x) = 0 \ne g(0)$。

```check
fj = Piecewise((-1, x < 0), (1, True))
same(fj.subs(x, -1), -1); same(fj.subs(x, 1), 1); same(solveset(Eq(fj, 0), x, Interval(-1, 1)), S.EmptySet)
gj = Piecewise((-1, Eq(x, 0)), (x, True))
same(gj.subs(x, 0), -1); same(gj.subs(x, 1), 1); limit_is(x, x, 0, 0, '+'); holds(Ne(0, -1))
```

请注意定理并未说明的内容。它保证至少存在一个 $c$，而不是恰好一个：在图 3.2 中有三个。它也没有说明 $c$ 的位置：这是一个存在性定理。第 3.4 节将其转化为寻找 $c$ 的方法。

::: example 三次方程的根
证明方程 $x^3 - 2x - 5 = 0$ 在 2 和 3 之间有一个解。

设 $f(x) = x^3 - 2x - 5$。它是一个多项式，因此在 $[2, 3]$ 上连续（定理 3.2）。在区间端点处，

$$\begin{aligned} f(2) &= 8 - 4 - 5 = -1, \\ f(3) &= 27 - 6 - 5 = 16. \end{aligned}$$

由 $f(2) < 0 < f(3)$，将介值定理用于 $N = 0$，可知在 $(2, 3)$ 中存在一个数 $c$，使得 $f(c) = 0$。该定理只保证解在 $(2, 3)$ 内。由于 $f(2) = -1$ 比 $f(3) = 16$ 更接近 0，可以猜测 $c$ 更接近 2。第 3.4 节求出 $c \approx 2.0946$。

```check
fcub = x**3 - 2*x - 5
same(fcub.subs(x, 2), -1); same(8 - 4 - 5, -1); same(fcub.subs(x, 3), 16); same(27 - 6 - 5, 16)
root_cub = nsolve(fcub, x, 2.1)
holds(2 < root_cub < 3); rounds(root_cub, '2.0946')
```
:::

::: example 求解 $\cos x = x$
证明方程 $\cos x = x$ 有解，并找出一个长度为 1 的区间，该区间包含该解。

$\cos x = x$ 无法用代数方法直接求解。将它写成 $f(x) = 0$，其中 $f(x) = \cos x - x$。作为两个连续函数的差，它在 $\R$ 上连续（定理 3.1 和 3.3）。试代入几个值，角度仍用弧度：

$$\begin{aligned} f(0) &= \cos 0 - 0 = 1 > 0, \\ f(1) &= \cos 1 - 1 \approx 0.5403 - 1 \\ &= -0.4597 < 0. \end{aligned}$$

根据中间值定理，方程 $\cos x - x = 0$ 在 $(0, 1)$ 中有解。这类混合三角函数与多项式的方程在物理和工程中很常见，且没有解析解；第 3.4 节找出该解，约为 0.739。

```check
fcx = cos(x) - x
same(fcx.subs(x, 0), 1); rounds(cos(1), '0.5403'); rounds(cos(1) - 1, '-0.4597'); holds(cos(1) - 1 < 0)
root_cx = nsolve(fcx, x, 0.7); holds(0 < root_cx < 1); rounds(root_cx, '0.739')
```
:::

::: pitfall
在使用定理之前，请先检查整个区间上的连续性。 $\tan x$ 在 $[\pi/4, 3\pi/4]$ 上符号发生变化，从 $\tan(\pi/4) = 1$ 变到 $\tan(3\pi/4) = -1$，但它在那里没有零点（它的零点是 $\pi$ 的倍数）。它的图像并未穿过轴线；它在渐近线 $x = \pi/2$ 处从 $+\infty$ 跳跃到 $-\infty$，在那里 $\tan x$ 不连续。

```check
same(tan(pi/4), 1); same(tan(3*pi/4), -1); same(solveset(tan(x), x, Interval(pi/4, 3*pi/4)), S.EmptySet)
limit_is(tan(x), x, pi/2, oo, '-'); limit_is(tan(x), x, pi/2, -oo, '+')
```
:::

::: deeper 为什么中间值定理成立
一次初步阅读可以跳过这个证明。它将实数的一个性质作为公理，并由此证明其余性质。

假设 $f$ 在 $[a, b]$ 上连续，且 $f(a) < N < f(b)$。（若 $f(a) > N > f(b)$，可将同样的论证用于 $-f$ 和 $-N$。）把 $[a, b]$ 二等分。如果 $f$ 在中点取值 $N$，这个中点就是所求的 $c$。否则保留其中一半，使 $f$ 在该半区间的左端点低于 $N$，在右端点高于它。重复这一过程。或者某个中点恰好给出值 $N$，或者得到区间列 $[a_n, b_n]$，每个区间长度都是前一个的一半，对于每个 $n$ 有 $f(a_n) < N < f(b_n)$。这就是下一节的二分法，只是用 $N$ 代替 0。

左端点 $a_0 \le a_1 \le a_2 \le \cdots$ 永远不减少，右端点 $b_0 \ge b_1 \ge b_2 \ge \cdots$ 永远不增加，且宽度 $b_n - a_n = (b - a)/2^n$ 趋近于 0。此处的证明需要实数的 **完备性**：数轴上没有间隙，因此每个区间 $c$ 都存在一个数 $a_n \le c \le b_n$，对于每一个 $n$ 都成立。这是公理。（模块 14 将其作为单调收敛定理陈述：一个永不减少且始终低于固定上界的序列都有极限。此处 $c$ 是 $a_n$ 的极限。）

仍有待证明 $f(c) = N$。假设不成立，并挑战 $f$ 在 $c$ 处的连续性，用 $\varepsilon = \abs{f(c) - N}$。存在一个 $\delta > 0$，使得 $\abs{f(x) - f(c)} < \varepsilon$ 对于每个 $x$ 在 $[a, b]$ 中满足 $\abs{x - c} < \delta$：所有这些 $f(x)$ 都比 $N$ 更接近 $f(c)$，因此它们位于 $N$ 的同一侧，与 $f(c)$ 一致。取 $n$ 足够大，使得 $b_n - a_n < \delta$。由于 $c$ 位于 $[a_n, b_n]$ 中，两端都在 $c$ 的 $\delta$ 范围内，因此 $f(a_n)$ 和 $f(b_n)$ 位于 $N$ 的同一侧。但是 $f(a_n) < N < f(b_n)$。因此 $f(c) = N$。最后，$c$ 既不是 $a$ 也不是 $b$，因为 $f(a) \ne N \ne f(b)$。

完备性至关重要。仅在有理数范围内，该定理是不成立的：$x^2 - 2$ 在 1 处为负，在 2 处为正，但不存在有理数 $c$ 满足 $c^2 = 2$，因为 $\sqrt2$ 是无理数；区间 $[a_n, b_n]$ 逐渐逼近那个间隙，其中 $\sqrt2$ 应该存在。实分析课程要么构建实数并证明完备性，要么将其作为公理，如这里所示。
:::

## 二分法 {#bisection}

中间值定理说明 $x^3 - 2x - 5$ 在 $(2, 3)$ 内有一个根，但具体位置不确定。**二分法** 通过反复应用该定理来找到这个根：将区间一分为二，并保留符号发生变化的那一半。

::: definition 二分法
设 $f$ 在 $[a, b]$ 上连续，且 $f(a)$ 与 $f(b)$ 符号相反。以 **括号** $[a_0, b_0] = [a, b]$ 作为初始区间。对于 $n = 0, 1, 2, \dots$：

1. 计算中点 $m_n = \dfrac{a_n + b_n}{2}$ 和函数值 $f(m_n)$。
2. 如果 $f(m_n) = 0$，停止：$m_n$ 是一个根。
3. 如果 $f(m_n)$ 与 $f(a_n)$ 符号相同，新的括号是 $[a_{n+1}, b_{n+1}] = [m_n, b_n]$；否则是 $[a_{n+1}, b_{n+1}] = [a_n, m_n]$。

停止当括号的宽度达到你所需精度。
:::

将 $a_n$ 读作 "a sub n"。步骤 3 总是保持一个区间，其中 $f$ 的两端符号相反，因此，根据中间值定理，每个区间包含一个根（图 3.3）。

::: figure id=fig-03-3
对 $f(x) = x^2 - 2$ 使用二分法，从 $[1, 2]$ 开始，其中 $f(1) = -1 < 0 < 2 = f(2)$。每个区间 $[a_n, b_n]$ 是其上一个区间的半个：即 $f$ 符号发生变化的那一半。每个区间包含根 $\sqrt2$（虚线），并且经过六步后，区间 $[1.40625, 1.421875]$ 的宽度为 $1/64$。
:::

::: example 用二分法计算 $\sqrt2$
在 $f(x) = x^2 - 2$ 上使用二分法，从 $[1, 2]$ 开始，以确定 $\sqrt2$，即 $f$ 的正根。进行六步计算。

$f$ 是连续的并且 $f(1) = -1 < 0 < 2 = f(2)$，因此方法可以开始。对于 $n = 0$，$m_0 = 1.5$ 和 $f(1.5) = 2.25 - 2 = 0.25$，正数像 $f(b_0)$：根位于左半部分，$[a_1, b_1] = [1, 1.5]$。对于 $n = 1$，$m_1 = 1.25$ 和 $f(1.25) = 1.5625 - 2 = -0.4375$，负数像 $f(a_1)$：根位于右半部分，$[a_2, b_2] = [1.25, 1.5]$。继续以相同的方式进行，将 $f(m_n)$ 四舍五入到四位有效数字：

| $n$ | $a_n$ | $b_n$ | $m_n$ | $f(m_n)$ |
|---|---|---|---|---|
| 0 | 1 | 2 | 1.5 | 0.25 |
| 1 | 1 | 1.5 | 1.25 | −0.4375 |
| 2 | 1.25 | 1.5 | 1.375 | −0.1094 |
| 3 | 1.375 | 1.5 | 1.4375 | 0.06641 |
| 4 | 1.375 | 1.4375 | 1.40625 | −0.02246 |
| 5 | 1.40625 | 1.4375 | 1.421875 | 0.02173 |
| 6 | 1.40625 | 1.421875 | 1.4140625 | −0.0004272 |

经过六步后，根位于 $[a_6, b_6] = [1.40625, 1.421875]$，一个宽度为 $\tfrac{1}{64} = 0.015625$ 的区间内。两个端点都开始于 1.4，因此 $\sqrt2 = 1.4\ldots$ 是确定的；第二位小数尚未确定，因为端点开始于 1.40 和 1.42。中点 $m_6 = 1.4140625$ 位于 $\sqrt2$ 的一半宽度内，$\tfrac{1}{128} = 0.0078125$。实际上 $\sqrt2 = 1.41421356\ldots$，因此 $m_6$ 的误差仅约为 0.00015：这是最坏情况下的保证。

```check
f_bis = lambda t: t**2 - 2
A_, B_ = Rational(1), Rational(2)
rows = []
for k_ in range(7):
    M_ = (A_ + B_)/2
    rows.append((k_, A_, B_, M_, f_bis(M_)))
    if sign(f_bis(M_)) == sign(f_bis(A_)):
        A_ = M_
    else:
        B_ = M_
shown = [(1, 2, '1.5', '0.25'), (1, '1.5', '1.25', '-0.4375'), ('1.25', '1.5', '1.375', '-0.1094'), ('1.375', '1.5', '1.4375', '0.06641'),
         ('1.375', '1.4375', '1.40625', '-0.02246'), ('1.40625', '1.4375', '1.421875', '0.02173'), ('1.40625', '1.421875', '1.4140625', '-0.0004272')]
for (k_, a_k, b_k, m_k, fm_k), (sa, sb, sm, sf) in zip(rows, shown):
    same(a_k, Rational(str(sa))); same(b_k, Rational(str(sb))); same(m_k, Rational(sm))
    rounds(fm_k, sf); holds(sign(fm_k) == sign(Rational(sf)))
same(rows[0][4], Rational(1, 4)); same(rows[1][4], -Rational(7, 16))           # exactly 0.25 and -0.4375
same(Rational(15, 10)**2 - 2, Rational(1, 4)); same(Rational(125, 100)**2, Rational(15625, 10000))
A6, B6 = rows[6][1], rows[6][2]                                                  # the bracket after six steps
same((A6, B6), (Rational(140625, 100000), Rational(1421875, 1000000))); same(B6 - A6, Rational(1, 64)); same(Rational(1, 64), Rational(15625, 1000000))
same((B6 - A6)/2, Rational(1, 128)); same(Rational(1, 128), Rational(78125, 10000000))
holds(A6 < sqrt(2) < B6); rounds(sqrt(2), '1.41421356'); rounds(abs(rows[6][3] - sqrt(2)), '0.00015')
same((floor(10*A6), floor(10*B6)), (14, 14)); same((floor(100*A6), floor(100*B6)), (140, 142))   # 1.4 is certain; 1.40 and 1.42 differ
```
:::

表中的 $f(m_n)$ 值是四舍五入的，但方法所使用的符号，全部都是精确的。

::: theorem 二分法的误差
设 $f$ 在 $[a, b]$ 上连续，且 $f(a)$ 和 $f(b)$ 符号相反。如果二分法尚未在精确根处停止，则经过 $n$ 步后，区间 $[a_n, b_n]$ 包含 $f$ 的一个根 $r$，并且

$$b_n - a_n = \frac{b - a}{2^n}, \quad \abs{m_n - r} \le \frac{b - a}{2^{n+1}}.$$
:::

::: proof
方法的第 3 步保持一半的区间，该区间两端的 $f$ 符号相反：如果 $f(m_n)$ 与 $f(a_n)$ 符号相同，则其与 $f(b_n)$ 符号相反，新的区间是 $[m_n, b_n]$；否则 $f(m_n)$，其不为 0，与 $f(a_n)$ 符号相反，新的区间是 $[a_n, m_n]$。因此，对于每一个 $n$，$f(a_n)$ 和 $f(b_n)$ 符号相反。由于 $f$ 在 $[a_n, b_n]$ 上连续，且 $[a, b]$ 是其一部分，中间值定理给出 $r$ 在 $(a_n, b_n)$ 中。每一步将区间宽度减半，因此经过 $n$ 步后，宽度为 $(b - a)/2^n$。最后，一个区间中点距离该区间内所有点的距离不超过该区间宽度的一半，特别是距离 $r$。

$$\abs{m_n - r} \le \frac12\cdot\frac{b - a}{2^n} = \frac{b - a}{2^{n+1}}.$$
:::

因此，二分法具有大多数数值方法所缺乏的保证：你事先就知道需要多少步才能达到所需的精度。为了得到 $\abs{m_n - r} \le \varepsilon$，只需要 $(b - a)/2^{n+1} \le \varepsilon$，也就是说，

$$2^{n+1} \ge \frac{b - a}{\varepsilon}.$$

::: example 需要多少步？
从 $[1, 2]$ 开始进行多少次二分法步骤，才能保证中点 $m_n$ 与 $\sqrt2$ 之间的距离不超过 $10^{-6}$？

这里 $b - a = 1$，因此条件是 $2^{n+1} \ge 10^6$。由于 $2^{19} = 524{,}288$ 太小而 $2^{20} = 1{,}048{,}576$ 足够大，$n + 1 = 20$：经过 $n = 19$ 步后，$m_{19}$ 与 $\sqrt2$ 之间的距离不超过 $2^{-20} \approx 9.5 \times 10^{-7}$。用对数表示，$n + 1 \ge \log_2 10^6 \approx 19.93$。

每一步增加一个二进制位。由于 $2^{10} = 1024 \approx 10^3$，十步大约增加三个十进制位，因此每个十进制位大约需要 $3.3$ 步。二分法是在数轴上的二分查找，计数方式与 [第1.4节](module_01_ZH.html#logarithms)：在一个包含一百万项的有序列表中进行二分查找需要大约20步，原因相同。

```check
same(2**19, 524288); same(2**20, 1048576); holds(2**19 < 10**6); holds(2**20 >= 10**6)
rounds(Rational(1, 2**20), '9.5e-7'); rounds(log(10**6, 2), '19.93')
same(2**10, 1024); rounds(1/log(2, 10), '3.3')
```
:::

**优缺点。** 二分法在其假设成立时总是有效，并且有误差保证。 但其收敛速度较慢，每一步仅增加一个二进制位的精度，无论函数如何；牛顿法（模块 7）通常每一步将正确数字的数量翻倍，尽管它有时会失败。 二分法需要符号变化，因此无法找到函数图像接触轴而不穿过轴的根，如 $(x - 1)^2$ 在 1 处的情况；并且当一个区间包含多个根时，它只能找到其中一个。

::: pitfall
二分法需要连续性，正如其定理所要求的那样。在 $[1, 2]$，$f(x) = \tan x$ 包含 $f(1) \approx 1.557 > 0$ 和 $f(2) \approx -2.185 < 0$，并且二分法收敛到 $1.5708\ldots = \pi/2$，即渐近线，而 $\tan x$ 在那里根本没有根。警告信号出现在值 $f(m_n)$ 中：它们并没有趋向于 0，而是从 $f(m_0) \approx 14.1$ 增长到 $f(m_3) \approx 120.5$ 和 $f(m_6) \approx 2067$。请在下面的控件中尝试一下。

```check
rounds(tan(1), '1.557'); rounds(tan(2), '-2.185'); holds(tan(1) > 0); holds(tan(2) < 0)
rounds(pi/2, '1.5708'); holds(1 < pi/2 < 2); same(solveset(tan(x), x, Interval(1, 2)), S.EmptySet)
At, Bt, mt = Rational(1), Rational(2), []
for k_ in range(7):
    Mt = (At + Bt)/2; mt.append(Mt)
    if sign(tan(Mt)) == sign(tan(At)): At = Mt
    else: Bt = Mt
same((mt[0], mt[3], mt[6]), (Rational(3, 2), Rational(25, 16), Rational(201, 128)))
rounds(tan(mt[0]), '14.1'); rounds(tan(mt[3]), '120.5'); rounds(tan(mt[6]), '2067'); holds(At < pi/2 < Bt)
```
:::

::: widget name=bisection
从 $x^2 - 2$ 开始于 $[1, 2]$。按 **Step**按六次，将表格与例 3.7 比较；阴影带是夹逼区间。按**Run 10 步 **：现在 $\sqrt2$ 确定的十进制数有多少？选择 $x^3 - 2x - 5$ 在 $[2, 3]$（例 3.5）和 $\cos x - x$ 在 $[0, 1]$（例 3.6）。对于 $x^2 - 2$，设置 $a = -2$： $f(-2)$ 和 $f(2)$ 符号相同，因此方法无法开始，尽管 $[-2, 2]$ 包含两个根。选择 $x^3 - x$ 在 $[-2, 3]$，其中包含三个根：方法会找到哪一个？最后选择 $\tan x$ 在 $[1, 2]$，观察在无连续性的情况下会发生什么。
:::

::: compute Python 中的二分法
该方法在 Python 中只需几行代码。此函数运行 `n` 步并返回最终的括号，或者如果遇到精确根 `m`，则返回该对 `(m, m)`：

```python
def bisection(f, a, b, n):
    """n steps of the bisection method on [a, b]; returns the last bracket."""
    if f(a) * f(b) >= 0:
        raise ValueError("f(a) and f(b) must have opposite signs")
    for _ in range(n):
        m = (a + b) / 2
        if f(m) == 0:
            return m, m                    # an exact root
        if (f(m) > 0) == (f(a) > 0):       # same sign as f(a): keep [m, b]
            a = m
        else:                              # otherwise keep [a, m]
            b = m
    return a, b

print(bisection(lambda x: x**2 - 2, 1, 2, 6))
```

```output
(1.40625, 1.421875)
```

这是例 3.7 中的夹逼区间 $[a_6, b_6]$。根据例 3.8，19 步可使 $\sqrt2$ 精确到 $10^{-6}$；将中点的实际误差与保证值 $2^{-20}$ 进行比较：

```python
import math
a, b = bisection(lambda x: x**2 - 2, 1, 2, 19)
m = (a + b) / 2
print(m, abs(m - math.sqrt(2)), 2**-20)
```

```output
1.4142141342163086 5.718432134482754e-07 9.5367431640625e-07
```

实际误差小于保证值，这通常如此。同样的函数满足例3.5和3.6中的方程，$x^3 - 2x - 5 = 0$ 和 $\cos x = x$。从宽度为1的区间出发，经过30步后，每个中点都与根的距离在 $2^{-31} \approx 4.7 \times 10^{-10}$ 以内：

```python
a, b = bisection(lambda x: x**3 - 2*x - 5, 2, 3, 30)
print((a + b) / 2)
a, b = bisection(lambda x: math.cos(x) - x, 0, 1, 30)
print((a + b) / 2)
```

```output
2.094551481772214
0.7390851336531341
```

没有符号变化时，该方法拒绝开始。$(x - 1)^2$ 在1处有一个根，但在两侧都是正的：

```python fails
bisection(lambda x: (x - 1)**2, 0, 3, 10)
```

```output
ValueError: f(a) and f(b) must have opposite signs
```

最后，浮点数（模块2）设定了一个限制。在1和2之间，它们之间的距离为 $2^{-52} \approx 2.2 \times 10^{-16}$，因此从 $[1, 2]$ 出发经过52步后，括号的两端成为相邻的浮点数，进一步的步骤不会改变结果：

```python
a, b = bisection(lambda x: x**2 - 2, 1, 2, 60)
print(a, b, b - a)
```

```output
1.414213562373095 1.4142135623730951 2.220446049250313e-16
```
:::

```check
rounds(Rational(1, 2**52), '2.2e-16'); rounds(Rational(1, 2**31), '4.7e-10')
```

## 极值定理 {#evt}

一整天，从午夜到午夜，室外温度有一个最高值和一个最低值，每个值在一天中的某个时刻达到。这并不是关于天气的事实：它适用于任何在闭区间上的连续函数。

::: definition 最大值和最小值
设 $f$ 在一个区间 $I$ 上定义。对于 $c$ 中的某个 $I$，数 $f(c)$ 是 $f$ 在 $I$ 上的 **最大值**，如果对于 $x$ 中的每一个 $I$，都有 $f(x) \le f(c)$。对于 $d$ 中的某个 $I$，数 $f(d)$ 是 $f$ 在 $I$ 上的 **最小值**，如果对于 $x$ 中的每一个 $I$，都有 $f(x) \ge f(d)$。它们合起来是 $f$ 在 $I$ 上的 **极值**。
:::

最大值必须是 $f$ 实际取到的数 $f(c)$。函数值只能趋近的数不能算作最大值。模块 8 将这里的最大值和最小值称为全局最大值和全局最小值，并用导数来求它们。

::: theorem 极值定理
如果 $f$ 在一个闭区间 $[a, b]$ 上连续，那么 $f$ 在 $[a, b]$ 上有最大值和最小值：存在 $c$ 和 $d$ 在 $[a, b]$ 中，使得对于 $x$ 中的每一个 $[a, b]$，

$$f(d) \le f(x) \le f(c).$$
:::

该定理的证明同样依赖于实数的完备性，但其证明过程比中间值定理的证明更为复杂；它属于实分析课程的内容，而本系列将直接使用该定理而不进行证明。你现在可以理解为何每个假设都是必要的（图3.4）：

- *闭区间。* $f(x) = x$ 在开区间 $(0, 1)$ 上连续，但在此区间内没有最大值：对于任意 $x$ 在 $(0, 1)$ 内，数 $\tfrac{x + 1}{2}$ 也在 $(0, 1)$ 内，并且更大。函数值趋近于 1，但达到 1 的端点却缺失。同样地，也没有最小值。
- *连续性。* 在 $[0, 1]$ 上，设 $f(x) = x$ 对于 $0 \le x < 1$ 和 $f(1) = 0$。同样地，函数值趋近于 1 但未达到 1：在 1 处，$f$ 从左侧不连续，函数值骤降至 0。这个 $f$ 有最小值 0，但没有最大值。
- 一个有界的区间。$[0, \infty)$ 包含它的左端点但没有右端点，因此不是一个闭区间 $[a, b]$。在该区间上，$f(x) = \dfrac{x}{x + 1} = 1 - \dfrac{1}{x + 1}$ 是连续的，并且随着 $x$ 的增加而增加，逐渐接近 1（第 3.7 节）但并未达到。每一个值都会被后面的值所超越：没有最大值。

::: figure id=fig-03-4
极值定理。左：$f(x) = x^2 - 4x + 1$ 在闭区间 $[0, 3]$ 上连续，并达到最大值 1（在 0 处）和最小值 $-3$（在 2 处），如例 3.9 所示。中间：$x$ 在开区间 $(0, 1)$ 上既没有最大值也没有最小值；空心点表示缺失的端点。右：$f(x) = x$ 对于 $0 \le x < 1$ 和 $f(1) = 0$ 在 1 处不连续，其值趋近于 1 但并未达到。
:::

```check
half = lambda X: (X + 1)/2
xs_ = symbols('x', positive=True)
holds(half(Rational(9, 10)) > Rational(9, 10)); holds(half(Rational(9, 10)) < 1)
same(simplify(half(x) - x), (1 - x)/2)
same(simplify(1 - x/(x + 1)), 1/(x + 1)); holds(1/(xs_ + 1) > 0); limit_is(x/(x + 1), x, oo, 1)
same(x/(x + 1), 1 - 1/(x + 1)); dx_ = symbols('d', positive=True)
same((1 - 1/(xs_ + dx_ + 1)) - (1 - 1/(xs_ + 1)), dx_/((xs_ + 1)*(xs_ + dx_ + 1))); holds(dx_/((xs_ + 1)*(xs_ + dx_ + 1)) > 0)   # f(x + d) > f(x): f increases
fe_ = Piecewise((x, x < 1), (0, True)); same(fe_.subs(x, 1), 0); limit_is(x, x, 1, 1, '-'); same(fe_.subs(x, 0), 0)
```

该定理说明极值存在，但不保证在以下位置存在：在区间的端点，如图 3.4 中的最大值，或在区间内部，如最小值。在最优化中，它保证存在最佳选择：一个依赖于连续设置的成本函数，在每个设置的闭区间内都有一个最便宜的设置。模块 8 展示了如何找到它。

::: example 该定理适用吗？
判断极值定理是否保证存在最大值和最小值，并找出你能够找到的这些值。

- (a) $f(x) = x^2 - 4x + 1$ on $[0, 3]$
- (b) $g(x) = \dfrac{1}{x - 1}$ on $[2, 4]$
- (c) 同一个 $g$ 在 $[0, 2]$ 上

**(a)** $f$ 是一个多项式，在闭区间 $[0, 3]$ 上连续，因此定理保证两者都存在。为了找到它们，完成平方： $f(x) = (x - 2)^2 - 3$。由于 $(x - 2)^2 \ge 0$，仅在 $x = 2$ 处取等号，因此最小值是 $f(2) = -3$。在 $[0, 3]$ 上，$(x - 2)^2$ 最大值出现在 $x$ 最远离 2 的点，即 $x = 0$，因此最大值是 $f(0) = 1$。（在另一端，$f(3) = -2$。）

**(b)** $g$ 在 $x \ne 1$ 处连续，在特别是在闭区间 $[2, 4]$ 上连续，因此定理适用。随着 $x$ 增加，$x - 1$ 增加而 $\dfrac{1}{x - 1}$ 减少，因此最大值是 $g(2) = 1$，最小值是 $g(4) = \tfrac13$。

**(c)** $g$ 在 1 处无定义，而 1 属于 $[0, 2]$，所以 $g$ 在 $[0, 2]$ 上不连续，定理不适用。事实上，$g$ 在那里没有极值：当 $x$ 从右趋近于 1 时，$\dfrac{1}{x - 1}$ 会超过任何拟定的最大值；从左趋近时会低于任何拟定的最小值。

```check
f39 = x**2 - 4*x + 1
same(expand((x - 2)**2 - 3), f39); same(f39.subs(x, 2), -3); same(f39.subs(x, 0), 1); same(f39.subs(x, 3), -2)
same(minimum(f39, x, Interval(0, 3)), -3); same(maximum(f39, x, Interval(0, 3)), 1)
g39 = 1/(x - 1)
same(maximum(g39, x, Interval(2, 4)), 1); same(minimum(g39, x, Interval(2, 4)), Rational(1, 3))
same(g39.subs(x, 2), 1); same(g39.subs(x, 4), Rational(1, 3))
limit_is(g39, x, 1, oo, '+'); limit_is(g39, x, 1, -oo, '-')
```
:::

::: pitfall
两张纸条。"$f$ 在 $(0, 1)$ 上连续，因此有最大值"是错误的，如 $f(x) = x$ 所示：定理需要一个闭区间 $[a, b]$。当假设条件不成立时，定理对结果不做任何保证：在开区间 $(-1, 2)$ 上，$x^2$ 的最小值为 0，但没有最大值。

```check
same(minimum(x**2, x, Interval.open(-1, 2)), 0); limit_is(x**2, x, 2, 4, '-')
```
:::

## 无限极限与垂直渐近线 {#infinite-limits}

模块 1 指出 $1/x$ 的值在 0 附近“变得很大”，“右边为正，左边为负”，并承诺本模块将研究这种行为。以下是 $1/x$ 和 $1/x^2$ 的数值：

```valuetable
x = -0.1, -0.01, -0.001, 0.001, 0.01, 0.1
$\dfrac{1}{x}$ = 1/x
$\dfrac{1}{x^2}$ = 1/x**2
---
x | \dfrac{1}{x} | \dfrac{1}{x^2}
-0.1 | -10 | 100
-0.01 | -100 | 10000
-0.001 | -1000 | 1\times10^{6}
0.001 | 1000 | 1\times10^{6}
0.01 | 100 | 10000
0.1 | 10 | 100
```

当 $x$ 从任一侧趋近于 0 时，$1/x^2$ 会超过 100，10,000，一百万，以及你选择的任何界限 $M$，并且保持在该界限之上。模块 2 显示，没有任何数是它的极限；但是极限以如此确定的方式不存在，以至于它拥有自己的符号表示。

::: definition 无限极限与垂直渐近线
设 $f$ 在包含 $a$ 的开区间上定义，除了可能在 $a$ 本身处。那么

$$\lim_{x\to a} f(x) = \infty,$$

读作“$f$ 在 $x$ 处当 $x$ 趋近于 $a$ 时的极限是无穷大”，意味着无论你选择什么数 $M$，$f(x) > M$ 对于足够接近 $a$ 的每一个 $x \ne a$（接近程度取决于 $M$）。同样 $\lim_{x\to a} f(x) = -\infty$ 表示，无论你选择什么数 $M$，$f(x) < M$ 对于足够接近 $a$ 的每一个 $x \ne a$。单侧无穷极限，如 $\lim_{x\to a^+} f(x) = \infty$，只考虑 $x$ 在 $a$ 一侧的情况。

直线 $x = a$ 是 $f$ 图像的 **垂直渐近线**，如果 $\lim_{x\to a^-} f(x)$ 和 $\lim_{x\to a^+} f(x)$ 至少有一个单侧极限是 $\infty$ 或 $-\infty$。
:::

所以 $\lim_{x\to0} 1/x^2 = \infty$。对于 $1/x$ 两侧不一致，

$$\lim_{x\to0^+}\frac1x = \infty, \qquad \lim_{x\to0^-}\frac1x = -\infty,$$

并且 $1/x$ 在 0 处没有极限，甚至没有无穷大的极限。两个图像都有垂直渐近线 $x = 0$：在接近该渐近线时，图像沿着直线向上或向下无限延伸。写作 $\lim f(x) = \infty$ 并不使 $\infty$ 成为一个数。极限仍然不存在；这种记号记录了极限失败的方式。

```check
limit_is(1/x**2, x, 0, oo); limit_is(1/x, x, 0, oo, '+'); limit_is(1/x, x, 0, -oo, '-')
same((1/x**2).subs(x, Rational(1, 1000)), 10**6); same((1/x**2).subs(x, Rational(1, 100)), 10**4)
```

大多数垂直渐近线来自于一个分式，其分母趋于 0 而分子不趋于 0。一个非零数除以一个极小的数会得到一个极大的数，而符号决定这个极大数是正无穷还是负无穷：

::: theorem 非零除以零
假设 $\lim_{x\to a^+} f(x) = L$ 是一个具有 $L \ne 0$ 的数，以及 $\lim_{x\to a^+} g(x) = 0$。如果 $g(x) > 0$ 对于某个区间 $(a, a + \delta)$ 内的每一个 $x$，则

$$\begin{aligned} \lim_{x\to a^+}\frac{f(x)}{g(x)} &= \infty \quad \text{if } L > 0, \\ \lim_{x\to a^+}\frac{f(x)}{g(x)} &= -\infty \quad \text{if } L < 0. \end{aligned}$$

如果相反 $g(x) < 0$ 在这样的一个区间内，两个符号会交换。对于左侧极限和双边极限也是如此。
:::

::: proof
取 $L > 0$ 和 $g(x) > 0$；其他情况类似。由于 $f(x) \to L$，对于 $x$ 足够接近 $a$（且大于 $a$）$f(x)$ 在 $\tfrac{L}{2}$ 内 $L$，因此 $f(x) > \tfrac{L}{2}$。现在令 $M > 0$ 为任意数。由于 $g(x) \to 0$ 通过正数，对于 $x$ 足够接近 $a$ 时 $0 < g(x) < \tfrac{L}{2M}$ 也成立。对于这样的 $x$，两者都成立，并且

$$\frac{f(x)}{g(x)} > \frac{L/2}{L/(2M)} = M.$$

所以 $f(x)/g(x)$ 在 $x$ 足够接近 $a$ 时会超过每一个 $M$：它的极限是 $\infty$。
:::

```check
Lp, Mp = symbols('L M', positive=True)
same((Lp/2)/(Lp/(2*Mp)), Mp)
```

::: example 单侧无穷极限
求下列函数在指定点的单侧极限和垂直渐近线：(a) $r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$ 在 $-1$；(b) $\ln x$ 在 0；(称) $\tan x$ 在 $\pi/2$。

**(a)** 对于 $x$ 接近 $-1$（以及 $x \ne -1$），$r(x) = \dfrac{x + 2}{x + 1}$（例 3.2）。分子趋于 1，为正数，分母趋于 0。对于 $x$ 略大于 $-1$，$x + 1 > 0$；对于 $x$ 略小于，$x + 1 < 0$。根据定理 3.9，

$$\begin{aligned} \lim_{x\to-1^+} r(x) &= \infty, \\ \lim_{x\to-1^-} r(x) &= -\infty, \end{aligned}$$

且直线 $x = -1$ 是垂直渐近线。分母的另一个零点 2 并不产生渐近线：在该点极限为 $\tfrac43$（例 3.2），且图像在该点有一个空点。

**(b)** $\ln x$ 仅在 $x > 0$ 时有定义，因此只有右侧极限有意义。由于 $\ln$ 是递增的且 $\ln e^{-M} = -M$，$\ln x$ 小于 $-M$ 恰好当 $0 < x < e^{-M}$。因此，$\ln x$ 一旦 $-M$ 足够接近 0，就会低于任何数 $x$：

$$\lim_{x\to0^+}\ln x = -\infty,$$

且 $y$ 轴是 $y = \ln x$ 的垂直渐近线，如 [图 1.3](module_01_ZH.html#fig-01-3) 所示。

**(c)** 当 $x \to \pi/2$ 时，有 $\sin x \to 1$ 与 $\cos x \to 0$。从单位圆可知，当 $x$ 略小于 $\pi/2$ 时，$\cos x$ 为正；当 $x$ 略大于该角时，它为负。根据定理 3.9，

$$\begin{aligned} \lim_{x\to\pi/2^-}\tan x &= \infty, \\ \lim_{x\to\pi/2^+}\tan x &= -\infty, \end{aligned}$$

所以 $x = \pi/2$ 是 $y = \tan x$ 的垂直渐近线，同样，每一条 $x = \pi/2 + k\pi$ 都是，因为 $\tan$ 的周期是 $\pi$。

```check
limit_is(rr, x, -1, oo, '+'); limit_is(rr, x, -1, -oo, '-'); same((x + 2).subs(x, -1), 1)
holds((x + 1).subs(x, -Rational(99, 100)) > 0); holds((x + 1).subs(x, -Rational(101, 100)) < 0)
limit_is(rr, x, 2, Rational(4, 3))
Mr = symbols('M', real=True); same(log(exp(-Mr)), -Mr); limit_is(log(x), x, 0, -oo, '+')
limit_is(sin(x), x, pi/2, 1); limit_is(cos(x), x, pi/2, 0)
holds(cos(pi/2 - Rational(1, 100)) > 0); holds(cos(pi/2 + Rational(1, 100)) < 0)
limit_is(tan(x), x, pi/2, oo, '-'); limit_is(tan(x), x, pi/2, -oo, '+'); same(tan(x + pi), tan(x))
```
:::

::: pitfall
$\infty$ 不是一个数，因此不能用它进行计算。如果 $f(x) \to \infty$ 和 $g(x) \to \infty$，那么 $f(x) - g(x)$ 可以做任何事情。当 $x \to 0$ 趋于无穷时， $\dfrac{1}{x^2} + 1$ 和 $\dfrac{1}{x^2}$ 都趋于 $\infty$，它们的差为 1； $\dfrac{2}{x^2}$ 和 $\dfrac{1}{x^2}$ 都趋于 $\infty$，它们的差 $\dfrac{1}{x^2}$ 趋于 $\infty$，它们的商为 2。因此，“$\infty - \infty = 0$”和“$\infty/\infty = 1$”是错误的。这种形式是 **不定形式**：它们的值取决于函数，模块 7 展示了如何求解。并且不要写 $\lim_{x\to0} 1/x = \infty$：两边不一致。

```check
same((1/x**2 + 1) - 1/x**2, 1); same(2/x**2 - 1/x**2, 1/x**2); limit_is(2/x**2 - 1/x**2, x, 0, oo)
limit_is(1/x**2 + 1, x, 0, oo); limit_is((2/x**2)/(1/x**2), x, 0, 2)
```
:::

## 无穷远处的极限与渐近线 {#limits-at-infinity}

现在让 $x$ 而不是 $f(x)$ 趋向于无穷大。这里是例 3.2 中的函数 $r$，远离原点时的情形：

```valuetable
x = -1000, -100, -10, 10, 100, 1000
$r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$ = (x**2 - 4)/(x**2 - x - 2)
---
x | r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}
-1000 | 0.998999
-100 | 0.989899
-10 | 0.888889
10 | 1.09091
100 | 1.00990
1000 | 1.00100
```

当 $x$ 增大，无论是正还是负，$r(x)$ 都趋于 1：对于非常大的正 $x$，从上方趋近；对于非常大的负 $x$，从下方趋近。被约去的形式说明了这一点：对于 $x \ne 2$ 和 $x \ne -1$，

$$r(x) = \frac{x + 2}{x + 1} = 1 + \frac{1}{x + 1},$$

而 $\dfrac{1}{x + 1}$ 随着 $x$ 的增大趋向于 0。当 $x > -1$ 为正时，它为正；当 $x < -1$ 为负时，它为负，这解释了为何 $r(x)$ 在右侧从上方趋近 1，在左侧从下方趋近 1。

```check
same(cancel(rr), 1 + 1/(x + 1)); limit_is(1/(x + 1), x, oo, 0); limit_is(1/(x + 1), x, -oo, 0)
limit_is(rr, x, oo, 1); limit_is(rr, x, -oo, 1)
```

::: definition 无穷远处的极限与水平渐近线
设 $f$ 在区间 $(c, \infty)$ 上定义，则

$$\lim_{x\to\infty} f(x) = L,$$

当 $x$ 趋于无穷大时，$f$ 的 $x$ 的极限是 $L$，这意味着通过取 $x$ 足够大，$f(x)$ 可以任意接近 $L$。对于在区间 $(-\infty, c)$ 上定义的 $f$，$\lim_{x\to-\infty} f(x) = L$ 的含义相同，只是 $x$ 是足够大的负数。线 $y = L$ 是 $f$ 图像的 **水平渐近线**，如果 $\lim_{x\to\infty} f(x) = L$ 或 $\lim_{x\to-\infty} f(x) = L$。

同样地，$\lim_{x\to\infty} f(x) = \infty$ 表示，无论你选择什么数 $M$，对于足够大的 $x$，$f(x) > M$ 都成立；对于 $-\infty$ 也是如此。
:::

因此，线 $y = 1$ 是 $r$ 在两端的水平渐近线（图 3.5）。极限法则、夹逼定理和定理 3.4 对于无穷大的极限同样成立，证明方法相同。

所有内容都基于一个基本极限：对于每一个 $p > 0$，

$$\lim_{x\to\infty}\frac{1}{x^p} = 0.$$

确实，对于 $x > 0$，$\dfrac{1}{x^p} < \varepsilon$ 恰好当 $x^p > \dfrac{1}{\varepsilon}$，即当 $x > \varepsilon^{-1/p}$；因此，对于足够大的 $x$，$1/x^p$ 在 0 的 $\varepsilon$ 范围内。对于整数 $k \ge 1$，也 $1/x^k \to 0$ 如 $x \to -\infty$，因为 $\abs{1/x^k} = 1/\abs{x}^k$。

```check
pp = symbols('p', positive=True); ep = symbols('epsilon', positive=True)
same((ep**(-1/pp))**pp, 1/ep); limit_is(1/x**pp, x, oo, 0)
for k_ in (1, 2, 3):
    limit_is(1/x**k_, x, -oo, 0)
```

### 有理函数 {#rational-at-infinity}

为了求有理函数在无穷远处的极限，将分子和分母都除以分母中最高次幂的 $x$；然后，分母中还留有 $x$ 的每一项都趋于 0。只有主导项起作用：

::: theorem 有理函数在无穷远处
设

$$f(x) = \frac{a_m x^m + \dots + a_1x + a_0}{b_n x^n + \dots + b_1x + b_0},$$

用 $a_m \ne 0$ 和 $b_n \ne 0$，使得分子的次数为 $m$，分母的次数为 $n$。当 $x \to \infty$ 趋于无穷时，以及当 $x \to -\infty$ 趋于无穷时， $f(x)$ 的行为类似于主导项的比值 $\dfrac{a_m x^m}{b_n x^n}$：

- 如果 $m < n$，则 $f(x) \to 0$，且 $x$ 轴是一条水平渐近线；
- 如果 $m = n$，则 $f(x) \to \dfrac{a_m}{b_n}$，且直线 $y = \dfrac{a_m}{b_n}$ 是一条水平渐近线；
- 如果 $m > n$，则 $f(x) \to \infty$ 或 $-\infty$，符号由 $\dfrac{a_m}{b_n}x^{m-n}$ 决定，且不存在水平渐近线。
:::

::: proof
将 $x \ne 0$ 的分子和分母中的首项提出来：

$$\begin{aligned} f(x) &= \frac{a_m x^m}{b_n x^n} \cdot Q(x), \quad\text{where} \\ Q(x) &= \frac{1 + c_1/x + \dots + c_m/x^m}{1 + d_1/x + \dots + d_n/x^n} \end{aligned}$$

并且 $c_k = a_{m-k}/a_m$ 和 $d_k = b_{n-k}/b_n$ 是常数。如 $x \to \pm\infty$ 所示，每一项 $c_k/x^k$ 和 $d_k/x^k$ 都趋于 0，因此 $Q(x)$ 趋于 $\dfrac{1 + 0 + \dots + 0}{1 + 0 + \dots + 0} = 1$。第一个分数等于 $\dfrac{a_m}{b_n}x^{m-n}$：如果 $m < n$，它趋于 0；如果 $\dfrac{a_m}{b_n}$，它是常数 $m = n$；如果 $m > n$，它趋于 $\infty$ 或 $-\infty$。在最后一种情况中，一个无界增长的因子与一个趋于 1 的因子的乘积也会无界增长，且符号相同。
:::

```check
pr = (3*x**2 + 2*x + 1)/(5*x**2 - x + 4)                      # m = n = 2: c1 = 2/3, c2 = 1/3, d1 = -1/5, d2 = 4/5
same(pr, (3*x**2/(5*x**2))*(1 + Rational(2, 3)/x + Rational(1, 3)/x**2)/(1 - Rational(1, 5)/x + Rational(4, 5)/x**2))
limit_is(pr, x, oo, Rational(3, 5)); limit_is(pr, x, -oo, Rational(3, 5))
```

::: example 有理函数在无穷远处
求

- (a) $\displaystyle\lim_{x\to\infty}\frac{6x^3 - 5x + 1}{2x^3 + x^2}$
- (b) $\displaystyle\lim_{x\to-\infty}\frac{4x - 7}{x^2 + 1}$
- (c) $\displaystyle\lim_{x\to-\infty}\frac{x^3 - 2}{3x^2 + 5}$

**(a)** 次数相等，分别为 3 和 3。将分子和分母都除以 $x^3$：

$$\begin{aligned} \frac{6x^3 - 5x + 1}{2x^3 + x^2} &= \frac{6 - 5/x^2 + 1/x^3}{2 + 1/x} \\ &\to \frac{6 - 0 + 0}{2 + 0} = 3. \end{aligned}$$

直线 $y = 3$ 是水平渐近线，正如定理 3.10 所预测的：$3 = 6/2$，即首项系数的比值。

**(b)** 分子次数为 1，分母次数为 2：除以 $x^2$：

$$\frac{4x - 7}{x^2 + 1} = \frac{4/x - 7/x^2}{1 + 1/x^2} \to \frac{0 - 0}{1 + 0} = 0.$$

$x$ 轴是水平渐近线（在两端都成立，因为相同的计算适用于 $x \to \infty$）。

**(c)** 三次多项式除以二次多项式。最高次项的比值是 $\dfrac{x^3}{3x^2} = \dfrac{x}{3}$，当 $x \to -\infty$ 时趋于 $-\infty$。因此，根据定理 3.10，

$$\lim_{x\to-\infty}\frac{x^3 - 2}{3x^2 + 5} = -\infty,$$

并且左侧没有水平渐近线（同样右侧也没有，因为极限是 $\infty$）。

```check
fa11 = (6*x**3 - 5*x + 1)/(2*x**3 + x**2)
same(fa11, (6 - 5/x**2 + 1/x**3)/(2 + 1/x)); limit_is(fa11, x, oo, 3); same(Rational(6, 2), 3)
fb11 = (4*x - 7)/(x**2 + 1)
same(fb11, (4/x - 7/x**2)/(1 + 1/x**2)); limit_is(fb11, x, -oo, 0); limit_is(fb11, x, oo, 0)
fc11 = (x**3 - 2)/(3*x**2 + 5)
same(x**3/(3*x**2), x/3); limit_is(fc11, x, -oo, -oo); limit_is(fc11, x, oo, oo)
```
:::

根需要一个额外的概念：$\sqrt{x^2} = \abs{x}$，而不是$x$（[小节 1.4](module_01_ZH.html#roots)) 的陷阱），对于$x < 0$，$\abs{x} = -x$。

::: example 两个不同的水平渐近线
求 $f(x) = \dfrac{\sqrt{4x^2 + 1}}{x - 3}$ 的水平渐近线。

根号下的主导项是 $4x^2$，因此将 $x^2$ 提出根号：对于 $x \ne 0$，

$$\begin{aligned} \sqrt{4x^2 + 1} &= \sqrt{x^2\Big(4 + \frac{1}{x^2}\Big)} \\ &= \abs{x}\sqrt{4 + \frac{1}{x^2}}. \end{aligned}$$

对于 $x > 3$，$\abs{x} = x$；将分子和分母都除以 $x$。当 $x \to \infty$ 时，

$$f(x) = \frac{\sqrt{4 + 1/x^2}}{1 - 3/x} \to \frac{\sqrt4}{1} = 2,$$

利用平方根在 4 处的连续性（定理 3.4）。对于 $x < 0$，$\abs{x} = -x$，并且

$$\begin{aligned} f(x) &= \frac{-x\sqrt{4 + 1/x^2}}{x - 3} \\ &= -\frac{\sqrt{4 + 1/x^2}}{1 - 3/x}, \end{aligned}$$

这个表达式趋向于 $-\sqrt4/1 = -2$ 作为 $x \to -\infty$。因此，该图像有两个水平渐近线：$y = 2$ 在右侧，$y = -2$ 在左侧。忽略 $\abs{x}$ 的符号会导致左侧错误地得到答案 2。（此外，根据定理 3.9，还有垂直渐近线 $x = 3$：分子在该点趋向于 $\sqrt{37} \ne 0$。）

```check
f12 = sqrt(4*x**2 + 1)/(x - 3)
xpos = symbols('x', positive=True); xneg = symbols('x', negative=True)
same(sqrt(xpos**2*(4 + 1/xpos**2)), xpos*sqrt(4 + 1/xpos**2)); same(sqrt(xneg**2*(4 + 1/xneg**2)), -xneg*sqrt(4 + 1/xneg**2))
same(xpos*sqrt(4 + 1/xpos**2)/(xpos - 3), sqrt(4 + 1/xpos**2)/(1 - 3/xpos))
same(-xneg*sqrt(4 + 1/xneg**2)/(xneg - 3), -sqrt(4 + 1/xneg**2)/(1 - 3/xneg))
limit_is(f12, x, oo, 2); limit_is(f12, x, -oo, -2)
same(sqrt(4*x**2 + 1).subs(x, 3), sqrt(37)); limit_is(f12, x, 3, oo, '+'); limit_is(f12, x, 3, -oo, '-')
```
:::

### 指数函数、对数函数和振荡 {#other-limits}

**指数函数。** 设 $a > 1$，并写 $a = 1 + q$ 为 $q > 0$。则 $a^n = (1 + q)^n \ge 1 + nq$ 对于每一个整数 $n \ge 1$ 都成立。这是一个等式对于 $n = 1$；如果它对于某个 $n$ 成立，两边同时乘以正数 $1 + q$ 就表明它对于 $n + 1$ 也成立：

$$\begin{aligned} (1 + q)^{n+1} &\ge (1 + nq)(1 + q) \\ &= 1 + (n + 1)q + nq^2 \\ &\ge 1 + (n + 1)q. \end{aligned}$$

因此它对于 $n = 2$ 成立，接着对于 $n = 3$ 成立，以此类推对于每一个 $n$ 都成立。因此 $a^n$ 超过任何数 $M$ 一旦 $n > M/q$，并且由于 $a^x$ 随着 $x$ 增加，对于每一个 $a > 1$

$$\begin{aligned} \lim_{x\to\infty} a^x &= \infty, \\ \lim_{x\to-\infty} a^x &= \lim_{x\to-\infty}\frac{1}{a^{-x}} = 0. \end{aligned}$$

对于 $0 < a < 1$，两个极限的顺序被交换了。特别是 $e^x \to \infty$ 当 $x \to \infty$ 趋于无穷时，$e^x \to 0$ 趋于无穷时，$x \to -\infty$：$x$ 轴是 $y = e^x$ 在左侧的水平渐近线，如 [图 1.3](module_01_ZH.html#fig-01-3)] 所示。

**对数。** $\ln x$ 也会无界增长，但速度缓慢：当 $x > e^M$ 时，正好等于 $\ln x > M$，因此 $\ln x \to \infty$ 随着 $x \to \infty$ 增长，但要超过 100， $x$ 必须超过 $e^{100} \approx 2.7 \times 10^{43}$。

**振荡。** 当 $\sin x$ 趋于无穷时，$x \to \infty$ 没有极限：它在 $-1$ 和 1 之间持续摆动。但 $\dfrac{\sin x}{x} \to 0$，根据夹逼定理：对于 $x > 0$，

$$-\frac1x \le \frac{\sin x}{x} \le \frac1x,$$

且两个上界都趋于 0。同样地 $e^{-x}\sin x \to 0$，被 $-e^{-x}$ 和 $e^{-x}$ 夹逼：一种衰减振荡，如同拨动的弦的振动或开关断开后电路中的电流，最终趋于 0。

```check
qp = symbols('q', positive=True); np_ = symbols('n', positive=True, integer=True)
same(expand((1 + np_*qp)*(1 + qp)), 1 + (np_ + 1)*qp + np_*qp**2)
for nq in (1, 5, 20):
    holds((1 + qp)**nq >= 1 + nq*qp)                                  # Bernoulli's inequality, a few cases
# SymPy 1.14 gets limit(a**x, x, -oo) wrong, so limits at -oo are checked as limits at oo with x -> -x:
limit_is(2**x, x, oo, oo); limit_is(2**(-x), x, oo, 0); same(2**(-x), 1/2**x); limit_is(exp(x), x, oo, oo); limit_is(exp(-x), x, oo, 0)
limit_is((Rational(1, 2))**x, x, oo, 0); limit_is((Rational(1, 2))**(-x), x, oo, oo)
Mr2 = symbols('M', real=True); same(log(exp(Mr2)), Mr2); limit_is(log(x), x, oo, oo)
rounds(exp(100), '2.7e43')
limit_is(sin(x)/x, x, oo, 0); limit_is(1/x, x, oo, 0); limit_is(exp(-x)*sin(x), x, oo, 0); limit_is(exp(-x), x, oo, 0)
```

::: pitfall
一个图可以跨越其水平渐近线，甚至无限次：$\dfrac{\sin x}{x}$ 在每一个非零倍数的 $\pi$ 处都是 0。渐近线描述的是图在远处的行为；它并不是一条图永远无法触及的线。

```check
same((sin(x)/x).subs(x, 5*pi), 0); same((sin(x)/x).subs(x, 100*pi), 0)
```
:::

### 斜渐近线 {#oblique}

当分子的次数比分母的次数恰好大 1 时，一个有理函数会无界增长，但方向是确定的：它的图会趋近于一条斜线。

::: definition 斜渐近线
线 $y = mx + c$，具有 $m \ne 0$，是函数 $f$ 图像的 **斜渐近线**（或称斜渐或斜线渐近线），如果

$$\begin{aligned} \lim_{x\to\infty}\big[f(x) - (mx + c)\big] &= 0 \quad\text{or} \\ \lim_{x\to-\infty}\big[f(x) - (mx + c)\big] &= 0. \end{aligned}$$
:::

括号中的值是图与该直线之间的垂直距离，且该距离趋于 0。对于一个分子次数比分母次数大 1 的有理函数 $p/q$，进行除法运算：$p(x) = q(x)(mx + c) + s(x)$，余数 $s$ 的次数低于 $q$（即使用学校代数中的多项式长除法，或下例中提到的技巧）。然后

$$\frac{p(x)}{q(x)} = mx + c + \frac{s(x)}{q(x)},$$

且 $\dfrac{s(x)}{q(x)} \to 0$ 当 $x \to \pm\infty$ 时，根据定理 3.10，所以 $y = mx + c$ 在两端都是斜渐近线。

::: example 斜渐近线
求 $f(x) = \dfrac{x^2 + 1}{x - 1}$ 的渐近线，并确定图像在每条渐近线的哪一侧。

将 $x^2 + 1$ 除以 $x - 1$。这里有一个技巧可以避免长除法：$x^2 + 1 = (x^2 - 1) + 2 = (x - 1)(x + 1) + 2$。因此，对于 $x \ne 1$，

$$f(x) = x + 1 + \frac{2}{x - 1}.$$

当 $x \to \pm\infty$，$\dfrac{2}{x - 1} \to 0$，所以 $y = x + 1$ 是在两端的斜渐近线。对于 $x > 1$，$\dfrac{2}{x - 1} > 0$，所以图像位于渐近线之上；对于 $x < 1$，图像位于渐近线之下。在 $x = 1$ 处，分子是 $2 \ne 0$，分母趋于 0，右侧为正，左侧为负，因此根据定理 3.9

$$\lim_{x\to1^+} f(x) = \infty, \qquad \lim_{x\to1^-} f(x) = -\infty,$$

和 $x = 1$ 是垂直渐近线。没有水平渐近线：$f(x) \to \infty$ 当 $x \to \infty$ 且 $f(x) \to -\infty$ 当 $x \to -\infty$。图 3.5 显示了图像及其渐近线。

```check
f13 = (x**2 + 1)/(x - 1)
steps(x**2 + 1, (x**2 - 1) + 2, (x - 1)*(x + 1) + 2); same(div(x**2 + 1, x - 1), (x + 1, 2))
same(f13, x + 1 + 2/(x - 1)); limit_is(f13 - (x + 1), x, oo, 0); limit_is(f13 - (x + 1), x, -oo, 0)
holds((2/(x - 1)).subs(x, 2) > 0); holds((2/(x - 1)).subs(x, 0) < 0); same((x**2 + 1).subs(x, 1), 2)
limit_is(f13, x, 1, oo, '+'); limit_is(f13, x, 1, -oo, '-'); limit_is(f13, x, oo, oo); limit_is(f13, x, -oo, -oo)
```
:::

::: figure id=fig-03-5
渐近线。左图：$r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$ 的例子 3.2 和 3.10，包含垂直渐近线 $x = -1$，水平渐近线 $y = 1$ 以及在 $\big(2, \tfrac43\big)$ 处的空洞。右图：$f(x) = \dfrac{x^2 + 1}{x - 1}$ 的例子 3.13，包含垂直渐近线 $x = 1$ 和斜渐近线 $y = x + 1$；函数图像在 $x > 1$ 时位于斜渐近线之上，在 $x < 1$ 时位于斜渐近线之下。
:::

::: compute 渐近线与连续性使用 SymPy
在 SymPy 中，$\infty$ 是 `sp.oo`。这里是例子 3.12 在两端以及 3 的两侧的极限：

```python
import sympy as sp
x = sp.symbols('x')
f = sp.sqrt(4*x**2 + 1)/(x - 3)
print(sp.limit(f, x, sp.oo), sp.limit(f, x, -sp.oo))
print(sp.limit(f, x, 3, '+'), sp.limit(f, x, 3, '-'))
```

```output
2 -2
oo -oo
```

如模块 2 所警告的，单侧极限需要其方向：没有指定时，`limit` 从右侧趋近。为了查看函数的连续性，`continuous_domain` 列出了区间；这里是例子 3.2 的函数 $r$：

```python
from sympy.calculus.util import continuous_domain
r = (x**2 - 4)/(x**2 - x - 2)
print(continuous_domain(r, x, sp.S.Reals))
```

```output
Union(Interval.open(-oo, -1), Interval.open(-1, 2), Interval.open(2, oo))
```

`Interval.open(-oo, -1)` 是开区间 $(-\infty, -1)$：$r$ 在除了 $-1$ 和 2 以外的所有点都是连续的。答案没有说明每个点的间断类型，对于复杂的公式 `continuous_domain` 可能是错误的，因此请将其与你自己的推导进行比较。对于斜渐近线，`sp.div` 将一个多项式除以另一个多项式，返回商和余数：

```python
q, s = sp.div(x**2 + 1, x - 1)                  # Example 3.13
print(q, s)
print(sp.limit((x**2 + 1)/(x - 1) - q, x, sp.oo))
```

```output
x + 1 2
0
```

商 $x + 1$ 是渐近线，最后一行确认了它到该渐近线的距离趋于 0。
:::

::: deeper 精确的定义
模块 2 用 ε 和 δ 精确地定义了 "$f(x)$ 当 $x$ 趋于 $a$ 时趋于 $L$"。本模块的新极限也是用相同的方式精确定义的。

- $\lim_{x\to a} f(x) = \infty$ 表示：对于每一个数 $M$，存在一个 $\delta > 0$，使得 $f(x) > M$ 当 $0 < \abs{x - a} < \delta$ 时成立。
- $\lim_{x\to\infty} f(x) = L$ 表示：对于每一个 $\varepsilon > 0$，存在一个数 $N$，使得 $\abs{f(x) - L} < \varepsilon$ 当 $x > N$ 时成立。
- $\lim_{x\to\infty} f(x) = \infty$ 表示：对于每一个数 $M$，存在一个数 $N$，使得 $f(x) > M$ 当 $x > N$ 时成立。

其他情况（$-\infty$，单侧极限，$x \to -\infty$）会以显而易见的方式改变不等式。例如，$\lim_{x\to0} 1/x^2 = \infty$：给定 $M > 0$，取 $\delta = 1/\sqrt M$；如果 $0 < \abs{x} < \delta$，则 $x^2 < \delta^2 = 1/M$，因此 $1/x^2 > M$。
:::

```check
Mq = symbols('M', positive=True); same((1/sqrt(Mq))**2, 1/Mq); same(1/(1/Mq), Mq)
```

## 增长阶 {#growth}

函数 $\ln x$、$x^2$、$2^x$ 以及阶乘都趋于 $\infty$，但增长速度差异很大，这些差异决定了计算机在实践中能做什么。在几个整数处比较它们 $n$。这里 $n!$，读作 "$n$ 阶乘"，是乘积 $1 \cdot 2 \cdot 3 \cdots n$，即把 $n$ 个物体排成一行的方式数目：

```valuetable
n = 10, 20, 50, 100
$\log_2 n$ = log(n, 2)
$n^2$ = n**2
$2^n$ = 2**n
$n!$ = factorial(n)
digits = 4
layout = columns
---
n | \log_2 n | n^2 | 2^n | n!
10 | 3.322 | 100 | 1024 | 3.629\times10^{6}
20 | 4.322 | 400 | 1.049\times10^{6} | 2.433\times10^{18}
50 | 5.644 | 2500 | 1.126\times10^{15} | 3.041\times10^{64}
100 | 6.644 | 10000 | 1.268\times10^{30} | 9.333\times10^{157}
```

对数几乎不变，$n^2$ 稳定增长，而 $2^n$ 和 $n!$ 则爆炸性增长：$100!$ 有 158 位数字。为了精确比较增长速度，比较它们的比值。

```check
same(len(str(factorial(100))), 158); same(factorial(4), 1*2*3*4)
```

::: definition 增长阶
设当 $x$ 充分大时，$f$ 和 $g$ 都为正。如果下述条件成立，就称当 $x \to \infty$ 时 $f$ **比 $g$ 增长得慢**，记作 $f \ll g$，读作「f 远小于 g」：

$$\lim_{x\to\infty}\frac{f(x)}{g(x)} = 0.$$

对于在整数上定义的函数 $n$，例如 $n!$，当 $n \to \infty$ 时，极限意味着相同，其中 $n$ 依次经过 $1, 2, 3, \dots$；模块 14 研究此类序列的极限。
:::

目前来看，$f$ 是 $g$ 的一个可以忽略不计的分数：最终低于 1%，或 0.0001%，或你命名的任何分数。在幂次中，更高次幂占优：$x^p \ll x^q$ 当 $p < q$，因为 $\dfrac{x^p}{x^q} = \dfrac{1}{x^{q-p}} \to 0$。

```check
pq_, qq_ = symbols('p q', positive=True)
limit_is(x**pq_/x**(pq_ + qq_), x, oo, 0); same(x**pq_/x**(pq_ + qq_), 1/x**qq_)
```

::: theorem 增长阶
对于每一个 $p > 0$ 和每一个 $a > 1$，当 $x \to \infty$，

$$\ln x \ll x^p \ll a^x,$$

并且，当 $n \to \infty$ 依次经过所有整数时，

$$a^n \ll n! \ll n^n.$$
:::

每一个对数都被每一个正幂超越，每一个幂都被每一个大于 1 的指数函数超越，每一个指数函数又被阶乘超越。与 $n!$ 相关的两个比较只需简单的不等式。

::: proof 与阶乘的比较
对于 $\dfrac{n!}{n^n}$，将分子和分母写成 $n$ 因子的乘积：

$$\frac{n!}{n^n} = \frac{1}{n}\cdot\frac{2}{n}\cdots\frac{n}{n} \le \frac{1}{n},$$

因为第一个因子之后的每一个因子都不超过 1。由于 $0 < \dfrac{n!}{n^n} \le \dfrac1n$ 和 $\dfrac1n \to 0$，夹逼定理给出 $\dfrac{n!}{n^n} \to 0$。

对于 $\dfrac{a^n}{n!}$，选择一个整数 $N \ge 2a$。对于 $n > N$，将顶部和底部的前 $N$ 个因子分开：

$$\begin{aligned} \frac{a^n}{n!} &= \frac{a^N}{N!}\cdot\frac{a}{N + 1}\cdot\frac{a}{N + 2}\cdots\frac{a}{n} \\ &\le \frac{a^N}{N!}\Big(\frac12\Big)^{n - N}, \end{aligned}$$

因为每个最后的 $n - N$ 个因子都不超过 $\dfrac{a}{N} \le \dfrac12$。数 $\dfrac{a^N}{N!}$ 是固定的，且 $\big(\tfrac12\big)^{n-N} \to 0$（第 3.7 节），因此 $\dfrac{a^n}{n!} \to 0$ 由夹逼定理得出。
:::

```check
for nn in (5, 10, 20):
    holds(factorial(nn)/nn**nn <= Rational(1, nn))
    same(factorial(nn)/nn**nn, Mul(*[Rational(j, nn) for j in range(1, nn + 1)]))
aa, NN = 3, 6                                  # a = 3, N = 6 >= 2a
for nn in (8, 12, 20):
    same(Integer(aa)**nn/factorial(nn), Integer(aa)**NN/factorial(NN)*Mul(*[Rational(aa, j) for j in range(NN + 1, nn + 1)]))
    holds(Integer(aa)**nn/factorial(nn) <= Integer(aa)**NN/factorial(NN)*Rational(1, 2)**(nn - NN))
limit_is(factorial(n)/n**n, n, oo, 0); limit_is(3**n/factorial(n), n, oo, 0)
```

这些比较 $\ln x \ll x^p \ll a^x$ 需要一些更细致的工作。模块 7 用洛必达法则在几行内证明了它们，下面的“深入理解”框则用本模块的工具证明了它们。现在用数字使它们更具说服力：

```valuetable
x = 10, 100, 10000, 1000000
$\ln x$ = log(x)
$\sqrt{x}$ = sqrt(x)
$\dfrac{\ln x}{\sqrt x}$ = log(x)/sqrt(x)
digits = 4
---
x | \ln x | \sqrt{x} | \dfrac{\ln x}{\sqrt x}
10 | 2.303 | 3.162 | 0.7281
100 | 4.605 | 10 | 0.4605
10000 | 9.210 | 100 | 0.09210
1000000 | 13.82 | 1000 | 0.01382
```

在 $x = 10$ 处，对数已经小于 $\sqrt x$，并且比率不断减小：根据 $x = 10^6$，$\ln x$ 小于 $\sqrt x$ 的 1.4%。

```check
rounds(log(10**6)/sqrt(10**6), '0.0138'); holds(log(10**6)/sqrt(10**6) < Rational(14, 1000))
holds(log(10) < sqrt(10)); limit_is(log(x)/sqrt(x), x, oo, 0)
```

::: deeper 对数、幂和指数的比较
为了证明 $\dfrac{x^p}{a^x} \to 0$ 对于 $p > 0$ 和 $a > 1$，从整数 $n$ 和项 $u_n = \dfrac{n^p}{a^n}$ 开始。连续项的比率，

$$\frac{u_{n+1}}{u_n} = \frac{(n + 1)^p}{a^{n+1}}\cdot\frac{a^n}{n^p} = \frac1a\Big(1 + \frac1n\Big)^p,$$

当 $n \to \infty$ 时，趋近于 $\frac1a < 1$，因为 $t^p = e^{p\ln t}$ 在 $t = 1$ 处连续（定理 3.3 和 3.5）。在 $\frac1a$ 与 1 之间取数 $\rho$（希腊字母 rho），例如 $\rho = \frac12\big(1 + \frac1a\big)$，则从某个 $N$ 起，对于每个 $n$，这个比值均小于 $\rho$，于是

$$u_{N+k} \le u_N\,\rho^k \quad\text{for } k = 1, 2, 3, \dots$$

由于 $\rho^k = 1/(1/\rho)^k$ 和 $1/\rho > 1$，根据 $\rho^k \to 0$（第 3.7 节），所以 $u_n \to 0$。对于一个实数 $x \ge 1$，令 $n = \lfloor x\rfloor$，因此 $n \le x < n + 1$；然后 $x^p < (n + 1)^p$ 和 $a^x \ge a^n$，所以

$$0 < \frac{x^p}{a^x} < \frac{(n + 1)^p}{a^n} = a\,u_{n+1},$$

夹逼定理给出 $\dfrac{x^p}{a^x} \to 0$。对于 $\dfrac{\ln x}{x^p}$，代入 $x = e^t$：当 $x \to \infty$ 时，$t = \ln x \to \infty$，并且 $\dfrac{\ln x}{x^p} = \dfrac{t}{(e^p)^t}$，根据第一部分，其趋于 0，幂为 1，底数为 $e^p > 1$。比较连续项，如此处和对于 $n!$，是模块 14 中级数比值判别法的思想。
:::

```check
pp2 = symbols('p', positive=True); a2 = symbols('a', positive=True); n2 = symbols('n', positive=True)
same(((n2 + 1)**pp2/a2**(n2 + 1))*(a2**n2/n2**pp2), (1 + 1/n2)**pp2/a2)
limit_is((1 + 1/n2)**pp2/a2, n2, oo, 1/a2)
same((n2 + 1)**pp2/a2**n2, a2*((n2 + 1)**pp2/a2**(n2 + 1)))
tt = symbols('t', positive=True); same(log(exp(tt))/exp(tt)**pp2, tt/exp(pp2)**tt); same(exp(pp2*log(tt)), tt**pp2)
limit_is(x**3/2**x, x, oo, 0); limit_is(log(x)/x**Rational(1, 10), x, oo, 0)
```

::: pitfall
小表格可能产生误导。比较 $n^{10}$ 与 $2^n$：

```valuetable
n = 10, 30, 58, 59, 100
$n^{10}$ = n**10
$2^n$ = 2**n
$\dfrac{n^{10}}{2^n}$ = n**10/2**n
digits = 4
---
n | n^{10} | 2^n | \dfrac{n^{10}}{2^n}
10 | 1\times10^{10} | 1024 | 9.766\times10^{6}
30 | 5.905\times10^{14} | 1.074\times10^{9} | 549900
58 | 4.308\times10^{17} | 2.882\times10^{17} | 1.495
59 | 5.111\times10^{17} | 5.765\times10^{17} | 0.8866
100 | 1\times10^{20} | 1.268\times10^{30} | 7.889\times10^{-11}
```

对于每一个 $n$ 从 2 到 58，$n^{10}$ 是较大的；只有在 $n = 59$ 时，$2^n$ 才超过它，此后它一直领先，而比率则急剧下降。“最终”可能相距很远：$n^{100}$ 在每一个 $n$ 从 2 到 117,308 时都领先于 $1.01^n$。一个比较 $f \ll g$ 说明最终谁胜出，而不是什么时候胜出。
:::

```check
holds(all(k_**10 > 2**k_ for k_ in range(2, 59))); holds(all(k_**10 < 2**k_ for k_ in range(59, 400)))
holds(Rational(15, 14)**10 < 2)          # for n >= 14 each step multiplies n^10/2^n by ((n+1)/n)^10/2 < 1: it keeps falling
tg = symbols('t', positive=True); gfun = tg*log(Rational(101, 100)) - 100*log(tg)
same(diff(gfun, tg, 2), 100/tg**2)       # g = ln(1.01^t / t^100) is convex, so it is negative between its two zeros
nb = 117309
holds(gfun.subs(tg, nb) > 0); holds(gfun.subs(tg, nb - 1) < 0); holds(gfun.subs(tg, 2) < 0)
```

### 大 O 表示法与算法 {#big-o}

计算机科学家通过算法运行时间随输入规模 $n$ 增长的方式比较算法，例如待排序的项目数量。常数因子取决于计算机和程序员，因此比较时忽略它们。

::: definition 大 O 表示法
设 $f$ 和 $g$ 是整数 $n$ 的函数。则 $f(n) = O\big(g(n)\big)$ 作为 $n \to \infty$，读作 "$f$ of $n$ 是 $g$ of $n$ 的大 O"，如果存在常数 $C$ 和 $N$ 使得

$$\abs{f(n)} \le C\,\abs{g(n)} \quad\text{for every } n \ge N.$$
:::

所以 $f = O(g)$ 表示 $f$ 的增长速度不超过某个常数倍的 $g$；常数因子和小的 $n$ 没有关系。它只是一个上界：$n = O(n^2)$ 是正确的，但如果没提供信息的话就不重要。 （这种记号也用于 $h \to 0$：模块 4 就是用这种方式来衡量误差的。） 极限提供了一个快速的测试方法：如果 $f(n)/g(n)$ 趋向于一个数 $L$，那么 $f = O(g)$，因为最终 $\abs{f(n)/g(n)} < \abs{L} + 1$。特别是 $f \ll g$ 推出 $f = O(g)$，但随后 $g$ 不等于 $O(f)$，因为 $g(n)/f(n)$ 会无界增长。

::: example 大 O 上界
证明 $3n^2 + 5n + 7 = O(n^2)$，并且证明 $n^2$ 不等于 $O(n)$。

对于 $n \ge 1$，$n \le n^2$ 和 $1 \le n^2$，所以

$$\begin{aligned} 3n^2 + 5n + 7 &\le 3n^2 + 5n^2 + 7n^2 \\ &= 15n^2. \end{aligned}$$

这就是定义，其中 $C = 15$ 和 $N = 1$。极限测试给出相同的结果：$\dfrac{3n^2 + 5n + 7}{n^2} = 3 + \dfrac5n + \dfrac{7}{n^2} \to 3$。低阶项 $5n + 7$ 和因子 3 没有关系。

另一方面，$\dfrac{n^2}{n} = n$ 会无界增长，因此没有常数 $C$ 能够使得 $n^2 \le Cn$ 对于所有足够大的 $n$ 成立：$n^2$ 不等于 $O(n)$。

```check
same(factor(15*n**2 - (3*n**2 + 5*n + 7)), (n - 1)*(12*n + 7))        # >= 0 for n >= 1
same(expand(3*n**2 + 5*n**2 + 7*n**2), 15*n**2)
same(expand((3*n**2 + 5*n + 7)/n**2), 3 + 5/n + 7/n**2); limit_is((3*n**2 + 5*n + 7)/n**2, n, oo, 3)
same(n**2/n, n); limit_is(n**2/n, n, oo, oo)
```
:::

在算法分析中常见的增长阶，从增长最慢到最快：

| 阶 | 名称 | 出现的场景 |
|---|---|---|
| $O(\log_2 n)$ | 对数阶 | 二分查找：每一步将有序列表减半 |
| $O(n)$ | 线性阶 | 逐个查看每个元素，例如查找最大值 |
| $O(n\log_2 n)$ | 线性对数阶 | 归并排序进行排序 |
| $O(n^2)$ | 平方阶 | 比较每一对元素 |
| $O(2^n)$ | 指数阶 | 尝试所有元素的子集 |
| $O(n!)$ | 阶乘阶 | 尝试物品的每一个顺序 |

对数的底在 $O$ 内并不重要: $\log_2 n = \dfrac{\ln n}{\ln 2}$ 是 $\ln n$ 的常数倍，因此计算机科学家经常在不指定底数的情况下写作 $O(\log n)$。定理 3.11 将表格中的顺序连成一条链，

$$\log_2 n \ll n \ll n\log_2 n \ll n^2 \ll 2^n \ll n!,$$

因为 $\dfrac{n}{n\log_2 n} = \dfrac{1}{\log_2 n} \to 0$ 和 $\dfrac{n\log_2 n}{n^2} = \dfrac{\log_2 n}{n} \to 0$。

```check
same(log(n, 2), log(n)/log(2))
limit_is(log(n, 2)/n, n, oo, 0); limit_is(n/(n*log(n, 2)), n, oo, 0); limit_is(n*log(n, 2)/n**2, n, oo, 0)
limit_is(n**2/2**n, n, oo, 0); limit_is(2**n/factorial(n), n, oo, 0)
```

这在实际中意味着：假设，假设一台计算机每秒可以执行 $10^9$ 个基本步骤。对于 $n = 100$，一个需要 $n^2$ 步的算法在 10 微秒内完成；一个需要 $2^n$ 步的算法，则大约需要 $1.27 \times 10^{30}$，需要约 $4.0 \times 10^{13}$ 年；一个需要 $n!$ 步的算法则大约需要 $3 \times 10^{141}$ 年。更快的硬件无法拯救指数级算法：一台速度是原来的两倍的计算机，在相同时间内只能处理 $2^n$ 算法一个更多的项目，因为 $2^{n+1} = 2 \cdot 2^n$，而一个 $n^2$ 算法则可以处理 $\sqrt2 \approx 1.41$ 倍多的项目，因为 $(\sqrt2\,n)^2 = 2n^2$。

```check
yr = Rational(36525, 100)*24*3600
same(Rational(100**2, 10**9), Rational(1, 10**5)); same(Rational(1, 10**5), Rational(10, 10**6))
rounds(2**100, '1.27e30'); rounds(2**100/10**9/yr, '4.0e13'); rounds(factorial(100)/10**9/yr, '3e141')
same(2**(n + 1), 2*2**n); same((sqrt(2)*n)**2, 2*n**2); rounds(sqrt(2), '1.41')
```

::: pitfall
大O符号隐藏了常数因子，对于小规模 $n$ 它们很重要。一个需要 $100\,n\log_2 n$ 步的算法只有在 $n > 100\log_2 n$ 时才比需要 $n^2$ 步的算法更好：对于从 2 到 996 的每一个 $n$，"较差" 的二次算法所需的步骤更少，而只有从 $n = 997$ 开始，另一个算法才会占优。大O符号说明的是最终谁胜出，而不是你当前的规模。也要进行测量。

```check
holds(996 < 100*log(996, 2)); holds(997 > 100*log(997, 2)); holds(all(k_ < 100*log(k_, 2) for k_ in range(2, 997)))
```
:::

::: compute 带精确整数的增长率
Python 的整数是精确的，无论多大，因此它们可以无舍入误差地回答增长问题。$2^n$ 在何处超过 $n^{10}$？

```python
n = 2
while n**10 >= 2**n:          # exact integer arithmetic: no rounding
    n += 1
print(n, n**10, 2**n)
```

```output
59 511116753300641401 576460752303423488
```

在假设每秒执行 $10^9$ 步的情况下，表格中的算法需要多长时间？

```python
import math
speed = 10**9                         # steps per second (hypothetical)
year = 365.25 * 24 * 3600             # seconds in a year
for n in (20, 50, 100):
    for name, steps in (("n^2", n**2), ("2^n", 2**n), ("n!", math.factorial(n))):
        seconds = steps / speed
        print(f"n = {n:3}  {name:>3}: {seconds:9.3g} s = {seconds / year:9.3g} years")
```

```output
n =  20  n^2:     4e-07 s =  1.27e-14 years
n =  20  2^n:   0.00105 s =  3.32e-11 years
n =  20   n!:  2.43e+09 s =      77.1 years
n =  50  n^2:   2.5e-06 s =  7.92e-14 years
n =  50  2^n:  1.13e+06 s =    0.0357 years
n =  50   n!:  3.04e+55 s =  9.64e+47 years
n = 100  n^2:     1e-05 s =  3.17e-13 years
n = 100  2^n:  1.27e+21 s =  4.02e+13 years
n = 100   n!: 9.33e+148 s = 2.96e+141 years
```

$n^2$ 列始终保持在千分之一秒以下。$2^n$ 列从 $n = 20$ 时的毫秒级增长到 $n = 50$ 时的约 13 天（$1.13 \times 10^6$ 秒），而 $n!$ 列在 $n = 20$ 时已经约为 77 年。
:::

```check
holds(Rational(100**2, 10**9) < Rational(1, 1000)); rounds(Rational(2**20, 10**9), '0.001')
rounds(Rational(2**50, 10**9), '1.13e6'); rounds(Rational(2**50, 10**9)/(24*3600), '13')
rounds(factorial(20)/Integer(10**9)/(Rational(36525, 100)*24*3600), '77')
```

## 你所学到的内容 {#summary}

- 当 $\lim_{x\to a} f(x) = f(a)$ 时，$f$ 在 $a$ 处连续：$f(a)$ 有定义，极限存在，且两者相等。单侧连续性处理跳跃和区间端点。
- 间断点可以是可去的（极限存在），跳跃间断点（单侧极限不同），无穷间断点（函数值无界增长）或振荡间断点。只有可去间断点可以通过改变一个点的函数值来修复。
- 连续函数的和、积、商（分母不为零）以及复合函数都是连续的，且连续函数的极限可以进入函数内部：$\lim f\big(g(x)\big) = f\big(\lim g(x)\big)$。多项式、有理函数、根函数、指数函数、对数函数以及三角函数在其定义域上都是连续的。
- 中间值定理：一个在 $[a, b]$ 上连续的函数会取到 $f(a)$ 和 $f(b)$ 之间的所有值，因此符号变化表明存在一个根。
- 二分法在每一步都将区间减半：经过 $n$ 步后，区间宽度为 $(b - a)/2^n$，并且中点与根的误差不超过 $(b - a)/2^{n+1}$。
- 极值定理：一个在闭区间 $[a, b]$ 上连续的函数在该区间上一定存在最大值和最小值；在开区间或无界区间，或存在间断点的情况下，可能不存在极值。
- $\lim_{x\to a} f(x) = \pm\infty$ 描述的是无限增长的值；然后 $x = a$ 是一条垂直渐近线，通常出现在分子非零而分母为零的地方。$\infty$ 不是一个数：$\infty - \infty$ 和 $\infty/\infty$ 没有固定的值。
- $\lim_{x\to\pm\infty} f(x) = L$ 给出水平渐近线 $y = L$。有理函数的行为类似于它们主导项的比值；当分子的次数比分母的次数高一次时，除法会给出一条斜渐近线。
- $\ln x \ll x^p \ll a^x$ 对于 $p > 0$ 和 $a > 1$，以及 $a^n \ll n! \ll n^n$。大 O 符号 $f = O(g)$ 用一个常数倍的 $g$ 来限制 $f$，并通过它们成本增长的方式对算法进行排序。

## 练习 {#exercises}

:::: exercise 三个条件 {#ex-3-1} ★
对于每个函数，判断它在给定的数处是否连续。如果不连续，说明定义 3.1 中的三个条件中的哪一个失败，并分类这种不连续性。

- (a) $f(x) = \dfrac{x^2 - 9}{x - 3}$，在 3 处
- (b) $g(x) = x + 1$ 对于 $x < 1$，以及 $g(x) = 3 - x$ 对于 $x \ge 1$，在 1 处
- (c) $h(x) = x^2$ 对于 $x \le 0$，以及 $h(x) = \dfrac{1}{x}$ 对于 $x > 0$，在 0 处
- (d) $u(x) = \dfrac{\abs{x - 1}}{x - 1}$，在 1 处

::: solution
**(a)** $f(3) = 0/0$ 未定义：条件 1 不满足。对于 $x \ne 3$，$f(x) = \dfrac{(x - 3)(x + 3)}{x - 3} = x + 3$，因此 $\lim_{x\to3} f(x) = 6$。极限存在，因此不连续性是可去的：给 $f$ 在 3 处赋值 6，使其连续。

**(b)** $g(1) = 3 - 1 = 2$。从左侧，$\lim_{x\to1^-}(x + 1) = 2$；从右侧，$\lim_{x\to1^+}(3 - x) = 2$。单侧极限一致，因此 $\lim_{x\to1} g(x) = 2 = g(1)$：$g$ 在 1 处连续。两段在点 $(1, 2)$ 处衔接。

**(c)** $h(0) = 0^2 = 0$，且从左侧 $\lim_{x\to0^-} x^2 = 0 = h(0)$，因此 $h$ 在 0 处左连续。从右侧，$h(x) = 1/x$ 无界增长：$\lim_{x\to0^+} h(x) = \infty$。因此 $\lim_{x\to0} h(x)$ 不存在（条件 2 不满足），且 0 是无限不连续点。

**(d)** $u(1) = 0/0$ 未定义：条件 1 不满足。对于 $x > 1$，$\abs{x - 1} = x - 1$ 和 $u(x) = 1$；对于 $x < 1$，$\abs{x - 1} = -(x - 1)$ 和 $u(x) = -1$。单侧极限，1 和 $-1$ 不同，因此极限也不存在：跳跃不连续。

```check
fe1 = (x**2 - 9)/(x - 3)
holds(fe1.subs(x, 3) is S.NaN); same(factor(x**2 - 9), (x - 3)*(x + 3)); same(cancel(fe1), x + 3); limit_is(fe1, x, 3, 6)
limit_is(x + 1, x, 1, 2, '-'); limit_is(3 - x, x, 1, 2, '+'); same((3 - x).subs(x, 1), 2)
limit_is(x**2, x, 0, 0, '-'); same((x**2).subs(x, 0), 0); limit_is(1/x, x, 0, oo, '+')
xr1 = symbols('x', real=True); ue = Abs(xr1 - 1)/(xr1 - 1)
holds(ue.subs(xr1, 1) is S.NaN); limit_is(ue, xr1, 1, 1, '+'); limit_is(ue, xr1, 1, -1, '-')
```
:::
::::

:::: exercise 修复间断点 {#ex-3-2} ★
每个公式在一个或两个数上分母为零。在每个这样的数上，判断间断点是否可去，如果是，给出修复它的值。

- (a) $f(x) = \dfrac{x^3 - 8}{x - 2}$
- (b) $g(x) = \dfrac{\sqrt{x + 4} - 2}{x}$
- (c) $h(x) = \dfrac{x + 1}{x^2 - 1}$

::: solution
**(a)** $f$ 在 2 处未定义。因式分解立方差：$x^3 - 8 = (x - 2)(x^2 + 2x + 4)$，因此对于 $x \ne 2$， $f(x) = x^2 + 2x + 4$，趋于 $4 + 4 + 4 = 12$。极限存在：间断点可去，且值 $f(2) = 12$ 修复它。

**(b)** $g$ 在 $x \ge -4$ 处定义，除了在 0 处。有理化，如模块 2 所示：将分子和分母乘以 $\sqrt{x + 4} + 2$。由于 $\big(\sqrt{x + 4} - 2\big)\big(\sqrt{x + 4} + 2\big) = (x + 4) - 4 = x$，对于 $x \ne 0$

$$\begin{aligned} g(x) &= \frac{x}{x\big(\sqrt{x + 4} + 2\big)} \\ &= \frac{1}{\sqrt{x + 4} + 2}. \end{aligned}$$

平方根在 4 处连续，因此在 0 处的极限是 $1/(2 + 2) = \tfrac14$: 可去间断点，通过 $g(0) = \tfrac14$ 修复。

**(c)** $h$ 在 $x^2 - 1 = (x - 1)(x + 1) = 0$ 处未定义，当 $-1$ 和 1 时。对于其他 $x$， $h(x) = 1/(x - 1)$。在 $-1$ 处的极限是 $1/(-2) = -\tfrac12$: 可去间断点，通过 $h(-1) = -\tfrac12$ 修复。在 1 处， $1/(x - 1)$ 的分子为 1，分母趋于 0，因此根据定理 3.9，函数值在右侧趋于 $\infty$，在左侧趋于 $-\infty$: 无穷间断点，无法通过任何值修复。

```check
fe2 = (x**3 - 8)/(x - 2); same(factor(x**3 - 8), (x - 2)*(x**2 + 2*x + 4)); same(cancel(fe2), x**2 + 2*x + 4); limit_is(fe2, x, 2, 12)
ge2 = (sqrt(x + 4) - 2)/x; same(expand((sqrt(x + 4) - 2)*(sqrt(x + 4) + 2)), x)
xg2 = symbols('x', positive=True); same(((sqrt(xg2 + 4) - 2)/xg2) - 1/(sqrt(xg2 + 4) + 2), 0); limit_is(ge2, x, 0, Rational(1, 4))
he2 = (x + 1)/(x**2 - 1); same(factor(x**2 - 1), (x - 1)*(x + 1)); same(cancel(he2), 1/(x - 1))
limit_is(he2, x, -1, -Rational(1, 2)); limit_is(he2, x, 1, oo, '+'); limit_is(he2, x, 1, -oo, '-')
same(ge2.subs(x, -3), Rational(1, 3)); same((1/(sqrt(x + 4) + 2)).subs(x, -3), Rational(1, 3))
```
:::
::::

:::: exercise 中间值定理求根 {#ex-3-3} ★
- (a) 证明 $x^5 + x - 1 = 0$ 在 $(0, 1)$ 内有解。
- (b) 证明 $e^{-x} = x$ 在 $(0, 1)$ 内有解。
- (c) $f(x) = \dfrac1x$ 在 $f(-1) = -1 < 0 < 1 = f(1)$ 内有解。为什么中间值定理不能保证 $(-1, 1)$ 内有根？ $f$ 是否有根？

::: solution
**(a)** $p(x) = x^5 + x - 1$ 是一个多项式，在 $[0, 1]$ 上连续，且具有 $p(0) = -1 < 0$ 和 $p(1) = 1 > 0$。根据中间值定理，存在某个 $c$ 在 $(0, 1)$ 内，使得 $p(c) = 0$。 （二分法或计算机可得 $c \approx 0.7549$。）

**(b)** 将方程重写为 $g(x) = 0$，其中 $g(x) = e^{-x} - x$ 是在 $\R$ 上连续的（$e^{-x}$ 是 $e^u$ 与 $u = -x$ 的复合）。因此 $g(0) = 1 > 0$ 和 $g(1) = e^{-1} - 1 \approx 0.3679 - 1 = -0.6321 < 0$，所以 $g$ 在 $(0, 1)$ 内有一个根： $e^{-x} = x$ 那里。（它就是 $c \approx 0.5671$。）

**(c)** 定理要求 $f$ 在 $[-1, 1]$ 的整个定义域上连续，而 $1/x$ 在 0 处未定义：它在该点有一个无限间断点。因此定理无话可说。而且 $f$ 没有根： $\dfrac1x = 0$ 需要 $1 = 0 \cdot x = 0$。符号变化是因为图像在渐近线 $x = 0$ 处从 $-\infty$ 跳到 $\infty$，而不是穿过轴。

```check
p4 = x**5 + x - 1; same(p4.subs(x, 0), -1); same(p4.subs(x, 1), 1); r4 = nsolve(p4, x, 0.75); holds(0 < r4 < 1); rounds(r4, '0.7549')
g4 = exp(-x) - x; same(g4.subs(x, 0), 1); rounds(exp(-1), '0.3679'); rounds(exp(-1) - 1, '-0.6321'); holds(exp(-1) - 1 < 0)
r4b = nsolve(g4, x, 0.5); holds(0 < r4b < 1); rounds(r4b, '0.5671')
same(solve(1/x, x), []); limit_is(1/x, x, 0, oo, '+')
```
:::
::::

:::: exercise 手动二分法 {#ex-3-4} ★★
使用二分法在 $f(x) = x^3 - 2x - 5$ 上进行，从 $[2, 3]$ 开始（例 3.5）。

- (a) 进行四步，给出括号 $[a_4, b_4]$。
- (b) 定理 3.7 保证关于中点 $m_4$ 的什么？与根 $c \approx 2.0946$ 进行比较。
- (c) 从 $[2, 3]$ 出发需要多少步才能保证中点 $m_n$ 在根的 $10^{-4}$ 范围内？

::: solution
**(a)** $f(2) = -1 < 0$ 和 $f(3) = 16 > 0$。每一步比较 $f(m_n)$ 与 $f(a_n)$ 的符号。后者始终为负，因为 $a_n$ 只移动到 $f$ 为负的中点（$f$ 保留四位有效数字）：

| $n$ | $a_n$ | $b_n$ | $m_n$ | $f(m_n)$ |
|---|---|---|---|---|
| 0 | 2 | 3 | 2.5 | 5.625 |
| 1 | 2 | 2.5 | 2.25 | 1.891 |
| 2 | 2 | 2.25 | 2.125 | 0.3457 |
| 3 | 2 | 2.125 | 2.0625 | −0.3513 |

前三个中点给出正值，因此每个都替换 $b$；第四个给出负值并替换 $a$。因此 $[a_4, b_4] = [2.0625, 2.125]$，宽度为 $\tfrac{1}{16} = 0.0625$。

**(b)** 中点 $m_4 = 2.09375$ 在根的 $\dfrac{3 - 2}{2^5} = \dfrac{1}{32} = 0.03125$ 范围内。实际上根约为 2.0946，因此误差约为 0.0008。

**(c)** 定理 3.7 需要 $\dfrac{1}{2^{n+1}} \le 10^{-4}$，即 $2^{n+1} \ge 10{,}000$。由于 $2^{13} = 8192$ 太小，而 $2^{14} = 16{,}384$ 足够大，因此 $n + 1 = 14$: 13 步。

```check
fb5 = lambda T: T**3 - 2*T - 5
same(fb5(Integer(2)), -1); same(fb5(Integer(3)), 16)
A5, B5 = Rational(2), Rational(3); rows5 = []
for k_ in range(4):
    M5 = (A5 + B5)/2; rows5.append((A5, B5, M5, fb5(M5)))
    if sign(fb5(M5)) == sign(fb5(A5)): A5 = M5
    else: B5 = M5
shown5 = [('2', '3', '2.5', '5.625'), ('2', '2.5', '2.25', '1.891'), ('2', '2.25', '2.125', '0.3457'), ('2', '2.125', '2.0625', '-0.3513')]
for (a_k, b_k, m_k, fm_k), (sa, sb, sm, sf) in zip(rows5, shown5):
    same(a_k, Rational(sa)); same(b_k, Rational(sb)); same(m_k, Rational(sm)); rounds(fm_k, sf)
same((A5, B5), (Rational(20625, 10000), Rational(2125, 1000))); same(B5 - A5, Rational(1, 16)); same(Rational(1, 16), Rational(625, 10000))
same((A5 + B5)/2, Rational(209375, 100000)); same(Rational(1, 2**5), Rational(3125, 100000))
r5 = nsolve(fb5(x), x, 2.1); holds(A5 < r5 < B5); rounds(r5, '2.0946'); rounds(abs((A5 + B5)/2 - r5), '0.0008')
same(2**13, 8192); same(2**14, 16384); holds(2**13 < 10**4 <= 2**14)
```
:::
::::

:::: exercise 极值存在与否 {#ex-3-5} ★★
对每个函数和区间，判断极值定理是否适用。然后找出最大值和最小值，或解释为何不存在。

- (a) $f(x) = 4x - x^2$ on $[0, 3]$
- (b) $g(x) = \dfrac{1}{x^2}$ 在 $[-1, 1]$ 上，其中 $g$ 在 0 处未定义
- (c) $h(x) = x^2$ 在 $(-1, 2)$ 上
- (d) $\lfloor x\rfloor$ 在 $[0, 2]$ 上

::: solution
**(a)** $f$ 是一个多项式，在闭区间 $[0, 3]$ 上连续：定理适用。完成平方： $f(x) = 4 - (x - 2)^2$。最大值为 $f(2) = 4$，此时平方为 0。平方最大值出现在 $x$ 最远离 2 处，即 $x = 0$，因此最小值为 $f(0) = 0$（在另一端 $f(3) = 3$ 处）。

**(b)** $g$ 在 0 处未定义，而 0 位于 $[-1, 1]$ 中，因此在该点不连续：定理不适用。没有最大值，因为 $g(x) \to \infty$ 作为 $x \to 0$。但存在最小值：对于 $0 < \abs{x} \le 1$， $x^2 \le 1$，所以 $\dfrac{1}{x^2} \ge 1$，当 $x = \pm1$ 时取等号。最小值为 1。

**(c)** $h$ 是连续的，但 $(-1, 2)$ 是开区间，因此定理不适用。由于 $x^2 \ge 0$，最小值为 $h(0) = 0$。最大值不存在：对 $(-1, 2)$ 内的任意 $x$，均有 $x^2 < 4$；当 $x \to 2^-$ 时函数值趋近于 4，因此对于任一候选值 $h(x_0)$，在更接近 2 的点处都能找到更大的 $h$。

**(d)** $\lfloor x\rfloor$ 在 1 处跳跃，在 2 处不从左侧连续（$\lim_{x\to2^-}\lfloor x\rfloor = 1 \ne 2$），因此它在 $[0, 2]$ 上不连续：定理不适用。然而极值存在：值为 0（在 $[0, 1)$），1（在 $[1, 2)$）和 2（在 $x = 2$），因此最大值为 2，最小值为 0。

部分 (b)、(c) 和 (d) 表明假设条件是充分的，而非必要的：当它们不成立时，极值可能存在也可能不存在。

```check
f6 = 4*x - x**2; same(expand(4 - (x - 2)**2), f6)
same(maximum(f6, x, Interval(0, 3)), 4); same(minimum(f6, x, Interval(0, 3)), 0); same(f6.subs(x, 2), 4); same(f6.subs(x, 0), 0); same(f6.subs(x, 3), 3)
limit_is(1/x**2, x, 0, oo); same(minimum(1/x**2, x, Union(Interval.Ropen(-1, 0), Interval.Lopen(0, 1))), 1); same((1/x**2).subs(x, -1), 1)
same(minimum(x**2, x, Interval.open(-1, 2)), 0); limit_is(x**2, x, 2, 4, '-')
same([floor(v) for v in (0, Rational(1, 2), 1, Rational(3, 2), 2)], [0, 0, 1, 1, 2]); limit_is(floor(x), x, 2, 1, '-'); limit_is(floor(x), x, 1, 0, '-')
```
:::
::::

:::: exercise 垂直渐近线 {#ex-3-6} ★★
- (a) 找出 $f(x) = \dfrac{x + 2}{x^2 + x - 2}$ 的垂直渐近线，并写出每个渐近点的单侧极限，以及图像中的任何间断点。
- (b) 找出 $\displaystyle\lim_{x\to0^+} e^{1/x}$ 和 $\displaystyle\lim_{x\to0^-} e^{1/x}$。在 0 处 $e^{1/x}$ 有什么类型的间断点？其图像是否有水平渐近线？

::: solution
**(a)** 分解分母：$x^2 + x - 2 = (x + 2)(x - 1)$。因此 $f$ 在 $-2$ 和 1 处未定义，并且对于所有其他 $x$

$$f(x) = \frac{x + 2}{(x + 2)(x - 1)} = \frac{1}{x - 1}.$$

在 $-2$ 处因子约去，且 $\lim_{x\to-2} f(x) = \dfrac{1}{-3} = -\dfrac13$：在 $\big(-2, -\tfrac13\big)$ 处有一个孔，而不是渐近线。在 1 处，分子为 1，分母 $x - 1$ 趋于 0，右侧为正，左侧为负，因此根据定理 3.9

$$\begin{aligned} \lim_{x\to1^+} f(x) &= \infty, \\ \lim_{x\to1^-} f(x) &= -\infty, \end{aligned}$$

且 $x = 1$ 是唯一的垂直渐近线。

**(b)** 当 $x \to 0^+$ 时， $u = \dfrac1x$ 无界增长， $e^u$（第 3.7 节）也无界增长： $\lim_{x\to0^+} e^{1/x} = \infty$。当 $x \to 0^-$ 时， $u = \dfrac1x$ 趋于 $-\infty$，且 $e^u \to 0$： $\lim_{x\to0^-} e^{1/x} = 0$。由于一侧极限为无穷大，0 是无穷间断点，且 $x = 0$ 是垂直渐近线，仅在右侧存在。当 $x \to \pm\infty$ 时， $\dfrac1x \to 0$ 和 $e^u$ 在 0 处连续，因此 $e^{1/x} \to e^0 = 1$（定理 3.4）：直线 $y = 1$ 是左右两端的水平渐近线。

```check
fe7 = (x + 2)/(x**2 + x - 2)
same(factor(x**2 + x - 2), (x + 2)*(x - 1)); same(cancel(fe7), 1/(x - 1)); limit_is(fe7, x, -2, -Rational(1, 3))
limit_is(fe7, x, 1, oo, '+'); limit_is(fe7, x, 1, -oo, '-')
limit_is(exp(1/x), x, 0, oo, '+'); limit_is(exp(1/x), x, 0, 0, '-'); limit_is(exp(1/x), x, oo, 1); limit_is(exp(1/x), x, -oo, 1)
```
:::
::::

:::: exercise 无穷远处的极限 {#ex-3-7} ★★
求

- (a) $\displaystyle\lim_{x\to\infty}\frac{2x^3 - x}{4x^3 + 5x^2 + 1}$
- (b) $\displaystyle\lim_{x\to-\infty}\frac{3x + 1}{\sqrt{x^2 + 4}}$
- (c) $\displaystyle\lim_{x\to\infty}\Big(\sqrt{x^2 + x} - x\Big)$。 （提示：将 $\sqrt{x^2 + x} + x$ 相乘并相除。）

::: solution
**(a)** 角度相等，因此将分子和分母都除以 $x^3$：

$$\begin{aligned} &\frac{2x^3 - x}{4x^3 + 5x^2 + 1} \\ &\quad= \frac{2 - 1/x^2}{4 + 5/x + 1/x^3} \to \frac{2}{4} = \frac12. \end{aligned}$$

**(b)** 对于 $x < 0$， $\sqrt{x^2 + 4} = \abs{x}\sqrt{1 + 4/x^2} = -x\sqrt{1 + 4/x^2}$。将分子和分母都除以 $-x$，它是正数，

$$\begin{aligned} \frac{3x + 1}{\sqrt{x^2 + 4}} &= \frac{3x + 1}{-x\sqrt{1 + 4/x^2}} \\ &= -\frac{3 + 1/x}{\sqrt{1 + 4/x^2}} \\ &\to -\frac{3}{1} = -3. \end{aligned}$$

常见的错误答案 3 忽略了 $\sqrt{x^2} = \abs{x} = -x$ 对于负 $x$ 的情况。（当 $x \to \infty$ 时极限为 3。）

**(c)** $\sqrt{x^2 + x}$ 和 $x$ 都趋于 $\infty$，而 "$\infty - \infty$" 没有决定作用，因此需要有理化，如模块 2 所示。对于 $x > 0$，写成 $s = \sqrt{x^2 + x}$，使得 $s^2 = x^2 + x$。将分子和分母乘以 $s + x$，并将分子上的平方差展开：

$$\begin{aligned} s - x &= \frac{(s - x)(s + x)}{s + x} \\ &= \frac{s^2 - x^2}{s + x} = \frac{x}{s + x}. \end{aligned}$$

将 $s = \sqrt{x^2 + x}$ 恢复，并将分子和分母都除以 $x$，使用 $\sqrt{x^2 + x} = x\sqrt{1 + 1/x}$ 表示 $x > 0$：

$$\begin{aligned} \frac{x}{\sqrt{x^2 + x} + x} &= \frac{1}{\sqrt{1 + 1/x} + 1} \\ &\to \frac{1}{1 + 1} = \frac12. \end{aligned}$$

答案是 $\tfrac12$，而不是 0：两个项一起增长，它们的差趋于 $\tfrac12$。在计算机上，原式也是数值危险的。对于大的 $x$，它会减去两个几乎相等的数，模块 2 的消去会破坏精度；重写后的形式则保留了精度：

```python
import math
for x in (1e4, 1e8, 1e16):
    print(x, math.sqrt(x*x + x) - x, 1/(math.sqrt(1 + 1/x) + 1))
```

```output
10000.0 0.49998750062513864 0.49998750062496095
100000000.0 0.5 0.49999999875
1e+16 2.0 0.5
```

在 $x = 10^{16}$ 处，原式给出 2.0，而改写后的形式给出正确的 0.5。

```check
fa8 = (2*x**3 - x)/(4*x**3 + 5*x**2 + 1); same(fa8, (2 - 1/x**2)/(4 + 5/x + 1/x**3)); limit_is(fa8, x, oo, Rational(1, 2))
xn8 = symbols('x', negative=True)
same(sqrt(xn8**2 + 4), -xn8*sqrt(1 + 4/xn8**2)); same((3*xn8 + 1)/(-xn8*sqrt(1 + 4/xn8**2)), -(3 + 1/xn8)/sqrt(1 + 4/xn8**2))
limit_is((3*x + 1)/sqrt(x**2 + 4), x, -oo, -3); limit_is((3*x + 1)/sqrt(x**2 + 4), x, oo, 3)
xp8 = symbols('x', positive=True)
s8 = symbols('s', positive=True)                                                     # s stands for sqrt(x^2 + x)
same(expand((s8 - xp8)*(s8 + xp8)), s8**2 - xp8**2); same((s8**2 - xp8**2).subs(s8, sqrt(xp8**2 + xp8)), xp8)   # the difference of squares on top
steps(sqrt(xp8**2 + xp8) - xp8, (sqrt(xp8**2 + xp8) - xp8)*(sqrt(xp8**2 + xp8) + xp8)/(sqrt(xp8**2 + xp8) + xp8), xp8/(sqrt(xp8**2 + xp8) + xp8), 1/(sqrt(1 + 1/xp8) + 1))
same(sqrt(xp8**2 + xp8), xp8*sqrt(1 + 1/xp8)); limit_is(sqrt(x**2 + x) - x, x, oo, Rational(1, 2))
same((1/(sqrt(1 + 1/x) + 1)).subs(x, 10**16), 1/(sqrt(1 + Rational(1, 10**16)) + 1)); rounds(1/(sqrt(1 + Rational(1, 10**16)) + 1), '0.5')
```
:::
::::

:::: exercise 斜渐近线 {#ex-3-8} ★★
设 $f(x) = \dfrac{2x^2 - 3x + 1}{x + 1}$。

- (a) 将 $f(x)$ 写成 $mx + c + \dfrac{d}{x + 1}$ 的形式。
- (b) 找出图像的渐近线，并说明图像在斜渐近线的哪一侧。
- (c) 找出图像与坐标轴的交点，并描述其形状。

::: solution
**(a)** 用长除法将 $2x^2 - 3x + 1$ 除以 $x + 1$。首先 $2x^2 \div x = 2x$，并 $2x(x + 1) = 2x^2 + 2x$；相减后余 $-5x + 1$。接着 $-5x \div x = -5$，并 $-5(x + 1) = -5x - 5$；相减后余数为 6。因此 $2x^2 - 3x + 1 = (x + 1)(2x - 5) + 6$，且对于 $x \ne -1$

$$f(x) = 2x - 5 + \frac{6}{x + 1}.$$

通过展开检查：$(x + 1)(2x - 5) + 6 = 2x^2 - 3x - 5 + 6 = 2x^2 - 3x + 1$。

**(b)** 当 $x \to \pm\infty$, $\dfrac{6}{x + 1} \to 0$, 所以 $y = 2x - 5$ 是在两端的斜渐近线。对于 $x > -1$, $\dfrac{6}{x + 1} > 0$ 和图像位于其上方；对于 $x < -1$, 位于其下方。在 $x = -1$ 处，分子是 $2 + 3 + 1 = 6 \ne 0$，因此根据定理 3.9 $\lim_{x\to-1^+} f(x) = \infty$ 和 $\lim_{x\to-1^-} f(x) = -\infty$: $x = -1$ 是垂直渐近线。没有水平渐近线，因为 $f(x) \to \pm\infty$ 当 $x \to \pm\infty$。

**(c)** $f(x) = 0$ 在 $2x^2 - 3x + 1 = (2x - 1)(x - 1) = 0$ 处，于 $x = \tfrac12$ 和 $x = 1$，以及 $f(0) = 1$。因此，右支从 $\infty$ 附近直线 $x = -1$ 下降，穿过 $y$ 轴于 1，介于 $x$ 轴之间 $\tfrac12$ 和 1 之间下探，然后沿斜渐近线回升，位于其上方。左支保持在斜渐近线下方，并随着 $x \to -1^-$ 趋向 $-\infty$。

```check
f9 = (2*x**2 - 3*x + 1)/(x + 1)
same(expand(2*x*(x + 1)), 2*x**2 + 2*x); same(expand((2*x**2 - 3*x + 1) - (2*x**2 + 2*x)), -5*x + 1); same(expand((-5*x + 1) - (-5*(x + 1))), 6)
same(div(2*x**2 - 3*x + 1, x + 1), (2*x - 5, 6)); steps((x + 1)*(2*x - 5) + 6, 2*x**2 - 3*x - 5 + 6, 2*x**2 - 3*x + 1)
same(f9, 2*x - 5 + 6/(x + 1)); limit_is(f9 - (2*x - 5), x, oo, 0); limit_is(f9 - (2*x - 5), x, -oo, 0)
holds((6/(x + 1)).subs(x, 0) > 0); holds((6/(x + 1)).subs(x, -2) < 0)
same((2*x**2 - 3*x + 1).subs(x, -1), 6); limit_is(f9, x, -1, oo, '+'); limit_is(f9, x, -1, -oo, '-'); limit_is(f9, x, oo, oo); limit_is(f9, x, -oo, -oo)
same(factor(2*x**2 - 3*x + 1), (2*x - 1)*(x - 1)); same_set(solve(f9, x), [Rational(1, 2), 1]); same(f9.subs(x, 0), 1)
holds(f9.subs(x, Rational(3, 4)) < 0)
```
:::
::::

:::: exercise 增长阶与大 O 记号 {#ex-3-9} ★★★
- (a) 将这些函数按增长速度从最慢到最快排列为 $n \to \infty$，并说明每项比较： $n^{100}$, $2^n$, $(\ln n)^3$, $n\log_2 n$, $\sqrt n$, $1.01^n$, $n!$.
- (b) 一个程序在输入规模为 $n$ 时耗时 $T(n) = 5n\log_2 n + 100n$ 微秒。证明 $T(n) = O(n\log_2 n)$.

::: solution
**(a)** 排序为

$$\begin{aligned} (\ln n)^3 &\ll \sqrt n \ll n\log_2 n \\ &\ll n^{100} \ll 1.01^n \\ &\ll 2^n \ll n!. \end{aligned}$$

每个比较是一个比值，趋于 0:

- $\dfrac{(\ln n)^3}{\sqrt n} = \Big(\dfrac{\ln n}{n^{1/6}}\Big)^3 \to 0^3 = 0$，因为 $\ln n \ll n^{1/6}$（定理 3.11 与 $p = \tfrac16$）且 $t^3$ 在 0 处连续（定理 3.4）。
- $\dfrac{\sqrt n}{n\log_2 n} = \dfrac{1}{\sqrt n\,\log_2 n} \to 0$，因为分母的两个因子都趋于无穷大。
- $\dfrac{n\log_2 n}{n^{100}} = \dfrac{1}{\ln 2}\cdot\dfrac{\ln n}{n^{99}} \to 0$，因为 $\ln n \ll n^{99}$。
- $\dfrac{n^{100}}{1.01^n} \to 0$，因为每个幂函数的增长速度都比每个大于 1 的指数函数慢（定理 3.11 与 $p = 100$, $a = 1.01$）。
- $\dfrac{1.01^n}{2^n} = 0.505^n \to 0$，因为是一个小于 1 的指数函数（第 3.7 节）。
- $\dfrac{2^n}{n!} \to 0$，根据定理 3.11 与 $a = 2$。

第四条比较仅在长期趋势中成立：$n^{100}$ 在 $n$ 从 2 到 117,308 的每个值上都领先于 $1.01^n$（第 3.8 节）。

**(b)** 对于 $n \ge 2$， $\log_2 n \ge 1$，因此 $100n \le 100\,n\log_2 n$，并且

$$\begin{aligned} T(n) &\le 5n\log_2 n + 100\,n\log_2 n \\ &= 105\,n\log_2 n. \end{aligned}$$

这是 $T(n) = O(n\log_2 n)$ 的定义，包含 $C = 105$ 和 $N = 2$。使用极限代替：$\dfrac{T(n)}{n\log_2 n} = 5 + \dfrac{100}{\log_2 n} \to 5$。

```check
npos = symbols('n', positive=True)
same((log(npos)/npos**Rational(1, 6))**3, log(npos)**3/sqrt(npos)); limit_is(log(n)/n**Rational(1, 6), n, oo, 0); limit_is(log(n)**3/sqrt(n), n, oo, 0)
same(sqrt(npos)/(npos*log(npos, 2)), 1/(sqrt(npos)*log(npos, 2))); limit_is(sqrt(n)/(n*log(n, 2)), n, oo, 0)
same(npos*log(npos, 2)/npos**100, (1/log(2))*log(npos)/npos**99); limit_is(n*log(n, 2)/n**100, n, oo, 0)
limit_is(n**100/Rational(101, 100)**n, n, oo, 0)
same(Rational(101, 100)**npos/2**npos, Rational(101, 200)**npos); same(Rational(101, 200), Rational(505, 1000)); limit_is(Rational(101, 200)**n, n, oo, 0)
limit_is(2**n/factorial(n), n, oo, 0)
same(log(2, 2), 1); holds(log(3, 2) > 1); same(5*npos*log(npos, 2) + 100*npos*log(npos, 2), 105*npos*log(npos, 2))
same((5*npos*log(npos, 2) + 100*npos)/(npos*log(npos, 2)), 5 + 100/log(npos, 2)); limit_is((5*n*log(n, 2) + 100*n)/(n*log(n, 2)), n, oo, 5)
```
:::
::::

:::: exercise 奇数次多项式 {#ex-3-10} ★★★
- (a) 证明每个奇数次多项式至少有一个实根。
- (b) 给出一个没有实根的偶数次多项式。
- (c) 证明 $p(x) = x^3 - 3x + 1$ 恰好有三个实根，并找出包含这三个实根的三个长度为 1 的区间。

::: solution
**(a)** 设 $p(x) = a_nx^n + \dots + a_1x + a_0$，其中 $n$ 为奇数且 $a_n \ne 0$。除以 $a_n$ 不改变根，所以可取 $a_n = 1$。多项式是分母为 1 的有理函数。由定理 3.10，当 $x \to \pm\infty$ 时，$p(x)$ 的行为与其最高次项 $x^n$ 相同。由于 $n$ 是奇数，当 $x \to \infty$ 时 $x^n \to \infty$，当 $x \to -\infty$ 时 $x^n \to -\infty$，因此

$$\begin{aligned} \lim_{x\to\infty} p(x) &= \infty, \\ \lim_{x\to-\infty} p(x) &= -\infty. \end{aligned}$$

第一个极限说明对充分大的 $x$ 均有 $p(x) > 0$。取一个这样的 $B$，即有 $p(B) > 0$。由第二个极限可取一个数 $A < B$，使得 $p(A) < 0$。多项式 $p$ 在 $[A, B]$ 上连续，所以由介值定理，它在 $(A, B)$ 中有一个零点。

**(b)** 对每个实数 $x$ 均有 $x^2 + 1 \ge 1 > 0$，故没有实根。当 $n$ 为偶数时，两端均有 $x^n \to \infty$，所以 (a) 的论证不再适用。

**(c)** 试计算 $p$ 在几个整数处的值：

| $x$ | $-2$ | $-1$ | $0$ | $1$ | $2$ |
|---|---|---|---|---|---|
| $p(x)$ | $-1$ | $3$ | $1$ | $-1$ | $3$ |

$p$ 在 $[-2, -1]$、$[0, 1]$ 和 $[1, 2]$ 上分别变号，因此由介值定理，在 $(-2, -1)$、$(0, 1)$ 和 $(1, 2)$ 中各有一个零点，共至少三个零点 $r_1 < r_2 < r_3$。下面证明没有其他零点。若多项式的一个根是 $r$，则它有因式 $x - r$（见[第 2.5 节](module_02_ZH.html#factor)），所以 $p(x) = (x - r_1)\,q(x)$，其中 $q$ 是首项系数为 1 的二次多项式。因为 $p(r_2) = 0$ 且 $r_2 \ne r_1$，可得 $q(r_2) = 0$，于是对某个数 $s$ 有 $q(x) = (x - r_2)(x - s)$。而 $p(r_3) = 0$ 进一步要求 $s = r_3$。所以 $p(x) = (x - r_1)(x - r_2)(x - r_3)$ 在其他各点都不为零，$p$ 恰有三个实根。

```check
x1_ = symbols('x', positive=True)
limit_is(x**3 - 3*x + 1, x, oo, oo); limit_is(x**3 - 3*x + 1, x, -oo, -oo); limit_is(x**5 - 7*x**2 + 2, x, -oo, -oo)
same([r_ for r_ in solve(x**2 + 1, x) if r_.is_real], []); limit_is(x**2, x, -oo, oo)
pc = x**3 - 3*x + 1
same([pc.subs(x, v) for v in (-2, -1, 0, 1, 2)], [-1, 3, 1, -1, 3])
rts = Poly(pc, x).real_roots(); same(len(rts), 3)
holds(-2 < rts[0] < -1); holds(0 < rts[1] < 1); holds(1 < rts[2] < 2)
r1_, r2_, r3_, s_ = symbols('r1 r2 r3 s'); same(solve(((x - r1_)*(x - r2_)*(x - s_)).subs(x, r3_), s_), [r3_])   # p(r3) = 0 forces s = r3
for v in (-3, Rational(1, 2), 4, 10):
    near(pc.subs(x, v), Mul(*[(v - r_) for r_ in rts]), 1e-25)              # p(x) = (x - r1)(x - r2)(x - r3)
```
:::
::::

:::: exercise 夹逼定理 {#ex-3-11} ★★★
一位徒步者周六 7:00 从山脚出发，15:00 到达山顶。周日 7:00，她从山顶沿同一条路下山，15:00 到达山脚。两天的步速都在变化，她也会不时停下来休息。证明某一时刻，她在这两天都恰好位于山路的同一点。

::: solution
用路径底部到她的位置的距离来度量她的位置，设 $L$ 为路径的长度。设 $u(t)$ 为她在周六 $t$（小时）时的位置，设 $d(t)$ 为她在周日同一时间的位置，对于 $7 \le t \le 15$。两者都是 $t$ 的连续函数：她不能从路径的一点直接跳到另一点。因此

$$g(t) = u(t) - d(t)$$

在 $[7, 15]$ 上连续（定理 3.1）。在一天开始 $g(7) = u(7) - d(7) = 0 - L = -L < 0$ 和结束 $g(15) = L - 0 = L > 0$ 时。根据中间值定理，存在 $(7, 15)$ 中的一个时间 $c$，使得 $g(c) = 0$，即 $u(c) = d(c)$：在时间 $c$ 时，她在两天的同一位置。

同样的论证如图所示：两位徒步者在同一天，一位按照周六的计划向上走，另一位按照周日的计划向下走，他们必定会在某个地方相遇。定理保证至少存在这样一个时间，但不保证具体何时。例如，假设周六她开始走得缓慢，其中 $u(t) = Ls^2$ 表示 $s = (t - 7)/8$ 是当天徒步所经过的比例，而周日她以恒定速度向下走，即 $d(t) = L(1 - s)$。那么 $u = d$ 当 $s^2 = 1 - s$，即 $s^2 + s - 1 = 0$，其在 0 到 1 之间的解为

$$\begin{aligned} s &= \frac{\sqrt5 - 1}{2} \approx 0.618, \\ t &= 7 + 8s \approx 11.94. \end{aligned}$$

因此，大约在两天的 11:57 左右，她处于相同的位置，大约在全程的 38% 处（$s^2 \approx 0.382$）。

```check
Lh = symbols('L', positive=True)
same(0 - Lh, -Lh); same(Lh - 0, Lh); holds(-Lh < 0); holds(Lh > 0)
sh = symbols('s'); same_set(solve(sh**2 + sh - 1, sh), [(sqrt(5) - 1)/2, -(sqrt(5) + 1)/2])
sv = (sqrt(5) - 1)/2; same(sv**2, 1 - sv); holds(0 < sv < 1)
rounds(sv, '0.618'); rounds(7 + 8*sv, '11.94'); rounds((7 + 8*sv - 11)*60, '57'); rounds(sv**2, '0.382'); rounds(100*sv**2, '38')
```
:::
::::

## 自测 {#quiz}

```quiz
? 设 $f(x) = \dfrac{x^2 - 1}{x - 1}$ 对于 $x \ne 1$，且 $f(1) = 3$。在 $x = 1$， $f$ 为
- [ ] 连续，因为 $f(1)$ 是定义的
- [ ] 不连续，因为 $\lim_{x\to1} f(x)$ 不存在
- [x] 不连续，具有可去间断点
- [ ] 不连续，具有跳跃间断点
> 对于 $x \ne 1$, $f(x) = x + 1$, 所以在 1 处的极限存在且为 2。它不是 $f(1) = 3$, 所以条件 3 不满足，给 $f$ 在 1 处赋值 2 可以修复：可去间断点。仅定义在某点上是不够的连续性的。极限存在，这排除了第二个答案，而跳跃间断点需要左右极限不同。

? $f(x) = \sqrt{x - 1} + \ln(4 - x)$ 连续的最小区间是
- [ ] $(1, 4)$
- [x] $[1, 4)$
- [ ] $[1, 4]$
- [ ] $(-\infty, 4)$
> 平方根需要 $x \ge 1$，且在 1 处右连续；对数需要 $4 - x > 0$，即 $x < 4$。每个部分在其定义域内连续，因此 $f$ 在其定义域 $[1, 4)$ 上连续。 $[1, 4]$ 包含 4，其中 $\ln 0$ 未定义； $(1, 4)$ 排除 1，其中 $f$ 右连续； $(-\infty, 4)$ 忘记了平方根。

? 函数 $f$ 在 $[1, 4]$ 上连续，具有 $f(1) = 5$ 和 $f(4) = -2$。哪一说法必须为真？
- [x] $f(c) = 0$ 在 $(1, 4)$ 的至少一个 $c$ 处成立
- [ ] $f(c) = 0$ 在 $(1, 4)$ 的恰好一个 $c$ 处成立
- [ ] $f$ 是在 $[1, 4]$ 上递减的
- [ ] $f(c) = 6$ 对某个 $c$ 在 $(1, 4)$ 中成立
> 0 位于 $f(1) = 5$ 和 $f(4) = -2$ 之间，因此根据中间值定理，至少存在一个 $c$ 满足 $f(c) = 0$。它并没有说明恰好有一个：图像可能与轴相交三次。没有任何东西迫使 $f$ 一直递减。而且 6 并不在 5 和 $-2$ 之间，因此定理对此没有说明。

? 二分法从括号 $[0, 3]$ 开始。经过 8 步后，括号的宽度为
- [ ] $3/8 = 0.375$
- [ ] $3/2^7 \approx 0.0234$
- [ ] $0.3/8 = 0.0375$
- [x] $3/2^8 \approx 0.0117$
> 每一步都将宽度减半，因此经过 8 步后宽度为 $(3 - 0)/2^8 = 3/256 \approx 0.0117$。用 8 而不是 $2^8$ 来除，是将方法视为将区间分成 8 等分； $3/2^7$ 是 7 步后的宽度；而 $0.3/8$ 在这里没有意义。

? 哪个函数和区间使得极值定理保证存在最大值？
- [ ] $1/x$ 在 $(0, 1]$ 上
- [ ] $\tan x$ 在 $[0, \pi]$ 上
- [x] $x^3 - 5x$ 在 $[-3, 3]$ 上
- [ ] $x$ 在 $(0, 1)$ 上
> $x^3 - 5x$ 是多项式，在闭区间 $[-3, 3]$ 上连续，因此定理适用。$(0, 1]$ 不是闭的，且 $1/x$ 在 0 附近无界；$\tan x$ 在 $\pi/2$ 处无定义，而该点位于 $[0, \pi]$ 内部；在开区间 $(0, 1)$ 上，$x$ 没有最大值。

? $y = \dfrac{x^2 - 4}{x^2 - 3x + 2}$ 的垂直渐近线为
- [ ] $x = 1$ 和 $x = 2$
- [x] $x = 1$ 仅
- [ ] $x = 2$ 仅
- [ ] $x = -2$ 和 $x = 1$
> 分解： $\dfrac{(x - 2)(x + 2)}{(x - 2)(x - 1)} = \dfrac{x + 2}{x - 1}$ 在 $x \ne 2$ 处分解。在 2 处分解因子被约去，极限为 4：一个空洞，而非渐近线。在 1 处，分子趋于 3 而分母趋于 0，因此函数值趋于无穷大。 $x = -2$ 是函数为 0 的点，而非渐近线。

? $y = \dfrac{6x^2 + x}{2x^2 - 8}$ 的图像具有
- [ ] 水平渐近线 $y = 3$ 且无垂直渐近线
- [ ] 垂直渐近线 $x = \pm 2$ 和水平渐近线 $y = 0$
- [ ] 垂直渐近线 $x = 4$ 和水平渐近线 $y = 3$
- [x] 垂直渐近线 $x = \pm 2$ 和水平渐近线 $y = 3$
> 度数相等，因此 $y \to 6/2 = 3$ 在两端。分母 $2(x - 2)(x + 2)$ 在 $\pm2$ 处为 0，而分子（26 和 22）不为 0，因此两条直线都是垂直渐近线。渐近线 $y = 0$ 需要分子的次数低于分母，而 $x = 4$ 来自于解 $2x - 8 = 0$ 而不是 $2x^2 - 8 = 0$。

? 哪个陈述是错误的？
- [x] $2^n = O(n^{10})$
- [ ] $5n^2 + 100n = O(n^2)$
- [ ] $n\log_2 n = O(n^2)$
- [ ] $\ln n \ll \sqrt n$
> $n^{10} \ll 2^n$（定理 3.11），因此 $2^n/n^{10}$ 无界增长，且没有常数 $C$ 能使 $2^n \le Cn^{10}$ 对所有足够大的 $n$ 成立： $2^n$ 不等于 $O(n^{10})$，尽管 $n^{10}$ 在 2 到 58 的每个 $n$ 中更大。其余三个陈述为真： $5n^2 + 100n \le 105n^2$ 对 $n \ge 1$； $n\log_2 n \le n^2$ 因为 $\log_2 n \le n$；和 $\ln n/\sqrt n \to 0$。
```

```check
fq1 = (x**2 - 1)/(x - 1); same(cancel(fq1), x + 1); limit_is(fq1, x, 1, 2); holds(Ne(2, 3))
from sympy.calculus.util import continuous_domain
same(continuous_domain(sqrt(x - 1) + log(4 - x), x, S.Reals), Interval.Ropen(1, 4))
holds(-2 < 0 < 5); holds(not (-2 < 6 < 5))
same(Rational(3, 2**8), Rational(3, 256)); rounds(Rational(3, 2**8), '0.0117'); rounds(Rational(3, 2**7), '0.0234'); rounds(Rational(3, 8), '0.375'); rounds(Rational(3, 80), '0.0375')
limit_is(tan(x), x, pi/2, oo, '-'); limit_is(1/x, x, 0, oo, '+')
fq6 = (x**2 - 4)/(x**2 - 3*x + 2); same(cancel(fq6), (x + 2)/(x - 1)); limit_is(fq6, x, 2, 4); limit_is(fq6, x, 1, oo, '+'); limit_is(fq6, x, 1, -oo, '-')
fq7 = (6*x**2 + x)/(2*x**2 - 8); limit_is(fq7, x, oo, 3); limit_is(fq7, x, -oo, 3); same(factor(2*x**2 - 8), 2*(x - 2)*(x + 2))
same((6*x**2 + x).subs(x, 2), 26); same((6*x**2 + x).subs(x, -2), 22); limit_is(fq7, x, 2, oo, '+')
limit_is(2**n/n**10, n, oo, oo); same(factor(105*n**2 - (5*n**2 + 100*n)), 100*n*(n - 1)); limit_is(log(n)/sqrt(n), n, oo, 0)
holds(all(k_**10 > 2**k_ for k_ in range(2, 59)))
```
