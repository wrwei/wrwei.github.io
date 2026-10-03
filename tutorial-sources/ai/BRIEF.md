# BRIEF — the AI series for wrwei.github.io

Every agent working on this series reads this file first. It records the decisions that hold
for every module.

## What we are making

A ten-module tutorial series, **"From Machine Learning to Large Language Models"**, published on
Ran Wei's academic home page at `https://wrwei.github.io/tutorials/ai/`, next to his existing
series (Object Oriented Design, SysML v2, DevOps, MBSE, AI Agents).

Each module expands one of ten existing concise tutorials into a complete **~10-hour self-study
unit**. The sources are ten concise tutorials kept in the author's private repository
(`docs/AI_Tutorials/`):

| # | Source file | Module |
|---|---|---|
| 01 | `01-machine-learning-foundations.md` | Machine learning foundations |
| 02 | `02-neural-networks.md` | Neural networks and backpropagation |
| 03 | `03-convolutional-networks.md` | Convolutional networks |
| 04 | `04-recurrent-networks.md` | Recurrent networks and sequences |
| 05 | `05-other-networks.md` | Other networks worth knowing |
| 06 | `06-transformer.md` | The transformer |
| 07 | `07-large-language-models.md` | Large language models |
| 08 | `08-llm-pretraining.md` | LLM pretraining |
| 09 | `09-llm-post-training.md` | LLM post-training |
| 10 | `10-inference-and-serving.md` | Inference and serving |

`00-README.md` in the same folder states the series' purpose, notation and rules. Read it.

Every module is published in English and in Simplified Chinese. English is written first; the
Chinese is a translation made later.

## Audience

Engineers and postgraduate students who are comfortable with calculus, linear algebra and basic
probability but have not worked in machine learning. The goal is not a survey. It is to leave the
reader able to read a modern model paper, understand what a training run is doing to a model, and
make engineering decisions about models with judgement rather than by recipe.

## What "10 hours" means

600 minutes of notional learning time per module (plus or minus 30), made explicit in a study
plan of five sessions of about two hours. The budget:

| Activity | Minutes | Volume |
|---|---|---|
| Concept reading, including worked examples, figures, inline checks and widgets | 210–250 | 13,000–17,000 words of prose (this material reads at about 100 words a minute) |
| Labs: hands-on, runnable code | 170–210 | 4–6 labs |
| Exercises with full worked solutions | 100–130 | 15–20 exercises, graded ★ / ★★ / ★★★ |
| Self-check quiz | 15–20 | 10–12 multiple-choice questions with explanations |
| Guided paper reading | 40–60 | 2–3 papers, each with reading questions |
| Summary and review | about 10 | |

Difficulty grades: ★ is conceptual, about 5 minutes; ★★ is a derivation or calculation, 10–20
minutes; ★★★ is coding or a mini-project, 25–45 minutes.

Sessions interleave reading and doing (read, then a lab, then a check). They do not put all the
reading first.

## Voice

Keep the voice of the source tutorials. It is direct and precise, and it is the reason the
sources are good.

- British spelling: normalisation, optimiser, initialisation, behaviour, modelling, generalise.
- Short declarative sentences. Say what a thing is, then why, then how it fails.
- Order inside a topic: the problem, then intuition, then the formalism with the derivation
  written out, then a worked example with real numbers, then code, then the failure modes.
- **Every number comes from somewhere.** When the text states an accuracy, a FLOP count, a memory
  size or a price, it says how the number was obtained, so the reader can redo it.
- **Every method can fail, and the text says how.**
- No hype, no filler, no emoji. Avoid "delve", "crucial", "game-changer", "In today's world",
  "Let's dive in", "it is important to note that". No rhetorical questions as section openers.
- Address the reader as "you" sparingly; prefer stating facts.
- Derivations are written out, not asserted. Where a step is skipped, say which and why.

## Public-site rules

The source tutorials were written inside the author's private engineering repository. The
published series stands alone.

- Never refer to the private source repository: not its name, code, file paths, internal
  documents, plans, agents, verifiers, or the model providers it uses. The checker blocks such
  names using a list kept in `notes/private-terms.txt`, a local, git-ignored file.
- Keep the engineering flavour by turning those examples into self-contained, generic ones:
  - fitting a hyperelastic (neo-Hookean) material model to a compression test (Module 01);
  - segmenting microscopy or CT volumes and turning masks into surfaces (Module 03);
  - sensor time series from a monitored asset or digital twin (Module 04);
  - graph networks on fault trees, physics-informed networks for engineering ODEs/PDEs (Module 05);
  - a **running case study in Modules 07–10**: a small (about 9B-parameter) open model adapted
    to draft and check engineering safety-assurance arguments (safety cases). Present it as a
    hypothetical worked case that the reader follows, never as someone's actual plan or product.
- The sibling series **AI Agents** (`../agent/index.html`, 15 modules: prompting, the agent loop,
  tool use, memory, RAG, MCP, frameworks, multi-agent, A2A, guardrails, evaluation, deployment)
  covers building applications with LLMs. Cross-link it for depth on prompting, RAG and agents
  rather than duplicating it.

## Notation

As in `00-README.md`: vectors bold lower case $\mathbf{x}$; matrices bold upper case
$\mathbf{W}$; scalars italic; a dataset $\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^{N}$;
parameters $\theta$; loss $\mathcal{L}(\theta)$ and gradient $\nabla_\theta \mathcal{L}$;
expectation $\mathbb{E}_{(\mathbf{x},y)\sim\mathcal{D}}$; natural logarithms unless written
$\log_2$. Shapes are written $(B, T, d)$ for batch, sequence length, width.

## Lab environment

- Python 3.11+, PyTorch 2.x, NumPy, matplotlib, scikit-learn, SciPy. Hugging Face
  `transformers`, `datasets` and `tokenizers` where needed (mostly Modules 07–10).
- Every lab runs on a laptop CPU in its stated runtime: aim for at most 5 minutes per run, and at
  most 15 minutes for the one larger training lab a module may have, which must also offer a
  `QUICK = True` setting that finishes in about 3 minutes. A GPU is optional; mention Google Colab
  as the free option.
- Prefer data that needs no download: synthetic data, and the scikit-learn datasets that ship
  inside the package (`load_digits`, `load_breast_cancer`, `load_iris`, `load_diabetes`,
  `load_wine`, `make_moons`, `make_circles`, `make_regression`...). The `fetch_*` loaders download
  and should be avoided. Downloads are allowed where essential: small Hugging Face models
  (`HuggingFaceTB/SmolLM2-135M`, `HuggingFaceTB/SmolLM2-360M`, their `-Instruct` versions,
  `Qwen/Qwen2.5-0.5B-Instruct`, `gpt2`) and small datasets; state the download size.
- Seeds are fixed. Expected outputs are shown, with the remark that the last digits may differ.
- Each lab is self-contained: its code blocks, run in order in one Python session, reproduce the
  outputs shown. Later phases of this project execute every lab and replace the expected outputs
  with real ones, so code must be complete, not sketched.

## Topic ownership

To avoid duplication, each topic has one home. Other modules give a one-paragraph reminder and a
link.

- **01** supervised learning set-up; losses from maximum likelihood; gradient descent and SGD
  basics; generalisation, bias–variance, regularisation (ridge, lasso); honest evaluation and
  leakage; logistic and softmax regression; classical methods overview; k-means and PCA briefly.
- **02** MLPs; backpropagation and reverse-mode autodiff; activations; initialisation; optimisers
  from SGD to AdamW and learning-rate schedules; normalisation (batch, layer, RMS); regularisation
  for networks (dropout, weight decay, early stopping); losses and numerical stability; debugging
  training.
- **03** convolution; CNN architectures (LeNet to ResNet, MobileNet, ConvNeXt); transfer learning;
  detection and segmentation basics (U-Net); 1D and 3D convolution; interpretability (saliency,
  Grad-CAM). Vision transformers only as a pointer to 06.
- **04** sequences; RNNs; backpropagation through time; vanishing and exploding gradients;
  LSTM and GRU; seq2seq; the origin of attention (Bahdanau, Luong); teacher forcing and beam
  search basics; time-series practice; state-space models (S4, Mamba) and linear recurrences.
- **05** autoencoders and VAEs; GANs; diffusion; graph neural networks; physics-informed networks
  and neural operators; contrastive and self-supervised learning (InfoNCE, CLIP); mixture of
  experts as a concept (LLM-scale MoE engineering is 08).
- **06** attention in full; multi-head attention; the block; positional encodings (sinusoidal,
  learned, RoPE, ALiBi); encoder, decoder and encoder–decoder shapes; the modern decoder block
  (RMSNorm, SwiGLU, GQA, FlashAttention, sliding window); parameter and FLOP counting; training a
  tiny GPT. The KV cache is introduced only; its depth is in 10.
- **07** what an LLM is (the language-modelling objective, perplexity); tokenisation (BPE and
  relatives); scaling laws (concept and the Chinchilla fit); in-context learning and prompting
  basics (depth is in the AI Agents series); decoding and sampling; the context window;
  limitations (hallucination, prompt injection, calibration); evaluating a claim; the dated
  landscape; cost from first principles.
- **08** pretraining: the compute budget; the data pipeline (extraction, filtering,
  deduplication, mixtures); architecture and hyperparameters at scale; optimisation at scale
  (schedules, batch size, stability, mixed precision); memory accounting; distributed training
  (data parallel, ZeRO/FSDP, tensor, pipeline, sequence/context parallel); what breaks;
  evaluation during the run; a small run you can do; mid-training; continued pretraining.
- **09** post-training: SFT, chat templates and loss masking; PEFT (LoRA, QLoRA); preferences and
  reward models; RLHF with PPO (conceptual); DPO (full derivation) and variants; RL with
  verifiable rewards (GRPO); rejection sampling and expert iteration; safety, refusal and
  honesty; training for tool use; evaluation; model merging; the running case study's recipe.
- **10** inference: prefill and decode; the roofline model; the KV cache in depth; batching
  (continuous), paged attention, prefix caching; quantisation (int8, int4, GPTQ, AWQ);
  speculative decoding; serving stacks; sizing the running case study; latency metrics and load
  testing; reliability; hardware; cost.

## Dates and facts

Today is 1 October 2026. Statements about the current state of the field (models, hardware,
prices, context lengths) are dated ("as of 2026") and conservative. Prefer well-established
facts. Never invent model names, benchmark numbers, prices, paper titles or authors. If you are
not sure of a citation's details, give fewer details rather than wrong ones.
