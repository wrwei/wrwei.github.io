## Drop the recurrence {#s1}

[Module 04](module_04_EN.html#s11) ended with attention as a fix for the encoder–decoder
bottleneck. At each output step the decoder took a weighted sum of the encoder states, with the
weights computed from a score between its current state and each of them. In Bahdanau's form the
score is a small network:

$$
e_{t,j} = \mathbf{v}^\top \tanh(\mathbf{W}_s \mathbf{s}_{t-1} + \mathbf{W}_h \mathbf{h}_j), \qquad
\alpha_{t,j} = \frac{\exp(e_{t,j})}{\sum_k \exp(e_{t,k})}, \qquad
\mathbf{a}_t = \sum_j \alpha_{t,j}\,\mathbf{h}_j,
$$

where $\mathbf{s}_{t-1}$ is the decoder state, $\mathbf{h}_j$ the encoder state at position $j$
and $\mathbf{a}_t$ the context vector the decoder reads at step $t$. Luong and colleagues replaced
the small network by multiplicative scores, the dot product $\mathbf{s}^\top\mathbf{h}_j$ or the
bilinear form $\mathbf{s}^\top\mathbf{W}\mathbf{h}_j$, which turn the scoring of every position
into one matrix product. In both, attention was an addition to two recurrent networks. The
transformer (Vaswani et al. 2017) removes the recurrence altogether and makes attention the
*only* way positions communicate.

### What recurrence costs

Recurrence has two costs that no amount of engineering removes.

**It is sequential in time.** Step $t$ needs $\mathbf{h}_{t-1}$, which needs
$\mathbf{h}_{t-2}$, and so on back to the first token. A training sequence of 10,000 tokens is
therefore 10,000 dependent steps in every layer, whatever the hardware: a GPU can process many
sequences side by side, but inside one sequence each step waits for the one before. Teacher
forcing makes every input known in advance and still does not help, because the nonlinearity
sits inside the loop.

**Its paths are long.** Information from position $j$ reaches position $t$ through $t - j$
applications of the recurrence, each of which squeezes it through the same fixed-width state and
can lose some of it. The vanishing gradients of [Module 04](module_04_EN.html#s4) are the same
long path, travelled backwards.

Self-attention removes both. Every position computes a weighted sum over every position it is
allowed to see, and all positions do so at once, in one matrix multiply: a 10,000-token sequence
becomes one large matrix operation instead of 10,000 small dependent ones. The path between any
two positions is one layer long, whatever their distance (Figure 6.1).

::: figure id=fig-06-1
Recurrence and causal self-attention over the same six tokens $\mathbf{x}_1, \dots, \mathbf{x}_6$.
Left, recurrent: a chain of states $\mathbf{h}_1 \to \mathbf{h}_2 \to \dots \to \mathbf{h}_6$ with
arrows only between neighbours, computed in $T$ sequential steps; the highlighted path carries
$\mathbf{x}_1$ to $\mathbf{h}_6$ through 5 recurrent steps, a path length of $t - j$. Right,
causal self-attention: each of the six output positions receives an arrow from every position at
or before it, $T(T+1)/2 = 21$ scored pairs forming a lower-triangular fan, all drawn in one colour
because they are computed in one parallel step; every path has length 1.
:::

### The trade

Nothing is free. Vaswani et al. (2017, Table 1) compare the two kinds of layer on a sequence of
$T$ vectors of width $d$:

| layer | cost per layer | sequential operations | maximum path length |
|---|---|---|---|
| recurrent | $O(Td^2)$ | $O(T)$ | $O(T)$ |
| self-attention | $O(T^2 d)$ | $O(1)$ | $O(1)$ |

A recurrent layer multiplies a $d$-vector by a $d \times d$ matrix at each of $T$ steps;
self-attention scores $T^2$ pairs of positions with dot products of length $d$. The ratio of the
two costs is $T^2 d / (T d^2) = T/d$, so self-attention is the cheaper layer when $T < d$, as it
was for the sentences of a few dozen tokens and the width $d = 512$ of the original translation
model (a ratio of about 0.1 at $T = 50$). Beyond $T = d$ it pays a quadratic price: at
$T = 32{,}768$ and $d = 4{,}096$ the ratio is 8, and it grows linearly with the context. The
table counts only the operation that mixes positions; a self-attention layer also pays
$O(Td^2)$ for its projections ([Section 4](#s4)), as a recurrent layer does for its weights.
[Module 04, Section 12](module_04_EN.html#s12) adds the convolutional alternative and the one
thing recurrence keeps, a constant memory per generated token.

The $T^2$ is a memory cost as well: the $T \times T$ matrix of weights. [Section 10](#s10) shows
how FlashAttention computes attention without ever storing that matrix, which removes the $T^2$
memory but not the $T^2$ arithmetic. The state-space models of
[Module 04, Section 13](module_04_EN.html#s13) take the other road back: a recurrence that is
linear, and can therefore be computed in parallel.

### Attention as a soft dictionary lookup

A Python dictionary is a hard lookup. Given `{"pump": v1, "valve": v2, "tank": v3}` and the query
`"tank"`, it compares the query with the keys, finds the one that is equal and returns that key's
value, `v3`, exactly. Any other query finds nothing.

Attention relaxes each of the three steps. It scores the query against every key with a dot
product, so a key can match partially. It turns the scores into weights with a softmax, so every
key receives a positive weight and the weights sum to 1. It returns the weighted average of the
values, so the answer is a blend in which the best matches count most (Figure 6.2).

::: worked title="A soft lookup with three keys"
Query $\mathbf{q} = (1, 1)$. Keys $\mathbf{k}_1 = (1, 0)$ ('pump'), $\mathbf{k}_2 = (0, 1)$
('valve') and $\mathbf{k}_3 = (1, 1)$ ('tank'); values $\mathbf{v}_1 = (1, 0)$,
$\mathbf{v}_2 = (0, 2)$ and $\mathbf{v}_3 = (3, 3)$.

1. Scores $\mathbf{q}\cdot\mathbf{k}_j$: $1 + 0 = 1$, $0 + 1 = 1$ and $1 + 1 = 2$, so $(1, 1, 2)$.
2. Divide by $\sqrt{d_k} = \sqrt 2 = 1.414$ ([Section 2](#s2) gives the reason):
   $(0.707, 0.707, 1.414)$.
3. Exponentiate: $e^{0.707} = 2.028$ (twice) and $e^{1.414} = 4.113$; the sum is 8.169.
4. Normalise: $(2.028, 2.028, 4.113)/8.169 = (0.248, 0.248, 0.503)$.
5. Average the values, carrying a fourth decimal of the weights (0.2483 and 0.5035):
   $0.2483\,(1, 0) + 0.2483\,(0, 2) + 0.5035\,(3, 3) = (0.2483 + 1.5105,\ 0.4966 + 1.5105)
   = (1.759, 2.007)$.

With the weights rounded to three decimals the last sum drifts to $(1.757, 2.005)$, which is why
step 5 keeps four. A hard lookup with the same query returns $\mathbf{v}_3 = (3, 3)$ exactly;
equal scores would return the average of the values, $(1.333, 1.667)$. The soft lookup lands in
between, pulled toward 'tank', the best match, while still carrying a quarter of each of the
others. This is row 3 of the worked example in [Section 3](#s3), where the same numbers appear
as token 3 attending to all three tokens.
:::

Two limits bracket this behaviour. Multiply all the scores by a factor $c$. As $c$ grows the
largest score dominates the softmax: at $c = 10$ the weights are $(0.001, 0.001, 0.998)$ and the
output is $(2.996, 2.997)$, almost exactly $\mathbf{v}_3$, and in the limit the softmax becomes an
argmax and the lookup is hard. As $c \to 0$, or whenever the scores are equal, every weight is
$1/3$ and the output is the plain average, $(1.333, 1.667)$. Attention lives between the two, and
where it sits is set by the size of the scores, which is why [Section 2](#s2) cares about their
scale.

```python
import numpy as np

table = {"pump": (1, 0), "valve": (0, 2), "tank": (3, 3)}
print(table["tank"])                                 # hard: one exact match

q = np.array([1.0, 1.0])
K = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])   # keys: pump, valve, tank
V = np.array([[1.0, 0.0], [0.0, 2.0], [3.0, 3.0]])   # values
s = K @ q / np.sqrt(2)                               # scaled scores
w = np.exp(s - s.max())                              # subtracting the max avoids overflow
w = w / w.sum()                                      # softmax weights
print(np.round(w, 3), np.round(w @ V, 3))            # soft: a weighted average
```

```output
(3, 3)
[0.248 0.248 0.503] [1.759 2.007]
```

The softness is what makes the lookup learnable. A dictionary offers no useful gradient: a small
change to the query either changes nothing or jumps to another key. The soft lookup's output is a
smooth function of the query, of every key and of every value, so the gradient of a loss tells
each of them which way to move. That is what allows the queries, keys and values to be produced
by learned projections of the tokens ([Section 2](#s2)), and lets training decide what each
position looks for and what it offers.

::: figure id=fig-06-2
Hard and soft lookup. Top: a dictionary with the keys 'pump', 'valve' and 'tank'; the query
'tank' selects exactly one value. Bottom: the query vector $\mathbf{q} = (1, 1)$ is compared with
the key vectors $(1, 0)$, $(0, 1)$ and $(1, 1)$; three bars show the softmax weights 0.248, 0.248
and 0.503, and the output $(1.759, 2.007)$ is drawn as the weighted blend of the value vectors
$(1, 0)$, $(0, 2)$ and $(3, 3)$. A small slider marks the two limits: all scores multiplied by a
large factor give the hard lookup, all scores equal give the plain average.
:::

### What must be added back

Removing the recurrence also removes two things it provided for free. The first is **order**. A
set of weighted sums has no notion of position: shuffle the input tokens and every output is the
same vector as before, moved to its token's new place, so "the pressure exceeds the limit" and
"the limit exceeds the pressure" produce the same set of outputs. [Section 6](#s6) injects
position, and [Exercise 4](#e4) proves the symmetry. The second, for generation, is **the arrow of
time**. A recurrent network cannot see its future, because its state at step $t$ is built from
steps 1 to $t$ only; an attention layer sees every position at once, so a model trained to
predict the next token needs a mask that stops each position from seeing its future
([Section 2](#s2)).

::: keyidea
Attention is a soft, differentiable dictionary lookup: score the query against every key, turn
the scores into weights with a softmax, and return the weighted average of the values.
:::

::: check
Why can a recurrent network not process the 10,000 positions of a training sequence in parallel?
:::

::: answer
Step $t$ needs $\mathbf{h}_{t-1}$, which needs $\mathbf{h}_{t-2}$, and so on back to the start.
The 10,000 steps form a chain of dependencies that must be computed in order, even when every
input is known in advance.
:::

::: check
In the soft lookup above, what does the output become if the three scores are equal?
:::

::: answer
The weights are then $1/3$ each and the output is the plain average of the values,
$\tfrac13\big[(1, 0) + (0, 2) + (3, 3)\big] = (1.333, 1.667)$.
:::

## Scaled dot-product attention {#s2}

Take a sequence of $T$ token vectors stacked as the rows of $\mathbf{X} \in \R^{T\times d}$.
Project each into three roles with learned matrices:

$$
\mathbf{Q} = \mathbf{X}\mathbf{W}_Q, \qquad \mathbf{K} = \mathbf{X}\mathbf{W}_K, \qquad
\mathbf{V} = \mathbf{X}\mathbf{W}_V,
$$

with $\mathbf{W}_Q, \mathbf{W}_K \in \R^{d\times d_k}$ and $\mathbf{W}_V \in \R^{d\times d_v}$.
Row $i$ of each is a projection of token $i$: $\mathbf{q}_i = \mathbf{x}_i\mathbf{W}_Q$, and
likewise $\mathbf{k}_i$ and $\mathbf{v}_i$. A **query** is what a position is looking for; a
**key** is what a position offers to be matched against; a **value** is what it hands over if
matched. Three matrices rather than one, because the roles differ: what a word looks for (a verb
looking for its subject) need not resemble what it offers, and what it hands over need not be
what made it match. Queries and keys share the width $d_k$ so that they can be compared; values
may have any width $d_v$. Then

$$
\operatorname{Attention}(\mathbf{Q},\mathbf{K},\mathbf{V}) =
\softmax\!\Big(\frac{\mathbf{Q}\mathbf{K}^\top}{\sqrt{d_k}}\Big)\mathbf{V}.
$$

$\mathbf{S} = \mathbf{Q}\mathbf{K}^\top/\sqrt{d_k}$ is a $T \times T$ matrix with one score per
(query position, key position), $S_{ij} = \mathbf{q}_i\cdot\mathbf{k}_j/\sqrt{d_k}$. The softmax
is applied along each row, $P_{ij} = \exp(S_{ij})/\sum_k \exp(S_{ik})$, so
$\mathbf{P} = \softmax(\mathbf{S})$ has non-negative rows that sum to 1: each query gets a
probability distribution over the keys. Output row $i$ is
$\mathbf{o}_i = \sum_j P_{ij}\mathbf{v}_j$, a convex combination of the value rows, so it lies in
their convex hull ([Section 3](#s3) draws it). Figure 6.3 follows the shapes through.

::: figure id=fig-06-3
Scaled dot-product attention with the shape on every arrow, drawn for $T = 5$. $\mathbf{X}$
$(T \times d)$ passes through three linear maps $\mathbf{W}_Q$, $\mathbf{W}_K$ and $\mathbf{W}_V$,
giving $\mathbf{Q}$ and $\mathbf{K}$ $(T \times d_k)$ and $\mathbf{V}$ $(T \times d_v)$.
$\mathbf{Q}$ and $\mathbf{K}^\top$ meet in a matrix product that gives $\mathbf{S}$ $(T \times T)$;
a box divides by $\sqrt{d_k}$; a mask box shows the $5 \times 5$ grid with its upper triangle
greyed out and labelled $-\infty$; a softmax over each row gives $\mathbf{P}$ $(T \times T)$,
whose rows sum to 1; $\mathbf{P}$ and $\mathbf{V}$ meet in a matrix product that gives the
output $(T \times d_v)$.
:::

### The softmax Jacobian, applied to a row

Attention learns through its softmax, so the softmax's derivative decides how fast it can learn.
[Module 02, Section 3](module_02_EN.html#s3) derived the Jacobian of
$\mathbf{p} = \softmax(\mathbf{s})$:

$$
\mathbf{J} = \frac{\partial \mathbf{p}}{\partial \mathbf{s}} =
\operatorname{diag}(\mathbf{p}) - \mathbf{p}\mathbf{p}^\top, \qquad
\frac{\partial p_i}{\partial s_j} = p_i(\delta_{ij} - p_j).
$$

Three of its properties do the work in this module. Every row sums to zero,
$\sum_j p_i(\delta_{ij} - p_j) = p_i - p_i = 0$: adding the same constant to every score leaves
$\mathbf{p}$ unchanged. $\mathbf{J}$ tends to zero as $\mathbf{p}$ approaches one-hot, because
every entry then contains a factor ($p_i$, $p_j$ or $1 - p_i$) that tends to zero. And
$\mathbf{J}$ is largest when $\mathbf{p}$ is spread out: its trace, $1 - \sum_i p_i^2$, peaks at
the uniform distribution.

::: worked title="The Jacobian of row 3"
Row 3 of the running example has the weights $\mathbf{p} = (0.2483, 0.2483, 0.5035)$
([Section 1](#s1)). The diagonal entries are $p_i(1 - p_i)$: $0.2483 \times 0.7517 = 0.187$
(twice) and $0.5035 \times 0.4965 = 0.250$. The off-diagonal entries are $-p_ip_j$:
$-0.2483^2 = -0.062$ and $-0.2483 \times 0.5035 = -0.125$. So

$$
\mathbf{J} = \begin{pmatrix} 0.187 & -0.062 & -0.125\\ -0.062 & 0.187 & -0.125\\
-0.125 & -0.125 & 0.250 \end{pmatrix}.
$$

Row 1 sums to $0.187 - 0.062 - 0.125 = 0$ and row 3 to $-0.125 - 0.125 + 0.250 = 0$. The matrix
is symmetric, so its columns sum to zero too. Rounded to three decimals the weights would give
$0.248 \times 0.752 = 0.186$ on the diagonal; the fourth decimal matters here as well.
:::

**The gradient through one row.** Let one row's output be $\mathbf{o} = \sum_j p_j\mathbf{v}_j$
and $\mathcal{L}$ any scalar computed from it. Since $\partial\mathbf{o}/\partial p_j =
\mathbf{v}_j$, the gradient with respect to each weight is
$g_j = \partial\mathcal{L}/\partial p_j = (\partial\mathcal{L}/\partial\mathbf{o})\cdot\mathbf{v}_j$.
The chain rule through $\mathbf{J}$ then gives

$$
\frac{\partial\mathcal{L}}{\partial s_j} = \sum_i g_i\,p_i(\delta_{ij} - p_j)
= p_j g_j - p_j\sum_i p_i g_i = p_j\,(g_j - \bar g), \qquad \bar g = \sum_k p_k g_k .
$$

$g_j$ is the rate at which the loss changes as weight moves onto value $j$, and $\bar g$ is the
same rate averaged over the current mixture. Gradient descent therefore raises a key's score when
its value improves the loss more than the current weighted average does ($g_j < \bar g$), lowers
it otherwise, and moves it in proportion to $p_j$, so a key that already has almost no weight
barely moves. The scores pass the gradient on to the queries and keys through
$S_{ij} = \mathbf{q}_i\cdot\mathbf{k}_j/\sqrt{d_k}$; [Section 3](#s3) does this with numbers.

### Why the scores are scaled

Suppose the entries of $\mathbf{q}$ and $\mathbf{k}$ are independent, with mean 0 and variance 1.
The score $\mathbf{q}\cdot\mathbf{k} = \sum_{i=1}^{d_k} q_i k_i$ is a sum of $d_k$ terms. Because
$q_i$ and $k_i$ are independent, its mean is

$$
\E[\mathbf{q}\cdot\mathbf{k}] = \sum_i \E[q_i k_i] = \sum_i \E[q_i]\,\E[k_i] = 0.
$$

The terms $q_ik_i$ are independent of one another, so their variances add, and each has mean 0,
so its variance is its second moment, which factorises by independence:

$$
\operatorname{Var}(\mathbf{q}\cdot\mathbf{k}) = \sum_i \operatorname{Var}(q_i k_i)
= \sum_i \E[q_i^2 k_i^2] = \sum_i \E[q_i^2]\,\E[k_i^2] = \sum_i 1 \cdot 1 = d_k .
$$

The standard deviation is $\sqrt{d_k}$: 11.3 at $d_k = 128$, a common head width. Dividing by
$\sqrt{d_k}$ restores unit variance, $\operatorname{Var}(\mathbf{q}\cdot\mathbf{k}/\sqrt{d_k}) =
d_k/d_k = 1$, whatever the head width.

The assumption describes initialisation: a normalised input passed through projections
initialised to preserve variance ([Module 02, Section 6](module_02_EN.html#s6)) has entries of
roughly unit variance. Training is free to change the scale afterwards (larger $\mathbf{W}_Q$ and
$\mathbf{W}_K$ sharpen a head that benefits from being sharp), so the factor sets the starting
temperature of the softmax, not a limit on it.

::: worked title="The variance, measured"
[Lab 1](#lab1) draws 100,000 pairs of vectors with independent standard-normal entries and
measures the standard deviation of $\mathbf{q}\cdot\mathbf{k}$:

| $d_k$ | 2 | 16 | 64 | 128 |
|---|---|---|---|---|
| measured | 1.43 | 3.99 | 7.99 | 11.33 |
| $\sqrt{d_k}$ | 1.41 | 4.00 | 8.00 | 11.31 |

Every measured value is within 1% of $\sqrt{d_k}$. The spread of an unscaled score grows with
the head width, so without the factor a wider head would start with a sharper softmax.
:::

**What goes wrong without it.** Unscaled scores at $d_k = 128$ have a standard deviation of 11.3,
so gaps of ten or more between the best key and the rest are typical. The softmax is then
saturated, nearly one-hot, where $\mathbf{J}$ is nearly zero. Every gradient that reaches
$\mathbf{W}_Q$ and $\mathbf{W}_K$ passes through $\partial\mathcal{L}/\partial\mathbf{s} =
\mathbf{J}\mathbf{g}$ ($\mathbf{J}$ is symmetric, so it is its own transpose), so at
initialisation those gradients are tiny whatever $\mathbf{g}$ is: the model starts with an
arbitrary, almost one-hot attention pattern and learns only slowly to change it.

::: worked title="Saturation in numbers"
Take scores $(11.3, 0, 0)$: a gap of one standard deviation of an unscaled score at $d_k = 128$.
Dividing through by $e^{11.3}$, $p_2 = p_3 = e^{-11.3}/(1 + 2e^{-11.3}) = 0.000012$ and
$p_1 = 0.999975$. Then $J_{11} = p_1(1 - p_1) = 0.999975 \times 0.000025 = 2.5\times10^{-5}$,
and the other entries are as small ($J_{22} = 0.000012$, $J_{12} = -0.000012$).

Scaled by $1/\sqrt{128}$, the same scores become $(1, 0, 0)$: exponentials $(2.718, 1, 1)$, sum
4.718, $\mathbf{p} = (0.576, 0.212, 0.212)$ and $J_{11} = 0.576 \times 0.424 = 0.244$, about ten
thousand times larger. Through $p_j(g_j - \bar g)$, every score gradient in the saturated row is
of order $10^{-5}$ times the differences between the $g_j$.
:::

[Lab 1](#lab1) measures the effect on random rows. At $d_k = 128$, with 16 keys and 5,000 draws,
the unscaled softmax has a median largest weight of 0.978 and a mean entropy of 0.28 nats; scaled,
the figures are 0.224 and 2.36 nats, against $\ln 16 = 2.77$ for a uniform row (Figure 6.4; the
last digit depends on the random draw). Scaling is not the only defence: some large training
runs also normalise $\mathbf{q}$ and $\mathbf{k}$ before the dot product (QK-normalisation),
which bounds the scores outright; [Module 08, Section 7](module_08_EN.html#s7) treats it as a
stability device.

::: figure id=fig-06-4
Why scale. Left: overlaid histograms of $\mathbf{q}\cdot\mathbf{k}$ for unit-variance entries at
$d_k = 2$, 16 and 128, on a shared axis from $-40$ to 40; their standard deviations are 1.4, 4.0
and 11.3. Right: for 5,000 draws of a query and 16 keys at $d_k = 128$, histograms of the largest
softmax weight in the row, unscaled (piled up near 1, median 0.978) and scaled (centred near 0.2,
median 0.224), on an axis from 0 to 1. Data generated in Lab 1.
:::

### The causal mask

A model that generates left to right must not see what it is about to predict, so position $i$
may attend only to positions $j \le i$. Set $S_{ij} = -\infty$ for $j > i$ before the softmax.
Since $\exp(-\infty) = 0$, the weights on the future are exactly zero, not small, and no gradient
flows through them either. The mask removes the $T(T-1)/2$ entries above the diagonal; row $i$
keeps $i$ scores.

The mask is what makes training efficient. Because the output at position $i$ depends only on
tokens $1, \dots, i$, it can be trained to predict token $i + 1$, and every position does so at
once: one forward pass over a $T$-token sequence yields $T$ next-token predictions, each with its
own loss. The decoder of [Module 04, Section 10](module_04_EN.html#s10) ran step by step even
under teacher forcing, because its recurrence did.

In code the mask is additive or boolean. An additive mask is a $T \times T$ matrix holding 0
where attention is allowed and $-\infty$ (or the most negative finite value of the dtype) where it
is not, added to $\mathbf{S}$; a boolean mask holds `True` where attention is allowed. PyTorch's
`F.scaled_dot_product_attention` accepts either as `attn_mask`, or builds the causal mask itself
with `is_causal=True`, which also lets a fused kernel skip the masked half ([Section 10](#s10)).

**Padding masks.** A batch of sequences of unequal length is padded to a common $T$. Padded key
positions must be invisible to every query, so the padding mask is a boolean tensor of shape
$(B, 1, 1, T)$ that broadcasts over the heads and the query positions; combined with the causal
mask it becomes $(B, 1, T, T)$. The outputs at padded *query* positions are still computed,
because tensors are rectangular, but they mean nothing and must be excluded from the loss,
typically by giving their targets the loss function's `ignore_index`.

```python
import math, torch, torch.nn.functional as F

B, h, T, dk = 2, 8, 5, 32
q, k, v = (torch.randn(B, h, T, dk) for _ in range(3))
lengths = torch.tensor([5, 3])                         # sequence 2 ends in two pads
key_real = torch.arange(T) < lengths[:, None]          # (B, T)
pad = key_real[:, None, None, :]                       # (B, 1, 1, T)
causal = torch.ones(T, T, dtype=torch.bool).tril()     # (T, T), True = may attend
mask = causal & pad                                    # broadcasts to (B, 1, T, T)

y = F.scaled_dot_product_attention(q, k, v, attn_mask=mask)        # fused
s = q @ k.transpose(-2, -1) / math.sqrt(dk)                        # the same, by hand
y_hand = s.masked_fill(~mask, float("-inf")).softmax(dim=-1) @ v
```

**Numerical safety.** Compute the softmax as $\exp(s_j - m)/\sum_k \exp(s_k - m)$ with
$m = \max_k s_k$. Subtracting the same constant changes nothing and keeps every exponent at or
below zero, so nothing overflows; [Section 10](#s10) shows what happens otherwise. A row whose
every key is masked is a different trap: every exponential is 0, and the softmax divides 0 by 0.
A hand-written softmax returns NaN, which then spreads through every later layer; some fused
kernels return zeros instead (PyTorch's did in the version used for this module); and an
additive mask of the most negative finite value gives every key the same score, so the row
silently becomes the plain average of all the values, padding included. Rely on none of the
three. The case arises naturally: in a left-padded batch under a causal mask, the padded
positions at the start can see only padding. Make sure every query has at least one valid key, or
zero those rows explicitly.

::: keyidea
Divide the scores by $\sqrt{d_k}$ to keep them at unit variance; otherwise the softmax saturates,
its Jacobian vanishes, and so does the gradient that teaches the queries and keys.
:::

::: check
Why does the gradient reaching $\mathbf{W}_Q$ and $\mathbf{W}_K$ almost vanish when one key
dominates a row?
:::

::: answer
That gradient passes through $\partial\mathcal{L}/\partial\mathbf{s} = \mathbf{J}\mathbf{g}$ with
$\mathbf{J} = \operatorname{diag}(\mathbf{p}) - \mathbf{p}\mathbf{p}^\top$, and $\mathbf{J}$ tends
to zero as $\mathbf{p}$ approaches one-hot, whatever $\mathbf{g}$ is.
:::

::: check
With $d_k = 64$ and unit-variance entries, what is the standard deviation of an unscaled score?
:::

::: answer
$\sqrt{64} = 8$. After division by $\sqrt{d_k}$ it is 1.
:::

::: check
How many entries of a $T \times T$ score matrix does a causal mask remove?
:::

::: answer
Those with $j > i$, above the diagonal: $T(T - 1)/2$ of the $T^2$, for example 10 of the 25 at
$T = 5$.
:::

## The worked example, by hand {#s3}

Three tokens, $d_k = d_v = 2$, and, to keep the arithmetic visible, the projected vectors taken
directly instead of computed from embeddings:

$$
\mathbf{Q} = \begin{pmatrix}1&0\\0&1\\1&1\end{pmatrix},\qquad
\mathbf{K} = \begin{pmatrix}1&0\\0&1\\1&1\end{pmatrix},\qquad
\mathbf{V} = \begin{pmatrix}1&0\\0&2\\3&3\end{pmatrix}.
$$

The scores, and the scores divided by $\sqrt 2 = 1.414$:

$$
\mathbf{Q}\mathbf{K}^\top = \begin{pmatrix}1&0&1\\0&1&1\\1&1&2\end{pmatrix},
\qquad
\frac{\mathbf{Q}\mathbf{K}^\top}{\sqrt 2} =
\begin{pmatrix}0.707&0&0.707\\0&0.707&0.707\\0.707&0.707&1.414\end{pmatrix}.
$$

Only three distinct scaled scores occur, so three exponentials serve for everything that
follows: $e^{0} = 1$, $e^{0.707} = 2.028$ and $e^{1.414} = 4.113$.

### The causal case

With a causal mask, row 1 sees only column 1, row 2 sees columns 1–2, and row 3 sees all three.

::: worked title="Causal attention, row by row"
- **Row 1.** One visible score, and the softmax of a single number is 1. Weights $(1, 0, 0)$;
  output $\mathbf{o}_1 = \mathbf{v}_1 = (1, 0)$.
- **Row 2.** Scores $(0, 0.707)$, exponentials $(1, 2.028)$, sum 3.028. Weights
  $(0.330, 0.670, 0)$. Output $0.330\,(1, 0) + 0.670\,(0, 2) = (0.330, 1.340)$.
- **Row 3.** Scores $(0.707, 0.707, 1.414)$, exponentials $(2.028, 2.028, 4.113)$, sum 8.169.
  Weights $(0.248, 0.248, 0.503)$. For the output, keep the exponentials unnormalised and divide
  once at the end: $[2.028\,(1, 0) + 2.028\,(0, 2) + 4.113\,(3, 3)]/8.169 =
  (2.028 + 12.339,\ 4.056 + 12.339)/8.169 = (14.367, 16.395)/8.169 = (1.759, 2.007)$.

So

$$
\mathbf{P} = \begin{pmatrix}1&0&0\\0.330&0.670&0\\0.248&0.248&0.503\end{pmatrix}, \qquad
\mathbf{O} = \mathbf{P}\mathbf{V} = \begin{pmatrix}1&0\\0.330&1.340\\1.759&2.007\end{pmatrix}.
$$

Row 3's printed weights add to 0.999 only because each is rounded to three decimals; the exact
weights add to 1. Dividing once at the end avoids rounding the weights at all, and it is the form
on which [Section 10](#s10) builds FlashAttention.
:::

Token 3's query $(1, 1)$ matched its own key best, and the output is pulled toward its own value.
Token 1 can only copy $\mathbf{v}_1$, whatever its query and key are.

::: widget name=attention-calculator
The calculator opens on this example with row 3 selected: the weights $(0.248, 0.248, 0.503)$
and the output $(1.759, 2.007)$ as a point inside the triangle of values. Switch the causal mask
off and watch rows 1 and 2 start to attend to token 3; switch the scaling off and watch every row
sharpen; push the sharpness slider to 20 for the hard lookup of [Section 1](#s1).
:::

### Without the mask, and without the scale

::: worked title="Unmasked: every row sees every key"
- **Row 1.** Scores $(0.707, 0, 0.707)$, exponentials $(2.028, 1, 2.028)$, sum 5.056. Weights
  $(0.401, 0.198, 0.401)$. Output $[2.028\,(1, 0) + 1\,(0, 2) + 2.028\,(3, 3)]/5.056 =
  (8.112, 8.084)/5.056 = (1.604, 1.599)$.
- **Row 2.** Scores $(0, 0.707, 0.707)$, weights $(0.198, 0.401, 0.401)$. Output
  $[1\,(1, 0) + 2.028\,(0, 2) + 2.028\,(3, 3)]/5.056 = (7.084, 10.140)/5.056 = (1.401, 2.006)$.
- **Row 3.** Unchanged: weights $(0.248, 0.248, 0.503)$, output $(1.759, 2.007)$.
:::

The weights of rows 1 and 2 mirror each other, the first two entries swapped, because
$\mathbf{Q} = \mathbf{K}$ and swapping tokens 1 and 2 swaps both their queries and their keys:
$\mathbf{q}_1\cdot\mathbf{k}_1 = \mathbf{q}_2\cdot\mathbf{k}_2$,
$\mathbf{q}_1\cdot\mathbf{k}_2 = \mathbf{q}_2\cdot\mathbf{k}_1$ and
$\mathbf{q}_1\cdot\mathbf{k}_3 = \mathbf{q}_2\cdot\mathbf{k}_3$. The outputs differ because
$\mathbf{v}_1$ and $\mathbf{v}_2$ differ. Row 3 does not change at all: the mask removes nothing
from the last row, which already sees every key.

::: worked title="Causal, without the scale"
- **Row 2.** Scores $(0, 1)$, exponentials $(1, 2.718)$, sum 3.718. Weights $(0.269, 0.731, 0)$;
  output $(0.269, 1.462)$.
- **Row 3.** Scores $(1, 1, 2)$, exponentials $(2.718, 2.718, 7.389)$, sum 12.826. Weights
  $(0.212, 0.212, 0.576)$; output $[2.718\,(1, 0) + 2.718\,(0, 2) + 7.389\,(3, 3)]/12.826 =
  (24.885, 27.603)/12.826 = (1.940, 2.152)$.
:::

Without the scale every score gap is $\sqrt 2$ times larger (in row 3, key 3 now leads the
others by 1 instead of 0.707), so the weights sharpen and the outputs move further toward the
best-matching value: row 3's weight on $\mathbf{v}_3$ rises from 0.503 to 0.576 and its output
from $(1.759, 2.007)$ to $(1.940, 2.152)$. Even at $d_k = 2$ the effect is visible. At
$d_k = 128$, where unscaled scores spread eight times more than at $d_k = 2$ (11.3 against 1.4),
it is the saturation of [Section 2](#s2).

### The geometry

Each output is a convex combination of the value rows its query may see: non-negative weights
that sum to 1. So $\mathbf{o}_1$ is $\mathbf{v}_1$ itself; $\mathbf{o}_2 = 0.330\,\mathbf{v}_1 +
0.670\,\mathbf{v}_2$ lies on the segment from $\mathbf{v}_1$ to $\mathbf{v}_2$, two thirds of the
way along; and $\mathbf{o}_3$ lies inside the triangle $\mathbf{v}_1\mathbf{v}_2\mathbf{v}_3$,
nearest $\mathbf{v}_3$ (Figure 6.5). The scores only choose where in that region the output
lands. Attention can mix values but never leave their convex hull: it cannot extrapolate, scale a
value up, or produce a direction that no visible value contains. That is one reason every
transformer block pairs it with a feed-forward network that transforms each position on its own,
and with a residual path that keeps each token's own vector ([Section 5](#s5)).

::: figure id=fig-06-5
The worked example in three linked panels. (a) The $3 \times 3$ scaled score matrix, its three
cells above the diagonal grey and labelled $-\infty$. (b) The causal weight matrix $\mathbf{P}$
as a heat map on a single-hue scale from 0 to 1, each cell printed to three decimals. (c) A plot
with $x$ and $y$ from $-0.5$ to 3.5: the values $\mathbf{v}_1 = (1, 0)$, $\mathbf{v}_2 = (0, 2)$
and $\mathbf{v}_3 = (3, 3)$ as labelled dots joined by a light triangle, and the outputs as
hollow markers, $\mathbf{o}_1 = (1, 0)$ on $\mathbf{v}_1$, $\mathbf{o}_2 = (0.330, 1.340)$ on the
segment $\mathbf{v}_1\mathbf{v}_2$ and $\mathbf{o}_3 = (1.759, 2.007)$ inside the triangle; thin
lines join each value to $\mathbf{o}_3$, with widths proportional to the weights 0.248, 0.248
and 0.503.
:::

### The backward pass, by hand

Take the scalar $\mathcal{L} = o_{3,2}$, the second component of token 3's output (2.007), and
push its gradient back through the causal, scaled computation. The general rules follow from
$\mathbf{O} = \mathbf{P}\mathbf{V}$, the row rule of [Section 2](#s2) and
$S_{ij} = \mathbf{q}_i\cdot\mathbf{k}_j/\sqrt{d_k}$:

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{V}} = \mathbf{P}^\top\frac{\partial\mathcal{L}}{\partial\mathbf{O}},
\qquad
\frac{\partial\mathcal{L}}{\partial S_{ij}} = P_{ij}\,(g_{ij} - \bar g_i),
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{q}_i} = \sum_j \frac{\partial\mathcal{L}}{\partial S_{ij}}\,\frac{\mathbf{k}_j}{\sqrt{d_k}},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{k}_j} = \sum_i \frac{\partial\mathcal{L}}{\partial S_{ij}}\,\frac{\mathbf{q}_i}{\sqrt{d_k}},
$$

with $g_{ij} = (\partial\mathcal{L}/\partial\mathbf{o}_i)\cdot\mathbf{v}_j$ and
$\bar g_i = \sum_k P_{ik}g_{ik}$. Masked entries have $P_{ij} = 0$ and receive no gradient. Here
$\partial\mathcal{L}/\partial\mathbf{O}$ has a single non-zero entry, a 1 in row 3, column 2, so
only row 3 contributes.

::: worked title="The gradient of one output component"
1. **Values.** $\mathbf{P}^\top\partial\mathcal{L}/\partial\mathbf{O}$ picks out row 3 of
   $\mathbf{P}$: column 2 of $\partial\mathcal{L}/\partial\mathbf{V}$ is $(0.248, 0.248, 0.503)$
   and column 1 is zero. Moving the second component of $\mathbf{v}_j$ by $\epsilon$ moves
   $o_{3,2}$ by $p_j\epsilon$.
2. **Weights.** $\partial\mathcal{L}/\partial\mathbf{o}_3 = (0, 1)$, so $g_j = v_{j,2}$ and
   $\mathbf{g} = (0, 2, 3)$. Their average under the current weights is
   $\bar g = \sum_k p_kg_k = o_{3,2} = 2.007$.
3. **Scores.** $\partial\mathcal{L}/\partial s_{3j} = p_j(g_j - 2.007)$:
   $0.2483 \times (0 - 2.007) = -0.498$, $0.2483 \times (2 - 2.007) = -0.002$ and
   $0.5035 \times (3 - 2.007) = 0.500$. They sum to zero, as [Section 2](#s2) promised.
4. **Query.** $\partial\mathcal{L}/\partial\mathbf{q}_3 = [-0.498\,(1, 0) - 0.002\,(0, 1) +
   0.500\,(1, 1)]/1.414 = (0.002, 0.498)/1.414 = (0.001, 0.352)$. Queries 1 and 2 receive
   nothing, because $\mathcal{L}$ does not depend on rows 1 and 2.
5. **Keys.** $\partial\mathcal{L}/\partial\mathbf{k}_j = (\partial\mathcal{L}/\partial s_{3j})\,
   \mathbf{q}_3/1.414$ with $\mathbf{q}_3 = (1, 1)$: $(-0.352, -0.352)$, $(-0.001, -0.001)$ and
   $(0.354, 0.354)$.
:::

The numbers say what the formula promised. Raising $s_{33}$ moves weight toward $\mathbf{v}_3$,
whose second component (3) is above the current 2.007; raising $s_{31}$ moves it toward
$\mathbf{v}_1$, whose second component is 0; key 2's value, 2, sits almost exactly at the
current average, so its score hardly matters. In the query, raising the second component
increases the match with keys 2 and 3, whose values have large second components, at the expense
of key 1: gradient 0.352. Raising the first component increases the match with keys 1 and 3
together, whose pulls ($-0.498$ and $+0.500$) cancel almost exactly: gradient 0.001.
[Lab 1](#lab1) confirms every number with finite differences and with PyTorch's autograd.

That is all attention does: a soft, learned lookup. Everything else is arranging many of them:
in parallel heads ([Section 4](#s4)), interleaved with feed-forward networks in a block
([Section 5](#s5)), told about position ([Section 6](#s6)) and computed in tiles
([Section 10](#s10)).

::: keyidea
Each output row is a convex combination of the value rows its query may see; the scores, the
mask and the scale only decide where inside that hull it lands.
:::

::: check
Why is token 3's output the same with and without the causal mask?
:::

::: answer
The mask removes only keys after the query's own position, and the last row has none: it already
sees every key, so its weights and output are unchanged.
:::

::: check
In the unscaled case, why does token 3's output move toward $(3, 3)$?
:::

::: answer
Without the division by $\sqrt 2$ the score gap between key 3 and the other two grows from 0.707
to 1, so the softmax puts more weight on $\mathbf{v}_3$ (0.576 instead of 0.503) and the output
moves toward it.
:::

::: check
Why must $\partial\mathcal{L}/\partial\mathbf{s}_3$ sum to zero?
:::

::: answer
It is the softmax Jacobian applied to $\mathbf{g}$, and the Jacobian is symmetric with rows (and
so columns) that sum to zero. Equivalently, adding the same constant to all three scores leaves
the weights, and therefore $\mathcal{L}$, unchanged.
:::

## Multi-head attention and the residual stream {#s4}

One attention gives each query one probability distribution over the keys, and so captures one
kind of relationship. **Multi-head attention** runs $h$ attentions in parallel, each with its own
projections into a smaller space of width $d_k = d_v = d/h$, concatenates their outputs and mixes
them with one more matrix:

$$
\operatorname{MHA}(\mathbf{X}) = \big[\text{head}_1;\dots;\text{head}_h\big]\,\mathbf{W}_O,
\qquad
\text{head}_i = \operatorname{Attention}\big(\mathbf{X}\mathbf{W}_Q^{(i)},\
\mathbf{X}\mathbf{W}_K^{(i)},\ \mathbf{X}\mathbf{W}_V^{(i)}\big),
$$

with $\mathbf{W}_Q^{(i)}, \mathbf{W}_K^{(i)}, \mathbf{W}_V^{(i)} \in \R^{d\times d_k}$, each
$\text{head}_i \in \R^{T\times d_k}$, the semicolon denoting concatenation along the feature
dimension, and $\mathbf{W}_O \in \R^{d\times d}$. With $d = 4{,}096$ and $h = 32$, each head
works in 128 dimensions.

**Why several heads.** A softmax has one unit of weight to share out. A position that needs two
pieces of information from two places (the previous word for its grammar, an earlier mention for
a name) can get both from one head only as a weighted average, and [Section 3](#s3) showed that
an average is a point between the values, neither of them. With $h$ heads a position can attend
to $h$ places for $h$ different reasons. The cost does not grow: because $hd_k = d$, the
projections are $d \times d$ in total whatever $h$ is, and the scores cost
$h \cdot T^2 \cdot d_k = T^2 d$ multiply-adds, the same as one head of full width. What changes is
that each head compares queries and keys in a space of $d_k$ dimensions instead of $d$.

### The shapes, step by step

In code the heads are never separate objects. One $d \times d$ matrix computes every head's
queries at once (the blocks $\mathbf{W}_Q^{(i)}$ are its column blocks), a reshape splits the
result by head, and the head index becomes a batch dimension. The explicit version below follows
the attention class of [Section 12](#s12) line by line, except that it forms the scores instead
of calling the fused `F.scaled_dot_product_attention`:

```python
import math, torch, torch.nn as nn

B, T, d, h = 2, 16, 256, 8
dk = d // h                                                    # 32
x = torch.randn(B, T, d)
wq, wk, wv, wo = (nn.Linear(d, d, bias=False) for _ in range(4))

q = wq(x).view(B, T, h, dk).transpose(1, 2)                    # (B, h, T, dk)
k = wk(x).view(B, T, h, dk).transpose(1, 2)
v = wv(x).view(B, T, h, dk).transpose(1, 2)
s = q @ k.transpose(-2, -1) / math.sqrt(dk)                    # (B, h, T, T)
future = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
p = s.masked_fill(future, float("-inf")).softmax(dim=-1)       # (B, h, T, T)
y = (p @ v).transpose(1, 2)                                    # (B, T, h, dk), not contiguous
out = wo(y.reshape(B, T, d))                                   # (B, T, d)
```

Step by step, for a batch of $B$ sequences:

- `wq(x)` maps $(B, T, d)$ to $(B, T, d)$: all the heads' queries side by side.
- `.view(B, T, h, dk)` splits the last dimension into $h$ blocks of $d_k$; no data moves.
- `.transpose(1, 2)` gives $(B, h, T, d_k)$: each head is now a separate batch entry.
- `q @ k.transpose(-2, -1)` gives the scores, $(B, h, T, T)$. Matrix multiplication treats every
  leading dimension as a batch, so all $B \times h$ score matrices come from one batched multiply.
- `p @ v` gives the per-head outputs, $(B, h, T, d_k)$.
- `.transpose(1, 2)` returns to $(B, T, h, d_k)$, and `.reshape(B, T, d)` concatenates the heads.
  It must be `reshape`, not `view`: after the transpose the memory is still laid out head by
  head, so the tensor is no longer contiguous, and `view` can only reinterpret contiguous memory
  (here it raises a `RuntimeError`). `reshape` copies when it has to.
- `wo` maps $(B, T, d)$ to $(B, T, d)$.

::: worked title="Shapes at the width of Section 12's model"
$B = 2$, $T = 16$, $d = 256$ and $h = 8$, so $d_k = 256/8 = 32$:
$(2, 16, 256) \to (2, 16, 8, 32) \to (2, 8, 16, 32) \to$ scores $(2, 8, 16, 16) \to
(2, 8, 16, 32) \to (2, 16, 8, 32) \to (2, 16, 256)$, and $\mathbf{W}_O$ keeps $(2, 16, 256)$. The
score tensor holds $2 \times 8 \times 16 \times 16 = 4{,}096$ numbers: one $16 \times 16$ matrix
for each sequence and head. [Lab 1](#lab1) prints exactly these shapes.
:::

::: figure id=fig-06-6
Multi-head attention with the shapes for $B = 2$, $T = 16$, $d = 256$, $h = 8$. From left to
right: the input $(2, 16, 256)$ passes through three linear boxes and a reshape-and-transpose box
into eight parallel lanes, drawn as a stack of eight coloured sheets, one per head. In each lane
$\mathbf{q}$, $\mathbf{k}$ and $\mathbf{v}$ have shape $(2, 16, 32)$, the scores form a
$16 \times 16$ grid, a softmax follows, and the lane's output is $(2, 16, 32)$. A transpose and
reshape merge the lanes back into $(2, 16, 256)$, and $\mathbf{W}_O$ gives the output
$(2, 16, 256)$.
:::

### Concatenate, then project: a sum of per-head writes

Split $\mathbf{W}_O$ into $h$ blocks of $d_k$ consecutive rows,
$\mathbf{W}_O^{(1)}, \dots, \mathbf{W}_O^{(h)}$, each $d_k \times d$. Block matrix multiplication
gives

$$
\big[\text{head}_1;\dots;\text{head}_h\big]\,\mathbf{W}_O = \sum_{i=1}^{h}
\text{head}_i\,\mathbf{W}_O^{(i)},
$$

because the entries of $\text{head}_i$ multiply only the rows of $\mathbf{W}_O$ that sit
opposite them. Concatenation is bookkeeping: each head writes its $d_k$-dimensional result into
the $d$-dimensional output through its own slice $\mathbf{W}_O^{(i)}$, and the writes add.

::: worked title="Two heads writing"
$d = 4$, $h = 2$, $d_k = 2$, and head outputs $\mathbf{h}_1 = (1, 2)$ and $\mathbf{h}_2 = (0, 1)$
at one position.

With $\mathbf{W}_O = \mathbf{I}_4$, concatenation gives $(1, 2, 0, 1)\,\mathbf{I}_4 =
(1, 2, 0, 1)$. Per head, $\mathbf{h}_1$ times rows 1–2 of $\mathbf{I}_4$ is $(1, 2, 0, 0)$,
$\mathbf{h}_2$ times rows 3–4 is $(0, 0, 0, 1)$, and the sum is $(1, 2, 0, 1)$.

The identity lets each head write only to "its own" two coordinates, which is the exception. With
the rows $(1, 0, 0, 1)$, $(0, 1, 1, 0)$, $(1, 1, 0, 0)$ and $(0, 0, 1, 1)$ instead, concatenation
gives $1\,(1, 0, 0, 1) + 2\,(0, 1, 1, 0) + 0\,(1, 1, 0, 0) + 1\,(0, 0, 1, 1) = (1, 2, 3, 2)$; head 1
writes $(1, 2, 2, 1)$, head 2 writes $(0, 0, 1, 1)$, and the sum is again $(1, 2, 3, 2)$. Both
heads write into every coordinate; their slices of $\mathbf{W}_O$ decide in which directions.
:::

### Two low-rank circuits per head

Write head $i$'s score between a query at position $t$ and a key at position $s$ in terms of the
layer's inputs:

$$
S^{(i)}_{ts} = \frac{(\mathbf{x}_t\mathbf{W}_Q^{(i)})\cdot(\mathbf{x}_s\mathbf{W}_K^{(i)})}{\sqrt{d_k}}
= \frac{\mathbf{x}_t\,\mathbf{W}_Q^{(i)}\mathbf{W}_K^{(i)\top}\,\mathbf{x}_s^\top}{\sqrt{d_k}} .
$$

This is a bilinear form in the two inputs with the $d \times d$ matrix
$\mathbf{W}_Q^{(i)}\mathbf{W}_K^{(i)\top}$, which passes through $d_k$ dimensions and so has rank
at most $d_k$. Elhage et al. (2021) call it the head's **QK circuit**: it decides where the head
looks. Likewise, the head writes into position $t$

$$
\big(\text{head}_i\,\mathbf{W}_O^{(i)}\big)_t = \sum_s P^{(i)}_{ts}\;\mathbf{x}_s\,
\mathbf{W}_V^{(i)}\mathbf{W}_O^{(i)},
$$

the weighted inputs pushed through the $d \times d$ matrix $\mathbf{W}_V^{(i)}\mathbf{W}_O^{(i)}$,
again of rank at most $d_k$: the **OV circuit**, which decides what the head writes, given where
it looks. Each head therefore reads from a $d_k$-dimensional subspace of its inputs and writes
into a $d_k$-dimensional subspace of the output: 128 dimensions of 4,096 at $d = 4{,}096$ and
$h = 32$. The two circuits are independent, so a head can choose where to look by one property
of the tokens (position, say) and copy another (identity), which is how the heads described
below work.

### Counting

Each of the four projections ($\mathbf{W}_Q$, $\mathbf{W}_K$ and $\mathbf{W}_V$ for all heads
together, and $\mathbf{W}_O$) is $d \times d$, so an attention layer has $4d^2$ parameters,
whatever $h$ is. Per token, multiplying a $d$-vector by a $d \times d$ matrix takes $d^2$
multiply-adds, or $2d^2$ FLOPs (a multiply and an add each), so the four projections cost $8d^2$
FLOPs. A token at context $t$, attending to $t$ positions, pays $2td$ more for its row of
$\mathbf{Q}\mathbf{K}^\top$ ($t$ dot products of length $d_k$ in each of $h$ heads, $thd_k = td$
multiply-adds) and $2td$ for mixing the values: $4td$ in all. Summed over a sequence of $T$ tokens
that is $O(T^2 d)$, quadratic in the length, the transformer's best-known cost.
[Section 11](#s11) turns these counts into the FLOP convention the series uses.

::: worked title="One layer at d = 4,096"
For the last token of a 4,096-token context: the projections cost
$8d^2 = 8 \times 4{,}096^2 = 134{,}217{,}728$ FLOPs, about 134 MFLOP; the scores and mixing cost
$4td = 4 \times 4{,}096 \times 4{,}096 = 67{,}108{,}864$, about 67 MFLOP. Even this far into the
context the projections cost twice as much as attention proper. Averaged over a causally masked
4,096-token sequence, where position $t$ sees only $t$ keys, the second figure about halves, to
34 MFLOP ([Section 11](#s11) derives the average).
:::

### The residual stream

Look at a whole model from the point of view of one position. Its vector starts as the token
embedding, $\mathbf{x}_0$. Every attention layer and every feed-forward network reads from this
vector through a normalisation and *adds* its output back:

$$
\mathbf{x}_{l+1} = \mathbf{x}_l + F_l\big(\operatorname{Norm}(\mathbf{x}_l)\big),
$$

where $F_l$ is the $l$-th sublayer, attention or feed-forward (for attention, the read also
includes the vectors of the positions it attends to). After the last layer, the logits are a
linear read-out of the normalised final vector. Elhage et al. (2021) call this running sum the
**residual stream**. Unrolled, $\mathbf{x}_L = \mathbf{x}_0 + \sum_l F_l(\cdot)$: the final state
is the embedding plus everything that every layer wrote.

Two consequences shape how transformers are understood. Layers communicate only through the
stream: an attention head reads from the streams of the positions it attends to and writes into
its own position's stream, a feed-forward network reads and writes at one position, and nothing
else passes between layers. And the stream's $d$ dimensions are a shared resource: every layer's
writes must fit into the same $d$ numbers per position, alongside everything that earlier layers
wrote and later layers will need. [Section 5](#s5) writes the residual connection as the equation
of a block and explains why the normalisation sits on the branch rather than on the stream.

::: figure id=fig-06-7
The residual stream. A vertical bar runs from the token embedding at the bottom to the final
norm, the unembedding and the logits at the top. Two layers are drawn beside it, each an
attention box followed by an FFN box; every box reads from the stream through a small norm box
and adds its output back at a circled plus on the stream. Inside one attention box, four small
head boxes each have their own arrow back to the stream, labelled $\mathbf{W}_O^{(i)}$: the
per-head writes.
:::

### What heads learn

Trained models contain heads with recognisable jobs. A **previous-token head** attends from each
position $t$ to $t - 1$. Analyses of trained models report heads that attend to the matching
bracket, or from a word to the subject of its sentence; working out what heads do is a research
field of its own.

The best-understood case is the **induction head** (Olsson et al. 2022), which completes a
pattern "… A B … A" with B: having read "P-104 pump … P-104", it predicts "pump". It takes two
heads in two layers. A previous-token head in an earlier layer writes into each position's stream
which token came before it; at the position of B, it writes "the token before me was A". At the
later A, the induction head's query asks for a position whose previous token was A, and through
its QK circuit it matches the key built from what the first head wrote at B. It attends there,
and its OV circuit copies B's identity into the stream, raising B's logit. The second head's key
depends on information the first head moved, which is why a single layer cannot do it.

Induction heads are a general mechanism for copying from context: names, identifiers, repeated
phrases. Olsson et al. report that they form fairly abruptly, in a narrow window early in
training that shows up as a bump in the loss curve, and that in-context learning improves at
the same point. [Lab 6](#lab6) trains a two-layer model on sequences that repeat and finds both
kinds of head (Figure 6.8), and [Section 12](#s12) meets the same abrupt step in a
character-level model that learns to copy an identifier.

**Reading attention maps with care.** An attention map shows where a head read information from,
not why, and not what the layers above did with it. Jain and Wallace (2019) found that attention
weights often disagree with other measures of which inputs mattered to a prediction, and that
quite different attention patterns can give the same prediction. A claim about what a head does
needs an intervention: zero the head's output, measure the loss again, and see whether the
behaviour attributed to the head goes away. [Lab 6](#lab6) does exactly this.

::: figure id=fig-06-8
Two heads of the two-layer model trained in Lab 6, on one sequence whose segment of length
$n = 20$ repeats; query position on the vertical axis, key position on the horizontal. (a) The
strongest previous-token head: bright just below the diagonal, each position attending to the
one before it. (b) The strongest induction head: bright on the off-diagonal stripe
key = query − $n$ + 1 in the repeated half. Beneath (b), a strip of tokens "… A B … A → ?" with
an arrow from the second A to the B that followed the first A.
:::

::: keyidea
Layers communicate only by reading from and adding to one residual stream; each head chooses
where to look through its QK circuit and what to write through its OV circuit, both of rank at
most $d_k$.
:::

::: check
What is the shape of the attention weights for $B = 4$, $h = 12$, $T = 128$?
:::

::: answer
$(4, 12, 128, 128)$: one $128 \times 128$ matrix of weights for each sequence and each head.
:::

::: check
Why does the code call `.reshape` rather than `.view` after `transpose(1, 2)`?
:::

::: answer
The transpose changes the strides without moving the data, so the tensor is no longer contiguous,
and `view` works only on contiguous memory. `reshape` makes the copy that merging the heads needs.
:::

::: check
What is the largest possible rank of $\mathbf{W}_Q^{(i)}\mathbf{W}_K^{(i)\top}$ for $d = 4{,}096$
and $h = 32$?
:::

::: answer
$d_k = 4{,}096/32 = 128$: the $4{,}096 \times 4{,}096$ product passes through 128 dimensions.
:::
