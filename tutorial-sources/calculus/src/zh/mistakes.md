---
title: 常见错误
lead: 查找反例，查看计数器示例，并根据规则回溯到解释该规则的模块。
---

项按照系列的顺序排列。每一项都提供一个例子和应使用的规则。如需定义，请参见[glossary](glossary_ZH.html)。如需公式及其条件，请参见[formula sheet](formulas_ZH.html)。

[函数、极限与连续性](#functions) · [导数及其应用](#derivatives) · [积分与微分方程](#integrals) · [数列与级数](#series) · [曲线、向量与多元函数](#several) · [多重积分与向量演算](#multiple)

## 函数、极限与连续性 {#functions}

### 约分后漏掉定义域的限制 {#cancelling-away-a-domain-restriction}

公式$(x^2-1)/(x-1)$ 在$x\ne1$时简化为$x+1$。在$x=1$时，原表达式的分母为$0$，尽管简化后的表达式给出$2$。

在消去之前先找出定义域，并将它的限制条件带入简化后的公式中。[小节 1.3](module_01_ZH.html#domains)

```check
same(cancel((x**2-1)/(x-1)),x+1); same((x-1).subs(x,1),0); same((x+1).subs(x,1),2)
```

### 对负数开平方 {#taking-a-square-root-of-a-negative-number}

公式$\sqrt{x-2}$ 在$x=1$处没有实数值，因为$1-2=-1$。它在$x=2$处给出实数值，即$0$。

对于实数平方根，要求根号下的表达式非负。[小节 1.3](module_01_ZH.html#domains)

```check
same(1-2,-1); holds(sqrt(1-2).is_real is False); same(sqrt(2-2),0)
```

### 将度数代入弧度公式 {#feeding-degrees-into-a-radian-formula}

直角是 $90^\circ$，或 $\pi/2$ 弧度。直角处的正弦值是 $1$，但将 $90$ 输入弧度模式的计算器会返回约 $0.894$。

在使用微积分公式或 Python 三角函数前，应将度数转换为弧度。[小节 1.4](module_01_ZH.html#trig)

```check
same(90*pi/180,pi/2); same(sin(pi/2),1); rounds(sin(90),'0.894')
```

### 弄错函数复合的顺序 {#composing-functions-in-the-wrong-order}

对于 $f(x)=x+1$ 和 $g(x)=2x$，先应用 $g$ 再应用 $f$ 在 $3$ 处得到 $7$。先应用 $f$ 再应用 $g$ 得到 $8$。

在 $(f\circ g)(x)$ 中，先应用 $g$。其输出必须属于 $f$ 的定义域。见[第 1.5 节](module_01_ZH.html#new-from-old)。

```check
same(2*3+1,7); same(2*(3+1),8)
```

### 将点处的值视为极限 {#taking-the-value-at-the-point-as-the-limit}

设 $f(x)=x+1$ 除了 $f(2)=9$。当 $x$ 通过邻近输入趋近于 $2$ 时，输出趋近于 $3$。单个值 $9$ 没有影响。

极限关注的是 $x\ne a$ 邻近输入。测试连续性时，应单独检查 $a$ 处的值。[小节 2.1](module_02_ZH.html#idea)

```check
same(Piecewise((9,Eq(x,2)),(x+1,True)).subs(x,2),9); limit_is(x+1,x,2,3)
```

### 只检查一侧极限 {#using-only-one-side-of-a-limit}

商 $\abs{x}/x$ 在正 $1$ 时为 $x$，在负 $-1$ 时为 $x$。这两个值在接近 $0$ 时出现分歧。

在内部点处，仅当左右极限都存在且相等时，二侧极限才存在。[小节 2.2](module_02_ZH.html#one-sided)

```check
limit_is(Abs(x)/x,x,0,1,dir='+'); limit_is(Abs(x)/x,x,0,-1,dir='-')
```

### 将零除以零视为极限值 {#treating-zero-over-zero-as-a-limit-value}

在 $x=0$ 处，$x^2/x$ 和 $x/x$ 都具有形式 $0/0$。对于 $x\ne0$，第一个等于 $x$，第二个等于 $1$，因此它们的极限不同。

形式 $0/0$ 需要更多的工作。在使用替换前，先在穿孔区间上进行简化。[小节 2.5](module_02_ZH.html#zero-over-zero)

```check
limit_is(x**2/x,x,0,0); limit_is(x/x,x,0,1)
```

### 把两个很接近的浮点数相减 {#subtracting-nearly-equal-floating-point-numbers}

表达式 $\sqrt{1+x}-1$ 在 $x=10^{-18}$ 处为正，但普通的 Python 浮点数给出 $0.0$。计算 $x/(\sqrt{1+x}+1)$ 得到大约 $5\times10^{-19}$。

有理化以避免减法，然后在所需的尺度上检查重写后的表达式。[小节 2.8](module_02_ZH.html#cancellation)

```check
import math; same(math.sqrt(1+1e-18)-1,0); near(1e-18/(math.sqrt(1+1e-18)+1),5e-19,1e-32); same((sqrt(1+x)-1)*(sqrt(1+x)+1),x)
```

### 检查极限却忘记值 {#checking-the-limit-but-forgetting-the-value}

如果 $f(x)=x$ 对 $x\ne0$ 和 $f(0)=1$ 成立，那么在 $0$ 处的极限是 $0$，但该点的函数值是 $1$。

在内部点处，连续性要求函数值存在，极限存在，并且两者相等。[小节 3.1](module_03_ZH.html#continuity)

```check
limit_is(x,x,0,0); same(Piecewise((1,Eq(x,0)),(x,True)).subs(x,0),1)
```

### 函数不连续时，仅凭变号断定有零点 {#using-a-sign-change-without-continuity}

设 $f(x)=-1$ 对 $x<0$ 成立，且 $f(x)=1$ 对 $x\ge0$ 成立。在 $-1$ 和 $1$ 处的符号不同，但没有零点。

只有在函数连续的区间上才能使用中间值定理。[小节 3.3](module_03_ZH.html#ivt)

```check
step_m=Piecewise((-1,x<0),(1,True)); same([step_m.subs(x,p) for p in (-1,0,1)],[-1,1,1]); same(step_m**2,1)
```

### 假设开区间上有最大值 {#assuming-an-open-interval-has-a-maximum}

函数 $f(x)=x$ 在 $(0,1)$ 上的取值低于 $1$。对于该区间内的任意 $x$，$(x+1)/2$ 都在该区间内，并给出更大的值。

极值定理保证连续函数在闭合有界区间上存在最大值和最小值。[小节 3.5](module_03_ZH.html#evt)

```check
lo_m=Rational(3,4); hi_m=(lo_m+1)/2; same(hi_m,Rational(7,8)); holds(0<lo_m<hi_m<1)
```

### 混淆了无穷大的两种符号 {#confusing-the-two-signs-of-infinity}

在 $1/x$ 中，分母从两侧趋于 $0$，但左侧的值趋于 $-\infty$，右侧的值趋于 $+\infty$。

当一个分数的分子极限非零，而分母趋于零时，需在两侧跟踪符号。[小节 3.6](module_03_ZH.html#infinite-limits)

```check
limit_is(1/x,x,0,-oo,dir='-'); limit_is(1/x,x,0,oo,dir='+')
```

## 导数及其应用 {#derivatives}

### 在化简之前将步长设为零 {#setting-the-step-to-zero-before-simplifying}

对于 $f(x)=x^2$ 在 $a=2$ 处，该分数在 $0/0$ 处具有形式 $h=0$。对于 $h\ne0$，它等于 $4+h$ 并趋于 $4$。

通过非零步长计算差商的极限。[小节 4.2](module_04_ZH.html#derivative)

```check
same(cancel(((2+h)**2-4)/h),4+h); limit_is(4+h,h,0,4)
```

### 以为连续的图像一定有切线斜率 {#assuming-a-continuous-graph-has-a-tangent-slope}

函数 $\abs{x}$ 在 $0$ 处连续。其在 $0$ 处的右差商和左差商分别为 $1$ 和 $-1$。

可导性蕴含连续性。要判断尖角处是否可导，可以比较左右两侧的单侧斜率。见[第 4.4 节](module_04_ZH.html#differentiability)。

```check
limit_is(Abs(h),h,0,0); limit_is(Abs(h)/h,h,0,1,dir='+'); limit_is(Abs(h)/h,h,0,-1,dir='-')
```

### 把常数的导数算成非零 {#giving-a-constant-a-nonzero-derivative}

函数 $y=7$ 的图象是水平的。因此对 $3x+7$ 求导得到 $3$。

常数对导数的贡献为零。一个函数乘以常数因子时，该因子保持不变。[小节 4.5](module_04_ZH.html#rules)

```check
same(diff(7,x),0); same(diff(3*x+7,x),3)
```

### 差分时一味取最小的步长 {#choosing-the-smallest-possible-finite-difference}

在 $a=1$ 和 $h=10^{-18}$ 的条件下，普通的 Python 浮点数满足 $1+h=1$。对于 $x^2$，前向差分则给出 $0$，尽管导数是 $2$。

选择一个平衡截断误差和舍入误差的步长，并比较多个步长下的估计值。[小节 4.7](module_04_ZH.html#numerical)

```check
same(1.0+1e-18,1); same(((1.0+1e-18)**2-1)/1e-18,0); same(diff(x**2,x).subs(x,1),2)
```

### 用两个导数相乘来求乘积的导数 {#multiplying-derivatives-in-the-product-rule}

对于 $f(x)=g(x)=x$，导数的乘积是 $1$。在 $x=2$ 处的乘积导数是 $4$。

依次对每个因子求导，保持另一个因子不变，然后将两个项相加。[小节 5.2](module_05_ZH.html#product)

```check
same(diff(x,x)*diff(x,x),1); same(diff(x*x,x).subs(x,2),4); same(diff(x*x,x),diff(x,x)*x+x*diff(x,x))
```

### 把商法则分子中的两项颠倒 {#reversing-the-numerator-of-the-quotient-rule}

对于 $1/x$，在 $x=2$ 处的导数是 $-1/4$。反转减法得到 $+1/4$。

对可导的 $f$ 和 $g$ 且满足 $g(x)\ne0$，使用 $(f'g-fg')/g^2$。[小节 5.3](module_05_ZH.html#quotient)

```check
same(diff(1/x,x).subs(x,2),-Rational(1,4)); same((1/x**2).subs(x,2),Rational(1,4))
```

### 漏乘内层函数的导数 {#omitting-the-inner-derivative}

对 $\sin(3x)$，在 $0$ 处的导数是 $3$。仅对最外层进行求导得到 $\cos0=1$。

保持内部表达式在外部导数内部，然后乘以内层表达式的导数。[小节 5.5](module_05_ZH.html#chain)

```check
same(diff(sin(3*x),x),3*cos(3*x)); same(diff(sin(3*x),x).subs(x,0),3); same(cos(0),1)
```

### 漏掉同一输入的其他计算路径 {#following-only-one-use-of-an-input}

取 $u=x^2$ 和 $y=u+x$。在 $x=2$ 处，通过 $u$ 的路径贡献 $4$，直接路径贡献 $1$，得到导数为 $5$。

当一个计算依赖于多个路径上的相同输入时，将所有路径的贡献相加。[小节 5.8](module_05_ZH.html#autodiff)

```check
same(diff(x**2,x).subs(x,2),4); same(diff(x,x),1); same(diff(x**2+x,x).subs(x,2),5)
```

### 以为所有指数函数的导数都等于自身 {#differentiating-every-exponential-as-itself}

$2^x$ 在 $0$ 处的导数是 $\ln2$，关于 $0.693$。该点的函数值是 $1$。

对于 $a>0$，$\dfrac{d}{dx}a^x=(\ln a)a^x$。当 $a=e$ 时，因子是 $1$。[小节 6.1](module_06_ZH.html#number-e)

```check
same(diff(2**x,x),log(2)*2**x); same((2**x).subs(x,0),1); rounds(log(2),'0.693'); same(log(E),1)
```

### 把和的对数拆成对数的和 {#distributing-the-logarithm-over-a-sum}

在 $x=y=1$，$\ln(x+y)=\ln2$，而 $\ln x+\ln y=0$。

加法法则为 $\ln(xy)=\ln x+\ln y$，适用于正 $x$ 和 $y$。它适用于乘积。[第 6.3 节 ](module_06_ZH.html#logarithms)]

```check
same(log(1+1),log(2)); same(log(1)+log(1),0); holds(log(2)>0)
```

### 漏掉 y 的导数 {#forgetting-the-derivative-of-y}

在 $x^2+y^2=25$ 上，$(3,4)$ 处的斜率是 $-3/4$。将 $y^2$ 作为 $2y$ 进行求导时，将 $y$ 视为自变量。

当 $y$ 依赖于 $x$ 时，将 $y^2$ 作为 $2y\,dy/dx$ 进行求导，然后在系数允许除法的情况下求解斜率。[小节 6.4](module_06_ZH.html#implicit)

```check
same(3**2+4**2,25); same(diff(sqrt(25-x**2),x).subs(x,3),-Rational(3,4))
```

### 把反正弦误当作正弦的倒数 {#reading-inverse-sine-as-a-reciprocal}

值 $\arcsin(1/2)$ 是 $\pi/6$。$\sin(1/2)$ 的倒数约为 $2.086$。

使用反三角函数来找出 $[-\pi/2,\pi/2]$ 中的角度。当正弦值非零时，使用 $1/\sin x$ 或 $\csc x$ 来表示倒数。[小节 6.5](module_06_ZH.html#inverse-trig)

```check
same(asin(Rational(1,2)),pi/6); rounds(1/sin(Rational(1,2)),'2.086')
```

### 在求导前代入变化的长度 {#plugging-in-a-changing-length-before-differentiating}

对于长度为 $5$ 的梯子，$x^2+y^2=25$。在 $(3,4)$ 与 $dx/dt=2$ 的情况下，求导后的方程给出 $dy/dt=-3/2$。先代入两个长度会使得常数之间产生恒等式，从而丢失了变化率。

对时间进行求导，当变化量仍然是函数时。使用之后瞬间的值。[小节 7.1](module_07_ZH.html#related-rates)

```check
same(3**2+4**2,25); same(solve(2*3*2+2*4*v,v),[-Rational(3,2)])
```

### 把切线给出的近似值当成精确值 {#reading-a-tangent-line-estimate-as-exact}

在 $2$ 处对 $x^2$ 进行线性化，预测 $x=3$ 处的 $8$。精确值为 $9$。

在 $a$ 附近使用 $f(a)+f'(a)(x-a)$ 来表示可导函数。当精度重要时，检查误差界。[小节 7.2](module_07_ZH.html#linear-approximation)

```check
same(2**2+diff(x**2,x).subs(x,2)*(3-2),8); same(3**2,9)
```

### 在牛顿法中除以零斜率 {#dividing-by-a-zero-newton-slope}

从 $x_0=0$ 开始进行 $f(x)=x^2-2$ 会需要将 $-2$ 除以 $f'(0)=0$。这一步是未定义的。

检查每个迭代点的斜率是否非零。即使步骤有定义，收敛性仍需单独证明。[小节 7.4](module_07_ZH.html#newton)

```check
same((x**2-2).subs(x,0),-2); same(diff(x**2-2,x).subs(x,0),0)
```

### 对已有确定极限的商套用洛必达法则 {#applying-lho-pitals-rule-to-a-determinate-quotient}

当 $x$ 趋近于 $2$ 时，$(x^2+1)/x$ 趋近于 $5/2$。导数的商为 $2x$，其趋近于 $4$。

只有在规则涵盖的不定型情况下才能使用导数商，并且要检查其假设条件。非零有限分母的极限允许直接代入。[小节 7.5](module_07_ZH.html#lhopital)

```check
limit_is((x**2+1)/x,x,2,Rational(5,2)); limit_is(diff(x**2+1,x)/diff(x,x),x,2,4)
```

### 把所有驻点都当作极值点 {#calling-all-stationary-points-extrema}

对于 $f(x)=x^3$, $f'(0)=0$. $-1$ 和 $1$ 处的值位于 $f(0)=0$ 的两侧，并且 $0$ 的每一个邻域都有相同的模式。

临界点是一个候选点。比较附近的值或测试导数在两侧的符号。[小节 8.1](module_08_ZH.html#extrema)

```check
same(diff(x**3,x).subs(x,0),0); same([(-1)**3,0,1**3],[-1,0,1]); holds(Symbol('w',positive=True)**3>0)
```

### 在拐角处使用中值定理 {#using-the-mean-value-theorem-across-a-corner}

在 $[-1,1]$ 上，$\abs{x}$ 的两端点函数值相同。在 $0$ 左侧，导数为 $-1$；在其右侧，导数为 $1$。因此没有一个内点的导数为 $0$。

中值定理要求在闭区间上连续，并且在每个内部点处可导。[小节 8.2](module_08_ZH.html#mvt)

```check
same(Abs(-1),Abs(1)); same([diff(Abs(Symbol('w',real=True)),Symbol('w',real=True)).subs(Symbol('w',real=True),p) for p in (-Rational(1,2),Rational(1,2))],[-1,1])
```

### 将每个二阶导数的零点称为拐点 {#calling-every-zero-of-the-second-derivative-an-inflection}

对于 $f(x)=x^4$, $f''(0)=0$. 在 $0$ 的两侧，$f''(x)=12x^2$ 均为正数，因此凹凸性没有变化。

使用二阶导数的零点作为候选点，并检查凹凸性是否发生变化。[小节 8.4](module_08_ZH.html#concavity)

```check
same(diff(x**4,x,2),12*x**2); same(diff(x**4,x,2).subs(x,0),0); holds(12*Symbol('w',nonzero=True)**2>0)
```

### 在寻找绝对极值时排除端点 {#leaving-endpoints-out-of-an-absolute-extrema-search}

在 $[0,3]$ 上，$x^2$ 在端点处的值为 $0$ 和 $9$，并且没有内部驻点。两个极值都出现在端点。

对闭区间上的连续函数，比较两端点与所有内部临界点处的函数值。见[第 8.6 节](module_08_ZH.html#optimisation)。

```check
same([0**2,3**2],[0,9]); same(solve(diff(x**2,x),x),[0])
```

## 积分与微分方程 {#integrals}

### 忽略矩形宽度 {#leaving-out-the-rectangle-width}

在 $[0,1]$ 上， $f(x)=x$ 的两个左矩形的高度为 $0$ 和 $1/2$。它们的面积之和为 $1/4$，因为它们的宽度均为 $1/2$。

在相加之前，将每个采样高度乘以其子区间宽度。[小节 9.3](module_09_ZH.html#riemann-sums)

```check
same((0+Rational(1,2))*Rational(1,2),Rational(1,4)); same((1-0)/Integer(2),Rational(1,2))
```

### 反转近似误差的符号 {#reversing-the-sign-of-an-approximation-error}

对于 $[0,1]$ 上的 $x^2$，使用一个左矩形时，估计值为 $0$，积分值为 $1/3$。误差为 $+1/3$。

使用精确值减去近似值。如果你想得到误差的绝对值，就在这个差值周围加上绝对值符号。[小节 9.3](module_09_ZH.html#riemann-sums)

```check
left_m=0**2*(1-0); exact_m=integrate(x**2,(x,0,1)); same([left_m,exact_m,exact_m-left_m],[0,Rational(1,3),Rational(1,3)])
```

### 把有符号积分当作总面积 {#reading-a-signed-integral-as-total-area}

在 $[-1,1]$ 上，$x$ 的积分是 $0$。每个三角形的面积是 $1/2$，因此总面积是 $1$。

使用 $\int_a^b\abs{f(x)}\,dx$ 表示图形与轴之间的总面积。[小节 9.4](module_09_ZH.html#signed-area)

```check
same(integrate(x,(x,-1,1)),0); same(integrate(x,(x,0,1)),Rational(1,2)); same(integrate(Abs(x),(x,-1,1)),1)
```

### 将两个积分相乘以积分一个乘积 {#multiplying-two-integrals-to-integrate-a-product}

积分 $\int_0^1 x^2\,dx$ 是 $1/3$。将 $x$ 的两个积分相乘得到 $(1/2)^2=1/4$。

线性性质适用于求和与乘常数。对乘积应将它作为一个整体积分。见[第 9.5 节](module_09_ZH.html#properties)。

```check
same(integrate(x*x,(x,0,1)),Rational(1,3)); same(integrate(x,(x,0,1))**2,Rational(1,4))
```

### 忽略积分常数 {#dropping-the-constant-of-integration}

$x^2$ 和 $x^2+3$ 的导数都是 $2x$。如果原函数在 $0$ 处必须等于 $3$，只有第二个满足。

在一个区间上将原函数族写成 $F+C$。初始值可以确定 $C$。[小节 10.1](module_10_ZH.html#antiderivatives)

```check
antideriv(x**2,2*x,x); antideriv(x**2+3,2*x,x); same([(x**2).subs(x,0),(x**2+3).subs(x,0)],[0,3])
```

### 对变上限积分求导时漏用链式法则 {#forgetting-the-chain-rule-for-a-variable-upper-limit}

对于 $A(x)=\int_0^{x^2}t\,dt$，积分是 $x^4/2$。其在 $x=2$ 处的导数是 $16$，而仅将上限代入被积函数得到 $4$。

当下限固定且被积函数连续时，计算被积函数在上限处的值并乘以下限的导数。[小节 10.4](module_10_ZH.html#ftc1)

```check
A_m=integrate(t,(t,0,x**2)); same(A_m,x**4/2); same(diff(A_m,x).subs(x,2),16); same((x**2).subs(x,2),4)
```

### 应用微积分基本定理时漏算下限 {#forgetting-the-lower-endpoint-in-the-fundamental-theorem}

对于 $\int_1^2 2x\,dx$，原函数 $x^2$ 在上限端点处给出 $4$。积分是 $4-1=3$。

把上下限代入同一个原函数，再用上限处的值减去下限处的值。见[第 10.5 节](module_10_ZH.html#ftc2)。

```check
same(integrate(2*x,(x,1,2)),3); same([2**2,1**2],[4,1])
```

### 换元后沿用原变量的积分限 {#keeping-the-old-bounds-after-a-substitution}

在 $\int_0^1 2x(x^2+1)\,dx$ 中，令 $u=x^2+1$。新的积分限 $1$ 和 $2$ 给出 $3/2$。旧的积分限应用于 $u$ 给出 $1/2$。

使用积分变量表达的积分限。如果你保留原来的积分限，在计算前需返回原变量。[小节 10.7](module_10_ZH.html#substitution)

```check
same(integrate(2*x*(x**2+1),(x,0,1)),Rational(3,2)); same([(x**2+1).subs(x,p) for p in (0,1)],[1,2]); same(integrate(u,(u,0,1)),Rational(1,2))
```

### 分部积分时丢失负号 {#losing-the-minus-sign-in-integration-by-parts}

对于 $\int xe^x\,dx$，原函数是 $xe^x-e^x+C$。使用加号得到导数 $(x+2)e^x$。

使用 $\int u\,dv=uv-\int v\,du$，并通过求导来验证得到的原函数。[小节 11.1](module_11_ZH.html#parts)

```check
antideriv(x*exp(x)-exp(x),x*exp(x),x); same(diff(x*exp(x)+exp(x),x),(x+2)*exp(x))
```

### 三角换元时漏掉绝对值 {#dropping-an-absolute-value-in-trigonometric-substitution}

如果 $x=2\sec\theta$ 在 $\theta=3\pi/4$，则平方根 $\sqrt{x^2-4}$ 是 $2$，而 $2\tan\theta=-2$。

写出 $\sqrt{4\tan^2\theta}=2\abs{\tan\theta}$，根据所选的角度区间确定符号。见[第 11.3 节](module_11_ZH.html#trig-substitution)。

```check
ph_m=3*pi/4; same(sqrt((2*sec(ph_m))**2-4),2); same(2*tan(ph_m),-2)
```

### 处理假分式时跳过多项式除法 {#skipping-division-for-an-improper-rational-fraction}

商 $(x^2+1)/x$ 包含一个多项式部分 $x$。单独使用 $1/x$ 在 $2$ 处得到 $1/2$，而完整的表达式得到 $5/2$。

如果分子的次数至少等于分母的次数，先进行除法。分解剩余的真分式。[小节 11.4](module_11_ZH.html#partial-fractions)

```check
same(div(x**2+1,x,x),(x,1)); same(((x**2+1)/x).subs(x,2),Rational(5,2)); same((1/x).subs(x,2),Rational(1,2))
```

### 在辛普森法则中取奇数个子区间 {#using-an-odd-number-of-simpson-subintervals}

有五个子区间时，有六个采样点，足以形成两个完整的子区间对，剩下一个子区间。

为了使用复合辛普森法则，使用偶数个等宽子区间。[小节 11.7](module_11_ZH.html#simpson)

```check
same(divmod(5,2),(2,1)); same(5+1,6)
```

### 求两条曲线之间的面积时漏掉交点 {#ignoring-a-crossing-when-finding-area-between-curves}

在 $[0,1]$ 上，$y=2x-1$ 与 $y=0$ 在 $x=1/2$ 处相交。$2x-1$ 在整个区间上的积分是 $0$，但这些三角形的总面积是 $1/2$。

对于连续曲线，将其在交叉点处分开，并在每一部分上积分上函数减去下函数。[第 12.2 节](module_12_ZH.html#area)

```check
same(solve(2*x-1,x),[S.Half]); same(integrate(2*x-1,(x,0,1)),0); same(integrate(1-2*x,(x,0,S.Half))+integrate(2*x-1,(x,S.Half,1)),S.Half)
```

### 用内外半径之差的平方计算圆环面积 {#squaring-the-difference-of-the-washer-radii}

外半径为 $3$，内半径为 $1$，则环形区域的面积为 $8\pi$。半径差的平方得到 $4\pi$。

在积分横截面积之前，先计算外圆盘面积并减去内圆盘面积。[第 12.3 节](module_12_ZH.html#volumes)

```check
same(pi*(3**2-1**2),8*pi); same(pi*(3-1)**2,4*pi)
```

### 用阶梯步长近似弧长 {#approximating-arc-length-with-staircase-steps}

从 $(0,0)$ 到 $(1,1)$ 的由水平和垂直步长组成的阶梯，其长度为 $2$，无论步长多小。直线段的长度为 $\sqrt2$。

用弦线近似曲线，然后取极限。对于连续可导的图形，使用 $ds=\sqrt{1+(f'(x))^2}\,dx$ 并增加 $x$。[第 12.5 节](module_12_ZH.html#arc-length)

```check
same(1+1,2); same(sqrt(1**2+1**2),sqrt(2)); same(integrate(sqrt(1+diff(x,x)**2),(x,0,1)),sqrt(2))
```

### 在形心公式中除以零面积 {#dividing-by-zero-area-in-a-centroid-formula}

如果上曲线和下曲线都在 $y=x$ 上 $[0,1]$，它们的面积差以及两个一阶矩都消失。形心商的分母为零。

使用平板形心公式计算正面积的形心。对于密度加权的质心，要求总质量为正。[小节 12.7](module_12_ZH.html#centre-of-mass)

```check
same(integrate(x-x,(x,0,1)),0); same(integrate(x*(x-x),(x,0,1)),0); same(integrate((x**2-x**2)/2,(x,0,1)),0)
```

### 把奇点两侧的积分直接相消 {#cancelling-across-an-improper-singularity}

对于 $1/x$ 在 $[-1,1]$ 上，两侧等距的积分在 $0$ 处相消。单独的一侧积分发散。

在内部奇点处分段，分别取两侧的极限。两个极限都有限时，通常意义下的反常积分才存在。见[第 12.8 节](module_12_ZH.html#improper)。

```check
p_m=Symbol('p_m',positive=True); r_m=integrate(1/x,(x,p_m,1)); l_m=integrate(1/x,(x,-1,-p_m)); same(l_m+r_m,0); limit_is(r_m,p_m,0,oo,dir='+'); limit_is(l_m,p_m,0,-oo,dir='+')
```

### 在每个欧拉步中重复使用初始斜率 {#reusing-the-initial-slope-at-every-euler-step}

对于 $y'=y$ 有 $y(0)=1$ 和步长 $1/2$，第一个欧拉值是 $3/2$。下一个斜率是 $3/2$，因此下一个值是 $9/4$。重复使用斜率 $1$ 将得到 $2$。

在每次欧拉更新前，先在当前点评估方向场。[小节 13.4](module_13_ZH.html#euler)

```check
h_m=Rational(1,2); y1_m=1+h_m; same([y1_m,y1_m+h_m*y1_m,y1_m+h_m],[Rational(3,2),Rational(9,4),2])
```

### 通过除法丢失一个平衡点 {#losing-an-equilibrium-by-division}

分离 $y'=y(1-y)$ 时，通过除以 $y(1-y)$ 排除常数解 $y=0$ 和 $y=1$。两者都满足原方程。

检查你除以的那个因子的零点，并包含任何满足原方程的常数解。[小节 13.5](module_13_ZH.html#separable)

```check
same([diff(p,t)-p*(1-p) for p in (0,1)],[0,0])
```

### 仅将一个项乘以积分因子 {#multiplying-only-one-term-by-the-integrating-factor}

对于 $y'+2y=3$，因子是 $e^{2t}$。如果右边保持 $3$，变换后的方程给出错误的解。例如，常数解 $y=3/2$ 给出变换后的导数 $3e^{2t}$。

将整个方程乘以积分因子，并在左边识别乘积导数。[小节 13.7](module_13_ZH.html#linear)

```check
mu_m=exp(2*t); same(diff(Rational(3,2),t)+2*Rational(3,2),3); same(diff(mu_m*Rational(3,2),t),3*mu_m)
```

### 出现重根时重复使用同一个解 {#using-one-solution-twice-at-a-repeated-root}

对于 $y''-2y'+y=0$，特征根 $1$ 是重复的。两个 $e^t$ 的副本只给出一个独立的常数。函数 $te^t$ 给出第二个解。

对于常系数二阶方程中的重复根 $r$，使用 $e^{rt}$ 和 $te^{rt}$。[小节 13.8](module_13_ZH.html#second-order)

```check
same(factor(r**2-2*r+1),(r-1)**2); same([diff(F,t,2)-2*diff(F,t)+F for F in (exp(t),t*exp(t))],[0,0]); same(wronskian([exp(t),t*exp(t)],t).subs(t,0),1)
```

## 数列与级数 {#series}

### 以为有界数列一定收敛 {#treating-a-bounded-sequence-as-convergent}

$(-1)^n$ 的各项始终介于 $-1$ 和 $1$ 之间，但偶数和奇数索引给出不同的值。

有界性与单调性共同保证收敛。否则，检查其各项的行为。[小节 14.1](module_14_ZH.html#sequences)

```check
same([(-1)**i for i in (2,3,4,5)],[1,-1,1,-1])
```

### 混淆通项的极限与级数的和 {#confusing-the-term-limit-with-the-series-sum}

对于 $\sum_{n=1}^\infty 2^{-n}$，各项趋于 $0$，但部分和趋于 $1$。

取部分和的极限以求级数和。[小节 14.3](module_14_ZH.html#series)

```check
limit_is(2**(-x),x,oo,0); same(summation(2**(-n),(n,1,oo)),1)
```

### 用通项趋于零证明级数收敛 {#using-a-zero-term-limit-to-prove-convergence}

项 $1/n$ 趋于 $0$，然而调和级数发散。例如，索引从 $5$ 到 $8$ 的四项之和至少为 $4/8=1/2$，且每个后续翻倍的块至少再加 $1/2$。

使用项测试来排除收敛性，当项不趋于零时。使用另一种测试来建立收敛性。[小节 14.4](module_14_ZH.html#harmonic)

```check
limit_is(1/x,x,oo,0); same(Rational(4,8),Rational(1,2)); holds(sum(Rational(1,j) for j in range(5,9))>=Rational(1,2))
```

### 比较方向错误 {#pointing-a-comparison-the-wrong-way}

调和项 $1/n$ 在 $n>1$ 时超过 $1/n^2$。较小的级数收敛，而较大的级数发散。

对于非负项，一个收敛的上级级数可以证明其下方级数的收敛性。一个发散的下级级数可以证明其上方级数的发散性。[小节 14.6](module_14_ZH.html#comparison)

```check
N_m=Symbol('N_m',integer=True,positive=True); holds(factor(1/(N_m+1)-1/(N_m+1)**2).is_positive); same(summation(1/n**2,(n,1,oo)),pi**2/6); holds(summation(1/n,(n,1,oo))==oo)
```

### 仅凭正负交替判断级数收敛 {#using-alternating-signs-alone}

项 $(-1)^n$ 交替变化，但它们的绝对值保持在 $1$。通过 $1,2,3,4$ 的部分和为 $-1,0,-1,0$。

对于交错级数判别法，检查项的绝对值最终是否递减到零。[小节 14称 14.7](module_14_ZH.html#alternating)

```check
same([sum((-1)**j for j in range(1,k_m+1)) for k_m in (1,2,3,4)],[-1,0,-1,0])
```

### 在比值极限为一时直接下结论 {#deciding-from-a-ratio-limit-of-one}

对于两者 $1/n$ 和 $1/n^2$，连续项的比值趋于 $1$。只有这两个级数中的第二个是收敛的。

比值极限等于 $1$ 时，不能由此判断收敛性。应尝试依据级数各项形式的其他判别法。见[第 14.8 节](module_14_ZH.html#absolute)。

```check
limit_is(x/(x+1),x,oo,1); limit_is((x/(x+1))**2,x,oo,1); holds(summation(1/n,(n,1,oo))==oo); same(summation(1/n**2,(n,1,oo)),pi**2/6)
```

### 只凭收敛半径把两个端点都计入 {#including-both-endpoints-from-the-radius-alone}

对于 $\sum_{n=1}^\infty x^n/n$，半径是 $1$。在 $x=1$ 处级数是调和级数。在 $x=-1$ 处它通过交错级数判别法收敛。

用半径确定中心附近的开区间。单独测试每个有限端点。[小节 15.1](module_15_ZH.html#power-series)

```check
limit_is(x/(x+1),x,oo,1); holds(summation(1/n,(n,1,oo))==oo); same(summation((-1)**n/n,(n,1,oo)),-log(2))
```

### 在收敛区间之外使用等比级数展开 {#using-a-geometric-expansion-outside-its-interval}

公式 $1/(1-x)$ 给出 $-1$ 在 $x=2$ 处。项 $2^n$ 增长，因此在该处的几何级数不收敛到 $-1$。

对于几何级数 $\sum_{n=0}^\infty x^n$，仅在 $\abs{x}<1$ 处使用公式 $1/(1-x)$。[小节 15.2](module_15_ZH.html#functions-as-series)

```check
same(1/(1-Integer(2)),-1); limit_is(2**x,x,oo,oo); same(summation((S.Half)**n,(n,0,oo)),2)
```

### 把求导前的端点收敛性沿用到求导后的级数 {#carrying-endpoint-convergence-through-differentiation}

幂级数 $\sum_{n=1}^\infty x^n/n^2$ 在 $x=1$ 处收敛。求导后端点项变为 $1/n$，它们的和发散。

在收敛半径内逐项求导。对新级数重新检查端点。[小节 15.3](module_15_ZH.html#term-by-term)

```check
same(diff(x**n/n**2,x),x**(n-1)/n); same(summation(1/n**2,(n,1,oo)),pi**2/6); holds(summation(1/n,(n,1,oo))==oo)
```

### 忘记泰勒系数中的阶乘 {#forgetting-the-factorial-in-a-taylor-coefficient}

$e^x$ 在 $0$ 处的二阶导数是 $1$。将 $x^2$ 代入泰勒多项式得到二阶导数 $2$ 在 $0$ 处。使用 $x^2/2$ 得到 $1$。

将 $f^{(n)}(a)/n!$ 作为 $(x-a)^n$ 的系数。[小节 15.4](module_15_ZH.html#taylor-series)

```check
same(diff(exp(x),x,2).subs(x,0),1); same(diff(x**2,x,2).subs(x,0),2); same(diff(x**2/factorial(2),x,2).subs(x,0),1)
```

### 把首个舍去项当作通用的误差上界 {#taking-the-first-omitted-term-as-a-universal-error-bound}

对于 $e^x$ 在 $x=1$ 处，常数泰勒近似为 $1$。下一项是 $1$，但误差 $e-1$ 超过它。

在区间上对所需的导数进行界估计，并应用泰勒不等式。下一项的界需要单独的结果，例如交替级数估计。[第15.5节](module_15_ZH.html#taylor-theorem)

```check
same(exp(0)+exp(0)*1,2); holds(E-1>1)
```

## 曲线、向量和多元函数 {#several}

### 忽略参数区间 {#leaving-out-the-parameter-interval}

对于 $(x,y)=(\cos t,\sin t)$，从 $t=0$ 到 $t=\pi$ 的值描绘了上半圆。延伸到 $2\pi$ 则描绘了整个圆。

指定参数区间以及其被遍历的方向。[第16.1节](module_16_ZH.html#parametric)

```check
same([[cos(t).subs(t,p),sin(t).subs(t,p)] for p in (0,pi/2,pi,3*pi/2,2*pi)],[[1,0],[0,1],[-1,0],[0,-1],[1,0]])
```

### 将垂直切线视为有限斜率 {#treating-a-vertical-tangent-as-a-finite-slope}

在 $(x,y)=(t^2,t)$ 处，$t=0$ 和 $dx/dt=0$ 以及 $dy/dt=1$。切向量指向垂直方向。

仅在 $(dy/dt)/(dx/dt)$ 时使用 $dx/dt\ne0$。非零垂直切向量给出垂直切线。[第16.2节](module_16_ZH.html#parametric-calculus)

```check
same([diff(t**2,t).subs(t,0),diff(t,t)],[0,1])
```

### 使用反正切函数而不检查象限 {#using-arctangent-without-checking-the-quadrant}

在 $(-1,1)$，$\arctan(y/x)=-\pi/4$。对于半径 $\sqrt2$，该角度给出 $(1,-1)$。正确的角度是 $3\pi/4$。

选择两个坐标中的角度，例如使用二参数反正切函数，当取正值半径时。[小节 16.3](module_16_ZH.html#polar)

```check
same(atan(-1),-pi/4); same([sqrt(2)*cos(-pi/4),sqrt(2)*sin(-pi/4)],[1,-1]); same(atan2(1,-1),3*pi/4)
```

### 求向量投影时误除以长度 {#dividing-a-vector-projection-by-length-instead-of-length-squared}

将 $\langle2,3\rangle$ 投影到 $\langle2,0\rangle$ 上得到 $\langle2,0\rangle$。将点积除以长度并乘以 $\langle2,0\rangle$ 得到 $\langle4,0\rangle$。

对于投影到非零向量 $\vb a$，乘以 $\vb a$ 乘以 $(\vb b\cdot\vb a)/(\vb a\cdot\vb a)$。[小节 16.5](module_16_ZH.html#projections)

```check
a_m,b_m=Matrix([2,0]),Matrix([2,3]); same(b_m.dot(a_m)/a_m.dot(a_m)*a_m,Matrix([2,0])); same(b_m.dot(a_m)/a_m.norm()*a_m,Matrix([4,0]))
```

### 交换叉乘因子 {#swapping-cross-product-factors}

叉乘 $\vb i\times\vb j$ 是 $\vb k$，而 $\vb j\times\vb i$ 是 $-\vb k$。

保持因子的顺序并使用右手法则确定方向。[小节 16.6](module_16_ZH.html#cross)

```check
i_m,j_m,k_m=(Matrix(v_m) for v_m in ([1,0,0],[0,1,0],[0,0,1])); same(i_m.cross(j_m),k_m); same(j_m.cross(i_m),-k_m)
```

### 只沿直线检验多元函数的极限 {#checking-only-straight-paths-to-a-multivariable-limit}

对于 $f(x,y)=x^2y/(x^4+y^2)$，通过原点的每条直线上的极限是 $0$。沿 $y=x^2$，值在原点附近为 $1/2$。

两条趋于不同极限的路径可以反驳一个极限的存在。要证明一个极限，找到一个对于所有足够接近的点都成立的界。[小节 17.2](module_17_ZH.html#paths)

```check
F_m=x**2*y/(x**4+y**2); q_m=Symbol('q_m',real=True,nonzero=True); limit_is(F_m.subs(y,q_m*x),x,0,0); same(F_m.subs(y,0),0); same(F_m.subs(x,0),0); same(F_m.subs(y,x**2),Rational(1,2))
```

### 求偏导数时同时改变所有自变量 {#differentiating-all-inputs-at-once}

如果 $f(x,y)=xy^2$，则 $f_x=y^2$。在 $(2,3)$ 处，其值为 $9$，而 $f_y=2xy$ 给出 $12$。

求偏导数时，保持其余自变量不变。见[第 17.3 节](module_17_ZH.html#partial-derivatives)。

```check
same(diff(x*y**2,x),y**2); same(diff(x*y**2,y),2*x*y); same([diff(x*y**2,v_m).subs({x:2,y:3}) for v_m in (x,y)],[9,12])
```

### 把微分当作实际的改变量 {#equating-the-differential-with-the-actual-change}

在 $(1,1)$ 处对于 $z=x^2+y^2$，改变 $x$ 量为 $1$ 时，得到微分 $dz=2$，实际变化为 $\Delta z=3$。

对于可微函数，使用微分作为小变化的线性近似。[小节 17.4](module_17_ZH.html#tangent-planes)

```check
F_m=x**2+y**2; same(diff(F_m,x).subs({x:1,y:1})*1,2); same(F_m.subs({x:2,y:1})-F_m.subs({x:1,y:1}),3)
```

### 使用未归一化的方向向量 {#using-a-non-unit-direction-vector}

对于 $f(x,y)=x$ 方向为 $\langle3,4\rangle$ 的方向导数，单位距离的变化率是 $3/5$。将其梯度与原向量点乘得到 $3$。

在取方向向量与梯度点乘之前，先将其归一化。[小节 17.6](module_17_ZH.html#gradient)

```check
v_m=Matrix([3,4]); g_m=Matrix([1,0]); same([v_m.norm(),g_m.dot(v_m/v_m.norm()),g_m.dot(v_m)],[5,Rational(3,5),3])
```

### 只用一个二阶偏导数判定极值 {#classifying-by-one-second-partial-alone}

在原点对于 $x^2-y^2$, $f_{xx}=2$，但Hessian行列式是 $-4$。沿坐标轴在原点附近函数取相反符号。

在具有连续二阶偏导数的驻点，负的行列式给出鞍点，无论 $f_{xx}$ 的符号如何。[小节 18.2](module_18_ZH.html#second-derivative-test)

```check
F_m=x**2-y**2; same(hessian(F_m,(x,y)).det(),-4); same(diff(F_m,x,2),2); same([F_m.subs({x:1,y:0}),F_m.subs({x:0,y:1})],[1,-1])
```

### 以为海森行列式为零也能判定极值 {#taking-a-zero-hessian-determinant-as-a-classification}

$x^4+y^2$ 和 $x^4-y^2$ 在原点处的行列式都是 $0$。第一个在那里有一个极小值，第二个在任意接近的点上都有正负两种符号。

零行列式使得测试无法确定。检查邻近点的函数值或使用其他论证。[小节 18.2](module_18_ZH.html#second-derivative-test)

```check
F_m,G_m=x**4+y**2,x**4-y**2; same([hessian(X,(x,y)).det().subs({x:0,y:0}) for X in (F_m,G_m)],[0,0]); p_m=Symbol('p_m',positive=True); holds(F_m.subs({x:p_m,y:p_m})>0); holds(G_m.subs({x:p_m,y:0})>0); holds(G_m.subs({x:0,y:p_m})<0)
```

### 求极值时漏掉区域的角点 {#missing-the-corners-of-a-region}

在 $[0,1]\times[0,1]$ 上，$f(x,y)=x+y$ 没有驻点。其最小值和最大值分别是 $0$ 和 $2$，出现在角落处。

对于在闭合有界区域上的连续函数，将内部候选点与每个边界段上的极值进行比较，包括端点。[小节 18.3](module_18_ZH.html#absolute-extrema)

```check
same([diff(x+y,v_m) for v_m in (x,y)],[1,1]); same([a_m+b_m for a_m,b_m in ((0,0),(1,0),(0,1),(1,1))],[0,1,1,2])
```

### 解拉格朗日乘子方程时直接除以变量 {#dividing-by-a-variable-in-a-multiplier-equation}

在 $x^2+y^2=1$ 上最大化 $y$ 得到一个乘数方程 $0=2\lambda x$。最大值出现在 $(0,1)$，其中取消 $x$ 会丢失该最大值。

当一个因子可以消失时，保留两个分支。用约束条件求解，并单独检查约束梯度消失的点。[小节 18.4](module_18_ZH.html#lagrange)

```check
l=Symbol('l'); same(solve([2*x*l,2*y*l-1,x*x+y*y-1],(x,y,l)),[(0,-1,-Rational(1,2)),(0,1,Rational(1,2))])
```

### 混淆竖直残差与水平残差 {#treating-vertical-and-horizontal-residuals-alike}

对于点 $(0,0),(1,2),(2,2)$，在 $x$ 上拟合 $y$ 得到斜率 $1$。在 $y$ 上拟合 $x$ 得到斜率 $3/4$，其倒数为 $4/3$。

选择你要预测的变量。普通最小二乘法最小化该响应变量的平方误差。[小节 18称 18.5](module_18_ZH.html#least-squares)

```check
xs_m,ys_m=Matrix([0,1,2]),Matrix([0,2,2]); xc_m,yc_m=xs_m-ones(3,1),ys_m-ones(3,1)*Rational(4,3); same([xc_m.dot(yc_m)/xc_m.dot(xc_m),xc_m.dot(yc_m)/yc_m.dot(yc_m)],[1,Rational(3,4)]); same(1/Rational(3,4),Rational(4,3))
```

### 以为梯度下降的步长越大越快 {#assuming-a-bigger-gradient-step-is-faster}

对于 $f(x)=x^2$，更新为 $x\mapsto(1-2\eta)x$。从 $1$ 开始，步长 $\eta=1/2$ 立即到达 $0$，但 $\eta=3/4$ 到达 $-1/2$。

检查步长和曲率如何影响每次更新。较大的步长可能导致震荡，过大的步长可能导致发散。[小节 18.6](module_18_ZH.html#gradient-descent)

```check
same([1-h_m*diff(x**2,x).subs(x,1) for h_m in (Rational(1,2),Rational(3,4))],[0,-Rational(1,2)])
```

## 多重积分和向量微积分 {#multiple}

### 换元后仍使用原变量的矩形积分限 {#keeping-rectangular-bounds-with-the-wrong-variables}

对 $f(x,y)=x$ 在 $0\le x\le2$，$0\le y\le1$ 上积分得到 $2$。交换微分顺序，同时保持数值上下限不变，得到 $1$。

改变积分顺序时，每个变量都要保持正确的区间。[小节 19.2](module_19_ZH.html#iterated)

```check
same(integrate(x,(y,0,1),(x,0,2)),2); same(integrate(x,(x,0,1),(y,0,2)),1)
```

### 用外接矩形的边界代替三角形切片的边界 {#using-the-enclosing-rectangle-for-a-triangular-slice}

对于 $0\le y\le x\le1$，垂直切片的长度为 $x$。对每个切片使用上界 $1$ 得到面积 $1$，而三角形的面积为 $1/2$。

将一个切片的下边和上边作为外变量的函数来描述。[小节 19.3](module_19_ZH.html#general-regions)

```check
same(integrate(1,(y,0,x),(x,0,1)),Rational(1,2)); same(integrate(1,(y,0,1),(x,0,1)),1)
```

### 在极坐标面积计算中忽略因子 r {#dropping-the-factor-r-in-polar-area}

对于单位圆，对 $dr\,d\theta$ 在 $0\le r\le1$，$0\le\theta\le2\pi$ 上积分得到 $2\pi$。对 $r\,dr\,d\theta$ 积分得到 $\pi$。

在极坐标中，对于被覆盖一次的平面区域，用 $r\,dr\,d\theta$ 替代 $dA$。[小节 19.4](module_19_ZH.html#polar)

```check
same(integrate(1,(r,0,1),(theta,0,2*pi)),2*pi); same(integrate(r,(r,0,1),(theta,0,2*pi)),pi)
```

### 把密度值读成概率 {#reading-the-height-of-a-density-as-a-probability}

在 $[0,1/2]\times[0,1/2]$ 上的常密度 $4$ 的总积分是 $1$。该正方形中的一个点的概率是 $0$。

对联合密度函数在一个区域上积分得到一个概率。其点wise高度可以超过 $1$。[小节 19.5](module_19_ZH.html#joint-densities)

```check
same(integrate(4,(y,0,S.Half),(x,0,S.Half)),1); same(integrate(4,(y,0,0),(x,0,0)),0); holds(4>1)
```

### 把球坐标的极角范围当作一整圈 {#using-the-polar-angle-as-a-full-turn-in-spherical-coordinates}

在球半径 $1$ 和极角 $\varphi=\pi$ 处，高度是 $z=-1$。在 $2\pi$ 处高度回到 $1$。

从正垂直轴测量 $\varphi$，以 $0\le\varphi\le\pi$ 为单位。方位角 $\theta$ 完成一整圈。[小节 19.7](module_19_ZH.html#spherical)

```check
same([cos(pi),cos(2*pi)],[-1,1]); same(integrate(sin(t),(t,0,pi)),2)
```

### 换元算面积时保留雅可比行列式的负号 {#keeping-the-sign-of-a-negative-area-jacobian}

映射 $(u,v)\mapsto(v,u)$ 保持单位正方形但行列式为 $-1$。积分该符号行列式将得到面积 $-1$。

在面积或体积计算中使用雅可比行列式的绝对值。[小节 19.8](module_19_ZH.html#change-of-variables)

```check
J_m=Matrix([v,u]).jacobian([u,v]).det(); same(J_m,-1); same(integrate(Abs(J_m),(u,0,1),(v,0,1)),1)
```

### 标量曲线积分中漏乘速率 {#omitting-speed-in-a-scalar-line-integral}

对于线 $\vb r(t)=\langle3t,4t\rangle$ 上的 $0\le t\le1$，积分 $1$ 关于弧长是 $5$。积分 $1$ 关于 $t$ 得到 $1$。

在标量线积分中，替换 $ds=\norm{\vb r'(t)}\,dt$. [小节 20.2](module_20_ZH.html#line-integrals)

```check
r_m=Matrix([3*t,4*t]); same(integrate(r_m.diff(t).norm(),(t,0,1)),5); same(integrate(1,(t,0,1)),1)
```

### 计算做功时忽略路径的定向 {#ignoring-orientation-for-the-work-integral}

对于场 $\vb F=\langle1,0\rangle$，从 $(0,0)$ 移动到 $(2,0)$ 产生功 $2$。反向路径产生 $-2$.

积分 $\vb F\cdot d\vb r$ 时保持路径方向。标量弧长积分使用正长度元素。 [小节 20.2](module_20_ZH.html#direction)

```check
F_m=Matrix([1,0]); same([integrate(F_m.dot(Matrix([X,0]).diff(t)),(t,0,1)) for X in (2*t,2-2*t)],[2,-2])
```

### 在有孔区域直接用偏导数判别保守场 {#using-a-derivative-test-across-a-hole}

场 $\langle-y,x\rangle/(x^2+y^2)$ 在原点以外满足 $P_y=Q_x$。它在单位圆上的逆时针环流量是 $2\pi$，因此在穿孔平面上没有势函数。

对于平面导数测试，检查连续的一阶偏导数和简单连通性。当定义域有空洞时，测试路径独立性或直接构造势函数。 [小节 20.3](module_20_ZH.html#test)

```check
P_m,Q_m=-y/(x*x+y*y),x/(x*x+y*y); same(diff(P_m,y),diff(Q_m,x)); circ_m=Matrix([P_m,Q_m]).subs({x:cos(t),y:sin(t)},simultaneous=True).dot(Matrix([cos(t),sin(t)]).diff(t)); same(integrate(simplify(circ_m),(t,0,2*pi)),2*pi)
```

### 把对一个变量积分所得的积分常数当作固定数值 {#treating-a-partial-integration-constant-as-a-number}

对于 $f_x=2x$ 和 $f_y=2y$，在 $x$ 中积分得到 $x^2+g(y)$。一个数值常数会得到 $f_y=0$。选择 $g(y)=y^2$ 得到所需的二阶偏导。

在对一个偏导数进行积分后，允许保留固定变量的任意函数。通过其他偏导数确定它。[小节 20.3](module_20_ZH.html#potential)

```check
same(diff(x**2+3,y),0); same([diff(x*x+y*y,v_m) for v_m in (x,y)],[2*x,2*y])
```

### 用顺时针定向的符号套用格林定理的环量公式 {#using-the-clockwise-sign-in-greens-circulation-formula}

对于 $\vb F=\langle-y/2,x/2\rangle$ 在单位圆上，逆时针环流是 $\pi$。顺时针遍历得到 $-\pi$。

对于格林环流公式，将边界定向为区域在你的左侧。对于相反方向遍历，要反转符号。[小节 20.4](module_20_ZH.html#green)

```check
C_m=Matrix([cos(t),sin(t)]); F_m=Matrix([-C_m[1]/2,C_m[0]/2]); same(integrate(simplify(F_m.dot(C_m.diff(t))),(t,0,2*pi)),pi); same(integrate(simplify(F_m.dot(C_m.diff(t))),(t,2*pi,0)),-pi)
```

### 把参数平面中的面积当作曲面面积 {#using-the-parameter-area-as-surface-area}

对于 $\vb r(u,v)=\langle2u,3v,0\rangle$ 在单位参数方格上，实际的片是面积为 $6$ 的矩形。它的参数方格面积为 $1$。

对于一个光滑的单覆盖片，在标量曲面积分中，将参数面积乘以 $\norm{\vb r_u\times\vb r_v}$。[小节 20.6](module_20_ZH.html#flux)

```check
R_m=Matrix([2*u,3*v,0]); same(R_m.diff(u).cross(R_m.diff(v)).norm(),6); same(integrate(1,(u,0,1),(v,0,1)),1)
```

### 直接把散度定理用于非闭曲面 {#applying-the-divergence-theorem-to-an-open-surface-alone}

对于常数场 $\langle0,0,1\rangle$，单位立方体顶部向上的通量为 $1$。其散度为 $0$。底部贡献 $-1$，因此闭合曲面通量为 $0$。

应用散度定理到一个有界实体的整个分段光滑的向外指向边界上，该场在实体邻域内连续可微。[第20.7节](module_20_ZH.html#stokes-divergence)

```check
F_m=Matrix([0,0,1]); same([F_m.dot(Matrix([0,0,p_m])) for p_m in (1,-1)],[1,-1]); same(sum(diff(q_m,p_m) for q_m,p_m in zip(F_m,(x,y,z))),0); same(1-1,0)
```
