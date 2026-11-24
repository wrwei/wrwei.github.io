---
title: 条件概率与词元序列
part: 1
minutes: 60
needs: 分数和有限求和
lead: 计算词元序列的概率，再用贝叶斯公式交换条件与事件。
goals:
  - 区分联合概率、边缘概率和条件概率
  - 将各步条件概率相乘，得到序列概率
  - 根据观察到的词元更新先验概率
---

## 有限词汇表上的概率 {#vocabulary}

给定一个前缀，语言模型在整个词表上给出一个概率分布。每项概率非负，总和为一。每个词元都是离散结果，可以是词的一部分、标点或其他特殊符号。这里用字母和一个停止词元作例子。

对于事件 $A$ 和 $B$ 有 $P(B)>0$， $P(A\mid B)=P(A\cap B)/P(B)$。分母将样本空间限制为满足 $B$ 的结果。将各互斥情形下的联合概率相加，就得到边缘概率 $P(A)$。对于一个二元划分， $P(A)=P(A\cap B)+P(A\cap B^\mathsf c)$。

## 计算续写的概率 {#chain}

::: definition 概率链式法则
$$
P(t_1,\ldots,t_T)=\prod_{i=1}^T P(t_i\mid t_1,\ldots,t_{i-1}).
$$
对于给定的提示，将每个因子的条件都基于该提示。重复地将一个前缀及其下一个词的概率展开为乘积。指定路径上的因子就足够了，尽管每个因子来自于所有可能的下一个词的分布。对于一个完整的序列，包含停止词元的概率。当问题是序列是否以某个前缀开始时，停止词元是不必要的。
:::

::: example 前缀与完整字符串
一个模型给出 $P(A)=3/5$、$P(B\mid A)=1/4$ 和 $P(\mathrm{stop}\mid AB)=2/3$。以 $AB$ 开始的概率是 $3/20$。恰好发出 $AB$ 并停止的概率是 $1/10$。
```check
same(Rational(3,5)*Rational(1,4), Rational(3,20))
same(Rational(3,20)*Rational(2,3), Rational(1,10))
```
:::

## 交换条件与事件 {#bayes}

假设一个词元是由两个来源之一产生的，$S$ 或 $T$。如果 $P(S)=1/4$、$P(A\mid S)=3/5$ 和 $P(A\mid T)=1/5$，则 $P(A)=3/10$。贝叶斯公式将联合概率除以该边缘概率，得到 $P(S\mid A)=(3/20)/(3/10)=1/2$。

```check
a1 = Rational(1,4)*Rational(3,5)+Rational(3,4)*Rational(1,5)
same(a1,Rational(3,10))
same(Rational(1,4)*Rational(3,5)/a1,Rational(1,2))
```

::: widget name=bayes
在图中，用 D 表示来源 S，用阳性结果表示词元 A。将三个输入依次设为 25%、60% 和 20%，根据橙色列读出后验概率。减小 S 的先验概率，看看后验概率怎么变。
:::

::: compute 跟随一条路径
为示例的三个因子使用精确的有理数运算。稍后我们将添加对数概率来评分更长的路径。
```python
from fractions import Fraction
from math import prod

factors = [Fraction(3, 5), Fraction(1, 4), Fraction(2, 3)]
print(prod(factors[:2]))
print(prod(factors))
```
```output
3/20
1/10
```
:::

## 练习 {#exercises}

:::: exercise 缺失的概率 {#ex-1-1} ★
在前缀之后，词汇表是 $A,B,\mathrm{stop}$。$A$ 和 $B$ 的概率分别是 $0.3$ 和 $0.5$。求停止的概率。
::: solution
概率之和为一，因此停止的概率是 $0.2$。
```check
same(1-Rational(3,10)-Rational(1,2),Rational(1,5))
```
:::
::::

:::: exercise 另一条路径 {#ex-1-2} ★★
如果 $P(A)=1/4$ 和 $P(A\mid A)=2/5$，求 $P(AA)$ 作为前缀。
::: solution
两个因子是 $1/4$ 和 $2/5$，给出 $1/10$。
```check
same(Rational(1,4)*Rational(2,5),Rational(1,10))
```
:::
::::

:::: exercise 后验概率比 {#ex-1-3} ★★★
保持上面的两个源贝叶斯示例，但观察一个词元 $B$ 与 $P(B\mid S)=P(B\mid T)=1/5$。找出 $P(S\mid B)$。
::: solution
$P(B)=1/5$。其条件概率在任一源下相同，因此公共因子被抵消，后验保持为 $1/4$。
```check
same(Rational(1,4)*Rational(1,5)/Rational(1,5),Rational(1,4))
```
:::
::::

## 自测 {#quiz}

```quiz
? 在序列链式法则中相乘的是什么？
- [ ] 所有标记的无条件概率
- [x] 每个前缀之后的观察下一个标记的概率
- [ ] 单个前缀下每个词汇的概率
> 每个因子依赖于前面的标记。

? 在什么情况下可以除以 $P(B)$ 来定义 $P(A\mid B)$？
- [x] 当 $P(B)>0$
- [ ] 仅当 $P(A)=1$
- [ ] 每当 $A$ 和 $B$ 作为集合重叠时
> 条件概率公式要求分母为正。

? 当你在前缀末尾包含一个概率为 $1/2$ 的停止标记时会发生什么变化？
- [ ] 前缀概率翻倍
- [ ] 完成的序列具有与前缀相同的概率
- [x] 完成的序列具有前缀概率的一半
> 停止标记贡献了另一个条件因子
```
