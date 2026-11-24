---
title: 对称矩阵和二次型
part: 3
minutes: 80
needs: 模块 7 和 9
lead: 找出正交主方向并分类二次型的符号。
goals:
  - 使用实对称矩阵的正交特征基
  - 从特征值读取二次型的符号
  - 将特征值与水平曲线的形状联系起来
---

## 正交的特征向量 {#spectral}

一个实 **对称矩阵** 满足 $A^\mathsf T=A$。假设 $A\mathbf u=\lambda\mathbf u$ 和 $A\mathbf v=\mu\mathbf v$。对称性给出 $(A\mathbf u)\cdot\mathbf v=\mathbf u\cdot(A\mathbf v)$。如果 $\lambda\ne\mu$，这将导致 $\mathbf u\cdot\mathbf v=0$。

**谱定理**表明，每个实对称矩阵都有一组由实特征向量构成的标准正交基。先说明如何找到第一个方向。量 $\mathbf v^\mathsf TA\mathbf v$ 在紧致的单位球面上取得最大值。设取到最大值的单位向量为 $\mathbf v$，单位向量 $\mathbf w$ 与它垂直，则沿单位方向 $(\mathbf v+t\mathbf w)/\sqrt{1+t^2}$ 取不到更大的值。展开并消去分母可得
$$
2t\,\mathbf w^\mathsf TA\mathbf v+t^2(\mathbf w^\mathsf TA\mathbf w-\mathbf v^\mathsf TA\mathbf v)\le 0.
$$
$t$ 的一次项系数必须为零。否则，足够小的 $t$ 且符号与该系数相同会使左边为正。因此 $A\mathbf v$ 与 $\mathbf v$ 平行。对称性使得其正交补空间不变。在该空间中重复上述论证，直到得到一组标准正交基。将这些向量作为 $Q$ 的列，写出 $A=Q\Lambda Q^\mathsf T$。

## 主坐标下的形状 {#forms}

$A$ 的**二次型**是 $q(\mathbf x)=\mathbf x^\mathsf TA\mathbf x$。用特征向量坐标 $\mathbf z=Q^\mathsf T\mathbf x$ 表示，就变为 $\sum_i\lambda_i z_i^2$。若所有特征值都为正，则二次型**正定**。若所有特征值都非负，则二次型**半正定**，其中零特征值对应一个平坦方向。若特征值有正有负，则二次型**不定**。

::: example 旋转的碗
对于 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$，单位方向是 $(1,1)^\mathsf T/\sqrt2$ 和 $(1,-1)^\mathsf T/\sqrt2$，对应的特征值为 $3$ 和 $1$。在这些坐标下，该型为 $3z_1^2+z_2^2$。值为一的等高线在第一个轴上距离为 $1/\sqrt3$，在第二个轴上距离为一。
```check
A10=Matrix([[2,1],[1,2]])
Q10=Matrix([[1,1],[1,-1]])/sqrt(2)
same(Q10.T*A10*Q10,diag(3,1)); same(Q10.T*Q10,eye(2))
```
:::

::: widget name=spectra
比较主方向和对称预设的等高线。尝试正定型、不定型和存在平坦方向的类型。
:::

::: compute 特征值和一个二次型
```python
from sympy import Matrix

A = Matrix([[2, 1], [1, 2]])
x = Matrix([1, -1])
print(sorted(A.eigenvals()))
print((x.T * A * x)[0])
```
```output
[1, 3]
2
```
:::

## 练习 {#exercises}

:::: exercise 平坦方向 {#ex-10-1} ★
分类 $q(x,y)=4x^2$，并给出一个使其为零的非零向量。
::: solution
其矩阵的特征值为 $4$ 和 $0$。该型为半正定，并在 $(0,1)^\mathsf T$ 处为零。
```check
same(list(diag(4,0).eigenvals()),[4,0])
same((Matrix([[0,1]])*diag(4,0)*Matrix([0,1]))[0],0)
```
:::
::::

:::: exercise 鞍点方向 {#ex-10-2} ★★
判断 $q(x,y)=2xy$ 的值在其在 $(1,1)$ 和 $(1,-1)$ 处的取值。
::: solution
这些值为 $2$ 和 $-2$。其形式为不定型。其对称矩阵的非对角线元素为一，对角线元素为零。
```check
A10=Matrix([[0,1],[1,0]])
same([(v.T*A10*v)[0] for v in (Matrix([1,1]),Matrix([1,-1]))],[2,-2])
```
:::
::::

:::: exercise 一个均匀的下界 {#ex-10-3} ★★★
证明 $2\|\mathbf x\|^2\le\mathbf x^\mathsf TA\mathbf x$ 当对称矩阵 $A$ 的每个特征值至少为 $2$ 时成立。给出一个等号成立的例子。
::: solution
使用标准正交特征向量坐标系，其中平方范数为 $\sum_i z_i^2$。每个差值 $(\lambda_i-2)z_i^2$ 非负。当特征值为 $2$ 的特征向量时，例如 $\operatorname{diag}(2,5)$ 的第一个坐标向量，达到等号。
```check
v10=Matrix([x,y])
same((v10.T*diag(2,5)*v10)[0]-2*v10.dot(v10),3*y**2)
```
:::
::::

## 自测 {#quiz}

```quiz
? 哪些矩阵根据谱定理具有正交的实特征基？
- [ ] 每个可逆实矩阵
- [x] 每个实对称矩阵
- [ ] 每个三角实矩阵
> 对称性提供不变的正交补空间，从而通过归纳法给出一个基。

? 半正定二次型有零特征值意味着什么？
- [x] 形式在非零方向上消失
- [ ] 形式在该方向上为负
- [ ] 形式在所有地方为零
> 一个特征值为零的特征向量给出的二次值为零。

? 在主坐标下，平方项的系数是什么？
- [ ] $Q$ 的元素
- [ ] $A$ 在原始基下的对角线元素
- [x] 特征值
> 正交对角化将一个独立平方坐标的和保留下来。
```
