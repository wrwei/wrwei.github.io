---
title: 变化率、近似与洛必达法则
part: 2
lead: 用导数关联两个量的变化率、用切线近似函数，并估计测量误差如何传到结果中。你还将用牛顿法求方程的根，并用洛必达法则处理极限法则无法直接求出的极限。
minutes: 255
needs: 模块 1 到 6（微分规则， $e^x$, $\ln x$, 隐函数求导）
goals:
  - 用图示、一个在每一时刻都成立的方程和链式法则来解决相关变化率问题
  - 用线性化在一点附近近似函数，使用微分，并判断近似有多好
  - 估计测量误差如何传播到计算结果中，作为绝对误差和相对误差
  - 用牛顿法解方程，解释为什么其正确数字大致翻倍，并识别它失效的情况
  - 使用洛必达法则和对数求解形式为 $0/0$, $\infty/\infty$, $0\cdot\infty$, $\infty-\infty$, $1^\infty$, $0^0$ 和 $\infty^0$ 的极限
  - 证明对数增长比幂函数慢，幂函数增长又比指数函数慢
---

## 相关变化率 {#related-rates}

当两个量通过方程关联，并且都随时间变化时，它们的变化率也相互关联。模块 5 的链式法则，“变化率相乘”，将量之间的方程转化为变化率之间的方程：如果你知道其中一个的变化率，就可以求出另一个的变化率。这类问题称为 **相关变化率** 问题。

一架5米长的梯子靠在垂直的墙上，地面上水平放置。梯子底部最初距离墙1米，以恒定的0.5 m/s速度被拉离墙。经过 $t$ 秒后，底部距离墙 $x = 1 + 0.5t$ 米，根据毕达哥拉斯定理，顶部在墙上 $y = \sqrt{25 - x^2}$ 米高：

```valuetable
t = 0, 1, 2, 3, 4, 5, 6, 7
$x$ = 1 + t/2
$y = \sqrt{25 - x^2}$ = sqrt(25 - (1 + t/2)**2)
digits = 4
---
t | x | y = \sqrt{25 - x^2}
0 | 1 | 4.899
1 | 1.5 | 4.770
2 | 2 | 4.583
3 | 2.5 | 4.330
4 | 3 | 4
5 | 3.5 | 3.571
6 | 4 | 3
7 | 4.5 | 2.179
```

底部以恒定速度移动，但顶部并不如此。第一秒内，顶部下降 $4.899 - 4.770 \approx 0.13$ 米；在第八秒内，从 $t = 7$ 移动到地面 $t = 8$，当 $x = 5$ 时，顶部再下降 $2.179$ 米。当底部距离墙3米时，即 $t = 4$，顶部下降的速度是多少？在 $t = 4$ 前后秒的下降量表明速度在0.330到0.429 m/s之间。要精确求出这个速度，你并不需要 $y$ 的公式，只需要在每一时刻 $x$ 和 $y$ 之间的关系方程。

```check
tl = symbols('t', real=True)
Xl = 1 + tl/2; Yl = sqrt(25 - Xl**2)
rounds(Yl.subs(tl, 0), '4.899'); rounds(Yl.subs(tl, 1), '4.770'); rounds(Yl.subs(tl, 0) - Yl.subs(tl, 1), '0.13')
rounds(Yl.subs(tl, 7) - Yl.subs(tl, 8), '2.179'); same(Yl.subs(tl, 8), 0); same(Xl.subs(tl, 8), 5); same(Xl.subs(tl, 4), 3)
rounds(Yl.subs(tl, 3) - Yl.subs(tl, 4), '0.330'); rounds(Yl.subs(tl, 4) - Yl.subs(tl, 5), '0.429')
```

::: keyidea
**相关变化率的策略。**

1. 画一个示意图。给每一个随时间变化的量赋予一个字母，并写出常量。
2. 将你已知的速率和你想要的速率表示为时间 $t$ 的导数，单位为： "$dx/dt = 0.5$ m/s；求 $dy/dt$ 当 $x = 3$ m"。
3. 找出一个联系变化量的方程，并且在每一瞬间都成立：从几何（勾股定理、相似三角形、体积公式）或从物理。
4. 对两边关于 $t$ 求导。每个变化量都是 $t$ 的函数，因此每个都需要应用链式法则： $\dfrac{d}{dt}\big(x^2\big) = 2x\,\dfrac{dx}{dt}$。
5. 现在仅代入你关心的瞬间的值，并求解你想要的速率。检查其符号和单位。
:::

::: figure id=fig-07-1
本节的四个相关变化率问题，变化量用字母表示：一梯子的底部从墙边被拉离（例7.1），一个圆锥形水箱在注水（例7.2），一个人从街灯远离行走（例7.3），以及一个气球上升而观察者注视它（例7.4）。
:::

::: example 滑动的梯子
当梯子底部距离墙3米时，求梯子顶部下落的速度。

设 $x$ 为梯子底部到墙的距离， $y$ 为梯子顶端的高度，单位均为米，时间为 $t$ 秒（图7.1，左上）。你已知 $dx/dt = 0.5$，并希望求 $dy/dt$ 当 $x = 3$ 时。在每一时刻，梯子、墙和地面形成一个直角三角形，斜边为5米，因此

$$x^2 + y^2 = 25.$$

对两边关于 $t$ 求导。根据链式法则， $x^2$ 的导数为 $2x\,dx/dt$，常数25的导数为0：

$$\begin{aligned} 2x\,\frac{dx}{dt} + 2y\,\frac{dy}{dt} &= 0, \\ \text{so}\qquad \frac{dy}{dt} &= -\frac{x}{y}\,\frac{dx}{dt}. \end{aligned}$$

现在代入某一时刻的值。当 $x = 3$， $y = \sqrt{25 - 9} = 4$，和

$$\frac{dy}{dt} = -\frac{3}{4} \cdot 0.5 = -0.375 \text{ m/s}.$$

负号表示 $y$ 在减小：梯子顶端以0.375 m/s的速度下滑，介于表格中的两个估计值之间。

```check
xt, yt = Function('x')(t), Function('y')(t)
same(diff(xt**2 + yt**2, t), 2*xt*diff(xt, t) + 2*yt*diff(yt, t))
same(solve(2*xt*diff(xt, t) + 2*yt*diff(yt, t), diff(yt, t)), [-xt/yt*diff(xt, t)])
same(sqrt(25 - 9), 4); same(-Rational(3, 4)*Rational(1, 2), -Rational(375, 1000))
same(diff(Yl, tl).subs(tl, 4), -Rational(3, 8))          # the same rate from the formula y(t) of the table
holds(Rational(330, 1000) < Rational(3, 8)); holds(Rational(3, 8) < Rational(429, 1000))
```
:::

公式 $dy/dt = -(x/y)\,dx/dt$ 也解释了表格：当顶端接近地面时， $y$ 趋近于0，顶端的速度趋于无穷大。没有真实的梯子能以这种方式运动，因此该模型假设顶端始终在墙上，必须在顶端到达地面之前失效。

::: pitfall
不要在对函数求导之前替换变量的值。如果你先将 $x = 3$ 代入 $x^2 + y^2 = 25$，你将得到 $9 + y^2 = 25$，然后对它求导得到 $2y\,dy/dt = 0$：顶部不会变化，这是错误的。你求导的方程必须在每一瞬间都成立，而不仅仅是在你关心的那个瞬间。
:::

### 体积、阴影和角度 {#more-rates}

::: example 填充一个锥形水箱
一个水箱的形状是一个顶点在底部的圆锥体。它的深度是 4 米，顶部是一个半径为 2 米的圆。水以 2 立方米每分钟的速度流入。当水深为 3 米时，水位上升的速度是多少？

设 $h$ 为水的深度， $r$ 为水面的半径，单位为米，时间为 $t$ 分钟（图 7.1，右上角）。你已知 $dV/dt = 2$，想要 $dh/dt$ 当 $h = 3$。水形成一个体积为

$$V = \frac{1}{3}\pi r^2 h.$$

这将三个变化的量联系起来，因此首先消去一个。通过轴做一条垂直切割，显示出两个相似的直角三角形，水箱的三角形的直角边为 4 和 2，水的三角形的直角边为 $h$ 和 $r$。因此 $r/h = 2/4$ 在每一时刻，即 $r = h/2$，并且

$$V = \frac{1}{3}\pi\Big(\frac{h}{2}\Big)^2 h = \frac{\pi}{12}h^3.$$

对 $t$ 求导，使用链式法则：

$$\frac{dV}{dt} = \frac{\pi}{4}h^2\,\frac{dh}{dt}.$$

当 $h = 3$ 时，这表示为 $2 = \dfrac{9\pi}{4}\,\dfrac{dh}{dt}$，因此

$$\frac{dh}{dt} = \frac{8}{9\pi} \approx 0.283 \text{ m/min}.$$

此时水位上升约 28 厘米每分钟。随着水变深，水位上升速度变慢，因为相同的 2 立方米水体分布在更宽的表面上。

```check
hp = symbols('h', positive=True)
same(Rational(1, 3)*pi*(hp/2)**2*hp, pi/12*hp**3)
ht = Function('h')(t)
same(diff(pi/12*ht**3, t), pi/4*ht**2*diff(ht, t))
same((pi/4*hp**2).subs(hp, 3), 9*pi/4)
qq = symbols('q')
dhdt = solve(Eq(2, 9*pi/4*qq), qq)[0]
same(dhdt, 8/(9*pi)); rounds(dhdt, '0.283'); rounds(100*dhdt, '28')
```
:::

::: example 行走者的影子
街边路灯位于 6 米高的杆顶上。一个身高 1.8 米的人以 1.5 米/秒的速度直行远离杆子。此时影子长度如何变化？影子顶端如何移动？

设 $x$ 为人的距离灯杆的水平距离， $s$ 为影子的长度，单位为米（图 7.1，左下）。从灯到影子顶端的光线恰好掠过人的头顶，因此大三角形（灯杆、地面、光线）和小三角形（人、影子、光线）相似。两个三角形的高与底边之比相等：

$$\frac{6}{x + s} = \frac{1.8}{s}.$$

两边同乘以 $s(x + s)$： $6s = 1.8x + 1.8s$，所以 $4.2s = 1.8x$ 和 $s = \dfrac{3}{7}x$。求导，

$$\begin{aligned} \frac{ds}{dt} &= \frac{3}{7}\,\frac{dx}{dt} = \frac{3}{7} \cdot 1.5 \\ &= \frac{9}{14} \approx 0.643 \text{ m/s}. \end{aligned}$$

影子顶端距离灯杆为 $x + s = \dfrac{10}{7}x$，因此其移动速度为 $\dfrac{10}{7} \cdot 1.5 = \dfrac{15}{7} \approx 2.14$ m/s，比人行走速度快。两个答案都不依赖于人的位置：此处关系为线性，因此速率恒定。

```check
xs7, ss7 = symbols('x s', positive=True)
same(solve(Eq(6/(xs7 + ss7), Rational(18, 10)/ss7), ss7), [Rational(3, 7)*xs7])
same(6*ss7 - Rational(18, 10)*(xs7 + ss7), Rational(42, 10)*ss7 - Rational(18, 10)*xs7)
same(Rational(18, 10)/Rational(42, 10), Rational(3, 7))
same(Rational(3, 7)*Rational(3, 2), Rational(9, 14)); rounds(Rational(9, 14), '0.643')
same(xs7 + Rational(3, 7)*xs7, Rational(10, 7)*xs7); same(Rational(10, 7)*Rational(3, 2), Rational(15, 7)); rounds(Rational(15, 7), '2.14')
```
:::

::: example 观察气球上升
一个气球从水平地面上某点以恒定速度 2 m/s 垂直上升，该点距离观察者 400 m。当气球上升到 300 m 高时，观察者视线的仰角增加的速度是多少？

设 $h$ 为气球的高度（单位：米），$\theta$ 为仰角（单位：弧度），在时间 $t$（单位：秒）时（图7.1，右下角）。已知 $dh/dt = 2$，要求 $d\theta/dt$ 当 $h = 300$。在由观察者、发射点和气球构成的直角三角形中，

$$\tan\theta = \frac{h}{400}.$$

对两边关于 $t$ 求导。$\tan\theta$ 的导数为 $\sec^2\theta$（模块5），因此根据链式法则

$$\sec^2\theta\,\frac{d\theta}{dt} = \frac{1}{400}\,\frac{dh}{dt}.$$

当 $h = 300$ 时，视线长度为 $\sqrt{400^2 + 300^2} = 500$，因此 $\cos\theta = 400/500 = 4/5$ 和 $\sec^2\theta = 25/16$。接着

$$\frac{d\theta}{dt} = \frac{1}{400} \cdot 2 \cdot \frac{16}{25} = 0.0032 \text{ rad/s},$$

关于 $0.18^\circ$ 每秒的变化率（乘以 $180/\pi$）。对 $\theta = \arctan(h/400)$ 求导（模块6）得到相同的结果。

```check
tht = Function('theta')(t)
same(diff(tan(tht), t), sec(tht)**2*diff(tht, t))
same(sqrt(400**2 + 300**2), 500)
th0 = atan(Rational(300, 400))
same(cos(th0), Rational(4, 5)); same(sec(th0)**2, Rational(25, 16))
rate7 = Rational(1, 400)*2*Rational(16, 25)
same(rate7, Rational(32, 10000)); rounds(rate7*180/pi, '0.18')
same(2*diff(atan(hp/400), hp).subs(hp, 300), rate7)      # from theta = arctan(h/400)
```
:::

::: pitfall
还有两种常见错误。第一种是符号错误：递减的量具有负的变化率，因此以每分钟2立方米的速度排水的水箱具有$dV/dt = -2$。第二种是角度单位：仅当$\theta$以弧度为单位时，$\tan\theta$的导数才是$\sec^2\theta$（见[第5.4节](module_05_ZH.html#trig)），因此计算过程中使用弧度，并在最后转换答案，如例7.4所示。
:::

::: compute 相关变化率与 SymPy
SymPy 可以完成策略的第 4 步。将 $x$ 和 $y$ 表示为 $t$ 的函数，以 `sp.Function` 为变量，对例 7.1 的方程进行求导，并解出 $dy/dt$：

```python
import sympy as sp
t = sp.symbols('t')
x = sp.Function('x')(t)          # the foot's distance from the wall at time t
y = sp.Function('y')(t)          # the height of the top
link = x**2 + y**2 - 25          # zero at every instant
dlink = sp.diff(link, t)
print(dlink)
dydt = sp.solve(dlink, sp.Derivative(y, t))[0]
print(dydt)
```

```output
2*x(t)*Derivative(x(t), t) + 2*y(t)*Derivative(y(t), t)
-x(t)*Derivative(x(t), t)/y(t)
```

SymPy 将 $dx/dt$ 写作 `Derivative(x(t), t)`。调用 `sp.solve` 时将 `dlink` 视为等于 0 的表达式。此处返回一个 $dy/dt$ 的解的列表，而 `[0]` 取第一个解。现在代入瞬时值，首先求出变化率：

```python
print(dydt.subs(sp.Derivative(x, t), sp.Rational(1, 2)).subs({x: 3, y: 4}))
print(dydt.subs({x: 3, y: 4}))
```

```output
-3/8
-3*Derivative(3, t)/4
```

第一行是例 7.1 的答案 $-3/8 = -0.375$。第二行是 SymPy 在该例之后的陷阱：先代入 $x = 3$ 也会替换 $x(t)$ 内部的 $dx/dt$，从而导致 `Derivative(3, t)`，即常数的导数，为 0。
:::

## 线性近似与微分 {#linear-approximation}

在一个可导函数的图像上放大观察某一点附近的区域，它看起来越来越像一条直线：它的切线。因此，在该点附近，这条易于计算的切线可以作为函数的近似，即使函数本身可能较为复杂。本节将对此进行精确描述，并衡量这种近似有多好。

::: definition 线性化
设 $f$ 在 $a$ 处可导。函数 $f$ 在 $a$ 处的 **线性化** 是指：

$$L(x) = f(a) + f'(a)(x - a),$$

其图像是在 $\big(a, f(a)\big)$ 处 $y = f(x)$ 的切线，用 $f(x) \approx L(x)$ 近似 $x$ 在 $a$ 附近的 **线性近似**，或称切线近似，是 $f$ 在 $a$ 处的近似。
:::

$L$ 是通过点 $\big(a, f(a)\big)$ 且斜率为 $f'(a)$ 的直线，采用 [小节 1.4](module_01_ZH.html#linear) 的点斜式。它在 $a$ 处与 $f$ 在值和斜率上一致：$L(a) = f(a)$ 和 $L'(a) = f'(a)$。

::: figure id=fig-07-2
左：函数 $y = \sqrt x$ 和其在 $a = 4$ 处的切线 $y = L(x)$ 的图像；在 $a$ 附近，它们很难分辨。从 $a$ 到 $a + dx$（此处 $dx = 3$，被夸大以便显示差距），曲线上升 $\Delta y$，切线上升 $dy$； $dx$ 和 $dy$ 是本节后面定义的微分。右：函数 $y = \sin\theta$ 和其在 0 处的切线 $y = \theta$；在绿色带内（即 $\abs{\theta} \le 0.5$），它们几乎重合。
:::

::: example 4 附近平方根的近似
利用 $f(x) = \sqrt x$ 在 $a = 4$ 处的线性近似来估计 $\sqrt{4.1}$ 和 $\sqrt{3.9}$。

这里 $f(4) = 2$ 和 $f'(x) = \dfrac{1}{2\sqrt x}$，因此 $f'(4) = \dfrac14$ 和

$$L(x) = 2 + \frac{1}{4}(x - 4).$$

所以 $\sqrt{4.1} \approx L(4.1) = 2 + \tfrac14(0.1) = 2.025$ 和 $\sqrt{3.9} \approx L(3.9) = 2 - \tfrac14(0.1) = 1.975$。计算器给出 $\sqrt{4.1} \approx 2.024846$ 和 $\sqrt{3.9} \approx 1.974842$：两个估计值都与真实值相差不到 0.0002，而且两者都略微偏大，因为函数 $\sqrt x$ 的图像在其切线之下弯曲（图 7.2，左）。

```check
fsq = sqrt(x)
same(diff(fsq, x), 1/(2*sqrt(x))); same(diff(fsq, x).subs(x, 4), Rational(1, 4))
Lsq = 2 + (x - 4)/4
same(Lsq.subs(x, Rational(41, 10)), Rational(2025, 1000)); same(Lsq.subs(x, Rational(39, 10)), Rational(1975, 1000))
rounds(sqrt(Rational(41, 10)), '2.024846'); rounds(sqrt(Rational(39, 10)), '1.974842')
holds(abs(sqrt(Rational(41, 10)) - Rational(2025, 1000)) < Rational(2, 10000)); holds(abs(sqrt(Rational(39, 10)) - Rational(1975, 1000)) < Rational(2, 10000))
holds(sqrt(Rational(41, 10)) < Rational(2025, 1000)); holds(sqrt(Rational(39, 10)) < Rational(1975, 1000))
```
:::

在离 4 更远还是更近的地方，这个近似有多好？下表比较了 $\sqrt x$ 与 $L(x)$：

```valuetable
x = 3, 3.9, 3.99, 4.01, 4.1, 5
$\sqrt{x}$ = sqrt(x)
$L(x)$ = 2 + (x - 4)/4
$\sqrt{x} - L(x)$ = sqrt(x) - 2 - (x - 4)/4
digits = 6
---
x | \sqrt{x} | L(x) | \sqrt{x} - L(x)
3 | 1.73205 | 1.75 | -0.0179492
3.9 | 1.97484 | 1.975 | -0.000158234
3.99 | 1.99750 | 1.9975 | -1.56446\times10^{-6}
4.01 | 2.00250 | 2.0025 | -1.56055\times10^{-6}
4.1 | 2.02485 | 2.025 | -0.000154327
5 | 2.23607 | 2.25 | -0.0139320
```

有两点显而易见。误差 $\sqrt x - L(x)$ 始终为负：切线位于图像上方。每次 $x$ 靠近 4 的十倍距离，误差缩小约一百倍：在距离 1 处误差为 0.014 或 0.018，在距离 0.1 处为 0.00015 或 0.00016，在距离 0.01 处为 0.0000016。误差行为类似于一个常数乘以 $(x - 4)^2$。

```check
err4 = lambda v: sqrt(v) - Lsq.subs(x, v)
rounds(abs(err4(5)), '0.014'); rounds(abs(err4(3)), '0.018')
rounds(abs(err4(Rational(41, 10))), '0.00015'); rounds(abs(err4(Rational(39, 10))), '0.00016')
rounds(abs(err4(Rational(401, 100))), '0.0000016'); rounds(abs(err4(Rational(399, 100))), '0.0000016')
holds(all(err4(v) < 0 for v in (3, Rational(39, 10), Rational(399, 100), Rational(401, 100), Rational(41, 10), 5)))
```

### 这有多好？ {#how-good}

::: theorem 切线是最佳线性近似
设 $f$ 在 $a$ 处可导，线性化为 $L$，令 $E(x) = f(x) - L(x)$ 为线性近似的误差。则

$$\lim_{x\to a}\frac{E(x)}{x - a} = 0.$$

换句话说，误差即使与距离 $x - a$ 相比也很小。此外，只有 $L$ 具有此性质：如果 $\ell(x) = c + m(x - a)$ 和 $\big(f(x) - \ell(x)\big)/(x - a) \to 0$ 作为 $x \to a$，则 $c = f(a)$ 和 $m = f'(a)$。
:::

::: proof
对于 $x \ne a$，

$$\begin{aligned} \frac{E(x)}{x - a} &= \frac{f(x) - f(a) - f'(a)(x - a)}{x - a} \\ &= \frac{f(x) - f(a)}{x - a} - f'(a). \end{aligned}$$

当 $x \to a$ 的差商趋近于 $f'(a)$ 时，根据导数的定义（模块 4），因此整个表达式趋近于 0。

现在假设 $\ell(x) = c + m(x - a)$ 具有该性质。那么 $f(x) - \ell(x) = \dfrac{f(x) - \ell(x)}{x - a}\,(x - a)$ 趋近于 $0 \cdot 0 = 0$。但 $f$ 在 $a$ 处连续，因为其在该点可导（模块 4），因此 $f(x) - \ell(x)$ 也趋近于 $f(a) - c$。因此 $c = f(a)$，然后

$$\begin{aligned} \frac{f(x) - \ell(x)}{x - a} &= \frac{f(x) - f(a)}{x - a} - m \\ &\to f'(a) - m. \end{aligned}$$

该极限为 0，因此 $m = f'(a)$。
:::

如果你阅读了[第4.4节](module_04_ZH.html#differentiability)末尾的“深入探索”框，你之前已经遇到过这个定理，即“可微意味着局部线性”；这里它被付诸实践。可微性是必要的。在$\abs{x}$处0点的角上，任何直线$c + mx$都不行：$c$必须是$\abs{0} = 0$，然后$\big(\abs{x} - mx\big)/x$从右侧趋近于$1 - m$，$-1 - m$从左侧趋近，这两者都不能同时为0。

```check
ff = Function('f'); fpa, mm_ = symbols('fpa m')                  # fpa stands for f'(a)
same((ff(x) - ff(a) - fpa*(x - a))/(x - a), (ff(x) - ff(a))/(x - a) - fpa)
same((ff(x) - (ff(a) + mm_*(x - a)))/(x - a), (ff(x) - ff(a))/(x - a) - mm_)
limit_is((sqrt(x) - Lsq)/(x - 4), x, 4, 0)                 # an instance: f = sqrt, a = 4
limit_is((Abs(x) - mm_*x)/x, x, 0, 1 - mm_, '+'); limit_is((Abs(x) - mm_*x)/x, x, 0, -1 - mm_, '-')
same(solve([1 - mm_, -1 - mm_], mm_), [])                    # no m makes both one-sided limits 0
```

定理 7.1 说明误差与 $x - a$ 相比很小，但并未说明有多小。表格表明误差是常数乘以 $(x - a)^2$，这是通常情况：如果 $f''$ 在 $a$ 附近连续，那么对于 $x$ 接近 $a$ 的情况，

$$f(x) - L(x) \approx \frac{f''(a)}{2}(x - a)^2,$$

在意义上，$\big(f(x) - L(x)\big)/(x - a)^2$ 趋近于 $f''(a)/2$，当 $x \to a$ 时。并且如果 $\abs{f''} \le M$ 在 $a$ 和 $x$ 之间，那么 $\abs{f(x) - L(x)} \le \dfrac{M}{2}(x - a)^2$。这两点都来自于泰勒定理，该定理在模块 15 中被证明。对于 $\sqrt x$ 在 4 处，$f''(x) = -\tfrac14 x^{-3/2}$，因此 $f''(4) = -\tfrac{1}{32}$，并且在 $x = 4.1$ 处的误差应约为 $-\tfrac{1}{64}(0.1)^2 \approx -0.000156$；表格给出 $-0.000154$。

```check
same(diff(sqrt(x), x, 2), -x**Rational(-3, 2)/4); same(diff(sqrt(x), x, 2).subs(x, 4), -Rational(1, 32))
same(-Rational(1, 32)/2, -Rational(1, 64)); rounds(-Rational(1, 64)*Rational(1, 100), '-0.000156')
limit_is((sqrt(x) - Lsq)/(x - 4)**2, x, 4, -Rational(1, 64))          # the quotient approaches f''(4)/2
rounds(err4(Rational(41, 10)), '-0.000154')
holds(abs(err4(Rational(41, 10))) <= Rational(1, 64)*Rational(1, 100))      # the bound with M = |f''(4)|, the largest on [4, 4.1]
```

::: pitfall
线性近似仅在 $a$ 附近有效。远离该点，切线与曲线将分开： $L(9) = 2 + \tfrac54 = 3.25$，而 $\sqrt9 = 3$。在信任 $f(x) \approx L(x)$ 之前，请问 $x$ 距离 $a$ 多远，以及曲线在中间弯曲的程度如何。

```check
same(Lsq.subs(x, 9), Rational(13, 4)); same(2 + Rational(5, 4), Rational(325, 100)); same(sqrt(9), 3)
```
:::

::: example 小角度近似
求 $\sin\theta$ 在 0 处的线性化，并找出其误差不超过 1% 的角度。

$\sin 0 = 0$，且 $\sin\theta$ 的导数是 $\cos\theta$（模块 5），带 $\cos 0 = 1$。因此 $L(\theta) = 0 + 1\cdot(\theta - 0) = \theta$:

$$\sin\theta \approx \theta \quad\text{for } \theta \text{ near } 0,$$

其中 $\theta$ 以弧度为单位。表格给出了相对误差 $(\theta - \sin\theta)/\sin\theta$，即误差与真实值的比值（第7.3节）：

```valuetable
theta = 0.01, 0.05, 0.1, 0.2, 0.5, 1
$\sin\theta$ = sin(theta)
$\dfrac{\theta - \sin\theta}{\sin\theta}$ = (theta - sin(theta))/sin(theta)
digits = 4
---
\theta | \sin\theta | \dfrac{\theta - \sin\theta}{\sin\theta}
0.01 | 0.01000 | 1.667\times10^{-5}
0.05 | 0.04998 | 0.0004168
0.1 | 0.09983 | 0.001669
0.2 | 0.1987 | 0.006698
0.5 | 0.4794 | 0.04291
1 | 0.8415 | 0.1884
```

相对误差在 $\abs{\theta}$ 约等于 0.24 弧度（约等于 $14^\circ$，计算器显示其在 $\theta = 0.24$ 和 $\theta = 0.25$ 之间超过 0.01）时保持在 0.01 以下，即 1%；在 $\theta = 0.1$ 时约为 0.17%。与上述 $\sqrt x$ 的线性化误差类似，当 $\theta$ 缩小十倍时，它缩小约一百倍。（相对误差是 $\theta$ 的偶函数，因此负角表现相同。）

```check
same(diff(sin(theta), theta).subs(theta, 0), 1); same(sin(0) + 1*(theta - 0), theta)
rel = (theta - sin(theta))/sin(theta)
th1 = nsolve(rel - Rational(1, 100), theta, 0.24)
rounds(th1, '0.24'); rounds(th1*180/pi, '14')
holds(rel.subs(theta, Rational(24, 100)) < Rational(1, 100)); holds(rel.subs(theta, Rational(25, 100)) > Rational(1, 100))
rounds(100*rel.subs(theta, Rational(1, 10)), '0.17'); rounds(rel.subs(theta, Rational(1, 10))/rel.subs(theta, Rational(1, 100)), '100')
same(rel.subs(theta, -theta), rel)
```
:::

物理和工程中经常使用小角度近似。对于一个摆锤，将 $\sin\theta$ 替换为 $\theta$ 会使其运动方程变成 模块 13 可以精确求解的形式，这就是为什么单摆周期的常用公式只在小幅度摆动时成立。以度数表示的近似为 $\sin(\theta^\circ) \approx \pi\theta/180$，带有不便于计算的系数：这也是微积分在弧度中更有效的原因。

### 微分 {#differentials}

莱布尼茨的符号 $dy/dx$ 看起来像一个分数。微分赋予了它的两个部分各自独立的意义。

::: definition 微分
设 $y = f(x)$，其中 $f$ 可导。微分 **differential**$dx$ 是一个独立变量：它可以是任意实数。微分**differential** $dy$ 则定义为

$$dy = f'(x)\,dx.$$

所以 $dy$ 依赖于两个数，即 $x$ 和 $dx$。
:::

对于 $dx \ne 0$，除以 $dx$ 得到 $dy/dx = f'(x)$：导数终究是微分的商。比较 $dy$ 与当 $x$ 改变 $\Delta x = dx$ 时 $y$ 的实际变化量，

$$\Delta y = f(x + dx) - f(x).$$

在图 7.2 左图中，$\Delta y$ 是曲线从 $a$ 到 $a + dx$ 的增量，$dy$ 是同一区间内切线的增量，两者满足 $dy = L(a + dx) - L(a)$。由定理 7.1，当 $dx$ 很小时，$\Delta y - dy$ 相对于 $dx$ 很小，因此 $\Delta y \approx dy$。

```check
dxs = symbols('dx')
same((ff(a) + fpa*((a + dxs) - a)) - (ff(a) + fpa*(a - a)), fpa*dxs)        # L(a + dx) - L(a) = f'(a) dx
```

::: example $dy$ 和 $\Delta y$ 对于一个立方体
设 $y = x^3$。当 $x = 2$ 和 $dx = 0.05$ 时，求 $dy$ 和 $\Delta y$。

$dy = 3x^2\,dx = 3 \cdot 4 \cdot 0.05 = 0.6$。实际变化为

$$\begin{aligned} \Delta y &= 2.05^3 - 2^3 \\ &= 8.615125 - 8 = 0.615125. \end{aligned}$$

微分误差为 $0.015125$，约为 $\Delta y$ 的 2.5%。展开说明误差来源：$(2 + dx)^3 - 8 = 12\,dx + 6\,(dx)^2 + (dx)^3$，而 $dy = 12\,dx$ 仅保留首项。

```check
same(3*2**2*Rational(5, 100), Rational(6, 10))
same(Rational(205, 100)**3, Rational(8615125, 1000000)); same(Rational(205, 100)**3 - 8, Rational(615125, 1000000))
same(Rational(615125, 1000000) - Rational(6, 10), Rational(15125, 1000000)); rounds(100*Rational(15125, 615125), '2.5')
same(expand((2 + dxs)**3 - 8), 12*dxs + 6*dxs**2 + dxs**3); same(diff(x**3, x).subs(x, 2), 12)
```
:::

::: pitfall
$dy$ 不等于 $\Delta y$。微分是沿切线的变化，$\Delta y$ 是沿曲线的变化。它们仅在 $dx$ 很小时才接近，而 $dy$ 是容易计算的，因此有用。
:::

## 传播测量误差 {#errors}

每个测量值都有误差，从测量值计算出的任何量也会继承误差。微分可以估计这种误差：如果 $x$ 被测量时有误差 $\Delta x$，那么 $y = f(x)$ 的误差为

$$\Delta y \approx dy = f'(x)\,\Delta x.$$

::: definition 绝对误差和相对误差
假设一个真值为$x$的量被测量或计算为$\tilde x$（读作“x 波浪”）。$\tilde x$的**误差**为$\Delta x = x - \tilde x$：真值减去近似值，其量级与第7.2节中$f(x) - L(x)$的误差相同。**绝对误差**为$\abs{\Delta x}$。对于$x \ne 0$，**相对误差**为$\abs{\Delta x}/\abs{x}$；以百分比表示，即为**百分比误差**。
:::

实际应用中，你既不知道真实值，也不知道误差，只知道测量值和误差的上界，例如 "10.0 厘米，误差不超过 0.1 厘米"；此时你将上界除以测量值。当误差较小时，这种差异可以忽略。

::: example 一个球体的体积
假设一个球的半径测量为 10.0 cm，误差不超过 0.1 cm。

- (a) 估计由该半径计算出的体积的最大可能误差，作为绝对误差和相对误差。
- (b) 要使体积的误差不超过 1%，半径必须测量到什么精度？

**(a)** $V = \tfrac43\pi r^3$, 所以 $dV = 4\pi r^2\,dr$。与 $r = 10$ 和 $\abs{dr} \le 0.1$，

$$\abs{dV} \le 4\pi \cdot 10^2 \cdot 0.1 = 40\pi \approx 126 \text{ cm}^3.$$

计算出的体积是 $V = \tfrac{4000\pi}{3} \approx 4189$ cm³，因此相对误差最多约为

$$\frac{40\pi}{4000\pi/3} = \frac{3}{100} = 3\%.$$

精确的变化确认了估计值： $V(10.1) - V(10) \approx 126.9$ cm³ 和 $V(9.9) - V(10) \approx -124.4$ cm³。

**(b)** 将$dV = 4\pi r^2\,dr$除以$V = \tfrac43\pi r^3$：

$$\frac{dV}{V} = 3\,\frac{dr}{r}.$$

体积的相对误差是半径相对误差的三倍。为了体积误差不超过 1%，半径误差必须不超过 $\tfrac13\%$：对于 $r = 10$ cm，误差不超过 $10 \times \tfrac{1}{300} \approx 0.033$ cm，即约三分之一毫米。

```check
rp = symbols('r', positive=True)
Vb = Rational(4, 3)*pi*rp**3
same(diff(Vb, rp), 4*pi*rp**2); same(4*pi*10**2*Rational(1, 10), 40*pi); rounds(40*pi, '126')
same(Vb.subs(rp, 10), 4000*pi/3); rounds(4000*pi/3, '4189'); same(40*pi/(4000*pi/3), Rational(3, 100))
rounds(Vb.subs(rp, Rational(101, 10)) - Vb.subs(rp, 10), '126.9'); rounds(Vb.subs(rp, Rational(99, 10)) - Vb.subs(rp, 10), '-124.4')
same(diff(Vb, rp)/Vb, 3/rp)
same(Rational(1, 100)/3, Rational(1, 300)); rounds(10*Rational(1, 300), '0.033')
```
:::

相同的计算适用于任何幂次。若 $y = c\,x^k$，常数为 $c \ne 0$ 和 $k$，则 $dy = ck\,x^{k-1}\,dx$，并除以 $y$，

$$\frac{dy}{y} = k\,\frac{dx}{x}.$$

所以一个 $k$ 次幂的相对误差大约是 $\abs{k}$ 倍的 $x$ 的相对误差。一个平方使它加倍，一个立方使它三倍，一个平方根使它减半，无论常数 $c$ 是什么。

```check
kk = symbols('k')
same(diff(c*x**kk, x)/(c*x**kk), kk/x)
```

::: pitfall
估计 $\Delta y \approx dy$ 是一个线性近似，因此它只适用于小误差。如果半径测量大了 50%，公式说明体积的误差为 $3 \times 50\% = 150\%$，但 $1.5^3 = 3.375$，因此真实误差为 $237.5\%$。对于大误差，计算 $f(x + \Delta x) - f(x)$ 本身。

```check
same(3*50, 150); same(Rational(3, 2)**3, Rational(3375, 1000)); same(100*(Rational(3, 2)**3 - 1), Rational(2375, 10))
```
:::

::: note
计算机也会产生相对误差。浮点数的相对误差至多约为 $10^{-16}$。上述法则说明了计算 $f(x)$ 时这种误差被放大多少：放大倍数为 $\abs{x f'(x)/f(x)}$，即 $f$ 在 $x$ 处的**条件数**。对于 $x^k$，条件数是 $\abs{k}$；对于 $x - 1$，条件数是 $\abs{x/(x - 1)}$，且在 $x = 1$ 附近很大，对应于模块 2 中的相消误差。练习 7.12 进一步讨论条件数。

```check
same(x*diff(x**kk, x)/x**kk, kk); same(x*diff(x - 1, x)/(x - 1), x/(x - 1))
```
:::

## 牛顿法 {#newton}

大多数方程无法通过代数方法精确求解：对 $\cos x = x$ 进行任何重排都无法将 $x$ 单独留在等式的一边，即使存在求解公式，如三次方程 $x^3 - 2x - 5 = 0$，通常更易于通过数值方法计算根。模块 3 的二分法将包含根的区间一分为二，每次迭代增加一个二进制位，约增加 0.3 个十进制位。 **牛顿法**（也称为牛顿-拉夫森法）使用导数。在接近根的区域，它要快得多；但与二分法不同，它没有保证，本节末尾将展示它可能失败的情况。

```check
rounds(log(2, 10), '0.3')
```

**思想。** 在根 $r$ 附近 $f$，用函数 $f$ 在某一点 $x_0$ 处的切线代替原函数图像，并解这个简单的方程：切线与 $x$ 轴的交点在哪里？记作点 $x_1$。这个点通常更接近 $r$（图 7.3）。然后从 $x_1$ 重复上述过程。

在 $\big(x_n, f(x_n)\big)$ 处的切线，其中 $x_n$ 读作 "x 下标 n"，是 $y = f(x_n) + f'(x_n)(x - x_n)$，即 $f$ 在 $x_n$ 处的线性近似。它在 $x$ 轴上的截距为 $y = 0$。如果 $f'(x_n) \ne 0$，解 $0 = f(x_n) + f'(x_n)(x - x_n)$ 关于 $x$ 得到 $x = x_n - f(x_n)/f'(x_n)$。

```check
xn_s, fn_s, dn_s = symbols('x_n f_n d_n')
same(solve(fn_s + dn_s*(x - xn_s), x), [xn_s - fn_s/dn_s])
```

::: definition 牛顿法
解 $f(x) = 0$，其中 $f$ 可导，选择一个初始值 $x_0$ 并计算

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}, \quad n = 0, 1, 2, \dots,$$

只要 $f'(x_n) \ne 0$。数列 $x_0, x_1, x_2, \dots$ 是 **迭代值**。当它们不再变化到你所需的精度时停止。
:::

::: figure id=fig-07-3
针对$f(x) = x^2 - 2$的牛顿法，从$x_0 = 3$开始。在$\big(x_0, f(x_0)\big)$处的切线与$x$轴交于$x_1 \approx 1.83$；在$\big(x_1, f(x_1)\big)$处的切线与之交于$x_2 \approx 1.46$。下一个迭代值$x_3 \approx 1.415$过于接近根$\sqrt2$，以至于在此尺度下无法区分。
:::

```check
it3 = [Integer(3)]
for _ in range(3):
    it3.append(it3[-1] - (it3[-1]**2 - 2)/(2*it3[-1]))
same(it3[1:], [Rational(11, 6), Rational(193, 132), Rational(72097, 50952)])
rounds(it3[1], '1.83'); rounds(it3[2], '1.46'); rounds(it3[3], '1.415')
```

可以用正确的小数位数来衡量迭代近似的精度。若数 $r$ 的近似值 $\tilde x$ 的绝对误差小于第 $d$ 位小数的半个单位，即 $\abs{r - \tilde x} < 0.5 \times 10^{-d}$，就说它**精确到 $d$ 位小数**。精确到 0 位小数意味着与 $r$ 的距离仍小于 0.5。距离更大时，$\tilde x$ 连 0 位小数的精度也达不到。

::: example 牛顿法用于 $\sqrt2$
使用牛顿法计算 $\sqrt2$，从 $x_0 = 1$ 开始。

$\sqrt2$ 是 $f(x) = x^2 - 2$ 的正根，且 $f'(x) = 2x$。这一步简化为：

$$\begin{aligned} x_{n+1} &= x_n - \frac{x_n^2 - 2}{2x_n} = \frac{2x_n^2 - x_n^2 + 2}{2x_n} \\ &= \frac12\Big(x_n + \frac{2}{x_n}\Big). \end{aligned}$$

从 $x_0 = 1$：

$$\begin{aligned} x_1 &= \tfrac12(1 + 2) = \tfrac32, \\ x_2 &= \tfrac12\Big(\tfrac32 + \tfrac43\Big) = \tfrac{17}{12}, \\ x_3 &= \tfrac12\Big(\tfrac{17}{12} + \tfrac{24}{17}\Big) = \tfrac{577}{408}. \end{aligned}$$

再进行两步，精确地由计算机完成，得到表格；比较 $\sqrt2 = 1.414213562373095\ldots$：

```valuetable
x_n = 1, 3/2, 17/12, 577/408, 665857/470832, 886731088897/627013566048
$x_n\text{ in decimals}$ = x_n
$x_n - \sqrt{2}$ = x_n - sqrt(2)
decimals = 15
---
x_{n} | x_n\text{ in decimals} | x_n - \sqrt{2}
1 | 1.000000000000000 | -0.414213562373095
\frac{3}{2} | 1.500000000000000 | 0.085786437626905
\frac{17}{12} | 1.416666666666667 | 0.002453104293572
\frac{577}{408} | 1.414215686274510 | 0.000002123901415
\frac{665857}{470832} | 1.414213562374690 | 0.000000000001595
\frac{886731088897}{627013566048} | 1.414213562373095 | 0.000000000000000
```

迭代值 $x_0, \dots, x_5$ 分别正确到 0、0、2、5、11 和 23 位小数：从 $x_2$ 开始，每一步大约将正确的小数位数翻倍。（表格显示 15 位小数，因此最后一行看起来是精确的；其误差约为 $9 \times 10^{-25}$。）

```check
it2 = [Integer(1)]
for _ in range(5):
    it2.append((it2[-1] + 2/it2[-1])/2)
same(it2[1:4], [Rational(3, 2), Rational(17, 12), Rational(577, 408)])
same(it2[4:], [Rational(665857, 470832), Rational(886731088897, 627013566048)])
X2 = symbols('X', positive=True)
steps(X2 - (X2**2 - 2)/(2*X2), (2*X2**2 - X2**2 + 2)/(2*X2), (X2 + 2/X2)/2)
same((1 + 2)/Integer(2), Rational(3, 2)); same((Rational(3, 2) + Rational(4, 3))/2, Rational(17, 12)); same((Rational(17, 12) + Rational(24, 17))/2, Rational(577, 408))
same(2/Rational(3, 2), Rational(4, 3)); same(2/Rational(17, 12), Rational(24, 17))
rounds(sqrt(2), '1.414213562373095')
def correct_dp(v, r):
    """The number of correct decimal places of v as an approximation of r: the largest d with |v - r| < 0.5*10^(-d)."""
    e = abs(N(v - r, 80)); d = 0
    while e < Rational(1, 2)*Rational(1, 10)**(d + 1):
        d += 1
    return d
same([correct_dp(v, sqrt(2)) for v in it2], [0, 0, 2, 5, 11, 23])
rounds(it2[5] - sqrt(2), '9e-25')
```
:::

::: example 求解 $\cos x = x$
证明 $\cos x = x$ 在 $[0, 1]$ 中恰好有一个解，并用牛顿法从 $x_0 = 1$ 找到它。

设 $f(x) = \cos x - x$. 然后 $f(0) = 1 > 0$ 和 $f(1) = \cos 1 - 1 < 0$，因此根据介值定理（模块 3），$f$ 在 $(0, 1)$ 内有一个根。只有一个：在 $[0, 1]$ 上，$\cos x$ 减少（在单位圆上，角度为 $x$ 的点的 $x$ 坐标随着 $x$ 从 0 增加到 $\pi$ 而减少），且 $-x$ 也减少，因此 $f$ 严格递减，并且仅在一次取值为 0。

当 $f'(x) = -\sin x - 1$ 时，牛顿迭代步为

$$\begin{aligned} x_{n+1} &= x_n - \frac{\cos x_n - x_n}{-\sin x_n - 1} \\ &= x_n + \frac{\cos x_n - x_n}{\sin x_n + 1}. \end{aligned}$$

由 $x_0 = 1$： $x_1 = 1 + \dfrac{\cos 1 - 1}{\sin 1 + 1} \approx 1 + \dfrac{-0.45970}{1.84147} \approx 0.75036$。进一步的步骤（下面的计算框执行这些步骤）得到

$$\begin{aligned} x_2 &\approx 0.7391129, \\ x_3 &\approx 0.739085133385, \\ x_4 &\approx 0.739085133215161, \end{aligned}$$

对 $x_1, \dots, x_4$ 正确到 1、4、9 和 19 位小数。解为 $x \approx 0.739085133215161$，精确到 15 位小数。

```check
fcx = cos(x) - x
holds(fcx.subs(x, 0) > 0); holds(fcx.subs(x, 1) < 0)
steps(x - fcx/diff(fcx, x), x - (cos(x) - x)/(-sin(x) - 1), x + (cos(x) - x)/(sin(x) + 1))
itc = [Integer(1)]
for _ in range(4):
    v_ = itc[-1]
    itc.append(N(v_ + (cos(v_) - v_)/(sin(v_) + 1), 80))
rounds(cos(1) - 1, '-0.45970'); rounds(sin(1) + 1, '1.84147')
rounds(itc[1], '0.75036'); rounds(itc[2], '0.7391129'); rounds(itc[3], '0.739085133385'); rounds(itc[4], '0.739085133215161')
rcos = nsolve(fcx, x, 0.74, prec=80)
same([correct_dp(v, rcos) for v in itc], [0, 1, 4, 9, 19])
rounds(rcos, '0.739085133215161')
```
:::

::: compute 用 Python 实现牛顿法
几行 Python 代码即可实现牛顿法。以下是例 7.10 的迭代结果（浮点数）：

```python
import math

def newton(f, df, x, steps):
    for n in range(1, steps + 1):
        x = x - f(x)/df(x)
        print(f"x{n} = {x:.16f}   f(x{n}) = {f(x):.1e}")
    return x

f = lambda x: math.cos(x) - x
df = lambda x: -math.sin(x) - 1
root = newton(f, df, 1.0, 5)
```

```output
x1 = 0.7503638678402439   f(x1) = -1.9e-02
x2 = 0.7391128909113617   f(x2) = -4.6e-05
x3 = 0.7390851333852840   f(x3) = -2.8e-10
x4 = 0.7390851332151607   f(x4) = 0.0e+00
x5 = 0.7390851332151607   f(x5) = 0.0e+00
```

经过四步后 $f(x_4)$ 在浮点数中恰好为 0，第五步没有变化：迭代值已达到双精度的极限，大约 16 位有效数字。二分法需要超过 50 次 $[0, 1]$ 的划分才能达到同样接近的程度。

平方根的计算方式也是一样的。这个函数使用例 7.9 中的步骤 $x_{n+1} = \tfrac12(x_n + a/x_n)$ 来计算 $\sqrt a$。它开始时大于 $\sqrt a$；下面的定理 7.2 表明，迭代值随后会减少并趋近于 $\sqrt a$，因此函数一旦发现迭代值不再减少就会停止：

```python
def my_sqrt(a):
    x = max(a, 1.0)               # a starting value above sqrt(a)
    steps = 0
    while True:
        new = (x + a/x)/2
        steps += 1
        if new >= x:              # no longer decreasing: as good as it gets
            return x, steps
        x = new

for a in [2.0, 3.0, 1e6]:
    print(a, my_sqrt(a), math.sqrt(a))
```

```output
2.0 (1.414213562373095, 6) 1.4142135623730951
3.0 (1.7320508075688772, 6) 1.7320508075688772
1000000.0 (1000.0, 16) 1000.0
```

对于 3 和 $10^6$，结果与 `math.sqrt` 在最后一位数字上一致。对于 2，它们在最后一位二进制数字上有所不同，差值为 $2^{-52} \approx 2.2 \times 10^{-16}$： `math.sqrt` 返回最接近 $\sqrt2$ 的浮点数，而这个函数返回下一个更小的浮点数，要正确得到最后一位数字需要比这个简短函数更多的处理。对于 $10^6$ 的 16 步显示了不良初始值的代价：从 $x_0 = 10^6$ 开始，每一步早期的迭代只将 $x$ 减半，因为 $a/x$ 相比于 $x$ 小很多；直到接近根时，数字才开始翻倍。
:::

```check
holds(Rational(1, 2)**50 > Rational(1, 10)**16)            # after 50 halvings the interval is still longer than 1e-16
import math
holds(math.sqrt(2.0) - 1.414213562373095 == 2.0**-52); rounds(Rational(1, 2**52), '2.2e-16')   # my_sqrt(2.0) printed 1.414213562373095
holds(abs(Rational(math.sqrt(2.0)) - sqrt(2)) < abs(Rational(1.414213562373095) - sqrt(2)))     # math.sqrt is the nearer double
rounds(53*log(2, 10), '16')                                # double precision: 53 binary digits, about 16 decimal digits
```

### 为什么数字会翻倍 {#quadratic}

平方根情形的位数倍增只需几行即可证明。处理迭代时，取与近似误差相反的符号，记 $e_n = x_n - r$，其中 $r$ 是根。它是 $x_n$ 的误差（定义 7.3）反号所得。当 $x_n$ 偏大时它为正，$\abs{e_n}$ 为绝对误差。

::: theorem 牛顿法求平方根
设 $a > 0$ 和 $x_0 > 0$，并设 $x_{n+1} = \tfrac12\big(x_n + a/x_n\big)$ 为 $n = 0, 1, 2, \dots$。则

$$x_{n+1} - \sqrt a = \frac{(x_n - \sqrt a)^2}{2x_n}.$$

因此，对于每一个 $n \ge 1$，$x_n \ge \sqrt a$ 从 $x_1$ 开始递减，并且趋近于 $\sqrt a$。
:::

::: proof
所有迭代值都是正数：$x_0 > 0$，且每一步都是两个正数的平均值。将步骤放在同一分母下，并减去 $\sqrt a$：

$$\begin{aligned} x_{n+1} - \sqrt a &= \frac{x_n^2 + a}{2x_n} - \sqrt a \\ &= \frac{x_n^2 - 2\sqrt a\,x_n + a}{2x_n} \\ &= \frac{(x_n - \sqrt a)^2}{2x_n}. \end{aligned}$$

右边的值从不为负，因此 $x_{n+1} \ge \sqrt a$ 对于每一个 $n \ge 0$：从 $x_1$ 开始的所有迭代值都不小于 $\sqrt a$。对于这样的 $x_n$， $a/x_n \le \sqrt a \le x_n$，因此 $x_{n+1}$，即 $a/x_n$ 和 $x_n$ 的平均值，最多为 $x_n$：迭代值在减小。最后，这里根是 $\sqrt a$，因此 $e_n = x_n - \sqrt a$。对于 $n \ge 1$， $0 \le e_n < x_n$，因此

$$e_{n+1} = e_n \cdot \frac{e_n}{2x_n} \le \frac{e_n}{2},$$

和 $e_n \le e_1/2^{n-1}$，它趋近于 0。
:::

```check
ap_, xp_ = symbols('a x', positive=True)
steps((xp_ + ap_/xp_)/2 - sqrt(ap_), (xp_**2 + ap_)/(2*xp_) - sqrt(ap_), (xp_**2 - 2*sqrt(ap_)*xp_ + ap_)/(2*xp_), (xp_ - sqrt(ap_))**2/(2*xp_))
```

该恒等式解释了例 7.9 的表格。在根 $2x_n \approx 2\sqrt2 \approx 2.8$ 附近，因此 $e_{n+1} \approx e_n^2/2.8$：误差 $10^{-5}$ 变为约 $4 \times 10^{-11}$ 的误差。平方误差会使小数点后零的个数翻倍，因此正确数字的个数也翻倍。

```check
rounds(2*sqrt(2), '2.8'); rounds(Rational(1, 10)**10/(2*sqrt(2)), '4e-11')
```

对于任何在根处导数不为零的函数，都会发生相同的情况。

::: theorem 牛顿法收敛于二次速度
设$f(r) = 0$。假设$f'$和$f''$在包含$r$的开区间上连续，且满足$f'(r) \ne 0$。则存在一个$\delta > 0$，使得对于每个满足$\abs{x_0 - r} < \delta$的初始值$x_0$，牛顿法永远不遇到$f'(x_n) = 0$，迭代序列趋近于$r$，且$e_n = x_n - r$满足

$$\lim_{n\to\infty}\frac{e_{n+1}}{e_n^2} = \frac{f''(r)}{2f'(r)}$$

（如果没有任何迭代恰好落在 $r$ 上）。每个 $e_{n+1}$ 大致是 $e_n^2$ 的一个固定倍数，因此每个绝对误差大致是前一个误差的平方的固定倍数：牛顿法 **收敛速度为二次收敛**。
:::

**证明的思想。** 牛顿法求解 $L_n(x) = 0$，其中 $L_n$ 是 $f$ 在 $x_n$ 处的线性化。根求解 $f(r) = 0$，并且根据第7.2节，线性化在 $r$ 处的误差为 $f(r) - L_n(r) \approx \tfrac12 f''(x_n)(r - x_n)^2$，因此 $L_n(r) \approx -\tfrac12 f''(x_n)\,e_n^2$。但 $L_n$ 是一条斜率为 $f'(x_n)$ 的直线，在 $x_{n+1}$ 处为 0，因此 $L_n(r) = f'(x_n)(r - x_{n+1}) = -f'(x_n)\,e_{n+1}$。将 $L_n(r)$ 的两个表达式相等得到

$$e_{n+1} \approx \frac{f''(x_n)}{2f'(x_n)}\,e_n^2.$$

泰勒定理（模块 15）控制第一个 $\approx$ 的误差，并将这一思想转化为证明。对于 $f(x) = x^2 - a$，常数是 $\dfrac{2}{2 \cdot 2\sqrt a} = \dfrac{1}{2\sqrt a}$，如定理 7.2 所示；对于 $\sqrt2$，常数是 $1/(2\sqrt2) \approx 0.354$，并且示例 7.9 中的迭代确实给出 $e_5/e_4^2 \approx 0.354$。

```check
rr_, xn1, d1 = symbols('r x_n1 d1')
Ln = lambda X: fn_s + d1*(X - xn_s)
xnext = solve(Ln(x), x)[0]
same(Ln(rr_), d1*(rr_ - xnext))                          # L_n(r) = f'(x_n)(r - x_{n+1})
same(d1*(rr_ - xnext), -d1*(xnext - rr_))                # = -f'(x_n) e_{n+1}
en_, en1_, f2_ = symbols('e_n e_n1 f2')                  # f2 stands for f''(x_n)
same(solve(Eq(-d1*en1_, -f2_/2*en_**2), en1_), [f2_/(2*d1)*en_**2])      # equating the two expressions
same((diff(x**2 - ap_, x, 2)/(2*diff(x**2 - ap_, x))).subs(x, sqrt(ap_)), 1/(2*sqrt(ap_)))
rounds(1/(2*sqrt(2)), '0.354'); rounds((it2[5] - sqrt(2))/(it2[4] - sqrt(2))**2, '0.354')
```

### 如何计算平方根 {#square-roots}

程序在图形、物理模拟和机器学习中不断计算平方根，从一个良好的初始值进行几次牛顿迭代是实现这一目标的标准方法之一。两个想法使其计算速度加快。

**一个良好的初始值。** 浮点数以 $a = m \times 2^e$ 的形式存储，其中 $1 \le m < 2$ 是尾数，且有一个整数指数 $e$。如果 $e$ 是奇数，将一个因子 2 移到 $m$ 中，使 $e$ 变为偶数，得到 $1 \le m < 4$，然后得到 $\sqrt a = \sqrt m \times 2^{e/2}$。因此，只需要计算 1 到 4 之间数的平方根，一个小的表格或一个简单的公式就可以提供一个相对误差较小的初始值，例如最大误差不超过 1%。

**几步。** 写 $x_n = \sqrt a\,(1 + \varepsilon_n)$，使得 $\varepsilon_n = e_n/\sqrt a$（$\varepsilon$ 是希腊字母 "epsilon"）在 $x_n$ 太大时为正，且 $\abs{\varepsilon_n}$ 是 $x_n$ 的相对误差。将此代入定理 7.2 的恒等式，并除以 $\sqrt a$ 得到

$$\varepsilon_{n+1} = \frac{\varepsilon_n^2}{2(1 + \varepsilon_n)}.$$

从 $\abs{\varepsilon_0} \le 0.01$：$\varepsilon_1 \le 0.0001/(2 \times 0.99) \approx 5.1 \times 10^{-5}$，然后继续 $\varepsilon_n \ge 0$，因此 $\varepsilon_{n+1} \le \varepsilon_n^2/2$，从而得到 $\varepsilon_2 \le 1.3 \times 10^{-9}$ 和 $\varepsilon_3 \le 8.2 \times 10^{-19}$。这远远低于双精度数的精度，相对误差约为 $1.1 \times 10^{-16}$：三步就足够了。

```check
ep = symbols('epsilon')
same(((sqrt(ap_)*(1 + ep) + ap_/(sqrt(ap_)*(1 + ep)))/2 - sqrt(ap_))/sqrt(ap_), ep**2/(2*(1 + ep)))
b1 = Rational(1, 10000)/(2*Rational(99, 100)); b2 = b1**2/2; b3 = b2**2/2
holds(all(e_**2/(2*(1 + e_)) <= b1 for e_ in [Rational(k, 1000) for k in range(-10, 11)]))   # worst case eps_0 = -0.01
same(sqrt(ap_)*(1 + ep) - sqrt(ap_), sqrt(ap_)*ep)                                         # e_n = sqrt(a) eps_n
rounds(b1, '5.1e-5'); holds(b2 <= Rational(13, 10)*Rational(1, 10)**9); holds(b3 <= Rational(82, 10)*Rational(1, 10)**19)
rounds(Rational(1, 2)**53, '1.1e-16'); holds(b3 < Rational(1, 2)**53)
```

在大多数处理器上，除法比乘法慢，因此在速度至关重要的地方，一种无需除法的变体很受欢迎：将 $1/y^2 - a = 0$ 应用于牛顿法，其根为 $1/\sqrt a$，只需乘法（练习 7.10）。例如，图形程序需要 $1/\sqrt a$ 来将向量缩放为长度 1。

### 当牛顿法失效时 {#newton-failures}

定理 7.3 仅在 $x_0$ 足够接近一个根时才保证成功，该根处 $f'$ 不为 0（且 $f''$ 在该点附近连续）。它并未说明“足够接近”的程度，对于其他起始值它不作任何保证。在这些条件之外，牛顿法可能以多种方式失效（图 7.4）：

- **水平切线。** 若 $f'(x_n) = 0$，则切线水平且永不与 $x$ 轴相交：没有下一个迭代点。对于 $f(x) = x^2 - 2$，这种情况发生在 $x_0 = 0$。若 $f'(x_n)$ 仅仅是小量，下一个迭代点会远离很远：从 $x_0 = 0.1$，到 $x_1 = 10.05$。
- **循环。** 对于 $f(x) = x^3 - 2x + 2$ 来自 $x_0 = 0$： $f(0) = 2$ 和 $f'(0) = -2$，因此 $x_1 = 0 - 2/(-2) = 1$；然后 $f(1) = 1$ 和 $f'(1) = 1$，因此 $x_2 = 1 - 1 = 0$。迭代值在 0 和 1 之间无限交替，而唯一的实根则接近 $-1.769$。
- **逃离。** 迭代值不断远离根（例 7.11）。
- **离开定义域。** 对于 $f(x) = \ln x$ 来自 $x_0 = 3$, $x_1 = 3 - 3\ln 3 \approx -0.296$, 其中 $\ln$ 未定义。
- **收敛缓慢。** 在一个根处，即使 $f'(r) = 0$ 也如此，例如 $(x - 1)^2$ 的二重根 1，步长为 $x_{n+1} = x_n - \tfrac12(x_n - 1)$：每次迭代的误差仅减半，不如二分法好。

```check
same((x - (x**2 - 2)/(2*x)).subs(x, Rational(1, 10)), Rational(1005, 100)); same(diff(x**2 - 2, x).subs(x, 0), 0)
fcy = x**3 - 2*x + 2
same([fcy.subs(x, 0), diff(fcy, x).subs(x, 0)], [2, -2]); same([fcy.subs(x, 1), diff(fcy, x).subs(x, 1)], [1, 1])
same(0 - Rational(2, -2), 1); same(1 - Rational(1, 1), 0)
rcy = real_roots(fcy); same(len(rcy), 1); rounds(rcy[0], '-1.769')
same(x - log(x)/diff(log(x), x), x - x*log(x)); rounds(3 - 3*log(3), '-0.296')
same(simplify(x - (x - 1)**2/diff((x - 1)**2, x)), x - (x - 1)/2)
```

::: example 牛顿法无法找到的根
证明：对于 $f(x) = \sqrt[3]{x}$，从任意起始值 $x_0 \ne 0$ 出发，牛顿法会远离根 0。

对于 $x \ne 0$， $f'(x) = \dfrac{1}{3\sqrt[3]{x}^{\,2}}$： $\sqrt[3]{x}$ 是 $x^3$ 的反函数，且反函数的导数（第6模块）在 $u = \sqrt[3]{x}$ 处为 $1/\big(3u^2\big)$。因此，设 $u = \sqrt[3]{x_n}$，使得 $x_n = u^3$，

$$\begin{aligned} x_{n+1} &= x_n - \frac{u}{1/(3u^2)} = x_n - 3u^3 \\ &= x_n - 3x_n = -2x_n. \end{aligned}$$

每一步都将距离根的距离加倍，并切换到另一侧：从 $x_0 = 1$ 出发的迭代点为 $-2, 4, -8, 16, \dots$（图 7.4，右图）。定理 7.3 不适用，因为 $f'(0)$ 不存在：图像在根处有垂直切线。在图像上的任意其他点 $(u^3, u)$，切线的斜率为 $1/(3u^2)$，是该点到根连线斜率 $u/u^3 = 1/u^2$ 的三分之一。因此，每条切线与坐标轴的交点距离 $x_n$ 的距离是根到该点距离的三倍：在 $-2x_n$ 处，位于根的另一侧。

```check
up = symbols('u', nonzero=True, real=True)
same(1/diff(up**3, up), 1/(3*up**2))
steps(up**3 - up/(1/(3*up**2)), up**3 - 3*up**3, -2*up**3)
itr = [1]
for _ in range(4):
    itr.append(-2*itr[-1])
same(itr, [1, -2, 4, -8, 16])
same((up/up**3)/3, 1/(3*up**2)); same(Abs(-2*up**3 - up**3), 3*Abs(up**3 - 0))   # a third of the slope; three times as far
limit_is(real_root(x, 3)/x, x, 0, oo, '+')        # the graph is vertical at 0: no derivative there
```
:::

::: figure id=fig-07-4
牛顿法的两个失败情况。左图：从 $x_0 = 0$ 出发的 $f(x) = x^3 - 2x + 2$，在 $x_0$ 处的切线导致到达 $x_1 = 1$，在 $x_1$ 处的切线又回到 0；唯一的根（绿色，近 $-1.769$）从未被到达。右图：从 $x_0 = 1$ 出发的 $f(x) = \sqrt[3]{x}$，每条切线都会超过根 0（绿色），并落在另一侧距离为根两倍的位置。
:::

::: tip
实际操作：从根附近开始（一个图像、一个值表或几次二分法步骤可以告诉你它在哪里），观察 $\abs{f(x_n)}$ 和步骤 $\abs{x_{n+1} - x_n}$ 缩小，并在固定步骤数后放弃。好的方程求解器结合了二分法的安全性和牛顿法的速度。
:::

::: widget name=newton-method
选择一个函数和一个起始点 $x_0$，然后按 **Step**：每一步在当前点画出切线到 $x$ 轴，并列出 $x_n$，其正确的十进制位数，以及 $f(x_n)$。使用 $x^2 - 2$ 从 $x_0 = 1$，观察正确的十进制位数依次变为 0, 0, 2, 5, 11, 15；最后一个为双精度的极限。然后尝试失败的情况： $x_0 = 0$ 对于 $x^2 - 2$； $x^3 - 2x + 2$ 从 $x_0 = 0$； $\sqrt[3]{x}$ 从任何 $x_0 \ne 0$；并输入 `ln(x)` 与 $x_0 = 3$。最后尝试 $x^3 - 2x - 5$ 从 $x_0 = 0.8$，在 $f'(x) = 0$ 接近的点，观察第一步能走多远。
:::

```check
fcu = x**3 - 2*x - 5
same((x - fcu/diff(fcu, x)).subs(x, Rational(8, 10)), Rational(8, 10) - Rational(-6088, 1000)/Rational(-8, 100))
rounds((x - fcu/diff(fcu, x)).subs(x, Rational(8, 10)), '-75.3')
```

## 洛必达法则 {#lhopital}

模块 2 评估形如 $0/0$ 的极限，通过代数方法：因式分解并约分、有理化或夹逼定理。许多这样的极限无法通过代数方法解决。什么是

$$\lim_{x\to0}\frac{e^{2x} - 1}{\sin 3x}?$$

分子和分母都趋于 0，且没有可以约分的内容。数值提示 $2/3$:

```valuetable
x = 0.1, 0.01, 0.001, -0.001, -0.01, -0.1
$e^{2x} - 1$ = exp(2*x) - 1
$\sin 3x$ = sin(3*x)
$\dfrac{e^{2x} - 1}{\sin 3x}$ = (exp(2*x) - 1)/sin(3*x)
digits = 6
---
x | e^{2x} - 1 | \sin 3x | \dfrac{e^{2x} - 1}{\sin 3x}
0.1 | 0.221403 | 0.295520 | 0.749197
0.01 | 0.0202013 | 0.0299955 | 0.673479
0.001 | 0.00200200 | 0.00300000 | 0.667335
-0.001 | -0.00199800 | -0.00300000 | 0.666001
-0.01 | -0.0198013 | -0.0299955 | 0.660143
-0.1 | -0.181269 | -0.295520 | 0.613390
```

图 7.5 解释了这一点。在接近 0 处，每个函数都接近其在该点的切线： $e^{2x} - 1 \approx 2x$，因为其在 0 处的导数为 2， $\sin 3x \approx 3x$，因为其在 0 处的导数为 3。因此，比值接近 $2x/3x = 2/3$：切线斜率的比值。

```check
same(diff(exp(2*x) - 1, x).subs(x, 0), 2); same(diff(sin(3*x), x).subs(x, 0), 3)
```

::: figure id=fig-07-5
左： $e^{2x} - 1$ 和 $\sin 3x$ 都通过原点，接近它们的切线 $y = 2x$ 和 $y = 3x$（虚线）。右：它们的比值在 0 处未定义（空心点），趋近于 $2/3$，即切线斜率的比值。
:::

::: definition 不定式 $0/0$ 和 $\infty/\infty$
若$f(x) \to 0$与$g(x) \to 0$如$x \to a$所示，则$f(x)/g(x)$的极限具有**不定形式**$0/0$。若$f(x) \to \pm\infty$与$g(x) \to \pm\infty$，则其具有不定形式$\infty/\infty$。此处$a$可为某数、$\infty$或$-\infty$，且极限可为单侧极限。
:::

“不定式”意味着仅凭形式无法决定极限。当 $x \to 0$、$x/x \to 1$、$x^2/x \to 0$ 和 $x/x^3 \to \infty$ 都属于 $0/0$ 形式时，你必须更仔细地考察 $f$ 和 $g$。

```check
limit_is(x/x, x, 0, 1); limit_is(x**2/x, x, 0, 0); limit_is(x/x**3, x, 0, oo)
```

### 规则 {#the-rule}

::: theorem 洛必达法则，简单形式
设 $f$ 和 $g$ 在包含 $a$ 的开区间内有定义，且 $f(a) = g(a) = 0$。若 $f'(a)$ 和 $g'(a)$ 存在且 $g'(a) \ne 0$，则

$$\lim_{x\to a}\frac{f(x)}{g(x)} = \frac{f'(a)}{g'(a)}.$$
:::

::: proof
对于 $x \ne a$ 在区间内，减去 $f(a) = 0$ 和 $g(a) = 0$，然后将分子和分母都除以 $x - a \ne 0$：

$$\frac{f(x)}{g(x)} = \frac{f(x) - f(a)}{g(x) - g(a)} = \frac{\dfrac{f(x) - f(a)}{x - a}}{\dfrac{g(x) - g(a)}{x - a}}.$$

作为 $x \to a$，分子趋于 $f'(a)$，分母趋于 $g'(a)$，根据导数的定义（模块 4）。由于 $g'(a) \ne 0$，根据极限的商法则（模块 2）可得极限 $f'(a)/g'(a)$。

还有一个细节：$f(x)/g(x)$必须在$a$附近的$x$处有定义，即$g(x) \ne 0$。$g$的差商趋近于$g'(a) \ne 0$，因此对于足够接近$a$的$x$，它落在$g'(a)$的$\abs{g'(a)}/2$范围内且不为0；于是$g(x) = (x - a) \cdot \dfrac{g(x) - g(a)}{x - a} \ne 0$对相应的$x \ne a$成立。
:::

```check
gg = Function('g')
same((ff(x) - 0)/(gg(x) - 0), ((ff(x) - 0)/(x - a))/((gg(x) - 0)/(x - a)))
```

::: example 斜率的比值
求 $\displaystyle\lim_{x\to0}\frac{e^{2x} - 1}{\sin 3x}$。

设 $f(x) = e^{2x} - 1$ 和 $g(x) = \sin 3x$。两者在所有点均可导，且 $f(0) = e^0 - 1 = 0$ 和 $g(0) = \sin 0 = 0$。根据链式法则 $f'(x) = 2e^{2x}$ 和 $g'(x) = 3\cos 3x$，因此 $f'(0) = 2$ 和 $g'(0) = 3 \ne 0$。根据定理 7.4，

$$\lim_{x\to0}\frac{e^{2x} - 1}{\sin 3x} = \frac{f'(0)}{g'(0)} = \frac{2}{3},$$

如表格和图 7.5 所示。

```check
same((exp(2*x) - 1).subs(x, 0), 0); same(sin(3*x).subs(x, 0), 0)
same(diff(exp(2*x) - 1, x), 2*exp(2*x)); same(diff(sin(3*x), x), 3*cos(3*x))
limit_is((exp(2*x) - 1)/sin(3*x), x, 0, Rational(2, 3))
```
:::

简单形式需要 $f(a) = g(a) = 0$ 和 $g'(a) \ne 0$，并且通常其中一个会失败： $f$ 和 $g$ 可能在 $a$ 处未定义， $a$ 可能为 $\infty$，或者 $g'(a)$ 也可能为 0。一般规则比较 $f/g$ 的极限与 $f'/g'$ 的极限，而不是与 $a$ 处的值。

::: theorem 洛必达法则
设 $f$、$g$ 在含 $a$ 的开区间 $I$ 上可微，唯独 $a$ 本身可例外。对 $I$ 内的每个 $x \ne a$，都有 $g'(x) \ne 0$。设当 $x \to a$ 时，$f(x)/g(x)$ 的极限为 $0/0$ 或 $\infty/\infty$ 未定式。若

$$\lim_{x\to a}\frac{f'(x)}{g'(x)} = L,$$

其中 $L$ 是一个实数， $\infty$ 或 $-\infty$，则

$$\lim_{x\to a}\frac{f(x)}{g(x)} = L.$$

对于单侧极限也成立，其中 $I$ 是一个以 $a$ 为端点的开区间，对于 $x \to \infty$ 或 $x \to -\infty$，以 $I$ 为区间 $(b, \infty)$ 或 $(-\infty, b)$。
:::

模块 8 在一个“深入理解”框中使用柯西中值定理证明了这个一般形式；该证明需要用到你目前尚未掌握的工具。每个假设都是必需的。形式必须是不定式（下面的第一个陷阱）； $g'$ 在 $a$ 附近不能为 0，以确保 $f'/g'$ 在那里有定义；并且 $f'/g'$ 的极限必须存在：如果不存在，规则则无能为力（第三个陷阱）。

::: example 使用规则两次
求 $\displaystyle\lim_{x\to0}\frac{e^x - 1 - x}{x^2}$。

在$x = 0$处分子为$1 - 1 - 0 = 0$且分母为0：形式为$0/0$。由于$x^2$的导数$2x$在0处为0，简单形式不适用。定理7.5适用（在0附近，$2x \ne 0$在0处除外）并指出极限等于

$$\lim_{x\to0}\frac{e^x - 1}{2x},$$

如果这个极限存在。它又具有形式 $0/0$，现在简单形式适用： $f_1(x) = e^x - 1$ 和 $g_1(x) = 2x$ 都有 $f_1(0) = g_1(0) = 0$， $f_1'(0) = e^0 = 1$ 和 $g_1'(0) = 2 \ne 0$，因此这个极限是 $\tfrac12$。因此

$$\lim_{x\to0}\frac{e^x - 1 - x}{x^2} = \frac12.$$

答案提到 $e^x$: 在 0 附近， $e^x - 1 - x \approx \tfrac12 x^2$，即 $e^x \approx 1 + x + \tfrac12 x^2$，比线性近似 $1 + x$ 更好。模块 15 进一步发展了这一想法。

```check
same((exp(x) - 1 - x).subs(x, 0), 0); same(diff(x**2, x).subs(x, 0), 0)
same(diff(exp(x) - 1 - x, x), exp(x) - 1); same(diff(x**2, x), 2*x)
same(diff(exp(x) - 1, x).subs(x, 0), 1); same(diff(2*x, x), 2)
limit_is((exp(x) - 1)/(2*x), x, 0, Rational(1, 2)); limit_is((exp(x) - 1 - x)/x**2, x, 0, Rational(1, 2))
```
:::

::: example 无穷远处的极限
在机器学习中，**Softplus** 函数 $s(x) = \ln(1 + e^x)$ 是[第 1.3 节](module_01_ZH.html#piecewise)所述函数 $\operatorname{ReLU}(x) = \max(0, x)$ 的光滑版本。证明当 $x \to \infty$ 时，$s(x)/x \to 1$。

当 $x \to \infty$， $\ln(1 + e^x) \to \infty$ 和 $x \to \infty$: 形式为 $\infty/\infty$。导数为 $\dfrac{e^x}{1 + e^x}$（链式法则）和 1，永远不会为 0，将分子和分母同时除以 $e^x$，

$$\begin{aligned} \lim_{x\to\infty}\frac{e^x/(1 + e^x)}{1} &= \lim_{x\to\infty}\frac{1}{e^{-x} + 1} \\ &= \frac{1}{0 + 1} = 1. \end{aligned}$$

根据定理 7.5， $s(x)/x \to 1$: 对于足够大的 $x$，softplus 的行为类似于 ReLU，即在该处等于 $x$。

```check
limit_is(log(1 + exp(x)), x, oo, oo)
same(diff(log(1 + exp(x)), x), exp(x)/(1 + exp(x))); same(exp(x)/(1 + exp(x)), 1/(exp(-x) + 1))
limit_is(1/(exp(-x) + 1), x, oo, 1); limit_is(log(1 + exp(x))/x, x, oo, 1)
```
:::

### 正确使用规则 {#using-the-rule}

::: pitfall
**先检查形式。** 洛必达法则仅适用于 $0/0$ 和 $\infty/\infty$。取 $\displaystyle\lim_{x\to0}\frac{1 - \cos x}{x + x^2}$。它具有形式 $0/0$，法则给出 $\displaystyle\lim_{x\to0}\frac{\sin x}{1 + 2x} = \frac{0}{1} = 0$，即正确答案。再次应用法则到 $\dfrac{\sin x}{1 + 2x}$，它不是不定式，得到 $\dfrac{\cos x}{2} \to \dfrac12$：错误。在每一步，先代入，只有当结果为 $0/0$ 或 $\infty/\infty$ 时才进行求导。

```check
limit_is((1 - cos(x))/(x + x**2), x, 0, 0); limit_is(sin(x)/(1 + 2*x), x, 0, 0)
same(diff(sin(x), x)/diff(1 + 2*x, x), cos(x)/2); limit_is(cos(x)/2, x, 0, Rational(1, 2))
```
:::

::: pitfall
**分别对分子和分母求导。** 法则使用 $\dfrac{f'(x)}{g'(x)}$，即两个导数的商，而不是 $\Big(\dfrac{f}{g}\Big)'(x)$，即商的导数。在这里使用模块 5 的商法则是一种常见错误，它给出一个通常与原式不同的表达式和极限。
:::

::: pitfall
**其逆命题不成立。** 如果 $f'/g'$ 没有极限，法则对 $f/g$ 什么也不说。例如 $x \to \infty$， $\dfrac{x + \sin x}{x} = 1 + \dfrac{\sin x}{x} \to 1$（根据夹逼定理，因为 $\abs{\sin x/x} \le 1/x$），但导数的商 $\dfrac{1 + \cos x}{1}$ 在 0 和 2 之间来回摆动，没有极限。

```check
limit_is((x + sin(x))/x, x, oo, 1); same(diff(x + sin(x), x)/diff(x, x), 1 + cos(x))
same([(1 + cos(x)).subs(x, 2*k*pi) for k in (1, 2, 3)], [2, 2, 2]); same([(1 + cos(x)).subs(x, (2*k + 1)*pi) for k in (1, 2, 3)], [0, 0, 0])
```
:::

::: note
洛必达法则可在一行中给出 $\displaystyle\lim_{\theta\to0}\frac{\sin\theta}{\theta} = \frac{\cos 0}{1} = 1$，但作为证明则会陷入循环：该法则所使用的导数 $\sin$，正是由这个极限得出的（模块 2 和 5）。该法则是一种用于求极限的工具，其构成元素你已经可以求导。

```check
limit_is(sin(theta)/theta, theta, 0, 1); same(cos(0)/1, 1)
```
:::

## 其他不定式形式 {#other-forms}

乘积、差和幂也有不定式形式。例如 $x \to \infty$、$1/x \to 0$ 和 $x \to \infty$，然而

$$\frac{1}{x}\cdot x \to 1, \quad \frac{1}{x^2}\cdot x \to 0, \quad \frac{1}{x}\cdot x^2 \to \infty.$$

形如$0\cdot\infty$的乘积可以趋近于任意值。形如$\infty - \infty$的差以及形如$1^\infty$、$0^0$和$\infty^0$的幂也具有相同性质；这些也是**不定式**。对每种情况的策略是将表达式重写为形如$0/0$或$\infty/\infty$的商，并使用洛必达法则。

```check
limit_is(1/x*x, x, oo, 1); limit_is(1/x**2*x, x, oo, 0); limit_is(1/x*x**2, x, oo, oo)
```

### 乘积与差 {#products-differences}

$0\cdot\infty$ 型的**乘积** $fg$ 可通过除以某个因子的倒数写成商：$fg = \dfrac{f}{1/g}$ 属于 $0/0$ 型，或者写成属于 $\infty/\infty$ 型的 $fg = \dfrac{g}{1/f}$。选择其中求导较简单的写法。

::: example $x\ln x$ 在 0 附近
求 $\displaystyle\lim_{x\to0^+} x\ln x$。

如 $x \to 0^+$、$x \to 0$ 和 $\ln x \to -\infty$：形式为 $0\cdot\infty$。将乘积写为 $\dfrac{\ln x}{1/x}$，形式为 $\infty/\infty$（分子趋于 $-\infty$，分母趋于 $\infty$）。导数的商为

$$\frac{1/x}{-1/x^2} = -x \;\to\; 0,$$

且 $-1/x^2 \ne 0$，因此根据定理 7.5

$$\lim_{x\to0^+} x\ln x = 0.$$

因子 $x$ 比 $\ln x$ 更占主导地位。另一种选择 $\dfrac{x}{1/\ln x}$ 会导致 $\dfrac{1}{-1/\big(x(\ln x)^2\big)} = -x(\ln x)^2$，这比你开始的地方更糟糕。

```check
limit_is(log(x), x, 0, -oo, '+'); limit_is(1/x, x, 0, oo, '+')
same(diff(log(x), x)/diff(1/x, x), -x); limit_is(x*log(x), x, 0, 0, '+')
same(diff(1/log(x), x), -1/(x*log(x)**2)); same(diff(x, x)/diff(1/log(x), x), -x*log(x)**2)
```
:::

**一个形如**的差$\infty - \infty$在通分后通常变为商；有时因式分解或有理化可以做到。

::: example 形如 $\infty - \infty$ 的差
求 $\displaystyle\lim_{x\to1}\Big(\frac{x}{x - 1} - \frac{1}{\ln x}\Big)$。

当 $x \to 1^+$ 时，两项都趋于 $\infty$，当 $x \to 1^-$ 时，两项都趋于 $-\infty$。在通分后的公共分母 $(x - 1)\ln x$ 上，

$$\frac{x}{x - 1} - \frac{1}{\ln x} = \frac{x\ln x - (x - 1)}{(x - 1)\ln x},$$

的形式为 $0/0$ 在 $x = 1$。对分子和分母分别求导，每个都使用乘积法则：

$$\frac{\ln x + 1 - 1}{\ln x + (x - 1)/x} = \frac{\ln x}{\ln x + 1 - 1/x}.$$

定理 7.5 需要下底的导数在 1 附近（除 1 外）不为零，且它满足：对于 $x > 1$、$\ln x$ 和 $1 - 1/x$ 均为正数，对于 $0 < x < 1$ 均为负数。新的商式仍是 $0/0$，现在使用简单形式 $f(x) = \ln x$ 和 $g(x) = \ln x + 1 - 1/x$：即 $f'(1) = 1$，由于 $g'(x) = 1/x + 1/x^2$，所以 $g'(1) = 2$。因此，根据定理 7.4 和 7.5，

$$\lim_{x\to1}\Big(\frac{x}{x - 1} - \frac{1}{\ln x}\Big) = \frac12.$$

```check
e716 = x/(x - 1) - 1/log(x)
same(e716, (x*log(x) - (x - 1))/((x - 1)*log(x)))
same(diff(x*log(x) - (x - 1), x), log(x)); same(diff((x - 1)*log(x), x), log(x) + (x - 1)/x); same(log(x) + (x - 1)/x, log(x) + 1 - 1/x)
same(diff(log(x) + 1 - 1/x, x), 1/x + 1/x**2); same((1/x + 1/x**2).subs(x, 1), 2); same(diff(log(x), x).subs(x, 1), 1)
holds((log(x) + 1 - 1/x).subs(x, Rational(11, 10)) > 0); holds((log(x) + 1 - 1/x).subs(x, Rational(9, 10)) < 0)
limit_is(e716, x, 1, Rational(1, 2), '+'); limit_is(e716, x, 1, Rational(1, 2), '-')
limit_is(log(x)/(log(x) + 1 - 1/x), x, 1, Rational(1, 2))
```
:::

### 幂函数 {#powers}

形式 $1^\infty$、$0^0$ 和 $\infty^0$ 出现在 $f(x)^{g(x)}$ 的极限中，与 $f(x) > 0$ 相关。取对数：若 $y = f(x)^{g(x)}$，则

$$\ln y = g(x)\ln f(x),$$

其形式在所有三种情况下均为 $0\cdot\infty$。求 $L$ 的极限 $\ln y$；然后，由于 $e^x$ 是连续的（模块 3），所以 $y = e^{\ln y}$ 趋近于 $e^L$。

::: example 定义 $e$ 的极限
证明对于每个实数 $a$，均有 $\displaystyle\lim_{x\to\infty}\Big(1 + \frac{a}{x}\Big)^x = e^a$，从而推导出 $\Big(1 + \dfrac1n\Big)^n \to e$ 当 $n \to \infty$ 时。

对于 $a = 0$ 每个值都是 $1^x = 1 = e^0$。对于 $a \ne 0$，形式是 $1^\infty$。令 $y = (1 + a/x)^x$，对于 $x > \abs{a}$，使得 $1 + a/x > 0$。然后

$$\ln y = x\ln\Big(1 + \frac{a}{x}\Big) = \frac{\ln(1 + a/x)}{1/x},$$

形式为 $0/0$。顶部和底部在 $x > \abs{a}$ 处可导，且底部的导数 $-1/x^2$ 永远不为 0。对顶部（链式法则）和底部求导：

$$\frac{\dfrac{1}{1 + a/x}\cdot\Big(-\dfrac{a}{x^2}\Big)}{-\dfrac{1}{x^2}} = \frac{a}{1 + a/x} \;\to\; a.$$

所以 $\ln y \to a$ 根据定理 7.5，且 $y \to e^a$。以 $a = 1$， $(1 + 1/x)^x \to e$ 作为 $x \to \infty$，因此当 $x$ 遍历所有整数 $n = 1, 2, 3, \dots$ 时也是如此。

```check
ar = symbols('a', real=True)
same(x*log(1 + ar/x), log(1 + ar/x)/(1/x))
same(diff(log(1 + ar/x), x), 1/(1 + ar/x)*(-ar/x**2)); same(diff(1/x, x), -1/x**2); same(solve(-1/x**2, x), [])
same(diff(log(1 + ar/x), x)/diff(1/x, x), ar/(1 + ar/x)); limit_is(ar/(1 + ar/x), x, oo, ar)
limit_is(log(1 + ar/x), x, oo, 0); limit_is((1 + ar/x)**x, x, oo, exp(ar)); limit_is((1 + 1/n)**n, n, oo, E)
```
:::

这是模块 6 的复利，其 [定理 6.6](module_06_ZH.html#two-routes) 证明了对于整数 $n$，从 $\ln$ 在 1 处的导数得出的相同极限；洛必达法则给出了一个针对每个实数 $x$ 的第二证明。年利率为 $a$，每年复利 $n$ 次，一年后本金乘以 $(1 + a/n)^n$，当 $n$ 增大时，趋近于 $e^a$，即连续复利的因子。

::: example $0^0$ 和 $\infty^0$
求 $\displaystyle\lim_{x\to0^+} x^x$ 和 $\displaystyle\lim_{x\to\infty} x^{1/x}$。

**$x^x$，的形式为 $0^0$。** $\ln\big(x^x\big) = x\ln x \to 0$ 作为 $x \to 0^+$，根据例 7.15。因此 $x^x \to e^0 = 1$。

**$x^{1/x}$, of the form $\infty^0$.** $\ln\big(x^{1/x}\big) = \dfrac{\ln x}{x}$, of the form $\infty/\infty$. 导数的分母是 1，永远不是 0，导数的商是 $\dfrac{1/x}{1} \to 0$. 所以，根据定理 7.5， $\ln\big(x^{1/x}\big) \to 0$，和 $x^{1/x} \to e^0 = 1$；例如， $1000^{1/1000} \approx 1.0069$.

```check
xq = symbols('x', positive=True)
same(expand_log(log(xq**xq)), xq*log(xq)); same(expand_log(log(xq**(1/xq))), log(xq)/xq)
limit_is(x**x, x, 0, 1, '+'); same(diff(log(x), x)/diff(x, x), 1/x); limit_is(x**(1/x), x, oo, 1)
rounds(Integer(1000)**Rational(1, 1000), '1.0069')
```
:::

::: pitfall
未定式意味着未决定，不是“等于 1”。例如 7.17 中，形式 $1^\infty$ 可以趋近于 $e$，或者任何正数 $e^a$。形式 $0^0$ 也不一定趋近于 1：对于 $0 < x < 1$，$x^{1/\ln x} = e^{\ln x/\ln x} = e$，因此当 $x \to 0^+$，其中它具有形式 $0^0$，则趋近于 $e$。请记住最后一步：当 $\ln y \to L$ 时，答案是 $e^L$，而不是 $L$。

```check
same(exp(log(xq)/log(xq)), E); limit_is(x**(1/log(x)), x, 0, E, '+'); limit_is(1/log(x), x, 0, 0, '+')
```
:::

::: compute 使用 SymPy 计算极限，以及浮点数中的未定式
SymPy 的 `limit` 评估了本节和最后一节的极限。它的第四个参数是方向：`'+-'` 表示双边极限，`'+'` 或 `'-'` 表示单边极限。若省略该参数，SymPy 默认从右侧取极限，这与 $x \to 0$ 的含义不符。答案与示例一致：

```python
import sympy as sp
x = sp.symbols('x')
print(sp.limit((sp.exp(2*x) - 1)/sp.sin(3*x), x, 0, '+-'))
print(sp.limit((sp.exp(x) - 1 - x)/x**2, x, 0, '+-'))
print(sp.limit(x*sp.log(x), x, 0, '+'))
print(sp.limit(x/(x - 1) - 1/sp.log(x), x, 1, '+-'))
print(sp.limit((1 + 1/x)**x, x, sp.oo))
```

```output
2/3
1/2
0
1/2
E
```

浮点运算对不定形式有自己的处理方式，主要由 IEEE 754 浮点运算标准规定。形式 $0\cdot\infty$、$\infty - \infty$ 和 $\infty/\infty$ 会得到 `nan`，即 "非数"，在 Python 中 $0/0$ 会引发错误：

```python
import math
inf = math.inf
print(0.0*inf, inf - inf, inf/inf)
print(0.0**0.0, 1.0**inf, inf**0.0)
```

```output
nan nan nan
1.0 1.0 1.0
```

```python fails
print(0.0/0.0)
```

```output
ZeroDivisionError: float division by zero
```

三个幂的结果都是 1.0。这是一种约定，便于程序处理，并非数学上的极限：$(1 + 1/n)^n$ 具有 $1^\infty$ 的形式并趋近于 $e$。浮点运算甚至可能错误地得到该极限：

```python
for n in [10, 10**6, 10**12, 10**15, 10**16]:
    print(n, (1 + 1/n)**n)
```

```output
10 2.5937424601000023
1000000 2.7182804690957534
1000000000000 2.7185234960372378
1000000000000000 3.035035206549262
10000000000000000 1.0
```

直到 $n = 10^6$，值接近 $e = 2.71828\ldots$；然后它们出错。对于 $n = 10^{16}$， $1 + 10^{-16}$ 舍入到恰好 1，且 $1^n = 1$。对于 $n = 10^{12}$ 和 $10^{15}$， $1 + 1/n$ 以一个微小的相对误差存储，将其提升到幂 $n$ 会将该误差乘以约 $n$： $u^n$ 的条件数是 $n$（参见第 7.3 节的注释）。解决方法是避免形成 $1 + 1/n$： `math.log1p(u)` 对于小的 $u$ 可以准确计算 $\ln(1 + u)$，且 $(1 + 1/n)^n = e^{n\ln(1 + 1/n)}$。

```python
n = 10**15
print(math.exp(n*math.log1p(1/n)), math.e)
```

```output
2.7182818284590438 2.718281828459045
```
:::

```check
rounds(E, '2.71828'); same(x*diff(x**n, x)/x**n, n)
holds(Rational(1, 10**16) < Rational(1, 2)**53)            # 1 + 10^-16 is nearer 1 than the next double, 1 + 2^-52
```

## 比较增长速率 {#growth}

模块 3 通过函数随 $x \to \infty$ 增长的速度对它们进行排序（[定理 3.11](module_03_ZH.html#growth)）：对数增长比幂函数慢，幂函数又比指数函数慢。这种排序解释了为什么一个运行时间增长像 $n^2$ 的算法在大数据输入上会比一个运行时间增长像 $2^n$ 的算法更快。模块 3 在一个“深入理解”框中使用它所拥有的工具证明了这一点；洛必达法则只需几行即可证明。

::: theorem 对数增长比幂函数慢
对于每一个 $p > 0$，

$$\lim_{x\to\infty}\frac{\ln x}{x^p} = 0.$$
:::

::: proof
如 $x \to \infty$、$\ln x \to \infty$ 和 $x^p \to \infty$，以及 $x^p$ 的导数 $px^{p-1}$（第 6 模块）在 $x > 0$ 处不为 0。导数的商为

$$\frac{1/x}{px^{p-1}} = \frac{1}{px^p} \;\to\; 0,$$

因此，根据洛必达法则（定理 7.5） $\ln x/x^p \to 0$。
:::

```check
pp_ = symbols('p', positive=True)
same(diff(x**pp_, x), pp_*x**(pp_ - 1)); same((1/x)/(pp_*x**(pp_ - 1)), 1/(pp_*x**pp_))
limit_is(log(x)/x**pp_, x, oo, 0)
```

该定理对每一个 $p > 0$ 都成立，无论多么小，但对于小的 $p$，极限需要一定时间才能达到。表格显示 $\ln x/x^{0.1}$：它上升到 $10/e \approx 3.68$ 的最大值，出现在 $x = e^{10} \approx 22\,026$（第 8 模块展示如何找到此类最大值），然后才缓慢下降。

```valuetable
x = 10, Pow(10, 4, evaluate=False), Pow(10, 10, evaluate=False), Pow(10, 20, evaluate=False), Pow(10, 50, evaluate=False), Pow(10, 100, evaluate=False)
$\dfrac{\ln x}{x^{0.1}}$ = log(x)/x**(1/10)
digits = 4
---
x | \dfrac{\ln x}{x^{0.1}}
10 | 1.829
10^{4} | 3.667
10^{10} | 2.303
10^{20} | 0.4605
10^{50} | 0.001151
10^{100} | 2.303\times10^{-8}
```

```check
gr = log(x)/x**Rational(1, 10)
same(gr.subs(x, exp(10)), 10/E); rounds(10/E, '3.68'); rounds(exp(10), '22026')
same(solve(diff(gr, x), x), [exp(10)])
```

::: theorem 幂函数的增长速度慢于指数函数
对于每一个实数 $p$ 和每一个 $a > 1$，

$$\lim_{x\to\infty}\frac{x^p}{a^x} = 0.$$
:::

::: proof
先设 $a = e$，并取非负整数 $p = n$，其中 $n \ge 1$。商 $x^n/e^x$ 为 $\infty/\infty$ 型，且 $e^x$ 的导数始终非零。由洛必达法则，可改求 $nx^{n-1}/e^x$ 的极限。当 $n \ge 2$ 时，它仍为 $\infty/\infty$ 型。反复应用 $n$ 次后，

$$\frac{x^n}{e^x},\; \frac{nx^{n-1}}{e^x},\; \frac{n(n-1)x^{n-2}}{e^x},\; \dots,\; \frac{n!}{e^x},$$

其中$n! = n(n-1)\cdots2\cdot1$（模块3）。最后一个商趋于0。由定理7.5，列表中的每个商与下一个商具有相同的极限，因此逆向推导，它们都趋于0。（对于$n = 0$、$1/e^x \to 0$直接成立。）

接下来，对任意实数 $p$：选取一个整数 $n \ge p$。对于 $x \ge 1$，$x^p \le x^n$，因此 $0 < x^p/e^x \le x^n/e^x$，且夹逼定理（模块 2）给出 $x^p/e^x \to 0$。

最后，任意$a > 1$：则$\ln a > 0$且$a^x = e^{x\ln a}$。设$u = x\ln a$，其以$x$趋近于$\infty$；则

$$\frac{x^p}{a^x} = \frac{(u/\ln a)^p}{e^u} = \frac{1}{(\ln a)^p}\cdot\frac{u^p}{e^u} \;\to\; 0.$$
:::

```check
same(diff(x**5, x, 5), factorial(5)); same(factorial(5), 5*4*3*2*1)      # n differentiations of x^n leave n!, here n = 5
limit_is(x**5/exp(x), x, oo, 0); limit_is(factorial(5)/exp(x), x, oo, 0)
ell = symbols('ell', positive=True); up_ = symbols('u', positive=True)     # ell = ln a > 0, so a = e^ell > 1
same((up_/ell)**pp_/exp(up_), 1/ell**pp_*up_**pp_/exp(up_))
same((x**pp_/exp(ell)**x).subs(x, up_/ell), (up_/ell)**pp_/exp(up_))
limit_is(x**Rational(5, 2)/2**x, x, oo, 0); limit_is(x**pp_/exp(x), x, oo, 0)
```

再次，极限可以慢慢来。对于 $p = 10$：

```valuetable
x = 10, 20, 30, 40, 50, 100
$\dfrac{x^{10}}{e^x}$ = x**10/exp(x)
digits = 3
---
x | \dfrac{x^{10}}{e^x}
10 | 454000
20 | 21100
30 | 55.3
40 | 0.0445
50 | 1.88\times10^{-5}
100 | 3.72\times10^{-24}
```

在 $x = 10$ 处，$x^{10}$ 大约是 $e^x$ 的 450,000 倍；在 $x = 100$ 处，它大约小 $3 \times 10^{23}$ 倍。

```check
rounds(10**10/exp(10)/10**4, '45'); rounds(exp(100)/100**10, '3e23')        # about 450,000; about 3 x 10^23
```

::: keyidea
作为 $x \to \infty$，对于每一个 $p > 0$， $q > 0$ 和 $a > 1$： $\;\ln x \ll x^p \ll a^x\;$ 和 $\;(\ln x)^q \ll x^p$，其中 $f \ll g$（模块 3 的记号，读作 "f 比 g 小得多"）意味着 $f(x)/g(x) \to 0$。最后一个结论由第一个得出： $(\ln x)^q/x^p = \big(\ln x/x^{p/q}\big)^q \to 0$。任何对数的幂都比任何正幂的 $x$ 小，任何 $x$ 的幂都比任何大于 1 的底数的指数函数小，无论常数如何。
:::

```check
qp_ = symbols('q', positive=True)
Lp = symbols('L', positive=True)                          # L = ln x > 0 for x > 1
same((Lp/xq**(pp_/qp_))**qp_, Lp**qp_/xq**pp_)
limit_is(log(x)**3/x**Rational(1, 2), x, oo, 0)
```

::: pitfall
增长率是关于大 $x$ 的陈述。$x^{10}$ 在 $x = 10$ 和 $x = 30$ 处大于 $e^x$，且 $\ln x$ 在从大约 3 到大约 $3 \times 10^{15}$ 的每个 $x$ 处大于 $x^{0.1}$。同样的谨慎也适用于算法：对于大 $n$，需要 $n^2$ 步的算法优于需要 $2^n$ 步的算法，但对于 $n = 3$，后者需要 8 步而前者需要 9 步。

```check
holds(30**10 > exp(30))
c1g = nsolve(log(x) - x**Rational(1, 10), x, 3); c2g = nsolve(log(x) - x**Rational(1, 10), x, 3*10**15)
rounds(c1g, '3'); rounds(c2g, '3e15')
holds(10**10 > exp(10)); holds(log(Integer(10)**15) > Integer(10)**Rational(15, 10)); holds(log(Integer(10)**16) < Integer(10)**Rational(16, 10))
same(2**3, 8); same(3**2, 9)
```
:::

## 你所学到的内容 {#summary}

- **相关变化率**：画一个图，找出在每一时刻连接变化量的方程，对时间求导（每个量都是 $t$ 的函数，因此需要使用链式法则），然后才将该时刻的值代入。
- **线性近似** $L(x) = f(a) + f'(a)(x - a)$ 是在 $a$ 处的切线，且 $f(x) \approx L(x)$ 在 $a$ 附近。其误差相对于 $x - a$ 很小（定理 7.1），通常接近 $\tfrac12 f''(a)(x - a)^2$。例子： $\sqrt{4.1} \approx 2.025$, $\sin\theta \approx \theta$.
- **微分**: $dy = f'(x)\,dx$ 是切线上变化量， $\Delta y$ 是曲线上变化量，且 $\Delta y \approx dy$ 当 $dx$ 很小时。
- **误差** 传播遵循 $\Delta y \approx f'(x)\,\Delta x$。 $x^k$ 的相对误差约为 $\abs{k}$ 倍于 $x$ 的相对误差，因此球体体积的相对误差是其半径的三倍。
- **牛顿法** $x_{n+1} = x_n - f(x_n)/f'(x_n)$ 沿着切线逼近 $x$ 轴。在具有 $f'(r) \ne 0$ 的根附近，它以二次收敛，每次迭代大致将正确数字翻倍；对于平方根， $x_{n+1} = \tfrac12(x_n + a/x_n)$。它在水平切线处失效，可能循环、发散或离开定义域，并且在多重根处收敛缓慢。
- **洛必达法则**: 对于形式 $0/0$ 和 $\infty/\infty$，当 $g' \ne 0$ 接近 $a$ 时，若第二个极限存在，则 $\lim f/g = \lim f'/g'$。简单形式 $f'(a)/g'(a)$ 当 $f(a) = g(a) = 0$ 和 $g'(a) \ne 0$ 时，由导数的定义得出。每次使用前请检查形式，并分别对分子和分母进行求导。
- 其他 **不定形式**: 将 $0\cdot\infty$ 转换为一个商式，将 $\infty - \infty$ 放在同一个分母上，并对 $1^\infty$、$0^0$ 和 $\infty^0$ 取对数。特别是 $(1 + a/x)^x \to e^a$。
- **增长速率**: $\ln x \ll x^p \ll a^x$ 对于 $p > 0$ 和 $a > 1$，尽管“最终”可能意味着“仅当 $x$ 非常大时”。

```check
same(Lsq.subs(x, Rational(41, 10)), Rational(2025, 1000))
```

## 练习 {#exercises}

:::: exercise 一个球形气球 {#ex-7-1} ★
空气以 100 cm³ 每秒的速度被泵入球形气球中。

- (a) 当半径为 10 cm 时，半径增加的速度是多少？
- (b) 此时表面积 $S = 4\pi r^2$ 增加的速度是多少？
- (c) 当半径为 20 cm 时，半径增加的速度是多少？为什么更慢？

::: solution
**(a)** 体积是 $V = \tfrac43\pi r^3$。对 $t$ 求导（链式法则）： $\dfrac{dV}{dt} = 4\pi r^2\,\dfrac{dr}{dt}$。带入 $dV/dt = 100$ 和 $r = 10$： $100 = 400\pi\,\dfrac{dr}{dt}$，因此

$$\frac{dr}{dt} = \frac{1}{4\pi} \approx 0.0796 \text{ cm/s}.$$

**(b)** $\dfrac{dS}{dt} = 8\pi r\,\dfrac{dr}{dt} = 8\pi \cdot 10 \cdot \dfrac{1}{4\pi} = 20$ cm²/s。

**(c)** 在 $r = 20$ 处： $100 = 4\pi \cdot 400\,\dfrac{dr}{dt}$，因此 $\dfrac{dr}{dt} = \dfrac{1}{16\pi} \approx 0.0199$ cm/s，是 (a) 中速率的四分之一。相同的 100 cm³/s 被分散在一个面积 $4\pi r^2$ 上，该面积是原来的四倍，因此半径增长速度慢四倍。

```check
rb = Function('r')(t)
same(diff(Rational(4, 3)*pi*rb**3, t), 4*pi*rb**2*diff(rb, t))
dr10 = Rational(100)/(4*pi*10**2); same(dr10, 1/(4*pi)); rounds(dr10, '0.0796')
same(8*pi*10*dr10, 20)
dr20 = Rational(100)/(4*pi*20**2); same(dr20, 1/(16*pi)); rounds(dr20, '0.0199'); same(dr20/dr10, Rational(1, 4))
same((4*pi*20**2)/(4*pi*10**2), 4)
```
:::
::::

:::: exercise 线性近似 {#ex-7-2} ★
- (a) 求 $f(x) = \sqrt[3]{x}$ 在 $a = 27$ 处的线性化，并用它来估计 $\sqrt[3]{26}$ 和 $\sqrt[3]{28}$。
- (b) 求 $\ln x$ 在 $a = 1$ 处的线性化，并用它来估计 $\ln 1.1$ 和 $\ln 0.9$。
- (c) 将所有四个估计值与计算器结果进行比较。它们是偏大还是偏小？

::: solution
**(a)** $f(27) = 3$ 和 $f'(x) = \tfrac13 x^{-2/3}$，因此 $f'(27) = \dfrac{1}{3 \cdot 9} = \dfrac{1}{27}$ 和

$$L(x) = 3 + \frac{x - 27}{27}.$$

所以 $\sqrt[3]{26} \approx 3 - \tfrac{1}{27} = \tfrac{80}{27} \approx 2.96296$ 和 $\sqrt[3]{28} \approx 3 + \tfrac{1}{27} = \tfrac{82}{27} \approx 3.03704$。

**(b)** $\ln 1 = 0$ 和 $\ln x$ 的导数是 $1/x$，其在 $x = 1$ 处为 1。因此 $L(x) = x - 1$，且 $\ln 1.1 \approx 0.1$，$\ln 0.9 \approx -0.1$。

**(c)** 一台计算器给出 $\sqrt[3]{26} \approx 2.96250$，$\sqrt[3]{28} \approx 3.03659$，$\ln 1.1 \approx 0.09531$ 和 $\ln 0.9 \approx -0.10536$。所有四个估计值都略微偏大：立方根的误差分别为 0.00047 和 0.00045，对数的误差分别为 0.0047 和 0.0054。两个图像都向下弯曲，因此它们的切线位于图像上方。误差的大小符合第 7.2 节的规则 $f(x) - L(x) \approx \tfrac12 f''(a)(x - a)^2$。对于 $\sqrt[3]{x}$，$f''(x) = -\tfrac29 x^{-5/3}$，因此 $f''(27) = -\tfrac{2}{2187} \approx -0.00091$ 和 $\tfrac12(0.00091)(1)^2 \approx 0.00046$。对于 $\ln x$，$f''(1) = -1$ 和 $\tfrac12(1)(0.1)^2 = 0.005$。

```check
cr = x**Rational(1, 3)
same(diff(cr, x), x**Rational(-2, 3)/3); same(diff(cr, x).subs(x, 27), Rational(1, 27)); same(cr.subs(x, 27), 3)
Lcr = 3 + (x - 27)/27
same(Lcr.subs(x, 26), Rational(80, 27)); same(Lcr.subs(x, 28), Rational(82, 27)); rounds(Rational(80, 27), '2.96296'); rounds(Rational(82, 27), '3.03704')
same(diff(log(x), x).subs(x, 1), 1)
rounds(Integer(26)**Rational(1, 3), '2.96250'); rounds(Integer(28)**Rational(1, 3), '3.03659'); rounds(log(Rational(11, 10)), '0.09531'); rounds(log(Rational(9, 10)), '-0.10536')
rounds(Rational(80, 27) - Integer(26)**Rational(1, 3), '0.00047'); rounds(Rational(82, 27) - Integer(28)**Rational(1, 3), '0.00045')
rounds(Rational(1, 10) - log(Rational(11, 10)), '0.0047'); rounds(-Rational(1, 10) - log(Rational(9, 10)), '0.0054')
same(diff(cr, x, 2), -Rational(2, 9)*x**Rational(-5, 3)); same(diff(cr, x, 2).subs(x, 27), -Rational(2, 2187)); rounds(Rational(2, 2187), '0.00091')
rounds(Rational(1, 2)*Rational(2, 2187), '0.00046'); same(diff(log(x), x, 2).subs(x, 1), -1); same(Rational(1, 2)*1*Rational(1, 10)**2, Rational(5, 1000))
```
:::
::::

:::: exercise 是不定式吗？ {#ex-7-3} ★
对每个极限，说明是否适用洛必达法则，然后求出极限。

- (a) $\displaystyle\lim_{x\to0}\frac{e^{3x} - 1}{x}$
- (b) $\displaystyle\lim_{x\to\pi}\frac{\sin x}{x - \pi}$
- (c) $\displaystyle\lim_{x\to0}\frac{\cos x}{1 + x}$
- (d) $\displaystyle\lim_{x\to\infty}\frac{2x + 3}{5x - 1}$

::: solution
**(a)** 在 $x = 0$ 处，分子是 $e^0 - 1 = 0$，分母是 0：形式为 $0/0$。两者均可导，分母的导数是 1，从不为 0，因此适用该规则。导数的商是 $\dfrac{3e^{3x}}{1} \to 3$，因此极限是 3。

**(b)** $\sin\pi = 0$ 和 $\pi - \pi = 0$: 形式为 $0/0$，且分母的导数仍是 1。导数的商为 $\dfrac{\cos x}{1} \to \cos\pi = -1$，因此极限为 $-1$。 （简单形式，定理 7.4，给出相同结果：$f'(\pi)/g'(\pi) = -1/1$。）

**(c)** 在 $x = 0$ 处，分子是 $\cos 0 = 1$，分母是 1：不是不定式，因此规则不适用。代入求极限为 $1/1 = 1$。若强行应用规则，则得到 $\dfrac{-\sin x}{1} \to 0$，这是错误的。

**(d)** 两者顶部和底部都趋近于 $\infty$：形式为 $\infty/\infty$，底部的导数为 5，永远不会为 0。导数的商是常数 $2/5$，因此极限为 $\tfrac25$。将顶部和底部都除以 $x$（模块 3）得到相同的结果：$\dfrac{2 + 3/x}{5 - 1/x} \to \dfrac25$。

```check
same((exp(3*x) - 1).subs(x, 0), 0); same(diff(exp(3*x) - 1, x), 3*exp(3*x)); limit_is((exp(3*x) - 1)/x, x, 0, 3)
same(sin(pi), 0); limit_is(cos(x), x, pi, -1); limit_is(sin(x)/(x - pi), x, pi, -1)
same(cos(0)/(1 + 0), 1); limit_is(cos(x)/(1 + x), x, 0, 1); limit_is(-sin(x)/1, x, 0, 0)
limit_is((2*x + 3)/(5*x - 1), x, oo, Rational(2, 5)); same(diff(2*x + 3, x)/diff(5*x - 1, x), Rational(2, 5))
```
:::
::::

:::: exercise 牛顿法手动计算 {#ex-7-4} ★
方程 $x^3 - 2x - 5 = 0$ 在 2 附近有一个根。

- (a) 写出 $f(x) = x^3 - 2x - 5$ 的牛顿迭代步，并简化为一个分数。
- (b) 从 $x_0 = 2$ 开始，手动计算 $x_1$ 和 $x_2$（$x_2$ 作为分数并保留六位小数）。
- (c) 根是 $r = 2.0945514815\ldots$；$x_0$、$x_1$ 和 $x_2$ 分别正确到小数点后几位？
- (d) 为什么 $x_0 = 0.8$ 是一个较差的初始值？从它计算 $x_1$。

::: solution
**(a)** $f'(x) = 3x^2 - 2$。为 $x_n$ 写出 $x$，并将步骤放在公共分母 $3x^2 - 2$ 上：

$$\begin{aligned} &x - \frac{x^3 - 2x - 5}{3x^2 - 2} \\ &\quad= \frac{3x^3 - 2x - x^3 + 2x + 5}{3x^2 - 2} \\ &\quad= \frac{2x^3 + 5}{3x^2 - 2}. \end{aligned}$$

So $x_{n+1} = \dfrac{2x_n^3 + 5}{3x_n^2 - 2}$.

**(b)** $x_1 = \dfrac{2 \cdot 8 + 5}{3 \cdot 4 - 2} = \dfrac{21}{10} = 2.1$. 然后，用 $2.1^3 = 9.261$ 和 $2.1^2 = 4.41$，

$$\begin{aligned} x_2 &= \frac{2 \cdot 9.261 + 5}{3 \cdot 4.41 - 2} = \frac{23.522}{11.23} \\ &= \frac{11761}{5615} \approx 2.094568. \end{aligned}$$

**(c)** 误差是 $\abs{x_0 - r} \approx 0.095$, $\abs{x_1 - r} \approx 0.0054$ 和 $\abs{x_2 - r} \approx 0.000017$。与 $0.5 \times 10^{-d}$ 比较： $x_0$ 正确到 0 位小数（$0.095 < 0.5$ 但不是 $< 0.05$）， $x_1$ 正确到 1 位（$0.0054 < 0.05$ 但不是 $< 0.005$）和 $x_2$ 正确到 4 位（$0.000017 < 0.00005$ 但不是 $< 0.000005$）。下一个迭代正确到 9 位小数。

**(d)** $f'(0.8) = 3 \cdot 0.64 - 2 = -0.08$ 接近 0： $0.8$ 接近 $\sqrt{2/3} \approx 0.816$，其中 $f'(x) = 0$，因此在 $x_0$ 处的切线几乎水平，并且与 $x$ 轴相交点很远。用 $f(0.8) = 0.512 - 1.6 - 5 = -6.088$，

$$\begin{aligned} x_1 &= 0.8 - \frac{-6.088}{-0.08} \\ &= 0.8 - 76.1 = -75.3, \end{aligned}$$

大约距离根 77 个单位。在这里，方法逐渐恢复：对于大的 $\abs{x_n}$，步长 $\dfrac{2x_n^3 + 5}{3x_n^2 - 2}$ 接近 $\tfrac23 x_n$，因此每次迭代仅将近似值缩小约三分之一，而 $x_{12} \approx 1.97$ 是再次接近根的第一个迭代。从那里开始，正确的数字通常会翻倍。第 7.4 节的控件部件展示了整个过程。

```check
fn4 = x**3 - 2*x - 5
steps(x - fn4/diff(fn4, x), (3*x**3 - 2*x - x**3 + 2*x + 5)/(3*x**2 - 2), (2*x**3 + 5)/(3*x**2 - 2))
st4 = lambda v: (2*v**3 + 5)/(3*v**2 - 2)
same(st4(Integer(2)), Rational(21, 10)); same(Rational(21, 10)**3, Rational(9261, 1000)); same(Rational(21, 10)**2, Rational(441, 100))
same(st4(Rational(21, 10)), Rational(23522, 1000)/Rational(1123, 100)); same(st4(Rational(21, 10)), Rational(11761, 5615)); rounds(Rational(11761, 5615), '2.094568')
r4 = nsolve(fn4, x, 2.09, prec=60); rounds(r4, '2.0945514815')
it4 = [Integer(2), Rational(21, 10), Rational(11761, 5615), st4(Rational(11761, 5615))]
rounds(abs(it4[0] - r4), '0.095'); rounds(abs(it4[1] - r4), '0.0054'); rounds(abs(it4[2] - r4), '0.000017')
same([correct_dp(v, r4) for v in it4], [0, 1, 4, 9])
d4 = Rational(8, 10)                                                     # (d): the poor start 0.8
same(diff(fn4, x).subs(x, d4), 3*Rational(64, 100) - 2); same(3*Rational(64, 100) - 2, -Rational(8, 100))
same(fn4.subs(x, d4), Rational(512, 1000) - Rational(16, 10) - 5); same(Rational(512, 1000) - Rational(16, 10) - 5, -Rational(6088, 1000))
same_set(solve(diff(fn4, x), x), [sqrt(Rational(2, 3)), -sqrt(Rational(2, 3))]); rounds(sqrt(Rational(2, 3)), '0.816')
same(Rational(-6088, 1000)/Rational(-8, 100), Rational(761, 10)); same(st4(d4), d4 - Rational(761, 10)); same(st4(d4), -Rational(753, 10))
rounds(abs(-Rational(753, 10) - r4), '77')
limit_is(st4(x)/x, x, oo, Rational(2, 3)); limit_is(st4(x)/x, x, -oo, Rational(2, 3))   # far out, the step is about (2/3) x_n
itd = [d4]
for _ in range(16):
    itd.append(N(st4(itd[-1]), 60))
holds(all(abs(v - r4) > 1 for v in itd[1:12])); rounds(itd[12], '1.97')
same([correct_dp(v, r4) for v in itd[12:17]], [0, 1, 3, 8, 17])        # then the digits double
```
:::
::::

:::: exercise 两辆车 {#ex-7-5} ★★
汽车A位于十字路口以北0.3公里处，以90公里/小时的速度向南驶向十字路口。汽车B位于十字路口以东0.4公里处，以60公里/小时的速度向西驶向十字路口。两车之间的距离变化率是多少？是增加还是减少？

::: solution
设 $x$ 为 B 车在十字路口东边的距离，$y$ 为 A 车在十字路口北边的距离，$z$ 为两车在时间 $t$ 小时内的距离，单位为公里。两车均接近十字路口，因此 $x$ 和 $y$ 减小：$dx/dt = -60$ 和 $dy/dt = -90$。根据勾股定理，在每一时刻

$$z^2 = x^2 + y^2.$$

对 $t$ 求导：$2z\,\dfrac{dz}{dt} = 2x\,\dfrac{dx}{dt} + 2y\,\dfrac{dy}{dt}$。在该时刻，$x = 0.4$ 和 $y = 0.3$，因此 $z = \sqrt{0.16 + 0.09} = 0.5$，和

$$\begin{aligned} \frac{dz}{dt} &= \frac{x\,dx/dt + y\,dy/dt}{z} \\ &= \frac{0.4(-60) + 0.3(-90)}{0.5} \\ &= \frac{-24 - 27}{0.5} = -102 \text{ km/h}. \end{aligned}$$

两车之间的距离以102公里/小时的速度在减少。常见的错误是将两个速度都视为正数，这会导致$+102$：一个距离减少的量具有负的变化率。

```check
xt5, yt5, zt5 = Function('x')(t), Function('y')(t), Function('z')(t)
same(diff(zt5**2 - xt5**2 - yt5**2, t), 2*zt5*diff(zt5, t) - 2*xt5*diff(xt5, t) - 2*yt5*diff(yt5, t))
same(sqrt(Rational(16, 100) + Rational(9, 100)), Rational(1, 2))
same(Rational(4, 10)*(-60), -24); same(Rational(3, 10)*(-90), -27)
same((Rational(4, 10)*(-60) + Rational(3, 10)*(-90))/Rational(1, 2), -102)
```
:::
::::

:::: exercise 测量立方体 {#ex-7-6} ★★
立方体的边长测量为30厘米，最大误差不超过0.1厘米。

- (a) 估计计算出的体积的最大误差，作为绝对误差和相对误差。
- (b) 对计算出的表面积做同样的估计。
- (c) 体积误差不超过 0.5% 时，边长必须测量多准确？

::: solution
**(a)** $V = x^3$, 所以 $dV = 3x^2\,dx$. 以 $x = 30$ 和 $\abs{dx} \le 0.1$: $\abs{dV} \le 3 \cdot 900 \cdot 0.1 = 270$ cm³. 体积是 $30^3 = 27\,000$ cm³, 所以相对误差最多为 $270/27\,000 = 0.01 = 1\%$. 作为验证，幂的规则给出 $3 \times \tfrac{0.1}{30} = 1\%$.

**(b)** $S = 6x^2$, 所以 $dS = 12x\,dx$, 并且 $\abs{dS} \le 12 \cdot 30 \cdot 0.1 = 36$ cm². 面积是 $6 \cdot 900 = 5400$ cm², 所以相对误差最多为 $36/5400 = \tfrac{1}{150} \approx 0.67\%$: 边长的相对误差的两倍，因为 $S$ 是一个平方。

**(c)** $\dfrac{dV}{V} = 3\,\dfrac{dx}{x}$, 所以当 $\dfrac{\abs{dx}}{x} \le \dfrac{0.005}{3} = \dfrac{1}{600}$ 时，体积在 0.5% 以内，即 $\abs{dx} \le \dfrac{30}{600} = 0.05$ cm: 半毫米。

```check
same(3*30**2*Rational(1, 10), 270); same(30**3, 27000); same(Rational(270, 27000), Rational(1, 100)); same(3*Rational(1, 10)/30, Rational(1, 100))
same(diff(6*x**2, x), 12*x); same(12*30*Rational(1, 10), 36); same(6*30**2, 5400); same(Rational(36, 5400), Rational(1, 150)); rounds(100*Rational(1, 150), '0.67')
same(2*Rational(1, 10)/30, Rational(1, 150))
same(Rational(5, 1000)/3, Rational(1, 600)); same(30*Rational(1, 600), Rational(5, 100))
same(diff(x**3, x)/x**3, 3/x)
```
:::
::::

:::: exercise 洛必达法则在实际中的应用 {#ex-7-7} ★★
求每个极限。

- (a) $\displaystyle\lim_{x\to0}\frac{x - \sin x}{x^3}$
- (b) $\displaystyle\lim_{x\to0^+} x^2\ln x$
- (c) $\displaystyle\lim_{x\to0}\Big(\frac{1}{x} - \frac{1}{e^x - 1}\Big)$

::: solution
**(a)** 形式是 $0/0$。应用该法则三次，每次检查形式（分母 $x^3$、$3x^2$ 和 $6x$ 的导数分别为 $3x^2$、$6x$ 和 6，这些导数在 0 附近（除 0 外）都不为 0）：

$$\begin{aligned} &\frac{x - \sin x}{x^3},\; \frac{1 - \cos x}{3x^2}, \\ &\frac{\sin x}{6x},\; \frac{\cos x}{6}. \end{aligned}$$

前三个形式是 $0/0$；最后一个趋向于 $\tfrac16$。使用定理 7.5 逆向推导，极限是 $\tfrac16$。（在第三阶段，简单形式也适用：$\dfrac{\cos 0}{6} = \dfrac16$。）

**(b)** 形式是 $0\cdot(-\infty)$。写出 $x^2\ln x = \dfrac{\ln x}{x^{-2}}$，形式为 $\infty/\infty$（分子趋向于 $-\infty$，分母为 $\infty$）。分母的导数 $-2x^{-3}$ 在 $x > 0$ 处不为 0，导数的商为

$$\frac{1/x}{-2x^{-3}} = -\frac{x^2}{2} \;\to\; 0,$$

因此极限是 0。

**(c)** 形式是 $\infty - \infty$（从右侧；左侧为 $-\infty + \infty$）。通分后，

$$\frac1x - \frac{1}{e^x - 1} = \frac{e^x - 1 - x}{x(e^x - 1)},$$

的形式为 $0/0$. 对分子求导，分母用乘积法则求导，得到 $\dfrac{e^x - 1}{e^x - 1 + xe^x}$，再次得到 $0/0$，再求一次导得到 $\dfrac{e^x}{2e^x + xe^x} = \dfrac{1}{2 + x} \to \dfrac12$. 极限是 $\tfrac12$. (分母的导数 $e^x - 1 + xe^x$ 和 $2e^x + xe^x$ 在 0 附近不为 0，除了在 0 处：第一个的符号为 $x$，第二个在 0 附近为正.)

```check
e7a = [x - sin(x), x**3]
for _ in range(3):
    e7a = [diff(e7a[0], x), diff(e7a[1], x)]
same(e7a, [cos(x), 6]); limit_is((x - sin(x))/x**3, x, 0, Rational(1, 6))
same([diff(x**3, x), diff(x**3, x, 2)], [3*x**2, 6*x])
limit_is((1 - cos(x))/(3*x**2), x, 0, Rational(1, 6)); limit_is(sin(x)/(6*x), x, 0, Rational(1, 6))
same(diff(log(x), x)/diff(x**-2, x), -x**2/2); limit_is(x**2*log(x), x, 0, 0, '+')
e7c = 1/x - 1/(exp(x) - 1)
same(e7c, (exp(x) - 1 - x)/(x*(exp(x) - 1)))
same(diff(x*(exp(x) - 1), x), exp(x) - 1 + x*exp(x)); same(diff(exp(x) - 1 + x*exp(x), x), 2*exp(x) + x*exp(x))
same(exp(x)/(2*exp(x) + x*exp(x)), 1/(2 + x)); limit_is(e7c, x, 0, Rational(1, 2))
holds((exp(x) - 1 + x*exp(x)).subs(x, Rational(-1, 10)) < 0); holds((exp(x) - 1 + x*exp(x)).subs(x, Rational(1, 10)) > 0)
```
:::
::::

:::: exercise 指数形式 {#ex-7-8} ★★
- (a) 一个数据集有 $n$ 个样本。一个 **bootstrap 样本**，用于统计和机器学习，从数据集中随机抽取 $n$ 个样本，每次抽取一个，允许重复。某个样本未被抽取的概率是 $(1 - 1/n)^n$. 当 $n \to \infty$ 趋近于什么时，这个概率趋近于什么？
- (b) 求 $\displaystyle\lim_{x\to0^+}(\sin x)^x$。
- (c) 求 $\displaystyle\lim_{x\to\infty}(\ln x)^{1/x}$.

::: solution
**(a)** 形式为 $1^\infty$. 根据例 7.17，带入 $a = -1$， $(1 - 1/x)^x \to e^{-1}$ 作为 $x \to \infty$，因此

$$\Big(1 - \frac1n\Big)^n \to \frac1e \approx 0.368.$$

对于一个大数据集，大约 36.8% 的样本在任何一个 bootstrap 样本中都会被排除。

**(b)** 的形式是 $0^0$。令 $y = (\sin x)^x$，对于 $0 < x < \pi$。然后 $\ln y = x\ln\sin x = \dfrac{\ln\sin x}{1/x}$，形式为 $\infty/\infty$（上部分趋近于 $-\infty$）。下部分的导数 $-1/x^2$ 永远不为 0，导数的商是

$$\begin{aligned} \frac{\cos x/\sin x}{-1/x^2} &= -x \cdot \frac{x}{\sin x} \cdot \cos x \\ &\to 0 \cdot 1 \cdot 1 = 0, \end{aligned}$$

使用 $x/\sin x \to 1$（模块 2）。因此 $\ln y \to 0$ 和 $y \to e^0 = 1$。

**(c)** 的形式是 $\infty^0$。令 $y = (\ln x)^{1/x}$，对于 $x > 1$。然后 $\ln y = \dfrac{\ln(\ln x)}{x}$，形式为 $\infty/\infty$。 $\ln(\ln x)$ 的导数是 $\dfrac{1}{x\ln x}$（链式法则），下部分的导数是 1，因此导数的商是 $\dfrac{1}{x\ln x} \to 0$。因此 $\ln y \to 0$ 和 $y \to 1$。

```check
limit_is((1 - 1/n)**n, n, oo, exp(-1)); rounds(exp(-1), '0.368'); rounds(100*exp(-1), '36.8')
same(diff(log(sin(x)), x)/diff(1/x, x), -x**2*cos(x)/sin(x)); same(-x*(x/sin(x))*cos(x), -x**2*cos(x)/sin(x))
limit_is(-x**2*cos(x)/sin(x), x, 0, 0, '+'); limit_is(sin(x)**x, x, 0, 1, '+')
same(diff(log(log(x)), x), 1/(x*log(x))); limit_is(1/(x*log(x)), x, oo, 0); limit_is(log(x)**(1/x), x, oo, 1)
```
:::
::::

:::: exercise 求解 $e^{-x} = x$ {#ex-7-9} ★★
- (a) 证明方程 $e^{-x} = x$ 在 $[0, 1]$ 内恰好有一个解。
- (b) 证明 Newton 法用于 $f(x) = x - e^{-x}$ 的迭代步是 $x_{n+1} = \dfrac{1 + x_n}{1 + e^{x_n}}$。
- (c) 从 $x_0 = 0.5$ 开始，计算 $x_1$ 和 $x_2$。已知解是 $0.5671432904\ldots$，每个数有多少位小数是正确的？

::: solution
**(a)** $f(x) = x - e^{-x}$ 是连续的，具有 $f(0) = -1 < 0$ 和 $f(1) = 1 - 1/e > 0$，因此根据中间值定理，在 $(0, 1)$ 内有一个根。它只有一个：因为 $x$ 增加，而 $e^{-x}$ 减少，所以 $-e^{-x}$ 增加，而 $f$ 是两个增加函数的和，严格增加，因为 $x$ 是。

**(b)** $f'(x) = 1 + e^{-x}$。然后

$$\begin{aligned} &x - \frac{x - e^{-x}}{1 + e^{-x}} \\ &\quad= \frac{x + xe^{-x} - x + e^{-x}}{1 + e^{-x}} \\ &\quad= \frac{(1 + x)e^{-x}}{1 + e^{-x}} = \frac{1 + x}{e^x + 1}, \end{aligned}$$

在最后一步中，将分子和分母都乘以 $e^x$。

**(c)** $x_1 = \dfrac{1.5}{e^{0.5} + 1} \approx \dfrac{1.5}{2.648721} \approx 0.566311$，和 $x_2 = \dfrac{1.566311\ldots}{e^{0.566311\ldots} + 1} \approx 0.5671431650$。误差大约为 0.067，0.00083 和 $1.3 \times 10^{-7}$，因此 $x_0$， $x_1$ 和 $x_2$ 分别精确到 0，2 和 6 位小数； $x_3$ 精确到 14 位， $x_4$ 精确到 29 位。模式 0，2，6，14，29 是定理 7.3 的两倍。

```check
f9 = x - exp(-x)
same(f9.subs(x, 0), -1); holds(f9.subs(x, 1) > 0)
steps(x - f9/diff(f9, x), (x + x*exp(-x) - x + exp(-x))/(1 + exp(-x)), (1 + x)*exp(-x)/(1 + exp(-x)), (1 + x)/(exp(x) + 1))
it9 = [Rational(1, 2)]
for _ in range(4):
    it9.append(N((1 + it9[-1])/(exp(it9[-1]) + 1), 80))
rounds(exp(Rational(1, 2)) + 1, '2.648721'); rounds(it9[1], '0.566311'); rounds(it9[2], '0.5671431650')
r9 = nsolve(f9, x, 0.567, prec=80); rounds(r9, '0.5671432904')
rounds(abs(it9[0] - r9), '0.067'); rounds(abs(it9[1] - r9), '0.00083'); rounds(abs(it9[2] - r9), '1.3e-7')
same([correct_dp(v, r9) for v in it9], [0, 2, 6, 14, 29])
```
:::
::::

:::: exercise 平方根的倒数 {#ex-7-10} ★★★
必须避免除法的程序计算 $1/\sqrt a$，对于 $a > 0$，作为 $g(y) = \dfrac{1}{y^2} - a$ 的正根。

- (a) 证明牛顿法用于 $g$ 的迭代步 $y_{n+1} = \tfrac12 y_n\big(3 - ay_n^2\big)$，无需进行除法运算。
- (b) 将 $y_n = (1 + \varepsilon_n)/\sqrt a$ 表示为 $\abs{\varepsilon_n}$ 是 $y_n$ 的相对误差。证明 $\varepsilon_{n+1} = -\tfrac12\varepsilon_n^2(3 + \varepsilon_n)$。
- (c) 若 $\abs{\varepsilon_0} \le 0.01$，需要多少步才能使相对误差小于 $10^{-15}$？

::: solution
**(a)** $g(y) = y^{-2} - a$，因此 $g'(y) = -2y^{-3}$。然后

$$\begin{aligned} y - \frac{g(y)}{g'(y)} &= y - \frac{y^{-2} - a}{-2y^{-3}} \\ &= y + \frac{y^3\big(y^{-2} - a\big)}{2} \\ &= y + \frac{y - ay^3}{2} \\ &= \frac{3y - ay^3}{2} \\ &= \frac12 y\big(3 - ay^2\big). \end{aligned}$$

该步骤仅使用乘法、一次减法和一次除以二的操作，在二进制中是精确且高效的。

**(b)** 用 $y_n = (1 + \varepsilon_n)/\sqrt a$，则 $ay_n^2 = (1 + \varepsilon_n)^2$，因此

$$\begin{aligned} y_{n+1} &= \frac{1 + \varepsilon_n}{2\sqrt a}\big(3 - (1 + \varepsilon_n)^2\big) \\ &= \frac{(1 + \varepsilon_n)\big(2 - 2\varepsilon_n - \varepsilon_n^2\big)}{2\sqrt a}. \end{aligned}$$

展开后，得到 $(1 + \varepsilon)(2 - 2\varepsilon - \varepsilon^2) = 2 - 3\varepsilon^2 - \varepsilon^3$，因此

$$y_{n+1} = \frac{1 - \tfrac32\varepsilon_n^2 - \tfrac12\varepsilon_n^3}{\sqrt a},$$

即 $\varepsilon_{n+1} = -\tfrac32\varepsilon_n^2 - \tfrac12\varepsilon_n^3 = -\tfrac12\varepsilon_n^2(3 + \varepsilon_n)$：二次收敛性再次成立。

**(c)** 虽然 $\abs{\varepsilon_n} \le 0.01$，但 $\abs{\varepsilon_{n+1}} \le \tfrac12\varepsilon_n^2 \cdot 3.01$。由 $\abs{\varepsilon_0} \le 0.01$ 可得，每个上界向上取整后，得到 $\abs{\varepsilon_1} \le 1.51 \times 10^{-4}$， $\abs{\varepsilon_2} \le 3.41 \times 10^{-8}$， $\abs{\varepsilon_3} \le 1.75 \times 10^{-15}$ 和 $\abs{\varepsilon_4} \le 4.61 \times 10^{-30}$；所有值均小于 0.01，因此在每一步该不等式均成立。根据此上界，三步还不够；四步足够。

```check
yy, ae = symbols('y a', positive=True)
gy = 1/yy**2 - ae
steps(yy - gy/diff(gy, yy), yy + yy**3*(yy**-2 - ae)/2, yy + (yy - ae*yy**3)/2, (3*yy - ae*yy**3)/2, yy*(3 - ae*yy**2)/2)
yn = (1 + ep)/sqrt(ae)
same(ae*yn**2, (1 + ep)**2)
same(expand((1 + ep)*(2 - 2*ep - ep**2)), 2 - 3*ep**2 - ep**3)
same(expand((yn*(3 - ae*yn**2)/2)*sqrt(ae) - 1), -Rational(3, 2)*ep**2 - Rational(1, 2)*ep**3)
same(-Rational(3, 2)*ep**2 - Rational(1, 2)*ep**3, -ep**2*(3 + ep)/2)
bd = [Rational(1, 100)]
for _ in range(4):
    bd.append(bd[-1]**2*Rational(301, 100)/2)
E_ = lambda m, k: Rational(m, 100)*Rational(1, 10)**k                  # m/100 x 10^-k
holds(bd[1] <= E_(151, 4)); holds(bd[2] <= E_(341, 8)); holds(bd[3] <= E_(175, 15)); holds(bd[4] <= E_(461, 30))   # the bounds shown, rounded up
holds(bd[1] > E_(150, 4)); holds(bd[2] > E_(340, 8)); holds(bd[3] > E_(174, 15)); holds(bd[4] > E_(460, 30))       # and rounded up by less than 0.01
holds(Abs(3 + ep).subs(ep, Rational(1, 100)) <= Rational(301, 100)); holds(Abs(3 + ep).subs(ep, -Rational(1, 100)) <= Rational(301, 100))
holds(bd[3] > Rational(1, 10)**15); holds(bd[4] < Rational(1, 10)**15)
holds(all(b <= Rational(1, 100) for b in bd))
```
:::
::::

:::: exercise “最终”何时成立？ {#ex-7-11} ★★★
- (a) 证明 $\displaystyle\lim_{x\to\infty}\frac{(\ln x)^{10}}{x^{0.1}} = 0$。
- (b) 证明，尽管如此， $(\ln x)^{10}$ 在 $x = 10^{100}$ 处比 $x^{0.1}$ 大得多。
- (c) 用 $u = \ln x$，两个函数在 $10\ln u = 0.1u$ 处相等，即 $g(u) = u - 100\ln u$ 为 0 处。从 $u_0 = 600$ 使用牛顿法求出 5 位小数的解，并将对应的 $x$ 写成 10 的幂。

::: solution
**(a)** 将商写成十分幂：

$$\frac{(\ln x)^{10}}{x^{0.1}} = \Big(\frac{\ln x}{x^{0.01}}\Big)^{10}.$$

根据定理 7.6 与 $p = 0.01$，括号中的商趋近于 0，且 $t \mapsto t^{10}$ 连续，因此十分幂趋近于 $0^{10} = 0$。

**(b)** 在 $x = 10^{100}$ 处， $\ln x = 100\ln 10 \approx 230.26$，因此 $(\ln x)^{10} \approx 4.19 \times 10^{23}$，而 $x^{0.1} = 10^{10}$。对数的幂仍然比 $10^{13}$ 大得多。

**(c)** $g'(u) = 1 - 100/u$，因此步长为 $u_{n+1} = u_n - \dfrac{u_n - 100\ln u_n}{1 - 100/u_n}$。从 $u_0 = 600$： $u_1 \approx 647.63156$， $u_2 \approx 647.27753$， $u_3 \approx 647.27751$，且 $u_4$ 与 $u_3$ 在更多小数位上一致。因此 $u \approx 647.27751$，且

$$\begin{aligned} x = e^{647.27751} &= 10^{647.27751/\ln 10} \\ &\approx 10^{281.1}. \end{aligned}$$

所以 $(\ln x)^{10}$ 保持领先于 $x^{0.1}$ 直到大约 $x = 10^{281}$。（模块 8 的工具显示 $g$ 在 $u > 100$ 上增加，因此在此点之后 $x^{0.1}$ 会保持领先。）

```check
xq11 = symbols('x', positive=True)
same((log(xq11)/xq11**Rational(1, 100))**10, log(xq11)**10/xq11**Rational(1, 10))
limit_is(log(x)/x**Rational(1, 100), x, oo, 0)
rounds(100*log(10), '230.26'); rounds((100*log(10))**10, '4.19e23'); holds((100*log(10))**10/10**10 > 10**13)
gu = u - 100*log(u)
same(diff(gu, u), 1 - 100/u)
it11 = [Integer(600)]
for _ in range(4):
    it11.append(N(it11[-1] - gu.subs(u, it11[-1])/diff(gu, u).subs(u, it11[-1]), 60))
rounds(it11[1], '647.63156'); rounds(it11[2], '647.27753'); rounds(it11[3], '647.27751'); near(it11[4], it11[3], 1e-9)
rounds(it11[3]/log(10), '281.1')
```
:::
::::

:::: exercise 条件数 {#ex-7-12} ★★★
假设 $x$ 已知，其相对误差为 $\rho$（希腊字母 "rho"），并且 $y = f(x)$ 是由此计算得到的。

- (a) 使用微分来证明 $y$ 的相对误差大约为 $\kappa(x)\,\rho$，其中 $\kappa(x) = \abs{\dfrac{x f'(x)}{f(x)}}$（希腊字母 "kappa"）是 $f$ 在 $x$ 处的 **条件数**。
- (b) 求 $x^k$、$e^x$、$\ln x$ 和 $x - 1$ 的条件数。
- (c) 一台计算机以相对误差约为 $10^{-16}$ 的精度存储 $x = 1 + 10^{-8}$。由此计算得到的 $\ln x$ 的相对误差大约有多大？解释第 7.6 节末尾计算框中 $(1 + 1/n)^n$ 的结果。

::: solution
**(a)** 如果 $x$ 的误差为 $dx$，那么 $y$ 的误差大约为 $dy = f'(x)\,dx$，因此 $y$ 的相对误差大约为

$$\begin{aligned} \abs{\frac{dy}{y}} &= \abs{\frac{f'(x)\,dx}{f(x)}} \\ &= \abs{\frac{xf'(x)}{f(x)}}\cdot\abs{\frac{dx}{x}} \\ &= \kappa(x)\,\rho. \end{aligned}$$

**(b)** 对于 $x^k$： $\abs{\dfrac{x \cdot kx^{k-1}}{x^k}} = \abs{k}$，参见第 7.3 节的规则。对于 $e^x$： $\abs{\dfrac{xe^x}{e^x}} = \abs{x}$。对于 $\ln x$： $\abs{\dfrac{x \cdot (1/x)}{\ln x}} = \dfrac{1}{\abs{\ln x}}$。对于 $x - 1$： $\abs{\dfrac{x}{x - 1}}$。

**(c)** 对于 $\ln x$ 在 $x = 1 + 10^{-8}$ 处，$\ln x \approx 10^{-8}$（练习 7.2 的线性近似 $\ln x \approx x - 1$），因此 $\kappa \approx 10^8$，且 $\ln x$ 的相对误差约为 $10^8 \times 10^{-16} = 10^{-8}$：大约损失了 16 位数字的一半。$\ln x$ 和 $x - 1$ 在接近 1 处都严重病态，这就是为什么 `math.log1p(u)` 采用的是小数 $u$ 本身，而不是 $1 + u$。在计算框中，$(1 + 1/n)^n = u^n$ 与 $u = 1 + 1/n$ 相乘，$u^n$ 的条件数为 $n$：存储 $u$ 时相对误差约为 $10^{-16}$，会增长到约 $n \times 10^{-16}$，这相当于 $10^{-4}$ 对于 $n = 10^{12}$（计算值相对于 $e$ 的相对误差约为 $9 \times 10^{-5}$）以及约 $0.1$ 对于 $n = 10^{15}$（相对误差约为 12%）。

```check
kp = symbols('k')
same(x*diff(x**kp, x)/x**kp, kp); same(x*diff(exp(x), x)/exp(x), x); same(x*diff(log(x), x)/log(x), 1/log(x)); same(x*diff(x - 1, x)/(x - 1), x/(x - 1))
x12 = 1 + Rational(1, 10)**8
rounds(log(x12), '1.0e-8'); rounds(1/log(x12), '1.0e8')
rounds((Rational(27185234960372378, 10**16) - E)/E, '9e-5'); rounds(100*(Rational(3035035206549262, 10**15) - E)/E, '12')
same(x*diff(x**n, x)/x**n, n)
```
:::
::::

## 自测 {#quiz}

```quiz
? 圆的半径以 2 cm/s 的速度增长。当半径为 5 cm 时，面积增长的速度是多少？
- [x] $20\pi$ cm²/s
- [ ] $10\pi$ cm²/s
- [ ] $4\pi$ cm²/s
- [ ] $25\pi$ cm²/s
> $A = \pi r^2$, 所以 $dA/dt = 2\pi r\,dr/dt = 2\pi \cdot 5 \cdot 2 = 20\pi$. $10\pi$ 是 $dA/dr$ 在 $r = 5$ 处，没有因子 $dr/dt = 2$; $4\pi$ 忽略了 $r$; $25\pi$ 是面积本身，不是其变化率。

? 使用 $\sqrt x$ 在 9 处的线性近似， $\sqrt{9.6}$ 约为
- [ ] $3.2$
- [ ] $3.6$
- [x] $3.1$
- [ ] $3.05$
> $f'(9) = \dfrac{1}{2\sqrt9} = \dfrac16$, 所以 $L(x) = 3 + \dfrac{x - 9}{6}$ 和 $L(9.6) = 3 + 0.1 = 3.1$ (真实值为 $3.098\ldots$). $3.2$ 使用斜率 $\tfrac13$，忘记 $\dfrac{1}{2\sqrt x}$ 中的 2; $3.6$ 使用斜率 1; $3.05$ 使用斜率 $\tfrac{1}{12}$.

? 球体的半径测量相对误差最多为 1%。计算出的表面积 $4\pi r^2$ 的相对误差约为
- [ ] $1\%$
- [x] $2\%$
- [ ] $3\%$
- [ ] $4\%$
> 对于 $S = cr^2$, $dS/S = 2\,dr/r$: 相对误差加倍，为 2%. 3% 是立方体体积的相对误差；常数 $4\pi$ 不改变相对误差，因此 4% 是错误的；1% 忽略了幂次。

? 牛顿法对 $f(x) = x^2 - 5$ 从 $x_0 = 2$ 的一步计算得到
- [ ] $1.75$
- [ ] $2.5$
- [ ] $2.236$
- [x] $2.25$
> $x_1 = 2 - \dfrac{f(2)}{f'(2)} = 2 - \dfrac{-1}{4} = 2.25$. $1.75$ 是由于符号错误（$f(2) = -1$ 为负数）导致的；$2.5$ 除以 $x_0$ 而不是 $f'(x_0) = 2x_0$；$2.236 \approx \sqrt5$ 是根本身，而迭代过程只是逐渐趋近于它。

? 牛顿法对 $f(x) = \sqrt[3]{x}$ 从 $x_0 = 1$ 产生
- [x] $-2, 4, -8, \dots$: 迭代远离根 0
- [ ] 一步后得到根 0
- [ ] 错误，因为 $f'(1) = 0$
- [ ] 接近 0 的缓慢迭代
> 每一步得到 $x_{n+1} = -2x_n$（例 7.11）。$f'(1) = \tfrac13$，而非 0；问题出在根处，那里 $f'(0)$ 不存在且图像有垂直切线。

? $\displaystyle\lim_{x\to0}\frac{x + 1}{x + 2}$等于
- [ ] $1$
- [ ] $0$
- [x] $\dfrac12$
- [ ] 它不存在
> 形式不是不定式：代入 $x = 0$ 得到 $\tfrac12$。不管怎样应用洛必达法则得到 $\tfrac11 = 1$，这是错误的：法则需要 $0/0$ 或 $\infty/\infty$。

? $\displaystyle\lim_{x\to\infty}\Big(1 + \frac{3}{x}\Big)^x$等于
- [ ] $1$
- [ ] $e$
- [ ] $3$
- [x] $e^3$
> 例7.17中使用 $a = 3$，极限是 $e^3$。答案1将形式 $1^\infty$ 视为1； $e$ 是 $a = 1$ 的情况；3是自然对数的极限 $x\ln(1 + 3/x) \to 3$，不包含最后一步 $y = e^{\ln y}$。

? 哪个函数在 $x \to \infty$ 时增长最快？
- [ ] $x^{100}$
- [x] $1.01^x$
- [ ] $(\ln x)^{100}$
- [ ] $x^{100}\ln x$
> 任何 $x$ 的幂函数都会被大于1的指数函数超越（定理7.7）： $x^{100}/1.01^x \to 0$，且 $x^{100}\ln x \le x^{101}$ 对于 $x \ge 1$，因此它也会被超越。 $(\ln x)^{100}$ 增长速度慢于 $x^{100}$（第7.7节的关键思想）。指数函数只有在 $x$ 非常大时才会超越幂函数。
```

```check
same(2*pi*5*2, 20*pi); same(diff(pi*r**2, r).subs(r, 5), 10*pi)
same(diff(sqrt(x), x).subs(x, 9), Rational(1, 6)); same(3 + Rational(6, 10)/6, Rational(31, 10)); rounds(sqrt(Rational(96, 10)), '3.098')
same(3 + Rational(6, 10)/3, Rational(32, 10)); same(3 + Rational(6, 10)/12, Rational(305, 100))
same(diff(4*pi*r**2, r)/(4*pi*r**2), 2/r)
same(2 - Rational(2**2 - 5, 2*2), Rational(9, 4)); same(2 - Rational(2**2 - 5, 2), Rational(5, 2)); rounds(sqrt(5), '2.236')
same(Rational(0 + 1, 0 + 2), Rational(1, 2))
limit_is((1 + 3/x)**x, x, oo, exp(3)); limit_is(x*log(1 + 3/x), x, oo, 3)
limit_is(x**100/Rational(101, 100)**x, x, oo, 0); limit_is(log(x)**100/x**100, x, oo, 0)
```
