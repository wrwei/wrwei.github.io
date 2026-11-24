---
title: 集合、关系与函数
part: 1
lead: 用集合描述对象的汇集，用关系表示元素之间的联系，找出系统可达的状态，用函数比较集合的大小。通过 Isabelle 检查过的例子和证明，理解为什么有些无限集比另一些更大。
minutes: 210
needs: 模块 1–3
goals:
  - 用列举法和描述法表示集合，并把集合定律转化为命题逻辑来证明它们
  - 判断一个关系是否自反、对称、反对称、传递或完全，并在性质不成立时给出见证
  - 认出等价关系及其划分、偏序及其哈斯图，以及良基关系
  - 计算关系的闭包，并用闭包找出一个系统能够到达的状态
  - 判断函数是单射、满射还是双射，并用函数比较集合的大小
  - 解释鸽巢原理和康托尔的对角线论证，并在 Isabelle 中检验两者
imports: Main
---

## 集合 {#sets}

规约时时刻刻都在谈论一组组的事物：可以读某个文件的用户，系统能够到达的状态，正在传输中的消息。数学用一个概念涵盖了所有这些，这就是**集合**（set）；许多规约语言都建立在它之上：Z 和 B 建立在集合论之上，Alloy 建立在关系之上，TLA+ 建立在集合和函数之上。本模块一层一层地搭建这套词汇：先是集合，然后是把元素联系起来的**关系**（relation），再是**函数**（function），最后是集合的大小。一切都建立在模块 2 和模块 3 的逻辑之上；你会看到，集合的定律其实是改头换面的逻辑定律。想在数学上多做些练习，请参阅数学基础系列中的[集合、关系与离散结构](../math/module_03_ZH.html)。

### 元素与描述法 {#sets-notation}

集合是由其**elements**组成的集合，完全由属于它的元素决定。$x \in A$读作“x是A的元素”或“x在A中”；$x \notin A$读作“x不在A中”，是$\lnot (x \in A)$的缩写。

描述一个集合有两种方式。**列举法**（listing）在花括号中列出它的元素：$\{2, 3, 5, 7\}$。**描述法**（set-builder notation）用一个性质来描述它的元素：$\{x.\; P\,x\}$ 读作“所有使 P x 成立的 x 组成的集合”。小于 10 的素数组成集合 $\{x.\; x \text{ 是素数} \land x < 10\}$，它也就是 $\{2, 3, 5, 7\}$。许多书写作 $\{x \mid P(x)\}$；本系列和 Isabelle 一样，写作 $\{x.\; P\,x\}$。一种常见的变体从一个给定的集合中取元素：$\{x \in A.\; P\,x\}$ 的意思是 $\{x.\; x \in A \land P\,x\}$。

描述法把集合和模块 3 的谓词（predicate）联系了起来。一个东西属于 $\{x.\; P\,x\}$，恰好是在它具有性质 $P$ 的时候：

$$
a \in \{x.\; P\,x\} \iff P\,a
$$

所以，一个集合和一个谓词携带的是同样的信息。在 Isabelle/HOL 中，由某个类型的元素组成的集合，实际上就是这个类型上的一个谓词。

::: definition 集合
**集合**是由元素组成的整体；$x \in A$ 表示 $x$ 是 $A$ 的元素。集合可以用**列举法**给出，例如 $\{1, 2, 3\}$；也可以用**描述法** $\{x.\; P\,x\}$ 给出，它表示所有使 $P\,x$ 成立的 $x$ 组成的集合。在 Isabelle/HOL 中，每个集合都有一个元素类型：自然数集合的类型是 `nat set`，它的元素全都是自然数。
:::

两个集合什么时候相等？在它们有相同的元素时。别的都不算数：既不看你按什么顺序列出元素，也不看你怎样描述它们。

::: definition 外延性
两个集合有相同的元素时，它们就**相等**：

$$
A = B \iff (\forall x.\; x \in A \iff x \in B)
$$
:::

所以 $\{1, 2, 3\} = \{3, 1, 2\} = \{1, 1, 2, 3\}$，并且 $\{x.\; x \in \Z \land x^2 = 1\} = \{-1, 1\}$。

::: definition 子集、空集、全集
如果 $A$ 的每个元素都是 $B$ 的元素，即 $\forall x.\; x \in A \imp x \in B$，就说 $A$ 是 $B$ 的**子集**（subset），记作 $A \subseteq B$。如果还有 $A \neq B$，$A$ 就是 $B$ 的**真子集**（proper subset），记作 $A \subset B$。**空集**（empty set）$\emptyset$ 没有元素；Isabelle 把它写作 `{}`。**全集**（universe）包含该类型的每一个元素；Isabelle 把它叫做 `UNIV`。
:::

::: fact 子集与相等
对所有集合 $A$ 和 $B$：

1. $\emptyset \subseteq A$，并且 $A \subseteq A$。
2. $A = B \iff A \subseteq B \land B \subseteq A$。
:::

先看第一条。对每个 $x$，$x \in \emptyset$ 都为假，所以 $x \in \emptyset \imp x \in A$ 是空真的（vacuously true，见模块 2）；本模块还会再遇到空真。而无论 $x$ 是什么，$x \in A \imp x \in A$ 都成立。第二条把外延性（extensionality）和定律 $(p \iff q) \iff (p \imp q) \land (q \imp p)$ 结合了起来。它也是证明两个集合相等的常用方法：证明每一个都是另一个的子集。

由于 HOL 是有类型的（模块 3），全集总是某一个类型的全集：`UNIV :: bool set` 是 $\{\mathit{True}, \mathit{False}\}$，而 `UNIV :: nat set` 包含所有自然数。不存在包含一切东西的集合，第 4.7 节会说明这为什么是件好事。

::: example 谁能做什么
一台文件服务器有用户 alice、bob、carol 和 dave。能读某个文件的用户组成集合 $R = \{\mathit{alice}, \mathit{bob}, \mathit{carol}\}$，能写这个文件的用户组成 $W = \{\mathit{bob}, \mathit{dave}\}$，管理员组成 $D = \{\mathit{bob}\}$。于是 $D \subseteq W$ 成立：每个管理员都能写。策略“能写的人必须也能读”就是陈述 $W \subseteq R$，而它被违反了，见证（witness）是 dave：$\mathit{dave} \in W$，但 $\mathit{dave} \notin R$。
:::

::: pitfall
分清 $\in$ 和 $\subseteq$。$1 \in \{1, 2\}$ 说的是一个元素，$\{1\} \subseteq \{1, 2\}$ 说的是一个集合，两者都为真。在 HOL 中，$\{1\} \in \{1, 2\}$ 甚至谈不上为假：它是一个类型错误，因为 $\{1, 2\}$ 的元素是数，而 $\{1\}$ 是一个集合。同样，$\emptyset$ 和 $\{\emptyset\}$ 也不相同：前者没有元素，后者有一个元素。
:::

### 集合的运算 {#sets-ops}

集合的每一种运算，都是把某个逻辑联结词用在元素的属于关系上。

::: definition 并集、交集、差集、补集
$$
\begin{aligned}
A \cup B &= \{x.\; x \in A \lor x \in B\} && \text{并集}\\
A \cap B &= \{x.\; x \in A \land x \in B\} && \text{交集}\\
A - B &= \{x.\; x \in A \land x \notin B\} && \text{差集}\\
-A &= \{x.\; x \notin A\} && \text{补集}
\end{aligned}
$$

当 $A \cap B = \emptyset$ 时，称 $A$ 和 $B$ **不相交**（disjoint）。Isabelle 写作 `A ∪ B`、`A ∩ B`、`A - B` 和 `- A`。
:::

这四种运算分别是**并集**（union）、**交集**（intersection）、**差集**（difference）和**补集**（complement），读作“A 并 B”“A 交 B”“A 减 B”和“A 的补集”。补集包含该类型中不属于 $A$ 的一切元素。图 4.1 画出了这四种运算。

::: figure id=fig-04-1
用维恩图（Venn diagram）表示的四种运算。矩形是全集，每个圆是一个集合，阴影区域是运算的结果。每个图下面写着这个区域所代表的、关于 $x$ 的条件。
:::

在那台文件服务器上，$R \cap W = \{\mathit{bob}\}$ 既能读也能写，$R - W$（alice 和 carol）只能读，而 $W - R = \{\mathit{dave}\}$ 正是违反策略的那个用户。

::: definition 幂集
集合 $A$ 的**幂集**（power set）$\pow(A)$ 是由 $A$ 的所有子集组成的集合：$\pow(A) = \{B.\; B \subseteq A\}$。Isabelle 写作 `Pow A`。
:::

$\pow(\{1, 2, 3\})$ 有八个元素：$\emptyset$、$\{1\}$、$\{2\}$、$\{3\}$、$\{1, 2\}$、$\{1, 3\}$、$\{2, 3\}$ 和 $\{1, 2, 3\}$。选出一个子集，就是对每个元素决定它是选进来还是留在外面，所以 $n$ 个元素的集合有 $2^n$ 个子集。幂集增长得很快：一个有四十个可开可关的功能开关（feature flag）的程序有 $2^{40}$ 种配置，超过一万亿种，每一种对应这些开关的一个子集。

### 集合定律是伪装起来的逻辑 {#sets-laws}

由于每个操作均由联结词定义，联结词的每条定律（Module 2）都对应一条集合定律。表格中的每条定律也都有其**对偶**，其中$\cup$与$\cap$互换（以及$\emptyset$与$\mathit{UNIV}$），该对偶定律同样成立。

| 名称 | 集合律 | 背后的逻辑定律 |
|---|---|---|
| 交换律 | $A \cup B = B \cup A$ | $p \lor q \iff q \lor p$ |
| 结合律 | $A \cap (B \cap C) = (A \cap B) \cap C$ | $p \land (q \land r) \iff (p \land q) \land r$ |
| 分配律 | $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$ | $p \land (q \lor r) \iff (p \land q) \lor (p \land r)$ |
| 德摩根 | $-(A \cup B) = -A \cap -B$ | $\lnot (p \lor q) \iff \lnot p \land \lnot q$ |
| 身份 | $A \cup \emptyset = A$ | $p \lor \mathit{False} \iff p$ |
| 补集 | $A \cup -A = \mathit{UNIV}$ | $p \lor \lnot p \iff \mathit{True}$ |
| 双补集 | $-(-A) = A$ | $\lnot \lnot p \iff p$ |
| 吸收 | $A \cup (A \cap B) = A$ | $p \lor (p \land q) \iff p$ |

::: fact 由命题定律推导集合定律
将关于由$\cup$、$\cap$、$-$及补集构成的集合的等式规约为命题逻辑：将每个集合$A$替换为表示“$x \in A$”的命题$p_A$，将$\cup$替换为$\lor$，将$\cap$替换为$\land$，将$A - B$替换为$p_A \land \lnot p_B$，将补集替换为$\lnot$，将$\emptyset$替换为$\mathit{False}$，将$\mathit{UNIV}$替换为$\mathit{True}$。该等式对所有集合成立，当且仅当两个公式等价，即当且仅当它们的双条件式是重言式。
:::

若公式等价，则每个$x$在左集中当且仅当其在右集中，外延性使集合相等；若不等价，真值表存在使二者不同的行：将单个元素$x$精确放入命题在该行为真的那些集合，则$x$在一侧而不在另一侧，故反例行即为含单元素的反例。

::: example 分配律，逐步
为证明$A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$，取任意$x$并重写其成员关系：

$$
\begin{aligned}
x \in A \cap (B \cup C)
  &\iff x \in A \land (x \in B \lor x \in C) && \text{definitions of } \cap \text{ and } \cup\\
  &\iff (x \in A \land x \in B) \lor (x \in A \land x \in C) && \text{distributivity of } \land \text{ over } \lor\\
  &\iff x \in (A \cap B) \cup (A \cap C) && \text{definitions of } \cap \text{ and } \cup
\end{aligned}
$$

这对每个$x$都成立，因此由外延性可知集合相等。中间步骤是唯一实质性的工作，且为命题逻辑。将$A$、$B$和$C$分别写为“$x \in A$”、“$x \in B$”和“$x \in C$”，build 通过真值表检查它：

```truthtable
A ∧ (B ∨ C) ⟷ A ∧ B ∨ A ∧ C
A ∧ (B ∨ C)
A ∧ B ∨ A ∧ C
```

Venn 图中每个区域对应一行：$A$ 和 $C$ 为真且 $B$ 为假的行是 $A$ 和 $C$ 中但不在 $B$ 中的元素区域。重言式表明两侧在每个区域上保持一致。
:::

::: example 一条失败的定律
$A - (B - C) = (A - B) - C$ 成立吗？分别写出等号两边的含义：

```truthtable
A ∧ ¬(B ∧ ¬C) ⟷ A ∧ ¬B ∧ ¬C
A ∧ ¬(B ∧ ¬C)
A ∧ ¬B ∧ ¬C
```

在$A$和$C$为真的两行中公式不同。取$B$为假的那一行：存在元素$x$属于$A$和$C$但不属于$B$。结合$A = \{x\}$、$B = \emptyset$和$C = \{x\}$，左侧为$\{x\} - (\emptyset - \{x\}) = \{x\}$，右侧为$(\{x\} - \emptyset) - \{x\} = \emptyset$。集合差运算，如同数的减法，不满足结合律。
:::

### Isabelle 中的集合 {#sets-isabelle}

::: isabelle
使用反斜杠后跟符号名称，或表格中的缩写输入新符号。差集与补集使用普通减号 `-`。

| 符号 | 类型 | 含义 |
|---|---|---|
| ∈ | `\in` or `:` | is an element of |
| ∉ | `\notin` or `~:` | 不是其中的元素 |
| ⊆ | `\subseteq` or `(=` | is a subset of |
| ∪ | `\union` or `Un` | union |
| ∩ | `\inter` or `Int` | 交集 |

`value` 使用有限集进行计算，如 Module 1 中所示：

```isabelle
value "{1, 2, 3} ∪ {3, 4 :: nat}"
```

```output
"{2, 1, 3, 4}"
  :: "nat set"
```

一个注解`:: nat`固定了整个表达式的元素类型。Isabelle 以计算产生的任意顺序列出元素；由外延性可知顺序无关紧要。当元素来自有限集时，集合构建符号有效。`{0..10}` 是 0 到 10 的数字集合，`mod` 给出了余数：

```isabelle
value "{x ∈ {0..10}. x mod 3 = (0::nat)}"
```

```output
"{0, 3, 6, 9}"
  :: "nat set"
```

数字集合的幂集是数字集合的集合，一个 `nat set set`：

```isabelle
value "Pow {1, 2, 3 :: nat}"
```

```output
"{{2, 3}, {2}, {}, {3}, {1, 3}, {1}, {1, 2}, {1, 2, 3}}"
  :: "nat set set"
```

混淆 $\in$ 和 $\subseteq$ 是一个类型错误，正如上述陷阱所述：

```isabelle fails
value "{1} ∈ {1, 2 :: nat}"
```

```output
*** Type unification failed: Clash of types "nat" and "_ set"
***
*** Type error in application: incompatible operand type
***
*** Operator:  (∈) {1} :: ??'a set set ⇒ bool
*** Operand:   {1, 2} :: nat set
***
```

运算符 `(∈) {1}`（“{1} 是否为 … 的元素”）需要一个集合的集合 `??'a set set`；操作数是一个数字集合。根据含义写出 `{1} ⊆ {1, 2}` 或 `1 ∈ {1, 2}`。

现在证明一条定律。陈述它：

```isabelle
lemma "A ∩ (B ∪ C) = A ∩ B ∪ A ∩ C"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∩ (B ∪ C) = A ∩ B ∪ A ∩ C
```

Isabelle 打印 `A ∩ B ∪ A ∩ C` 时不加括号，因为 $\cap$ 的结合力比 $\cup$ 更强，正如 $\land$ 的结合力比 $\lor$ 更强。`A`、`B` 和 `C` 是自由变元，因此该引理声称对所有集合（Module 3）成立的定律。证明它：

```isabelle
  by auto
```

`auto` 实现了论文证明的功能：它应用外延性，将每个成员关系替换为其定义，并通过命题推理完成。`blast` 同样有效；在集合上，这两者是常用工具。

```isabelle
lemma "- (A ∪ B) = - A ∩ - B"
  by auto

lemma "x ∈ {y. P y} ⟷ P x"
  by simp
```

假定律不可证，但 Nitpick (Module 2) 找到反例。选项 `card 'a = 1` 使其搜索含一个元素的论域，这已足够，如上所示：

```isabelle
lemma "A - (B - C) = (A - B) - (C :: 'a set)"
  nitpick [card 'a = 1]
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 1:
  Free variables:
    A = {a⇩1}
    B = {}
    C = {a⇩1}
```

反例是上述真值表的行：a₁ 在 `A` 和 `C` 中但不在 `B` 中。Isabelle/jEdit 的自动 Quickcheck 可能在您输入该引理时立即标记它。
:::

::: pitfall
这里的类型注解 `(C :: 'a set)` 很重要。上述运算中，只有 `-` 也用于其他类型。省略注解后，Isabelle 会把这个引理理解为关于一般减法的命题。Nitpick 找到了一个反例，其中 `A`、`B` 和 `C` 都不是集合，并指出了可能的原因：

```isabelle
lemma "A - (B - C) = A - B - C"
  nitpick [card 'a = 2]
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    A = a⇩1
    B = a⇩1
    C = a⇩1

Hint: Maybe you forgot a type constraint?
```

`∪`、`∩`、`⊆` 和 `∈` 仅适用于集合，因此使用其中之一的引理无需注解。
:::

::: trouble
- **`Clash of types "nat" and "bool"` 使用集合构建符号表示。** 在 Isabelle 中，`|` 是一种输入方式
  $\lor$，因此书中符号$\{x \mid x < 5\}$不适用：

  ```isabelle fails
  value "{x | x < (5::nat)}"
  ```

  ```output
  *** Type unification failed: Clash of types "nat" and "bool"
  ***
  *** Type error in application: incompatible operand type
  ***
  *** Operator:  (<) x :: bool ⇒ bool
  *** Operand:   5 :: nat
  ***
  ```

  Isabelle 读取了仅含元素 `x ∨ x < 5` 的集合，因此 `x` 必须同时是布尔值和数值。请写作 `{x. x < 5}`，并加上句点。
- **从 `value` 收到 `Wellsortedness error` … `not of sort enum`。** `value` 无法计算
  `{x. x < (5::nat)}` 使用此表示法：求值器没有有限列表可供搜索。从有限集中取元素，如 `{x ∈ {0..10}. x < 5}` 所示。问题在于可执行表示法和代码方程，而非禁止对无限集进行推理。例如，某些无限集中的成员资格是可计算的，尽管列出每个元素并非如此。
:::

## 关系 {#relations}

集合说明存在哪些事物。一个**关系**说明它们如何连接：哪个用户拥有哪个角色，哪个函数调用哪个，系统的哪个状态可以跟随哪个状态。

### 对与积 {#products}

一个**有序对** $(a, b)$ 具有第一个分量 $a$ 和第二个分量 $b$。与集合不同，对具有顺序：$(1, 2) \neq (2, 1)$，尽管 $\{1, 2\} = \{2, 1\}$。当它们的分量相同时，两个对相等：$(a, b) = (c, d) \iff a = c \land b = d$。在 Isabelle 中，对 `(a, b)` 具有类型，例如 `nat × string`，读作“nat times string”。

::: definition 笛卡尔积
**笛卡尔积**是$A$和$B$的集合，由所有第一个分量在$A$中且第二个分量在$B$中的对组成：

$$
A \times B = \{(a, b).\; a \in A \land b \in B\}
$$
:::

例如，$\{1, 2\} \times \{x, y\} = \{(1, x), (1, y), (2, x), (2, y)\}$. 有限集的笛卡尔积有 $|A| \cdot |B|$ 个元素，其中 $|A|$ 是 $A$ 的元素数量。具有 name 和 age 列的数据库表是 $\mathit{Names} \times \mathit{Ages}$ 的子集。

### 关系作为有序对的集合 {#rel-def}

::: definition 关系
A (binary) **关系**从$A$到$B$是一个子集$R \subseteq A \times B$；**在**上的关系$A$是$A \times A$的子集。除了$(x, y) \in R$，也写作$x \mathrel{R} y$，“x 通过 R 与 y 相关”。在 Isabelle 中，类型为`'a`上的关系具有类型`'a rel`，是`('a × 'a) set`的缩写。
:::

关系不过是相关对的集合。$<$上的顺序$\{1, 2, 3\}$是集合$\{(1, 2), (1, 3), (2, 3)\}$。$A$上的相等性是**恒等关系**$\mathit{Id}_A = \{(x, x).\; x \in A\}$。“函数$f$调用函数$g$”是程序的**调用图**，“系统可以从状态$s$一步转移到状态$t$”是其**转移关系**（第4.5节）。

小型有限集上的关系可画为**有向图**。对每个有序对 $(x, y)$，从 $x$ 向 $y$ 画一条箭头，对 $(x, x)$ 则在 $x$ 处画自环。也可用**矩阵**表示，在每对元素对应的第 $x$ 行、第 $y$ 列作标记。下面的交互演示展示这两种表示。

### 关系性质 {#rel-props}

六个性质反复出现。它们使用**有界量词** $\forall x \in A.\; P\,x$，“对于所有 x 属于 A，P x”，其含义为$\forall x.\; x \in A \imp P\,x$。

::: definition 关系性质
$A$ 上的关系 $R$ 是

$$
\begin{aligned}
&\textbf{reflexive} \text{ on } A && \text{if } \forall x \in A.\; (x, x) \in R\\
&\textbf{irreflexive} \text{ on } A && \text{if } \forall x \in A.\; (x, x) \notin R\\
&\textbf{symmetric} && \text{if } \forall x\, y.\; (x, y) \in R \imp (y, x) \in R\\
&\textbf{antisymmetric} && \text{if } \forall x\, y.\; (x, y) \in R \land (y, x) \in R \imp x = y\\
&\textbf{transitive} && \text{if } \forall x\, y\, z.\; (x, y) \in R \land (y, z) \in R \imp (x, z) \in R\\
&\textbf{total} \text{ on } A && \text{if } \forall x \in A.\; \forall y \in A.\; x \neq y \imp (x, y) \in R \lor (y, x) \in R
\end{aligned}
$$
:::

在图中，每个性质都有一个形状，你可以通过目视检查来验证：

| 性质 | 在图中 |
|---|---|
| 自反性 | 在每个节点处存在一个循环 |
| Irreflexive | 完全没有循环 |
| 对称 | 每个箭头都有一个反向的伙伴 |
| 反自反 | 不同节点之间不存在双向箭头对 |
| 传递性 | 每个包含两个箭头的路径 $x \to y \to z$ 都存在一个捷径 $x \to z$ |
| 总览 | 任意两个不同的节点之间至少在一个方向上由箭头连接 |

一些书籍要求$x = y$也具有全性；本系列遵循Isabelle的做法，仅要求不同元素具有全性，因此$<$被视为全的。要证明某性质成立，需检查所有情况；要证明其不成立，一个**witness**即可。每个性质都是一个$\forall$-语句，根据模块3的定律$\lnot (\forall x.\; P\,x) \iff (\exists x.\; \lnot P\,x)$，当且仅当某个实例不成立时，该性质不成立。反对传递性的见证是一个三元组$x, y, z$，其中$(x, y)$和$(y, z)$属于$R$，但$(x, z)$不属于。

::: example {1, 2, 3}上的三个关系
1. $\le$，即 $\{(1,1),\allowbreak (2,2),\allowbreak (3,3),\allowbreak (1,2),\allowbreak (1,3),\allowbreak (2,3)\}$，是自反的、反对称的、
   传递且全序。它不是对称的：$(1, 2)$ 在其中而 $(2, 1)$ 不在。
2. “少一”，$\{(1, 2), (2, 3)\}$，是非自反且反对称的。它不具有传递性：
   $(1, 2)$ 和 $(1, 3)$ 在 it 中，但 $(2, 3)$ 不在。它也不是全的：$(1, 3)$ 和 $(3, 1)$ 都不在 it 中。
3. “具有相同奇偶性”，$\{(1,1), (2,2), (3,3), (1,3), (3,1)\}$，是自反、对称且
   传递性。它不是反对称的：$(1, 3)$ 和 $(3, 1)$ 在其中，但 $1 \neq 3$ 不在。
:::

::: pitfall
- **反对称性并非“非对称性”。**等式关系同时具备对称性与反对称性；
  $\{(1, 2), (2, 1), (1, 3)\}$ 亦非如此。类似地，$\{(1, 1)\}$ 在 $\{1, 2\}$ 上既非自反亦非非自反。
- **空真。** 空关系是对称、反对称和传递的：这些性质
  这些是前提永远不成立的蕴含式。
- **传递性包含$x = z$的情况。**$\{(1, 2), (2, 1)\}$不是传递的：$(1, 2)$和
  $(2, 1)$ demand $(1, 1)$.
:::

::: widget name=relation-explorer
点击网格单元格以添加或移除对；图与性质随点击更新，每个失败的性质均有见证。加载 **Cycle**：哪些性质失败，原因何在？随后添加传递闭包（第 4.5 节）并观察其添加了哪些对。能否构造一个对称且反对称但非空的二元关系？
:::

### 复合与逆 {#rel-ops}

::: definition 逆、复合与像
**逆**（或反函数）$R$反转每对元素：$R^{-1} = \{(y, x).\; (x, y) \in R\}$。**复合**$R$与$S$取一个$R$步后接一个$S$步：

$$
R \mathbin{O} S = \{(x, z).\; \exists y.\; (x, y) \in R \land (y, z) \in S\}
$$

集合$X$在$R$下的**image**是$R[X] = \{y.\; \exists x \in X.\; (x, y) \in R\}$，即与$X$中元素相关的所有元素组成的集合。Isabelle 使用`r¯`（类型`^-1`）、`r O s`和两个反引号表示image```r `` X```。
:::

$<$的逆是$>$，且“is a parent of”的逆是“is a child of”；在图中，它将每条箭头反向。“is a parent of”与自身的复合得到“is a grandparent of”。书籍也使用$R \mathbin{;} S$表示复合，或类比函数使用$S \circ R$（第4.6节），这会反转顺序；Isabelle的$R \mathbin{O} S$从左到右读取。

::: example 角色与权限
许多系统为用户分配角色，并为这些角色分配权限；这是**基于角色的访问控制**。与

$$
\begin{aligned}
\mathit{UR} &= \{(\mathit{alice}, \mathit{admin}), (\mathit{bob}, \mathit{guest})\}\\
\mathit{RP} &= \{(\mathit{admin}, \mathit{read}), (\mathit{admin}, \mathit{write}), (\mathit{guest}, \mathit{read})\}
\end{aligned}
$$

用户的权限是组合 $\mathit{UR} \mathbin{O} \mathit{RP}$，它将 alice 关联到读写，将 bob 关联到读。
:::

::: fact 性质作为等式
对于关系 $R$、$S$ 和 $T$：

1. $(R \mathbin{O} S) \mathbin{O} T = R \mathbin{O} (S \mathbin{O} T)$ 且
   $(R \mathbin{O} S)^{-1} = S^{-1} \mathbin{O} R^{-1}$.
2. $R$ 当且仅当 $R^{-1} = R$ 时是对称的。
3. $R$ 当且仅当 $R \mathbin{O} R \subseteq R$ 时具有传递性。
4. $R$ 在 $A$ 上自反当且仅当 $\mathit{Id}_A \subseteq R$。
:::

取第三条。$R \mathbin{O} R \subseteq R$ 表明，每当某个 $y$ 具有 $(x, y) \in R$ 和 $(y, z) \in R$，则 $(x, z) \in R$ 成立。即具有传递性，其中 $\exists y$ 通过 Module 3 的定律 $((\exists y.\; P\,y) \imp Q) \iff (\forall y.\; P\,y \imp Q)$ 从前提中提取出来。

::: isabelle
Isabelle 中的字符串由两对单引号书写，`''alice''`；其类型打印为 `char list`，即字符列表。乘积需要 `×`（类型 `\times` 或 `<*>`）：

```isabelle
value "{1, 2 :: nat} × {''x'', ''y''}"
```

```output
"{(1, ''x''), (1, ''y''), (2, ''x''), (2, ''y'')}"
  :: "(nat × char list) set"
```

Isabelle 将六个性质命名为 `refl_on A r`, `irrefl_on A r`, `sym_on A r`, `antisym_on A r`, `trans_on A r` 和 `total_on A r`，其中 `A` 是关系所在的集合。若如 `refl r`, `sym r` 和 `trans r` 所示，缺少 `_on` 和该集合，则它们针对整个类型进行论述。对于有限关系，`value` 可判定它们：

```isabelle
value "refl_on {1, 2, 3} {(1::nat, 1), (2, 2), (1, 2)}"
value "trans_on {1, 2, 3} {(1::nat, 2), (2, 3)}"
value "trans_on {1, 2, 3} {(1::nat, 2), (2, 3), (1, 3)}"
```

```output all
"False"
  :: "bool"

"False"
  :: "bool"

"True"
  :: "bool"
```

第一个关系缺少 `(3, 3)`，第二个关系缺少第三个关系中的捷径 `(1, 3)`。Isabelle 也可以计算关系的复合，引号内可以换行：

```isabelle
value "{(''alice'', ''admin''), (''bob'', ''guest'')}
     O {(''admin'', ''read''), (''admin'', ''write''), (''guest'', ''read'')}"
```

```output
"{(''alice'', ''read''), (''alice'', ''write''), (''bob'', ''read'')}"
  :: "(char list × char list) set"
```

要证明上述性质对任意关系都成立，`auto` 需要看到 `trans` 和 `sym` 的定义。它不会自行用 `trans r` 的定义替换这个符号。库中分别用定理 `trans_def` 和 `sym_def` 表达定义。`auto simp: trans_def` 把其中一个交给 `auto`，于是它把 `trans r` 重写成定义中的全称公式，再像前面那样完成其余证明。模块 9 会详解这个过程。

```isabelle
lemma "trans r ⟷ r O r ⊆ r"
  by (auto simp: trans_def)

lemma "sym r ⟷ r¯ = r"
  by (auto simp: sym_def)

lemma "(r O s)¯ = s¯ O r¯"
  by auto
```
:::

## 等价关系与划分 {#equivalence}

规范通常仅关注某些细节之上的事物：两个账号可能属于同一客户，两个输入可能需要被同等对待，两个时间可能显示时钟上的同一位置。“具有与…相同”的关系共享三个性质。

::: definition 等价关系与等价类
在$A$上的**等价关系**是$A$上的关系，它在$A$上自反、对称且传递。$x \in A$的**等价类**是与它相关的元素集合，即$\{x\}$的像：

$$
[x] = R[\{x\}] = \{y.\; (x, y) \in R\}
$$
:::

::: example 余数
在 $\{0, 1, \dots, 8\}$ 上，当 $x \bmod 3 = y \bmod 3$ 时定义 $x \sim y$。这表示 $x$ 和 $y$ 除以 3 的余数相同。每个数与自身的余数相同，「相同」不分先后，而且两个相等关系可接续，因此这是一种等价关系。它的等价类为

$$
[0] = \{0, 3, 6\} \qquad [1] = \{1, 4, 7\} \qquad [2] = \{2, 5, 8\}
$$

一个类有许多名称，$[4] = [1] = [7]$：类的任何元素都可以**表示**它。
:::

这些类互不重叠，且共同覆盖该集合。这并非偶然。

::: definition 分区
集合 $A$ 的一个**划分**由 $A$ 的若干非空子集组成，这些子集称为**块**。$A$ 的每个元素恰好属于一块。也就是说，各块两两不交，其并集为 $A$。
:::

::: fact 等价关系与划分
$A$上的等价关系的等价类构成$A$的一个划分。反之，$A$的每个划分定义了一个等价关系“在同一块中”，其等价类即为这些块。
:::

以下是前半部分的证明。类是 $A$ 的子集，因为 $R$ 是定义在 $A$ 上的关系。自反性将每个 $x$ 放入其自身的类中，因此类是非空的且覆盖 $A$。剩下的工作是证明两个相交的类相等。假设 $z$ 既在 $[x]$ 中又在 $[y]$ 中，这意味着 $(x, z) \in R$ 和 $(y, z) \in R$。由对称性得 $(z, y) \in R$，由传递性得 $(x, y) \in R$。现在，对于任意 $w \in [y]$，传递性将 $(x, y)$ 和 $(y, w)$ 转化为 $(x, w)$，从而得到 $w \in [x]$。因此有 $[y] \subseteq [x]$；将 $x$ 和 $y$ 交换后的相同论证给出 $[x] \subseteq [y]$，且事实 4.1 给出 $[x] = [y]$。对于后半部分：每个元素都在某个块中（自反性），表述是对称的，且共享一个元素的两个块是同一个块（传递性）。

等价关系出现在软件忽略细节的任何地方。**等价类划分**是一种标准的测试设计方法，它将输入划分为程序应同等对待的类（重量不超过 1 千克、不超过 5 千克、更重），并对每个类测试一个代表值以及边界。对于任何函数 $f$，“在 $f$ 下具有相同的值”是一个等价关系。在 Module 12 中，$f$ 是一个抽象函数，它将每个数据结构映射到其表示的抽象值：表示相同值的两个数据结构在此意义上是等价的。

::: isabelle
Isabelle 使用 `equiv A r` 表示“r 是 A 上的等价关系”，使用 ```r `` {x}``` 表示 `x` 的类，以及使用 `A // r`（“A 模 r”）表示所有类的集合，即划分。以下是示例中的定义，该关系通过基于乘积的集合构建符号建立：

```isabelle
value "{(x, y) ∈ {0..8::nat} × {0..8}. x mod 3 = y mod 3} `` {4}"
```

```output
"{1, 4, 7}"
  :: "nat set"
```

```isabelle
value "{0..8::nat} // {(x, y) ∈ {0..8} × {0..8}. x mod 3 = y mod 3}"
```

```output
"{{2, 5, 8}, {1, 4, 7}, {0, 3, 6}}"
  :: "nat set set"
```

对于所有自然数，该关系是一个等价关系；证明展开定义：

```isabelle
lemma "equiv UNIV {(x, y). x mod 3 = (y::nat) mod 3}"
  by (auto simp: equiv_def refl_on_def sym_def trans_def)
```

库一次性证明了本节的主要事实，如`quotient_disj`所示：两个类相等或不相交。通过`simp add:`，你将定理交给化简器：

```isabelle
lemma "equiv A r ⟶ X ∈ A // r ⟶ Y ∈ A // r ⟶ X = Y ∨ X ∩ Y = {}"
  by (simp add: quotient_disj)
```
:::

## Order 与良基性 {#orders}

Orders 比较事物：版本号、优先级、截止日期、调度中的“必须在之前发生”。某些 Orders 比较任意两个元素；许多不比较。

### 偏序与全序 {#partial-orders}

::: definition 偏序、全序与严格序
**偏序**在$A$上是在$A$上的关系，在$A$上自反、反对称且传递。**全序**（或线性序）是$A$上全的偏序。**严格序**是自反不成立且传递的关系。
:::

偏序通常记为$\le$，严格序记为$<$，二者可相互推导：$x < y \iff x \le y \land x \neq y$与$x \le y \iff x < y \lor x = y$。严格序具有**非对称性**：若$x < y$与$y < x$成立，则由传递性可得$x < x$，但这被反自反性所禁止。

::: example 序，全序与偏序
- $\le$ 在数字上是全序。
- $\subseteq$ 在 $\pow(A)$ 上是偏序。如果 $A$ 包含两个不同的元素，则它不是全序：
  例如，当 $1, 2 \in A$、$\{1\}$ 和 $\{2\}$ 是 **不可比较** 时，因为彼此都不是对方的子集。如果 $A$ 至多包含一个元素，其子集确实构成全序。
- 在正整数上，若存在整数 $k$ 使 $b = k \cdot a$，就记作 $a \mid b$。这个整除关系是
  偏序关系，且 2 和 3 不可比。
:::

### 哈斯图 {#hasse}

偏序关系的图有许多箭头：每个结点都有自环，每条路径的首尾之间都有一条直接的边。有限集上偏序的**哈斯图**省略了从偏序的性质就能推知的边。较小的元素放在下方，不画自环和箭头，只有从 $x$ 到 $y$ 构成覆盖关系，即 $y$ **覆盖** $x$ 时才画一条向上的线。此时 $x < y$，而两者之间没有其他元素。于是 $x \le y$ 当且仅当存在从 $x$ 到 $y$ 的向上路径。若 $x = y$，路径可以没有边。

::: figure id=fig-04-2
两个哈斯图。左图：$\{1, 2, 3\}$的子集，按$\subseteq$排序。右图：12的因子，按整除关系排序。每条线从元素向上连接到覆盖它的元素。
:::

在偏序中，若没有元素严格小于 $m$，它就是**极小元素**。若它小于等于每个元素，它就是**最小元素**。反转次序便得到**极大元素**和**最大元素**。图 4.2 中，$\emptyset$ 和 1 各为所在偏序的最小元素，$\{1, 2, 3\}$ 和 12 各为最大元素。一个偏序可以有多个极小元素，却没有最小元素。例如 $\{2, 3, 4, 6\}$ 按整除关系排序，2 和 3 是极小元素，4 和 6 是极大元素。在没有环状依赖的项目计划中，“是……的前提条件”构成严格序，加上相等关系便构成偏序。极小任务没有尚未完成的先决任务。按照依赖关系给任务排序叫作**拓扑排序**，得到的是满足依赖关系的顺序。工期和资源约束是进一步的调度问题。

### 良基关系 {#well-founded}

在自然数上，每个下降链$n > m > k > \dots$在最多$n$步后停止。在整数上，$0 > -1 > -2 > \dots$永不停止。这一差异使得归纳法和终止性证明得以成立。

::: definition 良基关系
将 $(y, x) \in R$ 读作“$x$ 小于 $y$”。当不存在无限下降链时，$R$ 是 **well-founded**，即不存在满足对于所有 $i$ 都有 $(x_{i+1}, x_i) \in R$ 的无限序列 $x_0, x_1, x_2, \dots$。
:::

等价地，该级数未加证明而使用的事实是，每个非空集$S$都有一个$R$-**最小**元素：某个$m \in S$，使得不存在$y \in S$满足$(y, m) \in R$。

- $<$ 在 $\N$ 上是良基的。$<$ 在 $\Z$ 上不是，$<$ 在非负分数上也不是：
  $1 > \tfrac{1}{2} > \tfrac{1}{4} > \dots$ 永远不会停止。
- 良基关系是非自反的，因为$(x, x) \in R$给出了链$x, x, x, \dots$。因此$<$
  在 $\N$ 上良基且在 $\le$ 上非良基。
- 有限集上的关系是良基的，当且仅当它没有循环。（库将此证明为
  `wf_iff_acyclic_if_finite`.)

::: keyidea
良基关系是程序终止和归纳法有效性的原因。

- **终止性。** 如果循环的每次迭代或每次递归调用都移动到某个
  良基关系，计算停止：如果工作间的减少也终止，无限计算将是无限下降链。欧几里得算法在 $n = 0$ 时返回 $m$；否则进行递归调用 `gcd n (m mod n)`。其第二个参数减少，因为当 $n > 0$ 时 $m \bmod n < n$。当使用 `fun` 定义函数时，Isabelle 寻找这样的关系；这就是它在 Module 1 中报告的“终止顺序”。
- **归纳法。** 要证明 $P\,x$ 对所有 $x$ 都成立，只需在下述假设下证明 $P\,x$：$P$ 对
  所有小于 $x$ 的元素（此证明为归纳步骤）。若 $P$ 在某处失败，反例将具有最小元素 $m$；$P$ 在 $m$ 之下成立，因此归纳步骤证明 $P\,m$，导致矛盾。

模块 5 在此基础之上构建了两个想法。
:::

::: isabelle
Isabelle 将 `wf r` 写作表示“r 是良基的”，其读法相同：`(y, x) ∈ r` 意味着 `y` 更小。库证明了 `<` 在自然数上是良基的，如 `wf_less` 所示：

```isabelle
lemma "wf {(x, y). x < (y::nat)}"
  by (simp add: wf_less)
```

命令`thm`通过名称显示库中的定理。该定理表明，良基意味着“不存在无限下降链”：

```isabelle
thm wf_iff_no_infinite_down_chain
```

```output result
wf ?r = (∄f. ∀i. (f (Suc i), f i) ∈ ?r)
```

链是定义在自然数上的函数 `f`，`f 0`、`f 1`、`f 2`…，且 `Suc i` 是 `i + 1`。`∄` 读作“不存在”，`=` 在两个真值之间表示 $\iff$（模块 3）。`?r` 中的问号标记了定理的变量，可以是任意关系；模块 7 有更多说明。最后，两个不可比集合表明 $\subseteq$ 不是全序的：

```isabelle
value "{1::nat} ⊆ {2} ∨ {2} ⊆ {1::nat}"
```

```output
"False"
  :: "bool"
```
:::

## 闭包与可达性 {#closures}

关系通常缺乏你所需的性质。“calls”不具有传递性，但“可直接或间接调用”具有；“一步可达”不具有，但“可达”具有。一个**闭包**添加缺失的对，且不添加其他内容。

### 闭包 {#closure-def}

::: definition 闭包
关系的**自反**、**对称**或**传递闭包**，若原关系为 $R$，就是包含 $R$ 且具有相应性质的最小关系。这里的“最小”指它包含于每一个符合条件的关系中。在纸笔定义中，取 $R \subseteq A \times A$，并让闭包保留在选定的载体 $A$ 上。

- $A$上的自反闭包：$R \cup \mathit{Id}_A$。对称闭包：$R \cup R^{-1}$。
- 传递闭包：$R^+ = R \cup (R \mathbin{O} R) \cup (R \mathbin{O} R \mathbin{O} R) \cup \dots$，
  因此，$(x, y) \in R^+$ 当且仅当存在一条由一个或多个 $R$-步骤组成的路径，从 $x$ 到达 $y$。
- **自反传递闭包** on $A$: $R^* = \mathit{Id}_A \cup R^+$，零步或多步的路径。

Isabelle 写出 `r⇧+` 和 `r⇧*`（类型 `r^+` 和 `r^*`），并将它们称为 `trancl` 和 `rtrancl`。
:::

Isabelle 的 `r⇧*` 使用整个元素类型作为其载体，因此即使对于被抽取的有限集之外的值，它也包含 `(x, x)`。要将其限制在 $A$ 内，需取其与 $A \times A$ 的交集。对于从 $A$ 中的初始状态可达性，包含在 $A \times A$ 中的关系不会离开 $A$，因此这一区别不改变可达状态。

::: example 一个链及其闭包
对于$R = \{(1, 2), (2, 3), (3, 4)\}$，两步路径给出$R \mathbin{O} R = \{(1, 3), (2, 4)\}$，三步路径给出$\{(1, 4)\}$，且不存在更长的路径。因此

$$
R^+ = \{(1, 2), (2, 3), (3, 4), (1, 3), (2, 4), (1, 4)\}
$$

这在 $\{1, 2, 3, 4\}$ 上是 $<$；$R^*$ 添加了对 $(x, x)$ 和 $\le$ 的配对。图 4.3 左侧绘制了 $R$，其中包含了 $R^+$ 添加的配对。
:::

在包含 $n$ 个元素的集合上，每个可达对均具有长度至多为 $n$ 的路径。对于不同端点，通过移除重复循环可得长度至多为 $n-1$ 的路径。对于 $R^+$ 中相同的端点，保留最短非空循环，其长度至多为 $n$；零步路径不足以处理 $R^+$。因此，可通过依次添加 $R \mathbin{O} R$ 的对、$R \mathbin{O} R \mathbin{O} R$ 的对等来计算 $R^+$，直至状态不再改变。第 4.2 节中部件的 **Transitive closure** 按钮计算相同的关系。

::: pitfall
- **在$R^*$.** $(x, x) \in R^*$中零步计数，对每个$x$成立，即使$R$在$x$处无循环；
  $R^+$ 仅当存在经过 $x$ 的循环时才包含 $(x, x)$。
- **闭包的顺序很重要。**包含$R$的最小等价关系是
  $(R \cup R^{-1})^*$: 对称性优先，随后是自反性和传递性。对于 $R = \{(1, 3), (2, 3)\}$，它通过 $1 \to 3 \to 2$ 关联 1 和 2，但 $R^* \cup (R^*)^{-1}$ 不关联。
:::

### 状态机中的可达性 {#reachability}

模块 1 描述了模型检测器，其探索系统的每个可达状态。可达性是自反传递闭包。

::: definition 状态机与可达性
**状态机**由一组**状态**、一组**初始**状态 $I$ 和一个**迁移关系** $T$ 组成。$(s, t) \in T$ 表示系统能从 $s$ 一步迁移到 $t$。若对某个 $s \in I$ 有 $(s, t) \in T^*$，则状态 $t$ 是**可达**的，也就是像 $T^*[I]$ 中的元素。**安全性质**要求坏状态不可达。
:::

::: example 一把带锁的门
一扇门处于开或关状态，其门栓处于锁或开状态：四种状态，CL（关且锁）、CU（关且开）、OU（开且开）和 OL（开且锁）。OL 为坏状态：门栓从开着的门伸出，会损坏门框。转换包括 *unlock*（CL 到 CU）、*lock*（CU 到 CL）、*open*（CU 到 OU）和 *close*（OU 到 CU），且门初始状态为 CL。

从 CL 门只能前往 CU，从 CU 可前往 CL 或 OU，从 OU 返回 CU。因此可达状态为 CL、CU 和 OU，且安全性质“门永远不会处于既开又锁的状态”成立。现在假设设计者使锁按钮在所有状态下均有效，这增加了从 OU 到 OL 的转移，使得 OL 沿 CL、CU、OU、OL 变得可达：一个 **counterexample trace**，即模型检查器在性质失败时给出的那种答案。
:::

::: figure id=fig-04-3
左侧：关系 $\{(1, 2), (2, 3), (3, 4)\}$（实线）及其传递闭式添加的对（虚线）。右侧：门的状态机。绿色状态从 CL 可达；红色虚线转移是设计师添加的，使得坏状态 OL 可达。
:::

真实系统拥有数十亿个状态，或无限多个状态，这就是为什么模型检查器通过机器计算可达性，以及为什么 Module 13 使用不变式证明安全性性质。

::: isabelle
为门的转换关系命名，使用`definition`。与模块1中的`fun`类似，它引入一个带有类型和定义方程的新常量，但允许无递归，且逐对写出的集合无需递归（模块8对两个命令有更多说明）：

```isabelle
definition door :: "(string × string) set" where
  "door = {(''CL'', ''CU''), (''CU'', ''CL''), (''CU'', ''OU''), (''OU'', ''CU'')}"
```

```output
consts
  door :: "(char list × char list) set"
```

可达状态是初始状态在自反传递闭包下的像：

```isabelle
value "door⇧* `` {''CL''}"
```

```output
"{''OU'', ''CU'', ''CL''}"
  :: "char list set"
```

坏状态在添加额外转换之前是不可达的：

```isabelle
value "''OL'' ∈ door⇧* `` {''CL''}"
value "''OL'' ∈ (door ∪ {(''OU'', ''OL'')})⇧* `` {''CL''}"
```

```output all
"False"
  :: "bool"

"True"
  :: "bool"
```

链的传递闭包：

```isabelle
value "{(1::nat, 2), (2, 3), (3, 4)}⇧+"
```

```output
"{(1, 2), (2, 3), (3, 4), (2, 4), (1, 3), (1, 4)}"
  :: "(nat × nat) set"
```

对于所有关系，$R^+$ 包含 $R$ 且具有传递性，且对自反传递闭包进行两次操作不会增加任何内容：

```isabelle
lemma "r ⊆ r⇧+"
  by auto

lemma "trans (r⇧+)"
  by simp

lemma "(r⇧*)⇧* = r⇧*"
  by simp
```
:::

## 函数 {#functions}

数学上，函数是一种关系，其中每个输入恰好对应一个输出。

### 函数作为关系 {#fun-def}

::: definition 函数
从 $A$ 到 $B$ 的**函数**$f$ 记作 $f : A \to B$。它是一个关系 $f \subseteq A \times B$，其中每个 $a \in A$ 恰与一个 $b \in B$ 相关，记作 $f\,a = b$。$A$ 是 $f$ 的**定义域**，$B$ 是其**陪域**。集合 $S \subseteq A$ 的**像**是 $f[S] = \{f\,a.\; a \in S\}$，整个定义域的像称为 $f$ 的**值域**。
:::

值域说明值可能位于何处，而像域说明它们实际位于何处：对于在 $\N$ 上的平方运算，值域是 $\N$ 而像域是 $\{0, 1, 4, 9, \dots\}$。

在 HOL 中，函数并非序对集合：`nat ⇒ nat` 是独立类型（Module 1），其元素记为 $\lambda$。`λn. 2 * n` 是将 `n` 映射到 `2 * n` 的函数，数学上记为 $n \mapsto 2n$（类型为 `\lambda` 或 `%`）。每个 HOL 函数都是 **total**：它对其论域类型的每个元素都有定义值。（此“total”含义与第 4.2 节的全关系无关。）每个输入至多有一个输出的关系称为 **partial function**，例如可能不返回结果的确定性程序的输入输出关系。数学上的偏函数可通过返回 Module 8 类型 `option` 的全函数在 HOL 中表示：要么返回值，要么为 `None`。此表示法记录未定义性；它并未将潜在非终止程序实现为终止的 HOL 函数。Isabelle 将集合的像记为 `` f ` A ``（一个反引号），将值域记为 `range f`。

### 单射、满射、双射 {#inj-surj}

::: definition 单射、满射、双射
一个函数 $f : A \to B$ 是

- **injective** (one-to-one) 当不同输入产生不同输出时：
  $\forall x \in A.\; \forall y \in A.\; f\,x = f\,y \imp x = y$;
- **满射**（onto $B$）当$B$的每个元素都是输出时：
  $\forall b \in B.\; \exists a \in A.\; f\,a = b$，即 $f[A] = B$；
- **双射**当它同时：将$A$和$B$的元素一一配对。
:::

::: example 四个关于数字的函数
- $n \mapsto 2n$ 在 $\N$ 上是单射，因为 $2x = 2y$ 蕴含 $x = y$，但非满射：1 不是
  输出。
- $n \mapsto n \operatorname{div} 2$ 在 $\N$（向下取整除法）上是满射但不是单射：
  0 和 1 均给出 0。
- $n \mapsto n + 1$ 在 $\N$ 上是单射但不是满射：0 不是输出。
- $n \mapsto n + 1$ 在 $\Z$ 上是双射的：每个整数 $m$ 恰好对应一个输入 $m - 1$。
:::

前两者的公式相同但性质不同：满射性依赖于定义域和陪域。在软件中，单射性意味着“无碰撞”。例如，对于固定的密钥，具有精确解密功能的确定性加密必须将不同的明文映射到不同的密文；否则，解密无法正确恢复两个消息。

### 逆与复合 {#inverse}

::: definition 组合与逆
$f : A \to B$ 和 $g : B \to C$ 的**复合**为 $g \circ f : A \to C$，其中 $(g \circ f)\,x = g\,(f\,x)$。先做 $f$，再做 $g$，读作「先 f 后 g」。若对所有 $a \in A$ 都有 $g\,(f\,a) = a$，且对所有 $b \in B$ 都有 $f\,(g\,b) = b$，则函数 $g : B \to A$ 为 $f$ 的**逆函数**。
:::

::: fact 组合与逆
1. 如果$f$和$g$是单射，则$g \circ f$也是单射；如果它们是满射，则$g \circ f$也是满射。因此
   两个双射的复合仍是双射。
2. 函数具有逆当且仅当它是双射。此时逆是唯一的，记作 $f^{-1}$，
   且其图是 $f$ 的图的逆关系。
3. 对于双射，$(g \circ f)^{-1} = f^{-1} \circ g^{-1}$。
:::

对于第一部分中的单射性：若$g\,(f\,x) = g\,(f\,y)$，则$f\,x = f\,y$因为$g$是单射的，且$x = y$因为$f$是。第三部分是袜子与鞋子的规则：袜子先穿后脱。一条被压缩然后加密的消息先被解密。

::: isabelle
Isabelle 的名称 `inj f`、`surj f` 和 `bij f` 表示全类型上的函数，`inj_on f A` 和 `bij_betw f A B` 表示集合上的函数，`inv f` 表示逆，`g ∘ f` 表示复合（类型 `\circ`）。声明加倍是单射：

```isabelle
lemma "inj (λn::nat. 2 * n)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. inj ((*) 2)
```

Isabelle 将 `λn. 2 * n` 以较短形式打印为 `(*) 2`：第一个参数固定为 2 的乘法。与第 4.2 节一样，证明需要定义，此处为 `inj_def`：

```isabelle
  by (auto simp: inj_def)
```

更多示例以及事实的第一部分：

```isabelle
lemma "¬ surj (λn::nat. n + 1)"
  by (auto simp: surj_def)

lemma "bij (λn::int. n + 1)"
  by (auto simp: bij_def inj_def surj_def)

lemma "inj f ⟶ inj g ⟶ inj (g ∘ f)"
  by (auto simp: inj_def)
```

`inv f` 对每个 HOL 函数进行定义。单射性保证它在每个输入上撤销 `f` 的作用：

```isabelle
lemma "inj f ⟶ inv f (f x) = x"
  by simp
```

在有限集`value`上判定这些性质。加 1 并取模 3 的结果是对集合自身的$\{0, 1, 2\}$双射：

```isabelle
value "bij_betw (λx::nat. (x + 1) mod 3) {0, 1, 2} {0, 1, 2}"
```

```output
"True"
  :: "bool"
```
:::

::: pitfall
当`f`非满射时，`inv f y`在`y`的值域外仍有定义，因为每个HOL函数都是全函数，但此处不保证存在逆律。单射性给出左逆律`inv f (f x) = x`；满射性给出右逆律`f (inv f y) = y`。双射性同时给出两者。
:::

## 计数：基数与康托尔定理 {#cardinality}

对于有限集，你进行计数；对于无限集，你无法计数，但你仍可以使用函数比较大小，且该比较蕴含一个意外发现。

### 有限集 {#finite}

::: definition 基数
**基数** $|A|$有限集$A$的元素个数。Isabelle 使用`card A`和`finite A`表示“A 是有限的”。
:::

::: fact 计数规则
对于有限集合 $A$ 和 $B$：

1. $|A \cup B| = |A| + |B| - |A \cap B|$，因此当$A$与$B$不相交时$|A \cup B| = |A| + |B|$成立。
2. $|A \times B| = |A| \cdot |B|$ 与 $|\pow(A)| = 2^{|A|}$。
3. 如果存在从 $A$ 到 $B$ 的单射函数，则 $|A| \le |B|$；如果存在双射，则
   $|A| = |B|$.
:::

第一条规则是**inclusion–exclusion**：$|A| + |B|$计算$A \cap B$的元素两次。在文件服务器上，$|R \cup W| = 3 + 2 - 1 = 4$。第三条规则通过配对元素来比较大小而不进行计数，该想法对无限集同样适用。

### 鸽巢原理 {#pigeonhole}

::: fact 鸽巢原理
若$A$与$B$为有限集且$|A| > |B|$成立，则不存在单射函数$f : A \to B$：$A$中两个不同元素具有相同像。当$B$非空时，每个函数$f : A \to B$将$A$中至少$\lceil |A| / |B| \rceil$个元素映射至$B$中某一元素。若$B$为空且$A$非空，则根本不存在函数$A \to B$。
:::

若飞入洞的鸽子多于洞数，则某洞容纳两只鸽子。在任意13人中，两人出生月份相同。具有1000个键和256个桶的哈希表，无论哈希函数如何，均存在至少包含$\lceil 1000/256 \rceil = 4$个键的桶。且无损压缩程序无法使所有文件变短：存在$2^n$个$n$位文件，但较短文件仅$2^0 + 2^1 + \dots + 2^{n-1} = 2^n - 1$个，故两文件将压缩为相同形式。

::: isabelle
`card` 计数，且重复元素只计一次：

```isabelle
value "card {1, 2, 3, 2, 1 :: nat}"
value "card (Pow {1, 2, 3 :: nat})"
```

```output all
"3"
  :: "nat"

"8"
  :: "nat"
```

十三个数在模 12 下仅有十二种可能的余数，因此余数函数在这些数上不是单射：

```isabelle
value "inj_on (λn::nat. n mod 12) {0..12}"
```

```output
"False"
  :: "bool"
```

库证明了所有有限集的计数规则。幂集规则为`card_Pow`：

```isabelle
lemma "finite A ⟶ card (Pow A) = 2 ^ card A"
  by (simp add: card_Pow)
```

鸽巢原理是`pigeonhole`。它涉及第4.6节的像`` f ` A ``：若像的元素少于`A`，则`A`中的两个元素共享一个像，因此`f`在`A`上非单射。

```isabelle
lemma "card (f ` A) < card A ⟶ ¬ inj_on f A"
  by (simp add: pigeonhole)
```
:::

::: pitfall
在 Isabelle 中，`card` 的无限集为 0。这保持 `card` 为全函数，但关于 `card` 的陈述通常需要假设 `finite A`，如上述关于幂集的引理所示。

```isabelle
lemma "card (UNIV :: nat set) = 0"
  by simp
```
:::

### 可数集 {#countable}

对于无限集，将第三条计数规则作为定义：当两个集合之间存在双射时，它们具有 **same cardinality**。奇怪的事情立刻发生：$n \mapsto 2n$ 是从 $\N$ 到偶数的双射，因此 $\N$ 的真子集与 $\N$ 本身一样大。

::: definition 可数集
当存在从 $A$ 到 $\N$ 的单射函数时，集合 $A$ 是 **countable**。等价地，$A$ 是有限的，或其元素可列为 $a_0, a_1, a_2, \dots$，每个元素在列表中出现。
:::

整数是可数的：将它们列为 $0, 1, -1, 2, -2, \dots$。自然数对也是可数的，按对角线方式列出：$(0, 0)$, $(0, 1)$, $(1, 0)$, $(0, 2)$, $(1, 1)$, $(2, 0)$, …。有限字母表上的有限字符串也是可数的，按长度然后按字母顺序列出；特别是，任何编程语言中的程序构成一个可数集。那么每个集合都是可数的吗？不，其证明是数学中最著名的证明之一。

### 康托尔定理 {#cantor}

::: fact 康托尔定理
对于每个集合$A$，没有函数$f : A \to \pow(A)$是满射。
:::

因为 $a \mapsto \{a\}$ 是单射，$\pow(A)$ 的基数至少与 $A$ 一样大。康托尔定理表明前者严格更大。格奥尔格·康托尔于 1891 年发表了这个证明，称为**对角线论证**。

取任意 $f : A \to \pow(A)$。每个 $f\,x$ 是一个可能包含也可能不包含 $x$ 自身的集合。收集那些不在其自身集合中的元素：

$$
D = \{x \in A.\; x \notin f\,x\}
$$

$D \subseteq A$, 因此 $D \in \pow(A)$。假设 $f$ 是满射的。那么对于某个 $d \in A$ 有 $D = f\,d$。$d$ 是否在 $D$ 中？下面的第一步是 $D$ 的定义（它适用，因为 $d \in A$）；第二步将 $f\,d$ 替换为等于它的 $D$：

$$
d \in D \iff d \notin f\,d \iff d \notin D
$$

因此$d \in D \iff d \notin D$，且一个与其自身否定等价的命题是不可能的：

```truthtable
P ⟷ ¬P
```

假设$f$是满射导致矛盾，因此该假设为假：不存在$d$具有$f\,d = D$，且$f$不是满射。图4.4展示了该名称的来源。

::: figure id=fig-04-4
$A = \N$ 的对角线论证。第 $i$ 行表示每个数是否属于集合 $f\,i$，1 表示属于，0 表示不属于。$D$ 翻转对角线位置上的值，因此对每个 $i$，它在位置 $i$ 与集合 $f\,i$ 不同。所以 $D$ 不出现在任何一行中。
:::

$\N$的一个子集描述了**决策问题**，例如“这个数是否为素数”。程序仅在每个输入上以正确的yes-or-no答案停机时才能判定该集合。程序的数量是可数的，因此可判定集最多可数，而$\pow(\N)$是不可数的。因此不可判定问题必然存在。这是一个计数论证：它并未给出一个恰好列出所有在所有输入上停机的程序的算法。Turing证明停机问题不可判定（Module 1）也是一个对角线论证。

::: note
伯特兰·罗素于1901年发现，同样的技巧会破坏朴素集合论，后者允许每个性质定义一个集合：那么$R = \{x.\; x \notin x\}$，即所有不属于自身的集合的集合，将是一个集合，并且$R \in R \iff R \notin R$。高阶逻辑（HOL）通过类型避免该悖论：`x ∈ x`是一个类型错误，因为集合及其元素具有不同的类型，并且出于相同的原因，不存在包含一切内容的集合（第4.1节）。
:::

::: isabelle
证明的核心在于对角集不是 `f` 的值。`range f` 是 `f` 所有值的集合：

```isabelle
lemma diagonal: "{x. x ∉ f x} ∉ range f"
  by auto
```

每个类型的康托尔定理均成立：若存在满射 `f`，则其值域包含所有集合，包括对角线集合。`auto` 未能找到此证明，但 `force` 可以。`force` 是 `auto` 的变体，它搜索更努力且更缓慢，要么完全证明目标，要么失败；第 9 模块将正式介绍它。此处它甚至能自行发现对角线集合：

```isabelle
lemma cantor: "¬ surj (f :: 'a ⇒ 'a set)"
  by force
```

因此，不存在自然数集合的序列 `f 0`, `f 1`, `f 2`, … 能包含它们全部；名称 `cantor` 使后续证明能够使用该引理：

```isabelle
lemma "¬ surj (f :: nat ⇒ nat set)"
  by (simp add: cantor)
```

库拥有针对每个集合`A`的定理，如`Cantors_theorem`所示：

```isabelle
thm Cantors_theorem
```

```output result
∄f. f ` ?A = Pow ?A
```
:::

## 小结 {#summary}

- **集合**由其元素决定，这称为**外延性**。另外，$a \in \{x.\; P\,x\} \iff P\,a$。
  在 HOL 中，每个集合都有一个元素类型。
- **并集、交集、差集和补集** 是 $\lor$、$\land$、“and not” 和 $\lnot$
  应用于成员关系，因此集合定律是命题定律，Isabelle 使用 `auto` 证明它们。
- A **relation**是一组序对的集合。它可以是**reflexive, irreflexive, symmetric, antisymmetric,
  传递或全序**；性质失败当且仅当存在见证者。**逆**与**复合**构建新关系。
- **等价关系**对应于**划分**。**偏序**被绘制为**哈斯
  diagrams**. **良基**关系不存在无限下降链，这就是程序终止且归纳法有效的原因。
- **闭包** $R^+$ 和 $R^*$ (`r⇧+`, `r⇧*`) 添加由路径连接的数对，以及 **可达
  状态机**的状态是初始状态在$T^*$下的像。
- 函数可以是**单射**、**满射**、两者兼具（**双射**），或两者皆非。它拥有
  当且仅当双射时存在双侧逆。Isabelle 的 `inv` 定义更为一般；逆律需要适当假设（`inj`, `surj`, `bij`）。
- **基数**统计有限集（`card`，`finite`）。**鸽巢原理**禁止单射
  将集合划分为更小的子集，**Cantor's diagonal argument** 表明没有任何集合可以映射到其幂集上：某些集合是不可数的，且某些问题不存在对应的程序。

## 练习 {#exercises}

:::: exercise 手工定义集合 {#ex-4-1} ★
令$A = \{1, 2, 3, 4\}$、$B = \{3, 4, 5\}$与$C = \{1, 5\}$。

1. 计算 $A - B$, $B - A$, $A \cap B \cap C$, $C \times \{0, 1\}$ 和 $\pow(C)$，并验证你的答案
   with `value`.
2. 以下哪些为真：$C \subseteq A \cup B$, $\emptyset \in \pow(C)$, $\{5\} \in \pow(C)$?

::: solution
1. $A - B = \{1, 2\}$, $B - A = \{5\}$, $A \cap B \cap C = \emptyset$,
   $C \times \{0, 1\} = \{(1, 0), (1, 1), (5, 0), (5, 1)\}$ 与 $\pow(C) = \{\emptyset, \{1\}, \{5\}, \{1, 5\}\}$。在 Isabelle 中：

```isabelle
value "{1, 2, 3, 4} - {3, 4, 5 :: nat}"
value "{3, 4, 5} - {1, 2, 3, 4 :: nat}"
value "{1, 2, 3, 4} ∩ {3, 4, 5} ∩ {1, 5 :: nat}"
value "{1, 5 :: nat} × {0, 1 :: nat}"
value "Pow {1, 5 :: nat}"
```

```output all
"{1, 2}"
  :: "nat set"

"{5}"
  :: "nat set"

"{}"
  :: "nat set"

"{(1, 0), (1, 1), (5, 0), (5, 1)}"
  :: "(nat × nat) set"

"{{5}, {}, {1}, {1, 5}}"
  :: "nat set set"
```

2. 三者皆真。$C \subseteq A \cup B = \{1, 2, 3, 4, 5\}$，且$\emptyset$与$\{5\}$为
   $C$的子集，因此它们是$\pow(C)$的元素。
:::
::::

:::: exercise 关系性质 {#ex-4-2} ★
4.2 节中的六个性质中，$\{1, 2, 3, 4\}$ 上的这些关系具备哪些？对于每一个不成立的性质，请给出一个见证，并使用小部件验证你的答案。

1. $R_1 = \{(1, 1),\allowbreak (2, 2),\allowbreak (3, 3),\allowbreak (4, 4),\allowbreak (1, 2),\allowbreak (2, 1)\}$
2. $R_2 = \{(1, 2), (2, 3), (3, 1)\}$
3. $R_3 = \{(1, 2), (1, 3), (1, 4)\}$

::: solution
1. $R_1$ 是自反、对称且传递的：一个具有类 $\{1, 2\}$ 的等价关系
   $\{3\}$ 和 $\{4\}$。它不是自反的（见证 $(1, 1)$），不是反对称的（$(1, 2)$ 和 $(2, 1)$，但 $1 \neq 2$），也不是完全的（既非 $(1, 3)$ 也非 $(3, 1)$）。
2. $R_2$, 一个环, 是非自反且反对称的。它不是自反的（无 $(1, 1)$），也不是对称的
   （有 $(1, 2)$ 但没有 $(2, 1)$）、不具传递性（有 $(1, 2)$ 和 $(2, 3)$ 但没有 $(1, 3)$），也不是全序（既没有 $(1, 4)$，也没有 $(4, 1)$）。
3. $R_3$ 是非自反的、反对称的且传递的；由于没有路径包含两个元素，传递性空真成立。
   步骤。它不是自反的（无 $(1, 1)$），不是对称的（$(1, 2)$ 无 $(2, 1)$），也不是完全的（既无 $(2, 3)$ 也无 $(3, 2)$）。它是一个严格顺序。
:::
::::

:::: exercise 集合定律，两种形式 {#ex-4-3} ★★
1. 在纸上证明 $A - (B \cup C) = (A - B) \cap (A - C)$，方法是将其翻译为命题逻辑，
   随后在 Isabelle 中。
2. 有人声称$(A \cup B) - C = A \cup (B - C)$。使用反例法寻找反例
   第4.1节，然后让Nitpick找到一个，并比较。

::: solution
1. $x \in A - (B \cup C)$ 规约为 $p_A \land \lnot (p_B \lor p_C)$，其德摩根定律转换
   代入 $p_A \land \lnot p_B \land \lnot p_C$。右侧翻译为 $(p_A \land \lnot p_B) \land (p_A \land \lnot p_C)$，即同一公式，因为 $p \land p \iff p$。在 Isabelle 中，无需类型注解，因为 `∪` 和 `∩` 仅存在于集合中：

   ```isabelle
   lemma "A - (B ∪ C) = (A - B) ∩ (A - C)"
     by auto
   ```

2. $(p_A \lor p_B) \land \lnot p_C$ 与 $p_A \lor (p_B \land \lnot p_C)$ 的差异恰好对应于 $p_A$ 与
   $p_C$ 为真时，左侧为假且右侧为真。结合 $A = C = \{x\}$ 与 $B = \emptyset$，左侧为 $\emptyset$ 且右侧为 $\{x\}$。Nitpick：

   ```isabelle
   lemma "(A ∪ B) - C = A ∪ (B - C)"
     nitpick [card 'a = 1]
     oops
   ```

   ```output result
   Nitpicking formula...

   Nitpick found a counterexample for card 'a = 1:
     Free variables:
       A = {a⇩1}
       B = {}
       C = {a⇩1}
   ```

   这是相同的反例，其中 a₁ 对应 $x$。
:::
::::

:::: exercise 谁调用谁 {#ex-4-4} ★★
一个程序包含函数 main、parse、lex、eval 和 apply。main 调用 parse 和 eval，parse 调用 lex，eval 调用 apply，且 apply 调用 eval。

1. main 可以直接或间接调用哪些函数？
2. 如果函数能直接或间接调用自身，它就是递归的。用下面的
   传递闭包，并找到递归函数。
3. 在 Isabelle 中验证两个答案。

::: solution
1. parse, lex, eval 和 apply：$\{\mathit{main}\}$ 在 $\mathit{calls}^+$ 下的像。
2. $f$ 在 $(f, f) \in \mathit{calls}^+$ 时是递归的。eval 和 apply 通过 eval 循环
   apply 和 eval 是递归的，main、parse 和 lex 则不是。
3. 通过调用图的定义：

```isabelle
definition calls :: "(string × string) set" where
  "calls = {(''main'', ''parse''), (''main'', ''eval''), (''parse'', ''lex''),
            (''eval'', ''apply''), (''apply'', ''eval'')}"

value "calls⇧+ `` {''main''}"
value "(''apply'', ''apply'') ∈ calls⇧+"
value "(''main'', ''main'') ∈ calls⇧+"
```

```output all
consts
  calls :: "(char list × char list) set"

"{''parse'', ''lex'', ''apply'', ''eval''}"
  :: "char list set"

"True"
  :: "bool"

"False"
  :: "bool"
```
:::
::::

:::: exercise 注入还是满射？ {#ex-4-5} ★★
将每个函数分类为单射、满射、双射或非双射，并给出每个双射的逆。使用 `value` 验证第四个。

1. $f : \N \to \N$, $f\,n = n + 3$
2. $g : \Z \to \Z$, $g\,n = -n$
3. $h : \N \to \N$, $h\,n = n \operatorname{div} 2$
4. $k : \{0, 1, 2, 3\} \to \{0, 1, 2, 3\}$, $k\,n = 3n \bmod 4$

::: solution
1. 单射而非满射：0、1 和 2 不是输出。
2. 双射，且为其自身的逆：$g\,(g\,n) = n$。
3. 满射，因为$m = h\,(2m)$；非单射，因为$h\,0 = h\,1 = 0$。
4. 双射：$k$ 将 0, 1, 2, 3 映射到 0, 3, 2, 1。它是自身的逆，因为 $9n \bmod 4 = n \bmod 4$。

```isabelle
value "bij_betw (λn::nat. 3 * n mod 4) {0, 1, 2, 3} {0, 1, 2, 3}"
```

```output
"True"
  :: "bool"
```
:::
::::

:::: exercise 组合等价关系 {#ex-4-6} ★★★
令$R$和$S$为$A$上的等价关系。

1. 证明 $R \cap S$ 是 $A$ 上的等价关系，在纸面上和 Isabelle 中。
2. 通过 $\{1, 2, 3\}$ 上的示例展示 $R \cup S$ 不必为其中之一，并使用 `value` 进行验证。
3. $A$ 上包含 $R \cup S$ 的最小等价关系是什么？

::: solution
1. 自反性：对于 $x \in A$，$(x, x)$ 在 $R$ 中且在 $S$ 中。对称性：如果 $(x, y)$ 在两者中，那么
   $(y, x)$，因为两者都是对称的。传递性：如果 $(x, y)$ 和 $(y, z)$ 都在两者中，那么 $(x, z)$ 也在两者中，因为两者都是传递的。在 Isabelle 中，`sym_Int` 和 `trans_Int` 是库中最后两步的版本：

   ```isabelle
   lemma "equiv A R ⟶ equiv A S ⟶ equiv A (R ∩ S)"
     by (auto simp: equiv_def refl_on_def sym_Int trans_Int)
   ```

2. 令$R$关系1和2，且$S$关系2和3，每对均包含所有对$(x, x)$。则$R \cup S$
   包含$(1, 2)$和$(2, 3)$但不包含$(1, 3)$：

   ```isabelle
   value "trans_on {1, 2, 3}
            ({(1::nat, 1), (2, 2), (3, 3), (1, 2), (2, 1)} ∪ {(1, 1), (2, 2), (3, 3), (2, 3), (3, 2)})"
   ```

   ```output
   "False"
     :: "bool"
   ```

3. $(R \cup S)^+$. 它在 $A$ 上自反，因为包含 $R$，对称，因为读取路径
   backwards 再次是 $R \cup S$ 的路径，且具有传递性。包含 $R \cup S$ 的等价关系具有传递性，因此它包含每条路径，即所有 $(R \cup S)^+$。
:::
::::

:::: exercise 无限位序列 {#ex-4-7} ★★★
无限位序列是从$\N$到$\{0, 1\}$的函数，在HOL中类型为`nat ⇒ bool`。改编康托尔对角线论证以证明任何此类序列的列表$f\,0, f\,1, f\,2, \dots$均无法包含全部序列：给出缺失的序列并解释其为何缺失。随后在Isabelle中证明该序列不在`f`的值域内。（提示：若两个函数在所有参数上取值一致，则二者相等；库中将该性质称为`fun_eq_iff`。）

::: solution
令 $d$ 为序列，其 $n$ 位是 $f\,n$ 的 $n$ 位的相反位：$d\,n = \lnot (f\,n\,n)$。若 $d = f\,m$ 对某个 $m$ 成立，则两个函数在 $m$ 处一致：$\lnot (f\,m\,m) = f\,m\,m$，这不可能。因此 $d$ 不在列表中，且无限位序列的集合是不可数的。这再次对应图 4.4：自然数集合与位序列“当 $n$ 在集合中时 $n$ 为 1”描述的是同一事物。（类似的论证表明实数是不可数的。）

```isabelle
lemma "(λn. ¬ f n n) ∉ range (f :: nat ⇒ nat ⇒ bool)"
  by (auto simp: fun_eq_iff)
```

`fun_eq_iff` 将函数间的等式规约为关于所有参数的等式，`auto` 随后独立找到参数 $m$。
:::
::::

## 自测题 {#quiz}

```quiz
? 对于每个集合 $A$，哪个陈述成立？
- [ ] $\emptyset \in A$
- [x] $\emptyset \subseteq A$
- [ ] $A \subset A$
- [ ] $A \in \pow(\emptyset)$
> 空集通过空洞真值成为每个集合的子集：$x \in \emptyset \imp x \in A$ 成立因为 $x \in \emptyset$ 恒假。它仅是包含它的集合的元素，且没有集合是自身的真子集。

? 哪个逻辑定律证明了$-(A \cap B) = -A \cup -B$？
- [ ] $\land$ 对 $\lor$ 的分配律
- [ ] 吸收
- [ ] 双重否定
- [x] 德摩根定律 $\lnot (p \land q) \iff \lnot p \lor \lnot q$
> $x \in -(A \cap B)$ 等价于 $\lnot (x \in A \land x \in B)$，且德摩根定律将其转化为 $x \notin A \lor x \notin B$。

? 关系 $R$ 在 $\{1, 2, 3\}$ 上既对称又反对称。由此可得什么？
- [x] $R$ 中的每对元素都具有 $(x, x)$ 的形式
- [ ] $R$ 为空
- [ ] $R$ 是恒等关系
- [ ] $R$ 不具有传递性
> 若$(x, y) \in R$成立，由对称性可得$(y, x) \in R$，进而由反对称性可得$x = y$。任何自环集合均符合条件，包括空关系与恒等关系，因此二者均非强制。

? $R$ 是一个等价关系，且类 $[x]$ 与 $[y]$ 拥有公共元素。你能得出什么结论？
- [ ] $x = y$
- [ ] 无法断定。等价类可以部分重叠
- [x] $[x] = [y]$
- [ ] $R$ 是一个偏序
> 两个类相等或不相交，因此共享一个元素使它们相等。$x$ 和 $y$ 不必相等，仅需等价。

? $T$ 是状态机的转移关系，$s$ 是其初始状态。哪个集合恰好包含从 $s$ 可达的状态？
- [ ] $\{s\}$ 在 $T$ 下的像
- [x] $\{s\}$ 在 $T^*$ 下的像
- [ ] $\{s\}$ 在 $T^+$ 下的像
- [ ] $\{s\}$ 在 $T^{-1}$ 下的像
> 可达表示经过零步或多步可以到达，也就是 $T^*$。$T$ 只表示一步，而 $T^+$ 会漏掉 $s$ 本身，除非有环回到该点。

? Cantor 定理关于从 $\N$ 到 $\pow(\N)$ 的函数 $f$ 说明了什么？
- [ ] 它不能是单射
- [ ] 若其值域为无限集，则它是满射
- [ ] 其值域为所有 $\pow(\N)$
- [x] 某些自然数集合不在其值域中
> 对角集$\{n.\; n \notin f\,n\}$与每个$f\,n$不同。从$\N$到$\pow(\N)$的注入函数确实存在，例如$n \mapsto \{n\}$。
```
