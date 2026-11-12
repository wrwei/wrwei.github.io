## Architecture at scale: sizes, mixture of experts, muP {#s5}

[Section 1](#s1) fixed the parameter budget; this section turns it into a shape. The block itself
is [Module 06](module_06_EN.html#s9)'s: RMSNorm pre-norm, grouped-query attention with RoPE, a
SwiGLU feed-forward network, no biases. What remains are sizes and a few switches, chosen mostly
by precedent, and two questions that only arise at scale: whether the feed-forward layers should
become a mixture of experts, and how hyperparameters tuned on a small model carry over to a large
one.

### Counting a block

[Module 06, Section 11](module_06_EN.html#s11) counts the parameters of a block. With $n_h$ query
heads and $n_{kv}$ key-value heads of dimension $d_h$, one layer holds

$$
N_{\text{layer}} = \underbrace{d\,(n_h d_h)}_{\mathbf{W}_Q} + \underbrace{2d\,(n_{kv} d_h)}_{\mathbf{W}_K,\,\mathbf{W}_V} + \underbrace{(n_h d_h)\,d}_{\mathbf{W}_O} + \underbrace{3\,d\,d_{\text{ff}}}_{\text{SwiGLU}} + \underbrace{2d}_{\text{norms}},
$$

and the model adds $Vd$ for the embedding (twice if the output head is untied) and $d$ for the
final norm. With the usual $n_h d_h = d$ and $n_{kv} = n_h/4$, attention costs
$d^2 + d^2/2 + d^2 = 2.5d^2$, so a layer is $(2.5 + 3d_{\text{ff}}/d)\,d^2$ plus the norms:
$13d^2$ at $d_{\text{ff}} = 3.5d$ (Llama 3 8B), $13.75d^2$ at the case study's $3.75d$.

The rough rule $N \approx 12Ld^2$ comes from an older block: full multi-head attention ($4d^2$)
and a GELU MLP of hidden width $4d$, two matrices of $d \times 4d$, $8d^2$. SwiGLU,
$\mathbf{W}_{\text{down}}\big(\mathrm{SiLU}(\mathbf{W}_{\text{gate}}\mathbf{x}) \odot \mathbf{W}_{\text{up}}\mathbf{x}\big)$,
has three matrices of $d \times d_{\text{ff}}$, so matching the GELU MLP's count needs
$3d\,d_{\text{ff}} = 8d^2$, that is $d_{\text{ff}} = 8d/3$: the origin of the 8/3 rule. Many
recent models go wider, to $3$–$3.75d$, and buy the parameters back with fewer layers.

::: worked title="Counting the case study's 9,550,729,216 parameters"
The configuration is Module 07's (hypothetical, like the whole case study), with the pretraining
details this module adds: $L = 36$, $d = 4{,}096$, 32 query heads of $d_h = 128$, 8 KV heads (GQA
groups of 4, so $h_{kv} = n_{kv}d_h = 1{,}024$), SwiGLU $d_{\text{ff}} = 15{,}360$, RMSNorm
pre-norm plus a final norm, RoPE base 500,000, pretraining context 8,192, vocabulary 152,064
(English–Chinese byte-level BPE), untied embeddings, no biases.

- Attention: $4{,}096 \times 4{,}096$ (Q) $+\ 2 \times 4{,}096 \times 1{,}024$ (K, V) $+\ 4{,}096 \times 4{,}096$ (O) $= 41{,}943{,}040$.
- SwiGLU: $3 \times 4{,}096 \times 15{,}360 = 188{,}743{,}680$. Two norms: $8{,}192$.
- Per layer $230{,}694{,}912$ ($13.75d^2 + 2d$); times 36 layers, $8{,}305{,}016{,}832$.
- Embeddings: $152{,}064 \times 4{,}096 = 622{,}854{,}144$ per table, $1{,}245{,}708{,}288$ for two; final norm $4{,}096$.

Total $9{,}550{,}729{,}216$: 8.31B in the blocks and 1.25B in the two embedding tables. The rule
$12Ld^2 = 7.25\text{B}$ under-counts the blocks by 1.06B: the FFN at $3.75d$ holds $11.25d^2$
where the rule assumes $8d^2$, and GQA saves only $1.5d^2$ of attention's $4d^2$.

The same arithmetic on another shape, $L = 32$, $d = 4{,}096$, 32/8 heads,
$d_{\text{ff}} = 14{,}336$, $V = 128{,}256$, untied, gives
$6{,}979{,}584{,}000 + 1{,}050{,}673{,}152 + 4{,}096 = 8{,}030{,}261{,}248$: the published 8.03B of
Llama 3 8B. [Lab 4](#lab4) checks both counts.
:::

::: figure id=fig-08-7
One decoder block of the case study, annotated for one 8,192-token sequence. Tensor shapes: the
residual stream `(1, 8192, 4096)`; Q `(1, 32, 8192, 128)`; K and V `(1, 8, 8192, 128)`; the SwiGLU
hidden activation `(1, 8192, 15360)`. Parameters per matrix: Q 16.8M, K 4.2M, V 4.2M, O 16.8M,
gate 62.9M, up 62.9M, down 62.9M. The block is repeated ×36 between the input embedding (622.9M)
and the untied output head (622.9M).
:::

### Choosing the shape

Candidate choices for a model of 9–10B; validate them on proxy runs:

| Decision | Typical choice | Reason |
|---|---|---|
| Layers $L$ | 32–42 | Loss is flat across shapes; depth costs time per token and pipeline stages |
| Width $d$ | 3,584–4,096 | Follows from $N$ and $L$; a multiple of 128 suits the kernels |
| Query / KV heads | 28–32 / 4–8 | GQA groups of 4–8 shrink K, V and the KV cache at little cost in loss |
| Head dimension | 128 | Convention and kernel efficiency |
| FFN | SwiGLU | Lower loss than a GELU MLP at equal parameters |
| Normalisation | RMSNorm pre-norm, plus a final norm | Stable at depth, cheaper than layer norm |
| Position | RoPE, base $10^4$ to $10^6$ | A larger base for a longer intended context ([Section 14](#s14)) |
| Vocabulary | 128k–152k for bilingual; tied or untied | Compresses both languages ([Section 4](#s4)); untying adds $Vd$ |
| Pretraining context | 4k–8k, extended in mid-training | Attention cost grows with $T$; long context from the start is wasteful |
| Biases | None | Marginal for quality; removed for stability and simplicity |
| Dense or MoE | Dense at this size | A mixture of experts trades memory and communication for FLOPs (below) |

Choose shape after the parameter budget, checking kernel efficiency and
sequential layer cost. Proxy ablations provide evidence for transfer; they do
not guarantee that every switch behaves identically at the full scale.

### Mixture of experts at scale

[Module 05, Section 12](module_05_EN.html#s12) introduced the mixture of experts as a concept. At
LLM scale each FFN is replaced by $E$ expert FFNs and a router, a $d \times E$ linear layer
followed by a softmax. Each token goes to its top-$k$ experts, whose outputs are summed with the
router weights:

$$
\mathbf{y} = \sum_{e \,\in\, \text{top-}k(\mathbf{g})} g_e\, \mathrm{FFN}_e(\mathbf{x}), \qquad \mathbf{g} = \softmax(\mathbf{W}_r\mathbf{x}).
$$

Compute per token follows the **active** parameters, those a token passes through; memory follows
the **total**, because every expert's weights, gradients and optimiser states must be stored.

::: worked title="The case study as a mixture of experts"
Replace each of the 36 FFNs by 8 experts of the same size, with top-2 routing and a
$4{,}096 \times 8$ router per layer.

- Total: $36 \times (41{,}943{,}040 + 8 \times 188{,}743{,}680 + 32{,}768 + 8{,}192)$ plus the embeddings and final norm $= 57.1\text{B}$.
- Active per token (attention, 2 experts, router, norms): $36 \times 419{,}471{,}360$ plus the embeddings and final norm $= 16.3\text{B}$, of which 15.7B take part in matrix multiplies (all but the input embedding).
- Training FLOPs per token by the series' rule ([Section 1](#s1)): $6 \times 15.7 \times 10^9 + 7.25 \times 10^9$ (attention at $T = 8{,}192$) $= 1.02 \times 10^{11}$, 1.7 times the dense model's $6.08 \times 10^{10}$.
- Model states at 16 bytes per parameter ([Section 8](#s8)): $16 \times 57.1\text{B} = 914$ GB, 6.0 times the dense model's 152.8 GB.

Eight times the FFN parameters cost 1.7 times the compute and six times the memory.
:::

**Expert parallelism** spreads the experts across GPUs. Each token is sent to the GPUs holding its
experts by an all-to-all (the dispatch), and the outputs return by a second all-to-all (the
combine). Per token per MoE layer that moves about $2 \times k \times d \times 2$ bytes in bf16:
$2 \times 2 \times 4{,}096 \times 2 = 32{,}768$ bytes for the variant above, or up to 9.7 GB per
8,192-token sequence through 36 layers in the forward pass, and as much again in the backward.
When selected experts sit on other nodes, the slower links of [Section 9](#s9)
can make the all-to-all a bottleneck (Figure 8.8).

::: figure id=fig-08-8
Expert-parallel dispatch and combine on four GPUs holding two experts each.
Each token is routed to two expert owners; outputs return to its original GPU.
The example capacity is 2,560 assignments per expert. Overflow contributions
are omitted from the expert sum; the residual path remains. Arrows show stages,
not measured communication volumes.
:::

**Load balancing.** Left alone, the router collapses onto a few experts: the experts it favours
get more gradient, improve, and are favoured more. The Switch Transformer's auxiliary loss
(Fedus et al. 2022) counters this:

$$
\mathcal{L}_{\text{aux}} = \alpha E \sum_{i=1}^{E} f_i P_i,
$$

where $f_i$ is the fraction of tokens dispatched to expert $i$ and $P_i$ the mean router
probability for expert $i$ over the batch. At perfect balance $f_i = P_i = 1/E$, the sum is
$E \cdot E \cdot (1/E^2) = 1$ and the loss equals $\alpha$ (Switch used $\alpha = 10^{-2}$). The
count $f_i$ is not differentiable, so the gradient flows through $P_i$:
$\partial\mathcal{L}_{\text{aux}}/\partial P_i = \alpha E f_i$, largest for the busiest experts.

**Capacity.** In a capacity-limited router, each expert processes at most
$\mathrm{CF}\cdot kB_{\text{tok}}/E$ assignments from a routing-group batch of
$B_{\text{tok}}$ tokens, where CF is the **capacity factor**. This policy drops
overflow assignments; tokens with no retained assignment follow the residual
path. Other routers use dropless dispatch. State the policy before comparing them.

::: worked title="An unbalanced router and an overflowing expert"
Load-balancing loss with $E = 4$: $f = (0.55, 0.15, 0.15, 0.15)$ and
$P = (0.50, 0.167, 0.167, 0.167)$ give $E\sum_i f_i P_i = 4 \times (0.275 + 3 \times 0.025) = 1.40$,
against 1.00 at perfect balance. The gradient on $P_1$ is proportional to $f_1 = 0.55$, 3.7 times
that on each of the others, so expert 1 loses probability fastest.

Capacity with 8,192 tokens in the whole routing group, $k = 2$, $E = 8$ and $\mathrm{CF} = 1.25$:
$1.25 \times 2 \times 8{,}192/8 = 2{,}560$ slots per expert. An expert that attracts 30% of the
16,384 routed assignments, 4,915 of them, drops $4{,}915 - 2{,}560 = 2{,}355$:
almost half this expert's assignments lose its contribution. A token whose other
selected expert accepts it still receives that other output.
:::

Two later refinements, at concept level. DeepSeek-V3 balances load largely without an auxiliary
loss: a per-expert bias is added to the routing scores for the top-$k$ selection only (not to the
weights that combine the outputs), lowered after each step for overloaded experts and raised for
idle ones, so balancing no longer pulls against the language-modelling gradient. DeepSeekMoE splits
experts into many smaller ones, routing each token to more of them, and adds shared experts that
every token passes through, so common knowledge need not be copied into every expert.

**When MoE pays.** Compare measured active arithmetic, all-expert storage
and routing communication. Mixtral 8x7B's published counts are 46.7B total and
12.9B active; DeepSeek-V3's are 671B and 37B. Active count alone does not predict
latency or a dense-equivalent loss. This case study keeps a dense model to avoid
expert routing and to fit one sharded node per replica.

### Carrying the learning rate across widths: muP

Under the standard parametrisation the best learning rate drifts as the width grows, so a sweep at
width 256 does not transfer to 4,096. The cause is Adam's normalised step: each entry of
$\Delta\mathbf{W}$ has size about $\eta$ whatever the gradient's scale
([Module 02, Section 8](module_02_EN.html#s8)). For a hidden matrix with fan-in $n$ the gradient
is an outer product $\boldsymbol{\delta}\mathbf{x}^\top$, so the sign of $\Delta W_{ji}$ is
$-\mathrm{sign}(\delta_j)\,\mathrm{sign}(x_i)$, and the change of an output for the same input is

$$
\Delta y_j = \sum_{i=1}^{n} \Delta W_{ji}\, x_i \approx -\eta\,\mathrm{sign}(\delta_j) \sum_{i=1}^{n} |x_i|.
$$

The $n$ contributions add coherently, so the change grows like $\eta n$, not like the
$\eta\sqrt{n}$ of a sum of random signs. Keeping it of order one as the width grows requires
$\eta \propto 1/n$ for hidden matrices. **muP**, the maximal-update parametrisation (Yang et al.
2021), builds this in, together with a matching initialisation and a scaling of the output
logits, so that the best learning rate found on a narrow proxy holds for the wide model.

::: worked title="Transferring a learning rate"
A sweep at width 256 finds the best hidden-matrix learning rate, $1 \times 10^{-2}$. At width
4,096 the fan-in is 16 times larger, and muP sets
$1 \times 10^{-2} \times 256/4{,}096 = 6.25 \times 10^{-4}$, for the hidden matrices only; the
embedding and output layers follow different rules.
:::

The alternatives used in practice are power laws for the best learning rate and batch size fitted
against compute (DeepSeek LLM, 2024), or plain sweeps at two or three scales.

::: check
Why do total parameters set an MoE's memory but active parameters set its FLOPs?
:::

::: answer
Every expert's weights, gradients and optimiser states must be stored on some GPU, but each token
passes through only its $k$ experts, so only their weights take part in its matrix multiplies.
:::

::: check
In the auxiliary loss $f_i$ is not differentiable. How does the loss still balance the load?
:::

::: answer
The gradient flows through $P_i$, weighted by $f_i$: $\partial\mathcal{L}_{\text{aux}}/\partial P_i = \alpha E f_i$.
The router probability is pushed down hardest for the experts that receive the most tokens, which
sends tokens elsewhere.
:::

::: check
Why must a learning rate tuned at width 256 come down at width 4,096 under the standard
parametrisation with Adam?
:::

::: answer
Adam's update entries have a fixed size of about $\eta$, and a wider matrix sums more of them
coherently into each output, so the same $\eta$ changes the outputs about $n$ times as much. Holding
the change fixed needs $\eta \propto 1/n$.
:::

## The optimiser recipe: AdamW, schedules, batch size {#s6}

A pretraining run keeps one optimiser setting for weeks, and none of its numbers can be tuned on
the run itself. This section sets each of them for the case study's plan and gives the reason. The
algorithms are [Module 02](module_02_EN.html#s8)'s; what is new is the regime: half a million
steps, millions of tokens per step, and no second attempt.

### AdamW at pretraining settings

The update ([Module 02, Section 8](module_02_EN.html#s8)), with gradient $\mathbf{g}$,
bias-corrected moments $\hat{\mathbf{m}}$ and $\hat{\mathbf{v}}$, and decoupled weight decay
$\lambda$:

$$
\begin{aligned}
\mathbf{m} &\leftarrow \beta_1\mathbf{m} + (1-\beta_1)\,\mathbf{g}, \qquad \mathbf{v} \leftarrow \beta_2\mathbf{v} + (1-\beta_2)\,\mathbf{g}^2,\\
\theta &\leftarrow \theta - \eta\left(\frac{\hat{\mathbf{m}}}{\sqrt{\hat{\mathbf{v}}} + \epsilon} + \lambda\theta\right).
\end{aligned}
$$

Pretraining uses $\beta_1 = 0.9$, $\beta_2 = 0.95$, $\epsilon = 10^{-8}$ and $\lambda = 0.1$,
with weight decay on the weight matrices only: not on norm gains or biases, and in many recipes
not on the embeddings.

**Why $\beta_2 = 0.95$ rather than 0.999.** The second-moment average remembers about
$1/(1-\beta_2)$ steps: 20 at 0.95, 1,000 at 0.999. With a long memory, a sudden rise in gradient
scale meets a stale, small $\mathbf{v}$, and the step $\hat{\mathbf{m}}/\sqrt{\hat{\mathbf{v}}}$
becomes oversized.

::: worked title="One outlier gradient, two memories"
A weight whose gradients have RMS $10^{-3}$ has $v = 10^{-6}$, and $m$ near zero because the
gradient's sign keeps changing. One gradient of $10^{-2}$ arrives. Then
$m = 0.1 \times 10^{-2} = 10^{-3}$ and, ignoring the bias corrections (close to 1 this late):

- $\beta_2 = 0.999$: $v = 0.999 \times 10^{-6} + 0.001 \times 10^{-4} = 1.099 \times 10^{-6}$, $\sqrt{v} = 1.048 \times 10^{-3}$, and the step is $\eta\,m/\sqrt{v} = 0.954\,\eta$.
- $\beta_2 = 0.95$: $v = 0.95 \times 10^{-6} + 0.05 \times 10^{-4} = 5.95 \times 10^{-6}$, $\sqrt{v} = 2.44 \times 10^{-3}$, and the step is $0.410\,\eta$.

If the gradient stays ten times larger, $v_t = 10^{-4} - 0.99 \times 10^{-4}\,\beta_2^{\,t}$
reaches half its new level when $\beta_2^{\,t} = 0.505$: after 14 steps at 0.95, 683 at 0.999.
Meanwhile $m$ catches up within about 20 steps, so at 0.999 the step grows to $5.1\,\eta$ at step
19 and is still $1.9\,\eta$ after 300 steps; at 0.95 it never exceeds $1.1\,\eta$.
:::

**The $\epsilon$.** When a parameter's gradient RMS falls towards $\epsilon$ (large or deep
models, late in training), the denominator $\sqrt{\hat{v}} + \epsilon$ is dominated by $\epsilon$
and the update is damped without anyone having chosen to damp it. Wortsman et al. (2024) lowered
$\epsilon$, to about $10^{-15}$, for this reason. Llama 2 used $10^{-5}$; $10^{-8}$ is a common
default.

**Weight decay as a timescale.** Decoupled decay multiplies each decayed weight by
$(1 - \eta\lambda)$ every step, so a weight forgets its value over about $1/(\eta\lambda)$ steps,
a time to compare with the length of the run.

::: worked title="How many times a run forgets its weights"
$\eta = 3 \times 10^{-4}$ and $\lambda = 0.1$ give $1/(\eta\lambda) = 33{,}333$ steps. The
case-study plan has 508,626 steps, 15 timescales at the peak rate; integrated over the decaying
schedule below (whose mean rate is 55% of the peak) it is 8.4, and decay alone shrinks the
initial weights by $e^{-8.4} = 2 \times 10^{-4}$. Lab 2's $\eta = 3 \times 10^{-3}$ gives 3,333
steps, longer than its 600-step run: there weight decay barely acts.
:::

### The learning rate and its schedule

The peak learning rate is the most important number in the run. It is set from a sweep at small
scale plus muP or a fitted scaling rule ([Section 5](#s5)), and larger models need smaller peaks.
Anchor it with a published recipe: Llama 2 used a peak of $3 \times 10^{-4}$ for its 7B and 13B
models and $1.5 \times 10^{-4}$ for 34B and 70B, with 2,000 warmup steps, cosine decay to 10% of
the peak, a batch of 4M tokens and clipping at 1.0. Expect $1 \times 10^{-4}$ to
$3 \times 10^{-4}$ at 7–10B, and lower for larger models.

**Warmup**, linear over the first 1,000–2,000 steps, for three reasons. Adam's $\mathbf{v}$ starts
from too few samples to be trusted, even bias-corrected; early gradients are large and the
curvature at initialisation is high; and the first steps at full rate can push the model into a
region it never leaves ([Lab 3](#lab3) shows a version of this).

**Warmup-cosine**, with $T_w$ warmup steps, $T$ steps in all and $\eta_{\min} = 0.1\,\eta_{\max}$:

$$
\eta(t) =
\begin{cases}
\eta_{\max}\, t/T_w, & t < T_w,\\[4pt]
\eta_{\min} + \tfrac{1}{2}(\eta_{\max} - \eta_{\min})\left(1 + \cos\dfrac{\pi(t - T_w)}{T - T_w}\right), & t \ge T_w.
\end{cases}
$$

Its weakness is $T$: the horizon is fixed before the run starts. A run stopped early has not
decayed, and a run extended has already decayed.

**Warmup-stable-decay (WSD)** warms up, holds the peak for most of the run, then decays over the
last 10–20% of steps to near zero. It matches cosine at the same budget (Hägele et al. 2024;
MiniCPM popularised it) and removes the horizon: the run can be extended, or a decay branched from
any stable-phase checkpoint, so one run yields models for several budgets. The loss falls sharply
during the decay. That drop is noise being averaged out as the steps shrink, not new knowledge
being learned, which is why a WSD run looks worse than a cosine run until its last stretch.

::: figure id=fig-08-9
Computed learning-rate schedules for 10,000 steps: warmup-cosine to 10% of peak,
WSD with its last 20% decaying linearly to zero, and a constant rate without
warmup. Warmup ends at step 500. These are schedules, not measured loss curves.
:::

::: worked title="The case-study schedule"
The global batch is 480 sequences of 8,192 tokens, $3{,}932{,}160$ tokens per step, close to Llama
2's 4M. The 2T-token plan is therefore $2 \times 10^{12}/3{,}932{,}160 = 508{,}626$ steps. Warmup
lasts 2,000 steps (0.4% of the run) up to a peak of $3 \times 10^{-4}$, then cosine decays to
$3 \times 10^{-5}$:

| Step | Where | Learning rate |
|---|---|---|
| 1,000 | halfway through warmup | $1.5 \times 10^{-4}$ |
| 2,000 | the peak | $3.0 \times 10^{-4}$ |
| 127,000 | a quarter of the way through the decay | $2.61 \times 10^{-4}$ |
| 254,313 | the midpoint of the run | $1.66 \times 10^{-4}$ |
| 381,000 | three quarters of the way through the decay | $7.0 \times 10^{-5}$ |
| 508,626 | the end | $3.0 \times 10^{-5}$ |

At step 127,000, for example, the decay is $(127{,}000 - 2{,}000)/506{,}626 = 0.247$ complete,
$\cos(0.247\pi) = 0.714$, and
$\eta = 3 \times 10^{-5} + 0.5 \times 2.7 \times 10^{-4} \times 1.714 = 2.61 \times 10^{-4}$.
:::

The same schedule as code, the form a training loop calls once per step:

```python
import math


def lr_at(step, peak=3e-4, warmup=2_000, total=508_626, floor_frac=0.1):
    """Linear warmup to `peak`, then cosine decay to floor_frac * peak at `total`."""
    if step < warmup:
        return peak * step / warmup
    progress = (step - warmup) / (total - warmup)
    floor = floor_frac * peak
    return floor + 0.5 * (peak - floor) * (1 + math.cos(math.pi * progress))


for step in (1_000, 2_000, 127_000, 254_313, 381_000, 508_626):
    print(f"{step:>7,}  {lr_at(step):.2e}")
```

```output
  1,000  1.50e-04
  2,000  3.00e-04
127,000  2.61e-04
254,313  1.66e-04
381,000  7.01e-05
508,626  3.00e-05
```

### Batch size and the critical batch

The batch is measured in tokens: 1M–4M tokens per step at 9B scale, sometimes ramped up during the
run. How large a batch is useful follows from McCandlish et al. (2018). Take a quadratic model of
the loss around the current weights, with true gradient $\mathbf{G}$, Hessian $\mathbf{H}$ and
per-token gradient covariance $\boldsymbol{\Sigma}$, and a plain SGD step $-\eta\hat{\mathbf{G}}$
on a batch of $B$ tokens, where $\hat{\mathbf{G}}$ has mean $\mathbf{G}$ and covariance
$\boldsymbol{\Sigma}/B$. Expanding to second order and averaging over batches, using
$\mathbb{E}[\hat{\mathbf{G}}^\top\mathbf{H}\hat{\mathbf{G}}] = \mathbf{G}^\top\mathbf{H}\mathbf{G} + \operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})/B$:

$$
\mathbb{E}[\Delta L] = -\eta\,\lVert\mathbf{G}\rVert^2 + \tfrac{1}{2}\eta^2\left(\mathbf{G}^\top\mathbf{H}\mathbf{G} + \frac{\operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})}{B}\right).
$$

Setting the derivative with respect to $\eta$ to zero gives the best step size and the best
change of loss per step:

$$
\eta^\ast = \frac{\lVert\mathbf{G}\rVert^2}{\mathbf{G}^\top\mathbf{H}\mathbf{G} + \operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})/B},
\qquad
\Delta L_{\text{opt}}(B) = -\frac{1}{2}\,\frac{\lVert\mathbf{G}\rVert^4}{\mathbf{G}^\top\mathbf{H}\mathbf{G} + \operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})/B} = \frac{\Delta L_{\max}}{1 + B_{\text{noise}}/B},
$$

where $\Delta L_{\max} = -\lVert\mathbf{G}\rVert^4/(2\,\mathbf{G}^\top\mathbf{H}\mathbf{G})$ is
what an infinite batch would achieve, and the **gradient noise scale** is

$$
B_{\text{noise}} = \frac{\operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})}{\mathbf{G}^\top\mathbf{H}\mathbf{G}} \;\approx\; \frac{\operatorname{tr}\boldsymbol{\Sigma}}{\lVert\mathbf{G}\rVert^2},
$$

simplified when $\mathbf{H}$ is close to a multiple of the identity. (McCandlish et al. write
$\epsilon$ for the learning rate; $\eta$ avoids a clash with Adam's $\epsilon$.) Each step at batch
$B$ makes a fraction $1/(1 + B_{\text{noise}}/B)$ of the best possible progress, so reaching a
given loss takes

$$
S = S_{\min}\left(1 + \frac{B_{\text{noise}}}{B}\right) \text{ steps}, \qquad
D = SB = D_{\min}\left(1 + \frac{B}{B_{\text{noise}}}\right) \text{ tokens},
$$

with $D_{\min} = S_{\min}B_{\text{noise}}$. (McCandlish et al. write $E$ for examples; $D$ keeps
this module's symbol for tokens, because $E$ is the number of experts in [Section 5](#s5).)
Multiplying the two excesses,
$(S/S_{\min} - 1)(D/D_{\min} - 1) = (B_{\text{noise}}/B)(B/B_{\text{noise}}) = 1$: a hyperbola
that trades steps against tokens. At the **critical batch size**
$B_{\text{crit}} = B_{\text{noise}}$ both are twice their minimum. $B_{\text{noise}}$ grows as the
loss falls, because the mean gradient shrinks faster than its noise, which is the case for ramping
the batch up during a run.

::: worked title="Steps and tokens around a 2M-token noise scale"
With $B_{\text{noise}} = 2\text{M}$ tokens, $S/S_{\min} = 1 + 2\text{M}/B$ and
$D/D_{\min} = 1 + B/2\text{M}$:

| Batch $B$ (tokens) | 0.25M | 0.5M | 1M | 2M | 4M | 8M | 16M |
|---|---|---|---|---|---|---|---|
| Steps, $S/S_{\min}$ | 9.0 | 5.0 | 3.0 | 2.0 | 1.5 | 1.25 | 1.125 |
| Tokens, $D/D_{\min}$ | 1.125 | 1.25 | 1.5 | 2.0 | 3.0 | 5.0 | 9.0 |

Below $B_{\text{noise}}$, doubling the batch nearly halves the steps for little extra data; above
it, each doubling saves few steps and the data bill climbs.
:::

::: figure id=fig-08-10
Steps against tokens needed to reach a fixed loss, as $S/S_{\min}$ against $D/D_{\min}$ on log-log
axes: the hyperbola $(S/S_{\min} - 1)(D/D_{\min} - 1) = 1$, with points for batches of 0.25M,
0.5M, 1M, 2M, 4M, 8M and 16M tokens at $B_{\text{noise}} = 2\text{M}$. The critical batch is
marked at (2, 2); the small-batch end is labelled data-efficient and the large-batch end
time-efficient.
:::

**Gradient accumulation** decouples the batch from memory: gradients from several micro-batches
are summed before one optimiser step, and the global batch is micro-batch × accumulation steps ×
data-parallel degree ([Section 9](#s9)).

**Learning rate and batch move together.** Below the critical batch a larger batch tolerates a
larger learning rate, roughly in proportion for SGD and closer to the square root for Adam. The
derivation above assumes plain SGD, so for Adam treat it as an empirical model and confirm with a
sweep.

::: check
With $\beta_2 = 0.95$, roughly how many steps does Adam's second-moment estimate remember?
:::

::: answer
About $1/(1-\beta_2) = 20$ steps, so it adapts to a change of gradient scale within a few tens of
steps; at 0.999 it would take about a thousand.
:::

::: check
What does a WSD schedule let you do that a cosine schedule does not?
:::

::: answer
Extend or stop the run at any point. The stable phase does not depend on the horizon, and a decay
can be branched from any stable-phase checkpoint, so one run gives models for several budgets.
:::

::: check
At $B = B_{\text{crit}}$, how many steps and tokens does a run need compared with their minima?
:::

::: answer
Twice each: $S/S_{\min} = 1 + B_{\text{noise}}/B = 2$ and $D/D_{\min} = 1 + B/B_{\text{noise}} = 2$.
:::

## Stability and precision: clipping, z-loss, QK-norm, bf16 and fp8 {#s7}

A long run must not diverge, and two things decide whether it does: the number formats its
arithmetic uses, and a handful of small additions to the loss and the block that keep values in
the range those formats represent well. Each addition prevents one failure, and knowing which
failure is the point.

### The formats

A floating-point number has a sign, an exponent that sets its range and a mantissa that sets its
precision: neighbouring values near $x$ are about $x \cdot 2^{-m}$ apart for $m$ mantissa bits.

| Format | Sign / exponent / mantissa | Largest | Smallest normal | Relative spacing |
|---|---|---|---|---|
| fp32 | 1 / 8 / 23 | $3.4 \times 10^{38}$ | $1.2 \times 10^{-38}$ | $2^{-23} \approx 1.2 \times 10^{-7}$ |
| fp16 | 1 / 5 / 10 | 65,504 | $6.1 \times 10^{-5}$; subnormals to $6.0 \times 10^{-8}$ | $2^{-10} \approx 9.8 \times 10^{-4}$ |
| bf16 | 1 / 8 / 7 | $3.4 \times 10^{38}$ | $1.2 \times 10^{-38}$ | $2^{-7} \approx 7.8 \times 10^{-3}$ |
| fp8 E4M3FN | 1 / 4 / 3 | 448 | $1.6 \times 10^{-2}$ | $2^{-3} = 0.125$ |
| fp8 E5M2 | 1 / 5 / 2 | 57,344 | $6.1 \times 10^{-5}$ | $2^{-2} = 0.25$ |

bf16 stores seven fraction bits against fp32's twenty-three, with the same exponent
width and much less precision. fp16
spends its bits the other way, with three more fraction bits than bf16 but a range that ends at
65,504. [Module 10, Section 7](module_10_EN.html#s7) uses the same formats for inference.

::: figure id=fig-08-11
Bit allocations and positive representable ranges, including subnormals, for
fp32, fp16, bf16, E4M3FN and E5M2. Left-pointing markers indicate ranges extending
below the displayed lower limit. A $2\times10^{-8}$ gradient lies below fp16's
smallest subnormal; scaling by 65,536 moves it to $1.31\times10^{-3}$.
:::

### Mixed precision as it is run

The recipe: matrix-multiply inputs in bf16 with fp32 accumulation inside the tensor cores; fp32
master weights and optimiser states; softmax, norms and the loss computed in fp32. The master
weights exist because a small update added to a bf16 weight rounds away.

::: worked title="Why the master weights are fp32"
A weight of 0.02 lies in $[2^{-6}, 2^{-5})$, where bf16's 7 mantissa bits give a spacing of
$2^{-6} \times 2^{-7} = 2^{-13} = 1.22 \times 10^{-4}$. Late in the run the learning rate is
$3 \times 10^{-5}$ and an Adam step is about 1, so the update is $3 \times 10^{-5}$: below half a
spacing, $6.1 \times 10^{-5}$. It rounds to nothing on every step, and the weight never moves. In
fp32 the spacing at 0.02 is $2^{-6} \times 2^{-23} = 1.9 \times 10^{-9}$, and the update is kept.
:::

```python
import torch

w_bf16 = torch.tensor(0.02, dtype=torch.bfloat16)
w_fp32 = torch.tensor(0.02, dtype=torch.float32)
update = 3e-5                       # late-run learning rate x an Adam step of about 1

print(f"bf16 stores 0.02 as {w_bf16.item():.11f}")
print(f"bf16 after update:  {(w_bf16 + update).item():.11f}")   # unchanged
print(f"fp32 after update:  {(w_fp32 + update).item():.11f}")   # moved by 3e-5
```

```output
bf16 stores 0.02 as 0.02001953125
bf16 after update:  0.02001953125
fp32 after update:  0.02002999932
```

**fp16 and loss scaling.** fp16 is more precise than bf16 but its range is narrow:
gradients below about half its smallest subnormal round to zero; some kernels
also flush subnormals. Attention scores or activations above 65,504 overflow to
infinity. Loss scaling (Micikevicius et al. 2018) multiplies the loss by a **loss scale** $s$
before the backward pass, so every gradient is $s$ times larger and representable, and divides by
$s$ before the update. Dynamic scaling finds $s$ automatically: on an inf or NaN in the gradients
it halves $s$ and skips the step, and after a run of clean steps (2,000 in PyTorch's default) it
doubles $s$. bf16 has fp32's exponent width and typical recipes avoid fp16-style
loss scaling, which is a main reason
modern runs are more stable than the fp16 runs before them.

::: worked title="A gradient rescued by loss scaling"
A gradient of $2 \times 10^{-8}$ is below fp16's smallest subnormal, $2^{-24} = 5.96 \times 10^{-8}$,
and below half of it, so it rounds to 0. With $s = 65{,}536 = 2^{16}$ it is computed as
$2 \times 10^{-8} \times 65{,}536 = 1.31 \times 10^{-3}$, comfortably representable, and the
division by $s$ happens in fp32 before the update.
:::

**fp8.** The newest runs (as of 2026) go further for the large matrix multiplies only. E4M3, the
more precise variant, holds weights and activations in the forward pass; some recipes use E5M2,
with more range, for gradients. With 448 or 57,344 as the largest value, every tensor needs a
scale factor: one per tensor, set from a history of recent maximum absolute values, or one per
block, as in DeepSeek-V3, which scaled activations in $1 \times 128$ tiles and weights in
$128 \times 128$ blocks and accumulated the products in higher precision. Norms, softmax, the loss
and the optimiser stay in higher precision. It works with care; it is not yet a default.

### Gradient clipping

Clipping by global norm rescales the whole gradient, over all parameters together, when its norm
exceeds a threshold $c$, usually 1.0:

$$
\mathbf{g} \leftarrow \mathbf{g}\cdot\min\left(1, \frac{c}{\lVert\mathbf{g}\rVert_2}\right).
$$

A global norm of 4.0 with $c = 1.0$ multiplies every gradient entry by 0.25 and keeps the
direction. Log the fraction of clipped steps. Clipping should act on spikes; a run that clips most
of its steps runs at a lower effective learning rate than its schedule says, and is hiding a
problem.

### z-loss

Cross-entropy depends only on differences between logits. For logits $\mathbf{z}$ and target $y$
the loss is $-z_y + \log Z$ with $Z = \sum_j e^{z_j}$; adding a constant $c$ to every logit adds
$c$ to both terms, and they cancel. Nothing in the loss pins the overall level of the logits, so it
can drift, and large logits lose precision in bf16; unstable exponential implementations can also overflow. The **z-loss** pulls
$\log Z$ towards 0. Using $\partial\log Z/\partial z_j = e^{z_j}/Z$:

$$
\mathcal{L}_z = 10^{-4}\,(\log Z)^2, \qquad
\frac{\partial \mathcal{L}_z}{\partial z_j} = 2\cdot 10^{-4}\,\log Z\,\frac{\partial \log Z}{\partial z_j} = 2\cdot10^{-4}\,\log Z\;\softmax(\mathbf{z})_j.
$$

::: worked title="What a drifted logit costs in bf16"
A logit of 30 lies in $[16, 32)$, where the bf16 spacing is $16 \times 2^{-7} = 0.125$: logits near
30 move in steps of 0.125, each changing a probability ratio by $e^{0.125} = 1.13$. Near 4–8 the
spacing is $4 \times 2^{-7} = 0.031$. With $\log Z = 30$ and the coefficient $10^{-4}$, z-loss adds
$2 \times 10^{-4} \times 30 = 6 \times 10^{-3}$ times $\softmax(\mathbf{z})_j$ to each logit's
gradient: a steady pull back towards $\log Z = 0$ that cross-entropy alone never applies.
:::

In code, z-loss is one line beside the cross-entropy, and the demonstration shows the shift
invariance it repairs:

```python
import torch
import torch.nn.functional as F


def lm_loss(logits, targets, z_coef=1e-4):
    """Cross-entropy plus z-loss. logits: (B, T, V), maybe bf16; targets: (B, T)."""
    logits = logits.float()                     # the loss is computed in fp32
    log_z = torch.logsumexp(logits, dim=-1)     # (B, T): log of the normaliser Z
    ce = F.cross_entropy(logits.flatten(0, 1), targets.flatten())
    return ce + z_coef * (log_z ** 2).mean()


torch.manual_seed(0)
logits = torch.randn(2, 8, 50, dtype=torch.bfloat16)
targets = torch.randint(0, 50, (2, 8))
shifted = logits.float() + 30.0                 # same softmax, log Z larger by 30
for name, z in (("original", logits), ("shifted by 30", shifted)):
    ce = F.cross_entropy(z.float().flatten(0, 1), targets.flatten())
    print(f"{name:>13}: cross-entropy {ce:.4f}, with z-loss {lm_loss(z, targets):.4f}")
```

```output
     original: cross-entropy 4.4256, with z-loss 4.4277
shifted by 30: cross-entropy 4.4256, with z-loss 4.5448
```

### QK-norm and attention-logit growth

Inside attention the logits are $\mathbf{q}\cdot\mathbf{k}/\sqrt{d_h}$, and nothing bounds them. As
the query and key projections grow during training, the logits grow, the softmax can become sharply concentrated, attention entropy falls, and training can stall or diverge (Dehghani et al. 2023;
Wortsman et al. 2024). **QK-norm** applies an RMSNorm with a learned gain to $\mathbf{q}$ and
$\mathbf{k}$ per head before the dot product. A unit-RMS vector of dimension $d_h$ has length
$\sqrt{d_h}$, so

$$
\frac{|\mathbf{q}\cdot\mathbf{k}|}{\sqrt{d_h}} \le \frac{\lVert\mathbf{q}\rVert\,\lVert\mathbf{k}\rVert}{\sqrt{d_h}} = \frac{d_h}{\sqrt{d_h}} = \sqrt{d_h} \approx 11.3 \quad \text{for } d_h = 128,
$$

times the learned gains. Other stabilisers, at concept level: a lower peak learning rate, a longer
warmup, no biases, a norm before the output head, and scaled initialisation of the residual
projections.

### Testing a fix on a small model

Wortsman et al. (2024) showed that small models at high learning rates reproduce the
instabilities of large ones, so a mitigation can be tested cheaply: train at several learning
rates, plot the final loss against the learning rate, and read the **learning-rate
sensitivity**, how fast the loss degrades away from the best rate. [Lab 3](#lab3) does this on a
laptop and finds, as they did, that the instability of a small model at a high rate is
attention-logit growth, which QK-norm removes and which warmup, clipping and z-loss alone do not.

::: worked title="Measured Lab 3 instability"
In this environment, the 150-step reference at $3\times10^{-3}$ ends at mean
loss 4.273 over its last twenty steps, with a final-batch maximum attention
logit of 28.4. At $3\times10^{-2}$, loss is 5.234 and the logit 971.7.
Warmup, clipping and z-loss added cumulatively leave loss between 5.389 and
5.549 and logits between 753 and 1,138. Adding QK-norm lowers them to 4.786
and 12.4. With all four at the reference rate, loss is 4.024. These are controlled
training diagnostics, not nine held-out checkpoint comparisons.
:::

::: check
Why do typical bf16 recipes avoid fp16-style loss scaling?
:::

::: answer
bf16 has 8 exponent bits and represents much smaller magnitudes. Extremely small
values can still underflow. fp16 has 5 exponent bits and its least positive subnormal is
about $6 \times 10^{-8}$. With gradual underflow and round-to-nearest, values below half that
spacing round to zero; some kernels additionally flush subnormals to zero.
:::

::: check
What does z-loss constrain that cross-entropy does not?
:::

::: answer
The overall level of the logits, $\log Z$. Cross-entropy depends only on differences between
logits, so it is blind to a shift of all of them.
:::

::: check
A run clips 95% of its steps. What does that tell you?
:::

::: answer
The effective learning rate is being set by the clip threshold rather than the schedule, and
something (the learning rate, the data, a layer) is persistently producing large gradients. Find
it; do not raise the threshold.
:::

## Memory accounting {#s8}

Whether a configuration fits on a GPU is a calculation, not a trial. A training step needs memory
for four things: the model states (weights, gradients, optimiser states), the activations kept for
the backward pass, the logits, and the buffers around them. This section counts each for the case
study. Units, stated once: GB means $10^9$ bytes and GiB $2^{30}$ bytes; the module uses GB and
gives GiB beside a figure that recurs in other modules.

### Model states: 16 bytes per parameter

Two derivations reach the same number. (a) bf16 mixed precision with Adam: bf16 weights 2 + bf16
gradients 2 + fp32 master weights 4 + Adam's first moment 4 + Adam's second moment 4 = 16 bytes.
(b) PyTorch autocast with fp32 parameters: fp32 weights 4 + fp32 gradients 4 + $\mathbf{m}$ 4 +
$\mathbf{v}$ 4 = 16, with bf16 copies of the weights made on the fly. The variants: fp32 gradients
or gradient-accumulation buffers add 2 (18 bytes); 8-bit optimiser states give
2 + 2 + 4 + 1 + 1 = 10; plain SGD with momentum keeps 4 bytes of state instead of Adam's 8. The
ZeRO paper writes the rule as $2 + 2 + K$ with $K = 12$.

::: worked title="The case study's model states"
$16 \times 9.551 \times 10^9 = 152.8$ GB (142.3 GiB): bf16 weights and gradients 19.1 GB each, and
38.2 GB each for the fp32 master weights and the two Adam moments. No single 80 GB GPU holds it,
before a single activation.
:::

### Activations

The backward pass needs, from each layer, the inputs of every matrix multiply and nonlinearity
([Module 02](module_02_EN.html#s3)). For the case study's block with FlashAttention and no
dropout, in bf16, per token per layer:

| Saved tensor | Bytes |
|---|---|
| Inputs of the two RMSNorms | $2 \times 2d$ |
| Input of the Q, K, V projections | $2d$ |
| Q | $2d$ |
| K and V | $2 \times 2h_{kv}$ |
| Attention output, input of O | $2d$ |
| Input of the MLP | $2d$ |
| SwiGLU gate, up and their product | $3 \times 2d_{\text{ff}}$ |
| Total | $12d + 4h_{kv} + 6d_{\text{ff}}$ |

For the case study that is $12 \times 4{,}096 + 4 \times 1{,}024 + 6 \times 15{,}360 = 145{,}408$
bytes, or $35.5d$. Implementations differ by perhaps 20%, depending on what they fuse or
recompute; Korthikanti et al. (2023) count $34sbh$ bytes ($s$ the sequence length, $b$ the batch,
$h$ the width) for the original GPT block, whose dropout masks and GELU give different terms and a
similar total.

Without FlashAttention the softmax probabilities add $2n_hT^2$ bytes per layer, more with dropout
masks: the $T^2$ term that FlashAttention removes by recomputing them blockwise in the backward
pass. The **logits** add $T \times V \times 4$ bytes in fp32 for the loss, often the largest
single tensor in the step; chunked or fused cross-entropy computes the loss without materialising
them all.

::: worked title="Activations and logits for one 8,192-token sequence"
Activations: $145{,}408 \times 8{,}192 \times 36 = 42.9$ GB, 1.19 GB per layer. Logits in fp32:
$8{,}192 \times 152{,}064 \times 4 = 4.98$ GB. Without FlashAttention the bf16 attention
probabilities alone would be $2 \times 32 \times 8{,}192^2 = 4.29$ GB per layer, 155 GB for 36
layers.
:::

### Activation checkpointing

**Activation checkpointing** (also called gradient checkpointing) stores only each layer's input,
$2d$ bytes per token per layer, and recomputes the layer's forward pass during the backward pass.
Memory falls to the stored inputs plus one layer's activations at a time. Compute rises by one
extra forward pass: training costs three forward passes per token, and now four, about a third
more. **Selective** checkpointing recomputes only the cheap, memory-heavy parts, such as attention
scores and activation functions. Checkpointing a segment every $\sqrt{L}$ layers (Chen et al.
2016) gives $O(\sqrt{L})$ memory for the same one extra forward pass.

::: worked title="Full checkpointing for the case study"
Stored layer inputs: $2 \times 4{,}096 \times 8{,}192 \times 36 = 2.42$ GB. One layer recomputed
at a time: 1.19 GB. Together 3.61 GB instead of 42.9 GB, for a third more compute.
:::

The rest of the memory goes to communication buffers, temporary workspaces and allocator
fragmentation; leave 5–10% headroom. Offloading the optimiser states to CPU memory (ZeRO-Offload)
is a slow escape hatch. Inference, for contrast, needs only the bf16 weights, 2 bytes per
parameter (19.1 GB for the case study), plus the KV cache ([Module 10](module_10_EN.html#s3)).

::: figure id=fig-08-12
Memory for the case study on one 80 GB GPU as a stacked bar: bf16 weights 19.1 GB, bf16 gradients
19.1, fp32 master weights 38.2, Adam first moment 38.2 and second moment 38.2 (152.8 GB of model
states), then activations 42.9 and fp32 logits 5.0 for one 8,192-token sequence, against a dashed
line at 80 GB. A second bar shows the same step with full activation checkpointing (activations
3.6 GB). Both bars overflow the line, the motivation for [Section 9](#s9).
:::

::: worked title="Lab 2's model, for scale"
$5.8\text{M} \times 16$ bytes $= 93$ MB of model states (the lab runs in fp32 on a CPU, variant
(b) without the bf16 copies). Its activations for a batch of $16 \times 256$ tokens, counted as
above at 4 bytes per value, are about 0.4 GB, and its logits 67 MB. A laptop holds that easily,
which is why [Lab 2](#lab2) can skip every technique in this section.
:::

::: check
Where do the 16 bytes per parameter go in bf16 mixed precision with Adam?
:::

::: answer
2 for the bf16 weights, 2 for the bf16 gradients, 4 for the fp32 master weights, and 4 + 4 for
Adam's two moments.
:::

::: check
Why does activation checkpointing cost about a third more compute rather than double?
:::

::: answer
Only the forward pass is repeated: $2N$ of the $6N$ FLOPs per token, so training costs $8N$
instead of $6N$.
:::

## Data parallelism, ZeRO and FSDP {#s9}

The case study's 152.8 GB of model states fit no GPU, and the 84,500 GPU-hours of the 2T-token
plan must be spent in weeks, not years. Both problems are solved by spreading one model's training
over many GPUs. This section does it the simplest way, by replicating or sharding the model
states; [Section 10](#s10) splits the layers themselves.

### Data parallelism and the ring all-reduce

In **data parallelism** every GPU holds the whole model and processes a slice of the global
batch. The gradients are averaged across GPUs by an **all-reduce** before the update, so the
weights stay identical everywhere. Its limit is that every GPU needs the whole model.

The all-reduce is usually a ring. Arrange the $N_d$ GPUs in a ring and split the buffer of $S$
bytes into $N_d$ chunks. In the **reduce-scatter** phase, at each of $N_d - 1$ steps every GPU
sends one chunk of $S/N_d$ bytes to its neighbour and adds the chunk it receives to its own copy;
each GPU forwards the chunk it has just added to, so after $N_d - 1$ steps each holds one chunk
summed over all GPUs. In the **all-gather** phase, $N_d - 1$ more steps pass the summed chunks
around until every GPU has all of them. Each GPU sends, and receives,

$$
2(N_d - 1)\,\frac{S}{N_d} = \frac{2(N_d - 1)}{N_d}\,S \;\longrightarrow\; 2S \quad (N_d \to \infty).
$$

All links work at once, so with per-GPU link bandwidth $\mathrm{BW}$ the time is about
$2S/\mathrm{BW}$, almost independent of the number of GPUs; only the number of steps, and with it
the latency, grows with $N_d$. Frameworks split the gradients into buckets and reduce each bucket
as soon as the backward pass has produced it, hiding most of the time behind computation.

::: figure id=fig-08-14
Four-GPU ring all-reduce. The reduce-scatter table identifies the received
chunk and contributing GPU ranks after each of three steps; the all-gather
table lists fully summed chunks known after each of three steps. Every GPU
sends six quarter-sized chunks, totalling $1.5S$ bytes for an $S$-byte gradient.
:::

The bandwidths to reason with (typical as of 2026): inside an 8-GPU H100 node, NVLink gives about
450 GB/s per direction per GPU (900 GB/s both ways); between nodes, InfiniBand or RoCE gives about
50 GB/s per GPU (400 Gb/s). The factor of nine between them shapes every layout.

::: worked title="The gradient all-reduce for plain data parallelism"
The case study's bf16 gradients are $S = 2 \times 9.551 \times 10^9 = 19.1$ GB. Inside one node
($N_d = 8$) each GPU sends $2 \times 7/8 \times 19.1 = 33.4$ GB, 0.074 s at 450 GB/s. Across 80
GPUs at 50 GB/s each sends $2 \times 79/80 \times 19.1 = 37.7$ GB, 0.75 s, against about 7.5 s of
compute per optimiser step in the 2T-token plan ([Section 10](#s10)). The communication could be
hidden; the memory could not, since every GPU would need all 152.8 GB.
:::

### ZeRO: sharding the model states

ZeRO (Rajbhandari et al. 2020) keeps data parallelism but stops replicating what does not need
to be replicated. With $N$ parameters (the paper writes $\Psi$) on $N_d$ GPUs and $K = 12$ bytes
of optimiser state per parameter, each stage shards one more part of the 16 bytes:

| Strategy | Sharded | Memory per GPU | Case study, 8 GPUs |
|---|---|---|---|
| Data parallelism | nothing | $16N$ | 152.8 GB |
| ZeRO-1 | optimiser states | $4N + 12N/N_d$ | 52.5 GB |
| ZeRO-2 | and gradients | $2N + 14N/N_d$ | 35.8 GB |
| ZeRO-3 | and weights | $16N/N_d$ | 19.1 GB |

On 80 GPUs ZeRO-3 needs 1.9 GB per GPU. The communication follows from what each GPU owns. In
stages 1 and 2 a GPU updates only its $1/N_d$ of the parameters, so the gradients are
reduce-scattered (each GPU receives the sum for its shard) and the updated bf16 weights are
all-gathered: $N + N = 2N$ elements per step, exactly what the data-parallel all-reduce moves.
Stage 3 also shards the weights, so each layer's weights must be all-gathered before the forward
pass and again before the backward pass, plus the gradient reduce-scatter: $3N$, 1.5 times data
parallelism.

::: worked title="Which stages fit on one 8 × 80 GB node"
Add one 8,192-token sequence per GPU from [Section 8](#s8): 42.9 GB of activations (3.61 GB with
full checkpointing) and 4.98 GB of logits.

- ZeRO-3: $19.1 + 42.9 + 5.0 = 67.0$ GB, which fits with 13 GB to spare; with full checkpointing, $19.1 + 3.6 + 5.0 = 27.7$ GB.
- ZeRO-2: $35.8 + 42.9 + 5.0 = 83.7$ GB, which does not fit; with full checkpointing, 44.4 GB.
- ZeRO-1: 100.4 GB without checkpointing, 61.1 GB with it.

Without checkpointing only ZeRO-3 fits; with it, ZeRO-1 and ZeRO-2 fit too.
:::

::: figure id=fig-08-13
Case-study per-GPU total memory estimates on eight GPUs: DP and ZeRO stages
1–3, with and without full activation checkpointing. Each bar includes model
states, one 8,192-token sequence and fp32 logits; the 80 GB line excludes runtime
allowances. Stage 3 passes the simplified bound without checkpointing.
:::

### FSDP and hybrid sharding

**FSDP** (fully sharded data parallel) is PyTorch's implementation of stage 3. The model is
wrapped in units, typically one transformer block each; each unit's weights are all-gathered just
before use and freed after it, and prefetching starts the next unit's gather while the current
unit computes. The trap is gradient accumulation: by default every micro-batch gathers the weights
twice and reduce-scatters its gradients, so the communication of a step grows with the number of
micro-batches. Skipping the reduce-scatter until the last micro-batch keeps an unsharded gradient
on every GPU, and keeping the weights gathered between micro-batches keeps an unsharded copy of
them: either costs the memory sharding was meant to save.

**Hybrid sharding (HSDP)** shards within a node, over NVLink, and replicates across nodes: each
GPU's shard of the gradients is all-reduced with its counterparts in the other nodes once per
optimiser step, and the frequent gathers never leave the node. [Section 10](#s10) shows why this
is the layout the case study's plan uses.

### The global batch

The batch of [Section 6](#s6) is assembled from the layout:

$$
\text{global batch} = \text{micro-batch} \times \text{accumulation steps} \times \text{data-parallel degree}.
$$

The case study's 480 sequences per step on 80 GPUs are 1 sequence per micro-batch × 6
accumulation steps × 80; the continued pretraining of [Section 14](#s14) is 1 × 16 × 8 = 128 on
one node. The parallel layout and the batch size are chosen together.

::: widget name=memory-planner
The defaults are the case study on one 8-GPU node: only ZeRO-3 fits under the 80 GB line. Set
checkpointing to full and watch ZeRO-1 and ZeRO-2 drop below it. Then raise the sequence length
to 32,768: with full checkpointing the fp32 logits become the largest activation term. Finally
switch FlashAttention off.
:::

::: check
Why does ring all-reduce traffic per GPU hardly grow with the number of GPUs?
:::

::: answer
Each GPU sends $2(N_d - 1)/N_d$ of the buffer, which approaches $2S$: more GPUs mean more steps of
smaller chunks, not more bytes per GPU.
:::

::: check
What does ZeRO-3 pay for its $1/N_d$ memory?
:::

::: answer
An extra all-gather of the weights in the backward pass, $3N$ elements per step against data
parallelism's $2N$ (1.5 times), and a per-layer wait for the gather unless it is prefetched.
:::
