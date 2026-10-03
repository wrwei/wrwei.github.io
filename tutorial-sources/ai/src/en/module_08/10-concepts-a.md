## What pretraining is, and the budget first {#s1}

A **base model** is a decoder-only transformer trained to minimise the next-token cross-entropy on
as much text as can be gathered and afforded:

$$
\mathcal{L}(\theta) = -\frac{1}{|\mathcal{D}|}\sum_{\text{docs}}\sum_{t}\log p_\theta(x_t \mid x_{<t}),
$$

where $|\mathcal{D}|$ is the number of training tokens and the documents reach the model packed end
to end into fixed-length sequences ([Section 4](#s4)). The loss is measured in nats per token and
its exponential is the perplexity; [Module 07, Section 1](module_07_EN.html#s1) explains what the
objective means and why so much follows from it. **Pretraining** is the run that minimises it.
There are no labels, no tasks and no instructions. The result is a model of text, not an
assistant: [Module 09](module_09_EN.html) turns it into one.

### Decisions come first

A pretraining run pursues that single objective for weeks under a **compute budget** fixed in
advance. Almost every decision is made before the run starts, because a restarted run has spent
its budget for nothing. This module is the list of those decisions:

| Decision | Settled by | Section |
|---|---|---|
| Budget: compute, model size $N$, training tokens $D$ | the FLOP rule and the scaling law | [1](#s1) |
| Data: sources, filters, deduplication, mixture, tokenizer, packing | small ablations and proxy runs | [2](#s2)–[4](#s4) |
| Architecture: layers, width, heads, experts | precedent and the parameter count | [5](#s5) |
| Optimiser, learning rate, schedule, batch size | small sweeps and published recipes | [6](#s6) |
| Precision and stabilisers | the failure each one prevents | [7](#s7) |
| Memory and parallel layout | arithmetic first, then measurement | [8](#s8)–[10](#s10) |
| Checkpointing and monitoring | the failure rate of the cluster | [11](#s11) |
| Evaluation during the run | benchmark noise and the scaling-law check | [12](#s12) |
| Small runs, mid-training, continued pretraining | the same pipeline at a fraction of the budget | [13](#s13), [14](#s14) |

Figure 8.1 draws the same decisions as the pipeline they configure.

::: figure id=fig-08-1
The pretraining run as a pipeline, left to right: raw sources (web crawl, code, books, papers),
extraction, language identification, quality filters, deduplication, decontamination, mixture,
tokenizer, packed shards, the training loop (model, optimiser, parallel layout), checkpoints,
evaluation and the base model. Under each stage, the section of this module that covers it
(Sections 2 to 12). A dashed arrow returns from evaluation to the data and the recipe, labelled
"proxy runs decide, the big run executes".
:::

### The running case study

The series follows one hypothetical case from [Module 07](module_07_EN.html) onwards: an
engineering team adapts an open-weight bilingual English–Chinese model, released as base and
instruct checkpoints, to draft and check safety-case arguments for the pressure-relief system of a
reactor vessel. The model has $L = 36$ layers, width $d = 4{,}096$, 32 query heads and 8 KV heads of
dimension 128, a SwiGLU feed-forward network of width $d_{\text{ff}} = 15{,}360$ and a vocabulary of
$V = 152{,}064$ with untied embeddings: $N = 9{,}550{,}729{,}216$ parameters, counted in
[Section 5](#s5). Prose calls it the 9.5B model and arithmetic uses $9.55 \times 10^9$; the quick
table below rounds it to 9.5B, which is 0.5% low. It is a worked case to follow, not anyone's plan
or product.

This module uses it twice. First, as the example of how such a base is made: a 2T-token plan on 80
H100 GPUs, worked through this section and Sections 4 to 11 (budget, mixture, shape, schedule,
memory, layout, failures). The team will never run that plan, but it needs it to judge the base it
adopts: its tokenizer, its data, its context length, the failures its makers had to manage.
Second, the team's own decision, costed in [Section 14](#s14): whether to continue pretraining the
base on 2B tokens of safety-engineering text (1.8B of domain text plus 0.2B of general replay,
1,907 steps), gated by baseline measurements and a go/no-go rule fixed in advance.
[Module 09](module_09_EN.html) post-trains from the result (the continued-pretraining checkpoint if
it is kept, otherwise the instruct release) and [Module 10](module_10_EN.html) serves the merged,
quantised model.

### The FLOP rule

[Module 06, Section 11](module_06_EN.html#s11) derives the series' FLOP count; it is recalled here,
not re-derived. A weight used in a matrix multiply costs 2 FLOPs per token in the forward pass (a
multiply and an add), and the backward pass costs twice the forward, hence the familiar
$C \approx 6ND$. The series counts more precisely. The input embedding is a lookup, so the forward
pass costs $2N_{\text{matmul}}$ per token with $N_{\text{matmul}} = N - Vd$. Attention adds $4Ldt$
for a token at context position $t$, which averages to $2LdT$ over a causal sequence of length $T$.
Training costs three times the forward pass, so a run on $D$ tokens costs

$$
C = \big(6N_{\text{matmul}} + 6LTd\big)\,D .
$$

Every compute figure for the case study in this module uses this rule. Memory
([Section 8](#s8)) counts all $N$ parameters, and so does the Chinchilla law, whose own accounting
is $C = 6ND$ over all parameters with no attention term. The shortcut $6ND$ appears elsewhere only
labelled as an estimate.

::: worked title="The case study's FLOPs per token"
The input embedding has $Vd = 152{,}064 \times 4{,}096 = 622{,}854{,}144$ parameters, so

$$
N_{\text{matmul}} = 9{,}550{,}729{,}216 - 622{,}854{,}144 = 8{,}927{,}875{,}072 .
$$

- Forward pass, weights: $2N_{\text{matmul}} = 1.79 \times 10^{10}$ FLOPs per token.
- Training, weights: $6N_{\text{matmul}} = 5.36 \times 10^{10}$.
- Training, causal attention at $T = 8{,}192$: $6LTd = 6 \times 36 \times 8{,}192 \times 4{,}096 = 7.25 \times 10^{9}$,
  13.5% on top of the weights (6.8% at $T = 4{,}096$, because the term is linear in $T$).
- Total: $5.36 \times 10^{10} + 0.725 \times 10^{10} = 6.08 \times 10^{10}$ FLOPs per training token.

The shortcut $6N$ over all $9.55 \times 10^9$ parameters gives $5.73 \times 10^{10}$: 7% above the
weight term, because it charges for the free embedding lookup, and 6% below the total, because it
leaves out attention. At $T = 131{,}072$ the attention term is $1.16 \times 10^{11}$, 2.2 times the
weight term, so a long-context token costs $(5.36 + 11.6)/6.08 = 2.8$ times an 8k-context token;
[Section 14](#s14) uses this when the context is extended.
:::

Conventions also differ between papers. PaLM's definition of utilisation (Chowdhery et al. 2023)
charges $6N + 12LTd$ per training token: attention over the full $T \times T$ square, without the
causal halving. A utilisation figure must therefore say which count it used.

### From FLOPs to calendar days

$$
\text{GPU-hours} = \frac{C}{\text{peak} \times \text{MFU} \times 3{,}600}
$$

The **peak** is the vendor's dense bf16 tensor-core throughput: 989 TFLOP/s for an H100 SXM, the
series' assumed peak as of 2026. The datasheet's doubled "with sparsity" figure never applies to
dense training. **Model FLOPs utilisation (MFU)** is the model FLOPs achieved per second divided by
the peak; 35–45% is good at scale, and the rest is lost to communication, memory traffic and gaps
between kernels. At 40%, $0.40 \times 989 = 396$ TFLOP/s, rounded to $4 \times 10^{14}$ FLOP/s
sustained per H100: the assumption Modules 07 to 09 share. **Hardware FLOPs utilisation (HFU)**
also counts the forward passes recomputed under activation checkpointing ([Section 8](#s8)), so it
is higher for the same run. MFU is the figure to quote and compare.

::: worked title="A quick budget table, with the shortcut throughout"
A first pass uses $C = 6ND$ with $N$ rounded to 9.5B and no attention term, at
$4 \times 10^{14}$ FLOP/s per H100, so GPU-hours $= C/(4 \times 10^{14} \times 3{,}600)$:

| Run | $C = 6ND$ (FLOPs) | H100-hours | Calendar time |
|---|---|---|---|
| 9.5B on 190B tokens (20 per parameter) | $6 \times 9.5 \times 10^{9} \times 1.9 \times 10^{11} = 1.08 \times 10^{22}$ | 7,521 | 470 h = 19.6 days on 16 GPUs |
| 9.5B on 2T tokens | $1.14 \times 10^{23}$ | 79,167 | 41.2 days on 80 GPUs |
| 9.5B on 15T tokens | $8.55 \times 10^{23}$ | 593,750 | 309 days, about 10 months, on 80 GPUs |
| 1B on 20B tokens | $1.2 \times 10^{20}$ | 83 | 21 h on 4 GPUs: a weekend |
| 9.5B, continued pretraining on 2B | $1.14 \times 10^{20}$ | 79 | 9.9 h on 8 GPUs |

The compute-optimal row needs under three weeks on 16 GPUs, not a month; the 2T row is the plan
this module works through, and the last row is the team's own decision.
:::

::: worked title="The 2T-token plan under the series' rule"
$C = 6.08 \times 10^{10} \times 2 \times 10^{12} = 1.22 \times 10^{23}$ FLOPs. At
$4 \times 10^{14}$ FLOP/s that is $1.22 \times 10^{23}/(4 \times 10^{14} \times 3{,}600) = 84{,}465$
GPU-hours; on 80 GPUs, $84{,}465/80 = 1{,}056$ hours, or 44.0 days. With $6N$ over all parameters
and no attention the same run is $1.15 \times 10^{23}$ FLOPs and 41.5 days (41.2 with $N$ rounded to
9.5B, as in the quick table). At the exact peak, 40% of 989 TFLOP/s gives 85,405 GPU-hours and 44.5
days; at 30% MFU the run takes 59.3 days. MFU is a calendar quantity: the model and the data fix
the FLOPs, and MFU decides how long they take.
:::

From here on the text uses the series' figures for the case study and says so. The arithmetic is
why nobody outside a handful of organisations pretrains a competitive model from scratch, and why
the rest of this module matters anyway: continued pretraining is the same pipeline at about a
thousandth of the budget (84.5 GPU-hours for the case study, [Section 14](#s14)), and understanding
the full run is what makes the small one sensible.

### Compute-optimal or over-trained

[Module 07, Sections 4 and 5](module_07_EN.html#s4) derive the compute-optimal allocation and the
over-training break-even; here they are applied. The Chinchilla fit (Hoffmann et al. 2022) is
written in this module with its numbers, so that $B$ always means a batch:

$$
L(N, D) = 1.69 + \frac{406.4}{N^{0.34}} + \frac{410.7}{D^{0.28}} \quad \text{nats per token}.
$$

About 20 tokens per parameter gives the lowest loss per training FLOP by the paper's first two
estimation methods, while the fitted law's own minimum sits at 40–80 tokens per parameter for
$C = 10^{20}$ to $10^{23}$. Over-training, at 100–2,000 tokens per parameter, pays when inference
dominates, because the lifetime cost is

$$
C_{\text{life}} = 6ND_{\text{train}} + 2ND_{\text{served}},
$$

and a smaller model pays less on every token it serves. The fit has two limits: its constants
belong to one corpus and one tokenizer, and it was fitted on 70M to 16B parameters trained on 5B to
500B tokens. Figure 8.2 shows how flat it is near its minimum.

::: figure id=fig-08-2
Iso-FLOP curves of the Chinchilla fit: predicted loss against parameters $N$ (log scale, $10^8$ to
$10^{11}$) for $C = 10^{20}$, $10^{21}$, $10^{22}$ and $10^{23}$ FLOPs counted as $6ND$, one curve
each. Each curve carries two markers: the 20-tokens-per-parameter point (0.91B, 2.89B, 9.13B and
28.9B parameters) and the fitted law's minimum (0.64B, 1.82B, 5.16B and 14.6B). The case study
trained on 190B, 2T and 15T tokens appears as three labelled dots at 9.55B parameters
($L = 2.140$, 2.002 and 1.938). Near each minimum the curves are flat: at
$C = 1.15 \times 10^{23}$, halving or doubling $N$ from the minimum raises the predicted loss by
only 0.007 nats.
:::

::: worked title="The compute decision at the case study's budget"
In Chinchilla's accounting the budget is
$C = 6ND = 6 \times 9.55 \times 10^{9} \times 2 \times 10^{12} = 1.146 \times 10^{23}$ FLOPs. Three
ways to spend it:

- The fitted law's minimum ([Module 07, Section 4](module_07_EN.html#s4)):
  $N^\ast = 1.345\,(C/6)^{0.452} = 15.5\text{B}$ and $D^\ast = C/(6N^\ast) = 1.23\text{T}$, so
  $L = 1.69 + 0.139 + 0.169 = 1.999$.
- 20 tokens per parameter: $C = 6N \times 20N = 120N^2$, so $N = \sqrt{C/120} = 30.9\text{B}$ and
  $D = 618\text{B}$, with $L = 1.69 + 0.110 + 0.205 = 2.005$.
- The case study: $N = 9.55\text{B}$ and $D = 2\text{T}$, with $L = 1.69 + 0.164 + 0.148 = 2.002$.

The three predictions lie within 0.007 nats of each other. The smallest model is chosen because it
serves every token for $2N$ FLOPs, 1.6 times fewer than the 15.5B model and 3.2 times fewer than
the 30.9B one.

The extra training is repaid by that cheaper serving. The compute-optimal model with the same
predicted loss has 15.0B parameters trained on 1.18T tokens, $C' = 1.065 \times 10^{23}$, 7% less
than $1.146 \times 10^{23}$. It costs $2 \times (15.0 - 9.55) \times 10^{9} = 1.09 \times 10^{10}$
more FLOPs per served token, so the break-even is

$$
\frac{(1.146 - 1.065) \times 10^{23}}{1.09 \times 10^{10}} = 7.4 \times 10^{11} \ \text{served tokens}.
$$

At the team's own 12M tokens a day ([Module 07, Section 14](module_07_EN.html#s14): 2,000 requests
of 4,000 input and 2,000 output tokens) that takes 62,000 days, about 170 years; at $10^{10}$ tokens
a day it takes 74 days. The comparison is indicative only: 2T tokens lies outside the 5B–500B range
the law was fitted on.
:::

Over-training is repaid over every token a base serves for all its users, not over one team's
workload. It is therefore the base producer's decision, and one reason a team adopts an
over-trained open base rather than training its own.

The plan is set at 2T tokens, about 209 per parameter, for three reasons. Its 84,500 H100-hours
cost about USD 211,000 of GPU time at the series' assumed USD 2.50 per GPU-hour (an assumption, as
of 2026, which leaves out ablations, failed runs and staff): a budget a well-funded organisation
could commit. It sits in the over-trained regime that makes a small model worth serving. And the
15T row shows the scale at which the strongest open models of this size are trained: Llama 3's 8B
model saw about 15T tokens.

::: widget name=compute-budget-planner
The planner opens on the case study: 9.55B parameters, 2T tokens, 80 H100s at 40% MFU, 44.5 days at
the exact peak. Untick the series' rule to see the quick $6ND$ estimate; press "Set N, D to the
fitted law's minimum" and watch the predicted loss fall by only 0.003 nats while the model, and
with it the cost of every served token, grows by 60%; then drag MFU down to 30% and watch the
calendar stretch to 59 days.
:::

::: check
What does the shortcut $6ND$ get wrong for the case study at $T = 8{,}192$?
:::

::: answer
It charges for the input embedding, a lookup that costs no FLOPs, which makes it 7% high on the
weight term, and it leaves out causal attention, $6LTd$ per token, 13.5% of the weight term. Net, it
is 6% low: $5.73 \times 10^{10}$ against $6.08 \times 10^{10}$ FLOPs per token.
:::

::: check
A team reports 55% MFU with activation recomputation counted in the FLOPs. Is it comparable with
another team's 45% MFU?
:::

::: answer
No. Counting recomputed FLOPs makes it HFU, inflated by up to a third: one extra forward pass on top
of the three forward-pass costs the model needs. With full recomputation, 55% HFU is
$55\% \times 3/4 = 41\%$ MFU. Recompute it from model FLOPs only before comparing.
:::

::: check
A 15B model trained on 1.18T tokens would match the case study's predicted loss for 7% less
training compute. Why is the base trained at 9.55B on 2T tokens?
:::

::: answer
Every served token costs $2N$ FLOPs, so the smaller model is cheaper for its whole working life. The
extra training is repaid after about $7.4 \times 10^{11}$ served tokens: quickly for a base that
many users serve, never on one team's 12M tokens a day.
:::

## Data I: sources, extraction, language and quality filters {#s2}

Data quality is the largest lever after scale, and the data pipeline is most of the engineering of
a pretraining run. This section and the next two follow the pipeline of Figure 8.1 from raw text to
training sequences. Every stage is a rule with a threshold, and every rule removes some text it
should have kept, so each is given here with its threshold and what it wrongly removes. Figure 8.3
shows the stages as a funnel.

::: figure id=fig-08-3
A filtering funnel drawn as stacked horizontal bars that shrink stage by stage: URL filter, text
extraction, language identification, heuristic rules, deduplication and quality classifier. The
proportions are illustrative and carry no counts; a side note gives the one published pair used in
the text, FineWeb (about 15T tokens) and FineWeb-Edu (about 1.3T). Beside each stage, one example
of what it removes: an adult-site URL, a cookie banner, a French page in an English corpus, a
navigation bar, a mirrored page, keyword spam.
:::

### Sources and the manifest

**Common Crawl** is the base of nearly every web corpus: a public crawl released as snapshots,
roughly monthly, each of billions of pages. A snapshot comes as WARC files, which hold the raw HTTP
responses, and WET files, which hold Common Crawl's own plain-text extraction of them. To the web a
corpus adds code repositories, books, academic papers, reference works and forums. For a bilingual
model like the case study's it adds the Chinese web, Chinese books and Chinese academic text, in
proportion to the use the model is for.

Licensing and consent are unsettled and vary by jurisdiction. Opt-outs in robots.txt are honoured
at crawl time. The **corpus manifest** records, for every component, the source, the snapshot or
date, the licence, the filters applied and the token count. It is the minimum record: without it
nobody can later say what a model was trained on, or rebuild the corpus without a component that
turned out to be bad.

### Extraction and encoding

A web page is mostly not prose: navigation, cookie banners, footers, repeated headers. Extractors
built for the purpose (trafilatura and its kind) locate the main text in the HTML. Running one on
the WARC HTML, rather than taking the WET text, pays: the FineWeb authors trained small models on
both and found that this choice alone gave better models.

Encoding repair belongs here too. UTF-8 text mis-decoded as Windows-1252 turns an em dash into
`â€”`. This **mojibake** survives every quality rule below, because the words around it are fine.
[Lab 1](#lab1) finds it in about 6% of the TinyStories stories, and [Lab 2](#lab2)'s model, trained
on them, learns to emit it.

### Language identification

A linear classifier over character $n$-gram features gives each document a score per language;
fastText's language-identification model (Joulin et al. 2017) is the common one. Documents whose
top score exceeds a threshold (0.65 in FineWeb's English pipeline) are kept, in the proportions
wanted. Character $n$-grams work because languages differ in their letter combinations within a few
words. The classifier fails on short texts, which have too few $n$-grams to decide; on code-mixed
text such as English–Chinese technical writing, which scores partly for each language and may clear
neither threshold; and on closely related languages and scripts.

### Heuristic quality filters

The Gopher rules (Rae et al. 2021) are cheap statistics over whitespace-separated words. A
document is removed if it breaks any of them:

- fewer than 50 or more than 100,000 words;
- a mean word length outside 3 to 10 characters;
- more than 0.1 hash symbols or ellipses per word;
- more than 90% of lines starting with a bullet, or more than 30% ending with an ellipsis;
- fewer than 80% of words containing an alphabetic character;
- fewer than two of the stop words *the, be, to, of, and, that, have, with*;
- repetition: more than 30% of lines, or of paragraphs, duplicated; more than 20%, 18% and 16% of
  characters in the most frequent 2-, 3- and 4-gram; more than 15% (for 5-grams) down to 10% (for
  10-grams) of characters in duplicated $n$-grams.

Each rule targets one kind of junk: the length rule fragments and dumps, the symbol rule tag
clouds, the bullet and ellipsis rules lists and teasers, the alphabetic rule tables of numbers, the
repetition rules templates and spam. The stop-word rule is the cheapest test for prose.

::: worked title="Three documents through the Gopher rules"
Document (a) is a maintenance note:

> The bearing on the pump shaft ran hot for three days before the alarm. Wear on the outer race
> had loosened the fit, and the extra play let the shaft vibrate. The maintenance team replaced the
> bearing and checked the alignment with a dial gauge. They also changed the inspection interval
> from six months to three, because the vibration log showed the fault had been growing for weeks.

Document (b) is the line `Home | About us | Contact | Privacy policy | Login | Cart` repeated on 5
lines. Document (c) is `BUY NOW!!! $$$ #deal CHEAP #sale watches FREE shipping >>>` repeated 8
times on one line. Counting whitespace-separated words, with punctuation left attached:

| Statistic | Limit | (a) | (b) | (c) |
|---|---|---|---|---|
| words | 50 to 100,000 | 68 | 5 × 13 = 65 | 8 × 10 = 80 |
| mean word length | 3 to 10 | 4.65 | 3.46 | 4.90 |
| hash symbols per word | at most 0.1 | 0 | 0 | 16/80 = 0.20, fails |
| words with a letter | at least 80% | 100% | 40/65 = 61.5%, fails | 64/80 = 80% |
| stop words present | at least 2 | 4 (and, the, to, with) | 0, fails | 0, fails |
| duplicated lines | at most 30% | 0 | 4/5 = 80%, fails | none (one line) |

(a) passes every rule. (b) passes the length rules because its 65 "words" include the 25 `|`
tokens, then fails three: letters, stop words and duplicated lines. (c) fails two, symbols and stop
words, and passes the letter rule at exactly 80%. Both junk pages also break the $n$-gram
repetition limits, since more than half of their characters lie in duplicated 5-grams against a
limit of 15%; that is how (c), a single line, would be caught even without its hashtags.
[Lab 1](#lab1) prints these statistics for the same three documents.
:::

C4's cleaning (Raffel et al. 2020) is the contrast: it works on lines. It keeps only lines that end
in terminal punctuation, drops any page that contains "lorem ipsum" or a curly bracket, and drops
pages containing any word from a blocklist of obscene words. The curly-bracket rule was aimed at
JavaScript left in web pages; it also removes almost all source code, which is why code needs a
pipeline of its own ([Exercise 5](#e5)).

Rules are language-specific. Word-based rules do not apply to Chinese, which has no spaces between
words, so whitespace splitting turns a Chinese paragraph into a few very long "words". A Chinese
component needs character-based equivalents (length in characters, the share of Chinese
characters, repeated character $n$-grams) and a Chinese stop-word list of common function words
such as 的 and 是.

### Model-based quality filters

A small classifier trained to separate reference-quality text from random web text scores every
document; the corpus is then thresholded on the score, or sampled with a probability that rises
with it. FineWeb-Edu (Penedo et al. 2024) is the documented public example. A large language model
rated about 450,000 web pages for educational value on a 0–5 scale; a small classifier on top of an
embedding model learned those ratings and then scored all of FineWeb, about 15T tokens. Keeping
scores of 3 and above left about 1.3T tokens, and models trained on it did better on knowledge and
reasoning benchmarks than models trained on the same number of FineWeb tokens. DCLM (Li et al.
2024) trained a fastText classifier for the same purpose, cheap enough to run over a whole crawl.

::: worked title="FineWeb-Edu in proportion"
$1.3\text{T}/15\text{T} = 0.087$: the classifier kept about 8.7% of the tokens, one in 11.5. A
2T-token run drawing only on FineWeb-Edu would see each of its tokens $2/1.3 = 1.5$ times on
average, inside the range where repetition costs little ([Section 4](#s4)); a 15T-token run would
see each 11.5 times, far outside it. A strict quality filter trades quantity for quality, and the
repetition limit decides how far that trade can go.
:::

The failure is narrowing. The classifier encodes its annotator's taste (encyclopaedic, formal,
English-centric), so text that is valuable but unlike its examples, such as maintenance logs, forum
troubleshooting threads, code comments and other languages, scores low and disappears.

### Personal data and safety

Regular expressions find e-mail addresses, phone numbers and IP addresses. They are replaced with
placeholder tokens such as `<EMAIL>` rather than deleted, so that the text stays fluent. Names are
hard to find reliably and are mostly left. Over-matching damages technical text: a version string
such as `10.2.0.1` looks like an IP address.

Safety filtering uses URL blocklists and classifiers, and blunt rules do damage of their own: Dodge
et al. (2021) found that C4's word blocklist disproportionately removed text written by and about
minority groups. Removing all harmful text also removes the model's ability to recognise it, which
post-training ([Module 09](module_09_EN.html)) relies on when it teaches the model to refuse.

### Order by cost, and keep the log

Run the cheap filters first (URL blocklists, language identification, heuristic rules) and the
expensive ones (model classifiers, near-duplicate detection) on what survives. Record why every
document was removed. That log is the debugging record when a later model turns out bad: it is how
a team discovers that a filter removed the domain it needed.

::: check
Why does the stop-word rule catch spam and navigation pages so cheaply?
:::

::: answer
Natural prose almost always contains at least two of the eight commonest English function words,
while menus, lists and keyword spam rarely do. The test is one set intersection over words that are
already split.
:::

::: check
A quality classifier trained to prefer Wikipedia-like text is applied to maintenance logs. What
happens, and what do you do?
:::

::: answer
Most logs score low and are removed, although they are exactly the domain text wanted. A quality
classifier encodes a style, so domain components get their own filters, or an exemption from the
classifier, and the removal log is checked for what each filter took.
:::

## Data II: deduplication and decontamination {#s3}

The web repeats itself. Pages are mirrored, syndicated, templated and copied from one another, and
the same licence text, boilerplate and news story appear thousands of times. Duplicates waste
compute, raise memorisation and verbatim regurgitation, and tilt the mixture toward whatever was
copied most. Two measurements give the size of the effect. Lee et al. (2022) found that models
trained on deduplicated C4 emit memorised text about ten times less often and reach the same or
better accuracy in fewer steps. Hernandez et al. (2022) found that repeating 0.1% of the data 100
times degraded an 800M-parameter model to the performance of one half its size, although 90% of
the training tokens stayed unique.

### Exact duplicates

Normalise each document (lower-case it, collapse whitespace), hash it (SHA-1, or any good 64-bit
hash), and keep the first occurrence of each hash. The same pass at line and paragraph level,
across documents, strips boilerplate repeated on thousands of pages: cookie notices, footers,
licence paragraphs. The fine-grained version works on substrings: a suffix array of the corpus
finds every span that occurs more than once, and Lee et al. removed repeated spans of 50 tokens or
more.

### Near-duplicates and Jaccard similarity

A page with a changed date, a different advertisement or a few edited words hashes differently. To
catch near-duplicates, represent each document by its set of **shingles**, the word $n$-grams it
contains (5-grams here), and measure the overlap of two sets with the **Jaccard similarity**

$$
J(A, B) = \frac{|A \cap B|}{|A \cup B|} .
$$

Computing $J$ for every pair is hopeless at web scale. MinHash estimates it from short signatures,
and banding avoids comparing most pairs at all (Figure 8.4).

::: figure id=fig-08-4
MinHash and banding in one picture. Two short documents become their sets of 5-word shingles, drawn
as overlapping circles with the intersection shaded and $J$ written beside them. Each set becomes a
128-slot signature, drawn as 16 bands of 8 cells. The bands in which the two signatures agree in all
8 cells are highlighted, which makes the documents a candidate pair, and the pair is then verified
with the exact Jaccard similarity.
:::

### MinHash, derived

Apply a random permutation $\pi$ to the universe of shingles and record, for each set, its
smallest permuted value. Then

$$
P\big[\min \pi(A) = \min \pi(B)\big] = J(A, B) .
$$

The proof is short. Consider the smallest element of $\pi(A \cup B)$. A random permutation favours
no element, so it is equally likely to be any of the $|A \cup B|$ elements of the union. If it lies
in $A \cap B$, it is the minimum of both sets and the two minima coincide. If it lies in only one
set, it is that set's minimum, and the other set's minimum is a different, larger value. So the
minima coincide exactly when the overall minimum lies in $A \cap B$, which happens with probability
$|A \cap B|/|A \cup B|$.

One permutation gives one coin flip that comes up heads with probability $J$. Take $k$ independent
permutations and let $h_i(A)$ be the minimum of $A$ under the $i$-th. The fraction of agreements

$$
\hat J = \frac{1}{k}\sum_{i=1}^{k} \mathbf{1}\big[h_i(A) = h_i(B)\big]
$$

is an unbiased estimate of $J$, because each indicator has mean $J$, and its variance is
$J(1 - J)/k$, because $k\hat J$ is binomial with $k$ trials. The $k$ minima form the document's
**signature**, computed once per document; comparing two documents then costs $k$ integer
comparisons, however long they are. In practice a cheap hash $h(x) = (ax + b) \bmod p$, with random
$a$ and $b$ and a large prime $p$, stands in for the random permutation. The method is Broder's
(1997) **MinHash**.

::: worked title="The precision of a 128-hash signature"
The standard error of $\hat J$ is $\sqrt{J(1 - J)/k}$:

- $J = 0.8$, $k = 128$: $\sqrt{0.8 \times 0.2/128} = \sqrt{0.00125} = 0.035$.
- $J = 0.5$, $k = 128$: $\sqrt{0.25/128} = 0.044$.
- $J = 0.8$, $k = 256$: $\sqrt{0.16/256} = 0.025$.

Halving the error takes four times the hashes. Two standard errors at $J = 0.8$ are $\pm 0.07$:
enough to tell 0.8 from 0.5, not 0.80 from 0.75. [Lab 1](#lab1) measures a mean absolute error of
about 0.03 against exact Jaccard with 128 hashes, which is what these standard errors predict (the
mean absolute error of a normal estimate is 0.8 standard errors).
:::

### LSH banding, derived

Signatures make each comparison cheap, but a billion documents still form $5 \times 10^{17}$ pairs.
**Locality-sensitive hashing (LSH)** compares only the pairs likely to be similar. Split the
$k = br$ signature into $b$ bands of $r$ rows and hash each band of each document to a bucket. Two
documents become a **candidate pair** if they share a bucket in some band, that is, if some band
agrees in all $r$ rows.

For a pair with similarity $s$, each row agrees with probability $s$, independently, so one band
agrees with probability $s^r$ and fails with probability $1 - s^r$. All $b$ bands fail with
probability $(1 - s^r)^b$, hence

$$
P(\text{candidate}) = 1 - (1 - s^r)^b ,
$$

an S-curve in $s$ (Figure 8.5). Its steepest point, where $d^2P/ds^2 = 0$, satisfies
$s^r = (r - 1)/(rb - 1)$, which is close to $1/b$ for practical $b$ and $r$. The threshold is
therefore about

$$
s^\ast \approx (1/b)^{1/r} ,
$$

and a pair exactly at the threshold becomes a candidate with probability
$1 - (1 - 1/b)^b \approx 1 - e^{-1} = 0.63$. More rows per band sharpen the curve and raise the
threshold; more bands lower it.

::: worked title="The S-curve for 16 bands of 8 rows"
With $k = 128$ split as $b = 16$ and $r = 8$, the threshold is $(1/16)^{1/8} = 0.71$. At $s = 0.5$
one band agrees with probability $0.5^8 = 0.0039$, all 16 fail with probability
$(1 - 0.0039)^{16} = 0.939$, so $P = 0.061$. The same steps at other similarities:

| $s$ | 0.3 | 0.5 | 0.6 | 0.7 | 0.75 | 0.8 | 0.85 | 0.9 |
|---|---|---|---|---|---|---|---|---|
| $P(\text{candidate})$ | 0.001 | 0.061 | 0.237 | 0.613 | 0.815 | 0.947 | 0.994 | 0.9999 |

FineWeb's $b = 14$, $r = 8$ (threshold 0.72) gives 0.053 at 0.5, 0.772 at 0.75 and 0.924 at 0.8. A
loose $b = 32$, $r = 4$ (threshold 0.42) makes 87% of pairs at $s = 0.5$ candidates, many more to
verify; a strict $b = 8$, $r = 16$ (threshold 0.88) catches only 20% of pairs at $s = 0.8$.
:::

The table takes a few lines to reproduce, and to extend to other choices of $b$ and $r$:

```python
def p_candidate(s, b, r):
    """Probability that a pair with Jaccard similarity s agrees in at least one band."""
    return 1 - (1 - s ** r) ** b


for b, r in [(16, 8), (14, 8), (32, 4), (8, 16)]:
    threshold = (1 / b) ** (1 / r)
    row = " ".join(f"{p_candidate(s, b, r):.3f}" for s in (0.5, 0.6, 0.7, 0.8, 0.9))
    print(f"b={b:2d} r={r:2d} threshold {threshold:.2f} | P at s=0.5..0.9: {row}")
```

```output
b=16 r= 8 threshold 0.71 | P at s=0.5..0.9: 0.061 0.237 0.613 0.947 1.000
b=14 r= 8 threshold 0.72 | P at s=0.5..0.9: 0.053 0.211 0.565 0.924 1.000
b=32 r= 4 threshold 0.42 | P at s=0.5..0.9: 0.873 0.988 1.000 1.000 1.000
b= 8 r=16 threshold 0.88 | P at s=0.5..0.9: 0.000 0.002 0.026 0.204 0.806
```

::: figure id=fig-08-5
LSH S-curves: the probability that a pair becomes a candidate (vertical axis, 0 to 1) against its
Jaccard similarity $s$ (horizontal axis, 0 to 1) for $(b, r) = (16, 8)$, $(14, 8)$, $(32, 4)$ and
$(8, 16)$, each with its threshold $(1/b)^{1/r}$ marked by a vertical tick (0.71, 0.72, 0.42 and
0.88). Lab 1's measured detection rates per similarity bin are drawn as points beside the
$(16, 8)$ curve.
:::

### Cost, verification and clusters

Comparing all pairs of $n$ documents takes $n(n - 1)/2$ comparisons. LSH hashes each document into
$b$ buckets, one per band, and compares only documents that share a bucket. Candidates are then
verified against a threshold, by exact Jaccard on the shingle sets or by the fraction of agreeing
signature entries; a false candidate costs verification time, not correctness. Verified pairs are
grouped into clusters with union-find, because near-duplication chains (A is near B, B is near C),
and one document per cluster is kept.

::: worked title="What banding saves"
$10^9$ documents form $10^9 \times (10^9 - 1)/2 \approx 5 \times 10^{17}$ pairs. With 16 bands, LSH
makes $16 \times 10^9 = 1.6 \times 10^{10}$ bucket insertions, each a hash of 8 integers, and
compares only the pairs that share a bucket. [Lab 1](#lab1)'s corpus of 6,400 documents has
$6{,}400 \times 6{,}399/2 = 20{,}476{,}800$ pairs, about 20.5 million, from which LSH proposes about
750 candidates.
:::

### What published pipelines chose

FineWeb used word 5-grams and 112 hashes in 14 bands of 8, aimed at pairs about 75% similar. It also
found that deduplicating each crawl snapshot separately trained better models than deduplicating
across all snapshots at once. In the older snapshots, global deduplication kept mainly the pages
that no other crawl contained, and those turned out to be of lower quality than the pages it
removed.

The size of an edit matters as much as the threshold. Replacing a fraction $q$ of the words at
random destroys every shingle that contains a replaced word, so a fraction $s = (1 - q)^n$ of the
$n$-word shingles survives. If each document has about $m$ shingles and they share $sm$, then
$J \approx sm/(2m - sm) = s/(2 - s)$. Longer shingles make near-copies look less similar.

::: worked title="From edit rate to Jaccard similarity"
With 5-word shingles, $q = 0.05$ (one word in twenty) gives $s = 0.95^5 = 0.774$ and
$J = 0.774/1.226 = 0.63$. The full range:

| $q$ | 0.01 | 0.03 | 0.05 | 0.08 | 0.12 | 0.20 |
|---|---|---|---|---|---|---|
| $s = (1 - q)^5$ | 0.951 | 0.859 | 0.774 | 0.659 | 0.528 | 0.328 |
| $J = s/(2 - s)$ | 0.91 | 0.75 | 0.63 | 0.49 | 0.36 | 0.20 |

A copy with one word in twenty changed is only 63% similar, and with 16 bands of 8 it becomes a
candidate about one time in three; with one word in eight changed ($J = 0.36$) it almost never
does. With 13-word shingles the same 5% edit gives $s = 0.95^{13} = 0.513$ and $J = 0.35$.
:::

### Decontamination

A benchmark measures nothing once its test items are in the training data, because the model can
recall answers instead of producing them. **Decontamination** removes training documents that share
long $n$-grams with any evaluation set you will report; GPT-3 (Brown et al. 2020) used 13-gram
overlap, long enough that a match is rarely chance. Do it before training, keep the list of what
was removed, and treat any public benchmark you did not decontaminate against as contaminated.
False positives come from common phrases, licence text and famous quotations, which match many
test sets. False negatives come from paraphrased or translated test items, which share no long
$n$-gram with the original: for a bilingual model like the case study's, an English test question
translated into Chinese passes every $n$-gram check. Reading a claim that may be contaminated is
[Module 07, Section 12](module_07_EN.html#s12)'s topic; contamination of post-training sets is
[Module 09](module_09_EN.html)'s.

::: check
Why is the MinHash collision probability exactly the Jaccard similarity?
:::

::: answer
The smallest hashed element of $A \cup B$ is equally likely to be any of its elements, and the two
minima agree exactly when that element lies in $A \cap B$.
:::

::: check
With $b = 16$ and $r = 8$, what fraction of pairs with true Jaccard 0.6 become candidates, and does
it matter?
:::

::: answer
About 24%: $1 - (1 - 0.6^8)^{16} = 0.237$. They cost verification time, not correctness, as long as
every candidate is verified against a threshold before anything is removed.
:::

::: check
Why decontaminate before training rather than drop the overlapping test items afterwards?
:::

::: answer
Dropping test items afterwards shrinks the test set and biases it toward whatever the crawl did not
contain. Decontaminating first keeps the full test set clean and leaves a record of what was
removed.
:::

## Data III: mixtures, multilingual balance, the tokenizer and packing {#s4}

After filtering and deduplication the corpus is a set of components, each with a count of unique
tokens. Three decisions turn it into training data: how much of each component to use, how to cut
text into tokens, and how to pack the tokens into sequences.

### The mixture

A **data mixture** is a set of weights $w_s$, one per source, summing to 1. In a run of $D$ tokens,
source $s$ contributes $w_s D$ tokens; if it holds $U_s$ unique tokens, it is seen $w_s D/U_s$
times. Proportions are chosen, not inherited from whatever the crawl happened to contain. Code
improves reasoning-like tasks even outside code; a few percent of reference text and textbooks
lifts the whole model; too much of any one source narrows it. Small high-quality sources are
therefore repeated on purpose, two to four times: Muennighoff et al. (2023) found that up to about
four epochs of repeated data are almost as good as fresh data, and that the value of further
repetition falls quickly.

::: worked title="A hypothetical 2T-token mixture for the case study"
Tokens in the run are $w_s \times 2\text{T}$, and epochs are tokens divided by unique tokens:

| Source | Unique tokens | Weight | Tokens in the run | Epochs |
|---|---|---|---|---|
| English web | 1,500B | 50% | 1,000B | 0.67 |
| Chinese web | 600B | 20% | 400B | 0.67 |
| Code | 400B | 15% | 300B | 0.75 |
| Academic papers | 80B | 6% | 120B | 1.5 |
| Books | 50B | 4% | 80B | 1.6 |
| Reference works | 20B | 2% | 40B | 2.0 |
| Mathematics | 30B | 3% | 60B | 2.0 |

The weights sum to 100% and the tokens to 2,000B. The web components are not even used up; the
four small curated sources get two to three times their natural share (reference works hold 0.75%
of the 2,680B unique tokens and get 2%) and are repeated, each below four epochs. The numbers are
illustrative, not any model's recipe.
:::

Mixtures are tuned on proxy runs: models of 100M to 1B parameters trained on candidate mixtures and
compared on held-out loss per domain and on a small benchmark battery. DoReMi (Xie et al. 2023)
learns the weights instead. A small proxy model is trained while the domain weights shift toward
the domains where its loss lags furthest behind a reference model's, and the weights it settles on
are used for the large run. Either way the mixture, or a staged schedule of mixtures, is then fixed
for the big run. The risk is that rankings found with proxies do not always transfer to the large
model.

### Multilingual balance

Languages are balanced by **temperature sampling**: sample language $l$ with probability

$$
p_l = \frac{q_l^{\alpha}}{\sum_{l'} q_{l'}^{\alpha}} ,
$$

where $q_l$ is its share of the available data. $\alpha = 1$ keeps the natural proportions and
$\alpha \to 0$ approaches uniform; $\alpha = 0.3$ is common (mT5 used it). The cost is that
low-resource languages are repeated more, and at fixed capacity the languages compete for
parameters.

::: worked title="Temperature sampling for three languages"
Shares $q = (0.80, 0.15, 0.05)$. At $\alpha = 0.3$: $0.80^{0.3} = 0.935$, $0.15^{0.3} = 0.566$ and
$0.05^{0.3} = 0.407$ sum to 1.909, so $p = (0.490, 0.297, 0.213)$. At $\alpha = 0.5$,
$p = (0.594, 0.257, 0.149)$; at $\alpha = 0.7$, $p = (0.688, 0.213, 0.099)$. At $\alpha = 0.3$ the
smallest language is sampled $0.213/0.05 = 4.3$ times as often as its natural share and the largest
$0.490/0.80 = 0.61$ times, so the smallest is repeated seven times as often and reaches four epochs
before the largest has finished its first.
:::

### The tokenizer

The BPE algorithm is [Module 07](module_07_EN.html#s2)'s; here the tokenizer is a pipeline
decision. It is trained before anything else, on a sample of the final mixture, because everything
downstream is counted in its tokens: the budget, the mixture weights, the context length. Its
vocabulary size $V$ trades embedding parameters ($Vd$, doubled if untied) and the output softmax
($2dV$ FLOPs per token in the forward pass) against sequence length, since a larger vocabulary cuts
text into fewer tokens. 32k suits English; 100k–150k suits a bilingual or multilingual corpus, in
which every language needs merges of its own. Compression per language decides how much context
and compute each language gets: a language that needs twice the tokens per character pays twice
per document and fits half as much text into the context. The remaining choices are fixed by
practice: digits split into single characters (arithmetic improves); byte fallback, so that
nothing is out of vocabulary; the special tokens the chat template will need
([Module 09](module_09_EN.html)) reserved now; and $V$ padded to a multiple of 64 or 128 for kernel
efficiency (the case study's 152,064 is $1{,}188 \times 128$).

::: worked title="What the vocabulary costs at d = 4,096"
| | $V = 32{,}000$ | $V = 152{,}064$ |
|---|---|---|
| Embedding parameters $Vd$ | 131M (262M untied) | 623M (1.25B untied) |
| fp32 logits for one 8,192-token sequence, $8{,}192 \times V \times 4$ bytes | 1.05 GB | 4.98 GB |
| Output head, forward, $2dV$ per token | 0.26 GFLOP | 1.25 GFLOP |

For the case study the two tables hold 13% of all parameters, the output head costs 7% of the
forward pass ($1.25 \times 10^9$ of $1.79 \times 10^{10}$ FLOPs per token), and the logits are often
the largest single tensor of a training step ([Section 8](#s8)). The bilingual vocabulary is paid
for in all three.
:::

### Packing

Documents are joined with an end-of-document token and cut into sequences of length $T$, so that no
compute is spent on padding. Attention across a document boundary inside a sequence is then either
allowed, which is simple and slightly harmful (a token attends to an unrelated document), or masked
with a block-diagonal causal mask, which is correct and slightly more complex (Figure 8.6). Llama 3
masked, and found it mattered little in standard pretraining but mattered for very long sequences.
Long documents are split across sequences; best-fit packing (Ding et al. 2024) assigns whole
documents to sequences as items are assigned to bins, so that fewer are cut.

::: figure id=fig-08-6
Packing. Five documents of different lengths, drawn as coloured bars, are laid end to end with
end-of-document markers and cut into fixed-length rows of $T$ tokens. Beside them, the $T \times T$
attention mask of one row that spans three documents, drawn twice: the full causal triangle, in
which tokens may attend across document boundaries, and the block-diagonal causal version, in which
the cross-document blocks are greyed out.
:::

::: worked title="Packing against padding on Lab 2's data"
[Lab 2](#lab2) trains on TinyStories with a 4,096-token BPE. Its stories average 222 tokens
including the end-of-text token (median 194, 90th percentile 333, longest 1,120). Padding every
story to 512 tokens fills on average 222 of 512 positions, so about $1 - 222/512 = 57\%$ of the
compute is wasted, and the 2.9% of stories longer than 512 tokens are still truncated. Padding to
256 wastes 23% (the long stories fill their rows) and truncates 19% of the stories. Packing into
256-token windows wastes nothing and discards nothing; a story that crosses a window boundary is
split, and its second part loses the context of its first.
:::

### Shards and the loader

The tokenised corpus is stored as flat arrays of token ids in shards: `uint16` when the vocabulary
has at most 65,536 entries ([Lab 2](#lab2)'s 4,096), `uint32` above that (the case study's 152,064).
The loader's position (shard, offset and random state) is part of every checkpoint
([Section 11](#s11)); a restart without it repeats or skips data.

::: check
A 20B-token source gets 2% of a 2T-token run. How many epochs is that, and is it a problem?
:::

::: answer
$0.02 \times 2\text{T} = 40\text{B}$ tokens, and $40\text{B}/20\text{B} = 2$ epochs: within the range
where repetition costs little (up to about four).
:::

::: check
Why train the tokenizer on the final mixture rather than on English web text alone?
:::

::: answer
A tokenizer trained on English compresses Chinese and code poorly: those sources then cost more
tokens per character, in compute and in context, and get no merges for their frequent strings.
:::
