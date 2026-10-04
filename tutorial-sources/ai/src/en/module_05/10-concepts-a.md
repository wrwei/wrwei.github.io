## A map of the families, and the tools they share {#s1}

Modules 01 to 04 mapped an input to a label, a number or the next element of a sequence. The
families here compress and generate data, read graphs, obey differential equations, learn
without labels, or add parameters without adding compute. Each is defined by what it optimises,
and most of what is hard about it follows from that objective. This section is the map, plus the
mathematics the rest of the module leans on.

### What each family optimises

| Family | Problem it solves | What it optimises | What it outputs |
|---|---|---|---|
| Autoencoder | compress, denoise, detect anomalies | squared error of reconstructing $\mathbf{x}$ through a bottleneck | a code $\mathbf{z}$, a reconstruction |
| Variational autoencoder (VAE) | a generative model with a smooth latent space | the ELBO, a lower bound on $\log p(\mathbf{x})$ | a distribution over codes; samples |
| Generative adversarial network (GAN) | fast sampling of realistic data | a minimax game between a generator and a discriminator | samples, one forward pass each |
| Diffusion model | high-quality, controllable generation | squared error of predicting the noise added at a random noise level | samples, after many denoising steps |
| Graph neural network (GNN) | data on a graph or mesh | a supervised loss on node or graph labels, via message passing | a vector per node or graph |
| Physics-informed network (PINN) | a known differential equation with sparse data | the equation's residual plus data and boundary terms | a function $u_\theta(\mathbf{x}, t)$ |
| Contrastive learning | representations without labels | InfoNCE: pick the positive among $N$ candidates | an embedding per input |
| Mixture of experts (MoE) | capacity without proportional compute | any loss: an architecture routing each input to $k$ of $E$ experts | what the host network outputs |

A mixture of experts changes how a network is built, not what it is trained for. Neural
operators ([Section 10](#s10)) sit beside PINNs but learn from solver output, not the equation.

::: figure id=fig-05-1
Map of the module in two rows. Top row, three generator pipelines: VAE ($\mathbf{x}$ → encoder →
$(\boldsymbol{\mu}, \boldsymbol{\sigma})$ → $\mathbf{z}$ → decoder → $\hat{\mathbf{x}}$, labelled
"maximise ELBO"); GAN ($\mathbf{z}$ → $G$ → fake $\mathbf{x}$ → $D$ ← real $\mathbf{x}$,
labelled "minimax"); diffusion ($\mathbf{x}_0$ → add noise → … → $\mathbf{x}_T \sim
\mathcal{N}(\mathbf{0}, \mathbf{I})$, with dashed arrows back labelled "learned denoiser
$\boldsymbol{\epsilon}_\theta$, tens to hundreds of steps"). Bottom row, four boxes: GNN (a small
graph, arrows converging on one node, "message passing"), PINN (network
$u_\theta(\mathbf{x}, t)$ → box "$\mathcal{N}[u] = 0$", "residual loss"), contrastive (one input →
two augmented views → encoder → two points pulled together on a circle, others pushed apart,
"InfoNCE"), MoE (input → router → 2 of 8 experts highlighted, "top-$k$"). Each box states its
objective in one line.
:::

### Three ways to build a generator

The top row of Figure 5.1 shows three bargains. A **VAE** is an explicit latent-variable model
trained on a lower bound of the likelihood. A **GAN** is an implicit model: a generator turns
noise into samples and learns only through a second network that tries to tell them from data. A
**diffusion model** learns to undo a gradual noising of the data, one small step at a time.

| | VAE | GAN | Diffusion |
|---|---|---|---|
| Network evaluations per sample | 1 | 1 | tens to hundreds |
| Training | stable (one loss, gradient descent) | unstable (two networks must stay balanced) | stable (a regression) |
| Mode coverage | good, but samples blur | often poor (mode collapse) | good |
| Likelihood available | a bound | none | a bound |

Sections 3 to 6 explain each row.

### KL divergence and Jensen's inequality

The **Kullback–Leibler divergence** from a distribution $q$ to a distribution $p$ is

$$
D_{\KL}(q \,\|\, p) = \E_{q}\!\left[\log \frac{q(\mathbf{z})}{p(\mathbf{z})}\right].
$$

It is never negative. **Jensen's inequality** says that for a concave function such as $\log$,
$\E[\log Y] \le \log \E[Y]$. Apply it with $Y = p/q$ under $q$:

$$
-D_{\KL}(q \,\|\, p) = \E_q\!\left[\log \frac{p}{q}\right] \le \log \E_q\!\left[\frac{p}{q}\right]
= \log \int q(\mathbf{z}) \frac{p(\mathbf{z})}{q(\mathbf{z})}\, d\mathbf{z} = \log 1 = 0.
$$

Equality needs $p/q$ constant where $q > 0$, which for normalised densities means $q = p$. The
divergence is not symmetric, so it is not a distance.

For two univariate Gaussians the difference of the log-densities is

$$
\log q(z) - \log p(z) = \log\frac{s_2}{s_1} - \frac{(z - \mu_1)^2}{2 s_1^2} + \frac{(z - \mu_2)^2}{2 s_2^2},
$$

and under $q = \mathcal{N}(\mu_1, s_1^2)$, $\E_q[(z - \mu_1)^2] = s_1^2$ and
$\E_q[(z - \mu_2)^2] = s_1^2 + (\mu_1 - \mu_2)^2$. So

$$
D_{\KL}\big(\mathcal{N}(\mu_1, s_1^2) \,\|\, \mathcal{N}(\mu_2, s_2^2)\big)
= \log\frac{s_2}{s_1} + \frac{s_1^2 + (\mu_1 - \mu_2)^2}{2 s_2^2} - \frac{1}{2}. \tag{5.1}
$$

Against the standard normal ($\mu_2 = 0$, $s_2 = 1$) it becomes
$\tfrac12(\mu^2 + s^2 - \log s^2 - 1)$, the term every VAE in [Section 3](#s3) computes.

::: worked title="Forward and reverse KL between two Gaussians"
Take $q = \mathcal{N}(0, 1)$ and $p = \mathcal{N}(1, 0.5)$, where 0.5 is the variance, so
$s_p = \sqrt{0.5} = 0.7071$.

$D_{\KL}(q \,\|\, p)$, with $s_1 = 1$, $s_2 = 0.7071$ in (5.1):

$$
\log 0.7071 + \frac{1 + (0 - 1)^2}{2 \times 0.5} - \frac12 = -0.3466 + 2 - 0.5 = 1.1534 \text{ nats.}
$$

$D_{\KL}(p \,\|\, q)$, with $s_1 = 0.7071$, $s_2 = 1$:

$$
\log\frac{1}{0.7071} + \frac{0.5 + 1}{2 \times 1} - \frac12 = 0.3466 + 0.75 - 0.5 = 0.5966 \text{ nats.}
$$

Different numbers: the divergence is not symmetric. The first is larger because the wide $q$
puts mass where the narrow $p$ has little. Both numbers return in [Section 3](#s3) as the ELBO gap and the KL term of one exact example.
:::

### Gaussian algebra

[Section 5](#s5) uses three facts. Independent $a \sim \mathcal{N}(0, s_a^2)$ and
$b \sim \mathcal{N}(0, s_b^2)$ give $a + b \sim \mathcal{N}(0, s_a^2 + s_b^2)$: variances add.
For $\epsilon \sim \mathcal{N}(0, 1)$, $c\,\epsilon \sim \mathcal{N}(0, c^2)$. And any Gaussian
sample can be written $\mu + \sigma \epsilon$.

::: worked title="Two noising steps make one"
Shrink the data point $x_0 = 2$ by $\sqrt{0.8}$ and add noise of variance 0.2:

$$
x_1 = \sqrt{0.8}\, x_0 + \sqrt{0.2}\, \epsilon_1 = 1.7889 + 0.4472\,\epsilon_1 \sim \mathcal{N}(1.7889,\ 0.2).
$$

With the draw $\epsilon_1 = 0.5$: $x_1 = 1.7889 + 0.2236 = 2.0125$. Apply the same step again,
$x_2 = \sqrt{0.8}\, x_1 + \sqrt{0.2}\, \epsilon_2$. Given $x_0$, the mean of $x_2$ is
$0.8 \times 2 = 1.6$ and its variance is $0.8 \times 0.2 + 0.2 = 0.36$, because the first step's
noise is shrunk with the signal and the variances add. So $x_2 \sim \mathcal{N}(1.6,\ 0.36)$,
which is $\sqrt{0.64}\, x_0 + \sqrt{0.36}\, \epsilon$ with a single draw $\epsilon$: two steps
are one step with the signal factors multiplied. The forward process of [Section 5](#s5) is this
step repeated, and its closed form (5.4) is this composition for any number of steps.
:::

### Monte Carlo, and the gradient it cannot take

An expectation is estimated by a sample average,
$\E_p[f(\mathbf{x})] \approx \frac{1}{S}\sum_{s=1}^{S} f(\mathbf{x}_s)$ with
$\mathbf{x}_s \sim p$, unbiased, with standard error falling as $1/\sqrt{S}$. Trouble starts
when the distribution depends on the parameters being trained:

$$
\nabla_\phi \E_{q_\phi}[f(\mathbf{z})] = \nabla_\phi \int q_\phi(\mathbf{z}) f(\mathbf{z})\, d\mathbf{z}
= \int f(\mathbf{z})\, \nabla_\phi q_\phi(\mathbf{z})\, d\mathbf{z}
\ne \E_{q_\phi}[\nabla_\phi f(\mathbf{z})].
$$

The parameters sit in the density, not in $f$. With $f(z) = z^2$ and $q = \mathcal{N}(\mu, 1)$,
the expectation is $\mu^2 + 1$, with gradient $2\mu$; differentiating a sampled $z^2$ with
respect to $\mu$ gives 0, because a sample carries no record of where it came from. [Section 3](#s3) solves this.

Three earlier tools are used without re-derivation: maximum likelihood and its losses
([Module 01, Section 5](module_01_EN.html#s5)), reverse-mode automatic differentiation
([Module 02, Section 4](module_02_EN.html#s4)), and principal component analysis
([Module 01, Section 11](module_01_EN.html#s11)).

::: check
Why is $D_{\KL}(q \,\|\, p)$ never negative?
:::

::: answer
By Jensen's inequality for the concave $\log$:
$\E_q[\log(p/q)] \le \log \E_q[p/q] = \log \int p\, d\mathbf{z} = \log 1 = 0$, so
$-D_{\KL} \le 0$, with equality only when $q = p$.
:::

::: check
Which generator family needs many network evaluations per sample, and why?
:::

::: answer
Diffusion. It generates by reversing the noising one step at a time, and each step is one
evaluation of the denoising network, so tens to hundreds of steps cost tens to hundreds of
evaluations. A VAE decoder and a GAN generator produce a sample in one pass.
:::

## Autoencoders: bottlenecks, denoising and anomaly detection {#s2}

An **autoencoder** is two networks trained as one. An encoder maps an input to a code,
$\mathbf{z} = f_\phi(\mathbf{x}) \in \R^{d_z}$, and a decoder maps the code back,
$\hat{\mathbf{x}} = g_\theta(\mathbf{z}) \in \R^{d_x}$. Training minimises the reconstruction
error over the data:

$$
\mathcal{L}(\phi, \theta) = \frac{1}{N}\sum_{i=1}^{N} \big\|\mathbf{x}_i - g_\theta(f_\phi(\mathbf{x}_i))\big\|^2 .
$$

No labels are needed; the input is its own target. The code lives in the **latent space**, and
what makes it worth having is a constraint. An **undercomplete** autoencoder has $d_z < d_x$,
a **bottleneck**: the code cannot hold everything, so training must decide what to keep, and it
keeps what most reduces the error over the whole dataset (Figure 5.2). An overcomplete autoencoder
($d_z \ge d_x$) with no other constraint can learn the identity, reconstruct perfectly and learn
nothing about which inputs are likely.

::: figure id=fig-05-2
Autoencoder architecture: an 8×8 digit (64 pixels) → encoder (64 → 128 → $d_z$) → bottleneck
$\mathbf{z}$ drawn as two neurons ($d_z = 2$) → decoder ($d_z$ → 128 → 64) → reconstructed digit.
A loss arrow compares the input with the output.
:::

### The linear autoencoder is PCA

Take centred data, a linear encoder $\mathbf{z} = \mathbf{W}_e\mathbf{x}$ with
$\mathbf{W}_e \in \R^{d_z \times d_x}$, a linear decoder
$\hat{\mathbf{x}} = \mathbf{W}_d\mathbf{z}$, and squared error. The reconstruction is
$\mathbf{M}\mathbf{x}$ with $\mathbf{M} = \mathbf{W}_d\mathbf{W}_e$, a matrix of rank at most
$d_z$, so every reconstruction lies in a subspace of dimension $d_z$. For a fixed subspace the
closest point to $\mathbf{x}$ is its orthogonal projection, so the problem is which subspace.
Write the projection onto an orthonormal basis $\mathbf{U} \in \R^{d_x \times d_z}$ as
$\mathbf{U}\mathbf{U}^\top$ and the covariance as
$\mathbf{C} = \frac{1}{N}\sum_i \mathbf{x}_i\mathbf{x}_i^\top$. The mean error is

$$
\frac{1}{N}\sum_i \|\mathbf{x}_i - \mathbf{U}\mathbf{U}^\top\mathbf{x}_i\|^2
= \operatorname{tr}(\mathbf{C}) - \operatorname{tr}(\mathbf{U}^\top\mathbf{C}\mathbf{U}),
$$

since the projection and the residual are orthogonal. Minimising it means maximising the
variance kept, $\operatorname{tr}(\mathbf{U}^\top\mathbf{C}\mathbf{U})$, which the top $d_z$
eigenvectors of $\mathbf{C}$ do (the Eckart–Young theorem). The minimum error is
$\operatorname{tr}(\mathbf{C})$ minus the top $d_z$ eigenvalues: the sum of the discarded
eigenvalues. Baldi and Hornik (1989) showed that gradient descent on the linear autoencoder has
no other local minima, so it finds this subspace.

It finds the subspace, not the principal components themselves. For any invertible
$d_z \times d_z$ matrix $\mathbf{A}$, the pair $(\mathbf{A}\mathbf{W}_e,\ \mathbf{W}_d\mathbf{A}^{-1})$
gives the same product $\mathbf{M}$ and the same error, so the code coordinates are any mixture of
the components.

::: worked title="A linear autoencoder by hand"
Four centred points: $(2, 2)$, $(-2, -2)$, $(1, -1)$, $(-1, 1)$. The covariance is

$$
\mathbf{C} = \frac14\left(\begin{bmatrix}4&4\\4&4\end{bmatrix}\times 2 + \begin{bmatrix}1&-1\\-1&1\end{bmatrix}\times 2\right)
= \begin{bmatrix}2.5&1.5\\1.5&2.5\end{bmatrix},
$$

with eigenvalues 4 and 1 and eigenvectors $(1, 1)/\sqrt2$ and $(1, -1)/\sqrt2$. The best
one-dimensional code is the projection onto $(1, 1)/\sqrt2$. The points $(2, 2)$ and $(-2, -2)$
lie on that axis and reconstruct exactly. The points $(1, -1)$ and $(-1, 1)$ are orthogonal to
it, project to 0 and reconstruct as $(0, 0)$, with squared error $1 + 1 = 2$ each. The mean
squared error is $(0 + 0 + 2 + 2)/4 = 1.0$: the discarded eigenvalue.
:::

A nonlinear encoder and decoder can follow a curved manifold that no flat subspace fits. In
[Lab 1](#lab1), on 8×8 digits scaled to $[0, 1]$, an autoencoder with one hidden layer of 128 units on each side
reaches a test error of 0.037 per pixel at $d_z = 2$ against PCA's 0.053, and 0.011 against
0.025 at $d_z = 8$. PCA is still the baseline to fit first: it is exact, instant and, when the
data are close to a subspace, nearly as good.

### Denoising

A **denoising autoencoder** (Vincent et al. 2008) is fed a corrupted input $\tilde{\mathbf{x}}$,
with Gaussian noise added or pixels masked, and is trained to output the clean $\mathbf{x}$. Even
an overcomplete network cannot copy its input to solve this; it has to learn where the data lie
and move points back toward them.

What it learns has a precise form. Under squared error the best denoiser is the conditional
mean, $r(\tilde{\mathbf{x}}) = \E[\mathbf{x} \mid \tilde{\mathbf{x}}]$. With
$\tilde{\mathbf{x}} = \mathbf{x} + \sigma\boldsymbol{\epsilon}$, the noisy density is
$p_\sigma(\tilde{\mathbf{x}}) = \int p(\mathbf{x})\,\mathcal{N}(\tilde{\mathbf{x}}; \mathbf{x}, \sigma^2\mathbf{I})\, d\mathbf{x}$.
Differentiate under the integral; the Gaussian's gradient is the Gaussian times
$(\mathbf{x} - \tilde{\mathbf{x}})/\sigma^2$:

$$
\nabla \log p_\sigma(\tilde{\mathbf{x}})
= \frac{\int p(\mathbf{x})\,\mathcal{N}(\tilde{\mathbf{x}}; \mathbf{x}, \sigma^2\mathbf{I})\,(\mathbf{x} - \tilde{\mathbf{x}})\, d\mathbf{x}}{\sigma^2\, p_\sigma(\tilde{\mathbf{x}})}
= \frac{\E[\mathbf{x} \mid \tilde{\mathbf{x}}] - \tilde{\mathbf{x}}}{\sigma^2}.
$$

So $r(\tilde{\mathbf{x}}) - \tilde{\mathbf{x}} = \sigma^2 \nabla \log p_\sigma(\tilde{\mathbf{x}})$,
which for small noise is approximately $\sigma^2 \nabla \log p(\tilde{\mathbf{x}})$ (Vincent 2011).
A denoiser's correction points uphill in log-density. That gradient, the **score**, is what a
diffusion model learns in [Section 5](#s5).

### Anomaly detection

**Anomaly detection** by reconstruction trains the autoencoder on normal operation only, and
scores a new input by its reconstruction error. An input unlike anything in training, such as
a sensor channel behaving in a new way or a part outside the design space, should reconstruct
badly. The threshold is the decision that matters. Set it at a high percentile, say the 95th, of
the errors on held-out normal data, and the false-alarm rate is about 5% by construction. The
detection rate cannot be set; it can only be measured, on anomalies you already know about, and
it depends on what the anomalies look like.

::: worked title="An anomaly threshold on digits"
[Lab 1](#lab1) trains the $d_z = 8$ autoencoder on digits 0–8 only, holding out 20% of them for
validation. The 95th percentile of validation errors is 0.0261 per pixel. On the test set, 4.0%
of normal digits exceed it (the false-alarm rate, close to the intended 5%), and 58.3% of the 9s
do (the detection rate). The ROC AUC, which averages over all thresholds, is 0.952.

The classical baseline from process monitoring is PCA with 8 components, scoring each input by
its squared prediction error, the **Q statistic** $\|\mathbf{x} - \mathbf{U}\mathbf{U}^\top\mathbf{x}\|^2$.
It reaches an AUC of 0.791 and, at its own 95th-percentile threshold, detects 22.2% of the 9s
at a 7.7% false-alarm rate.

Both numbers matter. The network clearly beats the baseline, which justifies it; yet an AUC of
0.95 hides that 42% of the anomalies pass the operating threshold, because many 9s look like
digits the model reconstructs well.
:::

The same recipe works with forecasting residuals instead of reconstructions
([Module 04, Section 9](module_04_EN.html#s9)). It fails in three ways. Anomalies that resemble normal data
reconstruct well and pass, as many of the 9s do. A change of operating
condition, a new load case or a sensor replaced, shifts normal errors above the threshold and
floods the operator with false alarms. And anomalies hidden in the "normal" training data are
learned as normal: the detector is only as clean as the data it was told were healthy.

::: check
A linear autoencoder with $d_z = 3$ is trained on centred data with squared error. What does it
recover?
:::

::: answer
The span of the top three principal components: its reconstructions are the orthogonal projection
onto that subspace. Its three code coordinates are some invertible mixture of the components, not
necessarily the components themselves.
:::

::: check
How is the anomaly threshold chosen, and which error rate does that choice fix?
:::

::: answer
At a high percentile of the reconstruction errors on held-out normal data. That fixes the
false-alarm rate, at about 100 minus the percentile, in per cent. The detection rate is not set
by the choice; it must be measured on known anomalies.
:::

## Variational autoencoders: the ELBO and the reparameterisation trick {#s3}

An autoencoder's latent space has holes. Decode a point between two clusters of codes and the
output is no digit in particular ([Lab 1](#lab1) shows this), so the decoder cannot be used to
generate: nothing says where the codes lie. The **variational autoencoder (VAE)** (Kingma and
Welling 2014; found independently by Rezende, Mohamed and Wierstra 2014) makes the code a random
variable with a prior and trains encoder and decoder as one probabilistic model.

### The model, and why its likelihood is out of reach

The generative story has two steps: draw a code $\mathbf{z} \sim p(\mathbf{z}) = \mathcal{N}(\mathbf{0}, \mathbf{I})$,
then draw $\mathbf{x} \sim p_\theta(\mathbf{x} \mid \mathbf{z})$, a simple distribution whose
parameters the decoder network computes from $\mathbf{z}$. The likelihood of a data point is

$$
p_\theta(\mathbf{x}) = \int p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})\, d\mathbf{z}.
$$

Maximum likelihood ([Module 01, Section 5](module_01_EN.html#s5)) needs $\log p_\theta(\mathbf{x}_i)$ for every
training point, and this integral has a neural network inside it and $d_z$ dimensions to cover.
Averaging $p_\theta(\mathbf{x} \mid \mathbf{z})$ over codes drawn from the prior is unbiased but
hopeless: almost every code decodes to something unrelated to $\mathbf{x}$. The codes that matter
are those of the posterior $p_\theta(\mathbf{z} \mid \mathbf{x}) = p_\theta(\mathbf{x} \mid \mathbf{z})p(\mathbf{z}) / p_\theta(\mathbf{x})$,
which needs $p_\theta(\mathbf{x})$, the quantity we could not compute.

### The evidence lower bound, two ways

Bring in an approximate posterior $q_\phi(\mathbf{z} \mid \mathbf{x})$, any density we can sample
and evaluate, and use it as an importance distribution. Multiply and divide by it inside the
integral, then apply Jensen's inequality ([Section 1](#s1)):

$$
\begin{aligned}
\log p_\theta(\mathbf{x})
&= \log \int q_\phi(\mathbf{z} \mid \mathbf{x})\, \frac{p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}\, d\mathbf{z}
= \log \E_{q_\phi}\!\left[\frac{p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}\right] \\
&\ge \E_{q_\phi}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z}) + \log p(\mathbf{z}) - \log q_\phi(\mathbf{z} \mid \mathbf{x})\right] \\
&= \underbrace{\E_{q_\phi}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z})\right]}_{\text{reconstruction}}
 - \underbrace{D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, p(\mathbf{z})\big)}_{\text{keeps codes near the prior}} .
\end{aligned} \tag{5.2}
$$

This is the **evidence lower bound (ELBO)**. The first term rewards codes from which the decoder
reproduces $\mathbf{x}$; the second charges each code, in nats, for how far its distribution
strays from the prior.

The inequality hides what was given up; an identity shows it. By Bayes' rule, for every
$\mathbf{z}$, $\log p_\theta(\mathbf{x}) = \log p_\theta(\mathbf{x} \mid \mathbf{z}) + \log p(\mathbf{z}) - \log p_\theta(\mathbf{z} \mid \mathbf{x})$.
The left side does not depend on $\mathbf{z}$, so it equals its own expectation under $q_\phi$.
Add and subtract $\log q_\phi$ inside:

$$
\log p_\theta(\mathbf{x})
= \E_{q_\phi}\!\left[\log \frac{p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}\right]
+ \E_{q_\phi}\!\left[\log \frac{q_\phi(\mathbf{z} \mid \mathbf{x})}{p_\theta(\mathbf{z} \mid \mathbf{x})}\right]
= \text{ELBO} + D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, p_\theta(\mathbf{z} \mid \mathbf{x})\big).
\tag{5.3}
$$

The gap is exactly the KL from the approximate posterior to the true one. Since
$\log p_\theta(\mathbf{x})$ does not depend on $\phi$, raising the ELBO over $\phi$ can only
shrink the gap: the encoder learns to approximate the posterior. Raising it over $\theta$ raises
the likelihood, or the bound's tightness, or both. Training does the two together.

::: worked title="A model in which everything is exact"
Take $p(z) = \mathcal{N}(0, 1)$ and $p(x \mid z) = \mathcal{N}(z, 1)$. Then $x$ is the sum of two
independent unit-variance normals, so $p(x) = \mathcal{N}(0, 2)$. The posterior follows from
$\log p(z \mid x) = -\tfrac12 z^2 - \tfrac12(x - z)^2 + \text{const} = -(z - x/2)^2 + \text{const}$,
so $p(z \mid x) = \mathcal{N}(x/2,\ 1/2)$. Take $x = 2$:

$$
\log p(x) = -\tfrac12 \log(2\pi \times 2) - \frac{2^2}{2 \times 2} = -\tfrac12\log(4\pi) - 1 = -1.2655 - 1 = -2.2655.
$$

For $q = \mathcal{N}(m, s^2)$ the reconstruction term is
$\E_q[\log p(x \mid z)] = -\tfrac12\log(2\pi) - \tfrac12\big[(x - m)^2 + s^2\big]$, with
$\tfrac12\log(2\pi) = 0.9189$.

With $q = \mathcal{N}(1, 0.5)$, the true posterior: reconstruction
$-0.9189 - \tfrac12(1 + 0.5) = -1.6689$; KL to the prior $\tfrac12(1 + 0.5 - \log 0.5 - 1) = 0.5966$;
ELBO $= -1.6689 - 0.5966 = -2.2655 = \log p(x)$. The bound is tight.

With $q = \mathcal{N}(0, 1)$, a collapsed posterior equal to the prior: reconstruction
$-0.9189 - \tfrac12(4 + 1) = -3.4189$; KL 0; ELBO $= -3.4189$. The gap is
$-2.2655 - (-3.4189) = 1.1534 = D_{\KL}\big(\mathcal{N}(0, 1) \,\|\, \mathcal{N}(1, 0.5)\big)$,
the number computed in [Section 1](#s1), as (5.3) says it must be. Figure 5.5 draws both cases.
:::

::: figure id=fig-05-5
The exact example. Left: on a $z$ axis from −3 to 4, the prior $\mathcal{N}(0, 1)$ and the true
posterior $\mathcal{N}(1, 0.5)$ for $x = 2$. Right: $\log p(x) = \text{ELBO} + \text{gap}$, drawn for
two choices of $q$ against a dashed line at $\log p(x) = -2.27$: for $q$ equal to the posterior,
ELBO −2.27 and gap 0; for $q$ equal to the prior, ELBO −3.42 and a gap of 1.15 that brings it
back up to −2.27.
:::

### Amortised inference and the Gaussian encoder

Classical variational inference fits a separate $q$ for each data point by its own
optimisation. A VAE uses **amortised inference**: one encoder network outputs the parameters of
$q_\phi(\mathbf{z} \mid \mathbf{x}) = \mathcal{N}\big(\boldsymbol{\mu}_\phi(\mathbf{x}), \operatorname{diag}\boldsymbol{\sigma}^2_\phi(\mathbf{x})\big)$
for every $\mathbf{x}$, so a new input costs one forward pass. The price is that the encoder may
not output the best $q$ for every point, a second source of looseness on top of the Gaussian
shape. The encoder outputs $\log \boldsymbol{\sigma}^2$ rather than $\boldsymbol{\sigma}^2$ because
a network output is an unconstrained real number and the exponential makes it positive.

With a diagonal Gaussian $q$ and a standard normal prior, both log-densities are sums over
dimensions, so the KL is a sum of the univariate formula of [Section 1](#s1):

$$
D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, \mathcal{N}(\mathbf{0}, \mathbf{I})\big)
= \frac12 \sum_{j=1}^{d_z} \left(\mu_j^2 + \sigma_j^2 - \log \sigma_j^2 - 1\right).
$$

::: worked title="The KL term in two dimensions"
Let $\boldsymbol{\mu} = (1.0, -0.5)$ and $\boldsymbol{\sigma} = (0.5, 1.0)$.

Dimension 1: $\tfrac12(1 + 0.25 - \log 0.25 - 1) = \tfrac12(0.25 + 1.3863) = 0.8181$.

Dimension 2: $\tfrac12(0.25 + 1 - 0 - 1) = 0.125$.

Total: 0.9431 nats. The first dimension pays mainly for its narrow width ($-\log\sigma_1^2 = 1.386$),
not for its mean; the second pays only for its mean. Being sure about a code costs as much as
moving it.
:::

### Getting a gradient through the sample

The reconstruction term is an expectation under $q_\phi$, which depends on the encoder's
parameters: the problem left open in [Section 1](#s1). There are two answers.

The **score-function** (REINFORCE) estimator uses
$\nabla_\phi q_\phi = q_\phi \nabla_\phi \log q_\phi$:

$$
\nabla_\phi \E_{q_\phi}[f(\mathbf{z})] = \int f(\mathbf{z})\, q_\phi(\mathbf{z})\, \nabla_\phi \log q_\phi(\mathbf{z})\, d\mathbf{z}
= \E_{q_\phi}\!\left[f(\mathbf{z})\, \nabla_\phi \log q_\phi(\mathbf{z})\right].
$$

It is unbiased and works even for discrete $\mathbf{z}$, but its variance is high, because each
sample multiplies the size of $f$ by a random direction. For $f(z) = z^2$ and
$q = \mathcal{N}(\mu, 1)$ at $\mu = 1$, the per-sample estimate $z^2(z - 1)$ has mean 2, the true
gradient, and variance 30.

The **reparameterisation trick** writes the sample as a deterministic function of the parameters
and a noise input whose distribution does not depend on them:

$$
\mathbf{z} = \boldsymbol{\mu}_\phi(\mathbf{x}) + \boldsymbol{\sigma}_\phi(\mathbf{x}) \odot \boldsymbol{\epsilon},
\quad \boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}),
\qquad
\nabla_\phi \E_{\boldsymbol{\epsilon}}\big[f(\boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon})\big]
= \E_{\boldsymbol{\epsilon}}\big[\nabla_\phi f(\boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon})\big].
$$

The gradient moves inside because the expectation is now over $\boldsymbol{\epsilon}$, which
$\phi$ does not touch. Per dimension, $\partial z_j/\partial \mu_j = 1$ and
$\partial z_j/\partial \sigma_j = \epsilon_j$. In the same example the estimate is $2z$, with
mean 2 and variance 4, against the score function's 30. The trick needs
a continuous $\mathbf{z}$ and a differentiable $f$.

::: worked title="One reparameterised sample"
With $\boldsymbol{\mu} = (1.0, -0.5)$, $\boldsymbol{\sigma} = (0.5, 1.0)$ and the draw
$\boldsymbol{\epsilon} = (0.3, -1.2)$:

$$
\mathbf{z} = (1.0 + 0.5 \times 0.3,\ -0.5 + 1.0 \times (-1.2)) = (1.15,\ -1.70).
$$

The local derivatives are $\partial\mathbf{z}/\partial\boldsymbol{\mu} = (1, 1)$ and
$\partial\mathbf{z}/\partial\boldsymbol{\sigma} = \boldsymbol{\epsilon} = (0.3, -1.2)$. A gradient
arriving at $\mathbf{z}$ from the decoder reaches $\boldsymbol{\mu}$ and $\boldsymbol{\sigma}$
through an ordinary multiply and add; $\boldsymbol{\epsilon}$ is an input, like a data
value (Figure 5.4).
:::

::: figure id=fig-05-4
VAE computation graph: $\mathbf{x}$ → encoder → $\boldsymbol{\mu}$ and $\log\boldsymbol{\sigma}^2$;
$\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ drawn as an external input node;
$\mathbf{z} = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon}$ → decoder →
$\hat{\mathbf{x}}$ → reconstruction term; $\boldsymbol{\mu}$ and $\boldsymbol{\sigma}$ → KL term;
both summed into −ELBO. Dashed red gradient arrows flow back through $\mathbf{z}$ to
$\boldsymbol{\mu}$ and $\boldsymbol{\sigma}$ and, visibly, not into $\boldsymbol{\epsilon}$.
:::

### The decoder's likelihood sets the exchange rate

The reconstruction term is a log-likelihood, so the decoder must be given a noise model. For
intensities in $[0, 1]$ a **Bernoulli** decoder outputs one logit per pixel and
$-\log p_\theta(\mathbf{x} \mid \mathbf{z})$ is the binary cross-entropy summed over pixels. A
**Gaussian** decoder $\mathcal{N}(\hat{\mathbf{x}}, \sigma_x^2\mathbf{I})$ gives

$$
-\log p_\theta(\mathbf{x} \mid \mathbf{z}) = \frac{\|\mathbf{x} - \hat{\mathbf{x}}\|^2}{2\sigma_x^2} + \frac{d_x}{2}\log(2\pi\sigma_x^2).
$$

A summed squared error is this with $\sigma_x^2 = 1/2$ and the constant dropped. For pixels in
$[0, 1]$ that is a noise standard deviation of 0.71, a model that says the image is barely
determined by its code. The value of $\sigma_x$ is the exchange rate between reconstruction and
KL: a small $\sigma_x$ makes every unit of error expensive and pays for information in
$\mathbf{z}$; a large one makes the KL dominate. The **beta-VAE** (Higgins et al. 2017) writes
the trade-off explicitly, weighting the KL by $\beta$; $\beta = 1$ is the ELBO.

The class below is the compact VAE used in [Lab 1](#lab1), with its likelihood stated:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class VAE(nn.Module):
    def __init__(self, d_in, d_z=2, h=128):
        super().__init__()
        self.enc = nn.Sequential(nn.Linear(d_in, h), nn.GELU(), nn.Linear(h, 2 * d_z))
        self.dec = nn.Sequential(nn.Linear(d_z, h), nn.GELU(), nn.Linear(h, d_in))
        self.beta = 1.0  # KL weight; 1 gives the ELBO itself

    def forward(self, x):
        mu, logvar = self.enc(x).chunk(2, dim=-1)
        z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)  # reparameterisation
        xhat = self.dec(z)
        # Gaussian decoder with sigma_x^2 = 1/2: -log p(x|z) = ||x - xhat||^2 + const
        recon = F.mse_loss(xhat, x, reduction="sum") / len(x)
        # closed-form KL to N(0, I), summed over latent dimensions, averaged over batch
        kl = -0.5 * (1 + logvar - mu**2 - logvar.exp()).sum(-1).mean()
        return recon + self.beta * kl, xhat


def bernoulli_recon(logits, x):
    """-log p(x|z) for pixels in [0, 1]: decoder outputs are Bernoulli logits."""
    return F.binary_cross_entropy_with_logits(logits, x, reduction="sum") / len(x)
```

Swapping `recon` for `bernoulli_recon(xhat, x)` gives the Bernoulli decoder that Lab 1 uses for
its main results.

### Posterior collapse

**Posterior collapse** is the state in which $q_\phi(\mathbf{z} \mid \mathbf{x})$ is close to the
prior for every $\mathbf{x}$, in some dimensions or all of them, and the decoder learns to ignore
those dimensions. It has two causes. The KL weight may be too large for the reconstruction term:
$\beta > 1$, or a large implied $\sigma_x^2$. Or the decoder may model $\mathbf{x}$ well without
$\mathbf{z}$, as the autoregressive decoders of text VAEs do (Bowman et al. 2016).

Diagnose it with the KL per dimension, and with **active units** (Burda et al. 2016): dimension
$j$ is active if $\operatorname{Var}_{\mathbf{x}}\big(\E_{q}[z_j]\big) > 0.01$, that is, if its
mean code moves as the input changes. The usual fixes are KL warm-up (ramp $\beta$ from 0),
free bits (Kingma et al. 2016: no KL penalty below a floor of nats per dimension), $\beta \le 1$
and a better-scaled likelihood.

[Lab 1](#lab1) measures this on the test digits with $d_z = 8$ and a Bernoulli decoder:

| Setting | Total KL (nats) | Active units | Reconstruction (nats) |
|---|---|---|---|
| $\beta = 0.5$ | 6.5 | 8 | 18.9 |
| $\beta = 1$ | 3.6 | 6 | 21.0 |
| $\beta = 4$ | 0.00 | 0 | 27.2 |
| $\beta = 1$, summed squared error | 0.5 | 3 | not comparable (another likelihood) |

At $\beta = 4$ collapse is the optimum, not an accident of training. The $\beta = 1$ solution,
scored under the $\beta = 4$ objective, costs $21.0 + 4 \times 3.6 = 35.4$ nats; the collapsed one
costs $27.2 + 4 \times 0 = 27.2$. Using the code saves 6.2 nats of reconstruction but costs
14.4 in weighted KL. That is why warm-up does not rescue it: in Lab 1's first Try-this item a ramp to $\beta = 4$
still collapses (KL 0.01 nats, no active units), while a ramp to $\beta = 1$ raises the active
units from 6 to 8. Warm-up fixes collapse caused by the path of optimisation, not collapse built
into the objective. The summed-squared-error row is the $\sigma_x^2 = 1/2$ effect: reconstruction
is cheap to give up, and only three dimensions stay in use.

### Blurry samples, and what VAEs are for

VAE samples are blurred. A code is consistent with many slightly different images, and a decoder
trained on a Gaussian or Bernoulli likelihood outputs their average, which is smooth where they
disagree. VAEs are valued instead for their latent space: smooth, close to the prior everywhere,
so that every point decodes to something plausible and a straight line between two codes is a
sensible interpolation. In engineering terms it is a latent design space. And a VAE-style
autoencoder, with a light KL penalty and an adversarial term to keep it sharp, is the compressor
inside latent diffusion ([Section 6](#s6)).

::: check
What is the gap between $\log p_\theta(\mathbf{x})$ and the ELBO?
:::

::: answer
$D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, p_\theta(\mathbf{z} \mid \mathbf{x})\big)$, the
KL from the approximate posterior to the true one, by identity (5.3). It is zero only when $q$
equals the true posterior.
:::

::: check
Why can you not back-propagate through "draw $\mathbf{z}$ from $\mathcal{N}(\boldsymbol{\mu}, \boldsymbol{\sigma}^2)$"
directly, and what does the reparameterisation change?
:::

::: answer
Drawing a sample is not a differentiable function of $\boldsymbol{\mu}$ and
$\boldsymbol{\sigma}$: the number that comes out carries no derivative. Writing
$\mathbf{z} = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon}$ with
$\boldsymbol{\epsilon}$ as an external input makes $\mathbf{z}$ a differentiable function of both,
with $\partial z_j/\partial\mu_j = 1$ and $\partial z_j/\partial\sigma_j = \epsilon_j$.
:::

::: check
A VAE's KL term is 0.00 nats in every dimension. What do its samples look like, and why?
:::

::: answer
All alike, roughly an average image. Each $q_\phi(\mathbf{z} \mid \mathbf{x})$ equals the prior,
so $\mathbf{z}$ carries no information about $\mathbf{x}$ and the decoder has learned to ignore
it; whatever code is drawn, the output is the same.
:::

## Generative adversarial networks {#s4}

A **generative adversarial network (GAN)** (Goodfellow et al. 2014) gives up on likelihoods
altogether. A **generator** $G$ maps noise $\mathbf{z} \sim p(\mathbf{z})$ to a sample
$G(\mathbf{z})$; the samples have some distribution $p_g$, but no formula for its density exists,
so it cannot be trained by maximum likelihood. Instead a **discriminator** $D$ outputs the
probability that its input is real, $D(\mathbf{x}) = \sigma(a(\mathbf{x}))$ with $a$ a logit, and
the two play a game:

$$
\min_G \max_D\ V(G, D) = \E_{\mathbf{x} \sim p_{\text{data}}}[\log D(\mathbf{x})]
+ \E_{\mathbf{z} \sim p(\mathbf{z})}\big[\log\big(1 - D(G(\mathbf{z}))\big)\big].
$$

$D$ is a binary classifier with cross-entropy loss ([Module 01, Section 6](module_01_EN.html#s6)), labels 1 for
data and 0 for samples. $G$ is trained to make that classifier fail. Training alternates a step
on $D$ with a step on $G$ (Figure 5.7).

::: figure id=fig-05-7
GAN training loop: noise $\mathbf{z}$ → $G$ → fake samples; real samples from the data; both into
$D$ → probability "real". Two loss arrows: $D$'s (classify real versus fake) and $G$'s (fool
$D$), the latter annotated "non-saturating: maximise $\log D(G(\mathbf{z}))$".
:::

### What the game optimises

Write the second expectation over $\mathbf{x} = G(\mathbf{z})$, so that both terms are integrals
over $\mathbf{x}$:

$$
V(G, D) = \int \Big[p_{\text{data}}(\mathbf{x}) \log D(\mathbf{x}) + p_g(\mathbf{x}) \log\big(1 - D(\mathbf{x})\big)\Big]\, d\mathbf{x}.
$$

For a fixed $G$, $D$ can choose its value at each $\mathbf{x}$ separately, so maximise the
integrand pointwise. With $a = p_{\text{data}}(\mathbf{x})$ and $b = p_g(\mathbf{x})$,
$h(y) = a\log y + b\log(1 - y)$ has $h'(y) = a/y - b/(1 - y)$, which is zero at $y = a/(a + b)$, a
maximum since $h$ is concave. So

$$
D^*(\mathbf{x}) = \frac{p_{\text{data}}(\mathbf{x})}{p_{\text{data}}(\mathbf{x}) + p_g(\mathbf{x})}.
$$

The optimal discriminator estimates a density ratio: $D^*/(1 - D^*) = p_{\text{data}}/p_g$.
Substitute it and write $p_{\text{data}} + p_g = 2m$, with $m$ the mixture:

$$
\begin{aligned}
V(G, D^*) &= \E_{p_{\text{data}}}\!\left[\log \frac{p_{\text{data}}}{2m}\right] + \E_{p_g}\!\left[\log \frac{p_g}{2m}\right]
= D_{\KL}(p_{\text{data}} \,\|\, m) + D_{\KL}(p_g \,\|\, m) - \log 4 \\
&= -\log 4 + 2\,\mathrm{JSD}(p_{\text{data}} \,\|\, p_g),
\end{aligned}
$$

where the **Jensen–Shannon divergence** is
$\mathrm{JSD}(p \,\|\, q) = \tfrac12 D_{\KL}(p \,\|\, m) + \tfrac12 D_{\KL}(q \,\|\, m)$. It is
zero only when the two are equal, so against a perfect discriminator the generator minimises the
JSD, and the game's value $-\log 4$ is reached exactly when $p_g = p_{\text{data}}$.

::: worked title="The optimal discriminator on three points"
Let $p_{\text{data}} = (0.5, 0.5, 0)$ and $p_g = (0, 0.5, 0.5)$ on three points. Then
$D^* = \big(0.5/0.5,\ 0.5/1,\ 0/0.5\big) = (1, 0.5, 0)$, and

$$
V = \underbrace{0.5\log 1 + 0.5\log 0.5}_{\text{data}} + \underbrace{0.5\log 0.5 + 0.5\log 1}_{\text{generator}} = -0.6931.
$$

Check through the JSD: $m = (0.25, 0.5, 0.25)$;
$D_{\KL}(p_{\text{data}} \,\|\, m) = 0.5\log 2 + 0.5\log 1 = 0.3466$, and the same for $p_g$, so
$\mathrm{JSD} = 0.3466$ and $-1.3863 + 2 \times 0.3466 = -0.6931$.

With $p_g = p_{\text{data}}$, $D^* = 1/2$ everywhere and $V = -\log 4 = -1.3863$, the minimum. With
disjoint $p_{\text{data}} = (1, 0)$ and $p_g = (0, 1)$, $D^* = (1, 0)$, $V = 0$ and
$\mathrm{JSD} = \log 2 = 0.6931$, its maximum.
:::

### Saturation and the non-saturating loss

The analysis assumes $D$ is optimal, but training is a sequence of gradient steps, and the
original generator loss gives poor ones. Early on the samples are bad, $D$ rejects them easily
and $D(G(\mathbf{z})) = \sigma(a)$ is near 0. The generator minimises $\log(1 - \sigma(a))$, whose
derivative in the logit is $-\sigma(a)$: near 0, exactly when the generator most needs a signal.
The **non-saturating** loss has the generator minimise $-\log D(G(\mathbf{z}))$ instead, with
derivative $-(1 - \sigma(a))$, near $-1$ in the same place. Both losses are minimised by fooling
$D$, so the fixed point is the same; the dynamics differ.

::: worked title="Saturation in numbers"
At $D(G(\mathbf{z})) = 0.01$ the logit is $a = \log(0.01/0.99) = -4.60$.

$$
\frac{d}{da}\log\big(1 - \sigma(a)\big) = -\sigma(a) = -0.01,
\qquad
\frac{d}{da}\big[-\log\sigma(a)\big] = -\big(1 - \sigma(a)\big) = -0.99.
$$

The non-saturating loss gives the generator a gradient 99 times larger at the moment it most
needs one.
:::

### Mode collapse

Nothing in the loss rewards covering all of $p_{\text{data}}$. A generator that maps many
$\mathbf{z}$ to the few outputs the current $D$ accepts is doing well by the loss. Then $D$
adapts, learns to reject those outputs, and $G$ hops to other modes: the two chase each other
instead of converging. Metz et al. (2017) show this on a ring of eight Gaussians, where a
standard GAN visits one mode after another. This is **mode
collapse** (Figure 5.9). The loss cannot reveal
it, and neither can looking at single samples, which are individually convincing. Diagnose it
with diversity measures: the number of known modes covered, distances from held-out data points
to their nearest sample, and precision and recall of the samples against the data.

::: figure id=fig-05-9
Mode collapse, an illustrative schematic and not data (after Metz et al. 2017): a ring of eight
Gaussian modes. GAN samples at four training snapshots sit on one or two modes that change from
snapshot to snapshot. Beside them, diffusion samples cover all eight modes.
:::

### Disjoint supports and the Wasserstein distance

Real data, such as images, lie close to low-dimensional sets inside a huge space, and so do the
generator's samples early on. Two such sets typically do not overlap. Then $m$ is half of each on
its own support, $D_{\KL}(p \,\|\, m) = \log 2$ for both, and the JSD is $\log 2$ however far
apart the two distributions are. A divergence that is constant under every small move gives the
generator no direction.

The **Wasserstein-1** or **earth mover's distance** measures how far mass must travel:

$$
W(p, q) = \inf_{\gamma \in \Pi(p, q)} \E_{(\mathbf{x}, \mathbf{y}) \sim \gamma}\,\|\mathbf{x} - \mathbf{y}\|,
$$

where $\Pi(p, q)$ is the set of joint distributions (couplings) with marginals $p$ and $q$. The
infimum over couplings cannot be computed directly, but the Kantorovich–Rubinstein duality turns
it into an optimisation over functions:
$W(p, q) = \sup_{\|f\|_L \le 1} \E_p[f] - \E_q[f]$, the supremum over 1-Lipschitz $f$. The
**Wasserstein GAN** (Arjovsky, Chintala and Bottou 2017) trains a network $f$, the critic, to
reach that supremum, and the generator to reduce it. The hard part is keeping $f$ Lipschitz.
WGAN clipped the critic's weights to a small box, which works but limits the critic. WGAN-GP
(Gulrajani et al. 2017) adds a penalty
$\lambda\,\E\big[(\|\nabla f(\hat{\mathbf{x}})\| - 1)^2\big]$ at random interpolates
$\hat{\mathbf{x}}$ between data and samples. Spectral normalisation (Miyato et al. 2018) divides
each layer's weights by their largest singular value, bounding every layer's Lipschitz constant
by 1, and is the other common stabiliser.

::: worked title="Two point masses"
Let $p_{\text{data}}$ be a point mass at 0 and $p_g$ a point mass at $\theta$. For every
$\theta \ne 0$ the supports are disjoint, so $\mathrm{JSD} = \log 2 = 0.693$, and its derivative
in $\theta$ is zero. The only coupling moves all the mass from $\theta$ to 0, so
$W = |\theta|$, with derivative $\operatorname{sign}(\theta)$: it points the generator home from
any distance.
:::

### Where GANs stand

GANs produced the first photorealistic generated images and remain the fastest generators, one
forward pass per sample. As of 2026, though, diffusion models ([Section 5](#s5)) have replaced
them for most new image generation, a shift dated to about 2021, when Dhariwal and Nichol
reported diffusion models beating GANs on image synthesis. Diffusion won for four reasons: it
trains as a stable regression, with one network and one loss; it covers the modes, because its
objective is a likelihood bound that penalises missing data; it conditions easily on text, a
class or an image; and it scales to large models and datasets. The adversarial loss survives as a
term: in image and audio codecs, in the autoencoder of latent diffusion (Rombach et al. train it
with a patch-based adversarial term to keep it sharp), and in distilling diffusion models down
to a few steps.

In engineering, GANs have served as fast samplers for exploring a design space, for data
augmentation and for super-resolving simulated fields. Before trusting their samples, check
coverage: a generator that produces only the common designs will look excellent and miss the
rare ones that matter.

::: check
At a point where $p_{\text{data}} = 0.3$ and $p_g = 0.1$, what is $D^*$?
:::

::: answer
$D^* = 0.3/(0.3 + 0.1) = 0.75$. Equivalently, $D^*/(1 - D^*) = 3$, the density ratio
$p_{\text{data}}/p_g$.
:::

::: check
Why does the Jensen–Shannon divergence give the generator no direction when $p_{\text{data}}$ and
$p_g$ sit on disjoint supports, and what does the Wasserstein-1 distance do instead?
:::

::: answer
For any two distributions with disjoint supports the JSD equals $\log 2$, however far apart they
are, so small moves of $p_g$ do not change it and its gradient is zero. The Wasserstein-1 distance
grows with the distance mass must travel ($|\theta|$ for two point masses), so its gradient points
$p_g$ toward $p_{\text{data}}$.
:::
