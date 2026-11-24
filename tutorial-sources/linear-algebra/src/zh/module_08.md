---
title: 最小二乘法与条件数
part: 2
minutes: 80
needs: 模块 5 和 7
lead: 通过将数据投影到列空间来拟合不一致数据，并评估系数的敏感性。
goals:
  - 构造一个用于拟合的设计矩阵
  - 从剩余正交性推导正规方程
  - 比较 QR 分解与正规方程用于数值求解
---

## 最接近可到达的观测值 {#least-squares}

假设 $\mathbf b$ 包含测量值，$A\mathbf x$ 是预测值的向量。可能不存在精确解。**最小二乘** 最小化 $\|A\mathbf x-\mathbf b\|^2$。拟合向量是 $\mathbf b$ 到列空间的正交投影，因为所有候选预测值都位于该空间中。剩余量 $\mathbf r=\mathbf b-A\widehat{\mathbf x}$ 与每一列正交。这给出了 **正规方程**

$$
A^\mathsf TA\widehat{\mathbf x}=A^\mathsf T\mathbf b.
$$

相反，这些方程的任何解都是通过平方距离分解得到的最小二乘解。即使系数不唯一，拟合向量也是唯一的。任何产生相同拟合的两个系数向量之间的差异是一个零空间向量。

::: example 拟合带有截距项的直线
对数据 $(0,1),(1,2),(2,2)$，按列顺序使用全为1的列和输入值。截距 $a$ 和斜率 $b$ 的正规方程分别为 $3a+3b=5$ 和 $3a+5b=6$。相减得到 $b=1/2$，然后得到 $a=7/6$。残差 $(-1/6,1/3,-1/6)$ 的和为零，且与 $(0,1,2)^\mathsf T$ 的点积也为零。
```check
A8=Matrix([[1,0],[1,1],[1,2]]); y8=Matrix([1,2,2])
x8=Matrix([Rational(7,6),S.Half]); r8=y8-A8*x8
same(A8.T*A8,Matrix([[3,3],[3,5]])); same(A8.T*y8,Matrix([5,6]))
same(r8,Matrix([-Rational(1,6),Rational(1,3),-Rational(1,6)])); same(A8.T*r8,zeros(2,1))
```
:::

## 使用 QR 分解求解 {#solve}

对于独立列，写出 $A=QR$，并将投影表示为 $QQ^\mathsf T\mathbf b$。在 $Q$ 的列中匹配系数得到 $R\widehat{\mathbf x}=Q^\mathsf T\mathbf b$。这是一个三角求解。它避免了形成 $A^\mathsf TA$，其条件数是 $A$ 条件数的平方。[模块 11](module_11_ZH.html#sizes) 推导了该比例。

观测值的小扰动在列近似相关时可能迫使系数发生较大变化。对于 $A=\begin{pmatrix}1&1\\0&\varepsilon\end{pmatrix}$，将第二个观测值增加 $\varepsilon$，会使第二个系数增加 $1$，第一个系数减少 $1$。预测值仅发生了一点变化。将小残差视为对测量拟合的证据，并分别检查灵敏度。

::: compute 使用 QR 分解求解线性拟合
```python
from sympy import Matrix

A = Matrix([[1, 0], [1, 1], [1, 2]])
b = Matrix([1, 2, 2])
Q, R = A.QRdecomposition()
x = R.upper_triangular_solve(Q.T * b)
print(list(x))
print(list(A.T * (b - A * x)))
```
```output
[7/6, 1/2]
[0, 0]
```
:::

::: compute 拟合浮点数据的直线

NumPy 的最小二乘求解器返回系数和一个数值秩。在解释结果之前，给列顺序命名。残差范数衡量观测坐标中拟合误差的大小。

```python
import numpy as np

x_data = np.array([0., 1., 2.])
y_data = np.array([1., 2., 2.])
design = np.column_stack((np.ones(x_data.size), x_data))
coefficients, _, rank, _ = np.linalg.lstsq(design, y_data, rcond=None)
residual = y_data - design @ coefficients
print(f"intercept={coefficients[0]:.3f}, slope={coefficients[1]:.3f}")
print(f"rank={rank}, residual norm={np.linalg.norm(residual):.3f}")
```
```output
intercept=1.167, slope=0.500
rank=2, residual norm=0.408
```
:::

## 练习 {#exercises}

:::: exercise 最佳常数 {#ex-8-1} ★
在最小二乘意义上，什么常数最适合 $1,4,7$？
::: solution
设计矩阵是一列全为1的列向量。残差正交性说明它们的和为零，因此拟合的常数是均值 $4$。
```check
same(Rational(1+4+7,3),4)
same(ones(1,3)*(Matrix([1,4,7])-4*ones(3,1)),zeros(1,1))
```
:::
::::

:::: exercise 带有冗余列的拟合 {#ex-8-2} ★★
对于 $A=\begin{pmatrix}1&1\\0&0\end{pmatrix}$ 和 $\mathbf b=(3,2)^\mathsf T$，找出拟合向量并描述所有系数。
::: solution
列空间是第一个坐标轴，因此拟合结果为 $(3,0)^\mathsf T$。任何带有 $x_1+x_2=3$ 的系数都能产生它，例如 $(3-t,t)^\mathsf T$。
```check
A8=Matrix([[1,1],[0,0]])
same(A8*Matrix([3-t,t]),Matrix([3,0]))
same(A8.T*Matrix([0,2]),zeros(2,1))
```
:::
::::

:::: exercise 敏感度 {#ex-8-3} ★★★
对于 $A=\begin{pmatrix}1&1\\0&1/1000\end{pmatrix}$，比较当第二个观测值变化 $1/1000$ 而第一个观测值固定时，系数的变化。
::: solution
第二行强制第二个系数增加 $1$。第一行固定了总和，因此第一个系数减少 $1$。
```check
A8=Matrix([[1,1],[0,Rational(1,1000)]])
same(A8*Matrix([-1,1]),Matrix([0,Rational(1,1000)]))
```
:::
::::

## 自测 {#quiz}

```quiz
? 在一个未加权的最小二乘拟合中，什么向量垂直于每个设计列？
- [ ] 观测向量
- [x] 残差
- [ ] 拟合向量
> 残差正交性表示拟合点是在列空间中最接近的点。

? 秩亏缺的设计能否有唯一的拟合向量？
- [x] 是的，正交投影是唯一的
- [ ] 否，此时每个拟合向量必须为零
- [ ] 仅当系数唯一时
> 系数可能相差一个零空间向量，但产生相同的拟合结果。

? 对列向量线性无关的矩阵作简约 QR 分解后，要解哪个方程？
- [ ] $Q\widehat{\mathbf x}=R\mathbf b$
- [ ] $R\widehat{\mathbf x}=\mathbf b$
- [x] $R\widehat{\mathbf x}=Q^\mathsf T\mathbf b$
> 投影系数是观测向量与 $Q$ 的各列的内积。
```
