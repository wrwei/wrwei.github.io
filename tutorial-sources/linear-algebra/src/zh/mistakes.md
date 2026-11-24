---
title: 常见错误
lead: 检查改变答案的假设或约定。
---

## 向量和方程 {#vectors}

### 给零向量赋予一个角度 {#zero-angle}

它与任何向量的点积为零，但角度公式需要除以其范数。仅在两个非零向量之间使用角度公式。[模块 1](module_01_ZH.html#dot)

### 删除增广列 {#augmented}

方程 $x+y=2$ 和 $2x+2y=5$ 减少为一个矛盾。仅查看系数矩阵会隐藏这个矛盾。将右边的项带入每一行操作中。[模块 2](module_02_ZH.html#solutions)
```check
same(Matrix([[1,1,2],[2,2,5]]).rref()[1],(0,2))
```

### 按阅读顺序乘以变换 {#order}

一个剪切 $H$ 后接一个缩放 $S$ 是 $SH$。对于 $H(x,y)=(x+y,y)$ 和 $S(x,y)=(2x,y)$，输入 $(0,1)$ 去到 $(2,1)$。反转顺序得到 $(1,1)$。[模块 3](module_03_ZH.html#composition)
```check
S3=diag(2,1); H3=Matrix([[1,1],[0,1]]); v3=Matrix([0,1])
same(S3*H3*v3,Matrix([2,1])); same(H3*S3*v3,Matrix([1,1]))
```

### 将生成元计为维度 {#count}

向量 $(1,1)^\mathsf T$ 和 $(2,2)^\mathsf T$ 张成一条直线。在计数之前保持独立方向。[模块 4](module_04_ZH.html#basis)
```check
same(Matrix([[1,2],[1,2]]).rank(),1)
```

## 空间与适配 {#spaces}

### 从简化矩阵中选取基向量 {#pivot-columns}

$\begin{pmatrix}1&2\\1&2\end{pmatrix}$ 的列空间是主对角线。行简化后第一列是 $(1,0)^\mathsf T$。使用消元法找到索引，然后从原始矩阵中选取列。[模块 5](module_05_ZH.html#rank-nullity)
```check
A=Matrix([[1,2],[1,2]])
same(A.rref()[0][:,0],Matrix([1,0]))
same(A.columnspace(),[Matrix([1,1])])
```

### 将行列式作为无符号面积因子使用 {#area}

关于垂直轴的反射其行列式为 $-1$。面积保持不变，方向反转。使用绝对值行列式计算普通面积。[模块 6](module_06_ZH.html#determinant)
```check
same(diag(-1,1).det(),-1)
```

### 用向量的范数代替投影中的平方范数 {#projection}

将 $(3,4)^\mathsf T$ 投影到 $(2,0)^\mathsf T$ 使用系数 $6/4$，因为分母是方向与自身的点积。[模块 7](module_07_ZH.html#projection)
```check
u7=Matrix([2,0]); b7=Matrix([3,4])
same(u7.dot(b7)/u7.dot(u7),Rational(3,2))
```

### 将小的残差视为灵敏度测试 {#residual}

对于 $A=\begin{pmatrix}1&1\\0&1/1000\end{pmatrix}$，改变数据 $(0,1/1000)^\mathsf T$ 会使得精确系数改变 $(-1,1)^\mathsf T$。两个拟合的残差都为零。检查条件数以及拟合情况。[模块 8](module_08_ZH.html#solve)
```check
same(Matrix([[1,1],[0,Rational(1,1000)]])*Matrix([-1,1]),Matrix([0,Rational(1,1000)]))
```

## 谱和重构 {#spectra}

### 假设重根提供了足够的特征向量 {#repeated-root}

矩阵 $\begin{pmatrix}2&1\\0&2\end{pmatrix}$ 有两个特征值 $2$，并且其特征空间的维数为一。在尝试构建特征基之前，先找到其特征空间。[模块 9](module_09_ZH.html#diagonalisation)
```check
A=Matrix([[2,1],[0,2]])
same(A.eigenvals(),{2:2})
same(len((A-2*eye(2)).nullspace()),1)
```

### 仅从对角线判断正定性 {#definiteness}

对称矩阵 $\begin{pmatrix}1&2\\2&1\end{pmatrix}$ 具有正的对角线元素和特征值 $3$ 和 $-1$。二次型可以取正负两种符号。测试特征值或有效的正定性准则。[模块 10](module_10_ZH.html#forms)
```check
same(sorted(Matrix([[1,2],[2,1]]).eigenvals()),[-1,3])
```

### 利用特征值符号作为奇异值符号 {#singular-sign}

矩阵 $\operatorname{diag}(2,-3)$ 的奇异值是 $3,2$。负号由分解中的方向变化来体现。[模块 11](module_11_ZH.html#svd)
```check
same(diag(2,-3).singular_values(),[3,2])
```

### 在PCA中跳过中心化步骤 {#pca-centre}

对于点 $(9,0),(11,0)$，原始坐标的第一坐标平方和为 $202$。减去它们的均值后得到 $(-1,0),(1,0)$，其平方和为 $2$。对数据进行中心化，使PCA测量的是均值附近的变异。[模块 12](module_12_ZH.html#pca)
```check
same(9**2+11**2,202); same((9-10)**2+(11-10)**2,2)
```
