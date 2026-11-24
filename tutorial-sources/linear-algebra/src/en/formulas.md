---
title: Formula sheet
lead: Look up a linear algebra rule, its conditions, and the lesson that explains it.
---

## Vectors, maps and systems {#foundations}

| Quantity | Rule and conditions |
|---|---|
| Dot product and norm | $\mathbf u\cdot\mathbf v=\sum_i u_i v_i$ for vectors of equal length, and $\|\mathbf v\|=\sqrt{\mathbf v\cdot\mathbf v}$. [Module 1](module_01_EN.html#dot) |
| Angle | $\cos\theta=(\mathbf u\cdot\mathbf v)/(\|\mathbf u\|\|\mathbf v\|)$ for nonzero vectors. [Module 1](module_01_EN.html#dot) |
| Composition | $AB\mathbf v=A(B\mathbf v)$ for matrices of compatible sizes. [Module 3](module_03_EN.html#composition) |
| Transpose of a product | $(AB)^\mathsf T=B^\mathsf T A^\mathsf T$. [Module 3](module_03_EN.html#composition) |
| Coordinates in a basis | $B\mathbf c=\mathbf v$ when $B$ has the ordered basis columns and $\mathbf c$ contains the coordinates. [Module 4](module_04_EN.html#coordinates) |
| Rank–nullity | $\dim(\ker A)+\operatorname{rank}(A)=n$ for an $m\times n$ matrix. [Module 5](module_05_EN.html#rank-nullity) |
| Solution family | If $A\mathbf p=\mathbf b$, the solutions are $\mathbf p+\mathbf z$ for all $\mathbf z\in\ker A$. [Module 5](module_05_EN.html#families) |
| Determinant and inverse | For square $A$, $\det A\ne0$ exactly when $A$ is invertible. A triangular determinant is the product of diagonal entries. [Module 6](module_06_EN.html#determinant) |

```check
A=Matrix([[1,2],[3,4]]); B=Matrix([[1,0],[0,2]])
same((A*B).T,B.T*A.T)
same(Matrix([3,4]).norm(),5)
same(A*A.inv(),eye(2)); same(A.det(),-2)
C=Matrix([[1,2,3],[2,4,6]])
same(C.rank()+len(C.nullspace()),3)
```

## Orthogonality and fits {#approximation}

| Quantity | Rule and conditions |
|---|---|
| Projection onto a line | $\mathbf u(\mathbf u^\mathsf T\mathbf b)/(\mathbf u^\mathsf T\mathbf u)$ for $\mathbf u\ne0$. [Module 7](module_07_EN.html#projection) |
| Projection onto a subspace | $P=QQ^\mathsf T$ if the columns of $Q$ are an orthonormal basis of the subspace. [Module 7](module_07_EN.html#gram-schmidt) |
| Normal equations | $A^\mathsf TA\widehat{\mathbf x}=A^\mathsf T\mathbf b$. These characterise least-squares minimisers, with a unique coefficient vector when the columns of $A$ are independent. [Module 8](module_08_EN.html#least-squares) |
| QR solve | For a thin factorisation $A=QR$ with independent columns, solve $R\widehat{\mathbf x}=Q^\mathsf T\mathbf b$. [Module 8](module_08_EN.html#solve) |

```check
A=Matrix([[1,0],[1,1],[1,2]]); b=Matrix([1,2,2])
Q,R=A.QRdecomposition()
p=Q*Q.T*b
same(A.T*(b-p),zeros(2,1))
same(A*R.upper_triangular_solve(Q.T*b),p)
```

## Spectra, singular values and data {#spectra}

| Quantity | Rule and conditions |
|---|---|
| Eigenpair | $A\mathbf v=\lambda\mathbf v$ for square $A$ and $\mathbf v\ne0$. The candidate values solve $\det(A-\lambda I)=0$. [Module 9](module_09_EN.html#eigenpairs) |
| Diagonalisation | $A=PDP^{-1}$ when the columns of $P$ form an eigenbasis and $D$ stores the corresponding eigenvalues. [Module 9](module_09_EN.html#diagonalisation) |
| Symmetric diagonalisation | $A=Q\Lambda Q^\mathsf T$ for real symmetric $A$ with orthonormal eigenvectors in $Q$. [Module 10](module_10_EN.html#spectral) |
| Singular values | The positive $\sigma_i$ are the square roots of positive eigenvalues of $A^\mathsf TA$. For them, $\mathbf u_i=A\mathbf v_i/\sigma_i$. [Module 11](module_11_EN.html#svd) |
| Condition number | $\kappa_2(A)=\sigma_{\max}/\sigma_{\min}$ for full column rank, and $\kappa_2(A^\mathsf TA)=\kappa_2(A)^2$. [Module 11](module_11_EN.html#sizes) |
| Pseudoinverse | $A^+=\sum_{\sigma_i>0}\mathbf v_i\mathbf u_i^\mathsf T/\sigma_i$. It gives the minimum-norm least-squares coefficients $A^+\mathbf b$. [Module 11](module_11_EN.html#pseudoinverse) |
| Truncation error | $\|A-A_k\|_F^2=\sum_{i>k}\sigma_i^2$ when $A_k$ keeps the first $k$ singular values. [Module 12](module_12_EN.html#low-rank) |
| PCA | For $m>1$ centred observations in the rows of $X$, the sample covariance is $X^\mathsf TX/(m-1)$. The first $k$ right singular directions give centred reconstruction $XV_kV_k^\mathsf T$. [Module 12](module_12_EN.html#pca) |

```check
A=diag(5,3,1); B=diag(5,0,0)
same(A.condition_number(),5)
same((A.T*A).condition_number(),25)
same(sum(e**2 for e in A-B),10)
same(A.pinv(),diag(Rational(1,5),Rational(1,3),1))
X=Matrix([[3,0],[-3,0],[0,1],[0,-1]])
same(X.T*X/3,diag(6,Rational(2,3)))
```
