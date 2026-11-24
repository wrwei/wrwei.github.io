---
title: 特征值与对角化
part: 3
minutes: 85
needs: 模块 3–6
lead: 找出不变方向，并使用特征基来理解映射的重复应用。
goals:
  - 从特征方程找出特征值
  - 将特征空间作为零空间找出
  - 判断是否存在特征基，并使用它来计算幂次
---

## 方向在映射下保持不变 {#eigenpairs}

一个方阵 $A$ 的 **特征向量** 是一个非零向量 $\mathbf v$，使得 $A\mathbf v=\lambda\mathbf v$。其对应的特征值 $\lambda$ 记录了该方向上映射的作用。负值表示方向反转，零特征值是允许的，并表示非零核的存在。

对于候选 $\lambda$，条件是 $(A-\lambda I)\mathbf v=\mathbf 0$。非零解存在的充要条件是 $\det(A-\lambda I)=0$。首先找到这些根，然后对每个根解一个齐次方程组。整个核是 **特征空间**，包含零向量，尽管零向量本身不是特征向量。

::: example 三角矩阵的两个特征向量
对于 $A=\begin{pmatrix}2&1\\0&1\end{pmatrix}$，行列式多项式是 $(2-\lambda)(1-\lambda)$。当 $\lambda=2$ 时，取 $(1,0)^\mathsf T$。当 $\lambda=1$ 时，解 $x+y=0$ 并取 $(-1,1)^\mathsf T$。
```check
A9=Matrix([[2,1],[0,1]])
same((A9-x*eye(2)).det(),(2-x)*(1-x))
same(A9*Matrix([1,0]),2*Matrix([1,0])); same(A9*Matrix([-1,1]),Matrix([-1,1]))
```
:::

## 转换为特征向量坐标 {#diagonalisation}

如果 $A$ 有一个特征基，将特征向量作为 $P$ 的列，将对应的特征值按顺序放在 $D$ 的对角线上。然后 $AP=PD$，因此 $A=PDP^{-1}$。转换为特征向量坐标，独立地缩放每个坐标，然后转换回来。在幂 $A^k$ 中，中间的因子 $P^{-1}P$ 抵消，留下 $PD^kP^{-1}$。模长小于一的特征值对应的分量随 $k$ 增加而衰减。对于这个例子，$(0,1)^\mathsf T$ 是两个选定的特征向量之和，因此在 $k$ 步之后它变为 $(2^k-1,1)^\mathsf T$。

不同的特征值有独立的特征向量。在一个最简非平凡线性关系中，应用 $A-\lambda I$ 对于关系中的一个特征值会去掉该向量，留下一个更简短的非平凡关系。因此 $n$ 个不同的实特征值就足以构成一个实特征基。重复本身并不能得出结论。一些实矩阵也有复特征对，但没有实特征基。

::: compute 一个重复的特征值缺少一个方向
```python
from sympy import Matrix

A = Matrix([[1, 1], [0, 1]])
for value, multiplicity, basis in A.eigenvects():
    print(value, multiplicity, [list(v) for v in basis])
print((A**4).tolist())
```
```output
1 2 [[1, 0]]
[[1, 4], [0, 1]]
```
:::

## 练习 {#exercises}

:::: exercise 验证一个方向 {#ex-9-1} ★
对于 $A=\operatorname{diag}(-2,3)$ 找出 $(1,0)^\mathsf T$ 的特征值。
::: solution
第一列是 $(-2,0)^\mathsf T$，等于 $-2$ 乘以给定的方向。
```check
same(diag(-2,3)*Matrix([1,0]),-2*Matrix([1,0]))
```
:::
::::

:::: exercise 一个重复的根 {#ex-9-2} ★★
比较 $2I_2$ 和 $\begin{pmatrix}2&1\\0&2\end{pmatrix}$ 的特征基。
::: solution
每个非零向量都是 $2I_2$ 的特征向量，因此通常的坐标基可用。从另一个矩阵中减去 $2I_2$ 会迫使第二个坐标为零。只有一个独立的特征向量。
```check
same((2*eye(2)-2*eye(2)).nullspace(),[Matrix([1,0]),Matrix([0,1])])
same((Matrix([[2,1],[0,2]])-2*eye(2)).nullspace(),[Matrix([1,0])])
```
:::
::::

:::: exercise 反复应用 {#ex-9-3} ★★★
使用示例中的特征向量来找到 $A^5(0,1)^\mathsf T$。
::: solution
起始向量是每个特征向量的一个副本。将第一个向量乘以 $2^5=32$，并保留第二个向量。结果是 $(31,1)^\mathsf T$。
```check
same(A9**5*Matrix([0,1]),Matrix([31,1]))
```
:::
::::

## 自测 {#quiz}

```quiz
? 在一个特征对中，哪个量可能为零？
- [x] 特征值
- [ ] 特征向量
- [ ] 两者都必须为零
> 核中的非零向量是一个特征向量，对应特征值为零。

? 当一个实 $n\times n$ 矩阵必然具有实特征基时？
- [ ] 当它有一个重复的实特征值时
- [x] 当它有 $n$ 个不同的实特征值时
- [ ] 当它的行列式为正时
> 从不同特征值得到的特征向量是线性无关的。

? 在 $A=PDP^{-1}$ 中，$P$ 的列代表什么？
- [ ] 特征值
- [ ] $A$ 的行
- [x] 特征向量，顺序与 $D$ 中的特征值一致
> $AP=PD$ 的 $j$ 列是第 $j$ 个特征对方程。
```
