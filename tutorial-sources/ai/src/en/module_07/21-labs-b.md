## Lab 4 — Chat templates and in-context learning {#lab4}

**Goal.** Render an instruct model's actual chat format, compare templated and raw
generation, and test how demonstration selection, order and labels affect a small
classification task. Cache a shared prefix and check its predictions against a full
forward pass. There is no fine-tuning in this lab.

The first run downloads about 988 MB of weights from
[Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct), plus its
tokenizer files. Float32 weights occupy about 2 GB of RAM; allow several GB for the
model and work space. The texts below are invented examples for classification.
Their mention of records and tests does not make them evidence about a real system.

### Render the trained conversation format

`apply_chat_template` inserts role markers, turn endings and an assistant prefix.
Count the whole rendered prompt, not just its message bodies. Tokenising an already
rendered template uses `add_special_tokens=False`, because the template supplies
the necessary special tokens.

```python
import copy
import json
import random
from pathlib import Path
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

torch.manual_seed(0)
torch.set_num_threads(4)
MODEL = "Qwen/Qwen2.5-0.5B-Instruct"
REVISION = "7ae557604adf67be50417f59c2c2f167def9a775"
tok = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
model = AutoModelForCausalLM.from_pretrained(
    MODEL, revision=REVISION, dtype=torch.float32,
).eval()
question = "What is a safety goal in ISO 26262?"
messages = [
    {"role": "system", "content": "You are a safety engineer. Answer in one sentence."},
    {"role": "user", "content": question},
]
rendered = tok.apply_chat_template(messages, tokenize=False,
                                  add_generation_prompt=True)
print(rendered)
print("Templated tokens:", len(tok.encode(rendered, add_special_tokens=False)))
print("Body tokens:", sum(len(tok.encode(m["content"], add_special_tokens=False))
                          for m in messages))
print("No explicit system message:")
print(tok.apply_chat_template([messages[1]], tokenize=False,
                             add_generation_prompt=True))

@torch.inference_mode()
def answer(messages, sample=False):
    enc = tok.apply_chat_template(messages, add_generation_prompt=True,
                                 return_tensors="pt", return_dict=True)
    settings = dict(max_new_tokens=60, do_sample=sample,
                    pad_token_id=tok.eos_token_id)
    if sample:
        settings.update(temperature=0.7, top_p=0.9)
    output = model.generate(**enc, **settings)
    return tok.decode(output[0, enc["input_ids"].shape[1]:], skip_special_tokens=True)

torch.manual_seed(0)
print("Sampled:", answer(messages, sample=True))
print("Greedy:", answer(messages))
raw = tok(question, return_tensors="pt")
with torch.inference_mode():
    output = model.generate(**raw, max_new_tokens=40, do_sample=False,
                            pad_token_id=tok.eos_token_id)
print("Raw continuation:", tok.decode(output[0, raw["input_ids"].shape[1]:],
                                       skip_special_tokens=True))
```

```output
<|im_start|>system
You are a safety engineer. Answer in one sentence.<|im_end|>
<|im_start|>user
What is a safety goal in ISO 26262?<|im_end|>
<|im_start|>assistant

Templated tokens: 38
Body tokens: 25
No explicit system message:
<|im_start|>system
You are Qwen, created by Alibaba Cloud. You are a helpful assistant.<|im_end|>
<|im_start|>user
What is a safety goal in ISO 26262?<|im_end|>
<|im_start|>assistant

Sampled: A safety goal in ISO 26262 should aim to reduce the risk of human error or operational errors that could lead to system failures, ensuring safe and reliable operations.
Greedy: A safety goal in ISO 26262 is to ensure that the design and implementation of safety systems meet specified requirements, thereby reducing risks and enhancing operational safety.
Raw continuation:  A. To ensure that the system will not cause any damage to people, property or the environment B. To ensure that the system will not cause any harm to people C. To ensure that the system
```

Evaluate the content as well as the format. A safety goal is a top-level safety
requirement resulting from hazard analysis and risk assessment. A fluent answer
about generic testing or system reliability can miss that definition. Role markers
help the model follow the conversation it was trained on; they do not validate the
answer. The raw prompt can instead resemble a document awaiting continuation.

### Define independent demonstration and test pools

Items 0–7 of each class are available for demonstrations. Items 12–19 form a fixed
16-item test set; items 8–11 are reserved for extensions. Keep the split fixed across
conditions. Choosing examples after seeing test errors would turn the test set into
a development set.

```python
CLAIMS = [
    "The pressure relief valve opens before the vessel pressure exceeds its design limit.",
    "All hazards identified in the hazard analysis have been adequately mitigated.",
    "The pump control software is free of run-time errors.",
    "The emergency stop removes power from all motors within 200 milliseconds.",
    "The braking system is acceptably safe to operate on public roads.",
    "Common-cause failures between the two sensor channels have been eliminated.",
    "The operating procedures are adequate for trained staff.",
    "The residual risk from overheating is as low as reasonably practicable.",
    "The watchdog detects a stalled control loop within one cycle.",
    "The alarm is audible in every part of the plant room.",
    "The battery enclosure prevents thermal runaway from spreading between cells.",
    "The maintenance interval keeps the failure rate within its target.",
    "The interlock prevents the door from opening while the drum is rotating.",
    "No single sensor fault can cause an unsafe valve command.",
    "The shutdown function meets its allocated safety integrity level.",
    "The controller keeps running during a mains power failure.",
    "The robot cannot exceed its speed limit when a person is inside the cell.",
    "The software update process cannot install an unsigned image.",
    "Operators can always see the current state of the reactor.",
    "The crane load limiter prevents lifts above the rated capacity.",
]
EVIDENCE = [
    "Test report TR-104 records 500 successful valve openings at the set pressure.",
    "The hazard log, version 3.2, lists 47 hazards with their mitigations.",
    "Static analysis of the pump software reported zero possible run-time errors.",
    "Oscilloscope traces from the March commissioning test show power removed in 140 milliseconds.",
    "The FMEA worksheet dated May 2026 identifies 31 failure modes of the braking system.",
    "Inspection record IR-17 confirms that the two sensor channels have separate power supplies.",
    "Training records show that all twelve operators passed the procedure assessment.",
    "Thermal simulation results give a maximum casing temperature of 61 degrees C at full load.",
    "The unit test log for the watchdog module contains 1,240 passed tests and no failures.",
    "Sound level measurements taken on 4 June range from 78 to 85 dB across the plant room.",
    "The laboratory certificate for the cell propagation test reports no propagation after nail penetration.",
    "Field data from 230 installed units show 3 failures in 1.1 million operating hours.",
    "The proof-test record signed on 2 September shows the door stayed locked in 20 of 20 trials.",
    "Fault-injection results show the valve command stayed safe in all 64 single-fault cases.",
    "The independent assessment report, issue 2, documents the integrity calculation for the shutdown function.",
    "Switchover measurements show the controller supply never dropped below 22 V.",
    "Speed logs from 40 hours of collaborative operation show a maximum speed of 0.24 m/s.",
    "The release checklist for version 4.1 records a verified signature for every image.",
    "Usability test notes from 8 operators record the time taken to read each display.",
    "Calibration certificate LC-55 records the load limiter trip point at 101% of rated load.",
]
test_texts = CLAIMS[12:] + EVIDENCE[12:]
truth = np.array([True] * 8 + [False] * 8)
AB_SYSTEM = "Classify each statement as A or B. Answer with the label only."
SEMANTIC_SYSTEM = (
    "Classify each statement from a safety case as CLAIM or EVIDENCE. "
    "A CLAIM is a proposition that must be supported by an argument. "
    "EVIDENCE is a record or result that supports a claim. Answer with the label only."
)
def balanced_demos(k, seed):
    rng = random.Random(seed)
    chosen = [(CLAIMS[i], True) for i in rng.sample(range(8), k // 2)]
    chosen += [(EVIDENCE[i], False) for i in rng.sample(range(8), k // 2)]
    rng.shuffle(chosen)
    return chosen

print("Demonstration pool:", 16, "test items:", len(test_texts))
```

```output
Demonstration pool: 16 test items: 16
```

### Cache the common token prefix

Build and tokenise every complete prompt first, then find their common *token*
prefix. Splitting a rendered string before the statement and tokenising the pieces
separately can change BPE boundaries. Computing the shared token sequence avoids
that error while retaining the efficiency benefit of prefix caching.

Each suffix gets a deep copy of the cache because a forward pass can mutate it.
This uses extra memory but keeps the experiment's branching explicit. Compare the
first suffix's label margin against a full forward pass before trusting the cache.
The classifier uses the first token of each label, not the probability of a whole
multi-token label; print those token IDs to make that simplification visible.

```python
def prompt_ids(text, demos, labels, system):
    messages = [{"role": "system", "content": system}]
    for statement, is_claim in demos:
        messages += [
            {"role": "user", "content": "Statement: " + statement},
            {"role": "assistant", "content": labels[0 if is_claim else 1]},
        ]
    messages.append({"role": "user", "content": "Statement: " + text})
    rendered = tok.apply_chat_template(messages, tokenize=False,
                                      add_generation_prompt=True)
    return tok.encode(rendered, add_special_tokens=False)

@torch.inference_mode()
def score_condition(demos, labels=("A", "B"), system=AB_SYSTEM):
    sequences = [prompt_ids(text, demos, labels, system) for text in test_texts]
    common = 0
    for tokens in zip(*sequences):
        if len(set(tokens)) != 1:
            break
        common += 1
    assert 0 < common < min(map(len, sequences))
    prefix = torch.tensor([sequences[0][:common]])
    cache = model(prefix, use_cache=True, logits_to_keep=1).past_key_values
    label_ids = [tok.encode(label, add_special_tokens=False)[0] for label in labels]
    assert label_ids[0] != label_ids[1]
    margins = []
    for sequence in sequences:
        suffix = torch.tensor([sequence[common:]])
        mask = torch.ones((1, len(sequence)), dtype=torch.long)
        logits = model(suffix, attention_mask=mask, past_key_values=copy.deepcopy(cache),
                       use_cache=True, logits_to_keep=1).logits[0, -1].float()
        margins.append(float(logits[label_ids[0]] - logits[label_ids[1]]))
    full = model(torch.tensor([sequences[0]]), use_cache=False,
                 logits_to_keep=1).logits[0, -1].float()
    difference = abs(float(full[label_ids[0]] - full[label_ids[1]]) - margins[0])
    assert difference < 2e-3, difference
    predicted = np.array(margins) > 0
    return dict(accuracy=float((predicted == truth).mean()),
                fraction_claim=float(predicted.mean()), cache_error=difference,
                prefix_tokens=common, margins=margins)

for labels in [("A", "B"), ("CLAIM", "EVIDENCE")]:
    print(labels, [tok.encode(label, add_special_tokens=False) for label in labels])
baseline = score_condition([])
print("Cache/full margin error:", f"{baseline['cache_error']:.8f}",
      "cached prefix tokens:", baseline["prefix_tokens"])
```

```output
('A', 'B') [[32], [33]]
('CLAIM', 'EVIDENCE') [[22568], [36, 7483, 10150]]
Cache/full margin error: 0.00000000 cached prefix tokens: 25
```

### Vary the demonstrations and label meanings

For each nonzero count, draw three balanced sets and shuffle their order with the
specified seeds. These are three small perturbations, not a confidence interval
for deployment. Then hold four demonstration texts fixed while changing their
labels or order. Incorrect all-A/all-B labels test sensitivity to the context;
they are deliberately inconsistent with the task.

```python
results = {"A/B k=0": baseline}
for k in [2, 4, 8]:
    for i in range(3):
        results[f"A/B k={k} set={i}"] = score_condition(balanced_demos(k, 10*k+i))
fixed = [(CLAIMS[0], True), (CLAIMS[1], True),
         (EVIDENCE[0], False), (EVIDENCE[1], False)]
results["four all A"] = score_condition([(text, True) for text, _ in fixed])
results["four all B"] = score_condition([(text, False) for text, _ in fixed])
results["order A A B B"] = score_condition(fixed)
results["order B B A A"] = score_condition(fixed[2:] + fixed[:2])
for k in [0, 8]:
    results[f"semantic k={k}"] = score_condition(
        balanced_demos(k, 10*k), ("CLAIM", "EVIDENCE"), SEMANTIC_SYSTEM,
    )
print(f"{'condition':<20} {'accuracy':>9} {'fraction claim':>15} {'items':>6}")
for name, result in results.items():
    print(f"{name:<20} {result['accuracy']:9.4f} "
          f"{result['fraction_claim']:15.4f} {len(test_texts):6d}")
print("Largest cache/full error:",
      f"{max(r['cache_error'] for r in results.values()):.8f}")
Path("lab4-metrics.json").write_text(json.dumps(results, indent=2), encoding="utf8")
```

```output
condition             accuracy  fraction claim  items
A/B k=0                 0.5000          1.0000     16
A/B k=2 set=0           0.4375          0.9375     16
A/B k=2 set=1           0.5000          1.0000     16
A/B k=2 set=2           0.5000          1.0000     16
A/B k=4 set=0           0.6250          0.7500     16
A/B k=4 set=1           0.5625          0.8125     16
A/B k=4 set=2           0.6250          0.7500     16
A/B k=8 set=0           0.8750          0.6250     16
A/B k=8 set=1           0.6875          0.8125     16
A/B k=8 set=2           0.8750          0.6250     16
four all A              0.4375          0.9375     16
four all B              0.5000          0.0000     16
order A A B B           0.6250          0.8750     16
order B B A A           0.6875          0.3125     16
semantic k=0            0.5000          1.0000     16
semantic k=8            0.8125          0.3125     16
Largest cache/full error: 0.00000954
```

### What you should see

The rendered template supplies more tokens than the message bodies and can insert
a default system message when one is omitted. Templated generation and raw
continuation have different behaviour with the same weights.

Classification depends on demonstration count, selection, order and label meaning.
A model can prefer one label without learning the desired distinction. Report the
fraction predicted claim beside accuracy: 50% on this balanced set can mean that
every item received the same label. One item changes accuracy by 6.25 percentage
points, and the statements share writing conventions. Even a high score would be
weak evidence about classifying unfamiliar real assurance documents.

The cache and full prompt should agree closely. A large discrepancy is a prompt,
position or mask bug, not an effect of in-context learning. Prefix caching is useful
because the demonstrations stay fixed within each condition; changing their order
requires rebuilding the cache.

### Try this

1. Subtract the label margin for a content-free `N/A` statement from every test
   margin. Repeat with an empty statement. Calibration can worsen the result when
   the supposed neutral input has its own label associations.
2. Use the spare examples to extend the demonstration pool. Freeze all prompt
   choices, then write a genuinely new test set before claiming an improvement.
3. Flip the A/B mapping consistently in demonstrations and test scoring. Check
   whether the model follows the new mapping rather than its original label preference.

## Lab 5 — Sampling from scratch {#lab5}

**Goal.** Implement the sampling filters, check them against the library, and
measure entropy, diversity, repetition and batch-dependent numerics on a small
base model. Compare unconstrained generation with scoring a closed set of labels.

This lab runs independently. Its pinned SmolLM2-135M checkpoint requires about
269 MB of weights on first use, or uses the cache from Lab 1. The model is a base
language model rather than an instruct model. Its continuations are examples of
sampling behaviour, not verified engineering statements.

### Read a real next-token distribution

```python
import math
import json
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from transformers.generation.logits_process import (
    TemperatureLogitsWarper, TopKLogitsWarper, TopPLogitsWarper, MinPLogitsWarper,
)

torch.manual_seed(0)
torch.set_num_threads(4)
MODEL = "HuggingFaceTB/SmolLM2-135M"
REVISION = "93efa2f097d58c2a74874c7e644dbc9b0cee75a2"
tok = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
model = AutoModelForCausalLM.from_pretrained(
    MODEL, revision=REVISION, dtype=torch.float32,
).eval()
P_A = "After the test, the engineer reported that the valve was"
P_OPEN = "The pressure relief valve is the last line of defence because"
P_LOOP = "The valve"
P_SEV = "The hazard was classified as"

@torch.inference_mode()
def last_logits(prompt):
    return model(**tok(prompt, return_tensors="pt"), use_cache=False,
                 logits_to_keep=1).logits[0, -1].float()

logits_a = last_logits(P_A)
prob_a = logits_a.softmax(-1)
values, indices = logits_a.topk(12)
print("token                 logit probability")
for index, value in zip(indices.tolist(), values.tolist()):
    print(f"{tok.decode([index])!r:20} {value:7.3f} {prob_a[index]:11.6f}")
print("Full entropy (nats):", f"{torch.special.entr(prob_a).sum():.4f}")
```

```output
token                 logit probability
' not'                25.702    0.075044
' leaking'            25.316    0.051039
' working'            25.124    0.042113
' in'                 24.617    0.025372
' operating'          24.426    0.020946
' still'              24.379    0.020001
' failing'            24.278    0.018063
' "'                  24.235    0.017307
' functioning'        24.152    0.015938
' defective'          24.045    0.014319
' too'                23.971    0.013289
' open'               23.905    0.012439
Full entropy (nats): 5.6912
```

The widget renormalises over twelve displayed candidates. Their entropy differs
from the full vocabulary's entropy because thousands of tail candidates have
been excluded. Do not read the widget's twelve-token entropy as a model-wide value.

### Implement and verify sequential filters

Apply temperature, top-k, top-p and min-p in that order. Top-k retains all ties at
its cutoff. Top-p retains the smallest sorted prefix reaching the threshold,
including the token that crosses it. Min-p then compares each surviving token with
the maximum; the renormalisation from earlier filters cancels in that ratio.
Require valid arguments and leave at least one finite logit in each row.

```python
def apply_filters(logits, temperature=1.0, top_k=0, top_p=1.0, min_p=0.0):
    assert temperature > 0 and 0 < top_p <= 1 and 0 <= min_p <= 1
    assert 0 <= top_k <= logits.shape[-1]
    scores = logits.float().clone() / temperature
    if top_k:
        cutoff = scores.topk(top_k, dim=-1).values[:, -1:]
        scores.masked_fill_(scores < cutoff, -torch.inf)
    if top_p < 1:
        sorted_scores, order = scores.sort(dim=-1, descending=True)
        probs = sorted_scores.softmax(-1)
        remove = probs.cumsum(-1) - probs >= top_p
        remove[:, 0] = False
        original_order = torch.zeros_like(remove).scatter(1, order, remove)
        scores.masked_fill_(original_order, -torch.inf)
    if min_p:
        probs = scores.softmax(-1)
        scores.masked_fill_(probs < min_p * probs.max(-1, keepdim=True).values,
                            -torch.inf)
    assert torch.isfinite(scores).any(-1).all()
    return scores

test_logits = torch.randn(4, 1000, generator=torch.Generator().manual_seed(0))
dummy_ids = torch.zeros((4, 1), dtype=torch.long)
conditions = [(0.7, 40, 0.9, 0.1), (1.5, 0, 1.0, 0.1),
              (1.0, 0, 0.01, 0.0), (1.0, 1, 0.9, 0.5)]
for temperature, top_k, top_p, min_p in conditions:
    ours = apply_filters(test_logits, temperature, top_k, top_p, min_p)
    reference = TemperatureLogitsWarper(temperature)(dummy_ids, test_logits)
    if top_k:
        reference = TopKLogitsWarper(top_k)(dummy_ids, reference)
    if top_p < 1:
        reference = TopPLogitsWarper(top_p)(dummy_ids, reference)
    if min_p:
        reference = MinPLogitsWarper(min_p)(dummy_ids, reference)
    disagreements = (torch.isfinite(ours) != torch.isfinite(reference)).sum().item()
    assert disagreements == 0
    assert torch.allclose(ours[torch.isfinite(ours)], reference[torch.isfinite(ours)])
    print((temperature, top_k, top_p, min_p), "support disagreements:", disagreements)

top_values = values.double()
def entropy_at(temperature):
    p = (top_values / temperature).softmax(-1)
    return float(torch.special.entr(p).sum())

epsilon = 1e-4
derivative = (entropy_at(1 + epsilon) - entropy_at(1 - epsilon)) / (2 * epsilon)
p = top_values.softmax(-1)
variance = float((p * (top_values - (p * top_values).sum())**2).sum())
print("dH/dtau at 1 (nats):", f"{derivative:.6f}", "Var(z):", f"{variance:.6f}")
temperatures = np.logspace(-1, 1, 41)
plt.figure(figsize=(7, 3))
plt.semilogx(temperatures, [entropy_at(t)/math.log(2) for t in temperatures])
plt.xlabel("Temperature")
plt.ylabel("Entropy (bits)")
plt.title("Twelve-candidate distribution: entropy increases with temperature")
plt.tight_layout()
plt.show()
```

```output
(0.7, 40, 0.9, 0.1) support disagreements: 0
(1.5, 0, 1.0, 0.1) support disagreements: 0
(1.0, 0, 0.01, 0.0) support disagreements: 0
(1.0, 1, 0.9, 0.5) support disagreements: 0
dH/dtau at 1 (nats): 0.395793 Var(z): 0.395793
```

The finite difference checks $dH/d\tau=\mathrm{Var}_{p_\tau}(z)/\tau^3$ at
$\tau=1$, using entropy in nats. Divide by $\ln2$ for a derivative in bits.
The library comparison uses continuous random logits, avoiding ties exactly at a
top-p boundary. Tie policies and floating-point rounding can matter on artificial
boundary cases even when the mathematical filter is the same.

### Generate batches and measure the sampled distributions

Use a private seeded generator for each condition. The loop always emits the stated
number of tokens, including any special tokens; it deliberately has no early-stop
policy. This makes sample lengths comparable. A production generator would normally
stop at an end marker. Entropy is measured *after* filtering. Distinct-2 counts
unique adjacent ID pairs across all continuations divided by their total count.

```python
@torch.inference_mode()
def generate(prompt, n=8, steps=30, greedy=False, penalty=1.0, **settings):
    inputs = tok(prompt, return_tensors="pt")["input_ids"].repeat(n, 1)
    output = model(inputs, use_cache=True, logits_to_keep=1)
    generated, entropies, gaps = [], [], []
    rng = torch.Generator().manual_seed(0)
    for step in range(steps):
        scores = output.logits[:, -1].float().clone()
        if penalty != 1 and generated:
            history = torch.stack(generated, dim=1)
            for row in range(n):
                seen = history[row].unique()
                old = scores[row, seen]
                scores[row, seen] = torch.where(old < 0, old * penalty, old / penalty)
        top = scores.topk(2, dim=-1).values
        gaps.append(float((top[:, 0] - top[:, 1]).min()))
        if greedy:
            next_ids = scores.argmax(-1)
            entropies.append(0.0)
        else:
            probs = apply_filters(scores, **settings).softmax(-1)
            entropies.append(float(torch.special.entr(probs).sum(-1).mean()))
            next_ids = torch.multinomial(probs, 1, generator=rng).squeeze(1)
        generated.append(next_ids)
        if step + 1 < steps:
            output = model(next_ids[:, None], past_key_values=output.past_key_values,
                           use_cache=True, logits_to_keep=1)
    ids = torch.stack(generated, dim=1).tolist()
    pairs = [pair for sequence in ids for pair in zip(sequence, sequence[1:])]
    distinct = len(set(pairs)) / len(pairs) if pairs else 0.0
    return dict(ids=ids, entropy=float(np.mean(entropies)), distinct2=distinct,
                minimum_gap=min(gaps))

settings = {
    "greedy": dict(greedy=True), "tau=0.7": dict(temperature=0.7),
    "tau=1.0": dict(temperature=1.0), "tau=1.5": dict(temperature=1.5),
    "top-k=40": dict(top_k=40), "top-p=0.9": dict(top_p=0.9),
    "min-p=0.1": dict(min_p=0.1),
    "tau=1.5 min-p=0.1": dict(temperature=1.5, min_p=0.1),
}
results = {}
for name, options in settings.items():
    result = generate(P_OPEN, **options)
    results[name] = result
    print(name, "entropy:", f"{result['entropy']:.3f}",
          "distinct-2:", f"{result['distinct2']:.3f}")
    print(" ", tok.decode(result["ids"][0], skip_special_tokens=False))
```

```output
greedy entropy: 0.000 distinct-2: 0.121
   it is the only line of defence against the pressure of the water.

The pressure relief valve is a valve that is used to control the pressure
tau=0.7 entropy: 1.573 distinct-2: 0.737
   the valve opens when the pressure is below the atmospheric pressure. With this valve in place the pressure changes are reflected to the pressure relief valve.


tau=1.0 entropy: 3.164 distinct-2: 0.901
   whenever the pressure on a valve goes below the rated value the pressure relief valve goes into the master solenoid and shuts off the main power. Pressure
tau=1.5 entropy: 8.080 distinct-2: 1.000
   whenever the fin collapses out of the SER logo in Terminal Services Players BackProteinNOW.)$BillMihlen]
King ndarray dodabooste Smart
top-k=40 entropy: 2.232 distinct-2: 0.918
   the air that blows out of the gas-to-air line enters the house through the outside vent pipe and escapes through the pipe that goes back inside
top-p=0.9 entropy: 2.700 distinct-2: 0.914
   the tension produced by the valve can also be used to provide the means of stopping the cylinder from squeezing out the gas through the pipe.

    The pressure
min-p=0.1 entropy: 1.291 distinct-2: 0.819
   the valve opens when a person is sitting up in bed. When this valve is closed the pressure is kept low and the patient can be kept comfortable.
tau=1.5 min-p=0.1 entropy: 2.100 distinct-2: 0.940
   the air inlet (inlet) of the main pipe to the
standpipe is the only one that does not open into a main pipe. Pressure
```

Distinct-2 rewards diversity, including incoherent diversity. It cannot establish
truth or readability. Eight identical greedy samples will have low pooled diversity
even if each individual continuation contains no repeated bigram. Compare the text
and entropy with the metric rather than optimising it alone.

### Repetition and closed-set choice

The repetition penalty changes each previously generated token's logit once per
step: divide a positive logit by the penalty, multiply a negative one. Multiplying
every logit by the same factor would merely change temperature. This implementation
penalises generated tokens only, not prompt tokens.

For the severity choice, sum the log-probabilities of each complete candidate
continuation. This teacher-forced score differs from sampling the next token and
hoping that the resulting text remains inside the allowed set. It gives a relative
distribution conditional on choosing one of these four strings, not a calibrated
hazard classification. No incident facts have been supplied to determine severity.

```python
def repeated_fourgrams(sequence):
    grams = [tuple(sequence[i:i+4]) for i in range(len(sequence)-3)]
    return 1 - len(set(grams))/len(grams)

for penalty in [1.0, 1.3]:
    result = generate(P_LOOP, n=1, steps=80, greedy=True, penalty=penalty)
    print("Penalty:", penalty, "repeated 4-grams:",
          f"{repeated_fourgrams(result['ids'][0]):.3f}")
    print(P_LOOP + tok.decode(result["ids"][0]))

@torch.inference_mode()
def continuation_score(prompt, continuation):
    prefix = tok.encode(prompt, add_special_tokens=False)
    whole = tok.encode(prompt + continuation, add_special_tokens=False)
    assert whole[:len(prefix)] == prefix, "Continuation changes the token boundary"
    logits = model(torch.tensor([whole]), use_cache=False).logits[0].float()
    targets = torch.tensor(whole[len(prefix):])
    logp = logits[len(prefix)-1:-1].log_softmax(-1)
    return float(logp.gather(1, targets[:, None]).sum())

candidates = [" catastrophic", " critical", " marginal", " negligible"]
candidate_scores = torch.tensor([continuation_score(P_SEV, c) for c in candidates])
for candidate, score, probability in zip(candidates, candidate_scores,
                                         candidate_scores.softmax(-1)):
    print(repr(candidate), "log score:", f"{score:.4f}",
          "relative probability:", f"{probability:.4f}")
probs = last_logits(P_SEV).softmax(-1)
values_sev, ids_sev = probs.topk(5)
print("Unconstrained top five:", [(tok.decode([i]), round(p, 4))
                                   for i, p in zip(ids_sev.tolist(), values_sev.tolist())])
```

```output
Penalty: 1.0 repeated 4-grams: 0.481
The valve is a device that regulates the flow of air through a pipe. The valve is usually made of a metal or plastic material. The valve is used to control the flow of air in a pipe.

The valve is used to control the flow of air in a pipe. The valve is used to control the flow of air in a pipe. The valve is used to control the flow of air in
Penalty: 1.3 repeated 4-grams: 0.000
The valve is a device that regulates the flow of air through an engine. It consists mainly in two parts:
1) The intake valve, which opens when there’s enough oxygen to burn fuel and ignite it; this allows more gas into your cylinder than you need for combustion (the amount depends on how much power we want). This lets us get our maximum output from each stroke without having too many wasted
' catastrophic' log score: -7.3172 relative probability: 0.2758
' critical' log score: -6.8059 relative probability: 0.4599
' marginal' log score: -9.3847 relative probability: 0.0349
' negligible' log score: -7.5018 relative probability: 0.2293
Unconstrained top five: [(' a', 0.2713), (' "', 0.0485), (' an', 0.0439), (' “', 0.0418), (' high', 0.0231)]
```

### Batch shapes and summation order

Right padding is acceptable for this forward-pass comparison because we explicitly
read each prompt's last real position and supply its attention mask. Reading
`logits[:, -1]` from a padded batch instead would read a padding position. Generation
with variable-length decoder prompts normally uses left padding.

```python
tok.pad_token = tok.eos_token
tok.padding_side = "right"
alone = last_logits(P_OPEN)
batch = tok([P_OPEN, "The valve", P_OPEN + " it limits pressure", "A test failed."],
            padding=True, return_tensors="pt")
with torch.inference_mode():
    output = model(**batch, use_cache=False).logits.float()
    last_real = int(batch["attention_mask"][0].sum()) - 1
    padded_difference = float((alone - output[0, last_real]).abs().max())
    repeated = tok([P_OPEN]*8, return_tensors="pt")
    repeated_logits = model(**repeated, use_cache=False,
                            logits_to_keep=1).logits[0, -1].float()
    repeated_difference = float((alone - repeated_logits).abs().max())
one = generate(P_OPEN, n=1, steps=60, greedy=True)
eight = generate(P_OPEN, n=8, steps=60, greedy=True)
print("Max logit difference, padded/repeated:",
      f"{padded_difference:.8f}", f"{repeated_difference:.8f}")
print("Greedy paths identical:", one["ids"][0] == eight["ids"][0])
print("Minimum top-two gap on batch-1 path:", f"{one['minimum_gap']:.8f}")

x = torch.tensor(1e8, dtype=torch.float32)
print("Float32 association:", float((x+1)-x), float((x-x)+1))
print("Bfloat16 256+1:", float(torch.tensor(256, dtype=torch.bfloat16)+1))
numbers = torch.rand(100000, generator=torch.Generator().manual_seed(0)).numpy()
def sequential_sum(values):
    total = np.float32(0)
    for value in values:
        total = np.float32(total + value)
    return float(total)

print("Float32 sequential natural/reversed/sorted:",
      *(f"{sequential_sum(v):.6f}" for v in [numbers, numbers[::-1], np.sort(numbers)]))
print("Float64 sum:", f"{numbers.sum(dtype=np.float64):.6f}")
metrics = dict(results=results, padded_difference=padded_difference,
               repeated_difference=repeated_difference,
               greedy_same=one["ids"][0] == eight["ids"][0],
               minimum_gap=one["minimum_gap"],
               top12_ids=indices.tolist(), top12_logits=values.tolist())
Path("lab5-metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf8")
```

```output
Max logit difference, padded/repeated: 0.00003242 0.00003481
Greedy paths identical: True
Minimum top-two gap on batch-1 path: 0.02178574
Float32 association: 0.0 1.0
Bfloat16 256+1: 256.0
Float32 sequential natural/reversed/sorted: 50027.738281 50027.503906 50027.308594
Float64 sum: 50027.622247
```

### What you should see

The reference filters agree on the tested supports, and temperature-only entropy
increases monotonically. At high temperature the unfiltered tail can produce
incoherent text; truncation removes much of that tail while retaining alternatives.
The base model can repeat under greedy decoding. A penalty can reduce repetition
while damaging grammar or factual content, so it needs task-specific evaluation.

CPU logits can differ slightly across batch shapes. Such a difference need not
change an argmax: the size of the top-two gap matters. Identical paths on this
prompt do not establish reproducibility across kernels, machines or all prompts.
The simple sums show why a fixed seed alone cannot control reduction order.

### Try this

1. Draw twenty continuations at temperatures 0.2, 0.7 and 1.5. Score each under
   the original temperature-one model and compare diversity with model likelihood.
2. Add typical or epsilon sampling and compare its kept support with top-p.
3. Use greedy beam search with four beams. Measure repetition and inspect its text
   before deciding whether a higher sequence score is useful for this task.


## Lab 6 — A cost calculator for the case study {#lab6}

**Goal.** Recompute the hypothetical safety-case assistant's parameter count, weight
storage, KV cache, arithmetic and daily bill. Separate hardware ceilings from measured
performance and distinguish a cost crossover from a capacity-feasible deployment.
This lab needs NumPy and matplotlib, downloads nothing and makes no provider requests.

### Step 1: count the model from its configuration

The bilingual decoder has 36 layers, width 4096, 32 query heads, eight KV heads of
width 128, SwiGLU width 15360 and vocabulary 152064. Embeddings are untied. The
configuration is hypothetical, rather than a claim about an available checkpoint.

```python
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(0)
L, d, h, n_kv, d_head, d_ff, V = 36, 4096, 32, 8, 128, 15360, 152064
assert h * d_head == d and h % n_kv == 0


def count_params(L, d, n_kv, d_head, d_ff, V):
    attention = 2 * d * d + 2 * d * n_kv * d_head
    ffn = 3 * d * d_ff
    norms = 2 * d
    blocks = L * (attention + ffn + norms)
    embedding = V * d
    total = blocks + 2 * embedding + d
    return dict(attention=attention, ffn=ffn, norms=norms, blocks=blocks,
                embedding=embedding, head=embedding, final_norm=d,
                total=total, matmul=total - embedding)


counts = count_params(L, d, n_kv, d_head, d_ff, V)
for name, number in counts.items():
    print(f"{name:12s} {number:>14,}")
assert counts["total"] == 9_550_729_216
assert counts["matmul"] == 8_927_875_072
```

```output
attention        41,943,040
ffn             188,743,680
norms                 8,192
blocks        8,305,016,832
embedding       622,854,144
head            622,854,144
final_norm            4,096
total         9,550,729,216
matmul        8,927,875,072
```

`matmul` excludes the untied input lookup table. The output head still multiplies every
hidden state by a vocabulary matrix. See [Module 06, Section 11](module_06_EN.html#s11)
for the counting convention and its approximations.

### Step 2: bytes and explicit assumptions

The simplified quantised file stores block weights at four bits plus one fp16 scale
per 128 weights: 4.125 bits per weight. Vocabulary matrices use eight bits. Norms
are negligible at this precision, and this estimate applies the block rate to them
as well; an actual file includes tensor metadata, alignment and format-specific overhead.

```python
GB = 1e9
bf16_bytes = counts["total"] * 2
block_bytes = counts["blocks"] * 4.125 / 8
vocab_bytes = 2 * counts["embedding"]
quant_bytes = block_bytes + vocab_bytes + counts["final_norm"] * 2
kv_per_token = 2 * L * n_kv * d_head * 2
print(f"bf16 weights: {bf16_bytes / GB:.2f} GB")
print(f"quantised blocks: {block_bytes / GB:.2f} GB")
print(f"eight-bit vocabulary matrices: {vocab_bytes / GB:.2f} GB")
print(f"estimated quantised file: {quant_bytes / GB:.2f} GB")
print(f"KV per token: {kv_per_token:,} B")
print(f"KV for 6000 retained tokens: {6000 * kv_per_token / GB:.3f} GB")
assert kv_per_token == 147456

# Scenario assumptions as of October 2026, not a hardware measurement or price quote.
sustained_flops = 4e14
bandwidth_h100 = 3.35e12
bandwidth_card = 1e12
gpu_hour = 2.50
api_input, api_output, cached_fraction = 0.20, 0.80, 0.10
print("ASSUMED sustained compute: 4e14 FLOP/s; bandwidths: 3.35 and 1.00 TB/s")
print("ASSUMED dedicated GPU: USD 2.50/hour, paid for all 24 hours")
print("ASSUMED API: USD 0.20 input, USD 0.80 output per million tokens")
print("ASSUMED cached input price: 10% of ordinary input price")
```

```output
bf16 weights: 19.10 GB
quantised blocks: 4.28 GB
eight-bit vocabulary matrices: 1.25 GB
estimated quantised file: 5.53 GB
KV per token: 147,456 B
KV for 6000 retained tokens: 0.885 GB
ASSUMED sustained compute: 4e14 FLOP/s; bandwidths: 3.35 and 1.00 TB/s
ASSUMED dedicated GPU: USD 2.50/hour, paid for all 24 hours
ASSUMED API: USD 0.20 input, USD 0.80 output per million tokens
ASSUMED cached input price: 10% of ordinary input price
```

The assumed API and GPU need not offer equivalent model quality, confidentiality or
latency. Compare those requirements separately before treating the arithmetic as a
procurement decision. None of the prices here describes a current provider's offer.

### Step 3: compute and bandwidth bounds

The prefill formula averages causal attention over all input positions. Decode reads
the weights and retained KV once per step in this simplified single-stream model.
Bandwidth divided by those bytes is an optimistic ceiling, since it ignores kernel
overhead and imperfect bandwidth use. The compute time is optimistic for the same reason.

```python
def forward_flops(T):
    return 2 * counts["matmul"] * T + 2 * L * d * T * T


def train_flops_per_token(T):
    return 6 * counts["matmul"] + 6 * L * d * T


def decode_tps(weight_bytes, bandwidth, context=0):
    return bandwidth / (weight_bytes + context * kv_per_token)


def price_per_million(tps, hourly_price):
    return hourly_price * 1e6 / (3600 * tps)


weight_flops = 2 * counts["matmul"]
shortcut = 2 * counts["total"]
print(f"weight FLOPs per token: {weight_flops:.3e}")
print(f"2 N_total estimate: {shortcut:.3e}, {shortcut / weight_flops - 1:.1%} high")
attention = 6 * L * d * 8192
print(f"training per token at 8192: {6 * counts['matmul']:.3e} + {attention:.3e}")
print(f"attention / training weight work: {attention / (6 * counts['matmul']):.1%}")
prefill_seconds = forward_flops(4000) / sustained_flops
print(f"4000-token prefill: {forward_flops(4000):.3e} FLOPs, "
      f"{prefill_seconds:.3f} idealised seconds")
for name, weights in (("bf16", bf16_bytes), ("4-bit", quant_bytes)):
    for bandwidth in (bandwidth_card, bandwidth_h100):
        print(f"{name:5s}, {bandwidth / 1e12:.2f} TB/s, no KV: "
              f"{decode_tps(weights, bandwidth):.0f} tokens/s ceiling")
    tps = decode_tps(weights, bandwidth_h100, context=5000)
    print(f"  mean context 5000: {tps:.0f} tokens/s, "
          f"USD {price_per_million(tps, gpu_hour):.2f}/million output tokens")
```

```output
weight FLOPs per token: 1.786e+10
2 N_total estimate: 1.910e+10, 7.0% high
training per token at 8192: 5.357e+10 + 7.248e+09
attention / training weight work: 13.5%
4000-token prefill: 7.614e+13 FLOPs, 0.190 idealised seconds
bf16 , 1.00 TB/s, no KV: 52 tokens/s ceiling
bf16 , 3.35 TB/s, no KV: 175 tokens/s ceiling
  mean context 5000: 169 tokens/s, USD 4.11/million output tokens
4-bit, 1.00 TB/s, no KV: 181 tokens/s ceiling
4-bit, 3.35 TB/s, no KV: 606 tokens/s ceiling
  mean context 5000: 535 tokens/s, USD 1.30/million output tokens
```

The midpoint context of 5000 approximates decoding from 4000 to 6000 retained tokens.
It is not a latency benchmark. Weight reading alone also assumes suitable kernels can
use the estimated quantised storage without expensive unpacking or extra traffic.

### Step 4: the workload's bill and capacity

Each of 2000 daily requests has 4000 input tokens, including a reusable 3000-token
prefix, and 2000 output tokens. The cached price assumes a prefix hit on every request.
Warmup requests, evictions and cache lifetime can reduce that hit rate.

```python
requests = 2000
input_tokens, prefix_tokens, output_tokens = 4000, 3000, 2000
uncached_request = (input_tokens * api_input + output_tokens * api_output) / 1e6
cached_request = ((input_tokens - prefix_tokens) * api_input
                  + prefix_tokens * api_input * cached_fraction
                  + output_tokens * api_output) / 1e6
daily_gpu = 24 * gpu_hour
print(f"API per request: USD {uncached_request:.5f} uncached, "
      f"USD {cached_request:.5f} cached")
print(f"API per day: USD {requests * uncached_request:.2f} uncached, "
      f"USD {requests * cached_request:.2f} cached")
print(f"dedicated GPU per day: USD {daily_gpu:.2f}")
print(f"input-bill reduction: {prefix_tokens / input_tokens * (1 - cached_fraction):.1%}")
print(f"total-bill reduction: {1 - cached_request / uncached_request:.1%}")
capacities = {}
for name, weights in (("bf16", bf16_bytes), ("4-bit", quant_bytes)):
    seconds = prefill_seconds + output_tokens / decode_tps(weights, bandwidth_h100, 5000)
    capacities[name] = 86400 / seconds
    print(f"{name}: {seconds:.2f} seconds/request, "
          f"{requests * seconds / 3600:.2f} busy hours/day, "
          f"{capacities[name]:.0f} requests/day ceiling")
for name, per_request in (("uncached", uncached_request), ("cached", cached_request)):
    crossover = daily_gpu / per_request
    print(f"{name} price crossover: {crossover:.0f} requests/day; "
          f"within 4-bit batch-1 ceiling: {crossover <= capacities['4-bit']}")
assert np.isclose(requests * cached_request, 3.72)
```

```output
API per request: USD 0.00240 uncached, USD 0.00186 cached
API per day: USD 4.80 uncached, USD 3.72 cached
dedicated GPU per day: USD 60.00
input-bill reduction: 67.5%
total-bill reduction: 22.5%
bf16: 12.03 seconds/request, 6.69 busy hours/day, 7179 requests/day ceiling
4-bit: 3.93 seconds/request, 2.18 busy hours/day, 21980 requests/day ceiling
uncached price crossover: 25000 requests/day; within 4-bit batch-1 ceiling: False
cached price crossover: 32258 requests/day; within 4-bit batch-1 ceiling: False
```

At the price crossover, one batch-1 GPU may already lack the idealised capacity needed.
A flat dedicated-GPU cost line beyond that capacity represents an infeasible option.
Batching can change capacity, but then requires a different throughput and latency
model. [Module 10](module_10_EN.html) develops that model.

### Step 5: visualise only the feasible single-stream range

```python
volume = np.logspace(2, 5, 300)
fig, ax = plt.subplots(figsize=(8, 4.5))
ax.loglog(volume, volume * uncached_request, label="API, no prefix hits")
ax.loglog(volume, volume * cached_request, label="API, all prefixes hit")
feasible = volume <= capacities["4-bit"]
ax.loglog(volume[feasible], np.full(feasible.sum(), daily_gpu),
          label="one 4-bit GPU, idealised batch-1 capacity")
ax.axvline(requests, color="grey", linestyle=":", label="case-study volume")
for label, capacity in capacities.items():
    ax.axvline(capacity, linestyle="--", alpha=0.5,
               label=f"{label} batch-1 capacity ceiling")
ax.set_xlabel("requests per day")
ax.set_ylabel("daily cost (USD, assumed prices)")
ax.set_title("Price and capacity are separate constraints")
ax.legend(fontsize=8)
plt.tight_layout()
plt.show()
C = train_flops_per_token(8192) * 2e9
gpu_hours = C / sustained_flops / 3600
print(f"2B-token continued pretraining: {C:.3e} FLOPs, "
      f"{gpu_hours:.1f} GPU-hours, USD {gpu_hours * gpu_hour:.0f}")
print(f"eight GPUs: {gpu_hours / 8:.1f} idealised hours")
```

```output
2B-token continued pretraining: 1.216e+20 FLOPs, 84.5 GPU-hours, USD 211
eight GPUs: 10.6 idealised hours
```

### What you should see

The configuration gives 9,550,729,216 parameters, 19.10 GB of bf16 weights and an
estimated 5.53 GB quantised file. At the assumed prices, 2000 daily requests cost
USD 3.72 with prefix hits, against USD 60 for a dedicated GPU. The standalone price
crossovers exceed the estimated batch-1 capacity of the quantised GPU. These results
follow from the assumptions, rather than measurements of a serving system.

### Try this

1. Add a cache hit rate ranging from zero to one and plot the resulting API bill.
2. Add 4000 hidden reasoning tokens per request and recompute bill and capacity.
3. Replace sustained compute and bandwidth with measurements from a selected serving
   engine. Keep the assumed price separate from those measured performance values.
