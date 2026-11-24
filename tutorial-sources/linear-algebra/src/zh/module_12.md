---
title: 低秩逼近与主成分分析
part: 3
minutes: 95
needs: 模块 8, 10 和 11
lead: 压缩一个矩阵，推导主成分分析，并手动和在 Python 中检查完整重建。
goals:
  - 预测截断 SVD 的误差
  - 将数据中心化并找到主成分方向
  - 重建数据并判断改变特征单位的影响
---

## 保留最强的方向 {#low-rank}

Frobenius 范数 $\|A\|_F$ 是所有元素平方和的平方根。秩为 $k$ 的截断 $A_k=\sum_{i=1}^k\sigma_i\mathbf u_i\mathbf v_i^\mathsf T$ 会丢弃较小的奇异方向。坐标正交变换保持列向量和行向量的欧几里得长度，因此
$\|A-A_k\|_F^2=\sum_{i>k}\sigma_i^2$。截断在秩不超过 $k$ 的矩阵中达到最小的福罗比乌斯误差。

为说明最优性，设 $P$ 是到另一个候选矩阵 $B$ 的列空间的投影。平方误差至少为 $\|(I-P)A\|_F^2$，因为扣除在 $P$ 的值域中的分量只会缩短残差。$P$ 保留的能量为 $\|PA\|_F^2=\sum_i \sigma_i^2\|P\mathbf u_i\|^2$。权重属于 $[0,1]$，且在输出空间的一组完整标准正交基上，权重之和为 $\operatorname{rank}P\le k$。这可由计算 $P$ 的迹得到，也就是在任意标准正交基下对角元素之和。要让加权和最大，应给前 $k$ 个方向各分配权重一。这个选择给出 $A_k$。

::: widget name=truncation
增加保留的秩。将重构矩阵与原始矩阵进行比较，并注意每个被丢弃的奇异值所贡献的误差。
:::

## 找出样本方差最大的方向 {#pca}

将 $m>1$ 个观测值作为行存储。通过减去每一列的均值，得到中心化矩阵 $X$。其样本协方差矩阵为 $C=X^\mathsf TX/(m-1)$。一个单位方向 $\mathbf v$ 给出得分 $X\mathbf v$，其样本方差为 $\mathbf v^\mathsf TC\mathbf v$。在特征向量坐标下，这相当于协方差特征值的加权平均。最大值为最大的特征值。将每个后续方向限制为与之前的方向垂直，得到以下主成分。

因此，$X$ 的前 $k$ 个右奇异向量张成一个主子空间。构造得分矩阵 $XV_k$，即可将中心化后的观测值重构为 $XV_k V_k^\mathsf T$。加回均值以恢复原坐标。协方差矩阵的特征值等于奇异值的平方除以 $m-1$。若总方差为正，一个主成分的方差解释比例就是其对应特征值除以全部特征值之和。

::: example 四个中心化的观测值
取 $(3,0),(-3,0),(0,1),(0,-1)$。两个均值都是零。散布矩阵 $X^\mathsf TX$ 的对角线元素为 $18,2$，非对角线元素为零。第一个成分沿第一个坐标轴，解释 $18/(18+2)=9/10$ 的方差。用一个成分进行重构将最后两个观测值映射到原点。平方重构误差是 $2$。
```check
X12=Matrix([[3,0],[-3,0],[0,1],[0,-1]])
P12=diag(1,0)
same(X12.T*X12,diag(18,2)); same(Rational(18,20),Rational(9,10))
same(sum(v**2 for v in X12-X12*P12),2)
```
:::

主成分分析（PCA）依赖于单位。以毫米为单位的列具有比以米为单位的相同测量值更大的数值方差。当你想比较非常量特征的相对变化时，应进行标准化。当相对变化有意义时，保留物理单位。方差解释比例衡量的是所选坐标下的重构效果，因此应分别评估预测或分类。

::: compute 中心化、得分和重构
```python
from sympy import Matrix, ones

data = Matrix([[13, 5], [7, 5], [10, 6], [10, 4]])
mean = ones(1, 4) * data / 4
X = data - ones(4, 1) * mean
v = Matrix([1, 0])
scores = X * v
reconstruction = scores * v.T + ones(4, 1) * mean
print(list(mean))
print(list(scores))
print(reconstruction.tolist())
print(sum(t**2 for t in data - reconstruction))
```
```output
[10, 5]
[3, -3, 0, 0]
[[13, 5], [7, 5], [10, 5], [10, 5]]
2
```
:::

::: compute 数值地找到成分

数值奇异值分解可以选择奇异向量的正负号。重构过程同时使用得分和方向，因此符号翻转会相互抵消。代码保留一个分量，并在原始坐标中计算平方重构误差。

```python
import numpy as np

data = np.array([[13., 5.], [7., 5.], [10., 6.], [10., 4.]])
mean = data.mean(axis=0)
X = data - mean
_, singular, vt = np.linalg.svd(X, full_matrices=False)
direction = vt[0]
scores = X @ direction
restored = scores[:, None] * direction + mean
explained = singular[0] ** 2 / np.dot(singular, singular)
print(f"first component explains {explained:.1%}")
print(f"squared reconstruction error = {np.sum((data - restored)**2):.0f}")
```
```output
first component explains 90.0%
squared reconstruction error = 2
```
:::

## 练习 {#exercises}

:::: exercise 被丢弃的能量 {#ex-12-1} ★
如果奇异值是 $5,3,1$，找出最佳秩一近似的Frobenius误差。
::: solution
丢弃 $3$ 和 $1$。它们的平方和是 $10$，因此误差是 $\sqrt{10}$。
```check
same(sqrt(3**2+1**2),sqrt(10))
```
:::
::::

:::: exercise 改变单位 {#ex-12-2} ★★
在示例中，将第二个坐标乘以 $4$。现在哪个轴给出第一个分量，它解释了多少方差？
::: solution
散布矩阵的对角线元素变为 $18$ 和 $16\cdot2=32$。第二个轴主导，解释了 $32/(18+32)=16/25$。
```check
Y12=X12*diag(1,4)
same(Y12.T*Y12,diag(18,32)); same(Rational(32,50),Rational(16,25))
```
:::
::::

:::: exercise 旋转后的主成分 {#ex-12-3} ★★★
对于居中的观测值 $(2,2),(-2,-2),(1,-1),(-1,1)$，找出单位第一主成分和平方的一维重构误差。
::: solution
散布矩阵的行是 $(10,6)$ 和 $(6,10)$。沿 $(1,1)^\mathsf T/\sqrt2$ 方向其特征值是 $16$。沿 $(1,-1)^\mathsf T/\sqrt2$ 方向其特征值是 $4$。第一个方向主导。将其投影到该方向上，会丢弃最后两个观测值，每个的平方长度是 $2$，因此总平方误差是 $4$。
```check
X12=Matrix([[2,2],[-2,-2],[1,-1],[-1,1]])
v12=Matrix([1,1])/sqrt(2)
same(X12.T*X12,Matrix([[10,6],[6,10]]))
same(X12.T*X12*v12,16*v12)
same(sum(x**2 for x in X12-X12*v12*v12.T),4)
```
:::
::::

## 自测 {#quiz}

```quiz
? 什么操作是在PCA之前进行的列减法？
- [ ] 将每个观测值强制为单位范数
- [x] 将观测值的中心放置在原点
- [ ] 使协方差矩阵变为对角矩阵
> 每个居中的列具有零均值。相关性仍可能保留

? 哪个量给出秩为$k$ 的截断的平方Frobenius误差？
- [ ] 第一个被舍弃的奇异值
- [ ] 所有保留的奇异值的总和
- [x] 被舍弃的奇异值的平方和
> 正交坐标变换保持Frobenius 范数不变

? 如何将居中的PCA重构结果返回到原始坐标？
- [x] 加上原始列的均值
- [ ] 重新居中并再次舍弃均值
- [ ] 除以观测值的数量
> 中心化操作去除了均值，因此在投影后需要撤销这个平移。
```
