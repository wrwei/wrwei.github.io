## Exercises {#exercises}

Use decimal GB and the series' labelled compute conventions. For scaling-law
questions, counts are raw parameters and tokens and the fit uses $C_6=6ND$.
For the case-study hardware budget, include the context-dependent attention term.

::: exercise id=e1 level=1 kind=conceptual minutes=5
Name four decisions to fix before pretraining because changing them later requires
discarding work, a migration or a revised run plan. Name one decision that can
change for future updates, and explain the distinction.
:::

::: solution
The tokenizer fixes the meaning of every embedding/output row and every token
in the stored shards; a new mapping requires retokenisation and an embedding
transition. Model shape fixes tensor dimensions and connectivity; changing width,
depth or vocabulary requires weight transfer or a new model, rather than loading
the same checkpoint unchanged. Filters and deduplication fix which already-seen
data influenced the weights; removing documents later does not undo those updates.
A warmup-cosine horizon fixes when the rate decays; extending the run requires a
deliberate new schedule, and shortening it can stop before annealing finishes.

Future data-mixture weights can change at a documented phase boundary. Batch
size, checkpoint interval and parallel layout can also change with appropriate
state migration. The distinction is whether a change concerns future work or
invalidates an assumption about the work already completed. None of the first
four makes all later change impossible; each adds a cost that belongs in the plan.
:::

::: exercise id=e2 level=2 kind=calculation minutes=10
With $C_6=10^{21}$ FLOPs and twenty tokens per parameter, calculate $N$, $D$ and
the loss from $1.69+406.4/N^{0.34}+410.7/D^{0.28}$. Repeat for a model one quarter
as large on four times the tokens. What does this buy at inference?
:::

::: solution
Substituting $D=20N$ gives $C_6=120N^2$, hence

$$
N=\sqrt{10^{21}/120}=2.8868\times10^9,\qquad
D=5.7735\times10^{10}.
$$

The two reducible loss terms are 0.24684 and 0.39840, so the fitted loss is
$1.69+0.24684+0.39840=2.33524$ nats per token. The alternative is
$N'=7.2169\times10^8$ and $D'=2.3094\times10^{11}$, with the same $6N'D'$.
Its terms are 0.39547 and 0.27024, giving 2.35571, worse by 0.02047 nats,
or about 0.88% of the original total loss. Its predicted perplexity is about
$e^{0.02047}-1=2.07\%$ higher.

Under the approximate $2N$ serving charge it uses a quarter of the model
arithmetic per token, and at equal weight precision a quarter of the weight
storage. Attention, batching and bandwidth can change the latency relationship.
Twenty tokens per parameter is a heuristic allocation; the fitted law's own
minimum at this budget is about 1.82B parameters on 91.4B tokens, loss 2.329.
These fitted losses refer to the fitting distribution and tokenizer, not an
assurance-task score.
:::

::: exercise id=e3 level=2 kind=calculation minutes=10
A team has 64 H100s for 30 days, using the assumed dense bf16 peak of
989 TFLOP/s per GPU and 38% MFU. How many tokens fit for the exact case-study
shape at context 8,192? Use $N=9{,}550{,}729{,}216$,
$N_{\text{matmul}}=8{,}927{,}875{,}072$, $L=36$, $d=4096$ and
$6N_{\text{matmul}}+6LTd$ FLOPs per token. What schedule error would the
$6N$ shortcut cause?
:::

::: solution
Available model compute is

$$
C=64(30)(86400)(0.38)(989\times10^{12})
=6.23440\times10^{22}\ \text{FLOPs}.
$$

The weight term is $6N_{\text{matmul}}=53{,}567{,}250{,}432$ and the
attention term $6(36)(8192)(4096)=7{,}247{,}757{,}312$ FLOPs per token.
Total: 60,815,007,744. Dividing gives $D=1.02514\times10^{12}$ tokens,
or 107.34 tokens per parameter, about half the 2T-token plan.

The shortcut gives $D_6=C/(6N)=1.08795\times10^{12}$, about 6.13% too many
tokens. Training that many at the assumed sustained rate would take 31.84 days.
A cosine schedule planned to finish at $D_6$ would therefore be stopped before
its final decay point at day 30. Plan against the architecture-aware count,
then monitor actual throughput, downtime and completed tokens.
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
Derive ideal MinHash-LSH candidate probability for $b$ bands of $r$ rows. Using
at most 128 hashes, find all integer choices that catch $J\ge0.85$ with probability
at least 0.95 and propose $J\le0.5$ with probability at most 0.05. Which uses
the fewest hashes?
:::

::: solution
An ideal independent MinHash row agrees with probability $J$. All $r$ rows
in one band agree with probability $J^r$. Independence across disjoint bands
gives no matching band with probability $(1-J^r)^b$, so

$$
P_{\text{candidate}}(J)=1-(1-J^r)^b.
$$

This is increasing in $J$, so it suffices to check the two boundary similarities.
Enumerate the finite integer search space:

```python
def probability(J,b,r):
    return 1-(1-J**r)**b

feasible = [(b,r) for r in range(1,129) for b in range(1,129//r+1)
            if probability(.85,b,r)>=.95 and probability(.5,b,r)<=.05]
print(feasible)
print("Fewest hashes:",min(feasible,key=lambda pair:pair[0]*pair[1]))
```

The feasible pairs are $(10,8),(11,8),(12,8),(13,8),(12,9),(13,9),(14,9)$.
The smallest signature has 80 values: $b=10,r=8$, with probabilities 0.95847
at 0.85 and 0.03838 at 0.5. If the low-similarity limit becomes 0.6, the same
search returns no feasible pair within 128 hashes. This result is an ideal
probability statement, not a guarantee for every pair under the approximate
universal-hash implementation of Lab 1.
:::

::: exercise id=e5 level=1 kind=conceptual minutes=5
C4's cleaning discarded pages containing a curly bracket. Why does that remove
much source code, and how should a corpus intended to teach code handle it?
:::

::: solution
Braces occur in block syntax, JSON, CSS and templates, so an indiscriminate rule
removes useful code alongside web scripting and boilerplate. Keep code as a
separately curated source: check provenance and licences, file types, generated
and minified files, lengths, secrets and duplicates using rules suitable for
repositories. Choose its mixture weight explicitly. Audit code loss and tasks
after changing the pipeline; an English-prose filter is not automatically a
code-quality filter. Some languages use indentation instead of braces, so the
rule also creates a language-dependent selection bias.
:::

::: exercise id=e6 level=1 kind=conceptual minutes=5
A 2T-token run gives a 15B-token mathematics source a 3% share. How often is that
source seen? What changes if its weight doubles, and what three alternatives
could increase mathematics exposure?
:::

::: solution
The source contributes $0.03(2\times10^{12})=60$B tokens, four times its 15B
size. Doubling the share gives 120B tokens, or eight epochs. Muennighoff et al.'s
data-constrained experiments found diminishing value from additional repeated
data, with early repetitions more useful than later ones. Four epochs is a
rough experimental regime, not a universal threshold at which learning stops.
Eight exposures do not supply eight times the independent information and
can increase memorisation.

Obtain more distinct mathematical text with compatible rights and provenance;
generate additional problems whose solutions are checked; or concentrate the
extra share in a shorter later phase so that the total additional repetitions
are limited. Related code and scientific sources are another possible source
of transfer. Measure held-out mathematics loss and task performance, and keep
problem families out of both training and evaluation.
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
Show that adding a common constant to logits leaves cross-entropy unchanged.
Derive the gradient of $\lambda(\log Z)^2$ and explain why it can help numerical
stability. Does every bf16 run necessarily need this auxiliary loss?
:::

::: solution
For a target $y$, cross-entropy is $-z_y+\log\sum_j e^{z_j}$. Replacing every
$z_j$ with $z_j+c$ produces $-(z_y+c)+c+\log\sum_j e^{z_j}$, leaving the same
loss and probabilities. This symmetry does not fix the common logit level.
Because $\partial\log Z/\partial z_j=p_j$,

$$
\frac{\partial}{\partial z_j}\lambda(\log Z)^2
=2\lambda\log Z\,p_j.
$$

For positive $\log Z$, gradient descent pulls the normaliser down; a negative
value reverses that pull. In bf16, spacing grows with magnitude: near 30 it is
0.125, so shifted logits can lose meaningful small differences. Stable
log-sum-exp avoids directly overflowing exponentials, but it cannot recover
differences already rounded away. Z-loss targets this drift. It is a recipe
choice to test, not a requirement of all bf16 training, and it does not bound
attention logits inside the model.
:::

::: exercise id=e8 level=2 kind=derivation minutes=10
Starting from $\Delta\mathcal L_{\text{opt}}(B)=\Delta\mathcal L_{\max}/
(1+B_{\text{noise}}/B)$, derive the step/token trade-off for reaching a fixed loss.
Evaluate $S/S_{\min}$ and $D/D_{\min}$ at batches 1M and 6M tokens when
$B_{\text{noise}}=3$M tokens.
:::

::: solution
If the optimal progress per step is smaller by the given factor, the number
of steps is $S=S_{\min}(1+B_{\text{noise}}/B)$. Tokens are $D=SB$, hence
$D=S_{\min}(B+B_{\text{noise}})$. Taking the small-batch limit defines
$D_{\min}=S_{\min}B_{\text{noise}}$, and therefore

$$
\frac D{D_{\min}}=1+\frac B{B_{\text{noise}}},\qquad
\left(\frac S{S_{\min}}-1\right)
\left(\frac D{D_{\min}}-1\right)=1.
$$

At 1M, the step ratio is $1+3/1=4$ and the token ratio $1+1/3=1.333$.
At 6M they are $1+3/6=1.5$ and $1+6/3=3$. Larger batches use fewer updates
but more tokens under this local model. Wall-clock benefit also depends on
hardware utilisation, communication and the allowed learning rate; the noise
scale can change during training.
:::

::: exercise id=e9 level=2 kind=calculation minutes=10
For the Llama 3 8B shape, use $N=8{,}030{,}261{,}248$, $L=32$, $d=4096$,
$h_{\text{kv}}=1024$, $d_{\text{ff}}=14336$, $V=128256$. On eight 80 GB GPUs,
each with one 8,192-token sequence, calculate DP/ZeRO model states, activations
with and without full checkpointing, and fp32 logits. Which estimated totals fit?
:::

::: solution
Under the stated 16-byte Adam accounting, states are $16N$, $4N+12N/8$,
$2N+14N/8$ and $16N/8$. Per-token-per-layer saved activations are
$12(4096)+4(1024)+6(14336)=139264$ bytes. Multiplying by $8192(32)$ gives
36.508 GB. Full checkpointing stores $2dTL=2.147$ GB of layer inputs and needs
$139264(8192)=1.141$ GB for one recomputed layer, total 3.288 GB.
Fp32 logits take $4TV=4.203$ GB.

| Layout | States (GB) | Total without checkpointing | Total with checkpointing |
|---|---:|---:|---:|
| DP | 128.484 | 169.194 | 135.975 |
| ZeRO-1 | 44.166 | 84.876 | 51.657 |
| ZeRO-2 | 30.113 | 70.823 | 37.605 |
| ZeRO-3 | 16.061 | 56.770 | 23.552 |

ZeRO-2 and ZeRO-3 pass the simplified 80 GB bound without checkpointing; all
three stages pass with it. DP fails either way. Runtime buffers, communication
and a memory allowance can invalidate a close fit. The case study's wider FFN
and larger parameter/vocabulary counts put ZeRO-2 at about 83.7 GB without
checkpointing, above the bound. A sharding stage's name alone does not determine
whether a particular model fits.
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
A GPipe schedule spends one third of its wall time in its idealised pipeline
bubble. Give three changes that shrink the bubble and their costs.
:::

::: solution
Increase micro-batches $m$: the idle fraction $(p-1)/(m+p-1)$ falls, but smaller
micro-batches can reduce kernel efficiency, and increasing the global batch can
exceed its useful noise scale. GPipe also holds many activations until backward;
1F1B reduces that memory burden. Interleave virtual stages: the idealised bubble
shrinks with the number of virtual stages, at the cost of more messages and
scheduling complexity. Reduce physical stages $p$: each GPU must hold and
compute more layers, so recover memory through sharding, checkpointing or
tensor parallelism. These formulas assume balanced stages; fix a slow stage
before expecting a scheduling change to deliver its ideal benefit.
:::

::: exercise id=e11 level=1 kind=conceptual minutes=5
Training loss has a sawtooth with exactly a 1,000-step period, absent from the
logged learning-rate schedule. Give two plausible causes and cheap checks.
:::

::: solution
First, an ordered loader may cycle through differently distributed shards.
Log shard id, offset, source, document length and sampling position, then align
the loss with the cycle. Shuffle across shards or randomise their order to test
the explanation. Second, a periodic evaluation or checkpoint action may change
training state: leaving `model.eval()` active, consuming the training generator,
or resetting a loader. Log `model.training`, sampler state hashes and offsets
immediately before/after the periodic action; run it once outside the scheduled
step as a control. These are hypotheses, not a diagnosis from the loss plot
alone. Check that the logged rate is the rate actually applied to every group.
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
Checkpoint writes take two minutes. Explain why a fixed interval of 5,000 steps
ignores the failure rate. Under Young's approximation, how does the optimal
interval change if the cluster grows tenfold and failures scale with GPU count?
What does asynchronous checkpointing change?
:::

::: solution
For a blocking write time $\delta$, interval $\tau$ and mean time between job
failures $M$, fractional overhead is approximately

$$
H(\tau)=\frac\delta\tau+\frac\tau{2M}.
$$

The first term is writing time; the second is the average half-interval of lost
work per failure. Differentiating gives $-\delta/\tau^2+1/(2M)=0$, or
$\tau^*=\sqrt{2\delta M}$. Use elapsed time, not a step count whose duration
may change. If $M'=M/10$, then $\tau'^*=\tau^*/\sqrt{10}$, about 0.316 of
the old interval. At the optimum $H^*=\sqrt{2\delta/M}$, so minimum overhead
grows by $\sqrt{10}$.

An asynchronous writer can reduce the blocking part of $\delta$, shortening
the preferred interval. Its state copy must be consistent, and recovery can
use only the latest fully durable checkpoint. Background write latency, bandwidth
contention and failures while a write is pending still belong in the operational
model; substituting host-copy time is only a first approximation.
:::

::: exercise id=e13 level=2 kind=calculation minutes=10
Starting at 0.5, add $10^{-3}$ to a bf16 weight. Repeat with $3\times10^{-3}$.
What happens after ten successive $10^{-3}$ additions directly to bf16, and
after ten fp32 master-weight additions followed by a bf16 copy?
:::

::: solution
In $[0.5,1)$, spacing is $0.5(2^{-7})=2^{-8}=0.00390625$, with half-spacing
0.001953125. Thus 0.501 rounds to 0.5, while 0.503 rounds to 0.50390625.
Ten separate small additions each vanish from the bf16 value, leaving 0.5.
The fp32 master accumulates approximately 0.510000, whose bf16 copy is 0.51171875.
Its error is within half a bf16 spacing, while direct bf16 accumulation lost
the entire intended update. Verify with actual tensor arithmetic:

```python
import torch
weight = torch.tensor(.5,dtype=torch.bfloat16)
master = torch.tensor(.5,dtype=torch.float32)
print(float(weight+.001),float(weight+.003))
for _ in range(10):
    weight += .001
    master += .001
print(float(weight),float(master),float(master.to(torch.bfloat16)))
```

For a subtractive update, spacing changes below the binade boundary at 0.5;
the exercise specifies addition to avoid that different rounding calculation.
Fp32 updates/master weights address the accumulation error. Other designs can
use stochastic rounding or compensation, but require their own verification.
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
Continued pretraining lowers domain perplexity by 20% but raises general loss
by 0.15 nats and costs three points on a general benchmark battery. Give two
recipe changes, their expected effects and the acceptance decision.
:::

::: solution
Increase general replay: more general gradients should reduce forgetting, while
the same total token budget supplies fewer domain tokens and can reduce the
domain gain. Lower the peak rate or shorten the run: less weight movement should
limit general degradation, but can slow adaptation. These are hypotheses to
check with both held-out distributions and the task battery; benchmark changes
need paired uncertainty estimates.

Compare results with limits declared before the run. A 20% perplexity reduction
is $-\log(0.8)=0.2231$ nats of domain improvement, using the same tokenizer.
It does not justify accepting the three-point cost if the general gate forbids
it. If no recipe passes, keep the original checkpoint and consider a narrower
adaptation method or task-specific SFT in Module 09.
:::

::: exercise id=e15 level=3 kind=project minutes=30
At laptop scale, (a) log fixed-batch validation every 25 steps of the full Lab 2
run, fit $\mathcal L(D)=\mathcal L_\infty+aD^{-\gamma}$ on its first half, and
compare the final prediction with the measured loss. (b) Run two QUICK controls,
one clean and one sampling 10% of windows from a fixed 5,000-token training slice.
Compare validation and slice losses. Computer runtime is additional to the
exercise's working time.
:::

::: solution
For (a), set Lab 2's `QUICK = False` and change its validation trigger from
every 150 to every 25 steps. Keep its twenty fixed batches and dedicated training
sampler; run the whole lab and preserve `lab2-metrics.json`. For (b), repeat
Lab 2's setup through its model/configuration declarations in a fresh process.
The loop below uses five fixed validation batches for both QUICK controls.
Both controls begin with the same initial seed and draw the same
candidate windows; the duplicate condition alone substitutes some of them.
The fixed slice is training data, so its loss measures repeated-text fitting,
not held-out generalisation. The duplicate fraction is a Bernoulli draw per
sequence, with its actual value printed.

```python
from scipy.optimize import least_squares

def experiment(total_steps,duplicate_share=0.0):
    torch.manual_seed(0)
    model = GPT(**config).to(device)
    optimizer = make_optimizer(model,3e-3)
    sampler = torch.Generator().manual_seed(0)
    vg = torch.Generator().manual_seed(123)
    fixed_valid = [batch(valid_data,vg,T) for _ in range(5)]
    sg = torch.Generator().manual_seed(456)
    fixed_slice = [batch(train_data[:5000],sg,T) for _ in range(5)]
    rows,duplicates = [],0
    warmup = 60 if total_steps==600 else 30
    for step in range(total_steps):
        x,y = batch(train_data,sampler,T)
        sx,sy = batch(train_data[:5000],sampler,T)
        mask = torch.rand(16,generator=sampler)<duplicate_share
        duplicates += mask.sum().item()
        x = torch.where(mask[:,None].to(device),sx,x)
        y = torch.where(mask[:,None].to(device),sy,y)
        for group in optimizer.param_groups:
            group["lr"] = learning_rate(step,total_steps,warmup,3e-3)
        optimizer.zero_grad(set_to_none=True)
        with precision():
            logits = model(x)
            loss = F.cross_entropy(logits.float().flatten(0,1),y.flatten())
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(),1)
        optimizer.step()
        if (step+1)%25==0:
            rows.append(((step+1)*16*T,evaluate(model,fixed_valid)))
    result = dict(curve=rows,validation=evaluate(model,fixed_valid),
                  slice_loss=evaluate(model,fixed_slice),
                  duplicate_share=duplicates/(16*total_steps))
    print(total_steps,duplicate_share,result["validation"],
          result["slice_loss"],result["duplicate_share"])
    return result

# Point this to the FULL metrics saved in (a), in that run's working directory.
full = json.loads(Path("lab2-metrics.json").read_text(encoding="utf8"))
assert not full["quick"] and len(full["validation"]) >= 24
clean = experiment(150)
duplicated = experiment(150,.10)
curve = np.array([(row["tokens"],row["loss"]) for row in full["validation"]])
early = curve[curve[:,0]<=300*16*T]
scale = 1e6

def law(tokens,parameters):
    floor,amplitude,gamma = parameters
    return floor+amplitude*(tokens/scale)**(-gamma)

starts = [[floor,amplitude,gamma] for floor in (0,1,2)
          for amplitude in (1,3,10) for gamma in (.1,.5,1)]
fits = [least_squares(lambda p:law(early[:,0],p)-early[:,1],start,
                      bounds=([0,0,.001],[early[:,1].min(),100,3]))
        for start in starts]
fit = min(fits,key=lambda result:np.sum(result.fun**2))
prediction = law(curve[-1,0],fit.x)
print("Fitted parameters:",fit.x)
print("Final prediction, measurement, error:",prediction,curve[-1,1],
      prediction-curve[-1,1])
fig,ax = plt.subplots(figsize=(7.2,3.6))
ax.loglog(curve[:,0],curve[:,1],"o",label="Measured validation")
ax.loglog(curve[:,0],law(curve[:,0],fit.x),label="First-half fit extrapolated")
ax.axvline(300*16*T,color="gray",linestyle="--",label="Fitting boundary")
ax.set(xlabel="Training tokens seen",ylabel="Cross-entropy (nats/token)")
ax.legend()
plt.show()
```

Fit only the early measurements before inspecting the end. Report the error,
not a promised accuracy: a short curve can poorly identify its floor/exponent,
and cosine annealing changes the late trajectory. A stable-rate phase gives a
cleaner token-scaling comparison. The constrained multi-start fit above makes
the fitting assumptions visible; it is not an uncertainty interval.

In this environment the standard FULL curve's first-half fit predicted 2.9551
against measured 2.8327, an error of +0.1224 nats. The fitted floor, amplitude
at one million tokens and exponent were 2.1897, 1.1679 and 0.4700. The two
QUICK controls measured:

| Control | Actual duplicate share | Held-out loss | Fixed training-slice loss |
|---|---:|---:|---:|
| Clean | 0% | 3.7984 | 3.8140 |
| Duplicated | 9.958% | 4.3431 | 4.0267 |

The repeated slice has a 0.3164-nat advantage over validation in the duplicate
run, while the clean run's two losses are similar. Its absolute slice loss is
still higher than in the clean run: repetition did not improve every measure.
Held-out loss worsened by 0.5447 nats in this seed. These controls consume the
sampler differently from Lab 2's ordinary loop and use five rather than twenty
evaluation batches, so their numbers should be compared with each other.

In the duplicate comparison, look for slice loss falling more than general
validation. A 150-step run consumes 614,400 tokens, so 10% replay of a 5,000-token
slice is about 12.3 token-equivalent exposures, with overlapping windows rather
than twelve literal sequential passes. Validation may improve or worsen within
run/measurement noise; repeating seeds is required before attributing a small
change to duplication. Record the actual fraction and compare the clean run's
slice loss too: common story patterns can be easy even without deliberate replay.
:::
