---
title: Determinants, inverses and LU
part: 2
minutes: 80
needs: Modules 2, 3 and 5
lead: Read signed volume from a determinant, recognise invertibility, and reuse elimination through a factorisation.
goals:
  - Compute and interpret a determinant using row operations
  - Connect a nonzero determinant with an inverse
  - Solve a system by forward and backward substitution
---

## Signed area and volume {#determinant}

In two dimensions the columns $(a,c)^\mathsf T$ and $(b,d)^\mathsf T$ enclose a parallelogram with signed area $ad-bc$. The magnitude gives the area. The sign records whether the linear map preserves or reverses orientation. In higher dimensions the square-matrix **determinant** measures the signed volume factor.

Swapping rows reverses its sign, scaling a row scales it by the same factor, and adding a multiple of another row leaves it alone. These rules also follow from the determinant being alternating and linear in each row separately. A triangular matrix has determinant equal to the product of its diagonal entries. Track the row swaps and scalings while reducing.

::: example Reduce without changing the determinant
For $A=\begin{pmatrix}2&1\\4&3\end{pmatrix}$, subtract twice the first row from the second. The resulting triangular matrix has diagonal entries $2,1$, so $\det A=2$. The map doubles ordinary area and preserves orientation.
```check
A6=Matrix([[2,1],[4,3]])
same(A6.det(),2); same((Matrix([[1,0],[-2,1]])*A6).det(),2)
```
:::

## Which maps have an inverse? {#inverse}

For an $n\times n$ matrix the following are equivalent: rank $n$, zero kernel, a unique solution for every right-hand side, and nonzero determinant. Elimination explains the last link: there is a zero diagonal pivot in triangular form precisely when there are fewer than $n$ pivots. The inverse $A^{-1}$ reverses the map. Reducing $[A\mid I]$ gives $[I\mid A^{-1}]$ when the inverse exists.

For a single numerical system, use a solver such as elimination rather than computing the inverse and multiplying by $\mathbf b$. For repeated solves with the same $A$, compute a factorisation once.

## Triangular solves and LU {#lu}

For the example, elimination gives

$$
A=LU,\qquad L=\begin{pmatrix}1&0\\2&1\end{pmatrix},\quad U=\begin{pmatrix}2&1\\0&1\end{pmatrix}.
$$

The entry $2$ in $L$ records the elimination multiplier. To solve $A\mathbf x=\mathbf b$, solve $L\mathbf z=\mathbf b$ from the top down, then $U\mathbf x=\mathbf z$ from the bottom up. With row swaps the common convention is $PA=LU$, so use $P\mathbf b$ on the right of the first solve.

::: compute Verify a factorisation and solve
```python
from sympy import Matrix

A = Matrix([[2, 1], [4, 3]])
L, U, swaps = A.LUdecomposition()
print(L.tolist(), U.tolist(), swaps)
print(list(A.LUsolve(Matrix([5, 11]))))
```
```output
[[1, 0], [2, 1]] [[2, 1], [0, 1]] []
[2, 1]
```
:::

## Exercises {#exercises}

:::: exercise Orientation {#ex-6-1} ★
What happens to area and orientation under $\operatorname{diag}(-2,3)$?
::: solution
The determinant is $-6$. The map multiplies ordinary area by $6$ and reverses orientation.
```check
same(diag(-2,3).det(),-6)
```
:::
::::

:::: exercise Inverse check {#ex-6-2} ★★
Find the inverse of $\begin{pmatrix}1&2\\0&1\end{pmatrix}$.
::: solution
The map sends $(x,y)$ to $(x+2y,y)$. Subtracting $2y$ from the first output reverses it, so the inverse has rows $(1,-2)$ and $(0,1)$.
```check
A6=Matrix([[1,2],[0,1]])
same(A6*Matrix([[1,-2],[0,1]]),eye(2))
```
:::
::::

:::: exercise Solve using factors {#ex-6-3} ★★★
Use the factors above for $\mathbf b=(3,8)^\mathsf T$.
::: solution
The lower triangular solve gives $z_1=3$, $2z_1+z_2=8$, so $z_2=2$. The upper triangular solve gives $x_2=2$ and $2x_1+x_2=3$, so $x_1=1/2$.
```check
same(Matrix([[1,0],[2,1]])*Matrix([3,2]),Matrix([3,8]))
same(Matrix([[2,1],[0,1]])*Matrix([S.Half,2]),Matrix([3,2]))
```
:::
::::

## Check yourself {#quiz}

```quiz
? What happens to a determinant after swapping two rows?
- [ ] It doubles
- [x] Its sign changes
- [ ] Its value stays the same
> Swapping two rows reverses the orientation factor.

? What does determinant zero imply for a square matrix?
- [ ] Every nonzero input is sent to a nonzero output
- [ ] The inverse exists with determinant zero
- [x] The map has a nontrivial kernel
> At least one pivot is missing, leaving a free variable in the homogeneous system.

? For $PA=LU$, what is the first right-hand side for solving $A\mathbf x=\mathbf b$?
- [x] $P\mathbf b$
- [ ] $U\mathbf b$
- [ ] $L\mathbf b$
> Apply the same row permutation to both sides before a triangular solve.
```
