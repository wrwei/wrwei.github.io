---
title: Estimation and held-out evaluation
part: 1
minutes: 65
needs: Module 1 and the derivative of the logarithm
lead: Fit a probability from observations and measure how uncertain a held-out estimate can be.
goals:
  - Derive a Bernoulli maximum-likelihood estimate
  - Compute a held-out mean and its standard error under independence
  - Design a split that prevents related examples from leaking across sets
---

## Fit a probability {#likelihood}

A Bernoulli variable is one with probability $p$ and zero with probability $1-p$. Suppose we observe $k$ ones in $n>0$ independent trials with the same unknown $p$. The likelihood of a particular ordered observation is $p^k(1-p)^{n-k}$. It is a function of $p$ with the data held fixed. If we only observe the count, the binomial factor $\binom nk$ multiplies the likelihood and leaves its maximiser unchanged.

For $0<k<n$, the log-likelihood is $k\ln p+(n-k)\ln(1-p)$. Setting its derivative $k/p-(n-k)/(1-p)$ to zero gives $\hat p=k/n$. The second derivative is negative on $(0,1)$. If all trials agree, the maximum occurs at $0$ or $1$.

::: example Count token completions
A fixed prompt is sampled independently ten times and the first token is $A$ seven times. The maximum-likelihood estimate of the probability of $A$ is $0.7$.
```check
p = symbols("p", positive=True)
ell = 7*log(p)+3*log(1-p)
same(solve(diff(ell,p),p),[Rational(7,10)])
```
:::

## Measure on fresh examples {#held-out}

When training a model, use training data for fitting, validation data for selecting models or settings, and held-out test data for the final evaluation. For tasks with near duplicates or many items from the same source, split by source, such as document or user. Otherwise, the reported performance may reflect memorisation of related items. If the test result is used to select another model, an independently held-out set is needed for the same kind of final comparison.

Let $X_1,\ldots,X_n$ be independent scores from the same population, with variance $\sigma^2$. The mean $\bar X$ has variance $\sigma^2/n$. Replacing $\sigma$ by the sample standard deviation $s$, using denominator $n-1$ in $s^2$, gives the estimated standard error $s/\sqrt n$. The formula does not account for correlation between tokens in the same document. For document-level evaluation, use independently sampled documents as the units and define explicitly whether the score weights documents or tokens equally.

::: compute Inspect a held-out mean
For four independent document scores, print the mean and the estimated standard error. Four observations demonstrate the arithmetic and provide limited evidence about the population.
```python
from math import sqrt
from statistics import mean, stdev

scores = [0.6, 0.8, 1.0, 0.8]
print(f"{mean(scores):.3f}")
print(f"{stdev(scores) / sqrt(len(scores)):.3f}")
```
```output
0.800
0.082
```
:::

## Exercises {#exercises}

:::: exercise Estimate from a count {#ex-2-1} ★
Find the Bernoulli maximum-likelihood estimate for two successes in eight independent trials.
::: solution
The estimate is $2/8=1/4$.
```check
same(Rational(2,8),Rational(1,4))
```
:::
::::

:::: exercise Precision and sample size {#ex-2-2} ★★
If the population standard deviation is $0.3$, find the standard deviation of the mean for 9 and 36 independent observations.
::: solution
Divide by $\sqrt n$. The two values are $0.1$ and $0.05$.
```check
same(Rational(3,10)/sqrt(9), Rational(1,10))
same(Rational(3,10)/sqrt(36), Rational(1,20))
```
:::
::::

:::: exercise Split related items {#ex-2-3} ★★★
Twelve documents each supply four paragraphs. Set aside four whole documents for test and two whole documents for validation. How many paragraphs remain for training?
::: solution
Six documents remain for training, so there are $6\cdot4=24$ paragraphs. Keep all paragraphs from each document in the same split.
```check
same((12-4-2)*4,24)
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is held fixed when viewing a likelihood as a function?
- [ ] The candidate parameter
- [x] The observed data
- [ ] The value of the likelihood
> The likelihood compares candidate parameters for the same observed data.

? Under independence, how does the standard error scale when the sample size quadruples?
- [x] It halves when the population variance stays fixed
- [ ] It decreases to one quarter
- [ ] It stays fixed
> The mean's standard deviation varies as the reciprocal square root of sample size.

? Which grouping helps prevent leakage across an evaluation split?
- [ ] By paragraph even when several paragraphs come from each document
- [ ] By a coin flip for each token
- [x] By original document when paragraphs within it are related
> Group dependent or near-duplicate items before assigning splits.
```
