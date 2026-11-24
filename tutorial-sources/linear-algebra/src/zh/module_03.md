---
title: 矩阵与线性映射
part: 1
minutes: 80
needs: 模块 1 和 2
lead: 通过列来读取矩阵，组合变换，并区分线性映射与仿射映射。
goals:
  - 将矩阵的维度与其输入和输出进行匹配
  - 从坐标向量的像构建矩阵
  - 组合映射并应用转置规则
---

## 矩阵如何作用于向量 {#maps}

线性映射保持加法和数乘。这两个性质结合起来得到 $T(a\mathbf u+b\mathbf v)=aT(\mathbf u)+bT(\mathbf v)$。特别是，它将零向量映射到零向量。一个具有 $m$ 行和 $n$ 列的矩阵将 $\mathbb R^n$ 中的向量映射到 $\mathbb R^m$ 中的向量。它的列表示坐标向量的像。

::: example 构建剪切变换的矩阵
设 $T(x,y)=(x+2y,y)$。第一个坐标向量映射到 $(1,0)$，第二个映射到 $(2,1)$。因此该矩阵的列是 $(1,0)^\mathsf T$ 和 $(2,1)^\mathsf T$。在 $(0,3)$ 处其输出为 $(6,3)$，即第二列的三倍。
```check
A3=Matrix([[1,2],[0,1]])
same(A3*Matrix([0,3]),Matrix([6,3]))
```
:::

::: widget name=matrices
将矩阵作用于正方形和 $(1,1)^\mathsf T$。从单位矩阵开始，尝试剪切变换和列相关矩阵。注意正方形发生了什么变化。
:::

## 组合与转置 {#composition}

先应用 $B$，再应用 $A$，就得到复合映射 $AB$。它的 $j$ 列是 $A$ 应用于 $B$ 的第 $j$ 列。内维数必须一致。如果 $A$ 是 $m\times n$ 且 $B$ 是 $n\times p$，则 $AB$ 是 $m\times p$。

**转置** 交换行与列。在元素级别，$(AB)_{ij}=\sum_k A_{ik}B_{kj}$。交换 $i$ 和 $j$ 给出 $(AB)^\mathsf T=B^\mathsf TA^\mathsf T$。顺序反转。

::: example 一个缩放和一个剪切
设 $S=\begin{pmatrix}2&0\\0&1\end{pmatrix}$ 和 $H=\begin{pmatrix}1&1\\0&1\end{pmatrix}$。在 $(0,1)$ 上，先剪切再缩放得到 $(2,1)$，而先缩放再剪切得到 $(1,1)$。两种组合都存在并给出不同的映射。
```check
S3,H3=Matrix([[2,0],[0,1]]),Matrix([[1,1],[0,1]])
same(S3*H3*Matrix([0,1]),Matrix([2,1]))
same(H3*S3*Matrix([0,1]),Matrix([1,1]))
same((S3*H3).T,H3.T*S3.T)
```
:::

## 仿射映射 {#affine}

形如 $A\mathbf x+\mathbf b$ 的映射是 **仿射映射**。它的平移项将每个输出移动相同量。它恰好是线性映射当且仅当 $\mathbf b=\mathbf 0$。如果坐标表示地图上的点，平移原点会改变位置但保持每个位移由 $A$ 转换。

::: compute 比较两个乘积
```python
from sympy import Matrix

scale = Matrix([[2, 0], [0, 1]])
shear = Matrix([[1, 1], [0, 1]])
print((scale * shear).tolist())
print((shear * scale).tolist())
```
```output
[[2, 2], [0, 1]]
[[2, 1], [0, 1]]
```
:::

## 练习 {#exercises}

:::: exercise 形状 {#ex-3-1} ★
如果 $A$ 是 $4\times2$ 并且 $B$ 是 $2\times3$，给出 $AB$ 的形状。$BA$ 是否存在？
::: solution
$AB$ 通过 $\mathbb R^2$ 将 $\mathbb R^3$ 映射到 $\mathbb R^4$，因此形状是 $4\times3$。$BA$ 的内维数是 $3$ 和 $4$，因此是未定义的。
```check
same((zeros(4,2)*zeros(2,3)).shape,(4,3))
holds(zeros(2,3).cols!=zeros(4,2).rows)
```
:::
::::

:::: exercise 反射 {#ex-3-2} ★★
找出关于直线 $y=x$ 的反射矩阵。
::: solution
反射交换坐标，因此交换两个坐标向量。其矩阵是 $\begin{pmatrix}0&1\\1&0\end{pmatrix}$。应用两次得到单位矩阵。
```check
R3=Matrix([[0,1],[1,0]])
same(R3*Matrix([x,y]),Matrix([y,x])); same(R3**2,eye(2))
```
:::
::::

:::: exercise 识别平移 {#ex-3-3} ★★★
证明 $F(x,y)=(x+1,2y)$ 是仿射的。它对位移 $(h,k)$ 应用了什么变换？
::: solution
写出 $F(\mathbf x)=\operatorname{diag}(1,2)\mathbf x+(1,0)^\mathsf T$。差值 $F(x+h,y+k)-F(x,y)$ 是 $(h,2k)$。平移在差值中相互抵消。
```check
same(Matrix([x+h+1,2*(y+k)])-Matrix([x+1,2*y]),Matrix([h,2*k]))
```
:::
::::

## 自测 {#quiz}

```quiz
? 哪个映射是线性的？
- [ ] $x\mapsto x+1$
- [x] $x\mapsto -3x$
- [ ] $x\mapsto x^2$
> 缩放保持加法和标量乘法。平移在零点失效，平方改变缩放规则。

? 在 $AB\mathbf v$ 中，哪个映射首先作用于向量？
- [x] $B$
- [ ] $A$
- [ ] 同时进行
> 将其读作 $A(B\mathbf v)$。

? 一个 $3\times5$ 矩阵的转置的形状是什么？
- [ ] $3\times5$
- [ ] $5\times5$
- [x] $5\times3$
> 行变为列，列变为行。
```
