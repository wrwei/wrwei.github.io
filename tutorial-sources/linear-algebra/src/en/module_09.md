---
title: Eigenvalues and diagonalisation
part: 3
minutes: 85
needs: Modules 3–6
lead: Find invariant directions and use an eigenbasis to understand repeated applications of a map.
goals:
  - Find eigenvalues from the characteristic equation
  - Find an eigenspace as a null space
  - Decide whether an eigenbasis exists and use it to compute powers
---

## Directions that survive the map {#eigenpairs}

An **eigenvector** of a square matrix $A$ is a nonzero vector $\mathbf v$ such that $A\mathbf v=\lambda\mathbf v$. Its eigenvalue $\lambda$ records what the map does along that direction. A negative value reverses it. A zero eigenvalue is allowed and signals a nonzero kernel.

For a candidate $\lambda$, the condition is $(A-\lambda I)\mathbf v=\mathbf 0$. A nonzero solution exists exactly when $\det(A-\lambda I)=0$. Find these roots first, then solve a homogeneous system for each root. The entire kernel is the **eigenspace** and includes zero, although zero is never an eigenvector.

::: example Two eigenvectors of a triangular matrix
For $A=\begin{pmatrix}2&1\\0&1\end{pmatrix}$ the determinant polynomial is $(2-\lambda)(1-\lambda)$. With $\lambda=2$, take $(1,0)^\mathsf T$. With $\lambda=1$, solve $x+y=0$ and take $(-1,1)^\mathsf T$.
```check
A9=Matrix([[2,1],[0,1]])
same((A9-x*eye(2)).det(),(2-x)*(1-x))
same(A9*Matrix([1,0]),2*Matrix([1,0])); same(A9*Matrix([-1,1]),Matrix([-1,1]))
```
:::

## Change to eigenvector coordinates {#diagonalisation}

If $A$ has an eigenbasis, put the eigenvectors into the columns of $P$ and the eigenvalues in the matching order on the diagonal of $D$. Then $AP=PD$, so $A=PDP^{-1}$. Convert to eigenvector coordinates, scale each coordinate independently, then convert back. In a power $A^k$ the middle factors $P^{-1}P$ cancel, leaving $PD^kP^{-1}$. A factor with magnitude below one decays as $k$ increases. For the example, $(0,1)^\mathsf T$ is the sum of the two selected eigenvectors, so after $k$ steps it is $(2^k-1,1)^\mathsf T$.

Distinct eigenvalues have independent eigenvectors. In a shortest nontrivial linear relation, applying $A-\lambda I$ for one eigenvalue in the relation would remove that vector and leave a shorter nontrivial relation. Thus $n$ distinct real eigenvalues suffice for a real eigenbasis. Repetition alone gives no verdict. Some real matrices also have complex eigenpairs and no real eigenbasis.

::: compute A repeated eigenvalue with a missing direction
```python
from sympy import Matrix

A = Matrix([[1, 1], [0, 1]])
for value, multiplicity, basis in A.eigenvects():
    print(value, multiplicity, [list(v) for v in basis])
print((A**4).tolist())
```
```output
1 2 [[1, 0]]
[[1, 4], [0, 1]]
```
:::

## Exercises {#exercises}

:::: exercise Verify a direction {#ex-9-1} ★
For $A=\operatorname{diag}(-2,3)$ find the eigenvalue of $(1,0)^\mathsf T$.
::: solution
The first column is $(-2,0)^\mathsf T$, equal to $-2$ times the given direction.
```check
same(diag(-2,3)*Matrix([1,0]),-2*Matrix([1,0]))
```
:::
::::

:::: exercise A repeated root {#ex-9-2} ★★
Compare eigenbases of $2I_2$ and $\begin{pmatrix}2&1\\0&2\end{pmatrix}$.
::: solution
Every nonzero vector is an eigenvector of $2I_2$, so the usual coordinate basis works. Subtracting $2I_2$ from the other matrix forces the second coordinate to zero. There is only one independent eigenvector.
```check
same((2*eye(2)-2*eye(2)).nullspace(),[Matrix([1,0]),Matrix([0,1])])
same((Matrix([[2,1],[0,2]])-2*eye(2)).nullspace(),[Matrix([1,0])])
```
:::
::::

:::: exercise Repeated application {#ex-9-3} ★★★
Use the eigenvectors in the worked example to find $A^5(0,1)^\mathsf T$.
::: solution
The starting vector is one copy of each eigenvector. Scale the first by $2^5=32$ and keep the second. The result is $(31,1)^\mathsf T$.
```check
same(A9**5*Matrix([0,1]),Matrix([31,1]))
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which quantity may be zero in an eigenpair?
- [x] The eigenvalue
- [ ] The eigenvector
- [ ] Both must be zero
> A nonzero vector in the kernel is an eigenvector with eigenvalue zero.

? When does a real $n\times n$ matrix necessarily have a real eigenbasis?
- [ ] Whenever it has one repeated real eigenvalue
- [x] Whenever it has $n$ distinct real eigenvalues
- [ ] Whenever its determinant is positive
> Eigenvectors from distinct eigenvalues are independent.

? In $A=PDP^{-1}$, what do the columns of $P$ hold?
- [ ] The eigenvalues
- [ ] The rows of $A$
- [x] Eigenvectors in the order used by $D$
> Column $j$ of $AP=PD$ is the $j$th eigenpair equation.
```
