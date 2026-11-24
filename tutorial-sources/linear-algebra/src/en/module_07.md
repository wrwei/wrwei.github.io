---
title: Orthogonality and QR
part: 2
minutes: 85
needs: Modules 1, 4 and 5
lead: Project onto a direction or a subspace, build an orthonormal basis, and factor a matrix as QR.
goals:
  - Compute an orthogonal projection and its residual
  - Carry out Gram–Schmidt on independent columns
  - Read the shape and meaning of a thin QR factorisation
---

## Drop the perpendicular {#projection}

To approximate $\mathbf b$ by $c\mathbf u$ for nonzero $\mathbf u$, choose the point on the line where the residual is perpendicular to $\mathbf u$. Solving $\mathbf u\cdot(\mathbf b-c\mathbf u)=0$ gives

$$
c=\frac{\mathbf u\cdot\mathbf b}{\mathbf u\cdot\mathbf u}.
$$

For any other point of the line, the squared distance to $\mathbf b$ is the squared length of the same perpendicular residual plus the squared distance along the line. The Pythagorean theorem makes the perpendicular foot the unique closest point.

::: example A projection and its residual
For $\mathbf u=(1,2)^\mathsf T$ and $\mathbf b=(3,1)^\mathsf T$, the coefficient is $5/5=1$. The projection is $(1,2)^\mathsf T$ and the residual $(2,-1)^\mathsf T$. Their dot product is zero.
```check
u7,b7=Matrix([1,2]),Matrix([3,1])
p7=u7*u7.dot(b7)/u7.dot(u7)
same(p7,Matrix([1,2])); same(b7-p7,Matrix([2,-1])); same(u7.dot(b7-p7),0)
```
:::

::: widget name=projections
Select the Euclidean inner product, then move the target and change the direction of the line. Check that the residual stays perpendicular to the line when its direction is nonzero.
:::

## An orthonormal basis and Gram–Schmidt {#gram-schmidt}

A list is **orthonormal** when its vectors have unit length and distinct vectors are orthogonal. If $Q$ stores an orthonormal basis as columns, $Q^\mathsf T\mathbf b$ gives coefficients of the projection. In fact, $Q^\mathsf TQ=I$ and $Q^\mathsf T(\mathbf b-QQ^\mathsf T\mathbf b)=0$.

**Gram–Schmidt** turns independent columns into such a basis. At each step subtract the projection of the next column onto the preceding orthonormal columns. Normalise the residual. Its length is nonzero by independence. The new vectors span the same spaces at each step, since the subtracted vector is in the previous span.

## The factorisation {#qr}

For $m\times n$ matrix $A$ with independent columns, this procedure gives $A=QR$ with $Q$ of shape $m\times n$ and $R$ upper triangular of shape $n\times n$. Column $j$ of $A$ combines only the first $j$ columns of $Q$. The coefficient of the newest direction is the length of the residual. In floating-point work use a library QR routine. It can use orthogonal reflections to avoid loss of orthogonality when columns nearly depend on each other.

::: compute Check both properties
```python
from sympy import Matrix

A = Matrix([[1, 1], [1, 0], [0, 1]])
Q, R = A.QRdecomposition()
print((Q.T * Q).tolist())
print(Q * R == A)
```
```output
[[1, 0], [0, 1]]
True
```
:::

## Exercises {#exercises}

:::: exercise Project onto the first axis {#ex-7-1} ★
Project $(3,4)^\mathsf T$ onto $(2,0)^\mathsf T$.
::: solution
The coefficient is $6/4=3/2$, so the projection is $(3,0)^\mathsf T$. The remaining vector $(0,4)^\mathsf T$ is perpendicular to the axis.
```check
u7=Matrix([2,0]); b7=Matrix([3,4])
same(u7*(u7.dot(b7)/u7.dot(u7)),Matrix([3,0]))
```
:::
::::

:::: exercise One Gram–Schmidt step {#ex-7-2} ★★
Orthonormalise $(1,1)^\mathsf T,(1,0)^\mathsf T$ in that order.
::: solution
Normalise the first to $(1,1)^\mathsf T/\sqrt2$. Subtract $(1/2,1/2)^\mathsf T$ from the second, leaving $(1/2,-1/2)^\mathsf T$. Normalising gives $(1,-1)^\mathsf T/\sqrt2$.
```check
Q7=Matrix([[1,1],[1,-1]])/sqrt(2)
same(Q7.T*Q7,eye(2)); same(Q7.T*Matrix([[1,1],[1,0]]),Matrix([[sqrt(2),1/sqrt(2)],[0,1/sqrt(2)]]))
```
:::
::::

:::: exercise Project twice {#ex-7-3} ★★★
Prove $(QQ^\mathsf T)^2=QQ^\mathsf T$ when $Q$ has orthonormal columns.
::: solution
Associate the middle factors as $Q^\mathsf TQ=I$. The product is $QIQ^\mathsf T$. A second projection therefore leaves the first result in place.
```check
Q7=Matrix([1,2,2])/3
P7=Q7*Q7.T
same(P7**2,P7)
```
:::
::::

## Check yourself {#quiz}

```quiz
? Why is there a denominator in the projection coefficient onto a non-unit vector?
- [x] It accounts for the squared length of the direction vector
- [ ] It makes every projection a unit vector
- [ ] It makes the residual zero
> Solving the perpendicularity condition divides by the vector's dot product with itself.

? Which identity holds for a tall matrix $Q$ with orthonormal columns?
- [ ] $QQ^\mathsf T=I$ in the output space
- [x] $Q^\mathsf TQ=I$ in the coordinate space
- [ ] $Q^\mathsf TQ=0$
> Every inner product of distinct columns vanishes and each squared column norm equals one.

? What happens in Gram–Schmidt if the next column is in the previous span?
- [ ] The residual is a new unit direction
- [ ] The next column becomes perpendicular automatically
- [x] The residual is zero
> Subtracting its projection removes the whole column, so it cannot be normalised.
```
