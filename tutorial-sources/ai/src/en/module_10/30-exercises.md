## Exercises {#exercises}

Work the estimates from their assumptions before opening the solutions. The
15 exercises take about 130 minutes: seven introductory, seven intermediate
and one capacity-planning project. Decimal units apply unless a binary unit is
explicitly named. Hardware ceilings and assumed prices are not measured service
performance or current quotes.

::: exercise id=e1 level=1 kind=conceptual minutes=5

A colleague estimates batch-one decode for a 9B bf16 model on a 989 TFLOP/s,
3.35 TB/s device as $989\times10^{12}/(2\times9\times10^9)\approx55{,}000$
tokens/s. What is wrong, and what is the correct order of magnitude?

:::

::: solution

The division gives an arithmetic ceiling while ignoring weight traffic. Batch-one
bf16 projections have intensity near one FLOP/byte, far below the device's
$989/3.35\approx295$ ridge. Reading roughly 18 GB per token takes
$18\times10^9/(3.35\times10^{12})\approx0.00537$ s, or about 186 tokens/s.
Cache reads, incomplete bandwidth use and overhead lower the achievable rate.
The order is hundreds, not tens of thousands, of tokens/s. A compute-derived
ceiling can describe aggregate work with enough reuse; it is not one user's
decode speed. The illustrative 9B total-count shortcut is itself approximate.

:::

::: exercise id=e2 level=2 kind=derivation minutes=10

Derive the intensity of $\mathbf Y=\mathbf W\mathbf X$ for
$\mathbf W\in\mathbb R^{m\times n}$ at $b_w$ bytes per weight and
$\mathbf X\in\mathbb R^{n\times B}$, $\mathbf Y\in\mathbb R^{m\times B}$
at $b_a$ bytes per activation. Find approximate balance batches for (a) bf16
weights/activations on A100, 312 TFLOP/s and 2.04 TB/s; (b) int8 weights and
bf16 activations on L40S, 362 TFLOP/s and 0.864 TB/s. For a 4,096-square product,
also solve the exact traffic expression. Why do these not give a long-context
server's usable concurrency?

:::

::: solution

Operation count is $2mnB$. An ideal read of both inputs and write of the result
moves $b_wmn+b_aB(n+m)$ bytes, giving

$$
I(B)=\frac{2mnB}{b_wmn+b_aB(m+n)}.
$$

When activation traffic is small compared with weights, $I\approx2B/b_w$.
The A100 ridge is $312/2.04\approx152.94$; with $b_w=2$, the approximate balance
is $B\approx153$. The L40S ridge is $362/0.864\approx418.98$; with $b_w=1$,
$B\approx209.49$, about 210.

For square width $d$ and ridge $R$, solving
$2dB/(b_wd+2b_aB)=R$ gives

$$
B=\frac{Rb_wd}{2d-2Rb_a}.
$$

At $d=4096$, this yields about 165.3 and 263.4 respectively. Round up when asking
for the first integer batch above the ridge. The denominator must be positive;
otherwise the finite-width traffic model cannot reach that ridge at any batch.
Real decode also reads each sequence's own cache, whose intensity does not grow
with batch, and the cache must fit. The case model admits only 18 full-length
requests in the conservative 24 GB budget, far below these projection balances.

:::

::: exercise id=e3 level=2 kind=calculation minutes=10

Compute bf16 and one-byte KV cache bytes per token, and bf16 memory for one
8,192-token request, from these configs: SmolLM2-135M has 30 layers, width 576,
nine query heads and three KV heads; SmolLM2-360M has 32, 960, fifteen and five;
Qwen2.5-0.5B-Instruct has 24, 896, fourteen and two. Which has the smallest
cache despite the largest parameter class?

:::

::: solution

All three have head dimension width/query-heads equal to 64. Apply
$k=2Ln_{\mathrm{kv}}d_{\mathrm{head}}b$:

| Model | bf16 B/token | One-byte B/token | bf16 for 8,192 tokens, MB |
|---|---:|---:|---:|
| SmolLM2-135M | 23,040 | 11,520 | 188.744 |
| SmolLM2-360M | 40,960 | 20,480 | 335.544 |
| Qwen2.5-0.5B-Instruct | 12,288 | 6,144 | 100.663 |

For example, $2\times24\times2\times64\times2=12{,}288$ bytes, multiplied
by 8,192 gives 100,663,296 bytes. Qwen's smaller layer/KV-head product wins.
Its much larger vocabulary contributes many parameters to the embedding table
without adding per-token KV state. These ideal one-byte counts omit scales;
the parameter label alone cannot determine cache capacity.

:::

::: exercise id=e4 level=1 kind=conceptual minutes=5

Why does sharing eight KV heads among 32 query heads quarter the cache but leave
attention FLOPs approximately unchanged? Why can it accelerate long-context
decode, and what is the architectural trade-off?

:::

::: solution

Every query head still scores the context and forms a weighted value sum. Sharing
the key/value representation does not remove those query-head operations. It
does remove three quarters of stored and ideally read key/value elements.
Bandwidth-bound attention therefore benefits, subject to the kernel actually
reusing compact KV storage rather than permanently expanding it. More cache
fits as well. Sharing reduces independent key/value representations, so quality
must be established for the trained or converted architecture. GQA's empirical
quality is a model result, not permission to change an existing checkpoint's
head count in its configuration without a compatible conversion.

:::

::: exercise id=e5 level=1 kind=conceptual minutes=5

A server reserves 8,192 cache positions for every request. Name the allocation
wastes, say what paging removes and bound the unused tail with blocks of $b$
tokens. Why not always choose one-token blocks?

:::

::: solution

Reservations include future positions never used; contiguous allocations can
leave external gaps; each allocation can also have an unused tail. On-demand
blocks avoid the full maximum-length reservation and draw from a common pool,
avoiding external gaps between differently sized contiguous regions. They still
leave at most $b-1$ unused slots in a request's final block. With a roughly uniform
remainder, the mean tail is $(b-1)/2$ slots. One-token blocks remove that tail
but require many more table entries and smaller gathered pieces, increasing
management overhead and potentially reducing memory-access efficiency. Choose
the block size supported and measured on the backend, rather than minimising
tail bytes in isolation.

:::

::: exercise id=e6 level=1 kind=conceptual minutes=5

A prompt is assembled as a changing request timestamp, a 2,500-token system
message, a project-shared 1,200-token standard excerpt and a roughly 100-token
question, in that order. Reorder to improve prefix reuse. With 16-token blocks,
how many stable positions can skip prefill in the idealised token counts?

:::

::: solution

Put the system message first, the project-shared excerpt next, then the question
and timestamp. Moving the timestamp into the variable user turn also works.
Every request shares the system prefix; requests in one project share 3,700
stable positions. The reusable full-block count is
$\lfloor3700/16\rfloor=231$, or 3,696 positions. Four stable boundary positions
remain in the final partial block. In the original ordering, the first changed
block destroys the identity of the later prefix as well. Actual tokenisation and
template markers must be included: the arithmetic assumes the quoted counts
already describe the exact assembled token prefix.

:::

::: exercise id=e7 level=1 kind=conceptual minutes=5

Compare int4 block-weight schemes: (a) group-128 with fp16 scale and fp16
zero-point, 4.25 bits/weight; (b) group-32 with fp16 scale only, 4.5 bits/weight.
Which is likely to handle isolated outliers better? What does (a)'s zero-point
offer instead? Are either quality rankings guaranteed?

:::

::: solution

Smaller groups confine an isolated outlier's coarse scale to fewer neighbours,
so (b) often protects ordinary weights better. The zero-point in (a) shifts the
grid to use levels efficiently for a skewed range; it does not remove the wide
range caused by the outlier. Neither is universally superior: group distribution,
outlier placement, activation saliency and calibration all matter. For
$8.305\times10^9$ block weights the ideal sizes are about 4.41 and 4.67 GB,
a roughly 0.26 GB difference before other tensors and metadata. Spend those
bytes only after comparing held-out output quality and kernel support.

:::

::: exercise id=e8 level=2 kind=calculation minutes=10

Quantise $\mathbf w=(0.62,-0.11,0.05,-0.90,0.33,0.07,-0.25,0.48)$ to int4 with
(a) symmetric absmax, codes $-7$ through 7; (b) min-max zero-point, codes 0
through 15. Give codes, reconstruction and RMS error. Then replace 0.05 with
4.5 and repeat (a), examining the other seven weights.

:::

::: solution

(a) $s=0.90/7\approx0.128571$. Codes are $(5,-1,0,-7,3,1,-2,4)$, reconstructed
as approximately $(0.642857,-0.128571,0,-0.900000,0.385714,0.128571,-0.257143,0.514286)$.
Compute $\sqrt{\sum_j(w_j-\hat w_j)^2/8}$ to obtain 0.037297.

(b) $s=(0.62+0.90)/15\approx0.101333$ and $z=9$. Codes are
$(15,8,9,0,12,10,7,14)$; reconstruction is approximately
$(0.608,-0.101333,0,-0.912,0.304,0.101333,-0.202667,0.506667)$.
RMS error is 0.030562. Rounded zero-point shifts an endpoint slightly; exact
endpoint reconstruction is not promised.

(c) $s=4.5/7\approx0.642857$. Codes become $(1,0,7,-1,1,0,0,1)$.
The ordinary weights now use only zero and $\pm0.642857$. Their RMS error,
excluding the exactly represented outlier, is about 0.196595. The whole-vector
RMS is 0.183898. Stating which population is averaged prevents those two correct
but different error numbers from being confused.

:::

::: exercise id=e9 level=2 kind=derivation minutes=10

Prove the acceptance/residual speculative-sampling identity and show acceptance
is $1-\mathrm{TV}(p,q)$. Verify it for
$p=(0.55,0.25,0.15,0.05)$ and $q=(0.30,0.40,0.10,0.20)$.

:::

::: solution

Accepted mass for token $x$ is $q(x)\min(1,p(x)/q(x))=\min(p(x),q(x))$.
Writing $\beta=\sum_x\min(p,q)$, residual mass totals
$\sum_x\max(0,p-q)=1-\beta$. The rejection contribution to $x$ is therefore
$(1-\beta)r(x)=p(x)-\min(p(x),q(x))$. Adding gives $p(x)$ exactly.
When $p=q$, rejection has probability zero and no residual is required.

Since $\min(p,q)=(p+q-|p-q|)/2$, summing gives
$\beta=1-\tfrac12\sum_x|p-q|=1-\mathrm{TV}(p,q)$.
For the given vectors, overlap is $(0.30,0.25,0.10,0.05)$, so
$\beta=0.70$ and TV is 0.30. Residual is
$(0.25,0,0.05,0)/0.30=(5/6,0,1/6,0)$.
The restored output is $(0.30+0.30\times5/6,0.25,0.10+0.30\times1/6,0.05)=p$.
The proof concerns a common conditional prefix and the distributions actually
sampled. Cache rollback and sampler filtering must preserve those conditions.

:::

::: exercise id=e10 level=2 kind=calculation minutes=10

Derive expected speculative output under independent acceptance $\alpha$.
For $\alpha=0.75$ and unit verification cost, tabulate lengths one through six
with draft ratios $c=0.1$ and $c=0.3$. Which length is best in each range?

:::

::: solution

There is always one replacement or bonus token. Reaching the $k$th accepted
draft has probability $\alpha^k$, so
$E=1+\sum_{k=1}^\gamma\alpha^k=(1-\alpha^{\gamma+1})/(1-\alpha)$.
Divide by $1+\gamma c$ to obtain speed-up:

| Draft length | Expected tokens | Speed-up, c = 0.1 | Speed-up, c = 0.3 |
|---:|---:|---:|---:|
| 1 | 1.750 | 1.591 | 1.346 |
| 2 | 2.313 | 1.927 | 1.445 |
| 3 | 2.734 | 2.103 | 1.439 |
| 4 | 3.051 | 2.179 | 1.387 |
| 5 | 3.288 | 2.192 | 1.315 |
| 6 | 3.466 | 2.166 | 1.238 |

Best tested lengths are five and two. The cheaper draft permits longer proposals;
the expensive one pays too much for rarely reached later tokens. The cost ratio
and acceptance must be considered together. In practice verification cost also
depends on length and load, and acceptance can be conditional rather than
independent. The table is a model-guided starting point for measurement.

:::

::: exercise id=e11 level=2 kind=calculation minutes=10

With 2.5 GB overhead, bf16 cache and 6,000-token requests, compute concurrency
on 24, 48 and 80 GB budgets for (a) 14 GB weights, 48 layers, eight KV heads,
head dimension 128; (b) 2.4 GB weights, 16 layers, eight KV heads, dimension 64.
Give each weights-only single-stream bound at 1.0 TB/s.

:::

::: solution

(a) Cache per token is $2\times48\times8\times128\times2=196{,}608$ B.
Per request it is 1.179648 GB. Free cache budgets are 7.5, 31.5 and 63.5 GB;
flooring the ratios gives 6, 26 and 53 requests. A weights-only 14 GB read takes
14 ms, about 71.4 tokens/s; actual cache reads lower that bound.

(b) Cache per token is $2\times16\times8\times64\times2=32{,}768$ B, or
0.196608 GB per request. Budgets are 19.1, 43.1 and 75.1 GB, giving 97, 219 and
381 requests. The weights-only read takes 2.4 ms, about 416.7 tokens/s. This
small model may hit compute, host or scheduling limits before filling all those
cache slots. The floor ratios establish ideal memory feasibility, not useful
low-latency concurrency.

:::

::: exercise id=e12 level=1 kind=conceptual minutes=5

An agent makes 20 sequential calls per task. Independent per-call p99 tail events
occur in about 18% of such tasks. What latency SLO should the team set, and why
does a per-call p99 alone miss the user's experience?

:::

::: solution

Set an end-to-end task latency objective for the chain the user actually waits
for. Per-call p99 does not describe the distribution of the sum or the chance
of encountering a slow step. A higher per-call percentile can support a task
budget, but must be validated with actual dependencies and step counts. For
example, independent 0.1% events occur at least once in about
$1-0.999^{20}\approx1.98\%$ of 20-call tasks. This still does not directly give
the task's duration quantile. Measure task-level samples and reduce tail sources,
including queueing, long prefills and overloaded dependencies.

:::

::: exercise id=e13 level=1 kind=conceptual minutes=5

The same temperature-zero request differs on a busy server but repeats on an
idle one. Explain how a small numerical difference can grow into different text.
What should a reproducibility test record?

:::

::: solution

Batch shape can select different kernels and floating-point reduction orders.
Slightly different logits may exchange the top two candidates at a near-tie.
Once one token changes, later predictions condition on different text and can
diverge substantially. Greedy sampling fixes selection given logits; it does
not fix the arithmetic that produces them.

Compare the request alone and under representative traffic. Record the first
differing token, common-prefix logits or their maximum difference, the top-two
gap there, batch composition/padding, precision, prefix-cache conditions and
the complete artifact/engine manifest. Later logit differences cannot isolate
the initial numerical cause after conditioning has changed. An identical finite
test is useful evidence, not a guarantee over all requests.

:::

::: exercise id=e14 level=2 kind=calculation minutes=10

Assume a lower rental quote of USD 0.80/hour and 2.4 million output tokens per
busy hour. What is cost per million at full and 25% utilisation? Above what
utilisation does it beat an assumed USD 0.80/million hosted output price at
equal task quality? Name omitted costs. All prices are scenario assumptions.

:::

::: solution

Full utilisation gives $0.80/2.4\approx0.333$ USD per million. At 25%, paid-hour
output is 0.6 million, giving USD 1.333 per million. Break-even solves
$0.80/(2.4u)=0.80$, so $u=1/2.4\approx0.4167$. Above about 42% utilisation,
the assumed card cost is lower on this output-only comparison.

Operations and engineering time, redundant/fallback capacity, host resources and
evaluation costs are omitted. Hosted input charges are also omitted, which can
change the comparison in the card's favour. Equal task quality and latency are
conditions, not consequences of a cheap output rate. Paid idle capacity remains
a cost even when no tokens are generated.

:::

::: exercise id=e15 level=3 kind=project minutes=25

Use Lab 3's functions to find the highest nominal rate meeting p99 TTFT at most
three seconds and pooled p99 ITL at most 100 ms for four profiles: the 24 GB
reference with bf16 cache; that device with one-byte cache; 80 GB at 3.35 TB/s
and 989 TFLOP/s; 24 GB at 0.30 TB/s and 121 TFLOP/s. Use 300 seeded requests,
on-demand admission and 256-token chunks. At assumed hourly prices USD 1.00,
1.00, 2.50 and 0.80, report nominal requests/hour, realised offered rate, output
throughput and cost per million. Explain the ranking and test nearby rates.

:::

::: solution

Keep the entire Lab 3 workload and scheduler unchanged; the experiment varies
only device and cache inputs. Run this code after the Lab 3 definitions:

```python
profiles=[('reference',Device(),1.0),
          ('one-byte cache',Device(kv=73728),1.0),
          ('H100',Device(memory=72e9,bandwidth=3.35e12,compute=.5*989e12),2.5),
          ('L4',Device(bandwidth=.30e12,compute=.5*121e12),.8)]
for label,device,price in profiles:
    rate,report=capacity(device)
    million_per_hour=report['throughput']*3600/1e6
    print(label, 'nominal/hour',rate*3600,'realised/s',report['realised'],
          'output/s',report['throughput'],'USD/million',price/million_per_hour)
    for test_rate in [rate-.005,rate+.005]:
        check=simulate(test_rate,'chunked',device)
        print('nearby',test_rate,'passes',check['ttft99']<=3 and check['itl99']<=.1)
```

The recorded run produced these values, rounded for reporting:

| Profile | Nominal requests/hour | Realised offered requests/s | Output tokens/s | USD/million |
|---|---:|---:|---:|---:|
| Reference, bf16 cache | 878 | 0.274 | 466.3 | 0.596 |
| Reference, one-byte cache | 906 | 0.282 | 482.1 | 0.576 |
| H100 profile | 7,905 | 2.464 | 3,500.0 | 0.198 |
| L4 profile | 232 | 0.072 | 124.0 | 1.792 |

The lower nearby rate passed and the higher failed in all four recorded searches.
Other seeds and policies can move boundaries, so scan the neighbourhood and run
longer tests before using a production capacity. The most expensive assumed
hourly device has the lowest output cost here; the cheapest hourly device has
the highest. Capacity, bandwidth and compute influence SLO-constrained work per
paid hour. The one-byte cache provides a modest improvement in this workload,
not a universal doubling of SLO capacity.

Cost uses actual printed throughput, which includes simulated prefill and queue
behaviour. Nominal requests/hour is the arrival distribution's design parameter;
it is not the finite run's realised completion capacity. The pooled objectives
also permit some bad requests: use the printed request-level goodput and maximum
gaps to assess a stricter experience. This is a scenario comparison, not a claim
about current rentals, actual engine throughput or one-byte-cache quality.

:::
