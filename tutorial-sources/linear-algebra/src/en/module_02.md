---
title: Linear systems and elimination
part: 1
minutes: 75
needs: Module 1 and simultaneous equations
lead: Reduce a system row by row, read its pivots and free variables, and tell when constraints conflict.
goals:
  - Translate simultaneous equations into an augmented matrix
  - Perform reversible row operations
  - Classify and describe all solutions of a system
---

## Equations as rows {#rows}

Each row stores the coefficients of one equation and the value on its right. The augmented matrix records both. Swap two equations, multiply an equation by a nonzero scalar, or add a multiple of another equation to it. Each operation is reversible, so it preserves the solution set.

**Elimination** creates leading entries, called **pivots**, with zeros below them. In reduced row echelon form every pivot is $1$ and is the only nonzero entry in its column. Pivot columns move right as you go down the nonzero rows.

::: example Eliminate a variable
For $x+2y=5$ and $3x+5y=13$, subtract three times the first equation from the second. The new second equation is $-y=-2$, so $y=2$ and the first gives $x=1$.
```check
same(Matrix([[1,2,5],[3,5,13]]).rref()[0],Matrix([[1,0,1],[0,1,2]]))
```
:::

## Read the whole solution set {#solutions}

If a row says $0=1$, the system is inconsistent. Otherwise, pick arbitrary values for variables whose coefficient columns have no pivot. These **free variables** determine the remaining variables through the pivot equations.

::: example An entire line of solutions
Take $x+y+z=4$ and $x-y+z=2$. Subtract the equations to get $2y=2$. The remaining relation is $x+z=3$. Let $z=t$ and obtain $(x,y,z)=(3-t,1,t)$ for every real $t$. This line has a starting point and a direction, a description you will use again when studying the null space.
```check
A2=Matrix([[1,1,1],[1,-1,1]])
same(A2*Matrix([3-t,1,t]),Matrix([4,2]))
same(A2.row_join(Matrix([4,2])).rref()[1],(0,1))
```
:::

::: pitfall
A row of zeros makes no additional demand. A row with zero coefficients and a nonzero right side is a contradiction. Keep the right-hand column attached while reducing.
:::

## Exact row reduction in Python {#python}

::: compute A consistent system and an inconsistent one
SymPy returns the reduced matrix and the zero-based pivot column indices. An augmented column with a pivot exposes an inconsistency.
```python
from sympy import Matrix

for rows in ([[1, 1, 2], [2, 2, 4]], [[1, 1, 2], [2, 2, 5]]):
    reduced, pivots = Matrix(rows).rref()
    print(reduced.tolist(), pivots)
```
```output
[[1, 1, 2], [0, 0, 0]] (0,)
[[1, 1, 0], [0, 0, 1]] (0, 2)
```
:::

## Exercises {#exercises}

:::: exercise Solve two equations {#ex-2-1} ★
Solve $x-y=2$ and $x+y=6$.
::: solution
Add the equations to get $2x=8$. Then $x=4$ and $y=2$.
```check
same(Matrix([[1,-1],[1,1]])*Matrix([4,2]),Matrix([2,6]))
```
:::
::::

:::: exercise Redundant or inconsistent {#ex-2-2} ★★
For which $k$ is $x+2y=3$, $2x+4y=k$ consistent? Find all solutions then.
::: solution
Subtract twice the first row from the second to get $0=k-6$. When $k=6$, put $y=t$ and set $x=3-2t$.
```check
same(Matrix([[1,2],[2,4]])*Matrix([3-2*t,t]),Matrix([3,6]))
same(Matrix([[1,2,3],[2,4,7]]).rref()[1],(0,2))
```
:::
::::

:::: exercise Why row operations work {#ex-2-3} ★★★
Explain why replacing $R_2$ by $R_2+cR_1$ cannot change the solution set.
::: solution
A solution of the original equations satisfies their linear combination. Conversely, a solution of the new equations satisfies the old second equation after subtracting $cR_1$. For example, adding the first row to the second and subtracting it again restores both the coefficient and the right-hand side.
```check
A2=Matrix([[1,-1,2],[1,1,6]])
E2=Matrix([[1,0],[1,1]])
same(Matrix([[1,0],[-1,1]])*E2*A2,A2)
```
:::
::::

## Check yourself {#quiz}

```quiz
? What does the row $[0\;\;0\mid5]$ tell you?
- [ ] There are two free variables and no other constraints
- [x] The system has no solution
- [ ] The solution is $(0,5)$
> Its equation is $0=5$, which no substitution can satisfy.

? How many free variables does a consistent system with three variables and two coefficient pivots have?
- [x] One
- [ ] Two
- [ ] Three
> Exactly one variable column has no pivot.

? Which operation always preserves the solutions?
- [ ] Multiply a row by zero
- [ ] Multiply only the coefficient entries by two
- [x] Add twice one equation to another, including its right-hand side
> The operation can be reversed by subtracting twice the source equation.
```
