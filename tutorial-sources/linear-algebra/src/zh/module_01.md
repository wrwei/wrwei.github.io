---
title: 向量和点积
part: 1
minutes: 65
needs: 中学代数和勾股定理
lead: 对向量进行加法和缩放，测量它们的长度，并使用点积比较方向。
goals:
  - 将一列数字解释为位移或测量值列表
  - 用线性组合构造向量
  - 计算长度、角度和点积
---

## 从位移到列向量 {#vectors}

向东走三米，再向北走四米。位移是列向量 $\mathbf v=\begin{pmatrix}3\\4\end{pmatrix}$。将箭头移动到另一个起点不会改变位移。这两个分量表示相对于所选坐标轴的坐标。

向量也可以存储数据。如果坐标是两个气象站的温度，那么计算两天的差值即可得到每个气象站的变化量。你可以将具有相同坐标约定的向量相加，或将向量与标量（单个数值）相乘。乘以负数会反转方向。

::: example 运动的组合
取 $\mathbf u=(2,1)^\mathsf T$ 和 $\mathbf v=(-1,3)^\mathsf T$。沿 $\mathbf u$ 移动两次，再沿 $\mathbf v$ 移动一次， 得到 $2\mathbf u+\mathbf v=(4,2)^\mathsf T+(-1,3)^\mathsf T=(3,5)^\mathsf T$。各向量分别乘以标量后再相加，得到**线性组合**。
```check
same(2*Matrix([2,1])+Matrix([-1,3]),Matrix([3,5]))
```
:::

::: widget name=vectors
改变两个向量的分量。比较它们的和与点积。尝试使用垂直向量，然后使两者指向同一方向。
:::

## 长度与角度 {#dot}

**点积**$\mathbf u\cdot\mathbf v$ 对应项相乘并求和。**欧几里得范数**为 $\|\mathbf v\|=\sqrt{\mathbf v\cdot\mathbf v}$。长度为 1 的向量是**单位向量**。

对于非零向量，角度 $\theta$ 满足

$$
\cos\theta=\frac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\|\mathbf v\|}.
$$

为了理解其原因，将 $\|\mathbf u-\mathbf v\|^2$ 展开为点积，然后与三角形的余弦定理进行比较。在直角情况下，点积为零。负的点积意味着角度为钝角。点积为零的两个向量是 **正交的**。零向量与所有向量正交，但它没有方向，也没有与另一个向量的角度。

::: example 方向与长度
对于 $\mathbf u=(1,2)^\mathsf T$ 和 $\mathbf v=(2,-1)^\mathsf T$，点积为 $1\cdot2+2(-1)=0$。两者长度均为 $\sqrt5$，因此两向量的夹角是直角。
```check
u1,v1=Matrix([1,2]),Matrix([2,-1])
same(u1.dot(v1),0); same(u1.norm(),sqrt(5)); same(v1.norm(),sqrt(5))
```
:::

::: pitfall
点积的符号反映的是角度信息，而非长度。向量 $(-3,-4)^\mathsf T$ 的长度仍为 $5$。
:::

::: compute 精确向量算术
当将列表传递给 Matrix 时，SymPy 使用列向量。
```python
from sympy import Matrix

v = Matrix([3, 4])
print(v.norm())
print(list(v / v.norm()))
```
```output
5
[3/5, 4/5]
```
:::

## 练习 {#exercises}

:::: exercise 线性组合 {#ex-1-1} ★
求 $3(1,-2)^\mathsf T-2(2,1)^\mathsf T$。
::: solution
逐项计算。第一个坐标为 $3-4=-1$，第二个坐标为 $-6-2=-8$。
```check
same(3*Matrix([1,-2])-2*Matrix([2,1]),Matrix([-1,-8]))
```
:::
::::

:::: exercise 寻找垂直向量 {#ex-1-2} ★★
寻找与 $(3,4)^\mathsf T$ 垂直的单位向量。
::: solution
向量 $(-4,3)^\mathsf T$ 与原向量的点积为 $-12+12=0$，且长度为 $5$。将其除以 $5$。相反方向的单位向量同样适用。
```check
u1=Matrix([-4,3])/5
same(u1.dot(Matrix([3,4])),0); same(u1.norm(),1)
```
:::
::::

:::: exercise 由长度计算点积 {#ex-1-3} ★★★
若 $\|\mathbf u\|=2$、$\|\mathbf v\|=3$ 和 $\|\mathbf u+\mathbf v\|^2=7$，求点积。
::: solution
展开平方范数得到 $7=4+2\mathbf u\cdot\mathbf v+9$。因此 $\mathbf u\cdot\mathbf v=-3$。
```check
same(solve(4+2*x+9-7,x),[-3])
```
:::
::::

## 自测 {#quiz}

```quiz
? $(0,-5)^\mathsf T$ 的长度是多少？
- [ ] $-5$
- [x] $5$
- [ ] $25$
> 长度是各分量平方和的非负平方根。

? 哪个向量与 $(2,1)^\mathsf T$ 正交？
- [ ] $(2,1)^\mathsf T$
- [ ] $(1,2)^\mathsf T$
- [x] $(-1,2)^\mathsf T$
> 点积是 $2(-1)+1\cdot2=0$。

? 何时定义 $\mathbf v/\|\mathbf v\|$？
- [x] 当 $\mathbf v\ne\mathbf 0$ 时
- [ ] 仅当 $\mathbf v$ 已经具有单位长度时
- [ ] 对于每一个 $\mathbf v$
> 分母恰好对非零向量取正值。
```
