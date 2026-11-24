---
title: Rank, nullity and the four subspaces
part: 2
minutes: 80
needs: Modules 2–4
lead: Distinguish reachable outputs from invisible input directions and connect them by rank–nullity.
goals:
  - Find bases for the column and null spaces by elimination
  - Locate all four fundamental subspaces in their ambient spaces
  - Explain the structure of all solutions of a consistent system
---

## Outputs and invisible directions {#four-spaces}

For $A$ of size $m\times n$, the **column space** (image) is the set of reachable outputs $A\mathbf x$, in $\mathbb R^m$. The **null space** (kernel) is the set of inputs sent to zero, in $\mathbb R^n$.

The other two spaces come from $A^\mathsf T$. Its column space is the **row space** of $A$, in $\mathbb R^n$. Its null space is the **left null space**, in $\mathbb R^m$. The names identify where to look. An input is in the null space exactly when its dot product with each row is zero. In the same way, the left null space is perpendicular to all columns.

## Pivots and the dimension count {#rank-nullity}

Row operations preserve linear relations between columns, since they amount to an invertible operation on the output. Thus the pivot indices identify independent columns in the **original** matrix. The pivots in reduced form give their count $r$, the **rank**. The nonzero rows of reduced form are a basis of the row space. The homogeneous system has $n-r$ free coordinates. Choosing one free coordinate to be one and the rest zero gives one null-space basis vector per free coordinate. Hence rank plus nullity is $n$.

::: example A map with one output direction
Let $A=\begin{pmatrix}1&2&3\\2&4&6\end{pmatrix}$. The second row is twice the first, so there is one pivot. The first column $(1,2)^\mathsf T$ spans the image. Choosing the second and third inputs as free variables gives null-space basis $(-2,1,0)^\mathsf T$, $(-3,0,1)^\mathsf T$. The dimensions add to $1+2=3$.
```check
A5=Matrix([[1,2,3],[2,4,6]])
same(A5.rank(),1)
same(A5.nullspace(),[Matrix([-2,1,0]),Matrix([-3,0,1])])
same(A5.columnspace(),[Matrix([1,2])])
```
:::

## One solution plus a subspace {#families}

If $A\mathbf p=\mathbf b$, then $A(\mathbf p+\mathbf z)=\mathbf b$ for every $\mathbf z$ in the kernel. Conversely, any solution minus $\mathbf p$ lies in the kernel. If $\mathbf b$ is outside the column space there is no solution. This separates existence, controlled by the image, from uniqueness, controlled by the kernel.

::: compute Bases in exact arithmetic
```python
from sympy import Matrix

A = Matrix([[1, 2, 3], [2, 4, 6]])
print(A.rank())
print([list(v) for v in A.nullspace()])
print([list(v) for v in A.T.nullspace()])
```
```output
1
[[-2, 1, 0], [-3, 0, 1]]
[[-2, 1]]
```
:::

## Exercises {#exercises}

:::: exercise Left null space {#ex-5-1} ★
For the example matrix, give a nonzero vector in the left null space.
::: solution
Since the second row is twice the first, $(-2,1)^\mathsf T$ annihilates both rows in that combination. Equivalently $A^\mathsf T(-2,1)^\mathsf T=\mathbf 0$.
```check
same(A5.T*Matrix([-2,1]),zeros(3,1))
```
:::
::::

:::: exercise Is the output possible? {#ex-5-2} ★★
For the same matrix, decide whether $(3,6)^\mathsf T$ and $(3,7)^\mathsf T$ are reachable.
::: solution
The first is three times the first column. Every output has second entry twice its first, so the second target is impossible.
```check
same(A5*Matrix([3,0,0]),Matrix([3,6]))
same(A5.row_join(Matrix([3,7])).rank(),2)
```
:::
::::

:::: exercise Dimension without reducing again {#ex-5-3} ★★★
A $5\times8$ matrix has rank $3$. Give the dimensions of its four subspaces.
::: solution
The column and row spaces both have dimension $3$. Rank–nullity gives kernel dimension $8-3=5$. Apply the same count to the transpose to get left null dimension $5-3=2$.
```check
B5=zeros(5,8)
B5[:3,:3]=eye(3)
same([B5.rank(),B5.T.rank(),len(B5.nullspace()),len(B5.T.nullspace())],[3,3,5,2])
```
:::
::::

## Check yourself {#quiz}

```quiz
? Where does the null space of a $4\times7$ matrix live?
- [ ] In $\mathbb R^4$
- [x] In $\mathbb R^7$
- [ ] In $\mathbb R^{11}$
> Its vectors are inputs, and there are seven input coordinates.

? Where should you take pivot columns when finding a basis of the image?
- [ ] From the identity matrix
- [ ] From the reduced matrix
- [x] From the original matrix
> Row reduction identifies the column indices but may change the image itself.

? If one solution exists and the kernel is zero, how many solutions are there?
- [x] One
- [ ] None
- [ ] Infinitely many
> Any other solution would differ from the first by an element of the kernel.
```
