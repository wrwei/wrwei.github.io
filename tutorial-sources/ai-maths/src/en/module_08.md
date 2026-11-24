---
title: Quantisation and measuring numerical error
part: 4
minutes: 70
needs: Vectors, absolute value and Module 7
lead: Quantise a tiny weight vector and bound the effect of rounding on its dot product.
goals:
  - Compute quantised integer codes and dequantised values
  - Identify when clipping invalidates the usual half-step error bound
  - Compare an approximation with a reference calculation
---

## Convert between floats and integer codes {#quantise}

For a simple symmetric quantiser choose a scale $s>0$ and an integer limit $K>0$. Store $q=\operatorname{clip}(\operatorname{round}(x/s),-K,K)$ and reconstruct $\hat x=sq$. Specify a tie rule for rounding. For example, Python's round-to-nearest sends an exact tie to the even integer. With $K=127$, the integer codes fit in a signed 8-bit field.

If rounding alone produces a code in the allowed range, the absolute reconstruction error is at most $s/2$. If clipping changes the code, the error can exceed that bound. Fixing a narrow representable range improves resolution for small values at a given number of codes and can clip more outliers. Allowing per-group scales can adapt the resolution to groups with different magnitudes. Every scale also needs to be stored or recovered.

::: example Clip and round
With $s=1/4$ and $K=3$, an input of $0.30$ maps to code $1$ and reconstructs as $0.25$. An input of $1.20$ maps to code $3$ after clipping and reconstructs as $0.75$, with error $0.45$.
```check
same(Rational(3,10)-Rational(1,4),Rational(1,20))
same(Rational(6,5)-Rational(3,4),Rational(9,20))
```
:::

## Bound the effect on a prediction {#error}

Let $w$ be a weight vector, $\hat w$ its reconstruction, and $x$ an input vector. With no clipping and common scale $s$, the triangle inequality gives
$$
\left|x^\mathsf T\hat w-x^\mathsf T w\right|
 \le\sum_i |x_i|\,|\hat w_i-w_i|
 \le \frac{s}{2}\lVert x\rVert_1.
$$
This is an absolute bound in exact arithmetic, for quantised weights and original inputs. Actual implementation may introduce more error during multiplication or accumulation. A very small original dot product can result in large relative error, even with a small absolute error.

::: compute Compare exact rational reference values
For weights $(3/10,-11/20,1/5)$, inputs $(2,-1,4)$ and scale $1/4$, compare the quantised dot product with the unquantised dot product.
```python
from fractions import Fraction as F

weights = [F(3, 10), F(-11, 20), F(1, 5)]
inputs = [2, -1, 4]
scale, limit = F(1, 4), 3
codes = [max(-limit, min(limit, round(w / scale))) for w in weights]
reference = sum(x * w for x, w in zip(inputs, weights))
approximation = sum(x * q * scale for x, q in zip(inputs, codes))
print(codes)
print(reference, approximation, abs(reference - approximation))
print(scale * sum(map(abs, inputs)) / 2)
```
```output
[1, -2, 1]
39/20 2 1/20
7/8
```
:::

To evaluate quantisation over a set of inputs, report the scale rule, tie rule, reference precision, absolute error and the downstream metric. Check that the held-out evaluation matches across runs. In the toy example the absolute error is $1/20$, well within the bound of $7/8$. Real input distributions can have very different errors from one chosen vector.

## Exercises {#exercises}

:::: exercise Reconstruct a weight {#ex-8-1} ★
At scale $1/10$, reconstruct the integer code $-7$.
::: solution
Multiply the code by the scale, giving $-7/10$.
```check
same(-7*Rational(1,10),Rational(-7,10))
```
:::
::::

:::: exercise An exact rounding tie {#ex-8-2} ★★
At scale $1/4$, which code does $5/8$ get with ties to even and $K=3$?
::: solution
The scaled input is $5/2$. Its nearest even integer is $2$. The reconstructed value is $1/2$ and the absolute error is $1/8$.
```check
same(round(Rational(5,2)),2)
same(Rational(5,8)-Rational(1,2),Rational(1,8))
```
:::
::::

:::: exercise Bound a dot product {#ex-8-3} ★★★
For input $x=(-1,2,-2)$ and scale $1/10$, what absolute error bound follows when no weights clip?
::: solution
The one-norm is $5$. Multiply by half of $1/10$ to obtain $1/4$.
```check
same(Rational(1,20)*(1+2+2),Rational(1,4))
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is the no-clipping absolute error limit per coordinate?
- [ ] $K$
- [x] $s/2$
- [ ] $2s$
> Each input is within half a step of its nearest reconstruction level.

? What can clipping do to that bound?
- [x] It can increase the error above $s/2$
- [ ] It always sends the error to zero
- [ ] It proves every dot product has the same error
> A value outside the representable interval may be far from its end.

? Which quantity multiplies $s/2$ in the derived dot-product bound?
- [ ] The number of stored bits
- [ ] The length of the weight vector in the two-norm
- [x] The sum of absolute input coordinates
> Each coordinate error is multiplied by its input magnitude.
```
