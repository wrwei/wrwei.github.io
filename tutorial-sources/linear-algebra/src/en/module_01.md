---
title: Vectors and dot products
part: 1
minutes: 65
needs: School algebra and the Pythagorean theorem
lead: Add and scale vectors, measure their lengths, and use a dot product to compare directions.
goals:
  - Interpret a column of numbers as a displacement or a list of measurements
  - Use linear combinations to assemble a vector
  - Compute lengths, angles and dot products
---

## From a displacement to a column {#vectors}

Walk three metres east and four metres north. The displacement is the column vector $\mathbf v=\begin{pmatrix}3\\4\end{pmatrix}$. Moving the arrow to another starting point leaves the displacement the same. The entries are coordinates relative to two chosen axes.

A vector can also hold data. If the coordinates are temperatures at two stations, subtracting two days gives the change at each station. You can add vectors with the same coordinate convention and multiply a vector by a scalar, a single number. Multiplying by a negative number reverses the direction.

::: example Combining moves
Take $\mathbf u=(2,1)^\mathsf T$ and $\mathbf v=(-1,3)^\mathsf T$. Two copies of $\mathbf u$ followed by one $\mathbf v$ give $2\mathbf u+\mathbf v=(4,2)^\mathsf T+(-1,3)^\mathsf T=(3,5)^\mathsf T$. A sum of scaled vectors is a **linear combination**.
```check
same(2*Matrix([2,1])+Matrix([-1,3]),Matrix([3,5]))
```
:::

::: widget name=vectors
Change the components of the two vectors. Compare their sum and dot product. Try perpendicular vectors, then point both in the same direction.
:::

## Length and angle {#dot}

The **dot product** $\mathbf u\cdot\mathbf v$ pairs corresponding entries and adds their products. The **Euclidean norm** is $\|\mathbf v\|=\sqrt{\mathbf v\cdot\mathbf v}$. A vector of length one is a **unit vector**.

For nonzero vectors the angle $\theta$ satisfies

$$
\cos\theta=\frac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\|\mathbf v\|}.
$$

To see why, expand $\|\mathbf u-\mathbf v\|^2$ as a dot product, then compare with the cosine rule for the triangle. At a right angle the dot product is zero. A negative dot product means the angle is obtuse. Two vectors with zero dot product are **orthogonal**. The zero vector is orthogonal to every vector, but it has no direction and no angle with another vector.

::: example A direction and a length
For $\mathbf u=(1,2)^\mathsf T$ and $\mathbf v=(2,-1)^\mathsf T$, the dot product is $1\cdot2+2(-1)=0$. Both have length $\sqrt5$, so the nonzero vectors meet at a right angle.
```check
u1,v1=Matrix([1,2]),Matrix([2,-1])
same(u1.dot(v1),0); same(u1.norm(),sqrt(5)); same(v1.norm(),sqrt(5))
```
:::

::: pitfall
The sign of the dot product says something about the angle, not the length. The vector $(-3,-4)^\mathsf T$ still has length $5$.
:::

::: compute Exact vector arithmetic
SymPy uses a column when you pass a list to Matrix.
```python
from sympy import Matrix

v = Matrix([3, 4])
print(v.norm())
print(list(v / v.norm()))
```
```output
5
[3/5, 4/5]
```
:::

## Exercises {#exercises}

:::: exercise A combination {#ex-1-1} ★
Find $3(1,-2)^\mathsf T-2(2,1)^\mathsf T$.
::: solution
Compute entry by entry. The first coordinate is $3-4=-1$ and the second is $-6-2=-8$.
```check
same(3*Matrix([1,-2])-2*Matrix([2,1]),Matrix([-1,-8]))
```
:::
::::

:::: exercise Find a perpendicular vector {#ex-1-2} ★★
Find a unit vector perpendicular to $(3,4)^\mathsf T$.
::: solution
The vector $(-4,3)^\mathsf T$ has dot product $-12+12=0$ with the original and length $5$. Divide it by $5$. The opposite unit vector also works.
```check
u1=Matrix([-4,3])/5
same(u1.dot(Matrix([3,4])),0); same(u1.norm(),1)
```
:::
::::

:::: exercise Dot product from lengths {#ex-1-3} ★★★
If $\|\mathbf u\|=2$, $\|\mathbf v\|=3$ and $\|\mathbf u+\mathbf v\|^2=7$, find the dot product.
::: solution
Expanding the squared norm gives $7=4+2\mathbf u\cdot\mathbf v+9$. Thus $\mathbf u\cdot\mathbf v=-3$.
```check
same(solve(4+2*x+9-7,x),[-3])
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is the length of $(0,-5)^\mathsf T$?
- [ ] $-5$
- [x] $5$
- [ ] $25$
> Length is the non-negative square root of the sum of the squared entries.

? Which vector is orthogonal to $(2,1)^\mathsf T$?
- [ ] $(2,1)^\mathsf T$
- [ ] $(1,2)^\mathsf T$
- [x] $(-1,2)^\mathsf T$
> The dot product is $2(-1)+1\cdot2=0$.

? When is $\mathbf v/\|\mathbf v\|$ defined?
- [x] When $\mathbf v\ne\mathbf 0$
- [ ] Only when $\mathbf v$ already has unit length
- [ ] For every $\mathbf v$
> The denominator is positive exactly for nonzero vectors.
```
