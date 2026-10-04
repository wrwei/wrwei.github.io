## 实验 1 — 小型数据流程：过滤与 MinHash-LSH {#lab1}

**目标。** 向小语料加入已知垃圾文本与副本，审计启发式过滤器，实现精确和近似重复检测，并将实测候选率与 LSH 公式比较。每次删除都记录明确原因。这是在儿童故事上的实验，不是可直接用于技术文档的质量策略。

从 [小故事](https://huggingface.co/datasets/roneneldan/TinyStories) 下载一个 10 MB parquet 文件；该合成英文故事数据集按 CDLA-Sharing-1.0 发布。代码把公开验证文件作为原始语料，并未将数据集原来的训练与测试划分用于本实验模型评估。修订版本固定，语料文件不加入教程仓库。若尚未安装，按本系列实验依赖安装 `pandas`、`pyarrow`。

### 构建带有审计跟踪的语料库

受控实验中，前 5,000 篇故事标记为 `clean`，只表示“原始输入”，不代表人工质量审核通过。加入四类垃圾文本、精确副本及六组轻微修改的副本。近重复生成器以概率 $q$ 独立替换各词，可能没有任何修改，尤其在 $q=0.01$ 时。因此标签记录来源，而不保证相似度。

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

### 记录首个失败的启发式规则

这些规则近似 [Gopher 过滤启发式](https://arxiv.org/abs/2112.11446) 的一个子集，定义明确：词按空白分隔；重复行比例统计首次之后的出现次数；高频二元组比例以其字符贡献除以文本长度。与生产实现比较时，这些简化不能忽略。

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

修复探测不修改语料，因为下一阶段要比较副本与生成它们的原文。生产修复应在生成指纹前执行，记录修改，并处理混合编码，不能把这种单次转换用于所有文档。转换成功本身也不证明恢复了原文。

### 精确指纹与 shingle 集合

哈希前规范化大小写与空白。这里 SHA-1 是索引，不是安全保证；键还包含规范化字符串，以防意外摘要碰撞。按此规范化定义的精确重复，可能包括生成后未实际修改的近重复副本。近重复采用连续五词的集合，避免重复出现增加 shingle 权重。

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

上面的“真实 Jaccard”比较实际的 shingle 集合。下方 MinHash 为速度使用 CRC32 ID；相对真实集合，ID 碰撞和近似哈希族都是额外误差来源。

### MinHash 签名与分带候选

一次抽取 128 个哈希函数，供全部文档共用。乘法使用 uint64：32 位输入乘以小于 $2^{31}-1$ 的系数可放入 uint64，却可能溢出 uint32。空 shingle 集合获得哨兵签名，不放进候选桶，因为空集合没有有用相似性证据。

理想独立 MinHash 的签名一致比例估计 Jaccard；16 个带、每带 8 行时，文档对以 $1-(1-s^8)^{16}$ 的概率成为候选。这里的简单通用哈希族只是理想情况的近似，应比较实测与曲线，而非把公式当作精确保证。

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

打印的理论列对每个文档对的实际相似度代入公式再取平均，不用宽分箱的中点替代。各对共用哈希族，也可能共用源故事，因此分箱计数不是独立 Bernoulli 试验。散布用于诊断，不是已验证覆盖率的不确定性区间。

### 验证候选、聚类并记录删除

LSH 只提出候选。并入簇之前，用实际 shingle 重叠验证。并查集每簇保留最小文档索引。即使 A 与 C 低于阈值，传递闭包仍可经 B 连接两者；这是聚类策略，不要求簇内每对都过阈值。

最终流程先删质量不合格文档，再在剩余文档中删精确副本，最后处理已验证近重复簇。此时须重新确定精确重复的保留文档，因为此前首次出现的文档可能已未通过质量过滤。

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

构造标签精度将删除结果与超过所选相似度阈值的插入副本比较。它不是人工标注重复精度：原始故事或垃圾页面也可能与另一输入重复。应检查这些表观误报，不能把每处差异都归为算法错误。

### 预期观察

不同垃圾类别触发不同规则，部分原始故事也被删，说明启发式规则需要误删审计。编码问题可通过普通词汇过滤。精确副本数可能多于插入数，因为某些近重复抽样未做有效修改。

真实 shingle 相似度升高时，候选率快速上升。修改一个词最多改变五个 shingle，因此不高的改词比例也会显著降低 Jaccard，避开较严格的八行分带方案。候选生成节省两两比较，但会漏掉文档对。验证可防止低重叠哈希碰撞被接受为重复，却无法找回 LSH 从未提出的文档对。

### 进一步尝试

1. 保持 128 项签名，分别改用 32 带 × 4 行及 8 带 × 16 行，比较候选数和召回率，绘制三条理论曲线。
2. 留出五十篇源故事作为模拟基准，插入十篇编辑版本，比较五词 MinHash 与十三词重叠检测。将语料用于验证前，应按重复家族整体划分。
3. 把质量规则用于有编号目标和简短记录的结构化技术论证。将网络正文阈值迁移到工程领域之前，先检查被拒绝的样本。

## 实验 2 — 在 TinyStories 上预训练一个小型 GPT {#lab2}

**目标。** 训练分词器和解码器，打包文档，监测训练与验证，对小型填空测试评分，证明检查点可同时恢复权重、优化器和随机采样器。保存分词器、模型配置及实测运行记录。

本实验复用实验 1 的固定版本 10 MB TinyStories 下载，但自行划分及训练分词器。各实验可在全新进程独立运行。合成儿童故事只用于小规模训练，不证明技术推理能力。先用 `QUICK = True` 运行 150 步，改为 `False` 则运行 600 步；两者架构相同。也可用免费 Colab GPU，代码仅在 CUDA 设备支持时使用 bf16 autocast。

### 固定划分、分词器与打包数据流

拟合 BPE 前，先留出 1,000 篇故事。以全部 256 字节为基础，保留文本结束特殊 token，用其余 20,990 篇训练大小 4,096 的词表。训练、评分、生成保持映射不变。公开验证 parquet 是本实验原始语料；这里的划分独立于 TinyStories 原来的训练与验证划分。

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

打包在每篇故事后添加 EOS，再连接全部故事。窗口可以跨 EOS 边界；本实验允许注意前文档，不采用块对角文档掩码。每个位置仍使用因果目标。若将整篇故事填充到 512 的倍数，浪费比例见下方输出；该估计假设长于 512 的故事按块切分。

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

CPU 上用模型 FLOP/s 除以这个实测基线，得到利用率代理值。它不是生产 MFU，后者分母为训练精度对应的硬件公布峰值。矩阵大小、kernel 选择及其他运行程序都会影响基线，故应与吞吐量一同报告，而非当作机器规格。

### 声明解码器和优化器

这是模块 06 的因果解码器，为独立运行再次定义：RMSNorm、RoPE、SwiGLU、无偏置、共享输入输出嵌入。残差投影采用更小初始标准差。可选 QK 归一化在本实验关闭，由实验 3 测试。没有 dropout，便于解释恢复实验。

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

### 对二十四道明确的填空题评分

下方每对候选中的第一个是预期答案。按条件对数概率之和为完整续写评分，包括前导空格；不要采样，也不要仅比较首个 token。断言追加选项不改变上下文 token。这是针对故事词汇及简单上下文使用的手写诊断，并非独立基准。多数答案仅凭最后几个词就能判断。

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

### 训练、评估和检查点

用专用 CPU 生成器抽取随机窗口。窗口可能重叠；验证来自留出故事，因此低训练损失本身不是测试结果。记录裁剪前范数及实际学习率。固定验证 batch 和填空评分不改变训练采样器状态。

检查点记录下一步编号、权重、Adam 矩、采样器及全局随机状态。只存模型足以推理，却不能复现下一次训练更新。

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

### 验证恢复并保存可交付成果

只加载本地创建的这个检查点。恢复可信 Python 对象需要 `weights_only=False`；绝不能对不可信文件采用此选项。新优化器对照从相同权重开始，抽取相同窗口，却不恢复 Adam 累积矩。首个损失在首次更新前测量，因此相同；后续损失反映不同轨迹。

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

文件保存在实验运行目录，实验运行器使用 `labs/module_08/run_lab2/`。后续实验自行训练分词器及基座模型，不依赖这些文件。若复用检查点，应与运行记录一起保留固定语料版本及划分。

### 预期观察

当前 CPU 环境中，QUICK 留出损失从 8.3274 降到 3.9858，填空正确 15/24，其中局部题 12/18、早期上下文题 3/6。独立的 600 步 FULL 运行达到 2.8327，困惑度 16.99，正确 21/24，分别为 18/18、3/6。FULL 还每 25 步记录验证，供更细诊断；额外评估增加耗时，但不改变专用训练采样器。恢复后的三个损失仍精确匹配。记录区分 QUICK 和 FULL；样本与耗时依赖机器。

损失起初接近均匀分布基线，随后学习常见故事模式而下降。填空测试区分局部补全及依赖早期上下文的题目，但每题约改变 4.2 个百分点。少数题改善并非精确的通用能力估计。生成样本可能像故事，却仍有语法或事实错误。

完整检查点复现后三个损失，重新初始化 Adam 矩则改变第二、第三个。验证采用留出故事上的固定窗口。窗口彼此相关，文档划分也未保证重复家族整体划分；在把损失差异解释为精确泛化估计前，应审计这一问题。

### 进一步尝试

1. 用实验 3 的 1.33M 参数结构，在相同估计 FLOP 下训练更多 token，比较留出损失。估算时计入注意力。
2. 用稳定阶段及末尾线性衰减替代余弦衰减。在衰减前和训练末尾记录验证，不要把全部改善都归因于更多 token。
3. 在 GPU 上逐步扩大宽度和 batch，测量内存、吞吐量，并用对应精度的设备公布峰值计算 MFU。

## 实验 3 — 引发不稳定，然后诊断其机制 {#lab3}

**目标。** 提高小解码器的学习率，测量注意力 logits 和损失变化，按受控顺序测试预热、梯度裁剪、z-loss 和 QK 归一化，再比较三个学习率的敏感性。修复应针对观察到的故障机制。

若未缓存，本实验下载同一固定版本 10 MB TinyStories，训练自己的分词器并完整定义解码器。九次短训练都从相同种子开始、读取相同窗口。笔记本 CPU 预计需几分钟，也可使用 CUDA 或免费 Colab。

### 重复数据和模型设置

模型小于实验 2：宽度 128、四层、四头、SwiGLU 宽度 352、上下文 128、嵌入共享。QK 归一化在 RoPE **之前**对查询和键应用可学习 RMSNorm。诊断开关测量最后一个训练 batch 中可见因果注意力 logit 的最大绝对值，不改变 SDPA 输出及梯度。

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

为缩小实验，使用固定训练划分中的前 8,000 篇故事；分词器仍在完整训练划分上拟合。注意力探测测量最后一个 batch，而非整个训练过程的最大值。

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

### 逐项添加稳定措施

保持高学习率不变，每次加一项干预。最后的比较，只在已有其他三项措施的运行中加入 QK 归一化。交叉熵与 z-loss 分别记录，防止目标改变造成比较中的表观改善。

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

### 测量学习率敏感性

复用两个已测的无干预运行和高学习率稳定运行，再增加三次训练完成扫描。这些是相同步数后的训练损失，不是九个选定检查点的留出评估。用于诊断优化后，仍需独立验证所选方案。

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

### 预期观察

同时比较损失和注意力 logit 增长。较大注意力 logits 会使 softmax 行过度集中、优化变差，即使所有记录的损失仍有限。裁剪约束梯度范数，不约束注意力 logits；z-loss 约束输出归一化常数，不约束查询与键的范数；预热改变初期更新大小，却不直接限制最终增长。

QK 归一化直接控制查询和键的尺度，但可学习增益意味着上界并非单位 RMS 向量的固定 $\sqrt{d_h}$。应从实测表格判断其收益，不能预设对任意架构和学习率都有效。干预可扩大可用范围，而更低学习率仍可能更好。换种子重复实验，检验各差距是否稳定。

### 进一步尝试

1. 记录训练中各头注意力熵，比较熵下降与损失、logit 增长。只看最后一步最大值，会漏掉塌缩发生时间。
2. 去掉权重衰减并延长训练。固定 QK 归一化，比较有无 z-loss 时的平均输出对数归一化常数。
3. 在宽度 256 重复，比较最优学习率。超参数迁移应跨宽度测试，不能从单次成功训练推断。
