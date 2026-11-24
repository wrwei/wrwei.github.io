---
title: 重积分
part: 5
lead: 通过积分累加平面或空间区域内的量，求曲面下方的体积、薄板的质量、立体的质心和随机点落入区域的概率。你将用黎曼和的极限定义二重、三重积分，再逐个变量计算，选用极坐标、柱坐标、球坐标或自定义坐标简化计算，并证明模块 12 引用的高斯积分。
minutes: 270
needs: 模块1至18，特别是定积分（模块9）、微积分基本定理和替换法（模块10）、应用和反常积分（模块12）、极坐标和向量（模块16）以及偏导数（模块17）
goals:
  - 将二重积分定义为二重黎曼和的极限，并利用福比尼定理将其表示为逐次积分进行计算
  - 用边界曲线描述区域，按任意顺序设定积分限，从图示中确定积分限，并反转积分顺序
  - 在极坐标下计算二重积分，并证明 $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$
  - 用多重积分计算面积、体积、质量、质心、惯性矩和概率
  - 在直角坐标、柱坐标和球坐标系中建立并计算三重积分
  - 用雅可比行列式变换双重积分的变量
---

## 体积与双重积分 {#double-integrals}

模块 9 通过将区间分成短小的片段，在每个片段上竖立一个细长的矩形并求和，从而找到曲线下的面积；这些和的极限是定积分。本模块将这一思想提升到一个维度。对于一个连续的、非负的二元函数 $f(x, y)$，将其图像 $z = f(x, y)$ 看作一个曲面，如模块 17 所示。在 $xy$ 平面上的一个矩形区域上，该曲面与矩形之间的立体空间具有体积。将该区域分割成小矩形，在每个小矩形上竖立一个细长的盒子并求和；这些和的极限是 **双重积分**。它计算的不仅仅是体积：还包括质量、平均值和概率。计算机在网格上记录任何数据时，都是通过这种相同类型的和来计算的：例如，将天气图上每个方格的降雨量乘以该方格的面积，然后在河流流域上累加，从而近似计算落在该流域上的水体积。

从 $xy$ 平面上的一个矩形开始，包含 $a < b$ 和 $c < d$，

$$R = [a, b] \times [c, d] = \{(x, y) : a \le x \le b,\ c \le y \le d\},$$

阅读 "$[a, b]$ cross $[c, d]$": 满足 $x$ 在 $[a, b]$ 内且 $y$ 在 $[c, d]$ 内的点。首先假设 $f(x, y) \ge 0$ 在 $R$ 上。位于 $R$ 上方且在曲面 $z = f(x, y)$ 下方的立体，是由所有点 $(x, y, z)$ 组成的集合，其中 $(x, y)$ 在 $R$ 内且 $0 \le z \le f(x, y)$。它的体积是多少？

将 $[a, b]$ 分成 $m$ 个宽度为 $\Delta x = (b - a)/m$ 的子区间，将 $[c, d]$ 分成 $n$ 个宽度为 $\Delta y = (d - c)/n$ 的子区间。通过分点的直线 $x = x_i$ 和 $y = y_j$ 将 $R$ 分成 $mn$ 个小矩形

$$R_{ij} = [x_{i-1}, x_i] \times [y_{j-1}, y_j],$$

每个小矩形的面积为 $\Delta A = \Delta x\,\Delta y$。在每个 $R_{ij}$ 中选取一个**采样点** $(x_{ij}^*, y_{ij}^*)$，再以 $R_{ij}$ 为底搭起一个高度为 $f(x_{ij}^*, y_{ij}^*)$ 的长方体。每个长方体的体积为 $f(x_{ij}^*, y_{ij}^*)\,\Delta A$，它们的总体积为

$$\sum_{i=1}^{m}\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\,\Delta A,$$

一个 **双重黎曼和**。两个求和符号为每个点对 $(i, j)$ 添加一项，共 $mn$ 项（图 19.1）。

::: figure id=fig-19-1
十六个小方块位于表面下 $z = 8 - x^2 - y^2$ 在正方形 $[0, 2] \times [0, 2]$ 上（例 19.1 带 $n = 4$）。每个方块立在一个小正方形上，面积为 $\Delta A = 0.25$，其高度是 $f$ 在该正方形远离原点的角点处的值。那里 $f$ 是最小的，因此每个方块都在曲面之下：画在曲面上的网格线穿过方块的远上角点。所有方块的总体积为 17，小于曲面下的体积 $64/3 \approx 21.33$。
:::

::: example 捕捉一个体积
设 $f(x, y) = 8 - x^2 - y^2$ 和 $R = [0, 2] \times [0, 2]$。将 $R$ 分成四个边长为 1 的正方形。找出两个双重黎曼和，它们捕捉曲面 $z = f(x, y)$ 下方、平面 $R$ 上方的立体体积 $V$，并且样本点为这些正方形的中心。

正方形是 $[0, 1] \times [0, 1]$, $[1, 2] \times [0, 1]$, $[0, 1] \times [1, 2]$ 和 $[1, 2] \times [1, 2]$，每个的面积是 $\Delta A = 1$。对于 $x \ge 0$ 和 $y \ge 0$，$f$ 随着 $x$ 增大和 $y$ 增大而减小，因为 $x^2$ 和 $y^2$ 增大。因此在每个正方形上，$f$ 在最接近原点的角处最大，在最远离原点的角处最小。以远端角 $(1, 1)$, $(2, 1)$, $(1, 2)$ 和 $(2, 2)$ 作为样本点，这些盒子位于曲面之下，它们的总体积是

$$\begin{aligned} &\big(f(1, 1) + f(2, 1) + f(1, 2) + f(2, 2)\big)\cdot 1 \\ &\quad= 6 + 3 + 3 + 0 = 12. \end{aligned}$$

以近端角 $(0, 0)$, $(1, 0)$, $(0, 1)$ 和 $(1, 1)$ 作为样本点，这些盒子包含该立体：

$$\begin{aligned} &\big(f(0, 0) + f(1, 0) + f(0, 1) + f(1, 1)\big)\cdot 1 \\ &\quad= 8 + 7 + 7 + 6 = 28. \end{aligned}$$

所以 $12 \le V \le 28$。中心 $\big(\tfrac12, \tfrac12\big)$, $\big(\tfrac32, \tfrac12\big)$, $\big(\tfrac12, \tfrac32\big)$ 和 $\big(\tfrac32, \tfrac32\big)$ 给出一个单一的估计值

$$7.5 + 5.5 + 5.5 + 3.5 = 22.$$

第19.2节表明 $V = \tfrac{64}{3} \approx 21.33$。

```check
f191 = 8 - x**2 - y**2
same(diff(f191, x), -2*x); same(diff(f191, y), -2*y)                  # negative for x > 0 and y > 0: f decreases
far = [f191.subs({x: p, y: q}) for p, q in ((1, 1), (2, 1), (1, 2), (2, 2))]
near_ = [f191.subs({x: p, y: q}) for p, q in ((0, 0), (1, 0), (0, 1), (1, 1))]
same(far, [6, 3, 3, 0]); same(sum(far), 12); same(near_, [8, 7, 7, 6]); same(sum(near_), 28)
half = Rational(1, 2)
cen = [f191.subs({x: p, y: q}) for p, q in ((half, half), (3*half, half), (half, 3*half), (3*half, 3*half))]
same(cen, [Rational(15, 2), Rational(11, 2), Rational(11, 2), Rational(7, 2)]); same(sum(cen), 22)
V191 = integrate(f191, (y, 0, 2), (x, 0, 2)); same(V191, Rational(64, 3)); rounds(V191, '21.33')
holds(12 < V191); holds(V191 < 28)
```
:::

更小的正方形缩小差距。将 $R$ 的每一边切成 $n$ 等份，形成边长为 $2/n$ 的 $n^2$ 个正方形，并计算三个和：用远端角的 $L_n$（下和），用近端角的 $U_n$（上和），以及用中心点的 $M_n$（中点和）。

```valuetable
n = 2, 4, 8, 16, 32
$L_n$ = Sum(Sum(8 - (2*i/n)**2 - (2*j/n)**2, (i, 1, n)), (j, 1, n)).doit()*4/n**2
$U_n$ = Sum(Sum(8 - (2*i/n)**2 - (2*j/n)**2, (i, 0, n - 1)), (j, 0, n - 1)).doit()*4/n**2
$M_n$ = Sum(Sum(8 - ((2*i - 1)/n)**2 - ((2*j - 1)/n)**2, (i, 1, n)), (j, 1, n)).doit()*4/n**2
digits = 9
---
n | L_n | U_n | M_n
2 | 12 | 28 | 22
4 | 17 | 25 | 21.5
8 | 19.25 | 23.25 | 21.375
16 | 20.3125 | 22.3125 | 21.34375
32 | 20.828125 | 21.828125 | 21.3359375
```

下和逐渐增大，上和逐渐减小，它们之间的差距 $U_n - L_n = 32/n$ 每当 $n$ 倍增时就会减半。中点和则更快地逼近 $\tfrac{64}{3} = 21.333\ldots$：误差（精确值减去近似值）为 $\tfrac{64}{3} - M_n = -\tfrac{8}{3n^2}$。其绝对值每当 $n$ 倍增时就会减为四分之一，如同模块 9 中的中点和。

```check
Ln = lambda N_: Rational(4, N_**2)*sum(f191.subs({x: Rational(2*p, N_), y: Rational(2*q, N_)}) for p in range(1, N_ + 1) for q in range(1, N_ + 1))
Un = lambda N_: Rational(4, N_**2)*sum(f191.subs({x: Rational(2*p, N_), y: Rational(2*q, N_)}) for p in range(N_) for q in range(N_))
Mn = lambda N_: Rational(4, N_**2)*sum(f191.subs({x: Rational(2*p - 1, N_), y: Rational(2*q - 1, N_)}) for p in range(1, N_ + 1) for q in range(1, N_ + 1))
for N_ in (2, 4, 8, 16, 32):
    same(Un(N_) - Ln(N_), Rational(32, N_)); same(Rational(64, 3) - Mn(N_), -Rational(8, 3*N_**2))
    holds(Ln(N_) < Rational(64, 3)); holds(Rational(64, 3) < Un(N_))
same(Ln(4), 17); same(Un(4), 25); same(Mn(4), Rational(43, 2)); same(Mn(32), Rational(2731, 128))
ng = symbols('n_grid', integer=True, positive=True); ig, jg = symbols('i_grid j_grid', integer=True)
Lgeneral = summation(8 - (2*ig/ng)**2 - (2*jg/ng)**2, (ig, 1, ng), (jg, 1, ng))*4/ng**2
Ugeneral = summation(8 - (2*ig/ng)**2 - (2*jg/ng)**2, (ig, 0, ng - 1), (jg, 0, ng - 1))*4/ng**2
Mgeneral = summation(8 - ((2*ig - 1)/ng)**2 - ((2*jg - 1)/ng)**2, (ig, 1, ng), (jg, 1, ng))*4/ng**2
same(Ugeneral - Lgeneral, 32/ng); same(Rational(64, 3) - Mgeneral, -Rational(8, 3)/ng**2)
holds(simplify(Lgeneral.subs(ng, ng + 1) - Lgeneral) > 0); holds(simplify(Ugeneral.subs(ng, ng + 1) - Ugeneral) < 0)
same((Rational(64, 3) - Mgeneral.subs(ng, 2*ng))/(Rational(64, 3) - Mgeneral), Rational(1, 4))
```

::: definition 矩形上的二重积分
设 $f$ 定义在矩形 $R = [a, b] \times [c, d]$ 上，其中 $a < b$、$c < d$。若二重黎曼和趋于某个数 $I$，即对每个 $\varepsilon > 0$，存在整数 $N$ 使下式成立，则称 $f$ 在 $R$ 上**可积**：

$$\Big|\sum_{i=1}^{m}\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\,\Delta A - I\Big| < \varepsilon$$

其中只要求 $m \ge N$ 和 $n \ge N$，采样点可以任意选取。此时 $I$ 称为 $f$ 在 $R$ 上的**二重积分**：

$$\iint_R f(x, y)\,dA = \lim_{m, n\to\infty}\sum_{i=1}^{m}\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\,\Delta A.$$
:::

符号 $\iint_R f(x, y)\,dA$ 读作「对 $x$、$y$ 的函数 $f$ 在 $R$ 上作二重积分，$dA$」。$dA$ 称为**面积元**，对应每个小矩形的面积 $\Delta A$。当 $R$ 上满足 $f \ge 0$ 时，二重积分给出介于 $R$ 与 $f$ 的图像之间的立体体积。这定义了体积，并与已知的长方体、棱柱和棱锥体积一致。若 $f$ 为负，长方体就伸到 $xy$ 平面之下，贡献按负值计，因此一般情形下二重积分是有符号的体积，类似[第 9.4 节](module_09_ZH.html#signed-area)的有符号面积。模块 9 也允许不等宽的子区间。这里为简化记号采用等宽分割，不等宽定义给出相同的二重积分。

::: theorem 可积函数
若 $f$ 在矩形 $R$ 上连续，则 $f$ 在 $R$ 上可积。更一般地说，若 $f$ 在 $R$ 上有界，且在 $R$ 上除有限条曲线上的点外处处连续，则它在 $R$ 上可积，这里的每条曲线均为形如 $y = g(x)$ 或 $x = h(y)$ 的图像，所用函数在闭区间上连续。
:::

如同模块 9 所示，该证明属于实变函数课程的内容，本系列在不证明的情况下使用该定理。其第二句话在第 19.3 节中起重要作用，其中函数在某一区域内设为 0，并在区域边界处跳跃。单变量积分的性质（[第 9.5 节 ](module_09_ZH.html#properties)）同样适用，其证明方式与黎曼和相同：对于可积的 $f$ 和 $g$ 以及常数 $c$，

$$\begin{aligned} \iint_R (f + g)\,dA &= \iint_R f\,dA + \iint_R g\,dA, \\ \iint_R c\,f\,dA &= c\iint_R f\,dA, \end{aligned}$$

并且如果 $f(x, y) \le g(x, y)$ 在 $R$ 的每个点上成立，则 $\iint_R f\,dA \le \iint_R g\,dA$。

::: pitfall
每个双重黎曼和的项都是一个体积，即高度 $f(x_{ij}^*, y_{ij}^*)$ 乘以小矩形的面积 $\Delta A = \Delta x\,\Delta y$，而不是仅仅高度。在例题 19.1 中，当 $n = 4$ 为十六个远角高度时，它们的和为 68，仅乘以 $\Delta A = 0.25$ 才能得到下和 $L_4 = 17$。

```check
same(sum(f191.subs({x: Rational(p, 2), y: Rational(q, 2)}) for p in range(1, 5) for q in range(1, 5)), 68); same(68*Rational(1, 4), 17)
```
:::

## 迭代积分与富比尼定理 {#iterated}

双重和的极限很难直接计算。模块 12 提供了一种更好的方法来求体积：将立体切片，求出每个切片的面积，然后对面积进行积分（[第 12.3 节](module_12_ZH.html#volumes)）。固定 $x$ 在 $[a, b]$ 中，将第 19.1 节中的立体沿通过 $x$ 且平行于 $yz$ 平面的平面切开。该切片是曲线 $z = f(x, y)$， $c \le y \le d$ 在 $x$ 固定时下方的区域，其面积为

$$A(x) = \int_c^d f(x, y)\,dy.$$

计算是 **偏积分** 关于 $y$：将 $x$ 视为常数，对 $y$ 进行积分，如同偏导数将 $x$ 视为常数并对 $y$ 进行求导（模块 17）。结果是一个仅关于 $x$ 的函数。积分各片的面积得到体积：

$$V = \int_a^b A(x)\,dx = \int_a^b\Big[\int_c^d f(x, y)\,dy\Big]\,dx.$$

右边是一个 **累次积分**，通常不带括号书写，

$$\int_a^b\int_c^d f(x, y)\,dy\,dx.$$

从内到外进行计算：内层积分，其 $dy$ 和上下限 $c$ 和 $d$ 最接近 $f$，先进行。通过 $y = \text{constant}$ 方向的平面进行切分，得到累次积分 $\int_c^d\int_a^b f(x, y)\,dx\,dy$，其中 $x$ 积分在内层。

::: example 例 19.1 的体积
找出在 $z = 8 - x^2 - y^2$ 上方、在 $R = [0, 2] \times [0, 2]$ 下方，首先通过 $x = \text{constant}$ 方向的平面进行切分，然后再通过 $y = \text{constant}$ 方向的平面进行切分的体积。

**在固定 $x$ 时的切片。** 将 $x$ 视为常数，关于 $y$ 对 $8 - x^2 - y^2$ 的原函数是 $8y - x^2y - \tfrac{y^3}{3}$，因此

$$\begin{aligned} A(x) &= \int_0^2 \big(8 - x^2 - y^2\big)\,dy \\ &= \Big[8y - x^2y - \frac{y^3}{3}\Big]_{y=0}^{y=2} \\ &= 16 - 2x^2 - \frac83 = \frac{40}{3} - 2x^2. \end{aligned}$$

例如，$A(0) = \tfrac{40}{3}$ 是抛物线 $z = 8 - y^2$ 在 $0 \le y \le 2$ 下方的面积，而 $x = 0$ 平面中固体的面。然后

$$V = \int_0^2 \Big(\frac{40}{3} - 2x^2\Big)\,dx = \frac{80}{3} - \frac{16}{3} = \frac{64}{3}.$$

**在固定 $y$ 处切片。** 被积函数在 $x$ 和 $y$ 交换时不变，因此交换字母后进行相同步骤得到内积分 $\int_0^2 (8 - x^2 - y^2)\,dx = \tfrac{40}{3} - 2y^2$，再次得到 $V = \tfrac{64}{3} \approx 21.33$。它位于例 19.1 中的 12 和 28 之间，接近中点估计值 22。

```check
antideriv(8*y - x**2*y - y**3/3, f191, y)
A192 = integrate(f191, (y, 0, 2))
steps(Integral(f191, (y, 0, 2)), 16 - 2*x**2 - Rational(8, 3), Rational(40, 3) - 2*x**2)
same(A192.subs(x, 0), Rational(40, 3)); same(integrate(8 - y**2, (y, 0, 2)), Rational(40, 3))
steps(Integral(A192, (x, 0, 2)), Rational(80, 3) - Rational(16, 3), Rational(64, 3))
same(f191.subs({x: y, y: x}, simultaneous=True), f191)
same(integrate(f191, (x, 0, 2)), Rational(40, 3) - 2*y**2); same(integrate(f191, (x, 0, 2), (y, 0, 2)), Rational(64, 3))
```
:::

两种顺序都给出了第 19.1 节盒子趋近的体积。这并非偶然：

::: theorem 富比尼定理
若 $f$ 在矩形 $R = [a, b] \times [c, d]$ 上连续，则

$$\begin{aligned} \iint_R f(x, y)\,dA &= \int_a^b\int_c^d f(x, y)\,dy\,dx \\ &= \int_c^d\int_a^b f(x, y)\,dx\,dy. \end{aligned}$$

更一般地，设 $f$ 在 $R$ 上有界，除定理 19.1 所述的有限条曲线外处处连续。任取一个积分次序，如果对外层变量的每个值内层积分都存在，那么外层积分也存在，所得累次积分等于 $\iint_R f\,dA$。若两种次序都符合条件，则都得到同一个二重积分。
:::

在 $f \ge 0$ 的情形下，这个定理表明切片法算出的体积等于用小长方体定义的体积。计算时可以把二重积分化为先后两个一元积分，分别用模块 10 和 11 的方法求解，并可选择较方便的次序。下面的「深入一步」栏目证明 $f$ 连续的情形。

::: deeper 为什么 Fubini 定理成立
这里是连续 $f$ 的一个证明。它基于实分析的一个事实：函数 $A(x) = \int_c^d f(x, y)\,dy$ 在 $[a, b]$ 上连续。（这依赖于在闭合矩形上连续函数的性质，即一致连续性。）然后 $A$ 在 $[a, b]$ 上可积（定理 9.3）。

将 $[a, b]$ 和 $[c, d]$ 分成 $m$ 和 $n$ 等份，并在 $[x_{i-1}, x_i]$ 中任选一点 $x_i^*$。根据区间上的可加性（定理 9.6）以及积分的中值定理（定理 9.9），应用于每个 $[y_{j-1}, y_j]$ 上的连续函数 $y \mapsto f(x_i^*, y)$，在 $[y_{j-1}, y_j]$ 中存在点 $y_{ij}^*$ 使得

$$\begin{aligned} A(x_i^*) &= \sum_{j=1}^{n}\int_{y_{j-1}}^{y_j} f(x_i^*, y)\,dy \\ &= \sum_{j=1}^{n} f(x_i^*, y_{ij}^*)\,\Delta y. \end{aligned}$$

乘以 $\Delta x$ 并在 $i$ 上求和：

$$\sum_{i=1}^{m} A(x_i^*)\,\Delta x = \sum_{i=1}^{m}\sum_{j=1}^{n} f(x_i^*, y_{ij}^*)\,\Delta A.$$

右边是 $f$ 的二重黎曼和，其中 $(x_i^*, y_{ij}^*)$ 为 $R_{ij}$ 中的采样点。令 $I = \iint_R f\,dA$ 和 $\varepsilon > 0$，按定义 19.1 选取 $N$。给定 $m \ge N$，取 $n = m$，使右边与 $I$ 的距离小于 $\varepsilon$。左边完全不含 $n$，它是 $A$ 在 $[a, b]$ 上采用 $m$ 个等宽子区间得到的黎曼和。因此对满足 $m \ge N$ 的 $A$ 的每个这种黎曼和，不论如何选取 $x_i^*$，其与 $I$ 的距离都小于 $\varepsilon$。因此当 $m \to \infty$ 时，它们的极限为 $I$。根据定理 9.4，该极限也等于 $\int_a^b A(x)\,dx$，第一个等式得证。互换 $x$ 和 $y$ 的角色，同理得到第二个等式。
:::

该假设不能被舍弃。在 $R = [0, 1] \times [0, 1]$ 上，令

$$f(x, y) = \frac{x^2 - y^2}{\big(x^2 + y^2\big)^2}$$

其中 $(x, y) \ne (0, 0)$，且 $f(0, 0) = 0$。当 $x > 0$ 时，由商法则得 $\dfrac{\partial}{\partial y}\Big(\dfrac{y}{x^2 + y^2}\Big) = f(x, y)$，故内层积分为 $\int_0^1 f(x, y)\,dy = \dfrac{1}{x^2 + 1}$。但当 $x = 0$ 时，对 $y > 0$ 有 $f(0, y) = -1/y^2$，内层积分发散。因此，把外层积分作为反常积分取极限：

$$\begin{aligned} &\lim_{\varepsilon\to0^+}\int_\varepsilon^1\int_0^1 f(x, y)\,dy\,dx \\ &\quad= \lim_{\varepsilon\to0^+}\int_\varepsilon^1 \frac{dx}{1 + x^2} = \frac{\pi}{4}. \end{aligned}$$

但是交换 $x$ 和 $y$ 会改变 $f$ 的符号，因此 $\lim_{\varepsilon\to0^+}\int_\varepsilon^1\int_0^1 f(x, y)\,dx\,dy = -\tfrac{\pi}{4}$。这两个不正确定积分的极限不一致。该函数在 $R$ 上无界：沿 $x$ 轴，$f(x, 0) = 1/x^2$，其值随着 $x \to 0$ 而无限增大。Fubini 定理不适用，且 $f$ 在 $R$ 上如第 19.1 节所定义的双重 Riemann 积分不存在。

```check
xq, yq = symbols('x y', positive=True)
fF = (xq**2 - yq**2)/(xq**2 + yq**2)**2
same(diff(yq/(xq**2 + yq**2), yq), fF); same(integrate(fF, (yq, 0, 1)), 1/(xq**2 + 1)); same(integrate(1/(1 + x**2), (x, 0, 1)), pi/4)
same(fF.subs({xq: yq, yq: xq}, simultaneous=True), -fF); same(integrate(fF, (xq, 0, 1)), -1/(yq**2 + 1))
same(fF.subs(yq, 0), 1/xq**2); limit_is(1/x**2, x, 0, oo, '+')
eq = symbols('epsilon_cutoff', positive=True)
same(fF.subs(xq, 0), -1/yq**2)
limit_is(integrate(-1/yq**2, (yq, eq, 1)), eq, 0, -oo, '+')
limit_is(integrate(1/xq**2, (xq, eq, 1)), eq, 0, oo, '+')
limit_is(integrate(1/(1 + xq**2), (xq, eq, 1)), eq, 0, pi/4, '+')
limit_is(integrate(-1/(1 + yq**2), (yq, eq, 1)), eq, 0, -pi/4, '+')
```

::: example 选择积分顺序
计算 $\displaystyle\iint_R x\cos(xy)\,dA$，其中 $R = [0, \pi] \times [0, 1]$。

被积函数是连续的，因此根据福比尼定理，无论是先对哪个变量积分都可以得到相同结果。先对 $y$ 积分是简便的方法。当 $x$ 保持不变时，链式法则给出 $\dfrac{\partial}{\partial y}\sin(xy) = x\cos(xy)$，因此

$$\begin{aligned} \iint_R x\cos(xy)\,dA &= \int_0^\pi\Big[\sin(xy)\Big]_{y=0}^{y=1}\,dx \\ &= \int_0^\pi \sin x\,dx = 2. \end{aligned}$$

在另一种顺序下，内层积分 $\int_0^\pi x\cos(xy)\,dx$ 需要使用分部积分法（模块 11），而对于 $0 < y \le 1$，它给出

$$\frac{\pi\sin(\pi y)}{y} + \frac{\cos(\pi y) - 1}{y^2}.$$

这个函数的一个原函数是 $\dfrac{1 - \cos(\pi y)}{y}$，需要一些计算，从 0 到 1 的积分需要在 $y = 0$ 处取极限；答案再次为 2。当一种顺序难以计算时，尝试另一种顺序。

```check
same(diff(sin(x*y), y), x*cos(x*y)); same(integrate(xq*cos(xq*y), (y, 0, 1)), sin(xq))
same(integrate(sin(x), (x, 0, pi)), 2); same(integrate(x*cos(x*y), (y, 0, 1), (x, 0, pi)), 2)
yp = symbols('y', positive=True)
same(integrate(x*cos(x*yp), (x, 0, pi)), pi*sin(pi*yp)/yp + (cos(pi*yp) - 1)/yp**2)
antideriv((1 - cos(pi*yp))/yp, pi*sin(pi*yp)/yp + (cos(pi*yp) - 1)/yp**2, yp)
limit_is((1 - cos(pi*y))/y, y, 0, 0, '+'); same(((1 - cos(pi*y))/y).subs(y, 1), 2)
```
:::

当 $g$ 在 $[a, b]$ 上连续，且 $h$ 在 $[c, d]$ 上连续时，它们的乘积 $g(x)h(y)$ 在矩形 $R$ 上连续。对于 $\int_a^b\int_c^d g(x)h(y)\,dy\,dx$ 的内层积分是 $g(x)\int_c^d h(y)\,dy$，即一个常数乘以 $g(x)$，而 Fuibini 定理将二重积分分解为乘积：

$$\iint_R g(x)h(y)\,dA = \int_a^b g(x)\,dx\int_c^d h(y)\,dy.$$

例如， $\iint_R \sin x\cos y\,dA = 1 \cdot 1 = 1$ 在 $R = [0, \pi/2] \times [0, \pi/2]$ 上。这个乘积法则需要一个矩形，其上下限为常数；第 19.4 节使用它来计算高斯积分。

```check
gF, hF, dS = Function('g'), Function('h'), symbols('d')
same(Integral(gF(x)*hF(y), (y, c, dS), (x, a, b)).doit(), Integral(gF(x), (x, a, b)).doit()*Integral(hF(y), (y, c, dS)).doit())
same(integrate(sin(x)*cos(y), (y, 0, pi/2), (x, 0, pi/2)), 1); same(integrate(sin(x), (x, 0, pi/2)), 1); same(integrate(cos(y), (y, 0, pi/2)), 1)
```

一个变量函数的平均值是其积分除以区间长度（[第 9.7 ](module_09_ZH.html#average) 节）。在两个变量的情况下，除以面积。

::: definition 平均值
一个函数 $f$ 在正面积的矩形 $R$ 上可积的 **平均值** 是

$$f_{\text{avg}} = \frac{1}{A(R)}\iint_R f(x, y)\,dA,$$

其中 $A(R) = (b - a)(d - c)$ 是 $R$ 的面积。
:::

它是较细网格的样本点上 $f$ 的平均值所趋近的数，如模块 9 所示；当 $f \ge 0$ 时，$R$ 上高度为 $f_{\text{avg}}$ 的盒子与图下方的立体体积相同。例 19.2 的表面在正方形 $[0, 2] \times [0, 2]$ 上的平均高度为 $\tfrac{64}{3} \big/ 4 = \tfrac{16}{3} \approx 5.33$。第 19.3 节将定义扩展到其他区域，用区域的面积代替 $A(R)$。

```check
same(Rational(64, 3)/4, Rational(16, 3)); rounds(Rational(16, 3), '5.33'); same(integrate(f191, (x, 0, 2), (y, 0, 2))/(2*2), Rational(16, 3))
```

::: compute 用计算机计算二重积分
SymPy 的 `integrate` 每个积分接受一个元组，内层积分在前：下面的 `(y, 0, 2)` 是内层积分，在 $y$ 中。

```python
import sympy as sp
x, y = sp.symbols('x y')
f = 8 - x**2 - y**2
print(sp.integrate(f, (y, 0, 2)))              # the inner integral A(x)
print(sp.integrate(f, (y, 0, 2), (x, 0, 2)))   # y first, then x
print(sp.integrate(x*sp.cos(x*y), (y, 0, 1), (x, 0, sp.pi)))
```

```output
40/3 - 2*x**2
64/3
2
```

这些是 $A(x)$ 和例 19.2 的体积，以及例 19.3 的积分。数值上，中点和式在 $n \times n$ 网格的中心点加上 $f$。NumPy 的 `meshgrid` 一次构建所有中心点对 $(x_i, y_j)$，因此即使是一百万个盒子，也只需几分之一秒：

```python
import numpy as np

def midpoint2d(f, a, b, c, d, n):
    dx, dy = (b - a)/n, (d - c)/n
    xs = a + (np.arange(n) + 0.5)*dx        # centres of the subintervals of [a, b]
    ys = c + (np.arange(n) + 0.5)*dy
    X, Y = np.meshgrid(xs, ys)              # all n*n centres (x_i, y_j)
    return np.sum(f(X, Y))*dx*dy

for n in [2, 10, 100, 1000]:
    print(n, midpoint2d(lambda x, y: 8 - x**2 - y**2, 0, 2, 0, 2, n))
```

```output
2 22.0
10 21.360000000000003
100 21.3336
1000 21.333336
```

这些和趋于 $\tfrac{64}{3} = 21.333\ldots$，有符号误差是前面求出的 $-\tfrac{8}{3n^2}$。因此 $n$ 每增大到原来的 10 倍，误差的绝对值就缩小到原来的百分之一。在 $n = 10$ 时，末尾的 $\ldots0003$ 来自浮点舍入，该和的精确值为 21.36。

```check
same(Mn(10), Rational('21.36'))
same((Rational(64, 3) - Mgeneral.subs(ng, 10*ng))/(Rational(64, 3) - Mgeneral), Rational(1, 100))
```
:::

::: pitfall
保持每个变量与其自身的积分限。在 $\int_0^2\int_0^1 f(x, y)\,dy\,dx$ 中，内部积分限 0 和 1 属于 $y$，即内部积分变量 $dy$ 的积分限；外部积分限 0 和 2 属于 $x$。反过来读的话，积分变量是 $[0, 1] \times [0, 2]$ 而不是 $[0, 2] \times [0, 1]$：对于 $f(x, y) = x^2y$，正确读法得到 $\tfrac43$，错误读法得到 $\tfrac23$。

```check
same(integrate(x**2*y, (y, 0, 1), (x, 0, 2)), Rational(4, 3)); same(integrate(x**2*y, (y, 0, 2), (x, 0, 1)), Rational(2, 3))
```
:::

## 一般区域上的积分 {#general-regions}

大多数区域都不是矩形：比如圆盘、三角形、两曲线之间的区域。为了对一个有界区域 $D$ 进行积分，可以将其包含在一个矩形 $R$ 中，并将 $f$ 延拓为零：

$$F(x, y) = \begin{cases} f(x, y) & \text{if } (x, y) \text{ is in } D, \\ 0 & \text{if } (x, y) \text{ is in } R \text{ but not in } D, \end{cases}$$

并定义 $\iint_D f(x, y)\,dA = \iint_R F(x, y)\,dA$ 当右边存在时。在 $D$ 外的区域高度为 0，不增加任何内容，因此 $R$ 的选择无关紧要。 $F$ 通常在 $D$ 的边界处跳跃，这就是定理 19.1 允许沿曲线有间断点的原因。两种区域形状覆盖了大多数情况（图 19.2）。

::: definition 类 I 和 类 II 区域
若区域 $D$ 处在两个关于 $x$ 的连续函数的图像之间，则它为**I 型区域**：

$$D = \{(x, y) : a \le x \le b,\ g_1(x) \le y \le g_2(x)\},$$

其中 $a < b$，且对所有 $a \le x \le b$ 都有 $g_1(x) \le g_2(x)$。若区域处在两个关于 $y$ 的连续函数的图像之间，则为**II 型区域**：

$$D = \{(x, y) : c \le y \le d,\ h_1(y) \le x \le h_2(y)\},$$

其中 $c < d$ 和 $h_1(y) \le h_2(y)$ 对应 $c \le y \le d$。
:::

::: figure id=fig-19-2
左：类型 I 区域位于下曲线 $y = g_1(x)$ 和上曲线 $y = g_2(x)$ 之间，对于 $a \le x \le b$。每条在 $a$ 和 $b$ 之间的垂直线与该区域相交于一个线段（橙色），从 $g_1(x)$ 到 $g_2(x)$。右：类型 II 区域位于左曲线 $x = h_1(y)$ 和右曲线 $x = h_2(y)$ 之间，对于 $c \le y \le d$；每条在 $c$ 和 $d$ 之间的水平线与该区域相交于一个线段，从 $h_1(y)$ 到 $h_2(y)$。
:::

::: theorem 在第 I 类和第 II 类区域上求累次积分
若 $f$ 在定义 19.3 所述的第 I 类区域 $D$ 上连续，则

$$\iint_D f(x, y)\,dA = \int_a^b\int_{g_1(x)}^{g_2(x)} f(x, y)\,dy\,dx.$$

若 $f$ 在第 II 类区域 $D$ 上连续，则

$$\iint_D f(x, y)\,dA = \int_c^d\int_{h_1(y)}^{h_2(y)} f(x, y)\,dx\,dy.$$
:::

::: proof
取一个I型区域；II型情况相同，仅$x$与$y$互换。连续函数$g_1$和$g_2$在$[a, b]$上有界（极值定理，模块3），因此存在数$c < d$满足$c \le g_1(x)$和$g_2(x) \le d$，对所有$x$∈$[a, b]$成立。令$F$为$f$在$R = [a, b] \times [c, d]$上延拓为零。函数$f$在闭有界区域$D$上有界（由此类区域的极值定理，模块18），故$F$在$R$上有界，且除$g_1$和$g_2$的图像外连续。由定理19.1，$\iint_D f\,dA = \iint_R F\,dA$存在。对每个$x$，$F(x, y)$在$g_1(x) \le y \le g_2(x)$处等于$f(x, y)$，而在$[c, d]$中另一$y$处为0，因此

$$\int_c^d F(x, y)\,dy = \int_{g_1(x)}^{g_2(x)} f(x, y)\,dy.$$

对于每个固定的 $x$，函数 $y \mapsto F(x, y)$ 有界且连续，除了可能在两个端点 $g_1(x)$ 和 $g_2(x)$ 处，因此根据定理 9.3，其积分存在。现在 Fubini 定理的一般形式给出公式。
:::

为了设定积分限，先画一个示意图。

::: keyidea
**从示意图中确定积分限。** 为了设定 $\iint_D f\,dA$：

1. 绘制 $D$，标出其边界曲线，并找出它们的交点。
2. 对于顺序 $dy\,dx$，在 $D$ 处画一条垂直线，穿过一个典型的 $x$。它从下曲线 $y = g_1(x)$ 进入 $D$，并在上曲线 $y = g_2(x)$ 离开：这些是内积分限。外积分限是 $x$ 在 $D$ 中的最小值和最大值。
3. 对于阶数$dx\,dy$，在典型值$y$处画一条水平线。它从左侧曲线进入$D$并从右侧曲线离开，两者均记为$x = \dots$：这些是内限。外限是$D$中$y$的最小值与最大值。

这些说明描述了所选类型的区域。如果一个区域由多个分离的段组成，将其分成合适的部分并加总它们的积分。分割也可以简化由不同区间上不同公式给出的边界。外层积分限相对于积分变量是常数；它们可能依赖于一个固定的参数。内层积分限可能依赖于外层变量，从不依赖于内层变量。
:::

::: example 曲线之间区域的两种顺序
设 $D$ 是抛物线 $y = x^2$ 和直线 $y = x$ 之间的区域。用两种顺序计算 $\iint_D xy\,dA$。

曲线在 $x^2 = x$ 处相交，即在 $x = 0$ 和 $x = 1$ 处，也就是在 $(0, 0)$ 和 $(1, 1)$ 处。在它们之间，直线位于抛物线上方，因为 $x > x^2$ 在 $0 < x < 1$ 处成立。

**垂直切片。** 一条垂直线在 $x$ 处，从抛物线 $D$ 处进入，并在直线 $0 \le x \le 1$ 处离开：

$$\begin{aligned} \iint_D xy\,dA &= \int_0^1\int_{x^2}^{x} xy\,dy\,dx \\ &= \int_0^1 x\Big[\frac{y^2}{2}\Big]_{y=x^2}^{y=x}\,dx \\ &= \int_0^1 \frac{x^3 - x^5}{2}\,dx \\ &= \frac12\Big(\frac14 - \frac16\Big) = \frac{1}{24}. \end{aligned}$$

**水平切片。** 写成 $y$ 的函数时，直线为 $x = y$，而在 $x \ge 0$ 处的抛物线为 $x = \sqrt y$。对于 $y$、$0 \le y \le 1$ 的水平线，由于在该处有 $y \le \sqrt y$，它在直线处进入 $D$，在抛物线处离开：

$$\begin{aligned} \iint_D xy\,dA &= \int_0^1\int_{y}^{\sqrt y} xy\,dx\,dy \\ &= \int_0^1 y\Big[\frac{x^2}{2}\Big]_{x=y}^{x=\sqrt y}\,dy \\ &= \int_0^1 \frac{y^2 - y^3}{2}\,dy \\ &= \frac12\Big(\frac13 - \frac14\Big) = \frac{1}{24}. \end{aligned}$$

同样的答案，正如定理 19.3 所承诺的： $D$ 同时属于两种类型。

```check
same_set(solve(x**2 - x, x), [0, 1]); holds(Rational(1, 2) > Rational(1, 4))
antideriv(x*y**2/2, x*y, y); antideriv(y*x**2/2, x*y, x)
steps(Integral(x*y, (y, x**2, x), (x, 0, 1)), Integral((x**3 - x**5)/2, (x, 0, 1)), Rational(1, 2)*(Rational(1, 4) - Rational(1, 6)), Rational(1, 24))
same(integrate(x*y, (y, x**2, x)), (x**3 - x**5)/2)
steps(Integral(x*y, (x, y, sqrt(y)), (y, 0, 1)), Integral((y**2 - y**3)/2, (y, 0, 1)), Rational(1, 2)*(Rational(1, 3) - Rational(1, 4)), Rational(1, 24))
same(integrate(x*y, (x, y, sqrt(y))), (y**2 - y**3)/2)
yn = symbols('y', nonnegative=True); same(sqrt(yn)**2, yn); holds(Rational(1, 4) <= sqrt(Rational(1, 4)))
```
:::

::: widget name=region-slicer
从例 19.4 的区域开始，并使用顺序 $dy\,dx$，并移动滑块：橙色线段是切片，读数显示其两端两次，作为公式（内限 $x^2$ 和 $x$）和作为数值。切换到 $dx\,dy$：现在切片是水平的，边界曲线标记为 $x = y$ 和 $x = \sqrt y$，内限随之变化。尝试其他区域。对于四分之一圆盘，比较内限 $\sqrt{1 - x^2}$ 和 $\sqrt{1 - y^2}$。对于 $y = \sqrt x$ 和 $y = x/2$ 之间的区域，观察外限从 $0 \le x \le 4$ 变为 $0 \le y \le 2$。每次计算垂直切片和水平切片的面积时，结果都是一样的。
:::

用 $f = 1$，二重积分是 $D$ 的面积。对于类型 I 区域，

$$A(D) = \iint_D 1\,dA = \int_a^b\big(g_2(x) - g_1(x)\big)\,dx,$$

曲线之间面积的公式见 [第 12.2 节 ](module_12_ZH.html#area). 当 $A(D) > 0$ 和 $f$ 在 $D$ 上可积时，其平均值为 $\tfrac{1}{A(D)}\iint_D f\,dA$.

两个额外的性质可由第 19.1 节的性质推导得出，假设涉及的积分存在。如果 $D$ 由两个区域 $D_1$ 和 $D_2$ 组成，且它们的重叠部分面积为 0，则 $\iint_D f\,dA = \iint_{D_1} f\,dA + \iint_{D_2} f\,dA$。例如，它们的公共边界可能由有限多条如定理 19.1 中所述的曲线组成，这些曲线的面积为 0。并且如果 $f \ge 0$ 和 $D_1$ 位于 $D_2$ 内，则 $\iint_{D_1} f\,dA \le \iint_{D_2} f\,dA$，因为 $f$ 在 $D_1$ 外部扩展为零，其值至多为 $f$ 在 $D_2$ 外部扩展为零的值。

::: example 四面体的体积
对于 $a, b, c > 0$，平面 $\dfrac{x}{a} + \dfrac{y}{b} + \dfrac{z}{c} = 1$ 与坐标轴分别在 $(a, 0, 0)$、$(0, b, 0)$ 和 $(0, 0, c)$ 处相交。求该平面与三个坐标平面所围成的四面体的体积。

四面体是位于平面 $z = c\big(1 - \tfrac{x}{a} - \tfrac{y}{b}\big)$ 下方，且在三角形 $D$ 上方的立体（该三角形由坐标轴和直线 $\tfrac{x}{a} + \tfrac{y}{b} = 1$ 在 $xy$ 平面上切割而成，其中 $z = 0$）。因此 $D$ 是类型 I 区域 $0 \le x \le a$， $0 \le y \le b\big(1 - \tfrac{x}{a}\big)$。简写为 $w = 1 - \tfrac{x}{a}$；它不依赖于 $y$。内层积分是

$$\begin{aligned} \int_0^{bw} c\Big(w - \frac{y}{b}\Big)\,dy &= c\Big[wy - \frac{y^2}{2b}\Big]_0^{bw} \\ &= c\Big(bw^2 - \frac{bw^2}{2}\Big) = \frac{bc}{2}w^2, \end{aligned}$$

并且，代入 $u = 1 - \tfrac{x}{a}$（模块 10），

$$\begin{aligned} V &= \frac{bc}{2}\int_0^a\Big(1 - \frac{x}{a}\Big)^2\,dx \\ &= \frac{bc}{2}\cdot a\int_0^1 u^2\,du = \frac{abc}{6}. \end{aligned}$$

底面三角形的面积是 $\tfrac12 ab$，高度是 $c$，因此 $V = \tfrac13 \cdot \tfrac12 ab \cdot c$：底面乘以高度的三分之一，与 [第 12.3 节](module_12_ZH.html#slicing) 中的棱锥相同。

```check
ap, bp, cp, wp = symbols('a b c w', positive=True)
antideriv(cp*(wp*y - y**2/(2*bp)), cp*(wp - y/bp), y)
steps(Integral(cp*(wp - y/bp), (y, 0, bp*wp)), cp*(bp*wp**2 - bp*wp**2/2), bp*cp*wp**2/2)
same((cp*(1 - x/ap - y/bp)).subs(x, ap*(1 - wp)), cp*(wp - y/bp))
same(integrate((1 - x/ap)**2, (x, 0, ap)), ap*integrate(u**2, (u, 0, 1)))
same(bp*cp/2*integrate((1 - x/ap)**2, (x, 0, ap)), ap*bp*cp/6)
same(integrate(cp*(1 - x/ap - y/bp), (y, 0, bp*(1 - x/ap)), (x, 0, ap)), ap*bp*cp/6)
same(Rational(1, 3)*Rational(1, 2)*ap*bp*cp, ap*bp*cp/6)
```
:::

::: pitfall
内层积分限描述的是一个切片，而不是区域的角点。对于三角形 $0 \le y \le x \le 1$，写作 $\int_0^1\int_0^1 f\,dy\,dx$ 表示在整个正方形上积分；在 $x$ 处的垂直切片仅从 $y = 0$ 积分到 $y = x$。保持固定参数与积分变量区分开。如果外层积分限是一个正参数 $s$，写作 $\int_0^s\int_0^1 f(x, y)\,dy\,dx$：在 $x$ 和 $y$ 积分时保持 $s$ 固定。
:::

### 交换积分顺序 {#reversing}

有时只有某一顺序才能手动完成。

::: example 需要反向计算的积分
计算 $\displaystyle\int_0^1\int_x^1 e^{y^2}\,dy\,dx$。

如原文所示，内层积分要求$e^{y^2}$的原函数，但不存在初等原函数（模块11）。因此交换积分次序。积分限表明$0 \le x \le 1$和$x \le y \le 1$：区域$D$是顶点为$(0, 0)$、$(0, 1)$和$(1, 1)$的三角形，位于直线$y = x$上方。水平切片：在高度$y$处，对于$0 \le y \le 1$，水平线在$y$轴上的$D$处进入区域，在直线$x = y$处离开。作为II型区域$D$是$0 \le y \le 1$，$0 \le x \le y$，因此

$$\begin{aligned} \int_0^1\int_x^1 e^{y^2}\,dy\,dx &= \int_0^1\int_0^y e^{y^2}\,dx\,dy \\ &= \int_0^1 y\,e^{y^2}\,dy = \Big[\frac{e^{y^2}}{2}\Big]_0^1 \\ &= \frac{e - 1}{2} \approx 0.859. \end{aligned}$$

在 $x$ 中，内层积分将 $e^{y^2}$ 视为常数，并乘以切片的长度 $y$；这个因子 $y$ 是替换 $u = y^2$ 所需要的（模块 10）。

```check
same(integrate(exp(y**2), (x, 0, y)), y*exp(y**2)); antideriv(exp(y**2)/2, y*exp(y**2), y)
steps(Integral(exp(y**2), (x, 0, y), (y, 0, 1)), Integral(y*exp(y**2), (y, 0, 1)), (E - 1)/2)
rounds((E - 1)/2, '0.859')
same(integrate(exp(y**2), (y, x, 1), (x, 0, 1)), (E - 1)/2)          # the original order, done by SymPy with a special function
```
:::

::: compute 通过计算机反向计算
SymPy 可以进行原顺序的计算，但仅限于使用一个特殊函数：

```python
import sympy as sp
x, y = sp.symbols('x y')
inner = sp.integrate(sp.exp(y**2), (y, x, 1))
print(inner)
print(sp.simplify(sp.integrate(inner, (x, 0, 1))))
print(sp.integrate(sp.exp(y**2), (x, 0, y), (y, 0, 1)))   # reversed: x first
```

```output
-sqrt(pi)*erfi(x)/2 + sqrt(pi)*erfi(1)/2
-1/2 + E/2
-1/2 + E/2
```

内层积分用 `erfi` 表示，即“虚误差函数”，它是 模块 11 中误差函数的近亲，同样不是初等函数。SymPy 知道如何积分它，并在化简后得到 `-1/2 + E/2`，即 $\tfrac{e - 1}{2}$（`E` 是 SymPy 对 $e$ 的称呼）：例 19.6 的答案，通过反转顺序可立即得到。
:::

::: pitfall
要反转积分顺序，先画出区域，再从图中读取新的积分限；从不随意移动现有的积分限。保持 $\int_0^1\int_x^1 e^{y^2}\,dy\,dx$ 的常数积分限并舍弃其他限，得到 $\int_0^1\int_0^1 e^{y^2}\,dx\,dy = \int_0^1 e^{y^2}\,dy \approx 1.4627$，即整个正方形上的积分：不是例 19.6 中三角形的积分，后者约为 0.859。

```check
rounds(Integral(exp(y**2), (y, 0, 1)).evalf(30), '1.4627')
```
:::

## 极坐标 {#polar}

圆盘、圆环和扇形在 $x$ 和 $y$ 中显得笨拙：圆盘 $x^2 + y^2 \le 1$ 需要的积分限是 $\pm\sqrt{1 - x^2}$。在模块 16 的极坐标中，$x = r\cos\theta$ 和 $y = r\sin\theta$ 与 $r \ge 0$，同样的圆盘是 $0 \le r \le 1$，$0 \le \theta \le 2\pi$：一个在 $r$ 和 $\theta$ 中的矩形。一个 **极矩形** 是一个区域

$$\{(r, \theta) : r_0 \le r \le r_1,\ \alpha \le \theta \le \beta\},$$

其中 $0 \le r_0 < r_1$，$0 < \beta - \alpha \le 2\pi$。这是两条射线之间的一块圆环形区域（图 19.3 左）。希腊字母 $\alpha$ 和 $\beta$ 读作「阿尔法」和「贝塔」。

这个区域的面积是多少？半径为 $r$、圆心角为 $\Delta\theta$ 的扇形面积为 $\tfrac12 r^2\Delta\theta$（模块 16）。这里 $\Delta\theta = \beta - \alpha$，所以极坐标矩形的面积等于两个扇形的面积之差：

$$\begin{aligned} \frac12 r_1^2\,\Delta\theta - \frac12 r_0^2\,\Delta\theta &= \frac{r_0 + r_1}{2}\,(r_1 - r_0)\,\Delta\theta \\ &= \bar r\,\Delta r\,\Delta\theta, \end{aligned}$$

其中 $\Delta r = r_1 - r_0$ 和 $\bar r = \tfrac{r_0 + r_1}{2}$ 是平均半径。一个微小的极坐标矩形近似为一个矩形，其一边沿射线为 $\Delta r$，另一边沿半径为 $\bar r$ 的弧线为 $\bar r\,\Delta\theta$。其面积不是 $\Delta r\,\Delta\theta$ 而是 $\bar r\,\Delta r\,\Delta\theta$：相同 $\Delta r$ 和 $\Delta\theta$ 的极坐标矩形，离原点越远面积越大。

```check
r0, r1, dth = symbols('r_0 r_1 Delta_theta', positive=True)
same(Rational(1, 2)*r1**2*dth - Rational(1, 2)*r0**2*dth, (r0 + r1)/2*(r1 - r0)*dth)
same(integrate(r, (r, r0, r1), (theta, 0, dth)), (r0 + r1)/2*(r1 - r0)*dth)
```

::: figure id=fig-19-3
左：一个极坐标矩形，即一个环在两个半径之间的部分，位于角度 $\theta$ 和 $\theta + \Delta\theta$ 之间的射线之间。它的两边分别是 $\Delta r$ 沿一条射线，以及约 $r\,\Delta\theta$ 沿一条弧线，其面积恰好为 $\bar r\,\Delta r\,\Delta\theta$，其中 $\bar r$ 是平均半径。右：半径为 $a$ 的圆盘 $D_a$ 位于正方形 $S_a = [-a, a] \times [-a, a]$ 内，而该正方形又位于通过其顶点的圆盘 $D_{a\sqrt2}$ 内。定理 19.5 的证明将正方形上的积分夹逼在两个圆盘上的积分之间。
:::

::: theorem 极坐标下的二重积分
设 $f$ 在极坐标描述的区域 $D$ 上连续，

$$\alpha \le \theta \le \beta, \qquad h_1(\theta) \le r \le h_2(\theta),$$

其中 $0 < \beta - \alpha \le 2\pi$ 和 $h_1$，$h_2$ 在 $[\alpha, \beta]$ 上连续且 $0 \le h_1(\theta) \le h_2(\theta)$。则

$$\begin{aligned} &\iint_D f(x, y)\,dA \\ &\quad= \int_\alpha^\beta\int_{h_1(\theta)}^{h_2(\theta)} f(r\cos\theta, r\sin\theta)\,r\,dr\,d\theta. \end{aligned}$$
:::

非负半径和最多一个完整旋转的角度范围确保了每个点仅被覆盖一次，除了原点和当 $\beta - \alpha = 2\pi$ 时可能共享的边界射线。这些例外集合的面积为 0，不会改变积分值。

使用 $dA = r\,dr\,d\theta$: 将 $x$ 和 $y$ 替换为 $r\cos\theta$ 和 $r\sin\theta$，并将 $dA$ 替换为 $r\,dr\,d\theta$。对于极坐标矩形， $h_1$ 和 $h_2$ 是常数 $r_0$ 和 $r_1$。在 $f = 1$ 和 $h_1 = 0$ 的范围内，内层积分是 $\int_0^{h_2(\theta)} r\,dr = \tfrac12 h_2(\theta)^2$，定理给出面积 $\int_\alpha^\beta \tfrac12 h_2(\theta)^2\,d\theta$：模块 16 中极坐标下面积的公式。

**证明思想。** 取一个极坐标矩形，并将 $[r_0, r_1]$ 和 $[\alpha, \beta]$ 分成 $m$ 和 $n$ 等份。通过切割点的圆和射线将区域分成 $mn$ 个小极坐标矩形；位于 $r_{i-1}$ 和 $r_i$ 之间、以及 $\theta_{j-1}$ 和 $\theta_j$ 之间的那个矩形的面积为 $\bar r_i\,\Delta r\,\Delta\theta$，其中 $\bar r_i$ 是其平均半径。以半径 $\bar r_i$ 和某个角度 $\theta_j^*$ 作为样本点，求和

$$\sum_{i=1}^{m}\sum_{j=1}^{n} f\big(\bar r_i\cos\theta_j^*, \bar r_i\sin\theta_j^*\big)\,\bar r_i\,\Delta r\,\Delta\theta$$

将$f$乘以$D$的各部分面积之和，类似于双重黎曼和。它也是函数$f(r\cos\theta, r\sin\theta)\,r$在$r\theta$平面上矩形$[r_0, r_1] \times [\alpha, \beta]$上的普通双重黎曼和，因此它趋近于定理的右侧。它同时趋近于$\iint_D f\,dA$需要非矩形部分的黎曼和，本模块未展开讨论；第19.8节将定理置于一般规则中。

::: example 在抛物面下
求位于抛物面 $z = 4 - x^2 - y^2$ 下方且在 $xy$ 平面上方的立体的体积。

抛物面与平面 $z = 0$ 相交于圆 $x^2 + y^2 = 4$。因此，立体的底面是半径为 2 的圆盘 $D$，其上有 $4 - x^2 - y^2 \ge 0$。极坐标下 $x^2 + y^2 = r^2$，故高度为 $4 - r^2$，而 $D$ 对应于 $0 \le r \le 2$、$0 \le \theta \le 2\pi$：

$$\begin{aligned} V &= \int_0^{2\pi}\int_0^2 \big(4 - r^2\big)\,r\,dr\,d\theta \\ &= \int_0^{2\pi}\Big[2r^2 - \frac{r^4}{4}\Big]_0^2\,d\theta \\ &= \int_0^{2\pi} 4\,d\theta = 8\pi \approx 25.13. \end{aligned}$$

半径为 2、高度为 4 的圆柱体体积为 $16\pi$，因此该曲面恰好填满其一半。在 $x$ 和 $y$ 中相同体积为 $\int_{-2}^{2}\int_{-\sqrt{4 - x^2}}^{\sqrt{4 - x^2}} \big(4 - x^2 - y^2\big)\,dy\,dx$，计算过程要复杂得多。

```check
same((r*cos(theta))**2 + (r*sin(theta))**2, r**2)
antideriv(2*r**2 - r**4/4, (4 - r**2)*r, r); same((2*r**2 - r**4/4).subs(r, 2), 4)
steps(Integral((4 - r**2)*r, (r, 0, 2), (theta, 0, 2*pi)), Integral(4, (theta, 0, 2*pi)), 8*pi)
rounds(8*pi, '25.13'); same(pi*2**2*4, 16*pi)
same(integrate(4 - x**2 - y**2, (y, -sqrt(4 - x**2), sqrt(4 - x**2)), (x, -2, 2)), 8*pi)
```
:::

::: example 通过原点的圆盘
计算 $\displaystyle\iint_D \sqrt{x^2 + y^2}\,dA$，其中 $D$ 是由圆 $x^2 + y^2 = 2x$ 所围成的圆盘。

完成平方， $(x - 1)^2 + y^2 = 1$：以 $(1, 0)$ 为中心、半径为 1 的圆盘，该圆盘与原点相切。在极坐标下，该圆表示为 $r^2 = 2r\cos\theta$，即 $r = 2\cos\theta$（或 $r = 0$，原点）。圆盘位于半平面 $x \ge 0$ 内，因此 $\theta$ 从 $-\pi/2$ 变到 $\pi/2$，且角度为 $\theta$ 的射线穿过 $D$，从 $r = 0$ 到 $r = 2\cos\theta$。使用 $\sqrt{x^2 + y^2} = r$，

$$\begin{aligned} \iint_D \sqrt{x^2 + y^2}\,dA &= \int_{-\pi/2}^{\pi/2}\int_0^{2\cos\theta} r\cdot r\,dr\,d\theta \\ &= \int_{-\pi/2}^{\pi/2} \frac{8\cos^3\theta}{3}\,d\theta \\ &= \frac83\cdot\frac43 = \frac{32}{9}. \end{aligned}$$

对于最后一个积分，设 $\cos^3\theta = (1 - \sin^2\theta)\cos\theta$ 并代入 $u = \sin\theta$： $\int_{-\pi/2}^{\pi/2}\cos^3\theta\,d\theta = \int_{-1}^{1}(1 - u^2)\,du = \tfrac43$。该圆盘的面积为 $\pi$，因此其上所有点到原点的平均距离为 $\tfrac{32}{9\pi} \approx 1.13$，略大于其圆心的距离 1。

```check
same(expand((x - 1)**2 + y**2 - 1), x**2 + y**2 - 2*x)
same(solve(r**2 - 2*r*cos(theta), r), [0, 2*cos(theta)])
rn19 = symbols('r_nonnegative', nonnegative=True)
same(sqrt((rn19*cos(theta))**2 + (rn19*sin(theta))**2), rn19)
same(minimum(2*cos(theta), theta, Interval(-pi/2, pi/2)), 0)
same(integrate(r*r, (r, 0, 2*cos(theta))), 8*cos(theta)**3/3)
same(((1 - sin(theta)**2)*cos(theta)), cos(theta)**3); same(integrate(1 - u**2, (u, -1, 1)), Rational(4, 3))
same(integrate(cos(theta)**3, (theta, -pi/2, pi/2)), Rational(4, 3))
steps(Integral(r*r, (r, 0, 2*cos(theta)), (theta, -pi/2, pi/2)), Rational(8, 3)*Rational(4, 3), Rational(32, 9))
rounds(Rational(32, 9)/pi, '1.13'); holds(Rational(32, 9)/pi > 1)
same(integrate(r, (r, 0, 2*cos(theta)), (theta, -pi/2, pi/2)), pi)
```
:::

::: pitfall
两张极坐标卡片。忘记因子 $r$：$\int_0^{2\pi}\int_0^1 dr\,d\theta = 2\pi$ 不是单位圆的面积；$\int_0^{2\pi}\int_0^1 r\,dr\,d\theta = \pi$ 是。以及 $\theta$ 的错误范围：例 19.8 中的圆 $r = 2\cos\theta$ 在 $\theta$ 从 $-\pi/2$ 到 $\pi/2$ 时被绘制一次。让 $\theta$ 从 0 到 $2\pi$，得到 $\int_0^{2\pi} \tfrac83\cos^3\theta\,d\theta = 0$，因为在 $\pi/2 < \theta < 3\pi/2$ 的情况下，“半径” $2\cos\theta$ 是负数，定理 19.4 不允许这种情况。

```check
same(integrate(1, (r, 0, 1), (theta, 0, 2*pi)), 2*pi); same(integrate(r, (r, 0, 1), (theta, 0, 2*pi)), pi)
same(integrate(Rational(8, 3)*cos(theta)**3, (theta, 0, 2*pi)), 0); holds(2*cos(pi) < 0)
```
:::

### 高斯积分 {#gaussian}

模块 12 需要 $\int_{-\infty}^{\infty} e^{-x^2}\,dx$ 的值来证明正态密度函数的总面积为 1，并引用了它（[第 12.9 节 ](module_12_ZH.html#normal)]）并承诺在此处给出证明。没有 $e^{-x^2}$ 的初等原函数（模块 11）。技巧是将积分平方：平方后是一个双重积分，在极坐标下因子 $r$ 使得 $e^{-r^2}$ 容易积分。

::: theorem 高斯积分
$$\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi.$$
:::

::: proof
对于 $a > 0$ 让

$$I_a = \int_{-a}^{a} e^{-x^2}\,dx.$$

**$I_a$ 的平方是一个二重积分。** 积分变量的名称可以更换，故也有 $I_a = \int_{-a}^{a} e^{-y^2}\,dy$。在正方形 $S_a = [-a, a] \times [-a, a]$ 上应用第 19.2 节的乘积公式，得

$$\begin{aligned} I_a^2 &= \int_{-a}^{a} e^{-x^2}\,dx\int_{-a}^{a} e^{-y^2}\,dy \\ &= \iint_{S_a} e^{-(x^2 + y^2)}\,dA. \end{aligned}$$

**夹逼在两个圆盘之间。** 设 $D_R$ 为以原点为中心、半径为 $R$ 的圆盘。圆盘 $D_a$ 位于 $S_a$ 内部，而 $S_a$ 位于通过其顶点的圆盘 $D_{a\sqrt2}$ 内部（图19.3，右图）。被积函数为正，因此更大的区域给出更大的积分（第19.3节）：

$$\iint_{D_a} e^{-(x^2 + y^2)}\,dA \le I_a^2 \le \iint_{D_{a\sqrt2}} e^{-(x^2 + y^2)}\,dA.$$

**在极坐标下对圆盘进行积分。** 在 $D_R$， $x^2 + y^2 = r^2$ 以及替换 $u = r^2$（模块10）下，积分 $e^{-r^2}r$：

$$\begin{aligned} \iint_{D_R} e^{-(x^2 + y^2)}\,dA &= \int_0^{2\pi}\int_0^R e^{-r^2}\,r\,dr\,d\theta \\ &= 2\pi\Big[-\frac{e^{-r^2}}{2}\Big]_0^R \\ &= \pi\big(1 - e^{-R^2}\big). \end{aligned}$$

用 $R = a$ 和 $R = a\sqrt2$，夹逼变为

$$\pi\big(1 - e^{-a^2}\big) \le I_a^2 \le \pi\big(1 - e^{-2a^2}\big).$$

**设 $a \to \infty$.** 两个边界都趋于 $\pi$，因为 $e^{-a^2}$ 和 $e^{-2a^2}$ 都趋于 0。根据夹逼定理（[第 2.6 节](module_02_ZH.html#squeeze)，同样适用于无穷极限），$I_a^2 \to \pi$；由于 $I_a > 0$ 且平方根是连续的，$I_a \to \sqrt\pi$。最后，$e^{-x^2}$ 是偶函数，所以 $\int_0^a e^{-x^2}\,dx = \tfrac12 I_a \to \tfrac{\sqrt\pi}{2}$，同样 $\int_{-a}^0 e^{-x^2}\,dx \to \tfrac{\sqrt\pi}{2}$。瑕积分的两个部分都收敛（[第 12.8 节](module_12_ZH.html#infinite-intervals)，其中 $c = 0$），它们的和为 $\sqrt\pi$。
:::

```check
ag = symbols('a', positive=True)
same(integrate(exp(-x**2), (x, -ag, ag))*integrate(exp(-y**2), (y, -ag, ag)), integrate(exp(-x**2)*exp(-y**2), (y, -ag, ag), (x, -ag, ag)))
same(exp(-x**2)*exp(-y**2), exp(-(x**2 + y**2)))
holds(sqrt(2)*ag > ag); same((ag**2 + ag**2), (sqrt(2)*ag)**2)                 # the corners (±a, ±a) are at distance a*sqrt(2)
Rg = symbols('R', positive=True)
antideriv(-exp(-r**2)/2, exp(-r**2)*r, r)
steps(Integral(exp(-r**2)*r, (r, 0, Rg), (theta, 0, 2*pi)), 2*pi*(Rational(1, 2) - exp(-Rg**2)/2), pi*(1 - exp(-Rg**2)))
same((pi*(1 - exp(-Rg**2))).subs(Rg, sqrt(2)*ag), pi*(1 - exp(-2*ag**2)))
limit_is(pi*(1 - exp(-ag**2)), ag, oo, pi); limit_is(pi*(1 - exp(-2*ag**2)), ag, oo, pi)
limit_is(integrate(exp(-x**2), (x, 0, ag)), ag, oo, sqrt(pi)/2); same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi))
same(integrate(exp(-x**2), (x, -ag, 0)), integrate(exp(-x**2), (x, 0, ag)))
limit_is(integrate(exp(-x**2), (x, -ag, 0)), ag, oo, sqrt(pi)/2)
for av in (Rational(1, 2), 1, 2):
    Ia2 = Integral(exp(-x**2), (x, -av, av)).evalf(30)**2
    holds(pi*(1 - exp(-av**2)) <= Ia2); holds(Ia2 <= pi*(1 - exp(-2*av**2)))
```

数值夹逼：下面中间的列来自对 $I_a$ 的数值计算，两个界值逐渐逼近 $\pi = 3.14159\ldots$

```valuetable
a = 0.5, 1, 1.5, 2, 3
$\pi\big(1 - e^{-a^2}\big)$ = pi*(1 - exp(-a**2))
$I_a^2$ = Integral(exp(-x**2), (x, -a, a))**2
$\pi\big(1 - e^{-2a^2}\big)$ = pi*(1 - exp(-2*a**2))
digits = 6
---
a | \pi\big(1 - e^{-a^2}\big) | I_a^2 | \pi\big(1 - e^{-2a^2}\big)
0.5 | 0.694918 | 0.851121 | 1.23612
1 | 1.98587 | 2.23099 | 2.71642
1.5 | 2.81047 | 2.93223 | 3.10669
2 | 3.08405 | 3.11227 | 3.14054
3 | 3.14120 | 3.14145 | 3.14159
```

::: note
为何使用夹逼？一个更简短的论证将 $\int_{-\infty}^{\infty} e^{-x^2}\,dx$ 的平方写成整个平面的一个积分，并在一步中转换为极坐标： $\int_0^{2\pi}\int_0^\infty e^{-r^2}r\,dr\,d\theta = \pi$。这是想法，但它使用了一个在无界区域上的双重积分，这是不恰当的，需要其自身的定义。上述证明仅使用有界区域上的积分，并在最后让 $a \to \infty$ 趋于无穷。
:::

概率的两个结果。对于 $c > 0$，替换 $x = \sqrt c\,t$，其中 $dx = \sqrt c\,dt$，得到

$$\int_{-\infty}^{\infty} e^{-ct^2}\,dt = \frac{1}{\sqrt c}\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\frac{\pi}{c}}.$$

以 $c = \tfrac12$ 这是 $\int_{-\infty}^{\infty} e^{-t^2/2}\,dt = \sqrt{2\pi}$，使得标准正态密度 $\varphi(z) = e^{-z^2/2}/\sqrt{2\pi}$ 在模块 12 中成为密度的总面积。由于被积函数是偶函数，因此 $\int_0^\infty e^{-x^2}\,dx = \tfrac{\sqrt\pi}{2}$。

```check
cg = symbols('c', positive=True)
same(integrate(exp(-cg*t**2), (t, -oo, oo)), sqrt(pi/cg)); same(sqrt(pi/cg).subs(cg, Rational(1, 2)), sqrt(2*pi))
same((exp(-x**2)).subs(x, sqrt(cg)*t)*sqrt(cg), sqrt(cg)*exp(-cg*t**2))
same(integrate(exp(-z**2/2)/sqrt(2*pi), (z, -oo, oo)), 1); same(integrate(exp(-x**2), (x, 0, oo)), sqrt(pi)/2)
```

## 质量、质心与概率 {#applications}

体积和面积是起点。每当一个量在某个区域上分布，且已知每单位面积的量，就可以通过 [第 12.1 节 ](module_12_ZH.html#method)：切片（现在切成小矩形），近似，相加，然后取极限] 的方法，使用二重积分将其累加。

### 质量与质心 {#mass}

一块薄的平板，即**薄板**，占据平面上的区域$D$，其在$(x, y)$处的**密度**，即单位面积的质量，为$\rho(x, y)$ kg/m²。围绕样本点的小矩形区域的质量约为$\rho\,\Delta A$，其关于$y$轴的**力矩**约为其质量乘以到该轴的有符号距离$x$；其关于$x$轴的力矩则使用$y$。求和并取极限：

::: definition 板的质量与质心
设一薄片占据类型 I 或类型 II 的有界闭区域 $D$，或若干此类区域的有限并集，且密度 $\rho(x, y) \ge 0$ 连续。其 **质量** 以及关于 $y$ 轴和 $x$ 轴的 **力矩** 为

$$\begin{aligned} m &= \iint_D \rho\,dA, \\ M_y &= \iint_D x\rho\,dA, \qquad M_x = \iint_D y\rho\,dA, \end{aligned}$$

这些积分均为有限值。若 $m > 0$，则薄板的**质心**为点 $(\bar x, \bar y)$，其中

$$\bar x = \frac{M_y}{m}, \qquad \bar y = \frac{M_x}{m}.$$

若 $\rho$ 是一个正常数，且 $D$ 有正面积，则其被抵消，质心即为 **的 $D$ 的**。
:::

板在其中心质心处平衡，如同 [第 12.7 节 ](module_12_ZH.html#centre-of-mass)] 中的杆和板一样。模块 12 中均匀板在两曲线之间的质心公式即为此定义，其中内层积分已完成：在 $y$ 中对 $x$ 和 $y$ 从 $g(x)$ 积分到 $f(x)$，得到 $x\big(f(x) - g(x)\big)$ 和 $\tfrac12\big(f(x)^2 - g(x)^2\big)$。

```check
fU, gU = Function('f'), Function('g')
same(integrate(x, (y, gU(x), fU(x))), x*(fU(x) - gU(x))); same(integrate(y, (y, gU(x), fU(x))), (fU(x)**2 - gU(x)**2)/2)
```

::: example 一板在边缘处更密集
一薄板占据象限圆盘 $x^2 + y^2 \le 1$, $x \ge 0$, $y \ge 0$, 其长度单位为米，其密度与原点的距离成正比： $\rho = k\sqrt{x^2 + y^2}$ kg/m²，其中 $k > 0$ 为常数（一个假设的薄板）。求其质心。

在极坐标 $\rho = kr$ 中，该象限圆盘为 $0 \le r \le 1$, $0 \le \theta \le \pi/2$：

$$\begin{aligned} m &= \int_0^{\pi/2}\int_0^1 kr\cdot r\,dr\,d\theta = \frac{\pi}{2}\cdot\frac{k}{3} = \frac{k\pi}{6}, \\ M_y &= \int_0^{\pi/2}\int_0^1 (r\cos\theta)\,kr\cdot r\,dr\,d\theta \\ &= k\int_0^{\pi/2}\cos\theta\,d\theta\int_0^1 r^3\,dr = \frac{k}{4}. \end{aligned}$$

所以 $\bar x = \dfrac{k/4}{k\pi/6} = \dfrac{3}{2\pi} \approx 0.477$ m。交换 $x$ 和 $y$ 不改变象限圆盘或密度，因此 $M_x = M_y$ 和 $\bar y = \bar x$：质心为 $\big(\tfrac{3}{2\pi}, \tfrac{3}{2\pi}\big)$，且常数 $k$ 已被抵消。密度恒定的薄板在象限圆盘的质心 $\big(\tfrac{4}{3\pi}, \tfrac{4}{3\pi}\big) \approx (0.424, 0.424)$ 处平衡，与半圆盘在模块 12 中的平衡高度相同；额外质量靠近边缘使平衡点向外移动。

```check
kp = symbols('k', positive=True)
m199 = integrate(kp*r*r, (r, 0, 1), (theta, 0, pi/2)); same(m199, kp*pi/6)
My199 = integrate(r*cos(theta)*kp*r*r, (r, 0, 1), (theta, 0, pi/2)); same(My199, kp/4)
same(integrate(cos(theta), (theta, 0, pi/2))*integrate(r**3, (r, 0, 1)), Rational(1, 4))
same(My199/m199, 3/(2*pi)); rounds(3/(2*pi), '0.477')
same(integrate(r*sin(theta)*kp*r*r, (r, 0, 1), (theta, 0, pi/2)), My199)
cent = integrate(r*cos(theta)*r, (r, 0, 1), (theta, 0, pi/2))/integrate(r, (r, 0, 1), (theta, 0, pi/2))
same(cent, 4/(3*pi)); rounds(4/(3*pi), '0.424'); holds(3/(2*pi) > 4/(3*pi))
```
:::

### 惯性矩 {#inertia}

::: definition 惯性矩
定义 19.4 中的薄片关于 $x$ 轴、$y$ 轴及原点的**转动惯量**分别为

$$\begin{aligned} I_x &= \iint_D y^2\rho\,dA, \qquad I_y = \iint_D x^2\rho\,dA, \\ I_0 &= \iint_D \big(x^2 + y^2\big)\rho\,dA = I_x + I_y. \end{aligned}$$
:::

每一块板的质量乘以其到轴的距离的平方，即为该部分对轴的转动惯量；对于 $I_0$，距离是从原点到轴的距离，即通过原点并与板垂直的轴的距离。转动惯量衡量的是使板绕该轴转动或停止转动所需的力矩，正如质量衡量的是改变速度所需的力：一个绕固定轴以 $\omega$ 弧度每秒旋转的刚体，其旋转动能为 $\tfrac12 I\omega^2$，这是 $\tfrac12 mv^2$ 的对应量。由于平方关系，远离轴的质量对转动惯量的贡献更大。

::: example 圆盘与圆环
求一个半径为 $a > 0$、质量为 $M > 0$ 的均匀圆盘绕通过其中心并与圆盘垂直的轴的转动惯量 $I_0$，并将其与一个相同半径和质量的理想细圆环绕同一轴的转动惯量进行比较。

密度为 $\rho = \dfrac{M}{\pi a^2}$，在极坐标中为 $x^2 + y^2 = r^2$：

$$\begin{aligned} I_0 &= \int_0^{2\pi}\int_0^a r^2\,\frac{M}{\pi a^2}\,r\,dr\,d\theta \\ &= \frac{M}{\pi a^2}\cdot 2\pi\cdot\frac{a^4}{4} = \frac12 Ma^2. \end{aligned}$$

在一个理想的薄环中，所有质量都距离中心 $a$，因此 $I_0 = Ma^2$：两倍那么多。将环加速到相同的角速度所需能量是两倍。这解释了为什么将质量放在边缘附近可以帮助飞轮储存更多的旋转能量。

```check
aM, Mm = symbols('a M', positive=True)
steps(Integral(r**2*Mm/(pi*aM**2)*r, (r, 0, aM), (theta, 0, 2*pi)), Mm/(pi*aM**2)*2*pi*aM**4/4, Mm*aM**2/2)
same(Mm*aM**2/(Mm*aM**2/2), 2)
```
:::

### 联合概率密度 {#joint-densities}

模块 12 用一个密度函数描述了一个随机变量（[第 12.9](module_12_ZH.html#densities) 节）。一些随机变量对，例如下面的独立等待时间，可以用两个变量的联合密度函数来描述。并不是每一对随机变量都有这样的联合密度。

::: definition 联合密度
一个 **联合密度** 是一个函数 $f(x, y) \ge 0$，其在整个平面上的积分为 1。一对随机变量 $(X, Y)$ 具有联合密度 $f$，如果对于每一个区域 $D$，

$$P\big((X, Y) \in D\big) = \iint_D f(x, y)\,dA.$$
:::

$P\big((X, Y) \in D\big)$ 读作“点 $(X, Y)$ 落在 $D$ 中的概率”。对整个平面的积分是反常积分。对于该模块中在某个区域内连续、在其外为零的密度函数，它是正方形 $[-a, a] \times [-a, a]$ 上积分的极限，当 $a \to \infty$ 趋于无穷时，如同定理 19.5 的证明所示，函数 $f \ge 0$ 的反常二重积分可以按任意顺序计算为反常积分的累次积分。此处直接接受富比尼定理的这一推广。

**独立性。**两个随机变量 $X$ 和 $Y$，其密度分别为 $f_1$ 和 $f_2$，若它们的联合密度可以表示为 $f(x, y) = f_1(x)f_2(y)$ 的乘积，则称它们为**相互独立**。此时，根据第19.2节的乘积法则，

$$\begin{aligned} &P(a \le X \le b \text{ and } c \le Y \le d) \\ &\quad= \int_a^b f_1(x)\,dx\int_c^d f_2(y)\,dy \\ &\quad= P(a \le X \le b)\,P(c \le Y \le d): \end{aligned}$$

知道 $X$ 落在何处并不会改变 $Y$ 的概率。这是独立性的基本描述；概率论对所有随机变量定义了独立性，并证明了对于具有密度的随机变量，这种独立性等价于上述乘积法则。

::: example 哪个请求先到达？
两个服务器各自等待下一个请求（一个假设系统）。等待时间以秒为单位，是相互独立的：第一个，$X$，服从速率为 1 的指数分布，第二个，$Y$，服从速率为 2 的指数分布（[第 12.9 节](module_12_ZH.html#exponential-distribution)]）。求第二个服务器请求先到达的概率 $P(Y < X)$。

联合密度在$x \ge 0$和$y \ge 0$时为$f(x, y) = e^{-x}\cdot 2e^{-2y}$，在其他地方为0；两个因子在$[0, \infty)$上的积分均为1，因此其在平面上的积分为1。事件$Y < X$是第一象限中直线$y = x$下方的部分：对于每个$x \ge 0$，$y$从0运行到$x$。所以

$$\begin{aligned} P(Y < X) &= \int_0^\infty\int_0^x e^{-x}\,2e^{-2y}\,dy\,dx \\ &= \int_0^\infty e^{-x}\big(1 - e^{-2x}\big)\,dx \\ &= \int_0^\infty \big(e^{-x} - e^{-3x}\big)\,dx = 1 - \frac13 = \frac23. \end{aligned}$$

速率较高的请求流以三分之二的概率获胜：其速率 2 是总速率 3 的三分之二。在积分中包含边界 $y = x$ 不影响结果，因为其面积为 0。

```check
fJ = exp(-x)*2*exp(-2*y)
same(integrate(fJ, (y, 0, oo), (x, 0, oo)), 1)
same(integrate(exp(-x), (x, 0, oo)), 1); same(integrate(2*exp(-2*y), (y, 0, oo)), 1)
same(integrate(2*exp(-2*y), (y, 0, x)), 1 - exp(-2*x)); same(expand(exp(-x)*(1 - exp(-2*x))), exp(-x) - exp(-3*x))
same(integrate(exp(-x), (x, 0, oo)), 1); same(integrate(exp(-3*x), (x, 0, oo)), Rational(1, 3))
same(integrate(fJ, (y, 0, x), (x, 0, oo)), Rational(2, 3)); same(integrate(fJ, (x, y, oo), (y, 0, oo)), Rational(2, 3))
```
:::

::: pitfall
两个联合密度的卡片。联合密度不是概率，且可以大于 1：在例 19.11 中，$f(0, 0) = 2$。概率是通过对该密度在某一区域进行积分得到的。并且积分的上下限必须描述该区域内密度不为 0 的事件。对于上面的$Y < X$，$y$从 0 开始，即密度开始的地方，而不是$-\infty$：公式$e^{-x}\cdot 2e^{-2y}$从$y = -\infty$积分会导致发散，尽管该处的密度为 0。

```check
same(fJ.subs({x: 0, y: 0}), 2); same(integrate(2*exp(-2*y), (y, -oo, 0)), oo)
```
:::

::: compute 概率的模拟计算
概率也可以通过模拟随机变量多次并计数来估计。NumPy 的随机数生成器直接生成指数分布的等待时间；其`scale`是均值，$1/\lambda$。种子使得在相同软件环境中在同一台机器上调用该序列可重复；其他 NumPy 版本或环境可能会产生不同的样本：

```python
import numpy as np
rng = np.random.default_rng(2026)
N = 1_000_000
X = rng.exponential(scale=1.0, size=N)     # rate 1
Y = rng.exponential(scale=0.5, size=N)     # rate 2
print(np.mean(Y < X))                      # the fraction of trials with Y < X
```

```output
0.666296
```

该分数接近$\tfrac23 \approx 0.6667$，如例19.11所示。对于概率为$p$的事件进行$N$次独立试验，该分数的标准差为$\sqrt{p(1-p)/N}$。此处$p = 2/3$，因此一百万次试验给出的标准差约为0.00047。这种典型的抽样误差按$1/\sqrt N$的速率减小；特定运行中的误差未必减小，且不保证有固定数量的正确位数。在许多维度的积分中，由于方格网格需要过多的点，通常通过此类**蒙特卡罗**方法进行估计，当所采样量具有有限方差时，其速率为此。

```check
rounds(Rational(2, 3), '0.6667')
pMC_, NMC_ = symbols('p N', positive=True)
same((1 - pMC_)**2*pMC_ + pMC_**2*(1 - pMC_), pMC_*(1 - pMC_))  # variance of one 0-or-1 trial
same(NMC_*pMC_*(1 - pMC_)/NMC_**2, pMC_*(1 - pMC_)/NMC_)
rounds(sqrt(Rational(2, 3)*Rational(1, 3)/10**6), '0.00047')
```
:::

## 三重积分 {#triple}

一个三变量函数 $f(x, y, z)$ 可能表示固体在每个点的密度，或房间内的温度。对于一个盒子

$$B = [a, b] \times [c, d] \times [p, q],$$

对于 $a < b$、$c < d$ 和 $p < q$，将每条边等分，使得 $B$ 被分割为体积为 $\Delta V = \Delta x\,\Delta y\,\Delta z$ 的小盒子，在每个小盒子中选取一个样本点，并将 $f$ 在样本点处的值与 $\Delta V$ 的乘积相加：得到一个 **三重黎曼和**。当三条边长均趋于 0 且结果与样本点的选取无关时，其极限即为 **三重积分**$\iiint_B f(x, y, z)\,dV$，读作“$f$ 在 $B$ 上的三重积分 $dV$”。对于非盒子的有界立体，如第 19.3 节所述，将 $f$ 延拓至包含该立体的盒子中（在延拓部分为零），并在该延拓可积时使用此定义。若立体 $E$ 位于 $xy$-平面上区域 $D$ 上方的两个曲面之间，则称其为**1 型**立体。

$$E = \{(x, y, z) : (x, y) \in D,\ u_1(x, y) \le z \le u_2(x, y)\},$$

其中 $u_1$、$u_2$ 连续，且 $u_1 \le u_2$。立体在 $xy$ 平面上的投影为 $D$。

::: theorem 三重积分作为迭代积分
如果 $f$ 在盒子 $B$ 上连续，则 $\iiint_B f\,dV$ 等于任意一种六种顺序的累次积分，例如

$$\iiint_B f\,dV = \int_a^b\int_c^d\int_p^q f(x, y, z)\,dz\,dy\,dx.$$

如果 $f$ 在一个类型 1 的立体 $E$ 上连续，且其投影 $D$ 是类型 I 或类型 II，则

$$\iiint_E f\,dV = \iint_D\Big[\int_{u_1(x, y)}^{u_2(x, y)} f(x, y, z)\,dz\Big]\,dA.$$
:::

证明与定理 19.2、19.3 的论证相同，只增加一个维度。然后按第 19.3 节的方法建立在 $D$ 上的二重积分。对 $yz$ 平面某个区域上由两个曲面 $x = \dots$ 夹成的立体，或 $xz$ 平面某个区域上由两个曲面 $y = \dots$ 夹成的立体，只需更换变量，方法相同。取 $f = 1$ 时，$\iiint_E dV$ 就是 $E$ 的**体积**。对这样的有界闭立体，连续密度 $\rho(x, y, z) \ge 0$ 给出有限的质量 $m = \iiint_E \rho\,dV$ 和有限的矩。若 $m > 0$，质心为 $(\bar x, \bar y, \bar z)$，其中 $\bar x = \tfrac1m\iiint_E x\rho\,dV$，$\bar y$ 和 $\bar z$ 类似。若密度为正常数，该质心也就是 $E$ 的**形心**。

::: example 四面体的质心
求四面体 $E$ 的体积和质心，其顶点为 $(0, 0, 0)$, $(1, 0, 0)$, $(0, 1, 0)$ 和 $(0, 0, 1)$。

与原点相对的面位于平面 $x + y + z = 1$ 上，因此 $E$ 是类型 1 的立体 $0 \le z \le 1 - x - y$，其投影区域为三角形 $D$： $0 \le x \le 1$, $0 \le y \le 1 - x$。其体积为

$$\begin{aligned} V &= \int_0^1\int_0^{1-x}\int_0^{1-x-y} dz\,dy\,dx \\ &= \int_0^1\int_0^{1-x}(1 - x - y)\,dy\,dx \\ &= \int_0^1\frac{(1 - x)^2}{2}\,dx = \frac16, \end{aligned}$$

如例 19.5 所示，与 $a = b = c = 1$ 相同。对于质心，

$$\begin{aligned} \iiint_E z\,dV &= \int_0^1\int_0^{1-x}\frac{(1 - x - y)^2}{2}\,dy\,dx \\ &= \int_0^1\frac{(1 - x)^3}{6}\,dx = \frac{1}{24}, \end{aligned}$$

所以 $\bar z = \dfrac{1/24}{1/6} = \dfrac14$。交换 $x$, $y$ 和 $z$ 中的任意两个不会改变 $E$，因此 $\bar x = \bar y = \bar z = \tfrac14$。质心 $\big(\tfrac14, \tfrac14, \tfrac14\big)$ 是四个顶点的平均值，即从面 $z = 0$ 的质心向对面顶点移动四分之一的距离。

```check
same(integrate(1, (z, 0, 1 - x - y)), 1 - x - y); same(integrate(1 - x - y, (y, 0, 1 - x)), (1 - x)**2/2)
V1912 = integrate(1, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)); same(V1912, Rational(1, 6))
same(integrate(z, (z, 0, 1 - x - y)), (1 - x - y)**2/2); same(integrate((1 - x - y)**2/2, (y, 0, 1 - x)), (1 - x)**3/6)
Mz1912 = integrate(z, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)); same(Mz1912, Rational(1, 24)); same(Mz1912/V1912, Rational(1, 4))
same(integrate(x, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)), Rational(1, 24)); same(integrate(y, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)), Rational(1, 24))
same((Rational(0) + 1 + 0 + 0)/4, Rational(1, 4))
same(Rational(3, 4)*Matrix([Rational(1, 3), Rational(1, 3), 0]) + Rational(1, 4)*Matrix([0, 0, 1]), Matrix([Rational(1, 4)]*3))
```
:::

**选择积分次序。**同一个四面体可以用六种不同的次序来描述。将其投影到$yz$-平面上，例如得到$0 \le y \le 1$、$0 \le z \le 1 - y$、$0 \le x \le 1 - y - z$和$V = \int_0^1\int_0^{1-y}\int_0^{1-y-z} dx\,dz\,dy$。第19.3节的配方每次处理一个变量。最内层的积分限是平行于该变量轴的直线进入和离开$E$的两个曲面；另外两个变量描述了$E$在其坐标轴平面上的投影，如同二维情形。选择使投影和积分最简单的次序。

```check
same(integrate(1, (x, 0, 1 - y - z), (z, 0, 1 - y), (y, 0, 1)), Rational(1, 6))
```

::: pitfall
在三重迭代积分中，最内层的限制可能依赖于两个外层变量，中间层的限制仅依赖于最外层变量，而最外层的限制则不依赖于任何变量。在 $\int_0^1\int_0^{1-x}\int_0^{1-x-y} f\,dz\,dy\,dx$ 中，限制 $1 - x - y$ 应该放在 $dz$ 内部；它不能移到中间积分中，因为在中间积分中 $y$ 是被积分的变量。
:::

## 圆柱坐标和球面坐标 {#cylindrical-spherical}

### 圆柱坐标 {#cylindrical}

**柱坐标系** $(r, \theta, z)$描述一个点，通过其在 $xy$-平面的极坐标 $(r, \theta)$ 的投影以及它的高度 $z$ 来确定，其中 $r \ge 0$ 和 $z$ 是任意实数。与极坐标类似， $\theta$ 在 $z$-轴上是任意的：

$$x = r\cos\theta, \qquad y = r\sin\theta, \qquad z = z.$$

圆柱 $x^2 + y^2 = 4$ 变为 $r = 2$，抛物面 $z = x^2 + y^2$ 变为 $z = r^2$。对于一个其投影用极坐标描述的类型 1 固体，定理 19.6 与定理 19.4 对于二重积分给出 $dV = dz\,dA = r\,dz\,dr\,d\theta$：

::: theorem 柱坐标系中的三重积分
设 $E$ 为区域 $D$ 上方的立体 $u_1(x, y) \le z \le u_2(x, y)$，由 $\alpha \le \theta \le \beta$、$h_1(\theta) \le r \le h_2(\theta)$ 给出，其中 $h_1$ 和 $h_2$ 如定理 19.4 所述，且 $u_1 \le u_2$ 连续。若 $f$ 在 $E$ 上连续，则

$$\iiint_E f\,dV = \int_\alpha^\beta\int_{h_1(\theta)}^{h_2(\theta)}\int_{u_1}^{u_2} f\,r\,dz\,dr\,d\theta,$$

其中 $f$ 在 $(r\cos\theta, r\sin\theta, z)$ 处计算， $u_1$ 和 $u_2$ 在 $(x, y) = (r\cos\theta, r\sin\theta)$ 上的限。
:::

::: example 抛物面碗中的水
[例12.7](module_12_ZH.html#other-axes) 是表面 $z = x^2 + y^2$，即绕 $z$ 轴（模块12称为垂直轴 $y$）旋转的抛物线 $z = x^2$。它盛有密度均匀的正密度液体，深度为 $h > 0$。求液体的体积及其质心的高度。

液体是固体 $r^2 \le z \le h$，位于圆盘 $0 \le r \le \sqrt h$ $0 \le \theta \le 2\pi$ 上方，碗位于水面以下。其体积为

$$\begin{aligned} V &= \int_0^{2\pi}\int_0^{\sqrt h}\int_{r^2}^{h} r\,dz\,dr\,d\theta \\ &= 2\pi\int_0^{\sqrt h}\big(h - r^2\big)\,r\,dr \\ &= 2\pi\Big(\frac{h^2}{2} - \frac{h^2}{4}\Big) = \frac{\pi h^2}{2}, \end{aligned}$$

如模块12所述，通过圆盘法求得。液体绕 $z$ 轴旋转时不变，因此其质心位于轴上。其高度需要

$$\begin{aligned} \iiint z\,dV &= 2\pi\int_0^{\sqrt h}\Big[\frac{z^2}{2}\Big]_{r^2}^{h}\,r\,dr \\ &= \pi\int_0^{\sqrt h}\big(h^2 - r^4\big)\,r\,dr \\ &= \pi\Big(\frac{h^3}{2} - \frac{h^3}{6}\Big) = \frac{\pi h^3}{3}, \end{aligned}$$

所以 $\bar z = \dfrac{\pi h^3/3}{\pi h^2/2} = \dfrac{2h}{3}$：从底部向上三分之二处，因为碗的顶部最宽。（如果边缘位于 $z = h$，将所有液体泵至该高度，其质量 $m$ 平均上升 $h - \tfrac{2h}{3} = \tfrac{h}{3}$。在重力加速度 $g$ 保持不变的情况下，克服重力的理想功为 $\tfrac13 mgh$。）

```check
hb = symbols('h', positive=True)
same(integrate(r, (z, r**2, hb)), (hb - r**2)*r)
steps(Integral(r, (z, r**2, hb), (r, 0, sqrt(hb)), (theta, 0, 2*pi)), 2*pi*(hb**2/2 - hb**2/4), pi*hb**2/2)
same(integrate(z*r, (z, r**2, hb)), (hb**2 - r**4)*r/2)
steps(Integral(z*r, (z, r**2, hb), (r, 0, sqrt(hb)), (theta, 0, 2*pi)), pi*(hb**3/2 - hb**3/6), pi*hb**3/3)
same((pi*hb**3/3)/(pi*hb**2/2), 2*hb/3); same(hb - 2*hb/3, hb/3)
same(pi*integrate(y, (y, 0, hb)), pi*hb**2/2)
rw, gw = symbols('rho g', positive=True)   # the work of lifting each element rho dV through h - z
same(integrate(rw*gw*(hb - z)*r, (z, r**2, hb), (r, 0, sqrt(hb)), (theta, 0, 2*pi)), Rational(1, 3)*(rw*pi*hb**2/2)*gw*hb)
```
:::

### 球坐标 {#spherical}

球体、顶点在原点的圆锥以及球体之间的区域需要自己的坐标系。

::: definition 球坐标
点 $P \ne O$ 的**球坐标** $(\rho, \theta, \varphi)$ 由三个量组成：到原点 $O$ 的距离 $\rho > 0$、其柱坐标的角 $\theta$，以及从 $z$ 轴正向到线段 $OP$ 的夹角 $\varphi$，其中 $0 \le \varphi \le \pi$。在 $z$ 轴上，$\theta$ 可任取。原点用 $\rho = 0$ 表示，两个角均可任取。各种情况下都有

$$\begin{aligned} x &= \rho\sin\varphi\cos\theta, \qquad y = \rho\sin\varphi\sin\theta, \\ z &= \rho\cos\varphi, \end{aligned}$$

和 $\rho^2 = x^2 + y^2 + z^2$。
:::

希腊字母是 $\rho$，"rho"（此处表示距离，而非密度），以及 $\varphi$，"phi"。在 $z$ 轴之外，通过该轴的竖直半平面和 $P$ 包含 $OP$，其长度为 $\rho$，并与正 $z$ 轴形成角度 $\varphi$。因此 $P$ 的高度为 $z = \rho\cos\varphi$，位于轴的距离为 $r = \rho\sin\varphi$（图 19.4）；然后 $x = r\cos\theta$ 和 $y = r\sin\theta$。方程 $\rho = a$，对于 $a > 0$，描述一个球面。对于 $0 < c < \pi$ 与 $c \ne \pi/2$，方程 $\varphi = c$ 描述围绕 $z$ 轴的一个圆锥；方程 $c = \pi/2$ 给出 $xy$ 平面，方程 $c = 0$ 或 $\pi$ 给出沿正或负 $z$ 轴的射线。方程 $\theta = c$ 描述一个竖直半平面。

```check
rh, ph = symbols('rho phi', nonnegative=True)
same((rh*sin(ph)*cos(theta))**2 + (rh*sin(ph)*sin(theta))**2 + (rh*cos(ph))**2, rh**2)
same((rh*sin(ph)*cos(theta))**2 + (rh*sin(ph)*sin(theta))**2, (rh*sin(ph))**2)
```

::: note
习惯不同。本系列以正 $z$ 轴为基准测量 $\varphi$，使得 $\varphi = 0$ 在正 $z$ 轴上， $\varphi = \pi/2$ 在 $xy$ 平面上， $\varphi = \pi$ 在负 $z$ 轴上，保持 $\theta$ 为绕 $z$ 轴的角度，如极坐标和柱坐标。其他参考则交换这两个名称，写作 $\theta$ 表示从 $z$ 轴的角度， $\varphi$ 表示绕该轴的角度，地理上则以赤道为基准测量纬度，而非从极点。在使用其他来源的公式前，请确认哪个角度对应哪个名称。
:::

::: figure id=fig-19-4
球面坐标。点 $P$ 距原点的距离为 $\rho$，与正 $z$ 轴的夹角为 $\varphi$。其在 $xy$ 平面上的投影距原点的距离为 $r = \rho\sin\varphi$，对应极坐标的角度为 $\theta$，其高度为 $z = \rho\cos\varphi$。灰色弧线勾勒出半径为 $\rho$ 的球体在第一卦限的部分；虚线弧线通过 $P$，是常数 $\varphi$ 的圆弧和常数 $\theta$ 的半圆弧的一部分。
:::

**体积元素.**一个很小的**球面楔形**，位于半径 $\rho$ 和 $\rho + \Delta\rho$ 之间，夹角 $\theta$ 和 $\theta + \Delta\theta$ 以及夹角 $\varphi$ 和 $\varphi + \Delta\varphi$ 之间，几乎是一个长方体。它沿着从原点出发的射线方向的边长为 $\Delta\rho$。它沿着常数 $\theta$ 的半圆方向的边，该半圆的半径为 $\rho$，长度约为 $\rho\,\Delta\varphi$。它沿着常数 $\varphi$ 的圆方向的边，该圆的半径为 $r = \rho\sin\varphi$，围绕 $z$ 轴，长度约为 $\rho\sin\varphi\,\Delta\theta$。这三条边互相垂直，因此该楔形的体积约为 $\rho^2\sin\varphi\,\Delta\rho\,\Delta\theta\,\Delta\varphi$，并且

$$dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi.$$

::: theorem 球坐标系中的三重积分
设 $E$ 为球面楔形 $\rho_0 \le \rho \le \rho_1$， $\alpha \le \theta \le \beta$， $\varphi_0 \le \varphi \le \varphi_1$，其中 $0 \le \rho_0 \le \rho_1 < \infty$， $0 < \beta - \alpha \le 2\pi$ 和 $0 \le \varphi_0 < \varphi_1 \le \pi$。如果 $f$ 在 $E$ 上连续，则

$$\iiint_E f\,dV = \int_{\varphi_0}^{\varphi_1}\int_\alpha^\beta\int_{\rho_0}^{\rho_1} f\,\rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi,$$

其中 $f$ 在点 $x = \rho\sin\varphi\cos\theta$， $y = \rho\sin\varphi\sin\theta$ 和 $z = \rho\cos\varphi$ 处进行计算。
:::

上述的楔形论证是证明的思路；第19.8节给出了普遍原因，其中 $\rho^2\sin\varphi$ 是雅可比行列式的绝对值。角度范围覆盖整个立体，除了原点、轴线和可能的角缝，这些地方的体积都是零。相同的公式也适用于连续的径向边界 $\rho_0(\theta,\varphi)$ 和 $\rho_1(\theta,\varphi)$，它们在相同的闭合角度矩形上满足 $0 \le \rho_0 \le \rho_1$。

::: example 一个球体和一个冰淇淋锥体
(a) 求半径为 $a > 0$ 的球体的体积。 (b) 求球体中位于正 $z$ 轴角度 $\pi/3$ 内的部分的体积，即一个“冰淇淋锥体”。

**(a)** 球体是 $0 \le \rho \le a$, $0 \le \theta \le 2\pi$, $0 \le \varphi \le \pi$。所有极限都是常数，被积函数是每个变量的函数的乘积，因此积分可以像第19.2节那样分解：

$$\begin{aligned} V &= \int_0^\pi\int_0^{2\pi}\int_0^a \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi \\ &= \int_0^\pi \sin\varphi\,d\varphi\int_0^{2\pi} d\theta\int_0^a \rho^2\,d\rho \\ &= 2\cdot 2\pi\cdot\frac{a^3}{3} = \frac43\pi a^3, \end{aligned}$$

体积 [例12.5](module_12_ZH.html#washers) 用圆盘法求得。

**(b)** 现在 $0 \le \varphi \le \pi/3$，并且因子 $\int_0^{\pi/3}\sin\varphi\,d\varphi = 1 - \cos\tfrac{\pi}{3} = \tfrac12$ 替换了 2：

$$V = \frac12\cdot 2\pi\cdot\frac{a^3}{3} = \frac{\pi a^3}{3},$$

一个球体的四分之一。锥体 $\varphi = \pi/3$ 是表面 $z = \tfrac{1}{\sqrt3}\sqrt{x^2 + y^2}$，因为在 $r = z\tan\tfrac{\pi}{3} = \sqrt3\,z$ 上。在 $x$ 中， $y$ 和 $z$ 的冰淇淋锥需要带有平方根的限制，内积分在锥体下方和球体上方；在球坐标系中，所有六个限制都是常数。

```check
aB = symbols('a', positive=True)
same(integrate(sin(ph), (ph, 0, pi)), 2); same(integrate(rh**2, (rh, 0, aB)), aB**3/3)
steps(Integral(rh**2*sin(ph), (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi)), 2*2*pi*aB**3/3, Rational(4, 3)*pi*aB**3)
same(integrate(sin(ph), (ph, 0, pi/3)), Rational(1, 2)); same(1 - cos(pi/3), Rational(1, 2))
same(integrate(rh**2*sin(ph), (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi/3)), pi*aB**3/3); same((pi*aB**3/3)/(Rational(4, 3)*pi*aB**3), Rational(1, 4))
same(tan(pi/3), sqrt(3)); same((rh*sin(ph)/(rh*cos(ph))).subs(ph, pi/3), sqrt(3))
```
:::

::: pitfall
$\varphi$ 从 0 到 $\pi$，而不是到 $2\pi$：在 $\varphi = \pi$ 处，线段 $OP$ 已经指向负 $z$ 轴。允许两个角度都从 0 到 $2\pi$ 覆盖了球体几乎每个点两次。保留符号因子 $\sin\varphi$ 会使得体积为 0，因为 $\int_0^{2\pi}\sin\varphi\,d\varphi = 0$；使用其绝对值会得到两倍正确的体积。坐标范围必须正确，雅可比行列式也必须正确。并且在通常范围上的因子是 $\rho^2\sin\varphi$：没有 $\sin\varphi$ 的话， $\int_0^\pi\int_0^{2\pi}\int_0^a \rho^2\,d\rho\,d\theta\,d\varphi = \tfrac{2\pi^2a^3}{3} \approx 6.58a^3$ 代替 $\tfrac43\pi a^3 \approx 4.19a^3$。

```check
same(integrate(sin(ph), (ph, 0, 2*pi)), 0); same(integrate(rh**2, (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi)), 2*pi**2*aB**3/3)
rounds(2*pi**2/3, '6.58'); rounds(Rational(4, 3)*pi, '4.19')
same(integrate(sin(ph), (ph, 0, pi)) - integrate(sin(ph), (ph, pi, 2*pi)), 4)
same(4*2*pi*aB**3/3, 2*(Rational(4, 3)*pi*aB**3))
```
:::

::: compute 坐标及其体积元素
SymPy 的 `Matrix.jacobian` 构造了一个变换所有一阶偏导数的数组， `.det()` 取其行列式，即第 19.8 节的雅可比行列式。对于极坐标、柱坐标和球坐标：

```python
import sympy as sp
r, rho = sp.symbols('r rho', nonnegative=True)
theta, z, phi = sp.symbols('theta z phi', real=True)
polar = sp.Matrix([r*sp.cos(theta), r*sp.sin(theta)])
cyl = sp.Matrix([r*sp.cos(theta), r*sp.sin(theta), z])
sph = sp.Matrix([rho*sp.sin(phi)*sp.cos(theta),
                 rho*sp.sin(phi)*sp.sin(theta),
                 rho*sp.cos(phi)])
print(sp.simplify(polar.jacobian([r, theta]).det()))
print(sp.simplify(cyl.jacobian([r, theta, z]).det()))
print(sp.simplify(sph.jacobian([rho, phi, theta]).det()))
```

```output
r
r
rho**2*sin(phi)
```

这些是 $dA = r\,dr\,d\theta$, $dV = r\,dz\,dr\,d\theta$ 和 $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$ 中的因素。(按顺序列出球面变量 $\rho$, $\theta$, $\varphi$ 会改变行列式的符号；公式中使用其绝对值。) 一个球体的体积和例 19.14 中的冰淇淋锥体如下：

```python
J = rho**2*sp.sin(phi)
a = sp.symbols('a', positive=True)
print(sp.integrate(J, (rho, 0, a), (theta, 0, 2*sp.pi), (phi, 0, sp.pi)))
print(sp.integrate(J, (rho, 0, a), (theta, 0, 2*sp.pi), (phi, 0, sp.pi/3)))
```

```output
4*pi*a**3/3
pi*a**3/3
```
:::

## 变量替换 {#change-of-variables}

极坐标、柱坐标和球坐标都是同一个想法的例子：用新的变量来描述一个区域，使其变得简单，并通过一个因子来补偿这种变化，该因子衡量新变量如何拉伸面积或体积。在单变量情况下，这就是变量替换：对于在 $[c,d]$ 上连续可微的 $g$ 和在它的像上连续的 $f$，有 $\int_{g(c)}^{g(d)} f(x)\,dx = \int_c^d f\big(g(u)\big)\,g'(u)\,du$ ([第 10.7 节](module_10_ZH.html#definite-substitution))。带符号的因子 $g'(u)$ 包含方向；局部长度尺度是 $\abs{g'(u)}$。在二维情况下，一个 **变换** $T$ 将 $uv$ 平面上的区域 $S$ 中的每个点 $(u, v)$ 映射到 $xy$ 平面上的点 $(x, y) = T(u, v)$，通过公式

$$x = x(u, v), \qquad y = y(u, v),$$

和拉伸因子是一个行列式。一个 **2 × 2 行列式** 是数字

$$\begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc$$

数学基础将行列式与矩阵结合，在其[模块 10](../math/module_10_ZH.html#s5) 中。由平面中两个向量 $\langle a, c\rangle$ 和 $\langle b, d\rangle$ 所张成的平行四边形的面积为 $\abs{ad - bc}$：将它们视为空间中的向量 $\langle a, c, 0\rangle$ 和 $\langle b, d, 0\rangle$，它们的叉乘为 $\langle 0, 0, ad - bc\rangle$，叉乘的长度即为这两个向量所张成的平行四边形的面积（模块 16）。

```check
p1, p2, p3, p4 = symbols('p1 p2 p3 p4')
same(Matrix([p1, p3, 0]).cross(Matrix([p2, p4, 0])), Matrix([0, 0, p1*p4 - p2*p3])); same(Matrix([[p1, p2], [p3, p4]]).det(), p1*p4 - p2*p3)
```

::: definition 雅可比行列式
设 $x = x(u, v)$、$y = y(u, v)$ 具有连续的一阶偏导数。该变换的**雅可比行列式**为

$$\frac{\partial(x, y)}{\partial(u, v)} = \begin{vmatrix} \dfrac{\partial x}{\partial u} & \dfrac{\partial x}{\partial v} \\[8pt] \dfrac{\partial y}{\partial u} & \dfrac{\partial y}{\partial v} \end{vmatrix} = \frac{\partial x}{\partial u}\frac{\partial y}{\partial v} - \frac{\partial x}{\partial v}\frac{\partial y}{\partial u}.$$
:::

记号 $\partial(x, y)/\partial(u, v)$ 读作「$x$ 和 $y$ 关于 $u$ 和 $v$ 的雅可比行列式」。它是 $u$ 和 $v$ 的函数。

::: theorem 二重积分的换元法
设 $S$、$D$ 是第 I 类或第 II 类的闭有界区域。假设 $T$ 在 $S$ 的某个邻域内有连续的一阶偏导数，将 $S$ 映满 $D$，并且在 $S$ 的内部为单射且雅可比行列式非零。边界上的点可以有相同的像，边界上的雅可比行列式也可以为零。若 $f$ 在 $D$ 上连续，则

$$\begin{aligned} &\iint_D f(x, y)\,dA \\ &\quad= \iint_S f\big(x(u, v), y(u, v)\big)\,\Big|\frac{\partial(x, y)}{\partial(u, v)}\Big|\,du\,dv. \end{aligned}$$
:::

简而言之，$dA = \Big|\dfrac{\partial(x, y)}{\partial(u, v)}\Big|\,du\,dv$。雅可比行列式的绝对值是 $T$ 在各点附近放大或缩小微小面积的倍数。「深入一步」栏目说明理由，完整证明属于高等微积分。一元换元中，$g'(u)$ 的符号由积分限的次序处理。面积没有方向，所以这里取绝对值。

::: example 再看极坐标
求极坐标变换 $x = r\cos\theta$、$y = r\sin\theta$ 的雅可比行列式。

以 $r$ 和 $\theta$ 分别作为 $u$ 和 $v$ 的角色，

$$\begin{aligned} \frac{\partial(x, y)}{\partial(r, \theta)} &= \begin{vmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{vmatrix} \\ &= r\cos^2\theta + r\sin^2\theta = r. \end{aligned}$$

对于 $r \ge 0$，其绝对值为 $r$，因此 $dA = r\,dr\,d\theta$，如定理 19.4 所述。对于 $a > 0$，矩形 $0 \le r \le a$, $0 \le \theta \le 2\pi$ 被映射到半径为 $a$ 的圆盘上，除了边界外是一一对应的：整个边 $r = 0$ 映射到原点，此时雅可比行列式为 0，边 $\theta = 0$ 和 $\theta = 2\pi$ 映射到同一段。定理 19.9 允许这两种情况。

```check
Jp = Matrix([r*cos(theta), r*sin(theta)]).jacobian([r, theta]); same(Jp, Matrix([[cos(theta), -r*sin(theta)], [sin(theta), r*cos(theta)]]))
steps(Jp.det(), r*cos(theta)**2 + r*sin(theta)**2, r)
```
:::

::: example 椭圆
求区域 $E$ 在椭圆 $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$ 内的面积，其中 $a, b > 0$，以及积分 $\iint_E x^2\,dA$。

变换 $x = au$, $y = bv$ 将圆盘 $u^2 + v^2 \le 1$ 一一映射到 $E$，因为 $\tfrac{x^2}{a^2} + \tfrac{y^2}{b^2} = u^2 + v^2$。其雅可比行列式为

$$\frac{\partial(x, y)}{\partial(u, v)} = \begin{vmatrix} a & 0 \\ 0 & b \end{vmatrix} = ab.$$

因此，区域 $E$ 的面积为 $\iint ab\,du\,dv$ 在单位圆盘上的积分：即 $ab$ 乘以其面积 $\pi$，即 $\pi ab$。以相同的方式，在 $uv$ 平面上使用极坐标进行最后一步计算，

$$\begin{aligned} \iint_E x^2\,dA &= \iint_{u^2 + v^2 \le 1} a^2u^2\cdot ab\,du\,dv \\ &= a^3b\int_0^{2\pi}\int_0^1 r^2\cos^2\theta\,r\,dr\,d\theta \\ &= a^3b\cdot\frac14\cdot\pi = \frac{\pi a^3b}{4}, \end{aligned}$$

自从 $\int_0^{2\pi}\cos^2\theta\,d\theta = \pi$（写 $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$，模块 11）。对于密度为 $\rho$ 的均匀椭圆板，这给出了其关于 $y$ 轴的转动惯量 $I_y = \tfrac{\pi\rho a^3b}{4} = \tfrac14 Ma^2$，其中 $M = \rho\pi ab$ 是其质量。

```check
aE, bE, rE = symbols('a b rho', positive=True)
same((x**2/aE**2 + y**2/bE**2).subs({x: aE*u, y: bE*v}), u**2 + v**2)
same(Matrix([aE*u, bE*v]).jacobian([u, v]).det(), aE*bE)
same(integrate(aE*bE*r, (r, 0, 1), (theta, 0, 2*pi)), pi*aE*bE)
same(integrate(cos(theta)**2, (theta, 0, 2*pi)), pi); same(integrate(r**3, (r, 0, 1)), Rational(1, 4))
steps(aE**3*bE*Integral(r**2*cos(theta)**2*r, (r, 0, 1), (theta, 0, 2*pi)), aE**3*bE*Rational(1, 4)*pi, pi*aE**3*bE/4)
same(integrate(x**2, (y, -bE*sqrt(1 - x**2/aE**2), bE*sqrt(1 - x**2/aE**2)), (x, -aE, aE)), pi*aE**3*bE/4)
same(rE*pi*aE**3*bE/4, Rational(1, 4)*(rE*pi*aE*bE)*aE**2)
```
:::

::: example 平行四边形
计算 $\displaystyle\iint_D (2x - y)\,e^{2y - x}\,dA$，其中 $D$ 是顶点为 $(0, 0)$, $(2, 1)$, $(3, 3)$ 和 $(1, 2)$ 的平行四边形。

$D$ 的边位于直线 $2x - y = 0$（通过 $(0, 0)$ 和 $(1, 2)$）、 $2x - y = 3$（通过 $(2, 1)$ 和 $(3, 3)$）、 $2y - x = 0$（通过 $(0, 0)$ 和 $(2, 1)$）和 $2y - x = 3$（通过 $(1, 2)$ 和 $(3, 3)$）上。无论采用哪种笛卡尔顺序，使用每个边界上的一个线性公式，将 $D$ 分割为三个逐次积分。被积函数和边界提示新的变量

$$u = 2x - y, \qquad v = 2y - x,$$

在其中 $D$ 变为正方形 $S$： $0 \le u \le 3$, $0 \le v \le 3$。为了找到 $x$ 和 $y$，将第一个方程乘以 2 加到第二个方程 $2u + v = 3x$，并将第一个方程加到第二个方程乘以 2 $u + 2v = 3y$：

$$x = \frac{2u + v}{3}, \qquad y = \frac{u + 2v}{3}.$$

雅可比行列式是

$$\frac{\partial(x, y)}{\partial(u, v)} = \begin{vmatrix} 2/3 & 1/3 \\ 1/3 & 2/3 \end{vmatrix} = \frac49 - \frac19 = \frac13,$$

所以，根据第19.2节的乘积法则，

$$\begin{aligned} \iint_D (2x - y)\,e^{2y - x}\,dA &= \int_0^3\int_0^3 u\,e^v\,\frac13\,du\,dv \\ &= \frac13\cdot\frac92\cdot\big(e^3 - 1\big) \\ &= \frac32\big(e^3 - 1\big) \approx 28.63. \end{aligned}$$

检查：区域 $D$ 的面积是 $\iint_S \tfrac13\,du\,dv = \tfrac13 \cdot 9 = 3$，由 $\langle 2, 1\rangle$ 和 $\langle 1, 2\rangle$ 所张成的平行四边形的面积是 $\abs{2 \cdot 2 - 1 \cdot 1} = 3$。

```check
xT, yT = (2*u + v)/3, (u + 2*v)/3
same([(xT.subs({u: p, v: q}), yT.subs({u: p, v: q})) for p, q in ((0, 0), (3, 0), (3, 3), (0, 3))], [(0, 0), (2, 1), (3, 3), (1, 2)])
same((2*x - y).subs({x: xT, y: yT}), u); same((2*y - x).subs({x: xT, y: yT}), v)
same([2*p - q for p, q in ((0, 0), (1, 2))], [0, 0]); same([2*p - q for p, q in ((2, 1), (3, 3))], [3, 3])
same([2*q - p for p, q in ((0, 0), (2, 1))], [0, 0]); same([2*q - p for p, q in ((1, 2), (3, 3))], [3, 3])
JT = Matrix([xT, yT]).jacobian([u, v]).det(); steps(JT, Rational(4, 9) - Rational(1, 9), Rational(1, 3))
steps(Integral(u*exp(v)*Rational(1, 3), (u, 0, 3), (v, 0, 3)), Rational(1, 3)*Rational(9, 2)*(exp(3) - 1), Rational(3, 2)*(exp(3) - 1))
rounds(Rational(3, 2)*(exp(3) - 1), '28.63')
gD = (2*x - y)*exp(2*y - x)
direct = integrate(gD, (y, x/2, 2*x), (x, 0, 1)) + integrate(gD, (y, x/2, (x + 3)/2), (x, 1, 2)) + integrate(gD, (y, 2*x - 3, (x + 3)/2), (x, 2, 3))
same(direct, Rational(3, 2)*(exp(3) - 1))                          # in x and y, with D cut at x = 1 and x = 2
same(integrate(Rational(1, 3), (u, 0, 3), (v, 0, 3)), 3); same(abs(2*2 - 1*1), 3)
```
:::

::: figure id=fig-19-5
在图示的区域 $1 \le u \le 2$、$0 \le v \le 1$ 上，变换 $x = u^2 - v^2$、$y = 2uv$ 将方格的网格一一映射到右边的曲线网格上。以 $(u, v)$ 为一角、边为 $\Delta u$ 和 $\Delta v$（橙色）的小矩形，变为一个接近由向量 $\Delta u\,\vb{r}_u$ 和 $\Delta v\,\vb{r}_v$ 张成的平行四边形（虚线）的小曲边四边形。该平行四边形的面积是 $\abs{\partial(x, y)/\partial(u, v)}\,\Delta u\,\Delta v$。
:::

::: deeper 为什么雅可比行列式度量面积
取 $uv$ 平面上的一个小矩形，其一角在 $(u_0, v_0)$，边为 $\Delta u$ 和 $\Delta v$。根据模块17的线性近似，对于小的 $h$ 和 $k$，

$$\begin{aligned} x(u_0 + h, v_0 + k) &\approx x(u_0, v_0) + x_u h + x_v k, \\ y(u_0 + h, v_0 + k) &\approx y(u_0, v_0) + y_u h + y_v k, \end{aligned}$$

在 $(u_0, v_0)$ 处的偏导数。向量形式为 $T(u_0 + h, v_0 + k) \approx T(u_0, v_0) + h\,\vb{r}_u + k\,\vb{r}_v$，其中 $\vb{r}_u = \langle x_u, y_u\rangle$ 和 $\vb{r}_v = \langle x_v, y_v\rangle$。当 $h$ 从 0 到 $\Delta u$，且 $k$ 从 0 到 $\Delta v$ 时，右边填充了以 $T(u_0, v_0)$ 为顶点、由 $\Delta u\,\vb{r}_u$ 和 $\Delta v\,\vb{r}_v$ 张成的平行四边形。因此，小矩形的像几乎就是这个平行四边形（图 19.5），其面积为

$$\begin{aligned} &\big|(x_u\Delta u)(y_v\Delta v) - (x_v\Delta v)(y_u\Delta u)\big| \\ &\quad= \Big|\frac{\partial(x, y)}{\partial(u, v)}\Big|\,\Delta u\,\Delta v. \end{aligned}$$

在 $S$ 上使用细密的矩形网格。除了边界上的部分，每个单元都是矩形；它们的像将 $D$ 分成小块，面积约为 $\abs{J}\,\Delta u\,\Delta v$，其中 $J$ 是在某个角点的雅可比行列式，因此

$$\iint_D f\,dA \approx \sum f\big(T(u_i, v_j)\big)\,\abs{J(u_i, v_j)}\,\Delta u\,\Delta v,$$

右边是定理 19.9 右边的黎曼和。随着网格变细，近似值逐渐改善。将此转化为证明，意味着控制边界部分，并证明所有线性近似误差的总和趋于 0，这是高级微积分课程的内容。

对于线性变换 $x = au + bv$ 和 $y = cu + dv$，没有什么需要近似的： $T(u_0 + h, v_0 + k) = T(u_0, v_0) + h\langle a, c\rangle + k\langle b, d\rangle$ 精确地，因此每个矩形都被映射到一个面积恰好为 $\abs{ad - bc}$ 倍的平行四边形。这就是例 19.17 中发生的情况。

```check
x0_, y0_, xu_, xv_, yu_, yv_, du_, dv_ = symbols('x0 y0 x_u x_v y_u y_v Delta_u Delta_v')
same((xu_*du_)*(yv_*dv_) - (xv_*dv_)*(yu_*du_), (xu_*yv_ - xv_*yu_)*du_*dv_)
pa, pb, pc, pd = symbols('a b c d')
TL = Matrix([pa*u + pb*v, pc*u + pd*v])
same(TL.subs({u: u + h, v: v + k}) - TL, h*Matrix([pa, pc]) + k*Matrix([pb, pd])); same(TL.jacobian([u, v]).det(), pa*pd - pb*pc)
```
:::

在三维空间中，一个变换 $x = x(u, v, w)$、$y = y(u, v, w)$、$z = z(u, v, w)$ 的雅可比行列式为 $\partial(x, y, z)/\partial(u, v, w)$，即其九个一阶偏导数组成的 3 × 3 数组的行列式。对于连续被积函数在有界闭合立体区域上的变换变量规则成立：变换必须在其源区域的邻域内具有连续的一阶偏导数，将源区域映射到目标区域，并且在源区域内部是一一对应的，且雅可比行列式不为零。此时

$$dV = \Big|\frac{\partial(x, y, z)}{\partial(u, v, w)}\Big|\,du\,dv\,dw.$$

在所述的坐标范围内，绝对雅可比行列式为 $r$ 对于柱坐标，为 $\rho^2\sin\varphi$ 对于球坐标，如第 19.7 节的计算框所示：从图中找到的因子。

::: pitfall
两个涉及雅可比行列式的滑片。首先，使用其绝对值。变换 $x = v$，$y = u$，其交换坐标轴，其雅可比行列式为 $-1$，但它并不使面积为负。其次，使用 $x$ 和 $y$ 关于 $u$ 和 $v$ 的雅可比行列式：它将 $du\,dv$ 转换为 $dA$。在例 19.17 中，$u$ 和 $v$ 的公式立即给出

$$\frac{\partial(u, v)}{\partial(x, y)} = \begin{vmatrix} 2 & -1 \\ -1 & 2 \end{vmatrix} = 3,$$

所需因子的倒数，$\tfrac13$。（对于在匹配点处可微的反变换，根据链式法则，两个雅可比行列式互为非零倒数。）错误地使用 3 会导致结果大 9 倍。

```check
same(Matrix([v, u]).jacobian([u, v]).det(), -1)
same(Matrix([2*x - y, 2*y - x]).jacobian([x, y]).det(), 3); same(3*JT, 1)
same(3/Rational(1, 3), 9)
```
:::

## 你所学到的内容 {#summary}

- 一个 **双重积分** $\iint_R f\,dA$ 是双重黎曼和 $\sum_i\sum_j f(x_{ij}^*, y_{ij}^*)\,\Delta A$ 的极限：小矩形上的盒子。对于 $f \ge 0$，它是曲面下的体积；一般情况下是一个有符号的体积。在矩形上，连续函数是可积的，有界函数只要在闭区间上连续除有限多条连续曲线，也是可积的。
- **富比尼定理**：对于在矩形上连续的$f$，按由内而外的顺序计算$\iint_R f\,dA = \int_a^b\int_c^d f\,dy\,dx = \int_c^d\int_a^b f\,dx\,dy$。若缺乏适当的可积性假设，两种反常积分次序可能不一致。对于在其区间上连续的$g$和$h$，有$\iint_R g(x)h(y)\,dA = \int g\,dx\int h\,dy$。在正面积区域上，可积函数$f$的平均值为$\tfrac{1}{\text{area}}\iint f\,dA$。
- 对定义在**I 型**区域 $a \le x \le b$、$g_1(x) \le y \le g_2(x)$ 上的连续函数 $f$，若边界函数连续，则积分为 $\int_a^b\int_{g_1(x)}^{g_2(x)} f\,dy\,dx$。在**II 型**区域上，积分为 $\int_c^d\int_{h_1(y)}^{h_2(y)} f\,dx\,dy$。内层积分限由草图上的切片确定，外层积分限是常数。**变换积分次序**有时能简化计算，例如 $\int_0^1\int_x^1 e^{y^2}\,dy\,dx = \tfrac{e - 1}{2}$。
- 在**极坐标**下，使用$r \ge 0$并覆盖该区域一次（除边界外）：$dA = r\,dr\,d\theta$。将高斯积分平方，将正方形上的积分夹在两个圆盘之间并令其尺寸增大，可证明$\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$，且对于$c > 0$，有$\int_{-\infty}^{\infty} e^{-ct^2}\,dt = \sqrt{\pi/c}$。
- 若一块有界薄板的密度 $\rho \ge 0$ 可积、质量 $m = \iint_D \rho\,dA$ 为正，则其质心为 $\big(\tfrac{M_y}{m}, \tfrac{M_x}{m}\big)$，其中 $M_y = \iint x\rho\,dA$、$M_x = \iint y\rho\,dA$，转动惯量为 $I_x = \iint y^2\rho\,dA$、$I_y = \iint x^2\rho\,dA$、$I_0 = I_x + I_y$。均匀圆盘的半径为 $a > 0$ 时，有 $I_0 = \tfrac12 Ma^2$。**联合密度**非负，总积分为 1，并给出 $P\big((X, Y) \in D\big) = \iint_D f\,dA$。密度分别为 $f_1$ 和 $f_2$ 的独立随机变量具有联合密度 $f_1(x)f_2(y)$。
- 长方体上的连续函数 $f$ 按任意一种积分次序都得到同一个**三重积分**$\iiint_E f\,dV$，共六种次序。对于其他立体，选择适当的积分限，必要时拆成几部分。若连续函数 $f$ 定义在 I 型或 II 型区域上方的两张连续曲面之间，则先对 $z$ 积分。若径向坐标非负，且积分限除边界重合外恰好覆盖立体一次，使用**柱坐标**得到 $dV = r\,dz\,dr\,d\theta$。使用**球坐标**得到 $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$，其中 $\varphi$ 从 $z$ 轴正向量起，且 $0 \le \varphi \le \pi$。半径为 $a > 0$ 的球的体积为 $\tfrac43\pi a^3$。
- **变量替换**：对于一个连续可微、单射的坐标映射，其内部雅可比行列式不为零，在边界上的例外情况如第19.8节所述， $dA = \abs{\partial(x, y)/\partial(u, v)}\,du\,dv$。雅可比行列式为 $x_uy_v - x_vy_u$，其绝对值是局部面积比例因子。极坐标下的雅可比行列式为 $r$；对于 $a, b > 0$， $x = au$， $y = bv$ 映射单位圆盘到一个面积为 $\pi ab$ 的椭圆。合适的线性替换可将平行四边形转化为矩形。

## 练习 {#exercises}

:::: exercise 一个正方形上的二重积分 {#ex-19-1} ★
设 $f(x, y) = xy^2 + 1$ 和 $R = [0, 2] \times [0, 2]$。

- (a) 用边长为1的四个正方形的中点求和法估计 $\iint_R f\,dA$。
- (b) 以迭代积分的形式求出精确值，两种顺序均可。
- (c) 中点求和的结果是偏大还是偏小？从 $f$ 的形状解释原因。

::: solution
**(a)** 中心分别为 $\big(\tfrac12, \tfrac12\big)$, $\big(\tfrac32, \tfrac12\big)$, $\big(\tfrac12, \tfrac32\big)$ 和 $\big(\tfrac32, \tfrac32\big)$，其中 $f$ 取值为 $\tfrac98$, $\tfrac{11}{8}$, $\tfrac{17}{8}$ 和 $\tfrac{35}{8}$。每个正方形的面积为 $\Delta A = 1$，因此中点求和为

$$\frac{9 + 11 + 17 + 35}{8} = \frac{72}{8} = 9.$$

**(b)** 在顺序 $dy\,dx$ 中，内层积分保持 $x$ 不变：

$$\begin{aligned} \int_0^2 \big(xy^2 + 1\big)\,dy &= \Big[\frac{xy^3}{3} + y\Big]_{y=0}^{y=2} \\ &= \frac{8x}{3} + 2, \\ \int_0^2\Big(\frac{8x}{3} + 2\Big)\,dx &= \frac{16}{3} + 4 = \frac{28}{3} \approx 9.333. \end{aligned}$$

在顺序 $dx\,dy$ 中：

$$\begin{aligned} \int_0^2 \big(xy^2 + 1\big)\,dx &= \Big[\frac{x^2y^2}{2} + x\Big]_{x=0}^{x=2} \\ &= 2y^2 + 2, \\ \int_0^2 \big(2y^2 + 2\big)\,dy &= \frac{16}{3} + 4 = \frac{28}{3}. \end{aligned}$$

两种顺序一致，正如 Fubini 定理所说。

**(c)** 中点和为 9，太小，误差为 $\tfrac13$。在 $x$ 中函数是线性的，线性函数在区间上的平均值等于其中点处的值，因此 $x$ 方向不产生误差。在 $y$ 中，函数 $f$ 增长类似于 $y^2$，其曲线向上弯曲：例如在 $[0, 1]$ 上，函数 $y^2$ 的平均值为 $\tfrac13$，但在中点处的值仅为 $\tfrac14$。因此每个中心点的值都小于其平方区域上的平均值。

```check
fE1 = x*y**2 + 1
cE1 = [fE1.subs({x: p, y: q}) for p, q in ((half, half), (3*half, half), (half, 3*half), (3*half, 3*half))]
same(cE1, [Rational(9, 8), Rational(11, 8), Rational(17, 8), Rational(35, 8)]); same(sum(cE1), 9); same(Rational(72, 8), 9)
antideriv(x*y**3/3 + y, fE1, y); antideriv(x**2*y**2/2 + x, fE1, x)
same(integrate(fE1, (y, 0, 2)), 8*x/3 + 2); same(integrate(8*x/3 + 2, (x, 0, 2)), Rational(28, 3)); rounds(Rational(28, 3), '9.333')
same(integrate(fE1, (x, 0, 2)), 2*y**2 + 2); same(integrate(2*y**2 + 2, (y, 0, 2)), Rational(28, 3))
same(Rational(28, 3) - 9, Rational(1, 3)); same(integrate(y**2, (y, 0, 1)), Rational(1, 3)); same(half**2, Rational(1, 4))
```
:::
::::

:::: exercise 从草图中取极限 {#ex-19-2} ★
设 $D$ 为曲线 $y = \sqrt x$ 和 $y = x/2$ 之间的区域，且 $f$ 在 $D$ 上连续。

- (a) 画出 $D$ 并找出曲线的交点。
- (b) 将 $\iint_D f\,dA$ 表示为两种顺序的累次积分。
- (c) 用两种方法求 $D$ 的面积。
- (d) 求 $\iint_D y\,dA$，以及 $D$ 的形心高度 $\bar y$。

用第 19.3 节的交互演示检验 (b) 和 (c) 的结果。

::: solution
**(a)** 两曲线在满足 $\sqrt x = x/2$ 的点相交。两边平方得到 $x = x^2/4$，故 $x(x - 4) = 0$，即 $x = 0$ 和 $x = 4$，对应点 $(0, 0)$ 和 $(4, 2)$。因 $\sqrt4 = 2 = 4/2$，两点都是交点。在 $x = 1$ 处，两曲线的高度分别为 1 和 $\tfrac12$，所以上方曲线为 $y = \sqrt x$。

**(b)** 垂直切片：对于 $0 \le x \le 4$，$y$ 从 $x/2$ 到 $\sqrt x$ 变化，因此 $\iint_D f\,dA = \int_0^4\int_{x/2}^{\sqrt x} f\,dy\,dx$。水平切片：表示为 $y$ 的函数，曲线为 $x = y^2$（从 $y = \sqrt x$ 开始，带有 $y \ge 0$）和 $x = 2y$。在 $y = 1$ 处，它们分别位于 $x = 1$ 和 $x = 2$，因此 $x = y^2$ 是左侧曲线，且 $y$ 从 0 到 2 变化：

$$\iint_D f\,dA = \int_0^2\int_{y^2}^{2y} f\,dx\,dy.$$

**(c)** 代入 $f = 1$ 得：

$$\begin{aligned} \int_0^4\Big(\sqrt x - \frac x2\Big)\,dx &= \Big[\frac23x^{3/2} - \frac{x^2}{4}\Big]_0^4 \\ &= \frac{16}{3} - 4 = \frac43, \\ \int_0^2 \big(2y - y^2\big)\,dy &= \Big[y^2 - \frac{y^3}{3}\Big]_0^2 \\ &= 4 - \frac83 = \frac43. \end{aligned}$$

**(d)** 水平切片在这里更方便：

$$\begin{aligned} \iint_D y\,dA &= \int_0^2 y\big(2y - y^2\big)\,dy \\ &= \Big[\frac{2y^3}{3} - \frac{y^4}{4}\Big]_0^2 = \frac{16}{3} - 4 = \frac43. \end{aligned}$$

所以 $\bar y = \dfrac{4/3}{4/3} = 1$。 （用竖直切片，$\int_0^4\big[\tfrac{y^2}{2}\big]_{x/2}^{\sqrt x}\,dx = \int_0^4\big(\tfrac x2 - \tfrac{x^2}{8}\big)\,dx = 4 - \tfrac83 = \tfrac43$，也是同样的。）

```check
same_set(solve(Eq(x, x**2/4), x), [0, 4]); same(sqrt(4), Rational(4, 2)); holds(sqrt(1) > Rational(1, 2))
xn = symbols('x', nonnegative=True); same(sqrt(xn)**2, xn); holds(1**2 < 2*1)
antideriv(Rational(2, 3)*xn**Rational(3, 2) - xn**2/4, sqrt(xn) - xn/2, xn)
antideriv(y**2 - y**3/3, 2*y - y**2, y); antideriv(2*y**3/3 - y**4/4, y*(2*y - y**2), y)
same(integrate(sqrt(x) - x/2, (x, 0, 4)), Rational(4, 3)); same(integrate(2*y - y**2, (y, 0, 2)), Rational(4, 3))
same(integrate(1, (y, x/2, sqrt(x)), (x, 0, 4)), Rational(4, 3)); same(integrate(1, (x, y**2, 2*y), (y, 0, 2)), Rational(4, 3))
same(integrate(y*(2*y - y**2), (y, 0, 2)), Rational(4, 3)); same(integrate(y, (y, x/2, sqrt(x)), (x, 0, 4)), Rational(4, 3))
same(integrate(x/2 - x**2/8, (x, 0, 4)), Rational(4, 3))
same(Rational(4, 3)/Rational(4, 3), 1)
```
:::
::::

:::: exercise 一阶还是两阶？ {#ex-19-3} ★
设 $D$ 为顶点为 $(0, 0)$、$(2, 0)$ 和 $(1, 1)$ 的三角形。

- (a) 使用三角形的一条直线边作为每个内边界，解释为何顺序 $dy\,dx$ 需要分成两部分，而顺序 $dx\,dy$ 只需一部分。
- (b) 用两种顺序计算 $\iint_D y\,dA$，并求出 $D$ 的质心高度 $\bar y$。

::: solution
**(a)** 的边位于直线 $D$ 上，分别为 $y = 0$、$y = x$（从 $(0, 0)$ 到 $(1, 1)$）和 $y = 2 - x$（从 $(1, 1)$ 到 $(2, 0)$）。在 $x$ 处作一条垂直线，进入 $D$ 于 $y = 0$，但当 $0 \le x \le 1$ 时离开于 $y = x$，当 $1 \le x \le 2$ 时离开于 $y = 2 - x$：上边界在 $x = 1$ 处改变公式，因此在 $[0, 2]$ 处分割，以便在每一部分使用一侧。使用上界 $\min(x, 2 - x)$ 的单重积分也是可能的，但计算时仍需用到两个公式。在 $y$、$0 \le y \le 1$ 处作一条水平线，始终在直线 $x = y$ 上进入，并在直线 $x = 2 - y$ 上离开：各用一个公式。

**(b)** 按顺序 $dy\,dx$，在 $x = 1$ 处分割：

$$\begin{aligned} &\int_0^1\int_0^x y\,dy\,dx + \int_1^2\int_0^{2-x} y\,dy\,dx \\ &\quad= \int_0^1\frac{x^2}{2}\,dx + \int_1^2\frac{(2 - x)^2}{2}\,dx \\ &\quad= \frac16 + \frac16 = \frac13. \end{aligned}$$

按顺序 $dx\,dy$，高度为 $y$ 的切片长度为 $(2 - y) - y = 2 - 2y$：

$$\begin{aligned} \int_0^1\int_y^{2-y} y\,dx\,dy &= \int_0^1 \big(2y - 2y^2\big)\,dy \\ &= 1 - \frac23 = \frac13. \end{aligned}$$

该三角形的底边为 2，高为 1，因此其面积为 1，且 $\bar y = \tfrac13$：三角形的质心位于其底边上方三分之一处。

```check
same(integrate(y, (y, 0, x)), x**2/2); same(integrate(x**2/2, (x, 0, 1)), Rational(1, 6)); same(integrate((2 - x)**2/2, (x, 1, 2)), Rational(1, 6))
same(integrate(y, (y, 0, x), (x, 0, 1)) + integrate(y, (y, 0, 2 - x), (x, 1, 2)), Rational(1, 3))
same(integrate(y, (x, y, 2 - y)), 2*y - 2*y**2); same(integrate(2*y - 2*y**2, (y, 0, 1)), Rational(1, 3))
same(integrate(1, (x, y, 2 - y), (y, 0, 1)), 1); same(Rational(1, 2)*2*1, 1)
same(integrate(Min(x, 2 - x)**2/2, (x, 0, 2)), Rational(1, 3))
```
:::
::::

:::: exercise 极坐标或直角坐标 {#ex-19-4} ★
设 $D$ 为四分之一圆盘 $x^2 + y^2 \le 1$, $x \ge 0$, $y \ge 0$。计算 $\iint_D xy\,dA$ (a) 在极坐标下，并 (b) 作为 $x$ 和 $y$ 的迭代积分。

::: solution
**(a)** 在极坐标 $xy = r^2\cos\theta\sin\theta$ 和 $dA = r\,dr\,d\theta$ 下，且 $D$ 是 $0 \le r \le 1$， $0 \le \theta \le \pi/2$。被积函数是乘积，因此积分可拆分为：

$$\begin{aligned} \iint_D xy\,dA &= \int_0^{\pi/2}\int_0^1 r^2\cos\theta\sin\theta\,r\,dr\,d\theta \\ &= \int_0^1 r^3\,dr\int_0^{\pi/2}\sin\theta\cos\theta\,d\theta \\ &= \frac14\cdot\frac12 = \frac18, \end{aligned}$$

因为 $\int_0^{\pi/2}\sin\theta\cos\theta\,d\theta = \big[\tfrac12\sin^2\theta\big]_0^{\pi/2} = \tfrac12$（代入 $u = \sin\theta$）。

**(b)** 在 $x$ 处取一个垂直切片，从 $y = 0$ 上升到圆 $y = \sqrt{1 - x^2}$：

$$\begin{aligned} \int_0^1\int_0^{\sqrt{1 - x^2}} xy\,dy\,dx &= \int_0^1 \frac{x\big(1 - x^2\big)}{2}\,dx \\ &= \frac12\Big(\frac12 - \frac14\Big) = \frac18. \end{aligned}$$

(a) 中的常见错误是忘记乘上 $r$ 的因子 $dA$，从而得到 $\int_0^1 r^2\,dr \cdot \tfrac12 = \tfrac16$。

```check
same(expand((r*cos(theta))*(r*sin(theta))), r**2*cos(theta)*sin(theta))
same(integrate(r**3, (r, 0, 1)), Rational(1, 4)); same(integrate(sin(theta)*cos(theta), (theta, 0, pi/2)), Rational(1, 2))
antideriv(sin(theta)**2/2, sin(theta)*cos(theta), theta)
same(integrate(r**2*cos(theta)*sin(theta)*r, (r, 0, 1), (theta, 0, pi/2)), Rational(1, 8))
same(integrate(x*y, (y, 0, sqrt(1 - x**2))), x*(1 - x**2)/2); same(integrate(x*(1 - x**2)/2, (x, 0, 1)), Rational(1, 8))
same(integrate(r**2, (r, 0, 1))*Rational(1, 2), Rational(1, 6))
```
:::
::::

:::: exercise 反转积分顺序 {#ex-19-5} ★★
计算 $\displaystyle\int_0^1\int_{\sqrt x}^{1} \sqrt{1 + y^3}\,dy\,dx$。

::: solution
$\sqrt{1 + y^3}$ 的原函数不是我们标准形式之一，因此尝试调换积分顺序。积分限为 $0 \le x \le 1$ 和 $\sqrt x \le y \le 1$。对于 $x \ge 0$ 和 $y \ge 0$， $y \ge \sqrt x$ 与 $x \le y^2$ 相同，因此区域由 $y$ 轴、抛物线 $x = y^2$ 和直线 $y = 1$ 围成：一条水平线在高度 $y$、 $0 \le y \le 1$ 处进入该区域，在 $y$ 轴上进入，在抛物线 $x = y^2$ 上离开。因此

$$\begin{aligned} &\int_0^1\int_{\sqrt x}^{1} \sqrt{1 + y^3}\,dy\,dx \\ &\quad= \int_0^1\int_0^{y^2}\sqrt{1 + y^3}\,dx\,dy \\ &\quad= \int_0^1 y^2\sqrt{1 + y^3}\,dy. \end{aligned}$$

代入 $u = 1 + y^3$， $du = 3y^2\,dy$；积分限变为 $u = 1$ 和 $u = 2$：

$$\begin{aligned} \frac13\int_1^2 u^{1/2}\,du &= \frac13\cdot\frac23\Big[u^{3/2}\Big]_1^2 \\ &= \frac29\big(2\sqrt2 - 1\big) \approx 0.4063. \end{aligned}$$

```check
xn2, yn2 = symbols('x y', nonnegative=True)
holds(all((sqrt(Rational(p_, 10)) <= Rational(q_, 10)) == (Rational(p_, 10) <= Rational(q_, 10)**2) for p_ in range(11) for q_ in range(11)))   # y >= sqrt(x) exactly when x <= y^2
same(integrate(sqrt(1 + y**3), (x, 0, y**2)), y**2*sqrt(1 + y**3))
same(diff(1 + y**3, y), 3*y**2); same((1 + y**3).subs(y, 0), 1); same((1 + y**3).subs(y, 1), 2)
antideriv(Rational(2, 3)*u**Rational(3, 2), sqrt(u), u)
steps(Integral(y**2*sqrt(1 + y**3), (y, 0, 1)), Rational(1, 3)*Integral(sqrt(u), (u, 1, 2)), Rational(2, 9)*(2*sqrt(2) - 1))
rounds(Rational(2, 9)*(2*sqrt(2) - 1), '0.4063')
import mpmath
mpmath.mp.dps = 30
near(mpmath.quad(lambda X: mpmath.quad(lambda Y: mpmath.sqrt(1 + Y**3), [mpmath.sqrt(X), 1]), [0, 1]), Rational(2, 9)*(2*sqrt(2) - 1), 1e-20)   # the original order, numerically
```
:::
::::

:::: exercise 两个随机数 {#ex-19-6} ★★
设 $X$ 和 $Y$ 为独立的随机数，均在 $[0, 1]$ 上均匀分布：它们的联合密度在正方形 $[0, 1] \times [0, 1]$ 上为 1，其他地方为 0。求

- (a) $P(X + Y \le 1)$,
- (b) $P\big(Y \le X^2\big)$,
- (c) $P\big(XY \le \tfrac12\big)$.

::: solution
每个概率是事件发生区域上积分 1 的结果，即该区域的面积。

**(a)** $x + y \le 1$ 是三角形 $0 \le x \le 1$， $0 \le y \le 1 - x$，其面积为 $\int_0^1 (1 - x)\,dx = \tfrac12$。

**(b)** $y \le x^2$ 是抛物线下的区域： $P = \int_0^1\int_0^{x^2} dy\,dx = \int_0^1 x^2\,dx = \tfrac13$。

**(c)** 用补集 $xy > \tfrac12$，这是一个区域： $y > \dfrac{1}{2x}$，由于 $y \le 1$，这需要 $\dfrac{1}{2x} < 1$，即 $x > \tfrac12$。所以

$$\begin{aligned} P\Big(XY > \frac12\Big) &= \int_{1/2}^{1}\Big(1 - \frac{1}{2x}\Big)\,dx \\ &= \frac12 - \frac12\Big(\ln 1 - \ln\frac12\Big) \\ &= \frac12 - \frac{\ln 2}{2}, \end{aligned}$$

和

$$\begin{aligned} P\Big(XY \le \frac12\Big) &= 1 - \Big(\frac12 - \frac{\ln 2}{2}\Big) \\ &= \frac{1 + \ln 2}{2} \approx 0.847. \end{aligned}$$

（直接地，事件 $xy \le \tfrac12$ 可以分成两部分：整个条带 $0 \le x \le \tfrac12$，和 $0 \le y \le \tfrac{1}{2x}$ 对于 $\tfrac12 \le x \le 1$。）

```check
same(integrate(1 - x, (x, 0, 1)), Rational(1, 2)); same(integrate(1, (y, 0, x**2), (x, 0, 1)), Rational(1, 3))
same(solve(Eq(1/(2*x), 1), x), [Rational(1, 2)])
steps(Integral(1 - 1/(2*x), (x, Rational(1, 2), 1)), Rational(1, 2) - Rational(1, 2)*(log(1) - log(Rational(1, 2))), Rational(1, 2) - log(2)/2)
same(1 - (Rational(1, 2) - log(2)/2), (1 + log(2))/2); rounds((1 + log(2))/2, '0.847')
same(Rational(1, 2) + integrate(1/(2*x), (x, Rational(1, 2), 1)), (1 + log(2))/2)
```
:::
::::

:::: exercise 一个顶部密度更大的板 {#ex-19-7} ★★
一个薄板占据半圆 $x^2 + y^2 \le a^2$， $y \ge 0$，其中 $a > 0$，其密度与到 $x$ 轴的距离成正比： $\rho = ky$，比例常数为 $k > 0$。求其质量及其质心，与均匀半圆（[例 12.15](module_12_ZH.html#centre-of-mass)）的形心 $\big(0, \tfrac{4a}{3\pi}\big)$ 进行比较。

::: solution
在极坐标中，半圆为 $0 \le r \le a$， $0 \le \theta \le \pi$，和 $\rho = kr\sin\theta$。质量为

$$\begin{aligned} m &= \int_0^\pi\int_0^a kr\sin\theta\cdot r\,dr\,d\theta \\ &= k\int_0^\pi\sin\theta\,d\theta\int_0^a r^2\,dr \\ &= k\cdot 2\cdot\frac{a^3}{3} = \frac{2ka^3}{3}. \end{aligned}$$

板和其密度在将 $x$ 替换为 $-x$ 时保持不变，因此镜像部分关于 $y$ 轴的力矩相互抵消： $M_y = 0$ 和 $\bar x = 0$。（在积分中， $\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$。）对于 $\bar y$，带 $\int_0^\pi \sin^2\theta\,d\theta = \tfrac{\pi}{2}$（写为 $\sin^2\theta = \tfrac12(1 - \cos 2\theta)$），

$$\begin{aligned} M_x &= \iint_D y\cdot ky\,dA \\ &= k\int_0^\pi\int_0^a r^2\sin^2\theta\cdot r\,dr\,d\theta \\ &= k\cdot\frac{\pi}{2}\cdot\frac{a^4}{4} = \frac{k\pi a^4}{8}, \end{aligned}$$

因此

$$\bar y = \frac{k\pi a^4/8}{2ka^3/3} = \frac{3\pi a}{16} \approx 0.589a.$$

质心是 $\big(0, \tfrac{3\pi a}{16}\big)$，比均匀半圆盘的质心 $\tfrac{4a}{3\pi} \approx 0.424a$ 更高，因为板的密度向顶部增加。

```check
aP = symbols('a', positive=True)
mP = integrate(kp*r*sin(theta)*r, (r, 0, aP), (theta, 0, pi)); same(mP, 2*kp*aP**3/3)
same(integrate(sin(theta), (theta, 0, pi)), 2); same(integrate(cos(theta)*sin(theta), (theta, 0, pi)), 0)
same(integrate(sin(theta)**2, (theta, 0, pi)), pi/2); same(sin(theta)**2, (1 - cos(2*theta))/2)
MxP = integrate(kp*(r*sin(theta))**2*r, (r, 0, aP), (theta, 0, pi)); same(MxP, kp*pi*aP**4/8)
same(MxP/mP, 3*pi*aP/16); rounds(3*pi/16, '0.589'); rounds(4/(3*pi), '0.424'); holds(3*pi/16 > 4/(3*pi))
same(integrate(r*cos(theta)*kp*r*sin(theta)*r, (r, 0, aP), (theta, 0, pi)), 0)
```
:::
::::

:::: exercise 一个立方体的六分之一 {#ex-19-8} ★★
- (a) 评估 $V = \displaystyle\int_0^1\int_0^x\int_0^y dz\,dy\,dx$。
- (b) 描述积分区域 $E$，并以顺序 $dx\,dy\,dz$ 写出 $V$ 的累次积分形式。
- (c) 无需积分解释为何 $V = \tfrac16$。
- (d) 找出 $E$ 的质心坐标 $\bar x$。

::: solution
**(a)** 从内到外： $\int_0^y dz = y$，然后 $\int_0^x y\,dy = \tfrac{x^2}{2}$，然后 $\int_0^1 \tfrac{x^2}{2}\,dx = \tfrac16$。

**(b)** 极限表示 $0 \le x \le 1$, $0 \le y \le x$ 和 $0 \le z \le y$: $E$ 是单位立方体中满足 $0 \le z \le y \le x \le 1$ 的点的集合。对于顺序 $dx\,dy\,dz$，最外层变量 $z$ 在 $E$ 中取所有值，从 0 到 1。对于固定的 $z$， $y$ 从 $z$ 到 1，对于固定的 $y$ 和 $z$， $x$ 从 $y$ 到 1：

$$V = \int_0^1\int_z^1\int_y^1 dx\,dy\,dz.$$

**(c)** 立方体 $[0, 1]^3$ 中的每个点的三个坐标按某种顺序排列： $x \ge y \ge z$，如 $E$ 所示，或 $x \ge z \ge y$，或其余四种顺序之一。因此，由六个顺序定义的六个立体填满立方体，并且它们仅在如 $x = y$ 这样的平面上重叠，而这些平面没有体积。交换两个坐标，即在如 $x = y$ 这样的平面上进行反射，会将其中一个立体转换为另一个，而不改变体积，因此所有六个立体的体积相同，等于立方体的体积 $\tfrac16$。

**(d)** $\iiint_E x\,dV = \int_0^1 x\cdot\frac{x^2}{2}\,dx = \frac18$。内侧两个积分与 (a) 相同，将因子 $x$ 提到这两重积分之外，故 $\bar x = \dfrac{1/8}{1/6} = \dfrac34$。

```check
same(integrate(1, (z, 0, y)), y); same(integrate(y, (y, 0, x)), x**2/2); same(integrate(x**2/2, (x, 0, 1)), Rational(1, 6))
same(integrate(1, (x, y, 1), (y, z, 1), (z, 0, 1)), Rational(1, 6))
same(integrate(x, (z, 0, y), (y, 0, x), (x, 0, 1)), Rational(1, 8)); same(Rational(1, 8)/Rational(1, 6), Rational(3, 4))
same(6*integrate(1, (z, 0, y), (y, 0, x), (x, 0, 1)), 1)
```
:::
::::

:::: exercise 在一个球体内 {#ex-19-9} ★★
取一个以原点为中心、半径为 $a > 0$ 的球体，密度为常数 $k > 0$，因此其质量为 $M = \tfrac43\pi a^3k$。

- (a) 求球体内各点到球心的平均距离。
- (b) 用 $M$ 和 $a$ 表示它关于 $z$ 轴的转动惯量 $I_z = \iiint \big(x^2 + y^2\big)k\,dV$，并与例 19.10 的均匀圆盘比较。

::: solution
**(a)** 距离 $\rho$ 在球内的平均值等于其积分除以体积 $\tfrac43\pi a^3$。代入 $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$ 后，$\rho$ 的积分可分解为三个一重积分的乘积：

$$\begin{aligned} \iiint \rho\,dV &= \int_0^\pi\int_0^{2\pi}\int_0^a \rho^3\sin\varphi\,d\rho\,d\theta\,d\varphi \\ &= \frac{a^4}{4}\cdot 2\pi\cdot 2 = \pi a^4, \end{aligned}$$

因此平均距离为 $\dfrac{\pi a^4}{\tfrac43\pi a^3} = \dfrac{3a}{4}$。球体的大部分体积集中在表面附近。

**(b)** 球坐标中有 $x^2 + y^2 = r^2 = \rho^2\sin^2\varphi$，再乘上 $dV$ 中的因子 $\rho^2\sin\varphi$，便得到被积函数 $k\rho^4\sin^3\varphi$：

$$\begin{aligned} I_z &= k\int_0^\pi\int_0^{2\pi}\int_0^a \rho^4\sin^3\varphi\,d\rho\,d\theta\,d\varphi \\ &= k\cdot\frac{a^5}{5}\cdot 2\pi\int_0^\pi\sin^3\varphi\,d\varphi. \end{aligned}$$

对于最后一个积分，写 $\sin^3\varphi = \big(1 - \cos^2\varphi\big)\sin\varphi$ 并代入 $u = \cos\varphi$: $\int_0^\pi \sin^3\varphi\,d\varphi = \int_{-1}^{1}\big(1 - u^2\big)\,du = \tfrac43$。因此

$$I_z = \frac{8\pi ka^5}{15} = \frac25\cdot\frac43\pi a^3k\cdot a^2 = \frac25 Ma^2.$$

质量和半径相同的均匀圆盘具有 $I_0 = \tfrac12 Ma^2$，比 $\tfrac25 Ma^2$ 更大：在球体中，许多质量集中在轴线附近，上下中心处。

```check
aK = symbols('a', positive=True)
Ir = integrate(rh*rh**2*sin(ph), (rh, 0, aK), (theta, 0, 2*pi), (ph, 0, pi)); same(Ir, pi*aK**4)
same(Ir/(Rational(4, 3)*pi*aK**3), 3*aK/4)
same((rh*sin(ph)*cos(theta))**2 + (rh*sin(ph)*sin(theta))**2, rh**2*sin(ph)**2)
same(integrate(sin(ph)**3, (ph, 0, pi)), Rational(4, 3)); same(integrate(1 - u**2, (u, -1, 1)), Rational(4, 3)); same((1 - cos(ph)**2)*sin(ph), sin(ph)**3)
same(rh**2*sin(ph)**2*rh**2*sin(ph), rh**4*sin(ph)**3); same(rh*rh**2*sin(ph), rh**3*sin(ph))
Iz = integrate(kp*rh**4*sin(ph)**3, (rh, 0, aK), (theta, 0, 2*pi), (ph, 0, pi)); same(Iz, 8*pi*kp*aK**5/15); same(Iz, kp*aK**5/5*2*pi*Rational(4, 3))
same(Iz, Rational(2, 5)*(Rational(4, 3)*pi*aK**3*kp)*aK**2); holds(Rational(1, 2) > Rational(2, 5))
```
:::
::::

:::: exercise 介于两条双曲线之间 {#ex-19-10} ★★★
设 $D$ 为第一象限内由双曲线 $xy = 1$ 和 $xy = 4$ 以及直线 $y = x$ 和 $y = 4x$ 所围成的区域。

- (a) 证明新的变量 $u = xy$ 和 $v = y/x$ 描述 $D$ 作为正方形 $1 \le u \le 4$, $1 \le v \le 4$，并且 $x = \sqrt{u/v}$ 和 $y = \sqrt{uv}$。
- (b) 求雅可比行列式 $\dfrac{\partial(x, y)}{\partial(u, v)}$，并用 $\dfrac{\partial(u, v)}{\partial(x, y)}$ 进行验证。
- (c) 求 $D$ 的面积。

::: solution
**(a)** 在第一象限 $x > 0$ 和 $y > 0$，因此 $u = xy > 0$ 和 $v = y/x > 0$。双曲线是 $u = 1$ 和 $u = 4$，直线是 $v = 1$ 和 $v = 4$； $D$ 位于这两对之间，因此由 $1 \le u \le 4$、 $1 \le v \le 4$ 描述。反之 $uv = y^2$ 和 $u/v = x^2$，取正根为 $y = \sqrt{uv}$ 和 $x = \sqrt{u/v}$。因此正方形中的每个点都恰好对应 $D$ 中的一个点。

**(b)** 与 $x = u^{1/2}v^{-1/2}$ 和 $y = u^{1/2}v^{1/2}$，

$$\begin{aligned} x_u &= \frac{1}{2\sqrt{uv}}, & x_v &= -\frac{\sqrt u}{2v^{3/2}}, \\ y_u &= \frac{\sqrt v}{2\sqrt u}, & y_v &= \frac{\sqrt u}{2\sqrt v}, \end{aligned}$$

因此

$$\begin{aligned} \frac{\partial(x, y)}{\partial(u, v)} &= x_uy_v - x_vy_u \\ &= \frac{1}{4v} + \frac{1}{4v} = \frac{1}{2v}. \end{aligned}$$

检查：从 $u = xy$ 和 $v = y/x$，

$$\begin{aligned} \frac{\partial(u, v)}{\partial(x, y)} &= \begin{vmatrix} y & x \\ -y/x^2 & 1/x \end{vmatrix} \\ &= \frac yx + \frac yx = \frac{2y}{x} = 2v, \end{aligned}$$

$\tfrac{1}{2v}$ 的倒数，正如第 19.8 节指出的那样必须如此。

**(c)**雅可比行列式为正，因此

$$\begin{aligned} A(D) &= \int_1^4\int_1^4\frac{1}{2v}\,du\,dv \\ &= 3\cdot\frac12\ln 4 = 3\ln 2 \approx 2.079. \end{aligned}$$

在 $x$ 和 $y$ 中，面积取两个积分，以角 $x = 1$ 为分界点： $\int_{1/2}^{1}\big(4x - \tfrac1x\big)\,dx + \int_1^2\big(\tfrac4x - x\big)\,dx$，这也给出 $3\ln 2$。

```check
up, vp = symbols('u v', positive=True)
xH, yH = sqrt(up/vp), sqrt(up*vp)
same(xH*yH, up); same(yH/xH, vp)
same(diff(xH, up), 1/(2*sqrt(up*vp))); same(diff(xH, vp), -sqrt(up)/(2*vp**Rational(3, 2))); same(diff(yH, up), sqrt(vp)/(2*sqrt(up))); same(diff(yH, vp), sqrt(up)/(2*sqrt(vp)))
JH = Matrix([xH, yH]).jacobian([up, vp]).det(); steps(JH, 1/(4*vp) + 1/(4*vp), 1/(2*vp))
xp_, yp_ = symbols('x y', positive=True)
JI = Matrix([xp_*yp_, yp_/xp_]).jacobian([xp_, yp_]).det(); same(JI, 2*yp_/xp_); same(JI.subs({xp_: xH, yp_: yH})*JH, 1)
steps(Integral(1/(2*vp), (up, 1, 4), (vp, 1, 4)), 3*Rational(1, 2)*log(4), 3*log(2)); rounds(3*log(2), '2.079')
same(integrate(4*x - 1/x, (x, Rational(1, 2), 1)) + integrate(4/x - x, (x, 1, 2)), 3*log(2))
```
:::
::::

:::: exercise 一个餐巾环 {#ex-19-11} ★★★
一个半径为 $b > 0$ 的圆柱形孔被钻穿一个半径为 $a > b$ 的球体的中心，沿一条直径贯穿，留下一个环。

- (a) 使用柱坐标系来求这个环的体积。
- (b) 证明其体积等于 $\dfrac{\pi h^3}{6}$，其中 $h = 2\sqrt{a^2 - b^2}$ 是环的高度。因此，体积仅取决于高度。
- (c) 用 $a = 2$ 和 $b = 1$ 验证。

::: solution
**(a)** 将孔沿 $z$ 轴放置。球体的半径为 $r^2 + z^2 \le a^2$，所以在轴距 $r$ 处，它从 $z = -\sqrt{a^2 - r^2}$ 到 $z = \sqrt{a^2 - r^2}$。环是满足 $b \le r \le a$ 的部分：

$$\begin{aligned} V &= \int_0^{2\pi}\int_b^a\int_{-\sqrt{a^2 - r^2}}^{\sqrt{a^2 - r^2}} r\,dz\,dr\,d\theta \\ &= 2\pi\int_b^a 2r\sqrt{a^2 - r^2}\,dr. \end{aligned}$$

以 $w = a^2 - r^2$， $dw = -2r\,dr$ 为参数， $2r\sqrt{a^2 - r^2}$ 的一个原函数是 $-\tfrac23\big(a^2 - r^2\big)^{3/2}$，因此

$$V = 2\pi\cdot\frac23\big(a^2 - b^2\big)^{3/2} = \frac{4\pi}{3}\big(a^2 - b^2\big)^{3/2}.$$

**(b)** 孔的壁与球面相交于 $r = b$，在高度 $z = \pm\sqrt{a^2 - b^2}$ 处，因此环的高度为 $h = 2\sqrt{a^2 - b^2}$。然后 $\big(a^2 - b^2\big)^{3/2} = \big(\tfrac h2\big)^3 = \tfrac{h^3}{8}$，且

$$V = \frac{4\pi}{3}\cdot\frac{h^3}{8} = \frac{\pi h^3}{6}.$$

一个高6厘米的环从一个像橙子大小的球上切下，另一个高6厘米的环从一个像地球大小的球上切下，它们的体积相同，$36\pi \approx 113$ 立方厘米：第二个环的周长更宽，但它的壁更薄。

**(c)** 用 $a = 2$ 和 $b = 1$，公式 (a) 给出 $\tfrac{4\pi}{3}\cdot 3^{3/2} = 4\sqrt3\,\pi$。高度是 $h = 2\sqrt3$，公式 (b) 给出相同的结果：

$$\frac{\pi\big(2\sqrt3\big)^3}{6} = \frac{24\sqrt3\,\pi}{6} = 4\sqrt3\,\pi \approx 21.77.$$

```check
aR, bR = symbols('a b', positive=True)
same(integrate(r, (z, -sqrt(aR**2 - r**2), sqrt(aR**2 - r**2))), 2*r*sqrt(aR**2 - r**2))
antideriv(-Rational(2, 3)*(aR**2 - r**2)**Rational(3, 2), 2*r*sqrt(aR**2 - r**2), r)
Fr = -Rational(2, 3)*(aR**2 - r**2)**Rational(3, 2); same(Fr.subs(r, aR) - Fr.subs(r, bR), Rational(2, 3)*(aR**2 - bR**2)**Rational(3, 2))
Vring = 2*pi*Rational(2, 3)*(aR**2 - bR**2)**Rational(3, 2); same(Vring, 4*pi/3*(aR**2 - bR**2)**Rational(3, 2))
same(Vring.subs({aR: 2, bR: 1}), 4*sqrt(3)*pi)
same(2*pi*integrate(2*r*sqrt(4 - r**2), (r, 1, 2)), 4*sqrt(3)*pi)
hR = 2*sqrt(aR**2 - bR**2); same((hR/2)**3, (aR**2 - bR**2)**Rational(3, 2)); same(pi*hR**3/6, Vring)
same(pi*(2*sqrt(3))**3/6, 4*sqrt(3)*pi); rounds(4*sqrt(3)*pi, '21.77'); same(pi*6**3/6, 36*pi); rounds(36*pi, '113')
```
:::
::::

:::: exercise 飞镖与正态分布 {#ex-19-12} ★★★
将飞镖选手投掷的水平误差 $X$ 和垂直误差 $Y$ 假设为相互独立的标准正态随机变量（一种假设模型）。假设两个方向的标准差相同，所有长度均以该公共单位衡量，靶心位于原点。它们的联合密度为

$$\varphi(x)\varphi(y) = \frac{1}{2\pi}e^{-(x^2 + y^2)/2}.$$

- (a) 对于 $c \ge 0$，使用极坐标来证明落在靶心距离 $c$ 内的概率为 $1 - e^{-c^2/2}$。对 $c = 1$、2 和 3 进行计算，并与 [第12.9节](module_12_ZH.html#normal)] 的 68–95–99.7 规则进行比较。
- (b) 在 [小节 12.9](module_12_ZH.html#expected-value) 定义一个随机变量的均值的方式下，量 $g(X, Y)$ 在平面上的有限均值 $\iint g(x, y)f(x, y)\,dA$，前提是 $\iint \abs{g(x, y)}f(x, y)\,dA < \infty$。证明目标点的平均距离是 $\sqrt{\pi/2} \approx 1.253$。你可以使用高斯积分。

::: solution
**(a)** 事件是圆盘 $x^2 + y^2 \le c^2$，其为 $0 \le r \le c$， $0 \le \theta \le 2\pi$ 在极坐标下。用 $u = r^2/2$，

$$\begin{aligned} P &= \int_0^{2\pi}\int_0^c \frac{1}{2\pi}e^{-r^2/2}\,r\,dr\,d\theta \\ &= \Big[-e^{-r^2/2}\Big]_0^c = 1 - e^{-c^2/2}. \end{aligned}$$

对于 $c = 1$，2 和 3，这是 $1 - e^{-1/2} \approx 0.393$， $1 - e^{-2} \approx 0.865$ 和 $1 - e^{-9/2} \approx 0.989$。在一维情况下，落在 1、2 和 3 个标准差内的概率分别约为 0.683、0.954 和 0.997。圆盘条件 $X^2 + Y^2 \le c^2$ 比任一坐标条件 $\abs{X} \le c$ 或 $\abs{Y} \le c$ 单独更强；即使同时位于两个坐标范围内，所形成的区域也比圆盘大。

**(b)** 距离是 $r$，因此平均距离是

$$\begin{aligned} &\int_0^{2\pi}\int_0^\infty r\cdot\frac{1}{2\pi}e^{-r^2/2}\,r\,dr\,d\theta \\ &\quad= \int_0^\infty r^2e^{-r^2/2}\,dr, \end{aligned}$$

正函数的反常积分。用 $u = r$ 和 $dv = re^{-r^2/2}\,dr$ 分部积分，因此 $v = -e^{-r^2/2}$：对于 $t > 0$，

$$\int_0^t r^2e^{-r^2/2}\,dr = -te^{-t^2/2} + \int_0^t e^{-r^2/2}\,dr.$$

如 $t \to \infty$， $te^{-t^2/2} \to 0$（根据洛必达法则，模块7，应用于 $t\big/e^{t^2/2}$），并且根据高斯积分与 $c = \tfrac12$（第19.4节）， $\int_0^\infty e^{-r^2/2}\,dr$ 是 $\sqrt{2\pi}$ 的一半。因此，平均距离为

$$\frac{\sqrt{2\pi}}{2} = \sqrt{\frac{\pi}{2}} \approx 1.253.$$

```check
cD = symbols('c', positive=True)
same(exp(-x**2/2)/sqrt(2*pi)*exp(-y**2/2)/sqrt(2*pi), exp(-(x**2 + y**2)/2)/(2*pi))
PD = integrate(exp(-r**2/2)*r/(2*pi), (r, 0, cD), (theta, 0, 2*pi)); same(PD, 1 - exp(-cD**2/2))
same((1 - exp(-cD**2/2)).subs(cD, 0), 0)
antideriv(-exp(-r**2/2), r*exp(-r**2/2), r)
rounds(1 - exp(-Rational(1, 2)), '0.393'); rounds(1 - exp(-2), '0.865'); rounds(1 - exp(-Rational(9, 2)), '0.989')
rounds(erf(1/sqrt(2)), '0.683'); rounds(erf(2/sqrt(2)), '0.954'); rounds(erf(3/sqrt(2)), '0.997')
tD = symbols('t', positive=True)
same(integrate(r**2*exp(-r**2/2), (r, 0, tD)), -tD*exp(-tD**2/2) + integrate(exp(-r**2/2), (r, 0, tD)))
limit_is(t*exp(-t**2/2), t, oo, 0); same(integrate(exp(-r**2/2), (r, 0, oo)), sqrt(2*pi)/2)
same(integrate(r*exp(-r**2/2)*r/(2*pi), (r, 0, oo), (theta, 0, 2*pi)), sqrt(pi/2)); same(sqrt(2*pi)/2, sqrt(pi/2)); rounds(sqrt(pi/2), '1.253')
```
:::
::::

## 自测 {#quiz}

```quiz
? 设 $f$ 在三角形 $D$ 上连续，其中 $0 \le y \le x \le 1$（顶点 $(0, 0)$， $(1, 0)$ 和 $(1, 1)$）。哪一个重积分等于 $\iint_D f(x, y)\,dA$？
- [ ] $\displaystyle\int_0^1\int_0^y f(x, y)\,dx\,dy$
- [ ] $\displaystyle\int_0^1\int_0^x f(x, y)\,dx\,dy$
- [ ] $\displaystyle\int_0^x\int_0^1 f(x, y)\,dy\,dx$
- [x] $\displaystyle\int_0^1\int_y^1 f(x, y)\,dx\,dy$
> 高度为$y$的水平线从$x = y$线到$x = 1$边穿过$D$，因此$x$从$y$运行到1，$y$从0运行到1。$\int_0^y \dots\,dx$覆盖另一个三角形$0 \le x \le y$；$\int_0^x \dots\,dx$的积分变量位于其自身的极限中；且外层极限$x$不是常数。

? $\displaystyle\int_0^1\int_0^2 (x + 2y)\,dy\,dx$等于
- [ ] 4
- [x] 5
- [ ] $2x + 4$
- [ ] 4.5
> 内层积分，从 $y$ 0 到 2，是 $2x + 4$，且 $\int_0^1 (2x + 4)\,dx = 1 + 4 = 5$。 $2x + 4$ 仅是内层积分，是 $x$ 的函数，不是值；4 把限附加到错误的变量上，积分范围是 $[0, 2] \times [0, 1]$；4.5 增加了 $\int_0^1 x\,dx$ 和 $\int_0^2 2y\,dy$，忘记积分 $x$ 在 $y$ 从 0 到 2 会乘以 2。

? 哪个积分是圆盘 $x^2 + y^2 \le 9$ 的面积？
- [ ] $\displaystyle\int_0^{2\pi}\int_0^3 dr\,d\theta$
- [ ] $\displaystyle\int_0^{\pi}\int_0^3 r\,dr\,d\theta$
- [x] $\displaystyle\int_0^{2\pi}\int_0^3 r\,dr\,d\theta$
- [ ] $\displaystyle\int_0^{2\pi}\int_0^9 r\,dr\,d\theta$
> 圆盘是 $0 \le r \le 3$， $0 \le \theta \le 2\pi$，和 $dA = r\,dr\,d\theta$，这给出 $9\pi$。没有因子 $r$ 的积分是 $6\pi$； $\theta$ 到 $\pi$ 仅覆盖上半圆盘；半径是 3，不是 $r^2 = 9$。

? 对于 $g$ 在 $[0, 1]$ 上连续，交换积分顺序得到 $\displaystyle\int_0^1\int_x^1 g(y)\,dy\,dx$ 等于
- [x] $\displaystyle\int_0^1 y\,g(y)\,dy$
- [ ] $\displaystyle\int_0^1 (1 - y)\,g(y)\,dy$
- [ ] $\displaystyle\int_0^1 g(y)\,dy$
- [ ] $\displaystyle\int_0^1\int_0^1 g(y)\,dx\,dy$
> 区域是 $0 \le x \le y \le 1$。在高度 $y$ 处， $x$ 从 0 到 $y$，一个长度为 $y$ 的切片，因此积分是 $\int_0^1\int_0^y g(y)\,dx\,dy = \int_0^1 y\,g(y)\,dy$。因子 $1 - y$ 属于另一个三角形 $y \le x \le 1$； $\int_0^1 g(y)\,dy$ 忽略了切片的长度；最后一个积分是在整个正方形上进行的。

? 变换 $x = 2u + v$， $y = u - v$ 将单位正方形 $0 \le u \le 1$， $0 \le v \le 1$ 映射到一个平行四边形。其面积是
- [ ] $-3$
- [ ] 1
- [x] 3
- [ ] 2
> 雅可比行列式是 $x_uy_v - x_vy_u = 2 \cdot (-1) - 1 \cdot 1 = -3$，面积按其绝对值缩放： $3 \cdot 1 = 3$。 $-3$ 忽略了绝对值（面积永远不会为负）；1 将两个乘积 $-2 + 1 = -1$ 相加，而不是相减。

? 在球坐标中，以 $\rho \ge 0$ 和 $0 \le \varphi \le \pi$ 从正 $z$ 轴测量，体积元素 $dV$ 是
- [ ] $\rho\sin\varphi\,d\rho\,d\theta\,d\varphi$
- [x] $\rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$
- [ ] $\rho^2\cos\varphi\,d\rho\,d\theta\,d\varphi$
- [ ] $\rho^2\,d\rho\,d\theta\,d\varphi$
> 一个细小的楔形区域有边 $\Delta\rho$, $\rho\,\Delta\varphi$ 和 $\rho\sin\varphi\,\Delta\theta$, 所以 $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$. $\rho\sin\varphi$ 缺少一个因子 $\rho$; $\cos\varphi$ 只有在 $\varphi$ 从 $xy$ 平面测量（如同纬度）时才正确; 没有 $\sin\varphi$ 的情况下，半径为 $a$ 的球体体积会是 $\tfrac23\pi^2a^3$ 而不是 $\tfrac43\pi a^3$.

? $X$ 和 $Y$ 是相互独立的，且各自在 $[0, 1]$ 上均匀分布. $P\big(X + Y \le \tfrac12\big)$ 是
- [ ] $\tfrac14$
- [ ] $\tfrac12$
- [ ] $\tfrac{1}{16}$
- [x] $\tfrac18$
> 联合密度在单位正方形上为 1，因此概率是三角形 $x \ge 0$, $y \ge 0$, $x + y \le \tfrac12$ 的面积，其直角边为 $\tfrac12$: $\tfrac12 \cdot \tfrac12 \cdot \tfrac12 = \tfrac18$. $\tfrac14$ 是正方形 $\big[0, \tfrac12\big] \times \big[0, \tfrac12\big]$; $\tfrac12$ 是 $P(X + Y \le 1)$; $\tfrac{1}{16}$ 是 $P\big(X \le \tfrac14 \text{ and } Y \le \tfrac14\big)$，即三角形内正方形的面积，如同 $\tfrac12$ 必须平均分配给 $X$ 和 $Y$.

? $\displaystyle\int_0^\infty e^{-x^2}\,dx$等于
- [x] $\dfrac{\sqrt\pi}{2}$
- [ ] $\sqrt\pi$
- [ ] $\dfrac{\pi}{4}$
- [ ] $\pi$
> $e^{-x^2}$ 是偶函数，因此 $[0, \infty)$ 上的积分是 $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$ 的一半。 $\sqrt\pi$ 是整个实轴上的积分； $\tfrac{\pi}{4}$ 是答案的平方，即 $e^{-(x^2 + y^2)}$ 在第一象限上的积分； $\pi$ 是 $e^{-(x^2 + y^2)}$ 在整个平面上的积分。
```

```check
same(integrate(1, (x, y, 1), (y, 0, 1)), Rational(1, 2)); same(integrate(1, (y, 0, x), (x, 0, 1)), Rational(1, 2))
same(integrate(x, (x, y, 1), (y, 0, 1)), Rational(1, 3)); same(integrate(y, (x, y, 1), (y, 0, 1)), Rational(1, 6))
same(integrate(x, (x, 0, y), (y, 0, 1)), Rational(1, 6))   # the distractor covers the other triangle
same(integrate(x + 2*y, (y, 0, 2)), 2*x + 4); same(integrate(x + 2*y, (y, 0, 2), (x, 0, 1)), 5)
same(integrate(x + 2*y, (y, 0, 1), (x, 0, 2)), 4); same(integrate(x, (x, 0, 1)) + integrate(2*y, (y, 0, 2)), Rational(9, 2))
same(integrate(r, (r, 0, 3), (theta, 0, 2*pi)), 9*pi); same(integrate(1, (r, 0, 3), (theta, 0, 2*pi)), 6*pi)
same(integrate(r, (r, 0, 3), (theta, 0, pi)), 9*pi/2); same(integrate(r, (r, 0, 9), (theta, 0, 2*pi)), 81*pi)
gq = Function('g'); same(Integral(gq(y), (x, 0, y)).doit(), y*gq(y))
same(Matrix([2*u + v, u - v]).jacobian([u, v]).det(), -3); same(2*(-1) + 1*1, -1)
same(integrate(1, (y, 0, Rational(1, 2) - x), (x, 0, Rational(1, 2))), Rational(1, 8))
same(integrate(1, (y, 0, Rational(1, 4)), (x, 0, Rational(1, 4))), Rational(1, 16)); holds(Rational(1, 4) + Rational(1, 4) <= Rational(1, 2))
same(integrate(1, (y, 0, Rational(1, 2)), (x, 0, Rational(1, 2))), Rational(1, 4))
same(integrate(exp(-x**2), (x, 0, oo)), sqrt(pi)/2); same((sqrt(pi)/2)**2, pi/4)
same(integrate(exp(-r**2)*r, (r, 0, oo), (theta, 0, pi/2)), pi/4); same(integrate(exp(-r**2)*r, (r, 0, oo), (theta, 0, 2*pi)), pi)
same(integrate(rh**2, (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi)), Rational(2, 3)*pi**2*aB**3)
```
