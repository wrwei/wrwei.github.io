## The LSTM: an additive memory path {#s5}

[Section 4](#s4) ended with a diagnosis. The per-step Jacobian of a plain recurrence,
$\operatorname{diag}(\phi'(\mathbf{z}_k))\,\mathbf{W}_h$, is a fixed matrix times a derivative of
at most 1, and a long product of such factors vanishes whatever the initialisation. The remedy is
structural: give the gradient a second path whose per-step factor is a number the network chooses
at every step and can hold close to 1. That path is the **cell state** of the **long short-term
memory** (LSTM).

### The equations

The cell keeps two vectors of width $H$, the cell state $\mathbf{c}_t$ and the hidden state
$\mathbf{h}_t$. At every step it reads the concatenation $[\mathbf{h}_{t-1}; \mathbf{x}_t]$, a
vector of length $H + d_\text{in}$, and computes three **gates** and a candidate:

$$\begin{aligned}
\mathbf{f}_t &= \sigma(\mathbf{W}_f[\mathbf{h}_{t-1};\mathbf{x}_t] + \mathbf{b}_f) && \text{forget gate}\\
\mathbf{i}_t &= \sigma(\mathbf{W}_i[\mathbf{h}_{t-1};\mathbf{x}_t] + \mathbf{b}_i) && \text{input gate}\\
\tilde{\mathbf{c}}_t &= \tanh(\mathbf{W}_c[\mathbf{h}_{t-1};\mathbf{x}_t] + \mathbf{b}_c) && \text{candidate}\\
\mathbf{c}_t &= \mathbf{f}_t\odot\mathbf{c}_{t-1} + \mathbf{i}_t\odot\tilde{\mathbf{c}}_t && \text{cell update}\\
\mathbf{o}_t &= \sigma(\mathbf{W}_o[\mathbf{h}_{t-1};\mathbf{x}_t] + \mathbf{b}_o) && \text{output gate}\\
\mathbf{h}_t &= \mathbf{o}_t\odot\tanh(\mathbf{c}_t) && \text{output}
\end{aligned}$$

Each matrix is $H \times (H + d_\text{in})$, so $\mathbf{W}_f \in
\mathbb{R}^{H\times(H+d_\text{in})}$. A gate is a vector of numbers in $(0, 1)$ multiplied
elementwise into something else: a soft switch set by the current input and the previous output.
The **forget gate** says how much of each stored value to *keep*, the input gate how much of the
candidate to *write*, the output gate how much of the memory to *read*. $\mathbf{c}_t$ is the
memory; it is never squashed between steps, so its entries can exceed 1. $\mathbf{h}_t$ is the
output and working state, bounded by the tanh; it is what the next layer, the head and the next
step's gates see. Figure 4.7 draws the cell.

::: figure id=fig-04-7
The LSTM cell. A horizontal line across the top carries $\mathbf{c}_{t-1}$ to $\mathbf{c}_t$
through a multiply node ($\times\,\mathbf{f}_t$) and an add node
($+\,\mathbf{i}_t\odot\tilde{\mathbf{c}}_t$), drawn thick and highlighted as "the additive path".
Below it, four small boxes $\sigma$, $\sigma$, tanh, $\sigma$ compute $\mathbf{f}_t$,
$\mathbf{i}_t$, $\tilde{\mathbf{c}}_t$ and $\mathbf{o}_t$ from $[\mathbf{h}_{t-1};\mathbf{x}_t]$;
a tanh applied to $\mathbf{c}_t$ is multiplied by $\mathbf{o}_t$ to give $\mathbf{h}_t$. A red
dashed arrow runs right to left along the top line, labelled
$\partial\mathbf{c}_t/\partial\mathbf{c}_{t-1} = \operatorname{diag}(\mathbf{f}_t)$.
:::

### Why the cell path keeps its gradient

Differentiate the cell update with respect to $\mathbf{c}_{t-1}$. The term
$\mathbf{f}_t\odot\mathbf{c}_{t-1}$ depends on it directly; the gates and the candidate depend on it
through $\mathbf{h}_{t-1} = \mathbf{o}_{t-1}\odot\tanh(\mathbf{c}_{t-1})$. With
$\mathbf{W}_f^{h}$ the $H\times H$ block of $\mathbf{W}_f$ that multiplies $\mathbf{h}_{t-1}$
(and likewise for the others), the product and chain rules give

$$\frac{\partial\mathbf{c}_t}{\partial\mathbf{c}_{t-1}}
= \operatorname{diag}(\mathbf{f}_t)
+ \Big[\operatorname{diag}(\mathbf{c}_{t-1})\frac{\partial\mathbf{f}_t}{\partial\mathbf{h}_{t-1}}
+ \operatorname{diag}(\tilde{\mathbf{c}}_t)\frac{\partial\mathbf{i}_t}{\partial\mathbf{h}_{t-1}}
+ \operatorname{diag}(\mathbf{i}_t)\frac{\partial\tilde{\mathbf{c}}_t}{\partial\mathbf{h}_{t-1}}\Big]
\frac{\partial\mathbf{h}_{t-1}}{\partial\mathbf{c}_{t-1}},$$

with, for example, $\partial\mathbf{f}_t/\partial\mathbf{h}_{t-1} =
\operatorname{diag}(\mathbf{f}_t\odot(1-\mathbf{f}_t))\,\mathbf{W}_f^{h}$ and
$\partial\mathbf{h}_{t-1}/\partial\mathbf{c}_{t-1} =
\operatorname{diag}(\mathbf{o}_{t-1}\odot(1-\tanh^2\mathbf{c}_{t-1}))$. The bracketed terms have
the shape of a plain recurrence's Jacobian, a weight block times derivatives of saturating
functions, and long products of them can vanish for the reasons of Section 4.

The first term is different. Follow only it from step $t$ to step $T$:

$$\frac{\partial\mathbf{c}_T}{\partial\mathbf{c}_t}\bigg|_\text{direct}
= \prod_{k=t+1}^{T}\operatorname{diag}(\mathbf{f}_k), \qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{c}_t}\bigg|_\text{direct}
= \mathbf{f}_{t+1}\odot\mathbf{f}_{t+2}\odot\cdots\odot\mathbf{f}_T\odot
\frac{\partial\mathcal{L}}{\partial\mathbf{c}_T}.$$

The product is diagonal: unit $j$'s gradient is multiplied by $f_{k,j}$ at step $k$ and by
nothing else. There is no matrix power, so no eigenvalue below 1 shrinks the signal; there is no
tanh derivative, so saturation does not enter; and each factor is a gate value the network sets
per step from the data, holding it near 1 while unit $j$ must remember and dropping it when it need
not. With $\mathbf{f}\approx\mathbf{1}$ the gradient passes through many steps unchanged:
Hochreiter and Schmidhuber's **constant error carousel**.

The total gradient sums over all paths, and the indirect ones can still vanish; they carry
short-range credit. The cell path carries the long-range credit, telling the network that a
distant input mattered. It is the remedy of the residual connection across depth in
[Module 03](module_03_EN.html): a path the gradient travels without a weight matrix at every stage.

::: worked title="One LSTM step with a scalar state"
Take $H = 1$, $c_{t-1} = 1.0$, and pre-activations 2 (forget), 0 (input), 1 (candidate) and 0
(output).

Gates: $f_t = \sigma(2) = 1/(1+e^{-2}) = 0.8808$; $i_t = \sigma(0) = 0.5$;
$\tilde c_t = \tanh(1) = 0.7616$; $o_t = \sigma(0) = 0.5$.

Cell update: $c_t = 0.8808\cdot 1.0 + 0.5\cdot 0.7616 = 0.8808 + 0.3808 = 1.2616$.

Output: $h_t = 0.5\cdot\tanh(1.2616) = 0.5\cdot 0.8515 = 0.4258$.

Along the direct path, $\partial c_t/\partial c_{t-1} = f_t = 0.8808$. The cell now holds a value
above 1, which a tanh-bounded state could not; the output gate has read out about a third of it.
:::

### History, briefly

The 1997 LSTM of Hochreiter and Schmidhuber had input and output gates and a cell
self-connection of fixed weight 1: the carousel, with no way to clear it, so on long streams the
cell filled up. The forget gate was added by Gers, Schmidhuber and Cummins (2000); the form above
is what everyone now means by "LSTM". Peephole connections (gates that also read $\mathbf{c}$)
came soon after and are rarely used now. Greff et al. (2017) compared eight variants and found
none significantly better than the standard cell; the forget gate and the output activation
mattered most.

### The forget-gate bias

At initialisation the weights are small, so each forget gate sits near $\sigma(b_f)$: the default
memory per step. Over $n$ steps the cell path multiplies the gradient by about $\sigma(b_f)^n$, and
solving $\sigma(b_f)^n = 0.5$ for $n$ gives the **half-life** of the default memory:

$$n_{1/2} = \frac{\ln 0.5}{\ln\sigma(b_f)}.$$

Since $1-\sigma(b) = 1/(1+e^{b})$, the time constant $1/(1-f)$ of a memory with retention
$f = \sigma(b_f)$ is exactly $1 + e^{b_f}$ steps: each unit of bias multiplies the time scale by
about $e$. With $b_f = 0$ the gate starts at 0.5 and the half-life is one step. The gradient from
a target 20 steps away arrives at a millionth of its size, and the network must discover from that
signal that remembering pays; it can spend its first thousand updates forgetting everything.

::: worked title="Memory products over 20 and 100 steps"
Compute $f = \sigma(b_f)$, then $f^{20}$, $f^{100}$ and the half-life $\ln 0.5/\ln f$:

| $b_f$ | $f = \sigma(b_f)$ | $f^{20}$ | $f^{100}$ | half-life (steps) |
|---|---|---|---|---|
| 0 | 0.5000 | $9.5\times10^{-7}$ | $7.9\times10^{-31}$ | 1.0 |
| 1 | 0.7311 | $1.9\times10^{-3}$ | $2.5\times10^{-14}$ | 2.2 |
| 2 | 0.8808 | 0.079 | $3.1\times10^{-6}$ | 5.5 |
| 3 | 0.9526 | 0.378 | $7.8\times10^{-3}$ | 14.3 |
| 4 | 0.9820 | 0.696 | 0.163 | 38.2 |
| 5 | 0.9933 | 0.874 | 0.511 | 103 |

Check one row by hand: $\sigma(3) = 1/(1+e^{-3}) = 1/1.0498 = 0.9526$; $\ln 0.9526 = -0.04859$;
$20\times(-0.04859) = -0.9717$ and $e^{-0.9717} = 0.378$; the half-life is
$-0.6931/(-0.04859) = 14.3$ steps. Moving $b_f$ from 0 to 3 turns a gradient factor of $10^{-6}$
at lag 20 into one of 0.4.
:::

Training moves the bias, but the starting value decides which gradients arrive early on.
Jozefowicz, Zaremba and Sutskever (2015) found that a forget bias of 1 closed most of the gap they
measured between the LSTM and the GRU. Chrono initialisation (Tallec and Ollivier 2018) sets each
unit's $b_f$ from the expected range of dependency lengths, by the time-constant relation: to
remember for about $T$ steps, take $b_f \approx \ln(T-1)$. A forget bias of 1 or 2 is the single
most useful LSTM trick.

### In PyTorch

`nn.LSTM` stacks the four gates' weights into one matrix per layer: `weight_ih_l0` has shape
`(4H, d_in)` and `weight_hh_l0` shape `(4H, H)`, in the order **i, f, g, o**, where `g` is
PyTorch's name for the candidate $\tilde{\mathbf{c}}$. There are two bias vectors,
`bias_ih_l0` and `bias_hh_l0`, which simply add, so the effective forget bias is
`bias_ih_l0[H:2*H] + bias_hh_l0[H:2*H]`. Every weight and bias is initialised from
$U(-1/\sqrt{H}, 1/\sqrt{H})$, so the default forget bias is about 0: the half-life-of-one-step
regime of the table. Setting it takes a few lines:

```python
import torch
import torch.nn as nn

def set_forget_bias(lstm: nn.LSTM, value: float) -> None:
    """Make the effective forget-gate bias equal `value` in every layer and direction."""
    H = lstm.hidden_size
    with torch.no_grad():
        for name, p in lstm.named_parameters():
            if name.startswith("bias_ih"):
                p[H:2 * H].fill_(value)      # gates are stacked i, f, g, o
            elif name.startswith("bias_hh"):
                p[H:2 * H].zero_()           # the two bias vectors add

lstm = nn.LSTM(input_size=1, hidden_size=32, batch_first=True)
set_forget_bias(lstm, 1.0)
```

### Parameters and compute

Four matrices of size $H\times(H+d_\text{in})$ and four biases give $4H(H + d_\text{in} + 1)$
parameters; PyTorch's two bias vectors make it $4H(H + d_\text{in}) + 8H$, four times a plain
recurrent layer of the same width. Each step computes four matrix-vector products of size
$H\times(H + d_\text{in})$: about $8H(H + d_\text{in})$ floating-point operations per step and
per sequence, counting a multiply-add as two.

::: worked title="Counting an LSTM's parameters"
`nn.LSTM(1, 32)`: $4\cdot 32\cdot(32 + 1) + 8\cdot 32 = 4{,}224 + 256 = 4{,}480$.

A two-layer forecaster, `nn.LSTM(1, 32, num_layers=2)`: the second layer reads the first layer's
32-wide output, so it has $4\cdot 32\cdot(32 + 32) + 256 = 8{,}192 + 256 = 8{,}448$. The stack
totals $4{,}480 + 8{,}448 = 12{,}928$; a `Linear(32, 1)` head adds $32 + 1 = 33$, giving
$12{,}961$, the number [Lab 3](#lab3) prints.
:::

### What the cells learn

Karpathy, Johnson and Fei-Fei (2016) inspected character-level LSTMs trained on text and code and
found a few cells that track interpretable quantities, such as position within a line or being
inside a quotation: a forget gate held near 1 and an input gate that opens on one character make
these easy. Most cells admit no such reading.

### What the labs show

In [Lab 2](#lab2), with forget bias 0 an LSTM's gradient decays with lag like a plain network's;
with bias 3 or 5 the gradient ratio stays between about 0.14 and 0.4 out to lag 100. On
[Lab 1](#lab1)'s maintenance log, after 2,500 updates, the closing tag (18 to 36 characters
after its opening tag) is right 14 to 25% of the time for a plain RNN, near the 12.5% of
guessing, and 64 to 96% for the LSTMs with forget bias 0 and 1 (Lab 2's run and a second seed).
Which of the two LSTMs is ahead changes with the seed; the gap between the gated cells and the
plain one does not.

::: keyidea
Along the LSTM's cell path the gradient is multiplied at each step by the forget gate, a number
the network chooses and can hold near 1, not by a fixed matrix and a tanh derivative.
:::

::: check
What is $\partial\mathbf{c}_t/\partial\mathbf{c}_{t-1}$ along an LSTM's direct path, and why does
it not vanish the way $\mathbf{W}_h^n$ does?
:::

::: answer
It is $\operatorname{diag}(\mathbf{f}_t)$: gate values the network sets per step and per unit and
can hold near 1. There is no tanh derivative and no fixed matrix raised to a power in it.
:::

::: check
You set `nn.LSTM`'s `bias_ih_l0[H:2*H] = 1` and leave `bias_hh_l0` at its default. What is the
effective initial forget bias?
:::

::: answer
About 1, plus a small per-unit term drawn from $U(-1/\sqrt{H}, 1/\sqrt{H})$, because the two bias
vectors add. To make it exactly 1, also zero `bias_hh_l0[H:2*H]`.
:::

## The GRU, stacking and bidirectional networks {#s6}

The **gated recurrent unit** (GRU) of Cho et al. (2014) builds the same additive path with one
state and two gates. This section compares it with the LSTM, then turns to the two ways recurrent
layers are composed: stacked in depth, and run in both directions.

### The GRU

$$\begin{aligned}
\mathbf{z}_t &= \sigma(\mathbf{W}_z[\mathbf{h}_{t-1};\mathbf{x}_t] + \mathbf{b}_z) && \text{update gate}\\
\mathbf{r}_t &= \sigma(\mathbf{W}_r[\mathbf{h}_{t-1};\mathbf{x}_t] + \mathbf{b}_r) && \text{reset gate}\\
\tilde{\mathbf{h}}_t &= \tanh(\mathbf{W}[\mathbf{r}_t\odot\mathbf{h}_{t-1};\mathbf{x}_t] + \mathbf{b}) && \text{candidate}\\
\mathbf{h}_t &= (1-\mathbf{z}_t)\odot\mathbf{h}_{t-1} + \mathbf{z}_t\odot\tilde{\mathbf{h}}_t && \text{update}
\end{aligned}$$

The update gate decides, per unit, how far to move the state towards the candidate. The reset gate
decides how much of the old state the candidate may see; with $\mathbf{r}_t\approx\mathbf{0}$ a
unit starts afresh from the input. Differentiating the last line as in [Section 5](#s5) gives
$\partial\mathbf{h}_t/\partial\mathbf{h}_{t-1} = \operatorname{diag}(1-\mathbf{z}_t)$ plus terms
through the gates and the candidate: along the direct path the gradient is multiplied by
$1-z_{k,j}$ per step, held near 1 by keeping the update gate near 0. It is the LSTM's trick with
one state instead of two. Figure 4.9 draws the cell.

::: figure id=fig-04-9
The GRU cell, drawn in the same style as Figure 4.7. $\mathbf{h}_{t-1}$ enters and splits: one
path is scaled by $(1-\mathbf{z}_t)$; the other passes through the reset gate $\mathbf{r}_t$ into
the tanh candidate $\tilde{\mathbf{h}}_t$, which is scaled by $\mathbf{z}_t$. The two are added to
give $\mathbf{h}_t$. The $(1-\mathbf{z}_t)$ path is highlighted as the additive path.
:::

::: pitfall
The sign convention for $\mathbf{z}$ varies. Cho et al. (2014) and PyTorch write
$\mathbf{h}_t = (1-\mathbf{z}_t)\odot\mathbf{n}_t + \mathbf{z}_t\odot\mathbf{h}_{t-1}$, so their
$\mathbf{z}$ means *keep*; this module uses it to mean *update*. They are the same model with
$\mathbf{z}$ replaced by $1-\mathbf{z}$, but a bias meant to favour memory must have the right
sign: in PyTorch a *positive* update-gate bias favours memory. PyTorch also applies the reset gate
after the hidden matrix multiply, $\mathbf{n}_t = \tanh(\mathbf{W}_{in}\mathbf{x}_t +
\mathbf{b}_{in} + \mathbf{r}_t\odot(\mathbf{W}_{hn}\mathbf{h}_{t-1} + \mathbf{b}_{hn}))$, a minor
variant, and stacks its gates in the order r, z, n.
:::

### An engineering reading: a learned low-pass filter

Hold the update gate at a constant $z$. Then $h_t = (1-z)\,h_{t-1} + z\,\tilde h_t$ is an
exponential moving average of the candidate, the discrete form of a first-order low-pass filter.
Its impulse response decays as $(1-z)^n$, so its memory half-life is $\ln 0.5/\ln(1-z)$ steps;
with samples $\Delta t$ apart, $1 - z = e^{-\Delta t/\tau}$ defines its time constant $\tau$. The
GRU is a bank of such filters whose time constants the input sets per unit and per step: a unit
can integrate slowly through a steady stretch, then snap to a new value when its gates open.

::: worked title="A leaky integrator"
With a constant update gate $z = 0.1$, each step keeps $1 - z = 0.9$ of the state. The half-life
is $\ln 0.5/\ln 0.9 = -0.6931/(-0.10536) = 6.58$ steps; after 20 steps $0.9^{20} = 0.12$ of the
original value remains. At a 100 Hz sampling rate that is a filter with time constant
$\tau = -0.01/\ln 0.9 = 0.095$ s.
:::

### Parameters, and the evidence

Three blocks instead of four give $3H(H + d_\text{in} + 1)$ parameters with one bias per block,
and $3H(H + d_\text{in}) + 6H$ in PyTorch: three quarters of an LSTM of the same width, with the
same saving in compute per step.

::: worked title="GRU against LSTM"
`nn.GRU(1, 32)`: $3\cdot 32\cdot 33 + 6\cdot 32 = 3{,}168 + 192 = 3{,}360$ parameters, against
$4{,}480$ for `nn.LSTM(1, 32)`.
:::

On most tasks the two are comparable. Chung et al. (2014) found the GRU on a par with the LSTM on
music and speech modelling, both well ahead of the plain tanh recurrence. Jozefowicz, Zaremba and
Sutskever (2015), searching thousands of recurrent architectures, found that setting the LSTM's
forget bias to 1 closed the gap between the LSTM and the GRU. The LSTM keeps an edge where exact
counting or long precise memory matters: Weiss, Goldberg and Yahav (2018) showed that LSTMs learn
counting languages such as $a^n b^n$ and GRUs in practice do not, because the LSTM's unbounded
cell can act as a counter while the GRU's state interpolates between bounded values. The practical
rule: the LSTM by default, the GRU when parameters or speed are tight. The plain tanh recurrence
is a textbook model; the gated cells are what "RNN" means in practice.

### Stacking

Recurrent layers stack like the layers of an MLP: layer $l$ reads the whole sequence of hidden
states $\mathbf{h}^{(l-1)}_1, \dots, \mathbf{h}^{(l-1)}_T$ of layer $l-1$. Two to four layers are
typical, with dropout between them (the `dropout` argument of `nn.LSTM` does exactly this, and
nothing with one layer). Deeper stacks train better with residual connections between layers,
$\mathbf{h}^{(l)}_t \leftarrow \mathbf{h}^{(l)}_t + \mathbf{h}^{(l-1)}_t$: Google's 2016
translation system used eight-layer LSTM stacks with residual connections (Wu et al. 2016).

### Bidirectional networks

A **bidirectional RNN** (Schuster and Paliwal 1997) runs two recurrent layers over the same
sequence, one forwards and one backwards, and concatenates their states,
$[\overrightarrow{\mathbf{h}}_t; \overleftarrow{\mathbf{h}}_t]$, of width $2H$, so each position
sees its past and its future. That is what sequence labelling wants (whether second 340 of a
recording is a fault onset depends on what follows it), and it is the standard encoder of the
attention models of [Section 11](#s11). It is unusable for forecasting, monitoring or any online
task: the backward direction has read the future, which at deployment does not exist yet. Figure
4.10 shows a stacked bidirectional network.

::: figure id=fig-04-10
A stacked bidirectional network over five time steps: two layers, each with a row of forward cells
(arrows left to right) and a row of backward cells (arrows right to left). At each step the two
states are concatenated (a small join symbol) and passed up to the next layer. At the right, a red
cross over a "forecast $x_{t+1}$" box, captioned "the backward row has read $x_{t+1}$".
:::

::: worked title="A bidirectional two-layer LSTM"
`nn.LSTM(16, 64, num_layers=2, bidirectional=True)`, with $H = 64$.

Layer 1 reads 16 inputs in each direction:
$4\cdot 64\cdot(16 + 64) + 8\cdot 64 = 20{,}480 + 512 = 20{,}992$ per direction, so
$2\times 20{,}992 = 41{,}984$.

Layer 2 reads the concatenated output, $2H = 128$ wide:
$4\cdot 64\cdot(128 + 64) + 512 = 49{,}152 + 512 = 49{,}664$ per direction, so
$2\times 49{,}664 = 99{,}328$.

Total $41{,}984 + 99{,}328 = 141{,}312$. The second layer costs more than twice the first because
bidirectionality doubles its input width.
:::

In a many-to-one model on a bidirectional layer, the states that summarise the whole sequence are
the forward state at the *true last step* and the backward state at the *first step*. The
tempting choice, the last position of the concatenated output, is wrong twice over: its backward
half has seen one token, and if the batch is padded its forward half has run over padding. With
packed sequences ([Section 7](#s7)) PyTorch's returned `h_n` holds exactly the right two states,
`h_n[-2]` (forward, last layer) and `h_n[-1]` (backward, last layer). [Lab 4](#lab4)'s encoder
uses them.

::: check
Can a bidirectional GRU forecast tomorrow's bearing temperature?
:::

::: answer
No. Its backward pass reads inputs after the time being predicted; in training those were
available and the model learned to use them, but at deployment they do not exist yet.
:::

::: check
Which states summarise the whole sequence in a bidirectional many-to-one model?
:::

::: answer
The forward direction's state at the true last step and the backward direction's state at the
first step. The last position of the output has a backward half that has seen only one token.
:::

## Training recurrent networks in practice {#s7}

Recurrent networks that fail to train usually fail for one of a few reasons: padding that leaks
into the loss or the state, state carried where it should not be, default initialisation, dropout
in the wrong place, or no clipping. This section collects the practice that avoids them.
Optimisers and the general debugging method belong to [Module 02](module_02_EN.html); what follows
is specific to recurrence.

### Variable lengths: pad, mask, pack

The simplest way to batch sequences of different lengths is to **pad** each to the batch maximum
with zeros and keep a **mask** of ones on real steps and zeros on padding. Every per-step quantity
that is summed must then be masked; for the loss that is one line:

```python
loss = (per_step_loss * mask).sum() / mask.sum()    # mean over real steps only
```

The mask must also reach anything else that sums over positions, such as the attention scores of
[Section 11](#s11). Masking makes the loss right but still computes every padded step. **Packing**
does not: PyTorch's `pack_padded_sequence` arranges the batch so that at each time step only the
sequences still running are computed, and `pad_packed_sequence` turns the output back into a padded
tensor with zeros after each length. Figure 4.11 draws a padded batch, its mask and its packed
form.

For bidirectional layers packing is essential, not just economical. The backward direction must
start at each sequence's true last step; on a padded, unpacked batch it first reads a run of zeros,
so its states on the real tokens depend on how much padding the batch happened to need. Two more
habits help. **Bucketing** (batching sequences of similar length together) wastes less on padding.
And for a many-to-one task, gather the state at each sequence's true last step, not the last
column:

```python
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

lengths = torch.tensor([50, 120, 200])
packed = pack_padded_sequence(x, lengths, batch_first=True, enforce_sorted=False)
out_packed, (h_n, c_n) = lstm(packed)                 # x: (3, 200, d_in), padded
out, _ = pad_packed_sequence(out_packed, batch_first=True)
last = out[torch.arange(len(lengths)), lengths - 1]  # equals h_n[-1] for one direction
```

::: worked title="What padding costs"
Three sequences of lengths 50, 120 and 200 padded to 200 occupy $3\times 200 = 600$ positions, of
which $50 + 120 + 200 = 370$ are real. The other 230, $230/600 = 38\%$ of the computation, is
padding. With an unmasked mean loss those 230 positions are trained on as if they were data (the
model learns to predict zeros after zeros) and dilute the real steps of the short sequences. With a
masked loss the 370 real steps carry all the weight; with packing the network also executes only
those 370 steps.
:::

::: figure id=fig-04-11
Top: a padded batch drawn as a $3\times 8$ grid (lengths 2, 5 and 8 cells, to scale for 50, 120
and 200 steps); real cells filled, padding hatched, and beside it the mask matrix of ones and
zeros. Middle: the same batch packed by time step, as columns of decreasing height (3, 3, 2, 2, 2,
1, 1, 1 sequences active). Bottom: one long stream cut into chunks for stateful training, with the
state arrow passing from chunk to chunk, a "detach" mark at each boundary and a "reset" mark at
the stream's end.
:::

### State handling

**Stateless** training resets the state to zero at the start of every sequence: the default, and
right whenever sequences are independent examples. **Stateful** training cuts one long stream into
consecutive chunks and carries each chunk's final state into the next, which is truncated BPTT
([Section 3](#s3)). Three rules apply. Detach the state at each chunk boundary
(`h = h.detach()`). Reset it between streams and before evaluation. Keep stream $i$ in batch row
$i$ for every chunk, so the state in row $i$ belongs to the data that continues there, as
[Lab 1](#lab1) does (Figure 4.11, bottom). Carrying state across unrelated sequences teaches the model the batch order
rather than the data.

### Initialisation

Initialise $\mathbf{W}_h$ orthogonally ([Section 4](#s4)). Set the LSTM's forget-gate bias to 1 or
2 ([Section 5](#s5)). Make the output weights small, so that the initial loss is about $\ln V$ for $V$
classes, or about the target variance for regression; a first loss far from that is the earliest
sign of a bug.

### Regularisation

Dropout goes on the inputs and between stacked layers. On the recurrent connection, a fresh mask
at every step perforates the state a hundred times over 100 steps, and long dependencies are lost.
The form that works there is **variational dropout** (Gal and Ghahramani 2016): one mask per
sequence, reused at every step. An alternative drops recurrent *weights* instead, DropConnect on
$\mathbf{W}_h$, as in the AWD-LSTM of Merity, Keskar and Socher (2018). Weight decay applies as
usual. Early stopping needs a validation split, and small corpora need it most: trained on six
Shakespeare sonnets (3,715 characters; Lab 1's third Try-this item), Lab 1's network reached its
lowest validation loss after about 250 updates in a run made when this module was prepared, and
the validation loss then rose while the training loss kept falling.

### Normalisation

Normalise inputs per channel with training statistics only ([Module 01](module_01_EN.html)); when
the level drifts, normalise per window ([Section 8](#s8)). Inside the cell, layer normalisation
(Ba, Kiros and Hinton 2016) normalises each step's pre-activations across units, which helps where
activations drift over long sequences. Batch normalisation is awkward across time: its statistics
would have to be kept per time step, and sequences differ in length.

### Clipping, optimiser, speed

Clip the global gradient norm at 1 to 5, always ([Section 4](#s4)), and log the norm before
clipping: a rising trend often precedes a blow-up, and the log is the first thing to read when the
loss turns into NaN. Adam or AdamW with a learning rate of $10^{-3}$ to $3\times10^{-3}$ is a good
default for small recurrent models. On a GPU, `nn.LSTM` and `nn.GRU` call fused cuDNN kernels far
faster than a Python loop over `nn.LSTMCell`. On a CPU, small recurrent models are dominated by
per-step overhead rather than arithmetic, so batch many sequences: a batch of 64 costs much less
than 64 times a batch of 1.

### A debugging checklist

1. Check the initial loss against $\ln V$ (or the target variance).
2. Overfit one small batch. If the model cannot, the bug is in the model or the loss.
3. Gradient-check a tiny model in float64 with central differences ([Lab 1](#lab1)).
4. Plot the gradient norm against lag ([Lab 2](#lab2)); if it is $10^{-10}$ at the lag your task
   needs, no amount of training will find the dependency.

::: check
A bidirectional encoder is trained on zero-padded batches without packing and then tested on
unpadded inputs, and short inputs suddenly fail. Why?
:::

::: answer
In training the backward direction read the padding before the real tokens, so its states on short
inputs were those that follow a run of zeros. At test time it starts on a real token, a state it
never saw. Pack the sequences so the backward pass starts at each true last step ([Lab 4](#lab4)).
:::

::: check
Where can dropout go in an LSTM without damaging its memory?
:::

::: answer
On the inputs and between stacked layers. On the recurrent connection only in the variational
form, with the same mask at every step of a sequence.
:::

## Forecasting time series honestly {#s8}

Forecasting is the commonest engineering use of recurrent networks: the next hour's bearing
temperature, the next minute of a vibration signal. It is also where a number that means nothing
is easiest to report. This section is about the evaluation discipline that makes the number
trustworthy, and one failure the obvious code commits.

### Framing: windows and horizons

From a series $x_1, \dots, x_N$, slide a **window** of length $W$ along it with stride 1: inputs
$x_{t-W+1}, \dots, x_t$, target $x_{t+1}$ for a one-step forecast or $x_{t+1}, \dots, x_{t+h}$ for
**horizon** $h$. Other measured channels and **exogenous** inputs known in advance (operating
conditions, set-points, a production schedule) become extra input channels, so a batch has shape
$(B, W, \text{channels})$.

### Four leaks in time

A forecast is honest only if each prediction uses nothing that would not exist at that moment.
Four leaks break this.

1. **Shuffled overlapping windows.** Adjacent windows share $W - 1$ values. Shuffle and split at
   random, and nearly every test window has a near-copy in training: the "forecast" is
   interpolation.
2. **Normalisation with the whole series.** Statistics computed over training and test together
   tell the model where the test data lie.
3. **Features computed with future data.** A centred moving average, a forward-backward filter or a
   bidirectional layer ([Section 6](#s6)) reads values after $t$.
4. **Choosing on the test period.** Hyperparameters or a stopping epoch picked by test error make
   the test error a training error.

All four break [Module 01](module_01_EN.html)'s rule: split by the unit that will be new at
deployment. For a forecaster that unit is the future.

::: worked title="How much a shuffled split leaks"
With $W = 64$ and stride 1, each window shares 63 of its 64 values with each neighbour. Split
3,000 such windows at random, 80/20. A test window has no 63-value near-copy in training only if
both neighbours also landed in the test set, probability about $0.2\times 0.2 = 0.04$. So about
96% of test windows have one. The chance that none of the four nearest windows (sharing 62 or 63
values) is in training is $0.2^4 = 0.0016$.
:::

### Walk-forward validation

The time-respecting alternative is **walk-forward** or **rolling-origin** validation (Tashman
2000; Hyndman and Athanasopoulos, *Forecasting: Principles and Practice*). Train on everything
before a forecast origin (an expanding window, or a sliding one if old data are no longer
representative), validate on a block after it, move the origin forward, refit, repeat. When
$h > 1$, leave a gap of at least $h$ steps between the last training target and the first
validation input. Report the mean and spread over folds (Figure 4.12).

::: figure id=fig-04-12
Top: a time axis with four walk-forward folds stacked vertically; in each, a blue expanding
training block, a small grey gap, then an orange validation block, the origin moving right fold by
fold. Bottom, crossed out in red: a shuffled split, with blue and orange windows interleaved along
the same axis and two overlapping windows magnified to show their 63 shared samples.
:::

### Baselines, and a score that includes one

An error means nothing without a trivial forecaster's error on the same data.

- **Naive** (persistence): $\hat x_{t+h} = x_t$, "tomorrow equals today"; strong at short horizons.
- **Seasonal naive**: the same phase one period $m$ earlier, $\hat x_{t+h} = x_{t+h-m}$ for
  $h \le m$; strong at long horizons on periodic signals.
- **Linear autoregression**: least-squares regression of the target on the same windows
  ([Module 01](module_01_EN.html)). The strongest cheap baseline, and the optimal predictor for a
  linear system with Gaussian noise; a network that does not beat it has found nothing nonlinear.
- **The training mean**, which a model that has learned no dynamics drifts towards.

The **mean absolute scaled error** (Hyndman and Koehler 2006) builds a baseline into the score:

$$\text{MASE} = \frac{\text{MAE on the test period}}
{\frac{1}{N-1}\sum_{t=2}^{N}|x_t - x_{t-1}|},$$

where the denominator is the in-sample MAE of the one-step naive forecast on the $N$ training
values (or of the seasonal naive, with lag $m$). It is unit-free, and MASE $< 1$ means the model
beats the naive forecast's in-sample accuracy.

::: worked title="Naive against seasonal naive, period 4"
Training values $(10, 14, 12, 8, 11, 15, 13, 9)$, period $m = 4$; the next four true values
$(12, 16, 14, 10)$.

Naive: every forecast is 9. Errors $3, 7, 5, 1$; MAE $= 16/4 = 4.0$.

Seasonal naive: the forecasts copy the last cycle, $(11, 15, 13, 9)$. Errors $1, 1, 1, 1$; MAE
$= 1.0$.

Scale: the in-sample one-step naive errors are $|14-10|, |12-14|, \dots, |9-13| =
4, 2, 4, 3, 4, 2, 4$, mean $23/7 = 3.286$.

MASE on this scale: naive $4.0/3.286 = 1.22$, seasonal naive $1.0/3.286 = 0.30$. The seasonal
naive forecast, which knows the period, wins by a factor of four.
:::

### Normalising per window when the level drifts

z-scoring with training statistics avoids leak 2 but fails when the series drifts. A network learns
a map on the range of inputs it saw; at a level it never saw its saturating units flatten out, and
it does not extrapolate as a linear model would. The obvious code commits exactly this error.

::: worked title="An LSTM forecaster that loses to persistence"
The series is $\sin t + 0.05t$ plus Gaussian noise of standard deviation 0.1, sampled every 0.1
time units, 4,000 points: the first 3,000 for training, the rest for testing, z-scored with
training statistics, windows of $W = 64$, a two-layer `nn.LSTM(1, 32, num_layers=2)` (12,961
parameters with its head), 15 epochs of AdamW with clipping. Every step looks careful. A run with
seed 0, made when this module was prepared, gives:

LSTM test RMSE 1.075; naive 0.155. Seven times worse than "tomorrow equals today".

The cause is the drift. After normalisation the training inputs span $-1.92$ to $1.92$, the test
inputs $1.46$ to $3.10$. Most of the test period lies at levels the network never saw, and there
its predictions are biased low: the mean error is $-0.87$ in the series' units.

The fix: subtract each window's last value from its inputs, predict the change, add the value back.
The same model then scores about 0.12 to 0.14, depending on the seed, against the naive 0.155. A
least-squares linear autoregression on the same windows scores 0.099, at the noise floor (no
one-step forecast can beat the noise's standard deviation of 0.1 except by chance). On a sinusoid
plus drift plus noise, a linear model is the right tool. [Lab 3](#lab3) runs the same model on a
nonlinear signal that also drifts: it loses to persistence there too (RMSE 0.43 against 0.36, mean
error $-0.32$), the fix brings it to 0.13, and on that signal the LSTM has something to add over
the linear model.
:::

The change is three lines in `forward`:

```python
    def forward(self, x):                        # x: (batch, W, 1)
        last = x[:, -1:, :]                      # each window's last value, (batch, 1, 1)
        out, _ = self.lstm(x - last)             # the network sees shape, not level
        return self.head(out[:, -1]).squeeze(-1) + last[:, 0, 0]
```

Differencing the series does the same job, as does reversible instance normalisation (RevIN; Kim
et al. 2022), which normalises each input window by its own mean and standard deviation and inverts
that on the output. With many series, normalise each by its own statistics.

### Multi-step forecasts: recursive or direct

Beyond one step there are two strategies (compared by Ben Taieb et al. 2012). **Recursive**:
iterate a one-step model, appending each prediction to the window. Its errors compound, because it
reads its own mistakes as inputs: the forecasting form of the exposure bias of
[Section 10](#s10). **Direct**: one model per horizon, or one network with $h$ outputs predicting
all of them from the observed window; it never reads its own predictions. For a least-squares
linear model with a long window the two nearly coincide: when the window holds the system's whole
linear state, iterating the best one-step linear predictor gives the best $h$-step one, which is
what the direct regression estimates. For a nonlinear model they differ, often a lot. Step 5 of
[Lab 3](#lab3) plots error against horizon for both strategies: the recursive LSTM is the best
forecaster at $h = 1$ (RMSE 0.13), and at $h = 20$ it is worse than the naive forecast (0.78
against 0.72) and well behind the direct LSTM and both linear models (about 0.55 to 0.56; the two
linear strategies coincide).

### Point forecasts and intervals

A decision usually needs to know how far to trust a forecast. Give the network a second output for
the variance and train with the Gaussian negative log-likelihood
$\tfrac12\ln\hat\sigma^2 + (y-\hat\mu)^2/(2\hat\sigma^2)$ (`nn.GaussianNLLLoss`), or train
quantile outputs with the pinball loss $\max(\tau u, (\tau-1)u)$ on the error
$u = y - \hat y_\tau$. Either gives the residual scale that [Section 9](#s9)'s thresholds need;
check the coverage on held-out data first.

### Where neural forecasters stand

As of 2026, conservatively: on a single series of modest length, well-tuned classical methods
(exponential smoothing, ARIMA) and linear models remain hard to beat. In the M4 competition (2018,
100,000 series) the pure machine-learning entries did poorly, and the winner was a hybrid of
exponential smoothing and a recurrent network (Makridakis, Spiliotis and Assimakopoulos 2020; Smyl
2020). Neural forecasters such as DeepAR (Salinas et al. 2020) earn their place with many related
series, exogenous inputs and nonlinear dynamics, as in a monitored fleet of assets.

::: keyidea
A forecasting number is only as good as its split and its baseline: evaluate on the future,
normalise with the past, and report the naive, seasonal naive and linear errors beside the model's.
:::

::: check
Your LSTM forecaster's validation RMSE is a third of the naive forecast's, using a random 80/20
split of overlapping windows. What do you check first?
:::

::: answer
Leakage. Split by time (walk-forward) and compute normalisation statistics on the training part
only. With overlapping windows almost every test window has a near-copy in training, so the
advantage usually shrinks or disappears once the split respects time.
:::

::: check
Why can a seasonal naive forecast beat a sophisticated model at long horizons?
:::

::: answer
Its error does not grow with the horizon: it copies the same phase of the last cycle, whatever $h$
is. A one-step model iterated forward reads its own errors as inputs and compounds them.
:::

::: check
A forecaster scores MASE 0.8. Good or bad?
:::

::: answer
It beats the naive forecast's in-sample error by 20%. Whether that is good depends on the decision
the forecast serves and on the other baselines: if a linear autoregression reaches 0.6 on the same
split, the network is losing.
:::
