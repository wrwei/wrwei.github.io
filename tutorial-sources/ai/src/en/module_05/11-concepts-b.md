## Diffusion I: the forward process and the training objective {#s5}

The VAE of [Section 3](#s3) learns a generator in one jump, from a simple latent to the data, and
pays for it with blurred samples. The GAN of [Section 4](#s4) makes sharp samples but trains as an
unstable game. A **diffusion model** splits generation into many small steps. Destroying data is
easy: add a little Gaussian noise, then a little more, until nothing but noise remains. Each
small destruction step is nearly reversible, and undoing one step is a denoising problem, which is
a regression. Train one network to undo every step, then start from pure noise and apply it
repeatedly. This section builds the destruction process and derives the regression loss; [Section 6](#s6)
turns the trained network into a sampler.

### The forward process

Fix a number of steps $T$ and a **noise schedule** $\beta_1, \dots, \beta_T$, small positive numbers.
The **forward process** adds noise one step at a time:

$$
q(\mathbf{x}_t \mid \mathbf{x}_{t-1}) = \mathcal{N}\big(\sqrt{1-\beta_t}\,\mathbf{x}_{t-1},\ \beta_t \mathbf{I}\big), \qquad t = 1, \dots, T.
$$

With $\alpha_t = 1 - \beta_t$, one step is $\mathbf{x}_t = \sqrt{\alpha_t}\,\mathbf{x}_{t-1} + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t$
with fresh $\boldsymbol{\epsilon}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$. The shrink factor
$\sqrt{1-\beta_t}$ is there for a reason. If a coordinate of $\mathbf{x}_{t-1}$ has unit variance, the
variance of $\mathbf{x}_t$ is $(1-\beta_t) \cdot 1 + \beta_t = 1$: data standardised to unit
variance stay at unit variance, and the process converges to $\mathcal{N}(\mathbf{0}, \mathbf{I})$
rather than drifting off to ever larger values, as plain added noise would.

Nothing here is learned. The forward process has no parameters; the schedule is chosen by hand.

**The closed form.** Training needs $\mathbf{x}_t$ for a random $t$, and running $t$ steps to get it
would be wasteful. It is unnecessary. Compose two steps, using the Gaussian algebra of
[Section 1](#s1):

$$
\begin{aligned}
\mathbf{x}_2 &= \sqrt{\alpha_2}\,\big(\sqrt{\alpha_1}\,\mathbf{x}_0 + \sqrt{1-\alpha_1}\,\boldsymbol{\epsilon}_1\big) + \sqrt{1-\alpha_2}\,\boldsymbol{\epsilon}_2 \\
&= \sqrt{\alpha_1\alpha_2}\,\mathbf{x}_0 + \Big(\sqrt{\alpha_2(1-\alpha_1)}\,\boldsymbol{\epsilon}_1 + \sqrt{1-\alpha_2}\,\boldsymbol{\epsilon}_2\Big).
\end{aligned}
$$

The bracket is a sum of two independent zero-mean Gaussians, so it is Gaussian with variance
$\alpha_2(1-\alpha_1) + (1-\alpha_2) = 1 - \alpha_1\alpha_2$ per coordinate. Write
$\bar\alpha_t = \prod_{s=1}^{t}\alpha_s$. Two steps give
$\mathbf{x}_2 = \sqrt{\bar\alpha_2}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_2}\,\boldsymbol{\epsilon}$ with a
single $\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$. The same identity,
$\alpha_t(1-\bar\alpha_{t-1}) + (1-\alpha_t) = 1 - \bar\alpha_t$, carries the result from $t-1$ to $t$, and
induction gives

$$
q(\mathbf{x}_t \mid \mathbf{x}_0) = \mathcal{N}\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0,\ (1-\bar\alpha_t)\mathbf{I}\big),
\qquad
\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}.
\tag{5.4}
$$

[Exercise 6](#e6) asks you to write the induction out. Equation (5.4) is what makes training cheap:
a training input at any noise level costs one line, with no loop over $t$. The signal is scaled by
$\sqrt{\bar\alpha_t}$, the noise by $\sqrt{1-\bar\alpha_t}$, and the squares of the two scales sum to 1.

::: worked title="One noising step in closed form"
Take $x_0 = 2.0$, a step with $\bar\alpha_t = 0.5$ and the noise draw $\epsilon = -0.4$. By (5.4):

$$
x_t = \sqrt{0.5} \times 2 + \sqrt{0.5} \times (-0.4) = 1.4142 - 0.2828 = 1.1314.
$$

This is the noising step of [Section 1](#s1), now a whole stretch of the forward process. Which
stretch depends on the schedule: with $T = 1000$, $\bar\alpha_t$ falls to 0.5 at about $t = 260$ under
the linear schedule below and at about $t = 497$ under the cosine schedule.
:::

::: figure id=fig-05-10
The forward process on Lab 2's two moons: six scatter panels at $t$ = 0, 50, 100, 150, 175 and
200 under the capped cosine schedule with $T = 200$, each titled with $\bar\alpha_t$ (1, 0.847,
0.494, 0.144, 0.037 and $6.8 \times 10^{-5}$). The two moons blur, lose their shape and dissolve
into a round Gaussian cloud.
:::

### Schedules

The schedule decides how fast the signal fades. A useful single number is the
**signal-to-noise ratio**

$$
\mathrm{SNR}(t) = \frac{\bar\alpha_t}{1-\bar\alpha_t},
$$

the ratio of signal variance to noise variance in (5.4) for unit-variance data, often quoted in
decibels, $10\log_{10}\mathrm{SNR}$. One requirement is not negotiable: $\bar\alpha_T$ must be close
to 0, so that $\mathbf{x}_T$ is close to $\mathcal{N}(\mathbf{0}, \mathbf{I})$. Sampling starts from
$\mathcal{N}(\mathbf{0}, \mathbf{I})$, and if training never showed the network inputs that look like
that, the first sampling step is a step into the unknown.

Ho, Jain and Abbeel (2020) used a **linear schedule**, $\beta_t$ rising evenly from $10^{-4}$ to
0.02 over $T = 1000$ steps, which ends at $\bar\alpha_T = 4.0 \times 10^{-5}$. Nichol and Dhariwal
(2021) noticed that it destroys information too early and proposed the **cosine schedule**, which
defines $\bar\alpha_t$ directly:

$$
\bar\alpha_t = \frac{f(t)}{f(0)}, \qquad f(t) = \cos^2\!\left(\frac{t/T + s}{1 + s}\cdot\frac{\pi}{2}\right), \qquad s = 0.008,
$$

with $\beta_t = 1 - \bar\alpha_t/\bar\alpha_{t-1}$ clipped at 0.999, because $f(T) = 0$ would otherwise make
the last $\beta_T$ equal to 1. The small offset $s$ keeps $\beta_1$ from being vanishingly small.

::: worked title="Two schedules in numbers"
Both schedules with $T = 1000$, computing $\bar\alpha_t$ as the product of $1 - \beta_s$:

| $t$ | 100 | 250 | 500 | 750 | 1000 |
|---|---|---|---|---|---|
| linear $\bar\alpha_t$ | 0.897 | 0.524 | 0.0786 | 0.00335 | $4.0 \times 10^{-5}$ |
| cosine $\bar\alpha_t$ | 0.972 | 0.847 | 0.494 | 0.144 | $2.4 \times 10^{-9}$ |

At $t = 500$ the linear schedule keeps $\sqrt{0.0786} = 0.28$ of the signal amplitude (SNR
$-10.7$ dB); the cosine schedule keeps $\sqrt{0.494} = 0.70$ (SNR $-0.1$ dB, signal and noise about
equal). Now take $\bar\alpha = 0.01$, an SNR of $10\log_{10}(0.01/0.99) = -20$ dB, as the point below which
an input is nearly pure noise. The linear schedule crosses it at $t = 674$, so steps 674 to 1000,
33% of all steps, are spent there. The cosine schedule crosses it at $t = 936$: 6.5% of the steps.
A step drawn from that region teaches the model little, because the best prediction of $\mathbf{x}_0$
from almost pure noise is close to the data mean whatever the input. The cosine schedule spends its
training on noise levels where there is still something to learn.
:::

::: figure id=fig-05-11
$\bar\alpha_t$ (left axis, linear scale) and SNR in dB (right axis) against $t$ for the linear and
cosine schedules with $T = 1000$. A horizontal line marks $\bar\alpha = 0.01$; the region where the
linear schedule lies below it, $t > 674$, is shaded.
:::

::: widget name=diffusion-explorer
The explorer opens on a ring of eight Gaussians at $t = 500$: the left panel (linear schedule,
$\bar\alpha = 0.079$) is already a round blob, while the right (cosine, $\bar\alpha = 0.494$) still
shows eight clusters. Drag $t$ and watch the readouts of signal scale, noise scale and SNR, and the
histogram of the $x$-coordinates approach the standard normal curve. Press play to animate the
whole forward process, and switch the dataset to two moons to see the same path from a different
start. Leave the reverse sampler for [Section 6](#s6).
:::

### The reverse step, if $\mathbf{x}_0$ were known

Generation needs the reverse direction, $q(\mathbf{x}_{t-1} \mid \mathbf{x}_t)$. That distribution is
intractable: it depends on the whole data distribution, because many clean points could have led to
$\mathbf{x}_t$. Conditioned on the clean point as well, it is a Gaussian. By Bayes' rule,
$q(\mathbf{x}_{t-1} \mid \mathbf{x}_t, \mathbf{x}_0) \propto q(\mathbf{x}_t \mid \mathbf{x}_{t-1})\, q(\mathbf{x}_{t-1} \mid \mathbf{x}_0)$,
a product of two Gaussians in $\mathbf{x}_{t-1}$. Completing the square in $\mathbf{x}_{t-1}$ (the
algebra is routine and is skipped) gives the precisions adding,
$\alpha_t/\beta_t + 1/(1-\bar\alpha_{t-1}) = (1-\bar\alpha_t)/\big(\beta_t(1-\bar\alpha_{t-1})\big)$, and

$$
q(\mathbf{x}_{t-1} \mid \mathbf{x}_t, \mathbf{x}_0) = \mathcal{N}\big(\tilde{\boldsymbol{\mu}}_t,\ \tilde\beta_t \mathbf{I}\big),
\quad
\tilde{\boldsymbol{\mu}}_t = \frac{\sqrt{\bar\alpha_{t-1}}\,\beta_t}{1-\bar\alpha_t}\,\mathbf{x}_0 + \frac{\sqrt{\alpha_t}\,(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}\,\mathbf{x}_t,
\quad
\tilde\beta_t = \frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\,\beta_t.
\tag{5.5}
$$

The mean blends where the point came from and where it is now; the model must supply the missing
$\mathbf{x}_0$.

### From the ELBO to predicting the noise

Treat $\mathbf{x}_1, \dots, \mathbf{x}_T$ as latent variables and the reverse model
$p_\theta(\mathbf{x}_{t-1} \mid \mathbf{x}_t) = \mathcal{N}\big(\boldsymbol{\mu}_\theta(\mathbf{x}_t, t),\ \sigma_t^2 \mathbf{I}\big)$, with
$\sigma_t^2$ fixed, as the decoder. The ELBO of [Section 3](#s3), with $q(\mathbf{x}_{1:T} \mid \mathbf{x}_0)$
as the encoder, regroups (a page of bookkeeping that applies Bayes' rule to each forward step, done
in the extended derivations of Ho et al.) into one KL per step:

$$
-\log p_\theta(\mathbf{x}_0) \le \E_q\Big[\underbrace{D_{\KL}\big(q(\mathbf{x}_T \mid \mathbf{x}_0)\,\|\,p(\mathbf{x}_T)\big)}_{L_T} +
\sum_{t=2}^{T}\underbrace{D_{\KL}\big(q(\mathbf{x}_{t-1} \mid \mathbf{x}_t, \mathbf{x}_0)\,\|\,p_\theta(\mathbf{x}_{t-1} \mid \mathbf{x}_t)\big)}_{L_{t-1}}
\underbrace{-\log p_\theta(\mathbf{x}_0 \mid \mathbf{x}_1)}_{L_0}\Big].
$$

$L_T$ has no parameters. Each $L_{t-1}$ is a KL between two Gaussians, and with the variance of
$p_\theta$ fixed it reduces to a squared distance between means,
$L_{t-1} = \frac{1}{2\sigma_t^2}\|\tilde{\boldsymbol{\mu}}_t - \boldsymbol{\mu}_\theta\|^2 + C$, with $C$ independent of $\theta$.

Now remove $\mathbf{x}_0$ from (5.5). From (5.4),
$\mathbf{x}_0 = (\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon})/\sqrt{\bar\alpha_t}$. Substituting, the coefficient of
$\mathbf{x}_t$ becomes $\big(\beta_t + \alpha_t(1-\bar\alpha_{t-1})\big)/\big((1-\bar\alpha_t)\sqrt{\alpha_t}\big) = 1/\sqrt{\alpha_t}$, and

$$
\tilde{\boldsymbol{\mu}}_t = \frac{1}{\sqrt{\alpha_t}}\Big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\boldsymbol{\epsilon}\Big).
$$

The network sees $\mathbf{x}_t$, so the only unknown is $\boldsymbol{\epsilon}$. Parameterise the model mean
the same way, with a network $\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)$ in place of $\boldsymbol{\epsilon}$. The
$\mathbf{x}_t$ terms cancel in the difference, and

$$
L_{t-1} = \frac{\beta_t^2}{2\sigma_t^2\,\alpha_t\,(1-\bar\alpha_t)}\,\big\|\boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\big\|^2 + C.
$$

Every term of the bound is a weighted noise-prediction error. Ho et al. dropped the weights and
sampled $t$ uniformly, giving the loss of the source tutorial:

$$
\mathcal{L}_{\text{simple}}(\theta) = \E_{t,\,\mathbf{x}_0,\,\boldsymbol{\epsilon}}\Big\|\boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon},\ t\big)\Big\|^2.
\tag{5.6}
$$

The weights they dropped are not small differences. With $\sigma_t^2 = \beta_t$ the weight is
$\beta_t/\big(2\alpha_t(1-\bar\alpha_t)\big)$; for the linear schedule it is 0.50 at $t = 1$ (where
$1-\bar\alpha_1 = \beta_1$), 0.010 at $t = 100$, 0.0055 at $t = 500$ and 0.010 at $t = 1000$. The bound
puts fifty to ninety times more weight on the smallest noise levels, where denoising is easiest and
matters least to how a sample looks. Relative to the ELBO, $\mathcal{L}_{\text{simple}}$ moves the
emphasis to the harder, noisier steps; Ho et al. found that it gave better samples, at the price of
no longer being a bound on the likelihood.

::: figure id=fig-05-12
One training step as a diagram: draw $\mathbf{x}_0$ from the data, $t$ uniformly from
$\{1, \dots, T\}$ and $\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$; form
$\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}$; pass $(\mathbf{x}_t, t)$
through the network $\boldsymbol{\epsilon}_\theta$; take the squared error against $\boldsymbol{\epsilon}$.
:::

In code, one batch of (5.6) is six lines:

```python
def diffusion_loss(eps_model, x0, alpha_bar):
    """L_simple for one batch; alpha_bar has length T + 1 with alpha_bar[0] = 1."""
    T = len(alpha_bar) - 1
    t = torch.randint(1, T + 1, (x0.shape[0],))         # one noise level per example
    eps = torch.randn_like(x0)
    ab = alpha_bar[t].view(-1, *[1] * (x0.dim() - 1))   # broadcast over feature dims
    xt = ab.sqrt() * x0 + (1 - ab).sqrt() * eps         # equation (5.4): no loop over t
    return ((eps - eps_model(xt, t)) ** 2).mean()
```

### The same loss, seen as score estimation

A second route to (5.6) explains what the network learns. The gradient of a log
density with respect to its argument, $\nabla_{\mathbf{x}} \log p(\mathbf{x})$, is the **score function**:
a vector field pointing toward higher density. For one noising step,

$$
\nabla_{\mathbf{x}_t} \log q(\mathbf{x}_t \mid \mathbf{x}_0) = -\frac{\mathbf{x}_t - \sqrt{\bar\alpha_t}\,\mathbf{x}_0}{1-\bar\alpha_t} = -\frac{\boldsymbol{\epsilon}}{\sqrt{1-\bar\alpha_t}}.
$$

Regressing a network onto this conditional score at noisy samples recovers, at the optimum, the
score of the noisy marginal $p_t(\mathbf{x}_t)$; this is **denoising score matching** (Vincent 2011),
which Song and Ermon (2019) turned into a generator. Predicting $\boldsymbol{\epsilon}$ is the same
regression up to a fixed scale, so a trained noise predictor is a score estimator:
$\mathbf{s}_\theta(\mathbf{x}_t, t) = -\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)/\sqrt{1-\bar\alpha_t}$.

The score also says what the network believes about the clean data. **Tweedie's formula** gives the
posterior mean of $\mathbf{x}_0$ from the score of the noisy marginal:

$$
\E[\mathbf{x}_0 \mid \mathbf{x}_t] = \frac{\mathbf{x}_t + (1-\bar\alpha_t)\,\nabla \log p_t(\mathbf{x}_t)}{\sqrt{\bar\alpha_t}}
\quad\Longrightarrow\quad
\hat{\mathbf{x}}_0 = \frac{\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)}{\sqrt{\bar\alpha_t}}.
$$

So $\hat{\mathbf{x}}_0$, the noise prediction inverted through (5.4), is a posterior mean: an average
over every clean point that could have produced $\mathbf{x}_t$. At high noise many very different
points could have, and their average is a blur. That is why one denoising step from pure noise
cannot generate anything, and why the sampler of [Section 6](#s6) takes many small steps.

::: worked title="The optimal denoiser for Gaussian data"
Let the data be one-dimensional, $x_0 \sim \mathcal{N}(2, 0.25)$, at the noise level
$\bar\alpha_t = 0.5$. By (5.4) $x_t$ is Gaussian with mean $\sqrt{0.5} \times 2 = 1.4142$ and variance
$0.5 \times 0.25 + 0.5 = 0.625$. Its score is $-(x_t - 1.4142)/0.625$, so the optimal noise prediction is

$$
\epsilon^*(x_t) = \sqrt{1-\bar\alpha_t}\,\frac{x_t - 1.4142}{0.625}.
$$

At $x_t = 1.0$: $\epsilon^* = 0.7071 \times (-0.4142)/0.625 = -0.4686$, and

$$
\hat{x}_0 = \frac{1.0 - 0.7071 \times (-0.4686)}{0.7071} = \frac{1.3314}{0.7071} = 1.8828.
$$

Check it by Gaussian conditioning: $\operatorname{Cov}(x_0, x_t) = \sqrt{0.5} \times 0.25 = 0.1768$, so
$\E[x_0 \mid x_t] = 2 + (0.1768/0.625)(1.0 - 1.4142) = 2 - 0.1172 = 1.8828$. The two agree: the
noise predictor's implied $\hat{x}_0$ is the posterior mean. Note that $1.8828$ lies between the noisy
observation, rescaled, and the data mean 2. For Gaussian data the ideal denoiser is linear in
$x_t$; for data with several modes, two moons or eight clusters, it must decide which mode $x_t$
came from, which is nonlinear, and that is what the network has to learn.
:::

### Why it trains, and what the network looks like

Equation (5.6) is a plain regression onto a target whose distribution is fixed: the noise was drawn
by the training loop and does not move as the network learns. There is no adversary and no game, so
the loss, noisy from batch to batch, falls steadily and means the same thing throughout training. That, more than
anything, is why diffusion displaced GANs ([Section 4](#s4)).

Predicting $\boldsymbol{\epsilon}$ is one choice among three that carry the same information. A network
can predict $\mathbf{x}_0$ directly, or the **velocity**
$\mathbf{v} = \sqrt{\bar\alpha_t}\,\boldsymbol{\epsilon} - \sqrt{1-\bar\alpha_t}\,\mathbf{x}_0$ (Salimans and Ho 2022).
Each can be converted into the others through (5.4); they differ in how a squared error on them
weights the noise levels, and so in which steps the network fits best.

For images, $\boldsymbol{\epsilon}_\theta$ is a U-Net ([Module 03](module_03_EN.html)), whose output has the
shape of its input, or a transformer over image patches; in [Lab 2](#lab2) it is a small MLP on two
coordinates. The time step enters through a sinusoidal embedding of $t$, the same construction as the
positional encodings of [Module 06](module_06_EN.html), so that one network can behave differently at
each noise level.

::: check
Why can training draw $\mathbf{x}_t$ directly instead of running $t$ noising steps?
:::

::: answer
A composition of Gaussian steps is Gaussian, with the noise variances adding:
$q(\mathbf{x}_t \mid \mathbf{x}_0) = \mathcal{N}(\sqrt{\bar\alpha_t}\,\mathbf{x}_0, (1-\bar\alpha_t)\mathbf{I})$. So
$\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}$ with one noise draw.
:::

::: check
What does the network's noise prediction tell you about the clean data?
:::

::: answer
Inverting (5.4) gives
$\hat{\mathbf{x}}_0 = (\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}_\theta)/\sqrt{\bar\alpha_t}$, which for an
optimal network is the posterior mean $\E[\mathbf{x}_0 \mid \mathbf{x}_t]$. Equivalently,
$\boldsymbol{\epsilon}_\theta$ is the score $\nabla \log p_t(\mathbf{x}_t)$ scaled by $-\sqrt{1-\bar\alpha_t}$.
:::

::: check
In the diffusion explorer, set $t = 500$. Which schedule still shows the ring, and why?
:::

::: answer
The cosine schedule: $\bar\alpha_{500} = 0.49$, an SNR of about 0 dB, so signal and noise have similar
variance and the eight clusters are still visible. Under the linear schedule
$\bar\alpha_{500} = 0.079$ (SNR $-10.7$ dB) and the ring is gone.
:::

## Diffusion II: sampling, guidance, latent diffusion and cost {#s6}

A trained $\boldsymbol{\epsilon}_\theta$ predicts noise. This section turns it into a generator, steers
it with a condition, makes it affordable, and counts what it costs.

### Ancestral sampling

The reverse model of [Section 5](#s5) has mean
$\boldsymbol{\mu}_\theta = \frac{1}{\sqrt{\alpha_t}}\big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\big)$
and fixed variance $\sigma_t^2$. Sampling it from $t = T$ down to 1 is **ancestral sampling** (Ho et
al.'s sampling algorithm):

$$
\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I}), \qquad
\mathbf{x}_{t-1} = \frac{1}{\sqrt{\alpha_t}}\Big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\Big) + \sigma_t\,\mathbf{z},
\quad \mathbf{z} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}),
$$

with $\mathbf{z} = \mathbf{0}$ at the last step and $\sigma_t^2 = \beta_t$ or $\tilde\beta_t$ (both work).
Each step subtracts a fraction of the predicted noise, rescales, and adds a little fresh noise. One
sample costs $T$ network evaluations.

```python
@torch.no_grad()
def ddpm_sample(eps_model, shape, alpha_bar):
    """Ancestral sampling with sigma_t^2 = beta_t."""
    T = len(alpha_bar) - 1
    x = torch.randn(shape)
    for t in range(T, 0, -1):
        alpha_t = alpha_bar[t] / alpha_bar[t - 1]
        beta_t = 1 - alpha_t
        eps = eps_model(x, torch.full((shape[0],), t))
        x = (x - beta_t / (1 - alpha_bar[t]).sqrt() * eps) / alpha_t.sqrt()
        if t > 1:                                        # no noise on the last step
            x = x + beta_t.sqrt() * torch.randn_like(x)
    return x
```

::: figure id=fig-05-13
Lab 2's reverse process: seven scatter panels of 2,000 samples at $t$ = 200, 150, 100, 50, 20, 5
and 0, each annotated with the mean nearest-neighbour distance from the samples to the data (0.246,
0.234, 0.211, 0.134, 0.056, 0.025, 0.020). The moons appear only in the last panels: structure
appears late.
:::

Figure 5.13 shows where the work is done. Over the first 100 of Lab 2's 200 steps the distance barely
moves (0.246 to 0.211; pure Gaussian draws give 0.242); the moons form in the last 50 steps, ending at
0.020 against 0.013 for fresh data.

**The first step.** The update divides by $\sqrt{\alpha_t}$, multiplying any error in
$\boldsymbol{\epsilon}_\theta$; usually $\alpha_t$ is close to 1. The cosine schedule's clip at
$\beta_T = 0.999$ makes the first step's factor $1/\sqrt{0.001} = 31.6$. Lab 2 therefore caps
$\beta_t$ at 0.5 with $T = 200$: $\bar\alpha_T$ is still $6.8 \times 10^{-5}$, and the factor is
$1/\sqrt{0.5} = 1.41$. An equivalent fix keeps the schedule: compute $\hat{\mathbf{x}}_0$, clip it to the
data range, and step to the posterior mean $\tilde{\boldsymbol{\mu}}_t(\mathbf{x}_t, \hat{\mathbf{x}}_0)$ of (5.5).

### Fewer steps: DDIM

Song, Meng and Ermon (2021) observed that the training loss only constrains the marginals
$q(\mathbf{x}_t \mid \mathbf{x}_0)$, not the step-by-step process, so the same trained network serves
other samplers. **DDIM** takes a deterministic step: estimate the clean point, then re-noise it to a
lower level $t' < t$ using the predicted noise instead of fresh noise,

$$
\hat{\mathbf{x}}_0 = \frac{\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)}{\sqrt{\bar\alpha_t}}, \qquad
\mathbf{x}_{t'} = \sqrt{\bar\alpha_{t'}}\,\hat{\mathbf{x}}_0 + \sqrt{1-\bar\alpha_{t'}}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t),
$$

on a strided subsequence of times, say 200, 190, ..., 0. Lab 2's sweep measures what that buys:
the precision-like distance is 0.023 with 200 steps, 0.030 with 20, 0.045 with 5, and 1.57 with one.
A single step from pure noise returns $\hat{\mathbf{x}}_0$, an estimate of the posterior mean given
noise. Even for a perfect network that is a blur near the data mean, and the trained network's small
errors are multiplied by $\sqrt{1-\bar\alpha_T}/\sqrt{\bar\alpha_T} = 121$.

The Gaussian example of [Section 5](#s5) shows the mechanism without any training error. With its
exact noise predictor (linear schedule, $T = 1000$, 20,000 samples), ancestral sampling gives
standard deviation 0.50, as it should; DDIM gives 0.47, 0.37 and 0.16 with 50, 10 and 3 steps, and
0.002 with one step, every sample at the posterior mean 2.00. Few steps lose spread first. In the
diffusion explorer, run DDIM on the ring at 10 and at 3 steps: the cosine panel degrades more
slowly, and at 3 steps the linear panel lands its points between the clusters.

### Conditioning and guidance

To generate what was asked for, give the network a condition $\mathbf{c}$:
$\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \mathbf{c})$, where $\mathbf{c}$ is a class, a text embedding, a
low-resolution image or a measured boundary condition. Training is unchanged apart from the extra
input. A conditional model often follows its condition loosely; guidance strengthens it.
**Classifier guidance** (Dhariwal and Nichol 2021) adds the gradient of a classifier trained on
noisy inputs, $\nabla_{\mathbf{x}_t} \log p(\mathbf{c} \mid \mathbf{x}_t)$, to the score at each step.

**Classifier-free guidance** (Ho and Salimans 2022) needs no classifier. Train one network, replacing
$\mathbf{c}$ by a null token $\varnothing$ with probability $p_{\text{uncond}}$ (0.1 to 0.2; 0.2 in
[Lab 2](#lab2)), so that it learns both the conditional and the unconditional prediction. Sample with

$$
\tilde{\boldsymbol{\epsilon}} = \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \varnothing) + w\,\big[\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \mathbf{c}) - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \varnothing)\big].
$$

$w = 0$ is the unconditional model, $w = 1$ the conditional model, and $w > 1$ extrapolates past it.
Ho and Salimans write the scale as $(1 + w)$, so their $w$ is this module's $w$ minus 1; check the
convention before comparing numbers across papers.

What $w > 1$ means follows from the score view. Since $\mathbf{s} = -\boldsymbol{\epsilon}/\sqrt{1-\bar\alpha_t}$,
the same combination holds for scores, and Bayes' rule,
$\nabla \log p(\mathbf{x} \mid \mathbf{c}) = \nabla \log p(\mathbf{x}) + \nabla \log p(\mathbf{c} \mid \mathbf{x})$, gives

$$
\tilde{\mathbf{s}} = \nabla \log p(\mathbf{x}) + w\,\nabla \log p(\mathbf{c} \mid \mathbf{x})
= \nabla \log p(\mathbf{x} \mid \mathbf{c}) + (w - 1)\,\nabla \log p(\mathbf{c} \mid \mathbf{x}).
$$

Guidance samples from the conditional distribution tilted toward points that an implicit classifier
labels $\mathbf{c}$ with confidence. Each step now costs two network evaluations.

::: worked title="Classifier-free guidance in two dimensions"
At some $\mathbf{x}_t$ the network predicts $\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, \varnothing) = (0.2, -0.1)$ and
$\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, \mathbf{c}) = (0.5, 0.3)$. The difference is $(0.3, 0.4)$.

- $w = 0$: $(0.2, -0.1)$, the unconditional prediction.
- $w = 1$: $(0.2 + 0.3, -0.1 + 0.4) = (0.5, 0.3)$, the conditional prediction.
- $w = 3$: $(0.2 + 3 \times 0.3, -0.1 + 3 \times 0.4) = (1.1, 1.1)$.
- $w = 7.5$: $(0.2 + 7.5 \times 0.3, -0.1 + 7.5 \times 0.4) = (2.45, 2.9)$.

For $w > 1$ the guided prediction leaves the segment between the two estimates. The network never
produced $(2.45, 2.9)$; extrapolation invents it, which is how large $w$ pushes samples off the data.
:::

Lab 2 requests 1,000 samples of class 0 on two moons. At $w = 0$, 50% land in the requested moon;
at $w$ = 1, 3 and 7, 100%. The recall-like distance (class-0 data to samples) grows 0.022, 0.029,
0.046 for $w$ = 1, 3, 7, and the precision-like distance, 0.021, 0.014, 0.013 for $w$ = 0 to 3,
worsens to 0.033 at $w = 7$ as samples overshoot. Fidelity is bought with diversity, and beyond some
$w$ fidelity is lost too.

::: figure id=fig-05-14
Lab 2's guidance sweep: four panels of class-0 samples at $w$ = 0, 1, 3 and 7 over a faint outline
of both moons, each titled with the fraction in class 0 and the recall distance (0.50 and 0.032; 1.00
and 0.022; 1.00 and 0.029; 1.00 and 0.046). The samples move onto one moon and then crowd into its
densest part.
:::

### Latent diffusion

Pixel-space diffusion runs a large network many times over every pixel. **Latent diffusion**
(Rombach et al. 2022) first trains an autoencoder (with a small KL term, as in a VAE, and perceptual
and adversarial losses to keep it sharp) that compresses an image to a much smaller latent. Diffusion
runs on the latents; the decoder runs once at the end. Text conditions enter the denoiser by
cross-attention (attention from the latent's positions to the text's token embeddings, the mechanism
of [Module 06](module_06_EN.html)).

::: worked title="What the latent saves"
In one configuration of Rombach et al., a $512 \times 512 \times 3$ image maps to a
$64 \times 64 \times 4$ latent (downsampling factor 8, 4 channels):

$$
512 \times 512 \times 3 = 786{,}432 \text{ values}, \qquad 64 \times 64 \times 4 = 16{,}384 \text{ values}, \qquad
\frac{786{,}432}{16{,}384} = 48.
$$

The denoiser processes 48 times fewer values at every step. The encoder is not needed at sampling
time, and the decoder's cost is paid once rather than per step.
:::

::: figure id=fig-05-15
Latent diffusion pipeline with shapes on every arrow: image $512 \times 512 \times 3$ → encoder →
latent $64 \times 64 \times 4$ → diffusion loop (the denoiser, applied repeatedly, with the condition
$\mathbf{c}$ entering by cross-attention) → decoder → image $512 \times 512 \times 3$.
:::

### What sampling costs

The cost of one sample is steps × network evaluations per step × cost of one evaluation.

::: worked title="Counting evaluations"
A sampler with 50 DDIM steps and classifier-free guidance runs the network twice per step:
$50 \times 2 = 100$ evaluations per image. A GAN generator runs once. A sampler distilled to 4 steps,
whose student was trained to reproduce the guided output so that one evaluation per step suffices,
needs $4 \times 1 = 4$: 25 times fewer than the guided 50-step sampler.
:::

Distillation trains a fast student to match a slow teacher. **Progressive distillation** (Salimans and
Ho 2022) repeatedly trains a student to do two teacher steps in one, halving the step count each
round; **consistency models** (Song et al. 2023) train a network to map any point on a sampling path
straight to its end. Both reach 1 to 4 steps, losing some quality at the lowest counts.
[Module 10](module_10_EN.html) returns to the cost of many sequential evaluations at serving time.

### Engineering uses

Three uses fit the family: candidate geometries conditioned on requirements (a load case, an
envelope); missing sensor channels imputed by conditioning on the observed ones, giving a spread of
plausible values; and coarse simulation fields super-resolved. A sample is a proposal, not a result.
Every generated design still goes through the solver and the usual checks: the model reproduces the
statistics of its training data and knows no physics it did not see.

::: check
With $p_{\text{uncond}} = 0.2$ and $w = 1$, what does classifier-free guidance compute?
:::

::: answer
The conditional prediction $\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \mathbf{c})$ alone: the two
unconditional terms cancel. $p_{\text{uncond}}$ only matters at training time. Guidance extrapolates
only when $w > 1$.
:::

::: check
Why is latent diffusion cheaper than pixel diffusion at the same image size?
:::

::: answer
The denoiser runs at every sampling step, and in latent diffusion it runs on a latent with 48 times
fewer values ($512 \times 512 \times 3$ to $64 \times 64 \times 4$). The decoder that maps back to pixels
runs once per image.
:::

## Graph neural networks I: message passing and the GCN {#s7}

Every network so far assumed a regular structure: a vector of fixed length, a grid of pixels
([Module 03](module_03_EN.html)), a sequence ([Module 04](module_04_EN.html)). Much engineering data
has none. A molecule is atoms joined by bonds, a finite-element mesh is nodes joined by elements, a
circuit is components joined by nets, and a fault tree is events joined to the gates they feed. The
structure is a graph, it differs from one example to the next, and it carries the information.

### Graphs as data

A graph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ has $n$ nodes and a set of edges. Its **adjacency
matrix** $\mathbf{A} \in \{0, 1\}^{n \times n}$ has $A_{ij} = 1$ when nodes $i$ and $j$ are joined; for an
undirected graph it is symmetric. The degree matrix $\mathbf{D}$ is diagonal with $D_{ii} = \sum_j A_{ij}$,
the number of neighbours of $i$, and $\mathcal{N}(v)$ is the set of neighbours of $v$. Each node carries
a feature vector, stacked as the rows of $\mathbf{X} \in \R^{n \times d}$; edges may carry features
$\mathbf{e}_{uv}$ too (a bond type, a relative position). Engineering supplies graphs in quantity:
molecules, meshes, circuits, fault trees, SysML block diagrams, and safety arguments in Goal
Structuring Notation (GSN), whose claims, strategies and evidence are nodes.

### The constraint: numbering is arbitrary

Nothing about a graph says which node is node 1. Renumbering the nodes, with a permutation matrix
$\mathbf{P}$, turns $\mathbf{A}$ into $\mathbf{P}\mathbf{A}\mathbf{P}^\top$ and $\mathbf{X}$ into
$\mathbf{P}\mathbf{X}$, and describes the same graph. A layer that outputs one vector per node must
therefore be **permutation-equivariant**,

$$
f(\mathbf{P}\mathbf{A}\mathbf{P}^\top, \mathbf{P}\mathbf{X}) = \mathbf{P}\, f(\mathbf{A}, \mathbf{X}),
$$

so that renumbering the inputs renumbers the outputs and changes nothing else. A whole-graph output
must be permutation-invariant, $g(\mathbf{P}\mathbf{A}\mathbf{P}^\top, \mathbf{P}\mathbf{X}) = g(\mathbf{A}, \mathbf{X})$,
which a sum, mean or maximum over nodes provides. An MLP on the flattened adjacency matrix fails both
ways: the $n!$ numberings of one graph are different inputs to it, and it cannot accept a graph of
a different size at all.

### Message passing

The way out is to compute every node's update with the same function of its own state and an
unordered collection of its neighbours' states. Gilmer et al. (2017) wrote the general form of a
**message-passing** layer:

$$
\mathbf{m}_v = \operatorname*{AGG}_{u \in \mathcal{N}(v)} M\big(\mathbf{h}_u, \mathbf{h}_v, \mathbf{e}_{uv}\big), \qquad
\mathbf{h}_v' = U(\mathbf{h}_v, \mathbf{m}_v),
$$

where the aggregator is a sum, mean or maximum, any function that ignores order. The simplest
instance, the one in the source tutorial, is

$$
\mathbf{h}_v^{(l+1)} = \phi\Big(\mathbf{W}_{\text{self}}\,\mathbf{h}_v^{(l)} + \sum_{u \in \mathcal{N}(v)} \mathbf{W}_{\text{nbr}}\,\mathbf{h}_u^{(l)}\Big).
$$

The weights are shared by every node, as a convolution shares its kernel across positions
([Module 03](module_03_EN.html)); a graph is like a grid whose neighbourhoods vary in size and have no
order. One layer lets a node see its neighbours; $L$ layers give it an $L$-hop receptive field.

::: figure id=fig-05-17
Message passing for one node: neighbour feature vectors drawn as arrows into the centre node, each
multiplied by $\mathbf{W}$ and by the weight $1/\sqrt{\tilde d_i \tilde d_j}$, summed with the node's
own transformed vector, then passed through a nonlinearity. A side panel shades the two-hop
receptive field of a basic event after two layers.
:::

### Why normalise

With a plain sum, a node of degree 50 receives a message fifty times larger than a leaf does, so the
scale of a node's features depends on how connected it is rather than on what it is. Stacking layers
makes this worse: $L$ unnormalised layers multiply the features by $\mathbf{A}^L$, and $\mathbf{A}$'s
largest eigenvalue is at least the average degree. On the 12-node cooling-system fault tree of the
message-passing explorer ([Section 8](#s8)), unnormalised propagation with self-loops reaches a largest
feature value of $1.22 \times 10^4$ after 8 steps, from one-hot features. Features of that size
saturate activations and wreck optimisation.

### From message passing to the GCN

The **graph convolutional network** (Kipf and Welling 2017) makes three choices. Use one weight matrix,
$\mathbf{W}_{\text{self}} = \mathbf{W}_{\text{nbr}} = \mathbf{W}$, so a node's own state is just one
more message; add self-loops, $\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}$, with degrees $\tilde d_i = d_i + 1$
in $\tilde{\mathbf{D}}$; and normalise symmetrically. With node features as rows the layer is

$$
\mathbf{H}^{(l+1)} = \phi\big(\hat{\mathbf{A}}\,\mathbf{H}^{(l)}\,\mathbf{W}^{(l)}\big), \qquad
\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}\,\tilde{\mathbf{A}}\,\tilde{\mathbf{D}}^{-1/2}, \qquad
\hat A_{ij} = \frac{\tilde A_{ij}}{\sqrt{\tilde d_i\, \tilde d_j}}.
\tag{5.7}
$$

Each message is divided by the square roots of both endpoints' degrees, so a hub's messages count
for less at each recipient and a hub's own sum is scaled down.

Why this keeps the scale fixed: let $\mathbf{u} = \tilde{\mathbf{D}}^{1/2}\mathbf{1}$, the vector of
$\sqrt{\tilde d_i}$. Then $\hat{\mathbf{A}}\mathbf{u} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{d}} = \tilde{\mathbf{D}}^{1/2}\mathbf{1} = \mathbf{u}$,
since the row sums of $\tilde{\mathbf{A}}$ are the degrees. So 1 is an eigenvalue. It is the largest:
$\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{1/2}(\tilde{\mathbf{D}}^{-1}\tilde{\mathbf{A}})\tilde{\mathbf{D}}^{-1/2}$ has the
same eigenvalues as $\tilde{\mathbf{D}}^{-1}\tilde{\mathbf{A}}$, whose rows are non-negative and sum to 1,
and such a matrix has no eigenvalue larger than 1 in magnitude. Repeated application neither explodes
nor vanishes. The **random-walk normalisation** $\tilde{\mathbf{D}}^{-1}\tilde{\mathbf{A}}$ is the
alternative: each node takes the mean over its neighbourhood. It has the same eigenvalues but is not
symmetric. The layer is permutation-equivariant because renumbering gives
$\hat{\mathbf{A}} \to \mathbf{P}\hat{\mathbf{A}}\mathbf{P}^\top$ and
$\mathbf{P}\hat{\mathbf{A}}\mathbf{P}^\top\mathbf{P}\mathbf{H}\mathbf{W} = \mathbf{P}\hat{\mathbf{A}}\mathbf{H}\mathbf{W}$,
using $\mathbf{P}^\top\mathbf{P} = \mathbf{I}$.

Kipf and Welling arrived at (5.7) from another direction. Spectral graph theory defines convolution
on a graph through the eigenvectors of the graph Laplacian, which is expensive. They approximated
a spectral filter to first order in the Laplacian, tied its two coefficients into one, and obtained
the propagation matrix $\mathbf{I} + \mathbf{D}^{-1/2}\mathbf{A}\mathbf{D}^{-1/2}$, whose eigenvalues reach 2,
so repeated use is unstable. Their "renormalisation trick" replaced it by
$\tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\tilde{\mathbf{D}}^{-1/2}$, which is (5.7). Nothing in this
module needs the spectral view; the message-passing derivation arrives at the same layer.

### Computing it

The source tutorial's layer is one line on a dense matrix:

```python
def gcn_layer(A_hat, H, W):
    """A_hat: normalised adjacency with self-loops (n x n); H: (n x d); W: (d x d')."""
    return torch.relu(A_hat @ H @ W)
```

A dense $\hat{\mathbf{A}}$ costs $O(n^2)$ memory and time, mostly spent multiplying zeros. Real graphs are
sparse, so [Lab 3](#lab3) stores $\hat{\mathbf{A}}$ as triples $(i, j, \hat A_{ij})$, both directions of
every edge plus the self-loops, and computes $\text{out}_i = \sum_j \hat A_{ij}\mathbf{H}_j$ with one
scatter-add:

```python
def normalised_edges(edges, n):
    """A-hat as (i, j, weight) triples: both directions of every edge plus self-loops."""
    src = [a for a, b in edges] + [b for a, b in edges] + list(range(n))
    dst = [b for a, b in edges] + [a for a, b in edges] + list(range(n))
    i, j = torch.tensor(dst), torch.tensor(src)       # message travels j -> i
    deg = torch.zeros(n).index_add_(0, i, torch.ones(len(i)))  # d-tilde
    w = (deg[i] * deg[j]).rsqrt()                    # 1 / sqrt(d_i d_j)
    return i, j, w


def propagate(H, i, j, w):
    """out_i = sum over j of A-hat_ij H_j, one multiply-add per stored entry."""
    return torch.zeros_like(H).index_add_(0, i, w[:, None] * H[j])
```

A layer is then `torch.relu(propagate(H, i, j, w) @ W)`, at a cost of $O(|\mathcal{E}|\,d + n\,d\,d')$:
one multiply-add per edge and feature, plus the dense product with $\mathbf{W}$.

### Fault trees as graphs

A **fault tree** decomposes an undesired top event into causes. Its nodes are events and gates: an
OR gate's output event occurs if any input occurs, an AND gate's only if all do, and the leaves are
basic events (a pump fails, a valve sticks). Edges join each input to its gate. As node features,
a one-hot type: [OR, AND, basic]. A **single point of failure** is a basic event whose failure alone
causes the top event, which holds exactly when every gate on its path to the top is an OR. Deciding
it needs information from several hops away, which is why it is the task of [Lab 3](#lab3).

::: worked title="One GCN layer on a five-node fault tree"
The top event T is an OR gate with inputs G1 (an AND gate) and the basic event E3; G1 has inputs E1
and E2. Edges: T–G1, T–E3, G1–E1, G1–E2. With self-loops the degrees are

$$
\tilde d = (\text{T}\ 3,\ \text{G1}\ 4,\ \text{E1}\ 2,\ \text{E2}\ 2,\ \text{E3}\ 2).
$$

The non-zero entries of $\hat{\mathbf{A}}$, each $1/\sqrt{\tilde d_i \tilde d_j}$:
T–T $1/3 = 0.3333$; T–G1 $1/\sqrt{12} = 0.2887$; T–E3 $1/\sqrt{6} = 0.4082$; G1–G1 $1/4 = 0.25$;
G1–E1 and G1–E2 $1/\sqrt{8} = 0.3536$; E1–E1, E2–E2 and E3–E3 $1/2 = 0.5$.

Features [OR, AND, basic]: T $(1, 0, 0)$, G1 $(0, 1, 0)$, E1, E2, E3 $(0, 0, 1)$. Each row of
$\hat{\mathbf{A}}\mathbf{X}$ is a weighted sum of the rows of the node and its neighbours:

- T: $0.3333\,(1,0,0) + 0.2887\,(0,1,0) + 0.4082\,(0,0,1) = (0.3333, 0.2887, 0.4082)$
- G1: $0.2887\,(1,0,0) + 0.25\,(0,1,0) + 2 \times 0.3536\,(0,0,1) = (0.2887, 0.25, 0.7071)$
- E1 = E2: $0.3536\,(0,1,0) + 0.5\,(0,0,1) = (0, 0.3536, 0.5)$
- E3: $0.4082\,(1,0,0) + 0.5\,(0,0,1) = (0.4082, 0, 0.5)$

With $\mathbf{W} = \mathbf{I}$ the ReLU changes nothing. After one layer E3's vector records that its
gate is an OR, and E1's that its gate is an AND: E3 is a single point of failure, E1 is not, and a
linear read-out of the first component separates them. For an event deeper in a larger tree the
answer depends on gates further up, and one layer cannot see them.
:::

::: figure id=fig-05-16
The five-node fault tree drawn top-down: T as an OR gate, G1 as an AND gate, E1, E2 and E3 as
circles. Beside it, the $5 \times 5$ matrix $\hat{\mathbf{A}}$ with its entries, and the $5 \times 3$
matrix $\hat{\mathbf{A}}\mathbf{X}$ with E3's row $(0.4082, 0, 0.5)$ and E1's row $(0, 0.3536, 0.5)$
highlighted.
:::

::: worked title="What the normalisation does to one edge"
Take a gate with three neighbours and one of its inputs, a leaf with one neighbour. With self-loops
their degrees are 4 and 2, and the edge between them carries weight $1/\sqrt{4 \times 2} = 0.354$
in both directions. Unnormalised, it would carry 1, and the gate's sum over its four messages
(three neighbours and itself) would be about four times the size of one feature vector.
:::

### Transductive and inductive learning

The GCN paper trained and tested on the nodes of one large graph: some nodes labelled, the rest to
be predicted. That is **transductive** learning, and the test nodes' features are seen, unlabelled,
during training. Engineering models are usually **inductive**: the network is trained on some fault
trees and applied to new ones. Evaluate it the same way, splitting by graph rather than by node,
the graph version of [Module 01](module_01_EN.html)'s rule against leakage; [Lab 3](#lab3) trains on
200 trees and tests on 100 others.

::: check
Why must a GNN layer be permutation-equivariant?
:::

::: answer
Node numbering is arbitrary: the same graph can be numbered in $n!$ ways. Renumbering the nodes must
renumber the outputs and change nothing else, or the model's predictions would depend on a labelling
choice that carries no information.
:::

::: check
How many layers does a GCN need before a basic event at depth 3 can receive information from the top
event?
:::

::: answer
Three. Each layer extends the receptive field by one hop, and the top event is three edges above an
event at depth 3.
:::

## Graph neural networks II: attention, depth limits and engineering graphs {#s8}

A GCN weights neighbours by degree alone, works only shallow, ignores direction, and cannot tell some
graphs apart.

### Graph attention

A **graph attention network** (GAT; Veličković et al. 2018) lets the features decide how much each
neighbour counts: score each pair, normalise with a softmax over the neighbourhood (self included),
and take the weighted sum:

$$
e_{vu} = \operatorname{LeakyReLU}\big(\mathbf{a}^\top[\mathbf{W}\mathbf{h}_v \,\|\, \mathbf{W}\mathbf{h}_u]\big), \qquad
\alpha_{vu} = \frac{\exp(e_{vu})}{\sum_{k \in \mathcal{N}(v) \cup \{v\}} \exp(e_{vk})}, \qquad
\mathbf{h}_v' = \phi\Big(\sum_{u \in \mathcal{N}(v) \cup \{v\}} \alpha_{vu}\,\mathbf{W}\mathbf{h}_u\Big),
$$

where $\|$ is concatenation and $\mathbf{a}$ a learned vector. Several heads run in parallel; hidden
layers concatenate their outputs and the last layer averages them. A transformer layer
([Module 06](module_06_EN.html)) is attention over the complete graph of its tokens, with positions
added; GAT is attention restricted to the edges.

::: worked title="Attention weights for one node"
A node has three neighbours with scores $e = (0.5, 1.0, -0.2)$; leave out its self-loop to keep the
arithmetic short.

$$
\exp(e) = (1.6487,\ 2.7183,\ 0.8187), \qquad \text{sum} = 5.1857, \qquad
\alpha = \Big(\frac{1.6487}{5.1857}, \frac{2.7183}{5.1857}, \frac{0.8187}{5.1857}\Big) = (0.318,\ 0.524,\ 0.158).
$$

The best-scoring neighbour gets half the weight. A GCN would have weighted the three by degree alone,
whatever their features said.
:::

::: figure id=fig-05-18
GAT on one node: three neighbour arrows with thickness proportional to
$\alpha = (0.318, 0.524, 0.158)$. Beside it, the same node under a GCN, with arrow thickness set by
$1/\sqrt{\tilde d_v \tilde d_u}$, the degrees alone.
:::

### Over-smoothing

Average a neighbourhood often enough and everything looks the same. $\hat{\mathbf{A}}$ is symmetric,
so $\hat{\mathbf{A}} = \sum_i \lambda_i \mathbf{u}_i\mathbf{u}_i^\top$ with orthonormal eigenvectors, and

$$
\hat{\mathbf{A}}^k\mathbf{X} = \sum_i \lambda_i^k\,\mathbf{u}_i\mathbf{u}_i^\top\mathbf{X}.
$$

[Section 7](#s7) showed $\lambda_1 = 1$ with eigenvector $\mathbf{u}_1 \propto \tilde{\mathbf{D}}^{1/2}\mathbf{1}$.
For a connected graph with self-loops every other eigenvalue has $|\lambda_i| < 1$ (the Perron–Frobenius
theorem; the self-loops rule out $-1$). So every term but the first decays, the slowest as
$|\lambda_2|^k$, and

$$
\hat{\mathbf{A}}^k\mathbf{X} \;\to\; \mathbf{u}_1\mathbf{u}_1^\top\mathbf{X}, \qquad
\mathbf{u}_1 = \frac{\tilde{\mathbf{D}}^{1/2}\mathbf{1}}{\|\tilde{\mathbf{D}}^{1/2}\mathbf{1}\|}.
$$

Row $i$ of the limit is $(\mathbf{u}_1)_i\,(\mathbf{u}_1^\top\mathbf{X})$, one common vector scaled by
$\sqrt{\tilde d_i}$. Every node points the same way and only degree tells them apart. This is
**over-smoothing** (Li, Han and Wu 2018); weights and nonlinearities between propagations change the
details, not the tendency.

::: worked title="Over-smoothing on the five-node tree"
For the tree of [Section 7](#s7), the eigenvalues of $\hat{\mathbf{A}}$ are 1, 0.7655, 0.5, 0.0974 and
$-0.2795$. Measure similarity as the mean cosine over the ten pairs of rows of $\hat{\mathbf{A}}^k\mathbf{X}$
(0.300 for $\mathbf{X}$ itself):

| $k$ | 1 | 2 | 4 | 8 | 16 |
|---|---|---|---|---|---|
| mean pairwise cosine | 0.846 | 0.933 | 0.976 | 0.997 | 1.000 |
| $\lvert\lambda_2\rvert^k = 0.7655^k$ | 0.766 | 0.586 | 0.343 | 0.118 | 0.014 |

The distance from the limit shrinks as $|\lambda_2|^k$ predicts. The limit has
$\mathbf{u}_1 \propto (\sqrt 3, 2, \sqrt 2, \sqrt 2, \sqrt 2)$ for (T, G1, E1, E2, E3): E3, the single
point of failure, and E1, which is not, end up with identical vectors.
:::

::: figure id=fig-05-19
Over-smoothing curves from the message-passing explorer on the 12-node cooling-system tree: mean
pairwise cosine similarity of $\hat{\mathbf{A}}^k\mathbf{X}$ for $k = 0, \dots, 40$. Symmetric
normalisation: 0.455 at $k = 0$, then 0.856, 0.967, 0.993, 0.999 at $k$ = 1, 4, 8, 16. Random walk:
0.780, 0.943, 0.987, 0.998. Symmetric without self-loops: oscillating, settling near 0.976.
:::

::: widget name=message-passing-explorer
At $k = 2$ the basic events under OR gates (E1, E5, E6, the single points of failure) are tinted red
and those under AND gates blue. Drag $k$ to 40: every node turns one colour as the cosine climbs to 1
at the rate $|\lambda_2|^k$. Then try normalisation "none", untick the self-loops, and switch to the
hexagon and two triangles.
:::

Without self-loops a tree is **bipartite** (alternate levels form two classes, every edge between
them), $\mathbf{D}^{-1/2}\mathbf{A}\mathbf{D}^{-1/2}$ has eigenvalue $-1$, and its term flips sign at every
step: the features oscillate instead of converging. In the explorer the cosine reads 0.455, 0.384,
0.762, 0.661, 0.832 for $k = 0$ to 4 and settles near 0.976, never 1.

### Depth in practice

Two to four layers is typical. In [Lab 3](#lab3), plain GCNs improve up to about four layers (test
accuracy about 0.88 at one, 0.91 at three, 0.94 to 0.96 at four); at 8 and 16 layers they predict
the majority class, "not a single point of failure", for every event: 0.838. A deep plain stack both
smooths its features and trains poorly. Residual updates,
$\mathbf{H} \leftarrow \mathbf{H} + \phi(\hat{\mathbf{A}}\mathbf{H}\mathbf{W})$, restore 16 layers to about 0.95
to 0.97. Normalisation layers and jumping-knowledge connections (the read-out sees every layer) also
help.

A second limit is **over-squashing** (Alon and Yahav 2021): the number of nodes within $r$ hops can
grow exponentially with $r$, and their information must pass through a few edges into one
fixed-width vector, so long-range dependencies suffer even when the depth reaches them.

### What message passing cannot tell apart

The **Weisfeiler–Lehman test** (1-WL) compares graphs by colour refinement: start with one colour,
then repeatedly recolour each node by its colour and the multiset of its neighbours' colours; if the
colour counts ever differ, so do the graphs. Xu et al. (2019) showed that, from identical features, no
message-passing GNN separates graphs that 1-WL cannot, and that the **graph isomorphism network** (GIN),
summing then applying an MLP, reaches that bound. A mean or maximum loses how many neighbours sent
each message; a sum keeps it.

::: worked title="A hexagon and two triangles"
Graph P is one 6-cycle; graph Q is two separate triangles. In both, every node has degree 2. Give
every node the same feature $\mathbf{h}^{(0)}$. Every node receives two identical messages and
computes the same update, so after one layer all twelve nodes hold the same $\mathbf{h}^{(1)}$, and
by induction the same $\mathbf{h}^{(k)}$. For a GCN, $\tilde d = 3$ everywhere,
the non-zero entries of $\hat{\mathbf{A}}$ are $1/3$, and each row of $\hat{\mathbf{A}}\mathbf{X}$ is
$3 \times \tfrac13\,\mathbf{h}^{(0)} = \mathbf{h}^{(0)}$. No readout, after any number of layers,
separates one 6-cycle from two 3-cycles, though one graph is connected and the other is not.
:::

::: figure id=fig-05-20
Two graphs message passing cannot tell apart: a hexagon and two triangles, all nodes the same colour.
Beside each, the node vectors after one and after two rounds of message passing, all identical.
:::

Fixes break the symmetry with structural features (degree, the number of cycles through a node),
positional encodings computed from the graph, or random node identifiers.

### Directed and typed edges

Fault trees are directed, and gates have types. A symmetric $\hat{\mathbf{A}}$ treats a message from
a gate like one from an input, and two hops away mixes in siblings. A **relational GCN**
(Schlichtkrull et al. 2018) gives every edge type and direction its own weight matrix:
$\mathbf{h}_v' = \phi\big(\mathbf{W}_0\mathbf{h}_v + \sum_r \sum_{u \in \mathcal{N}_r(v)} \frac{1}{c_{v,r}}\mathbf{W}_r\mathbf{h}_u\big)$,
with $c_{v,r}$ a normaliser such as the number of $r$-neighbours. In [Lab 3](#lab3) a direction-aware
layer, with separate weights for messages from a node's gate and from its inputs, reaches 0.916, 0.963
and 1.000 at two, three and four layers; the undirected GCN tops out around 0.94 to 0.96.

### Engineering graphs, and whole-graph outputs

Molecular property prediction reads a molecule as its bond graph. Learned simulators on meshes, such
as MeshGraphNets (Pfaff et al. 2021), encode node and edge features (mesh edges carry relative
positions), process them with message-passing blocks, and decode per-node quantities that step a PDE
forward in time; they are trained on a conventional solver's trajectories. System models are graphs
too: a fault tree (events and gates), a GSN safety argument (claims, strategies, evidence), a SysML
model (parts and connectors). A network that reads them as graphs rather than as flattened text is
the natural tool for checking or completing them.

For a label on a whole graph, such as whether a fault tree's top-event probability exceeds a target,
pool the node vectors by sum or mean and apply an MLP. The test set must be other graphs.

::: check
As $k$ grows, what does $\hat{\mathbf{A}}^k\mathbf{X}$ converge to, and what information is left?
:::

::: answer
To $\mathbf{u}_1\mathbf{u}_1^\top\mathbf{X}$ with $\mathbf{u}_1 \propto \tilde{\mathbf{D}}^{1/2}\mathbf{1}$, because every
other eigenvalue of $\hat{\mathbf{A}}$ has magnitude below 1. Every row is one common vector scaled by
$\sqrt{\tilde d_i}$, so only the degree survives.
:::

::: check
Why does Lab 3's direction-aware model beat the GCN on single points of failure?
:::

::: answer
The property depends only on the gates above an event. Separate weights for messages from the gate
and from the inputs let the model pass "every gate above is OR" downward, one level per layer; a
symmetric $\hat{\mathbf{A}}$ mixes that signal with irrelevant information from siblings and inputs.
:::

::: check
In the explorer, set the normalisation to "none". What happens to the feature values, and why?
:::

::: answer
They explode. With propagation matrix $\tilde{\mathbf{A}}$, each step multiplies the features' component
along its top eigenvector by the eigenvalue 3.392: after 8 steps, by $3.392^8 = 1.75 \times 10^4$. The
readout, the largest single feature at $k = 8$, is $1.22 \times 10^4$, smaller because only part of
the one-hot features lies along that eigenvector.
:::
