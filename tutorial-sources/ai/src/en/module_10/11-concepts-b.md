## Batching: static, dynamic and continuous {#s5}

One request can leave much of a GPU's arithmetic capacity idle during decode.
Serving several requests in one iteration allows the projection matrices to
reuse weights across their token vectors. The server then emits several tokens
per iteration, one for each decoding sequence. That improves total output, but
it introduces scheduling choices that determine how long each user waits.

**Static batching** starts a fixed set of requests together. Inputs are padded
to compatible shapes, and the batch runs until its longest output finishes.
Three costs follow: padded input work, slots left idle after shorter outputs end,
and new arrivals waiting for the entire batch to finish. A benchmark of equal
input and output lengths can hide all three. A batch that looks efficient on that
benchmark may be wasteful under the variable lengths of a real drafting service.

**Dynamic request-level batching** waits for a target batch size or a short
dispatch timeout. The timeout prevents a quiet service from waiting indefinitely
for a full batch. It exchanges a controlled amount of waiting for more reuse,
but it still usually keeps the batch together until its longest output finishes.
Calling a server “dynamic” therefore does not establish that it can refill a
finished slot at each token step.

**Continuous**, or iteration-level, batching schedules after each forward pass.
Finished requests leave; eligible waiting requests join. The linear projections
can process all selected token vectors together, while attention uses each
request's own context. Orca's selective batching made this distinction explicit.
The scheduler must handle both new prompts and ongoing decode, rather than only
assembling batches at request boundaries.

::: worked title="Why variable output lengths matter"

Four requests need 100, 200, 400 and 800 output steps. With a fixed 20 ms step,
a static batch occupies four slots for 800 steps, or 16 s. It produces 1,500
tokens from 3,200 available slot-steps: 46.9% useful utilisation and about
94 tokens/s. With a continuously waiting queue, immediately refilling finished
slots can approach four tokens per 20 ms, or 200 tokens/s. The factor of 2.1
comes from removing idle slots in this toy example, not making a matrix multiply
twice as fast. Real steps vary with context and batch shape.

:::

::: figure id=fig-10-6

Static slots remain reserved until the longest request ends. Continuous slots
can begin another request as soon as one finishes. The equal-step timeline
isolates idle-slot waste; it deliberately omits prefill interference and cache
growth, which a complete server must account for.

:::

### Cache traffic limits the batching gain

For $B$ sequences at mean context $\bar t$, an idealised bandwidth-bound step is

$$
t(B)=\frac{W+Bk\bar t}{\mathrm{BW}},\qquad
v_{\mathrm{sequence}}=\frac{1}{t(B)},\qquad
v_{\mathrm{aggregate}}=\frac{B}{t(B)}.
$$

The weights are amortised, but each cache contributes bytes. The aggregate curve
has diminishing returns; as $B$ grows, it approaches
$\mathrm{BW}/(k\bar t)$ rather than increasing indefinitely. Per-sequence speed
falls whenever step duration rises. Compute also provides a ceiling through
$(2N_{\mathrm{matmul}}B+4LdB\bar t)/P_{\mathrm{peak}}$. Use the larger time when
both constraints are included. Capacity remains a separate admission limit.

::: worked title="Batching the case-study requests"

At a mean context of 5,000 tokens, one cache is 0.73728 GB. With $W=5.5$ GB and
1.0 TB/s bandwidth, batches of 1, 4, 8 and 18 take approximately 6.24, 8.45,
11.40 and 18.77 ms. Each sequence receives about 160, 118, 88 and 53 tokens/s;
aggregate output is about 160, 473, 702 and 959 tokens/s. Eighteen sequences
give about six times the aggregate output of one, rather than eighteen times.

At $B=18$, projection and attention work is roughly $3.75\times10^{11}$ FLOPs,
about 2.3 ms at the reference dense peak. Even doubling that compute time for
an efficiency allowance leaves it below the traffic estimate. Cache reads keep
the full batch bandwidth-bound.

:::

::: figure id=fig-10-7

Computed per-sequence and aggregate decode curves at a 5,000-token mean context.
The memory line uses full 6,000-token reservations, so the feasible batch ends
at 18 despite the curve extending further. The weights-only comparison omits
cache reads and consequently overstates the gain.

:::

### A joining prompt can stall everybody

A new 4,000-token prompt takes about 0.92 s to prefill under our reference
assumptions. If that prefill occupies one iteration alongside ongoing decode,
users already streaming see a long gap. Their average output speed may remain
acceptable while the experience is visibly interrupted. This is why average
TPOT alone is insufficient: individual inter-token gaps expose interference.

**Chunked prefill** limits new prompt positions in one iteration. A chunk and
the decode positions share the forward pass, so a simplified cost is the maximum
of combined traffic time and combined compute time. Adding a whole prefill time
to a separate decode time would discard the reuse and model a different schedule.
Small chunks bound stalls but require more iterations; excessively small chunks
can increase overhead and delay a prompt's first token.

With 17 ongoing sequences at 5,000-token context, a 512-token opening chunk takes
about 116 ms in Lab 3's model, or 123 ms after 2,000 prompt positions have been
cached. A 128-token chunk gives about 32 and 34 ms. Later chunks have more
attention work because their queries see a longer prefix. There is no single
chunk size that is optimal for every device, context distribution and SLO.
Sarathi-Serve studies this throughput/latency trade-off. Separating prefill and
decode onto different devices, as in DistServe and Splitwise, removes some
interference but introduces cache transfers and a resource-allocation problem.

### Admission is part of the policy

A scheduler commonly limits running sequences, new tokens per iteration and
cache occupancy. These limits interact. A generous sequence ceiling is ineffective
when the cache budget allows only a few long requests. A large prefill-token
budget can improve throughput while damaging inter-token tails. On-demand admission
can fit more current contexts than full-length reservations, but their later
growth may force preemption. Sustained overload can turn that flexibility into
repeated wasted prefills.

Lab 3 compares these policies on 300 seeded arrivals with prompts between 2,000
and 6,000 tokens and clipped lognormal outputs averaging about 1,737 tokens.
At a nominal 0.10 requests/s, its static policy has a median TTFT around 13 s,
while chunked continuous scheduling gives about 1.01 s. At high load, static
output settles near 300 tokens/s and continuous output near 590. These are
simulation results under its stated rules. Static memory is unchecked, which
favours static batching even when a real device would reject that batch.

The simulator's nominal 0.20 requests/s is realised as about 0.224 in its finite
arrival sample. A short load test's realised rate is not automatically its
distribution parameter. The lengths remain the same across policies, letting
the policy comparison isolate scheduling rather than changes in workload.

::: check

Why can a server have good total tokens/s and still deliver an unpleasant stream?

:::

::: answer

Total throughput can improve with batching while individual decode steps become
slower. Whole-prompt prefills can also introduce isolated long gaps. Measure
per-request latency and inter-token tails alongside aggregate throughput.

:::

## Paged attention and prefix caching {#s6}

Output length is unknown when a request arrives. A server that allocates one
contiguous cache region for the maximum possible length avoids growing an
allocation, but reserves many positions that may never hold a token. Different
allocation sizes can leave gaps in the memory pool. Even a smaller allocation
can have an unused tail. These are allocator and reservation costs, not model
parameters or unavoidable attention state.

The PagedAttention paper measured that only 20.4–38.2% of the KV-cache memory in
the systems it studied held actual token states. Its proposed block allocation
and attention kernel increased throughput by 2–4 times over the evaluated
baselines at comparable latency. Those results describe the paper's workloads
and systems; the gain is not guaranteed against every modern engine.

### Map logical positions to physical blocks

Divide cache storage into fixed-size blocks. A sequence's **block table** maps
its logical block numbers to physical blocks from a shared pool. A request obtains
another block as it grows, rather than reserving every possible future position.
The attention kernel follows the table to gather the required keys and values.
The blocks for one sequence need not sit next to one another in device memory.
This resembles virtual-memory paging, although the sizes and kernel requirements
are chosen for attention rather than an operating system's CPU pages.

With blocks of 16 tokens, the unused tail is at most 15 positions per sequence.
Smaller blocks reduce that tail but lengthen tables and fragment kernel reads
into more pieces. Block size is a backend/configuration choice; 16 is the example
used here and in the original paper, not a universal current vLLM default.
Paging does not reduce the bytes required for real token states. It reduces
allocation waste and permits useful sharing.

::: worked title="Reservation versus actual use"

For the case model, an 8,192-token reservation needs
$8192\times147{,}456\approx1.208$ GB. Thirteen such reservations fit in 16 GB.
If a request currently has 1,500 positions, only 18.3% of its reservation is useful.

With 16-token blocks, exactly 1,500 positions occupy
$\lceil1500/16\rceil=94$ blocks, or 1,504 slots. That is 0.222 GB and permits
72 current contexts in the ideal pool. It does not permit 72 arbitrary growing
requests forever. The scheduler must leave growth headroom or preempt later.
A 37-token request occupies three blocks, leaving 11 slots unused; the worst
tail of 15 slots costs about 2.21 MB for this model.

:::

### Share only states with the same identity

Several continuations of one prompt can refer to the same completed prefix
blocks. Reference counts record how many sequences use each block. If a sequence
must write into a partly filled shared block, **copy-on-write** gives it a private
copy so the other sequence's state remains unchanged. Full prefix blocks can
stay shared. Simply handing two requests the same mutable cache object is not
copy-on-write; a later append can corrupt their independence. Lab 2 uses explicit
deep copies to make the branching semantics obvious.

::: figure id=fig-10-8

Two logical block tables share completed prefix blocks, then point to private
continuation blocks. Reference counts and a free pool determine allocation.
Copy-on-write protects a partly filled block when one continuation modifies it.

:::

If the pool fills, an engine may swap cache to host storage or discard states and
recompute them on readmission. The cheaper option depends on transfer speed,
context length and the model. Either adds latency. Under sustained overload,
repeated preemption can consume work without completing many requests. Monitor
preemption rate alongside queue depth rather than treating an allocator that
never throws an out-of-memory exception as sufficient capacity planning.

### Reuse a stable prefix across separate requests

**Prefix caching** identifies reusable token prefixes. A hash-based design includes
both a block's tokens and its preceding prefix identity; equal tokens late in two
otherwise different prompts do not give equal hidden states. Cache identity must
also distinguish adapters and other inputs that affect computation. vLLM's
[prefix-cache design](https://docs.vllm.ai/en/latest/design/prefix_caching/)
documents block hashes and cache isolation. SGLang's RadixAttention organises
token-prefix sharing with a radix tree.

A hit avoids computing the prefix again and can share its stored states. New
queries still attend to it. Prefix caching consequently reduces prefill work;
it does not eliminate decode attention or make the effective context shorter.
Shared physical storage also need not imply that an attention kernel reads a
shared block only once per batch. Keep storage sharing and traffic reuse separate
when estimating performance.

::: worked title="The safety-case assistant's stable prefix"

Each request has 3,000 stable tokens, 1,000 variable tokens and up to 2,000 output
tokens. A cold 4,000-token prefill costs about $7.61\times10^{13}$ FLOPs.
Computing only the 1,000 new positions after a cached 3,000 costs approximately
$2N_{\mathrm{matmul}}1000+4Ld(1000\times3000+1000^2/2)
\approx1.99\times10^{13}$ FLOPs. The reference times are 0.92 s cold and 0.24 s
warm: about 3.8 times less work, not exactly four, because of prefix attention.

Ideal shared-prefix storage consumes 0.442368 GB once. Each full request then
has 3,000 private positions, also 0.442368 GB. Thus
$\lfloor(16-0.442368)/0.442368\rfloor=35$ fit instead of 18. A 16-token-block
engine reuses only 2,992 of the 3,000 positions as full blocks; its small boundary
overhead should be included in an implementation-specific budget.

:::

A timestamp at the beginning changes the first block and the identity of every
following block. So do a user name, reordered tool definitions or a different
chat-template rendering. Put stable system instructions, schemas and common
documents first; place variable request content later. Sharing requires identical
token ids, not merely visually similar text. Tokenising prefix and suffix
separately can change boundary merges, so Lab 2 compares two paths over explicitly
identical concatenated ids.

The measured Lab 2 warm forwards took 0.063–0.076 s versus 2.413–2.511 s cold,
after one initial prefix forward. Last-position logits differed by at most
$3.34\times10^{-5}$. The one-time cost, cache copy and later eviction all matter
to the end-to-end saving. [Module 7](module_07_EN.html) treats prompt-cache costs
from a client's perspective; here the concern is the computation being reused.
Cached-prefix pricing in any hosted service remains provider-specific.

::: check

Does a cache hit on a 3,000-token prefix remove those tokens from the new query's
attention context?

:::

::: answer

No. Their states are reused, but new positions still attend to them. Prefill
projection work is avoided; context-dependent attention and stored-state needs
remain.

:::

## Number formats and the arithmetic of quantisation {#s7}

Reducing stored weight bits can cut bandwidth-bound decode traffic and leave more
memory for the cache. The same reduction need not accelerate a compute-bound
prefill if the kernel still multiplies after dequantising to the same arithmetic
format. [Module 8](module_08_EN.html) covers formats during training. Serving
separates storage format, operand format and accumulation format because each
can be different in one kernel.

### Range and resolution answer different questions

A floating-point number has a sign, exponent and fraction. Exponent bits control
range; fraction bits control resolution near a given magnitude. The machine
epsilon below is the spacing above one for the stated format, not a uniform
absolute error bound over all real values.

| Format | Sign / exponent / fraction bits | Largest finite value | Epsilon near one |
|---|---:|---:|---:|
| fp32 | 1 / 8 / 23 | about $3.4\times10^{38}$ | $2^{-23}$ |
| fp16 | 1 / 5 / 10 | 65,504 | $2^{-10}$ |
| bf16 | 1 / 8 / 7 | about $3.4\times10^{38}$ | $2^{-7}$ |
| fp8 E4M3, finite-only convention | 1 / 4 / 3 | 448 | $2^{-3}$ |
| fp8 E5M2 | 1 / 5 / 2 | 57,344 | $2^{-2}$ |
| signed int8 | 8 integer bits | $-128$ to 127 | fixed grid after scaling |
| signed int4 | 4 integer bits | $-8$ to 7 | fixed grid after scaling |

A bf16-trained model can produce activations beyond fp16's range. Casting to fp16
can then overflow despite fp16's finer precision near one. Conversely, bf16's
large range does not provide fp32's resolution. FP8 encodings need a precise
convention; E4M3 variants differ in treatment of infinities and NaNs. The table
uses the finite-only 448 convention described by Micikevicius et al.

::: figure id=fig-10-9

Bit allocations separate range from precision. Integer formats need scales to
interpret their codes as real-valued weights; their signed range is not a
floating-point exponent range.

:::

Block-scaled formats add a shared exponent or scale. The
[OCP microscaling specification](https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf)
defines MX formats with one eight-bit scale for 32 elements. MXFP4 uses E2M1
elements and therefore costs $4+8/32=4.25$ bits per value before other metadata.
That overhead belongs in a memory estimate. Hardware support is format- and
kernel-specific; a file containing four-bit values does not establish native
four-bit arithmetic support on the selected device.

### Symmetric round-to-nearest

For $b_w$ signed bits, let $q_{\max}=2^{b_w-1}-1$. Symmetric absmax quantisation
uses the codes $-q_{\max},\ldots,q_{\max}$, leaving the extra negative integer
code unused. Set

$$
s=\frac{\max_j|w_j|}{q_{\max}},\qquad
q_j=\operatorname{clip}(\operatorname{round}(w_j/s),-q_{\max},q_{\max}),
\qquad \hat w_j=sq_j.
$$

If a value is not clipped and the scale is represented exactly, nearest rounding
gives $|w_j-\hat w_j|\le s/2$. A simple noise model assumes errors are uniform
on $[-s/2,s/2]$. Its mean is zero and its variance is

$$
\mathbb{E}[e^2]=\frac1s\int_{-s/2}^{s/2}e^2\,de
=\frac{s^2}{12}.
$$

The uniform assumption is an approximation, not a theorem about trained weights.
Errors can be correlated, clipping introduces bias and low-precision scales add
their own error. The calculation nevertheless explains why one large outlier,
by enlarging $s$, can increase typical squared error dramatically.

::: worked title="An eight-weight int4 example"

For $\mathbf w=(0.12,-0.48,0.03,0.91,-0.07,0.25,-0.33,0.05)$, absmax int4 gives
$s=0.91/7=0.13$ and $\mathbf q=(1,-4,0,7,-1,2,-3,0)$.
The reconstructed values are $(0.13,-0.52,0,0.91,-0.13,0.26,-0.39,0)$.
Their RMS error is about 0.039, below the maximum-error bound 0.065.

Replace 0.91 with 9.1. The scale becomes 1.3 and the seven ordinary values all
round to zero. Their RMS error becomes about 0.246. A group-wise scale confines
this coarsening to the outlier's group rather than spreading it across the whole
tensor. Finer groups cannot protect the outlier's immediate group companions.

:::

### Offset the grid for a skewed range

A min-max zero-point scheme uses unsigned codes:

$$
s=\frac{w_{\max}-w_{\min}}{2^{b_w}-1},\quad
z=\operatorname{round}(-w_{\min}/s),\quad
q=\operatorname{clip}(\operatorname{round}(w/s)+z,0,2^{b_w}-1),\quad
\hat w=s(q-z).
$$

The offset allows a skewed group to use levels more evenly than a symmetric grid.
Zero-point representation and clamping conventions vary by kernel. Rounding the
zero-point can shift the reconstructed endpoints, so exact min/max coverage and
the symmetric unclipped error bound should not be asserted for every value.
Constant groups need a special case or a small minimum scale to avoid division
by zero. Lab 4 uses a documented floating zero-point representation for its
simulation; it does not specify a universally supported checkpoint format.

For the preceding eight weights, the min-max scale is $1.39/15\approx0.0927$ and
$z=5$. The codes are $(6,0,5,15,4,8,1,6)$ and the RMS error is about 0.030.
The symmetric grid had unused negative levels because the most negative weight
was only $-0.48$. That particular skew benefits from the offset. Another tensor
can have a different trade-off; compare measured output error as well as storage.

### Granularity costs metadata

A per-tensor scheme has one scale. A per-output-channel scheme gives each output
row its own scale. Group-wise quantisation divides an input dimension into small
groups, commonly 32, 64 or 128 values. An outlier then stretches fewer neighbours'
grid. The smaller group pays more metadata per weight:

$$
\mathrm{bits/weight}=b_w+
\frac{\mathrm{scale\ bits}+\mathrm{zero\!\!\ point\ bits}}{g}.
$$

For int4 and fp16 scales, groups of 128, 64 and 32 cost 4.125, 4.25 and 4.5
bits per weight. An additional fp16 zero-point raises group-128 storage to 4.25
bits. One scale for a 4,096-weight row costs only $16/4096$ extra bits per weight.
File headers, alignment and exceptional higher-precision tensors are additional.
Calling all these schemes “four-bit” conceals a meaningful memory difference.

::: figure id=fig-10-10

A computed Gaussian bulk with an inserted outlier illustrates coarse per-tensor
int4 levels. A group without the outlier has a finer grid. The distribution is
synthetic; the mechanism, rather than a claim about one model's histogram, is
what the diagram demonstrates.

:::

For a row scale, $y_i=s_i\sum_jq_{ij}x_j$ permits one final scale application.
Group scales instead weight partial sums within the dot product. A practical
weight-only kernel can unpack and dequantise in registers without writing a full
floating-point weight matrix to device memory. Lab 4 dequantises in advance and
uses float32 kernels, so it demonstrates quality damage while saving no live
memory and providing no low-bit speed-up. **Round-to-nearest**, or RTN, is the
baseline; calibrated methods improve the choices of scales or codes using data.

::: check

Why does a nominal int4 file sometimes use substantially more than half a byte
per parameter?

:::

::: answer

Groups need scales and sometimes zero-points. Embeddings, heads or sensitive
layers may remain at higher precision. Headers and packing alignment add further
bytes. Count the actual tensor formats rather than multiplying every parameter
by four bits.

:::

## Quantising LLMs: outliers, GPTQ, AWQ, SmoothQuant and the cache {#s8}

Small average weight error is not the same as small model-output error. A weight
acts on an activation; errors on frequently large activation channels matter
more than equally sized errors on quiet channels. Autoregressive conditioning
can then amplify a changed prediction into different later text. Quantisation
methods therefore differ both in which tensors they round and in how they use
calibration data to protect consequential directions.

### Start with a reproducible baseline

Lab 4 quantises the 210 linear layers of SmolLM2-135M, leaving its tied embedding
and output matrix and norms in float32. It evaluates eight 512-token WikiText-2
windows, scoring 511 next-token predictions per window. The actual recorded run
gave the following perplexities; this is one short evaluation protocol, not a
general leaderboard.

| Simulated weight scheme | Perplexity |
|---|---:|
| float32 reference | 20.8462 |
| int8 per-tensor | 21.6252 |
| int8 per-output-channel | 20.9937 |
| int4 per-tensor | about 5.83 million |
| int4 per-output-channel | 46.2519 |
| int4 group-64, symmetric | 29.1763 |
| int4 group-64, zero-point | 27.1402 |

The output fences contain the authoritative last digits. Per-tensor int4 is
catastrophic here; finer granularity recovers much of the damage. Group-64
symmetric RTN still raises perplexity by about 40%. This 135M model and naive
quantiser should not be used to infer the behaviour of a calibrated 7B model.
Conversely, a large-model paper's favourable result does not excuse measuring
the small model or the deployed task.

::: figure id=fig-10-11

Measured Lab 4 perplexities on a logarithmic scale. The large per-tensor-int4
failure and the more modest W8A8 damage are both visible. Weight-only and
activation-quantised points are separate experiments, not interchangeable
storage/quality trade-offs.

:::

### Activation range can be much harder than weight range

On disjoint calibration windows, the worst activation channel ratio in Lab 4
was in layer 11's down-projection: a maximum magnitude about 2,479 against a
median channel maximum about 1.307, a ratio near 1,897. The worst comparable
weight ratio was much smaller. A single per-tensor activation scale then gives
ordinary channels little resolution, even with eight bits.

LLM.int8() studies large-magnitude hidden features and uses a mixed-precision
decomposition: outlier dimensions receive floating-point computation while the
remaining dimensions use int8 with suitable scales. That can preserve accuracy
but introduces kernel complexity and overhead. Outliers depend on layer, input
distribution and model; a maximum observed in a small calibration set is not a
guaranteed bound for every future request.

**Weight-only** formats such as W4A16 principally reduce weight traffic.
**Weight-and-activation** formats such as W8A8 also enable lower-precision
arithmetic where hardware and kernels support it. The latter can help compute-bound
prefill and large batches, but must control activation error. In Lab 4, dynamic
per-tensor int8 activations with per-channel int8 weights gave perplexity 40.8337,
much worse than weight-only int8. The multiplication still executes in float32
there: it is a damage simulation, not a hardware W8A8 performance test.

### Move range before rounding: SmoothQuant

Use row-vector notation $\mathbf Y=\mathbf X\mathbf W$, with activation channels
along the columns of $\mathbf X$ and corresponding input rows of $\mathbf W$.
For positive channel scales $\mathbf s$,

$$
\mathbf X\mathbf W=
(\mathbf X\operatorname{diag}(\mathbf s)^{-1})
(\operatorname{diag}(\mathbf s)\mathbf W).
$$

Before quantisation this is an exact identity. It trades activation range for
weight range without changing the product. SmoothQuant chooses a channel scale
from calibration maxima, for example

$$
s_j=\frac{(\max|X_j|)^\alpha}{(\max|W_j|)^{1-\alpha}}.
$$

At $\alpha=0.5$, writing the maxima as $A$ and $C$ gives $s=\sqrt{A/C}$,
so $A/s=Cs=\sqrt{AC}$. Equal maxima do not guarantee equal quantisation error,
but they explain the balancing mechanism. Scale division can often be folded
into preceding operations; folding must preserve every consumer and residual
path. For a down-projection after a nonlinear gated product, the transformation
requires more care than altering a preceding normalisation vector. Lab 4 performs
explicit input division so the algebra stays inspectable.

::: worked title="Moving one channel's difficulty"

For activation maximum 40 and weight maximum 0.5, $\alpha=0.5$ gives
$s=\sqrt{80}\approx8.94$. Both transformed maxima become about 4.47.
At $\alpha=0.75$, $s\approx18.91$, giving about 2.11 for activations and 9.46
for weights. More range moves to the static weights, which can use finer
granularity. The best trade-off must be chosen on calibration data and checked
on held-out data, rather than assuming equalisation is always optimal.

:::

::: figure id=fig-10-12

SmoothQuant redistributes channel ranges while preserving the unrounded product.
The scale can make activation rounding easier at the expense of weight range;
the subsequently rounded product is still approximate.

:::

The recorded W8A8 experiment improved from 40.8337 perplexity to 26.2966 with
$\alpha=0.5$ and 23.6349 with $\alpha=0.8$. That result supports the mechanism
on this calibration/evaluation sample. It does not identify a universal alpha.

### Choose compensating weight errors: GPTQ

In column-vector notation, a layer's calibration objective is
$\|\mathbf W\mathbf X-\hat{\mathbf W}\mathbf X\|_F^2$. Each output row can
be treated separately, using the same input covariance. Let
$\mathbf H=2\mathbf X\mathbf X^\mathsf T$ for a row's local quadratic model.
When one coordinate is rounded, unrounded coordinates can compensate for its
effect on the calibration outputs. Correlated inputs make such compensation
more useful than minimising independent weight errors.

For a positive-definite active Hessian $\mathbf H_F$, minimise
$\tfrac12\boldsymbol\delta^\mathsf T\mathbf H_F\boldsymbol\delta$ subject to
$\delta_q=Q(w_q)-w_q=-e_q$. A Lagrange multiplier gives
$\mathbf H_F\boldsymbol\delta+\lambda\mathbf u_q=0$, where $\mathbf u_q$
selects coordinate $q$. Applying the constraint yields

$$
\boldsymbol\delta=
-\frac{e_q}{[\mathbf H_F^{-1}]_{qq}}\mathbf H_F^{-1}\mathbf u_q.
$$

Freeze the quantised coordinate and continue over the remaining active ones.
The inverse-Hessian column directs the adjustment; this is an optimum for the
stated local quadratic constraint, not a global optimum for model perplexity.
Singular or ill-conditioned calibration covariance requires damping. GPTQ makes
the process practical through shared column ordering, blocked updates and a
Cholesky-based implementation. Its original paper reports four-bit compression
of very large models using modest calibration text and roughly four GPU-hours
for a 175B model. That historical experiment is not a runtime estimate for every
quantisation implementation or hardware generation.

### Protect salient channels: AWQ

AWQ uses activation statistics to identify consequential weight channels. Its
scaling argument is visible in a single contribution: scale a weight channel by
$s>1$ before rounding and divide its input activation by $s$. If the group's
quantisation step stays approximately $\Delta$, the effective weight rounding
error falls from about $\Delta/2$ to $\Delta/(2s)$. But the scaled channel may
raise the group's maximum and therefore $\Delta$. This limits the benefit of
arbitrarily large scales.

AWQ searches activation-derived scales over a small grid and selects the ones
that reduce calibration output error. It avoids gradient-based model retraining.
Its results on evaluated larger models support calibrated four-bit deployment,
but “under one point” quality loss is meaningful only for a named metric, task
and checkpoint. Small models, unusual domains and exact-copy tasks need their
own measurements. NF4, described in Module 9, serves a different purpose in
QLoRA training; do not equate it with every int4 serving format.

### Quantise the cache and evaluate the final artifact

An ideal one-byte cache halves memory and traffic. For the case study it admits
36 full-length requests instead of 18. At full batch, $36$ half-size caches read
the same ideal number of bytes as $18$ bf16 caches, so the traffic-model aggregate
throughput doubles. This omits scale metadata, quantise/dequantise cost and quality
damage. Key outliers and value statistics differ; KIVI studies per-channel keys
and per-token values at very low bit widths. Test the longest contexts and the
tasks actually served, not only short generic text.

Perplexity is a sensitive initial check, but can conceal a drop in schema
validity, evidence-reference copying or domain checker pass rate. Use the held-out
suite established in [Module 9](module_09_EN.html), including both languages.
Choose calibration data representing the deployment, preserve a separate test
set and evaluate the **exact quantised file** after conversion. Hash that file
and deploy the hash that passed. A conversion tool's successful exit establishes
that it wrote a file; it does not establish that the file preserved the needed
behaviour.

::: check

Why can SmoothQuant preserve an exact product before quantisation and still alter
the model's predictions after quantisation?

:::

::: answer

The compensating scales cancel in exact arithmetic. Rounding the transformed
weights and activations introduces new errors that do not cancel in general.
The identity motivates a better error distribution; held-out evaluation measures
whether that trade-off helped.

:::
