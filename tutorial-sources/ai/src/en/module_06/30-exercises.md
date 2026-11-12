## Exercises {#exercises}

Use natural logarithms and count one multiply-add as two FLOPs. The calculations use
the conventions of [Section 11](#s11). Attempt each exercise before opening its solution.

::: exercise id=e1 level=1 kind=conceptual minutes=5
Explain why the first causal attention output is exactly the first value vector for
any finite query and key. What information can its next-token prediction use?
:::

::: solution
Only the first key is visible. Softmax over its single score is $e^s/e^s=1$, so the
output is $\mathbf{v}_1$. Every later layer at that position has the same information
boundary. Its prediction can depend on the first token and positional information,
but cannot use any later token. This does not force a particular loss: an initial
token could make its successor highly predictable in some sources.
:::

::: exercise id=e2 level=2 kind=calculation minutes=10
Extend the three-token example with $\mathbf{q}_4=\mathbf{k}_4=(1,-1)$. Remove the
causal mask and use the four-by-four identity as the value matrix. Calculate each output
row to three decimals. Explain the effect on the first three rows and the weight of an
orthogonal key. Which rows would remain unchanged if the mask were restored?
:::

::: solution
The unscaled score rows are $(1,0,1,1)$, $(0,1,1,-1)$, $(1,1,2,0)$ and $(1,-1,0,2)$.
Divide each by $\sqrt2$. The four possible exponentials are $1$, $e^{1/\sqrt2}=2.028115$,
$e^{-1/\sqrt2}=0.493069$ and $e^{\sqrt2}=4.113250$. Normalising each row gives

$$
\mathbf{P}\approx\begin{pmatrix}
0.286&0.141&0.286&0.286\\
0.180&0.365&0.365&0.089\\
0.221&0.221&0.449&0.109\\
0.266&0.065&0.131&0.539
\end{pmatrix}.
$$

Because $\mathbf{V}=\mathbf{I}$, $\mathbf{O}=\mathbf{P}$. The fourth key adds a
positive exponential to every unmasked denominator, changing every earlier row.
It is orthogonal to query three yet receives weight 0.109: a zero score has exponential
one, rather than zero. With the causal mask, rows one through three cannot see key four
and retain their previous weights, padded by a zero fourth component.
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
Describe what unscaled dot products of independent unit-variance queries and keys do
at head width 128. Explain the consequence for learning query and key projections.
:::

::: solution
Their variance is 128 and standard deviation $\sqrt{128}=11.31$. Such large random
score gaps can make softmax nearly one-hot. Its Jacobian entries $p_i(1-p_i)$ and
$-p_i p_j$ then become small, reducing the score gradients that reach query and key
projections. Dividing scores by $\sqrt{128}$ restores unit variance under the stated
independence assumptions. It does not force trained scores to remain unit-variance.
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
Let $\mathbf{P}$ be a permutation matrix. Prove that unmasked self-attention without
positions obeys $\operatorname{Attention}(\mathbf{P}\mathbf{X})=
\mathbf{P}\operatorname{Attention}(\mathbf{X})$. Also prove that jointly permuting
keys and values leaves outputs fixed when queries are fixed. Does a fixed causal mask
preserve the first identity for arbitrary permutations?
:::

::: solution
Linear projection gives $\mathbf{Q}'=\mathbf{P}\mathbf{Q}$,
$\mathbf{K}'=\mathbf{P}\mathbf{K}$ and $\mathbf{V}'=\mathbf{P}\mathbf{V}$.
Thus the scores become $\mathbf{S}'=\mathbf{P}\mathbf{S}\mathbf{P}^{\top}$.
Permuting rows reorders independent softmax computations. Permuting columns reorders
each row's exponentials without changing its denominator. Consequently,
$\softmax(\mathbf{S}')=\mathbf{P}\softmax(\mathbf{S})\mathbf{P}^{\top}$ and

$$
\mathbf{O}'=\mathbf{P}\softmax(\mathbf{S})\mathbf{P}^{\top}
\mathbf{P}\mathbf{V}=\mathbf{P}\mathbf{O}.
$$

With fixed queries and jointly permuted keys/values, the scores are
$\mathbf{S}\mathbf{P}^{\top}$. Their softmax is
$\softmax(\mathbf{S})\mathbf{P}^{\top}$, and multiplication by
$\mathbf{P}\mathbf{V}$ cancels the permutation. A fixed causal mask is different:
it is tied to sequence indices and generally does not equal its permuted version.
Therefore arbitrary permutations do not preserve the masked identity. Unmasked
attention without position information is equivariant to token order; position
encodings or an order-dependent mask supply information that the content set lacks.
:::

::: exercise id=e5 level=1 kind=conceptual minutes=5
Write the pre-norm and post-norm residual updates. Identify the direct identity path
and describe what it does, and does not, imply about gradients through many layers.
:::

::: solution
Pre-norm is $\mathbf{x}_{\ell+1}=\mathbf{x}_{\ell}+
F_{\ell}(\operatorname{Norm}(\mathbf{x}_{\ell}))$. Post-norm is
$\mathbf{x}_{\ell+1}=\operatorname{Norm}(\mathbf{x}_{\ell}+F_{\ell}(\mathbf{x}_{\ell}))$.
The pre-norm Jacobian is an identity plus the sublayer derivative. A direct residual
route crosses no intermediate normalisation Jacobians. In post-norm those Jacobians
also act on the residual route. Pre-norm therefore supplies a simpler gradient path,
but does not guarantee that all gradients are bounded or nonzero: branches can be
poorly scaled or cancel. A final output norm also has its own derivative.
:::

::: exercise id=e6 level=2 kind=derivation minutes=10
Write RoPE as a block-diagonal matrix of two-dimensional rotations. Prove the
relative-position dot-product identity and norm preservation. Explain what happens
to the output if values are also rotated at their absolute positions.
:::

::: solution
For pair frequency $\theta_i$, use

$$
\mathbf{R}(a)=\begin{pmatrix}\cos a&-\sin a\\\sin a&\cos a\end{pmatrix},
\qquad \mathbf{R}_t=\operatorname{diag}
(\mathbf{R}(t\theta_0),\ldots,\mathbf{R}(t\theta_{d_k/2-1})).
$$

Multiplying two blocks and using the angle-addition formulas gives
$\mathbf{R}(a)\mathbf{R}(b)=\mathbf{R}(a+b)$. Transposition gives
$\mathbf{R}(a)^{\top}=\mathbf{R}(-a)$. Hence block by block,
$\mathbf{R}_t^{\top}\mathbf{R}_s=\mathbf{R}_{s-t}$ and
$(\mathbf{R}_t\mathbf{q})^{\top}(\mathbf{R}_s\mathbf{k})
=\mathbf{q}^{\top}\mathbf{R}_{s-t}\mathbf{k}$.
Also $\mathbf{R}_t^{\top}\mathbf{R}_t=\mathbf{I}$, so
$\|\mathbf{R}_t\mathbf{q}\|^2=\mathbf{q}^{\top}\mathbf{q}$.
Rotated values would give $\mathbf{o}_t=\sum_s p_{ts}\mathbf{R}_s\mathbf{v}_s$.
A common shift by $c$ leaves the weights unchanged but transforms the output into
$\mathbf{R}_c\mathbf{o}_t$. The score remains relative, while the output coordinates
carry an absolute rotation. Ordinary RoPE leaves values unrotated.
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
A model has learned absolute positions for only 1024 positions and receives 2000
tokens. Contrast its failure with a RoPE model trained at length 1024.
:::

::: solution
An embedding table of exactly 1024 rows cannot index later positions. A larger table
with untrained later rows avoids the index error but does not give learned positional
representations there. RoPE defines rotations beyond the training length, so it can
execute. However, longer relative offsets expose untrained angular combinations and
more competing keys. Mathematical definition beyond 1024 does not establish reliable
long-context performance; extension requires suitable training and evaluation.
:::

::: exercise id=e8 level=1 kind=conceptual minutes=5
Give two reasons a bidirectional masked-language model is not immediately a
left-to-right next-token generator.
:::

::: solution
Its objective predicts selected missing tokens using context on both sides, rather
than every successor from a prefix. Generation lacks that right-hand context. Its
ordinary unmasked-position logits also were not trained as next-token distributions.
One can build iterative masked-token generation or adapt the objective, but neither
is the unchanged causal next-token procedure used here.
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
Compare 32-query-head, eight-KV-head GQA with full multi-head attention at the same
width and depth. State which projections and stored inference tensors shrink by
four, and which leading compute terms remain unchanged.
:::

::: solution
Key and value projection output widths shrink from $d$ to $d/4$, so each has a
quarter of its previous weights. Retained keys and values also shrink fourfold.
Query/output projections and the FFN remain unchanged. Every query head still scores
every visible key and mixes a value vector, so leading query-key and probability-value
FLOPs remain unchanged. Overall compute still falls somewhat because key/value
projection work is smaller.
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
Explain why replacing dense attention with FlashAttention preserves a trained model's
function, while adding a sliding window generally changes it.
:::

::: solution
FlashAttention computes the same visible scores, softmax and weighted sum in tiles;
only floating-point ordering and execution details differ. A sliding window removes
visible keys and changes both the softmax denominator and weighted sum. A full-attention
checkpoint therefore needs adaptation and evaluation for the proposed window, rather
than treating the change as an equivalent kernel substitution.
:::

::: exercise id=e11 level=2 kind=calculation minutes=10
Process scores $(2,1,3,0)$ and scalar values $(1,2,3,4)$ in two blocks of two.
Calculate the running maximum, normaliser and accumulator after each block. Check
the output against a direct softmax-weighted average.
:::

::: solution
After block one, $m=2$, $\ell=1+e^{-1}=1.367879$ and
$a=1+2e^{-1}=1.735759$. Block two raises the maximum to 3, requiring old contributions
to be multiplied by $e^{-1}$. Then

$$
\begin{aligned}
\ell'&=(1+e^{-1})e^{-1}+1+e^{-3}=1.553002,\\
a'&=(1+2e^{-1})e^{-1}+3+4e^{-3}=3.837698.
\end{aligned}
$$

Their ratio is approximately 2.471. Direct exponentials on the maximum-three scale
are $(e^{-1},e^{-2},1,e^{-3})$. Their sum is the same $\ell'$ and their value-weighted
sum is $e^{-1}+2e^{-2}+3+4e^{-3}=a'$. This checks the result without rounding weights
before multiplication.
:::

::: exercise id=e12 level=2 kind=calculation minutes=10
Count a tied decoder with vocabulary 4096, width 256, four layers, eight query heads,
two KV heads, FFN width $\lfloor8(256)/3\rfloor$ and bias-free RMSNorm. Itemise
each component and explain its departure from $12Ld^2$.
:::

::: solution
The head width is 32 and KV projection width 64. The tied vocabulary table has
$4096(256)=1{,}048{,}576$ parameters. Per layer, query/output matrices contain
$2(256^2)=131{,}072$ and key/value matrices $2(256)(64)=32{,}768$, giving attention
163,840. FFN width is 682, so its three matrices contain $3(256)(682)=523{,}776$.
Two norms add 512. One layer has 688,128; four have 2,752,512. Add 256 final-norm
gains and the vocabulary table to obtain **3,801,344**.

The rule $12Ld^2=3{,}145{,}728$ excludes embeddings and assumes full multi-head
attention. GQA saves 98,304 per layer. Rounding FFN width saves another 512 per layer,
while two norms add 512 back. Thus blocks total $3{,}145{,}728-4(98{,}304)
=2{,}752{,}512$. Embeddings and final norm account for the remaining difference.
:::

::: exercise id=e13 level=2 kind=calculation minutes=15
Use the Llama-2-7B-shaped counts from Section 11, two trillion training tokens,
sequence length 4096 and a supplied budget of 184,320 GPU-hours. Compute model FLOPs
with $6N_{\text{total}}D$ and with the series convention. Convert each to sustained
FLOP/s per GPU and utilisation against a supplied 312 TFLOP/s peak. Explain what
this utilisation estimate omits.
:::

::: solution
Set $N_{\text{total}}=6{,}738{,}415{,}616$ and
$N_{\text{matmul}}=6{,}607{,}343{,}616$. The quick count is
$6N_{\text{total}}D=8.08610\times10^{22}$ FLOPs.
The weight term is $7.92881\times10^{22}$ and the causal attention term
$6(32)(4096)(4096)(2\times10^{12})=6.44245\times10^{21}$.
Their sum is $8.57306\times10^{22}$ FLOPs.

The supplied GPU-hours equal $184{,}320(3600)=663{,}552{,}000$ GPU-seconds.
Dividing gives approximately $1.219\times10^{14}$ and $1.292\times10^{14}$
FLOP/s per GPU. Divide by $312\times10^{12}$ to get 39.1% and 41.4% model
FLOP utilisation. The quick count charges lookup weights and omits attention;
those errors partly cancel, leaving it 5.7% low here. Neither model count includes
checkpoint recomputation, optimiser operations, evaluation, downtime or communication.
This is model FLOP utilisation, rather than a direct hardware activity measurement.
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
Training and validation losses fall to 0.02 nats per character unusually quickly.
Name two leakage bugs and an intervention that tests the information boundary.
:::

::: solution
A missing/reversed causal mask exposes successor tokens. Unshifted targets ask the
model to reproduce its current input. Inspect input/target pairs, then change a future
token while keeping the prefix fixed. In a causal next-token model, earlier logits
must remain unchanged. Prefix-only evaluation and generation supply independent checks.
Low held-out window loss alone does not distinguish either bug from successful learning.
:::

::: exercise id=e15 level=3 kind=coding minutes=25
Implement explicit causal attention and compare its outputs with PyTorch SDPA.
For batch one, eight heads, head width 64 and float32, calculate score storage at
lengths 512, 2048 and 4096 and time both implementations. Optionally compare GPU
peak allocated memory at 512, 2048 and 8192, reporting the selected backend.
:::

::: solution
The explicit implementation below is self-contained. Numerical comparison is performed
before timing; timing excludes random input construction. A warmup avoids charging
one implementation for first-call setup alone. Results remain machine-dependent.

```python
import time
import torch
import torch.nn.functional as F

torch.manual_seed(0)
torch.set_num_threads(4)


def explicit(q, k, v):
    T = q.shape[-2]
    future = torch.ones(T, T, dtype=torch.bool, device=q.device).triu(1)
    scores = q @ k.transpose(-1, -2) / q.shape[-1] ** 0.5
    return scores.masked_fill(future, -torch.inf).softmax(-1) @ v


def fused(q, k, v):
    return F.scaled_dot_product_attention(q, k, v, is_causal=True)


with torch.no_grad():
    for T in (512, 2048, 4096):
        q, k, v = (torch.randn(1, 8, T, 64) for _ in range(3))
        reference, actual = explicit(q, k, v), fused(q, k, v)
        error = (reference - actual).abs().max().item()
        assert error < 1e-5
        print(f"T={T}: score storage {8 * T * T * 4 / 2**20:.0f} MiB, "
              f"max difference {error:.2e}")
        for name, function in (("explicit", explicit), ("SDPA", fused)):
            function(q, k, v)
            started = time.perf_counter()
            for _ in range(3):
                function(q, k, v)
            print(f"  {name}: {(time.perf_counter() - started) / 3:.4f} s")
```

The score tensors alone contain 8, 128 and 512 MiB. At 8192 positions they contain
2 GiB. The explicit implementation also holds softmax output and temporaries, so
peak memory exceeds the score tensor's size. SDPA's memory depends on its selected
implementation, rather than the function name alone.

For an optional GPU experiment, allocate inputs before resetting peak statistics.
Measure incremental live allocation, synchronising around timing and memory queries.
Large explicit runs may exceed available memory; an out-of-memory result is a capacity
measurement, not a failed correctness test.

```python norun
from torch.nn.attention import SDPBackend, sdpa_kernel

for T in (512, 2048, 8192):
    q, k, v = (torch.randn(1, 8, T, 64, device="cuda", dtype=torch.float16)
               for _ in range(3))
    for name, function in (("explicit", explicit), ("FlashAttention SDPA", fused)):
        torch.cuda.synchronize()
        baseline = torch.cuda.memory_allocated()
        torch.cuda.reset_peak_memory_stats()
        with torch.no_grad(), sdpa_kernel(SDPBackend.FLASH_ATTENTION):
            result = function(q, k, v)
        torch.cuda.synchronize()
        extra = torch.cuda.max_memory_allocated() - baseline
        print(T, name, "incremental peak MiB", extra / 2**20)
        del result
```

The explicit branch ignores the backend selection; the SDPA branch requires a supported
FlashAttention backend. A backend error should be reported rather than silently replaced
by a different implementation. Restore the fused call in the decoder after comparison.
:::
