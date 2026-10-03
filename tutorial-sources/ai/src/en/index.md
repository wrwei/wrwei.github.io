---
title_html: From <em>Machine Learning</em> to <em>Large Language Models</em>
lead: Ten modules, about a hundred hours, that take an engineer who knows calculus, linear algebra and basic probability from a first loss function to training, aligning and serving a language model.
tags: AI · Deep learning · LLMs | 10 modules · ≈ 100 hours | EN / 中文
---

## How the series works {#how}

Each module is a self-contained unit of about ten hours, organised as five study sessions of
about two hours. A session mixes reading with doing.

- **Concepts.** The ideas with the mathematics written out, worked examples with real numbers,
  figures, and interactive demos to push around. Each section closes with a short question that
  checks you understood it.
- **Labs.** Four to six hands-on labs per module in Python, NumPy and PyTorch. Every lab runs on
  a laptop CPU in minutes, and every output printed on the page was produced by running its code.
- **Practice.** Fifteen to twenty exercises, graded ★ to ★★★, each with a full worked solution,
  and a self-check quiz.
- **Guided reading.** Two or three of the papers that matter, with what to read, what to skip
  and the questions to answer while reading.

A study plan at the top of every module lists its sessions with their timings. Tick them off as
you go; your progress is kept in your browser.

## The modules {#modules}

<!-- modules -->

## Learning path {#path}

Read the modules in order. Module 06 needs 02 and 04; Modules 08 and 09 need 06 and 07; Module 10
can be read any time after 07.

::: figure id=fig-00-1
The ten modules and what each depends on. Foundations (01–02) lead to the architectures (03–06);
the transformer (06) leads to large language models (07), which branch into pretraining (08),
post-training (09) and inference (10).
:::

### Suggested schedules

- **Ten weeks, part time.** One module a week: five evenings of two hours.
- **Five weeks, intensive.** Two modules a week.
- **The language-model track** (about 60 hours): Module 02 (backpropagation and optimisers), then
  06, 07, 08, 09 and 10.
- **The foundations track** (about 50 hours): Modules 01 to 05, for engineers who need machine
  learning and deep learning but not language models.

## Two rules the series keeps {#rules}

**Every number comes from somewhere.** When a module says a method reaches an accuracy, costs a
number of FLOPs or needs a number of gigabytes, it says how that number was obtained, so you can
redo it.

**Every method can fail, and the text says how.** A technique explained without its failure mode
is advertising. Every module has a section on what goes wrong, because that is the section an
engineer needs at three in the morning.

## Who it is for {#audience}

Engineers and postgraduate students who are comfortable with calculus, linear algebra and basic
probability but have not worked in machine learning. The aim is not a survey. It is to leave you
able to read a modern model paper, understand what a training run is doing to a model, and make
engineering decisions about models with judgement rather than by recipe.

## Setting up {#setup}

Python 3.11 or later and a virtual environment are enough for every lab. A GPU is optional;
[Google Colab](https://colab.research.google.com/) is a free alternative to a local install.

```bash
python -m venv .venv
source .venv/bin/activate          # on Windows: .venv\Scripts\activate
pip install torch numpy scipy scikit-learn matplotlib
pip install transformers datasets tokenizers tiktoken   # Modules 07 to 10
```

Modules 07 to 10 download small open models from Hugging Face, the largest about one gigabyte;
each lab states its download size.

## Notation {#notation}

Vectors are bold lower case, $\mathbf{x}$; matrices are bold upper case, $\mathbf{W}$; scalars
are italic, $y$. A dataset is $\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^{N}$. Model
parameters are collected in $\theta$. A loss is $\mathcal{L}(\theta)$ and its gradient is
$\nabla_\theta \mathcal{L}$. Expectation over data is $\mathbb{E}_{(\mathbf{x},y)\sim\mathcal{D}}$.
Logarithms are natural unless written $\log_2$. Tensor shapes are written $(B, T, d)$ for batch,
sequence length and width. Code is Python with PyTorch, kept short enough to type.

Every module ends with its key terms in English and Chinese, for readers who read papers in
English and discuss them in Chinese.

## Related series {#related}

- [AI Agents](../agent/index.html) — building applications on top of language models: prompting,
  the agent loop, tool use, memory, retrieval-augmented generation, MCP, multi-agent systems,
  guardrails and evaluation. This series explains the models; that one explains how to build
  with them.

## Further reading for the series {#further}

- Goodfellow, Bengio and Courville, *Deep Learning*, MIT Press, 2016. The reference for Modules 01
  to 05.
- Bishop, *Pattern Recognition and Machine Learning*, Springer, 2006. The probabilistic view of
  Module 01.
- Jurafsky and Martin, *Speech and Language Processing*, 3rd edition draft. Sequences, attention
  and language models.
- Zhang, Lipton, Li and Smola, *Dive into Deep Learning*. Code-first, kept current.
- The papers named at the end of each module. Read the original before the summary of it.
