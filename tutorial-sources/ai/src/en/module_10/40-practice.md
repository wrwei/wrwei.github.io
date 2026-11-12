## Self-check quiz {#quiz}

Answer before revealing the explanations. The questions distinguish bounds,
measurements and service-level conclusions. Allow about 15 minutes.

```quiz
? Ignoring cache reads, what is the weights-only batch-one decode bound for a 5.5 GB file at 1.0 TB/s?
- [ ] About 18 tokens/s
- [x] About 180 tokens/s
- [ ] About 1,800 tokens/s
- [ ] About 9,000 tokens/s
> The traffic floor is 5.5 ms, or about 182 tokens/s. Adding the case study cache gives about 160 at a 5,000-token context. Neither is measured service performance.

? A model has L = 32 layers, 8 KV heads and a head dimension of 128. Its KV cache per token in bf16 is:
- [ ] 32,768 bytes
- [ ] 65,536 bytes
- [x] 131,072 bytes
- [ ] 524,288 bytes
> 2 (K and V) × 32 × 8 × 128 × 2 bytes = 131,072 bytes. 65,536 forgets either the factor 2 for K and V or the 2 bytes per value; 524,288 is the multi-head figure with 32 KV heads; 32,768 drops both factors of 2.

? Which statement about batching decode is correct?
- [ ] Batching shortens each sequence's time per step.
- [ ] Batching amortises both the weight reads and the KV-cache reads across sequences.
- [ ] Batching only helps prefill.
- [x] Batching amortises the weight reads but not each sequence's KV-cache reads, so at long context the gain flattens.
> Batching reuses projection weights but unrelated sequences still supply their own cache states. The ideal aggregate curve flattens at long context; individual step duration can rise.

? The main advantage of continuous batching over static batching is that:
- [x] finished sequences leave and waiting ones join at every step, so slots do not sit idle until the longest sequence ends
- [ ] it removes the need for a KV cache
- [ ] it makes prefill compute-bound
- [ ] it guarantees a lower TTFT at any load
> Iteration-level scheduling lets finished requests leave and waiting work join. It still needs cache storage and cannot guarantee low TTFT past sustainable load.

? Prefix caching never hits on your service. The most likely cause is:
- [ ] the GPU has too little bandwidth
- [ ] the model uses grouped-query attention
- [ ] the cache is stored in 8 bits
- [x] the system prompt begins with a per-request timestamp
> A hit needs an identical token prefix; a value that changes at the top of the prompt makes the first block differ, so nothing after it can match. Bandwidth, GQA and cache precision do not affect matching.

? Quantising SmolLM2-135M's linear weights to int4 with one absmax scale per tensor gave a perplexity in the millions, while groups of 64 gave about 29. Why?
- [x] a few large weights set the scale, so most weights round to zero; groups confine each outlier's effect
- [ ] int4 cannot represent negative numbers
- [ ] per-tensor scales use more bits
- [ ] the model was not calibrated
> With one scale per tensor the largest magnitude sets the step size, and the bulk of small weights falls into the zero bin. Symmetric int4 does represent negatives; per-tensor scales use fewer bits, not more; and round-to-nearest needs no calibration.

? Weight-only int4 quantisation mainly speeds up:
- [ ] prefill of long prompts, because it reduces FLOPs
- [ ] both prefill and decode equally
- [x] decode at small batch, because it reduces the bytes read per step
- [ ] neither: it only saves memory
> A supported weight-only kernel reduces stored-weight traffic and usually dequantises before floating-point multiplication. It does not by itself reduce the operation count or guarantee a compute-bound prefill gain. Metadata and mixed formats qualify the nominal fourfold byte saving.

? In speculative sampling the draft model is poor (acceptance rate 0.3). The output distribution is:
- [ ] a mixture of the target and draft distributions weighted by the acceptance rate
- [ ] the draft's
- [ ] the target's only under greedy decoding
- [x] The target’s, under the acceptance/residual algorithm; acceleration may be poor or negative
> Accepted overlap plus residual mass restores p at every conditional position. Correct sampler distributions and cache rollback are required; a poor draft can make the correct algorithm slower.

? With independent acceptance probability 0.8 and draft length four, what is the untruncated expected output per speculative iteration?
- [ ] 3.2
- [x] 3.36
- [ ] 4.0
- [ ] 5.0
> (1 − 0.8⁵)/(1 − 0.8) = 3.36. 3.2 = γα ignores the truncation at the first rejection and the extra token every iteration yields; 4 assumes every draft is accepted with no extra token; 5 assumes all are accepted plus the bonus token every time.

? SmoothQuant makes int8 activation quantisation work by:
- [x] dividing each activation channel by s_j and multiplying the matching weight row by s_j, which leaves XW unchanged and moves range from activations to weights
- [ ] clipping activation outliers to a percentile
- [ ] keeping the outlier channels in fp16
- [ ] retraining the model with quantisation in the loop
> The compensating scales preserve the unrounded product. Rounding still introduces error; folding scales into preceding operations must preserve all consumers. Mixed outlier decomposition and clipping are different mechanisms.

? At moderate load your p50 TTFT is 0.4 s but p99 is 9 s, while TPOT is normal. The most plausible cause and remedy are:
- [ ] too little bandwidth; buy a faster GPU
- [ ] the 8-bit KV cache
- [x] requests queueing behind long prefills near the knee; chunked prefill, admission control or more capacity
- [ ] the temperature is too high
> Queueing and long prefills are plausible causes of the TTFT tail. Inspect arrivals, queue depth and ITL before choosing a remedy; normal average TPOT does not categorically rule out other resource problems.

? A server completes 0.33 requests/s, and each request spends 55 s in the system on average. By Little's law the average number of requests in the system is:
- [ ] About 0.006
- [x] About 18
- [ ] About 55
- [ ] About 167
> L = λW = 0.33 × 55 ≈ 18, the case study's cache limit on the 24 GB card. 167 = W/λ and 0.006 = λ/W divide instead of multiplying; 55 ignores the arrival rate.

```

## Guided reading {#reading}

Three fifteen-minute readings connect the module's calculations to the original
methods. Read actively: draw the allocation or probability mechanism and state
which experimental assumptions would have to hold in your own deployment.

::: paper minutes=15

Kwon, W. et al. [“Efficient memory management for large language model serving
with PagedAttention.”](https://arxiv.org/abs/2309.06180) *SOSP*, 2023.

**Why read it.** It connects unpredictable sequence lengths to allocator waste
and shows how the attention kernel and cache manager must cooperate. Keep the
distinction between its measured throughput gain and a theoretical count of
contexts that fit in memory.

**What to read.** Read the introduction, memory challenges, block-table method,
sharing/copy-on-write and scheduling/preemption. Skim the first evaluation
comparisons. Leave distributed execution and detailed ablations for a later pass.

**Questions to answer while reading.**

1. Which measured memory was actually holding token states, and which reservation,
   tail and external-fragmentation wastes accounted for the rest?
2. Draw a 70-token request with 16-token blocks. Explain the five blocks and ten
   empty tail slots without confusing physical blocks with logical positions.
3. Four continuations share a 1,000-token prompt. Count full shared blocks and
   private copies of the partly filled final block: why are 66 prompt-containing
   blocks sufficient instead of 252 separate blocks?
4. What must happen when a continuation writes into a shared block? What are the
   preemption alternatives, and what transfer/compute costs choose between them?

:::

::: paper minutes=15

Lin, J. et al. [“AWQ: Activation-aware weight quantization for LLM compression
and acceleration.”](https://arxiv.org/abs/2306.00978) *MLSys*, 2024.

**Why read it.** The scaling argument makes the distinction between weight
magnitude and activation saliency concrete. It gives a way to reason about a
calibrated method beyond choosing more bits or smaller groups.

**What to read.** Read the introduction, salient-channel comparison and method's
scaling/error argument. Skim the perplexity results with their model sizes and
group configurations. Skip the deployment-system optimisations on this pass.

**Questions to answer while reading.**

1. Why does activation magnitude identify consequential channels differently
   from weight magnitude? Which comparison in the paper tests that choice?
2. Derive the effective rounding-error reduction when a weight channel is scaled
   by a factor greater than one, assuming the group's quantisation step stays
   fixed. Why can increasing the factor invalidate that assumption?
3. What scale family is searched, what calibration objective selects it and
   which model-training operations are unnecessary?
4. How does AWQ's weight-only scaling goal differ from SmoothQuant's migration
   of activation range? Explain why a good perplexity table still leaves a
   domain-specific promotion test to perform.

:::

::: paper minutes=15

Leviathan, Y., Kalman, M., Matias, Y. [“Fast inference from transformers via
speculative decoding.”](https://arxiv.org/abs/2211.17192) *ICML*, 2023.

**Why read it.** Its probability proof separates preserving a target distribution
from obtaining a speed-up. Read the walltime assumptions as carefully as the
acceptance algorithm, then compare them with the measured CPU costs in Lab 5.

**What to read.** Read the speculative-sampling method, expected-token and
walltime analyses, the appendix correctness proof and Section 4.2's draft
acceptance comparisons. Skim Table 2. Save arithmetic-work accounting for later.

**Questions to answer while reading.**

1. Express the paper's distributional divergence as total variation. Reconstruct
   the accepted overlap and the rejection contribution without using a slogan
   such as “verification fixes mistakes”.
2. Which assumption produces a geometric expected-token sum? Which finite-length
   and conditional-acceptance effects in Lab 5 can shift the measurement?
3. When does scoring several target positions cost more than one target step?
   Put Lab 5's measured verification ratio into the denominator of the formula.
4. Section 4.2's negligible-cost bigram draft has acceptance near 0.2. Explain
   its limiting gain of about 1.25 even with long proposals, then explain why
   Table 2's small transformer can do better despite costing more to run.

:::

## Summary {#summary}

- Prefill processes prompt positions together; decode follows token dependencies and usually pays repeated weight traffic.
- Arithmetic intensity and a compatible dense ridge point identify potential compute or bandwidth limits, while a roofline remains a ceiling under its traffic assumptions.
- Full-context KV storage is twice layers times KV heads times head dimension times bytes per value times token positions and sequences.
- Batching shares weight reads; unrelated caches still grow and are read separately, so aggregate gains flatten and individual streams can slow.
- Continuous scheduling refills finished slots, while chunked prefill bounds new-prompt interference and admission rules determine growth pressure.
- Paging reduces reservation and fragmentation waste; stable-prefix reuse avoids old computation without removing the prefix from attention.
- Quantised storage includes scales, zero-points and mixed-precision tensors; fake quantisation measures error without demonstrating low-bit performance.
- Calibrated quantisation redistributes or compensates errors, and the exact converted artifact needs held-out task evaluation before promotion.
- Speculative acceptance plus residual sampling preserves the target distribution; speed-up depends on acceptance, draft cost, verification and load.
- Grammar masks constrain supported syntax prefixes, while final completeness and factual/domain validity need separate checks.
- SLO-constrained capacity, client-visible latency, realised arrivals and paid utilisation determine useful throughput and cost.
- Complete artifact provenance, exercised recovery paths, metering and reproducibility tests make a serving change reviewable and reversible.

This completes the ten-module AI series. Return to the [English index](index.html)
to revisit a dependency, or continue with the [AI Agents series](../agent/index.html)
for clients, tools and application evaluation. A useful final project is to carry
one held-out task from model selection through adaptation, quantised-artifact
evaluation and an explicitly measured serving objective.

## References {#refs}

- Pope, R. et al. [“Efficiently scaling transformer inference.”](https://arxiv.org/abs/2211.05102) *MLSys*, 2023.
- Williams, S., Waterman, A., Patterson, D. [“Roofline: an insightful visual performance model for multicore architectures.”](https://doi.org/10.1145/1498765.1498785) *Communications of the ACM*, 2009.
- Kaplan, J. et al. [“Scaling laws for neural language models.”](https://arxiv.org/abs/2001.08361) 2020. Forward-operation conventions.
- Kwon, W. et al. [“Efficient memory management for large language model serving with PagedAttention.”](https://arxiv.org/abs/2309.06180) *SOSP*, 2023.
- Yu, G.-I. et al. [“Orca: A distributed serving system for transformer-based generative models.”](https://www.usenix.org/conference/osdi22/presentation/yu) *OSDI*, 2022.
- Agrawal, A. et al. [“Taming throughput-latency tradeoff in LLM inference with Sarathi-Serve.”](https://www.usenix.org/conference/osdi24/presentation/agrawal) *OSDI*, 2024.
- Zhong, Y. et al. [“DistServe: Disaggregating prefill and decoding for goodput-optimized large language model serving.”](https://arxiv.org/abs/2401.09670) *OSDI*, 2024.
- Patel, P. et al. [“Splitwise: Efficient generative LLM inference using phase splitting.”](https://arxiv.org/abs/2311.18677) *ISCA*, 2024.
- Zheng, L. et al. [“SGLang: Efficient execution of structured language model programs.”](https://arxiv.org/abs/2312.07104) *NeurIPS*, 2024.
- Shazeer, N. [“Fast transformer decoding: One write-head is all you need.”](https://arxiv.org/abs/1911.02150) 2019.
- Ainslie, J. et al. [“GQA: Training generalized multi-query transformer models from multi-head checkpoints.”](https://arxiv.org/abs/2305.13245) *EMNLP*, 2023.
- DeepSeek-AI. [“DeepSeek-V2: A strong, economical, and efficient mixture-of-experts language model.”](https://arxiv.org/abs/2405.04434) 2024.
- Jiang, A. Q. et al. [“Mistral 7B.”](https://arxiv.org/abs/2310.06825) 2023.
- Jiang, A. Q. et al. [“Mixtral of experts.”](https://arxiv.org/abs/2401.04088) 2024.
- Dettmers, T. et al. [“LLM.int8(): 8-bit matrix multiplication for transformers at scale.”](https://arxiv.org/abs/2208.07339) *NeurIPS*, 2022.
- Xiao, G. et al. [“SmoothQuant: Accurate and efficient post-training quantization for large language models.”](https://arxiv.org/abs/2211.10438) *ICML*, 2023.
- Frantar, E. et al. [“GPTQ: Accurate post-training quantization for generative pre-trained transformers.”](https://arxiv.org/abs/2210.17323) *ICLR*, 2023.
- Lin, J. et al. [“AWQ: Activation-aware weight quantization for LLM compression and acceleration.”](https://arxiv.org/abs/2306.00978) *MLSys*, 2024.
- Liu, Z. et al. [“KIVI: A tuning-free asymmetric 2bit quantization for KV cache.”](https://arxiv.org/abs/2402.02750) *ICML*, 2024.
- Micikevicius, P. et al. [“FP8 formats for deep learning.”](https://arxiv.org/abs/2209.05433) 2022.
- Open Compute Project. [“OCP microscaling formats (MX) specification v1.0.”](https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf) 2023.
- Leviathan, Y., Kalman, M., Matias, Y. [“Fast inference from transformers via speculative decoding.”](https://arxiv.org/abs/2211.17192) *ICML*, 2023.
- Chen, C. et al. [“Accelerating large language model decoding with speculative sampling.”](https://arxiv.org/abs/2302.01318) 2023.
- Cai, T. et al. [“Medusa: Simple LLM inference acceleration framework with multiple decoding heads.”](https://arxiv.org/abs/2401.10774) *ICML*, 2024.
- Li, Y. et al. [“EAGLE: Speculative sampling requires rethinking feature uncertainty.”](https://arxiv.org/abs/2401.15077) *ICML*, 2024.
- Fu, Y. et al. [“Break the sequential dependency of LLM inference using lookahead decoding.”](https://arxiv.org/abs/2402.02057) *ICML*, 2024.
- Saxena, A. [“Prompt lookup decoding.”](https://github.com/apoorvumang/prompt-lookup-decoding) 2023.
- Willard, B. T., Louf, R. [“Efficient guided generation for large language models.”](https://arxiv.org/abs/2307.09702) 2023.
- Dean, J., Barroso, L. A. [“The tail at scale.”](https://research.google/pubs/the-tail-at-scale/) *Communications of the ACM*, 2013.
- Little, J. D. C. [“A proof for the queuing formula: L = λW.”](https://doi.org/10.1287/opre.9.3.383) *Operations Research*, 1961.
- Model configurations: [Llama-2-7B](https://huggingface.co/meta-llama/Llama-2-7b-hf/blob/main/config.json), [Llama-3.1-8B](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B/blob/main/config.json), [Mistral-7B-v0.1](https://huggingface.co/mistralai/Mistral-7B-v0.1/blob/main/config.json), [Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B/blob/main/config.json), [Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/config.json), [SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M/tree/93efa2f097d58c2a74874c7e644dbc9b0cee75a2), [SmolLM2-360M](https://huggingface.co/HuggingFaceTB/SmolLM2-360M/tree/f8027fd0eaeea54caa13c31d31b9fdc459c38b49).
- Hardware primary sources: [H100](https://www.nvidia.com/en-us/data-center/h100/), [A100](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf), [L40S](https://www.nvidia.com/en-us/data-center/l40s/), [L4](https://www.nvidia.com/en-us/data-center/l4/), [Ada architecture](https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf), [M2 Ultra](https://www.apple.com/newsroom/2023/06/apple-introduces-m2-ultra/). Specifications checked 5 October 2026; prices and efficiency fractions remain explicitly assumed.
