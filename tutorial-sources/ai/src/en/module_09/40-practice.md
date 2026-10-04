## Self-check quiz {#quiz}

Choose an answer before reading its explanation.

```quiz

? A model fine-tuned with ChatML ignores its system prompt only in production. What is the most likely cause?
- [ ] The LoRA rank was too low for the system prompt to be learned reliably
- [x] Serving renders a different template from training (a default system prompt, a newline)
- [ ] The serving temperature is higher than in evaluation, so the model drifts from instructions
- [ ] Too few epochs were run for the model to memorise the system prompt
> The template must be byte-identical between training and serving; a default system prompt inserted by one side or a whitespace difference changes the tokens the model sees. Rank, epochs and sampling temperature would show in offline evaluation too, not only in production.

? In SFT with loss masking, which tokens carry loss?
- [ ] All tokens
- [ ] Assistant tokens excluding the end-of-turn token
- [ ] User and assistant tokens but not the system prompt
- [x] Assistant tokens including the end-of-turn token
> The model is trained to produce responses, not to predict users or system prompts; the end-of-turn token must be trained because predicting it is how the model learns to stop. Excluding it removes the stopping training signal; including user tokens teaches it to imitate users.

? LoRA initialises A randomly and B to zero. What is true at the first step?
- [x] The model equals the base and only B generally receives a non-zero gradient
- [ ] Both A and B receive zero gradient, so only later steps move the adapter
- [ ] The model differs from the base by (alpha / r) A until B has been trained
- [ ] Only A receives a non-zero gradient, because B multiplies it
> B A = 0 so the model is the base. dL/dB = (alpha / r) g (A x)^T is generally non-zero with random A; dL/dA = (alpha / r) B^T g x^T is zero because B is zero. If both were zero neither would ever move.

? A reward model's output for every response to prompt x is increased by 3. Under Bradley-Terry, what changes?
- [ ] All preference probabilities for x increase
- [ ] The probabilities move toward 0.5
- [x] Nothing
- [ ] The training loss increases
> Bradley-Terry depends only on reward differences for the same prompt, so a per-prompt shift cancels. Rewards are identified only up to such a constant, which is why they are normalised before RL.

? In the KL-regularised objective E[r] - beta KL(pi || pi_ref), what happens to the optimal policy as beta decreases with the reward fixed?
- [ ] It stays closer to the reference, because the penalty becomes relatively stronger
- [x] It concentrates on high-reward responses; KL grows and reward errors get exploited
- [ ] It does not change, because beta only rescales the whole objective
- [ ] It becomes uniform over responses, because the KL term no longer anchors it
> pi* is proportional to pi_ref exp(r / beta); smaller beta sharpens it toward the highest-reward responses and increases the KL. With a learned reward this is where reward hacking lives, as the widget's proxy mode shows.

? In the DPO derivation, why does the partition function Z(x) disappear?
- [x] It depends only on x, so it cancels in r_w - r_l for two responses to one prompt
- [ ] It equals 1 because both policies are normalised distributions
- [ ] DPO estimates it with samples drawn from the reference at every training step
- [ ] beta is chosen so that Z(x) equals 1 for every prompt in the data
> r = beta log(pi* / pi_ref) + beta log Z(x); Bradley-Terry uses r_w - r_l for one prompt, so beta log Z(x) cancels. It is not 1 in general, and DPO never samples or estimates it.

? DPO on pairs taken from a very different model reaches 100% pair accuracy and near-zero loss, but the task metric falls and the chosen responses become less likely than under the reference. What is this?
- [ ] Underfitting caused by too few training steps
- [ ] A KL term that is too strong for the data
- [ ] A bug in the cached reference log-probabilities
- [x] Likelihood displacement from off-policy pairs
> When rejected responses are things the model never writes, the pairs are trivially separable and the probability pushed off them can go to responses in neither column rather than increasing chosen likelihood (Lab 4: accuracy 0.478 to 0.229, chosen log-ratio -0.93). Underfitting would not give zero loss.

? GRPO with G = 8 runs on prompts the policy already solves 95% of the time. What fraction of groups give a nonzero task advantage?
- [ ] About 95%
- [ ] About 5%
- [x] About 34%
- [ ] 100%, because advantages are standardised within each group
> A group carries signal unless all samples are right or all wrong: 1 - 0.95^8 - 0.05^8 = 0.337. Standardisation cannot create signal in a zero-variance group; the code returns zero advantages there.

? What limits sample–verify–keep when no response to a hard prompt passes the checker?
- [x] It learns only from successes; unsolved prompts teach it nothing
- [ ] It cannot use a verifier, so it trains on unfiltered samples
- [ ] It needs a learned value model, which makes it unstable
- [ ] It needs preference pairs, which are expensive to collect
> It supplies no supervised target for that prompt. GRPO can use failures relative to successes in mixed groups, but all-failure groups also have zero task advantages. Lab 5 does not show a universal GRPO advantage: expert iteration works very well on its closed task.

? A grader gives 1 for a correct answer and 0 both for a wrong answer and for 'I do not know'. Under RL against it, the model learns to:
- [ ] Abstain whenever it is unsure
- [ ] Answer only when its probability of being right exceeds 0.5
- [x] Answer whenever there is a positive probability of correctness
- [ ] Refuse more often
> Answering has expected reward p and abstaining 0, so answering wins for any p > 0. Only a penalty for wrong answers (for example -lambda) creates a threshold, lambda / (1 + lambda) (Module 07, Section 10).

? On 50 shared items, model A passes 8 items that B fails and B passes 3 that A fails. What is the best conclusion?
- [ ] A is better at the 5% level, because 72% exceeds 62% by ten points
- [ ] B is better, because only 11 of the 50 items disagree
- [ ] The models are equivalent, because 39 of the 50 items agree
- [x] Not significant (exact McNemar p about 0.23); more items are needed
> Only the 11 discordant items carry information; 8 versus 3 under p = 0.5 gives a two-sided exact p of 0.227, and the paired interval is about [-2.7, 22.7] points. The same rates on 500 items would be significant.

? Two LoRA adapters trained for different tasks on the same base are to be merged with equal weight. What is correct?
- [ ] Average the A matrices and the B matrices separately, then use the averaged pair
- [x] Add half of each product (alpha / r) B_i A_i to W
- [ ] Multiply the two updates, so that the two tasks act in sequence
- [ ] Keep only the adapter with the larger norm, since the other one is redundant
> The update is the product B A; the average of products is not the product of averaged factors (Section 13's example gives 0.5 I against a matrix of 0.25s). Merging the products, or concatenating factors, preserves both updates exactly.
```

## Guided reading {#reading}

Read the cited versions and separate their measured claims from the assumptions
used in this module. Section numbers may differ in later revisions.

::: paper minutes=12
[Ouyang, L. et al. "Training language models to follow instructions with human feedback." NeurIPS, 2022.](https://arxiv.org/html/2203.02155v1)

**Why read it.** The paper that defined the SFT, reward model, PPO pipeline and showed that a 1.3B post-trained model can be preferred to a 175B base; most later recipes are variations on its Figure 2.

**What to read.** Read the abstract, main findings, Figure 2, human data collection, models (SFT, reward modelling, PPO and PPO-ptx), and the dataset-size table in the appendix. Focus on the selected labellers and prompt distribution. Skip detailed benchmark tables on a first pass.

**Questions to answer while reading.**

1. What data does each of the three steps in Figure 2 consume, and roughly how many examples does each use?
2. Why did the authors train the reward model on all K(K-1)/2 comparisons from one prompt as a single batch element?
3. What is PPO-ptx, and which problem (the 'alignment tax') does it address?
4. Why is the reported labeller agreement not by itself a hard ceiling on reward-model accuracy? What noise model or consensus target would you need to make a bound?
:::

::: paper minutes=18
[Rafailov, R. et al. "Direct preference optimization: Your language model is secretly a reward model." NeurIPS, 2023.](https://arxiv.org/html/2305.18290v2)

**Why read it.** The derivation at the centre of this module, in the authors' notation, with the theorem that justifies the reparameterisation and the experiment that compares DPO with PPO on the reward-KL frontier.

**What to read.** Read the RLHF background, the optimal-policy and DPO derivation, the displayed gradient, the reward reparameterisation theorem, and the sentiment reward–KL comparison. Reproduce the optimum from both Gibbs inequality and a Lagrange multiplier. Consult the optimal-policy appendix proof if needed; skip the remaining experiments on a first pass.

**Questions to answer while reading.**

1. Rederive the optimal policy (the paper's Eq. 4) and the reward written through it (Eq. 5). Where does Z(x) go?
2. What does the gradient in Section 4 weight each example by, and why does that matter for pairs the model already ranks correctly?
3. What does the sentiment reward–KL comparison establish in that experiment, and what does it leave uncertain about other tasks or finite preference data?
4. What does 'your language model is secretly a reward model' mean in terms of beta log(pi_theta / pi_ref)?
:::

::: paper minutes=15
[DeepSeek-AI. "DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning." arXiv, January 2025.](https://arxiv.org/html/2501.12948v1)

**Why read it.** A public report of rule-reward RL from a pretrained base, followed by cold-start examples, rejection-sampled SFT and distillation. It helps separate an RL stage with no demonstrations from the prior capabilities already supplied by pretraining.

**What to read.** In the January 2025 arXiv version: Section 2.2 (R1-Zero: the GRPO objective, the rule-based accuracy and format rewards, the training template, the AIME curve and the 'aha moment'); Section 2.3 (cold start, reasoning-oriented RL, rejection sampling and SFT, RL for all scenarios); Section 2.4 (distillation); Section 4 (distillation versus RL, and the unsuccessful attempts with process reward models and tree search). Skip the benchmark tables of Section 3.

**Questions to answer while reading.**

1. What rewards did R1-Zero use, and why did the authors avoid a neural reward model?
2. What was wrong with R1-Zero's outputs, and what did the cold-start SFT stage fix?
3. How was rejection sampling used to build the SFT data of the later stage?
4. What do the authors conclude about distillation against RL directly on smaller models, and why?
:::

## Summary {#summary}

- Match the training signal to the behaviour: demonstrations, preferences and verifiable outcomes answer different questions.
- Render the deployed chat template, train assistant stopping tokens and choose the loss denominator deliberately.
- LoRA removes weight-gradient and optimiser costs, while frozen projections still carry activation gradients.
- Reward differences identify preferences; arbitrary offsets, label noise and distribution shift require separate diagnostics.
- PPO uses sampled policy gradients, a critic and clipping; clipping is not a strict trust region.
- DPO cancels the partition term but fits pair margins, not an unconditional guarantee that chosen answers become more likely.
- Sample–verify–keep is effective where successful examples exist; track prompt coverage and cap easy-prompt repetition.
- GRPO's task signal needs varied rewards within a group; its KL term can still act on zero-advantage groups.
- A verifier teaches exactly what it accepts, including unintended shortcuts.
- Evaluate refusals, benign compliance, abstention, calibration and action honesty as separate behaviours.
- Use paired uncertainty, audit checkers and judges, and control contamination before promoting a candidate.
- Merge scaled adapter products, quantise afterwards, then evaluate and hash the actual release artifact.

[Module 10](module_10_EN.html) carries the post-trained model into inference
and serving: decoding, KV caches, quantisation, batching and workload costs.

## References {#refs}

- Ouyang, L. et al. "Training language models to follow instructions with human feedback." NeurIPS, 2022. InstructGPT: SFT, reward model, PPO.
- Christiano, P. et al. "Deep reinforcement learning from human preferences." NeurIPS, 2017. Learning a reward from comparisons.
- Stiennon, N. et al. "Learning to summarize from human feedback." NeurIPS, 2020. RLHF on summarisation; best-of-n and its KL.
- Schulman, J. et al. "Proximal policy optimization algorithms." 2017. PPO.
- Rafailov, R. et al. "Direct preference optimization: Your language model is secretly a reward model." NeurIPS, 2023. DPO.
- Azar, M. G. et al. "A general theoretical paradigm to understand learning from human preferences." 2023. IPO and the deterministic-preference argument.
- Ethayarajh, K. et al. "KTO: Model alignment as prospect theoretic optimization." 2024.
- Hong, J., Lee, N., Thorne, J. "ORPO: Monolithic preference optimization without reference model." 2024.
- Meng, Y., Xia, M., Chen, D. "SimPO: Simple preference optimization with a reference-free reward." 2024.
- Shao, Z. et al. "DeepSeekMath: Pushing the limits of mathematical reasoning in open language models." 2024. GRPO.
- DeepSeek-AI. "DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning." 2025. R1-Zero, the R1 pipeline, distillation.
- Hu, E. J. et al. "LoRA: Low-rank adaptation of large language models." ICLR, 2022.
- Dettmers, T. et al. "QLoRA: Efficient finetuning of quantized LLMs." NeurIPS, 2023. NF4, double quantisation, paged optimisers.
- Zhou, C. et al. "LIMA: Less is more for alignment." NeurIPS, 2023. 1,000 curated examples.
- Bai, Y. et al. "Training a helpful and harmless assistant with reinforcement learning from human feedback." 2022. The helpful-harmless tension.
- Bai, Y. et al. "Constitutional AI: Harmlessness from AI feedback." 2022.
- Zheng, L. et al. "Judging LLM-as-a-judge with MT-Bench and Chatbot Arena." NeurIPS Datasets and Benchmarks, 2023. Judge agreement and biases.
- Zhou, J. et al. "Instruction-following evaluation for large language models." 2023. IFEval.
- Dong, H. et al. "RAFT: Reward ranked finetuning for generative foundation model alignment." 2023.
- Gulcehre, C. et al. "Reinforced self-training (ReST) for language modeling." 2023.
- Wortsman, M. et al. "Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time." ICML, 2022.
- Gekhman, Z. et al. "Does fine-tuning LLMs on new knowledge encourage hallucinations?" 2024.
- Touvron, H. et al. "Llama 2: Open foundation and fine-tuned chat models." arXiv, 2023. Iterated rejection sampling and PPO.
- Lambert, N. et al. "Tulu 3: Pushing frontiers in open language model post-training." 2024. SFT, DPO, RLVR; an open recipe.
- Gao, L., Schulman, J., Hilton, J. "Scaling laws for reward model overoptimization." ICML, 2023.
- Lightman, H. et al. "Let's verify step by step." 2023. Process reward models.
- Aghajanyan, A., Zettlemoyer, L., Gupta, S. "Intrinsic dimensionality explains the effectiveness of language model fine-tuning." ACL, 2021.
- Kalajdzievski, D. "A rank stabilization scaling factor for fine-tuning with LoRA." 2023.
- Biderman, D. et al. "LoRA learns less and forgets less." TMLR, 2024.
- Razin, N. et al. "Unintentional unalignment: Likelihood displacement in direct preference optimization." 2024.
- Park, R. et al. "Disentangling length from quality in direct preference optimization." 2024.
- Xu, S. et al. "Is DPO superior to PPO for LLM alignment? A comprehensive study." ICML, 2024.
- Ahmadian, A. et al. "Back to basics: Revisiting REINFORCE style optimization for learning from human feedback in LLMs." ACL, 2024. RLOO.
- Liu, Z. et al. "Understanding R1-Zero-like training: A critical perspective." 2025. Dr. GRPO: length and difficulty biases.
- Yu, Q. et al. "DAPO: An open-source LLM reinforcement learning system at scale." 2025. Clip-higher, dynamic sampling, token-level loss.
- Beirami, A. et al. "Theoretical guarantees on the best-of-n alignment policy." 2024. The KL formula as an upper bound.
- Anthony, T., Tian, Z., Barber, D. "Thinking fast and slow with deep learning and tree search." NeurIPS, 2017. Expert iteration.
- Zelikman, E. et al. "STaR: Bootstrapping reasoning with reasoning." NeurIPS, 2022.
- Schick, T. et al. "Toolformer: Language models can teach themselves to use tools." NeurIPS, 2023.
- Rottger, P. et al. "XSTest: A test suite for identifying exaggerated safety behaviours in large language models." NAACL, 2024.
- Perez, E. et al. "Red teaming language models with language models." EMNLP, 2022.
- Kadavath, S. et al. "Language models (mostly) know what they know." 2022.
- OpenAI. "GPT-4 technical report." 2023. Calibration before and after post-training.
- Sharma, M. et al. "Towards understanding sycophancy in language models." ICLR, 2024.
- Kalai, A. T. et al. "Why language models hallucinate." 2025. Binary grading rewards guessing.
- Brown, T. et al. "Language models are few-shot learners." NeurIPS, 2020. 13-gram contamination analysis.
- Dubois, Y. et al. "Length-controlled AlpacaEval: A simple way to debias automatic evaluators." 2024.
- Miller, E. "Adding error bars to evals: A statistical approach to language model evaluations." 2024.
- Frankle, J. et al. "Linear mode connectivity and the lottery ticket hypothesis." ICML, 2020.
- Ilharco, G. et al. "Editing models with task arithmetic." ICLR, 2023.
- Yadav, P. et al. "TIES-Merging: Resolving interference when merging models." NeurIPS, 2023.
- Yu, L. et al. "Language models are Super Mario: Absorbing abilities from homologous models as a free lunch." ICML, 2024. DARE.
- Hewitt, J. "Initializing new word embeddings for pretrained language models." 2021. Technical note; the mean-and-covariance initialisation used for the template rows in Labs 1-2.
