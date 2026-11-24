---
title: 术语表
lead: 查找术语和符号，查看如何朗读符号，前往解释它的模块。
---

可按英文术语的首字母查找。每个条目同时列出中文和英文名称，也可用浏览器的查找功能搜索中文。小节编号由模块号与小节号组成，例如 8.3 表示模块 8 的第 3 小节。在窄屏上可左右滑动查看表格。还可以跳到[符号表](#notation)，或打开[公式表](formulas_ZH.html)。

[A](#g-a) · [B](#g-b) · [C](#g-c) · [D](#g-d) · [E](#g-e) · [F](#g-f) · [G](#g-g) · [H](#g-h) · [I](#g-i) · [J](#g-j) · [L](#g-l) · [M](#g-m) · [N](#g-n) · [O](#g-o) · [P](#g-p) · [Q](#g-q) · [R](#g-r) · [S](#g-s) · [T](#g-t) · [U](#g-u) · [V](#g-v) · [W](#g-w) · [Z](#g-z)

## 符号 {#notation}

如表格所示朗读符号。各组按照系列的各部分排列。如 $f$、$a$ 和 $x$ 这样的字母代表您正在阅读的示例中的函数、数字或变量。

### 函数、极限与连续性 {#notation-limits}

| 符号 | 读法 | 含义 | 小节 |
|---|---|---|---|
| $f(x)$ | "x 的函数" | $f$ 在 $x$ 处的值。 | [1.3](module_01_ZH.html#functions) |
| $\R$ | "实数" | 所有实数的集合。 | [1.3](module_01_ZH.html#domains) |
| $[a,b],\ (a,b)$ | "从 a 到 b 的闭区间和开区间" | 用方括号包含两端，用圆括号排除两端。 | [1.3](module_01_ZH.html#domains) |
| $\abs{x}$ | "x 的绝对值" | $x$ 与 $0$ 之间的距离。 | [1.3](module_01_ZH.html#functions) |
| $\sqrt{x},\ \sqrt[3]{x}$ | "x 的平方根和立方根" | $x\ge 0$ 的主平方根和任意实数 $x$ 的实立方根。 | [1.4](module_01_ZH.html#catalogue) |
| $e^x,\ \ln x$ | "e 的 x 次方，x 的自然对数" | 以 $e$ 为底的指数函数及其反函数在正输入上的定义。 | [1.4](module_01_ZH.html#catalogue), [6.1](module_06_ZH.html#number-e) |
| $\log_b x$ | "以 b 为底 x 的对数" | 使得 $b^y=x$ 成立的指数 $y$，其中 $b>0$，$b\ne1$ 和 $x>0$。 | [1.4](module_01_ZH.html#catalogue) |
| $\sin\theta,\ \cos\theta,\ \tan\theta$ | "theta 的正弦、余弦和正切" | 三角函数。除非另有说明，否则级数使用弧度制。 | [1.4](module_01_ZH.html#trig) |
| $f\circ g$ | "f 与 g 的复合" | 首先应用 $g$，然后将其输出结果应用 $f$。 | [1.5](module_01_ZH.html#new-from-old) |
| $f^{-1}$ | "f 的反函数" | 单射的 $f$ 的值域上的反函数。 | [1.5](module_01_ZH.html#new-from-old), [6.2](module_06_ZH.html#inverse-functions) |
| $\lim_{x\to a}f(x)$ | "x 趋近于 a 时 f(x) 的极限" | $f(x)$ 趋近于的数值，当 $x$ 趋近于 $a$ 时。 | [2.1](module_02_ZH.html#idea) |
| $\lim_{x\to a^-}f(x),\ \lim_{x\to a^+}f(x)$ | "左侧极限和右侧极限" | 分别用 $x<a$ 和 $x>a$ 接近 $a$。 | [2.2](module_02_ZH.html#one-sided) |
| $\varepsilon,\ \delta$ | 「epsilon，delta」 | 正距离。对于给定的输出误差上界 $\varepsilon$，选择一个输入必须接近 $a$ 的上界 $\delta$。 | [2.7](module_02_ZH.html#precise) |
| $\lim_{x\to\infty}f(x)$ | "x 趋于无穷大时 f(x) 的极限" | $f(x)$ 在 $x$ 无界增长时的极限。 | [3.7](module_03_ZH.html#limits-at-infinity) |
| $f\ll g$ | "f 比 g 小很多" | 在讨论的极限下，$f(x)/g(x)$ 与 $0$ 的比值趋于。 | [3.8](module_03_ZH.html#growth) |
| $O(g(x))$ | "g(x) 的大 O 记号" | 在讨论的极限附近，由常数倍 $\abs{g(x)}$ 给出的上界。 | [3.8](module_03_ZH.html#growth), [4.7](module_04_ZH.html#truncation) |

### 导数 {#notation-derivatives}

| 符号 | 读法 | 含义 | 小节 |
|---|---|---|---|
| $f'(a),\ f'(x)$ | "a 点的 f 导数，x 点的 f 导数" | $a$ 点的导数，或者作为 $x$ 函数的导数。 | [4.2](module_04_ZH.html#derivative), [4.3](module_04_ZH.html#derivative-function) |
| $\dfrac{dy}{dx},\ \dfrac{d}{dx}$ | "d y 由 d x，d 由 d x" | $y$ 对 $x$ 的导数，或者对 $x$ 进行微分的操作。 | [4.3](module_04_ZH.html#derivative-function) |
| $f''(x),\ f^{(n)}(x)$ | "x 点的 f 二阶导数，f 在 x 点的 n 阶导数" | 分别对两次或 $n$ 次进行求导。 | [4.6](module_04_ZH.html#higher-derivatives) |
| $\dfrac{d^2y}{dx^2}$ | "d 平方 y 由 d x 平方" | 第二导数 of $y$ 关于 $x$. | [4.6](module_04_ZH.html#higher-derivatives) |
| $\dfrac{df}{du}\dfrac{du}{dx}$ | "d f 除以 d u 乘以 d u 除以 d x" | 当 $u$ 依赖于 $x$ 时，关于 $u$ 的函数的链式法则。 | [5.5](module_05_ZH.html#chain) |
| $\arcsin x,\ \arccos x,\ \arctan x$ | "x 的反正弦、反余弦、反正切" | 三角函数在其选定的单射分支上的反函数。 | [6.5](module_06_ZH.html#inverse-trig) |
| $\sinh x,\ \cosh x,\ \tanh x$ | "x 的双曲正弦、双曲余弦和双曲正切" | 由 $e^x$ 和 $e^{-x}$ 构造的双曲函数。 | [6.7](module_06_ZH.html#hyperbolic) |
| $\Delta x,\ \Delta y$ | 「delta x，delta y」 | 输入和输出的实际变化。在等宽分割中，$\Delta x$ 是公共宽度。 | [7.2](module_07_ZH.html#linear-approximation), [9.3](module_09_ZH.html#riemann-sums) |
| $dx,\ dy$ | "d x, d y" | 输入和输出的微分，包含 $dy=f'(x)\,dx$。 | [7.2](module_07_ZH.html#linear-approximation) |
| $\tilde x$ | "x 下标 n" | 在误差讨论中，对真实值 $x$ 的测量或近似值。 | [7.3](module_07_ZH.html#errors) |
| $x_n,\ x_{n+1}$ | "x 下标 n，x 下标 n 加一" | 牛顿法中的当前迭代和下一个迭代。 | [7.4](module_07_ZH.html#newton) |

### 积分 {#notation-integrals}

| 符号 | 读法 | 含义 | 小节 |
|---|---|---|---|
| $\sum_{i=m}^{n} a_i$ | "从 m 到 n 的 ∑aₙ" | 将 $m$ 到 $n$ 的项相加。 | [9.2](module_09_ZH.html#sigma) |
| $L_n,\ R_n,\ M_n$ | "n 等分下的左、右、中点和" | 使用左端点、右端点或中点作为每个矩形的高度进行矩形近似。 | [9.3](module_09_ZH.html#riemann-sums) |
| $x_i^*,\ \norm{P}$ | 「x 下标 i 加星号，P 的范数」 | 子区间 $i$ 的样本点和分划 $P$ 中的最大宽度。 | [9.4](module_09_ZH.html#definite-integral) |
| $\int_a^b f(x)\,dx$ | "∫ₐᵇ f(x) dx" | 定积分。变量 $x$ 是积分变量。 | [9.4](module_09_ZH.html#definite-integral) |
| $f_{\mathrm{avg}}$ | 「f 的平均值」 | 区间上 $f$ 的积分除以其长度。 | [9.7](module_09_ZH.html#average) |
| $\int f(x)\,dx$ | "f(x) 的不定积分 dx" | 区间上的原函数族，写作任意常数 $C$。 | [10.1](module_10_ZH.html#antiderivatives) |
| $\big[F(x)\big]_a^b$ | "F(x) 从 a 到 b 的值" | 差值 $F(b)-F(a)$。 | [10.5](module_10_ZH.html#ftc2) |
| $T_n,\ S_n$ | 用 n 个区间进行梯形法和辛普森法近似 | 使用梯形或通过抛物线拟合子区间的积分估计方法 | [11.7](module_11_ZH.html#numerical) |
| $\int_a^\infty f(x)\,dx$ | 从 a 到无穷大的积分 ∫f(x) dx | 当其作为有限数存在时，$\int_a^t f(x)\,dx$ 随 $t\to\infty$ 的极限 | [12.8](module_12_ZH.html#improper) |
| $\int_{-\infty}^\infty f(x)\,dx$ | 从负无穷到正无穷的积分 | 在有限点处分开，若两个瑕积分都收敛，则相加 | [12.8](module_12_ZH.html#improper) |
| $\bar x,\ \bar y$ | 「x 加横线，y 加横线」 | 质心或形心的坐标，或最小二乘法中的样本均值 | [12.7](module_12_ZH.html#centre-of-mass), [18.5](module_18_ZH.html#least-squares) |
| $P(a\le X\le b)$ | "X 落在 a 和 b 之间的概率" | 对于连续随机变量，将其密度函数在 $[a,b]$ 上积分 | [12.9](module_12_ZH.html#probability) |
| $y'=F(t,y)$ | "y prime 等于 F of t 和 y" | 一阶微分方程，给出导数关于时间与当前值的表达式 | [13.1](module_13_ZH.html#what) |

### 数列与级数 {#notation-series}

| 符号 | 读法 | 含义 | 小节 |
|---|---|---|---|
| $(a_n),\ a_n$ | "序列 a sub n, a sub n" | 整个序列及其索引为 $n$ 的项。 | [14.1](module_14_ZH.html#sequences) |
| $\lim_{n\to\infty}a_n=L$ | "当 n 趋于无穷时，aₙ 的极限是 L" | 随着下标增大，数列趋近于 $L$。 | [14.1](module_14_ZH.html#sequences) |
| $\sum_{n=1}^{\infty}a_n,\ S_N$ | 「从 n 等于一到无穷求和 a 下标 n，S 下标 N」 | 无穷级数及截至下标 $N$ 的部分和。 | [14.3](module_14_ZH.html#series) |
| $\sum_{n=0}^{\infty}c_n(x-a)^n$ | 「从 n 等于零到无穷，对 c 下标 n 乘 x 减 a 的 n 次幂求和」 | 以 $x$ 为变量、以 $a$ 为中心、系数为 $c_n$ 的幂级数。 | [15.1](module_15_ZH.html#power-series) |
| $R$ | 「收敛半径」 | 幂级数在距中心小于此距离的范围内绝对收敛。有限端点要分别判断。 | [15.1](module_15_ZH.html#power-series) |
| $T_n(x),\ R_n(x)$ | "T n of x, R n of x" | 最高保留到 $n$ 次的泰勒多项式及其余项 $f(x)-T_n(x)$。 | [15.4](module_15_ZH.html#taylor-series), [15.5](module_15_ZH.html#taylor-theorem) |
| $\binom{k}{n}$ | 「k 选 n」 | $(1+x)^k$ 的二项式展开中 $x^n$ 项的系数。 | [15.4](module_15_ZH.html#taylor-series) |
| $n!$ | 「n 的阶乘」 | 整数从 $1$ 到 $n$ 的乘积，加上 $0!=1$。 | [14.8](module_14_ZH.html#absolute), [15.4](module_15_ZH.html#taylor-series) |
| $i,\ e^{i\theta}$ | "i, e 的 i theta 次方" | 虚数单位与 $i^2=-1$，以及复指数等于 $\cos\theta+i\sin\theta$。 | [15.7](module_15_ZH.html#euler) |

### 多变量 {#notation-several}

| 符号 | 读法 | 含义 | 小节 |
|---|---|---|---|
| $x=f(t),\ y=g(t)$ | "x 等于 f(t)，y 等于 g(t)" | 平面曲线的参数描述。 | [16.1](module_16_ZH.html#parametric) |
| $(r,\theta)$ | "极坐标 r 和 theta" | 半径和角度，通过 $x=r\cos\theta$ 和 $y=r\sin\theta$ 与直角坐标相关联。 | [16.3](module_16_ZH.html#polar) |
| $\vb{a},\ \vec a,\ \langle a_1,a_2,a_3\rangle$ | "向量 a，具有分量 a 一，a 二，a 三" | 同样的向量用粗体、箭头或角括号表示分量。 | [16.4](module_16_ZH.html#vectors) |
| $\norm{\vb{a}}$ | "a 的长度，或 a 的范数" | 向量的欧几里得长度。 | [16.4](module_16_ZH.html#vectors) |
| $\vb{i},\ \vb{j},\ \vb{k}$ | "i，j 和 k" | 正坐标轴方向的单位向量。 | [16.4](module_16_ZH.html#vectors) |
| $\vb{a}\cdot\vb{b},\ \vb{a}\times\vb{b}$ | "a 和 b 的点积，a 和 b 的叉积" | 三维空间中的标量点积和向量叉积。 | [16.5](module_16_ZH.html#dot), [16.6](module_16_ZH.html#cross) |
| $\operatorname{comp}_{\vb{a}}\vb{b},\ \operatorname{proj}_{\vb{a}}\vb{b}$ | "b 沿 a 的分量，b 在 a 上的投影" | 有符号的标量投影及其向量对应项，用于 $\vb{a}\ne\vb{0}$。 | [16.5](module_16_ZH.html#projections) |
| $\vb{r}(t),\ \vb{r}'(t)$ | 「r 关于 t；r 关于 t 的导数」 | 位置及其导数，当 $t$ 为时间时的速度向量。 | [16.7](module_16_ZH.html#lines-planes), [16.8](module_16_ZH.html#motion) |
| $f_x,\ \dfrac{\partial f}{\partial x}$ | 「f 下标 x；f 对 x 的偏导数」 | 对 $f$ 关于 $x$ 求导，同时保持其其他输入固定。 | [17.3](module_17_ZH.html#partial-derivatives) |
| $f_{xy},\ \dfrac{\partial^2 f}{\partial y\,\partial x}$ | 「f 下标 x y；f 先对 x 后对 y 的二阶偏导数」 | 首先对 $x$ 求导，然后对 $y$ 求导。 | [17.3](module_17_ZH.html#partial-derivatives) |
| $D_{\vb{u}}f$ | 「f 在 u 方向上的方向导数」 | 沿单位向量 $\vb{u}$ 方向单位距离的变化率。 | [17.6](module_17_ZH.html#gradient) |
| $\nabla f$ | 「f 的梯度」 | 一阶偏导数的向量。 | [17.6](module_17_ZH.html#gradient) |
| $\lambda,\ \mu$ | 「lambda，mu」 | 用于拉格朗日方法约束条件的乘数。 | [18.4](module_18_ZH.html#lagrange) |
| $H,\ D$ | "海森矩阵及其行列式" | 二阶偏导数矩阵及其行列式。 | [18.2](module_18_ZH.html#second-derivative-test) |
| $\iint_R f\,dA$ | "在 R 上对 f 的二重积分，d A" | 在平面上的区域积分，使用 $dA$ 面积元素。 | [19.1](module_19_ZH.html#double-integrals) |
| $\iiint_E f\,dV$ | "在 E 上对 f 的三重积分，d V" | 在立体区域上的积分，使用 $dV$ 体积元素。 | [19.6](module_19_ZH.html#triple) |
| $(\rho,\theta,\varphi)$ | 「rho，theta，phi」 | 球坐标系。$\varphi$ 表示从正 $z$ 轴测量的角度。 | [19.7](module_19_ZH.html#cylindrical-spherical) |
| $\dfrac{\partial(x,y)}{\partial(u,v)}$ | "x 和 y 关于 u 和 v 的雅可比矩阵" | 坐标映射的偏导数矩阵的行列式。 | [19.8](module_19_ZH.html#change-of-variables) |
| $\vb{F}(x,y)$ | "F 的 x, y" | 字段 $\vb{F}$ 在 $(x,y)$ 处分配的向量。 | [20.1](module_20_ZH.html#fields) |
| $\int_C f\,ds$ | "沿 C 对 f 的积分，d s" | 对标量函数沿曲线进行弧长积分。 | [20.2](module_20_ZH.html#line-integrals) |
| $\int_C \vb{F}\cdot d\vb{r}$ | "向量场 F 沿曲线 C 的线积分" | 沿定向曲线积分向量场的切向分量。 | [20.2](module_20_ZH.html#line-integrals) |
| $\oint_C \vb{F}\cdot d\vb{r}$ | "向量场 F 沿曲线 C 的线积分" | 围绕闭合曲线的线积分。 | [20.3](module_20_ZH.html#conservative) |
| $\nabla\times\vb{F},\ \nabla\cdot\vb{F}$ | "旋度 curl F，散度 div F" | 向量场的旋度和散度。 | [20.5](module_20_ZH.html#curl-divergence) |
| $\iint_S f\,dS$ | "标量函数 f 在曲面 S 上的曲面积分" | 对标量函数在曲面上关于曲面面积进行积分。 | [20.6](module_20_ZH.html#surfaces) |
| $\iint_S\vb{F}\cdot d\vb{S}$ | 向量场 F 通过曲面 S 的通量。 | 积分向量场 $\vb{F}$ 的法向分量与 $S$ 的选定方向。 | [20.6](module_20_ZH.html#surfaces) |

## 从 A 到 Z 的术语 {#terms}

<div class="section-anchor" id=g-a></div>

### A

| 术语 | 含义 | 小节 |
|---|---|---|
| **阿贝尔定理（Abel's theorem）** | 如果一个幂级数在收敛半径 $0 < R < \infty$ 的端点处收敛，则其在该端点处的和等于其在区间内部的和的极限，当 $x$ 趋近于该端点时。 | [15.3](module_15_ZH.html#endpoints) |
| **绝对收敛（absolute convergence）** | 一个级数 $\sum a_n$ 收敛绝对地，如果 $\sum \abs{a_n}$ 收敛。绝对收敛意味着收敛，且每一个绝对收敛级数的重排都有相同的和。 | [14.8](module_14_ZH.html#absolute) |
| **绝对误差（absolute error）** | 近似值 $\abs{\Delta x}$ 的误差 $\Delta x = x - \tilde x$ 的绝对值 $\tilde x$ 的 $x$。 | [7.3](module_07_ZH.html#errors) |
| **绝对最大值（absolute maximum）** | $f(c)$ 是 $f$ 的绝对（或全局）最大值，如果 $f(c) \ge f(x)$ 对于域中的每一个 $x$；绝对最小值具有 $f(c) \le f(x)$。在区间 $I$ 上，域被限制为 $I$。 | [8.1](module_08_ZH.html#extrema), [18.1](module_18_ZH.html#critical-points) |
| **绝对值（absolute value）** | $\abs{x} = x$ 如果 $x \ge 0$ 且 $\abs{x} = -x$ 如果 $x < 0$：从 $x$ 到 0 的距离。$\abs{a - b}$ 是 $a$ 和 $b$ 之间的距离。 | [1.3](module_01_ZH.html#piecewise) |
| **加速度（acceleration）** | 速度的变化率：$a(t) = v'(t) = s''(t)$ 在一条直线上，$\vb{a}(t) = \vb{v}'(t) = \vb{r}''(t)$ 在空间中。当速度和加速度的符号相同时，物体加速；当它们的符号不同时，物体减速。 | [4.6](module_04_ZH.html#motion), [16.8](module_16_ZH.html#velocity) |
| **累积量（accumulation）** | 当某个量的变化率不断变化时，一段时间内该量累积了多少。积分可以计算这个值。 | [1.1](module_01_ZH.html#about), [10.3](module_10_ZH.html#area-function) |
| **自适应规则（adaptive rule）** | 一种数值积分规则，仅在被积函数变化较快的区间内不断将子区间减半，如同库函数所做的一样。 | [11.7](module_11_ZH.html#which-rule) |
| **加法公式（addition formulas）** | $\sin(x + y) = \sin x\cos y + \cos x\sin y$ 与 $\cos(x + y) = \cos x\cos y - \sin x\sin y$。 | [1.4](module_01_ZH.html#trig) |
| **区间可加性（additivity over intervals）** | $\int_a^b f(x)\,dx + \int_b^c f(x)\,dx = \int_a^c f(x)\,dx$，当 $f$ 在包含 $a$、$b$ 和 $c$ 的区间上连续，或有有限个不连续点且有界时，无论顺序如何。 | [9.5](module_09_ZH.html#properties), [10.3](module_10_ZH.html#area-function) |
| **伴随量（adjoint）** | 在一个以数字 $L$ 结束的计算中，节点 $v$ 的伴随数是 $\bar v = \partial L/\partial v$。反向传播从输出计算伴随数，回溯至输入。 | [17.8](module_17_ZH.html#backpropagation) |
| **交错调和级数（alternating harmonic series）** | $1 - \tfrac12 + \tfrac13 - \tfrac14 + \cdots$收敛于 $\ln 2$，但仅条件收敛。 | [14.7](module_14_ZH.html#alternating), [15.3](module_15_ZH.html#endpoints) |
| **交错级数（alternating series）** | 一项项符号交替变化的级数，例如 $\sum (-1)^{n-1}b_n = b_1 - b_2 + b_3 - \cdots$ 与 $b_n > 0$。 | [14.7](module_14_ZH.html#alternating) |
| **交错级数判别法（alternating series test）** | 若 $b_n > 0$，且对每个 $n$ 都有 $b_{n+1} \le b_n$，并且 $b_n \to 0$，则 $\sum (-1)^{n-1}b_n$ 收敛，其和 $S$ 满足 $\abs{S - S_N} \le b_{N+1}$，即误差不超过首个舍去项。 | [14.7](module_14_ZH.html#alternating) |
| **解析的（analytic）** | 如果一个函数在开区间内每个点附近等于其泰勒级数的和，则该函数在该区间内解析。 $e^x$、$\sin x$ 和 $\cos x$ 在整个实数线上解析。 | [15.5](module_15_ZH.html#series-equals-function) |
| **原函数（antiderivative）** | $F$ 是 $f$ 在区间 $I$ 上的原函数，如果对于每个 $x$ 在 $I$ 内，均有 $F'(x) = f(x)$；在属于 $I$ 的端点处， $F'$ 是单侧导数。 | [10.1](module_10_ZH.html#antiderivatives) |
| **弧长（arc length）** | 曲线的长度：如果存在，就是内接多边形长度的极限。对于 $y = f(x)$ 与 $f'$ 在 $[a, b]$ 上连续，$L = \int_a^b \sqrt{1 + f'(x)^2}\,dx$；对于路径，$\int_a^b \norm{\vb{r}'(t)}\,dt$。 | [12.5](module_12_ZH.html#arc-length), [16.2](module_16_ZH.html#arc-length), [16.8](module_16_ZH.html#integrals) |
| **弧长函数（arc length function）** | $s(t) = \int_a^t \norm{\vb{r}'(u)}\,du$，从时间 $a$ 开始沿曲线行进的距离；$ds/dt = \norm{\vb{r}'(t)}$。 | [16.8](module_16_ZH.html#integrals) |
| **阿基米德螺线（Archimedean spiral）** | 如 $r = \theta/2$ 这样的螺线，$\theta \ge 0$：每一圈完整旋转增加的 $r$ 相同，因此相邻的圈之间的距离相同。 | [16.3](module_16_ZH.html#polar-curves) |
| **反正割函数（arcsec）** | 对于 $\abs{x} \ge 1$，该级数将 $\arcsec x$ 视为 $y$ 在 $[0, \pi/2) \cup (\pi/2, \pi]$ 中的 $\sec y = x$，即 $\arccos(1/x)$。不同书籍对其定义域有不同的说法，因此对于 $x < -1$，其导数的符号也存在分歧。 | [6.5](module_06_ZH.html#inverse-trig) |
| **曲线之间的面积（area between curves）** | 对于 $f$ 与 $g$ 在 $[a, b]$ 上连续，且 $g \le f$，它们图像之间区域的面积为 $\int_a^b \big(f(x) - g(x)\big)\,dx$。 | [12.2](module_12_ZH.html#area) |
| **面积函数（area function）** | 对于 $f$ 在区间 $I$ 内的每一个闭区间上可积，且 $a$ 在 $I$，$A(x) = \int_a^x f(t)\,dt$ 对于 $x$ 在 $I$。也称为累积函数：它累积了 $f$ 下的有符号面积。 | [10.3](module_10_ZH.html#area-function) |
| **极坐标下的面积（area in polar coordinates）** | 对于 $f$ 连续且 $f \ge 0$ 在 $[\alpha, \beta]$，$0 < \beta - \alpha \le 2\pi$，由 $r = f(\theta)$ 和射线 $\theta = \alpha$ 与 $\theta = \beta$ 所围成的区域的面积为 $\int_\alpha^\beta \tfrac12 f(\theta)^2\,d\theta$。 | [16.3](module_16_ZH.html#polar-area) |
| **数组（array）** | 在 NumPy 中，一个数字列表，算术运算可以一次性作用于所有元素。 | [1.7](module_01_ZH.html#first-session) |
| **星形线（astroid）** | 曲线 $x^{2/3} + y^{2/3} = 1$，由 $x = \cos^3 t$，$y = \sin^3 t$ 追迹而成。 | [Ex. 6.11](module_06_ZH.html#ex-6-11), [Ex. 16.6](module_16_ZH.html#ex-16-6) |
| **自动微分（automatic differentiation）** | 通过在数值上运行程序一次，并在每一步更新其值和导数的规则，来计算程序的导数：除了舍入误差外是精确的。双数在前向模式下实现这一点。 | [5.8](module_05_ZH.html#autodiff), [5.8](module_05_ZH.html#backprop) |
| **自治的（autonomous）** | 一个微分方程 $y' = f(y)$，其右边不依赖于 $t$。 | [13.3](module_13_ZH.html#equilibria) |
| **平均变化率（average rate of change）** | 函数 $f$ 在区间 $[a, b]$ 上的平均变化率是 $\dfrac{f(b) - f(a)}{b - a} = \dfrac{\Delta y}{\Delta x}$，即通过点 $(a, f(a))$ 和 $(b, f(b))$ 的割线的斜率。 | [1.6](module_01_ZH.html#rates) |
| **平均值（average value）** | 函数 $f$ 在区间 $[a, b]$ 上的平均值，其中 $a < b$，是 $f_{\text{avg}} = \dfrac{1}{b - a}\int_a^b f(x)\,dx$。在矩形 $R$ 上，其平均值为 $\dfrac{1}{A(R)}\iint_R f\,dA$。 | [9.7](module_09_ZH.html#average), [19.2](module_19_ZH.html#iterated) |

<div class="section-anchor" id=g-b></div>

### B

| 术语 | 含义 | 小节 |
|---|---|---|
| **反向传播（backpropagation）** | 自动微分的反向方式：先运行一次计算并保留中间值（前向传播），然后从输出反向传播到输入，利用链式法则乘以局部导数（反向传播）。这种方法可以得到损失函数相对于每个参数的导数，其计算成本仅为计算损失的常数倍。 | [5.8](module_05_ZH.html#backprop), [17.8](module_17_ZH.html#backpropagation) |
| **基本情况（base case）** | 归纳法证明的第一步：对于 $n = 1$ 的陈述。 | [Ex. 5.10](module_05_ZH.html#ex-5-10), [9.2](module_09_ZH.html#power-sums) |
| **大 O 记号（big-O notation）** | $f(n) = O\big(g(n)\big)$当 $n \to \infty$ 存在常数 $C$ 和 $N$，使得对于所有 $n \ge N$，有 $\abs{f(n)} \le C\abs{g(n)}$。当 $h \to 0$，$E(h) = O(h^p)$ 如果 $\abs{E(h)} \le C\abs{h}^p$ 每当 $0 < \abs{h} < \delta$，对于某些常数 $C$ 和 $\delta > 0$。 | [3.8](module_03_ZH.html#big-o), [4.7](module_04_ZH.html#truncation) |
| **二项式系数（binomial coefficient）** | $\dbinom{n}{k} = \dfrac{n!}{k!\,(n - k)!}$，读作 "n 选 k"：从 $n$ 个中选择 $k$ 个的方式数。对于任意实数 $k$ 和 $\dbinom{k}{n} = \dfrac{k(k - 1)\cdots(k - n + 1)}{n!}$，二项式级数的系数。 | [4.5](module_04_ZH.html#power-rule), [15.4](module_15_ZH.html#standard) |
| **二项式级数（binomial series）** | $(1 + x)^k = \sum_{n=0}^{\infty} \dbinom{k}{n}x^n$，对于每个实数 $k$ 和每个 $x$ 满足 $\abs{x} < 1$：$(1 + x)^k$ 的麦克劳林级数。 | [15.4](module_15_ZH.html#standard) |
| **二项式定理（binomial theorem）** | $(x + h)^n = \sum_{k=0}^{n}\dbinom{n}{k}x^{n-k}h^k$ 对于每个正整数 $n$：项 $x^{n-k}h^k$ 每种选择 $k$ 个 $n$ 个因子提供一个 $h$ 的方式出现一次。 | [4.5](module_04_ZH.html#power-rule) |
| **二分法（bisection method）** | 一种在 $[a, b]$ 上寻找连续 $f$ 的根的方法，当 $f(a)$ 和 $f(b)$ 符号相反时：再次将区间一分为二，保留符号发生变化的那一半。经过 $n$ 步后，中点与根的距离不超过 $(b - a)/2^{n+1}$。 | [3.4](module_03_ZH.html#bisection) |
| **爆破（blow up）** | 当解在 $t$ 接近有限时间时无界增长时，解称为爆破。$y = 1/(1 - t)$，$y' = y^2$，$y(0) = 1$ 的解在 $t \to 1$ 时爆破。 | [13.1](module_13_ZH.html#existence) |
| **自助抽样样本（bootstrap sample）** | 从 $n$ 个数据项中随机抽取，每次放回抽取，抽取 $n$ 个项的样本，用于统计和机器学习。 | [Ex. 7.8](module_07_ZH.html#ex-7-8) |
| **边界点（boundary point）** | 一个点 $P$，使得以 $P$ 为中心的每一个开圆盘都包含 $R$ 中的点和不属于 $R$ 的点。 | [18.3](module_18_ZH.html#absolute-extrema) |
| **有界（bounded）** | 若存在一个数 $M$，使得每个 $n$ 都满足 $a_n \le M$，则称数列有上界，这个数是一个上界。若某个下界 $m$ 满足 $a_n \ge m$，则称数列有下界。两者都成立时称数列有界。平面上的集合若包含在某个圆盘中，则它有界。 | [14.2](module_14_ZH.html#monotone), [18.3](module_18_ZH.html#absolute-extrema) |
| **夹逼区间（bracket）** | 在二分法中，一个区间 $[a_n, b_n]$，其两端点 $f$ 的函数值符号相反，因此该区间包含一个根。 | [3.4](module_03_ZH.html#bisection) |

<div class="section-anchor" id=g-c></div>

### C

| 术语 | 含义 | 小节 |
|---|---|---|
| **消去误差（cancellation error）** | 计算机在减去两个非常接近的浮点数时导致的精度损失：如果它们在前 $k$ 位数字上相同，则大约会丢失 $k$ 位有效数字。 | [2.8](module_02_ZH.html#cancellation) |
| **心形线（cardioid）** | 心形的极坐标曲线 $r = 1 + \cos\theta$。 | [16.3](module_16_ZH.html#polar-curves) |
| **环境容纳量（carrying capacity）** | 在逻辑斯蒂方程中，种群数量达到某个水平 $K$ 时，每个个体的增长率 $y'/y$ 降为 0：这是一个稳定的平衡点，任何正的种群数量都会趋近于此。 | [13.6](module_13_ZH.html#logistic) |
| **悬链线（catenary）** | 悬挂于自身重力下的链条或缆线的形状：函数 $y = a\cosh(x/a)$ 的图像，其最低点位于 $(0, a)$。 | [6.7](module_06_ZH.html#hanging-chain) |
| **柯西-施瓦茨不等式（Cauchy–Schwarz inequality）** | $\abs{\vb{a}\cdot\vb{b}} \le \norm{\vb{a}}\,\norm{\vb{b}}$ 对所有向量 $\vb{a}$ 和 $\vb{b}$ 成立。 | [Ex. 16.11](module_16_ZH.html#ex-16-11) |
| **柯西中值定理（Cauchy's mean value theorem）** | 如果 $f$ 和 $g$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导，则存在 $\big(f(b) - f(a)\big)g'(c) = \big(g(b) - g(a)\big)f'(c)$ 使得 $c$ 在 $(a, b)$ 中成立。这证明了洛必达法则。 | [8.2](module_08_ZH.html#consequences) |
| **中心差分（central difference）** | $\dfrac{f(a + h) - f(a - h)}{2h}$，对于步长 $h > 0$：前向差分和后向差分的平均值，是对 $f'(a)$ 的估计，误差为 $O(h^2)$。 | [4.7](module_04_ZH.html#differences) |
| **质心（centre of mass）** | 使物体平衡的点。在一条直线上，质量 $m_i$ 分布在点 $x_i$ 处，其合力为 $\bar x = \sum m_ix_i/\sum m_i$；沿 $[a, b]$ 放置的杆，密度连续 $\rho > 0$，其合力矩为 $\bar x = \dfrac1M\int_a^b x\,\rho(x)\,dx$，其中 $M = \int_a^b \rho(x)\,dx$。一个平板的合力为 $(\bar x, \bar y) = (M_y/m, M_x/m)$。 | [12.7](module_12_ZH.html#centre-of-mass), [19.5](module_19_ZH.html#mass), [19.6](module_19_ZH.html#triple) |
| **向心加速度（centripetal acceleration）** | 匀速圆周运动的加速度，半径为 $R$，速度为 $v$：它指向圆心，大小为 $v^2/R$。 | [例 16.10](module_16_ZH.html#ex-16-10) |
| **形心（centroid）** | 均匀正密度的板或实体的质心。对于在 $g\le f$ 和 $[a,b]$ 之间连续的板，面积为 $A>0$，$\bar x=\tfrac1A\int_a^b x(f-g)\,dx$ 和 $\bar y=\tfrac1A\int_a^b \tfrac12(f^2-g^2)\,dx$。 | [12.7](module_12_ZH.html#centre-of-mass), [19.5](module_19_ZH.html#mass), [19.6](module_19_ZH.html#triple) |
| **链式法则（chain rule）** | 若 $g$ 在 $x$ 处可导，$f$ 在 $g(x)$ 处可导，则 $\big(f(g(x))\big)' = f'\big(g(x)\big)\,g'(x)$；用莱布尼茨记号表示为 $\dfrac{dy}{dx} = \dfrac{dy}{du}\,\dfrac{du}{dx}$：速率相乘。在多个变量的情况下，$\dfrac{dz}{dt} = \dfrac{\partial z}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial z}{\partial y}\dfrac{dy}{dt}$。 | [5.5](module_05_ZH.html#rates-multiply), [17.5](module_17_ZH.html#chain-rule) |
| **换底（change of base）** | 对于正数底 $a$，$a^x=e^{x\ln a}$。对于对数，$\log_a x=\ln x/\ln a$ 当 $a\ne1$ 且 $x>0$。 | [6.1](module_06_ZH.html#base-e) |
| **变量替换（change of variables）** | $\iint_D f(x, y)\,dA = \iint_S f\big(x(u, v), y(u, v)\big)\abs{\dfrac{\partial(x, y)}{\partial(u, v)}}\,du\,dv$, 对于一个具有连续一阶偏导数的变换，它将 $S$ 一一映射到 $D$，雅可比行列式不为零，除了可能在 $S$ 的边界上；$S$ 和 $D$ 为类型 I 或 II。 | [19.8](module_19_ZH.html#change-of-variables) |
| **特征方程（characteristic equation）** | $ar^2 + br + c = 0$，使得 $r$ 成为 $y = e^{rt}$ 在 $ay'' + by' + cy = 0$ 中的解的数值。两个实根给出解 $C_1e^{r_1t} + C_2e^{r_2t}$，一个实根给出 $(C_1 + C_2t)e^{rt}$，没有实根则给出 $e^{\alpha t}(C_1\cos\beta t + C_2\sin\beta t)$，其中 $\alpha = -\dfrac{b}{2a}$ 和 $\beta = \dfrac{\sqrt{4ac - b^2}}{2a}$。 | [13.8](module_13_ZH.html#second-order) |
| **环量（circulation）** | $\oint_C \vb{F}\cdot\vb{T}\,ds = \oint_C \vb{F}\cdot d\vb{r}$：一个场沿闭合曲线 $C$ 流动的强度。 | [20.4](module_20_ZH.html#flux-form) |
| **克莱罗定理（Clairaut's theorem）** | 如果 $f$ 在包含 $(a, b)$ 的圆盘 $D$ 上定义，且 $f_{xy}$ 和 $f_{yx}$ 在 $D$ 上都连续，则 $f_{xy}(a, b) = f_{yx}(a, b)$。 | [17.3](module_17_ZH.html#higher) |
| **闭合曲线（closed curve）** | 一条起点和终点重合的曲线。$\oint_C$ 表示沿闭合曲线的线积分。 | [20.3](module_20_ZH.html#conservative) |
| **闭区间（closed interval）** | $[a, b]$，对于 $a < b$：所有满足 $x$ 的数 $a \le x \le b$，包括两个端点。 | [1.3](module_01_ZH.html#intervals) |
| **闭区间法（closed interval method）** | 为了找到在 $[a, b]$ 上连续的函数的绝对极值，比较其在端点和区间 $(a, b)$ 内的临界点处的值：最大的值为最大值，最小的值为最小值。 | [8.1](module_08_ZH.html#closed-interval) |
| **闭区域法（closed region method）** | 为寻找连续函数 $f$ 在闭合有界区域上的绝对极值：找出内部临界点的函数值，找出边界上的最大和最小值，并进行比较。 | [18.3](module_18_ZH.html#absolute-extrema) |
| **闭集（closed set）** | 一个包含其所有边界点的平面集合。 | [18.3](module_18_ZH.html#absolute-extrema) |
| **系数（coefficient）** | 乘以变量幂的常数：在多项式 $\sum a_kx^k$ 中的 $a_k$，或在幂级数 $\sum c_n(x - a)^n$ 中的 $c_n$。 | [1.4](module_01_ZH.html#polynomials), [15.1](module_15_ZH.html#power-series) |
| **比较性质（comparison property）** | 对 $a < b$ 和可积 $f$ 和 $g$：如果 $f \le g$ 在 $[a, b]$ 上，则 $\int_a^b f \le \int_a^b g$；并且如果 $m \le f(x) \le M$ 在那里，则 $m(b - a) \le \int_a^b f(x)\,dx \le M(b - a)$。 | [9.5](module_09_ZH.html#properties) |
| **比较判别法（comparison test）** | 对于积分，若在 $x \ge a$ 时有 $0 \le f(x) \le g(x)$，且 $f$ 与 $g$ 连续，则 $\int_a^\infty g$ 收敛推出 $\int_a^\infty f$ 收敛，$\int_a^\infty f$ 发散推出 $\int_a^\infty g$ 发散。对于级数，若从某个下标起有 $0 \le a_n \le b_n$，则 $\sum b_n$ 收敛推出 $\sum a_n$ 收敛，$\sum a_n$ 发散推出 $\sum b_n$ 发散。 | [12.8](module_12_ZH.html#comparison), [14.6](module_14_ZH.html#comparison) |
| **完备性（completeness）** | 实数的一个性质，即数轴上没有间隙。介值定理和单调收敛定理的证明依赖于此；分析中将其表述为最小上界性质。 | [3.3](module_03_ZH.html#ivt), [14.2](module_14_ZH.html#mct) |
| **复分析（complex analysis）** | 复变量函数的微积分，欧拉公式所处的领域。 | [20.8](module_20_ZH.html#next) |
| **复指数函数（complex exponential）** | $e^z = \sum_{n=0}^{\infty} \dfrac{z^n}{n!} = 1 + z + \dfrac{z^2}{2!} + \cdots$，对于每一个复数 $z$。 | [15.7](module_15_ZH.html#complex) |
| **复数（complex number）** | 一个数 $z = p + qi$，其中 $p$ 和 $q$ 是实数，$i^2 = -1$：$p$ 是它的实部，$q$ 是它的虚部。复数像 $i$ 中的表达式一样相加和相乘，其中 $i^2$ 被替换为 $-1$。 | [15.7](module_15_ZH.html#complex) |
| **复平面（complex plane）** | 一个平面，在其中 $z = p + qi$ 表示点 $(p, q)$，实部沿水平轴，虚部沿垂直轴。 | [15.7](module_15_ZH.html#complex) |
| **分量（component）** | 向量 $\langle a_1, a_2, a_3\rangle$ 的一个数 $a_1, a_2, a_3$：从 $A(x_1, y_1, z_1)$ 到 $B(x_2, y_2, z_2)$ 的向量有分量 $x_2 - x_1$，$y_2 - y_1$，$z_2 - z_1$。向量场的分量函数为 $P$，$Q$，$R$。 | [16.4](module_16_ZH.html#components), [20.1](module_20_ZH.html#fields) |
| **复合（composition）** | $f \circ g$，函数 $(f \circ g)(x) = f\big(g(x)\big)$。它的定义域是 $x$ 中属于 $g$ 定义域的那些值，使得 $g(x)$ 属于 $f$ 的定义域。 | [1.5](module_01_ZH.html#composition) |
| **计算图（computational graph）** | 一个计算的图，每个输入和每个中间结果对应一个节点，每个节点指向直接动手计算的节点：它的子节点；动手计算的节点是它的父节点。每条箭头携带一个局部导数。 | [17.8](module_17_ZH.html#backpropagation) |
| **凹向上（concave up）** | $f$的图像在开区间 $I$ 上向上凹，当 $f$ 可导，如果 $f'$ 在 $I$ 上递增；向下凹如果 $f'$ 递减。向上凹的图像位于其切线之上。 | [8.4](module_08_ZH.html#concavity) |
| **凹凸性检验（concavity test）** | 如果 $f''(x) > 0$ 对于开区间 $x$ 中的每一个 $I$，$f$ 的图像在 $I$ 上向上凹；如果 $f''(x) < 0$，则向下凹。 | [8.4](module_08_ZH.html#concavity) |
| **条件数（condition number）** | (1) $\abs{xf'(x)/f(x)}$，计算 $f(x)$ 乘以 $x$ 的相对误差的因子。 (2) 对于碗 $\tfrac12(ax^2 + cy^2)$，$0 < a \le c$，比值 $\kappa = c/a$；当该比值较大时，梯度下降较慢。 | [7.3](module_07_ZH.html#errors), [18.6](module_18_ZH.html#ill-conditioning) |
| **条件收敛（conditional convergence）** | 若 $\sum a_n$ 条件收敛，即它收敛但 $\sum \abs{a_n}$ 发散。重新排列这样的级数可以改变其和。 | [14.8](module_14_ZH.html#absolute), [14.8](module_14_ZH.html#rearrangements) |
| **条件概率（conditional probability）** | $P(A \mid B) = \dfrac{P(A \text{ and } B)}{P(B)}$，对于 $P(B) > 0$：在 $A$ 发生的场合中 $B$ 发生的概率。 | [12.9](module_12_ZH.html#exponential-distribution) |
| **共轭（conjugate）** | 相同的两个项之间符号相反：$\sqrt{x} + 3$ 是 $\sqrt{x} - 3$ 的共轭。将一个分数的分子和分母同时乘以它，可以有理化包含平方根的差。 | [2.5](module_02_ZH.html#rationalise) |
| **连通（connected）** | 如果一个区域中的任意两点都可以用其中的一条分段光滑曲线连接，则该区域是连通的。 | [20.3](module_20_ZH.html#conservative) |
| **保守场（conservative field）** | 一个向量场 $\vb{F} = \nabla f$ 对于某个函数 $f$，其势函数。在一个开连通区域中，一个连续的向量场是保守场，当且仅当其沿任意路径的线积分与路径无关，当且仅当其在每一条闭合曲线上的积分都为 0。 | [20.3](module_20_ZH.html#conservative) |
| **常数倍法则（constant multiple rule）** | 如果 $f$ 在 $x$ 处可导，且 $c$ 是一个常数，则 $(cf)'(x) = c\,f'(x)$。 | [4.5](module_04_ZH.html#sum-rule) |
| **积分常数（constant of integration）** | 在一般原函数或不定积分中的任意常数 $C$，$\int f(x)\,dx = F(x) + C$。 | [10.1](module_10_ZH.html#antiderivatives) |
| **常数法则（constant rule）** | 常数函数的导数为 0：$\dfrac{d}{dx}(c) = 0$。 | [4.5](module_04_ZH.html#power-rule) |
| **约束（constraint）** | 联系优化问题变量的方程 $g(x, y) = c$。 | [18.4](module_18_ZH.html#lagrange) |
| **连续性法则（continuity laws）** | 如果 $f$ 和 $g$ 在 $a$ 处连续，那么 $f + g$、$f - g$、$cf$、$fg$ 和 $f/g$（如果 $g(a) \ne 0$）也连续。连续函数的复合也是连续的。 | [3.2](module_03_ZH.html#laws) |
| **连续（continuous）** | $f$ 在 $a$ 处连续，如果 $\lim_{x\to a} f(x) = f(a)$：$f(a)$ 有定义，极限存在且两者相等。如果在区间内每一点都连续，则称其在该区间连续，若在端点处只需从区间一侧连续即可。第 17 模块定义了二元函数的连续性。 | [3.1](module_03_ZH.html#continuity), [3.1](module_03_ZH.html#one-sided), [17.2](module_17_ZH.html#continuity) |
| **连续复利（continuous compounding）** | 每一时刻都在计入利息，对应于每年计息 $n$ 次、并令 $n \to \infty$ 所得的极限。在年利率为 100% 时，1 英镑增至 $\lim_{n\to\infty}(1 + 1/n)^n = e$ 英镑。 | [6.1](module_06_ZH.html#compound-interest) |
| **右连续（continuous from the right）** | $f$在$a$处右侧连续，如果$\lim_{x\to a^+} f(x) = f(a)$，并且在左侧连续如果$\lim_{x\to a^-} f(x) = f(a)$。 | [3.1](module_03_ZH.html#one-sided) |
| **等高线（contour lines）** | 地图上连接相同海拔高度的点的线。等温线连接温度相等的点，等压线连接气压相等的点。 | [17.1](module_17_ZH.html#level-curves) |
| **逆否命题（contrapositive）** | 对于从$P$到$Q$的蕴含，等价于从$Q$的失败到$P$的失败的蕴含。由于可导性蕴含连续性，不连续性排除了可导性。 | [4.4](module_04_ZH.html#continuity) |
| **收敛（converge）** | 不正确定积分收敛，如果其定义极限存在为有限数。数列收敛，如果它有一个极限$L$，即一个数。级数收敛，如果其部分和数列收敛。任何不收敛的都发散。 | [12.8](module_12_ZH.html#infinite-intervals), [14.1](module_14_ZH.html#limit), [14.3](module_14_ZH.html#partial-sums) |
| **凸（convex）** | 一个图像向上凹的函数，在优化和机器学习中称为凸函数；一个图像向下凹的函数称为凹函数。 | [6.1](module_06_ZH.html#base-e), [8.4](module_08_ZH.html#concavity) |
| **尖角（corner）** | 一个点，其两侧导数都存在但不同，例如 $\abs{x}$ 在 0 处：那里不存在唯一的切线。 | [4.4](module_04_ZH.html#failures) |
| **精确到小数点后 $d$ 位（correct to d decimal places）** | 数值 $\tilde x$ 是 $r$ 的近似值，若 $\abs{r - \tilde x} < 0.5 \times 10^{-d}$，则精确到 $d$ 位小数。 | [7.4](module_07_ZH.html#newton) |
| **余弦相似度（cosine similarity）** | 两个向量之间夹角的余弦，$\dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}$，搜索引擎和语言模型用它来衡量两个文档或词语的相似程度。 | [16.5](module_16_ZH.html#angles) |
| **遮盖法（cover-up method）** | 对于 $Q(x) = (x - r_1)\cdots(x - r_n)$ 具有不同的 $r_k$ 和 $P$ 且次数小于 $n$ 的情况：在 $P/Q$ 的部分分式中，常数项 $x - r_k$ 是 $P(r_k)$ 除以其他因子在 $r_k$ 处的乘积，通过覆盖 $x - r_k$ 得到。 | [11.4](module_11_ZH.html#linear-factors) |
| **临界数（critical number）** | 函数 $f$ 的定义域内使 $f'(c) = 0$ 或 $f'(c)$ 不存在的数 $c$。每个局部极值点都是临界点。有些书称其为临界点。 | [8.1](module_08_ZH.html#extrema) |
| **临界点（critical point）** | $f$ 的定义域中的一个点 $(a, b)$，其中 $\nabla f(a, b) = \vb{0}$，或者其中 $f_x$ 或 $f_y$ 不存在。每一个局部极值点都在一个临界点上。一些书上称函数的一元函数的临界数为临界点。 | [8.1](module_08_ZH.html#extrema), [18.1](module_18_ZH.html#critical-points) |
| **叉乘（cross product）** | $\vb{a}\times\vb{b} = \langle a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1\rangle$，用于空间向量。它与 $\vb{a}$ 和 $\vb{b}$ 正交，长度为 $\norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$（即它们所形成的平行四边形的面积），并且 $\vb{b}\times\vb{a} = -\vb{a}\times\vb{b}$。 | [16.6](module_16_ZH.html#cross) |
| **立方根（cube root）** | $\sqrt[3]{x}$，即立方等于 $x$ 的数，定义于每一个实数 $x$。第 $n$ 个根 $\sqrt[n]{x} = x^{1/n}$ 在 $x$ 为奇数时定义于每一个 $n$，在 $n$ 为偶数时定义于 $x \ge 0$。 | [1.4](module_01_ZH.html#roots) |
| **三次式（cubic）** | 一个三次多项式。 | [1.4](module_01_ZH.html#polynomials) |
| **旋度（curl）** | $\operatorname{curl}\vb{F} = \nabla\times\vb{F} = \langle R_y - Q_z,\ P_z - R_x,\ Q_x - P_y\rangle$对于 $\vb{F} = \langle P, Q, R\rangle$：在小环路周围的环量与面积之比，表示场在每一点的旋转程度。 | [20.5](module_20_ZH.html#curl-divergence), [20.5](module_20_ZH.html#meaning) |
| **曲率（curvature）** | $\kappa = \Big\lVert\dfrac{d\vb{T}}{ds}\Big\rVert = \dfrac{\norm{\vb{T}'(t)}}{\norm{\vb{r}'(t)}}$：曲线方向在单位距离内转变的速率。半径为 $R$ 的圆其曲率为 $1/R$。 | [16.8](module_16_ZH.html#projectiles) |
| **曲线绘制（curve sketching）** | 绘制 $f$ 在其定义域上的图像，包括截距、对称性、渐近线，以及 $f'$ 的符号图（上升、下降、局部极值）和 $f''$ 的符号图（凹凸性、拐点）。 | [8.5](module_08_ZH.html#sketching) |
| **尖点（cusp）** | 图像上的一个尖锐点，其中连续函数的差商在一边趋于 $\infty$，另一边趋于 $-\infty$，如 $x^{2/3}$ 在 0 处的情形；也指摆线两拱相交处。 | [4.4](module_04_ZH.html#failures), [16.2](module_16_ZH.html#tangents) |
| **摆线（cycloid）** | 一个半径为 $r$ 的轮子沿直线滚动时，轮缘上一点所描绘的曲线: $x = r(t - \sin t)$, $y = r(1 - \cos t)$. 每个拱形部分，对于 $t$ 从 0 到 $2\pi$，在一处尖点处与下一个拱形相接。 | [16.1](module_16_ZH.html#cycloid) |
| **柱坐标（cylindrical coordinates）** | $(r, \theta, z)$: 一个点在 $xy$ 平面上的投影的极坐标 $(r, \theta)$，以及它的高度 $z$. 在这些坐标中，$dV = r\,dz\,dr\,d\theta$. | [19.7](module_19_ZH.html#cylindrical) |
| **圆柱壳（cylindrical shell）** | 一个半径为 $x$，高度为 $f(x)$，厚度为 $\Delta x$ 的细长圆柱体，当一个细长条形绕 $y$ 轴旋转时形成。 | [12.4](module_12_ZH.html#shells) |

<div class="section-anchor" id=g-d></div>

### D

| 术语 | 含义 | 小节 |
|---|---|---|
| **阻尼（damping）** | 一个与速度成正比的阻力 $-cx'$，阻尼常数为 $c \ge 0$. 弹簧上一质量块若 $c^2 > 4mk$，则为过阻尼；若 $c^2 = 4mk$，则为临界阻尼（不发生振动）；若 $c^2 < 4mk$，则为欠阻尼（发生逐渐衰减的振动）。 | [13.8](module_13_ZH.html#second-order) |
| **递减（decreasing）** | (1) 一个函数 $f$ 在一个区间上是递减的，如果 $x_1 < x_2$ 中的任意两点总是满足 $f(x_1) > f(x_2)$。 (2) 一个数列 $(a_n)$ 是递减的，如果 $a_n \ge a_{n+1}$ 对于每一个 $n$ 都成立。 | [4.3](module_04_ZH.html#graph-of-derivative), [8.3](module_08_ZH.html#monotonic), [14.2](module_14_ZH.html#monotone) |
| **定积分（definite integral）** | 对于 $a < b$，若 $\int_a^b f(x)\,dx$ 存在，则 $I$ 是 $f$ 在 $[a, b]$ 上的黎曼和当分组范数趋于 0 时的极限值，无论采样点如何选择，只要该极限存在。对于 $f \ge 0$，它表示曲线下的面积；一般情况下，表示净面积。 | [9.1](module_09_ZH.html#area-distance), [9.4](module_09_ZH.html#definite-integral) |
| **次数（degree）** | 一个多项式 $a_nx^n + \dots + a_0$ 有 $a_n \ne 0$ 时，次数为 $n$。 | [1.4](module_01_ZH.html#polynomials) |
| **密度（density）** | 杆的单位长度质量，$\rho(x)$，或板的单位面积质量，$\rho(x, y)$。关于概率密度，请参见概率密度函数。 | [12.1](module_12_ZH.html#method), [19.5](module_19_ZH.html#mass) |
| **因变量（dependent variable）** | 函数的输出：$y$ 在 $y = f(x)$ 中，或 $z$ 在 $z = f(x, y)$ 中。 | [1.3](module_01_ZH.html#functions), [17.1](module_17_ZH.html#functions) |
| **导数（derivative）** | 函数 $f$ 在 $a$ 处的导数为 $f'(a) = \lim_{h\to0}\dfrac{f(a + h) - f(a)}{h}$，当这个极限作为实数存在时：即切线的斜率和瞬时变化率。导数函数 $f'$ 在每个 $x$ 处取这个值，其中 $f$ 是可导的。 | [1.1](module_01_ZH.html#two-problems), [4.2](module_04_ZH.html#derivative), [4.3](module_04_ZH.html#derivative-function) |
| **导数函数（derivative function）** | 在 $f'(x) = \lim_{h\to0}\dfrac{f(x + h) - f(x)}{h}$ 存在的每个 $x$ 点处，函数 $f'$ 的值。其定义域可能比 $f$ 的定义域小。 | [4.3](module_04_ZH.html#derivative-function) |
| **向量函数的导数（derivative of a vector function）** | $\vb{r}'(t) = \lim_{h\to0}\dfrac{\vb{r}(t + h) - \vb{r}(t)}{h} = \langle f'(t), g'(t), h'(t)\rangle$。在它不为 $\vb{0}$ 的地方，它是一个切向量，指示曲线的追踪方向。 | [16.8](module_16_ZH.html#velocity) |
| **反函数的导数（derivative of an inverse function）** | 如果 $f$ 在一个开区间上连续且单射，并且在 $a$ 处可导且导数为 $f'(a) \ne 0$，那么 $(f^{-1})'(b) = \dfrac{1}{f'(a)}$ 在 $b = f(a)$ 处为。 | [6.2](module_06_ZH.html#inverse-functions) |
| **行列式（determinant）** | 数组 $2 \times 2$ 的 $ps - qr$，其行分别为 $p, q$ 和 $r, s$。每个叉乘的分量都是一个；同样，Hessian 矩阵的行列式 $D$ 和雅可比行列式也是如此。 | [16.6](module_16_ZH.html#cross), [18.2](module_18_ZH.html#second-derivative-test), [19.8](module_19_ZH.html#change-of-variables) |
| **差商（difference quotient）** | $\dfrac{f(a + h) - f(a)}{h}$。其中 $h \ne 0$，$a$ 和 $a + h$ 都在 $f$ 的定义域内。它表示 $f$ 在 $a$ 与 $a + h$ 之间的平均变化率。 | [1.6](module_01_ZH.html#difference-quotient) |
| **可导（differentiable）** | $f$在 $a$ 处可导，如果 $f'(a)$ 存在且为实数。如果在开区间内每一点都可导，则称其在该开区间上可导；如果在 $[a, b]$ 上可导，并且在 $(a, b)$ 处的右导数和 $a$ 处的左导率存在，则称其在 $b$ 上可导。 | [4.2](module_04_ZH.html#derivative), [4.4](module_04_ZH.html#failures) |
| **可导蕴含连续（differentiable implies continuous）** | 如果 $f$ 在 $a$ 处可导，则 $f$ 在 $a$ 处连续。其逆命题不成立：$\abs{x}$ 在 0 处连续但不可导。二维情况也类似。 | [4.4](module_04_ZH.html#continuity), [17.4](module_17_ZH.html#differentiability) |
| **可微（二元函数）（differentiable (two variables)）** | 一个函数 $f$ 在 $(a, b)$ 处可导，如果 $f_x$ 和 $f_y$ 在那里存在，并且线性近似误差 $E$ 满足 $E(x, y)/\sqrt{(x - a)^2 + (y - b)^2} \to 0$ 当 $(x, y) \to (a, b)$ 很小时。在 $(a, b)$ 的一个邻域内存在且在 $(a, b)$ 处连续的偏导数可以保证这一点。 | [17.4](module_17_ZH.html#differentiability) |
| **微分（differential）** | 对于 $y = f(x)$ 且 $f$ 可导的情况，微分 $dx$ 是一个独立变量，任何实数，而微分 $dy = f'(x)\,dx$ 是沿切线方向的变化。当 $dx$ 很小时，$\Delta y \approx dy$。 | [7.2](module_07_ZH.html#differentials), [17.4](module_17_ZH.html#differential) |
| **微分方程（differential equation）** | 包含一个未知函数及其一个或多个导数的方程，例如 $y' = ky$。它的阶数是其中最高阶导数的阶数。 | [6.8](module_06_ZH.html#growth-decay), [10.2](module_10_ZH.html#initial-value), [13.1](module_13_ZH.html#what) |
| **微分形式（differential forms）** | 系列的基本定理在其中被归结为一个定理的语言，$\int_M d\omega = \int_{\partial M}\omega$。 | [20.8](module_20_ZH.html#next) |
| **微分几何（differential geometry）** | 使用微积分研究曲线和曲面：它们的弯曲程度以及它们上的最短路径。 | [20.8](module_20_ZH.html#next) |
| **微分（differentiation）** | 寻找导数。在积分中，它是微积分的两个过程之一，微积分基本定理说明它们互为逆运算。 | [1.1](module_01_ZH.html#about), [4.3](module_04_ZH.html#derivative-function) |
| **直接代入（direct substitution）** | 将自变量代入求极限。例如多项式 $p$ 的极限为 $\lim_{x\to a} p(x) = p(a)$；对于有理函数 $r$，当 $r(a)$ 有定义时，其极限为 $\lim_{x\to a} r(x) = r(a)$。这个方法适用于所有连续函数。 | [2.4](module_02_ZH.html#substitution) |
| **方向场（direction field）** | 一阶方程 $y' = F(t, y)$ 的图像：在网格上的每个点处，绘制一个斜率为 $F(t, y)$ 的短线段。解曲线与该场相切。也称为斜率场。 | [13.3](module_13_ZH.html#direction-fields) |
| **方向导数（directional derivative）** | 对于单位向量 $\vb{u} = \langle u_1, u_2\rangle$，$D_{\vb{u}} f(a, b) = \lim_{h\to0}\dfrac{f(a + hu_1, b + hu_2) - f(a, b)}{h}$：函数 $f$ 在 $\vb{u}$ 方向上的变化率。如果 $f$ 可微，则等于 $\nabla f(a, b)\cdot\vb{u}$。 | [17.6](module_17_ZH.html#gradient) |
| **圆盘法（disc method）** | 当区域 $y = f(x) \ge 0$，$a \le x \le b$ 绕 $x$ 轴旋转时，所扫出的立体的体积：$V = \pi\int_a^b f(x)^2\,dx$，加上半径为 $f(x)$ 的圆盘。 | [12.3](module_12_ZH.html#washers) |
| **间断（discontinuity）** | 一个数 $a$，在该点 $f$ 不连续，尽管 $f$ 在 $a$ 的一个开区间内定义，除了可能在 $a$ 处；$f$ 在 $a$ 处不连续。其类型有可去间断点、跳跃间断点、无穷间断点和振荡间断点。 | [3.1](module_03_ZH.html#continuity), [3.1](module_03_ZH.html#kinds) |
| **位移（displacement）** | 位置的净变化，$s(b) - s(a) = \int_a^b v(t)\,dt$。在空间中，从起点到终点的向量。 | [9.4](module_09_ZH.html#signed-area), [10.6](module_10_ZH.html#net-change-theorem), [16.4](module_16_ZH.html#arithmetic) |
| **点到平面的距离（distance from a point to a plane）** | 点 $(x_1, y_1, z_1)$ 到平面 $ax + by + cz = d$ 的距离是 $\dfrac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}}$。 | [16.7](module_16_ZH.html#planes) |
| **路程（distance travelled）** | $\int_a^b \abs{v(t)}\,dt$：运动物体所经过的路径长度，每次运动都计为正数。 | [9.4](module_09_ZH.html#signed-area) |
| **发散（diverge）** | 不收敛。如果对于每一个数 $M$，存在一个 $N$，使得对于所有 $n > N$，$a_n > M$，则序列 $a_n \to \infty$ 发散到无穷大。 | [12.8](module_12_ZH.html#infinite-intervals), [14.1](module_14_ZH.html#limit), [14.3](module_14_ZH.html#partial-sums) |
| **散度（divergence）** | $\operatorname{div}\vb{F} = \nabla\cdot\vb{F} = P_x + Q_y + R_z$：流体从小区域流出的速率，每单位体积（在平面中为每单位面积）。在正值处流体扩散，在负值处流体汇聚。 | [20.5](module_20_ZH.html#curl-divergence), [20.5](module_20_ZH.html#meaning) |
| **发散判别法（divergence test）** | 如果 $\sum a_n$ 收敛，则 $a_n \to 0$。因此，如果 $a_n$ 不趋于 0，级数发散；如果 $a_n \to 0$，该判别法无结论。 | [14.4](module_14_ZH.html#harmonic) |
| **散度定理（divergence theorem）** | 对于一个有界实体 $E$，其边界 $S$ 是分段光滑的向外指向边界，若 $\iint_S\vb{F}\cdot d\vb{S}=\iiint_E\operatorname{div}\vb{F}\,dV$ 在实体及其边界的邻域内具有连续的一阶偏导数，则 $\vb{F}$。 | [20.7](module_20_ZH.html#divergence-theorem) |
| **除以零（division by zero）** | 分母为零的商是未定义的。在确定公式定义域时，应排除所有使分母为零的输入。 | [1.3](module_01_ZH.html#domains) |
| **不存在（极限）（does not exist (limit)）** | 当没有数 $L$ 满足定义时，极限不存在，例如出现跳跃、无穷大或震荡的情况。无限极限在这种意义上也不存在。 | [2.1](module_02_ZH.html#idea), [2.3](module_02_ZH.html#no-limit) |
| **定义域（domain）** | 函数的输入集合。对于没有给出定义域的公式，惯例是所有使得公式给出实数的实数集合。 | [1.3](module_01_ZH.html#functions), [17.1](module_17_ZH.html#functions) |
| **点积（dot product）** | $\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3$，一个数，也称为标量积。对于非零向量夹角为 $\theta$，$0 \le \theta \le \pi$，$\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta$。 | [16.5](module_16_ZH.html#dot) |
| **倍角公式（double-angle formulas）** | $\sin 2u = 2\sin u\cos u$ 和 $\cos 2u = \cos^2 u - \sin^2 u = 1 - 2\sin^2 u$：两个角度相等的加法公式。 | [16.2](module_16_ZH.html#tangents) |
| **双重积分（double integral）** | $\iint_R f(x, y)\,dA$，双重黎曼和 $\sum\sum f(x_{ij}^*, y_{ij}^*)\,\Delta A$ 在矩形 $R$ 上，将矩形划分为 $m \times n$ 个小矩形，每个小矩形的面积为 $\Delta A$，当极限存在时。对于 $f \ge 0$，它是曲面 $z = f(x, y)$ 下的体积。 | [19.1](module_19_ZH.html#double-integrals) |
| **倍增时间（doubling time）** | 时间 $T = \dfrac{\ln 2}{k}$，在 $y = Ce^{kt}$ 以 $k > 0$ 增长时，无论初始值如何以及计时何时开始，使得其翻倍。 | [6.8](module_06_ZH.html#doubling) |
| **对偶数（dual number）** | 形式为 $a + b\varepsilon$ 的表达式，其中 $a$ 和 $b$ 是实数，新符号 $\varepsilon$ 满足 $\varepsilon^2 = 0$；$b$ 是它的 $\varepsilon$ 分量。对于多项式 $p$，有 $p(a + \varepsilon) = p(a) + p'(a)\,\varepsilon$，所以 $\varepsilon$ 分量携带导数信息。 | [5.8](module_05_ZH.html#autodiff) |
| **哑变量（dummy variable）** | 一个名称无关的变量，例如求和的索引或积分变量：$\int_a^x f(t)\,dt$ 和 $\int_a^x f(s)\,ds$ 是同一个数。 | [9.2](module_09_ZH.html#sigma), [10.3](module_10_ZH.html#area-function) |

<div class="section-anchor" id=g-e></div>

### E

| 术语 | 含义 | 小节 |
|---|---|---|
| **特征值（eigenvalues）** | 对于一个具有倾斜椭圆等高线的碗，其沿椭圆轴的曲率：Hessian 矩阵的特征值，这是《数学基础》系列研究的内容。 | [18.6](module_18_ZH.html#rescaling) |
| **面积元素（element of area）** | $dA$ 在 $\iint_R f\,dA$ 中，它回忆了小矩形的面积 $\Delta A$：$dA = dx\,dy$，或 $r\,dr\,d\theta$ 在极坐标中。 | [19.1](module_19_ZH.html#double-integrals), [19.4](module_19_ZH.html#polar) |
| **初等函数（elementary function）** | 一个由常数和 $x$ 组成的函数，通过有限次的加减乘除、幂运算、根运算、指数运算、对数运算、三角函数和反三角函数以及这些函数的复合来构造。 | [11.6](module_11_ZH.html#nonelementary) |
| **消去参数（eliminating the parameter）** | 将参数方程转化为 $x$ 和 $y$ 的一个方程：解出 $t$ 并代入另一个方程，或合并它们，如 $\cos^2 t + \sin^2 t = 1$ 所示。 | [16.1](module_16_ZH.html#eliminating) |
| **椭圆（ellipse）** | 一个沿两个垂直方向按不同比例拉伸的圆：$x = 3\cos t$，$y = 2\sin t$ 跟踪椭圆 $\dfrac{x^2}{9} + \dfrac{y^2}{4} = 1$。 | [16.1](module_16_ZH.html#parametric) |
| **椭圆积分（elliptic integral）** | 一种积分，例如椭圆的周长，其被积函数没有初等原函数，因此必须数值计算。 | [16.3](module_16_ZH.html#polar-area) |
| **ε–δ 极限定义（ε–δ definition of a limit）** | $\lim_{x\to a} f(x) = L$ 的意思是：对于每一个 $\varepsilon > 0$，存在一个 $\delta > 0$，使得对于每一个 $x$ 满足 $0 < \abs{x - a} < \delta$ 时，$\abs{f(x) - L} < \varepsilon$ 成立；$f$ 必须在 $a$ 的一个开区间内定义，除了可能在 $a$ 处。 | [2.7](module_02_ZH.html#precise), [2.7](module_02_ZH.html#proofs) |
| **平衡解（equilibrium solution）** | 一个常数解 $y = y^*$ of $y' = f(y)$: 一个具有 $f(y^*) = 0$ 的数。如果每个从足够接近它的解在 $t \to \infty$ 时趋近于它，则它是稳定的；如果有些从它附近开始的解会远离它，则它是不稳定的。如果 $f'$ 是连续的， $f'(y^*) < 0$ 使其稳定， $f'(y^*) > 0$ 使其不稳定。 | [13.3](module_13_ZH.html#equilibria) |
| **误差函数（error function）** | $\operatorname{erf} x = \dfrac{2}{\sqrt\pi}\displaystyle\int_0^x e^{-t^2}\,dt$，对于每一个实数 $x$: $e^{-x^2}$ 的一个原函数，乘以一个常数因子，它没有初等公式。正态概率用它来计算。 | [10.8](module_10_ZH.html#special-functions), [11.6](module_11_ZH.html#nonelementary), [12.9](module_12_ZH.html#normal) |
| **近似误差（error (of an approximation)）** | 精确值减去近似值。当近似值太小时为正，当近似值太大时为负。 | [4.7](module_04_ZH.html#differences), [7.3](module_07_ZH.html#errors), [9.3](module_09_ZH.html#riemann-sums) |
| **欧拉常数（Euler's constant）** | $\gamma \approx 0.5772$，是 $H_N - \ln N$ 当 $N \to \infty$ 趋近于无穷时的极限。 | [14.5](module_14_ZH.html#slow) |
| **欧拉公式（Euler's formula）** | $e^{i\theta} = \cos\theta + i\sin\theta$ 对于每一个实数 $\theta$。它解释了为什么特征方程的复根会给出具有 $\cos$ 和 $\sin$ 的解。 | [15.7](module_15_ZH.html#euler-formula), [15.7](module_15_ZH.html#oscillations) |
| **欧拉方法（Euler's method）** | 用于 $y' = F(t, y)$ 的数值方法 $y(t_0) = y_0$: 以步长 $h > 0$ 计算 $t_{n+1} = t_n + h$ 和 $y_{n+1} = y_n + h\,F(t_n, y_n)$，沿着方向场按直线步进。它具有 1 阶：在固定时间点的误差为 $O(h)$。 | [13.4](module_13_ZH.html#euler), [13.4](module_13_ZH.html#euler-error) |
| **欧拉数（Euler's number）** | $e = 2.718281828\ldots$，其指数函数在 $x = 0$ 处的斜率为 1：$\lim_{h\to0}\dfrac{e^h - 1}{h} = 1$。也 $e = \lim_{n\to\infty}(1 + 1/n)^n$。 | [1.4](module_01_ZH.html#exponential), [6.1](module_06_ZH.html#base-e), [6.3](module_06_ZH.html#two-routes) |
| **偶函数（even function）** | 定义域中对于每个 $x$ 都有 $f(-x) = f(x)$ 的函数。其图像在 $y$ 轴上是自身的镜像，且 $\int_{-a}^{a} f = 2\int_0^a f$。 | [1.4](module_01_ZH.html#polynomials), [9.6](module_09_ZH.html#symmetry) |
| **存在与唯一性定理（existence and uniqueness theorem）** | 如果 $F$ 和 $F_y$ 在包含 $(t_0, y_0)$ 的开矩形区域内连续，那么 $y' = F(t, y)$，$y(t_0) = y_0$ 在包含 $t_0$ 的某个开区间内有解，并且仅有一个解。方程 $ay'' + by' + cy = 0$，$a \ne 0$，在给定 $y(t_0)$ 和 $y'(t_0)$ 的条件下，有且仅有一个解，定义在所有 $t$ 上。 | [13.1](module_13_ZH.html#existence), [13.8](module_13_ZH.html#second-order) |
| **期望值（expected value）** | 随机变量 $X$ 的期望值，或均值，当积分收敛时为 $\mu = E(X) = \int_{-\infty}^{\infty} x\,f(x)\,dx$，其密度为 $f$。 | [12.9](module_12_ZH.html#expected-value) |
| **指数分布（exponential distribution）** | 密度 $f(x) = \lambda e^{-\lambda x}$ 对于 $x \ge 0$ 和 0 对于 $x < 0$，速率 $\lambda > 0$: 用于描述随机发生事件的等待时间的模型，这些事件以恒定的平均速率 $\lambda$ 发生。其均值为 $1/\lambda$，且无记忆性： $P(X > s + t \mid X > s) = P(X > t)$。 | [12.9](module_12_ZH.html#exponential-distribution) |
| **指数函数（exponential function）** | 一个以固定基数 $a > 0$ 为底的函数 $a^x$。对于 $a \ne 1$，其定义域为 $\R$，其值域为 $(0, \infty)$；*指数函数* 是 $e^x$。 | [1.4](module_01_ZH.html#exponential) |
| **指数增长与衰减（exponential growth and decay）** | 方程 $y' = ky$ 的解，对于常数 $k$：恰好是函数 $y = Ce^{kt}$，其中 $C = y(0)$。对于 $k > 0$，它们增长；对于 $k < 0$，它们衰减。模块 6 验证它们是解；模块 13 证明没有其他解。 | [6.8](module_06_ZH.html#growth-decay), [13.5](module_13_ZH.html#growth-decay) |
| **极值（extreme value）** | 最大值或最小值，绝对或局部；也称为极值（复数形式为 extrema）。 | [3.5](module_03_ZH.html#evt), [8.1](module_08_ZH.html#extrema), [18.1](module_18_ZH.html#critical-points) |
| **极值定理（Extreme Value Theorem）** | 一个函数在闭区间 $[a, b]$ 上连续，则在该区间上存在最大值和最小值。在两个变量的情况下：一个函数在闭合且有界的集合上连续，则在该集合上存在绝对最大值和绝对最小值。 | [3.5](module_03_ZH.html#evt), [18.3](module_18_ZH.html#absolute-extrema) |
| **极值（extremum）** | 最大值或最小值，绝对或局部；复数形式为 extrema。与极值相同。 | [8.1](module_08_ZH.html#extrema), [18.1](module_18_ZH.html#critical-points) |

<div class="section-anchor" id=g-f></div>

### F

| 术语 | 含义 | 小节 |
|---|---|---|
| **阶乘（factorial）** | $n! = 1 \cdot 2 \cdot 3 \cdots n$，将 $n$ 个物体排成一行的方式数目； $0! = 1$。 | [3.8](module_03_ZH.html#growth) |
| **费马原理（Fermat's principle）** | 光沿着耗时最少的路径传播。这暗示了折射定律。 | [8.6](module_08_ZH.html#optimisation) |
| **费马定理（Fermat's theorem）** | 如果 $f$ 在 $c$ 处有局部最大值或最小值且 $f'(c)$ 存在，则 $f'(c) = 0$。在两个变量的情况下：如果在局部极值 $(a, b)$ 处一阶偏导数存在，则 $\nabla f(a, b) = \vb{0}$。 | [8.1](module_08_ZH.html#extrema), [18.1](module_18_ZH.html#critical-points) |
| **有限差分法（finite differences）** | 在 $a$ 和 $a + h$ 处运行程序，再用所得结果计算差商来估计导数。只需知道程序即可求近似值。$h$ 取太大时截断误差较大，取太小时舍入误差较大。 | [5.8](module_05_ZH.html#autodiff) |
| **一阶导数检验（first derivative test）** | 若 $f$ 在临界数 $c$ 处连续，且 $f'$ 从正变负，则 $f(c)$ 是局部最大值；从负变正则是局部最小值；符号不变则无极值。如果相应符号在 $c$ 两侧、整个区间 $I$ 上都成立，则 $f(c)$ 是 $I$ 上的全局最大值或最小值。 | [8.3](module_08_ZH.html#first-derivative-test), [8.6](module_08_ZH.html#optimisation) |
| **一阶线性方程（first-order linear equation）** | 可以写成标准形式 $y' + p(t)\,y = q(t)$ 的一阶微分方程，其中 $p$ 和 $q$ 是仅关于 $t$ 的函数。 | [13.7](module_13_ZH.html#linear) |
| **浮点数（floating point）** | 一种计算机表示方法，用于存储有限数量的有效数字和一个指数。它会将无法精确表示的结果进行四舍五入。 | [2.8](module_02_ZH.html#cancellation) |
| **浮点数（floating-point number）** | 一台计算机对实数的快速近似，以二进制形式存储，并四舍五入到大约 16 位有效十进制数字。 | [1.7](module_01_ZH.html#first-session), [2.8](module_02_ZH.html#cancellation) |
| **向下取整函数（floor function）** | $\lfloor x\rfloor$是小于或等于 $x$ 的最大整数：$\lfloor 2.7\rfloor = 2$ 和 $\lfloor -2.7\rfloor = -3$。 | [3.1](module_03_ZH.html#one-sided) |
| **流线（flow line）** | 一条曲线 $\vb{r}(t)$，其速度始终等于其位置处的场 $\vb{r}'(t) = \vb{F}\big(\vb{r}(t)\big)$：粒子随流场运动的路径。也称为流线。 | [20.1](module_20_ZH.html#fields) |
| **通量（flux）** | 场穿过曲线或曲面的速率。在平面上的闭合曲线 $C$ 上，$\oint_C \vb{F}\cdot\vb{n}\,ds$ 用向外单位法向量 $\vb{n}$ 表示；在有向曲面 $S$ 上，$\iint_S \vb{F}\cdot d\vb{S} = \iint_S \vb{F}\cdot\vb{n}\,dS$。 | [20.4](module_20_ZH.html#flux-form), [20.6](module_20_ZH.html#flux) |
| **力（force）** | 一个向量，其方向为推或拉的方向，其长度表示强度，单位为牛顿。 | [16.4](module_16_ZH.html#arithmetic) |
| **前向差分（forward difference）** | $\dfrac{f(a + h) - f(a)}{h}$，对于步长 $h > 0$：对 $f'(a)$ 的估计，误差为 $O(h)$。后向差分 $\dfrac{f(a) - f(a - h)}{h}$ 用 $-h$ 代替 $h$。 | [4.7](module_04_ZH.html#differences) |
| **前向模式（forward mode）** | 自动微分方法将导数从输入向前传播，经过程序的每一步直到输出，如同双数所做的一样。 | [5.8](module_05_ZH.html#backprop) |
| **前向计算（forward pass）** | 在反向传播中，从输入计算到输出每个节点的值并保留这些值；随后的反向传播阶段则从输出向输入计算伴随变量。 | [17.8](module_17_ZH.html#backpropagation) |
| **富比尼定理（Fubini's theorem）** | 如果 $f$ 在矩形 $R = [a, b] \times [c, d]$ 上连续，则 $\iint_R f\,dA = \int_a^b\int_c^d f\,dy\,dx = \int_c^d\int_a^b f\,dx\,dy$：迭代积分的两种顺序给出双重积分。 | [19.2](module_19_ZH.html#iterated) |
| **函数（function）** | 一个规则 $f$，它将定义域 $x$ 中的每个数 $D$ 分配给恰好一个数 $f(x)$。 | [1.3](module_01_ZH.html#functions) |
| **二元函数（function of two variables）** | 一个规则 $f$，将平面集合 $D$ 中的每个有序对 $(x, y)$ 分配恰好一个实数 $f(x, y)$。一个三变量函数将空间集合中的每个点分配一个数 $f(x, y, z)$。 | [17.1](module_17_ZH.html#functions) |
| **曲线积分基本定理（fundamental theorem for line integrals）** | 如果 $f$ 在包含从 $A$ 到 $B$ 的分段光滑曲线 $C$ 的开区域上可微，并且梯度连续，则 $\int_C \nabla f\cdot d\vb{r} = f(B) - f(A)$。 | [20.3](module_20_ZH.html#conservative) |
| **微积分基本定理（Fundamental Theorem of Calculus）** | 对于 $f$ 在 $[a,b]$ 上连续，第 1 部分给出 $A'(x)=f(x)$ 在内部点处的 $A(x)=\int_a^x f(t)\,dt$。第 2 部分给出 $\int_a^b f(x)\,dx=F(b)-F(a)$，如果 $F$ 在 $[a,b]$ 上连续且 $F'=f$ 在 $(a,b)$ 上连续。 | [9.8](module_09_ZH.html#faster-way), [10.4](module_10_ZH.html#ftc1), [10.5](module_10_ZH.html#ftc2) |

<div class="section-anchor" id=g-g></div>

### G

| 术语 | 含义 | 小节 |
|---|---|---|
| **加百列号角（Gabriel's horn）** | 当 $y = 1/x$ 的图像 $x \ge 1$ 绕 $x$ 轴旋转时所扫出的立体：其体积是有限的 ($\pi$)，但表面积是无限的。 | [12.8](module_12_ZH.html#gabriel) |
| **高斯积分（Gaussian integral）** | $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$：引用于模块 12，用极坐标下的双重积分在模块 19 中证明。 | [12.9](module_12_ZH.html#normal), [19.4](module_19_ZH.html#gaussian) |
| **一般原函数（general antiderivative）** | $F(x) + C$, 其中 $F$ 是 $f$ 在一个区间上的一个原函数，而 $C$ 表示任意常数：在一个区间内，这些是 $f$ 的所有原函数。 | [10.1](module_10_ZH.html#antiderivatives) |
| **通解（general solution）** | 一个包含任意常数的公式，给出微分方程的所有解；任何一个特解是一个特定解。 | [13.1](module_13_ZH.html#what) |
| **等比数列（geometric sequence）** | 序列 $r^n$, $n = 0, 1, 2, \dots$，对于常数 $r$：如果 $-1 < r < 1$ 则收敛于 0，如果 $r = 1$ 则收敛于 1，如果 $r > 1$ 则发散到无穷大，如果 $r \le -1$ 则没有极限。 | [14.1](module_14_ZH.html#laws) |
| **等比级数（geometric series）** | $\sum_{n=0}^{\infty} ar^n = a + ar + ar^2 + \cdots$，首项为 $a \ne 0$，公比为 $r$。当 $\abs{r} < 1$ 时它收敛到 $\dfrac{a}{1 - r}$，当 $\abs{r} \ge 1$ 时发散。 | [14.3](module_14_ZH.html#geometric) |
| **梯度（gradient）** | 部分导数向量 $\nabla f = \langle f_x, f_y\rangle$，或在三个变量中的 $\langle f_x, f_y, f_z\rangle$。当它不等于 $\vb{0}$ 时，它指向最陡上升方向，其长度是最大上升速率，且与等值线垂直。 | [17.6](module_17_ZH.html#gradient) |
| **梯度下降（gradient descent）** | 一种最小化可微函数的方法：从一个起始点出发，重复 $x_{k+1} = x_k - \eta f'(x_k)$ 在一个变量上的操作，或 $\vb{x}_{k+1} = \vb{x}_k - \eta\nabla f(\vb{x}_k)$ 在多个变量上的操作，使用步长 $\eta > 0$。机器学习使用它来训练模型。 | [1.1](module_01_ZH.html#uses), [8.7](module_08_ZH.html#gradient-descent), [17.7](module_17_ZH.html#gradient-descent), [18.6](module_18_ZH.html#gradient-descent) |
| **梯度场（gradient field）** | 可微函数 $\nabla f$ 的向量场 $f$。 | [20.1](module_20_ZH.html#fields) |
| **图像（graph）** | 域 $(x, f(x))$ 中满足 $x$ 的点集 $f$：曲线 $y = f(x)$。对于两个变量的函数，点集 $(x, y, f(x, y))$ 表示空间中的曲面。 | [1.3](module_01_ZH.html#graphs), [17.1](module_17_ZH.html#graphs) |
| **格林定理（Green's theorem）** | 对于一个正向定向、分段光滑、简单闭合曲线 $C$ 包围 $D$，以及 $P$，$Q$ 在包含 $D$ 的开区域上具有连续的一阶偏导数：$\oint_C P\,dx + Q\,dy = \iint_D (Q_x - P_y)\,dA$。其流量形式为 $\oint_C \vb{F}\cdot\vb{n}\,ds = \iint_D (P_x + Q_y)\,dA$。 | [20.4](module_20_ZH.html#green), [20.4](module_20_ZH.html#flux-form) |
| **网格曲线（grid curve）** | 在参数曲面上的一条曲线，其中 $u$ 或 $v$ 保持不变；其切向量为 $\vb{r}_u$ 或 $\vb{r}_v$。 | [20.6](module_20_ZH.html#parametric-surfaces) |
| **增长得更慢（grows more slowly）** | 对于所有足够大的 $x$，若 $f$ 比 $g$ 增长得更慢，记作 $f \ll g$，当 $\lim_{x\to\infty} f(x)/g(x) = 0$。对于每一个 $p > 0$ 和 $a > 1$，$\ln x \ll x^p \ll a^x$，且 $a^n \ll n! \ll n^n$。 | [3.8](module_03_ZH.html#growth), [7.7](module_07_ZH.html#growth) |

<div class="section-anchor" id=g-h></div>

### H

| 术语 | 含义 | 小节 |
|---|---|---|
| **半角公式（half-angle identities）** | $\sin^2 x = \tfrac12(1 - \cos 2x)$ 与 $\cos^2 x = \tfrac12(1 + \cos 2x)$。 | [11.2](module_11_ZH.html#trig-integrals) |
| **半衰期（half-life）** | 使得 $y = Ce^{kt}$ 以 $k < 0$ 为初始值减半所需的时间 $T_{1/2} = \dfrac{\ln 2}{\abs{k}}$。 | [6.8](module_06_ZH.html#doubling) |
| **调和数（harmonic number）** | $H_N = 1 + \tfrac12 + \dots + \tfrac1N$，调和级数的第 $N$ 个部分和。 | [14.5](module_14_ZH.html#slow) |
| **调和级数（harmonic series）** | $\sum_{n=1}^{\infty} \dfrac1n = 1 + \tfrac12 + \tfrac13 + \cdots$。它发散，尽管其项趋于 0：其部分和增长类似于 $\ln N$。 | [14.4](module_14_ZH.html#harmonic-series) |
| **螺旋线（helix）** | 这条空间曲线 $\vb{r}(t) = \langle \cos t, \sin t, t\rangle$，缠绕在圆柱 $x^2 + y^2 = 1$ 上，每绕一圈向上爬升 $2\pi$：形状像一个弹簧。 | [16.8](module_16_ZH.html#motion) |
| **海森矩阵（Hessian matrix）** | 在某一点处，$f$ 的二阶偏导数所组成的方阵，其第一行是 $f_{xx}$ 和 $f_{xy}$，第二行是 $f_{yx}$ 和 $f_{yy}$；当 $f_{xy} = f_{yx}$ 时，其行列式为 $D = f_{xx}f_{yy} - f_{xy}^2$。 | [18.2](module_18_ZH.html#second-derivative-test) |
| **高阶导数（higher derivatives）** | 第二导数 $f'' = (f')'$，第三导数 $f''' = (f'')'$，一般地，第 $n$ 阶导数 $f^{(n)}$，是 $f^{(n-1)}$ 的导数，只要这些导数存在。在莱布尼茨记号中，$f''(x) = \dfrac{d^2y}{dx^2}$。 | [4.6](module_04_ZH.html#higher-derivatives) |
| **胡克定律（Hooke's law）** | 一根弹簧被拉伸 $x$ 米超过其自然长度时，拉回的力与 $x$ 成正比：$F(x) = kx$，其中弹簧常数 $k > 0$ 的单位是 N/m。 | [12.6](module_12_ZH.html#work), [13.8](module_13_ZH.html#second-order) |
| **水平渐近线（horizontal asymptote）** | 直线 $y = L$ 是函数 $f$ 图像的水平渐近线，如果 $\lim_{x\to\infty} f(x) = L$ 或 $\lim_{x\to-\infty} f(x) = L$。 | [3.7](module_03_ZH.html#limits-at-infinity) |
| **水平线测试（horizontal line test）** | 一个函数是单射的，当且仅当没有水平线与其图像相交超过一次。 | [1.5](module_01_ZH.html#inverse) |
| **霍纳法则（Horner's rule）** | 评估多项式从内到外进行，$c_0 + u\big(c_1 + u(c_2 + \cdots)\big)$：每个系数对应一次乘法和一次加法。 | [15.6](module_15_ZH.html#libraries) |
| **双曲线（hyperbola）** | 曲线 $x^2 - y^2 = 1$; 点 $(\cosh t, \sinh t)$ 沿其右支移动，当 $(\cos t, \sin t)$ 绕单位圆旋转时。 | [6.7](module_06_ZH.html#hyperbolic) |
| **双曲余弦（hyperbolic cosine）** | $\cosh x=(e^x+e^{-x})/2$对于任意实数 $x$。 | [6.7](module_06_ZH.html#hyperbolic) |
| **双曲函数（hyperbolic functions）** | $\sinh x = \dfrac{e^x - e^{-x}}{2}$，$\cosh x = \dfrac{e^x + e^{-x}}{2}$ 和 $\tanh x = \dfrac{\sinh x}{\cosh x}$，对于每个实数 $x$：双曲正弦、余弦和正切。$\cosh^2 x - \sinh^2 x = 1$。 | [6.7](module_06_ZH.html#hyperbolic) |
| **双曲正弦（hyperbolic sine）** | $\sinh x=(e^x-e^{-x})/2$对于任意实数 $x$。 | [6.7](module_06_ZH.html#hyperbolic) |
| **双曲正切（hyperbolic tangent）** | $\tanh x=\sinh x/\cosh x$对于任意实数 $x$。 | [6.7](module_06_ZH.html#hyperbolic) |

<div class="section-anchor" id=g-i></div>

### I

| 术语 | 含义 | 小节 |
|---|---|---|
| **病态的（ill-conditioned）** | 一个函数在其最小值附近的等高线是长而细的椭圆（一个大的条件数）：梯度下降法会在其上来回震荡并缓慢收敛。 | [18.6](module_18_ZH.html#ill-conditioning) |
| **虚数单位（imaginary unit）** | 数 $i$ 与 $i^2 = -1$。 | [15.7](module_15_ZH.html#complex) |
| **隐函数求导（implicit differentiation）** | 对 $x$ 和 $y$ 中的等式，例如 $x^2 + y^2 = 25$，以 $x$ 为变量进行求导，将 $y$ 视为 $x$ 的函数，应用链式法则，然后解出 $\dfrac{dy}{dx}$。 | [6.4](module_06_ZH.html#implicit) |
| **隐函数定理（implicit function theorem）** | 如果 $F$ 在 $(a, b)$ 附近连续可导，且 $F(a, b) = 0$ 和 $F_y(a, b) \ne 0$ 存在，则在 $(a, b)$ 附近，曲线 $F(x, y) = 0$ 是一个可导函数 $y(x)$ 的图像，其导数为 $\dfrac{dy}{dx} = -\dfrac{F_x}{F_y}$。 | [17.5](module_17_ZH.html#implicit) |
| **反常积分（improper integral）** | 一个积分区间为无穷大，或被积函数在区间内某点无界的情况，定义为普通积分的极限：$\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx$，依此类推。如果极限存在且为有限数，则积分收敛，否则发散。 | [12.8](module_12_ZH.html#improper), [12.8](module_12_ZH.html#infinite-intervals), [12.8](module_12_ZH.html#unbounded) |
| **递增（increasing）** | (1) 一个函数 $f$ 在一个区间上是递增的，如果 $x_1 < x_2$ 中的任意两点总是满足 $f(x_1) < f(x_2)$；一些书将这种情况称为严格递增。 (2) 一个数列 $(a_n)$ 是递增的，如果对于每一个 $n$，都有 $a_n \le a_{n+1}$，因此允许相邻项相等。 | [4.3](module_04_ZH.html#graph-of-derivative), [8.3](module_08_ZH.html#monotonic), [14.2](module_14_ZH.html#monotone) |
| **单调性判定（increasing/decreasing test）** | 设 $f$ 在区间 $I$ 上连续，并在其内部点（非端点）处可导。如果在这些点上 $f' > 0$，则 $f$ 在 $I$ 上递增；如果 $f' < 0$，则递减。 | [8.3](module_08_ZH.html#monotonic) |
| **不定积分（indefinite integral）** | $\int f(x)\,dx$，函数 $f$ 在一个区间上的不定积分：$\int f(x)\,dx = F(x) + C$ 表示 $F'(x) = f(x)$ 在该区间上成立。定积分是一个数；不定积分是一个函数族。 | [10.6](module_10_ZH.html#indefinite) |
| **路径无关（independent of the path）** | 如果一条线积分仅依赖于曲线的两个端点，则该线积分与路径无关，这适用于每一个连续保守场。 | [20.3](module_20_ZH.html#conservative) |
| **独立随机变量（independent random variables）** | 随机变量 $X$ 和 $Y$，其密度分别为 $f_1$ 和 $f_2$，联合密度是它们的乘积 $f_1(x)\,f_2(y)$。 | [19.5](module_19_ZH.html#joint-densities) |
| **自变量（independent variable）** | 函数的输入：$x$ 在 $y = f(x)$ 中，或 $x$ 和 $y$ 在 $z = f(x, y)$ 中。 | [1.3](module_01_ZH.html#functions), [17.1](module_17_ZH.html#functions) |
| **未定式（indeterminate form）** | 一种极限形式，单独的形式无法决定其极限：$0/0$，$\infty/\infty$，$0\cdot\infty$，$\infty - \infty$，$1^\infty$，$0^0$ 和 $\infty^0$。洛必达法则处理前两种，其余形式可转化为它们。 | [2.5](module_02_ZH.html#zero-over-zero), [7.5](module_07_ZH.html#lhopital), [7.6](module_07_ZH.html#other-forms) |
| **求和索引（index of summation）** | 字母 $i$ 在 $\sum_{i=m}^{n} a_i$ 中。它是一个哑变量：$\sum_{i=1}^{5} i^2$ 和 $\sum_{k=1}^{5} k^2$ 是同一个数。序列的索引是其项 $a_n$ 的 $n$。 | [9.2](module_09_ZH.html#sigma), [14.1](module_14_ZH.html#sequences) |
| **归纳步骤（inductive step）** | 归纳证明的第二步：当陈述对 $k$ 成立时，它也对 $k + 1$ 成立。 | [Ex. 5.10](module_05_ZH.html#ex-5-10), [9.2](module_09_ZH.html#power-sums) |
| **无穷间断（infinite discontinuity）** | 一个间断点 $a$，其中从至少一侧来看，$f(x)$ 变得并保持大于你任意命名的数，或小于任意数：一个无限单侧极限。 | [3.1](module_03_ZH.html#kinds) |
| **无穷极限（infinite limit）** | $\lim_{x\to a} f(x) = \infty$ 表示对于每一个数 $M$，$f(x) > M$ 对于足够接近 $a$ 的每一个 $x \ne a$ 都成立；$-\infty$ 同样如此。这样的极限作为数值是不存在的：$\infty$ 描述了它为何不存在。 | [2.3](module_02_ZH.html#no-limit), [3.6](module_03_ZH.html#infinite-limits) |
| **拐点（inflection point）** | 图像上的一点 $(c, f(c))$，其中 $f$ 连续，且图像从向上凹变为向下凹，或从向下凹变为向上凹。如果 $f''(c)$ 在该点存在，则为 0，但 $f''(c) = 0$ 并不充分。 | [8.4](module_08_ZH.html#concavity) |
| **初始条件（initial condition）** | 微分方程的解在某一点必须取的值，例如 $y(t_0) = y_0$；一个二阶方程还需要 $y'(t_0) = v_0$。 | [10.2](module_10_ZH.html#initial-value), [13.1](module_13_ZH.html#what) |
| **初始值问题（initial value problem）** | 一个微分方程及其初始条件，例如 $F'(x) = f(x)$ 在一个区间内具有 $F(x_0) = y_0$。对于二阶方程，这些条件给出 $y(t_0)$ 和 $y'(t_0)$。 | [10.2](module_10_ZH.html#initial-value), [13.1](module_13_ZH.html#what) |
| **内层函数（inner function）** | 在一个复合函数 $f\big(g(x)\big)$ 中，先应用函数 $g$；$f$ 是外部函数。 | [1.5](module_01_ZH.html#composition) |
| **瞬时变化率（instantaneous rate of change）** | 导数 $f'(a)$，以 $f$ 每单位 $x$ 为单位：平均变化率在更短区间上的极限。 | [4.2](module_04_ZH.html#derivative) |
| **瞬时速率（instantaneous speed）** | 某一时刻的速度：平均速度在更短时间区间上的极限值。模块 4 将其定义为瞬时速度的绝对值。 | [1.6](module_01_ZH.html#shrinking), [4.1](module_04_ZH.html#tangents) |
| **可积（integrable）** | 函数 $f$ 在 $[a, b]$ 上可积，如果其在该区间上的定积分存在。每一个连续函数都是可积的，每一个只有有限个间断点的有界函数也是可积的。模块 19 定义了矩形区域上的可积性。 | [9.4](module_09_ZH.html#definite-integral), [19.1](module_19_ZH.html#double-integrals) |
| **积分（integral）** | 曲线下方的面积，通过细长矩形和的极限来找到；作为定积分被精确化。不定积分是广义的原函数。 | [1.1](module_01_ZH.html#two-problems), [9.4](module_09_ZH.html#definite-integral), [10.6](module_10_ZH.html#indefinite) |
| **积分判别法（integral test）** | 如果 $f$ 在 $[1, \infty)$ 和 $a_n = f(n)$ 上连续、正且递减，则 $\sum a_n$ 和 $\int_1^\infty f(x)\,dx$ 要么都收敛，要么都发散。从任意起始索引 $k$ 也是如此。 | [14.5](module_14_ZH.html#integral-test) |
| **被积函数（integrand）** | 函数 $f(x)$ 在 $\int_a^b f(x)\,dx$ 中。 | [9.4](module_09_ZH.html#definite-integral) |
| **积分因子（integrating factor）** | 对于 $y' + p(t)y = q(t)$，函数 $\mu = e^{P}$，其中 $P$ 是 $p$ 的一个原函数：乘以它会使左边变为 $(\mu y)'$，因此 $y = \dfrac{1}{\mu}\Big(\int \mu q\,dt + C\Big)$。 | [13.7](module_13_ZH.html#linear) |
| **积分（integration）** | 求积分：对 $f$ 积分就是求它的定积分或不定积分。 | [1.1](module_01_ZH.html#about), [10.6](module_10_ZH.html#indefinite) |
| **分部积分（integration by parts）** | $\int u\,dv = uv - \int v\,du$，即 $\int f(x)\,g'(x)\,dx = f(x)\,g(x) - \int f'(x)\,g(x)\,dx$，当 $f$ 和 $g$ 有连续导数时：这是乘积法则的逆运算。对于定积分，$\int_a^b fg' = \big[fg\big]_a^b - \int_a^b f'g$。 | [11.1](module_11_ZH.html#parts), [11.1](module_11_ZH.html#definite-parts) |
| **截距（intercept）** | 直线 $y = mx + b$ 与 $y$ 轴相交时的高度 $b$。 | [1.4](module_01_ZH.html#linear) |
| **内部点（interior point）** | 集合 $R$ 中的一个点 $P$，使得以 $P$ 为中心的某个开圆盘完全包含于 $R$ 中。 | [18.3](module_18_ZH.html#absolute-extrema) |
| **介值定理（Intermediate Value Theorem）** | 如果 $f$ 在 $[a, b]$ 上连续，且 $N$ 是严格介于 $f(a)$ 和 $f(b)$ 之间的任意数，则存在 $f(c) = N$ 至少一个 $c$ 属于 $(a, b)$。 | [3.3](module_03_ZH.html#ivt) |
| **区间（interval）** | 实数的一个集合，例如 $[a, b]$，$(a, b)$，$[a, b)$ 或 $[a, \infty)$：两个端点之间的所有数，或超过一个端点的所有数。方括号表示端点属于该区间，圆括号表示端点不属于该区间。 | [1.3](module_01_ZH.html#intervals) |
| **收敛区间（interval of convergence）** | 所有使得幂级数收敛的点 $x$ 的集合：从 $a - R$ 到 $a + R$ 的区间，每个端点是否包含需单独检验。 | [15.1](module_15_ZH.html#convergence) |
| **反函数（inverse function）** | 对于一个单射的 $f$，其定义域为 $D$，值域为 $R$，存在一个函数 $f^{-1}$，其定义域为 $R$，值域为 $D$，使得 $f^{-1}(y) = x$ 恰当当 $f(x) = y$。其图像为函数 $f$ 在直线 $y = x$ 上的反射。 | [1.5](module_01_ZH.html#inverse), [6.2](module_06_ZH.html#inverse-functions) |
| **反双曲正弦函数（inverse hyperbolic sine）** | $\sinh$ 的反函数，其在 $\R$ 上严格递增：$\operatorname{arsinh} x = \ln\big(x + \sqrt{x^2 + 1}\big)$。 | [例 6.10](module_06_ZH.html#ex-6-10) |
| **平方反比场（inverse square field）** | 一种如重力场 $\vb{F} = -\dfrac{GMm}{\norm{\vb{r}}^3}\,\vb{r}$，指向原点，其大小与 $1/\norm{\vb{r}}^2$ 成正比：距离两倍远，引力为原来的四分之一。 | [20.1](module_20_ZH.html#fields) |
| **反三角函数（inverse trigonometric functions）** | $\arcsin x$ 是 $y$ 在 $[-\pi/2, \pi/2]$ 中带有 $\sin y = x$，对于 $-1 \le x \le 1$；$\arccos x$ $y$ 在 $[0, \pi]$ 中带有 $\cos y = x$，对于 $-1 \le x \le 1$；以及 $\arctan x$ $y$ 在 $(-\pi/2, \pi/2)$ 中带有 $\tan y = x$，对于每个实数 $x$。 | [6.5](module_06_ZH.html#inverse-trig) |
| **不可约二次多项式（irreducible quadratic）** | 一个二次 $x^2 + px + q$ 具有 $p^2 < 4q$（负判别式）：它没有实数零点，因此没有实数线性因子。 | [11.4](module_11_ZH.html#repeated-factors) |
| **等斜线（isocline）** | 一个方向场中斜率 $F(t, y)$ 保持不变的曲线。 | [13.3](module_13_ZH.html#direction-fields) |
| **迭代（iterate）** | 重复方法（如牛顿法）所产生的 $x_0, x_1, x_2, \dots$ 中的一个数。 | [7.4](module_07_ZH.html#newton) |
| **累次积分（iterated integral）** | 一个积分的积分，例如 $\int_a^b\int_c^d f(x, y)\,dy\,dx$，从内向外计算：内积分将外变量视为常数（部分积分）。 | [19.2](module_19_ZH.html#iterated) |

<div class="section-anchor" id=g-j></div>

### J

| 术语 | 含义 | 小节 |
|---|---|---|
| **雅可比行列式（Jacobian）** | 对于 $x = x(u, v)$，$y = y(u, v)$ 具有连续的一阶偏导数，行列式 $\dfrac{\partial(x, y)}{\partial(u, v)} = x_uy_v - x_vy_u$：变换对小区域的放大倍数。 | [19.8](module_19_ZH.html#change-of-variables) |
| **加加速度（jerk）** | 加速度的变化率，$j(t) = a'(t) = s'''(t)$：电梯突然启动或停止时你所感受到的冲击。 | [4.6](module_04_ZH.html#motion) |
| **联合密度（joint density）** | 一个积分在整个平面上等于 1 的函数 $f(x, y) \ge 0$。随机变量 $(X, Y)$ 具有联合密度 $f$，如果对于每个区域 $D$，$P\big((X, Y) \in D\big) = \iint_D f\,dA$。 | [19.5](module_19_ZH.html#joint-densities) |
| **焦耳（joule）** | 功和能量的单位：1 牛顿的力作用在 1 米的距离上完成 1 焦耳（J）的功。 | [12.6](module_12_ZH.html#work), [16.5](module_16_ZH.html#work) |
| **跳跃间断（jump discontinuity）** | 一种间断点，其中单侧极限都存在但不相等。 | [3.1](module_03_ZH.html#kinds) |

<div class="section-anchor" id=g-l></div>

### L

| 术语 | 含义 | 小节 |
|---|---|---|
| **余项的拉格朗日形式（Lagrange form (of the remainder)）** | $R_n(x) = \dfrac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}$，对于某些 $c$ 介于 $a$ 和 $x$ 之间：泰勒定理中的余项。 | [15.5](module_15_ZH.html#taylor-theorem) |
| **拉格朗日乘子（Lagrange multipliers）** | 如果 $f$，限制在曲线 $g(x, y) = c$ 上，在一个点 $\nabla g \ne \vb{0}$（具有连续的一阶偏导数）处有局部极值，则 $\nabla f = \lambda\nabla g$ 处于某个数 $\lambda$，这是拉格朗日乘数。对于两个约束 $g = c$ 和 $h = d$，$\nabla f = \lambda\nabla g + \mu\nabla h$。 | [18.4](module_18_ZH.html#lagrange), [18.4](module_18_ZH.html#two-constraints) |
| **拉格朗日恒等式（Lagrange's identity）** | $\norm{\vb{a}\times\vb{b}}^2 = \norm{\vb{a}}^2\norm{\vb{b}}^2 - (\vb{a}\cdot\vb{b})^2$. | [16.6](module_16_ZH.html#cross) |
| **薄片（lamina）** | 一个薄而扁平的板。 | [12.7](module_12_ZH.html#centre-of-mass), [19.5](module_19_ZH.html#mass) |
| **余弦定理（law of cosines）** | 在一个三角形中，边分别为 $p$、$q$ 和 $s$，其中 $\gamma$ 是 $p$ 和 $q$ 之间的角：$s^2 = p^2 + q^2 - 2pq\cos\gamma$。 | [16.5](module_16_ZH.html#dot) |
| **对数的法则（laws of logarithms）** | 对于 $x > 0$、$y > 0$ 和每个实数 $r$：$\ln(xy) = \ln x + \ln y$、$\ln(x/y) = \ln x - \ln y$ 和 $\ln(x^r) = r\ln x$；对于 $\log_a$ 同样成立。 | [1.4](module_01_ZH.html#logarithms) |
| **学习率（learning rate）** | 机器学习中对梯度下降的步长 $\eta$ 的称呼。在碗形 $\tfrac12(ax^2 + cy^2)$ 上，具有 $0 < a \le c$ 时，梯度下降在 $\eta < 2/c$ 时精确收敛。 | [8.7](module_08_ZH.html#gradient-descent), [18.6](module_18_ZH.html#gradient-descent) |
| **最小二乘法（least squares）** | 用 $y = mx + b$ 拟合数据点 $(x_i, y_i)$ 通过最小化平方误差之和 $E(m, b) = \sum (y_i - mx_i - b)^2$。最小化直线称为最小二乘线，或回归线；它满足正规方程，并通过均值点 $(\bar x, \bar y)$。 | [18.5](module_18_ZH.html#least-squares) |
| **上确界性质（least upper bound property）** | 每个非空且有上界的实数集合都有一个最小上界：一个不大于其他所有上界的上界。分析学以这种形式陈述实数的完备性。 | [14.2](module_14_ZH.html#mct) |
| **左极限（left-hand limit）** | $\lim_{x\to a^-} f(x) = L$。只要让 $x < a$ 从左侧足够接近 $a$，就能使 $f(x)$ 任意接近 $L$；$f$ 必须在某个区间 $(c, a)$ 上有定义。也称为从左侧趋近时的极限。 | [2.2](module_02_ZH.html#one-sided) |
| **左端点和（left sum）** | 当 $n$ 被划分为宽度为 $\Delta x = (b - a)/n$ 且分割点为 $x_i = a + i\,\Delta x$ 的等宽子区间时：左和为 $L_n = \sum_{i=1}^{n} f(x_{i-1})\,\Delta x$，右和为 $R_n = \sum_{i=1}^{n} f(x_i)\,\Delta x$。 | [9.3](module_09_ZH.html#riemann-sums) |
| **莱布尼茨记号（Leibniz's notation）** | 写出 $y = f(x)$ 的导数作为 $\dfrac{dy}{dx}$，这表明哪个变量变化，并回忆其极限所基于的商 $\dfrac{\Delta y}{\Delta x}$。它不是一个分数，但通常表现得像一个分数。 | [4.3](module_04_ZH.html#notation) |
| **向量的长度（length (of a vector)）** | $\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2 + a_3^2}$，也称为其模或范数。 | [16.4](module_16_ZH.html#components) |
| **等值曲线（level curve）** | 曲线 $f(x, y) = k$，对于常数 $k$ 在 $f$ 的值域内。对于等间距的 $k$ 值绘制的水平曲线并标注数值，是 $f$ 的等高线图。 | [17.1](module_17_ZH.html#level-curves) |
| **等值集（level set）** | 函数取给定值的所有输入的集合。根据函数和值的不同，它可能是一个曲线、一个曲面、一个点或另一个集合。 | [17.1](module_17_ZH.html#level-curves) |
| **等值曲面（level surface）** | 一个三变量函数的曲面 $f(x, y, z) = k$，对于一个常数 $k$。 | [17.1](module_17_ZH.html#level-surfaces) |
| **洛必达法则（L'Hôpital's rule）** | 如果 $f$ 和 $g$ 在 $a$ 附近可导，且 $g'(x) \ne 0$ 存在，而 $f/g$ 在 $a$ 处具有形式 $0/0$ 或 $\infty/\infty$，那么 $\lim\dfrac{f(x)}{g(x)} = \lim\dfrac{f'(x)}{g'(x)}$ 在第二个极限存在或为 $\pm\infty$ 时成立。它适用于单侧极限，并且作为 $x \to \pm\infty$；模块 8 证明了这一点。 | [7.5](module_07_ZH.html#the-rule), [8.2](module_08_ZH.html#consequences) |
| **LIATE** | 在分部积分中选择 $u$ 的一个粗略指南：选取列表中排在前面的因子作为 $u$，列表为对数、反三角函数、代数、三角函数、指数。 | [11.1](module_11_ZH.html#choosing) |
| **极限（limit）** | $\lim_{x\to a} f(x) = L$ 如果 $f(x)$ 可以通过取 $x$ 足够接近 $a$（但不等于 $a$）来使得其尽可能接近 $L$；$f$ 必须在 $a$ 周围的开区间上定义，除了可能在 $a$ 处。第 2.7 节使用 $\varepsilon$ 和 $\delta$ 对此进行了精确描述；第 17.2 节将其扩展到两个变量的情况。 | [1.1](module_01_ZH.html#two-problems), [2.1](module_02_ZH.html#idea), [2.7](module_02_ZH.html#precise), [17.2](module_17_ZH.html#limits) |
| **无穷远处的极限（limit at infinity）** | $\lim_{x\to\infty} f(x) = L$ 表示通过让 $x$ 足够大，可以使 $f(x)$ 任意接近 $L$； $f$ 必须在区间 $(c, \infty)$ 上定义。对于 $x \to -\infty$， $x$ 是负数且绝对值很大。 | [3.7](module_03_ZH.html#limits-at-infinity) |
| **极限比较判别法（limit comparison test）** | 如果 $f$ 和 $g$ 在 $f(x)/g(x) \to L$ 作为 $x \to \infty$ 的情况下连续且非负，其中 $0 < L < \infty$，则 $\int_a^\infty f$ 和 $\int_a^\infty g$ 同时收敛或同时发散。对于级数 $a_n > 0$、 $b_n > 0$ 和 $a_n/b_n \to L$， $0 < L < \infty$： $\sum a_n$ 和 $\sum b_n$ 同时收敛或同时发散。 | [12.8](module_12_ZH.html#comparison), [14.6](module_14_ZH.html#limit-comparison) |
| **二元函数的极限（limit in two variables）** | 对于在 $(a, b)$周围的一个圆盘上定义的 $f$，除了可能在 $(a, b)$处：$\lim_{(x, y)\to(a, b)} f(x, y) = L$如果对于每一个 $\varepsilon > 0$，存在一个 $\delta > 0$，使得对于每一个 $(x, y)$在距离 $(a, b)$ 0到 $\delta$之间的点，都有 $\abs{f(x, y) - L} < \varepsilon$。如果 $f$沿着两条路径趋近于不同的数值，则极限不存在。 | [17.2](module_17_ZH.html#limits) |
| **极限法则（limit laws）** | 如果 $\lim f = L$ 和 $\lim g = M$，则 $f + g$、$f - g$、$cf$、$fg$、$f/g$（当 $M \ne 0$ 时）、$f^n$ 和 $\sqrt[n]{f}$ 的极限分别是 $L + M$、$L - M$、$cL$、$LM$、$L/M$、$L^n$ 和 $\sqrt[n]{L}$（对于偶数 $n$，如果 $L > 0$）。序列遵循相同的法则。 | [2.4](module_02_ZH.html#laws), [14.1](module_14_ZH.html#laws) |
| **数列的极限（limit of a sequence）** | $\lim_{n\to\infty} a_n = L$ 的意思是：对于每一个 $\varepsilon > 0$，存在一个数 $N$，使得对于每一个 $n > N$，都有 $\abs{a_n - L} < \varepsilon$。然后数列收敛于 $L$，记作 $a_n \to L$；否则它发散。 | [14.1](module_14_ZH.html#limit) |
| **积分限（limits of integration）** | $\int_a^b f(x)\,dx$ 中的数 $a$（下限）和 $b$（上限）：区间的端点，不是 模块 2 意义下的极限。将它们颠倒会改变积分的符号，并且 $\int_c^c f(x)\,dx = 0$。 | [9.4](module_09_ZH.html#definite-integral) |
| **曲线积分（line integral）** | 函数 $f$ 沿着光滑曲线 $C$ 由 $\vb{r}(t)$ 追踪， $a \le t \le b$: $\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\norm{\vb{r}'(t)}\,dt$。对于向量场： $\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt$，力 $\vb{F}$ 所做的功；当 $C$ 被反向追踪时，其符号发生变化。 | [20.2](module_20_ZH.html#line-integrals), [20.2](module_20_ZH.html#work) |
| **线性近似（linear approximation）** | 使用 $f(x) \approx L(x)$，在 $a$ 处的线性近似，用于 $x$ 接近 $a$；也称为切线近似。其误差即使与 $x - a$ 相比也很小。 | [7.2](module_07_ZH.html#linear-approximation), [17.4](module_17_ZH.html#tangent-planes) |
| **线性函数（linear function）** | 函数 $f(x) = mx + b$ 与常数 $m$ 和 $b$。其图像是斜率为 $m$、截距为 $b$ 的一条直线。 | [1.4](module_01_ZH.html#linear) |
| **常系数线性齐次方程（linear homogeneous equation with constant coefficients）** | 一个二阶方程 $ay'' + by' + cy = 0$，其常数为 $a \ne 0$、 $b$ 和 $c$。“齐次”是因为右边为 0。 | [13.8](module_13_ZH.html#second-order) |
| **线性化（linearisation）** | $f$在 $a$ 处的线性化是 $L(x) = f(a) + f'(a)(x - a)$，其图像为在 $(a, f(a))$ 处的切线；$f$ 在 $a$ 处必须可导。在两个变量的情况下，$L(x, y) = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$。 | [7.2](module_07_ZH.html#linear-approximation), [17.4](module_17_ZH.html#tangent-planes) |
| **线性（linearity）** | 常数倍和和法则共同说明：导数是线性的，$(cf + g)' = cf' + g'$。积分也是线性的：$\int_a^b \big(cf(x) + g(x)\big)\,dx = c\int_a^b f(x)\,dx + \int_a^b g(x)\,dx$。 | [4.5](module_04_ZH.html#sum-rule), [9.5](module_09_ZH.html#properties) |
| **刘维尔定理（Liouville's theorem）** | 一个定理（本系列中引用而非证明），描述初等原函数应具有的形式。由此可知，$e^{-x^2}$、$\dfrac{\sin x}{x}$ 和 $\dfrac{1}{\ln x}$ 没有初等原函数。 | [11.6](module_11_ZH.html#nonelementary) |
| **李萨如曲线（Lissajous curve）** | 当 $x$ 和 $y$ 以不同频率振荡时所描绘的曲线，例如 $x = \sin 2t$、$y = \sin 3t$。它出现在由两个正弦波驱动的示波器上，可以通过它读出两个频率的比值。 | [16.1](module_16_ZH.html#cycloid) |
| **局部导数（local derivative）** | 在计算图的箭头上，表示子节点相对于箭头来源节点的偏导数。 | [17.8](module_17_ZH.html#backpropagation) |
| **局部最大值（local maximum）** | $f(c)$ 是 $f$ 的局部最大值，如果对于某个包含 $c$ 且位于定义域内的开区间内的所有 $x$，均有 $f(c) \ge f(x)$；局部最小值则有 $f(c) \le f(x)$。在本系列中，定义域的端点永远不会是局部极值。在两个变量的情况下，开区间被开圆盘所替代。 | [8.1](module_08_ZH.html#extrema), [18.1](module_18_ZH.html#critical-points) |
| **对数（logarithm）** | 对于 $a > 0$ 满足 $a \ne 1$ 和 $x > 0$，$\log_a x$ 是满足 $a^y = x$ 的数 $y$：$\log_a$ 是 $a^x$ 的反函数。 | [1.4](module_01_ZH.html#logarithms) |
| **对数求导法（logarithmic differentiation）** | 对由乘积、商和幂组成的函数 $y$ 求导时，先取 $\ln\abs{y}$，再利用对数法则展开，接着对 $y'/y$（左边）求导，最后乘以 $y$。这种方法在 $y \ne 0$ 时有效。 | [6.6](module_06_ZH.html#real-powers) |
| **对数积分（logarithmic integral）** | $\operatorname{Li} x = \displaystyle\int_2^x \frac{dt}{\ln t}$，对于 $x > 1$。 | [11.6](module_11_ZH.html#nonelementary) |
| **逻辑斯蒂方程（logistic equation）** | $y' = ry\Big(1 - \dfrac{y}{K}\Big)$, 以常数 $r > 0$ 和 $K > 0$ 为参数：一种接近指数增长的速率，当 $y$ 较小时，随着 $y$ 接近环境承载量 $K$ 而逐渐减缓至 0。其解 $y = \dfrac{K}{1 + \frac{K - y_0}{y_0}e^{-rt}}$ 跟随 S 形的逻辑斯蒂曲线。 | [13.6](module_13_ZH.html#logistic) |
| **损失（loss）** | 在机器学习中，表示模型在训练数据上的误差度量，作为模型参数的函数；通过梯度下降训练以最小化该度量。 | [8.7](module_08_ZH.html#gradient-descent), [17.7](module_17_ZH.html#gradient-descent) |
| **低通滤波器（low-pass filter）** | 一种电路，如电阻和电容串联，用于滞后输入的缓慢变化并平滑快速变化。 | [13.7](module_13_ZH.html#linear) |

<div class="section-anchor" id=g-m></div>

### M

| 术语 | 含义 | 小节 |
|---|---|---|
| **机器精度（machine epsilon）** | 1 与下一个更大的浮点数之间的差距：即 $2^{-52} \approx 2.2 \times 10^{-16}$。 | [4.7](module_04_ZH.html#rounding) |
| **梅钦公式（Machin's formula）** | $\dfrac{\pi}{4} = 4\arctan\dfrac15 - \arctan\dfrac{1}{239}$：在这些小数上展开 $\arctan$ 的级数，可快速计算 $\pi$。 | [15.6](module_15_ZH.html#constants) |
| **麦克劳林级数（Maclaurin series）** | 关于 $a = 0$ 的泰勒级数；其部分和为麦克劳林多项式。 | [15.4](module_15_ZH.html#taylor-series) |
| **边际成本（marginal cost）** | 成本函数 $C'(q)$ 关于成本 $C(q + 1) - C(q)$ 增加一个单位的导数。平均成本为 $C(q)/q$，即单位成本。 | [8.6](module_08_ZH.html#optimisation) |
| **数学归纳法（mathematical induction）** | 一种证明对每个自然数 $n \ge 1$ 成立的陈述 $P(n)$ 的方法：证明基础情形 $P(1)$，以及归纳步骤，即 $P(k)$ 推出 $P(k + 1)$ 对于每个 $k \ge 1$。然后 $P(1)$, $P(2)$, $P(3)$, … 就像倒下的多米诺骨牌一样依次成立。 | [Ex. 5.10](module_05_ZH.html#ex-5-10), [9.2](module_09_ZH.html#power-sums), [14.2](module_14_ZH.html#recursive) |
| **matplotlib** | 一个用于绘图的免费 Python 包。 | [1.7](module_01_ZH.html#python) |
| **矩阵（matrix）** | 一个由数字组成的矩形数组。 | [18.2](module_18_ZH.html#second-derivative-test) |
| **最大功率传输定理（maximum power transfer theorem）** | 一个负载的电阻与其自身相匹配时，电源会将其最大功率传输给该负载。 | [Ex. 8.7](module_08_ZH.html#ex-8-7) |
| **最大值（maximum value）** | $f(c)$ 是在集合 $I$ 上 $f$ 的最大值，如果 $c$ 属于 $I$ 并且对于每个 $x$ 属于 $I$，$f(x) \le f(c)$；最小值 $f(d)$ 用 $f(x) \ge f(d)$ 替代。 | [3.5](module_03_ZH.html#evt), [8.1](module_08_ZH.html#extrema) |
| **均方误差（mean squared error）** | 模型在其数据点上的误差平方的平均值：机器学习中常见的损失函数。 | [例 8.9](module_08_ZH.html#ex-8-9) |
| **拉格朗日中值定理（Mean Value Theorem）** | 若 $f$ 在 $[a, b]$ 上连续、在 $(a, b)$ 上可微，则 $(a, b)$ 内有一点 $c$，满足 $f'(c) = \dfrac{f(b) - f(a)}{b - a}$。在这一点，瞬时变化率等于平均变化率。 | [8.2](module_08_ZH.html#mvt) |
| **积分中值定理（Mean Value Theorem for integrals）** | 若 $f$ 在 $[a, b]$ 上连续，其中 $a < b$，则 $[a, b]$ 中存在一点 $c$，满足 $f(c) = \dfrac{1}{b - a}\int_a^b f(x)\,dx$。也就是说，$f$ 在这一点取得其平均值。 | [9.7](module_09_ZH.html#average) |
| **中点法则（midpoint rule）** | 中点求和 $M_n = \sum_{i=1}^{n} f(\bar x_i)\,\Delta x$，将区间 $n$ 等分为 $\bar x_i$ 个子区间，每个子区间的中点为 $i$，用于近似积分。如果 $f''$ 在 $[a, b]$ 上连续且 $\abs{f''} \le K$，其误差不超过 $\dfrac{K(b - a)^3}{24n^2}$。 | [9.3](module_09_ZH.html#riemann-sums), [11.7](module_11_ZH.html#numerical) |
| **最小最大多项式（minimax polynomial）** | 一种系数被调整以在区间上均匀分布误差的多项式，使得其精度达到泰勒多项式的精度，但次数更低。数学库中使用它们。 | [15.6](module_15_ZH.html#libraries) |
| **最小值（minimum value）** | $f(d)$ 是集合 $I$ 上 $f$ 的最小值，如果 $d$ 属于 $I$ 且对于每个 $x$ 属于 $I$，都有 $f(x) \ge f(d)$。 | [3.5](module_03_ZH.html#evt), [8.1](module_08_ZH.html#extrema) |
| **模型（model）** | 用数学术语对现实情况的简化描述，通常是微分方程，当其假设成立时效果较好。写出它就是建模。 | [13.2](module_13_ZH.html#models) |
| **模（modulus）** | $\abs{z} = \sqrt{p^2 + q^2}$ 对 $z = p + qi$：复平面上 $z$ 到 0 的距离。 | [15.7](module_15_ZH.html#complex) |
| **矩（moment）** | 质量 $m_i$ 在 $x_i$ 处关于原点的力矩是 $\sum m_ix_i$。密度为 $\rho$ 的平板，关于 $y$ 轴的力矩为 $M_y = \iint_D x\rho\,dA$，关于 $x$ 轴的力矩为 $M_x = \iint_D y\rho\,dA$。 | [12.7](module_12_ZH.html#centre-of-mass), [19.5](module_19_ZH.html#mass) |
| **转动惯量（moments of inertia）** | 对于密度为 $\rho$ 的薄片：$I_x = \iint_D y^2\rho\,dA$ 关于 $x$ 轴，$I_y = \iint_D x^2\rho\,dA$ 关于 $y$ 轴，以及 $I_0 = I_x + I_y$ 关于原点。 | [19.5](module_19_ZH.html#inertia) |
| **单调（monotone）** | 如果一个数列是递增的（$a_n \le a_{n+1}$ 对于每一个 $n$），或者递减的（$a_n \ge a_{n+1}$ 对于每一个 $n$），则该数列是单调的。 | [14.2](module_14_ZH.html#monotone) |
| **单调收敛定理（Monotone Convergence Theorem）** | 一个递增且有上界的数列收敛，其极限至少等于每一个项，且不超过每一个上界；同样，一个递减且有下界的数列也收敛。这是实数完备性的一种形式。 | [14.2](module_14_ZH.html#mct) |
| **蒙特卡洛方法（Monte Carlo method）** | 用大量随机试验估计积分或概率。其误差仅像 $1/\sqrt{N}$ 那样减小，但它在许多维度上都能工作，而网格需要太多点。 | [19.5](module_19_ZH.html#joint-densities) |

<div class="section-anchor" id=g-n></div>

### N

| 术语 | 含义 | 小节 |
|---|---|---|
| **自然对数（natural logarithm）** | $\ln x$以 $e$ 为底的对数：对于 $x > 0$，$\ln x = y$ 表示 $e^y = x$。在 Python 中，`math.log` 和 SymPy 的 `log` 是 $\ln$。 | [1.4](module_01_ZH.html#logarithms), [6.1](module_06_ZH.html#base-e) |
| **净面积（net area）** | 在 $f$ 的图像与 $x$ 轴之间，轴上方的面积减去轴下方的面积，就是 $\int_a^b f(x)\,dx$ 度量的量，也称有符号面积。 | [9.4](module_09_ZH.html#signed-area) |
| **净变化定理（net change theorem）** | 如果 $F'$ 在 $[a, b]$ 上连续，那么 $\int_a^b F'(x)\,dx = F(b) - F(a)$：变化率的积分等于净变化。 | [10.6](module_10_ZH.html#net-change-theorem) |
| **牛顿冷却定律（Newton's law of cooling）** | 物体温度 $T$ 变化率与其与周围恒定温度 $T_s$ 的差成正比：$T' = -k(T - T_s)$ 与 $k > 0$。其解为 $T(t) = T_s + \big(T(0) - T_s\big)e^{-kt}$。 | [13.2](module_13_ZH.html#models), [13.5](module_13_ZH.html#cooling) |
| **牛顿法（Newton's method）** | 为可微 $f$ 解 $f(x) = 0$：选择 $x_0$ 并计算 $x_{n+1} = x_n - \dfrac{f(x_n)}{f'(x_n)}$ 同时 $f'(x_n) \ne 0$。每一步都沿着 $x$ 轴的切线进行。也称为牛顿-拉夫森方法。 | [7.4](module_07_ZH.html#newton) |
| **非零除以零（non-zero over zero）** | 如果分子趋于一个非零数，而分母趋于零，则商的绝对值趋于无穷大。分母在趋近于零时的符号决定了商的符号，同时与分子的符号一起确定。 | [3.6](module_03_ZH.html#infinite-limits) |
| **分割的范数（norm (of a partition)）** | 分区的子区间最大宽度 $P$，写作 $\norm{P}$。 | [9.4](module_09_ZH.html#definite-integral) |
| **正态分布（normal distribution）** | 密度为 $\dfrac{1}{\sigma\sqrt{2\pi}}\,e^{-(x - \mu)^2/(2\sigma^2)}$ 的分布，均值为 $\mu$，标准差为 $\sigma > 0$。正态随机变量落在其均值附近一个、两个和三个标准差范围内的概率分别约为 68%、95% 和 99.7%：即 68–95–99.7 规则。 | [12.9](module_12_ZH.html#normal) |
| **正规方程（normal equations）** | $\big(\sum x_i^2\big)m + \big(\sum x_i\big)b = \sum x_iy_i$ 和 $\big(\sum x_i\big)m + nb = \sum y_i$：最小二乘直线的方程 $\partial E/\partial m = \partial E/\partial b = 0$。当有至少两个不同的 $x_i$ 时，它们有且仅有一个解。 | [18.5](module_18_ZH.html#least-squares) |
| **法向量（normal vector）** | 与平面或曲面垂直的非零向量。通过点 $P_0$ 且法向量为 $\vb{n} = \langle a, b, c\rangle$ 的平面是 $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$；参数曲面的法向量为 $\vb{r}_u\times\vb{r}_v$。 | [16.7](module_16_ZH.html#planes), [20.6](module_20_ZH.html#parametric-surfaces) |
| **数值积分（numerical integration）** | 通过积分函数的值，使用中点、梯形或辛普森法则等方法近似计算积分；当没有初等原函数或积分函数仅通过测量获得时需要使用。 | [11.7](module_11_ZH.html#numerical) |
| **NumPy** | 一个用于数值数组计算的免费 Python 包。 | [1.7](module_01_ZH.html#python) |

<div class="section-anchor" id=g-o></div>

### O

| 术语 | 含义 | 小节 |
|---|---|---|
| **斜渐近线（oblique asymptote）** | 曲线 $y = mx + c$，与 $m \ne 0$ 相交，是函数 $f$ 图像的斜渐近线（或斜渐近线），如果 $f(x) - (mx + c) \to 0$ 当 $x \to \infty$ 或 $x \to -\infty$ 时成立。 | [3.7](module_03_ZH.html#oblique) |
| **奇函数（odd function）** | 一个函数，对于其定义域中的每个 $x$，都有 $f(-x) = -f(x)$。以原点为中心的半周旋转不会改变其图像，且 $\int_{-a}^{a} f = 0$。 | [1.4](module_01_ZH.html#polynomials), [9.6](module_09_ZH.html#symmetry) |
| **微积分基本定理的共同形式（the one pattern）** | 每个级数基本定理所说的：在一个区域上对导数求和，得到该区域边界上的值。微积分基本定理、线积分的基本定理、格林定理、斯托克斯定理和散度定理都是这种情况。 | [20.8](module_20_ZH.html#pattern) |
| **单侧极限（one-sided limit）** | 左极限或右极限。$\lim_{x\to a} f(x) = L$ 当且仅当在 $a$ 处的两个单侧极限都存在且等于 $L$ 时。 | [2.2](module_02_ZH.html#one-sided), [2.7](module_02_ZH.html#no-limit-proof) |
| **单射（one-to-one）** | 如果不同的输入总是给出不同的输出，则函数是单射的：$x_1 \ne x_2$ 推出 $f(x_1) \ne f(x_2)$。 | [1.5](module_01_ZH.html#inverse) |
| **开圆盘（open disc）** | 半径为 $r > 0$ 且中心在 $(a, b)$ 的开圆盘是所有满足 $(x, y)$ 的点 $(x - a)^2 + (y - b)^2 < r^2$ 的集合。 | [18.1](module_18_ZH.html#critical-points) |
| **开区间（open interval）** | $(a, b)$，对于 $a < b$：所有满足 $x$ 且不包含端点的数 $a < x < b$。 | [1.3](module_01_ZH.html#intervals) |
| **开区域（open region）** | 一个区域，其中每个点都有一个圆盘（在空间中为球体）位于该区域内。 | [20.3](module_20_ZH.html#conservative) |
| **优化（optimisation）** | 找到某个量的最大或最小值：将其表示为区间上的一元函数，找出临界点，并通过定理证明你已获得绝对极值。模块18处理多个变量的情况，包括有约束或无约束的情况。 | [8.6](module_08_ZH.html#optimisation), [18.4](module_18_ZH.html#lagrange) |
| **阶（微分方程的阶）（order (of a differential equation)）** | 方程中最高阶导数的阶数：$y' = ky$ 是一阶的，$my'' + ky = 0$ 是二阶的。 | [13.1](module_13_ZH.html#what) |
| **方法的阶（order (of a method)）** | 误差为 $O(h^p)$ 且没有更好的方法，其阶数为 $p$。向前差分法和欧拉方法的阶数为1，中心差分法的阶数为2，四阶龙格-库塔法的阶数为4。 | [4.7](module_04_ZH.html#truncation), [13.4](module_13_ZH.html#euler-error) |
| **增长阶（orders of growth）** | 比较函数在极限附近的增长情况。一个函数最终被另一个函数的常数倍所限制，用大O符号表示。比值趋于零则表示增长速率的严格分离。 | [3.8](module_03_ZH.html#growth) |
| **常微分方程（ordinary differential equation）** | 未知数是一个变量（通常为时间）的函数的微分方程 $t$。 | [13.1](module_13_ZH.html#what) |
| **方向（orientation）** | 参数化曲线随着 $t$ 增加时的走向。对于曲面，是在每个点上连续变化的单位法向量的选择，用来表示哪一侧为正方向。 | [16.1](module_16_ZH.html#parametric), [20.6](module_20_ZH.html#flux) |
| **定向曲面（oriented surface）** | 一个具有单位法向量 $\vb{n}$ 的曲面，在每个点上都有连续变化的单位法向量，以确定哪一侧为正方向。一个封闭曲面，通常是固体的整个边界，通常赋予外侧方向。 | [20.6](module_20_ZH.html#flux) |
| **正交（orthogonal）** | 垂直：$\vb{a}\cdot\vb{b} = 0$。零向量被认为与每一个向量正交。 | [16.5](module_16_ZH.html#dot) |
| **振荡间断点（oscillating discontinuity）** | 一种不可去除的间断点，包括跳跃或无穷间断点：至少有一个单侧极限不存在（不趋于无穷），例如当 $\sin\big(1/(x - 2)\big)$ 在接近 2 处在 $-1$ 和 1 之间摆动时。 | [3.1](module_03_ZH.html#kinds) |
| **外函数（outer function）** | 在复合函数 $f\big(g(x)\big)$ 中，最后应用的函数 $f$ 作用于内函数 $g$ 的值。 | [1.5](module_01_ZH.html#composition) |
| **外半径（outer radius）** | 在洗盘法中，距离轴到区域的较远边界 $R(x)$；内半径 $r(x)$ 是距离较近边界的距离。 | [12.3](module_12_ZH.html#washers) |
| **外法向单位向量（outward unit normal）** | 对于在平面上按逆时针方向描写的曲线，单位切向量顺时针旋转四分之一圈，指向区域外；对于闭合曲面，指向实体外的单位法向量。 | [20.4](module_20_ZH.html#flux-form), [20.6](module_20_ZH.html#flux) |

<div class="section-anchor" id=g-p></div>

### P

| 术语 | 含义 | 小节 |
|---|---|---|
| **$p$-积分（p-integrals）** | $\int_1^\infty \dfrac{dx}{x^p}$ 收敛到 $\dfrac{1}{p - 1}$，如果 $p > 1$，并且发散如果 $p \le 1$；$\int_0^1 \dfrac{dx}{x^p}$ 收敛到 $\dfrac{1}{1 - p}$，如果 $p < 1$，并且发散如果 $p \ge 1$。 | [12.8](module_12_ZH.html#p-integrals) |
| **$p$-级数（p-series）** | $\sum_{n=1}^{\infty} \dfrac{1}{n^p}$：如果 $p > 1$ 收敛，如果 $p \le 1$ 发散。 | [14.5](module_14_ZH.html#p-series) |
| **平行（parallel）** | 两个非零向量平行，如果其中一个向量是另一个的标量倍数。 | [16.4](module_16_ZH.html#arithmetic) |
| **参数（parameter）** | 自变量，通常 $t$，其值给出参数曲线的点 $\big(f(t), g(t)\big)$。 | [16.1](module_16_ZH.html#parametric) |
| **参数曲线（parametric curve）** | 当参数 $t$ 在一个区间内变化时，点 $\big(f(t), g(t)\big)$ 所描出的路径；$x = f(t)$，$y = g(t)$ 是它的参数方程。在 $[a, b]$ 上，它从初始点 $\big(f(a), g(a)\big)$ 开始，终止于终点 $\big(f(b), g(b)\big)$。 | [16.1](module_16_ZH.html#parametric) |
| **参数曲面（parametric surface）** | 当 $(u, v)$ 在 $uv$ 平面上的区域 $D$ 内取值时，点 $\vb{r}(u, v) = \langle x(u, v), y(u, v), z(u, v)\rangle$ 构成的集合。如果 $\vb{r}_u$ 与 $\vb{r}_v$ 连续，且 $\vb{r}_u\times\vb{r}_v \ne \vb{0}$，则参数化是光滑的，$D$ 的边界上可例外。 | [20.6](module_20_ZH.html#parametric-surfaces) |
| **参数化（parametrisation）** | 方程 $x = f(t)$，$y = g(t)$（或向量函数 $\vb{r}(t)$）描绘一条给定的曲线；对于曲面，是一个函数 $\vb{r}(u, v)$，其值填满该曲面。 | [16.1](module_16_ZH.html#parametric), [20.6](module_20_ZH.html#parametric-surfaces) |
| **偏导数（partial derivative）** | $f_x(a, b) = \lim_{h\to0}\dfrac{f(a + h, b) - f(a, b)}{h}$, 对 $x$ 求导，将 $y$ 保持固定；$f_y$ 保持 $x$ 固定。也可写作 $\dfrac{\partial f}{\partial x}$ 和 $\dfrac{\partial f}{\partial y}$。 | [13.1](module_13_ZH.html#existence), [17.3](module_17_ZH.html#partial-derivatives) |
| **偏微分方程（partial differential equation）** | 未知函数的偏导数之间的等式，例如热方程 $u_t = k\,u_{xx}$，带有 $k > 0$，或者拉普拉斯方程 $u_{xx} + u_{yy} = 0$。 | [17.3](module_17_ZH.html#higher), [20.8](module_20_ZH.html#next) |
| **部分分式（partial fractions）** | 将一个真分式表示为更简单分数的和，每个分母因子对应一个或多个分数：$\dfrac{A}{x - r}, \dots, \dfrac{A_k}{(x - r)^k}$ 对于因子 $(x - r)^k$，$\dfrac{Bx + C}{x^2 + px + q}, \dots$ 对于不可约二次因子。这些常数是唯一的。 | [11.4](module_11_ZH.html#partial-fractions), [11.4](module_11_ZH.html#repeated-factors) |
| **分部积分（partial integration）** | 以一个变量为积分变量，将其他变量视为常数进行积分，如同偏导数的求导方式。 | [19.2](module_19_ZH.html#iterated) |
| **部分和（partial sum）** | $S_N = a_1 + a_2 + \dots + a_N$，级数前 $N$ 项的和。 | [14.3](module_14_ZH.html#partial-sums) |
| **特解（particular solution）** | 微分方程的一个特解，相对于通解而言，通解给出所有解。 | [13.1](module_13_ZH.html#what) |
| **分割（partition）** | 对于 $a < b$，一个点的列表 $a = x_0 < x_1 < \dots < x_n = b$，将 $[a, b]$ 切分成 $n$ 个子区间 $[x_{i-1}, x_i]$，每个子区间的宽度为 $\Delta x_i = x_i - x_{i-1}$。 | [9.4](module_09_ZH.html#definite-integral) |
| **周期性（periodic）** | 定期重复：$\sin(\theta + 2\pi) = \sin\theta$ 和 $\cos(\theta + 2\pi) = \cos\theta$，因此正弦和余弦函数的周期为 $2\pi$；正切函数的周期为 $\pi$。 | [1.4](module_01_ZH.html#trig) |
| **相线（phase line）** | 一个 $y$ 轴的草图，带有箭头，向上表示 $f > 0$，向下表示 $f < 0$，这表明 $y' = f(y)$ 的每个解的走向。 | [13.3](module_13_ZH.html#equilibria) |
| **分段函数（piecewise function）** | 一个函数在其定义域的不同部分使用不同的公式，例如 $\abs{x}$。 | [1.3](module_01_ZH.html#piecewise) |
| **分段光滑路径（piecewise smooth path）** | 由有限多个光滑部分首尾相连组成的路径，每个部分有自己的参数区间。 | [20.2](module_20_ZH.html#line-integrals) |
| **点斜式方程（point-slope equation）** | $y - y_1 = m(x - x_1)$：通过点 $(x_1, y_1)$ 且斜率为 $m$ 的直线。 | [1.4](module_01_ZH.html#linear) |
| **极坐标（polar coordinates）** | 一个点的极坐标 $(r, \theta)$ 如果 $x = r\cos\theta$ 和 $y = r\sin\theta$：对于 $r > 0$，它是从原点（极点）的距离和从正 $x$ 轴（极轴）的角度，按逆时针方向测量。在极坐标中 $dA = r\,dr\,d\theta$。 | [16.3](module_16_ZH.html#polar), [19.4](module_19_ZH.html#polar) |
| **极坐标矩形（polar rectangle）** | 一个区域 $r_0 \le r \le r_1$，在极坐标中 $\alpha \le \theta \le \beta$。 | [19.4](module_19_ZH.html#polar) |
| **极点（pole）** | 极坐标中的原点；它是对于每一个 $\theta$ 的 $(0, \theta)$。极轴是正 $x$ 轴。 | [16.3](module_16_ZH.html#polar) |
| **多项式（polynomial）** | 一个函数 $p(x) = a_nx^n + \dots + a_1x + a_0$，其中 $n \ge 0$ 是一个整数，系数 $a_0, \dots, a_n$ 是常数。它的定义域是 $\R$。 | [1.4](module_01_ZH.html#polynomials) |
| **位置向量（position vector）** | 从原点到一点 $(a_1, a_2, a_3)$ 的向量，它是 $\langle a_1, a_2, a_3\rangle$。 | [16.4](module_16_ZH.html#components) |
| **正向定向（positively oriented）** | 在平面上一个简单的闭合曲线如果按逆时针方向绘制，且曲线所包围的区域在左侧，则称为正向定向。当你沿着一个定向曲面行走时，若曲面在你的左侧，则该曲面的边界是正向定向的，头部沿 $\vb{n}$ 方向。 | [20.4](module_20_ZH.html#green), [20.7](module_20_ZH.html#stokes) |
| **势函数（potential function）** | 一个函数 $f$ 与 $\nabla f = \vb{F}$；物理学家称 $U = -f$ 为势能。 | [20.3](module_20_ZH.html#conservative) |
| **幂函数（power function）** | 一个函数 $f(x) = x^n$。负幂是倒数，$x^{-n} = 1/x^n$，定义在 $x \ne 0$；分数幂是根。 | [1.4](module_01_ZH.html#polynomials) |
| **功率（物理）（power (physics)）** | 能量被使用或转移的速率，$P(t) = E'(t)$，以瓦特为单位；其积分 $\int_a^b P(t)\,dt$ 是在 $a$ 和 $b$ 之间所使用的能量。 | [10.6](module_10_ZH.html#net-change-theorem) |
| **幂法则（power rule）** | $\dfrac{d}{dx}x^n = nx^{n-1}$：对于每一个 $x$ 当 $n$ 是正整数（模块 4），对于 $x \ne 0$ 当 $n$ 是整数 $\le 0$（模块 5），以及对于 $x > 0$ 当 $n$ 是任意实数（模块 6）。 | [4.5](module_04_ZH.html#power-rule), [5.3](module_05_ZH.html#negative-powers), [6.6](module_06_ZH.html#real-powers) |
| **幂函数积分法则（power rule for antiderivatives）** | $\int x^n\,dx = \dfrac{x^{n+1}}{n + 1} + C$ 在 $(0, \infty)$ 上，对于每个实数 $n \ne -1$ 都成立。对于 $n = -1$，在任何不包含 0 的区间上 $\int \dfrac{dx}{x} = \ln\abs{x} + C$ 成立。 | [10.1](module_10_ZH.html#table) |
| **幂级数（power series）** | 以 $a$ 为中心、系数为常数 $c_n$ 的级数 $\sum_{n=0}^{\infty} c_n(x - a)^n$。在收敛的地方，其和是 $x$ 的函数。 | [15.1](module_15_ZH.html#power-series) |
| **概率（probability）** | 一个事件 $P(\text{event})$的概率是一个介于0到1之间的数：在长期重复试验中该事件发生的频率。1表示必然发生。 | [12.9](module_12_ZH.html#densities) |
| **概率密度函数（probability density function）** | 一个函数 $f$ 在 $f(x) \ge 0$ 处对每个 $x$ 和 $\int_{-\infty}^{\infty} f(x)\,dx = 1$ 都有定义。一个随机变量 $X$ 有密度 $f$，如果 $P(a \le X \le b) = \int_a^b f(x)\,dx$ 对所有 $a \le b$ 成立。 | [12.9](module_12_ZH.html#densities) |
| **乘积法则（product rule）** | 如果 $f$和 $g$在 $x$处可导，则 $fg$也可导，且导数为 $(fg)'(x) = f'(x)\,g(x) + f(x)\,g'(x)$。 | [5.2](module_05_ZH.html#rectangle) |
| **抛射运动（projectile motion）** | 在仅受重力作用下的运动，$\vb{a} = \langle 0, -g\rangle$. 以速度 $v_0$ 和角度 $\alpha$ 在水平地面上发射的物体，在飞行时间 $\dfrac{2v_0\sin\alpha}{g}$ 后落地，此时水平射程为 $\dfrac{v_0^2\sin 2\alpha}{g}$。 | [16.8](module_16_ZH.html#projectiles) |
| **真分式（proper rational function）** | 分式函数 $P(x)/Q(x)$ 中，分子 $P$ 的次数小于分母 $Q$ 的次数；否则为假分式，长除法可将其转化为一个多项式加上一个真分式。 | [11.4](module_11_ZH.html#partial-fractions) |
| **纯函数（pure function）** | 一个函数，其输出仅依赖于输入，并且不执行其他操作。数学函数是纯函数。 | [1.3](module_01_ZH.html#piecewise) |
| **勾股恒等式（Pythagorean identity）** | $\sin^2\theta + \cos^2\theta = 1$ 对于每一个 $\theta$，因为 $(\cos\theta, \sin\theta)$ 位于单位圆上。 | [1.4](module_01_ZH.html#trig) |

<div class="section-anchor" id=g-q></div>

### Q

| 术语 | 含义 | 小节 |
|---|---|---|
| **二次（quadratic）** | 次数为 2 的多项式，$ax^2 + bx + c$ 以 $a \ne 0$ 表示。 | [1.4](module_01_ZH.html#polynomials) |
| **二次收敛（quadratic convergence）** | 收敛方式为每一步的误差大致是前一步误差的平方乘以一个固定常数，使得每一步的正确数字数量大致翻倍。牛顿法在 $r$ 满足 $f'(r) \ne 0$ 且 $f'$ 和 $f''$ 在 $r$ 附近连续，并且 $x_0$ 足够接近 $r$ 时，以二次收敛方式收敛到根。 | [7.4](module_07_ZH.html#quadratic) |
| **数值积分（quadrature）** | 定积分的数值近似，例如中点法、梯形法则或辛普森法则。 | [11.7](module_11_ZH.html#numerical) |
| **商法则（quotient rule）** | 如果 $f$ 和 $g$ 在 $x$ 和 $g(x) \ne 0$ 处可导，则 $\Big(\dfrac{f}{g}\Big)'(x) = \dfrac{f'(x)\,g(x) - f(x)\,g'(x)}{g(x)^2}$。 | [5.3](module_05_ZH.html#quotient) |

<div class="section-anchor" id=g-r></div>

### R

| 术语 | 含义 | 小节 |
|---|---|---|
| **弧度（radian）** | 微积分中角度的单位：单位圆中心的角度，其对应的弧长为 $\theta$ 测量为 $\theta$ 弧度。因此 $180^\circ = \pi$ 弧度。 | [1.4](module_01_ZH.html#trig) |
| **收敛半径（radius of convergence）** | 使得幂级数 $\sum c_n(x - a)^n$ 在 $\abs{x - a} < R$ 处绝对收敛，在 $\abs{x - a} > R$ 处发散的数 $R$；如果仅在 $a$ 处收敛，则为 $R = 0$；如果对所有 $x$ 都收敛，则为 $R = \infty$。 | [15.1](module_15_ZH.html#convergence) |
| **随机变量（random variable）** | 一个值由偶然决定的量。如果它具有概率密度，则为连续型随机变量。 | [12.9](module_12_ZH.html#densities), [19.5](module_19_ZH.html#joint-densities) |
| **值域（range）** | (1) 当输入变量遍历定义域时，函数所有可能取值的集合。 (2) 投射物在水平地面上落地前飞行的水平距离。 | [1.3](module_01_ZH.html#functions), [17.1](module_17_ZH.html#functions), [16.8](module_16_ZH.html#projectiles) |
| **自变量约化（range reduction）** | 数学库计算 $\sin x$ 或 $e^x$ 的第一步：利用函数的对称性将 $x$ 替换为一个小数值，对于该小数值，多项式近似是准确的。 | [15.6](module_15_ZH.html#libraries) |
| **变化率（rate of change）** | 一个量相对于另一个量变化的快慢，例如速度。在区间上的变化率是平均变化率；在某一瞬间的变化率是瞬时变化率，即导数。 | [1.1](module_01_ZH.html#about), [1.6](module_01_ZH.html#rates), [4.2](module_04_ZH.html#derivative) |
| **比值判别法（ratio test）** | 如果 $a_n \ne 0$ 和 $\abs{a_{n+1}/a_n} \to \rho$，一个数或 $\infty$：对于 $\rho < 1$，$\sum a_n$ 绝对收敛；对于 $\rho > 1$ 或 $\rho = \infty$，它发散；对于 $\rho = 1$，该测试无法得出结论。 | [14.8](module_14_ZH.html#ratio) |
| **有理函数（rational function）** | 两个多项式 $\dfrac{p(x)}{q(x)}$ 的商，其中 $q$ 不为零多项式。其定义域是所有满足 $q(x) \ne 0$ 的 $x$ 的集合。 | [1.4](module_01_ZH.html#rational) |
| **实分析（real analysis）** | 研究通过 $\varepsilon$–$\delta$ 推理证明本系列引用的结果，例如极值定理和连续函数的可积性。 | [20.8](module_20_ZH.html#next) |
| **重排（rearrangement）** | 将级数的项以另一种顺序相加。 | [14.8](module_14_ZH.html#rearrangements) |
| **整流线性单元（ReLU）（rectified linear unit (ReLU)）** | 一个分段函数 $\operatorname{ReLU}(x) = \max(0, x)$：对于 $x < 0$ 为 0，对于 $x$ 为 $x \ge 0$。神经网络使用它。 | [1.3](module_01_ZH.html#piecewise) |
| **递推数列（recursive sequence）** | 一个由其首项和一个固定规则 $a_{n+1} = g(a_n)$ 定义的序列，该规则根据前一项计算后续各项。 | [14.2](module_14_ZH.html#recursive) |
| **降阶公式（reduction formula）** | 一个将具有整数参数的积分 $n$ 表示为相同积分但参数更小的 $n$ 的公式，例如 $\int \sin^n x\,dx = -\dfrac{\sin^{n-1}x\cos x}{n} + \dfrac{n - 1}{n}\int\sin^{n-2}x\,dx$ 对于 $n \ge 2$。 | [11.1](module_11_ZH.html#reduction) |
| **相关变化率（related rates）** | 两个通过方程联系的量都随时间变化的问题：对时间求导，应用链式法则，将它们的变化率联系起来。 | [7.1](module_07_ZH.html#related-rates) |
| **相对误差（relative error）** | $\abs{\Delta x}/\abs{x}$，对于 $x \ne 0$：误差大小与真实值大小的比较。以百分比表示时，称为百分误差。 | [7.3](module_07_ZH.html#errors) |
| **余项（remainder）** | (1) 对于收敛到 $S$ 的级数 $R_N = S - S_N$，第 $N$ 项部分和的误差；在积分判别法的假设下，$\int_{N+1}^\infty f \le R_N \le \int_N^\infty f$。 (2) 对于泰勒多项式，$R_n(x) = f(x) - T_n(x)$。 | [14.5](module_14_ZH.html#remainder), [15.5](module_15_ZH.html#taylor-theorem) |
| **可去间断点（removable discontinuity）** | 在 $a$ 处的间断点，其中 $\lim_{x\to a} f(x)$ 存在。将 $f(a)$ 定义为极限值，使得 $f$ 在 $a$ 处连续。 | [3.1](module_03_ZH.html#kinds) |
| **残差（residual）** | 对于一条直线 $y = mx + b$ 和一个数据点 $(x_i, y_i)$，误差 $y_i - (mx_i + b)$。 | [18.5](module_18_ZH.html#least-squares) |
| **限制定义域（restricting the domain）** | 将一个非单射的函数的定义域切割，使其变为单射，如 $x^2$ 在 $[0, \infty)$ 上，其反函数是 $\sqrt{x}$。 | [1.5](module_01_ZH.html#inverse) |
| **交换积分顺序（reversing the order of integration）** | 将一个区域上的累次积分改写为另一种积分顺序，新的积分限由区域的草图读出；这可以将一个无法计算的积分变为容易计算的积分。 | [19.3](module_19_ZH.html#general-regions) |
| **黎曼和（Riemann sum）** | $\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i$，对于一个将 $[a, b]$ 分割为宽度为 $\Delta x_i$ 的子区间，并在每个子区间中选取样本点 $x_i^*$ 的划分：总共有矩形。左端点、右端点和中点求和都是黎曼和；双重和三重黎曼和则累加盒子。 | [9.3](module_09_ZH.html#riemann-sums), [9.4](module_09_ZH.html#definite-integral), [19.1](module_19_ZH.html#double-integrals) |
| **黎曼重排定理（Riemann's rearrangement theorem）** | 如果 $\sum a_n$ 条件收敛，则对于每一个数 $T$，存在一种重排使其收敛到 $T$，而其他重排则发散。 | [14.8](module_14_ZH.html#rearrangements) |
| **右导数（right-hand derivative）** | $f'_+(a) = \lim_{h\to0^+}\dfrac{f(a + h) - f(a)}{h}$，当这个极限存在时；左导数 $f'_-(a)$ 取 $h \to 0^-$. $f'(a)$ 存在当且仅当左右导数都存在且相等。 | [4.4](module_04_ZH.html#failures) |
| **右极限（right-hand limit）** | $\lim_{x\to a^+} f(x) = L$：与左极限相同，当 $x > a$ 和 $f$ 在区间 $(a, d)$ 上定义时。也称为从右边趋近的极限。 | [2.2](module_02_ZH.html#one-sided) |
| **右手法则（right-hand rule）** | 当你的右手手指从第一个方向向第二个方向弯曲时，拇指指向第三个方向：因此 $x$-、$y$- 和 $z$-轴的排列，$\vb{a}\times\vb{b}$ 指向，曲面法线与其边界在斯托克斯定理中一致。 | [16.4](module_16_ZH.html#space), [16.6](module_16_ZH.html#cross), [20.7](module_20_ZH.html#stokes) |
| **右端点和（right sum）** | $R_n = \sum_{i=1}^{n} f(x_i)\,\Delta x$，将 $n$ 等分成子区间：每个矩形的高度取其子区间右端点的函数值。 | [9.3](module_09_ZH.html#riemann-sums) |
| **罗尔定理（Rolle's theorem）** | 如果 $f$ 在 $[a, b]$ 上连续，在 $(a, b)$ 上可导，并且 $f(a) = f(b)$，则 $f'(c) = 0$ 对某个 $c$ 在 $(a, b)$ 中成立。 | [8.2](module_08_ZH.html#mvt) |
| **根值判别法（root test）** | 如果 $\abs{a_n}^{1/n} \to \rho$，一个数或 $\infty$：对于 $\rho < 1$，$\sum a_n$ 绝对收敛；对于 $\rho > 1$ 或 $\rho = \infty$，它发散；对于 $\rho = 1$，无法得出结论。 | [14.8](module_14_ZH.html#root) |
| **玫瑰线（rose）** | 一种花形极坐标曲线，如 $r = \cos 3\theta$，它有三个花瓣。 | [16.3](module_16_ZH.html#polar-curves) |
| **舍入误差（rounding error）** | 误差中来自计算机舍入的部分。在一个差商中，其大小约为 $\varepsilon\abs{f(a)}/h$，其中 $\varepsilon$ 是机器精度，因此它随着 $h$ 的减小而增大。 | [4.7](module_04_ZH.html#rounding) |
| **求和法则（rules for sums）** | $\sum c\,a_i = c\sum a_i$，$\sum (a_i + b_i) = \sum a_i + \sum b_i$（以及 $-$ 的相同情况），和 $\sum_{i=1}^{n} c = nc$。 | [9.2](module_09_ZH.html#sigma) |
| **龙格-库塔方法（RK4）（Runge–Kutta method (RK4)）** | 经典的四阶方法用于 $y' = F(t, y)$：每一步平均四个斜率，$y_{n+1} = y_n + \tfrac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$。在固定时间点的误差为 $O(h^4)$。 | [13.4](module_13_ZH.html#rk4) |

<div class="section-anchor" id=g-s></div>

### S

| 术语 | 含义 | 小节 |
|---|---|---|
| **鞍点（saddle point）** | 一个临界点，在该点 $f$ 既没有局部最大值也没有局部最小值：该点的每一个开圆盘内都包含 $f$ 更大和更小的点，如 $x^2 - y^2$ 所示。 | [18.1](module_18_ZH.html#critical-points) |
| **采样点（sample point）** | 在一个划分（或一个小矩形或盒子）的第 $i$ 个子区间内选择的点 $x_i^*$，在该点的黎曼和取值为 $f$。 | [9.4](module_09_ZH.html#definite-integral), [19.1](module_19_ZH.html#double-integrals) |
| **标量（scalar）** | 普通的数，相对于向量而言。 | [16.4](module_16_ZH.html#components) |
| **标量倍数（scalar multiple）** | $c\vb{a} = \langle ca_1, ca_2, ca_3\rangle$： $\vb{a}$ 拉伸因子为 $\abs{c}$，若 $c < 0$ 则反向。 | [16.4](module_16_ZH.html#arithmetic) |
| **标量投影（scalar projection）** | $\operatorname{comp}_{\vb{a}}\vb{b} = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}$，对于 $\vb{a} \ne \vb{0}$：在 $\vb{a}$ 直线上 $\vb{b}$ 的影子的符号长度 $\norm{\vb{b}}\cos\theta$。 | [16.5](module_16_ZH.html#projections) |
| **草稿（scratch work）** | 在一个 $\varepsilon$–$\delta$ 证明中，从 $\abs{f(x) - L} < \varepsilon$ 逆向推导出对 $\abs{x - a}$ 的条件，从而找到 $\delta$。证明随后正向运行该论证。 | [2.7](module_02_ZH.html#proofs) |
| **割线（secant line）** | 曲线上两点所确定的直线。对于 $y = f(x)$ 和在 $a$ 和 $b$ 处的点，其斜率为平均变化率 $\dfrac{f(b) - f(a)}{b - a}$。 | [1.1](module_01_ZH.html#two-problems), [1.6](module_01_ZH.html#rates) |
| **二阶导数检验法（second derivative test）** | (1) 如果 $f'(c) = 0$ 和 $f''(c) > 0$，$f(c)$ 是局部极小值；如果 $f''(c) < 0$，是局部极大值；如果 $f''(c) = 0$，则无信息。 (2) 对于 $f(x, y)$ 在一个点附近具有连续二阶偏导数，其中 $\nabla f = \vb{0}$，设 $D$ 为海森矩阵的行列式：$D > 0$ 和 $f_{xx} > 0$ 表示局部极小值，$D > 0$ 和 $f_{xx} < 0$ 表示局部极大值，$D < 0$ 表示鞍点，$D = 0$ 则无信息。 | [8.4](module_08_ZH.html#second-derivative-test), [18.2](module_18_ZH.html#second-derivative-test) |
| **二元函数的二阶导数检验法（second derivative test in two variables）** | 在二阶偏导数连续的驻点处，负的Hessian行列式表示鞍点。正的行列式如果 $f_{xx}>0$ 表示局部极小值，如果 $f_{xx}<0$ 表示局部极大值。零行列式使得测试结果不确定。 | [18.2](module_18_ZH.html#second-derivative-test) |
| **二阶偏导数（second partial derivatives）** | $f_x$ 和 $f_y$ 的偏导数 $f_{xx}$、$f_{xy}$、$f_{yx}$ 和 $f_{yy}$。对于 $f_{xy}$，先对 $x$ 求导，再对 $y$ 求导。$f_{xy}$ 与 $f_{yx}$ 称为混合偏导数。 | [17.3](module_17_ZH.html#higher) |
| **可分离变量的方程（separable equation）** | 一个一阶方程，可以写成 $y' = g(t)\,h(y)$。分离变量，$\int \dfrac{dy}{h(y)} = \int g(t)\,dt$，得到其解，其中 $h \ne 0$。 | [13.5](module_13_ZH.html#separable) |
| **数列（sequence）** | 一个无限数列，按确定顺序排列，$a_1, a_2, a_3, \dots$，写成 $(a_n)$：确切地说，定义域是从某个初始索引开始的整数的函数。$a_n$ 是其 $n$ 项，$n$ 是其索引。 | [14.1](module_14_ZH.html#sequences) |
| **级数（series）** | 无穷级数 $\sum_{n=1}^{\infty} a_n = a_1 + a_2 + a_3 + \cdots$。如果它的部分和 $S_N$ 收敛到 $S$，则该级数收敛于和 $S$；否则发散。 | [14.3](module_14_ZH.html#partial-sums) |
| **影子价格（shadow price）** | 拉格朗日乘数 $\lambda$ 表示在约束放松时最优值变化的速率：在最优解处，再增加一个预算单位的价值。 | [18.4](module_18_ZH.html#lagrange) |
| **圆柱壳法（shell method）** | 当连续函数 $f \ge 0$ 在区间 $0 \le a \le x \le b$ 上的图像绕 $y$ 轴旋转时，所得立体的体积为 $V = 2\pi\int_a^b x\,f(x)\,dx$；一般情况下为 $2\pi\int (\text{radius})(\text{height})\,dx$。 | [12.4](module_12_ZH.html#shells) |
| **鞋带公式（shoelace formula）** | 多边形 $(x_1, y_1), \dots, (x_n, y_n)$ 的面积，按逆时针顺序排列顶点，根据格林定理：$\tfrac12\sum (x_iy_{i+1} - x_{i+1}y_i)$，带 $(x_{n+1}, y_{n+1}) = (x_1, y_1)$。也称为测地公式。 | [20.4](module_20_ZH.html#area) |
| **求和记号（sigma notation）** | $\sum_{i=m}^{n} a_i = a_m + a_{m+1} + \dots + a_n$，对于整数 $m \le n$。字母 $i$ 是求和的索引，$m$ 和 $n$ 分别是求和的下限和上限。 | [9.2](module_09_ZH.html#sigma) |
| **S 形函数（sigmoid）** | 机器学习中的函数 $\sigma(x) = \dfrac{1}{1 + e^{-x}}$，将任意实数转换为 0 和 1 之间的数。它是具有 $r = 1$、$K = 1$ 和 $y(0) = \tfrac12$ 的逻辑斯蒂曲线。 | [8.4](module_08_ZH.html#concavity), [13.6](module_13_ZH.html#logistic) |
| **符号图（sign chart）** | 一个表格，显示 $f'$（或 $f''$）在它的零点和未定义点之间的区间上的符号，根据其因子的符号来读取。 | [8.3](module_08_ZH.html#monotonic) |
| **简单曲线（simple curve）** | 不自交的曲线；简单闭合曲线仅在起点和终点重合处与自身相交。 | [20.3](module_20_ZH.html#test) |
| **简谐运动（simple harmonic motion）** | 质量为 $m$ 的物体在劲度系数为 $k$ 的弹簧上做无阻尼振动 $x = C_1\cos\omega t + C_2\sin\omega t$，其中 $\omega = \sqrt{k/m}$。它将以周期 $2\pi/\omega$ 持续振动。 | [13.8](module_13_ZH.html#second-order) |
| **单连通（simply connected）** | 平面上一个连通区域，其中每个简单闭合曲线仅包围该区域内的点：它没有孔。在空间中，一个区域中每个闭合曲线都可以收缩为一个点而不离开该区域。 | [20.3](module_20_ZH.html#test), [20.5](module_20_ZH.html#identities) |
| **辛普森法则（Simpson's rule）** | $S_n = \dfrac{\Delta x}{3}\big[f(x_0) + 4f(x_1) + 2f(x_2) + \dots + 4f(x_{n-1}) + f(x_n)\big]$, 对于偶 $n$. 它对次数不超过 3 的多项式精确成立，且如果 $f^{(4)}$ 连续且 $\abs{f^{(4)}} \le K$ 在 $[a, b]$ 上，其误差不超过 $\dfrac{K(b - a)^5}{180n^4}$. | [11.7](module_11_ZH.html#simpson) |
| **sinc 函数（sinc function）** | $\dfrac{\sin x}{x}$ 对 $x \ne 0$，在 0 处取值为 1，使其连续；一个信号处理中的函数。一些书将 $\pi x$ 放在 $x$ 的位置。 | [3.1](module_03_ZH.html#kinds) |
| **正弦和余弦（sine and cosine）** | 从 $(1, 0)$ 旋转 $\theta$ 弧度绕单位圆到达点 $P$：那么 $\cos\theta$ 是 $x$ 轴上 $P$ 的坐标，$\sin\theta$ 是其 $y$ 轴上的坐标。两者定义域均为 $\R$，值域均为 $[-1, 1]$. | [1.4](module_01_ZH.html#trig) |
| **正弦积分（sine integral）** | $\operatorname{Si} x = \displaystyle\int_0^x \frac{\sin t}{t}\,dt$，对于每个实数 $x$，积分函数在 $t = 0$ 处取值为 1. | [11.6](module_11_ZH.html#nonelementary) |
| **异面直线（skew lines）** | 空间中既不平行也永不相交的直线。 | [16.7](module_16_ZH.html#lines) |
| **切片，近似，相加（slice, approximate, add）** | 积分在应用中出现的方式：将 $[a, b]$ 切分成细小的部分，用 $q(x)\,\Delta x$ 近似每个部分的量，将这些部分相加得到黎曼和，然后取极限得到 $\int_a^b q(x)\,dx$。 | [12.1](module_12_ZH.html#method) |
| **斜率（slope）** | 沿一条直线，$y$ 每单位 $x$ 的变化量：对于该直线上任意两点，其 $m = \dfrac{y_2 - y_1}{x_2 - x_1}$ 为 $x_1 \ne x_2$。曲线在某一点的斜率是该点切线的斜率。 | [1.4](module_01_ZH.html#linear) |
| **参数曲线的斜率（slope of a parametric curve）** | $\dfrac{dy}{dx} = \dfrac{dy/dt}{dx/dt}$ 在 $dx/dt \ne 0$ 处，如果 $f'$ 是连续的。曲线在 $dy/dt = 0 \ne dx/dt$ 处的切线水平，在 $dx/dt = 0 \ne dy/dt$ 处的切线垂直。 | [16.2](module_16_ZH.html#tangents) |
| **小角度近似（small-angle approximation）** | $\sin\theta \approx \theta$ 在 $\theta$ 接近 0 时，以弧度为单位，因为 $\sin\theta/\theta \to 1$。这是 $\sin$ 在 0 处的线性化。 | [2.6](module_02_ZH.html#trig-limits), [7.2](module_07_ZH.html#how-good) |
| **光滑曲线（smooth curve）** | 由一个光滑路径追踪的曲线，该路径在内部参数值处的速度连续且非零。该级数允许在端点处速度为零。 | [20.2](module_20_ZH.html#line-integrals) |
| **光滑曲面片（smooth patch）** | 一个参数区域邻域内具有连续可微参数化的曲面片，其两个参数切向量在内部点处的叉乘不为零。 | [20.6](module_20_ZH.html#parametric-surfaces) |
| **光滑路径（smooth path）** | 一个在闭区间上参数化的路径，其速度在内部连续且非零，速度在端点处可能为零。 | [20.2](module_20_ZH.html#line-integrals) |
| **斯涅尔定律（Snell's law）** | 折射定律，$\dfrac{\sin\theta_1}{v_1} = \dfrac{\sin\theta_2}{v_2}$，用于描述光在两种介质之间传播时的速度分别为 $v_1$ 和 $v_2$；角度是从边界法线测量的。 | [8.6](module_08_ZH.html#optimisation) |
| **Softplus 函数（softplus）** | 机器学习中的函数 $s(x) = \ln(1 + e^x)$，是 $\operatorname{ReLU}(x) = \max(0, x)$ 的光滑版本。 | [7.5](module_07_ZH.html#the-rule) |
| **旋转体（solid of revolution）** | 当平面上的一个区域绕该平面内的一条直线旋转时所扫出的立体。 | [12.3](module_12_ZH.html#washers) |
| **微分方程的解（solution (of a differential equation)）** | 在开区间 $I$ 上的函数，其在区间 $I$ 内每一点都有方程所涉及的导数，并且对于 $I$ 中的每个 $t$，方程成立。 | [6.8](module_06_ZH.html#growth-decay), [13.1](module_13_ZH.html#what) |
| **源（source）** | 一个向量场，例如 $\langle x, y\rangle$，其流线向外发散，如同在某一点被泵入；其相反的情况，例如 $\langle -x, -y\rangle$，是一个汇点。 | [20.1](module_20_ZH.html#fields) |
| **空间曲线（space curve）** | 从原点出发绘制 $\vb{r}(t)$ 的终点随 $t$ 变化所形成的曲线。 | [16.8](module_16_ZH.html#motion) |
| **速率（speed）** | 速度的大小：$\abs{v(a)}$ 在一条直线上，$\norm{\vb{v}(t)}$ 在空间中。 | [4.1](module_04_ZH.html#tangents), [16.8](module_16_ZH.html#velocity) |
| **球面（sphere）** | 距离点 $(a, b, c)$ 为 $R$ 的点：$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$。 | [16.4](module_16_ZH.html#space) |
| **球坐标（spherical coordinates）** | $(\rho, \theta, \varphi)$：从原点的距离 $\rho \ge 0$，圆柱坐标中的角度 $\theta$，以及从正 $z$ 轴向的角度 $\varphi$，$0 \le \varphi \le \pi$。然后 $x = \rho\sin\varphi\cos\theta$，$y = \rho\sin\varphi\sin\theta$，$z = \rho\cos\varphi$，和 $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$。 | [19.7](module_19_ZH.html#spherical) |
| **球面扇区（spherical wedge）** | 由球面半径和两个球面角度的区间切割出的立体。 | [19.7](module_19_ZH.html#spherical) |
| **弹簧常数（spring constant）** | 霍ooke定律 $F = kx$ 中的常数 $k$，即弹簧的刚度，单位为牛/米。 | [12.6](module_12_ZH.html#work) |
| **平方根（square root）** | 对于$x \ge 0$，$\sqrt{x}$是其平方等于$x$的非负数。因此$\sqrt{x^2} = \abs{x}$。 | [1.4](module_01_ZH.html#roots) |
| **夹逼定理（squeeze theorem）** | 若对 $a$ 周围某个开区间内的每个 $x \ne a$ 都有 $g(x) \le f(x) \le h(x)$，且 $g$ 与 $h$ 在 $a$ 处具有同一个极限 $L$，则 $\lim_{x\to a} f(x) = L$。模块 14 给出数列情形，模块 17 给出二元函数情形。 | [2.6](module_02_ZH.html#squeeze), [14.1](module_14_ZH.html#laws), [17.2](module_17_ZH.html#squeeze) |
| **标准差（standard deviation）** | 设置正态分布宽度的数$\sigma > 0$；$\sigma^2$，即方差，是数据与均值的平方距离的平均值。 | [12.9](module_12_ZH.html#normal), [Ex. 12.12](module_12_ZH.html#ex-12-12) |
| **标准正态密度（standard normal density）** | $\varphi(z) = \dfrac{1}{\sqrt{2\pi}}\,e^{-z^2/2}$，即统计学中钟形的密度函数，其均值为0，标准差为1。 | [12.9](module_12_ZH.html#normal) |
| **标准单位向量（standard unit vectors）** | $\vb{i} = \langle 1, 0, 0\rangle$， $\vb{j} = \langle 0, 1, 0\rangle$ 和 $\vb{k} = \langle 0, 0, 1\rangle$，使得 $\langle a_1, a_2, a_3\rangle = a_1\vb{i} + a_2\vb{j} + a_3\vb{k}$。 | [16.4](module_16_ZH.html#arithmetic) |
| **标准化（standardise）** | 为了将数据转换为均值为 0 并缩放到相似的分布范围，如同在训练模型前对输入特征所做的处理，以避免梯度下降法出现病态条件。 | [18.6](module_18_ZH.html#rescaling) |
| **最速上升（steepest ascent）** | 对可微 $f$ 在 $\nabla f(a, b) \ne \vb{0}$ 处，方向导数最大为 $\norm{\nabla f}$，在 $\nabla f$ 方向；最小为 $-\norm{\nabla f}$，在相反方向；垂直于它时为 0。 | [17.6](module_17_ZH.html#steepest-ascent) |
| **步长（step size）** | 数值方法中每一步的步长：在梯度下降法中，机器学习中称之为学习率 $\eta > 0$；在欧拉方法中为 $h > 0$。 | [8.7](module_08_ZH.html#gradient-descent), [13.4](module_13_ZH.html#euler), [17.7](module_17_ZH.html#gradient-descent) |
| **刚性的（stiff）** | 一个具有快速衰减部分的微分方程，迫使普通方法必须采取极小的步长；数值软件对此有专门的处理方法。 | [13.4](module_13_ZH.html#rk4) |
| **斯托克斯定理（Stokes' theorem）** | 设 $S$ 是定向的分片光滑曲面，$C$ 是按右手规则定向的简单闭合分片光滑边界。若 $\vb{F}$ 在 $S$ 的某个开邻域内具有连续的一阶偏导数，则 $\oint_C\vb{F}\cdot d\vb{r}=\iint_S\operatorname{curl}\vb{F}\cdot d\vb{S}$。 | [20.7](module_20_ZH.html#stokes) |
| **积分策略（strategy for integration）** | 简化被积函数；如果它包含一个函数及其导数，可进行替换；按其形式进行分类（分部积分、三角积分、三角替换、部分分式、根式）；如果这些方法都不奏效，尝试结合多种方法再次尝试。 | [11.5](module_11_ZH.html#strategy) |
| **级数判别策略（strategy for testing series）** | 首先进行发散性检验；然后是已知级数（几何级数、$p$ 级数）；对于由幂次 $n$ 构成的项进行比较；对于阶乘和指数函数使用比值检验；对于 $n$ 次幂使用根值检验；对于 $f(n)$ 且 $f$ 连续、正且递减的情况使用积分检验；对于交替符号的级数，首先进行 $\sum\abs{a_n}$ 检验。 | [14.9](module_14_ZH.html#strategy) |
| **严格递增（strictly increasing）** | 对于函数，这个级数所称的递增：$x_1 < x_2$ 给出 $f(x_1) < f(x_2)$。对于数列，$a_n < a_{n+1}$ 对于每一个 $n$。严格递减的定义方式相同。 | [Ex. 1.10](module_01_ZH.html#ex-1-10), [8.3](module_08_ZH.html#monotonic), [14.2](module_14_ZH.html#monotone) |
| **换元积分法则（substitution rule）** | $\int f\big(g(x)\big)\,g'(x)\,dx = \int f(u)\,du$与$u = g(x)$和$du = g'(x)\,dx$: 反向链式法则。在定积分中，$\int_a^b f\big(g(x)\big)g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du$，对于连续的$g'$和$f$。 | [10.7](module_10_ZH.html#substitution), [10.7](module_10_ZH.html#definite-substitution) |
| **级数的和（sum (of a series)）** | 收敛级数的部分和的极限 $S = \lim_{N\to\infty} S_N$，记作 $\sum_{n=1}^{\infty} a_n = S$。改变有限项不会改变级数是否收敛。 | [14.3](module_14_ZH.html#partial-sums) |
| **和法则（sum rule）** | 如果$f$和$g$在$x$处可导，则$(f + g)'(x) = f'(x) + g'(x)$，且$(f - g)'(x) = f'(x) - g'(x)$。 | [4.5](module_04_ZH.html#sum-rule) |
| **幂的和（sums of powers）** | 对于每一个自然数$n \ge 1$: $\sum_{i=1}^{n} i = \dfrac{n(n + 1)}{2}$，$\sum_{i=1}^{n} i^2 = \dfrac{n(n + 1)(2n + 1)}{6}$和$\sum_{i=1}^{n} i^3 = \Big(\dfrac{n(n + 1)}{2}\Big)^2$。 | [9.2](module_09_ZH.html#power-sums) |
| **叠加原理（superposition）** | 如果 $y_1$ 与 $y_2$ 都是 $ay'' + by' + cy = 0$ 的解，那么对任意常数 $C_1$ 和 $C_2$，$C_1y_1 + C_2y_2$ 也是解。 | [13.8](module_13_ZH.html#second-order) |
| **曲面（surface）** | 在空间中一个二维形状，例如一个二元函数的图像 $z = f(x, y)$，每个域上的点都有一个对应的上方点，或者一个参数化曲面 $\vb{r}(u, v)$。 | [17.1](module_17_ZH.html#graphs), [20.6](module_20_ZH.html#parametric-surfaces) |
| **曲面面积（surface area）** | 对于由一个光滑参数化 $\vb{r}(u, v)$ 一次描绘的曲面 $(u, v)$，在 $D$ 中： $A(S) = \iint_D \norm{\vb{r}_u\times\vb{r}_v}\,dA$。 | [20.6](module_20_ZH.html#surface-area) |
| **曲面积分（surface integral）** | $\iint_S f\,dS = \iint_D f\big(\vb{r}(u, v)\big)\norm{\vb{r}_u\times\vb{r}_v}\,dA$，对于在由一个光滑参数化 $f$ 一次描绘的曲面上连续的 $S$： $f$ 乘以小面积 $dS$，累加起来。 | [20.6](module_20_ZH.html#surface-integrals) |
| **符号（SymPy）（symbol (SymPy)）** | 在 SymPy 中，一个未知数的名称，通过 `symbols` 创建，以便公式可以精确地进行操作。 | [1.7](module_01_ZH.html#first-session) |
| **符号求导（symbolic differentiation）** | 按照微分规则对公式进行精确求导，如 SymPy 所做的那样。 | [5.8](module_05_ZH.html#autodiff) |
| **对称式方程（symmetric equations）** | $\dfrac{x - x_0}{a} = \dfrac{y - y_0}{b} = \dfrac{z - z_0}{c}$。当 $a$、$b$ 和 $c$ 均非零时，它表示经过 $(x_0, y_0, z_0)$、方向为 $\langle a, b, c\rangle$ 的直线。 | [16.7](module_16_ZH.html#lines) |
| **SymPy** | 一个用于符号运算的自由 Python 包，支持精确的代数和微积分运算。 | [1.7](module_01_ZH.html#python) |

<div class="section-anchor" id=g-t></div>

### T

| 术语 | 含义 | 小节 |
|---|---|---|
| **表格法（tabular method）** | 一个表格用于整理重复使用分部积分的情况，当 $u$ 是多项式时：对 $u$ 求导直到变为 0，对 $dv$ 积分，然后将对角线上的乘积相加，符号交替变化。 | [11.1](module_11_ZH.html#repeated) |
| **切线（tangent line）** | 当第二点趋近于 $P$ 时，通过曲线上点 $P$ 的割线所趋近的直线。对于 $y = f(x)$ 在 $P = (a, f(a))$ 处，当 $f'(a)$ 存在时，它为 $y = f(a) + f'(a)(x - a)$。 | [1.1](module_01_ZH.html#two-problems), [4.1](module_04_ZH.html#tangent-line) |
| **切平面（tangent plane）** | 如果 $f$ 在 $(a, b)$ 附近存在且在 $(a, b)$ 处连续，则 $z = f(x, y)$ 在该点的切平面为 $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$。对于一个等值曲面 $F = k$，它是通过该点且法向量为 $\nabla F$ 的平面，其中 $\nabla F \ne \vb{0}$。 | [17.4](module_17_ZH.html#tangent-planes), [17.6](module_17_ZH.html#tangent-planes-3d) |
| **泰勒多项式（Taylor polynomial）** | $T_n(x) = \sum_{k=0}^{n} \dfrac{f^{(k)}(a)}{k!}(x - a)^k$的泰勒级数在$f$关于$a$的$n$次部分和。$T_1$是线性近似。 | [15.4](module_15_ZH.html#taylor-series) |
| **泰勒级数（Taylor series）** | 对于在$a$处所有阶导数都存在的$f$，幂级数$\sum_{n=0}^{\infty} \dfrac{f^{(n)}(a)}{n!}(x - a)^n$。如果$f$是中心在$a$的幂级数之和，那么该级数就是其泰勒级数。 | [15.4](module_15_ZH.html#taylor-series) |
| **泰勒不等式（Taylor's inequality）** | 如果对于每个介于$a$和$x$之间的$t$，都有$\abs{f^{(n+1)}(t)} \le M$，则$\abs{f(x) - T_n(x)} \le \dfrac{M}{(n + 1)!}\abs{x - a}^{n+1}$。 | [15.5](module_15_ZH.html#taylor-theorem) |
| **泰勒定理（Taylor's theorem）** | 如果$f$在包含$a$和$x\ne a$的开区间内具有直到$n+1$阶的导数，则存在一个严格介于它们之间的$c$，使得$f(x)-T_n(x)=\tfrac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$。在中心点处余项为零。 | [15.5](module_15_ZH.html#taylor-theorem) |
| **裂项相消（telescoping）** | 一个差分之和$(b_1 - b_2) + (b_2 - b_3) + \dots + (b_N - b_{N+1})$，其中所有项都相互抵消，只剩下$b_1 - b_{N+1}$。一个裂项相消级数收敛当且仅当$b_n$有极限，此时其和为$b_1 - \lim b_n$。 | [9.2](module_09_ZH.html#power-sums), [14.3](module_14_ZH.html#telescoping) |
| **项（term）** | 序列中的一个数 $a_n$，或级数中被加的一个数。 | [14.1](module_14_ZH.html#sequences), [14.3](module_14_ZH.html#partial-sums) |
| **逐项求导与积分（term-by-term differentiation and integration）** | 一个收敛半径为 $R > 0$ 的幂级数，可以在 $\abs{x - a} < R$ 处进行项项求导和积分，新的级数具有相同的收敛半径 $R$。 | [15.3](module_15_ZH.html#term-by-term) |
| **终端速度（terminal velocity）** | 一个物体在空气阻力 $cv$ 作用下自由下落时，停止加速的恒定速度 $v_T = mg/c$：其重力 $mg$ 与阻力达到平衡。 | [13.2](module_13_ZH.html#models) |
| **保守场的判别法（test for conservative fields）** | 如果 $P$ 和 $Q$ 在一个开区域上具有连续的一阶偏导数，那么一个保守场 $\langle P, Q\rangle$ 具有 $P_y = Q_x$；在一个开的单连通区域中，$P_y = Q_x$ 也使得 $\langle P, Q\rangle$ 保守。 | [20.3](module_20_ZH.html#test) |
| **四面体角（tetrahedral angle）** | 从正四面体中心到其顶点的两条直线之间的角度，$\arccos(-1/3)$。 | [16.5](module_16_ZH.html#angles) |
| **时间常数（time constant）** | 对于 $y' = -k(y - A)$ 具有 $k > 0$ 的系统，距离平衡点 $A$ 缩小到因子 $e$ 所需的时间 $1/k$。对于一个 RC 电路，它为 $\tau = RC$。 | [13.5](module_13_ZH.html#cooling), [13.7](module_13_ZH.html#linear) |
| **力矩（torque）** | 力 $\vb{F}$ 在距离轴的点位置向量为 $\vb{r}$ 处所产生的力矩 $\boldsymbol{\tau} = \vb{r}\times\vb{F}$。 | [16.6](module_16_ZH.html#cross) |
| **环面（torus）** | 环形面包圈的形状：当半径为 $a$ 的圆盘绕其平面内距离中心 $R > a$ 的一条直线旋转时所扫出的立体。 | [例 12.10](module_12_ZH.html#ex-12-10) |
| **总面积（total area）** | 图形与 $x$ 轴之间的面积，每一部分均按正数计算：轴上方的面积加上轴下方的面积，$\int_a^b \abs{f(x)}\,dx$。 | [9.4](module_09_ZH.html#signed-area) |
| **全微分（total differential）** | 对于可微函数 $z = f(x, y)$：$dz = f_x\,dx + f_y\,dy = \dfrac{\partial z}{\partial x}\,dx + \dfrac{\partial z}{\partial y}\,dy$，其中微分 $dx$ 和 $dy$ 是独立变量。 | [17.4](module_17_ZH.html#differential) |
| **变换（transformation）** | 一个函数 $T$，将平面 $uv$ 的某一区域 $S$ 的每个点 $(u, v)$ 映射到平面 $xy$ 的一个点 $(x, y) = T(u, v)$。 | [19.8](module_19_ZH.html#change-of-variables) |
| **梯形法则（trapezoidal rule）** | $T_n = \dfrac{\Delta x}{2}\big[f(x_0) + 2f(x_1) + \dots + 2f(x_{n-1}) + f(x_n)\big]$，对于 $\Delta x = (b - a)/n$ 和 $x_i = a + i\,\Delta x$：左和右和的平均值。如果 $f''$ 在 $[a, b]$ 上连续且 $\abs{f''} \le K$，其误差不超过 $\dfrac{K(b - a)^3}{12n^2}$。 | [11.7](module_11_ZH.html#trapezoidal), [11.7](module_11_ZH.html#error-bounds) |
| **树状图（tree diagram）** | 链式法则的图示：依赖变量在顶部，中间变量在其下方，独立变量在底部，每条分支标有导数。顶部变量对底部变量的导数等于所有通向该变量的路径上分支标签乘积之和。 | [17.5](module_17_ZH.html#tree-diagrams) |
| **三角不等式（triangle inequality）** | $\abs{a + b} \le \abs{a} + \abs{b}$ 对所有实数 $a$ 和 $b$ 成立。对于向量，$\norm{\vb{a} + \vb{b}} \le \norm{\vb{a}} + \norm{\vb{b}}$。 | [2.7](module_02_ZH.html#no-limit-proof), [16.4](module_16_ZH.html#arithmetic) |
| **三角函数（trigonometric functions）** | 正弦和余弦，以及由它们定义的四个函数（分母不为0）：$\tan\theta = \sin\theta/\cos\theta$, $\cot\theta = \cos\theta/\sin\theta$, $\sec\theta = 1/\cos\theta$ 和 $\csc\theta = 1/\sin\theta$。 | [1.4](module_01_ZH.html#trig) |
| **三角积分（trigonometric integral）** | 三角函数幂的乘积的积分，例如 $\int \sin^m x\cos^n x\,dx$：保留一个奇次幂的因子并进行替换，或者当两个幂都是偶数时使用半角恒等式。 | [11.2](module_11_ZH.html#trig-integrals) |
| **三角换元（trigonometric substitution）** | 用 $x = a\sin\theta$, $a\tan\theta$ 或 $a\sec\theta$（带 $a > 0$）替换以消除被积函数中的 $\sqrt{a^2 - x^2}$, $\sqrt{a^2 + x^2}$ 或 $\sqrt{x^2 - a^2}$：替换规则从右向左读取。一个直角三角形将答案转换回 $x$。 | [11.3](module_11_ZH.html#trig-substitution) |
| **三重积分（triple integral）** | $\iiint_E f(x, y, z)\,dV$, 三重黎曼和的极限，其在体积为 $\Delta V$ 的小盒子上计算，作为任意六种顺序的累次积分。与 $f = 1$ 一起，它是 $E$ 的体积。 | [19.6](module_19_ZH.html#triple) |
| **截断误差（truncation error）** | 一种方法在算术精确时仍存在的误差，因为它在某一步骤停止 $h > 0$ 而不是趋于极限。 | [4.7](module_04_ZH.html#truncation) |
| **第 I 型立体（type 1 solid）** | 一个在 $xy$ 平面上的区域 $D$ 上，介于两个曲面之间的实体 $u_1(x, y) \le z \le u_2(x, y)$；其三重积分是 $\iint_D \Big[\int_{u_1}^{u_2} f\,dz\Big]\,dA$。 | [19.6](module_19_ZH.html#triple) |
| **第 I 类区域（type I region）** | 一个区域 $a \le x \le b$, $g_1(x) \le y \le g_2(x)$，位于两个关于 $x$ 的连续函数的图像之间；在该区域上，$\iint_D f\,dA = \int_a^b\int_{g_1(x)}^{g_2(x)} f\,dy\,dx$。一个类型 II 区域 $c \le y \le d$, $h_1(y) \le x \le h_2(y)$，位于关于 $y$ 的函数图像之间。 | [19.3](module_19_ZH.html#general-regions) |
| **第 II 类区域（type II region）** | 一个在 $y$ 的闭区间上，由两个关于 $y$ 的连续函数图像之间的平面区域，其中左侧函数不大于右侧函数。 | [19.3](module_19_ZH.html#general-regions) |

<div class="section-anchor" id=g-u></div>

### U

| 术语 | 含义 | 小节 |
|---|---|---|
| **均匀密度（uniform density）** | $[0, 1]$ 上的密度等于 1 那里，其他地方为 0：对于 $0 \le a \le b \le 1$, $P(a \le X \le b) = b - a$。 | [12.9](module_12_ZH.html#densities) |
| **一致连续（uniformly continuous）** | 若对每个 $\varepsilon > 0$ 都存在 $\delta > 0$，使得区间内任意两点 $s$、$s'$ 满足 $\abs{s - s'} < \delta$ 时必有 $\abs{g(s) - g(s')} < \varepsilon$，则 $g$ 在该区间上一致连续。在闭区间上连续的函数在该区间上一致连续。 | [16.2](module_16_ZH.html#arc-length) |
| **单位圆（unit circle）** | 半径为 1 且中心在原点的圆。 | [1.4](module_01_ZH.html#trig) |
| **单位阶跃函数（unit step function）** | 一个函数，对于负输入为 0，正输入为 1，写作 $u(t)$ 在第 2 模块中，其中在 0 处的值未定义，且 $H(x)$ 与 $H(0) = 1$ 在第 4 模块中。它在 0 处跳跃，因此在该点不连续也不可导。 | [2.2](module_02_ZH.html#one-sided), [4.4](module_04_ZH.html#failures) |
| **单位切向量（unit tangent vector）** | $\vb{T}(t) = \dfrac{\vb{r}'(t)}{\norm{\vb{r}'(t)}}$，其中 $\vb{r}'(t) \ne \vb{0}$。 | [16.8](module_16_ZH.html#integrals) |
| **单位向量（unit vector）** | 长度为 1 的向量。$\vb{a}/\norm{\vb{a}}$ 是方向为 $\vb{a} \ne \vb{0}$ 的单位向量；求得它需要对 $\vb{a}$ 进行归一化。 | [16.4](module_16_ZH.html#arithmetic) |
| **上界（upper bound）** | 一个对于序列每一项都有 $a_n \le M$，或对于集合每一元素都有 $x \le M$ 的数 $M$；一个下界 $m$ 有 $a_n \ge m$。最小上界是最小的上界。 | [14.2](module_14_ZH.html#monotone), [15.1](module_15_ZH.html#convergence) |

<div class="section-anchor" id=g-v></div>

### V

| 术语 | 含义 | 小节 |
|---|---|---|
| **值（value）** | 函数 $f$ 分配给 $x$ 的数 $f(x)$：即 $f$ 在 $x$ 处的值。 | [1.3](module_01_ZH.html#functions) |
| **方差（variance）** | 均值平方距离，$\int_{-\infty}^{\infty} (x - \mu)^2f(x)\,dx$；对于正态分布，它为 $\sigma^2$。 | [Ex. 12.12](module_12_ZH.html#ex-12-12) |
| **向量（vector）** | 有长度和方向的量，画作箭头；长度和方向相同的箭头是相同的向量。在空间中表示为 $\vb{a} = \langle a_1, a_2, a_3\rangle$，在平面中表示为 $\langle a_1, a_2\rangle$。 | [16.4](module_16_ZH.html#components) |
| **直线的向量方程（vector equation of a line）** | $\vb{r} = \vb{r}_0 + t\vb{v}$：通过位置向量为 $\vb{r}_0$ 的点，并沿方向 $\vb{v} \ne \vb{0}$ 的直线。在分量形式中，它给出参数方程；将每个方程解出 $t$ 得到对称方程。 | [16.7](module_16_ZH.html#lines) |
| **向量场（vector field）** | 一个函数 $\vb{F}$，它为区域中的每个点赋予一个向量：$\vb{F}(x, y) = \langle P, Q\rangle$ 在平面上，$\langle P, Q, R\rangle$ 在空间中。一个值为数的函数则被称为标量场。 | [20.1](module_20_ZH.html#fields) |
| **向量函数（vector function）** | 一个函数 $\vb{r}(t) = \langle f(t), g(t), h(t)\rangle$，它为定义域中的每个数 $t$ 赋予一个向量；$f$、$g$ 和 $h$ 是它的分量函数。极限、连续性和导数都是按分量分别进行的。 | [16.8](module_16_ZH.html#motion) |
| **向量投影（vector projection）** | $\operatorname{proj}_{\vb{a}}\vb{b} = \dfrac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,\vb{a}$，对于 $\vb{a} \ne \vb{0}$：$\vb{b}$ 在 $\vb{a}$ 直线上的影子，指向 $\vb{a}$ 方向的 $\vb{b}$ 部分。 | [16.5](module_16_ZH.html#projections) |
| **向量和（vector sum）** | $\vb{a} + \vb{b} = \langle a_1 + b_1, a_2 + b_2, a_3 + b_3\rangle$：沿 $\vb{a}$ 走，然后沿 $\vb{b}$ 走。差值为 $\vb{a} - \vb{b} = \vb{a} + (-1)\vb{b}$。 | [16.4](module_16_ZH.html#arithmetic) |
| **速度（velocity）** | 沿直线运动的物体的位置为 $s(t)$ 时，若相应极限存在，则在时刻 $a$ 的瞬时速度为 $v(a) = \lim_{h\to0}\dfrac{s(a + h) - s(a)}{h} = s'(a)$。在空间中，瞬时速度为向量 $\vb{v}(t) = \vb{r}'(t)$。 | [4.1](module_04_ZH.html#tangents), [4.6](module_04_ZH.html#motion), [16.8](module_16_ZH.html#velocity) |
| **竖直渐近线（vertical asymptote）** | 直线 $x = a$ 是函数 $f$ 图像的垂直渐近线，如果 $f$ 在 $a$ 处至少有一个单侧极限是 $\infty$ 或 $-\infty$。 | [3.6](module_03_ZH.html#infinite-limits) |
| **竖线判别法（vertical line test）** | 平面上的曲线是 $x$ 的函数图像，当且仅当没有垂直直线与之相交超过一次。 | [1.3](module_01_ZH.html#graphs) |
| **竖直切线（vertical tangent）** | 直线 $x = a$，当 $f$ 在 $a$ 处连续，且其差商从两侧趋于 $\infty$ 或从两侧趋于 $-\infty$，如同 $x^{1/3}$ 在 0 处的情况。$f'(a)$ 不存在。 | [4.4](module_04_ZH.html#failures) |
| **虚拟环境（virtual environment）** | 一个拥有自己 Python 包集合的文件夹，与计算机其余部分隔离：在它激活期间安装的包将被放入该文件夹。 | [1.7](module_01_ZH.html#venv) |
| **切片法求体积（volume by slicing）** | 两个平面 $x = a$ 和 $x = b$ 之间的立体，其在 $x$ 处的横截面面积为 $A(x)$，且 $A$ 连续，则该立体的体积为 $\int_a^b A(x)\,dx$。 | [12.3](module_12_ZH.html#slicing) |

<div class="section-anchor" id=g-w></div>

### W

| 术语 | 含义 | 小节 |
|---|---|---|
| **圆环截面（washer）** | 一个中间有孔的圆盘：旋转体的横截面，当被旋转的区域未达到旋转轴时。外半径为 $R(x)$，内半径为 $r(x)$，使用圆盘法（washer method）可得 $V = \pi\int_a^b \big(R(x)^2 - r(x)^2\big)\,dx$。 | [12.3](module_12_ZH.html#washers) |
| **功（work）** | 常量力 $F$ 作用在距离 $d$ 上所做的功为 $W = Fd$；连续力 $F(x)$ 沿直线从 $a$ 移动到 $b$ 所做的功为 $\int_a^b F(x)\,dx$。对于力向量 $W = \vb{F}\cdot\vb{D}$ 沿曲线的线积分是 $\int_C \vb{F}\cdot d\vb{r}$。 | [12.6](module_12_ZH.html#work), [16.5](module_16_ZH.html#dot), [20.2](module_20_ZH.html#work) |

<div class="section-anchor" id=g-z></div>

### Z

| 术语 | 含义 | 小节 |
|---|---|---|
| **函数零点（zero (of a function)）** | 满足 $r$ $p(r) = 0$ 的数，也称为根；此时函数图像与 $x$ 轴相交。 | [1.4](module_01_ZH.html#polynomials) |
| **零向量（zero vector）** | $\vb{0} = \langle 0, 0, 0\rangle$ 是一个长度为 0 且没有方向的点。 | [16.4](module_16_ZH.html#components) |
