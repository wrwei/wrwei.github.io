---
title: Glossary
lead: Read the terms used in the probability, training and inference examples.
---

## Distributions and evaluation {#distributions}

| Term | Meaning |
|---|---|
| Token | One item from a model's vocabulary. |
| Joint probability | Probability that events occur together. |
| Marginal probability | Probability for an event obtained by summing over other possible outcomes. |
| Prior and posterior | A probability before and after conditioning on observed evidence. |
| Likelihood | Probability of fixed observations viewed as a function of candidate parameters. |
| Held-out data | Observations reserved for an evaluation. |
| Standard error | Standard deviation of a sampling distribution, often estimated from observed data. |

## Loss and generation {#generation}

| Term | Meaning |
|---|---|
| Nat | Unit of information when the logarithm is natural. |
| Entropy | Expected surprise under a distribution. |
| Cross-entropy | Expected log loss under one distribution from predicting with another. |
| Logit | A score converted to a probability by normalising exponentials. |
| Teacher forcing | Use observed preceding tokens as the model's input when scoring next tokens. |
| Perplexity | Exponential of the mean natural-log loss per scored token. |
| Temperature | Positive scaling parameter dividing the logits before normalisation for sampling. |

## Optimisation and precision {#precision}

| Term | Meaning |
|---|---|
| Hessian | Matrix of second partial derivatives. |
| Mini-batch | A subset or sample of training observations used for one update. |
| Moving average | A summary of recent values with exponentially decreasing weights in Adam. |
| Mixed precision | Using different floating-point formats within one calculation. |
| Quantisation | Mapping continuous or high-precision values to a finite set of codes. |
| Clipping | Replacing an out-of-range value by the nearest allowed endpoint. |
