## Self-check quiz {#quiz}

Choose one answer for each question. These questions use the conventions and measurements in this module.

```quiz
? A model gives the four actual next tokens of a sentence probabilities 0.50, 0.25, 0.125 and 0.80. What is its perplexity on the sentence?
- [ ] 0.42
- [x] 3.0
- [ ] 4.4
- [ ] 1.1
> The mean negative log-likelihood is (0.693 + 1.386 + 2.079 + 0.223)/4 = 1.095 nats, and e^1.095 = 2.99. 0.42 is the arithmetic mean of the probabilities, 4.4 the summed loss in nats, and 1.1 the mean loss itself rather than its exponential.

? Why does byte-level BPE never need an unknown token?
- [ ] Its vocabulary contains every word of its training corpus
- [ ] It lower-cases text and strips accents before encoding
- [ ] It falls back to whole words when no merge applies
- [x] Its base vocabulary is the 256 byte values, so any UTF-8 string can be written with them
> Every string is a sequence of bytes and every byte is a base token, so the worst case is one token per byte. A word vocabulary cannot cover unseen words; normalising text and whole-word fallback are not how BPE works.

? SmolLM2-135M has a per-token perplexity of 25.8 on an English paragraph and 8.4 on its Chinese translation; in bits per byte, 0.90 and 1.88. What follows?
- [ ] The model predicts Chinese better than English
- [ ] Chinese text has lower entropy than English text
- [x] Per-token loss depends on token size; the model pays more bits per byte on this Chinese translation despite lower token perplexity
- [ ] Bits per byte is undefined for multi-byte characters
> Smaller token pieces can be easy to predict while requiring more predictions. The measured coding costs are 1.88 and 0.90 bits per UTF-8 byte. This is a comparison on these texts, not a general ranking of language ability or source entropy.

? With the published Chinchilla exponents α = 0.34 and β = 0.28, by what factor should the parameter count grow when the compute budget grows tenfold?
- [x] 2.8 times
- [ ] 3.2 times
- [ ] 5.4 times
- [ ] 10 times
> N_opt ∝ C^a with a = β/(α+β) = 0.452, and 10^0.452 = 2.83. 3.2 is √10, the answer for a = 0.5 (Approaches 1 and 2); 5.4 is Kaplan's 10^0.73; 10 would put all the extra compute into parameters.

? Why might a team train an 8B model on 15T tokens, far beyond 20 tokens per parameter?
- [ ] The Chinchilla result has been shown to be wrong
- [ ] More tokens shrink the parameter term A/N^α
- [ ] Small models cannot be trained at the compute-optimal ratio
- [x] Serving cost over the model's life favours a smaller model trained longer for the same loss
> Compute-optimal minimises training FLOPs only. Counting 2N FLOPs per served token, a smaller model trained on more data reaches a given loss at lower lifetime cost once enough tokens are served. More data shrinks the data term, not the parameter term; Chinchilla's result stands as a statement about training compute.

? Which statement about the temperature τ is true?
- [ ] Lowering τ can change which token is most probable
- [x] The entropy of softmax(z/τ) never decreases as τ grows; its derivative is Var_p(z)/τ³
- [ ] τ = 1 is greedy decoding
- [ ] transformers applies the temperature after top-p
> Dividing the logits by τ > 0 preserves their order, so the argmax never changes; dH/dτ = Var_p(z)/τ³ ≥ 0. τ → 0 is greedy and τ = 1 is the model's own distribution; transformers applies the temperature before top-k, top-p and min-p.

? For preset B (safe 0.849, secure 0.036, robust 0.029, reliable 0.022, ...), which setting keeps exactly one token?
- [ ] top-k = 3
- [ ] top-p = 0.9
- [x] min-p = 0.1
- [ ] temperature 1.5 with no truncation
> Min-p keeps tokens with p ≥ 0.1 × 0.849 = 0.0849, and only 'safe' qualifies. Top-k = 3 keeps three tokens; top-p = 0.9 needs safe, secure and robust to reach 0.914; temperature alone removes nothing.

? A model returns different completions for identical requests with sampling disabled. Which mechanism can explain this without random token selection?
- [x] Kernels whose reduction order depends on the batch the request lands in, so the logits change in their last digits and near-ties flip
- [ ] The provider silently samples at temperature 1
- [ ] The tokenizer is non-deterministic
- [ ] Random seeds are ignored at temperature 0
> Batch-dependent reduction order can change floating-point logits enough to flip a nearly tied argmax. Once a token changes, later context changes too. This is a possible mechanism; the observation alone does not identify the cause. Token sampling draws no random numbers in greedy decoding.

? For the case-study model (36 layers, 8 KV heads of dimension 128, bf16), how much KV-cache memory does one 32,000-token sequence need?
- [ ] 0.6 GB
- [ ] 1.2 GB
- [ ] 19 GB
- [x] 4.7 GB
> 2 (keys and values) × 36 × 8 × 128 × 2 bytes = 147,456 bytes per token, × 32,000 = 4.7 GB. 0.6 GB is the cache at 4,096 tokens; 1.2 GB forgets both factors of 2; 19 GB is the cache at about 128,000 tokens, or the bf16 weights.

? Which measure actually defends a document summariser against prompt injection?
- [ ] A system-prompt line telling the model to ignore instructions inside documents
- [x] Deciding the task and the allowed tools from the user's own request before any document text is added, and letting no model output trigger a privileged action without validation and approval
- [ ] Setting the temperature to 0
- [ ] Using a larger model
> Injection works because instructions and data share one token stream; only a boundary enforced outside the model holds. A system-prompt warning can be outweighed by the injected text; temperature and model size do not separate instructions from data.

? On GSM8K's 1,319 problems model A solves 943 (71.5%) and model B 903 (68.5%). Each 95% interval is about ±2.5 points, so the two intervals overlap. The models disagree on 120 problems: A alone solves 80 and B alone 40. Which conclusion is right?
- [ ] Not established: the intervals overlap
- [x] A is better: McNemar's χ² = (80 − 40)²/120 = 13.3, far above 3.84 (p ≈ 0.0003)
- [ ] B is better once variance is considered
- [ ] The comparison needs pass@k rather than accuracy
> Both models answered the same problems, so most of their sampling noise is shared, and the 1,199 problems on which they agree say nothing about which is better. The paired test uses the 120 discordant problems: 80 against 40 is very unlikely if neither model is better. Overlapping intervals are not a test of a difference (Module 01, Section 10). Nothing favours B, and pass@k is for sampled code generation, not for these accuracies.

? An evaluation scores +1 for a correct answer, −1 for a wrong one and 0 for 'I don't know'. A calibrated model should answer when its probability of being right exceeds:
- [x] 0.5
- [ ] 0
- [ ] 0.75
- [ ] 0.9
> The expected score of answering is p − (1 − p), positive when p > 0.5. Zero is the threshold when wrong answers cost nothing; 0.75 corresponds to a penalty of 3; 0.9 to a penalty of 9.

```

## Guided reading {#reading}

Read the specified portions with the lab results beside them. Separate an empirical result within the experiments from a planning rule extrapolated beyond them.

### Training compute-optimal language models {#paper1}

::: paper minutes=25
Hoffmann, J., Borgeaud, S., Mensch, A., et al. ["Training compute-optimal large language models."](https://arxiv.org/abs/2203.15556) *NeurIPS*, 2022.

**Why read it.** Compare the three estimation methods behind the compute-optimal rule with the parametric fit implemented in Lab 3.

**What to read.** Read the abstract and Sections 1 and 3, including Tables 2 and 3. Skim Section 4 and the appendix's description of the parametric optimisation.

**Questions to answer while reading.**

1. In the IsoFLOP approach, what is fixed and what is varied? How does Lab 3 imitate the measurement?
2. Do all three approaches imply the same allocation at a given budget?
3. For a 10B model in Table 3, how many tokens are proposed? Compare the ratio with the published parametric constants.
4. Recompute approximate training budgets for Chinchilla and Gopher with 6ND. Which omitted operations can explain a mismatch with their reported budgets?
5. Compare the reported exponent intervals with the [replication attempt](https://arxiv.org/abs/2404.10102). Which sources of uncertainty does a successful numerical optimiser leave unresolved?
:::

### Neural text degeneration {#paper2}

::: paper minutes=20
Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. ["The curious case of neural text degeneration."](https://arxiv.org/abs/1904.09751) *ICLR*, 2020.

**Why read it.** Connect the failures of probability maximisation and unrestricted sampling to the continuations measured in Lab 5.

**What to read.** Read the abstract and Sections 1–3 with their figures. Skim the evaluation measures for likelihood, repetition, diversity and human judgements; skip the appendices.

**Questions to answer while reading.**

1. What happens to repeated phrases under maximisation-based decoding in the paper's experiments?
2. Why can a fixed top-k be too restrictive for a flat distribution and too permissive for a peaked one?
3. How does nucleus sampling choose its support differently?
4. Which measures correspond most closely to the lab's repeated four-grams and distinct-2? What can those numbers fail to capture?
5. Why can the most probable continuation be a poor open-ended answer? Does the same conclusion require sampling for a closed-set decision?
:::

## Summary {#summary}

- A language model assigns conditional probabilities to token sequences; a low next-token loss does not certify factual correctness.
- Perplexity exponentiates mean token loss and depends on tokenisation; total bits and bits per byte help expose comparisons that token averages hide.
- BPE learns ranked merges within explicit pre-token boundaries; byte fallback guarantees UTF-8 coverage without guaranteeing good compression.
- Scaling laws describe measured trends under a particular data mixture, tokenizer, parameter convention and optimisation procedure.
- Training-compute optimality differs from lifetime optimality when serving a smaller model many times saves enough work.
- Demonstrations alter predictions through context without updating weights; their selection, order and labels belong in an evaluation report.
- Chat templates supply learned role and turn markers, with token and correctness consequences that must be tested.
- Temperature preserves logit order while changing entropy; top-k, top-p and min-p choose different, order-dependent supports.
- Greedy decoding removes random selection but does not remove numerical variation, repetition or reasoning errors.
- A context window is a capacity limit; reliable retrieval, memory requirements and task performance must be measured separately.
- Calibration and abstention require task-specific evidence, while privileged actions require an application-enforced trust boundary.
- A comparative score needs a common harness, suitable grading, contamination checks and uncertainty based on the paired test items.

[Module 08](module_08_EN.html) turns the language-modelling objective into a pretraining run: choose a compute budget, prepare and split data, train a tokenizer, control optimisation and memory, and evaluate adaptation without hiding forgetting. Keep the case-study cost assumptions visible as those choices become concrete.

## References {#refs}

- Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., Sutskever, I. "Language models are unsupervised multitask learners." OpenAI, 2019. GPT-2 and byte-level BPE.
- Brown, T. et al. ["Language models are few-shot learners."](https://arxiv.org/abs/2005.14165) NeurIPS, 2020. GPT-3; in-context learning growing with scale.
- Kaplan, J. et al. ["Scaling laws for neural language models."](https://arxiv.org/abs/2001.08361) arXiv:2001.08361, 2020. The first power laws in N, D and C.
- Hoffmann, J., Borgeaud, S., Mensch, A., et al. ["Training compute-optimal large language models."](https://arxiv.org/abs/2203.15556) NeurIPS, 2022. Chinchilla; the three approaches and the parametric law.
- Besiroglu, T., Erdil, E., Barnett, M., You, J. ["Chinchilla scaling: A replication attempt."](https://arxiv.org/abs/2404.10102) arXiv:2404.10102, 2024. Refits Approach 3; about 20 tokens per parameter.
- Pearce, T., Song, J. "Reconciling Kaplan and Chinchilla scaling laws." TMLR, 2024. Parameter counting and scale explain most of the difference.
- Porian, T., Wortsman, M., Jitsev, J., Schmidt, L., Carmon, Y. "Resolving discrepancies in compute-optimal scaling of language models." NeurIPS, 2024.
- Sardana, N., Portes, J., Doubov, S., Frankle, J. "Beyond Chinchilla-optimal: Accounting for inference in language model scaling laws." ICML, 2024. Lifetime cost and over-training.
- Muennighoff, N. et al. "Scaling data-constrained language models." NeurIPS, 2023. Repeating data for a few epochs.
- Grattafiori, A. et al. ["The Llama 3 herd of models."](https://arxiv.org/abs/2407.21783) 2024. The over-training regime in practice.
- Wei, J. et al. "Emergent abilities of large language models." TMLR, 2022.
- Schaeffer, R., Miranda, B., Koyejo, S. "Are emergent abilities of large language models a mirage?" NeurIPS, 2023. The metric critique.
- Wei, J. et al. "Chain-of-thought prompting elicits reasoning in large language models." NeurIPS, 2022.
- Kojima, T. et al. "Large language models are zero-shot reasoners." NeurIPS, 2022. 'Let's think step by step'.
- Wang, X. et al. "Self-consistency improves chain of thought reasoning in language models." ICLR, 2023.
- Olsson, C. et al. "In-context learning and induction heads." Transformer Circuits Thread, 2022.
- Xie, S. M. et al. "An explanation of in-context learning as implicit Bayesian inference." ICLR, 2022.
- Min, S. et al. "Rethinking the role of demonstrations: What makes in-context learning work?" EMNLP, 2022.
- Wei, J. et al. "Larger language models do in-context learning differently." 2023. Flipped and arbitrary labels.
- Zhao, Z., Wallace, E., Feng, S., Klein, D., Singh, S. ["Calibrate before use: Improving few-shot performance of language models."](https://arxiv.org/abs/2102.09690) ICML, 2021. Contextual calibration.
- Lu, Y. et al. "Fantastically ordered prompts and where to find them: Overcoming few-shot prompt order sensitivity." ACL, 2022.
- Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. ["The curious case of neural text degeneration."](https://arxiv.org/abs/1904.09751) ICLR, 2020. Nucleus sampling.
- Nguyen, M., Baker, A., Neo, C., Roush, A., Kirsch, A., Shwartz-Ziv, R. "Turning up the heat: Min-p sampling for creative and coherent LLM outputs." ICLR, 2025.
- Schaeffer, R., Kazdan, J., Denisov-Blanch, Y. "Min-p, max exaggeration: A critical analysis of min-p sampling in language models." arXiv:2506.13681, 2025.
- Keskar, N. S., McCann, B., Varshney, L. R., Xiong, C., Socher, R. "CTRL: A conditional transformer language model for controllable generation." 2019. The repetition penalty.
- He, H., Thinking Machines Lab. "Defeating nondeterminism in LLM inference." Thinking Machines Lab blog, September 2025. Batch invariance.
- Sennrich, R., Haddow, B., Birch, A. "Neural machine translation of rare words with subword units." ACL, 2016. BPE.
- Kudo, T. "Subword regularization: Improving neural network translation models with multiple subword candidates." ACL, 2018. The unigram model.
- Kudo, T., Richardson, J. "SentencePiece: A simple and language independent subword tokenizer and detokenizer for neural text processing." EMNLP (system demonstrations), 2018.
- Petrov, A. et al. "Language model tokenizers introduce unfairness between languages." NeurIPS, 2023.
- Land, S., Bartolo, M. "Fishing for Magikarp: Automatically detecting under-trained tokens in large language models." EMNLP, 2024. Glitch tokens.
- Liu, N. F. et al. ["Lost in the middle: How language models use long contexts."](https://arxiv.org/abs/2307.03172) TACL, 2024.
- Hsieh, C.-P. et al. "RULER: What's the real context size of your long-context language models?" COLM, 2024.
- Ji, Z. et al. "Survey of hallucination in natural language generation." ACM Computing Surveys, 2023.
- Kalai, A. T., Nachum, O., Vempala, S. S., Zhang, E. "Why language models hallucinate." arXiv:2509.04664, 2025.
- Kadavath, S. et al. "Language models (mostly) know what they know." 2022. Calibration of pretrained models.
- OpenAI. "GPT-4 technical report." arXiv:2303.08774, 2023. Calibration before and after post-training.
- Cheng, J., Marone, M., Weller, O., Lawrie, D., Khashabi, D., Van Durme, B. "Dated data: Tracing knowledge cutoffs in large language models." COLM, 2024. Effective against reported cutoffs.
- Sharma, M. et al. "Towards understanding sycophancy in language models." ICLR, 2024.
- Turpin, M., Michael, J., Perez, E., Bowman, S. R. "Language models don't always say what they think: Unfaithful explanations in chain-of-thought prompting." NeurIPS, 2023.
- Berglund, L. et al. "The reversal curse: LLMs trained on 'A is B' fail to learn 'B is A'." ICLR, 2024.
- Greshake, K. et al. "Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection." AISec (ACM CCS workshop), 2023.
- Willison, S. "The lethal trifecta for AI agents: private data, untrusted content, and external communication." Blog post, 16 June 2025.
- Zheng, L. et al. "Judging LLM-as-a-judge with MT-Bench and Chatbot Arena." NeurIPS Datasets and Benchmarks, 2023. Judge biases.
- Chen, M. et al. ["Evaluating large language models trained on code."](https://arxiv.org/abs/2107.03374) 2021. HumanEval and the unbiased pass@k estimator.
- Zhang, H. et al. "A careful examination of large language model performance on grade school arithmetic." NeurIPS Datasets and Benchmarks, 2024. GSM1k and contamination.
- Sclar, M., Choi, Y., Tsvetkov, Y., Suhr, A. "Quantifying language models' sensitivity to spurious features in prompt design." ICLR, 2024.
- Miller, E. "Adding error bars to evals: A statistical approach to language model evaluations." arXiv:2411.00640, 2024.
- DeepSeek-AI. "DeepSeek-V3 technical report." 2024; "DeepSeek-R1." 2025. A large MoE model and a reasoning model.
- Hugging Face. SmolLM2 model cards (HuggingFaceTB/SmolLM2-135M and relatives), 2024. The labs' base model: 2T training tokens, Apache-2.0.
