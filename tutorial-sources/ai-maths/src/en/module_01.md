---
title: Conditional probability and token sequences
part: 1
minutes: 60
needs: Fractions and finite sums
lead: Compute probabilities of token sequences, then use Bayes' rule to reverse a conditional probability.
goals:
  - Distinguish joint, marginal and conditional probabilities
  - Multiply conditional factors to score a sequence
  - Update a prior after observing a token
---

## Probabilities on a finite vocabulary {#vocabulary}

A language model returns a distribution over its vocabulary at each prefix. All probabilities are nonnegative and the sum over the vocabulary is one. Treat a token as a discrete outcome. In practice a token can be a word fragment, punctuation, or a special symbol. Here we use letters and a stop token.

For events $A$ and $B$ with $P(B)>0$, $P(A\mid B)=P(A\cap B)/P(B)$. The denominator restricts the sample space to outcomes with $B$. The marginal $P(A)$ can be recovered by summing joint probabilities over a partition. For a binary partition, $P(A)=P(A\cap B)+P(A\cap B^\mathsf c)$.

## Score a continuation {#chain}

::: definition The probability chain rule
$$
P(t_1,\ldots,t_T)=\prod_{i=1}^T P(t_i\mid t_1,\ldots,t_{i-1}).
$$
For a given prompt, condition every factor on that prompt as well. Repeatedly expand the probability of a prefix and its next token as a product. Factors for the specified path suffice, even though each factor comes from a distribution over all possible next tokens. For an exact completed sequence, include the probability of the stop token. Stop is unnecessary when the question is whether the sequence begins with a prefix.
:::

::: example Prefix versus completed string
A model gives $P(A)=3/5$, $P(B\mid A)=1/4$ and $P(\mathrm{stop}\mid AB)=2/3$. The probability of beginning with $AB$ is $3/20$. The probability of emitting exactly $AB$ and stopping is $1/10$.
```check
same(Rational(3,5)*Rational(1,4), Rational(3,20))
same(Rational(3,20)*Rational(2,3), Rational(1,10))
```
:::

## Reverse the condition {#bayes}

Suppose a token was produced by one of two sources, $S$ or $T$. If $P(S)=1/4$, $P(A\mid S)=3/5$ and $P(A\mid T)=1/5$, then $P(A)=3/10$. Bayes' rule divides the joint probability by that marginal, giving $P(S\mid A)=(3/20)/(3/10)=1/2$.

```check
a1 = Rational(1,4)*Rational(3,5)+Rational(3,4)*Rational(1,5)
same(a1,Rational(3,10))
same(Rational(1,4)*Rational(3,5)/a1,Rational(1,2))
```

::: widget name=bayes
In the diagram, let D mean source S and a positive outcome mean token A. Set the three inputs to 25%, 60% and 20%, then read the posterior from the orange column. What happens as the prior for S gets smaller?
:::

::: compute Follow one path
Use exact rational arithmetic for the example's three factors. Later we will add log probabilities to score much longer paths.
```python
from fractions import Fraction
from math import prod

factors = [Fraction(3, 5), Fraction(1, 4), Fraction(2, 3)]
print(prod(factors[:2]))
print(prod(factors))
```
```output
3/20
1/10
```
:::

## Exercises {#exercises}

:::: exercise Missing probability {#ex-1-1} ★
After a prefix the vocabulary is $A,B,\mathrm{stop}$. The probabilities of $A$ and $B$ are $0.3$ and $0.5$. Find the probability of stop.
::: solution
The probabilities sum to one, so stop has probability $0.2$.
```check
same(1-Rational(3,10)-Rational(1,2),Rational(1,5))
```
:::
::::

:::: exercise The other path {#ex-1-2} ★★
If $P(A)=1/4$ and $P(A\mid A)=2/5$, find $P(AA)$ as a prefix.
::: solution
The two factors are $1/4$ and $2/5$, giving $1/10$.
```check
same(Rational(1,4)*Rational(2,5),Rational(1,10))
```
:::
::::

:::: exercise Posterior odds {#ex-1-3} ★★★
Keep the two-source Bayes example above, but observe a token $B$ with $P(B\mid S)=P(B\mid T)=1/5$. Find $P(S\mid B)$.
::: solution
$P(B)=1/5$. Its conditional probability is the same under either source, so the common factor cancels and the posterior remains $1/4$.
```check
same(Rational(1,4)*Rational(1,5)/Rational(1,5),Rational(1,4))
```
:::
::::

## Check yourself {#quiz}

```quiz
? What is multiplied in the sequence chain rule?
- [ ] The unconditional probabilities of all tokens
- [x] The observed next-token probabilities at each successive prefix
- [ ] Every vocabulary probability at a single prefix
> Each factor depends on the preceding tokens.

? When can you divide by $P(B)$ to define $P(A\mid B)$?
- [x] When $P(B)>0$
- [ ] Only when $P(A)=1$
- [ ] Whenever $A$ and $B$ overlap as sets
> The conditional probability formula requires a positive denominator.

? What changes when you include a stop token with probability $1/2$ at the end of a prefix?
- [ ] The prefix probability doubles
- [ ] The completed sequence has the same probability as the prefix
- [x] The completed sequence has half the prefix probability
> The stop token contributes another conditional factor.
```
