## What post-training is for {#s1}

A base model predicts the next token of a text. It can complete a familiar
engineering explanation, repeat a table heading, or imitate a question-and-answer
exchange. None of these abilities specifies the behaviour of an assistant. The
model still needs to learn which turn belongs to it, how a request constrains its
answer, when a turn ends, and what to do when the requested evidence is absent.
Those behaviours are the subject of **post-training**.

The starting checkpoint matters. A base model, an instruct model and a model that
has undergone continued pretraining are different starting points even when they
have the same architecture. An instruct release has already been trained on
conversations and preferences. A base checkpoint has not necessarily seen its
tokenizer's reserved chat markers. Continued pretraining on domain prose does not
automatically teach either role boundaries or an instruction-following policy.
The choice made for the running case study is recorded in [Section 14](#s14).

### Three kinds of signal

**Supervised fine-tuning**, or SFT, supplies the answer the assistant should have
written. A demonstration fixes a whole response: its format, its content and its
stopping point. Training increases that response's conditional likelihood. This
is ordinary language-model training with a carefully chosen subset of targets.

**Preference optimisation** supplies a comparison. Two responses answer the same
prompt, and a label says which is better. The label need not describe an ideal
answer. It can express a judgement about clarity, relevance or an appropriate
refusal that is easier to recognise than to demonstrate. A learned reward model
turns comparisons into scores; DPO instead fits the policy directly to the pairs.

**Reinforcement learning** supplies a way to score generated responses. The model
samples an answer, receives a reward, and updates its policy. A deterministic
verifier can replace a learned reward when the task has checkable outcomes. The
quality of that learning signal depends on what the verifier checks. A valid JSON
object is not necessarily a correct argument, and a test-passing program is not
necessarily correct on inputs absent from the tests.

| Stage | Data unit | Signal | Typical purpose | Illustrative scale | Main cost |
|---|---|---|---|---|---|
| SFT | Conversation with assistant targets | Token log-likelihood | Turn-taking, format and task framing | Thousands to millions of examples | Training token-passes and target preparation |
| Preferences | Prompt, chosen response, rejected response | Comparison likelihood | Comparative judgements | Tens of thousands to millions of pairs | Producing and labelling pairs |
| RL | Prompt and a reward procedure | Sampled return | Improve behaviours on the model's own outputs | Thousands to hundreds of thousands of prompts | Generation, scoring and updates |

These ranges describe possible workloads, not sufficient-data thresholds.
Every stage can update full weights or adapters. Some tasks need only SFT; others
need repeated preference collection or RL. There is no general rule that a later
stage must improve every metric. The promotion test remains an evaluation of the
behaviour that will be deployed.

::: figure id=fig-09-1
Training signals and evaluation gates. Demonstrations train SFT; comparisons feed
a reward-model/PPO path or DPO; a verifier can score generated responses directly.
Verified samples can return to SFT through rejection sampling. Any training stage
can update full weights or adapters. The diagram is a schematic, not a compulsory
sequence for every task.
:::

### Behaviour can be cheaper than the base

[InstructGPT](https://arxiv.org/abs/2203.02155) showed that human evaluators on its
prompt distribution could prefer a 1.3B post-trained model to the 175B GPT-3 base.
[LIMA](https://arxiv.org/abs/2305.11206) fine-tuned a 65B base on 1,000 carefully
curated examples and demonstrated substantial instruction-following behaviour.
These results support using good demonstrations to elicit abilities already
present in a base. They do not show that 1,000 examples teach any missing domain
knowledge, or that one preference study measures competence on every task.

The distinction between behaviour and knowledge is useful, but not absolute.
Fine-tuning can teach new information, and RL can improve how an existing model
uses computation. The engineering question is whether the particular training
signal produces robust improvements on held-out behaviours. Format can improve
while arithmetic does not. In [Lab 6](#lab6), the 135M instruct checkpoint produces
assistant-shaped replies but still fails this suite's number-only conversion
items. A polished reply is not evidence that the underlying computation is right.

::: worked title="The scale of the hypothetical SFT stage"
The case study uses 50 million SFT tokens. Compared with the illustrative
2-trillion-token pretraining plan in [Module 08](module_08_EN.html#s1), this is
$50\times10^6/(2\times10^{12})=2.5\times10^{-5}$, or $0.0025\%$.
Compared with the team's own 2-billion-token continued-pretraining stage, it is
$50\times10^6/(2\times10^9)=0.025$, or $2.5\%$.

These are data-volume ratios. They are not elapsed-time ratios: generating RL
samples, obtaining labels and evaluating a candidate can dominate a small
post-training run. Frozen weights also occupy memory during adapter training.
:::

Published pipelines illustrate choices rather than a universal recipe.
InstructGPT used demonstrations, a reward model and PPO. Llama 2-Chat combined
SFT with rejection sampling and PPO. Tülu 3 used SFT, DPO and reinforcement
learning with verifiable rewards. DeepSeek-R1 used a cold-start stage, reasoning
RL, rejection-sampling SFT and another RL stage. Their objectives, data and
evaluation conditions differ; copying the order does not reproduce their result.

### The running case

The hypothetical assistant drafts and checks safety-case arguments for the
pressure-relief system of a reactor vessel. Its canonical model has
9,550,729,216 parameters, the same configuration used in Modules 07 and 08. This
module starts from the continued-pretrained checkpoint assumed to have passed
Module 08's domain gate. It must learn conversation boundaries, the argument
schema, controlled edits and honest handling of missing evidence. A structural
checker can verify references and cycles; it cannot establish that a real relief
system is adequate. The tutorial's promotion gates concern assistant behaviour,
and keep that limitation visible.

::: check
A model can complete an engineering textbook paragraph. Why does that not imply
it can reliably answer an engineer's request and stop?
:::

::: answer
Text completion does not specify a role, response format, uncertainty policy or
end-of-turn action. Those need training examples and evaluation in the actual
conversation format. Existing knowledge may help, but does not install that
behaviour by itself.
:::

## Supervised fine-tuning: the data {#s2}

An **SFT example** contains a conversation and the assistant turns that count as
targets. A typical stored representation is a list of messages with `role` and
`content` fields. The roles might be system, user, assistant and tool. A separate
manifest records where the conversation came from, what transformations were
applied, and which split contains it. Rendering and loss masking happen after
this representation is assembled; they should not destroy that provenance.

```python norun
messages = [
    {"role": "system", "content": "Reply with the answer and its unit only."},
    {"role": "user", "content": "Convert 2.5 MPa to kPa."},
    {"role": "assistant", "content": "2500 kPa"},
]
manifest = {"source": "synthetic unit conversion", "split": "train",
            "generator_seed": 1, "schema_version": 1}
```

The useful unit is the behaviour represented by the example, not its token count.
Ten thousand nearly identical conversion questions can leave uncertainty,
multi-turn correction and controlled editing untrained. Start with a coverage
table: task, language, input condition, target behaviour and how the target is
checked. It makes holes visible before a large generator fills them with more
examples of the easy cases.

### Four sources of demonstrations

**Human demonstrations** can encode judgement that is difficult to specify in
code. A domain expert can distinguish a supported claim from a plausible but
unsupported one, and write an appropriate request for missing evidence. Such
examples are expensive because their correctness and consistency need review.
The LIMA result motivates spending effort on target quality; it does not
establish that smaller data sets always beat larger ones. A small set also has
limited coverage and can overrepresent one author's preferred style.

**Distillation** uses a stronger model to answer the intended prompts. The student
then learns from selected answers. The teacher's output is a candidate target,
not a reference answer by virtue of its source. Parse it, run the task checker,
inspect a sample and retain rejection reasons. A teacher may supply impeccable
format while inventing evidence. Record the teacher and generation settings in
the manifest, and establish that the applicable source and model terms permit
the intended use before treating those outputs as reusable training data.

**Self-generation with filtering** uses the current model's own samples. Keep
responses that pass a verifier and train on them. This is the success-only method
developed in [Section 8](#s8). It avoids a separate teacher, but cannot provide a
successful demonstration for a prompt the model never solves. If successes are
rare, generating them may be much more expensive than the subsequent SFT step.
The filter also determines what the student learns to optimise.

**Synthetic edits** work when an exact transformation can produce a target.
For example, rename a specified evidence identifier in an argument while leaving
every other field untouched. The original artifact, the edit request and the
scripted result form a complete training example. The script can compare changed
paths, confirm the reference update and reject unintended modifications. This
provides exact examples of edit discipline without relying on a judge's impression
that the answer looks similar to the original.

::: figure id=fig-09-2
Conversation roles and target turns, together with four demonstration sources.
Human writing, distillation, verified self-generation and scripted edits provide
different kinds of coverage and different failure modes. Cost and quality labels
are qualitative; the drawing does not assign invented measurements to them.
:::

### Filtering changes the distribution

A filter is also a selection policy. Exact duplicates waste budget and may give a
single target undue influence. Near duplicates can straddle the training and test
splits without sharing a hash. Language checks, length limits and parse rules
prevent obvious mismatches, but none establishes factual correctness. A coverage
checker that tests only the presence of a hazard identifier can keep a response
that mentions it while failing to address the hazard.

Apply decontamination against every evaluation set before training, including the
prompts used to produce distilled answers. Group related source documents and
template families before splitting. Otherwise a held-out prompt can be a renamed
version of one the teacher generated for training. Report retained counts by
source, task and language, and dropped counts by reason. A single final count
hides which categories the filter removed.

::: worked title="Distillation yield and the missing hard cases"
Suppose 20,000 prompts each receive one teacher sample, and $62\%$ pass a checker.
The retained set has $20{,}000\times0.62=12{,}400$ examples.

With four independent samples per prompt at the same success probability, the
probability of at least one success is
$1-(1-0.62)^4=1-0.38^4=0.97915$. That would cover about 19,583 prompts.
The independence assumption is substantial: prompts have different difficulties,
and repeated outputs can share the same misconception. Measure coverage by prompt
rather than advertising the independent-sample calculation as a prediction.

Keeping every passing sample weights easy prompts repeatedly. Keeping at most one
per prompt controls that imbalance, but still omits prompts with no success.
Those omitted cases need separate analysis, expert demonstrations or a changed
task. They have not disappeared from the deployed workload.
:::

### Match the conversation that will be served

Distribution match includes the system prompt, tools, languages, length and
imperfections of real requests. Training only on tidy English briefs can leave
Chinese requests, mixed identifiers and partially specified edits unsupported.
Generate coverage deliberately rather than relying on the teacher to happen to
produce it. For bilingual work, a translated target must preserve the evidence
identifiers, units and schema values that the checker reads.

Multi-turn data should show corrections and unresolved requests as well as
successful answers. A user who adds a missing evidence record should change the
assistant's conclusion. A user who repeats an unsupported claim should not.
These examples teach a relationship between context and behaviour that a list of
single-turn answers does not contain. Tool errors likewise need examples of
changing course, not just demonstrations of a successful call.

The targets themselves should say when information is unavailable. If every
training brief contains all the necessary evidence, the model never learns the
deployed condition in which evidence is missing. Adding the phrase “do not
hallucinate” to a system message supplies no target for that condition. Include
specific incomplete briefs and responses that identify the missing support.

### Preserve general behaviour while specialising

A narrow set can improve one task while degrading other abilities. Mixing general
instruction examples into the domain set is one mitigation, not a fixed-ratio
guarantee. Choose a starting mixture, measure the general battery and adjust its
share when the candidate fails a predeclared gate. Adapter training limits which
weights move, but does not prevent forgetting in the function computed by those
weights. The model's deployed outputs still depend on the adapted projections.

Finally, keep the data generator and its checker as versioned artifacts. A change
to either changes the learning problem. Record counts, seeds, source revisions
and the exact test split so an observed improvement can be reproduced. A model
checkpoint alone cannot explain whether a new behaviour came from a new target,
a different filter or an optimiser change.

::: check
Filtering distilled answers keeps only successful responses. Which deployed
prompts are most likely to be missing from the resulting SFT set?
:::

::: answer
Prompts the teacher finds difficult or consistently misunderstands. Their absence
is selection bias, not evidence that the workload is solved. Track uncovered
prompts and cap repeated successes so easy cases do not dominate the training set.
:::

## Templates, masking, packing and the limits of SFT {#s3}

A conversation becomes a sequence only after a **chat template** renders its
roles and boundaries. In the ChatML example, a turn has the form
`<|im_start|>role\ncontent<|im_end|>\n`. To request an assistant reply, generation
ends the prompt with `<|im_start|>assistant\n`. Other model families use other
markers. The names of the roles are not a universal interface to the weights;
the actual rendered token sequence is what the model receives.

[Transformers' chat-template documentation](https://huggingface.co/docs/transformers/chat_templating)
describes how messages are rendered and how the assistant generation prefix is
added. Training a complete assistant turn and prompting an unfinished one are
different operations. A training sequence already contains its target response;
it should not acquire a second generation header after that response.

### A rendering contract

Training and serving should render the same test conversations to identical token
IDs. Compare the rendered bytes too, because a tokenisation setting can conceal
where the two functions diverged. A default system message inserted by only one
side, an extra beginning-of-sequence token or a missing newline changes the
conditioning context. Rendering a template as text and then tokenising with
automatic special tokens enabled can add markers twice.

The base SmolLM2 checkpoint used here has no chat template. The lab therefore
defines one explicitly, with its system message in the data. The comparison in
Lab 6 uses the same explicit prompt for the base and instruct checkpoints rather
than allowing one tokenizer to insert a different default message. This controls
the comparison; it does not imply this hand-written template is optimal for every
released model.

Reserved token IDs need their own check. In this pinned base checkpoint, the
cosine similarity between the two chat-marker embedding rows is $0.99976$.
Their nearest neighbours include other reserved rows. That is consistent with
markers that have not learned distinct roles during pretraining. Similarity by
itself is not proof about every token's training history; here it motivates a
controlled stopping experiment on a checkpoint whose ordinary prose training
does not establish chat behaviour.

Lab 1 replaces those two rows with seeded samples using the embedding table's
per-dimension mean and standard deviation. Their resulting cosine is $0.39968$.
This is an explicit modification of the starting checkpoint, followed by SFT.
It is not an alternative to training: typical, distinct rows still have to acquire
their roles. For LoRA with a frozen tied embedding/head, initialisation or
trainable row deltas matter particularly because the adapter cannot directly
update the token rows.

### The conditional likelihood

Write the complete training sequence as $z_1,\ldots,z_T$. Let $m_t=1$ for a
target assistant token, including its end-of-turn marker, and zero elsewhere.
The token-mean SFT loss for a batch is

$$
\mathcal{L}_{\mathrm{SFT}}(\theta)
=-\frac{1}{\sum_{b,t}m_{b,t}}
\sum_{b,t}m_{b,t}\log p_\theta(z_{b,t}\mid z_{b,<t}).
$$

For a single prompt $x$ and response $y=(y_1,\ldots,y_L)$, the chain rule gives

$$
p_\theta(y\mid x)=\prod_{t=1}^{L}p_\theta(y_t\mid x,y_{<t}),
\qquad
\log p_\theta(y\mid x)=\sum_{t=1}^{L}\log p_\theta(y_t\mid x,y_{<t}).
$$

Training the assistant portion is therefore conditional maximum likelihood.
The prompt remains in the input and receives gradients through its effect on
later hidden states. Masking its *targets* does not remove the prompt from
attention, detach its representations, or freeze the input embeddings. It only
removes terms that ask the model to predict the system and user turns.

With logits at input position $t$ predicting token $t+1$, align `logits[:, :-1]`
with `labels[:, 1:]`. Set labels outside the assistant response to `-100` for
PyTorch's ignored cross-entropy targets. It is easy to make a mask look correct
while shifting it against the wrong logits. Inspect a token table and check the
first trained prediction and the last one, not merely the total number of ones.

```python norun
logits = model(input_ids, attention_mask=attention_mask).logits
loss_sum = F.cross_entropy(
    logits[:, :-1].reshape(-1, logits.size(-1)),
    labels[:, 1:].reshape(-1), ignore_index=-100, reduction="sum",
)
target_count = (labels[:, 1:] != -100).sum()
loss = loss_sum / target_count
```

The assistant header is conditioning context in this lab; the answer and
`<|im_end|>` are targets. Training the end marker is how the objective tells the
model to stop. If the marker is absent from every target, the objective supplies
no direct instruction to emit it. A model may nevertheless stop through behaviour
already present in its checkpoint; that is different from teaching stopping in
this run.

::: figure id=fig-09-3
Input tokens, next-token targets and assistant loss masking. The prompt and
assistant header remain visible as context, while the reply and its end marker
carry loss. A compact example highlights the shift between a logit's input
position and the token it predicts; padding contributes no target.
:::

### Count targets, not padded positions

Long replies contribute more terms to a token-mean loss than short ones.
A per-conversation mean followed by a batch mean gives equal conversation weight
instead. These objectives differ. Either can be chosen deliberately, but the
normalisation should be specified alongside the data mixture.

::: worked title="A gradient-accumulation weighting error"
One micro-batch has 10 target tokens and summed loss 20. Another has 90 target
tokens and summed loss 90. Their combined token-mean loss is
$(20+90)/(10+90)=1.10$.

Averaging the micro-batch means gives $(2.0+1.0)/2=1.50$. It overweights the short,
high-loss micro-batch. For token-weighted accumulation, sum the losses and divide
by the total target count over the accumulated update. Distributed training needs
the same accounting across workers, with the framework's gradient averaging
taken into account.
:::

In the QUICK training set, $9.929\%$ of shifted positions carry assistant loss.
The other positions still cost forward computation. This is why a budget based
only on response tokens can substantially undercount SFT training work. Lab 1
prints a complete token table to make that fraction reproducible.

Padding and packing address a different inefficiency. Suppose three conversations
have lengths 700, 900 and 400. Padding each to 2,048 uses $3\times2{,}048=6{,}144$
slots for 2,000 real tokens: $67.4\%$ of slots are padding. Packing all three
into one row uses 2,048 slots, of which only 48 are unused. To preserve independent
conversation training, block attention across boundaries and restart position
IDs for each conversation. Simple concatenation with one causal mask allows
later conversations to use earlier ones as context and changes the experiment.

A ceiling calculation for 1,000 conversations averaging 300 tokens gives
$\lceil300{,}000/2{,}048\rceil=147$ packed rows, compared with 1,000 padded rows.
This assumes the packing arrangement achieves the aggregate bound. Actual bins,
length limits and unbroken-conversation constraints can leave more unused space.
Measure the processed slots rather than treating this bound as the achieved
throughput improvement.

### Optimise and evaluate the behaviour

Learning rate, epochs, batch size and context length depend on the starting point
and the data. Values such as $10^{-5}$ for full-weight updates or $10^{-4}$ for
adapters are initial experimental choices, not universal settings. Lab 1 uses a
higher full-weight rate on a small checkpoint and a short synthetic task. A run
with 9,600 conversations, batch size 64 and three epochs has 450 updates; a
$3\%$ warmup would occupy about 14. Rounding warmup for a 15-step toy run is a
different regime.

Held-out loss should be summed and divided by the number of held-out assistant
targets, even when an ablation trains on all conversation tokens. Also track the
behavioural metrics: stopping, exact answers, parse rate and the task checker.
The QUICK run reduces held-out assistant loss from about 7.26 to 0.19 nats/token
and reaches $100\%$ stopping, but exact answers reach only $66\%$. Extraction
passes all ten held-out items; the limit-check family passes five. A good aggregate
loss can coexist with a failure concentrated on a particular computation.

### What the targets do not guarantee

SFT uses **teacher forcing**: each target token is conditioned on the correct
earlier response tokens. At generation time, an error becomes part of the next
prefix. [Module 04](module_04_EN.html#s10) explains this difference. Training on
the model's own samples in later stages exposes another distribution, but does
not eliminate all compounding errors.

Similarly, a fact in a demonstration may be memorised without being used
reliably outside that wording. Narrow fine-tuning can encourage unsupported
specifics and erode general behaviour. Evaluate knowledge, abstention and
general tasks separately. Prefer retrieval or continued pretraining when the
problem is missing information, and demonstrations when the problem is how the
assistant uses information it has. This is a design distinction to test, not a
claim that gradient updates can only alter style.

::: check
Does masking user-token labels prevent gradients from flowing through the user's
prompt representations?
:::

::: answer
No. The prompt still conditions every assistant prediction. Its target terms
are ignored, but assistant loss can backpropagate through the prompt's effect on
the model. Loss masking selects predictions; it is not an attention mask or a
gradient stop.
:::

## LoRA and QLoRA {#s4}

Full-weight fine-tuning stores more than model weights. Under the mixed-precision
accounting used in [Module 08](module_08_EN.html#s8), each trained parameter has
2 bytes of bf16 weights, 2 of gradients, 4 of fp32 master weights and two 4-byte
Adam moments. That is 16 bytes before activations, temporary workspaces and output
logits. For the case-study model, $16\times9{,}550{,}729{,}216=152.812$ GB of
model states cannot fit on one 80 GB accelerator.

Memory here is in decimal GB, $10^9$ bytes. Capacity and usable memory must be read
from the actual device and allocator; product labels do not establish an exact
usable-byte budget. In particular, some advertised GB values correspond to GiB.
The calculated subtotal is not a measurement of the framework's peak memory.

### Learn a low-rank change

For a frozen projection $\mathbf{W}\in\mathbb{R}^{d\times k}$, **LoRA** learns
two factors $\mathbf{A}\in\mathbb{R}^{r\times k}$ and
$\mathbf{B}\in\mathbb{R}^{d\times r}$, with $r$ much smaller than $d$ or $k$:

$$
\mathbf{W}'=\mathbf{W}+s\mathbf{B}\mathbf{A},\qquad s=\frac{\alpha}{r},
\qquad
\mathbf{h}=\mathbf{W}\mathbf{x}+s\mathbf{B}(\mathbf{A}\mathbf{x}).
$$

The update has rank at most $r$. During training, compute the narrow intermediate
$\mathbf{A}\mathbf{x}$ and then apply $\mathbf{B}$; do not form the large
product merely to do every forward pass. The optimiser tracks only the factors.
Low-rank updates are a restriction on the trainable change, not a statement that
the complete adapted matrix has low rank.

[Hu et al.](https://arxiv.org/abs/2106.09685) introduced this parameterisation
and investigated low-rank adaptation of large language models. Their GPT-3
comparison reported large trainable-parameter and memory reductions under its
particular adapter configuration. The reduction factor for this module follows
from the actual projections adapted below, rather than borrowing that paper's
factor for a different model.

Initialise $\mathbf{A}$ randomly and $\mathbf{B}=\mathbf{0}$. The added path is
then zero, so the adapter starts at exactly the frozen function. With
$\mathbf{g}=\partial\mathcal{L}/\partial\mathbf{h}$, the two gradients are

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{B}}
=s\mathbf{g}(\mathbf{A}\mathbf{x})^\top,
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{A}}
=s\mathbf{B}^\top\mathbf{g}\mathbf{x}^\top.
$$

At initialisation, the second is zero while the first can move $\mathbf{B}$.
After that move, $\mathbf{A}$ can also receive a gradient. Setting *both* factors
to zero would make both gradients zero indefinitely. Setting only $\mathbf{A}$
to zero and $\mathbf{B}$ random reverses which factor learns first; the chosen
initialisation is conventional, not the only way to start from a zero update.

The scale $\alpha/r$ is a hyperparameter convention. It does not guarantee
identical update sizes, optimisation dynamics or learning rates at different
ranks. Rank-stabilised LoRA uses $\alpha/\sqrt r$ instead. When comparing ranks,
state the scaling rule and evaluate the result. Changing rank, scaling and the
learning rate together makes it impossible to attribute an improvement to rank.

::: figure id=fig-09-5
The frozen projection and the trainable low-rank path sum to the adapted output.
The narrow factors are multiplied into the input during training. At release,
their product can be added to the base weight; the merged linear layer no longer
needs the separate adapter path.
:::

### Count the parameters that actually train

A projection adds $r(d+k)$ parameters. For one $4{,}096\times4{,}096$ matrix
at rank 64, this is $64(4{,}096+4{,}096)=524{,}288$, against 16,777,216 frozen
weights: $3.125\%$. Rectangular key/value and FFN projections have different
counts. Adapting all seven block projections therefore needs a sum over their
actual input and output dimensions.

::: worked title="All seven projections in the 9.5B case study"
Each layer has query and output terms $8{,}192r$ each, key and value terms
$5{,}120r$ each, and three SwiGLU terms $19{,}456r$ each. The sum is

$$
r\left(2\times8{,}192+2\times5{,}120+3\times19{,}456\right)=84{,}992r.
$$

Across 36 layers at rank 64, the adapter has
$36\times84{,}992\times64=195{,}821{,}568$ parameters. This is about $2.05\%$
of the 9,550,729,216-parameter base. Its 16-byte training state is 3.133 GB.
Attention-only adapters and adapters including the FFN are different experiments;
the count and result must say which was used.
:::

Lab 2 wraps 210 projections in the 135M checkpoint and trains 2,442,240 adapter
parameters. Its printed total of 136,957,248 **includes** the added adapter;
the frozen base has 134,515,008. The two fp32 Adam moments occupy 19.54 MB for
the factors, versus 1,076.12 MB for the full base. Those are optimiser moments
alone; weights, gradients and activations are additional.

Frozen embeddings need separate attention. If template rows need training,
ordinary projection-only LoRA leaves them unchanged. Initialise distinct rows
before freezing, add explicitly trainable row deltas, or use a checkpoint whose
template tokens are already trained. In a tied embedding/head, any row update
must affect both lookup and output projection consistently. The case study has
*untied* tables, so it must handle both sets of rows explicitly.

### Memory savings do not remove the frozen computation

Recall the [Module 06 FLOP convention](module_06_EN.html#s11). Let
$N_{\mathrm{matmul}}=N-Vd$ exclude the arithmetic-free input lookup. The
case-study value is 8,927,875,072. Forward matrix work costs
$2N_{\mathrm{matmul}}$ FLOPs per token. At a causal sequence length $T$, the
module's attention convention adds an average $2LTd$ per forward token.
Full training costs $6N_{\mathrm{matmul}}+6LTd$; projection-only LoRA skips
the frozen weights' gradient matmuls, giving approximately
$4N_{\mathrm{matmul}}+6LTd$, before the small adapter overhead.

At $T=8{,}192$, these are $6.08\times10^{10}$ and
$4.30\times10^{10}$ FLOPs per token. LoRA saves about $29\%$ of this arithmetic,
not $98\%$. Input activations still need gradients through frozen projections,
and attention retains its backward computation. The estimate assumes the
relevant frozen paths carry activation gradients. Freezing also the input
embedding can omit an early input-gradient computation; rank overhead, fused
kernels and recomputation further affect actual step time.

Full checkpointing gives the case-study activation subtotal of 3.61 GB for one
8,192-token sequence. This includes stored layer inputs and one recomputed layer
under Module 08's formula. A materialised fp32 vocabulary-logit tensor would add
$8{,}192\times152{,}064\times4=4.983$ GB. Chunking the loss can avoid holding
that entire tensor; a memory estimate that relies on chunking must state it.

::: worked title="Three memory budgets with the same activation assumption"
Full fine-tuning needs $152.812+3.607=156.419$ GB before extra buffers.
Rank-64 LoRA needs $19.101+3.133+3.607=25.841$ GB with a bf16 frozen base.
QLoRA's corresponding base estimate is 6.776 GB, giving
$6.776+3.133+3.607=13.516$ GB. These estimates assume chunked loss and one
sequence; they are not measured peaks or guarantees of fitting a particular GPU.
:::

::: figure id=fig-09-6
Computed memory subtotals for full fine-tuning, rank-64 LoRA and QLoRA under the
same one-sequence, full-checkpointing assumption. Model states and activations
are shown separately. Capacity lines are reference labels, while temporary
buffers, allocator effects and a full vocabulary-logit tensor are excluded.
:::

### Quantise the frozen base, train the adapter

**QLoRA** keeps the base quantised while training high-precision adapters.
[Dettmers et al.](https://arxiv.org/abs/2305.14314) combined 4-bit NormalFloat
(NF4), quantisation of scale metadata and paged optimisers, demonstrating
fine-tuning of a 65B model on one 48 GB GPU under that setup. The adapter's
gradients remain ordinary floating-point gradients. The base is dequantised for
matrix computation; it is not trained by differentiating through discrete
4-bit codes.

NF4 uses 16 nonuniform levels intended for approximately normal weight
distributions. A block has an absolute-maximum scale. Divide by the scale, choose
the nearest level and multiply by the scale again for an approximate weight.
Quantising the scales reduces metadata overhead. For the case-study estimate,
use about 4.127 bits per block weight after double quantisation. Keep the large
embedding and output tables in bf16: quantising every parameter at exactly four
bits would give a different and unjustified memory subtotal.

For a small block with scale 0.031, a weight $-0.027$ normalises to about
$-0.871$. The nearby NF4 levels include roughly $-1$ and $-0.696$, so its
nearest representation becomes about $-0.031$. Nonuniform quantisation can do
worse on this particular value than a uniform grid. Its distributional
motivation does not imply it wins on every block. [Module 10](module_10_EN.html)
develops quantisation and the evaluation of its errors in more detail.

### Merge the result and test again

After training, add $s\mathbf{B}\mathbf{A}$ to the floating-point base matrix.
The resulting linear layer represents the same real-arithmetic function. In
Lab 2, the largest probe-logit difference is about $1.04\times10^{-4}$ because
the merged and unmerged computations round differently. All 50 decoded
evaluation responses match. Exact real-arithmetic merging does not justify
assuming identical outputs for every floating-point prompt.

Keep separate adapters when several behaviours share a base, or merge when one
artifact is required. If the base is quantised, dequantise-add-requantise
introduces another approximation. Prefer merging into the appropriate
floating-point checkpoint and then quantising for release, followed by another
evaluation. The frozen base revision is part of the adapter's identity: an
adapter applied to a different base is not the trained model.

Full fine-tuning, LoRA and QLoRA trade memory, optimisation freedom and arithmetic
overhead differently. A small rank may underfit a substantial change; a larger
rank can still forget useful behaviour. The main lab's rank-8 run reaches $58\%$
exact match, with $100\%$ stopping, on its own synthetic held-out set. Its data
and update budget differ from QUICK full SFT, so the two numbers are not a fair
ranking of the methods. Use matched data, budgets and repeated seeds to make
that comparison.

::: check
Why can a tiny fraction of trainable parameters produce only a modest reduction
in LoRA step time?
:::

::: answer
The forward pass still reads the frozen weights, and activation gradients still
pass through their projections. Only their weight-gradient computation is
removed; attention backward, adapter work and any checkpoint recomputation
remain. Optimiser memory savings and arithmetic savings are different quantities.
:::
