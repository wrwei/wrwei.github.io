## Exercises {#exercises}

Fifteen exercises follow the order of the sections they practise. They are graded by effort: ★ is conceptual and takes about 5 minutes, with no arithmetic beyond reading off a ratio; ★★ is a derivation or a calculation, 10 minutes here; ★★★ is coding, 25 minutes. There are seven of the first, seven of the second and one of the third, about 130 minutes in all. The solutions are folded away until you open them. Settle on an answer, on paper, before you do: reading a solution first teaches a good deal less than attempting the exercise does.

No exercise reuses the numbers or scenarios of a worked example or an inline check. The sections teach a method on one set of numbers; here the same method is applied to another, so that it is the method that transfers and not the answer. Every number in a solution was computed by hand and then checked by script. The code in the solutions is complete and was run with Python 3.11, NumPy 2.x and PyTorch 2.x on a CPU; the last digits of the printed output, and all timings, may differ on your machine. Memory sizes are decimal (1 kB = $10^3$ B) unless written KiB.

::: exercise id=e1 level=1 kind=conceptual minutes=5
For each task below, name the task shape (many-to-one, aligned many-to-many, sequence to sequence or one-to-many) and say whether the output at step $t$ may depend on inputs after $t$.

(a) Every 10 minutes, estimate a wind turbine's gearbox oil temperature one hour ahead from the last week of its sensor readings.

(b) At each sample of a live pipeline-pressure stream, and before the next sample arrives, decide whether a pressure surge is under way, so that a valve can be closed.

(c) Turn the sequence of alarm codes raised during a plant trip into a one-sentence summary for the shift log.

(d) Once a spot weld is finished, decide from its whole current trace whether it passes or fails.

(e) Generate a plausible week of hourly electricity demand for a building, given its floor area and use, to test a control strategy.
:::

::: solution
Two questions settle each case ([Section 1](#s1)). Where does the loss sit: on one output, on an output per step, or on a new sequence with a length of its own? And when the decision has to be made, does the rest of the input exist yet? The second question decides whether a bidirectional network is allowed.

(a) **Aligned many-to-many, or many-to-one per window; causal.** A week at one reading per 10 minutes is $7\times24\times6 = 1{,}008$ samples, and "one hour ahead" is 6 samples. A network that emits a forecast at every step of the stream is aligned many-to-many; one that maps each 1,008-sample window to a single number is many-to-one. Which one you train is a choice of where to put the loss, not a different problem. Either way the output at $t$ may use readings up to $t$ only: the future readings do not exist when the forecast is made, and a model that is shown them in validation is a leak ([Section 8](#s8)).

(b) **Aligned many-to-many (one label per sample); causal.** The answer is required before the next sample arrives, so no input after $t$ can be used, and a bidirectional network is ruled out. This differs from labelling the same pressure trace after the event, which is offline and may read in both directions ([Section 6](#s6)). The deadline also constrains the compute per step, which a recurrent network keeps constant ([Section 12](#s12)).

(c) **Sequence to sequence.** The input (alarm codes) and the output (a sentence) have different lengths and no step-by-step alignment, which is what the encoder–decoder of [Section 10](#s10) is for. The trip is over, so the encoder may read the whole code sequence and may be bidirectional: in that sense the answer is yes, every input is available to every output. The decoder is still causal in its *own* outputs: word $t$ of the summary depends on the words before it, not after.

(d) **Many-to-one; offline.** The decision comes from the whole trace and the trace is complete, so reading it in both directions is allowed, and the output may depend on every input.

(e) **One-to-many, generation.** The conditioning input (floor area and use) is a fixed vector; the output is 168 hourly values, each fed back as the next input. Each generated value may depend only on the conditioning and on the values already generated, so the answer is no. The word "plausible" asks for *sampling* from the model's distribution at each step, with noise, and not for the most probable value at each step, which would give one smooth, implausible week ([Section 2](#s2) on sampling).

The pattern: the tasks the model must answer as the data arrive ((a), (b)) forbid lookahead; the tasks run on a finished record ((c), (d)) allow it; and in every generation task the decoder is causal in its own outputs.
:::

::: exercise id=e2 level=2 kind=derivation minutes=10
Take the scalar RNN $h_t = \tanh(w\,h_{t-1} + u\,x_t)$ with $h_0 = 0$ and the loss $L = \tfrac12(h_3 - y)^2$ after $T = 3$ steps.

(a) Write $\partial L/\partial w$ as a sum of three terms. Show the product of Jacobians $\partial h_3/\partial h_k = \prod_j w(1-h_j^2)$ explicitly in each term.

(b) Evaluate everything for $w = 0.9$, $u = 0.5$, $x = (1, 0, 1)$ and $y = 0.5$, including $\partial L/\partial u$. Compare the contributions of $x_1$ and $x_3$ to $\partial L/\partial u$.

(c) For the linear recurrence (tanh replaced by the identity) evaluate $\partial h_{50}/\partial h_0$ for $w = 0.8$ and for $w = 1.25$, and say what each means for learning.
:::

::: solution
**Set-up.** Write $z_t = w\,h_{t-1} + u\,x_t$ and $h_t = \tanh z_t$. Since $\tanh' = 1 - \tanh^2$, we have $\partial h_t/\partial z_t = 1 - h_t^2$. The state $h_{t-1}$ enters $z_t$ with coefficient $w$, so the one-step Jacobian is the scalar

$$J_t = \frac{\partial h_t}{\partial h_{t-1}} = w\,(1 - h_t^2).$$

This is the scalar case of the Jacobian $\operatorname{diag}(\phi'(\mathbf{z}_t))\,\mathbf{W}_h$ of [Section 3](#s3).

**(a)** The parameter $w$ is used at every step, so its gradient is a sum over steps ([Section 3](#s3)). The use at step $k$ shifts $z_k$ by $h_{k-1}\,\mathrm{d}w$, hence $h_k$ by $(1 - h_k^2)\,h_{k-1}\,\mathrm{d}w$. That change travels to $h_3$ through $\partial h_3/\partial h_k$ and to the loss through $\partial L/\partial h_3 = h_3 - y$. Adding the three steps:

$$\frac{\partial L}{\partial w} = (h_3 - y)\sum_{k=1}^{3}\frac{\partial h_3}{\partial h_k}\,(1 - h_k^2)\,h_{k-1}, \qquad \frac{\partial h_3}{\partial h_k} = \prod_{j=k+1}^{3} w\,(1 - h_j^2).$$

Written out term by term:

- $k = 3$: the product is empty, $\partial h_3/\partial h_3 = 1$, and the term is $(1 - h_3^2)\,h_2$.
- $k = 2$: $\partial h_3/\partial h_2 = w(1 - h_3^2)$, and the term is $w(1 - h_3^2)(1 - h_2^2)\,h_1$.
- $k = 1$: $\partial h_3/\partial h_1 = w(1 - h_3^2)\cdot w(1 - h_2^2)$, and the term is $w(1 - h_3^2)\,w(1 - h_2^2)\,(1 - h_1^2)\,h_0$.

The factor $(1 - h_3^2)$ is common to all three, so

$$\frac{\partial L}{\partial w} = (h_3 - y)(1 - h_3^2)\Big[\,h_2 + w(1 - h_2^2)\,h_1 + w(1 - h_2^2)\,w(1 - h_1^2)\,h_0\Big].$$

The $k$-th term carries the Jacobian product from step $k$ to step 3: the longer the lag, the more factors, each typically below 1 ([Section 4](#s4)). Here $h_0 = 0$ makes the last term vanish, but it is the term that would carry a dependence on the initial state.

For numbers it is easier to run the recursion of [Section 3](#s3) on the error signal $g_k = \partial L/\partial z_k$. Since $z_{k+1}$ depends on $h_k$ with coefficient $w$,

$$g_3 = (h_3 - y)(1 - h_3^2), \qquad g_k = g_{k+1}\,w\,(1 - h_k^2), \qquad \frac{\partial L}{\partial w} = \sum_k g_k\,h_{k-1}, \qquad \frac{\partial L}{\partial u} = \sum_k g_k\,x_k.$$

**(b)** The forward pass first, since every factor needs the states:

- $h_1 = \tanh(0.9\cdot0 + 0.5\cdot1) = \tanh 0.5 = 0.4621$;
- $h_2 = \tanh(0.9\cdot0.4621 + 0.5\cdot0) = \tanh 0.4159 = 0.3935$;
- $h_3 = \tanh(0.9\cdot0.3935 + 0.5\cdot1) = \tanh 0.8541 = 0.6932$;
- $L = \tfrac12(0.6932 - 0.5)^2 = 0.01867$.

The derivative factors are $1 - h_3^2 = 0.5194$, $1 - h_2^2 = 0.8452$ and $1 - h_1^2 = 0.7864$. The error signals:

- $g_3 = (0.6932 - 0.5)(0.5194) = 0.10037$;
- $g_2 = g_3\cdot w(1 - h_2^2) = 0.10037\times0.7607 = 0.07635$;
- $g_1 = g_2\cdot w(1 - h_1^2) = 0.07635\times0.7078 = 0.05404$.

Then

$$\frac{\partial L}{\partial w} = g_3h_2 + g_2h_1 + g_1h_0 = 0.03949 + 0.03528 + 0 = 0.07477,$$

$$\frac{\partial L}{\partial u} = g_1x_1 + g_2x_2 + g_3x_3 = 0.05404 + 0 + 0.10037 = 0.1544.$$

The inputs $x_1$ and $x_3$ are both 1, yet $x_1$ contributes only $0.05404/0.10037 = 0.538$ times as much as $x_3$. The reason is the path: the error at step 3 reaches $z_1$ only after passing through the two local factors $w(1 - h_2^2) = 0.761$ and $w(1 - h_1^2) = 0.708$, whose product is 0.538. The linear part alone would give $0.9^2 = 0.81$; the other factor, $0.538/0.81 = 0.66$, is the contribution of the tanh derivatives, which are below 1 whenever the unit is not at zero. The nonlinearity makes the shrinkage worse, never better ([Section 4](#s4)).

The script below repeats the arithmetic and checks both gradients against central differences.

```python
import numpy as np

w, u, y = 0.9, 0.5, 0.5
x = [1.0, 0.0, 1.0]

def forward(w, u):
    h = [0.0]                                    # h_0 = 0
    for xt in x:
        h.append(np.tanh(w * h[-1] + u * xt))
    return h

def loss(w, u):
    return 0.5 * (forward(w, u)[3] - y) ** 2

h = forward(w, u)
g3 = (h[3] - y) * (1 - h[3] ** 2)                # dL/dz_3
g2 = g3 * w * (1 - h[2] ** 2)                    # dL/dz_2
g1 = g2 * w * (1 - h[1] ** 2)                    # dL/dz_1
dw = g3 * h[2] + g2 * h[1] + g1 * h[0]
du = g1 * x[0] + g2 * x[1] + g3 * x[2]
eps = 1e-6
dw_fd = (loss(w + eps, u) - loss(w - eps, u)) / (2 * eps)
du_fd = (loss(w, u + eps) - loss(w, u - eps)) / (2 * eps)
print("h:", [f"{v:.4f}" for v in h[1:]], f" L = {loss(w, u):.5f}")
print(f"g3, g2, g1 = {g3:.5f}, {g2:.5f}, {g1:.5f}")
print(f"dL/dw = {dw:.5f} (central difference {dw_fd:.5f})")
print(f"dL/du = {du:.5f} (central difference {du_fd:.5f})")
print(f"contribution of x_1 / x_3 = {g1 / g3:.3f}")
print(f"0.8^50 = {0.8 ** 50:.3e}, 1.25^50 = {1.25 ** 50:.3e}, "
      f"1 / 0.8^50 = {0.8 ** -50:.0f}")
```

```output
h: ['0.4621', '0.3935', '0.6932']  L = 0.01867
g3, g2, g1 = 0.10037, 0.07635, 0.05404
dL/dw = 0.07477 (central difference 0.07477)
dL/du = 0.15440 (central difference 0.15440)
contribution of x_1 / x_3 = 0.538
0.8^50 = 1.427e-05, 1.25^50 = 7.006e+04, 1 / 0.8^50 = 70065
```

**(c)** Without the tanh, $h_t = w\,h_{t-1} + u\,x_t$ and each Jacobian is $w$, so $\partial h_{50}/\partial h_0 = w^{50}$.

- $w = 0.8$: $0.8^{50} = 1.4\times10^{-5}$. An input 50 steps back reaches the loss with a gradient about 70,000 times smaller than a fresh input. The gradient signal for that dependency is below the noise of every other term, so the dependency is effectively never learned. Clipping does not help, because the gradient is small, not large.
- $w = 1.25$: $1.25^{50} = 7.0\times10^{4}$, the same factor the other way, because $1.25 = 1/0.8$. A single update along that direction is 70,000 times too large and throws the weights far from the region where the model was working, unless the gradient is clipped.

With the tanh restored, each factor is $w(1 - h^2) \le w$. The nonlinearity can only make vanishing worse, and it caps explosion once a unit saturates, which is why exploding gradients tend to arrive as occasional cliffs and not as steady growth ([Section 4](#s4)).
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
In three or four sentences, explain why global-norm gradient clipping cures exploding gradients but not vanishing ones, and why clipping each component to $[-c, c]$ is worse than clipping the norm. Use $\mathbf{g} = (0.6, -45)$ and $c = 1$ as the example; no angles need computing.
:::

::: solution
Global-norm clipping replaces $\mathbf{g}$ by $\mathbf{g}\min(1, c/\lVert\mathbf{g}\rVert)$: a gradient whose norm exceeds $c$ is rescaled to norm exactly $c$, so the step is bounded and its direction is kept, and a cliff in the loss surface can no longer throw the parameters far away. A vanishing gradient is the opposite case, small and not large: clipping never enlarges a gradient, so the contributions of long-range dependencies stay swamped by the short-range ones, and curing that takes a structural change such as the gated additive path of the LSTM ([Section 5](#s5)). Clipping each component to $[-c, c]$ changes the *direction* of the update, because it shrinks the large components and leaves the small ones alone. Clipping the norm divides every component by the same number, so the direction is unchanged.

The numbers: $\lVert\mathbf{g}\rVert = \sqrt{0.6^2 + 45^2} = \sqrt{2025.36} = 45.004$.

- Norm clipping multiplies by $1/45.004$ and gives $(0.0133, -0.9999)$. The ratio of the components is still $0.6 : 45 = 1 : 75$.
- Component clipping gives $(0.6, -1)$. The large component has been cut 45-fold and the small one not at all, so the ratio is now $3 : 5$ and the update points somewhere else: far more weight on the parameter that had a small gradient.

(For reference, the cosine between $\mathbf{g}$ and the component-clipped vector is 0.864, about $30^\circ$; the norm-clipped vector has cosine exactly 1.) The pitfall in practice is the same one: components are not interchangeable, so clipping them independently changes which parameters move. See [Section 4](#s4) for clipping in context and [Module 02](module_02_EN.html) for the optimiser it feeds.
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
(a) From the LSTM equations of [Section 5](#s5), derive $\partial\mathbf{c}_t/\partial\mathbf{c}_{t-1}$ and identify the term that does not pass through $\mathbf{h}_{t-1}$.

(b) Hold the gates fixed (ignore the $\mathbf{h}$-paths) and compute $\partial c_{60}/\partial c_0$ per unit when the forget gate equals $\sigma(b_f)$ for $b_f = 1.5$, $2.5$ and $4.5$. Compare with a vanilla tanh RNN whose per-step factor is 0.7.

(c) What forget-gate bias gives a memory half-life of 250 steps?

(d) Which slice of which PyTorch tensors must you set to apply it?
:::

::: solution
**(a)** The cell update is $\mathbf{c}_t = \mathbf{f}_t\odot\mathbf{c}_{t-1} + \mathbf{i}_t\odot\tilde{\mathbf{c}}_t$. Where does $\mathbf{c}_{t-1}$ enter it?

1. *Directly*, as the factor multiplying $\mathbf{f}_t$.
2. *Indirectly*, through $\mathbf{h}_{t-1} = \mathbf{o}_{t-1}\odot\tanh(\mathbf{c}_{t-1})$, which feeds the gates $\mathbf{f}_t$, $\mathbf{i}_t$ and the candidate $\tilde{\mathbf{c}}_t$. (The gate $\mathbf{o}_{t-1}$ was computed from $\mathbf{h}_{t-2}$ and does not depend on $\mathbf{c}_{t-1}$.)

The direct path differentiates to $\operatorname{diag}(\mathbf{f}_t)$. For the indirect path, apply the chain rule through $\mathbf{h}_{t-1}$ and use $\sigma' = \sigma(1-\sigma)$ and $\tanh' = 1 - \tanh^2$. Let $\mathbf{W}^h_f$, $\mathbf{W}^h_i$, $\mathbf{W}^h_c$ be the $H\times H$ blocks of the weight matrices that multiply $\mathbf{h}_{t-1}$. Then

$$\frac{\partial\mathbf{c}_t}{\partial\mathbf{h}_{t-1}} = \operatorname{diag}\big(\mathbf{c}_{t-1}\odot\mathbf{f}_t\odot(1-\mathbf{f}_t)\big)\mathbf{W}^h_f + \operatorname{diag}\big(\tilde{\mathbf{c}}_t\odot\mathbf{i}_t\odot(1-\mathbf{i}_t)\big)\mathbf{W}^h_i + \operatorname{diag}\big(\mathbf{i}_t\odot(1-\tilde{\mathbf{c}}_t^{\,2})\big)\mathbf{W}^h_c,$$

$$\frac{\partial\mathbf{h}_{t-1}}{\partial\mathbf{c}_{t-1}} = \operatorname{diag}\big(\mathbf{o}_{t-1}\odot(1-\tanh^2\mathbf{c}_{t-1})\big).$$

Multiplying and adding the direct term,

$$\frac{\partial\mathbf{c}_t}{\partial\mathbf{c}_{t-1}} = \operatorname{diag}(\mathbf{f}_t) + \frac{\partial\mathbf{c}_t}{\partial\mathbf{h}_{t-1}}\,\operatorname{diag}\big(\mathbf{o}_{t-1}\odot(1-\tanh^2\mathbf{c}_{t-1})\big).$$

The term that does not pass through $\mathbf{h}_{t-1}$ is $\operatorname{diag}(\mathbf{f}_t)$. It contains no weight matrix and no squashing derivative: the gate value is the whole factor, which the network sets at each step and can hold near 1. The other terms involve $\mathbf{W}^h$ and sub-unit derivatives, the ingredients of the vanishing product of [Section 4](#s4).

**(b)** Ignoring the $\mathbf{h}$-paths, $\partial c_t/\partial c_{t-1} = f$ for each unit, so over 60 steps the factor is $f^{60}$. First $f = \sigma(b_f) = 1/(1 + e^{-b_f})$. By hand for $b_f = 2.5$: $e^{-2.5} = 0.0821$, so $f = 1/1.0821 = 0.9241$; $\ln f = -0.07889$; $60\ln f = -4.733$; $e^{-4.733} = 8.8\times10^{-3}$. The half-life is $\ln 0.5/\ln f$ ([Section 5](#s5)).

| $b_f$ | $f = \sigma(b_f)$ | $f^{60}$ | half-life (steps) | 60 steps in half-lives |
|---|---|---|---|---|
| 1.5 | 0.8176 | $5.6\times10^{-6}$ | 3.4 | 17.4 |
| 2.5 | 0.9241 | $8.8\times10^{-3}$ | 8.8 | 6.8 |
| 4.5 | 0.9890 | 0.515 | 62.7 | 0.96 |
| vanilla, factor 0.7 | 0.7 | $5.1\times10^{-10}$ | 1.9 | 31 |

Only the largest bias passes a usable gradient to a lag of 60: $b_f = 4.5$ delivers about half of it, since 60 steps is about one half-life (0.96 of one). The other two deliver a millionth and a hundredth. Against the vanilla factor, $b_f = 4.5$ is $0.515/5.1\times10^{-10} \approx 10^{9}$ times larger. The caveat is the one in the prompt: this is the product along the cell path only, with gates held fixed. In a trained network the gates move with the input, so $f^{60}$ is the gradient a unit would keep if it held its forget gate near $f$ for 60 steps.

**(c)** Solve $f^{250} = 0.5$: $f = 0.5^{1/250} = e^{-\ln 2/250} = e^{-0.002773} = 0.99723$. Invert the sigmoid: $b_f = \ln\dfrac{f}{1-f} = \ln\dfrac{0.99723}{0.00277} = \ln 360.2 = 5.887$. For long half-lives $1 - f \approx \ln 2/t_{1/2}$, which gives the shortcut

$$b_f \approx \ln\frac{t_{1/2}}{\ln 2} = \ln 360.7 = 5.888,$$

the same to three digits. This is the logic of chrono initialisation ([Section 5](#s5)): the time constant $1/(1-f) = 1 + e^{b_f}$ grows by a factor $e$ for each unit of bias, so a bias of about 6 sets a memory of a few hundred steps. The step is taken because the bias is the only parameter that sets the gate value at initialisation, when the weights are small.

**(d)** PyTorch stacks the four gates in the order $i, f, g, o$, where $g$ is the candidate, so the forget gate is the *second* block of rows. For layer 0 that is the slice `[H:2*H]` of both bias vectors, `bias_ih_l0` and `bias_hh_l0`. The two biases are added inside the gate, so set one to the value and zero the other (or account for both). The script below checks the recipe and (b) together. It zeroes every parameter so that each gate depends on its bias alone; the input gate is then $\sigma(0) = 0.5$ and the candidate is $\tanh(0) = 0$, so $c_t = f\,c_{t-1}$ exactly. Starting from $c_0 = 1$, the final cell state is the memory $f^{n}$.

```python
import math
import torch
import torch.nn as nn

H = 4

def memory_after(steps, forget_bias):
    """Zero all weights so each gate depends on its bias alone; start with c_0 = 1."""
    lstm = nn.LSTM(1, H, batch_first=True)
    with torch.no_grad():
        for p in lstm.parameters():
            p.zero_()
        lstm.bias_ih_l0[H:2 * H] = forget_bias   # slice 1 of the stacked i, f, g, o
    x = torch.zeros(1, steps, 1)
    h0, c0 = torch.zeros(1, 1, H), torch.ones(1, 1, H)
    with torch.no_grad():
        _, (_, c_n) = lstm(x, (h0, c0))
    return float(c_n[0, 0, 0])

for b in (1.5, 2.5, 4.5):
    f = 1 / (1 + math.exp(-b))
    print(f"b_f = {b}: c_60 = {memory_after(60, b):.3e}, "
          f"sigmoid(b_f)^60 = {f ** 60:.3e}")
b_250 = math.log(0.5 ** (1 / 250) / (1 - 0.5 ** (1 / 250)))
print(f"b_f = {b_250:.3f}: c_250 = {memory_after(250, b_250):.4f} "
      f"(half-life 250 -> 0.5)")
print(f"chrono shortcut ln(250 / ln 2) = {math.log(250 / math.log(2)):.3f}")
```

```output
b_f = 1.5: c_60 = 5.645e-06, sigmoid(b_f)^60 = 5.645e-06
b_f = 2.5: c_60 = 8.797e-03, sigmoid(b_f)^60 = 8.797e-03
b_f = 4.5: c_60 = 5.154e-01, sigmoid(b_f)^60 = 5.154e-01
b_f = 5.887: c_250 = 0.5000 (half-life 250 -> 0.5)
chrono shortcut ln(250 / ln 2) = 5.888
```

Were the slice wrong (`[0:H]` is the input gate), the memory would be $0.5^{60}$ for the first line instead. That is the failure mode: a mis-indexed bias raises the wrong gate and is silent.
:::

::: exercise id=e5 level=2 kind=calculation minutes=10
Count the parameters of a recurrent layer with $d_\text{in} = 8$ and $H = 64$ for a vanilla RNN, an LSTM and a GRU, first with one bias vector per gate and then as PyTorch counts them. Then count `nn.GRU(8, 64, num_layers=2, bidirectional=True)` layer by layer, and explain why its second layer is the larger.
:::

::: solution
**One bias vector per gate.** A vanilla layer has a recurrent matrix $\mathbf{W}_h$ ($H\times H$), an input matrix $\mathbf{W}_x$ ($H\times d_\text{in}$) and a bias ($H$):

$$H(H + d_\text{in} + 1) = 64\times(64 + 8 + 1) = 4{,}672.$$

An LSTM has four such blocks (three gates and a candidate), so $4\times4{,}672 = 18{,}688$; a GRU has three (two gates and a candidate), so $3\times4{,}672 = 14{,}016$ ([Sections 5 and 6](#s5)).

**As PyTorch counts them.** PyTorch keeps *two* bias vectors per block, `bias_ih` and `bias_hh`, which add inside the gate. That is an extra $H$ parameters per block, so $g\,H(H + d_\text{in}) + 2gH$ with $g = 1, 4, 3$ blocks:

- RNN: $64\times72 + 2\times64 = 4{,}608 + 128 = 4{,}736$;
- LSTM: $4\times64\times72 + 8\times64 = 18{,}432 + 512 = 18{,}944$;
- GRU: $3\times64\times72 + 6\times64 = 13{,}824 + 384 = 14{,}208$.

**The bidirectional two-layer GRU.** A bidirectional layer is two independent GRUs, one per direction, with their outputs concatenated. Layer 1 reads the 8 raw features, so each direction is the 14,208 just counted; two directions give $28{,}416$. Layer 2 reads the *concatenated* output of layer 1, which is $2H = 128$ wide, not 8:

$$3\times64\times(128 + 64) + 6\times64 = 36{,}864 + 384 = 37{,}248 \text{ per direction}, \qquad 2\times37{,}248 = 74{,}496.$$

The total is $28{,}416 + 74{,}496 = 102{,}912$. The second layer is $74{,}496/28{,}416 = 2.6$ times the first because its input matrix is $3H\times128 = 192\times128$, that is 24,576 entries, instead of $192\times8 = 1{,}536$. The recurrent matrices ($192\times64 = 12{,}288$ per direction) and the biases are the same in both layers. The lesson is the one of [Section 6](#s6): in a stack, and especially in a bidirectional stack, the parameter count is dominated by the input matrices of the upper layers.

```python
import torch.nn as nn

count = lambda m: sum(p.numel() for p in m.parameters())
for name, cls, gates in (("RNN", nn.RNN, 1), ("LSTM", nn.LSTM, 4), ("GRU", nn.GRU, 3)):
    one_bias = gates * 64 * (64 + 8 + 1)
    print(f"{name:5s} one bias {one_bias:6,d}   PyTorch {count(cls(8, 64)):6,d}")

gru = nn.GRU(8, 64, num_layers=2, bidirectional=True)
layer = lambda l: sum(p.numel() for n, p in gru.named_parameters() if f"_l{l}" in n)
print(f"two-layer bidirectional GRU: layer 1 {layer(0):,}, layer 2 {layer(1):,}, "
      f"total {count(gru):,}")
print("weight_ih_l0:", tuple(gru.weight_ih_l0.shape), " weight_ih_l1:",
      tuple(gru.weight_ih_l1.shape))
```

```output
RNN   one bias  4,672   PyTorch  4,736
LSTM  one bias 18,688   PyTorch 18,944
GRU   one bias 14,016   PyTorch 14,208
two-layer bidirectional GRU: layer 1 28,416, layer 2 74,496, total 102,912
weight_ih_l0: (192, 8)  weight_ih_l1: (192, 128)
```
:::

::: exercise id=e6 level=1 kind=conceptual minutes=5
A batch holds three sensor sequences of lengths 30, 90 and 240, zero-padded to 240 and fed to a unidirectional LSTM classifier. The classifier uses the output at position 240, and a per-step auxiliary loss is averaged over all 720 positions. List what goes wrong and the fixes.
:::

::: solution
Count first: the batch has $3\times240 = 720$ positions, of which $30 + 90 + 240 = 360$ are real. Half the batch is padding. Four things follow ([Section 7](#s7)).

1. **The classifier reads the wrong state for the short sequences.** For the sequences of length 30 and 90 the output at position 240 comes after 210 and 150 steps of zero input, so the state is whatever the network does to a zero input over that time, not a summary of the sequence. *Fix:* read each sequence's output at its true last step (gather by length, `out[b, length_b - 1]`), or pack the batch so that the last output is the true one.
2. **The auxiliary loss trains on padding.** Half of the 720 positions (360) are padding, so half of the loss teaches the model to predict padding targets, and the real positions' share of the gradient is halved. *Fix:* mask the loss, summing over real positions and dividing by their number, $\sum_{\text{real}}\ell/360$, not by 720.
3. **Half the compute is wasted.** Every padded position costs as much as a real one. *Fix:* pack the sequences, or bucket the batches by length so that sequences of similar length share a batch.
4. **A bidirectional layer would be worse.** The backward direction would start at position 240, so for the sequence of length 30 it would read 210 padding steps before it reached any data, and its final state would be contaminated even if every readout were gathered correctly. *Fix:* pack (`pack_padded_sequence`), which makes the backward direction start at each sequence's true end.

With right padding and a unidirectional network, the states at the real positions are exact: they are computed before any padding is read. So there, problems 1 and 2 are about *which positions you read and score*, and packing mainly saves compute. The script shows problem 1 on a random LSTM and the fix.

```python
import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

torch.manual_seed(0)
lens = torch.tensor([30, 90, 240])
T = 240
lstm = nn.LSTM(1, 16, batch_first=True)
x = torch.zeros(3, T, 1)                     # zero padding after each real sequence
for b, n in enumerate(lens):
    x[b, :n, 0] = torch.randn(int(n))

with torch.no_grad():
    out, _ = lstm(x)
    alone = lstm(x[0:1, :30])[0][0, -1]      # sequence 0 by itself, no padding
    short_pad = lstm(x[0:1, :60])[0][0, -1]  # the same sequence padded only to 60
    pk = pack_padded_sequence(x, lens, batch_first=True, enforce_sorted=False)
    packed, _ = lstm(pk)
    unpacked, _ = pad_packed_sequence(packed, batch_first=True, total_length=T)

gap = lambda a, b: f"{(a - b).norm():.4f}"
print("norm of the true last output of sequence 0  :", gap(alone, torch.zeros(16)))
print("readout at position 240 vs true last output :", gap(out[0, -1], alone))
print("readout at position 60 vs true last output  :", gap(short_pad, alone))
print("gathered at the true length vs true output  :", gap(out[0, lens[0] - 1], alone))
print("packed, gathered at true length vs true     :",
      gap(unpacked[0, lens[0] - 1], alone))
mask = torch.arange(T)[None, :] < lens[:, None]
print("real positions:", int(mask.sum()), "of", mask.numel())
```

```output
norm of the true last output of sequence 0  : 0.3512
readout at position 240 vs true last output : 0.0670
readout at position 60 vs true last output  : 0.0670
gathered at the true length vs true output  : 0.0000
packed, gathered at true length vs true     : 0.0000
real positions: 360 of 720
```

The padded readout is off by 0.067 against an output of norm 0.351, 19% of its size. It is the same at position 60 and at position 240 because this small random network settles to its zero-input fixed point within a few steps; a trained network can drift further or less. Whatever the size, the readout describes the padding and not the sequence, and gathering (or packing) removes the error exactly.
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
A colleague's pipeline for a vibration forecaster:

1. z-score the whole two-year series;
2. cut windows of 128 samples with stride 1;
3. shuffle the windows and split them 80/20 at random;
4. train with early stopping on the 20%;
5. report the RMSE on the same 20%.

Identify every leak and give a corrected pipeline.
:::

::: solution
Four leaks, in the terms of [Section 8](#s8).

- **Step 1 uses the future.** The mean and standard deviation of the whole series include the test period. In deployment the future's statistics are unknown. Under drift the leak also hides a real difficulty: a test period at a new level is rescaled to look like the training data. *Fix:* compute the statistics on the training part only, or normalise each window by its own last value or mean.
- **Steps 2 and 3 together leak the target.** Windows of 128 samples at stride 1 share 127 values with each neighbour. Each test target is an *input value* in up to 128 later windows, and with a random 80/20 split the chance that all 128 land in the test set is $0.2^{128} \approx 3\times10^{-90}$. So the training set contains the answer to nearly every test question, and the score measures interpolation, not forecasting. Either step alone is harmless (overlapping windows are fine for training; a shuffle of windows already cut from a training block is fine). It is the split that must respect time.
- **Steps 4 and 5 reuse the test set.** The 20% chooses the stopping epoch and then reports the score, so the score is optimistic by the amount of selection. The selection set and the reporting set must be different.
- **No baseline.** A forecast RMSE with nothing to compare against says nothing: report the naive, seasonal-naive and linear baselines on the same data ([Module 01](module_01_EN.html): every number carries its baseline).

**Corrected pipeline.** Split by time, in order: for two years, say months 1 to 16 for training, 17 to 20 for validation (early stopping and hyperparameters) and 21 to 24 for the test, which is used once. No training window may have its target after the end of the training block; validation and test windows may read earlier samples as inputs, since at forecast time those are known. For a multi-step horizon $h$, leave a gap of at least $h$ between the blocks. Fit the normalisation on the training block only (or per window). Where one test block is too thin an estimate, use walk-forward folds with an inner validation block ([Section 8](#s8)), and report each fold's score and the mean and spread over folds, together with the baselines on the same folds.
:::

::: exercise id=e8 level=2 kind=calculation minutes=10
The one-step residuals of a forecaster on held-out normal data have standard deviation $\sigma = 0.2$ and are roughly Gaussian; the sensor samples at 10 Hz.

(a) Compute the expected false alarms per day for a two-sided threshold at $3.5\sigma$, $4.5\sigma$ and $5.5\sigma$.

(b) If residuals were independent, how many consecutive $3.5\sigma$ exceedances would you require to get fewer than one false alarm a month?

(c) Give two reasons the real false-alarm rate will be higher than (a) predicts, and say how to set the threshold instead.

(d) A sensor offset of $+1.2$ appears and stays. With a forecaster that subtracts each window's last value, how many samples will a $4\sigma$ point test flag, and what would you add?
:::

::: solution
**(a)** Ten samples a second is $10\times86{,}400 = 864{,}000$ samples a day. A two-sided threshold at $k\sigma$ is exceeded with probability $p = 2\,(1 - \Phi(k))$, with $\Phi$ the standard normal distribution function; the expected false alarms are $864{,}000\,p$ ([Section 9](#s9)).

| threshold | $p$ | false alarms per day |
|---|---|---|
| $3.5\sigma$ | $4.65\times10^{-4}$ | 402 |
| $4.5\sigma$ | $6.80\times10^{-6}$ | 5.87 |
| $5.5\sigma$ | $3.80\times10^{-8}$ | 0.033 (about one a month) |

The values of $p$ come from the normal tail (tables or `scipy.stats.norm.sf`). Each step of 1 in $k$ cuts the false-alarm rate by a factor of about 70 to 180, which is why the threshold is cheap to raise.

**(b)** A run of $n$ consecutive exceedances starts at a given sample with probability $p^{n}$ if the residuals are independent, so the expected number of runs is $864{,}000\,p^{n}$ a day (runs overlap rarely enough for this to count them well). With $p = 4.65\times10^{-4}$:

- $n = 2$: $p^2 = 2.17\times10^{-7}$, so $0.187$ a day, or $5.6$ a month: too many;
- $n = 3$: $p^3 = 1.01\times10^{-10}$, so $8.7\times10^{-5}$ a day, or $0.0026$ a month: well under one.

Three consecutive exceedances is the answer. The price is a delay of two samples (0.2 s at 10 Hz), which is nothing here, and the loss of any fault shorter than three samples, so a one-sample spike is no longer caught by this rule. That is why each fault type needs its own detector ([Section 9](#s9)).

**(c)** Two reasons, both from [Section 9](#s9). Residuals are **autocorrelated**: a forecaster that is wrong at one step tends to be wrong the same way at the next, so exceedances arrive in runs and $p^n$ is far too optimistic. And residuals are **heavy-tailed**: normal operation contains rare transients (start-ups, load changes) that a Gaussian tail does not describe. A third is that $\sigma$ itself changes with the operating state. Set the threshold instead from the **empirical quantiles of residuals on a long held-out normal record**, with the persistence rule applied, and *measure* the false alarms per day on that record. A rate of one a month at 10 Hz is one in $30\times864{,}000 = 25.9$ million samples, so it takes about a month of normal data, and preferably several, to measure it at all: a day of data cannot tell $10^{-8}$ from $10^{-6}$.

**(d)** The jump is $1.2/0.2 = 6\sigma$, so the onset sample is flagged by the $4\sigma$ test, and so is the end when the offset disappears. After the jump the forecaster has *re-centred*: it predicts the next value as the last value plus a forecast of the change, so the level error is gone after one step and the offset is never seen again as a level. What remains is an echo, because the window now contains a step that the model never met in training. The answer is therefore "one at the onset, plus a few more while the step crosses the window", not a sustained alarm. For scale, [Lab 3](#lab3) injects an offset of $+0.8$, again about $6\sigma$ there ($\sigma = 0.131$), and its $4\sigma$ point test raises 5 alarms, all at the onset and the end of the offset and none in between. A re-implementation of the same set-up (the code of [Exercise 15](#e15), trained on fold 3) gave a $4\sigma$ alarm on the first sample, two more within the next 12 samples, three at the end of the offset, and none in between: over the last 30 samples of the offset the residual's standard deviation was 0.131, the normal value. The point test sees only the edges.

What to add: a **level check against an independent reference**, which does not move with the sensor: a redundant sensor, the physics prediction of a twin, or a range check against the known operating envelope. Alternatively a CUSUM over residuals from a model that does not re-centre (a longer-horizon forecaster, or one without per-window normalisation) accumulates the evidence that the level is wrong.

```python
from scipy.stats import norm

samples_per_day = 10 * 86_400                    # 10 Hz
for k in (3.5, 4.5, 5.5):
    p = 2 * norm.sf(k)                           # two-sided tail probability
    print(f"{k}σ: p = {p:.3e}, false alarms/day = {p * samples_per_day:.3f}")
p = 2 * norm.sf(3.5)
for n in (1, 2, 3):
    per_day = samples_per_day * p ** n           # expected starts of a run of n
    print(f"{n} in a row: {per_day:.3e} per day, {30 * per_day:.4f} per month")
```

```output
3.5σ: p = 4.653e-04, false alarms/day = 401.983
4.5σ: p = 6.795e-06, false alarms/day = 5.871
5.5σ: p = 3.798e-08, false alarms/day = 0.033
1 in a row: 4.020e+02 per day, 12059.4915 per month
2 in a row: 1.870e-01 per day, 5.6108 per month
3 in a row: 8.702e-05 per day, 0.0026 per month
```
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
Explain why teacher forcing lets an RNN decoder be trained without sampling, and what exposure bias is. Using Lab 4's numbers for the model without attention at length 12 (teacher-forced token accuracy 74%, free-running 53%), explain the gap and propose two remedies.
:::

::: solution
**Why training needs no sampling.** With teacher forcing the decoder's input at step $t$ is the *true* previous token $y_{t-1}$, which is known from the data. Every decoder input is therefore available before the forward pass starts, and each step's loss is an ordinary cross-entropy against a known target, computed on a correct prefix. Nothing has to be generated to be scored, and every step receives a clean learning signal ([Section 10](#s10)).

**Exposure bias.** At test time there is no true previous token, so the decoder conditions on its own outputs. The model was only ever exposed to correct prefixes. One wrong token puts it in a state that no training step produced; its next prediction is less reliable than the model's accuracy on correct prefixes suggests, and errors compound.

**The gap.** Teacher-forced accuracy of 74% means 26% of tokens are wrong *given a correct prefix*. Free-running accuracy of 53% means 47% are wrong, $47/26 = 1.8$ times as many. The extra errors are those that follow an earlier error: nothing else differs between the two measurements. The gap grows with length (essentially none at length 4, 99.7% against 99.4%; 91% against 80% at length 8; 74% against 53% at length 12) because a longer output has more earlier tokens that can be wrong. It also needs errors to compound: with attention both accuracies are 100% at every length, and exposure bias costs nothing for a model that never errs.

**Remedies.**

- **Scheduled sampling** (Bengio et al. 2015): during training, feed the model's own previous prediction in place of the true token with a probability that rises over training, so the decoder learns to recover from its own mistakes.
- **Training on the model's own rollouts, or with sequence-level objectives** that score whole generated outputs (the reinforcement-learning methods of [Module 09](module_09_EN.html)).
- **Reduce the error rate itself**: the best fix for this task is attention ([Section 11](#s11)), which removes the bottleneck that causes the first errors.

Whatever the remedy, evaluate free-running, the only mode deployment has.
:::

::: exercise id=e10 level=2 kind=calculation minutes=10
A decoder over $\{A, B, \langle e\rangle\}$ has $p(y_1) = (A\ 0.45,\ B\ 0.35,\ \langle e\rangle\ 0.20)$, $p(y_2\mid A) = (A\ 0.40,\ B\ 0.35,\ \langle e\rangle\ 0.25)$ and $p(y_2\mid B) = (A\ 0.10,\ B\ 0.75,\ \langle e\rangle\ 0.15)$. After two tokens it always emits $\langle e\rangle$.

(a) What does greedy decoding output, and with what probability?

(b) Run beam search with $k = 2$ step by step, as in [Section 10](#s10) (keep the $k$ best of all expansions; a kept hypothesis that has ended is set aside), listing the hypotheses kept and their log-probabilities.

(c) Rank all complete sequences by probability. Is beam search exact here? Is it exact in general?

(d) Compute the length-normalised score (log-probability divided by length, counting $\langle e\rangle$) of the three most probable sequences. Does the ranking change?
:::

::: solution
**(a)** Greedy takes the most probable token at each step. Step 1: $A$ (0.45). After $A$: $A$ (0.40). After two tokens: $\langle e\rangle$ (probability 1). The output is $AA\langle e\rangle$ with probability $0.45\times0.40\times1 = 0.18$.

**(b)** The logarithms: $\ln 0.45 = -0.799$, $\ln 0.35 = -1.050$, $\ln 0.20 = -1.609$.

*Step 1.* The three extensions of the empty prefix are $A$ ($-0.799$), $B$ ($-1.050$) and $\langle e\rangle$ ($-1.609$). Keep the best two, $A$ and $B$; the empty output $\langle e\rangle$ is pruned.

*Step 2.* Extend $A$ and $B$ by every token and score the six extensions by cumulative probability:

| extension | probability | $\ln p$ |
|---|---|---|
| $BB$ | $0.35\times0.75 = 0.2625$ | $-1.338$ |
| $AA$ | $0.45\times0.40 = 0.18$ | $-1.715$ |
| $AB$ | $0.45\times0.35 = 0.1575$ | $-1.848$ |
| $A\langle e\rangle$ | $0.45\times0.25 = 0.1125$ | $-2.185$ (finished) |
| $B\langle e\rangle$ | $0.35\times0.15 = 0.0525$ | $-2.947$ (finished) |
| $BA$ | $0.35\times0.10 = 0.035$ | $-3.352$ |

Keep the best two: $BB$ and $AA$. Neither has ended.

*Step 3.* Each can only emit $\langle e\rangle$ (probability 1), so $BB\langle e\rangle$ has $\ln p = -1.338$ and $AA\langle e\rangle$ has $-1.715$. Both finish and the beam is empty. The best finished hypothesis is $BB\langle e\rangle$, with probability 0.2625, which is $0.2625/0.18 = 1.46$ times greedy's answer. Greedy committed to $A$ at step 1 because it had the higher first-token probability; the sequence that starts with $B$ has a much better continuation, which beam search with $k = 2$ could see.

**(c)** All seven complete sequences, from the probabilities above and $\langle e\rangle$ alone (0.20):

| rank | sequence | probability |
|---|---|---|
| 1 | $BB\langle e\rangle$ | 0.2625 |
| 2 | $\langle e\rangle$ | 0.2000 |
| 3 | $AA\langle e\rangle$ | 0.1800 |
| 4 | $AB\langle e\rangle$ | 0.1575 |
| 5 | $A\langle e\rangle$ | 0.1125 |
| 6 | $B\langle e\rangle$ | 0.0525 |
| 7 | $BA\langle e\rangle$ | 0.0350 |

They sum to 1, as they must. Beam search found the best sequence here, because its first token, $B$, was among the top two at step 1. It is **not exact in general**: it pruned the second most probable sequence, the empty output $\langle e\rangle$, at step 1, and any sequence whose prefix falls out of the top $k$ at some step is lost for good, however good its continuation. With $k = 1$ (greedy) it lost the best sequence here. (An implementation that does not count finished hypotheses against the beam would have kept $\langle e\rangle$ as a finished candidate. It would still return $BB\langle e\rangle$, but the principle of pruning on prefixes is the same.)

**(d)** Divide the log-probability by the length in tokens, counting $\langle e\rangle$:

- $BB\langle e\rangle$: $-1.338/3 = -0.446$;
- $\langle e\rangle$: $-1.609/1 = -1.609$;
- $AA\langle e\rangle$: $-1.715/3 = -0.572$.

The ranking changes: the empty output falls from second to third place among these three (and to last place among all seven sequences, at $-1.609$ against $-0.446$ to $-1.473$ for the others). Summed log-probabilities are biased towards short outputs, since every token multiplies the probability by a number below 1; normalising by length corrects for that bias ([Section 10](#s10)). Whether it is the right correction depends on the task: an empty output may be exactly what is wanted.

```python
import math

# p(next token | prefix); after two tokens the decoder always emits <e> (written "e")
P = {"": {"A": 0.45, "B": 0.35, "e": 0.20},
     "A": {"A": 0.40, "B": 0.35, "e": 0.25},
     "B": {"A": 0.10, "B": 0.75, "e": 0.15}}

def next_probs(prefix):
    return P[prefix] if len(prefix) < 2 else {"e": 1.0}

def beam_search(k, show=False):
    beam, finished = [("", 0.0)], []
    while beam:
        cand = [(s + t, lp + math.log(p))
                for s, lp in beam for t, p in next_probs(s).items()]
        cand = sorted(cand, key=lambda c: -c[1])[:k]         # keep the k best of all
        if show:
            print("  kept:", ", ".join(f"{s} {lp:.3f}" for s, lp in cand))
        finished += [c for c in cand if c[0].endswith("e")]  # set finished ones aside
        beam = [c for c in cand if not c[0].endswith("e")]
    return max(finished, key=lambda c: c[1])

for k in (1, 2):
    print(f"k = {k}")
    seq, lp = beam_search(k, show=True)
    print(f"  best finished: {seq}  p = {math.exp(lp):.4f}  ln p = {lp:.3f}")
```

```output
k = 1
  kept: A -0.799
  kept: AA -1.715
  kept: AAe -1.715
  best finished: AAe  p = 0.1800  ln p = -1.715
k = 2
  kept: A -0.799, B -1.050
  kept: BB -1.338, AA -1.715
  kept: BBe -1.338, AAe -1.715
  best finished: BBe  p = 0.2625  ln p = -1.338
```

The run with $k = 1$ is greedy decoding and reproduces (a); the run with $k = 2$ reproduces (b).
:::

::: exercise id=e11 level=2 kind=calculation minutes=10
Encoder states $\mathbf{h}_1 = (1, 1)$, $\mathbf{h}_2 = (2, 0)$, $\mathbf{h}_3 = (0, -1)$.

(a) With dot-product scores and decoder state $\mathbf{s} = (1, 0)$, compute the scores, the attention weights and the context vector.

(b) Repeat with $\mathbf{s} = (3, 0)$. What changed, and why does it matter for training?

(c) Relate (b) to the $1/\sqrt{d_k}$ factor of [Module 06](module_06_EN.html).

(d) With additive attention, $\mathbf{W}_a = \mathbf{I}$, $\mathbf{U}_a = \begin{bmatrix}1 & 0\\ 0.5 & -0.5\end{bmatrix}$, $\mathbf{v}_a = (1, 0.5)$ and $\mathbf{s}_{t-1} = (-0.5, 0.5)$, compute the weights and the context.
:::

::: solution
**(a)** The score of annotation $j$ is the dot product $e_j = \mathbf{s}^\top\mathbf{h}_j$: $e_1 = 1\cdot1 + 0\cdot1 = 1$, $e_2 = 1\cdot2 + 0 = 2$, $e_3 = 0$. So $e = (1, 2, 0)$. The softmax: $\exp(e) = (2.7183,\ 7.3891,\ 1)$ with sum $11.1073$, so

$$\alpha = (0.2447,\ 0.6652,\ 0.0900).$$

The context is the weighted average of the annotations (arithmetic carried at full precision, so recomputing from the rounded weights can differ in the last digit):

$$\mathbf{a} = 0.2447\,(1, 1) + 0.6652\,(2, 0) + 0.0900\,(0, -1) = (0.2447 + 1.3304,\ 0.2447 - 0.0900) = (1.5752,\ 0.1547).$$

**(b)** With $\mathbf{s} = (3, 0)$ the scores are $(3, 6, 0)$, three times as large. Then $\exp(e) = (20.086,\ 403.43,\ 1)$ with sum $424.51$, so

$$\alpha = (0.0473,\ 0.9503,\ 0.0024), \qquad \mathbf{a} = (1.9480,\ 0.0450).$$

The same direction, three times longer, has made the distribution much sharper: 95% of the weight is on $\mathbf{h}_2$, up from 67%. Multiplying every score by 3 is the same as dividing the softmax's temperature by 3. This matters for training because the softmax *saturates*: the sensitivity of the weights to the scores is $\partial\alpha_j/\partial e_j = \alpha_j(1 - \alpha_j)$, which is $(0.185,\ 0.223,\ 0.082)$ in (a) and $(0.045,\ 0.047,\ 0.0024)$ in (b). For the third annotation the gradient has shrunk 35-fold. A saturated softmax passes little gradient to the score network or to the states that produced the scores, and training stalls.

**(c)** For a query and a key of width $d_k$ whose components are independent with zero mean and unit variance, the dot product $\sum_i q_ik_i$ has variance $\sum_i\mathbb{E}[q_i^2]\,\mathbb{E}[k_i^2] = d_k$. Typical scores therefore grow like $\sqrt{d_k}$, and a wide model sits in the saturated regime of (b) at initialisation, with vanishing gradients. Dividing the scores by $\sqrt{d_k}$ restores unit variance whatever the width ([Module 06](module_06_EN.html)). A simulation of 20,000 random pairs gives variances of 4.0, 64.5 and 1,023.5 for $d = 4$, 64 and 1,024 (script below), while a width of 2, as here, gives scores of standard deviation only $\sqrt2$, so the effect needs an exaggeration such as the factor 3 to show.

**(d)** Additive attention is $e_j = \mathbf{v}_a^\top\tanh(\mathbf{W}_a\mathbf{s}_{t-1} + \mathbf{U}_a\mathbf{h}_j)$ ([Section 11](#s11)). In steps:

1. $\mathbf{W}_a\mathbf{s}_{t-1} = \mathbf{s}_{t-1} = (-0.5, 0.5)$, since $\mathbf{W}_a = \mathbf{I}$.
2. $\mathbf{U}_a\mathbf{h}_j$: for $\mathbf{h}_1 = (1, 1)$, $(1,\ 0.5 - 0.5) = (1, 0)$; for $\mathbf{h}_2 = (2, 0)$, $(2, 1)$; for $\mathbf{h}_3 = (0, -1)$, $(0, 0.5)$. (The products do not depend on $t$, so a real implementation computes them once per source.)
3. Pre-activations, the sums: $(0.5, 0.5)$, $(1.5, 1.5)$, $(-0.5, 1.0)$.
4. After tanh: $(0.4621, 0.4621)$, $(0.9051, 0.9051)$, $(-0.4621, 0.7616)$.
5. Scores $e_j = \tanh_1 + 0.5\tanh_2$: $0.4621 + 0.2311 = 0.6932$; $0.9051 + 0.4526 = 1.3577$; $-0.4621 + 0.3808 = -0.0813$.
6. Softmax: $\exp(e) = (2.0000,\ 3.8873,\ 0.9219)$, sum $6.8093$, so $\alpha = (0.2937,\ 0.5709,\ 0.1354)$.
7. Context: $0.2937\,(1, 1) + 0.5709\,(2, 0) + 0.1354\,(0, -1) = (0.2937 + 1.1418,\ 0.2937 - 0.1354) = (1.4355,\ 0.1583)$.

The weights sum to 1 and the context lies among the annotations, as it must.

```python
import numpy as np

H = np.array([[1, 1], [2, 0], [0, -1]], float)         # rows are h_1, h_2, h_3

def softmax(e):
    e = np.exp(e - e.max())
    return e / e.sum()

for s in ([1, 0], [3, 0]):
    s = np.array(s, float)
    e = H @ s                                          # dot-product scores
    a = softmax(e)
    print(f"s = {s}: e = {e}, alpha = {a.round(4)}, context = {(a @ H).round(4)}, "
          f"alpha(1-alpha) = {(a * (1 - a)).round(4)}")

W_a, U_a, v_a = np.eye(2), np.array([[1, 0], [0.5, -0.5]]), np.array([1, 0.5])
s_prev = np.array([-0.5, 0.5])
pre = H @ U_a.T + W_a @ s_prev                        # U_a h_j + W_a s_{t-1}
e = np.tanh(pre) @ v_a
a = softmax(e)
print("additive: e =", e.round(4), " alpha =", a.round(4),
      " context =", (a @ H).round(4))

rng = np.random.default_rng(0)
for d in (4, 64, 1024):
    q, k = rng.standard_normal((20000, d)), rng.standard_normal((20000, d))
    print(f"d = {d:4d}: variance of q.k = {(q * k).sum(axis=1).var():.1f}")
```

```output
s = [1. 0.]: e = [1. 2. 0.], alpha = [0.2447 0.6652 0.09  ], context = [1.5752 0.1547], alpha(1-alpha) = [0.1848 0.2227 0.0819]
s = [3. 0.]: e = [3. 6. 0.], alpha = [0.0473 0.9503 0.0024], context = [1.948 0.045], alpha(1-alpha) = [0.0451 0.0472 0.0024]
additive: e = [ 0.6932  1.3577 -0.0813]  alpha = [0.2937 0.5709 0.1354]  context = [1.4355 0.1583]
d =    4: variance of q.k = 4.0
d =   64: variance of q.k = 64.5
d = 1024: variance of q.k = 1023.5
```
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
In two sentences each: why can a recurrent network not be trained in parallel over time, and why can a transformer? Then, without computing sizes: while generating, a sequence grows from 4,096 to 32,768 tokens. By what factor does an LSTM's per-sequence state grow, and by what factor a transformer's key-value cache? What does that mean for the number of sequences one accelerator's memory can hold at once?
:::

::: solution
**Recurrent network.** The state $\mathbf{h}_t$ is a nonlinear function of $\mathbf{h}_{t-1}$, so step $t$ cannot start before step $t-1$ has finished. Teacher forcing makes the *inputs* known in advance, but it does not break this chain: the $T$ steps remain a dependent sequence, however many processors are free ([Section 12](#s12)).

**Transformer.** Within a layer, each position depends on that layer's *inputs*, which teacher forcing makes known, and not on the other positions' outputs at the same layer. All positions can therefore be computed together, in one masked matrix operation per layer ([Module 06](module_06_EN.html)).

**State and cache.** The LSTM keeps a fixed $(\mathbf{h}, \mathbf{c})$ per layer, however long the context: the factor is **1**. The key-value cache stores a key and a value for every past token, so it grows in proportion to the context: the factor is $32{,}768/4{,}096 = $ **8**. In the example of [Section 12](#s12), the cache is 0.81 GB at 4,096 tokens and 6.44 GB at 32,768.

**Consequence.** For a fixed memory budget left over after the weights, the number of sequences in flight is the budget divided by the state per sequence. The LSTM holds the *same* number at any length. The transformer holds one eighth as many at 32,768 tokens as at 4,096, if the cache dominates. This is the trade of [Section 12](#s12): the transformer pays at inference for what it gains in training, and [Module 10](module_10_EN.html) derives the consequences for serving.
:::

::: exercise id=e13 level=2 kind=calculation minutes=10
(a) For $h_t = 0.8\,h_{t-1} + x_t$, $y_t = 2h_t$, $h_0 = 0$ and $x = (2, -1, 0, 1)$, compute $y$ by the recurrence and then by convolution with the kernel $K_k = c\,a^k b$; show that they agree.

(b) The continuous system $\mathrm{d}h/\mathrm{d}t = -0.5\,h + x(t)$ is discretised by zero-order hold with step $\Delta$. Compute $a$ and $b$ for $\Delta = 0.1$, 1 and 5, compare with forward Euler at $\Delta = 1$ and $\Delta = 5$, and interpret $\Delta$.

(c) For a complex mode $\lambda = 0.98\,e^{i\pi/12}$, give the half-life and the oscillation period of its kernel.

(d) Why does making $\Delta$ depend on $x_t$ (as Mamba does) remove the convolution form, and what computes the recurrence in parallel instead?
:::

::: solution
**(a)** The recurrence has $a = 0.8$, $b = 1$ and $c = 2$.

- $h_1 = 0.8\cdot0 + 2 = 2$, so $y_1 = 4$;
- $h_2 = 0.8\cdot2 + (-1) = 0.6$, so $y_2 = 1.2$;
- $h_3 = 0.8\cdot0.6 + 0 = 0.48$, so $y_3 = 0.96$;
- $h_4 = 0.8\cdot0.48 + 1 = 1.384$, so $y_4 = 2.768$.

By convolution: unrolling the recurrence gives $h_t = \sum_{k=0}^{t-1}a^k b\,x_{t-k}$, hence $y_t = \sum_k K_k\,x_{t-k}$ with $K_k = c\,a^kb = 2\times0.8^k$, that is $K = (2,\ 1.6,\ 1.28,\ 1.024)$. Then

- $y_1 = K_0x_1 = 2\cdot2 = 4$;
- $y_2 = K_0x_2 + K_1x_1 = -2 + 3.2 = 1.2$;
- $y_3 = K_0x_3 + K_1x_2 + K_2x_1 = 0 - 1.6 + 2.56 = 0.96$;
- $y_4 = K_0x_4 + K_1x_3 + K_2x_2 + K_3x_1 = 2 + 0 - 1.28 + 2.048 = 2.768$.

The two agree, as they must: the convolution is the unrolled recurrence. The recurrence costs one multiply-add per step but is sequential; the convolution is a sum for every output, which can be computed in parallel (by FFT for long kernels), and it is possible *because $a$, $b$ and $c$ are the same at every step* ([Section 13](#s13)).

**(b)** Solve $\mathrm{d}h/\mathrm{d}t = -\lambda h + x$ with $\lambda = 0.5$ over one step of length $\Delta$ with the input held constant (zero-order hold):

$$h(t + \Delta) = e^{-\lambda\Delta}h(t) + \frac{1 - e^{-\lambda\Delta}}{\lambda}\,x, \qquad a = e^{-0.5\Delta}, \quad b = \frac{1 - e^{-0.5\Delta}}{0.5}.$$

Forward Euler replaces the exponential by its first-order expansion: $a = 1 - 0.5\Delta$ and $b = \Delta$.

| $\Delta$ | zero-order hold $a$ | zero-order hold $b$ | forward Euler $a$ | forward Euler $b$ |
|---|---|---|---|---|
| 0.1 | 0.9512 | 0.0975 | 0.95 | 0.1 |
| 1 | 0.6065 | 0.7869 | 0.5 | 1 |
| 5 | 0.0821 | 1.8358 | $-1.5$ | 5 |

At $\Delta = 0.1$ the two schemes nearly agree. At $\Delta = 1$ Euler is already inaccurate (0.5 against 0.6065). At $\Delta = 5$ Euler gives $a = -1.5$: $|a| > 1$, an *unstable* recurrence for a system that is stable. Euler is stable here only for $\Delta < 4$ (the condition $|1 - 0.5\Delta| < 1$). Zero-order hold maps a stable continuous pole to $|a| < 1$ for every $\Delta$, which is why state-space models discretise with it.

**Interpreting $\Delta$.** It is the time the system is allowed to evolve between samples. A small $\Delta$ keeps the state ($a$ near 1) and writes little ($b$ small); a large $\Delta$ forgets ($a$ near 0) and writes a lot. Since $\lambda b = 1 - a$, the update is $h_t = a\,h_{t-1} + (1 - a)\,(x_t/\lambda)$, a convex combination of the old state and the scaled input, with the forget amount set by $\Delta$: exactly the shape of a GRU's update ([Section 6](#s6)). $\Delta$ acts as a gate.

**(c)** The kernel of the mode is $\lambda^k = 0.98^k e^{ik\pi/12}$, whose real part is $0.98^k\cos(k\pi/12)$. The envelope $0.98^k$ halves when $0.98^k = 0.5$, that is at $k = \ln0.5/\ln0.98 = 34.3$ steps. The cosine repeats when $k\pi/12 = 2\pi$, so the period is $2\pi/(\pi/12) = 24$ steps. The mode is a damped oscillation whose envelope halves every 34.3 steps, about 1.4 oscillations, which is what a learned resonance looks like ([Section 13](#s13)).

**(d)** A single kernel $K_k = C\bar A^kB$ exists only if $\bar A$, $\bar B$ and $C$ are the same at every step. When $\Delta_t$ depends on $x_t$, $\bar A_t = e^{-\lambda\Delta_t}$ differs at each step, and the influence of input $s$ on output $t$ is the product $\bar A_t\bar A_{t-1}\cdots\bar A_{s+1}$, which differs for every pair $(s, t)$. No single sequence of $K_k$ describes it. The recurrence $h_t = a_th_{t-1} + b_t$ is still *linear in $h$*, though, and linear recurrences compose associatively: a step is the pair $(a_t, b_t)$, and applying $(a_1, b_1)$ and then $(a_2, b_2)$ gives $h \mapsto a_2(a_1h + b_1) + b_2$, the pair $(a_2a_1,\ a_2b_1 + b_2)$. An associative operation can be evaluated as a tree, so a **parallel scan** computes all $T$ states in $O(\log T)$ rounds ([Section 13](#s13)). The script checks (a), (b) and (c) numerically, and then a scan with input-dependent $a_t$ against the sequential loop.

```python
import numpy as np

x = np.array([2.0, -1.0, 0.0, 1.0])
a, b, c = 0.8, 1.0, 2.0
h, y_rec = 0.0, []
for xt in x:
    h = a * h + b * xt                                 # recurrence
    y_rec.append(c * h)
K = np.array([c * a ** k * b for k in range(len(x))])  # kernel K_k = c a^k b
y_conv = [sum(K[k] * x[t - k] for k in range(t + 1)) for t in range(len(x))]
print("recurrence:", np.round(y_rec, 4), " kernel:", K,
      " convolution:", np.round(y_conv, 4))

lam = 0.5                                              # dh/dt = -lam h + x(t)
for delta in (0.1, 1.0, 5.0):
    a_zoh = np.exp(-lam * delta)
    b_zoh = (1 - a_zoh) / lam
    print(f"delta = {delta}: ZOH a = {a_zoh:.4f}, b = {b_zoh:.4f}; "
          f"Euler a = {1 - lam * delta:.4f}, b = {delta:.4f}")
mode = 0.98 * np.exp(1j * np.pi / 12)
print(f"|lambda| = {abs(mode):.2f}, half-life = {np.log(0.5) / np.log(abs(mode)):.1f} "
      f"steps, period = {2 * np.pi / np.angle(mode):.1f} steps")
```

```output
recurrence: [4.    1.2   0.96  2.768]  kernel: [2.    1.6   1.28  1.024]  convolution: [4.    1.2   0.96  2.768]
delta = 0.1: ZOH a = 0.9512, b = 0.0975; Euler a = 0.9500, b = 0.1000
delta = 1.0: ZOH a = 0.6065, b = 0.7869; Euler a = 0.5000, b = 1.0000
delta = 5.0: ZOH a = 0.0821, b = 1.8358; Euler a = -1.5000, b = 5.0000
|lambda| = 0.98, half-life = 34.3 steps, period = 24.0 steps
```

```python
import numpy as np

def recurrence(a, b):
    """h_t = a_t h_{t-1} + b_t with h_0 = 0, one step after another."""
    h, out = 0.0, []
    for at, bt in zip(a, b):
        h = at * h + bt
        out.append(h)
    return np.array(out)

def scan(a, b):
    """Same result in ceil(log2 T) rounds; each round combines (a, b) pairs with
    (a2, b2) after (a1, b1) = (a2 * a1, a2 * b1 + b2), which is associative."""
    a, b, shift = a.copy(), b.copy(), 1
    rounds = 0
    while shift < len(a):
        a_prev = np.concatenate([np.ones(shift), a[:-shift]])    # identity pair
        b_prev = np.concatenate([np.zeros(shift), b[:-shift]])   # for t < shift
        b, a = a * b_prev + b, a * a_prev
        shift *= 2
        rounds += 1
    return b, rounds

rng = np.random.default_rng(0)
T = 37
delta = rng.uniform(0.05, 2.0, T)           # input-dependent step sizes
a = np.exp(-0.5 * delta)                    # a_t = exp(-lambda * delta_t), lambda = 0.5
b = (1 - a) / 0.5 * rng.standard_normal(T)  # b_t * x_t
h_loop = recurrence(a, b)
h_scan, rounds = scan(a, b)
print(f"max difference {np.abs(h_loop - h_scan).max():.2e} after {rounds} rounds "
      f"instead of {T} steps")
```

```output
max difference 4.44e-16 after 6 rounds instead of 37 steps
```

Six rounds replace 37 sequential steps; for $T = 100{,}000$ it would be 17.
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
Choose a sequence model for each case and justify it in one or two sentences.

(a) On-device detection of bearing faults from a 1 kHz accelerometer on a microcontroller with 64 KiB of RAM, with dependencies up to 2 s.

(b) Offline labelling of every event in last month's 50,000-line plant log as routine or abnormal.

(c) A three-week-ahead forecast of one building's daily energy use from four years of history.

(d) A model over sequences of 100,000 sensor samples with structure at all scales, trained on a GPU.
:::

::: solution
The decision turns on four properties of the case: online or offline, how much memory and compute per step, how long the dependencies are, and how much data there is ([Section 12](#s12)).

(a) **A small GRU or LSTM, or a diagonal linear recurrence, run in recurrent mode.** The state is constant and a few kB at most (a GRU with $H = 64$ in fp32 keeps $64\times4 = 256$ B), and each sample costs the same small amount of compute. Alternatives cost more memory than the device has. A temporal convolutional network that covers 2 s at 1 kHz needs a receptive field of 2,000 samples: kernel 2 with dilations 1 to 1024 gives $1 + 2{,}047 = 2{,}048$, and streaming it needs a buffer of $(k-1)d$ samples per layer, $2{,}047$ samples per channel in all. With 16 channels in fp32 that is $2{,}047\times16\times4 = 131{,}008$ B, about 128 KiB, twice the RAM; in int8 it is 32.8 kB, half of it. A transformer's cache over 2,000 samples, with two layers of width 32 in int8, is $2\times2\times2{,}000\times32 = 256{,}000$ B, about 250 KiB. (These are computed by hand under the stated sizes.) A plain recurrent net on raw 1 kHz samples will not learn a 2,000-step lag, so also reduce the rate (features per 20 ms frame, say) or use a linear recurrence with $|\lambda|$ near 1 ([Section 13](#s13)).

(b) **A bidirectional LSTM or a transformer encoder over windows of the log.** The task is offline, so each line's label may use the lines on both sides ([Section 6](#s6)); a baseline such as logistic regression on line features ([Module 01](module_01_EN.html)) should come first, to find out how much the context adds.

(c) **Baselines first: a seasonal-naive forecast (weekly period) and a linear model with calendar features; a neural forecaster only if it beats them on walk-forward folds.** Four years of daily data is about 1,460 samples, far too little to train a deep model to beat a well-chosen linear model, and a three-week horizon leaves a handful of independent test blocks ([Section 8](#s8)).

(d) **A state-space or linear-recurrence stack, or a transformer with an efficient attention variant.** A linear recurrence is trained in convolution or scan mode, in time linear in the length, and covers structure at all scales through modes with different $\lambda$ ([Section 13](#s13)). A plain LSTM would be a serial loop of 100,000 steps; full attention costs $T^2 = 10^{10}$ scores per head per layer ([Section 12](#s12)).
:::

::: exercise id=e15 level=3 kind=coding minutes=25
In [Lab 3](#lab3)'s forecaster, replace the LSTM with a temporal convolutional network (TCN; [Section 12](#s12)): causal 1D convolutions ([Module 03](module_03_EN.html)) with kernel size 2 and dilations 1, 2, 4, 8, 16, 32, 32 channels, ReLU, residual connections between layers (a $1\times1$ convolution lifts the single input channel to 32 for the first residual), and a linear head on the last time step. Keep the per-window normalisation. Train it on the same four walk-forward folds with the same optimiser, batch size and epochs.

Report (a) the receptive field calculation; (b) the parameter count against the LSTM's 12,961; (c) the mean $\pm$ standard deviation of the one-step RMSE over the folds against the LSTM and the linear baseline; (d) the training time per fold for both networks; (e) a paragraph on when you would choose each.
:::

::: solution
**Plan.** The set-up is Lab 3's: windows of 64 samples and one-step targets, folds with origins 4,000, 5,000, 6,000 and 7,000 each validated on the next 1,000 samples, the series z-scored with statistics from each fold's training part only, then the window's last value subtracted. The data are the stiffening-mount (Duffing oscillator) signal of Lab 3, repeated here so that the script is self-contained. The two choices that matter in the TCN are these.

- **Causality.** A convolution with kernel 2 and dilation $d$ looks at positions $t$ and $t - d$. Padding on the *left* by $(k-1)d$ zeros keeps the output length at 64 and makes the output at $t$ depend on inputs $\le t$ only. Padding both sides would let outputs read the future of the window.
- **Residuals.** Each layer's output is $\text{ReLU}(\text{conv}(\cdot)) + \text{skip}$. The skip is the identity once the channel count is 32, but the first layer goes from 1 channel to 32, so its skip is a $1\times1$ convolution (the "lift").

**(a) Receptive field.** With kernel $k$ and dilations $d_l$, a TCN sees $1 + (k-1)\sum_l d_l$ samples ([Section 12](#s12)). Here $1 + 1\cdot(1 + 2 + 4 + 8 + 16 + 32) = 1 + 63 = 64$, exactly the window. Each layer doubles the reach. Fewer layers would leave the oldest samples unused; a seventh layer (dilation 64) would reach beyond the window and read only padding.

**(b) Parameters.** Counted by hand: the first convolution has $1\times32\times2$ weights and 32 biases, $96$. Each of the other five has $32\times32\times2 + 32 = 2{,}080$, which is $10{,}400$ for the five. The $1\times1$ lift is $1\times32 + 32 = 64$. The head is $32 + 1 = 33$. The total is $96 + 10{,}400 + 64 + 33 = 10{,}593$, against the LSTM's 12,961 ([Section 5](#s5)): 18% fewer.

**Code.** The script runs both networks and the linear baseline on the four folds. `SEED` (the first command-line argument) sets the weight initialisation and the order of the batches.

```python
import math
import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 0
torch.set_num_threads(4)
W = 64                                           # window length, as in Lab 3


def simulate(n=8000, seed=0):
    """Stiffening mount (Duffing oscillator) under periodic + random forcing."""
    rng = np.random.default_rng(seed)
    w0, zeta, k3, amp, sig_f, dt, sub = math.pi, 0.05, 40.0, 3.0, 3.0, 0.01, 10
    kicks = rng.standard_normal(n * sub)
    x = v = 0.0
    out = np.empty(n)
    for i in range(n * sub):
        acc = (-2 * zeta * w0 * v - w0 ** 2 * x - k3 * x ** 3
               + amp * math.sin(2 * math.pi * i * dt / 5.0))
        v += dt * acc + sig_f * math.sqrt(dt) * kicks[i]
        x += dt * v
        if (i + 1) % sub == 0:
            out[(i + 1) // sub - 1] = x
    return out + 1e-3 * np.arange(n) + 0.05 * rng.standard_normal(n)


def windows(z, lo, hi):
    """Inputs z[t-W:t] and targets z[t] for every t in [lo, hi)."""
    idx = np.arange(lo, hi)
    X = np.stack([z[t - W:t] for t in idx])[:, :, None]
    X = torch.tensor(X, dtype=torch.float32)
    return X, torch.tensor(z[idx], dtype=torch.float32)


class LSTMForecaster(nn.Module):
    def __init__(self, hidden=32):
        super().__init__()
        self.lstm = nn.LSTM(1, hidden, num_layers=2, dropout=0.1, batch_first=True)
        self.head = nn.Linear(hidden, 1)

    def forward(self, x):                        # x: (B, 64, 1)
        last = x[:, -1:, :]                      # per-window normalisation
        out, _ = self.lstm(x - last)
        return self.head(out[:, -1]).squeeze(-1) + last[:, 0, 0]


class TCNForecaster(nn.Module):
    def __init__(self, channels=32, dilations=(1, 2, 4, 8, 16, 32), k=2):
        super().__init__()
        self.k, self.dilations = k, dilations
        self.convs = nn.ModuleList(
            nn.Conv1d(1 if i == 0 else channels, channels, k, dilation=d)
            for i, d in enumerate(dilations))
        self.lift = nn.Conv1d(1, channels, 1)    # 1x1 conv: skip path of layer 1
        self.head = nn.Linear(channels, 1)

    def forward(self, x):
        last = x[:, -1:, :]
        h = (x - last).transpose(1, 2)           # (B, 1, 64): channels first
        for i, (conv, d) in enumerate(zip(self.convs, self.dilations)):
            y = F.relu(conv(F.pad(h, ((self.k - 1) * d, 0))))  # left pad: causal
            h = y + (self.lift(h) if i == 0 else h)             # residual
        return self.head(h[:, :, -1]).squeeze(-1) + last[:, 0, 0]


def train(model, X, y, epochs=10, bs=128, lr=3e-3):
    gen = torch.Generator().manual_seed(SEED)
    opt = torch.optim.AdamW(model.parameters(), lr=lr)
    for _ in range(epochs):
        model.train()
        perm = torch.randperm(len(X), generator=gen)
        for i in range(0, len(X), bs):
            b = perm[i:i + bs]
            loss = F.mse_loss(model(X[b]), y[b])
            opt.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()


def rmse(model, X, y, sd):
    model.eval()
    with torch.no_grad():
        return float((model(X) - y).pow(2).mean().sqrt()) * sd


def linear_rmse(Xtr, ytr, Xva, yva, sd):
    def feats(X):
        X = X[:, :, 0].numpy()
        return np.hstack([X - X[:, -1:], np.ones((len(X), 1))]), X[:, -1]
    Ftr, ltr = feats(Xtr)
    Fva, lva = feats(Xva)
    coef = np.linalg.lstsq(Ftr, ytr.numpy() - ltr, rcond=None)[0]
    return float(np.sqrt(((Fva @ coef + lva - yva.numpy()) ** 2).mean())) * sd


series = simulate()
dil = (1, 2, 4, 8, 16, 32)
print("receptive field:", 1 + (2 - 1) * sum(dil), "samples")
rows = []
for origin in (4000, 5000, 6000, 7000):
    mu, sd = series[:origin].mean(), series[:origin].std()
    z = (series - mu) / sd                      # statistics of the training part only
    Xtr, ytr = windows(z, W, origin)
    Xva, yva = windows(z, origin, origin + 1000)
    row = [linear_rmse(Xtr, ytr, Xva, yva, sd)]
    for cls in (LSTMForecaster, TCNForecaster):
        torch.manual_seed(SEED)
        model = cls()
        t0 = time.perf_counter()
        train(model, Xtr, ytr)
        seconds = time.perf_counter() - t0
        row += [rmse(model, Xva, yva, sd), seconds]
        n_par = sum(p.numel() for p in model.parameters())
        if origin == 4000:
            print(f"{cls.__name__}: {n_par:,} parameters")
    rows.append(row)
    print(f"origin {origin}: linear {row[0]:.3f}  LSTM {row[1]:.3f} ({row[2]:.1f} s)"
          f"  TCN {row[3]:.3f} ({row[4]:.1f} s)")
rows = np.array(rows)
mean, std = rows.mean(0), rows.std(0)
print(f"linear {mean[0]:.3f} +- {std[0]:.3f}")
print(f"LSTM   {mean[1]:.3f} +- {std[1]:.3f}   {mean[2]:.1f} s per fold")
print(f"TCN    {mean[3]:.3f} +- {std[3]:.3f}   {mean[4]:.1f} s per fold")
print(f"TCN training time is {100 * (1 - mean[4] / mean[2]):.0f}% shorter")
```

```output
receptive field: 64 samples
LSTMForecaster: 12,961 parameters
TCNForecaster: 10,593 parameters
origin 4000: linear 0.166  LSTM 0.139 (7.6 s)  TCN 0.136 (4.3 s)
origin 5000: linear 0.148  LSTM 0.132 (7.3 s)  TCN 0.127 (5.1 s)
origin 6000: linear 0.153  LSTM 0.135 (8.4 s)  TCN 0.133 (5.8 s)
origin 7000: linear 0.167  LSTM 0.131 (10.1 s)  TCN 0.134 (6.9 s)
linear 0.159 +- 0.008
LSTM   0.135 +- 0.003   8.3 s per fold
TCN    0.133 +- 0.004   5.5 s per fold
TCN training time is 34% shorter
```

The parameter counts, 12,961 and 10,593, agree with the hand counts. The standard deviations are over four folds only (population form, `ddof=0`), so they describe the spread across folds and not a confidence interval.

**(c) Accuracy.** The one-step RMSE, in the signal's own units, is $0.133\pm0.004$ for the TCN, $0.135\pm0.003$ for the LSTM and $0.159\pm0.008$ for the linear autoregression. The TCN is **tied with the LSTM** and about 16% better than the linear baseline, which has to be beaten to justify any network ([Section 8](#s8)). That the two networks are tied and not ranked is shown by repeating the run with other seeds. Seed 1 gives TCN $0.135\pm0.007$ against LSTM $0.140\pm0.006$; seed 2 gives TCN $0.138\pm0.008$ against LSTM $0.136\pm0.007$ (the linear baseline does not depend on the seed). The difference between the networks, $-0.002$, $-0.005$ and $+0.002$ over the three seeds, changes sign and is smaller than the spread across folds. Both networks beat the linear model by a margin that is stable across seeds, because the stiffening spring is nonlinear. Your own numbers will differ in the last digit.

**(d) Training time.** Per fold the LSTM took 7.3 to 10.1 s (mean 8.3 s) and the TCN 4.3 to 6.9 s (mean 5.5 s), 34% less; the other two seeds gave 33% and 34% on the same machine. The time rises from the first fold to the last because the training set grows from 3,936 windows to 6,936. Timings depend on the load on the machine, so read the ratio and not the seconds. The saving does not come from fewer arithmetic operations. Counting multiply-adds by hand, the TCN uses $64\times2\times32 + 5\times64\times2\times32\times32 + 64\times32 = 661{,}504$ per window and the two-layer LSTM $64\times(4\times32\times33 + 4\times32\times64) = 794{,}624$: about the same. It comes from the structure: the TCN computes all 64 positions of each layer in one convolution, six large operations, while the LSTM runs 64 dependent steps per layer, 128 small ones ([Section 12](#s12)). On a GPU, where small operations leave the hardware idle, the gap is larger.

**(e) When to choose each.** Choose the **TCN** when the dependency length needed is known and bounded (here 64 samples, enough to cover the 50-sample period of the load), when training speed matters, and when fixed-length windows are natural. It trains in parallel over time and its gradient path to any input is at most six layers long. Its limits are the fixed receptive field, since nothing older than 64 samples can influence the output and covering more takes more layers, and a more awkward streaming deployment: it can stream, but with a buffer per dilation level. Choose the **LSTM** (or a linear recurrence, [Section 13](#s13)) when the dependency length is unknown or very long, or when the model must run step by step with a small constant state, as on the microcontroller of [Exercise 14](#e14)(a). With its constant per-step compute, it is the natural monitor of a live stream. Here, where the two are tied in accuracy, the decision is made by engineering constraints and not by the metric.
:::
