---
title: Least squares and conditioning
part: 2
minutes: 80
needs: Modules 5 and 7
lead: Fit inconsistent data by projecting onto the column space and assess the sensitivity of the coefficients.
goals:
  - Form a design matrix for a fit
  - Derive the normal equations from residual orthogonality
  - Compare QR with the normal equations for a numerical solve
---

## The closest reachable observation {#least-squares}

Suppose $\mathbf b$ consists of measurements and $A\mathbf x$ is the vector of predictions. There may be no exact solution. **Least squares** minimises $\|A\mathbf x-\mathbf b\|^2$. The fitted vector is the orthogonal projection of $\mathbf b$ onto the column space, because that is where every candidate prediction lies. The residual $\mathbf r=\mathbf b-A\widehat{\mathbf x}$ is orthogonal to every column. This gives the **normal equations**

$$
A^\mathsf TA\widehat{\mathbf x}=A^\mathsf T\mathbf b.
$$

Conversely, any solution of these equations is a least-squares solution by the squared-distance decomposition. The fitted vector is unique even if the coefficients are not. Any two coefficient vectors producing the same fit differ by a null-space vector.

::: example Fit a line with intercept
For data $(0,1),(1,2),(2,2)$, use columns of ones and input values, in that order. The normal equations for intercept $a$ and slope $b$ are $3a+3b=5$ and $3a+5b=6$. Subtraction gives $b=1/2$ and then $a=7/6$. The residuals $(-1/6,1/3,-1/6)$ sum to zero and also have zero dot product with $(0,1,2)^\mathsf T$.
```check
A8=Matrix([[1,0],[1,1],[1,2]]); y8=Matrix([1,2,2])
x8=Matrix([Rational(7,6),S.Half]); r8=y8-A8*x8
same(A8.T*A8,Matrix([[3,3],[3,5]])); same(A8.T*y8,Matrix([5,6]))
same(r8,Matrix([-Rational(1,6),Rational(1,3),-Rational(1,6)])); same(A8.T*r8,zeros(2,1))
```
:::

## Solve with QR {#solve}

For independent columns, write $A=QR$ and express the projection as $QQ^\mathsf T\mathbf b$. Matching coefficients in the columns of $Q$ gives $R\widehat{\mathbf x}=Q^\mathsf T\mathbf b$. This is a triangular solve. It avoids forming $A^\mathsf TA$, whose condition number is the square of that of $A$. [Module 11](module_11_EN.html#sizes) derives that ratio.

Small perturbations in observations can force a large change in coefficients when the columns are nearly dependent. For $A=\begin{pmatrix}1&1\\0&\varepsilon\end{pmatrix}$, increasing the second observation by $\varepsilon$ increases the second coefficient by $1$ and decreases the first by $1$. The prediction has only changed a little. Treat a small residual as evidence about fit to the measurements, and examine sensitivity separately.

::: compute Solve the line fit with QR
```python
from sympy import Matrix

A = Matrix([[1, 0], [1, 1], [1, 2]])
b = Matrix([1, 2, 2])
Q, R = A.QRdecomposition()
x = R.upper_triangular_solve(Q.T * b)
print(list(x))
print(list(A.T * (b - A * x)))
```
```output
[7/6, 1/2]
[0, 0]
```
:::

::: compute Fit a line to floating-point data

NumPy's least-squares solver returns the coefficients and a numerical rank. Give the column order a name before interpreting the result. The residual norm measures the size of the fit error in observation coordinates.

```python
import numpy as np

x_data = np.array([0., 1., 2.])
y_data = np.array([1., 2., 2.])
design = np.column_stack((np.ones(x_data.size), x_data))
coefficients, _, rank, _ = np.linalg.lstsq(design, y_data, rcond=None)
residual = y_data - design @ coefficients
print(f"intercept={coefficients[0]:.3f}, slope={coefficients[1]:.3f}")
print(f"rank={rank}, residual norm={np.linalg.norm(residual):.3f}")
```
```output
intercept=1.167, slope=0.500
rank=2, residual norm=0.408
```
:::

## Exercises {#exercises}

:::: exercise Best constant {#ex-8-1} ★
What constant best fits $1,4,7$ in the least-squares sense?
::: solution
The design matrix is a column of ones. Residual orthogonality says their sum vanishes, so the fitted constant is the mean $4$.
```check
same(Rational(1+4+7,3),4)
same(ones(1,3)*(Matrix([1,4,7])-4*ones(3,1)),zeros(1,1))
```
:::
::::

:::: exercise Fit with redundant columns {#ex-8-2} ★★
For $A=\begin{pmatrix}1&1\\0&0\end{pmatrix}$ and $\mathbf b=(3,2)^\mathsf T$, find the fitted vector and describe all coefficients.
::: solution
The column space is the first axis, so the fit is $(3,0)^\mathsf T$. Any coefficients with $x_1+x_2=3$ produce it, for instance $(3-t,t)^\mathsf T$.
```check
A8=Matrix([[1,1],[0,0]])
same(A8*Matrix([3-t,t]),Matrix([3,0]))
same(A8.T*Matrix([0,2]),zeros(2,1))
```
:::
::::

:::: exercise Sensitivity {#ex-8-3} ★★★
For $A=\begin{pmatrix}1&1\\0&1/1000\end{pmatrix}$, compare the coefficient change when the second observation moves by $1/1000$ with the first observation fixed.
::: solution
The second row forces the second coefficient to increase by $1$. The first row fixes the sum, so the first coefficient decreases by $1$.
```check
A8=Matrix([[1,1],[0,Rational(1,1000)]])
same(A8*Matrix([-1,1]),Matrix([0,Rational(1,1000)]))
```
:::
::::

## Check yourself {#quiz}

```quiz
? In an unweighted least-squares fit, what is perpendicular to each design column?
- [ ] The observation vector
- [x] The residual
- [ ] The fitted vector
> Residual orthogonality expresses that the fit is the closest point in the column space.

? Can a rank-deficient design have a unique fitted vector?
- [x] Yes, the orthogonal projection is unique
- [ ] No, every fitted vector must then be zero
- [ ] Only if the coefficients are unique
> Coefficients may differ by a null-space vector while producing the same fit.

? What do you solve after a thin QR factorisation with independent columns?
- [ ] $Q\widehat{\mathbf x}=R\mathbf b$
- [ ] $R\widehat{\mathbf x}=\mathbf b$
- [x] $R\widehat{\mathbf x}=Q^\mathsf T\mathbf b$
> The projection coefficients are the inner products of the observations with the columns of $Q$.
```
