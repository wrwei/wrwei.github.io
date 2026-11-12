## Beyond compute-optimal: over-training and emergence {#s5}

The compute-optimal allocation in [Section 4](#s4) minimises loss for a training budget.
A deployed model also consumes compute whenever it answers a request. A smaller model
trained on more tokens can spend extra compute once and save compute on every later
request. Whether that trade pays depends on how much the model will be used.

### Fix quality, then count the model's life

Recall the fitted loss law $\mathcal{L}(N,D)=E+A/N^\alpha+B/D^\beta$. Here $A$ and
$B$ are fit coefficients, not batch sizes. To reach a target loss $\mathcal{L}_*$ with
size $N$, rearrange the data term:

$$
D(N)=\left(\frac{B}{\mathcal{L}_*-E-A/N^\alpha}\right)^{1/\beta}.
$$

This is meaningful only when the denominator is positive. Below the corresponding
size threshold the model-size term already exhausts the permitted loss, and no finite
amount of data reaches the target under this fit. Just above the threshold, the required
data can be extremely large. Making a model indefinitely smaller is not a free trade.

For $D_{\text{inf}}$ served tokens, a simple lifetime compute approximation is

$$
C_{\text{life}}(N)=6ND(N)+2ND_{\text{inf}}.
$$

It uses the scaling-law approximation with total parameters and ignores attention.
Actual compute uses [Module 06's convention](module_06_EN.html#s11); actual cost also
depends on batching, precision, memory bandwidth and utilisation. This expression is
a model for exploring the direction of the trade, not an invoice calculator.
[Sardana et al.](https://arxiv.org/abs/2401.00448) incorporate inference demand into
scaling decisions and examine the limitations of extrapolating fitted laws to very
large token-to-parameter ratios.

::: worked title="A serving break-even in the approximate FLOP model"
Compare a 70-billion-parameter model trained on 1.4 trillion tokens with a
9.5-billion-parameter model trained on 15 trillion tokens. Their approximate training
costs are $6(70\times10^9)(1.4\times10^{12})=5.88\times10^{23}$ and
$6(9.5\times10^9)(15\times10^{12})=8.55\times10^{23}$ FLOPs. The smaller model
spends $2.67\times10^{23}$ extra FLOPs during training but saves
$2(70-9.5)\times10^9=1.21\times10^{11}$ per served token.
Dividing gives a crossover of $2.21\times10^{12}$ served tokens, about 221 days
at an assumed ten billion tokens per day. This is a fit-based comparison of nearly
equal predicted loss, not measured equal capability or a feasible deployment plan.
:::

The comparison uses a rounded 9.5B size to keep the calculation readable. The exact
case-study configuration remains 9,550,729,216 parameters; use that count for memory
and its non-lookup count for the calculator in [Lab 6](#lab6).

Increasing inference demand adds a steeper size penalty to the lifetime objective.
The chosen size can decrease and its training-token allocation increase. At low demand,
the extra training may never pay back. At high demand, a useful model with slower
improvement per added training token can still have a better lifetime budget. A quality
constraint must include the actual task: equal average language loss need not imply
equal reliability on a safety-case assessment.

### Diminishing returns and the data supply

The data contribution scales as $D^{-\beta}$. To halve it, solve
$D_{\text{new}}^{-\beta}=D^{-\beta}/2$, giving
$D_{\text{new}}/D=2^{1/\beta}$. At $\beta=0.28$, this is approximately 11.9.
This halves only the data term, not the irreducible and model-size terms. A twice-as-long
run therefore gives much less than a halving of total loss.

The fitted variable counts consumed tokens, but the useful supply of distinct, clean
text is finite. Repeated data, changed mixtures and generated data need separate
measurements; they are not automatically equivalent to fresh draws from the fitted
distribution. [Module 08](module_08_EN.html) develops the data pipeline and the tests
that make a longer run meaningful. Do not multiply one corpus indefinitely and assume
the original scaling fit remains valid.

### A smooth predictor can have a sharp reported score

A benchmark may require every token of an answer to be correct. Under the simplified
assumption of independent correctness with probability $p$ for each of $k$ tokens,
exact-match probability is $p^k$. Token independence is not a realistic general model
of language errors; it is sufficient to demonstrate what a nonlinear metric can do.

::: worked title="Ten tokens, all-or-nothing scoring"
For a ten-token answer, per-token correctness of 0.5, 0.7, 0.8, 0.9, 0.95 and 0.99
gives exact-match probabilities 0.001, 0.028, 0.107, 0.349, 0.599 and 0.904.
The underlying parameter improves smoothly, yet the displayed accuracy moves from
nearly zero to useful-looking values over a short range. A benchmark that rounds
small scores to zero makes the apparent transition sharper still.
:::

[Schaeffer, Miranda and Koyejo](https://arxiv.org/abs/2304.15004) examine how metric
choice can produce apparent emergence. A discontinuity in a plot alone does not
identify a discontinuity in a model's computation. Compare exact match with per-token
credit, edit distance or correct-answer log-likelihood, and inspect uncertainty from
the finite evaluation sample. Conversely, a smooth partial-credit score does not make
an incomplete safety-critical answer acceptable. Report both the diagnostic measure
and the acceptance criterion that the application actually requires.

::: check
An exact-match score jumps from 3% to 60%. What evidence is missing before calling
the change a newly acquired mechanism?
:::

::: answer
Check answer length, metric nonlinearity, sampling uncertainty and a continuous
correct-answer score. Then test the capability with controlled examples and interventions.
The aggregate jump alone does not identify its cause.
:::

## In-context learning, prompting and the chat format {#s6}

**In-context learning** changes predictions by supplying demonstrations in the current
input, without an optimiser update. A zero-shot prompt describes the task. A few-shot
prompt adds solved examples. The weights remain fixed; the hidden states and resulting
conditional distribution change with the new context.

Consider a prompt containing records labelled `A` or `B`, followed by one unlabelled
record. The examples can specify what the labels mean, show the output format and
suggest the local data distribution. Label strings have no universal meaning. If the
prompt consistently assigns `A` to a high-pressure record, the intended task differs
from a prompt assigning `B` to the same records.

### Examples teach more than the intended rule

The sequence includes irrelevant signals as well: label frequencies, order, lexical
patterns and the most recent answer. A model may rely on those instead of the desired
decision rule. Evaluate several demonstration orders and balanced held-out cases.
Examples used to choose the prompt must not also be the final test set.

There are several accounts of why next-token training supports these behaviours.
Documents contain local conventions, repeated patterns and latent tasks. Predicting a
continuation can reward inferring the convention. Induction-style attention circuits
provide one concrete way to complete repeated patterns, as measured in
[Module 06, Lab 6](module_06_EN.html#lab6). An implicit-inference account treats the
prompt as evidence about an unknown task. These accounts illuminate mechanisms;
none establishes that every few-shot response uses one unique algorithm.

**Contextual calibration** estimates label bias on a content-free input and compensates
for it. The choice of neutral input matters: `N/A` may itself be associated with a label.
[Zhao et al.](https://arxiv.org/abs/2102.09690) study this adjustment for few-shot
prediction. It is not the same as calibrating the probability that a generated factual
statement is true.

::: worked title="A label prediction that changes after bias correction"
Suppose a content-free prompt gives probabilities 0.70 for yes and 0.30 for no.
A test record gives 0.60 and 0.40. Uncorrected, yes wins. Divide the test probabilities
by the corresponding content-free probabilities: $0.60/0.70=0.857143$ and
$0.40/0.30=1.333333$. Renormalising gives 0.391 and 0.609, so no wins.
This is an adjustment under a particular bias model, not proof that the corrected
answer is true. Test whether it improves held-out decisions.
:::

### Intermediate text provides additional serial computation

When a model writes intermediate steps, each new step is conditioned on earlier steps.
The same fixed-depth network is applied repeatedly, giving the answer more sequential
computation. This can improve multi-step tasks, but an incorrect intermediate statement
also becomes context. A coherent-looking chain is not an independent verification.

Sampling several chains and aggregating final answers can reduce some errors when
different samples contribute useful variation. Correlated mistakes or a shared false
premise survive majority voting. For an engineering calculation, check the final units,
arithmetic and evidence independently rather than treating agreement as proof.

### Base continuation versus an assistant turn

A base model is trained to continue text. A question can be followed by an answer,
another question or an exam option depending on its learned distribution. Post-training
teaches an assistant interaction format. Messages with roles are serialised by a
**chat template** into the tokens used during that training.

For the Qwen2.5 instruct family, a simple system/user prompt is rendered in a
ChatML-style form. The illustrative contents below are chosen for this example;
the boundary markers come from the checkpoint's template.

```text
<|im_start|>system
Draft a hazard record. State unknown evidence explicitly.<|im_end|>
<|im_start|>user
The pressure-relief valve did not open during the test.<|im_end|>
<|im_start|>assistant
```

The final assistant marker is a generation prompt: the model should complete that
turn. `<|im_end|>` closes a turn and is the instruct tokenizer's end-of-sequence
token. The [checkpoint's tokenizer configuration](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/tokenizer_config.json)
is the authority for its exact template, including default system content. Supply an
explicit system message when the application needs one; do not assume a default from
another checkpoint or tokenizer version.

Call `tokenizer.apply_chat_template(messages, tokenize=True,
add_generation_prompt=True)` and inspect the rendered text once. Avoid adding a
second set of special tokens after an already formatted template. If training and
serving use different delimiters or role conventions, instruction-following can
degrade even though the model weights loaded successfully.

The hypothetical safety-case tool supplies role, evidence rules and schema in the
system turn, the engineer's request in the user turn, then parses and checks the
assistant turn. Role markers express the trained conversation format; they do not
make untrusted document instructions harmless. Prompting methods and application
evaluation are developed in the [AI Agents series](../agent/index.html).

::: check
Why can reordering the same four demonstrations change a classification?
:::

::: answer
The model conditions on their sequence as well as their content. Recency, local
patterns and label bias can change the logits, even with fixed weights. Evaluate
multiple orders and keep the final test examples separate from prompt selection.
:::

## Decoding: from logits to text {#s7}

At each generation step the model returns logits $\mathbf{z}\in\mathbb{R}^{V}$.
The softmax gives a next-token distribution. A **decoding rule** chooses a token from
that distribution or a modified one. That token becomes part of the next input, so
a small choice today changes every later conditional distribution.

### Greedy is a local choice

Greedy decoding selects the largest logit. It is deterministic for exactly fixed
logits and a fixed tie-breaking rule. It does not find the most probable complete
sequence, and does not guarantee factual correctness.

::: worked title="The locally best token loses globally"
The first step gives $p(A)=0.6$ and $p(B)=0.4$. Suppose A's best successor has
conditional probability 0.3 while B's best successor has probability 0.9. Greedy
chooses A and its best two-token sequence has probability $0.6(0.3)=0.18$.
The B sequence has probability $0.4(0.9)=0.36$, twice as high.
:::

Beam search retains several partial sequences and compares summed log-probabilities.
Its bookkeeping and length normalisation are in [Module 04](module_04_EN.html).
Optimising likelihood can still produce bland or repetitive open-ended text; a
high-probability sequence is not automatically a good answer. [Holtzman et al.](https://arxiv.org/abs/1904.09751)
analyse degeneration under common decoding strategies and propose nucleus sampling.

### Temperature and entropy

For temperature $\tau>0$,

$$
p_i(\tau)=\frac{\exp(z_i/\tau)}{\sum_j\exp(z_j/\tau)}.
$$

Dividing by a positive number preserves the ranking of logits. Temperature changes
sampling probabilities, not the argmax. A deterministic greedy mode is the usual
meaning of a user-facing temperature-zero setting; division by zero is not the
implementation of that limit. At $\tau=1$ the original distribution is recovered.
Large temperature approaches uniform probability over finite unmasked logits.

The change in entropy can be derived. Put $\beta=1/\tau$ and
$Z(\beta)=\sum_i e^{\beta z_i}$. Since
$\ln p_i=\beta z_i-\ln Z$, entropy in nats is
$H=\ln Z-\beta\mathbb{E}_p[z]$. Differentiation gives
$d\ln Z/d\beta=\mathbb{E}_p[z]$. Also
$dp_i/d\beta=p_i(z_i-\mathbb{E}_p[z])$, so

$$
\frac{d\mathbb{E}_p[z]}{d\beta}
=\sum_i z_i p_i(z_i-\mathbb{E}_p[z])
=\mathbb{E}_p[z^2]-\mathbb{E}_p[z]^2
=\operatorname{Var}_p(z).
$$

Substitution cancels the two mean terms in $dH/d\beta$, leaving
$dH/d\beta=-\beta\operatorname{Var}_p(z)$. Since $d\beta/d\tau=-1/\tau^2$,

$$
\frac{dH}{d\tau}=\frac{\operatorname{Var}_p(z)}{\tau^3}\ge0.
$$

This monotonicity holds for fixed logits and fixed support. If another filter changes
the surviving set as temperature changes, the entropy of the filtered distribution
need not follow the same smooth derivative. With $m$ tied maximum logits, the
zero-temperature limit has entropy $\ln m$; with a unique maximum it is zero.

::: worked title="Three logits at two temperatures"
Use logits $(2,1,0)$. At temperature one, subtracting the maximum gives weights
$(1,e^{-1},e^{-2})$, probabilities $(0.665,0.245,0.090)$ and entropy 0.832 nats.
At temperature 0.5, the weights become $(1,e^{-2},e^{-4})$, probabilities
$(0.867,0.117,0.016)$ and entropy 0.441 nats. The largest token stays the same
while sampling becomes more concentrated.
:::

### Truncate a tail before sampling

**Top-k** retains the highest $k$ logits and renormalises. The same $k$ can keep
implausible options for a confident distribution or discard useful alternatives for
an uncertain one. Implementations that retain all values tied at the threshold can
keep more than $k$ tokens; report the actual rule if ties matter.

**Top-p**, or nucleus sampling, sorts probabilities in descending order and retains
the smallest prefix reaching a chosen cumulative mass. Include the token that crosses
the threshold. A common implementation error removes that token, possibly leaving a
set with less mass than requested. Renormalise over the retained tokens before sampling.

**Min-p** retains tokens whose probability is at least $p_{\min}$ times the largest
probability. Cancelling the common softmax denominator gives

$$
\frac{p_i}{p_{\max}}=e^{(z_i-z_{\max})/\tau}\ge p_{\min}
\quad\Longleftrightarrow\quad
z_i\ge z_{\max}+\tau\ln p_{\min}.
$$

The threshold depends on relative rather than absolute mass. A min-p value of zero
disables this filter; handle that case explicitly instead of evaluating $\ln0$.
Claims about which sampler produces better text require task-specific comparisons;
the [critical re-analysis of min-p](https://arxiv.org/abs/2506.13681) is a reminder
that an attractive mechanism alone does not establish a quality advantage.

::: worked title="Different filters retain different sets"
For probabilities $(0.665,0.245,0.090)$, top-k with $k=2$ retains the first two.
Top-p with threshold 0.9 also retains the first two because their cumulative mass is
0.910. Min-p with threshold 0.3 uses a cutoff of $0.3(0.665)=0.200$ and retains
the first two. At threshold 0.5 the cutoff is 0.333, retaining only the first.
The surviving two-token distribution is approximately $(0.731,0.269)$, rather than
the original unnormalised pair. Agreement on this example does not make the filters
equivalent on other distributions.
:::

Apply filters in a reported order. Temperature changes probabilities; top-k changes
support; top-p's cumulative mass then refers to that changed distribution. Min-p ratios
among surviving logits remain unchanged by renormalisation, but it cannot restore
tokens removed earlier. [Lab 5](#lab5) compares an explicit implementation with the
installed library's filter classes rather than assuming every serving system uses
the same order.

::: widget name=sampling-explorer
Compare concentration and retained support while changing temperature and truncation.
Watch the numeric probabilities as well as the sampled tokens: a sampled sentence
alone does not reveal the distribution that produced it.
:::

The demo uses twelve saved candidate logits per preset, renormalised within that
candidate set. At temperature 1, preset A has entropy 3.312 bits, while preset B
has entropy 1.085 bits and assigns 0.849 to `safe`. Top-p at 0.9 retains ten candidates
from A but three from B. Min-p at 0.1 retains all twelve from A but only `safe` from B.
These values concern the displayed candidate set, not the model's full vocabulary.

### Penalising repetition has a cost

One repetition penalty divides positive logits by a factor $\rho>1$ and multiplies
negative logits by that factor for previously generated tokens. Both changes lower
those logits: 2 becomes 1.538 at $\rho=1.3$, while -1 becomes -1.3. Frequency and
presence penalties instead subtract terms based on count or prior occurrence.
No-repeat n-gram rules prohibit selected continuations entirely.

An identifier, JSON key or code symbol may need exact repetition. A penalty that
reduces a prose loop can corrupt those required repetitions. For extraction, use
a deterministic rule and schema validation where appropriate. For open-ended text,
compare sampled settings on a fixed evaluation suite. Report temperature, filters,
penalties, seed and stopping rules with any generated result. None of these settings
replaces evidence checking.

::: check
Does increasing temperature change which token has the largest probability?
:::

::: answer
For fixed logits and positive temperature, no: ranking is preserved. It changes
sampling probabilities. Subsequent generated context can of course change later logits.
:::

## Determinism, structured output and the cost of each token {#s8}

Greedy decoding removes a random draw from a fixed distribution. It does not ensure
that every execution computes exactly the same logits. Floating-point arithmetic,
batch layout, kernel choices and model updates can still affect the result.

### Finite precision changes the calculation

In float32, `(1e8 + 1) - 1e8` evaluates to zero, while `(1e8 - 1e8) + 1` evaluates
to one. The first addition cannot retain the small increment at that magnitude.
Changing reduction order can therefore change the last digits of a matrix product.
Different batch shapes can select different tilings and reduction paths.

::: worked title="A unit increment in bfloat16"
Bfloat16 has seven stored fraction bits, plus the leading significant bit. In the
interval from 256 through 512, adjacent representable numbers are two apart. The
exact sum 257 lies halfway between 256 and 258; round-to-nearest-even gives 256.
Thus adding one to 256 can leave it unchanged. Larger exponent range does not give
high precision within that range.
:::

Suppose the top two logits differ by $10^{-6}$ while a changed reduction alters them
by several $10^{-6}$. The argmax can flip. One changed token then changes every
subsequent prefix. A fixed seed cannot repair a changed deterministic argmax, and
identical outputs in one experiment do not guarantee equality on every prompt.

Log checkpoint revision, tokenizer, chat template, dtype, implementation and decoding
settings. A regression test may compare parsed meaning and required fields rather
than text bytes. If bitwise reproducibility is required, validate it across the actual
batch sizes, hardware and kernels being served. Do not infer it from the temperature
parameter alone.

### Structure constrains syntax, not truth

A grammar or schema can exclude tokens that would make a continuation invalid,
setting their logits to $-\infty$ and renormalising the survivors. This can guarantee
well-formedness under the implemented grammar when generation completes successfully.
It cannot guarantee that a hazard's severity, evidence reference or engineering claim
is correct. A closed set should include a meaningful unknown or abstain option when
the evidence does not support a classification. Whole-continuation likelihood scoring
is another way to choose among a short list. Serving mechanics are covered in
[Module 10](module_10_EN.html#s10).

For a structured hazard record, parse the output, check field constraints and verify
evidence separately. Sampling variability is only one source of invalid records;
even greedy output can be truncated, malformed or factually wrong without those checks.

### Stopping is part of the protocol

Use the checkpoint's end-of-turn/end-of-sequence tokens, suitable stop strings where
needed, and a maximum new-token budget. A stop string can cut a legitimate quoted
passage; a token budget can cut a JSON object halfway through. Distinguish a complete
assistant turn from a budget-exhausted partial answer. Otherwise a downstream parser
may mistake a generation limit for a model's intended conclusion.

Prefill processes the input positions in parallel within each layer. Autoregressive
decode processes successive output positions serially, one forward step for each.
That distinction explains why output latency cannot be estimated from prompt length
alone. Caching avoids repeated prefix projections, but each new query still reads its
visible keys and values. The calculator in [Lab 6](#lab6) estimates a single-stream
bound; [Module 10](module_10_EN.html) measures the serving consequences.

::: check
Does a schema-valid hazard record establish that the hazard assessment is correct?
:::

::: answer
No. The schema checks the permitted structure and values. Evidence, units, consistency
and engineering correctness need separate checks, including an abstention path when
required information is absent.
:::

## The context window {#s9}

The context includes system and user turns, demonstrations, retrieved passages, tool
results and generated output so far. All consume tokens. A model's supported window
therefore is a shared budget, rather than space available only for the user's document.
Budget output tokens as well as the complete templated input before sending a request.

### A longer input has memory and compute costs

This module uses decimal GB, $10^9$ bytes. The case-study decoder has 36 layers,
eight KV heads of width 128 and bf16 cached values. Its cache adds
$2(36)(8)(128)(2)=147{,}456$ bytes per token, or 144 KiB. Six thousand retained
tokens require 0.885 GB; 32,000 require 4.72 GB; 128,000 require 18.87 GB.
These are one-sequence tensor counts, excluding allocation overhead, and assume
full attention at every layer. Multiple live requests each need retained state.

The first factor two counts keys and values. Query heads remain 32; grouped keys
make this cache four times smaller than full multi-head storage at the same width.
Weights quantised to four bits do not automatically quantise the cache. At a long
context, a bf16 cache can outweigh the estimated 5.53 GB quantised weight file.

For causal prefill over $T$ tokens, the series convention estimates

$$
C_{\text{prefill}}\approx2N_{\text{matmul}}T+2LdT^2.
$$

The second term assumes masked pairs are skipped. The ratio of attention to weight
work is $LdT/N_{\text{matmul}}$, reaching one at
$T=N_{\text{matmul}}/(Ld)\approx60{,}546$ for this configuration. FlashAttention
removes quadratic intermediate storage while retaining this quadratic full-attention
arithmetic. Sliding windows change the arithmetic by changing visibility.

::: worked title="Three input lengths under one assumed compute rate"
Use $N_{\text{matmul}}=8{,}927{,}875{,}072$ and an assumed sustained rate of
$4\times10^{14}$ FLOP/s. At $T=4000$, weight work is $7.1423\times10^{13}$ and
attention $4.7186\times10^{12}$ FLOPs, totalling $7.6142\times10^{13}$: 0.190 s
of idealised compute time. At 32,000, total compute is about $8.73\times10^{14}$,
or 2.18 s. At 128,000, it is $7.12\times10^{15}$, or 17.8 s. These divide model
FLOPs by a sustained-rate assumption; queueing, implementation overhead and transfers
are not measured by the calculation.
:::

### Supported length versus effective use

A model can accept positions that it uses poorly. RoPE rotations exist beyond training
length, but extending useful context requires a compatible position recipe and
long-context training, covered in [Modules 06](module_06_EN.html#s6) and
[08](module_08_EN.html#s14). Changing a configuration's maximum length alone is
not evidence of long-context competence.

In the experiments of [Liu et al.](https://arxiv.org/abs/2307.03172), answer quality
depended strongly on where relevant information appeared, including poorer performance
in the middle of long contexts. Treat this as a measured result for the studied tasks
and models, not a universal positional law for every later checkpoint. Test the actual
model with relevant evidence at several positions and with distractors.

A single exact retrieval task does not cover multi-hop reasoning, conflicting evidence,
aggregation or correct citation. The case-study evaluation should vary evidence
position, record length and the number of relevant passages. Keep important task
instructions clear and the immediate question close to generation, but measure the
effect rather than assuming a placement convention solves the problem.

### Stable prefixes can be reused

Prefix caching reuses retained states on an exact supported token-prefix match. Put
stable system instructions, schemas and reference material before variable request
content; changing an early timestamp or identifier can destroy a useful shared prefix.
Cache scope, retention and pricing are service-specific. Under this module's assumed
cached-input price of 10% of ordinary input, a 3000-token stable prefix in a 4000-token
input reduces the input bill to $(1000+0.1(3000))/4000=32.5\%$ of the uncached amount
if every request hits. The output bill is unaffected. [Lab 6](#lab6) costs both cases;
[Module 10](module_10_EN.html#s6) explains implementation.

Retrieving only relevant evidence is an alternative to sending a complete long document.
It has its own recall and attribution failures. The [AI Agents series](../agent/index.html)
develops retrieval workflows; the model must still handle the selected evidence reliably.

::: check
Why does adding a timestamp at the very start of a repeated prompt reduce prefix reuse?
:::

::: answer
The first differing token ends the common token prefix. Stable content after that
difference cannot ordinarily reuse the original prefix's computed state. Put request-
specific values after the content intended for reuse, subject to the server's cache rules.
:::
