---
title: 面积与定积分
part: 3
lead: 把细长矩形的面积相加，再取极限，就能精确求面积和路程。你将手算黎曼和并用计算机检验，通过黎曼和的极限定义定积分，再利用积分的性质、几何和对称性计算或估计其值。
minutes: 270
needs: 模块 1 到 8，特别是极限（模块 2）、连续性和极值定理（模块 3）以及速度（模块 4）
goals:
  - 将和写成求和符号形式，并证明和使用 $1 + 2 + \dots + n$ 和 $1, 2, \dots, n$ 的平方和、立方和的公式
  - 计算左、右和中点黎曼和，并从速度读数估算距离
  - 定义定积分，并将积分表示为黎曼和的极限来精确计算
  - 将积分解释为有符号面积，并利用几何和对称性来计算积分
  - 利用积分的性质来合并、比较和限制积分
  - 求函数的平均值，并使用积分的中值定理
---

## 面积与距离 {#area-distance}

模块 1 提出了两个问题（[第 1.1 节](module_01_ZH.html#two-problems)）。切线问题要求求曲线在一点的斜率，第 II 部分用导数解决了这个问题。面积问题要求求曲线下的面积，图 1.1 提示了一种方法：用细长的矩形填满该区域，将它们的面积相加，并观察当矩形越来越细时，总和趋近于什么数值。本模块将实施这一计划。它的答案是 **定积分**，微积分的第二个重要思想。

### 面积问题 {#area-problem}

你知道矩形的面积（宽乘以高）和三角形的面积（底的一半乘以高），并且每个多边形都可以分割成三角形。具有曲边的区域则不同：无法通过切割将其转化为三角形。考虑最简单的例子，即抛物线 $y = x^2$ 从 $x = 0$ 到 $x = 1$ 之间的区域，该区域由曲线、 $x$ 轴和直线 $x = 1$ 所围成。称其面积为 $A$。

你暂时还不能计算 $A$，但你可以将其夹在两个值之间。这个想法很古老：公元前3世纪，阿基米德用“穷竭法”找到了面积，通过用更简单的形状不断填满一个区域，这种方法是本模块中和的前身。将 $[0, 1]$ 分成四个宽度为 $\tfrac14$ 的条带。曲线在每个条带内上升，因此一个高度等于曲线上该条带左端点高度的矩形会位于曲线下方，而一个高度等于曲线上该条带右端点高度的矩形则会覆盖该条带在区域中的部分（图9.1，左图）。

::: example 用两个和夹住一个面积
用四个条带，找出曲线 $y = x^2$ 在区间 0 到 1 下方的面积 $A$ 的一个下界和一个上界。

条带为$\big[0, \tfrac14\big]$、$\big[\tfrac14, \tfrac12\big]$、$\big[\tfrac12, \tfrac34\big]$和$\big[\tfrac34, 1\big]$，每个宽度为$\tfrac14$。在它们的左端，曲线的高度分别为$0^2$、$\big(\tfrac14\big)^2$、$\big(\tfrac12\big)^2$和$\big(\tfrac34\big)^2$，即$0$、$\tfrac{1}{16}$、$\tfrac{4}{16}$和$\tfrac{9}{16}$。因此，曲线下矩形的总面积为

$$\begin{aligned} &\frac14\Big(0 + \frac{1}{16} + \frac{4}{16} + \frac{9}{16}\Big) \\ &\quad= \frac{14}{64} = 0.21875. \end{aligned}$$

在右侧端点的高度分别是 $\tfrac{1}{16}$, $\tfrac{4}{16}$, $\tfrac{9}{16}$ 和 $1$，因此覆盖的矩形总面积为

$$\begin{aligned} &\frac14\Big(\frac{1}{16} + \frac{4}{16} + \frac{9}{16} + \frac{16}{16}\Big) \\ &\quad= \frac{30}{64} = 0.46875. \end{aligned}$$

该区域包含前四个矩形，并位于后四个矩形内部，因此

$$0.21875 < A < 0.46875.$$

两个总面积相差 $0.25$。每个高度（除第一个和最后一个外）在两个总面积中都出现，因此差值为 $\tfrac14\big(1 - 0\big)$：即条带宽度乘以 $[0, 1]$ 两端高度之差。

```check
f91 = lambda X: sympify(X)**2
lo = Rational(1, 4)*sum(f91(Rational(k, 4)) for k in range(4))
hi = Rational(1, 4)*sum(f91(Rational(k, 4)) for k in range(1, 5))
same([f91(Rational(k, 4)) for k in range(4)], [0, Rational(1, 16), Rational(4, 16), Rational(9, 16)])
steps(lo, Rational(14, 64), Rational(21875, 100000)); steps(hi, Rational(30, 64), Rational(46875, 100000))
same(hi - lo, Rational(1, 4)); same(Rational(1, 4)*(f91(1) - f91(0)), Rational(1, 4))
holds(lo < Rational(1, 3)); holds(Rational(1, 3) < hi)
```
:::

四个条带留下较大的间隙，但更细的条带可以填补。使用 100 个条带时，两个总面积分别为 0.32835 和 0.33835（第 9.3 节计算得出），间隙仅为 $\tfrac{1}{100}$。它们逐渐逼近 $\tfrac13$，第 9.3 节证明了 $A = \tfrac13$。

```check
L100 = Rational(1, 100)*sum(Rational(k, 100)**2 for k in range(100))
R100 = Rational(1, 100)*sum(Rational(k, 100)**2 for k in range(1, 101))
same(L100, Rational(32835, 10**5)); same(R100, Rational(33835, 10**5)); same(R100 - L100, Rational(1, 100))
```

### 距离问题 {#distance-problem}

一辆以恒定速度 20 m/s 行驶 10 秒的汽车行驶了 $20 \times 10 = 200$ 米。在速度-时间图上，速度是一条高度为 20 的水平线，距离是其下方矩形的面积：宽度为 10 秒，高度为 20 米每秒。单位相乘，秒乘以米每秒得到米。

当速度变化时，速度图下方的面积仍然是距离。模块 1 中下落的球在 $t$ 秒后速度为 $v(t) = 9.8t$ m/s（[第 4.1 节](module_04_ZH.html#tangents)）。其速度图是一条通过原点的直线，因此从时间 0 到时间 $t$ 的区域是一个底边为 $t$、高为 $9.8t$ 的三角形，面积为

$$\frac12 \cdot t \cdot 9.8t = 4.9t^2.$$

这正是球下落的距离 $s(t) = 4.9t^2$（[第 1.3 节](module_01_ZH.html#functions)）。这并非巧合：第 9.4 节解释了原因，模块 10 证明了这一点。

```check
same(Rational(1, 2)*t*Rational(98, 10)*t, Rational(49, 10)*t**2)
same(diff(Rational(49, 10)*t**2, t), Rational(98, 10)*t)
```

通常没有速度的公式，只有读数。

::: example 从速度表计算距离
假设一位乘客每隔 2 秒读取一次汽车的速度表，当汽车从静止加速时，将读数转换为米每秒。这些数字是虚构的：

| 时间 $t$ (秒) | 速度 $v$ (米/秒) |
|---|---|
| 0 | 0 |
| 2 | 6 |
| 4 | 11 |
| 6 | 15 |
| 8 | 18 |
| 10 | 20 |

估计这 10 秒内汽车行驶的距离。

汽车在整个过程中加速，因此在每个2秒的时间间隔内，其速度介于该间隔开始时的读数与结束时的读数之间。在$m$到$M$的速度范围内持续$\Delta t$秒，汽车行驶的距离介于$m\,\Delta t$到$M\,\Delta t$米之间。（模块8的[均值定理](module_08_ZH.html#mvt)使这一点精确化：从$t_1$到$t_2$所覆盖的距离为$v(c)(t_2 - t_1)$，对应于其间某个时刻$c$。）对五个区间求和，距离至少为

$$\begin{aligned} &2(0 + 6 + 11 + 15 + 18) \\ &\quad= 2 \times 50 = 100 \text{ m} \end{aligned}$$

并且最多为

$$\begin{aligned} &2(6 + 11 + 15 + 18 + 20) \\ &\quad= 2 \times 70 = 140 \text{ m}. \end{aligned}$$

因此，汽车行驶的距离介于 100 米和 140 米之间。这两个值的平均值 120 米是一个合理的单一估计值；模块 11 在“梯形法则”的名称下研究了这一点。

两个估计值相差 40 米。在 2、4、6 和 8 秒时的读数同时出现在两个总和中，因此差异为 $2 \times (20 - 0)$：时间步长乘以从第一个读数到最后一个读数的速度变化。每秒读一次速度表，差距将减半，为 20 米。

```check
V92 = [0, 6, 11, 15, 18, 20]
lo92 = 2*sum(V92[:5]); hi92 = 2*sum(V92[1:])
same(sum(V92[:5]), 50); same(lo92, 100); same(sum(V92[1:]), 70); same(hi92, 140)
same((lo92 + hi92)/2, 120); same(hi92 - lo92, 40); same(2*(V92[-1] - V92[0]), 40); same(1*(V92[-1] - V92[0]), 20)
```
:::

::: figure id=fig-09-1
两个问题其实是同一个。左：曲线 $y = x^2$ 在 0 到 1 之间的面积介于蓝色矩形的总和 0.21875 和橙色矩形的总和 0.46875 之间（例 9.1）。右：例 9.2 的速度读数（点）；所行距离介于蓝色总和 100 米和橙色总和 140 米之间。
:::

::: keyidea
面积问题和距离问题实际上是同一个问题。将区间分成小段；在每一小段上，将变化的高度（或速度）用一个常数代替；将矩形的面积相加，即高度乘以宽度（或速度乘以时间）；然后让这些小段变小。总和趋近于精确答案。本模块其余部分将这些步骤转化为一个定义，即定积分，并转化为计算定积分的方法。
:::

::: pitfall
左端的读数只给出下界估计，这是因为速度在增加。对于减速的汽车，它们给出上界估计（练习 9.3）。对于先上升后下降的速度，这两个和都不必是下界或上界估计（练习 9.9）。
:::

## 西格玛符号 {#sigma}

第 9.1 节的和有四个或五个项。更细的条带会产生更长的和，可能有上千项，或有 $n$ 项，其中 $n$ 是未知数。它们需要一种紧凑的符号表示。

::: definition 西格玛符号
对于整数 $m \le n$ 和数 $a_m, a_{m+1}, \dots, a_n$，

$$\sum_{i=m}^{n} a_i = a_m + a_{m+1} + \dots + a_n.$$

符号 $\sum$ 是希腊大写西格玛，表示“求和”，左边读作“$a_i$ 从 $i$ 到 $m$ 的和”。字母 $n$ 是求和的 $i$ 下标 **，**和 $m$ 是求和的 $n$ 下限** 和上限 **。
:::

下标变量遍历所有整数 $m, m + 1, \dots, n$，每个值对应一项，因此共有 $n - m + 1$ 项。（此处的“极限”表示范围的端点，而非模块 2 中的“极限”概念。）例如，

$$\begin{aligned} \sum_{i=1}^{5} i^2 &= 1 + 4 + 9 + 16 + 25 = 55, \\[5pt] \sum_{k=0}^{3} 2^k &= 1 + 2 + 4 + 8 = 15, \\[5pt] \sum_{i=1}^{4} \frac{1}{i} &= 1 + \frac12 + \frac13 + \frac14 = \frac{25}{12}. \end{aligned}$$

下标是一个 **虚拟变量（dummy variable）**：其名称无关紧要，因此 $\sum_{i=1}^{5} i^2$ 和 $\sum_{k=1}^{5} k^2$ 是同一个数 55，且都不依赖于 $i$ 或 $k$。反过来，从求和表达式转换为西格玛符号，需找到下标 $i$ 对应的项的公式。奇数 $1, 3, 5, \dots$ 是 $2i - 1$ 到 $i = 1, 2, 3, \dots$ 的和，即 $2i - 1 = 99$ 在 $i = 50$ 处，因此

$$1 + 3 + 5 + \dots + 99 = \sum_{i=1}^{50} (2i - 1).$$

如果 $v_i$ 是例 9.2 在时间 $t = 2i$ 的速度读数，那么那里的两个估计值分别是 $\sum_{i=0}^{4} 2v_i = 100$ 和 $\sum_{i=1}^{5} 2v_i = 140$。

```check
i = symbols('i', integer=True)
same(summation(i**2, (i, 1, 5)), 55); same(1 + 4 + 9 + 16 + 25, 55)
same(summation(2**k, (k, 0, 3)), 15); same(summation(1/i, (i, 1, 4)), Rational(25, 12))
same(summation(k**2, (k, 1, 5)), summation(i**2, (i, 1, 5)))
same(solve(2*x - 1 - 99, x), [50]); same(summation(2*i - 1, (i, 1, 50)), sum(range(1, 100, 2)))
same(sum(2*V92[j] for j in range(0, 5)), 100); same(sum(2*V92[j] for j in range(1, 6)), 140)
```

::: theorem 和的规则
对于数 $a_i$ 和 $b_i$，一个常数 $c$ 和整数 $m \le n$（在第三条规则中 $n \ge 1$ 出现），

$$\begin{aligned} \sum_{i=m}^{n} c\,a_i &= c\sum_{i=m}^{n} a_i, \\[5pt] \sum_{i=m}^{n} \big(a_i + b_i\big) &= \sum_{i=m}^{n} a_i + \sum_{i=m}^{n} b_i, \\[5pt] \sum_{i=1}^{n} c &= nc. \end{aligned}$$

第二条规则同样适用于将 $-$ 替换为 $+$ 的情况。
:::

::: proof
将和写出来。第一条规则是分配律：$ca_m + \dots + ca_n = c(a_m + \dots + a_n)$。第二条规则重新分组项，这是加法允许的：$(a_m + b_m) + \dots + (a_n + b_n) = (a_m + \dots + a_n) + (b_m + \dots + b_n)$。在第三条规则中，项 $c$ 不依赖于 $i$，因此和为 $c + c + \dots + c$，共有 $n$ 项，即 $nc$。包含 $-$ 的规则由前两条规则推导得出，即 $c = -1$。
:::

```check
Aseq, Bseq = IndexedBase('A'), IndexedBase('B')
for N_ in range(1, 6):
    same(Sum(c*Aseq[i], (i, 1, N_)).doit(), c*Sum(Aseq[i], (i, 1, N_)).doit())
    same(Sum(Aseq[i] + Bseq[i], (i, 1, N_)).doit(), Sum(Aseq[i], (i, 1, N_)).doit() + Sum(Bseq[i], (i, 1, N_)).doit())
    same(Sum(Aseq[i] - Bseq[i], (i, 1, N_)).doit(), Sum(Aseq[i], (i, 1, N_)).doit() - Sum(Bseq[i], (i, 1, N_)).doit())
same(summation(c, (i, 1, n)), n*c)
```

::: pitfall
和并不逐项相乘：$\sum a_i b_i$ 不等于 $\big(\sum a_i\big)\big(\sum b_i\big)$。对于 $a_i = b_i = i$ 和 $n = 2$，$\sum_{i=1}^{2} i \cdot i = 1 + 4 = 5$，而 $(1 + 2)(1 + 2) = 9$。和也不逐项相除，或置于根号下。一个常数相加 $n$ 次等于 $nc$，而不是 $c$：$\sum_{i=1}^{10} 3 = 30$。

```check
same(summation(i*i, (i, 1, 2)), 5); same(summation(i, (i, 1, 2))**2, 9); same(summation(3, (i, 1, 10)), 30)
```
:::

### 幂的和 {#power-sums}

$x$、$x^2$ 和 $x^3$ 的黎曼和（第 9.3 和 9.4 节，以及练习 9.5）导致从 1 到 $n$ 的整数和，以及它们的平方和立方和。每个都有一个闭合表达式。

::: theorem 幂的和
对于每一个整数 $n \ge 1$，从 1 到 $n$ 的整数和、它们的平方和以及它们的立方和为

$$\begin{aligned} \sum_{i=1}^{n} i &= \frac{n(n + 1)}{2}, \\[5pt] \sum_{i=1}^{n} i^2 &= \frac{n(n + 1)(2n + 1)}{6}, \\[5pt] \sum_{i=1}^{n} i^3 &= \left(\frac{n(n + 1)}{2}\right)^2. \end{aligned}$$
:::

以下三个证明使用了三种不同的思想，每种都值得掌握。

::: proof 从 1 到 $n$ 的整数和
这是通常以高斯命名的配对论证。将和 $S = 1 + 2 + \dots + n$ 从前往后和从后往前写出，然后按列相加：

$$\begin{aligned} S &= 1 + 2 + \dots + n, \\ S &= n + (n - 1) + \dots + 1, \\ 2S &= (n + 1) + \dots + (n + 1). \end{aligned}$$

每一列的两个数相加等于 $n + 1$，因为一个数增加 1 时，另一个数减少 1；共有 $n$ 列。因此 $2S = n(n + 1)$，和 $S = \dfrac{n(n + 1)}{2}$。
:::

::: proof 平方和
展开 $(i + 1)^3 = i^3 + 3i^2 + 3i + 1$ 得到，对于每一个 $i$，

$$(i + 1)^3 - i^3 = 3i^2 + 3i + 1.$$

将以下方程加到 $i = 1, 2, \dots, n$。左边几乎所有项都相互抵消：

$$\begin{aligned} &\sum_{i=1}^{n}\big[(i + 1)^3 - i^3\big] \\[5pt] &\quad= (2^3 - 1^3) + (3^3 - 2^3) + \dots \\[5pt] &\qquad + \big((n + 1)^3 - n^3\big) \\[5pt] &\quad= (n + 1)^3 - 1, \end{aligned}$$

因为除了 $(n + 1)^3$ 和 $1^3$ 以外，每个立方体都出现一次加号和一次减号。像这样坍缩的和，像折叠裂项相消一样，称为 **裂项相消和（telescoping sum）**。右边，对于 $S = \sum_{i=1}^{n} i^2$，和的规则以及第一个公式给出

$$\begin{aligned} &\sum_{i=1}^{n}\big(3i^2 + 3i + 1\big) \\[5pt] &\quad= 3S + \frac{3n(n + 1)}{2} + n. \end{aligned}$$

所以 $3S = (n + 1)^3 - 1 - n - \tfrac{3n(n + 1)}{2}$。由于 $-1 - n = -(n + 1)$，右边的每一项都包含因子 $n + 1$；将其提出并化简：

$$\begin{aligned} 3S &= (n + 1)\Big[(n + 1)^2 - 1 - \frac{3n}{2}\Big] \\ &= (n + 1)\Big(n^2 + \frac{n}{2}\Big) \\ &= \frac{n(n + 1)(2n + 1)}{2}. \end{aligned}$$

除以 3 得到第二个公式。
:::

第三个证明使用 **数学归纳法**，这是 [练习 5.10](module_05_ZH.html#ex-5-10)] 用来证明幂法则的方法。它通过两个步骤证明一个陈述 $P(n)$ 对于每一个整数 $n \ge 1$ 都成立：

- **基础情形**：$P(1)$ 成立；
- **归纳步骤**：对于每一个 $k \ge 1$，如果 $P(k)$ 成立，那么 $P(k + 1)$ 也成立。

那么 $P(1)$ 成立；根据归纳步骤与 $k = 1$，$P(2)$ 也成立；同样，$P(3)$ 也成立，依据 $k = 2$；如此类推，如同一排多米诺骨牌，每一枚都推倒下一枚。

::: proof 立方和的和
设 $P(n)$ 表示 $\sum_{i=1}^{n} i^3 = \dfrac{n^2(n + 1)^2}{4}$。对于基础情形，当 $n = 1$ 时，两边均为 1。对于归纳步骤，假设对于某个 $k \ge 1$，$P(k)$ 成立。前 $k + 1$ 项的和等于前 $k$ 项的和加上一项，因此，提取公共因子 $(k + 1)^2$，

$$\begin{aligned} \sum_{i=1}^{k+1} i^3 &= \frac{k^2(k + 1)^2}{4} + (k + 1)^3 \\[5pt] &= \frac{(k + 1)^2\big(k^2 + 4k + 4\big)}{4} \\[5pt] &= \frac{(k + 1)^2(k + 2)^2}{4}. \end{aligned}$$

即为 $P(k + 1)$：将 $k + 1$ 代入 $n$ 的公式。通过归纳法，可知对于每个 ${n \ge 1}$，$P(n)$ 成立。
:::

```check
S1 = n*(n + 1)/2; S2 = n*(n + 1)*(2*n + 1)/6; S3 = (n*(n + 1)/2)**2
same(summation(i, (i, 1, n)), S1); same(summation(i**2, (i, 1, n)), S2); same(summation(i**3, (i, 1, n)), S3)
same(2*S1, n*(n + 1))                                                   # the pairing: n columns of n + 1
same(expand((i + 1)**3 - i**3), 3*i**2 + 3*i + 1)
same(summation((i + 1)**3 - i**3, (i, 1, n)), (n + 1)**3 - 1)
same(summation(3*i**2 + 3*i + 1, (i, 1, n)), 3*S2 + 3*n*(n + 1)/2 + n)
steps((n + 1)**3 - 1 - n - 3*n*(n + 1)/2, (n + 1)*((n + 1)**2 - 1 - 3*n/2), (n + 1)*(n**2 + n/2), n*(n + 1)*(2*n + 1)/2)
same(S3.subs(n, 1), 1)
steps(k**2*(k + 1)**2/4 + (k + 1)**3, (k + 1)**2*(k**2 + 4*k + 4)/4, (k + 1)**2*(k + 2)**2/4, S3.subs(n, k + 1))
```

第三个公式表示 $1^3 + 2^3 + \dots + n^3 = (1 + 2 + \dots + n)^2$：立方和等于和的平方。

::: example 公式求和
求：

- (a) $\sum_{i=1}^{100} i$
- (b) $\sum_{i=1}^{n} (2i - 1)$，即前 $n$ 个奇数的和
- (c) $\sum_{i=1}^{10} \big(3i^2 - 4i\big)$
- (d) $\sum_{i=1}^{20} i^3$

**(a)** 与 $n = 100$：$\dfrac{100 \cdot 101}{2} = 5050$。

**(b)** 根据求和规则和第一个公式，

$$\begin{aligned} \sum_{i=1}^{n} (2i - 1) &= 2\sum_{i=1}^{n} i - \sum_{i=1}^{n} 1 \\[5pt] &= n(n + 1) - n = n^2. \end{aligned}$$

前 $n$ 个奇数的和为 $n^2$: $1 + 3 = 4$, $1 + 3 + 5 = 9$, 依此类推。使用 $n = 50$, $1 + 3 + \dots + 99 = 2500$。

**(c)** 根据包含 $n = 10$, $\sum_{i=1}^{10} i^2 = \dfrac{10 \cdot 11 \cdot 21}{6} = 385$ 和 $\sum_{i=1}^{10} i = 55$ 的公式。因此，和为 $3 \cdot 385 - 4 \cdot 55 = 935$。

**(d)** $\Big(\dfrac{20 \cdot 21}{2}\Big)^2 = 210^2 = 44{,}100$.

```check
same(summation(i, (i, 1, 100)), 5050); same(Rational(100*101, 2), 5050)
steps(Sum(2*i - 1, (i, 1, n)), 2*Sum(i, (i, 1, n)) - Sum(1, (i, 1, n)), n*(n + 1) - n, n**2)
same(1 + 3, 4); same(1 + 3 + 5, 9); same(summation(2*i - 1, (i, 1, 50)), 2500)
same(Rational(10*11*21, 6), 385); same(summation(i**2, (i, 1, 10)), 385); same(summation(i, (i, 1, 10)), 55)
steps(summation(3*i**2 - 4*i, (i, 1, 10)), 3*385 - 4*55, 1155 - 220, 935)
steps(summation(i**3, (i, 1, 20)), Rational(20*21, 2)**2, 210**2, 44100)
```
:::

::: compute 使用 Python 和 SymPy 的求和
Python 内置的 `sum` 可以将给定的数字相加，而 `range(1, n + 1)` 可以生成从 1 到 $n$ 的整数：

```python
print(sum(range(1, 101)))                # 1 + 2 + ... + 100
print(sum(i**2 for i in range(1, 11)))   # 1 + 4 + ... + 100
print(sum(range(1, 100)))                # stops at 99
```

```output
5050
385
4950
```

`range(a, b)` 在 `b` 之前停止，因此第三行漏掉了 100：典型的 off-by-one 错误。SymPy 的 `summation` 可以求和上限为符号的和。声明符号为正整数可以告诉它 $i$ 和 $n$ 是什么类型的数：

```python
import sympy as sp
i, n = sp.symbols('i n', integer=True, positive=True)
S2 = sp.summation(i**2, (i, 1, n))
print(S2)
print(sp.factor(S2))
print(sp.factor(sp.summation(i**3, (i, 1, n))))
print(sp.summation(2*i - 1, (i, 1, n)))
```

```output
n**3/3 + n**2/2 + n/6
n*(n + 1)*(2*n + 1)/6
n**2*(n + 1)**2/4
n**2
```

SymPy 返回平方和的展开形式； `factor` 将其转换为定理 9.2 的形式。
:::

## 黎曼和 {#riemann-sums}

以下为第9.1节的一般求和内容。设 $f$ 在 $[a, b]$ 上定义，并将 $[a, b]$ 等分成 $n$ 个等宽子区间

$$\Delta x = \frac{b - a}{n},$$

读作 "delta x"。切割点为 $x_i = a + i\,\Delta x$ 对应 $i = 0, 1, \dots, n$，因此 $x_0 = a$ 和 $x_n = b$，且第 $i$ 个子区间为 $[x_{i-1}, x_i]$。在每个子区间上取一个高度：即在该子区间的左端点 $x_{i-1}$、右端点 $x_i$ 或中点处 $f$ 的值

$$m_i = \frac{x_{i-1} + x_i}{2} = a + \Big(i - \frac12\Big)\Delta x.$$

::: definition 左和、右和与中点和
用这种记号表示，函数 $f$ 在 $[a, b]$ 上，将 $n$ 个子区间划分的左和 **left sum**、右和 **right sum**和中点和**midpoint sum** 为

$$\begin{aligned} L_n &= \sum_{i=1}^{n} f(x_{i-1})\,\Delta x, \\[5pt] R_n &= \sum_{i=1}^{n} f(x_i)\,\Delta x, \\[5pt] M_n &= \sum_{i=1}^{n} f(m_i)\,\Delta x. \end{aligned}$$

它们是 **Riemann 和** 的例子，以德国数学家 Riemann 命名，他在 1854 年定义了第 9.4 节中的积分（该成果于 1868 年发表）。
:::

当 $f$ 为正时，每一项是宽度为 $\Delta x$ 的矩形的面积；当 $f$ 为负时，该项为负值，第 9.4 节解释了这样的项代表什么。在例 9.1 中，两个总和分别为 $L_4 = 0.21875$ 和 $R_4 = 0.46875$ 对于 $f(x) = x^2$ 在 $[0, 1]$ 上的积分。对于一个正的递增函数， $L_n$ 总是面积的下界估计， $R_n$ 是上界估计；对于一个正的递减函数，则正好相反。

```check
x9 = symbols('x9')
def Lsum(f_, a_, b_, N_):
    d_ = (sympify(b_) - a_)/N_
    return sum(f_.subs(x9, a_ + j*d_) for j in range(N_))*d_
def Rsum(f_, a_, b_, N_):
    d_ = (sympify(b_) - a_)/N_
    return sum(f_.subs(x9, a_ + j*d_) for j in range(1, N_ + 1))*d_
def Msum(f_, a_, b_, N_):
    d_ = (sympify(b_) - a_)/N_
    return sum(f_.subs(x9, a_ + (j + Rational(1, 2))*d_) for j in range(N_))*d_
same(Lsum(x9**2, 0, 1, 4), Rational(21875, 100000)); same(Rsum(x9**2, 0, 1, 4), Rational(46875, 100000))
```

::: example 三个和式用于 $1/x$
求 $L_4$、$R_4$ 和 $M_4$ 在 $f(x) = 1/x$ 上 $[1, 2]$ 的积分，精确到小数点后四位，并说明它们告诉你的关于图像下方面积的信息。

这里 $\Delta x = \tfrac{2 - 1}{4} = \tfrac14$。分界点是 $1$、$\tfrac54$、$\tfrac32$、$\tfrac74$ 和 $2$，其中 $f$ 取值为 $1$、$\tfrac45$、$\tfrac23$、$\tfrac47$ 和 $\tfrac12$。因此

$$\begin{aligned} L_4 &= \frac14\Big(1 + \frac45 + \frac23 + \frac47\Big) \\ &= \frac{319}{420} \approx 0.7595, \\ R_4 &= \frac14\Big(\frac45 + \frac23 + \frac47 + \frac12\Big) \\ &= \frac{533}{840} \approx 0.6345. \end{aligned}$$

中点分别是 $\tfrac98$, $\tfrac{11}{8}$, $\tfrac{13}{8}$ 和 $\tfrac{15}{8}$，其中 $f$ 取值为 $\tfrac89$, $\tfrac{8}{11}$, $\tfrac{8}{13}$ 和 $\tfrac{8}{15}$：

$$\begin{aligned} M_4 &= \frac14\Big(\frac89 + \frac{8}{11} + \frac{8}{13} + \frac{8}{15}\Big) \\ &\approx 0.6912. \end{aligned}$$

由于 $1/x$ 在 $[1, 2]$ 上递减，因此在每个子区间内，其左端点的值最大，右端点的值最小。因此，左端点的矩形覆盖了区域，而右端点的矩形则位于区域内（图9.2）：面积 $A$ 介于 $R_4 \approx 0.6345$ 和 $L_4 \approx 0.7595$ 之间。中点求和的值也介于两者之间，因为每个中点高度在其子区间端点高度之间。它还比 $A$ 更接近：每个中点矩形在其子区间的左半部分低于曲线，在右半部分则超出曲线，这两个误差几乎相互抵消。模块10显示 $A = \ln 2 \approx 0.693147$，因此 $M_4$ 已经在 0.002 以内。

```check
fx94 = 1/x9
same([fx94.subs(x9, v_) for v_ in (1, Rational(5, 4), Rational(3, 2), Rational(7, 4), 2)], [1, Rational(4, 5), Rational(2, 3), Rational(4, 7), Rational(1, 2)])
L94, R94, M94 = Lsum(fx94, 1, 2, 4), Rsum(fx94, 1, 2, 4), Msum(fx94, 1, 2, 4)
steps(L94, Rational(1, 4)*(1 + Rational(4, 5) + Rational(2, 3) + Rational(4, 7)), Rational(319, 420)); rounds(L94, '0.7595')
steps(R94, Rational(1, 4)*(Rational(4, 5) + Rational(2, 3) + Rational(4, 7) + Rational(1, 2)), Rational(533, 840)); rounds(R94, '0.6345')
same([fx94.subs(x9, v_) for v_ in (Rational(9, 8), Rational(11, 8), Rational(13, 8), Rational(15, 8))], [Rational(8, 9), Rational(8, 11), Rational(8, 13), Rational(8, 15)])
same(M94, Rational(1, 4)*(Rational(8, 9) + Rational(8, 11) + Rational(8, 13) + Rational(8, 15))); rounds(M94, '0.6912')
holds(R94 < M94); holds(M94 < L94)
for j in range(4):                                  # each midpoint height lies between the heights at the two ends
    holds(fx94.subs(x9, 1 + Rational(j + 1, 4)) < fx94.subs(x9, 1 + Rational(2*j + 1, 8))); holds(fx94.subs(x9, 1 + Rational(2*j + 1, 8)) < fx94.subs(x9, 1 + Rational(j, 4)))
same(integrate(1/x, (x, 1, 2)), log(2)); rounds(log(2), '0.693147'); holds(Abs(M94 - log(2)) < Rational(2, 1000))
holds(R94 < log(2)); holds(log(2) < L94)
```
:::

::: figure id=fig-09-2
左、右和中点求和法用于 $f(x) = 1/x$ 在 $[1, 2]$ 上的 $n = 4$（例9.4）；点标记了高度被取的位置。由于 $1/x$ 是递减的，左端的矩形在图上方突出，右端的矩形则在图下方；中点矩形在每个子区间左半部分低于图线，在右半部分则高于图线。
:::

当 $n$ 增大时，这些和如何趋近于面积？以下是 $f(x) = x^2$ 在 $[0, 1]$ 上的三种和：

```valuetable
n = 4, 10, 100
$L_n$ = Sum((i/n)**2, (i, 0, n - 1))/n
$R_n$ = Sum((i/n)**2, (i, 1, n))/n
$M_n$ = Sum(((i - 1/2)/n)**2, (i, 1, n))/n
digits = 8
---
n | L_n | R_n | M_n
4 | 0.21875 | 0.46875 | 0.328125
10 | 0.285 | 0.385 | 0.3325
100 | 0.32835 | 0.33835 | 0.333325
```

所有三种和都逐渐逼近 $\tfrac13 = 0.3333\ldots$：对于任何递增函数，左和从下方趋近，右和从上方趋近，而中点和则比两者都快得多。一个近似值的 **误差** 是精确值减去近似值：当近似值过小时为正，当近似值过大时为负。误差显示出收敛速度：

```valuetable
n = 10, 20, 40, 80
$\tfrac13 - R_n$ = 1/3 - Sum((i/n)**2, (i, 1, n))/n
$\tfrac13 - M_n$ = 1/3 - Sum(((i - 1/2)/n)**2, (i, 1, n))/n
decimals = 8
---
n | \tfrac13 - R_n | \tfrac13 - M_n
10 | -0.05166667 | 0.00083333
20 | -0.02541667 | 0.00020833
40 | -0.01260417 | 0.00005208
80 | -0.00627604 | 0.00001302
```

每次 $n$ 双倍，$R_n$ 的误差大约减半，$L_n$ 的误差也是如此，其大小几乎相同但符号相反；$M_n$ 的误差则被精确地除以 4。下面的精确公式解释了这一点：$R_n$ 的误差大约为 $-\tfrac{1}{2n}$，而 $M_n$ 的误差恰好为 $\tfrac{1}{12n^2}$。因此，使用一千倍的矩形会使左和右求和的精度大约提高一千倍，而中点求和的精度则提高一千万倍。模块 11 解释了原因，并将中点求和、梯形法则和辛普森法则构建为实用的数值积分方法。

```check
LL = lambda N_: Lsum(x9**2, 0, 1, N_); RR = lambda N_: Rsum(x9**2, 0, 1, N_); MM = lambda N_: Msum(x9**2, 0, 1, N_)
for N_ in (10, 20, 40):
    holds(1.8 < (LL(N_) - Rational(1, 3))/(LL(2*N_) - Rational(1, 3)) < 2)
    holds(2 < (RR(N_) - Rational(1, 3))/(RR(2*N_) - Rational(1, 3)) < 2.1)
    same((MM(N_) - Rational(1, 3))/(MM(2*N_) - Rational(1, 3)), 4)
for N_ in (4, 10, 100):
    same(Rational(1, 3) - RR(N_), -Rational(1, 2*N_) - Rational(1, 6*N_**2)); same(Rational(1, 3) - MM(N_), Rational(1, 12*N_**2))
    same(Rational(1, 3) - LL(N_), Rational(1, 2*N_) - Rational(1, 6*N_**2))   # the same size as the error of R_n, opposite sign
eR_ = lambda N_: -Rational(1, 2*N_) - Rational(1, 6*N_**2); eM_ = lambda N_: Rational(1, 12*N_**2)
for N_ in (10, 100):                                # 1000 times as many rectangles: errors / 1000 and / 1000000
    holds(1000 < eR_(N_)/eR_(1000*N_) < 1040); same(eM_(N_)/eM_(1000*N_), 10**6)
holds(LL(10) < LL(100)); holds(LL(100) < Rational(1, 3)); holds(Rational(1, 3) < RR(100)); holds(RR(100) < RR(10))
```

::: compute Python 中的黎曼和
一个简短的函数计算了三种求和。它取 $i = 0, 1, \dots, n - 1$ 在 $a + (i + \text{shift})\,\Delta x$ 处的高，其中左端点的偏移为 0，右端点的偏移为 1，中点的偏移为 $\tfrac12$：

```python
def riemann(f, a, b, n, rule):
    dx = (b - a)/n
    shift = {'left': 0, 'right': 1, 'mid': 0.5}[rule]
    return sum(f(a + (i + shift)*dx) for i in range(n))*dx

def f(x):
    return 1/x

for rule in ['left', 'right', 'mid']:
    print(rule, riemann(f, 1, 2, 4, rule))
```

```output
left 0.7595238095238095
right 0.6345238095238095
mid 0.6912198912198912
```

这三种求和是例 9.4 中的三种和。现在，中点求和的误差，相对于 $\ln 2$（模块 10 将找到的面积）进行测量：

```python
import math
prev = None
for n in [10, 20, 40, 80]:
    err = math.log(2) - riemann(f, 1, 2, n, 'mid')
    note = '' if prev is None else f'   previous/this = {prev/err:.3f}'
    print(f'n = {n:2d}   error = {err:.3e}{note}')
    prev = err
```

```output
n = 10   error = 3.118e-04
n = 20   error = 7.808e-05   previous/this = 3.993
n = 40   error = 1.953e-05   previous/this = 3.998
n = 80   error = 4.883e-06   previous/this = 4.000
```

误差为正：$1/x$ 的中点和是略微偏小的。每次 $n$ 倍增，误差几乎精确地减少为原来的四分之一，如同 $x^2$ 的情况。
:::

::: widget name=riemann-sums
从 $f(x) = x^2$ 开始，位于 $[0, 1]$，左端规则和 $n = 4$：你将看到例 9.1 和 $L_4 = 0.21875$ 中的矩形。切换到右端规则和中点规则，并与上面的第一个表格进行比较。按 **Double n** 几次，观察误差表格：对于左端和右端规则，每次加倍大致将误差减半；对于中点规则，误差大致减少为原来的四分之一。然后选择 $1/x$，用于例 9.4，以及 $\sin x$ 在 $[0, \pi]$，其中面积为 2（模块 10 证明了这一点）。在那里，左端和右端和相等，因为 $\sin 0 = \sin \pi$，并且每次加倍将它们的误差大致减少为原来的四分之一：模块 11 说明了原因。输入 `pi` 和 `2pi` 作为 $\sin x$ 的区间端点，矩形位于轴下方：第 9.4 节解释了它们所计算的内容。梯形规则和辛普森规则属于模块 11。
:::

```check
for N_ in (4, 8):                                   # the caption: for sin x on [0, pi] the left and right sums are equal
    same(Lsum(sin(x9), 0, pi, N_), Rsum(sin(x9), 0, pi, N_))
eS_ = [N(2 - Lsum(sin(x9), 0, pi, N_), 30) for N_ in (4, 8, 16)]
holds(3.9 < eS_[0]/eS_[1] < 4.1); holds(3.9 < eS_[1]/eS_[2] < 4.1)      # each doubling divides the error by about 4
holds(1.9 < (Rational(1, 3) - LL(4))/(Rational(1, 3) - LL(8)) < 2.1)   # x^2: the left error roughly halves
```

::: pitfall
三张黎曼和的便签。首先，$\Delta x$是$\tfrac{b - a}{n}$，不是$\tfrac1n$：在$[1, 3]$上，$n = 4$，$\Delta x = 0.5$。其次，$n$个子区间有$n + 1$个切割点$x_0, \dots, x_n$；左和取前$n$个，右和取后$n$个，因此每个和都有$n$项，不是$n + 1$。第三，中点是子区间的中点，不是$[a, b]$的中点：$M_4$在$[1, 2]$上，其高度取在$\tfrac98$，$\tfrac{11}{8}$，$\tfrac{13}{8}$和$\tfrac{15}{8}$。
:::

### 精确面积作为极限 {#exact-limits}

表格表明 $y = x^2$ 从 0 到 1 下方的面积是 $\tfrac13$。平方和的公式将这个推测转化为一个证明。

::: example $y = x^2$ 下方的面积
证明从 0 到 1 下方 $y = x^2$ 的面积 $A$ 恰好是 $\tfrac13$。

这里 $\Delta x = \tfrac1n$ 和 $x_i = \tfrac{i}{n}$，所以 $f(x_i) = \tfrac{i^2}{n^2}$。因子 $\tfrac{1}{n^3}$ 不依赖于 $i$，因此可以提出到和式外面（和式的第一个规则），并且定理 9.2 将其余部分相加：

$$\begin{aligned} R_n &= \sum_{i=1}^{n} \frac{i^2}{n^2}\cdot\frac1n = \frac{1}{n^3}\sum_{i=1}^{n} i^2 \\[5pt] &= \frac{1}{n^3}\cdot\frac{n(n + 1)(2n + 1)}{6} \\[5pt] &= \frac{(n + 1)(2n + 1)}{6n^2}. \end{aligned}$$

展开分子 $(n + 1)(2n + 1) = 2n^2 + 3n + 1$，并将每一项除以 $6n^2$，

$$R_n = \frac13 + \frac{1}{2n} + \frac{1}{6n^2}.$$

左边的和具有相同的高度，只是 $f(x_0) = 0$ 替换了 $f(x_n) = 1$，因此 $L_n = R_n - \tfrac1n$：

$$L_n = \frac13 - \frac{1}{2n} + \frac{1}{6n^2}.$$

当 $n \to \infty$、$\tfrac1n$ 和 $\tfrac{1}{n^2}$ 趋近于 0（无穷大极限，模块 3，其中 $n$ 遍历所有整数），因此

$$\lim_{n\to\infty} L_n = \lim_{n\to\infty} R_n = \frac13.$$

由于 $x^2$ 在 $[0, 1]$ 上递增，对于每个 $n$，都有 $L_n \le A \le R_n$，如例 9.1 所示。因此 $A$ 是一个被两个都趋近于 $\tfrac13$ 的量夹逼的固定数，根据模块 2 的夹逼定理（同样适用于无穷大极限，模块 3），所以 $A = \tfrac13$。

```check
xi = i/n
steps(Sum(xi**2/n, (i, 1, n)), Sum(i**2, (i, 1, n))/n**3, (n*(n + 1)*(2*n + 1)/6)/n**3, (n + 1)*(2*n + 1)/(6*n**2))
same(expand((n + 1)*(2*n + 1)), 2*n**2 + 3*n + 1)
Rx2 = (n + 1)*(2*n + 1)/(6*n**2)
same(Rx2, Rational(1, 3) + 1/(2*n) + 1/(6*n**2))
same(summation((i/n)**2/n, (i, 0, n - 1)), Rx2 - 1/n); same(Rx2 - 1/n, Rational(1, 3) - 1/(2*n) + 1/(6*n**2))
same(limit(Rx2, n, oo), Rational(1, 3)); same(limit(Rx2 - 1/n, n, oo), Rational(1, 3))
for N_ in (1, 4, 10, 100):
    same(Rx2.subs(n, N_), RR(N_)); same((Rx2 - 1/n).subs(n, N_), LL(N_))
```
:::

中点求和采用相同的方法。中点为 $m_i = \big(i - \tfrac12\big)\tfrac1n$，因此 $f(m_i)\,\Delta x = \tfrac{1}{n^3}\big(i - \tfrac12\big)^2$。展开 $\big(i - \tfrac12\big)^2 = i^2 - i + \tfrac14$，使用所有三个求和法则以及定理 9.2 的前两个公式，然后展开括号并整理项：

$$\begin{aligned} M_n &= \frac{1}{n^3}\sum_{i=1}^{n}\Big(i^2 - i + \frac14\Big) \\[5pt] &= \frac{1}{n^3}\Big(\frac{n(n + 1)(2n + 1)}{6} \\[5pt] &\qquad - \frac{n(n + 1)}{2} + \frac{n}{4}\Big) \\[5pt] &= \frac{1}{n^3}\Big(\frac{n^3}{3} - \frac{n}{12}\Big) \\[5pt] &= \frac13 - \frac{1}{12n^2}. \end{aligned}$$

这就是为什么表格中的中点误差在 $n$ 倍增时被恰好除以 4。

相同的步骤适用于 $[0, b]$ 的任何 $b > 0$。现在 $\Delta x = \tfrac{b}{n}$ 和 $x_i = \tfrac{ib}{n}$，因此

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\frac{i^2b^2}{n^2}\cdot\frac{b}{n} = \frac{b^3}{n^3}\sum_{i=1}^{n} i^2 \\[5pt] &= b^3\cdot\frac{(n + 1)(2n + 1)}{6n^2}, \end{aligned}$$

趋近于 $\tfrac{b^3}{3}$，而 $L_n = R_n - \tfrac{b^3}{n}$ 趋近于同一个数。从 0 到 $b$ 下 $y = x^2$ 的面积为 $\tfrac{b^3}{3}$： $\tfrac83$ 对应 $b = 2$， $9$ 对应 $b = 3$。

```check
same(((i - 1)/n + i/n)/2, (i - Rational(1, 2))/n); same(((i - Rational(1, 2))/n)**2*(1/n), (i - Rational(1, 2))**2/n**3)   # m_i and f(m_i) dx
steps(Sum(((i - Rational(1, 2))/n)**2/n, (i, 1, n)), Sum(i**2 - i + Rational(1, 4), (i, 1, n))/n**3, (n*(n + 1)*(2*n + 1)/6 - n*(n + 1)/2 + n/4)/n**3,
      (n**3/3 - n/12)/n**3, Rational(1, 3) - 1/(12*n**2))
same(expand(n*(n + 1)*(2*n + 1)/6 - n*(n + 1)/2 + n/4), n**3/3 - n/12)
same(expand((i - Rational(1, 2))**2), i**2 - i + Rational(1, 4))
bp = symbols('b', positive=True)
steps(Sum((i*bp/n)**2*bp/n, (i, 1, n)), bp**3/n**3*Sum(i**2, (i, 1, n)), bp**3*(n + 1)*(2*n + 1)/(6*n**2))
same(summation((i*bp/n)**2*bp/n, (i, 0, n - 1)), bp**3*(n + 1)*(2*n + 1)/(6*n**2) - bp**3/n)
same(limit(bp**3*(n + 1)*(2*n + 1)/(6*n**2), n, oo), bp**3/3); same(limit(bp**3*(n + 1)*(2*n + 1)/(6*n**2) - bp**3/n, n, oo), bp**3/3)
same((bp**3/3).subs(bp, 2), Rational(8, 3)); same((bp**3/3).subs(bp, 3), 9)
```

## 定积分 {#definite-integral}

左端、右端和中点求和分别以三种特定方式取高度，这些高度是在等宽子区间上计算的。这些选择没有任何强制性。子区间内的任意一点都可以作为高度，且子区间可以有不同的宽度：例如在图像变化快的地方使用较窄的区间。定积分的定义确保这些选择不会影响结果。

::: definition 分划与黎曼和
设$a < b$。$[a, b]$的一个**划分**$P$是点$a = x_0 < x_1 < \dots < x_n = b$的列表。它将$[a, b]$切割为$n$个子区间$[x_{i-1}, x_i]$，其宽度为$\Delta x_i = x_i - x_{i-1}$；最大宽度为$P$的**范数**，记作$\norm{P}$。在每个子区间$[x_{i-1}, x_i]$中选取一个**样本点**$x_i^*$，读作“x i star”。$f$关于$P$及这些样本点的**黎曼和**为

$$\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i.$$
:::

图9.3（左）展示了一个例子。左端和右端和中点的和是将区间划分为$n$等份后的黎曼和，其范数为$\tfrac{b - a}{n}$，样本点分别取在左端点、右端点或中点。

::: definition 定积分
设函数 $f$ 定义在 $[a, b]$ 上。如果分割逐渐加细时，黎曼和趋于某个数 $I$，就称它在 $[a, b]$ 上**可积**。具体来说，对每个 $\varepsilon > 0$，存在 $\delta > 0$，使得

$$\Big|\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i - I\Big| < \varepsilon$$

对 $[a, b]$ 的每个满足 $\norm{P} < \delta$ 的分割 $P$ 和任意采样点 $x_i^*$，上式都成立。此时 $I$ 称为 $f$ 从 $a$ 到 $b$ 的**定积分**，记作

$$\int_a^b f(x)\,dx = \lim_{\norm{P}\to0}\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i.$$
:::

该条件的形状与模块2中极限的ε–δ定义类似，其中黎曼和在$f(x)$的位置，范数$\norm{P}$在表示$x$与它趋近点之间的距离的位置：无论你设定多小的容忍度$\varepsilon$，只要分区足够细，每个黎曼和都在$\varepsilon$之内$I$，无论样本点在哪里。它要求的比单变量函数的极限更多，因为黎曼和并不由$\norm{P}$唯一确定：许多分区具有相同的范数，每个分区允许许多样本点的选择，而所有这些和都必须接近$I$。符号$\lim_{\norm{P}\to0}$，读作“当$P$的范数趋近于0时的极限”，正是对这一条件的简写。只能存在这样一个数$I$：当$\varepsilon$小于这两个数之间的距离的一半时，两个不同的数不能同时都在同一个黎曼和的$\varepsilon$之内。

**如何读记号。**$\int_a^b f(x)\,dx$ 读作「对 $x$ 的函数 $f$ 从 $a$ 积分到 $b$，$dx$」。符号 $\int$ 是莱布尼茨的记号（模块 1），形状是拉长的 S，提醒我们积分是和的极限。函数 $f(x)$ 叫作**被积函数**，$a$ 和 $b$ 分别是**积分下限和上限**，即区间的端点，有别于模块 2 的极限。$dx$ 对应各小区间的宽度 $\Delta x_i$，于是 $f(x)\,dx$ 呼应 $f(x_i^*)\,\Delta x_i$，也标明了积分变量。定积分的值是一个数，不是 $x$ 的函数。与求和下标类似，$x$ 是哑变量，

$$\int_a^b f(x)\,dx = \int_a^b f(t)\,dt = \int_a^b f(u)\,du.$$

当 $f$ 可积且 $f(x) \ge 0$ 在 $[a, b]$ 上时，积分是从 $a$ 到 $b$ 的 $f$ 图像下方的面积。实际上，积分现在是该面积的定义，它会给出你已经知道的面积，如下文所示。

哪些函数是可积的？几乎是你将遇到的每一个函数。

::: theorem 可积函数
如果 $f$ 在 $[a, b]$ 上连续，则 $f$ 在 $[a, b]$ 上可积。更一般地，$f$ 在 $[a, b]$ 上可积，如果它在该区间上有界（存在一个数 $K$，使得对于每个 $x$ 在 $[a, b]$ 中都有 $\abs{f(x)} \le K$），并且在 $[a, b]$ 中只有有限个间断点，例如跳跃间断点。
:::

该证明，如同极值定理的证明一样，需要实数的完备性，属于实分析课程的内容；本系列使用该定理而不作证明。它涵盖多项式、在任意区间 $[a, b]$ 上的 $\sin x$、$\cos x$ 和 $e^x$，在不包含 0 的任意区间 $[a, b]$ 上的 $1/x$，以及有限个跳跃间断点的分段函数。一旦知道 $f$ 是可积的，就可以使用任意方便的黎曼和来计算其积分：

::: theorem 等分区间上的积分
如果 $f$ 在 $[a, b]$ 上可积，则

$$\begin{aligned} \int_a^b f(x)\,dx &= \lim_{n\to\infty} L_n = \lim_{n\to\infty} R_n \\[5pt] &= \lim_{n\to\infty} M_n, \end{aligned}$$

并且对于等分区间 $n$ 中的任意其他样本点选择，也是如此。
:::

::: proof
设 $I = \int_a^b f(x)\,dx$ 和 $\varepsilon > 0$，并取一个 $\delta$ 如定义 9.4 所述。将区间分成 $n$ 等份，其范数为 $\tfrac{b - a}{n}$，只要 $n > \tfrac{b - a}{\delta}$ 成立，该范数就小于 $\delta$。对于所有这样的 $n$，该分法的每个黎曼和 $L_n$，其中 $R_n$ 和 $M_n$ 为其中的项，都与 $I$ 的差小于 $\varepsilon$。这就是 $\lim_{n\to\infty} L_n = I$ 的意思，同样适用于 $R_n$ 和 $M_n$。
:::

所以例 9.5 中的面积是一个积分：由于 $x^2$ 是连续的，因此它是可积的（定理 9.3），并且根据定理 9.4，其积分为右和的极限。结合 $[0, b]$ 的计算，

$$\int_0^1 x^2\,dx = \frac13, \qquad \int_0^b x^2\,dx = \frac{b^3}{3} \quad (b > 0).$$

积分也给出你已经知道的面积。函数 $x$ 是连续的，其在 $[0, b]$ 上的右和为

$$\sum_{i=1}^{n} \frac{ib}{n}\cdot\frac{b}{n} = \frac{b^2}{n^2}\cdot\frac{n(n + 1)}{2} = \frac{b^2}{2}\Big(1 + \frac1n\Big),$$

哪种方法 $\tfrac{b^2}{2}$: $x$ 从 0 到 $b$ 的积分是其图像下方三角形的面积，底为 $b$，高为 $b$。每个常函数 $c \ge 0$ 的黎曼和都是 $c(b - a)$，因为宽度之和为 $b - a$：矩形的面积。模块 11 显示积分给出圆的面积 $\pi r^2$。

定理 9.4 中的假设 "$f$ 可积" 不能省略：下面的“深入一步”框显示了一个右和有极限的函数，尽管它不可积。

```check
same(integrate(x**2, (x, 0, 1)), Rational(1, 3)); same(integrate(x**2, (x, 0, bp)), bp**3/3)
steps(Sum(i*bp/n*bp/n, (i, 1, n)), bp**2/n**2*(n*(n + 1)/2), bp**2/2*(1 + 1/n))
same(limit(bp**2/2*(1 + 1/n), n, oo), bp**2/2); same(integrate(x, (x, 0, bp)), Rational(1, 2)*bp*bp)
```

::: example 积分作为和的极限
将 $\displaystyle\int_1^3 x^2\,dx$ 表示为右和的极限。

被积函数是连续的，因此定理 9.4 允许你使用 $R_n$。这里 $\Delta x = \tfrac2n$ 和 $x_i = 1 + \tfrac{2i}{n}$，因此

$$f(x_i) = \Big(1 + \frac{2i}{n}\Big)^2 = 1 + \frac{4i}{n} + \frac{4i^2}{n^2}.$$

根据求和规则，将不依赖于 $i$ 的因子提出每个和，

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\Big(1 + \frac{4i}{n} + \frac{4i^2}{n^2}\Big)\frac2n \\[5pt] &= \frac2n\sum_{i=1}^{n} 1 + \frac{8}{n^2}\sum_{i=1}^{n} i \\[5pt] &\qquad + \frac{8}{n^3}\sum_{i=1}^{n} i^2 \\[5pt] &= 2 + \frac{8}{n^2}\cdot\frac{n(n + 1)}{2} \\[5pt] &\qquad + \frac{8}{n^3}\cdot\frac{n(n + 1)(2n + 1)}{6} \\[5pt] &= 2 + \frac{4(n + 1)}{n} \\[5pt] &\qquad + \frac{4(n + 1)(2n + 1)}{3n^2}. \end{aligned}$$

当 $n \to \infty$， $\tfrac{n + 1}{n} = 1 + \tfrac1n$ 接近 1， $\tfrac{(n + 1)(2n + 1)}{n^2} = 2 + \tfrac3n + \tfrac{1}{n^2}$ 接近 2，因此

$$\int_1^3 x^2\,dx = 2 + 4 + \frac83 = \frac{26}{3} \approx 8.667.$$

比较从 0 到 $\int_0^3 x^2\,dx = 9$ 和 $\int_0^1 x^2\,dx = \tfrac13$，以及 $9 - \tfrac13 = \tfrac{26}{3}$ 的面积，应如此，因为从 1 到 3 的区域是从 0 到 3 的区域减去从 0 到 1 的区域。第 9.5 节将这种减法转化为一条规则。

```check
xi6 = 1 + 2*i/n
same(expand(xi6**2), 1 + 4*i/n + 4*i**2/n**2)
R96 = 2 + 4*(n + 1)/n + 4*(n + 1)*(2*n + 1)/(3*n**2)
steps(Sum(xi6**2*2/n, (i, 1, n)), 2/n*Sum(1, (i, 1, n)) + 8/n**2*Sum(i, (i, 1, n)) + 8/n**3*Sum(i**2, (i, 1, n)),
      2 + 8/n**2*(n*(n + 1)/2) + 8/n**3*(n*(n + 1)*(2*n + 1)/6), R96)
same((n + 1)/n, 1 + 1/n); same(expand((n + 1)*(2*n + 1)/n**2), 2 + 3/n + 1/n**2)
same(limit(R96, n, oo), 2 + 4 + Rational(8, 3)); same(2 + 4 + Rational(8, 3), Rational(26, 3)); rounds(Rational(26, 3), '8.667')
same(integrate(x**2, (x, 1, 3)), Rational(26, 3)); same(9 - Rational(1, 3), Rational(26, 3))
same(R96.subs(n, 4), Rsum(x9**2, 1, 3, 4))
```
:::

::: compute 使用 SymPy 计算黎曼和的极限
SymPy 可以完成例 9.6 的全部计算：用符号 $n$ 构建右和，用 `summation` 将其相加，并让 $n \to \infty$ 以 `limit` 为变量：

```python
import sympy as sp
i, n = sp.symbols('i n', integer=True, positive=True)
a, b = 1, 3
dx = sp.Integer(b - a)/n
xi = a + i*dx                         # the right ends
Rn = sp.summation(xi**2*dx, (i, 1, n))
print(sp.factor(Rn))
print(sp.limit(Rn, n, sp.oo))
```

```output
2*(13*n**2 + 12*n + 2)/(3*n**2)
26/3
```

因式分解后的右和是例 9.6 在公共分母下的公式。改变函数或区间并重新运行：对于 $x^3$ 在 $[0, 2]$ 上的积分，极限是 4（练习 9.5）。
:::

```check
same(2*(13*n**2 + 12*n + 2)/(3*n**2), R96)
```

::: deeper 不可积的函数
第一次阅读可以跳过这个框。定理 9.3 要求有界性和仅有限个间断点，定理 9.4 要求可积性。两个例子说明了原因。

**过多的间断点。** 在 $[0, 1]$ 上，令 $D(x) = 1$ 当 $x$ 是有理数时，且 $D(x) = 0$ 当 $x$ 是无理数时。然而，每个分划的每个子区间，无论多窄，都包含有理数和无理数。选择所有样本点为有理数，则每一项都是 $1 \cdot \Delta x_i$，因此黎曼和为所有子区间的总宽度，即 1；选择所有样本点为无理数，则黎曼和为 0。无论 $\norm{P}$ 多小，总有一些黎曼和为 1，另一些为 0，因此没有数 $I$ 能在 $\varepsilon = \tfrac12$ 的范围内接近所有这些值： $D$ 在 $[0, 1]$ 上不可积。然而其右端点和都是 1，因为右端点 $\tfrac{i}{n}$ 都是有理数，所以 $\lim_{n\to\infty} R_n = 1$ 存在。仅靠等宽和的极限并不能使函数可积。($D$ 在 $[0, 1]$ 的每个点上都间断。)

**无界.** 设 $f(x) = 1/\sqrt{x}$ 为 $0 < x \le 1$ 和 $f(0) = 0$. 在 $[0, 1]$ 的每一个划分中，第一个子区间 $[0, x_1]$ 包含可以任意接近 0 的点，其中 $1/\sqrt{x}$ 可以任意大. 选择 $x_1^*$ 足够接近 0，使得单项 $f(x_1^*)\,\Delta x_1$ 以及整个黎曼和（其余项为正）大于你任意指定的数. 黎曼和趋近于无定义的数，因此 $f$ 在 $[0, 1]$ 上不可积. 相同的论证表明，每个可积函数都是有界的. 模块 12 给一些无界函数的积分赋予意义，作为瑕积分；这个积分将被证明等于 2.

```check
for N_ in (3, 7, 10):                           # the right ends i/n are rational, so every R_n of D is 1
    holds(all(Rational(j, N_).is_rational for j in range(1, N_ + 1))); same(sum(1*Rational(1, N_) for j in range(N_)), 1)
x1_, x2_ = symbols('x1 x2', positive=True)
same((x1_ - 0) + (x2_ - x1_) + (1 - x2_), 1)       # widths of a partition of [0, 1] add up to 1
hp = symbols('h', positive=True); Mbig = symbols('M', positive=True)
same((1/sqrt((hp/Mbig)**2))*hp, Mbig)            # x1* = (dx1/M)^2 makes the term f(x1*) dx1 equal to M
same(integrate(1/sqrt(x), (x, 0, 1)), 2)
```
:::

### 带符号的面积 {#signed-area}

当$f$为负时，黎曼和的项$f(x_i^*)\,\Delta x_i$为负：它们是带负号的矩形面积。因此，积分将$x$轴上方的面积计为正，下方的面积计为负：

$$\begin{aligned} \int_a^b f(x)\,dx &= (\text{area above the axis}) \\[5pt] &\quad - (\text{area below the axis}). \end{aligned}$$

这是**净面积**，或**有符号面积**，在$f$的图像与$x$轴之间。**总面积**在图像与轴之间将每一部分计为正：它是轴上方的面积加上轴下方的面积。由于$\abs{f}$的图像将轴下方的部分翻转，总面积是$\int_a^b \abs{f(x)}\,dx$。在图9.3（右）中，两部分完全抵消：净面积为0，但总面积不是。

::: figure id=fig-09-3
左图：针对具有不等宽度$\Delta x_i$的划分$x_0 < x_1 < \dots < x_5$的黎曼和，以及每个子区间内任意位置的样本点$x_i^*$（点）。右图：例9.7的有向面积。$x^2 - 2x$的图像在$[0, 2]$上围成$\tfrac43$的轴下面积，在$[2, 3]$上围成$\tfrac43$的轴上面积，因此从0到3的积分为0。
:::

::: example 符号面积
将 $\displaystyle\int_0^3 \big(x^2 - 2x\big)\,dx$ 表示为右和的极限。

被积函数是连续的，因此定理 9.4 适用。这里 $\Delta x = \tfrac3n$ 和 $x_i = \tfrac{3i}{n}$，所以 $f(x_i) = \tfrac{9i^2}{n^2} - \tfrac{6i}{n}$ 和

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\Big(\frac{9i^2}{n^2} - \frac{6i}{n}\Big)\frac3n \\[5pt] &= \frac{27}{n^3}\sum_{i=1}^{n} i^2 - \frac{18}{n^2}\sum_{i=1}^{n} i \\[5pt] &= \frac{9(n + 1)(2n + 1)}{2n^2} - \frac{9(n + 1)}{n}. \end{aligned}$$

在公分母 $2n^2$ 下，分子为 $9(n + 1)\big[(2n + 1) - 2n\big] = 9(n + 1)$，因此

$$R_n = \frac{9(n + 1)}{2n^2} = \frac{9}{2n} + \frac{9}{2n^2},$$

该值趋于 0。因此 $\int_0^3 (x^2 - 2x)\,dx = 0$。

积分结果为 0，但图像并非 $x$ 轴。由于 $x^2 - 2x = x(x - 2)$，被积函数在 $(0, 2)$ 上为负，在 $(2, 3)$ 上为正：轴下方的面积等于轴上方的面积。例 9.8 动手计算们，各为 $\tfrac43$。

```check
f97 = x9**2 - 2*x9
same(f97.subs(x9, 3*i/n), 9*i**2/n**2 - 6*i/n)
R97a = 9*(n + 1)*(2*n + 1)/(2*n**2) - 9*(n + 1)/n
steps(Sum((9*i**2/n**2 - 6*i/n)*3/n, (i, 1, n)), 27/n**3*Sum(i**2, (i, 1, n)) - 18/n**2*Sum(i, (i, 1, n)), R97a)
same(expand(9*(n + 1)*((2*n + 1) - 2*n)), 9*(n + 1)); steps(R97a, 9*(n + 1)/(2*n**2), 9/(2*n) + 9/(2*n**2))
same(limit(R97a, n, oo), 0); same(R97a.subs(n, 5), Rsum(f97, 0, 3, 5))
same(factor(x**2 - 2*x), x*(x - 2)); same(integrate(x**2 - 2*x, (x, 0, 3)), 0)
```
:::

**位移与路程。**对于沿直线运动的物体，当物体向后运动时速度$v(t)$为负。在短时间$\Delta t$内，其位置变化约为$v(t_i^*)\,\Delta t$：当$v > 0$时向前，当$v < 0$时向后。这些变化累加为$v$的黎曼和，因此$\int_a^b v(t)\,dt$是**位移**，即位置的净变化量$s(b) - s(a)$，而**路程**，即将每次运动都计为正值的量，为$\int_a^b \abs{v(t)}\,dt$。模块10证明了第一个陈述，即净变化定理。例如，一个速度为$v(t) = 2 - t$ m/s的物体，在$0 \le t \le 4$期间，先向前运动2秒，然后向后运动2秒。$v$的图像在$[0, 2]$上形成一个面积为2的位于轴上方的三角形，在$[2, 4]$上形成一个面积为2的位于轴下方的三角形。因此位移为$\int_0^4 (2 - t)\,dt = 2 - 2 = 0$ m，因为物体回到了起点，但路程为$2 + 2 = 4$ m。

```check
same(Rational(1, 2)*2*2, 2); same(integrate(2 - t, (t, 0, 4)), 0); same(integrate(Abs(2 - t), (t, 0, 4)), 4)
same(integrate(2 - t, (t, 0, 2)), 2); same(integrate(2 - t, (t, 2, 4)), -2)
```

::: pitfall
$\int_a^b f(x)\,dx$ 是图形与轴之间区域的面积，当 $f \ge 0$ 在 $[a, b]$ 上。当 $f$ 为负时，积分减去面积：它是一个净面积，即使区域很大，也可能为 0 或负数。要找到总面积，需将 $[a, b]$ 中 $f$ 变号处分开，然后将各部分的大小相加：对于 $x^2 - 2x$ 在 $[0, 3]$ 上的总面积是 $\tfrac43 + \tfrac43 = \tfrac83$，而不是 0。
:::

## 积分的性质 {#properties}

介值定理的和遵循第 9.2 节中和的规则。让分划缩小，这些规则就变成了积分的规则。首先，两个约定使规则适用于积分限的任何顺序。

::: definition 积分限反转与相等
对于 $a < b$ 和 $f$ 在 $[a, b]$ 上可积，

$$\int_b^a f(x)\,dx = -\int_a^b f(x)\,dx.$$

对于每一个 $c$，其中 $f$ 有定义， $\displaystyle\int_c^c f(x)\,dx = 0$。
:::

从 $b$ 返回到 $a$ 时，宽度 $\Delta x = \tfrac{a - b}{n}$ 为负，因此每个黎曼和都会改变符号：这使得第一个约定成为自然的约定。第二个约定说明单个点没有面积。

::: theorem 线性性
如果 $f$ 和 $g$ 在 $[a, b]$ 上可积，且 $c$ 是一个常数，则 $f + g$、$f - g$ 和 $cf$ 在 $[a, b]$ 上可积，并且

$$\begin{aligned} \int_a^b \big(f(x) + g(x)\big)\,dx &= \int_a^b f(x)\,dx \\[5pt] &\quad + \int_a^b g(x)\,dx, \\[5pt] \int_a^b c\,f(x)\,dx &= c\int_a^b f(x)\,dx, \end{aligned}$$

且当 $f + g$ 用 $f - g$ 替代时，上述结论同样成立。对于常值函数， $\displaystyle\int_a^b c\,dx = c(b - a)$。
:::

::: proof
对于每一个划分和每一个样本点的选择， $f + g$ 的黎曼和等于 $f$ 的黎曼和加上 $g$ 的黎曼和，根据求和的第二规则。给定 $\varepsilon > 0$，取 $\delta_1$ 作为 $f$，取 $\delta_2$ 作为 $g$，每个都满足误差 $\tfrac{\varepsilon}{2}$，如定义 9.4 所述。如果 $\norm{P}$ 小于两者，则两个黎曼和分别在 $\tfrac{\varepsilon}{2}$ 的范围内接近 $\int_a^b f$ 和 $\int_a^b g$，因此它们的和在 $\varepsilon$ 的范围内接近 $\int_a^b f + \int_a^b g$。这证明了第一个公式。对于第二个公式， $cf$ 的黎曼和是 $c$ 乘以 $f$ 的黎曼和；当 $f$ 的和在 $\tfrac{\varepsilon}{\abs{c} + 1}$ 的范围内接近 $\int_a^b f$ 时， $cf$ 的和在 $\tfrac{\abs{c}\,\varepsilon}{\abs{c} + 1} < \varepsilon$ 的范围内接近 $c\int_a^b f$。对于 $f - g$，将两个公式结合 $c = -1$。最后，每一个常函数 $c$ 的黎曼和都是 $\sum c\,\Delta x_i = c(b - a)$，因为宽度之和为 $b - a$。
:::

这些是证明模块 2 中极限法则的论证。区间上的可加性需要更仔细的处理。

::: theorem 可加性
设 $f$ 在包含 $a$, $b$ 和 $c$ 的区间上连续，或有有限个间断点且有界。则

$$\begin{aligned} &\int_a^b f(x)\,dx + \int_b^c f(x)\,dx \\[5pt] &\quad= \int_a^c f(x)\,dx. \end{aligned}$$
:::

::: proof
根据定理 9.3， $f$ 在由 $a$, $b$ 和 $c$ 构成的每个闭区间上都是可积的。首先假设 $a < b < c$，令 $\varepsilon > 0$。定义 9.4 对每个区间 $[a, b]$, $[b, c]$ 和 $[a, c]$ 给出一个 $\delta$；令 $\delta$ 为这三个中的最小值。那么，对于范数小于 $\delta$ 的划分，每个区间上的黎曼和与其积分的误差不超过 $\varepsilon$。取 $[a, b]$ 和 $[b, c]$ 的划分，其范数均小于 $\delta$，并任取样本点，令 $S_1$ 和 $S_2$ 分别为它们的黎曼和。这两个划分共同构成 $[a, c]$ 的划分，其范数也小于 $\delta$，其黎曼和为 $S_1 + S_2$。所以

$$\begin{aligned} &\Big|\int_a^c f - \int_a^b f - \int_b^c f\Big| \\[5pt] &\quad\le \Big|\int_a^c f - (S_1 + S_2)\Big| \\[5pt] &\qquad + \Big|S_1 - \int_a^b f\Big| + \Big|S_2 - \int_b^c f\Big| \\[5pt] &\quad< 3\varepsilon. \end{aligned}$$

左侧是一个固定数，对每个$\varepsilon > 0$都小于$3\varepsilon$，因此为0。$a$、$b$和$c$的其他所有顺序均由该情形根据定义9.5得出。例如，若$a < c < b$，已证情形给出$\int_a^c f + \int_c^b f = \int_a^b f$，从而$\int_a^c f = \int_a^b f - \int_c^b f = \int_a^b f + \int_b^c f$。若三个数中有两个相等，则公式直接由定义9.5得出。
:::

（可加性适用于所有在最大区间上可积的函数，但证明此类函数在较小区间上可积的证明属于实分析内容。）

::: example 积分的分割
求 $\displaystyle\int_0^2 \big(x^2 - 2x\big)\,dx$ 和 $\displaystyle\int_2^3 \big(x^2 - 2x\big)\,dx$，以及从 0 到 3 之间函数 $y = x^2 - 2x$ 与 $x$ 轴之间的总面积。

由线性性质，

$$\begin{aligned} \int_0^2 \big(x^2 - 2x\big)\,dx &= \int_0^2 x^2\,dx \\[5pt] &\quad - 2\int_0^2 x\,dx. \end{aligned}$$

第一个积分是 $\tfrac{2^3}{3} = \tfrac83$（参见第 9.4 节）。第二个积分是三角形的面积：函数 $y = x$ 从 0 到 2 的图像从 $(0, 0)$ 变化到 $(2, 2)$，因此为 $\int_0^2 x\,dx = \tfrac12 \cdot 2 \cdot 2 = 2$。所以

$$\int_0^2 \big(x^2 - 2x\big)\,dx = \frac83 - 4 = -\frac43.$$

由可加性，区域 $[0, 2]$ 和 $[2, 3]$ 上的积分之和等于区域 $[0, 3]$ 上的积分，根据例题 9.7，该积分为 0，因此

$$\int_2^3 \big(x^2 - 2x\big)\,dx = 0 - \Big(-\frac43\Big) = \frac43.$$

轴下方的区域面积为 $\tfrac43$，轴上方的区域面积为 $\tfrac43$：总面积为 $\tfrac83$，而从 0 到 3 的积分结果为 0（图 9.3）

```check
steps(Integral(x**2 - 2*x, (x, 0, 2)), Integral(x**2, (x, 0, 2)) - 2*Integral(x, (x, 0, 2)), Rational(8, 3) - 2*2, -Rational(4, 3))
same(Rational(1, 2)*2*2, 2); same(integrate(x, (x, 0, 2)), 2)
same(0 - (-Rational(4, 3)), Rational(4, 3)); same(integrate(x**2 - 2*x, (x, 2, 3)), Rational(4, 3))
same(Rational(4, 3) + Rational(4, 3), Rational(8, 3)); same(integrate(-(x**2 - 2*x), (x, 0, 2)) + integrate(x**2 - 2*x, (x, 2, 3)), Rational(8, 3))
near(Integral(Abs(x**2 - 2*x), (x, 0, 3)).evalf(30), Rational(8, 3), 1e-20)          # the total area is the integral of |f|
```
:::

::: theorem 比较
设 $f$ 和 $g$ 在 $[a, b]$ 上可积，其中 $a < b$

- (a) 若 $f(x) \ge 0$ 对于 $[a, b]$ 中的每一个 $x$ 成立，则 $\displaystyle\int_a^b f(x)\,dx \ge 0$
- (b) 若 $f(x) \le g(x)$ 对于 $[a, b]$ 中的每一个 $x$ 成立，则 $\displaystyle\int_a^b f(x)\,dx \le \int_a^b g(x)\,dx$
- (c) 若 $m \le f(x) \le M$ 对于 $[a, b]$ 中的每一个 $x$ 成立，则
  $$\begin{aligned} m(b - a) &\le \int_a^b f(x)\,dx \\[5pt] &\le M(b - a). \end{aligned}$$
:::

::: proof
**(a)** 每个黎曼和 $\sum f(x_i^*)\,\Delta x_i$ 是非负数的乘积之和，因此至少为 0。假设积分 $I$ 为负数。根据定义 9.4 与 $\varepsilon = \tfrac{\abs{I}}{2}$，足够细的分划的黎曼和将位于 $\tfrac{\abs{I}}{2}$ 之内，且 $I$，这不可能。因此 $I \ge 0$。

**(b)** 由线性性， $g - f$ 可积，且 $\int_a^b g - \int_a^b f = \int_a^b (g - f)$，其由 (a) 得到至少为 0，因为 $g(x) - f(x) \ge 0$。

**(c)** 将 (b) 应用于常函数 $m$ 和 $f$，以及 $f$ 和常函数 $M$，并使用 $\int_a^b m\,dx = m(b - a)$（定理 9.5）。
:::

当$f \ge 0$连续时，取$m$和$M$在$[a, b]$上的最小值和最大值，它们由极值定理（模块3）保证存在。则部分(c)表明，图线下的面积介于$[a, b]$上两个矩形的面积之间，一个的高度等于图线的最低点，另一个的高度等于图线的最高点。

部分 (b) 也将净面积与第 9.4 节的总面积进行比较。设 $f$ 连续，或有有限个间断点的有界函数，因此 $\abs{f}$ 也是如此，且两者均可积。由于 $-\abs{f(x)} \le f(x) \le \abs{f(x)}$，部分 (b) 与线性性质给出 $-\int_a^b \abs{f(x)}\,dx \le \int_a^b f(x)\,dx \le \int_a^b \abs{f(x)}\,dx$，即，

$$\Big|\int_a^b f(x)\,dx\Big| \le \int_a^b \abs{f(x)}\,dx.$$

在大小上，净面积永远不会超过总面积：对于 $x^2 - 2x$ 在 $[0, 3]$ 上，0 对比 $\tfrac83$。

```check
same(Abs(integrate(x**2 - 2*x, (x, 0, 3))), 0); holds(0 <= Rational(8, 3))
for F_, A_, B_ in ((x**2 - 2*x, 0, 3), (sin(x), 0, 5), (x**3 - x, -2, 1)):
    holds(Abs(Integral(F_, (x, A_, B_)).evalf(30)) <= Integral(Abs(F_), (x, A_, B_)).evalf(30))
```

::: example 无公式的积分上界
证明 $\displaystyle\int_0^1 e^{-x^2}\,dx$ 介于 0.36 和 1 之间，然后证明它介于 0.57 和 0.89 之间。

被积函数是连续的，因此积分存在（定理 9.3）。模块 10 的快捷方法无法动手计算，因为没有由熟悉函数组成的公式具有导数 $e^{-x^2}$（模块 11），但比较定理可以对它进行界定。在 $[0, 1]$ 上， $x^2$ 从 0 增加到 1，因此 $-x^2$ 从 0 减少到 $-1$，且 $e^{-x^2}$ 从 $e^0 = 1$ 减少到 $e^{-1}$。因此 $e^{-1} \le e^{-x^2} \le 1$ 在 $[0, 1]$ 上，根据定理 9.7(c)，结合 $b - a = 1$，得到

$$e^{-1} \le \int_0^1 e^{-x^2}\,dx \le 1.$$

由于 $e^{-1} \approx 0.3679$，积分值介于 0.36 和 1 之间。

为了做得更好，将 $[0, 1]$ 在 $\tfrac12$ 处分割（可加性），并分别对每个部分进行界定。在 $\big[0, \tfrac12\big]$ 上， $e^{-1/4} \le e^{-x^2} \le 1$；在 $\big[\tfrac12, 1\big]$ 上， $e^{-1} \le e^{-x^2} \le e^{-1/4}$。每个部分的宽度为 $\tfrac12$，因此

$$\frac{e^{-1/4} + e^{-1}}{2} \le \int_0^1 e^{-x^2}\,dx \le \frac{1 + e^{-1/4}}{2},$$

其中界限关于$0.5733$和$0.8894$：积分介于0.57和0.89之间。这两个界限是$R_2$和$L_2$。相同的论证适用于任何连续递减的$f$和任何$n$：在每个子区间上，$f$的值介于右端点和左端点的值之间，因此定理9.7(c)给出了每个子区间上积分的界限，将$n$的结果相加（可加性）得到$R_n \le \int_a^b f(x)\,dx \le L_n$。对于连续递增的$f$，有$L_n \le \int_a^b f(x)\,dx \le R_n$。界限之间的差距$\abs{L_n - R_n} = \Delta x\,\abs{f(a) - f(b)}$随着$n$的增大而缩小。

(对于这个被积函数，积分限是严格的，因为它仅在单个点上等于每个积分限；练习 9.12 展示了如何证明这样的严格不等式。)

```check
g99 = exp(-x9**2)
same(g99.subs(x9, 0), 1); same(g99.subs(x9, 1), exp(-1)); same(g99.subs(x9, Rational(1, 2)), exp(-Rational(1, 4)))
same(solve_univariate_inequality(diff(exp(-x**2), x) < 0, x, relational=False).intersect(Interval(0, 1)), Interval.Lopen(0, 1))
rounds(exp(-1), '0.3679'); holds(exp(-1) > Rational(36, 100))
lo99 = (exp(-Rational(1, 4)) + exp(-1))/2; hi99 = (1 + exp(-Rational(1, 4)))/2
rounds(lo99, '0.5733'); rounds(hi99, '0.8894'); holds(lo99 > Rational(57, 100)); holds(hi99 < Rational(89, 100))
same(lo99, Rsum(g99, 0, 1, 2)); same(hi99, Lsum(g99, 0, 1, 2))
for N_ in (2, 5):                                   # the gap L_n - R_n = dx (f(a) - f(b)), and R_n < integral < L_n
    same(Lsum(g99, 0, 1, N_) - Rsum(g99, 0, 1, N_), Rational(1, N_)*(g99.subs(x9, 0) - g99.subs(x9, 1)))
    holds(Rsum(g99, 0, 1, N_) < Integral(exp(-x**2), (x, 0, 1)).evalf(30)); holds(Integral(exp(-x**2), (x, 0, 1)).evalf(30) < Lsum(g99, 0, 1, N_))
I99 = Integral(exp(-x**2), (x, 0, 1)).evalf(30); holds(lo99 < I99); holds(I99 < hi99)
```
:::

::: compute 还没有公式的一个数
中点和的值被确定下来。将每个和打印到九位小数：

```python
import math

def midpoint(f, a, b, n):
    dx = (b - a)/n
    return sum(f(a + (i + 0.5)*dx) for i in range(n))*dx

def g(x):
    return math.exp(-x**2)

for n in [2, 10, 100, 1000]:
    print(f"{n} {midpoint(g, 0, 1, n):.9f}")
```

```output
2 0.754597944
10 0.747130878
100 0.746827198
1000 0.746824163
```

数字趋于稳定：在小数点后六位，$\int_0^1 e^{-x^2}\,dx \approx 0.746824$，位于例 9.9 的积分限之间。$e^{-x^2}$ 的积分是概率论的核心：模块 12 将再次遇到它们，与正态分布相关。
:::

```check
import mpmath
with mpmath.workdps(30):
    for n_, expected_ in ((2, '0.754597944'), (10, '0.747130878'), (100, '0.746827198'), (1000, '0.746824163')):
        midpoints_ = ((2*i_ + 1)/mpmath.mpf(2*n_) for i_ in range(n_))
        rounds(mpmath.fsum(mpmath.exp(-p_**2) for p_ in midpoints_)/n_, expected_)
rounds(Integral(exp(-x**2), (x, 0, 1)).evalf(30), '0.746824')
```

::: pitfall
积分不相乘：$\int_a^b f(x)g(x)\,dx$ 不等于 $\int_a^b f(x)\,dx \cdot \int_a^b g(x)\,dx$。例如，$\int_0^1 x \cdot x\,dx = \int_0^1 x^2\,dx = \tfrac13$，而 $\big(\int_0^1 x\,dx\big)^2 = \big(\tfrac12\big)^2 = \tfrac14$。它们也不相除。比较定理需要 $a < b$：当积分限调换时，不等式方向反转，因为 $\int_1^0 1\,dx = -1$ 虽然 $1 > 0$。

```check
same(integrate(x*x, (x, 0, 1)), Rational(1, 3)); same(integrate(x, (x, 0, 1))**2, Rational(1, 4)); same(integrate(1, (x, 1, 0)), -1)
```
:::

## 几何与对称的积分 {#geometry-symmetry}

瑞曼和的极限需要计算。当图下的区域由熟悉形状组成，或具有对称性时，积分计算更快。

### 几何 {#geometry}

当图由直线段和圆弧组成时，其积分是矩形、三角形、梯形和圆部分面积的和，每个位于轴下方的部分前加负号。请记住，平行边长为 $p$ 和 $q$，相距 $w$ 的梯形面积为 $\tfrac{(p + q)w}{2}$，半径为 $r$ 的圆面积为 $\pi r^2$。

::: example 作为熟悉区域的积分
计算：

- (a) $\displaystyle\int_0^3 (2x + 1)\,dx$
- (b) $\displaystyle\int_{-1}^{2} \abs{x}\,dx$
- (c) $\displaystyle\int_0^4 \sqrt{4x - x^2}\,dx$
- (d) $\displaystyle\int_0^3 (x - 1)\,dx$

**(a)** 图形是一条直线，在 $[0, 3]$ 轴上方，其下方的区域是一个梯形，两平行边分别为 $f(0) = 1$ 和 $f(3) = 7$，相距 3。积分是 $\tfrac{(1 + 7) \cdot 3}{2} = 12$。

**(b)** $\abs{x}$ 的图形是一个 V 形。区域由两个三角形组成：一个在 $[-1, 0]$ 上方，底边为 1，高为 1，面积为 $\tfrac12$；另一个在 $[0, 2]$ 上方，底边为 2，高为 2，面积为 2。积分是 $\tfrac12 + 2 = \tfrac52$。

**(c)** 完全平方： $4x - x^2 = 4 - (x - 2)^2$。因此 $y = \sqrt{4x - x^2}$ 表示 $y \ge 0$ 和 ${(x - 2)^2 + y^2 = 4}$：图形是半径为 2，中心在 $(2, 0)$ 的圆的上半部分，从 $x = 0$ 到 $x = 4$。区域是一个半圆，面积为 $\tfrac12\pi \cdot 2^2 = 2\pi$（图 9.4，左图）。

**(d)** 直线 $y = x - 1$ 在 $[0, 1]$ 上位于轴下方，形成一个面积为 $\tfrac12$ 的三角形，并在 $[1, 3]$ 上位于轴上方，形成一个底为 2 高为 2、面积为 2 的三角形。该积分等于有符号面积 $2 - \tfrac12 = \tfrac32$。

```check
same((1 + 7)*3/Integer(2), 12); same((2*x + 1).subs(x, 0), 1); same((2*x + 1).subs(x, 3), 7); same(integrate(2*x + 1, (x, 0, 3)), 12)
same(Rational(1, 2) + 2, Rational(5, 2)); same(integrate(Abs(x), (x, -1, 2)), Rational(5, 2))
same(expand(4 - (x - 2)**2), 4*x - x**2); same(Rational(1, 2)*pi*2**2, 2*pi); same(integrate(sqrt(4*x - x**2), (x, 0, 4)), 2*pi)
same(solve(4*x - x**2, x), [0, 4])
same(2 - Rational(1, 2), Rational(3, 2)); same(integrate(x - 1, (x, 0, 3)), Rational(3, 2))
```
:::

### 对称性 {#symmetry}

回顾[第1.4节](module_01_ZH.html#polynomials)]，若$f(-x) = f(x)$，则$f$为**偶**；若$f(-x) = -f(x)$，则**为**奇⒍，对$x$在其定义域内均成立。例如，$x^2$、$\cos x$和$\abs{x}$为偶函数，$x^3$、$\sin x$和$\tfrac1x$为奇函数。在关于0对称的区间$[-a, a]$上，偶函数的图像由互为镜像的两半组成，奇函数的图像由互为倒置镜像的两半组成（图9.4）。

::: theorem 偶函数与奇函数的积分
设 $a > 0$，且 $f$ 在 $[-a, a]$ 上连续，或有有限个间断点且有界。

- (a) 若 $f$ 为偶函数，则 $\displaystyle\int_{-a}^{a} f(x)\,dx = 2\int_0^a f(x)\,dx$。
- (b) 如果 $f$ 是奇数，则 $\displaystyle\int_{-a}^{a} f(x)\,dx = 0$。
:::

::: proof
由可加性， $\int_{-a}^{a} f = \int_{-a}^{0} f + \int_0^a f$，且两个积分都存在（定理 9.3）。通过它们的黎曼和比较这两个部分。取 $[0, a]$ 的一个分划 $0 = x_0 < x_1 < \dots < x_n = a$，样本点为 $x_i^*$。其镜像 $-a = -x_n < \dots < -x_1 < -x_0 = 0$ 是 $[-a, 0]$ 的一个分划，具有相同的宽度，因此相同的范数；取 $-x_i^*$ 作为其样本点。其黎曼和为

$$\sum_{i=1}^{n} f(-x_i^*)\,\Delta x_i.$$

如果 $f$ 是偶数，这等于 $\sum f(x_i^*)\,\Delta x_i$，即 $[0, a]$ 的分划的黎曼和；如果 $f$ 是奇数，则等于 $-\sum f(x_i^*)\,\Delta x_i$。当范数趋于 0 时， $[-a, 0]$ 的和趋于 $\int_{-a}^{0} f$， $[0, a]$ 的和趋于 $\int_0^a f$（定义 9.4）。因此，若 $f$ 是偶数，则 $\int_{-a}^{0} f = \int_0^a f$；若 $f$ 是奇数，则 $\int_{-a}^{0} f = -\int_0^a f$。加上 $\int_0^a f$ 得到 (a) 和 (b)。
:::

::: figure id=fig-09-4
左：$\int_0^4 \sqrt{4x - x^2}\,dx$ 是半圆的面积，半径为 2，即 $2\pi$（例 9.10）。中间：奇函数 $x^3 - 3x$ 在 $[-2, 2]$ 上；每个区域在原点另一侧有镜像区域，符号相反，因此积分是 0。右：偶函数；其两部分面积均为 $A$，因此在 $[-a, a]$ 上的积分是 $[0, a]$ 上积分的两倍。
:::

::: example 利用对称性
计算：

- (a) $\displaystyle\int_{-2}^{2} \big(x^3 - 4x + \sin x\big)\,dx$
- (b) $\displaystyle\int_{-1}^{1} \big(3x^2 + 5x^3 - 2\big)\,dx$
- (c) $\displaystyle\int_{-\pi}^{\pi} x^2\sin x\,dx$
- (d) $\displaystyle\int_{-3}^{3} \abs{x}\,dx$

**(a)** 每一项随 $x$ 改变符号：$(-x)^3 - 4(-x) + \sin(-x) = -\big(x^3 - 4x + \sin x\big)$。被积函数是奇函数，因此积分是 0。你甚至不需要知道如何积分 $\sin x$。

**(b)** 将被积函数分解为偶函数部分和奇函数部分，利用线性性：

$$\begin{aligned} &\int_{-1}^{1} \big(3x^2 + 5x^3 - 2\big)\,dx \\[5pt] &\quad= \int_{-1}^{1} \big(3x^2 - 2\big)\,dx + 5\int_{-1}^{1} x^3\,dx. \end{aligned}$$

第二个积分是 0，因为 $x^3$ 是奇函数。第一个被积函数是偶函数，因此第一个积分是 $2\int_0^1 \big(3x^2 - 2\big)\,dx = 2\big(3 \cdot \tfrac13 - 2 \cdot 1\big) = 2(1 - 2) = -2$。积分是 $-2$。

**(c)** $(-x)^2\sin(-x) = -x^2\sin x$，因此被积函数是奇函数，积分是 0。一般来说，偶函数与奇函数的乘积是奇函数。

**(d)** $\abs{x}$ 是偶函数，因此积分是 $2\int_0^3 x\,dx = 2 \cdot \tfrac92 = 9$，即底为 3、高为 3 的三角形面积的两倍。

```check
fa = x**3 - 4*x + sin(x); same(fa.subs(x, -x), -fa); same(integrate(fa, (x, -2, 2)), 0)
same(integrate(3*x**2 + 5*x**3 - 2, (x, -1, 1)), integrate(3*x**2 - 2, (x, -1, 1)) + 5*integrate(x**3, (x, -1, 1)))
same((3*x**2 - 2).subs(x, -x), 3*x**2 - 2); same(integrate(x**3, (x, -1, 1)), 0)
steps(2*Integral(3*x**2 - 2, (x, 0, 1)), 2*(3*Rational(1, 3) - 2*1), 2*(1 - 2), -2); same(integrate(3*x**2 + 5*x**3 - 2, (x, -1, 1)), -2)
same((x**2*sin(x)).subs(x, -x), -x**2*sin(x)); same(integrate(x**2*sin(x), (x, -pi, pi)), 0)
same(2*integrate(x, (x, 0, 3)), 9); same(2*Rational(9, 2), 9); same(integrate(Abs(x), (x, -3, 3)), 9)
```
:::

::: pitfall
对称性需要一个关于 0 对称的区间： $\int_0^1 x^3\,dx$ 不等于 0 而是 $\tfrac14$ （练习 9.5），因为在 $[0, 1]$ 上奇函数 $x^3$ 是正的。并且在 $[-a, a]$ 上积分等于 0 并不能使函数为奇函数： $\int_{-1}^{1} \big(x^2 - \tfrac13\big)\,dx = \tfrac23 - \tfrac23 = 0$，但 $x^2 - \tfrac13$ 是偶函数。

```check
same(integrate(x**3, (x, 0, 1)), Rational(1, 4)); same(integrate(x**2, (x, -1, 1)), Rational(2, 3)); same(integrate(Rational(1, 3), (x, -1, 1)), Rational(2, 3))
same(integrate(x**2 - Rational(1, 3), (x, -1, 1)), 0)
```
:::

## 函数的平均值 {#average}

$n$ 个数 $y_1, \dots, y_n$ 的平均值是 $\tfrac{y_1 + \dots + y_n}{n}$。但一天内温度取无限多个值时，如何计算平均温度？采样。取 $[a, b]$ 等分区间 $n$ 的右端点 $x_1, \dots, x_n$，并平均这些点处的函数值 $f$。乘以并除以 $b - a$，并使用 $\Delta x = \tfrac{b - a}{n}$，

$$\begin{aligned} &\frac{f(x_1) + \dots + f(x_n)}{n} \\[5pt] &\quad= \frac{1}{b - a}\sum_{i=1}^{n} f(x_i)\,\frac{b - a}{n} = \frac{R_n}{b - a}. \end{aligned}$$

当 $n$ 增大时，这些样本平均值趋近于 $\tfrac{1}{b - a}\int_a^b f(x)\,dx$，根据定理 9.4。

::: definition 平均值
函数$f$在$[a, b]$上的**平均值**，其中$a < b$，

$$f_{\text{avg}} = \frac{1}{b - a}\int_a^b f(x)\,dx,$$

读作 "f 平均值"。
:::

重新排列，$f_{\text{avg}}(b - a) = \int_a^b f(x)\,dx$：当 $f \ge 0$ 时，高度为 $f_{\text{avg}}$ 的矩形在 $[a, b]$ 上的面积，与图下区域的面积相同（图 9.5）。例如，函数 $x^2$ 在 $[0, 1]$ 上的平均值为 $\tfrac13$，在 $[0, 2]$ 上的平均值为 $\tfrac12 \cdot \tfrac83 = \tfrac43$。

```check
same(Rational(1, 2)*Rational(8, 3), Rational(4, 3)); same(integrate(x**2, (x, 0, 2))/2, Rational(4, 3))
```

::: example 落球的平均速度
求落球速度 $v(t) = 9.8t$ 在 $[0, 3]$ 和 $[1, 3]$ 上的平均值，并与模块 1 进行比较。

在 $[0, 3]$ 上，函数 $v$ 图像下方的区域是一个底为 3、高为 $v(3) = 29.4$ 的三角形，面积为 $\tfrac12 \cdot 3 \cdot 29.4 = 44.1$，因此

$$v_{\text{avg}} = \frac13 \cdot 44.1 = 14.7 \text{ m/s}.$$

在 $[1, 3]$ 上，该区域是一个平行边为 $v(1) = 9.8$ 和 $v(3) = 29.4$、相距 2 的梯形，面积为 $\tfrac{(9.8 + 29.4) \cdot 2}{2} = 39.2$，因此 $v_{\text{avg}} = \tfrac{39.2}{2} = 19.6$ m/s。

[小节 1.6](module_01_ZH.html#rates) 发现球在 $t = 1$ 和 $t = 3$ 之间下落 $s(3) - s(1) = 39.2$ m，平均速度为 19.6 m/s：同样的数值。区间内速度的平均值即为平均速度，即位移除以时间，理所当然。

```check
v912 = Rational(98, 10)*t
same(v912.subs(t, 3), Rational(294, 10)); same(Rational(1, 2)*3*Rational(294, 10), Rational(441, 10)); same(Rational(441, 10)/3, Rational(147, 10))
same((Rational(98, 10) + Rational(294, 10))*2/2, Rational(392, 10)); same(Rational(392, 10)/2, Rational(196, 10))
same(integrate(v912, (t, 0, 3))/3, Rational(147, 10)); same(integrate(v912, (t, 1, 3))/2, Rational(196, 10))
s912 = Rational(49, 10)*t**2; same(s912.subs(t, 3) - s912.subs(t, 1), Rational(392, 10))
```
:::

球在 $t = 2$ 处的速度为 19.6 m/s，位于 $[1, 3]$ 中间：速度达到了平均值。连续函数总是如此。

::: theorem 积分的中值定理
如果 $f$ 在 $[a, b]$ 上连续，其中 $a < b$，则存在 $c$ ∈ $[a, b]$，使得

$$f(c) = \frac{1}{b - a}\int_a^b f(x)\,dx,$$

即， $\int_a^b f(x)\,dx = f(c)(b - a)$。
:::

::: proof
由于 $f$ 连续，因此可积（定理 9.3），并且根据极值定理（模块 3），它在 $[a, b]$ 上有最小值 $m = f(d)$ 和最大值 $M = f(e)$，对于某些数 $d$ 和 $e$ ∈ $[a, b]$。由于 $m \le f(x) \le M$ 在 $[a, b]$ 上，比较定理给出 $m(b - a) \le \int_a^b f(x)\,dx \le M(b - a)$，并将两边除以 $b - a > 0$，

$$m \le f_{\text{avg}} \le M.$$

若 $f_{\text{avg}} = m$，取 $c = d$；若 $f_{\text{avg}} = M$，取 $c = e$。否则 $f_{\text{avg}}$ 严格介于 $f(d)$ 与 $f(e)$ 之间，且 $f$ 在端点为 $d$ 和 $e$ 的闭区间上连续，因此根据介值定理（模块 3），存在一个数 $c$ 严格介于 $d$ 与 $e$ 之间，并在 $[a, b]$ 中，具有 $f(c) = f_{\text{avg}}$。
:::

连续性是必要的，因为模块 3 中所用的两个定理都需要连续性。没有连续性，结论可能不成立：定义在 $[0, 1)$ 上为 0，在 $[1, 2]$ 上为 1 的函数是可积的，有一个跳跃点，其在 $[0, 2]$ 上的积分等于边长为 1 的正方形的面积。因此，该函数在 $[0, 2]$ 上的平均值为 $\tfrac12$，而该值函数从未取到。

```check
fj = Piecewise((0, x < 1), (1, True)); same(integrate(fj, (x, 0, 2)), 1); same(integrate(fj, (x, 0, 2))/2, Rational(1, 2))
```

::: figure id=fig-09-5
$f(x) = x^2$ 在 $[-2, 2]$ 上的平均值为 $\tfrac43$ （例 9.13）。虚线矩形的高度为 $\tfrac43$，位于 $[-2, 2]$ 上，其面积 $\tfrac{16}{3}$ 与图下阴影区域相同：区域中高于矩形的部分面积等于矩形中被区域留空的部分面积。图在两个点 $c = \pm\tfrac{2}{\sqrt3}$ 处达到高度 $\tfrac43$。
:::

::: example 平均值达到的位置
求 $f(x) = x^2$ 在 $[-2, 2]$ 上的平均值，以及所有在 $[-2, 2]$ 内且满足 $f(c) = f_{\text{avg}}$ 的 $c$ 值。然后在 $[0, 1]$ 上重复相同操作。

函数 $x^2$ 是偶函数，因此根据定理 9.8 和第 9.4 节，得到 $\int_{-2}^{2} x^2\,dx = 2\int_0^2 x^2\,dx = 2 \cdot \tfrac83 = \tfrac{16}{3}$。该区间长度为 4，因此 $f_{\text{avg}} = \tfrac14 \cdot \tfrac{16}{3} = \tfrac43$。解方程 $c^2 = \tfrac43$ 得到 $c = \pm\tfrac{2}{\sqrt3} \approx \pm1.155$，且两者都在 $[-2, 2]$ 内。定理保证至少存在一个 $c$；此处有两个。

在 $[0, 1]$, $f_{\text{avg}} = \int_0^1 x^2\,dx = \tfrac13$ 和 $c^2 = \tfrac13$ 中包含 $c$ 的 $[0, 1]$ 给出 $c = \tfrac{1}{\sqrt3} \approx 0.577$。注意 $c$ 并不是区间中点 $\tfrac12$：函数 $x^2$ 在区间 $[0, 1]$ 上的平均值并不等于其在中点 $\tfrac14$ 处的值。

```check
same(2*integrate(x**2, (x, 0, 2)), Rational(16, 3)); same(integrate(x**2, (x, -2, 2)), Rational(16, 3)); same(Rational(1, 4)*Rational(16, 3), Rational(4, 3))
same_set(solve(x**2 - Rational(4, 3), x), [2/sqrt(3), -2/sqrt(3)]); rounds(2/sqrt(3), '1.155'); holds(2/sqrt(3) < 2)
same_set([r_ for r_ in solve(x**2 - Rational(1, 3), x) if r_ >= 0], [1/sqrt(3)]); rounds(1/sqrt(3), '0.577')
same((x**2).subs(x, Rational(1, 2)), Rational(1, 4))
```
:::

::: pitfall
$f$ 的平均值并不等于其在区间端点处的值的平均值。对于 $x^2$ 在 $[0, 1]$ 上的 $\tfrac{f(0) + f(1)}{2} = \tfrac12$，而 $f_{\text{avg}} = \tfrac13$。对于线性函数，例如例 9.12 中的速率 $9.8t$，两者一致，但一般情况下并不一致：平均值考虑了 $f$ 的所有取值。
:::

## 一种更快的方法即将出现 {#faster-way}

本模块从 0 到 $b$ 的精确积分，对于 $b > 0$ 为：

| $f(x)$ | $\displaystyle\int_0^b f(x)\,dx$ | 发现在 |
|---|---|---|
| $x$ | $\dfrac{b^2}{2}$ | 一个三角形 |
| $x^2$ | $\dfrac{b^3}{3}$ | 第 9.3 节 |
| $x^3$ | $\dfrac{b^4}{4}$ | 练习 9.5 |
| $9.8x$ | $4.9b^2$ | 一个三角形，第 9.1 节 |

将每个答案视为上限 $b$ 的函数，并使用 [模块 4: $\big(\tfrac{b^2}{2}\big)' = b$, $\big(\tfrac{b^3}{3}\big)' = b^2$, $\big(\tfrac{b^4}{4}\big)' = b^3$ 和 $\big(4.9b^2\big)' = 9.8b$ 的幂法则](module_04_ZH.html#power-rule)] 对其求导。每次积分被还原时，用 $b$ 替换 $x$。对于自由下落的球来说，这并不令人惊讶：速度图上到时间 $b$ 的面积是下落的距离 $s(b) = 4.9b^2$，距离的导数就是速度。

```check
for F_, f_ in ((bp**2/2, x), (bp**3/3, x**2), (bp**4/4, x**3), (Rational(49, 10)*bp**2, Rational(98, 10)*x)):
    same(integrate(f_, (x, 0, bp)), F_); same(diff(F_, bp), f_.subs(x, bp))
```

这种模式是 **基本定理**，是 模块 10 的主题：积分和微分互为逆运算，正如 [小节 1.1](module_01_ZH.html#about)] 所暗示的那样。它最常用的形式是：如果 $f$ 在 $[a, b]$ 和 $F$ 上连续，且 $F' = f$ 是其原函数，则

$$\int_a^b f(x)\,dx = F(b) - F(a).$$

有了它， $\int_0^1 x^2\,dx = \tfrac{1^3}{3} - \tfrac{0^3}{3} = \tfrac13$ 只需一行，无需求和也无需极限。它还能够计算本模块只能估算的积分。由于 $(\ln x)' = \tfrac1x$ 对于 $x > 0$（模块 6）， $\int_1^2 \tfrac{dx}{x} = \ln 2 - \ln 1 = \ln 2 \approx 0.693147$，即例 9.4 中和式所趋近的数；并且由于 $(-\cos x)' = \sin x$（[模块 5](module_05_ZH.html#trig)）， $\int_0^\pi \sin x\,dx = -\cos\pi + \cos 0 = 2$。

```check
same(diff(log(x), x), 1/x); same(log(2) - log(1), log(2)); same(diff(-cos(x), x), sin(x)); same(-cos(pi) + cos(0), 2)
rounds(log(2), '0.693147'); same(integrate(1/x, (x, 1, 2)), log(2))
same(integrate(sin(x), (x, 0, pi)), 2); same(Rational(1, 3) - 0, integrate(x**2, (x, 0, 1)))
```

黎曼和依然至关重要。它们定义了积分；它们将实际问题（面积、距离、能量、平均值，以及在模块12中的体积、功和概率）转化为积分；并且当 $F$ 没有由熟悉函数构成的公式时，如对于 $e^{-x^2}$，它们可以数值计算积分（模块11）。

## 你所学到的内容 {#summary}

- 曲线下面积和变速运动所经过的距离是同一个问题：将区间分成小段，用矩形近似每一小段，相加，然后让小段趋于零。
- 西格玛符号将 $a_m + \dots + a_n$ 表示为 $\sum_{i=m}^{n} a_i$；和式可以拆分为 $+$ 和 $-$，常数可以提出。 $\sum i = \tfrac{n(n+1)}{2}$、 $\sum i^2 = \tfrac{n(n+1)(2n+1)}{6}$ 和 $\sum i^3 = \big(\tfrac{n(n+1)}{2}\big)^2$ 由配对、裂项相消和归纳法证明。
- 左、右和中点和 $L_n$、$R_n$ 和 $M_n$ 分别在等宽 $\Delta x = \tfrac{b - a}{n}$ 的 $n$ 个子区间左端点、右端点或中点处取高。对于连续递增的 $f$， $L_n \le \int_a^b f \le R_n$；对于连续递减的 $f$，则相反。对于 $x^2$ 在 $[0, 1]$ 上， $L_n$ 和 $R_n$ 的误差像 $\tfrac1n$ 一样缩小， $M_n$ 的误差像 $\tfrac{1}{n^2}$ 一样缩小。
- 定积分 $\int_a^b f(x)\,dx$ 是黎曼和 $\sum f(x_i^*)\,\Delta x_i$ 在分区范数趋于 0 时的极限，无论样本点如何选取。连续函数，以及有限个间断点的有界函数都是可积的，此时 $\int_a^b f = \lim L_n = \lim R_n = \lim M_n$。精确极限给出 $\int_0^b x^2\,dx = \tfrac{b^3}{3}$。
- 积分是一个有符号的面积：轴上方的面积计为正，轴下方的面积计为负。总面积是 $\int_a^b \abs{f}$。速度的积分是一个位移；所行路程是速度的积分 $\abs{v}$。
- 积分具有线性性质，区间可加（$\int_a^b f + \int_b^c f = \int_a^c f$，与 $\int_b^a f = -\int_a^b f$），并保持不等式： $m(b - a) \le \int_a^b f \le M(b - a)$ 当 $m \le f \le M$ 在 $[a, b]$ 上， $a < b$.
- 三角形、梯形和圆盘的面积直接给出积分；在 $[-a, a]$ 上，奇函数积分等于 0，偶函数积分等于其在 $[0, a]$ 上积分的两倍。
- $f$ 在 $[a, b]$ 上的平均值为 $\tfrac{1}{b - a}\int_a^b f(x)\,dx$，且连续函数在其定义域 $[a, b]$ 内某处取其平均值（积分的中值定理）。
- 对 $\int_0^b x^2\,dx = \tfrac{b^3}{3}$ 关于 $b$ 求导可得到 $b^2$：这是微积分基本定理的初步体现，模块 10。

## 练习 {#exercises}

:::: exercise 西格玛符号 {#ex-9-1} ★
- (a) 写出并计算 $\sum_{i=1}^{5} (2i + 1)$ 和 $\sum_{k=0}^{4} 3^k$。
- (b) 用求和符号表示 $2 + 4 + 6 + \dots + 100$，并利用定理 9.2 计算。
- (c) 利用求和法则和定理 9.2 计算 $\sum_{i=1}^{10} \big(i^2 - 3i + 2\big)$。

::: solution
**(a)** $\sum_{i=1}^{5} (2i + 1) = 3 + 5 + 7 + 9 + 11 = 35$，和 $\sum_{k=0}^{4} 3^k = 1 + 3 + 9 + 27 + 81 = 121$。第二个求和式有五个项，因为 $k$ 从 0 开始。

**(b)** 偶数索引为 $i$ 的数是 $2i$，且 $2i = 100$ 在 $i = 50$ 处，因此和为 $\sum_{i=1}^{50} 2i$。根据求和的第一个规则和定理 9.2，

$$\begin{aligned} \sum_{i=1}^{50} 2i &= 2\sum_{i=1}^{50} i \\[5pt] &= 2 \cdot \frac{50 \cdot 51}{2} = 2550. \end{aligned}$$

**(c)** 将和拆开，并使用定理 9.2 与 $n = 10$：

$$\begin{aligned} &\sum_{i=1}^{10} \big(i^2 - 3i + 2\big) \\[5pt] &\quad= \sum_{i=1}^{10} i^2 - 3\sum_{i=1}^{10} i + \sum_{i=1}^{10} 2 \\[5pt] &\quad= 385 - 3 \cdot 55 + 2 \cdot 10 = 240. \end{aligned}$$

一个常见的错误是写出 $\sum_{i=1}^{10} 2 = 2$；它实际上是 $2 + 2 + \dots + 2 = 20$。通过另一种方法验证： $i^2 - 3i + 2 = (i - 1)(i - 2)$，其在 $i = 1, \dots, 10$ 处的值为 $0, 0, 2, 6, 12, 20, 30, 42, 56, 72$，和为 240。

```check
same(summation(2*i + 1, (i, 1, 5)), 35); same(3 + 5 + 7 + 9 + 11, 35)
same(summation(3**k, (k, 0, 4)), 121); same(1 + 3 + 9 + 27 + 81, 121)
same(solve(2*x - 100, x), [50]); steps(summation(2*i, (i, 1, 50)), 2*Rational(50*51, 2), 2550); same(sum(range(2, 101, 2)), 2550)
steps(summation(i**2 - 3*i + 2, (i, 1, 10)), 385 - 3*55 + 2*10, 240)
same(factor(i**2 - 3*i + 2), (i - 1)*(i - 2)); same([(j - 1)*(j - 2) for j in range(1, 11)], [0, 0, 2, 6, 12, 20, 30, 42, 56, 72])
same(sum([0, 0, 2, 6, 12, 20, 30, 42, 56, 72]), 240); same(summation(2, (i, 1, 10)), 20)
```
:::
::::

:::: exercise 手动计算黎曼和 {#ex-9-2} ★
设 $f(x) = 4 - x^2$ 在 $[0, 2]$ 上。

- (a) 计算 $L_4$、$R_4$ 和 $M_4$。
- (b) 其中哪一个一定大于曲线下的面积，哪一个一定更小？为什么？
- (c) 利用线性性质和 $\int_0^b x^2\,dx = \tfrac{b^3}{3}$ 求出面积。哪一个这三个和最接近？

::: solution
**(a)** $\Delta x = \tfrac{2 - 0}{4} = 0.5$。切割点 $0, 0.5, 1, 1.5, 2$ 给出的值为 $4, 3.75, 3, 1.75, 0$，因此

$$\begin{aligned} L_4 &= 0.5(4 + 3.75 + 3 + 1.75) \\ &= 0.5 \cdot 12.5 = 6.25, \\ R_4 &= 0.5(3.75 + 3 + 1.75 + 0) \\ &= 0.5 \cdot 8.5 = 4.25. \end{aligned}$$

中点 $0.25, 0.75, 1.25, 1.75$ 给出值 $3.9375, 3.4375, 2.4375, 0.9375$，其和为 $10.75$，因此 $M_4 = 0.5 \cdot 10.75 = 5.375$。

**(b)** 在 $[0, 2]$ 上， $x^2$ 增加，因此 $4 - x^2$ 减少。在每个子区间，其左端点的值为其最大值，因此 $L_4 = 6.25$ 比面积大；其右端点的值为其最小值，因此 $R_4 = 4.25$ 比面积小。这个论点对 $M_4$ 没有任何说明。

**(c)** 由线性性，

$$\begin{aligned} &\int_0^2 \big(4 - x^2\big)\,dx \\[5pt] &\quad= \int_0^2 4\,dx - \int_0^2 x^2\,dx \\[5pt] &\quad= 8 - \frac83 = \frac{16}{3} \approx 5.333. \end{aligned}$$

$M_4 = 5.375$ 是最近的，比 $\tfrac{43}{8} - \tfrac{16}{3} = \tfrac{1}{24} \approx 0.042$ 大； $L_4$ 比 $\tfrac{11}{12} \approx 0.917$ 大， $R_4$ 比 $\tfrac{13}{12} \approx 1.083$ 小。此处中点和高估，因为图像是向下弯曲的；模块 11 解释了这种联系。

```check
f2 = 4 - x9**2
same([f2.subs(x9, v_) for v_ in (0, Rational(1, 2), 1, Rational(3, 2), 2)], [4, Rational(375, 100), 3, Rational(175, 100), 0])
steps(Lsum(f2, 0, 2, 4), Rational(1, 2)*Rational(125, 10), Rational(625, 100)); steps(Rsum(f2, 0, 2, 4), Rational(1, 2)*Rational(85, 10), Rational(425, 100))
same([f2.subs(x9, v_) for v_ in (Rational(1, 4), Rational(3, 4), Rational(5, 4), Rational(7, 4))], [Rational(39375, 10000), Rational(34375, 10000), Rational(24375, 10000), Rational(9375, 10000)])
steps(Msum(f2, 0, 2, 4), Rational(1, 2)*Rational(1075, 100), Rational(5375, 1000))
steps(Integral(4 - x**2, (x, 0, 2)), Integral(4, (x, 0, 2)) - Integral(x**2, (x, 0, 2)), 8 - Rational(8, 3), Rational(16, 3)); rounds(Rational(16, 3), '5.333')
same(Rational(5375, 1000), Rational(43, 8)); steps(Rational(43, 8) - Rational(16, 3), Rational(1, 24)); rounds(Rational(1, 24), '0.042')
same(Rational(625, 100) - Rational(16, 3), Rational(11, 12)); rounds(Rational(11, 12), '0.917')
same(Rational(16, 3) - Rational(425, 100), Rational(13, 12)); rounds(Rational(13, 12), '1.083')
```
:::
::::

:::: exercise 一辆减速的汽车 {#ex-9-3} ★
一位司机刹车，一位乘客每 5 秒读一次速度表，直到汽车停止。将读数转换为米每秒后，数据如下：

| 时间 $t$ (秒) | 速度 $v$ (米/秒) |
|---|---|
| 0 | 20 |
| 5 | 18 |
| 10 | 15 |
| 15 | 11 |
| 20 | 6 |
| 25 | 0 |

- (a) 求左和右的和。哪一个是对刹车距离的上界估计？为什么？
- (b) 速度表需要多频繁地读取，才能使两个估计值之间的差异不超过 20 米？

::: solution
**(a)** 与 $\Delta t = 5$ s，

$$\begin{aligned} L &= 5(20 + 18 + 15 + 11 + 6) \\ &= 5 \cdot 70 = 350 \text{ m}, \\ R &= 5(18 + 15 + 11 + 6 + 0) \\ &= 5 \cdot 50 = 250 \text{ m}. \end{aligned}$$

汽车在整个过程中减速，因此在每个区间内，其速度最大值为该区间开始时的读数，最小值为该区间结束时的读数。因此，左和为 350 米，是上界估计值；右和为 250 米，是下界估计值：制动距离在 250 米和 350 米之间。这与例 9.2 相反，例 9.2 中汽车在加速。

**(b)** 如例 9.2 所示，除了第一个和最后一个读数外，每个读数在两个和中都出现，因此在每隔 $\Delta t$ 秒读取一次的情况下

$$\begin{aligned} L - R &= \Delta t\,\big(v(0) - v(25)\big) \\ &= 20\,\Delta t. \end{aligned}$$

当 $\Delta t \le 1$ 时，差异最多为 20 米：速度表至少每秒读取一次。

```check
V3 = [20, 18, 15, 11, 6, 0]
same(sum(V3[:5]), 70); same(5*sum(V3[:5]), 350); same(sum(V3[1:]), 50); same(5*sum(V3[1:]), 250)
same(5*sum(V3[:5]) - 5*sum(V3[1:]), 5*(V3[0] - V3[-1])); same(solve(Eq(20*t, 20), t), [1])
```
:::
::::

:::: exercise 积分与面积 {#ex-9-4} ★
通过将其解释为有符号面积或利用对称性来计算每个积分。

- (a) $\displaystyle\int_1^4 (3 - x)\,dx$
- (b) $\displaystyle\int_{-2}^{4} \abs{x}\,dx$
- (c) $\displaystyle\int_0^3 \sqrt{9 - x^2}\,dx$
- (d) $\displaystyle\int_{-2}^{2} \big(x\cos x + 3\big)\,dx$

::: solution
**(a)** 直线 $y = 3 - x$ 在 $[1, 3)$ 上方，且在 $(3, 4]$ 下方。上方：一个底边为 2、高为 $f(1) = 2$ 的三角形，面积为 2。下方：一个底边为 1、高为 $\abs{f(4)} = 1$ 的三角形，面积为 $\tfrac12$。积分是 $2 - \tfrac12 = \tfrac32$。

**(b)** 两个三角形：在 $[-2, 0]$ 上，底边为 2、高为 2，面积为 2；在 $[0, 4]$ 上，底边为 4、高为 4，面积为 8。积分是 $2 + 8 = 10$。

**(c)** $y = \sqrt{9 - x^2}$ 是圆 $x^2 + y^2 = 9$ 的上半部分，半径为 3。从 $x = 0$ 到 $x = 3$，它围成一个四分之一圆盘，面积为 $\tfrac14\pi \cdot 3^2 = \tfrac{9\pi}{4} \approx 7.069$。

**(d)** 由线性性质，积分是 $\int_{-2}^{2} x\cos x\,dx + \int_{-2}^{2} 3\,dx$。函数 $x\cos x$ 是奇函数，因为 $(-x)\cos(-x) = -x\cos x$ （余弦是偶函数），因此其在 $[-2, 2]$ 上的积分是 0。第二个积分是 $3 \cdot 4 = 12$。答案是 12。

```check
same(Rational(1, 2)*2*2 - Rational(1, 2)*1*1, Rational(3, 2)); same(integrate(3 - x, (x, 1, 4)), Rational(3, 2))
same(integrate(Abs(x), (x, -2, 4)), 10)
same(Rational(1, 4)*pi*3**2, 9*pi/4); same(integrate(sqrt(9 - x**2), (x, 0, 3)), 9*pi/4); rounds(9*pi/4, '7.069')
same((x*cos(x)).subs(x, -x), -x*cos(x)); same(integrate(x*cos(x), (x, -2, 2)), 0); same(integrate(x*cos(x) + 3, (x, -2, 2)), 12)
```
:::
::::

:::: exercise $x^3$ 的积分 {#ex-9-5} ★★
- (a) 证明 $f(x) = x^3$ 在 $[0, 2]$ 上关于 $n$ 个子区间的右黎和为 $R_n = 4\big(1 + \tfrac1n\big)^2$。
- (b) 推出 $\displaystyle\int_0^2 x^3\,dx = 4$。
- (c) 用相同的方式证明对于每个 $b > 0$，都有 $\displaystyle\int_0^b x^3\,dx = \frac{b^4}{4}$，并求 $\displaystyle\int_0^1 x^3\,dx$ 和 $\displaystyle\int_1^2 x^3\,dx$。

::: solution
**(a)** $\Delta x = \tfrac2n$ 和 $x_i = \tfrac{2i}{n}$，所以 $f(x_i) = \tfrac{8i^3}{n^3}$。根据求和的第一个规则和 $\sum i^3$ 的公式，

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\frac{8i^3}{n^3}\cdot\frac2n = \frac{16}{n^4}\sum_{i=1}^{n} i^3 \\[5pt] &= \frac{16}{n^4}\cdot\frac{n^2(n + 1)^2}{4} \\[5pt] &= \frac{4(n + 1)^2}{n^2} = 4\Big(1 + \frac1n\Big)^2. \end{aligned}$$

**(b)** $x^3$ 是连续的，因此在 $[0, 2]$ 上可积（定理 9.3），并且根据定理 9.4，其积分为 $\lim_{n\to\infty} R_n = 4 \cdot (1 + 0)^2 = 4$。

**(c)** 现在 $\Delta x = \tfrac{b}{n}$ 和 $x_i = \tfrac{ib}{n}$，所以

$$\begin{aligned} R_n &= \frac{b^4}{n^4}\sum_{i=1}^{n} i^3 \\[5pt] &= \frac{b^4}{n^4}\cdot\frac{n^2(n + 1)^2}{4} \\[5pt] &= \frac{b^4}{4}\Big(1 + \frac1n\Big)^2, \end{aligned}$$

这趋近于 $\tfrac{b^4}{4}$。当 $b = 1$ 时， $\int_0^1 x^3\,dx = \tfrac14$。根据可加性， $\int_1^2 x^3\,dx = \int_0^2 x^3\,dx - \int_0^1 x^3\,dx = 4 - \tfrac14 = \tfrac{15}{4}$。

```check
same((2*i/n)**3, 8*i**3/n**3)
steps(Sum(8*i**3/n**3*2/n, (i, 1, n)), 16/n**4*Sum(i**3, (i, 1, n)), 16/n**4*(n**2*(n + 1)**2/4), 4*(n + 1)**2/n**2, 4*(1 + 1/n)**2)
same(limit(4*(1 + 1/n)**2, n, oo), 4); same(integrate(x**3, (x, 0, 2)), 4)
steps(Sum((i*bp/n)**3*bp/n, (i, 1, n)), bp**4/n**4*Sum(i**3, (i, 1, n)), bp**4/n**4*(n**2*(n + 1)**2/4), bp**4/4*(1 + 1/n)**2)
same(limit(bp**4/4*(1 + 1/n)**2, n, oo), bp**4/4); same(integrate(x**3, (x, 0, bp)), bp**4/4)
same(integrate(x**3, (x, 0, 1)), Rational(1, 4)); same(4 - Rational(1, 4), Rational(15, 4)); same(integrate(x**3, (x, 1, 2)), Rational(15, 4))
```
:::
::::

:::: exercise 两种方式的有符号面积 {#ex-9-6} ★★
- (a) 将 $\displaystyle\int_1^4 (2x - 3)\,dx$ 表示为右和的极限。
- (b) 用几何方法验证你的答案：绘制图像并找出它与 $x$ 轴所形成的三角形的面积。图像与轴之间的总面积是多少？

::: solution
**(a)** $\Delta x = \tfrac3n$ 和 $x_i = 1 + \tfrac{3i}{n}$，因此 $f(x_i) = 2 + \tfrac{6i}{n} - 3 = \tfrac{6i}{n} - 1$，并且

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\Big(\frac{6i}{n} - 1\Big)\frac3n \\[5pt] &= \frac{18}{n^2}\sum_{i=1}^{n} i - \frac3n\sum_{i=1}^{n} 1 \\[5pt] &= \frac{18}{n^2}\cdot\frac{n(n + 1)}{2} - 3 \\[5pt] &= \frac{9(n + 1)}{n} - 3. \end{aligned}$$

当 $n \to \infty$， $\tfrac{n + 1}{n} \to 1$，因此 $\int_1^4 (2x - 3)\,dx = 9 - 3 = 6$。

**(b)** 直线 $y = 2x - 3$ 与轴在 $x = \tfrac32$ 处相交。在 $\big[1, \tfrac32\big]$ 区间内，它位于轴下方，形成一个底为 $\tfrac12$、高为 $\abs{f(1)} = 1$ 的三角形，面积为 $\tfrac14$。在 $\big[\tfrac32, 4\big]$ 区间内，它位于轴上方，形成一个底为 $\tfrac52$、高为 $f(4) = 5$ 的三角形，面积为 $\tfrac{25}{4}$。有符号的面积是 $\tfrac{25}{4} - \tfrac14 = 6$，如 (a) 所示。总面积是 $\tfrac{25}{4} + \tfrac14 = \tfrac{13}{2}$。

```check
same(expand(2*(1 + 3*i/n) - 3), 6*i/n - 1)
steps(Sum((6*i/n - 1)*3/n, (i, 1, n)), 18/n**2*Sum(i, (i, 1, n)) - 3/n*Sum(1, (i, 1, n)), 18/n**2*(n*(n + 1)/2) - 3, 9*(n + 1)/n - 3)
same(limit(9*(n + 1)/n - 3, n, oo), 6); same(integrate(2*x - 3, (x, 1, 4)), 6)
same(solve(2*x - 3, x), [Rational(3, 2)]); same(Rational(1, 2)*Rational(1, 2)*1, Rational(1, 4)); same(Rational(1, 2)*Rational(5, 2)*5, Rational(25, 4))
same(Rational(25, 4) - Rational(1, 4), 6); same(Rational(25, 4) + Rational(1, 4), Rational(13, 2)); same(integrate(Abs(2*x - 3), (x, 1, 4)), Rational(13, 2))
```
:::
::::

:::: exercise 去而复返 {#ex-9-7} ★★
[例 4.10](module_04_ZH.html#motion) 中的粒子位置为 $s(t) = t^3 - 6t^2 + 9t$ 米，速度为 $v(t) = 3t^2 - 12t + 9$ m/s；它在 $t = 1$ 和 $t = 3$ 处静止，并在两者之间向反方向运动。

- (a) 使用 $\int_0^b t^2\,dt = \tfrac{b^3}{3}$ 和 $\int_0^b t\,dt = \tfrac{b^2}{2}$ 的线性性来求 $\int_0^b v(t)\,dt$ 对于 $b > 0$。将其与 $s(b) - s(0)$ 进行比较。
- (b) 使用可加性来求 $\int_0^1 v(t)\,dt$、$\int_1^3 v(t)\,dt$ 和 $\int_3^4 v(t)\,dt$。求前 4 秒内的位移和路程，并与 模块 4 进行比较。

::: solution
**(a)** 通过线性性，有 $\int_0^b 9\,dt = 9b$，

$$\begin{aligned} &\int_0^b v(t)\,dt \\[5pt] &\quad= 3\int_0^b t^2\,dt - 12\int_0^b t\,dt \\[5pt] &\qquad + \int_0^b 9\,dt \\[5pt] &\quad= 3\cdot\frac{b^3}{3} - 12\cdot\frac{b^2}{2} + 9b \\[5pt] &\quad= b^3 - 6b^2 + 9b. \end{aligned}$$

即 $s(b)$，且 $s(0) = 0$：从 0 到 $b$ 的速度积分是位移 $s(b) - s(0)$，如第 9.4 节所述。

**(b)** 写 $F(b) = \int_0^b v(t)\,dt = b^3 - 6b^2 + 9b$，使得 $F(1) = 4$，$F(3) = 0$ 和 $F(4) = 4$。由可加性，$\int_p^q v = F(q) - F(p)$ 对于 $0 \le p < q$，所以

$$\begin{aligned} \int_0^1 v\,dt &= 4, \\[5pt] \int_1^3 v\,dt &= 0 - 4 = -4, \\[5pt] \int_3^4 v\,dt &= 4 - 0 = 4. \end{aligned}$$

在 $[0, 4]$ 时间内位移为 $4 - 4 + 4 = 4$ 米。速度仅在 $(1, 3)$ 为负，因此路程为 $\int_0^4 \abs{v}\,dt = 4 + 4 + 4 = 12$ 米。这些数值与例 4.10 相同：粒子向前移动 4 米，返回 4 米，再向前移动 4 米，总共移动了 12 米，最终距离起点 4 米。

```check
v7 = 3*t**2 - 12*t + 9; s7 = t**3 - 6*t**2 + 9*t
steps(Integral(v7, (t, 0, bp)), 3*Integral(t**2, (t, 0, bp)) - 12*Integral(t, (t, 0, bp)) + Integral(9, (t, 0, bp)), 3*bp**3/3 - 12*bp**2/2 + 9*bp, bp**3 - 6*bp**2 + 9*bp)
same(s7.subs(t, bp) - s7.subs(t, 0), bp**3 - 6*bp**2 + 9*bp)
F7 = lambda T: T**3 - 6*T**2 + 9*T
same([F7(1), F7(3), F7(4)], [4, 0, 4])
same(integrate(v7, (t, 0, 1)), 4); same(integrate(v7, (t, 1, 3)), -4); same(integrate(v7, (t, 3, 4)), 4)
same(integrate(v7, (t, 0, 4)), 4); same(integrate(Abs(v7), (t, 0, 4)), 12)
same(solve_univariate_inequality(v7 < 0, t, relational=False), Interval.open(1, 3))
```
:::
::::

:::: exercise 上界与平均值 {#ex-9-8} ★★
- (a) 证明 $1 \le \displaystyle\int_0^1 \sqrt{1 + x^2}\,dx \le \sqrt2$。
- (b) 求 $f(x) = 3x^2$ 在 $[0, 2]$ 上的平均值，以及 $[0, 2]$ 中满足 $f(c) = f_{\text{avg}}$ 的数 $c$。
- (c) 求 $g(x) = \sqrt{4 - x^2}$ 在 $[-2, 2]$ 上的平均值，以及 $[-2, 2]$ 中所有满足 $g(c) = g_{\text{avg}}$ 的数 $c$。

::: solution
**(a)** 对于 $x$ ∈ $[0, 1]$，有 $0 \le x^2 \le 1$，因此 $1 \le 1 + x^2 \le 2$，由于平方根是增函数，故 $1 \le \sqrt{1 + x^2} \le \sqrt2$。应用定理 9.7(c) 与 $b - a = 1$ 得 $1 \le \int_0^1 \sqrt{1 + x^2}\,dx \le \sqrt2 \approx 1.414$。

**(b)** $\int_0^2 3x^2\,dx = 3 \cdot \tfrac83 = 8$，因此 $f_{\text{avg}} = \tfrac82 = 4$。由 $3c^2 = 4$ 得 $c^2 = \tfrac43$；在 $[0, 2]$ 中的根为 $c = \tfrac{2}{\sqrt3} \approx 1.155$。

**(c)** $\int_{-2}^{2} \sqrt{4 - x^2}\,dx$ 是半圆面积，半径为 2，面积为 $2\pi$。区间长度为 4，因此 $g_{\text{avg}} = \tfrac{2\pi}{4} = \tfrac{\pi}{2} \approx 1.571$。解 $\sqrt{4 - c^2} = \tfrac{\pi}{2}$：平方得 $4 - c^2 = \tfrac{\pi^2}{4}$，因此 $c = \pm\sqrt{4 - \tfrac{\pi^2}{4}} \approx \pm1.238$。两者都在 $[-2, 2]$ 中，且都满足方程，因为 $\tfrac{\pi^2}{4}$ 的平方根为 $\tfrac{\pi}{2}$。

```check
holds(sqrt(2) > 1); rounds(sqrt(2), '1.414')
I8 = Integral(sqrt(1 + x**2), (x, 0, 1)).evalf(20); holds(1 <= I8); holds(I8 <= sqrt(2))
same(integrate(3*x**2, (x, 0, 2)), 8); same(Rational(8, 2), 4)
same_set([r_ for r_ in solve(3*x**2 - 4, x) if r_ >= 0], [2/sqrt(3)]); rounds(2/sqrt(3), '1.155')
same(integrate(sqrt(4 - x**2), (x, -2, 2)), 2*pi); same(2*pi/4, pi/2); rounds(pi/2, '1.571')
same_set(solve(Eq(sqrt(4 - x**2), pi/2), x), [sqrt(4 - pi**2/4), -sqrt(4 - pi**2/4)]); rounds(sqrt(4 - pi**2/4), '1.238')
holds(sqrt(4 - pi**2/4) < 2)
```
:::
::::

:::: exercise 能量来自功率日志 {#ex-9-9} ★★
一个程序在一次一分钟的任务中，每隔10秒记录一次GPU的功率消耗。读数如下：

| 时间 $t$ (秒) | 功率 $P$ (W) |
|---|---|
| 0 | 120 |
| 10 | 180 |
| 20 | 250 |
| 30 | 260 |
| 40 | 240 |
| 50 | 200 |
| 60 | 150 |

能量是功率随时间的积累：1瓦特持续1秒等于1焦耳（J），因此该任务消耗了 $E = \int_0^{60} P(t)\,dt$ 焦耳。

- (a) 用左和右求和法估算 $E$。
- (b) 你能得出 $E$ 介于两者之间吗？解释。
- (c) 从两个求和的平均值估算任务期间的平均功率，以及以瓦时为单位的能量（$1$ Wh $= 3600$ J）。

::: solution
**(a)** 与 $\Delta t = 10$ s，

$$\begin{aligned} L &= 10(120 + 180 + 250 \\ &\qquad + 260 + 240 + 200) \\ &= 10 \cdot 1250 = 12{,}500 \text{ J}, \\ R &= 10(180 + 250 + 260 \\ &\qquad + 240 + 200 + 150) \\ &= 10 \cdot 1280 = 12{,}800 \text{ J}. \end{aligned}$$

**(b)** 否。功率在前30秒内上升，之后下降。在上升的区间，区间的左侧读数是较小的；在下降的区间，左侧读数是较大的。因此，左侧和右侧的和都混合了低估和高估，且无法保证始终在 $E$ 之上或之下。更糟糕的是，10秒的读数无法反映它们之间的短时尖峰。在不知道 $P$ 在读数之间的更多信息（例如，每个区间内是稳定上升还是下降）的情况下，这些读数无法限定能量。

**(c)** 两个和的平均值是 $12{,}650$ J。平均功率是 $\tfrac{1}{60}\int_0^{60} P(t)\,dt \approx \tfrac{12{,}650}{60} \approx 210.8$ W，能量大约是 $\tfrac{12{,}650}{3600} \approx 3.51$ Wh。

```check
P9 = [120, 180, 250, 260, 240, 200, 150]
same(sum(P9[:6]), 1250); same(10*sum(P9[:6]), 12500); same(sum(P9[1:]), 1280); same(10*sum(P9[1:]), 12800)
same((12500 + 12800)/Integer(2), 12650); rounds(Rational(12650, 60), '210.8'); rounds(Rational(12650, 3600), '3.51')
holds(P9[3] == max(P9))
```
:::
::::

:::: exercise 通过归纳法和裂项相消法求和 {#ex-9-10} ★★★
- (a) 用归纳法证明公式 $\sum_{i=1}^{n} i^2 = \dfrac{n(n + 1)(2n + 1)}{6}$。
- (b) 证明 $i(i + 1)(i + 2) - (i - 1)i(i + 1) = 3i(i + 1)$，并用它来证明
  $$\sum_{i=1}^{n} i(i + 1) = \frac{n(n + 1)(n + 2)}{3}.$$
- (c) 利用 (b) 和公式 $\sum i$ 给出公式 $\sum i^2$ 的第三个证明。

::: solution
**(a)** *基本情况.* 对于 $n = 1$ 两边都是 1: $\tfrac{1 \cdot 2 \cdot 3}{6} = 1$.

*归纳步骤.* 假设公式对某个 $k \ge 1$ 成立。加上下一个项并提取公共因子 $k + 1$,

$$\begin{aligned} &\sum_{i=1}^{k+1} i^2 \\[5pt] &= \frac{k(k + 1)(2k + 1)}{6} + (k + 1)^2 \\[5pt] &= \frac{k + 1}{6}\big[k(2k + 1) + 6(k + 1)\big] \\[5pt] &= \frac{k + 1}{6}\big(2k^2 + 7k + 6\big) \\[5pt] &= \frac{(k + 1)(k + 2)(2k + 3)}{6}. \end{aligned}$$

这是公式对 $n = k + 1$ 的形式，因为 $2(k + 1) + 1 = 2k + 3$。通过归纳，公式对每个 $n \ge 1$ 都成立。

**(b)** 左边两个乘积都包含因子 $i(i + 1)$:

$$\begin{aligned} &i(i + 1)(i + 2) - (i - 1)i(i + 1) \\ &\quad= i(i + 1)\big[(i + 2) - (i - 1)\big] \\ &\quad= 3i(i + 1). \end{aligned}$$

将此相加于 $i = 1, \dots, n$。左边的表达式展开：每个 $i$ 的 $i(i + 1)(i + 2)$ 项抵消 $i' = i + 1$ 的 $-(i' - 1)i'(i' + 1)$ 项，这两个项是相同的乘积，因此只剩下最后一个正项和第一个负项：

$$\begin{aligned} &\sum_{i=1}^{n}\big[i(i + 1)(i + 2) \\[5pt] &\qquad - (i - 1)i(i + 1)\big] \\[5pt] &\quad= n(n + 1)(n + 2) - 0 \cdot 1 \cdot 2. \end{aligned}$$

所以 $3\sum_{i=1}^{n} i(i + 1) = n(n + 1)(n + 2)$，即公式。

**(c)** 由于 $i^2 = i(i + 1) - i$，求和规则使得平方和等于 (b) 中的和减去 $\sum_{i=1}^{n} i$。因此，由 (b) 和定理 9.2，

$$\begin{aligned} &\sum_{i=1}^{n} i^2 \\[5pt] &\quad= \frac{n(n + 1)(n + 2)}{3} \\[5pt] &\qquad - \frac{n(n + 1)}{2} \\[5pt] &\quad= \frac{n(n + 1)\big[2(n + 2) - 3\big]}{6} \\[5pt] &\quad= \frac{n(n + 1)(2n + 1)}{6}. \end{aligned}$$

```check
same(S2.subs(n, 1), 1)
steps(k*(k + 1)*(2*k + 1)/6 + (k + 1)**2, (k + 1)/6*(k*(2*k + 1) + 6*(k + 1)), (k + 1)/6*(2*k**2 + 7*k + 6), (k + 1)*(k + 2)*(2*k + 3)/6, S2.subs(n, k + 1))
same(expand(k*(2*k + 1) + 6*(k + 1)), 2*k**2 + 7*k + 6); same(factor(2*k**2 + 7*k + 6), (k + 2)*(2*k + 3))
steps(i*(i + 1)*(i + 2) - (i - 1)*i*(i + 1), i*(i + 1)*((i + 2) - (i - 1)), 3*i*(i + 1))
same(summation(i*(i + 1)*(i + 2) - (i - 1)*i*(i + 1), (i, 1, n)), n*(n + 1)*(n + 2))
same(summation(i*(i + 1), (i, 1, n)), n*(n + 1)*(n + 2)/3)
same(i*(i + 1) - i, i**2); same(summation(i**2, (i, 1, n)), summation(i*(i + 1), (i, 1, n)) - summation(i, (i, 1, n)))
steps(n*(n + 1)*(n + 2)/3 - n*(n + 1)/2, n*(n + 1)*(2*(n + 2) - 3)/6, S2)
```
:::
::::

:::: exercise $e^x$ 的积分 {#ex-9-11} ★★★
- (a) 证明，对于每个数 $r \ne 1$ 和整数 $n \ge 1$，
  $$\sum_{i=0}^{n-1} r^i = \frac{r^n - 1}{r - 1}.$$
  (将和乘以 $r - 1$。)
- (b) 证明 $e^x$ 在 $[0, 1]$ 上以 $n$ 个子区间计算的左黎和是
  $$L_n = (e - 1)\,\frac{1/n}{e^{1/n} - 1}.$$
- (c) 使用 $\lim_{h\to0} \dfrac{e^h - 1}{h} = 1$ 来证明 $\displaystyle\int_0^1 e^x\,dx = e - 1 \approx 1.718$。为什么这个极限是 1？

::: solution
**(a)** 展开： $(r - 1)\big(1 + r + \dots + r^{n-1}\big) = \big(r + r^2 + \dots + r^n\big) - \big(1 + r + \dots + r^{n-1}\big)$。每个从 $r$ 到 $r^{n-1}$ 的幂都出现一次，且符号相反，相互抵消：差值形成裂项相消求和，结果为 $r^n - 1$。由于 $r \ne 1$，除以 $r - 1$。

**(b)** 此时 $\Delta x = \tfrac1n$，且左端点为 $x_i = \tfrac{i}{n}$ 对于 $i = 0, \dots, n - 1$，因此

$$\begin{aligned} L_n &= \sum_{i=0}^{n-1} e^{i/n}\cdot\frac1n \\[5pt] &= \frac1n\sum_{i=0}^{n-1}\big(e^{1/n}\big)^i. \end{aligned}$$

这是 (a) 中的和乘以 $r = e^{1/n}$，其不等于 1，因为 $\tfrac1n \ne 0$，且 $r^n = e$。因此 $L_n = \tfrac1n \cdot \tfrac{e - 1}{e^{1/n} - 1}$，即公式。

**(c)** 令 $h = \tfrac1n$。则

$$\begin{aligned} \frac{1/n}{e^{1/n} - 1} &= \frac{h}{e^h - 1} \\[5pt] &= \frac{1}{(e^h - 1)/h}. \end{aligned}$$

当 $n \to \infty$ 时， $h \to 0^+$，且 $\tfrac{e^h - 1}{h} = \tfrac{e^{0+h} - e^0}{h}$ 是 $e^x$ 在 0 处的差商。其极限是 $e^x$ 在 0 处的导数，即 $e^0 = 1$（模块 6）。因此 $L_n \to (e - 1) \cdot \tfrac11 = e - 1$。由于 $e^x$ 连续，因此可积，根据定理 9.4

$$\begin{aligned} \int_0^1 e^x\,dx &= \lim_{n\to\infty} L_n \\[5pt] &= e - 1 \approx 1.718. \end{aligned}$$

```check
rr9 = symbols('r')
for N_ in range(1, 7):
    same(expand((rr9 - 1)*sum(rr9**j for j in range(N_))), rr9**N_ - 1)
same(summation(rr9**i, (i, 0, n - 1)), Piecewise((n, Eq(rr9, 1)), ((rr9**n - 1)/(rr9 - 1), True)))
Ln11 = (E - 1)*(1/n)/(exp(1/n) - 1)
for N_ in (1, 3, 10):
    same(sum(exp(Rational(j, N_)) for j in range(N_))/N_, Ln11.subs(n, N_))
limit_is((exp(h) - 1)/h, h, 0, 1); same(diff(exp(x), x).subs(x, 0), 1)
same(limit(Ln11, n, oo), E - 1); same(integrate(exp(x), (x, 0, 1)), E - 1); rounds(E - 1, '1.718')
```
:::
::::

:::: exercise 零积分 {#ex-9-12} ★★★
设$f$在$[a, b]$上连续，其中$a < b$，且对$[a, b]$中的每个$x$，$f(x) \ge 0$成立。

- (a) 证明：如果 $f(c) > 0$ 在某个 $c$ ∈ $[a, b]$ 处成立，则 $\int_a^b f(x)\,dx > 0$。 (提示：由连续性，对于足够接近 $c$ 的 $x$ ∈ $[a, b]$，有 $f(x) > \tfrac{f(c)}{2}$。)
- (b) 推出：如果 $\int_a^b f(x)\,dx = 0$，则 $f(x) = 0$ 对于每一个 $x$ ∈ $[a, b]$ 都成立。
- (c) 说明在没有连续性的前提下 (b) 不成立：找出一个定义在 $[0, 1]$ 上、可积的函数 $g \ge 0$，满足 $\int_0^1 g(x)\,dx = 0$，但并非处处为零。

::: solution
**(a)** 设 $\varepsilon = \tfrac{f(c)}{2} > 0$。由于 $f$ 在 $c$ 处连续，存在一个 $\delta > 0$，使得 $\abs{f(x) - f(c)} < \tfrac{f(c)}{2}$，因此 $f(x) > \tfrac{f(c)}{2}$，对于每一个 $x$ ∈ $[a, b]$ 且 $\abs{x - c} < \delta$。令 $p = \max\big(a, c - \tfrac{\delta}{2}\big)$ 和 $q = \min\big(b, c + \tfrac{\delta}{2}\big)$。则 $p < q$（因为 $a < b$ 和 $\delta > 0$）， $[p, q]$ 位于 $[a, b]$ 中，并且 $f(x) > \tfrac{f(c)}{2}$ 在 $[p, q]$ 上。由可加性，

$$\int_a^b f = \int_a^p f + \int_p^q f + \int_q^b f.$$

第一个和最后一个积分至少为 0，根据定理 9.7(a)，因为 $f \ge 0$（或为 0，如果 $p = a$ 或 $q = b$）。中间的那个至少为 $\tfrac{f(c)}{2}(q - p) > 0$，根据定理 9.7(c)。所以 $\int_a^b f > 0$。

**(b)** 假设 $\int_a^b f = 0$。如果 $f$ 在 $[a, b]$ 上不是处处为 0，那么存在一个 $c$ 使得 $f(c) > 0$，由于 $f \ge 0$，并且 (a) 会给出 $\int_a^b f > 0$，不是 0。因此 $f(x) = 0$ 对于 $x$ 中的每个点 $[a, b]$。

**(c)** 设 $g(\tfrac12) = 1$ 且 $g(x) = 0$ 对于 $x$ 中的每个其他点 $[0, 1]$。它是有界的，且只有一个间断点，因此是可积的（定理 9.3）。在黎曼和中，只有包含 $\tfrac12$ 的子区间（最多两个）可能有样本点使得 $g$ 不为 0，且每个子区间的宽度至多为 $\norm{P}$。因此每个黎曼和都在 0 和 $2\norm{P}$ 之间，且和趋于 0： $\int_0^1 g(x)\,dx = 0$，尽管 $g(\tfrac12) = 1$。

```check
fc_ = symbols('fc', positive=True)                 # fc stands for f(c) > 0
same(fc_ - fc_/2, fc_/2)                           # |f(x) - f(c)| < f(c)/2 gives f(x) > f(c)/2
dl = symbols('delta', positive=True)
for (a_, b_, c_) in ((0, 3, 0), (0, 3, 3), (0, 3, Rational(5, 2))):   # p < q whether c is an end or not
    holds(Min(b_, c_ + dl/2).subs(dl, Rational(1, 10)) > Max(a_, c_ - dl/2).subs(dl, Rational(1, 10)))
gj = Piecewise((1, Eq(x, Rational(1, 2))), (0, True)); same(integrate(gj, (x, 0, 1)), 0)
for N_ in (2, 4, 10):                              # 1/2 is a cut point; sample points at 1/2 on both sides give the largest sum
    same(2*gj.subs(x, Rational(1, 2))*Rational(1, N_), 2*Rational(1, N_))
same(limit(2/n, n, oo), 0)
```
:::
::::

## 自测 {#quiz}

```quiz
? $\displaystyle\sum_{i=1}^{4} i^2$等于
- [ ] $100$
- [x] $30$
- [ ] $16$
- [ ] $10$
> $1 + 4 + 9 + 16 = 30$. 100 是 $(1 + 2 + 3 + 4)^2$，即和的平方而非平方和；16 是最后一个项单独；10 是 $\sum i$，不包含平方项。

? $R_3$ 在 $f(x) = x$ 上 $[0, 3]$ 的右和为
- [x] $6$
- [ ] $4.5$
- [ ] $3$
- [ ] $9$
> $\Delta x = 1$，且右端点为 1, 2 和 3，因此 $R_3 = 1 + 2 + 3 = 6$。4.5 是精确积分，即底为 3、高为 3 的三角形面积： $R_3$ 由于 $x$ 增加而高估；3 是左和 $0 + 1 + 2$。9 是高度为 $f(3)$ 的一个矩形在整个区间上的面积。

? 若 $f$ 在 $[a, b]$ 上连续且递减，则对于每个 $n$
- [ ] $L_n \le \int_a^b f(x)\,dx \le R_n$
- [ ] $L_n = R_n$
- [ ] $M_n \le L_n \le R_n$
- [x] $R_n \le \int_a^b f(x)\,dx \le L_n$
> 在每个子区间上，递减函数在左端点最大，在右端点最小，因此左矩形在图上方，右矩形在图下方。 $L_n \le \int \le R_n$ 对于递增函数也成立。 $L_n = R_n$ 仅当 $f(a) = f(b)$，因为 $L_n - R_n = \big(f(a) - f(b)\big)\Delta x$ 此处为正。出于相同原因 $L_n > R_n$，因此 $M_n \le L_n \le R_n$ 为假。

? $\displaystyle\int_{-2}^{2} x^3\,dx$等于
- [ ] $8$
- [ ] $4$
- [x] $0$
- [ ] $16$
> $x^3$ 是奇函数，且 $[-2, 2]$ 关于 0 对称，因此 $[-2, 0]$ 下方轴的面积与 $[0, 2]$ 上方的面积相互抵消。8 是 $2\int_0^2 x^3\,dx$，偶函数的规则；4 是 $\int_0^2 x^3\,dx$，仅右半部分；16 是 $2^4$。

? $\displaystyle\int_0^3 (x - 1)\,dx$等于
- [x] $\dfrac32$
- [ ] $\dfrac52$
- [ ] $2$
- [ ] $-\dfrac12$
> 在$[0, 1]$处直线位于轴下方，形成一个面积为$\tfrac12$的三角形，在$[1, 3]$处位于轴上方，形成一个面积为2的三角形；积分是带符号面积$2 - \tfrac12 = \tfrac32$。$\tfrac52$将两个面积相加，得到总面积而非积分；2仅计算轴上方的部分，而$-\tfrac12$仅计算轴下方的部分。

? 若 $\int_0^4 f(x)\,dx = 7$ 和 $\int_0^1 f(x)\,dx = 2$，则 $\int_1^4 f(x)\,dx$ 等于
- [ ] $9$
- [ ] $-5$
- [ ] $\dfrac{21}{4}$
- [x] $5$
> 由可加性，$\int_0^1 f + \int_1^4 f = \int_0^4 f$，因此$\int_1^4 f = 7 - 2 = 5$。9改为加法而非减法；$-5$是$\int_4^1 f$，且积分限颠倒；$\tfrac{21}{4}$假设积分与区间长度成正比，这对常数$f$成立，但一般情况不成立。

? $f(x) = 2x$ 在 $[0, 3]$ 上的平均值是
- [ ] $9$
- [x] $3$
- [ ] $6$
- [ ] $\dfrac32$
> $\int_0^3 2x\,dx$ 是底为 3、高为 6 的三角形的面积，即 9，以及 $f_{\text{avg}} = \tfrac93 = 3$。9 是积分值，尚未除以区间长度；6 是最大值，即 $f(3)$；$\tfrac32$ 是区间的中点，即 $f$ 取其平均值的点，而非值本身。

? 下列函数中，哪一个在 $[0, 2]$ 上可积？
- [ ] $f(x) = \dfrac{1}{x}$ 对于 $0 < x \le 2$，带 $f(0) = 0$
- [ ] $f(x) = 1$ 对于有理数 $x$ 和 $f(x) = 0$ 对于无理数 $x$
- [x] $f(x) = 1$ 对于 $x < 1$ 和 $f(x) = 3$ 对于 $x \ge 1$
- [ ] $f(x) = \dfrac{1}{x - 1}$ 对于 $x \ne 1$，带 $f(1) = 0$
> 第三个函数是有界的，并在 1 处有一个跳跃间断点，因此它是可积的（定理 9.3）；其积分值为 $1 + 3 = 4$。第一个和最后一个函数在 0 和 1 附近无界，而可积函数必须是有界的。第二个函数在所有点都不连续：其黎曼和可以是 2 或 0，无论分划多么细（深入一步，第 9.4 节）。
```

```check
same(summation(i**2, (i, 1, 4)), 30); same(summation(i, (i, 1, 4))**2, 100); same(summation(i, (i, 1, 4)), 10)
same(Rsum(x9, 0, 3, 3), 6); same(Lsum(x9, 0, 3, 3), 3); same(integrate(x, (x, 0, 3)), Rational(9, 2)); same(3*3, 9)
same(integrate(x**3, (x, -2, 2)), 0); same(2*integrate(x**3, (x, 0, 2)), 8); same(integrate(x**3, (x, 0, 2)), 4)
same(integrate(x - 1, (x, 0, 3)), Rational(3, 2)); same(integrate(Abs(x - 1), (x, 0, 3)), Rational(5, 2))
same(7 - 2, 5); same(7*Rational(3, 4), Rational(21, 4))
same(integrate(2*x, (x, 0, 3))/3, 3); same(integrate(2*x, (x, 0, 3)), 9)
same(integrate(Piecewise((1, x < 1), (3, True)), (x, 0, 2)), 4)
same(Lsum(x9**2 + 1, 0, 2, 4) - Rsum(x9**2 + 1, 0, 2, 4), ((x9**2 + 1).subs(x9, 0) - (x9**2 + 1).subs(x9, 2))*Rational(1, 2))
```
