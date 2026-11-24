---
title: 公式表
lead: 从极限到向量微积分，集中查阅本系列的公式、适用条件和讲解这些公式的模块。
---

与各模块的例题一样，本页的每个公式都用计算机代数系统 SymPy 检验。
角度以弧度为单位，$\ln$ 表示自然对数，$C$ 是任意
常数。公式旁列出的条件是公式的一部分，条件不成立时公式可能失效。

## 代数与三角学 {#algebra}

本系列以中学代数为基础。数学基础系列的[代数复习选修课](../math/module_00_ZH.html)
可帮助你回顾这些知识。[模块 1](module_01_ZH.html) 回顾了指数函数、
对数函数和三角函数。

### 代数 {#school-algebra}

| 名称 | 公式 | 适用条件 |
|---|---|---|
| 二次方程公式 | ${ax^2 + bx + c = 0 \iff x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}}$ | 实系数，${a \ne 0}$ 和 ${b^2 - 4ac \ge 0}$。负判别式给出无实根 |
| 配方法 | ${ax^2 + bx + c = a\Big(x + \dfrac{b}{2a}\Big)^2 + c - \dfrac{b^2}{4a}}$ | ${a \ne 0}$ |
| 幂差公式 | ${x^n - a^n = (x - a)(x^{n-1} + x^{n-2}a + \cdots + a^{n-1})}$ | ${n = 1, 2, 3, \ldots}$ |
| 直线上距离 | ${\abs{x - a} < \delta \iff a - \delta < x < a + \delta}$ | ${\delta > 0}$ |
| 三角不等式 | ${\abs{a + b} \le \abs{a} + \abs{b}}$ | 所有实数 ${a,}$ ${b}$ |

最后两行是[模块 2](module_02_ZH.html) 中严格定义极限的工具。

```check
# quadratic formula, completing the square (a != 0)
same_set(solve(a*x**2 + b*x + c, x), [(-b + sqrt(b**2 - 4*a*c))/(2*a), (-b - sqrt(b**2 - 4*a*c))/(2*a)])
same(a*(x + b/(2*a))**2 + c - b**2/(4*a), a*x**2 + b*x + c)
for N_ in range(1, 8):                                        # x^n - a^n, n = 1..7
    same((x - a)*sum(x**(N_ - 1 - j)*a**j for j in range(N_)), x**N_ - a**N_)
xr, ar = symbols('x_r a_r', real=True)
dl = symbols('delta', positive=True)
same(solveset(Abs(xr - ar) < dl, xr, S.Reals), Interval.open(ar - dl, ar + dl))
# triangle inequality: (|a| + |b|)^2 - (a + b)^2 = 2(|ab| - ab) >= 0, and instances
ra, rb = symbols('r_a r_b', real=True)
same((Abs(ra) + Abs(rb))**2 - (ra + rb)**2, 2*(Abs(ra*rb) - ra*rb))
for p_, q_ in ((3, -5), (-2, -7), (4, 6), (0, -1), (Rational(1, 2), Rational(-3, 4))):
    holds(abs(p_ + q_) <= abs(p_) + abs(q_)); holds(abs(p_*q_) >= p_*q_)
```

### 指数与对数 {#exponents-logarithms}

| 法则 | 公式 | 适用条件 |
|---|---|---|
| 积 | ${a^x a^y = a^{x+y}}$ | ${a > 0;}$ ${x,}$ ${y}$ 实数 |
| 商 | ${\dfrac{a^x}{a^y} = a^{x-y}}$ | ${a > 0}$ |
| 幂的幂 | ${(a^x)^y = a^{xy}}$ | ${a > 0}$ |
| 积的幂 | ${(ab)^x = a^x b^x}$ | ${a > 0,}$ ${b > 0}$ |
| 零与负指数 | ${a^0 = 1,}$ ${\ a^{-x} = \dfrac{1}{a^x}}$ | ${a > 0}$ |
| 根 | ${a^{m/n} = \sqrt[n]{a^m}}$ | ${a > 0;}$ ${m,}$ ${n}$ 整数, ${n \ge 1}$ |

非零负数底的整数次幂的乘积、商和幂的法则同样适用。
对于分数指数，底数为正的条件不可省略。例如 $\big((-1)^2\big)^{1/2} = 1$，但 $(-1)^{2 \cdot 1/2} = -1$。

| 法则 | 公式 | 适用条件 | 模块 |
|---|---|---|---|
| 反函数 | ${e^{\ln x} = x}$ | ${x > 0}$ | [1](module_01_ZH.html) |
|  | ${\ln(e^x) = x}$ | 每个实数 ${x}$ | [1](module_01_ZH.html) |
| 积 | ${\ln(xy) = \ln x + \ln y}$ | ${x > 0,}$ ${y > 0}$ | [1](module_01_ZH.html) |
| 商 | ${\ln\dfrac{x}{y} = \ln x - \ln y}$ | ${x > 0,}$ ${y > 0}$ | [1](module_01_ZH.html) |
| 幂 | ${\ln(x^r) = r\ln x}$ | ${x > 0,}$ ${r}$ 实数 | [1](module_01_ZH.html) |
| 偶次幂 | ${\ln(x^2) = 2\ln\abs{x}}$ | ${x \ne 0}$ | [1](module_01_ZH.html) |
| 值 | ${\ln 1 = 0,}$ ${\ \ln e = 1}$ |  | [1](module_01_ZH.html) |
| 底数变换 | ${\log_a x = \dfrac{\ln x}{\ln a}}$ | ${a > 0,}$ ${a \ne 1,}$ ${x > 0}$ | [1](module_01_ZH.html) |
| 底数 ${e}$ | ${a^x = e^{x\ln a}}$ | ${a > 0,}$ ${x}$ 实数 | [6](module_06_ZH.html) |

```check
A_, B_ = symbols('A B', positive=True)                        # bases a, b > 0
X_, Y_ = symbols('X Y', real=True)                            # real exponents
same(A_**X_*A_**Y_, A_**(X_ + Y_)); same(A_**X_/A_**Y_, A_**(X_ - Y_))
same((A_**X_)**Y_, A_**(X_*Y_)); same((A_*B_)**X_, A_**X_*B_**X_)
same(A_**0, 1); same(A_**(-X_), 1/A_**X_)
mi, ni = symbols('m_i n_i', integer=True); ni = symbols('n_i', integer=True, positive=True)
same(A_**(mi/ni), root(A_**mi, ni))
for base in (S(-2), S(-3), Rational(-1, 2), S(5)):        # whole-number exponents, any base != 0
    for m_, n_ in ((3, -5), (2, 4), (-1, -2), (0, 3)):
        same(base**m_*base**n_, base**(m_ + n_)); same((base**m_)**n_, base**(m_*n_))
        same(base**m_/base**n_, base**(m_ - n_)); same((base*7)**m_, base**m_*7**m_)
same(((-1)**2)**Rational(1, 2), 1); same((-1)**(2*Rational(1, 2)), -1)   # a negative base breaks them
P_, Q_ = symbols('P Q', positive=True)                        # x, y > 0
same(exp(log(P_)), P_); same(log(exp(X_)), X_)
same(log(P_*Q_), log(P_) + log(Q_)); same(log(P_/Q_), log(P_) - log(Q_)); same(log(P_**Y_), Y_*log(P_))
xnz = symbols('x_nz', real=True, nonzero=True)
same(log(xnz**2), 2*log(Abs(xnz)))
for v_ in (-3, Rational(-1, 2), 2, 5):
    same(log(v_**2), 2*log(abs(v_)))
same(log(1), 0); same(log(E), 1)
same(log(P_, A_), log(P_)/log(A_)); same(log(8, 2), 3); same(log(1000, 10), 3)
same(exp(X_*log(A_)), A_**X_); same(exp(3*log(2)), 8)
```

### 三角恒等式 {#trigonometry}

它们适用于所有实数角度，除非给出特定条件。

| 名称 | 恒等式 | 适用条件 |
|---|---|---|
| 勾股定理 | ${\sin^2\theta + \cos^2\theta = 1}$ |  |
|  | ${1 + \tan^2\theta = \sec^2\theta}$ | ${\cos\theta \ne 0}$ |
|  | ${1 + \cot^2\theta = \csc^2\theta}$ | ${\sin\theta \ne 0}$ |
| 定义 | ${\tan\theta = \dfrac{\sin\theta}{\cos\theta},}$ ${\ \sec\theta = \dfrac{1}{\cos\theta}}$ | ${\cos\theta \ne 0}$ |
|  | ${\cot\theta = \dfrac{\cos\theta}{\sin\theta},}$ ${\ \csc\theta = \dfrac{1}{\sin\theta}}$ | ${\sin\theta \ne 0}$ |
| 对称性 | ${\sin(-\theta) = -\sin\theta,}$ ${\ \cos(-\theta) = \cos\theta}$ |  |
| 周期 | ${\sin(\theta + 2\pi) = \sin\theta,}$ ${\ \cos(\theta + 2\pi) = \cos\theta}$ |  |
|  | ${\tan(\theta + \pi) = \tan\theta}$ | ${\cos\theta \ne 0}$ |
| 余角 | ${\sin\big(\tfrac{\pi}{2} - \theta\big) = \cos\theta,}$ ${\ \cos\big(\tfrac{\pi}{2} - \theta\big) = \sin\theta}$ |  |
| 补角 | ${\sin(\pi - \theta) = \sin\theta,}$ ${\ \cos(\pi - \theta) = -\cos\theta}$ |  |
| 加法 | ${\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta}$ |  |
|  | ${\cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta}$ |  |
|  | ${\tan(\alpha + \beta) = \dfrac{\tan\alpha + \tan\beta}{1 - \tan\alpha\tan\beta}}$ | 两边均有定义 |
| 双角公式 | ${\sin 2\theta = 2\sin\theta\cos\theta}$ |  |
|  | ${\cos 2\theta = \cos^2\theta - \sin^2\theta = 2\cos^2\theta - 1 = 1 - 2\sin^2\theta}$ |  |
| 平方 | ${\sin^2\theta = \tfrac12(1 - \cos 2\theta),}$ ${\ \cos^2\theta = \tfrac12(1 + \cos 2\theta)}$ |  |
| 积 | ${\sin\alpha\cos\beta = \tfrac12\big[\sin(\alpha - \beta) + \sin(\alpha + \beta)\big]}$ |  |
|  | ${\sin\alpha\sin\beta = \tfrac12\big[\cos(\alpha - \beta) - \cos(\alpha + \beta)\big]}$ |  |
|  | ${\cos\alpha\cos\beta = \tfrac12\big[\cos(\alpha - \beta) + \cos(\alpha + \beta)\big]}$ |  |

```check
al, be = symbols('alpha beta', real=True)
th = symbols('theta', real=True)
same(sin(th)**2 + cos(th)**2, 1); same(1 + tan(th)**2, sec(th)**2); same(1 + cot(th)**2, csc(th)**2)
same(tan(th), sin(th)/cos(th)); same(sec(th), 1/cos(th)); same(cot(th), cos(th)/sin(th)); same(csc(th), 1/sin(th))
same(sin(-th), -sin(th)); same(cos(-th), cos(th))
same(sin(th + 2*pi), sin(th)); same(cos(th + 2*pi), cos(th)); same(tan(th + pi), tan(th))
same(sin(pi/2 - th), cos(th)); same(cos(pi/2 - th), sin(th)); same(sin(pi - th), sin(th)); same(cos(pi - th), -cos(th))
for sg in (1, -1):                                            # the upper and the lower signs
    same(sin(al + sg*be), sin(al)*cos(be) + sg*cos(al)*sin(be))
    same(cos(al + sg*be), cos(al)*cos(be) - sg*sin(al)*sin(be))
same(tan(al + be), (tan(al) + tan(be))/(1 - tan(al)*tan(be)))
same(sin(2*th), 2*sin(th)*cos(th))
steps(cos(2*th), cos(th)**2 - sin(th)**2, 2*cos(th)**2 - 1, 1 - 2*sin(th)**2)
same(sin(th)**2, (1 - cos(2*th))/2); same(cos(th)**2, (1 + cos(2*th))/2)
same(sin(al)*cos(be), (sin(al - be) + sin(al + be))/2)
same(sin(al)*sin(be), (cos(al - be) - cos(al + be))/2)
same(cos(al)*cos(be), (cos(al - be) + cos(al + be))/2)
```

### 精确值 {#exact-values}

由于 $\pi$ 弧度等于 $180^\circ$，一个 $d$ 度的角等于 $\pi d/180$ 弧度。

| ${\theta}$ | ${\sin\theta}$ | ${\cos\theta}$ | ${\tan\theta}$ |
|---|---|---|---|
| ${0}$ | ${0}$ | ${1}$ | ${0}$ |
| ${\pi/6\;\;(30^\circ)}$ | ${1/2}$ | ${\sqrt3/2}$ | ${1/\sqrt3 = \sqrt3/3}$ |
| ${\pi/4\;\;(45^\circ)}$ | ${\sqrt2/2}$ | ${\sqrt2/2}$ | ${1}$ |
| ${\pi/3\;\;(60^\circ)}$ | ${\sqrt3/2}$ | ${1/2}$ | ${\sqrt3}$ |
| ${\pi/2\;\;(90^\circ)}$ | ${1}$ | ${0}$ | 无定义 |
| ${\pi\;\;(180^\circ)}$ | ${0}$ | ${-1}$ | ${0}$ |
| ${3\pi/2\;\;(270^\circ)}$ | ${-1}$ | ${0}$ | 无定义 |

其他标准角度可通过上述对称性得出：例如
$\sin(5\pi/6) = \sin(\pi/6) = 1/2$ 与 $\cos(2\pi/3) = -\cos(\pi/3) = -1/2$。

```check
values = {0: (0, 1, 0), pi/6: (Rational(1, 2), sqrt(3)/2, sqrt(3)/3), pi/4: (sqrt(2)/2, sqrt(2)/2, 1),
          pi/3: (sqrt(3)/2, Rational(1, 2), sqrt(3)), pi/2: (1, 0, None), pi: (0, -1, 0), 3*pi/2: (-1, 0, None)}
for ang, (s_, c_, t_) in values.items():
    same(sin(ang), s_); same(cos(ang), c_)
    if t_ is None:
        holds(cos(ang) == 0)                                  # tan undefined: cos = 0
    else:
        same(tan(ang), t_)
same(1/sqrt(3), sqrt(3)/3)
for deg, rad in ((30, pi/6), (45, pi/4), (60, pi/3), (90, pi/2), (180, pi), (270, 3*pi/2)):
    same(pi*deg/180, rad)
steps(sin(5*pi/6), sin(pi/6), Rational(1, 2)); steps(cos(2*pi/3), -cos(pi/3), Rational(-1, 2))
```

## 极限 {#limits}

| 极限 | 值 | 适用条件 | 模块 |
|---|---|---|---|
| ${\lim\limits_{\theta\to0}\dfrac{\sin\theta}{\theta}}$ | ${1}$ | ${\theta}$ 以弧度为单位 | [2](module_02_ZH.html) |
| ${\lim\limits_{\theta\to0}\dfrac{1 - \cos\theta}{\theta}}$ | ${0}$ | ${\theta}$ 以弧度为单位 | [2](module_02_ZH.html) |
| ${\lim\limits_{n\to\infty}\Big(1 + \dfrac{1}{n}\Big)^n}$ | ${e}$ |  | [6](module_06_ZH.html) |
| ${\lim\limits_{n\to\infty}\Big(1 + \dfrac{x}{n}\Big)^n}$ | ${e^x}$ | 每个实数 ${x}$ | [6](module_06_ZH.html) |
| ${\lim\limits_{h\to0}\dfrac{e^h - 1}{h}}$ | ${1}$ |  | [6](module_06_ZH.html) |
| ${\lim\limits_{x\to\infty}\dfrac{1}{x^p}}$ | ${0}$ | ${p > 0}$ | [3](module_03_ZH.html) |
| ${\lim\limits_{x\to\infty}\dfrac{\ln x}{x^p}}$ | ${0}$ | ${p > 0}$ | [3](module_03_ZH.html), [7](module_07_ZH.html) |
| ${\lim\limits_{x\to\infty}\dfrac{x^p}{a^x}}$ | ${0}$ | ${p}$ 实数，${a > 1}$ | [3](module_03_ZH.html), [7](module_07_ZH.html) |
| ${\lim\limits_{n\to\infty}\dfrac{a^n}{n!}}$ | ${0}$ | ${a}$ 实数 | [3](module_03_ZH.html) |
| ${\lim\limits_{n\to\infty}\dfrac{n!}{n^n}}$ | ${0}$ |  | [3](module_03_ZH.html) |
| ${\lim\limits_{x\to0^+} x\ln x}$ | ${0}$ |  | [7](module_07_ZH.html) |

**增长速度。** 当 $f/g \to 0$ 时记作 $f \ll g$。当 $x \to \infty$，且 $p > 0$、$a > 1$ 时，
$$\ln x \ll x^p \ll a^x, \qquad\text{and for whole numbers } n\text{:}\quad a^n \ll n! \ll n^n.$$

**洛必达法则**（[模块 7](module_07_ZH.html)，[模块 8](module_08_ZH.html) 给出证明）。设 $f$ 和
$g$ 在含 $a$ 的开区间内可微，唯独在 $a$ 处可例外，且在去心区间内 $g'(x) \ne 0$。
设 $f$ 和 $g$ 均趋于 0，或两者的绝对值均趋于无穷大。若
当 $x \to a$ 时有 $\dfrac{f'(x)}{g'(x)} \to L$，其中 $L$ 可为实数或 $\pm\infty$，则
$\dfrac{f(x)}{g(x)} \to L$。求单侧极限时，只考虑 $a$ 的相应一侧。对于 $\pm\infty$，
只要求在相应方向上充分远处可微，且分母的导数非零。

```check
limit_is(sin(theta)/theta, theta, 0, 1)
# L'Hopital's rule on instances of each form: 0/0, infinity/infinity, and a limit L = infinity
for F_, G_, pt in ((sin(x), x, 0), (exp(x) - 1 - x, x**2, 0), (log(x), x, oo), (exp(x), x**2, oo)):
    same(limit(F_/G_, x, pt, '+-') if pt == 0 else limit(F_/G_, x, pt), limit(diff(F_, x)/diff(G_, x), x, pt, '+-') if pt == 0 else limit(diff(F_, x)/diff(G_, x), x, pt))
limit_is((1 - cos(theta))/theta, theta, 0, 0)
limit_is((1 + 1/n)**n, n, oo, E)
limit_is((1 + x/n)**n, n, oo, exp(x))
limit_is((exp(h) - 1)/h, h, 0, 1)
pp = symbols('p', positive=True); pr = symbols('p_r', real=True); qq = symbols('q', positive=True)
limit_is(1/x**pp, x, oo, 0)
limit_is(log(x)/x**pp, x, oo, 0)
limit_is(x**pr/(1 + qq)**x, x, oo, 0)                         # a = 1 + q > 1, any real p
limit_is(pp**n/factorial(n), n, oo, 0)                        # |a^n/n!| = |a|^n/n!, and a = 0 is immediate
limit_is(factorial(n)/n**n, n, oo, 0)
limit_is(x*log(x), x, 0, 0, '+')
limit_is(x**pp/(1 + qq)**x, x, oo, 0); limit_is((1 + qq)**n/factorial(n), n, oo, 0)   # the chain of growth rates
```

## 导数 {#derivatives}

### 定义与近似 {#derivative-definition}

| 名称 | 公式 | 模块 |
|---|---|---|
| ${a}$ 处的导数 | ${f'(a) = \lim\limits_{h \to 0} \dfrac{f(a + h) - f(a)}{h} = \lim\limits_{x \to a} \dfrac{f(x) - f(a)}{x-a},}$ 当极限存在时 | [4](module_04_ZH.html) |
| ${a}$ 处的切线 | ${y = f(a) + f'(a)(x - a),}$ 如果 ${f}$ 在 ${a}$ 处可导 | [4](module_04_ZH.html) |
| 线性近似 | ${f(x) \approx f(a) + f'(a)(x - a)}$，其中 ${x}$ 接近 ${a}$ | [7](module_07_ZH.html) |
| 微分 | ${dy = f'(x)\,dx;}$；${dx}$ 充分小时，${\Delta y \approx dy}$ | [7](module_07_ZH.html) |
| 牛顿法 | ${x_{n+1} = x_n - \dfrac{f(x_n)}{f'(x_n)},}$ 当 ${f'(x_n) \ne 0}$ | [7](module_07_ZH.html) |
| 前向差分 | ${f'(a) \approx \dfrac{f(a + h) - f(a)}{h},}$；误差约为 ${-\tfrac{h}{2}f''(a)}$ | [4](module_04_ZH.html), [15](module_15_ZH.html) |
| 中心差分 | ${f'(a) \approx \dfrac{f(a + h) - f(a - h)}{2h},}$；误差约为 ${-\tfrac{h^2}{6}f'''(a)}$ | [4](module_04_ZH.html), [15](module_15_ZH.html) |

与本系列其他地方一样，误差为精确值减去估计值，此处具体为
$f'(a)$ 减去差分。当 $h > 0$ 很小时，两个误差估计在 $f''$ （前向）或
$f'''$ （中心）在 $a$ 附近连续时成立。在浮点运算中，舍入误差的大小约为
$\varepsilon/h$ ，对于数量级为 1 的函数值，其中 $\varepsilon$ 是浮点舍入的量级。
在双精度下，步长约为 $10^{-8}$ （前向）和 $10^{-5}$ （中心）可以在该
量级上很好地工作。选择取决于函数值和导数。

```check
same(limit((x**3 - a**3)/(x - a), x, a, '+-'), 3*a**2)
same(limit(((a + h)**3 - a**3)/h, h, 0, '+-'), 3*a**2)          # the definition, for x^3
same(expand(1 + 3*(x - 1)), 3*x - 2)                           # tangent line of x^3 at 1
same(series(x**3, x, 1, 2).removeO(), 3*x - 2)                 # the same line is the linear approximation
same(diff(x**3, x).subs(x, 2)*Rational(1, 100), Rational(12, 100)); same(Rational(201, 100)**3 - 8, Rational(120601, 1000000))   # dy and Delta y
same(3 - (3**2 - 2)/(2*Integer(3)), Rational(11, 6))           # Newton for x^2 - 2 from x_0 = 3 (Module 7)
fw = ((a + h)**3 - a**3)/h; ce = ((a + h)**3 - (a - h)**3)/(2*h)
same(3*a**2 - fw, -3*a*h - h**2); same(3*a**2 - ce, -h**2)     # exact errors for x^3 (Module 4)
same(-(h/2)*diff(x**3, x, 2).subs(x, a), -3*a*h); same(-(h**2/6)*diff(x**3, x, 3), -h**2)
for F_ in (sin(x), exp(2*x), log(1 + x**2)):                   # the leading terms, for three smooth f at 1/2
    a_ = Rational(1, 2); d1 = diff(F_, x).subs(x, a_)
    same(limit((d1 - (F_.subs(x, a_ + h) - F_.subs(x, a_))/h)/h, h, 0, '+-'), -diff(F_, x, 2).subs(x, a_)/2)
    same(limit((d1 - (F_.subs(x, a_ + h) - F_.subs(x, a_ - h))/(2*h))/h**2, h, 0, '+-'), -diff(F_, x, 3).subs(x, a_)/6)
```

### 规则 {#derivative-rules}

对于和、积、商的规则，$f$ 和 $g$ 在 $x$ 处可导。
对于链式法则，$g$ 在 $x$ 处可导，$f$ 在 $g(x)$ 处可导。字母 $c$ 是常数。

| 规则 | 公式 | 模块 |
|---|---|---|
| 常数 | ${\dfrac{d}{dx}(c) = 0}$ | [4](module_04_ZH.html) |
| 常数倍 | ${\dfrac{d}{dx}\big(c\,f(x)\big) = c\,f'(x)}$ | [4](module_04_ZH.html) |
| 和与差 | ${(f \pm g)' = f' \pm g'}$ | [4](module_04_ZH.html) |
| 积 | ${(fg)' = f'g + fg'}$ | [5](module_05_ZH.html) |
| 商 | ${\Big(\dfrac{f}{g}\Big)' = \dfrac{f'g - fg'}{g^2},}$，其中 ${g(x) \ne 0}$ | [5](module_05_ZH.html) |
| 链式法则 | ${\dfrac{d}{dx}f\big(g(x)\big) = f'\big(g(x)\big)\,g'(x),}$ 或 ${\dfrac{dy}{dx} = \dfrac{dy}{du}\,\dfrac{du}{dx}}$ | [5](module_05_ZH.html) |
| 反函数 | ${(f^{-1})'(x) = \dfrac{1}{f'\big(f^{-1}(x)\big)},}$，其中 ${f'\big(f^{-1}(x)\big) \ne 0}$ | [6](module_06_ZH.html) |
| 隐函数求导 | 对于曲线 ${F(x, y) = 0}$： ${\dfrac{dy}{dx} = -\dfrac{F_x}{F_y},}$ 其中 ${F_y \ne 0}$ | [6](module_06_ZH.html), [17](module_17_ZH.html) |
| 对数求导 | ${f'(x) = f(x)\,\dfrac{d}{dx}\ln\abs{f(x)},}$，其中 ${f(x) \ne 0}$ | [6](module_06_ZH.html) |

反函数求导法则适用于 $f$ 的值域中的 $x$。要求 $f$
在某开区间内连续且为单射，并在 $f^{-1}(x)$ 处可微且导数非零。
对于隐函数求导，在曲线 $F(x,y)=0$ 上，若某点处 $F_y\ne 0$，且一阶偏导数在该点
的邻域内连续，则有局部可微分支 $y=y(x)$。沿该分支求导并解出 $y'$。

```check
f, g = Function('f'), Function('g')
same(diff(c, x), 0)
same(diff(c*f(x), x), c*diff(f(x), x))
same(diff(f(x) + g(x), x), diff(f(x), x) + diff(g(x), x)); same(diff(f(x) - g(x), x), diff(f(x), x) - diff(g(x), x))
same(diff(f(x)*g(x), x), diff(f(x), x)*g(x) + f(x)*diff(g(x), x))
same(diff(f(x)/g(x), x), (diff(f(x), x)*g(x) - f(x)*diff(g(x), x))/g(x)**2)
same(diff(f(g(x)), x), diff(f(u), u).subs(u, g(x))*diff(g(x), x))
# inverse function: if g is the inverse of f, differentiate f(g(x)) = x and solve for g'(x)
same(solve(diff(f(g(x)), x) - 1, Derivative(g(x), x))[0], 1/diff(f(u), u).subs(u, g(x)))
same(diff(atan(x), x), 1/diff(tan(u), u).subs(u, atan(x)))   # instances: f = tan, f = exp
xp = symbols('x_p', positive=True)
same(diff(log(xp), xp), 1/diff(exp(u), u).subs(u, log(xp)))
# implicit differentiation: -F_x/F_y agrees with SymPy's idiff on three curves
for curve in (x**2 + y**2 - 25, x**3 + y**3 - 6*x*y, sin(x*y) + y - x**2):
    same(idiff(curve, y, x), -diff(curve, x)/diff(curve, y))
# logarithmic differentiation: ln|f| = ln f where f > 0 and ln(-f) where f < 0
same(f(x)*diff(log(f(x)), x), diff(f(x), x)); same(f(x)*diff(log(-f(x)), x), diff(f(x), x))
same(x**x*diff(x*log(x), x), diff(x**x, x))                   # an instance: x^x = e^(x ln x)
```

### 标准函数的导数 {#derivative-table}

| ${f(x)}$ | ${f'(x)}$ | 适用条件 | 模块 |
|---|---|---|---|
| ${x^n}$ | ${nx^{n-1}}$ | ${n}$ 为实数，且 ${x > 0;}$；若 ${n}$ 为整数，可取任意 ${x \ne 0}$；若 ${n = 1, 2, 3, \ldots}$，可取任意 ${x}$ | [4](module_04_ZH.html), [5](module_05_ZH.html), [6](module_06_ZH.html) |
| ${e^x}$ | ${e^x}$ | 任意 ${x}$ | [6](module_06_ZH.html) |
| ${e^{kx}}$ | ${ke^{kx}}$ | ${k}$ 为常数 | [6](module_06_ZH.html) |
| ${a^x}$ | ${a^x\ln a}$ | ${a > 0}$ | [6](module_06_ZH.html) |
| ${\ln x}$ | ${\dfrac{1}{x}}$ | ${x > 0}$ | [6](module_06_ZH.html) |
| ${\ln\abs{x}}$ | ${\dfrac{1}{x}}$ | ${x \ne 0}$ | [6](module_06_ZH.html) |
| ${\log_a x}$ | ${\dfrac{1}{x\ln a}}$ | ${a > 0,}$ ${a \ne 1,}$ ${x > 0}$ | [6](module_06_ZH.html) |

模块 4 证明了正整数幂的求导法则，模块 5 将其扩展到负整数幂，
模块 6 将其推广到定义域 $x>0$ 上的实指数幂。

```check
nr = symbols('n_r', real=True)
same(diff(xp**nr, xp), nr*xp**(nr - 1))
nz = symbols('n_z', integer=True); xq = symbols('x_q', real=True, nonzero=True)
same(diff(xq**nz, xq), nz*xq**(nz - 1))
for N_ in range(-4, 6):
    same(diff(x**N_, x), N_*x**(N_ - 1))
for N_ in range(1, 6):                                        # positive integers: at x = 0 too, from the definition
    same(limit(((0 + h)**N_ - 0**N_)/h, h, 0, '+-'), N_*Integer(0)**(N_ - 1))
same(diff(exp(x), x), exp(x)); same(diff(exp(k*x), x), k*exp(k*x))
ap = symbols('a_p', positive=True)
same(diff(ap**x, x), ap**x*log(ap))
same(diff(log(xp), xp), 1/xp)
xn = symbols('x_n', negative=True)
same(diff(log(Abs(xp)), xp), 1/xp); same(diff(log(Abs(xn)), xn), 1/xn)
same(diff(log(xp, ap), xp), 1/(xp*log(ap)))
```

**三角函数** （[模块 5](module_05_ZH.html)）：

| ${f(x)}$ | ${f'(x)}$ | 适用条件 |
|---|---|---|
| ${\sin x}$ | ${\cos x}$ | 任意 ${x}$ |
| ${\cos x}$ | ${-\sin x}$ | 任意 ${x}$ |
| ${\tan x}$ | ${\sec^2 x}$ | ${\cos x \ne 0}$ |
| ${\cot x}$ | ${-\csc^2 x}$ | ${\sin x \ne 0}$ |
| ${\sec x}$ | ${\sec x\tan x}$ | ${\cos x \ne 0}$ |
| ${\csc x}$ | ${-\csc x\cot x}$ | ${\sin x \ne 0}$ |

这些需要 $x$ 以弧度为单位：以度数为单位时， $\dfrac{d}{dx}\sin x^\circ = \dfrac{\pi}{180}\cos x^\circ$

```check
same(diff(sin(x), x), cos(x)); same(diff(cos(x), x), -sin(x))
same(diff(tan(x), x), sec(x)**2); same(diff(cot(x), x), -csc(x)**2)
same(diff(sec(x), x), sec(x)*tan(x)); same(diff(csc(x), x), -csc(x)*cot(x))
same(diff(sin(pi*x/180), x), pi/180*cos(pi*x/180))           # sin of x degrees
```

**反三角函数** （[模块 6](module_06_ZH.html)）：

| ${f(x)}$ | ${f'(x)}$ | 适用条件 | 值域在 |
|---|---|---|---|
| ${\arcsin x}$ | ${\dfrac{1}{\sqrt{1 - x^2}}}$ | ${-1 < x < 1}$ | ${[-\pi/2, \pi/2]}$ |
| ${\arccos x}$ | ${-\dfrac{1}{\sqrt{1 - x^2}}}$ | ${-1 < x < 1}$ | ${[0, \pi]}$ |
| ${\arctan x}$ | ${\dfrac{1}{1 + x^2}}$ | 任意 ${x}$ | ${(-\pi/2, \pi/2)}$ |
| ${\arcsec x}$ | ${\dfrac{1}{\abs{x}\sqrt{x^2 - 1}}}$ | ${\abs{x} > 1}$ | ${[0, \pi/2) \cup (\pi/2, \pi]}$ |

本系列对 $\abs{x}\ge 1$ 取值域 $\arcsec x = \arccos(1/x)$。下面的求导公式不适用于
端点。有些其他分支会使 $x < -1$ 的求导公式变号。

```check
same(diff(asin(x), x), 1/sqrt(1 - x**2)); same(diff(acos(x), x), -1/sqrt(1 - x**2)); same(diff(atan(x), x), 1/(1 + x**2))
same(asin(-1), -pi/2); same(asin(1), pi/2); same(acos(1), 0); same(acos(-1), pi)
limit_is(atan(x), x, oo, pi/2); limit_is(atan(x), x, -oo, -pi/2)
for v_ in (Rational(-9, 10), Rational(-1, 2), 0, Rational(3, 10), 1):   # arcsin and arccos invert sin and cos
    same(sin(asin(v_)), v_); same(cos(acos(v_)), v_)
# arcsec x = arccos(1/x) (the series' range), with slope 1/(|x| sqrt(x^2 - 1)) on both pieces
for v_ in (Integer(2), Integer(-2), Rational(5, 4), Integer(-3)):
    same(asec(v_).rewrite(acos), acos(1/v_)); same(diff(acos(1/x), x).subs(x, v_), 1/(Abs(v_)*sqrt(v_**2 - 1)))
xa = symbols('x_a', positive=True)                             # x = 1 + x_a > 1 and x = -1 - x_a < -1
same(diff(acos(1/x), x).subs(x, 1 + xa), 1/((1 + xa)*sqrt((1 + xa)**2 - 1)))
same(diff(acos(1/x), x).subs(x, -1 - xa), 1/((1 + xa)*sqrt((1 + xa)**2 - 1)))
```

**双曲函数** （[模块 6](module_06_ZH.html)）：
$$\sinh x = \frac{e^x - e^{-x}}{2}, \qquad \cosh x = \frac{e^x + e^{-x}}{2}, \qquad \cosh^2 x - \sinh^2 x = 1,$$
用 $\tanh x = \dfrac{\sinh x}{\cosh x}$ 和 $\sech x = \dfrac{1}{\cosh x}$ 表示；对于 $x \ne 0$，也
$\coth x = \dfrac{\cosh x}{\sinh x}$ 与 $\csch x = \dfrac{1}{\sinh x}$。

| ${f(x)}$ | ${f'(x)}$ | 适用条件 |
|---|---|---|
| ${\sinh x}$ | ${\cosh x}$ | 任意 ${x}$ |
| ${\cosh x}$ | ${\sinh x}$ | 任意 ${x}$ |
| ${\tanh x}$ | ${\sech^2 x}$ | 任意 ${x}$ |
| ${\coth x}$ | ${-\csch^2 x}$ | ${x \ne 0}$ |
| ${\sech x}$ | ${-\sech x\tanh x}$ | 任意 ${x}$ |
| ${\csch x}$ | ${-\csch x\coth x}$ | ${x \ne 0}$ |

```check
same(sinh(x), (exp(x) - exp(-x))/2); same(cosh(x), (exp(x) + exp(-x))/2)
same(tanh(x), sinh(x)/cosh(x)); same(coth(x), cosh(x)/sinh(x)); same(sech(x), 1/cosh(x)); same(csch(x), 1/sinh(x))
same(cosh(x)**2 - sinh(x)**2, 1)
same(diff(sinh(x), x), cosh(x)); same(diff(cosh(x), x), sinh(x))
same(diff(tanh(x), x), sech(x)**2); same(diff(coth(x), x), -csch(x)**2)
same(diff(sech(x), x), -sech(x)*tanh(x)); same(diff(csch(x), x), -csch(x)*coth(x))
same(diff((exp(x) - exp(-x))/(exp(x) + exp(-x)), x), 4/(exp(x) + exp(-x))**2)   # tanh' from the definitions
```

## 积分 {#integrals}

### 定积分的性质 {#integral-properties}

[模块 9](module_09_ZH.html#definite-integral) 定义了有界函数 $f$ 在
$[a,b]$ 上的积分，其中 $a<b$。分割 $P$ 的分点为 $a=x_0<\dots<x_n=b$，各小区间的宽度为 $\Delta x_i=x_i-x_{i-1}$，
最大宽度为 $\norm{P}$。以下性质假设函数在
涉及的区间上均可积。$k$ 为常数。

| 性质 | 公式 | 适用条件 |
|---|---|---|
| 定义 | ${\displaystyle\int_a^b f(x)\,dx = \lim_{\norm{P}\to 0}\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i}$ | 所有分划和 ${x_i^*\in[x_{i-1},x_i]}$ 的选择都有相同的极限 |
| 相同的宽度 | ${\displaystyle\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{i=1}^{n} f(x_i^*)\,\Delta x}$ | ${f}$ 可积，${\Delta x=(b-a)/n}$，采样点任取 |
| 和 | ${\displaystyle\int_a^b \big(f(x) + g(x)\big)\,dx = \int_a^b f(x)\,dx + \int_a^b g(x)\,dx}$ |  |
| 常数倍 | ${\displaystyle\int_a^b k\,f(x)\,dx = k\int_a^b f(x)\,dx}$ |  |
| 交换积分上下限 | ${\displaystyle\int_b^a f(x)\,dx = -\int_a^b f(x)\,dx,}$ ${\ \displaystyle\int_a^a f(x)\,dx = 0}$ |  |
| 相邻区间 | ${\displaystyle\int_a^b f(x)\,dx + \int_b^c f(x)\,dx = \int_a^c f(x)\,dx}$ | ${a,}$ ${b,}$ ${c}$ 以任何顺序排列 |
| 比较 | ${\displaystyle\int_a^b f(x)\,dx \le \int_a^b g(x)\,dx}$ | ${f(x) \le g(x)}$ 在 ${[a, b],}$ 和 ${a \le b}$ 上 |
| 上下界 | ${m(b - a) \le \displaystyle\int_a^b f(x)\,dx \le M(b - a)}$ | ${m \le f(x) \le M}$ 在 ${[a, b],}$ 和 ${a \le b}$ 上 |
| 绝对值 | ${\abs{\displaystyle\int_a^b f(x)\,dx} \le \displaystyle\int_a^b \abs{f(x)}\,dx}$ | ${a \le b}$ |
| 偶函数 | ${\displaystyle\int_{-a}^{a} f(x)\,dx = 2\int_0^a f(x)\,dx}$ | ${f(-x) = f(x)}$ |
| 奇函数 | ${\displaystyle\int_{-a}^{a} f(x)\,dx = 0}$ | ${f(-x) = -f(x)}$ |
| 积分中值定理 | ${\displaystyle\int_a^b f(x)\,dx = f(c)\,(b - a)}$ 对某个 ${c}$ 在 ${[a, b]}$ 中成立 | ${f}$ 在 ${[a, b]}$ 上连续 |

**求和公式**（模块 9），其中 $n = 1, 2, 3, \ldots$：
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}, \qquad \sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}, \qquad \sum_{i=1}^{n} i^3 = \Big(\frac{n(n+1)}{2}\Big)^2.$$

```check
f, g = Function('f'), Function('g')
ii = symbols('i', integer=True, positive=True); nn = symbols('n', integer=True, positive=True)
# Definition with unequal widths on [0, b], using x_i = b(i/n)^2 for b > 0.
x_part = b*(ii/nn)**2
dx_part = x_part - x_part.subs(ii, ii - 1)
same(dx_part, b*(2*ii - 1)/nn**2)
limit_is(dx_part.subs(ii, nn), nn, oo, 0)  # the largest width
for tag in (x_part, x_part.subs(ii, ii - 1)):
    limit_is(summation(expand(tag**2*dx_part), (ii, 1, nn)), nn, oo, b**3/3)
# Equal widths: right, left and midpoint sums of x^2 on [0, b].
for shift in (0, 1, Rational(1, 2)):
    limit_is(summation((b*(ii - shift)/nn)**2*(b/nn), (ii, 1, nn)), nn, oo, b**3/3)
same(integrate(x**2, (x, 0, b)), b**3/3)
same(Integral(f(x) + g(x), (x, a, b)), Integral(f(x), (x, a, b)) + Integral(g(x), (x, a, b)))
same(Integral(k*f(x), (x, a, b)), k*Integral(f(x), (x, a, b)))
for F1 in (x**2*exp(x), cos(x)**3, 1/(1 + x**2)):              # reversed limits, adjacent intervals
    same(integrate(F1, (x, b, a)), -integrate(F1, (x, a, b))); same(integrate(F1, (x, a, a)), 0)
    same(integrate(F1, (x, a, b)) + integrate(F1, (x, b, c)), integrate(F1, (x, a, c)))
holds(integrate(sin(x), (x, 0, pi)) <= integrate(1, (x, 0, pi)))  # sin x <= 1 on [0, pi]
I1 = integrate(exp(-x**2), (x, 0, 1))                          # e^(-1) <= e^(-x^2) <= 1 on [0, 1]
holds(exp(-1)*(1 - 0) <= I1); holds(I1 <= 1*(1 - 0))
same(integrate(Abs(sin(x)), (x, 0, 2*pi)), 4); holds(Abs(integrate(sin(x), (x, 0, 2*pi))) <= 4)
ap = symbols('a_p', positive=True)
same(integrate(x**4*cos(x), (x, -ap, ap)), 2*integrate(x**4*cos(x), (x, 0, ap)))   # even
same(integrate(x**3*cos(x), (x, -ap, ap)), 0); same(integrate(sin(x)**5, (x, -ap, ap)), 0)   # odd
same(integrate(x**2, (x, 0, 3)), sqrt(3)**2*(3 - 0)); holds(0 <= sqrt(3)); holds(sqrt(3) <= 3)   # c = sqrt(3)
same(summation(ii, (ii, 1, nn)), nn*(nn + 1)/2)
same(summation(ii**2, (ii, 1, nn)), nn*(nn + 1)*(2*nn + 1)/6)
same(summation(ii**3, (ii, 1, nn)), (nn*(nn + 1)/2)**2)
```

### 微积分基本定理 {#fundamental-theorem}

[模块 10](module_10_ZH.html) 证明了两部分。

| 公式 | 公式 | 适用条件 |
|---|---|---|
| 第一部分 | ${\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt = f(x)}$ | ${f}$ 在 ${[a, b],}$ 上连续，且 ${x}$ 在 ${(a, b)}$ 中取值 |
| 使用链式法则的第一部分 | ${\dfrac{d}{dx}\displaystyle\int_a^{u(x)} f(t)\,dt = f\big(u(x)\big)\,u'(x)}$ | ${f}$ 在某个区间上连续，该区间含 ${a}$ 及可微函数 ${u}$ 的取值，且 ${u(x)}$ 在该区间的内部 |
| 变下限 | ${\dfrac{d}{dx}\displaystyle\int_x^b f(t)\,dt = -f(x)}$ | ${f}$ 在 ${[a,b]}$ 上连续， ${x}$ 在 ${(a,b)}$ |
| 第2部分 | ${\displaystyle\int_a^b f(x)\,dx = F(b) - F(a) = \big[F(x)\big]_a^b}$ | ${f}$ 在 ${[a, b]}$ 上连续，且在该区间上有 ${F' = f}$ |
| 总变化量 | ${\displaystyle\int_a^b F'(x)\,dx = F(b) - F(a)}$ | ${F'}$ 在 ${[a, b]}$ 上连续 |
| 不定积分 | ${\displaystyle\int f(x)\,dx = F(x) + C}$ | 意味着 ${F'(x) = f(x)}$ 在一个区间上 |

```check
F = Function('F'); uf = Function('u_f')
same(diff(Integral(f(t), (t, a, x)), x), f(x))
same(diff(Integral(f(t), (t, a, uf(x))), x), f(uf(x))*diff(uf(x), x))
same(diff(Integral(f(t), (t, x, b)), x), -f(x))
same(integrate(diff(F(x), x), (x, a, b)), F(b) - F(a))
same(diff(integrate(cos(t)*exp(t), (t, 0, x)), x), cos(x)*exp(x))     # Part 1 on an instance
same(diff(Integral(sqrt(1 + t**4), (t, 0, x**2)), x), sqrt(1 + x**8)*2*x)
same(integrate(cos(x), (x, a, b)), sin(b) - sin(a))                   # Part 2 on an instance
```

### 方法 {#integration-techniques}

| 方法 | 公式 | 模块 |
|---|---|---|
| 换元法 | ${\displaystyle\int f\big(g(x)\big)\,g'(x)\,dx = \int f(u)\,du,}$；代入 ${u = g(x)}$，再把结果写回变量 ${x}$ | [10](module_10_ZH.html) |
| 定积分换元法 | ${\displaystyle\int_a^b f\big(g(x)\big)\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du}$ | [10](module_10_ZH.html) |
| 分部积分法 | ${\displaystyle\int u\,dv = uv - \int v\,du}$ | [11](module_11_ZH.html) |
| 分部积分法，定积分 | ${\displaystyle\int_a^b f(x)\,g'(x)\,dx = \big[f(x)\,g(x)\big]_a^b - \int_a^b f'(x)\,g(x)\,dx}$ | [11](module_11_ZH.html) |
| 降阶公式 | ${\displaystyle\int \sin^n x\,dx = -\frac{\sin^{n-1}x\cos x}{n} + \frac{n-1}{n}\int \sin^{n-2}x\,dx,}$；${\ n}$ 为整数且满足 ${n \ge 2}$ | [11](module_11_ZH.html) |
| 部分分式分解 | ${\dfrac{1}{(x - p)(x - q)} = \dfrac{1}{p - q}\Big(\dfrac{1}{x - p} - \dfrac{1}{x - q}\Big),}$ ${\ p \ne q}$, ${x\ne p,q}$ | [11](module_11_ZH.html) |

对于定积分的换元法，要求 $g'$ 在 $[a,b]$ 上连续，并且 $f$ 在一个区间上连续，
该区间包含 $g$ 的值域。定积分的分部积分法要求 $f'$ 和 $g'$ 在 $[a,b]$ 上连续。
对于不定积分的换元法，只要 $f$ 的原函数可微，且
其可微点为 $g(x)$，同时 $g$ 在 $x$ 可微，就可以应用链式法则。

```check
# substitution: if F' = f, then F(g(x)) is an antiderivative of f(g(x)) g'(x) (the chain rule)
antideriv(F(g(x)), diff(F(u), u).subs(u, g(x))*diff(g(x), x), x)
same(integrate(cos(x**2)*2*x, (x, 0, 2)), integrate(cos(u), (u, 0, 4)))      # u = x^2
same(integrate(sin(x)**3*cos(x), (x, 0, pi/2)), integrate(u**3, (u, 0, 1)))  # u = sin x
# by parts: the integrands agree (the product rule), then instances
same(f(x)*diff(g(x), x), diff(f(x)*g(x), x) - diff(f(x), x)*g(x))
same(integrate(x*exp(x), (x, 0, 1)), (1*exp(1) - 0) - integrate(exp(x), (x, 0, 1)))
xp = symbols('x_p', positive=True)
steps(Integral(log(xp), xp), xp*log(xp) - Integral(xp*(1/xp), xp), xp*log(xp) - xp)
for N_ in range(2, 9):                                         # the reduction formula, n = 2..8
    same(diff(-sin(x)**(N_ - 1)*cos(x)/N_, x) + Rational(N_ - 1, N_)*sin(x)**(N_ - 2), sin(x)**N_)
pq, qq = symbols('p q')
same(1/((x - pq)*(x - qq)), (1/(pq - qq))*(1/(x - pq) - 1/(x - qq)))
```

### 原函数 {#antiderivatives}

$C$ 是任意常数。如果定义域由多个区间组成（例如 $x \ne 0$ 是
$1/x$ 的定义域），不同区间的常数可以不同。

| ${f(x)}$ | ${\displaystyle\int f(x)\,dx}$ | 适用条件 | 模块 |
|---|---|---|---|
| ${x^n}$ | ${\dfrac{x^{n+1}}{n + 1} + C}$ | ${n \ne -1}$。实数 ${n}$ 的一般情形取 ${x>0}$；当 ${n=0,1,2,\ldots}$ 时可取任意实数 ${x}$；负整数 ${n}$ 的情形取 ${x\ne 0}$。 | [10](module_10_ZH.html) |
| ${\dfrac{1}{x}}$ | ${\ln\abs{x} + C}$ | ${x \ne 0}$ | [10](module_10_ZH.html) |
| ${e^x}$ | ${e^x + C}$ |  | [10](module_10_ZH.html) |
| ${e^{kx}}$ | ${\dfrac{1}{k}e^{kx} + C}$ | ${k \ne 0}$ | [10](module_10_ZH.html) |
| ${a^x}$ | ${\dfrac{a^x}{\ln a} + C}$ | ${a > 0,}$ ${a \ne 1}$ | [10](module_10_ZH.html) |
| ${\sin x}$ | ${-\cos x + C}$ |  | [10](module_10_ZH.html) |
| ${\cos x}$ | ${\sin x + C}$ |  | [10](module_10_ZH.html) |
| ${\sec^2 x}$ | ${\tan x + C}$ | ${\cos x \ne 0}$ | [10](module_10_ZH.html) |
| ${\csc^2 x}$ | ${-\cot x + C}$ | ${\sin x \ne 0}$ | [10](module_10_ZH.html) |
| ${\sec x\tan x}$ | ${\sec x + C}$ | ${\cos x \ne 0}$ | [10](module_10_ZH.html) |
| ${\csc x\cot x}$ | ${-\csc x + C}$ | ${\sin x \ne 0}$ | [10](module_10_ZH.html) |
| ${\tan x}$ | ${\ln\abs{\sec x} + C}$ | ${\cos x \ne 0}$ | [10](module_10_ZH.html) |
| ${\cot x}$ | ${\ln\abs{\sin x} + C}$ | ${\sin x \ne 0}$ | 对数求导法见[模块 6](module_06_ZH.html#log-differentiation) |
| ${\sec x}$ | ${\ln\abs{\sec x + \tan x} + C}$ | ${\cos x \ne 0}$ | [11](module_11_ZH.html) |
| ${\csc x}$ | ${\ln\abs{\csc x - \cot x} + C}$ | ${\sin x \ne 0}$ | [11](module_11_ZH.html) |
| ${\sin^2 x}$ | ${\dfrac{x}{2} - \dfrac{\sin 2x}{4} + C}$ |  | [11](module_11_ZH.html) |
| ${\cos^2 x}$ | ${\dfrac{x}{2} + \dfrac{\sin 2x}{4} + C}$ |  | [11](module_11_ZH.html) |
| ${\ln x}$ | ${x\ln x - x + C}$ | ${x > 0}$ | [11](module_11_ZH.html) |
| ${\dfrac{1}{a^2 + x^2}}$ | ${\dfrac{1}{a}\arctan\dfrac{x}{a} + C}$ | ${a \ne 0}$ | [10](module_10_ZH.html), [11](module_11_ZH.html) |
| ${\dfrac{1}{\sqrt{a^2 - x^2}}}$ | ${\arcsin\dfrac{x}{a} + C}$ | ${a > 0,}$ ${\abs{x} < a}$ | [10](module_10_ZH.html), [11](module_11_ZH.html) |
| ${\dfrac{1}{x^2 - a^2}}$ | ${\dfrac{1}{2a}\ln\abs{\dfrac{x - a}{x + a}} + C}$ | ${a \ne 0,}$ ${x \ne \pm a}$ | [11](module_11_ZH.html) |
| ${\dfrac{1}{\sqrt{x^2 + a^2}}}$ | ${\ln\big(x + \sqrt{x^2 + a^2}\big) + C}$ | ${a \ne 0}$ | [11](module_11_ZH.html) |
| ${\sinh x}$ | ${\cosh x + C}$ |  | [10](module_10_ZH.html) |
| ${\cosh x}$ | ${\sinh x + C}$ |  | [10](module_10_ZH.html) |

```check
def ln_abs_antideriv(G, f_, var, factor=1):
    """factor*ln|G| is an antiderivative of f_ where G > 0 (ln G) and where G < 0 (ln(-G))."""
    antideriv(factor*log(G), f_, var); antideriv(factor*log(-G), f_, var)
nr = symbols('n_r', real=True)
antideriv(xp**(nr + 1)/(nr + 1), xp**nr, xp)
for N_ in (-5, -3, -2, 0, 1, 2, 7):
    antideriv(x**(N_ + 1)/(N_ + 1), x**N_, x)
ln_abs_antideriv(x, 1/x, x)
antideriv(exp(x), exp(x), x)
knz = symbols('k_nz', nonzero=True); antideriv(exp(knz*x)/knz, exp(knz*x), x)
antideriv(ap**x/log(ap), ap**x, x)
antideriv(-cos(x), sin(x), x); antideriv(sin(x), cos(x), x)
antideriv(tan(x), sec(x)**2, x); antideriv(-cot(x), csc(x)**2, x)
antideriv(sec(x), sec(x)*tan(x), x); antideriv(-csc(x), csc(x)*cot(x), x)
ln_abs_antideriv(sec(x), tan(x), x); ln_abs_antideriv(sin(x), cot(x), x)
ln_abs_antideriv(sec(x) + tan(x), sec(x), x); ln_abs_antideriv(csc(x) - cot(x), csc(x), x)
antideriv(x/2 - sin(2*x)/4, sin(x)**2, x); antideriv(x/2 + sin(2*x)/4, cos(x)**2, x)
antideriv(xp*log(xp) - xp, log(xp), xp)
anz = symbols('a_nz', real=True, nonzero=True)
antideriv(atan(x/anz)/anz, 1/(anz**2 + x**2), x)
antideriv(asin(x/ap), 1/sqrt(ap**2 - x**2), x)
ln_abs_antideriv((x - anz)/(x + anz), 1/(x**2 - anz**2), x, factor=1/(2*anz))
antideriv(log(x + sqrt(x**2 + anz**2)), 1/sqrt(x**2 + anz**2), x)
xr = symbols('x_r', real=True)                               # sqrt(x^2 + a^2) > |x|, so x + sqrt(x^2 + a^2) > 0:
same(sqrt(xr**2 + anz**2)**2 - Abs(xr)**2, anz**2); holds(anz**2 > 0)   # both are >= 0 and their squares differ by a^2 > 0
antideriv(cosh(x), sinh(x), x); antideriv(sinh(x), cosh(x), x)
```

### 三角换元 {#trig-substitution}

这些方法见[模块 11](module_11_ZH.html)。每行都有 $a > 0$。化简根式时，$\theta$ 的取值范围决定绝对值
内的符号。只能使用使原被积函数有定义的点。

| 被积函数包含 | 代入 | 然后 |
|---|---|---|
| ${\sqrt{a^2 - x^2}}$ | ${x = a\sin\theta,}$ ${\ -\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}}$ | ${\sqrt{a^2 - x^2} = a\cos\theta,}$ ${\ dx = a\cos\theta\,d\theta}$ |
| ${\sqrt{a^2 + x^2}}$ | ${x = a\tan\theta,}$ ${\ -\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}}$ | ${\sqrt{a^2 + x^2} = a\sec\theta,}$ ${\ dx = a\sec^2\theta\,d\theta}$ |
| ${\sqrt{x^2 - a^2}}$ | ${x = a\sec\theta,}$ ${\ 0 \le \theta < \tfrac{\pi}{2}}$ (对于 ${x \ge a}$) | ${\sqrt{x^2 - a^2} = a\tan\theta,}$ ${\ dx = a\sec\theta\tan\theta\,d\theta}$ |
| ${\sqrt{x^2 - a^2}}$ | ${x = a\sec\theta,}$ ${\ \tfrac{\pi}{2} < \theta \le \pi}$ (对于 ${x \le -a}$) | ${\sqrt{x^2 - a^2} = -a\tan\theta,}$ ${\ dx = a\sec\theta\tan\theta\,d\theta}$ |

```check
same(ap**2 - (ap*sin(theta))**2, (ap*cos(theta))**2); same(diff(ap*sin(theta), theta), ap*cos(theta))
same(ap**2 + (ap*tan(theta))**2, (ap*sec(theta))**2); same(diff(ap*tan(theta), theta), ap*sec(theta)**2)
same((ap*sec(theta))**2 - ap**2, (ap*tan(theta))**2); same(diff(ap*sec(theta), theta), ap*sec(theta)*tan(theta))
# no sign in the square roots: a cos, a sec and a tan are >= 0 on the ranges (sampled across each range)
for th_ in (-pi/2, -1, 0, Rational(1, 2), pi/2):
    holds(cos(th_) >= 0); same(sqrt(9 - (3*sin(th_))**2), 3*cos(th_))
for th_ in (Rational(-3, 2), -1, 0, 1, Rational(3, 2), Rational(157, 100)):
    holds(sec(th_) > 0)
for th_ in (0, Rational(1, 2), 1, Rational(3, 2), Rational(157, 100)):
    holds(tan(th_) >= 0)
# The negative secant branch uses -a*tan(theta) on (pi/2, pi].
same((ap*sec(pi))**2 - ap**2, 0)
for th_ in (2*pi/3, 3*pi/4, 5*pi/6, pi):
    holds(sec(th_) <= -1); holds(tan(th_) <= 0)
    same(sqrt((ap*sec(th_))**2 - ap**2), -ap*tan(th_))
    holds(ap*sec(th_)*tan(th_) >= 0)
# An instance: the quarter disc, with x = a sin(theta).
same(integrate(ap*cos(theta)*ap*cos(theta), (theta, 0, pi/2)), integrate(sqrt(ap**2 - x**2), (x, 0, ap)))
same(integrate(sqrt(ap**2 - x**2), (x, 0, ap)), pi*ap**2/4)
```

### 数值积分 {#numerical-integration}

这些公式见[模块 11](module_11_ZH.html)。设 $f$ 在 $[a,b]$ 上连续，且 $a<b$。
将 $[a,b]$ 分成 $n\ge 1$ 个等宽的子区间，宽度为
$\Delta x = (b - a)/n$，端点为 $x_i = a + i\,\Delta x$，中点为
$\bar{x}_i = \tfrac12(x_{i-1} + x_i)$.
$$M_n = \Delta x\,\big[f(\bar{x}_1) + f(\bar{x}_2) + \cdots + f(\bar{x}_n)\big]$$
$$T_n = \frac{\Delta x}{2}\big[f(x_0) + 2f(x_1) + 2f(x_2) + \cdots + 2f(x_{n-1}) + f(x_n)\big]$$
$$S_n = \frac{\Delta x}{3}\big[f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + \cdots + 2f(x_{n-2}) + 4f(x_{n-1}) + f(x_n)\big], \quad n \text{ even}$$

误差 $E$ 是积分值减去近似值。对于误差界，假设所指的
导数在 $[a,b]$ 上连续。

| 规则 | 误差界 | 精确成立的情形 |
|---|---|---|
| 中点法 ${M_n}$ | ${\abs{E_M} \le \dfrac{K(b - a)^3}{24n^2},}$，其中在 ${[a, b]}$ 上有 ${\abs{f''(x)} \le K}$ | 次数为 ${\le 1}$ 的多项式 |
| 梯形法则 ${T_n}$ | ${\abs{E_T} \le \dfrac{K(b - a)^3}{12n^2},}$，其中在 ${[a, b]}$ 上有 ${\abs{f''(x)} \le K}$ | 次数为 ${\le 1}$ 的多项式 |
| 辛普森法则 ${S_n}$ | ${\abs{E_S} \le \dfrac{K(b - a)^5}{180n^4},}$，其中在 ${[a, b]}$ 上有 ${\abs{f^{(4)}(x)} \le K}$ | 次数为 ${\le 3}$ 的多项式 |

这些界限无法改进：对于 $f(x) = x^2$，中点法和梯形法则的误差在绝对值上达到其界限。
辛普森法则用于 $f(x)=x^4$ 时，误差的绝对值也达到相应上界。

```check
def M_(f_, a_, b_, n_):
    d_ = (b_ - a_)/n_; return d_*sum(f_(a_ + (i_ - Rational(1, 2))*d_) for i_ in range(1, n_ + 1))
def T_(f_, a_, b_, n_):
    d_ = (b_ - a_)/n_; return d_/2*(f_(a_) + 2*sum(f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_))
def S_(f_, a_, b_, n_):
    d_ = (b_ - a_)/n_; return d_/3*(f_(a_) + sum((4 if i_ % 2 else 2)*f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_))
# f = x^2 (f'' = 2 = K), any n: E_M equals its bound, and -E_T equals its bound
dn = (b - a)/nn
Mn = dn*summation((a + (ii - Rational(1, 2))*dn)**2, (ii, 1, nn))
Tn = dn/2*(a**2 + 2*summation((a + ii*dn)**2, (ii, 1, nn - 1)) + b**2)
same(integrate(x**2, (x, a, b)) - Mn, 2*(b - a)**3/(24*nn**2))
same(Tn - integrate(x**2, (x, a, b)), 2*(b - a)**3/(12*nn**2))
same(M_(lambda s: s**2, a, b, 5), Mn.subs(nn, 5)); same(T_(lambda s: s**2, a, b, 5), Tn.subs(nn, 5))
# f = x^4 (f'''' = 24 = K), n = 2m: the absolute value of Simpson's error attains the bound
mm = symbols('m', integer=True, positive=True); d2 = (b - a)/(2*mm)
S2m = d2/3*summation((a + (2*ii - 2)*d2)**4 + 4*(a + (2*ii - 1)*d2)**4 + (a + 2*ii*d2)**4, (ii, 1, mm))
same(S2m - integrate(x**4, (x, a, b)), 24*(b - a)**5/(180*(2*mm)**4))
same(S_(lambda s: s**4, a, b, 6), S2m.subs(mm, 3))
# exact for degree <= 1 (midpoint, trapezoidal) and degree <= 3 (Simpson)
c0, c1, c2, c3 = symbols('c0:4')
lin = lambda s: c0 + c1*s; cub = lambda s: c0 + c1*s + c2*s**2 + c3*s**3
for n_ in (1, 2, 3):
    same(M_(lin, a, b, n_), integrate(lin(x), (x, a, b))); same(T_(lin, a, b, n_), integrate(lin(x), (x, a, b)))
for n_ in (2, 4):
    same(S_(cub, a, b, n_), integrate(cub(x), (x, a, b)))
# the bounds hold for f = e^x on [0, 1] (K = e for f'' and f'''') and f = sin x on [0, pi] (K = 1)
for n_ in (2, 4, 10):
    holds(Abs(E - 1 - M_(exp, 0, 1, n_)) <= E/(24*n_**2)); holds(Abs(E - 1 - T_(exp, 0, 1, n_)) <= E/(12*n_**2))
    holds(Abs(E - 1 - S_(exp, 0, 1, n_)) <= E/(180*n_**4))
    holds(Abs(2 - M_(sin, 0, pi, n_)) <= pi**3/(24*n_**2)); holds(Abs(2 - S_(sin, 0, pi, n_)) <= pi**5/(180*n_**4))
```

### 反常积分 {#improper-integrals}

这些内容见[模块 12](module_12_ZH.html)。反常积分**收敛**，是指
定义它的极限存在且有限，例如：
$$\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx, \qquad \int_a^b f(x)\,dx = \lim_{t\to b^-}\int_a^t f(x)\,dx \ \text{ if } f \text{ is unbounded near } b,$$
其中每个截断积分都必须是正常定积分。奇点位于左端点时，取相应的单侧极限。
若奇点位于区间内部，则在该点拆分，并要求两侧的反常积分都收敛。
同时， $\int_{-\infty}^{\infty} f(x)\,dx = \int_{-\infty}^{c} f(x)\,dx + \int_{c}^{\infty} f(x)\,dx$ 当右侧两个
积分均收敛时。（两者都需要： $\int_{-t}^{t} x\,dx = 0$ 对于每一个 $t$，然而
$\int_{-\infty}^{\infty} x\,dx$ 发散。）

| 积分 | 值 | 适用条件 |
|---|---|---|
| ${\displaystyle\int_1^\infty \frac{dx}{x^p}}$ | ${\dfrac{1}{p - 1}}$ | ${p > 1;}$ 在 ${p \le 1}$ 处发散 |
| ${\displaystyle\int_0^1 \frac{dx}{x^p}}$ | ${\dfrac{1}{1 - p}}$ | ${p < 1;}$ 在 ${p \ge 1}$ 处发散 |
| ${\displaystyle\int_0^\infty e^{-ax}\,dx}$ | ${\dfrac{1}{a}}$ | ${a > 0}$ |
| ${\displaystyle\int_{-\infty}^{\infty} \frac{dx}{1 + x^2}}$ | ${\pi}$ |  |
| ${\displaystyle\int_{-\infty}^{\infty} e^{-x^2}\,dx}$ | ${\sqrt{\pi}}$ | 引用自模块 12，证明见 [模块 19](module_19_ZH.html#gaussian) |

**比较法。** 设 $f$、$g$ 在 $[a,\infty)$ 上连续，且在该区间满足 $0 \le f(x) \le g(x)$。反常积分 $\int_a^\infty f(x)\,dx$ 在
$\int_a^\infty g(x)\,dx$ 收敛时收敛；反常积分 $\int_a^\infty g(x)\,dx$ 在 $\int_a^\infty f(x)\,dx$
发散时发散。

```check
qp = symbols('q', positive=True)                               # p = 1 + q > 1, p = 1 - q < 1
same(integrate(x**(-(1 + qp)), (x, 1, oo)), 1/qp); same(1/qp, 1/((1 + qp) - 1))
same(integrate(x**(-(1 - qp)), (x, 1, oo)), oo); same(integrate(1/x, (x, 1, oo)), oo)
same(integrate(x**(-(1 - qp)), (x, 0, 1)), 1/qp); same(1/qp, 1/(1 - (1 - qp)))
same(integrate(x**(-(1 + qp)), (x, 0, 1)), oo); same(integrate(1/x, (x, 0, 1)), oo)
tt = symbols('t', positive=True)
limit_is(integrate(1/x**2, (x, 1, tt)), tt, oo, 1); limit_is(integrate(1/sqrt(x), (x, tt, 1)), tt, 0, 2, '+')
same(integrate(x, (x, -tt, tt)), 0); same(integrate(x, (x, 0, oo)), oo)
same(integrate(exp(-ap*x), (x, 0, oo)), 1/ap)
same(integrate(1/(1 + x**2), (x, -oo, oo)), pi)
same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi))
# comparison: 0 <= e^(-x^2) <= e^(-x) for x >= 1 (x^2 >= x), so the first integral is at most 1/e
same(integrate(exp(-x), (x, 1, oo)), exp(-1)); holds(integrate(exp(-x**2), (x, 1, oo)) <= exp(-1))
x1 = symbols('x_1', positive=True); same(((1 + x1)**2 - (1 + x1)).expand(), x1**2 + x1)   # x^2 - x >= 0 for x = 1 + x1
# and 1/x <= 1/sqrt(x) for x >= 1, where the integral of 1/x diverges
same(integrate(1/sqrt(x), (x, 1, oo)), oo)
```

## 积分的应用 {#applications}

[模块 12](module_12_ZH.html) 教授这些内容，除了平均值
([模块 9](module_09_ZH.html)) 和参数曲线的弧长 ([模块 16](module_16_ZH.html)).
计算面积和体积时，要求边界函数或截面面积在所述区间内连续。

| 量 | 公式 | 适用情形 |
|---|---|---|
| 曲线之间的面积 | ${A = \displaystyle\int_a^b \big(f(x) - g(x)\big)\,dx}$ | 在 ${[a, b]}$ 上有 ${f(x) \ge g(x)}$，竖直条带的高度为上方函数减下方函数。若两曲线相交，则对 ${\abs{f(x) - g(x)},}$ 积分，或在两曲线上下位置交换的点分段。 |
| 面积，水平条带 | ${A = \displaystyle\int_c^d \big(x_R(y) - x_L(y)\big)\,dy}$ | ${x_R(y)\ge x_L(y)}$ 在 ${[c,d]}$ 上。用右边界的值减去左边界的值 |
| 切片法求体积 | ${V = \displaystyle\int_a^b A(x)\,dx}$ | 垂直于 ${x}$ 轴在 ${x}$ 处的切片具有已知面积 ${A(x)}$ |
| 圆盘法 | ${V = \pi\displaystyle\int_a^b f(x)^2\,dx}$ | ${y = f(x) \ge 0}$ 下方的区域绕 ${x}$ 轴旋转，每个截面为半径 ${f(x)}$ 的圆盘 |
| 圆环法 | ${V = \pi\displaystyle\int_a^b \big(R(x)^2 - r(x)^2\big)\,dx}$ | 每个切片是一个环形，外半径为 ${R(x)}$，内半径为 ${r(x),}$ ${0 \le r(x) \le R(x)}$ |
| 圆柱壳法 | ${V = 2\pi\displaystyle\int_a^b x\,f(x)\,dx}$ | ${y = f(x) \ge 0,}$ 下方的区域 ${0 \le a \le x \le b,}$ 绕 ${y}$ 轴旋转；一般情形下有 ${2\pi\int(\text{radius})(\text{height})}$ |
| 弧长 | ${L = \displaystyle\int_a^b \sqrt{1 + f'(x)^2}\,dx}$ | 一条曲线 ${y = f(x)}$，其上 ${f'}$ 在 ${[a, b]}$ 上连续 |
| 参数形式的弧长 | ${L = \displaystyle\int_\alpha^\beta \sqrt{x'(t)^2 + y'(t)^2}\,dt}$ | ${\alpha \le t \le \beta,}$ 取遍指定区间时曲线 ${\big(x(t), y(t)\big)}$ 恰好描绘一次，且 ${x',}$、${y'}$ 连续 |
| 平均值 | ${f_{\text{avg}} = \dfrac{1}{b - a}\displaystyle\int_a^b f(x)\,dx}$ | ${f}$ 在 ${[a,b]}$ 上可积，且满足 ${a<b}$ |
| 功 | ${W = \displaystyle\int_a^b F(x)\,dx}$ | ${F(x)}$ 是沿直线的力的有符号分量。缓慢拉伸理想弹簧所需的力是 ${kx}$，方向与弹簧本身的力相反。对于抽水情况，将每一层的重量乘以其被提升的距离进行积分 |
| 细杆的质心 | ${\bar{x} = \dfrac{\int_a^b x\,\rho(x)\,dx}{\int_a^b \rho(x)\,dx}}$ | 一根位于 ${[a,b]}$ 上的杆，具有可积的非负密度 ${\rho(x)}$ 且总质量为正 |
| 薄板的形心 | ${\bar{x} = \dfrac{1}{A}\displaystyle\int_a^b x\big(f(x) - g(x)\big)\,dx}$ | 一个均匀板 ${g(x) \le y \le f(x),}$ ${a \le x \le b,}$，面积为正数 ${A}$ |
|  | ${\bar{y} = \dfrac{1}{A}\displaystyle\int_a^b \tfrac12\big(f(x)^2 - g(x)^2\big)\,dx}$ | 同一平板 |
| 概率 | ${P(a \le X \le b) = \displaystyle\int_a^b f(x)\,dx}$ | ${f}$ 是概率密度：${f \ge 0}$ 且 ${\int_{-\infty}^{\infty} f(x)\,dx = 1}$ |
| 均值 | ${\mu = \displaystyle\int_{-\infty}^{\infty} x\,f(x)\,dx}$ | ${X}$ 具有密度 ${f}$ 且满足 ${\displaystyle\int_{-\infty}^{\infty}\abs{x}\,f(x)\,dx<\infty}$ |

当力的单位为牛顿，距离的单位为米时，功的单位为焦耳。

```check
rp, hp, Rp, bp, sp_, dp, rho_ = symbols('r h R b s d rho', positive=True)
# areas: a disc of radius r, a triangle (0,0), (b,0), (b,h) by vertical and by horizontal strips
same(integrate(sqrt(rp**2 - x**2) - (-sqrt(rp**2 - x**2)), (x, -rp, rp)), pi*rp**2)
same(integrate(hp*x/bp - 0, (x, 0, bp)), bp*hp/2); same(integrate(bp - bp*y/hp, (y, 0, hp)), bp*hp/2)
# curves that cross: sin x and cos x on [0, pi] cross at pi/4
A_sc = integrate(cos(x) - sin(x), (x, 0, pi/4)) + integrate(sin(x) - cos(x), (x, pi/4, pi))
same(A_sc, 2*sqrt(2)); same(integrate(Abs(sin(x) - cos(x)), (x, 0, pi)), 2*sqrt(2))
# slicing: a pyramid with a square base of side s and height h has volume s^2 h / 3
same(integrate((sp_*x/hp)**2, (x, 0, hp)), sp_**2*hp/3)
# discs: a ball and a cone
same(pi*integrate(sqrt(rp**2 - x**2)**2, (x, -rp, rp)), Rational(4, 3)*pi*rp**3)
same(pi*integrate((Rp*x/hp)**2, (x, 0, hp)), pi*Rp**2*hp/3)
# washers: a ball of radius sqrt(c^2 + rho^2) with a hole of radius rho leaves a ring of height L = 2c
# whose volume is pi L^3 / 6 whatever rho is (the napkin ring)
cp = symbols('c_p', positive=True)
same(pi*integrate((cp**2 + rho_**2 - x**2) - rho_**2, (x, -cp, cp)), pi*(2*cp)**3/6)
# shells: the ball again (height 2 sqrt(r^2 - x^2)), and the cone (height h(1 - x/R))
same(2*pi*integrate(x*2*sqrt(rp**2 - x**2), (x, 0, rp)), Rational(4, 3)*pi*rp**3)
same(2*pi*integrate(x*hp*(1 - x/Rp), (x, 0, Rp)), pi*Rp**2*hp/3)
# arc length: a quarter circle (pi r / 2), a segment of slope m (Pythagoras), a circle traced once
fq = sqrt(rp**2 - x**2)
same(1 + diff(fq, x)**2, rp**2/(rp**2 - x**2)); same(integrate(rp/sqrt(rp**2 - x**2), (x, 0, rp)), pi*rp/2)
same(integrate(sqrt(1 + diff(m*x + c, x)**2), (x, 0, 1)), sqrt(1 + m**2))
same(integrate(sqrt(diff(rp*cos(t), t)**2 + diff(rp*sin(t), t)**2), (t, 0, 2*pi)), 2*pi*rp)
# average value: a linear function averages to its value at the midpoint; sin on [0, pi] averages 2/pi
same(integrate(m*x + c, (x, a, b))/(b - a), m*(a + b)/2 + c); same(integrate(sin(x), (x, 0, pi))/pi, 2/pi)
# work: a constant force; a spring stretched by d stores k d^2 / 2;
# emptying a full cylindrical tank (radius R, depth h) over its top lifts its mass by h/2 on average
same(integrate(5, (x, 0, dp)), 5*dp); same(integrate(k*x, (x, 0, dp)), k*dp**2/2)
gp = symbols('g', positive=True)
same(integrate(rho_*gp*pi*Rp**2*(hp - y), (y, 0, hp)), (rho_*pi*Rp**2*hp)*gp*hp/2)
# centres of mass: a uniform rod, a triangle (the mean of its vertices), a half disc (4r/(3 pi))
Lp = symbols('L', positive=True)
same(integrate(x*1, (x, 0, Lp))/integrate(1, (x, 0, Lp)), Lp/2)
Atri = bp*hp/2
same(integrate(x*(hp*x/bp - 0), (x, 0, bp))/Atri, (0 + bp + bp)/3)
same(integrate(((hp*x/bp)**2 - 0)/2, (x, 0, bp))/Atri, (0 + 0 + hp)/3)
same(integrate((rp**2 - x**2)/2, (x, -rp, rp))/(pi*rp**2/2), 4*rp/(3*pi))
same(integrate(x*(sqrt(rp**2 - x**2) - 0), (x, -rp, rp)), 0)
# probability: the exponential density and the uniform density
lam = symbols('lambda', positive=True)
same(integrate(lam*exp(-lam*x), (x, 0, oo)), 1); same(integrate(x*lam*exp(-lam*x), (x, 0, oo)), 1/lam)
same(integrate(1/(b - a), (x, a, b)), 1); same(integrate(x/(b - a), (x, a, b)), (a + b)/2)
```

## 微分方程 {#differential-equations}

这些内容见[模块 13](module_13_ZH.html)。[模块 6](module_06_ZH.html) 通过代入检验
$y' = ky$ 的解。

| 模型 | 方程 | 解 | 适用条件 |
|---|---|---|---|
| 增长与衰减 | ${\dfrac{dy}{dt} = ky}$ | ${y = y_0e^{kt}}$ | ${y(0)=y_0>0}$。当 ${k > 0}$ 时增长（倍增时间为 ${\ln 2/k}$）；当 ${k < 0}$ 时衰减（半衰期为 ${\ln 2/\abs{k}}$） |
| 牛顿冷却定律 | ${\dfrac{dT}{dt} = -k(T - T_s)}$ | ${T = T_s + (T_0 - T_s)e^{-kt}}$ | ${k > 0,}$ ${T(0) = T_0,}$ 周围环境温度为 ${T_s}$ |
| 逻辑斯蒂模型 | ${\dfrac{dy}{dt} = ry\Big(1 - \dfrac{y}{K}\Big)}$ | ${y(t) = \dfrac{K}{1 + \dfrac{K-y_0}{y_0}e^{-rt}}}$ | 设 ${r,K>0}$、${y(0)=y_0>0}$、${t\ge 0}$。当 ${t\to\infty}$ 时有 ${y\to K}$。若 ${y_0=0}$，解为 ${y=0}$ |
| 可分离变量 | ${\dfrac{dy}{dx} = g(x)\,h(y)}$ | ${\displaystyle\int \frac{dy}{h(y)} = \int g(x)\,dx}$ | 其中 ${h(y) \ne 0;}$；${h}$ 的每个零点 ${y_1}$ 都给出常数解 ${y = y_1}$ |
| 一阶线性 | ${y' + p(t)y = q(t)}$ | ${y(t) = \dfrac{R(t)+C}{\mu(t)}}$, ${\mu(t) = e^{P(t)}}$ | 连续 ${p,q}$ 在一个区间上。取 ${P'=p}$ 和 ${R'=\mu q}$ |

**二阶线性方程具有常系数。** 对 $ay''+by'+cy=0$ 具有实
系数和 $a\ne0$，尝试 $y=e^{rt}$。这给出特征方程 $ar^2+br+c=0$。
你可以通过将整个方程乘以 $-1$ 来取 $a>0$。

| ${ar^2 + br + c = 0}$ 的根 | 通解 | 当 |
|---|---|---|
| 两个实根 ${r_1 \ne r_2}$ | ${y = C_1e^{r_1t} + C_2e^{r_2t}}$ | ${b^2 - 4ac > 0}$ |
| 一个重根 ${r = -\dfrac{b}{2a}}$ | ${y = (C_1 + C_2t)\,e^{rt}}$ | ${b^2 - 4ac = 0}$ |
| 复数根 ${\alpha \pm i\beta}$ | ${y = e^{\alpha t}(C_1\cos\beta t + C_2\sin\beta t)}$ | ${b^2 - 4ac < 0;}$ ${\ \alpha = -\dfrac{b}{2a},}$ ${\ \beta = \dfrac{\sqrt{4ac-b^2}}{2a}}$ |

**欧拉法**，适用于初值问题 $y'=F(t,y)$、$y(t_0)=y_0$，步长为 $h>0$：
$$t_{n+1}=t_n+h,\qquad y_{n+1}=y_n+h\,F(t_n,y_n).$$
如果精确解的二阶导数有界且 $F$ 在 $y$ 上利普希茨连续（例如，
$F_y$ 有界），则在固定网格时间点的误差为 $O(h)$。对于 $y'=y$ 具有 $y(0)=1$ 的方法给出
$(1+h)^{1/h}$ 在 $t=1$ 处（当 $1/h$ 是整数时），
并且误差 $e - (1 + h)^{1/h}$ 约为 $\tfrac{e}{2}\,h$，当 $h$ 较小时。

```check
y0_, T0, Ts = symbols('y_0 T_0 T_s')
kp, rp, Kp, y0p = symbols('k_p r K y_0', positive=True)
Yg = y0_*exp(k*t)
same(diff(Yg, t), k*Yg); same(Yg.subs(t, 0), y0_)
yf = Function('y')
same(dsolve(Eq(yf(t).diff(t), k*yf(t)), yf(t), ics={yf(0): y0_}).rhs, Yg)
same(exp(kp*(log(2)/kp)), 2); same(exp(-kp*(log(2)/Abs(-kp))), Rational(1, 2))   # doubling time, half-life
Tt = Ts + (T0 - Ts)*exp(-kp*t)
same(diff(Tt, t), -kp*(Tt - Ts)); same(Tt.subs(t, 0), T0)
Yt = Kp/(1 + (Kp - y0p)/y0p*exp(-rp*t))
same(diff(Yt, t), rp*Yt*(1 - Yt/Kp)); same(Yt.subs(t, 0), y0p); limit_is(Yt, t, oo, Kp)
same((rp*y*(1 - y/Kp)).subs(y, 0), 0)
# The denominator is positive for t >= 0: after multiplying by y0 it is a weighted average of K and y0.
et = exp(-rp*t)
same(y0p*(1 + (Kp - y0p)*et/y0p), Kp*et + y0p*(1 - et))
# separable, two instances: y' = x y^2 (int dy/y^2 = int x dx gives -1/y = x^2/2 + C1) and y' = y cos x
C1, C2 = symbols('C1 C2')
ys = -1/(x**2/2 + C1)
same(-1/ys, x**2/2 + C1); same(diff(ys, x), x*ys**2); same(diff(0*x, x), x*0**2)   # and the constant solution y = 0
yc = C1*exp(sin(x)); same(diff(yc, x), yc*cos(x))
# First-order linear: mu = exp(P) with P' = p, and R' = mu*q.
pf, qf = Function('p'), Function('q')
mu_f = exp(Integral(pf(t), t))
ylin = (Integral(mu_f*qf(t), t) + C1)/mu_f
same(diff(mu_f, t), pf(t)*mu_f)
same(diff(ylin, t) + pf(t)*ylin, qf(t))
yl2 = exp(-2*t)*(integrate(exp(2*t)*exp(t), t) + C1)
same(diff(yl2, t) + 2*yl2, exp(t)); same(yl2, exp(t)/3 + C1*exp(-2*t))
# second order: with given roots, b and c follow from the roots (Vieta); each solution satisfies the equation
an = symbols('a_n', positive=True)
r1, r2, al_, be_ = symbols('r_1 r_2 alpha beta', real=True)
Lop = lambda Y_, B_, C_: an*diff(Y_, x, 2) + B_*diff(Y_, x) + C_*Y_
B1, Cq1 = -an*(r1 + r2), an*r1*r2
same(Lop(C1*exp(r1*x) + C2*exp(r2*x), B1, Cq1), 0); same_set(solve(an*r**2 + B1*r + Cq1, r), [r1, r2])
same(B1**2 - 4*an*Cq1, an**2*(r1 - r2)**2)                     # > 0 when r1 != r2
B2, Cq2 = -2*an*r1, an*r1**2
same(Lop((C1 + C2*x)*exp(r1*x), B2, Cq2), 0); same(B2**2 - 4*an*Cq2, 0); same(-B2/(2*an), r1)
B3, Cq3 = -2*an*al_, an*(al_**2 + be_**2)
same(Lop(exp(al_*x)*(C1*cos(be_*x) + C2*sin(be_*x)), B3, Cq3), 0)
same_set(solve(an*r**2 + B3*r + Cq3, r), [al_ + I*be_, al_ - I*be_])
same(B3**2 - 4*an*Cq3, -4*an**2*be_**2)                       # < 0 when beta != 0
bpos = symbols('beta_p', positive=True)
same(-B3/(2*an), al_); same(sqrt(4*an*Cq3.subs(be_, bpos) - B3.subs(be_, bpos)**2)/(2*an), bpos)
# Euler's method for y' = y, y(0) = 1: (1 + h)^(1/h) at x = 1, error about (e/2) h
def euler(F_, x0, y0e, h_, n_):
    for _ in range(n_):
        x0, y0e = x0 + h_, y0e + h_*F_(x0, y0e)
    return y0e
for h_ in (Rational(1, 10), Rational(1, 20), Rational(1, 40)):
    same(euler(lambda X1, Y1: Y1, 0, 1, h_, int(1/h_)), (1 + h_)**int(1/h_))
limit_is((E - (1 + h)**(1/h))/h, h, 0, E/2, '+')
e10, e20 = E - Rational(11, 10)**10, E - Rational(21, 20)**20     # halving h roughly halves the error
holds(e10/e20 > Rational(19, 10)); holds(e10/e20 < Rational(21, 10))
```

## 级数 {#series}

### 常见级数 {#standard-series}

见[模块 14](module_14_ZH.html)。

| 级数 | 和 | 适用条件 |
|---|---|---|
| 等比级数：${\displaystyle\sum_{n=0}^{\infty} ar^n = a + ar + ar^2 + \cdots}$ | ${\dfrac{a}{1 - r}}$ | 当 ${\abs{r} \ge 1}$ 时 ${\abs{r} < 1;}$ 发散（假设 ${a \ne 0}$） |
| 等比级数的部分和：${\displaystyle\sum_{n=0}^{N-1} ar^n}$ | ${a\,\dfrac{1 - r^N}{1 - r}}$ | ${r \ne 1}$ |
| ${p}$ 级数：${\displaystyle\sum_{n=1}^{\infty} \frac{1}{n^p}}$ | 收敛 | ${p > 1;}$ 在 ${p \le 1}$ 处发散 |
| 调和级数：${\displaystyle\sum_{n=1}^{\infty} \frac{1}{n}}$ | 发散 | 第 ${N}$ 个部分和增长类似于 ${\ln N}$ |
| 裂项相消级数：${\displaystyle\sum_{n=1}^{\infty} \frac{1}{n(n+1)} = \sum_{n=1}^{\infty}\Big(\frac{1}{n} - \frac{1}{n+1}\Big)}$ | ${1}$ |  |

```check
nn = symbols('n', integer=True, positive=True); NN = symbols('N', integer=True, positive=True)
gs = Sum(r**n, (n, 0, oo)).doit()                              # SymPy's answer, with its condition
same(gs.args[0][0], 1/(1 - r)); holds(gs.args[0][1] == (Abs(r) < 1))
same(summation(3*Rational(1, 2)**n, (n, 0, oo)), 6); same(summation(Rational(-1, 3)**n, (n, 0, oo)), Rational(3, 4))
for N_ in range(1, 8):
    same(sum(a*r**j for j in range(N_)), a*(1 - r**N_)/(1 - r))
limit_is(a*(1 - Rational(1, 2)**NN)/(1 - Rational(1, 2)), NN, oo, 2*a)
qp = symbols('q', positive=True)                               # |r| >= 1: the terms do not tend to 0
limit_is((1 + qp)**n, n, oo, oo); same(summation(1, (n, 0, oo)), oo)
same([sum((-1)**j for j in range(N_)) for N_ in range(1, 7)], [1, 0, 1, 0, 1, 0])   # r = -1: partial sums 1, 0, 1, 0, ...
for p_, conv in ((3, True), (2, True), (Rational(3, 2), True), (1, False), (Rational(1, 2), False), (0, False)):
    holds(Sum(1/n**p_, (n, 1, oo)).is_convergent() == conv)
same(summation(1/n, (n, 1, oo)), oo); limit_is(harmonic(n) - log(n), n, oo, EulerGamma)   # H_N - ln N -> 0.5772...
same(1/(n*(n + 1)), 1/n - 1/(n + 1)); same(summation(1/(nn*(nn + 1)), (nn, 1, NN)), 1 - 1/(NN + 1))
same(summation(1/(n*(n + 1)), (n, 1, oo)), 1)
```

### 收敛性检验 {#convergence-tests}

[模块 14](module_14_ZH.html) 教授这些用于级数 $\sum a_n$ 的测试方法。它们的假设条件
仅需从某个 $n$ 开始成立：级数的前几项不影响其是否收敛。

| 判别法 | 条件 | 然后 |
|---|---|---|
| 发散 | ${\lim\limits_{n\to\infty} a_n \ne 0,}$ 或极限不存在 | ${\sum a_n}$ 发散。如果 ${a_n \to 0,}$ 该测试无结论 |
| 积分 | ${a_n = f(n),}$，其中 ${f}$ 在 ${[1, \infty)}$ 上连续、为正且递减 | ${\sum a_n}$ 与 ${\int_1^\infty f(x)\,dx}$ 均收敛或均发散；余项 ${R_N = \sum_{n=N+1}^{\infty} a_n}$ 对于收敛级数和 ${N}$ 在递减尾部满足 ${\int_{N+1}^{\infty} f(x)\,dx \le R_N \le \int_N^\infty f(x)\,dx}$ |
| 比较 | ${0 \le a_n \le b_n}$ | 如果 ${\sum b_n}$ 收敛，则 ${\sum a_n;}$ 也收敛；如果 ${\sum a_n}$ 发散，则 ${\sum b_n}$ 也发散 |
| 极限比较 | ${a_n > 0,}$ ${b_n > 0}$ 与 ${\lim\limits_{n\to\infty} \dfrac{a_n}{b_n} = L}$ 满足 ${0 < L < \infty}$ | ${\sum a_n}$ 与 ${\sum b_n}$ 均收敛或均发散 |
| 交错级数 | ${a_n = (-1)^{n-1}b_n}$ 与 ${b_n > 0,}$ ${b_{n+1} \le b_n}$ 和 ${b_n \to 0}$ | ${\sum a_n}$ 收敛，且其和 ${S}$ 满足 ${\abs{S - S_N} \le b_{N+1}}$ |
| 绝对收敛 | ${\sum \abs{a_n}}$ 收敛 | ${\sum a_n}$ 收敛。其逆命题不成立：${\sum (-1)^{n-1}/n}$ 收敛，${\sum 1/n}$ 不收敛 |
| 比值判别法 | ${\rho = \lim\limits_{n\to\infty} \abs{\dfrac{a_{n+1}}{a_n}}}$ 存在或为 ${\infty}$，且 ${a_n\ne0}$ 最终成立 | ${\rho < 1}$：${\sum a_n}$ 绝对收敛；${\rho > 1}$ 或 ${\rho = \infty}$：它发散；${\rho = 1}$：无结论 |
| 根值判别法 | ${\rho = \lim\limits_{n\to\infty} \abs{a_n}^{1/n}}$ 存在或为 ${\infty}$ | 与比值判别法相同的三种结论 |

```check
# divergence test, and a_n -> 0 is not enough
limit_is(n/(n + 1), n, oo, 1); same(summation(n/(n + 1), (n, 1, oo)), oo)
limit_is(1/n, n, oo, 0); same(summation(1/n, (n, 1, oo)), oo)
# integral test remainder for 1/n^2 with N = 10, 20
for N_ in (10, 20):
    RN = pi**2/6 - summation(1/n**2, (n, 1, N_))
    holds(integrate(1/x**2, (x, N_ + 1, oo)) <= RN); holds(RN <= integrate(1/x**2, (x, N_, oo)))
same(summation(1/n**2, (n, 1, oo)), pi**2/6)
# comparison: 1/(n^2 + 1) <= 1/n^2 (converges); 1/n <= 1/sqrt(n) (diverges)
s_cmp = summation(1/(n**2 + 1), (n, 1, oo)); holds(s_cmp <= pi**2/6); holds(Sum(1/(n**2 + 1), (n, 1, oo)).is_convergent())
holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
# limit comparison with 1/n^2 (converges) and 1/n (diverges); L = 1 both times
limit_is(((n + 1)/(n**3 + 2))/(1/n**2), n, oo, 1); holds(Sum((n + 1)/(n**3 + 2), (n, 1, oo)).is_convergent())
limit_is(((n + 1)/(n**2 + 5))/(1/n), n, oo, 1); holds(not Sum((n + 1)/(n**2 + 5), (n, 1, oo)).is_convergent())
# alternating series: sum (-1)^(n-1)/n = ln 2, error at most the first omitted term
same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2))
for N_ in (5, 10, 50):
    holds(Abs(log(2) - sum(Rational((-1)**(j - 1), j) for j in range(1, N_ + 1))) <= Rational(1, N_ + 1))
# absolute convergence: sum (-1)^(n-1)/n^2 converges (to pi^2/12) because sum 1/n^2 does
same(summation((-1)**(n - 1)/n**2, (n, 1, oo)), pi**2/12)
# ratio test: 1/n! (rho = 0, sum e), 2^n/n (rho = 2, diverges), 1/n and 1/n^2 (rho = 1 for both)
same(factorial(nn)/factorial(nn + 1), 1/(nn + 1)); limit_is(1/(n + 1), n, oo, 0); same(summation(1/factorial(n), (n, 0, oo)), E)
limit_is((2**(n + 1)/(n + 1))/(2**n/n), n, oo, 2); limit_is(2**n/n, n, oo, oo)
limit_is(n/(n + 1), n, oo, 1); limit_is(n**2/(n + 1)**2, n, oo, 1)
# root test: (n/(2n + 1))^n has rho = 1/2; indeed n/(2n + 1) < 1/2, so the terms are below (1/2)^n
limit_is(n/(2*n + 1), n, oo, Rational(1, 2)); same(Rational(1, 2) - nn/(2*nn + 1), 1/(2*(2*nn + 1)))
```

### 泰勒公式 {#taylor}

若 $f$ 在含 $a$ 和 $x$ 的开区间内具有 $n + 1$ 阶导数
（见[模块 15](module_15_ZH.html)），则
$$f(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x - a)^k + R_n(x), \qquad R_n(x) = \frac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}$$
对某个 $c$ 在 $a$ 与 $x$ 之间（拉格朗日余项形式）。和为泰勒
多项式 $T_n(x)$，其次数不超过 $n$，展开中心为 $a$。当 $a=0$ 时称为麦克劳林多项式。

**泰勒不等式。** 如果 $\abs{f^{(n+1)}(t)} \le M$ 对于每个 $t$ 在 $a$ 与 $x$ 之间，那么
$$\abs{R_n(x)} \le \frac{M}{(n + 1)!}\,\abs{x - a}^{n+1}.$$
**泰勒级数。** 若 $f$ 在 $a$ 附近各阶可导，系数满足 $c_k = f^{(k)}(a)/k!$ 的级数 $\sum_{k=0}^{\infty} c_k(x - a)^k$
恰在 $n \to \infty$ 时有 $R_n(x) \to 0$ 的情况下等于 $f(x)$。

```check
# T_n from the derivatives agrees with SymPy's series, about a = 0, 1 and 4
for fn_, a_, n_ in ((exp(x), 0, 6), (log(x), 1, 6), (sqrt(x), 4, 5), (sin(x), pi/6, 5)):
    Tn_ = sum(diff(fn_, x, j).subs(x, a_)/factorial(j)*(x - a_)**j for j in range(n_ + 1))
    same(series(fn_, x, a_, n_ + 1).removeO(), Tn_)
# Lagrange form: e^x, a = 0, n = 3, x = 1: R_3 = e - 8/3 = e^c/4! with c = ln(24(e - 8/3)) in (0, 1)
c_ = log(24*(E - Rational(8, 3)))
same(exp(c_)/factorial(4)*1**4, E - (1 + 1 + Rational(1, 2) + Rational(1, 6))); holds(0 < c_); holds(c_ < 1)
# cos x, a = 0, n = 3, x = 1/2: R_3 = cos(c) (1/2)^4 / 4! with c = arccos(384 (cos(1/2) - 7/8)) in (0, 1/2)
c2 = acos(384*(cos(Rational(1, 2)) - Rational(7, 8)))
same(cos(c2)/factorial(4)*Rational(1, 2)**4, cos(Rational(1, 2)) - (1 - Rational(1, 8))); holds(0 < c2); holds(c2 < Rational(1, 2))
# Taylor's inequality: sin x (M = 1, n = 4, T_4 = x - x^3/6) and e^x on [0, 1] (M = e, n = 5)
holds(Abs(sin(1) - Rational(5, 6)) <= Rational(1, 120))
holds(Abs(E - sum(Rational(1, factorial(j)) for j in range(6))) <= E/factorial(6))
# R_n -> 0 for e^x at every x: |R_n| <= e^|x| |x|^(n+1)/(n+1)!
limit_is(exp(Abs(x))*Abs(x)**(n + 1)/factorial(n + 1), n, oo, 0)
```

### 麦克劳林级数 {#maclaurin}

见[模块 15](module_15_ZH.html)。

| 函数 | 级数 | 在下列条件下等于原函数 |
|---|---|---|
| ${e^x}$ | ${\displaystyle\sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots}$ | 任意 ${x}$ |
| ${\sin x}$ | ${\displaystyle\sum_{n=0}^{\infty} (-1)^n\frac{x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots}$ | 任意 ${x}$ |
| ${\cos x}$ | ${\displaystyle\sum_{n=0}^{\infty} (-1)^n\frac{x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots}$ | 任意 ${x}$ |
| ${\dfrac{1}{1 - x}}$ | ${\displaystyle\sum_{n=0}^{\infty} x^n = 1 + x + x^2 + x^3 + \cdots}$ | ${-1 < x < 1}$ |
| ${\ln(1 + x)}$ | ${\displaystyle\sum_{n=1}^{\infty} (-1)^{n-1}\frac{x^n}{n} = x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots}$ | ${-1 < x \le 1}$ |
| ${\arctan x}$ | ${\displaystyle\sum_{n=0}^{\infty} (-1)^n\frac{x^{2n+1}}{2n+1} = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots}$ | ${-1 \le x \le 1}$ |
| ${(1 + x)^k}$ | ${\displaystyle\sum_{n=0}^{\infty} \binom{k}{n}x^n = 1 + kx + \frac{k(k-1)}{2!}x^2 + \cdots}$ | ${-1 < x < 1,}$ ${k}$ 实数 |

对于二项式级数，有 $\dbinom{k}{n} = \dfrac{k(k-1)\cdots(k-n+1)}{n!}$ 和 $\dbinom{k}{0} = 1$。若
$k$ 为非负整数，则级数在 $n = k$ 处终止，对任意 $x$ 均成立（二项式定理）。
在端点 $x = \pm 1$ 处是否收敛取决于 $k$。当 $k > 0$ 时，级数在 $[-1, 1]$ 上收敛；当
$-1 < k < 0$ 在 $(-1, 1]$ 上，而对于 $k \le -1$ 仅在 $(-1, 1)$ 上。

在 $x = 1$ 处，级数给出 $\ln 2 = 1 - \tfrac12 + \tfrac13 - \cdots$ 并
$\tfrac{\pi}{4} = 1 - \tfrac13 + \tfrac15 - \cdots$. **欧拉公式**（模块 15）：
$e^{i\theta} = \cos\theta + i\sin\theta$ 对于每个实数 $\theta$；特别是 $e^{i\pi} = -1$。

```check
NT = 10                                                        # the first terms agree with SymPy's series
same(series(exp(x), x, 0, NT).removeO(), sum(x**j/factorial(j) for j in range(NT)))
same(series(sin(x), x, 0, 2*NT).removeO(), sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(NT)))
same(series(cos(x), x, 0, 2*NT).removeO(), sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(NT)))
same(series(1/(1 - x), x, 0, NT).removeO(), sum(x**j for j in range(NT)))
same(series(log(1 + x), x, 0, NT).removeO(), sum((-1)**(j - 1)*x**j/j for j in range(1, NT)))
same(series(atan(x), x, 0, 2*NT).removeO(), sum((-1)**j*x**(2*j + 1)/(2*j + 1) for j in range(NT)))
same(series((1 + x)**k, x, 0, 6).removeO(), sum(binomial(k, j)*x**j for j in range(6)))
same(expand_func(binomial(k, 3)), k*(k - 1)*(k - 2)/factorial(3)); same(binomial(k, 0), 1)
# the sums: SymPy sums each series and states where; the conditions give the intervals in the table
same(summation(x**n/factorial(n), (n, 0, oo)), exp(x))
same(summation((-1)**n*x**(2*n + 1)/factorial(2*n + 1), (n, 0, oo)), sin(x))
same(summation((-1)**n*x**(2*n)/factorial(2*n), (n, 0, oo)), cos(x))
xs_in = lambda cond, pts: [bool(cond.subs(x, p_)) for p_ in pts]
pts = (-2, -1, Rational(-1, 2), 0, Rational(1, 2), 1, 2)
g1 = summation(x**n, (n, 0, oo)); same(g1.args[0][0], 1/(1 - x))
same(xs_in(g1.args[0][1], pts), [False, False, True, True, True, False, False])
g2 = summation((-1)**(n - 1)*x**n/n, (n, 1, oo))              # SymPy writes -Piecewise((-log(x + 1), ...), ...)
pw2 = [f_ for f_ in Mul.make_args(g2) if isinstance(f_, Piecewise)][0]; same(g2, -pw2)
same(-pw2.args[0][0], log(1 + x)); same(xs_in(pw2.args[0][1], pts), [False, False, True, True, True, True, False])
g3 = summation((-1)**n*x**(2*n + 1)/(2*n + 1), (n, 0, oo)); same(g3.args[0][0], atan(x))
same(xs_in(g3.args[0][1], pts), [False, True, True, True, True, True, False])
same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2)); same(summation((-1)**n/(2*n + 1), (n, 0, oo)), pi/4)
holds(not Sum(-1/n, (n, 1, oo)).is_convergent())              # ln(1 + x) at x = -1
holds(Sum(-(-1)**n/(2*n + 1), (n, 0, oo)).is_convergent())    # arctan at x = -1
# the binomial series: |x| < 1 always (ratio |x|), whole k: the binomial theorem, ends depend on k
limit_is(Abs((k - n)/(n + 1))*Abs(x), n, oo, Abs(x))
for K_ in range(0, 6):
    same(expand((1 + x)**K_), sum(binomial(K_, j)*x**j for j in range(K_ + 1))); same(binomial(K_, K_ + 1), 0)
kr = symbols('k_r', real=True)
g4 = summation(binomial(kr, n)*x**n, (n, 0, oo)); same(g4.args[0][0], (1 + x)**kr)
for k_, at_minus1, at_plus1 in ((Rational(1, 2), True, True), (3, True, True), (Rational(-1, 2), False, True),
                                (-1, False, False), (Rational(-3, 2), False, False)):
    same([bool(g4.args[0][1].subs({kr: k_, x: X1})) for X1 in (-1, 1, Rational(1, 2))], [at_minus1, at_plus1, True])
same(summation(binomial(Rational(1, 2), n), (n, 0, oo)), sqrt(2))   # k = 1/2 at x = 1
same([binomial(-1, j) for j in range(6)], [1, -1, 1, -1, 1, -1])      # k = -1 at x = 1: terms +-1, no limit 0
th = symbols('theta', real=True)
same(exp(I*th), cos(th) + I*sin(th)); same(exp(I*pi), -1)
```

## 多变量 {#several-variables}

### 向量、直线和平面 {#vectors}

[模块 16](module_16_ZH.html) 教授这些内容。此处 $\vb{a} = \langle a_1, a_2, a_3\rangle$，
$\vb{b} = \langle b_1, b_2, b_3\rangle$，$\vb{c} = \langle c_1, c_2, c_3\rangle$，并且对于非零 $\vb{a}$ 和 $\vb{b}$，$\theta$ 是它们之间的角度，$0\le\theta\le\pi$。

| 量 | 公式 | 注释 |
|---|---|---|
| 长度 | ${\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2 + a_3^2} = \sqrt{\vb{a}\cdot\vb{a}}}$ |  |
| 数量积 | ${\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3 = \norm{\vb{a}}\norm{\vb{b}}\cos\theta}$ | 组件公式也适用于零向量。非零向量垂直当且仅当 ${\vb{a}\cdot\vb{b}=0}$ |
| 投影 | ${\operatorname{proj}_{\vb{a}}\vb{b} = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}^2}\,\vb{a}}$ | ${\vb{a} \ne \vb{0};}$ ${\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}}$ 垂直于 ${\vb{a}}$ |
| 叉乘 | ${\vb{a}\times\vb{b} = \langle a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1\rangle}$ | 垂直于 ${\vb{a}}$ 和 ${\vb{b}}$ （右手法则: ${\vb{i}\times\vb{j} = \vb{k}}$); ${\vb{b}\times\vb{a} = -\vb{a}\times\vb{b}}$ |
| ${\vb{a}\times\vb{b}}$ 的长度 | ${\norm{\vb{a}\times\vb{b}} = \norm{\vb{a}}\norm{\vb{b}}\sin\theta}$ | 以 ${\vb{a}}$ 和 ${\vb{b}}$ 为边的平行四边形的面积 |
| 混合积 | ${\vb{a}\cdot(\vb{b}\times\vb{c}) = \det\begin{pmatrix} a_1 & a_2 & a_3\\ b_1 & b_2 & b_3\\ c_1 & c_2 & c_3\end{pmatrix}}$ | 其绝对值是 ${\vb{a},}$ ${\vb{b},}$ ${\vb{c}}$ 上的盒子（平行六面体）的体积 |
| 直线 | ${\vb{r}(t) = \vb{r}_0 + t\,\vb{v},}$ 是 ${x = x_0 + v_1t,}$ ${y = y_0 + v_2t,}$ ${z = z_0 + v_3t}$ | 经过 ${(x_0, y_0, z_0)}$ 且方向为 ${\vb{v} = \langle v_1, v_2, v_3\rangle \ne \vb{0}}$ |
| 平面 | ${a(x - x_0) + b(y - y_0) + c(z - z_0) = 0}$ | 经过 ${(x_0, y_0, z_0)}$ 且法向量为 ${\vb{n} = \langle a, b, c\rangle \ne \vb{0}}$ |
| 点到平面的距离 | ${D = \dfrac{\abs{ax_1 + by_1 + cz_1 + d}}{\sqrt{a^2 + b^2 + c^2}}}$ | 点 ${(x_1, y_1, z_1),}$ 平面 ${ax+by+cz+d=0}$ 且法向量 ${\langle a,b,c\rangle}$ 非零 |

```check
a1, a2, a3, b1, b2, b3, c1, c2, c3 = symbols('a1:4 b1:4 c1:4', real=True)
Av, Bv, Cv = Matrix([a1, a2, a3]), Matrix([b1, b2, b3]), Matrix([c1, c2, c3])
same(Av.norm(), sqrt(a1**2 + a2**2 + a3**2)); same(Av.norm(), sqrt(Av.dot(Av)))
same(Av.dot(Bv), a1*b1 + a2*b2 + a3*b3)
# |a||b| cos(theta) = a.b is the law of cosines for the triangle with sides a, b and a - b
same(Av.dot(Bv), (Av.norm()**2 + Bv.norm()**2 - (Av - Bv).norm()**2)/2)
same(acos(Matrix([1, 0, 0]).dot(Matrix([1, 1, 0]))/(1*sqrt(2))), pi/4)          # an instance: 45 degrees
proj = Av.dot(Bv)/Av.dot(Av)*Av; same(Av.dot(Bv - proj), 0)
Xv = Av.cross(Bv)
same(Xv, Matrix([a2*b3 - a3*b2, a3*b1 - a1*b3, a1*b2 - a2*b1]))
same(Av.dot(Xv), 0); same(Bv.dot(Xv), 0); same(Bv.cross(Av), -Xv)
same(Matrix([1, 0, 0]).cross(Matrix([0, 1, 0])), Matrix([0, 0, 1]))
# |a x b|^2 = |a|^2 |b|^2 - (a.b)^2 = |a|^2 |b|^2 (1 - cos^2 theta), and sin theta >= 0 on [0, pi]
same(Xv.dot(Xv), Av.dot(Av)*Bv.dot(Bv) - Av.dot(Bv)**2)
same(Matrix([3, 0, 0]).cross(Matrix([1, 2, 0])).norm(), 3*2)  # a parallelogram with base 3 and height 2
same(Av.dot(Bv.cross(Cv)), Matrix([[a1, a2, a3], [b1, b2, b3], [c1, c2, c3]]).det())
same(Matrix([2, 0, 0]).dot(Matrix([0, 3, 0]).cross(Matrix([0, 0, 4]))), 2*3*4)  # a 2 x 3 x 4 box
x0, y0, z0, v1, v2, v3 = symbols('x0 y0 z0 v1 v2 v3', real=True)
ln_ = Matrix([x0, y0, z0]) + t*Matrix([v1, v2, v3])
same(ln_.subs(t, 0), Matrix([x0, y0, z0])); same(ln_.diff(t), Matrix([v1, v2, v3]))
# a plane through P0 spanned by U and W has normal n = U x W; every point P0 + sU + tW satisfies the equation
U3, W3 = Matrix(symbols('U1:4', real=True)), Matrix(symbols('W1:4', real=True))
nv = U3.cross(W3); P0v = Matrix([x0, y0, z0]); Pt3 = P0v + s*U3 + t*W3
same(nv[0]*(Pt3[0] - x0) + nv[1]*(Pt3[1] - y0) + nv[2]*(Pt3[2] - z0), 0)
pa, pb, pc, pd, X1, Y1, Z1 = symbols('a_p b_p c_p d_p x_1 y_1 z_1', real=True)
nq, Pq = Matrix([pa, pb, pc]), Matrix([X1, Y1, Z1])
Qq = Pq - (nq.dot(Pq) + pd)/nq.dot(nq)*nq                       # the foot of the perpendicular from P
same(nq.dot(Qq) + pd, 0); same((Pq - Qq).cross(nq), zeros(3, 1))   # Q is on the plane and PQ is along n
same((Pq - Qq).dot(Pq - Qq), (pa*X1 + pb*Y1 + pc*Z1 + pd)**2/(pa**2 + pb**2 + pc**2))
same(Abs(1*1 + 2*2 + 2*3 - 2)/sqrt(1 + 4 + 4), 3)              # the point (1, 2, 3), the plane x + 2y + 2z = 2
```

### 偏导数和梯度 {#partial-derivatives}

这些内容见[模块 17](module_17_ZH.html)。偏导数可能存在，而函数
仍不可微。下面的链式法则、方向导数公式和线性近似
均以可微为条件。

| 要点 | 公式 | 适用条件 |
|---|---|---|
| 偏导数 | ${f_x = \dfrac{\partial f}{\partial x}}$：固定 ${y}$，对 ${x}$ 求导；${\ f_y = \dfrac{\partial f}{\partial y}}$ |  |
| 二阶偏导数 | ${f_{xx} = \dfrac{\partial^2 f}{\partial x^2},}$ ${\ f_{xy} = (f_x)_y = \dfrac{\partial^2 f}{\partial y\,\partial x}}$ |  |
| 克莱罗定理 | ${f_{xy} = f_{yx}}$ | ${f_{xy}}$ 和 ${f_{yx}}$ 在点附近连续 |
| 梯度 | ${\nabla f = \langle f_x, f_y, f_z\rangle}$ |  |
| 方向导数 | ${D_{\vb{u}}f = \nabla f\cdot\vb{u}}$ | ${\vb{u}}$ 是单位向量 |
| 最陡上升方向 | 当取 ${\nabla f;}$ 的方向时，${D_{\vb{u}}f}$ 的最大值为 ${\norm{\nabla f},}$。${\nabla f}$ 垂直于等值线（或等值面） | ${\nabla f \ne \vb{0}}$ |
| 链式法则 | ${\dfrac{dz}{dt} = \dfrac{\partial z}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial z}{\partial y}\dfrac{dy}{dt}}$ | ${z = f(x, y),}$ ${x = x(t),}$ ${y = y(t)}$ |
| 链式法则，两个参数 | ${\dfrac{\partial z}{\partial s} = \dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s} + \dfrac{\partial z}{\partial y}\dfrac{\partial y}{\partial s},}$ 和 ${t}$ 的相同情况 | ${x = x(s, t),}$ ${y = y(s, t)}$ |
| 切平面 | ${z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)}$ | ${z = f(x, y)}$ 在 ${(a, b)}$ 处的图像 |
| 线性近似 | ${f(x, y) \approx f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)}$ | ${(x, y)}$ 在 ${(a, b)}$ 附近 |
| 等值面的切平面 | ${\nabla F(P)\cdot\langle x - x_0,\ y - y_0,\ z - z_0\rangle = 0}$ | 过 ${P=(x_0,y_0,z_0)}$ 的等值面 ${F(x,y,z)=k}$，其中 ${F}$ 在附近具有连续的一阶偏导数，且 ${\nabla F(P)\ne\vb{0}}$ |

混合偏导数不连续时，克莱罗定理可能失效。例如，对 $f(x, y) = \dfrac{xy(x^2 - y^2)}{x^2 + y^2}$，若
$f(0, 0) = 0$ 在原点处的混合偏导数分别为 $f_{xy}(0, 0) = -1$ 和 $f_{yx}(0, 0) = 1$

```check
fxy = x**3*y**2 + sin(x*y) + exp(x - 2*y)
same(diff(fxy, x, y), diff(diff(fxy, x), y)); same(diff(fxy, x, y), diff(fxy, y, x))   # notation; Clairaut
fc = x*y*(x**2 - y**2)/(x**2 + y**2)                            # the counterexample, f(0, 0) = 0
fx_on_axis = limit((fc.subs(x, h) - 0)/h, h, 0)                 # f_x(0, y) for y != 0: (f(h, y) - f(0, y))/h
fy_on_axis = limit((fc.subs(y, h) - 0)/h, h, 0)                 # f_y(x, 0) for x != 0
same(fx_on_axis, -y); same(fy_on_axis, x)
same(limit((fc.subs({x: h, y: 0}) - 0)/h, h, 0), 0)            # f_x(0, 0) = 0
same(limit((fc.subs({x: 0, y: h}) - 0)/h, h, 0), 0)             # f_y(0, 0) = 0
same(diff(fx_on_axis, y), -1); same(diff(fy_on_axis, x), 1)     # f_xy(0, 0) = -1, f_yx(0, 0) = 1
# directional derivative: the limit definition agrees with grad f . u
F2 = x**2*y + y**3; P0 = {x: 1, y: 2}; uv = Matrix([Rational(3, 5), Rational(4, 5)])
gr = Matrix([diff(F2, x), diff(F2, y)]).subs(P0)
same(limit((F2.subs({x: 1 + h*uv[0], y: 2 + h*uv[1]}) - F2.subs(P0))/h, h, 0), gr.dot(uv))
# steepest ascent: |grad f|^2 - (grad f . u)^2 >= 0 for every unit u, with equality for u = grad f/|grad f|
ph_ = symbols('phi', real=True); ue = Matrix([cos(ph_), sin(ph_)])
same(gr.dot(gr) - gr.dot(ue)**2, (gr[0]*sin(ph_) - gr[1]*cos(ph_))**2); same(gr.dot(gr/gr.norm()), gr.norm())
rc2 = Matrix([cos(t), sin(t)]); same(Matrix([2*x, 2*y]).subs({x: rc2[0], y: rc2[1]}).dot(rc2.diff(t)), 0)   # x^2 + y^2 = 1
# chain rule: for every cubic f(x, y) and any curves x(t), y(t); then an instance with two parameters
cf = symbols('c_0:10'); Xf, Yf = Function('X')(t), Function('Y')(t)
fpoly = sum(cf[j]*x**i_*y**k_ for j, (i_, k_) in enumerate([(i_, k_) for i_ in range(4) for k_ in range(4) if i_ + k_ <= 3]))
same(diff(fpoly.subs({x: Xf, y: Yf}), t), (diff(fpoly, x)*diff(Xf, t) + diff(fpoly, y)*diff(Yf, t)).subs({x: Xf, y: Yf}))
zf = x**2*y + exp(x*y); xs2, ys2 = s*t, s + t**2
same(diff(zf.subs({x: xs2, y: ys2}), s), (diff(zf, x)*diff(xs2, s) + diff(zf, y)*diff(ys2, s)).subs({x: xs2, y: ys2}))
same(diff(zf.subs({x: xs2, y: ys2}), t), (diff(zf, x)*diff(xs2, t) + diff(zf, y)*diff(ys2, t)).subs({x: xs2, y: ys2}))
# tangent plane to z = x^2 + y^2 at (1, 2): the error is (x - 1)^2 + (y - 2)^2, of second order
fp = x**2 + y**2; Pab = {x: 1, y: 2}
plane = fp.subs(Pab) + diff(fp, x).subs(Pab)*(x - 1) + diff(fp, y).subs(Pab)*(y - 2)
same(plane, 5 + 2*(x - 1) + 4*(y - 2)); same(fp - plane, (x - 1)**2 + (y - 2)**2)
# level surface x^2 + y^2 + z^2 = 14 at (1, 2, 3): the same plane as for the graph z = sqrt(14 - x^2 - y^2)
nP = Matrix([diff(x**2 + y**2 + z**2, w_) for w_ in (x, y, z)]).subs({x: 1, y: 2, z: 3}); same(nP, Matrix([2, 4, 6]))
zg = sqrt(14 - x**2 - y**2)
same_set(solve(nP.dot(Matrix([x - 1, y - 2, z - 3])), z), [3 + diff(zg, x).subs(Pab)*(x - 1) + diff(zg, y).subs(Pab)*(y - 2)])
```

### 优化 {#optimisation}

这些内容见[模块 18](module_18_ZH.html)。函数 $f(x, y)$ 的**临界点**是指满足下列条件的点：
$\nabla f = \vb{0}$，或有一个偏导数不存在。定义域内部的
局部极大值和极小值只能出现在临界点。设 $(a,b)$ 是一个内部临界点，两个一阶偏导数都为零，二阶偏导数
在其邻域内连续。记
$$H = \begin{pmatrix} f_{xx} & f_{xy}\\ f_{yx} & f_{yy}\end{pmatrix}, \qquad D = \det H = f_{xx}f_{yy} - f_{xy}^2 \quad\text{at } (a, b).$$

| ${D}$ | ${f_{xx}(a, b)}$ | ${(a, b)}$ 是 |
|---|---|---|
| ${D > 0}$ | ${f_{xx} > 0}$ | 局部极小值点 |
| ${D > 0}$ | ${f_{xx} < 0}$ | 局部极大值点 |
| ${D < 0}$ |  | 鞍点 |
| ${D = 0}$ |  | 无法用此判别法确定其类型 |

**用拉格朗日乘数法。** 假设 $f$ 和约束函数有连续的一阶偏导数
在一个受约束的极值点附近。在 $g=k$ 的一个正则点，且 $\nabla g\ne\vb{0}$，它必须满足
$\nabla f=\lambda\,\nabla g$。当有两个约束 $g=k$ 和 $h=c$ 且梯度线性无关时，
它必须满足 $\nabla f=\lambda\,\nabla g+\mu\,\nabla h$。检查奇点和任何边界
限制要另行检查。

```check
O0 = {x: 0, y: 0}
for fq, kind in ((x**2 + 3*y**2, 'min'), (-x**2 - x*y - y**2, 'max'), (x**2 - y**2, 'saddle'), (x*y, 'saddle')):
    same([diff(fq, w_).subs(O0) for w_ in (x, y)], [0, 0])     # (0, 0) is a critical point
    Hq = hessian(fq, (x, y)).subs(O0); Dq, fxx_ = Hq.det(), Hq[0, 0]
    same(Hq[0, 0]*Hq[1, 1] - Hq[0, 1]**2, Dq)
    ev = list(Hq.eigenvals())                                   # f = (1/2) X^T H X: the signs of the eigenvalues decide
    if kind == 'min': holds(Dq > 0); holds(fxx_ > 0); holds(all(e_ > 0 for e_ in ev))
    if kind == 'max': holds(Dq > 0); holds(fxx_ < 0); holds(all(e_ < 0 for e_ in ev))
    if kind == 'saddle': holds(Dq < 0); holds(min(ev) < 0); holds(max(ev) > 0)
# D = 0 decides nothing: x^4 + y^4 (minimum), x^4 - y^4 (saddle), x^2 + y^3 (neither)
for fq in (x**4 + y**4, x**4 - y**4, x**2 + y**3):
    same(hessian(fq, (x, y)).subs(O0).det(), 0)
holds((x**4 + y**4).subs({x: Rational(1, 10), y: Rational(-1, 5)}) > 0)
same([(x**4 - y**4).subs({x: h, y: 0}), (x**4 - y**4).subs({x: 0, y: h})], [h**4, -h**4])
same([(x**2 + y**3).subs({x: 0, y: h}), (x**2 + y**3).subs({x: 0, y: -h})], [h**3, -h**3])
# Lagrange, one constraint: f = xy on x + y = 10 is largest at (5, 5), as substitution confirms
lam_, mu_ = symbols('lambda mu')
sol1 = solve([y - lam_*1, x - lam_*1, x + y - 10], [x, y, lam_], dict=True)
same(sol1, [{x: 5, y: 5, lam_: 5}]); same(solve(diff(x*(10 - x), x), x), [5]); same((x*(10 - x)).subs(x, 5), 25)
# two constraints: x^2 + y^2 + z^2 on x + y + z = 1 and x - y = 0 is smallest at (1/3, 1/3, 1/3)
sol2 = solve([2*x - lam_ - mu_, 2*y - lam_ + mu_, 2*z - lam_, x + y + z - 1, x - y], [x, y, z, lam_, mu_], dict=True)
same(sol2, [{x: Rational(1, 3), y: Rational(1, 3), z: Rational(1, 3), lam_: Rational(2, 3), mu_: 0}])
same(solve(diff(2*s**2 + (1 - 2*s)**2, s), s), [Rational(1, 3)])   # along the line (s, s, 1 - 2s)
```

### 多重积分 {#multiple-integrals}

[模块 19](module_19_ZH.html) 教授这些内容。

| 坐标 | 变量替换 | 面积或体积元素 |
|---|---|---|
| 极坐标 | ${x = r\cos\theta,}$ ${\ y = r\sin\theta}$ | ${dA = r\,dr\,d\theta}$ |
| 圆柱坐标 | ${x = r\cos\theta,}$ ${\ y = r\sin\theta,}$ ${\ z = z}$ | ${dV = r\,dz\,dr\,d\theta}$ |
| 球坐标 | ${x = \rho\sin\varphi\cos\theta,}$ ${\ y = \rho\sin\varphi\sin\theta,}$ ${\ z = \rho\cos\varphi}$ | ${dV = \rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta}$ |

这里 $r \ge 0$、$\rho \ge 0$，$\varphi$ 表示从 $z$ 轴正向量起的角，并且 $0 \le \varphi \le \pi$
（许多物理教材互换符号 $\theta$ 和 $\varphi$）。选取角度范围时，应使该区域
恰好被覆盖一次，零面积或零体积的接缝、坐标轴及塌缩的边界点可例外。

- **富比尼定理。** 若 $f$ 在矩形 $R = [a,b]\times[c,d]$ 上连续，且 $a<b$、$c<d$，则
  $$\iint_R f(x, y)\,dA = \int_a^b\!\!\int_c^d f(x, y)\,dy\,dx = \int_c^d\!\!\int_a^b f(x, y)\,dx\,dy.$$
- **变量替换**。设 $S$ 和 $R$ 是类型 I 或 II 的有界闭区域，且 $f$ 在 $R$ 上连续。
  映射 $x=g(u,v)$、$y=h(u,v)$ 必须把 $S$ 映满 $R$，且一阶偏导数连续，其连续性须在
  $S$ 的某个邻域内成立。在 $S$ 的内部，映射必须单射且雅可比行列式非零。于是
  $$\iint_R f(x, y)\,dA = \iint_S f\big(g(u, v), h(u, v)\big)\,\abs{\frac{\partial(x, y)}{\partial(u, v)}}\,du\,dv, \qquad \frac{\partial(x, y)}{\partial(u, v)} = \det\begin{pmatrix} x_u & x_v\\ y_u & y_v\end{pmatrix}.$$
- **质量与质心。** 设有界薄板 $D$ 的密度 $\rho(x,y)\ge0$ 连续，总质量 $m$ 为正：
  $$m = \iint_D \rho\,dA, \qquad \bar{x} = \frac{1}{m}\iint_D x\rho\,dA, \qquad \bar{y} = \frac{1}{m}\iint_D y\rho\,dA.$$
- **高斯积分** 在半径为 $R$ 的圆盘上，二重积分 $e^{-(x^2+y^2)}$ 为
  $\pi(1-e^{-R^2})$，这是用极坐标计算得到的。当 $R\to\infty$ 时，比较圆盘和正方形，可得
  $\int_{-\infty}^{\infty}e^{-x^2}\,dx=\sqrt{\pi}$ ([模块 19](module_19_ZH.html#gaussian)).

```check
rs, rhos = symbols('r_s rho_s', nonnegative=True)
phs, ths, zs = symbols('phi_s theta_s z_s', real=True)
same(Matrix([rs*cos(ths), rs*sin(ths)]).jacobian([rs, ths]).det(), rs)
same(Matrix([rs*cos(ths), rs*sin(ths), zs]).jacobian([rs, ths, zs]).det(), rs)
sph = Matrix([rhos*sin(phs)*cos(ths), rhos*sin(phs)*sin(ths), rhos*cos(phs)])
same(sph.jacobian([rhos, phs, ths]).det(), rhos**2*sin(phs)); same(sph.dot(sph), rhos**2)
same(acos(sph[2]/rhos).subs({phs: Rational(1, 3)}), Rational(1, 3))   # phi is the angle from the z-axis
same(integrate(x*y**2 + exp(x), (y, 0, 2), (x, 0, 1)), integrate(x*y**2 + exp(x), (x, 0, 1), (y, 0, 2)))   # Fubini
Rq, hq = symbols('R_q h_q', positive=True)
same(integrate(rs, (rs, 0, Rq), (ths, 0, 2*pi)), pi*Rq**2)                         # a disc
same(integrate(rs, (zs, 0, hq), (rs, 0, Rq), (ths, 0, 2*pi)), pi*Rq**2*hq)          # a cylinder
same(integrate(rhos**2*sin(phs), (rhos, 0, Rq), (phs, 0, pi), (ths, 0, 2*pi)), Rational(4, 3)*pi*Rq**3)   # a ball
disc_gauss = integrate(exp(-rs**2)*rs, (rs, 0, Rq), (ths, 0, 2*pi))
same(disc_gauss, pi*(1 - exp(-Rq**2))); limit_is(disc_gauss, Rq, oo, pi)
same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi))
# x = u + v, y = u - v (Jacobian -2) maps the unit square onto the square with corners (0,0), (1,1), (2,0), (1,-1)
uc, vc = symbols('u_c v_c')
Jc = Matrix([uc + vc, uc - vc]).jacobian([uc, vc]).det(); same(Jc, -2)
direct = integrate(x**2, (y, -x, x), (x, 0, 1)) + integrate(x**2, (y, x - 2, 2 - x), (x, 1, 2))
same(integrate((uc + vc)**2*Abs(Jc), (uc, 0, 1), (vc, 0, 1)), direct); same(direct, Rational(7, 3))
# a uniform half disc y >= 0 of radius R: y-bar = 4R/(3 pi), as found with one variable
mh = integrate(1*rs, (rs, 0, Rq), (ths, 0, pi)); same(mh, pi*Rq**2/2)
same(integrate(rs*sin(ths)*rs, (rs, 0, Rq), (ths, 0, pi))/mh, 4*Rq/(3*pi))
same(integrate(rs*cos(ths)*rs, (rs, 0, Rq), (ths, 0, pi))/mh, 0)
```

### 向量微积分 {#vector-calculus}

[模块 20](module_20_ZH.html) 教授这些内容。$\vb{F} = \langle P, Q, R\rangle$ 是一个向量场，且
$C$ 是参数 $a\le t\le b$ 下由 $\vb{r}(t)$ 描绘的有向光滑路径。对于分段光滑的路径，
将其各段的积分相加。

| 要点 | 公式 | 适用条件 |
|---|---|---|
| 函数的线积分 | ${\displaystyle\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\,\norm{\vb{r}'(t)}\,dt}$ | ${f}$ 在 ${C}$ 上连续 |
| 场的线积分（功） | ${\displaystyle\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt}$ | ${\vb{F}}$ 在 ${C}$ 上连续。路径反转会使积分取反 |
| 线积分的基本定理 | ${\displaystyle\int_C \nabla f\cdot d\vb{r} = f\big(\vb{r}(b)\big) - f\big(\vb{r}(a)\big)}$ | ${f}$ 在 ${C}$ 的邻域内可微且梯度连续 |
| 保守场 | 存在 ${f}$ 使 ${\langle P, Q\rangle = \nabla f}$，当且仅当 ${P_y = Q_x;}$；在空间中，${\vb{F} = \nabla f}$ 当且仅当 ${\operatorname{curl}\vb{F} = \vb{0}}$ | 开单连通区域（连通，且每条闭曲线都可在区域内连续收缩为一点）内的一阶偏导数连续 |
| 旋度 | ${\operatorname{curl}\vb{F} = \nabla\times\vb{F} = \langle R_y - Q_z,\ P_z - R_x,\ Q_x - P_y\rangle}$ | 下标表示偏导数： ${R_y = \partial R/\partial y}$ |
| 发散 | ${\operatorname{div}\vb{F} = \nabla\cdot\vb{F} = P_x + Q_y + R_z}$ |  |
| 恒等式 | ${\operatorname{curl}(\nabla f) = \vb{0},}$ ${\ \operatorname{div}(\operatorname{curl}\vb{F}) = 0}$ | 连续二阶偏导数 |
| 曲面积分 | ${\displaystyle\iint_S f\,dS = \iint_D f\big(\vb{r}(u, v)\big)\,\norm{\vb{r}_u\times\vb{r}_v}\,du\,dv}$ | ${f}$ 在 ${S}$ 上连续，具有一个光滑参数化，覆盖 ${S}$ 一次，除了可能的边界重复 |
| 通量 | ${\displaystyle\iint_S \vb{F}\cdot d\vb{S} = \iint_D \vb{F}\big(\vb{r}(u, v)\big)\cdot(\vb{r}_u\times\vb{r}_v)\,du\,dv}$ | 相同的参数化，其中 ${\vb{F}}$ 连续且 ${\vb{r}_u\times\vb{r}_v}$ 指向 ${S}$ 所选的一侧 |

单连通性使这个导数判别法成为充分条件。即使在有孔的区域上，
只要存在势函数，向量场仍为保守场。作为该判别法无法推出势函数存在的例子，向量场 $\vb{F} = \dfrac{\langle -y, x\rangle}{x^2 + y^2}$
在原点之外满足 $\partial P/\partial y = \partial Q/\partial x$，但它沿单位圆逆时针一周的
线积分为 $2\pi$，故在挖去原点的平面上并非保守场。

| 定理 | 公式 | 适用条件 |
|---|---|---|
| 格林定理 | ${\displaystyle\oint_C P\,dx + Q\,dy = \iint_D \Big(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\Big)\,dA}$ | ${C}$ 一条按逆时针方向绘制的分段光滑简单闭合曲线，包围 ${D;}$ ${P,}$ ${Q}$，在包含 ${D}$ 的开区域上，其一阶偏导数连续 |
| 格林定理计算面积 | ${A = \dfrac12\displaystyle\oint_C x\,dy - y\,dx}$ | 与 ${C}$ 和 ${D}$ 相同 |
| 斯托克斯定理 | ${\displaystyle\oint_C \vb{F}\cdot d\vb{r} = \iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}}$ | ${S}$ 有定向且分段光滑，具有分段光滑简单闭合边界 ${C}$，由 ${S}$ 定向。场在 ${S}$ 的邻域内一阶偏导数连续 |
| 散度定理 | ${\displaystyle\iint_S \vb{F}\cdot d\vb{S} = \iiint_E \operatorname{div}\vb{F}\,dV}$ | ${S}$ 是一个有界实体 ${E}$ 的向外定向的分段光滑边界。场在 ${E}$ 的邻域内一阶偏导数连续 |

五个基本定理（微积分基本定理、线积分基本定理、格林定理、斯托克斯定理和散度
定理）结构相同：在区域上对导数积分，得到对应的边界表达式。边界可以是区间或曲线的两个端点、曲面的边缘，或
立体区域的表面。

```check
from sympy.vector import CoordSys3D, curl as v_curl, divergence as v_div
curl_ = lambda F_: Matrix([diff(F_[2], y) - diff(F_[1], z), diff(F_[0], z) - diff(F_[2], x), diff(F_[1], x) - diff(F_[0], y)])
div_ = lambda F_: diff(F_[0], x) + diff(F_[1], y) + diff(F_[2], z)
grad_ = lambda f_: Matrix([diff(f_, w_) for w_ in (x, y, z)])
at = lambda e_, rv: e_.subs({x: rv[0], y: rv[1], z: rv[2]}, simultaneous=True)   # e evaluated on r(t) or r(u, v)
# the component formulas agree with sympy.vector on a field; the identities hold for every field
N3 = CoordSys3D('N3'); Fi = Matrix([x*y**2, y*z**3, z*x + sin(x*y)]); sub3 = {x: N3.x, y: N3.y, z: N3.z}
Fv = Fi[0].subs(sub3)*N3.i + Fi[1].subs(sub3)*N3.j + Fi[2].subs(sub3)*N3.k
same(v_curl(Fv).to_matrix(N3), curl_(Fi).subs(sub3)); same(v_div(Fv), div_(Fi).subs(sub3))
Fg = Matrix([Function(nm)(x, y, z) for nm in ('P', 'Q', 'R')]); fg = Function('f')(x, y, z)
same(curl_(grad_(fg)), zeros(3, 1)); same(div_(curl_(Fg)), 0)
# line integrals: one turn of the helix (cos t, sin t, t) has length 2 pi sqrt(2) (unrolled: legs 2 pi and 2 pi)
tr = symbols('t_r', real=True)
hel = Matrix([cos(tr), sin(tr), tr]); speed = sqrt(hel.diff(tr).dot(hel.diff(tr)))
same(speed, sqrt(2)); same(integrate(speed, (tr, 0, 2*pi)), 2*pi*sqrt(2))
Fc = Matrix([-y, x, 0]); circ = Matrix([cos(t), sin(t), 0])
W1 = integrate(at(Fc, circ).dot(circ.diff(t)), (t, 0, 2*pi)); same(W1, 2*pi)
circ_back = Matrix([cos(-t), sin(-t), 0]); same(integrate(at(Fc, circ_back).dot(circ_back.diff(t)), (t, 0, 2*pi)), -W1)
# fundamental theorem for line integrals, on half a turn of the helix
fh = x**2*y + y*z + z**2
same(integrate(at(grad_(fh), hel).dot(hel.diff(tr)), (tr, 0, pi)), at(fh, hel).subs(tr, pi) - at(fh, hel).subs(tr, 0))
# conservative: <2xy, x^2 + 3y^2> = grad(x^2 y + y^3); the field with a hole at the origin is not
same(diff(2*x*y, y), diff(x**2 + 3*y**2, x)); same(Matrix([diff(x**2*y + y**3, x), diff(x**2*y + y**3, y)]), Matrix([2*x*y, x**2 + 3*y**2]))
Fsp = Matrix([y*z, x*z, x*y]); same(curl_(Fsp), zeros(3, 1)); same(grad_(x*y*z), Fsp)   # in space: curl 0, and a potential
Ph, Qh = -y/(x**2 + y**2), x/(x**2 + y**2); same(diff(Ph, y), diff(Qh, x))
same(integrate(at(Matrix([Ph, Qh, 0]), circ).dot(circ.diff(t)), (t, 0, 2*pi)), 2*pi)
# Green's theorem on the unit disc and on the unit square (anticlockwise)
Pg, Qg = -y + x**2, x + x*y
lhs_g = integrate(at(Matrix([Pg, Qg, 0]), circ).dot(circ.diff(t)), (t, 0, 2*pi))
rhs_g = integrate((diff(Qg, x) - diff(Pg, y)).subs({x: rs*cos(ths), y: rs*sin(ths)})*rs, (rs, 0, 1), (ths, 0, 2*pi))
same(lhs_g, rhs_g); same(rhs_g, 2*pi)
Ps, Qs = x*y**2, x**3 + y
edges = [Matrix([t, 0, 0]), Matrix([1, t, 0]), Matrix([1 - t, 1, 0]), Matrix([0, 1 - t, 0])]
lhs_s = sum(integrate(at(Matrix([Ps, Qs, 0]), e_).dot(e_.diff(t)), (t, 0, 1)) for e_ in edges)
same(lhs_s, integrate(diff(Qs, x) - diff(Ps, y), (x, 0, 1), (y, 0, 1))); same(lhs_s, Rational(1, 2))
ae, be_e = symbols('a_e b_e', positive=True); ell = Matrix([ae*cos(t), be_e*sin(t), 0])   # an ellipse: area pi a b
same(integrate((ell[0]*ell.diff(t)[1] - ell[1]*ell.diff(t)[0])/2, (t, 0, 2*pi)), pi*ae*be_e)
# surfaces: the unit sphere r(phi, theta); r_phi x r_theta = sin(phi) r points outwards and has length sin(phi) >= 0
Sr = Matrix([sin(phs)*cos(ths), sin(phs)*sin(ths), cos(phs)]); Nr = Sr.diff(phs).cross(Sr.diff(ths))
same(Nr, sin(phs)*Sr); same(Nr.dot(Nr), sin(phs)**2)
same(integrate(sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), 4*pi)  # the area of the unit sphere
# Stokes: F = <z, x, y> on the upper unit hemisphere (normal outwards) and its boundary circle (anticlockwise)
Fs = Matrix([z, x, y])
flux_curl = integrate(at(curl_(Fs), Sr).dot(Nr), (phs, 0, pi/2), (ths, 0, 2*pi))
same(flux_curl, integrate(at(Fs, circ).dot(circ.diff(t)), (t, 0, 2*pi))); same(flux_curl, pi)
# divergence theorem: F = <x^3, y^3, z^3> on the unit ball: both sides are 12 pi / 5
Fd = Matrix([x**3, y**3, z**3])
flux_d = integrate(at(Fd, Sr).dot(Nr), (phs, 0, pi), (ths, 0, 2*pi))
vol_d = integrate(at(div_(Fd), rhos*Sr)*rhos**2*sin(phs), (rhos, 0, 1), (phs, 0, pi), (ths, 0, 2*pi))
same(flux_d, vol_d); same(vol_d, Rational(12, 5)*pi)
```

## SymPy 命令 {#sympy}

下表列出本系列「动手计算」栏在执行 `import sympy as sp` 后使用的命令。
模块一列指向相应的讲解和例题。

| 命令 | 它的作用 | 模块 |
|---|---|---|
| `sp.symbols('x n')` | 创建符号：`x, n = sp.symbols('x n')`; `positive=True` 添加一个假设 | [1](module_01_ZH.html), [6](module_06_ZH.html) |
| `f.subs(x, 2)` | 在 `f` 中用 ${2}$ 替换 ${x}$ | [1](module_01_ZH.html) |
| `sp.expand(f)` | 展开乘积和幂 | [1](module_01_ZH.html) |
| `sp.factor(f)` | 因式分解 | [1](module_01_ZH.html) |
| `sp.simplify(f)` | 简化 | [1](module_01_ZH.html) |
| `sp.N(f, 10)` | `f` 在 10 位有效数字精度下的数值近似 | [1](module_01_ZH.html) |
| `sp.lambdify(x, f)` | 将 `f` 转换为可调用的函数以进行数值评估 | [1](module_01_ZH.html) |
| `sp.log(x)` | ${\ln x,}$ 保持原样 `math.log(x)`; `sp.log(x, 10)` 是 ${\log_{10} x}$ | [1](module_01_ZH.html) |
| `sp.limit(f, x, a, '+-')` | 当 ${x \to a;}$ 时的极限。省略 `'+-'` 时，SymPy 默认取右极限（`'+'`）；`'-'` 表示取左极限 | [2](module_02_ZH.html) |
| `sp.oo` | ${\infty,}$ 如 `sp.limit(f, x, sp.oo)` 所示 | [2](module_02_ZH.html), [3](module_03_ZH.html) |
| `sp.diff(f, x)` | 导数；`sp.diff(f, x, 2)` 是二阶导数 | [4](module_04_ZH.html) |
| `sp.solve(f, x)` | 试图解 ${f=0}$ 对于 `x`。当它解一个方程对于一个符号时，它返回一个列表 | [8](module_08_ZH.html) |
| `sp.summation(a, (n, 1, N))` | 求和 ${\sum_{n=1}^{N} a;}$；${N}$ 可以是 `sp.oo` | [9](module_09_ZH.html), [14](module_14_ZH.html) |
| `sp.integrate(f, x)` | 试图找到一个原函数，不带 ${+\,C}$ | [10](module_10_ZH.html) |
| `sp.integrate(f, (x, a, b))` | 试图计算定积分 ${\int_a^b f\,dx}$ | [10](module_10_ZH.html) |
| `sp.dsolve(eq, y(x))` | 试图解微分方程；首先 `y = sp.Function('y')` | [13](module_13_ZH.html) |
| `sp.series(f, x, a, n)` | 在 ${a}$ 附近展开到 ${n}$ 阶，通常带有 ${O\big((x-a)^n\big)}$ 余项。泰勒展开是普通非负整数幂的情况 | [15](module_15_ZH.html) |

::: compute 一段程序中的 11 个命令

```python
import sympy as sp
x, n = sp.symbols('x n')
y = sp.Function('y')
f = x**2 * sp.exp(x)
print("diff:     ", sp.diff(f, x))
print("integrate:", sp.integrate(f, x))
print("definite: ", sp.integrate(f, (x, 0, 1)))
print("limit:    ", sp.limit(sp.sin(x)/x, x, 0, '+-'))
print("series:   ", sp.series(sp.cos(x), x, 0, 6))
print("solve:    ", sp.solve(x**2 - 5*x + 6, x))
print("summation:", sp.summation(1/n**2, (n, 1, sp.oo)))
print("dsolve:   ", sp.dsolve(y(x).diff(x) - 2*y(x), y(x)))
print("N:        ", sp.N(sp.pi, 10))
print("simplify: ", sp.simplify(sp.sin(x)**2 + sp.cos(x)**2))
print("lambdify: ", sp.lambdify(x, f)(1.0))
```

```output
diff:      x**2*exp(x) + 2*x*exp(x)
integrate: (x**2 - 2*x + 2)*exp(x)
definite:  -2 + E
limit:     1
series:    1 - x**2/2 + x**4/24 + O(x**6)
solve:     [2, 3]
summation: pi**2/6
dsolve:    Eq(y(x), C1*exp(2*x))
N:         3.141592654
simplify:  1
lambdify:  2.718281828459045
```

:::

SymPy 用 `E` 表示 $e$，用 `exp(x)` 表示 $e^x$，因此定积分为 $e - 2$。
原函数 $(x^2 - 2x + 2)e^x$ 不带 $+\,C$，而 `dsolve` 命名其任意常数
`C1`。$\cos x$ 的级数在 $x^6$ 之前截断，用 `O(x**6)` 表示截断项。`sp.N` 将 $\pi$ 计算到 10 位
有效数字，由 `sp.lambdify` 构造的函数返回普通浮点数：
$e^1 \approx 2.718281828459045$.

```check
f_s = x**2*exp(x)
same(diff(f_s, x), x**2*exp(x) + 2*x*exp(x)); antideriv((x**2 - 2*x + 2)*exp(x), f_s, x)
same(integrate(f_s, (x, 0, 1)), E - 2); limit_is(sin(x)/x, x, 0, 1)
same(series(cos(x), x, 0, 6).removeO(), 1 - x**2/2 + x**4/24)
same_set(solve(x**2 - 5*x + 6, x), [2, 3]); same(summation(1/n**2, (n, 1, oo)), pi**2/6)
C1s = symbols('C1'); yC = C1s*exp(2*x); same(diff(yC, x) - 2*yC, 0)
same(dsolve(Eq(yf(x).diff(x), 2*yf(x)), yf(x)), Eq(yf(x), yC))
same(sin(x)**2 + cos(x)**2, 1); rounds(pi, '3.141592654'); rounds(E, '2.718281828459045')
```
