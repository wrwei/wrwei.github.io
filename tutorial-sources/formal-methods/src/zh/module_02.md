---
title: 命题逻辑
part: 1
lead: 读写由 ¬、∧、∨、⟶ 和 ⟷ 构成的公式，用真值表判定公式是不是重言式、两个公式是否等价、论证是否有效，把公式化为范式，并用 Isabelle 检查写成公式的需求。
minutes: 210
needs: 模块 1
goals:
  - 读写含有 ¬、∧、∨、⟶ 和 ⟷ 的公式，并了解 Isabelle 按怎样的优先级和结合方向读它们
  - 计算真值表，并判断一个公式是重言式、矛盾式，还是可满足但非有效的公式
  - 用等价定律变换公式，并把公式化为否定范式、合取范式和析取范式
  - 区分有效和无效的论证形式，并为无效的论证形式给出反例
  - 把需求写成公式，检查它们是否一致，以及某条性质是否能由它们推出
  - 在 Isabelle 中用 `simp`、`blast` 和 `auto` 证明重言式，用 `quickcheck` 和 `nitpick` 寻找反例
imports: Main
---

## 命题与联结词 {#connectives}

模块 1 写排序的规约时，中间用了一个“并且”：sorted ys ∧ mset ys = mset xs。需求里满是这样的小词：**不**、**并且**、**或者**、**如果……那么**、**仅当**、**除非**。每个小词都由较小的陈述构成一个较大的陈述，而较大的陈述是否为真，只取决于那些较小的陈述是否为真。**命题逻辑**（propositional logic）就是关于这些小词的逻辑。它是本系列中最简单的逻辑，却已经很有用：SAT 求解器是判定命题逻辑问题的程序，每天都在检查硬件设计和软件配置。后面的每一种逻辑，包括 Isabelle 的逻辑，都包含命题逻辑。

有一个例子贯穿本模块：机房门的控制器。它读取门禁读卡器、密码键盘、火警报警器和封锁开关的状态，然后决定是否给门解锁。

::: definition 命题
**命题**（proposition）是一个要么为真、要么为假的陈述。**原子命题**（atomic proposition），简称**原子**（atom），是不由其他命题构成的命题。在公式中，原子用名字表示，例如 A、B 或 `fire`。命题逻辑从不考察原子的内部：它用到的只是原子为真还是为假。
:::

对于这扇门，“火警正在报警”和“出示了有效的门禁卡”都是原子。像“给门解锁”这样的命令不是命题；在知道 x 是什么之前，“x > 3”也不是命题，关于变量的陈述是模块 3 的主题。有五个**联结词**（connective）可以由较小的命题构成较大的命题。

::: definition 联结词
| 公式 | 读作 | 名称 | 恰好在以下情况为真 |
|---|---|---|---|
| ¬A | “非 A” | 否定（negation） | A 为假 |
| A ∧ B | “A 并且 B” | 合取（conjunction） | A 和 B 都为真 |
| A ∨ B | “A 或 B” | 析取（disjunction） | A 和 B 中至少有一个为真 |
| A ⟶ B | “A 蕴涵 B”，“如果 A，那么 B” | 蕴涵（implication） | A 为假，或者 B 为真 |
| A ⟷ B | “A 当且仅当 B” | 等价（equivalence），也称双条件 | A 和 B 同为真，或同为假 |

此外还有两个常量：`True` 总是为真，`False` 总是为假。在 A ⟶ B 中，A 是**前件**（antecedent），B 是**后件**（consequent）。
:::

第 2.3 节会把最后一列说得更精确。在 Isabelle/jEdit 中，用模块 1 中的缩写输入这些符号：`~` 输入 ¬，`&` 输入 ∧，`|` 输入 ∨，`-->` 输入 ⟶，`<-->` 输入 ⟷。

### 从日常语言到公式 {#english}

中文里，每个联结词都有许多种说法：

| 中文说法 | 公式 |
|---|---|
| 非 A；并非 A；A 不成立 | ¬A |
| A 并且 B；A 而且 B；A 但是 B；虽然 A，但是 B | A ∧ B |
| A 或者 B（也可以两者都成立） | A ∨ B |
| 要么 A，要么 B，但不会两者都成立 | ¬(A ⟷ B) |
| 既不 A，也不 B | ¬A ∧ ¬B |
| 如果 A，那么 B；只要 A，就 B；每当 A，就 B；A 仅当 B；只有 B，才 A | A ⟶ B |
| A 是 B 的充分条件；B 是 A 的必要条件 | A ⟶ B |
| 除非 B，否则 A；A，除非 B | ¬B ⟶ A，它与 A ∨ B 意思相同 |
| A 当且仅当 B；A 恰好在 B 成立时成立 | A ⟷ B |

其中有两行值得再看一眼。在逻辑中，**或**是相容的：A 和 B 都为真时，A ∨ B 也为真；而“喝茶还是喝咖啡？”中的“还是”表示只选其一、不能都要，这是**异或**（exclusive or），即 ¬(A ⟷ B)。**但是**带有一层转折的意味，而逻辑不理会这层意味：“门禁卡有效，但是门仍然关着”就是 `badge ∧ ¬ opens`。

::: pitfall
“A 仅当 B”是 A ⟶ B，而不是 B ⟶ A。“仅当门禁卡有效时，门才打开”（也可以说“只有门禁卡有效，门才打开”）的意思是：只要门打开了，门禁卡就是有效的，即 `opens ⟶ badge`。它并没有说有效的门禁卡会让门打开；那是 `badge ⟶ opens`，即“如果门禁卡有效，门就打开”。带有“仅当”的需求限制系统可以做什么，但从不强迫系统做什么。
:::

::: example 把一条门禁规则形式化
安全团队的第一条需求是：“仅当出示了有效的门禁卡并输入了正确的密码时，门才打开，除非火警正在报警。”为每个基本陈述选一个原子：

| 原子 | 含义 |
|---|---|
| `opens` | 门解锁 |
| `badge` | 出示了有效的门禁卡 |
| `pin` | 输入了正确的密码 |
| `fire` | 火警正在报警 |

“仅当出示了有效的门禁卡并输入了正确的密码时，门才打开”是 `opens ⟶ badge ∧ pin`，而“X，除非 F”是 ¬F ⟶ X，所以这条需求是

$$
\lnot \mathit{fire} \imp (\mathit{opens} \imp \mathit{badge} \land \mathit{pin})
$$

另一种同样自然的理解是“只有出示了有效的门禁卡并输入了正确的密码，或者发生了火警，门才可以打开”：

$$
\mathit{opens} \imp \mathit{badge} \land \mathit{pin} \lor \mathit{fire}
$$

这两个公式看起来不同，说的却是同一件事，练习 2.3 会说明这一点。请注意这条需求**没有**说什么：它没有说有效的门禁卡加上正确的密码就一定能打开门。“仅当”陈述的是必要条件，所以门在什么时候必须打开，要由另一条需求来规定。
:::

## 公式的结构 {#syntax}

要对公式求值、变换公式，或者让计算机检查公式，你需要确切地知道什么才算一个公式，以及每个公式是怎样构造起来的。

### 形成规则 {#formation}

::: definition 公式
命题逻辑的**公式**（formula）由下面这些规则构造，而且只由这些规则构造：

1. 每个原子都是公式，`True` 和 `False` 也是公式。
2. 如果 φ 是公式，那么 ¬φ 是公式。
3. 如果 φ 和 ψ 是公式，那么 (φ ∧ ψ)、(φ ∨ ψ)、(φ ⟶ ψ) 和 (φ ⟷ ψ) 都是公式。
:::

希腊字母 φ（phi）和 ψ（psi）代表任意公式，而不只是原子。例如，由规则 1，A、B 和 C 是公式；于是由规则 2，¬A 是公式；由规则 3，(¬A ∧ B) 是公式；再用一次规则 3，((¬A ∧ B) ⟶ C) 也是公式。A ∧ ∨ B 和 A ¬ B 不是公式：没有哪条规则能产生它们。像这样由基本情形和“由较小的对象构造较大的对象”的规则组成的定义，叫做**归纳定义**（inductive definition）。在模块 5 中，这样的定义将支撑归纳证明，并在 Isabelle 中成为数据类型。

每个公式都记得自己是怎样构造出来的。把最后使用的那条规则画成一棵树的根，把它所组合的各部分画成根的子结点，再对各部分重复这一过程，得到的就是这个公式的**语法树**（parse tree），如图 2.1 所示。

::: figure id=fig-02-1
`opens ⟶ badge ∧ pin ∨ fire` 的语法树。每个内部结点是一个联结词，每个结点代表写在它旁边的子公式。T 和 F 标记给出了这个公式在一种情形下的求值，第 2.3 节会解释。
:::

::: definition 子公式与主联结词
一个公式的**子公式**（sub-formula）是它的语法树各结点上的公式，包括这个公式本身。**主联结词**（main connective）是根结点上的联结词。公式按它的主联结词命名：¬(A ∧ B) 是一个否定式，而 ¬A ∧ B 是一个合取式。
:::

在图 2.1 中，主联结词是 ⟶，所以这条需求是一个蕴涵式。它的子公式是四个原子、`badge ∧ pin`、`badge ∧ pin ∨ fire` 以及整个公式。

### 优先级与结合方向 {#priorities}

规则 3 在每个二元联结词两边都加上括号，这样每个公式都恰好只有一棵语法树。但括号让公式很难读：门禁需求就得写成 (opens ⟶ ((badge ∧ pin) ∨ fire))。中学代数用一个约定解决同样的问题：× 比 + 结合得更紧，所以 2 + 3 × 4 的意思是 2 + (3 × 4)。逻辑也有同样的约定：每个联结词有一个**优先级**（priority），优先级越高，结合得越紧。在 Isabelle 中，二元联结词还都**向右结合**（group to the right）：

| 联结词 | Isabelle 中的优先级 | 结合方向 |
|---|---|---|
| ¬ | 40 | （作用于后面的公式） |
| ∧ | 35 | 向右 |
| ∨ | 30 | 向右 |
| ⟶ | 25 | 向右 |
| ⟷ | 25 | 向右 |

这些数字取自 Isabelle 本身。在引入这些联结词的库理论 `HOL.thy` 中，∧ 被声明为 `infixr 35`（“中缀，向右结合，优先级 35”），∨ 为 `infixr 30`，⟶ 和 ⟷ 为 `infixr 25`，¬ 的优先级是 40。所以：

| 你写的 | 它的意思 |
|---|---|
| ¬A ∧ B | (¬A) ∧ B |
| A ∧ B ∨ C | (A ∧ B) ∨ C |
| A ∨ B ∧ C | A ∨ (B ∧ C) |
| A ∧ B ⟶ C | (A ∧ B) ⟶ C |
| A ⟶ B ⟶ C | A ⟶ (B ⟶ C) |
| A ⟶ B ⟷ C | A ⟶ (B ⟷ C) |

向右结合很适合蕴涵：A ⟶ (B ⟶ C) 读作“如果 A，那么如果 B，那么 C”，它与“如果 A 并且 B，那么 C”意思相同；而 (A ⟶ B) ⟶ C 很少是人们想表达的意思。对于 ∧ 和 ∨，结合方向会改变语法树，但不改变意思（第 2.5 节）。

::: pitfall
- ¬A ∧ B 是 (¬A) ∧ B。要否定整个合取式，请写 ¬(A ∧ B)。
- ⟶ 和 ⟷ 的优先级相同，所以 A ⟶ B ⟷ C 的意思是 A ⟶ (B ⟷ C)。在这一点上，各种书和工具的约定并不相同；有的让 ⟷ 的优先级低于 ⟶，把同样的文字读成 (A ⟶ B) ⟷ C。只要混用 ⟶ 和 ⟷，就把括号写出来。
:::

::: isabelle
Isabelle 打印公式时只保留优先级所需要的括号，所以它能告诉你它是怎样读你的公式的。你在模块 1 中见过的 `value` 无法为含变量的公式算出真值；对于下面这样的公式，它会把公式重新打印出来。把光标依次放在每一行上：

```isabelle
value "(¬ A) ∧ (B ⟶ C)"
value "A ⟶ (B ⟶ C)"
value "(A ⟶ B) ⟶ C"
```

```output all
"¬ A ∧ (B ⟶ C)"
  :: "bool"

"A ⟶ B ⟶ C"
  :: "bool"

"(A ⟶ B) ⟶ C"
  :: "bool"
```

Isabelle 去掉了按优先级来看多余的括号，保留了会改变意思的括号。输出中的类型 `bool` 是公式的类型：在 Isabelle 中，公式是类型为 `bool` 的项，这个类型只有 `True` 和 `False` 两个值。再看一个例子，结果会让你有点意外：

```isabelle
value "A ⟶ (B ⟷ C)"
```

```output
"A ⟶ B = C"
  :: "bool"
```

Isabelle 把 ⟷ 打印成 `=`。对于真值来说，“当且仅当”就是相等：A ⟷ B 成立，恰好是在 A 和 B 取值相同的时候。等号比所有联结词结合得都紧（它的优先级是 50），所以 `A ⟶ B = C` 的意思是 A ⟶ (B ⟷ C)。在 Isabelle 的输出中，把两个公式之间的 `=` 读作 ⟷；模块 3 会进一步讨论这两者。
:::

## 真值表 {#truth-tables}

第 2.1 节的联结词表格用文字描述了每个联结词。真值表让这些描述变得精确。

::: definition 赋值
**赋值**（valuation）给每个原子指定一个真值（truth value）：T（真）或 F（假）。这样，一个赋值就确定了每个公式的真值：原子的值来自赋值，`True` 为 T，`False` 为 F，每个联结词则按照下面它的真值表，由各部分的值组合出整体的值。
:::

下面把所有联结词的真值表合在一张表里。每一行是 A 和 B 的一种赋值，每一列给出一个公式在该行中的值。

```truthtable
A ⟷ B
¬A
A ∧ B
A ∨ B
A ⟶ B
```

这些页面上的真值表是在生成页面时根据公式计算出来的，所以不会有笔误。表中的原子按字母顺序排列，第一行是所有原子都为 T 的那一行，表格末尾有一句结论，给最后一列的公式归类；第 2.4 节会解释其中的用语。

A ⟶ B 这一列会让大多数人感到意外。蕴涵式恰好只在一行中为假：前件为真而后件为假的那一行。当 A 为假时，无论 B 是什么，A ⟶ B 都为真；这时称它为**空真**（vacuously true）。

::: analogy
把 A ⟶ B 想象成一个承诺：“如果你考试及格，我就请你吃晚饭。”只有在你及格了而我没有请你吃饭时，这个承诺才被违背。如果你没及格，那么无论我请不请你吃饭，我都信守了承诺。
:::

对规约来说，这正是你想要的。规则“封锁期间，门保持关闭”，即 `lockdown ⟶ ¬ opens`，只在封锁期间约束门；在平常的日子里，无论门怎样，这条规则都成立。蕴涵也与因果无关：“如果 2 + 2 = 5，那么门是开着的”为真，因为它的前件为假。

要求出一个公式在某个赋值下的值，就从原子开始沿着语法树往上算，一路上应用每个联结词的真值表。

::: example 对门禁需求求值
有人出示了有效的门禁卡，输错了密码，没有火警，门却打开了。这个赋值是 opens = T，badge = T，pin = F，fire = F。沿着图 2.1 的树往上算：

1. `badge ∧ pin` 是 T ∧ F，即 F。
2. `badge ∧ pin ∨ fire` 是 F ∨ F，即 F。
3. `opens ⟶ badge ∧ pin ∨ fire` 是 T ⟶ F，即 F。

在这种情形下需求为假：控制器违反了它。图 2.1 中的标记展示的是同样的计算。
:::

::: definition 真值表
一个公式的**真值表**（truth table）为它的原子的每一种赋值各列一行，并给出公式在每一行中的值。含 n 个原子的公式有 $2^n$ 行，因为每个原子都可以独立于其他原子取 T 或 F。
:::

::: example 一张真值表
下面是 `opens ⟶ badge ∧ pin` 的真值表，也就是去掉火警这一例外的第一条需求；表中还有一列给出子公式 `badge ∧ pin` 的值：

```truthtable
opens ⟶ badge ∧ pin
badge ∧ pin
```

这个公式恰好在三行中为假：就是门打开了，却没有同时具备有效门禁卡和正确密码的那三行。
:::

真值表总是管用的，但它增长得很快。完整的门禁需求（含 `fire`）有 16 行；10 个原子有 1024 行，20 个原子有一百多万行，30 个原子则超过十亿行。第 2.8 节会再回到这个问题。

::: widget name=truth-table
输入一个公式，可以用符号，也可以用 ASCII 字符（`~ & | --> <-->`）；真值表会随着你的输入即时更新。先输入完整的门禁需求 `opens --> badge & pin | fire`：它在多少行中为假？为什么？然后试试示例按钮，再切换到**比较两个公式**，看看两个公式的真值表是否相同。
:::

::: isabelle
一个赋值把公式变成不含变量的公式：把每个原子替换成 `True` 或 `False`。`value` 能计算这样的公式，结果就是真值表中的一行。下面是例 2.2 的那一行，其中 opens = T，badge = T，pin = F，fire = F：

```isabelle
value "True ⟶ True ∧ False ∨ False"
```

```output
"False"
  :: "bool"
```

如果公式含有变量，`value` 不会替你逐一尝试各种赋值。即使公式在每一行中都为真，它也只是把公式打印回来：

```isabelle
value "A ∨ ¬ A"
```

```output
"A ∨ ¬ A"
  :: "bool"
```

要表明一个公式在每一行中都为真，你需要一个证明，这是下一节的主题。
:::

## 重言式、矛盾式与可满足的公式 {#classify}

有些公式在其真值表的每一行中都为真，有些则在任何一行中都不为真。这两个极端，以及介于两者之间的公式，是命题逻辑的核心概念。

::: definition 重言式、可满足、矛盾式
设 φ 是一个公式。

- 如果 φ 在每个赋值下都为真，也就是它的真值表的每一行都是 T，就称 φ 是**重言式**（tautology），或者说 φ 是**有效的**（valid）。
- 如果 φ 至少在一个赋值下为真，就称 φ 是**可满足的**（satisfiable）。使 φ 为真的赋值**满足**（satisfy）φ，称为 φ 的一个**模型**（model）。
- 如果 φ 在任何赋值下都不为真，就称 φ 是**矛盾式**（contradiction），或者说 φ 是**不可满足的**（unsatisfiable）。
- 如果 φ 是可满足的，但不是重言式，就称 φ 是**可满足但非有效的**（contingent）。使 φ 为假的赋值是 φ 的一个**反例**（counterexample）。
:::

计算出的真值表下方的结论用的就是这些说法：“重言式”“矛盾式”和“可满足但非有效”。最简单的重言式是**排中律**（law of excluded middle）：每个命题要么为真，要么为假。

```truthtable
A ∨ ¬A
¬A
```

它的反面是最简单的矛盾式：

```truthtable
A ∧ ¬A
¬A
```

例 2.3 中的需求是可满足但非有效的：有三行是反例，其余各行满足它。图 2.2 展示了这几类公式之间的关系。

::: figure id=fig-02-2
每个公式恰好属于三类中的一类。可满足的公式包括重言式。否定把每个重言式变成矛盾式，也把矛盾式变成重言式；可满足但非有效的公式经过否定，仍然是可满足但非有效的。
:::

::: fact 否定与三类公式
对每个公式 φ：

1. φ 是重言式，当且仅当 ¬φ 是矛盾式。
2. φ 是可满足的，当且仅当 ¬φ 不是重言式。
:::

原因是 ¬ 把真值表的每一行都翻转过来。事实 2.1 把一个问题转化成另一个问题：要表明 φ 是重言式，就表明 ¬φ 没有模型；要找 φ 的模型，就去找 ¬φ 的反例。SAT 求解器和 Isabelle 的 Nitpick 都依赖这一点（第 2.8 节和第 2.9 节）。

::: example 皮尔士定律
((A ⟶ B) ⟶ A) ⟶ A 是重言式吗？光看是看不出来的。真值表能告诉你：

```truthtable
((A ⟶ B) ⟶ A) ⟶ A
A ⟶ B
(A ⟶ B) ⟶ A
```

每一行都是 T。这个公式叫做皮尔士定律（Peirce's law），得名于逻辑学家查尔斯·桑德斯·皮尔士（Charles Sanders Peirce）。
:::

::: isabelle
**重言式就是引理。** 当一条引理含有变量时，Isabelle 把它理解为关于变量所有取值的断言，就像模块 1 中的 `xs` 那样。在公式中，Isabelle 根据联结词推断出变量的类型是 `bool`，所以这条断言说的是：公式对 `True` 和 `False` 的每一种组合都为真。证明了这条引理，就表明这个公式是重言式。

```isabelle
lemma "A ∨ ¬ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∨ ¬ A
```

```isabelle
  by simp
```

有三种证明方法可以证明重言式：

- `simp`，即模块 1 中的化简器，用它知道的等式重写目标，直到目标变成 `True`。
- `blast` 搜索证明：它把公式拆开，分情况讨论，当某个选择走不通时就回溯。它要么完全证明目标，要么失败。
- `auto` 把化简器与 `blast` 所用的那类逻辑步骤结合起来，并把它证明不了的部分留下来。

并不是每个重言式都能靠重写证明。皮尔士定律就难倒了 `simp`：

```isabelle fails
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. ((A ⟶ B) ⟶ A) ⟶ A
```

“Failed to apply initial proof method”（未能应用初始证明方法）的意思是 `simp` 根本无法开始：它的等式没有一条适用于这个目标。`blast` 则能证明它：

```isabelle
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  by blast
```

所以，证明失败并不意味着公式是假的。在本模块中，如果 `simp` 失败了，就试试 `blast` 或 `auto`；模块 9 会解释每种方法能做什么、不能做什么。
:::

如果公式不是重言式，会怎样？看 A ⟶ B ⟶ A ∧ B ∧ C，它断言得太多了：由 A 和 B，它不仅推出 A ∧ B，还推出了 C。

::: isabelle
每种证明方法都会失败，各有各的失败方式。`simp` 尽可能地往前推进，然后显示剩下的部分：

```isabelle fails
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  by simp
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. A ⟶ B ⟶ C
```

剩下的目标 A ⟶ B ⟶ C 显示了缺少什么：没有任何东西说明 C 成立。`blast` 失败时报告的是“Failed to apply initial proof method”，和上面一样，因为它从不留下部分结果。`auto` 用另一种记法显示它剩下的目标：

```isabelle fails
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  by auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⟦A; B⟧ ⟹ C
```

把 ⟦A; B⟧ ⟹ C 读作“假设 A 和 B，证明 C”；模块 7 会解释这种记法。

证明失败不能告诉你公式是不是假的。要弄清这一点，就请 Isabelle 找反例。Isabelle 有两个找反例的工具，Quickcheck 和 Nitpick：

```isabelle
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  A = True
  B = True
  C = False
```

```isabelle
  nitpick
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = True
    B = True
    C = False
```

```isabelle
  oops
```

两者找到了同一个反例：A 和 B 为真，C 为假。在这一行中，公式是 T ⟶ T ⟶ F，即 F。Quickcheck 做的是**测试**：它对一个又一个赋值求公式的值，直到找到一个使公式为假的赋值。Nitpick 做的是**搜索**：它把问题转换成一个可满足性问题，交给 SAT 求解器（第 2.8 节）。对于命题公式，两者都能立即给出答案。对于重言式，两者都会空手而归，分别报告“Quickcheck found no counterexample.”（Quickcheck 没有找到反例）和“Nitpick found no counterexample”（Nitpick 没有找到反例）。正如你在模块 1 中看到的，Isabelle/jEdit 会对每条新引理自动运行 Quickcheck；Nitpick 则只在你调用它时才运行。
:::

::: keyidea
证明表明一个公式是重言式；反例表明它不是。失败的证明两者都不能表明，因为可能只是方法太弱；而“没有找到反例”也不是证明。在 Isabelle 中，只有当 `by …` 成功或者出现了反例时，问题才算有了定论。
:::

## 逻辑等价与等价定律 {#equivalence}

A ⟶ B 和 ¬A ∨ B 看起来不同，却有相同的真值表。程序员每次改写一个条件时，都会遇到同样的问题：新的 `if` 判断和原来的一样吗？

::: definition 逻辑等价
如果两个公式 φ 和 ψ 在每个赋值下都有相同的真值，就称它们是**逻辑等价的**（logically equivalent），记作 φ ≡ ψ，读作“φ 等价于 ψ”。
:::

符号 ≡ 不是联结词。φ ≡ ψ 是一个**关于**两个公式的陈述，是在逻辑之外做出的，就像“这两个程序计算的是同一个函数”一样；而联结词 ⟷ 位于公式内部。两者之间有这样的联系：

::: fact 等价与 ⟷
φ ≡ ψ 当且仅当 φ ⟷ ψ 是重言式。
:::

这是因为 φ ⟷ ψ 在某一行中为真，恰好是在 φ 和 ψ 在这一行中取值相同的时候。所以，为两边各列一列的真值表就能检查一个等价式。下面是 A ⟶ B ≡ ¬A ∨ B：

```truthtable
(A ⟶ B) ⟷ ¬A ∨ B
A ⟶ B
¬A ∨ B
```

一小组等价式，即命题逻辑的**定律**（laws），能完成日常的大部分工作。每一条都可以用像上面那样的真值表来检查。

::: fact 等价定律
| 定律 | 等价式 |
|---|---|
| 双重否定律（double negation） | ¬¬A ≡ A |
| 德摩根律（De Morgan） | ¬(A ∧ B) ≡ ¬A ∨ ¬B；¬(A ∨ B) ≡ ¬A ∧ ¬B |
| 交换律（commutativity） | A ∧ B ≡ B ∧ A；A ∨ B ≡ B ∨ A |
| 结合律（associativity） | (A ∧ B) ∧ C ≡ A ∧ (B ∧ C)；(A ∨ B) ∨ C ≡ A ∨ (B ∨ C) |
| 分配律（distributivity） | A ∧ (B ∨ C) ≡ (A ∧ B) ∨ (A ∧ C)；A ∨ (B ∧ C) ≡ (A ∨ B) ∧ (A ∨ C) |
| 幂等律（idempotence） | A ∧ A ≡ A；A ∨ A ≡ A |
| 吸收律（absorption） | A ∧ (A ∨ B) ≡ A；A ∨ (A ∧ B) ≡ A |
| 同一律（identity） | A ∧ True ≡ A；A ∨ False ≡ A |
| 零律（domination） | A ∧ False ≡ False；A ∨ True ≡ True |
| 互补律（complement） | A ∧ ¬A ≡ False；A ∨ ¬A ≡ True |
| 蕴涵律（implication） | A ⟶ B ≡ ¬A ∨ B |
| 逆否律（contrapositive） | A ⟶ B ≡ ¬B ⟶ ¬A |
| 蕴涵否定律（negated implication） | ¬(A ⟶ B) ≡ A ∧ ¬B |
| 输出律（exportation） | A ∧ B ⟶ C ≡ A ⟶ B ⟶ C |
| 双条件律（equivalence） | A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) |
:::

这些定律是用原子写出的，但它们对所有公式都成立，而且可以用在更大的公式内部：

::: fact 代入与置换
1. **代入**（substitution）。如果一个公式是重言式，那么把其中某个原子的每一处出现都换成同一个公式，得到的仍是重言式。事实 2.3 中的每条定律用 ⟷ 写出来都是重言式（事实 2.2），所以把 A、B、C 换成任意公式，定律依然成立。
2. **置换**（replacement）。如果 φ ≡ ψ，那么把一个公式中 φ 的某一处出现换成 ψ，得到的公式与原公式等价。
:::

代入之所以成立，是因为重言式无论其原子取什么值都为真，因而无论代入的公式取什么值也都为真。置换之所以成立，是因为一个公式的值只取决于它各部分的值。

::: example 化简代码中的条件
一个程序中有这样的判断：

```text
if not (valid and not expired) or expired:
```

用 v 表示 `valid`（有效），用 e 表示 `expired`（已过期），然后一步一步地化简，并写出每一步所用的定律：

$$
\begin{array}{lll}
 & \lnot(v \land \lnot e) \lor e & \\
\equiv & (\lnot v \lor \lnot\lnot e) \lor e & \text{德摩根律} \\
\equiv & (\lnot v \lor e) \lor e & \text{双重否定律} \\
\equiv & \lnot v \lor (e \lor e) & \text{结合律} \\
\equiv & \lnot v \lor e & \text{幂等律} \\
\equiv & v \imp e & \text{蕴涵律}
\end{array}
$$

所以这个判断等价于 `if not valid or expired:`。把它读成蕴涵式，就是“如果票有效，那么它已经过期”，这表明原来的判断很可能没有表达出作者的本意。化简一个条件，是弄清它真正说了什么的一种廉价办法。
:::

::: pitfall
有三个公式看起来很像 A ⟶ B，但其中只有一个与它等价：

| 公式 | 名称 | 与 A ⟶ B 等价吗？ |
|---|---|---|
| ¬B ⟶ ¬A | 逆否命题（contrapositive） | 是 |
| B ⟶ A | 逆命题（converse） | 否 |
| ¬A ⟶ ¬B | 否命题（inverse） | 否 |

同样，¬(A ∧ B) 与 ¬A ∨ ¬B 等价，而不是与 ¬A ∧ ¬B 等价：否定把 ∧ 变成 ∨，也把 ∨ 变成 ∧。
:::

::: isabelle
在 Isabelle 中，等价式就是含 ⟷ 的引理。（Isabelle 也有符号 ≡，但它把这个符号用于定义，模块 7 会解释这一点。）`blast` 一步就能证明例 2.5 的整个化简过程：

```isabelle
lemma "¬ (valid ∧ ¬ expired) ∨ expired ⟷ (valid ⟶ expired)"
  by blast
```

`valid ⟶ expired` 两边的括号其实不需要，因为 ⟷ 和 ⟶ 都向右结合；但只要混用这两个联结词，就把括号写上。错误的定律会产生反例。下面是德摩根律的错误版本：

```isabelle
lemma "¬ (A ∧ B) ⟷ ¬ A ∧ ¬ B"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  A = True
  B = False
Evaluated terms:
  ¬ (A ∧ B) = True
  ¬ A ∧ ¬ B = False
```

对于等价式，Quickcheck 还会在“Evaluated terms”（求值的项）下面列出反例中两边各自的值：这里左边是 `True`，右边是 `False`。正确的定律都在 Isabelle 的库中；例如，定理 `de_Morgan_conj` 陈述的是 ¬ (P ∧ Q) ⟷ ¬ P ∨ ¬ Q。化简器会自动使用德摩根律的两种形式。
:::

::: pitfall
在 Isabelle 中，公式之间要写 ⟷，而不要写 `=`。因为 `=` 比联结词结合得更紧，`A ∧ B = B ∧ A` 的意思是 A ∧ (B = B) ∧ A，这根本不是交换律：

```isabelle
lemma "A ∧ B = B ∧ A"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  A = False
  B = a⇩1
```

B 的值是 a₁，这说明 B 甚至已经不是真值了。在 `B = B` 中，B 可以是任何东西，所以 Isabelle 给了它一个未知的类型，Quickcheck 从这个类型中挑了一个元素；模块 3 会解释这样的类型。改用 ⟷ 后，`A ∧ B ⟷ B ∧ A` 的意思就正如它字面所示。
:::

## 逻辑推论与论证 {#consequence}

关于系统的推理中充满了论证：“如果所有测试都通过，发布版本就会被构建；发布版本没有被构建；所以有某个测试失败了。”一个论证有前提和结论，问题在于：当前提都为真时，结论是否一定为真。

::: definition 逻辑推论
公式 ψ 是公式 φ₁, …, φₙ 的**逻辑推论**（logical consequence），记作

$$
\varphi_1, \ldots, \varphi_n \models \psi
$$

是指：每个使 φ₁, …, φₙ 全都为真的赋值也都使 ψ 为真。φᵢ 称为**前提**（premise），ψ 称为**结论**（conclusion）；⊨ 读作“推出”（entails）。如果一个**论证**（argument）的结论是其前提的逻辑推论，就称这个论证是**有效的**。没有前提时，⊨ ψ 表示 ψ 是重言式。
:::

符号 ⊨ 关乎真假。模块 6 会介绍它的搭档 ⊢，后者关乎证明：φ ⊢ ψ 表示 ψ 可以用某个证明系统的规则从 φ **推导**出来。要用真值表检查一个论证，就去找**坏行**（bad row）：在这一行中，每个前提都为真，而结论为假。论证有效，恰好是在没有坏行的时候；这就给出了检查论证的第二种方法：

::: fact 推论与重言式
φ₁, …, φₙ ⊨ ψ 当且仅当 φ₁ ∧ … ∧ φₙ ⟶ ψ 是重言式。
:::

这个蕴涵式恰好在坏行中为假。有六种论证形式（argument form）出现得非常频繁，都有了自己的名字。其中四种是有效的；另外两种是错误，只是因为太常见，也有了名字。

| 名称 | 前提 | 结论 | 有效吗？ |
|---|---|---|---|
| 肯定前件式（modus ponens） | A ⟶ B，A | B | 是 |
| 否定后件式（modus tollens） | A ⟶ B，¬B | ¬A | 是 |
| 链式推理，即假言三段论（hypothetical syllogism） | A ⟶ B，B ⟶ C | A ⟶ C | 是 |
| 析取三段论（disjunctive syllogism） | A ∨ B，¬A | B | 是 |
| 肯定后件（affirming the consequent） | A ⟶ B，B | A | 否 |
| 否定前件（denying the antecedent） | A ⟶ B，¬A | ¬B | 否 |

由代入（事实 2.4），把 A、B、C 换成任意公式，有效的论证形式依然有效。

::: example 关于发布的两个论证
用 `tests` 表示“所有测试都通过”，用 `built` 表示“发布版本已构建”。

1. “如果所有测试都通过，发布版本就会被构建。发布版本没有被构建。所以并非所有测试都通过了。”这是否定后件式，所以这个论证是有效的。
2. “如果所有测试都通过，发布版本就会被构建。发布版本被构建了。所以所有测试都通过了。”这是肯定后件，这个论证是无效的。真值表能找出坏行：

```truthtable
(tests ⟶ built) ∧ built ⟶ tests
tests ⟶ built
```

前提是 `built` 列和 `tests ⟶ built` 列，结论是 `tests` 列。在 built = T、tests = F 的那一行中，两个前提都为真，结论却为假：有人在测试失败的情况下手工构建了发布版本。只要有一个坏行，论证就是无效的。
:::

::: note
有效性关乎论证的形式，而与事实无关。一个有效的论证如果有假前提，就可能得出假结论；一个无效的论证也可能碰巧得出真结论。评审一个设计论证时，要问两个问题：形式是否有效？前提是否为真？
:::

有一种特殊情况对规约非常重要。

::: fact 不一致的前提推出一切
如果没有任何赋值能使 φ₁, …, φₙ 全都为真，那么对每个公式 ψ，都有 φ₁, …, φₙ ⊨ ψ。特别地，A, ¬A ⊨ B。
:::

没有哪一行能使前提全都为真，所以无论 ψ 是什么，都不存在坏行。这就是**爆炸原理**（principle of explosion），它的拉丁文名称是 **ex falso quodlibet**：从谬误出发，可以推出任何东西。

::: keyidea
在相信某条性质能从一组需求推出之前，先检查这些需求是否一致。从不一致的需求可以推出任何性质，包括它的反面，而且每个证明都会成功。
:::

::: isabelle
由事实 2.5，当从前提到结论的蕴涵式是重言式时，论证就是有效的，所以 `blast` 可以检查它。以否定后件式为例：

```isabelle
lemma "(A ⟶ B) ∧ ¬ B ⟶ ¬ A"
  by blast
```

对于无效的论证，Nitpick 会找出坏行：

```isabelle
lemma "(A ⟶ B) ∧ B ⟶ A"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = False
    B = True
```

当 A 为假、B 为真时，前提 A ⟶ B 和 B 都成立，而结论 A 不成立。爆炸原理也是一条定理：

```isabelle
lemma "A ∧ ¬ A ⟶ B"
  by blast
```
:::

## 范式 {#normal-forms}

等价的公式看起来可能大不相同，这使它们难以比较，也难以用程序处理。**范式**（normal form）是一种标准形状，每个公式都可以在不改变意思的前提下化成这种形状。常用的范式有三种。

::: definition 文字与子句
**文字**（literal）是一个原子或一个原子的否定，例如 A 或 ¬A。**子句**（clause）是若干文字的析取，例如 ¬A ∨ B ∨ ¬C；单个文字也算一个子句。
:::

::: definition 范式
- 如果一个公式只使用 ¬、∧ 和 ∨，并且每个 ¬ 都直接出现在原子前面，就说它是**否定范式**（negation normal form，NNF）。
- 如果一个公式是若干子句的合取，例如 (A ∨ ¬B) ∧ (¬A ∨ C ∨ D) ∧ ¬C，就说它是**合取范式**（conjunctive normal form，CNF）。
- 如果一个公式是若干个文字合取式的析取，例如 (A ∧ ¬B) ∨ (¬A ∧ C) ∨ D，就说它是**析取范式**（disjunctive normal form，DNF）。
:::

合取范式是一张必须全部成立的小规则清单：子句 ¬A ∨ ¬B ∨ C 说的是 A ∧ B ⟶ C。SAT 求解器的输入就是合取范式。析取范式列出了使公式为真的各种情形，所以从它可以直接看出公式是否可满足：一个析取范式是可满足的，当且仅当它的某个合取式不同时含有一个原子及其否定。否定范式是通往这两种范式的第一步。

### 否定范式 {#nnf}

任何公式都可以经过三步化为否定范式：

1. 把每个 φ ⟷ ψ 替换为 (φ ⟶ ψ) ∧ (ψ ⟶ φ)。
2. 把每个 φ ⟶ ψ 替换为 ¬φ ∨ ψ。
3. 把每个 ¬ 向内推：把 ¬¬φ 替换为 φ，¬(φ ∧ ψ) 替换为 ¬φ ∨ ¬ψ，¬(φ ∨ ψ) 替换为 ¬φ ∧ ¬ψ，¬True 替换为 False，¬False 替换为 True。

每一步都利用双条件律、蕴涵律、双重否定律和德摩根律，把一个子公式替换成与它等价的公式，所以由事实 2.4，结果与最初的公式等价。

::: example 否定范式
把 ¬(A ⟶ B ∧ C) 化为否定范式：

$$
\begin{array}{lll}
 & \lnot(A \imp B \land C) & \\
\equiv & \lnot(\lnot A \lor B \land C) & \text{蕴涵律} \\
\equiv & \lnot\lnot A \land \lnot(B \land C) & \text{德摩根律} \\
\equiv & A \land (\lnot B \lor \lnot C) & \text{双重否定律、德摩根律}
\end{array}
$$

结果是否定范式，同时也是合取范式：它是子句 A 和 ¬B ∨ ¬C 的合取。
:::

### 合取范式与析取范式 {#cnf-dnf}

从否定范式出发，剩下的工作由分配律完成：

- 要得到**合取范式**，就把 ∨ 移到 ∧ 的里面：把 φ ∨ (ψ ∧ χ) 替换为 (φ ∨ ψ) ∧ (φ ∨ χ)，把 (φ ∧ ψ) ∨ χ 替换为 (φ ∨ χ) ∧ (ψ ∨ χ)，直到 ∨ 里面不再有 ∧ 为止。
- 要得到**析取范式**，就把 ∧ 移到 ∨ 的里面：把 φ ∧ (ψ ∨ χ) 替换为 (φ ∧ ψ) ∨ (φ ∧ χ)，把 (φ ∨ ψ) ∧ χ 替换为 (φ ∧ χ) ∨ (ψ ∧ χ)，直到 ∧ 里面不再有 ∨ 为止。

这里的 χ（chi）是又一个表示任意公式的字母。图 2.3 展示了整个过程。

::: figure id=fig-02-3
从任意公式到合取范式和析取范式，以 (A ⟶ B) ⟶ C 为例。第 1、2 步得到否定范式；然后用一个联结词对另一个联结词的分配律，就得到合取范式或析取范式。
:::

门禁需求 `opens ⟶ badge ∧ pin ∨ fire` 变成 ¬opens ∨ (badge ∧ pin) ∨ fire，这已经是析取范式了；再用分配律，就得到合取范式 (¬opens ∨ badge ∨ fire) ∧ (¬opens ∨ pin ∨ fire)。把这两个子句读回成规则，它们说的是：门在没有火警时打开了，就说明出示过有效的门禁卡，并且输入过正确的密码。

::: pitfall
分配可能使公式爆炸式增长。用分配律把 (A₁ ∧ B₁) ∨ (A₂ ∧ B₂) ∨ … ∨ (Aₙ ∧ Bₙ) 化为合取范式，会得到 $2^n$ 个子句，从每一对中选出 Aᵢ 或 Bᵢ 的每一种选法都对应一个子句：三对时有 8 个子句，二十对时超过一百万个。这就是 Isabelle 的化简器默认不使用分配律的原因。在 `HOL.thy` 中化简器确实使用的定律列表旁边，有一条注释说，加入分配律“might cause exponential blow-up”（可能导致指数级膨胀）。
:::

::: note
SAT 求解器用 **Tseitin 变换**（Tseitin transformation）来避免这种爆炸：它给每个子公式一个新原子作为名字，并加上几个定义这个原子的子句。这样得到的合取范式只与原公式的规模成比例地增长。它与原公式并不等价，因为它多了一些原子，但它与原公式是**等可满足的**（equisatisfiable）：它可满足当且仅当原公式可满足，而 SAT 求解器需要的也只是这一点。
:::

### 由真值表求范式 {#nf-tables}

由真值表可以直接得到两种范式。

- **析取范式：** 对公式为 T 的每一行，写出描述这一行的文字合取式（这一行中 A 为 T 就写 A，为 F 就写 ¬A），再用 ∨ 把这些合取式连接起来。
- **合取范式：** 对公式为 F 的每一行，写出排除这一行的子句（这一行中 A 为 T 就写 ¬A，为 F 就写 A），再用 ∧ 把这些子句连接起来。

::: example 异或
异或 ¬(A ⟷ B) 在 A 和 B 恰好有一个为真时为真：

```truthtable
¬(A ⟷ B)
A ⟷ B
```

它在 A = T、B = F 和 A = F、B = T 这两行中为 T，所以它的析取范式是 (A ∧ ¬B) ∨ (¬A ∧ B)。它在 A = T、B = T 和 A = F、B = F 这两行中为 F；排除这两行的子句是 ¬A ∨ ¬B 和 A ∨ B，所以它的合取范式是 (¬A ∨ ¬B) ∧ (A ∨ B)。
:::

::: fact 范式的存在性
每个公式都等价于某个析取范式，也等价于某个合取范式。
:::

真值表方法就证明了这一点。在边界情况下，没有 T 行的公式得到空析取，即 `False`；没有 F 行的公式得到空合取，即 `True`。事实 2.7 还说明 ¬、∧ 和 ∨ 能表达所有可能的真值表；练习 2.7 会说明，更少的联结词也就够了。

::: isabelle
每次转换都是一个等价式，所以 `blast` 可以确认它。下面是图 2.3 的两个结果：

```isabelle
lemma "((A ⟶ B) ⟶ C) ⟷ (A ∧ ¬ B) ∨ C"
  by blast

lemma "((A ⟶ B) ⟶ C) ⟷ (A ∨ C) ∧ (¬ B ∨ C)"
  by blast
```

一个疏忽会表现为一个反例。挪动一对括号就会改变意思：

```isabelle
lemma "(A ∧ B) ∨ C ⟷ A ∧ (B ∨ C)"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = False
    B = False
    C = True
```

当 A 为假、C 为真时，左边为真而右边为假。
:::

## 可满足性与 SAT 求解器 {#sat}

本模块的所有问题都可以归结为同一个问题。

::: definition 可满足性问题
**可满足性问题**（satisfiability problem），简称 **SAT**，问的是：给定一个命题公式（通常是合取范式），它是可满足的吗？**SAT 求解器**（SAT solver）是回答这个问题的程序；当答案为“是”时，它还会返回一个满足该公式的赋值。
:::

由事实 2.1，φ 是重言式当且仅当 ¬φ 不可满足。由事实 2.5，φ₁, …, φₙ ⊨ ψ 当且仅当 φ₁ ∧ … ∧ φₙ ∧ ¬ψ 不可满足，因为这个公式的模型正是一个坏行。而一组需求是一致的，当且仅当它们的合取是可满足的。所以，一个 SAT 求解器就能回答本模块的所有问题。

SAT 有多难？检查别人给出的一个赋值很快：只要对公式求一次值。自己找出一个这样的赋值则是另一回事，因为真值表有 $2^n$ 行。

::: fact 库克定理
SAT 是 **NP 完全**的。这是斯蒂芬·库克（Stephen Cook）在 1971 年证明的。
:::

**NP** 是这样一类判定问题（即回答“是”或“否”的问题）：一旦有人给出一个解，答案“是”就能很快地得到**检验**，也就是说，检验所需的步数不超过问题规模的某个多项式。SAT 就是其中之一。下面这些问题也是：考试能否排出一张没有冲突的时间表？这个数独能否填完？这几个版本的软件包能否一起安装？如果一个问题属于 NP，并且 NP 中的每个问题都能高效地转化为它，这个问题就是 **NP 完全**的（NP-complete）。SAT 是第一个被证明为 NP 完全的问题；列昂尼德·列文（Leonid Levin）独立地得到了同样的结果。因此，只要 SAT 有一个快速的（多项式时间的）算法，NP 中的每个问题就都有快速算法。没有人知道这样的算法是否存在：这就是 **P 与 NP 问题**（P versus NP），其中 P 是能在多项式时间内**求解**的问题类。这个问题自 1971 年以来一直悬而未决，是克雷数学研究所的七个千禧年大奖难题之一。

尽管如此，SAT 求解仍是计算机科学在实践中取得的伟大成功之一。最坏情况需要指数时间，但来自实际问题的公式是有结构的，求解器能利用这些结构。大多数求解器都源自 **DPLL 算法**（DPLL procedure），它以 Davis、Putnam、Logemann 和 Loveland 的名字命名，他们在 20 世纪 60 年代初描述了这个算法。它作用于合取范式，反复执行两个步骤：

1. **单元传播**（unit propagation）。如果一个子句中除了一个文字之外，其余文字都为假，那么剩下的那个文字必须为真：把它设为真。只要还能这样做，就一直重复。
2. **决策**（decision）。否则，选一个还没有取值的原子，给它试一个值。

当某个子句变为假时，就出现了**冲突**（conflict）。这时算法回到最近的、另一个值还没有试过的那个决策，撤销该决策之后所做的一切，然后试另一个值。如果每个子句都变为真，公式就是可满足的；如果发生冲突时已经没有可以回退的决策，公式就是不可满足的。

从 20 世纪 90 年代末开始，求解器加入了**冲突驱动子句学习**（conflict-driven clause learning，CDCL）：出现冲突后，求解器找出是哪些决策导致了这个冲突，并加入一个排除这种组合的子句，这样搜索就永远不会犯同样的错误两次。现代 CDCL 求解器经常能判定来自工业界的、含有几十万个原子和几百万个子句的公式。

::: example 单元传播
这个合取范式是可满足的吗？

$$
(A \lor B) \land (\lnot A \lor C) \land (\lnot B \lor C) \land (\lnot C \lor D) \land \lnot D
$$

最后一个子句是单个文字，所以 D = F。于是子句 ¬C ∨ D 迫使 C = F。接着 ¬A ∨ C 迫使 A = F，¬B ∨ C 迫使 B = F。这时 A ∨ B 为假：出现了冲突，而且一次决策都没有做。这个公式是不可满足的，求解器没有写出它的 16 行真值表就证明了这一点。
:::

凡是能表述成许多相互约束的是非选择的问题，都有 SAT 求解器的用武之地：检查两个电路是否计算同一个函数，以及在一个设计中搜索在固定步数之内违反某条性质的运行（即有界模型检测）；判定哪些软件包可以一起安装（Eclipse 开发环境就用 SAT 求解器 Sat4j 来解决其插件之间的依赖关系）；排课表和排班表。SMT 求解器，例如模块 1 中提到的 Z3 和 cvc5，用数、数组和其他数据扩展了 SAT 求解，是程序验证器背后的引擎。Isabelle 的 Nitpick 则把寻找反例的问题转化为 SAT 问题。

::: isabelle
Isabelle 自带一个小型 CDCL 求解器，证明方法 `sat` 就使用它。`sat` 把目标的否定转换成合取范式，然后问求解器它是否可满足。下面用它确认例 2.9：

```isabelle
lemma "¬ ((A ∨ B) ∧ (¬ A ∨ C) ∧ (¬ B ∨ C) ∧ (¬ C ∨ D) ∧ ¬ D)"
  by sat
```

为什么要信任求解器？你不必信任它。当求解器发现否定后的目标不可满足时，它还会返回推理的各个步骤，即一个归结证明（proof by resolution），而 Isabelle 会在内核中重放每一步：这正是模块 1 中的 LCF 思想。当目标不是重言式时，求解器会为目标的否定找到一个模型，于是 `sat` 失败，并给出这个赋值，也就是一个反例：

```isabelle fails
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  by sat
```

```output
*** exception THM 0 raised⌂: SAT solver found a countermodel:
*** A: true, B: true, C: false
```

消息的第一行是技术性的；第二行说 SAT 求解器找到了一个反模型（countermodel），也就是你在第 2.4 节中找到的那个反例。另一个方法 `satx` 会先做一次 Tseitin 式的定义式合取范式变换，使大目标的合取范式保持较小的规模。
:::

## 把需求写成命题约束 {#requirements}

回到机房的门。经过一番讨论，安全团队就四条需求达成了一致：

| | 需求 | 公式 |
|---|---|---|
| R1 | 仅当出示了有效的门禁卡并输入了正确的密码，或者火警正在报警时，门才打开。 | `opens ⟶ badge ∧ pin ∨ fire` |
| R2 | 火警正在报警时，门打开。 | `fire ⟶ opens` |
| R3 | 封锁期间，门保持关闭。 | `lockdown ⟶ ¬ opens` |
| R4 | 有效的门禁卡加上正确的密码能打开门。 | `badge ∧ pin ⟶ opens` |

原子 `badge`、`pin`、`fire` 和 `lockdown`（正处于封锁状态）描述的是情形：它们由传感器报告，控制器无法选择。`opens` 是控制器的决定。有三个问题很重要：

1. 这些需求是一致的吗？也就是说，控制器能否同时满足它们？
2. 无论传感器报告什么，控制器能否在每一种情形下都满足它们？
3. 它们能否保证团队关心的那些性质？

::: definition 一致的需求
如果一组写成公式的需求的合取是可满足的，也就是存在一个赋值使它们全都为真，就称这组需求是**一致的**（consistent）。
:::

### 一致性 {#consistency}

::: isabelle
Nitpick 寻找反例，而由事实 2.1，¬φ 的反例就是 φ 的模型。所以，要找需求的一个模型，就写出它们的否定，再请 Nitpick 找反例：

```isabelle
lemma "¬ ((opens ⟶ badge ∧ pin ∨ fire) ∧
         (fire ⟶ opens) ∧
         (lockdown ⟶ ¬ opens) ∧
         (badge ∧ pin ⟶ opens))"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    badge = True
    fire = False
    lockdown = False
    opens = False
    pin = False
```

这个否定式的反例就是需求的一个模型：门禁卡有效、密码错误、没有火警、也没有封锁时，门关着就满足全部四条需求。所以这些需求是一致的。
:::

::: tip
Nitpick 也可以直接找模型：对需求本身（不加 ¬）使用 `nitpick [satisfy]`，它会报告“Nitpick found a model”（Nitpick 找到了一个模型），后面跟着那个赋值。
:::

### 让需求失效的情形 {#scenarios}

有一个模型还不够：门必须在每一种情形下都能正常工作，包括罕见的情形。在封锁期间，如果火警响了，会怎么样？把 `fire` 和 `lockdown` 加到需求中，看看结果是否仍然可满足：

```isabelle
lemma "¬ ((opens ⟶ badge ∧ pin ∨ fire) ∧
         (fire ⟶ opens) ∧
         (lockdown ⟶ ¬ opens) ∧
         (badge ∧ pin ⟶ opens) ∧
         fire ∧ lockdown)"
  by blast
```

Isabelle 证明了没有任何赋值能满足它们。封锁期间发生火警时，R2 说门必须打开，R3 说门必须保持关闭，没有哪个控制器能两者兼顾。封锁期间有人出示有效的门禁卡并输入正确的密码时，R3 和 R4 之间也会发生同样的冲突。这样的冲突藏在罕见事件的组合之中，而这恰恰是测试很少触及的地方。而且在这些情形下，事实 2.6 适用：从这些需求出发，Isabelle 能证明任何东西，甚至能证明门既开着又关着。关于不一致需求的证明都会成功，却毫无意义。

### 修复需求 {#repair}

这些冲突不是逻辑上的错误，而是还没有人做出的决定，而且只有编写需求的人才能做出这些决定；这就是模块 1 所说的确认。假设团队决定人身安全优先：火警优先于封锁，封锁优先于门禁卡。R3 和 R4 变为：

| | 需求 | 公式 |
|---|---|---|
| R3′ | 封锁期间，除非火警正在报警，否则门保持关闭。 | `lockdown ∧ ¬ fire ⟶ ¬ opens` |
| R4′ | 有效的门禁卡加上正确的密码能打开门，封锁期间除外。 | `badge ∧ pin ∧ ¬ lockdown ⟶ opens` |

现在可以做更强的检查了。新需求与 R1 和 R2 一起，完全确定了门的行为：它们迫使 `opens` 与 fire ∨ (badge ∧ pin ∧ ¬lockdown) 取相同的值。

```isabelle
lemma door_determined:
  "(opens ⟶ badge ∧ pin ∨ fire) ∧
   (fire ⟶ opens) ∧
   (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
   (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
   ⟶ (opens ⟷ fire ∨ badge ∧ pin ∧ ¬ lockdown)"
  by blast
```

反过来，一个恰好在 fire ∨ (badge ∧ pin ∧ ¬lockdown) 成立时开门的控制器，无论传感器报告什么，都满足全部四条需求：

```isabelle
lemma door_rule_ok:
  "(opens ⟷ fire ∨ badge ∧ pin ∧ ¬ lockdown) ⟶
   (opens ⟶ badge ∧ pin ∨ fire) ∧
   (fire ⟶ opens) ∧
   (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
   (badge ∧ pin ∧ ¬ lockdown ⟶ opens)"
  by blast
```

引理 `door_rule_ok` 是一次具体而微的验证。需求是规约，`opens` 的规则是实现，而这个证明一次就覆盖了四个传感器的全部十六种情形。它还表明，修复后的需求在每一种情形下都是一致的，因为在每种情形下，按这条规则做出的决定都满足全部需求。引理 `door_determined` 进一步说明，其他任何决定都做不到这一点：需求没有给控制器留下任何选择的余地。

### 能推出的性质，以及一条推不出的性质 {#properties}

最后来看性质。团队希望确保：在没有火警时，不输入正确的密码，谁也进不去，即 `opens ∧ ¬ fire ⟶ pin`。这条性质能从需求推出：

```isabelle
lemma "(opens ⟶ badge ∧ pin ∨ fire) ∧
       (fire ⟶ opens) ∧
       (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
       (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
       ⟶ (opens ∧ ¬ fire ⟶ pin)"
  by blast
```

原来的承诺“封锁期间，门保持关闭”则不再能推出了：

```isabelle
lemma "(opens ⟶ badge ∧ pin ∨ fire) ∧
       (fire ⟶ opens) ∧
       (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
       (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
       ⟶ (lockdown ⟶ ¬ opens)"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    badge = False
    fire = True
    lockdown = True
    opens = True
    pin = False
```

这个反例是封锁期间发生了火警，门开着：这正是团队做出的决定。反例并不总是意味着错误。这里，它在一个具体情形中记录了一个有意的权衡，而这正是向必须接受这个权衡的人展示它的最好方式。如果他们没有料到这一点，那么错的是需求，而不是证明。

::: keyidea
用命题逻辑分析需求的步骤是：选择原子，把由环境决定的和由系统决定的区分开；把每条需求写成公式；检查需求是否一致，包括在那些重要的罕见情形下；证明你需要的性质确实能够推出；把每个反例都当作一个需要讨论的情形来读。这些检查中的每一项都是一个可满足性问题。
:::

命题逻辑有它的局限。它无法表达“警报停止十秒后，门重新上锁”，因为这涉及时间；也无法表达“每个员工的门禁卡都能打开本部门的门”，因为这同时涉及许多对象。模块 3 的谓词逻辑加入了对象和量词，模块 13 则为随时间变化的系统建模。

## 小结 {#summary}

- **命题**要么为真，要么为假。公式由**原子**、`True` 和 `False` 用 ¬、∧、∨、⟶ 和 ⟷ 按归纳定义构造而成，每个公式都有一棵**语法树**。
- 在 Isabelle 中，¬ 结合得最紧，其次是 ∧，再次是 ∨，然后是优先级相同的 ⟶ 和 ⟷；二元联结词都向右结合。Isabelle 把 ⟷ 打印成 `=`。混用 ⟶ 和 ⟷ 时一定要加括号。
- **赋值**给每个原子一个真值，**真值表**列出全部 $2^n$ 种赋值。A ⟶ B 只在 A 为真、B 为假时为假。
- 公式要么是**重言式**（在每一行中都为真），要么是**可满足但非有效的**（在一些行中为真，在另一些行中为假），要么是**矛盾式**（在任何一行中都不为真）；φ 是重言式，恰好是在 ¬φ 不可满足的时候。
- 当 φ ⟷ ψ 是重言式时，φ ≡ ψ。各条**定律**（德摩根律、分配律、逆否律……）能在不改变意思的前提下变换公式。
- 当没有哪一行使前提全都为真而 ψ 为假时，φ₁, …, φₙ ⊨ ψ。肯定前件式和否定后件式是有效的；肯定后件和否定前件则不是。不一致的前提能推出一切。
- 每个公式都有与之等价的**否定范式**、**合取范式**和**析取范式**。分配律可能使合取范式变得指数级地大；Tseitin 变换能避免这一点。
- **SAT** 是 NP 完全的（库克，1971 年），但在实践中，CDCL 求解器能判定非常大的公式。
- 对于需求，**一致性**就是可满足性；当“需求 ⟶ 性质”是重言式时，这条性质就能从需求推出；每个反例都是一个需要讨论的情形。
- 在 Isabelle 中，变量类型为 `bool` 的引理断言的是一个重言式。`simp`、`blast` 和 `auto` 能证明重言式（`blast` 和 `auto` 能证明的比 `simp` 多）；`quickcheck` 和 `nitpick` 寻找反例；¬φ 的反例就是 φ 的模型。

数学基础系列中的模块[逻辑、量词与规格说明](../math/module_02_ZH.html)面向一般的计算机学科讲解命题逻辑和谓词逻辑，练习更多。

## 练习 {#exercises}

:::: exercise 括号与主联结词 {#ex-2-1} ★
按照 Isabelle 的优先级，为下面每个公式加上所有隐含的括号，并指出每个公式的主联结词。

1. ¬A ∨ B ∧ C
2. A ∧ B ⟶ C ∨ D
3. A ⟶ B ⟶ C ∧ D
4. A ∨ B ⟷ C ⟶ D

::: solution
1. (¬A) ∨ (B ∧ C)。主联结词是 ∨。
2. (A ∧ B) ⟶ (C ∨ D)。主联结词是 ⟶。
3. A ⟶ (B ⟶ (C ∧ D))。主联结词是第一个 ⟶，因为 ⟶ 向右结合。
4. (A ∨ B) ⟷ (C ⟶ D)。∨ 比 ⟷ 和 ⟶ 结合得更紧，而 ⟷ 和 ⟶ 优先级相同，并且向右结合。主联结词是 ⟷。

`value` 可以确认第三个答案：它打印加满括号的公式时，会去掉那些按优先级来看多余的括号。

```isabelle
value "A ⟶ (B ⟶ (C ∧ D))"
```

```output
"A ⟶ B ⟶ C ∧ D"
  :: "bool"
```
:::
::::

:::: exercise 用真值表分类 {#ex-2-2} ★
用真值表判断下面每个公式是重言式、矛盾式，还是可满足但非有效的公式。对每个可满足但非有效的公式，给出一个模型和一个反例。

1. (A ⟶ B) ∨ (B ⟶ A)
2. (A ⟶ B) ∧ A ∧ ¬B
3. (A ⟶ B) ⟶ (B ⟶ A)
4. (A ∧ B ⟶ C) ⟶ (A ⟶ C) ∨ (B ⟶ C)

::: solution
1. 重言式。无论 A 和 B 取什么值，两个蕴涵式中总有一个为真：如果 B 为真，A ⟶ B 为真；如果 B 为假，B ⟶ A 为真。

```truthtable
(A ⟶ B) ∨ (B ⟶ A)
A ⟶ B
B ⟶ A
```

2. 矛盾式：A ⟶ B 和 A 迫使 B 为真，这与 ¬B 矛盾。

```truthtable
(A ⟶ B) ∧ A ∧ ¬B
A ⟶ B
¬B
```

3. 可满足但非有效。一个模型：A = T，B = T。一个反例：A = F，B = T，此时 A ⟶ B 为真，而它的逆命题 B ⟶ A 为假。

```truthtable
(A ⟶ B) ⟶ (B ⟶ A)
A ⟶ B
B ⟶ A
```

4. 重言式，这也许出人意料。结论只有在 A ⟶ C 和 B ⟶ C 都为假时才为假，也就是 A 和 B 为真而 C 为假时；但这时前提 A ∧ B ⟶ C 也为假。

```truthtable
(A ∧ B ⟶ C) ⟶ (A ⟶ C) ∨ (B ⟶ C)
A ∧ B ⟶ C
(A ⟶ C) ∨ (B ⟶ C)
```
:::
::::

:::: exercise 用定律推导等价式 {#ex-2-3} ★★
用事实 2.3 中的定律一步一步地证明下面的等价式，并写出每一步所用的定律：

1. (A ⟶ B) ∧ (A ⟶ C) ≡ A ⟶ B ∧ C
2. A ⟶ (B ⟶ C) ≡ B ⟶ (A ⟶ C)
3. ¬fire ⟶ (opens ⟶ badge ∧ pin) ≡ opens ⟶ badge ∧ pin ∨ fire（例 2.1 中的两种理解）

然后在 Isabelle 中检查这三个等价式。

::: solution
1. (A ⟶ B) ∧ (A ⟶ C) ≡ (¬A ∨ B) ∧ (¬A ∨ C)（两次使用蕴涵律）；≡ ¬A ∨ (B ∧ C)（分配律，从右往左用）；≡ A ⟶ B ∧ C（蕴涵律）。
2. A ⟶ (B ⟶ C) ≡ A ∧ B ⟶ C（输出律）；≡ B ∧ A ⟶ C（交换律）；≡ B ⟶ (A ⟶ C)（输出律）。
3. ¬fire ⟶ (opens ⟶ badge ∧ pin) ≡ ¬fire ∧ opens ⟶ badge ∧ pin（输出律）；≡ ¬(¬fire ∧ opens) ∨ (badge ∧ pin)（蕴涵律）；≡ (fire ∨ ¬opens) ∨ (badge ∧ pin)（德摩根律和双重否定律）；≡ ¬opens ∨ ((badge ∧ pin) ∨ fire)（交换律和结合律）；≡ opens ⟶ badge ∧ pin ∨ fire（蕴涵律）。

```isabelle
lemma "(A ⟶ B) ∧ (A ⟶ C) ⟷ (A ⟶ B ∧ C)"
  by blast

lemma "(A ⟶ (B ⟶ C)) ⟷ (B ⟶ (A ⟶ C))"
  by blast

lemma "(¬ fire ⟶ (opens ⟶ badge ∧ pin)) ⟷ (opens ⟶ badge ∧ pin ∨ fire)"
  by blast
```
:::
::::

:::: exercise 有效还是无效？ {#ex-2-4} ★★
把每个论证写成前提和结论，并判断它是否有效。对每个无效的论证，给出一个反例。然后在 Isabelle 中检查你的答案。

1. 如果缓存是热的，请求就很快。请求不快。所以缓存不是热的。
2. 如果输入合法，解析器就接受它。输入不合法。所以解析器不接受它。
3. 这个服务使用 TLS，或者运行在内部网络上。它没有运行在内部网络上。所以它使用 TLS。
4. 如果作业在夜间运行，它就会提早完成。如果它提早完成，报告就准备好了。报告准备好了。所以作业是在夜间运行的。

::: solution
1. `warm ⟶ fast`, `¬ fast` ⊨ `¬ warm`（`warm`、`fast` 分别表示缓存是热的、请求很快）：否定后件式，有效。
2. `ok ⟶ accepts`, `¬ ok` ⊨ `¬ accepts`（`ok` 表示“输入合法”，`accepts` 表示“解析器接受输入”）：否定前件，无效。反例：ok = F，accepts = T，即一个宽松的解析器接受了某个不合法的输入。
3. `tls ∨ internal`, `¬ internal` ⊨ `tls`（`tls`、`internal` 分别表示使用 TLS、运行在内部网络上）：析取三段论，有效。
4. `night ⟶ early`, `early ⟶ ready`, `ready` ⊨ `night`（`night`、`early`、`ready` 分别表示作业在夜间运行、提早完成、报告已准备好）：无效，这是肯定后件的一种形式。反例：night = F，ready = T；报告可能因为别的原因而准备好了。

```isabelle
lemma "(warm ⟶ fast) ∧ ¬ fast ⟶ ¬ warm"
  by blast

lemma "(ok ⟶ accepts) ∧ ¬ ok ⟶ ¬ accepts"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    accepts = True
    ok = False
```

```isabelle
lemma "(tls ∨ internal) ∧ ¬ internal ⟶ tls"
  by blast

lemma "(night ⟶ early) ∧ (early ⟶ ready) ∧ ready ⟶ night"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    early = False
    night = False
    ready = True
```
:::
::::

:::: exercise 范式 {#ex-2-5} ★★
把下面每个公式先化为否定范式，再化为合取范式和析取范式。在 Isabelle 中检查你的答案。

1. A ⟷ B
2. ¬(A ∨ B ⟶ C)

::: solution
1. 先消去 ⟷，再消去 ⟶：A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) ≡ (¬A ∨ B) ∧ (¬B ∨ A)。这是否定范式，而且已经是合取范式。要得到析取范式，就用分配律展开：(¬A ∧ ¬B) ∨ (¬A ∧ A) ∨ (B ∧ ¬B) ∨ (B ∧ A)。中间两个合取式是矛盾式，等价于 False，而 φ ∨ False ≡ φ，所以析取范式是 (¬A ∧ ¬B) ∨ (A ∧ B)。
2. 消去 ⟶，再把 ¬ 向内推：¬(A ∨ B ⟶ C) ≡ ¬(¬(A ∨ B) ∨ C) ≡ ¬¬(A ∨ B) ∧ ¬C ≡ (A ∨ B) ∧ ¬C。这是否定范式，也是合取范式（含两个子句）。再用分配律展开，就得到析取范式 (A ∧ ¬C) ∨ (B ∧ ¬C)。

```isabelle
lemma "(A ⟷ B) ⟷ (¬ A ∨ B) ∧ (¬ B ∨ A)"
  by blast

lemma "(A ⟷ B) ⟷ (¬ A ∧ ¬ B) ∨ (A ∧ B)"
  by blast

lemma "¬ (A ∨ B ⟶ C) ⟷ (A ∨ B) ∧ ¬ C"
  by blast

lemma "¬ (A ∨ B ⟶ C) ⟷ (A ∧ ¬ C) ∨ (B ∧ ¬ C)"
  by blast
```
:::
::::

:::: exercise 水泵控制器 {#ex-2-6} ★★
一台水泵给水箱注水。两个传感器分别报告 `low`（水位低于低水位线）和 `high`（水位高于高水位线）；一个开关选择 `manual`（手动）模式；控制器决定 `pump`（水泵运行）。需求如下：

- R1：如果水位低，并且处于自动模式，水泵就运行。
- R2：如果水位高，水泵就不运行。
- R3：在手动模式下，水泵运行。

1. 把这些需求写成公式，并用 Nitpick 表明它们是一致的。
2. 找出一个使它们相互冲突的情形，并在 Isabelle 中证明这个冲突。你会怎样修复这些需求？
3. 按你的修复，能推出“如果水位低，水泵就运行”吗？如果再加上“水位不可能既低又高”这个假设，能推出吗？

::: solution
1. R1 是 `low ∧ ¬ manual ⟶ pump`，R2 是 `high ⟶ ¬ pump`，R3 是 `manual ⟶ pump`。对它们的否定找到的反例，就是这三条需求的一个模型：

```isabelle
lemma "¬ ((low ∧ ¬ manual ⟶ pump) ∧
         (high ⟶ ¬ pump) ∧
         (manual ⟶ pump))"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    high = False
    low = False
    manual = False
    pump = True
```

   在自动模式下，水位在两条水位线之间时，水泵可以运行。

2. 在手动模式下水位高时，R3 说水泵运行，R2 说水泵不运行：

```isabelle
lemma "¬ ((low ∧ ¬ manual ⟶ pump) ∧
         (high ⟶ ¬ pump) ∧
         (manual ⟶ pump) ∧
         manual ∧ high)"
  by blast
```

   去问工程师哪条需求优先。防止水箱溢出很可能是他们的回答，于是 R3 变为 R3′：`manual ∧ ¬ high ⟶ pump`。

   还有第二个冲突，R3′ 并没有消除它：在自动模式下，如果传感器同时报告水位低和水位高，R1 说水泵运行，R2 说水泵不运行。正常工作的传感器绝不会同时报告这两者；第 3 小题会把这一点变成一个假设。

3. 仅凭这些需求推不出来。Nitpick 找到了这样一种情形：传感器同时报告水位低和水位高，处于手动模式，而水泵关着：

```isabelle
lemma "(low ∧ ¬ manual ⟶ pump) ∧
       (high ⟶ ¬ pump) ∧
       (manual ∧ ¬ high ⟶ pump)
       ⟶ (low ⟶ pump)"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    high = True
    low = True
    manual = True
    pump = False
```

   加上假设 `¬ (low ∧ high)` 之后，这条性质就能推出了。这个假设描述的是传感器（也就是环境），而不是控制器：

```isabelle
lemma "¬ (low ∧ high) ∧
       (low ∧ ¬ manual ⟶ pump) ∧
       (high ⟶ ¬ pump) ∧
       (manual ∧ ¬ high ⟶ pump)
       ⟶ (low ⟶ pump)"
  by blast
```

   关于环境的假设是规约的一部分：没有这些假设，一个正确的控制器也可能看起来是错的。
:::
::::

:::: exercise 两个联结词就够了 {#ex-2-7} ★★★
1. 证明每个公式都等价于一个只用 ⟶ 和 `False` 的公式：分别给出与 ¬A、A ∨ B、A ∧ B 和 A ⟷ B 等价的这样的公式，并在 Isabelle 中检查它们。为什么这样就涵盖了所有公式？
2. 证明只有 ∧ 和 ∨ 是不够的：只用 ∧ 和 ∨ 由原子构造的公式（不用 ¬、⟶、⟷、`True` 或 `False`）没有一个与 ¬A 等价。提示：当每个原子都为 T 时，这样的公式取什么值？

::: solution
1. 真值表表明 ¬A ≡ A ⟶ False。于是 A ∨ B ≡ ¬A ⟶ B ≡ (A ⟶ False) ⟶ B，而 A ∧ B ≡ ¬(A ⟶ ¬B) ≡ (A ⟶ B ⟶ False) ⟶ False。对于 ⟷，利用 A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) 和上面 ∧ 的公式：((A ⟶ B) ⟶ (B ⟶ A) ⟶ False) ⟶ False。

```isabelle
lemma "¬ A ⟷ (A ⟶ False)"
  by blast

lemma "A ∨ B ⟷ ((A ⟶ False) ⟶ B)"
  by blast

lemma "A ∧ B ⟷ ((A ⟶ B ⟶ False) ⟶ False)"
  by blast

lemma "(A ⟷ B) ⟷ (((A ⟶ B) ⟶ (B ⟶ A) ⟶ False) ⟶ False)"
  by blast
```

   这就涵盖了所有公式：由代入（事实 2.4），把 A 和 B 换成任意公式，这些等价式依然成立，所以你可以从里到外逐个替换联结词，而由置换，每一步得到的都是等价的公式。`True` 等价于 False ⟶ False。

2. 在使每个原子都为 T 的那个赋值下，只用 ∧ 和 ∨ 由原子构造的每个公式都为 T：在这个赋值下，原子都为 T；而如果 φ 和 ψ 为 T，那么 φ ∧ ψ 和 φ ∨ ψ 也为 T。由于这些公式由这些规则构造，而且只由这些规则构造（定义 2.3），所以每个这样的公式都为 T。但在这个赋值下 ¬A 为 F，所以它们之中没有一个与 ¬A 等价。这种沿着归纳定义的规则进行的论证叫做**结构归纳法**（structural induction）；模块 5 会正式讲解它。
:::
::::

:::: exercise 骑士与无赖 {#ex-2-8} ★★★
在一座岛上，骑士总是说真话，无赖总是说假话。你遇到两个岛民 P 和 Q。P 说：“Q 是无赖。”Q 说：“P 和我是同一类人。”用 `p` 表示“P 是骑士”，用 `q` 表示“Q 是骑士”。

1. 解释为什么 P 的话给出约束 p ⟷ ¬q，并把 Q 的话也写成一个约束。
2. 用 Nitpick 找出谁是骑士、谁是无赖。
3. 在 Isabelle 中证明这是唯一的解。

::: solution
1. 如果 P 是骑士，P 说的话为真；如果 P 是无赖，P 说的话为假。所以“P 说 S”意味着 p ⟷ S。P 说的是 ¬q，于是得到 p ⟷ ¬q。Q 说 P 和 Q 是同一类人，即 p ⟷ q，于是得到 q ⟷ (p ⟷ q)。
2. 对约束的否定找到的反例，就是约束的一个模型：

```isabelle
lemma "¬ ((p ⟷ ¬ q) ∧ (q ⟷ (p ⟷ q)))"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    p = True
    q = False
```

   P 是骑士，Q 是无赖。验证一下：P 如实地说 Q 是无赖，而 Q 谎称他们两人是同一类人。

3. 由这些约束可以推出这个解：

```isabelle
lemma "(p ⟷ ¬ q) ∧ (q ⟷ (p ⟷ q)) ⟶ p ∧ ¬ q"
  by blast
```

   单是 Q 的约束就已经迫使 p 为真：q ⟷ (p ⟷ q) 等价于 p。如果 p 为真，p ⟷ q 与 q 的值相同，所以这个约束为真；如果 p 为假，p ⟷ q 与 q 的值相反，所以这个约束为假。p 为真时，P 的约束 p ⟷ ¬q 使 q 为假。
:::
::::

## 自测题 {#quiz}

```quiz
? Isabelle 怎样读 ¬A ∧ B ⟶ C？
- [ ] ¬(A ∧ B ⟶ C)
- [x] ((¬A) ∧ B) ⟶ C
- [ ] (¬A) ∧ (B ⟶ C)
- [ ] (¬(A ∧ B)) ⟶ C
> ¬ 结合得最紧，其次是 ∧，然后是 ⟶。所以 ¬ 只作用于 A，∧ 连接 ¬A 和 B，而 ⟶ 是主联结词。

? A ⟶ B 什么时候为假？
- [ ] A 为假时
- [ ] A 和 B 都为假时
- [ ] B 为真而 A 为假时
- [x] 只有在 A 为真而 B 为假时
> 只有当前件成立而后件不成立时，蕴涵式才被违背。A 为假时，A ⟶ B 为空真。

? 公式 φ 和它的否定 ¬φ 都是可满足的。φ 属于哪一类？
- [x] 可满足但非有效：在一些行中为真，在另一些行中为假
- [ ] 重言式
- [ ] 矛盾式
- [ ] 不可能出现这种情况
> φ 可满足，说明有某一行使 φ 为真；¬φ 可满足，说明有某一行使 φ 为假。所以 φ 既不是重言式，也不是矛盾式。

? 哪种论证形式是无效的？
- [ ] 由 A ⟶ B 和 A，推出 B
- [ ] 由 A ⟶ B 和 ¬B，推出 ¬A
- [x] 由 A ⟶ B 和 B，推出 A
- [ ] 由 A ∨ B 和 ¬A，推出 B
> 这是肯定后件。在 A = F、B = T 这一行中，两个前提都为真，而结论为假。

? 在一条关于命题公式的引理上，`by simp` 失败了。你能得出什么结论？
- [ ] 这个公式不是重言式
- [x] 暂时什么也得不出：试试 `blast` 或 `auto`，或者用 `quickcheck` 或 `nitpick` 找反例
- [ ] 这个公式是矛盾式
- [ ] Isabelle 处理不了命题公式
> 证明失败不等于找到了反例：`simp` 在皮尔士定律上就会失败，而皮尔士定律是重言式。只有成功的证明或者反例才能给问题下定论。

? Nitpick 为 ¬(R1 ∧ R2 ∧ R3) 找到了一个反例。这说明了什么？
- [ ] R1 ∧ R2 ∧ R3 是重言式
- [ ] 这些需求是不一致的
- [ ] 其中某条需求是错的
- [x] 这些需求是一致的：这个反例满足全部三条需求
> ¬(R1 ∧ R2 ∧ R3) 的反例使这个否定式为假，因而使 R1 ∧ R2 ∧ R3 为真。它是这些需求的一个模型，表明它们可以同时成立。
```
