---
title: Mini-batches, Adam and regularisation
part: 3
minutes: 75
needs: Modules 2 and 5
lead: Compare a full gradient to a sampled gradient and trace one adaptive update.
goals:
  - Explain when the mini-batch mean gradient is unbiased
  - Compute bias-corrected Adam moments and their first update
  - Distinguish an L2 penalty from decoupled weight decay in an adaptive update
---

## Estimate a full gradient {#mini-batch}

An empirical loss is the average of $n$ example losses. Its gradient is the mean of the $n$ per-example gradients at a fixed parameter vector. If a mini-batch contains $b$ independently and uniformly drawn indices with replacement, its mean gradient is unbiased. Independence gives covariance $\Sigma/b$, where $\Sigma$ is the covariance of a single draw. Sampling a uniformly chosen subset of fixed size without replacement also gives an unbiased mean, but the covariance uses a finite-population correction.

::: example Average over draws
For scalar per-example gradients $2$ and $-6$, the full gradient is $-2$. With one uniform draw the expected update gradient is still $-2$, although neither draw returns that value. The single-draw variance is $16$. For four independent draws, the variance of their average is $4$.
```check
same((2-6)/2,-2)
same(((2+2)**2+(-6+2)**2)/2,16)
same(16/4,4)
```
:::

When training for next-token loss, choose the unit whose average defines the objective. For example, sample scored tokens uniformly for a token-weighted estimate. Sampling documents uniformly and averaging their losses equally estimates the mean document loss. Within a document, token gradients can be correlated, so the independent-draw variance calculation requires care.

## Track gradient moments {#adam}

Adam keeps two exponential moving averages, initialised at zero. For gradient $g_t$, its first moment is $m_t=\beta_1m_{t-1}+(1-\beta_1)g_t$ and its raw second moment is $v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2$. Squaring and all divisions below are coordinatewise. For $0\le\beta_1,\beta_2<1$, use $\hat m_t=m_t/(1-\beta_1^t)$ and $\hat v_t=v_t/(1-\beta_2^t)$ to correct for zero initialisation. The update subtracts $\eta\hat m_t/(\sqrt{\hat v_t}+\varepsilon)$ for a positive $\varepsilon$. The denominator adapts the scale of the step in each coordinate.

Adding $\lambda\lVert w\rVert^2/2$ to the loss adds $\lambda w$ to its gradient. Decoupled weight decay instead subtracts $\eta\lambda w$ directly alongside the parameter update. In plain gradient descent these operations agree. In Adam, adding the penalty to the gradient changes the moment estimates and their scaling, while direct decay leaves the moments based on the data gradient.

::: compute The first step
At the first step, the bias-corrected first and second moments are $g_1$ and $g_1^2$ for any allowed moment coefficients. Use two coordinates to compare update signs.
```python
from math import sqrt

rate, eps = 0.1, 1e-8
for gradient in (2.0, -6.0):
    first = 0.1 * gradient / (1 - 0.9)
    second = 0.001 * gradient**2 / (1 - 0.999)
    update = -rate * first / (sqrt(second) + eps)
    print(f"{update:.3f}")
```
```output
-0.100
0.100
```
:::

## Exercises {#exercises}

:::: exercise Mean of a batch {#ex-6-1} ★
A batch has equally weighted gradients of $1$, $3$ and $5$. Find the update gradient.
::: solution
Their mean is $3$.
```check
same((1+3+5)/3,3)
```
:::
::::

:::: exercise Raw and corrected moments {#ex-6-2} ★★
Find $m_1$ and $\hat m_1$ for $g_1=5$ and $\beta_1=0.8$.
::: solution
$m_1=(1-0.8)5=1$ and $\hat m_1=1/(1-0.8)=5$.
```check
same((1-Rational(4,5))*5,1)
same(1/(1-Rational(4,5)),5)
```
:::
::::

:::: exercise One decay step {#ex-6-3} ★★★
With zero data gradient and zero moment history, find the parameter after a decoupled decay step starting at $w=2$, with $\eta=0.1$ and $\lambda=0.2$.
::: solution
Multiplying by $1-\eta\lambda=0.98$ gives $w=1.96$.
```check
same(2*(1-Rational(1,10)*Rational(1,5)),Rational(49,25))
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is the expectation of a uniform mini-batch mean at fixed parameters?
- [x] The empirical full gradient
- [ ] The smallest per-example gradient
- [ ] Zero for every parameter vector
> Each sampled example has equal probability.

? What does Adam's $v_t$ track?
- [ ] The variance about the current sample mean
- [ ] The sum of all past gradients
- [x] An exponential average of coordinatewise squared gradients
> It tracks the raw second moment before bias correction.

? Where does decoupled decay act?
- [ ] Inside the second moment only
- [x] Directly on the parameters
- [ ] On the targets before the loss is calculated
> Decay directly subtracts a multiple of the current parameter.
```
