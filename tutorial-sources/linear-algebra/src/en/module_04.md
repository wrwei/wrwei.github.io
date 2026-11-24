---
title: Subspaces, bases and dimension
part: 1
minutes: 80
needs: Modules 1–3
lead: Describe the directions a set can reach and find coordinates that express each vector uniquely.
goals:
  - Test whether a set is a subspace
  - Distinguish spanning from linear independence
  - Find a basis and use it to change coordinates
---

## Closure and span {#span}

A **subspace** of $\mathbb R^n$ contains zero and is closed under addition and scalar multiplication. An equivalent test for a nonempty set is closure under every linear combination of two of its members. This explains why the line $y=2x$ is a subspace and the parallel line $y=2x+1$ is not. The latter misses zero.

The **span** of a list of vectors consists of all their linear combinations. It is a subspace because adding or scaling combinations gives another combination of the same list. In particular, the span is the smallest subspace containing the list.

::: widget name=spans
Change the generating vectors. Compare the two directions when they are independent with what happens when one is a multiple of the other.
:::

## Independent directions and coordinates {#basis}

A list is **linearly independent** when the zero vector has only one representation as a combination of the list, with all coefficients zero. Otherwise at least one vector is redundant: solve a nonzero relation for any vector with a nonzero coefficient.

A **basis** is an independent spanning list. Spanning gives coordinates for every vector. Independence makes those coordinates unique, because two different coordinate lists for the same vector would yield a nonzero relation on subtraction. The **dimension** is the number of vectors in a basis. One way to justify that the count is fixed: a basis of $k$ vectors identifies the space with $\mathbb R^k$, where more than $k$ vectors are dependent by elimination and fewer than $k$ cannot span because their matrix has fewer than $k$ pivots.

::: example A basis in a plane
In $\mathbb R^3$ take the plane $x+y+z=0$. Put $x=s$, $y=t$ and then $z=-s-t$. The vectors $(1,0,-1)^\mathsf T$ and $(0,1,-1)^\mathsf T$ span the plane. Comparing their first two entries proves independence. The dimension is $2$.
```check
B4=Matrix([[1,0],[0,1],[-1,-1]])
same(B4*Matrix([s,t]),Matrix([s,t,-s-t]))
same(B4.rank(),2)
```
:::

## Change the basis, keep the vector {#coordinates}

Put the basis columns into $B$. If $\mathbf c$ is the coordinate vector relative to that ordered basis, then $B\mathbf c$ is the vector in ordinary coordinates. To find $\mathbf c$, solve $B\mathbf c=\mathbf v$. The same physical displacement can have different coordinates in different bases.

::: compute Coordinates in a nonstandard basis
```python
from sympy import Matrix

B = Matrix([[1, 1], [0, 1]])
v = Matrix([5, 2])
print(list(B.LUsolve(v)))
```
```output
[3, 2]
```
:::

## Exercises {#exercises}

:::: exercise Offset plane {#ex-4-1} ★
Is $x+y+z=1$ a subspace of $\mathbb R^3$?
::: solution
No. Zero fails the equation, since its coordinate sum is $0$.
```check
same(sum([0,0,0]),0); holds(0!=1)
```
:::
::::

:::: exercise Remove a redundant generator {#ex-4-2} ★★
Find a basis for the span of $(1,0,1)^\mathsf T$, $(0,1,1)^\mathsf T$, and $(1,1,2)^\mathsf T$.
::: solution
The third is the sum of the first two, so it adds no direction. The first two are independent because their first two entries form the coordinate vectors of $\mathbb R^2$. Keep those two.
```check
C4=Matrix([[1,0],[0,1],[1,1]])
same(C4*Matrix([1,1]),Matrix([1,1,2])); same(C4.rank(),2)
```
:::
::::

:::: exercise Coordinates in two bases {#ex-4-3} ★★★
Find the coordinates of $(5,2)^\mathsf T$ relative to the ordered basis $(1,0)^\mathsf T,(1,1)^\mathsf T$, then relative to the reversed order.
::: solution
In the first order, the second entry gives coefficient $2$ for $(1,1)^\mathsf T$. The first entry leaves coefficient $3$ for $(1,0)^\mathsf T$. Reversing the order gives coordinates $(2,3)^\mathsf T$.
```check
D4=Matrix([[1,1],[0,1]])
same(D4*Matrix([3,2]),Matrix([5,2])); same(D4[:,::-1]*Matrix([2,3]),Matrix([5,2]))
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is the dimension of the span of a single nonzero vector?
- [x] One
- [ ] The number of entries
- [ ] Zero
> That vector alone is an independent spanning list.

? Which line is a subspace?
- [ ] $y=x+1$
- [ ] $x=2$
- [x] $x=0$
> The line $x=0$ contains zero and all linear combinations of its points.

? Why are basis coordinates unique?
- [ ] All basis vectors have unit length
- [x] The basis vectors are independent
- [ ] The basis vectors have nonnegative entries
> Subtracting two representations gives a linear combination equal to zero.
```
