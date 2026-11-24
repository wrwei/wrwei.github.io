---
title: 函数与变化
part: 1
lead: 先了解微积分研究什么，再认识它的基本对象——函数，以及几类常用函数。你将计算越来越短的时间段内的平均速度，为学习导数做准备，也可以配置 Python 来检验计算。
minutes: 240
needs: 中学代数（分数、幂、方程、直线的图像）
goals:
  - 解释微积分的两个核心问题：变化率和累积
  - 找到函数的定义域和值域，并用区间符号写出它们
  - 识别并绘制标准函数，包括指数函数、对数函数和弧度制的三角函数
  - 变换、复合和反函数，并预测对图形的影响
  - 计算平均变化率并简化差商
  - 使用SymPy、NumPy和matplotlib设置Python，并使用它们来检查你的工作
---

## 微积分研究什么 {#about}

微积分是关于变化的数学。每当一个量发生变化（汽车的位置、一杯茶的温度、机器学习模型在训练过程中的误差），微积分都会对它提出两个问题：

1. **它在这一刻变化得有多快？**答案是一个**变化率**。
2. **在一段时间内，当变化率本身持续变化时，累积了多少**？答案是**累积量**。

::: analogy
汽车的仪表盘回答了这两个问题。速度计显示当前距离变化的快慢；里程表显示累积的距离总量。将速度计的读数随时间累加，即可得到里程表的读数；询问里程表读数的增长速率，即可得到速度计的读数。微积分将这两个过程分别称为**积分**和**微分**，其核心定理——微积分基本定理（模块10）——指出，这两个过程互为逆运算。
:::

### 切线问题与面积问题 {#two-problems}

这两个问题转化为关于图形的两个问题（图1.1）。

**切线问题。**直线只有一个斜率，但曲线在某些地方比另一些地方更陡峭。曲线在点 $P$ 处的斜率是多少？画出通过 $P$ 和曲线上的另一点 $Q$ 的直线，即一条**割线**；其斜率易于计算。现在让 $Q$ 沿曲线向 $P$ 滑动。割线收敛于一条直线，即 $P$ 处的**切线**，其斜率即为曲线在 $P$ 处的斜率。在距离对时间的图像上，该斜率即为该时刻的速度。

**面积问题。** 曲线在 $x = a$ 和 $x = b$ 之间的下方区域面积是多少？用细长的矩形填充该区域：它们的总面积易于计算且接近所需面积。矩形越细，贴合得越好，而面积即为它们总和所趋近的那个数值。在速度对时间的图像上，该面积即为行驶的距离。

::: figure id=fig-01-1
微积分的两个问题。左图：当 $Q$ 沿曲线向 $P$ 滑动时，通过 $P$ 和 $Q$ 的割线趋近于 $P$ 处的切线。右图：当曲线在 $a$ 和 $b$ 之间的下方矩形变细时，它们的总面积趋近于曲线下的面积。
:::

这两个问题都通过同一个新思想解决：逐步改进近似值（割线的斜率、矩形的总面积），并询问这些近似值趋近于哪个数。这个数是**极限**，即模块2的主题。切线的斜率是**导数**（该系列的第二部分）；面积是**积分**（第三部分）。

### 简短的历史 {#history}

面积问题由来已久。公元前3世纪的阿基米德使用穷竭法求出了面积和体积，用更简单的形状来近似一个区域，这些形状越来越完全地填充该区域：这是图1.1中矩形的祖先。

作为一种通用方法的微积分在17世纪出现，由两位独立工作的人提出。牛顿在1665–1666年发展了他所称的流数法，但发表较晚。莱布尼茨在1684年发表了微分积分学的第一份报告，在1686年发表了积分积分学；他的符号，带有$dx$和$\int$，是今天使用的符号。随后发生的优先权争议非常激烈。后来，1820年代的柯西和1860年代及1870年代的魏尔斯特拉斯为微积分奠定了严格的基础，即模块2介绍的极限的ε–δ定义，黎曼在1854年定义了他名字的积分（发表于1868年）。

### 微积分的应用 {#uses}

在科学中，速度是位置的变化率，加速度是速度的变化率，因此运动定律，如冷却和放射性衰变的定律，都是关于变化率的陈述：微分方程（模块13）。在工程中，电流是电荷的变化率，梁、控制系统和信号滤波器则用导数和积分来描述。在计算领域，机器学习通过**梯度下降**训练模型，反复调整其参数以沿使误差减小最快的方向进行，该方向由导数计算得出（模块8和17）；反向传播用于计算神经网络中的这些导数，其本质是链式法则（模块5和17）。

所有这些量都是其他某个量的函数，因此本模块研究函数（第1.3节至第1.5节），然后迈出导数概念的第一步（第1.6节）。

## 怎样使用本教程 {#how-it-works}

每个概念的呈现顺序相同：一张图片或一张数字表、一个精确定义、已解决的示例，以及学习者常犯的错误。主要定理均经过证明；更难的证明和扩展内容位于**深入一步**方框中，初次阅读时可跳过。

页面使用以下方框：

| 方框 | 其包含内容 |
|---|---|
| **定义**、**定理**、**示例** | 一个新术语、一个精确陈述、一个已解决的示例 |
| **证明** | 定理为何成立；以 ∎ 结尾 |
| **核心思想**，**提示**，**扩展知识** | 需要记住的要点、实用建议、旁注 |
| **注意** | 常见错误、错误原因及修正方法 |
| **可以这样理解** | 类比 |
| **深入一步** | 选学内容，难度较高 |
| **试一试** | 用于实验的交互式图表 |
| **动手计算** | 可选的 Python 代码 |

方框、章节和图表按模块编号：定义 1.2 是模块 1 中的第二个定义，图 1.3 是其第三个图。

**已检验标记。** 带有 ✓ 已检验标记的工作示例和习题解答，其结果及推导步骤均使用 SymPy（一种计算机代数系统）进行了验证。数值表由公式计算得出，图形通过绘制其所展示的函数生成。

**习题与测验。**每个模块以总结、10 至 12 道习题和 8 道测验题结束。习题分为三个层级：★ 检验理解，★★ 应用，★★★ 拓展（证明、较难问题或应用）。每道习题在** 查看解答** 下均提供完整的工作解答：请先尝试解答习题。

**所需物品。** 纸、铅笔和科学计算器（设置为弧度制，第 1.4 节解释了原因）。Python 为可选：[第 1.7 节](#python) 展示了如何安装它，且“动手计算”框中的所有内容均为代码打印的输出。即使不使用 Python，本系列的其他部分也易于理解。

如果你的代数知识有所生疏，请先学习 [可选代数复习](../math/module_00_ZH.html) 计算机科学与人工智能的数学基础。该系列还包含旨在计算的简明微积分模块，从 [其第 15 模块](../math/module_15_ZH.html) 开始；本系列为完整课程。

::: tip
边读边用铅笔。当示例展示某一步骤时，请在继续阅读前自行完成该步骤；当提示“展开并合并”时，请执行展开操作。
:::

## 函数 {#functions}

从静止状态释放一个小球。在地球表面附近，如果空气阻力可以忽略不计，那么经过 $t$ 秒后它下落的距离是

$$s(t) = 4.9t^2 \text{ metres}.$$

（4.9 是 $g \approx 9.8$ m/s²，即重力加速度，的一半。）以下是每隔半秒的距离：

```valuetable
t = 0, 0.5, 1, 1.5, 2, 2.5, 3
$s(t)$ = 49*t**2/10
layout = columns
---
t | s(t)
0 | 0
0.5 | 1.225
1 | 4.9
1.5 | 11.025
2 | 19.6
2.5 | 30.625
3 | 44.1
```

```check
rounds(Rational(980665, 100000), '9.8')      # standard gravity is 9.80665 m/s^2
same(Rational(49, 10), Rational(98, 10)/2)   # 4.9 is half of 9.8
```

每个 $t$ 都恰好对应一个距离 $s(t)$。这正是使 $s$ 成为函数的原因。

::: definition 函数
一个 **函数**$f$ 是一个规则，它为集合 $D$ 中的每个数 $x$ 分配恰好一个数 $f(x)$。集合 $D$ 是 $f$ 的**定义域**。数 $f(x)$，读作“f of x”，是 $f$ 在 $x$ 处的**值**。当 $x$ 遍历定义域时，所有值 $f(x)$ 的集合是 $f$ 的**值域**。
:::

输入 $x$ 是 **自变量**，输出 $y = f(x)$ 是 **因变量**。在本系列的第 I 至 IV 部分中，输入和输出均为实数，仅在模块 15 中涉及复数；所有实数的集合记为 $\R$。若 $x$ 属于集合 $D$，记作 $x \in D$，读作“x 属于 D”。

“恰好一个”是定义的核心。规则“平方等于 $x$ 的数”不是函数：对于 $x = 9$，它给出两个数，3 和 $-3$。然而，函数可能对不同的输入给出相同的输出：$x^2$ 对 $x = 2$ 和 $x = -2$ 均给出 4。

### 区间 {#intervals}

定义域和值域通常是区间：两个端点之间的所有实数。

::: definition 区间
对于实数 $a < b$：

| 区间 | 满足以下条件的数 $x$： |
|---|---|
| $[a, b]$ | $a \le x \le b$ |
| $(a, b)$ | $a < x < b$ |
| $[a, b)$ | $a \le x < b$ |
| $(a, b]$ | $a < x \le b$ |
| $[a, \infty)$ | $x \ge a$ |
| $(a, \infty)$ | $x > a$ |
| $(-\infty, b]$ | $x \le b$ |
| $(-\infty, b)$ | $x < b$ |
| $(-\infty, \infty)$ | 每个实数 $x$：即 $\R$ |

方括号表示端点属于该区间；圆括号表示端点不属于该区间。
:::

$[a, b]$是**闭区间**，读作“从a到b的闭区间”；$(a, b)$是**开区间**。符号$\infty$读作“无穷大”，不是一个数：$[a, \infty)$是“所有$x \ge a$”的简写，因此$\infty$旁边的括号总是圆括号。要合并区间，使用$\cup$，读作“并集”：$(-\infty, 2) \cup (2, \infty)$是任一区间中的数的集合，即除了2以外的所有实数。

::: pitfall
将$[3, \infty)$写作“$x > 3$”。3不包含在内，因此其括号必须是圆括号：$(3, \infty)$。且永远不要写$[3, \infty]$：$\infty$不是一个数，因此它不能属于任何区间。
:::

### 公式的定义域 {#domains}

当函数由公式给出且未提及定义域时，约定如下：

::: keyidea
公式的定义域是使公式给出实数的所有实数的集合。要找到它，寻找可能出错的地方：到目前为止，**除以零**和**负数的平方根**（更一般地，任何偶次根）。第1.4节增加了第三种情况：**对数**，其参数不是正数。
:::

模型的定义域可以比其公式的定义域更小。$s(t) = 4.9t^2$ 对每个实数 $t$ 都有定义，但作为下落小球的描述，它仅适用于从 $t = 0$（小球被释放时）到小球落地这一时间段。

::: example 公式的定义域
求每个函数的定义域，使用区间表示法。

- (a) $f(x) = \dfrac{1}{x - 2}$
- (b) $g(x) = \sqrt{3 - x}$
- (c) $h(x) = \dfrac{\sqrt{x}}{x - 1}$

**(a)** 唯一的危险是除以零，这发生在 $x - 2 = 0$ 时，即在 $x = 2$ 处。其他所有数字均被允许：定义域为 $(-\infty, 2) \cup (2, \infty)$。

**(b)** 平方根需要 $3 - x \ge 0$，即 $x \le 3$（两边同时加上 $x$）。定义域为 $(-\infty, 3]$。包含 3，因为 $\sqrt{0} = 0$。

**(c)** 两个条件：$\sqrt{x}$ 需要 $x \ge 0$，且分母需要 $x \ne 1$。两者必须同时成立，因此定义域为 $[0, 1) \cup (1, \infty)$。

```check
from sympy.calculus.util import continuous_domain, function_range
R = S.Reals
same(solve(x - 2, x), [2])
same(continuous_domain(1/(x - 2), x, R), Union(Interval.open(-oo, 2), Interval.open(2, oo)))
same(solve_univariate_inequality(3 - x >= 0, x, relational=False), Interval(-oo, 3))
same(continuous_domain(sqrt(3 - x), x, R), Interval(-oo, 3))
same(continuous_domain(sqrt(x)/(x - 1), x, R), Union(Interval.Ropen(0, 1), Interval.open(1, oo)))
```
:::

求值域需要更多工作，因为你必须找出哪些输出值实际上会出现。这需要两个论证：你声称的集合中的每个值都落在该集合中，且该集合中的每个数字都是一个函数值。

::: example 半圆的定义域和值域
求 $f(x) = \sqrt{4 - x^2}$ 的定义域和值域。

**定义域。** 平方根需要 $4 - x^2 \ge 0$，即 $x^2 \le 4$，这恰好当 $-2 \le x \le 2$ 时成立。定义域为 $[-2, 2]$。

**值域。** 对于 $x$ 中的 $[-2, 2]$，$x^2$ 介于 0 和 4 之间，因此 $4 - x^2$ 介于 0 和 4 之间，其平方根介于 $\sqrt0 = 0$ 和 $\sqrt4 = 2$ 之间。所以每个值都在 $[0, 2]$ 中。反之，$[0, 2]$ 中的每个 $y$ 都是一个值。要找到给出该值的输入，对 $y = \sqrt{4 - x^2}$ 关于 $x$ 求解：平方后得到 $y^2 = 4 - x^2$，因此尝试 $x = \sqrt{4 - y^2}$。该 $x$ 位于 $[0, 2]$ 中，且由于 $y \ge 0$，

$$f(x) = \sqrt{4 - (4 - y^2)} = \sqrt{y^2} = y.$$

值域是 $[0, 2]$。对 $y = \sqrt{4 - x^2}$ 平方得到 $x^2 + y^2 = 4$，其中 $y \ge 0$。根据勾股定理，$x^2 + y^2$ 是从 $(x, y)$ 到原点的距离的平方，因此满足 $x^2 + y^2 = 4$ 的点构成以原点为中心、半径为 2 的圆，而图像是其上半部分。图 1.2 显示了其定义域和值域。

```check
same(solve_univariate_inequality(x**2 <= 4, x, relational=False), Interval(-2, 2))
same(continuous_domain(sqrt(4 - x**2), x, R), Interval(-2, 2))
same(function_range(sqrt(4 - x**2), x, Interval(-2, 2)), Interval(0, 2))
same_set(solve(Eq(y**2, 4 - x**2), x), [sqrt(4 - y**2), -sqrt(4 - y**2)])   # y^2 = 4 - x^2 solved for x
same(function_range(sqrt(4 - y**2), y, Interval(0, 2)), Interval(0, 2))   # x = sqrt(4 - y^2) is in [0, 2]
yn = symbols('y', nonnegative=True)
steps(sqrt(4 - (4 - yn**2)), sqrt(yn**2), yn)
same(sqrt(4 - x**2)**2 + x**2, 4)
```
:::

### 图像 {#graphs}

::: definition 图像
函数 $f$ 的 **图像** 是坐标平面中所有满足 $x$ 在 $f$ 的定义域内的点 $(x, f(x))$ 的集合。它是方程为 $y = f(x)$ 的曲线。
:::

要从图中读取 $f(a)$ 的值，请在水平轴上找到 $x = a$，然后向上或向下移动到图像：$f(a)$ 即为该处的高度。定义域是图像有对应点的 $x$ 的集合，即其在 $x$ 轴上的投影；值域是其在 $y$ 轴上的投影。

**垂直线测试。** 平面上的曲线是 $x$ 的函数的图像，当且仅当没有垂直线与它相交超过一次：直线 $x = a$ 与 $f$ 的图像仅在 $(a, f(a))$ 处相交，前提是 $a$ 在定义域内，否则不相交；若有第二个交点，则会使 $a$ 有两个值。整个圆 $x^2 + y^2 = 4$ 未通过测试：直线 $x = 1$ 在 $(1, \sqrt3)$ 和 $(1, -\sqrt3)$ 处与它相交。其上半部分通过测试：它是例 1.2 中函数的图像。

```check
same_set(solve(Eq(1 + y**2, 4), y), [sqrt(3), -sqrt(3)])
```

::: figure id=fig-01-2
左图：例 1.2 中 $y = \sqrt{4 - x^2}$ 的图像。其在 $x$ 轴上的投影（橙色）是定义域 $[-2, 2]$；其在 $y$ 轴上的投影（绿色）是值域 $[0, 2]$。右图：例 1.3 中的分段函数。$(1, 2)$ 处的实心点位于图像上；$(1, 1)$ 处的空心点不在图像上。
:::

### 分段函数 {#piecewise}

**分段**函数在定义域的不同部分使用不同的公式。最重要的例子是**绝对值**函数，记作 $\abs{x}$，读作「x 的绝对值」：

$$\abs{x} = \begin{cases} x & \text{if } x \ge 0, \\ -x & \text{if } x < 0. \end{cases}$$

它使每个数非负：$\abs{5} = 5$ 和 $\abs{-3} = -(-3) = 3$。几何上，$\abs{x}$ 是数轴上 $x$ 到 0 的距离，而 $\abs{a - b}$ 是 $a$ 和 $b$ 之间的距离；$\abs{x}$ 的图像是一个顶点在原点的V形。神经网络使用另一种分段函数，即**修正线性单元**：

$$\operatorname{ReLU}(x) = \begin{cases} 0 & \text{if } x < 0, \\ x & \text{if } x \ge 0. \end{cases}$$

它与 $\max(0, x)$ 相同，即 0 和 $x$ 中的较大者。

```check
same(Abs(5), 5); same(Abs(-3), 3); same(-(-3), 3)
xr = symbols('x', real=True)
relu = Piecewise((0, xr < 0), (xr, True))
xneg, xnn = symbols('x', negative=True), symbols('x', nonnegative=True)
same(relu.subs(xr, xneg), Max(0, xneg)); same(relu.subs(xr, xnn), Max(0, xnn))   # ReLU = max(0, x) on both pieces
```

::: example 分段函数
设

$$f(x) = \begin{cases} x^2 & \text{if } x < 1, \\ 3 - x & \text{if } x \ge 1. \end{cases}$$

求 $f(-1)$、$f(0.5)$、$f(1)$ 和 $f(2)$，并绘制图像。

对于每个输入，首先确定适用哪一段，然后使用该段的公式。

- $-1 < 1$，因此 $f(-1) = (-1)^2 = 1$。
- $0.5 < 1$，因此 $f(0.5) = 0.5^2 = 0.25$。
- $1 \ge 1$，因此 $f(1) = 3 - 1 = 2$。边界点属于包含它的条件的那一段，这里是第二段。
- $2 \ge 1$，因此 $f(2) = 3 - 2 = 1$。

图（图1.2，右）是抛物线 $y = x^2$ 在 $x = 1$ 左侧的部分，以及从 $x = 1$ 开始的直线 $y = 3 - x$。抛物线趋向于点 $(1, 1)$，但 $x = 1$ 不在其分段中，因此空心点标记了缺口；实心点位于 $(1, 2)$，显示了值 $f(1) = 2$。图在 $x = 1$ 处发生跳跃。

```check
fpw = Piecewise((x**2, x < 1), (3 - x, True))
same([fpw.subs(x, v) for v in (-1, Rational(1, 2), 1, 2)], [1, Rational(1, 4), 2, 1])
same((x**2).subs(x, 1), 1)      # where the first piece heads: the hollow dot (1, 1)
```
:::

::: deeper 函数的精确定义
定义1.1提及“规则”，但仅输入与输出的配对至关重要。因此，数学家将函数定义为其图：一个有序对 $(x, y)$ 的集合 $f$，其中域中的每个 $x$ 恰好出现一次，$f(x) = y$ 表示 $(x, y)$ 属于 $f$。那么 $(x + 1)^2$ 和 $x^2 + 2x + 1$ 定义相同的函数。人们也写作 $f\colon D \to \R$，读作“f 将 D 映射到 R”。

程序中的函数可以读取时钟，或读取其他代码更改的变量，因此相同的输入可能产生不同的输出；它还可以执行除计算输出之外的其他操作，例如打印。如果函数的输出仅取决于其输入且不执行其他操作，程序员称该函数为 **纯**；数学函数是纯函数。

```check
same(expand((x + 1)**2), x**2 + 2*x + 1)
```
:::

## 常用函数 {#catalogue}

少数几族函数提供了本系列中几乎每个函数；图1.3展示了它们，且 [第1.5节](#transformations) 的函数探索器绘制了其中大多数。掌握它们的形状：识别形状可节省微积分中的大量工作。

::: figure id=fig-01-3
目录。第一行：斜率为 2 和 $-\tfrac12$ 的直线；幂函数 $x^2$ 和 $x^3$；例 1.4 中的三次函数及其零点 $-2$、0 和 3；有理函数 $1/x$。第二行：$\sqrt x$ 和 $\sqrt[3]{x}$；指数函数 $2^x$、$e^x$ 和 $(\tfrac12)^x$，均经过 $(0, 1)$；$e^x$ 及其反函数 $\ln x$，关于直线 $y = x$ 互为镜像；以及 $\tan x$，在 $\cos x = 0$ 处无定义，如在 $x = \pm\tfrac{\pi}{2}$ 处（虚线所示）。
:::

### 线性函数 {#linear}

一个 **线性函数**具有形式 $f(x) = mx + b$，其中 $m$ 和 $b$ 为常数。其图像是一条直线，在 $y$ 轴上的高度为 $b$ 处穿过该轴（**截距**），并具有 **斜率** $m$。斜率是 $y$ 每单位 $x$ 变化量的变化：对于直线上的任意两点 $(x_1, y_1)$ 和 $(x_2, y_2)$（读作“x 一，y 一”等），且 $x_1 \ne x_2$，

$$m = \frac{y_2 - y_1}{x_2 - x_1}.$$

答案不取决于你选取哪两点：$y_2 - y_1 = (mx_2 + b) - (mx_1 + b) = m(x_2 - x_1)$，且除以 $x_2 - x_1$ 后得到 $m$。

因此，线性函数在各处以相同的速率变化：$x$每增加1个单位，$y$就变化$m$。摄氏度到华氏度的转换公式$F = 1.8C + 32$就是一个例子：无论温度如何，温度升高1 °C即升高1.8 °F。对于直线，“变化率”无需微积分。微积分是将这一概念推广到曲线上的工具，曲线的陡峭程度逐点变化。

经过$(x_1, y_1)$且斜率为$m$的直线具有**点斜式方程** $y - y_1 = m(x - x_1)$。例如，经过$(1, 3)$和$(4, 9)$的直线斜率为$\tfrac{9 - 3}{4 - 1} = 2$，因此其方程为$y - 3 = 2(x - 1)$，即$y = 2x + 1$。

```check
x1, x2 = symbols('x1 x2')
same(expand((m*x2 + b) - (m*x1 + b)), m*(x2 - x1))
same(Rational(9 - 3, 4 - 1), 2); same(solve(Eq(y - 3, 2*(x - 1)), y), [2*x + 1]); same((2*x + 1).subs(x, 4), 9)
same(Rational(9, 5)*(c + 1) + 32 - (Rational(9, 5)*c + 32), Rational(18, 10))   # 1 degree C more is 1.8 degrees F more
```

### 幂函数与多项式 {#polynomials}

**幂函数**为$f(x) = x^n$。对于$n = 1, 2, 3, \dots$，它在所有实数$x$上均有定义。图1.3展示了两种基本形状：$x^2$是关于$y$轴对称的U形抛物线，而$x^3$穿过原点，关于原点对称。更高的偶次幂（$x^4, x^6, \dots$）看起来像$x^2$，更高的奇次幂看起来像$x^3$，但在0附近更平坦，在远处更陡峭。负次幂是倒数，$x^{-n} = 1/x^n$，在$x \ne 0$时有定义；分数次幂是根式（见下文）。

这两种对称性有名称。如果对于其定义域中的每一个 $x$，函数 **都是** 偶函数 $f(-x) = f(x)$，则称其为偶函数：其图像关于 $y$ 轴对称。如果满足 $f(-x) = -f(x)$，则称其为 **奇函数**：关于原点的半周旋转使其图像保持不变。$x^2$ 是偶函数，因为 $(-x)^2 = x^2$；$x^3$ 是奇函数，因为 $(-x)^3 = -x^3$。

```check
same((-x)**2, x**2); same((-x)**3, -x**3); same((-x)**4, x**4); same(x**(-3), 1/x**3)
```

::: definition 多项式
**多项式** 是形如

$$p(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_1 x + a_0,$$

的函数，其中 $n \ge 0$ 是一个整数，且 **系数** $a_0, a_1, \dots, a_n$ 是常数。如果 $a_n \ne 0$，则该多项式具有 **次数** $n$。其定义域为 $\R$。
:::

次数为 1、2 和 3 的多项式分别是线性函数、**二次函数** 和 **三次函数**。满足 $p(r) = 0$ 的数 $r$ 是 $p$ 的 **零点**（或 **根**）：其图像在 $x = r$ 处与 $x$ 轴相交。因式分解可以找到零点。

::: example 三次函数的零点
求 $p(x) = x^3 - x^2 - 6x$ 的零点。

每一项都包含 $x$，因此将其提取出来：$p(x) = x(x^2 - x - 6)$。为了对二次多项式进行因式分解，寻找两个数，其乘积为 $-6$ 且和为 $-1$：它们是 $-3$ 和 $2$。因此

$$p(x) = x(x - 3)(x + 2).$$

乘积为 0 当且仅当其因子之一为 0，因此零点为 $x = 0$、$x = 3$ 和 $x = -2$。通过展开进行验证：$x(x - 3)(x + 2) = x(x^2 - x - 6) = x^3 - x^2 - 6x$。图 1.3 中的图形在这三个点处与 $x$ 轴相交。

```check
pcub = x**3 - x**2 - 6*x
holds((-3)*2 == -6 and (-3) + 2 == -1)
same(factor(pcub), x*(x - 3)*(x + 2))
steps(x*(x - 3)*(x + 2), x*(x**2 - x - 6), pcub)
same_set(solve(pcub, x), [0, 3, -2])
```
:::

### 有理函数 {#rational}

::: definition 有理函数
**有理函数** 是两个多项式的商 $f(x) = \dfrac{p(x)}{q(x)}$，其中 $q$ 不是零多项式。其定义域是所有满足 $q(x) \ne 0$ 的 $x$ 的集合。
:::

最简单的是 $f(x) = 1/x$，其定义域为 $(-\infty, 0) \cup (0, \infty)$。其图形（图 1.3）有两个分支。在 $x = 0$ 附近，值变得巨大，右侧为正，左侧为负；远离 0 时，它们收缩趋向于 0。模块 3 研究此类行为。

::: example 具有洞的有理函数
求 $r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$ 的定义域，并简化公式。

对分子和分母进行因式分解：$x^2 - 4 = (x - 2)(x + 2)$（平方差）和 $x^2 - x - 2 = (x - 2)(x + 1)$。分母在 $x = 2$ 和 $x = -1$ 处为 0，因此定义域为 $(-\infty, -1) \cup (-1, 2) \cup (2, \infty)$。

对于定义域内的 $x$，$x - 2 \ne 0$，因此你可以将其消去：对于 $x \ne 2$ 和 $x \ne -1$，

$$r(x) = \frac{(x - 2)(x + 2)}{(x - 2)(x + 1)} = \frac{x + 2}{x + 1}.$$

条件至关重要。公式 $\dfrac{x + 2}{x + 1}$ 在 $x = 2$ 处有意义，此时它给出 $\tfrac43$，但 $r(2)$ 未定义。因此，$r$ 的图像是 $\dfrac{x + 2}{x + 1}$ 的图像缺少一个点：在 $\big(2, \tfrac43\big)$ 处有一个空洞。$r$ 在 $x = 2$ 附近的行为是极限所能回答的问题类型（模块 2）。

```check
rr = (x**2 - 4)/(x**2 - x - 2)
same(factor(x**2 - 4), (x - 2)*(x + 2)); same(factor(x**2 - x - 2), (x - 2)*(x + 1))
same_set(solve(x**2 - x - 2, x), [2, -1])
same(continuous_domain(rr, x, R), Union(Interval.open(-oo, -1), Interval.open(-1, 2), Interval.open(2, oo)))
same(cancel(rr), (x + 2)/(x + 1))
same(((x + 2)/(x + 1)).subs(x, 2), Rational(4, 3))
holds(rr.subs(x, 2) is S.NaN)      # r(2) is 0/0: not defined
```
:::

::: pitfall
消去一个因子可能会改变定义域：需连同条件一起保留，如 $r(x) = \dfrac{x + 2}{x + 1}$ 对于 $x \ne 2$ 所示。并且应消去公因子，而非项：$\dfrac{x + 2}{x + 1}$ 不等于 $\dfrac{2}{1}$。
:::

### 根 {#roots}

对于 $x \ge 0$，**平方根** $\sqrt{x}$ 是平方等于 $x$ 的非负数。因此 $\sqrt{9} = 3$，而非 $\pm 3$。方程 $x^2 = 9$ 有两个解，$\sqrt9 = 3$ 和 $-\sqrt9 = -3$，但符号 $\sqrt9$ 仅指第一个。$\sqrt x$ 的定义域和值域均为 $[0, \infty)$；其图像是侧放的抛物线的一半（图 1.3）。

**立方根** $\sqrt[3]{x}$ 是立方等于 $x$ 的数。每个实数恰有一个实立方根，所以定义域是 $\R$，例如 $\sqrt[3]{8} = 2$ 和 $\sqrt[3]{-8} = -2$。一般地，对于 $n$ 次根 $\sqrt[n]{x}$，当 $n$ 为奇数时，对每个 $x$ 都有定义；当 $n$ 为偶数时，只对 $x \ge 0$ 有定义。根也可以用分数指数表示：$x^{1/n} = \sqrt[n]{x}$ 和 $x^{m/n} = \big(\sqrt[n]{x}\big)^m$（$m/n$ 为最简分数），因此 $8^{2/3} = 2^2 = 4$。对于负数 $x$，本教程沿用多数微积分教材的约定，将 $x^{1/3}$ 解释为实立方根。Python 和 SymPy 的约定不同，见第 1.7 节。

```check
same(sqrt(9), 3); same_set(solve(x**2 - 9, x), [3, -3])
same(real_root(8, 3), 2); same(real_root(-8, 3), -2); same(Integer(8)**Rational(2, 3), 4)
```

::: pitfall
$x$并不总是$\sqrt{x^2}$。对于$x = -3$，$\sqrt{(-3)^2} = \sqrt9 = 3$。平方根永远不为负，因此

$$\sqrt{x^2} = \abs{x} \quad \text{for every real } x,$$

和 $\sqrt{x^2} = x$ 仅在$x \ge 0$时成立。根也不满足加法分配律：$\sqrt{9 + 16} = \sqrt{25} = 5$，而非$\sqrt9 + \sqrt{16} = 7$。

```check
xr = symbols('x', real=True)
same(sqrt(xr**2), Abs(xr)); same(sqrt((-3)**2), 3)
same(sqrt(9 + 16), 5); same(sqrt(9) + sqrt(16), 7)
```
:::

### 指数函数 {#exponential}

在幂函数$x^2$中，变量是底数。将其置于指数位置，则得到**指数函数** $f(x) = a^x$，其底数$a > 0$固定。指数法则对所有底数$a, b > 0$和所有实数$x$及$y$均成立：

$$\begin{aligned} a^{x+y} &= a^x a^y, & a^{x-y} &= \frac{a^x}{a^y}, & a^0 &= 1, \\ (a^x)^y &= a^{xy}, & (ab)^x &= a^x b^x, & a^{-x} &= \frac{1}{a^x}. \end{aligned}$$

对于整数指数，它们源于对因子的计数，如 $2^3 \cdot 2^2 = (2 \cdot 2 \cdot 2)(2 \cdot 2) = 2^5$ 所示；分数指数是根，$a^{1/2} = \sqrt a$；而对于像 $\sqrt2 = 1.41421\ldots$ 这样的无理指数，$a^{\sqrt2}$ 是 $a^{1.4}, a^{1.41}, a^{1.414}, \dots$ 趋近的那个数。因此，对于每个实数 $x$，$a^x$ 都有定义且为正。

```check
ap, bp = symbols('a b', positive=True)
xr, yr = symbols('x y', real=True)
same(ap**(xr + yr), ap**xr*ap**yr); same(ap**(xr - yr), ap**xr/ap**yr); same(ap**0, 1)
same((ap**xr)**yr, ap**(xr*yr)); same((ap*bp)**xr, ap**xr*bp**xr); same(ap**(-xr), 1/ap**xr)
same(2**3*2**2, 2**5); same(ap**Rational(1, 2), sqrt(ap))
rounds(sqrt(2), '1.41421')
```

如果 $a > 1$，$a^x$ 增长：$2^x$ 在 $x$ 每增加 1 的每一步中翻倍。如果 $0 < a < 1$，它衰减：$(\tfrac12)^x$ 在每一步中减半。每个指数函数都经过 $(0, 1)$，因为 $a^0 = 1$。对于 $a \ne 1$，定义域是 $\R$，值域是 $(0, \infty)$。

**数 e。** 有一个特殊的底数：被称为欧拉数的数

$$e = 2.718281828\ldots,$$

即欧拉数。与 $\pi$ 一样，它也是无理数：其小数部分永不结束且永不重复。函数 $e^x$，读作“e 的 x 次方”，被称为 *指数* 函数，因为当底数为 $e$ 时，微积分公式最为简洁；模块 6 展示了 $e$ 的来源及其原因。目前，$e$ 是介于 2 和 3 之间的一个数，$e \approx 2.71828$，因此 $e^x$ 的图像位于 $2^x$ 和 $3^x$ 的图像之间。

```valuetable
x = -2, -1, 0, 1, 2, 3
$2^x$ = 2**x
$e^x$ = exp(x)
$(\tfrac12)^x$ = (1/2)**x
digits = 5
---
x | 2^x | e^x | (\tfrac12)^x
-2 | 0.25 | 0.13534 | 4
-1 | 0.5 | 0.36788 | 2
0 | 1 | 1 | 1
1 | 2 | 2.7183 | 0.5
2 | 4 | 7.3891 | 0.25
3 | 8 | 20.086 | 0.125
```

```check
rounds(E, '2.718281828'); rounds(E, '2.71828')
holds(E > 2); holds(E < 3)
holds(2**Rational(1, 2) < exp(Rational(1, 2))); holds(exp(Rational(1, 2)) < 3**Rational(1, 2))
holds(3**Rational(-1, 2) < exp(Rational(-1, 2))); holds(exp(Rational(-1, 2)) < 2**Rational(-1, 2))
```

::: example 一个倍增模型
假设一个细菌群落从 1000 个细胞开始，每 3 小时翻倍。（这些数字是虚构的，但在食物和空间充足时，真实的群落确实如此生长。）经过 $t$ 小时后，它拥有

$$N(t) = 1000 \cdot 2^{t/3}$$

个单元格。求 $N(0)$、$N(3)$、$N(12)$ 和 $N(1)$，并证明对于每个 $t$，$N(t + 3) = 2N(t)$ 成立。

$N(0) = 1000 \cdot 2^0 = 1000$、$N(3) = 1000 \cdot 2^1 = 2000$ 和 $N(12) = 1000 \cdot 2^4 = 16{,}000$。对于 $N(1)$，你需要使用计算器：$N(1) = 1000 \cdot 2^{1/3} \approx 1259.9$，大约为 1260 个单元格。

根据指数法则，

$$\begin{aligned} N(t + 3) &= 1000 \cdot 2^{(t+3)/3} = 1000 \cdot 2^{t/3 + 1} \\ &= 1000 \cdot 2^{t/3} \cdot 2 = 2N(t). \end{aligned}$$

因此，无论何时开始计时，菌落每 3 小时翻倍。这就是指数增长的特征：相等的时间步长使数量乘以相等的因子。

```check
Nb = lambda T: 1000*2**(sympify(T)/3)
same(Nb(0), 1000); same(Nb(3), 2000); same(Nb(12), 16000)
rounds(Nb(1), '1259.9'); rounds(Nb(1), '1260')
steps(Nb(t + 3), 1000*2**(t/3 + 1), 1000*2**(t/3)*2, 2*Nb(t))
```
:::

::: pitfall
两个经典错误。首先，$x^2$ 和 $2^x$ 是不同的函数：在 $x^2$ 中，变量是底数，在 $2^x$ 中，变量是指数，而在 $x = 10$ 处，它们的值分别为 100 和 1024。其次，指数不满足加法分配律：$2^{x+3} = 2^x \cdot 2^3 = 8 \cdot 2^x$，而不是 $2^x + 2^3$。

```check
same(10**2, 100); same(2**10, 1024); same(2**(x + 3), 8*2**x)
holds(Ne((2**(x + 3)).subs(x, 1), 2**1 + 2**3))
```
:::

### 对数 {#logarithms}

指数函数回答诸如“$2^5$ 是多少？”之类的问题。对数回答相反的问题：“2 的多少次幂等于 32？”

::: definition 对数
设 $a > 0$ 且 $a \ne 1$。对于 $x > 0$，**以 $a$** 为底、$x$ 的对数，记作 $\log_a x$，读作“以 a 为底 x 的对数”，是满足 $a^y = x$ 的数 $y$：

$$\log_a x = y \quad\text{means}\quad a^y = x.$$

**自然对数** $\ln x$，读作“x的自然对数”，是以$e$为底的对数：$\ln x = y$意味着$e^y = x$。
:::

例如，$\log_2 32 = 5$因为$2^5 = 32$；$\log_{10} 1000 = 3$；$\log_2 \tfrac14 = -2$因为$2^{-2} = \tfrac14$；$\ln 1 = 0$因为$e^0 = 1$；以及$\ln e = 1$。由于$a^y$始终为正，0或负数的对数未定义：$\ln$的定义域为$(0, \infty)$，其值域为$\R$。

对数与指数互为逆运算，指数与对数互为逆运算：

$$\begin{aligned} e^{\ln x} &= x \quad \text{for } x > 0, \\ \ln\!\big(e^{y}\big) &= y \quad \text{for every real } y. \end{aligned}$$

用第 1.5 节的术语，$\ln$ 是 $e^x$ 的**反函数**。$\ln x$ 的图像是将 $e^x$ 的图像关于直线 $y = x$ 反射得到的（图 1.3）。

```check
same(log(32, 2), 5); same(log(1000, 10), 3); same(log(Rational(1, 4), 2), -2); same(log(1), 0); same(log(E), 1)
xp = symbols('x', positive=True)
same(exp(log(xp)), xp); same(log(exp(yr)), yr)
same(function_range(log(x), x, Interval.open(0, oo)), S.Reals)
```

::: theorem 对数法则
对于所有$x > 0$、$y > 0$和任意实数$r$：

$$\begin{aligned} \ln(xy) &= \ln x + \ln y, \\ \ln\frac{x}{y} &= \ln x - \ln y, \\ \ln\big(x^r\big) &= r\ln x. \end{aligned}$$

对于$\log_a$，任何满足$a \ne 1$的底数$a > 0$均适用相同的法则。
:::

::: proof
设 $p = \ln x$ 和 $q = \ln y$，使得 $e^p = x$ 和 $e^q = y$。根据指数法则，$e^{p+q} = e^p e^q = xy$。因此 $p + q$ 是 $e$ 的 $xy$ 次幂，这正是 $\ln(xy) = p + q$ 所表述的内容。以同样的方式，$e^{p-q} = e^p/e^q = x/y$ 给出了第二条法则，而 $e^{rp} = (e^p)^r = x^r$ 给出了第三条法则。相同的论证适用于任何以 $a$ 代替 $e$ 的底数。
:::

```check
xp, yp = symbols('x y', positive=True)
rr_ = symbols('r', real=True)
same(expand_log(log(xp*yp)), log(xp) + log(yp))
same(expand_log(log(xp/yp)), log(xp) - log(yp))
same(expand_log(log(xp**rr_)), rr_*log(xp))
same(log(xp*yp, 7), log(xp, 7) + log(yp, 7))
```

由此可得两个推论。为了在不同底数之间进行转换，写成 $y = \log_a x$，使得 $a^y = x$；对两边取 $\ln$ 并利用第三条法则：$y \ln a = \ln x$。由于 $a \ne 1$，$\ln a \ne 0$，以及

$$\log_a x = \frac{\ln x}{\ln a}.$$

并且为了解出未知数在指数位置的方程，对两边取对数（例 1.7）。

在计算中，$\log_2 n$ 计算的是减半次数。在包含 $n$ 个元素的有序列表中进行二分搜索，每一步都将剩余待搜索部分减半，因此大约需要 $\log_2 n$ 步：对于一百万个元素，仅需大约 20 步，因为 $\log_2 10^6 \approx 19.93$。

```check
same(log(xp, 5), log(xp)/log(5))
rounds(log(10**6, 2), '19.93'); rounds(log(10**6, 2), '20')
```

::: example 求解指数方程
例 1.6 中的菌落何时达到 10,000 个细胞？

求解 $1000 \cdot 2^{t/3} = 10{,}000$。两边除以 1000：$2^{t/3} = 10$。对两边取自然对数并利用第三条法则：

$$\frac{t}{3}\ln 2 = \ln 10, \quad\text{so}\quad t = \frac{3\ln 10}{\ln 2} \approx 9.966.$$

菌落经过约 9.97 小时（略少于 10 小时）后达到 10,000 个细胞。验证：$9.966/3 = 3.322$，以及 $2^{3.322} \approx 10.00$。

```check
tr = symbols('t', real=True)
tsol = 3*log(10)/log(2)
same(solve(Eq(1000*2**(tr/3), 10000), tr), [tsol])
same(expand_log(log(2**(tr/3))), tr/3*log(2))
rounds(tsol, '9.966'); rounds(tsol, '9.97'); holds(tsol < 10)
same(Rational(9966, 1000)/3, Rational(3322, 1000))
rounds(2**Rational(3322, 1000), '10.00')
```
:::

::: pitfall
对数法则涉及乘积、商和幂，而非和：$\ln(x + y)$ 不等于 $\ln x + \ln y$，且 $\dfrac{\ln x}{\ln y}$ 不等于 $\ln\dfrac{x}{y}$。这些法则还需要正数输入：对于每一个 $x \ne 0$ 和 $\ln(x^2) = 2\ln\abs{x}$，$2\ln x$ 在 $x < 0$ 时未定义，其中 $\ln x$ 甚至没有定义。注意符号表示：一些书籍和计算器将 $\log x$ 写作 $\log_{10} x$，而其他书籍及 Python 将 $\log x$ 写作 $\ln x$。本系列始终写出底数，仅在 $\ln$ 中除外。
:::

```check
xn = symbols('x_n', negative=True)
same(log(xn**2), 2*log(-xn)); same(Abs(xn), -xn)
for v in (Integer(-3), Rational(-1, 2), Integer(5)):
    same(log(v**2), 2*log(Abs(v)))
holds(log(Integer(-3)).is_real is False)
```

### 三角函数 {#trig}

学校三角学以度为单位测量角度。微积分以弧度为单位测量角度。

::: definition 弧度
**单位圆**是半径为 1 且以原点为中心的圆。其中心处截得单位圆上长度为 $\theta$ 的弧的角，其度量为 $\theta$**弧度**。（字母 $\theta$ 是希腊字母“theta”。）角度从正 $x$ 轴测量，正角逆时针测量，负角顺时针测量。
:::

单位圆的周长为$2\pi$，因此一整圈对应$2\pi$弧度：$360^\circ = 2\pi$和$180^\circ = \pi$。要将角度转换为弧度，需乘以$\pi/180$。因此$90^\circ = \pi/2$、$60^\circ = \pi/3$、$45^\circ = \pi/4$和$30^\circ = \pi/6$，而一弧度等于$180^\circ/\pi \approx 57.30^\circ$。

弧度使微积分最为简洁：对于以弧度表示的小角$\theta$，$\sin\theta$几乎精确等于$\theta$（$\sin 0.01 \approx 0.0099998$），且模块5表明$\sin x$的变化率随后为$\cos x$，没有多余因子$\pi/180$。除非页面另有说明，否则此后角度均以弧度为单位。

```check
same(360*pi/180, 2*pi); same(90*pi/180, pi/2); same(60*pi/180, pi/3); same(45*pi/180, pi/4); same(30*pi/180, pi/6)
rounds(180/pi, '57.30'); rounds(sin(Rational(1, 100)), '0.0099998')
```

::: definition 正弦和余弦
设$\theta$为任意实数，设$P$为从$(1, 0)$旋转$\theta$弧度后到达的单位圆上的点。则$\cos\theta$，**余弦**$\theta$，是$P$的$x$坐标，而$\sin\theta$，**正弦**$\theta$，是其$y$坐标：

$$P = (\cos\theta, \sin\theta).$$

其他四个三角函数由这两个函数定义，只要分母不为0：

$$\begin{aligned} \tan\theta &= \frac{\sin\theta}{\cos\theta}, & \cot\theta &= \frac{\cos\theta}{\sin\theta}, \\ \sec\theta &= \frac{1}{\cos\theta}, & \csc\theta &= \frac{1}{\sin\theta}. \end{aligned}$$
:::

它们分别读作「正切」「余切」「正割」「余割」（第一个和第三个与第 1.1 节的切线、割线同名）。对于 $0 < \theta < \pi/2$，原点、$P$ 以及它正下方的点 $(\cos\theta, 0)$ 构成一个斜边长为一的直角三角形。因此，这里的定义与中学所用的「对边除以斜边」和「邻边除以斜边」一致；单位圆定义还可以用于任意角。

::: figure id=fig-01-4
左图：单位圆上角度为$\theta$的点$P$的坐标为$(\cos\theta, \sin\theta)$；橙色弧的长度为$\theta$。右图：$\sin x$和$\cos x$的图像。两个面板中的蓝色线段高度均为$\sin\theta$：当$P$绕圆运动时，其高度描绘出正弦曲线。
:::

关于正弦和余弦的所有内容都可以从圆中读出：

- **范围。** $P$位于半径为1的圆上，因此$\sin$和$\cos$的定义域为$\R$，值域为$[-1, 1]$。
- **勾股恒等式。** $P$位于圆$x^2 + y^2 = 1$上，因此对于每个$\theta$
  $$\sin^2\theta + \cos^2\theta = 1,$$
  其中$\sin^2\theta$意味着$(\sin\theta)^2$。
- **周期性。** 加上 $2\pi$ 到 $\theta$ 使 $P$ 绕圆一周，因此 $\sin(\theta + 2\pi) = \sin\theta$ 和 $\cos(\theta + 2\pi) = \cos\theta$：正弦和余弦是 **周期性**，周期为 $2\pi$（图1.4）。正切函数的周期为 $\pi$（下面的公式 $\pi + \theta$ 展示了原因）；它在 $\cos\theta = 0$ 处未定义，在 $\theta = \pi/2 + k\pi$ 处对每个整数 $k$ 都成立。
- **对称性。** 旋转 $-\theta$ 得到 $P$ 关于 $x$ 轴的镜像，因此 $\cos(-\theta) = \cos\theta$ 和 $\sin(-\theta) = -\sin\theta$：余弦是偶函数，正弦是奇函数。

```check
same(sin(theta)**2 + cos(theta)**2, 1)
same(sin(theta + 2*pi), sin(theta)); same(cos(theta + 2*pi), cos(theta)); same(tan(theta + pi), tan(theta))
same_set(solveset(cos(x), x, Interval(-2*pi, 2*pi)), [-3*pi/2, -pi/2, pi/2, 3*pi/2])
same(cos(-theta), cos(theta)); same(sin(-theta), -sin(theta))
same(function_range(sin(x), x, R), Interval(-1, 1)); same(function_range(cos(x), x, R), Interval(-1, 1))
```

标准角度处的精确值来自学校几何中的两个三角形，每个三角形的斜边长均为1。沿对角线切割正方形得到一个直角三角形，其两个角均为 $\pi/4$；其两条较短边相等，设为 $s$，由勾股定理得 $2s^2 = 1$，因此 $s = 1/\sqrt2 = \sqrt2/2$。将边长为1的等边三角形沿中线切开，得到一个角为 $\pi/6$ 和 $\pi/3$ 的直角三角形；其最短边（对 $\pi/6$ 角）长为 $\tfrac12$，由勾股定理得第三边长为 $\sqrt{1 - \tfrac14} = \sqrt3/2$。由“对边比斜边”和“邻边比斜边”可得表格的中间三行；第一行和最后一行是单位圆上的点 $(1, 0)$ 和 $(0, 1)$：

| $\theta$ | $\sin\theta$ | $\cos\theta$ | $\tan\theta$ |
|---|---|---|---|
| $0$ | $0$ | $1$ | $0$ |
| $\pi/6$ | $1/2$ | $\sqrt3/2$ | $1/\sqrt3$ |
| $\pi/4$ | $\sqrt2/2$ | $\sqrt2/2$ | $1$ |
| $\pi/3$ | $\sqrt3/2$ | $1/2$ | $\sqrt3$ |
| $\pi/2$ | $1$ | $0$ | 无定义 |

```check
sp_ = symbols('s', positive=True)
same(solve(Eq(2*sp_**2, 1), sp_), [sqrt(2)/2]); same(1/sqrt(2), sqrt(2)/2)
same(sqrt(1 - Rational(1, 4)), sqrt(3)/2); same(pi/4 + pi/4 + pi/2, pi); same(pi/6 + pi/3 + pi/2, pi)
table = {0: (0, 1, 0), pi/6: (Rational(1, 2), sqrt(3)/2, 1/sqrt(3)), pi/4: (sqrt(2)/2, sqrt(2)/2, 1), pi/3: (sqrt(3)/2, Rational(1, 2), sqrt(3))}
for th_, (sv, cv, tv) in table.items():
    same(sin(th_), sv); same(cos(th_), cv); same(tan(th_), tv)
same(sin(pi/2), 1); same(cos(pi/2), 0); holds(tan(pi/2) == zoo)
```

对于其他角度，利用圆的对称性。角度为 $\pi - \theta$ 的点关于 $y$ 轴是角度为 $\theta$ 的点的镜像，而角度为 $\pi + \theta$ 的点是其关于原点的反射，因此

$$\begin{aligned} \sin(\pi - \theta) &= \sin\theta, & \cos(\pi - \theta) &= -\cos\theta, \\ \sin(\pi + \theta) &= -\sin\theta, & \cos(\pi + \theta) &= -\cos\theta. \end{aligned}$$

```check
same(sin(pi - theta), sin(theta)); same(cos(pi - theta), -cos(theta))
same(sin(pi + theta), -sin(theta)); same(cos(pi + theta), -cos(theta))
```

::: example $2\pi/3$ 处的精确值
求 $\theta = 2\pi/3$ 处 $\sin$、$\cos$ 和 $\tan$ 的精确值，以及该角度处单位圆上的点。

$2\pi/3$ 是 $120^\circ$，且为 $2\pi/3 = \pi - \pi/3$。由关于 $y$ 轴的镜像对称性，

$$\begin{aligned} \sin\frac{2\pi}{3} &= \sin\frac{\pi}{3} = \frac{\sqrt3}{2}, \\ \cos\frac{2\pi}{3} &= -\cos\frac{\pi}{3} = -\frac12, \end{aligned}$$

因此

$$\tan\frac{2\pi}{3} = \frac{\sqrt3/2}{-1/2} = -\sqrt3.$$

该点为 $\big(-\tfrac12, \tfrac{\sqrt3}{2}\big)$：位于 $y$ 轴左侧且 $x$ 轴上方，正如角度为 $120^\circ$ 时应有的位置。利用勾股恒等式进行验证：$\big(\tfrac{\sqrt3}{2}\big)^2 + \big(-\tfrac12\big)^2 = \tfrac34 + \tfrac14 = 1$。

```check
same(2*pi/3*180/pi, 120); same(2*pi/3, pi - pi/3)
same(sin(2*pi/3), sqrt(3)/2); same(cos(2*pi/3), -Rational(1, 2))
same((sqrt(3)/2)/(-Rational(1, 2)), -sqrt(3)); same(tan(2*pi/3), -sqrt(3))
steps((sqrt(3)/2)**2 + (-Rational(1, 2))**2, Rational(3, 4) + Rational(1, 4), 1)
```
:::

::: note
来自学校三角学的两个恒等式，即 **加法公式**，从模块 5 开始使用：

$$\begin{aligned} \sin(x + y) &= \sin x\cos y + \cos x\sin y, \\ \cos(x + y) &= \cos x\cos y - \sin x\sin y. \end{aligned}$$

```check
same(expand_trig(sin(x + y)), sin(x)*cos(y) + cos(x)*sin(y))
same(expand_trig(cos(x + y)), cos(x)*cos(y) - sin(x)*sin(y))
```
:::

::: pitfall
关于三角函数的三个常见错误。计算器处于角度模式时给出 $\sin 30 = 0.5$；在弧度制下，结果为 $\sin 30 \approx -0.988$，因为 30 弧度几乎等于五圈。$\sin x^2$ 意味着 $\sin(x^2)$，而 $\sin^2 x$ 意味着 $(\sin x)^2$。并且 $\sin(x + y)$ 不等于 $\sin x + \sin y$：请使用加法公式。

```check
same(sin(30*pi/180), Rational(1, 2)); rounds(sin(30), '-0.988')
holds(Rational(9, 2) < 30/(2*pi)); holds(30/(2*pi) < 5)
holds(Ne(sin(pi/2 + pi/2), sin(pi/2) + sin(pi/2)))
```
:::

## 由旧函数生成新函数 {#new-from-old}

### 图形的平移与拉伸 {#transformations}

将 $f(x) = x^2$ 与 $g(x) = (x - 2)^2$ 进行比较。在 $x = 5$ 处，$g$ 给出 $3^2 = 9$，即 $f$ 在 $x = 3$ 处的值；在 $x = 2$ 处，$g$ 给出 0，即 $f$ 在 0 处的值。一般而言 $g(x) = f(x - 2)$：$g$ 在 $x$ 处所做之事，与 $f$ 在两个单位之前所做之事相同。因此整个图形向右移动 2 个单位。

```check
fsq = x**2
same((x - 2)**2, fsq.subs(x, x - 2)); same(((x - 2)**2).subs(x, 5), fsq.subs(x, 3)); same(((x - 2)**2).subs(x, 2), 0)
```

对公式的每次简单更改都会以简单的方式移动图形。对于常数 $c > 0$：

| 公式 | $y = f(x)$ 的图形是 |
|---|---|
| $f(x) + c$, $f(x) - c$ | 沿 $c$ 方向上下平移 |
| $f(x - c)$, $f(x + c)$ | 沿 $c$ 方向左右平移 |
| $c\,f(x)$ | 沿垂直方向拉伸 $c$ 倍（若 $c < 1$ 则压缩） |
| $f(cx)$ | 沿水平方向压缩 $c$ 倍（若 $c < 1$ 则拉伸） |
| $-f(x)$ | 关于 $x$ 轴反射 |
| $f(-x)$ | 关于 $y$ 轴反射 |

$f$ 外部的更改按其外观方式起作用。$f$ 内部的更改作用方式相反，因为新函数在 $x$ 处达到 $f$ 的每个值：$f(x - c)$ 将图形向右移动，而 $f(2x)$ 在 $x = 3$ 处达到 $f$ 在 6 处的值，因此所有事情提前两倍发生，图形向 $y$ 轴压缩。

::: widget name=function-explorer
选择一个函数，然后一次移动一个滑块：滑块给出 $y = a\,f\big(b(x - c)\big) + d$，虚线曲线是原 $y = f(x)$。在每次移动前预测其结果。使用 $f(x) = x^2$，设置 $c = 1$，然后 $d = 2$，并跟随 U 形底部；设置 $a = -1$ 以翻转图形。按重置，选择 $\sin x$ 并设置 $b = 2$：两个波现在填充了原来一个波的位置。然后构建例 1.9 中的函数。
:::

::: example 从 $y = x^2$ 构建图形
描述如何从 $y = x^2$ 的图形获得 $g(x) = -(x + 2)^2 + 4$ 的图形。找到 $g$ 图形的最高点、零点以及 $g$ 的值域。

按照抛物线的底部点 $(0, 0)$，分三步构建 $g$：

1. $(x + 2)^2$ 是 $x^2$，其中 $x$ 替换为 $x + 2$：向左平移 2 个单位。点 $(0, 0)$ 移动到 $(-2, 0)$。
2. $-(x + 2)^2$：关于 $x$ 轴反射。抛物线现在开口向下，且 $(-2, 0)$ 保持原位。
3. $-(x + 2)^2 + 4$：向上平移 4 个单位。该点移动到 $(-2, 4)$。

因此图像是一个开口向下的抛物线，其最高点位于 $(-2, 4)$。对于零点，$-(x + 2)^2 + 4 = 0$ 意味着 $(x + 2)^2 = 4$，即 $x + 2 = 2$ 或 $x + 2 = -2$，也就是 $x = 0$ 或 $x = -4$。由于 $(x + 2)^2 \ge 0$，$g$ 的每个值至多为 4。反之，每个数 $y \le 4$ 都是一个函数值：$g(x) = y$ 意味着 $(x + 2)^2 = 4 - y$，这在 $x = -2 + \sqrt{4 - y}$ 处成立。因此值域为 $(-\infty, 4]$。在探索器中：$f(x) = x^2$，$a = -1$，$c = -2$，$d = 4$。

```check
gq = -(x + 2)**2 + 4
same(gq, -fsq.subs(x, x + 2) + 4); same(gq.subs(x, -2), 4)
same(expand(gq), -x**2 - 4*x)
same_set(solve(Eq((x + 2)**2, 4), x), [0, -4]); same_set(solve(gq, x), [0, -4])
same(expand(gq - y), expand((4 - y) - (x + 2)**2))       # g(x) = y means (x + 2)^2 = 4 - y
same(simplify(gq.subs(x, -2 + sqrt(4 - y))), y)
same(function_range(gq, x, R), Interval(-oo, 4))
```
:::

::: pitfall
$f(x - 3)$ 将图像向**右**平移三个单位。$f$ 内的减号容易让人误以为向左移动。取一个点检验，原来的函数值 $f(0)$ 现在在 $x = 3$ 处取得。
:::

### 复合 {#composition}

要计算 $\sqrt{x^2 + 1}$，你先平方并加 1，然后取平方根：该函数是两个更简单函数的链，$g(x) = x^2 + 1$ 后接 $f(u) = \sqrt u$。

::: definition 复合
**复合** $f \circ g$，读作“f 与 g 的复合”或“g 之后的 f”，是函数

$$(f \circ g)(x) = f\big(g(x)\big).$$

其定义域是 $g$ 定义域中所有使得 $g(x)$ 在 $f$ 定义域内的 $x$ 的集合。
:::

写在 $x$ 旁边的函数最先作用：在 $f \circ g$ 中，先 $g$，再 $f$。在程序中，复合是一个管道，其中一个函数的输出成为下一个函数的输入；神经网络是简单函数（其层）的长复合。

::: example 两种顺序的复合
设 $f(x) = \sqrt{x}$ 和 $g(x) = x - 3$。求 $f \circ g$ 和 $g \circ f$ 及其定义域，并在 $x = 7$ 处求值。

$(f \circ g)(x) = f(x - 3) = \sqrt{x - 3}$。这里 $g$ 接受任何 $x$，而 $f$ 需要其输入 $x - 3$ 至少为 0，因此定义域为 $[3, \infty)$。

$(g \circ f)(x) = g(\sqrt x) = \sqrt x - 3$。这里 $f$ 需要 $x \ge 0$，而 $g$ 接受任何输入，因此定义域为 $[0, \infty)$。

在 $x = 7$ 处：$(f \circ g)(7) = \sqrt4 = 2$，而 $(g \circ f)(7) = \sqrt7 - 3 \approx -0.354$。两种顺序给出不同的函数，具有不同的定义域：在复合中，顺序很重要。

```check
fc, gc = sqrt(x), x - 3
same(fc.subs(x, gc), sqrt(x - 3)); same(gc.subs(x, fc), sqrt(x) - 3)
same(continuous_domain(sqrt(x - 3), x, R), Interval(3, oo)); same(continuous_domain(sqrt(x) - 3, x, R), Interval(0, oo))
same(sqrt(x - 3).subs(x, 7), 2); rounds(sqrt(7) - 3, '-0.354')
```
:::

将复杂函数视为复合是一项技能，模块 5 的链式法则依赖于它。例如，$h(x) = (2x + 1)^5$ 是 $f\big(g(x)\big)$ 与 **内层函数** $g(x) = 2x + 1$ 和 **外层函数** $f(u) = u^5$；而 $e^{-x^2}$ 是 $f\big(g(x)\big)$ 与 $g(x) = -x^2$ 和 $f(u) = e^u$。

```check
same((u**5).subs(u, 2*x + 1), (2*x + 1)**5); same(exp(u).subs(u, -x**2), exp(-x**2))
same(sqrt(u).subs(u, x**2 + 1), sqrt(x**2 + 1))
```

::: pitfall
复合函数的定义域来自其组成部分，而非简化后的公式。对于 $f(x) = x^2$ 和 $g(x) = \sqrt x$，$(f \circ g)(x) = (\sqrt x)^2 = x$，但仅当 $x \ge 0$ 时：$g(-4)$ 未定义，因此 $f\big(g(-4)\big)$ 也未定义。

```check
xnn = symbols('x', nonnegative=True)
same((xnn**2).subs(xnn, sqrt(xnn)), xnn); holds(sqrt(-4).is_real == False)
```
:::

### 反函数 {#inverse}

公式 $F = 1.8C + 32$ 将摄氏度转换为华氏度，而 $C = (F - 32)/1.8$ 将其转换回来：100 °C 变为 212 °F，而 212 °F 又变回 100 °C。每个公式都撤销了另一个公式的操作。并非每个函数都可逆：$x^2$ 将 2 和 $-2$ 都映射到 4，因此输出 4 无法告诉你输入值。

```check
Fc = Rational(9, 5)*c + 32
same(solve(Eq(y, Fc), c), [(y - 32)/Rational(9, 5)])
same(Fc.subs(c, 100), 212); same((212 - 32)/Rational(9, 5), 100)
```

::: definition 单射函数
如果不同的输入总是产生不同的输出，则函数 $f$ 是 **单射** 的：只要 $x_1 \ne x_2$，就有 $f(x_1) \ne f(x_2)$。
:::

水平线 $y = k$ 与 $f$ 的图像在 $f(x) = k$ 处相交，因此 $f$ 是单射的，当且仅当没有水平线与其图像相交超过一次：**水平线测试**。$x^3$ 和 $e^x$ 通过了该测试；$x^2$ 和 $\sin x$ 未通过该测试。

::: definition 反函数
设 $f$ 是一个定义域为 $D$ 且值域为 $R$ 的单射函数。其 **反函数** $f^{-1}$，读作“f 反”，定义域为 $R$ 且值域为 $D$，并由下式定义

$$f^{-1}(y) = x \quad\text{exactly when}\quad f(x) = y.$$
:::

用文字表述，$f^{-1}$ 将 $f$ 的每个输出映射回其来源的输入。因此，两者相互抵消：

$$\begin{aligned} f^{-1}\big(f(x)\big) &= x \quad \text{for every } x \text{ in } D, \\ f\big(f^{-1}(y)\big) &= y \quad \text{for every } y \text{ in } R. \end{aligned}$$

$e^x$ 和 $\ln x$ 是你在 1.4 节中遇到的一对：$\ln(e^x) = x$ 对每个实数 $x$ 成立，且 $e^{\ln y} = y$ 对每个 $y > 0$ 成立。

::: pitfall
$f^{-1}(x)$ 并不意味着 $\dfrac{1}{f(x)}$：这里的 $-1$ 不是指数，而是逆函数名称的一部分。对于 $f(x) = 2x$，$f^{-1}(x) = x/2$，尽管 $1/f(x) = 1/(2x)$。当你意指倒数时，请写 $\dfrac{1}{f(x)}$ 或 $\big(f(x)\big)^{-1}$。

```check
same(solve(Eq(y, 2*x), x), [y/2]); holds(Ne((x/2).subs(x, 2), (1/(2*x)).subs(x, 2)))   # different at x = 2
```
:::

为了找到 $f^{-1}$ 的公式，请写出 $y = f(x)$ 并解出 $x$。如果值域中的每个 $y$ 恰好来自一个 $x$，那么 $f$ 是一对一的，且该解是 $x = f^{-1}(y)$。最后，将 $y$ 重命名为 $x$，以便像往常一样使 $x$ 成为 $f^{-1}$ 的输入。

::: example 求逆函数
证明 $f(x) = \dfrac{x + 1}{x - 2}$（其中 $x \ne 2$）是一对一的，并求其值域及其逆函数。

写出 $y = \dfrac{x + 1}{x - 2}$ 并解出 $x$。两边同乘 $x - 2$，将含有 $x$ 的项收集到左边并因式分解：

$$\begin{aligned} y(x - 2) &= x + 1 \\ yx - x &= 2y + 1 \\ x(y - 1) &= 2y + 1. \end{aligned}$$

如果 $y = 1$，最后一行表明 $0 = 3$，这是不可能的：值 1 永远无法达到。如果 $y \ne 1$，则除以 $y - 1$：

$$x = \frac{2y + 1}{y - 1}.$$

此 $x$ 永远不为 2（那需要 $2y + 1 = 2y - 2$，即 $1 = -2$），因此它属于定义域。每个 $y \ne 1$ 恰好来自一个 $x$：$f$ 是一对一的，其值域是 $(-\infty, 1) \cup (1, \infty)$，并且将 $y$ 重命名为 $x$，

$$f^{-1}(x) = \frac{2x + 1}{x - 1}, \qquad x \ne 1.$$

检查一个值：$f(3) = 4/1 = 4$，以及 $f^{-1}(4) = 9/3 = 3$。

```check
fr = (x + 1)/(x - 2)
steps(y*(x - 2) - (x + 1), y*x - x - (2*y + 1), x*(y - 1) - (2*y + 1))   # each line as "left - right"
holds((x*(y - 1) - (2*y + 1)).subs(y, 1) == -3)                         # y = 1 gives 0 = 3
same(solve(Eq(y, fr), x), [(2*y + 1)/(y - 1)])
same(solve(Eq((2*y + 1)/(y - 1), 2), y), [])
finv = (2*x + 1)/(x - 1)
same(simplify(fr.subs(x, finv)), x); same(simplify(finv.subs(x, fr)), x)
same(function_range(fr, x, R - FiniteSet(2)), Union(Interval.open(-oo, 1), Interval.open(1, oo)))
same(fr.subs(x, 3), 4); same(finv.subs(x, 4), 3)
```
:::

反函数的图像随 $f$ 的图像免费获得。

::: theorem 反函数的图像
如果 $f$ 是一对一的，则 $f^{-1}$ 的图像是 $f$ 的图像关于直线 $y = x$ 的反射。
:::

::: proof
点 $(p, q)$ 位于 $f$ 的图像上，当且仅当 $f(p) = q$，即，当且仅当 $f^{-1}(q) = p$，即，当且仅当 $(q, p)$ 位于 $f^{-1}$ 的图像上。因此，$f^{-1}$ 的图像由 $f$ 的图像的点组成，其坐标互换。交换坐标是关于直线 $y = x$ 的反射：如果 $p \ne q$，则 $(p, q)$ 和 $(q, p)$ 的中点 $\big(\tfrac{p+q}{2}, \tfrac{p+q}{2}\big)$ 位于直线上，并且连接它们的线段的斜率为 $\tfrac{p - q}{q - p} = -1$，因此它垂直于斜率为 1 的直线。如果 $p = q$，则该点位于直线上且是其自身的镜像。
:::

```check
pp, qq = symbols('p q')
same((pp - qq)/(qq - pp), -1); same((-1)*1, -1)
```

无法通过水平线测试的函数，通常可以通过**限制其定义域**使其成为单射：在$[0, \infty)$上，$x^2$是单射，其逆函数为$\sqrt x$。将$y = x$中抛物线的右半部分进行反射，得到侧放的半抛物线。

```check
same(sqrt(xnn**2), xnn); same(sqrt(xnn)**2, xnn)
```

## 平均变化率 {#rates}

回到第1.3节中关于下落小球及其表格的内容。在$t = 1$和$t = 3$之间，它在2秒内下落了$s(3) - s(1) = 44.1 - 4.9 = 39.2$米，平均速度为$39.2/2 = 19.6$米/秒（m/s）。在$t = 1$和$t = 2$之间，它在1秒内下落了$19.6 - 4.9 = 14.7$米：14.7 m/s。小球正在加速，因此平均值取决于区间。在时刻$t = 1$，即小球上的速度计会显示的速度是多少？

```check
sb = lambda T: Rational(49, 10)*sympify(T)**2
same(sb(3), Rational(441, 10)); same(sb(1), Rational(49, 10)); same(sb(2), Rational(196, 10))
same(sb(3) - sb(1), Rational(392, 10)); same((sb(3) - sb(1))/2, Rational(196, 10))
same(sb(2) - sb(1), Rational(147, 10))
```

::: definition 平均变化率
函数 $f$ 在区间 $[a, b]$ 上的 **平均变化率** 为

$$\frac{f(b) - f(a)}{b - a} = \frac{\Delta y}{\Delta x}.$$
:::

$\Delta$是大写希腊字母Delta，用于表示“变化量”：$\Delta x = b - a$是自变量的变化量，$\Delta y = f(b) - f(a)$是因变量的变化量，$\Delta y/\Delta x$读作“delta y over delta x”。其单位是输出单位除以输入单位：对于小球是米/秒，对于冷却的茶杯是度/分钟。

几何上，$\Delta y/\Delta x$ 是通过图像上两点 $(a, f(a))$ 和 $(b, f(b))$ 的割线 **的斜率**。对于线性函数，每一条割线都是该函数本身，因此在任意区间上的平均变化率等于斜率 $m$。对于曲线来说，这取决于所选的区间，如图 1.5 所示。

::: figure id=fig-01-5
下落的球，$s(t) = 4.9t^2$。从$(1, 4.9)$到$t = 1 + h$处点的割线，对于$h = 2$，1和0.5，斜率分别为19.6、14.7和12.25：这是在$[1, 3]$、$[1, 2]$和$[1, 1.5]$上的平均速度。随着$h$缩小，割线趋近于$t = 1$处的虚线切线，其斜率为9.8。
:::

### 差商 {#difference-quotient}

为了研究越来越短的区间上的变化率，固定起点$a$并将区间长度称为$h$。

::: definition 差商
对于函数$f$、数$a$和数$h \ne 0$，其中$a$和$a + h$在$f$的定义域内，**差商**是

$$\frac{f(a + h) - f(a)}{h}.$$

它是$f$在$a$和$a + h$之间的平均变化率：在$[a, a + h]$上（如果$h > 0$），以及在$[a + h, a]$上（如果$h < 0$）。
:::

```check
fq = Function('f')
same((fq(a + h) - fq(a))/h, (fq(a) - fq(a + h))/(a - (a + h)))   # the same number when h < 0
```

::: example 下落球的差商
简化 $s(t) = 4.9t^2$ 的差商在 $t = 1$ 处。

将 $1 + h$ 代入 $t$，保留括号，并展开：

$$\begin{aligned} s(1 + h) &= 4.9(1 + h)^2 \\ &= 4.9(1 + 2h + h^2) \\ &= 4.9 + 9.8h + 4.9h^2. \end{aligned}$$

减去 $s(1) = 4.9$：常数项抵消，且 $s(1 + h) - s(1) = 9.8h + 4.9h^2$。每个剩余项都包含 $h$，因此除以 $h$（由于 $h \ne 0$ 允许）得到

$$\begin{aligned} \frac{s(1 + h) - s(1)}{h} &= \frac{9.8h + 4.9h^2}{h} \\ &= 9.8 + 4.9h \qquad (h \ne 0). \end{aligned}$$

对于 $h = 2$，1 和 0.5，这分别给出 19.6、14.7 和 12.25，即图 1.5 中的斜率。

```check
s49 = Rational(49, 10)*t**2
steps(s49.subs(t, 1 + h), Rational(49, 10)*(1 + 2*h + h**2), Rational(49, 10) + Rational(98, 10)*h + Rational(49, 10)*h**2)
same(s49.subs(t, 1 + h) - s49.subs(t, 1), Rational(98, 10)*h + Rational(49, 10)*h**2)
steps((s49.subs(t, 1 + h) - s49.subs(t, 1))/h, (Rational(98, 10)*h + Rational(49, 10)*h**2)/h, Rational(98, 10) + Rational(49, 10)*h)
same([Rational(98, 10) + Rational(49, 10)*hh for hh in (2, 1, Rational(1, 2))], [Rational(196, 10), Rational(147, 10), Rational(1225, 100)])
```
:::

### 缩小区间 {#shrinking}

现在让 $h$ 缩小。表格显示了距离变化 $s(1 + h) - s(1)$，以及在以 $t = 1$（$h > 0$）开始或以 $h < 0$ 结束的区间上的平均速度。对于 $h < 0$，变化量为负，因为 $s(1 + h)$ 是较早的位置，将其除以负的 $h$ 得到正的速度：

```valuetable
h = 1, 0.1, 0.01, 0.001, -0.001, -0.01, -0.1, -1
$s(1+h) - s(1)$ = 49*(1 + h)**2/10 - 49/10
$\dfrac{s(1+h) - s(1)}{h}$ = (49*(1 + h)**2/10 - 49/10)/h
---
h | s(1+h) - s(1) | \dfrac{s(1+h) - s(1)}{h}
1 | 14.7 | 14.7
0.1 | 1.029 | 10.29
0.01 | 0.09849 | 9.849
0.001 | 0.0098049 | 9.8049
-0.001 | -0.0097951 | 9.7951
-0.01 | -0.09751 | 9.751
-0.1 | -0.931 | 9.31
-1 | -4.9 | 4.9
```

当 $h$ 从两侧趋近于 0 时，平均速度收敛于 9.8 m/s。例 1.12 中的公式 $9.8 + 4.9h$ 说明了原因：项 $4.9h$ 收缩为零。将 9.8 m/s 称为球在时刻 $t = 1$ 的速度，即其**瞬时速度**，这是自然的。在图 1.5 中，它是切线的斜率。

```check
q1 = (Rational(49, 10)*(1 + h)**2 - Rational(49, 10))/h
limit_is(q1, h, 0, Rational(98, 10), '+'); limit_is(q1, h, 0, Rational(98, 10), '-')   # from either side
same(diff(Rational(49, 10)*t**2, t).subs(t, 1), Rational(98, 10))                      # the tangent's slope in Figure 1.5
```

::: keyidea
瞬时变化率是当区间缩小时，平均变化率所趋近的那个数值。你不能在差商中令 $h = 0$ 等于 0，因为那会使差商变为 $0/0$；相反，你要观察当 $h$ 趋近于 0 时会发生什么。模块 2 使“趋近”这一概念精确化：它指的是 **极限**的概念。模块 4 将结果称为**导数**。
:::

::: pitfall
当你在公式中代入 $a + h$ 时，替换每一个 $x$ 并保留括号。对于 $f(x) = x^2$，$f(1 + h) = (1 + h)^2 = 1 + 2h + h^2$。它不是 $f(1) + h = 1 + h$，也不是 $f(1) + f(h) = 1 + h^2$。丢失中间项 $2h$ 是差商中最常见的错误。

```check
same(expand((1 + h)**2), 1 + 2*h + h**2)
```
:::

## 设置 Python {#python}

本节为可选内容：你仅在“动手计算”框中需要 Python。三个免费软件包将 Python 编程语言转化为数学工作台：**SymPy**对符号进行精确的代数和微积分运算，**NumPy**对数字数组进行计算，而**matplotlib** 用于绘制图形。

这些页面上的输出是使用 Python 3.11.18、SymPy 1.14.0、mpmath 1.3.0、NumPy 2.4.6 和 matplotlib 3.11.2 生成的。在撰写本文时（2026 年 11 月），最新的 Python 版本为 3.15.2；当前的 NumPy（2.5.5）需要 Python 3.12 或更高版本，当前的 matplotlib（3.11.2）需要 Python 3.11 或更高版本，且两者均提供适用于 Windows、macOS 和 Linux 上 Python 3.12 至 3.15 的预构建包。较新的版本可能会以不同的方式打印某些结果，例如以不同的顺序排列项。

### 安装 Python {#install}

:::: tabs
::: tab Windows
1. 在网页浏览器中，打开 python.org/downloads 并点击 **下载 Python 安装管理器**。（**Python 安装管理器** 也位于 Microsoft Store 中；这两个版本完全相同。）
2. 双击下载的文件并选择 **安装**。这将为您提供命令 `python`、`py` 和 `pymanager`。
3. 从开始菜单打开 PowerShell 并输入 `python`。如果尚未安装 Python 运行时，安装管理器会自动安装最新发行版。当 Python 启动时，它会显示其提示符 `>>>`；输入 `exit()` 并按 Enter 键退出。

   ```terminal
   PS> python
   ```

当你第一次安装运行时环境时，通常会被询问是否要将一个文件夹 `%LocalAppData%\Python\bin` 添加到你的 PATH 中。这是可选的，因为本系列使用的是 `py` 命令，无论是否添加该文件夹都能正常工作。

许多指南仍然描述传统的完整安装程序。由于 Python 3.14 已弃用该安装方式，并且不会为 Python 3.16 或更高版本提供该安装程序，因此本页面使用安装管理器。
:::
::: tab macOS
1. 在网页浏览器中打开 python.org/downloads 并下载最新版本的 macOS 安装包 (`.pkg`）。这是一个 universal2 构建版本，适用于 Apple Silicon 和 Intel Mac。
2. 双击该安装包。点击 **继续**（阅读说明），**继续**和**同意**（许可协议），然后点击 **安装**。安装需要管理员账户。
3. 最后，双击 **Install Certificates.command** 窗口中的 `/Applications/Python 3.15/`。
4. 打开终端并检查版本：

   ```terminal
   $ python3 --version
   ```

你通过 `python3`（或 `python3.15`）启动新的 Python。macOS 也有自己的 `/usr/bin/python3`，属于 Apple，通常较旧：不要修改或删除它。
:::
::: tab Linux
大多数 Linux 发行版都预装了 Python。你需要两个额外的部分，`venv`（虚拟环境）和 `pip`（包安装器）。在 Debian 和 Ubuntu 上：

```terminal
$ sudo apt update
$ sudo apt install python3-venv python3-pip
```

在 Fedora 上 `sudo dnf install python3-pip python3-wheel`；在 Arch 上 `sudo pacman -S python-pip`。然后检查版本：

```terminal
$ python3 --version
```

Python 3.12 或更高版本允许 pip 安装这三个包的当前版本；产生这些页面输出的 Python 3.11 也适用。
:::
::::

### 创建一个虚拟环境 {#venv}

一个 **虚拟环境** 是一个包含自己 Python 包集合的文件夹，与你电脑上的其余部分隔离：当你在该环境中安装包时，它们会进入该文件夹，删除该文件夹会删除这些包。在你存放工作的文件夹中为此系列创建一个，并激活它：

:::: tabs
::: tab Windows
```terminal
PS> py -m venv calculus_env
PS> calculus_env\Scripts\Activate.ps1
```

如果 PowerShell 拒绝运行 `Activate.ps1`，请先运行 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` 一次，然后再次激活。 （在较旧的命令提示符中，第二个命令是 `calculus_env\Scripts\activate`。）
:::
::: tab macOS
```terminal
$ python3 -m venv calculus_env
$ source calculus_env/bin/activate
```
:::
::: tab Linux
```terminal
$ python3 -m venv calculus_env
$ source calculus_env/bin/activate
```
:::
::::

`deactivate` 会离开环境。每次你打开一个新的终端来处理这个系列的内容时，请前往相同的文件夹，并使用第二个命令重新激活环境。

### 安装 SymPy、NumPy 和 matplotlib {#packages}

在激活的环境中，检查 pip，Python 的包安装工具，是否正常工作，然后安装这三个包：

:::: tabs
::: tab Windows
```terminal
PS> py -m pip --version
PS> py -m pip install sympy numpy matplotlib
```
:::
::: tab macOS
```terminal
$ python3 -m pip --version
$ python3 -m pip install sympy numpy matplotlib
```
:::
::: tab Linux
```terminal
$ python3 -m pip --version
$ python3 -m pip install sympy numpy matplotlib
```
:::
::::

安装 SymPy 时也会安装 mpmath，这是 SymPy 用于处理大量数字的库。

要运行 Python 代码，请在激活的环境中启动 Python，使用 `py` 在 Windows 上或 `python3` 在 macOS 和 Linux 上，并在提示符 `>>>` 下输入这些行；或者将它们保存到一个文件中，例如 `first.py`，然后运行 `py first.py` 或 `python3 first.py`。该系列的所有代码都在 [calculus-code.zip](calculus-code.zip) 中，每个模块一个脚本。

::: trouble
- **macOS: `python3 --version` 显示的版本比您安装的旧。** 这是苹果自己的 Python。使用 `python3.15` 替代 `python3` 来创建环境（`python3.15 -m venv calculus_env`）；一旦环境激活，`python3` 才是正确的。不要动苹果的 Python。
- **Linux: `python3 -m venv` 失败。** 在 Debian 和 Ubuntu 上，使用 `sudo apt install python3-venv python3-pip` 安装缺失的部分，然后重试。
- **`ModuleNotFoundError: No module named 'sympy'`.** Python 无法找到这些包，通常是因为此终端中环境未激活。激活环境并重试；如果错误依旧，需在环境激活状态下重新安装这些包。
:::

### 第一次会话 {#first-session}

下面的四个框将用 Python 重新演示本模块；请将您看到的内容与显示的输出进行比较。

::: compute 符号、替换、因式分解与展开
SymPy 可以处理 **符号**，即未知数的名称，您可以通过 `symbols` 创建它们。然后您可以构建表达式，使用 `subs` 将数值代入表达式，并通过 `factor` 和 `expand` 进行因式分解与展开：

```python
import sympy as sp
x = sp.symbols('x')            # x is now a symbol, a name for a number
p = x**3 - x**2 - 6*x          # ** is a power; write * for every product
print(p.subs(x, 4))            # substitute 4 for x: p(4)
print(sp.factor(p))
print(sp.expand((x + 2)*(x - 3)))
```

```output
24
x*(x - 3)*(x + 2)
x**2 - x - 6
```

这个多项式是例1.4中的多项式。这三条线分别是它的值 $p(4) = 64 - 16 - 24 = 24$，它的因式分解形式，以及展开后的乘积 $(x + 2)(x - 3)$。幂运算需要 `**`：在Python中，符号 `^` 表示其他含义。

```python fails
print(x^2)
```

```output
TypeError: unsupported operand type(s) for ^: 'Symbol' and 'int'
```

在整数之间，`^` 将它们的二进制位组合起来，因此 `2^3` 是 1，不会报错。接下来，`simplify` 寻找表达式的更简单形式；尝试对例1.5中的有理函数应用它：

```python
r = (x**2 - 4)/(x**2 - x - 2)
print(sp.simplify(r))
print(r.subs(x, 2))
```

```output
(x + 2)/(x + 1)
nan
```

SymPy 会取消因子 $x - 2$ 而不提及 $x \ne 2$：第1.4节的陷阱由你记住。将 2 代入 $r$ 本身会得到 `nan`，即“非数字”，因为它等于 $0/0$。
:::

```check
same((x**3 - x**2 - 6*x).subs(x, 4), 24); same(64 - 16 - 24, 24)
```

::: compute 精确数字和十进制数
SymPy 保持数字精确，除非你要求使用十进制。将 4.9 写成分数 `sp.Rational(49, 10)`，并让 SymPy 简化例1.12中的差商：

```python
import sympy as sp
t, h = sp.symbols('t h')
s = sp.Rational(49, 10)*t**2                 # 4.9 t^2, with 4.9 kept exact
q = (s.subs(t, 1 + h) - s.subs(t, 1))/h      # the difference quotient at t = 1
print(q)
print(sp.simplify(q))
```

```output
(49*(h + 1)**2/10 - 49/10)/h
49*h/10 + 49/5
```

$\tfrac{49h}{10} + \tfrac{49}{5}$ 是 $4.9h + 9.8$，即例1.12的答案，按照 SymPy 的顺序排列项。`sp.N` 将精确数字转换为十进制数，除非你要求更多，否则保留15位有效数字：

```python
print(sp.sqrt(8), sp.N(sp.sqrt(8)))
print(sp.N(sp.E), sp.N(sp.pi, 30))
print(sp.N(3*sp.log(10)/sp.log(2), 4))       # Example 1.7; log is ln
```

```output
2*sqrt(2) 2.82842712474619
2.71828182845905 3.14159265358979323846264338328
9.966
```

SymPy 保持 $\sqrt8$ 精确，如 $2\sqrt2$。在 SymPy 中，如同在 Python 的 `math` 模块中，`log` 表示自然对数 $\ln$；写 `sp.log(x, 10)` 表示 $\log_{10} x$。
:::

```check
same(Rational(49, 10)*h + Rational(49, 5), Rational(98, 10) + Rational(49, 10)*h)
same(sqrt(8), 2*sqrt(2))
```

::: compute Python 自己的算术：弧度、四舍五入和定义域
Python 的 `math` 模块使用 **浮点数**，这是计算机对实数的快速近似，保留大约 16 位有效数字：

```python
import math
print(math.sin(math.pi/6))           # sin(pi/6) is exactly 1/2
print(math.sin(30))                  # 30 radians, not 30 degrees
print(math.sin(math.radians(30)))    # convert 30 degrees to radians first
print(math.log(math.e**2), math.log10(1000))
```

```output
0.49999999999999994
-0.9880316240928618
0.49999999999999994
2.0 3.0
```

三个要点。Python 的三角函数使用弧度；`math.radians` 将度数转换为弧度。浮点数结果可能在最后一位有误差，因此 $\sin(\pi/6)$ 会略低于 0.5（SymPy 的 `sp.sin(sp.pi/6)` 恰好等于 `1/2`）；模块 2 展示了这种误差何时重要。并且 `math.log` 是 $\ln$。还有两个惊喜：

```python
print((-8)**(1/3))
print(math.cbrt(-8))
```

```output
(1.0000000000000002+1.7320508075688772j)
-2.0
```

Python 对负数取分数次幂时给出复数，其中 `j` 标记虚部。这里用 $(-8)^{1/3}$ 表示的实立方根是 $-2$，在 Python 中可用 `math.cbrt` 求得。SymPy 也默认给出复根，可以显式要求实根：

```python
import sympy as sp
print(sp.root(-8, 3), sp.real_root(-8, 3))
```

```output
2*(-1)**(1/3) -2
```

在 `2*(-1)**(1/3)` 中，因子 `(-1)**(1/3)` 表示一个复数，而不是 $-1$。并且在函数的定义域之外，Python 拒绝：

```python fails
print(math.sqrt(-4))
```

```output
ValueError: math domain error
```

Python 3.11 将此称为 "math domain error"；其他版本可能会以不同的方式表述该信息。
:::

::: compute 数字和图像：lambdify、NumPy 和 matplotlib
`sp.lambdify` 将一个 SymPy 公式转换为一个快速的数值函数，该函数接受一个 NumPy **数组**，即一个可以被算术运算同时作用的数字列表：

```python
import sympy as sp
import numpy as np
t = sp.symbols('t')
s = sp.lambdify(t, 4.9*t**2)       # the formula as a numerical function
ts = np.linspace(0, 3, 7)          # 7 equally spaced times from 0 to 3
print(ts)
print(s(ts))                       # s at all seven times at once
```

```output
[0.  0.5 1.  1.5 2.  2.5 3. ]
[ 0.     1.225  4.9   11.025 19.6   30.625 44.1  ]
```

第二行是第 1.3 节的表格。现在第 1.6 节的平均速度：

```python
for h in [0.1, 0.01, 0.001]:
    print(h, (s(1 + h) - s(1))/h)
```

```output
0.1 10.290000000000008
0.01 9.848999999999997
0.001 9.804899999998895
```

精确值为 10.29、9.849 和 9.8049，因此计算机的答案在最后几位数字上是错误的。模块 2 解释了原因，以及为什么当 $h$ 缩小得更多时误差会增大。最后，一张图表：

```python
import matplotlib.pyplot as plt
ts = np.linspace(0, 3, 200)
plt.plot(ts, s(ts))
plt.xlabel('t (seconds)')
plt.ylabel('distance fallen (metres)')
plt.show()
```

一个窗口打开，显示 $s$ 的图像：即图 1.5 中的曲线，但没有其割线。关闭窗口以完成。
:::

```check
for hh in (Rational(1, 10), Rational(1, 100), Rational(1, 1000)):
    same(Rational(98, 10) + Rational(49, 10)*hh, (Rational(49, 10)*(1 + hh)**2 - Rational(49, 10))/hh)
same([Rational(98, 10) + Rational(49, 10)*hh for hh in (Rational(1, 10), Rational(1, 100), Rational(1, 1000))], [Rational(1029, 100), Rational(9849, 1000), Rational(98049, 10000)])
```

## 本模块小结 {#summary}

- 微积分研究量变化的快慢（切线问题，导致导数）以及累积的总量（面积问题，导致积分）；两者都通过极限来解答。
- 一个函数将其定义域中的每个输入对应到恰好一个输出；值域是所有输出的集合。区间如 $[0, 2]$ 和 $(-\infty, 2) \cup (2, \infty)$ 描述定义域和值域。
- 一个公式的定义域排除除以零、负数的偶次根以及非正数的对数；模型可能进一步限制定义域。
- $f$ 的图像是一组点 $(x, f(x))$；没有垂直直线与之相交两次。分段函数在定义域的不同部分使用不同的公式，边界处用实心点和空心点表示。
- 目录：线性函数（恒定变化率 $m$），幂函数和多项式，有理函数，根函数，指数函数 $a^x$ 和 $e^x$ 与 $e \approx 2.71828$，对数函数以 $\ln$ 为底，是 $e^x$ 的反函数，以及三角函数，由单位圆以弧度定义。
- 对于 $c > 0$，$f(x - c)$ 将图像向右平移 $c$ 个单位，并且 $f(x) + c$ 将其向上平移 $c$ 个单位；对于 $c > 1$，$c\,f(x)$ 垂直拉伸它，$f(cx)$ 水平压缩它。$(f \circ g)(x) = f\big(g(x)\big)$ 首先应用 $g$。单射的函数有反函数，其图像在 $y = x$ 中是镜像的。
- 平均变化率 $\big(f(b) - f(a)\big)/(b - a)$ 是割线的斜率，而差商 $\big(f(a + h) - f(a)\big)/h$ 是在长度为 $h$ 的区间上的平均变化率。当 $h$ 趋近于零时，它趋近于瞬时变化率：极限（模块 2）和导数（模块 4）的基本思想。
- SymPy (`symbols`, `subs`, `expand`, `factor`, `simplify`, `N`, `lambdify`), NumPy 和 matplotlib 检查并探索所有这些内容；浮点运算在最后几位是近似的。

```check
rounds(E, '2.71828')
```

## 练习 {#exercises}

:::: exercise 区间表示法的定义域 {#ex-1-1} ★
找出每个函数的定义域，并用区间表示法写出。

- (a) $f(x) = \sqrt{5 - 2x}$
- (b) $g(x) = \dfrac{1}{x^2 - 9}$
- (c) $h(x) = \dfrac{\ln(x + 4)}{x}$

::: solution
**(a)** 平方根需要 $5 - 2x \ge 0$，也就是说，$2x \le 5$，也就是说，$x \le \tfrac52$。定义域是 $\big(-\infty, \tfrac52\big]$，包含 $\tfrac52$ 是因为 $\sqrt0 = 0$。

**(b)** 分母不能为零。当 $x^2 = 9$ 时，$x^2 - 9 = 0$，即在 $x = 3$ 或 $x = -3$ 处。定义域为 $(-\infty, -3) \cup (-3, 3) \cup (3, \infty)$。常见错误是漏掉 $x = -3$，因为 $x^2 = 9$ 有两个解。

**(c)** 两个条件。对数需要 $x + 4 > 0$，即 $x > -4$；除法需要 $x \ne 0$。定义域是 $(-4, 0) \cup (0, \infty)$。$-4$ 被排除，因为 $\ln 0$ 没有定义。

```check
same(solve_univariate_inequality(5 - 2*x >= 0, x, relational=False), Interval(-oo, Rational(5, 2)))
same(continuous_domain(sqrt(5 - 2*x), x, R), Interval(-oo, Rational(5, 2)))
same_set(solve(x**2 - 9, x), [3, -3])
same(continuous_domain(1/(x**2 - 9), x, R), Union(Interval.open(-oo, -3), Interval.open(-3, 3), Interval.open(3, oo)))
same(continuous_domain(log(x + 4)/x, x, R), Union(Interval.open(-4, 0), Interval.open(0, oo)))
```
:::
::::

:::: exercise 阅读分段函数 {#ex-1-2} ★
设

$$f(x) = \begin{cases} 2x + 1 & \text{if } x \le 1, \\ x^2 - 1 & \text{if } x > 1. \end{cases}$$

- (a) 求 $f(-2)$，$f(1)$，$f(2)$ 和 $f(3)$。
- (b) 解 $f(x) = 3$。
- (c) 描述在 $x = 1$ 附近的图像：哪里有实心点，哪里有空心点？

::: solution
**(a)** 首先确定分段。$-2 \le 1$，因此 $f(-2) = 2(-2) + 1 = -3$。$1 \le 1$，因此 $f(1) = 2 + 1 = 3$。$2 > 1$，因此 $f(2) = 4 - 1 = 3$。$3 > 1$，因此 $f(3) = 9 - 1 = 8$。

**(b)** 在每一个分段分别求解，再只保留属于该分段的解。第一段中，$2x + 1 = 3$ 给出 $x = 1$，而且 $1 \le 1$，因此是有效解。第二段中，$x^2 - 1 = 3$ 给出 $x = 2$ 或 $x = -2$，但只有 $x = 2$ 满足 $x > 1$（事实上 $f(-2) = -3$）。所以解为 $x = 1$ 和 $x = 2$。

**(c)** 直线 $y = 2x + 1$ 在 $(1, 3)$ 处结束，该点在图上：实心点。在 $x = 1$ 右侧，图沿着抛物线 $y = x^2 - 1$ 进行，该抛物线朝向 $(1, 0)$；该点不在图上：空心点。图在 $x = 1$ 处跳下。

```check
fe = Piecewise((2*x + 1, x <= 1), (x**2 - 1, True))
same([fe.subs(x, v) for v in (-2, 1, 2, 3)], [-3, 3, 3, 8])
same(solve(Eq(2*x + 1, 3), x), [1]); same_set(solve(Eq(x**2 - 1, 3), x), [2, -2])
same_set([v for v in (1, 2, -2) if fe.subs(x, v) == 3], [1, 2])
same((x**2 - 1).subs(x, 1), 0)
```
:::
::::

:::: exercise 弧度和精确值 {#ex-1-3} ★
- (a) 将 $225^\circ$ 和 $-60^\circ$ 转换为弧度，并将 $5\pi/6$ 转换为度数。
- (b) 找出 $\sin\theta$ 和 $\cos\theta$ 在 $\theta = 3\pi/4$、$7\pi/6$ 和 $-\pi/3$ 的精确值。

::: solution
**(a)** 将度数乘以 $\pi/180$：

$$\begin{aligned} 225 \cdot \frac{\pi}{180} &= \frac{5\pi}{4}, \\ -60 \cdot \frac{\pi}{180} &= -\frac{\pi}{3}. \end{aligned}$$

要转换回去，乘以 $180/\pi$：

$$\frac{5\pi}{6} \cdot \frac{180}{\pi} = 150^\circ.$$

**(b)** 利用常用角的取值和圆的对称性。

- $3\pi/4 = \pi - \pi/4$，$\pi/4$ 关于 $y$ 轴的镜像：
  $$\begin{aligned} \sin\frac{3\pi}{4} &= \sin\frac{\pi}{4} = \frac{\sqrt2}{2}, \\ \cos\frac{3\pi}{4} &= -\cos\frac{\pi}{4} = -\frac{\sqrt2}{2}. \end{aligned}$$
- $7\pi/6 = \pi + \pi/6$，$\pi/6$ 关于原点的反射：
  $$\begin{aligned} \sin\frac{7\pi}{6} &= -\sin\frac{\pi}{6} = -\frac12, \\ \cos\frac{7\pi}{6} &= -\cos\frac{\pi}{6} = -\frac{\sqrt3}{2}. \end{aligned}$$
- $-\pi/3$ 是 $\pi/3$ 关于 $x$ 轴的镜像：
  $$\begin{aligned} \sin\Big(-\frac{\pi}{3}\Big) &= -\sin\frac{\pi}{3} \\ &= -\frac{\sqrt3}{2}, \\ \cos\Big(-\frac{\pi}{3}\Big) &= \cos\frac{\pi}{3} = \frac12. \end{aligned}$$

```check
same(225*pi/180, 5*pi/4); same(-60*pi/180, -pi/3); same(5*pi/6*180/pi, 150)
same(sin(3*pi/4), sqrt(2)/2); same(cos(3*pi/4), -sqrt(2)/2)
same(sin(7*pi/6), -Rational(1, 2)); same(cos(7*pi/6), -sqrt(3)/2)
same(sin(-pi/3), -sqrt(3)/2); same(cos(-pi/3), Rational(1, 2))
same(3*pi/4, pi - pi/4); same(7*pi/6, pi + pi/6)
```
:::
::::

:::: exercise 对数与指数 {#ex-1-4} ★
不使用计算器，求：

- (a) $\log_3 81$
- (b) $\log_{10} 0.001$
- (c) $\ln\big(e^5\big)$
- (d) $e^{\ln 7}$
- (e) $\ln 12 - \ln 3 + \ln 2$，写成一个对数形式。

然后 (f) 解 $e^{2x} = 7$，给出精确答案及其三位小数近似值。

::: solution
**(a)** $3^4 = 81$，因此 $\log_3 81 = 4$。

**(b)** $0.001 = 10^{-3}$，因此 $\log_{10} 0.001 = -3$。

**(c)** $\ln$ 撤销 $e^x$：$\ln\big(e^5\big) = 5$。

**(d)** $e^x$ 撤销 $\ln$，对于正输入：$e^{\ln 7} = 7$。

**(e)** 由对数运算法则得 $\ln 12 - \ln 3 = \ln\dfrac{12}{3} = \ln 4$，且 $\ln 4 + \ln 2 = \ln 8$。由于 $8 = 2^3$，结果也可以写为 $3\ln 2$。

**(f)** 对两边取 $\ln$：$\ln\big(e^{2x}\big) = 2x$，因此 $2x = \ln 7$ 并且
$$x = \frac{\ln 7}{2} \approx 0.973.$$
检查：$e^{2 \cdot 0.973} = e^{1.946} \approx 7.00$。

```check
same(3**4, 81); same(log(81, 3), 4); same(log(Rational(1, 1000), 10), -3); same(log(exp(5)), 5); same(exp(log(7)), 7)
same(log(12) - log(3) + log(2), log(8)); same(log(8), 3*log(2))
xs = solve(Eq(exp(2*symbols('x', real=True)), 7))
same(xs, [log(7)/2]); rounds(log(7)/2, '0.973')
same(2*Rational(973, 1000), Rational(1946, 1000)); rounds(exp(Rational(1946, 1000)), '7.00')
```
:::
::::

:::: exercise 对平方根进行变换 {#ex-1-5} ★★
从函数 $y = \sqrt x$ 的图像开始。

- (a) 将它向左平移 3 个单位，然后垂直拉伸 2 倍，再向下平移 1 个单位，写出变换后的图像公式。
- (b) 找出新函数的定义域和值域。
- (c) 它的图像在哪个点与 $x$ 轴相交？

用第 1.5 节的函数探索器检查你的答案。

::: solution
**(a)** 向左平移 3 个单位将 $x$ 替换为 $x + 3$：$y = \sqrt{x + 3}$。垂直拉伸 2 倍将输出乘以 2：$y = 2\sqrt{x + 3}$。向下平移 1 个单位则减去 1：
$$y = 2\sqrt{x + 3} - 1.$$

**(b)** 平方根需要 $x + 3 \ge 0$，因此定义域是 $[-3, \infty)$。当 $x$ 遍历 $[-3, \infty)$ 时，$x + 3$ 遍历 $[0, \infty)$，因此 $\sqrt{x + 3}$ 取 $[0, \infty)$ 中的每一个值；乘以 2 保持 $[0, \infty)$，减去 1 得到 $[-1, \infty)$。值域是 $[-1, \infty)$：图像的起始点 $(0, 0)$ 移动到了 $(-3, -1)$。

**(c)** 解 $2\sqrt{x + 3} - 1 = 0$：$\sqrt{x + 3} = \tfrac12$，因此 $x + 3 = \tfrac14$（两边平方）和 $x = -\tfrac{11}{4} = -2.75$。平方可能会引入假解，因此检查：$2\sqrt{0.25} - 1 = 2 \cdot 0.5 - 1 = 0$。

在探索者中：$f(x) = \sqrt x$，$a = 2$，$c = -3$，$d = -1$。

```check
g5 = 2*sqrt(x + 3) - 1
same(g5, 2*sqrt(x).subs(x, x + 3) - 1)
same(continuous_domain(g5, x, R), Interval(-3, oo)); same(function_range(g5, x, Interval(-3, oo)), Interval(-1, oo))
same(g5.subs(x, -3), -1)
same(solve(Eq(g5, 0), x), [-Rational(11, 4)]); same(-Rational(11, 4), -Rational(275, 100))
same(g5.subs(x, -Rational(11, 4)), 0)
```
:::
::::

:::: exercise 复合与定义域 {#ex-1-6} ★★
设 $f(x) = \dfrac{1}{x}$ 和 $g(x) = x^2 - 4$。找出每个复合函数及其定义域：

- (a) $f \circ g$
- (b) $g \circ f$
- (c) $f \circ f$

::: solution
**(a)** $(f \circ g)(x) = f(x^2 - 4) = \dfrac{1}{x^2 - 4}$。$g$ 接受每一个 $x$，而 $f$ 需要其输入 $x^2 - 4$ 不为零，因此 $x \ne 2$ 和 $x \ne -2$。定义域是 $(-\infty, -2) \cup (-2, 2) \cup (2, \infty)$。

**(b)** $(g \circ f)(x) = g\Big(\dfrac1x\Big) = \dfrac{1}{x^2} - 4$。$f$ 要求 $x \ne 0$，而 $g$ 可接受任何输入，因此定义域为 $(-\infty, 0) \cup (0, \infty)$。

**(c)** $(f \circ f)(x) = f\Big(\dfrac1x\Big) = \dfrac{1}{1/x} = x$，但只在 $x \ne 0$ 时成立。$f(0)$ 无定义，所以 $f\big(f(0)\big)$ 也无定义。定义域是 $(-\infty, 0) \cup (0, \infty)$，而非 $\R$。常见错误是从化简后的公式 $x$ 直接读出 $\R$；实际上应由组成它的各个函数来确定定义域。（在定义域上，$f$ 两次作用相互抵消，故 $f$ 是自己的反函数。）

```check
f6, g6 = 1/x, x**2 - 4
same(f6.subs(x, g6), 1/(x**2 - 4)); same(g6.subs(x, f6), 1/x**2 - 4); same(f6.subs(x, f6), x)
same(continuous_domain(1/(x**2 - 4), x, R), Union(Interval.open(-oo, -2), Interval.open(-2, 2), Interval.open(2, oo)))
same(continuous_domain(1/x**2 - 4, x, R), Union(Interval.open(-oo, 0), Interval.open(0, oo)))
same(continuous_domain(f6, x, R), Union(Interval.open(-oo, 0), Interval.open(0, oo)))
```
:::
::::

:::: exercise 用对数表示反函数 {#ex-1-7} ★★
设 $f(x) = e^{x - 1} + 2$。

- (a) 求 $f$ 的定义域和值域。
- (b) 证明 $f$ 是单射的，并求 $f^{-1}(x)$。
- (c) 写出 $f^{-1}$ 的定义域和值域，并验证 $f\big(f^{-1}(x)\big) = x$。

::: solution
**(a)** 对每个 $x$，$e^{x - 1}$ 都有定义，因此定义域为 $\R$。当 $x$ 遍历 $\R$ 时，$x - 1$ 也遍历同一集合，$e^{x-1}$ 恰好取遍所有正数（每个 $v > 0$ 都可在 $u = \ln v$ 时写为 $e^u$）。于是 $e^{x - 1} + 2$ 取遍所有大于 2 的值，故值域为 $(2, \infty)$。

**(b)** 写出 $y = e^{x - 1} + 2$ 并解出 $x$。减去 2：$y - 2 = e^{x - 1}$。对于 $y$ 在范围内的值，$y - 2 > 0$，因此你可以对两边取 $\ln$：$\ln(y - 2) = x - 1$，并且
$$x = 1 + \ln(y - 2).$$
每个 $y$ 在范围内的值都恰好来自这一个 $x$，因此 $f$ 是单射的。将 $y$ 重命名为 $x$：$f^{-1}(x) = 1 + \ln(x - 2)$。

**(c)** $f^{-1}$ 的定义域是 $f$ 的值域，$(2, \infty)$；这正是 $\ln(x - 2)$ 被定义的地方。$f^{-1}$ 的值域是 $f$ 的定义域，$\R$。检查对于 $x > 2$：
$$\begin{aligned} f\big(f^{-1}(x)\big) &= e^{(1 + \ln(x - 2)) - 1} + 2 \\ &= e^{\ln(x - 2)} + 2 \\ &= (x - 2) + 2 = x. \end{aligned}$$

```check
f7 = exp(x - 1) + 2
same(function_range(f7, x, R), Interval.open(2, oo))
yb = symbols('y', real=True)
same(solve(Eq(yb, f7), x), [1 + log(yb - 2)])
xg = symbols('x', positive=True)
xg2 = xg + 2                       # an x greater than 2
finv7 = 1 + log(xg2 - 2)
steps(f7.subs(x, finv7), exp(log(xg2 - 2)) + 2, (xg2 - 2) + 2, xg2)
same(continuous_domain(1 + log(x - 2), x, R), Interval.open(2, oo))
same(function_range(1 + log(x - 2), x, Interval.open(2, oo)), S.Reals)
```
:::
::::

:::: exercise 立方体的平均变化率 {#ex-1-8} ★★
设 $f(x) = x^3$。

- (a) 求 $f$ 在 $[1, 2]$ 上的平均变化率，在 $[1, 1.1]$ 上的平均变化率，在 $[1, 1.01]$ 上的平均变化率。
- (b) 简化差商 $\dfrac{f(1 + h) - f(1)}{h}$，对于 $h \ne 0$。
- (c) 当 $h$ 趋近于零时，平均变化率趋近于什么数？

::: solution
**(a)** 使用 $\dfrac{f(b) - f(a)}{b - a}$：
$$\begin{aligned} \frac{8 - 1}{2 - 1} &= 7, \\ \frac{1.331 - 1}{0.1} &= 3.31, \\ \frac{1.030301 - 1}{0.01} &= 3.0301. \end{aligned}$$

**(b)** 展开 $(1 + h)^3$：首先 $(1 + h)^2 = 1 + 2h + h^2$，然后乘以 $1 + h$ 并合并同类项，得到 $(1 + h)^3 = 1 + 3h + 3h^2 + h^3$。因此
$$\begin{aligned} \frac{f(1 + h) - f(1)}{h} &= \frac{3h + 3h^2 + h^3}{h} \\ &= 3 + 3h + h^2 \qquad (h \ne 0). \end{aligned}$$
这与 (a) 一致：$h = 1$，0.1 和 0.01 分别得到 7，3.31 和 3.0301。

**(c)** 当 $h$ 趋近于零时，$3h$ 和 $h^2$ 都趋近于零，因此平均变化率趋近于 3。这是曲线 $y = x^3$ 在点 $(1, 1)$ 处的瞬时变化率，即该点的斜率。

```check
fc8 = lambda X: sympify(X)**3
same((fc8(2) - fc8(1))/1, 7)
same(fc8(Rational(11, 10)), Rational(1331, 1000)); same((fc8(Rational(11, 10)) - 1)/Rational(1, 10), Rational(331, 100))
same(fc8(Rational(101, 100)), Rational(1030301, 1000000)); same((fc8(Rational(101, 100)) - 1)/Rational(1, 100), Rational(30301, 10000))
same(expand((1 + h)**3), 1 + 3*h + 3*h**2 + h**3)
steps((fc8(1 + h) - fc8(1))/h, (3*h + 3*h**2 + h**3)/h, 3 + 3*h + h**2)
same([(3 + 3*h + h**2).subs(h, v) for v in (1, Rational(1, 10), Rational(1, 100))], [7, Rational(331, 100), Rational(30301, 10000)])
limit_is((fc8(1 + h) - fc8(1))/h, h, 0, 3)                                 # (c): the average rates approach 3
```
:::
::::

:::: exercise 1/x 的差商 {#ex-1-9} ★★
设 $f(x) = \dfrac1x$，并且设 $a \ne 0$。

- (a) 证明，对于 $h \ne 0$ 与 $a + h \ne 0$，
  $$\frac{f(a + h) - f(a)}{h} = -\frac{1}{a(a + h)}.$$
- (b) 评估它在 $a = 2$ 为 $h = 0.1$ 和 $h = -0.1$ 时的值，保留四位小数。
- (c) 当 $h$ 趋近于零时，它趋于什么？为什么是负数？

::: solution
**(a)** 将两个分数通分到公分母 $a(a + h)$：
$$\begin{aligned} f(a + h) - f(a) &= \frac{1}{a + h} - \frac1a \\ &= \frac{a - (a + h)}{a(a + h)} \\ &= \frac{-h}{a(a + h)}. \end{aligned}$$
除以 $h$（允许这样做，因为 $h \ne 0$）得到 $-\dfrac{1}{a(a + h)}$。

**(b)** 对于 $a = 2$ 和 $h = 0.1$，

$$-\frac{1}{2 \cdot 2.1} = -\frac{1}{4.2} \approx -0.2381,$$

并且对于 $h = -0.1$，

$$-\frac{1}{2 \cdot 1.9} = -\frac{1}{3.8} \approx -0.2632.$$

**(c)** 当 $h$ 变小时，$a + h$ 趋近 $a$，所以差商趋近 $-\dfrac{1}{a^2}$；对于 $a = 2$，这个值为 $-\tfrac14 = -0.25$，在 (b) 的两个值之间。只要 $a$ 与 $a + h$ 在零的同一侧，差商就为负。一旦 $\abs{h} < \abs{a}$，两者就在同一侧，此时 $a(a + h) > 0$。这是因为 $1/x$ 在零的两侧各自递减，输入增大时输出减小，故 $\Delta y$ 与 $\Delta x$ 异号。如果跨越零点，则不成立。例如，对于 $a = 2$ 和 $h = -3$，差商为 $-\dfrac{1}{2 \cdot (-1)} = \tfrac12$。

```check
steps((1/(a + h) - 1/a), (a - (a + h))/(a*(a + h)), -h/(a*(a + h)))
same((1/(a + h) - 1/a)/h, -1/(a*(a + h)))
q9 = lambda hv: -1/(2*(2 + hv))
same(q9(Rational(1, 10)), -1/Rational(42, 10)); rounds(q9(Rational(1, 10)), '-0.2381')
same(q9(-Rational(1, 10)), -1/Rational(38, 10)); rounds(q9(-Rational(1, 10)), '-0.2632')
same((-1/(a*(a + h))).subs(h, 0), -1/a**2); same(-1/Integer(2)**2, -Rational(1, 4))
holds(q9(Rational(1, 10)) > -Rational(1, 4)); holds(-Rational(1, 4) > q9(-Rational(1, 10)))
limit_is(-1/(a*(a + h)), h, 0, -1/a**2)
ap9, bp9 = symbols('a b', positive=True); an9, bn9 = symbols('a b', negative=True)   # b = a + h
holds((-1/(ap9*bp9)).is_negative); holds((-1/(an9*bn9)).is_negative)                # same side of 0: negative
same(q9(-3), Rational(1, 2)); same((1/(2 + h) - Rational(1, 2))/h, q9(h))   # across 0: a = 2, h = -3
```
:::
::::

:::: exercise 递增函数是单射的 {#ex-1-10} ★★★
如果对函数 $f$ 定义域中任意的 $x_1$ 和 $x_2$，由 $x_1 < x_2$ 都能推出 $f(x_1) < f(x_2)$，则称该函数**严格递增**。

- (a) 证明严格递增函数是单射的。
- (b) 证明其反函数也是严格递增的。
- (c) 显示 $f(x) = x^3 + x$ 在 $\R$ 上是严格递增的，因此存在反函数。（提示：$x_2^3 - x_1^3 = (x_2 - x_1)\big(x_2^2 + x_1 x_2 + x_1^2\big)$。）

::: solution
**(a)** 取定义域中的 $x_1 \ne x_2$，编号使得 $x_1 < x_2$。因为 $f$ 严格递增，故 $f(x_1) < f(x_2)$，特别地，$f(x_1) \ne f(x_2)$。不同的输入给出不同的输出，因此 $f$ 是单射的。

**(b)** 根据 (a)，$f$ 有反函数。取 $f$ 的值域中的 $y_1 < y_2$，令 $x_1 = f^{-1}(y_1)$、$x_2 = f^{-1}(y_2)$，于是 $f(x_1) = y_1$、$f(x_2) = y_2$。若 $x_1 = x_2$，则 $y_1 = y_2$；若 $x_2 < x_1$，则 $f(x_2) < f(x_1)$，即 $y_2 < y_1$。两种情形都与 $y_1 < y_2$ 矛盾，因此 $x_1 < x_2$，即 $f^{-1}$ 严格递增。

**(c)** 令 $x_1 < x_2$。由提示可得
$$\begin{aligned} &f(x_2) - f(x_1) \\ &\quad= \big(x_2^3 - x_1^3\big) + (x_2 - x_1) \\ &\quad= (x_2 - x_1)\big(x_2^2 + x_1 x_2 + x_1^2 + 1\big). \end{aligned}$$
第一个因子是正的。对于第二个因子，完成平方：
$$x_2^2 + x_1 x_2 + x_1^2 = \Big(x_2 + \frac{x_1}{2}\Big)^2 + \frac34 x_1^2 \ge 0,$$
所以第二个因子至少为 1。两个正数的乘积是正数，因此 $f(x_1) < f(x_2)$: $f$ 是严格递增的。根据 (a)，它有一个反函数，而根据 (b)，这个反函数也是严格递增的。对于 $f^{-1}$ 的一个公式意味着解三次方程 $x^3 + x = y$，但反函数仍然存在，定理 1.2 给出了它的图像。

```check
x1, x2 = symbols('x1 x2', real=True)
same(expand(x2**3 - x1**3), expand((x2 - x1)*(x2**2 + x1*x2 + x1**2)))
same(expand((x2**3 + x2) - (x1**3 + x1)), expand((x2 - x1)*(x2**2 + x1*x2 + x1**2 + 1)))
same(expand((x2 + x1/2)**2 + Rational(3, 4)*x1**2), x2**2 + x1*x2 + x1**2)
holds(((x2 + x1/2)**2 + Rational(3, 4)*x1**2).is_nonnegative)          # for all real x1, x2
```
:::
::::

:::: exercise 二次函数的对称区间 {#ex-1-11} ★★★
设 $f(x) = px^2 + qx + r$，其中 $p$、$q$ 和 $r$ 是常数。

- (a) 证明 $f$ 在 $[a - h, a + h]$ 上，对于 $h > 0$，平均变化率是 $2pa + q$，无论 $h$ 的值如何。
- (b) (a) 说明了图像上点 $a - h$ 和 $a + h$ 处的割线，以及 $f$ 在 $a$ 处的瞬时变化率有什么说法？
- (c) 对于下落的球，$s(t) = 4.9t^2$，在 $[0.5, 1.5]$ 和 $[0.9, 1.1]$ 上求平均速度，不计算 $s$ 的任何值。并与第 1.6 节进行比较。

::: solution
**(a)** 区间长度为 $\Delta x = (a + h) - (a - h) = 2h$。对于 $f$ 的变化，将项分组如下：
$$\begin{aligned} &f(a + h) - f(a - h) \\ &\quad= p\big[(a + h)^2 - (a - h)^2\big] \\ &\qquad + q\big[(a + h) - (a - h)\big] + (r - r). \end{aligned}$$
展开 $(a + h)^2 - (a - h)^2 = (a^2 + 2ah + h^2) - (a^2 - 2ah + h^2) = 4ah$，并 $(a + h) - (a - h) = 2h$。因此 $f(a + h) - f(a - h) = 4pah + 2qh$，并且
$$\begin{aligned} \frac{f(a + h) - f(a - h)}{2h} &= \frac{4pah + 2qh}{2h} \\ &= 2pa + q. \end{aligned}$$
$h$ 完全抵消：对于每个 $h > 0$，答案相同。

**(b)** 所有这些割线都有相同的斜率 $2pa + q$，因此它们是平行的，无论区间多宽。当 $h$ 缩小时，平均变化率保持为 $2pa + q$，因此它趋近于这个数值：$f$ 在 $a$ 处的瞬时变化率为 $2pa + q$。第 1.6 节中的差商也一致：$f(a + h) - f(a) = p(2ah + h^2) + qh$，因此差商为 $2pa + q + ph$，当 $h$ 缩小时也趋近于 $2pa + q$。

**(c)** 这里有 $p = 4.9$ 与 $q = r = 0$。在 $h = 0.5$ 和 $h = 0.1$ 的取值下，两个区间都以 $a = 1$ 为中心，因此各自的平均速度都是 $2 \cdot 4.9 \cdot 1 = 9.8$ m/s，恰好等于第 1.6 节求出的瞬时速度。第 1.6 节中，从 $t = 1$ 开始或结束的区间所给的平均速度只能趋近 9.8。模块 4 将中心区间用于其他函数，得到中心差分，结果通常很准确，但一般并非精确值。

```check
pq, qq_, rq = symbols('p q r')
fq2 = lambda X: pq*X**2 + qq_*X + rq
same((a + h) - (a - h), 2*h)
same(expand((a + h)**2 - (a - h)**2), 4*a*h)
same(expand(fq2(a + h) - fq2(a - h)), 4*pq*a*h + 2*qq_*h)
steps((fq2(a + h) - fq2(a - h))/(2*h), (4*pq*a*h + 2*qq_*h)/(2*h), 2*pq*a + qq_)
same(expand(fq2(a + h) - fq2(a)), expand(pq*(2*a*h + h**2) + qq_*h))   # (b): the one-sided quotient
steps((fq2(a + h) - fq2(a))/h, 2*pq*a + qq_ + pq*h); limit_is(2*pq*a + qq_ + pq*h, h, 0, 2*pq*a + qq_)
sq2 = lambda T: Rational(49, 10)*sympify(T)**2
same((sq2(Rational(3, 2)) - sq2(Rational(1, 2)))/1, Rational(98, 10))
same((sq2(Rational(11, 10)) - sq2(Rational(9, 10)))/Rational(2, 10), Rational(98, 10))
same(2*Rational(49, 10)*1, Rational(98, 10))
```
:::
::::

## 自测 {#quiz}

```quiz
? $f(x) = \dfrac{\sqrt{x - 3}}{x - 5}$ 的定义域是
- [ ] $(3, 5) \cup (5, \infty)$
- [ ] $[3, \infty)$
- [x] $[3, 5) \cup (5, \infty)$
- [ ] $(-\infty, 5) \cup (5, \infty)$
> 平方根需要 $x \ge 3$（3 本身也是允许的，因为 $\sqrt0 = 0$），分母需要 $x \ne 5$。$[3, \infty)$ 忘记了 $x = 5$ 会使分母为 0；$(3, 5) \cup (5, \infty)$ 错误地遗漏了 3。

? 如果 $f(x) = x^2$ 和 $g(x) = x + 1$，那么 $(f \circ g)(x)$ 是
- [ ] $x^2 + 1$
- [x] $(x + 1)^2$
- [ ] $x^2 + x$
- [ ] $2x + 1$
> $f \circ g$ 首先应用 $g$：$f\big(g(x)\big) = f(x + 1) = (x + 1)^2$。答案 $x^2 + 1$ 是 $(g \circ f)(x)$，另一种顺序。

? $y = f(x + 2) - 1$ 的图像为 $y = f(x)$ 的图像平移
- [ ] 向右平移 2 个单位，向下平移 1 个单位
- [ ] 向左平移 2 个单位，向上平移 1 个单位
- [ ] 向右平移 2 个单位，向上平移 1 个单位
- [x] 2个单位向左和1个单位向下
> 在$f$内部，$x + 2$将图像向左移动2个单位：值$f(0)$现在在$x = -2$处达到。在外部减去1$f$，使其向下移动1个单位。

? $\cos\dfrac{2\pi}{3}$等于
- [x] $-\dfrac12$
- [ ] $\dfrac12$
- [ ] $\dfrac{\sqrt3}{2}$
- [ ] $-\dfrac{\sqrt3}{2}$
> $\dfrac{2\pi}{3} = \pi - \dfrac{\pi}{3}$，且角度为$\pi - \theta$的点是$y$轴上$\theta$点的镜像，因此$\cos\dfrac{2\pi}{3} = -\cos\dfrac{\pi}{3} = -\dfrac12$。角度为$120^\circ$，位于$y$轴左侧，其中$x$坐标为负。

? 对于$x > 0$，$\ln\big(x^3\big) - \ln x$等于
- [ ] $\ln\big(x^3 - x\big)$
- [ ] $3$
- [x] $2\ln x$
- [ ] $(\ln x)^2$
> $\ln\big(x^3\big) - \ln x = \ln\dfrac{x^3}{x} = \ln\big(x^2\big) = 2\ln x$，根据对数的第二和第三法则。$\ln\big(x^3 - x\big)$是一个不同的数：这些法则涉及乘积、商和幂，而不是差。

? 如果$f(x) = 3x - 6$，那么$f^{-1}(x)$等于
- [ ] $\dfrac{1}{3x - 6}$
- [x] $\dfrac{x}{3} + 2$
- [ ] $3x + 6$
- [ ] $\dfrac{x}{3} - 2$
> 解$y = 3x - 6$求$x$：$x = \dfrac{y + 6}{3} = \dfrac{y}{3} + 2$，然后将$y$重命名为$x$。$\dfrac{1}{3x - 6}$是$\dfrac{1}{f(x)}$，不是反函数。检查：$f(4) = 6$，且$\dfrac63 + 2 = 4$。

? $f(x) = x^2$在$[2, 5]$上的平均变化率是
- [x] $7$
- [ ] $21$
- [ ] $3$
- [ ] $14.5$
> $\dfrac{f(5) - f(2)}{5 - 2} = \dfrac{25 - 4}{3} = \dfrac{21}{3} = 7$. 21 是 $f$ 单独的变化量，不是除以 $x$ 的变化量，3 是 $x$ 单独的变化量；14.5 是 $f(2)$ 和 $f(5)$ 的平均值，是不同的概念。

? 对于 $f(x) = x^2$ 和 $h \ne 0$，差商 $\dfrac{f(3 + h) - f(3)}{h}$ 可以简化为
- [ ] $h$
- [ ] $6$
- [ ] $9 + h$
- [x] $6 + h$
> $(3 + h)^2 - 9 = 9 + 6h + h^2 - 9 = 6h + h^2$，除以 $h$ 得到 $6 + h$。当 $h$ 趋近于零时，它趋近于 6，但对于允许的 $h$ 永远不等于 6。答案 $h$ 来源于将 $f(3 + h)$ 写成 $9 + h^2$ 并丢弃中间项 $6h$。
```

```check
same(continuous_domain(sqrt(x - 3)/(x - 5), x, R), Union(Interval.Ropen(3, 5), Interval.open(5, oo)))
same((x**2).subs(x, x + 1), (x + 1)**2); same((x + 1).subs(x, x**2), x**2 + 1)
same(cos(2*pi/3), -Rational(1, 2)); same(2*pi/3*180/pi, 120)
xq = symbols('x', positive=True)
same(expand_log(log(xq**3) - log(xq)), 2*log(xq))
same(solve(Eq(y, 3*x - 6), x), [y/3 + 2]); same((3*x - 6).subs(x, 4), 6); same(Rational(6, 3) + 2, 4)
same(Rational(5**2 - 2**2, 5 - 2), 7); same(Rational(5**2 + 2**2, 2), Rational(29, 2))
same(cancel(((3 + h)**2 - 9)/h), 6 + h); same(((9 + h**2) - 9)/h, h)
```
