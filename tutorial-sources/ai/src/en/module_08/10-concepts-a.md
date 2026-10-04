## What pretraining is, and the budget first {#s1}

A **base model** learns a distribution of text by minimising next-token
cross-entropy, usually over a mixture of documents packed into fixed-length
sequences:

$$
\mathcal L(\theta)=-\frac1{|\mathcal D|}\sum_{\text{docs}}\sum_t
\log p_\theta(x_t\mid x_{<t}).
$$

Here $|\mathcal D|$ counts predicted tokens. The tokens provide their own targets;
the text can contain tasks or instructions, but the objective does not require
separate human labels. Loss is in nats per token and its exponential is
perplexity ([Module 07](module_07_EN.html#s1)). Pretraining produces the base;
[Module 09](module_09_EN.html) adds instruction and preference training.

### Decide before the expensive run

Fix the tokenizer, model shape, data policy and schedule before launch. Changing
them later can require retokenisation, weight migration or a revised training
phase. Small ablations should settle uncertain choices before the long run pays
for them. Later mixture changes and batch ramps remain possible if documented.

| Decision | Evidence to obtain | Section |
|---|---|---|
| Model size and training tokens | Compute accounting and scaling fits | [1](#s1) |
| Sources, filters, deduplication and contamination | Audited removals and proxy-model ablations | [2](#s2), [3](#s3) |
| Mixture, tokenizer and packing | Source exposures and compression tests | [4](#s4) |
| Shape and optimiser | Parameter counts and small sweeps | [5](#s5), [6](#s6) |
| Precision and stabilisers | Mechanism-specific diagnostics | [7](#s7) |
| Memory and parallel layout | Arithmetic followed by measurement | [8](#s8)–[10](#s10) |
| Recovery and evaluation | Failure logs, held-out losses and task uncertainty | [11](#s11), [12](#s12) |
| Small runs and domain adaptation | Baselines and a declared acceptance gate | [13](#s13), [14](#s14) |

::: figure id=fig-08-1
The pretraining pipeline, with section references: sources, extraction, language
identification, filters, deduplication, decontamination, mixture, tokenizer,
packed shards, training, checkpoints, evaluation and the base model. Short-run
evaluation informs data and recipe decisions before the main run.
:::

### The running case study

The hypothetical engineering team from Module 07 adopts a bilingual
English–Chinese model to draft and check safety-case arguments for a reactor
vessel's pressure-relief system. It has 36 layers, width 4,096, 32 query/8 KV
heads of dimension 128, SwiGLU width 15,360, vocabulary 152,064, untied embeddings,
RMSNorm and no biases. Section 5 counts exactly 9,550,729,216 parameters.
Arithmetic uses this count; the quick table rounds it to 9.5B, about 0.5% low.
It is a worked scenario, not a released product or an actual training plan.

Use it first to understand how such a base could be made: 2T tokens, context
8,192, on 80 H100s. The team adopts a released checkpoint rather than running
that plan. Its own possible run is **continued pretraining** on 1.8B domain
tokens plus 0.2B general replay, accepted only after the baseline and gate in
Section 14. Module 09 post-trains the kept checkpoint, or the instruct release
if adaptation fails; Module 10 serves the result.

### Use one FLOP convention

[Module 06](module_06_EN.html#s11) derives the count. A matrix weight costs
approximately two forward FLOPs per token; backward costs twice forward. The
input embedding is a lookup, so the untied model has
$N_{\text{matmul}}=N-Vd$. Causal attention averages $2LdT$ forward FLOPs per
token over a length-$T$ sequence. The architecture-aware training estimate is

$$
C=(6N_{\text{matmul}}+6LTd)D.
$$

Memory counts all $N$. Chinchilla's published fit uses its own budget
$C_6=6ND$, without the explicit attention term. Keep that convention for its
iso-FLOP curves and payback calculations; elsewhere label $6ND$ as a shortcut.
These are model arithmetic estimates, excluding communication and most
elementwise operations. Some papers charge full-square attention: PaLM's
utilisation count uses $6N+12LTd$. A utilisation figure must state its convention.

::: worked title="The case study's per-token training charge"
The input table has $152064(4096)=622854144$ parameters, hence
$N_{\text{matmul}}=8927875072$. At context 8,192:

$$
\begin{aligned}
6N_{\text{matmul}}&=53{,}567{,}250{,}432,\\
6LTd&=7{,}247{,}757{,}312,\\
f_{\text{train}}&=60{,}815{,}007{,}744\ \text{FLOPs/token}.
\end{aligned}
$$

Attention adds 13.5% to the weight term. The shortcut $6N=57.30$ billion is
about 7% high on weights and 6% low overall. At context 131,072, attention is
sixteen times larger and total cost per token is about 2.8 times the 8k charge.
:::

### Convert compute into elapsed time

For sustained per-device rate $r$, GPU-hours are $C/(3600r)$; divide again by
GPU count for elapsed hours. **Model FLOPs utilisation (MFU)** divides useful
model FLOP/s by the hardware peak at the precision used. **Hardware FLOPs
utilisation (HFU)** also counts recomputation, so activation checkpointing can
raise HFU without improving useful-token throughput.

The series assumes an H100 SXM dense bf16 peak of 989 TFLOP/s and sustained
$r=4\times10^{14}$ FLOP/s, approximately 40% MFU. The exact product
$0.40(989)$ is 395.6 TFLOP/s; use it when the text or widget says exact peak.
Sparsity-enhanced peak figures do not apply to dense training. These are
planning assumptions; realised throughput, downtime and the chosen layout
determine calendar time.

::: worked title="Five quick budget scenarios"
Use $6ND$, rounded 9.5B parameters and $r=4\times10^{14}$ FLOP/s throughout
this table. These rows are hypothetical comparisons, not historical run records.

| Run | Shortcut FLOPs | GPU-hours | Elapsed time |
|---|---:|---:|---|
| 9.5B on 190B tokens | $1.083\times10^{22}$ | 7,521 | 19.6 days on 16 GPUs |
| 9.5B on 2T | $1.14\times10^{23}$ | 79,167 | 41.2 days on 80 GPUs |
| 9.5B on 15T | $8.55\times10^{23}$ | 593,750 | 309.2 days on 80 GPUs |
| 1B on 20B | $1.2\times10^{20}$ | 83.3 | 20.8 hours on four GPUs |
| 9.5B, continued training on 2B | $1.14\times10^{20}$ | 79.2 | 9.9 hours on eight GPUs |
:::

::: worked title="The architecture-aware 2T-token plan"
The exact shape costs $60{,}815{,}007{,}744(2\times10^{12})=
1.2163\times10^{23}$ FLOPs. At the rounded sustained rate this is 84,465
GPU-hours, or 44.0 days on 80 GPUs. At exactly 40% of the stated peak it is
85,405 GPU-hours and 44.5 days; at 30% MFU, 59.3 days. At the assumed
USD 2.50 per GPU-hour, the rounded-rate plan costs about USD 211,000 in GPU
time, excluding ablations, failed runs, storage and staff. The 2B-token
continued-training plan costs a thousandth as much at the same context.
:::

### Allocate the budget for training and serving

Module 07 derives the Chinchilla allocation. The rounded published parametric
fit is

$$
\mathcal L(N,D)=1.69+\frac{406.4}{N^{0.34}}+\frac{410.7}{D^{0.28}}.
$$

Its constants belong to a particular corpus/tokenizer and fitting experiments
with 70M–16B parameters and 5B–500B tokens. Twenty tokens per parameter is a
heuristic associated with the paper's other estimation methods; the parametric
minimum has a different ratio. Pale curve segments below show extrapolation.

::: figure id=fig-08-2
Chinchilla fitted loss at budgets $C_6=10^{20},10^{21},10^{22},10^{23}$.
Circles mark fitted minima and crosses the twenty-token allocation. Diamonds
show the 9.55B case model at 190B, 2T and 15T tokens. Curves outside the original
parameter/token fitting range are pale; none is a measurement of this case model.
:::

::: worked title="A small loss difference and a long payback"
For the exact case shape on 2T tokens, $C_6=1.14609\times10^{23}$:

| Allocation | Parameters | Tokens | Fitted loss |
|---|---:|---:|---:|
| Case study | 9.551B | 2.000T | 2.00199 |
| Fixed-budget fitted minimum | 15.526B | 1.230T | 1.99848 |
| Twenty tokens per parameter | 30.904B | 0.618T | 2.00537 |

The three losses differ by less than 0.007 nats, while approximate serving
arithmetic $2N$ differs substantially. For an equal-loss comparison, the fitted
optimum reaches the case loss at 15.018B parameters on 1.182T tokens, costing
$C'_6=1.065\times10^{23}$. Equating lifetime arithmetic,
$C_6+2NS=C'_6+2N'S$, gives

$$
S=\frac{C_6-C'_6}{2(N'-N)}=7.439\times10^{11}\ \text{served tokens}.
$$

At the team's 12M tokens/day that is about 170 years; at ten billion/day it is
about 74 days. Producers may serve many users, so their lifetime volume can
change the decision. The comparison extrapolates the fit, assumes equal loss
means equal quality, and omits attention, quantisation, batching and prices.
It does not predict a real deployment's latency or task score.
:::

::: widget name=compute-budget-planner
Compare architecture-aware compute with the $6ND$ shortcut. Change context,
MFU and GPU count; then compare fixed-budget allocations and the separate
equal-loss payback. Read the accounting label beside each result.
:::

::: check
Why must a fixed-budget loss minimum be distinguished from an equal-loss
serving comparison?
:::

::: answer
A fixed-budget alternative has a different predicted loss. To ask when extra
training pays for cheaper serving at equal fitted quality, first solve for an
alternative with the same loss, then compare its training and serving charges.
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
[Lab 1](#lab1) flags suspicious patterns in 303 of 5,000 original TinyStories
documents, about 6%. Only 97 pass its simple whole-string repair probe. These are
heuristic flags, not a complete encoding audit; leaving artefacts in training data
can teach a model to reproduce them.

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
[Lab 1](#lab1) applies an explicit subset of these rules to a larger corpus and
records the first failure for each document. Its definitions and first-failure
counts should be inspected before comparing it with a full production filter.
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
verified against a threshold by exact Jaccard on the shingle sets; under this policy, a false
candidate costs verification time rather than creating a false accepted pair. The fraction of
agreeing signature entries is an approximate alternative with sampling error, so it can accept
pairs below the exact threshold. Verified pairs are
grouped into clusters with union-find, because near-duplication chains (A is near B, B is near C),
and one document per cluster is kept.

::: worked title="What banding saves"
$10^9$ documents form $10^9 \times (10^9 - 1)/2 \approx 5 \times 10^{17}$ pairs. With 16 bands, LSH
makes $16 \times 10^9 = 1.6 \times 10^{10}$ bucket insertions, each a hash of 8 integers, and
compares only the pairs that share a bucket. [Lab 1](#lab1)'s corpus of 6,400 documents has
$6{,}400 \times 6{,}399/2 = 20{,}476{,}800$ pairs, about 20.5 million, from which LSH proposes about
780 candidates in the recorded run.
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
allowed, which is simple but introduces unrelated context, or restricted
with a block-diagonal causal mask (Figure 8.6). Llama 3
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
256-token windows avoids most padding; a final partial window needs its own policy.
A story that crosses a window boundary is
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
