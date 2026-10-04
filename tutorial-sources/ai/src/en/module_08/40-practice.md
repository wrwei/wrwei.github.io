## Self-check quiz {#quiz}

Choose one answer per question. Review the explanation after committing
to an answer; the wrong options represent different accounting mistakes.

```quiz
? A 2B-parameter dense model is trained on 100B tokens. About how many training FLOPs is that?
- [x] 1.2 x 10^21
- [ ] 4 x 10^20
- [ ] 2.4 x 10^21
- [ ] 1.2 x 10^20
> C ≈ 6ND = 6 x 2 x 10^9 x 10^11 = 1.2 x 10^21 by the shortcut (the series' rule, without the input embedding and with attention, moves it by a few percent). 4 x 10^20 is 2ND, the forward pass only; 2.4 x 10^21 doubles the count; 1.2 x 10^20 drops a factor of ten.

? In bf16 mixed precision with Adam and fp32 master weights, how many bytes of model state does each parameter need before activations?
- [x] 16
- [ ] 8
- [ ] 12
- [ ] 4
> 2 (bf16 weights) + 2 (bf16 gradients) + 4 (fp32 master) + 4 + 4 (Adam moments) = 16. 12 is the optimiser part alone (master weights and moments); 4 and 8 count only weights and gradients in fp32 or bf16.

? Why do LLM pretraining recipes set Adam's beta2 to 0.95 rather than the default 0.999?
- [x] The second-moment estimate adapts within about 20 steps to a change in gradient scale, avoiding oversized steps
- [ ] It reduces optimiser memory
- [ ] It makes Adam equivalent to SGD with momentum
- [ ] It makes warmup unnecessary
> 1/(1 - beta2) is the memory of the second-moment average: 20 steps at 0.95 against 1,000 at 0.999, so a sudden rise in gradient scale is matched quickly. Memory is unchanged; Adam remains adaptive; warmup is still used.

? MinHash with k = 128 hash functions estimates a pair's Jaccard similarity of 0.8. What is the standard error of the estimate?
- [x] About 0.035
- [ ] About 0.071
- [ ] About 0.16
- [ ] About 0.8/128 = 0.0063
> Each hash agrees with probability J, so the estimate is a mean of 128 Bernoulli variables: SE = sqrt(J(1 - J)/k) = sqrt(0.16/128) = 0.035. 0.071 is about two standard errors; 0.16 is the variance of one hash, not the error of the mean; 0.0063 divides by k without the square root.

? With LSH banding of b = 16 bands and r = 8 rows, about how likely is a pair with Jaccard similarity 0.5 to become a candidate?
- [x] 6%
- [ ] 50%
- [ ] 0.4%
- [ ] 94%
> P = 1 - (1 - 0.5^8)^16 = 1 - (0.9961)^16 = 0.061. 0.4% is one band's probability 0.5^8; 50% confuses it with s; 94% is the probability at s = 0.8.

? Under ZeRO stage 2 with N parameters on N_d GPUs (16 bytes per parameter in total), how much model-state memory does each GPU hold?
- [x] 2N + 14N/N_d
- [ ] 4N + 12N/N_d
- [ ] 16N/N_d
- [ ] 16N
> Stage 2 shards gradients (2 bytes) and optimiser states (12 bytes) and keeps the bf16 weights (2 bytes) whole. 4N + 12N/N_d is stage 1, 16N/N_d stage 3, 16N plain data parallelism.

? A GPipe pipeline has p = 4 stages and m = 12 micro-batches. What fraction of the time is each stage idle?
- [x] 20%
- [ ] 25%
- [ ] 33%
- [ ] 8%
> Idle fraction (p - 1)/(m + p - 1) = 3/15 = 20%. 25% is (p - 1)/m, the bubble relative to ideal compute rather than to total time; 33% and 8% come from other mistaken formulas.

? Which statement about bf16 and fp16 is correct?
- [x] bf16 has fp32's exponent width and fewer mantissa bits than fp16; typical bf16 recipes avoid fp16-style loss scaling
- [ ] bf16 has more mantissa bits than fp16, so it is more precise
- [ ] fp16 has a larger range than bf16
- [ ] Both need dynamic loss scaling to train LLMs
> bf16 uses 1/8/7 sign/exponent/fraction bits, fp16 1/5/10. Its wider exponent range reduces the underflow problem that motivates fp16 loss scaling. Extremely small bf16 values can still underflow, and the formats differ in subnormal limits.

? Full activation checkpointing (store each layer's input, recompute the layer in the backward pass) raises training compute by about how much?
- [x] One third
- [ ] Double
- [ ] 5%
- [ ] Nothing; it only moves memory
> The forward pass, 2N of the 6N FLOPs per token, is repeated: 8N/6N = 1.33. Recomputing does cost compute, and only the forward pass is repeated, not the backward.

? Why is tensor parallelism normally confined to the GPUs of one node?
- [x] It all-reduces activations in every layer, which needs the bandwidth of intra-node links
- [ ] It cannot be combined with data parallelism
- [ ] It changes the model's mathematics
- [ ] It requires pipeline parallelism
> Megatron-style TP needs two all-reduces per layer forward and two backward; for the case study at TP = 2 that is 9.7 GB per micro-batch, 21 ms over NVLink but 0.19 s over InfiniBand. It composes with DP and PP and computes the same function.

? A continued-pretraining run on domain text only raises the general held-out loss sharply. What should you change first?
- [x] Mix in general replay data and lower the peak learning rate
- [ ] Raise the learning rate to finish sooner
- [ ] Train longer on the domain text
- [ ] Remove the warmup
> General replay supplies retention gradients, while a lower peak limits movement from the base. Evaluate both distributions and the task gate again; neither change guarantees retention of every capability.

? On a 500-item benchmark, checkpoint A scores 41% and checkpoint B 44%. What can you conclude?
- [x] The aggregate scores alone do not resolve the paired difference
- [ ] B is better
- [ ] A is better because it is earlier
- [ ] Nothing can ever be concluded from benchmarks
> Each score has an individual standard error near 2.2 points, but significance of their difference depends on which questions changed. Keep per-item outcomes and use a paired interval or test. The two marginal percentages alone cannot establish whether a three-point gain is stable.

```

## Guided reading {#reading}

Read for the experimental comparison and accounting assumptions. Reproduce
one result or calculation before accepting the proposed recipe.

::: paper minutes=20
[Penedo, G., Kydlíček, H., Ben Allal, L., Lozhkov, A., Mitchell, M., Raffel, C., von Werra, L., Wolf, T. "The FineWeb datasets: Decanting the web for the finest text data at scale." NeurIPS Datasets and Benchmarks Track, 2024.](https://arxiv.org/abs/2406.17557)

**Why read it.** A documented web-data pipeline with ablations of filtering and deduplication, including decisions whose first version did not improve the resulting model.

**What to read.** Read the introduction, the sections on text extraction, base filtering, deduplication (including the per-snapshot finding) and the FineWeb-Edu annotation and classifier. Skim the custom heuristic filters and the comparison with other datasets. Skip the appendices.

**Questions to answer while reading.**

1. Why did the authors extract text from WARC files with trafilatura instead of using the WET text, and how did they show that it mattered?
2. What went wrong when they deduplicated across all crawl snapshots at once, and what did they do instead? Why might global deduplication favour older, lower-quality text?
3. How was the educational-quality classifier built (annotator, scale, number of annotated samples, model) and what threshold produced FineWeb-Edu?
4. What size of model and how many tokens did they use for their data ablations, and what does that imply about how data decisions are tested?
:::

::: paper minutes=15
[Rajbhandari, S., Rasley, J., Ruwase, O., He, Y. "ZeRO: Memory optimizations toward training trillion parameter models." SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, 2020.](https://arxiv.org/abs/1910.02054)

**Why read it.** The source of the 16-bytes-per-parameter accounting and of the three sharding stages that s8 and s9 derive and that FSDP implements.

**What to read.** Read the introduction with its memory figure, the analysis of where the memory goes (model states and residual states), the description of the three ZeRO-DP stages, and the communication analysis. Skim ZeRO-R. Skip the implementation and evaluation sections.

**Questions to answer while reading.**

1. Reproduce the paper's per-GPU memory for a 7.5B-parameter model on 64 GPUs under the baseline and the three stages (120, 31.4, 16.6 and 1.9 GB).
2. Why does sharding the parameters cost only 1.5 times data parallelism's communication rather than more?
3. What are 'residual states', and which techniques in this module address each of them?
:::

::: paper minutes=15
[Wortsman, M. et al. "Small-scale proxies for large-scale Transformer training instabilities." ICLR, 2024 (arXiv 2023).](https://arxiv.org/abs/2309.14322)

**Why read it.** Shows that the instabilities of large runs can be reproduced and fixed in small models at high learning rates: the method Lab 3 copies, and the evidence behind QK-norm, z-loss and the AdamW epsilon advice.

**What to read.** Read the introduction, the sections on attention-logit growth with qk-layernorm and on output-logit divergence with z-loss, and the definition of learning-rate sensitivity. Skim the section on other interventions (warmup, independent weight decay, muParam, the AdamW epsilon). Skip the appendices.

**Questions to answer while reading.**

1. What is learning-rate sensitivity and why is it a more useful summary than the best loss achieved?
2. What evidence links attention-logit growth to divergence, and how does qk-layernorm change the sensitivity curve? Compare with what Lab 3 measured.
3. Why does z-loss fix output-logit divergence, and what happens to the logits without it?
4. What do the authors find about AdamW's epsilon as models grow, and what do they recommend?
:::

## Summary {#summary}

- Fix tokenizer, shape, data policy and run horizon before paying for the main run; record every later phase change.
- Training compute includes the matrix weights and context-dependent attention; use the same convention when planning tokens, time and MFU.
- Data cleaning is a policy with false positives, and every removed document should have an auditable reason.
- Exact fingerprints, MinHash-LSH candidate generation and exact overlap verification answer different duplicate questions.
- Mixture weights determine source exposure; repeated tokens supply diminishing new information and can encourage memorisation.
- Packing saves padding but requires a deliberate policy on EOS boundaries, document attention and validation splits.
- Learning-rate schedules, batch size and optimiser moments affect the trajectory, so monitor the rate and pre-clipping gradients actually used.
- Diagnose attention-logit growth and output-logit drift separately; clipping, QK norms and z-loss act on different quantities.
- Count model states, saved activations, logits and runtime allowances before selecting sharding, checkpointing or parallelism.
- Checkpoints must restore optimiser and sampler state for resumption, and only fully written checkpoints are recoverable.
- Evaluate fixed held-out distributions and paired task outcomes; a lower training loss or a small aggregate benchmark gain alone is insufficient.
- Continued pretraining trades domain adaptation against retention, and its acceptance gate must be declared before inspecting the results.

The kept base checkpoint is a distribution modeller. [Module 09](module_09_EN.html)
turns it towards instructed behaviour through supervised fine-tuning and preference
training. The case-study team carries forward its continued-pretraining checkpoint
only if the domain and general gates pass; otherwise it keeps the released checkpoint.

## References {#refs}

- Hoffmann, J. et al. "Training compute-optimal large language models." NeurIPS, 2022. Chinchilla: the L(N, D) fit and the 20-tokens-per-parameter rule used in s1.
- Kaplan, J. et al. "Scaling laws for neural language models." arXiv, 2020. The 6N-per-token approximation and the insensitivity of loss to model shape at fixed N.
- Besiroglu, T., Erdil, E., Barnett, M., You, J. "Chinchilla scaling: A replication attempt." arXiv, 2024. Re-analysis of the Chinchilla parametric fit.
- Rae, J. W. et al. "Scaling language models: Methods, analysis and insights from training Gopher." arXiv, 2021. The Gopher quality and repetition filters.
- Raffel, C. et al. "Exploring the limits of transfer learning with a unified text-to-text transformer." JMLR, 2020. C4 and its line-level cleaning rules.
- Dodge, J. et al. "Documenting large webtext corpora: A case study on the Colossal Clean Crawled Corpus." EMNLP, 2021. What C4's blocklist removed, and from whom.
- Penedo, G. et al. "The FineWeb datasets: Decanting the web for the finest text data at scale." NeurIPS Datasets and Benchmarks Track, 2024. A documented public web pipeline and FineWeb-Edu.
- Li, J. et al. "DataComp-LM: In search of the next generation of training sets for language models." NeurIPS Datasets and Benchmarks Track, 2024. DCLM and its fastText quality classifier.
- Barbaresi, A. "Trafilatura: A web scraping library and command-line tool for text discovery and extraction." ACL System Demonstrations, 2021. Boilerplate removal.
- Joulin, A., Grave, E., Bojanowski, P., Mikolov, T. "Bag of tricks for efficient text classification." EACL, 2017. fastText, the basis of common language-identification models.
- Broder, A. Z. "On the resemblance and containment of documents." Compression and Complexity of Sequences, 1997. MinHash.
- Leskovec, J., Rajaraman, A., Ullman, J. D. Mining of Massive Datasets, Chapter 3. Cambridge University Press. Shingling, MinHash and LSH banding with the S-curve.
- Lee, K. et al. "Deduplicating training data makes language models better." ACL, 2022.
- Hernandez, D. et al. "Scaling laws and interpretability of learning from repeated data." arXiv, 2022. The cost of a small fraction of heavily repeated data.
- Brown, T. et al. "Language models are few-shot learners." NeurIPS, 2020. GPT-3; 13-gram decontamination.
- Muennighoff, N. et al. "Scaling data-constrained language models." NeurIPS, 2023. How much repeated data is worth.
- Xie, S. M. et al. "DoReMi: Optimizing data mixtures speeds up language model pretraining." NeurIPS, 2023. Learned mixture weights.
- Xue, L. et al. "mT5: A massively multilingual pre-trained text-to-text transformer." NAACL, 2021. Temperature sampling of languages.
- Ding, H. et al. "Fewer truncations improve language modeling." ICML, 2024. Best-fit packing.
- Eldan, R., Li, Y. "TinyStories: How small can language models be and still speak coherent English?" arXiv, 2023. The dataset of Labs 1, 2, 3 and 5.
- Touvron, H. et al. "Llama 2: Open foundation and fine-tuned chat models." arXiv, 2023. A published recipe: learning rates, schedule, batch, clipping.
- Grattafiori, A. et al. "The Llama 3 herd of models." arXiv, 2024. Annealing, context extension, document masking and interruption statistics at scale.
- Chowdhery, A. et al. "PaLM: Scaling language modeling with Pathways." JMLR, 2023. Rewind-and-skip for loss spikes; the MFU definition.
- Fedus, W., Zoph, B., Shazeer, N. "Switch Transformers: Scaling to trillion parameter models with simple and efficient sparsity." JMLR, 2022. Load-balancing loss and capacity factor.
- Lepikhin, D. et al. "GShard: Scaling giant models with conditional computation and automatic sharding." ICLR, 2021. Expert parallelism.
- Jiang, A. Q. et al. "Mixtral of experts." arXiv, 2024.
- Dai, D. et al. "DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models." ACL, 2024. Fine-grained and shared experts.
- DeepSeek-AI. "DeepSeek-V3 technical report." arXiv, 2024. Auxiliary-loss-free load balancing; FP8 training with fine-grained scaling.
- DeepSeek-AI. "DeepSeek LLM: Scaling open-source language models with longtermism." arXiv, 2024. Fitted scaling of learning rate and batch size with compute.
- Yang, G. et al. "Tensor Programs V: Tuning large neural networks via zero-shot hyperparameter transfer." NeurIPS, 2021. muP.
- Loshchilov, I., Hutter, F. "Decoupled weight decay regularization." ICLR, 2019. AdamW.
- McCandlish, S., Kaplan, J., Amodei, D. et al. "An empirical model of large-batch training." arXiv, 2018. The gradient noise scale and the critical batch size.
- Hägele, A. et al. "Scaling laws and compute-optimal training beyond fixed training durations." NeurIPS, 2024. Warmup-stable-decay against cosine.
- Hu, S. et al. "MiniCPM: Unveiling the potential of small language models with scalable training strategies." arXiv, 2024. The WSD schedule.
- Micikevicius, P. et al. "Mixed precision training." ICLR, 2018. Loss scaling and fp32 master weights.
- Micikevicius, P. et al. "FP8 formats for deep learning." arXiv, 2022. E4M3 and E5M2.
- Dehghani, M. et al. "Scaling vision transformers to 22 billion parameters." ICML, 2023. QK normalisation against attention-logit growth.
- Wortsman, M. et al. "Small-scale proxies for large-scale Transformer training instabilities." ICLR, 2024. Instabilities reproduced at small scale; QK-norm, z-loss, AdamW epsilon.
- Chen, T., Xu, B., Zhang, C., Guestrin, C. "Training deep nets with sublinear memory cost." arXiv, 2016. Activation (gradient) checkpointing.
- Korthikanti, V. et al. "Reducing activation recomputation in large transformer models." MLSys, 2023. The activation-memory count, sequence parallelism, selective recomputation.
- Dao, T. et al. "FlashAttention: Fast and memory-efficient exact attention with IO-awareness." NeurIPS, 2022.
- Rajbhandari, S., Rasley, J., Ruwase, O., He, Y. "ZeRO: Memory optimizations toward training trillion parameter models." SC, 2020.
- Zhao, Y. et al. "PyTorch FSDP: Experiences on scaling fully sharded data parallel." VLDB, 2023.
- Shoeybi, M. et al. "Megatron-LM: Training multi-billion parameter language models using model parallelism." arXiv, 2019. Tensor parallelism.
- Narayanan, D. et al. "Efficient large-scale language model training on GPU clusters using Megatron-LM." SC, 2021. Interleaved pipeline schedules and 3D parallelism.
- Huang, Y. et al. "GPipe: Efficient training of giant neural networks using pipeline parallelism." NeurIPS, 2019.
- Liu, H., Zaharia, M., Abbeel, P. "Ring attention with blockwise transformers for near-infinite context." ICLR, 2024. Context parallelism.
- Jacobs, S. A. et al. "DeepSpeed Ulysses: System optimizations for enabling training of extreme long sequence Transformer models." arXiv, 2023.
- Young, J. W. "A first order approximation to the optimum checkpoint interval." Communications of the ACM, 1974.
- Dixit, H. D. et al. "Silent data corruptions at scale." arXiv, 2021.
- Chen, S. et al. "Extending context window of large language models via positional interpolation." arXiv, 2023.
- Peng, B. et al. "YaRN: Efficient context window extension of large language models." ICLR, 2024.
- Gururangan, S. et al. "Don't stop pretraining: Adapt language models to domains and tasks." ACL, 2020. Domain- and task-adaptive continued pretraining.
- Gupta, K. et al. "Continual pre-training of large language models: How to (re)warm your model?" arXiv, 2023.
- Ibrahim, A. et al. "Simple and scalable strategies to continually pre-train large language models." TMLR, 2024. Re-warming, re-decaying and replay.
