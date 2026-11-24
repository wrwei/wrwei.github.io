---
title: Singular values and the pseudoinverse
part: 3
minutes: 90
needs: Modules 7, 8 and 10
lead: Decompose rectangular maps into orthogonal directions, measure their sensitivity, and find minimum-norm solutions.
goals:
  - Construct singular directions from the spectral theorem
  - Interpret singular values as stretch factors
  - Use a pseudoinverse for a minimum-norm least-squares solution
---

## A rectangular map has two coordinate systems {#svd}

A rectangular matrix sends inputs and outputs between different spaces. To find input directions that stretch independently, look at $A^\mathsf TA$. It is symmetric and positive semidefinite because $\mathbf x^\mathsf TA^\mathsf TA\mathbf x=\|A\mathbf x\|^2$. Its orthonormal eigenvectors $\mathbf v_i$ have nonnegative eigenvalues $\sigma_i^2$. Arrange the square roots $\sigma_i$ from largest to smallest. They are the **singular values**.

For each $\sigma_i>0$, take $\mathbf u_i=A\mathbf v_i/\sigma_i$. These output directions have unit length and are mutually orthogonal, since
$(A\mathbf v_i)\cdot(A\mathbf v_j)=\sigma_j^2\mathbf v_i\cdot\mathbf v_j$. Input directions with zero eigenvalue satisfy $A\mathbf v_i=\mathbf0$. Complete the output basis orthonormally to obtain the **singular value decomposition** $A=U\Sigma V^\mathsf T$, with a rectangular diagonal matrix $\Sigma$. Keeping only the $r$ positive directions gives the compact form $A=\sum_{i=1}^r \sigma_i\mathbf u_i\mathbf v_i^\mathsf T$.

::: example Stretch and collapse
Take $A=\begin{pmatrix}3&0&0\\0&2&0\end{pmatrix}$. It stretches the first two coordinate directions by $3$ and $2$ and collapses the third. Its rank is $2$. The rectangular SVD lists two singular values, $3,2$. The input Gram matrix has a third eigenvalue, $0$, for the collapsed direction.
```check
A11=Matrix([[3,0,0],[0,2,0]])
same(A11.T*A11,diag(9,4,0)); same(A11.rank(),2)
```
:::

## The effect of small singular values {#sizes}

For a full-column-rank matrix, $\sigma_{\max}$ is the greatest output norm for a unit input and $\sigma_{\min}$ the smallest. In spectral coordinates the squared output norm is a weighted sum $\sum_i\sigma_i^2 z_i^2$ with $\sum_i z_i^2=1$. The condition number in Euclidean norm is $\sigma_{\max}/\sigma_{\min}$. The Gram matrix has condition number equal to its square. This explains why forming the normal equations can make a numerical solve more sensitive to rounding.

## Solve in singular coordinates {#pseudoinverse}

The pseudoinverse $A^+=\sum_{\sigma_i>0}\sigma_i^{-1}\mathbf v_i\mathbf u_i^\mathsf T$ first reads the part of $\mathbf b$ along the reachable output directions, then undoes each nonzero stretch. This produces a least-squares fit. Other coefficient vectors producing that fit add a vector in the kernel. Since the pseudoinverse gives a coefficient vector orthogonal to the kernel, adding a nonzero kernel vector increases its length. Thus $A^+\mathbf b$ is the unique least-squares solution of minimum norm.

In a numerical fit a very small singular value amplifies noise. Truncating that direction changes the problem by discarding an unstable component. Choose a threshold according to scale and noise, and report it when interpreting the fit.

::: compute Compare exact and minimum-norm fits
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

## Exercises {#exercises}

:::: exercise Singular values are nonnegative {#ex-11-1} ★
Find the singular values of $\operatorname{diag}(2,-5)$.
::: solution
The Gram matrix is $\operatorname{diag}(4,25)$, so the singular values are $5$ and $2$.
```check
same(diag(2,-5).singular_values(),[5,2])
```
:::
::::

:::: exercise Least squares with a zero row {#ex-11-2} ★★
Find the minimum-norm least-squares solution of $\operatorname{diag}(2,0)\mathbf x=(6,4)^\mathsf T$.
::: solution
Only the first row can affect the prediction. Fit it with $x_1=3$. Every $x_2$ gives the same fit, and $x_2=0$ gives the smallest norm. The fitted vector is $(6,0)^\mathsf T$.
```check
A11=diag(2,0); b11=Matrix([6,4])
same(A11.pinv()*b11,Matrix([3,0])); same(A11*A11.pinv()*b11,Matrix([6,0]))
```
:::
::::

:::: exercise Compare condition numbers {#ex-11-3} ★★★
Find $\kappa_2(A)$ and $\kappa_2(A^\mathsf TA)$ for $A=\operatorname{diag}(4,1/2)$.
::: solution
The two stretch factors are $4$ and $1/2$, so their ratio is $8$. The Gram factors are $16$ and $1/4$, so their ratio is $64$.
```check
A11=diag(4,S.Half)
same(A11.condition_number(),8); same((A11.T*A11).condition_number(),64)
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which matrix gives the right singular directions?
- [x] $A^\mathsf TA$
- [ ] $AA^\mathsf T$
- [ ] $A+A^\mathsf T$ for every rectangular $A$
> Right singular directions lie in the input space, and their squared stretches are eigenvalues of $A^\mathsf TA$.

? Which parts of the SVD are inverted by the pseudoinverse?
- [ ] Zero singular values only
- [ ] All entries of the original matrix individually
- [x] Nonzero singular values, with input and output directions exchanged
> Null-space directions stay zero, so the computed coefficients have minimum norm.

? What can a very small positive singular value do in a solve?
- [ ] Remove observation noise automatically
- [x] Amplify noise along its corresponding output direction
- [ ] Force the prediction to be an eigenvector
> The solve multiplies that coordinate by the reciprocal of the singular value.
```
