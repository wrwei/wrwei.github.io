## The block: residuals, normalisation and the feed-forward network {#s5}

A transformer layer, or **block**, is two sublayers in sequence: multi-head attention, which moves
information between positions, and a **feed-forward network** (FFN), which transforms it within
each position. Each sublayer reads the residual stream of [Section 4](#s4) through a normalisation
and adds its output back:

$$
\mathbf{X} \leftarrow \mathbf{X} + \operatorname{MHA}\big(\operatorname{Norm}(\mathbf{X})\big),
\qquad
\mathbf{X} \leftarrow \mathbf{X} + \operatorname{FFN}\big(\operatorname{Norm}(\mathbf{X})\big).
$$

This is the **pre-norm** block: the normalisation sits on the branch, before the sublayer. The
original paper put it after the residual addition, on the main path, in the **post-norm** block:

$$
\mathbf{X} \leftarrow \operatorname{Norm}\big(\mathbf{X} + \operatorname{MHA}(\mathbf{X})\big),
\qquad
\mathbf{X} \leftarrow \operatorname{Norm}\big(\mathbf{X} + \operatorname{FFN}(\mathbf{X})\big).
$$

The difference looks cosmetic. It decides whether a deep stack trains without special care, and
pre-norm has been the standard since about 2020 (Figure 6.9).

::: figure id=fig-06-9
Post-norm and pre-norm blocks side by side, drawn bottom to top. Left, post-norm:
$\mathbf{x}$ → attention → circled plus (skip from $\mathbf{x}$) → Norm → FFN → circled plus →
Norm → out, with both Norm boxes interrupting the thick main line. Right, pre-norm: the thick main
line runs straight from $\mathbf{x}$ to the output, labelled "identity path: no Norm on it"; one
branch leaves through Norm into attention and returns at a circled plus, a second leaves through
Norm into the FFN and returns at a second circled plus.
:::

### Why pre-norm trains stably

Follow one position's vector up a pre-norm stack, writing $\mathbf{x}_l$ for the stream entering
sublayer $l$ and $F_l$ for that sublayer. Each step is
$\mathbf{x}_{l+1} = \mathbf{x}_l + F_l(\operatorname{Norm}(\mathbf{x}_l))$. Applied repeatedly
from layer $l$ to the top, layer $L$:

$$
\mathbf{x}_L = \mathbf{x}_l + \sum_{m=l}^{L-1} F_m\big(\operatorname{Norm}(\mathbf{x}_m)\big).
$$

Differentiate with respect to $\mathbf{x}_l$ (every $\mathbf{x}_m$ with $m > l$ depends on
$\mathbf{x}_l$ too, and each term's derivative includes that dependence):

$$
\frac{\partial \mathbf{x}_L}{\partial \mathbf{x}_l} = \mathbf{I} + \sum_{m=l}^{L-1}
\frac{\partial F_m\big(\operatorname{Norm}(\mathbf{x}_m)\big)}{\partial \mathbf{x}_l}.
$$

The gradient of the loss at layer $l$ is $\partial\mathcal{L}/\partial\mathbf{x}_L$ times this
matrix, so through the identity it contains $\partial\mathcal{L}/\partial\mathbf{x}_L$ itself,
whatever the sublayers do. An **identity path** with no weight and no normalisation on it carries
the output gradient to every layer, even at initialisation, when the sublayers are random.

In post-norm, $\mathbf{x}_{l+1} = \operatorname{Norm}(\mathbf{x}_l + F_l(\mathbf{x}_l))$, and the
chain rule gives

$$
\frac{\partial \mathbf{x}_{l+1}}{\partial \mathbf{x}_l} = \mathbf{J}_{\text{Norm}}
\Big(\mathbf{I} + \frac{\partial F_l}{\partial \mathbf{x}_l}\Big),
$$

with $\mathbf{J}_{\text{Norm}}$ the normalisation's Jacobian at that layer's input. The gradient
from the top to layer $l$ passes through $L - l$ such factors. Each divides by the size of a
layer's activations, and a product of many can grow or shrink a great deal. Xiong et al. (2020)
showed that at initialisation the gradients of the parameters near the output of a post-norm
transformer are large and do not shrink with depth, while in pre-norm they shrink as depth grows.
A post-norm model trained at the full learning rate from step one therefore diverges; the
original paper ramped the learning rate up over the first 4,000 steps, a **warmup**
([Module 02, Section 9](module_02_EN.html#s9)). Pre-norm trains with little or none
([Exercise 5](#e5)).

### Normalisation, recalled

[Module 02, Section 10](module_02_EN.html#s10) defines the normalisation layers, with worked
examples and their PyTorch modules. Layer norm subtracts the mean, divides by the standard
deviation and applies a learned scale and shift,
$\operatorname{LayerNorm}(\mathbf{x}) = \boldsymbol{\gamma}\odot(\mathbf{x} - \mu)/\sigma +
\boldsymbol{\beta}$. **RMSNorm** (Zhang and Sennrich 2019) drops the mean subtraction and the
shift, and is cheaper and as good in transformers:

$$
\operatorname{RMSNorm}(\mathbf{x}) = \boldsymbol{\gamma}\odot
\frac{\mathbf{x}}{\sqrt{\tfrac{1}{d}\sum_{j} x_j^2 + \epsilon}}.
$$

This module needs one more property: RMSNorm is **scale-invariant**. For $c > 0$,
$\tfrac1d\sum_j (cx_j)^2 = c^2\cdot\tfrac1d\sum_j x_j^2$, so

$$
\operatorname{RMSNorm}(c\,\mathbf{x}) =
\boldsymbol{\gamma}\odot\frac{c\,\mathbf{x}}{\sqrt{c^2\,\tfrac1d\sum_j x_j^2 + \epsilon}} =
\boldsymbol{\gamma}\odot\frac{\mathbf{x}}{\sqrt{\tfrac1d\sum_j x_j^2 + \epsilon/c^2}}
\approx \operatorname{RMSNorm}(\mathbf{x})
$$

when $\epsilon$ is negligible. Each sublayer of a pre-norm block reads only the *direction* of
the residual stream, never its size.

### What pre-norm costs

Nothing ever normalises the stream itself. Every sublayer adds to it, so in a deep pre-norm model
its norm tends to grow with depth, and a write of a given size turns a long stream less than a
short one.

::: worked title="The same write, on a short stream and a long one"
Take a stream of root-mean-square (RMS) size 1, and another pointing the same way grown to RMS 8.
By scale invariance both hand their sublayers the same normalised input, so the sublayer computes
the same update. Suppose it has RMS 1 and is orthogonal to the stream.

1. Short stream: perpendicular sides in the ratio $1 : 1$, so the stream turns by
   $\arctan(1/1) = 45°$.
2. Long stream: ratio $1 : 8$, so it turns by $\arctan(1/8) = 7.1°$.

The next RMSNorm passes on only the direction, so the same write moves the grown stream about six
times less ($45/7.1 = 6.3$). Later layers have less leverage on a grown stream unless they learn
larger outputs.
:::

Two measures follow. A final normalisation sits after the last block, before the unembedding
(`self.norm` in the code of [Section 12](#s12)); without it the logits would scale with the
stream's size. And GPT-2 (Radford et al. 2019) scales the initial weights of the layers that
write into the stream by $1/\sqrt{N}$, $N$ the number of residual layers: $N$ independent writes
of variance $\sigma^2$ add $N\sigma^2$, and dividing each write's variance by $N$ keeps the total
at $\sigma^2$ whatever the depth.

### The feed-forward network

The FFN is applied to each position independently. Written for one position's vector as a
column, as `nn.Linear` stores it,

$$
\operatorname{FFN}(\mathbf{x}) = \mathbf{W}_2\,\phi(\mathbf{W}_1\mathbf{x}), \qquad
\mathbf{W}_1 \in \R^{d_{\text{ff}}\times d},\quad \mathbf{W}_2 \in \R^{d\times d_{\text{ff}}},
$$

with $\phi$ a nonlinearity (ReLU in the original, GELU in BERT and GPT-2) and inner width
$d_{\text{ff}} = 4d$ in the original: $2 \times d \times 4d = 8d^2$ parameters per layer, twice
the attention's $4d^2$. Attention moves information between positions; the FFN transforms it
within a position.

**The FFN as a key-value memory.** Entry $i$ of $\mathbf{W}_1\mathbf{x}$ is
$\mathbf{k}_i\cdot\mathbf{x}$, with $\mathbf{k}_i$ the $i$-th row of $\mathbf{W}_1$, and
$\mathbf{W}_2\mathbf{a} = \sum_i a_i\mathbf{v}_i$, with $\mathbf{v}_i$ the $i$-th column of
$\mathbf{W}_2$. Together:

$$
\operatorname{FFN}(\mathbf{x}) = \sum_{i=1}^{d_{\text{ff}}} \phi(\mathbf{k}_i\cdot\mathbf{x})\,
\mathbf{v}_i .
$$

Each hidden unit is a memory slot: it fires when the input matches its key and adds its value
direction to the stream in proportion. Unlike attention, the keys and values are parameters, and
$\phi$ is not normalised across slots, so any number can fire at once (Figure 6.10). Geva et al.
(2021) found keys in trained language models that respond to recognisable input patterns, shallow
in the lower layers and more semantic in the upper ones, and values that raise the probability of
tokens plausibly following those patterns. Meng et al. (2022) located the recall of facts about
an entity in mid-layer FFNs and edited single facts by changing one FFN's weights. Knowledge
*appears* to be stored in the FFNs: an empirical reading of trained models, not a design.

::: figure id=fig-06-10
The FFN as a key-value memory. Left: an input $\mathbf{x}$ (a column of $d$ cells) is compared
with six key rows $\mathbf{k}_1, \dots, \mathbf{k}_6$ standing for all $d_{\text{ff}}$; the six
dot products pass through $\phi$, some coming out zero, some positive; each scales its value
column $\mathbf{v}_i$, and the scaled values are summed into the output. Right: the SwiGLU
variant, branches $\mathbf{W}_1\mathbf{x}$ → SiLU and $\mathbf{W}_3\mathbf{x}$ meeting at an
elementwise multiply, then $\mathbf{W}_2$. Inset: $\operatorname{SiLU}(z)$ for $z$ from $-3$ to 3.
:::

### SwiGLU

Current models use a gated FFN (Shazeer 2020):

$$
\operatorname{FFN}_{\text{SwiGLU}}(\mathbf{x}) =
\mathbf{W}_2\big(\operatorname{SiLU}(\mathbf{W}_1\mathbf{x})\odot\mathbf{W}_3\mathbf{x}\big),
\qquad \operatorname{SiLU}(z) = z\,\sigma(z),
$$

with $\sigma$ the logistic sigmoid ([Module 02, Section 5](module_02_EN.html#s5) compares SiLU
with ReLU and GELU). Unit $i$ computes
$\operatorname{SiLU}(\mathbf{k}_i\cdot\mathbf{x})\,(\mathbf{u}_i\cdot\mathbf{x})$, with
$\mathbf{u}_i$ the $i$-th row of $\mathbf{W}_3$: a gate times a linear branch that can take
either sign, so each unit can switch its output on, off or negative depending on the input.
Shazeer compared gated variants at matched parameters and compute and reported lower held-out
log-perplexity for them than for ReLU or GELU FFNs, offering "no explanation as to why these
architectures seem to work". The result is empirical, and has held up across many models since.

Three matrices make the count $3\,d\,d_{\text{ff}}$; keeping $8d^2$ requires
$d_{\text{ff}} = \tfrac83 d$.

::: worked title="SwiGLU width in a real model"
At $d = 4{,}096$:

1. $\tfrac83 \times 4{,}096 = 10{,}922.7$.
2. Rounded up to a multiple of 256, which suits the hardware: $43 \times 256 = 11{,}008$, the
   $d_{\text{ff}}$ of Llama-2-7B.
3. Parameters per layer: $3 \times 4{,}096 \times 11{,}008 = 135{,}266{,}304$, or 135.3M.
4. A GELU FFN at $4d = 16{,}384$: $2 \times 4{,}096 \times 16{,}384 = 134{,}217{,}728$, or 134.2M.

The rounding costs 0.8% more parameters; otherwise the swap is like for like.
:::

::: keyidea
Pre-norm leaves an identity path from the loss to every layer, which is why deep stacks train;
the price is a residual stream that grows unnormalised and needs a final norm before the output.
:::

::: check
Where must a pre-norm model put one extra normalisation, and why?
:::

::: answer
After the last block, before the unembedding. The residual stream itself is never normalised in
a pre-norm model, so without the final norm the logits would scale with the stream's size.
:::

::: check
Why does SwiGLU use $d_{\text{ff}}$ of about $8d/3$ rather than $4d$?
:::

::: answer
It has three $d \times d_{\text{ff}}$ matrices instead of two. With $d_{\text{ff}} = 8d/3$ the
count is $3 \times d \times \tfrac83 d = 8d^2$, the same as the two-matrix FFN at $4d$.
:::

## Position {#s6}

Attention as defined so far has no notion of order. Permute the input rows with a permutation
matrix $\mathbf{P}$. The projections act row by row, so the queries, keys and values become
$\mathbf{P}\mathbf{Q}$, $\mathbf{P}\mathbf{K}$ and $\mathbf{P}\mathbf{V}$, and the scores
$\mathbf{P}\mathbf{Q}\mathbf{K}^\top\mathbf{P}^\top$, the old scores relabelled. The row-wise
softmax commutes with the relabelling and $\mathbf{P}^\top\mathbf{P} = \mathbf{I}$, so the
output is $\mathbf{P}$ times the old output: unmasked attention is **permutation-equivariant**
([Exercise 4](#e4) gives the full proof). With per-position FFNs and norms, so is the stack: "the
valve isolates the pump" is processed as a shuffle of "the pump isolates the valve".

The causal mask breaks the symmetry partly: position $t$ sees exactly $t$ tokens, so a uniform
head returns $\mathbf{v}_1$ at position 1 and an average of 100 values at position 100. Haviv et
al. (2022) found that decoder-only models with no positional encoding still learn position this
way. The schemes below inject order deliberately: a vector added once to the input (absolute
position), or a change inside every attention layer that makes the score depend on the offset
(relative position).

### Sinusoidal encodings

The original transformer adds a fixed vector to the token embedding of position $t$, once, at the
input:

$$
PE(t, 2i) = \sin(t\,\omega_i), \qquad PE(t, 2i+1) = \cos(t\,\omega_i), \qquad
\omega_i = 10000^{-2i/d}, \quad i = 0, \dots, d/2 - 1.
$$

Each pair of dimensions is a sinusoid at one frequency, from $\omega_0 = 1$ (a wavelength of
$2\pi \approx 6.3$ positions) down geometrically towards $1/10000$ (a wavelength approaching
$2\pi\times 10{,}000$). Fast pairs distinguish neighbours; slow pairs place a token on a coarse
scale, as the hands of a clock do (Figure 6.11).

::: figure id=fig-06-11
Heat map of the sinusoidal encodings $PE(t, j)$ for $d = 64$: position $t = 0, \dots, 127$ on the
vertical axis, dimension $j = 0, \dots, 63$ on the horizontal axis, on a diverging colour scale
from $-1$ to $1$. The left-hand dimensions (high frequency) form rapid stripes; towards the right
the frequency falls and the stripes widen into slow bands.
:::

The design has a property the paper states without proof: the encoding of $t + k$ is a linear
function of the encoding of $t$. The angle-addition formulas give it:

$$
\begin{aligned}
\sin((t+k)\omega) &= \sin(t\omega)\cos(k\omega) + \cos(t\omega)\sin(k\omega), \\
\cos((t+k)\omega) &= \cos(t\omega)\cos(k\omega) - \sin(t\omega)\sin(k\omega),
\end{aligned}
$$

so, pair by pair,

$$
\begin{pmatrix}\sin((t+k)\omega)\\ \cos((t+k)\omega)\end{pmatrix} =
\begin{pmatrix}\cos k\omega & \sin k\omega\\ -\sin k\omega & \cos k\omega\end{pmatrix}
\begin{pmatrix}\sin(t\omega)\\ \cos(t\omega)\end{pmatrix}.
$$

Stacking one such $2\times2$ rotation per pair gives $PE(t+k) = \mathbf{M}_k\,PE(t)$, with a
matrix $\mathbf{M}_k$ that depends on the offset $k$ and not on $t$. A layer can therefore learn
to attend "$k$ positions back" with one linear map that works at every position.

::: worked title="Sinusoidal encodings at d = 4"
With $d = 4$ the frequencies are $\omega_0 = 10000^{0} = 1$ and
$\omega_1 = 10000^{-2/4} = 0.01$.

1. $PE(0) = (\sin 0, \cos 0, \sin 0, \cos 0) = (0, 1, 0, 1)$.
2. $PE(1) = (\sin 1, \cos 1, \sin 0.01, \cos 0.01) = (0.841, 0.540, 0.010, 1.000)$.
3. $PE(2) = (\sin 2, \cos 2, \sin 0.02, \cos 0.02) = (0.909, -0.416, 0.020, 1.000)$.

Check the shift with $k = 1$ on the first pair, $\omega = 1$:

$$
\begin{pmatrix}\cos 1 & \sin 1\\ -\sin 1 & \cos 1\end{pmatrix}
\begin{pmatrix}0.841\\ 0.540\end{pmatrix}
= \begin{pmatrix}0.540\times0.841 + 0.841\times0.540\\ -0.841\times0.841 + 0.540\times0.540\end{pmatrix}
= \begin{pmatrix}0.909\\ -0.416\end{pmatrix},
$$

the first pair of $PE(2)$. The same matrix takes the first pair of $PE(t)$ to that of $PE(t+1)$
for every $t$.
:::

### Learned absolute positions

GPT-2 and BERT instead train one vector per position, a table with a row for each position up to
the training length: in GPT-2 (smallest size) $1{,}024 \times 768 = 786{,}432$ parameters; in BERT,
512 rows. Beyond the training length there is nothing: position 1,025 has no row in GPT-2's
table, and a table made longer than the training sequences has rows that were never trained.
Learned absolute positions cannot extrapolate ([Exercise 7](#e7)).

### Rotary position embedding

**Rotary position embedding** (RoPE, Su et al. 2021) is what current models use. It adds nothing
to the input. Inside every attention layer, after the projections, it pairs the dimensions of
each query and key, $(q_{2i}, q_{2i+1})$, and rotates each pair by an angle proportional to the
position:

$$
\begin{pmatrix} q'_{2i}\\ q'_{2i+1}\end{pmatrix} =
\begin{pmatrix}\cos t\theta_i & -\sin t\theta_i\\ \sin t\theta_i & \cos t\theta_i\end{pmatrix}
\begin{pmatrix} q_{2i}\\ q_{2i+1}\end{pmatrix},
\qquad \theta_i = 10000^{-2i/d_k}, \quad i = 0, \dots, d_k/2 - 1,
$$

with the query at position $t$; a key at position $s$ is rotated by $s\theta_i$ in the same way.
The values are not rotated.

**The proof that only the offset matters.** Represent a pair as a complex number,
$z = x_{2i} + \mathrm{i}\,x_{2i+1}$. Two facts do the work.

1. *The 2D dot product is the real part of a product with a conjugate.* For pairs $a$ and $b$,
   $a\,\overline{b} = (a_x + \mathrm{i}a_y)(b_x - \mathrm{i}b_y) = (a_xb_x + a_yb_y) +
   \mathrm{i}(a_yb_x - a_xb_y)$, so $\operatorname{Re}(a\,\overline{b}) = a_xb_x + a_yb_y$.
2. *Rotation by $\varphi$ is multiplication by $e^{\mathrm{i}\varphi}$.*
   $(x + \mathrm{i}y)(\cos\varphi + \mathrm{i}\sin\varphi) = (x\cos\varphi - y\sin\varphi) +
   \mathrm{i}(x\sin\varphi + y\cos\varphi)$, which is the matrix above.

So pair $i$ contributes to the score

$$
\operatorname{Re}\Big(z_q e^{\mathrm{i}t\theta_i}\;\overline{z_k e^{\mathrm{i}s\theta_i}}\Big)
= \operatorname{Re}\Big(z_q\,\overline{z_k}\;e^{\mathrm{i}t\theta_i}e^{-\mathrm{i}s\theta_i}\Big)
= \operatorname{Re}\Big(z_q\,\overline{z_k}\;e^{\mathrm{i}(t-s)\theta_i}\Big),
$$

using $\overline{e^{\mathrm{i}\varphi}} = e^{-\mathrm{i}\varphi}$. The right-hand side depends on
the positions only through $t - s$. Summing over the $d_k/2$ pairs, $\mathbf{q}'_t\cdot\mathbf{k}'_s$
depends only on $\mathbf{q}$, $\mathbf{k}$ and $t - s$: relative position enters the score with no
parameters (Figure 6.12). [Exercise 6](#e6) gives the same proof in matrix form.

::: figure id=fig-06-12
RoPE as rotation, for one dimension pair, in two unit-circle panels. Panel 1: the query arrow
rotated to angle $t\theta$ and the key arrow rotated to angle $s\theta$ for $t = 3$, $s = 1$, with
the angle between them marked $(t - s)\theta$. Panel 2: the same for $t = 8$, $s = 6$; both arrows
have moved round the circle, and the angle between them is unchanged. A label under the panels
reads "the score sees only the difference".
:::

::: worked title="RoPE on one pair"
Take $d_k = 2$, so there is one pair with $\theta_0 = 10000^{0} = 1$, and $\mathbf{q} = (1, 0)$,
$\mathbf{k} = (0, 1)$.

1. Rotated query at $t$: $(\cos t - 0, \sin t + 0) = (\cos t, \sin t)$.
2. Rotated key at $s$: $(0 - \sin s, 0 + \cos s) = (-\sin s, \cos s)$.
3. Score: $-\cos t\sin s + \sin t\cos s = \sin(t - s)$.

So $(t, s) = (3, 1)$ gives $\sin 2 = 0.909$; $(7, 5)$ gives the same $0.909$; $(1, 3)$ gives
$\sin(-2) = -0.909$; $(5, 5)$ gives 0. Equal offsets, equal scores. The sign of $t - s$ matters
because $\mathbf{q} \neq \mathbf{k}$: RoPE encodes direction as well as distance.
:::

::: widget name=rope-explorer
Switch on "lock offset" and drag $t$: every dial turns, the angle between each dial's arrows
stays fixed, and the two readout scores stay equal. The first dials spin; the last hardly move.
Raise the base to 500,000 and watch the score curve flatten, then choose an extension method and
compare the wavelength bars with their ghosts.
:::

### What the frequencies do

RoPE has no parameters, and values are not rotated, because position should change where a
query looks, not what is carried back. Rotations are orthogonal, so the norms of $\mathbf{q}$
and $\mathbf{k}$, and the scale of the scores, are unchanged. Fast pairs (small $i$) encode fine
position; slow pairs, coarse position.

::: worked title="Two pairs, fast and slow"
$d_k = 4$ and base 10,000 give $\theta_0 = 1$ and $\theta_1 = 10000^{-2/4} = 0.01$. Take
$\mathbf{q} = \mathbf{k} = (1, 0, 1, 0)$, so each pair is $z = 1$ and $z_q\overline{z_k} = 1$;
pair $i$ contributes $\cos(\Delta\theta_i)$ at offset $\Delta = t - s$, and

$$
\text{score}(\Delta) = \cos\Delta + \cos(0.01\,\Delta).
$$

$\Delta = 0$: $1 + 1 = 2.000$. $\Delta = 1$: $0.540 + 1.000 = 1.540$. $\Delta = 2$:
$-0.416 + 1.000 = 0.584$. $\Delta = 10$: $-0.839 + 0.995 = 0.156$. $\Delta = 100$:
$0.862 + 0.540 = 1.403$. $\Delta = 300$: $-0.022 - 0.990 = -1.012$.

The fast pair repeats every 6.3 tokens; the slow pair varies over hundreds. Together they
resolve both near and far offsets.
:::

With many pairs the fast oscillations cancel on average, and for aligned $\mathbf{q}$ and
$\mathbf{k}$ the score decays, with ripples, as the offset grows: the **long-term decay** of Su
et al.

::: worked title="Long-term decay at d_k = 128"
Take $\mathbf{q} = \mathbf{k}$ = all ones, $d_k = 128$, base 10,000. Each pair is $z = 1 + \mathrm{i}$,
so $z_q\overline{z_k} = (1+\mathrm{i})(1-\mathrm{i}) = 2$ and pair $i$ contributes
$2\cos(\Delta\theta_i)$. At $\Delta = 0$ the 64 pairs give $128$. Dividing by 128, the normalised
score is $0.970$ at $\Delta = 1$, $0.620$ at 16, $0.333$ at 128, $0.204$ at 1,024 and $-0.053$ at
4,096. [Lab 2](#lab2) computes the whole curve. With base 500,000 the decay is slower: the same
calculation gives $0.383$ at 4,096.
:::

::: figure id=fig-06-13
RoPE score against offset: the normalised score $\mathbf{q}'\cdot\mathbf{k}'/128$ (its value at
offset 0 is 1) for $\mathbf{q} = \mathbf{k}$ = all ones and $d_k = 128$, plotted against $\Delta$
on a logarithmic axis from 1 to 16,384. Solid line: base 10,000; dashed line: base 500,000; a
horizontal reference line at 0. Data from Lab 2.
:::

The slow end matters for long contexts. Pair $i$ completes a rotation every $2\pi/\theta_i$
tokens, its **wavelength**. At $d_k = 128$ and base 10,000 the wavelengths run from
$2\pi/1 = 6.28$ tokens for pair 0 to $2\pi \times 10000^{126/128} = 54{,}410$ tokens for pair 63.
Eighteen of the 64 pairs (46 to 63) have a wavelength longer than 4,096 tokens, so a model
trained at 4,096 tokens never sees them complete a rotation. These are the pairs that meet
unfamiliar angles when the context is extended.

### ALiBi

**ALiBi** (attention with linear biases; Press et al. 2022) uses no position vectors at all. Head
$h$ adds a fixed penalty proportional to the distance to every score:

$$
S_{ts} = \frac{\mathbf{q}_t\cdot\mathbf{k}_s}{\sqrt{d_k}} - m_h\,(t - s), \qquad s \le t.
$$

The slopes $m_h$ form a geometric sequence, for 8 heads $\tfrac12, \tfrac14, \dots, \tfrac1{256}$.
Large-slope heads become local; small-slope heads can see far (Figure 6.14).

::: worked title="ALiBi penalties"
Eight heads, slopes $2^{-1}$ to $2^{-8}$. Subtracting a penalty from a score multiplies that
key's unnormalised weight by $e^{-\text{penalty}}$.

1. Distance 100, head 1 ($m = 1/2$): penalty 50, factor $e^{-50} \approx 2\times10^{-22}$. The key
   is invisible.
2. Distance 100, head 8 ($m = 1/256$): penalty $100/256 = 0.39$, factor $e^{-0.39} = 0.68$. The key
   is barely discounted.
3. Distance 1,000, head 8: penalty $3.9$, factor $e^{-3.9} = 0.020$.

Even in the most far-sighted head, a key 1,000 tokens back needs a raw score 3.9 higher to
compete with a near one.
:::

::: figure id=fig-06-14
ALiBi biases. Left: the $12\times12$ bias matrix for slope $1/2$, the lower triangle shaded by
$-m(t - s)$, from 0 on the diagonal to $-5.5$ in the bottom-left corner, and the upper triangle
masked. Right: bias against distance from 0 to 100 as eight straight lines for the slopes
$1/2, 1/4, \dots, 1/256$, on a vertical axis from $-50$ to 0.
:::

ALiBi extrapolates beyond its training length because the bias is defined at every distance and
the long distances are penalised so heavily that they change little. That is also its price: the
recency bias is built in, and a distant token can never count as much as a near one with an
equal score.

### Extending a trained context

A RoPE model run beyond its training length degrades, because the slow pairs meet angles they
never saw. Three remedies follow, as concepts, with extension factor
$\kappa = L_{\text{target}} / L_{\text{train}}$ ($\kappa$, because $s$ is the key position).

**Position interpolation** (Chen et al. 2023) divides every position by $\kappa$. All angles
$t\theta_i/\kappa$ then stay inside the range seen in training, and a short fine-tuning run adapts
the model. The cost is resolution: neighbouring tokens now differ by $\theta_i/\kappa$ in every
pair, fast ones included, so fine position is blurred.

**NTK-aware scaling** (proposed informally in 2023; the YaRN paper documents it) raises the base
instead, so that the slowest pair is slowed by exactly $\kappa$ and the fastest not at all. The slowest frequency is $\theta_{\text{last}} = b^{-(d_k-2)/d_k}$. Requiring
$b'^{-(d_k-2)/d_k} = b^{-(d_k-2)/d_k}/\kappa$ and raising both sides to the power
$-d_k/(d_k-2)$ gives

$$
b' = b\,\kappa^{d_k/(d_k-2)},
$$

while $\theta_0 = b'^{0} = 1$ is unchanged. The pairs in between are slowed by factors between 1
and $\kappa$: $\theta'_i = \theta_i\,\kappa^{-2i/(d_k-2)}$.

::: worked title="An NTK-aware base"
$\kappa = 4$, $d_k = 128$, $b = 10{,}000$: $b' = 10{,}000 \times 4^{128/126} = 10{,}000 \times
4.089 = 40{,}890$. Pair 63's frequency falls by exactly 4, pair 0's not at all, and pair 32's by
$4^{64/126} = 2.02$.
:::

**YaRN** (Peng et al. 2024) treats the pairs by wavelength: pairs whose wavelength exceeds the
trained context are interpolated by $\kappa$, fast pairs are left alone, a ramp joins the two,
and a small temperature is applied to the attention logits. Models now also train with a large
base from the start: Llama 3 uses 500,000 (Grattafiori et al. 2024). [Module 07, Section
9](module_07_EN.html#s9) discusses the context window as a user meets it, and [Module 08, Section
14](module_08_EN.html#s14) long-context mid-training.

::: figure id=fig-06-15
Context extension seen through wavelengths. One bar per RoPE pair $i = 0, \dots, 63$
($d_k = 128$), its height $\log_{10}$ of the wavelength $2\pi/\theta_i$, with horizontal lines at
4,096 ("trained context") and 16,384 ("target context"). Three markers per bar: original (base $10^4$);
position interpolation with $\kappa = 4$, every bar raised by $\log_{10}4$; NTK-aware base 40,890,
slow bars raised by up to $\log_{10}4$, fast bars unchanged. A note: YaRN raises only the bars
above the trained-context line.
:::

::: keyidea
RoPE rotates each pair of query and key dimensions by an angle proportional to position, so the
score depends only on the offset; the slow pairs, which never complete a rotation in training,
are where a longer context goes wrong and where extension methods intervene.
:::

::: check
Why are the values not rotated?
:::

::: answer
Position should change where a query looks, not what is carried back. Rotating the values would
make the output depend on the absolute position of each key.
:::

::: check
A model trained at 4,096 tokens with base 10,000 is run at 16,384. Which pairs see angles they
never saw in training?
:::

::: answer
The slow pairs whose wavelength exceeds 4,096 tokens: 18 of the 64 at $d_k = 128$, pairs 46 to
63. The faster pairs completed whole rotations in training and so met every angle.
:::

::: check
Which ALiBi head behaves most like a local window?
:::

::: answer
The one with the largest slope, $1/2$: a key 20 tokens back is already discounted by $e^{-10}$.
:::

## Three shapes of model {#s7}

The same block can be wired three ways. The three shapes differ in which positions may attend to
which, and in what they are trained to predict, and their attention masks tell them apart most
cleanly: a full square for an encoder, a lower triangle for a decoder, a full rectangle for the
cross-attention that joins the two (Figure 6.16).

::: figure id=fig-06-16
Three columns titled "encoder-only (BERT)", "decoder-only (GPT)" and "encoder-decoder (T5, the
original)". Each shows a block stack and beneath it its attention mask or masks as $6\times6$
grids with the allowed cells filled: the encoder's full square; the decoder's lower triangle; and
for the encoder-decoder, the encoder's full square, the decoder's lower triangle and the
cross-attention's full $5\times6$ rectangle (five decoder queries by six encoder keys). Under each
column, its training objective in one line: "fill in masked tokens", "predict the next token",
"map input to output text". An inset shows the prefix-LM mask over six positions: full over the
first three, causal after.
:::

### Encoder-decoder

The original transformer, and later T5, have two stacks. An **encoder** reads the input with
bidirectional attention: every position sees every other. A **decoder** generates the output with
causal self-attention and, in each layer, a **cross-attention** sublayer that reads the encoder's
final states $\mathbf{H}_{\text{enc}} \in \R^{T_{\text{enc}}\times d}$:

$$
\mathbf{Q} = \mathbf{X}_{\text{dec}}\mathbf{W}_Q, \qquad
\mathbf{K} = \mathbf{H}_{\text{enc}}\mathbf{W}_K, \qquad
\mathbf{V} = \mathbf{H}_{\text{enc}}\mathbf{W}_V .
$$

The queries come from the decoder, the keys and values from the encoder, and the scores have
shape $(B, h, T_{\text{dec}}, T_{\text{enc}})$. Cross-attention has no causal mask, because the
whole input is known before decoding starts; it needs only a padding mask on the encoder
positions. The encoder's $\mathbf{K}$ and $\mathbf{V}$ are computed once per input and reused at
every decoding step. A decoder layer has three sublayers, self-attention ($4d^2$),
cross-attention ($4d^2$) and the FFN ($8d^2$), so $16d^2$ parameters against an encoder layer's
$12d^2$. The shape suits tasks that map one text to another: translation, summarisation.

::: worked title="Counting the original base model"
Vaswani et al.'s base model has $d = 512$, $d_{\text{ff}} = 2{,}048 = 4d$, and 6 encoder and 6
decoder layers.

1. Encoder layer: $12d^2 = 12\times512^2 = 3{,}145{,}728 \approx 3.15$M.
2. Decoder layer: $16d^2 = 4{,}194{,}304 \approx 4.19$M.
3. Layers: $6\times3.15\text{M} + 6\times4.19\text{M} = 44.0$M.
4. Embeddings: one matrix is shared by the encoder input, the decoder input and the output
   projection, about $37{,}000\times512 = 18.9$M for the shared vocabulary of about 37,000
   tokens.
5. Total: about 63M, against the 65M the paper reports (Table 3).

The paper does not itemise the remaining 3%. Biases and normalisation weights account for only
about 0.1M of it, and the vocabulary is given only as "about 37,000" tokens; the rest cannot be
assigned from what the paper states, so this count stops at "about 63M".
:::

### Encoder-only

**BERT** (Devlin et al. 2019) keeps only the encoder and trains it by **masked language
modelling**: 15% of the positions are selected; of these, 80% are replaced by a `[MASK]` token,
10% by a random token and 10% left unchanged, and the loss is taken on the selected positions
only. The mixture keeps the model from learning that only `[MASK]` positions need predicting,
since `[MASK]` never appears when the model is used. The result is a contextual representation of
every token, read out as a `[CLS]` vector prepended to the input or as the mean of the final
states, for classification, retrieval and embeddings. BERT-Base has 12 layers, $d = 768$ and 110M
parameters. An encoder-only model cannot generate text as it stands ([Exercise 8](#e8)).

### Decoder-only

**GPT** keeps only the decoder, without cross-attention: causal attention and a next-token loss
at every position. It generates, and with enough scale it does the other shapes' tasks by being
prompted. Between the two sits the **prefix LM**: bidirectional attention over a prompt and causal
attention over the continuation, one of the variants compared in the T5 study (Raffel et al.
2020).

### Why decoder-only won

It won because one objective, one architecture and one training run cover every task, and
because generation is the task people want. Each part of that sentence has evidence behind it.

- **Every position is a training target.** A causal model predicts the next token at all
  $T - 1$ positions of a sequence; masked language modelling learns from about 15%.
- **One objective covers every task**, once the task is written as text: GPT-2 showed zero-shot
  behaviour on tasks it was never trained on, and GPT-3 (Brown et al. 2020) few-shot learning from
  examples in the prompt ([Module 07, Section 6](module_07_EN.html#s6) covers in-context
  learning).
- **Generation is the task people want**, and the decoder does it natively.
- **Serving is simple**: one stack and one KV cache ([Section 9](#s9)) over prompt and answer.
- **The scaling evidence** of [Module 07, Section 4](module_07_EN.html#s4) was gathered on this
  shape, so its behaviour at scale is the best understood.

::: worked title="Training signal from one sequence"
One 512-token sequence. A decoder-only model gets 511 next-token targets, one per position except
the last. BERT gets $0.15\times512 = 76.8$, about 77. For the same tokens read, the causal model
receives more than six times as many targets.
:::

There is a counterpoint. In controlled comparisons the answer depends on the evaluation. Raffel et al. (2020) found an encoder-decoder with a denoising objective best at
equal compute for tasks fine-tuned after pretraining. Wang et al. (2022) found a causal decoder
trained on plain next-token prediction best for zero-shot use straight after pretraining.
Generality and simplicity won the market, not a uniform superiority. Encoders remain the efficient
choice for embeddings and retrieval; the [AI Agents series](../agent/index.html) shows how they
are used in retrieval-augmented generation.

[Modules 07 to 10](module_07_EN.html) are about this shape, and follow one
hypothetical worked case through it: an open-weight model of about 9.5B parameters adapted to
draft and check safety-case arguments for the pressure-relief system of a reactor vessel.

::: keyidea
The shapes differ in their masks and objectives: bidirectional and fill-in for encoders, causal
and next-token for decoders, and unmasked cross-attention from decoder queries to encoder keys
and values between them.
:::

::: check
In cross-attention, which side supplies the queries and which the keys and values?
:::

::: answer
The decoder supplies the queries; the encoder's output supplies the keys and the values.
:::

::: check
Why is cross-attention not causally masked?
:::

::: answer
The whole input sequence is known before decoding starts, so every decoder position may read all
of it. Only the decoder's own future is hidden, by the mask on its self-attention.
:::

## The vision transformer {#s8}

Nothing in the transformer is specific to text. It needs a sequence of vectors, and an image can
be made into one (Dosovitskiy et al. 2021). Cut a $224\times224\times3$ image into
$16\times16$ patches: $224/16 = 14$ per side, $14\times14 = 196$ patches. Flatten each to
$16\times16\times3 = 768$ numbers and map it to width $d$ with one shared linear layer, which is
the same as a convolution with kernel 16 and stride 16. Prepend a learned `[CLS]` token, giving
197 tokens, add learned position embeddings, and run an encoder-only stack. The class is read
from the final `[CLS]` vector (Figure 6.17). That token carries no image content of its own: it is
a learned vector whose final state, having attended to every patch in every layer, summarises the
image.

Patches rather than pixels, because attention is quadratic in the number of tokens. One token per
pixel would give $224^2 = 50{,}176$ tokens and about $2.5\times10^9$ score entries per head per
layer; 197 tokens give 38,809.

::: figure id=fig-06-17
A $224\times224$ image, drawn schematically as the outline of a pump housing, overlaid with a
$14\times14$ grid. Three patches are pulled out, each flattened into a strip of 768 cells and
passed through one shared "linear projection" box; a "[CLS]" token stands at the front of the
sequence and a row of "+ position" tags is added beneath. The 197 tokens enter a stack labelled
"transformer encoder × 12", and the [CLS] output goes to a "class" box.
:::

::: worked title="Counting ViT-Base/16"
ViT-Base/16 has 12 layers, $d = 768$, 12 heads and an MLP width of 3,072. With the rules of
[Section 11](#s11):

1. Transformer body: $12Ld^2 = 12\times12\times768^2 = 84{,}934{,}656$, or 84.9M; with the biases
   and the layer-norm weights, 85.1M.
2. Patch embedding: $768\times768 + 768 = 590{,}592$ (0.59M).
3. Position embeddings: $197\times768 = 151{,}296$ (0.15M).
4. A 1,000-class linear head: $768\times1{,}000 + 1{,}000 = 769{,}000$ (0.77M).

Total: about 86.6M, the 86M published. The body is 98% of it.
:::

**Inductive bias.** A convolution builds in locality and translation equivariance
([Module 03](module_03_EN.html#s2)); a ViT builds in neither beyond the patch grid, and must learn
them from data. Trained on ImageNet-sized data alone it trails comparable CNNs. It matches or
beats them with large-scale pretraining, or with strong augmentation and distillation (DeiT,
Touvron et al. 2021). In exchange, every layer can relate any two patches, where a CNN's receptive
field grows only layer by layer.

**Cost.** The number of tokens grows with the square of the resolution, and attention with the
square of the tokens, so doubling the resolution multiplies the attention cost per layer by about
16.

::: worked title="Doubling the resolution"
At $224\times224$: $14^2 + 1 = 197$ tokens. At $448\times448$: $28^2 + 1 = 785$ tokens. Score
entries per head per layer: $197^2 = 38{,}809$ against $785^2 = 616{,}225$, a factor of 15.9. The
projections and FFNs, linear in the number of tokens, grow by $785/197 = 4.0$.
:::

The ViT is now a component as much as a model. CLIP's image encoder
([Module 05, Section 11](module_05_EN.html#s11)) is one, and multimodal language models project a
vision encoder's patch outputs into the token stream of a decoder ([Module 07](module_07_EN.html)).

::: check
How many tokens does a $384\times384$ image give with $16\times16$ patches and a `[CLS]` token?
:::

::: answer
$384/16 = 24$ patches per side, so $24^2 + 1 = 577$ tokens.
:::
