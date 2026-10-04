## The modern decoder block, part by part {#s9}

The attention formula has survived many changes to the surrounding block. A useful way
to read a model configuration is to separate the mathematical operation from its storage,
parameter sharing and implementation. Changing the number of KV heads changes the model.
Changing the kernel that computes the same attention usually changes only its execution.

| Component | Choice in this module's decoder | Reason and earlier discussion |
|---|---|---|
| Normalisation | RMSNorm, before each sublayer | A simple pre-norm residual path; [Section 5](#s5) |
| Position | RoPE on queries and keys | Relative position through rotations; [Section 6](#s6) |
| Attention | Grouped-query attention | Smaller key/value projections and cache; below |
| Feed-forward activation | SwiGLU | Gated features with a controlled parameter budget; [Section 5](#s5) |
| Linear biases | None | Fewer parameters and simpler projections |
| Attention implementation | Fused scaled dot-product attention | Avoid materialising intermediate matrices; [Section 10](#s10) |

These are design choices rather than a checklist that every decoder must satisfy. A
checkpoint with learned positions, biases or ordinary multi-head attention still computes
a transformer. Changing its choices at inference requires more than changing a configuration
file: the stored weights were trained for the original computation.

### Why generation keeps keys and values

During training, a causal mask lets every position predict its successor in one parallel
forward pass. During generation, only one new token is available at each step. Its query
needs the keys and values of the entire visible prefix at every layer. Recomputing that
prefix repeatedly wastes work. A **KV cache** stores those projected keys and values so
that the next step computes only the new token's projections and attends to the stored ones.

The cache does not store future tokens and does not make the layers independent. The new
token still passes through every layer in order. Each layer appends its own key and value,
computed from that layer's input state. The previous queries need not be retained because
they will never be used to produce a new output.

For $L$ layers, $n_{\text{kv}}$ KV heads, head width $d_{\text{head}}$, and $b_v$ bytes per
stored value, the storage added by one token is

$$
M_{\text{token}} = 2L n_{\text{kv}}d_{\text{head}}b_v.
$$

The factor two counts keys and values. Multiply by the retained sequence length and
number of sequences for a batch's tensor storage. Allocation overhead is additional.
Computed tensor sizes here use binary units: 1 KiB is 1024 bytes, 1 MiB is $2^{20}$ bytes
and 1 GiB is $2^{30}$ bytes. Hardware specifications use decimal GB and TB/s. When later
modules reuse a size, both binary and decimal forms are given.

::: worked title="Three cache layouts at the same query width"
Take 32 layers, head width 128 and bf16 storage, two bytes per value. Full multi-head
attention with 32 KV heads adds $2\times32\times32\times128\times2=524{,}288$ bytes
per token: 512 KiB. Eight KV heads add 131,072 bytes, or 128 KiB. One KV head adds
16,384 bytes, or 16 KiB. For 4096 retained tokens, these become 2 GiB (2.15 GB),
512 MiB (0.54 GB) and 64 MiB (0.067 GB). The query heads remain 32 in all three cases.
:::

### Sharing keys and values without sharing queries

In **grouped-query attention**, several query heads use the same key head and value head.
Queries remain distinct. With eight query heads and two KV heads, each group of four
queries uses one KV head. Multi-query attention is the extreme with one KV head for all
queries; ordinary multi-head attention gives each query head a separate KV head.
[Ainslie et al.](https://arxiv.org/abs/2305.13245) study the quality and inference trade-off,
including conversion of existing multi-head checkpoints followed by further training.

The projections for keys and values shrink from width $d$ to
$n_{\text{kv}}d_{\text{head}}$. Query and output projections retain width $d$. The
attention score computation does not shrink by the same factor: every query head still
scores every visible key. Cache capacity, projection parameters and attention arithmetic
are three different quantities.

::: worked title="The head-order bug"
Label the two KV heads 0 and 1. `repeat_interleave(4, dim=1)` expands them into
`[0, 0, 0, 0, 1, 1, 1, 1]`, the mapping expected by contiguous groups of query heads.
`repeat(1, 4, 1, 1)` instead gives `[0, 1, 0, 1, 0, 1, 0, 1]`. Both produce the same
tensor shape. Only one matches this checkpoint's grouping. A shape check cannot detect
the error; compare the outputs with an explicit per-group calculation.
:::

::: figure id=fig-06-19
Multi-head, grouped-query and multi-query layouts. Query heads retain separate projections
while groups share key/value heads. Cache comparisons use the 32-query-head, 32-layer
configuration in the worked example, rather than the eight heads drawn for legibility.
:::

Small decoders often **tie embeddings**: the input lookup table and output projection
share a parameter tensor. The output projection is still computed. Tying saves storage,
not the multiplication that produces vocabulary logits. Untied models can learn separate
input and output representations at the cost of a second vocabulary-sized matrix.

### Restricting the visible past

A sliding window of width $w$, including the current position, permits keys from
$\max(0,t-w+1)$ through $t$. Attention then costs $O(Tw)$ instead of $O(T^2)$ for a
sequence of length $T$. Across layers, information can travel beyond a single window:
each additional layer can extend the dependency path by $w-1$ positions. The theoretical
reach through $L$ layers is $L(w-1)$ positions backwards, subject to the available prefix.
This is a dependency bound; it does not establish reliable retrieval across that distance.

::: worked title="A width-four window across three layers"
At zero-based position 7, layer 1 can read positions 4–7. At layer 2 it can read states
whose own inputs reach positions 1–7. A third layer reaches position 0 in an eight-token
sequence. The maximum backward span is $3(4-1)=9$ positions, clipped by the start of
the sequence. No single attention head directly reads all of those input tokens.
:::

For a layer using only local attention, keys older than the window can be discarded from
its cache. A layer using full attention still needs the full past. Some streaming recipes
also retain initial tokens because learned attention can assign them substantial weight;
evicting those attention sinks changes the model's behaviour. Cache policy must match the
attention pattern used by the model. [Module 10](module_10_EN.html) develops the serving
consequences.

::: check
Does grouped-query attention reduce the FLOPs of the query-key score matrix by the
ratio of query heads to KV heads?
:::

::: answer
No. Every query head still computes its own scores. It reduces key/value projections
and cache storage, while the score and value-mixing arithmetic retains the query-head count.
:::

## FlashAttention and the online softmax {#s10}

The dense attention formula looks like three operations: form scores, normalise them,
then multiply by values. A literal implementation writes scores to main GPU memory,
reads them for softmax, writes probabilities and reads them again for value mixing.
Those intermediate matrices grow quadratically with sequence length. The output grows
only linearly. An exact implementation can avoid storing the large intermediates.

::: worked title="The score matrix outgrows the useful output"
With 32 heads and 8192 positions, a bf16 score tensor contains
$32\times8192^2\times2=4{,}294{,}967{,}296$ bytes: 4 GiB for one layer of one sequence.
One fp32 log-sum-exp statistic per head and query contains
$32\times8192\times4=1{,}048{,}576$ bytes: 1 MiB. Inputs, outputs and temporary tiles
still need storage; the comparison concerns saved attention intermediates.
:::

[FlashAttention](https://arxiv.org/abs/2205.14135) organises the computation around GPU
memory levels. A small score tile lives in fast on-chip memory, contributes to the output
and is discarded. The mathematical problem is that softmax normalises a whole row:
a tile cannot know the denominator contributed by keys it has not seen. The solution is
to maintain a running normaliser and rescale it when later scores raise the maximum.

### From safe softmax to a running invariant

For scores $s_j$, subtracting their maximum $m$ gives

$$
p_j=\frac{e^{s_j-m}}{\sum_k e^{s_k-m}}.
$$

Multiplying numerator and denominator by $e^m$ recovers the original formula, so this
does not change the probabilities. All exponentials are at most one. For scores
$(1000,1001,1002)$, direct exponentiation overflows ordinary floating-point formats.
After subtracting 1002, the exponentials are $(e^{-2},e^{-1},1)$ and the probabilities
are approximately $(0.090,0.245,0.665)$.

Suppose the processed keys have running maximum $m$ and running sum
$\ell=\sum_{j\in\text{seen}}e^{s_j-m}$. A new block has maximum $m_b$ and local sum
$\ell_b=\sum_{j\in\text{block}}e^{s_j-m_b}$. The new maximum and sum are

$$
\begin{aligned}
m'&=\max(m,m_b),\\
\ell'&=\ell e^{m-m'}+\ell_b e^{m_b-m'}.
\end{aligned}
$$

To verify the update, expand its first term:
$\ell e^{m-m'}=\sum_{j\in\text{seen}}e^{s_j-m}e^{m-m'}
=\sum_{j\in\text{seen}}e^{s_j-m'}$. The second term expresses the new block on the
same scale. Their sum is therefore the required invariant for all processed keys.
Starting from an empty sum proves the invariant by induction over blocks.

The output needs the weighted values as well as the denominator. Keep
$\mathbf{a}=\sum_{j\in\text{seen}}e^{s_j-m}\mathbf{v}_j$ and update

$$
\mathbf{a}'=\mathbf{a}e^{m-m'}+
\sum_{j\in\text{block}}e^{s_j-m'}\mathbf{v}_j.
$$

The same expansion proves the accumulator invariant. After the final block,
$\mathbf{o}=\mathbf{a}/\ell$ is exactly the softmax-weighted value sum. The
probabilities themselves never need to be written out.

::: worked title="Row three, in two blocks"
The first two scores are $1/\sqrt2$ and $1/\sqrt2$. Their values are $(1,0)$ and $(0,2)$.
After that block, $m=0.707107$, $\ell=2$ and $\mathbf{a}=(1,2)$.
The final score is $\sqrt2$, with value $(3,3)$. The old accumulator and sum must be
multiplied by $e^{-1/\sqrt2}=0.493069$. Thus $m'=1.414214$,
$\ell'=2(0.493069)+1=1.986137$, and
$\mathbf{a}'=(1,2)(0.493069)+(3,3)=(3.493069,3.986137)$.
Dividing gives $(1.759,2.007)$, the dense result of [Section 3](#s3).
:::

### Query blocks, key blocks and the causal diagonal

Partition queries into blocks of $B_r$ rows and keys/values into blocks of $B_c$ rows.
For each query block, keep per-row maxima and normalisers and a vector accumulator per
row. Form one $B_r\times B_c$ score tile, update the statistics, and discard it. After
processing visible keys, divide the accumulators by the normalisers and write the output.

Tiles entirely above the causal diagonal contribute nothing and can be skipped. Tiles
crossing the diagonal still need an elementwise mask. At $T=1024$ and square tiles of
width 64, there are 16 tiles on each axis. Only $16(17)/2=136$ of 256 tiles contribute.
Each float64 score tile holds $64^2\times8=32$ KiB instead of the dense 8 MiB matrix.
[Lab 3](#lab3) implements this and checks unequal and incomplete tiles too.

The persistent per-row statistics have $O(T)$ storage per head. The output itself has
$O(Td_{\text{head}})$ storage, and workspace holds a tile and its accumulator. Saying
that attention uses linear additional storage does not say that the entire model takes
constant memory or that attention takes linear arithmetic. Full attention still scores
every visible query-key pair.

### Backward by recomputation

During backpropagation the probability tile can be recovered from a recomputed score
tile and the saved row log-sum-exp $m+\ln\ell$. This avoids saving a dense probability
matrix for each layer. Recomputing scores adds arithmetic while reducing memory traffic.
On hardware limited by that traffic, the trade can improve elapsed time. It is different
from dropping keys, approximating softmax or restricting attention to a window.

PyTorch's `scaled_dot_product_attention` selects an available implementation according
to device, dtype, shapes and masks. Calling the function on a CPU does not establish that
a CUDA FlashAttention kernel ran. The notebook's numerical checks verify the function;
GPU profiling is needed to identify the selected kernel and measure its performance.

::: check
Why must both the normaliser and accumulator be rescaled when a block raises the maximum?
:::

::: answer
Both contain exponentials relative to the old maximum. Multiplication by
$e^{m-m'}$ expresses their old contributions on the new scale. Rescaling only one
changes their ratio and gives a wrong output.
:::

::: keyidea
FlashAttention preserves full attention while changing the order of computation and
the locations of intermediates; floating-point rounding can differ.
:::

## Counting parameters and FLOPs {#s11}

A model's advertised size is a storage count. Compute depends on which weights are
multiplied, how many tokens see each other, and whether the kernel evaluates masked
entries. Counting from tensor shapes gives an estimate with explicit assumptions.

### Count one layer before counting the stack

Let residual width be $d$, query-head count $h$, KV-head count $n_{\text{kv}}$ and head
width $d_{\text{head}}=d/h$. Query and output projections each contain $d^2$ weights.
Key and value projections each contain $d n_{\text{kv}}d_{\text{head}}$. Attention
therefore contains $2d^2+2d n_{\text{kv}}d_{\text{head}}$ weights. With full multi-head
attention this becomes $4d^2$.

A SwiGLU feed-forward network has two $d\times d_{\text{ff}}$ input matrices and one
$d_{\text{ff}}\times d$ output matrix: $3dd_{\text{ff}}$ weights. Choosing
$d_{\text{ff}}\approx8d/3$ gives approximately $8d^2$, matching an ordinary two-matrix
FFN of width $4d$. Two RMSNorm gains add $2d$. Biases, if present, must be counted too.
For full multi-head attention with that FFN budget, one layer has about $12d^2$ weights.

The vocabulary adds $Vd$ weights when embeddings are tied and $2Vd$ when untied.
Learned positions add $T_{\max}d$; RoPE adds no learned table. A final RMSNorm adds $d$.

::: worked title="An exact Llama-2-7B-shaped count"
Use $L=32$, $d=4096$, 32 query and KV heads, $d_{\text{ff}}=11008$, vocabulary
size $V=32000$, untied embeddings and no biases. Attention has 67,108,864 weights;
the FFN has 135,266,304 and the two norms 8192. Each layer has 202,383,360.
The stack has 6,476,267,520. Add two 131,072,000-weight vocabulary matrices and
4096 final-norm gains to get **6,738,415,616**. At two bytes per value the weights
take 13.5 GB (12.6 GiB). Optimiser state, activations and caches are additional.
:::

The approximate $12Ld^2+2Vd$ rule gives 6.70 billion for that shape. It works because
the architecture nearly matches the rule's assumptions. [Lab 4](#lab4) obtains
124,439,808 for GPT-2 small, 134,515,008 for SmolLM2-135M, 494,032,768 for
Qwen2.5-0.5B and 8,030,261,248 for Llama-3-8B. Grouped queries, vocabulary size,
FFN width, bias conventions and position tables explain differences from the rule.
Small models can spend a large fraction of their storage on the vocabulary matrix.

### Separate storage from matrix-multiply work

Define $N_{\text{total}}$ as every distinct parameter. Define $N_{\text{matmul}}$ as
that count minus lookup-only tables: an untied input embedding and learned positions.
For tied embeddings, the vocabulary matrix remains in $N_{\text{matmul}}$ because
it also computes output logits. Norm gains and biases are retained in this accounting;
their actual operations are not matrix products, but their small contribution makes
this a useful approximate convention.

The worked shape has $N_{\text{matmul}}=6{,}738{,}415{,}616-131{,}072{,}000
=6{,}607{,}343{,}616$. One multiply-add counts as two FLOPs. Multiplying an
$m\times n$ matrix by an $n\times p$ matrix costs approximately $2mnp$ FLOPs.
Thus the learned matrix products cost approximately $2N_{\text{matmul}}$ per token.
Lookup is not a dense multiplication by a one-hot vector in a practical implementation.

### Attention adds a context-dependent cost

At a position seeing $t$ keys, query-key multiplication costs $2td$ per layer and
value mixing costs another $2td$. Across layers that is $4Ldt$. Grouped queries
do not change $hd_{\text{head}}=d$ in these products.

Across a causal sequence of $T$ positions, the mean visible length is $(T+1)/2$.
The exact pair-count term is $2Ld(T+1)$ per token, usually approximated by $2LdT$.
A kernel evaluating the full square before masking instead pays $4LdT$. Tile-boundary
work and softmax operations add overhead that this arithmetic estimate omits.

::: worked title="When context is no longer a small correction"
The worked model's weight products cost 13.21 GFLOP per token. Its attention adds
0.27 GFLOP at $t=512$, 2.15 at $t=4096$ and 17.18 at $t=32768$. Relative to weight
work those are approximately 2%, 16% and 130%. Averaged over a causal 4096-token
sequence, attention adds 1.07 GFLOP, approximately 8%. The last token's cost and the
sequence-average cost are different numbers.
:::

::: figure id=fig-06-23
Parameter shares for the five published decoder configurations counted in Lab 4:
vocabulary matrices, attention, feed-forward networks and norms. Each bar totals 100%.
:::

::: figure id=fig-06-24
Llama-2-7B-shaped forward compute against context length. Weight multiplication is
constant per token, while full attention grows with context. The one-token and causal
average attention curves cross the weight term at approximately 25,205 and 50,410 tokens.
:::

Equating $4Ldt$ with the approximate weight cost $2(12Ld^2)$ gives $t=6d$.
Using the causal average gives $T=12d$. These are dimensional rules for the assumed
architecture; including the output projection and exact FFN width shifts the crossings.

### Why training is approximately three forwards

For $\mathbf{Y}=\mathbf{X}\mathbf{W}$, backpropagation computes
$\partial\mathcal{L}/\partial\mathbf{X}=(\partial\mathcal{L}/\partial\mathbf{Y})
\mathbf{W}^{\top}$ and
$\partial\mathcal{L}/\partial\mathbf{W}=\mathbf{X}^{\top}
(\partial\mathcal{L}/\partial\mathbf{Y})$. Both have the same leading multiply-add
count as the forward product. Forward plus backward therefore costs approximately
three forward products. The attention products have the same leading relationship.
Recomputation, optimiser updates, communication and data loading are outside this model.

::: note
**The series' FLOP convention.** Memory and scaling-law model size use
$N_{\text{total}}$. Forward compute per token is approximately
$2N_{\text{matmul}}+4Ldt$ at visible context $t$, or
$2N_{\text{matmul}}+2LdT$ averaged over a causal sequence whose masked pairs are skipped.
Training costs approximately three times forward compute. An untied input embedding
and learned position tables are lookup-only and excluded from $N_{\text{matmul}}$.
The shortcuts $2N_{\text{total}}$ and $6N_{\text{total}}$ must be labelled estimates.
:::

For the worked shape at $T=4096$, training costs $6N_{\text{matmul}}+6LdT
=39.64+3.22=42.87$ GFLOP per token. The shortcut $6N_{\text{total}}=40.43$ is
5.7% low. It incorrectly charges 0.79 GFLOP for the input embedding and omits
3.22 GFLOP for attention. Those opposite errors do not cancel. Multiply the per-token
cost by training tokens for model compute; [Module 08](module_08_EN.html) turns that
into a run budget and adds execution overhead.

::: check
Why does tying the output head to the input embedding not remove its $2Vd$ FLOPs?
:::

::: answer
Tying removes a second stored parameter matrix. Each output still multiplies the hidden
state by that shared matrix to compute all vocabulary logits.
:::

## Training a tiny GPT {#s12}

The decoder in [Lab 4](#lab4) joins the pieces: adjacent-pair RoPE, grouped keys and
values, scaled dot-product attention, pre-norm residuals, SwiGLU and a tied output head.
Its default shape has vocabulary 4096, width 256, four layers, eight query heads,
two KV heads and FFN width 682. It contains 3,801,344 distinct parameters. The model
used for [Lab 5](#lab5) is smaller: width 128, four query heads and four layers.

### Inspect initialisation before trusting the loss curve

Cross-entropy is $-\ln p(y)$ for the correct next token. Nearly uniform predictions give
loss $\ln V$: 8.318 nats at $V=4096$. Random initial logits need not be exactly equal,
so the initial loss can be slightly higher. A loss far above this baseline suggests a
scale or alignment problem before it suggests that the task is unusually difficult.

Tying weights creates a particular initialisation trap. A default embedding table has
unit-scale entries. The residual state initially resembles its own input embedding;
after final normalisation its dot product with that same embedding can be of order $d$.
The shared output head then strongly predicts the current token rather than the next one.
Initialising the shared table with standard deviation 0.02 keeps those logits much smaller.
The lab's decoder explicitly calls `nn.init.normal_(self.emb.weight, std=0.02)` after
tying. Measure the actual first-batch loss, logit spread and target alignment together.

### Every window contains many predictions

Draw a window of $T+1$ tokens. Inputs are `window[:-1]` and targets `window[1:]`.
Position zero predicts the second token from the first; position one predicts the third
from the first two. The causal mask ensures that no position reads its own target.
The loss averages across both batch and sequence dimensions. Omitting the shift instead
teaches token reconstruction, which can produce a reassuring loss for the wrong task.

The synthetic maintenance-log task repeats a record identifier at the end of a line.
Its vocabulary, status rule and record format are local regularities. Copying the closing
identifier requires information from farther back. Since the data generator is known,
its entropy can be calculated rather than inferred from a trained model's score. The
lab distinguishes uniform, unigram, bigram, no-copy and true-generator baselines. Only
the true conditional entropy is an information-theoretic floor for the intended source;
the no-copy reference describes a restricted predictor.

AdamW, warmup, cosine decay and gradient clipping use the optimisation tools from
[Module 02](module_02_EN.html). A fixed seed makes a run easier to compare, but does
not guarantee identical transitions across hardware and thread counts. The meaningful
measurements are held-out loss and the fraction of generated records whose closing
identifier matches their opening identifier. A lower loss alone does not identify
which attention head performs copying. [Lab 6](#lab6) tests a simpler copying mechanism
with attention measurements and interventions.

In the executed 1500-step run, held-out loss reached 0.399 nats per character, below
the no-copy reference of 0.501 and above the generator entropy of 0.330. Of 172 complete
generated lines, all parsed, 155 copied their identifier correctly (90.1%), and 171
used the correct status (99.4%). These are measurements of this model, seed and sample;
they are not guaranteed outcomes of every run. The 300-step QUICK run reached 0.532
and copied none of its 170 parsed identifiers correctly.

::: figure id=fig-06-25
Measured maintenance-log validation loss for the 1500-step causal run and 200-step
unmasked control. The causal model eventually passes the restricted no-copy reference;
the unmasked model passes the source entropy by reading future tokens. The right panel
compares each model's ordinary window loss with prefix-only scoring after training.
:::

### Sampling measures a different situation from teacher forcing

To generate, feed the prefix, read the last-position logits, divide by temperature
(0.8 in the lab), sample the next token and append it. Crop to the supported context
length and repeat. Earlier generated mistakes become part of subsequent inputs.
[Module 07](module_07_EN.html) explains sampling choices and their effects.

Without a KV cache, generating 128 characters from one initial character processes
$1+2+\cdots+128=8256$ input positions. Caching processes the initial position and
then one new position per step, with the existing keys and values available. That
removes repeated prefix projections; it does not remove the new query's attention over
the prefix. At this short length the position-count ratio is 64.5, rather than a
guaranteed wall-clock speedup of 64.5.

### A validation split cannot fix architectural leakage

Remove the causal mask while leaving targets shifted by one. Most positions can now
read the next input token, which is exactly their target. Both training and held-out
window loss can fall sharply because both splits expose the same future information.
The final position of each window is the exception: its target lies outside the inputs.

Prefix-only scoring supplies each prediction with only its actual available prefix.
This is slower than scoring one full unmasked window, but matches generation's access
to information. Compare that loss, ordinary window loss and generated records. A large
gap exposes the leak. A held-out split protects against certain forms of memorisation;
it cannot enforce information boundaries that the model architecture violates.

The unmasked control's held-out window loss was 0.014, yet its prefix-only loss was
1.291 and none of its 83 complete generated lines parsed. The full causal model's
prefix-only loss was 0.394. Prefix-only scoring averages a different selection of
positions from window scoring, so exact equality is not expected even for a causal
model. The size and direction of the control's gap are the diagnostic evidence.

::: check
A model with vocabulary 256 starts with loss 12.7. What should be inspected first?
:::

::: answer
The uniform baseline is $\ln256=5.545$. Inspect initial logit scale, tied embedding
initialisation and input/target alignment before running a long optimisation experiment.
:::

## What goes wrong {#wrong}

| Symptom | Likely cause | Diagnostic or correction |
|---|---|---|
| Excellent window loss, poor generation | Missing causal mask or an unshifted target | Compare prefix-only scoring; inspect the input/target pair |
| Very large loss at step zero | Oversized logits, especially with tied embeddings | Compare with $\ln V$ and print logit spread |
| Shapes pass, grouped heads give wrong outputs | Alternating KV expansion instead of contiguous groups | Compare with an explicit group loop |
| RoPE changes scores after shifting both positions | Rotating only one side or mixing conventions | Run the common-shift and complex-multiplication checks |
| NaNs in attention | Overflow or an all-masked row | Use stable softmax; define padding and empty-row handling |
| Tiled results depend strongly on tile size | Missing maximum rescaling or a tile-boundary mask error | Compare with a float64 dense reference |
| Memory rises quadratically despite a fused kernel | Another path stores attention weights or a full mask | Inspect tensor allocations and the selected implementation |
| A local window loses information | Direct visibility or retained sinks were removed | Test the trained attention pattern and cache policy |
| Compute estimates disagree | Different embedding or causal-pair conventions | Report $N_{\text{total}}$, $N_{\text{matmul}}$, length and masking assumptions |
| A head's heat map is treated as a semantic explanation | Attention weights alone are incomplete evidence | Measure output changes under controlled intervention |

Validate numerical equivalence before comparing performance. Validate the learning task
before interpreting its loss. These checks are cheap compared with training a model on
the wrong computation.
