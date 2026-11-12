## Tensor, pipeline and context parallelism; choosing a layout {#s10}

Data parallelism and state sharding distribute replicas and their stored training state.
They do not automatically divide the work or activation memory of one large layer.
Additional parallel dimensions split that layer, the layer stack or the sequence.
Their value depends on what currently limits the run: memory capacity, computation
or communication.

### Split a feed-forward network along its natural dimensions

For $\mathbf{Y}=\phi(\mathbf{X}\mathbf{A})$, split the output columns of
$\mathbf{A}$ into $[\mathbf{A}_1,\mathbf{A}_2]$. Each device computes its own
$\mathbf{Y}_i=\phi(\mathbf{X}\mathbf{A}_i)$. An elementwise activation does not
mix those column groups, so it needs no exchange between them. In SwiGLU, gate and
up-projection columns must be partitioned consistently so their elementwise product
uses corresponding features.

For the following $\mathbf{Z}=\mathbf{Y}\mathbf{B}$, split rows of
$\mathbf{B}$ into matching blocks. Devices compute partial sums
$\mathbf{Z}_i=\mathbf{Y}_i\mathbf{B}_i$, and an all-reduce forms
$\mathbf{Z}=\sum_i\mathbf{Z}_i$. Attention can similarly distribute complete heads
and sum partial output-projection contributions. This is **tensor parallelism** (TP),
developed for transformers in [Megatron-LM](https://arxiv.org/abs/1909.08053).

The communication pattern follows from the partitioned calculation, rather than from
the raw model size alone. In a basic transformer TP layout, forward attention and
FFN each require a residual-width reduction; their backward counterparts need related
communication. A commonly used accounting is four residual-sized all-reduces per
layer per training micro-batch. Fusing, overlapping and sequence-parallel variants
change when those exchanges occur.

::: worked title="Two-device splitting, checked algebraically"
Let $\mathbf{X}=(1,2)$ and $\mathbf{A}=\mathbf{I}_2$. After a ReLU,
$\mathbf{Y}=(1,2)$. Split its two columns across two devices and use
$\mathbf{B}=(3,4)^{\top}$. Device one contributes $1(3)=3$ and device two
$2(4)=8$. Their sum is 11, exactly the unpartitioned product. Summing before the
elementwise activation in a different decomposition would generally change the
function: $\phi(a+b)$ need not equal $\phi(a)+\phi(b)$.
:::

At the case-study shape, one bf16 residual tensor for micro-batch one and length
8192 contains $8192(4096)(2)=67{,}108{,}864$ bytes. Four such payloads per layer
across 36 layers total 9.66 GB. At an assumed effective payload rate of 450 GB/s,
the idealised transfer time is 21.5 ms; at 50 GB/s it is 193 ms. Ring factors,
latency and collective contention require a more exact model. The comparison still
explains why frequent layer-level communication should use fast intra-node links.

KV heads must be partitionable at the chosen TP degree or replicated with the
corresponding memory and communication costs. A model with eight KV heads cannot
naively assign disjoint whole KV heads to sixteen TP ranks. Check configuration
divisibility and the implementation's supported layout before launching.

**Sequence parallelism** within a TP group distributes sequence regions for operations
such as normalisation rather than keeping all those activations replicated. Replacing
an all-reduce with reduce-scatter and all-gather can preserve aggregate exchange while
reducing retained replicated activations. It is distinct from splitting the attention
context across a separate group.

### Split the stack with a pipeline

**Pipeline parallelism** (PP) assigns successive layers to stages. Forward activations
cross stage boundaries, and their gradients return during backward. Micro-batches let
different stages process different pieces of the global batch at once.

For a balanced simple schedule with $p$ stages and $m$ micro-batches, fill and drain
cost $p-1$ slots beyond the $m$ useful slots. The idle fraction of total schedule time
is $(p-1)/(m+p-1)$; the overhead relative to ideal busy time is $(p-1)/m$.
Those denominators describe different quantities.

::: worked title="A pipeline's two bubble percentages"
For four stages and eight micro-batches, idle time occupies $3/(8+3)=27.3\%$ of
the schedule. Relative to the eight useful slots, overhead is $3/8=37.5\%$.
With 32 micro-batches the idle fraction falls to $3/35=8.6\%$. To get below
10%, solve $3/(m+3)<0.1$, giving $m>27$, so 28 is the smallest integer that works
under this balanced model.
:::

A one-forward-one-backward schedule reduces the number of simultaneously retained
micro-batch activations compared with accumulating all forwards first. Virtual or
interleaved stages can reduce bubbles at the cost of additional exchanges. Actual
stage time depends on embeddings, vocabulary projection, sequence length and layer
cost, not just the number of layers. The case-study's 36 layers divide evenly into
2, 3, 4, 6 or 9 stages, but equal layer counts do not prove equal stage durations.

### Split the context when a sequence is too large

**Context parallelism** (CP) distributes parts of one sequence. Each rank computes
its local queries while receiving the necessary key/value blocks from other ranks.
[Ring Attention](https://arxiv.org/abs/2310.01889) overlaps blockwise attention with
circulation of those blocks. A causal contiguous partition gives early chunks less
work than late ones; interleaving or paired chunks can improve balance.

At length 131,072, eight-way sequence partitioning gives 16,384 positions per rank.
The local activation term can shrink by approximately eight under the relevant
partition, but the full visibility relation still has to be computed and communicated.
Context parallelism is not a sliding-window approximation. Nor does eight-way CP
automatically divide every stored model state by eight.

### Choose a layout by the limiting resource

Start with the smallest micro-batch that gives a useful kernel workload and check
model states, activations and logits. Apply state sharding within a node if it fits
and keeps weight gathers on fast links. If activation memory or a layer's computation
still limits the run, consider TP. Add PP when splitting the stack is useful and enough
micro-batches exist to limit bubbles. Add CP for long contexts whose local activation
or attention work cannot fit. Use accumulation to reach the global token batch.

Write the layout explicitly, for example DP $\times$ TP $\times$ PP $\times$ CP,
and distinguish a state-sharding subgroup from a replication subgroup. Their product
must describe the actual device topology, not merely multiply to the GPU count.
Expert parallelism introduces a further routing dimension for MoE and exchanges
selected tokens between expert owners.

For the hypothetical 80-GPU base plan, plain replicated AdamW needs 152.8 GB of model
states per GPU and cannot fit an 80 GB allocation. ZeRO-1 over 80 GPUs needs about
39.6 GB of states; adding 42.9 GB activations and 5.0 GB logits also exceeds 80 GB.
Sharding over all 80 ranks reduces state storage, but repeated weight gathers must
cross nodes. A candidate alternative shards over each eight-GPU node and replicates
across ten nodes, with checkpointing for headroom. Its 19.1 GB permanent state shard
does not include peak gathered weights and communication buffers. Measure that candidate
and alternatives instead of declaring a topology optimal from these component counts.

::: check
Why does keeping weight gathers within a node help when accumulation uses many micro-batches?
:::

::: answer
Weight gathers may recur for each micro-batch. Local sharding keeps that frequent
traffic on fast intra-node links; replication across nodes can communicate accumulated
gradient shards less frequently. The benefit depends on actual resharding and overlap.
:::

## What breaks, and how a long run is operated {#s11}

A long run is a process with recovery states, rather than a single optimiser loop.
The same loss spike can arise from bad data, unstable arithmetic or a device failure.
Record enough context to distinguish these causes before choosing a remedy.

### Use the symptom to narrow the cause

A transient spike followed by recovery differs from steady divergence. Inspect loss,
gradient norms, activation scales, attention-logit maxima, output log-normalisers and
the fraction of clipped updates. A spike repeated at the same data position suggests
a batch-specific cause, but deterministic model instability can also recur there.
Reproduce with the same checkpoint and batch, then compare controlled changes.

| Observation | Evidence to inspect | Candidate response |
|---|---|---|
| Loss or gradient becomes non-finite | Input values, precision, norm denominators, offending operation | Skip the invalid update, reproduce and fix the numerical cause |
| Attention logits keep growing | Per-layer query/key scale and attention entropy | Test QK normalisation or scale control |
| Output normaliser drifts | Vocabulary logits and log-sum-exp | Test a targeted output regulariser |
| Training loss improves but held-out loss stalls | Duplicate shards, source proportions, data order | Correct the pipeline and reconsider the mixture |
| Loss is high from the first batch | Tokenizer revision, target shift, masking, initial logits | Check the data/model contract |
| Recovery repeats or skips data | Loader cursor, RNG, worker state, resumed step | Restore data state with model state |
| One replica differs sharply | Device diagnostics, input shard, weight checksums | Reproduce on another device and isolate the fault |

Warmup, clipping, bf16, QK normalisation and output z-loss address different mechanisms.
Clipping a finite global gradient does not repair a non-finite attention intermediate.
Do not claim a remedy worked merely because a restarted run got a different batch.
[Lab 3](#lab3) compares controlled interventions on a small instability experiment.

### A checkpoint must restore the run, not just predictions

Save model and master weights, optimiser moments, scheduler position, step and tokens
seen, RNG states, data-loader progress, configuration, tokenizer identity and data
manifest. Keep earlier checkpoints in case a later one contains corruption. Test a
restore and compare the next batch and next update before relying on recovery.

Asynchronous writes require a consistent snapshot. Copying tensors while they are
being updated can produce a mixture of steps; launching a background write alone
does not make checkpointing correct. Complete checkpoints need a durable completion
record and a recovery rule that ignores unfinished writes.

The case-study master weights and Adam moments take roughly twelve bytes per parameter:
$12(9{,}550{,}729{,}216)=114.6$ GB. Adding bf16 model weights gives about 133.7 GB.
At an assumed aggregate write rate of 2 GB/s, the data alone takes about 57–67 seconds.
Metadata, synchronisation and storage variability can add time.

### Choose a recovery interval with an explicit model

Let checkpoint write time be $\delta$, checkpoint interval $\tau$ and mean time
between interruptions $M$. With uniformly located failures within an interval, average
lost work per failure is $\tau/2$. Approximate overhead per unit time is

$$
f(\tau)=\frac{\delta}{\tau}+\frac{\tau}{2M}.
$$

Differentiate: $f'(\tau)=-\delta/\tau^2+1/(2M)$. Setting it to zero gives
$\tau^*=\sqrt{2\delta M}$. The positive second derivative
$2\delta/\tau^3$ confirms a minimum. This approximation neglects restart time,
failure during writes and non-independent interruptions; it is a planning baseline.

::: worked title="Frequent versus infrequent interruptions"
At a write time of 60 seconds and assumed MTBF 3.09 hours,
$\tau^*=\sqrt{2(60)(3.09)(3600)}=1155$ seconds, or 19.3 minutes.
The estimated overhead is about 10.4%. At assumed MTBF 633 hours, the interval becomes
16,537 seconds, or 4.59 hours, and estimated overhead about 0.73%.
Halving write time shortens the optimal interval by $1/\sqrt2$, rather than by half.
These interruption rates are scenarios, not measured failure predictions for a new cluster.
:::

### Monitor quantities with actions attached

Log per-source loss, held-out loss, gradient and update-to-weight norms, learning rate,
clipping share, activation scales, attention maxima and output normalisers. Also track
tokens per second, peak memory, collective duration, stalled workers, source token
counts and document boundaries. Every alert needs a response: inspect data, reproduce
a numerical failure, restore a known checkpoint or investigate a device.

Known-answer tests and replica comparisons can expose silent corruption, but matching
checksums do not detect a shared software bug. Domain and general evaluations remain
necessary even when training loss and hardware health look normal. A mistaken mixture
or contaminated evaluation can produce a smooth curve for a model that misses its purpose.

::: check
Why is a loss spike at the same resumed data position a useful clue rather than a proof
that the data is faulty?
:::

::: answer
It points to a reproducible interaction with that batch. Inspect and vary the batch,
but also test numerical operations and model state; deterministic instability can recur
on a valid but difficult input.
:::

## Evaluation during the run, and the base-model checkpoint {#s12}

Training loss measures fit to the consumed mixture. It cannot by itself establish
generalisation, useful capability or the absence of contamination. Define evaluation
sets before the run and keep them out of training and data-mixture tuning.

### Separate sources and distributions

Track held-out loss by source and language, not just a mixture average. A large source
can dominate that average while a smaller domain gets worse. Include out-of-mixture
text to test transfer beyond the training distribution. Group near-duplicates before
splitting; otherwise nominally held-out documents can be nearly identical to training.
Changing the tokenizer invalidates direct comparison of per-token loss.

A small frequent evaluation checks data and numerical health. A broader less frequent
battery checks knowledge, reading, arithmetic, code and the required domain in each
language. Keep prompts, tokenisation, scoring and decoding settings fixed for comparing
checkpoints. Generation-based tests add sampling noise; executable tests or reference
answers still need to be correct and sufficiently broad.

### Score an option as a complete continuation

For a base model, a multiple-choice answer can be scored by summing its token
log-probabilities conditioned on the question and earlier option tokens. Include
the intended spacing, template and termination convention. Longer options naturally
accumulate more negative terms. Length normalisation changes the decision criterion;
report it instead of switching criteria after seeing results.

::: worked title="Normalisation reverses a ranking"
Suppose one option has one token with log-probability -1.2, and another has two tokens
with log-probabilities -1.5 and -0.8. Total log-probabilities are -1.2 and -2.3, so
the first wins. Per-token means are -1.2 and -1.15, so the second wins. These are
illustrative scores with stipulated token counts, not a tokenizer measurement. Neither
criterion is automatically correct for every benchmark; use its specified protocol.
:::

### Small benchmarks cannot support precise claims

The uncertainty methods in [Module 01, Section 10](module_01_EN.html#s10) apply here.
At 40% accuracy on 500 independent items, the binomial standard error is
$\sqrt{0.4(0.6)/500}=0.0219$, giving an approximate 95% interval of plus or minus
4.3 percentage points. A 24-item cloze set at 50% has standard error 10.2 points and
a very wide interval. Report item counts and use paired comparisons when the same
items are evaluated by two checkpoints. Overlapping separate intervals alone do not
decide the paired test.

Repeatedly selecting the checkpoint with the highest score on a small validation
set can overfit that set. Use it to guide development and retain a separate final
test. A small apparent gain should not justify a large recipe change without enough
evidence to distinguish it from noise.

### Forecast loss on the run's own distribution

Pilot runs on the same tokenizer and data can support a forecast. One time-series
form is $\mathcal{L}(D)=\mathcal{L}_{\infty}+aD^{-\gamma}$, where $D$ counts
consumed tokens. Fit parameters and inspect residuals as the run advances. A departure
from prediction can signal a changed mixture, repeated data or an optimisation problem;
it does not identify the cause without other diagnostics. Early narrow ranges may
also poorly constrain the asymptote, so show sensitivity to fit windows.

Evaluate several late checkpoints. Averaging nearby weights or maintaining an
exponential moving average can help some runs, but must be evaluated at the same
protocol. Average only compatible parameter layouts and check for regressions. Model
merging is developed in [Module 09](module_09_EN.html).

### What a base release contains

The useful release includes weights, configuration, tokenizer, training log, data
manifest, decontamination record and evaluation curves. Public releases may omit
some of those, leaving uncertainty that downstream measurements must address. The
base completes text; training on mixed documents does not give a reliable assistant
protocol or refusal policy by itself. It may still display incidental instruction-like
behaviour acquired from its corpus. [Module 09](module_09_EN.html) teaches controlled
post-training behaviour and its evaluation.

The hypothetical safety-case team receives an open base and measures domain language
loss, terminology fragmentation and task performance before considering continued
pretraining. A general benchmark score is not enough to justify treating its engineering
claims as reliable. The measurements determine the next step in [Section 14](#s14).

::: check
Two checkpoints score 41% and 44% on the same 500 items. What is needed to assess the gain?
:::

::: answer
Use the paired item outcomes, the evaluation protocol and an uncertainty estimate for
their difference. The separate marginal accuracies do not reveal how many items changed
in each direction. Also account for repeated checkpoint selection on that test set.
:::

## A small run you can actually do {#s13}

A useful small run exercises the complete training pipeline at a scale where mistakes
are cheap. It needs more than a decoder: a reproducible corpus and tokenizer, resumable
loader, schedule, checkpointing, logging and evaluation. A model that finishes without
NaNs has passed only one part of that contract.

### A one-GPU recipe, with an explicit count

Consider a bias-free decoder with twelve layers, width 768, twelve query and KV heads,
SwiGLU width 2048, RoPE, RMSNorm and tied vocabulary size 32,000. Train on a documented
cleaned web-text sample of roughly 2.5 billion tokens. Train the tokenizer on the
training portion, hold evaluation out before preprocessing choices, and record the
sample and tokenizer revisions.

| Component | Initial recipe to test |
|---|---|
| Optimiser | AdamW, betas (0.9, 0.95), weight decay 0.1 |
| Learning rate | Peak $6\times10^{-4}$, 700-step warmup, cosine to $6\times10^{-5}$ |
| Global token batch | 256 sequences of 2048 tokens: 524,288 tokens |
| Precision | bf16 autocast with fp32 optimiser state; verify the implementation's weight policy |
| Stability | Gradient clipping at 1.0; inspect attention and output-logit scales |
| Attention | SDPA with a verified compatible fused implementation |
| Logging | Loss, gradient norm, learning rate and throughput every ten steps |
| Evaluation | Fixed held-out loss every 250 steps and a small task battery |
| Recovery | Complete checkpoint every 500 steps, adjusted from measured write/failure costs |

These are starting settings for a controlled pilot, not a guarantee of stable training
on every mixture. Select the micro-batch and accumulation from peak memory, rather
than attempting to place all 256 sequences in memory at once. Check that accumulation
weights valid tokens consistently, including any masked padding.

::: worked title="109.5M parameters, not a rounded GPT-2 count"
Each layer contains $4(768^2)+3(768)(2048)+2(768)=7{,}079{,}424$ parameters.
Twelve layers contain 84,953,088. The tied embedding contributes $32000(768)=24{,}576{,}000$
and the final norm adds 768, giving **109,529,856**. A 124M GPT-2-shaped count uses
a different vocabulary and learned positions; an architecture family name is not a count.
The exact component arithmetic is checked in [Lab 4](#lab4).
:::

### Tokens, steps and time

At 524,288 tokens per optimiser step, 2.5 billion tokens require approximately 4768.4
full steps. Choose either a partial final batch or a rounded token budget and record
what was actually consumed. A scheduler based on 5000 steps changes the final-token
budget unless that difference is accounted for.

Under the series convention, the tied vocabulary remains in the matrix-multiply
count. Training costs approximately
$(6N+6LdT)D=1.93\times10^{18}$ FLOPs at $T=2048$ and $D=2.5\times10^9$.
The shortcut $6ND$ gives $1.64\times10^{18}$. If sustained throughput were an assumed
40% of a 989 TFLOP/s peak, the model-compute time would be about 1.36 hours; at 25%,
about 2.18 hours. Small matrices, evaluation and pipeline overhead can make the actual
run longer. Measure a representative pilot rather than committing a schedule from
peak arithmetic alone.

A loss of three nats per token would imply perplexity $e^3=20.1$ on the evaluated
tokenizer and corpus. It is an illustrative scale, not a predicted outcome for this
recipe. A fitted law from a different corpus does not establish this run's final
loss. Predict from pilot runs on the same data and report held-out outcomes.

### Scale the process down, not just the model

[Lab 2](#lab2) uses a smaller CPU decoder and TinyStories. Its purpose is to exercise
preprocessing, training, evaluation and sampling at low cost. The lab's per-token loss
is not directly comparable with the web-text recipe because tokenizer and source differ.
Keep the same discipline: record tokens consumed, report QUICK versus full settings,
test recovery and inspect generated samples alongside numerical loss.

::: check
Why cannot a low final loss in the CPU lab establish that the web-text recipe reached
the same quality?
:::

::: answer
The corpus and tokenizer differ, so per-token uncertainty and task difficulty differ.
Compare quality on a shared documented evaluation task or use a comparable unit and
matched protocol, rather than comparing bare token losses.
:::

## Mid-training and continued pretraining {#s14}

The end of a training budget is a useful time to adjust a mixture deliberately and
evaluate higher-quality or more specialised sources. **Mid-training** commonly names
a stage between broad pretraining and behavioural post-training. **Continued pretraining**
(CPT) starts from existing weights and continues the next-token objective, often on a
new domain. Neither term alone defines a unique data recipe or optimiser schedule.

### Extend context with data and a position recipe

A longer window changes more than a position limit. It presents new offsets and more
competing keys, and increases full-attention compute per token. Position interpolation
maps target positions to a shorter trained angular range; [Chen et al.](https://arxiv.org/abs/2306.15595)
study that approach for context extension. Base-frequency changes and other scaling
methods provide different angular mappings. The derivation of RoPE itself is in
[Module 06](module_06_EN.html#s6).

Train on suitable long documents or constructed tasks, test retrieval and multi-step
use across the window, and rerun short-context evaluations. A retrieval success with
one relevant span does not establish reliable reasoning across many spans. Sequence
packing does not automatically make a collection of unrelated short documents equivalent
to one coherent long document.

::: worked title="Long context changes the token budget's compute cost"
The case-study decoder has $N_{\text{matmul}}=8{,}927{,}875{,}072$, $L=36$ and
$d=4096$. At length 8192, per-token training compute is
$6N_{\text{matmul}}+6LdT=6.0815\times10^{10}$ FLOPs. At 131,072 it is
$1.6953\times10^{11}$, about 2.79 times as much. Consuming the same number of
tokens at the longer length therefore costs substantially more even with tiled attention.
:::

### Adapt the distribution while checking what is forgotten

Domain-only training can improve domain loss while degrading general ability. **Replay**
mixes general text into the adaptation stream to preserve evidence of the original
distribution. Its fraction is a variable to test, rather than a universal constant.
Use domain and general held-out sets throughout, plus task tests appropriate to each.
Replay consumes part of the token budget and can slow domain adaptation.

Start with a smaller learning rate than a fresh broad-pretraining peak and compare a
controlled range. Brief warmup is useful when the released checkpoint lacks optimiser
moments: its existing weights do not imply that new Adam state has the correct scale.
Keep the tokenizer fixed unless evidence justifies changing it. New vocabulary rows
require trained embeddings and a compatible output head; adding a token string to a
configuration alone does not teach its meaning.

Measure fragmentation of domain terms before deciding on a tokenizer change. Average
tokens per word is one diagnostic; bilingual text also needs an explicitly chosen
unit such as characters or bytes. A smaller token count does not itself prove better
domain modelling. [Lab 5](#lab5) compares replay and learning-rate choices in a small
continued-training experiment.

### The safety-case decision comes before the run

The following remains a hypothetical case. The team adopts the bilingual open base
from Module 07 to draft and check safety-case arguments for a reactor vessel's
pressure-relief system. First measure domain language loss, term fragmentation and a
domain task suite. Compare a cheaper instruction-tuning baseline. Next-token training
can improve domain distributional fit, but does not by itself supply reliable evidence
handling or guarantee that it is better than instruction tuning for this application.

If the measured gap justifies CPT, prepare 1.8 billion domain tokens and 0.2 billion
general replay tokens. Record source provenance, permitted use and decontamination
against domain evaluation. Candidate sources include public investigation reports,
regulator guidance, published safety-case literature and suitably licensed texts.
Do not count inaccessible or unlicensed material as available data in the budget.

Use length 8192, global batch 128 sequences, a hypothetical peak learning rate
$3\times10^{-5}$, 100 warmup steps and cosine decay to $3\times10^{-6}$. Evaluate
domain loss, general loss and task batteries every 200 steps. Set acceptance margins
before the run: for example, require domain improvement and no more than a one-point
general-task regression, assessed with enough paired evaluation items to resolve that
margin. An observed point estimate alone is insufficient when its uncertainty is larger.

::: worked title="Cost the hypothetical adaptation, not a new base"
The global batch contains $128(8192)=1{,}048{,}576$ tokens. Two billion tokens are
1907.35 such batches: 1907 complete steps undershoot slightly, while 1908 steps
overshoot unless the last batch is shortened. At $6.0815\times10^{10}$ FLOPs per
token, model compute is $1.2163\times10^{20}$ FLOPs. At an assumed sustained
$4\times10^{14}$ FLOP/s per GPU, that is 84.5 GPU-hours or 10.6 idealised hours on
eight GPUs. At an assumed USD 2.50 per GPU-hour, the compute-only charge is about
USD 211. These scenario prices and rates are assumptions as of October 2026.
:::

The per-GPU component estimate with eight-way ZeRO-3 is about 19.1 GB of model states,
42.9 GB of activations and 5.0 GB of fp32 logits: approximately 67.0 GB before extra
buffers. Full checkpointing reduces the activation estimate to 3.61 GB and the subtotal
to 27.7 GB, with additional recomputation. [Lab 4](#lab4) makes those assumptions
executable. Whether an 80 GB allocation is sufficient requires a measured peak.

The two-trillion-token base plan costs a thousand times the model FLOPs of this
two-billion-token adaptation. Corpus construction, evaluation, pilot runs and engineer
time remain additional costs. If CPT passes the predeclared gates, Module 09 starts
behavioural post-training from that checkpoint and trains the intended chat format.
If it fails or is unnecessary, the team can use the instruct release instead. Keep
that decision in the checkpoint lineage rather than silently switching starting models.

::: check
Why warm up a continued-pretraining run when the model already has trained weights?
:::

::: answer
The new optimiser moments may start from zero, and the new distribution can have
different gradient scales. A trained weight state does not supply a trained optimiser
state for the new mixture. Pilot the rate and monitor domain and general outcomes.
:::

## What goes wrong {#wrong}

| Symptom | Candidate cause | Check |
|---|---|---|
| Smooth training curve, weak domain performance | Wrong mixture, fragmentation or evaluation mismatch | Per-source held-out loss and a domain task suite |
| Good held-out loss, poor genuinely new documents | Near-duplicates or contamination | Grouped splitting and decontamination records |
| Memory exceeds the calculator | Gathered layers, fp32 logits, buffers or fragmentation omitted | Measure peak allocations and compare components |
| More GPUs reduce efficiency | Collective traffic, small kernels or pipeline bubbles | Profile representative micro-batches and communication |
| A restart repeats data | Loader/RNG state omitted | Compare the next batch after restoring |
| NaNs recur despite clipping | Invalid intermediates or overflow precede the gradient | Reproduce the offending operation and precision path |
| Domain loss falls, general ability drops | Excessive domain shift or adaptation rate | Replay/rate controls and paired general evaluations |
| Longer context fails simple tasks | Position/data recipe did not establish effective use | Vary evidence location, distractors and task type |
| Small benchmark picks a different best checkpoint each run | Sampling noise or repeated selection | More paired items and a separate final test |

A useful training run has a documented data contract, observable numerical behaviour,
tested recovery and independent evaluation. The decoder is only one part of that process.
