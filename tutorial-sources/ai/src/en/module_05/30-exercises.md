## Exercises {#exercises}

Fifteen exercises follow the order of the sections they practise. They are graded by effort: ★ is conceptual and takes about 5 minutes, with at most a ratio or a sum to read off; ★★ is a derivation or a calculation and takes 10 to 12 minutes; ★★★ is coding and takes about 25 minutes. There are eight of the first kind, six of the second and one of the third, 127 minutes in all. Do the conceptual ones in your head or on paper first and only then open the solution: they are short because the whole difficulty is in committing to an answer.

None of the exercises reuses the numbers or the cases of a worked example, an inline check or a lab. The sections teach each method on one set of numbers; here the same method meets a different set, so that what transfers is the method and not the answer. Where a solution quotes a number, it was computed, and the code that produced it is shown or described. The one coding exercise ([Exercise 12](#e12)) starts from the physics-informed network of [Lab 4](#lab4) and is self-contained: its code runs as printed in one fresh Python session.

Every solution is hidden until you open it. Open one only after you have written your own answer, however rough: the check that matters is the place where your answer and the solution part ways.

::: exercise id=e1 level=1 kind=conceptual minutes=5
An autoencoder maps 64-pixel images to a 128-dimensional code and back, with no other constraint, and its training reconstruction error reaches zero. Explain why the code is useless as a representation, and name two changes that would force the network to learn the structure of the data.
:::

::: solution
**Why zero error says nothing.** Reconstruction error measures whether the output equals the input. It does not measure whether the code *selected* anything. Here the code has more dimensions than the input ($d_z = 128 > d_x = 64$), so the network is free to copy. One explicit solution: let the encoder place the 64 pixels in the first 64 code coordinates and zeros in the other 64, $\mathbf{z} = (\mathbf{x}, \mathbf{0})$, and let the decoder read the first 64 back. Any invertible map would do as well: a random rotation of $\mathbf{x}$ and its inverse reconstruct perfectly, and the code is then a scrambled copy of the pixels. Gradient descent finds one of these because they are the easiest way to drive the loss to zero, and nothing in the objective prefers another.

The code is then useless in the three ways [Section 2](#s2) lists. It has not compressed anything (128 numbers for 64). It has not separated likely inputs from unlikely ones, because the map is defined, and exact, for every input in $\mathbb{R}^{64}$, including noise. And it fails as an anomaly detector: an input the model has never seen is reconstructed as well as any other, so the reconstruction error, the anomaly score, is zero for everything.

**Two changes that remove the identity from the set of minimisers.**

1. *A bottleneck*, $d_z < d_x$. A code with fewer numbers than the input cannot copy it. The network must decide which directions of variation to keep, and for squared error it keeps those that carry most of the variance (for linear maps the optimum spans the leading principal subspace, as [Section 2](#s2) shows). The structure it learns is "where the data lie".
2. *A denoising objective*: corrupt the input to $\tilde{\mathbf{x}}$ and ask for the clean $\mathbf{x}$. The identity now gives $\tilde{\mathbf{x}}$, which is wrong by the noise. The best possible map is the conditional mean $\mathbb{E}[\mathbf{x}\mid\tilde{\mathbf{x}}]$, which pulls a corrupted point back towards where clean data are dense, and that is exactly what must be learnt about the data. Overcomplete codes then become harmless. (This is the same regression that [Section 5](#s5) turns into the diffusion objective.)

Two further changes work for the same reason. A sparsity penalty on $\mathbf{z}$ (an L1 term) lets many coordinates exist but allows few to be active, so the code cannot carry a dense copy. The variational autoencoder's KL term ([Section 3](#s3)) charges nats for every bit of information the code carries about $\mathbf{x}$, so copying is expensive and only information that pays for itself in reconstruction survives.

The pattern: an autoencoder learns structure only to the extent that the architecture or the objective stops it from learning the identity. A low training error is therefore never the evidence that the representation is good; test it on corrupted, held-out or anomalous inputs.
:::

::: exercise id=e2 level=2 kind=derivation minutes=12
(a) Starting from $\log p_\theta(\mathbf{x}) = \log \int p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})\,d\mathbf{z}$, insert $q_\phi(\mathbf{z}\mid\mathbf{x})/q_\phi(\mathbf{z}\mid\mathbf{x})$, apply Jensen's inequality and obtain the ELBO $\mathbb{E}_q[\log p_\theta(\mathbf{x}\mid\mathbf{z})] - D_{\KL}(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p(\mathbf{z}))$.

(b) Without Jensen, show that $\log p_\theta(\mathbf{x}) - \text{ELBO} = D_{\KL}(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x}))$, and say when the bound is tight.

(c) Show that $D_{\KL}(\mathcal{N}(\mu, \sigma^2) \,\|\, \mathcal{N}(0, 1)) = \tfrac12(\mu^2 + \sigma^2 - \log\sigma^2 - 1)$, and that for a diagonal Gaussian the KL is a sum over dimensions. Evaluate it for $\boldsymbol{\mu} = (0.3, -1.5, 0.0)$ and $\boldsymbol{\sigma} = (0.8, 1.0, 2.0)$, and say what each dimension pays for.
:::

::: solution
Write $q$ for $q_\phi(\mathbf{z}\mid\mathbf{x})$ throughout, and assume $q$ is positive wherever $p_\theta(\mathbf{x}\mid\mathbf{z})p(\mathbf{z})$ is, so that the division below is defined.

**(a) The bound by Jensen.** Multiplying and dividing by $q$ changes nothing, and turns the integral into an expectation under $q$, a distribution we can sample:

$$
\log p_\theta(\mathbf{x}) = \log \int q\,\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q}\,d\mathbf{z}
= \log \mathbb{E}_q\!\left[\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q}\right].
$$

The logarithm is concave, so Jensen's inequality gives $\log \mathbb{E}[Y] \ge \mathbb{E}[\log Y]$ for a positive random variable $Y$. Taking $Y$ to be the ratio inside the brackets,

$$
\log p_\theta(\mathbf{x}) \ge \mathbb{E}_q\big[\log p_\theta(\mathbf{x}\mid\mathbf{z}) + \log p(\mathbf{z}) - \log q\big]
= \mathbb{E}_q\big[\log p_\theta(\mathbf{x}\mid\mathbf{z})\big] - \mathbb{E}_q\!\left[\log\frac{q}{p(\mathbf{z})}\right].
$$

The last expectation is $D_{\KL}(q \,\|\, p(\mathbf{z}))$ by definition, which is the stated ELBO. We moved the logarithm inside the expectation, which is the step that costs us equality: it replaces a quantity we cannot estimate without bias with one we can estimate from samples of $\mathbf{z}$.

**(b) The gap, exactly.** Bayes' rule for the model, $p_\theta(\mathbf{x}) = p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})\,/\,p_\theta(\mathbf{z}\mid\mathbf{x})$, holds for every $\mathbf{z}$. Take logarithms and write the right-hand side as a product of two ratios by multiplying and dividing by $q$:

$$
\log p_\theta(\mathbf{x}) = \log\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q} + \log\frac{q}{p_\theta(\mathbf{z}\mid\mathbf{x})}.
$$

The left side does not depend on $\mathbf{z}$, so its expectation under any $q$ is itself. Taking $\mathbb{E}_q$ of both sides:

$$
\log p_\theta(\mathbf{x}) = \underbrace{\mathbb{E}_q\!\left[\log\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q}\right]}_{\text{ELBO}} + D_{\KL}\big(q \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})\big).
$$

The first term is the ELBO by the algebra of part (a). So $\log p_\theta(\mathbf{x}) - \text{ELBO} = D_{\KL}(q \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})) \ge 0$, which proves the bound again without Jensen, and shows what Jensen threw away. A KL divergence is zero exactly when its two arguments are equal, so **the bound is tight if and only if $q_\phi(\mathbf{z}\mid\mathbf{x}) = p_\theta(\mathbf{z}\mid\mathbf{x})$**, the true posterior. Two consequences follow. Maximising the ELBO over $\phi$ with $\theta$ fixed is the same as minimising the KL to the true posterior, since $\log p_\theta(\mathbf{x})$ does not depend on $\phi$. And the gap is a property of the encoder family: a diagonal Gaussian $q$ cannot match a posterior with two modes or correlated coordinates, however well it is trained.

**(c) The Gaussian KL.** For $q = \mathcal{N}(\mu, \sigma^2)$ and $p = \mathcal{N}(0, 1)$ in one dimension, the two log densities are

$$
\log q(z) = -\tfrac12\log(2\pi) - \tfrac12\log\sigma^2 - \frac{(z-\mu)^2}{2\sigma^2},
\qquad
\log p(z) = -\tfrac12\log(2\pi) - \frac{z^2}{2}.
$$

The KL is $\mathbb{E}_q[\log q - \log p]$. The $\tfrac12\log 2\pi$ terms cancel. Under $q$, $\mathbb{E}[(z-\mu)^2] = \sigma^2$ (the definition of the variance) and $\mathbb{E}[z^2] = \mu^2 + \sigma^2$ (variance plus squared mean). Hence

$$
D_{\KL} = -\tfrac12\log\sigma^2 - \frac{\sigma^2}{2\sigma^2} + \frac{\mu^2 + \sigma^2}{2}
= \tfrac12\big(\mu^2 + \sigma^2 - \log\sigma^2 - 1\big).
$$

For a diagonal Gaussian, $q(\mathbf{z}) = \prod_j q_j(z_j)$ and $p(\mathbf{z}) = \prod_j p_j(z_j)$, so $\log q - \log p = \sum_j(\log q_j - \log p_j)$. The expectation of a sum is the sum of the expectations, and each term depends on one coordinate only, so only its marginal matters: $D_{\KL}(q\,\|\,p) = \sum_j D_{\KL}(q_j \,\|\, p_j)$.

**Numbers.** Dimension by dimension, with $\log\sigma^2 = 2\log\sigma$:

- $j = 1$: $\tfrac12(0.09 + 0.64 - \log 0.64 - 1) = \tfrac12(0.09 + 0.64 + 0.4463 - 1) = \tfrac12(0.1763) = 0.0881$;
- $j = 2$: $\tfrac12(2.25 + 1 - 0 - 1) = \tfrac12(2.25) = 1.1250$;
- $j = 3$: $\tfrac12(0 + 4 - \log 4 - 1) = \tfrac12(4 - 1.3863 - 1) = \tfrac12(1.6137) = 0.8069$.

The total is $0.0881 + 1.1250 + 0.8069 = 2.020$ nats. As a check, a Monte Carlo estimate of $\mathbb{E}_q[\log q - \log p]$ from two million samples of $\mathbf{z}$ gave $2.0196$, within sampling error of the closed form.

**What each dimension pays for.** Split every term into its mean part $\tfrac12\mu^2$ and its width part $\tfrac12(\sigma^2 - \log\sigma^2 - 1)$, which is zero at $\sigma = 1$ and positive on either side of it:

| dimension | mean part | width part | what it says about $\mathbf{x}$ |
|---|---|---|---|
| 1 | 0.0450 | 0.0431 | little: close to the prior, slightly narrower |
| 2 | 1.1250 | 0 | a lot, in the position: the mean sits 1.5 prior standard deviations from 0 |
| 3 | 0 | 0.8069 | width only: the posterior is *wider* than the prior |

Dimension 2 is the typical informative coordinate: it pays for moving its mean away from the prior. Dimension 3 is the surprise. A posterior wider than the prior carries no information about $\mathbf{x}$ in its mean, yet it costs 0.81 nats, because the KL penalises any departure from $\mathcal{N}(0, 1)$, and a very diffuse $q$ is a departure. In practice an encoder is pushed to $\sigma \approx 1$ and $\mu \approx 0$ for every coordinate it does not need, which is how posterior collapse looks in the numbers.
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
A VAE with $d_z = 8$ reports these per-dimension KL values on the test set, in nats: $(2.1, 1.7, 0.003, 0.002, 1.2, 0.001, 0.004, 0.002)$. How many latent dimensions carry information about $\mathbf{x}$? What does the decoder do with the rest? Name two changes you would try if the task needs more of them.
:::

::: solution
**Three dimensions carry information: 1, 2 and 5.** A per-dimension KL is the price in nats of the departure of $q(z_j\mid\mathbf{x})$ from the prior $\mathcal{N}(0, 1)$, averaged over the test inputs ([Exercise 2](#e2) shows the price for one coordinate). A price of 0.001 to 0.004 nats means that $q(z_j\mid\mathbf{x})$ is, for every input, essentially $\mathcal{N}(0, 1)$: the mean does not move with $\mathbf{x}$ and the width stays at 1. Together the three active dimensions use $2.1 + 1.7 + 1.2 = 5.0$ nats, against 0.012 nats for the other five, so the code spends 99.8% of its budget on three coordinates. For scale, 5.0 nats is 7.2 bits, the most that the average input's code can tell the decoder about it (the average KL is an upper bound on the information the code carries about $\mathbf{x}$).

**What the decoder does with the rest.** In those five coordinates $z_j$ is a fresh draw from the prior, whatever the input: pure noise, independent of $\mathbf{x}$. Noise can only hurt reconstruction, so the decoder learns to ignore these inputs, with weights from them shrinking towards zero. This is **partial posterior collapse**: the coordinates are there but unused. Test it directly by decoding the same active code with different values of an inactive coordinate; the output should not change.

**Whether it is a problem depends on the task.** If the data really vary along three factors, three active dimensions is a good answer and the other five are free capacity. It is a problem only if reconstruction or sampling is poor in ways that more information would fix. Two changes to try, in the order of the cheapest first:

1. *Weaken the pressure of the KL term*: a KL weight below 1, or a warm-up that ramps it from 0 to 1 over the first epochs so the decoder starts using the code before the penalty bites. A related device is **free bits**, which gives each coordinate a floor of nats below which the KL is not charged.
2. *Make reconstruction worth more, or the decoder less self-sufficient.* A Gaussian decoder whose variance is large relative to the data makes errors cheap and information expensive; a summed squared error is that likelihood with $\sigma_x^2 = \tfrac12$ ([Section 3](#s3)), so a smaller variance (or a Bernoulli likelihood for pixels in $[0, 1]$) raises the exchange rate in favour of reconstruction. Separately, a smaller or less autoregressive decoder cannot model $\mathbf{x}$ without the code, so it must use it.

Neither guarantees that an unused coordinate becomes useful. Measure the result by what you needed in the first place, for instance a held-out ELBO or the accuracy of a probe on the code, and not by the number of active dimensions.
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
(a) For fixed $G$, the GAN value is $V = \int\big[p_{\text{data}}(\mathbf{x})\log D(\mathbf{x}) + p_g(\mathbf{x})\log(1 - D(\mathbf{x}))\big]\,d\mathbf{x}$. Maximise the integrand pointwise to obtain $D^*(\mathbf{x})$.

(b) Substitute $D^*$ and show that $V(G, D^*) = -\log 4 + 2\,\mathrm{JSD}(p_{\text{data}} \,\|\, p_g)$, where $\mathrm{JSD}(p \,\|\, q) = \tfrac12 D_{\KL}(p \,\|\, m) + \tfrac12 D_{\KL}(q \,\|\, m)$ and $m = (p + q)/2$.

(c) Check the result on three points with $p_{\text{data}} = (0.6, 0.3, 0.1)$ and $p_g = (0.2, 0.3, 0.5)$.
:::

::: solution
**(a) The optimal discriminator.** The integral is a sum of independent integrands, one for each $\mathbf{x}$, and $D$ is a free function, so the maximum over $D$ is found by maximising each integrand separately over the number $y = D(\mathbf{x}) \in (0, 1)$. Write $a = p_{\text{data}}(\mathbf{x})$ and $b = p_g(\mathbf{x})$, both positive, and $f(y) = a\log y + b\log(1 - y)$. Then

$$
f'(y) = \frac{a}{y} - \frac{b}{1-y} = 0 \;\Longrightarrow\; a(1 - y) = b\,y \;\Longrightarrow\; y^* = \frac{a}{a + b}.
$$

The second derivative, $f''(y) = -a/y^2 - b/(1-y)^2$, is negative, so $f$ is concave and the stationary point is its maximum. Hence

$$
D^*(\mathbf{x}) = \frac{p_{\text{data}}(\mathbf{x})}{p_{\text{data}}(\mathbf{x}) + p_g(\mathbf{x})}.
$$

It is the posterior probability that $\mathbf{x}$ is real, for a one-to-one mixture of real and generated points: the Bayes-optimal classifier.

**(b) The value at the optimum.** Substitute, using $1 - D^* = p_g/(p_{\text{data}} + p_g)$ and writing $p = p_{\text{data}}$, $q = p_g$:

$$
V(G, D^*) = \mathbb{E}_{p}\!\left[\log\frac{p}{p + q}\right] + \mathbb{E}_{q}\!\left[\log\frac{q}{p + q}\right].
$$

With $m = (p + q)/2$ we have $p + q = 2m$, so $\log\frac{p}{p+q} = \log\frac{p}{m} - \log 2$, and likewise for $q$. The constants come out of the expectations ($\mathbb{E}_p[1] = \mathbb{E}_q[1] = 1$):

$$
V = \underbrace{\mathbb{E}_{p}\!\left[\log\frac{p}{m}\right]}_{D_{\KL}(p\|m)} + \underbrace{\mathbb{E}_{q}\!\left[\log\frac{q}{m}\right]}_{D_{\KL}(q\|m)} - 2\log 2
= D_{\KL}(p\,\|\,m) + D_{\KL}(q\,\|\,m) - \log 4.
$$

By the definition of the JSD the two KL terms sum to $2\,\mathrm{JSD}(p\,\|\,q)$, so $V(G, D^*) = -\log 4 + 2\,\mathrm{JSD}(p_{\text{data}}\,\|\,p_g)$. The JSD is non-negative and zero only for equal distributions, so the generator's best value is $-\log 4 = -1.3863$, reached at $p_g = p_{\text{data}}$. This is the sense in which a GAN, with a perfect discriminator, minimises a divergence. The proviso is the whole story of GAN training difficulty: the discriminator is never perfect, and when it is nearly perfect its gradients to the generator vanish ([Section 4](#s4)).

**(c) The check.**

*Optimal discriminator.* $D^* = \big(\tfrac{0.6}{0.8}, \tfrac{0.3}{0.6}, \tfrac{0.1}{0.6}\big) = (0.75, 0.5, 0.1667)$.

*Value.* The data term is $0.6\log 0.75 + 0.3\log 0.5 + 0.1\log 0.1667 = -0.1726 - 0.2079 - 0.1792 = -0.5597$. The generator term, with $1 - D^* = (0.25, 0.5, 0.8333)$, is $0.2\log 0.25 + 0.3\log 0.5 + 0.5\log 0.8333 = -0.2773 - 0.2079 - 0.0912 = -0.5764$. So $V = -1.1361$.

*Through the JSD.* $m = (0.4, 0.3, 0.3)$. $D_{\KL}(p\,\|\,m) = 0.6\log\tfrac{0.6}{0.4} + 0.3\log 1 + 0.1\log\tfrac{0.1}{0.3} = 0.2433 + 0 - 0.1099 = 0.1334$, and $D_{\KL}(q\,\|\,m) = 0.2\log\tfrac{0.2}{0.4} + 0 + 0.5\log\tfrac{0.5}{0.3} = -0.1386 + 0.2554 = 0.1168$. So $\mathrm{JSD} = \tfrac12(0.1334 + 0.1168) = 0.1251$, and $-1.3863 + 2(0.1251) = -1.1361$. The two routes agree to four decimals.

The value lies between the extremes $-\log 4 = -1.3863$ (identical distributions) and $0$ (disjoint supports, where $D^*$ separates real from generated perfectly), as it must. A short script reproduces all of these numbers.

```python
import numpy as np

p = np.array([0.6, 0.3, 0.1])        # p_data
q = np.array([0.2, 0.3, 0.5])        # p_g
d_star = p / (p + q)
value = (p * np.log(d_star)).sum() + (q * np.log(1 - d_star)).sum()
m = (p + q) / 2
jsd = 0.5 * (p * np.log(p / m)).sum() + 0.5 * (q * np.log(q / m)).sum()
print("D* =", d_star.round(4))
print(f"V = {value:.4f}   -log 4 + 2 JSD = {-np.log(4) + 2 * jsd:.4f}   JSD = {jsd:.4f}")
```

```output
D* = [0.75   0.5    0.1667]
V = -1.1361   -log 4 + 2 JSD = -1.1361   JSD = 0.1251
```
:::

::: exercise id=e5 level=1 kind=conceptual minutes=5
A GAN trained on cross-section images of turbine blades produces samples an engineer cannot tell from real ones, and its discriminator's accuracy hovers around 50%. Describe one measurement that would reveal mode collapse: what you compute, what you compare it with, and what result would indicate collapse. Then explain why the discriminator's 50% accuracy is no evidence against it.
:::

::: solution
**Measure coverage, not realism.** Mode collapse is a failure of the generator to reach parts of $p_{\text{data}}$. A measurement that asks "do the samples look real?" is blind to it by construction, since each sample can look real and the samples can still be few. Ask instead whether the real data are near the samples.

1. Describe every blade section by a vector: a feature embedding of the image from a network trained on something else, or, better for engineering use, a handful of geometric parameters (chord, thickness, camber, cooling-hole count). Do the same for a set of held-out real sections and for an equal number of generated ones.
2. For each held-out real section, find the distance to its nearest generated sample (a **recall-like** distance).
3. Compare it with a reference you can trust: the distance from each held-out real section to its nearest neighbour among an *equally large set of other real sections*. This reference says how close a perfect generator would get at this sample size, since a perfect generator draws from the same distribution.
4. Also compute the **precision-like** distance, from each generated sample to its nearest real section, which is the realism measure.

**What indicates collapse.** The real-to-sample distances are much larger than the real-to-real reference, and the excess is concentrated: a block of real sections (a family of blades) has no generated sample anywhere near it. A summary that survives a skewed distribution is the fraction of real sections whose distance to the samples exceeds, say, the 99th percentile of the reference distances. For a generator that covers the data this fraction is about 1%, by the definition of the percentile. Realism, the precision-like distance, stays small throughout, which is why a realism metric or a human judge cannot detect the problem.

A constructed illustration, which is not a measurement of any real GAN: take eight kinds of section as eight tight clusters on a ring, a generator that samples only three of them perfectly, and a generator that covers all eight.

```python
import numpy as np
from scipy.spatial import cKDTree

rng = np.random.default_rng(0)
angles = 2 * np.pi * np.arange(8) / 8
centres = 2.0 * np.stack([np.cos(angles), np.sin(angles)], axis=1)   # 8 kinds of section

def draw(n, kinds):
    k = rng.choice(kinds, size=n)
    return centres[k] + 0.1 * rng.standard_normal((n, 2))

train_real = draw(2000, range(8))           # stands in for the real sections
held_out = draw(1000, range(8))             # held-out real sections
full = draw(1000, range(8))                 # a generator that covers every kind
collapsed = draw(1000, [0, 3, 5])           # perfect samples, but only 3 kinds

def median_nn(queries, reference):
    return np.median(cKDTree(reference).query(queries)[0])

print(f"real -> real (reference)   {median_nn(held_out, train_real[:1000]):.3f}")
d_ref = cKDTree(train_real[:1000]).query(held_out)[0]
for name, gen in (("covering generator", full), ("collapsed generator", collapsed)):
    d_gen = cKDTree(gen).query(held_out)[0]
    uncovered = np.mean(d_gen > np.quantile(d_ref, 0.99))
    print(f"{name}: sample->real {median_nn(gen, held_out):.3f}, "
          f"real->sample {median_nn(held_out, gen):.3f}, "
          f"uncovered real sections {uncovered:.3f}")
```

```output
real -> real (reference)   0.016
covering generator: sample->real 0.016, real->sample 0.016, uncovered real sections 0.011
collapsed generator: sample->real 0.016, real->sample 1.141, uncovered real sections 0.621
```

The collapsed generator is as realistic as the covering one (0.016 both), yet 62% of the real sections lie beyond the reference distance from every sample; that is $5/8 = 62.5\%$, the five clusters it never visits. The median real-to-sample distance jumped from 0.016 to 1.141 only because more than half of the data are uncovered: a collapse that misses a third of the data would leave the median unchanged, which is why the uncovered fraction is the better summary. The same samples-to-training-set distances also expose the opposite failure, near-copies of training images.

**Why 50% discriminator accuracy proves nothing.** The discriminator is trained to separate samples from data *where the samples are*. Regions of $p_{\text{data}}$ that the generator never visits contribute nothing to the generator's loss, since the generator is rewarded only for the samples it makes; and the discriminator sees no generated sample there to separate. Near 50% means that in the places the generator visits it is indistinguishable from the data. It says nothing about the places it does not. Moreover, the two networks play a game and not an optimisation: a discriminator that cycles, always chasing the generator's current favourite mode, sits near 50% on average while the generator hops from one mode to the next ([Section 4](#s4)). The accuracy is a symptom of balance between two players, not of coverage.
:::

::: exercise id=e6 level=2 kind=derivation minutes=10
Show that the per-step forward process $q(\mathbf{x}_t\mid\mathbf{x}_{t-1}) = \mathcal{N}\big(\sqrt{1-\beta_t}\,\mathbf{x}_{t-1},\ \beta_t\mathbf{I}\big)$ gives $q(\mathbf{x}_t\mid\mathbf{x}_0) = \mathcal{N}\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0,\ (1-\bar\alpha_t)\mathbf{I}\big)$ with $\bar\alpha_t = \prod_{s\le t}(1-\beta_s)$. Write $\mathbf{x}_t = \sqrt{\alpha_t}\,\mathbf{x}_{t-1} + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t$, assume the result for $t - 1$, and use the fact that a sum of independent zero-mean Gaussians is Gaussian with the sum of the variances.
:::

::: solution
**The set-up.** With $\alpha_t = 1 - \beta_t$, sampling from $\mathcal{N}(\sqrt{\alpha_t}\,\mathbf{x}_{t-1}, \beta_t\mathbf{I})$ is the same as the stated one-line update with fresh $\boldsymbol{\epsilon}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$, independent of everything before step $t$: scaling a standard normal by $\sqrt{\beta_t} = \sqrt{1-\alpha_t}$ gives variance $\beta_t$, and adding the mean shifts it. We prove the claim by induction on $t$, with the statement "$\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\bar{\boldsymbol{\epsilon}}_t$ for some $\bar{\boldsymbol{\epsilon}}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ that is independent of the later noises $\boldsymbol{\epsilon}_{t+1}, \boldsymbol{\epsilon}_{t+2}, \dots$". Independence from later noise is what the step needs.

**Base case, $t = 1$.** $\mathbf{x}_1 = \sqrt{\alpha_1}\,\mathbf{x}_0 + \sqrt{1-\alpha_1}\,\boldsymbol{\epsilon}_1$, and $\bar\alpha_1 = \alpha_1$, so the statement holds with $\bar{\boldsymbol{\epsilon}}_1 = \boldsymbol{\epsilon}_1$.

**Induction step.** Assume the statement for $t - 1$ and substitute it into the update for step $t$:

$$
\mathbf{x}_t = \sqrt{\alpha_t}\Big(\sqrt{\bar\alpha_{t-1}}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_{t-1}}\,\bar{\boldsymbol{\epsilon}}_{t-1}\Big) + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t
= \sqrt{\alpha_t\bar\alpha_{t-1}}\,\mathbf{x}_0 + \underbrace{\sqrt{\alpha_t(1-\bar\alpha_{t-1})}\,\bar{\boldsymbol{\epsilon}}_{t-1} + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t}_{\text{noise}}.
$$

Since $\alpha_t\bar\alpha_{t-1} = \bar\alpha_t$, the mean is $\sqrt{\bar\alpha_t}\,\mathbf{x}_0$. The noise is a sum of two independent zero-mean Gaussian vectors ($\bar{\boldsymbol{\epsilon}}_{t-1}$ is independent of $\boldsymbol{\epsilon}_t$ by the induction hypothesis), with covariances $\alpha_t(1-\bar\alpha_{t-1})\mathbf{I}$ and $(1-\alpha_t)\mathbf{I}$. Their sum is Gaussian with zero mean and covariance

$$
\big[\alpha_t - \alpha_t\bar\alpha_{t-1} + 1 - \alpha_t\big]\mathbf{I} = \big(1 - \alpha_t\bar\alpha_{t-1}\big)\mathbf{I} = (1 - \bar\alpha_t)\,\mathbf{I}.
$$

A zero-mean Gaussian with covariance $(1-\bar\alpha_t)\mathbf{I}$ can be written $\sqrt{1-\bar\alpha_t}\,\bar{\boldsymbol{\epsilon}}_t$ with $\bar{\boldsymbol{\epsilon}}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$, and $\bar{\boldsymbol{\epsilon}}_t$ is built from $\bar{\boldsymbol{\epsilon}}_{t-1}$ and $\boldsymbol{\epsilon}_t$ only, so it is independent of $\boldsymbol{\epsilon}_{t+1}, \dots$. That completes the induction, and gives

$$
q(\mathbf{x}_t\mid\mathbf{x}_0) = \mathcal{N}\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0,\ (1-\bar\alpha_t)\mathbf{I}\big).
$$

**Why the step works.** The key identity is $\alpha_t(1-\bar\alpha_{t-1}) + (1-\alpha_t) = 1 - \alpha_t\bar\alpha_{t-1}$: the variance that earlier noise has acquired, shrunk by the factor $\alpha_t$ the signal is scaled by, plus the fresh noise of this step, is exactly what is missing from the signal's shrinking weight. That the squares of the two scales sum to 1 at every $t$ is the reason the process keeps unit-variance data at unit variance.

**A numerical check.** Take three steps with $\beta = (0.1, 0.2, 0.3)$ (exaggerated, so the numbers are visible), so $\alpha = (0.9, 0.8, 0.7)$ and $\bar\alpha = (0.9,\ 0.72,\ 0.504)$. For a fixed $\mathbf{x}_0$ the variance of $\mathbf{x}_t$ obeys $\mathrm{Var}_t = \alpha_t\mathrm{Var}_{t-1} + \beta_t$. The recursion gives $0.1$, then $0.8 \times 0.1 + 0.2 = 0.28$, then $0.7 \times 0.28 + 0.3 = 0.496$, which equal $1 - \bar\alpha_t = 0.1, 0.28, 0.496$ as the formula says.

```python
import numpy as np

beta = np.array([0.1, 0.2, 0.3])
alpha = 1 - beta
alpha_bar = np.cumprod(alpha)

var = 0.0
for t in range(3):
    var = alpha[t] * var + beta[t]       # variance recursion for fixed x_0
    print(f"t={t + 1}: recursion {var:.4f}   1 - alpha_bar {1 - alpha_bar[t]:.4f}")

rng = np.random.default_rng(0)
x = np.ones(1_000_000)                   # one million chains started at x_0 = 1
for t in range(3):
    x = np.sqrt(alpha[t]) * x + np.sqrt(beta[t]) * rng.standard_normal(x.size)
print(f"sampled mean {x.mean():.4f} (sqrt(alpha_bar) = {np.sqrt(alpha_bar[2]):.4f}), "
      f"sampled variance {x.var():.4f}")
```

```output
t=1: recursion 0.1000   1 - alpha_bar 0.1000
t=2: recursion 0.2800   1 - alpha_bar 0.2800
t=3: recursion 0.4960   1 - alpha_bar 0.4960
sampled mean 0.7097 (sqrt(alpha_bar) = 0.7099), sampled variance 0.4953
```

Running the chain a million times gives mean $0.7097$ against $\sqrt{0.504} = 0.7099$ and variance $0.4953$ against $0.496$, as the closed form predicts (the last digits are sampling noise).
:::

::: exercise id=e7 level=2 kind=calculation minutes=10
Ho et al.'s linear schedule runs $\beta_t$ evenly from $10^{-4}$ to $0.02$ over $T = 1000$ steps.

(a) Estimate $\bar\alpha_T$ using $\log(1-\beta) \approx -\beta$ and compare with the exact product, $4.04\times10^{-5}$.

(b) Someone keeps the same $\beta$ range but sets $T = 100$. Estimate $\bar\alpha_T$ and $\sqrt{\bar\alpha_T}$.

(c) Explain what goes wrong when that model is sampled from $\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$, and give two fixes.
:::

::: solution
**The tool.** $\bar\alpha_T = \prod_t(1-\beta_t)$, so $\log\bar\alpha_T = \sum_t\log(1-\beta_t)$. The series $\log(1-\beta) = -\beta - \tfrac12\beta^2 - \dots$ shows that for small $\beta$ the first term dominates, and $\bar\alpha_T \approx \exp(-\sum_t\beta_t)$.

**(a)** The $\beta_t$ are an arithmetic sequence, so their sum is the number of terms times the mean of the endpoints: $1000 \times (10^{-4} + 0.02)/2 = 1000 \times 0.01005 = 10.05$. Then $\bar\alpha_T \approx e^{-10.05} = 4.32\times10^{-5}$, within 7% of the exact $4.04\times10^{-5}$. Most of the difference is the next term of the series. $\sum_t\beta_t^2/2 = 0.067$ here, so $\bar\alpha_T \approx e^{-10.05 - 0.067} = 4.04\times10^{-5}$, which matches to three figures. The signal amplitude left at the last step is $\sqrt{\bar\alpha_T} = 0.0064$: not zero, but about 0.6% of the signal, which is small enough for the model to be sampled from pure noise.

**(b)** With $T = 100$ the same range gives $\sum_t\beta_t = 100 \times 0.01005 = 1.005$, so $\bar\alpha_T \approx e^{-1.005} = 0.366$. The exact product is $0.364$ (the correction is now only $\sum\beta^2/2 = 0.0067$). So $\sqrt{\bar\alpha_T} \approx 0.60$: **at the noisiest step 60% of the signal amplitude remains**, and $\mathbf{x}_T$ is far from $\mathcal{N}(\mathbf{0}, \mathbf{I})$. The schedule was designed for ten times as many steps; each step adds a fixed small amount of noise, and with a tenth of them the total falls far short.

**(c) What goes wrong.** Sampling starts from $\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$, a signal-free draw. But during training the network was shown, at $t = T$, inputs $\mathbf{x}_T = 0.60\,\mathbf{x}_0 + 0.80\,\boldsymbol{\epsilon}$, which still contain a clear signal. At the first reverse step the network meets an input distribution it was never trained on, a train–test mismatch, and its prediction of the noise is wrong in a systematic way: it expects to find $\mathbf{x}_0$ in the input, so it reads structure into noise, and the error propagates through all later steps. The effect has been documented for image models whose last step is not pure noise, which cannot generate very bright or very dark images because the mean brightness of the training signal leaks through the noise (Lin et al. 2024, in the references).

**Two fixes.**

1. *Rescale the schedule to the new $T$*, so that $\bar\alpha_T$ is again near 0: multiply the range by $1000/T = 10$, giving $\beta_t$ from $10^{-3}$ to $0.2$. The sum is again 10.05 and the exact $\bar\alpha_T = 2.0\times10^{-5}$.
2. *Use a schedule built to end in noise*, such as the cosine schedule, which at $T = 100$ gives $\bar\alpha_T = 2.4\times10^{-7}$ (with $\beta_T$ clipped at 0.999, as in the original), or rescale any schedule to zero terminal signal-to-noise ratio.

(Fewer steps also make each step bigger, so a coarse linear schedule loses accuracy in the reverse process; the rescaling fixes the endpoint, not the discretisation.)

```python
import numpy as np

def report(name, beta):
    alpha_bar = np.prod(1 - beta)
    print(f"{name:34s} sum(beta) {beta.sum():6.3f}  e^-sum {np.exp(-beta.sum()):.3e}  "
          f"alpha_bar_T {alpha_bar:.3e}  sqrt {np.sqrt(alpha_bar):.4f}")

report("T=1000, 1e-4 to 0.02", np.linspace(1e-4, 0.02, 1000))
report("T=100,  1e-4 to 0.02", np.linspace(1e-4, 0.02, 100))
report("T=100,  rescaled 1e-3 to 0.2", np.linspace(1e-3, 0.2, 100))

T, s = 100, 0.008                        # cosine schedule, s = 0.008
t = np.arange(T + 1) / T
f = np.cos((t + s) / (1 + s) * np.pi / 2) ** 2
report("T=100, cosine (clip 0.999)", np.clip(1 - f[1:] / f[:-1], 0, 0.999))
```

```output
T=1000, 1e-4 to 0.02               sum(beta) 10.050  e^-sum 4.319e-05  alpha_bar_T 4.036e-05  sqrt 0.0064
T=100,  1e-4 to 0.02               sum(beta)  1.005  e^-sum 3.660e-01  alpha_bar_T 3.636e-01  sqrt 0.6030
T=100,  rescaled 1e-3 to 0.2       sum(beta) 10.050  e^-sum 4.319e-05  alpha_bar_T 2.039e-05  sqrt 0.0045
T=100, cosine (clip 0.999)         sum(beta)  7.879  e^-sum 3.787e-04  alpha_bar_T 2.429e-07  sqrt 0.0005
```

Two cautions on reading the table. The $e^{-\sum\beta}$ approximation is poor for the cosine row (its last $\beta$ is 0.999, so the first-order series does not apply), which is why the exact product is the number to use. And a rescaled schedule with $\beta$ up to 0.2 has large individual steps; it is the right endpoint, not necessarily the best path.
:::

::: exercise id=e8 level=2 kind=calculation minutes=10
A gate with three basic-event inputs forms a star graph: centre $c$ joined to leaves $a$, $b$ and $d$.

(a) Write $\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A} + \mathbf{I})\tilde{\mathbf{D}}^{-1/2}$.

(b) With the scalar feature $\mathbf{x} = (1, 0, 0, 0)$ (centre first), compute $\hat{\mathbf{A}}\mathbf{x}$ and $\hat{\mathbf{A}}^2\mathbf{x}$.

(c) Find the limit of $\hat{\mathbf{A}}^k\mathbf{x}$ as $k$ grows, using the eigenvector $\mathbf{u} \propto \tilde{\mathbf{D}}^{1/2}\mathbf{1}$, and the ratio of the centre's value to a leaf's.

(d) The eigenvalues of $\hat{\mathbf{A}}$ are $1$, $0.5$, $0.5$ and $-0.25$, and the eigenvectors for $0.5$ are zero at the centre and sum to zero over the leaves. How fast does $\hat{\mathbf{A}}^k\mathbf{x}$ approach its limit for this $\mathbf{x}$, and why not as $0.5^k$?
:::

::: solution
**(a) The matrix.** Adding self-loops gives $\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}$, with the centre joined to every node and every leaf to the centre and itself. The row sums are the degrees with self-loop: $\tilde{d}_c = 1 + 3 = 4$ and $\tilde{d}_{\text{leaf}} = 1 + 1 = 2$. Entry $(i, j)$ of $\hat{\mathbf{A}}$ is $\tilde{A}_{ij}/\sqrt{\tilde{d}_i\tilde{d}_j}$, so:

- centre to itself: $1/\sqrt{4\cdot4} = 1/4$;
- centre to a leaf, and back: $1/\sqrt{4\cdot2} = 1/\sqrt8 = 0.3536$;
- a leaf to itself: $1/\sqrt{2\cdot2} = 1/2$;
- between two leaves: 0 (they are not adjacent).

$$
\hat{\mathbf{A}} = \begin{pmatrix} 0.25 & 0.3536 & 0.3536 & 0.3536 \\ 0.3536 & 0.5 & 0 & 0 \\ 0.3536 & 0 & 0.5 & 0 \\ 0.3536 & 0 & 0 & 0.5 \end{pmatrix}.
$$

**(b) Two layers of propagation.** $\hat{\mathbf{A}}\mathbf{x}$ is the first column of $\hat{\mathbf{A}}$: $(0.25,\ 0.3536,\ 0.3536,\ 0.3536)$. After one step the feature has reached every leaf, each with $0.3536$, more than the centre's own $0.25$ (the centre's value is divided by $4$ but each leaf's is divided by $\sqrt8$). Applying $\hat{\mathbf{A}}$ again, row by row:

- centre: $0.25\times0.25 + 3\times(0.3536\times0.3536) = 0.0625 + 3\times0.125 = 0.4375$;
- each leaf: $0.3536\times0.25 + 0.5\times0.3536 = 0.0884 + 0.1768 = 0.2652$.

So $\hat{\mathbf{A}}^2\mathbf{x} = (0.4375,\ 0.2652,\ 0.2652,\ 0.2652)$. The centre's value swings up and down while the leaves settle.

**(c) The limit.** The vector $\tilde{\mathbf{D}}^{1/2}\mathbf{1}$ is an eigenvector of $\hat{\mathbf{A}}$ with eigenvalue 1:

$$
\hat{\mathbf{A}}\,\tilde{\mathbf{D}}^{1/2}\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\,\tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{D}}^{1/2}\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\,\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{d}} = \tilde{\mathbf{D}}^{1/2}\mathbf{1},
$$

because $\tilde{\mathbf{A}}\mathbf{1}$ is the vector of row sums $\tilde{\mathbf{d}}$ and $\tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{d}} = \tilde{\mathbf{D}}^{1/2}\mathbf{1}$. Here it is $(2, \sqrt2, \sqrt2, \sqrt2)$; normalised to unit length (its squared norm is $4 + 6 = 10$), $\mathbf{u} = (2, \sqrt2, \sqrt2, \sqrt2)/\sqrt{10} = (0.6325, 0.4472, 0.4472, 0.4472)$.

$\hat{\mathbf{A}}$ is symmetric, so its eigenvectors are orthogonal and $\mathbf{x}$ decomposes into them. Every other eigenvalue has magnitude below 1 (they are $0.5, 0.5, -0.25$), so after many applications only the component along $\mathbf{u}$ survives: $\hat{\mathbf{A}}^k\mathbf{x} \to \mathbf{u}\,(\mathbf{u}^\top\mathbf{x})$. With $\mathbf{u}^\top\mathbf{x} = 0.6325$,

$$
\lim_{k\to\infty}\hat{\mathbf{A}}^k\mathbf{x} = 0.6325\,\mathbf{u} = (0.4,\ 0.2828,\ 0.2828,\ 0.2828).
$$

Its centre-to-leaf ratio is $\sqrt{\tilde{d}_c/\tilde{d}_{\text{leaf}}} = \sqrt{4/2} = \sqrt2 = 1.414$. **In the limit the nodes differ only by the square root of their degree**: whatever the input feature was, it has been washed out and what is left is how well connected each node is. This is over-smoothing in its purest form ([Section 8](#s8)).

**(d) How fast.** The error after $k$ steps is $\hat{\mathbf{A}}^k\mathbf{x}$ minus the limit, which is the part of $\mathbf{x}$ orthogonal to $\mathbf{u}$, multiplied $k$ times by the other eigenvalues. Decompose it:

$$
\mathbf{x} - \mathbf{u}(\mathbf{u}^\top\mathbf{x}) = (1, 0, 0, 0) - (0.4, 0.2828, 0.2828, 0.2828) = (0.6,\ -0.2828,\ -0.2828,\ -0.2828).
$$

The eigenvectors for $0.5$ are zero at the centre and sum to zero over the leaves, so a vector that takes the same value on all three leaves has no component along them (its inner product with each is that value times the sum of the eigenvector's leaf entries, which is 0). The remainder takes the value $-0.2828$ on all three leaves, so it lies entirely along the last eigenvector, for $\lambda = -0.25$: indeed $(0.6, -0.2828, -0.2828, -0.2828)$ is proportional to $(-2.121, 1, 1, 1)$, and one checks $\hat{\mathbf{A}}\mathbf{v} = -0.25\,\mathbf{v}$ directly (centre row: $0.25(-2.121) + 3(0.3536) = 0.530 = -0.25(-2.121)$; leaf row: $0.3536(-2.121) + 0.5 = -0.25$). So the error is multiplied by $-0.25$ at each step: **it shrinks by a factor of 4 per step and flips sign**, which is the swing seen in (b), where the centre went $0.25 \to 0.4375 \to 0.3906 \to 0.4023 \to \dots$ around 0.4. The relative errors $\|\hat{\mathbf{A}}^k\mathbf{x} - \text{limit}\| / \|\text{limit}\|$ are $0.306,\ 0.0765,\ 0.0191,\ 0.0048$ for $k = 1, \dots, 4$: below 1% from $k = 4$.

The second-largest eigenvalue magnitude (here $0.5$) bounds the rate for *any* feature vector, but the actual rate is set by which eigenvectors the features touch. A leaf's feature, $\mathbf{x} = (0, 1, 0, 0)$, has a component along the $\lambda = 0.5$ eigenspace (it is $(0, \tfrac23, -\tfrac13, -\tfrac13)$, of norm $0.8165$, against a limit of norm $0.4472$) and converges as $0.5^k$: the relative error is $1.83 \times 0.5^k$ plus the $-0.25$ part, which gives $0.935$ at $k = 1$, $0.114$ at $k = 4$ and $0.0071$ at $k = 8$, below 1% only from $k = 8$. Symmetric inputs converge fast; asymmetric ones are limited by the worst eigenvalue.

```python
import numpy as np

A = np.zeros((4, 4))
A[0, 1:] = A[1:, 0] = 1                    # node 0 is the centre, 1-3 the leaves
A_tilde = A + np.eye(4)
d_tilde = A_tilde.sum(axis=1)              # (4, 2, 2, 2)
A_hat = A_tilde / np.sqrt(np.outer(d_tilde, d_tilde))
print("A_hat =\n", A_hat.round(4))
print("eigenvalues", np.linalg.eigvalsh(A_hat).round(4))

u = np.sqrt(d_tilde) / np.linalg.norm(np.sqrt(d_tilde))
for label, x in (("centre feature", np.array([1.0, 0, 0, 0])),
                 ("leaf feature  ", np.array([0, 1.0, 0, 0]))):
    limit = u * (u @ x)
    errors, h = [], x.copy()
    for k in range(1, 9):
        h = A_hat @ h
        errors.append(np.linalg.norm(h - limit) / np.linalg.norm(limit))
    print(label, "limit", limit.round(4))
    print("   relative error, k = 1..8:", " ".join(f"{e:.4f}" for e in errors))
    if label.startswith("centre"):
        print("   A_hat x   =", (A_hat @ x).round(4))
        print("   A_hat^2 x =", (A_hat @ A_hat @ x).round(4))
```

```output
A_hat =
 [[0.25   0.3536 0.3536 0.3536]
 [0.3536 0.5    0.     0.    ]
 [0.3536 0.     0.5    0.    ]
 [0.3536 0.     0.     0.5   ]]
eigenvalues [-0.25  0.5   0.5   1.  ]
centre feature limit [0.4    0.2828 0.2828 0.2828]
   relative error, k = 1..8: 0.3062 0.0765 0.0191 0.0048 0.0012 0.0003 0.0001 0.0000
   A_hat x   = [0.25   0.3536 0.3536 0.3536]
   A_hat^2 x = [0.4375 0.2652 0.2652 0.2652]
leaf feature   limit [0.2828 0.2    0.2    0.2   ]
   relative error, k = 1..8: 0.9354 0.4593 0.2286 0.1142 0.0571 0.0285 0.0143 0.0071
```
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
A colleague trains a two-layer GCN to predict which nodes of fault trees are basic events, with node degree among the features, and reports 99% test accuracy. What baseline should the result be compared with, what does that baseline score, and what task would actually test whether a GNN has learned something about fault-tree structure?
:::

::: solution
**The baseline is a one-line rule.** In a fault tree the basic events are exactly the leaves, the nodes with no inputs below them. A leaf is joined to its parent gate only, so every non-top node with a single neighbour is a basic event. Every gate has at least two inputs plus a parent (or, for the top event, at least two inputs), so a gate always has at least two neighbours. Therefore **"basic event if and only if the node has exactly one neighbour" is correct for every node of every fault tree: it scores 100%.** A model with degree among its features is handed the answer: the classifier has only to threshold one input.

So 99% test accuracy is not evidence of anything. It is below the free baseline. The sensible comparison for any classification result starts with the cheapest rule that uses the same inputs, as in [Module 01](module_01_EN.html), and the number to report is the margin over it.

A short experiment makes the point. It generates 300 random fault trees (gates with two or three inputs, each input a basic event with probability 0.45 or a gate until a depth limit), scores the leaf rule, and trains a two-layer GCN with degree as the only feature on 200 trees, testing on the other 100: the split is by tree, never by node, since nodes of one tree share their structure (leakage, [Module 01](module_01_EN.html)).

```python
import numpy as np, torch, torch.nn as nn
rng = np.random.default_rng(0)
torch.manual_seed(0)

def random_fault_tree(max_depth=4):
    """Return (edges, is_basic_event). Node 0 is the top gate; gates have 2-3 inputs."""
    edges, is_basic, frontier = [], [False], [(0, 0)]
    while frontier:
        node, depth = frontier.pop()
        for _ in range(rng.integers(2, 4)):          # a gate has 2 or 3 inputs
            child = len(is_basic)
            leaf = depth + 1 >= max_depth or rng.random() < 0.45
            is_basic.append(bool(leaf))
            edges.append((node, child))
            if not leaf:
                frontier.append((child, depth + 1))
    return edges, np.array(is_basic)

def graph_tensors(edges, n):
    A = np.zeros((n, n), dtype=np.float32)
    for a, b in edges:
        A[a, b] = A[b, a] = 1.0
    At = A + np.eye(n, dtype=np.float32)
    dinv = 1.0 / np.sqrt(At.sum(1))
    return torch.tensor(dinv[:, None] * At * dinv[None, :]), A.sum(1)

trees = [random_fault_tree() for _ in range(300)]
data = []
for edges, basic in trees:
    n = len(basic)
    A_hat, deg = graph_tensors(edges, n)
    data.append((A_hat, torch.tensor(deg[:, None] / 4.0, dtype=torch.float32),
                 torch.tensor(basic, dtype=torch.float32)))
sizes = [len(b) for _, b in trees]
print("nodes per tree: min", min(sizes), "max", max(sizes))

# the baseline: a node with exactly one neighbour is a basic event
rule_correct = sum(int(((d[1].squeeze() == 0.25) == d[2].bool()).sum()) for d in data)
print(f"leaf rule accuracy: {rule_correct / sum(sizes):.4f}")

class GCN(nn.Module):
    def __init__(self, hidden=16):
        super().__init__()
        self.w1, self.w2 = nn.Linear(1, hidden), nn.Linear(hidden, 1)
    def forward(self, A_hat, x):
        h = torch.relu(A_hat @ self.w1(x))
        return (A_hat @ self.w2(h)).squeeze(-1)

train, test = data[:200], data[200:]            # split by tree, not by node
model = GCN()
opt = torch.optim.Adam(model.parameters(), lr=1e-2)
for epoch in range(300):
    for A_hat, x, y in train:
        loss = nn.functional.binary_cross_entropy_with_logits(model(A_hat, x), y)
        opt.zero_grad(); loss.backward(); opt.step()

def accuracy(split):
    ok = tot = 0
    with torch.no_grad():
        for A_hat, x, y in split:
            ok += int(((model(A_hat, x) > 0).float() == y).sum()); tot += len(y)
    return ok / tot

share = np.mean(np.concatenate([b for _, b in trees]))
print(f"GCN test accuracy: {accuracy(test):.4f}")
print(f"share of basic events (majority baseline): {max(share, 1 - share):.4f}")
```

```output
nodes per tree: min 3 max 58
leaf rule accuracy: 1.0000
GCN test accuracy: 0.8276
share of basic events (majority baseline): 0.6237
```

(Last digits may differ between machines.) The leaf rule scores exactly 1.0000. The GCN, which receives the degree and averages it with its neighbours' degrees at every layer, gets 0.83 here, well above the majority class (0.62) and well below the rule: the normalised aggregation blurs the one number that carries the answer, and the network has to learn to undo that. A different feature set or longer training moves it, but it cannot beat the rule, and it was never going to. Whatever the colleague's 99% reflects, the correct reading is that a rule solves this task and the network approximates it.

**A task that tests structure.** Choose a label that needs information several hops away and is not a function of a node's own neighbourhood size. The example of [Lab 3](#lab3) is *single points of failure*: a basic event whose failure alone brings down the top event, which happens when every gate on its path to the top is an OR gate. Whether a node qualifies depends on gate types all the way to the root, so a network with $L$ layers sees only $L$ hops of it. Evaluate with a split by tree, compare against simple baselines (the majority class; "the gate above is an OR") and against the exact algorithm, and report the accuracy as a function of depth. That is a result that says something about whether message passing learned the structure.
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
Graph P is the complete bipartite graph $K_{3,3}$: two rows of three nodes, each node joined to all three nodes of the other row. Graph Q is the triangular prism: two triangles with corresponding corners joined. Every node has the same feature vector. Explain why any message-passing GNN (GCN, GAT, GIN) gives every node the same embedding in both graphs, whatever the number of layers, and why a sum or mean readout cannot tell P from Q. Propose one input feature that would.
:::

::: solution
**The two graphs look the same locally.** Count: both have 6 nodes and 9 edges, and in both every node has exactly three neighbours (in $K_{3,3}$ the three nodes of the other row; in the prism the two triangle neighbours and the partner corner). They are both **3-regular**.

**Why every node ends up with the same embedding.** Take any layer of a message-passing network. A node's new embedding is a function of its own current embedding and of the multiset of its neighbours' embeddings. Initially all 12 nodes (6 in each graph) carry the same vector $\mathbf{h}^{(0)}$. By induction, suppose all nodes carry the same $\mathbf{h}^{(l)}$. Then every node receives the same three identical messages and applies the same update, so all carry the same $\mathbf{h}^{(l+1)}$. Concretely:

- *GCN*: the degree with self-loop is 4 for every node, every weight is $1/\sqrt{4\cdot4} = 1/4$, and the new embedding is $\phi\big(\tfrac14\mathbf{W}\mathbf{h} + 3\cdot\tfrac14\mathbf{W}\mathbf{h}\big)$, the same everywhere;
- *GAT*: the attention weights are a softmax over three neighbours whose keys are identical, hence uniform ($1/3$ each); the weighted sum of identical vectors is that vector;
- *GIN*: the sum of three identical vectors is three times that vector, again the same everywhere.

This holds for every layer, so any depth leaves all node embeddings identical, in both graphs and with the same value in P and in Q.

**Why the readout cannot help.** A sum readout over six identical vectors is $6\mathbf{h}^{(L)}$ and a mean is $\mathbf{h}^{(L)}$, the same for P as for Q. Nothing after the last layer sees anything but these identical embeddings.

**The limit behind it.** This is the 1-Weisfeiler–Lehman limit: colour refinement (repeatedly recolouring each node by its colour and the multiset of its neighbours' colours) never splits the nodes of a regular graph, and message-passing networks are at most as discriminating as that test. Yet the graphs are different objects: the prism contains two triangles, while $K_{3,3}$, being bipartite, has no odd cycles and so no triangle. In a safety setting this is the difference between two redundancy structures that a message-passing network would score identically.

**Features that break the tie** (each adds information that message passing cannot compute for itself):

- the number of triangles through each node: 1 for every node of Q, 0 for every node of P (equivalently the diagonal of $\mathbf{A}^3$ divided by 2; $\operatorname{tr}(\mathbf{A}^3)/6$ is 2 triangles for Q, 0 for P);
- the length of the shortest cycle through the node: 3 against 4;
- random node identifiers, which break the symmetry at the cost of making the embeddings depend on the draw;
- a spectral positional encoding. The adjacency eigenvalues are $3, 0, 0, 0, 0, -3$ for P and $3, 1, 0, 0, -2, -2$ for Q, so even the spectrum separates them.

(The eigenvalues and triangle counts were computed with NumPy; $\mathbf{A}$ of each graph has all row sums equal to 3.)
:::

::: exercise id=e11 level=2 kind=derivation minutes=10
For $u'' + 2\zeta\omega_0 u' + \omega_0^2 u = 0$ with $u(0) = 1$ and $u'(0) = 0$, a student proposes the trial solution $u(t) = e^{-\zeta\omega_0 t}\cos\omega_0 t$: decaying, but at the undamped frequency.

(a) Compute the residual $r(t)$ symbolically.

(b) Evaluate $r(0)$ and the initial-condition terms $(u(0) - 1)^2$ and $u'(0)^2$ for $\zeta = 0.1$ and $\omega_0 = 2\pi$.

(c) What two changes give the exact solution, and how would a PINN's loss report the trial function's error?
:::

::: solution
**(a) The residual.** Write $a = \zeta\omega_0$, so the equation is $u'' + 2a\,u' + \omega_0^2 u = 0$ and the trial is $u = e^{-at}\cos\omega_0 t$. Two derivatives with the product rule:

$$
u' = -a\,e^{-at}\cos\omega_0 t - \omega_0\,e^{-at}\sin\omega_0 t = -e^{-at}\big(a\cos\omega_0 t + \omega_0\sin\omega_0 t\big),
$$

$$
u'' = a\,e^{-at}\big(a\cos\omega_0 t + \omega_0\sin\omega_0 t\big) - e^{-at}\big(-a\omega_0\sin\omega_0 t + \omega_0^2\cos\omega_0 t\big)
= e^{-at}\Big[(a^2 - \omega_0^2)\cos\omega_0 t + 2a\omega_0\sin\omega_0 t\Big].
$$

Substitute into $r = u'' + 2a\,u' + \omega_0^2 u$, factoring out $e^{-at}$:

$$
r = e^{-at}\Big[(a^2 - \omega_0^2)\cos + 2a\omega_0\sin - 2a^2\cos - 2a\omega_0\sin + \omega_0^2\cos\Big].
$$

The sine terms cancel ($+2a\omega_0$ from $u''$, $-2a\omega_0$ from $2a\,u'$). The cosine coefficient is $a^2 - \omega_0^2 - 2a^2 + \omega_0^2 = -a^2$. So

$$
r(t) = -a^2e^{-at}\cos\omega_0 t = -\zeta^2\omega_0^2\,e^{-\zeta\omega_0 t}\cos\omega_0 t.
$$

The residual is of order $\zeta^2$: a trial that gets the decay right and the frequency slightly wrong is nearly a solution as far as the equation can tell. This is the key to part (c).

**(b) The numbers.** $\zeta^2\omega_0^2 = 0.01 \times (2\pi)^2 = 0.3948$, so

- $r(0) = -0.3948$ (the cosine and the exponential are both 1);
- $u(0) = 1$, so $(u(0) - 1)^2 = 0$;
- $u'(0) = -a = -\zeta\omega_0 = -0.6283$ (from the expression for $u'$ with $t = 0$: $-a\cdot1 - \omega_0\cdot0$), so $u'(0)^2 = 0.3948$, which equals $a^2$.

**(c) The exact solution, and what the loss says.** The undamped frequency is the error. A solution of the form $e^{-at}\cos\omega t$ has residual $e^{-at}(\omega_0^2 - a^2 - \omega^2)\cos\omega t$ (the same algebra with $\omega$ in place of $\omega_0$ in the trial's own derivatives), which vanishes if and only if $\omega^2 = \omega_0^2 - a^2 = \omega_0^2(1 - \zeta^2)$. The two changes are therefore:

1. *Replace $\omega_0$ by the damped frequency* $\omega_d = \omega_0\sqrt{1 - \zeta^2} = 6.252$ rad/s inside the cosine. The result solves the equation exactly but still has $u'(0) = -a \neq 0$.
2. *Add the sine term* $\dfrac{\zeta\omega_0}{\omega_d}\,e^{-at}\sin\omega_d t$. It is also a solution of the same linear equation (the algebra above, for the sine, gives zero residual by the same condition on $\omega$), so adding it keeps the residual at zero, and its derivative at 0 is $+a$, which cancels the $-a$: $u'(0) = 0$.

The result, $u = e^{-at}\big[\cos\omega_d t + (\zeta\omega_0/\omega_d)\sin\omega_d t\big]$, is the exact solution of [Section 9](#s9). A symbolic check confirms it: its residual simplifies to 0, $u(0) = 1$ and $u'(0) = 0$.

**What a PINN's loss reports for the trial.** Three terms:

- *Initial position*: $(u(0) - 1)^2 = 0$.
- *Initial velocity*: $u'(0)^2 = 0.395$.
- *Residual*: the mean of $r^2$ over $[0, 2]$ s. The integral of $\zeta^4\omega_0^4 e^{-2at}\cos^2\omega_0 t$ over the interval, divided by its length 2, is $0.0288$. On 200 evenly spaced collocation points including both ends, as in [Lab 4](#lab4), it is $0.0291$.

So with all weights equal to 1 the loss reports the error mostly as an *initial-velocity* error (0.39), and the residual contributes only 0.03. The equation barely notices the wrong frequency, because the residual is second order in $\zeta$; the initial condition notices it a great deal. Two lessons: a small residual is a weak certificate when the solution is nearly right, and the loss terms live on different scales, which is why the weights matter. Compare the undamped near miss in [Section 9](#s9), whose residual is two orders of magnitude larger.

```python
import sympy as sp

t, z, w0 = sp.symbols("t zeta omega_0", positive=True)
a = z * w0

def residual(u):
    return sp.simplify(sp.diff(u, t, 2) + 2 * a * sp.diff(u, t) + w0**2 * u)

trial = sp.exp(-a * t) * sp.cos(w0 * t)
print("trial residual:", residual(trial))
wd = w0 * sp.sqrt(1 - z**2)
exact = sp.exp(-a * t) * (sp.cos(wd * t) + a / wd * sp.sin(wd * t))
print("exact residual:", residual(exact))
print("exact u(0), u'(0):", sp.simplify(exact.subs(t, 0)), sp.simplify(sp.diff(exact, t).subs(t, 0)))
vals = {z: 0.1, w0: 2 * sp.pi}
print("r(0) =", round(float(residual(trial).subs(t, 0).subs(vals)), 4))
print("u'(0) of trial =", round(float(sp.diff(trial, t).subs(t, 0).subs(vals)), 4))
```

```output
trial residual: -omega_0**2*zeta**2*exp(-omega_0*t*zeta)*cos(omega_0*t)
exact residual: 0
exact u(0), u'(0): 1 0
r(0) = -0.3948
u'(0) of trial = -0.6283
```
:::

::: exercise id=e12 level=3 kind=coding minutes=25
Adapt [Lab 4](#lab4)'s code to the heat equation $u_t = u_{xx}$ on $x \in [0, 1]$, $t \in [0, 0.2]$, with $u(x, 0) = \sin\pi x$ and $u(0, t) = u(1, t) = 0$.

Use a tanh MLP ($2 \to 32 \to 32 \to 32 \to 1$) with inputs $(x,\ t/0.2)$, 1,000 random collocation points redrawn at every step, 100 initial-condition points and 100 points on each boundary, Adam with learning rate $10^{-3}$, 8,000 steps, every loss weight 1, and `torch.set_num_threads(1)`. Report the relative $L_2$ error against the exact solution $e^{-\pi^2 t}\sin\pi x$ on a $101 \times 51$ grid.

Then remove the boundary term, train again from the same seed, and report the error and the values $u(0, 0.2)$, $u(0.5, 0.2)$ and $u(1, 0.2)$. Explain what the network converged to.
:::

::: solution
**Plan.** The loss has three terms, each a mean of squares over its own points: the residual $u_t - u_{xx}$ on 1,000 interior points, the initial condition $u(x, 0) - \sin\pi x$ on 100 points, and the boundary values $u(0, t)$ and $u(1, t)$ on 200 points (100 per end). The network's second input is $t/0.2$, so it sees both inputs in $[0, 1]$; the chain rule gives $u_t = \tfrac{1}{0.2}\,\partial u/\partial s$ with $s = t/0.2$, and I avoid the bookkeeping by feeding the network $(x, t)$ through a helper that does the division and differentiating with respect to $t$ itself, so autograd applies the factor. Fresh random points at every step mean the loss is noisy from step to step, which is why the logs below report the error on the fixed grid rather than the loss alone.

To make the two runs differ *only* in the boundary term, both draw exactly the same random numbers (all points are drawn every step; only the boundary term's weight changes from 1 to 0) and both start from the same seed.

```python
import time
import numpy as np
import torch
import torch.nn as nn

torch.set_num_threads(1)   # a network this small gains nothing from threads

T_END, STEPS = 0.2, 8000

def make_net():
    return nn.Sequential(nn.Linear(2, 32), nn.Tanh(), nn.Linear(32, 32), nn.Tanh(),
                         nn.Linear(32, 32), nn.Tanh(), nn.Linear(32, 1))

def u_net(net, x, t):
    """The network sees (x, t / T_END), both in [0, 1]."""
    return net(torch.cat([x, t / T_END], dim=1))

def grad(out, inp):
    return torch.autograd.grad(out, inp, grad_outputs=torch.ones_like(out),
                               create_graph=True)[0]

def residual(net, x, t):
    x = x.clone().requires_grad_(True)
    t = t.clone().requires_grad_(True)
    u = u_net(net, x, t)
    u_t = grad(u, t)
    u_xx = grad(grad(u, x), x)
    return u_t - u_xx

def sample_losses(net, gen):
    """Draw one fresh set of points and return the three loss terms."""
    x_c = torch.rand(1000, 1, generator=gen)
    t_c = T_END * torch.rand(1000, 1, generator=gen)
    x_i = torch.rand(100, 1, generator=gen)
    t_b = T_END * torch.rand(200, 1, generator=gen)           # 100 per end
    x_b = torch.cat([torch.zeros(100, 1), torch.ones(100, 1)])
    loss_r = residual(net, x_c, t_c).pow(2).mean()
    u0 = u_net(net, x_i, torch.zeros_like(x_i))
    loss_ic = (u0 - torch.sin(np.pi * x_i)).pow(2).mean()
    loss_bc = u_net(net, x_b, t_b).pow(2).mean()
    return loss_r, loss_ic, loss_bc

def exact(x, t):
    return np.exp(-np.pi ** 2 * t) * np.sin(np.pi * x)

def evaluate(net):
    xs, ts = np.linspace(0, 1, 101), np.linspace(0, T_END, 51)
    X, T = np.meshgrid(xs, ts, indexing="ij")
    with torch.no_grad():
        u = u_net(net, torch.tensor(X.reshape(-1, 1), dtype=torch.float32),
                  torch.tensor(T.reshape(-1, 1), dtype=torch.float32))
    u = u.numpy().reshape(X.shape)
    ue = exact(X, T)
    return np.linalg.norm(u - ue) / np.linalg.norm(ue), u

def train(lam_bc):
    torch.manual_seed(0)
    net = make_net()
    gen = torch.Generator().manual_seed(0)
    opt = torch.optim.Adam(net.parameters(), lr=1e-3)
    start = time.time()
    for step in range(1, STEPS + 1):
        loss_r, loss_ic, loss_bc = sample_losses(net, gen)
        loss = loss_r + loss_ic + lam_bc * loss_bc      # every weight 1, or 0 for bc
        opt.zero_grad()
        loss.backward()
        opt.step()
        if step in (2000, 4000, 8000):
            err, _ = evaluate(net)
            print(f"  step {step}: loss {loss.item():.2e}, rel L2 error {err:.4f}")
    print(f"  {time.time() - start:.0f} s")
    return net

for name, lam_bc in (("with boundary term", 1.0), ("without boundary term", 0.0)):
    print(name)
    net = train(lam_bc)
    err, u = evaluate(net)
    gen = torch.Generator().manual_seed(123)
    r, i, b = sample_losses(net, gen)
    print(f"  final rel L2 error {err:.4f}")
    print(f"  fresh-point losses: residual {r.item():.1e}, initial {i.item():.1e}, "
          f"boundary {b.item():.1e}")
    print(f"  u(0, 0.2) = {u[0, -1]:+.3f}   u(0.5, 0.2) = {u[50, -1]:+.3f}   "
          f"u(1, 0.2) = {u[100, -1]:+.3f}")
print(f"exact u(0.5, 0.2) = {exact(0.5, 0.2):.3f}")
```

```output
with boundary term
  step 2000: loss 1.55e-03, rel L2 error 0.0359
  step 4000: loss 6.06e-04, rel L2 error 0.0215
  step 8000: loss 5.42e-04, rel L2 error 0.0163
  48 s
  final rel L2 error 0.0163
  fresh-point losses: residual 6.5e-04, initial 8.5e-06, boundary 4.2e-05
  u(0, 0.2) = -0.006   u(0.5, 0.2) = +0.144   u(1, 0.2) = -0.005
without boundary term
  step 2000: loss 4.42e-04, rel L2 error 0.7804
  step 4000: loss 2.21e-04, rel L2 error 0.8247
  step 8000: loss 2.57e-03, rel L2 error 0.7676
  48 s
  final rel L2 error 0.7676
  fresh-point losses: residual 2.0e-03, initial 1.3e-04, boundary 1.9e-01
  u(0, 0.2) = -0.673   u(0.5, 0.2) = -0.222   u(1, 0.2) = -0.681
exact u(0.5, 0.2) = 0.139
```

(Run on one CPU thread, each training takes under a minute. Last digits may differ with the PyTorch build and the machine; the phenomenon below does not.)

**Reading the results.**

*With the boundary term* the error falls steadily, $0.036 \to 0.022 \to 0.016$ at 2,000, 4,000 and 8,000 steps: the network reproduces the decay of the sine, with $u(0.5, 0.2) = 0.144$ against the exact $0.139$ and the ends held near zero ($-0.006$ and $-0.005$). The error is about 1.6%, which is respectable and no better: a finite-element solver would reach this accuracy in milliseconds and go well below it, the honest comparison of [Section 9](#s9). The error has not stopped improving at 8,000 steps, and the noisy loss from resampled points limits how far this learning rate takes it.

*Without the boundary term* the relative error is $0.77$, stuck at that level from step 2,000 on, and the answer is qualitatively wrong. $u(0.5, 0.2)$ is $-0.22$, where heat can only have decayed from $+1$ to $+0.139$; the ends sit at about $-0.67$ and $-0.68$, not zero. The residual ($2.0\times10^{-3}$) and the initial-condition loss ($1.3\times10^{-4}$) on fresh points are of the same order of magnitude as the good run's ($6.5\times10^{-4}$ and $8.5\times10^{-6}$), so by the two terms that remain, this network satisfies the equation about as well as the correct one does. Only the boundary term, now unobserved by the optimiser but still computable, gives it away: $0.19$ against $4.2\times10^{-5}$.

(One more observation: the loss of the no-boundary run is higher at step 8,000 than at step 4,000, a spike of the noisy stochastic loss that the logs show, and a reminder not to read a single printed loss as convergence.)

**What the network converged to.** A different solution of the same equation. On a bounded interval the heat equation with only an initial condition has *infinitely many* solutions, one for each way heat may enter or leave through the ends. The classical uniqueness theorem needs the boundary values: the difference of two solutions with the same initial data and the same boundary values obeys an energy decay law that forces it to zero, but without boundary values nothing ties the difference down. Here the network found a solution in which both ends are cooled to about $-0.7$ within 0.2 s and the interior follows, a perfectly legitimate solution of $u_t = u_{xx}$ with $u(x, 0) = \sin\pi x$ and the wrong boundary data. It satisfies exactly what it was asked to satisfy.

**The general lesson.** A small residual certifies that the equation holds at the collocation points. It does not certify that the problem was posed completely: a missing boundary or initial condition, or a wrong one, gives a network that minimises the loss perfectly and answers a different question. The check that catches this is an independent one, a comparison with a known solution, a solver, or measurements, as here against $e^{-\pi^2 t}\sin\pi x$. Compare also the damped oscillator of [Lab 4](#lab4), where the missing piece was the initial conditions and the network returned $u \equiv 0$ instead.
:::

::: exercise id=e13 level=1 kind=conceptual minutes=5
Choose a family for each need and name the first baseline it must beat.

(a) A surrogate for the steady temperature field of a finned heat sink across fin heights of 10 to 30 mm and inlet air speeds of 1 to 5 m/s, trained on 2,000 CFD runs.

(b) The same surrogate is asked about an inlet speed of 12 m/s.

(c) 50,000 unlabelled thermal images of weld seams from a production line, and 20 labelled defects of four types.

(d) A 30-node system architecture model in which some components may be single points of failure.
:::

::: solution
Each case is answered by asking what the data are, what the output is, and what simple method already does the job.

**(a) A surrogate across a family of designs: a neural operator, or a mesh-based graph network, but check the baselines first.** The output is a field (temperature over the sink), and the inputs are the parameters of a family, which is the setting of [Section 10](#s10). If each run has its own mesh because the geometry varies, a graph network on the mesh ([Section 8](#s8)) is the natural reader; if the fields sit on a common grid, a Fourier neural operator or DeepONet is. The baselines that must be beaten are:

- *a classical surrogate fitted to the same 2,000 runs*: a Gaussian process or proper orthogonal decomposition (POD) with a regression on the coefficients. With only two scalar inputs (fin height and speed) and 2,000 runs the input space is densely sampled, and these baselines are very strong; a neural operator earns its place only when it matches them at lower cost or when the inputs are richer (free-form geometry);
- *the solver itself*: the surrogate must be both accurate enough and faster at equal accuracy, counting the 2,000 runs spent on training, which are a fixed cost that only pays off over many queries.

**(b) 12 m/s is outside the family.** The surrogate was trained on 1 to 5 m/s; 12 m/s is 2.4 times the top of the range, and the flow may be in a different regime there (a transition between laminar and turbulent behaviour, say). A network is an interpolator: outside the training range its output is smooth and confident and has no reason to be right, and its error is unknown. The correct response is to run the solver, or to extend the training runs to cover 12 m/s and check on held-out ones, and to state the surrogate's validity range (1 to 5 m/s, 10 to 30 mm) wherever it is used. "A surrogate's validity is the data it saw" ([Section 10](#s10)).

**(c) Self-supervised pretraining, then a probe.** There are 50,000 unlabelled images and only 20 labels, so the labels cannot train a network, but the images can. Pretrain an encoder with a contrastive or masked objective ([Section 11](#s11)) on the 50,000, then fit a linear probe on the 20 labelled examples. The baseline is the same probe, with the same 20 labels, on features that need no pretraining on these images: engineered intensity and texture statistics, or an off-the-shelf network pretrained on generic images ([Module 03](module_03_EN.html)). With 20 examples, split by seam (not by image, if one seam gives several), the confidence intervals are wide, so repeat the draw of 20 and report the spread. Choose augmentations that preserve the temperature pattern, which is the evidence for a defect ([Exercise 14](#e14)). If there were no labels at all, an autoencoder trained on good welds, scoring by reconstruction error, would be the anomaly detector of [Section 2](#s2).

**(d) The exact algorithm.** A system architecture model is a graph with 30 nodes. A single point of failure is a component whose failure alone fails the system, a minimal cut set of size one, and finding all of them is a graph traversal that takes microseconds and is exact. A graph network has no role here: it would approximate, imperfectly, a quantity that is computed exactly in less time than it takes to load the network. A direction-aware GNN pays off only when the property *cannot* be computed exactly (it depends on something learned from data, such as the likelihood of failure inferred from field reports) or the graphs are so many and so large that exact analysis is too slow. The first baseline is the algorithm.

The pattern behind all four: before choosing a family, write down the best method that needs no learning, and make the learned model earn its place against it.
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
For each case, say whether the augmentation is safe for the downstream task, and why.

(a) Random 90-degree rotations when pretraining on top-down images of composite plies whose fibre direction (0, +45, -45 or 90 degrees) is to be classified.

(b) Random resized crops (crop 30 to 100% of the area, then rescale to the full image size) when pretraining on metallographic micrographs for grain-size estimation.

(c) Random circular time shifts when pretraining on engine-vibration windows that each start at top dead centre, where faults are told apart by the crank angle at which an impact occurs.

(d) Added Gaussian noise of standard deviation 0.1, on signals of amplitude about 1, for the same engine windows.
:::

::: solution
In contrastive learning the augmentations define what the encoder must ignore ([Section 11](#s11)): two augmented views of one input are pulled together, so any property the augmentation changes is a property the representation is trained to discard. An augmentation is safe if and only if it changes nothing the downstream task needs. The test is therefore always "does the augmentation change the evidence?", answered with the task in mind.

**(a) Unsafe.** The label is the fibre direction. A quarter-turn maps 0 degrees to 90 and +45 to -45: it changes the class. The encoder would be trained to give the same representation to different classes, which is the 6-and-9 failure of [Section 11](#s11). A half-turn (180 degrees) is safe, because a fibre direction is an axis, not an arrow, and a rotation by 180 degrees leaves 0, +45, -45 and 90 unchanged. Flips need the same check: a horizontal flip swaps +45 and -45.

**(b) Unsafe.** Grain size is read from the size of the grains in the image. A crop of 30% of the area rescaled to the full size magnifies the grains by up to $1/\sqrt{0.3} = 1.8$ times, so two views of one micrograph show different apparent grain sizes, and the encoder is trained to treat different grain sizes alike. Crop without rescaling (a fixed-size window cut from a larger micrograph), so the scale of the grains is unchanged.

**(c) Unsafe here, although it was the essential augmentation in [Lab 5](#lab5).** In Lab 5 the windows started at arbitrary times, so where in the window a pattern appears carries no information, and a circular shift removes only an irrelevant nuisance; without it the encoder can memorise absolute positions. These engine windows are aligned to the cycle: each starts at top dead centre, and the crank angle at which an impact occurs is the evidence that distinguishes the faults. A circular shift moves the impact to a different angle and so destroys the one cue the task depends on. The same augmentation is a nuisance remover in one setting and an evidence destroyer in the other. **Whether an augmentation is safe depends on the evidence the task needs, not on the augmentation.**

**(d) Safe in moderation.** Sensor noise is not evidence of a fault. Noise of standard deviation 0.1 on signals of amplitude about 1 (a signal-to-noise ratio of about 10, or 20 dB in amplitude) leaves impacts of comparable size to the signal visible, so the views stay recognisably the same window, and the encoder learns robustness to a nuisance the deployed sensor produces anyway. It is not unconditionally safe: noise much larger than the smallest impact of interest buries the very faults being detected, so tune the level against the smallest event you must still find and check the per-class accuracy of the probe, not only the average.

The common check for all four: take a labelled example, apply the augmentation, and ask whether a careful human labelling the result would still give the original label.
:::

::: exercise id=e15 level=1 kind=conceptual minutes=5
A top-1 mixture-of-experts layer with 8 experts is trained without a load-balancing loss. After 2,000 steps, 71% of tokens go to expert 3 and two experts receive none. Explain the feedback loop that produced this, compute the Switch-style balancing term $E\sum_e f_e P_e$ if the mean router probabilities equal the token fractions $f = (0.05, 0.08, 0.71, 0.06, 0.05, 0.05, 0, 0)$, and say what the term's gradient does.
:::

::: solution
**The feedback loop (routing collapse).** An expert that receives more tokens receives more gradient and is therefore trained on more data, so it improves faster. A better expert produces lower loss for the tokens sent to it, and the router, trained to send each token where the loss is lowest, learns to give it a higher score, which sends it still more tokens. Experts that start slightly behind receive fewer tokens, improve more slowly, and are chosen even less. Nothing in the language-modelling loss counters this: from the loss's point of view one good expert is as good as eight, and the layer degenerates into a dense layer one-eighth the size, with seven idle experts' parameters wasted. The loop is positive feedback on a small initial imbalance, and the earlier it starts the harder it is to reverse.

**The balancing term for these numbers.** With $P = f$ the term is $E\sum_e f_e^2$:

$$
\sum_e f_e^2 = 0.05^2 + 0.08^2 + 0.71^2 + 0.06^2 + 0.05^2 + 0.05^2 + 0 + 0 = 0.0025 + 0.0064 + 0.5041 + 0.0036 + 0.0025 + 0.0025 = 0.5216.
$$

(The fractions sum to $1.00$, as they should.) Multiplying by $E = 8$ gives $8 \times 0.5216 = 4.17$. The minimum is $1.0$, at uniform routing $f_e = P_e = 1/E$, where the term is $E\cdot E\cdot(1/E)^2 = 1$ (the Cauchy–Schwarz argument of [Section 12](#s12)). A value of 4.17 means the load is more than four times as concentrated as it could be; with all tokens on one expert it would reach 8. The training loss adds $\lambda_{\text{bal}}$ times this term, where Switch used $\lambda_{\text{bal}} = 0.01$.

**What its gradient does.** The fraction $f_e$ comes from a hard top-1 choice, a count, and has no gradient. The router probability $P_e$, the mean of the softmax over the batch's tokens, does. So $\partial\mathcal{L}_{\text{bal}}/\partial P_e = \lambda_{\text{bal}}\,E\,f_e$: each expert's probability is pushed down in proportion to the fraction of tokens it already receives. For expert 3 that is $8 \times 0.71 = 5.68$ (times $\lambda_{\text{bal}}$); for expert 1 it is $8 \times 0.05 = 0.4$.

To see what happens to the router's logits $\ell_j$, apply the softmax Jacobian $\partial p_e/\partial\ell_j = p_e(\delta_{ej} - p_j)$. In the simplification that the router gives every token the same probabilities $p = P$,

$$
\frac{\partial}{\partial\ell_j}\,E\sum_e f_e p_e = E\,p_j\Big(f_j - \sum_e f_e p_e\Big) = E\,f_j\,(f_j - 0.5216)\quad\text{when } p = f.
$$

The bracket compares expert $j$'s load with the load-weighted average $\sum_e f_e p_e = 0.5216$. For expert 3, $8 \times 0.71 \times (0.71 - 0.5216) = +1.07$; gradient descent subtracts it, so expert 3's logit falls. For every expert whose load is below the average the gradient is negative, for example $8 \times 0.05 \times (0.05 - 0.5216) = -0.19$ for experts 1, 5 and 6, so their logits rise. (For the two starved experts $p_j = f_j = 0$ in this idealisation, so the gradient at that exact point is zero; in a real softmax their probabilities are small and positive and they are lifted too, by the normalisation: pushing expert 3's logit down moves its probability mass to all the others.)

The gradient therefore acts like a spring on the load: it pushes tokens from the overloaded expert towards the underused ones, and it vanishes when the load is uniform. It is a *soft* correction, which is why $\lambda_{\text{bal}}$ is small: too large and the router is forced to balance at the cost of sending tokens to experts that suit them less. DeepSeek-V3 avoids this trade-off with an auxiliary-loss-free scheme that adjusts a per-expert bias in the routing scores instead ([Section 12](#s12)).
:::
