## Lab 1 — A mini data pipeline: filters and MinHash-LSH {#lab1}

**Goal.** Add known junk and copies to a small corpus, audit heuristic filters,
implement exact and approximate duplicate detection, and compare the measured
candidate rates with the LSH formula. Keep an explicit reason for every removal.
The pipeline is an experiment on children's stories, not a ready-made quality
policy for technical documents.

Download one 10 MB parquet file from
[TinyStories](https://huggingface.co/datasets/roneneldan/TinyStories), a synthetic
English story dataset released under CDLA-Sharing-1.0. The code reads the released
validation file as this lab's raw corpus; it does not use the dataset's original
train/test split as an evaluation of a pretrained model. The revision is pinned,
and no corpus file is added to the tutorial repository. Install `pandas` and
`pyarrow` from the series' lab requirements if they are not already available.

### Construct a corpus with an audit trail

The first 5,000 stories are labelled `clean` for this controlled experiment. That
label means “original input”, not “approved by a human quality review”. Add four
types of junk, exact copies, and six groups of lightly edited copies. The near-copy
generator independently replaces each word with probability $q$; it can produce
zero edits, especially at $q=0.01$. The labels therefore record provenance rather
than guaranteed similarity.

```python
import re
import time
import json
import random
import hashlib
import itertools
import zlib
from pathlib import Path
from collections import Counter, defaultdict
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from huggingface_hub import hf_hub_download

random.seed(0)
np.random.seed(0)
revision = "f54c09fd23315a6f9c86f9dc80f725de7d8f9c64"
path = hf_hub_download(
    "roneneldan/TinyStories",
    "data/validation-00000-of-00001-869c898b519ad725.parquet",
    repo_type="dataset", revision=revision,
)
stories = pd.read_parquet(path)["text"].tolist()
docs = stories[:5000].copy()
labels = ["clean"] * len(docs)
rng = random.Random(0)
def add(text, label):
    docs.append(text)
    labels.append(label)

menus = ["Home", "Products", "Support", "Prices", "Contact", "About"]
for i in range(150):
    lines = [" | ".join(rng.sample(menus, len(menus))) for _ in range(12)]
    add("\n".join(lines), "navigation")
spam = ["BUY", "NOW!!!", "$$$", "#deal", "#sale", "CHEAP", ">>>", "***", "100%", "FREE"]
for i in range(150):
    add(" ".join(rng.choices(spam, k=rng.randint(60, 120))), "spam")
for i in range(150):
    sentence = stories[rng.randrange(5000)].split(".")[0] + "."
    add("\n".join([sentence]*rng.randint(8, 15)), "repeated line")
for i in range(150):
    add(" ".join(stories[rng.randrange(5000)].split()[:rng.randint(5, 25)]), "short")
for i in range(200):
    add(stories[rng.randrange(5000)], "exact copy")
near_pairs, edit_rates = [], []
for q in [.01, .03, .05, .08, .12, .20]:
    for i in range(100):
        original = rng.randrange(5000)
        words = docs[original].split()
        edited = [rng.choice(["river", "signal", "engine", "garden"])
                  if rng.random() < q else word for word in words]
        near_pairs.append((original, len(docs)))
        edit_rates.append(q)
        add(" ".join(edited), "near copy")
print("Released validation stories:", len(stories))
print("Experimental corpus:", len(docs), dict(Counter(labels)))
```

```output
Released validation stories: 21990
Experimental corpus: 6400 {'clean': 5000, 'navigation': 150, 'spam': 150, 'repeated line': 150, 'short': 150, 'exact copy': 200, 'near copy': 600}
```

### Record the first failed heuristic

These rules approximate a subset of the
[Gopher filtering heuristics](https://arxiv.org/abs/2112.11446). The definitions are
explicit: words are whitespace-separated pieces; duplicate-line fraction counts
every occurrence after a line's first; the frequent-bigram fraction counts its
character contribution divided by the text length. These simplifications matter
when comparing the results with a production implementation.

```python
STOP = {"the", "be", "to", "of", "and", "that", "have", "with"}
def quality_reason(text):
    words = text.split()
    if not 50 <= len(words) <= 100000:
        return "word count"
    if not 3 <= np.mean([len(w) for w in words]) <= 10:
        return "word length"
    if (text.count("#") + text.count("..."))/len(words) > .1:
        return "symbols"
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if sum(line.startswith(("-", "*", "•")) for line in lines)/len(lines) > .9:
        return "bullet lines"
    if sum(line.endswith("...") for line in lines)/len(lines) > .3:
        return "ellipsis lines"
    if sum(any(char.isalpha() for char in w) for w in words)/len(words) < .8:
        return "alphabetic words"
    lower = [re.sub(r"[^a-z]", "", w.lower()) for w in words]
    if len(set(lower) & STOP) < 2:
        return "stop words"
    if (len(lines)-len(set(lines)))/len(lines) > .3:
        return "duplicate lines"
    pairs = Counter(zip(words, words[1:]))
    pair, count = pairs.most_common(1)[0]
    if count*sum(map(len, pair))/max(1, len(text)) > .2:
        return "frequent bigram"
    return None

reasons = [quality_reason(text) for text in docs]
table = pd.crosstab(pd.Series(labels, name="label"),
                    pd.Series([r or "pass" for r in reasons], name="first failure"))
print(table.to_string())
print("Original stories rejected:",
      sum(r is not None for r in reasons[:5000]), "/ 5000")

patterns = ("â€", "Ã", "Â")
flagged = [i for i,text in enumerate(docs[:5000]) if any(p in text for p in patterns)]
repaired = 0
for i in flagged:
    try:
        candidate = docs[i].encode("cp1252").decode("utf8")
    except UnicodeError:
        continue
    if not any(p in candidate for p in patterns):
        repaired += 1
print("Mojibake candidates:", len(flagged), "whole-string repair successes:", repaired)
```

```output
first failure  alphabetic words  duplicate lines  ellipsis lines  pass  stop words  symbols  word count
label
clean                         0                0               1  4997           0        0           2
exact copy                    0                0               0   200           0        0           0
navigation                  150                0               0     0           0        0           0
near copy                     0                0               0   599           0        0           1
repeated line                 0               24               0     0         122        0           4
short                         0                0               0     0           0        0         150
spam                          0                0               0     0           0      150           0
Original stories rejected: 3 / 5000
Mojibake candidates: 303 whole-string repair successes: 97
```

The repair probe does not modify the corpus: the next stages must compare the
copies with exactly the texts that generated them. A production repair stage would
run before generating fingerprints, log changes, and handle mixed encodings rather
than applying this one-pass conversion to every document. A successful conversion
is not itself proof that the intended text was recovered.

### Exact fingerprints and shingle sets

Normalise case and whitespace before hashing. SHA-1 here is an index, not a security
claim; retaining the normalised string in the key also guards against an accidental
digest collision. Exact duplicates under this normalisation can include generated
near-copies with no edits. For near duplicates, use sets of five consecutive words,
so repetition does not increase a shingle's weight.

```python
def normalise(text):
    return " ".join(text.lower().split())

exact_seen, exact_removed = {}, set()
for i,text in enumerate(docs):
    normal = normalise(text)
    key = (hashlib.sha1(normal.encode()).digest(), normal)
    if key in exact_seen:
        exact_removed.add(i)
    else:
        exact_seen[key] = i
print("Exact duplicates (all input):", len(exact_removed))

def shingles(text):
    words = normalise(text).split()
    return {tuple(words[i:i+5]) for i in range(len(words)-4)}

sets = [shingles(text) for text in docs]
def jaccard(a, b):
    union = a | b
    return len(a & b)/len(union) if union else 1.0

true_j = np.array([jaccard(sets[a], sets[b]) for a,b in near_pairs])
print("Generated near-copies that are exact:",
      sum(normalise(docs[a]) == normalise(docs[b]) for a,b in near_pairs))
print("Near-pair true Jaccard range:", f"{true_j.min():.3f}", f"{true_j.max():.3f}")
```

```output
Exact duplicates (all input): 242
Generated near-copies that are exact: 18
Near-pair true Jaccard range: 0.000 1.000
```

The “true Jaccard” calculation above compares actual word tuples. The MinHash
implementation below uses CRC32 IDs for speed; collisions and its approximate
hash family are additional sources of error relative to those true sets.

### MinHash signatures and banded candidates

Draw 128 hash functions once and reuse them for every document. Use uint64 for
the product: a 32-bit input times a coefficient below $2^{31}-1$ fits within uint64
but can overflow uint32. Empty shingle sets receive a sentinel signature and are
excluded from candidate buckets because similarity has no useful evidence there.

Under independent ideal MinHashes, equality estimates Jaccard and banding with
16 bands of eight rows proposes a pair with probability $1-(1-s^8)^{16}$.
The simple universal family used here is an approximation to that ideal; compare
the experiment with the curve rather than treating the formula as an exact guarantee.

```python
p = np.uint64(2**31-1)
hash_rng = np.random.default_rng(0)
a = hash_rng.integers(1, int(p), size=128, dtype=np.uint64)
b = hash_rng.integers(0, int(p), size=128, dtype=np.uint64)
signatures = np.full((len(docs), 128), int(p), dtype=np.uint64)
start = time.perf_counter()
for i,shingle_set in enumerate(sets):
    if shingle_set:
        ids = np.array([zlib.crc32(" ".join(shingle).encode())
                        for shingle in shingle_set], dtype=np.uint64)
        signatures[i] = ((ids[:, None]*a[None, :] + b[None, :]) % p).min(0)
signature_seconds = time.perf_counter()-start
estimated = np.array([(signatures[x] == signatures[y]).mean() for x,y in near_pairs])
error = np.abs(estimated[:300]-true_j[:300])
print("Signature seconds:", f"{signature_seconds:.2f}")
print("First 300 pairs, mean/max absolute error:",
      f"{error.mean():.4f}", f"{error.max():.4f}")

buckets = defaultdict(list)
for i,signature in enumerate(signatures):
    if sets[i]:
        for band in range(16):
            buckets[(band, signature[band*8:(band+1)*8].tobytes())].append(i)
start = time.perf_counter()
candidates = set()
for bucket in buckets.values():
    candidates.update(itertools.combinations(bucket, 2))
print("Candidate pairs:", len(candidates), "of", len(docs)*(len(docs)-1)//2,
      "possible; bucket-pair seconds:", f"{time.perf_counter()-start:.2f}")
detected = np.array([pair in candidates for pair in near_pairs])
bin_edges = [0, .4, .5, .6, .7, .8, .9, 1.000001]
observations = []
print("Jaccard bin       pairs empirical theory-mean")
for lo,hi in zip(bin_edges, bin_edges[1:]):
    mask = (true_j >= lo) & (true_j < hi)
    if mask.any():
        theory = 1-(1-true_j[mask]**8)**16
        row = dict(lower=lo, upper=min(hi,1), pairs=int(mask.sum()),
                   mean_j=float(true_j[mask].mean()),
                   empirical=float(detected[mask].mean()), theory=float(theory.mean()))
        observations.append(row)
        print(f"[{lo:.1f}, {min(hi,1):.1f}] {mask.sum():7d} "
              f"{row['empirical']:9.3f} {row['theory']:11.3f}")
similarity = np.linspace(0,1,501)
plt.figure(figsize=(7, 3))
plt.plot(similarity, 1-(1-similarity**8)**16, label="Ideal independent MinHashes")
plt.scatter([r["mean_j"] for r in observations],
            [r["empirical"] for r in observations], label="600 constructed pairs")
plt.xlabel("True five-word-shingle Jaccard")
plt.ylabel("Candidate probability / observed fraction")
plt.title("LSH: 16 bands of 8 rows")
plt.legend()
plt.tight_layout()
plt.show()
```

```output
Signature seconds: 0.55
First 300 pairs, mean/max absolute error: 0.0275 0.1390
Candidate pairs: 780 of 20476800 possible; bucket-pair seconds: 0.01
Jaccard bin       pairs empirical theory-mean
[0.0, 0.4]     187     0.000       0.002
[0.4, 0.5]      69     0.000       0.029
[0.5, 0.6]      69     0.029       0.119
[0.6, 0.7]      56     0.464       0.405
[0.7, 0.8]      85     0.906       0.812
[0.8, 0.9]      66     1.000       0.986
[0.9, 1.0]      68     1.000       1.000
```

The printed theory column averages the formula at each pair's actual similarity,
rather than substituting a wide bin's midpoint. All pairs share the same hash
family and may share a source story, so the bin counts are not independent Bernoulli
trials. The scatter is a diagnostic, not a coverage-validated uncertainty interval.

### Verify candidates, cluster and log removals

LSH only proposes candidates. Verify their actual shingle overlap before joining
clusters. Union-find keeps the lowest document index in each cluster. Transitive
closure can join A to C through B even when A and C fall below the threshold; that
is a cluster policy, not a claim that every pair in the cluster passes the cutoff.

For the final pipeline, first remove failed-quality documents, then exact copies
among the surviving documents, then verified near-duplicate clusters. Recompute
the exact keepers at this stage: an earlier first occurrence may have failed quality.

```python
def cluster_remove(active, threshold):
    active = set(active)
    parent = {i:i for i in active}
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
    for x,y in sorted(candidates):
        if x in active and y in active and jaccard(sets[x],sets[y]) >= threshold:
            rx,ry = find(x),find(y)
            parent[max(rx,ry)] = min(rx,ry)
    return {i for i in active if find(i) != i}

threshold_results = {}
for threshold in [.7,.8,.9]:
    removed = cluster_remove(range(len(docs)), threshold)
    expected = {copy_id for (source,copy_id),similarity in zip(near_pairs,true_j)
                if similarity >= threshold} | set(range(5600,5800))
    precision = len(removed & expected)/len(removed) if removed else 0
    recall = len(removed & expected)/len(expected) if expected else 0
    threshold_results[str(threshold)] = dict(removed=len(removed),
                                            precision=precision, recall=recall)
    print(f"Threshold {threshold:.1f}: removed {len(removed)}; "
          f"constructed-label precision {precision:.3f}; recall {recall:.3f}")

log = {i:"quality: "+reason for i,reason in enumerate(reasons) if reason}
survivors = [i for i in range(len(docs)) if i not in log]
seen = {}
for i in survivors:
    normal = normalise(docs[i])
    key = (hashlib.sha1(normal.encode()).digest(),normal)
    if key in seen:
        log[i] = "exact copy of document " + str(seen[key])
    else:
        seen[key] = i
before_near = [i for i in survivors if i not in log]
near_removed = cluster_remove(before_near,.8)
for i in near_removed:
    log[i] = "near-duplicate cluster at Jaccard threshold 0.8"
counts = Counter(reason.split(":")[0].split(" of ")[0].split(" at ")[0]
                 for reason in log.values())
print("Pipeline:", len(docs), "in;", dict(counts),
      "removed;", len(docs)-len(log), "out")
for i in sorted(log)[:5]:
    print("document", i, "label", labels[i], "reason", log[i])
metrics = dict(input_docs=len(docs), label_counts=dict(Counter(labels)),
               quality_rejections=sum(r is not None for r in reasons),
               original_rejections=sum(r is not None for r in reasons[:5000]),
               mojibake_flags=len(flagged), repair_successes=repaired,
               exact_duplicates_all_input=len(exact_removed),
               minhash_mae=float(error.mean()), minhash_max_error=float(error.max()),
               candidate_pairs=len(candidates), detection_bins=observations,
               thresholds=threshold_results, pipeline_removed=dict(counts),
               output_docs=len(docs)-len(log))
Path("lab1-metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf8")
```

```output
Threshold 0.7: removed 461; constructed-label precision 0.892; recall 0.981
Threshold 0.8: removed 379; constructed-label precision 0.881; recall 1.000
Threshold 0.9: removed 306; constructed-label precision 0.876; recall 1.000
Pipeline: 6400 in; {'quality': 604, 'exact copy': 218, 'near-duplicate cluster': 116} removed; 5462 out
document 65 label clean reason quality: word count
document 200 label clean reason quality: ellipsis lines
document 2838 label clean reason quality: word count
document 5000 label navigation reason quality: alphabetic words
document 5001 label navigation reason quality: alphabetic words
```

Constructed-label precision compares removals with inserted copies passing the
chosen similarity threshold. It is not human-labelled duplicate precision: an
original story or junk page can also duplicate another input. Review such apparent
false positives instead of assuming that every discrepancy is an algorithm error.

### What you should see

The junk classes fail different rules, while some original stories also fail. That
is evidence that the heuristic needs a false-positive audit. Encoding artefacts
can survive ordinary lexical filters. Exact-copy count can exceed the number of
inserted exact copies because some near-copy draws make no effective change.

Candidate rates rise sharply with true shingle similarity. One changed word can
alter as many as five shingles, so a modest word-edit rate can produce low Jaccard
and escape an aggressive eight-row banding scheme. Candidate generation saves
pairwise comparisons at the cost of missed pairs. Verification prevents low-overlap
hash coincidences from being treated as duplicates but cannot recover pairs that
LSH never proposed.

### Try this

1. Use 32 bands of four rows and eight bands of sixteen rows, keeping 128 signature
   values. Compare candidate count and recall, and plot all three theoretical curves.
2. Hold out fifty source stories as a mock benchmark. Insert ten edited versions
   and compare five-word MinHash with a thirteen-word overlap detector. Split
   duplicate families together before using a corpus for validation.
3. Apply the quality rules to a structured technical argument with numbered goals
   and terse records. Inspect rejected examples before transferring any threshold
   from web prose to the engineering domain.

## Lab 2 — Pretrain a small GPT on TinyStories {#lab2}

**Goal.** Train a tokenizer and decoder, pack documents, monitor training and
validation, score a small cloze test, and prove that a checkpoint restores the
optimiser and random sampler as well as the weights. Save a tokenizer, model
configuration and measured run record.

This lab repeats the pinned 10 MB TinyStories download from Lab 1 and makes its
own split and tokenizer. Every lab can run in a fresh process. The synthetic
children's stories are a small training experiment, not evidence about technical
reasoning. Start with `QUICK = True` (150 steps); set it to `False` for 600 steps.
Both paths use the same architecture. A free Colab GPU is another option; the code
uses bf16 autocast only when the CUDA device supports it.

### Fix the split, tokenizer and packed stream

Hold out 1,000 stories before fitting BPE. Start from all 256 bytes, retain the
end-of-text special token, and train a vocabulary of 4,096 on the remaining
20,990 stories. Keep that mapping unchanged for training, scoring and generation.
The released validation parquet is this lab's raw corpus; our split is separate
from TinyStories' original training/validation division.

```python
QUICK = True
import math
import time
import json
from pathlib import Path
from contextlib import nullcontext
import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.nn import functional as F
import matplotlib.pyplot as plt
from tokenizers import Tokenizer, models, trainers, pre_tokenizers, decoders
from huggingface_hub import hf_hub_download

torch.set_num_threads(4)
torch.manual_seed(0)
np.random.seed(0)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
use_bf16 = device.type == "cuda" and torch.cuda.is_bf16_supported()

def precision():
    return (torch.autocast("cuda", dtype=torch.bfloat16) if use_bf16
            else nullcontext())

revision = "f54c09fd23315a6f9c86f9dc80f725de7d8f9c64"
path = hf_hub_download(
    "roneneldan/TinyStories",
    "data/validation-00000-of-00001-869c898b519ad725.parquet",
    repo_type="dataset", revision=revision,
)
stories = pd.read_parquet(path)["text"].tolist()
order = np.random.default_rng(0).permutation(len(stories))
train_texts = [stories[i] for i in order[1000:]]
valid_texts = [stories[i] for i in order[:1000]]

def train_tokenizer(texts):
    tokenizer = Tokenizer(models.BPE())
    tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
    tokenizer.decoder = decoders.ByteLevel()
    trainer = trainers.BpeTrainer(
        vocab_size=4096, special_tokens=["<|endoftext|>"],
        initial_alphabet=pre_tokenizers.ByteLevel.alphabet(), show_progress=False,
    )
    tokenizer.train_from_iterator(texts, trainer=trainer)
    return tokenizer

tokenizer = train_tokenizer(train_texts)
eos = tokenizer.token_to_id("<|endoftext|>")

def pack(texts, tok=tokenizer):
    ends = tok.token_to_id("<|endoftext|>")
    encoded = tok.encode_batch(texts)
    lengths = [len(item.ids)+1 for item in encoded]
    stream = np.fromiter(
        (token for item in encoded for token in [*item.ids, ends]),
        dtype=np.uint16, count=sum(lengths),
    )
    return torch.from_numpy(stream.astype(np.int64)), lengths

train_data, lengths = pack(train_texts)
valid_data, _ = pack(valid_texts)
print("Device:", device, "bf16 autocast:", use_bf16)
print("Stories:", len(train_texts), "train;", len(valid_texts), "validation")
print("Vocabulary:", tokenizer.get_vocab_size(), "EOS:", eos)
print("Tokens:", len(train_data), "train;", len(valid_data), "validation")
```

```output
Device: cpu bf16 autocast: False
Stories: 20990 train; 1000 validation
Vocabulary: 4096 EOS: 0
Tokens: 4650186 train; 228958 validation
```

Packing appends EOS to each story and concatenates them. Windows can cross an
EOS boundary; this experiment permits attention to preceding documents instead
of implementing block-diagonal document masking. Every position still has a
causal target. Padding whole stories to multiples of 512 would waste the fraction
printed below, assuming that stories longer than 512 are split into chunks.

```python
example = "Once upon a time, there was a little girl named Lily."
print("Example tokens:", tokenizer.encode(example).tokens)
characters = sum(map(len,train_texts))
words = sum(len(text.split()) for text in train_texts)
content_tokens = len(train_data)-len(train_texts)
padded = sum(512*math.ceil(length/512) for length in lengths)
print(f"Compression: {characters/content_tokens:.3f} characters/token; "
      f"{content_tokens/words:.3f} tokens/word")
print(f"Padding waste avoided: {1-len(train_data)/padded:.1%}")

# A measured large-matmul baseline, not the hardware's advertised peak.
dtype = torch.bfloat16 if use_bf16 else torch.float32
a = torch.randn(1024,1024,device=device,dtype=dtype)
b = torch.randn_like(a)
for _ in range(3):
    product = a@b
if device.type == "cuda":
    torch.cuda.synchronize()
start = time.perf_counter()
for _ in range(20):
    product = a@b
if device.type == "cuda":
    torch.cuda.synchronize()
matmul_rate = 20*2*1024**3/(time.perf_counter()-start)
print(f"Measured matmul baseline: {matmul_rate/1e9:.1f} GFLOP/s")
```

```output
Example tokens: ['Once', 'Ġupon', 'Ġa', 'Ġtime', ',', 'Ġthere', 'Ġwas', 'Ġa', 'Ġlittle', 'Ġgirl', 'Ġnamed', 'ĠLily', '.']
Compression: 3.952 characters/token; 1.294 tokens/word
Padding waste avoided: 58.0%
Measured matmul baseline: 509.1 GFLOP/s
```

On a CPU, model FLOP/s divided by this measured baseline is a utilisation proxy.
It is not production MFU, whose denominator is the device's published peak at
the training precision. Matmul size, kernel choice and other running programs
affect this measurement; keep it beside the throughput figure rather than treating
it as a machine specification.

### Declare the decoder and optimiser

This is Module 06's causal decoder, repeated here for independence: RMSNorm,
RoPE, SwiGLU, no biases and tied input/output embeddings. Residual projections
start with a smaller standard deviation. The optional QK norms are disabled in
this lab; Lab 3 tests them. There is no dropout, making the resume experiment
easier to interpret.

```python
class RMSNorm(nn.Module):
    def __init__(self, width):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(width))

    def forward(self, x):
        return F.rms_norm(x, (x.shape[-1],), self.weight, eps=1e-5)

class Attention(nn.Module):
    def __init__(self, d, heads, context, qk_norm=False):
        super().__init__()
        self.heads, self.dh = heads, d//heads
        self.qkv = nn.Linear(d, 3*d, bias=False)
        self.out = nn.Linear(d, d, bias=False)
        self.qnorm = RMSNorm(self.dh) if qk_norm else nn.Identity()
        self.knorm = RMSNorm(self.dh) if qk_norm else nn.Identity()
        angles = torch.outer(torch.arange(context),
                             10000**(-torch.arange(0, self.dh, 2)/self.dh))
        self.register_buffer("cos", angles.cos(), persistent=False)
        self.register_buffer("sin", angles.sin(), persistent=False)
        self.probe = False
        self.max_logit = 0.0

    def rotate(self, x):
        pairs = x.reshape(*x.shape[:-1], self.dh//2, 2)
        a, b = pairs.unbind(-1)
        cos = self.cos[:x.shape[-2]].to(x.dtype)
        sin = self.sin[:x.shape[-2]].to(x.dtype)
        return torch.stack((a*cos-b*sin, a*sin+b*cos), -1).flatten(-2)

    def forward(self, x):
        B,T,d = x.shape
        q,k,v = self.qkv(x).chunk(3, -1)
        q,k,v = [y.view(B,T,self.heads,self.dh).transpose(1,2)
                 for y in (q,k,v)]
        q,k = self.rotate(self.qnorm(q)), self.rotate(self.knorm(k))
        if self.probe:
            with torch.no_grad():
                scores = q.float() @ k.float().transpose(-2,-1)/math.sqrt(self.dh)
                causal = torch.ones(T,T,device=x.device,dtype=torch.bool).tril()
                self.max_logit = scores.masked_select(causal).abs().max().item()
        y = F.scaled_dot_product_attention(q,k,v,is_causal=True)
        return self.out(y.transpose(1,2).contiguous().view(B,T,d))

class Block(nn.Module):
    def __init__(self, d, heads, ff, context, qk_norm=False):
        super().__init__()
        self.n1, self.n2 = RMSNorm(d), RMSNorm(d)
        self.attn = Attention(d,heads,context,qk_norm)
        self.gate = nn.Linear(d,ff,bias=False)
        self.up = nn.Linear(d,ff,bias=False)
        self.down = nn.Linear(ff,d,bias=False)

    def forward(self, x):
        x = x + self.attn(self.n1(x))
        y = self.n2(x)
        return x + self.down(F.silu(self.gate(y))*self.up(y))

class GPT(nn.Module):
    def __init__(self, V=4096, d=256, layers=6, heads=8, ff=688,
                 context=256, qk_norm=False):
        super().__init__()
        assert d%heads == 0 and (d//heads)%2 == 0
        self.context = context
        self.embedding = nn.Embedding(V,d)
        self.blocks = nn.ModuleList(
            [Block(d,heads,ff,context,qk_norm) for _ in range(layers)])
        self.norm = RMSNorm(d)
        self.head = nn.Linear(d,V,bias=False)
        self.head.weight = self.embedding.weight
        for param in self.parameters():
            if param.ndim >= 2:
                nn.init.normal_(param,std=.02)
        for block in self.blocks:
            nn.init.normal_(block.attn.out.weight,std=.02/math.sqrt(2*layers))
            nn.init.normal_(block.down.weight,std=.02/math.sqrt(2*layers))

    def forward(self, tokens):
        x = self.embedding(tokens)
        for block in self.blocks:
            x = block(x)
        return self.head(self.norm(x))

def make_optimizer(model, lr):
    matrices = [p for p in model.parameters() if p.ndim >= 2]
    norms = [p for p in model.parameters() if p.ndim < 2]
    return torch.optim.AdamW(
        [{"params": matrices, "weight_decay": .1},
         {"params": norms, "weight_decay": 0.0}],
        lr=lr, betas=(.9,.95), eps=1e-8,
    )

def batch(stream, generator, T, B=16):
    starts = torch.randint(len(stream)-T, (B,), generator=generator)
    indices = starts[:,None] + torch.arange(T+1)
    windows = stream[indices].to(device)
    return windows[:,:-1], windows[:,1:]

@torch.no_grad()
def evaluate(model, batches):
    was_training = model.training
    model.eval()
    losses = []
    for x,y in batches:
        with precision():
            logits = model(x)
            loss = F.cross_entropy(logits.float().flatten(0,1), y.flatten())
        losses.append(loss.item())
    model.train(was_training)
    return float(np.mean(losses))

def learning_rate(step, steps, warmup, peak):
    if step < warmup:
        return peak*(step+1)/warmup
    fraction = (step-warmup)/max(1,steps-1-warmup)
    return peak*(.1 + .9*(1+math.cos(math.pi*fraction))/2)

@torch.no_grad()
def generate(model, prompt, count=60, temperature=.8, seed=0):
    was_training = model.training
    model.eval()
    ids = tokenizer.encode(prompt).ids
    generator = torch.Generator().manual_seed(seed)
    for _ in range(count):
        tokens = torch.tensor([ids[-model.context:]],device=device)
        with precision():
            logits = model(tokens)[0,-1].float().cpu()
        next_id = torch.multinomial((logits/temperature).softmax(-1),
                                    1,generator=generator).item()
        if next_id == eos:
            break
        ids.append(next_id)
    model.train(was_training)
    return tokenizer.decode(ids)
```

```python
config = dict(V=4096,d=256,layers=6,heads=8,ff=688,context=256)
torch.manual_seed(0)
model = GPT(**config).to(device)
N = sum(p.numel() for p in model.parameters())
assert N == 5795072
optimizer = make_optimizer(model,3e-3)
print("Parameters:", N)
print("Decayed matrices:",sum(p.numel() for p in optimizer.param_groups[0]["params"]))
print("Undecayed norms:",sum(p.numel() for p in optimizer.param_groups[1]["params"]))
steps, warmup = (150,30) if QUICK else (600,60)
T = config["context"]
train_generator = torch.Generator().manual_seed(0)
valid_generator = torch.Generator().manual_seed(123)
valid_batches = [batch(valid_data,valid_generator,T) for _ in range(20)]
flops_per_token = 6*N + 6*config["layers"]*T*config["d"]
print("Steps:", steps, "tokens/step:",16*T,
      "training FLOPs/token:",flops_per_token)
```

```output
Parameters: 5795072
Decayed matrices: 5791744
Undecayed norms: 3328
Steps: 150 tokens/step: 4096 training FLOPs/token: 37129728
```

### Score twenty-four explicit cloze items

Each pair below gives the intended answer first. Score each entire continuation
by summed conditional log-probability, including its leading space; do not sample
an answer or compare only the first token. Assert that appending the option does
not change the context tokens. This is a hand-written diagnostic of story
vocabulary and simple context use, not an independent benchmark. Most answers
are plausible from the last few words alone.

```python
cloze = [
    ('Once upon a time, there was a little girl named', 'Lily', 'table'),
    ('She was very happy because she got a new', 'toy', 'sad'),
    ('The dog wagged its', 'tail', 'book'),
    ('Tom was hungry, so he ate an', 'apple', 'car'),
    ('It was raining, so they took an', 'umbrella', 'elephant'),
    ('At night, the sky was full of', 'stars', 'soup'),
    ('Lily asked, "Can I go to the park?" Mom said, "Yes, you', 'can', 'blue'),
    ('The bird flew up into the', 'sky', 'spoon'),
    ('Ben fell down and hurt his', 'knee', 'cloud'),
    ('They played in the sand at the', 'beach', 'book'),
    ('The ice cream was cold and', 'sweet', 'angry'),
    ('The little boat floated on the', 'water', 'bread'),
    ('He was sad because he lost his', 'ball', 'happy'),
    ('The baby was tired, so she went to', 'sleep', 'fly'),
    ('The fish swam in the', 'pond', 'tree'),
    ('Max wanted to play, but it was time for', 'bed', 'sky'),
    ('The car went fast down the', 'road', 'cake'),
    ('At the end of the day, the sun went', 'down', 'fork'),
    ('Kate lost her red hat in the park. The next day, she went back '
     'to the park to look for her', 'hat', 'dog'),
    ('Ben had a dog and a cat. The dog liked to bark, '
     'and the cat liked to', 'meow', 'bark'),
    ('It was a cold winter day. Outside, the ground was covered with', 'snow', 'sand'),
    ('Lily was sad because her doll was broken. Then Dad fixed it, and '
     'Lily felt', 'happy', 'sad'),
    ('Sam loved to swim. Every day after school, he went to the', 'pool', 'library'),
    ('The sky was dark and full of clouds. Soon it began to', 'rain', 'shine'),
]

@torch.no_grad()
def continuation_score(model, context, option):
    prefix = tokenizer.encode(context).ids
    full = tokenizer.encode(context+" "+option).ids
    assert full[:len(prefix)] == prefix
    ids = torch.tensor([full],device=device)
    with precision():
        logp = model(ids[:,:-1]).float().log_softmax(-1)
    targets = ids[:,1:]
    scores = logp.gather(-1,targets[:,:,None]).squeeze(-1)
    return scores[0,len(prefix)-1:].sum().item()

def cloze_score(model):
    was_training = model.training
    model.eval()
    correct = [continuation_score(model,c,a)>continuation_score(model,c,b)
               for c,a,b in cloze]
    model.train(was_training)
    return sum(correct), sum(correct[:18]), sum(correct[18:])

initial_loss = evaluate(model,valid_batches)
initial_cloze = cloze_score(model)
print(f"Initial validation: {initial_loss:.4f}; uniform ln(V): {math.log(4096):.4f}")
print("Initial cloze (all / local / earlier-context):",initial_cloze)
```

```output
Initial validation: 8.3274; uniform ln(V): 8.3178
Initial cloze (all / local / earlier-context): (11, 11, 0)
```

### Train, evaluate and checkpoint

Draw random windows with a dedicated CPU generator. They can overlap; validation
comes from held-out stories, so low training loss alone is not the test. Log the
pre-clipping norm and the learning rate actually used. Fixed validation batches
and cloze scoring leave the training sampler untouched.

The checkpoint records the *next* step to execute, weights, Adam moments, sampler
and global random states. Saving only a model is sufficient for inference, but
does not recreate the next training update.

```python
def training_step(model, optimizer, generator, step):
    lr = learning_rate(step,steps,warmup,3e-3)
    for group in optimizer.param_groups:
        group["lr"] = lr
    x,y = batch(train_data,generator,T)
    optimizer.zero_grad(set_to_none=True)
    with precision():
        logits = model(x)
        loss = F.cross_entropy(logits.float().flatten(0,1),y.flatten())
    loss.backward()
    norm = nn.utils.clip_grad_norm_(model.parameters(),1.0).item()
    optimizer.step()
    return loss.item(),norm,lr

history, validation, resume_reference = [], [], []
wall_start = time.perf_counter()
interval_seconds = 0.0
midpoint = steps//2
for step in range(steps):
    start = time.perf_counter()
    loss,norm,lr = training_step(model,optimizer,train_generator,step)
    if device.type == "cuda":
        torch.cuda.synchronize()
    interval_seconds += time.perf_counter()-start
    history.append(dict(step=step+1,tokens=(step+1)*16*T,
                        loss=loss,grad_norm=norm,lr=lr))
    if midpoint <= step < midpoint+3:
        resume_reference.append(loss)
    if (step+1)%25 == 0:
        rate = 25*16*T/interval_seconds
        proxy = flops_per_token*rate/matmul_rate
        print(f"Step {step+1:3}; tokens {(step+1)*16*T:7}; loss {loss:.4f}; "
              f"norm {norm:.3f}; lr {lr:.2e}; {rate:.0f} tok/s; proxy {proxy:.1%}")
        interval_seconds = 0.0
    if (step+1)%150 == 0:
        val = evaluate(model,valid_batches)
        cloze_result = cloze_score(model)
        validation.append(dict(step=step+1,tokens=(step+1)*16*T,
                               loss=val,cloze=list(cloze_result)))
        print(f"Validation {step+1}: {val:.4f}; cloze {cloze_result}")
    if step+1 == midpoint:
        torch.save(dict(
            config=config,model=model.state_dict(),optimizer=optimizer.state_dict(),
            next_step=step+1,sampler=train_generator.get_state(),
            torch_rng=torch.get_rng_state(),numpy_rng=np.random.get_state(),
            cuda_rng=torch.cuda.get_rng_state_all() if device.type=="cuda" else [],
        ),"midpoint.pt")

elapsed = time.perf_counter()-wall_start
final_loss = evaluate(model,valid_batches)
print(f"Time: {elapsed:.1f}s; final validation {final_loss:.4f}; "
      f"perplexity {math.exp(final_loss):.2f}")
print("Sample:",generate(model,"Once upon a time",count=120))
```

```output
Step  25; tokens  102400; loss 5.8707; norm 3.043; lr 2.50e-03; 8102 tok/s; proxy 59.1%
Step  50; tokens  204800; loss 5.2623; norm 1.451; lr 2.83e-03; 8153 tok/s; proxy 59.5%
Step  75; tokens  307200; loss 4.6081; norm 0.821; lr 2.19e-03; 7953 tok/s; proxy 58.0%
Step 100; tokens  409600; loss 4.2007; norm 0.535; lr 1.31e-03; 6285 tok/s; proxy 45.8%
Step 125; tokens  512000; loss 4.2029; norm 0.567; lr 5.84e-04; 6088 tok/s; proxy 44.4%
Step 150; tokens  614400; loss 3.9935; norm 0.506; lr 3.00e-04; 7358 tok/s; proxy 53.7%
Validation 150: 3.9858; cloze (15, 12, 3)
Time: 88.4s; final validation 3.9858; perplexity 53.83
Sample: Once upon a time!" there was a little girl was a little girl called with a tree. He was looked down and wanted to work.
```

### Verify resumption and save the deliverables

Load only this locally created checkpoint. Restoring its trusted Python objects
requires `weights_only=False`; never use that option on an untrusted file. The
fresh-optimiser control starts with the same weights and draws the same windows,
but omits Adam's accumulated moments. Its first loss is identical because it is
measured before the first update; later losses reveal the changed trajectory.

```python
def resumed_losses(restore_optimizer):
    saved = torch.load("midpoint.pt",map_location=device,weights_only=False)
    resumed = GPT(**saved["config"]).to(device)
    resumed.load_state_dict(saved["model"])
    opt = make_optimizer(resumed,3e-3)
    if restore_optimizer:
        opt.load_state_dict(saved["optimizer"])
    generator = torch.Generator()
    generator.set_state(saved["sampler"].cpu())
    torch.set_rng_state(saved["torch_rng"].cpu())
    np.random.set_state(saved["numpy_rng"])
    if device.type == "cuda":
        torch.cuda.set_rng_state_all([state.cpu() for state in saved["cuda_rng"]])
    return [training_step(resumed,opt,generator,i)[0]
            for i in range(saved["next_step"],saved["next_step"]+3)]

restored = resumed_losses(True)
fresh = resumed_losses(False)
print("Original:"," ".join(f"{x:.6f}" for x in resume_reference))
print("Restored:"," ".join(f"{x:.6f}" for x in restored))
print("Fresh Adam:"," ".join(f"{x:.6f}" for x in fresh))
maximum_error = max(abs(a-b) for a,b in zip(restored,resume_reference))
print(f"Resume maximum loss error: {maximum_error:.3e}")
assert maximum_error < 1e-5
assert max(abs(a-b) for a,b in zip(fresh,resume_reference)) > 1e-4

torch.save(dict(config=config,model=model.state_dict()),"final-model.pt")
tokenizer.save("tokenizer.json")
metrics = dict(quick=QUICK,parameters=N,config=config,
               train_tokens=len(train_data),valid_tokens=len(valid_data),
               initial_validation=initial_loss,final_validation=final_loss,
               initial_cloze=list(initial_cloze),final_cloze=list(cloze_score(model)),
               elapsed_seconds=elapsed,matmul_flops_per_second=matmul_rate,
               history=history,validation=validation,
               resume_original=resume_reference,resume_restored=restored,
               resume_fresh_optimizer=fresh)
Path("lab2-metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf8")
fig,ax = plt.subplots(figsize=(7.2,3.6))
ax.plot([r["tokens"] for r in history],[r["loss"] for r in history],
        color="#0072B2",alpha=.65,label="Training batch")
ax.scatter([r["tokens"] for r in validation],[r["loss"] for r in validation],
           color="#D55E00",label="Held-out stories",zorder=3)
ax.set(xlabel="Training tokens seen",ylabel="Cross-entropy (nats/token)",
       title="TinyStories pretraining: loss and learning-rate schedule")
right = ax.twinx()
right.plot([r["tokens"] for r in history],[r["lr"] for r in history],
           color="#009E73",linestyle="--")
right.set_ylabel("Learning rate",color="#009E73")
ax.legend(loc="upper right")
fig.tight_layout()
plt.show()
```

```output
Original: 4.722644 4.489676 4.691318
Restored: 4.722644 4.489676 4.691318
Fresh Adam: 4.722644 6.282327 5.666222
Resume maximum loss error: 0.000e+00
```

The files live in the directory from which you ran the lab (the lab runner uses
`labs/module_08/run_lab2/`). Later labs train their own tokenizer and base, so
they do not depend on these files. Preserve the pinned corpus revision and split
alongside the run record if you reuse this checkpoint.

### What you should see

In this CPU environment, QUICK held-out loss fell from 8.3274 to 3.9858,
with 15/24 cloze answers correct (12/18 local, 3/6 earlier-context). A separate
600-step run reached 2.8327, perplexity 16.99, with 21/24 correct (18/18 and 3/6).
That full run also logged validation every 25 steps for the scaling diagnostic;
extra evaluations change elapsed time, while leaving the dedicated training
sampler untouched. Its three restored losses again matched exactly. Recorded
metrics distinguish QUICK from FULL; samples and timing depend on the machine.

Loss starts near the uniform baseline, then falls as the model learns frequent
story patterns. The cloze test distinguishes local completion from cases that
mention earlier context, but each item changes accuracy by 4.2 percentage points.
An improvement on a few questions is not a precise general capability estimate.
Samples can resemble stories while making grammatical or factual mistakes.

The complete checkpoint reproduces the next three losses; fresh Adam moments
change the second and third. Validation is measured on fixed windows in held-out
stories. Those windows are correlated and need not be free of duplicate families
across the document split; audit that issue before treating loss differences as
precise generalisation estimates.

### Try this

1. At equal estimated FLOPs, train the 1.33M-parameter shape from Lab 3 on more
   tokens and compare held-out loss. Include attention in the compute estimate.
2. Replace cosine decay with a stable phase and a final linear decay. Record
   validation just before decay and at the end rather than attributing every
   improvement to tokens alone.
3. On a GPU, enlarge width and batch gradually. Measure memory and throughput,
   and calculate MFU against the device's published peak at the precision used.

## Lab 3 — Provoke an instability, then diagnose its mechanism {#lab3}

**Goal.** Raise the learning rate of a small decoder, measure the resulting
attention logits and loss, and test warmup, gradient clipping, z-loss and QK
normalisation in a controlled sequence. Then compare sensitivity across three
learning rates. A fix is useful when it addresses the observed failure mechanism.

This lab downloads the same pinned 10 MB TinyStories file if it is not cached,
fits its own tokenizer and repeats the complete decoder declaration. Nine short
runs each start from the same seed and see the same windows. Expect several
minutes on a laptop CPU; a CUDA device or free Colab session also works.

### Repeat the data and model setup

The model is smaller than Lab 2's: width 128, four layers, four heads, SwiGLU width
352, context 128 and tied embeddings. QK normalisation applies a learned RMSNorm
to each query and key *before* RoPE. A diagnostic switch computes the largest
absolute causal attention logit on the final training batch; it does not change
the SDPA output or its gradient.

```python
import math
import time
import json
from pathlib import Path
from contextlib import nullcontext
import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.nn import functional as F
import matplotlib.pyplot as plt
from tokenizers import Tokenizer, models, trainers, pre_tokenizers, decoders
from huggingface_hub import hf_hub_download

torch.set_num_threads(4)
torch.manual_seed(0)
np.random.seed(0)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
use_bf16 = device.type == "cuda" and torch.cuda.is_bf16_supported()

def precision():
    return (torch.autocast("cuda", dtype=torch.bfloat16) if use_bf16
            else nullcontext())

revision = "f54c09fd23315a6f9c86f9dc80f725de7d8f9c64"
path = hf_hub_download(
    "roneneldan/TinyStories",
    "data/validation-00000-of-00001-869c898b519ad725.parquet",
    repo_type="dataset", revision=revision,
)
stories = pd.read_parquet(path)["text"].tolist()
order = np.random.default_rng(0).permutation(len(stories))
train_texts = [stories[i] for i in order[1000:]]
valid_texts = [stories[i] for i in order[:1000]]

def train_tokenizer(texts):
    tokenizer = Tokenizer(models.BPE())
    tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
    tokenizer.decoder = decoders.ByteLevel()
    trainer = trainers.BpeTrainer(
        vocab_size=4096, special_tokens=["<|endoftext|>"],
        initial_alphabet=pre_tokenizers.ByteLevel.alphabet(), show_progress=False,
    )
    tokenizer.train_from_iterator(texts, trainer=trainer)
    return tokenizer

tokenizer = train_tokenizer(train_texts)
eos = tokenizer.token_to_id("<|endoftext|>")

def pack(texts, tok=tokenizer):
    ends = tok.token_to_id("<|endoftext|>")
    encoded = tok.encode_batch(texts)
    lengths = [len(item.ids)+1 for item in encoded]
    stream = np.fromiter(
        (token for item in encoded for token in [*item.ids, ends]),
        dtype=np.uint16, count=sum(lengths),
    )
    return torch.from_numpy(stream.astype(np.int64)), lengths

train_data, lengths = pack(train_texts)
valid_data, _ = pack(valid_texts)
print("Device:", device, "bf16 autocast:", use_bf16)
print("Stories:", len(train_texts), "train;", len(valid_texts), "validation")
print("Vocabulary:", tokenizer.get_vocab_size(), "EOS:", eos)
print("Tokens:", len(train_data), "train;", len(valid_data), "validation")
```

```output
Device: cpu bf16 autocast: False
Stories: 20990 train; 1000 validation
Vocabulary: 4096 EOS: 0
Tokens: 4650186 train; 228958 validation
```

```python
class RMSNorm(nn.Module):
    def __init__(self, width):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(width))

    def forward(self, x):
        return F.rms_norm(x, (x.shape[-1],), self.weight, eps=1e-5)

class Attention(nn.Module):
    def __init__(self, d, heads, context, qk_norm=False):
        super().__init__()
        self.heads, self.dh = heads, d//heads
        self.qkv = nn.Linear(d, 3*d, bias=False)
        self.out = nn.Linear(d, d, bias=False)
        self.qnorm = RMSNorm(self.dh) if qk_norm else nn.Identity()
        self.knorm = RMSNorm(self.dh) if qk_norm else nn.Identity()
        angles = torch.outer(torch.arange(context),
                             10000**(-torch.arange(0, self.dh, 2)/self.dh))
        self.register_buffer("cos", angles.cos(), persistent=False)
        self.register_buffer("sin", angles.sin(), persistent=False)
        self.probe = False
        self.max_logit = 0.0

    def rotate(self, x):
        pairs = x.reshape(*x.shape[:-1], self.dh//2, 2)
        a, b = pairs.unbind(-1)
        cos = self.cos[:x.shape[-2]].to(x.dtype)
        sin = self.sin[:x.shape[-2]].to(x.dtype)
        return torch.stack((a*cos-b*sin, a*sin+b*cos), -1).flatten(-2)

    def forward(self, x):
        B,T,d = x.shape
        q,k,v = self.qkv(x).chunk(3, -1)
        q,k,v = [y.view(B,T,self.heads,self.dh).transpose(1,2)
                 for y in (q,k,v)]
        q,k = self.rotate(self.qnorm(q)), self.rotate(self.knorm(k))
        if self.probe:
            with torch.no_grad():
                scores = q.float() @ k.float().transpose(-2,-1)/math.sqrt(self.dh)
                causal = torch.ones(T,T,device=x.device,dtype=torch.bool).tril()
                self.max_logit = scores.masked_select(causal).abs().max().item()
        y = F.scaled_dot_product_attention(q,k,v,is_causal=True)
        return self.out(y.transpose(1,2).contiguous().view(B,T,d))

class Block(nn.Module):
    def __init__(self, d, heads, ff, context, qk_norm=False):
        super().__init__()
        self.n1, self.n2 = RMSNorm(d), RMSNorm(d)
        self.attn = Attention(d,heads,context,qk_norm)
        self.gate = nn.Linear(d,ff,bias=False)
        self.up = nn.Linear(d,ff,bias=False)
        self.down = nn.Linear(ff,d,bias=False)

    def forward(self, x):
        x = x + self.attn(self.n1(x))
        y = self.n2(x)
        return x + self.down(F.silu(self.gate(y))*self.up(y))

class GPT(nn.Module):
    def __init__(self, V=4096, d=256, layers=6, heads=8, ff=688,
                 context=256, qk_norm=False):
        super().__init__()
        assert d%heads == 0 and (d//heads)%2 == 0
        self.context = context
        self.embedding = nn.Embedding(V,d)
        self.blocks = nn.ModuleList(
            [Block(d,heads,ff,context,qk_norm) for _ in range(layers)])
        self.norm = RMSNorm(d)
        self.head = nn.Linear(d,V,bias=False)
        self.head.weight = self.embedding.weight
        for param in self.parameters():
            if param.ndim >= 2:
                nn.init.normal_(param,std=.02)
        for block in self.blocks:
            nn.init.normal_(block.attn.out.weight,std=.02/math.sqrt(2*layers))
            nn.init.normal_(block.down.weight,std=.02/math.sqrt(2*layers))

    def forward(self, tokens):
        x = self.embedding(tokens)
        for block in self.blocks:
            x = block(x)
        return self.head(self.norm(x))

def make_optimizer(model, lr):
    matrices = [p for p in model.parameters() if p.ndim >= 2]
    norms = [p for p in model.parameters() if p.ndim < 2]
    return torch.optim.AdamW(
        [{"params": matrices, "weight_decay": .1},
         {"params": norms, "weight_decay": 0.0}],
        lr=lr, betas=(.9,.95), eps=1e-8,
    )

def batch(stream, generator, T, B=16):
    starts = torch.randint(len(stream)-T, (B,), generator=generator)
    indices = starts[:,None] + torch.arange(T+1)
    windows = stream[indices].to(device)
    return windows[:,:-1], windows[:,1:]

@torch.no_grad()
def evaluate(model, batches):
    was_training = model.training
    model.eval()
    losses = []
    for x,y in batches:
        with precision():
            logits = model(x)
            loss = F.cross_entropy(logits.float().flatten(0,1), y.flatten())
        losses.append(loss.item())
    model.train(was_training)
    return float(np.mean(losses))

def learning_rate(step, steps, warmup, peak):
    if step < warmup:
        return peak*(step+1)/warmup
    fraction = (step-warmup)/max(1,steps-1-warmup)
    return peak*(.1 + .9*(1+math.cos(math.pi*fraction))/2)

@torch.no_grad()
def generate(model, prompt, count=60, temperature=.8, seed=0):
    was_training = model.training
    model.eval()
    ids = tokenizer.encode(prompt).ids
    generator = torch.Generator().manual_seed(seed)
    for _ in range(count):
        tokens = torch.tensor([ids[-model.context:]],device=device)
        with precision():
            logits = model(tokens)[0,-1].float().cpu()
        next_id = torch.multinomial((logits/temperature).softmax(-1),
                                    1,generator=generator).item()
        if next_id == eos:
            break
        ids.append(next_id)
    model.train(was_training)
    return tokenizer.decode(ids)
```

Use the first 8,000 stories of the fixed training split to make this experiment
smaller. The tokenizer still fits the full training split. The attention probe
measures the last batch, not the maximum ever seen over the run.

```python
train_data, _ = pack(train_texts[:8000])
small_config = dict(V=4096,d=128,layers=4,heads=4,ff=352,context=128)
probe_model = GPT(**small_config)
print("Small model parameters:",sum(p.numel() for p in probe_model.parameters()))
print("Training stream:",len(train_data),"tokens")
del probe_model

def run(lr, warmup=0, clip=None, z_loss=0.0, qk_norm=False, steps=150):
    torch.manual_seed(0)
    model = GPT(**small_config,qk_norm=qk_norm).to(device)
    # Decay all parameters in this controlled sweep, including norm gains.
    optimizer = torch.optim.AdamW(model.parameters(),lr=lr,betas=(.9,.95),
                                 eps=1e-8,weight_decay=.1)
    generator = torch.Generator().manual_seed(0)
    losses, norms, normalisers = [], [], []
    start = time.perf_counter()
    for step in range(steps):
        rate = lr*min(1,(step+1)/warmup) if warmup else lr
        for group in optimizer.param_groups:
            group["lr"] = rate
        for layer in model.blocks:
            layer.attn.probe = step == steps-1
        x,y = batch(train_data,generator,128)
        optimizer.zero_grad(set_to_none=True)
        with precision():
            logits = model(x).float()
            ce = F.cross_entropy(logits.flatten(0,1),y.flatten())
            logZ = torch.logsumexp(logits,-1)
            objective = ce + z_loss*logZ.square().mean()
        if not torch.isfinite(objective):
            raise RuntimeError(f"Non-finite objective at lr={lr}, step={step}")
        objective.backward()
        norm = nn.utils.clip_grad_norm_(
            model.parameters(),clip if clip is not None else float("inf"))
        optimizer.step()
        losses.append(ce.item())
        norms.append(norm.item())
        normalisers.append(logZ.detach().mean().item())
    return dict(lr=lr,warmup=warmup,clip=clip,z_loss=z_loss,qk_norm=qk_norm,
                final_loss=float(np.mean(losses[-20:])),worst_loss=max(losses[20:]),
                attention_logit=max(b.attn.max_logit for b in model.blocks),
                logZ=float(np.mean(normalisers[-20:])),max_grad_norm=max(norms),
                seconds=time.perf_counter()-start,losses=losses)
```

```output
Small model parameters: 1328256
Training stream: 1779818 tokens
```

### Apply the stabilisers cumulatively

Keep the high learning rate fixed while adding one intervention at a time. The
last comparison adds only QK norms to a run that already has the other three
interventions. Log cross-entropy separately from z-loss so that the objective
change does not create an artificial improvement in the comparison.

```python
specs = [
    ("reference",dict(lr=.003)),
    ("high rate",dict(lr=.03)),
    ("+ warmup",dict(lr=.03,warmup=50)),
    ("+ clipping",dict(lr=.03,warmup=50,clip=1.0)),
    ("+ z-loss",dict(lr=.03,warmup=50,clip=1.0,z_loss=1e-4)),
    ("+ QK norm",dict(lr=.03,warmup=50,clip=1.0,z_loss=1e-4,qk_norm=True)),
]
results = {}
print("Condition       final CE   worst CE   |attn logit|  mean logZ  max grad")
for name,settings in specs:
    result = run(**settings)
    results[name] = result
    print(f"{name:15} {result['final_loss']:8.3f} {result['worst_loss']:10.3f} "
          f"{result['attention_logit']:14.1f} {result['logZ']:10.2f} "
          f"{result['max_grad_norm']:9.2f}")

fig,ax = plt.subplots(figsize=(7.2,3.6))
for name,color in [("reference","#0072B2"),("high rate","#D55E00"),
                   ("+ z-loss","#CC79A7"),("+ QK norm","#009E73")]:
    ax.plot(np.arange(1,151),results[name]["losses"],label=name,color=color,alpha=.8)
ax.set(xlabel="Training step",ylabel="Cross-entropy (nats/token)",
       title="High learning rate: distinguish the failure and its intervention")
ax.legend()
fig.tight_layout()
plt.show()
```

```output
Condition       final CE   worst CE   |attn logit|  mean logZ  max grad
reference          4.273      5.948           28.4       8.92      3.00
high rate          5.234      6.285          971.7       8.22      5.94
+ warmup           5.389      6.313          975.6       8.12      5.97
+ clipping         5.549      6.337          752.7       7.81     16.05
+ z-loss           5.478      6.343         1138.2       7.82     15.77
+ QK norm          4.786      6.151           12.4       8.59      8.76
```

### Measure learning-rate sensitivity

Reuse the two already measured bare runs and the high-rate stabilised run. Three
new runs complete the sweep. These are training losses after an equal number of
steps, not held-out evaluation of nine selected checkpoints; use them to diagnose
optimisation, then validate any chosen recipe separately.

```python
rates = [.003,.03,.1]
bare = [results["reference"],results["high rate"],run(.1)]
all_fixes = [run(.003,warmup=50,clip=1,z_loss=1e-4,qk_norm=True),
             results["+ QK norm"],
             run(.1,warmup=50,clip=1,z_loss=1e-4,qk_norm=True)]
print("lr       bare CE   all-fixes CE   bare logit   all-fixes logit")
for lr,a,b in zip(rates,bare,all_fixes):
    print(f"{lr:5.3f} {a['final_loss']:10.3f} {b['final_loss']:14.3f} "
          f"{a['attention_logit']:12.1f} {b['attention_logit']:17.1f}")
metrics = dict(config=small_config,conditions=results,
               sweep_bare=bare,sweep_all=all_fixes)
Path("lab3-metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf8")
fig,ax = plt.subplots(figsize=(7.2,3.6))
ax.semilogx(rates,[r["final_loss"] for r in bare],"o-",color="#D55E00",
            label="Bare constant rate")
ax.semilogx(rates,[r["final_loss"] for r in all_fixes],"s-",color="#0072B2",
            label="Warmup + clip + z-loss + QK norm")
ax.set(xlabel="Peak learning rate",ylabel="Mean last-20-step loss (nats/token)",
       title="Learning-rate sensitivity of the small TinyStories model")
ax.legend()
fig.tight_layout()
plt.show()
```

```output
lr       bare CE   all-fixes CE   bare logit   all-fixes logit
0.003      4.273          4.024         28.4               7.0
0.030      5.234          4.786        971.7              12.4
0.100      5.498          4.916       2632.1               8.7
```

### What you should see

Compare loss and attention-logit growth together. Large attention logits can
produce sharply concentrated softmax rows and poor optimisation while every
logged loss remains finite. Clipping bounds the gradient norm, not the attention
logits. Z-loss constrains the output normaliser, not the query/key norms. Warmup
changes early update sizes, but does not by itself bound their eventual growth.

QK norms directly control query/key scale; learned gains mean the bound is not
the fixed $\sqrt{d_h}$ of unit RMS vectors. Their benefit in this sweep should be
read from the measured table, rather than assumed for every architecture and
learning rate. An intervention can widen the usable range while leaving a lower
learning rate substantially better. Repeating this experiment with different
seeds would test how much of each gap is stable.

### Try this

1. Log attention entropy per head during training. Compare its decline with loss
   and logit growth; a last-step maximum alone misses the timing of the collapse.
2. Remove weight decay and extend training. Compare mean output log-normaliser
   with and without z-loss while holding QK norms fixed.
3. Repeat at width 256 and compare the best rate. Hyperparameter transfer should
   be tested across model widths, rather than inferred from one successful run.
