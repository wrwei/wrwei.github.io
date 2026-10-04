## Lab 1 — Perplexity: what the loss says about a text {#lab1}

**Goal.** Score seven short texts with a released language model and express the
same information cost in nats, bits, perplexity and bits per byte. Inspect individual
tokens and a repeated paragraph. This is a measurement of one model on these texts,
not an evaluation of its general engineering competence.

The first run downloads about 269 MB of weights plus tokenizer files from the
[SmolLM2-135M repository](https://huggingface.co/HuggingFaceTB/SmolLM2-135M).
The checkpoint revision is pinned so that a later repository update cannot silently
change the experiment. The model uses about 538 MB for float32 weights in memory;
allow additional memory for activations and logits. Subsequent runs use the cache.

### Load the model and define the texts

Use float32 on a CPU. Bfloat16 reduces weight storage but can be slower when the
processor lacks appropriate matrix instructions. Evaluation mode disables training
behaviour; `inference_mode` also avoids building a gradient graph.

```python
import math
import random
import json
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

torch.manual_seed(0)
torch.set_num_threads(4)
MODEL = "HuggingFaceTB/SmolLM2-135M"
REVISION = "93efa2f097d58c2a74874c7e644dbc9b0cee75a2"
tok = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
model = AutoModelForCausalLM.from_pretrained(
    MODEL, revision=REVISION, dtype=torch.float32,
).eval()
EN_PARA = (
    "The pressure relief valve protects the reactor vessel from overpressure. "
    "If the pressure exceeds the set point, the valve opens and vents the gas "
    "to the flare system. The hazard is that the valve fails to open on demand. "
    "The safety goal is to keep the probability of this failure below one in "
    "ten thousand per demand. The evidence comprises the proof test records, "
    "the maintenance history and the results of the last functional test, "
    "which was completed in March."
)
ZH_PARA = (
    "压力释放阀保护反应釜免受超压。如果压力超过设定值，阀门打开并将气体排放到火炬系统。"
    "危险在于阀门在需要时未能打开。安全目标是将这种失效的概率保持在每次需求万分之一以下。"
    "证据包括验证测试记录、维护历史以及上次功能测试的结果，该测试于三月完成。"
)
words = EN_PARA.split()
random.Random(0).shuffle(words)
CODE = '''def softmax(x):
    """Compute a stable probability distribution."""
    x = np.asarray(x)
    shifted = x - np.max(x)
    weights = np.exp(shifted)
    return weights / weights.sum()
'''
DECLARATION = (
    "We hold these truths to be self-evident, that all men are created equal, "
    "that they are endowed by their Creator with certain unalienable Rights, "
    "that among these are Life, Liberty and the pursuit of Happiness."
)
rng = random.Random(1)
RANDOM_TEXT = "".join(rng.choice("abcdefghijklmnopqrstuvwxyz0123456789 ")
                      for _ in range(300))
texts = {
    "prose": EN_PARA, "shuffled": " ".join(words), "Chinese": ZH_PARA,
    "code": CODE, "Declaration": DECLARATION, "random": RANDOM_TEXT,
    "prose twice": EN_PARA + " " + EN_PARA,
}
print("Parameters:", f"{sum(p.numel() for p in model.parameters()):,}")
print("Vocabulary:", len(tok), "uniform loss:", f"{math.log(len(tok)):.4f}")
print("English words/bytes:", len(EN_PARA.split()), len(EN_PARA.encode()))
print("Chinese characters/bytes:", len(ZH_PARA), len(ZH_PARA.encode()))
```

```output
Parameters: 134,515,008
Vocabulary: 49152 uniform loss: 10.8027
English words/bytes: 80 463
Chinese characters/bytes: 119 357
```

### Align predictions with targets

For text token IDs $x_1,\ldots,x_T$, prepend one beginning token and score
$-\ln p(x_t\mid\mathrm{BOS},x_{<t})$ for every text token. The logit at input
position zero predicts the first text token. Reading logits and targets at the same
position without this shift would score the wrong event.

Here BOS is token 0, `<|endoftext|>`, used as a document boundary. It contributes
context but no target loss. No end token is appended. The byte denominator is the
original text's UTF-8 length, including spaces and punctuation. Bits per byte
compares information cost across tokenisations more usefully than perplexity,
though UTF-8 itself assigns different byte lengths to different scripts.

```python
@torch.inference_mode()
def token_losses(text):
    ids = tok.encode(text, add_special_tokens=False)
    inputs = torch.tensor([[0] + ids])
    logits = model(inputs, use_cache=False).logits[0, :-1].float()
    losses = -logits.log_softmax(-1).gather(
        1, torch.tensor(ids)[:, None],
    ).squeeze(1)
    return ids, losses.numpy()

scores = {name: token_losses(text) for name, text in texts.items()}
print(f"{'text':<13} {'tokens':>6} {'nats':>8} {'bits/tok':>9} "
      f"{'PPL':>9} {'bits/byte':>10}")
metrics = {}
for name, text in texts.items():
    ids, losses = scores[name]
    mean = float(losses.mean())
    bpb = float(losses.sum()) / (len(text.encode()) * math.log(2))
    metrics[name] = dict(tokens=len(ids), nats=mean, bits_per_byte=bpb)
    print(f"{name:<13} {len(ids):6d} {mean:8.3f} {mean/math.log(2):9.3f} "
          f"{math.exp(mean):9.2f} {bpb:10.3f}")
print("Source entropy (bits/character):", f"{math.log2(37):.3f}")
```

```output
text          tokens     nats  bits/tok       PPL  bits/byte
prose             89    3.250     4.689     25.79      0.901
shuffled          89    6.772     9.769    872.62      1.878
Chinese          219    2.129     3.071      8.40      1.884
code              53    1.800     2.597      6.05      0.748
Declaration       44    0.440     0.635      1.55      0.134
random           225    5.113     7.377    166.21      5.533
prose twice      178    1.729     2.495      5.64      0.479
Source entropy (bits/character): 5.209
```

The Declaration sentence is public-domain text. A low loss is consistent with
frequent exposure to this sentence; it does not establish which training document
contained it. The shuffled paragraph preserves the multiset of whitespace-separated
words, not necessarily its token sequence: leading spaces and position affect BPE.

### Look at the second copy and individual surprises

Locate the second paragraph using the fast tokenizer's character offsets. Assign
the joining space to the second copy: its first token contains both that space and
`The`. Assert that no token crosses this chosen boundary. This avoids assuming that
two copies always have precisely twice the original token count. The second `The`
has a different token ID from the first because it has a leading space.

```python
repeated = texts["prose twice"]
offsets = tok(repeated, add_special_tokens=False,
              return_offsets_mapping=True)["offset_mapping"]
boundary = len(EN_PARA)
assert not any(start < boundary < end for start, end in offsets)
split = next(i for i, (start, end) in enumerate(offsets) if start >= boundary)
losses = scores["prose twice"][1]
for name, part in [("first copy", losses[:split]), ("second copy", losses[split:])]:
    print(name, len(part), "nats:", f"{part.mean():.3f}",
          "PPL:", f"{math.exp(part.mean()):.3f}")
plt.figure(figsize=(9, 3))
plt.plot(np.arange(len(losses)), losses, linewidth=1)
plt.axvline(split - 0.5, color="tab:orange", linestyle="--", label="second copy")
plt.xlabel("Text token position (zero based)")
plt.ylabel("Next-token loss (nats)")
plt.title("SmolLM2-135M: two copies in one context")
plt.legend()
plt.tight_layout()
plt.show()

ids, losses = scores["prose"]
order = np.argsort(losses, kind="stable")
for name, indices in [("least surprising", order[:10]),
                      ("most surprising", order[-10:][::-1])]:
    print(name)
    for i in indices:
        print(f"  {tok.decode([ids[i]])!r:18} {losses[i]:7.3f}")
metrics["copy_split"] = int(split)
metrics["copy_nats"] = [float(losses_part.mean())
                        for losses_part in [scores["prose twice"][1][:split],
                                            scores["prose twice"][1][split:]]]
Path("lab1-metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf8")
```

```output
first copy 89 nats: 3.250 PPL: 25.791
second copy 89 nats: 0.208 PPL: 1.231
least surprising
  ' of'                0.079
  ' the'               0.181
  ' valve'             0.188
  ' of'                0.218
  ' the'               0.231
  ' is'                0.325
  ' to'                0.345
  '.'                  0.449
  ' in'                0.456
  'pressure'           0.458
most surprising
  ' flare'            13.030
  ' demand'           11.466
  ' evidence'         10.996
  ' comprises'        10.432
  ' pressure'          9.328
  ' functional'        9.112
  ' proof'             8.465
  ' hazard'            8.280
  ' test'              8.234
  ' probability'       8.212
```

### What you should see

The model finds coherent prose less surprising than shuffled words. Its per-token
loss on Chinese can be lower while its bits per byte are higher: small tokens make
the next token easier, but more predictions are needed to encode the text. Reading
the perplexity column alone would reverse that comparison.

The second copy becomes much easier because earlier context already contains the
paragraph. This is copying from the input, without a parameter update. It illustrates
a form of in-context learning, rather than learning a new fact permanently.

The random generator has entropy $\log_2 37\simeq5.21$ bits per ASCII character.
This model usually pays more because its language prior is a poor match to that
source. Entropy lower bounds the *expected* coding cost over random draws; an
individual finite sample can score below the bound by chance. Neither a low loss
nor smooth continuation supplies evidence that the pressure-relief argument is sound.

### Try this

1. Score a technical paragraph and a news paragraph of similar byte length. Report
   both mean token loss and bits per byte, keeping the same BOS convention.
2. Repeat the random-text experiment over 100 seeds. Compare the mean coding cost
   with the source entropy, rather than drawing a conclusion from one sample.
3. Swap in SmolLM2-360M, allowing its larger download, and recompute the table.
   Both model size and training history change; this is not a controlled size-only test.

## Lab 2 — Byte-pair encoding from scratch, and three tokenizers {#lab2}

**Goal.** Reproduce the hand-worked merges, implement a byte-level tokenizer with
an unrestricted UTF-8 base alphabet, and compare three production tokenizers on
English, Chinese, digits and whitespace. The text corpus is embedded below. Only
tokenizer files are downloaded, about 18 MB altogether; no model weights are needed.

### Count and merge weighted pairs

Represent each word as characters followed by `_`, an end marker. The marker is
reserved for this toy word tokenizer. Count adjacent pairs weighted by the word's
frequency. Choose the largest count, breaking ties by Python's tuple order. Merge
non-overlapping occurrences from left to right. This convention matches Section 2
and the BPE widget, so the lab can verify the hand calculation.

```python
import re
import json
import time
from pathlib import Path
from collections import Counter
from transformers import AutoTokenizer

WELD = {"weld": 10, "welded": 9, "welds": 7,
        "cooled": 7, "melt": 5, "heated": 4}

def merge_sequence(seq, pair, replacement):
    out, i = [], 0
    while i < len(seq):
        if i + 1 < len(seq) and tuple(seq[i:i + 2]) == pair:
            out.append(replacement)
            i += 2
        else:
            out.append(seq[i])
            i += 1
    return tuple(out)

def train_pairs(sequences, counts, num_merges, make_symbol):
    sequences = list(sequences)
    records = []
    for rank in range(num_merges):
        pairs = Counter()
        for seq, count in zip(sequences, counts):
            for pair in zip(seq, seq[1:]):
                pairs[pair] += count
        if not pairs:
            break
        ranked = sorted(pairs.items(), key=lambda item: (-item[1], item[0]))
        pair, count = ranked[0]
        symbol = make_symbol(pair, rank)
        sequences = [merge_sequence(seq, pair, symbol) for seq in sequences]
        length = sum(len(seq) * n for seq, n in zip(sequences, counts))
        runner_up = ranked[1][1] if len(ranked) > 1 else 0
        records.append((pair, symbol, count, runner_up, length))
    return records

records = train_pairs([tuple(word) + ("_",) for word in WELD],
                      list(WELD.values()), 7, lambda pair, rank: "".join(pair))
expected = [("e", "l"), ("d", "_"), ("w", "el"), ("e", "d_"),
            ("wel", "d"), ("wel", "d_"), ("weld", "ed_")]
assert [row[0] for row in records] == expected
print("Initial corpus length:", sum((len(w) + 1) * n for w, n in WELD.items()))
print("rank pair       count runner-up length")
for rank, (pair, symbol, count, runner_up, length) in enumerate(records, 1):
    print(f"{rank:4d} {str(pair):14} {count:5d} {runner_up:9d} {length:6d}")
```

```output
Initial corpus length: 257
rank pair       count runner-up length
   1 ('e', 'l')        31        30    226
   2 ('d', '_')        30        26    196
   3 ('w', 'el')       26        20    170
   4 ('e', 'd_')       20        16    150
   5 ('wel', 'd')      16        10    134
   6 ('wel', 'd_')     10         9    124
   7 ('weld', 'ed_')     9         7    115
```

### Encode by merge rank, not by longest substring

At each iteration, find the available pair of lowest training rank and merge its
leftmost occurrence. A greedy longest-substring algorithm is a different tokenizer.
This rule also handles an unseen word composed of known base symbols.

```python
def encode_sequence(seq, records):
    ranks = {row[0]: (rank, row[1]) for rank, row in enumerate(records)}
    seq = tuple(seq)
    while True:
        choices = [(ranks[pair][0], i, pair)
                   for i, pair in enumerate(zip(seq, seq[1:])) if pair in ranks]
        if not choices:
            return list(seq)
        rank, i, pair = min(choices)
        seq = seq[:i] + (ranks[pair][1],) + seq[i + 2:]

alphabet = set("".join(WELD)) | {"_"}
for word in ["weld", "welds", "melted", "heated", "welding"]:
    print(word, "->", encode_sequence(tuple(word) + ("_",), records),
          "unknown base symbols:", sorted(set(word) - alphabet))
```

```output
weld -> ['weld_'] unknown base symbols: []
welds -> ['weld', 's', '_'] unknown base symbols: []
melted -> ['m', 'el', 't', 'ed_'] unknown base symbols: []
heated -> ['h', 'e', 'a', 't', 'ed_'] unknown base symbols: []
welding -> ['weld', 'i', 'n', 'g', '_'] unknown base symbols: ['g', 'i', 'n']
```

The printed `i`, `n` and `g` in `welding` are useful for explaining the algorithm,
but they are outside this word tokenizer's base alphabet. A fixed production
character vocabulary would need an unknown-token policy. The next tokenizer starts
with all 256 byte values instead, including bytes absent from the training corpus.

### Train a byte-level BPE

The regular expression keeps an optional leading ASCII space with a word. It is a
small explicit pre-tokeniser, not GPT-2's or Qwen's exact regular expression. Merges
cannot cross its boundaries. Chinese runs match `\w+`, so training can merge bytes
within and between adjacent Chinese characters in a run.

```python
CORPUS_EN = '''A chemical plant uses an independently powered relief system to
limit pressure during abnormal operation. A reactor vessel contains a heated
process mixture. Loss of cooling or a blocked outlet can raise the pressure.
The equipment boundary includes the vessel, inlet piping, valve and vent line.
The operating team controls the process temperature and inspects the vent path.

The top claim states that pressure hazards have been reduced within the declared
operating envelope. A lower claim concerns opening the valve before the vessel
design pressure is reached. Another concerns safe discharge through the vent.
An argument must state the assumptions under which these claims hold. A list of
claims alone supplies no evidence that the equipment satisfies them.

The strategy considers every credible failure mode separately. The valve may
stick closed, the pressure sensor may drift, and the discharge path may become
blocked. Shared causes can defeat apparently independent barriers. The analysis
records common power supplies, installation errors and maintenance mistakes.
The review team checks whether the hazard log covers each operating mode.

The evidence includes proof tests, inspection reports and maintenance records.
Test report TR-104 gives the test conditions, instrument calibration and measured
opening pressures. A result is useful only when its configuration matches the
installed system. The report identifies the valve, its serial number, the test
date and the acceptance criteria. A passed test does not remove every uncertainty.

The set pressure is 12.5 bar and the allowed tolerance is 0.2 bar. The argument
assumes the outlet remains unobstructed and the process fluid stays within the
specified temperature range. A probability target of one failure in ten thousand
demands requires a defined demand population. Correlated demands and incomplete
records can make an estimate misleading. The supporting model records these limits.

Open issues include corrosion, overdue inspections and changed process chemistry.
Each issue has an owner, a due date and an effect on the argument's validity.
New evidence can support a claim or expose a missing premise. Reviewers trace
each conclusion to a record and check the record against the actual equipment.
An assistant may draft this structure, but acceptance belongs to the review process.'''
CORPUS_ZH = '''化工厂使用独立供电的压力保护系统限制异常工况下的压力。反应釜内有加热的
工艺混合物。冷却失效或出口堵塞可能导致压力升高。设备边界包括容器、入口管道、阀门和
排放管线。操作人员控制工艺温度并检查排放路径。论证需要说明运行范围和设备配置。

顶层主张说明压力危险在声明的运行范围内得到控制。下层主张涉及阀门在容器达到设计压力
之前打开，以及通过排放管线安全排放。论证必须列出这些主张成立的假设。单独列出主张
不能证明设备满足要求。评审人员需要检查证据、假设和未解决的问题。'''
EN_PARA = (
    "The pressure relief valve protects the reactor vessel from overpressure. "
    "If the pressure exceeds the set point, the valve opens and vents the gas "
    "to the flare system. The hazard is that the valve fails to open on demand. "
    "The safety goal is to keep the probability of this failure below one in "
    "ten thousand per demand. The evidence comprises the proof test records, "
    "the maintenance history and the results of the last functional test, "
    "which was completed in March."
)
ZH_PARA = (
    "压力释放阀保护反应釜免受超压。如果压力超过设定值，阀门打开并将气体排放到火炬系统。"
    "危险在于阀门在需要时未能打开。安全目标是将这种失效的概率保持在每次需求万分之一以下。"
    "证据包括验证测试记录、维护历史以及上次功能测试的结果，该测试于三月完成。"
)
def pre_tokens(text):
    return re.findall(r" ?\w+| ?[^\w\s]+|\s+", text)

counts = Counter(pre_tokens(CORPUS_EN + "\n" + CORPUS_ZH))
vocab = {i: bytes([i]) for i in range(256)}
def new_byte_symbol(pair, rank):
    index = 256 + rank
    vocab[index] = vocab[pair[0]] + vocab[pair[1]]
    return index

start = time.perf_counter()
byte_records = train_pairs([tuple(piece.encode()) for piece in counts],
                           list(counts.values()), 300, new_byte_symbol)
print("Byte vocabulary:", len(vocab), "seconds:", f"{time.perf_counter()-start:.2f}")
print("First 15 byte merges:")
for pair, symbol, count, runner_up, length in byte_records[:15]:
    print(repr(vocab[pair[0]]), "+", repr(vocab[pair[1]]), "->", repr(vocab[symbol]))

def encode(text):
    return [index for piece in pre_tokens(text)
            for index in encode_sequence(tuple(piece.encode()), byte_records)]

def decode(ids):
    return b"".join(vocab[index] for index in ids).decode("utf8")

unseen = "Relief valve RV-101 opens at 12.5 bar (±0.2) — 安全阀在 12.5 bar 开启 ✓"
assert decode(encode(unseen)) == unseen
print("Unseen UTF-8 round trip:", decode(encode(unseen)) == unseen)
for name, text in [("English", EN_PARA), ("Chinese", ZH_PARA)]:
    print(name, len(encode(text)), "tokens; bytes/token:",
          f"{len(text.encode())/len(encode(text)):.3f}")
```

```output
Byte vocabulary: 556 seconds: 0.23
First 15 byte merges:
b'h' + b'e' -> b'he'
b' ' + b't' -> b' t'
b'r' + b'e' -> b're'
b' ' + b'a' -> b' a'
b'i' + b'n' -> b'in'
b' ' + b'c' -> b' c'
b'e' + b's' -> b'es'
b' t' + b'he' -> b' the'
b'e' + b'n' -> b'en'
b'a' + b't' -> b'at'
b'e' + b'r' -> b'er'
b'o' + b'n' -> b'on'
b' ' + b'p' -> b' p'
b'i' + b's' -> b'is'
b'n' + b'd' -> b'nd'
Unseen UTF-8 round trip: True
English 199 tokens; bytes/token: 2.327
Chinese 266 tokens; bytes/token: 1.342
```

The whole encoded sequence decodes exactly. An individual byte token may end
halfway through a UTF-8 character and cannot be displayed independently without a
replacement character. This is a display artefact, not information loss in the
round trip. The small Chinese training sample is deliberately insufficient for
good compression; byte fallback guarantees coverage, not efficiency.

### Compare production tokenizers

Pin their revisions and disable automatic special tokens. Otherwise chat delimiters
or BOS tokens would be counted as part of the paragraph. `len(tokenizer)` includes
added tokens; a model's embedding table can be padded beyond that length.

```python
checkpoints = [
    ("GPT-2", "gpt2", "607a30d783dfa663caf39e06633721c8d4cfcd7e"),
    ("SmolLM2", "HuggingFaceTB/SmolLM2-135M",
     "93efa2f097d58c2a74874c7e644dbc9b0cee75a2"),
    ("Qwen2.5", "Qwen/Qwen2.5-0.5B-Instruct",
     "7ae557604adf67be50417f59c2c2f167def9a775"),
]
tokenizers = {name: AutoTokenizer.from_pretrained(repo, revision=revision)
              for name, repo, revision in checkpoints}
metrics = {}
print("name      vocab    EN  EN/word bytes/tok    ZH  ZH/char bytes/tok ZH/EN")
for name, tokenizer in tokenizers.items():
    en = tokenizer.encode(EN_PARA, add_special_tokens=False)
    zh = tokenizer.encode(ZH_PARA, add_special_tokens=False)
    metrics[name] = dict(vocab=len(tokenizer), en_tokens=len(en), zh_tokens=len(zh))
    print(f"{name:<9} {len(tokenizer):6d} {len(en):5d} "
          f"{len(en)/len(EN_PARA.split()):8.3f} {len(EN_PARA.encode())/len(en):9.3f} "
          f"{len(zh):5d} {len(zh)/len(ZH_PARA):8.3f} "
          f"{len(ZH_PARA.encode())/len(zh):9.3f} {len(zh)/len(en):5.2f}")
for text in ["The scaffold sagged 0.194 mm.", "支架下沉了 0.194 毫米。"]:
    print(repr(text))
    for name, tokenizer in tokenizers.items():
        ids = tokenizer.encode(text, add_special_tokens=False)
        print(name, len(ids), [tokenizer.decode([i]) for i in ids])

artefacts = ["2026", "20261", "1234567", "3.14159", "1,234,567", "strawberry",
             " strawberry", "safety", " safety", " Safety", " SAFETY"]
for text in artefacts:
    print(repr(text))
    for name, tokenizer in tokenizers.items():
        ids = tokenizer.encode(text, add_special_tokens=False)
        print(" ", name, "|".join(tokenizer.decode([i]) for i in ids))
Path("lab2-metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf8")
```

```output
name      vocab    EN  EN/word bytes/tok    ZH  ZH/char bytes/tok ZH/EN
GPT-2      50257    89    1.113     5.202   256    2.151     1.395  2.88
SmolLM2    49152    89    1.113     5.202   219    1.840     1.630  2.46
Qwen2.5   151665    89    1.113     5.202    71    0.597     5.028  0.80
'The scaffold sagged 0.194 mm.'
GPT-2 10 ['The', ' scaff', 'old', ' s', 'agged', ' 0', '.', '194', ' mm', '.']
SmolLM2 12 ['The', ' scaffold', ' sag', 'ged', ' ', '0', '.', '1', '9', '4', ' mm', '.']
Qwen2.5 12 ['The', ' scaffold', ' sag', 'ged', ' ', '0', '.', '1', '9', '4', ' mm', '.']
'支架下沉了 0.194 毫米。'
GPT-2 23 ['�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', ' 0', '.', '194', ' �', '�', '�', '�', '�', '�', '。']
SmolLM2 21 ['�', '�', '�', '�', '下', '�', '�', '�', '了', ' ', '0', '.', '1', '9', '4', ' �', '�', '�', '�', '�', '。']
Qwen2.5 14 ['支架', '下沉', '了', ' ', '0', '.', '1', '9', '4', ' �', '�', '�', '米', '。']
'2026'
  GPT-2 20|26
  SmolLM2 2|0|2|6
  Qwen2.5 2|0|2|6
'20261'
  GPT-2 20|261
  SmolLM2 2|0|2|6|1
  Qwen2.5 2|0|2|6|1
'1234567'
  GPT-2 123|45|67
  SmolLM2 1|2|3|4|5|6|7
  Qwen2.5 1|2|3|4|5|6|7
'3.14159'
  GPT-2 3|.|14|159
  SmolLM2 3|.|1|4|1|5|9
  Qwen2.5 3|.|1|4|1|5|9
'1,234,567'
  GPT-2 1|,|234|,|5|67
  SmolLM2 1|,|2|3|4|,|5|6|7
  Qwen2.5 1|,|2|3|4|,|5|6|7
'strawberry'
  GPT-2 st|raw|berry
  SmolLM2 st|raw|berry
  Qwen2.5 str|aw|berry
' strawberry'
  GPT-2  strawberry
  SmolLM2  strawberry
  Qwen2.5  strawberry
'safety'
  GPT-2 safety
  SmolLM2 safety
  Qwen2.5 s|afety
' safety'
  GPT-2  safety
  SmolLM2  safety
  Qwen2.5  safety
' Safety'
  GPT-2  Safety
  SmolLM2  Safety
  Qwen2.5  Safety
' SAFETY'
  GPT-2  SAF|ET|Y
  SmolLM2  SAF|ET|Y
  Qwen2.5  SAF|ETY
```

### What you should see

The seven word merges agree exactly with the weighted hand calculation. The byte
version round-trips symbols absent from its training corpus. The production
tokenizers give the same English paragraph different treatment from its Chinese
translation: on these texts, Chinese token counts vary much more than English
counts. This is a tokenizer measurement, independent of model reasoning ability.

Leading spaces and capitalisation change token IDs and boundaries. Digit grouping
also differs: GPT-2 can merge frequent digit substrings, while these SmolLM2 and
Qwen tokenizers split the displayed numbers into individual digits. A token budget
measured on one tokenizer should not be transferred to another without counting.

### Try this

1. Train with 50, 100, 300 and 1,000 merges. Plot held-out bytes per token in each
   language. A training-corpus compression curve alone misses generalisation.
2. Increase the Chinese share of the training corpus and repeat. Record the change
   in both languages rather than presuming that one must improve at the other's expense.
3. Compare with `tokenizers.ByteLevelBPETokenizer` on the same data. Explain differences
   in pre-tokenisation, vocabulary training and tie-breaking.

An optional fourth comparison uses `tiktoken`, outside this series' required
environment. This fragment is not executed by the lab runner and no result above
depends on it. Installing it also downloads its encoding file, about 1.7 MB.

```python norun
import tiktoken
encoding = tiktoken.get_encoding("cl100k_base")
for text in [EN_PARA, ZH_PARA, "The scaffold sagged 0.194 mm.",
             "支架下沉了 0.194 毫米。"]:
    print(len(encoding.encode(text)))
```

## Lab 3 — Fitting the Chinchilla law {#lab3}

**Goal.** Generate synthetic training runs, recover a parametric scaling law and
compare two ways of choosing a compute-optimal allocation. Then bootstrap the runs
and check whether optimisation settings alter the apparent uncertainty. NumPy,
SciPy and matplotlib suffice; the lab downloads nothing and trains no language model.

The original [Chinchilla paper](https://arxiv.org/abs/2203.15556) fits real runs.
This lab follows its log-space Huber objective on deliberately synthetic data.
Knowing the generating law lets us measure extrapolation error directly. These
points are not the paper's private training measurements, nor a replication of them.

### Step 1: the law and its exact optimum

Use $L=E+A N^{-\alpha}+B_c D^{-\beta}$. Here $B_c$ names a fitted constant,
leaving $B$ available for batch size. Under $C=6ND$, substituting
$D=C/(6N)$ and differentiating gives the optimum from [Section 4](#s4).
The constants below are chosen for this experiment, rather than copied from a model.

```python
import itertools
import json
import time
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize
from scipy.special import logsumexp

np.random.seed(0)
truth = np.array([1.8, 480.0, 2100.0, 0.35, 0.37])


def law(N, D, constants):
    E, A, Bc, alpha, beta = constants
    return E + A * N ** (-alpha) + Bc * D ** (-beta)


def optimum(C, constants):
    E, A, Bc, alpha, beta = constants
    G = (alpha * A / (beta * Bc)) ** (1 / (alpha + beta))
    N = G * (C / 6) ** (beta / (alpha + beta))
    return N, C / (6 * N)


for budget in (1e18, 1e20, 1e21, 1e23):
    N, D = optimum(budget, truth)
    print(f"C {budget:.0e}: N {N:.3e}, D {D:.3e}, D/N {D / N:.2f}")
```

```output
C 1e+18: N 8.440e+07, D 1.975e+09, D/N 23.40
C 1e+20: N 8.998e+08, D 1.852e+10, D/N 20.59
C 1e+21: N 2.938e+09, D 5.673e+10, D/N 19.31
C 1e+23: N 3.132e+10, D 5.322e+11, D/N 16.99
```

### Step 2: generate 45 IsoFLOP runs

At each budget, vary model size from one tenth to ten times its optimum. Data size
changes in the opposite direction to keep $6ND$ fixed. Add independent Gaussian
noise to log loss: its standard deviation 0.01 is approximately 1% multiplicative noise.
Print one complete budget so the later curve can be checked against actual numbers.

```python
rng = np.random.default_rng(0)
budgets = np.repeat([1e18, 3e18, 1e19, 3e19, 1e20], 9)
sizes = np.concatenate([optimum(C, truth)[0] * np.logspace(-1, 1, 9)
                        for C in np.unique(budgets)])
tokens = budgets / (6 * sizes)
clean = law(sizes, tokens, truth)
observed = clean * np.exp(rng.normal(0, 0.01, len(sizes)))
for N, D, loss in zip(sizes[:9], tokens[:9], observed[:9]):
    print(f"N {N:.3e}  D {D:.3e}  loss {loss:.3f}")

fig, ax = plt.subplots(figsize=(8, 4))
for C in np.unique(budgets):
    selected = budgets == C
    ax.plot(sizes[selected], observed[selected], "o-", label=f"C = {C:.0e}")
ax.set_xscale("log")
ax.set_xlabel("parameters N")
ax.set_ylabel("loss (nats per token)")
ax.legend()
plt.tight_layout()
plt.show()
```

```output
N 8.440e+06  D 1.975e+10  loss 3.938
N 1.501e+07  D 1.110e+10  loss 3.676
N 2.669e+07  D 6.245e+09  loss 3.529
N 4.746e+07  D 3.512e+09  loss 3.408
N 8.440e+07  D 1.975e+09  loss 3.353
N 1.501e+08  D 1.110e+09  loss 3.417
N 2.669e+08  D 6.245e+08  loss 3.555
N 4.746e+08  D 3.512e+08  loss 3.723
N 8.440e+08  D 1.975e+08  loss 3.923
```

### Step 3: fit in log space, with an explicit gradient

Parameterise $A=e^a$, $B_c=e^b$ and $E=e^e$. The log prediction is
`logsumexp(a - alpha*log(N), b - beta*log(D), e)`, which avoids exponentiating
very large raw terms. For residual $r$, the Huber penalty is $r^2/2$ inside
$|r|\le\delta$, and $\delta(|r|-\delta/2)$ outside; its derivative clips $r$
to $[-\delta,\delta]$.

The three softmax weights of the log-sum give its derivatives. In parameter order
$(a,b,e,\alpha,\beta)$, they are
$(w_N,w_D,w_E,-w_N\ln N,-w_D\ln D)$. Supplying this gradient avoids numerical
finite differences and lets us set convergence tolerances deliberately. Compare the
gradient with finite differences before trusting a long multi-start search.

```python
DELTA = 1e-3


def objective(theta, N, D, loss):
    a, b, e, alpha, beta = theta
    lnN, lnD = np.log(N), np.log(D)
    terms = np.vstack((a - alpha * lnN, b - beta * lnD,
                       np.full_like(lnN, e)))
    prediction = logsumexp(terms, axis=0)
    residual = prediction - np.log(loss)
    absolute = np.abs(residual)
    penalty = np.where(absolute <= DELTA, 0.5 * residual ** 2,
                       DELTA * (absolute - 0.5 * DELTA))
    weights = np.exp(terms - prediction)
    jacobian = np.vstack((weights, -weights[0] * lnN, -weights[1] * lnD))
    gradient = jacobian @ np.clip(residual, -DELTA, DELTA)
    return penalty.sum(), gradient


def unpack(theta):
    a, b, e, alpha, beta = theta
    return np.array([np.exp(e), np.exp(a), np.exp(b), alpha, beta])


def fit(N, D, loss, starts):
    best = None
    for start in starts:
        result = minimize(objective, start, args=(N, D, loss), jac=True,
                          method="L-BFGS-B",
                          bounds=[(-20, 30), (-20, 30), (-8, 4),
                                  (0.01, 1), (0.01, 1)],
                          options={"ftol": 1e-14, "gtol": 1e-9, "maxiter": 2000})
        if best is None or result.fun < best.fun:
            best = result
    return best


theta = np.array([np.log(480), np.log(2100), np.log(1.8), 0.35, 0.37])
_, analytic = objective(theta, sizes, tokens, observed)
numeric = []
for i in range(5):
    delta = np.zeros(5)
    delta[i] = 1e-6
    numeric.append((objective(theta + delta, sizes, tokens, observed)[0]
                    - objective(theta - delta, sizes, tokens, observed)[0]) / 2e-6)
error = np.max(np.abs(analytic - numeric))
print(f"gradient maximum absolute error {error:.2e}")
assert error < 1e-7
starts = list(itertools.product([2, 6, 10], [2, 6, 10], [0, 0.5, 1],
                               [0.2, 0.4, 0.6], [0.2, 0.4, 0.6]))
started = time.perf_counter()
fitted = fit(sizes, tokens, observed, starts)
constants = unpack(fitted.x)
print(f"starts {len(starts)}, fit time {time.perf_counter() - started:.1f} s")
print("converged:", fitted.success, fitted.message)
print("E, A, Bc, alpha, beta:", np.round(constants, 4).tolist())
relative = np.max(np.abs(law(sizes, tokens, constants) / clean - 1))
print(f"largest error against generating law at observed runs: {relative:.2%}")
```

```output
gradient maximum absolute error 3.92e-10
starts 243, fit time 8.9 s
converged: True CONVERGENCE: NORM OF PROJECTED GRADIENT <= PGTOL
E, A, Bc, alpha, beta: [1.8355, 620.4347, 1736.2444, 0.3675, 0.3609]
largest error against generating law at observed runs: 0.71%
```

The tolerances above are stricter than the optimiser's defaults. A small objective
does not itself prove convergence: the Huber threshold makes the objective and
gradient small in absolute units. Inspect the termination message and compare starts.

### Step 4: compare allocations and a curve-vertex estimate

A close loss fit may still shift the optimal model size. The exponent
$\beta/(\alpha+\beta)$ is repeatedly multiplied by log compute during extrapolation.
Also estimate the optimum from a quadratic in $\log_{10}N$ at each budget, then fit
the relation between those vertices and compute. This resembles the IsoFLOP approach,
but a parabola is only an approximation to this generated law over the sampled range.

```python
for C in (1e20, 1e21, 1e23):
    Nt, Dt = optimum(C, truth)
    Nf, Df = optimum(C, constants)
    print(f"C {C:.0e}: true N {Nt:.3e}, fit N {Nf:.3e}; "
          f"true D/N {Dt / Nt:.1f}, fit D/N {Df / Nf:.1f}")

vertices = []
for C in np.unique(budgets):
    mask = budgets == C
    quadratic = np.polyfit(np.log10(sizes[mask]), observed[mask], 2)
    assert quadratic[0] > 0
    vertices.append(10 ** (-quadratic[1] / (2 * quadratic[0])))
slope, intercept = np.polyfit(np.log10(np.unique(budgets)), np.log10(vertices), 1)
parametric_slope = constants[4] / (constants[3] + constants[4])
print(f"vertex slope {slope:.4f}, parametric slope {parametric_slope:.4f}, "
      f"true slope {truth[4] / (truth[3] + truth[4]):.4f}")
print(f"vertex estimate of N at C=1e23: {10 ** (slope * 23 + intercept):.3e}")
```

```output
C 1e+20: true N 8.998e+08, fit N 8.327e+08; true D/N 20.6, fit D/N 24.0
C 1e+21: true N 2.938e+09, fit N 2.606e+09; true D/N 19.3, fit D/N 24.5
C 1e+23: true N 3.132e+10, fit N 2.552e+10; true D/N 17.0, fit D/N 25.6
vertex slope 0.4995, parametric slope 0.4954, true slope 0.5139
vertex estimate of N at C=1e23: 2.646e+10
```

### Step 5: bootstrap uncertainty and audit optimisation

Resample the 45 runs with replacement 30 times. Set `RESAMPLES = 60` for the larger
experiment. Fit each resample from sixteen starts, then from the full-data solution
alone, using the **same strict tolerances**. A single start is suspect when it stops
early or finds a poorer objective; it is acceptable when it finds the same solution.
Multiple starts are a diagnostic, not a mathematical guarantee of honest uncertainty.

These intervals describe this noise model and sampled design. They omit uncertainty
about the power-law form, corpus changes and hardware-dependent training recipes.
The [replication discussion](https://arxiv.org/abs/2404.10102) explains why fit and
uncertainty details matter when drawing conclusions from real scaling experiments.

```python
RESAMPLES = 30
bootstrap_rng = np.random.default_rng(1)
bootstrap_starts = list(itertools.product([4, 8], [4, 8], [0.5],
                                         [0.3, 0.5], [0.3, 0.5]))
allocations, single_allocations, alphas, objective_gaps = [], [], [], []
started = time.perf_counter()
for _ in range(RESAMPLES):
    selected = bootstrap_rng.integers(0, len(sizes), len(sizes))
    N, D, loss = sizes[selected], tokens[selected], observed[selected]
    multiple = fit(N, D, loss, bootstrap_starts)
    single = fit(N, D, loss, [fitted.x])
    allocations.append(optimum(1e23, unpack(multiple.x))[0])
    single_allocations.append(optimum(1e23, unpack(single.x))[0])
    alphas.append(multiple.x[3])
    objective_gaps.append(single.fun - multiple.fun)
for label, values in (("sixteen starts", allocations), ("one start", single_allocations)):
    lo, hi = np.percentile(values, [5, 95])
    print(f"{label}: N(1e23) 5th–95th percentiles {lo:.3e} to {hi:.3e}")
print(f"alpha range {min(alphas):.3f} to {max(alphas):.3f}")
print(f"largest one-start excess objective {max(objective_gaps):.2e}")
print(f"bootstrap time {time.perf_counter() - started:.1f} s")

fig, ax = plt.subplots(figsize=(8, 4))
ax.hist(np.array(allocations) / 1e9, bins=10, alpha=0.6, label="sixteen starts")
ax.hist(np.array(single_allocations) / 1e9, bins=10, alpha=0.5, label="one start")
ax.axvline(optimum(1e23, truth)[0] / 1e9, color="black", label="generating optimum")
ax.set_xlabel("extrapolated parameters at C = 1e23 (billions)")
ax.set_ylabel("bootstrap resamples")
ax.legend()
plt.tight_layout()
plt.show()
```

```output
sixteen starts: N(1e23) 5th–95th percentiles 2.210e+10 to 3.032e+10
one start: N(1e23) 5th–95th percentiles 2.210e+10 to 3.032e+10
alpha range 0.335 to 0.395
largest one-start excess objective 1.38e-08
bootstrap time 17.1 s
```

### Step 6: the published constants do not yield one universal ratio

Keep the counting convention fixed when comparing these fits. The shortcut $C=6ND$
here charges every parameter, as in the scaling-law calculation. Module 06's more
explicit model-compute count excludes lookup-only embeddings and adds attention.

```python
published = [
    ("rounded Approach 3", [1.69, 406.4, 410.7, 0.34, 0.28]),
    ("unrounded exponents", [1.69, 406.4, 410.7, 0.3392, 0.2849]),
    ("replication refit", [1.8172, 482.01, 2085.43, 0.3478, 0.3658]),
]
for name, values in published:
    N, D = optimum(5.76e23, values)
    print(f"{name:22s}: N {N:.3e}, D {D:.3e}, D/N {D / N:.1f}")
print("Chinchilla's actual allocation: N 7.0e10, D 1.4e12, D/N 20.0")
metrics = dict(constants=constants.tolist(), truth=truth.tolist(),
               relative_error=float(relative), vertex_slope=float(slope),
               bootstrap_N=allocations, single_bootstrap_N=single_allocations,
               bootstrap_alpha=alphas, objective_gaps=objective_gaps)
with open("m07-lab3-metrics.json", "w", encoding="utf-8") as stream:
    json.dump(metrics, stream, indent=2)
```

```output
rounded Approach 3    : N 3.219e+10, D 2.982e+12, D/N 92.6
unrounded exponents   : N 4.031e+10, D 2.382e+12, D/N 59.1
replication refit     : N 7.225e+10, D 1.329e+12, D/N 18.4
Chinchilla's actual allocation: N 7.0e10, D 1.4e12, D/N 20.0
```

### What you should see

The loss curves have shallow minima. Check the fitted law against the known generating
law, and compare the resulting allocations beyond the observed compute range. Read
the bootstrap alongside the optimiser diagnostics: differences between search methods
may indicate optimisation error rather than additional statistical information.
The actual outputs above come from the executed code; elapsed times vary by machine.

Here the fitted allocation at $10^{23}$ FLOPs is $2.552\times10^{10}$ parameters,
about 19% below the generating optimum $3.132\times10^{10}$, despite only 0.71%
maximum loss error at the observed runs. Both search methods give the same bootstrap
interval to the printed precision. Its upper endpoint is below the known truth:
a percentile interval from 30 resamples does not guarantee coverage in one experiment.
Repeat both the resampling and the original noise draw before claiming a coverage rate.

### Try this

1. Double the multiplicative noise and compare the allocation interval.
2. Drop the largest compute budget, then refit and extrapolate to $10^{23}$ FLOPs.
3. Restore the optimiser's default tolerances. Compare objective values and the two
   bootstrap intervals before interpreting any narrower interval as greater certainty.
