## Lab 1 — Attention by hand, checked against PyTorch {#lab1}

**Goal.** You reproduce every number of the worked example of [Section 3](#s3) in NumPy, then
refuse to take them on trust: PyTorch's fused attention kernel and its autograd must agree with
your arithmetic to rounding error, and finite differences must agree with the softmax Jacobian of
[Section 2](#s2). You then measure what the factor $1/\sqrt{d_k}$ does to random scores, plot the
effect (this is Figure 6.4), and print the tensor shapes of multi-head attention at a realistic
size. Everything is synthetic. The lab needs NumPy, PyTorch and matplotlib, downloads nothing and
takes about a minute of CPU time.

### Step 1: set up

Every lab in the series fixes its seeds first. NumPy's print options are set once so that
matrices appear with three decimals, the precision of the text.

```python
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F

np.random.seed(0)
torch.manual_seed(0)
rng = np.random.default_rng(0)           # used by the random experiments below
np.set_printoptions(precision=3, suppress=True)
print("torch", torch.__version__.split("+")[0], "| numpy", np.__version__)
```

```output
torch 2.14.1 | numpy 2.4.6
```

### Step 2: the worked example in NumPy

The three tokens of Section 3 are given as projected vectors, so there are no weights to learn
and no embeddings: $\mathbf{Q} = \mathbf{K}$ and $\mathbf{V}$ are typed in. Everything is
`float64`, so that rounding error is far below anything the text prints.

`softmax` subtracts the row maximum before exponentiating. That does not change the result
(numerator and denominator are both multiplied by $e^{-m}$) and it cannot overflow; Lab 3 returns
to this. `attention` returns the three matrices of the derivation, the scores $\mathbf{S}$, the
weights $\mathbf{P}$ and the output $\mathbf{O}$, and implements the causal mask by writing
$-\infty$ into every entry with $j > i$ before the softmax, so that those weights come out as
exactly zero.

```python
Q = np.array([[1., 0.], [0., 1.], [1., 1.]])
K = Q.copy()
V = np.array([[1., 0.], [0., 2.], [3., 3.]])


def softmax(s, axis=-1):
    """Row-wise softmax; subtracting the maximum keeps exp() from overflowing."""
    e = np.exp(s - s.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


def attention(Q, K, V, causal=True, scale=True):
    """Return scores S, weights P and output O = P V for one head, shapes (T, d)."""
    S = Q @ K.T
    if scale:
        S = S / np.sqrt(Q.shape[-1])
    if causal:
        S = np.where(np.tril(np.ones_like(S, dtype=bool)), S, -np.inf)
    P = softmax(S)
    return S, P, P @ V


S, P, O = attention(Q, K, V, causal=True, scale=True)
print("scores S (masked entries are -inf):")
print(S)
print("weights P:")
print(P)
print("output O:")
print(O)
```

```output
scores S (masked entries are -inf):
[[0.707  -inf  -inf]
 [0.    0.707  -inf]
 [0.707 0.707 1.414]]
weights P:
[[1.    0.    0.   ]
 [0.33  0.67  0.   ]
 [0.248 0.248 0.503]]
output O:
[[1.    0.   ]
 [0.33  1.34 ]
 [1.759 2.007]]
```

Row 1 is exactly $\mathbf{v}_1 = (1, 0)$, row 2 is $(0.330, 1.340)$ and row 3 is
$(1.759, 2.007)$: the numbers of Section 3, here with the exact weights.

### Step 3: the other three variants

The text also computed the unmasked and the unscaled cases. Four calls cover the 2 × 2 grid of
{causal, unmasked} × {scaled, unscaled}.

```python
for causal in (True, False):
    for scale in (True, False):
        _, P_, O_ = attention(Q, K, V, causal=causal, scale=scale)
        tag = f"{'causal  ' if causal else 'unmasked'} {'scaled  ' if scale else 'unscaled'}"
        print(tag, "O =", np.round(O_, 3).tolist())
        print(" " * 17, "row 3 weights", np.round(P_[2], 3).tolist())
```

```output
causal   scaled   O = [[1.0, 0.0], [0.33, 1.34], [1.759, 2.007]]
                  row 3 weights [0.248, 0.248, 0.503]
causal   unscaled O = [[1.0, 0.0], [0.269, 1.462], [1.94, 2.152]]
                  row 3 weights [0.212, 0.212, 0.576]
unmasked scaled   O = [[1.604, 1.599], [1.401, 2.006], [1.759, 2.007]]
                  row 3 weights [0.248, 0.248, 0.503]
unmasked unscaled O = [[1.689, 1.578], [1.422, 2.112], [1.94, 2.152]]
                  row 3 weights [0.212, 0.212, 0.576]
```

The unmasked and scaled case differs from the causal one only in rows 1 and 2, as the text
argued. Removing the scale changes row 3's weights from $(0.248, 0.248, 0.503)$ to
$(0.212, 0.212, 0.576)$, and its output moves from $(1.759, 2.007)$ towards
$\mathbf{v}_3 = (3, 3)$.

### Step 4: against PyTorch's fused kernel

`torch.nn.functional.scaled_dot_product_attention` (SDPA) is the function every model in this
module calls. It takes tensors of shape `(B, h, T, d_k)`, applies the $1/\sqrt{d_k}$ scale itself
and, with `is_causal=True`, the causal mask. On CPU it may use a fused kernel or the plain
formula; either way it must agree with Step 2. The comparison is the maximum absolute
difference over all entries.

```python
def to4(a):
    """(T, d) NumPy array -> (1, 1, T, d) float64 tensor: batch 1, one head."""
    return torch.tensor(a, dtype=torch.float64)[None, None]


q4, k4, v4 = to4(Q), to4(K), to4(V)
for causal in (True, False):
    ref = attention(Q, K, V, causal=causal, scale=True)[2]
    out = F.scaled_dot_product_attention(q4, k4, v4, is_causal=causal)[0, 0].numpy()
    print(f"is_causal={causal!s:5}  max |numpy - torch| = {np.abs(out - ref).max():.1e}")
```

```output
is_causal=True   max |numpy - torch| = 5.6e-17
is_causal=False  max |numpy - torch| = 0.0e+00
```

Agreement to better than $10^{-16}$, the rounding level of `float64`, means the hand calculation, the
formula and the fused kernel are one computation.

### Step 5: a padding mask

In a batch, sequences have different lengths and the short ones are padded. A **padding mask**
hides the padded keys, and it combines with the causal mask by logical AND: key $j$ is visible to
query $i$ if $j \le i$ *and* key $j$ is a real token. Here the example is stacked twice and the
third token of the second sequence is declared padding. SDPA takes a boolean `attn_mask` in which
`True` means "may attend", broadcast over the head axis, so its shape is `(B, 1, T, T)`.

```python
qb = to4(Q).expand(2, 1, 3, 2).clone()               # batch of two copies, (2, 1, 3, 2)
kb = qb.clone()
vb = to4(V).expand(2, 1, 3, 2).clone()
real = torch.tensor([[True, True, True], [True, True, False]])        # (B, T) keys
causal_mask = torch.tril(torch.ones(3, 3, dtype=torch.bool))          # (T, T)
mask = causal_mask[None, None] & real[:, None, None, :]               # (B, 1, T, T)
print("mask shape:", tuple(mask.shape))
print("second sequence's mask:")
print(mask[1, 0].int().numpy())

out = F.scaled_dot_product_attention(qb, kb, vb, attn_mask=mask)
print("sequence 1 output:")
print(out[0, 0].numpy())
print("sequence 2 output (row 3 is a padded query):")
print(out[1, 0].numpy())
```

```output
mask shape: (2, 1, 3, 3)
second sequence's mask:
[[1 0 0]
 [1 1 0]
 [1 1 0]]
sequence 1 output:
[[1.    0.   ]
 [0.33  1.34 ]
 [1.759 2.007]]
sequence 2 output (row 3 is a padded query):
[[1.   0.  ]
 [0.33 1.34]
 [0.5  1.  ]]
```

The first sequence is unchanged. In the second, rows 1 and 2 are unchanged too, because they
never saw token 3. Row 3 belongs to a padded position: its query still sees keys 1 and 2, so it
prints a perfectly reasonable $(0.500, 1.000)$. That is the trap of padding. A value exists for
the padded position and it looks plausible; only the loss mask keeps it out of training.

### Step 6: the softmax Jacobian of row 3

[Section 2](#s2) derived $\mathbf{J} = \operatorname{diag}(\mathbf{p}) - \mathbf{p}\mathbf{p}^\top$
for $\mathbf{p} = \operatorname{softmax}(\mathbf{s})$. Two properties are checked here: its rows
sum to zero (the weights always sum to 1, so no change of the scores can change that sum), and it
matches central finite differences,
$\partial p_i / \partial s_j \approx [p_i(\mathbf{s} + \epsilon\mathbf{e}_j) - p_i(\mathbf{s} -
\epsilon\mathbf{e}_j)]/(2\epsilon)$ with $\epsilon = 10^{-6}$.

```python
s3 = S[2]                                      # scaled scores of row 3: 0.707, 0.707, 1.414
p3 = softmax(s3)
J = np.diag(p3) - np.outer(p3, p3)
print("J = diag(p) - p p^T:")
print(J)
print("largest |row sum|:", f"{np.abs(J.sum(axis=1)).max():.1e}")

eps = 1e-6
J_fd = np.zeros((3, 3))
for j in range(3):
    step = np.zeros(3)
    step[j] = eps
    J_fd[:, j] = (softmax(s3 + step) - softmax(s3 - step)) / (2 * eps)
print(f"max |J - finite differences| = {np.abs(J - J_fd).max():.1e}")
```

```output
J = diag(p) - p p^T:
[[ 0.187 -0.062 -0.125]
 [-0.062  0.187 -0.125]
 [-0.125 -0.125  0.25 ]]
largest |row sum|: 2.8e-17
max |J - finite differences| = 4.9e-11
```

The residual, of order $10^{-11}$, is the truncation and rounding error of the finite differences,
not a defect of $\mathbf{J}$.

### Step 7: the gradient of Section 3, by autograd

Section 3 pushed $\mathcal{L} = o_{3,2}$ back by hand: $\partial\mathcal{L}/\partial\mathbf{q}_3 =
(0.001, 0.352)$, keys $(-0.352, -0.352)$, $(-0.001, -0.001)$ and $(0.354, 0.354)$, and the second
column of $\partial\mathcal{L}/\partial\mathbf{V}$ equal to row 3 of $\mathbf{P}$. Autograd
differentiates the fused kernel without being told any of this.

```python
Qt, Kt, Vt = (to4(a).requires_grad_() for a in (Q, K, V))
Ot = F.scaled_dot_product_attention(Qt, Kt, Vt, is_causal=True)
loss = Ot[0, 0, 2, 1]                      # second component of token 3's output
loss.backward()
print("loss =", f"{loss.item():.3f}")
print("dL/dQ:")
print(Qt.grad[0, 0].numpy())
print("dL/dK:")
print(Kt.grad[0, 0].numpy())
print("dL/dV:")
print(Vt.grad[0, 0].numpy())
```

```output
loss = 2.007
dL/dQ:
[[0.    0.   ]
 [0.    0.   ]
 [0.001 0.352]]
dL/dK:
[[-0.352 -0.352]
 [-0.001 -0.001]
 [ 0.354  0.354]]
dL/dV:
[[0.    0.248]
 [0.    0.248]
 [0.    0.503]]
```

Only the third row of $\mathbf{Q}$ receives gradient, because no other query influences
$o_{3,2}$. The gradient of $\mathbf{V}$ has an empty first column (the loss reads only the second
component) and its second column is $(0.248, 0.248, 0.503)$, the weights themselves.

### Step 8: why the scores are scaled

The variance argument of Section 2 says $\operatorname{Var}(\mathbf{q}\cdot\mathbf{k}) = d_k$ for
independent unit-variance entries. Here it is measured: 100,000 pairs of standard-normal vectors
for each of four head widths. The dot products are kept, because the first panel of Figure 6.4
needs them.

```python
dots = {}
print(f"{'d_k':>5} {'std(q.k)':>9} {'sqrt(d_k)':>10}")
for dk in (2, 16, 64, 128):
    q = rng.standard_normal((100_000, dk))
    k = rng.standard_normal((100_000, dk))
    dots[dk] = (q * k).sum(axis=1)
    print(f"{dk:>5} {dots[dk].std():>9.2f} {np.sqrt(dk):>10.2f}")
```

```output
  d_k  std(q.k)  sqrt(d_k)
    2      1.43       1.41
   16      3.99       4.00
   64      7.99       8.00
  128     11.33      11.31
```

Each measured spread is within about 1% of $\sqrt{d_k}$: the standard deviation of a raw score
grows with the head width.

### Step 9: saturation

What that growth does to a softmax is the next measurement. For $d_k = 128$, draw a query and 16
keys with standard-normal entries, 5,000 times. For each draw take the softmax of the 16 scores,
unscaled and divided by $\sqrt{128}$, and record the largest weight and the entropy
$H = -\sum_j p_j \ln p_j$, which is $\ln 16 = 2.77$ nats for a uniform row and 0 for a one-hot
row. The figure shows the two panels of Figure 6.4: the spread of raw scores, and the histogram
of the largest weight.

```python
dk, n_keys, n_draws = 128, 16, 5000
rng_sat = np.random.default_rng(0)                  # a fresh generator: the draw does not
qd = rng_sat.standard_normal((n_draws, dk))         # depend on how much Step 8 consumed
kd = rng_sat.standard_normal((n_draws, n_keys, dk))
raw = np.einsum("nd,nkd->nk", qd, kd)               # unscaled scores, (5000, 16)


def stats(scores):
    """Largest weight and entropy (nats) of the softmax of each row."""
    p = softmax(scores)
    entropy = -(p * np.log(p + 1e-300)).sum(axis=1)
    return p.max(axis=1), entropy


for name, sc in (("unscaled", raw), ("scaled", raw / np.sqrt(dk))):
    pmax, ent = stats(sc)
    print(f"{name:9s} median largest weight {np.median(pmax):.3f}   "
          f"mean entropy {ent.mean():.2f} nats   (uniform: {np.log(n_keys):.2f})")
    if name == "unscaled":
        print(f"{'':9s} share of rows with largest weight above 0.95: "
              f"{(pmax > 0.95).mean():.2f}")

fig, axes = plt.subplots(1, 2, figsize=(10, 3.6))
for dk_, colour in ((2, "tab:blue"), (16, "tab:orange"), (128, "tab:green")):
    axes[0].hist(dots[dk_], bins=np.linspace(-40, 40, 81), alpha=0.6, color=colour,
                 density=True, label=f"$d_k$ = {dk_}  (std {dots[dk_].std():.1f})")
axes[0].set_xlabel("score  q . k")
axes[0].set_ylabel("density")
axes[0].set_title("Spread of raw scores grows with $d_k$")
axes[0].legend()
for name, sc, colour in (("unscaled", raw, "tab:red"),
                         ("scaled by $1/\\sqrt{d_k}$", raw / np.sqrt(dk), "tab:blue")):
    pmax, _ = stats(sc)
    axes[1].hist(pmax, bins=np.linspace(0, 1, 41), alpha=0.6, color=colour,
                 label=f"{name} (median {np.median(pmax):.3f})")
axes[1].set_xlabel("largest softmax weight in the row")
axes[1].set_ylabel("number of draws")
axes[1].set_title("16 keys, $d_k$ = 128: saturation")
axes[1].legend(loc="upper center")
plt.tight_layout()
plt.show()
```

```output
unscaled  median largest weight 0.978   mean entropy 0.28 nats   (uniform: 2.77)
          share of rows with largest weight above 0.95: 0.58
scaled    median largest weight 0.225   mean entropy 2.35 nats   (uniform: 2.77)
```

Unscaled, the largest weight is close to 1 in most draws and the mean entropy is a tenth of the
uniform value: the softmax is nearly a hard lookup, and its Jacobian, which carries every
gradient to $\mathbf{W}_Q$ and $\mathbf{W}_K$, is nearly zero. Scaled, the rows are broad.

### Step 10: multi-head shapes

The text of [Section 4](#s4) follows a tensor of shape $(B, T, d)$ through the multi-head
computation. Here is the same path with $B = 2$, $T = 16$, $d = 256$ and $h = 8$ heads of width
$d_k = 32$. The projection produces `(B, T, d)`; `view` splits the last axis into heads;
`transpose(1, 2)` moves the head axis next to the batch axis, so that every matrix product acts on
the last two axes `(T, d_k)`. At the end the heads are merged by transposing back and reshaping.
The result is compared with SDPA on the same projected tensors.

```python
B, T, d, h = 2, 16, 256, 8
dk = d // h
x = torch.randn(B, T, d)
wq, wk, wv = (nn.Linear(d, d, bias=False) for _ in range(3))

q = wq(x).view(B, T, h, dk)
print("after the projection and view:", tuple(q.shape))
q = q.transpose(1, 2)
k = wk(x).view(B, T, h, dk).transpose(1, 2)
v = wv(x).view(B, T, h, dk).transpose(1, 2)
print("after transpose(1, 2):        ", tuple(q.shape))

scores = q @ k.transpose(-2, -1) / dk ** 0.5
print("scores:                       ", tuple(scores.shape))
causal_mask = torch.tril(torch.ones(T, T, dtype=torch.bool))
weights = scores.masked_fill(~causal_mask, float("-inf")).softmax(dim=-1)
per_head = weights @ v
print("per-head output:              ", tuple(per_head.shape))
merged = per_head.transpose(1, 2).reshape(B, T, d)
print("merged:                       ", tuple(merged.shape))

fused = F.scaled_dot_product_attention(q, k, v, is_causal=True)
print(f"max |explicit - fused| = {(per_head - fused).abs().max().item():.1e}")
```

```output
after the projection and view: (2, 16, 8, 32)
after transpose(1, 2):         (2, 8, 16, 32)
scores:                        (2, 8, 16, 16)
per-head output:               (2, 8, 16, 32)
merged:                        (2, 16, 256)
max |explicit - fused| = 2.4e-07
```

The explicit softmax and the fused kernel agree to `float32` rounding, about $10^{-7}$. That is a
different precision from the $10^{-16}$ of the earlier steps, which is why those steps use
`float64`.

### What you should see

- The NumPy and PyTorch outputs agree to better than $10^{-16}$ in `float64`. The hand calculation, the
  formula and the fused kernel are one computation.
- Every output row is a convex combination of the value rows it may see. With the mask, row 1 is
  exactly $\mathbf{v}_1$ whatever $\mathbf{Q}$ and $\mathbf{K}$ are.
- Removing the scale sharpens every row. Row 3's largest weight rises from 0.503 to 0.576. At
  $d_k = 128$ the unscaled softmax is close to one-hot in most draws, so its Jacobian, and the
  gradient reaching $\mathbf{W}_Q$ and $\mathbf{W}_K$, nearly vanish.
- The gradient with respect to the row-3 scores sums to zero, and only $\mathbf{q}_3$, the keys
  and the second column of $\mathbf{V}$ receive gradient from $\mathcal{L} = o_{3,2}$.

### Try this

1. Multiply `Q` by 10 and rerun Step 2. Row 3 approaches $(0, 0, 1)$ and its output approaches
   $\mathbf{v}_3 = (3, 3)$: the hard-lookup limit of [Section 1](#s1). What happens to the
   Jacobian of Step 6?
2. Mask every key of one query (a fully padded row) and observe the result of your NumPy
   `softmax`, which subtracts $-\infty$ from $-\infty$, and of SDPA. Then write a guard that
   returns zeros for such a row.
3. Write multi-head attention with an explicit Python loop over the heads and check it against
   the batched version of Step 10 to $10^{-6}$.
