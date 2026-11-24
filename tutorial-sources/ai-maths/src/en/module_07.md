---
title: Floating-point arithmetic and stable softmax
part: 4
minutes: 70
needs: Module 4 and exponentials
lead: Evaluate softmax and a target log probability after shifting logits away from overflow.
goals:
  - Explain why a finite float can lose a small addend
  - Derive a shifted log-sum-exp expression
  - Compute a target log probability without taking the logarithm of a rounded softmax probability
---

## Rounding and range {#precision}

Finite floating-point formats round most real numbers to nearby representable values. In binary64, the next value above $1$ is $1+2^{-52}$. Under round-to-nearest, adding $2^{-54}$ to $1$ leaves the rounded result at $1$. At a larger magnitude the gap between adjacent numbers grows. Floating point also has finite exponent range. A large exponential can overflow, and a sufficiently small positive exponential can round to zero.

In a mixed-precision computation, format choices may differ for storage, products and accumulation. Accumulating reduced-precision products in wider precision can reduce additional rounding in the sum. It cannot restore bits already lost when values were converted to a narrower format.

## Shift before exponentiating {#stable}

Define $\operatorname{LSE}(z)=\ln\sum_i e^{z_i}$ for a nonempty vector of finite logits. Set $m=\max_i z_i$. Factor $e^m$ out of the sum to obtain
$$
\operatorname{LSE}(z)=m+\ln\sum_i e^{z_i-m},
\qquad
\log q_j=(z_j-m)-\ln\sum_i e^{z_i-m}.
$$
The shifted exponentials are at most one, and at least one equals one. This avoids exponential overflow for finite inputs. Use the second expression directly when you need the log probability. Subtracting a rounded $m+\ln\sum_i e^{z_i-m}$ from a very large $z_j$ can lose precision. Also, taking the log of a rounded softmax result can fail when a tiny probability rounds to zero. Extremely large differences between finite logits can themselves exceed the floating-point range.

::: example Large but close logits
For logits $(1000,1001)$, subtract $1001$ to obtain $(-1,0)$. The second token has probability $1/(1+e^{-1})\approx0.7311$ and log probability $-\ln(1+e^{-1})\approx-0.3133$. The direct exponential of $1001$ overflows in binary64.
```check
rounds((1/(1+exp(-1))),"0.7310585786")
rounds((-log(1+exp(-1))),"-0.3132616875")
```
:::

::: compute Compute in shifted coordinates
Run the same calculation on a second vector whose logits are separated by one thousand. The smaller log probability remains finite even though its exponential rounds to zero.
```python
from math import exp, fsum, log

for logits, target in [([1000.0, 1001.0], 1), ([0.0, -1000.0], 1)]:
    largest = max(logits)
    shifted = [value - largest for value in logits]
    log_normalizer = log(fsum(exp(value) for value in shifted))
    print(f"{shifted[target] - log_normalizer:.4f}")
```
```output
-0.3133
-1000.0000
```
:::

## Exercises {#exercises}

:::: exercise Equal logits {#ex-7-1} ★
Find the probability assigned to one of four equal finite logits.
::: solution
After shifting, every exponential equals one. Each probability is $1/4$.
```check
same(exp(0)/(4*exp(0)),Rational(1,4))
```
:::
::::

:::: exercise Shift by a constant {#ex-7-2} ★★
What happens to $\operatorname{LSE}(z)$ and softmax if you add $7$ to every logit?
::: solution
Factoring out $e^7$ adds $7$ to log-sum-exp. It cancels between numerator and denominator of each softmax probability.
```check
same(log(exp(7)+exp(8))-log(1+exp(1)),7)
same(exp(8)/(exp(7)+exp(8)),exp(1)/(1+exp(1)))
```
:::
::::

:::: exercise A tiny target probability {#ex-7-3} ★★★
For logits $(0,-1000)$, give a bound on how far the first token's negative log probability lies above zero.
::: solution
It equals $\ln(1+e^{-1000})$. For $u>0$, $0<\ln(1+u)<u$, so the loss is strictly between $0$ and $e^{-1000}$ in exact arithmetic. A float can round it to zero.
```check
small1 = exp(-1000)
holds(small1.is_positive)
u1 = symbols('u', positive=True)
same(diff(u1-log(1+u1),u1),u1/(1+u1))
```
:::
::::

## Check yourself {#quiz}

```quiz
? Why subtract the largest logit?
- [x] Every shifted exponential is at most one and one equals one
- [ ] Every shifted exponential is greater than one
- [ ] The shift makes all token probabilities equal
> The largest shifted logit is zero, and the others are nonpositive.

? Which method can still return a finite log probability when softmax underflows?
- [ ] Take the logarithm of the rounded zero probability
- [x] Subtract the log normalizer from the shifted target logit
- [ ] Round the target probability to one
> Stay on the log scale to represent large negative scores.

? What does a wider accumulator change?
- [ ] It recovers the original input digits lost in earlier casts
- [ ] It increases the vocabulary
- [x] It can reduce additional rounding during accumulation
> Rounding previously applied to the inputs has already discarded information.
```
