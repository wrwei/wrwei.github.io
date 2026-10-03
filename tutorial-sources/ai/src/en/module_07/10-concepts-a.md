## What a language model is {#s1}

A **large language model** is a decoder-only transformer ([Module 06](module_06_EN.html)) trained
to predict the next token on a very large corpus of text. That is the whole definition. Everything
such a model appears to do (answer questions, write code, follow instructions, refuse a request) is
a consequence of that objective, of the scale at which it was pursued, and of the post-training of
[Module 09](module_09_EN.html). This section makes the objective exact and the number it produces
readable.

### The objective

A model assigns a probability to a sequence of tokens $x_1, \dots, x_T$ through the chain rule of
probability:

$$
p(x_1, \dots, x_T) = \prod_{t=1}^{T} p(x_t \mid x_{<t}).
$$

The factorisation is exact: it assumes nothing but an order. The transformer computes every factor.
Its final hidden state $\mathbf{h}_t$ at position $t$ depends only on $x_{\le t}$, because the causal
mask hides every later position ([Module 06, Section 2](module_06_EN.html#s2)). An output matrix maps
it to one **logit** per vocabulary entry, $\mathbf{z}_t = \mathbf{W}_{\text{out}} \mathbf{h}_t \in \R^{V}$,
and a softmax turns the logits into the distribution of the next token:

$$
p(x_{t+1} = v \mid x_{\le t}) = \frac{\exp(z_{t,v})}{\sum_{u=1}^{V} \exp(z_{t,u})}.
$$

A beginning-of-sequence token placed in front of the text gives the first real token a context to
be predicted from.

**Next-token prediction** is trained by minimising the average negative log-likelihood of the
tokens that actually occur,

$$
\mathcal{L}(\theta) = -\frac{1}{T} \sum_{t=1}^{T} \log p_\theta(x_t \mid x_{<t}),
$$

averaged over every position of every training document. This is the maximum-likelihood
**cross-entropy** of [Module 01, Section 5](module_01_EN.html#s5), with a $V$-way categorical outcome
at each position. Because the mask stops each position from seeing its successors, one forward pass
yields all $T$ predictions at once: the input is the sequence, the target is the same sequence
shifted left by one, and every prediction conditions on the true preceding tokens rather than on
the model's own guesses (teacher forcing, [Module 04, Section 10](module_04_EN.html#s10)).
Pretraining is this one loss, minimised over trillions of tokens.

### The floor under the loss

Let $p_{\text{data}}$ be the distribution the training text is drawn from. Adding and subtracting
$\log p_{\text{data}}(x)$ inside the expected loss splits it in two:

$$
\begin{aligned}
\E_{x \sim p_{\text{data}}}\big[-\log p_\theta(x)\big]
&= -\sum_x p_{\text{data}}(x) \log p_{\text{data}}(x) + \sum_x p_{\text{data}}(x) \log \frac{p_{\text{data}}(x)}{p_\theta(x)} \\
&= H(p_{\text{data}}) + \KL(p_{\text{data}} \,\|\, p_\theta) \;\ge\; H(p_{\text{data}}).
\end{aligned}
$$

The inequality holds because a KL divergence is never negative and is zero only when the two
distributions agree. The loss therefore has a floor: the entropy of text under the tokenisation.
Training changes only $p_\theta$, so it can shrink the KL term and nothing else, and natural text has
positive entropy, because a context admits many continuations. No model, however large, reaches
zero loss. The floor returns in [Section 4](#s4) as the constant $E$ of the scaling law.

### Nats, bits and perplexity

With natural logarithms the loss is in **nats**; dividing by $\ln 2 = 0.693$ converts it to
**bits**. Its exponential is the **perplexity**:

$$
\text{PPL} = e^{\mathcal{L}_{\text{nats}}} = 2^{\mathcal{L}_{\text{bits}}}
= \exp\Big(-\frac{1}{T} \sum_{t=1}^{T} \ln p_t\Big) = \Big(\prod_{t=1}^{T} p_t\Big)^{-1/T},
$$

where $p_t$ is the probability the model gave the token that actually came. Perplexity is one over
the geometric mean of those probabilities. A uniform choice among $k$ options gives each the
probability $1/k$ and so has perplexity exactly $k$; hence the reading of perplexity as an
effective number of choices. A perplexity of 8 means the model is, on average, as uncertain as a
fair eight-sided die.

The same argument gives the baseline. An untrained model with nearly equal logits gives every
token about $1/V$, a loss of $\ln V$: 8.3 nats for the 4,096-token vocabulary of
[Module 06, Section 12](module_06_EN.html#s12), and $\ln 49{,}152 = 10.80$ nats for SmolLM2, the
labs' model. Every loss between $\ln V$ and the floor measures what the model has learned.

::: worked title="The loss of four tokens"
A model gives the actual next tokens of a short text the probabilities 0.50, 0.25, 0.125 and 0.80.

1. Per-token losses: $-\ln 0.50 = 0.693$, $-\ln 0.25 = 1.386$, $-\ln 0.125 = 2.079$ and
   $-\ln 0.80 = 0.223$ nats.
2. Mean: $(0.693 + 1.386 + 2.079 + 0.223)/4 = 4.382/4 = 1.095$ nats per token.
3. In bits: $1.095/0.693 = 1.580$ bits per token.
4. Perplexity: $e^{1.095} = 2.99$.
5. Check through the geometric mean: $(0.50 \times 0.25 \times 0.125 \times 0.80)^{1/4} = 0.0125^{1/4} = 0.334$,
   and $1/0.334 = 2.99$.

Almost half the total (2.079 of 4.382 nats) comes from the one token given 0.125: the logarithm
makes a low probability on what actually happens expensive.
:::

::: figure id=fig-07-1
Autoregressive factorisation, with the worked example's illustrative probabilities. The tokens
'The', ' relief', ' valve', ' opens' and ' at' enter one box labelled 'decoder (causal mask)'. Above
each of the first four positions, a bar chart of five candidate next tokens highlights the token
that actually follows, with its probability and loss beneath: p = 0.50, 0.25, 0.125 and 0.80;
−log p = 0.69, 1.39, 2.08 and 0.22 nats. A bracket over the row gives the mean: loss = 1.095 nats
= 1.58 bits per token; perplexity = e^1.095 = 2.99.
:::

::: worked title="Before and after training"
SmolLM2-135M has a vocabulary of $V = 49{,}152$. Untrained, with uniform predictions, its loss would
be $\ln 49{,}152 = 10.80$ nats per token: $10.80/0.693 = 15.6$ bits, a perplexity of 49,152. Trained,
it scores 3.25 nats per token on the module's 80-word engineering paragraph ([Lab 1](#lab1)):
$3.25/0.693 = 4.69$ bits, a perplexity of $e^{3.25} = 25.8$. Training has cut the effective number
of choices per token from 49,152 to about 26.
:::

### Bits per byte

A per-token loss has a hidden unit, the token, and different tokenizers cut the same text into
different numbers of tokens. A tokenizer with longer tokens makes each prediction harder, since each
token carries more text, and raises the per-token loss without the model being any worse. The fix
is to divide by something that belongs to the text alone. Summed over a text, the per-token losses
give $-\sum_t \ln p_\theta(x_t \mid x_{<t}) = -\ln p_\theta(\text{text})$: the model's probability of
the whole string, in nats. Two models with different tokenizers both assign a probability to the
same string, so this total compares fairly between them; dividing it by each model's own token count
is what breaks the comparison. Dividing by the number of UTF-8 bytes instead gives **bits per byte**:

$$
\text{BPB} = \frac{\sum_{t} \mathcal{L}_t}{n_{\text{bytes}} \cdot \ln 2},
$$

with the per-token losses $\mathcal{L}_t$ in nats. Use it whenever vocabularies differ.

::: worked title="Two tokenizers, one text"
On the same text, model A scores 2.0 nats per token with a tokenizer averaging 4.0 bytes per token,
and model B scores 2.3 nats per token at 4.8 bytes per token.

- Per token, A looks better: perplexity $e^{2.0} = 7.4$ against $e^{2.3} = 10.0$.
- Per byte: $\text{BPB}_A = 2.0/(4.0 \times 0.693) = 0.721$ and
  $\text{BPB}_B = 2.3/(4.8 \times 0.693) = 0.691$.

B needs fewer bits for the same text, so B is the better model. Its per-token numbers are worse only
because each of its tokens carries 20% more text.
:::

### What the numbers mean

The loss falls as a model learns spelling, then syntax, then facts, then reasoning-like
regularities, in roughly that order and with no boundary between them. [Lab 1](#lab1) measures where
real texts sit for SmolLM2-135M (Figure 7.2). A public-domain sentence the model has memorised costs
0.13 bits per byte; English engineering prose 0.90; Python code 0.95; the same prose with its words
shuffled 1.88, because every word is familiar but their order is not; and random characters 5.53,
more than the 5.21 bits ($\log_2 37$) of the 37-symbol source they were drawn from, because the
model's prior expects language and pays for every surprise. At larger scale, a model of about 100M
parameters trained on English web text ends near 3.0 nats per token, a perplexity of about 20
([Module 08, Section 13](module_08_EN.html#s13)), and the Chinchilla fit of [Section 4](#s4) puts
the floor of its own corpus at $E = 1.69$ nats per token, a perplexity of 5.4. These per-token
values belong to different corpora and tokenizers and do not compare with one another.

::: figure id=fig-07-2
Bits per byte of SmolLM2-135M on seven texts from Lab 1, as horizontal bars sorted by value:
memorised public-domain sentence 0.13; the engineering paragraph read twice 0.48; English
engineering prose 0.90; Python code 0.95; the prose with its words shuffled 1.88; its Chinese
translation 1.88; random characters 5.53. A dashed vertical line at log2 37 = 5.21 bits marks the
entropy of the random text's source. Each bar is annotated with its per-token perplexity (1.55,
5.64, 25.8, 5.18, 873, 8.40, 166): per token the Chinese looks three times easier than the English;
per byte it is twice as hard.
:::

### Base and instruct models

A pretrained, or **base**, model continues text: given a question, it may answer it or add three
more questions, whichever its corpus makes more likely. Post-training ([Module 09](module_09_EN.html))
turns it into an **instruct** or chat model, which answers in turns and stops. Both are next-token
predictors; the instruct model has been trained further on conversations.
[Module 08](module_08_EN.html) builds a base model, and Module 09 the assistant.

### The running case study

Modules 07 to 10 follow one hypothetical project. An engineering team adapts an open-weight,
bilingual English–Chinese model of about 9.5B parameters, released in base and instruct versions,
to draft and check safety-case arguments (claims, the argument over them, links to evidence) for
the pressure-relief system of a reactor vessel. This module chooses and sizes the model and prices
its use. Module 08 shows how such a base model is pretrained and costs the team's continued
pretraining on its own domain text; Module 09 post-trains and evaluates it; Module 10 serves the
merged, quantised model. It is a worked case for the reader to follow, not a description of any
real plan or product.

::: check
A model's test loss is 2.3 nats per token. What is it in bits, and what is the perplexity?
:::

::: answer
$2.3/0.693 = 3.32$ bits per token, and the perplexity is $e^{2.3} = 10.0$: the model is as
uncertain as a uniform choice among ten tokens.
:::

::: check
Why can no model reach zero loss on natural text, however large it is?
:::

::: answer
The expected loss is $H(p_{\text{data}}) + \KL(p_{\text{data}} \,\|\, p_\theta)$. Training can
drive only the KL term towards zero. The entropy of text is positive, because the same context
admits many continuations, and it stays.
:::

::: check
Model A (32k vocabulary) has perplexity 12 and model B (150k vocabulary) perplexity 18 on the same
text. Which is the better model?
:::

::: answer
These numbers cannot tell. B's tokens are longer, so each of its predictions covers more text and
is harder. Compare bits per byte on the same text.
:::

## Tokens: byte-pair encoding, step by step {#s2}

A model does not read characters or words. It reads **tokens**: integers that index a fixed
vocabulary, learned from a corpus before the model is trained. The **tokenizer** that maps text to
tokens and back decides what the model can see and how many steps a text costs.

### Why subwords

A vocabulary of words cannot represent a word it has not seen (a new part number, a misspelling, a
compound), and covering a language's inflections and names takes millions of entries. Characters or
bytes are the opposite extreme: nothing is unknown, but sequences become four to five times longer
(the module's English paragraph is 463 bytes and 89 tokens), and length is expensive, because
attention costs grow with the square of the sequence length $T$ and generation takes one forward
pass per token. Subword vocabularies sit between: frequent words become single tokens, rare words
split into pieces, and any string can still be written. Current models use vocabularies of tens of
thousands to about 150,000 entries.

### Training byte-pair encoding

**Byte-pair encoding** (BPE; Sennrich, Haddow and Birch 2016) learns its vocabulary by repeated
merging:

1. Pre-tokenise the corpus into words and count each word.
2. Write each word as base symbols followed by an end-of-word marker, written `_` here.
3. Count every adjacent pair of symbols, adding the word's count for each occurrence.
4. Merge the most frequent pair into one new symbol everywhere, and record the merge with its rank.
5. Repeat from step 3 until the vocabulary, base symbols plus merges, reaches its target size.

Ties need a rule. Here the highest count wins, then the smallest (left, right) pair in code-point
order. Libraries break ties differently, which is one reason two implementations trained on the same
text can disagree.

::: worked title="A six-word corpus and its pair counts"
The corpus, as word and count: weld 10, welded 9, welds 7, cooled 7, melt 5, heated 4. The base
alphabet is the 12 symbols `_ a c d e h l m o s t w`. With end markers the corpus holds
$5 \times 10 + 7 \times 9 + 6 \times 7 + 7 \times 7 + 5 \times 5 + 7 \times 4 = 257$ symbols.

A pair collects the count of every word it occurs in. `e l` occurs in weld, welded, welds and melt:
$10 + 9 + 7 + 5 = 31$. `d _` ends weld, welded, cooled and heated: $10 + 9 + 7 + 4 = 30$. All 19
pairs:

| Count | Pairs |
|---|---|
| 31 | `e l` |
| 30 | `d _` |
| 26 | `w e`, `l d` |
| 20 | `e d` |
| 9 | `d e` |
| 7 | `d s`, `s _`, `c o`, `o o`, `o l`, `l e` |
| 5 | `m e`, `l t`, `t _` |
| 4 | `h e`, `e a`, `a t`, `t e` |

The first merge is `e` + `l` → `el`, with `d _` one count behind.
:::

::: worked title="Seven merges"
After each merge the pairs are counted again:

| Rank | Merge | Count | Runner-up | Corpus length |
|---|---|---|---|---|
| 1 | `e` + `l` → `el` | 31 | `d` + `_` (30) | 226 |
| 2 | `d` + `_` → `d_` | 30 | `w` + `el` and `el` + `d` (26) | 196 |
| 3 | `w` + `el` → `wel` | 26 | `e` + `d_` (20) | 170 |
| 4 | `e` + `d_` → `ed_` | 20 | `wel` + `d` (16) | 150 |
| 5 | `wel` + `d` → `weld` | 16 | `wel` + `d_` (10) | 134 |
| 6 | `wel` + `d_` → `weld_` | 10 | `weld` + `ed_` (9) | 124 |
| 7 | `weld` + `ed_` → `welded_` | 9 | six pairs (7) | 115 |

Two checks. First, a merge changes later counts: merge 2 turns the end of weld into `d_`, so
`el` + `d` loses weld's 10 occurrences and falls from 26 to 16, leaving `w` + `el` to win round 3
alone. Second, every merged occurrence turns two symbols into one, so each merge shortens the corpus
by exactly its count: $257 - 31 = 226$, $226 - 30 = 196$, and so on down to 115. (Overlapping
occurrences would break this: in `o o o` only one of the two `o o` pairs can merge. There are none
here.)

After seven merges the vocabulary has $12 + 7 = 19$ symbols, and the corpus reads `weld_` ×10,
`welded_` ×9, `weld s _` ×7, `c o o l ed_` ×7, `m el t _` ×5 and `h e a t ed_` ×4. No tie decided
merges 1 to 7. Merge 8 would be a six-way tie at 7 (`c` + `o`, `l` + `ed_`, `o` + `l`, `o` + `o`,
`s` + `_` and `weld` + `s`), which the rule resolves as `c` + `o`.
:::

::: figure id=fig-07-3
BPE on the weld corpus in eight stacked panels: the start and merges 1 to 7. Each panel shows the
six words as rows of symbol boxes with their counts at the left; the pair merged at that step is
outlined in the colour of the new symbol; a side table lists the three largest pair counts with the
winner in bold. A strip along the bottom plots corpus length in symbols against merge number: 257,
226, 196, 170, 150, 134, 124, 115.
:::

::: widget name=bpe-merge-stepper
Press 'step' seven times and compare each merge, its count and the corpus length with the table
above. Step once more to see the six-way tie at 7 resolved as `c` + `o`. Then type a word of your
own into the encode box and see which of its characters fall outside the base alphabet.
:::

### Encoding a new word

To encode a word, split it into base symbols plus `_`, then repeatedly apply the lowest-ranked merge
present until no merge applies. Encoding replays the training merges in their learned order. It is
not a dictionary lookup of the longest matching piece. The two usually agree, but they are different
algorithms: with the merges `b` + `c` (rank 1) and `a` + `b` (rank 2), BPE encodes `abc` as `a` `bc`,
whereas a longest match from the left takes `ab` first and gives `ab` `c`.

::: worked title="Encoding with the seven merges"
- weld → `weld_`. Merges 1, 2, 3 and 6 apply in turn: `w el d _`, `w el d_`, `wel d_`, `weld_`. One
  token, because the whole word with its marker was frequent.
- welds → `weld` `s` `_`. After merges 1, 3 and 5, no merge joins `weld` to `s`.
- melted → `m` `el` `t` `ed_`. The word never occurred, but its suffix did: `ed_` generalises.
- heated → `h` `e` `a` `t` `ed_`.
- welding → `weld` `i` `n` `g` `_`. The characters i, n and g are not in the base alphabet, so a
  character-level BPE has no symbol for them and must emit the unknown token `[UNK]`, losing them.
  A byte-level BPE would emit the bytes 0x69, 0x6E and 0x67.
:::

### Byte-level BPE

GPT-2 (Radford et al. 2019) made the base alphabet the 256 possible byte values. Every string is a
sequence of UTF-8 bytes, so every string can be encoded and no unknown token exists: bytes are the
floor. An ASCII letter is one byte and a Chinese character three (安 is E5 AE 89), so Chinese text
stays short only if the tokenizer has learned merges for it.

Three conventions decide what the tokens look like.

- A regular-expression **pre-tokeniser** first splits text at spaces, punctuation and runs of
  digits, and merges are learned and applied only inside the pieces, so no token spans two words.
- A leading space belongs to the following word. In GPT-2, ' valve' with its space is one token,
  while 'valve' at the start of a line is two, 'val' and 've'.
- GPT-2's vocabulary file stores each token as printable text by mapping every byte to a visible
  character. The space byte shows as 'Ġ', so ' valve' appears in the file as 'Ġvalve'.

Decoding concatenates the tokens' bytes and decodes them as UTF-8. A token boundary can fall inside
a character: GPT-2 cuts '安全阀' (safety valve, 9 bytes) into 7 tokens, of which the first holds
E5 AE and the second 89, so neither decodes to a character on its own. A streaming decoder must hold
incomplete bytes back until the character is complete; the '�' pieces printed in [Lab 2](#lab2) are
such fragments, decoded one token at a time.

::: worked title="Bytes and tokens"
'valve' is 5 bytes; '安全阀' is 9, three characters of three bytes each. The module's 80-word
English paragraph is 463 bytes and becomes 89 GPT-2 tokens, $463/89 = 5.2$ bytes per token. Its
119-character Chinese translation is 357 bytes and becomes 256 GPT-2 tokens, $357/256 = 1.4$ bytes
per token. GPT-2 learned its merges from mostly English web text, so most Chinese characters stay
split into byte pieces.
:::

### Vocabulary size is the stopping rule

The number of merges is the design choice. GPT-2's vocabulary has 50,257 tokens: 256 bytes, 50,000
merges and one end-of-text token. Lab 2 prints the others: SmolLM2 has 49,152 and Qwen2.5 151,665.
A model's embedding matrix may have more rows than its tokenizer has tokens; Qwen2.5's is padded to
151,936.

::: check
Why does byte-level BPE never produce an unknown token?
:::

::: answer
Its base vocabulary is all 256 byte values, and every string is a sequence of bytes. The worst case
is one token per byte.
:::

::: check
After the seven merges, why is welds three tokens while weld is one?
:::

::: answer
The merge that makes the whole word, `wel` + `d_` → `weld_`, includes the end marker. In welds the
`d` is followed by `s`, so only `wel` + `d` → `weld` applies; no merge of `weld` with `s` was
learned, so `s` and `_` stay separate.
:::

::: check
A tokenizer trained on 95% English text meets Chinese. What happens?
:::

::: answer
Few Chinese merges were learned, so its characters stay as pieces of one to three bytes: many tokens
per character, like GPT-2's 2.15 tokens per character in Lab 2. The text costs more, fills the
context faster and takes longer to generate.
:::

## Tokens in practice {#s3}

Tokenisation shows up in a model's size, its price, its context and some of its strangest
behaviour. This section covers the other algorithms, the choice of vocabulary size, languages, and
the artefacts.

### Unigram, SentencePiece and WordPiece

**Unigram** tokenisation (Kudo 2018) runs the other way from BPE. It starts from a large candidate
vocabulary and gives each piece a probability. A segmentation's probability is the product of its
pieces' probabilities, and a word is segmented by the Viterbi algorithm, dynamic programming that
finds the most probable segmentation. Training alternates two steps until the vocabulary reaches its
target size: fit the piece probabilities by expectation-maximisation (EM), then prune the pieces
whose removal costs the least likelihood. Because segmentations have probabilities, training can
also sample a different segmentation of a word each time it appears (**subword regularisation**),
which makes the model less sensitive to how text is cut.

::: worked title="Viterbi on 'safety'"
Suppose the pieces that can spell safety have the probabilities safe 0.010, ty 0.004, safet 0.0005,
y 0.02, saf 0.002, ety 0.003, s 0.03 and afety 0.0001. Four segmentations use them:

- safe + ty: $0.010 \times 0.004 = 4.0 \times 10^{-5}$, log-probability $-10.13$;
- safet + y: $1.0 \times 10^{-5}$, $-11.51$;
- saf + ety: $6.0 \times 10^{-6}$, $-12.02$;
- s + afety: $3.0 \times 10^{-6}$, $-12.72$.

Viterbi does not list segmentations. It stores, for each prefix, the best log-probability of any
segmentation ending there (s $-3.51$, saf $-6.21$, safe $-4.61$, safet $-7.60$) and scores the whole
word as the best prefix plus a final piece:
$\max(-3.51 - 9.21,\ -6.21 - 5.81,\ -4.61 - 5.52,\ -7.60 - 3.91) = -10.13$. It returns safe + ty,
at a cost that grows linearly with the word's length, whereas the number of segmentations grows
exponentially.
:::

**SentencePiece** (Kudo and Richardson 2018) is a library rather than an algorithm. It treats the
input as a raw stream of characters in which the space is an ordinary symbol, written '▁', so it
needs no language-specific pre-tokeniser (useful for Chinese and Japanese, which do not separate
words by spaces). It implements both BPE and unigram, and it can fall back to bytes for characters
outside its vocabulary. **WordPiece**, BERT's tokenizer, is BPE with another choice of merge: the
pair that most increases the likelihood of the training data, rather than the most frequent one.

### Vocabulary size

The vocabulary costs parameters at both ends of the model. The input embedding holds $Vd$
parameters, and the output layer another $Vd$ unless the two share one matrix (tied embeddings).
The output layer costs $2Vd$ FLOPs per token; the input embedding is a lookup and costs none. A
larger $V$ buys fewer tokens per text: shorter sequences, fewer decode steps, more text in a fixed
context. Its price is rarer tokens, each of which receives fewer gradient updates in training. About
32k suits English-centric models; multilingual models use 100k to 150k. Choosing and training a
tokenizer for pretraining belongs to [Module 08, Section 4](module_08_EN.html#s4).

::: worked title="What the vocabulary costs"
SmolLM2-135M has $V = 49{,}152$ and $d = 576$, with tied embeddings. Its embedding holds
$49{,}152 \times 576 = 28.3$M parameters, 21% of its 134.5M. The output layer costs
$2Vd = 56.6$M FLOPs per token. With tied embeddings almost every parameter is a matrix-multiply
weight, so the forward pass costs about $2N = 269$M FLOPs per token, and the output layer is again
21% of it.

The case-study model has $V = 152{,}064$ and $d = 4{,}096$, untied. Its embedding and output head
hold $2 \times 152{,}064 \times 4{,}096 = 1.25$B parameters, 13% of its 9.55B. The output layer
costs $2Vd = 1.25 \times 10^9$ FLOPs per token, 7.0% of its $1.79 \times 10^{10}$ forward FLOPs per
token (Module 06's rule, recalled in [Section 4](#s4), under which the input embedding costs
nothing).

A small model spends a fifth of itself on its vocabulary; the 9.5B model spends about an eighth of
its parameters and a fourteenth of its arithmetic.
:::

### The same content in English and Chinese

[Lab 2](#lab2) tokenizes the module's 80-word paragraph about the relief valve and its 119-character
Chinese translation:

| Tokenizer | Vocabulary | English tokens | Chinese tokens | Tokens per Chinese character |
|---|---|---|---|---|
| GPT-2 | 50,257 | 89 | 256 | 2.15 |
| SmolLM2 | 49,152 | 89 | 219 | 1.84 |
| Qwen2.5 | 151,665 | 89 | 71 | 0.60 |

English costs 89 tokens with all three, 1.11 tokens per word; 1.3 tokens per word remains a fair
rule of thumb for general English text. The Chinese counts differ 3.6-fold: the tokenizer's training
mixture, not the model, decides what Chinese costs. A language that a tokenizer serves poorly pays
more per request, fits less into the context and waits for more decode steps. Petrov et al. (2023)
measure such disparities across many languages and argue that they are unfair to the languages'
speakers.

::: figure id=fig-07-4
Tokens for the same content under three tokenizers (Lab 2). x axis: GPT-2, SmolLM2 and Qwen2.5, with
their vocabulary sizes beneath (50,257; 49,152; 151,665). For each, two bars: the 80-word English
paragraph (89, 89 and 89 tokens) and its 119-character Chinese translation (256, 219 and 71 tokens).
The Chinese-to-English ratio is printed above each pair: 2.88, 2.46 and 0.80.
:::

::: worked title="Chinese in a context window"
A 32,768-token context with 2,048 tokens reserved for the answer leaves 30,720 tokens. With GPT-2's
tokenizer (119 characters per 256 tokens) they hold $30{,}720 \times 119/256 \approx 14{,}300$
Chinese characters; with Qwen2.5's (119 per 71), $30{,}720 \times 119/71 \approx 51{,}500$. The same
context reads 3.6 times as much Chinese.
:::

### Numbers, spaces, case and letters

Lab 2 shows how the three tokenizers split numbers (Figure 7.5). GPT-2 cuts '2026' into 20 | 26 and
'1234567' into 123 | 45 | 67; SmolLM2 and Qwen2.5 split both into single digits. GPT-2's chunks come
from merge frequencies, so numbers of the same length split differently, while the other two give
every digit its own token. A third policy, used by some other tokenizers, has the pre-tokeniser cut
digit runs into groups of up to three before any merge (Lab 2's aside shows one). The claim that
'2026' may be one token and '20261' three holds for none of these tokenizers: GPT-2 gives 20 | 26
and 20 | 261, the others four and five single digits. Arbitrary digit chunks are one reason
arithmetic is hard for a model ([Section 11](#s11)).

Spaces and case change the tokens. 'safety', ' safety', ' Safety' and ' SAFETY' are different token
sequences, and ' SAFETY' is ' SAF' | 'ET' | 'Y' in GPT-2 and SmolLM2. Since most words carry their
leading space, a prompt that ends with a trailing space forces the model to continue from an unusual
boundary: the next word's usual token begins with the space already written, so the model must
produce a rarer, spaceless token, and the completion degrades.

Letters are invisible. ' strawberry' is a single token in all three tokenizers, so asking how many
r's it contains asks about characters the model never sees directly.

::: figure id=fig-07-5
How three tokenizers split '1234567' and ' SAFETY': one row per tokenizer, one coloured box per
token with its text inside. '1234567': GPT-2 123 | 45 | 67; SmolLM2 and Qwen2.5 1 | 2 | 3 | 4 | 5 |
6 | 7. ' SAFETY': GPT-2 and SmolLM2 ' SAF' | 'ET' | 'Y'; Qwen2.5 ' SAF' | 'ETY'.
:::

### Glitch tokens

A tokenizer is usually trained on different text from its model. Vocabulary entries that were rare
or absent in the model's training data receive almost no gradient updates, so their embeddings stay
close to their random initialisation, and prompts containing them produce erratic output. Land and
Bartolo (2024) detect such **glitch tokens** automatically and report roughly 0.1 to 1% of the
vocabularies they examined as severely under-trained.

### Tokens are the unit of everything

Context length, price and throughput are all counted in tokens. '128k' usually means
$2^{17} = 131{,}072$ tokens; at 1.3 tokens per word that is about 100,000 English words, not the
90,000 sometimes quoted, and about 118,000 at the 1.11 measured on the module's paragraph. Count
with the deployed model's own tokenizer, never in characters or words.

::: check
Why does a larger vocabulary cost parameters but save compute per character?
:::

::: answer
The embedding matrices grow as $Vd$, but each token covers more text, so fewer forward passes are
needed per character. In a large model the extra $2Vd$ FLOPs that each pass spends on the output
layer are a small share of the pass.
:::

::: check
Roughly how many tokens is a 10,000-character Chinese document with GPT-2's tokenizer, and with
Qwen2.5's?
:::

::: answer
About $10{,}000 \times 2.15 = 21{,}500$ with GPT-2's and $10{,}000 \times 0.60 = 6{,}000$ with
Qwen2.5's, from Lab 2's rates on one paragraph. Measure on your own documents before relying on
them.
:::

## Scaling laws: from Kaplan to Chinchilla {#s4}

The observation that has defined the field since 2020 is that pretraining loss falls predictably,
as a power law, in the number of parameters $N$, the number of training tokens $D$ and the training
compute $C$, over many orders of magnitude. Small runs therefore predict large ones, and a budget
can be planned before it is spent.

### Kaplan's power laws

Kaplan et al. (2020) fitted each variable separately, with the others large enough not to be the
bottleneck. For model size,

$$
L(N) = \left(\frac{N_c}{N}\right)^{\alpha_N}, \qquad \alpha_N \approx 0.076, \quad N_c \approx 8.8 \times 10^{13},
$$

with $N$ counting non-embedding parameters and $L$ in nats per token on their web-text corpus. Data
and compute gave power laws of the same form, with exponents $\alpha_D \approx 0.095$ and, for the
minimum compute that reaches a given loss, $\alpha_C \approx 0.050$. Their allocation of a growing
budget was $N_{\text{opt}} \propto C^{0.73}$: put most of any extra compute into a bigger model,
and train it short of convergence.

::: worked title="Kaplan's law at three sizes"
At $N = 10^8$: $(8.8 \times 10^{13}/10^8)^{0.076} = (8.8 \times 10^5)^{0.076} = e^{0.076 \times 13.69} = 2.83$
nats per token. The same steps give 2.38 at $10^9$ and 1.99 at $10^{10}$. Each tenfold increase in
$N$ multiplies the loss by $10^{-0.076} = 0.84$. A pure power law keeps falling towards zero, so it
must fail eventually: the loss cannot go below the entropy of text ([Section 1](#s1)). That floor is
what the Chinchilla form adds.
:::

### Counting compute

[Module 06, Section 11](module_06_EN.html#s11) derives the cost of training; this section recalls
it. A forward pass costs 2 FLOPs per matrix-multiply weight per token, and the backward pass twice
that, so training costs 6 FLOPs per weight per token: $C \approx 6ND$. Attention adds $4Ldt$ FLOPs
per token at context position $t$ in a model of $L$ layers and width $d$, which averages to $2LdT$
per token over a causal sequence of length $T$ ($6LdT$ in training). The series' convention, stated
here once for this module: memory and Chinchilla's $N$ count all parameters, $N_{\text{total}}$;
FLOPs count the matrix-multiply weights, $N_{\text{matmul}} = N_{\text{total}} - Vd$ when the input
embedding (a lookup) is untied. For the case-study model ($N_{\text{total}} = 9.55 \times 10^9$,
$N_{\text{matmul}} = 8.93 \times 10^9$, $L = 36$, $d = 4{,}096$) that gives
$2N_{\text{matmul}} = 1.79 \times 10^{10}$ forward FLOPs per token, and
$6N_{\text{matmul}} = 5.36 \times 10^{10}$ per training token plus $6LTd = 7.25 \times 10^9$ at
$T = 8{,}192$ (+13.5%). The shortcut $2N_{\text{total}} = 1.91 \times 10^{10}$ is a +7% estimate and
is labelled so wherever it is used. Attention's size relative to the weight term is
$LdT/N_{\text{matmul}}$: 6.8% at $T = 4{,}096$ and 54% at $T = 32{,}768$. Chinchilla's fit follows
the paper, and so do this section and the next whenever they use it: $C = 6ND$ with $N$ the total
count and no attention term.

### Chinchilla: three ways to the optimum

Hoffmann et al. (2022) trained over 400 models, from 70M to over 16B parameters, on 5B to 500B
tokens, and estimated the best split of a budget in three ways:

1. **The envelope of training curves.** Train each size for several token budgets and, at every
   compute level, keep the lowest loss any run reached; the sizes on that envelope give
   $N_{\text{opt}}(C)$.
2. **IsoFLOP profiles.** Fix $C$, vary $N$ with $D = C/(6N)$, and fit the loss against $\log N$; the
   minimum is the best size for that budget. [Lab 3](#lab3) does this on synthetic runs.
3. **A parametric fit** of every run to one formula.

The formula is

$$
L(N, D) = E + \frac{A}{N^{\alpha}} + \frac{B}{D^{\beta}},
\qquad E = 1.69,\ A = 406.4,\ B = 410.7,\ \alpha = 0.34,\ \beta = 0.28,
$$

in nats per token on their corpus with their tokenizer. $E$ is the **irreducible loss**, the entropy
floor of Section 1 for that corpus and tokenizer. $A/N^{\alpha}$ is the cost of finite capacity,
which vanishes as the model grows; $B/D^{\beta}$ is the cost of finite data, which vanishes as
training lengthens. The constants keep the paper's names $E$, $A$, $B$, $\alpha$ and $\beta$ in the
scaling-law material (this section, [Section 5](#s5), Lab 3 and Exercises 6 and 7); everywhere else
in the series $B$ is the batch size.

::: worked title="The case-study model on the law"
Module 08's plan pretrains the case-study model on $D = 2 \times 10^{12}$ tokens, about 210 per
parameter. In Chinchilla's accounting
$C = 6 \times 9.55 \times 10^9 \times 2 \times 10^{12} = 1.15 \times 10^{23}$ FLOPs (with the
matrix-multiply weights and attention at $T = 8{,}192$ it is $1.22 \times 10^{23}$;
[Module 08, Section 1](module_08_EN.html#s1)). The predicted loss:

- capacity term: $406.4/(9.55 \times 10^9)^{0.34} = 406.4/2{,}472 = 0.164$;
- data term: $410.7/(2 \times 10^{12})^{0.28} = 410.7/2{,}780 = 0.148$;
- loss: $1.69 + 0.164 + 0.148 = 2.002$ nats per token.

That is ten times the rule of thumb's 20 tokens per parameter; [Section 5](#s5) explains why a team
would do it.
:::

::: figure id=fig-07-6
IsoFLOP curves of the published parametric law. x axis: N from 10^7 to 10^12 parameters (log
scale); y axis: predicted loss in nats per token. One curve per budget, C = 10^19, 10^20, 10^21,
10^22, 10^23 and 5.76×10^23 FLOPs, each the law evaluated along D = C/(6N), with its minimum marked
by a dot; a dashed line joins the minima, the compute-optimal frontier. Gopher (280B parameters on
300B tokens) and Chinchilla (70B on 1.4T) are marked at their predicted losses, 1.993 and 1.937;
Gopher sits slightly above the 5.76×10^23 curve because 6ND counts its run at 5.0×10^23 FLOPs.
:::

### The compute-optimal allocation, derived

Fix the budget $C$ and ask which $N$ minimises the loss. Substitute the constraint $D = C/(6N)$:

$$
L(N) = E + A N^{-\alpha} + B \left(\frac{C}{6N}\right)^{-\beta}
= E + A N^{-\alpha} + B \left(\frac{C}{6}\right)^{-\beta} N^{\beta}.
$$

Set the derivative to zero:

$$
\frac{dL}{dN} = -\alpha A N^{-\alpha-1} + \beta B \left(\frac{C}{6}\right)^{-\beta} N^{\beta-1} = 0.
$$

Multiply by $N$ and use $(C/6)^{-\beta} N^{\beta} = (C/(6N))^{-\beta} = D^{-\beta}$:

$$
\alpha A N^{-\alpha} = \beta B D^{-\beta}. \tag{4.1}
$$

Read (4.1) as a balance: at the optimum, a 1% larger model and 1% more data lower the loss by the
same amount. To solve it for $N$, write its right side as $\beta B (C/6)^{-\beta} N^{\beta}$ and
collect the powers of $N$: $N^{\alpha+\beta} = (\alpha A/\beta B)\,(C/6)^{\beta}$. Hence

$$
N_{\text{opt}} = G \left(\frac{C}{6}\right)^{a}, \qquad
D_{\text{opt}} = \frac{C/6}{N_{\text{opt}}} = G^{-1} \left(\frac{C}{6}\right)^{b},
$$

$$
a = \frac{\beta}{\alpha+\beta}, \qquad b = \frac{\alpha}{\alpha+\beta}, \qquad
G = \left(\frac{\alpha A}{\beta B}\right)^{1/(\alpha+\beta)}.
$$

The exponents add to one, because $ND = C/6$. Rearranged, (4.1) gives the corollary: at the optimum
the parameter term $A/N^{\alpha}$ is $\beta/\alpha$ times the data term $B/D^{\beta}$, 0.82 with the
published values. The stationary point is the minimum. In $u = \ln N$ the loss along the constraint
is $E + A e^{-\alpha u} + B (C/6)^{-\beta} e^{\beta u}$, a sum of two exponentials with positive
coefficients, which is convex, so its one stationary point is its global minimum.

::: worked title="The allocation at Chinchilla's budget"
Take $C = 5.76 \times 10^{23}$ FLOPs and the published constants.

1. $a = 0.28/0.62 = 0.452$ and $b = 0.34/0.62 = 0.548$.
2. $G = \big(0.34 \times 406.4/(0.28 \times 410.7)\big)^{1/0.62} = (138.2/115.0)^{1.613} = 1.2016^{1.613} = 1.345$.
3. $C/6 = 9.6 \times 10^{22}$, so $N_{\text{opt}} = 1.345 \times (9.6 \times 10^{22})^{0.452} = 1.345 \times 2.39 \times 10^{10} = 3.2 \times 10^{10}$.
4. $D_{\text{opt}} = 9.6 \times 10^{22}/(3.2 \times 10^{10}) = 3.0 \times 10^{12}$, about 93 tokens
   per parameter.
5. At the optimum the parameter term is $406.4/(3.22 \times 10^{10})^{0.34} = 0.109$ and the data
   term $410.7/(2.98 \times 10^{12})^{0.28} = 0.132$. Their ratio is $0.82 = \beta/\alpha$, and the
   predicted loss is $1.69 + 0.109 + 0.132 = 1.931$ nats.
:::

### Reading the fit honestly

The derivation is exact; the constants are not. With the published values the law's own optimum at
Chinchilla's budget is about 32B parameters on 3.0T tokens, 93 tokens per parameter, not the 70B
parameters and 20 tokens per parameter of the Chinchilla model. The familiar 20 comes from
Approaches 1 and 2, which give $a \approx 0.50$: the paper's Table 3, from Approach 1, pairs 1B
parameters with 20.2B tokens, 10B with 205.1B and 67B with 1.5T. The parametric exponents are poorly
determined. Unrounded, they are $\alpha = 0.3392$ and $\beta = 0.2849$, which give
$4.0 \times 10^{10}$ parameters and 59 tokens per parameter at the same budget. Besiroglu et al.
(2024) reconstructed the paper's data, found the published Approach-3 estimates inconsistent with
it, and judged the paper's interval for $a$ (0.454 to 0.455, in its Table 2) implausibly narrow for
about 400 runs. Their refit, $E = 1.8172$, $A = 482.01$, $B = 2085.43$, $\alpha = 0.3478$ and
$\beta = 0.3658$, gives $7.2 \times 10^{10}$ parameters and about 18 tokens per parameter, in line
with Approaches 1 and 2. The conclusion that survives is the qualitative one: grow $N$ and $D$
together, roughly in proportion. "20 tokens per parameter" is a rule of thumb with an error bar.

::: worked title="Ten times the compute"
With the published exponents, tenfold compute multiplies $N_{\text{opt}}$ by $10^{0.452} = 2.83$
and $D_{\text{opt}}$ by $10^{0.548} = 3.53$; the product is $2.83 \times 3.53 = 10$, as it must be.
With $a = b = 0.5$, each grows $\sqrt{10} = 3.16$ times. Kaplan's allocation grows $N$ by
$10^{0.73} = 5.4$ and leaves $D$ only $10^{0.27} = 1.9$ times more.
:::

::: figure id=fig-07-7
Compute-optimal model size against training compute on log-log axes, C from 10^18 to 10^26 FLOPs:
straight lines of slope 0.73 (Kaplan et al.), 0.50 (Approaches 1 and 2), 0.452 (the published
Approach-3 fit) and 0.513 (the replication's refit). The two Approach-3 lines are drawn from their
formulas, N_opt = G(C/6)^a, and nearly coincide at 10^18 FLOPs (8×10^7 parameters); the Approach 1-2
line passes through Table 3's 67B parameters at 5.76×10^23 FLOPs; Kaplan's line, whose constant
counts non-embedding parameters on another corpus, starts from the Approach-3 lines' common point at
10^18 FLOPs, so that only its slope is compared. Chinchilla (70B) and Gopher (280B) are points at
5.76×10^23. The lines diverge as they are extrapolated: at 10^26 FLOPs the three Chinchilla-based
lines alone span 3.3×10^11 to 1.0×10^12 parameters.
:::

### Kaplan against Chinchilla

The two studies disagree because their experiments differed. Kaplan's runs used a learning-rate
schedule whose length was not matched to each run, counted only non-embedding parameters, and
stopped at a smaller scale. Two later analyses reconcile the results with different emphases.
Pearce and Song (2024) attribute most of the difference to the parameter counting at small scale,
where embeddings are a large share of a model; Porian et al. (2024) attribute it to the accounting of
compute, the warmup and the tuning of the optimiser at each scale, and find careful learning-rate
decay less essential than Hoffmann et al. thought. Both locate the difference in how the experiments
were set up and counted.

### Gopher against Chinchilla

The paper tested its conclusion by training Chinchilla, 70B parameters on 1.4T tokens, with the same
compute budget as DeepMind's earlier Gopher, 280B parameters on 300B tokens: $5.76 \times 10^{23}$
FLOPs by the paper's accounting. ($6ND$ gives $5.0 \times 10^{23}$ for Gopher and
$5.9 \times 10^{23}$ for Chinchilla.) The comparison was at the same compute, not at less. Chinchilla
was better on nearly every evaluation, and with a quarter of the parameters it costs a quarter as
much per token to serve.

::: worked title="Gopher against Chinchilla on the law"
- Gopher: $1.69 + 406.4/(2.8 \times 10^{11})^{0.34} + 410.7/(3 \times 10^{11})^{0.28} = 1.69 + 0.052 + 0.251 = 1.993$ nats.
- Chinchilla: $1.69 + 406.4/(7 \times 10^{10})^{0.34} + 410.7/(1.4 \times 10^{12})^{0.28} = 1.69 + 0.083 + 0.163 = 1.937$ nats.

Gopher's size makes its capacity term small, but its 300B tokens leave a data term of 0.251, half as
large again as Chinchilla's 0.163: Gopher was starved of data. Moving compute from parameters to
tokens bought 0.056 nats.
:::

### What the law is for

The law plans runs ([Module 08](module_08_EN.html)): it says what loss a budget should buy and how to
split the budget between parameters and tokens. It also detects broken runs: a loss curve that sits
above the prediction for its $N$ and $D$ points to a fault in the data, the optimiser or the code.
The constants belong to one corpus and one tokenizer, though, and do not transfer. Refit them on
your own small runs, as [Lab 3](#lab3) does.

::: check
If compute grows a hundredfold, how much should $N$ and $D$ grow when $a = b = 0.5$?
:::

::: answer
Tenfold each: $100^{0.5} = 10$, and $10 \times 10 = 100$ keeps $C = 6ND$.
:::

::: check
Why does $6ND$ undercount training FLOPs at long context?
:::

::: answer
It leaves out attention's $T$-dependent term, whose ratio to the weight FLOPs is
$LTd/N_{\text{matmul}}$: 54% at 32k tokens for the case-study model.
:::

::: check
What does $E = 1.69$ mean, as a perplexity?
:::

::: answer
It is the loss no model can beat on that corpus with that tokenizer, the entropy floor of
Section 1. As a perplexity it is $e^{1.69} = 5.4$: even a perfect model of that text would remain as
uncertain as a choice among about five tokens.
:::
