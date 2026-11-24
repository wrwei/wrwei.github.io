---
title: Entropy, cross-entropy and KL divergence
part: 2
minutes: 65
needs: Module 1 and logarithms
lead: Measure uncertainty under a distribution and the extra log loss incurred by predicting with another.
goals:
  - Compute entropy and cross-entropy for finite distributions
  - Identify when a zero predicted probability gives infinite loss
  - Interpret KL divergence as the excess expected log loss
---

## Surprise and entropy {#entropy}

An outcome with probability $p_i>0$ has surprise $-\log p_i$. Use the natural logarithm throughout this series, so values are in nats. Use base two instead to measure bits. Entropy averages surprise under the true distribution $p$:
$$
H(p)=-\sum_{i:p_i>0}p_i\ln p_i.
$$
A deterministic distribution has entropy zero. A uniform distribution on $K$ outcomes has entropy $\ln K$. Terms with zero weight contribute zero by continuity.

## Prediction under a different distribution {#cross-entropy}

A model $q$ assigns surprise $-\ln q_i$. Averaging over the data distribution gives $H(p,q)=-\sum_{i:p_i>0}p_i\ln q_i$. If any $q_i=0$ with $p_i>0$, this loss is $+\infty$. Subtracting the true entropy yields
$$
D_{\rm KL}(p\|q)=\sum_{i:p_i>0}p_i\ln\frac{p_i}{q_i}=H(p,q)-H(p).
$$
To see why it is nonnegative, apply $-\ln x\ge 1-x$ to $x=q_i/p_i$ on the positive support of $p$. The resulting lower bound is $1-\sum_{i:p_i>0}q_i\ge0$. Equality requires $p=q$. Swapping $p$ and $q$ changes which distribution weights each term, so KL is generally asymmetric.

::: example Compare a fair model and a biased source
If $p=(3/4,1/4)$ and $q=(1/2,1/2)$, then $H(p,q)=\ln2$. The source entropy is about $0.5623$ nats and the excess loss is about $0.1308$ nats.
```check
h1 = -Rational(3,4)*log(Rational(3,4))-Rational(1,4)*log(Rational(1,4))
rounds(h1,"0.5623351446")
rounds((log(2)-h1),"0.1308120359")
```
:::

::: widget name=information
Set the source weights to 3, 1, 0 and the predicted weights to 1, 1, 0. Select nats to reproduce the worked example. Then set the second predicted weight to zero and check which direction of KL divergence becomes infinite.
:::

::: compute Average surprise
Calculate the scores using the same units throughout.
```python
from math import log

p, q = (0.75, 0.25), (0.5, 0.5)
entropy = -sum(pi * log(pi) for pi in p if pi > 0)
cross_entropy = -sum(pi * log(qi) for pi, qi in zip(p, q) if pi > 0)
print(f"{entropy:.4f} {cross_entropy:.4f} {cross_entropy - entropy:.4f}")
```
```output
0.5623 0.6931 0.1308
```
:::

## Exercises {#exercises}

:::: exercise Uniform source {#ex-3-1} ★
Compute the entropy in nats for four equally probable tokens.
::: solution
Each token has surprise $\ln4$. Its average is $\ln4$.
```check
same(-4*Rational(1,4)*log(Rational(1,4)),log(4))
```
:::
::::

:::: exercise A deterministic source {#ex-3-2} ★★
Compute the excess loss when $p=(1,0)$ and $q=(1/4,3/4)$.
::: solution
$H(p)=0$, and the only outcome that occurs incurs loss $-\ln(1/4)=\ln4$.
```check
same(-log(Rational(1,4)),log(4))
```
:::
::::

:::: exercise Change the units {#ex-3-3} ★★★
Convert the entropy of eight equally probable outcomes from nats to bits.
::: solution
Divide $\ln8$ by $\ln2$ to obtain $3$ bits.
```check
same(log(8)/log(2),3)
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which distribution supplies the weights in $H(p,q)$?
- [x] $p$
- [ ] $q$
- [ ] A uniform distribution
> The loss under $q$ is averaged over outcomes from $p$.

? What if $p_i>0$ and $q_i=0$?
- [ ] This term contributes zero
- [ ] Entropy and cross-entropy coincide
- [x] Cross-entropy is infinite
> The model gives no probability to a possible observed outcome.

? When is $D_{\rm KL}(p\|q)=0$?
- [ ] Whenever the distributions have the same entropy
- [x] Exactly when $p=q$
- [ ] Whenever the distributions have the same support
> Zero excess expected log loss requires agreement of the distributions.
```
