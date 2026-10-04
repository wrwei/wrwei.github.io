## Reinforcement learning with verifiable rewards: GRPO {#s9}

A checker can score a numerical answer, a program or a structured artifact
without differentiating through it. This makes reinforcement learning feasible
when demonstrations are scarce but outcomes are cheap to test. Its reward is
exact **for the tested property**, not necessarily for the user's whole goal.
Passing a safety argument's reference checks does not establish that the cited
evidence supports its claims. Checker cost also matters: running code or a
simulation is not free merely because no human labels the result.

**Group relative policy optimisation (GRPO)**, introduced in
[DeepSeekMath](https://arxiv.org/abs/2402.03300), replaces PPO's learned critic
with comparisons among samples for the same prompt. Generate $G$ responses
under an old policy, score them and centre the rewards:

$$
\bar r=\frac1G\sum_i r_i,\qquad
s=\sqrt{\frac{1}{G-1}\sum_i(r_i-\bar r)^2},\qquad
A_i=\frac{r_i-\bar r}{s+\varepsilon_s}.
$$

We use the sample standard deviation, with denominator $G-1$, as the labs do.
Other implementations use population variance; that changes the scale.
For a zero-variance group the lab explicitly sets all advantages to zero.
The small numerical stabiliser is not a substitute for this branch.

### A group baseline and its limits

Let $\bar r_{-i}$ average the other $G-1$ rewards. Direct rearrangement gives

$$
r_i-\bar r=\frac{G-1}{G}(r_i-\bar r_{-i}).
$$

Conditional on the prompt, independent samples make $\bar r_{-i}$ independent
of response $i$. The leave-one-out baseline therefore leaves its expected
score-function gradient unchanged. Including the response in its own group
mean introduces the factor $(G-1)/G$ before standardisation. Dividing by the
random group standard deviation adds reward-dependent weighting; the complete
standardised estimator is not simply an unbiased REINFORCE estimator times a
constant. The identity explains the baseline relationship without proving
every GRPO normalisation harmless.

::: worked title="One success among eight responses"
For rewards $(1,0,0,0,0,0,0,0)$, the mean is 0.125 and sample standard deviation
$\sqrt{0.875/7}=0.354$. The success has advantage 2.475 and each failure −0.354.
Two successes give +1.620 and −0.540; four give ±0.935. Each group's advantages
sum to zero. Eight successes or eight failures give no task advantage, although
a separate KL regulariser can still produce gradients.
:::

::: figure id=fig-09-14
An eight-response group converts one successful outcome into positive advantage
and seven failures into negative advantages. An all-success group has zero
task advantages; it can still receive a reference-KL update.
:::

For token $t$ in response $i$, use the old-policy ratio $\rho_{i,t}$ from PPO
and a common sequence advantage $A_i$. A typical sequence-mean objective is

$$
J_{\mathrm{GRPO}}=
\E\left[\frac1G\sum_i\frac1{|y_i|}\sum_t
\left\{\min\!\left(\rho_{i,t}A_i,
\operatorname{clip}(\rho_{i,t},1-\epsilon,1+\epsilon)A_i\right)
-\beta k_{i,t}\right\}\right].
$$

The mask includes the first EOS and excludes later padding. Advantages and
old-policy probabilities are detached. At the first update, before parameters
change, $\rho=1$ and clipping has no effect. The task gradient is then a
group-baseline score-function update with the displayed length weighting.
That qualification matters: it need not equal unnormalised sequence REINFORCE.
Subsequent inner steps change the ratios and activate clipping.

### Estimate reference KL carefully

For one conditional next-token distribution, set
$u=\pi_{\mathrm{ref}}(a\mid s)/\pi_\theta(a\mid s)$ and use

$$
k_3=u-\log u-1.
$$

With common support and actions sampled from the **current** policy,
$\E_{\pi_\theta}u=1$, so $\E k_3=-\E\log u=\KL(\pi_\theta\|\pi_{\mathrm{ref}})$.
The inequality $\log u\le u-1$ makes every sample nonnegative. At probabilities
0.5 and 0.4, $u=0.8$ and $k_3=0.0231$, whereas the sampled log-ratio is 0.223.
Both have the same expectation under the stated sampling distribution; their
individual values differ. Nonnegativity does not establish a universal
variance advantage over every other estimator.

If samples are held fixed from an old policy while parameters change, the
unweighted estimate is no longer exactly that current-policy KL expectation.
Nor does an unbiased value estimator automatically give an unbiased derivative
when one differentiates through its value on fixed sampled actions: the
sampling-distribution derivative is a separate term. Lab 5 uses the common
local surrogate with two inner updates and states this approximation explicitly.
Its reported sequence KL is independently estimated from fresh policy samples.

```python
import torch

def grpo_advantages(rewards):
    mean = rewards.mean(dim=1, keepdim=True)
    std = rewards.std(dim=1, correction=1, keepdim=True)
    return torch.where(std > 0, (rewards - mean) / std.clamp_min(1e-8),
                       torch.zeros_like(rewards))

# Each row is a sampled response; mask includes its first EOS.
# old_logp, ref_logp and advantages are detached rollout quantities.
def grpo_loss(logp, old_logp, ref_logp, advantages, mask, beta=0.04):
    ratio = (logp - old_logp).exp()
    advantage = advantages[:, None]
    surrogate = torch.minimum(ratio * advantage,
                              ratio.clamp(0.8, 1.2) * advantage)
    log_u = ref_logp - logp
    k3 = log_u.exp() - log_u - 1
    per_sequence = ((surrogate - beta * k3) * mask).sum(dim=1)
    return -(per_sequence / mask.sum(dim=1).clamp_min(1)).mean()
```

### Which groups teach, and what normalisation changes

For independent binary rewards with pass probability $p$, the probability of
a group containing both outcomes is

$$
P(\text{task signal})=1-p^G-(1-p)^G.
$$

At $G=8$, it is 0.149 for $p=0.02$, 0.570 for $p=0.1$, 0.992 for $p=0.5$
and 0.337 for $p=0.95$. Both very hard and already-solved prompts supply little
group-relative task signal. Increasing $G$ costs generation; resampling or
a curriculum can be cheaper, but changes the effective prompt distribution.
Track attempts spent on discarded groups and keep evaluation prompts fixed.

::: widget name=grpo-group-explorer
Change the group's rewards and inspect its mean, sample standard deviation and
advantages. Compare binary task-signal probability across pass rates and group sizes.
:::

Sequence-mean token losses give each response equal weight. For two failures
with $A=-0.6$ and lengths 200 and 800, the coefficient per token is −0.003
versus −0.00075. This can favour longer failed responses in the original
normalisation; it is not a prediction that every long response will worsen.
Standard-deviation division also reweights prompt groups according to their
observed reward variation. [Dr. GRPO](https://arxiv.org/abs/2503.20783) removes
that division and uses a constant length normaliser.
[DAPO](https://arxiv.org/abs/2503.14476) includes token-level averaging,
dynamic sampling and other changes. Report the precise objective rather than
assuming every system called GRPO computes the same gradient.

GRPO holds a policy and reference, often one frozen base with appropriately
separated adapters. It generates $G$ responses per prompt and trains on their
whole prompt–response sequences. Long shared prompts can make training passes
as costly as generation. Values such as $G=8$, clip width 0.2 and $\beta=0.04$
are affordable example settings, not constants of the method.

### The checker is part of the learned behaviour

::: figure id=fig-09-15
Recorded Lab 5 curves show reward, zero-variance groups and KL under two beta
settings. For the substring checker, independently sampled verifier acceptance
exceeds exact-match accuracy: the policy exploits a permissive test.
:::

At $\beta=0.04$, Lab 5 reaches 96.3% sampled exact accuracy and KL 0.629;
at $\beta=0.5$, 87.0% and KL 0.376. A checker accepting any string containing
the correct answer yields 97.6% acceptance but only 77.8% exact accuracy.
Mean answer length rises from 1.57 to 1.74 digits. Multiple candidates satisfy
the substring rule: this is a correct optimisation of an incorrect goal.
Require a single canonical answer, test degenerate cases, and inspect outputs
with very high reward. Adding a length penalty can hide the symptom without
repairing the missing semantic check.

The January [DeepSeek-R1 report](https://arxiv.org/html/2501.12948v1) describes
R1-Zero training from a base model with rule-based accuracy and format rewards.
It reports AIME 2024 pass@1 rising from 15.6% to 71.0%, alongside longer
self-checking outputs. This shows useful behaviour changing without SFT
demonstrations in that stage; pretraining still supplied substantial prior
capability. R1 then added cold-start examples, reasoning RL, roughly 800,000
rejection-sampled and general SFT examples, and another RL phase. The report's
small-model distillation comparisons support that pipeline in its experiments,
not a theorem that small-model RL is always inferior.

::: check
An all-success group has zero advantages. Can the full loss still update the
policy? Why can k3 never be negative for positive probabilities?
:::

::: answer
Yes: the reference-KL term can still update it. Only the task-advantage term
vanishes. The inequality $\log u\le u-1$ gives $u-\log u-1\ge0$; its unbiased
KL-value interpretation additionally requires current-policy sampling and support.
:::

## Safety, refusal and honesty {#s10}

**Refusal** is a learned response to an unsuitable request. **Abstention** is
a response to insufficient information or confidence. They need different
training examples and different evaluations. “I cannot help bypass a protective
device” expresses a boundary; “the brief does not contain yesterday's measured
pressure” identifies missing evidence. Neither is measured adequately by a
single helpfulness score.

Demonstrate concise refusals with useful safe alternatives, include preference
pairs where a correct refusal beats compliance, and score relevant outcomes
in RL. A refusal policy must still answer benign requests. Otherwise refusing
everything solves a refusal-only test. Conversely, complying with everything
solves a non-refusal-only test. Report both **unsafe compliance** and
**over-refusal**, with the intended boundary stated.

[Constitutional AI](https://arxiv.org/abs/2212.08073) uses written principles
to generate critiques and revised answers for a supervised stage, then AI
comparisons for a preference/RL stage. This reduces some human labelling but
does not remove choices about principles, evaluation or which judge interprets
them. A model-generated preference is still a fallible training signal.
Keep a human-reviewed evaluation sample outside that generation loop.

### Evaluate both sides of the boundary

[XSTest](https://arxiv.org/abs/2308.01263) contains 250 safe prompts resembling
unsafe requests and 200 unsafe contrasts. Benign phrases such as “kill a Python
process” test whether the model reasons about context rather than matching a
trigger word. Domain experts and automated red-teaming can supply additional
failure cases. Reserve fresh variants for evaluation: memorising a static list
is not robust boundary recognition. Check responses' substance, not only
whether a refusal phrase appears.

::: worked title="A hypothetical refusal trade-off"
A candidate moves refusal on 200 harmful prompts from 97% to 99%, but refusal
on 250 benign borderline prompts from 18% to 36%. Single-rate binomial standard
errors are about 1.2 and 0.7 percentage points for the harmful rates, versus
2.4 and 3.0 for benign refusal. These errors do not replace a paired comparison.
A net four improved harmful cases gives a minimum two-sided exact McNemar
p-value of 0.125 if none worsens. The 18-point over-refusal increase is a large
observed regression; publish discordant counts and intervals for both suites.
:::

::: figure id=fig-09-16
The refusal decision has four outcomes. Harmful compliance and benign refusal
are separate errors. The example before/after points are hypothetical and
illustrate why one safety rate cannot describe the trade-off.
:::

### Confidence and the incentive to guess

Calibration asks whether an expressed confidence matches empirical accuracy.
Answer-token probabilities, verbal confidence and confidence in a long artifact
are different measurements. Some base-model multiple-choice experiments found
useful calibration; the [GPT-4 technical report](https://arxiv.org/abs/2303.08774)
shows calibration deteriorating after post-training in its evaluation.
Do not generalise either result to every task or every base model. Measure
confidence and ECE before and after each stage on the same defined target.

Preference labels may reward confident prose even when it is wrong. A grader
giving 1 for a correct answer and 0 for both error and abstention also rewards
guessing whenever success has any positive probability. Under the scoring rule
from [Module 07, Section 10](module_07_EN.html#s10), +1 correct, 0 abstain and
$-\lambda$ wrong, answering pays only when
$p>\lambda/(1+\lambda)$. With $\lambda=4$, the threshold is 0.8. The decision
works only as well as the estimated $p$: an overconfident model can cross it
without having enough evidence.

Include answerable and unanswerable versions of similar prompts. Reward
identifying the missing evidence and asking a useful clarifying question;
otherwise a model can maximise an abstention reward by declining everything.
Report error, accuracy, abstention and penalised utility together. An abstention
phrase attached to a fabricated answer should not count as successful abstention.

### Honesty about evidence and actions

A completion claim must refer to an observable result. If a tool did not run,
the model should not report that it ran. If a saved artifact failed validation,
“finished” is false even if the prose sounds complete. Training trajectories
can reward checking the result and stating the remaining limitation. Runtime
checks can independently require that the artifact exists and passed its rules.

For the safety-case assistant, make a suite of briefs missing evidence required
by a claim. The target response marks the claim unsupported and names the
missing evidence. A dangling-evidence-ID rule penalises invented references.
That catches a fabricated identifier; it does not catch citing a real but
irrelevant report. Evidence relevance needs another check or human review.
Turn each recurring failure into a prompt family, a desired response and a
measurement, rather than adding a vague “be honest” instruction.

**Sycophancy** is unjustified agreement with the user's premise or stated view.
[Sharma et al.](https://arxiv.org/abs/2310.13548) study how preference signals
can favour it. Include comparisons where a polite, evidence-based correction
wins over flattering agreement. Evaluate both correct and incorrect user
premises so that automatic contradiction is not rewarded instead.

Lab 6's tiny instruct model follows more format constraints than its base,
but invents a bearing temperature unavailable in the prompt and a valve serial
number. Neither passes its five abstention checks or five refusal checks.
This is a result for two pinned 135M checkpoints, one prompt template and
simple checkers. It supports checking these behaviours separately; it does
not establish that all post-training prioritises formatting over honesty.

::: check
What does a correct/error/abstain reward of 1/0/0 encourage? What pair of suites
prevents an all-refuse policy from looking excellent?
:::

::: answer
It encourages answering whenever the chance of correctness is positive.
Give wrong answers a cost and evaluate abstention. Pair a harmful-request
suite with benign borderline prompts, reporting unsafe compliance and over-refusal.
:::

## Tools and agents {#s11}

A tool-using model emits an assistant call in a specified format, receives an
environment result, then decides how to continue. The chat template might wrap
a JSON function name and arguments in special markers. These conventions vary
by model family; use the deployed tokenizer's template, not a plausible-looking
generic wrapper. Tool schemas, call identifiers and result association are
part of the training input.

Assistant calls and final answers carry loss. User, system and **tool-result
tokens are masked** for this response-only training objective. A result is
observed context, not a value the assistant is supposed to generate. Training
it as an assistant target encourages fabricated environment output. Masked
results can still influence gradients through the assistant answer, just as
masked user tokens do in Section 3.

::: worked title="A small trajectory has a large context bill"
A system prompt has 300 tokens, tool schemas 450, user request 40, assistant
call 35, tool result 600 and final assistant answer 120. Total context is
1,545 tokens; only $35+120=155$, about 10%, carry supervised loss.
All 1,545 still contribute to the forward context and attention cost.
The counts include each segment's assigned boundaries; don't count markers twice.
:::

::: figure id=fig-09-17
Only assistant call and answer segments carry response loss. The tool result
is masked environment context. A direct-answer branch reminds us to train
the decision not to use a tool, as well as the call syntax.
:::

For example, the assistant emits `{"name":"get_hazard","arguments":{"id":"H-12"}}`.
The tool returns the matching hazard record and its status. The final answer
cites H-12 and states what the record supports. These JSON snippets illustrate
roles, not any model's complete real tool-call template. If the tool returns
“not found”, the next assistant turn should ask for the record or mark the
claim unsupported instead of inventing a successful lookup.

Data can come from reviewed demonstrations or execution-filtered generated
trajectories. [Toolformer](https://arxiv.org/abs/2302.04761) used a self-supervised
filter based on whether a candidate call improved prediction of subsequent
text. That is a distinct objective from validating an assistant's final artifact.
For deployment data, check both that calls execute with valid arguments and
that their results justify the final response. RL can score the final verified
outcome, while also accounting for tool cost and unnecessary calls.

Rare cases deserve explicit examples: no tool is needed, a tool times out,
the returned data contradicts an assumption, a retry would repeat the same
failure, or the task is complete and the model must stop. Train reading errors
and revising the plan rather than blindly retrying. A loop that never terminates
can produce valid call syntax at every step and still fail its task.

Argument types and required fields can be enforced by serving-time validation
or constrained decoding ([Module 10](module_10_EN.html)). This establishes
syntactic validity, not that a call is authorised or appropriate. The
[AI Agents series](../agent/index.html) covers agent loops, tool interfaces,
guardrails and evaluation in detail. Post-training supplies behaviours the loop
uses; runtime checks provide independent evidence about actions and results.

::: check
Does masking a tool result prevent the model from learning to use its contents?
:::

::: answer
No. It removes direct next-token targets on environment output; gradients from
later assistant targets still pass through the result's representations. The
model learns to condition on the result rather than impersonate the environment.
:::

## Evaluation {#s12}

After post-training, one loss cannot summarise behaviour. SFT loss still measures
demonstration likelihood; DPO loss measures pair margins; RL reward measures
the chosen proxy. Each remains a diagnostic, but promotion needs generated
responses under deployment conditions. Lab 4's near-zero off-policy DPO loss
and declining task accuracy give a concrete reason to keep these distinct.

Use a layered evaluation. [IFEval](https://arxiv.org/abs/2311.07911) has 541
prompts and 25 types of verifiable instruction. Domain checkers measure parse
and structural pass rates. A general-capability battery prices forgetting.
Behavioural suites measure known failures such as fabricated evidence, false
completion, over-refusal and unanswerable questions. Report categories and
joint success, since an answer satisfying three of four mandatory constraints
may still be unusable.

Checkers deserve tests too. Lab 6's initial benign checker requires a nonempty
answer without a refusal phrase. Junk from the base passes it. The format
checker for a JSON key does not check its value: `"status":"OK"` passes a
key-presence test even when the request says `"ok"`. Label that measurement
honestly and strengthen the predicate when exact value compliance is the goal.
Never turn a narrow predicate into a broader claim about useful task completion.

### Paired evidence on small suites

[Module 01, Section 10](module_01_EN.html#s10) introduces sampling uncertainty:
a pass rate has approximate standard error $\sqrt{\hat p(1-\hat p)/n}$,
and a percentile bootstrap resamples observations to estimate an interval.
Post-training suites are often small and checkpoints see the **same items**.
Use paired differences $d_i=\mathrm{pass}_{B,i}-\mathrm{pass}_{A,i}$ and
resample whole pairs, preserving which items were easy for both models.

::: worked title="Ten points on fifty items is not decisive"
A passes 36 of 50, B passes 31. Both pass 28; only A passes 8; only B passes 3;
both fail 11. A's advantage is 0.10. The difference's variance is approximately
$11/50-0.1^2=0.21$, giving SE $\sqrt{0.21/50}=0.0648$ and a normal 95%
interval $[-0.027,0.227]$. An unpaired calculation wastes the positive pairing
and gives a wider interval. These counts favour A descriptively, but they
provide weak evidence of a population difference.
:::

**McNemar's exact test** uses only discordant pairs. Under its null, each of
the $m$ disagreements is equally likely to favour either model. If $b\le m/2$
favour the less frequent direction, the two-sided value is

$$
p_{\mathrm{exact}}=\min\!\left(1,
2\sum_{j=0}^{b}{m\choose j}2^{-m}\right).
$$

For 8 versus 3, $m=11$ and $p=0.227$. This test and an approximate or percentile
interval need not agree exactly on a small discrete sample. A disagreement is
a reason to inspect the assumptions and gather more evidence, not choose
whichever result makes a preferred checkpoint look better.

::: figure id=fig-09-18
Lab 6's category rates with Wilson intervals and percentile-bootstrap intervals.
The separate paired row shows instruct-minus-base difference. All-zero and
all-one categories expose the bootstrap's degenerate intervals on tiny samples.
:::

Lab 6 gives base 25.0% and instruct 37.5% overall. Its paired bootstrap estimates
+12.5 points with interval [+2.5, +22.5], but all five discordant items favour
instruct and exact McNemar $p=0.0625$. Describe the observed improvement and
this limitation. The 40-item convenience suite cannot establish robust superiority.
At zero successes out of five, resampling observed outcomes gives interval
[0,0]; a Wilson interval reaches about 43%. Zero observed successes is not
proof that the population probability is exactly zero.

Prompts sharing a template are not independent evidence. Resample templates
in a **cluster bootstrap**, and use enough independent template families.
With stochastic decoding, repeat samples per prompt and account for both
prompt and sampling variability. Fix and report decoding settings, seeds,
system prompt, token limits and checkpoint revision. Repeatedly choosing a
winner on the same validation suite also introduces selection bias; reserve
a final test set and set promotion tolerances before seeing its results.

### Judged comparisons need their own audit

A model judge can compare responses using a rubric and references. The
[MT-Bench and Chatbot Arena study](https://arxiv.org/abs/2306.05685) investigates
agreement and judge biases. Judge family, rubric, position, length and
self-preference can all change the apparent winner. A broad win rate should
sit beside programmatic correctness and a human-reviewed audit sample.

Show each pair in both orders. Count a flipped decision as half a win, or
report it as inconsistent separately. For this hypothetical table:

| Verdict across the two orders | Count |
|---|---|
| A wins both | 38 |
| B wins both | 32 |
| First-shown wins both | 24 |
| Second-shown wins both | 6 |

A wins 62 times shown first and 44 times shown second; swap-average is 53%
and consistency is 70%. Swapping balances presentation but does not universally
cancel arbitrary nonlinear position bias. It also cannot remove length bias:
the longer response remains longer in both orders.

Lab 6 simulates equal-quality responses plus length and position effects;
it makes **no external judge calls**. A's latent-quality win rate is 50.3%,
first-position 75.5%, second-position 42.0%, and swap-average 58.8%.
A fitted logistic estimate at zero length difference and balanced position
is 46.6%. This is an illustrative adjustment with finite-sample and model-form
error, not recovery of a known exact win rate. Length-controlled comparisons
such as [AlpacaEval's](https://arxiv.org/abs/2404.04475) address this confound,
while the adjustment still needs validation against meaningful human preferences.

### Contamination and promotion

Compare all training sources, including distillation prompts and generated
targets, against evaluation using content hashes and n-gram overlap. Report
dropped counts and thresholds. Paraphrases, transformed examples and teacher
models' prior exposure can escape these tests. Decontamination reduces a risk;
it does not certify complete independence. Hold out prompt families before
generating training responses whenever feasible.

A promotion rule might require a statistically supported domain improvement,
no general-battery drop beyond a predeclared tolerance, acceptable refusal and
abstention trade-offs, and human review of a high-reward sample. Evaluate the
**merged and quantised artifact that ships**, not only the training adapter.
Record its hash and evaluation configuration so the next candidate has an
identifiable incumbent. A failed gate means retain the incumbent and revise
the data, checker or optimisation; it is not a reason to relax the threshold
after observing the failure.

::: check
What must accompany “B beats A by four points on 200 prompts”?
:::

::: answer
Paired outcome counts and uncertainty, template clustering, decoding settings,
contamination checks and category regressions. An overall difference alone
does not tell us whether it is repeatable or hides a material failure.
:::

## Merging and averaging {#s13}

Fine-tuned models sharing one base can sometimes be combined by averaging their
weights. [**Model soups**](https://arxiv.org/abs/2203.05482) studied this with
fine-tunes in compatible low-loss regions. A uniform soup averages all selected
models; a greedy soup adds a candidate only when a held-out metric improves.
Averaging late checkpoints of one run is another inexpensive candidate to test.
Neither guarantees an improvement, and the selection set must remain distinct
from the final evaluation set.

**Task arithmetic** writes $\tau_i=\theta_i-\theta_0$ for a fine-tune's update,
then forms $\theta_0+\sum_i\lambda_i\tau_i$. Addition can combine behaviours;
subtraction can reduce one in some experiments. The method does not isolate
a skill perfectly: a task vector also contains changes to unrelated behaviour.
Scale choices require evaluation across the tasks that matter.

::: figure id=fig-09-20
A conceptual low-loss basin illustrates why compatible fine-tunes may average
well, while incompatible parameter alignments may cross high loss. It is a
schematic, not a measured landscape or a guarantee for all common-base models.
:::

Parameter alignment matters. Independent initialisations may learn functions
with permuted hidden units, so a naive coordinatewise mean can be poor even
when their functions agree. It is too strong to say averaging independent runs
always destroys them; reparameterisation or alignment can change that result.
Conversely, a shared base does not ensure that aggressive fine-tunes remain
linearly connected at low loss.

[**TIES-merging**](https://arxiv.org/abs/2306.01708) trims small task-vector
entries, elects an aggregate sign and averages entries agreeing with it.
[**DARE**](https://arxiv.org/abs/2311.03099) randomly drops delta entries and
rescales survivors by the inverse retention probability before a merge.
The rescaled delta is unbiased entrywise, but the nonlinear network's output
is not thereby unbiased or guaranteed useful.

::: worked title="Resolve conflicting task-vector entries"
Three vectors are $(0.50,-0.20,0.02,0.30,-0.40)$,
$(0.40,0.30,-0.01,-0.35,-0.05)$ and $(-0.10,0.25,0.03,0.20,-0.30)$.
Their plain mean is $(0.267,0.117,0.013,0.050,-0.250)$.
Keeping the three largest-magnitude entries in each leaves
$(0.5,0,0,0.3,-0.4)$, $(0.4,0.3,0,-0.35,0)$ and $(0,0.25,0,0.2,-0.3)$.
The aggregate signs are $(+,+,0,+,-)$; averaging agreeing nonzero entries gives
$(0.45,0.275,0,0.25,-0.35)$. The fourth coordinate no longer cancels to 0.05.
This arithmetic demonstrates the rule, not a performance gain.
:::

### Merge adapter updates, not separately averaged factors

For two adapters, form $\Delta W=\lambda_1s_1B_1A_1+\lambda_2s_2B_2A_2$.
In general $(B_1+B_2)(A_1+A_2)/4$ includes cross terms neither adapter learned
and gives the original products the wrong weight. For
$B_1=(1,0)^\top$, $A_1=(1,0)$, $B_2=(0,1)^\top$, $A_2=(0,1)$, averaging
products gives $0.5I$, while multiplying averaged factors gives a matrix of
0.25s. They have different ranks and different effects.

Fold scales into $B_i$ and concatenate factors to store a weighted sum exactly
as a larger adapter. Two rank-$r$ updates can have rank up to $2r$; compressing
back to rank $r$ is an approximation, often using an SVD. Merge into the correct
floating-point base, quantise afterwards, and evaluate again. Cheap candidate
construction does not make candidate validation optional.

::: check
What is wrong with treating an average of LoRA factors as an average of their
weight updates?
:::

::: answer
The update is a matrix product. Multiplying the averaged factors creates cross
terms and changes the coefficients; add the scaled products or concatenate
factors instead. The exact sum may need a higher rank.
:::

## The case study: a post-training recipe for a safety-case assistant {#s14}

This is a **hypothetical worked design**, not a deployed system or evidence that
an automated safety decision is correct. The assistant drafts claims, strategies,
evidence links and context for a reactor vessel's pressure-relief system in a
fixed JSON schema. Structural checks require supported claim links, evidence
on leaves, valid references, no cycles and coverage of the brief's hazard log.
They verify explicit properties; engineers still assess the argument and evidence.

The workload matches Modules 07–10: about 4,000 input tokens, comprising a
3,000-token stable system/schema/reference prefix and 1,000 request-specific
tokens, with up to 2,000 output tokens. At 2,000 requests per day, small serving
changes recur often. Training should reproduce the deployed template, brief
mix and English/Chinese proportions, including edit and missing-evidence cases.

### Baselines determine the starting point

First evaluate the prompted instruct release on the golden suite: parse rate,
joint structural pass rate, evidence relevance and human or judged coverage.
It is the inexpensive alternative the trained candidate must beat. Record the
instruct model's general-capability and behavioural baselines too. Domain loss
and domain tests from Module 08 decide whether continued pretraining is justified.

Here we assume Module 08's hypothetical CPT checkpoint passed its gate after
1.8B domain tokens and 0.2B replay tokens. It starts from a base, so SFT must
teach general conversational behaviour as well as domain format. Check template
tokens: an unused row in base training cannot become useful through domain
text that never contains it. Initialise and train the necessary input/output
rows, preserving their token IDs. If CPT were unnecessary, start from the
instruct release and adapt its already-trained template instead. Confirm the
base and teacher licences permit the intended training and release.

### SFT, with a gate before RL

Use rank-64 LoRA with alpha 128 on all seven projections per layer, plus the
needed template-token rows. Start with learning rate $10^{-4}$, cosine decay,
3% warmup and two epochs over 50M total tokens. Pack up to 8,192 tokens with
correct boundary handling and response masks. These are trial settings to
validate, not a claim that this unexecuted large-model recipe converges.

The data combines checker-verified distillations, constrained edit pairs,
refusal and abstention demonstrations, tool trajectories and general instruction
data. About one third of tokens are general data initially, reflecting the base
start. Document whether mixture proportions count all tokens or response targets;
those are different denominators. Filter teacher hallucinations, split prompt
families before generating targets, and retain examples that explicitly mark
missing support rather than invent it.

Gate SFT against the prompted instruct baseline using paired intervals, category
rates and a stated general-battery tolerance. A rule-clean candidate that
regresses on honesty or general instruction following does not pass merely
because it learned the schema. If it fails, revise data and coverage before
adding a more complex RL stage.

### GRPO on the properties the checker can establish

Use 3,000 representative prompts for two sampling epochs, eight responses per
prompt and one inner update. Set the reference to the **SFT policy**, with a
trial $\beta=0.04$. Disabling all adapters would return the CPT base rather
than that reference; preserve the SFT adapter and apply a distinct trainable
RL update, or retain a frozen SFT checkpoint. Include all required frozen
adapter or model state in the implementation's actual budget.

A composite reward can expose partial progress while limiting judge influence.
Reject parse/schema failures and empty artifacts with zero. For a nonempty
well-typed artifact, define $q$ as the fraction of structural rules passed,
$p$ as unchanged required content preserved on an edit, $c$ as capped judged
coverage, and $d$ as a reviewed degeneracy flag. Let

$$
R=0.5q+0.2p\,\mathbf1_{\mathrm{edit}}
+0.3\min(c,1)\,\mathbf1_{\mathrm{all\ rules\ pass}}-0.2d.
$$

Define preservation only when the brief has content that must remain. For
non-edit briefs this term is zero, so their clean maximum is 0.8, not 1.0.
Either retain that deliberate difference and analyse prompt-type weighting,
or renormalise within each brief type before computing advantages. Do not
silently treat an undefined preservation denominator as perfect preservation.

Require actual claim and evidence entries before rule aggregation. Otherwise
“all leaves cite evidence” and “all references exist” can both be vacuously
true for an empty artifact. Rules need minimum-content and brief-coverage
conditions. Penalising identical risk ratings or repeated evidence links can
catch shortcuts, but such repetition can also be legitimate; establish that
the flag matches a real failure rather than a convenient aesthetic preference.
Structural checks and a degeneracy penalty still cannot certify engineering truth.

::: worked title="Walk through the reward"
Prose or an empty JSON artifact gives 0. A non-edit artifact passing nine of
twelve rules, with no degeneracy, gets $0.5(9/12)=0.375$.
A clean edit preserving 90% of required prior content with coverage 0.8 gets
$0.5+0.2(0.9)+0.3(0.8)=0.92$.
A clean non-edit artifact with coverage 0.6 and a confirmed degeneracy gets
$0.5+0.3(0.6)-0.2=0.48$. The judged term is capped and unavailable until all
structural rules pass. These numbers describe the designed proxy, not assurance.
:::

Read a sample of high-reward outputs each epoch, track length, coverage,
zero-variance groups and KL, and run the full golden suite. DPO on freshly
generated, length-controlled pairs is an alternative for prose clarity that
the checker cannot measure. Neither method repairs an inadequate evaluation.

### Compute the bill under explicit assumptions

::: worked title="SFT and GRPO are more than their response tokens"
Two SFT epochs give $10^8$ total token-passes. Section 4's LoRA estimate at
8,192 tokens is $4.30\times10^{10}$ FLOPs per token, hence
$4.30\times10^{18}$ FLOPs. Assuming an effective $4\times10^{14}$ FLOP/s per
H100 gives about **3 GPU-hours**. This uses activation checkpointing and the
series' compute convention; measure the realised throughput before purchasing time.

GRPO generates $3000\times2\times8=48{,}000$ responses, up to 96M output tokens.
An assumed 2,500 generated tokens/s per GPU gives **10.7 GPU-hours**. Shared
prompt prefills cost approximately $6000\times7.61\times10^{13}$ FLOPs,
about **0.3 GPU-hours**, if the implementation shares the prefix across samples.
Training reprocesses all eight full 6,000-token sequences per group:
288M token-passes. LoRA training plus reference forward is approximately
$6N_{\mathrm{matmul}}+8LTd=6.06\times10^{10}$ FLOPs per token, giving
**12.1 GPU-hours**. Total is roughly **23 GPU-hours**, before judge calls,
evaluation, synchronisation and other overheads. Training can cost as much as generation.
:::

At the series' assumed USD 2.50 per H100-hour, SFT is about USD 7.50 and a GRPO
trial about USD 58. Three trials of each total roughly USD 200 before judges.
These are modelling assumptions, not a current rental quote or a measured
GPU run. Data review, failed trials and engineering can dominate that bill.

::: figure id=fig-09-21
The hypothetical pipeline starts with baseline evidence, trains SFT and GRPO
behind separate gates, then merges, quantises and evaluates the shipped artifact.
The compute labels are estimates under stated throughput assumptions.
:::

Finally merge into the appropriate bf16 checkpoint, quantise for serving, rerun
all gates and record the artifact hash. The series' illustrative serving format
uses 4-bit block weights with one fp16 scale per 128 weights (4.125 bits per
weight), plus 8-bit embedding and output tables. About 8.305 billion block
parameters need 4.28 GB; the two tables add 1.246 GB, for about **5.53 GB** before
packaging overhead. This differs from the QLoRA training estimate, which keeps
those tables in bf16. Uniform four-bit storage for every parameter would give
4.78 GB before metadata, a different assumption. Measure the actual release file.
[Module 10](module_10_EN.html) develops that serving calculation.

::: check
Why must the GRPO reference remain the SFT policy, and why reject an empty
artifact before averaging rule results?
:::

::: answer
The intended KL anchors behaviour after SFT, not the earlier CPT base.
Preserve the correct frozen checkpoint or adapter. Empty collections can
vacuously pass universal rules, so require meaningful typed content and coverage
before granting rule or judge credit.
:::

## What goes wrong {#wrong}

Use the symptom to choose a diagnostic, then verify the suspected cause with
an ablation or inspected output. Several causes can produce the same symptom.

| Symptom | Likely cause to check | Correction and evidence |
|---|---|---|
| Production differs from training | Different chat template, system prompt or token boundary | Compare rendered token IDs for a fixed conversation in both paths |
| The model writes the user's next turn | Loss on user turns, or untrained stopping | Inspect response masks and include assistant end-of-turn targets |
| Correct answer followed by junk, poor stopping | Untrained chat rows or wrong generation EOS | Inspect row statistics and token IDs; initialise/train rows and compare a control |
| More confident factual inventions | Unsupported demonstrations or reward for confidence | Review data against evidence; add abstention and retrieval, then measure calibration |
| Domain success with general regressions | Narrow data mixture and no retention gate | Rehearse general instruction data and evaluate a general battery |
| DPO loss near zero, task accuracy falling | Displacement, separable trivial pairs or excessive updates | Inspect chosen/rejected log-ratios and generated answers; curate useful pairs and stop on held-out metrics |
| Replies lengthen without better outcomes | Length-biased preferences, permissive checker or loss normalisation | Track success by length, repair the checker and test objective changes |
| Reward rises while independent quality falls | Proxy exploitation | Inspect high-reward samples and add adversarial checker cases |
| Most GRPO groups have zero task advantage | Prompts nearly impossible or already solved | Measure pass rates and sampling cost; test a curriculum or resampling |
| Diversity collapses | Excessive optimisation or repeated self-filtering | Monitor KL/diversity and validate a stronger anchor or fresh data |
| Benign requests are refused | Boundary examples or evaluation cover only refusal | Pair harmful and benign suites and add contextual counterexamples |
| Evaluation seems implausibly good | Train/test overlap, teacher exposure or weak predicates | Audit prompt lineage, hashes, n-grams and checker semantics |
| A small gain disappears on repeat | Suite or decoding noise, clustered templates | Use paired/cluster analyses, independent families and repeated samples |
| A judge prefers every new candidate | Position, length, family bias or rubric leakage | Swap order, report consistency, audit human agreement and control length |

Adapters can still forget, on-policy preferences can still displace likelihood,
and a positive KL weight cannot make an incomplete verifier complete. These
diagnostics are hypotheses to test, not guarantees supplied by a method name.
