## Monitoring sensor streams: anomalies from forecast residuals {#s9}

A forecaster trained on normal operation is a learned model of normal dynamics. The difference
between what the sensor reports and what the model predicted, the **residual**

$$r_t = x_t - \hat x_t,$$

stays small while the asset behaves as it did in training and grows when it does not. A large
residual is an **anomaly**. This turns every forecaster of [Section 8](#s8) into a monitor, one
component of a digital twin: the twin predicts, the plant reports, and the disagreement is
watched. With a physics model in place of the forecaster the logic is unchanged: control engineers
call it **model-based fault detection** (Isermann 2006).

### Thresholds come from held-out normal data

Set the alarm threshold on **normal data the model was not trained on**, never on the training
residuals: the model fitted those, so they are optimistically small, and a threshold at their tail
fires too often in service.

::: worked title="False alarms from Gaussian tails at 1 Hz"
Suppose the residuals were independent and Gaussian with standard deviation $\sigma$, sampled once
a second: 86,400 samples a day. A two-sided threshold at $k\sigma$ is exceeded with probability
$p = 2(1-\Phi(k))$, with $\Phi$ the standard normal distribution function.

- $k = 3$: $p = 2.70\times10^{-3}$, and $86{,}400\times 2.70\times10^{-3} = 233$ false alarms a day.
- $k = 4$: $p = 6.33\times10^{-5}$, 5.5 a day.
- $k = 5$: $p = 5.73\times10^{-7}$, 0.05 a day: one every 20 days.

Require instead three consecutive $3\sigma$ exceedances. For independent samples a given run of
three all exceed with probability $p^3 = 1.97\times10^{-8}$, about $0.0017$ a day: apparently a
hundred thousand times better than one $3\sigma$ test.
:::

Real residuals break both assumptions. They are **autocorrelated** (a forecaster wrong at one
step is usually wrong the same way at the next), so runs are far more common than $p^3$ says; and
they are **heavy-tailed**, because normal operation contains rare events such as start-ups. Set
the threshold at an empirical quantile of the held-out residuals, chosen for a tolerable
false-alarm rate, and add a **persistence rule**, $k$ exceedances among the last $n$ samples,
measured on the same data.

### Each fault type needs its own detector

Faults look different in the residual, and a detector built for one can be blind to another.

| Fault | What the residual does | Detector |
|---|---|---|
| Spike, abrupt onset | one large value | point test $\lvert r_t\rvert > k\sigma$ |
| Changed dynamics or noise level | larger on average, rarely extreme | rolling RMS of $r_t$, or CUSUM |
| Stuck or flat-lined sensor | too *small*: a constant is perfectly predictable | rolling standard deviation below a floor |
| Sustained level offset | large at onset and end only | level check against an independent reference |

The rolling RMS over $n$ samples averages away single values and responds to a sustained rise in
residual energy. The **CUSUM** (Page 1954) accumulates evidence instead:
$S_t = \max(0,\, S_{t-1} + r_t^2/\sigma^2 - \kappa)$, with $\kappa$ a little above 1 (the normal
mean of $r_t^2/\sigma^2$), alarming when $S_t$ passes a limit.

The last row needs care. A forecaster with per-window normalisation (Section 8's fix) re-centres
on a new level within one step, so it sees an offset only where it starts and ends. A sustained
offset needs a reference that does not move with the sensor: a redundant sensor, the twin's
physics prediction, or longer-horizon residuals from a model that does not re-centre. Figure 4.14
draws the pipeline and the signature of each fault in its detector.

::: figure id=fig-04-14
Top: the monitoring pipeline as boxes: sensor stream, forecaster, residual $r_t$, three detectors
in parallel (point test $\lvert r_t\rvert > 4\sigma$; rolling RMS over 50 samples; rolling
standard deviation below a floor), alarm log. Bottom: four small schematic panels, one per fault
type of the table (spike, sustained offset, increased excitation, stuck sensor), each sketching
the residual during the fault and the one statistic that catches it, with its threshold dashed and
the fault interval shaded: a single tall residual spike; two short residual bursts at the start
and end of the offset; a rolling RMS that rises above its limit; a rolling standard deviation that
falls below its floor.
:::

::: worked title="Lab 3's monitor"
[Lab 3](#lab3) injects four faults into the stiffening-mount signal: a spike of $+1.5$, an offset
of $+0.8$, doubled random forcing, and a frozen sensor. On the normal hold-out the residual
standard deviation is $\sigma = 0.131$, so the point threshold is $4\sigma = 4\times 0.131 =
0.52$. The 50-sample rolling RMS alarms above 1.1 times its hold-out maximum; the 20-sample
rolling standard deviation alarms below half its hold-out minimum. The lab's run gives:

- **Spike**: the point test fires at once, and once more on the next sample, whose input window
  ends in the spike.
- **Offset**: the point test fires at its onset and its end only (5 alarm samples in all).
- **Doubled excitation**: no residual is extreme, but the residual RMS rises from 0.135 to about
  0.21; the rolling RMS alarms 85 samples after the change (30 to 100 samples over the runs made
  when the lab was prepared).
- **Stuck sensor**: no residual alarm; the variance floor fires 19 samples after it sticks, once
  its window has filled with identical values.
- **Normal stretches** (239 samples): no false alarm from any of the three detectors, too short a
  record to estimate a false-alarm rate.
:::

### Measuring a monitor

Four numbers judge a monitor: the **detection delay** from fault onset to first alarm; **events
detected**, counted over fault events rather than samples; **false alarms per day** on a long normal
record; and **precision**, which a low base rate destroys ([Module 01](module_01_EN.html)). At 5.5
false alarms a day and one real fault a month there are $30\times5.5 = 165$ false alarms per true
one, a precision near $1/166 = 0.6\%$. Real faults are too rare to measure any of this, so inject
synthetic faults of every type into held-out normal data, as Lab 3 does.

### Many channels

Forecast every channel from all channels, form the residual vector $\mathbf{r}_t\in\mathbb{R}^m$,
and score it with the **Mahalanobis distance** $d_t^2 = \mathbf{r}_t^\top\boldsymbol{\Sigma}^{-1} \mathbf{r}_t$, with $\boldsymbol{\Sigma}$ the residual covariance on normal data. It catches a
pattern that breaks the usual correlation between channels when no single channel is unusual.
Gaussian residuals give $d_t^2 \sim \chi^2_m$; in practice the threshold is again an empirical
quantile. Hundman et al. (2018) applied the pattern to spacecraft telemetry, with LSTM forecasts
and thresholds on smoothed prediction errors; it serves pumps, bearings and structures equally.
Scoring an autoencoder's reconstruction error is [Module 05](module_05_EN.html)'s alternative.

::: check
Why set the alarm threshold on held-out normal data rather than on the training residuals?
:::

::: answer
The model fitted the training data, so its training residuals are optimistically small. A
threshold at their tail sits too low for residuals on unseen data and fires too often in service.
:::

::: check
A stuck sensor produces no alarms from a residual threshold. Why, and what catches it?
:::

::: answer
A constant signal is perfectly predictable, so the residuals shrink instead of growing. A test for
residual (or signal) variance below a floor, over a short rolling window, catches it.
:::

## Sequence to sequence: encoder, decoder, teacher forcing and search {#s10}

Many sequence tasks map an input of one length to an output of another: translating a sentence,
summarising a report, turning a free-text maintenance note into a structured record, reversing a
string of digits ([Lab 4](#lab4)). No alignment between input step $j$ and output step $t$ is given,
and the output length is not known in advance. The **encoder–decoder**, or **sequence to
sequence** (seq2seq) model, handles both (Sutskever, Vinyals and Le 2014; Cho et al. 2014).

### Encoder and decoder

An **encoder** RNN reads the source $x_1, \dots, x_S$ and keeps its final state as a summary,
$\mathbf{c} = \mathbf{h}_S$. A **decoder** RNN starts from that summary and generates the output
one token at a time, each step conditioned on its own state and on the token it produced last:

$$\begin{aligned}
\mathbf{h}_j &= f_\text{enc}(\mathbf{h}_{j-1}, \mathbf{x}_j), \quad j = 1, \dots, S, \\
\mathbf{s}_0 &= g(\mathbf{h}_S), \\
\mathbf{s}_t &= f_\text{dec}(\mathbf{s}_{t-1}, \mathbf{y}_{t-1}), \\
p(y_t \mid y_{<t}, x) &= \softmax(\mathbf{W}_o\mathbf{s}_t + \mathbf{b}_o)_{y_t}.
\end{aligned}$$

Here $f_\text{enc}$ and $f_\text{dec}$ are LSTM or GRU cells, $g$ is a learned map (often the
identity, or a linear layer with a tanh), and $\mathbf{y}_{t-1}$ is the embedding of the previous
token. Two special tokens frame the output: the first decoder input is a **begin-of-sequence**
token (BOS), and the decoder ends the output by emitting **end-of-sequence** (EOS), which is how it
chooses the output length. The model defines a distribution over whole output sequences by the
chain rule of probability:

$$p(y_{1:T'} \mid x) = \prod_{t=1}^{T'} p(y_t \mid y_{<t}, x).$$

### Training with teacher forcing

Training maximises the log-likelihood of the target sequence given the source:

$$\mathcal{L} = -\sum_{t=1}^{T'} \ln p(y_t \mid y_{<t}, x).$$

With **teacher forcing**, the decoder input at step $t$ is the *true* previous token $y_{t-1}$, not
the model's own guess. Every decoder input is then known before the forward pass starts: no
sampling loop is needed, and every step is trained on a clean prefix with an ordinary
cross-entropy. A transformer decoder can then compute all positions in parallel
([Module 06](module_06_EN.html)). An RNN decoder still loops, because $\mathbf{s}_t$ needs
$\mathbf{s}_{t-1}$, but it loops without generating anything. Figure 4.15 sets training and
inference side by side.

::: figure id=fig-04-15
Two panels with the same encoder, a row of cells reading the digits 3 9 1 4, and the same decoder.
Training: the decoder inputs are BOS, 4, 1, 9, the true previous tokens, drawn in green, and each
output is compared with its target. Inference: the decoder inputs are the model's own previous
outputs, drawn in orange; one wrong token is highlighted, and the outputs after it are shaded to
show the error compounding.
:::

### Exposure bias

At test time there is no true previous token; the decoder conditions on its own outputs. One wrong
token puts it in a state no training step produced, the next prediction is less reliable, and
errors compound. Ranzato et al. (2016) named this **exposure bias**: the model was only ever
exposed to correct prefixes. [Lab 4](#lab4) measures it. For the model without attention at length
12, token accuracy is 74% when each step is given the true prefix (teacher-forced) and 53% when the
model runs on its own outputs (free-running); at length 8, 91% against 80%; at length 4 there is no
gap worth the name (99.7% against 99.4%).

**Scheduled sampling** (Bengio et al. 2015) feeds the model's own prediction in place of the true
token with a probability that rises during training, so it learns to recover from its mistakes.
Training on the model's own rollouts does the same more directly. **Sequence-level objectives**
score whole generated outputs; the reinforcement-learning methods of [Module 09](module_09_EN.html)
are their modern form. Whatever the training, evaluate free-running: it is the only mode
deployment has.

### Decoding: greedy and beam search

The model gives $p(y_t \mid y_{<t}, x)$ one step at a time. To produce an output we want the most
probable sequence, $\argmax_{y} p(y \mid x)$. **Greedy decoding** takes the most probable token at
each step and feeds it back. It does not find the most probable sequence, because a token that
looks best now can lead only to poor continuations. Exact search is out of reach: with a vocabulary
of $V = 10{,}000$ and outputs of 20 tokens there are $V^{20} = 10^{80}$ candidates.

**Beam search** is the compromise. Keep the $k$ best partial sequences (the beam), scored by
cumulative log-probability $\sum_t \ln p(y_t \mid y_{<t}, x)$. At each step extend every hypothesis
by every token, score the $k\cdot V$ extensions, and keep the best $k$. A hypothesis that emits EOS
is finished: set it aside and continue with the rest. Stop when the beam is empty or a length limit
is reached, and return the best finished hypothesis. With $k = 1$ it is greedy decoding;
$k = 4$ to 10 is typical in translation.

::: worked title="Greedy against beam search on a toy model"
A decoder over the tokens $\{A, B, \langle e\rangle\}$, where $\langle e\rangle$ is EOS. Its
probabilities are:

- step 1: $A$ 0.5, $B$ 0.4, $\langle e\rangle$ 0.1;
- after $A$: $A$ 0.3, $B$ 0.3, $\langle e\rangle$ 0.4;
- after $B$: $A$ 0.9, $B$ 0.05, $\langle e\rangle$ 0.05;
- after any two tokens: $\langle e\rangle$ with probability 1.

**Greedy.** Step 1 picks $A$ (0.5). After $A$ the best token is $\langle e\rangle$ (0.4). Output
$A\langle e\rangle$ with probability $0.5\times0.4 = 0.20$.

**Beam search, $k = 2$.** Step 1 keeps $A$ (0.5) and $B$ (0.4). Step 2 scores the six extensions:

$BA$: $0.4\times0.9 = 0.36$; $A\langle e\rangle$: $0.5\times0.4 = 0.20$; $AA$: $0.5\times0.3 = 0.15$; $AB$: $0.15$; $BB$: $0.4\times0.05 = 0.02$; $B\langle e\rangle$: $0.02$.

The best two are $BA$ (0.36) and $A\langle e\rangle$ (0.20). $A\langle e\rangle$ is finished and is
set aside; $BA$ continues and must end with $\langle e\rangle$, so $BA\langle e\rangle$ has
probability $0.36\times1 = 0.36$. The best finished hypothesis is $BA\langle e\rangle$, $0.36/0.20 = 1.8$ times as probable as greedy's answer.

In log scores: $\ln 0.36 = -1.022$ and $\ln 0.20 = -1.609$. Divided by the length in tokens
(3 and 2): $-0.341$ and $-0.805$. Here both scorings agree. Figure 4.16 draws the search tree.
:::

::: figure id=fig-04-16
The beam-search tree of the toy example. The root has children $A$ (0.5), $B$ (0.4) and
$\langle e\rangle$ (0.1); the second level shows the three children of $A$ and of $B$ with their
sequence probabilities. The two hypotheses kept at each level are outlined in bold and pruned ones
are grey. The greedy path is dashed blue and ends at $A\langle e\rangle$ (0.20); the beam's answer
$BA\langle e\rangle$ (0.36) is bold green.
:::

Beam search has a known bias. Each token multiplies the probability by a number below 1, so summed
log-probabilities favour short outputs, and a larger beam, which searches harder, finds more short
high-scoring hypotheses: past a point, widening the beam gives shorter and worse outputs. **Length
normalisation** divides the score by a power of the length, $\ln p(y\mid x)/|y|^\alpha$ with
$0 < \alpha \le 1$; Wu et al. (2016) use the smoothed divisor $\big((5+|y|)/6\big)^\alpha$. A
minimum length is a cruder guard. Beam search serves tasks that want the single best output; when
diverse outputs are wanted, sampling serves better ([Module 07](module_07_EN.html)). Nor can search
repair a model that does not know the answer: in Lab 4, beam search with $k = 4$ leaves the
bottleneck model at 0 correct strings out of 200 at length 12, as greedy decoding does, and moves
its token accuracy only from 51.8% to 52.5%.

### The bottleneck

Everything the decoder knows about the source passes through one vector of fixed size. Sutskever
et al. found that reversing the order of the source sentence improved their translations
substantially. Reversal puts the first source words next to the first target words, so the
earliest dependencies the decoder needs are short; that such a trick helps at all is a symptom of
the bottleneck. Cho, van Merriënboer, Bahdanau and Bengio (2014) observed translation quality
falling as sentences grew longer. Lab 4 measures it cleanly: reversing digit strings with a GRU
encoder–decoder whose summary is 64 numbers, sequence accuracy is about 98% at length 4, 43% at
length 8 and 1% at length 12 (one run; another seed moves the middle value by several points).
[Section 11](#s11) removes the bottleneck.

::: keyidea
An encoder–decoder factorises $p(y\mid x)$ token by token; it is trained on true prefixes, decoded
on its own, and limited by the single vector that carries the source.
:::

::: check
Beam search with $k = 1$ is which algorithm?
:::

::: answer
Greedy decoding: the beam holds one hypothesis, extended at each step by its single most probable
token.
:::

::: check
Why does teacher forcing make training easier but create exposure bias?
:::

::: answer
The decoder's inputs are the known targets, so there is no sampling loop and every step is trained
on a correct prefix with a clean signal. But the model never sees its own mistakes, so at test time
one wrong token moves it into states it never met in training, and the errors compound.
:::

## Attention: from a bottleneck to a soft alignment {#s11}

The bottleneck of [Section 10](#s10) is a choice, not a necessity. The encoder computes a state at
every source position; the plain encoder–decoder throws all but the last away. **Attention**
(Bahdanau, Cho and Bengio 2015) keeps them all and lets the decoder, at every step, compute its
own summary of the source, weighted towards the positions that matter for the token it is about
to produce.

### The equations

Write the encoder states, the **annotations**, as $\mathbf{h}_1, \dots, \mathbf{h}_S$. In
Bahdanau et al. they come from a bidirectional encoder ([Section 6](#s6)),
$\mathbf{h}_j = [\overrightarrow{\mathbf{h}}_j; \overleftarrow{\mathbf{h}}_j]$, so each one
describes position $j$ in the context of the whole source. At decoder step $t$, three operations
turn them into a **context vector** $\mathbf{a}_t$:

$$\begin{aligned}
e_{t,j} &= \mathbf{v}_a^\top\tanh(\mathbf{W}_a\mathbf{s}_{t-1} + \mathbf{U}_a\mathbf{h}_j) && \text{score}\\
\alpha_{t,j} &= \frac{\exp(e_{t,j})}{\sum_{k=1}^{S}\exp(e_{t,k})} && \text{weights}\\
\mathbf{a}_t &= \sum_{j=1}^{S}\alpha_{t,j}\,\mathbf{h}_j && \text{context}
\end{aligned}$$

The score is a one-hidden-layer network that rates how well annotation $j$ fits the decoder's
current need; its parameters $\mathbf{W}_a$, $\mathbf{U}_a$ and $\mathbf{v}_a$ keep Bahdanau et
al.'s names, distinct from the recurrent matrices of [Section 2](#s2). The softmax turns the scores into weights that are positive and sum to 1 over $j$;
the context is the weighted average of the annotations. The decoder then reads the context
alongside its state. In the form [Lab 4](#lab4) uses,

$$\mathbf{s}_t = f(\mathbf{s}_{t-1}, [\mathbf{y}_{t-1}; \mathbf{a}_t]), \qquad
p(y_t \mid y_{<t}, x) = \softmax\big(\mathbf{W}_o[\mathbf{s}_t; \mathbf{a}_t] + \mathbf{b}_o\big).$$

Everything is differentiable, so the score network is trained by the same cross-entropy as the
rest; nobody tells the model where to look. Because the score is a sum passed through a tanh, this
is called **additive** attention. Figure 4.17 shows one step.

::: figure id=fig-04-17
Attention at one decoder step. On the left, a column of encoder annotations
$\mathbf{h}_1, \dots, \mathbf{h}_S$, each drawn as a stacked pair (forward and backward state). On
the right, the decoder state $\mathbf{s}_{t-1}$. Lines run from $\mathbf{s}_{t-1}$ to each
$\mathbf{h}_j$ through a small "score" node; a bar chart of the weights $\alpha_{t,j}$ sits beside
the encoder column; a summation node produces $\mathbf{a}_t$, which feeds the decoder cell
together with $y_{t-1}$.
:::

### Shapes, cost and masking

With encoder width $H$ per direction, the annotations have width $2H$; the decoder state has width
$H$; the attention width is $d_a$. Then $\mathbf{W}_a \in \mathbb{R}^{d_a\times H}$,
$\mathbf{U}_a\in\mathbb{R}^{d_a\times 2H}$ and $\mathbf{v}_a\in\mathbb{R}^{d_a}$. The products
$\mathbf{U}_a\mathbf{h}_j$ do not depend on $t$, so compute them once per source. Each decoder step
then adds $\mathbf{W}_a\mathbf{s}_{t-1}$ to $S$ precomputed vectors, applies the tanh, takes $S$
dot products with $\mathbf{v}_a$ and forms a weighted sum of $S$ annotations: $O(S(d_a + H))$ work.
An output of $T'$ tokens costs $O(S\,T')$ such units, a product of the two lengths. This is the
first appearance of attention's quadratic cost.

In a padded batch some source positions are padding. Their scores are set to $-\infty$ before the
softmax (in practice $-10^9$, which the exponential turns into exactly zero), so they receive no
weight. Lab 4 does this; forgetting it lets the decoder attend to padding.

::: worked title="An additive score by hand"
Take $\mathbf{W}_a = \mathbf{I}$, $\mathbf{U}_a = \begin{bmatrix}0.5 & -0.5\\ 1 & 0\end{bmatrix}$,
$\mathbf{v}_a = (1, -1)$, decoder state $\mathbf{s}_{t-1} = (0.5, -0.5)$ and three annotations
$\mathbf{h}_1 = (1, 0)$, $\mathbf{h}_2 = (0, 1)$, $\mathbf{h}_3 = (1, 1)$.

1. $\mathbf{W}_a\mathbf{s}_{t-1} = (0.5, -0.5)$.
2. $\mathbf{U}_a\mathbf{h}_1 = (0.5, 1)$, $\mathbf{U}_a\mathbf{h}_2 = (-0.5, 0)$,
   $\mathbf{U}_a\mathbf{h}_3 = (0, 1)$.
3. Sums: $(1, 0.5)$, $(0, -0.5)$, $(0.5, 0.5)$.
4. tanh: $(0.7616, 0.4621)$, $(0, -0.4621)$, $(0.4621, 0.4621)$.
5. Scores $e_j = \mathbf{v}_a^\top(\cdot)$, the first component minus the second:
   $0.2995$, $0.4621$, $0$.
6. Weights: $\exp(e) = (1.3492, 1.5874, 1)$, sum $3.9366$, so $\alpha = (0.3427, 0.4033, 0.2540)$.
7. Context: $0.3427(1,0) + 0.4033(0,1) + 0.2540(1,1) = (0.5967, 0.6573)$.

The weights sum to 1 and favour $\mathbf{h}_2$ only mildly: with small scores the softmax stays
soft, and the context is a blend.
:::

### Alignment

The weights $\alpha_{t,j}$ form a matrix with one row per output step and one column per source
position: a **soft alignment**, saying which source positions the decoder looked at while
producing each output. It can be plotted, and Bahdanau et al.'s plots for English–French
translation are mostly diagonal, because the languages share word order, with local departures
where they do not, such as the swapped order of adjective and noun. For digit reversal the
alignment should be the anti-diagonal, and it is. In [Lab 4](#lab4), for an 8-digit input the
argmax of each digit row is $(7, 6, 5, 4, 3, 2, 1, 0)$, with peak weights between 0.63 and 0.84:
the model has found "look at the mirror position". Lab 4's Step 6 plots the heat map. With
attention the sequence accuracy is 100% at lengths 4, 8 and 12, against about 98%, 43% and 1%
without.

### Luong's variants, and the scale of a dot product

Luong, Pham and Manning (2015) simplified and varied the design. They compared three scores:
**dot**, $\mathbf{s}_t^\top\mathbf{h}_j$; **general**, $\mathbf{s}_t^\top\mathbf{W}\mathbf{h}_j$;
and **concat**, the additive form. They computed attention from the *current* decoder state
$\mathbf{s}_t$ rather than $\mathbf{s}_{t-1}$; contrasted **global** attention over all source
positions with **local** attention over a window around a predicted position; and fed each step's
attentional output back as an input to the next step. The dot score has no parameters and turns
attention into matrix products, and it is the form the transformer kept. It has one property to
watch: its scale grows with the width.

::: worked title="Dot-product attention, and why scale matters"
Decoder state $\mathbf{s} = (1, 0)$; the same annotations $(1,0)$, $(0,1)$, $(1,1)$.

Scores $\mathbf{s}^\top\mathbf{h}_j = (1, 0, 1)$. Exponentials $(2.7183, 1, 2.7183)$, sum $6.4366$;
weights $(0.4223, 0.1554, 0.4223)$. Context $0.4223(1,0) + 0.1554(0,1) + 0.4223(1,1) = (0.8446, 0.5777)$.

Now $\mathbf{s} = (3, 0)$, the same direction three times longer. Scores $(3, 0, 3)$; exponentials
$(20.086, 1, 20.086)$, sum $41.171$; weights $(0.4879, 0.0243, 0.4879)$; context
$(0.9757, 0.5121)$. The weight on $\mathbf{h}_2$ fell from 0.155 to 0.024.

Larger scores make the softmax sharper. For vectors with $d$ independent components of zero mean
and unit variance, $\operatorname{Var}(\mathbf{s}^\top\mathbf{h}) = \sum_{i=1}^{d} \mathbb{E}[s_i^2]\,\mathbb{E}[h_i^2] = d$, so typical scores grow like $\sqrt d$ and a wide model's
softmax saturates, with vanishing gradients. [Module 06](module_06_EN.html) divides the scores by
$\sqrt{d_k}$ for exactly this reason.
:::

### Why it works

Every output now has a one-step path to every input, for information and for gradients. Nothing
has to be squeezed into one vector, and the gradient from an output to the source position it
needs passes through one weighted sum rather than through every encoder and decoder step in
between. It is the same argument as the LSTM's additive path ([Section 5](#s5)) and the residual
connection: give the signal a short route. The same device replaces "take the last state" in a
many-to-one recurrent classifier: an attention-weighted average of all states, with a learned
query vector, pools over time.

### From here to Module 06

In the dot form the decoder state plays the role of a **query**, the encoder states play the
**keys** that are scored and the **values** that are averaged. Drop the recurrence, let every
position of a sequence issue a query against every other position of the same sequence, and the
result is **self-attention**, the core of the transformer. [Module 06](module_06_EN.html) takes it
from there.

::: pitfall
An alignment plot is not an explanation. Attention weights can be changed substantially without
changing a model's prediction, and different weight patterns can give the same output (Jain and
Wallace 2019; Wiegreffe and Pinter 2019 qualify when they can be informative). Treat alignments
as diagnostics, and confirm a claimed dependence by intervening on the input.
:::

::: check
What do the attention weights at one decoder step sum to, and over what?
:::

::: answer
To 1, over the encoder positions $j = 1, \dots, S$ (padded positions receive zero).
:::

::: check
Why does attention stop accuracy falling with source length?
:::

::: answer
The decoder reads all encoder states at every step through a weighted sum, so nothing has to fit in
one vector, and the path from each output to each input is one step long, for information and for
gradients.
:::

## Why the transformer replaced recurrence {#s12}

The recurrent network has two costs built into its structure. Neither can be removed by a better
cell, and together they explain why sequence modelling moved first to convolutions and then to the
transformer.

### Two costs

**No parallelism over time.** $\mathbf{h}_t$ needs $\mathbf{h}_{t-1}$, so a sequence of 10,000
tokens is 10,000 dependent steps per layer, however many processors are available. Teacher forcing
makes every input known in advance, but it does not help: $\mathbf{h}_t$ depends *nonlinearly* on
$\mathbf{h}_{t-1}$, which must be computed first. Data parallelism across sequences still works;
what suffers is the size of each step's computation. Each step is one small matrix product per
sequence in the batch, too little to keep a modern accelerator busy, and long contexts make the
chain longer. For corpora of the size [Module 08](module_08_EN.html) describes, the serial chain
becomes the bottleneck.

**Long paths.** Information from position $j$ reaches position $t$ through $t - j$ applications of
the recurrence, each of them lossy ([Section 4](#s4)). Attention connects them in one step; a
stack of dilated convolutions in about $\log_2(t-j)$.

### The convolutional alternative came first

WaveNet (van den Oord et al. 2016) generated audio with stacks of **causal dilated 1D
convolutions** ([Module 03](module_03_EN.html)): each output sees only the past, and layer $l$
skips $d_l - 1$ samples between its taps. Bai, Kolter and Koltun (2018) distilled the design into a
generic **temporal convolutional network** (TCN) and found that it matched or beat LSTMs and GRUs
on a range of standard sequence benchmarks. A TCN is parallel over time in training, since every
output is a convolution of known inputs. With kernel size $k$ and dilations $d_1, \dots, d_L$, its
receptive field is $1 + (k-1)\sum_l d_l$ samples.

::: worked title="A TCN's reach"
Kernel $k = 2$, dilations $1, 2, 4, \dots, 512$: ten layers. Receptive field
$1 + 1\cdot(1 + 2 + 4 + \dots + 512) = 1 + 1{,}023 = 1{,}024$ steps. Each added layer doubles the
reach. An input 1,000 steps back reaches the output through ten layers; in one recurrent layer it
passes through 1,000 dependent steps. [Exercise 15](#e15) sizes the six-layer TCN that matches
Lab 3's 64-sample window.
:::

The limit is the fixed receptive field: nothing older than it can influence the output, and
covering more takes more layers.

### The transformer's trade, and what recurrence keeps

The transformer ([Module 06](module_06_EN.html)) computes every position in parallel, in a few large
matrix products, with a path of length 1 between any two positions. The price is a cost quadratic
in sequence length, since every position scores every other. For training on large corpora that
trade is right.

At inference the trade reverses. A recurrent network generates each token with constant compute
and a fixed-size state. A transformer stores the keys and values of every past token, the
**key–value cache** that [Module 10](module_10_EN.html) derives, and it grows with the context.

::: worked title="State against cache"
A 4-layer LSTM with $H = 1{,}024$ in fp32 keeps $(\mathbf{h}, \mathbf{c})$ per layer:
$2\times4\times1{,}024\times4\ \text{B} = 32{,}768$ B $= 32.8$ kB (32 KiB) per sequence, whatever
the context length.

A 24-layer transformer of width 2,048 without grouped-query attention stores a key and a value
vector per layer for every past token: $2\times24\times2{,}048\times2\ \text{B} = 196{,}608$ B
$= 196.6$ kB (192 KiB) per token in 16-bit precision. At 32,768 tokens that is
$196{,}608\times32{,}768 = 6.44\times10^9$ B $= 6.44$ GB (6.0 GiB). Grouped-query attention divides
this by its group factor ([Module 10](module_10_EN.html)).
:::

The comparison follows Vaswani et al. (2017), who gave a similar table; Figure 4.19 draws the
three dependency graphs. $T$ is the sequence length, $d$ the width, $k$ the kernel size.

| | RNN | Dilated TCN | Self-attention |
|---|---|---|---|
| Sequential operations per layer in training | $O(T)$ | $O(1)$ | $O(1)$ |
| Maximum path length | $O(T)$ | $O(\log T)$ | $O(1)$ |
| Compute per layer | $O(T d^2)$ | $O(k\,T d^2)$ | $O(T^2 d)$ |
| Memory per stream at inference | fixed state, $O(d)$ | a buffer per dilation level | KV cache, $O(T d)$ |
| Receptive field | unbounded in principle | fixed by the dilations | the whole context |

::: figure id=fig-04-19
Three dependency graphs over eight positions. A chain (RNN), with the path from position 1 to
position 8 highlighted: length 7. A dilated binary tree (TCN), path length 3. A complete graph drawn
as an all-to-all fan (self-attention), path length 1. Each graph is labelled with its maximum
path length, the second row of the table it illustrates.
:::

### Linear attention is a recurrence

The two families are closer than the table suggests. Katharopoulos et al. (2020) replaced the
softmax by a kernel feature map $\phi$, so that causal attention becomes
$\mathbf{y}_t = \mathbf{S}_t\phi(\mathbf{q}_t)/(\mathbf{z}_t^\top\phi(\mathbf{q}_t))$ with
$\mathbf{S}_t = \mathbf{S}_{t-1} + \mathbf{v}_t\phi(\mathbf{k}_t)^\top$ and
$\mathbf{z}_t = \mathbf{z}_{t-1} + \phi(\mathbf{k}_t)$: an RNN whose state is a matrix, updated by
addition. [Section 13](#s13) follows that bridge.

::: check
With teacher forcing every decoder input is known in advance. Why can an LSTM still not process
all positions at once?
:::

::: answer
$\mathbf{h}_t$ depends nonlinearly on $\mathbf{h}_{t-1}$, which must be computed first. Knowing the
inputs does not break that chain.
:::

::: check
A causal TCN and an LSTM can both process a stream one sample at a time. Whose memory per stream
grows with the length of history it can use?
:::

::: answer
The TCN's. Each layer keeps its last $(k-1)d_l$ inputs, so its buffers add up to about the
receptive field per channel. The LSTM keeps one fixed-size state whatever the history.
:::

## What came back: linear recurrences and state-space models {#s13}

Both costs of [Section 12](#s12) come from one place: the nonlinearity inside the recurrence. It
forces the serial loop, and with saturation it shrinks the gradient at every step. Take it out of
the recurrence, put the nonlinearities between layers instead (per-step MLPs and gates), and the
recurrence becomes trainable in parallel and controllable over long ranges.

### A linear recurrence is a convolution

Let the state evolve linearly, with $\mathbf{h}_0 = \mathbf{0}$:

$$\mathbf{h}_t = \mathbf{A}\mathbf{h}_{t-1} + \mathbf{B}\mathbf{x}_t, \qquad
\mathbf{y}_t = \mathbf{C}\mathbf{h}_t + \mathbf{D}\mathbf{x}_t.$$

Unroll it: $\mathbf{h}_1 = \mathbf{B}\mathbf{x}_1$, $\mathbf{h}_2 = \mathbf{A}\mathbf{B}\mathbf{x}_1 + \mathbf{B}\mathbf{x}_2$, and in general

$$\mathbf{h}_t = \sum_{k=0}^{t-1}\mathbf{A}^k\mathbf{B}\,\mathbf{x}_{t-k}, \qquad
\mathbf{y}_t = \sum_{k=0}^{t-1}\mathbf{K}_k\,\mathbf{x}_{t-k} + \mathbf{D}\mathbf{x}_t, \qquad
\mathbf{K}_k = \mathbf{C}\mathbf{A}^k\mathbf{B}.$$

The output is a causal convolution of the input with the kernel $\mathbf{K}_k$, which is the
system's response to a unit impulse. An engineer knows this object: a linear time-invariant
system, an IIR filter, whose kernel entries are the Markov parameters of the state-space model.
Figure 4.20 draws the two views of one scalar mode.

::: worked title="One map, two computations"
$h_t = 0.9\,h_{t-1} + x_t$, $y_t = 0.5\,h_t$, input $x = (1, 2, 0, -1)$.

Recurrence: $h = (1,\ 0.9 + 2 = 2.9,\ 2.61,\ 2.349 - 1 = 1.349)$, so
$y = (0.5, 1.45, 1.305, 0.6745)$.

Kernel: $K_k = 0.5\times0.9^k = (0.5, 0.45, 0.405, 0.3645)$. Convolution at $t = 4$:
$y_4 = 0.5(-1) + 0.45(0) + 0.405(2) + 0.3645(1) = -0.5 + 0 + 0.81 + 0.3645 = 0.6745$. Identical.
:::

### Three ways to compute the same map

**Recurrent mode** updates the state one step at a time: constant cost and memory per step, ideal
for generation and streaming. **Convolution mode** computes the kernel once and convolves the whole
sequence through the FFT in $O(T\log T)$: every step at once, ideal for training. The third,
the **parallel scan**, works even when the coefficients change with $t$. Write one step of a
scalar recurrence as the affine map $h \mapsto a h + b$. Two steps compose into another affine map:

$$a_2(a_1 h + b_1) + b_2 = (a_2a_1)\,h + (a_2b_1 + b_2), \qquad
(a_2, b_2)\circ(a_1, b_1) = (a_2a_1,\ a_2b_1 + b_2).$$

Composition is associative, so the prefixes $h_1, \dots, h_T$ can be combined in a balanced tree,
$O(\log T)$ levels deep with $O(T)$ total work (Blelloch 1990). A tanh recurrence has no such
operator: two steps, $\tanh(w\tanh(wh + b_1) + b_2)$, are not one step of the same form.

::: worked title="What the FFT saves"
A direct causal convolution of length $T = 4{,}096$ needs about $T^2/2 = 8.4$ million multiply-adds
per channel. An FFT-based one, padded to $2T$, needs about $3\times 2T\log_2(2T) = 3\times8{,}192 \times13 \approx 0.32$ million (an order-of-magnitude count). The recurrent loop needs only $T$
multiply-adds per channel, but they are sequential. On a CPU the counts do not decide the race.
[Lab 5](#lab5)'s timings (batch 8, $N = 64$, best of three, one run) are 1.4 ms for the loop
against 0.5 ms for the FFT form at $T = 256$, 5.4 against 2.5 ms at 1,024, and 25.7 against
18.9 ms at 4,096: the FFT form is faster, but only modestly, and its lead shrinks as $T$ grows.
Convolution mode pays off where parallel hardware can absorb its larger, parallel work, on a GPU
and in training.
:::

::: figure id=fig-04-20
The recurrence–convolution duality. Left: the loop $h_t = \lambda h_{t-1} + b x_t$ as a cell with a
self-loop labelled $\lambda$. Right: the same system as a convolution, an input impulse at $t = 0$
and the kernel $K_k = c\lambda^k b$ as a stem plot, for a real $\lambda = 0.9$ (monotone decay)
and a complex $\lambda = 0.95e^{i\pi/8}$ (damped oscillation of period 16, envelope
$\pm0.95^k$ dashed). An equals sign joins the two halves.
:::

### Diagonal, complex and stable

Powers of a dense $\mathbf{A}$ are expensive and hard to control, so diagonalise it,
$\mathbf{A} = \mathbf{V}\boldsymbol{\Lambda}\mathbf{V}^{-1}$, change variables to
$\tilde{\mathbf{h}} = \mathbf{V}^{-1}\mathbf{h}$, and the system splits into $N$ independent
scalar recurrences, $\tilde h_{t,n} = \lambda_n\tilde h_{t-1,n} + (\tilde{\mathbf{B}}\mathbf{x}_t)_n$
with $\tilde{\mathbf{B}} = \mathbf{V}^{-1}\mathbf{B}$. The eigenvalues are in general complex,
$\lambda = re^{i\theta}$: the modulus $r$ sets the memory, with half-life $\ln 0.5/\ln r$ steps,
and the angle $\theta$ an oscillation of period $2\pi/\theta$ steps. Read through its real part,
one complex mode is a damped oscillator.

::: worked title="A complex mode"
$\lambda = 0.95e^{i\pi/8}$, so $\operatorname{Re}(\lambda^k) = 0.95^k\cos(k\pi/8)$. For
$k = 0, \dots, 8$: $1, 0.878, 0.638, 0.328, 0, -0.296, -0.520, -0.645, -0.663$. Check $k = 2$:
$0.9025\times\cos(\pi/4) = 0.9025\times0.7071 = 0.638$. The period is $2\pi/(\pi/8) = 16$ steps
and the half-life $\ln 0.5/\ln 0.95 = -0.6931/(-0.05129) = 13.5$ steps.
:::

Stability is built in by the parameterisation. The **Linear Recurrent Unit** (LRU; Orvieto et al.
2023) writes $\lambda = \exp(-\exp(\nu) + i\theta)$ with $\nu$ and $\theta$ real and trainable.
Then $|\lambda| = \exp(-e^{\nu}) < 1$ for every $\nu$: no gradient step can make it explode. Each
mode's input is scaled by $\gamma = \sqrt{1-|\lambda|^2}$, because for
$h_t = \lambda h_{t-1} + \gamma u_t$ with white unit-variance input the stationary variance
satisfies $v = |\lambda|^2 v + \gamma^2$, so $v = \gamma^2/(1-|\lambda|^2) = 1$ even near the unit
circle.

::: worked title="Initialising the memory"
Half-life from $\nu$: $|\lambda| = e^{-e^\nu}$, so $\ln|\lambda| = -e^\nu$ and the half-life is
$\ln 2\cdot e^{-\nu}$. Take $\nu = \ln 0.001$: $|\lambda| = e^{-0.001} = 0.9990$ and the half-life
is $0.6931/0.001 = 693$ steps. Equal steps in $\nu$ change the half-life by equal factors, which
makes $\nu$ a convenient parameter to train.

[Lab 5](#lab5) draws its 64 moduli from the ring $[0.9, 0.999]$, whose endpoints have half-lives
$\ln 0.5/\ln 0.9 = 6.6$ and $\ln 0.5/\ln 0.999 = 693$ steps. The sampled moduli span
0.902–0.998724, giving 6.7–543 steps. Near the unit circle the fifth decimal matters: 0.9987 would
give 533 steps.
:::

### Continuous time and the step

State-space models are often written in continuous time, $\dot{\mathbf{h}} = \mathbf{A}\mathbf{h} + \mathbf{B}x(t)$, and discretised with a step $\Delta$. Holding the input constant over each step
(**zero-order hold**) and solving the linear ODE exactly gives, for a scalar mode $\lambda$,

$$h(t+\Delta) = e^{\lambda\Delta}h(t) + \int_0^\Delta e^{\lambda(\Delta-\tau)}\,d\tau\;x
= a\,h(t) + b\,x, \qquad a = e^{\lambda\Delta},\quad b = \frac{e^{\lambda\Delta}-1}{\lambda},$$

and in matrix form $\bar{\mathbf{A}} = \exp(\Delta\mathbf{A})$,
$\bar{\mathbf{B}} = \mathbf{A}^{-1}(\exp(\Delta\mathbf{A}) - \mathbf{I})\mathbf{B}$. $\Delta$ is how
much time passes per step: a small $\Delta$ keeps the state ($a\approx1$), a large one resets it
($a\approx0$).

::: worked title="Zero-order hold for a pole at −0.1"
$\Delta = 1$: $a = e^{-0.1} = 0.9048$, $b = (0.9048-1)/(-0.1) = 0.9516$. Forward Euler would give
$1 + \lambda\Delta = 0.9$ and $\Delta = 1.0$.

$\Delta = 0.1$: $a = e^{-0.01} = 0.990$, $b = 0.0995$: keep the state, write little.

$\Delta = 10$: $a = e^{-1} = 0.368$, $b = (0.368-1)/(-0.1) = 6.32$: mostly forget, write a lot.

As a gate $a_t = \exp(-\Delta_t)$: $\Delta_t = 0.01$ gives 0.990 (keep), $\Delta_t = 5$ gives
0.0067 (reset).
:::

### S4 and the diagonal models

**S4** (Gu, Goel and Ré 2022) made this practical. Its $\mathbf{A}$ is initialised from **HiPPO**
(Gu et al. 2020), a construction whose state holds an optimal polynomial approximation of the
input's history, and it computes the long kernel efficiently. S4
outperformed earlier models across the Long Range Arena benchmark (Tay et al. 2021), including its
16,384-step Path-X task, on which earlier models had stayed at chance. Diagonal variants (DSS of
Gupta, Gu and Berant 2022; S4D of Gu et al. 2022) and the LRU then showed that a diagonal complex
recurrence, carefully parameterised and initialised near the unit circle, is enough. The LRU paper
frames its model as an RNN made linear and diagonal: the plain recurrence of [Section 2](#s2) with
the tanh moved out of the loop.

### Mamba: the step depends on the input

S4's coefficients are the same at every step, so it cannot decide, from what it reads, what to
keep. **Mamba** (Gu and Dao 2023) adds **selectivity**: $\Delta$, $\mathbf{B}$ and $\mathbf{C}$
become functions of the current input, $\Delta_t = \operatorname{softplus}(\text{linear}(\mathbf{x}_t))$.
The system is no longer time-invariant, so there is no fixed kernel and no convolution mode; Mamba
computes the recurrence with a hardware-aware parallel scan. $\Delta_t$ acts as a gate. A large
$\Delta_t$ drives $a_t$ towards 0 and $b_t$ up: reset the state and write the current input. A
small $\Delta_t$ keeps the state and ignores the input (Figure 4.21). The forget and input gates
of [Section 5](#s5) are back, inside a linear recurrence. Mamba-2 (Dao and Gu 2024) relates selective
state-space models to linear attention, closing the loop with [Section 12](#s12).

::: figure id=fig-04-21
Selective recurrence. Top: an input sequence with one highlighted "important" token; a small
network maps each $x_t$ to $\Delta_t$, shown as a bar chart under the sequence, small almost
everywhere and large at the important token. Middle: the retention $a_t = \exp(-\Delta_t)$ and the
state trace, which resets and stores the important token, then holds it. Bottom: a parallel-scan
tree over eight positions combining $(a, b)$ pairs in three levels.
:::

::: widget name=ssm-kernel-explorer
Start at $r = 0.95$, $\theta = \pi/8$ with an impulse: the kernel is a damped oscillation with
period 16 and half-life 13.5, and the convolution dots sit on the recurrence line. Push $r$ towards
0.999 and watch the memory lengthen; set $\theta = 0$ for a pure decay. Switch on the selective
step: the kernel panel disappears, because the step now depends on the input. Set $w = 0$ and it
returns.
:::

### What Lab 5 shows

[Lab 5](#lab5) builds an LRU-style diagonal recurrence. Its loop and FFT forms agree to float32
round-off, a few parts in $10^6$ to $10^5$. On delayed recall (remember the first of $L+1$
tokens), after 400 updates it reaches 100% at lags 25, 100 and 200 on all three seeds tried. The
vanilla RNN learns lag 25 only partly (63 to 87% over three seeds) and is erratic at lag 100. An
LSTM depends on its forget bias: with bias 1 it stays at chance even at lag 25; with bias 5 it is
the fastest learner at lag 25, learns lag 100 on one seed of three, and fails at lag 200. The
recurrence's memory was set at initialisation by its eigenvalue moduli. This is a statement about
trainability within a budget, not a proof that LSTMs cannot remember.

### Where things stand

As of 2026, stated conservatively: state-space and linear-recurrence layers are competitive with
transformers at small and medium scale and much cheaper per token at long context. Their weakness
is exact recall of an arbitrary earlier token, because a fixed-size state must compress the past
while attention can look anything up. Hybrids that interleave a few attention layers with many
recurrent or state-space layers are a common design (Jamba, Lieber et al. 2024, is a published
example), and the largest language models are still predominantly transformers. xLSTM (Beck et al.
2024) revisited the LSTM itself. The idea of recurrence did not lose; the 1997 implementation did.

| Situation | First choice |
|---|---|
| Short sequences, little data, or streaming on a small device | GRU or LSTM, or a small diagonal recurrence in recurrent mode |
| Offline labelling of whole sequences | bidirectional LSTM or a transformer encoder |
| Forecasting one or a few series | naive, seasonal naive and linear baselines first; LSTM or TCN if walk-forward folds justify it |
| Very long sequences with long-range structure | state-space or linear-recurrence stacks, or a transformer with efficient attention |
| Language modelling at scale | transformer or hybrid ([Modules 06](module_06_EN.html)–[08](module_08_EN.html)) |

::: keyidea
A recurrence that is linear in its state is a convolution: it trains in parallel, its memory is set
by eigenvalue moduli, and making its step depend on the input turns it back into a gate.
:::

::: check
Why can an S4-style layer be trained as a convolution while a Mamba layer cannot?
:::

::: answer
S4's $\mathbf{A}$, $\mathbf{B}$, $\mathbf{C}$ and $\Delta$ are the same at every step, so the kernel
$\mathbf{C}\bar{\mathbf{A}}^k\bar{\mathbf{B}}$ is one fixed sequence. Mamba's $\Delta$, $\mathbf{B}$
and $\mathbf{C}$ depend on the input, so there is no single kernel; it uses a parallel scan.
:::

::: check
A diagonal recurrence has $|\lambda| = 0.99$. After how many steps has an input's influence halved?
:::

::: answer
$\ln 0.5/\ln 0.99 = -0.6931/(-0.01005) = 69$ steps.
:::

::: check
What weakness of a fixed-size recurrent state motivates hybrids with a few attention layers?
:::

::: answer
The state must compress the whole past, so exact retrieval of an arbitrary earlier token is hard;
attention can address any position directly.
:::

## What goes wrong {#wrong}

Each failure below is given as the symptom you see, its usual cause, and the fix. Most of them
appear, on purpose, somewhere in the labs.

### A forecaster that shines in validation and fails in service

**Symptom.** Validation error far below the naive forecast's; in service the model is no better
than persistence. **Cause.** Overlapping windows were shuffled before a random split, and
normalisation used the whole series, so the "forecast" was interpolation between memorised
neighbours ([Section 8](#s8)). **Fix.** Split by time with walk-forward folds, compute every
statistic on the training part only, and leave a gap of at least the horizon between training
targets and validation inputs.

### An LSTM that loses to "tomorrow equals today"

**Symptom.** On the newest data the network is worse than persistence: the code of
[Section 8](#s8)'s worked example scores 1.075 against the naive 0.155, and the same model in
[Lab 3](#lab3) 0.43 against 0.36. **Cause.** The level drifted
beyond anything seen in training, and a network does not extrapolate a level: its predictions are
biased towards the levels it knows. **Fix.** Normalise per window (subtract the last value or the
window mean; RevIN) or difference the series, and always print the naive baseline beside the model.

### A loss that spikes or turns into NaN

**Symptom.** Training runs normally for thousands of updates, then the loss jumps or becomes NaN.
**Cause.** An exploding gradient on a cliff of the loss surface ([Section 4](#s4)). **Fix.** Clip
the global gradient norm at 1 to 5, lower the learning rate, and look for outliers in the inputs.
Log the norm before clipping; a rising trend is the warning.

### A network that ignores anything more than about 20 steps back

**Symptom.** Short-range structure is learned, long-range structure is not; in [Lab 1](#lab1) the
closing tag matches about one line in five, little above the one in eight of guessing. **Cause.** Vanishing gradients in a vanilla RNN, or a truncated-BPTT
window shorter than the dependency ([Section 3](#s3)). **Fix.** Use an LSTM or GRU, a longer
truncation, or a linear-recurrence or attention model. Plot the gradient norm against lag
([Lab 2](#lab2)) to confirm the diagnosis.

### An LSTM that learns slowly and seems to have no memory

**Symptom.** The loss stays flat for the first thousand updates; dependencies of a few steps are
missed. **Cause.** The forget-gate bias was left at 0, so each gate starts near $\sigma(0) = 0.5$
and the memory halves every step ([Section 5](#s5)). **Fix.** Set the forget bias to 1 or more. In
PyTorch the gates are stacked i, f, g, o, so the forget slice is `[H:2*H]`, and `bias_ih` and
`bias_hh` add.

### Short sequences fail, or results change with batch composition

**Symptom.** Short sequences score worse at test than long ones, or the same input gives different
outputs in different batches. **Cause.** Padding without masks or packing: the loss is computed on
padding, and a bidirectional encoder reads padding before the real tokens. The unpacked encoder of
Lab 4's optional Step 7 scores 100% on length-4 strings padded as in training and 0% on the same
strings cut to their true width. **Fix.** Mask the loss, pack the sequences, and take the state at each
sequence's true last step ([Section 7](#s7)).

### A validation score that depends on batch order

**Symptom.** Reordering the validation batches changes the score. **Cause.** State carried across
unrelated sequences, or not reset before evaluation. **Fix.** Reset the state between independent
sequences; carry it, detached, only across chunks of one stream, and keep each stream in the same
batch row.

### A bidirectional forecaster with impossibly good results

**Symptom.** Forecasts that look almost perfect in evaluation. **Cause.** The backward direction
has read the future ([Section 6](#s6)). **Fix.** Use causal models for anything online. Test
causality directly: perturb the inputs after the prediction time and check that the prediction
does not change.

### Generated sequences that drift or repeat after a few tokens

**Symptom.** Output is fluent for a few tokens, then drifts off or loops. **Cause.** Exposure bias:
the model was trained only with teacher forcing and has never seen its own mistakes
([Section 10](#s10)). **Fix.** Scheduled sampling, some free-running training, or sequence-level
objectives. At minimum, evaluate free-running: in Lab 4, at length 12, the gap is 74%
teacher-forced against 53% free-running token accuracy.

### A multi-step forecast that diverges after a few steps

**Symptom.** Excellent one-step error, poor error at longer horizons. **Cause.** The recursive
strategy feeds predictions back as inputs and compounds their errors; in Lab 3 the best one-step
model, the recursive LSTM, is worse than naive at $h = 20$ (RMSE 0.78 against 0.72). **Fix.** Train a direct multi-output model, or train the
recursive model on its own rollouts, and report error against horizon.

### Beam search that returns short or empty outputs

**Symptom.** Outputs are truncated, and a larger beam makes them shorter. **Cause.** Summed
log-probabilities favour short hypotheses, and a wider search finds more of them. **Fix.**
Normalise scores by a power of the length ([Section 10](#s10)), or set a minimum length.

### A monitor that misses an offset and never alarms on a stuck sensor

**Symptom.** One alarm when a sensor offset starts, then silence; a frozen sensor raises nothing.
**Cause.** A forecaster that re-centres on the last value adapts to a new level within a step, and
a flat signal is perfectly predictable ([Section 9](#s9)). **Fix.** Add a rolling-residual or
CUSUM test, a variance-floor test, and a level check against an independent reference. Test the
monitor with injected faults of every type.

### A monitor with far more false alarms than planned

**Symptom.** Operators receive many alarms a day where the design promised a few a month.
**Cause.** Thresholds set on training residuals, or from Gaussian tail probabilities when the
residuals are autocorrelated and heavy-tailed. **Fix.** Set thresholds on empirical quantiles of
held-out normal residuals, require persistence ($k$ of $n$), and report false alarms per day on a
long normal record.

### An attention plot presented as the explanation

**Symptom.** A report claims the model decided because of the inputs its attention highlighted.
**Cause.** Attention weights need not be faithful explanations ([Section 11](#s11)). **Fix.** Treat
alignments as diagnostics, and confirm a claimed dependence by intervening on the input and
watching the output change.
