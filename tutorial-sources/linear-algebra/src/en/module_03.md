---
title: Matrices and linear maps
part: 1
minutes: 80
needs: Modules 1 and 2
lead: Read a matrix by its columns, compose transformations, and distinguish linear from affine maps.
goals:
  - Match the dimensions of a matrix with its inputs and outputs
  - Build a matrix from the images of the coordinate vectors
  - Compose maps and apply the transpose rule
---

## A matrix as a rule for vectors {#maps}

A linear map preserves addition and scalar multiplication. The two properties combine to give $T(a\mathbf u+b\mathbf v)=aT(\mathbf u)+bT(\mathbf v)$. In particular, it sends zero to zero. A matrix with $m$ rows and $n$ columns sends vectors in $\mathbb R^n$ to vectors in $\mathbb R^m$. Its columns say where the coordinate vectors go.

::: example Build the matrix of a shear
Let $T(x,y)=(x+2y,y)$. The first coordinate vector goes to $(1,0)$ and the second to $(2,1)$. The matrix therefore has columns $(1,0)^\mathsf T$ and $(2,1)^\mathsf T$. At $(0,3)$ its output is $(6,3)$, three times the second column.
```check
A3=Matrix([[1,2],[0,1]])
same(A3*Matrix([0,3]),Matrix([6,3]))
```
:::

::: widget name=matrices
Apply a matrix to the square and to $(1,1)^\mathsf T$. Start with the identity, then try a shear and a matrix with dependent columns. Notice what happens to the square.
:::

## Composition and transpose {#composition}

To apply $B$ first and $A$ second, form $AB$. Its $j$th column is $A$ applied to column $j$ of $B$. The inner dimensions must agree. If $A$ is $m\times n$ and $B$ is $n\times p$, then $AB$ is $m\times p$.

The **transpose** swaps rows with columns. At the entry level, $(AB)_{ij}=\sum_k A_{ik}B_{kj}$. Switching $i$ and $j$ gives $(AB)^\mathsf T=B^\mathsf TA^\mathsf T$. The order reverses.

::: example A scale and a shear
Let $S=\begin{pmatrix}2&0\\0&1\end{pmatrix}$ and $H=\begin{pmatrix}1&1\\0&1\end{pmatrix}$. On $(0,1)$, shearing then scaling gives $(2,1)$, while scaling then shearing gives $(1,1)$. Both compositions exist and give different maps.
```check
S3,H3=Matrix([[2,0],[0,1]]),Matrix([[1,1],[0,1]])
same(S3*H3*Matrix([0,1]),Matrix([2,1]))
same(H3*S3*Matrix([0,1]),Matrix([1,1]))
same((S3*H3).T,H3.T*S3.T)
```
:::

## Affine maps {#affine}

A map of the form $A\mathbf x+\mathbf b$ is **affine**. Its translation term moves every output by the same amount. It is linear exactly when $\mathbf b=\mathbf 0$. If coordinates represent points on a map, translating the origin changes positions but keeps every displacement transformed by $A$.

::: compute Compare the two products
```python
from sympy import Matrix

scale = Matrix([[2, 0], [0, 1]])
shear = Matrix([[1, 1], [0, 1]])
print((scale * shear).tolist())
print((shear * scale).tolist())
```
```output
[[2, 2], [0, 1]]
[[2, 1], [0, 1]]
```
:::

## Exercises {#exercises}

:::: exercise Shapes {#ex-3-1} ★
If $A$ is $4\times2$ and $B$ is $2\times3$, give the shape of $AB$. Does $BA$ exist?
::: solution
$AB$ maps $\mathbb R^3$ through $\mathbb R^2$ to $\mathbb R^4$, so the shape is $4\times3$. $BA$ has inner dimensions $3$ and $4$, so it is undefined.
```check
same((zeros(4,2)*zeros(2,3)).shape,(4,3))
holds(zeros(2,3).cols!=zeros(4,2).rows)
```
:::
::::

:::: exercise Reflection {#ex-3-2} ★★
Find the matrix for reflection across the line $y=x$.
::: solution
The reflection swaps the coordinates, hence swaps the two coordinate vectors. Its matrix is $\begin{pmatrix}0&1\\1&0\end{pmatrix}$. Applying it twice gives the identity.
```check
R3=Matrix([[0,1],[1,0]])
same(R3*Matrix([x,y]),Matrix([y,x])); same(R3**2,eye(2))
```
:::
::::

:::: exercise Recognise a translation {#ex-3-3} ★★★
Show that $F(x,y)=(x+1,2y)$ is affine. What transformation does it apply to a displacement $(h,k)$?
::: solution
Write $F(\mathbf x)=\operatorname{diag}(1,2)\mathbf x+(1,0)^\mathsf T$. The difference $F(x+h,y+k)-F(x,y)$ is $(h,2k)$. The translation cancels from the difference.
```check
same(Matrix([x+h+1,2*(y+k)])-Matrix([x+1,2*y]),Matrix([h,2*k]))
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which map is linear?
- [ ] $x\mapsto x+1$
- [x] $x\mapsto -3x$
- [ ] $x\mapsto x^2$
> Scaling preserves addition and scalar multiplication. Translation fails at zero, and squaring changes the scaling rule.

? In $AB\mathbf v$, which map is applied to the vector first?
- [x] $B$
- [ ] $A$
- [ ] Both simultaneously
> Read it as $A(B\mathbf v)$.

? What is the shape of the transpose of a $3\times5$ matrix?
- [ ] $3\times5$
- [ ] $5\times5$
- [x] $5\times3$
> The rows become columns and the columns become rows.
```
