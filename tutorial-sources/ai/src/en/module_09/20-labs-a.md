## Lab 1 — SFT with assistant-token loss masking {#lab1}

**Goal.** Fine-tune a released base model on five families of synthetic engineering
instructions. Measure loss, exact answers and end-of-turn generation separately.
A lower token loss alone does not show that the model knows when to stop.

The first run downloads about 270 MB of weights and tokenizer files. The model
revision is pinned. Float32 weights need about 538 MB; gradients, Adam states,
activations and logits require additional memory. Use a laptop CPU or optionally
Google Colab. Set `QUICK = False` for the longer run. Every shown output is inserted
by the lab runner from a real execution; timing and final digits can vary.

### Load the pinned base model

Four CPU threads keep the experiment reproducible without consuming every core.

```python
import math
import random
import time
import json
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM, GenerationConfig

torch.set_num_threads(4)
torch.manual_seed(0)
random.seed(0)
QUICK = True
MASK = True
INITIALISE_CHAT_ROWS = True
MODEL = "HuggingFaceTB/SmolLM2-135M"
REVISION = "93efa2f097d58c2a74874c7e644dbc9b0cee75a2"
tok = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
model = AutoModelForCausalLM.from_pretrained(
    MODEL, revision=REVISION, dtype=torch.float32,
    attn_implementation="sdpa",
)
model.generation_config = GenerationConfig(
    bos_token_id=0, eos_token_id=2, pad_token_id=0,
)
print("Parameters:", f"{sum(p.numel() for p in model.parameters()):,}")
print("Chat template:", tok.chat_template)
for text in ("<|endoftext|>", "<|im_start|>", "<|im_end|>"):
    print(text, tok.convert_tokens_to_ids(text))
```

```output
Parameters: 134,515,008
Chat template: None
<|endoftext|> 0
<|im_start|> 1
<|im_end|> 2
```

### Generate disjoint training and evaluation prompts

Each family has an exact answer. Duplicate prompts are excluded from the held-out set; this is a small within-distribution test, not evidence about arbitrary engineering requests.

```python
FAMILIES = ["conversion", "addition", "extraction", "limit", "sorting"]
COMPONENTS = ["valve", "pump", "seal", "bearing", "shaft", "motor",
              "filter", "pipe", "flange", "sensor"]

def example(rng, family):
    if family == "conversion":
        value = rng.randint(1, 80) / 4
        source, target = rng.choice(
            [("MPa", "kPa"), ("kN", "N"), ("m", "mm"), ("km", "m")]
        )
        return (f"Convert {value:g} {source} to {target}.",
                f"{1000 * value:g} {target}")
    if family == "addition":
        a, b = rng.randint(10, 99), rng.randint(10, 99)
        return f"What is {a} + {b}?", str(a + b)
    if family == "extraction":
        temp = rng.randint(50, 110)
        pump, vib = rng.randint(100, 109), rng.randint(1, 40) / 10
        return (f"Log P-{pump}: bearing {temp} C; vibration {vib:g} mm/s. "
                "Extract the bearing temperature.", f"{temp} C")
    if family == "limit":
        limit, reading = rng.randint(60, 100), rng.randint(40, 120)
        return (f"Limit: {limit} C. Reading: {reading} C. "
                "Reply PASS or FAIL.", "PASS" if reading <= limit else "FAIL")
    names = rng.sample(COMPONENTS, 3)
    return ("Sort alphabetically: " + ", ".join(names) + ".",
            ", ".join(sorted(names)))

def make_data(per_family, seed, exclude=()):
    rng, seen, rows = random.Random(seed), set(exclude), []
    for family in FAMILIES:
        count = 0
        while count < per_family:
            user, reply = example(rng, family)
            if user in seen:
                continue
            seen.add(user)
            rows.append(dict(family=family, user=user, reply=reply))
            count += 1
    return rows

train_rows = make_data(48 if QUICK else 80, 1)
test_rows = make_data(10, 2, [row["user"] for row in train_rows])
assert not ({r["user"] for r in train_rows} & {r["user"] for r in test_rows})
print("Training/held-out:", len(train_rows), len(test_rows))
for family in FAMILIES:
    row = next(r for r in train_rows if r["family"] == family)
    print(family, repr(row["user"]), "->", repr(row["reply"]))
```

```output
Training/held-out: 240 50
conversion 'Convert 4.5 MPa to kPa.' -> '4500 kPa'
addition 'What is 76 + 81?' -> '157'
extraction 'Log P-100: bearing 83 C; vibration 2.6 mm/s. Extract the bearing temperature.' -> '83 C'
limit 'Limit: 65 C. Reading: 92 C. Reply PASS or FAIL.' -> 'FAIL'
sorting 'Sort alphabetically: seal, pump, motor.' -> 'motor, pump, seal'
```

### Render the conversation and build shifted targets

The tokenisation assertion catches a BPE boundary change between the separately encoded prompt and the complete training sequence. Right-pad training batches. Padding, system, user and assistant-header tokens have label `-100`. The end-of-turn token is trained.

```python
SYSTEM = "You are a concise engineering assistant. Reply with the answer only."

def render_prompt(user):
    return (f"<|im_start|>system\n{SYSTEM}<|im_end|>\n"
            f"<|im_start|>user\n{user}<|im_end|>\n"
            "<|im_start|>assistant\n")

def encode(row, mask_response=None):
    if mask_response is None:
        mask_response = MASK
    prompt = render_prompt(row["user"])
    full = tok.encode(prompt + row["reply"] + "<|im_end|>",
                      add_special_tokens=False)
    prefix = tok.encode(prompt, add_special_tokens=False)
    assert full[:len(prefix)] == prefix, "BPE changed the response boundary"
    labels = [-100] * len(prefix) + full[len(prefix):] if mask_response else full.copy()
    return full, labels

train_data = list(map(encode, train_rows))
test_data = [encode(row, mask_response=True) for row in test_rows]

def collate(rows):
    length = max(len(ids) for ids, _ in rows)
    ids = torch.zeros(len(rows), length, dtype=torch.long)
    labels = torch.full_like(ids, -100)
    attention = torch.zeros_like(ids)
    for i, (tokens, targets) in enumerate(rows):
        ids[i, :len(tokens)] = torch.tensor(tokens)
        labels[i, :len(tokens)] = torch.tensor(targets)
        attention[i, :len(tokens)] = 1
    return ids, labels, attention

def batch_loss(rows):
    ids, labels, attention = collate(rows)
    logits = model(ids, attention_mask=attention, use_cache=False).logits
    shifted = labels[:, 1:]
    total = F.cross_entropy(logits[:, :-1].reshape(-1, logits.size(-1)),
                            shifted.reshape(-1), ignore_index=-100,
                            reduction="sum")
    count = (shifted != -100).sum()
    return total, count

ids, targets = train_data[0]
print("One training conversation, token | id | label:")
for token, target in zip(ids, targets):
    print(repr(tok.decode([token])), token, target)
trained = sum(sum(v != -100 for v in labels[1:]) for _, labels in train_data)
all_tokens = sum(len(ids) - 1 for ids, _ in train_data)
print("Trained fraction:", f"{trained / all_tokens:.3%}")
```

```output
One training conversation, token | id | label:
'<|im_start|>' 1 -100
'system' 9690 -100
'\n' 198 -100
'You' 2683 -100
' are' 359 -100
' a' 253 -100
' concise' 19484 -100
' engineering' 4665 -100
' assistant' 11173 -100
'.' 30 -100
' Rep' 2720 -100
'ly' 318 -100
' with' 351 -100
' the' 260 -100
' answer' 2988 -100
' only' 805 -100
'.' 30 -100
'<|im_end|>' 2 -100
'\n' 198 -100
'<|im_start|>' 1 -100
'user' 4093 -100
'\n' 198 -100
'Convert' 37983 -100
' ' 216 -100
'4' 36 -100
'.' 30 -100
'5' 37 -100
' MP' 13190 -100
'a' 81 -100
' to' 288 -100
' k' 501 -100
'Pa' 28694 -100
'.' 30 -100
'<|im_end|>' 2 -100
'\n' 198 -100
'<|im_start|>' 1 -100
'ass' 520 -100
'istant' 9531 -100
'\n' 198 -100
'4' 36 36
'5' 37 37
'0' 32 32
'0' 32 32
' k' 501 501
'Pa' 28694 28694
'<|im_end|>' 2 2
Trained fraction: 9.929%
```

### Measure the untouched base

Left-pad generation batches so every final column is a real prompt token. Check the emitted token IDs for the end-of-turn marker before decoding. Compute held-out loss as a sum divided by the total target count.

```python
@torch.inference_mode()
def evaluate(rows, encoded):
    model.eval()
    loss_sum, tokens = 0.0, 0
    for start in range(0, len(encoded), 10):
        loss, count = batch_loss(encoded[start:start + 10])
        loss_sum += float(loss)
        tokens += int(count)
    outputs, stops = [], []
    for start in range(0, len(rows), 10):
        prompts = [tok.encode(render_prompt(r["user"]),
                              add_special_tokens=False)
                   for r in rows[start:start + 10]]
        width = max(map(len, prompts))
        ids = torch.zeros(len(prompts), width, dtype=torch.long)
        mask = torch.zeros_like(ids)
        for i, prompt in enumerate(prompts):
            ids[i, -len(prompt):] = torch.tensor(prompt)
            mask[i, -len(prompt):] = 1
        generated = model.generate(ids, attention_mask=mask,
                                   max_new_tokens=16, do_sample=False)
        for response in generated[:, width:].tolist():
            stops.append(2 in response)
            if 2 in response:
                response = response[:response.index(2)]
            outputs.append(tok.decode(response, skip_special_tokens=False).strip())
    match = [text == row["reply"] for text, row in zip(outputs, rows)]
    scores = {family: float(np.mean([ok for row, ok in zip(rows, match)
                                     if row["family"] == family]))
              for family in FAMILIES}
    return dict(loss=loss_sum / tokens, stop=float(np.mean(stops)),
                exact=float(np.mean(match)), families=scores, outputs=outputs)

before = evaluate(test_rows, test_data)
print("Baseline loss/stop/exact:",
      f"{before['loss']:.4f}", f"{before['stop']:.2f}", f"{before['exact']:.2f}")
print("Base completion:", repr(before["outputs"][0]))
```

```output
Baseline loss/stop/exact: 7.2566 0.00 0.00
Base completion: 'Convert 10000000000000'
```

### Probe existing abilities without a chat template

Three-shot plain-text completions offer a different test of the base. They do not establish a capability ceiling: prompt choice can change the result.

```python
@torch.inference_mode()
def plain_probe(family):
    model.eval()
    rng = random.Random(19)
    prompts, answers = [], []
    for _ in range(50):
        if family == "addition":
            a, b = rng.randint(10, 99), rng.randint(10, 99)
            prompts.append("12 + 35 = 47\n21 + 44 = 65\n53 + 16 = 69\n"
                           f"{a} + {b} =")
            answers.append(str(a + b))
        else:
            limit, value = rng.randint(60, 100), rng.randint(40, 120)
            prompts.append("Limit 80, reading 72: PASS\n"
                           "Limit 70, reading 85: FAIL\n"
                           "Limit 60, reading 58: PASS\n"
                           f"Limit {limit}, reading {value}:")
            answers.append("PASS" if value <= limit else "FAIL")
    predicted = []
    tok.padding_side = "left"
    tok.pad_token = tok.eos_token
    for start in range(0, 50, 10):
        batch = tok(prompts[start:start + 10], padding=True,
                    add_special_tokens=False, return_tensors="pt")
        out = model.generate(**batch, max_new_tokens=4, do_sample=False,
                             eos_token_id=0)
        texts = tok.batch_decode(out[:, batch["input_ids"].size(1):],
                                 skip_special_tokens=True)
        predicted.extend([s.strip().split("\n")[0].split()[0]
                          if s.strip() else "" for s in texts])
    score = np.mean([a == b for a, b in zip(predicted, answers)])
    majority = max(answers.count("PASS"), answers.count("FAIL")) / 50
    print(f"Plain {family} exact: {score:.2f}")
    if family == "limit":
        print(f"Limit majority baseline: {majority:.2f}")

plain_probe("addition")
plain_probe("limit")
```

```output
Plain addition exact: 0.12
Plain limit exact: 0.62
Limit majority baseline: 0.62
```

### Inspect and initialise reserved chat-token rows

A reserved token ID does not imply its embedding was trained. The row cosine and nearest neighbours diagnose this checkpoint. A seeded diagonal Gaussian makes the two rows distinct using the existing embedding scale. This changes the starting checkpoint before fine-tuning; record it explicitly.

```python
embedding = model.get_input_embeddings().weight
with torch.no_grad():
    print("Chat-row cosine before:",
          f"{F.cosine_similarity(embedding[1], embedding[2], dim=0):.5f}")
    cosine = F.cosine_similarity(embedding, embedding[2].unsqueeze(0), dim=1)
    cosine[2] = -1
    nearest = torch.topk(cosine, 5)
    print("Nearest to end-of-turn:",
          [(int(i), ascii(tok.convert_ids_to_tokens(int(i))), round(float(v), 5))
           for i, v in zip(nearest.indices, nearest.values)])
    if INITIALISE_CHAT_ROWS:
        mu, sd = embedding.mean(0), embedding.std(0)
        gen = torch.Generator().manual_seed(42)
        for token in (1, 2):
            embedding[token] = mu + sd * torch.randn(mu.shape, generator=gen)
    print("Chat-row cosine after:",
          f"{F.cosine_similarity(embedding[1], embedding[2], dim=0):.5f}")
```

```output
Chat-row cosine before: 0.99976
Nearest to end-of-turn: [(16, "'<empty_output>'", 0.9999), (190, "'\\u0100'", 0.9999), (11, "'<jupyter_start>'", 0.9999), (13, "'<jupyter_code>'", 0.9999), (9, "'<issue_comment>'", 0.9999)]
Chat-row cosine after: 0.39968
```

### Train with the masked likelihood

Optimise only assistant targets, including the turn-ending token. Gradient clipping and a short warmup control the first updates. The small schedule is an experiment, not a recipe for the 9.5B case study.

```python
steps = 15 if QUICK else 50
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0)
order_rng = np.random.default_rng(3)
history = []
start_time = time.perf_counter()
model.train()
order = order_rng.permutation(len(train_data))
for step in range(steps):
    offset = (step * 16) % len(train_data)
    if offset == 0 and step:
        order = order_rng.permutation(len(train_data))
    indices = order[offset:offset + 16]
    progress = step / max(steps - 1, 1)
    warmup = max(1, round(0.05 * steps))
    scale = min(1.0, (step + 1) / warmup)
    if step >= warmup:
        scale *= 0.5 * (1 + math.cos(math.pi *
                     (step - warmup) / max(1, steps - warmup - 1)))
    optimizer.param_groups[0]["lr"] = 1e-4 * scale
    optimizer.zero_grad(set_to_none=True)
    total, count = batch_loss([train_data[int(i)] for i in indices])
    loss = total / count
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()
    history.append(float(loss.detach()))
    if (step + 1) % 5 == 0:
        print(f"step {step + 1:2d}: {history[-1]:.4f} nats")
print("Training seconds:", f"{time.perf_counter() - start_time:.1f}")
```

```output
step  5: 0.5632 nats
step 10: 0.4341 nats
step 15: 0.2906 nats
Training seconds: 35.8
```

### Evaluate behaviour and retain the evidence

Exact match penalises extra text as well as wrong answers. Keep per-family results and sample outputs so an improvement on copying cannot hide failure on comparisons.

```python
after = evaluate(test_rows, test_data)
print("              before   after")
for key in ("loss", "stop", "exact"):
    print(f"{key:12s} {before[key]:7.4f} {after[key]:7.4f}")
for family in FAMILIES:
    print(f"{family:12s} {before['families'][family]:7.2f} "
          f"{after['families'][family]:7.2f}")
    i = next(i for i, row in enumerate(test_rows) if row["family"] == family)
    print("  expected:", repr(test_rows[i]["reply"]),
          "generated:", repr(after["outputs"][i]))
plt.plot(range(1, steps + 1), history)
plt.xlabel("optimiser step")
plt.ylabel("masked training loss (nats/token)")
plt.title("SFT: assistant-token training loss")
plt.grid(alpha=0.2)
plt.show()
metrics = dict(mode="QUICK" if QUICK else "FULL", seed=0,
               mask=MASK, initialise_chat_rows=INITIALISE_CHAT_ROWS,
               revision=REVISION, before=before, after=after, history=history)
Path("sft-metrics.json").write_text(json.dumps(metrics, indent=2))
```

```output
              before   after
loss          7.2566  0.1919
stop          0.0000  1.0000
exact         0.0000  0.6600
conversion      0.00    0.60
  expected: '2000 kPa' generated: '200 kPa'
addition        0.00    0.60
  expected: '125' generated: '115'
extraction      0.00    1.00
  expected: '93 C' generated: '93 C'
limit           0.00    0.50
  expected: 'FAIL' generated: 'FAIL'
sorting         0.00    0.60
  expected: 'bearing, pipe, shaft' generated: 'bearing, pipe, shaft'
```

### What to inspect

Compare format and stopping with per-family correctness. The training set deliberately
concentrates on short answers; it does not teach open-ended argument construction.
The held-out items test new prompts from these five generators. Their exact-match
rates cannot be used as estimates of general engineering competence.

Separate executions of the extensions give the following evidence. FULL reaches
90% exact match and 100% stopping; its longer schedule and larger training set
also change the excluded-prompt held-out sample slightly. At the same 15-step
QUICK budget, skipping chat-row initialisation gives 2% exact match and 2%
stopping. Removing response masking gives 48% exact match and 100% stopping,
versus the default's 66% and 100%. Held-out loss remains assistant-only in all
these comparisons. These are single-seed controls, not uncertainty estimates
or universal effect sizes. Rerun them from fresh checkpoints before comparing.

### Try this

- Set `MASK = False` and rerun from a fresh checkpoint. Compare task scores, and
  allow generation to continue beyond the turn marker to inspect user-turn imitation.
- Set `INITIALISE_CHAT_ROWS = False`. Record stopping after 15 and 20 steps;
  do not infer a stable stopping policy from one example.
- Run `QUICK = False` and compare the family scores with the short run.
- Add a letter-counting family, keeping its evaluation prompts separate. Track
  correctness alongside format; the new template does not guarantee a new skill.
- Pack conversations with a block-diagonal causal mask and resetting position IDs.
  Compare processed token slots and losses with unpadded separate conversations.

## Lab 2 — LoRA from scratch, training and exact merging {#lab2}

**Goal.** Wrap every block projection with a low-rank update, verify the initial
function is unchanged, train the factors, and merge them into the frozen weights.
This lab repeats its data and helper functions so it runs in a fresh process.
It reuses the pinned 270 MB base-model download from Lab 1.

The equality test compares the adapter model with the base **after** chat-row
initialisation. Reinitialising token rows changes the original checkpoint; a zero
adapter cannot undo that change. The final comparison uses the same prompt and
float32 arithmetic. Mathematical equality does not imply bitwise equality after
changing the order of matrix operations.

### Load and freeze the base

```python
import math
import random
import time
import json
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM, GenerationConfig

torch.set_num_threads(4)
torch.manual_seed(0)
random.seed(0)
QUICK = False
MASK = True
INITIALISE_CHAT_ROWS = True
MODEL = "HuggingFaceTB/SmolLM2-135M"
REVISION = "93efa2f097d58c2a74874c7e644dbc9b0cee75a2"
tok = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
model = AutoModelForCausalLM.from_pretrained(
    MODEL, revision=REVISION, dtype=torch.float32,
    attn_implementation="sdpa",
)
model.generation_config = GenerationConfig(
    bos_token_id=0, eos_token_id=2, pad_token_id=0,
)
print("Parameters:", f"{sum(p.numel() for p in model.parameters()):,}")
print("Chat template:", tok.chat_template)
for text in ("<|endoftext|>", "<|im_start|>", "<|im_end|>"):
    print(text, tok.convert_tokens_to_ids(text))
for parameter in model.parameters():
    parameter.requires_grad_(False)
print("Frozen base parameters:", sum(p.numel() for p in model.parameters()))
```

```output
Parameters: 134,515,008
Chat template: None
<|endoftext|> 0
<|im_start|> 1
<|im_end|> 2
Frozen base parameters: 134515008
```

### Repeat the synthetic data and masking code

```python
FAMILIES = ["conversion", "addition", "extraction", "limit", "sorting"]
COMPONENTS = ["valve", "pump", "seal", "bearing", "shaft", "motor",
              "filter", "pipe", "flange", "sensor"]

def example(rng, family):
    if family == "conversion":
        value = rng.randint(1, 80) / 4
        source, target = rng.choice(
            [("MPa", "kPa"), ("kN", "N"), ("m", "mm"), ("km", "m")]
        )
        return (f"Convert {value:g} {source} to {target}.",
                f"{1000 * value:g} {target}")
    if family == "addition":
        a, b = rng.randint(10, 99), rng.randint(10, 99)
        return f"What is {a} + {b}?", str(a + b)
    if family == "extraction":
        temp = rng.randint(50, 110)
        pump, vib = rng.randint(100, 109), rng.randint(1, 40) / 10
        return (f"Log P-{pump}: bearing {temp} C; vibration {vib:g} mm/s. "
                "Extract the bearing temperature.", f"{temp} C")
    if family == "limit":
        limit, reading = rng.randint(60, 100), rng.randint(40, 120)
        return (f"Limit: {limit} C. Reading: {reading} C. "
                "Reply PASS or FAIL.", "PASS" if reading <= limit else "FAIL")
    names = rng.sample(COMPONENTS, 3)
    return ("Sort alphabetically: " + ", ".join(names) + ".",
            ", ".join(sorted(names)))

def make_data(per_family, seed, exclude=()):
    rng, seen, rows = random.Random(seed), set(exclude), []
    for family in FAMILIES:
        count = 0
        while count < per_family:
            user, reply = example(rng, family)
            if user in seen:
                continue
            seen.add(user)
            rows.append(dict(family=family, user=user, reply=reply))
            count += 1
    return rows

train_rows = make_data(48 if QUICK else 80, 1)
test_rows = make_data(10, 2, [row["user"] for row in train_rows])
assert not ({r["user"] for r in train_rows} & {r["user"] for r in test_rows})
print("Training/held-out:", len(train_rows), len(test_rows))
for family in FAMILIES:
    row = next(r for r in train_rows if r["family"] == family)
    print(family, repr(row["user"]), "->", repr(row["reply"]))
SYSTEM = "You are a concise engineering assistant. Reply with the answer only."

def render_prompt(user):
    return (f"<|im_start|>system\n{SYSTEM}<|im_end|>\n"
            f"<|im_start|>user\n{user}<|im_end|>\n"
            "<|im_start|>assistant\n")

def encode(row, mask_response=None):
    if mask_response is None:
        mask_response = MASK
    prompt = render_prompt(row["user"])
    full = tok.encode(prompt + row["reply"] + "<|im_end|>",
                      add_special_tokens=False)
    prefix = tok.encode(prompt, add_special_tokens=False)
    assert full[:len(prefix)] == prefix, "BPE changed the response boundary"
    labels = [-100] * len(prefix) + full[len(prefix):] if mask_response else full.copy()
    return full, labels

train_data = list(map(encode, train_rows))
test_data = [encode(row, mask_response=True) for row in test_rows]

def collate(rows):
    length = max(len(ids) for ids, _ in rows)
    ids = torch.zeros(len(rows), length, dtype=torch.long)
    labels = torch.full_like(ids, -100)
    attention = torch.zeros_like(ids)
    for i, (tokens, targets) in enumerate(rows):
        ids[i, :len(tokens)] = torch.tensor(tokens)
        labels[i, :len(tokens)] = torch.tensor(targets)
        attention[i, :len(tokens)] = 1
    return ids, labels, attention

def batch_loss(rows):
    ids, labels, attention = collate(rows)
    logits = model(ids, attention_mask=attention, use_cache=False).logits
    shifted = labels[:, 1:]
    total = F.cross_entropy(logits[:, :-1].reshape(-1, logits.size(-1)),
                            shifted.reshape(-1), ignore_index=-100,
                            reduction="sum")
    count = (shifted != -100).sum()
    return total, count

ids, targets = train_data[0]
print("One training conversation, token | id | label:")
for token, target in zip(ids, targets):
    print(repr(tok.decode([token])), token, target)
trained = sum(sum(v != -100 for v in labels[1:]) for _, labels in train_data)
all_tokens = sum(len(ids) - 1 for ids, _ in train_data)
print("Trained fraction:", f"{trained / all_tokens:.3%}")
```

```output
Training/held-out: 400 50
conversion 'Convert 4.5 MPa to kPa.' -> '4500 kPa'
addition 'What is 94 + 90?' -> '184'
extraction 'Log P-104: bearing 100 C; vibration 3.9 mm/s. Extract the bearing temperature.' -> '100 C'
limit 'Limit: 67 C. Reading: 77 C. Reply PASS or FAIL.' -> 'FAIL'
sorting 'Sort alphabetically: bearing, filter, flange.' -> 'bearing, filter, flange'
One training conversation, token | id | label:
'<|im_start|>' 1 -100
'system' 9690 -100
'\n' 198 -100
'You' 2683 -100
' are' 359 -100
' a' 253 -100
' concise' 19484 -100
' engineering' 4665 -100
' assistant' 11173 -100
'.' 30 -100
' Rep' 2720 -100
'ly' 318 -100
' with' 351 -100
' the' 260 -100
' answer' 2988 -100
' only' 805 -100
'.' 30 -100
'<|im_end|>' 2 -100
'\n' 198 -100
'<|im_start|>' 1 -100
'user' 4093 -100
'\n' 198 -100
'Convert' 37983 -100
' ' 216 -100
'4' 36 -100
'.' 30 -100
'5' 37 -100
' MP' 13190 -100
'a' 81 -100
' to' 288 -100
' k' 501 -100
'Pa' 28694 -100
'.' 30 -100
'<|im_end|>' 2 -100
'\n' 198 -100
'<|im_start|>' 1 -100
'ass' 520 -100
'istant' 9531 -100
'\n' 198 -100
'4' 36 36
'5' 37 37
'0' 32 32
'0' 32 32
' k' 501 501
'Pa' 28694 28694
'<|im_end|>' 2 2
Trained fraction: 9.786%
```

### Initialise the chat rows before testing the adapter

```python
embedding = model.get_input_embeddings().weight
with torch.no_grad():
    print("Chat-row cosine before:",
          f"{F.cosine_similarity(embedding[1], embedding[2], dim=0):.5f}")
    cosine = F.cosine_similarity(embedding, embedding[2].unsqueeze(0), dim=1)
    cosine[2] = -1
    nearest = torch.topk(cosine, 5)
    print("Nearest to end-of-turn:",
          [(int(i), ascii(tok.convert_ids_to_tokens(int(i))), round(float(v), 5))
           for i, v in zip(nearest.indices, nearest.values)])
    if INITIALISE_CHAT_ROWS:
        mu, sd = embedding.mean(0), embedding.std(0)
        gen = torch.Generator().manual_seed(42)
        for token in (1, 2):
            embedding[token] = mu + sd * torch.randn(mu.shape, generator=gen)
    print("Chat-row cosine after:",
          f"{F.cosine_similarity(embedding[1], embedding[2], dim=0):.5f}")
```

```output
Chat-row cosine before: 0.99976
Nearest to end-of-turn: [(16, "'<empty_output>'", 0.9999), (190, "'\\u0100'", 0.9999), (11, "'<jupyter_start>'", 0.9999), (13, "'<jupyter_code>'", 0.9999), (9, "'<issue_comment>'", 0.9999)]
Chat-row cosine after: 0.39968
```

### Implement, wrap and count the low-rank factors

```python
from torch import nn

class LoRALinear(nn.Module):
    def __init__(self, base, r=8, alpha=16):
        super().__init__()
        self.base = base
        self.scale = alpha / r
        self.A = nn.Parameter(torch.randn(r, base.in_features) /
                              math.sqrt(base.in_features))
        self.B = nn.Parameter(torch.zeros(base.out_features, r))

    def forward(self, x):
        return self.base(x) + self.scale * F.linear(F.linear(x, self.A), self.B)

    @torch.no_grad()
    def merged(self):
        linear = nn.Linear(self.base.in_features, self.base.out_features,
                           bias=self.base.bias is not None)
        linear.weight.copy_(self.base.weight + self.scale * (self.B @ self.A))
        if linear.bias is not None:
            linear.bias.copy_(self.base.bias)
        return linear

probe_ids = torch.tensor([train_data[0][0]])
model.eval()
with torch.inference_mode():
    base_logits = model(probe_ids, use_cache=False).logits.clone()
PROJECTIONS = {"q_proj", "k_proj", "v_proj", "o_proj",
               "gate_proj", "up_proj", "down_proj"}
wrapped = []
for name, layer in list(model.named_modules()):
    if isinstance(layer, nn.Linear) and name.rsplit(".", 1)[-1] in PROJECTIONS:
        parent_name, child_name = name.rsplit(".", 1)
        parent = model.get_submodule(parent_name)
        setattr(parent, child_name, LoRALinear(layer))
        wrapped.append((parent, child_name))
trainable = [p for p in model.parameters() if p.requires_grad]
count = sum(p.numel() for p in trainable)
total = sum(p.numel() for p in model.parameters())
hand_count = sum(8 * (getattr(parent, name).base.in_features +
                      getattr(parent, name).base.out_features)
                 for parent, name in wrapped)
assert count == hand_count == 2_442_240
print("Wrapped projections:", len(wrapped))
print("Trainable / total:", f"{count:,}", f"{total:,}", f"{count / total:.3%}")
print("Adam moments only, MB:", f"{8 * count / 1e6:.2f}")
print("Full base Adam moments, MB:", f"{8 * (total - count) / 1e6:.2f}")
with torch.inference_mode():
    initial_error = float((model(probe_ids, use_cache=False).logits -
                           base_logits).abs().max())
assert initial_error == 0
print("Initial logit difference:", initial_error)
```

```output
Wrapped projections: 210
Trainable / total: 2,442,240 136,957,248 1.783%
Adam moments only, MB: 19.54
Full base Adam moments, MB: 1076.12
Initial logit difference: 0.0
```

### Define the evaluation and train the adapter

```python
@torch.inference_mode()
def evaluate(rows, encoded):
    model.eval()
    loss_sum, tokens = 0.0, 0
    for start in range(0, len(encoded), 10):
        loss, count = batch_loss(encoded[start:start + 10])
        loss_sum += float(loss)
        tokens += int(count)
    outputs, stops = [], []
    for start in range(0, len(rows), 10):
        prompts = [tok.encode(render_prompt(r["user"]),
                              add_special_tokens=False)
                   for r in rows[start:start + 10]]
        width = max(map(len, prompts))
        ids = torch.zeros(len(prompts), width, dtype=torch.long)
        mask = torch.zeros_like(ids)
        for i, prompt in enumerate(prompts):
            ids[i, -len(prompt):] = torch.tensor(prompt)
            mask[i, -len(prompt):] = 1
        generated = model.generate(ids, attention_mask=mask,
                                   max_new_tokens=16, do_sample=False)
        for response in generated[:, width:].tolist():
            stops.append(2 in response)
            if 2 in response:
                response = response[:response.index(2)]
            outputs.append(tok.decode(response, skip_special_tokens=False).strip())
    match = [text == row["reply"] for text, row in zip(outputs, rows)]
    scores = {family: float(np.mean([ok for row, ok in zip(rows, match)
                                     if row["family"] == family]))
              for family in FAMILIES}
    return dict(loss=loss_sum / tokens, stop=float(np.mean(stops)),
                exact=float(np.mean(match)), families=scores, outputs=outputs)

optimizer = torch.optim.AdamW(trainable, lr=1e-3, weight_decay=0)
rng = np.random.default_rng(3)
model.train()
history = []
start = time.perf_counter()
for step in range(24):
    indices = rng.choice(len(train_data), 16, replace=False)
    optimizer.zero_grad(set_to_none=True)
    total_loss, tokens = batch_loss([train_data[int(i)] for i in indices])
    loss = total_loss / tokens
    loss.backward()
    torch.nn.utils.clip_grad_norm_(trainable, 1.0)
    optimizer.step()
    history.append(float(loss.detach()))
    if (step + 1) % 4 == 0:
        print(f"step {step + 1:2d}: {history[-1]:.4f} nats")
print("Training seconds:", f"{time.perf_counter() - start:.1f}")
after = evaluate(test_rows, test_data)
print("Adapted loss/stop/exact:",
      f"{after['loss']:.4f}", f"{after['stop']:.2f}", f"{after['exact']:.2f}")
for family in FAMILIES:
    print(family, f"{after['families'][family]:.2f}")
```

```output
step  4: 1.5709 nats
step  8: 0.4989 nats
step 12: 0.7453 nats
step 16: 0.2747 nats
step 20: 0.3550 nats
step 24: 0.1364 nats
Training seconds: 39.1
Adapted loss/stop/exact: 0.2570 1.00 0.58
conversion 0.80
addition 0.10
extraction 1.00
limit 0.20
sorting 0.80
```

### Merge and compare the complete model

```python
model.eval()
with torch.inference_mode():
    unmerged_logits = model(probe_ids, use_cache=False).logits.clone()
for parent, name in wrapped:
    setattr(parent, name, getattr(parent, name).merged())
model.eval()
with torch.inference_mode():
    error = float((model(probe_ids, use_cache=False).logits -
                   unmerged_logits).abs().max())
merged_scores = evaluate(test_rows, test_data)
print("Merged parameters:", f"{sum(p.numel() for p in model.parameters()):,}")
print("Merge max logit difference:", f"{error:.3e}")
print("Identical decoded evaluation outputs:",
      after["outputs"] == merged_scores["outputs"])
assert error < 2e-3
assert after["outputs"] == merged_scores["outputs"]
plt.plot(range(1, 25), history)
plt.xlabel("optimiser step")
plt.ylabel("masked training loss (nats/token)")
plt.title("LoRA: training the low-rank update")
plt.grid(alpha=0.2)
plt.show()
Path("lora-metrics.json").write_text(json.dumps(dict(
    revision=REVISION, rank=8, alpha=16, trainable=count, total=total,
    initial_logit_difference=initial_error, merge_logit_difference=error,
    history=history, after=after, merged=merged_scores,
), indent=2))
```

```output
Merged parameters: 134,515,008
Merge max logit difference: 1.040e-04
Identical decoded evaluation outputs: True
```

### What to inspect

Separate the trainable-parameter count, optimiser moments and total training
memory. The printed Adam count includes only its two float32 moments; float32
adapter weights and gradients are additional. Compare exact responses before and
after merging, as well as the maximum logit difference. Most forward and
activation-gradient work still passes through the frozen model.

### Try this

- Skip the row initialisation. With the tied embedding/head frozen, the adapter
  has fewer ways to learn a distinct stop token. Measure the stop rate directly.
- Wrap only query, key, value and output projections. Recount and compare scores
  at the same training budget.
- Compare ranks 2, 8 and 32, first with `alpha = 2r`, then with fixed `alpha = 16`.
  Keep both the data and the random seeds fixed.
- Keep a trainable delta for just the two chat rows, applying it to both lookup
  and tied output projection. Compare this with changing the rows before training.

## Lab 3 — Learning and overoptimising a comparison reward {#lab3}

**Goal.** Learn a scalar reward from noisy comparisons when the true utility is
known. Compare the learned model with the Bayes decision rule, inspect calibration,
and use best-of-n search to expose reward-model error. Everything is synthetic;
there is no dataset download or LLM checkpoint.

The true reward is $r^*(\mathbf{x}) = 2x_1+x_2-\tfrac12\|\mathbf{x}\|^2$.
Labels are sampled with probability $\sigma(r^*(\mathbf{x}_1)-r^*(\mathbf{x}_2))$.
The optimal reward therefore sometimes disagrees with the realised test label.
Its observed accuracy is a random estimate, rather than a hard ceiling that no
finite-sample competitor can exceed. The expected Bayes accuracy is also printed.

### Generate comparisons with a known reward

Generate independent training and test pairs before fitting anything. Complete the square to verify the maximum utility is 2.5 at (2, 1).

```python
import json
import math
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn.functional as F
from torch import nn

torch.set_num_threads(4)
torch.manual_seed(0)
rng = np.random.default_rng(0)

def true_reward(x):
    return 2 * x[..., 0] + x[..., 1] - 0.5 * np.square(x).sum(-1)

def pairs(n):
    first = rng.normal(size=(n, 2)).astype(np.float32)
    second = rng.normal(size=(n, 2)).astype(np.float32)
    delta = true_reward(first) - true_reward(second)
    probability = 1 / (1 + np.exp(-delta))
    labels = (rng.random(n) < probability).astype(np.float32)
    return first, second, labels, probability

train, test = pairs(4000), pairs(2000)
a, b, labels, oracle = test
oracle_accuracy = np.mean((oracle >= 0.5) == labels)
oracle_loss = -np.mean(labels * np.log(oracle + 1e-12) +
                       (1 - labels) * np.log(1 - oracle + 1e-12))
expected_bayes_accuracy = np.mean(np.maximum(oracle, 1 - oracle))
print(f"Oracle observed accuracy: {oracle_accuracy:.4f}")
print(f"Oracle test loss: {oracle_loss:.4f}")
print(f"Expected Bayes accuracy on these pairs: {expected_bayes_accuracy:.4f}")
print("True reward maximum: 2.5 at (2, 1)")
```

```output
Oracle observed accuracy: 0.8520
Oracle test loss: 0.3452
Expected Bayes accuracy on these pairs: 0.8386
True reward maximum: 2.5 at (2, 1)
```

### Fit a nonlinear and a misspecified linear reward

The linear reward cannot represent the negative quadratic term. Its confident comparisons may still look convincing on typical points. A scalar reward offset cancels from the pair loss, so inspect differences and rankings rather than the mean score.

```python
def fit_reward(network):
    first, second, target = [torch.tensor(x) for x in train[:3]]
    optimizer = torch.optim.AdamW(network.parameters(), lr=3e-3,
                                  weight_decay=1e-4)
    for step in range(1500):
        optimizer.zero_grad(set_to_none=True)
        delta = network(first).squeeze(-1) - network(second).squeeze(-1)
        loss = F.binary_cross_entropy_with_logits(delta, target)
        loss.backward()
        optimizer.step()
        if (step + 1) % 500 == 0:
            print(type(network).__name__, step + 1, f"{loss.item():.4f}")
    return network.eval()

mlp = fit_reward(nn.Sequential(nn.Linear(2, 64), nn.ReLU(),
                               nn.Linear(64, 64), nn.ReLU(), nn.Linear(64, 1)))
linear = fit_reward(nn.Linear(2, 1))

@torch.inference_mode()
def predict(network, points):
    array = np.asarray(points, dtype=np.float32)
    shape = array.shape[:-1]
    flat = torch.from_numpy(array.reshape(-1, 2))
    # Bound activation memory during large best-of-n evaluations.
    values = [network(batch).squeeze(-1).numpy()
              for batch in flat.split(8192)]
    return np.concatenate(values).reshape(shape)

fresh = rng.normal(size=(2000, 2)).astype(np.float32)
reports = {}
for name, network in [("MLP", mlp), ("linear", linear)]:
    delta = predict(network, a) - predict(network, b)
    probability = 1 / (1 + np.exp(-delta))
    accuracy = float(np.mean((probability >= 0.5) == labels))
    loss = float(np.mean(np.logaddexp(0, delta) - labels * delta))
    reward = predict(network, fresh)
    correlation = float(np.corrcoef(reward, true_reward(fresh))[0, 1])
    reports[name] = dict(accuracy=accuracy, loss=loss,
                         correlation=correlation, mean_reward=float(reward.mean()))
    print(name, "accuracy/loss/correlation/mean:",
          f"{accuracy:.4f}", f"{loss:.4f}", f"{correlation:.4f}",
          f"{reward.mean():.4f}")
```

```output
Sequential 500 0.3220
Sequential 1000 0.3130
Sequential 1500 0.3051
Linear 500 0.3992
Linear 1000 0.3941
Linear 1500 0.3940
MLP accuracy/loss/correlation/mean: 0.8380 0.3751 0.9713 -6.5274
linear accuracy/loss/correlation/mean: 0.8180 0.4064 0.9076 -0.3813
```

### Check calibration of comparison probabilities

Calibration answers whether a predicted 80% comparison probability corresponds to about 80% wins. ECE depends on the bins and this sample; a low value does not establish calibration outside the training distribution.

```python
probability = 1 / (1 + np.exp(-(predict(mlp, a) - predict(mlp, b))))
# Pairs retain their original random order; the target is which response won.
bin_ids = np.minimum((10 * probability).astype(int), 9)
calibration, ece = [], 0.0
print("bin   count predicted observed")
for i in range(10):
    select = bin_ids == i
    count = int(select.sum())
    if not count:
        continue
    predicted, observed = float(probability[select].mean()), float(labels[select].mean())
    ece += count / len(labels) * abs(predicted - observed)
    calibration.append([i, count, predicted, observed])
    print(f"{i:2d} {count:7d} {predicted:9.3f} {observed:8.3f}")
print(f"Ten-bin ECE: {ece:.4f}")
plt.plot([0, 1], [0, 1], "--", color="gray", label="calibrated")
plt.plot([r[2] for r in calibration], [r[3] for r in calibration],
         "o-", label="MLP reward model")
plt.xlabel("predicted first-response win probability")
plt.ylabel("observed first-response win frequency")
plt.title("Reward-model comparison calibration")
plt.legend()
plt.grid(alpha=0.2)
plt.show()
```

```output
bin   count predicted observed
 0     528     0.028    0.040
 1     170     0.146    0.212
 2     124     0.251    0.282
 3     101     0.349    0.307
 4      99     0.446    0.434
 5      98     0.548    0.582
 6      90     0.654    0.589
 7     107     0.752    0.720
 8     149     0.859    0.846
 9     534     0.972    0.949
Ten-bin ECE: 0.0266
```

### Optimise the learned reward by best-of-n selection

Every trial samples all candidates independently from the same Gaussian reference. The bound on distribution shift is exact here under continuous untied ranking; it is generally an upper bound when ties occur. Each table entry averages 200 trials, and the curves show one seeded experiment. Selection can reach rare points the fitted model never learned to rank correctly.

```python
sizes = [1, 4, 16, 64, 256, 1024, 4096, 16384]
selection = []
print("n       KL bound linear proxy linear true MLP true oracle true")
for n in sizes:
    candidates = rng.normal(size=(200, n, 2)).astype(np.float32)
    truth = true_reward(candidates)
    proxy_linear = predict(linear, candidates)
    proxy_mlp = predict(mlp, candidates)
    row = np.arange(200)
    picked_linear = proxy_linear.argmax(1)
    picked_mlp = proxy_mlp.argmax(1)
    picked_true = truth.argmax(1)
    item = dict(n=n, kl_bound=math.log(n) - (n - 1) / n,
                linear_proxy=float(proxy_linear[row, picked_linear].mean()),
                linear_true=float(truth[row, picked_linear].mean()),
                mlp_true=float(truth[row, picked_mlp].mean()),
                oracle_true=float(truth[row, picked_true].mean()))
    selection.append(item)
    print(f"{n:5d} {item['kl_bound']:10.3f} {item['linear_proxy']:12.3f} "
          f"{item['linear_true']:11.3f} {item['mlp_true']:8.3f} "
          f"{item['oracle_true']:11.3f}")
for key, label in [("linear_proxy", "linear proxy"),
                   ("linear_true", "true reward: linear selection"),
                   ("mlp_true", "true reward: MLP selection"),
                   ("oracle_true", "true reward: oracle selection")]:
    plt.plot([r["kl_bound"] for r in selection], [r[key] for r in selection],
             "o-", label=label)
plt.xlabel("best-of-n KL bound (nats)")
plt.ylabel("mean reward of selected response")
plt.title("Optimising a proxy beyond its training distribution")
plt.legend(fontsize=8)
plt.grid(alpha=0.2)
plt.show()
Path("reward-metrics.json").write_text(json.dumps(dict(
    seed=0, oracle_accuracy=float(oracle_accuracy),
    expected_bayes_accuracy=float(expected_bayes_accuracy),
    oracle_loss=float(oracle_loss), models=reports,
    calibration=calibration, ece=ece, selection=selection,
), indent=2))
```

```output
n       KL bound linear proxy linear true MLP true oracle true
    1      0.000       -0.471      -1.030   -1.030      -1.030
    4      0.636        1.544       1.068    1.141       1.198
   16      1.835        2.768       1.683    1.778       1.984
   64      3.175        3.848       1.901    1.856       2.337
  256      4.549        4.822       1.719    1.837       2.456
 1024      5.932        5.608       1.384    1.814       2.488
 4096      7.318        6.269       1.086    1.674       2.497
16384      8.704        6.954       0.389    1.623       2.499
```

### What to inspect

Compare proxy reward with **true** reward as search grows. Increased search is an
optimisation pressure on the reward model, even though its weights are frozen.
The oracle selection cannot improve beyond 2.5; the linear model can prefer points
beyond the true utility's peak because it has no penalty for large feature norms.
Good test accuracy near the reference is compatible with poor extreme selections.

### Try this

- Reduce training pairs to 200. Compare calibration and the location of the
  overoptimisation peak across several seeds.
- Add a systematic labelling bias such as $0.5x_2$. Track which preference the
  reward model learns instead of calling all disagreement random noise.
- Replace argmax with a softmax over candidate rewards. Compare true utility at
  several temperatures without claiming that one temperature repairs a bad model.
