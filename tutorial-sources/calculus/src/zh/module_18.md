---
title: 多元函数的优化
part: 5
lead: 求二元和多元函数的极值。你将用海森矩阵判别临界点，在有界闭区域上寻找全局最值，用拉格朗日乘数法处理约束，并用最小二乘法拟合直线。你还会看到各方向的曲率相差较大时，梯度下降为何呈锯齿状前进。
minutes: 270
needs: 模块8（一元优化）和模块16、17（向量、偏导数和梯度）；二次近似使用模块15中的泰勒多项式，一个可选的证明使用同一模块中的泰勒定理。
goals:
  - 找出二元函数的临界点，并使用二阶导数检验对其进行分类。
  - 求连续函数在闭合有界区域上的绝对最大值和最小值。
  - 用拉格朗日乘数法解决带约束的优化问题，并用等高线解释该方法。
  - 用最小二乘法拟合数据，从偏导数推导出正规方程。
  - 解释步长和等高线形状如何决定梯度下降法是否收敛以及收敛速度。
---

## 局部极值和临界点 {#critical-points}

想象一个二元函数作为地形：在地图上的点 $(x, y)$ 处，地面高度为 $z = f(x, y)$，而等高线 $f(x, y) = c$ 是地图上的等高线（模块 17）。三种地方脚下是平坦的：山峰顶部、洼地底部，以及山口，即山脊的最低点和穿过山脊的路径的最高点。本模块寻找这些点并加以区分。然后它寻找函数在区域上的极值，对约束条件下的最优化问题进行求解，拟合数据线，并研究梯度下降法，这是一种用于训练机器学习模型的方法，用于寻找山谷底部。除非另有说明，否则 $f$ 是一个二元函数；大多数思想可以推广到更多变量的情况。

::: definition 局部极值与全局极值
设 $f$ 是一个定义域为 $D$ 的二元函数，且 $(a, b)$ 是 $D$ 的一点。

- 若对 $D$ 中的每一点 $(x, y)$ 都有 $f(a, b) \ge f(x, y)$，则称 $f(a, b)$ 为 $f$ 的**全局最大值**。若对 $D$ 中的每一点 $(x, y)$ 都有 $f(a, b) \le f(x, y)$，则称为**全局最小值**。
- 若存在以 $(a, b)$ 为圆心且包含在 $D$ 中的开圆盘，使其中每一点 $(x, y)$ 都满足 $f(a, b) \ge f(x, y)$，则称 $f(a, b)$ 为 $f$ 的**局部极大值**。若存在这样的开圆盘，使其中每一点 $(x, y)$ 都满足 $f(a, b) \le f(x, y)$，则称为**局部极小值**。

半径为 $r > 0$ 且以 $(a, b)$ 为中心的 **开圆盘** 是指所有满足 $(x, y)$ 的点 $(x - a)^2 + (y - b)^2 < r^2$ 的集合，即距离 $(a, b)$ 小于 $r$ 的点。
:::

这些是 **极值**，或 **极值**。"局部" 意味着 "与每一个邻近点相比，在每一个方向上"，因此定义域边缘的点永远不会是局部极值，如模块 8 所述。

::: theorem 二元函数的费马定理
如果 $f$ 在 $(a, b)$ 处有局部最大值或局部最小值，并且 $f$ 在 $(a, b)$ 处的一阶偏导数存在，则

$$f_x(a, b) = 0 \quad\text{and}\quad f_y(a, b) = 0,$$

即， $\nabla f(a, b) = \vb{0}$。
:::

::: proof
假设 $f(a, b)$ 是一个局部最大值：$f(x, y) \le f(a, b)$ 在以 $(a, b)$ 为中心、半径为 $r$ 的开圆盘内，且该圆盘位于定义域内。沿通过 $(a, b)$ 的水平线行走：由于这些点 $(x, b)$ 位于该圆盘内，且 $g(x) \le g(a)$ 有定义，因此 $g(x) = f(x, b)$ 在 $\abs{x - a} < r$ 处有定义。所以 $g$ 在 $a$ 处有一个局部最大值。该点的导数为 $g'(a) = f_x(a, b)$，它存在，因为偏导数是沿此类直线的普通导数（模块 17）。根据一元函数的费马定理（[定理 8.1](module_08_ZH.html#extrema)），$g'(a) = 0$，即 $f_x(a, b) = 0$。通过 $(a, b)$ 的垂直线，$h(y) = f(a, y)$，同样可以得到 $f_y(a, b) = 0$。最后，$f$ 的局部最小值是 $-f$ 的局部最大值。
:::

几何上：当局部极值点 $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$ 有切平面时（模块 17），该平面是水平的， $z = f(a, b)$。

::: definition 临界点
在 $f$ 的定义域内，若点 $(a, b)$ 处有 $\nabla f(a, b) = \vb{0}$，即 $f_x(a, b) = f_y(a, b) = 0$，或者 $f_x$ 或 $f_y$ 不存在，则该点为**临界点**。
:::

换言之，定理18.1指出：**每个局部极值点都是临界点。** 与单变量情形一样，逆命题不成立。最简单的例子是$f(x, y) = x^2 - y^2$。其梯度$\nabla f = \langle 2x, -2y\rangle$仅在原点处为$\vb{0}$，此时$f(0, 0) = 0$。沿两条坐标轴穿过原点：

```valuetable
t = -1, -0.5, -0.1, 0, 0.1, 0.5, 1
$f(t, 0) = t^2$ = t**2
$f(0, t) = -t^2$ = -t**2
---
t | f(t, 0) = t^2 | f(0, t) = -t^2
-1 | 1 | -1
-0.5 | 0.25 | -0.25
-0.1 | 0.01 | -0.01
0 | 0 | 0
0.1 | 0.01 | -0.01
0.5 | 0.25 | -0.25
1 | 1 | -1
```

沿$x$轴原点是最低点；沿$y$轴它是最高点。因此，原点的每个邻域都包含$f > 0$的点和$f < 0$的点，且$f(0, 0) = 0$既不是局部最大值也不是局部最小值。曲面呈马鞍形或山隘形（图18.1）。

```check
fs = x**2 - y**2
same(diff(fs, x), 2*x); same(diff(fs, y), -2*y)
same(solve([2*x, -2*y], [x, y], dict=True), [{x: 0, y: 0}])
same(fs.subs(y, 0), x**2); same(fs.subs(x, 0), -y**2)
holds(fs.subs({x: Rational(1, 10), y: 0}) > 0); holds(fs.subs({x: 0, y: Rational(1, 10)}) < 0)
```

::: figure id=fig-18-1
左：曲面 $z = x^2 - y^2$。沿 $x$ 轴，它遵循抛物线 $z = x^2$（绿色），在原点处最低；沿 $y$ 轴，它遵循 $z = -y^2$（橙色），在原点处最高。右：其等高线 $x^2 - y^2 = c$ 是双曲线，绿色对应 $c = 1, 2, 3$，橙色对应 $c = -1, -2, -3$；等高线 $c = 0$ 是一对虚线 $y = \pm x$，在鞍点处相交。
:::

::: definition 鞍点
若函数 $f$ 在其定义域内部（即存在以该点为中心的开圆盘完全包含在定义域内）的一个临界点 $(a, b)$ 是一个 **鞍点**，当且仅当 $f$ 在该点既无局部最大值也无局部最小值：每个以 $(a, b)$ 为中心的开圆盘内，都包含定义域内使 $f(x, y) > f(a, b)$ 取得极大值的点和使 $f(x, y) < f(a, b)$ 取得极小值的点。
:::

常见的等高线图像是围绕山峰或洼地的小闭合曲线，以及在鞍点处交叉的等高线，如图 18.1 中的线条 $y = \pm x$。这些图像仅作为参考，而非定义：鞍点的等高线未必交叉，如例 18.3 中的 $x^2 + y^3 = 0$ 所示。

::: example 立方函数的临界点
求 $f(x, y) = x^3 + y^3 - 3xy$ 的临界点。

$f$ 是一个多项式，因此其偏导数在所有点处都存在，临界点是 $\nabla f = \vb{0}$ 的解：

$$f_x = 3x^2 - 3y = 0, \qquad f_y = 3y^2 - 3x = 0.$$

第一个方程表示 $y = x^2$，第二个方程表示 $x = y^2$。将第一个方程代入第二个方程： $x = (x^2)^2 = x^4$，即，

$$x^4 - x = x(x^3 - 1) = x(x - 1)(x^2 + x + 1) = 0.$$

二次因子没有实数零点，因为其判别式为 $1 - 4 = -3 < 0$。因此 $x = 0$ 或 $x = 1$，且 $y = x^2$ 给出两个临界点 $(0, 0)$ 和 $(1, 1)$。检查第二个： $f_x(1, 1) = 3 - 3 = 0$ 和 $f_y(1, 1) = 3 - 3 = 0$。

```check
f181 = x**3 + y**3 - 3*x*y
same(diff(f181, x), 3*x**2 - 3*y); same(diff(f181, y), 3*y**2 - 3*x)
steps(x**4 - x, x*(x**3 - 1), x*(x - 1)*(x**2 + x + 1)); same(discriminant(x**2 + x + 1, x), -3)
xr_, yr_ = symbols('x y', real=True)
f181r = f181.subs({x: xr_, y: yr_})
same_set(solve([diff(f181r, xr_), diff(f181r, yr_)], [xr_, yr_], dict=True), [{xr_: 0, yr_: 0}, {xr_: 1, yr_: 1}])
same(diff(f181, x).subs({x: 1, y: 1}), 0); same(diff(f181, y).subs({x: 1, y: 1}), 0)
```
:::

::: pitfall
处理临界点时常见三种错误。**把所有临界点当作极值点。**原点是 $x^2 - y^2$ 的临界点，但它是鞍点。**漏掉偏导数不存在的点。**圆锥 $f(x, y) = \sqrt{x^2 + y^2}$ 在原点处取得全局最小值 0，而 $f_x$ 在那里不存在，因为 $\big(f(h, 0) - f(0, 0)\big)/h = \abs{h}/h$ 在 $h > 0$ 时为 1，在 $h < 0$ 时为 $-1$。**除法导致漏解。**把 $x = x^4$ 两边同除以 $x$，得到 $x^3 = 1$，却漏掉了 $x = 0$，即临界点 $(0, 0)$。采用因式分解可以保留这个解。
:::

```check
hr = symbols('h', real=True)
same(sqrt(hr**2 + 0**2), Abs(hr)); limit_is(Abs(h)/h, h, 0, 1, '+'); limit_is(Abs(h)/h, h, 0, -1, '-')
holds(0 in solve(x**4 - x, x)); holds(0 not in solve(x**3 - 1, x))
```

## 二阶导数判别法 {#second-derivative-test}

模块 8 通过 $f''(c)$ 的符号来区分峰值和谷值。在两个变量的情况下，测试使用所有三个二阶偏导数，原因是二次近似。

**二次近似。** 设 $f$ 在 $(a, b)$ 附近具有连续的二阶偏导数，并考虑从 $(a, b)$ 向 $(a + h, b + k)$ 的直线上的 $f$： $g(t) = f(a + th, b + tk)$。根据模块 17 的链式法则， $g'(t) = f_x h + f_y k$，再次求导并应用克莱因定理 $f_{yx} = f_{xy}$，

$$g''(t) = f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2,$$

其中偏导数是在 $(a + th, b + tk)$ 处取得的。 $g$ 在 0 处的二阶泰勒多项式（模块 15），在 $t = 1$ 处计算得到

$$\begin{aligned} &f(a + h, b + k) \\ &\quad\approx f(a, b) + f_x h + f_y k \\ &\qquad + \tfrac12\big(f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2\big), \end{aligned}$$

现在每个偏导数都在 $(a, b)$ 处取得。前三个项是模块 17 的线性近似。在临界点 $f_x = f_y = 0$ 处，因此在 $(a, b)$ 附近

$$\begin{gathered} f(a + h, b + k) - f(a, b) \approx \tfrac12\,Q(h, k), \\ Q(h, k) = Ah^2 + 2Bhk + Ck^2, \end{gathered}$$

其中 $A = f_{xx}(a, b)$, $B = f_{xy}(a, b)$ 和 $C = f_{yy}(a, b)$。在临界点附近，图像看起来像二次函数 $Q$ 的图像，因此问题变为：何时 $Q(h, k)$ 为正，何时为负，何时两者都有？

```check
fF = Function('f'); hh_, kk_ = symbols('h k')
gF = fF(a + t*hh_, b + t*kk_)
same(diff(gF, t).subs(t, 0), hh_*Subs(Derivative(fF(x, b), x), x, a) + kk_*Subs(Derivative(fF(a, y), y), y, b))
fpoly = x**3*y + 2*x*y**2 - y + 5                     # an instance: g'' is the quadratic in h and k
gp = fpoly.subs({x: a + t*hh_, y: b + t*kk_})
same(diff(gp, t, 2).subs(t, 0), (diff(fpoly, x, 2)*hh_**2 + 2*diff(fpoly, x, y)*hh_*kk_ + diff(fpoly, y, 2)*kk_**2).subs({x: a, y: b}))
same(diff(gp, t, 2), (diff(fpoly, x, 2)*hh_**2 + 2*diff(fpoly, x, y)*hh_*kk_ + diff(fpoly, y, 2)*kk_**2).subs({x: a + t*hh_, y: b + t*kk_}))
```

**二次函数的符号。** 若 $A \ne 0$，完成平方：

$$\begin{aligned} &Ah^2 + 2Bhk + Ck^2 \\ &\quad= A\Big(h + \frac{B}{A}k\Big)^2 + \frac{AC - B^2}{A}\,k^2. \end{aligned}$$

- 若 $AC - B^2 > 0$，两个项的符号都与 $A$ 相同，且只有当 $k = 0$ 时两者都为 0，此时 $h = 0$。因此 $Q(h, k)$ 在所有 $(h, k) \ne (0, 0)$ 处的符号与 $A$ 相同：若 $A > 0$，则为碗形；若 $A < 0$，则为穹顶形。
- 如果 $AC - B^2 < 0$，则 $Q(1, 0) = A$，而在直线 $h = -\tfrac{B}{A}k$ 上，第一项消失且 $Q$ 符号相反： $Q$ 可以取正负两种符号，如同一个鞍点。（如果 $A = 0$ 和 $B \ne 0$， $Q = k(2Bh + Ck)$ 也可以取正负两种符号。）
- 如果 $AC - B^2 = 0$， $Q$ 在穿过原点的一条整线上为 0，而二次型无法决定。

三个模型分别是 $h^2 + k^2$（一个碗形）、 $-h^2 - k^2$（一个穹顶）和 $h^2 - k^2$（图 18.1 中的鞍点）。二次型 $2hk$，包含 $A = C = 0$ 和 $B = 1$，是同一个鞍点绕 $45^\circ$ 旋转得到的：当包含 $h = (u - v)/\sqrt2$ 和 $k = (u + v)/\sqrt2$ 时，它变为 $u^2 - v^2$。

```check
A_, B_, C_ = symbols('A B C')
same(A_*(hh_ + B_/A_*kk_)**2 + (A_*C_ - B_**2)/A_*kk_**2, A_*hh_**2 + 2*B_*hh_*kk_ + C_*kk_**2)
same((A_*hh_**2 + 2*B_*hh_*kk_ + C_*kk_**2).subs({hh_: 1, kk_: 0}), A_)
same((A_*hh_**2 + 2*B_*hh_*kk_ + C_*kk_**2).subs(hh_, -B_/A_*kk_), (A_*C_ - B_**2)/A_*kk_**2)
same((2*B_*hh_*kk_ + C_*kk_**2), kk_*(2*B_*hh_ + C_*kk_))
same((2*B_*hh_*kk_ + C_*kk_**2).subs({hh_: (1 - C_)/(2*B_), kk_: 1}), 1)
same((2*B_*hh_*kk_ + C_*kk_**2).subs({hh_: (-1 - C_)/(2*B_), kk_: 1}), -1)
same((2*hh_*kk_).subs({hh_: (u - v)/sqrt(2), kk_: (u + v)/sqrt(2)}), u**2 - v**2)
```

::: definition 海森矩阵及其行列式
函数 $f$ 在点 $(a, b)$ 处的 **海森矩阵** 是其在该点的二阶偏导数所组成的方阵，

$$H = \begin{pmatrix} f_{xx} & f_{xy} \\ f_{yx} & f_{yy} \end{pmatrix},$$

当 $f_{yx} = f_{xy}$ 时，它的**行列式**为

$$D = f_{xx}f_{yy} - f_{xy}^2.$$

（一个矩形数字数组称为 **矩阵**；一个二阶矩阵 $\begin{pmatrix} p & q \\ r & s \end{pmatrix}$ 的行列式是 $ps - qr$。）
:::

$D$ 是 completed square 的 $AC - B^2$。数学基础研究矩阵，其在 [线性代数模块](../math/module_10_ZH.html)，并在 [其[模块 13](../math/module_13_ZH.html) 中研究了这种测试背后在任意变量数中的二次型。

::: theorem 二阶导数判别法
设 $f$ 的二阶偏导数在以 $(a, b)$ 为中心的开圆盘上连续，且 $f_x(a, b) = 0$、$f_y(a, b) = 0$。令 $D = f_{xx}(a, b)f_{yy}(a, b) - f_{xy}(a, b)^2$。

- 若 $D > 0$ 且 $f_{xx}(a, b) > 0$，则 $f(a, b)$ 为局部最小值。
- 若 $D > 0$ 且 $f_{xx}(a, b) < 0$，则 $f(a, b)$ 为局部最大值。
- 若 $D < 0$，则 $(a, b)$ 为鞍点。
- 若 $D = 0$，则不能用这个判别法得出结论。
:::

当 $D > 0$ 时，$f_{xx}f_{yy} > f_{xy}^2 \ge 0$，所以 $f_{xx}$ 与 $f_{yy}$ 同号，用任意一个的符号都可判定。二阶偏导数的连续性保证二次式 $Q$ 可以描述 $f$ 在 $(a, b)$ 附近的行为。下文的证明指出这个条件用在何处。

:::: deeper 为什么二阶导数测试有效
初读时可跳过此证明。取 $(h, k) \ne (0, 0)$ 足够小，使得从 $(a, b)$ 到 $(a + h, b + k)$ 的线段位于圆盘内，并令 $g(t) = f(a + th, b + tk)$ 对应于 $0 \le t \le 1$，如上所述。由于二阶偏导数连续，$f_x$ 和 $f_y$ 可微，因此链式法则可应用两次，得到 $g''(t) = f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2$ 及其在 $(a + th, b + tk)$ 处的偏导数。带有 $n = 1$ 的泰勒定理（模块 15）给出 $g(1) = g(0) + g'(0) + \tfrac12g''(c)$，其中 $c$ 是介于 0 和 1 之间的某个值。由于 $g'(0) = f_x(a, b)h + f_y(a, b)k = 0$，

$$\begin{aligned} &f(a + h, b + k) - f(a, b) \\ &\quad= \tfrac12\big(f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2\big), \end{aligned} \tag{$*$}$$

在 $(a + ch, b + ck)$ 处的偏导数。

**极小值。** 假设在 $(a, b)$ 处有 $D > 0$ 和 $f_{xx} > 0$。函数 $f_{xx}$ 和 $f_{xx}f_{yy} - f_{xy}^2$ 连续，且在 $(a, b)$ 处都为正，故它们在以 $(a, b)$ 为圆心的某个更小的圆盘中仍为正。若 $(a + h, b + k)$ 在这个圆盘中，则 $(a + ch, b + ck)$ 也在其中。在后一处，配方法表明 $(*)$ 中括号内的量为正。所以对每个这样的 $(h, k) \ne (0, 0)$ 都有 $f(a + h, b + k) > f(a, b)$，从而取得局部极小值。**极大值。** 将这一论证应用于 $-f$。

**鞍点.** 假设 $D < 0$ 在 $(a, b)$ 处. 完全平方给出方向 $(h_1, k_1)$ 和 $(h_2, k_2)$，其中 $Q(h_1, k_1) > 0$ 和 $Q(h_2, k_2) < 0$ 是在 $(a, b)$ 处的二阶偏导数。将 $(h, k) = (sh_1, sk_1)$ 代入 $(*)$：则 $f(a + sh_1, b + sk_1) - f(a, b) = \tfrac12s^2\big(f_{xx}h_1^2 + 2f_{xy}h_1k_1 + f_{yy}k_1^2\big)$ 在 $(a, b)$ 和 $(a + sh_1, b + sk_1)$ 之间的点处。当 $s \to 0$ 该点趋近于 $(a, b)$ 时，由于连续性，括号内的表达式趋近于 $Q(h_1, k_1) > 0$；因此 $f > f(a, b)$ 在点 $(a + sh_1, b + sk_1)$ 处，且 $s \ne 0$ 很小。同样地， $f < f(a, b)$ 在点 $(a + sh_2, b + sk_2)$ 处，且 $s \ne 0$ 很小。每个以 $(a, b)$ 为中心的圆盘都包含这两种类型的点：一个鞍点。 **不确定.** 例 18.3 展示了三个函数 $D = 0$：一个极小值点，以及两个鞍点。
::::

::: example 分类立方函数的临界点
分类函数 $f(x, y) = x^3 + y^3 - 3xy$ 的临界点 $(0, 0)$ 和 $(1, 1)$（例 18.1），并判断 $f$ 是否有绝对极值。

二阶偏导数为 $f_{xx} = 6x$、$f_{xy} = -3$ 和 $f_{yy} = 6y$，全部连续，因此

$$D = (6x)(6y) - (-3)^2 = 36xy - 9.$$

- 在 $(0, 0)$: $D = -9 < 0$，一个鞍点。你可以直接看出：沿 $y = x$ 直线，$f(t, t) = 2t^3 - 3t^2 = t^2(2t - 3) < 0$ 在 $t \ne 0$ 接近 0 时成立，而沿 $y = -x$，$f(t, -t) = 3t^2 > 0$。
- 在 $(1, 1)$: $D = 36 - 9 = 27 > 0$ 和 $f_{xx} = 6 > 0$，因此 $f(1, 1) = 1 + 1 - 3 = -1$ 是一个局部最小值。

局部极小值并非绝对值：沿$x$轴$f(x, 0) = x^3$，当$x \to -\infty$时趋于$-\infty$，当$x \to \infty$时趋于$\infty$。因此$f$既无绝对最小值也无绝对最大值。图18.2显示了等高线：围绕$(1, 1)$的小闭合环，以及在对鞍点处自交的等高线$f = 0$。

```check
H181 = hessian(f181, (x, y))
same(H181, Matrix([[6*x, -3], [-3, 6*y]])); same(H181.det(), 36*x*y - 9)
same(H181.det().subs({x: 0, y: 0}), -9); same(H181.det().subs({x: 1, y: 1}), 27); same(H181[0, 0].subs(x, 1), 6)
same(f181.subs({x: 1, y: 1}), -1); same(1 + 1 - 3, -1)
steps(f181.subs(y, x), 2*x**3 - 3*x**2, x**2*(2*x - 3)); same(f181.subs(y, -x), 3*x**2)
holds(f181.subs({x: Rational(1, 10), y: Rational(1, 10)}) < 0); holds(f181.subs({x: Rational(-1, 10), y: Rational(-1, 10)}) < 0)
same(f181.subs(y, 0), x**3); limit_is(x**3, x, -oo, -oo); limit_is(x**3, x, oo, oo)
```
:::

::: figure id=fig-18-2
$f(x, y) = x^3 + y^3 - 3xy$的等高线。在$(1, 1)$处的局部极小值附近，等高线$f = -0.8$和$f = -0.4$（蓝色）为闭合曲线；穿过原点处鞍点的等高线$f = 0$（紫色）在此处自交。虚线正方形和点属于例18.4：它们标记了$f$在正方形上的绝对极值的候选点。
:::

::: example 当 $D = 0$ 时
证明 $f_1 = x^2 + y^4$、$f_2 = x^2 - y^4$ 和 $f_3 = x^2 + y^3$ 各自恰好有一个临界点，即原点，并且在原点处 $D = 0$，并判断每个函数在原点处的性质。

梯度为$\langle 2x, 4y^3\rangle$、$\langle 2x, -4y^3\rangle$和$\langle 2x, 3y^2\rangle$，它们在$(0, 0)$处仅取$\vb{0}$。在原点处，三者分别取$f_{xx} = 2$、$f_{xy} = 0$和$f_{yy} = 0$（即$12y^2$、$-12y^2$和$6y$），因此$D = 2 \cdot 0 - 0^2 = 0$：该判别法无法得出结论，你必须考察$f$本身。

- $f_1(x, y) = x^2 + y^4 \ge 0 = f_1(0, 0)$：一个绝对最小值。
- $f_2(x, 0) = x^2 > 0$ 对于 $x \ne 0$ 而言，但 $f_2(0, y) = -y^4 < 0$ 对于 $y \ne 0$ 而言：一个鞍点。
- $f_3(0, y) = y^3$ 对于 $y > 0$ 为正，对于 $y < 0$ 为负：一个鞍点，尽管 $f_{xx} > 0$ 且没有方向使 $Q = 2h^2$ 为负。其零水平曲线 $x^2 = -y^3$ 在原点处有一个尖点，而非交叉。

```check
for fz in (x**2 + y**4, x**2 - y**4, x**2 + y**3):
    same(solve([diff(fz, x), diff(fz, y)], [x, y], dict=True), [{x: 0, y: 0}])
    Hz = hessian(fz, (x, y)).subs({x: 0, y: 0})
    same(Hz, Matrix([[2, 0], [0, 0]])); same(Hz.det(), 0)
same([diff(fz, y, 2) for fz in (x**2 + y**4, x**2 - y**4, x**2 + y**3)], [12*y**2, -12*y**2, 6*y])
same([[diff(fz, s_) for s_ in (x, y)] for fz in (x**2 + y**4, x**2 - y**4, x**2 + y**3)], [[2*x, 4*y**3], [2*x, -4*y**3], [2*x, 3*y**2]])
holds(xr_**2 + yr_**4 >= 0)
same((x**2 + y**3).subs({x: t**3, y: -t**2}), 0)       # the zero level curve is a cusp
holds((x**2 - y**4).subs({x: Rational(1, 10), y: 0}) > 0); holds((x**2 - y**4).subs({x: 0, y: Rational(1, 10)}) < 0)
holds((x**2 + y**3).subs({x: 0, y: Rational(1, 10)}) > 0); holds((x**2 + y**3).subs({x: 0, y: -Rational(1, 10)}) < 0)
```
:::

::: pitfall
三张试卷。**阅读 $f_{xx}$ 当 $D < 0$**：则该点为鞍点，无论 $f_{xx}$ 的符号如何。**仅检查 $f_{xx}$ 和 $f_{yy}$**：$f(x, y) = x^2 + 3xy + y^2$ 在其临界点 $(0, 0)$ 处有 $f_{xx} = f_{yy} = 2 > 0$，但 $D = 4 - 9 = -5 < 0$，实际上 $f(t, -t) = -t^2 < 0$：混合项 $3xy$ 沿着直线 $y = -x$ 起主导作用。**将 $D = 0$ 视为鞍点**：这意味着仅测试结果不明确（例 18.3）。
:::

```check
fq_ = x**2 + 3*x*y + y**2
same(hessian(fq_, (x, y)), Matrix([[2, 3], [3, 2]])); same(hessian(fq_, (x, y)).det(), -5); same(fq_.subs(y, -x), -x**2)
same(solve([diff(fq_, x), diff(fq_, y)], [x, y], dict=True), [{x: 0, y: 0}])
```

::: compute 使用 SymPy 分类临界点
`sp.hessian` 构造 Hessian 矩阵，且 `solve` 通过方程列表解方程组 $\nabla f = \vb{0}$。声明符号为实数，以便仅返回实数解：

```python
import sympy as sp
x, y = sp.symbols('x y', real=True)
f = x**3 + y**3 - 3*x*y
crit = sp.solve([sp.diff(f, x), sp.diff(f, y)], [x, y], dict=True)
H = sp.hessian(f, (x, y))
print(crit)
print(H, ' D =', H.det())
```

```output
[{x: 0, y: 0}, {x: 1, y: 1}]
Matrix([[6*x, -3], [-3, 6*y]])  D = 36*x*y - 9
```

测试本身包含三项比较：

```python
def classify(D, fxx):
    if D > 0:
        return 'local minimum' if fxx > 0 else 'local maximum'
    if D < 0:
        return 'saddle point'
    return 'inconclusive'

for p in crit:
    D, fxx = H.det().subs(p), H[0, 0].subs(p)
    print(p, ' D =', D, ' f_xx =', fxx, ':', classify(D, fxx), ' f =', f.subs(p))
```

```output
{x: 0, y: 0}  D = -9  f_xx = 0 : saddle point  f = 0
{x: 1, y: 1}  D = 27  f_xx = 6 : local minimum  f = -1
```

不使用 `real=True`，`solve` 也会返回 $x$ 为 1 的两个复数立方根之一（即 $x^2 + x + 1$ 的零点），这些点在平面地图上无对应位置：

```python
u, v = sp.symbols('u v')                  # no assumptions
g = u**3 + v**3 - 3*u*v
print(len(sp.solve([sp.diff(g, u), sp.diff(g, v)], [u, v], dict=True)), 'solutions')
```

```output
4 solutions
```
:::

## 闭合有界区域上的绝对极值 {#absolute-extrema}

模块 8 找到一个连续函数在闭区间上的绝对极值 $[a, b]$ 通过比较其在临界点和两个端点处的值。在两个变量的情况下，区间变为一个区域，我们必须检查其整个边界，通常由曲线组成。

::: definition 内部、边界、闭集和有界集
设 $R$ 是平面上的点集。若存在以 $P$ 为圆心并完全包含在 $R$ 中的开圆盘，则点 $P$ 是 $R$ 的**内点**。若以 $P$ 为圆心的每个开圆盘都既含 $R$ 内的点又含 $R$ 外的点，则它是 $R$ 的**边界点**。若集合 $R$ 包含其全部边界点，则它是**闭集**；若它包含在某个圆盘中，则称其**有界**。
:::

圆盘 $x^2 + y^2 \le 1$ 是闭合且有界的；它的边界是圆 $x^2 + y^2 = 1$。开圆盘 $x^2 + y^2 < 1$ 是有界的但不是闭合的，因为它不包含整个圆。包含边界的矩形，即点集 $a \le x \le b$ 和 $c \le y \le d$，是闭合且有界的，包含边界的三角形也是如此。半平面 $y \ge 0$ 是闭合的但不是有界的。

::: theorem 二元函数的极值定理
若 $f$ 在平面中的非空闭有界集合 $R$ 上连续，则 $f$ 在 $R$ 上分别于 $R$ 中的某点 $(x_1, y_1)$ 与 $(x_2, y_2)$ 取得全局最大值 $f(x_1, y_1)$ 和全局最小值 $f(x_2, y_2)$。
:::

关于单变量定理[模块 3](module_03_ZH.html#evt)，其证明属于实分析，本系列直接使用该定理而不加证明；该定理在三个或更多变量中也成立。每个假设都是必要的。在开圆盘$x^2 + y^2 < 1$上，$f(x, y) = x + y$没有最大值：在缺失圆周上的点$\big(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}\big)$附近，其值可以任意接近$\sqrt2$，但永远无法达到。在半平面$y \ge 0$上，相同的$f$是无界的。而在闭圆盘上，在$\big(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}\big)$处为0、其余部分等于$x + y$的函数不连续且没有最大值。

```check
same(2*(x**2 + y**2) - (x + y)**2, (x - y)**2)                  # so x + y < sqrt(2) inside the open disc
same((x + y).subs({x: 1/sqrt(2), y: 1/sqrt(2)}), sqrt(2)); same((1/sqrt(2))**2 + (1/sqrt(2))**2, 1)
same((x**2 + y**2).subs({x: t/sqrt(2), y: t/sqrt(2)}), t**2)
same((x + y).subs({x: t/sqrt(2), y: t/sqrt(2)}), sqrt(2)*t); limit_is(sqrt(2)*t, t, 1, sqrt(2), '-')
limit_is((x + y).subs(y, 0), x, oo, oo)              # unbounded on the closed half-plane
```

::: theorem 全局最大值和最小值在何处取得
设 $f$ 在非空闭有界集合 $R$ 上连续，则 $f$ 在 $R$ 上取得全局最大值和全局最小值。每个值都在 $R$ 的某个边界点，或在 $R$ 内部的一个 $f$ 的临界点取得。
:::

::: proof
由定理18.3，$R$上的绝对最大值为$f(P)$，对应于$R$中的某点$P$。若$P$为边界点，则无需证明。否则$P$为内点：存在以$P$为中心的某开圆盘包含于$R$中，且$f(P) \ge f$在该圆盘上成立，因此$f(P)$为局部最大值。若在$P$处两个偏导数均存在，则由定理18.1知它们为0；否则，按定义$P$为临界点。最小值情形同理。
:::

::: keyidea
**闭区域法。** 为在非空、闭合、有界的区域 $R$ 上连续函数 $f$ 求绝对极值：

1. 找出 $f$ 在 $R$ 内的临界点，并计算 $f$ 在这些点处的值。
2. 求 $f$ 在 $R$ 的边界上的最大值和最小值。通常边界由若干部分组成（如多边形的边、曲线的弧段），在每一部分上 $f$ 都可以表示为一个变量的函数：代入边的方程，如 $y = 2$，或曲线的参数化，如 $(\cos t, \sin t)$ 在圆上，然后使用 [模块 8](module_08_ZH.html#closed-interval)] 中的闭区间方法，考虑每一部分的端点。
3. 所有这些值中的最大值是绝对最大值；最小值是绝对最小值。
:::

与一元函数类似，无需对临界点进行检验：只需比较一组数值。

::: example 正方形上的极值
求 $f(x, y) = x^3 + y^3 - 3xy$ 在点 $-1 \le x \le 2$ 和 $-1 \le y \le 2$ 的正方形 $R$ 上的绝对最大值和最小值。

$f$ 是多项式，因此连续，而正方形是闭合且有界的：极值存在（定理 18.3）。

**Step 1: inside.** 关键点是 $(0, 0)$ 和 $(1, 1)$（例 18.1），都在正方形内部，具有 $f(0, 0) = 0$ 和 $f(1, 1) = -1$。鞍点与其他临界点一样，是候选点：该方法比较值，不进行分类。

**Step 2: the boundary.** 正方形有四条边。由于 $f(x, y) = f(y, x)$，底边 $y = -1$ 的行为类似于左边 $x = -1$，顶边 $y = 2$ 的行为类似于右边 $x = 2$，且 $x$ 和 $y$ 互换。

- 左边， $x = -1$ 和 $-1 \le y \le 2$: $f(-1, y) = y^3 + 3y - 1$。其导数 $3y^2 + 3$ 为正，因此函数递增，极值出现在端点： $f(-1, -1) = -5$ 和 $f(-1, 2) = 13$。
- 右边， $x = 2$ 和 $-1 \le y \le 2$: $f(2, y) = y^3 - 6y + 8$。其导数 $3y^2 - 6$ 在 $y = \pm\sqrt2$ 处为 0，且仅有 $\sqrt2$ 位于 $[-1, 2]$ 内。函数值为 $f(2, \sqrt2) = 2\sqrt2 - 6\sqrt2 + 8 = 8 - 4\sqrt2 \approx 2.343$，在端点处为 $f(2, -1) = -1 + 6 + 8 = 13$ 和 $f(2, 2) = 8 - 12 + 8 = 4$。
- 由对称性，底边与顶边：$-5$ 对应 $(-1, -1)$，$13$ 对应 $(2, -1)$；$8 - 4\sqrt2$ 对应 $(\sqrt2, 2)$，$13$ 对应 $(-1, 2)$，$4$ 对应 $(2, 2)$。

**步骤 3：比较。**

| 点 | 它的来源 | $f$ |
|---|---|---|
| $(0, 0)$ | 临界点，鞍点 | $0$ |
| $(1, 1)$ | 临界点，局部最小值 | $-1$ |
| $(2, \sqrt2)$, $(\sqrt2, 2)$ | $f$ 在边上的临界点 | $8 - 4\sqrt2 \approx 2.343$ |
| $(-1, -1)$ | 尖角 | $-5$ |
| $(2, -1)$, $(-1, 2)$ | 角点 | $13$ |
| $(2, 2)$ | 尖角 | $4$ |

绝对最大值是 13，在 $(2, -1)$ 和 $(-1, 2)$ 处取得；绝对最小值是 $-5$，在角点 $(-1, -1)$ 处取得。所有三个都是角点，而边 $(1, 1)$ 处的局部最小值不是该正方形上的绝对最小值（图 18.2）。

```check
same(f181.subs({x: y, y: x}, simultaneous=True), f181)
fL = f181.subs(x, -1); fR = f181.subs(x, 2)
same(expand(fL), y**3 + 3*y - 1); same(diff(fL, y), 3*y**2 + 3); holds(minimum(3*y**2 + 3, y, S.Reals) > 0)
same(minimum(fL, y, Interval(-1, 2)), -5); same(maximum(fL, y, Interval(-1, 2)), 13)
same(expand(fR), y**3 - 6*y + 8); same(diff(fR, y), 3*y**2 - 6); same_set(solve(3*y**2 - 6, y), [sqrt(2), -sqrt(2)])
holds(-sqrt(2) < -1); holds(sqrt(2) < 2)
steps(fR.subs(y, sqrt(2)), 2*sqrt(2) - 6*sqrt(2) + 8, 8 - 4*sqrt(2)); rounds(8 - 4*sqrt(2), '2.343')
same(minimum(fR, y, Interval(-1, 2)), 8 - 4*sqrt(2)); same(maximum(fR, y, Interval(-1, 2)), 13)
for (px, py), val in {(0, 0): 0, (1, 1): -1, (-1, -1): -5, (2, -1): 13, (-1, 2): 13, (2, 2): 4}.items():
    same(f181.subs({x: px, y: py}), val)
same(-1 + 6 + 8, 13); same(8 - 12 + 8, 4)
holds(max(0, -1, 8 - 4*sqrt(2), -5, 13, 4) == 13); holds(min(0, -1, 8 - 4*sqrt(2), -5, 13, 4) == -5)
```
:::

::: pitfall
三张卡片。 **忽略边界端点**：在例 18.4 中，两个极值都在角落，导数无法找到。 **分类而非比较**：局部最小值 $-1$ 并不是正方形上的最小值，而鞍点也可能是候选点。 **保留区域外的点**： $y = -\sqrt2$ 解决 $3y^2 - 6 = 0$，但 $(2, -\sqrt2)$ 不在正方形内。
:::

## 拉格朗日乘子法 {#lagrange}

许多问题要求找出曲线或曲面上的最佳点：如能放入椭圆内的最大矩形、曲线上离给定点最近的点、给定纸板量时体积最大的盒子。它们的变量由一个方程 $g(x, y) = c$，即 **约束条件** 联系。第 18.3 节对边界进行了参数化；当参数化容易找到时，这种方法有效。本节的方法直接使用方程本身，其图示解释了每一个答案。

取椭圆 $\tfrac{x^2}{4} + y^2 = 1$ 内最大的矩形，其边与坐标轴平行。我们可以将其中心置于原点：将任何这样的矩形移动到原点，不会增大或保持其四个角点的绝对 $x$ 坐标和绝对 $y$ 坐标的最大值，因此它仍然适合且面积相同。然后将其放大，直到其四个角点接触椭圆。因此我们可以将角点取为 $(\pm x, \pm y)$，其中 $(x, y)$ 在椭圆上， $x \ge 0$ 和 $y \ge 0$，其面积为 $A = (2x)(2y) = 4xy$。先处理数值。点 $(2\cos t, \sin t)$ 在椭圆上，因为 $\tfrac{4\cos^2 t}{4} + \sin^2 t = 1$，而 $0 \le t \le \tfrac{\pi}{2}$ 表示第一象限中的四分之一部分：

```valuetable
t = 0, pi/12, pi/6, pi/4, pi/3, 5*pi/12, pi/2
$x = 2\cos t$ = 2*cos(t)
$y = \sin t$ = sin(t)
$A = 4xy$ = 8*cos(t)*sin(t)
digits = 4
---
t | x = 2\cos t | y = \sin t | A = 4xy
0 | 2 | 0 | 0
\frac{\pi}{12} | 1.932 | 0.2588 | 2
\frac{\pi}{6} | 1.732 | 0.5 | 3.464
\frac{\pi}{4} | 1.414 | 0.7071 | 4
\frac{\pi}{3} | 1 | 0.8660 | 3.464
\frac{5 \pi}{12} | 0.5176 | 0.9659 | 2
\frac{\pi}{2} | 0 | 1 | 0
```

表中最大的面积是 4，出现在 $t = \tfrac{\pi}{4}$，即点 $\big(\sqrt2, \tfrac{\sqrt2}{2}\big) \approx (1.414, 0.7071)$。事实上 $A = 8\cos t\sin t = 4\sin 2t$，其最大值为 4。

```check
half_x, half_y = symbols('half_x half_y', positive=True)
off_x, off_y = symbols('off_x off_y', nonnegative=True)
holds((off_x + half_x)**2/4 + (off_y + half_y)**2 - half_x**2/4 - half_y**2 >= 0)  # recentering preserves feasibility
same((2*cos(t))**2/4 + sin(t)**2, 1); same(8*cos(t)*sin(t), 4*sin(2*t)); same(4*sin(2*(pi/4)), 4)
same(2*cos(pi/4), sqrt(2)); same(sin(pi/4), sqrt(2)/2); rounds(sqrt(2), '1.414'); rounds(sqrt(2)/2, '0.7071')
same(maximum(4*sin(2*t), t, Interval(0, pi/2)), 4)
```

看图 18.3。在 $k > 0$ 时，面积的等值线 $4xy = k$ 是双曲线。当 $0 < k < 4$ 时，等值线与四分之一椭圆有两个交点，表示椭圆内有两个矩形能达到该面积。随着 $k$ 增大并趋向 4，两个交点越来越近。在 $k = 4$ 时，两点合为一点，等值线与椭圆**相切**。当 $k > 4$ 时，它与椭圆没有交点。两条曲线在切点处有共同的切线，因此各自的垂直方向平行。可微函数的梯度在非零处与该点的等值线垂直（模块 17），而椭圆是函数 $g(x, y) = \tfrac{x^2}{4} + y^2$ 的等值线 $g = 1$。最优点处两个梯度均非零，故 $\nabla A$ 与 $\nabla g$ 平行，也就是说 $\nabla A = \lambda\nabla g$，其中 $\lambda$ 是一个数，读作「兰姆达」。

::: figure id=fig-18-3
椭圆 $\tfrac{x^2}{4} + y^2 = 1$（绿色）和面积 $A = 4xy$ 的等值曲线 $A = 2$、$4$ 和 $6$。等值曲线 $A = 4$（橙色）在点 $\big(\sqrt2, \tfrac{\sqrt2}{2}\big)$ 处与椭圆相切，该点是最大矩形（阴影部分）的角；在该点，向量 $\nabla A$ 和 $\nabla g$ 指向相同方向，且 $\nabla A$ 的长度是它们的四倍（两个箭头均以四分之一长度绘制）。当 $A = 2$ 与椭圆相交于点 $(2\cos 75^\circ, \sin 75^\circ)$ 时，梯度不平行，沿椭圆向接触点移动会增加 $A$。 $A = 6$ 未与椭圆相交。
:::

```check
xe_, ye_ = 2*cos(5*pi/12), sin(5*pi/12)                              # the point at t = 75 degrees
same(4*xe_*ye_, 2); same(xe_**2/4 + ye_**2, 1)
holds(diff(4*sin(2*t), t).subs(t, 5*pi/12) < 0)                    # A grows as t decreases towards 45 degrees
holds(Ne((4*ye_)*(2*ye_) - (4*xe_)*(xe_/2), 0))                     # grad A and grad g are not parallel there
gradA_ = Matrix([4*y, 4*x]).subs({x: sqrt(2), y: sqrt(2)/2}); gradg_ = Matrix([x/2, 2*y]).subs({x: sqrt(2), y: sqrt(2)/2})
same(gradA_, 4*gradg_)                                              # at the touching point, grad A = 4 grad g
same(maximum(4*sin(2*t), t, Interval(0, 2*pi)), 4); holds(Integer(6) > 4)   # the level curve A = 6 misses the ellipse
```

::: theorem 拉格朗日乘子法
设 $f$、$g$ 在曲线 $g(x, y) = c$ 上的点 $(a, b)$ 附近具有连续的一阶偏导数，且 $\nabla g(a, b) \ne \vb{0}$。若将 $f$ 限制到这条曲线上，它在 $(a, b)$ 处取得局部最大值或局部最小值（也就是在以 $(a, b)$ 为中心的某个圆盘中，对曲线上的每一点 $(x, y)$，都有 $f(a, b) \ge f(x, y)$，或都有 $f(a, b) \le f(x, y)$），则存在一个数 $\lambda$，使得

$$\nabla f(a, b) = \lambda\,\nabla g(a, b).$$
:::

::: proof
由 $\nabla g(a, b) \ne \vb{0}$，$g_x(a, b)$ 与 $g_y(a, b)$ 至少有一个非零。不妨设 $g_y(a, b) \ne 0$，另一种情形可交换 $x$ 和 $y$ 的角色。对 $g(x, y) - c$ 应用模块 17 的隐函数定理，在 $(a, b)$ 附近，曲线上的点构成可微函数 $y = \varphi(x)$ 的图像，其中 $\varphi(a) = b$。因此，对充分小的 $t$，曲线由 $\vb{r}(t) = \langle a + t, \varphi(a + t)\rangle$ 描出，这里 $\vb{r}(0) = \langle a, b\rangle$、$\vb{r}'(0) = \langle 1, \varphi'(a)\rangle$。

函数 $k(t) = f\big(\vb{r}(t)\big)$ 在 $t = 0$ 取得局部极值，所以由费马定理（定理 8.1）有 $k'(0) = 0$，再由模块 17 的链式法则，有 $k'(0) = \nabla f(a, b) \cdot \vb{r}'(0)$。对每个 $t$ 都有 $g\big(\vb{r}(t)\big) = c$，求导得 $\nabla g(a, b) \cdot \vb{r}'(0) = 0$。所以两个梯度都垂直于 $\vb{r}'(0) = \langle 1, \varphi'(a)\rangle$。如果向量 $\langle u, v\rangle$ 与其垂直，就有 $u + \varphi'(a)v = 0$，因此它是 $v\langle -\varphi'(a), 1\rangle$。两个梯度都是 $\langle -\varphi'(a), 1\rangle$ 的倍数，分别为 $\nabla f(a, b) = f_y(a, b)\langle -\varphi'(a), 1\rangle$、$\nabla g(a, b) = g_y(a, b)\langle -\varphi'(a), 1\rangle$。由 $g_y(a, b) \ne 0$，有 $\nabla f(a, b) = \lambda\nabla g(a, b)$，其中 $\lambda = f_y(a, b)/g_y(a, b)$。
:::

数字 $\lambda$ 是一个 **Lagrange乘数**。在三维情况下也是一样的，其中 $f$ 和 $g$ 在该点附近仍具有连续的一阶偏导数：如果 $f(x, y, z)$ 在曲面 $g(x, y, z) = c$ 上有一个局部极值点，在该点 $\nabla g \ne \vb{0}$ 处，那么 $\nabla f = \lambda\nabla g$ 也成立。证明过程相同，使用三维隐函数定理应用于通过该点的每一条曲线上： $\nabla f$ 垂直于所有这些曲线的切向量，这些切向量填满了垂直于 $\nabla g$ 的平面，因此 $\nabla f$ 是 $\nabla g$ 的一个倍数。这个倍数可以为 0：定理允许 $\nabla f = \vb{0}$。

```check
uu_, vv2_, mphi = symbols('u v m')
same(solve(Matrix([uu_, vv2_]).dot(Matrix([1, mphi])), uu_), [-mphi*vv2_]); same(vv2_*Matrix([-mphi, 1]), Matrix([-mphi*vv2_, vv2_]))
fx_s, fy_s, gx_s, gy_s = symbols('f_x f_y g_x g_y')
same(solve(fx_s + fy_s*mphi, fx_s), [-fy_s*mphi]); same(Matrix([-fy_s*mphi, fy_s]), fy_s*Matrix([-mphi, 1]))   # grad f . <1, m> = 0
same((fy_s*Matrix([-mphi, 1])), (fy_s/gy_s)*(gy_s*Matrix([-mphi, 1])))                                       # so grad f = (f_y/g_y) grad g
gT_ = x**2 + 3*y**3 + y; phi1 = -diff(gT_, x)/diff(gT_, y)           # an instance: phi'(a) from implicit differentiation
same(Matrix([diff(gT_, x), diff(gT_, y)]).dot(Matrix([1, phi1])), 0); same(Matrix([diff(gT_, x), diff(gT_, y)]), diff(gT_, y)*Matrix([-phi1, 1]))
```

::: keyidea
**Lagrange乘数法。** 假设 $f$ 和 $g$ 在约束曲线附近具有连续的一阶偏导数。为了找到 $f(x, y)$ 在 $g(x, y) = c$ 约束下的极值：

1. 解方程 $f_x = \lambda g_x$, $f_y = \lambda g_y$ 和 $g(x, y) = c$，求 $x$, $y$ 和 $\lambda$。
2. 添加曲线 $\nabla g = \vb{0}$ 上的点，以及曲线的端点（如果有的话）。
3. 评估 $f$ 在所有这些点上的值。如果曲线非空、闭合且有界，如圆或椭圆，那么最大值即为最大值，最小值即为最小值（定理 18.3）。否则必须通过额外的论证来证明极值的存在。

在三个变量中，解 $\nabla f = \lambda\nabla g$ 和 $g(x, y, z) = c$：为 $x$、$y$、$z$ 和 $\lambda$ 解四个方程。
:::

::: widget name=lagrange
选择 $f$ 和约束条件，并使用滑块或方向键沿曲线移动点。橙色：$\nabla f$ 和通过该点的 $f$ 等高线；绿色：$\nabla g$。从椭圆上的 $xy$ 开始：它是例 18.5 中矩形面积 $A = 4xy$ 的四分之一，因此在最大值时，该部件给出 $\lambda = 1$，而面积的乘数是 4。找到箭头对齐的位置并读取 $\lambda$。"近似平行" 读数表示箭头在 $0.5^\circ$ 的范围内平行；它提供一个近似乘数，并建议一个可通过代数精确确定的候选点。在其他地方，读数表示当你移动时 $f$ 如何变化：跟随它到达最大值，然后到达最小值。然后尝试 $x^2 + 2y^2$ 在圆上（练习 18.3），以及 $2x + y$ 在圆上，其最大值不在整数度数处。
:::

::: example 椭圆中的最大矩形
找出位于椭圆 $\tfrac{x^2}{4} + y^2 = 1$ 内、边与坐标轴平行的最大矩形。

最大化 $A = 4xy$ 受限于 $g(x, y) = \tfrac{x^2}{4} + y^2 = 1$，其中 $(x, y)$ 是由 $x \ge 0$ 和 $y \ge 0$ 构成的角点。 **一个最大值存在。** 椭圆在第一象限的四分之一部分是闭合且有界的，且 $A$ 是连续的，因此 $A$ 在其上有一个最大值（定理 18.3）。在弧的两端 $(2, 0)$ 和 $(0, 1)$，矩形是平坦的且 $A = 0$，因此最大值出现在具有 $x > 0$ 和 $y > 0$ 的点上，其中定理 18.5 适用： $\nabla g = \big\langle \tfrac{x}{2}, 2y\big\rangle$ 在椭圆上从不等于 $\vb{0}$。

**方程。** $\nabla A = \langle 4y, 4x\rangle$，所以

$$4y = \lambda\frac{x}{2}, \quad 4x = 2\lambda y, \quad \frac{x^2}{4} + y^2 = 1.$$

用 $x, y > 0$，前两个给出 $\lambda = \dfrac{8y}{x}$ 和 $\lambda = \dfrac{2x}{y}$。因此 $\dfrac{8y}{x} = \dfrac{2x}{y}$，即 $8y^2 = 2x^2$，且 $x = 2y$，因为两者都是正的。约束变为 $\tfrac{4y^2}{4} + y^2 = 2y^2 = 1$，因此 $y = \tfrac{1}{\sqrt2} = \tfrac{\sqrt2}{2}$， $x = \sqrt2$ 和 $\lambda = \tfrac{2x}{y} = 4$。

**答案。** 最大的矩形是 $2\sqrt2$ 乘以 $\sqrt2$，面积为 $4 \cdot \sqrt2 \cdot \tfrac{\sqrt2}{2} = 4$，如上表中的第 $t = \tfrac{\pi}{4}$ 行所建议。角点位于直线 $y = \tfrac{x}{2}$ 上，这是围绕椭圆的 4 乘 2 矩形的对角线，最佳矩形的面积恰好是其一半。

```check
xp_, yp_, lp_ = symbols('x y lambda', positive=True)
A185 = 4*xp_*yp_; g185 = xp_**2/4 + yp_**2
same(diff(A185, xp_), 4*yp_); same(diff(A185, yp_), 4*xp_); same(diff(g185, xp_), xp_/2); same(diff(g185, yp_), 2*yp_)
same(solve([4*yp_ - lp_*xp_/2, 4*xp_ - 2*lp_*yp_, g185 - 1], [xp_, yp_, lp_], dict=True), [{xp_: sqrt(2), yp_: sqrt(2)/2, lp_: 4}])
same(solve(Eq(8*yp_/xp_, 2*xp_/yp_), xp_), [2*yp_]); same(((2*yp_)**2/4 + yp_**2), 2*yp_**2)
same(A185.subs({xp_: sqrt(2), yp_: sqrt(2)/2}), 4); same(A185.subs({xp_: 2, yp_: 0}), 0); same(A185.subs({xp_: 0, yp_: 1}), 0)
same(4*2, 8); same(Rational(8, 2), 4)
same(Rational(1, 2)*sqrt(2), sqrt(2)/2); same(Rational(1, 2)*2, 1)     # (sqrt2, sqrt2/2) and the corner (2, 1) of the 4 by 2 rectangle lie on y = x/2
```
:::

::: example 抛物线上最近的点，再次出现
求抛物线 $y = x^2$ 上离 $(3, 0)$ 最近的点，该问题是 [例 8.15](module_08_ZH.html#optimisation)]，使用拉格朗日乘数法。

最小化距离的平方，即 $D(x, y) = (x - 3)^2 + y^2$，受约束于 $g(x, y) = y - x^2 = 0$。这里 $\nabla D = \langle 2(x - 3), 2y\rangle$ 和 $\nabla g = \langle -2x, 1\rangle$，后者从不等于 $\vb{0}$。方程为

$$2(x - 3) = -2\lambda x, \quad 2y = \lambda, \quad y = x^2.$$

最后两个方程给出 $\lambda = 2y = 2x^2$，然后第一个方程变为 $2(x - 3) = -4x^3$，即 $4x^3 + 2x - 6 = 2(2x^3 + x - 3) = 0$。如例 8.15 所示， $2x^3 + x - 3 = (x - 1)(2x^2 + 2x + 3)$，而二次因子没有实数零点，因此 $x = 1$， $y = 1$ 和 $\lambda = 2$：一个候选点 $(1, 1)$，距离为 $\sqrt{D(1, 1)} = \sqrt{4 + 1} = \sqrt5 \approx 2.236$。

**这是最小值。** 抛物线是无界的，因此需要帮助定理 18.3。在 $\abs{x} \ge 3$、$D \ge y^2 = x^4 \ge 81$、远多于 $D(1, 1) = 5$。在以 $\abs{x} \le 3$ 为弧的闭合且有界的弧上， $D$ 有一个最小值，最多为 5，因此不在弧的端点 $D \ge 81$ 处。该点是 $D$ 在抛物线上的局部最小值，因此它满足方程：它等于 $(1, 1)$，且 $D(1, 1) = 5$ 是整个抛物线上最小值。

**图示。** $\nabla D = 2\langle x - 3, y\rangle$ 是从 $(3, 0)$ 到点 $(x, y)$ 的向量的两倍，且 $\nabla g$ 与抛物线垂直。因此 $\nabla D = \lambda\nabla g$ 表示从 $(3, 0)$ 到最近点的线段垂直于曲线：这与例 8.15 末尾的检查一致，该方法现在对此进行解释。

```check
D186 = (x - 3)**2 + y**2; g186 = y - x**2
same(diff(D186, x), 2*(x - 3)); same(diff(D186, y), 2*y); same(diff(g186, x), -2*x); same(diff(g186, y), 1)
xr6, yr6, lr6 = symbols('x y lambda', real=True)
same(solve([2*(xr6 - 3) + 2*lr6*xr6, 2*yr6 - lr6, yr6 - xr6**2], [xr6, yr6, lr6], dict=True), [{xr6: 1, yr6: 1, lr6: 2}])
steps(2*(x - 3) + 4*x**3, 4*x**3 + 2*x - 6, 2*(2*x**3 + x - 3), 2*(x - 1)*(2*x**2 + 2*x + 3)); same(discriminant(2*x**2 + 2*x + 3, x), -20)
same(D186.subs({x: 1, y: 1}), 5); same(sqrt(4 + 1), sqrt(5)); rounds(sqrt(5), '2.236')
same(D186.subs(y, x**2), x**4 + (x - 3)**2); holds(Integer(3)**4 == 81)
same(minimum(D186.subs(y, x**2), x, Interval(-3, 3)), 5)
same(Matrix([2*(1 - 3), 2*1]), 2*Matrix([-2*1, 1]))                       # grad D = 2 grad g at (1, 1)
```
:::

::: example 从硬纸板片上剪下的盒子
用 300 cm² 的硬纸板制作一个无盖的开口盒子（忽略接缝和损耗），哪一组尺寸能获得最大的体积？

设底面为 $x$ 厘米乘 $y$ 厘米，高为 $z$ 厘米。在满足 $g(x, y, z) = xy + 2xz + 2yz = 300$（底面和四个侧面）的条件下，最大化 $V = xyz$，其中 $x, y, z > 0$。这里 $\nabla V = \langle yz, xz, xy\rangle$ 和 $\nabla g = \langle y + 2z,\ x + 2z,\ 2x + 2y\rangle$，对于正的尺寸，该值非零，因此

$$\begin{aligned} yz &= \lambda(y + 2z), \\ xz &= \lambda(x + 2z), \\ xy &= \lambda(2x + 2y). \end{aligned}$$

将第一个方程乘以 $x$，第二个乘以 $y$，第三个乘以 $z$：所有三个左边都变为 $xyz$，因此

$$\begin{aligned} \lambda(xy + 2xz) &= \lambda(xy + 2yz) \\ &= \lambda(2xz + 2yz). \end{aligned}$$

$\lambda \ne 0$，由于 $xyz > 0$；除以它。第一个等式给出 $xz = yz$，因此 $x = y$；第二个给出 $xy = 2xz$，因此 $y = 2z$。所以 $x = y = 2z$，约束变为 $4z^2 + 4z^2 + 4z^2 = 12z^2 = 300$： $z = 5$， $x = y = 10$，和 $\lambda = \dfrac{yz}{y + 2z} = \dfrac{50}{20} = \dfrac52$。体积是 $10 \cdot 10 \cdot 5 = 500$ 立方厘米。

**是最大值。** 表面 $g = 300$ 是无界的，定理 18.5 仅说明，如果存在最大盒子，它将具有这些尺寸。一个不等式可以确定：对于正数 $p$， $q$ 和 $r$，

$$\frac{p + q + r}{3} \ge \sqrt[3]{pqr}, \quad\text{with equality only when } p = q = r,$$

算术平均数与几何平均数的不等式，由练习18.11证明。对于$p = xy$、$q = 2xz$和$r = 2yz$，其和为$p + q + r = 300$，积为$pqr = 4(xyz)^2 = 4V^2$。因此$100 \ge \sqrt[3]{4V^2}$，即$4V^2 \le 100^3$，以及$V \le 500$，当且仅当$xy = 2xz = 2yz$时取等号，这就是所求的盒子。最大的盒子尺寸为10厘米乘10厘米，深5厘米。

```check
xb, yb, zb, lb = symbols('x y z lambda', positive=True)
Vb = xb*yb*zb; gb = xb*yb + 2*xb*zb + 2*yb*zb
same([diff(Vb, s_) for s_ in (xb, yb, zb)], [yb*zb, xb*zb, xb*yb])
same([diff(gb, s_) for s_ in (xb, yb, zb)], [yb + 2*zb, xb + 2*zb, 2*xb + 2*yb])
holds(yb + 2*zb > 0); holds(xb + 2*zb > 0); holds(2*xb + 2*yb > 0)
same(solve([diff(Vb, s_) - lb*diff(gb, s_) for s_ in (xb, yb, zb)] + [gb - 300], [xb, yb, zb, lb], dict=True), [{xb: 10, yb: 10, zb: 5, lb: Rational(5, 2)}])
same(xb*(lb*(yb + 2*zb)), lb*(xb*yb + 2*xb*zb)); same(yb*(lb*(xb + 2*zb)), lb*(xb*yb + 2*yb*zb)); same(zb*(lb*(2*xb + 2*yb)), lb*(2*xb*zb + 2*yb*zb))
same(gb.subs({xb: 2*zb, yb: 2*zb}), 12*zb**2); same(solve(12*zb**2 - 300, zb), [5])
same(Rational(10*5, 10 + 2*5), Rational(5, 2)); same(10*10*5, 500)
same((xb*yb)*(2*xb*zb)*(2*yb*zb), 4*(xb*yb*zb)**2)
Vpos = symbols('V', positive=True); same(solve(4*Vpos**2 - 100**3, Vpos), [500])   # 4V^2 = 100^3 gives V = 500
same(Rational(300, 3), 100)
same((10*10, 2*10*5, 2*10*5), (100, 100, 100))
```
:::

::: pitfall
三个使用拉格朗日乘数法的例题。**除以可能为0的变量**：在 $2x = 2\lambda x$ 中，约去 $x$ 得到 $\lambda = 1$ 会丢失所有满足 $x = 0$ 的候选点（练习 18.3）；应写 $x(1 - \lambda) = 0$ 代替。**忽略使 $\nabla g = \vb{0}$** 为零的点：在曲线 $y^2 = x^3$ 上，函数 $f = x$ 在原点处取得最小值，因为在曲线上 $x = \sqrt[3]{y^2} \ge 0$；但在此处 $\nabla g = \langle -3x^2, 2y\rangle$ 为 $\vb{0}$，且方程 $1 = -3\lambda x^2$、$0 = 2\lambda y$、$y^2 = x^3$ 无解。**未给出极值候选点的论证**：在双曲线 $xy = 1$ 的分支 $x > 0$ 上，$f = x + y$ 有唯一的候选点 $(1, 1)$，其中 $f = 2$。它是最小值，因为 $x + \tfrac1x - 2 = \tfrac{(x - 1)^2}{x} \ge 0$，但没有最大值：$f \to \infty$ 随 $x \to \infty$ 趋于无穷大。
:::

```check
xr7, yr7, lr7 = symbols('x y lambda', real=True)
same(solve([1 + 3*lr7*xr7**2, 2*lr7*yr7, yr7**2 - xr7**3], [xr7, yr7, lr7], dict=True), [])
same(Matrix([diff(y**2 - x**3, x), diff(y**2 - x**3, y)]).subs({x: 0, y: 0}), Matrix([0, 0]))
same(solve([1 - lr7*yr7, 1 - lr7*xr7, xr7*yr7 - 1], [xr7, yr7, lr7], dict=True), [{xr7: -1, yr7: -1, lr7: -1}, {xr7: 1, yr7: 1, lr7: 1}])
same(solve([1 - lp_*yp_, 1 - lp_*xp_, xp_*yp_ - 1], [xp_, yp_, lp_], dict=True), [{xp_: 1, yp_: 1, lp_: 1}])
holds((xp_ - 1)**2/xp_ >= 0)
same(x + 1/x - 2, (x - 1)**2/x); limit_is(x + 1/x, x, oo, oo)
```

:::: deeper 乘数所衡量的内容
在例子中，$\lambda$ 被找到然后被遗忘了。它有其意义。设 $M(c)$ 为曲线 $g = c$ 上 $f$ 的最大值，在点 $\big(x(c), y(c)\big)$ 处取得，乘数为 $\lambda(c)$。假设这个族在开区间 $c$ 内定义，且 $x(c)$ 和 $y(c)$ 在那里可导，且 $f$ 和 $g$ 在这些点附近具有连续的一阶偏导数。那么

$$M'(c) = \lambda(c).$$

确实 $M(c) = f\big(x(c), y(c)\big)$，并且根据链式法则和拉格朗日方程

$$\begin{aligned} M'(c) &= f_x x' + f_y y' = \lambda\,(g_x x' + g_y y') \\ &= \lambda\,\frac{d}{dc}\,g\big(x(c), y(c)\big) = \lambda\,\frac{d}{dc}\,c = \lambda. \end{aligned}$$

同样的论证适用于最小值。因此$\lambda$是最佳值随约束水平变化的速率：如果$c$是预算，在单位足够小以适用线性近似的前提下，$\lambda$表示最优状态下多一个单位预算的价值。经济学家称之为**影子价格**。

对于椭圆 $\tfrac{x^2}{4} + y^2 = c$ 中的矩形 $c > 0$，例 18.5 的步骤给出角落 $\big(\sqrt{2c}, \sqrt{c/2}\big)$ 和最大面积 $M(c) = 4c$，因此 $M'(c) = 4$：那里找到的 $\lambda = 4$。对于 cardboard 面积为 $A$ cm² 的盒子，其中 $A > 0$，它们给出 $x = y = 2z$ 与 $12z^2 = A$，因此最大体积是 $V(A) = 4z^3 = 4\big(\tfrac{A}{12}\big)^{3/2}$，且 $V'(A) = \tfrac12\big(\tfrac{A}{12}\big)^{1/2} = \tfrac{z}{2}$，在 $A = 300$ 处为 $\tfrac52$：例 18.7 中的乘数。每增加 1 cm² 的 cardboard，体积大约增加 2.5 cm³，接近这个尺寸。

```check
cc_ = symbols('c', positive=True)
same(solve([4*yp_ - lp_*xp_/2, 4*xp_ - 2*lp_*yp_, xp_**2/4 + yp_**2 - cc_], [xp_, yp_, lp_], dict=True), [{xp_: sqrt(2*cc_), yp_: sqrt(cc_/2), lp_: 4}])
same(4*sqrt(2*cc_)*sqrt(cc_/2), 4*cc_); same(diff(4*cc_, cc_), 4)
Ab = symbols('A', positive=True)
zA = sqrt(Ab/12); VA = 4*zA**3
same((2*zA)*(2*zA) + 2*(2*zA)*zA + 2*(2*zA)*zA, Ab); same(VA, 4*(Ab/12)**Rational(3, 2))
same(diff(VA, Ab), Rational(1, 2)*(Ab/12)**Rational(1, 2)); same(diff(VA, Ab), zA/2); same(diff(VA, Ab).subs(Ab, 300), Rational(5, 2))
same(VA.subs(Ab, 300), 500)
fx_, fy_, gx_, gy_, xd, yd, lam_ = symbols('f_x f_y g_x g_y xd yd lambda')
same((lam_*gx_)*xd + (lam_*gy_)*yd, lam_*(gx_*xd + gy_*yd))
```
::::

### 两个约束 {#two-constraints}

假设 $f$、$g$ 和 $h$ 在某一点附近具有连续的一阶偏导数，其中 $g(x, y, z) = c$ 和 $h(x, y, z) = d$。为了在它们的交集中寻找 $f$ 的极值，添加第二个乘数 $\mu$，读作 "mu"：在受约束的局部极值点处，

$$\nabla f = \lambda\,\nabla g + \mu\,\nabla h,$$

提供 $\nabla g$ 和 $\nabla h$ 不平行，且 $\vb{0}$ 也不平行。这些假设确保交线在局部是一个可微曲线，且切向量非零，这是模块 17 中隐函数定理的一个版本。乘子方程的原因与之前相同。该曲线位于两个曲面上，因此其切向量 $\vb{T}$ 垂直于 $\nabla g$ 和 $\nabla h$；在极值点处，$\nabla f$ 也垂直于 $\vb{T}$。垂直于 $\vb{T}$ 的向量构成一个平面，该平面中的两个非平行向量 $\nabla g$ 和 $\nabla h$ 可以组合出该平面中的所有向量，包括 $\nabla f$。加上这两个约束条件，就得到 $x$、$y$、$z$、$\lambda$ 和 $\mu$ 的五个方程。

::: example 斜圆的最高点
平面 $x + y + z = 0$ 与球面 $x^2 + y^2 + z^2 = 6$ 相交于一个圆。找出该圆的最高点和最低点。

在约束 $g = x + y + z = 0$ 和 $h = x^2 + y^2 + z^2 = 6$ 下，最大化和最小化 $f = z$。方程 $\langle 0, 0, 1\rangle = \lambda\langle 1, 1, 1\rangle + \mu\langle 2x, 2y, 2z\rangle$ 为

$$\begin{aligned} 0 &= \lambda + 2\mu x, \\ 0 &= \lambda + 2\mu y, \\ 1 &= \lambda + 2\mu z, \end{aligned}$$

两个约束条件下。用前两个相减得到 $2\mu(x - y) = 0$。若 $\mu = 0$，第一个式子给出 $\lambda = 0$，然后第三个式子说明 $1 = 0$，这是不可能的；因此 $x = y$。平面给出 $z = -2x$，球面给出 $x^2 + x^2 + 4x^2 = 6$，因此 $x = \pm1$。候选点为 $(1, 1, -2)$ 和 $(-1, -1, 2)$，分别对应 $\lambda = \tfrac13$ 和 $\mu = \mp\tfrac16$。梯度 $\langle 1, 1, 1\rangle$ 和 $\langle 2x, 2y, 2z\rangle$ 只有在 $x = y = z$ 处才平行，而在平面上这意味着原点，不在球面上；因此该方法在圆上所有点都适用。圆是闭合且有界的，因此 $f$ 在其上取得最大值和最小值（三维空间中的极值定理），它们在候选点中：最高点为 $(-1, -1, 2)$，最低点为 $(1, 1, -2)$。

```check
xr8, yr8, zr8, lr8, mr8 = symbols('x y z lambda mu', real=True)
eq8 = [0 - lr8 - 2*mr8*xr8, 0 - lr8 - 2*mr8*yr8, 1 - lr8 - 2*mr8*zr8, xr8 + yr8 + zr8, xr8**2 + yr8**2 + zr8**2 - 6]
same_set(solve(eq8, [xr8, yr8, zr8, lr8, mr8], dict=True),
         [{xr8: 1, yr8: 1, zr8: -2, lr8: Rational(1, 3), mr8: -Rational(1, 6)}, {xr8: -1, yr8: -1, zr8: 2, lr8: Rational(1, 3), mr8: Rational(1, 6)}])
same((lr8 + 2*mr8*xr8) - (lr8 + 2*mr8*yr8), 2*mr8*(xr8 - yr8))
same(solve(x**2 + x**2 + 4*x**2 - 6, x), [-1, 1])
same(Matrix([1, 1, 1]).cross(Matrix([2*x, 2*y, 2*z])), Matrix([2*z - 2*y, 2*x - 2*z, 2*y - 2*x]))
same((2*z - 2*y)**2 + (2*x - 2*z)**2 + (2*y - 2*x)**2, 12*(x**2 + y**2 + z**2) - 4*(x + y + z)**2)
same(12*6 - 4*0**2, 72); holds(72 > 0)                         # the gradients are independent everywhere on the circle
```
:::

::: compute 使用 SymPy 的拉格朗日乘数法系统
`solve` 处理本节的系统。声明维度为正，只保留可以构建的盒子；乘数保持为实数：

```python
import sympy as sp
x, y, z = sp.symbols('x y z', positive=True)
lam = sp.symbols('lambda', real=True)
V = x*y*z                                   # the open box of Example 18.7
g = x*y + 2*x*z + 2*y*z
eqs = [sp.diff(V, s) - lam*sp.diff(g, s) for s in (x, y, z)] + [g - 300]
print(sp.solve(eqs, [x, y, z, lam], dict=True))
```

```output
[{lambda: 5/2, x: 10, y: 10, z: 5}]
```

有两个约束时有两个乘数；此处未知数为实数，可正可负：

```python
x, y, z, lam, mu = sp.symbols('x y z lambda mu', real=True)
f, g, h = z, x + y + z, x**2 + y**2 + z**2   # Example 18.8
eqs = [sp.diff(f, s) - lam*sp.diff(g, s) - mu*sp.diff(h, s) for s in (x, y, z)]
eqs += [g, h - 6]
for sol in sp.solve(eqs, [x, y, z, lam, mu], dict=True):
    print(sol, ' f =', f.subs(sol))
```

```output
{lambda: 1/3, mu: -1/6, x: 1, y: 1, z: -2}  f = -2
{lambda: 1/3, mu: 1/6, x: -1, y: -1, z: 2}  f = 2
```

`solve` 找出候选点；决定哪一个是最优解，以及是否存在最大值，仍然是你的任务。
:::

## 最小二乘 {#least-squares}

实验数据或日志文件中的数据点通常大致沿一条直线分布，你希望找到最符合这些点的直线。假设，作为例子，五个测量值给出点 $(0, 1)$、$(1, 4)$、$(2, 3)$、$(3, 6)$ 和 $(4, 6)$（虚构的数值）。没有一条直线能通过所有五个点。对于一条直线 $y = mx + b$，点 $(x_i, y_i)$ 的 **残差**，或误差，是

$$e_i = y_i - (mx_i + b),$$

垂直距离，带有符号，从直线到点的距离。一个数值衡量直线同时偏离所有点的程度：**平方误差和**

$$E(m, b) = \sum_{i=1}^{n}\big(y_i - mx_i - b\big)^2.$$

这里数据是固定数值，未知数是斜率 $m$ 和截距 $b$：$E$ 是两个变量的函数。

::: definition 最小二乘直线
A **最小二乘线**, 或 **回归线**, 是一个非空有限数据点集合 $(x_1, y_1), \dots, (x_n, y_n)$ 的一条直线 $y = mx + b$, 其斜率和截距使误差平方和 $E(m, b)$ 最小。下一个定理给出了这条直线唯一存在的条件。
:::

误差使用平方而非绝对值, 使得 $E$ 成为 $m$ 和 $b$ 的光滑函数, 从而可以应用微积分; 一个较大的误差可以超过多个较小的误差, 这在数据中包含异常值时尤为重要。数学基础部分的 [最小二乘模块](../math/module_12_ZH.html)] 用向量和投影处理相同的问题; 此处用偏导数求解。

::: theorem 正规方程
设 $(x_1, y_1), \dots, (x_n, y_n)$ 为数据点，其中至少有两个不同的 $x_i$。则 $E(m, b)$ 恰有一个临界点，即下列**正规方程**的解：

$$\begin{aligned} \Big(\sum x_i^2\Big)m + \Big(\sum x_i\Big)b &= \sum x_iy_i, \\ \Big(\sum x_i\Big)m + nb &= \sum y_i, \end{aligned}$$

$E$ 只在该点取得其全局最小值。（每个和都对 $i = 1, \dots, n$ 求和。）
:::

::: proof
**临界点.** $E$ 是 $m$ 和 $b$ 的多项式。根据链式法则,

$$\begin{aligned} \frac{\partial E}{\partial m} &= -2\sum x_i\big(y_i - mx_i - b\big), \\ \frac{\partial E}{\partial b} &= -2\sum\big(y_i - mx_i - b\big). \end{aligned}$$

将两者设为 0，并将含有 $m$ 和 $b$ 的项移到左边，得到正规方程。为了解这些方程，令 $\bar x = \tfrac1n\sum x_i$ 和 $\bar y = \tfrac1n\sum y_i$ 分别为均值，读作 "x 条" 和 "y 条"。第二个方程除以 $n$ 表示 $b = \bar y - m\bar x$。将此代入第一个方程得到

$$\Big(\sum x_i^2 - n\bar x^2\Big)m = \sum x_iy_i - n\bar x\bar y.$$

展开平方表明 $\sum (x_i - \bar x)^2 = \sum x_i^2 - 2\bar x\sum x_i + n\bar x^2 = \sum x_i^2 - n\bar x^2$，且这是正的，因为并非每个 $x_i$ 都等于 $\bar x$。因此 $m$ 被确定，然后 $b$：恰好有一个解 $(m^*, b^*)$。

**最小值。** 令 $e_i = y_i - m^*x_i - b^*$ 为该直线的残差。正规方程恰好表示 $\sum e_i = 0$ 和 $\sum x_ie_i = 0$。对于任何其他直线，设有 $m = m^* + p$ 和 $b = b^* + q$，

$$\begin{aligned} &E(m^* + p, b^* + q) \\ &\quad= \sum\big(e_i - px_i - q\big)^2 \\ &\quad= \sum e_i^2 - 2p\sum x_ie_i - 2q\sum e_i \\ &\qquad + \sum\big(px_i + q\big)^2 \\ &\quad= E(m^*, b^*) + \sum\big(px_i + q\big)^2. \end{aligned}$$

最后一个和式从不为负，且仅当 $px_i + q = 0$ 对每个 $i$ 时为 0；对于两个不同的 $x_i$，这将强制 $p = q = 0$。
:::

因此，最小二乘直线经过 **均值点** $(\bar x, \bar y)$，且其斜率为

$$m = \frac{\sum x_iy_i - n\bar x\bar y}{\sum x_i^2 - n\bar x^2}.$$

```check
X5 = symbols('x1:5'); Y5 = symbols('y1:5'); nn = 4
xbar = sum(X5)/nn; ybar = sum(Y5)/nn
E5 = sum((Y5[i] - m*X5[i] - b)**2 for i in range(nn))
same(diff(E5, m), -2*sum(X5[i]*(Y5[i] - m*X5[i] - b) for i in range(nn))); same(diff(E5, b), -2*sum(Y5[i] - m*X5[i] - b for i in range(nn)))
same(sum((X5[i] - xbar)**2 for i in range(nn)), sum(X5[i]**2 for i in range(nn)) - nn*xbar**2)
sol5 = solve([diff(E5, m), diff(E5, b)], [m, b], dict=True)[0]
same(sol5[b], ybar - sol5[m]*xbar)
same(sol5[m], (sum(X5[i]*Y5[i] for i in range(nn)) - nn*xbar*ybar)/(sum(X5[i]**2 for i in range(nn)) - nn*xbar**2))
e_ = symbols('e1:5'); p, q = symbols('p q')
same(expand(sum((e_[i] - p*X5[i] - q)**2 for i in range(nn))), expand(sum(e_[i]**2 for i in range(nn)) - 2*p*sum(X5[i]*e_[i] for i in range(nn)) - 2*q*sum(e_) + sum((p*X5[i] + q)**2 for i in range(nn))))
```

::: example 用五个点拟合一条直线
求点 $(0, 1)$, $(1, 4)$, $(2, 3)$, $(3, 6)$ 和 $(4, 6)$ 的最小二乘直线，其残差以及 $E$。

总和：$n = 5$, $\sum x_i = 10$, $\sum x_i^2 = 0 + 1 + 4 + 9 + 16 = 30$, $\sum y_i = 20$ 和 $\sum x_iy_i = 0 + 4 + 6 + 18 + 24 = 52$。正规方程为

$$30m + 10b = 52, \qquad 10m + 5b = 20.$$

从第一个方程减去第二个方程的两倍，得到 $10m = 12$，故 $m = 1.2$，再由 $5b = 20 - 12$ 得 $b = 1.6$。最小二乘直线为

$$y = 1.2x + 1.6.$$

它通过均值点 $(\bar x, \bar y) = (2, 4)$。在 $x = 0, 1, 2, 3, 4$ 处，直线给出 $1.6$, $2.8$, $4.0$, $5.2$ 和 $6.4$，因此残差为 $-0.6$, $1.2$, $-1.0$, $0.8$ 和 $-0.4$。它们的和为 0，它们与 $x_i$, $0 + 1.2 - 2.0 + 2.4 - 1.6 = 0$ 的乘积之和也为 0，正如正规方程所承诺的。最后

$$E(1.2, 1.6) = 0.36 + 1.44 + 1.00 + 0.64 + 0.16 = 3.6,$$

并且每条其他直线的平方误差和都更大。图 18.4 显示了该直线及其残差。

```check
X9 = [0, 1, 2, 3, 4]; Y9 = [1, 4, 3, 6, 6]
E9 = sum((yi - m*xi - b)**2 for xi, yi in zip(X9, Y9))
same([len(X9), sum(X9), sum(xi**2 for xi in X9), sum(Y9), sum(xi*yi for xi, yi in zip(X9, Y9))], [5, 10, 30, 20, 52])
same(solve([diff(E9, m), diff(E9, b)], [m, b], dict=True), [{m: Rational(6, 5), b: Rational(8, 5)}])
same(solve([30*m + 10*b - 52, 10*m + 5*b - 20], [m, b], dict=True), [{m: Rational(6, 5), b: Rational(8, 5)}])
same((30*m + 10*b) - 2*(10*m + 5*b), 10*m); same(52 - 2*20, 12)
res9 = [yi - Rational(6, 5)*xi - Rational(8, 5) for xi, yi in zip(X9, Y9)]
same([Rational(6, 5)*xi + Rational(8, 5) for xi in X9], [Rational(8, 5), Rational(14, 5), 4, Rational(26, 5), Rational(32, 5)])
same(res9, [-Rational(3, 5), Rational(6, 5), -1, Rational(4, 5), -Rational(2, 5)]); same(sum(res9), 0); same(sum(xi*ei for xi, ei in zip(X9, res9)), 0)
same(E9.subs({m: Rational(6, 5), b: Rational(8, 5)}), Rational(18, 5)); same(Rational(6, 5)*2 + Rational(8, 5), 4)
same([r_**2 for r_ in res9], [Rational(36, 100), Rational(144, 100), 1, Rational(64, 100), Rational(16, 100)]); same(sum(r_**2 for r_ in res9), Rational(36, 10))
same(sum(Y9)/Integer(5), 4); same(sum(X9)/Integer(5), 2)
```
:::

::: figure id=fig-18-4
最小二乘线 $y = 1.2x + 1.6$ 的例子 18.9 及其残差（橙色）：垂直误差 $-0.6$, $1.2$, $-1.0$, $0.8$ 和 $-0.4$，其平方和为 $3.6$，比任何其他直线都要小。
:::

::: compute 使用 NumPy 进行最小二乘
正规方程是关于 $m$ 和 $b$ 的两个线性方程，而 `np.linalg.solve` 解决了它们。NumPy 也有一个现成的拟合函数 `np.polyfit`：

```python
import numpy as np
xs = np.array([0, 1, 2, 3, 4])
ys = np.array([1, 4, 3, 6, 6])
n = len(xs)
A = np.array([[np.sum(xs**2), np.sum(xs)],
              [np.sum(xs),    n]])
rhs = np.array([np.sum(xs*ys), np.sum(ys)])
m, b = np.linalg.solve(A, rhs)               # the normal equations
print(f"normal equations: m = {m:.4f}, b = {b:.4f}")
print("np.polyfit:", np.polyfit(xs, ys, 1))
e = ys - (m*xs + b)
print("residuals:", np.round(e, 4), " E =", round(float(np.sum(e**2)), 4))
```

```output
normal equations: m = 1.2000, b = 1.6000
np.polyfit: [1.2 1.6]
residuals: [-0.6  1.2 -1.   0.8 -0.4]  E = 3.6
```

`np.polyfit(xs, ys, 1)` 拟合一个一次多项式，并按最高次幂优先返回其系数 $[m, b]$，此处为浮点数。当次数为 2 时，它通过最小二乘拟合 $y = ax^2 + bx + c$；最小化器满足三个正规方程，并且当输入值至少有三个不同的值时，解是唯一的。拟合的系数 $a$ 可以是 0，因此结果不一定是抛物线。数值方法求解的是一个缩放后的最小二乘系统，而不是构造这些正规方程。NumPy 建议使用 `numpy.polynomial.Polynomial.fit` 编写新代码，因为它在数值上更稳定。
:::

::: pitfall
最小二乘法的三张卡片。**期望直线对 $x$ 和 $y$ 一视同仁**：它最小化垂直误差。将 $x$ 作为 $y$ 的函数拟合例18.9的数据，得到 $x = \tfrac23y - \tfrac23$，即 $y = 1.5x + 1$，是一条不同的直线（两者都经过均值点）。**忽略条件**：如果每个 $x_i$ 都等于同一个数 $a$，则仅确定拟合值 $ma + b$。它必须等于 $\bar y$，因此有无穷多对 $b = \bar y - ma$ 最小化 $E$。**盲信拟合结果**：每个非空有限数据集都有一个最小二乘拟合，即使数据遵循曲线。残差中出现的模式，如两端为正、中间为负，表明直线是一个不好的模型；这是证据而非证明，因为测量数据可能包含噪声。
:::

```check
E9x = sum((xi - m*yi - b)**2 for xi, yi in zip(X9, Y9))
same(solve([diff(E9x, m), diff(E9x, b)], [m, b], dict=True), [{m: Rational(2, 3), b: -Rational(2, 3)}])
same(solve(Eq(x, Rational(2, 3)*y - Rational(2, 3)), y), [Rational(3, 2)*x + 1]); same(Rational(3, 2)*2 + 1, 4)
E3c = sum((7 - m*3 - b)**2 for _ in range(3))
same(hessian(E3c, (m, b)).det(), 0)                                          # equal x values: no unique solution
same(E3c.subs(b, 7 - 3*m), 0)
same([diff(E3c, v_).subs(b, 7 - 3*m) for v_ in (m, b)], [0, 0])
```

## 梯度下降：步长和条件数 {#gradient-descent}

解决 $\nabla f = \vb{0}$ 仅通过代数方法适用于简单函数。一个机器学习模型可能有数百万个参数，训练过程通常通过梯度下降寻找更小的损失，这在单变量中见于 [模块 8](module_08_ZH.html#gradient-descent)]，在双变量中见于 [模块 17](module_17_ZH.html#gradient-descent)。对于可微函数 $f$，从起始点 $\vb{x}_0$ 出发，以步长 $\eta > 0$ ("eta")，

$$\vb{x}_{k+1} = \vb{x}_k - \eta\,\nabla f(\vb{x}_k), \qquad k = 0, 1, 2, \dots,$$

其中 $\vb{x}_k = \langle x_k, y_k\rangle$，且每个新点必须保持在定义域内。非零梯度给出最快下降方向通过 $-\nabla f$，但有限步长仍可能导致 $f$ 增加，如果步长过大。[例 8.18](module_08_ZH.html#gradient-descent)] 显示，在抛物线 $\tfrac q2x^2$ 上，以步长 $q > 0$，从任意起始点收敛到最小值恰好当 $0 < \eta < 2/q$。在两个变量的情况下，碗可能在一个方向上曲率更陡峭，这会影响步长的选择。

::: example 在一个长谷中的梯度下降
以步长 $\eta = 0.18$ 在 $f(x, y) = \tfrac12(x^2 + 10y^2)$ 上从 $(-6, 2.5)$ 进行梯度下降。

$\nabla f = \langle x, 10y\rangle$，因此一步是

$$\begin{aligned} x_{k+1} &= x_k - 0.18x_k = 0.82\,x_k, \\ y_{k+1} &= y_k - 1.8\,y_k = -0.8\,y_k. \end{aligned}$$

两个坐标独立演化：$x_k = -6(0.82)^k$ 和 $y_k = 2.5(-0.8)^k$。表格显示了各点以及 $f$ 在这些点的值：

```valuetable
k = 0, 1, 2, 3, 4, 5, 10, 20
$x_k$ = -6*(41/50)**k
$y_k$ = (5/2)*(-4/5)**k
$f$ = ((-6*(41/50)**k)**2 + 10*((5/2)*(-4/5)**k)**2)/2
digits = 4
---
k | x_k | y_k | f
0 | -6 | 2.5 | 49.25
1 | -4.92 | -2 | 32.10
2 | -4.034 | 1.6 | 20.94
3 | -3.308 | -1.28 | 13.66
4 | -2.713 | 1.024 | 8.922
5 | -2.224 | -0.8192 | 5.830
10 | -0.8247 | 0.2684 | 0.7003
20 | -0.1134 | 0.02882 | 0.01058
```

$x$ 坐标逐渐趋近于 0，每次步长损失其大小的 18%。$y$ 坐标每次都会超调：它在每次步长改变符号，其大小仅减少 20%。路径在山谷中来回摆动，同时缓慢地沿山谷滑动（图 18.5，左图）；经过 20 步后 $f$ 从 49.25 下降到约 0.0106。

```check
fb18 = (x**2 + 10*y**2)/2
same(diff(fb18, x), x); same(diff(fb18, y), 10*y)
same(x - Rational(18, 100)*diff(fb18, x), Rational(82, 100)*x); same(y - Rational(18, 100)*diff(fb18, y), -Rational(8, 10)*y)
pk = [(Integer(-6), Rational(5, 2))]
for _ in range(20):
    px_, py_ = pk[-1]; pk.append((px_ - Rational(18, 100)*px_, py_ - Rational(18, 100)*10*py_))
same([pk[j] for j in (0, 1, 2, 3, 20)], [(-6*Rational(41, 50)**j, Rational(5, 2)*(-Rational(4, 5))**j) for j in (0, 1, 2, 3, 20)])
rounds(fb18.subs({x: pk[20][0], y: pk[20][1]}), '0.0106'); same(fb18.subs({x: -6, y: Rational(5, 2)}), Rational(197, 4)); rounds(Rational(197, 4), '49.25')
```
:::

::: figure id=fig-18-5
左图：在 $(-6, 2.5)$ 坐标下，对 $f(x, y) = \tfrac12(x^2 + 10y^2)$ 进行梯度下降，以 $\eta = 0.18$ 为函数，在 $f$ 的等高线上进行。每一步都垂直于它离开的等高线，因此在这些长椭圆上，方向主要沿着山谷：路径来回摆动。右图：同一函数在 $x$ 和 $v = \sqrt{10}\,y$ 坐标下表示为 $\tfrac12(x^2 + v^2)$，其等高线为圆。此时每一步都直接指向最小值；使用 $\eta = 0.5$ 每一步都将距离减半，使用 $\eta = 1$ 则只需一步即可达到最小值。
:::

::: theorem 二次碗形函数上的梯度下降
设 $f(x, y) = \tfrac12(ax^2 + cy^2)$，其中 $0 < a \le c$。步长为 $\eta > 0$ 的梯度下降从任意初始点都收敛到最小点 $(0, 0)$，当且仅当 $\eta < \dfrac{2}{c}$。
:::

::: proof
$\nabla f = \langle ax, cy\rangle$，因此 $x_{k+1} = (1 - \eta a)x_k$ 和 $y_{k+1} = (1 - \eta c)y_k$，从而 $x_k = (1 - \eta a)^kx_0$ 和 $y_k = (1 - \eta c)^ky_0$。如例 8.18 所示，数 $r$ 的幂 $r^k$ 趋于 0，当且仅当 $\abs{r} < 1$。为了从所有初始点收敛，包括初始点 $x_0 \ne 0$ 和 $y_0 \ne 0$，梯度下降法需要 $\abs{1 - \eta a} < 1$ 和 $\abs{1 - \eta c} < 1$，即 $0 < \eta < 2/a$ 和 $0 < \eta < 2/c$。由于 $a \le c$， $2/c \le 2/a$ 以及这两个条件共同说明 $0 < \eta < 2/c$。
:::

```check
ab_, cb_, eb_ = symbols('a c eta', positive=True); x0b, y0b = symbols('x_0 y_0')
fab = (ab_*x**2 + cb_*y**2)/2
same(diff(fab, x), ab_*x); same(diff(fab, y), cb_*y)
pts_ = [(x0b, y0b)]
for _ in range(4):
    px_, py_ = pts_[-1]; pts_.append((px_ - eb_*ab_*px_, py_ - eb_*cb_*py_))
same(pts_[4], ((1 - eb_*ab_)**4*x0b, (1 - eb_*cb_)**4*y0b))
er_ = symbols('eta', real=True)
for cv_ in (1, 10, 25):
    same(solve_univariate_inequality(Abs(1 - cv_*er_) < 1, er_, relational=False), Interval.open(0, Rational(2, cv_)))
    for e_ in (Rational(-1, 10), 0, Rational(1, 10*cv_), Rational(1, cv_), Rational(19, 10*cv_), Rational(2, cv_), Rational(21, 10*cv_), 1 + Rational(2, cv_)):
        holds(bool(Abs(1 - cv_*e_) < 1) == bool(0 < e_ < Rational(2, cv_)))   # a point in each piece, and the ends
```

### 条件不良性 {#ill-conditioning}

定理 18.7 说明，从每个起始点的收敛都需要 $\eta < 2/c$，其中 $c$ 是较大的曲率。在较平坦的方向，曲率为 $a$，此时因子 $1 - \eta a$ 就会大于 $1 - 2a/c$，当 $c$ 远大于 $a$ 时，这个值接近 1：该方向上的非零坐标会缓慢趋近于 0。为了最小化两个坐标因子中较大的那个的绝对值，最佳固定步长是 $\eta^* = \dfrac{2}{a + c}$，使得两个因子的大小相等：

$$1 - \eta^*a = \frac{c - a}{c + a}, \qquad 1 - \eta^*c = -\frac{c - a}{c + a}.$$

习题 18.10 表明，没有其他固定步长可以使这个较大的因子更小。其中 $\kappa = c/a$ 读作 "kappa"，碗的 **条件数**，该因子为

$$\frac{c - a}{c + a} = \frac{\kappa - 1}{\kappa + 1}.$$

对于例题 18.10 中的山谷，$\kappa = 10$：最佳固定步长是 $\eta^* = \tfrac{2}{11} \approx 0.18$，并用这个步长，每一步都会使两个坐标在大小上按因子 $\tfrac{9}{11} \approx 0.82$ 缩小。当 $\kappa$ 很大时，这个因子接近 1，此时梯度下降很慢：要将距离最小值减少一个固定因子，使用 $\eta^*$ 的步数会随着 $\kappa$ 增长而按比例增加（下面的“动手计算”框中统计了这些步数，练习 18.10 解释了原因）。

```check
same(1 - 2*ab_/(ab_ + cb_), (cb_ - ab_)/(cb_ + ab_)); same(1 - 2*cb_/(ab_ + cb_), -(cb_ - ab_)/(cb_ + ab_))
kp_ = symbols('kappa', positive=True)
same(((cb_ - ab_)/(cb_ + ab_)).subs(cb_, kp_*ab_), (kp_ - 1)/(kp_ + 1))
same(Rational(2, 1 + 10), Rational(2, 11)); rounds(Rational(2, 11), '0.18'); same((10 - 1)/Integer(10 + 1), Rational(9, 11)); rounds(Rational(9, 11), '0.82')
Cp_ = symbols('C', positive=True)
same(fab.subs({x: sqrt(2*Cp_/ab_), y: 0}), Cp_); same(fab.subs({x: 0, y: sqrt(2*Cp_/cb_)}), Cp_)
same(sqrt(2*Cp_/ab_)/sqrt(2*Cp_/cb_), sqrt(cb_/ab_))
limit_is((-1/log((kp_ - 1)/(kp_ + 1)))/kp_, kp_, oo, Rational(1, 2))
```

图形解释了这一点。对于 $C > 0$，等高线 $\tfrac12(ax^2 + cy^2) = C$ 是长轴为 $\sqrt{2C/a}$、短轴为 $\sqrt{2C/c}$ 的椭圆，因此它们的长度是宽度的 $\sqrt\kappa$ 倍。梯度在通过该点的等高线上垂直（模块 17），并且通常指向山谷内部而不是直接指向最小值。一个具有大条件数的二次碗，因此等高线是长而细的椭圆，是 **ill-conditioned**。梯度下降可能在这样的曲面上来回震荡，如图 18.5 所示，不过使用更小的步长或从坐标轴上开始则不会震荡。

### 重缩放 {#rescaling}

水平曲线的形状取决于所选变量。将$v = \sqrt{10}\,y$代入例18.10：则得到$f = \tfrac12(x^2 + v^2)$，其在$(x, v)$平面上的水平曲线为圆，且满足$\kappa = 1$。其梯度为$\langle x, v\rangle$，该梯度从最小值点径直向外指出，而在$x$和$v$中使用$\eta = 1$进行梯度下降会得到$(x, v) - \langle x, v\rangle = (0, 0)$：一步到达最小值（图18.5，右侧）。就原始变量而言，新方法在每一步之前将每个偏导数除以其在该方向上的曲率。

```check
vv_ = symbols('v')
same(fb18.subs(y, vv_/sqrt(10)), (x**2 + vv_**2)/2)
same(Matrix([x, vv_]) - 1*Matrix([diff((x**2 + vv_**2)/2, x), diff((x**2 + vv_**2)/2, vv_)]), Matrix([0, 0]))
same(sqrt(10)*(vv_/sqrt(10)), vv_)
same(Matrix([x, vv_]) - Rational(1, 2)*Matrix([x, vv_]), Matrix([x/2, vv_/2]))
same((vv_ - eb_*vv_).subs(vv_, sqrt(10)*y)/sqrt(10), y - eb_*diff(fb18, y)/10)
```

条件不良的常见原因是变量测量尺度差异很大。一个常见的预处理步骤是**标准化**非恒定输入特征：从每个特征的训练数据均值中减去该特征，然后除以其**标准差**，即距该均值的均方距离的平方根。变换后的训练值均值为0，标准差为1。这有助于改善条件，尽管它不能消除所有原因，例如高度相关的特征。即使仅中心化也有帮助。对于例18.9的数据，$E(m, b)$的二阶偏导数为$E_{mm} = 2\sum x_i^2 = 60$、$E_{mb} = 2\sum x_i = 20$和$E_{bb} = 2n = 10$；混合项使椭圆水平曲线倾斜，且曲线细长。对输入进行中心化，使用$x_i - 2$代替$x_i$，其中2是它们的均值：此时$\sum (x_i - 2) = 0$，混合项消失，且$E_{mm} = 20$、$E_{mb} = 0$、$E_{bb} = 10$，条件数为2。拟合直线相同，$y = 1.2(x - 2) + 4 = 1.2x + 1.6$（练习18.12），但在下面的计算中，梯度下降法能更快地找到它。

```check
same(hessian(E9, (m, b)), Matrix([[60, 20], [20, 10]]))
X9c = [xi - 2 for xi in X9]; E9c = sum((yi - m*xi - b)**2 for xi, yi in zip(X9c, Y9))
same(sum(X9c), 0); same(hessian(E9c, (m, b)), Matrix([[20, 0], [0, 10]])); same(Rational(20, 10), 2)
same(solve([diff(E9c, m), diff(E9c, b)], [m, b], dict=True), [{m: Rational(6, 5), b: 4}]); same(expand(Rational(6, 5)*(x - 2) + 4), Rational(6, 5)*x + Rational(8, 5))
```

若二次函数的椭圆等值线是倾斜的，沿椭圆主轴仍可采用相同的分析方法。这些方向上的曲率是海森矩阵的正**特征值**，见《数学基础》的[模块 13](../math/module_13_ZH.html)。若函数在极小值点附近的二阶偏导数连续，且该点的两个海森矩阵特征值皆为正，则二次近似为碗形，可用于局部分析。它无法保证全局收敛。若极小值点处有零特征值，如 $x^4 + y^4$ 的原点，则需要另作分析。《数学基础》的[模块 19](../math/module_19_ZH.html)从计算角度讨论梯度方法与条件数，[人工智能系列](../ai/index_ZH.html)展示了如何将这些方法用于训练实际模型。

::: compute 条件数与步数
从 $(1, 1)$ 出发，使用最佳固定步长的梯度下降法，需要多少步才能使点在 $f = \tfrac12(x^2 + \kappa y^2)$ 上接近极小值点一百万倍？

```python
import math

def steps_needed(kappa, max_steps=100000):
    if not math.isfinite(kappa) or kappa < 1:
        raise ValueError("kappa must be finite and at least 1")
    eta = 2/(1 + kappa)                         # the best fixed step
    x, y = 1.0, 1.0
    for k in range(max_steps + 1):
        if math.hypot(x, y) <= 1e-6*math.sqrt(2):
            return k                           # completed updates
        if k == max_steps:
            break
        x, y = x - eta*x, y - eta*kappa*y
    raise RuntimeError("distance tolerance not reached within the step limit")

for kappa in (1, 10, 100, 1000):
    print(f"kappa = {kappa:4}   steps needed: {steps_needed(kappa)}")
```

```output
kappa =    1   steps needed: 1
kappa =   10   steps needed: 69
kappa =  100   steps needed: 691
kappa = 1000   steps needed: 6908
```

从 $\kappa = 10$ 开始，该表中每次十倍增加，工作量大约乘以十。步数限制可以防止当请求的减少量耗时过长或浮点运算不再取得进展时出现无限循环。

最小二乘法：用梯度下降法在 $E(m, b)$ 上拟合例 18.9 中的直线，使用原始输入和中心化输入，采用相同的步长 $\eta = 0.025$，当两个偏导数的绝对值都低于 $10^{-6}$ 时停止：

```python
import numpy as np
xs = np.array([0, 1, 2, 3, 4.0])
ys = np.array([1, 4, 3, 6, 6.0])

def fit_by_descent(xs, ys, eta=0.025, max_steps=100000):
    m = b = 0.0
    for k in range(max_steps + 1):
        e = ys - (m*xs + b)                       # the residuals
        Em, Eb = -2*np.sum(xs*e), -2*np.sum(e)    # the partial derivatives of E
        if not np.isfinite([Em, Eb]).all():
            raise RuntimeError("nonfinite gradient; try a smaller step")
        if max(abs(Em), abs(Eb)) < 1e-6:
            return k, m, b                       # completed updates
        if k == max_steps:
            break
        m, b = m - eta*Em, b - eta*Eb
    raise RuntimeError("gradient tolerance not reached within the step limit")

for name, x in (("raw", xs), ("centred", xs - 2)):
    k, m, b = fit_by_descent(x, ys)
    print(f"{name:8} inputs: {k} steps, m = {m:.6f}, b = {b:.6f}")
```

```output
raw      inputs: 193 steps, m = 1.200000, b = 1.600000
centred  inputs: 61 steps, m = 1.200000, b = 4.000000
```

使用相同的步长，中心化输入需要 61 步而不是 193 步。它们还允许更大的步长：中心化 Hessian 矩阵是对角矩阵，曲率分别为 20 和 10，因此在将最小值移至原点后应用定理 18.7，当 $0 < \eta < 0.1$ 时，从任意起点都能收敛。从相同的零起点出发，原始输入在 $\eta = 0.03$ 时就已经发散。中心化拟合报告 $b \approx 4$，截距为 $x = 2$：直线 $y = 1.2(x - 2) + 4$，与之前相同。两个函数如果在允许的更新次数内未达到容忍度，则报告错误。
:::

```check
Hraw = hessian(E9, (m, b))
same_set(list(Hraw.eigenvals().keys()), [35 + 5*sqrt(41), 35 - 5*sqrt(41)])
holds(Abs(1 - Rational(3, 100)*(35 + 5*sqrt(41))) > 1); holds(Abs(1 - Rational(3, 100)*(35 - 5*sqrt(41))) < 1)   # eta = 0.03 diverges (raw)
vfast_ = Matrix([(5 + sqrt(41))/4, 1])
same(Hraw*vfast_, (35 + 5*sqrt(41))*vfast_)
holds(Matrix([-Rational(6, 5), -Rational(8, 5)]).dot(vfast_) < 0)       # the zero start has a nonzero unstable component
same(2/Integer(20), Rational(1, 10)); same(hessian(E9c, (m, b))[0, 0], 20)
for curvature_, count_ in ((10, 69), (100, 691), (1000, 6908)):
    rho_ = Rational(curvature_ - 1, curvature_ + 1)
    holds(rho_**count_ <= Rational(1, 10**6)); holds(rho_**(count_ - 1) > Rational(1, 10**6))
same(1 - Rational(2, 1 + 1), 0)                                    # kappa = 1: one update
for objective_, count_ in ((E9, 193), (E9c, 61)):
    H_ = hessian(objective_, (m, b))
    g0_ = Matrix([diff(objective_, v_).subs({m: 0, b: 0}) for v_ in (m, b)])
    before_ = (eye(2) - H_/40)**(count_ - 1)*g0_
    after_ = (eye(2) - H_/40)*before_
    holds(max(abs(v_) for v_ in before_) >= Rational(1, 10**6))
    holds(max(abs(v_) for v_ in after_) < Rational(1, 10**6))
same(hessian(x**4 + y**4, (x, y)).subs({x: 0, y: 0}), zeros(2))
import numpy as _np
def _gd(xv, eta, n):
    mm_ = bb_ = 0.0
    for _ in range(n):
        e_ = _np.array([1, 4, 3, 6, 6.0]) - (mm_*xv + bb_); mm_, bb_ = mm_ + 2*eta*_np.sum(xv*e_), bb_ + 2*eta*_np.sum(e_)
    return mm_, bb_
holds(abs(_gd(_np.array([0, 1, 2, 3, 4.0]), 0.03, 400)[0]) > 50); near(_gd(_np.array([-2, -1, 0, 1, 2.0]), 0.099, 2000)[1], 4, 1e-6)
```

::: pitfall
三张梯度下降的卡片。**"更大的步长总是更快"**：更大的步长即使在低于$2/c$的情况下也可能更差。对于二次碗，步长超过$2/c$会使最陡方向上的非零分量不断增大。**"梯度下降朝向最小值"**：非零负梯度给出最陡局部下降的方向。在椭圆形碗上，它直接指向坐标轴上的最小值，但在其他地方通常穿过山谷；圆形等高线使得每个方向都呈径向分布。**"它总能找到一个最小值"**：它不一定收敛，甚至一个收敛序列也可能到达一个鞍点。在$f = x^2 - y^2$，具有$0 < \eta < 1$的情况下，起点在$x$轴上会保持不动并收敛到原点的鞍点；起点不在轴上则会逃逸，因为其$y$坐标在每一步都会乘以$1 + 2\eta > 1$。
:::

```check
xs_, ys_ = Integer(1), Integer(0)
same(Matrix([x, y]) - eb_*Matrix([2*x, -2*y]), Matrix([(1 - 2*eb_)*x, (1 + 2*eb_)*y]))
same(solve_univariate_inequality(Abs(1 - 2*er_) < 1, er_, relational=False), Interval.open(0, 1))
holds(1 + 2*eb_ > 1)
for _ in range(30):
    xs_, ys_ = xs_ - Rational(1, 10)*2*xs_, ys_ + Rational(1, 10)*2*ys_
holds(ys_ == 0); holds(abs(xs_) < Rational(1, 100)); same(xs_, Rational(4, 5)**30)
xs_, ys_ = Integer(1), Rational(1, 1000)
for _ in range(30):
    xs_, ys_ = xs_ - Rational(1, 10)*2*xs_, ys_ + Rational(1, 10)*2*ys_
holds(ys_ > 0.2); holds(Rational(1, 1000)*Rational(12, 10)**5 < Rational(3, 1000))
```

## 你所学到的内容 {#summary}

- $f(x, y)$ 的局部极值出现在 **临界点**，其中 $\nabla f = \vb{0}$ 或偏导数不存在。一个内部临界点，既不是局部最大值也不是局部最小值，则是一个 **鞍点**，如 $x^2 - y^2$ 的原点。
- **二阶导数判别法**在满足$\nabla f = \vb{0}$的内部点处适用，当该点附近二阶偏导数连续时。若$D = f_{xx}f_{yy} - f_{xy}^2$，则**Hessian矩阵**的行列式$D > 0$和$f_{xx} > 0$对应局部极小值；$D > 0$和$f_{xx} < 0$对应局部极大值；$D < 0$对应鞍点；$D = 0$对应无法判断。该方法通过二次近似式的符号进行判断。
- 在一个 **非空、闭合、有界** 区域上连续的函数具有绝对极值（极值定理）：比较其内部临界点的函数值与边界上的极值，边界上的极值可用一元方法分段求得。
- **拉格朗日乘数法**：对于 $f$ 和 $g$，在附近连续一阶偏导数的情况下， $f$ 在 $g = c$ 上的极值点 $\nabla g \ne \vb{0}$ 满足 $\nabla f = \lambda\nabla g$。添加奇异点和约束的端点，进行比较，并确保极值存在。对于两个这样的约束且梯度独立时， $\nabla f = \lambda\nabla g + \mu\nabla h$。沿可微的最佳点族，乘数是最佳值随 $c$ 变化的速率。
- **最小二乘法**：使 $y = mx + b$ 最小化的直线 $E(m, b) = \sum(y_i - mx_i - b)^2$ 解出正规方程， $\partial E/\partial m = \partial E/\partial b = 0$。它经过均值点，并且当至少有两个输入不同时是唯一的。
- **梯度下降**在碗$\tfrac12(ax^2 + cy^2)$上，带有$0 < a \le c$，从每个起点收敛当且仅当$0 < \eta < 2/c$。最佳固定步长每步将到最小值的距离缩小$\tfrac{\kappa - 1}{\kappa + 1}$，其中$\kappa = c/a$是**条件数**。细长水平曲线可能导致缓慢的之字形路径；重缩放或中心化可能有所帮助。

## 练习 {#exercises}

:::: exercise 临界点及其判别 {#ex-18-1} ★
求下列函数的临界点并判别其类型：

- (a) $f(x, y) = x^2 + xy + y^2 - 3x$
- (b) $g(x, y) = x^3 - 12x + y^2 + 4y$

::: solution
**(a)** $f_x = 2x + y - 3$ 和 $f_y = x + 2y$. 第二个方程给出 $x = -2y$；然后第一个方程变为 $-4y + y - 3 = 0$，因此 $y = -1$ 和 $x = 2$. 唯一的临界点是 $(2, -1)$. 二阶偏导数是常数，分别为 $f_{xx} = 2$、$f_{xy} = 1$ 和 $f_{yy} = 2$，因此 $D = 4 - 1 = 3 > 0$ 与 $f_{xx} > 0$：$f(2, -1) = 4 - 2 + 1 - 6 = -3$ 是局部极小值。实际上它是全局极小值：对于二次多项式，二次近似是精确的，$f(2 + h, -1 + k) = -3 + h^2 + hk + k^2$，且 $h^2 + hk + k^2 = \big(h + \tfrac{k}{2}\big)^2 + \tfrac34k^2 > 0$ 对于 $(h, k) \ne (0, 0)$.

**(b)** $g_x = 3x^2 - 12 = 0$ 给出 $x = \pm2$，且 $g_y = 2y + 4 = 0$ 给出 $y = -2$：临界点为 $(2, -2)$ 和 $(-2, -2)$。结合 $g_{xx} = 6x$、$g_{xy} = 0$ 和 $g_{yy} = 2$，得到 $D = 12x$。

- 在 $(2, -2)$: $D = 24 > 0$ 和 $g_{xx} = 12 > 0$，因此 $g(2, -2) = 8 - 24 + 4 - 8 = -20$ 是一个局部最小值。
- 在 $(-2, -2)$ 处：$D = -24 < 0$，一个鞍点，具有 $g(-2, -2) = -8 + 24 + 4 - 8 = 12$。

```check
f1a = x**2 + x*y + y**2 - 3*x
same(diff(f1a, x), 2*x + y - 3); same(diff(f1a, y), x + 2*y)
same(solve([diff(f1a, x), diff(f1a, y)], [x, y], dict=True), [{x: 2, y: -1}])
same(hessian(f1a, (x, y)), Matrix([[2, 1], [1, 2]])); same(hessian(f1a, (x, y)).det(), 3); same(f1a.subs({x: 2, y: -1}), -3)
same(expand(f1a.subs({x: 2 + h, y: -1 + k})), -3 + h**2 + h*k + k**2); same(expand((h + k/2)**2 + Rational(3, 4)*k**2), h**2 + h*k + k**2)
g1b = x**3 - 12*x + y**2 + 4*y
same(diff(g1b, x), 3*x**2 - 12); same(diff(g1b, y), 2*y + 4)
same_set(solve([diff(g1b, x), diff(g1b, y)], [x, y], dict=True), [{x: 2, y: -2}, {x: -2, y: -2}])
same(hessian(g1b, (x, y)), Matrix([[6*x, 0], [0, 2]]))
same(hessian(g1b, (x, y)).det(), 12*x)
same(g1b.subs({x: 2, y: -2}), -20); same(g1b.subs({x: -2, y: -2}), 12); same(8 - 24 + 4 - 8, -20); same(-8 + 24 + 4 - 8, 12)
```
:::
::::

:::: exercise 读取测试 {#ex-18-2} ★
在具有连续二阶偏导数的函数的五个内部临界点附近，二阶偏导数为：

| 点 | $f_{xx}$ | $f_{xy}$ | $f_{yy}$ |
|---|---|---|---|
| $P_1$ | $2$ | $3$ | $5$ |
| $P_2$ | $-1$ | $2$ | $-3$ |
| $P_3$ | $-4$ | $1$ | $-1$ |
| $P_4$ | $4$ | $-2$ | $1$ |
| $P_5$ | $0$ | $1$ | $0$ |

- (a) 尽可能利用二阶导数测试对每个点进行分类。
- (b) 在 $P_2$ 处，$f_{xx}$ 和 $f_{yy}$ 都为负数。使用第 18.2 节的二次 $Q(h, k)$，找出 $f$ 从 $P_2$ 增加的方向。

::: solution
**(a)** 计算 $D = f_{xx}f_{yy} - f_{xy}^2$ 在各点的值。

- $P_1$: $D = 10 - 9 = 1 > 0$ 和 $f_{xx} > 0$: 一个局部极小值。
- $P_2$: $D = 3 - 4 = -1 < 0$: 一个鞍点。
- $P_3$: $D = 4 - 1 = 3 > 0$ 和 $f_{xx} < 0$: 一个局部极大值。
- $P_4$: $D = 4 - 4 = 0$: 测试无结论。
- $P_5$: $D = 0 - 1 = -1 < 0$: 一个鞍点。

**(b)** 在$P_2$处，$Q(h, k) = -h^2 + 4hk - 3k^2 = -(h - k)(h - 3k)$。当$h - k$和$h - 3k$符号相反时它为正值，例如在$(h, k) = (2, 1)$处，其中$Q = -4 + 8 - 3 = 1$。对于位移$(h, k) = (2t, t)$和$Q = t^2$，因此对于足够小的非零$t$，二次近似及其较小的余项给出$f(P_2 + (2t, t)) > f(P_2)$。沿$(t, 0)$和$Q = -t^2$，值更小。鞍点可能隐藏在两个负的纯二阶导数之后；混合导数起决定作用。

```check
tab = {1: (2, 3, 5), 2: (-1, 2, -3), 3: (-4, 1, -1), 4: (4, -2, 1), 5: (0, 1, 0)}
same({kname: fxx_*fyy_ - fxy_**2 for kname, (fxx_, fxy_, fyy_) in tab.items()}, {1: 1, 2: -1, 3: 3, 4: 0, 5: -1})
QQ = -hh_**2 + 2*2*hh_*kk_ - 3*kk_**2
same(QQ, -(hh_ - kk_)*(hh_ - 3*kk_)); same(QQ.subs({hh_: 2, kk_: 1}), 1); same(QQ.subs({hh_: -2, kk_: -1}), 1); same(QQ.subs({hh_: 1, kk_: 0}), -1)
same(QQ.subs({hh_: 2*t, kk_: t}), t**2); same(QQ.subs({hh_: t, kk_: 0}), -t**2)
```
:::
::::

:::: exercise 一个圆上的约束极值点 {#ex-18-3} ★
用拉格朗日乘数法找出 $f(x, y) = x^2 + 2y^2$ 在圆 $x^2 + y^2 = 1$ 上的最大值和最小值，以及每个候选点的乘数。用第 18.4 节的控件验证你的答案，并用等高线解释为何极值出现在这些位置。

::: solution
用 $g = x^2 + y^2$、$\nabla f = \langle 2x, 4y\rangle$ 和 $\nabla g = \langle 2x, 2y\rangle$，从不 $\vb{0}$ 在圆上。方程为

$$2x = 2\lambda x, \quad 4y = 2\lambda y, \quad x^2 + y^2 = 1,$$

即 $x(1 - \lambda) = 0$ 和 $y(2 - \lambda) = 0$。若 $x \ne 0$，则 $\lambda = 1$，因此 $y(2 - 1) = 0$ 给出 $y = 0$ 和 $x = \pm1$。若 $x = 0$，圆给出 $y = \pm1$，然后 $\lambda = 2$。候选点为 $(\pm1, 0)$，带 $f = 1$ 和 $\lambda = 1$，以及 $(0, \pm1)$，带 $f = 2$ 和 $\lambda = 2$。圆是闭合且有界的，因此 $f$ 在其上的最大值为 2，在 $(0, \pm1)$ 处，最小值为 1，在 $(\pm1, 0)$ 处。

取消第一个方程中的 $x$ 得到 $\lambda = 1$ 会丢失两个最大值点。在部件中，选择 $x^2 + 2y^2$ 和圆：在 $t = 0^\circ$ 和 $180^\circ$ 处它报告 $\lambda = 1$，在 $90^\circ$ 和 $270^\circ$ 处报告 $\lambda = 2$。对于 $k > 0$，等高线 $x^2 + 2y^2 = k$ 是椭圆，其宽度是高度的 $\sqrt2$ 倍。椭圆 $k = 1$，其半长轴为 1 和 $\tfrac{1}{\sqrt2}$，位于圆内并与之在 $(\pm1, 0)$ 处相切；椭圆 $k = 2$，其半长轴为 $\sqrt2$ 和 1，位于圆外并与之在 $(0, \pm1)$ 处相切。

```check
xr3, yr3, lr3 = symbols('x y lambda', real=True)
same_set(solve([2*xr3 - 2*lr3*xr3, 4*yr3 - 2*lr3*yr3, xr3**2 + yr3**2 - 1], [xr3, yr3, lr3], dict=True),
         [{xr3: 1, yr3: 0, lr3: 1}, {xr3: -1, yr3: 0, lr3: 1}, {xr3: 0, yr3: 1, lr3: 2}, {xr3: 0, yr3: -1, lr3: 2}])
same(2*x - 2*lam_*x, 2*x*(1 - lam_)); same([(x**2 + 2*y**2).subs({x: px_, y: py_}) for px_, py_ in ((1, 0), (0, 1))], [1, 2])
same(maximum(cos(t)**2 + 2*sin(t)**2, t, Interval(0, 2*pi)), 2); same(minimum(cos(t)**2 + 2*sin(t)**2, t, Interval(0, 2*pi)), 1)
holds(1/sqrt(2) < 1); same((x**2 + 2*y**2).subs({x: 0, y: 1/sqrt(2)}), 1); same((x**2 + 2*y**2).subs({x: sqrt(2), y: 0}), 2)
level18 = symbols('level', positive=True); same(sqrt(level18)/sqrt(level18/2), sqrt(2))
```
:::
::::

:::: exercise 通过三个点的直线 {#ex-18-4} ★
找出点 $(1, 2)$、$(2, 3)$ 和 $(3, 5)$ 的最小二乘直线，其残差和平方误差之和。检查该直线是否通过均值点。

::: solution
总和：$n = 3$, $\sum x_i = 6$, $\sum x_i^2 = 1 + 4 + 9 = 14$, $\sum y_i = 10$ 和 $\sum x_iy_i = 2 + 6 + 15 = 23$。正规方程为

$$14m + 6b = 23, \qquad 6m + 3b = 10.$$

从第一个方程减去第二个方程的两倍，得到 $2m = 3$，故 $m = \tfrac32$，再由 $3b = 10 - 9 = 1$ 得 $b = \tfrac13$。因此直线为 $y = \tfrac32x + \tfrac13$。在 $x = 1, 2, 3$ 处的预测值为 $\tfrac{11}{6}$、$\tfrac{10}{3}$ 和 $\tfrac{29}{6}$，因此残差分别为 $\tfrac16$、$-\tfrac13$ 和 $\tfrac16$（总和为 0），且

$$E = \frac{1}{36} + \frac{1}{9} + \frac{1}{36} = \frac{1}{6}.$$

平均点是 $\big(2, \tfrac{10}{3}\big)$，确实 $\tfrac32 \cdot 2 + \tfrac13 = \tfrac{10}{3}$。

```check
X4 = [1, 2, 3]; Y4 = [2, 3, 5]
E4 = sum((yi - m*xi - b)**2 for xi, yi in zip(X4, Y4))
same([sum(X4), sum(xi**2 for xi in X4), sum(Y4), sum(xi*yi for xi, yi in zip(X4, Y4))], [6, 14, 10, 23])
same(solve([diff(E4, m), diff(E4, b)], [m, b], dict=True), [{m: Rational(3, 2), b: Rational(1, 3)}])
same((14*m + 6*b) - 2*(6*m + 3*b), 2*m); same(23 - 2*10, 3)
same([Rational(3, 2)*xi + Rational(1, 3) for xi in X4], [Rational(11, 6), Rational(10, 3), Rational(29, 6)])
res4 = [yi - Rational(3, 2)*xi - Rational(1, 3) for xi, yi in zip(X4, Y4)]
same(res4, [Rational(1, 6), -Rational(1, 3), Rational(1, 6)]); same(sum(res4), 0)
same(E4.subs({m: Rational(3, 2), b: Rational(1, 3)}), Rational(1, 6)); same(Rational(1, 36) + Rational(1, 9) + Rational(1, 36), Rational(1, 6))
same(Rational(3, 2)*2 + Rational(1, 3), Rational(10, 3)); same(Rational(sum(Y4), 3), Rational(10, 3))
```
:::
::::

:::: exercise 四个临界点 {#ex-18-5} ★★
求 $f(x, y) = 2x^3 + xy^2 + 5x^2 + y^2$ 的临界点并进行分类。 $f$ 是否有绝对最大值？

::: solution
$f_x = 6x^2 + y^2 + 10x$ 和 $f_y = 2xy + 2y = 2y(x + 1)$。第二个为 0 当 $y = 0$ 或 $x = -1$。

- 若 $y = 0$： $6x^2 + 10x = 2x(3x + 5) = 0$，所以 $x = 0$ 或 $x = -\tfrac53$。
- 若 $x = -1$： $6 + y^2 - 10 = 0$，所以 $y^2 = 4$ 和 $y = \pm2$。

临界点为 $(0, 0)$， $\big(-\tfrac53, 0\big)$， $(-1, 2)$ 和 $(-1, -2)$。二阶偏导数为 $f_{xx} = 12x + 10$， $f_{xy} = 2y$ 和 $f_{yy} = 2x + 2$，因此：

- 在 $(0, 0)$: $f_{xx} = 10$, $f_{xy} = 0$, $f_{yy} = 2$, 所以 $D = 20 > 0$ 与 $f_{xx} > 0$: 一个局部极小值, $f(0, 0) = 0$.
- 在 $\big(-\tfrac53, 0\big)$: $f_{xx} = -10$, $f_{xy} = 0$, $f_{yy} = -\tfrac43$, 所以 $D = \tfrac{40}{3} > 0$ 与 $f_{xx} < 0$: 一个局部极大值, $f = \tfrac{125}{27}$.
- 在 $(-1, \pm2)$: $f_{xx} = -2$, $f_{xy} = \pm4$, $f_{yy} = 0$, 所以 $D = -16 < 0$: 两个鞍点, 其中 $f = 3$.

例如

$$f\big(-\tfrac53, 0\big) = 2\Big(-\frac{125}{27}\Big) + 5 \cdot \frac{25}{9} = \frac{-250 + 375}{27} = \frac{125}{27} \approx 4.630.$$

局部极大值不是全局极大值, 且不存在: $f(x, 0) = 2x^3 + 5x^2 \to \infty$ 作为 $x \to \infty$.

```check
f5 = 2*x**3 + x*y**2 + 5*x**2 + y**2
same(diff(f5, x), 6*x**2 + y**2 + 10*x); same(factor(diff(f5, y)), 2*y*(x + 1)); same(factor(6*x**2 + 10*x), 2*x*(3*x + 5))
same_set(solve([diff(f5, x), diff(f5, y)], [x, y], dict=True), [{x: 0, y: 0}, {x: -Rational(5, 3), y: 0}, {x: -1, y: 2}, {x: -1, y: -2}])
H5 = hessian(f5, (x, y)); same(H5, Matrix([[12*x + 10, 2*y], [2*y, 2*x + 2]]))
for (px_, py_), (dv, fv) in {(0, 0): (20, 0), (-Rational(5, 3), 0): (Rational(40, 3), Rational(125, 27)), (-1, 2): (-16, 3), (-1, -2): (-16, 3)}.items():
    same(H5.det().subs({x: px_, y: py_}), dv); same(f5.subs({x: px_, y: py_}), fv)
same(H5.subs({x: -Rational(5, 3), y: 0}), Matrix([[-10, 0], [0, -Rational(4, 3)]])); same(H5[0, 0].subs(x, 0), 10)
steps(f5.subs({x: -Rational(5, 3), y: 0}), 2*(-Rational(125, 27)) + 5*Rational(25, 9), Rational(-250 + 375, 27), Rational(125, 27)); rounds(Rational(125, 27), '4.630')
limit_is(f5.subs(y, 0), x, oo, oo)
```
:::
::::

:::: exercise 圆盘上的极值 {#ex-18-6} ★★
求 $f(x, y) = x^2 + 2y^2 - 2x$ 在圆盘 $x^2 + y^2 \le 4$ 上的绝对最大值和最小值.

::: solution
$f$ 是连续的, 且圆盘是闭合且有界的, 所以这两个值都存在.

**内部。** $f_x = 2x - 2$ 和 $f_y = 4y$ 仅在 $(1, 0)$ 处为 0，该点位于圆盘内部，因为 $1 < 4$。那里 $f(1, 0) = 1 - 2 = -1$。

**边界上.** 用 $x = 2\cos t$, $y = 2\sin t$, $0 \le t \le 2\pi$ 参数化. 与 $\sin^2 t = 1 - \cos^2 t$,

$$f = 4\cos^2 t + 8\sin^2 t - 4\cos t = 8 - 4\cos^2 t - 4\cos t.$$

当 $t$ 绕圆周运动时， $u = \cos t$ 经过 $[-1, 1]$，因此找出 $\varphi(u) = 8 - 4u^2 - 4u$ 在 $[-1, 1]$ 上的极值。 $\varphi'(u) = -8u - 4 = 0$ 在 $u = -\tfrac12$，与 $\varphi\big(-\tfrac12\big) = 8 - 1 + 2 = 9$；在端点 $\varphi(1) = 0$ 和 $\varphi(-1) = 8$ 处。值 9 在 $\cos t = -\tfrac12$ 处取得，对应点 $(-1, \pm\sqrt3)$；值 0 在 $(2, 0)$ 处，值 8 在 $(-2, 0)$ 处。

**比较** $-1$, $9$, $0$ 和 $8$：绝对最大值是 9，在 $(-1, \sqrt3)$ 和 $(-1, -\sqrt3)$ 处取得，绝对最小值是 $-1$，在 $(1, 0)$ 处取得，位于圆盘内部。

```check
f6 = x**2 + 2*y**2 - 2*x
same(solve([diff(f6, x), diff(f6, y)], [x, y], dict=True), [{x: 1, y: 0}]); same(f6.subs({x: 1, y: 0}), -1)
steps(f6.subs({x: 2*cos(t), y: 2*sin(t)}), 4*cos(t)**2 + 8*sin(t)**2 - 4*cos(t), 8 - 4*cos(t)**2 - 4*cos(t))
ph6 = 8 - 4*u**2 - 4*u
same(solve(diff(ph6, u), u), [-Rational(1, 2)]); same([ph6.subs(u, uv) for uv in (-Rational(1, 2), 1, -1)], [9, 0, 8])
same(f6.subs({x: -1, y: sqrt(3)}), 9); same(f6.subs({x: -1, y: -sqrt(3)}), 9); same(f6.subs({x: 2, y: 0}), 0); same(f6.subs({x: -2, y: 0}), 8)
same((-1)**2 + sqrt(3)**2, 4); same(maximum(ph6, u, Interval(-1, 1)), 9); same(minimum(ph6, u, Interval(-1, 1)), 0)
```
:::
::::

:::: exercise 平面上最近的点 {#ex-18-7} ★★
使用拉格朗日乘数法找出平面 $x + 2y + 2z = 14$ 上距离点 $(1, 1, 1)$ 最近的点及其距离。解释为何存在最近点，并用几何方法验证答案。

::: solution
在约束 $g = x + 2y + 2z = 14$ 下，最小化距离的平方 $f = (x - 1)^2 + (y - 1)^2 + (z - 1)^2$，与 $\nabla g = \langle 1, 2, 2\rangle \ne \vb{0}$ 相关。方程 $\nabla f = \lambda\nabla g$ 为

$$2(x - 1) = \lambda, \quad 2(y - 1) = 2\lambda, \quad 2(z - 1) = 2\lambda,$$

因此$x = 1 + \tfrac{\lambda}{2}$和$y = z = 1 + \lambda$。平面给出$\big(1 + \tfrac{\lambda}{2}\big) + 2(1 + \lambda) + 2(1 + \lambda) = 5 + \tfrac92\lambda = 14$，因此$\lambda = 2$且该点为$(2, 3, 3)$。其到$(1, 1, 1)$的距离为$\sqrt{1 + 4 + 4} = 3$。

**存在一个最近点。**满足$f \le 9$条件的平面上的点构成一个非空闭有界集，因为它包含$(2, 3, 3)$。在该集合上$f$取得最小值（由三元函数的极值定理保证），至多为9，而在其外部$f > 9$。因此该最小值即为整个平面上的最小值，且方法适用的点处取得：它是唯一的候选点$(2, 3, 3)$。满足$f \le 9$条件的集合因此仅由该点构成。

**几何上**, $(2, 3, 3) - (1, 1, 1) = \langle 1, 2, 2\rangle$, 平面的法向量（模块 16）：从一点到平面的最短线段垂直于平面。模块 16 中给出的点到平面的距离公式得出相同的结果：

$$\frac{\abs{1 + 2 \cdot 1 + 2 \cdot 1 - 14}}{\sqrt{1^2 + 2^2 + 2^2}} = \frac{9}{3} = 3.$$

```check
xr9, yr9, zr9, lr9 = symbols('x y z lambda', real=True)
f7 = (xr9 - 1)**2 + (yr9 - 1)**2 + (zr9 - 1)**2
same(solve([diff(f7, s_) - lr9*c_ for s_, c_ in zip((xr9, yr9, zr9), (1, 2, 2))] + [xr9 + 2*yr9 + 2*zr9 - 14], [xr9, yr9, zr9, lr9], dict=True),
     [{xr9: 2, yr9: 3, zr9: 3, lr9: 2}])
same((1 + lr9/2) + 2*(1 + lr9) + 2*(1 + lr9), 5 + Rational(9, 2)*lr9); same(solve(5 + Rational(9, 2)*x - 14, x), [2])
same(sqrt(f7.subs({xr9: 2, yr9: 3, zr9: 3})), 3); same(Matrix([2, 3, 3]) - Matrix([1, 1, 1]), Matrix([1, 2, 2]))
same(Abs(1 + 2*1 + 2*1 - 14)/sqrt(1**2 + 2**2 + 2**2), 3); same(Rational(9, 3), 3)
```
:::
::::

:::: exercise 手动进行梯度下降 {#ex-18-8} ★★
设 $f(x, y) = x^2 + 4y^2$。

- (a) 从 $(4, 2)$ 出发，使用 $\eta = 0.2$ 进行三次梯度下降。
- (b) 梯度下降从任意初始点收敛的步长是哪些？对于 $\eta = 0.3$ 会发生什么？
- (c) 哪种步长在第18.6节的意义下最好，什么条件数？
- (d) 将$y$重新缩放使得等高线变为圆，并找出一个步长使得在一步内达到最小值。

::: solution
**(a)** $\nabla f = \langle 2x, 8y\rangle$，所以与 $\eta = 0.2$， $x_{k+1} = x_k - 0.4x_k = 0.6x_k$ 和 $y_{k+1} = y_k - 1.6y_k = -0.6y_k$：

$$(4, 2) \to (2.4, -1.2) \to (1.44, 0.72) \to (0.864, -0.432).$$

**(b)** $f = \tfrac12(2x^2 + 8y^2)$，所以 $a = 2$ 和 $c = 8$ 在定理18.7中：梯度下降从任意起点收敛当且仅当 $0 < \eta < \tfrac28 = 0.25$。与 $\eta = 0.3$， $y_{k+1} = (1 - 2.4)y_k = -1.4y_k$：从任何起点 $y_0 \ne 0$， $y$ 坐标来回震荡且幅度增大，方法发散。

**(c)** 最佳固定步长是 $\eta^* = \tfrac{2}{a + c} = \tfrac{2}{10} = 0.2$，即(a)中的步长，其中两个坐标都按因子 $0.6 = \tfrac{8 - 2}{8 + 2}$ 收缩。条件数是 $\kappa = \tfrac82 = 4$，并且确实 $\tfrac{\kappa - 1}{\kappa + 1} = \tfrac35$。

**(d)** 放 $v = 2y$：则 $f = x^2 + v^2$，其等高线为圆。其梯度在 $x$ 和 $v$ 处为 $\langle 2x, 2v\rangle$，且步长 $\eta = 0.5$ 给出 $(x, v) - 0.5\langle 2x, 2v\rangle = (0, 0)$：从任意起点出发，一步即可达到最小值。

```check
pg = [(Integer(4), Integer(2))]
same([diff(x**2 + 4*y**2, v) for v in (x, y)], [2*x, 8*y])
for _ in range(3):
    px_, py_ = pg[-1]; pg.append((px_ - Rational(1, 5)*2*px_, py_ - Rational(1, 5)*8*py_))
same(pg, [(4, 2), (Rational(12, 5), -Rational(6, 5)), (Rational(36, 25), Rational(18, 25)), (Rational(108, 125), -Rational(54, 125))])
same([(Rational(12, 5), -Rational(6, 5)), (Rational(36, 25), Rational(18, 25)), (Rational(108, 125), -Rational(54, 125))], [(Rational(24, 10), -Rational(12, 10)), (Rational(144, 100), Rational(72, 100)), (Rational(864, 1000), -Rational(432, 1000))])
same((2*x**2 + 8*y**2)/2, x**2 + 4*y**2); same(Rational(2, 8), Rational(1, 4)); same(1 - Rational(3, 10)*8, -Rational(14, 10))
same(Rational(2, 2 + 8), Rational(1, 5)); same(Rational(8 - 2, 8 + 2), Rational(3, 5)); same((4 - 1)/Integer(4 + 1), Rational(3, 5))
same((x**2 + 4*y**2).subs(y, vv_/2), x**2 + vv_**2); same(Matrix([x, vv_]) - Rational(1, 2)*Matrix([2*x, 2*vv_]), Matrix([0, 0]))
```
:::
::::

:::: exercise 最便宜的圆柱形罐子，乘数为 {#ex-18-9} ★★
[例 8.14](module_08_ZH.html#optimisation) 通过消去 $h$ 找到了体积为 330 cm³ 的封闭圆柱形罐子的最小表面积。使用拉格朗日乘数法解决同一问题：在约束 $\pi r^2h = 330$ 下最小化 $A(r, h) = 2\pi r^2 + 2\pi rh$，其中 $r, h > 0$。然后利用 $\lambda$ 的含义（第 18.4 节）估算体积为 331 cm³ 的罐子需要多出多少金属。

::: solution
$\nabla A = \langle 4\pi r + 2\pi h,\ 2\pi r\rangle$ 且，与 $V = \pi r^2h$ 一起，为 $\nabla V = \langle 2\pi rh,\ \pi r^2\rangle$。方程为

$$\begin{aligned} 4\pi r + 2\pi h &= \lambda\,2\pi rh, \\ 2\pi r &= \lambda\,\pi r^2, \\ \pi r^2h &= 330. \end{aligned}$$

第二个，除以 $\pi r > 0$，得到 $\lambda = \tfrac{2}{r}$。然后第一个变为 $4\pi r + 2\pi h = \tfrac2r \cdot 2\pi rh = 4\pi h$，因此 $4\pi r = 2\pi h$ 和 $h = 2r$：最佳的可以尽可能高，也可以尽可能宽，如例 8.14 所示。体积给出 $2\pi r^3 = 330$，因此 $r = \sqrt[3]{165/\pi} \approx 3.745$ cm， $h \approx 7.49$ cm 和 $\lambda = \tfrac2r \approx 0.534$。这个候选者给出最小值已在例 8.14 中证明。

根据第 18.4 节的“深入一步”框， $\lambda$ 是最小面积随体积增长的速率：大约是每额外 1 cm³，0.534 cm² 的金属。因此，一个 331 cm³ 的罐子需要大约 0.53 cm² 更多的金属。（精确的最小面积是 $6\pi r^2$ 与 $r^3 = \tfrac{V}{2\pi}$，以及 $6\pi\big(\tfrac{331}{2\pi}\big)^{2/3} - 6\pi\big(\tfrac{330}{2\pi}\big)^{2/3} \approx 0.534$。）

```check
rr_, hc_, lc_ = symbols('r h lambda', positive=True)
Ac = 2*pi*rr_**2 + 2*pi*rr_*hc_; Vc = pi*rr_**2*hc_
same(diff(Ac, rr_), 4*pi*rr_ + 2*pi*hc_); same(diff(Ac, hc_), 2*pi*rr_); same(diff(Vc, rr_), 2*pi*rr_*hc_); same(diff(Vc, hc_), pi*rr_**2)
same(solve(2*pi*rr_ - lc_*pi*rr_**2, lc_), [2/rr_]); same(4*pi*rr_ + 2*pi*hc_ - (2/rr_)*2*pi*rr_*hc_, 4*pi*rr_ - 2*pi*hc_)
solc = solve([diff(Ac, rr_) - lc_*diff(Vc, rr_), diff(Ac, hc_) - lc_*diff(Vc, hc_), Vc - 330], [rr_, hc_, lc_], dict=True)
rstar18 = (165/pi)**Rational(1, 3)
same(len(solc), 1); same(solc[0][rr_], rstar18); same(solc[0][hc_], 2*rstar18); same(solc[0][lc_], 2/rstar18)
rounds(rstar18, '3.745'); rounds(2*rstar18, '7.49'); rounds(2/rstar18, '0.534')
Vv = symbols('V', positive=True); Astar = 6*pi*(Vv/(2*pi))**Rational(2, 3)
same(Astar.subs(Vv, 330), Ac.subs({rr_: rstar18, hc_: 2*rstar18})); same(diff(Astar, Vv).subs(Vv, 330), 2/rstar18)
rounds(Astar.subs(Vv, 331) - Astar.subs(Vv, 330), '0.534'); rounds(2/rstar18, '0.53')
```
:::
::::

:::: exercise 最佳固定步长 {#ex-18-10} ★★★
设 $f(x, y) = \tfrac12(ax^2 + cy^2)$ 与 $0 < a < c$，以及 $\kappa = c/a$。

- (a) 证明梯度下降的一次迭代将距离最小值的乘数最多为 $\rho(\eta) = \max\big(\abs{1 - \eta a}, \abs{1 - \eta c}\big)$，并且对于合适的起始点，精确为 $\rho(\eta)$。
- (b) 证明 $\rho(\eta)$ 在 $\eta^* = \dfrac{2}{a + c}$ 处取得最小值，此时等于 $\dfrac{\kappa - 1}{\kappa + 1}$。
- (c) 使用 $\eta^*$，当 $\kappa$ 很大时，将点 $10^6$ 带到最小值附近大约需要多少步？用 $\ln(1 + u) \approx u$ 表示小的 $u$，并与第 18.6 节的“动手计算”框进行比较。

::: solution
**(a)** 一步将 $(x, y)$ 变为 $\big((1 - \eta a)x,\ (1 - \eta c)y\big)$，其到原点的距离为

$$\sqrt{(1 - \eta a)^2x^2 + (1 - \eta c)^2y^2} \le \sqrt{\rho^2x^2 + \rho^2y^2} = \rho\sqrt{x^2 + y^2}.$$

如果 $\rho = \abs{1 - \eta a}$，则 $x$ 轴上的起点乘以恰好 $\rho$；如果 $\rho = \abs{1 - \eta c}$，则 $y$ 轴上的起点为。

**(b)** 对于每一个 $\eta > 0$， $\rho(\eta) \ge 1 - \eta a$ 和 $\rho(\eta) \ge \eta c - 1$，由于 $\abs{s} \ge s$ 和 $\abs{s} \ge -s$。在 $\eta^*$ 处， $1 - \eta^*a = \tfrac{c - a}{c + a}$ 和 $\eta^*c - 1 = \tfrac{c - a}{c + a}$，因此 $\rho(\eta^*) = \tfrac{c - a}{c + a}$。如果 $\eta < \eta^*$，则 $\rho(\eta) \ge 1 - \eta a > 1 - \eta^*a = \rho(\eta^*)$；如果 $\eta > \eta^*$，则 $\rho(\eta) \ge \eta c - 1 > \eta^*c - 1 = \rho(\eta^*)$。因此 $\eta^*$ 是最佳固定步长，将分子和分母同时除以 $a$ 得到 $\rho(\eta^*) = \tfrac{\kappa - 1}{\kappa + 1}$。

**(c)** 经过 $k$ 步后，距离至多为初始距离的 $\rho^k$ 倍，因此只需 $\rho^k \le 10^{-6}$，即，

$$k \ge \frac{\ln 10^6}{\ln\frac{\kappa + 1}{\kappa - 1}}.$$

用 $u = \tfrac1\kappa$，$\ln\tfrac{\kappa + 1}{\kappa - 1} = \ln(1 + u) - \ln(1 - u) \approx u - (-u) = \tfrac{2}{\kappa}$，所以 $k \approx \tfrac{\ln 10^6}{2}\,\kappa \approx 6.91\kappa$：大约 69 步用于 $\kappa = 10$，691 步用于 $\kappa = 100$，6908 步用于 $\kappa = 1000$。计算框统计了 69、691 和 6908 步（从 $(1, 1)$，其中两个坐标恰好缩小 $\rho$）。工作量与条件数成比例。

```check
ar_, cr_, et_ = symbols('a c eta', positive=True)
same((1 - 2*ar_/(ar_ + cr_)), (cr_ - ar_)/(cr_ + ar_)); same(2*cr_/(ar_ + cr_) - 1, (cr_ - ar_)/(cr_ + ar_))
same(((cr_ - ar_)/(cr_ + ar_)).subs(cr_, kp_*ar_), (kp_ - 1)/(kp_ + 1))
for av_, cv_ in ((1, 10), (2, 8), (1, 3)):
    rho_ = lambda e_: Max(Abs(1 - e_*av_), Abs(1 - e_*cv_))
    es_ = Rational(2, av_ + cv_)
    holds(all(rho_(es_ + d_) > rho_(es_) for d_ in (Rational(-1, 100), Rational(1, 100), Rational(-1, 10)*es_, Rational(1, 10)*es_)))
    same(rho_(es_), Rational(cv_ - av_, cv_ + av_))
rounds(log(10**6)/2, '6.91')
import math as _m
for kv_, want_ in ((10, '69'), (100, '691'), (1000, '6908')):
    rounds(log(10**6)/2*kv_, want_)
    holds(abs(_m.log(1e6)/_m.log((kv_ + 1)/(kv_ - 1)) - _m.log(1e6)/2*kv_) < 1)
    same(ceiling(log(10**6)/log(Rational(kv_ + 1, kv_ - 1))), Integer(want_))
```
:::
::::

:::: exercise 平均值和方框 {#ex-18-11} ★★★
- (a) 证明 $a^3 + b^3 + c^3 - 3abc = \tfrac12(a + b + c)\big[(a - b)^2 + (b - c)^2 + (c - a)^2\big]$，从而推导出 $a^3 + b^3 + c^3 \ge 3abc$ 对于正数 $a$, $b$, $c$，当且仅当 $a = b = c$ 时取等号。
- (b) 推导例 18.7 中使用的算术平均与几何平均不等式：对于正数 $p$, $q$, $r$, $\tfrac{p + q + r}{3} \ge \sqrt[3]{pqr}$，当且仅当 $p = q = r$ 时取等号。
- (c) 证明一个表面积为 $S$ 的封闭盒子（带盖）的体积最多为 $\big(\tfrac S6\big)^{3/2}$，仅当盒子为立方体时取等号。使用拉格朗日乘数法验证 $S = 24$。

::: solution
**(a)** 展开右边。括号为 $2(a^2 + b^2 + c^2) - 2(ab + bc + ca)$，因此右边为 $(a + b + c)(a^2 + b^2 + c^2 - ab - bc - ca)$；展开后，项 $a^2b$, $ab^2$, … 两两抵消，剩下 $a^3 + b^3 + c^3 - 3abc$。对于正数 $a$, $b$, $c$，因子 $a + b + c$ 为正，括号是一个平方和，因此至少为 0，所以 $a^3 + b^3 + c^3 - 3abc \ge 0$。等号成立当且仅当括号为 0，即 $a = b = c$。

**(b)** 设 $a = \sqrt[3]p$, $b = \sqrt[3]q$ 和 $c = \sqrt[3]r$，均为正数。则 (a) 说明 $p + q + r \ge 3\sqrt[3]{p}\sqrt[3]{q}\sqrt[3]{r} = 3\sqrt[3]{pqr}$，仅当 $\sqrt[3]p = \sqrt[3]q = \sqrt[3]r$ 时取等号，即 $p = q = r$。

**(c)** 长、宽、高分别为 $x$、$y$、$z$ 的长方体，表面积为 $S = 2(xy + yz + zx)$，体积为 $V = xyz$。将 (b) 用于 $p = xy$、$q = yz$、$r = zx$，它们的和为 $\tfrac S2$，积为 $(xyz)^2 = V^2$。得到 $\tfrac S6 \ge V^{2/3}$，所以 $V \le \big(\tfrac S6\big)^{3/2}$。等号成立要求 $xy = yz = zx$，对正数而言即 $x = y = z$，此时为正方体。若 $S = 24$，则上界为 $4^{3/2} = 8$，由边长为 2 的正方体取得。用拉格朗日乘数法时，$\nabla V = \lambda\nabla\big(2(xy + yz + zx)\big)$ 写成 $yz = 2\lambda(y + z)$、$xz = 2\lambda(x + z)$、$xy = 2\lambda(x + y)$。按照例 18.7，分别乘以 $x$、$y$、$z$，得到 $xy + xz = xy + yz = xz + yz$，故 $x = y = z$，再由 $6x^2 = 24$ 得 $x = 2$ 和 $\lambda = \tfrac{yz}{2(y + z)} = \tfrac12$。

```check
a3, b3, c3 = symbols('a b c')
same(expand(a3**3 + b3**3 + c3**3 - 3*a3*b3*c3), expand(Rational(1, 2)*(a3 + b3 + c3)*((a3 - b3)**2 + (b3 - c3)**2 + (c3 - a3)**2)))
same(expand((a3 - b3)**2 + (b3 - c3)**2 + (c3 - a3)**2), expand(2*(a3**2 + b3**2 + c3**2) - 2*(a3*b3 + b3*c3 + c3*a3)))
pp3 = symbols('p', positive=True); same(real_root(pp3, 3)**3, pp3)
xc, yc, zc, lcb = symbols('x y z lambda', positive=True)
same(solve([diff(xc*yc*zc, s_) - lcb*diff(2*(xc*yc + yc*zc + zc*xc), s_) for s_ in (xc, yc, zc)] + [2*(xc*yc + yc*zc + zc*xc) - 24], [xc, yc, zc, lcb], dict=True),
     [{xc: 2, yc: 2, zc: 2, lcb: Rational(1, 2)}])
same((Integer(24)/6)**Rational(3, 2), 8); same(2**3, 8); same(Rational(2*2, 2*(2 + 2)), Rational(1, 2))
same((xc*yc)*(yc*zc)*(zc*xc), (xc*yc*zc)**2)
```
:::
::::

:::: exercise 数据中心化 {#ex-18-12} ★★★
设 $(x_1, y_1), \dots, (x_n, y_n)$ 为具有至少两个不同 $x_i$ 的数据，其均值分别为 $\bar x$，$\bar y$。

- (a) 证明最小二乘直线的斜率为 $m = \dfrac{\sum(x_i - \bar x)(y_i - \bar y)}{\sum(x_i - \bar x)^2}$。
- (b) 假设数据已中心化：$\bar x = 0$. 证明正规方程变为$\big(\sum x_i^2\big)m = \sum x_iy_i$和$b = \bar y$，并且$E_{mb} = 0$。
- (c) 用例18.9中的数据，将$x - 2$替换为$x$，并检查是否得到那里找到的直线。

::: solution
**(a)** 定理18.6的证明找到了$m = \dfrac{\sum x_iy_i - n\bar x\bar y}{\sum x_i^2 - n\bar x^2}$，并证明分母为$\sum(x_i - \bar x)^2$。对于分子，展开：

$$\sum(x_i - \bar x)(y_i - \bar y) = \sum x_iy_i - \bar y\sum x_i - \bar x\sum y_i + n\bar x\bar y = \sum x_iy_i - n\bar x\bar y,$$

因为 $\sum x_i = n\bar x$ 和 $\sum y_i = n\bar y$。

**(b)** 若 $\bar x = 0$，则 $\sum x_i = 0$，正规方程不再含有混合项，变为 $\big(\sum x_i^2\big)m = \sum x_iy_i$ 和 $nb = \sum y_i$，即 $b = \bar y$。混合偏导数为 $E_{mb} = 2\sum x_i = 0$。在最小值以上，$E$ 的等值线是主轴分别沿 $m$ 和 $b$ 方向的椭圆（若 $\sum x_i^2 = n$ 则为圆），两个未知数可分别求出。在最小值处，等值集为一个点。

**(c)** 中心输入为 $-2, -1, 0, 1, 2$，具有相同的 $y$ 值 $1, 4, 3, 6, 6$。然后 $\sum x_i^2 = 10$ 和 $\sum x_iy_i = -2 - 4 + 0 + 6 + 12 = 12$，因此 $m = \tfrac{12}{10} = 1.2$，且 $b = \bar y = 4$。该直线为 $y = 1.2(x - 2) + 4 = 1.2x + 1.6$，如例 18.9 所示。

```check
X6 = symbols('x1:4'); Y6 = symbols('y1:4'); n6 = 3
xb6 = sum(X6)/n6; yb6 = sum(Y6)/n6
same(expand(sum((X6[i] - xb6)*(Y6[i] - yb6) for i in range(n6))), expand(sum(X6[i]*Y6[i] for i in range(n6)) - n6*xb6*yb6))
E6 = sum((Y6[i] - m*X6[i] - b)**2 for i in range(n6)); s6 = solve([diff(E6, m), diff(E6, b)], [m, b], dict=True)[0]
same(s6[m], sum((X6[i] - xb6)*(Y6[i] - yb6) for i in range(n6))/sum((X6[i] - xb6)**2 for i in range(n6)))
same(diff(E6, m, b), 2*sum(X6))
same([xi - 2 for xi in X9], [-2, -1, 0, 1, 2]); same(sum((xi - 2)**2 for xi in X9), 10); same(sum((xi - 2)*yi for xi, yi in zip(X9, Y9)), 12)
same(Rational(12, 10), Rational(6, 5)); same(expand(Rational(6, 5)*(x - 2) + 4), Rational(6, 5)*x + Rational(8, 5))
```
:::
::::

## 自测 {#quiz}

```quiz
? 在一个函数的内部临界点，且其附近具有连续的二阶偏导数， $f_{xx} = 3$， $f_{xy} = 4$ 和 $f_{yy} = 2$。该点是
- [ ] 局部极小值点，因为 $f_{xx} > 0$ 和 $f_{yy} > 0$
- [ ] 局部极大值点
- [x] 鞍点
- [ ] 无法用二阶导数检验法进行分类
> $D = 3 \cdot 2 - 4^2 = -10 < 0$，因此是一个鞍点。当 $D > 0$ 时， $f_{xx}$ 和 $f_{yy}$ 的符号决定分类；此处混合项起主导作用，如 $x^2 + 3xy + y^2$ 所示。当 $D = 0$ 时，检验无法确定。

? 在定义域的内部点， $\nabla f(a, b) = \vb{0}$。哪一项必须为真？
- [x] $(a, b)$ 是一个临界点，可能是局部最大值、局部最小值或鞍点
- [ ] $f$ 在 $(a, b)$ 处有局部极值
- [ ] $f$ 在 $(a, b)$ 处有绝对极值
- [ ] $f$ 在 $(a, b)$ 附近为常数
> 拉格朗日乘数法不适用于反向情况：$x^2 - y^2$ 在原点处有 $\nabla f = \vb{0}$，是一个鞍点。即使是一个局部极值，也不一定是全局极值，例如 $(1, 1)$ 在 $x^3 + y^3 - 3xy$ 处的情况。在一个点处梯度为零，并不能说明附近点的情况。

? 在一个内部点 $(a, b)$ 处，若 $f_x = f_y = 0$，且二阶偏导数在附近连续，则 $D = 0$ 和 $f_{xx} = 2$。那么
- [ ] $(a, b)$ 是一个鞍点
- [ ] $f$ 在该点处有局部极小值，因为 $f_{xx} > 0$
- [ ] $f$ 在该点处没有极值
- [x] 该测试无法判断是局部极小值还是鞍点
> $x^2 + y^4$、$x^2 - y^4$ 和 $x^2 + y^3$ 在原点处都有 $D = 0$ 和 $f_{xx} = 2$，并且它们分别有一个极小值、一个鞍点和一个鞍点。局部极大值被排除：沿 $y = b$，一元二阶导数判别法在 $x = a$ 处给出严格极小值，因为 $f_{xx} = 2 > 0$。

? 在以下哪些集合上，每个连续函数 $f(x, y)$ 都有绝对最大值和绝对最小值？
- [ ] 开圆盘 $x^2 + y^2 < 1$
- [x] 三角形，顶点为 $(0, 0)$, $(1, 0)$ 和 $(0, 1)$，其边
- [ ] 半平面 $y \ge 0$
- [ ] 整个平面
> 极值定理需要一个闭合且有界的集合，而三角形的边所构成的集合同时满足这两个条件。开圆盘不是闭合的（$x + y$ 在那里可以无限接近 $\sqrt2$ 而无法达到）；半平面和平面不是有界的（$x$ 在它们上面没有最大值）。

? $f$ 和 $g$ 在 $(a, b)$ 附近有一阶连续偏导数。 There $f$ 在曲线 $g(x, y) = c$ 上有最大值，且 $\nabla g(a, b) \ne \vb{0}$。 然后在 $(a, b)$
- [ ] $\nabla f(a, b) = \vb{0}$
- [ ] $\nabla f$ 与 $\nabla g$ 垂直
- [x] $\nabla f = \lambda\nabla g$ 对于某个实数 $\lambda$，可能为 0
- [ ] $f$ 的等值线与约束曲线相交
> 拉格朗日定理 $\nabla f = \lambda\nabla g$. $\nabla f$ 不一定为 $\vb{0}$: $x + y$ 在圆上的最大值处梯度为 $\langle 1, 1\rangle$. 当 $\nabla f \ne \vb{0}$ 时，其等高线与约束条件相切。但梯度为零的情况也有可能： $f = -x^2 - y^2$ 在 $g = y = 0$ 处取得最大值，此时 $\lambda = 0$ 与等值集 $f = 0$ 是一个点。

? $f(x, y) = x + y$ 在圆 $x^2 + y^2 = 2$ 上的最大值为
- [ ] $\sqrt2$
- [x] $2$
- [ ] $2\sqrt2$
- [ ] $4$
> $1 = 2\lambda x$ 和 $1 = 2\lambda y$ 给出 $x = y$，且 $2x^2 = 2$ 给出 $x = \pm1$: 候选点 $(1, 1)$ 和 $(-1, -1)$，分别对应 $f = 2$ 和 $f = -2$. $\sqrt2$ 是单位圆上（半径为 1）的最大值； $2\sqrt2$ 是该圆的直径，且 4 是 $(x + y)^2$ 在最大值处的值。

? 数据 $(x_1, y_1), \dots, (x_n, y_n)$ 的最小二乘线 $y = mx + b$ 总是
- [ ] 至少通过两个数据点
- [ ] 通过原点
- [ ] 使残差之和尽可能小
- [x] 通过均值点 $(\bar x, \bar y)$
> 第二个正规方程表示 $b = \bar y - m\bar x$。例18.9中的直线不经过任何数据点，而是经过 $(0, 1.6)$，而不是原点。残差之和为0，但这个和并不是被最小化的量：一条远高于数据点的直线可以使它变得任意负。

? 在 $f(x, y) = \tfrac12(x^2 + 25y^2)$ 上的梯度下降法在每个起始点都收敛到最小值，当且仅当
- [x] $0 < \eta < 0.08$
- [ ] $0 < \eta < 0.04$
- [ ] $0 < \eta < 1$
- [ ] $0 < \eta < 2$
> 根据定理18.7， $0 < \eta < 2/c = \tfrac{2}{25} = 0.08$ 是由更陡的方向设定的。 $0.04 = \tfrac{1}{25}$ 是一步消除 $y$-误差的步长，但严格小于0.08的更大步长仍然收敛，当 $y_0 \ne 0$ 时会出现锯齿状。在 $\eta = 0.08$ 处， $y$-因子为 $-1$，因此非零 $y$-坐标会交替出现而不衰减。 $0 < \eta < 2$ 是 $x$-方向单独的条件：当 $\eta = 1$ 为 $y$ 中的因子时， $1 - 25 = -24$。
```

```check
same(3*2 - 4**2, -10)
same(diff(x**2 - y**2, x).subs({x: 0, y: 0}), 0)
for fq3 in (x**2 + y**4, x**2 - y**4, x**2 + y**3):
    same([diff(fq3, v).subs({x: 0, y: 0}) for v in (x, y)], [0, 0])
    same(hessian(fq3, (x, y)).subs({x: 0, y: 0}), Matrix([[2, 0], [0, 0]]))
    same(fq3.subs(y, 0), x**2)
same((x**2 - y**4).subs(x, 0), -y**4); same((x**2 + y**3).subs(x, 0), y**3)
fq5 = -x**2 - y**2; same([diff(fq5, v).subs({x: 0, y: 0}) for v in (x, y)], [0, 0])
same(fq5.subs(y, 0), -x**2); same([diff(y, v) for v in (x, y)], [0, 1])
same((x + y).subs({x: 1, y: 1}), 2); same(solve(2*x**2 - 2, x), [-1, 1]); same(2*sqrt(2), 2*sqrt(2)*1); same(((x + y)**2).subs({x: 1, y: 1}), 4)
xq8, yq8, lq8 = symbols('x y lambda', real=True)
same_set(solve([1 - 2*lq8*xq8, 1 - 2*lq8*yq8, xq8**2 + yq8**2 - 2], [xq8, yq8, lq8], dict=True), [{xq8: 1, yq8: 1, lq8: Rational(1, 2)}, {xq8: -1, yq8: -1, lq8: -Rational(1, 2)}])
same(Rational(6, 5)*0 + Rational(8, 5), Rational(8, 5)); holds(all(Rational(6, 5)*xi + Rational(8, 5) != yi for xi, yi in zip(X9, Y9)))
same(Rational(2, 25), Rational(8, 100)); same(Rational(1, 25), Rational(4, 100)); same(1 - 25*1, -24)
same(1 - 25*Rational(8, 100), -1)
same(solve_univariate_inequality(Abs(1 - 25*er_) < 1, er_, relational=False), Interval.open(0, Rational(2, 25)))
holds(all(bool(Abs(1 - 25*e_) < 1) == bool(0 < e_ < Rational(8, 100)) for e_ in (Rational(-1, 100), 0, Rational(4, 100), Rational(79, 1000), Rational(8, 100), Rational(81, 1000), 1)))
```
