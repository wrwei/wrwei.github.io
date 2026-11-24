---
title: Next-token loss, perplexity and sampling
part: 2
minutes: 70
needs: Modules 1 and 3
lead: Compute an autoregressive training score and separate it from choices about how to generate text.
goals:
  - Calculate mean next-token negative log-likelihood and perplexity
  - Explain what must match for a perplexity comparison
  - Compute the effect of temperature on sampling odds
---

## Score observed tokens {#loss}

For a sequence with $N>0$ scored positions, add the negative log probabilities of the observed tokens and divide by $N$:
$$
\ell=-\frac{1}{N}\sum_{i=1}^N \ln q(t_i\mid t_{<i}),
\qquad \operatorname{PPL}=e^\ell.
$$
Training can feed the actual preceding tokens at every position. This is called **teacher forcing**. Prompts, padding and other masked positions can be excluded from the loss by omitting them from both numerator and denominator. A corpus-level mean divides the total loss by the total number of scored tokens. An unweighted average of per-document means answers a different question when document lengths differ.

::: example Two tokens
If the assigned probabilities were $1/2$ and $1/8$, the total negative log-likelihood is $\ln16$, the mean is $\ln4$, and perplexity is $4$.
```check
same(-(log(Rational(1,2))+log(Rational(1,8)))/2,log(4))
same(exp(log(4)),4)
```
:::

Compare perplexities on the same data, tokenization and scored positions. Using different tokenizations changes the unit being averaged. A model that assigns all observed tokens probability $1/K$ has perplexity $K$, which motivates the name. Perplexity is a probability score and offers no direct guarantee about the factual accuracy of generated text.

## Generate a continuation {#sampling}

Each generated token becomes part of the next prefix. With logits $z_i$ and temperature $T>0$, the sampling probabilities are proportional to $e^{z_i/T}$. The odds of token $i$ against token $j$ are $e^{(z_i-z_j)/T}$. A lower temperature increases the odds in favour of the higher logit. Greedy decoding selects a largest logit at each step. Top-$k$ sampling retains $k$ candidates selected by the largest scores, with a tie rule if needed, then renormalises the selected probabilities. Changing the sampling rule changes the generation distribution. Evaluate the original model's perplexity with the original probabilities.

::: compute Compare two temperatures
For two logits separated by $\ln3$, halve the temperature and compare the resulting odds.
```python
from math import exp, log

gap = log(3)
for temperature in (1.0, 0.5):
    print(f"{exp(gap / temperature):.0f}")
```
```output
3
9
```
:::

## Exercises {#exercises}

:::: exercise Equal confidence {#ex-4-1} ★
Find perplexity if the model assigns probability $1/5$ to each of the three observed tokens at their respective prefixes.
::: solution
The mean loss is $\ln5$, so perplexity is $5$.
```check
same(exp((-3*log(Rational(1,5)))/3),5)
```
:::
::::

:::: exercise Weight each token {#ex-4-2} ★★
One document has mean loss $2$ over three tokens. Another has mean loss $1$ over one token. Find the corpus-level mean.
::: solution
The sum is $3\cdot2+1=7$. Divide by four to obtain $7/4$.
```check
same(Rational(3*2+1,4),Rational(7,4))
```
:::
::::

:::: exercise Change the odds {#ex-4-3} ★★★
At temperature $1$, the odds of $A$ against $B$ are $16:1$. Find the odds at temperature $2$ with the same logits.
::: solution
Doubling the temperature halves the log odds. The new odds are $\sqrt{16}:1=4:1$.
```check
same(exp(log(16)/2),4)
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is one scoring position in an autoregressive evaluation?
- [ ] An entire vocabulary
- [x] A next-token target and its preceding context
- [ ] A randomly generated suffix with no target
> The loss uses the probability assigned to the observed token at that context.

? How is corpus perplexity calculated from the sum of token losses?
- [ ] Divide the exponential of that sum by the token count
- [ ] Exponentiate each document mean and take their unweighted average
- [x] Divide the sum by the number of scored tokens, then exponentiate
> Take the average on the log scale before computing perplexity.

? Does raising a positive temperature change which logit is largest?
- [x] The order stays the same
- [ ] It reverses the order
- [ ] It rotates the order by one token
> Dividing every logit by the same positive number preserves their order.
```
