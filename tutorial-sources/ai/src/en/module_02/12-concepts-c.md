## Normalisation layers {#s10}

[Section 6](#s6) chose the initial weights so that pre-activations start with a sensible scale.
That holds at step 0 only. Training changes the weights, and a pre-activation that drifts to a
large mean or spread pushes its unit into saturation or into the dead region. A **normalisation
layer** re-standardises activations inside the network at every step. Three variants matter; they
differ in which numbers the mean and the spread are taken over (Figure 2.15).

::: figure id=fig-02-15
The same $B\times d$ activation matrix drawn twice as a grid of 6 rows labelled "examples" and 8
columns labelled "features". Left: one column highlighted, captioned "batch norm: $\mu_j$,
$\sigma_j$ over the $B$ examples of feature $j$; running averages at evaluation". Right: one row
highlighted, captioned "layer norm / RMSNorm: statistics over the $d$ features of one example; the
same at training and evaluation", with the note "no mean subtraction" under RMSNorm.
:::

### Batch normalisation

**Batch normalisation** (Ioffe and Szegedy 2015) standardises each feature over the mini-batch.
For a batch of pre-activations $\mathbf{Z} \in \mathbb{R}^{B\times d}$ and one feature $j$,

$$
\begin{aligned}
\mu_{\mathcal{B}} &= \frac{1}{B}\sum_{i=1}^{B} z_{ij}, &
\sigma^2_{\mathcal{B}} &= \frac{1}{B}\sum_{i=1}^{B}\big(z_{ij} - \mu_{\mathcal{B}}\big)^2, \\
\hat z_{ij} &= \frac{z_{ij} - \mu_{\mathcal{B}}}{\sqrt{\sigma^2_{\mathcal{B}} + \epsilon}}, &
y_{ij} &= \gamma_j\,\hat z_{ij} + \beta_j .
\end{aligned}
$$

Each feature of $\hat{\mathbf{Z}}$ has mean 0 and variance just under 1 over the batch. The learned
**gain** $\gamma_j$ (initialised to 1) and **shift** $\beta_j$ (initialised to 0) give back the
freedom the standardisation took away: with $\gamma_j = \sqrt{\sigma^2_{\mathcal{B}} + \epsilon}$ and
$\beta_j = \mu_{\mathcal{B}}$ the layer returns its input, so inserting it removes no function the
network could represent. The constant $\epsilon$, typically $10^{-5}$, keeps the division finite.

Because the mean is subtracted, a constant added to a feature disappears from $\hat z$. The bias
of the layer in front of a batch norm is therefore redundant, and $\beta$ takes over its job; that
is why [Module 03](module_03_EN.html#s10) writes
`bias=False` before every batch norm.

**Training and evaluation.** In training mode the layer uses the current batch's statistics and
also updates running averages,

$$
\mu_{\text{run}} \leftarrow (1 - m)\,\mu_{\text{run}} + m\,\mu_{\mathcal{B}}, \qquad
\sigma^2_{\text{run}} \leftarrow (1 - m)\,\sigma^2_{\text{run}} + m\,\frac{B}{B - 1}\,\sigma^2_{\mathcal{B}} .
$$

In PyTorch the running variance uses the unbiased batch variance, as written, and `momentum=0.1`
is $m$, the weight of the *new* value, the opposite of an optimiser's convention. In evaluation
mode (`model.eval()`) the layer uses $\mu_{\text{run}}$ and $\sigma^2_{\text{run}}$, so one
example's output no longer depends on its batch-mates. Forgetting `model.eval()` is a classic bug
([Lab 5](#lab5)). So is judging a model early in training, when the running averages still lag
fast-changing weights.

::: worked title="Batch norm on one feature, in both modes"
One feature over a batch of four, $\mathbf{z} = (2, 4, 6, 8)$, with $\gamma = 1$, $\beta = 0$.

- $\mu_{\mathcal{B}} = 20/4 = 5$; deviations $(-3, -1, 1, 3)$; $\sigma^2_{\mathcal{B}} = (9 + 1 + 1 + 9)/4 = 5$.
- Training-mode output: deviations divided by $\sqrt{5} = 2.236$, giving
  $(-1.342, -0.447, 0.447, 1.342)$.
- Running statistics, starting from $(0, 1)$ with $m = 0.1$: the mean becomes
  $0.9\cdot 0 + 0.1\cdot 5 = 0.5$; the unbiased variance is $20/3 = 6.667$, so the variance becomes
  $0.9\cdot 1 + 0.1\cdot 6.667 = 1.567$.
- An input of 6 is normalised to 0.447 in training mode, but in evaluation mode to
  $(6 - 0.5)/\sqrt{1.567} = 5.5/1.252 = 4.394$.

After one step the running statistics are far from the data's, and the evaluation output is ten
times the training one. `torch.nn.BatchNorm1d` returns all four numbers:
:::

```python
import torch, torch.nn as nn

bn = nn.BatchNorm1d(1)                           # gamma = 1, beta = 0, momentum = 0.1
z = torch.tensor([[2.0], [4.0], [6.0], [8.0]])   # one feature, a batch of four
y = bn(z)                                        # training mode: batch statistics
print("train out:", [f"{v:.3f}" for v in y.detach().ravel().tolist()])
print(f"running mean {bn.running_mean.item():.3f}, var {bn.running_var.item():.3f}")
bn.eval()                                        # evaluation mode: running statistics
print(f"eval out for 6: {bn(torch.tensor([[6.0]])).item():.3f}")
```

```output
train out: ['-1.342', '-0.447', '0.447', '1.342']
running mean 0.500, var 1.567
eval out for 6: 4.394
```

Normalising over the batch has four consequences. An example's output in training depends on its
batch-mates, which adds noise (a mild regulariser) and invites the bugs above. Small batches give
noisy statistics; below about 16 examples per batch, group norm or layer norm replace it
([Module 03](module_03_EN.html#s10)). Sequences of varying length fit badly, because padding
pollutes the statistics. And a batch of one has zero variance in every feature; in training mode
PyTorch refuses it with `Expected more than 1 value per channel when training`.

::: worked title="A feature with no variance"
If every example in the batch has the value $c$ in feature $j$, then $\mu_{\mathcal{B}} = c$,
$\sigma^2_{\mathcal{B}} = 0$ and $\hat z_{ij} = 0/\sqrt{\epsilon} = 0$ for every $i$: the layer
outputs exactly $\beta_j$: finite thanks to $\epsilon$, but carrying no information. Compare the
always-zero pixels of [Lab 4](#lab4), where input standardisation, which has no $\epsilon$,
produces NaNs unless the zero standard deviation is guarded.
:::

### Why it helps

The original paper credited batch norm with reducing "internal covariate shift", the drift of each
layer's input distribution. Santurkar et al. (2018) challenged that account: networks still trained
well when noise re-created the drift after each batch norm, and the benefit they measured was mainly
a smoother, better-conditioned loss landscape that tolerates larger learning rates.

One exact fact explains much of batch norm's interaction with the optimiser. Let the
weights $\mathbf{W}$ feed a batch norm. Scaling them by $c > 0$ scales $\mathbf{z}$,
$\mu_{\mathcal{B}}$ and $\sigma_{\mathcal{B}}$ by $c$, so $\hat z$ is unchanged (ignoring
$\epsilon$) and $\mathcal{L}(c\mathbf{W}) = \mathcal{L}(\mathbf{W})$. Differentiating both sides
with respect to $\mathbf{W}$,

$$
c\,\nabla\mathcal{L}(c\mathbf{W}) = \nabla\mathcal{L}(\mathbf{W})
\quad\Longrightarrow\quad
\nabla\mathcal{L}(c\mathbf{W}) = \frac{1}{c}\,\nabla\mathcal{L}(\mathbf{W}).
$$

Larger weights receive proportionally smaller gradients, so the relative change of a gradient
step, $\eta\|\nabla\mathcal{L}\|/\|\mathbf{W}\|$, scales as $\eta/\|\mathbf{W}\|^2$: the effective
learning rate depends on the weights' norm. Differentiating $\mathcal{L}(c\mathbf{W})$ with respect
to $c$ at $c = 1$ also gives $\langle\mathbf{W}, \nabla\mathcal{L}\rangle = 0$: the gradient is
orthogonal to $\mathbf{W}$, so plain gradient steps slowly grow $\|\mathbf{W}\|$ and the effective
rate falls. Weight decay on such weights cannot restrict the function, which does not depend on
$\|\mathbf{W}\|$; it mostly keeps the norm small and the effective learning rate high.

### Layer normalisation and RMSNorm

**Layer normalisation** (Ba, Kiros and Hinton 2016) takes the statistics over the $d$ features of
one example instead:

$$
\mu = \frac{1}{d}\sum_{j=1}^{d} z_j, \qquad
\sigma^2 = \frac{1}{d}\sum_{j=1}^{d}(z_j - \mu)^2, \qquad
\mathbf{y} = \boldsymbol{\gamma}\odot\frac{\mathbf{z} - \mu}{\sqrt{\sigma^2 + \epsilon}} + \boldsymbol{\beta}.
$$

It is identical in training and evaluation and independent of the batch, so none of batch norm's
four consequences apply. Recurrent networks and transformers use it.

**RMSNorm** (Zhang and Sennrich 2019) drops the mean subtraction and the shift and divides by the
root mean square:

$$
\mathbf{y} = \boldsymbol{\gamma}\odot\frac{\mathbf{z}}{\sqrt{\operatorname{mean}(\mathbf{z}^2) + \epsilon}} .
$$

It needs one reduction instead of two, works as well in practice, and is what most large language
models use as of 2026; [Module 06](module_06_EN.html#s5) places it in the block (pre-norm against
post-norm). PyTorch provides `nn.BatchNorm1d`, `nn.LayerNorm` and, from version 2.4, `nn.RMSNorm`.

::: worked title="Layer norm and RMSNorm by hand"
$\mathbf{z} = (1, 2, 3, 6)$, $\boldsymbol{\gamma} = \mathbf{1}$, $\boldsymbol{\beta} = \mathbf{0}$,
$\epsilon = 0$.

- Layer norm: mean $12/4 = 3$; deviations $(-2, -1, 0, 3)$; variance $(4 + 1 + 0 + 9)/4 = 3.5$;
  standard deviation $1.871$; output $(-1.069, -0.535, 0, 1.604)$, with mean 0 and variance 1.
- RMSNorm: mean square $(1 + 4 + 9 + 36)/4 = 12.5$; RMS $\sqrt{12.5} = 3.536$; output
  $(0.283, 0.566, 0.849, 1.697)$.

The RMSNorm output has RMS exactly 1 but mean 0.849: it is rescaled, not centred. Both outputs
are what `nn.LayerNorm(4, eps=0, elementwise_affine=False)` and `nn.RMSNorm(4, eps=0)` return.
:::

### The backward pass of a normalisation

Normalisation changes what the gradient can do. Take layer norm with $\boldsymbol{\gamma} = \mathbf{1}$,
$\boldsymbol{\beta} = \mathbf{0}$ and $\epsilon$ ignored, so $\hat z_k = (z_k - \mu)/\sigma$, and
write $\bar{\mathbf{g}} = \partial\mathcal{L}/\partial\mathbf{y}$. The pieces:

- $\partial\mu/\partial z_j = 1/d$.
- $\partial\sigma^2/\partial z_j = \frac{2}{d}\sum_k (z_k - \mu)\big([k = j] - \tfrac{1}{d}\big) = \frac{2}{d}(z_j - \mu)$,
  because the deviations sum to zero; so $\partial\sigma/\partial z_j = (z_j - \mu)/(d\sigma) = \hat z_j/d$.
- By the quotient rule,
  $\dfrac{\partial\hat z_k}{\partial z_j} = \dfrac{[k = j] - 1/d}{\sigma} - \dfrac{z_k - \mu}{\sigma^2}\,\dfrac{\hat z_j}{d} = \dfrac{1}{\sigma}\Big([k = j] - \dfrac{1}{d} - \dfrac{\hat z_k\hat z_j}{d}\Big)$.
- Summing against $\bar g_k$:

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{z}} = \frac{1}{\sigma}\Big(\bar{\mathbf{g}} - \operatorname{mean}(\bar{\mathbf{g}}) - \hat{\mathbf{z}}\,\operatorname{mean}(\bar{\mathbf{g}}\odot\hat{\mathbf{z}})\Big).
$$

Since $\sum_j\hat z_j = 0$ and $\sum_j\hat z_j^2 = d$, this gradient sums to zero and is orthogonal
to $\hat{\mathbf{z}}$. Through a normalisation the layers below cannot change the mean or the scale
of what they send up, only its pattern; $\boldsymbol{\gamma}$ and $\boldsymbol{\beta}$ set scale
and offset. Batch norm's backward pass is the same formula with the means taken over the batch
instead of the features.

::: keyidea
A normalisation layer standardises activations over the batch (batch norm) or over the features of
one example (layer norm, RMSNorm), then lets a learned gain and shift restore any scale; only batch
norm behaves differently in training and evaluation.
:::

::: check
A model with batch norm gives a different prediction for the same input depending on what else is
in the batch. What was forgotten?
:::

::: answer
`model.eval()`. In training mode batch norm normalises with the current batch's mean and variance,
so each example's output depends on its batch-mates; in evaluation mode it uses the fixed running
averages.
:::

::: check
Compute RMSNorm of $(3, 4)$ with $\gamma = 1$ and $\epsilon = 0$.
:::

::: answer
The mean square is $(9 + 16)/2 = 12.5$ and the RMS $\sqrt{12.5} = 3.536$, so the output is
$(3/3.536, 4/3.536) = (0.849, 1.131)$.
:::

::: check
Why can the linear layer in front of a batch norm drop its bias?
:::

::: answer
The mean subtraction removes any constant added to the feature, so the bias has no effect on the
output, and $\beta$ provides the shift instead.
:::

## Regularisation for networks {#s11}

[Module 01, Section 9](module_01_EN.html#s9) treated regularisation as trading variance for bias,
with its strength tuned on the validation set. Networks stretch that picture. They are routinely
over-parameterised ([Lab 4](#lab4) fits 26,122 parameters to 1,078 training images) and still
generalise, partly through the implicit regularisation of SGD noise
([Module 01, Section 4](module_01_EN.html#s4)) and partly through the explicit methods below.

### Weight decay

Weight decay is Module 01's $L_2$ penalty, applied through AdamW so that every weight shrinks by
the same fraction per step whatever its gradient history ([Section 8](#s8)). Typical $\lambda$
runs from $10^{-4}$ to $10^{-1}$, depending on the optimiser and its convention. Biases and
normalisation gains are excluded, and on weights that feed a normalisation layer decay mostly
raises the effective learning rate ([Section 10](#s10)).

### Dropout

**Dropout** (Srivastava et al. 2014) corrupts the hidden units during training. Each unit is
multiplied by an independent mask $m_i \sim \text{Bernoulli}(1 - p)$, which is 0 with probability
$p$, and the survivors are scaled by $1/(1 - p)$, the **inverted** form:

$$
\tilde h_i = \frac{m_i}{1 - p}\,h_i .
$$

At evaluation nothing is dropped or scaled. The scaling is what makes the two modes agree. Taking
the expectation over the mask,

$$
\mathbb{E}[\tilde h_i] = (1 - p)\cdot\frac{h_i}{1 - p} + p\cdot 0 = h_i,
$$

so the next layer sees the same expected input in both modes. For the variance,
$\mathbb{E}[\tilde h_i^2] = (1 - p)\,h_i^2/(1 - p)^2 = h_i^2/(1 - p)$, so

$$
\operatorname{Var}(\tilde h_i) = \frac{h_i^2}{1 - p} - h_i^2 = h_i^2\,\frac{p}{1 - p}:
$$

multiplicative noise, proportional to the unit's own size, with relative variance 1 at $p = 0.5$
and 0.11 at $p = 0.1$. The original formulation multiplied the weights by $1 - p$ at test time
instead; frameworks implement the inverted form, so that evaluation needs no change at all.

::: worked title="Inverted dropout on four units"
$p = 0.5$, $\mathbf{h} = (2.0, 0.5, 1.0, 3.0)$, mask $(1, 0, 1, 0)$. The survivors are scaled by
$1/(1 - 0.5) = 2$: $\tilde{\mathbf{h}} = (4.0, 0, 2.0, 0)$. Each unit survives in half of the 16
masks and is then doubled, so averaged over all masks $\tilde{\mathbf{h}} = \mathbf{h}$. With
$p = 0.1$ the survivors are scaled by $1/0.9 = 1.111$.
:::

Why it works: no unit can be relied on, because any may be missing. Equivalently, training samples
from the $2^n$ thinned networks of an $n$-unit layer, which share weights, and evaluation
approximates their ensemble: exactly, for a single layer feeding a softmax, as the renormalised
geometric mean of their predictions (Hinton et al. 2012); approximately for deeper networks.
Keeping dropout on at test time and averaging many passes gives a cheap uncertainty estimate,
**Monte Carlo dropout** (Gal and Ghahramani 2016).

Typical $p$: up to 0.5 in older MLPs and in AlexNet's fully connected layers; 0.1 in transformers.
Many large language model pretraining runs, as of 2026, use none, because each token is seen about
once ([Module 08](module_08_EN.html)).

### Early stopping

**Early stopping** evaluates the validation loss every epoch, keeps the checkpoint with the lowest
value, and stops after a **patience** of several epochs without improvement; the best weights are
then restored. [Module 01](module_01_EN.html#s9) showed why it regularises: $t$ steps of gradient
descent from zero leave eigen-direction $i$ of a quadratic at
$\big[1 - (1 - \eta\lambda_i)^t\big]\theta^*_i$, close to ridge regression's
$\lambda_i/(\lambda_i + \tau)\cdot\theta^*_i$ with $\tau \approx 1/(\eta t)$, where $\tau$ is the
coefficient of the penalty $(\tau/2)\|\theta\|^2$ (Goodfellow et al. 2016, §7.8): approximately
$L_2$ regularisation whose strength is set by the training time. What is
new for networks is the procedure: checkpoints, patience, and restoring the best weights.

::: worked title="Early stopping in numbers"
With $\eta = 0.01$ and $t = 1{,}000$ steps, the equivalent ridge strength is roughly
$\tau \approx 1/(0.01\cdot 1{,}000) = 0.1$; training ten times longer divides it by ten.
[Lab 4](#lab4) measures the procedure on digits: the validation loss is lowest at epoch 34
(0.1159) while the training loss keeps falling, to 0.002; with a patience of 15 the run stops at
epoch 49 and restores the weights of epoch 34 (Figure 2.16, right).
:::

::: figure id=fig-02-16
Left: a hidden layer of four units during training with $p = 0.5$, two units crossed out and the
two survivors labelled "×2", beside the same layer at evaluation with all four units present and no
scaling. Right: training and validation loss against epoch from Lab 4's run, the training loss
falling to 0.002 and the validation loss flattening near 0.116, with the best epoch (34) marked and
the patience window (epochs 35–49) shaded.
:::

### Calibration and temperature scaling

[Module 01, Section 7](module_01_EN.html#s7) measured calibration and deferred networks to this
module. Networks trained long with cross-entropy tend to be **overconfident**: their top
probability exceeds their accuracy. Label smoothing (below) acts at training time and can overshoot
into underconfidence. **Temperature scaling** (Guo et al. 2017) divides the logits by
one scalar $T > 0$, $\hat{\mathbf{p}} = \softmax(\mathbf{z}/T)$, with $T$ fitted on the validation
set by minimising the negative log-likelihood. Dividing by a positive constant keeps the order of
the logits, so the argmax and the accuracy are untouched; $T > 1$ softens an overconfident model
and $T < 1$ sharpens an underconfident one.

::: worked title="Temperature scaling on Lab 4's model"
Lab 4's network (seed 0, the checkpoint of epoch 34), with $T$ fitted by a grid search over
$[0.05, 5]$ on the validation NLL: $T = 1.27$, so the model is mildly overconfident. The test NLL
falls from 0.148 to 0.132 and accuracy stays at 96.9%. The expected calibration error (top-label
form, 15 equal-width bins, as in Module 01) barely moves, from 0.019 to 0.018: on 360 images it is
too noisy to show so small a correction.

The same network trained with label smoothing 0.1 (below) is *underconfident*: mean top probability
0.864 at 98.1% test accuracy, calibration error 0.117. Its fitted $T = 0.49$ brings the
calibration error to 0.015 and the test NLL from 0.178 to 0.061. One seed each: the 1.1-point
accuracy difference is about 1.2 times the 0.9-point standard error of a single test accuracy
([Section 14](#s14)), not a finding. These numbers come from Lab 4's code with the calibration
extension that its Try-this item 2 describes.
:::

[Module 07](module_07_EN.html#s10) returns to calibration for language models.

### Data augmentation and input noise

Data augmentation adds label-preserving transformations of the training data. For images it is
the single most effective regulariser ([Module 03](module_03_EN.html#s10)). For sensor or tabular
data the options are input noise, and time shifts or scalings to which the label really is
invariant. Training with small Gaussian input noise is equivalent, to first order, to a Tikhonov
penalty on the output's derivatives with respect to the input (Bishop 1995).

### Label smoothing

**Label smoothing** (Szegedy et al. 2016) trains on the softened target
$\mathbf{y}_{\text{LS}} = (1 - \alpha)\mathbf{y} + \alpha/K$, which gives the true class
$1 - \alpha + \alpha/K$ and every other class $\alpha/K$. The cross-entropy gradient with respect
to the logits keeps the form of [Section 3](#s3), $\hat{\mathbf{p}} - \mathbf{y}_{\text{LS}}$.

The reason to do this is the behaviour of hard labels. On separable training data,
$-\ln\hat p_y$ is positive for every finite logit margin and reaches 0 only as the margin goes to
infinity, so the gradient never vanishes and the logits keep growing. With smoothed targets the
cross-entropy $-\sum_k y_{\text{LS},k}\ln\hat p_k$ is minimised at $\hat{\mathbf{p}} = \mathbf{y}_{\text{LS}}$,
where the gradient is zero, and since $z_{\text{true}} - z_{\text{other}} = \ln(\hat p_{\text{true}}/\hat p_{\text{other}})$
for a softmax, the optimal margin is finite:

$$
z_{\text{true}} - z_{\text{other}} = \ln\frac{1 - \alpha + \alpha/K}{\alpha/K}.
$$

::: worked title="Label smoothing with alpha = 0.1 and ten classes"
Targets: $0.9 + 0.01 = 0.91$ for the true class and $0.1/10 = 0.01$ for each other class. The
optimal logit gap is $\ln(0.91/0.01) = \ln 91 = 4.51$.

Take a confident prediction, $\hat p_{\text{true}} = 0.999$ and $0.001/9 = 0.000111$ for each other
class. With hard labels $\delta_{\text{true}} = 0.999 - 1 = -0.001$: the gradient still pushes the
true logit up. With smoothing $\delta_{\text{true}} = 0.999 - 0.91 = +0.089$ and
$\delta_{\text{other}} = 0.000111 - 0.01 = -0.0099$: the gradient pulls the prediction back
towards 0.91.
:::

Label smoothing often improves accuracy and calibration, but can overshoot into underconfidence. It also erases the relative sizes of the wrong-class
probabilities, which knowledge distillation would use (Müller et al. 2019). In PyTorch it is one
argument,
`F.cross_entropy(logits, targets, label_smoothing=0.1)`.

### Above all, more data

A network's variance falls with $N$, and no regulariser substitutes for more data. Every
regulariser also changes the best learning rate, because it changes the gradient: re-tune $\eta$
after adding one.

::: keyidea
Each regulariser changes the gradient in a known way: decay shrinks weights, dropout injects
multiplicative noise whose mean is zero, label smoothing gives the loss a finite optimum; early
stopping limits how far the weights travel, and none of them replaces more data.
:::

::: check
With $p = 0.2$, by what factor are surviving activations scaled during training, and what happens
at evaluation?
:::

::: answer
By $1/(1 - 0.2) = 1.25$, which keeps the expected activation equal to $h_i$. At evaluation nothing
is dropped and nothing is scaled.
:::

::: check
Why do the logits grow without bound under hard-label cross-entropy on separable data, and how
does label smoothing change that?
:::

::: answer
$-\ln\hat p_y$ reaches 0 only as the margin goes to infinity, so the gradient never vanishes and the
margin keeps growing. With smoothing the loss is minimised where $\hat{\mathbf{p}} = \mathbf{y}_{\text{LS}}$,
at the finite margin $\ln\big((1 - \alpha + \alpha/K)/(\alpha/K)\big)$.
:::

## Losses and numerical stability {#s12}

A loss is built from exponentials and logarithms of numbers the network chooses. In exact
arithmetic the formulas of [Module 01, Section 5](module_01_EN.html#s5) are fine. In floating point
$e^z$ overflows for moderately large $z$, a small probability underflows to zero, $\ln 0 = -\infty$,
and a single infinity turns into NaN throughout the network within one step. This section locates
those limits and shows how losses are computed so that they are never reached.

### Floating-point formats

A floating-point number has a sign bit, exponent bits that set its range, and mantissa bits that
set its precision; the machine epsilon, the gap between 1 and the next number, is
$2^{-\text{mantissa bits}}$.

| Format | Sign / exponent / mantissa | Largest | Smallest normal | Smallest subnormal | Epsilon |
|---|---|---|---|---|---|
| fp32 | 1 / 8 / 23 | $3.40\times 10^{38}$ | $1.18\times 10^{-38}$ | $1.4\times 10^{-45}$ | $1.19\times 10^{-7}$ |
| bf16 | 1 / 8 / 7 | $3.39\times 10^{38}$ | $1.18\times 10^{-38}$ | $9.2\times 10^{-41}$ | $7.8\times 10^{-3}$ |
| fp16 | 1 / 5 / 10 | 65,504 | $6.1\times 10^{-5}$ | $6.0\times 10^{-8}$ | $9.8\times 10^{-4}$ |

The values are those reported by `torch.finfo` and `numpy.finfo`. bf16 keeps fp32's eight exponent
bits, and so its range, but has only two to three significant digits; fp16 has three more mantissa
bits but a range that ends at 65,504. Taking logarithms of the largest values, $e^z$ overflows fp32
and bf16 above $z \approx 88.7$ and fp16 above $z = \ln 65{,}504 = 11.09$. In the other direction
$e^{-z}$ falls below the smallest subnormal at $z \approx 103$ in fp32 and $z \approx 16.6$ in fp16,
and is rounded to exactly zero soon after (from about 104 and 17.3).

::: worked title="fp16 overflows at e to the 11.09"
In NumPy, `np.exp(np.float16(11))` returns 59,870, but `np.exp(np.float16(12))` returns `inf`,
because $e^{12} = 162{,}755$ exceeds 65,504 and $\ln 65{,}504 = 11.09$. A logit of 12 is
unremarkable; in fp16 its exponential does not exist.
:::

### The log-sum-exp identity

Every loss over $K$ classes needs $\ln\sum_j e^{z_j}$. For any constant $m$,

$$
\sum_j e^{z_j} = e^{m}\sum_j e^{z_j - m}
\quad\Longrightarrow\quad
\ln\sum_j e^{z_j} = m + \ln\sum_j e^{z_j - m}.
$$

This is Module 01's observation that adding a constant to every logit changes nothing, put to
work. Choose $m = \max_j z_j$. Then every exponent $z_j - m$ is at most 0, so nothing overflows,
and one term equals $e^0 = 1$, so the sum is at least 1 and its logarithm is never $\ln 0$. The
cross-entropy for true class $y$ follows directly:

$$
\ell = -\ln\hat p_y = -\big(z_y - \operatorname{logsumexp}(\mathbf{z})\big) = \operatorname{logsumexp}(\mathbf{z}) - z_y,
\qquad
\operatorname{log\_softmax}(\mathbf{z}) = \mathbf{z} - \operatorname{logsumexp}(\mathbf{z}).
$$

The fused function, `F.cross_entropy` applied to logits, computes the loss this way and its
gradient $\hat{\mathbf{p}} - \mathbf{y}$ from the same stable quantities. Module 01's stable binary
form is the case $K = 2$.

::: worked title="Logits of a thousand"
$\mathbf{z} = (1000, 999, 998)$, target class 0. Naively, $e^{1000}$ is `inf` even in float64, and
$\infty/\infty$ is NaN. Stably, $m = 1000$ and
$\sum_j e^{z_j - m} = 1 + e^{-1} + e^{-2} = 1 + 0.36788 + 0.13534 = 1.50321$, so
$\operatorname{logsumexp}(\mathbf{z}) = 1000 + \ln 1.50321 = 1000.40761$ and the loss is
$1000.40761 - 1000 = 0.40761$. `F.cross_entropy` returns 0.407606.
:::

```python
import torch, torch.nn.functional as F

z = torch.tensor([[1000.0, 999.0, 998.0]])
print(z.exp() / z.exp().sum())                 # by hand: inf / inf
print(f"{F.cross_entropy(z, torch.tensor([0])).item():.6f}")  # logsumexp(z) - z_0

z2 = torch.tensor([0.0, -120.0])
print(torch.log(torch.softmax(z2, dim=0)))     # softmax underflows to 0, then log 0
print(torch.log_softmax(z2, dim=0))            # z - logsumexp(z): finite

logit, target = torch.tensor([17.0]), torch.tensor([0.0])
print(F.binary_cross_entropy(torch.sigmoid(logit), target).item())  # clamped
print(F.binary_cross_entropy_with_logits(logit, target).item())     # correct
```

```output
tensor([[nan, nan, nan]])
0.407606
tensor([0., -inf])
tensor([   0., -120.])
100.0
17.0
```

### Three ways to get it wrong

**Taking the log of a softmax in two steps.** The softmax can underflow to exactly 0 for a very
negative logit, and $\ln 0 = -\infty$ gives an infinite loss and NaN gradients.

::: worked title="Underflow in log of softmax"
$\mathbf{z} = (0, -120)$ in fp32. The softmax needs $e^{-120} = 7.7\times 10^{-53}$, far below
fp32's smallest subnormal ($1.4\times 10^{-45}$), so it is stored as 0 and the softmax is
$(1, 0)$. Its log is $(0, -\infty)$. `log_softmax` computes
$\mathbf{z} - \operatorname{logsumexp}(\mathbf{z}) = (0, -120) - \ln(1 + 7.7\times 10^{-53}) = (0, -120)$,
finite, as the code above prints.
:::

**Applying a softmax before `F.cross_entropy`.** The loss applies log-softmax itself, so the
network's probabilities are treated as logits confined to $[0, 1]$. At best the true class gets
probability 1 and the others 0, and those "logits" give $\hat p_y = e/(e + K - 1)$, so

$$
\ell \;\ge\; -\ln\frac{e}{e + K - 1} = \ln\Big(1 + \frac{K - 1}{e}\Big).
$$

The gradient must also pass through the extra softmax's Jacobian, whose entries are at most
$1/4$ in size, so learning is very slow. Accuracy can still rise, which is what makes this a
common, silent bug.

::: worked title="The softmax-before-cross-entropy floor"
$K = 10$: $\ln(1 + 9/2.71828) = \ln 4.311 = 1.461$. $K = 2$: $\ln(1 + 1/2.71828) = 0.313$.
$K = 100$: 3.622. $K = 1{,}000$: 5.909. [Lab 5](#lab5)'s script A, which has this bug, plateaus at
1.469 on ten digit classes, just above the floor.
:::

**Applying a sigmoid before a binary loss.** `BCEWithLogitsLoss` computes, from the logit,
$\ell = \max(z, 0) - zy + \ln(1 + e^{-|z|})$, which never overflows. A sigmoid followed by
`BCELoss` saturates: in fp32, $1 + e^{-z}$ rounds to exactly 1 once $e^{-z} < 2^{-24}$, that is
from $z = 24\ln 2 \approx 16.64$, so $\sigma(z)$ becomes exactly 1.0 and $\ln(1 - 1) = -\infty$.
PyTorch clamps the logarithm at $-100$, so the loss is silently capped at 100 and its gradient is
wrong.

::: worked title="A saturated sigmoid"
In fp32, $\sigma(16.6) = 0.99999988$ but $\sigma(16.7) = 1.0$ exactly. For $z = 17$ and $y = 0$,
`BCELoss` on $\sigma(z)$ returns 100 (the clamp), while `BCEWithLogitsLoss` returns the correct
$\max(17, 0) - 0 + \ln(1 + e^{-17}) = 17.0$. The gradients with respect to $z$ differ more: 0
through the saturated sigmoid against the correct $\sigma(17) - 0 = 1.0$, so the most wrong
example in the batch teaches nothing.
:::

### Regression losses and reduction

Squared error is the Gaussian negative log-likelihood (Module 01) and punishes outliers
quadratically. The **Huber loss**, $\tfrac12 r^2$ for $|r| \le \delta_{\text{H}}$ and
$\delta_{\text{H}}(|r| - \delta_{\text{H}}/2)$ beyond, has its gradient clipped at
$\pm\delta_{\text{H}}$ and is the usual compromise: with $\delta_{\text{H}} = 1$ (PyTorch's
`delta`) a residual of 3 costs 2.5 instead of 4.5. Absolute error corresponds
to Laplace noise.

The **reduction** matters too. A mean over the batch keeps the gradient's scale independent of
$B$; a sum multiplies the gradient, and so the effective learning rate, by $B$. PyTorch's default
is the mean; stay consistent when changing the batch size.

### Mixed precision, and variances

Mixed precision computes matrix products in bf16 or fp16 but keeps the master weights, softmaxes,
losses and normalisation statistics in fp32; `torch.autocast` chooses the precision per operation.
fp16 also needs **loss scaling**: multiply the loss by $S$ (for example $2^{16}$) before
`backward` and divide the gradients by $S$, so that small gradients do not underflow (Micikevicius
et al. 2018). bf16 has fp32's range and needs none, which is why the first advice for NaN losses
is to use bf16 rather than fp16. [Module 08](module_08_EN.html#s7) covers mixed precision at
scale.

Compute variances as $\operatorname{mean}\big((x - \mu)^2\big)$, never as
$\operatorname{mean}(x^2) - \mu^2$, which subtracts two nearly equal large numbers. In fp32, for
$x = (10000, 10001, 10002)$ the first gives 0.6667 and the second exactly 0.

::: keyidea
Compute losses from logits with fused functions built on log-sum-exp, keep reductions and
statistics in fp32, and know each format's range: fp16 ends at 65,504, about $e^{11}$.
:::

::: check
A 10-class classifier's training loss falls to 1.46 and stops, while its validation accuracy keeps
rising. What do you check first?
:::

::: answer
Whether a softmax is applied before `F.cross_entropy`. With probabilities used as logits the loss
cannot fall below $-\ln\big(e/(e + 9)\big) = 1.46$, yet the argmax, and so the accuracy, can still
improve.
:::

::: check
Why can bf16 hold $e^{80}$ while fp16 cannot hold $e^{12}$?
:::

::: answer
bf16 has fp32's eight exponent bits, so its largest value is about $3.4\times 10^{38}$
($\approx e^{88.7}$) and $e^{80} = 5.5\times 10^{34}$ fits. fp16 has five exponent bits and its
largest value is $65{,}504 \approx e^{11.09}$.
:::

## A complete training loop {#s13}

Every section so far justifies a line of a training loop. This one puts them together: a
loop of about thirty lines trains a two-hidden-layer network to tell the inside of a circle from
the outside of it in a square (a relative of the playground's circles in [Section 1](#s1)), and the table after it says which section each line comes
from, so that the loop can be read rather than copied.

```python
import torch, torch.nn as nn, torch.nn.functional as F

torch.manual_seed(0)
X = torch.rand(2048, 2) * 2 - 1                       # points in the square
T = ((X ** 2).sum(1) < 0.5).long()                    # inside the circle of radius sqrt(0.5)
Xtr, Ttr, Xva, Tva = X[:1536], T[:1536], X[1536:], T[1536:]
mu, sd = Xtr.mean(0), Xtr.std(0)                      # standardise with TRAINING statistics
norm = lambda x: (x - mu) / sd

model = nn.Sequential(nn.Linear(2, 32), nn.GELU(), nn.Linear(32, 32), nn.GELU(),
                      nn.Linear(32, 2))
opt = torch.optim.AdamW(model.parameters(), lr=3e-3, weight_decay=1e-2)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=400)

for epoch in range(400):
    model.train()
    perm = torch.randperm(len(Xtr))
    for i in range(0, len(Xtr), 64):
        idx = perm[i:i + 64]
        loss = F.cross_entropy(model(norm(Xtr[idx])), Ttr[idx])   # on logits
        opt.zero_grad(); loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
    sched.step()
    if epoch % 100 == 99:
        model.eval()
        with torch.no_grad():
            acc = (model(norm(Xva)).argmax(1) == Tva).float().mean()
        print(epoch + 1, round(loss.item(), 4), round(acc.item(), 3))
```

```output
100 0.0069 0.992
200 0.0205 0.996
300 0.0056 0.996
400 0.0107 0.996
```

| Line | Why it is there |
|---|---|
| `torch.manual_seed(0)` | Reproducibility; then report the spread over seeds ([Section 14](#s14)) |
| `Xtr.mean(0), Xtr.std(0)` | Training statistics only, so no leakage ([Module 01, Section 10](module_01_EN.html#s10)) |
| `nn.GELU()` | A smooth ReLU-like activation ([Section 5](#s5)) |
| default `nn.Linear` initialisation | Adequate at this depth ([Section 6](#s6)) |
| `AdamW(..., weight_decay=1e-2)` | Adaptive steps with decoupled decay ([Section 8](#s8)) |
| `CosineAnnealingLR` | Decay to zero so the run settles ([Section 9](#s9)) |
| `F.cross_entropy` on logits | Stable log-sum-exp ([Section 12](#s12)) |
| `opt.zero_grad()` before `backward` | Gradients accumulate otherwise ([Section 4](#s4)) |
| `clip_grad_norm_(..., 1.0)` | A guard against a rare huge step ([Section 9](#s9)) |
| `model.train()`, `model.eval()` | Switch dropout and batch norm ([Sections 10](#s10) and [11](#s11)); this model has neither, but the habit costs nothing |
| `torch.no_grad()` | No graph at evaluation ([Section 4](#s4)) |

Two reading notes. The printed loss is the last mini-batch's loss, which is noisy: it jumps from
0.0069 to 0.0205 between epochs 100 and 200, while the epoch means fall steadily (0.0108, 0.0065,
0.0054, 0.0046). Log the epoch mean. And `T_max` counts `scheduler.step()` calls, here epochs.

::: worked title="What the numbers mean"
Seed 0 takes a few seconds on a laptop CPU and ends at 99.6% validation accuracy. Over seeds 0 to
4 the final validation accuracies are 0.9961, 0.9980, 0.9922, 0.9980 and 1.0000: mean 99.69%,
standard deviation 0.30 points. That spread is what to report, not the best run. The positive
class is 40.7% of the training points (the disc covers $\pi\cdot 0.5/4 = 39.3\%$ of the square).
Logistic regression on the same standardised inputs reaches 59.2% validation accuracy, exactly
the share of the majority class, because a line cannot separate a disc from its complement. That
baseline is what gives 99.7% its meaning. Figure 2.17 shows the two decision boundaries.
:::

::: figure id=fig-02-17
Two panels over the square $[-1, 1]^2$. Left: the 512 validation points coloured by class, the
trained network's decision boundary drawn as the contour $\hat p = 0.5$ (a near-circle) and the
true circle of radius $\sqrt{0.5}$ dashed. Right: the same points with the logistic-regression
boundary (a straight line, or none inside the square) and the note "59.2% = majority class".
:::

The same model as an `nn.Module` subclass: `__init__` creates the layers as attributes, which
registers their parameters, and `forward` composes them. With the same seed it builds exactly the
same weights as the `nn.Sequential` above (1,218 parameters). [Lab 4](#lab4) writes its model this
way, and Module 03's residual block builds on this form.

```python
class CircleNet(nn.Module):
    def __init__(self, width=32):
        super().__init__()                    # must run before layers are assigned
        self.l1 = nn.Linear(2, width)
        self.l2 = nn.Linear(width, width)
        self.out = nn.Linear(width, 2)

    def forward(self, x):                     # called by model(x)
        return self.out(F.gelu(self.l2(F.gelu(self.l1(x)))))
```

::: check
Which line changes if the scheduler is stepped per batch instead of per epoch, and what else must
change?
:::

::: answer
`sched.step()` moves inside the batch loop, and `T_max` becomes the total number of batches,
$400\times 24 = 9{,}600$ (1,536 training points in batches of 64 give 24 batches per epoch).
:::

::: check
The printed loss jumps from 0.0069 at epoch 100 to 0.0205 at epoch 200. Is training going wrong?
:::

::: answer
No. It is a single mini-batch's loss. The epoch mean, which falls from 0.0108 to 0.0065, and the
validation accuracy, which rises from 0.992 to 0.996, are the signals.
:::

## Training dynamics and debugging {#s14}

A misbehaving run rarely says why: a dozen different faults produce a loss that will not fall.
This section turns the symptoms into a diagnosis: tests to run before training, what to log during
it, how to read the curves, how much of a difference is noise, and a checklist.

### Before training: four cheap tests

**1. The initial loss.** Small random weights give logits near zero, so $\hat p_k \approx 1/K$
and the initial cross-entropy is about $-\ln(1/K) = \ln K$: 2.303 for ten classes. A value far
above it means the logits are large and confidently wrong. For regression with a near-zero initial output, the
initial mean squared error is about the mean of the squared targets.

::: worked title="The initial-loss check on digits"
[Lab 4](#lab4)'s network starts at 2.309 against $\ln 10 = 2.303$: as expected. The same network
with every weight drawn from $\mathcal{N}(0, 1)$ instead ([Lab 5](#lab5), script C) starts at 677,
a sign before the first step that the initialisation is wrong ([Section 6](#s6)).
:::

**2. Overfit one batch.** A network with thousands of parameters can memorise 8 to 32 fixed
examples, so any working pipeline drives their loss to near zero within a few hundred steps. If it
cannot, the pipeline is broken, and no amount of data will help.

::: worked title="Overfitting 32 digits"
Lab 4 trains on 32 digits with AdamW at $10^{-3}$ and no weight decay. The loss is 2.31 at step 0,
0.046 at step 50, 0.0037 at step 100 and 0.0012 at step 200: the model, the loss and the optimiser
are wired correctly.
:::

**3. Gradient-check every hand-written or custom component** (below). **4. Look at the data**: a
few inputs with their labels, the class counts, the ranges, any NaNs and any zero-variance
features.

### Gradient checking, done properly

The central difference approximates a derivative by
$\big(\mathcal{L}(\theta + \epsilon_{\text{fd}}) - \mathcal{L}(\theta - \epsilon_{\text{fd}})\big)/(2\epsilon_{\text{fd}})$.
Its error has two parts. Expanding $\mathcal{L}(\theta \pm \epsilon_{\text{fd}})$ in a Taylor
series, the even terms cancel and the **truncation error** is about
$|\mathcal{L}'''|\,\epsilon_{\text{fd}}^2/6$. Each evaluation of $\mathcal{L}$ is also rounded, with
relative error up to the unit roundoff $u$, so the difference is off by up to $2u|\mathcal{L}|$
and, after dividing by $2\epsilon_{\text{fd}}$, the **rounding error** is about
$u|\mathcal{L}|/\epsilon_{\text{fd}}$. The first grows with $\epsilon_{\text{fd}}$ and the second
shrinks. With $|\mathcal{L}'''| \approx |\mathcal{L}| \approx 1$, setting the derivative of
$\epsilon_{\text{fd}}^2/6 + u/\epsilon_{\text{fd}}$ to zero gives
$\epsilon_{\text{fd}}/3 = u/\epsilon_{\text{fd}}^2$, so

$$
\epsilon_{\text{fd}}^{*} = (3u)^{1/3}.
$$

In float64, $u = 1.1\times 10^{-16}$, so $\epsilon_{\text{fd}}^{*} \approx 10^{-5}$ and the
attainable error is about $10^{-11}$. In float32, $u = 6\times 10^{-8}$, so
$\epsilon_{\text{fd}}^{*} \approx 5\times 10^{-3}$ and the error is about $10^{-5}$ even for a
correct gradient. Check in float64.

::: worked title="The error budget in float64"
With $\mathcal{L} \approx 1$: at $\epsilon_{\text{fd}} = 10^{-5}$ the truncation error is about
$(10^{-5})^2/6 = 2\times 10^{-11}$ and the rounding error about $10^{-16}/10^{-5} = 10^{-11}$. At
$\epsilon_{\text{fd}} = 10^{-12}$ the truncation error vanishes but the rounding error is about
$10^{-16}/10^{-12} = 10^{-4}$, millions of times worse. A smaller step is not a better one.
:::

Compare the analytic gradient $a$ with the numerical one $n$ by the per-entry relative error
$|a - n|/\max(10^{-8}, |a| + |n|)$, which localises a bug to a tensor; Module 01's vector form
$\|\mathbf{g}_{\text{num}} - \mathbf{g}\|/\|\mathbf{g}_{\text{num}} + \mathbf{g}\|$ is also a
relative error. Below $10^{-7}$ passes;
$10^{-4}$ or more is a bug unless a kink is involved. ReLU kinks cause false alarms when a
pre-activation lies within $\epsilon_{\text{fd}}$ of zero, because the two evaluations then fall
on different sides of the kink ([Lab 1](#lab1) finds one at $2\times 10^{-7}$). Check several
entries of every tensor. `torch.autograd.gradcheck` does all of this for any
function of double-precision inputs, with defaults `eps=1e-6`, `atol=1e-5` and `rtol=1e-3`:

```python
import torch

def layer(x, W, b):                                  # a custom function to be checked
    return torch.tanh(x @ W + b)

torch.manual_seed(0)
x = torch.randn(4, 3, dtype=torch.float64, requires_grad=True)
W = torch.randn(3, 2, dtype=torch.float64, requires_grad=True)
b = torch.randn(2, dtype=torch.float64, requires_grad=True)
print(torch.autograd.gradcheck(layer, (x, W, b)))    # raises an error if a check fails
```

```output
True
```

### During training: what to log

Log and plot, on shared horizontal axes: the training loss (the epoch mean, on a log scale), the
validation loss and metric every epoch, the learning rate, and the global gradient norm before
clipping, which `clip_grad_norm_` returns. Most stories are visible in those lines. Per layer,
forward hooks record the activation standard deviation and the fraction of dead ReLU units, each
weight's `.grad` gives its gradient norm, and the **update-to-weight ratio** $\|\Delta\theta\|/\|\theta\|$, measured from the actual parameter
change, says how fast the optimiser moves each layer. A common rule of thumb puts it near
$10^{-3}$; under
AdamW at $10^{-3}$, Lab 4 sees about $10^{-2}$ in epoch 1, $1.5$ to $1.8\times 10^{-3}$ at epoch
10 and $2.3$ to $2.6\times 10^{-4}$ at epoch 30, as the cosine schedule lowers $\eta$ and the
shrinking, noisier gradients shorten Adam's steps.

```python norun
stats = {}
def record(name):
    def hook(module, inputs, output):                # runs after each forward pass
        dead = (output <= 0).all(dim=0).float().mean().item()   # zero for every example
        stats[name] = (output.std().item(), dead)
    return hook
for name, m in model.named_modules():
    if isinstance(m, nn.ReLU):
        m.register_forward_hook(record(name))

gnorm = torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # norm before clipping
before = [p.detach().clone() for p in model.parameters()]
opt.step()
ratios = [((p.detach() - q).norm() / q.norm()).item()
          for p, q in zip(model.parameters(), before)]
```

::: worked title="A healthy run, per layer"
Lab 4's monitoring at epochs 1, 10 and 30. Activation standard deviation of the two hidden layers:
0.37/0.22, then 0.62/1.02, then 0.68/1.25. Fraction of dead units: 0/0.008, then 0/0.016, then
0/0.016. Gradient norms of the three weight matrices at the last mini-batch step of the epoch:
0.29/0.35/0.43, then 0.12/0.08/0.16, then 0.015/0.010/0.020. Activations stay of order 1, almost
no units die, and the gradients shrink by a factor of twenty to thirty-five as the loss falls. Nothing needs action: this is a healthy run, the reference
against which a sick one is read.
:::

### Reading the curves

Each shape of the loss curve points to a short list of causes; Figure 2.18 draws four of them.

- **Loss flat from the start.** The learning rate is far too small, or no gradient arrives: a
  backward bug, a detached tensor, dead units, or labels misaligned with their inputs.
- **Loss becomes NaN.** The learning rate is too large, or something overflows
  ([Section 12](#s12)). Lower $\eta$, add warmup, clip, compute from logits, use bf16 not fp16;
  `torch.autograd.set_detect_anomaly(True)` finds the first bad operation.
- **Loss falls, then spikes or climbs.** The learning rate is too high late in training, warmup
  is missing, a batch is bad, or `zero_grad` is missing.
- **Training falls while validation rises.** Overfitting ([Section 11](#s11)).
- **Both plateau high.** Underfitting, or a learning rate that decayed too early: a bigger model, a
  longer schedule.
- **Validation loss below training loss.** Dropout or augmentation active only in training
  (normal), or leakage.
- **Training loss stuck near 1.46 with ten classes.** A softmax before the loss
  ([Section 12](#s12)).
- **Loss falling, accuracy flat.** Class imbalance, or a bug in the metric.

::: figure id=fig-02-18
A 2 × 2 grid of representative training and validation loss curves on logarithmic vertical axes,
each with a thin gradient-norm trace on a twin axis. (a) Healthy: both losses fall, validation
flattens, the gradient norm decays. (b) Learning rate too high: the loss falls, spikes, then
becomes NaN (marked with a cross), the gradient norm spiking first. (c) Overfitting: training
keeps falling while validation turns up at a marked epoch. (d) No learning: flat at
$\ln 10 = 2.30$ with a gradient norm near zero. Each panel is titled with its diagnosis and first
fix.
:::

### Noise in the measurement

A test accuracy $p$ on $n$ examples is a binomial proportion with standard error
$\sqrt{p(1 - p)/n}$: 0.009 for $p = 0.97$ and $n = 360$, so runs one point apart are not
distinguishable. The seed-to-seed spread is separate (Lab 4: $97.28\% \pm 0.36$ over five seeds).
Report both, and the baseline.

::: worked title="The standard error of a test accuracy"
Lab 4, seed 0: 0.9694 on 360 test images. $\sqrt{0.9694\cdot 0.0306/360} = \sqrt{8.24\times 10^{-5}} = 0.0091$,
so the result is $96.9\% \pm 0.9$ points.
:::

### The checklist

1. Look at the data.
2. Standardise with training statistics and guard zero variances.
3. Check shapes through the model, and the targets against the outputs.
4. Check the initial loss.
5. Gradient-check custom code in float64.
6. Overfit one batch.
7. Train while logging loss, validation, learning rate and gradient norm.
8. Watch the per-layer statistics.
9. Compare against a baseline.
10. Evaluate under `model.eval()` and `torch.no_grad()`, touch the test set once, and report its
    standard error and the seed spread.

::: keyidea
Test before training (initial loss near $\ln K$, one batch overfitted, gradients checked in
float64), log the loss, the learning rate and the gradient norm during it, and judge differences
against the standard error and the seed spread.
:::

::: check
A new 10-class model starts training at a loss of 47. What do you suspect before anything else?
:::

::: answer
The initial weights or the output scale are too large, so the logits are large and confidently
wrong. A sensible initialisation starts near $\ln 10 = 2.30$.
:::

::: check
Two configurations score 97.2% and 97.8% on 360 test images. Is the second better?
:::

::: answer
Not shown. The standard error of each is about 0.8 to 0.9 points, larger than the 0.6-point gap,
and the seed-to-seed spread adds more.
:::

::: check
Why compute gradient checks in float64?
:::

::: answer
In float32 the best attainable central-difference accuracy is about $10^{-5}$ even for a correct
gradient, too coarse to separate a bug from rounding. In float64 it is about $10^{-11}$.
:::

## What goes wrong {#wrong}

Each entry gives the symptom as you meet it in a run, its cause, and the fix, with the section or
lab that explains the mechanism. Work through them in the order of [Section 14](#s14)'s checklist
when the symptom is unclear.

### The loss does not fall, or stops too high

**The training loss sits near $\ln K$ from the first step** (2.30 for ten classes). *Cause:* no
gradient reaches the weights: a detached tensor or `requires_grad=False`, every ReLU unit dead,
labels shuffled independently of their inputs, or a learning rate near zero. *Fix:* overfit one
batch of 32; print per-layer gradient norms; check that `loss.grad_fn` is not `None`; look at a few
(input, label) pairs ([Section 14](#s14)).

**The training loss plateaus near 1.46 on a 10-class problem** (0.31 on a 2-class one) while the
accuracy looks reasonable. *Cause:* a softmax is applied before `F.cross_entropy`, so probabilities
are treated as logits and the loss cannot fall below $-\ln\big(e/(e + K - 1)\big)$. *Fix:* pass the
raw logits to the loss ([Section 12](#s12); [Lab 5](#lab5), script A, stalls at 1.469 after 20
epochs).

**A regression loss stalls at exactly the variance of the targets, and the predictions are
constant.** *Cause:* targets of shape `(B,)` against predictions of shape `(B, 1)` broadcast to a
`(B, B)` matrix of differences, whose mean is minimised by predicting the mean. *Fix:* make the
shapes equal with `squeeze` or `unsqueeze`, and treat PyTorch's broadcasting warning as an error
([Section 2](#s2)).

**The final loss jitters from epoch to epoch and ends above the noise floor** ([Lab 3](#lab3):
validation MSE 0.0130 against a floor of 0.0104). *Cause:* a constant learning rate; SGD noise holds
the iterate in a band whose width grows with $\eta$, and the final model is a random point on that
oscillation. *Fix:* decay the learning rate, by cosine or steps, so that the run settles
([Section 9](#s9)).

### The loss explodes

**The initial loss is far above $\ln K$** (677 instead of 2.30 in Lab 5). *Cause:* the initial
weights are too large, $\mathcal{N}(0, 1)$ instead of He or the framework default, so the logits
are huge and confidently wrong. *Fix:* use a variance-preserving initialisation and check the
initial loss before training ([Sections 6](#s6) and [14](#s14)).

**The loss becomes NaN or inf after some steps.** *Cause:* the learning rate is too high, or
something overflows (the exponential of large logits, fp16 above 65,504), takes $\ln 0$ or divides
by a zero standard deviation. *Fix:* lower $\eta$ or add warmup, clip the global gradient norm at
1.0, compute losses from logits, prefer bf16 to fp16, guard divisions; `torch.autograd.set_detect_anomaly(True)`
names the first bad operation ([Section 12](#s12)).

**The loss falls, then rises and wanders, while the gradient norm grows every epoch** (7 to 195 in
Lab 5). *Cause:* `optimizer.zero_grad()` is missing, so `.grad` accumulates across steps and every
step adds all the previous gradients. *Fix:* zero the gradients before every backward pass
([Section 4](#s4)).

### Training and evaluation disagree

**Validation accuracy differs between two evaluations of the same weights, or depends on the
evaluation batch size** (in Lab 5, 94.2% and 93.6% in training mode and 85.5% in batches of 8,
against 96.9% in evaluation mode). *Cause:* `model.eval()` was forgotten, so dropout masks and
batch-norm batch statistics are active. *Fix:* evaluate under `model.eval()` and `torch.no_grad()`,
and call `model.train()` before training resumes ([Sections 10](#s10) and [11](#s11)).

**Batch norm with a batch of one raises `Expected more than 1 value per channel when training`;
with batches of two or four, training is noisy and evaluation disagrees with training.** *Cause:*
batch statistics are undefined or meaningless for tiny batches. *Fix:* use layer norm, RMSNorm or
group norm, or larger batches ([Section 10](#s10)).

**Validation statistics leak into input standardisation, or a constant feature divides by zero**
(four always-zero pixels in `load_digits` give 1,436 NaNs in the validation set). *Cause:* the mean
and standard deviation were computed on the wrong split, or a standard deviation is 0. *Fix:*
compute them on the training split only and replace zero standard deviations by 1
([Lab 4](#lab4)).

### Gradients that are wrong, vanish or are misapplied

**A custom layer or hand-written backward pass "trains", but one part never improves.** *Cause:* a
wrong or missing gradient: a forgotten term, a wrong transpose, a stray `detach`. *Fix:* compare with
central finite differences in float64 (relative error below $10^{-7}$), allowing for ReLU kinks and
near-zero gradients ([Section 14](#s14), [Lab 1](#lab1)).

**A deep plain network, say twenty sigmoid layers, does not train with any optimiser.** *Cause:*
vanishing gradients: every layer multiplies the error by $\sigma' \le 1/4$. *Fix:* change the
architecture, not the optimiser: ReLU-family activations, He initialisation, normalisation,
residual connections ([Sections 3](#s3), [5](#s5) and [10](#s10)).

**Activations shrink to the level of the biases (standard deviation about 0.04) or blow up through
depth at initialisation.** *Cause:* the initial scale does not preserve variance; PyTorch's
`nn.Linear` default, $\mathcal{U}(\pm 1/\sqrt{n_{\text{in}}})$, has weight variance
$1/(3n_{\text{in}})$ and so shrinks a ReLU signal's second moment sixfold per layer. *Fix:* use He
initialisation for deep ReLU stacks and log per-layer activation statistics at step 0
([Section 6](#s6)).

**Weight decay tuned with `Adam(weight_decay=λ)` behaves inconsistently across layers and must be
re-tuned whenever the learning rate changes.** *Cause:* coupled $L_2$: the decay term is added to
the gradient and then divided by $\sqrt{\hat v}$, so it is weak exactly where gradients are large.
*Fix:* use AdamW (decoupled decay) and exclude biases and normalisation gains from decay
([Section 8](#s8)).
