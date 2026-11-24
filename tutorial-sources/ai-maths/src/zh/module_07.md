---
title: 浮点运算与数值稳定的 softmax
part: 4
minutes: 70
needs: 模块 4 和指数
lead: 平移 logits 以避免指数溢出，再计算 softmax 和目标词元的对数概率。
goals:
  - 解释为何有限浮点数会丢失一个微小的加数
  - 推导一个移位后的 log-sum-exp 表达式
  - 计算目标对数概率，而不对舍入后的softmax概率取对数
---

## 舍入与范围 {#precision}

有限浮点格式会将大多数实数舍入到附近的可表示值。在 binary64 中，紧接在 $1$ 上方的可表示数是 $1+2^{-52}$。在舍入到最近值的模式下，将 $2^{-54}$ 加到 $1$ 上，舍入后的结果保持为 $1$。在更大的数值范围内，相邻数之间的差距会增大。浮点数也有有限的指数范围。一个较大的指数可能会溢出，而足够小的正指数可能会舍入为零。

在混合精度计算中，存储、乘积和累加的格式选择可能不同。在更宽的精度中累加降低精度的乘积，可以减少求和过程中的额外舍入。它无法恢复在值转换为更窄格式时已经丢失的位。

## 先平移，再取指数 {#stable}

对一个非空的有限logits向量定义 $\operatorname{LSE}(z)=\ln\sum_i e^{z_i}$。设置 $m=\max_i z_i$。将 $e^m$ 从求和中提取出来以获得
$$
\operatorname{LSE}(z)=m+\ln\sum_i e^{z_i-m},
\qquad
\log q_j=(z_j-m)-\ln\sum_i e^{z_i-m}.
$$
平移后，各项的指数值都不超过一，并且至少有一项等于一。这可以避免有限输入的指数溢出。当你需要对数概率时，可以直接使用第二个表达式。从一个非常大的 $z_j$ 中减去一个舍入后的 $m+\ln\sum_i e^{z_i-m}$ 可能会丢失精度。此外，对一个舍入后的 softmax 结果取对数，当一个极小概率舍入为零时，可能会失败。有限 logit 之间的极大差异本身也可能超出浮点数范围。

::: example 两个较大且相近的 logit
对于 logit $(1000,1001)$，减去 $1001$ 得到 $(-1,0)$。第二个标记的概率为 $1/(1+e^{-1})\approx0.7311$，对数概率为 $-\ln(1+e^{-1})\approx-0.3133$。直接计算 $1001$ 的指数在 binary64 中会溢出。
```check
rounds((1/(1+exp(-1))),"0.7310585786")
rounds((-log(1+exp(-1))),"-0.3132616875")
```
:::

::: compute 使用移位后的坐标进行计算
在一个 logit 相差一千的第二向量上运行相同的计算。尽管其指数舍入为零，较小的对数概率仍然保持有限。
```python
from math import exp, fsum, log

for logits, target in [([1000.0, 1001.0], 1), ([0.0, -1000.0], 1)]:
    largest = max(logits)
    shifted = [value - largest for value in logits]
    log_normalizer = log(fsum(exp(value) for value in shifted))
    print(f"{shifted[target] - log_normalizer:.4f}")
```
```output
-0.3133
-1000.0000
```
:::

## 练习 {#exercises}

:::: exercise 相等的 logit {#ex-7-1} ★
找出四个相等有限 logit 分配的概率。
::: solution
移位之后，每个指数都等于一。每个概率为 $1/4$。
```check
same(exp(0)/(4*exp(0)),Rational(1,4))
```
:::
::::

:::: exercise 通过一个常数进行移位 {#ex-7-2} ★★
如果你将每个 logit 加上 $7$，那么 $\operatorname{LSE}(z)$ 和 softmax 会发生什么变化？
::: solution
提取 $e^7$ 会将 $7$ 加到对数求和指数中。它会在每个 softmax 概率的分子和分母之间相互抵消。
```check
same(log(exp(7)+exp(8))-log(1+exp(1)),7)
same(exp(8)/(exp(7)+exp(8)),exp(1)/(1+exp(1)))
```
:::
::::

:::: exercise 一个极小的目标概率 {#ex-7-3} ★★★
对于 logit $(0,-1000)$，给出第一个 token 的负对数概率位于零上方的范围上限。
::: solution
它等于 $\ln(1+e^{-1000})$。对于 $u>0$，$0<\ln(1+u)<u$，所以在精确计算中损失严格介于 $0$ 和 $e^{-1000}$ 之间。一个浮点数可以将其舍入为零。
```check
small1 = exp(-1000)
holds(small1.is_positive)
u1 = symbols('u', positive=True)
same(diff(u1-log(1+u1),u1),u1/(1+u1))
```
:::
::::

## 自测 {#quiz}

```quiz
? 为什么减去最大的 logit？
- [x] 每个平移后的指数最大为一，一等于一
- [ ] 每个平移后的指数大于一
- [ ] 平移使得所有 token 概率相等
> 最大的平移后的 logit 为零，其余为非正数。

? 哪种方法在 softmax 下溢时仍能返回有限的对数概率？
- [ ] 取舍入后的零概率的对数
- [x] 从平移后的目标 logit 中减去对数归一化项
- [ ] 将目标概率舍入为一
> 保持在对数尺度上表示大的负分数。

? 一个更大的累加器会带来什么变化？
- [ ] 它能够恢复在早期转换中丢失的原始输入数字。
- [ ] 它可以增加词汇量。
- [x] 它可以减少在累加过程中额外的舍入误差。
> 输入之前已经应用的舍入操作已经丢弃了部分信息。
```
