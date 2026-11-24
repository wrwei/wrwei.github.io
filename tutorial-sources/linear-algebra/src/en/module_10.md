---
title: Symmetric matrices and quadratic forms
part: 3
minutes: 80
needs: Modules 7 and 9
lead: Find orthogonal principal directions and classify the sign of a quadratic form.
goals:
  - Use an orthonormal eigenbasis for a real symmetric matrix
  - Read the signs of a quadratic form from eigenvalues
  - Connect eigenvalues with the shape of level curves
---

## Orthogonal eigenvectors {#spectral}

A real **symmetric matrix** satisfies $A^\mathsf T=A$. Suppose $A\mathbf u=\lambda\mathbf u$ and $A\mathbf v=\mu\mathbf v$. Symmetry gives $(A\mathbf u)\cdot\mathbf v=\mathbf u\cdot(A\mathbf v)$. If $\lambda\ne\mu$, this forces $\mathbf u\cdot\mathbf v=0$.

The **spectral theorem** says every real symmetric matrix has an orthonormal basis of real eigenvectors. Here is why there is a first direction. The quantity $\mathbf v^\mathsf TA\mathbf v$ attains its maximum at some unit vector on the compact unit sphere. For a unit $\mathbf w$ perpendicular to the maximiser $\mathbf v$, the unit direction $(\mathbf v+t\mathbf w)/\sqrt{1+t^2}$ cannot give a larger value. Expanding and clearing the denominator gives
$$
2t\,\mathbf w^\mathsf TA\mathbf v+t^2(\mathbf w^\mathsf TA\mathbf w-\mathbf v^\mathsf TA\mathbf v)\le 0.
$$
The coefficient of $t$ must vanish. Otherwise, sufficiently small $t$ with the same sign as that coefficient would make the left side positive. Thus $A\mathbf v$ is parallel to $\mathbf v$. Symmetry makes its orthogonal complement invariant. Repeat the argument there until you have an orthonormal basis. With these vectors as columns of $Q$, write $A=Q\Lambda Q^\mathsf T$.

## Shapes in principal coordinates {#forms}

The **quadratic form** of $A$ is $q(\mathbf x)=\mathbf x^\mathsf TA\mathbf x$. In eigenvector coordinates $\mathbf z=Q^\mathsf T\mathbf x$ it becomes $\sum_i\lambda_i z_i^2$. If every eigenvalue is positive, the form is **positive definite**. If all are nonnegative, it is **positive semidefinite**, with a flat direction when one is zero. Eigenvalues of both signs give an **indefinite** form.

::: example A rotated bowl
For $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ the unit directions are $(1,1)^\mathsf T/\sqrt2$ and $(1,-1)^\mathsf T/\sqrt2$, with eigenvalues $3$ and $1$. Its form is $3z_1^2+z_2^2$ in these coordinates. The level curve with value one meets the first axis at distance $1/\sqrt3$ and the second at distance one.
```check
A10=Matrix([[2,1],[1,2]])
Q10=Matrix([[1,1],[1,-1]])/sqrt(2)
same(Q10.T*A10*Q10,diag(3,1)); same(Q10.T*Q10,eye(2))
```
:::

::: widget name=spectra
Compare the principal directions and the contours of the symmetric presets. Try a positive definite form, an indefinite form and one with a flat direction.
:::

::: compute Eigenvalues and a quadratic form
```python
from sympy import Matrix

A = Matrix([[2, 1], [1, 2]])
x = Matrix([1, -1])
print(sorted(A.eigenvals()))
print((x.T * A * x)[0])
```
```output
[1, 3]
2
```
:::

## Exercises {#exercises}

:::: exercise Flat direction {#ex-10-1} ★
Classify $q(x,y)=4x^2$ and give a nonzero vector where it vanishes.
::: solution
Its matrix has eigenvalues $4$ and $0$. The form is positive semidefinite and vanishes at $(0,1)^\mathsf T$.
```check
same(list(diag(4,0).eigenvals()),[4,0])
same((Matrix([[0,1]])*diag(4,0)*Matrix([0,1]))[0],0)
```
:::
::::

:::: exercise A saddle direction {#ex-10-2} ★★
Classify $q(x,y)=2xy$ by finding its values at $(1,1)$ and $(1,-1)$.
::: solution
The values are $2$ and $-2$. The form is indefinite. Its symmetric matrix has off-diagonal entries one and diagonal entries zero.
```check
A10=Matrix([[0,1],[1,0]])
same([(v.T*A10*v)[0] for v in (Matrix([1,1]),Matrix([1,-1]))],[2,-2])
```
:::
::::

:::: exercise A uniform lower bound {#ex-10-3} ★★★
Show that $2\|\mathbf x\|^2\le\mathbf x^\mathsf TA\mathbf x$ whenever the symmetric matrix $A$ has every eigenvalue at least $2$. Give a case of equality.
::: solution
Use orthonormal eigenvector coordinates, where the squared norm is $\sum_i z_i^2$. Each difference $(\lambda_i-2)z_i^2$ is nonnegative. Equality is attained for an eigenvector with eigenvalue $2$, for example the first coordinate vector for $\operatorname{diag}(2,5)$.
```check
v10=Matrix([x,y])
same((v10.T*diag(2,5)*v10)[0]-2*v10.dot(v10),3*y**2)
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which matrices have an orthonormal real eigenbasis by the spectral theorem?
- [ ] Every invertible real matrix
- [x] Every real symmetric matrix
- [ ] Every triangular real matrix
> Symmetry supplies invariant orthogonal complements, giving a basis by induction.

? What does a zero eigenvalue imply for a positive semidefinite form?
- [x] The form vanishes in a nonzero direction
- [ ] The form is negative in that direction
- [ ] The form is zero everywhere
> An eigenvector with zero eigenvalue gives zero quadratic value.

? In principal coordinates, what are the coefficients of the squares?
- [ ] The entries of $Q$
- [ ] The diagonal entries of $A$ in the original basis
- [x] The eigenvalues
> Orthogonal diagonalisation leaves a sum of independent squared coordinates.
```
