---
title: Low-rank approximation and PCA
part: 3
minutes: 95
needs: Modules 8, 10 and 11
lead: Compress a matrix, derive principal component analysis, and check a complete reconstruction by hand and in Python.
goals:
  - Predict the error of a truncated SVD
  - Centre data and find its principal component directions
  - Reconstruct data and judge the effect of changing feature units
---

## Keep the strongest directions {#low-rank}

The Frobenius norm $\|A\|_F$ is the square root of the sum of squared entries. The rank-$k$ truncation $A_k=\sum_{i=1}^k\sigma_i\mathbf u_i\mathbf v_i^\mathsf T$ drops the smaller singular directions. Orthogonal changes of coordinates preserve Euclidean lengths of columns, and also rows, so
$\|A-A_k\|_F^2=\sum_{i>k}\sigma_i^2$. The truncation attains the smallest Frobenius error among matrices of rank at most $k$.

To see optimality, let $P$ project onto the columns of a competing matrix $B$. The squared error is at least $\|(I-P)A\|_F^2$, since removing its component in the range of $P$ can only shorten it. The energy retained by $P$ is $\|PA\|_F^2=\sum_i \sigma_i^2\|P\mathbf u_i\|^2$. The weights lie in $[0,1]$ and sum to $\operatorname{rank}P\le k$ over a complete orthonormal output basis, by taking the trace of $P$, the sum of its diagonal entries in any orthonormal basis. The largest possible weighted sum puts weight one on each of the first $k$ directions. That choice gives $A_k$.

::: widget name=truncation
Increase the retained rank. Compare the reconstruction with the original matrix and notice the error contributed by each discarded singular value.
:::

## Find the directions of greatest sample variance {#pca}

Store $m>1$ observations as rows. Subtract each column mean to get the centred matrix $X$. Its sample covariance matrix is $C=X^\mathsf TX/(m-1)$. A unit direction $\mathbf v$ gives scores $X\mathbf v$, with sample variance $\mathbf v^\mathsf TC\mathbf v$. In eigenvector coordinates this is a weighted average of the covariance eigenvalues. The maximum is the largest eigenvalue. Restricting each additional direction to be perpendicular to the previous ones gives the following principal components.

The first $k$ right singular vectors of $X$ therefore span a principal subspace. Form the score matrix $XV_k$ and reconstruct the centred observations as $XV_k V_k^\mathsf T$. Add the mean back to recover the original coordinates. The covariance eigenvalues are the squared singular values divided by $m-1$. When the total variance is positive, the fraction explained by a component is its eigenvalue divided by their sum.

::: example Four centred observations
Take $(3,0),(-3,0),(0,1),(0,-1)$. Both means are zero. The scatter matrix $X^\mathsf TX$ has diagonal entries $18,2$ and zero off-diagonal entries. The first component lies along the first coordinate and explains $18/(18+2)=9/10$ of the variance. Reconstruction with one component sends the last two observations to the origin. The squared reconstruction error is $2$.
```check
X12=Matrix([[3,0],[-3,0],[0,1],[0,-1]])
P12=diag(1,0)
same(X12.T*X12,diag(18,2)); same(Rational(18,20),Rational(9,10))
same(sum(v**2 for v in X12-X12*P12),2)
```
:::

PCA depends on units. A column measured in millimetres has larger numerical variance than the same measurements in metres. Standardise when you mean to compare relative variation across nonconstant features. Keep physical units when their relative variation is meaningful. Explained variance measures reconstruction in the chosen coordinates, so assess prediction or classification separately.

::: compute Centring, scoring and reconstructing
```python
from sympy import Matrix, ones

data = Matrix([[13, 5], [7, 5], [10, 6], [10, 4]])
mean = ones(1, 4) * data / 4
X = data - ones(4, 1) * mean
v = Matrix([1, 0])
scores = X * v
reconstruction = scores * v.T + ones(4, 1) * mean
print(list(mean))
print(list(scores))
print(reconstruction.tolist())
print(sum(t**2 for t in data - reconstruction))
```
```output
[10, 5]
[3, -3, 0, 0]
[[13, 5], [7, 5], [10, 5], [10, 5]]
2
```
:::

::: compute Find the component numerically

A numerical SVD can choose either sign for a singular vector. The reconstruction uses both the score and the direction, so a sign flip cancels. The code keeps one component and computes the squared reconstruction error in the original coordinates.

```python
import numpy as np

data = np.array([[13., 5.], [7., 5.], [10., 6.], [10., 4.]])
mean = data.mean(axis=0)
X = data - mean
_, singular, vt = np.linalg.svd(X, full_matrices=False)
direction = vt[0]
scores = X @ direction
restored = scores[:, None] * direction + mean
explained = singular[0] ** 2 / np.dot(singular, singular)
print(f"first component explains {explained:.1%}")
print(f"squared reconstruction error = {np.sum((data - restored)**2):.0f}")
```
```output
first component explains 90.0%
squared reconstruction error = 2
```
:::

## Exercises {#exercises}

:::: exercise Discarded energy {#ex-12-1} ★
If the singular values are $5,3,1$, find the Frobenius error of the best rank-one approximation.
::: solution
Discard $3$ and $1$. Their squared sum is $10$, so the error is $\sqrt{10}$.
```check
same(sqrt(3**2+1**2),sqrt(10))
```
:::
::::

:::: exercise Change the units {#ex-12-2} ★★
In the worked example, multiply the second coordinate by $4$. Which axis now gives the first component, and what fraction of variance does it explain?
::: solution
The squared scatter values become $18$ and $16\cdot2=32$. The second axis leads, explaining $32/(18+32)=16/25$.
```check
Y12=X12*diag(1,4)
same(Y12.T*Y12,diag(18,32)); same(Rational(32,50),Rational(16,25))
```
:::
::::

:::: exercise A rotated principal component {#ex-12-3} ★★★
For centred observations $(2,2),(-2,-2),(1,-1),(-1,1)$, find a unit first component and the squared one-component reconstruction error.
::: solution
The scatter matrix has rows $(10,6)$ and $(6,10)$. Along $(1,1)^\mathsf T/\sqrt2$ its eigenvalue is $16$. Along $(1,-1)^\mathsf T/\sqrt2$ the eigenvalue is $4$. The first direction leads. Projecting onto it drops the last two observations, each of squared length $2$, so the total squared error is $4$.
```check
X12=Matrix([[2,2],[-2,-2],[1,-1],[-1,1]])
v12=Matrix([1,1])/sqrt(2)
same(X12.T*X12,Matrix([[10,6],[6,10]]))
same(X12.T*X12*v12,16*v12)
same(sum(x**2 for x in X12-X12*v12*v12.T),4)
```
:::
::::

## Check yourself {#quiz}

```quiz
? What does subtracting column means do before PCA?
- [ ] Forces every observation to have unit norm
- [x] Places the centre of the observations at the origin
- [ ] Makes the covariance diagonal
> Every centred column has zero mean. Correlations can still remain.

? Which quantity gives the squared Frobenius error of the rank-$k$ truncation?
- [ ] The first discarded singular value
- [ ] The sum of all retained singular values
- [x] The sum of squares of the discarded singular values
> Orthogonal changes of coordinates preserve the Frobenius norm.

? How do you return a centred PCA reconstruction to the original coordinates?
- [x] Add the original column means
- [ ] Re-centre and discard the means again
- [ ] Divide by the number of observations
> Centring subtracted the means, so undo that shift after projection.
```
