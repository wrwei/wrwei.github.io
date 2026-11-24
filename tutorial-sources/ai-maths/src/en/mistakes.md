---
title: Common mistakes
lead: Diagnose errors in probability, evaluation, optimisation and finite arithmetic.
---

## Probability and evaluation {#probability}

- **Reverse the condition without recomputing the denominator.** In [Module 1](module_01_EN.html#bayes), $P(A\mid S)=3/5$ while $P(S\mid A)=1/2$. Compute the marginal of the observed event.
- **Omit the stop token from an exact sequence probability.** A prefix of probability $3/20$ is a completed sequence of probability $1/10$ when the stop factor is $2/3$.
- **Randomly split related paragraphs across training and test.** A document can supply similar material to both sets. Group by document before splitting. See [Module 2](module_02_EN.html#held-out).
- **Treat tokens in the same document as independent replicates.** Such a count can overstate how much evidence you have. Choose sampling units and weights that match the estimand.

## Information and decoding {#information}

- **Average an unweighted list of vocabulary log probabilities.** Cross-entropy weights log probabilities by the data distribution. An observed single target contributes its own negative log probability.
- **Average document perplexities to get corpus perplexity.** Add the losses on the log scale and divide by the number of scored tokens before exponentiating. See [Module 4](module_04_EN.html#loss).
- **Score the original model with a sampled distribution after top-k truncation.** Report which distribution you score. The discarded tokens can have zero probability under the sampling rule.

## Updates and finite precision {#precision}

- **Use the smallest eigenvalue to choose a stable quadratic step.** Every direction must be stable. See [Module 5](module_05_EN.html#curvature).
- **Treat Adam's squared-gradient average as a variance.** It is a raw second moment and has no subtraction of a mean square.
- **Exponentiate large logits and then take a logarithm.** Use the shifted expression from [Module 7](module_07_EN.html#stable) and keep the result on the log scale when you need a loss.
- **Apply a half-step quantisation bound after clipping.** With scale $1/4$ and largest reconstruction $3/4$, a value of $1.20$ has error $0.45$, which exceeds half a step.
