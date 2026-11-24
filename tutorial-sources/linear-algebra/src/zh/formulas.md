---
title: 公式表
lead: 查找一个线性代数规则，它的条件，以及解释该规则的课程内容。
---

## 向量、映射和系统 {#foundations}

|量|规则和条件|
|---|---|
|数量积和范数|$\mathbf u\cdot\mathbf v=\sum_i u_i v_i$ 对于长度相等的向量，以及 $\|\mathbf v\|=\sqrt{\mathbf v\cdot\mathbf v}$。[模块 1](module_01_ZH.html#dot)|
|角度|$\cos\theta=(\mathbf u\cdot\mathbf v)/(\|\mathbf u\|\|\mathbf v\|)$ 对于非零向量。[模块 1](module_01_ZH.html#dot)|
|复合|$AB\mathbf v=A(B\mathbf v)$ 对于相容尺寸的矩阵。[模块 3](module_03_ZH.html#composition)|
|乘积的转置|$(AB)^\mathsf T=B^\mathsf T A^\mathsf T$. [模块 3](module_03_ZH.html#composition)|
|给定基下的坐标|$B\mathbf c=\mathbf v$ 当 $B$ 有有序基列且 $\mathbf c$ 包含坐标时。 [模块 4](module_04_ZH.html#coordinates)|
|秩-零度定理|$\dim(\ker A)+\operatorname{rank}(A)=n$ 对于一个 $m\times n$ 矩阵。 [模块 5](module_05_ZH.html#rank-nullity)|
|解的全体|如果 $A\mathbf p=\mathbf b$，则解为 $\mathbf p+\mathbf z$ 对所有 $\mathbf z\in\ker A$。 [模块 5](module_05_ZH.html#families)|
|行列式和逆矩阵|对于方阵 $A$，$\det A\ne0$ 当且仅当 $A$ 可逆。三角矩阵的行列式是主对角线元素的乘积。 [模块 6](module_06_ZH.html#determinant)|

```check
A=Matrix([[1,2],[3,4]]); B=Matrix([[1,0],[0,2]])
same((A*B).T,B.T*A.T)
same(Matrix([3,4]).norm(),5)
same(A*A.inv(),eye(2)); same(A.det(),-2)
C=Matrix([[1,2,3],[2,4,6]])
same(C.rank()+len(C.nullspace()),3)
```

## 正交性和拟合 {#approximation}

|量|规则和条件|
|---|---|
|投影到一条直线|$\mathbf u(\mathbf u^\mathsf T\mathbf b)/(\mathbf u^\mathsf T\mathbf u)$ 对于 $\mathbf u\ne0$。 [模块 7](module_07_ZH.html#projection)|
|投影到一个子空间|$P=QQ^\mathsf T$ 如果 $Q$ 的列是该子空间的一组标准正交基。 [模块 7](module_07_ZH.html#gram-schmidt)|
|正规方程|$A^\mathsf TA\widehat{\mathbf x}=A^\mathsf T\mathbf b$. 这些方程表征最小二乘解，当$A$的列向量线性无关时，系数向量是唯一的。[模块 8](module_08_ZH.html#least-squares)|
|QR 解法|对于简约 QR 分解 $A=QR$，其列向量线性无关时，解 $R\widehat{\mathbf x}=Q^\mathsf T\mathbf b$. [模块 8](module_08_ZH.html#solve)|

```check
A=Matrix([[1,0],[1,1],[1,2]]); b=Matrix([1,2,2])
Q,R=A.QRdecomposition()
p=Q*Q.T*b
same(A.T*(b-p),zeros(2,1))
same(A*R.upper_triangular_solve(Q.T*b),p)
```

## 特征值、奇异值和数据 {#spectra}

|量|规则和条件|
|---|---|
|特征对|$A\mathbf v=\lambda\mathbf v$ 对于方阵 $A$ 和 $\mathbf v\ne0$. 候选值满足 $\det(A-\lambda I)=0$. [模块 9](module_09_ZH.html#eigenpairs)|
|对角化|$A=PDP^{-1}$ 当 $P$ 的列向量构成一个特征基，并且 $D$ 存储相应的特征值时。[模块 9](module_09_ZH.html#diagonalisation)|
|对称对角化|$A=Q\Lambda Q^\mathsf T$ 对于实对称矩阵 $A$，其中 $Q$ 的列是标准正交的特征向量。[模块 10](module_10_ZH.html#spectral)|
|奇异值|正的 $\sigma_i$ 是 $A^\mathsf TA$ 的正特征值的平方根。对于它们，$\mathbf u_i=A\mathbf v_i/\sigma_i$. [模块 11](module_11_ZH.html#svd)|
|条件数|$\kappa_2(A)=\sigma_{\max}/\sigma_{\min}$ 对于满列秩，以及 $\kappa_2(A^\mathsf TA)=\kappa_2(A)^2$. [模块 11](module_11_ZH.html#sizes)|
|奇异值分解的伪逆|$A^+=\sum_{\sigma_i>0}\mathbf v_i\mathbf u_i^\mathsf T/\sigma_i$ 它给出最小范数的最小二乘系数 $A^+\mathbf b$. [模块 11](module_11_ZH.html#pseudoinverse)|
|截断误差|$\|A-A_k\|_F^2=\sum_{i>k}\sigma_i^2$ 当 $A_k$ 保留前 $k$ 个奇异值时。 [模块 12](module_12_ZH.html#low-rank)|
|主成分分析|若将 $m>1$ 个中心化的观测值放在 $X$ 的各行中，则样本协方差矩阵为 $X^\mathsf TX/(m-1)$。用前 $k$ 个右奇异向量可得到中心化重构 $XV_kV_k^\mathsf T$。参见[模块 12](module_12_ZH.html#pca)|

```check
A=diag(5,3,1); B=diag(5,0,0)
same(A.condition_number(),5)
same((A.T*A).condition_number(),25)
same(sum(e**2 for e in A-B),10)
same(A.pinv(),diag(Rational(1,5),Rational(1,3),1))
X=Matrix([[3,0],[-3,0],[0,1],[0,-1]])
same(X.T*X/3,diag(6,Rational(2,3)))
```
