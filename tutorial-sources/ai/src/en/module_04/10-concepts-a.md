## Sequences and the tasks on them {#s1}

A vibration channel on a pump, the observation series of a digital twin, a maintenance log, a
sentence, the frames of a time-lapse: in each, the order of the elements carries meaning.
Shuffle the samples of a vibration trace and the resonance it recorded is gone. Three properties
set such data apart from the fixed-size vectors of Modules 01 to 03. **Order carries meaning**:
the same values in another order are another signal. **Lengths vary**: one recording lasts ten
minutes and the next ten hours. **Dependencies sit at different lags**: a vibration sample
depends on the excitation a few samples earlier and also on an operating mode set hours earlier.

In engineering practice the observation stream of a monitored asset or its digital twin
(temperatures, vibrations and pressures from many sensors) is a multivariate time series; the
response curve of a single test, or the cell count of one run of an agent-based tissue
simulation, is a short univariate one; and the trajectory of an ODE solver is what a recurrent
surrogate would be trained to emulate when the solver is too slow to call inside an optimisation
loop.

A sequence is written $\mathbf{x}_{1:T} = (\mathbf{x}_1, \dots, \mathbf{x}_T)$ with
$\mathbf{x}_t \in \R^{d_{\text{in}}}$, and $T$ varies between examples. Targets are one per
step, $\mathbf{y}_t$, or one per sequence. A batch has shape $(B, T, d)$, shorter sequences
padded and masked ([Section 7](#s7)).

### Four task shapes

The shapes differ in where the outputs are, and so in where the loss is computed (Figure 4.1).

1. **Many-to-one.** Classify a ten-minute pump recording as healthy, cavitating or misaligned;
   the loss is on the last output only.
2. **Aligned many-to-many.** One output per step: label every second as normal or faulty, or
   forecast the next value at every step; the loss is summed over steps.
3. **Sequence to sequence, different lengths.** Turn a free-text maintenance note into fault
   codes, or translate a sentence. Output positions are not aligned with input positions, which
   needs the encoder–decoder of [Section 10](#s10).
4. **One-to-many.** Generate a synthetic trace from an initial condition, or a log line from a
   start symbol, feeding each output back as the next input.

::: figure id=fig-04-1
Four task shapes side by side, each a row of input boxes $\mathbf{x}_1 \dots \mathbf{x}_T$
(bottom), recurrent cells (middle) and outputs (top). Many-to-one: one output above the last
cell, "fault class". Aligned many-to-many: an output above every cell, "next value" or
"normal/fault". Sequence to sequence: an encoder row feeding a decoder row of different length,
"note → fault codes". One-to-many: one input, outputs fed back as next inputs, "generate a
trace". A tag under each reads "causal" or "offline".
:::

### Online and offline

May $\mathbf{y}_t$ depend on inputs after $t$? An **online**, or **causal**, task must answer at
time $t$ from $\mathbf{x}_{1:t}$ alone: forecasting and monitoring a running machine. An
**offline** task has the whole recorded sequence first: labelling a recorded test afterwards,
tagging the words of a finished sentence. Only offline tasks may read the sequence in both
directions (the bidirectional networks of [Section 6](#s6)). A model that has seen the future,
evaluated on a causal task, is a leak with excellent validation numbers ([Section 8](#s8)).

### Predicting the next element

The chain rule of probability factorises any distribution over sequences exactly:

$$
p(\mathbf{x}_{1:T}) = \prod_{t=1}^{T} p(\mathbf{x}_t \mid \mathbf{x}_{<t}).
$$

A model of the next element given the past is therefore a complete generative model: sample
$\mathbf{x}_1$, feed it back, sample $\mathbf{x}_2$, and so on. Maximum likelihood trains it by
summing per-step cross-entropies for symbols, or squared errors for real values with Gaussian
noise ([Module 01](module_01_EN.html)). This is the language-modelling objective of
[Module 07](module_07_EN.html) and the one-step forecast of [Section 8](#s8).

### Why a fixed window is not enough

The obvious alternative feeds the last $w$ values to the multilayer perceptron of
[Module 02](module_02_EN.html). It is a baseline worth fitting, with three faults. The window is
a guess: anything older is invisible. Each window position has its own weights, so a pattern
learned at position 3 must be learned again at position 7. And the first layer grows linearly
with $w$.

::: worked title="Parameters of a window MLP and of a recurrent layer"
A window MLP reading the last $w = 64$ values of a univariate signal into 32 hidden units has

$$
64 \times 32 + 32 = 2{,}080 \text{ first-layer parameters;} \qquad
w = 1{,}000:\ 1{,}000 \times 32 + 32 = 32{,}032.
$$

A recurrent layer with $d_{\text{in}} = 1$ and $H = 32$ ([Section 2](#s2)) gives each unit 32
weights from the previous state, one from the input and one bias:

$$
32 \times (32 + 1 + 1) = 1{,}088 \text{ parameters, for any sequence length.}
$$

PyTorch's `nn.RNN(1, 32)` reports 1,120 because it keeps two bias vectors that simply add
([Section 2](#s2)).
:::

### Two inductive biases

Recurrence builds in **stationarity**: one update rule at every step, so weights are shared
across time, the analogue of a convolution's translation equivariance in
[Module 03](module_03_EN.html). It also builds in a **state**, a fixed-size summary
$\mathbf{h}_t$ of everything seen so far. A 1D convolution shares weights across time too, but
each output sees a fixed window that grows only with depth; a recurrence's receptive field is
unbounded in principle. Whether training can use it is the subject of [Sections 3](#s3) and
[4](#s4).

Read as an engineer, $\mathbf{h}_t = f(\mathbf{h}_{t-1}, \mathbf{x}_t)$,
$\mathbf{y}_t = g(\mathbf{h}_t)$ is the discrete-time nonlinear state-space model of control,
$\mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k)$, with the state renamed $\mathbf{h}$ and the
input $\mathbf{x}$. Anyone who has written a Kalman filter has written a recurrence by hand, from
a known model; a recurrent network learns $f$ and $g$ from data and gives up the guarantees of
the known linear-Gaussian model. [Section 12](#s12) completes this comparison:

| Model | Receptive field | Shares weights across time | Sequential steps |
|---|---|---|---|
| Window MLP | fixed, $w$ | no | 1 |
| 1D CNN / TCN | grows with depth and dilation | yes | 1 per layer |
| RNN | unbounded in principle | yes | $T$ |
| Attention | whole sequence | yes | 1 per layer ([Section 12](#s12)) |

::: check
A model must flag each second of a recorded flight-test vibration trace as normal or flutter,
after the flight. Which task shape is this, and may $\mathbf{y}_t$ depend on later inputs?
:::

::: answer
Aligned many-to-many, that is, sequence labelling. The task is offline, so $\mathbf{y}_t$ may
depend on later inputs and a bidirectional model is allowed.
:::

::: check
Why does doubling an MLP forecaster's window double its first-layer parameters, while a recurrent
layer's count is unchanged?
:::

::: answer
The MLP has separate weights for every window position; the recurrent layer applies the same
weights at every step, so its count does not depend on how many steps it reads.
:::

## The recurrent network {#s2}

The simplest recurrent network, the **Elman network** (Elman 1990), keeps a state vector and
updates it once per step with one layer:

$$
\begin{aligned}
\mathbf{z}_t &= \mathbf{W}_h \mathbf{h}_{t-1} + \mathbf{W}_x \mathbf{x}_t + \mathbf{b}, \\
\mathbf{h}_t &= \phi(\mathbf{z}_t), \\
\mathbf{y}_t &= \mathbf{W}_y \mathbf{h}_t + \mathbf{c}.
\end{aligned}
$$

The shapes are $\mathbf{h}_t \in \R^{H}$, $\mathbf{x}_t \in \R^{d_{\text{in}}}$,
$\mathbf{W}_h \in \R^{H \times H}$, $\mathbf{W}_x \in \R^{H \times d_{\text{in}}}$,
$\mathbf{W}_y \in \R^{d_{\text{out}} \times H}$, $\mathbf{b} \in \R^{H}$ and
$\mathbf{c} \in \R^{d_{\text{out}}}$; $\mathbf{z}_t$ is the pre-activation. The initial state
$\mathbf{h}_0$ is zero or a learned vector. The nonlinearity $\phi$ is $\tanh$ by default, for
three reasons: it is bounded, so the state cannot grow without limit however long the sequence;
it is zero-centred; and its derivative is 1 at the origin, so a small state passes through
almost linearly. Each **hidden state** $\mathbf{h}_t$ is a function of the whole prefix
$\mathbf{x}_{1:t}$, through the chain of updates.

### The batched form

Frameworks store a batch as $(B, T, d)$ with each example a row, so the same equations are
written with row vectors and transposed weights. With $\mathbf{X}_t \in \R^{B \times
d_{\text{in}}}$ the inputs at step $t$ and $\mathbf{H}_t \in \R^{B \times H}$ the states (bold
$\mathbf{H}_t$ is the matrix, italic $H$ its width),

$$
\mathbf{H}_t = \phi\big(\mathbf{H}_{t-1}\mathbf{W}_h^\top + \mathbf{X}_t\mathbf{W}_x^\top +
\mathbf{b}^\top\big).
$$

One loop over $t$ with two matrix multiplies per step:

```python
import torch

def rnn_forward(X, W_h, W_x, b, h0):
    """X: (B, T, d_in); h0: (B, H). Returns all states, (B, T, H)."""
    pre_in = X @ W_x.T + b          # input part for every step at once: (B, T, H)
    h, states = h0, []
    for t in range(X.shape[1]):     # the recurrent part must run one step at a time
        h = torch.tanh(h @ W_h.T + pre_in[:, t])
        states.append(h)
    return torch.stack(states, dim=1)
```

The input projection does not depend on the state, so it is computed for all steps in one large
multiply before the loop; only the product with $\mathbf{W}_h$ has to wait for the previous step.
Optimised implementations do the same.

### Unrolling

The weights are the same at every step. Drawn with its self-loop the network is one small cell;
drawn out over $T$ steps, or **unrolled in time**, it is a $T$-layer feed-forward network in which
every layer has the same weights (Figure 4.3). Training is backpropagation through that unrolled
graph, the subject of [Section 3](#s3).

::: figure id=fig-04-3
Left: a folded recurrent cell, a box labelled tanh, with input $\mathbf{x}_t$ below, output
$\mathbf{y}_t$ above and a self-loop labelled $\mathbf{W}_h$ carrying $\mathbf{h}_{t-1}$ back
in. Right: the same cell unrolled over four steps, $\mathbf{h}_0$ entering from the left and
arrows $\mathbf{h}_1 \to \mathbf{h}_2 \to \mathbf{h}_3 \to \mathbf{h}_4$. Every horizontal arrow
is labelled $\mathbf{W}_h$, every vertical input arrow $\mathbf{W}_x$ and every output arrow
$\mathbf{W}_y$, the same labels everywhere to show the sharing. A per-step loss
$\mathcal{L}_t$ above each output feeds a sum $\mathcal{L}$.
:::

### Parameters and loss

Counting the matrices and vectors above,

$$
\underbrace{H(H + d_{\text{in}} + 1)}_{\text{recurrent layer}} +
\underbrace{d_{\text{out}}(H + 1)}_{\text{output layer}}.
$$

PyTorch's `nn.RNN` keeps two bias vectors, `bias_ih_l0` and `bias_hh_l0`, that are simply added;
the second exists for compatibility with NVIDIA's cuDNN kernels and adds no expressive power. Its
recurrent layer therefore has $H(H + d_{\text{in}} + 2)$ parameters.

For an aligned task the loss is the sum of per-step losses, $\mathcal{L} = \sum_t
\mathcal{L}_t(\mathbf{y}_t, \text{target}_t)$, usually averaged over steps and over the batch so
that the learning rate does not depend on $T$ or $B$. For a many-to-one task only
$\mathcal{L}_T$ is used.

### What the state does

The behaviour of the state is easiest to see with one unit.

::: worked title="A scalar RNN remembers a pulse, or latches"
Take $h_t = \tanh(w h_{t-1} + u x_t)$ with $u = 1$, no bias, $h_0 = 0$ and an input pulse
$\mathbf{x} = (1, 0, 0)$.

**$w = 0.5$.**

$$
\begin{aligned}
h_1 &= \tanh(0.5 \cdot 0 + 1) = \tanh(1) = 0.7616, \\
h_2 &= \tanh(0.5 \cdot 0.7616) = \tanh(0.3808) = 0.3634, \\
h_3 &= \tanh(0.5 \cdot 0.3634) = \tanh(0.1817) = 0.1797.
\end{aligned}
$$

The memory of the pulse roughly halves each step. The local derivative of each step,
$\partial h_t / \partial h_{t-1} = w(1 - h_t^2)$, is

$$
0.5(1 - 0.7616^2) = 0.210, \quad 0.5(1 - 0.3634^2) = 0.434, \quad 0.5(1 - 0.1797^2) = 0.484.
$$

**$w = 2$.**

$$
\begin{aligned}
h_1 &= \tanh(1) = 0.7616, \\
h_2 &= \tanh(2 \cdot 0.7616) = \tanh(1.5232) = 0.9093, \\
h_3 &= \tanh(2 \cdot 0.9093) = \tanh(1.8186) = 0.9487.
\end{aligned}
$$

The state latches near 1: the pulse is remembered, but by a unit in saturation. The local
derivatives are $2(1 - 0.7616^2) = 0.840$, $2(1 - 0.9093^2) = 0.347$ and
$2(1 - 0.9487^2) = 0.200$, falling as the unit saturates.

Both settings give local factors below 1. A small weight forgets, a large one saturates, and
either way the factors that [Section 3](#s3) multiplies together are already shrinking.
:::

### A character-level language model

Lab 1 trains this network to predict the next character of a synthetic maintenance log whose
lines look like `F2 pres 4.0 bar night shift ok /F2`. The vocabulary has $V$ characters. The
input $\mathbf{x}_t$ is a **one-hot** vector, all zeros except a 1 at the index of the current
character, so $\mathbf{W}_x\mathbf{x}_t$ is simply the column of $\mathbf{W}_x$ for that
character: the multiply is implemented as a column lookup, which is what an embedding layer is.
The output $\mathbf{y}_t \in \R^{V}$ holds **logits** over the next character, the softmax turns
them into probabilities, and the loss is the mean cross-entropy against the character that
actually comes next, in nats per character (divide by $\ln 2$ for bits).

At initialisation the output weights are small, the logits are close to zero and the softmax is
close to uniform, $1/V$ for every character, so the first loss should be close to
$-\ln(1/V) = \ln V$. This is the sanity check of [Module 02](module_02_EN.html): a first loss far
from $\ln V$ means a bug before any training has happened. ([Module 07](module_07_EN.html)
turns this quantity into perplexity; this module stays with nats per character.)

::: worked title="Lab 1's model, counted"
$V = 37$ characters, $H = 128$ state units, one bias vector:

| Tensor | Shape | Parameters |
|---|---|---|
| $\mathbf{W}_x$ | $128 \times 37$ | 4,736 |
| $\mathbf{W}_h$ | $128 \times 128$ | 16,384 |
| $\mathbf{b}$ | $128$ | 128 |
| $\mathbf{W}_y$ | $37 \times 128$ | 4,736 |
| $\mathbf{c}$ | $37$ | 37 |
| total | | 26,021 |

The formula agrees: $128(128 + 37 + 1) + 37(128 + 1) = 21{,}248 + 4{,}773 = 26{,}021$. The
first loss should be $\ln 37 = 3.611$ nats per character.
:::

### Sampling, with a temperature

A trained model generates text by the one-to-many shape of [Section 1](#s1): feed a start
character, draw the next one from the predicted distribution, feed it back, repeat. A
**temperature** $\tau$ divides the logits before the softmax, so the next character is drawn from
$\softmax(\mathbf{y}_t / \tau)$. With $\tau < 1$ the distribution sharpens towards the most
probable character; with $\tau > 1$ it flattens. For logits $(2, 1, 0)$ the probabilities are
$(0.665, 0.245, 0.090)$ at $\tau = 1$, $(0.867, 0.117, 0.016)$ at $\tau = 0.5$ and
$(0.506, 0.307, 0.186)$ at $\tau = 2$. Low temperature gives repetitive but well-formed text;
high temperature gives variety and more mistakes. Lab 1 measures both.

### Where this came from

Recurrent networks of this kind were studied throughout the 1990s, and their training problems,
the subject of [Section 4](#s4), were understood by the middle of that decade. Their revival came
in 2013–2015, when gated recurrent networks generated convincing handwriting and character-level
text (Graves 2013), and Karpathy's 2015 essay on character-level models showed a small network
writing plausible prose, source code and markup one character at a time. Those character models
are the direct ancestors of the language models of [Module 07](module_07_EN.html).

::: check
An RNN has $d_{\text{in}} = 10$ and $H = 64$, with one bias vector. How many parameters does its
recurrent layer have, and how does that change when the sequence length doubles?
:::

::: answer
$64 \times (64 + 10 + 1) = 64 \times 75 = 4{,}800$. It does not change: the same weights are
applied at every step, so the count does not depend on the sequence length.
:::

::: check
A freshly initialised character model over 37 symbols reports a first loss of 7.2 nats. What does
that suggest?
:::

::: answer
A bug or a bad initialisation. An uninformed model should score close to $\ln 37 = 3.61$ nats. A
loss of 7.2 means the output layer starts confidently wrong, usually because its initial weights
are too large, or the loss is summed over steps rather than averaged.
:::


## Backpropagation through time {#s3}

Unrolled, a recurrent network is a deep feed-forward network whose layers share their weights.
Training it is [Module 02](module_02_EN.html)'s backward pass with layers replaced by time steps,
with one difference that matters: because every step uses the same weights, each weight's
gradient collects a contribution from every step. This is **backpropagation through time**
(BPTT).

### Set-up and conventions

Take the network of [Section 2](#s2) with a loss summed over steps:

$$
\mathbf{z}_t = \mathbf{W}_h\mathbf{h}_{t-1} + \mathbf{W}_x\mathbf{x}_t + \mathbf{b}, \qquad
\mathbf{h}_t = \phi(\mathbf{z}_t), \qquad
\mathbf{y}_t = \mathbf{W}_y\mathbf{h}_t + \mathbf{c}, \qquad
\mathcal{L} = \sum_{t=1}^{T}\mathcal{L}_t.
$$

Gradients are column vectors with the shape of the variable. A Jacobian
$\partial\mathbf{a}/\partial\mathbf{b}$ has entry $(i, j)$ equal to $\partial a_i/\partial b_j$,
so the chain rule for a gradient reads
$\partial\mathcal{L}/\partial\mathbf{b} = (\partial\mathbf{a}/\partial\mathbf{b})^\top\,
\partial\mathcal{L}/\partial\mathbf{a}$. The order of the factors below follows from this
convention and is not optional.

### The backward recursion

Define $\boldsymbol{\delta}_t = \partial\mathcal{L}/\partial\mathbf{h}_t$, the total derivative
of the whole loss with respect to the state at step $t$. The state $\mathbf{h}_t$ influences the
loss along two paths: through $\mathbf{y}_t$ into $\mathcal{L}_t$, and through
$\mathbf{z}_{t+1}$ into everything that happens later. The multivariate chain rule adds the two
paths:

$$
\boldsymbol{\delta}_t =
\Big(\frac{\partial\mathbf{y}_t}{\partial\mathbf{h}_t}\Big)^{\!\top}
\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t} +
\Big(\frac{\partial\mathbf{z}_{t+1}}{\partial\mathbf{h}_t}\Big)^{\!\top}
\frac{\partial\mathcal{L}}{\partial\mathbf{z}_{t+1}}.
$$

The two Jacobians are read off the equations: $\partial\mathbf{y}_t/\partial\mathbf{h}_t =
\mathbf{W}_y$ and $\partial\mathbf{z}_{t+1}/\partial\mathbf{h}_t = \mathbf{W}_h$. Because $\phi$
acts element by element, its Jacobian is the diagonal matrix
$\operatorname{diag}(\phi'(\mathbf{z}_t))$, and the gradient with respect to the pre-activation
is an elementwise product. Call it $\mathbf{g}_t$:

$$
\mathbf{g}_t = \frac{\partial\mathcal{L}}{\partial\mathbf{z}_t} = \phi'(\mathbf{z}_t) \odot
\boldsymbol{\delta}_t, \qquad
\boldsymbol{\delta}_t = \mathbf{W}_y^\top\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t} +
\mathbf{W}_h^\top\mathbf{g}_{t+1},
$$

with the second term absent at $t = T$, where nothing comes later. Run from $t = T$ down to
$t = 1$, this is the error signal of Module 02's backward pass, travelling backwards in time
instead of down through layers (Figure 4.4, left).

### Parameter gradients are sums over time

Imagine that step $t$ had its own copy $\mathbf{W}_h^{(t)}$ of the recurrent matrix. The loss
depends on the shared $\mathbf{W}_h$ through every copy, so its gradient is the sum of the
gradients with respect to the copies. Within step $t$ the copy enters only through
$\mathbf{z}_t = \mathbf{W}_h^{(t)}\mathbf{h}_{t-1} + \dots$, which gives Module 02's outer
product $\mathbf{g}_t\mathbf{h}_{t-1}^\top$. Hence

$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_h} &= \sum_{t=1}^{T}\mathbf{g}_t\mathbf{h}_{t-1}^\top, &
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_x} &= \sum_{t=1}^{T}\mathbf{g}_t\mathbf{x}_t^\top, &
\frac{\partial\mathcal{L}}{\partial\mathbf{b}} &= \sum_{t=1}^{T}\mathbf{g}_t, \\
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_y} &= \sum_{t=1}^{T}
\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t}\mathbf{h}_t^\top, &
\frac{\partial\mathcal{L}}{\partial\mathbf{c}} &= \sum_{t=1}^{T}
\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t}. &&
\end{aligned}
$$

### The recursion unrolled

The recursion hides what the gradient is made of. Write the Jacobian of one step of the
recurrence as

$$
\mathbf{J}_k = \frac{\partial\mathbf{h}_k}{\partial\mathbf{h}_{k-1}} =
\operatorname{diag}\big(\phi'(\mathbf{z}_k)\big)\,\mathbf{W}_h .
$$

Through the state alone, $\partial\mathbf{h}_s/\partial\mathbf{h}_t =
\mathbf{J}_s\mathbf{J}_{s-1}\cdots\mathbf{J}_{t+1}$ for $s > t$. Transposing for the gradient
reverses the order, so the contribution of the loss at step $s$ to the gradient at the state of
step $t$ is

$$
\frac{\partial\mathcal{L}_s}{\partial\mathbf{h}_t} =
\mathbf{J}_{t+1}^\top\mathbf{J}_{t+2}^\top\cdots\mathbf{J}_s^\top\,
\frac{\partial\mathcal{L}_s}{\partial\mathbf{h}_s}, \qquad
\mathbf{J}_k^\top = \mathbf{W}_h^\top\operatorname{diag}\big(\phi'(\mathbf{z}_k)\big).
$$

The factor nearest the loss, $\mathbf{J}_s^\top$, acts on the gradient first. Matrices do not
commute, so writing the factors in another order, or as
$\operatorname{diag}(\phi')\,\mathbf{W}_h^\top$, gives a different matrix unless every $\phi'$
is the same.

Substituting into the parameter gradient turns it into a double sum, over the step $s$ where a
loss is incurred and every earlier step $t \le s$ where $\mathbf{W}_h$ was used:

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_h} = \sum_{s=1}^{T}\sum_{t=1}^{s}
\Big[\phi'(\mathbf{z}_t)\odot\big(\mathbf{J}_{t+1}^\top\cdots\mathbf{J}_s^\top\,
\mathbf{W}_y^\top\tfrac{\partial\mathcal{L}_s}{\partial\mathbf{y}_s}\big)\Big]
\mathbf{h}_{t-1}^\top ,
$$

where the product is empty (the identity) when $t = s$. Each term carries $s - t$ Jacobian
factors. Terms with $s - t$ small are **short-range**: they teach the network how an input
affects the next few outputs. Terms with $s - t$ large are **long-range**, and they are the only
terms that can teach it a dependency across many steps. [Section 4](#s4) is about how large a
product of many Jacobians can be. The recursion computes the whole double sum in one backward
sweep by reusing partial products; evaluating each term separately would take $O(T^2)$
matrix-vector products.

::: worked title="BPTT by hand for the scalar RNN"
Take the scalar network of [Section 2](#s2): $w = 0.5$, $u = 1$, no bias, $h_0 = 0$,
$\mathbf{x} = (1, 0, 0)$, so $h = (0.7616, 0.3634, 0.1797)$. Put a single loss on the last state,
$\mathcal{L} = \tfrac12(h_3 - 0.5)^2 = \tfrac12(-0.3203)^2 = 0.0513$.

**Backward.** $\tanh' = 1 - h^2$, and with no loss at steps 1 and 2 the recursion is
$g_t = (1 - h_t^2)\,w\,g_{t+1}$:

$$
\begin{aligned}
\delta_3 &= h_3 - 0.5 = -0.3203, \\
g_3 &= (1 - 0.1797^2)\,\delta_3 = 0.9677 \times (-0.3203) = -0.3099, \\
g_2 &= (1 - 0.3634^2)\,w\,g_3 = 0.4340 \times (-0.3099) = -0.1345, \\
g_1 &= (1 - 0.7616^2)\,w\,g_2 = 0.2100 \times (-0.1345) = -0.02824.
\end{aligned}
$$

**Parameter gradients**, summed over steps:

$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial w} &= g_3h_2 + g_2h_1 + g_1h_0
= (-0.3099)(0.3634) + (-0.1345)(0.7616) + 0 = -0.1126 - 0.1024 = -0.2151, \\
\frac{\partial\mathcal{L}}{\partial u} &= g_1x_1 + g_2x_2 + g_3x_3 = g_1 = -0.02824.
\end{aligned}
$$

The only nonzero input entered two steps before the loss, so its gradient passed through two
Jacobian factors, $J_3 = w(1 - h_3^2) = 0.484$ and $J_2 = w(1 - h_2^2) = 0.434$, whose product is
0.21. Central differences, $(\mathcal{L}(w + \epsilon) - \mathcal{L}(w - \epsilon))/2\epsilon$
with $\epsilon = 10^{-6}$ in float64, give $-0.21506$ and $-0.028243$, the same values to the
digits shown.
:::

### Cost

Per layer, the forward pass spends about $B \cdot T \cdot H^2$ multiply-adds on the recurrent
product (plus $B \cdot T \cdot H \cdot d_{\text{in}}$ on the inputs). The backward pass spends
about twice that: one product with $\mathbf{W}_h^\top$ to pass $\mathbf{g}_{t+1}$ back, and one
outer product to accumulate $\mathbf{g}_t\mathbf{h}_{t-1}^\top$. It is sequential in $t$ like the
forward pass. It also needs every $\mathbf{h}_t$ and $\mathbf{z}_t$ of the forward pass, so its
memory is $O(B \cdot T \cdot H)$: proportional to the sequence length.

There is a forward-mode alternative. **Real-time recurrent learning** (Williams and Zipser 1989)
carries the sensitivity $\partial\mathbf{h}_t/\partial\mathbf{W}_h$ forward with the state and
updates it at every step, so it stores nothing from the past and gives a gradient at every step,
online. The sensitivity is an $H \times H^2$ array, and updating it needs the product of an
$H \times H$ matrix with it: $O(H^4)$ work per step, against BPTT's $O(H^2)$. At $H = 128$ that
is $2.7 \times 10^8$ multiply-adds per step per sequence, and 2.1 million numbers of storage per
sequence, which is why RTRL is not used at scale.

### Truncated BPTT

A long stream does not fit in memory as one unrolled graph. **Truncated BPTT** cuts it into
chunks of $k$ steps. The state is carried forward from one chunk to the next, but the gradient is
not: the graph is cut at each chunk boundary (Figure 4.4, right). In PyTorch the cut is one
call, `detach()`:

```python
h = torch.zeros(1, B, H)
for X, Y in chunks:              # consecutive k-step pieces of the same B streams
    h = h.detach()               # keep the value, cut the graph behind it
    out, h = rnn(X, h)
    loss = loss_fn(head(out), Y)
    opt.zero_grad()
    loss.backward()
    opt.step()
```

Memory falls from $O(B \cdot T \cdot H)$ to $O(B \cdot k \cdot H)$. The price is that a dependency
longer than $k$ steps never receives a gradient directly. Information can still flow forward
through the carried state, so the network may use a long dependency it happens to carry, but
nothing in the loss tells it to learn one. A common variant updates every $k_1$ steps and
backpropagates $k_2 \ge k_1$ steps (Williams and Peng 1990).

Memory sizes in this module are decimal: 1 kB = $10^3$ B, 1 MB = $10^6$ B, 1 GB = $10^9$ B.
Binary units are written KiB, MiB and GiB (1 GiB = $2^{30}$ B) and are given in brackets where a
size is a power of two or recurs in another module.

::: worked title="Full versus truncated BPTT on a sensor stream"
A stream of $T = 100{,}000$ sensor samples, a batch of $B = 32$ streams, $H = 256$ state units,
float32 (4 bytes). Keeping every $\mathbf{h}_t$ for full BPTT takes

$$
100{,}000 \times 32 \times 256 \times 4\ \text{B} = 3.28 \times 10^9\ \text{B} = 3.28\ \text{GB}
$$

for the states alone. An LSTM ([Section 5](#s5)) keeps about six tensors of that size per step
(its gates, cell state and output), about $6 \times 3.28 \approx 20$ GB. With truncation to
chunks of $k = 200$ steps the same buffer is

$$
200 \times 32 \times 256 \times 4\ \text{B} = 6.55 \times 10^6\ \text{B} = 6.55\ \text{MB},
$$

500 times smaller, at the cost of no direct gradient beyond 200 steps.
:::

::: figure id=fig-04-4
Left: the unrolled graph of Figure 4.3 with forward arrows in grey and backward arrows in red:
$\boldsymbol{\delta}_t$ arrives from $\mathcal{L}_t$ (vertical) and from
$\boldsymbol{\delta}_{t+1}$ through $\phi'$ and $\mathbf{W}_h^\top$ (horizontal). Below it, a
strip shows $\partial\mathcal{L}/\partial\mathbf{W}_h$ as a sum of per-step outer products
$\mathbf{g}_t\mathbf{h}_{t-1}^\top$. Right: a long stream cut into chunks of $k$
steps, with scissors at the boundaries: the grey state arrow continues across each cut
(forward), the red gradient arrow stops at it ("detach").
:::

### Checking the gradients

A hand-written backward pass is checked as in [Module 02](module_02_EN.html): on a tiny model in
float64, perturb a few entries of every parameter by $\pm\epsilon$ ($\epsilon = 10^{-5}$), form
the central difference, and compare it with the analytic gradient by the relative error
$|a - n| / \max(|a|, |n|)$. Errors around $10^{-6}$ to $10^{-9}$ mean the backward pass is right;
anything above $10^{-4}$ is a bug. Lab 1 does this before training. A typical recurrent bug, a
missing $\mathbf{W}_h^\top\mathbf{g}_{t+1}$ term, passes a check with $T = 1$ and fails at
$T = 4$, so check with several steps.

::: check
Why are an RNN's parameter gradients sums over time steps?
:::

::: answer
The same $\mathbf{W}_h$, $\mathbf{W}_x$ and $\mathbf{b}$ are used at every step. The loss
depends on each weight through every one of those uses, and the multivariate chain rule adds the
contribution of each use.
:::

::: check
With truncated BPTT of $k = 25$ steps, can the model use information from 50 steps ago?
:::

::: answer
It can carry it in the state, because the state is passed across chunk boundaries, but no
gradient ever tells it to. Dependencies longer than $k$ are learned only indirectly, if at all.
Lab 1's closing tag, which must repeat an opening tag 18 to 36 characters earlier, is the
concrete case.
:::

## Vanishing and exploding gradients {#s4}

Every long-range term of [Section 3](#s3) contains a product of $n$ Jacobians, $n$ being the
distance between a use of the weights and the loss it affects. Such a product shrinks or grows
geometrically in $n$ and almost never stays of order 1. This, not a lack of capacity, is what
kept plain recurrent networks from learning long dependencies.

### One unit, no nonlinearity

For a linear scalar recurrence $h_t = wh_{t-1} + ux_t$ every Jacobian equals $w$, so
$\partial h_T/\partial h_{T-n} = w^n$:

| $w$ | $n = 10$ | $n = 50$ | $n = 100$ |
|---|---|---|---|
| 0.5 | $9.8 \times 10^{-4}$ | $8.9 \times 10^{-16}$ | $7.9 \times 10^{-31}$ |
| 0.9 | 0.349 | $5.2 \times 10^{-3}$ | $2.7 \times 10^{-5}$ |
| 0.99 | 0.904 | 0.605 | 0.366 |
| 1.01 | 1.10 | 1.64 | 2.70 |
| 1.1 | 2.59 | 117 | $1.4 \times 10^{4}$ |
| 2 | $1.0 \times 10^{3}$ | $1.1 \times 10^{15}$ | $1.3 \times 10^{30}$ |

::: worked title="How far back a recurrent weight reaches"
Take a ratio of $10^{-3}$ as the edge of a useful learning signal. It is reached at lag
$n = \ln 10^{-3} / \ln w$:

$$
w = 0.5:\ n = \frac{-6.908}{-0.6931} = 9.97, \qquad
w = 0.9:\ n = \frac{-6.908}{-0.1054} = 65.6, \qquad
w = 0.99:\ n = \frac{-6.908}{-0.01005} = 687.
$$

Even $w = 0.99$ runs out: $0.99^{500} = 6.6 \times 10^{-3}$. On the other side,
$1.01^{100} = 2.70$ is harmless, $1.1^{50} = 117$ is not, and $2^{50} = 1.1 \times 10^{15}$ wrecks
any update. For $w = 0.5$ the factor reaches the smallest normal float32 number,
$2^{-126} \approx 1.2 \times 10^{-38}$, at $n = 126$. Only a narrow band around $|w| = 1$ carries
a signal across hundreds of steps.
:::

### Many units, still linear

Without a nonlinearity the gradient is multiplied by $\mathbf{W}_h^\top$ at each step back. If
$\mathbf{W}_h = \mathbf{Q}\boldsymbol{\Lambda}\mathbf{Q}^{-1}$ is diagonalisable, then
$(\mathbf{W}_h^\top)^n = \mathbf{Q}^{-\top}\boldsymbol{\Lambda}^n\mathbf{Q}^\top$: in the
coordinates $\mathbf{a} = \mathbf{Q}^\top\mathbf{g}$ each component is multiplied by
$\lambda_i^n$. Components with $|\lambda_i| < 1$ vanish, those with $|\lambda_i| > 1$ explode,
and eventually the largest $|\lambda_i|$ dominates, so the gradient points along one direction
whatever output it came from. The long-run rate is the **spectral radius**
$\rho(\mathbf{W}) = \max_i |\lambda_i|$; Gelfand's formula,
$\lVert\mathbf{W}^n\rVert^{1/n} \to \rho(\mathbf{W})$, makes this hold in any norm, diagonalisable
or not.

::: worked title="A 2 × 2 recurrence, linear and with tanh"
$\mathbf{W}_h = \begin{pmatrix} 0.8 & 0.3 \\ 0.3 & 0.8 \end{pmatrix}$ is symmetric with
eigenvalues $0.8 \pm 0.3$: $\lambda_1 = 1.1$ along $(1, 1)/\sqrt2$, $\lambda_2 = 0.5$ along
$(1, -1)/\sqrt2$. Send back $\mathbf{g} = (1, 0) = \tfrac12(1, 1) + \tfrac12(1, -1)$:

$$
(\mathbf{W}_h^\top)^n\mathbf{g} = \tfrac12(1.1)^n(1, 1) + \tfrac12(0.5)^n(1, -1).
$$

- $n = 1$: $(0.55 + 0.25,\ 0.55 - 0.25) = (0.8, 0.3)$.
- $n = 20$: $\tfrac12(1.1)^{20} = 3.364$ and $\tfrac12(0.5)^{20} = 4.8 \times 10^{-7}$, so
  $(3.364, 3.364)$, norm 4.76.
- $n = 50$: $(58.70, 58.70)$, norm 83.0.

The 0.5-component has vanished ($0.5^{20} = 9.5 \times 10^{-7}$) and the gradient points along
$(1, 1)$. Now make the units tanh, both sitting at $|h| \approx 0.6$, so $\tanh' = 1 - 0.6^2 =
0.64$ at every step. Along $(1, 1)$ the per-step factor is $1.1 \times 0.64 = 0.704$:
$0.704^{20} = 8.9 \times 10^{-4}$ and $0.704^{50} = 2.4 \times 10^{-8}$. The nonlinearity has
turned an exploding direction into a vanishing one.
:::

### A bound from the singular values

Eigenvalues describe the long run; singular values bound every step. Since
$\mathbf{J}_k^\top = \mathbf{W}_h^\top\operatorname{diag}(\phi'(\mathbf{z}_k))$,

$$
\lVert\mathbf{J}_k^\top\rVert \le \gamma\,\sigma_{\max}(\mathbf{W}_h),
\qquad
\big\lVert\mathbf{J}_{t+1}^\top\cdots\mathbf{J}_T^\top\big\rVert \le
\big(\gamma\,\sigma_{\max}\big)^{T-t},
$$

with $\gamma = \sup|\phi'|$ (1 for tanh and ReLU, $1/4$ for the logistic sigmoid $\sigma$) and
$\sigma_{\max}$ the largest singular value. Hence (Pascanu, Mikolov and Bengio 2013)
$\gamma\sigma_{\max} < 1$ is **sufficient for vanishing**, and $\gamma\sigma_{\max} > 1$ is
**necessary for exploding**: it allows growth without forcing it.

::: note
**Non-normal matrices grow before they decay.** $\mathbf{N} = \begin{pmatrix} 0.5 & 1 \\ 0 &
0.5 \end{pmatrix}$ has $\rho = 0.5$ but $\sigma_{\max} = 1.207$; $\lVert\mathbf{N}^n\rVert$ for
$n = 1$ to 5 is 1.207, 1.059, 0.770, 0.508, 0.316, and 0.0196 at $n = 10$. PyTorch's default
`nn.RNN` initialisation is of this kind. It draws $\mathbf{W}_h$ uniformly from
$[-1/\sqrt H, 1/\sqrt H]$, entry variance $1/(3H)$; the eigenvalues of such a random matrix fill a
disc of radius about $1/\sqrt3 = 0.58$, while its largest singular value approaches
$2/\sqrt3 = 1.15$. Lab 2 measures $\rho \approx 0.57$ and $\sigma_{\max} \approx 1.10$ for
$H = 64$.
:::

### What the nonlinearity adds

In $\mathbf{J}_k = \operatorname{diag}(\phi'(\mathbf{z}_k))\mathbf{W}_h$, the tanh derivative
$1 - \tanh^2 z$ is 1 only at $z = 0$: 0.42 at $z = 1$, 0.071 at $z = 2$, 0.0099 at $z = 3$.
Every unit that leaves the linear region multiplies a small factor into the product, so even an
orthogonal $\mathbf{W}_h$, every singular value exactly 1, loses the gradient. Explosion needs
$\rho$ well above 1, because a large gain drives the units into saturation and partly cancels
itself.

A simulation gives the sizes: $H = 32$, orthogonal $\mathbf{W}_h$ scaled to radius $\rho$, tanh,
independent inputs of standard deviation $\sigma_x$ added to the pre-activation at every step, a
random unit gradient sent back from the last step. With $\rho = 1$ and $\sigma_x = 1$ one draw
gives ratios of $1.8 \times 10^{-2}$, $5.5 \times 10^{-11}$ and $5.1 \times 10^{-21}$ at lags 10,
50 and 100, where a linear network keeps exactly 1. With $\sigma_x = 0.1$ it is still
$1.3 \times 10^{-3}$ at lag 100; with $\rho = 1.5$, $1.3 \times 10^{-7}$; only $\rho = 3$
explodes ($5.5 \times 10^{8}$). Other draws change these by a factor of a few, not their order
of magnitude.

::: widget name=gradient-flow-explorer
The default is the simulation above, with the widget's own random draw: the ratio passes
$6.7 \times 10^{-3}$, $3.1 \times 10^{-11}$ and $1.1 \times 10^{-21}$ at lags 10, 50 and 100.
Switch to linear and the curve lies on the flat $\rho^n$
line; switch back and lower $\sigma_x$ to watch the $\phi'$ histogram move to 1. Raise $\rho$ to
1.5, then 3. Choose the Gaussian matrix, with the linear setting, to see transient growth
above the dashed line. Compare the LSTM cell path, a
product of forget gates: with $b_f = 4$ it is near 0.1 at lag 100 ($\sigma(4)^{100} = 0.163$
with no spread). [Section 5](#s5) explains it.
:::

### Why vanishing is worse than it looks

The long-range terms of the gradient are exponentially smaller than the short-range ones, so
the total gradient looks healthy, the loss falls and the network learns short-range
correlations; the long dependency's contribution is buried under them and under minibatch noise.
The network is never told the dependency exists. Hochreiter identified this in his 1991 diploma
thesis; Bengio, Simard and Frasconi (1994) showed it with networks asked to latch one bit over
growing delays, and showed that storing a bit robustly, with contracting dynamics around a
stable state, is exactly the condition that makes the gradient vanish. The latching unit of
[Section 2](#s2) is a small instance: its local factors fell to 0.347 and 0.200.

In [Lab 1](#lab1) the consequence is behavioural. The RNN learns every local rule of the log,
including a numerical threshold, but its samples close a line with the tag that opened it 18 to
36 characters earlier only about one time in five at temperature 0.5 (21% in Lab 1's run, 14 to
25% for the plain RNN of Lab 2), against 12.5% for guessing among the eight asset tags. The
LSTMs of [Lab 2](#lab2) learn it.

### Cliffs, and clipping

Where the product of Jacobians is large, the loss surface has a near-vertical wall (Figure 4.6).
A step proportional to the huge gradient at its foot throws the parameters far away: a loss
spike or NaN, often after thousands of quiet updates.

::: figure id=fig-04-6
A one-dimensional slice of a recurrent network's loss against one parameter: a gently sloping
valley interrupted by a near-vertical wall, the cliff. From a point at its foot, an unclipped
gradient step leaps far off the plot, while a clipped step of bounded length in the same
direction stays in the valley. After the picture in Pascanu, Mikolov and Bengio (2013).
:::

**Gradient clipping** by the global norm replaces $\mathbf{g}$ by
$(c/\lVert\mathbf{g}\rVert)\,\mathbf{g}$ whenever $\lVert\mathbf{g}\rVert > c$: the direction is
kept, the step bounded. For recurrent networks $c$ from 1 to 5 is usual
([Module 02](module_02_EN.html) gives the general rule). Clipping each component separately,
**value clipping**, changes the direction.

::: worked title="Norm clipping against value clipping"
$\mathbf{g} = (3, 4)$ has norm 5; clipping to $c = 1$ gives $(0.6, 0.8)$, same direction.
$\mathbf{g} = (30, 0.4)$ points $\arctan(0.4/30) = 0.8^\circ$ off the first axis. Value clipping
to $[-1, 1]$ gives $(1, 0.4)$, at $\arctan 0.4 = 21.8^\circ$. Norm clipping divides by 30.003 and
gives $(0.99991, 0.01333)$, still $0.8^\circ$.
:::

Clipping cures exploding gradients and does nothing for vanishing ones: it never enlarges a
gradient.

### Initialisation, and the structural fix

An orthogonal $\mathbf{W}_h$ (Saxe, McClelland and Ganguli 2014) starts every singular value at
1. Identity initialisation with ReLU units (Le, Jaitly and Hinton 2015) is similar, and unitary
constraints kept throughout training (Arjovsky, Shah and Bengio 2016) go further. None removes
the nonlinearity's factor, and only the constraints stop training from moving $\mathbf{W}_h$.
The structural fix is an additive path on which the gradient is not multiplied by
$\mathbf{W}_h$ and $\phi'$ at every step: the LSTM of [Section 5](#s5), the same remedy as the
residual connection across depth in [Module 03](module_03_EN.html).

::: check
With tanh units and a $\mathbf{W}_h$ whose largest singular value is 0.8, can gradients explode?
:::

::: answer
No. Every Jacobian has norm at most $1 \times 0.8$, so the product over $n$ steps is at most
$0.8^n$.
:::

::: check
Why does an orthogonal $\mathbf{W}_h$ not prevent vanishing gradients in a tanh RNN?
:::

::: answer
The Jacobian also contains $\operatorname{diag}(\tanh'(\mathbf{z}_k))$, at most 1 and equal to 1
only at $z = 0$. Whenever units leave the linear region each step multiplies in factors below 1.
:::

::: check
Which of gradient clipping and orthogonal initialisation addresses which failure?
:::

::: answer
Clipping bounds every update: exploding gradients. Orthogonal initialisation starts the singular
values at 1, which helps against vanishing early in training. Neither fixes vanishing once tanh
saturates.
:::
