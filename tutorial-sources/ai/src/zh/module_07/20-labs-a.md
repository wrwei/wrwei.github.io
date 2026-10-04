## 实验 1 — 困惑度：损失能告诉我们什么 {#lab1}

**目标。** 用一个已发布的语言模型为七段短文本评分，把相同的信息编码成本表示为奈特、比特、困惑度和每字节比特数。检查单个 token 的损失以及重复段落的表现。这里测量的是一个模型在这些文本上的结果，并不评估其一般工程能力。

首次运行会从 [SmolLM2-135M 存储库](https://huggingface.co/HuggingFaceTB/SmolLM2-135M) 下载约 269 MB 的权重及分词器文件。检查点固定到指定修订版本，避免远端仓库更新悄悄改变实验。float32 权重约占 538 MB 内存，激活和 logits 还需要额外空间。后续运行使用本地缓存。

### 加载模型并定义文本

在 CPU 上使用 float32。Bfloat16 能减少权重存储，但如果处理器缺少相应矩阵指令，运行可能更慢。评估模式关闭训练行为；`inference_mode` 还会避免构建梯度计算图。

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

### 使预测与目标保持一致

对文本 token ID $x_1,\ldots,x_T$，在开头添加一个起始 token，然后为每个文本 token 计算 $-\ln p(x_t\mid\mathrm{BOS},x_{<t})$。输入位置 0 的 logits 预测第一个文本 token。如果直接把同一位置的 logits 和目标配对而不做移位，就会为错误的事件评分。

这里的 BOS 是 token 0，即 `<|endoftext|>`，用作文档边界。它提供上下文，但不作为目标计入损失；末尾也不添加结束 token。字节数取原文本的 UTF-8 长度，包括空格和标点。比较不同分词方式的信息成本时，每字节比特数比困惑度更有用，不过 UTF-8 对不同文字本身也使用不同的字节长度。

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

《独立宣言》的句子属于公有领域文本。低损失符合模型曾频繁见过该句的可能性，但不能确定哪个训练文档包含它。打乱后的段落保留了按空白分隔的词的多重集合，却不一定保留其 token 序列：前导空格和位置都会影响 BPE。

### 检查第二次出现的段落和单个 token 的惊异度

利用快速分词器的字符偏移定位第二段。把连接两段的空格归到第二份文本中：其首个 token 同时包含该空格和 `The`。断言没有 token 跨越选定边界，避免假定两份文本的 token 数总是原文的两倍。第二个 `The` 带有前导空格，因此其 token ID 与第一次出现时不同。

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

### 预期观察

模型对连贯文本的惊异程度低于打乱后的词序。中文的每 token 损失可能更低，每字节比特数却更高：较小的 token 更容易预测，但编码整段文本需要更多次预测。只看困惑度一列，就会把这个比较的结论颠倒。

第二份文本的预测明显更容易，因为前面的上下文已包含同一段落。模型从输入复制信息，没有更新参数。这展示了上下文学习的一种形式，并不表示模型永久学会了一个新事实。

随机生成器的每个 ASCII 字符具有 $\log_2 37\simeq5.21$ 比特的熵。模型通常付出更高的编码成本，因为其语言先验与这一信息源不匹配。熵给出随机抽样下**期望**编码成本的下界；单个有限样本的得分可能偶然低于该界限。低损失或流畅续写都不能证明示例中的泄压论证成立。

### 进一步尝试

1. 为字节长度相近的技术段落和新闻段落评分。保持相同的 BOS 约定，同时报告平均 token 损失和每字节比特数。
2. 对 100 个种子重复随机文本实验。将平均编码成本与源熵进行比较，而不是从一个样本得出结论。
3. 换用 SmolLM2-360M，预留更大的下载空间，重新计算表格。模型规模和训练历史同时改变，因此这不是只改变规模的受控实验。

## 实验 2 - 从头开始的字节对编码，以及三个分词器 {#lab2}

**目标。** 重现手算的合并过程，实现一个以全部 UTF-8 字节为基础字母表的字节级分词器，并比较三个实际使用的分词器如何处理英语、中文、数字和空白。语料直接嵌入下方代码。只需下载分词器文件，总计约 18 MB，无需模型权重。

### 统计并合并带权重的符号对

将每个词表示为字符序列，末尾添加结束标记 `_`。该标记为这个玩具级词分词器保留。统计相邻符号对，按词频加权；选择计数最大的符号对，并列时按 Python 元组顺序选择。再从左到右合并不重叠的出现位置。这个约定与第 2 节和 BPE 交互组件一致，因此可用实验验证手算。

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

### 按合并排名编码，而不是按最长子串

每次迭代找出当前可合并的、训练合并排名最靠前的符号对，合并其最左侧出现位置。贪心选择最长子串是另一种分词算法。这里的规则也能处理由已知基础符号组成的未见词。

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

`welding` 中打印的 `i`、`n` 和 `g` 便于解释算法，但它们超出了该词分词器的基础字母表。固定的生产级字符词表需要处理未知 token 的策略。下一个分词器则从全部 256 个字节值出发，包括训练语料中未出现的字节。

### 训练字节级 BPE

正则表达式把可选的前导 ASCII 空格与后面的词保存在一起。这是一个小型、明确的预分词器，并非 GPT-2 或 Qwen 的原始正则表达式；合并不能跨越它的边界。连续中文匹配 `\w+`，因此训练可以在连续汉字内部以及相邻汉字之间合并字节。

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

完整编码序列能精确解码。单个字节 token 可能终止于 UTF-8 字符的中间，单独显示时只能使用替换字符。这是显示问题，并不表示编码再解码会丢失信息。这里故意使用很小的中文训练样本，无法取得良好压缩；字节回退保证覆盖范围，却不保证效率。

### 比较生产分词器

固定修订版本并关闭自动添加特殊 token。否则聊天分隔符或 BOS token 会被计为段落的一部分。`len(tokenizer)` 包含额外添加的 token；模型的嵌入表还可能填充到更大的长度。

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

### 预期观察

七次词符号合并与加权手算完全一致。字节级版本能够无损编码、解码训练语料中未出现的符号。三个实际使用的分词器对同一英文段落及其中文译文的处理不同：在这些文本上，中文 token 数的差异远大于英文。这测量的是分词器，与模型的推理能力无关。

前导空格和大小写会改变 token ID 及边界。数字分组也不同：GPT-2 可以合并常见数字子串，而这里的 SmolLM2 和 Qwen 分词器把示例数字逐位拆开。在一个分词器上测得的 token 预算，不能未经重新计数就用于另一个分词器。

### 进一步尝试

1. 分别训练 50、100、300 和 1,000 次合并，绘制各语言在留出文本上的每 token 字节数。只画训练语料的压缩曲线无法考察泛化。
2. 增加训练语料中中文的占比，再次实验。记录两种语言的变化，不要预设一种语言的改善必然以另一种语言为代价。
3. 在相同数据上与 `tokenizers.ByteLevelBPETokenizer` 比较，解释预分词、词表训练和并列处理规则带来的差异。

还可以用 `tiktoken` 做第四项比较，但它不属于本系列的必需环境。实验运行器不会执行这段代码，上述结果也不依赖它。安装时还会下载约 1.7 MB 的编码文件。

```python norun
import tiktoken
encoding = tiktoken.get_encoding("cl100k_base")
for text in [EN_PARA, ZH_PARA, "The scaffold sagged 0.194 mm.",
             "支架下沉了 0.194 毫米。"]:
    print(len(encoding.encode(text)))
```

## 实验 3 — 拟合 Chinchilla 缩放定律 {#lab3}

**目标。** 生成合成训练实验，恢复参数化的缩放定律，并比较两种选择计算最优分配的方法。随后对实验结果做 bootstrap 重采样，检查优化设置是否改变表观不确定性。只需 NumPy、SciPy 和 matplotlib；无需下载文件，也不训练语言模型。

原始 [Chinchilla 论文](https://arxiv.org/abs/2203.15556) 拟合的是实际训练结果。本实验在刻意生成的合成数据上采用其对数空间 Huber 目标。已知生成定律让我们能够直接测量外推误差。这些数据点不是论文的私有训练测量，也不是对那些实验的复现。

### 第 1 步：缩放定律及其精确最优解

使用 $L=E+A N^{-\alpha}+B_c D^{-\beta}$。这里用 $B_c$ 表示拟合常数，保留 $B$ 表示 batch 大小。在 $C=6ND$ 条件下，代入 $D=C/(6N)$ 并求导，即得到 [第 4 节](#s4) 的最优解。以下常数专为本实验选取，并非从某个模型复制而来。

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

### 第 2 步：生成 45 次 IsoFLOP 运行

在每个计算预算下，把模型规模从最优值的十分之一变化到十倍。数据规模反向变化，以保持 $6ND$ 固定。向对数损失添加独立高斯噪声：标准差 0.01 约对应 1% 的乘性噪声。打印一个预算下的全部数据，方便用实际数字核对后面的曲线。

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

### 第 3 步：用显式梯度在对数空间拟合

参数化 $A=e^a$、$B_c=e^b$ 和 $E=e^e$。对数预测为 `logsumexp(a - alpha*log(N), b - beta*log(D), e)`，避免对极大的原始项直接取指数。对残差 $r$，Huber 惩罚在 $|r|\le\delta$ 范围内为 $r^2/2$，范围外为 $\delta(|r|-\delta/2)$；其导数把 $r$ 裁剪到 $[-\delta,\delta]$。

对数和中的三个 softmax 权重给出其导数。按参数顺序 $(a,b,e,\alpha,\beta)$，导数为 $(w_N,w_D,w_E,-w_N\ln N,-w_D\ln D)$。提供这个梯度可避免数值有限差分，并让我们主动设置收敛容差。在信任长时间的多起点搜索之前，先用有限差分核对梯度。

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

上述容差比优化器默认值更严格。目标值很小并不自动证明已收敛：Huber 阈值使目标和梯度的绝对数值都很小。应检查终止消息，并比较不同起点的结果。

### 第 4 步：比较资源分配与曲线顶点估计

即使损失拟合得很接近，最优模型规模仍可能偏移。外推时，指数 $\beta/(\alpha+\beta)$ 与对数计算量相乘，其影响会反复放大。还可以在每个预算下拟合关于 $\log_{10}N$ 的二次曲线，以顶点估计最优值，再拟合这些顶点与计算量的关系。这类似 IsoFLOP 方法，但在采样范围内，抛物线只是生成定律的近似。

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

### 第 5 步：bootstrap 不确定性并检查优化过程

对 45 次实验做有放回重采样，共 30 次。较大的实验设为 `RESAMPLES = 60`。使用**相同的严格容差**，先从十六个起点拟合每份重采样数据，再只从全数据拟合解出发拟合一次。单起点搜索若过早停止或得到更差的目标值，就值得怀疑；若找到相同解，则可接受。多起点搜索是一项诊断手段，并非不确定性估计可靠的数学保证。

这些区间描述的是当前噪声模型和采样设计，未包含幂律形式、语料变化及依赖硬件的训练方案所带来的不确定性。[复制讨论](https://arxiv.org/abs/2404.10102) 解释了为何根据实际缩放实验得出结论时，拟合和不确定性处理的细节非常重要。

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

### 第 6 步：已发表的常数不对应一个通用比例

比较这些拟合时，必须保持相同的计数约定。这里的简化公式 $C=6ND$ 与缩放定律的计算方式一样，计入每个参数。模块 06 的模型计算量估算更明确：不计仅用于查表的嵌入参数，同时加入注意力开销。

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

### 预期观察

损失曲线的最小值附近较平坦。用已知的生成定律检查拟合结果，并比较超出已观测计算范围后的资源分配。结合优化器诊断阅读 bootstrap 结果：搜索方法间的差异可能来自优化误差，而非额外的统计信息。上面的实际输出来自已执行的代码；耗时会随机器变化。

这里在 $10^{23}$ FLOP 下，拟合得到的分配为 $2.552\times10^{10}$ 个参数，比真实生成定律的最优值 $3.132\times10^{10}$ 低约 19%，尽管已观测实验上的最大损失误差仅为 0.71%。两种搜索方法在打印精度下给出相同的 bootstrap 区间，其上界却低于已知真值：30 次重采样得到的百分位数区间并不保证在单次实验中覆盖真值。在报告覆盖率之前，应同时重复重采样和原始噪声抽样。

### 进一步尝试

1. 将乘性噪声加倍并比较分配间隔。
2. 删除最大的计算预算，重新拟合并外推到 $10^{23}$ FLOP。
3. 恢复优化器默认容差。先比较目标值和两个 bootstrap 区间，再把更窄的区间解释为更高的确定性。
