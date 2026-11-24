---
title: Formula sheet
lead: Keep the conditions and units beside each equation.
---

## Probability and estimation {#probability}

| Quantity | Formula | Conditions |
|---|---|---|
| Conditional probability | $P(A\mid B)=P(A\cap B)/P(B)$ | $P(B)>0$ |
| Sequence probability | $\prod_{i=1}^T P(t_i\mid t_{<i})$ | Condition on the prompt if given. Include stop for a completed sequence. |
| Bayes' rule | $P(B\mid A)=P(A\mid B)P(B)/P(A)$ | $P(A)>0$ and the stated right-hand conditional is defined. |
| Bernoulli maximum-likelihood estimate | $\hat p=k/n$ | $n>0$ independent trials share the same probability. |
| Estimated standard error | $s/\sqrt n$ | Independent observations with common distribution and $n\ge 2$. |

## Information and loss {#information}

| Quantity | Formula | Conditions |
|---|---|---|
| Entropy | $H(p)=-\sum_i p_i\ln p_i$ | Sum over positive $p_i$. |
| Cross-entropy | $H(p,q)=-\sum_i p_i\ln q_i$ | Average over positive $p_i$. Infinite if any such $q_i$ is zero. |
| KL divergence | $D_{\rm KL}(p\|q)=H(p,q)-H(p)$ | Nonnegative. Zero exactly for equal distributions. |
| Token negative log-likelihood | $\ell=-\sum_i\ln q(t_i\mid t_{<i})/N$ | Use the same mask for the sum and count $N>0$. |
| Perplexity | $e^\ell$ | Use natural logarithms in $\ell$. |
| Temperature odds | $e^{(z_i-z_j)/T}$ | $T>0$. |

## Optimisation and arithmetic {#computation}

| Quantity | Formula | Conditions |
|---|---|---|
| Mean half-squared-loss gradient | $X^\mathsf T(Xw-y)/n$ | One example per row of $X$. |
| Quadratic stability | $0<\eta<2/\lambda_{\max}(H)$ | Positive definite Hessian $H$ of a quadratic loss, fixed step. |
| Mini-batch gradient covariance | $\Sigma/b$ | $b$ independent uniform samples with replacement, fixed parameters. |
| Log softmax | $(z_j-m)-\ln\sum_i e^{z_i-m}$ | $m=\max_i z_i$, finite logits and nonempty input. |
| Dot-product quantisation error bound | $\tfrac{s}{2}\lVert x\rVert_1$ | Unchanged input $x$, common scale $s$, no clipping, exact arithmetic. |
