## Exercises {#exercises}

Use the stated reward, masking and decimal-GB conventions. Show the assumptions
alongside each calculation; a method name alone is not an explanation.


::: exercise id=e1 level=1 kind=conceptual minutes=5
For each behaviour, name the post-training stage you would reach for first and say why in one sentence: (a) every reply must be valid JSON in a fixed schema; (b) of two correct answers, users prefer the shorter and more direct one; (c) generated fault trees must pass twelve structural rules on systems never seen in training; (d) the model must say 'I do not know' when the requested data is not in its context.
:::

::: solution
(a) SFT on demonstrations in the schema: format is what SFT teaches most reliably (constrained decoding at serving is the backstop). (b) Preference optimisation, e.g. DPO on on-policy pairs: a comparative judgement that is hard to demonstrate. (c) RL with a verifiable reward (sample-verify-keep, then GRPO): the checker exists and the behaviour must generalise beyond the demonstrations. (d) SFT examples of abstention plus a reward that pays more for abstaining than for a wrong answer (+1 / 0 / -lambda), measured on a suite of unanswerable prompts.
:::


::: exercise id=e2 level=1 kind=conceptual minutes=5
A conversation renders as: system prompt; user turn; assistant reply; user turn; assistant reply, each turn closed by an end-of-turn token. (a) Which segments carry loss, which are masked, and why must the end-of-turn token after each assistant reply be trained? (b) In a batch that mixes long and short replies, compare token-mean and sequence-mean normalisation: which replies does each weight more, and which is the negative log-likelihood per trained token? (c) Under gradient accumulation you average the mean losses of the micro-batches. Which normalisation have you silently implemented, and how do you recover the token mean?
:::

::: solution
(a) The two assistant replies, each with its end-of-turn token, carry loss; the system prompt, the user turns and the assistant headers are masked (label -100), because the model is not being taught to predict users or the template and the targets should be the responses. Context can still receive gradients through the response loss. The end-of-turn token is the decision to stop: masked, the model never learns to end its turn. (b) Token mean gives every trained token equal weight, so long replies dominate the gradient; it is the per-token negative log-likelihood of the trained tokens. Sequence mean gives every conversation equal weight, so each token of a short reply weighs more than a token of a long one. Neither is wrong; switching between them changes what is learned. (c) A mean of micro-batch means weights every micro-batch equally whatever its number of trained tokens (with one conversation per micro-batch it is the sequence mean). Sum the per-token losses over all micro-batches and divide once by the total number of trained tokens (Section 3's normalisation trap).
:::


::: exercise id=e3 level=1 kind=conceptual minutes=5
LoRA computes h = W x + (alpha / r) B A x with A random and B = 0 at initialisation. (a) Show the adapted model equals the base at step 0. (b) Write dL/dB and dL/dA at step 0 in terms of g = dL/dh and say which can be non-zero. (c) What would happen if both A and B started at zero? If both started random?
:::

::: solution
(a) B A = 0, so h = W x. (b) dL/dB = (alpha / r) g (A x)^T, generally non-zero; dL/dA = (alpha / r) B^T g x^T = 0. B moves on the first step; A starts moving once B is non-zero. (c) Both zero: both gradients are zero for ever under the stated deterministic gradient updates, and the adapter never trains. Both random: the model starts away from the base by a random perturbation (alpha / r) B A so it no longer reproduces the base exactly; this can disturb its behaviour before training.
:::


::: exercise id=e4 level=2 kind=calculation minutes=10
For the case-study model (9,550,729,216 parameters: 36 layers, d = 4,096, 32 query heads and 8 KV heads of dimension 128, SwiGLU width 15,360, vocabulary 152,064, untied embeddings) compute: (a) the LoRA parameter count at r = 16 on all seven linear projections of every layer; (b) the adapter's training state at 16 bytes per parameter; (c) weights plus adapter state for LoRA on a bf16 base, and for QLoRA with the block linear weights in NF4 at 4.127 bits per parameter and the embedding and output head kept in bf16; (d) whether each fits a 24 GB GPU once Module 08's 3.61 GB of checkpointed activations for an 8,192-token sequence is added.
:::

::: solution
(a) Per layer r x [(4,096 + 4,096) + 2 x (4,096 + 1,024) + (4,096 + 4,096) + 3 x (4,096 + 15,360)] = 16 x 84,992 = 1,359,872; x 36 = 48,955,392, 0.51% of the model. (b) 48,955,392 x 16 B = 0.78 GB. (c) LoRA: 9.551e9 x 2 B = 19.10 GB + 0.78 = 19.88 GB. QLoRA: block linear weights 8.305e9 x 4.127 / 8 = 4.28 GB, embedding and head 1.246e9 x 2 B = 2.49 GB, base 6.78 GB + 0.78 = 7.56 GB. (d) LoRA needs about 23.5 decimal GB before runtime buffers and a materialised vocabulary-logit tensor; QLoRA needs about 11.2 GB. Compare these with the device's actual usable byte capacity. A marketed 24 GB name does not universally specify 24 GiB. LoRA is marginal under a 24 billion-byte budget even with chunked loss; QLoRA has substantially more headroom, but kernels, temporary dequantisation and allocator overhead still require measurement.
:::


::: exercise id=e5 level=2 kind=derivation minutes=10
(a) Suppose each response's perceived quality is u = r + epsilon with epsilon independent standard Gumbel noise (CDF exp(-e^{-x})). Show that P(u_w > u_l) = sigma(r_w - r_l). (b) Show that the Bradley-Terry likelihood is unchanged when every reward for a prompt is shifted by c(x), and say what that implies for using a reward model in RL. (c) Elo uses P = 1 / (1 + 10^{-Delta R / 400}). What reward difference in nats corresponds to a 400-point gap, and what is the win probability?
:::

::: solution
(a) With Delta = r_w - r_l, P(u_w > u_l) = P(eps_l < eps_w + Delta). Conditioning on eps_w = t, P(eps_l < t + Delta) = F(t + Delta) = exp(-e^{-t} e^{-Delta}). So P = integral of e^{-t} exp(-e^{-t}) exp(-e^{-t} e^{-Delta}) dt; substitute s = e^{-t} to get integral_0^inf exp(-s (1 + e^{-Delta})) ds = 1 / (1 + e^{-Delta}) = sigma(Delta). Equivalently, the difference of two independent standard Gumbels is standard logistic. (b) sigma((r_w + c) - (r_l + c)) = sigma(r_w - r_l): rewards are identified only up to a per-prompt constant, so normalise them (subtract a baseline) before RL; advantages remove the constant anyway. (c) 10^{-Delta R / 400} = e^{-Delta r} gives Delta r = 400 ln 10 / 400 = 2.303 nats; P = 1 / (1 + 10^{-1}) = 0.909.
:::


::: exercise id=e6 level=2 kind=derivation minutes=15
(a) For one prompt and a finite set of responses, maximise J(pi) = sum_y pi(y) r(y) - beta sum_y pi(y) log(pi(y) / pi_ref(y)) subject to sum_y pi(y) = 1 with a Lagrange multiplier, and show pi* is proportional to pi_ref exp(r / beta). (b) Show J(pi*) = beta log Z with Z = sum_y pi_ref(y) exp(r(y) / beta). (c) Express r through pi* and show that log Z cancels in the Bradley-Terry probability of a pair, giving the DPO loss. Check (b) on pi_ref = (0.5, 0.3, 0.2), r = (0, 1, 2) with beta = 2 (Section 7 worked beta = 1 and 0.5).
:::

::: solution
(a) d/dpi(y): r(y) - beta (log(pi(y) / pi_ref(y)) + 1) - lambda = 0, so log pi(y) = log pi_ref(y) + r(y) / beta - 1 - lambda / beta and pi is proportional to pi_ref e^{r / beta}; normalising fixes the constant as 1/Z. J is strictly concave (the -beta pi log pi term), so this is the global maximum. (b) Substitute log(pi* / pi_ref) = r / beta - log Z: J = sum pi* r - beta sum pi* (r / beta - log Z) = beta log Z. (c) r = beta log(pi* / pi_ref) + beta log Z; for two responses to the same prompt, r_w - r_l = beta log(pi*(y_w) / pi_ref(y_w)) - beta log(pi*(y_l) / pi_ref(y_l)); replace pi* by pi_theta and maximise the Bradley-Terry log-likelihood: L_DPO. Check at beta = 2: weights 0.5, 0.3 e^0.5, 0.2 e = 0.500, 0.495, 0.544; Z = 1.538; pi* = (0.325, 0.322, 0.353); E[r] = 1.028; KL(pi* || pi_ref) = 0.084; J = 1.028 - 2 x 0.084 = 0.861 = 2 ln 1.538. The larger beta keeps pi* close to pi_ref.
:::


::: exercise id=e7 level=1 kind=conceptual minutes=5
Without computing anything: (a) a DPO pair's loss can keep falling while the policy's log-probability of the chosen response drops below the reference's. Show from the definition of the margin how. (b) Where has the chosen response's probability gone, and why do off-policy rejected responses make this likely? (c) A pair's gradient weight is sigma(-u), u its margin. What happens to its contribution as u grows, and why are held-out metrics, not the training loss, the guard against over-training on deterministic preferences?
:::

::: solution
(a) u = beta [log(pi_theta(y_w|x) / pi_ref(y_w|x)) - log(pi_theta(y_l|x) / pi_ref(y_l|x))], and the loss -log sigma(u) falls whenever u grows. u grows if the rejected log-ratio falls faster than the chosen one, even when the chosen log-ratio is negative (Section 7's displacement case). (b) To responses in neither column: the loss constrains only the difference of the two log-ratios, so nothing holds the chosen response up. When the rejected responses are strings the model would never write, pushing them down is easy and says little about what the model does write (likelihood displacement; Lab 4's off-policy run). (c) sigma(-u) -> 0 as u grows, so pairs the model already ranks confidently stop contributing, and on separable pairs the training loss goes to zero while the policy can keep drifting; with deterministic preferences the optimum sends pi(y_l) to zero whatever beta is (IPO's argument). The loss cannot say when to stop; held-out task metrics, the chosen log-ratio and the KL can, which is why early stopping is decided on them.
:::


::: exercise id=e8 level=2 kind=calculation minutes=10
For the 9.55B case-study model (16 bytes per trained parameter, 2 per frozen bf16 parameter), count per prompt (or per pair) and per update the sequence forward passes, backward passes and generated sequences for (a) PPO with a value model and one PPO epoch, (b) DPO, (c) GRPO with G = 8 and one inner step. Then compute the peak weight-and-optimiser memory of DPO and GRPO with full fine-tuning, and with LoRA (r = 64, 3.13 GB of adapter state) where the reference is the base with the adapter switched off; for GRPO add the KV cache of the eight samples at 6,000 tokens each (147,456 bytes per token). Compare with Section 6's PPO figures (332.6 GB with full fine-tuning, 43.2 GB with LoRA).
:::

::: solution
(a) PPO: 1 generated sequence; forwards for reference, reward and value (plus old-policy log-probabilities if not kept from generation): 3-4; training: policy and value forward + backward: 2 F + 2 B; in all 5-6 F and 2 B. (b) DPO: no generation; policy 2 F + 2 B (chosen and rejected); reference 2 F, once, and cacheable. (c) GRPO: 8 generated sequences; reference 8 F; old-policy log-probabilities 8 F or none (with one inner step rho = 1); policy 8 F + 8 B; no reward-model or value passes (the verifier is code). Memory, full fine-tuning: DPO 152.8 (policy states) + 19.1 (reference) = 171.9 GB, or 152.8 GB with reference log-probabilities computed in advance; GRPO 171.9 GB + 8 x 6,000 x 147,456 B = 7.1 GB of cache = 179.0 GB. LoRA: DPO 19.10 + 3.13 = 22.2 GB; GRPO 22.2 + 7.1 = 29.3 GB. PPO needs about twice DPO's memory in both settings (a second trained model under full fine-tuning, a separate reward model under LoRA); GRPO's extra is the cache of the group being generated. Activations come on top of all of these.
:::


::: exercise id=e9 level=1 kind=conceptual minutes=5
(a) The coverage 1 - (1 - p)^n assumes that every prompt has the same pass rate p. In a real prompt set pass rates spread around the same mean. Why is the average coverage then below the formula's value at the mean, and which prompts stay uncovered for any n? (b) Over three rounds of expert iteration that keep every accepted sample, how does the mix of prompts in the training set change, and what simple rule prevents it? (c) The KL of a best-of-n policy from the base grows like log n. What does that imply about how far selection alone can move a policy for a given amount of sampling, and about how best-of-n against a learned reward model degrades as n grows?
:::

::: solution
(a) 1 - (1 - p)^n is concave in p, so by Jensen's inequality the average coverage over prompts is at most the coverage at the average pass rate; prompts with p near 0 stay uncovered for any affordable n. (b) Easy prompts yield up to n accepted samples and hard ones few or none, so the set drifts toward easy prompts and the model sharpens on what it already does; cap the kept samples per prompt (one, or k), as Section 8's yield example does. (c) Each doubling of n raises the bound by less than ln 2 = 0.69 nats, so moving a policy several nats from the base takes exponentially many samples per prompt; that is why RL changes the weights instead. For the same reason selection can still exploit a learned reward. Lab 3 shows a gradual decline in its chosen true reward, but the KL bound does not rule out abrupt quality failures for other proxies or response distributions.
:::


::: exercise id=e10 level=2 kind=calculation minutes=10
(a) A GRPO group of G = 8 receives partial-credit rewards (0.6, 0.6, 0.2, 1.0, 0.0, 0.4, 0.6, 0.2). Compute the advantages with the unbiased standard deviation, as the source's code does, and check that they sum to zero. (b) With binary rewards and G = 8, what fraction of groups carries any task-advantage signal at pass rate 0.8? (c) For prompts with pass rate 0.95, how large must G be for at least half of the groups to carry signal, and what does that cost in samples per prompt against G = 8?
:::

::: solution
(a) Mean 0.45; deviations (0.15, 0.15, -0.25, 0.55, -0.45, -0.05, 0.15, -0.25), squares summing to 0.70; unbiased variance 0.70 / 7 = 0.10, standard deviation 0.316; advantages (0.474, 0.474, -0.791, 1.739, -1.423, -0.158, 0.474, -0.791), summing to zero. The best answer gets the largest push, the empty one the largest penalty, and 0.4, just below the mean, is pushed down slightly. (b) 1 - 0.8^8 - 0.2^8 = 1 - 0.168 - 0.000003 = 0.832. (c) Need 0.95^G + 0.05^G <= 0.5; the second term is negligible, so G >= ln 0.5 / ln 0.95 = 13.5, i.e. G = 14 (0.512; G = 13 gives 0.487). That is 14 samples per prompt instead of 8, 75% more generation, for prompts that carry signal in only 34% of groups at G = 8 (Section 9); dropping such prompts, or re-sampling groups without signal (dynamic sampling), is usually cheaper. Zero task advantages do not remove a separate KL gradient. Discarding groups or prompts changes the training distribution, so report the attempts and resulting curriculum.
:::


::: exercise id=e11 level=3 kind=coding minutes=25
A model writes fault trees as JSON: {"top": id, "events": {id: {"type": "gate", "gate": "AND" or "OR", "children": [ids]} or {"type": "basic", "p": number, "label": text}}}. (a) Write reward(brief_components, reply) that returns 0.0 for an unparseable reply and otherwise partial credit for these rules: the top event exists and is a gate; every gate has at least two children; every child id exists; there are no cycles; every event is reachable from the top; every basic probability is in [0, 1]; every component named in the brief appears in some basic event's label. (b) Construct a degenerate reply that scores at least 0.8 on your first version without being a useful tree. (c) Change the reward so that the degenerate reply scores below a genuine two-gate tree for the same brief, and test both.
:::

::: solution
The first reward averages seven structural predicates. The duplicate-child artifact passes them: arity counts two entries and the label contains every component. It still has one basic event and supplies no defensible model of separate failures. The code below rejects malformed schemas, missing roots, cycles and unreachable nodes without crashing, then tightens child distinctness and assigns an explicit component name to each basic event. It deliberately does not penalise equal probabilities: two different failures may legitimately have equal probability. Neither score verifies that probabilities or gate semantics are justified by engineering evidence.

```python
import json

def structure(components, reply, strict=False):
    try:
        obj = json.loads(reply)
        events, top = obj["events"], obj["top"]
        if not isinstance(events, dict) or not events or not isinstance(top, str):
            return None
        if top not in events:
            return None
        gates, basics = [], []
        for key, event in events.items():
            if not isinstance(key, str) or not isinstance(event, dict):
                return None
            if event.get("type") == "gate":
                children = event.get("children")
                if event.get("gate") not in {"AND", "OR"}:
                    return None
                if not isinstance(children, list):
                    return None
                if not all(isinstance(child, str) for child in children):
                    return None
                gates.append(event)
            elif event.get("type") == "basic":
                value = event.get("p")
                if isinstance(value, bool) or not isinstance(value, (int, float)):
                    return None
                if not isinstance(event.get("label"), str):
                    return None
                basics.append(event)
            else:
                return None
        visiting, visited = set(), set()

        def visit(key):
            if key in visiting:
                raise ValueError("cycle")
            if key in visited or key not in events:
                return
            visiting.add(key)
            for child in events[key].get("children", []):
                visit(child)
            visiting.remove(key)
            visited.add(key)

        # Inspect every component, including disconnected cycles.
        for key in events:
            visit(key)
        reached = set()

        def reach(key):
            if key in reached or key not in events:
                return
            reached.add(key)
            for child in events[key].get("children", []):
                reach(child)

        reach(top)
        checks = [events[top].get("type") == "gate",
                  all(len(g["children"]) >= 2 for g in gates),
                  all(c in events for g in gates for c in g["children"]),
                  True, reached == set(events),
                  all(0 <= b["p"] <= 1 for b in basics),
                  all(any(c.casefold() in b["label"].casefold()
                          for b in basics) for c in components)]
        if strict:
            checks[1] = all(len(set(g["children"])) >= 2 and
                            len(set(g["children"])) == len(g["children"])
                            for g in gates)
        return checks, basics
    except (ValueError, KeyError, TypeError, RecursionError):
        return None

def reward(components, reply, strict=False):
    result = structure(components, reply, strict)
    if result is None:
        return 0.0
    checks, basics = result
    if not strict:
        return sum(checks) / len(checks)
    # Explicit component IDs avoid credit for a label containing every name.
    coverage = (sum(any(b.get("component") == c for b in basics)
                    for c in components) / len(components)) if components else 0
    penalty = 0.2 if len(basics) < len(components) else 0
    return max(0.0, 0.6 * sum(checks) / len(checks) + 0.4 * coverage - penalty)

components = ["pump", "valve", "seal", "motor"]
degenerate = json.dumps({"top": "G0", "events": {
    "G0": {"type": "gate", "gate": "OR", "children": ["B1", "B1"]},
    "B1": {"type": "basic", "p": 0.5,
           "label": "pump valve seal motor failure"}}})
events = {"G0": {"type": "gate", "gate": "OR", "children": ["G1", "B3", "B4"]},
          "G1": {"type": "gate", "gate": "AND", "children": ["B1", "B2"]}}
for i, component in enumerate(components, 1):
    events[f"B{i}"] = {"type": "basic", "p": 0.01 * i,
                       "component": component, "label": component + " failure"}
genuine = json.dumps({"top": "G0", "events": events})
cycle = json.dumps({"top": "G0", "events": {
    "G0": {"type": "gate", "gate": "OR", "children": ["G0", "G0"]}}})
print(f"initial degenerate: {reward(components, degenerate):.3f}")
print(f"revised degenerate: {reward(components, degenerate, True):.3f}")
print(f"revised two-gate: {reward(components, genuine, True):.3f}")
print("malformed/empty/cycle:", " ".join(
    f"{reward(components, reply, True):.3f}" for reply in
    ["not JSON", '{"top":"G0","events":{}}', cycle]))
assert reward(components, degenerate, True) < reward(components, genuine, True)
assert reward(components, cycle, True) == 0
```

```output
initial degenerate: 1.000
revised degenerate: 0.314
revised two-gate: 1.000
malformed/empty/cycle: 0.000 0.000 0.000
```
:::


::: exercise id=e12 level=1 kind=conceptual minutes=5
After preference optimisation, a model that was well calibrated states higher confidence than before on a held-out question set, while its accuracy has not changed. (a) What has happened to its calibration, and how can preference training cause it? (b) The team now wants the model to abstain when unsure, using Module 07's scoring rule (+1 correct, 0 abstain, -lambda wrong). Why does the rule work only as well as the model's calibration? (c) Name one change to the training signal and one to the evaluation that make 'I do not know' worth something.
:::

::: solution
(a) It has become over-confident: in each confidence bin accuracy now falls short of confidence, so the expected calibration error (Module 01, Section 7) has risen. Comparisons tend to reward answers that sound confident and complete, so preference optimisation can push stated confidence up whatever the correctness; the GPT-4 technical report shows calibration worsening after post-training, while some base models show useful calibration in specified multiple-choice experiments (Kadavath et al. 2022). (b) The rule says answer only when p > lambda / (1 + lambda), but the model acts on its own estimate of p; an over-confident model overestimates p, crosses the threshold when it should not, and guesses. The threshold is only as good as the probability fed into it. (c) Training: a reward that scores abstention above a wrong answer (lambda > 0) in RL, SFT examples that abstain on unanswerable prompts, or preference pairs in which an honest 'I do not know' beats a confident wrong answer. Evaluation: report accuracy, error rate and abstention rate separately (or the penalised score) instead of accuracy alone, and measure calibration before and after each stage.
:::


::: exercise id=e13 level=2 kind=calculation minutes=10
Two checkpoints are evaluated on the same 200 items. B passes 18 items that A fails, A passes 8 items that B fails, and the other 174 agree. (a) Compute the paired difference in pass rate and its 95% normal-approximation interval. (b) Compute McNemar's exact two-sided p-value. (c) What would you report, and what would you change about the evaluation?
:::

::: solution
(a) d = (18 - 8) / 200 = 0.05; per-item variance 26/200 - 0.05^2 = 0.1275; standard error sqrt(0.1275 / 200) = 0.0252; interval 0.05 +/- 0.0495 = [0.001, 0.099]. (b) 26 discordant items, 8 of one kind: p = 2 x sum_{j<=8} C(26, j) / 2^26 = 0.07552. (c) The normal interval barely excludes zero and the exact test does not reject at 5%: report +5 points [0.1, 9.9], McNemar p = 0.08, inconclusive. Enlarge the suite (the same rates on 800 items give a standard error of 0.0126 and an interval of [2.5, 7.5] points), fix seeds, and check whether items cluster by template.
:::


::: exercise id=e14 level=1 kind=conceptual minutes=5
A pairwise judge compares a new model's answers with the incumbent's, each pair shown in both orders. (a) On some pairs the verdict flips when the order is swapped. What is the judge's verdict on such a pair worth, and how does swap-averaging count it? (b) The new model's answers are longer on average. Why does swap-averaging not remove the judge's length bias, and how can you estimate a length-controlled win rate? (c) Name two numbers you would report alongside the win rate so that a reader can judge the judge.
:::

::: solution
(a) A flip means the judge's preference on that pair is weaker than its position bias: the pair is in effect a tie. Swap-averaging counts it as half a win for each side, which balances presentation order; it need not remove every nonlinear interaction between position and quality (Section 12's example). (b) The new model's answer is longer in both orders, so the length bias pushes both verdicts the same way and averaging over orders leaves it intact; regress the verdicts on the length difference and read a model-based win rate at zero difference, with uncertainty and checks on the regression assumptions (Lab 6), or use a length-controlled win rate (Dubois et al. 2024). (c) The consistency rate across the two orders and the judge's agreement with a human-labelled sample; also worth stating: the judge's model family (self-preference) and an interval on the win rate.
:::


::: exercise id=e15 level=1 kind=conceptual minutes=5
Two rank-r adapters (B1, A1) and (B2, A2) for the same matrix, each with its alpha / r folded into its B, are to be merged with equal weight. (a) Expand the product of the averaged factors, ((B1 + B2) / 2)((A1 + A2) / 2), and name the terms that make it differ from the average of the updates, (B1 A1 + B2 A2) / 2. (b) What rank can the correct merge have, and how can it be stored exactly as an adapter? (c) Why is merging any adapter into a 4-bit base not exact, and what order of operations avoids the problem?
:::

::: solution
(a) (B1 A1 + B1 A2 + B2 A1 + B2 A2) / 4: each adapter's own update gets weight 1/4 instead of 1/2, and two cross terms, B1 A2 and B2 A1, appear that neither adapter learned (Section 13's example: 0.5 I against a matrix of 0.25s). (b) Up to 2r, since the sum of two rank-r matrices can have rank up to 2r. Store it exactly as a rank-2r adapter by concatenation, B = [B1, B2] / sqrt(2) and A = [A1; A2] / sqrt(2), so that B A = (B1 A1 + B2 A2) / 2, or add it into W. (c) Adding a full-precision update to 4-bit weights means dequantising, adding and requantising, and the requantisation rounds the update (small changes can vanish below the quantisation step); merge into bf16 weights, then quantise the merged model and evaluate it again (Section 4; Module 10).
:::
