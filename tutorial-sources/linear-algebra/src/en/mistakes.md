---
title: Common mistakes
lead: Check the assumption or convention that changes the answer.
---

## Vectors and equations {#vectors}

### Giving the zero vector an angle {#zero-angle}

Its dot product with any vector is zero, but the angle formula requires dividing by its norm. Use the angle formula only for two nonzero vectors. [Module 1](module_01_EN.html#dot)

### Dropping the augmented column {#augmented}

The two equations $x+y=2$ and $2x+2y=5$ reduce to a contradiction. Looking only at their coefficient matrix hides it. Carry the right-hand side through every row operation. [Module 2](module_02_EN.html#solutions)
```check
same(Matrix([[1,1,2],[2,2,5]]).rref()[1],(0,2))
```

### Multiplying transformations in reading order {#order}

A shear $H$ followed by a scale $S$ is $SH$. For $H(x,y)=(x+y,y)$ and $S(x,y)=(2x,y)$, the input $(0,1)$ goes to $(2,1)$. Reversing the order gives $(1,1)$. [Module 3](module_03_EN.html#composition)
```check
S3=diag(2,1); H3=Matrix([[1,1],[0,1]]); v3=Matrix([0,1])
same(S3*H3*v3,Matrix([2,1])); same(H3*S3*v3,Matrix([1,1]))
```

### Counting generators as dimension {#count}

The vectors $(1,1)^\mathsf T$ and $(2,2)^\mathsf T$ span a line. Keep independent directions before counting. [Module 4](module_04_EN.html#basis)
```check
same(Matrix([[1,2],[1,2]]).rank(),1)
```

## Spaces and fits {#spaces}

### Taking basis columns from the reduced matrix {#pivot-columns}

The column space of $\begin{pmatrix}1&2\\1&2\end{pmatrix}$ is the diagonal line. After row reduction the first column is $(1,0)^\mathsf T$. Use elimination to find indices, then take columns from the original matrix. [Module 5](module_05_EN.html#rank-nullity)
```check
A=Matrix([[1,2],[1,2]])
same(A.rref()[0][:,0],Matrix([1,0]))
same(A.columnspace(),[Matrix([1,1])])
```

### Using a determinant as an unsigned area factor {#area}

Reflection in the vertical axis has determinant $-1$. Areas stay the same and orientation reverses. Use the absolute determinant for ordinary area. [Module 6](module_06_EN.html#determinant)
```check
same(diag(-1,1).det(),-1)
```

### Replacing the squared norm in a projection by the norm {#projection}

Projecting $(3,4)^\mathsf T$ onto $(2,0)^\mathsf T$ uses coefficient $6/4$, since the denominator is the direction's dot product with itself. [Module 7](module_07_EN.html#projection)
```check
u7=Matrix([2,0]); b7=Matrix([3,4])
same(u7.dot(b7)/u7.dot(u7),Rational(3,2))
```

### Trusting a small residual as a sensitivity test {#residual}

For $A=\begin{pmatrix}1&1\\0&1/1000\end{pmatrix}$, changing the data by $(0,1/1000)^\mathsf T$ changes the exact coefficients by $(-1,1)^\mathsf T$. Both fits have zero residual. Check conditioning as well as fit. [Module 8](module_08_EN.html#solve)
```check
same(Matrix([[1,1],[0,Rational(1,1000)]])*Matrix([-1,1]),Matrix([0,Rational(1,1000)]))
```

## Spectra and reconstruction {#spectra}

### Assuming a repeated root supplies enough eigenvectors {#repeated-root}

The matrix $\begin{pmatrix}2&1\\0&2\end{pmatrix}$ has eigenvalue $2$ twice and an eigenspace of dimension one. Find its eigenspaces before trying to build an eigenbasis. [Module 9](module_09_EN.html#diagonalisation)
```check
A=Matrix([[2,1],[0,2]])
same(A.eigenvals(),{2:2})
same(len((A-2*eye(2)).nullspace()),1)
```

### Reading definiteness from the diagonal alone {#definiteness}

The symmetric matrix $\begin{pmatrix}1&2\\2&1\end{pmatrix}$ has positive diagonal entries and eigenvalues $3$ and $-1$. The quadratic form takes both signs. Test the eigenvalues or a valid definiteness criterion. [Module 10](module_10_EN.html#forms)
```check
same(sorted(Matrix([[1,2],[2,1]]).eigenvals()),[-1,3])
```

### Using eigenvalue signs as singular-value signs {#singular-sign}

The matrix $\operatorname{diag}(2,-3)$ has singular values $3,2$. The negative sign is carried by a direction change in the decomposition. [Module 11](module_11_EN.html#svd)
```check
same(diag(2,-3).singular_values(),[3,2])
```

### Skipping the centring step in PCA {#pca-centre}

For points $(9,0),(11,0)$, the raw sum of squared first coordinates is $202$. Subtracting their mean leaves $(-1,0),(1,0)$, with squared sum $2$. Centre the data so PCA measures variation about the mean. [Module 12](module_12_EN.html#pca)
```check
same(9**2+11**2,202); same((9-10)**2+(11-10)**2,2)
```
