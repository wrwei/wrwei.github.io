---
title: 正交性与 QR 分解
part: 2
minutes: 85
needs: 模块 1、4 和 5
lead: 投影到一个方向或子空间，构造一组标准正交基，并将矩阵分解为 QR。
goals:
  - 计算一个正交投影及其残差
  - 对独立列进行 Gram–Schmidt 过程
  - 理解简约 QR 分解中各矩阵的尺寸与含义
---

## 作垂线 {#projection}

要用 $c\mathbf u$ 逼近 $\mathbf b$（其中 $\mathbf u$ 非零），选择线上使得残差垂直于 $\mathbf u$ 的点。解 $\mathbf u\cdot(\mathbf b-c\mathbf u)=0$ 得到

$$
c=\frac{\mathbf u\cdot\mathbf b}{\mathbf u\cdot\mathbf u}.
$$

对于直线上的任意其他点，到 $\mathbf b$ 的平方距离等于相同垂直残差的平方长度加上沿直线的平方距离。勾股定理使得垂直足成为唯一最近点。

::: example 投影及其残差
对于 $\mathbf u=(1,2)^\mathsf T$ 和 $\mathbf b=(3,1)^\mathsf T$，系数是 $5/5=1$。投影是 $(1,2)^\mathsf T$，残差是 $(2,-1)^\mathsf T$。它们的点积为零。
```check
u7,b7=Matrix([1,2]),Matrix([3,1])
p7=u7*u7.dot(b7)/u7.dot(u7)
same(p7,Matrix([1,2])); same(b7-p7,Matrix([2,-1])); same(u7.dot(b7-p7),0)
```
:::

::: widget name=projections
选择欧几里得内积，然后移动目标并改变直线的方向。检查当直线方向非零时残差是否仍垂直于直线。
:::

## 标准正交基与 Gram–Schmidt 正交化 {#gram-schmidt}

如果一组向量的长度都为一，且两两正交，就称其为**标准正交向量组**。如果 $Q$ 的各列是一组标准正交基，则 $Q^\mathsf T\mathbf b$ 给出投影的系数。实际上， $Q^\mathsf TQ=I$ 和 $Q^\mathsf T(\mathbf b-QQ^\mathsf T\mathbf b)=0$。

**Gram–Schmidt 正交化**将线性无关的各列变为这样一组基。每一步，从下一列中减去其在已有标准正交列上的投影，再将所得残差归一化。由线性无关性，残差长度非零。每一步减掉的向量都在已有向量的张成空间内，所以新向量在每一步张成同样的空间。

## 简约 QR 分解 {#qr}

对于具有独立列的 $m\times n$ 矩阵 $A$，该过程得到 $A=QR$，其中 $Q$ 的形状为 $m\times n$，而 $R$ 是上三角形，形状为 $n\times n$。$A$ 的第 $j$ 列只用到 $Q$ 的前 $j$ 列。最新方向的系数是余向量的长度。在浮点运算中使用 QR 分解库。它可以使用正交反射来避免当列向量几乎相关时的正交性损失。

::: compute 检查两个性质
```python
from sympy import Matrix

A = Matrix([[1, 1], [1, 0], [0, 1]])
Q, R = A.QRdecomposition()
print((Q.T * Q).tolist())
print(Q * R == A)
```
```output
[[1, 0], [0, 1]]
True
```
:::

## 练习 {#exercises}

:::: exercise 投影到第一个坐标轴 {#ex-7-1} ★
将 $(3,4)^\mathsf T$ 投影到 $(2,0)^\mathsf T$。
::: solution
系数是 $6/4=3/2$，因此投影是 $(3,0)^\mathsf T$。剩余向量 $(0,4)^\mathsf T$ 与坐标轴垂直。
```check
u7=Matrix([2,0]); b7=Matrix([3,4])
same(u7*(u7.dot(b7)/u7.dot(u7)),Matrix([3,0]))
```
:::
::::

:::: exercise 一个 Gram–Schmidt 步骤 {#ex-7-2} ★★
按此顺序正交化 $(1,1)^\mathsf T,(1,0)^\mathsf T$。
::: solution
将第一个向量进行归一化处理 $(1,1)^\mathsf T/\sqrt2$。从第二个向量中减去 $(1/2,1/2)^\mathsf T$，保留 $(1/2,-1/2)^\mathsf T$。归一化处理后得到 $(1,-1)^\mathsf T/\sqrt2$。
```check
Q7=Matrix([[1,1],[1,-1]])/sqrt(2)
same(Q7.T*Q7,eye(2)); same(Q7.T*Matrix([[1,1],[1,0]]),Matrix([[sqrt(2),1/sqrt(2)],[0,1/sqrt(2)]]))
```
:::
::::

:::: exercise 投影两次 {#ex-7-3} ★★★
证明当 $Q$ 具有正交归一化列时 $(QQ^\mathsf T)^2=QQ^\mathsf T$ 成立。
::: solution
将中间因子关联为 $Q^\mathsf TQ=I$。乘积为 $QIQ^\mathsf T$。因此第二次投影将保留第一个结果不变。
```check
Q7=Matrix([1,2,2])/3
P7=Q7*Q7.T
same(P7**2,P7)
```
:::
::::

## 自测 {#quiz}

```quiz
? 为什么在非单位向量上的投影系数中会有分母？
- [x] 它考虑了方向向量的平方长度
- [ ] 它使每个投影成为一个单位向量
- [ ] 它使残差为零
> 求解垂直性条件时，需要除以向量与其自身的点积。

? 哪个恒等式适用于具有正交归一化列的高瘦矩阵 $Q$？
- [ ] $QQ^\mathsf T=I$ 在输出空间中
- [x] $Q^\mathsf TQ=I$ 在坐标空间中
- [ ] $Q^\mathsf TQ=0$
> 所有不同列之间的内积为零，且每个列的平方范数等于一。

? 如果Gram–Schmidt过程中下一个列位于之前列的张成空间中会发生什么？
- [ ] 剩余量是一个新的单位方向
- [ ] 下一列会自动变为正交
- [x] 剩余量为零
> 减去其投影会消除整个列，因此无法进行归一化。
```
