## 练习 {#exercises}

采用题目给定的奖励、掩码和十进制 GB 约定。每项计算都要写明假设；只给出方法名称并不能构成解释。

::: exercise id=e1 level=1 kind=conceptual minutes=5

对以下每种行为，指出你首先会采用的后训练阶段，并用一句话解释原因：(a) 每个回复都必须是符合固定模式的有效 JSON；(b) 两个答案都正确时，用户偏好较短且直接的那个；(c) 生成的故障树必须在训练中未见过的系统上通过十二项结构规则；(d) 请求的数据不在上下文中时，模型必须说“我不知道”。
:::

::: solution

(a) 用符合模式的示范做 SFT：格式是 SFT 最可靠的教学内容之一，服务时可用约束解码兜底。(b) 偏好优化，例如使用在策略偏好对的 DPO：这种比较判断难以通过单个示范表达。(c) 使用可验证奖励的强化学习，先采样、验证并保留，再做 GRPO：已有检查器，而且行为必须泛化到示范之外。(d) 提供弃权的 SFT 示例，并让奖励对弃权的评分高于错误答案（+1 / 0 / -lambda），在不可回答提示词测试集上测量效果。
:::

::: exercise id=e2 level=1 kind=conceptual minutes=5

一段对话渲染为：系统提示词；用户轮次；助手回复；用户轮次；助手回复。每个轮次均以轮次结束 token 结尾。(a) 哪些片段计算损失，哪些被掩码？为什么必须训练每个助手回复后的轮次结束 token？(b) 批次混合长短回复时，比较 token 均值与序列均值归一化：各自赋予哪些回复更大权重？哪种是每个受训练 token 的负对数似然？(c) 梯度累积时，你对各微批次的平均损失再取平均。这实际上采用了什么归一化？如何恢复 token 均值？
:::

::: solution

(a) 两个助手回复及其各自的轮次结束 token 计算损失；系统提示词、用户轮次和助手头部被掩码，标签为 -100，因为训练目标是预测响应，而不是用户或模板。上下文仍可通过响应损失获得梯度。轮次结束 token 对应停止决策；若将它掩码，这个目标就不会教模型结束轮次。(b) token 均值给每个受训练 token 相同权重，因此长回复对梯度贡献更大；它是受训练 token 的逐 token 负对数似然。序列均值给每段对话相同权重，因此短回复的每个 token 比长回复的每个 token 权重更大。两者都不必然错误，但切换会改变学习目标。(c) 微批次均值的平均给每个微批次相同权重，不论其中有多少受训练 token；每个微批次只有一段对话时，这就是序列均值。对所有微批次的逐 token 损失求和，再统一除以受训练 token 总数，参见第 3 节的归一化陷阱。
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5

LoRA 计算 h = W x + (alpha / r) B A x，初始化时 A 为随机值，B = 0。(a) 证明适配后模型在第 0 步等于基座模型。(b) 用 g = dL/dh 写出第 0 步的 dL/dB 和 dL/dA，指出哪个可为非零。(c) 若 A、B 都从零开始，会发生什么？若两者都随机初始化呢？
:::

::: solution

(a) B A = 0，因此 h = W x。(b) dL/dB = (alpha / r) g (A x)^T，一般非零；dL/dA = (alpha / r) B^T g x^T = 0。B 在第一步改变；B 非零后 A 才开始改变。(c) 两者为零时，在给定的确定性梯度更新下，两者梯度将一直为零，适配器无法训练。两者随机时，模型一开始就相对基座模型有随机扰动 (alpha / r) B A，无法精确复现基座函数；这可能在训练前扰乱行为。
:::

::: exercise id=e4 level=2 kind=calculation minutes=10

对案例模型（9,550,729,216 个参数：36 层，d = 4,096，32 个查询头和 8 个 KV 头，头维度 128，SwiGLU 宽度 15,360，词表 152,064，嵌入不绑定），计算：(a) 每层全部七个线性投影采用 r = 16 时的 LoRA 参数量；(b) 每参数 16 字节时，适配器的训练状态；(c) bf16 基座上的 LoRA 权重加适配器状态，以及块内线性权重采用每参数 4.127 位 NF4、嵌入和输出头保持 bf16 的 QLoRA 对应总量；(d) 加上模块 08 中 8,192 token 序列的 3.61 GB 检查点激活值后，各自能否放入 24 GB GPU。
:::

::: solution

(a) 每层 r x [(4,096 + 4,096) + 2 x (4,096 + 1,024) + (4,096 + 4,096) + 3 x (4,096 + 15,360)] = 16 x 84,992 = 1,359,872；再乘 36 得 48,955,392，占模型 0.51%。(b) 48,955,392 x 16 B = 0.78 GB。(c) LoRA：9.551e9 x 2 B = 19.10 GB + 0.78 = 19.88 GB。QLoRA：块内线性权重 8.305e9 x 4.127 / 8 = 4.28 GB，嵌入和输出头 1.246e9 x 2 B = 2.49 GB，基座 6.78 GB + 0.78 = 7.56 GB。(d) LoRA 在运行时缓冲区和实体化词表 logit 张量之前就需要约 23.5 十进制 GB；QLoRA 约需 11.2 GB。应与设备实际可用字节容量比较。“24 GB”的市场名称并不普遍等于 24 GiB。在 240 亿字节预算下，即使分块计算损失，LoRA 也接近上限；QLoRA 的余量更大，但内核、临时反量化和分配器开销仍需实测。
:::

::: exercise id=e5 level=2 kind=derivation minutes=10

(a) 假设每个响应的感知质量为 u = r + epsilon，其中 epsilon 为独立的标准 Gumbel 噪声，CDF 为 exp(-e^{-x})。证明 P(u_w > u_l) = sigma(r_w - r_l)。(b) 证明为一个提示词的所有奖励加上 c(x) 不会改变 Bradley–Terry 似然，并说明这对在 RL 中使用奖励模型意味着什么。(c) Elo 使用 P = 1 / (1 + 10^{-Delta R / 400})。400 分差对应多少纳特的奖励差？获胜概率是多少？
:::

::: solution

(a) 令 Delta = r_w - r_l，则 P(u_w > u_l) = P(eps_l < eps_w + Delta)。条件于 eps_w = t 时，P(eps_l < t + Delta) = F(t + Delta) = exp(-e^{-t} e^{-Delta})。因此 P 是 e^{-t} exp(-e^{-t}) exp(-e^{-t} e^{-Delta}) 对 t 的积分；代入 s = e^{-t}，得到 integral_0^inf exp(-s (1 + e^{-Delta})) ds = 1 / (1 + e^{-Delta}) = sigma(Delta)。等价地，两个独立标准 Gumbel 变量之差服从标准逻辑分布。(b) sigma((r_w + c) - (r_l + c)) = sigma(r_w - r_l)：奖励只能识别到每提示词一个常数，因此 RL 前可通过减去基线进行归一化；优势本身也会消除常数。(c) 10^{-Delta R / 400} = e^{-Delta r} 给出 Delta r = 400 ln 10 / 400 = 2.303 纳特；P = 1 / (1 + 10^{-1}) = 0.909。
:::

::: exercise id=e6 level=2 kind=derivation minutes=15

(a) 对一个提示词和有限响应集，用拉格朗日乘子，在 sum_y pi(y) = 1 约束下最大化 J(pi) = sum_y pi(y) r(y) - beta sum_y pi(y) log(pi(y) / pi_ref(y))，证明 pi* 正比于 pi_ref exp(r / beta)。(b) 证明 J(pi*) = beta log Z，其中 Z = sum_y pi_ref(y) exp(r(y) / beta)。(c) 通过 pi* 表达 r，并证明同一偏好对的 Bradley–Terry 概率中 log Z 抵消，从而得到 DPO 损失。用 pi_ref = (0.5, 0.3, 0.2)、r = (0, 1, 2)、beta = 2 检查 (b)；第 7 节已计算 beta = 1 和 0.5。
:::

::: solution

(a) 对 pi(y) 求导：r(y) - beta (log(pi(y) / pi_ref(y)) + 1) - lambda = 0，因此 log pi(y) = log pi_ref(y) + r(y) / beta - 1 - lambda / beta，pi 正比于 pi_ref e^{r / beta}；归一化使常数等于 1/Z。J 严格凹，来自 -beta pi log pi 项，因此这是全局最大值。(b) 代入 log(pi* / pi_ref) = r / beta - log Z：J = sum pi* r - beta sum pi* (r / beta - log Z) = beta log Z。(c) r = beta log(pi* / pi_ref) + beta log Z；对于同一提示词的两个响应，r_w - r_l = beta log(pi*(y_w) / pi_ref(y_w)) - beta log(pi*(y_l) / pi_ref(y_l))；以 pi_theta 替换 pi*，最大化 Bradley–Terry 对数似然，即得到 L_DPO。beta = 2 时，未归一化权重为 0.5、0.3 e^0.5、0.2 e，即 0.500、0.495、0.544；Z = 1.538；pi* = (0.325, 0.322, 0.353)；E[r] = 1.028；KL(pi* || pi_ref) = 0.084；J = 1.028 - 2 x 0.084 = 0.861 = 2 ln 1.538。较大的 beta 使 pi* 更接近 pi_ref。
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5

无需数值计算：(a) DPO 偏好对的损失可以持续下降，同时策略对选中响应的对数概率却低于参考策略。用间隔的定义说明原因。(b) 选中响应的概率去了哪里？为什么离策略拒绝响应使这种情况更容易发生？(c) 一个偏好对的梯度权重为 sigma(-u)，其中 u 是间隔。u 增大时，它的贡献如何变化？为什么防止确定性偏好上的过度训练应依靠留出指标，而不是训练损失？
:::

::: solution

(a) u = beta [log(pi_theta(y_w|x) / pi_ref(y_w|x)) - log(pi_theta(y_l|x) / pi_ref(y_l|x))]，只要 u 增大，损失 -log sigma(u) 就下降。如果拒绝响应的对数比下降得比选中响应更快，即使选中响应的对数比为负，u 仍会增大，参见第 7 节的位移案例。(b) 概率流向两列以外的响应：损失只约束两个对数比的差，没有直接维持选中响应概率。拒绝响应若是模型几乎不会生成的字符串，压低它们很容易，却难以说明模型实际会输出什么，参见似然位移和实验 4 的离策略运行。(c) u 增大时 sigma(-u) -> 0，因此已被高置信度正确排序的偏好对逐渐停止贡献梯度。在可分偏好对上，训练损失趋近零，策略仍可能继续偏移；确定性偏好的最优解会使 pi(y_l) 趋近零，与 beta 大小无关，这是 IPO 的论点。损失无法决定何时停止；留出任务指标、选中响应对数比和 KL 才能帮助决定早停。
:::

::: exercise id=e8 level=2 kind=calculation minutes=10

对 9.55B 案例模型，训练参数每个 16 字节，冻结 bf16 参数每个 2 字节，统计每提示词或偏好对、每次更新的序列前向、反向和生成序列数：(a) 带价值模型且只进行一个 PPO 轮次的 PPO；(b) DPO；(c) G = 8、一次内部更新的 GRPO。再计算 DPO 和 GRPO 在全量微调和 LoRA 下的权重与优化器峰值内存；LoRA 使用 r = 64、3.13 GB 适配器状态，参考策略为关闭适配器后的基座模型。GRPO 还需加入八个样本、每个 6,000 token、每 token 147,456 字节的 KV 缓存。与第 6 节的 PPO 结果比较：全量微调 332.6 GB，LoRA 43.2 GB。
:::

::: solution

(a) PPO：生成一个序列；参考、奖励和价值模型共 3 次前向，如果未从生成阶段保留旧策略对数概率，则需 4 次；训练时策略与价值各一次前向和反向，合计 5–6 F、2 B。(b) DPO：不生成；选中与拒绝响应在策略模型上共 2 F、2 B；参考模型 2 F，可一次计算后缓存。(c) GRPO：生成 8 个序列；参考模型 8 F；旧策略对数概率需 8 F，或无需额外前向，因为一次内部更新时 rho = 1；策略模型 8 F、8 B；没有奖励模型或价值模型前向，验证器是代码。全量微调内存：DPO 为 152.8（策略状态）+ 19.1（参考）= 171.9 GB，若预计算参考对数概率则为 152.8 GB；GRPO 为 171.9 GB + 8 x 6,000 x 147,456 B，即 7.1 GB 缓存，总计 179.0 GB。LoRA：DPO 为 19.10 + 3.13 = 22.2 GB；GRPO 为 22.2 + 7.1 = 29.3 GB。两种设置中，PPO 都约需 DPO 两倍内存：全量微调多一个受训练模型，LoRA 多一个独立奖励模型。GRPO 的额外部分是正在生成的组的缓存。所有这些结果还需另加激活值。
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5

(a) 覆盖率 1 - (1 - p)^n 假设所有提示词通过率都为 p。实际提示词集合的通过率围绕同一均值分散，为什么平均覆盖率低于将均值代入公式的结果？哪些提示词在可负担的 n 下仍无法覆盖？(b) 进行三轮保留全部接受样本的专家迭代，训练集中的提示词构成如何变化？什么简单规则可防止这一偏移？(c) best-of-n 策略相对基座的 KL 大致按 log n 增长。这对给定采样量下单靠选择能移动策略多远，以及针对学得奖励模型的 best-of-n 随 n 增大而退化，分别意味着什么？
:::

::: solution

(a) 1 - (1 - p)^n 关于 p 为凹函数，因此由 Jensen 不等式，各提示词的平均覆盖率至多等于平均通过率对应的覆盖率；p 接近零的提示词在任何可负担的 n 下仍可能未覆盖。(b) 简单提示词最多产生 n 个接受样本，困难提示词很少或没有，数据集因此偏向简单提示词，模型强化已有能力。限制每提示词保留样本数为一个或 k 个，参见第 8 节的产出示例。(c) n 每翻倍一次，界增加不到 ln 2 = 0.69 纳特，因此让策略距离基座数个纳特，需要每提示词指数增长的样本数；这也是 RL 选择改变权重的原因。但选择仍能利用学得奖励的漏洞。实验 3 中被选样本的真实奖励逐步下降；KL 界并不排除其他代理指标或响应分布出现突发的质量失败。
:::

::: exercise id=e10 level=2 kind=calculation minutes=10

(a) G = 8 的 GRPO 组获得部分得分奖励 (0.6, 0.6, 0.2, 1.0, 0.0, 0.4, 0.6, 0.2)。按源代码采用无偏标准差计算优势，并验证其和为零。(b) 二元奖励、G = 8、通过率 0.8 时，有多少比例的组包含任务优势信号？(c) 通过率 0.95 的提示词，要让至少一半的组包含信号，G 至少多大？相对 G = 8，每提示词样本成本增加多少？
:::

::: solution

(a) 均值 0.45；偏差为 (0.15, 0.15, -0.25, 0.55, -0.45, -0.05, 0.15, -0.25)，平方和 0.70；无偏方差 0.70 / 7 = 0.10，标准差 0.316；优势为 (0.474, 0.474, -0.791, 1.739, -1.423, -0.158, 0.474, -0.791)，总和为零。最佳答案获得最大推动，空答案获得最大惩罚；0.4 略低于均值，因此略受压低。(b) 1 - 0.8^8 - 0.2^8 = 1 - 0.168 - 0.000003 = 0.832。(c) 要求 0.95^G + 0.05^G <= 0.5；第二项可忽略，因此 G >= ln 0.5 / ln 0.95 = 13.5，即 G = 14，此时比例为 0.512，G = 13 时为 0.487。这意味着每提示词 14 个样本，而非 8 个，生成量增加 75%；G = 8 时，这些提示词只有约 34% 的组含有信号，参见第 9 节。丢弃这些提示词，或对无信号组重新采样，即动态采样，通常更便宜。任务优势为零不消除独立的 KL 梯度。丢弃组或提示词会改变训练分布，因此应报告尝试次数和最终课程构成。
:::

::: exercise id=e11 level=3 kind=coding minutes=25

模型用 JSON 编写故障树：{"top": id, "events": {id: {"type": "gate", "gate": "AND" or "OR", "children": [ids]} or {"type": "basic", "p": number, "label": text}}}。(a) 编写 reward(brief_components, reply)：无法解析时返回 0.0，否则按以下规则给予部分得分：顶事件存在且是门；每个门至少有两个子节点；每个子节点 ID 都存在；没有环；所有事件均可从顶事件到达；所有基本事件概率都在 [0, 1]；简要说明中每个组件都出现在某个基本事件标签里。(b) 构造一个无用但在第一版奖励下得分至少 0.8 的退化响应。(c) 修改奖励，使该退化响应低于同一说明对应的真实双门故障树，并测试两者。
:::

::: solution

第一版奖励对七个结构谓词取平均。重复子节点的构造可以全部通过：子节点列表有两个条目，标签又包含所有组件。然而，它仍只有一个基本事件，没有提供可信的独立故障模型。以下代码能够处理错误模式、缺失根节点、环和不可达节点而不崩溃，随后加强对子节点唯一性的要求，并为每个基本事件指定明确的组件名称。它刻意不惩罚相同概率：不同故障的概率完全可能相等。两个分数都无法验证概率或门语义是否具有工程证据。

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

一个原本校准良好的模型在偏好优化后，对留出问题集表达更高置信度，但正确率没有变化。(a) 校准发生了什么变化？偏好训练如何造成这种情况？(b) 团队希望模型不确定时弃权，采用模块 07 的评分规则：正确 +1，弃权 0，错误 -lambda。为什么这条规则的效果依赖模型校准？(c) 分别提出一个训练信号变化和一个评估变化，让“我不知道”具有实际价值。
:::

::: solution

(a) 模型变得过度自信：置信度箱中的正确率低于置信度，因此期望校准误差上升，参见模块 01 第 7 节。比较可能偏好听起来自信且完整的答案，因而偏好优化可能在正确性不变时提高所表达的置信度。GPT-4 技术报告展示了后训练后校准变差的情况；某些基座模型则在特定多项选择实验中表现出有用的校准，参见 Kadavath 等人 2022 年论文。(b) 规则要求仅当 p > lambda / (1 + lambda) 时回答，但模型使用的是自身对 p 的估计；过度自信会高估 p，在本应弃权时越过阈值并猜测。阈值的可靠性取决于输入概率。(c) 训练：在 RL 中让弃权高于错误答案，即 lambda > 0；提供不可回答提示词上的弃权 SFT 示例；或构建诚实“我不知道”优于自信错误答案的偏好对。评估：分别报告正确率、错误率和弃权率，或报告惩罚评分，而不是只报告正确率，并在每阶段前后测量校准。
:::

::: exercise id=e13 level=2 kind=calculation minutes=10

两个检查点在同一 200 项上评估。B 通过而 A 失败的有 18 项，A 通过而 B 失败的有 8 项，其余 174 项一致。(a) 计算通过率成对差值及其 95% 正态近似区间。(b) 计算 McNemar 精确双侧 p 值。(c) 你会如何报告结果，又会如何改变评估？
:::

::: solution

(a) d = (18 - 8) / 200 = 0.05；逐项方差为 26/200 - 0.05^2 = 0.1275；标准误 sqrt(0.1275 / 200) = 0.0252；区间为 0.05 +/- 0.0495 = [0.001, 0.099]。(b) 26 个不一致项，其中一类有 8 个：p = 2 x sum_{j<=8} C(26, j) / 2^26 = 0.07552。(c) 正态区间勉强排除零，精确检验却不在 5% 水平拒绝原假设。报告增加 5 个百分点，区间 [0.1, 9.9] 个百分点，McNemar p = 0.08，证据尚不足。扩大测试集；相同通过率下，800 项的标准误为 0.0126，区间为 [2.5, 7.5] 个百分点。同时固定随机种子，并检查测试项是否按模板聚集。
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5

成对评判者比较新模型与现有模型的答案，每对以两种顺序展示。(a) 有些偏好会在交换顺序后翻转，这种判定有多大价值？交换平均如何计分？(b) 新模型答案平均更长，为什么交换平均不能消除评判者的长度偏差？如何估计控制长度后的胜率？(c) 除胜率外，你会报告哪两个数值，帮助读者评估评判者？
:::

::: solution

(a) 翻转说明评判者在这一对上的偏好弱于位置偏差，实际上应视为平局。交换平均给双方各计半次胜利，从而平衡展示顺序，但未必消除位置与质量间所有非线性交互，参见第 12 节示例。(b) 新模型答案在两种顺序中都更长，因此长度偏差对两次判定的推动方向相同，顺序平均不会将其消除。可将判定对长度差做回归，读取长度差为零时的模型化胜率，同时报告不确定性并检查回归假设，参见实验 6；也可使用 Dubois 等人 2024 年的长度控制胜率。(c) 两种顺序的判定一致率，以及评判者与人工标注样本的一致率。还应说明评判模型家族，以便检查自我偏好，并报告胜率区间。
:::

::: exercise id=e15 level=1 kind=conceptual minutes=5

同一矩阵的两个秩 r 适配器 (B1, A1) 和 (B2, A2)，各自的 alpha / r 已折入 B，现需等权合并。(a) 展开平均因子的乘积 ((B1 + B2) / 2)((A1 + A2) / 2)，指出哪些项使它不同于更新的平均 (B1 A1 + B2 A2) / 2。(b) 正确合并的秩最高多少？如何以适配器形式精确存储？(c) 为什么合并进 4 位基座不精确？什么操作顺序能避免这个问题？
:::

::: solution

(a) 展开为 (B1 A1 + B1 A2 + B2 A1 + B2 A2) / 4：每个适配器自身更新的权重变为 1/4，而非 1/2，还出现了两个没有任何适配器学过的交叉项 B1 A2、B2 A1。第 13 节示例中，正确结果为 0.5 I，错误结果是元素均为 0.25 的矩阵。(b) 最高 2r，因为两个秩 r 矩阵的和最高为秩 2r。通过拼接可精确存为秩 2r 适配器：B = [B1, B2] / sqrt(2)，A = [A1; A2] / sqrt(2)，使 B A = (B1 A1 + B2 A2) / 2；也可直接加进 W。(c) 向 4 位权重加入高精度更新需要反量化、相加并重新量化，重新量化会舍入更新，细小变化可能小于量化步长而消失。先合并到 bf16 权重，再量化合并模型并重新评估，参见第 4 节和模块 10。
:::
