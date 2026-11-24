---
title: 奇异值与伪逆
part: 3
minutes: 90
needs: 模块 7、8 和 10
lead: 将矩形映射分解为正交方向，测量它们的敏感度，并找到最小范数解。
goals:
  - 从谱定理构造奇异方向
  - 将奇异值解释为拉伸因子
  - 使用伪逆来求最小范数的最小二乘解
---

## 一个矩形映射有两个坐标系 {#svd}

一个矩形矩阵在不同空间之间发送输入和输出。为了找到独立拉伸的输入方向，查看 $A^\mathsf TA$。它是对称的并且半正定，因为 $\mathbf x^\mathsf TA^\mathsf TA\mathbf x=\|A\mathbf x\|^2$。它的正交特征向量 $\mathbf v_i$ 具有非负的特征值 $\sigma_i^2$。将平方根 $\sigma_i$ 从大到小排列。它们是 **奇异值**。

对每个 $\sigma_i>0$，取 $\mathbf u_i=A\mathbf v_i/\sigma_i$。这些输出方向具有单位长度并且相互正交，因为
$(A\mathbf v_i)\cdot(A\mathbf v_j)=\sigma_j^2\mathbf v_i\cdot\mathbf v_j$. 输入方向中特征值为零的满足 $A\mathbf v_i=\mathbf0$. 将输出基正交规范化以获得 **奇异值分解** $A=U\Sigma V^\mathsf T$，其中包含一个矩形对角矩阵 $\Sigma$。仅保留 $r$ 正方向可得到紧致形式 $A=\sum_{i=1}^r \sigma_i\mathbf u_i\mathbf v_i^\mathsf T$.

::: example 拉伸与压缩
取 $A=\begin{pmatrix}3&0&0\\0&2&0\end{pmatrix}$。它将前两个坐标方向分别拉伸 $3$ 和 $2$ 倍，并压缩第三个方向。其秩为 $2$。矩形 SVD 列出两个奇异值 $3,2$。输入 Gram 矩阵在被压为零的方向上有一个第三个特征值 $0$。
```check
A11=Matrix([[3,0,0],[0,2,0]])
same(A11.T*A11,diag(9,4,0)); same(A11.rank(),2)
```
:::

## 小奇异值的影响 {#sizes}

对于满列秩矩阵，$\sigma_{\max}$ 是单位输入下输出范数的最大值，$\sigma_{\min}$ 是最小值。在谱坐标中，输出范数的平方是 $\sum_i\sigma_i^2 z_i^2$ 的加权和，其中 $\sum_i z_i^2=1$。欧几里得范数的条件数为 $\sigma_{\max}/\sigma_{\min}$。Gram 矩阵的条件数等于其平方。这解释了为什么形成正规方程会使数值求解对舍入更敏感。

## 在奇异值坐标中求解 {#pseudoinverse}

伪逆矩阵 $A^+=\sum_{\sigma_i>0}\sigma_i^{-1}\mathbf v_i\mathbf u_i^\mathsf T$ 首先读取 $\mathbf b$ 中沿可达输出方向的部分，然后逆转每个非零拉伸。这产生一个最小二乘拟合。其他产生该拟合的系数向量在核空间中添加一个向量。由于伪逆矩阵给出的系数向量与核空间正交，添加非零核向量会增加其长度。因此 $A^+\mathbf b$ 是最小范数的唯一最小二乘解。

在数值拟合中，一个非常小的奇异值会放大噪声。截断该方向会通过丢弃一个不稳定分量来改变问题。根据尺度和噪声选择一个阈值，并在解释拟合时报告它。

::: compute 比较精确和最小范数拟合
```python
from sympy import Matrix

A = Matrix([[3, 0, 0], [0, 2, 0]])
b = Matrix([6, 8])
print(list(A.pinv() * b))
print((A * A.pinv() * b).tolist())
```
```output
[2, 4, 0]
[[6], [8]]
```
:::

## 练习 {#exercises}

:::: exercise 奇异值是非负的 {#ex-11-1} ★
求 $\operatorname{diag}(2,-5)$ 的奇异值。
::: solution
Gram 矩阵是 $\operatorname{diag}(4,25)$，因此奇异值是 $5$ 和 $2$。
```check
same(diag(2,-5).singular_values(),[5,2])
```
:::
::::

:::: exercise 带零行的最小二乘 {#ex-11-2} ★★
求 $\operatorname{diag}(2,0)\mathbf x=(6,4)^\mathsf T$ 的最小范数最小二乘解。
::: solution
仅第一行会影响预测。用 $x_1=3$ 拟合它。每个 $x_2$ 都给出相同的拟合，而 $x_2=0$ 给出最小范数。拟合向量是 $(6,0)^\mathsf T$。
```check
A11=diag(2,0); b11=Matrix([6,4])
same(A11.pinv()*b11,Matrix([3,0])); same(A11*A11.pinv()*b11,Matrix([6,0]))
```
:::
::::

:::: exercise 比较条件数 {#ex-11-3} ★★★
求 $\kappa_2(A)$ 和 $\kappa_2(A^\mathsf TA)$ 对于 $A=\operatorname{diag}(4,1/2)$。
::: solution
两个伸缩因子是 $4$ 和 $1/2$，因此它们的比值是 $8$。Gram 因子是 $16$ 和 $1/4$，因此它们的比值是 $64$。
```check
A11=diag(4,S.Half)
same(A11.condition_number(),8); same((A11.T*A11).condition_number(),64)
```
:::
::::

## 自测 {#quiz}

```quiz
? 哪个矩阵给出右奇异方向？
- [x] $A^\mathsf TA$
- [ ] $AA^\mathsf T$
- [ ] $A+A^\mathsf T$ 对于每一个矩形 $A$
> 右奇异方向位于输入空间中，它们的平方伸缩因子是 $A^\mathsf TA$ 的特征值。

? 哪些 SVD 部分被伪逆所反转？
- [ ] 仅零奇异值
- [ ] 原始矩阵的所有元素单独
- [x] 非零奇异值，交换输入和输出方向
> 零空间方向保持为零，因此计算出的系数具有最小范数。

? 一个非常小的正奇异值在求解中能做什么？
- [ ] 自动去除观测噪声
- [x] 沿其对应的输出方向放大噪声
- [ ] 强制预测成为特征向量
> 解决方法是将该坐标乘以奇异值的倒数。
```
