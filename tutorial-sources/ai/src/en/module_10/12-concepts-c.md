## Speeding up decode: speculative decoding and its relatives {#s9}

A bandwidth-bound target model can score several positions in a matrix product
for much less than the cost of several separate decode steps. The difficulty is
knowing those positions' tokens before the target has selected them.
**Speculative decoding** lets a cheaper draft propose tokens, then asks the target
to verify the proposals together. It exploits spare arithmetic capacity while
retaining the target's conditional output distribution through an acceptance and
correction rule.

The draft need not have the target's quality. It needs to be sufficiently cheap
and sufficiently similar on the served workload for the verification to save
time. A poor draft can remain mathematically correct while making inference
slower. This distinction is central: acceleration is an empirical property of
models, kernels and load; exactness is a property of the algorithm and its inputs.

### Accept overlap and restore missing mass

At one conditional position, let $p$ be the target distribution and $q$ the draft
distribution over the same token ids. Sample $x\sim q$ and accept it with
probability $\min(1,p(x)/q(x))$. If it is rejected, draw a replacement from

$$
r(x)=\frac{\max(0,p(x)-q(x))}{\sum_y\max(0,p(y)-q(y))}.
$$

A token with $q(x)=0$ is never drafted, so its acceptance ratio need not be
evaluated. It can still be drawn from the residual if the target assigns it
positive mass. If $p=q$, every proposal is accepted and no residual is needed.
Implement that case without dividing by zero.

Let $\beta=\sum_x\min(p(x),q(x))$, the acceptance probability at this position.
The accepted contribution to output probability is
$q(x)\min(1,p(x)/q(x))=\min(p(x),q(x))$. The residual normaliser is
$\sum_x[p(x)-\min(p(x),q(x))]=1-\beta$. Therefore

$$
\begin{aligned}
P(\mathrm{output}=x)
&=\min(p(x),q(x))+(1-\beta)r(x)\\
&=\min(p(x),q(x))+p(x)-\min(p(x),q(x))\\
&=p(x).
\end{aligned}
$$

Using $\min(p,q)=(p+q-|p-q|)/2$ also gives

$$
\beta=1-\frac12\sum_x|p(x)-q(x)|=1-\mathrm{TV}(p,q).
$$

Acceptance is distributional overlap, not the probability that the draft's
largest logit equals the target's. The greedy version uses an argmax comparison
instead; its acceptance statistic has a different interpretation. For stochastic
generation, $p$ and $q$ must reflect the actual temperature, truncation and grammar
rules used by the respective samplers. Applying the ratio to raw softmax outputs
while sampling a differently filtered draft invalidates the proof.

::: worked title="Four vocabulary entries"

Take $p=(0.50,0.30,0.15,0.05)$ and $q=(0.40,0.40,0.10,0.10)$. Acceptance ratios
clipped at one are $(1,0.75,1,0.5)$. The overlap masses are
$(0.40,0.30,0.10,0.05)$, summing to 0.85. The residual is
$(0.10,0,0.05,0)/0.15=(2/3,0,1/3,0)$.

The first output probability is $0.40+0.15(2/3)=0.50$; the third is
$0.10+0.15(1/3)=0.15$. The other two are 0.30 and 0.05. The output is exactly
$p$ despite drawing proposals from $q$. Rejecting and simply redrawing from $p$
would not produce this correction and is not the same algorithm.

:::

### Verify a chain, then roll back the uncommitted states

The draft proposes $\gamma$ tokens autoregressively. One target pass over the
last committed token and those proposals supplies $\gamma$ acceptance distributions
and a distribution for one extra **bonus token**. Check proposals in order. At
the first rejection, emit a residual replacement and stop that iteration. If
all proposals are accepted, emit the bonus from the target. An iteration thus
commits between one and $\gamma+1$ output tokens.

The target scored later positions under proposed prefixes. If an earlier proposal
is rejected, those later states are conditioned on an uncommitted prefix and must
be discarded. Crop both model caches back to the committed boundary. Feed any
committed tokens missing from the draft's cache before proposing again. Lab 5
makes this bookkeeping explicit; accepting the right tokens with the wrong
cache rollback would not preserve later conditional distributions.

The greedy special case accepts a proposal when it equals the target's argmax,
then emits the target's argmax at the first mismatch or bonus position. With
identical numerical logits it reproduces the target's greedy sequence. Different
batch shapes can change near-tied logits in floating-point arithmetic, so
implementation checks need both token comparisons and numerical diagnostics.

::: figure id=fig-10-13

Four cheap proposals share one target verification. A rejection after three
accepted proposals commits those three and one correction token; the later
verified states are discarded. The illustrative 1.2-target-step duration assumes
a draft cost ratio 0.05 and unit verification cost.

:::

### Derive the speed-up rather than naming an acceptance rate

Assume, for a tractable model, independent acceptances with common probability
$\alpha$. Let $K$ be committed output tokens, including the replacement or bonus.
The probability of reaching at least $k$ accepted drafts is $\alpha^k$, hence

$$
\mathbb{E}[K]=1+\sum_{k=1}^{\gamma}\alpha^k
=\frac{1-\alpha^{\gamma+1}}{1-\alpha}.
$$

At $\alpha=1$, use the limit $\gamma+1$. With varying conditional acceptance,
the survival probabilities replace $\alpha^k$; one average acceptance rate need
not predict a real chain accurately. Short output limits also truncate the last
iteration while still paying for proposals that are discarded.

If a draft step costs $c$ target-step times and verification costs
$v_\gamma$ target steps, iteration time is approximately
$(\gamma c+v_\gamma)t_{\mathrm{target}}$. The speed-up estimate is

$$
S(\gamma)=\frac{\mathbb{E}[K]}{\gamma c+v_\gamma}.
$$

Unit verification cost is plausible when spare compute lets several positions
reuse a bandwidth-bound weight read. It fails when verification reaches a compute
limit, adds substantial cache traffic or encounters kernel overhead. At high
serving load, target batches already reuse weights, leaving less spare compute
for proposals. Speculation can then become a loss even for a good draft.

::: worked title="A cheap draft and an expensive one"

For $\alpha=0.8$, $\gamma=4$, $c=0.05$ and $v=1$, expected output is 3.3616
tokens and predicted speed-up is $3.3616/1.2\approx2.80$. With $\alpha=0.6$ it
falls to about 1.92. Keeping $\alpha=0.8$ but raising $c$ to 0.4 gives only 1.29.
At $\alpha=0.8,c=0.05,v=1$, searching lengths one through sixteen finds a best
length of eight, with speed-up about 3.09. More proposals eventually cost more
than their diminishing expected benefit.

:::

::: widget name=speculative-speedup

Raise draft cost and watch the best draft length shrink. Then edit the target
and draft distributions and simulate the acceptance/residual rule. Panel A's
independent acceptance model is separate from Panel B's single-position theorem.

:::

Lab 5's CPU draft costs about 0.447 of a target step; verification at draft
length four costs 1.224 target steps. It measured acceptance 0.865, 3.636 emitted
tokens per iteration and a 1.123× speed-up, with all five outputs equal to the
target baseline. The independent-rate model predicted 3.819 tokens per iteration
and 1.268× speed-up. Truncated final iterations, conditional dependence, draft
catch-up, prefill and timing noise explain why a short-cost model is only a guide.
At length six the measured gain dropped to 1.012×. The recorded experiment does
not justify promising a threefold gain on a CPU.

### Other proposals and smaller models

Leviathan et al. and Chen et al. independently developed the speculative-sampling
approach. Later mechanisms alter how proposals are obtained. Medusa adds heads
that propose future tokens, with tree verification. EAGLE drafts from target
features using a lightweight predictor. Prompt-lookup decoding proposes a known
continuation after a matching n-gram in the input, which is cheap and can work
well for copying or editing. Lookahead decoding constructs candidate n-grams
through parallel iterative updates. The applicable verification rule determines
what exactness, if any, each configuration preserves.

Distillation permanently substitutes a cheaper model and accepts whatever quality
trade-off its evaluation shows; Module 9 treats that training choice. A
mixture-of-experts model activates only selected experts for a token but must
usually hold all experts. For an illustrative 46.7B-total, 12.9B-active model,
4.9 bits per parameter gives about 28.6 GB total storage and 7.9 GB active-weight
traffic. It cannot fit in a 24 GB budget even though its single-token traffic
looks smaller. At larger batches different tokens may activate different experts,
so aggregate traffic rises towards more of the total. Sparse activation is not
a promise of dense-model capacity or batch scaling.

::: check

If you use the target itself as the draft, with equal step cost and unit
verification cost, does perfect acceptance provide an acceleration?

:::

::: answer

No. With $\alpha=1$ and $c=1$, expected output and modelled cost are both
$\gamma+1$ target steps, giving speed-up one. Perfect overlap helps only when
the proposals are cheaper to obtain.

:::

## Structured output and the serving engine {#s10}

A serving engine does more than call a model forward method. It renders messages,
allocates cache, schedules competing workloads, selects tokens and streams text.
These operations must agree with the checkpoint's expected inputs and with the
application's interpretation of outputs. An HTTP endpoint that returns text is
only the outside of that system.

### Build a mask from a grammar

[Module 7](module_07_EN.html) introduces constrained generation by masking invalid
tokens. The engine needs a fast way to determine validity. A finite-state machine
can recognise regular structures; nested syntax generally needs a context-free
grammar and a stack or equivalent parser state. Compile the accepted structure
and index which vocabulary tokens can extend a valid prefix from each state.
A token may span several characters, so the index must follow its entire decoded
piece, not check only its first character.

At each step, set invalid-token logits to $-\infty$, renormalise the allowed
distribution, select a token and advance the grammar state. A precompiled index
avoids scanning a large vocabulary through a complex parser on every step.
Willard and Louf describe such guided generation; current engines use different
grammar backends and support different subsets of schema constraints. Check
the engine's documented schema support rather than assuming that any JSON Schema
keyword is implemented.

A valid prefix can still be incomplete. Stopping because the output-token budget
is exhausted does not ensure a complete valid document, even when every emitted
token was locally allowed. A runtime error or disconnect can likewise leave a
partial stream. Validate the final document and inspect the termination reason.
Grammar validity also says nothing about factual correctness or appropriate
severity. An application still needs domain checks and review.

::: worked title="A constrained severity field"

After the characters `"severity": "`, suppose the field permits S1 through S4.
A toy vocabulary contains `S`, `S1`, `S3`, `High`, a closing quote and a closing
brace, with logits $(1.0,2.0,0.5,3.0,0.2,-1.0)$. The unconstrained distribution
assigns about 60% to `High`. A valid-prefix mask at this state allows only the
first three pieces. Their renormalised probabilities are approximately
$(0.231,0.629,0.140)$.

The mask prevents an invalid value, but it may force a category that does not
express the intended answer. The schema might need an unknown category, or the
prompt might not explain the mapping. A parser cannot resolve that content
problem. At a later state the closing quote becomes valid after a full category.

:::

::: figure id=fig-10-14

Invalid vocabulary pieces receive zero probability, while valid-prefix pieces
are renormalised. The toy state concerns one enum field; a full nested document
requires a richer parser and a complete-document stopping condition.

:::

### Follow a request through the engine

An API frontend authenticates the client and validates request bounds. The
tokenizer applies the model's chat template. The scheduler maintains waiting
and running requests, selects prefill chunks and decode positions, and handles
admission or preemption. The KV manager maps token positions to storage and
manages prefix reuse. A model runner invokes attention and matrix kernels,
possibly using captured execution graphs to reduce launch overhead. The sampler
applies temperature, truncation, grammar masks or speculative verification.
A detokeniser converts ids to streamed text, and metrics record timings, queue
depth and cache pressure.

::: figure id=fig-10-15

The scheduler and cache manager coordinate admission before the model runner.
Sampling and detokenisation follow the model's logits. A metrics path observes
the whole request lifecycle rather than only GPU execution time.

:::

The template is part of the served model's contract. Compare the exact token ids
for a representative conversation rendered in training and in serving. A different
system-role convention, end-of-turn marker or generation prefix can change
behaviour even with unchanged weight hashes. Default sampling parameters also
belong in the deployment configuration; explicitly set them rather than relying
on a server's defaults.

### Choose against the workload and supported configuration

The following descriptions reflect documentation checked on 5 October 2026.
They identify useful starting points, not a performance ranking.

| Engine | Relevant role and constraints |
|---|---|
| [vLLM](https://docs.vllm.ai/) | GPU serving with iteration-level scheduling, cache paging/reuse and documented quantisation, structured-output and speculative paths; support depends on backend and model. |
| [SGLang](https://docs.sglang.io/) | Serving and structured generation with prefix reuse and scheduling features; check the selected hardware/model combination. |
| [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) | NVIDIA-focused optimised inference paths, with configuration and model support that must match the installation. |
| [Hugging Face TGI](https://huggingface.co/docs/text-generation-inference/main/en/index) | An established serving stack now in maintenance mode; its documentation recommends actively developed downstream engines for new work. |
| [llama.cpp](https://github.com/ggml-org/llama.cpp) / [Ollama](https://docs.ollama.com/) | Convenient local CPU, unified-memory and supported GPU deployment; GGUF/model-format and backend support still require checking. |

An engine's feature list does not establish that all features compose in every
release. Quantisation, adapters, speculative methods, prefix caching and grammar
backends can have compatibility restrictions. Benchmark the actual combination
and pin a release. Some engines serve multiple LoRA adapters over shared base
weights. Their cache identity must distinguish the adapter, because its hidden
states differ even when the input tokens match.

Many stacks expose an OpenAI-compatible chat-completions interface. A typical
request uses `POST /v1/chat/completions`, `model`, role/content messages, an output
limit, sampling settings and a `stream` flag. Streamed events commonly contain
`data: {json}` chunks followed by `data: [DONE]`. Usage and finish-reason reporting
must be checked for the particular implementation; output-limit field names and
optional structured-output fields are not universally interchangeable. A
`length` finish reason signals a truncation requiring application handling.

Switching an existing client generally changes the base URL, credentials and
served model name, then requires testing the subset of request fields it uses.
Do not treat protocol compatibility as identical templates, context windows or
sampling behaviour. The [AI Agents tutorials](../agent/index.html) cover clients,
tools and application validation in depth. This module keeps the boundary at
the serving computation and its observable contract.

::: check

Does grammar masking alone ensure that a streamed result is a complete, correct
safety-case argument?

:::

::: answer

No. It constrains syntax prefixes within its supported grammar. Token limits or
interruptions can leave the document incomplete, and valid fields can contain
incorrect content. Validate termination, the complete document and the domain
claims separately.

:::

## Sizing the running case study {#s11}

Now combine parameters, formats, cache, scheduling and prices into one capacity
estimate. The case remains hypothetical: an English–Chinese model drafts and
checks safety-case arguments for a reactor vessel's pressure-relief system.
Its output is engineering material to be checked, not an approval of a plant.
Modules 7–9 selected and adapted the model; this section sizes the artifact
handed over after adapter merging and quantised-file evaluation.

The architecture has 36 layers, width 4,096, 32 query heads, eight KV heads of
dimension 128, SwiGLU width 15,360, vocabulary 152,064 and untied embeddings.
Requests use 4,000 input tokens, including a 3,000-token stable prefix, and up
to 2,000 output tokens. A 20-entry hazard log is an illustrative output of that
size. The assumed volume is 2,000 requests per day; the time distribution of
those requests must also be measured before choosing always-on capacity.

### Account for the whole weight artifact

Each block's attention matrices contain 41,943,040 parameters, its SwiGLU
matrices 188,743,680, and its two norms 8,192. Across 36 blocks, with final norm
and two 622,854,144-entry tables, total parameters are 9,550,729,216. The
matrix-FLOP convention is 8,927,875,072, as introduced in Section 1.

The hypothetical serving format stores the 8,304,721,920 block-linear weights at
4.125 bits each: symmetric int4 plus one fp16 scale per 128 values. It stores
norms in bf16 and the embedding and head at eight bits, before their particular
scale/packaging metadata. The resulting idealised size is about 5.528429 GB,
rounded to **5.5 GB in the serving calculations**. bf16 for every parameter would
use about 19.101 GB. Neither the 4.78 GB uniform-four-bit count nor Module 9's
QLoRA base-storage estimate is this mixed serving artifact.

### Budget memory at the accepted maximum length

On the conservative 24 decimal GB profile, assume 2.5 GB for engine context,
workspaces and graph buffers. Measure that overhead on the chosen stack. The
remaining cache budget is $24-5.5-2.5=16$ GB. A 6,000-token request consumes
0.884736 GB in bf16, so 18 full-length requests fit in the ideal calculation.
An ideal one-byte cache permits 36, before scale metadata. Sharing the 3,000-token
prefix permits about 35 bf16 requests with the stated block-boundary caveat.

That count sizes only the accepted workload. A 32,000-token request needs 4.72 GB
of cache, more than five ordinary requests. Configure context and output limits,
reserve headroom and decide how long requests are routed. A scheduler that admits
on current use rather than maximum lengths can exploit shorter outputs, but its
preemption behaviour then becomes part of the latency estimate.

### Separate quiet-request latency from loaded throughput

With 50% prefill MFU, a cold 4,000-token prompt takes about 0.923 s on the reference
165 TFLOP/s device. A warm-prefix prompt takes about 0.241 s in the ideal model.
At a mean decode context of 5,000, weight plus cache traffic is 6.23728 GB and
the step is about 6.24 ms at peak bandwidth. The low-load end-to-end estimate is
$0.923+1999\times0.006237\approx13.4$ s.

At 18 sequences the traffic-model step is about 18.77 ms, giving 959 aggregate
decode tokens/s while decode is running. But prompt computation also occupies
the device. A deliberately simple full-load accounting charges each request
0.923 s of prefill plus its share of the decode batch:

$$
t_{\mathrm{GPU/request}}\approx0.923+
\frac{2000\times0.01877}{18}\approx3.01\ \mathrm{s}.
$$

That gives about 1,196 requests per hour and 2.39 million output tokens per hour,
rounded to 1,200 and 2.4 million. Prefill consumes about 31% of this GPU-time
budget. Dividing the raw step by the remaining decode share gives an effective
step near 27 ms, so a saturated request takes about 54–55 s, not 13.4 s.
Little's law checks the scale: $0.332\times54.2\approx18$ concurrent requests.
This accounting does not model overlap from hybrid chunks; Lab 3 supplies a more
explicit scheduling model with a variable-length workload.

| Profile | Cache budget GB | Full-length requests | Cold prefill s | Solo decode tokens/s | Full-batch decode tokens/s |
|---|---:|---:|---:|---:|---:|
| 24 GB, 1.0 TB/s | 16 | 18 | 0.92 | 160 | 959 |
| 24 GB, 0.30 TB/s | 16 | 18 | 1.26 | 48 | 288 |
| 48 GB, 0.864 TB/s | 40 | 45 | 0.42 | 139 | 1,005 |
| 80 GB, 2.039 TB/s | 72 | 81 | 0.49 | 327 | 2,532 |
| 80 GB, 3.35 TB/s | 72 | 81 | 0.15 | 537 | 4,161 |

The last column excludes prefill time and therefore is not complete service
capacity. Lab 1 prints the calculation at fuller precision. All rows assume
the same format, 2.5 GB overhead and no multi-device communication.

::: widget name=serving-calculator

Start with the default 18 sequences. Switch to an 8-bit cache, then to bf16
weights or the L4 profile. Change context and watch the memory and traffic limits
move. The calculator excludes prefill interference, prefix sharing, embedding-read
refinement and multi-device communication; its curves are bounds, not load tests.

:::

### Price output at the utilisation actually purchased

Every price in this example is an **assumption for comparison, as of 2026**,
not a current quote. Assume USD 1.00 per GPU-hour for the reference 24 GB device.
At 2.4 million output tokens per busy hour, cost is
$1.00/2.4\approx0.42$ USD per million output tokens. At 30% utilisation of paid
hours, it becomes about USD 1.39. This charges input processing to the output
throughput; it is not a price for decode-only kernel work.

At 2,000 requests a day, approximately $2000\times3.01/3600=1.67$ busy GPU-hours
are needed, about 7% of an always-on device. Paying USD 24 per day gives USD 0.012
per request or **USD 6.00 per million output tokens**. An inexpensive busy-hour
rate does not make an idle server inexpensive per completed task.

Module 7's assumed hosted prices are USD 0.20 per million fresh input tokens and
USD 0.80 per million output tokens, with cached input at one tenth the fresh
input price. Four thousand input plus two thousand output tokens then cost
USD 0.0024 per request, or USD 4.80 for 2,000 daily requests. Caching 3,000 input
tokens lowers that to USD 0.00186 per request and USD 3.72 per day. Under these
assumptions, an always-on rented card breaks even near 10,000 requests per day
against uncached input, or 12,900 against cached input, provided the model quality
is comparable and the traffic fits the capacity and latency constraints.

An owned-device illustration assumes USD 2,000 depreciated over three years of
continuous availability: about USD 0.076/hour. Add an assumed 0.45 kW at
USD 0.20/kWh, or USD 0.09/hour. That excludes the host, cooling, redundancy,
operations and evaluation work. At a continuous 450 W and about 665 output
tokens/s, the same illustrative energy count is about 0.68 joules per output
token; power is a scenario input, not an observed draw in these CPU labs.

### Apply the latency objectives before choosing capacity

Lab 3 searches nominal arrival rates with p99 TTFT at most three seconds and
pooled p99 ITL at most 100 ms. For its documented chunked scheduler, the reference
profile passed at nominal 0.244 requests/s, realised about 0.274 in the seeded
sample. It produced 466.3 output tokens/s. At the assumed USD 1.00/hour, that
costs about $10^6/(3600\times466.3)=0.596$ USD per million output tokens.
The simulator's outputs average about 1,737 tokens, while this section's
deterministic sizing uses 2,000; do not mix those throughputs or derive cost from
nominal arrival rate times an assumed answer length.

::: figure id=fig-10-16

The case's low-load and full-load times and utilisation-dependent cost describe
the same workload. The cost curve uses the rounded
2.4-million-output-token busy hour; the lab operating point is marked using its
own measured simulation throughput.

:::

This scenario does not make self-hosting the cheaper option at its stated volume.
Data location, control of the adapted artifact and version stability may still
matter to the hypothetical team. Compare alternatives at equal task quality,
measure real demand and record the complete paid capacity. A calculation that
omits utilisation answers the cost of a busy kernel rather than the cost of
providing the service.

::: check

Why does the fully loaded request take about four times the quiet-request time,
even though aggregate tokens/s is much higher?

:::

::: answer

It shares iterations with many caches, increasing step duration, and shares the
device's time with other requests' prefills. More simultaneous outputs improve
aggregate throughput while each request advances more slowly.

:::

## Measuring latency: metrics, load tests and SLOs {#s12}

The server is useful only if its users receive answers within the required
time. An isolated decode benchmark measures one resource under one shape.
A service load test measures scheduling, queues and client-visible delivery
under a workload. Both are valuable, but they answer different questions.

**TTFT** is elapsed time from sending a request to receiving its first token.
**End-to-end latency**, E2E, ends at the final token or completed response.
For more than one output token, **TPOT** is
$(\mathrm{E2E}-\mathrm{TTFT})/(n_{\mathrm{out}}-1)$. **Inter-token latency**, ITL,
records every individual gap. TPOT averages away isolated prefill stalls; an ITL
tail can expose them. A one-token answer has no decode interval, so TPOT should
be undefined or omitted, not divided by zero.

Report output tokens/s and completed requests/s separately. Input tokens are
already processed in parallel during prefill; including them in “generation
tokens/s” can make a long-prompt benchmark look misleadingly fast. **Goodput**
is the rate of requests meeting the defined objectives. Its value depends on
whether the objective concerns a request's maximum gap, average TPOT, task
deadline or pooled distribution percentiles. Name the definition with the number.

### Keep raw samples and distinguish populations

Report p50, p90 and p99 from actual samples, with their sample counts and
measurement interval. The p99 of a pooled collection is not the average of
its component p99s. Averaging server percentiles discards the underlying
distribution and can conceal a slower shard. Pool compatible raw observations
or use an aggregation representation that preserves the required quantiles.

A pooled ITL percentile weights long outputs by their many gaps. A single
preempted request can have a multi-second gap while pooled p99 ITL remains low.
Lab 3 demonstrates this at overload: the nominal 0.30 chunked run has p99 ITL
near 64 ms but a maximum gap over six seconds. Its p99 TTFT also fails the
three-second objective. A percentile pass must not be read as a maximum guarantee
for each user. Track request-level failures and worst gaps when that experience
matters.

::: worked title="A tail event becomes common in a chain"

Suppose independent calls each have a 1% chance of exceeding their p99 threshold.
A 20-call sequential task has probability $1-0.99^{20}\approx0.182$ of at least
one such event. At 50 calls it is about 0.395. Dependence changes these numbers,
but the calculation shows why a per-call p99 alone does not describe a user's
multi-call task. Set an end-to-end task objective and inspect its actual tail.

:::

### Queueing rises sharply near saturation

For an M/M/1 queue, with mean service time $S$ and utilisation $\rho$, mean time
in the system is $S/(1-\rho)$. It is $2S,5S,10S,20S$ at utilisations
$0.5,0.8,0.9,0.95$. The assumptions are Poisson arrivals, exponential service
times, one server and a stable arrival rate below capacity. An LLM server is
not literally that queue: batch size changes its service rate and prefill/decode
interact. The formula illustrates a knee, rather than giving its exact latency.

**Little's law**, $\bar n=\lambda\bar w$, applies to stable systems under broad
conditions: mean requests in the system equal completed rate times mean time in
the system. Use compatible averages over a sufficiently long interval. Applying
it to a short overload run with a growing queue or mixing a nominal Poisson rate
with an observed completion rate can give a misleading check.

In Lab 3, chunked scheduling gives p50/p99 TTFT of about 1.09/2.89 s at nominal
0.20 requests/s. At 0.25 they become 1.15/3.07 s, and at 0.30, 1.53/29.87 s.
Cache growth and preemption contribute beyond the knee. The exact threshold
belongs to this scheduler, finite sample and cost model; do not copy it as a
capacity promise for a real GPU server.

::: figure id=fig-10-17

Actual simulator sweep: TTFT tails and ITL tails under four scheduling policies.
The horizontal lines are the stated percentile objectives. A low pooled ITL
tail can coexist with rare long gaps, so the maximum-gap diagnostic is also shown.

:::

### Design a test that can expose overload

An **open-loop** test schedules arrivals independently of response completion.
A Poisson process at a chosen rate is one controlled workload; production bursts
are another. In a **closed-loop** test, each virtual user sends the next request
only after its previous response. As the server slows, those users slow their
arrivals, limiting the queue and hiding the demand that an independent population
could offer. Fixed-concurrency tests remain useful for throughput exploration,
but they do not establish tolerance of a stated arrival rate.

Warm the model and any relevant graph/kernel paths. Use representative prompt
and output-length distributions, including long-document tails. Stream results
and timestamp arrivals and gaps at the client. Sweep offered load below and
beyond the knee, record realised arrivals, and run long enough for the tail and
queue behaviour to be visible. Reuse an identical sampled workload when comparing
policies, then repeat with other seeds to assess sampling variation.

Every result needs hardware, engine version, model and tokenizer identity,
quantisation, cache format, length distribution, arrival policy, concurrency
limits and measurement scope. Include failures, rejected requests and timeouts;
discarding them makes an overloaded service look fast. Client bottlenecks and
network buffering can also distort streaming timestamps, so check that the
load generator is not itself the limit.

The case's illustrative interactive objectives are p99 TTFT no more than three
seconds and p99 ITL no more than 100 ms. Overnight batch checking may instead
need a completion deadline and throughput. Capacity is the load that meets the
chosen objectives, rather than the point of maximum output throughput. To promise
a specific per-request experience, use request-level success criteria as well
as aggregate percentiles. A load test turns “fast enough” into a defined,
repeatable statement with a workload and an operating range.

::: check

Why can a fixed ten-user closed-loop test conceal queue growth under production
arrivals?

:::

::: answer

Each user waits before sending again. Slow responses reduce arrivals and bound
in-flight requests at ten. Independent production arrivals can continue while
the server is slow and build a much larger queue.

:::

## Reliability in production {#s13}

A serving calculation describes resources. Reliable operation also requires a
known artifact, observable state, explicit failure handling and evidence that
the generated output still meets its checks. These controls give a team a way
to understand and reverse a change rather than guessing from a model's name.

### Identify everything that determines the output

Hash the exact served weights, tokenizer assets, chat template and system prompt.
Record the engine name and version, relevant backend/kernel configuration,
quantisation scheme and sampling parameters. A weight hash alone is insufficient:
the same weights with different token ids, message rendering or defaults compute
a different request. Include request ids, input/output counts, termination reason,
TTFT, E2E and any fallback identity in an output's provenance record.

SHA-256 identifies bytes; it does not certify their quality. Evaluation establishes
the tested properties of that artifact, and the hash ties deployment to the
evaluation. A configuration that was never recorded cannot be reconstructed
reliably just because the weight file is available. Hash manifests should make
the component boundaries clear and distinguish a model release from a converted
serving file.

::: worked title="A reviewable output record"

For a hypothetical response, record weight, tokenizer, template and prompt
SHA-256 values; an engine version; int4 group-128 blocks with fp16 scales and
eight-bit embedding/head; temperature zero; an output limit of 2,000; request id;
4,012 input and 1,876 output tokens; observed TTFT and E2E; completion reason;
and the actual producer if fallback occurred. These are example record fields,
not invented hashes or benchmark timings. They allow an old and new run to be
compared component by component.

:::

A rollout can shadow a new artifact or canary it on a controlled traffic share.
Run the Module 9 evaluation suite and inspect live quality and latency metrics.
Rollback restores the previous complete manifest, including its template and
defaults, rather than only copying back one weight file. Retain enough compatible
capacity to make that rollback operationally possible.

### Health must include readiness and capacity

Liveness asks whether a process responds. Readiness asks whether its model has
loaded and it can accept work. A server that answers a health URL while spending
minutes loading a model is live but not ready. Report the loaded artifact identity,
queue depth, cache occupancy and relevant failure state. Avoid declaring a
fully saturated instance ready for unlimited new traffic solely because its
process remains alive.

Alert on queue growth, p99 TTFT, request errors, timeout rates and preemptions.
These metrics expose different failure modes. A high cache occupancy can be
normal at useful full load; a rising preemption rate with worsening tails suggests
growth pressure or overload. A normal average decode rate can coexist with a
blocked input queue. Use the operating objectives from Section 12 to interpret
them together.

### Budget failure paths and exercise them

Give each request a time budget. Retries before output has been streamed can use
bounded exponential backoff with jitter, so clients do not all retry at once.
An automatic retry after partial output is different: the user has already seen
part of an answer, and a new run can continue differently or duplicate work.
The client needs an explicit policy for interrupted streams rather than silently
pretending that the retry is the same answer.

A circuit breaker can stop routing to a repeatedly failing instance. A fallback
server or hosted model must be exercised regularly and evaluated for the intended
task. Record its identity on the resulting output; a fallback may change the
model, data location, quality and cost. A configured endpoint that is never
tested is not demonstrated recovery capacity. Likewise, a capacity plan that
uses every device continuously leaves no spare resource for maintenance or a
failed instance.

Meter real input and output tokens per request, application and team. Include
failed attempts and retries in the cost ledger. Distinguish paid capacity,
completed work and user-visible success. This closes the loop with Section 11:
the actual utilisation and workload can replace the illustrative assumptions.

::: figure id=fig-10-18

Routing, health checks and circuit breaking surround the model servers. Metrics
and provenance accompany the response path; the fallback is a tested producer
with its own identity, rather than an invisible continuation of the primary.

:::

### Temperature zero does not fix the arithmetic

Greedy selection is deterministic given logits. The calculation producing those
logits can depend on batch shape, padding, reduction order, precision, hardware,
prefix reuse and speculative verification. Floating-point addition is not
associative, so different kernels can change final bits. If the top two logits
are within that numerical variation, the selected token can change. Subsequent
tokens then condition on a different prefix, causing much larger text divergence.

Lab 6's first prompt produced the same 64 tokens alone and in a batch of eight.
Its maximum logit difference was about $5.77\times10^{-5}$ and its smallest
solo top-two gap about 0.0558, at output step 22. The gap was much larger than
the observed noise, explaining why the argmax stayed stable in this test. It
does not prove stability for every prompt or a lower-precision production engine.
If a reproducibility requirement is strong, inspect supported batch-invariant
or deterministic kernels and measure their performance cost in the actual stack.

Test claims under representative load and record the numerical conditions.
For the safety-case assistant, acceptance still rests on complete-schema
validation, domain checks, evidence review and human judgement. Byte equality
is useful for some regression tests; it is not evidence that a repeated answer
is correct.

Prompts and cached states are user data. Default observability can record sizes,
timings and controlled identifiers rather than full content. Content logging
needs defined access and retention. A shared prefix cache can reveal reuse
through timing, so isolate tenants or use supported cache salting where that
matters. Hashes of predictable low-entropy content should not be mistaken for
automatic anonymisation. Application prompt injection, tool permissions and
guardrails are treated in the [AI Agents series](../agent/index.html).

::: check

The weight file is unchanged after a deployment, but evaluation behaviour changes.
Which recorded components should be compared before blaming the checkpoint?

:::

::: answer

Compare tokenizer, chat template, system prompt, engine/backend version and
sampling configuration, along with request rendering and runtime conditions.
An unchanged weight hash identifies only one part of the computation.

:::

## What goes wrong {#wrong}

| Symptom | Likely mechanism | A useful diagnostic or correction |
|---|---|---|
| One long document causes rejections or repeated preemption | Cache was sized for an average context | Recompute accepted maximum lengths, reserve headroom and separate long-request traffic. |
| Evaluation follows the system message; serving ignores it | Different chat rendering | Compare training and server token ids, including generation and turn-end markers. |
| bf16 checks pass, deployed int4 checks fail | Converted file was not re-evaluated | Evaluate and hash the exact served artifact with the domain suite. |
| Prefix-cache hits stay near zero | Variable content appears before the shared prefix, or the cache is evicted | Compare token prefixes and cache pressure; move variable fields later. |
| Valid JSON contains an inappropriate severity | Grammar enforces syntax while the category mapping is unclear | Inspect schema/prompt semantics and run content checks. |
| Outputs end inside a structure | Output/context budget or interrupted stream | Inspect finish reason, final-document validity and explicit request bounds. |
| Long inputs degrade without runtime errors | Cached positions or masks are wrong | Compare common-prefix cached and uncached logits over long contexts. |
| Throughput is far below a traffic bound | Host overhead, unsupported kernels, low batch limits or poor bandwidth use | Profile host and device, confirm format support and inspect admission limits. |
| p99 TTFT rises while average decode is normal | Prefill stalls, queueing or overload | Measure ITL and queues, then tune chunking, admission or capacity. |
| Speculation makes service slower | Costly or mismatched draft; verification becomes compute-bound | Measure acceptance, draft cost and gain under the actual load. |
| A fallback fails when needed | Recovery route was configured but not exercised | Run a bounded failover drill and retain producer identity. |
| Temperature-zero outputs differ under traffic | Batch-dependent logits flip a near-tied argmax | Record the first differing token and numerical conditions; test reproducibility claims. |
| Perplexity hardly changes but the task fails more often | Generic average loss missed task-specific error | Evaluate copying, parsing and domain checks in both served languages. |
| A benchmark cannot be reproduced | Unstated lengths/rates, discarded errors or mixed prompt/output throughput | Publish workload, versions, raw metric definitions and failure counts. |
