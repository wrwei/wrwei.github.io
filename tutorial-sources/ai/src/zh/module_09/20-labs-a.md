## 实验 1——只对助手 token 计算损失的 SFT {#lab1}

**目标。** 用五类合成工程指令微调一个公开的基座模型，分别测量损失、答案精确匹配率和轮次结束行为。token 损失降低，并不能单独证明模型知道何时停止。

首次运行需要下载约 270 MB 的权重和分词器文件，模型版本已固定。Float32 权重约占 538 MB；梯度、Adam 状态、激活值和 logits 还需要额外内存。可在笔记本 CPU 上运行，也可使用 Google Colab。设置 `QUICK = False` 可运行较长的训练。所有展示的输出均由实验运行器从实际执行结果中插入；耗时和末尾数值可能变化。

### 加载固定版本的基座模型

使用四个 CPU 线程，既便于复现，也避免占用全部核心。

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


### 生成互不重叠的训练与评估提示词

每类任务都有确定的正确答案。留出集中排除了重复提示词；这是一个小规模的分布内测试，不能说明模型处理任意工程请求的能力。

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


### 渲染对话并构建移位后的目标

分词断言用于发现单独编码提示词与编码完整训练序列时，BPE 边界是否发生变化。训练批次采用右侧填充。填充、系统、用户和助手头部 token 的标签均为 `-100`，但轮次结束 token 参与训练。

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


### 测量未经修改的基座模型

生成批次采用左侧填充，使每一行的最后一列都是真实的提示词 token。解码前，先检查生成的 token ID 中是否包含轮次结束标记。留出损失按损失总和除以目标 token 总数计算。

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


### 不使用对话模板，探测已有能力

包含三个示例的纯文本补全提供了另一种基座模型测试方式。它不能确定能力上限：改变提示词也可能改变结果。

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


### 检查并初始化预留的对话 token 行

预留了 token ID，并不意味着其嵌入已经接受过训练。行向量的余弦相似度和最近邻可帮助诊断该检查点。用固定随机种子的对角高斯分布，按现有嵌入的尺度初始化，可以让这两行变得不同。这会在微调前改变初始检查点，必须明确记录。

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


### 用带掩码的似然目标训练

只优化助手目标，包括轮次结束 token。梯度裁剪和短暂的学习率预热用于控制最初几次更新。这一小规模训练日程服务于实验，不能直接作为 9.5B 案例的训练方案。

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


### 评估行为并保存证据

精确匹配既惩罚错误答案，也惩罚多余文字。保留各任务类别的结果和示例输出，避免复制任务的进步掩盖比较任务的失败。

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


### 观察要点

将格式和停止行为与各类任务的正确率一起比较。训练集刻意集中于短答案，并不教授开放式论证。留出样本来自这五个生成器产生的新提示词；它们的精确匹配率不能用来估计一般工程能力。

独立执行扩展实验得到以下结果。FULL 的精确匹配率为 90%，停止率为 100%；更长的训练日程和更大的训练集也使排除训练提示词后的留出样本略有变化。在相同的 15 步 QUICK 预算下，跳过对话 token 行初始化时，精确匹配率和停止率都为 2%。取消响应掩码时，精确匹配率为 48%，停止率为 100%；默认设置分别为 66% 和 100%。这些比较中的留出损失始终只计算助手目标。它们是单个随机种子的对照实验，不是不确定性估计，也不是普遍适用的效果大小。比较前应从全新检查点重新运行。

### 动手尝试

- 设置 `MASK = False`，从全新检查点重新运行。比较任务得分，并允许生成继续越过轮次结束标记，观察模型是否模仿用户轮次。
- 设置 `INITIALISE_CHAT_ROWS = False`，记录训练 15 步和 20 步后的停止率；不要根据一个示例推断稳定的停止策略。
- 运行 `QUICK = False`，比较长短训练中各类任务的得分。
- 添加字母计数任务，并保持评估提示词与训练集分离。同时记录正确率和格式；新的模板并不能保证模型获得新技能。
- 用分块对角的因果掩码打包对话，并为每段对话重置位置 ID。与不填充的独立对话比较实际处理的 token 槽位和损失。

## 实验 2——从零实现 LoRA、训练并精确合并 {#lab2}

**目标。** 为每个块中的投影添加低秩更新，验证初始函数保持不变，训练低秩因子，再将它们合并到冻结权重中。本实验重复给出数据和辅助函数，因此可以在新进程中独立运行，并复用实验 1 已下载的固定版本 270 MB 基座模型。

相等性测试比较的是适配器模型与**完成对话 token 行初始化之后**的基座模型。重新初始化 token 行会改变原始检查点；零适配器无法撤销这个变化。最终比较使用同一提示词和 float32 运算。改变矩阵运算顺序后，数学上的相等不意味着逐位相等。

### 加载并冻结基座模型

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


### 重复定义合成数据和掩码代码

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


### 在测试适配器之前初始化对话 token 行

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


### 实现、包装并统计低秩因子

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


### 定义评估并训练适配器

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


### 合并并比较完整模型

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


### 观察要点

区分可训练参数量、优化器矩状态和总训练内存。打印的 Adam 数量只包含两个 float32 矩状态；float32 适配器权重和梯度另占内存。除最大 logit 差异外，还要比较合并前后的完整响应。大部分前向运算和激活梯度计算仍需经过冻结的模型。

### 动手尝试

- 跳过 token 行初始化。当绑定的嵌入和输出头被冻结时，适配器学习独特停止 token 的途径更少。直接测量停止率。
- 只包装查询、键、值和输出投影。重新计数，并在相同训练预算下比较得分。
- 比较秩 2、8 和 32：先使用 `alpha = 2r`，再固定 `alpha = 16`。保持数据和随机种子一致。
- 只为两个对话 token 行保留可训练增量，并同时应用于嵌入查找和绑定的输出投影。与训练前修改这些行的做法比较。

## 实验 3——学习比较奖励，并观察过度优化 {#lab3}

**目标。** 在真实效用已知的情况下，从带噪声的比较中学习标量奖励。将学得的模型与贝叶斯决策规则比较，检查校准情况，再用 best-of-n 搜索揭示奖励模型的误差。全部数据均为合成数据，无需下载数据集或大语言模型检查点。

真实奖励为 $r^*(\mathbf{x}) = 2x_1+x_2-\tfrac12\|\mathbf{x}\|^2$。标签以概率 $\sigma(r^*(\mathbf{x}_1)-r^*(\mathbf{x}_2))$ 采样。因此，即便最优奖励也会偶尔与实际抽到的测试标签不一致。其观测正确率是随机估计，并非任何有限样本竞争者都无法超过的硬性上限。代码也会打印期望的贝叶斯正确率。

### 根据已知奖励生成比较

在拟合之前，独立生成训练和测试样本对。通过配方法验证最大效用为 2.5，位于 (2, 1)。

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


### 拟合非线性奖励和设定有误的线性奖励

线性奖励无法表示负二次项，但它在典型点上给出的高置信度比较仍可能显得可信。标量奖励的常数偏移会在成对损失中抵消，因此应检查差值和排序，而非平均分数。

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


### 检查比较概率的校准

校准回答的是：预测胜率为 80% 的比较，是否真的约有 80% 获胜。ECE 依赖分箱方式和当前样本；数值较低并不能证明训练分布之外也具有良好校准。

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


### 用 best-of-n 选择优化学得的奖励

每次试验都从同一高斯参考分布独立采样所有候选。在这里，排序连续且没有并列，因此分布偏移界是精确值；存在并列时，它通常只是上界。表格中每项结果取 200 次试验的平均，曲线展示一个固定随机种子的实验。选择过程可能到达拟合模型从未学会正确排序的稀有点。

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


### 观察要点

随着搜索规模增加，比较代理奖励与**真实**奖励。即使奖励模型权重被冻结，增加搜索仍在对它施加优化压力。理想奖励的选择结果无法超过 2.5；线性模型则可能偏好超出真实效用峰值的点，因为它不惩罚较大的特征范数。在参考分布附近取得良好的测试正确率，与极端选择表现较差并不矛盾。

### 动手尝试

- 将训练样本对减少到 200，在多个随机种子下比较校准情况和过度优化峰值的位置。
- 添加系统性标注偏差，例如 $0.5x_2$。追踪奖励模型实际学到的偏好，不要把所有分歧都称为随机噪声。
- 用候选奖励上的 softmax 取代 argmax。在多个温度下比较真实效用，但不要声称某个温度能够修复错误的模型。
