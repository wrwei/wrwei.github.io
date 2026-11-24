---
title: Gradients and learning rates
part: 3
minutes: 70
needs: Derivatives, partial derivatives and matrix multiplication
lead: Compute the gradient for a linear predictor and see how curvature controls a stable step size.
goals:
  - Compute a gradient by the chain rule
  - Differentiate a squared loss with respect to a weight vector
  - Derive the stable learning-rate interval for a positive quadratic
---

## Differentiate a prediction loss {#gradient}

For one example with feature vector $x$, a linear predictor gives $\hat y=w^\mathsf Tx$. The residual is $r=\hat y-y$. The derivative of the loss $r^2/2$ with respect to $r$ is $r$, and the derivative of $r$ with respect to $w$ is $x$. The chain rule gives $\nabla_w(r^2/2)=rx$. For the mean squared loss with the same factor of $1/2$, average these gradients over the examples. For a matrix $X$ with features in rows and a target vector $y$, this is $X^\mathsf T(Xw-y)/n$.

Gradient descent applies $w_{\rm next}=w-\eta\nabla L(w)$, with learning rate $\eta>0$. The gradient gives the first-order change in the loss for a displacement. It describes the local slope, so a sufficiently short descent step lowers the loss where the gradient is nonzero. For a large step, curvature matters.

::: example One update
Take $x=(2,-1)^\mathsf T$, $w=(1,1)^\mathsf T$ and $y=3$. The prediction is $1$ and the gradient is $(-4,2)^\mathsf T$. At learning rate $1/10$, the update gives $w=(7/5,4/5)^\mathsf T$, and the loss falls from $2$ to $1/2$.
```check
x1,w1=Matrix([2,-1]),Matrix([1,1])
g1=(w1.dot(x1)-3)*x1
same(g1,Matrix([-4,2]))
u1=w1-g1/10
same(u1,Matrix([Rational(7,5),Rational(4,5)]))
same((u1.dot(x1)-3)**2/2,Rational(1,2))
```
:::

## Follow the error on a quadratic {#curvature}

For $L(w)=a(w-w_*)^2/2$ with $a>0$, the error $e=w-w_*$ changes to $(1-\eta a)e$ each step. For a nonzero error, its magnitude shrinks exactly when $\lvert 1-\eta a\rvert<1$, equivalently $0<\eta<2/a$. When $1<\eta a<2$, the iterate alternates across the minimiser while converging. At $\eta=2/a$ and nonzero initial error it oscillates without shrinking.

For a quadratic with positive definite Hessian $H$, choose an orthonormal eigenbasis of $H$. Each error coordinate then follows the scalar rule with $a$ equal to its eigenvalue. Stability for all initial errors requires $0<\eta<2/\lambda_{\max}(H)$. Small eigenvalues can still leave slow directions. Deep-network losses are generally nonlinear, so this quadratic argument describes a local model near a point with positive curvature.

::: widget name=descent
With the diagonal curvatures 1 and 4, try learning rates 0.25, 0.5 and 0.6. Compare the paths and the two error factors at the stable step, the boundary and the unstable step.
:::

::: compute Observe contraction and overshoot
Start with error one and curvature four. Compare a stable step that alternates signs with one beyond the stability boundary.
```python
for rate in (0.375, 0.625):
    error = 1.0
    for _ in range(3):
        error *= 1 - 4 * rate
    print(f"{error:.3f}")
```
```output
-0.125
-3.375
```
:::

## Exercises {#exercises}

:::: exercise A scalar derivative {#ex-5-1} ★
Differentiate $L(w)=(2w-3)^2/2$ at $w=1$.
::: solution
The derivative is $2(2w-3)$, giving $-2$.
```check
same(diff((2*x-3)**2/2,x).subs(x,1),-2)
```
:::
::::

:::: exercise Land on the minimum {#ex-5-2} ★★
Find the one-step learning rate for the scalar quadratic with curvature $a=5$.
::: solution
Set $1-5\eta=0$. The answer is $\eta=1/5$.
```check
same(solve(1-5*x,x),[Rational(1,5)])
```
:::
::::

:::: exercise Two speeds {#ex-5-3} ★★★
A quadratic has Hessian eigenvalues $1$ and $9$. At learning rate $1/9$, find the two error factors.
::: solution
Apply $1-\eta a$ to each eigenvalue. The factors are $8/9$ and $0$.
```check
same(1-Rational(1,9),Rational(8,9))
same(1-9*Rational(1,9),0)
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is the gradient of the single-example loss with respect to $w$?
- [ ] $r^2x$
- [ ] $y x$
- [x] $r x$
> The two derivatives in the chain rule are $r$ and $x$.

? For curvature $4$, which learning rate is at the upper stability boundary?
- [ ] $1/4$
- [x] $1/2$
- [ ] $2$
> The error factor at $2/a$ is $-1$.

? Which eigenvalue limits the step size for a positive definite quadratic?
- [x] The largest
- [ ] The smallest
- [ ] Their arithmetic mean
> Every eigenvalue must obey the scalar stability condition.
```
