---
title: 术语表
lead: 查找一个术语并回溯到首次发展该术语的课程。
---

## 向量、系统和空间 {#spaces}

|术语|含义|
|---|---|
|增广矩阵|一个系统系数矩阵，其右侧添加一个列作为右侧常数项。 [模块 2](module_02_ZH.html#rows)|
|仿射映射|先应用线性映射，再作平移。 [模块 3](module_03_ZH.html#affine)|
|基底|一组线性无关的向量，能够张成整个空间，给出唯一的坐标表示。 [模块 4](module_04_ZH.html#basis)|
|列空间或像空间|矩阵的所有可能输出。[模块 5](module_05_ZH.html#four-spaces)|
|维数|任何基中向量的数量。[模块 4](module_04_ZH.html#basis)|
|数量积|对应坐标的乘积之和。[模块 1](module_01_ZH.html#dot)|
|自由变量|一个列向量没有主元的变量。对于一致系统，该变量可以自由选择。[模块 2](module_02_ZH.html#solutions)|
|线性组合|各向量分别乘以标量之后的和。[模块 1](module_01_ZH.html#vectors)|
|线性无关|仅有全零系数的组合才能等于零向量。[模块 4](module_04_ZH.html#basis)|
|线性映射|保持线性组合的映射。[模块 3](module_03_ZH.html#maps)|
|范数|向量的长度。欧几里得范数使用平方和的平方根。[模块 1](module_01_ZH.html#dot)|
|零空间或核|矩阵映射为零的输入集合。[模块 5](module_05_ZH.html#four-spaces)|
|主元|用于消除其他行中变量的引导项。[模块 2](module_02_ZH.html#rows)|
|秩|列空间的维数，等于主元的数量。[模块 5](module_05_ZH.html#rank-nullity)|
|行空间|将行视为输入空间中的向量所张成的空间。[模块 5](module_05_ZH.html#four-spaces)|
|张成|所有给定向量的线性组合的集合。[模块 4](module_04_ZH.html#span)|
|子空间|包含零向量且对向量加法和数乘封闭的子集。[模块 4](module_04_ZH.html#span)|
|转置|交换行和列的操作。[模块 3](module_03_ZH.html#composition)|

## 分解与逼近 {#fits}

|术语|含义|
|---|---|
|行列式|方阵所对应的有符号体积缩放因子。零对应于维度坍缩。[模块 6](module_06_ZH.html#determinant)|
|Gram–Schmidt|通过减去投影并归一化来构造标准正交基的过程。[模块 7](module_07_ZH.html#gram-schmidt)|
|逆矩阵|一个能够逆转给定可逆映射的方阵。[模块 6](module_06_ZH.html#inverse)|
|LU 分解|由下三角和上三角因子相乘得到，必要时包含置换。[模块 6](module_06_ZH.html#lu)|
|最小二乘|通过最小化平方残差项之和来进行拟合。[模块 8](module_08_ZH.html#least-squares)|
|正交|两个向量的点积为零。[模块 1](module_01_ZH.html#dot)|
|正交归一化|一组两两正交的单位向量。[模块 7](module_07_ZH.html#gram-schmidt)|
|投影|给定向量最接近子空间的点。[模块 7](module_07_ZH.html#projection)|
|QR分解|第一个因子的各列形成标准正交向量组，第二个因子具有上三角结构的乘积。[模块 7](module_07_ZH.html#qr)|
|残差|观测向量减去拟合向量。[模块 8](module_08_ZH.html#least-squares)|

## 谱和数据 {#data}

|术语|含义|
|---|---|
|条件数|满列秩矩阵在欧几里得范数下最大拉伸与最小拉伸的比值。[模块 11](module_11_ZH.html#sizes)|
|对角化|将矩阵表示为在特征基下的对角作用。[模块 9](module_09_ZH.html#diagonalisation)|
|特征向量和特征值|一个非零方向在缩放后保持不变以及乘以该方向的标量。[模块 9](module_09_ZH.html#eigenpairs)|
|特征空间|特征值 $\lambda$ 对应的特征空间是矩阵 $A-\lambda I$ 的零空间。参见[模块 9](module_09_ZH.html#eigenpairs)|
|Frobenius 范数|所有矩阵元素的平方和的平方根。[模块 12](module_12_ZH.html#low-rank)|
|主成分|剩余样本方差最大的方向，且与之前选定的方向正交。[模块 12](module_12_ZH.html#pca)|
|奇异值分解的伪逆|一个映射，给出每个右侧的最小范数最小二乘解。[模块 11](module_11_ZH.html#pseudoinverse)|
|二次型|形如 $\mathbf x^\mathsf TA\mathbf x$ 的标量函数。[模块 10](module_10_ZH.html#forms)|
|奇异值|奇异值分解中的非负伸缩因子。[模块 11](module_11_ZH.html#svd)|
|谱定理|每个实对称矩阵都有一个正交归一化特征基。[模块 10](module_10_ZH.html#spectral)|
