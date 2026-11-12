## Two phases: prefill and decode {#s1}

A language model answers a request by running two different workloads. First it
processes the prompt. Then it produces new tokens one at a time. These phases use
the same weights, but they place very different demands on the hardware. Knowing
which phase dominates is the first step towards a useful latency estimate.

During **prefill**, the model receives all prompt positions together. A causal
mask stops an earlier position from seeing a later one, but the matrix products
for those positions can still execute in parallel. Every decoder layer computes
keys and values for the prompt and writes them into a **key-value (KV) cache**.
The last prompt position produces the logits from which the first output token
is selected. Earlier prompt logits are unnecessary for generation, although an
unoptimised implementation may compute them too.

During **decode**, the next forward pass receives that selected token. Its query
attends to the earlier keys and values, and its new key and value join the cache.
The model selects another token, appends it and repeats. Generation ends at an
end-of-sequence token, a configured stop condition or the output-token limit.
[Module 7](module_07_EN.html#s5) explains the sampling rule; the concern here is
what each forward pass costs. The second output cannot generally be computed
before the first has been selected, because it is conditioned on the first.

### Count operations and traffic separately

[Module 6](module_06_EN.html) derives the forward-operation convention used
throughout the series. Memory counts all $N$ parameters. Matrix operations count
$N_{\mathrm{matmul}}$, which excludes an untied input embedding table: looking up
one row is not multiplying by every row. The convention retains tiny norm terms
as an approximation. A token at context length $t$ costs approximately
$2N_{\mathrm{matmul}}+4Ldt$ FLOPs. A multiplication and an addition count as two
FLOPs; $L$ is the layer count and $d$ the model width.

For a prompt of $T_p$ tokens, summing the causal attention term gives

$$
\sum_{t=1}^{T_p}4Ldt=2LdT_p(T_p+1),\qquad
F_{\mathrm{prefill}}\approx 2N_{\mathrm{matmul}}T_p+2LdT_p^2.
$$

The square term is small at short context, but it grows faster than the projection
term. These are operation counts, not elapsed time. A kernel may perform work
on masked positions; fusion and tiling determine how closely execution follows
the count. The estimate is appropriate for planning and comparison, then needs
measurement on the actual engine.

We use **decimal units** here: kB means $10^3$ bytes, GB means $10^9$ bytes,
TB/s means $10^{12}$ bytes per second and TFLOP/s means $10^{12}$ FLOPs per second.
Modules 3 and 6 sometimes use binary KiB and GiB. When a cache quantity recurs,
we give both forms so a unit change cannot masquerade as a model change.

The running case is hypothetical. A team has adapted the bilingual 9.5B model
chosen in [Module 7](module_07_EN.html) to draft and check safety-case arguments
for the pressure-relief system of a reactor vessel. Module 9 merged its LoRA
adapter into bf16 weights. This module evaluates a quantised serving artifact
of about 5.5 GB and sizes requests of 4,000 input and 2,000 output tokens, about
2,000 requests a day. The complete accounting appears in [Section 11](#s11).

### Estimate the two times

Let $P_{\mathrm{peak}}$ be dense peak FLOP/s and $\mathrm{BW}$ peak memory
bandwidth. Model FLOPs utilisation, or MFU, expresses achieved model computation
as a fraction of the peak. We **assume 50% MFU for prefill** in every GPU estimate
in this module. We use **peak bandwidth for decode** to obtain an optimistic
bound. Neither assumption is a measurement or a guarantee.

$$
\mathrm{TTFT}\approx t_{\mathrm{queue}}+
\frac{F_{\mathrm{prefill}}}{\mathrm{MFU}\,P_{\mathrm{peak}}},\qquad
\mathrm{TPOT}\gtrsim\frac{W+kt}{\mathrm{BW}}.
$$

Here TTFT is time to first token, $W$ is the weight-file byte count, and $k$ the
cache bytes per token for one sequence. TPOT is time per output token after the
first. A client's TTFT additionally includes tokenisation, transport and sampling.
The inequality is a traffic-model floor: real kernels may move more bytes, achieve
less bandwidth or spend time in other operations.

For $n_{\mathrm{out}}$ output tokens, with approximately constant decode time,

$$
\mathrm{E2E}\approx\mathrm{TTFT}+(n_{\mathrm{out}}-1)\mathrm{TPOT}.
$$

The subtraction matters: the first output was already obtained during prefill.
For a long answer it changes the result little, but it prevents counting the first
token twice. Since the cache grows, using the mean decode context is a convenient
approximation to summing every step separately.

::: worked title="A short prompt and a long answer"

For the case model, $N=9{,}550{,}729{,}216$ and
$N_{\mathrm{matmul}}=8{,}927{,}875{,}072$, with $L=36$ and $d=4096$.
A 2,000-token prompt requires $3.57\times10^{13}$ projection FLOPs and
$1.18\times10^{12}$ causal-attention FLOPs: $3.69\times10^{13}$ altogether.
At the assumed 50% of 989 TFLOP/s on an H100 SXM, that is about 75 ms.
At 50% of the 165 TFLOP/s reference consumer profile, it is about 0.45 s.

A 500-token answer has a mean context near 2,250 tokens. Its cache traffic adds
$147{,}456\times2250=0.332$ GB per step, so the 1.0 TB/s profile gives
$(5.5+0.332)/1000=0.00583$ s per step. The resulting end-to-end estimate is
$0.45+499\times0.00583\approx3.36$ s. Decode accounts for about 87% of it.
Doubling the prompt to 4,000 tokens raises prefill to about 0.92 s, while the
mean-context decode step rises only to about 6.13 ms.

:::

The total-parameter shortcut $2N$ would give $1.91\times10^{10}$ FLOPs per token,
about 7% above the series' projection convention. Use it only as an explicitly
rough approximation. At 32,768 prompt tokens, the attention estimate is about
$3.17\times10^{14}$ FLOPs against $5.85\times10^{14}$ projection FLOPs. Dropping
attention then loses a substantial part of the work.

### Why the simple byte estimate is useful

At batch one, large projection weights generally must be brought from device
memory on each step; they do not fit in the on-chip cache. The input embedding
is an exception because only one row is looked up. The output head still scores
the vocabulary. For the case's mixed-precision file, subtracting the roughly
0.623 GB input table leaves about 4.9 GB of weight traffic. If the kernels achieved
85% of the 1.0 TB/s peak, that traffic alone would take about 5.8 ms rather than
the file-based estimate's 5.5 ms. Those two particular corrections nearly cancel.
We therefore keep the transparent $W=5.5$ GB convention, then add cache traffic.
It remains an approximation: the cancellation need not hold on another model.

::: figure id=fig-10-1

One request has a parallel prefill followed by serial decode steps. The 0.45 s
prefill and approximately 5.8 ms steps are bounds under the stated assumptions,
not a measured deployment timeline. The phase separation explains why shortening
an answer can save much more time than removing the same number of prompt tokens.

:::

Input positions share large matrix products and a weight read; output positions
usually require successive reads. This mechanism helps explain the input/output
price difference discussed in Module 7, although commercial prices also reflect
utilisation, competition and operating costs. A token price is not a hardware
constant. Similarly, a model with high advertised FLOP/s does not necessarily
decode a single request quickly. The next section supplies a way to identify
which resource matters for a given operation.

::: check

Two devices have the same memory bandwidth but very different dense FLOP/s. Which
should decode one short-context sequence faster, assuming both fit the weights?

:::

::: answer

To first order they have similar bandwidth-bound decode times. More FLOP/s helps
prefill and sufficiently large batches. Different kernels, achieved bandwidth
and host overhead can still make their measured decode speeds different.

:::

## The roofline model: compute-bound and bandwidth-bound {#s2}

Arithmetic intensity measures how much computation an operation gets from each
byte transferred between off-chip memory and compute units. Define it as
$I=F/M$, FLOPs divided by moved bytes. If the device can perform
$P_{\mathrm{peak}}$ FLOP/s and supply $\mathrm{BW}$ bytes/s, a simple ceiling is

$$
P(I)=\min(P_{\mathrm{peak}},I\,\mathrm{BW}),\qquad
I^*=\frac{P_{\mathrm{peak}}}{\mathrm{BW}}.
$$

The **ridge point** $I^*$ is where the bandwidth line meets the compute ceiling.
Below it, even perfect use of the supplied bytes cannot feed the arithmetic units
fast enough. Above it, there is enough potential reuse for computation to become
the limit. On logarithmic axes these two regions form the sloping and horizontal
parts of a roof. Williams, Waterman and Patterson introduced the roofline as a
visual performance model in 2009; it is useful precisely because it is a ceiling
with stated traffic assumptions, rather than a detailed simulator.

### A matrix-vector product reads many weights for little work

Consider $\mathbf{y}=\mathbf{W}\mathbf{x}$ with
$\mathbf{W}\in\mathbb{R}^{m\times n}$. Each of $m$ output elements needs $n$
multiplications and approximately $n$ additions, giving $2mn$ FLOPs under our
convention. If all tensors use $b$ bytes per element, an ideal single read/write
traffic count is $b(mn+n+m)$ bytes. Thus

$$
I_{\mathrm{vector}}=\frac{2mn}{b(mn+n+m)}\approx\frac{2}{b}.
$$

For large dimensions, the weight matrix dominates the vector and output traffic.
bf16 weights therefore give about one FLOP per byte. Int8 weight-only storage
gives about two, and int4 about four, if the activation and scale traffic is
comparatively small. Those mixed-format approximations concern storage traffic;
they do not imply integer multiplication is used. A weight-only kernel can
unpack low-bit weights and still multiply in a floating-point format.

For the H100 SXM profile, $I^*=989/3.35\approx295$ FLOP/byte. A bf16 matrix-vector
product at $I\approx1$ can attain at most about 3.35 TFLOP/s in this model,
only 0.34% of a 989 TFLOP/s peak. That low fraction is consistent with a healthy
bandwidth-bound kernel. It does not by itself mean the server needs optimisation.
Reporting only GPU arithmetic utilisation can therefore suggest the wrong remedy.

### A matrix-matrix product reuses the weights

Now let $\mathbf{X}\in\mathbb{R}^{n\times B}$ contain $B$ token vectors. The
product $\mathbf{Y}=\mathbf{W}\mathbf{X}$ performs $2mnB$ FLOPs while its ideal
traffic is $b(mn+nB+mB)$. Therefore

$$
I(B)=\frac{2mnB}{b(mn+nB+mB)}.
$$

For a square $d$-wide product,

$$
I(B)=\frac{2dB}{b(d+2B)}\approx\frac{2B}{b}\quad(B\ll d),
\qquad \lim_{B\to\infty}I(B)=\frac{d}{b}.
$$

The matrix does not have to be read separately for each column. Good kernels tile
it into on-chip storage and reuse tiles across columns. The $2B/b$ approximation
describes the resulting initial growth; the exact expression also counts growing
activation traffic. It eventually saturates rather than increasing without bound.
Actual tile reuse, layouts and cache behaviour can move the measured operation
below this ideal traffic roof.

::: worked title="Moving along the roof"

For $d=4096$ and bf16, $I(B)=4096B/(4096+2B)$. At $B=1,16,64,256,2048$ the
intensities are approximately $1.0,15.9,62.1,227.6,1024$ FLOP/byte. The first four
remain below the H100 profile's 295 ridge, while the prefill-sized last product
has enough reuse to be compute-bound in this ideal model.

Using the small-$B$ approximation, bf16 reaches that ridge near $B=295$. Int4
weight-only storage on the 165 FLOP/byte consumer profile reaches its projection
balance near $4B=165$, or $B\approx41$. For the entire case file, including its
higher-precision head, the weights-only balance is instead
$B\approx165\times10^{12}\times5.5\times10^9/(2N_{\mathrm{matmul}}10^{12})
\approx51$. These are projection balances, not supported serving concurrencies.

:::

### Attention reads a different cache for every sequence

Batching the projection matrices does not share unrelated users' keys and values.
At one layer and one decode position, attention performs approximately
$4n_h d_{\mathrm{head}}t$ FLOPs and reads
$2n_{\mathrm{kv}}d_{\mathrm{head}}tb$ bytes of cached keys and values. Its intensity is

$$
I_{\mathrm{attention}}\approx
\frac{4n_h d_{\mathrm{head}}t}{2n_{\mathrm{kv}}d_{\mathrm{head}}tb}
=\frac{2(n_h/n_{\mathrm{kv}})}{b}.
$$

For the case's four query heads per KV head and bf16 cache, this is four
FLOPs per byte, independently of batch size. Both the attention work and the
cache traffic grow with the number of sequences. A large batch can amortise
weight traffic while remaining bandwidth-bound because of cache traffic.
At long context, more sequences produce diminishing aggregate gains and slower
steps for each user. Memory capacity often runs out before the projection balance
is reached. Section 5 quantifies this effect rather than assuming linear scaling.

::: figure id=fig-10-2

Computed rooflines for the H100 SXM and the reference 24 GB profile. The bf16
projection markers move right as B grows; the decode-attention intensity remains
near four FLOP/byte. The graph separates potential arithmetic reuse from the
traffic that each sequence must still supply.

:::

### Measure the resource the phase uses

For prefill, report achieved model FLOP/s divided by a compatible dense peak:
MFU. For decode, an estimated memory-bandwidth utilisation, MBU, compares the
assumed bytes moved per second with peak bandwidth. If bytes are estimated rather
than counted, call it an estimate. Neither metric is comparable across runs
without the model, context, batch and precision. Fused kernels can also make
attribution to one operation difficult.

Lab 1 measures a float32 CPU matrix product with four threads. In the recorded
run, B = 1 suggested 48.24 GB/s effective bandwidth; the largest tested product
achieved 621.6 GFLOP/s, giving an estimated ridge of 12.88 FLOP/byte. These numbers
belong to that machine and measurement, not to all CPUs. A one-column product may
select a different matrix-vector kernel from the two-column product. Do not infer
that B = 2 is free because one weight read is theoretically shared.

The CPU experiment is also a warning about interpreting a roofline too literally.
One giant matrix can have better locality and lower dispatch overhead than a
decoder with many small projections, norms and attention operations. Lab 6 puts
the matrix-derived floor next to a real model's measured steps. Agreement is a
useful clue; disagreement invites profiling rather than a change of formula until
the prediction happens to match.

Peak specifications need compatible precision and accumulation. Sparse tensor
figures assume supported structured sparsity. A dense model cannot claim them.
Some consumer tensor figures change by a factor of two with accumulation format.
Always read the table's footnotes before calculating a ridge. Section 4 uses
dated primary specifications and distinguishes supplied facts from assumptions.

::: check

Why can batching greatly increase aggregate decode throughput without making one
user's answer faster?

:::

::: answer

Each iteration produces one token per sequence and shares weight traffic. It
still reads each sequence's cache. Aggregate output grows with the number of
sequences, while an individual sequence receives only one token per iteration,
whose duration may increase with the batch.

:::

## The KV cache in depth {#s3}

Caching is exact under the causal dependency structure. An earlier position's
hidden state, key and value depend on its own token and earlier tokens, not on
future generated tokens. Once computed, they need not change when another token
is appended. The new query can attend to these saved states rather than asking
every layer to recompute the entire prefix. Exactness here means the same
mathematical function; floating-point reduction order can still change final bits.

Without caching, a sequence growing to $T$ positions processes prefixes of length
$1,2,\ldots,T$. That is $T(T+1)/2$ position-forwards, versus roughly $T$ with a
cache. This is the saving in projection work. Attention over the growing prefix
still costs work at every step, so caching does not make total generation
independent of context length. It removes recomputation of old states, not the
need for new queries to read them.

### Derive capacity from a configuration

At each token and layer there is one key and one value vector for each KV head.
Each vector has $d_{\mathrm{head}}$ elements. With $b$ bytes per element,

$$
k=2L n_{\mathrm{kv}}d_{\mathrm{head}}b,\qquad
M_{\mathrm{KV}}=kTB.
$$

The dimensions of an individual layer's K and V tensors are
$(B,n_{\mathrm{kv}},T,d_{\mathrm{head}})$. The leading two counts keys **and**
values; the layer count includes all layers. Omitting either gives a plausible
but wrong memory estimate. Query heads enter the attention work but do not each
need separate saved keys when the architecture shares them.

For multi-head attention, KV heads equal query heads. **Grouped-query attention**
(GQA) shares one set of keys and values among several query heads.
**Multi-query attention** (MQA) shares one set among all query heads. These are
architectural choices, usually learned during training or a deliberate conversion;
one cannot freely change a checkpoint's head configuration at serving time.
Module 6 explains their attention computation. Here the practical consequence is
the cache reduction by the query/KV head ratio.

::: worked title="The case study's cache"

The model has 36 layers, eight KV heads and head dimension 128. A bf16 cache uses
$2\times36\times8\times128\times2=147{,}456$ B per token, or 144 KiB.
One 6,000-token sequence uses 0.884736 GB; 32,000 tokens use 4.718592 GB.
Eighteen 6,000-token sequences fit in a 16 GB cache budget, because
$18\times0.884736=15.925248$ GB and a nineteenth would exceed it.

With 32 KV heads instead, the per-token cache is 589,824 B and each 6,000-token
sequence uses 3.538944 GB: only four fit. With one KV head the count would be
18,432 B per token. At eight KV heads, changing bf16 values to one-byte values
halves the ideal byte count to 73,728 B, before scale metadata.

:::

::: figure id=fig-10-3

Every layer stores compact K and V tensors. A new position appends one slice
along the token axis in both tensors. Shared KV heads remain shared in storage;
expanding them permanently to query-head count would throw away GQA's saving.

:::

### Parameter count alone does not determine cache size

An embedding vocabulary can add many parameters without adding any key or value
state. Conversely, a model with more layers or more KV heads can have a much
larger cache than another similarly named parameter class. Read the actual
configuration and derive head dimension from width divided by query heads where
the model uses that convention. Some architectures specify head dimension
independently or use different cache representations.

For familiar published decoder configurations, the bf16 counts are:

| Configuration | Layers / KV heads / head dimension | Bytes per token | Cache for 4,096 tokens |
|---|---:|---:|---:|
| Llama-2-7B, multi-head | 32 / 32 / 128 | 524,288 B, 512 KiB | 2.147 GB |
| Llama-3.1-8B, GQA | 32 / 8 / 128 | 131,072 B, 128 KiB | 0.537 GB |
| Mistral-7B-v0.1, GQA | 32 / 8 / 128 | 131,072 B, 128 KiB | 0.537 GB |
| Qwen2.5-7B, GQA | 28 / 4 / 128 | 57,344 B, 56 KiB | 0.235 GB |

These are full-context tensor counts, computed from the named releases' configs,
not measured process allocations. A sliding-window implementation may retain
fewer positions. Configuration links appear in the references. Exercise 3 asks
you to apply the same calculation to three smaller models without assuming that
the smallest parameter count gives the smallest cache.

### Capacity and traffic are related but different

At about $5.5\times10^9/147{,}456\approx37{,}300$ positions, one case-study
sequence's cache equals the rounded weight-file size. With 18 sequences at a
5,000-token mean context, the cache read is about 13.27 GB per step, already
2.4 times the weight file. A device may hold this cache comfortably while taking
much longer to read it at every decode iteration. Free memory determines whether
the request can run; bandwidth helps determine how quickly it advances.

::: figure id=fig-10-4

A conservative 24 GB budget with 5.5 GB weights and an assumed 2.5 GB runtime
allowance. GQA leaves room for 18 full-length requests; multi-head storage leaves
room for four. Unused remainder and runtime memory still count against capacity.

:::

Other cache designs change this accounting. Sliding-window attention retains a
bounded recent context; Mistral 7B's original architecture used a 4,096-token
window. DeepSeek-V2's multi-head latent attention caches a compressed latent
representation rather than full keys and values. Those are model/kernel-specific
mechanisms, not arbitrary drop-in replacements for this formula. An 8-bit cache
reduces value storage but needs scale metadata and quality evaluation. Offloading
cache to host memory increases capacity at the cost of transfers across a much
slower link; a capacity solution can become a latency problem.

### Correct positions and allocation strategy

A growing cache implemented by concatenation allocates and copies old tensors.
It is simple enough for Lab 2 but adds work at every step. Production systems
usually pre-allocate storage or obtain fixed-size blocks from a pool. Paging is
described in Section 6. Logical position, physical block address and tensor length
must be kept distinct, particularly with left padding and shared prefixes.

RoPE rotates a token's query and key using its semantic position. For a single
unpadded request, the next token's position is the number of earlier positions.
For a left-padded batch, tensor columns include padding that does not advance a
row's semantic position. After prefix reuse, positions must continue after the
reused prefix, rather than restarting from zero. None of these mistakes necessarily
causes an exception. The shapes can be correct while the function is wrong.

Lab 2 compares logits as well as tokens. Its correct cache produced the same
256 tokens as full recomputation, with maximum logit error $1.79\times10^{-6}$.
The exact measured cache was 555,008 bytes for 271 positions. An off-by-one
rotation kept the greedy tokens equal while changing logits; a frozen position
changed a token by output position 9. Once tokens diverge, later logit differences
also include different conditioning text. A strong regression test compares
cached and uncached logits on a common prefix before evaluating generated strings.

::: check

Why does causal caching preserve the model's function, and why is equality of
greedy tokens alone an inadequate implementation test?

:::

::: answer

Earlier states do not depend on future tokens under the causal mask. Reusing them
is mathematically equivalent to recomputation. But incorrect logits can retain
the same largest component, so token equality can miss an error until a near-tie
or a different prompt exposes it.

:::

## Hardware: the three numbers on a datasheet {#s4}

Capacity, bandwidth and dense compute answer three different sizing questions.
Capacity decides whether weights, runtime buffers and the requested cache fit.
Bandwidth constrains traffic-heavy decode. Compute constrains prefill and products
with substantial weight reuse. Across devices, interconnect bandwidth and latency
add a fourth concern. A high score on one axis cannot compensate for a hard limit
on another: a model that does not fit cannot exploit a fast arithmetic unit.

The table below uses established hardware examples, with primary specifications
checked on **5 October 2026**. It is not a catalogue of the newest products or a
ranking of serving engines. Dense tensor rates exclude structured-sparsity gains.
The reference consumer profile rounds 1.008 TB/s to 1.0 and 165.2 TFLOP/s to 165
for consistency with the calculations. The last column is the optimistic
bandwidth-only bound for 6.23728 GB per decode step at one 5,000-token context.

| Device/profile | Advertised capacity | Bandwidth TB/s | Dense low-precision TFLOP/s | Ridge FLOP/byte | Decode bound tokens/s |
|---|---:|---:|---:|---:|---:|
| H100 SXM | 80 GB | 3.35 | 989 | 295 | 537 |
| A100 80 GB SXM | 80 GB | 2.039 | 312 | 153 | 327 |
| L40S | 48 GB | 0.864 | 362 | 419 | 139 |
| L4 | 24 GB | 0.300 | 121 | 403 | 48 |
| RTX 4090 reference | 24 GB | 1.0, rounded | 165, fp32 accumulation | 165 | 160 |
| M2 Ultra | up to 192 GB unified | 0.800 | not assumed here | — | 128 |
| Two-channel DDR5-5600 example | system-dependent | 0.0896 theoretical | system-dependent | — | 14 |

The NVIDIA sources are the [H100 specifications](https://www.nvidia.com/en-us/data-center/h100/),
[A100 datasheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf),
[L40S specifications](https://www.nvidia.com/en-us/data-center/l40s/),
[L4 specifications](https://www.nvidia.com/en-us/data-center/l4/) and
[Ada architecture whitepaper, Appendix A](https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf).
Apple's [M2 Ultra announcement](https://www.apple.com/newsroom/2023/06/apple-introduces-m2-ultra/)
supplies capacity and bandwidth. The DDR5 example is a calculation:
$2\times8\times5.6\times10^9=89.6\times10^9$ bytes/s. It assumes two populated
64-bit channels and gives a transfer ceiling, not achieved application bandwidth.

### Read the footnotes before dividing

NVIDIA's L4 table lists 242 TFLOP/s with sparsity and explicitly halves that figure
without it. The dense value used here is 121. The RTX 4090 whitepaper distinguishes
165.2 TFLOP/s with fp32 accumulation from 330.3 with fp16 accumulation, before
sparsity. Accumulation precision affects both the relevant ceiling and numerical
behaviour. Copying the largest marketed number into a dense fp32-accumulating
calculation would double the predicted compute performance without justification.

Memory labels also need interpretation. Some nominal GPU capacities correspond
to binary GiB: 24 GiB is about 25.77 decimal GB. Do not assume every device or
partition exposes that exact amount. Query the actual byte capacity reported by
the runtime and measure free memory after loading the engine. Our 24 decimal GB
budget is deliberately conservative for a device exposing 24 GiB, while the
2.5 GB runtime allowance is a separate assumption. ECC reservations, graph buffers
and other processes can consume part of the difference.

For a first estimate, try 70–90% of peak bandwidth and 40–60% of dense compute as
**planning assumptions**, then replace them with measurements. A device-specific
kernel can outperform another device's poorly matched kernel despite a weaker
datasheet. Sustained power and cooling, memory errors, supported formats and
available software matter as well as the three arithmetic columns.

::: worked title="Same capacity, different experience"

The 24 GB profiles leave the same 16 GB cache budget under our assumptions, so
both admit 18 case-study requests. A 6.23728 GB decode read takes about 6.24 ms
at 1.0 TB/s and 20.79 ms at 0.30 TB/s: about 160 versus 48 tokens/s, a 3.3-fold
ratio. Capacity equality is not speed equality.

For the 4,000-token prompt's $7.61\times10^{13}$ FLOPs, 50% of the corresponding
compute peaks gives about 0.15 s on H100, 0.49 s on A100, 0.42 s on L40S,
0.92 s on the reference consumer profile and 1.26 s on L4. These are modelled
prefill times; neither includes a queue or an API round trip.

:::

::: figure id=fig-10-5

Bandwidth-derived single-sequence bounds for the seven examples. Equal-capacity
cards can have different decode limits. The M2 Ultra and DDR5 bars use bandwidth
only, since no comparable tensor-compute ceiling is assumed for them.

:::

### Choose a deployment, not only a chip

Datacentre parts often provide ECC, server cooling, supported multi-device
interconnects and operational support. Consumer parts can be useful for local
experiments but require attention to cooling, physical installation and the
applicable software terms. NVIDIA's [GeForce software licence](https://www.nvidia.com/en-us/drivers/geforce-license/)
contains a datacentre-deployment restriction with a stated exception; inspect the
terms applicable to the intended installation rather than treating physical fit
as permission to deploy. This is a selection constraint, not a latency formula.

Tensor parallelism splits layer work and weights across devices. Ideally their
capacity, bandwidth and compute add, but communication occurs repeatedly through
the layer stack. Two cards joined by a slow host link need not halve decode
latency. Pipeline parallelism adds capacity and can raise throughput with several
requests in flight; one request still traverses all stages. Module 8 explains
the mechanics. Serving estimates must include the actual topology.

A CPU or unified-memory system can fit a model beyond a small discrete GPU's
capacity. The cost is often prefill. On the illustrative DDR5 system, the cache
and weights permit at most about 14 tokens/s from peak bandwidth. If sustained
compute were only an **assumed** 0.5 TFLOP/s, the case's 4,000-token prefill would
take about 152 s. This is a scenario calculation, not a claim about every laptop.
Bandwidth-efficient engines such as llama.cpp make such deployments useful for
some workloads, particularly when interactive long-prompt latency is unimportant.

The same reasoning applies to AMD Instinct, Google TPU, Intel Gaudi and other
accelerators once capacity, supported dense arithmetic and achieved bandwidth
are known. Model support, format support and the serving stack must be checked
on that backend. There is no hardware-independent conversion from parameter
count to a reliable tokens-per-second claim.

::: check

Why might adding a faster arithmetic GPU leave single-user decode almost unchanged
while dramatically improving long-prompt prefill?

:::

::: answer

Single-user decode can remain limited by weight and cache traffic. Long-prompt
products reuse weights across many positions and become compute-bound. The
benefit follows the phase's bottleneck, not one overall device speed number.

:::
