---
title: Isabelle 中的自然演绎
part: 2
lead: 把模块 6 的纸上证明一条规则一条规则地变成 Isabelle 的证明脚本，一路读懂每一个证明状态，并在某一步失败时看出问题出在哪里。
minutes: 240
needs: 模块 1、2、3 和 6
goals:
  - 区分 Isabelle 的元逻辑（⟹、⋀、≡）和对象逻辑 HOL（⟶、∀、=），读懂用 ⟹ 写成的规则
  - 用 `thm` 查出每条自然演绎规则在 Isabelle 中的名字和陈述
  - 用 `rule`、`erule`、`drule`、`frule`、`assumption`、`intro` 和 `elim` 反向构造证明，并用 `done` 结束证明
  - 解释图式变量、合一和固定变元，以及量词步骤为什么必须按正确的顺序进行
  - 用 `ccontr` 和 `classical` 证明经典逻辑的定律，并根据错误消息修复出错的步骤
  - 让 `blast` 自动找到这样的证明，并清楚它替你做了什么
imports: Main
---

## 一个系统中的两种逻辑 {#meta}

在[模块 6](module_06_ZH.html) 中，你在纸上构造了自然演绎（natural deduction）证明：从你想要的公式出发，选一条能得出它的规则，然后一步步向上推，直到每个分支都终止于一个假设。Isabelle 正是这样构造证明的，而且会检查每一步。在本模块中，你将在 Isabelle 中一条规则一条规则地重做模块 6 的证明，让每一棵纸上的证明树都变成一段简短的证明脚本（proof script）。

在做第一个证明之前，你需要先学会读 Isabelle 书写规则和目标所用的记法。这套记法涉及第二种逻辑：一种位于 HOL 之下、更小的逻辑。

### 元逻辑 Pure {#meta-pure}

模块 1 说过，Isabelle 是一个可以在其中定义多种逻辑的框架。这个框架有一个属于自己的小逻辑，叫作 **Isabelle/Pure**，简称 Pure。它唯一的任务是说明什么是规则、什么是证明。其他所有逻辑，包括 HOL，都是在 Pure 里面定义的。

::: definition 元逻辑与对象逻辑
**元逻辑**（meta-logic）是一种用来陈述另一种逻辑的规则和证明的逻辑，那另一种逻辑叫作**对象逻辑**（object logic）。在 Isabelle 中，元逻辑是 **Pure**，对象逻辑是 **HOL**。Pure 有三个自己的符号：⟹（读作“由……推出”）、⋀（读作“对任意的……”）以及 ≡。≡ 是 Pure 自己的相等，Isabelle 主要用它来陈述定义。
:::

每个 Pure 符号都有一个对应的 HOL 符号，你在模块 2 和模块 3 中已经认识它们了：

| Pure | 读作 | HOL | 读作 |
|---|---|---|---|
| `A ⟹ B` | 由 A 推出 B | `A ⟶ B` | A 蕴涵 B |
| `⋀x. P x` | 对任意的 x，P x 成立 | `∀x. P x` | 对所有 x，P x 成立 |
| `a ≡ b` | a 等于 b；在定义中，a 定义为 b | `a = b` | a 等于 b |

在 Isabelle/jEdit 中，输入 `==>` 得到 ⟹，输入 `!!` 得到 ⋀，输入 `==` 得到 ≡。下文还会出现括号 ⟦ 和 ⟧，它们分别用 `[|` 和 `|]` 输入。

Isabelle 为什么需要两种箭头？因为自然演绎的规则不是公式。模块 6 的规则 (∧I) 并不是说“A ∧ B 为真”，而是说“如果你已经推导出了 A，也推导出了 B，就可以写下 A ∧ B”。这是一个关于推导的陈述，模块 6 把它画成一条横线。Pure 给了 Isabelle 一种语言，用来表达这类陈述。在 Pure 中，(∧I) 写作

$$
\llbracket A;\ B \rrbracket \Imp A \land B
$$

读作“由 A 和 B 推出 A ∧ B”。公式 A、B 和 A ∧ B 属于 HOL；括号、分号和 ⟹ 属于 Pure。HOL 公式的类型是 `bool`。Pure 的陈述有自己的类型 `prop`；在需要 Pure 陈述的地方，Isabelle 会把 HOL 公式转换成 Pure 陈述，而不会显示给你看。

::: fact 有多个前提的规则
`A₁ ⟹ A₂ ⟹ … ⟹ Aₙ ⟹ C` 的意思是 `A₁ ⟹ (A₂ ⟹ … ⟹ (Aₙ ⟹ C))`，Isabelle 把它显示为 `⟦A₁; A₂; …; Aₙ⟧ ⟹ C`：由前提（premise）A₁ 到 Aₙ 推出结论 C。前提本身也可以是一条规则：在 `(A ⟹ B) ⟹ C` 中，前提 `A ⟹ B` 是 B 的一个推导，其中可以假设 A。
:::

图 7.1 展示了这两层，以及一条规则怎样同时用到这两层。

::: figure id=fig-07-1
Isabelle 的两层逻辑。HOL 公式的类型是 `bool`，用 ¬ ∧ ∨ ⟶ ∀ ∃ 和 = 书写。规则和目标是 Pure 的陈述，类型是 `prop`，由 HOL 公式通过 ⟹、⋀ 和 ≡ 构成。
:::

### 目标也用同一种箭头 {#meta-goals}

Isabelle 书写目标（goal）时也用 ⟹。比较下面两条引理：

```isabelle
lemma "A ⟹ A ∨ B"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟹ A ∨ B
```

这个目标是一条规则：由 A 推出 A ∨ B。A 是你可以使用的**假设**（assumption），A ∨ B 是你必须得出的**结论**（conclusion）。模块 2 中的 `blast` 能证明它：

```isabelle
  by blast
```

```isabelle
lemma "A ⟶ A ∨ B"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟶ A ∨ B
```

这里整个目标是一个 HOL 公式，还没有任何假设。它说的是同一件事，`blast` 也能证明它：

```isabelle
  by blast
```

两者的区别在于你怎样处理这两种形式。在纸上，证明 A ⟶ A ∨ B 的第一步是 (⟶I)：假设 A，再证明 A ∨ B。在 Isabelle 中，这一步把目标中的 ⟶ 变成 ⟹，之后目标就和第一条引理一模一样了。你会在第 7.3 节走这一步。

手册《Programming and Proving in Isabelle/HOL》给出了一条实用的建议：如果你以后想把一条引理当作规则来用，就把它陈述为 ⟦A₁; …; Aₙ⟧ ⟹ C，而不是 A₁ ∧ … ∧ Aₙ ⟶ C，因为 Isabelle 可以直接应用前一种形式。本模块中的引理保留模块 6 中的 ⟶ 形式，这样每个 Isabelle 证明都能一步一步地跟着它的纸上证明树走。

### 用 ≡ 写成的定义 {#meta-def}

Pure 的第三个符号 ≡ 出现在定义中。模块 6 把 ¬A 解释为 A ⟶ ⊥。HOL 也是这样定义否定的，命令 `thm` 可以显示这一点（它按名字显示一个已经存储的定理；第 7.2 节会经常用到它）：

```isabelle
thm not_def
```

```output result
¬ ?P ≡ ?P ⟶ False
```

把它读作“¬P 定义为 P ⟶ False”。Isabelle 把 ⊥ 写作 `False`。问号是什么意思，第 7.2 节会解释。

::: pitfall
⟹ 属于 Pure。它连接的是陈述，但永远不能出现在 HOL 公式内部：

```isabelle fails
lemma "(A ⟹ B) ∧ C"
```

```output
*** Inner syntax error⌂
*** at "∧ C"
*** Failed to parse prop
```

Isabelle 报告“Inner syntax error”（内层语法错误）和“Failed to parse prop”（未能解析 prop）：它把 `(A ⟹ B)` 读成了一个 Pure 陈述，接下来就无法处理 `∧ C` 了，因为 ∧ 连接的是 HOL 公式。在公式内部要写 ⟶。还要注意，⟹ 比 HOL 的任何符号结合得都弱：`A ∧ B ⟹ C` 的意思是 `(A ∧ B) ⟹ C`。
:::

## 规则就是定理 {#rules}

### 用 thm 查看规则 {#rules-thm}

在 Isabelle 中，规则并不是另一种对象，而是一个陈述中用到了 ⟹ 的定理，`thm` 可以把它显示出来：

```isabelle
thm conjI
```

```output result
⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q
```

把它和模块 6 画出的 (∧I) 比较一下：

```prooftree
P ∧ Q   (∧I)
  P
  Q
```

横线上方的前提变成了 ⟹ 前面的前提，横线下方的结论变成了 ⟹ 后面的结论。名字 conjI 是 **conjunction introduction**（合取引入）的缩写。

::: definition 图式变量
**图式变量**（schematic variable），又叫**未知量**（unknown），是带问号的变量，例如 `?P`。它是一个占位符：使用定理时，Isabelle 可以把它换成任何类型合适的项（term），但每一处出现都要换成同一个项。Isabelle 存储一条已经证明的引理时，会把引理中的自由变元（free variable）变成图式变量，以此记下这条引理对这些变元的所有取值都成立。
:::

所以 conjI 对任意两个公式都适用。你可以用 `of` 自己选定这两个公式，`of` 按从左到右的顺序替换图式变量：

```isabelle
thm conjI[of "door_closed" "lift_stopped"]
```

```output result
⟦door_closed; lift_stopped⟧ ⟹ door_closed ∧ lift_stopped
```

这里的 `door_closed` 和 `lift_stopped` 是类型为 `bool` 的自由变元，比如说，关于一部电梯的两个事实（门已关好，电梯已停稳）。通常你不必手工选择：Isabelle 会通过合一自己找到正确的替换（第 7.3 节）。

### 模块 6 的规则 {#rules-table}

下面是 Isabelle 所陈述的模块 6 的规则。下面每条 `thm` 命令都显示几条规则，每行一条，顺序与命令中名字的顺序相同：

```isabelle
thm conjI conjunct1 conjunct2 conjE disjI1 disjI2 disjE
```

```output result
  ⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q
  ?P ∧ ?Q ⟹ ?P
  ?P ∧ ?Q ⟹ ?Q
  ⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R
  ?P ⟹ ?P ∨ ?Q
  ?Q ⟹ ?P ∨ ?Q
  ⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R
```

```isabelle
thm impI mp impE notI notE FalseE
```

```output result
  (?P ⟹ ?Q) ⟹ ?P ⟶ ?Q
  ⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q
  ⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R
  (?P ⟹ False) ⟹ ¬ ?P
  ⟦¬ ?P; ?P⟧ ⟹ ?R
  False ⟹ ?P
```

```isabelle
thm allI spec allE exI exE
```

```output result
  (⋀x. ?P x) ⟹ ∀x. ?P x
  ∀x. ?P x ⟹ ?P ?x
  ⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R
  ?P ?x ⟹ ∃x. ?P x
  ⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q
```

```isabelle
thm ccontr classical refl subst ssubst iffI iffD1 iffD2
```

```output result
  (¬ ?P ⟹ False) ⟹ ?P
  (¬ ?P ⟹ ?P) ⟹ ?P
  ?t = ?t
  ⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t
  ⟦?t = ?s; ?P ?s⟧ ⟹ ?P ?t
  ⟦?P ⟹ ?Q; ?Q ⟹ ?P⟧ ⟹ ?P = ?Q
  ⟦?Q = ?P; ?Q⟧ ⟹ ?P
  ⟦?P = ?Q; ?Q⟧ ⟹ ?P
```

下表把每条规则和它对应的纸上规则并排列出：

| 纸上规则（模块 6） | Isabelle 中的名字 | `thm` 显示的陈述 |
|---|---|---|
| (∧I) | `conjI` | `⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q` |
| (∧E₁) | `conjunct1` | `?P ∧ ?Q ⟹ ?P` |
| (∧E₂) | `conjunct2` | `?P ∧ ?Q ⟹ ?Q` |
| (∧E₁) 和 (∧E₂) 合在一起 | `conjE` | `⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R` |
| (∨I₁) | `disjI1` | `?P ⟹ ?P ∨ ?Q` |
| (∨I₂) | `disjI2` | `?Q ⟹ ?P ∨ ?Q` |
| (∨E) | `disjE` | `⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R` |
| (⟶I) | `impI` | `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q` |
| (⟶E) | `mp` | `⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q` |
| (⟶E)，消去形式 | `impE` | `⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R` |
| (¬I) | `notI` | `(?P ⟹ False) ⟹ ¬ ?P` |
| (¬E)，?R 取 ⊥ | `notE` | `⟦¬ ?P; ?P⟧ ⟹ ?R` |
| (⊥E) | `FalseE` | `False ⟹ ?P` |
| (∀I) | `allI` | `(⋀x. ?P x) ⟹ ∀x. ?P x` |
| (∀E) | `spec` | `∀x. ?P x ⟹ ?P ?x` |
| (∀E)，消去形式 | `allE` | `⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R` |
| (∃I) | `exI` | `?P ?x ⟹ ∃x. ?P x` |
| (∃E) | `exE` | `⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q` |
| (RAA) | `ccontr` | `(¬ ?P ⟹ False) ⟹ ?P` |
| (RAA)，变体 | `classical` | `(¬ ?P ⟹ ?P) ⟹ ?P` |
| (=I) | `refl` | `?t = ?t` |
| (=E) | `subst` | `⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t` |
| (=E)，从右到左 | `ssubst` | `⟦?t = ?s; ?P ?s⟧ ⟹ ?P ?t` |
| 无 | `iffI` | `⟦?P ⟹ ?Q; ?Q ⟹ ?P⟧ ⟹ ?P = ?Q` |
| 无 | `iffD1` | `⟦?Q = ?P; ?Q⟧ ⟹ ?P` |
| 无 | `iffD2` | `⟦?P = ?Q; ?Q⟧ ⟹ ?P` |

有几点值得注意：

- 名字遵循一种规律：`I` 表示引入（introduction），`E` 表示消去（elimination），`D` 表示析构（destruction，下文解释），`1` 和 `2` 表示一条规则的两个版本。`mp` 是 **modus ponens**（肯定前件式），`spec` 是 **specialisation**（特化），`refl` 是 **reflexivity**（自反性）。
- ⊥ 就是 `False`。Isabelle 显示 ¬ 时在后面加一个空格：`¬ ?P`。
- `notE` 的结论是任意公式 `?R`。取 `?R` 为 `False` 时，它就是 (¬E)，由 ¬P 和 P 推导出 ⊥。取 `?R` 为其他公式时，它相当于先用 (¬E) 再用 (⊥E)，而 (⊥E) 由 ⊥ 可以推导出任何公式。
- `ccontr` 恰好就是 (RAA)：如果假设 ¬P 会导致 ⊥，那么 P 成立。第 7.7 节会解释 `classical`。
- 对于公式，Isabelle 把 ⟷ 显示为 `=`（模块 3），所以 `iffI` 中的 `?P = ?Q` 就是 ?P ⟷ ?Q。模块 6 列出的规则中没有关于 ⟷ 的：`iffI` 由两个方向的蕴涵证明一个等价式，`iffD1` 和 `iffD2` 则按两个方向中的一个使用已有的等价式。

### 规则的三种形状 {#rules-shapes}

表中的大多数规则都属于三种形状之一。形状决定了你怎样使用一条规则（第 7.3 节和第 7.4 节），所以值得学会辨认它。

::: definition 引入规则、消去规则与析构规则
- **引入规则**（introduction rule）的联结词出现在结论中：`conjI`、`disjI1`、`disjI2`、`impI`、`notI`、`allI`、`exI`、`iffI`。
- **消去规则**（elimination rule）的联结词（或者 `False`）出现在第一个前提中，这个前提叫作**主前提**（major premise）；它的结论是一个任意的公式，即一个像 `?R` 这样的图式变量。它的其他前提说明在证明这个公式时可以假设什么：`conjE`、`disjE`、`impE`、`notE`、`FalseE`、`allE`、`exE`。
- **析构规则**（destruction rule）的联结词出现在主前提中，结论是主前提的一部分：`conjunct1`、`conjunct2`、`mp`、`spec`、`iffD1`、`iffD2`。
:::

对同一条纸上规则，Isabelle 常常提供两个版本：一条读起来和纸上规则一样的析构规则（`conjunct1`、`mp`、`spec`），以及一条做同样的工作、但形式更适合对假设进行推理的消去规则（`conjE`、`impE`、`allE`）。第 7.4 节会说明第二种形式好在哪里。

那些解除（discharge）假设或者需要本征变元（eigenvariable）的规则值得仔细看一看，因为 Pure 不用任何文字就表达了它们的附加条件（side condition）。

::: fact Pure 怎样表达解除和本征变元
- 在 `impI`，即 `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q` 中，前提 `?P ⟹ ?Q` 是 ?Q 的一个推导，其中可以使用假设 ?P：这就是模块 6 中的 [A]¹。这个假设恰好在该前提内部可用，所以不需要用编号来标记解除。
- 在 `disjE` 中，前提 `?P ⟹ ?R` 和 `?Q ⟹ ?R` 是两种情形，各有自己的假设。
- 在 `allI`，即 `(⋀x. ?P x) ⟹ ∀x. ?P x` 中，前提说的是“对任意的 x，?P x 成立”。变元 x 局限于这个前提之内，所以它不可能出现在外面的任何假设中。这正是 (∀I) 的本征变元条件。
- 在 `exE`，即 `⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q` 中，第二个前提说的是“对任意一个满足 ?P x 的 x，推导出 ?Q”。?Q 位于 ⋀x 的辖域（scope）之外，所以不能提到 x。这正是 (∃E) 的附加条件：本征变元不能出现在结论中。
:::

## 反向证明：rule 与 assumption {#backward}

### 证明思路 {#backward-plan}

以模块 6 用自然演绎推导出的第一个定理 A ∧ B ⟶ B ∧ A 为例（[第 6.4 节](module_06_ZH.html#connectives)）。下面是它的证明树：

```prooftree
A ∧ B ⟶ B ∧ A   (⟶I¹)
  B ∧ A   (∧I)
    B   (∧E₂)
      [A ∧ B]¹
    A   (∧E₁)
      [A ∧ B]¹
```

按你当初找到它的方式，从下往上读。这个公式是一个蕴涵，所以最后一步是 (⟶I)：假设 A ∧ B，证明 B ∧ A。B ∧ A 是一个合取，所以上面一步是 (∧I)，它留下 B 和 A。两者都可以从假设中得出，分别用 (∧E₂) 和 (∧E₁)。在 Isabelle 中，你按同样的顺序走同样的步骤。每一步说出一条规则的名字；Isabelle 把这条规则应用到目标上，并告诉你还剩下什么。

### 应用一条规则 {#backward-rule}

先陈述引理。有了名字 `swap_and`，以后就可以引用它：

```isabelle
lemma swap_and: "A ∧ B ⟶ B ∧ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟶ B ∧ A
```

`proof (prove)` 表示 Isabelle 正在等待证明步骤。它下面列出了仍有待证明的**子目标**（subgoal），并带有编号。一开始只有一个子目标：整个陈述。

::: definition 子目标与证明状态
**子目标**的形式是 `⋀x₁ … xₖ. ⟦H₁; …; Hₙ⟧ ⟹ C`：对变元 x₁ … xₖ 的任意取值（第 7.6 节），在**假设** H₁ … Hₙ 之下，证明**结论** C。变元和假设都可以没有。**证明状态**（proof state）是子目标的列表。列表为空时，证明就完成了。
:::

子目标就是模块 6 反向搜索中的目标 Γ ⊢ C（[第 6.7 节](module_06_ZH.html#search)），只不过是用 Pure 写的：假设 Γ 写在 ⟹ 前面，结论 C 写在它后面。

::: definition 证明方法 rule
`apply (rule r)` 把规则 r 反向应用到子目标 1 上。它把 r 的结论与子目标的结论合一（见下文的“合一”），然后把这个子目标换成若干个新的子目标，r 的每个前提对应一个。每个新的子目标都保留原来那个子目标的假设；形如 `P ⟹ Q` 的前提还会把 P 加入这些假设。
:::

第一步是 (⟶I)：

```isabelle
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

`impI` 是 `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q`。取 ?P = A ∧ B、?Q = B ∧ A，它的结论 `?P ⟶ ?Q` 就与目标相匹配，所以新的子目标就是它的前提，即 `A ∧ B ⟹ B ∧ A`。现在 A ∧ B 是一个假设。它在这个子目标中可用，在由这个子目标衍生出的每个子目标中也都可用，正像证明树中未解除的假设（open assumption）[A ∧ B]¹ 一样。

接下来是 (∧I)：

```isabelle
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ B
 2. A ∧ B ⟹ A
```

`conjI` 有两个前提，所以现在有两个子目标，证明树的每个分支对应一个。两者都保留了假设 A ∧ B。证明方法（proof method）作用于子目标 1；子目标 2 等着轮到它。

现在反向使用 (∧E₂)：

```isabelle
  apply (rule conjunct2)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ ?P5 ∧ B
 2. A ∧ B ⟹ A
```

`conjunct2` 是 `?P ∧ ?Q ⟹ ?Q`。它的结论 ?Q 与 B 相匹配，所以它的前提变成一个合取式：右半部分是 B，左半部分还不知道。Isabelle 在新的子目标中把这个左半部分保留为一个图式变量 `?P5`：它是变量 `?P` 加上数字 5，这个数字叫作它的**索引**（index），作用是避免与其他变量冲突（索引没有别的含义）。在纸上，你会看一眼假设，马上写下 A ∧ B。Isabelle 则把这个选择推迟，直到后面的某一步把它确定下来。

### 用假设关闭子目标 {#backward-assumption}

::: definition 证明方法 assumption
如果子目标 1 的结论能与它的某个假设合一，`apply assumption` 就证明了这个子目标。结论中的图式变量会按需要被实例化（instantiate），而且是在整个证明状态中处处实例化。
:::

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ A
```

把 `?P5 ∧ B` 与假设 `A ∧ B` 合一，就把 ?P5 定为 A，于是这个子目标被关闭了：这就是左边分支的叶子 [A ∧ B]¹。右边的分支用 `conjunct1` 以同样的方式处理，它的前提变成一个左边是 A 的合取式：

```isabelle
  apply (rule conjunct1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ A ∧ ?Q7
```

```isabelle
  apply assumption
```

```output state
proof (prove)
goal:
No subgoals!
```

Isabelle 显示“No subgoals!”（没有子目标了！）：已经没有剩下的子目标了。`done` 结束这个证明：

```isabelle
  done
```

::: definition 命令 done
`done` 在没有剩下子目标时结束一个证明。它自己不证明任何东西：只要还剩下子目标，`done` 就会失败（第 7.8 节）。
:::

现在 Isabelle 已经用这条引理的名字把它存储起来了：

```isabelle
thm swap_and
```

```output result
?A ∧ ?B ⟶ ?B ∧ ?A
```

自由变元 A 和 B 变成了图式变量。`swap_and` 对任意两个公式都成立，你可以像使用 `conjI` 那样把它当作规则来用。图 7.2 把证明树和证明脚本并排放在一起。

::: figure id=fig-07-2
A ∧ B ⟶ B ∧ A 的证明树和它的证明脚本。从根部开始，每个 `rule` 步骤给证明树添加一步推理；每个 `assumption` 步骤关闭一个叶子。每一步之后的目标列出了仍未关闭的分支。
:::

::: analogy
证明状态就是一张待办清单。每个 `apply` 从清单上取下第一项，并可能在原处放上几个新的、更小的事项；`done` 检查清单是否已经清空。
:::

### 合一 {#backward-unification}

::: definition 合一
**合一**（unification）通过为图式变量选择值，使两个项变得完全相同。Isabelle 每次应用规则时都要用到它：在 `rule` 中，合一的是规则的结论和子目标的结论；在 `assumption` 中，合一的是子目标的结论和某个假设。如果无论怎样选值都不能使两个项完全相同，这一步就失败了。
:::

| 项 1 | 项 2 | 合一的结果 |
|---|---|---|
| `?P ⟶ ?Q` | `A ∧ B ⟶ B ∧ A` | ?P = A ∧ B，?Q = B ∧ A |
| `?P5 ∧ B` | `A ∧ B` | ?P5 = A |
| `?P ∧ ?Q` | `A ∧ (B ∨ C)` | ?P = A，?Q = B ∨ C |
| `?P ∨ ?Q` | `B ∧ A` | 不可能：∨ 不是 ∧ |
| `A ∧ ?Q` | `B ∧ A` | 不可能：A 不是 B |

最后一行很重要。目标中的 A 和 B 不是图式变量：它们是自由变元，代表固定但任意的公式，合一永远不会替换它们。正因为如此，这个证明对每个 A 和 B 都成立：它从未用到关于它们的任何信息。

::: keyidea
在 Isabelle 中证明，就是从根部向上构造纸上的证明树。`rule` 在一个未关闭的分支顶端添加一步推理，`assumption` 在一个未解除的假设处关闭一个分支，而图式变量是证明树中你还没有填上的部分。
:::

## 使用假设：erule、drule 与 frule {#assumptions}

在第 7.3 节中，合取式 A ∧ B 就在假设当中，你却是从 B 和 A 出发反向推理，才得到它的两部分的，途中还要让 Isabelle 去猜 ?P5。在纸上，你的思路正好相反：你有 A ∧ B，所以把它拆开。消去规则和析构规则就是为此而设的，Isabelle 有三个证明方法，专门把它们应用到假设上。

### erule：拆开一个假设 {#assumptions-erule}

::: definition 证明方法 erule
`apply (erule r)` 把消去规则 r 应用到子目标 1 的某个假设上。它把 r 的主前提与一个假设合一，并把 r 的结论与子目标的结论合一。然后它删去那个假设，并为 r 的其余每个前提各产生一个新的子目标。
:::

用 `conjE`，即 `⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R`，效果是把一个假设 P ∧ Q 换成两个假设 P 和 Q。这样，交换 A 与 B 的那个证明就更短了：

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

```isabelle
  apply (erule conjE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A; B⟧ ⟹ B ∧ A
```

```isabelle
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ B
 2. ⟦A; B⟧ ⟹ A
```

```isabelle
  apply assumption
  apply assumption
  done
```

`erule conjE` 之后，A 和 B 是两个独立的假设，所以 B ∧ A 的每一半都由 `assumption` 关闭，什么也不用猜。这是使用已有合取式的常规做法。

### 分情形证明：disjE {#assumptions-cases}

析取消去 (∨E) 就是情形分析（case analysis）：要使用 A ∨ B，就先在假设 A 的情况下证明一次目标，再在假设 B 的情况下证明一次。下面是模块 6 中的 A ∨ B ⟶ B ∨ A：

```prooftree
A ∨ B ⟶ B ∨ A   (⟶I¹)
  B ∨ A   (∨E²)
    [A ∨ B]¹
    B ∨ A   (∨I₂)
      [A]²
    B ∨ A   (∨I₁)
      [B]²
```

```isabelle
lemma swap_or: "A ∨ B ⟶ B ∨ A"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∨ B ⟹ B ∨ A
```

```isabelle
  apply (erule disjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ B ∨ A
 2. B ⟹ B ∨ A
```

`disjE` 是 `⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R`。`erule` 把它的主前提与假设 A ∨ B 匹配，并删去了这个假设。另外两个前提变成了两种情形，各有自己的假设，也就是证明树中的 [A]² 和 [B]²。在第一种情形中，B ∨ A 由 A 通过 (∨I₂) 得出：

```isabelle
  apply (rule disjI2)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ A
 2. B ⟹ B ∨ A
```

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. B ⟹ B ∨ A
```

第二种情形用 (∨I₁)：

```isabelle
  apply (rule disjI1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. B ⟹ B
```

```isabelle
  apply assumption
  done
```

### drule 与 frule：正向推理 {#assumptions-drule}

::: definition 证明方法 drule 与 frule
`apply (drule r)` 正向应用析构规则 r。它把 r 的主前提与子目标 1 的某个假设合一，并删去那个假设。r 的其余每个前提都成为一个新的子目标，排在它们后面的是原来的子目标，只是多了 r 的结论作为新的假设。`apply (frule r)` 做的事情相同，但会保留它用过的那个假设。
:::

肯定前件式是典型的析构规则。模块 6 用三步 (⟶I) 和两步 (⟶E) 证明了 (A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)：

```prooftree
(A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)   (⟶I¹)
  (B ⟶ C) ⟶ (A ⟶ C)   (⟶I²)
    A ⟶ C   (⟶I³)
      C   (⟶E)
        [B ⟶ C]²
        B   (⟶E)
          [A ⟶ B]¹
          [A]³
```

在 Isabelle 中，这三个蕴涵变成了三个假设，证明树中的每个 (⟶I) 对应一步 `rule impI`：

```isabelle
lemma imp_chain: "(A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟶ B ⟹ (B ⟶ C) ⟶ A ⟶ C
```

```isabelle
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A ⟶ B; B ⟶ C⟧ ⟹ A ⟶ C
```

```isabelle
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A ⟶ B; B ⟶ C; A⟧ ⟹ C
```

假设出现的顺序与解除编号的顺序一致：[A ⟶ B]¹、[B ⟶ C]² 和 [A]³。Isabelle 去掉了 A ⟶ C 两边的括号，因为 ⟶ 向右结合（模块 2）。现在从证明树的叶子出发正向推理：由 A 和 A ⟶ B 得到 B。

```isabelle
  apply (drule mp)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦B ⟶ C; A⟧ ⟹ A
 2. ⟦B ⟶ C; A; B⟧ ⟹ C
```

`mp` 是 `⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q`。`drule` 把它的主前提与假设中的第一个蕴涵 A ⟶ B 匹配，并删去了这个假设。`mp` 的第二个前提，这里是 A，变成了子目标 1：要使用 A ⟶ B，你必须证明 A。子目标 2 是原来的目标，只是假设中多了结论 B。

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦B ⟶ C; A; B⟧ ⟹ C
```

再用 B ⟶ C 重复一遍：

```isabelle
  apply (drule mp)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ B
 2. ⟦A; B; C⟧ ⟹ C
```

```isabelle
  apply assumption
  apply assumption
  done
```

`erule impE` 和 `drule mp` 做的工作相同，因为 `impE` 是 `mp` 的消去形式；用哪一个，全凭个人喜好。

如果一个假设用过之后还需要再用，`frule` 就派上用场了。下面是一个小小的演示：`frule conjunct1` 加入了 A，但保留了 A ∧ B，所以 `drule conjunct2` 还能从中取出 B。

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (frule conjunct1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A ∧ B; A⟧ ⟹ B ∧ A
```

```isabelle
  apply (drule conjunct2)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A; B⟧ ⟹ B ∧ A
```

```isabelle
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

第 7.6 节中有一个非用 `frule` 不可的例子：一个要用两次的带量词的假设。

### 一次走多步：intro 与 elim {#assumptions-intro}

::: definition 证明方法 intro 与 elim
`apply (intro r₁ … rₙ)` 把给定的引入规则应用到子目标 1 上，然后再应用到由此产生的子目标上，只要其中还有规则适用，就一直这样做下去。`apply (elim r₁ … rₙ)` 对假设应用消去规则，做法相同。
:::

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (intro impI conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ B
 2. A ∧ B ⟹ A
```

```isabelle
  apply (elim conjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ B
 2. A ∧ B ⟹ A
```

```isabelle
  apply assumption
  apply (elim conjE)
  apply assumption
  done
```

`intro` 先应用了 `impI`，再应用了 `conjI`，把目标一分为二；`elim` 只拆开了子目标 1 中的合取式。在上面的 `imp_chain` 中，一步 `apply (intro impI)` 就可以代替三步 `rule impI`。

### 什么时候用哪个方法 {#assumptions-which}

| 情况 | 规则的种类 | 证明方法 | 例子 |
|---|---|---|---|
| 结论中有一个要拆开的联结词 | 引入规则 | `rule` | `apply (rule conjI)` |
| 某个假设中有一个要拆开的联结词 | 消去规则 | `erule` | `apply (erule disjE)` |
| 由某个假设可以得到一个新事实 | 析构规则 | `drule`；要保留这个假设就用 `frule` | `apply (drule mp)` |
| 结论就是某个假设 | 无 | `assumption` | `apply assumption` |
| 同一类的许多步骤 | 引入规则或消去规则 | `intro`、`elim` | `apply (intro impI conjI)` |

::: tip
先看子目标，再找规则。如果你想处理结论的主联结词（main connective），就用 `rule` 应用它的引入规则。如果你想使用某个假设，就用 `erule` 应用这个假设的联结词的消去规则。第 7.8 节会说明把两者弄混时会发生什么。
:::

## 否定与恒假 {#negation}

第 7.1 节说明了，HOL 和模块 6 一样，把 ¬A 定义为 A ⟶ False。否定的规则都由这个定义得出：

- `notI`，即 `(?P ⟹ False) ⟹ ¬ ?P`，就是 (¬I)：要证明 ¬A，就假设 A 并推导出 False。
- `notE`，即 `⟦¬ ?P; ?P⟧ ⟹ ?R`，在 ?R 为 False 时就是 (¬E)，否则就是先用 (¬E) 再用 (⊥E)：由 ¬A 和 A 可以得出任何公式。
- `FalseE`，即 `False ⟹ ?P`，就是 (⊥E)。

`notE` 要和 `erule` 一起用，它的效果值得记住：**要使用假设 ¬A，就去证明 A**。`erule notE` 删去 ¬A，并且不管原来的结论是什么，都把它变成 A。下面是模块 6 中的 ¬(A ∨ B) ⟶ ¬A ∧ ¬B：

```prooftree
¬(A ∨ B) ⟶ ¬A ∧ ¬B   (⟶I¹)
  ¬A ∧ ¬B   (∧I)
    ¬A   (¬I²)
      ⊥   (¬E)
        [¬(A ∨ B)]¹
        A ∨ B   (∨I₁)
          [A]²
    ¬B   (¬I³)
      ⊥   (¬E)
        [¬(A ∨ B)]¹
        A ∨ B   (∨I₂)
          [B]³
```

```isabelle
lemma "¬ (A ∨ B) ⟶ ¬ A ∧ ¬ B"
  apply (rule impI)
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ¬ (A ∨ B) ⟹ ¬ A
 2. ¬ (A ∨ B) ⟹ ¬ B
```

要证明 ¬A，就假设 A 并推导出 False，即 (¬I²)：

```isabelle
  apply (rule notI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦¬ (A ∨ B); A⟧ ⟹ False
 2. ¬ (A ∨ B) ⟹ ¬ B
```

只要证明了 A ∨ B，就能由 ¬(A ∨ B) 得出 False，即 (¬E)：

```isabelle
  apply (erule notE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ A ∨ B
 2. ¬ (A ∨ B) ⟹ ¬ B
```

```isabelle
  apply (rule disjI1)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ B) ⟹ ¬ B
```

后一半也一样，只是改用 `disjI2`：

```isabelle
  apply (rule notI)
  apply (erule notE)
  apply (rule disjI2)
  apply assumption
  done
```

当 False 本身就在假设中时，`erule FalseE` 会立即关闭这个子目标，因为 `FalseE` 没有其他前提：

```isabelle
lemma "False ⟶ A"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. False ⟹ A
```

```isabelle
  apply (erule FalseE)
  done
```

::: pitfall
`erule` 使用第一个合适的假设。如果有好几个否定形式的假设，`erule notE` 会取第一个，而它未必是你想要的那个。第 7.7 节有一个证明，其中第一个恰好就是对的；第 7.6 节则说明怎样指定你想要的公式（练习 7.5 需要用到）。
:::

## 量词与固定变元 {#quantifiers}

### ∀ 与固定变元 {#quantifiers-all}

模块 6 证明过：一个全称量化的合取式能给出两个全称量化的公式：

```prooftree
(∀x. P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x)   (⟶I¹)
  (∀x. P x) ∧ (∀x. Q x)   (∧I)
    ∀x. P x   (∀I)
      P a   (∧E₁)
        P a ∧ Q a   (∀E)
          [∀x. P x ∧ Q x]¹
    ∀x. Q x   (∀I)
      Q a   (∧E₂)
        P a ∧ Q a   (∀E)
          [∀x. P x ∧ Q x]¹
```

::: pitfall
有些书把这个公式写成 ∀x.(P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x)，让量词只作用于紧跟在它后面的括号。在 Isabelle 中，和模块 3、模块 6 一样，∀x 的辖域尽可能向右延伸，所以 `∀x. (P x ∧ Q x) ⟶ …` 会把整个蕴涵都放进量词里面。应该把括号加在量词外面：`(∀x. P x ∧ Q x) ⟶ …`。
:::

```isabelle
lemma "(∀x. P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x)"
  apply (rule impI)
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ∀x. P x ∧ Q x ⟹ ∀x. P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

子目标 1 要求证明 ∀x. P x，所以下一步是 (∀I)：

```isabelle
  apply (rule allI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. ∀x. P x ∧ Q x ⟹ P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

`allI`，即 `(⋀x. ?P x) ⟹ ∀x. ?P x`，把 HOL 的量词 ∀x 换成了 Pure 的量词 ⋀x。现在这个子目标读作：对任意的 x，假设 ∀x. P x ∧ Q x，证明 P x。假设里的 x 被它自己的 ∀ 约束，是另一个碰巧同名的变元。⋀ 后面的 x 才是那个任意的 x；纸上的证明树把它叫作 a。

::: definition 固定变元
在子目标最前面由 ⋀ 约束的变元叫作**固定变元**（fixed variable）；Isabelle 也把它叫作**参数**（parameter）。它代表一个任意的值：它只属于自己所在的子目标，合一永远不会替换它。`allI` 会产生一个固定变元，并借此保证了 (∀I) 的本征变元条件。
:::

现在用 (∀E) 的消去形式 `allE` 来使用这个假设：

```isabelle
  apply (erule allE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. P (?x7 x) ∧ Q (?x7 x) ⟹ P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

`allE`，即 `⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R`，把假设 ∀x. P x ∧ Q x 换成了它的一个实例（instance）P t ∧ Q t，其中的项 t 还没有选定。Isabelle 把这个项写成 `?x7 x`：一个作用于固定变元 x 的图式变量。这样写记下了一点：这个项可以由 x 构造出来，因为 x 在这个未知量产生之前就已经固定了。

```isabelle
  apply (erule conjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. ⟦P (?x7 x); Q (?x7 x)⟧ ⟹ P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

`assumption` 把 P (?x7 x) 与 P x 合一，于是这个项就是 x 本身：为 (∀E) 选定的实例正是那个任意的 x，就像证明树在两处都用 a 一样。后一半的做法相同，只是这一次通过 `drule` 使用 (∀E) 的析构形式 `spec`：

```isabelle
  apply (rule allI)
  apply (drule spec)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x. P (?x13 x) ∧ Q (?x13 x) ⟹ Q x
```

```isabelle
  apply (erule conjE)
  apply assumption
  done
```

::: pitfall
⟹ 比 ∀ 结合得弱。所以 `∀x. P x ⟹ P x` 并不是关于同一个 x 的陈述：它的意思是 (∀x. P x) ⟹ P x，结论中的 x 是一个自由变元，与约束的那个 x 毫无关系。存储下来的定理表明了这一点：

```isabelle
lemma all_inst: "∀x. P x ⟹ P x"
  apply (erule allE)
  apply assumption
  done

thm all_inst
```

```output result
∀x. ?P x ⟹ ?P ?x
```

结论中的 x 变成了 `?x`，一个单独的图式变量。在这里这并无害处，因为这条引理本身就是 (∀E)。但如果你想表达的是“对每个 x，P x 蕴涵 P x”，就要写成 `⋀x. P x ⟹ P x` 或 `∀x. P x ⟶ P x`。
:::

### ∃ 与步骤的顺序 {#quantifiers-ex}

`exI`，即 `?P ?x ⟹ ∃x. ?P x`，就是 (∃I)：要证明 ∃x. P x，就对某个项 t 证明 P t，t 就是见证（witness）。反向使用时，它把见证留作一个未知量，以后再由合一确定。`exE`，即 `⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q`，就是 (∃E)：要使用 ∃x. P x，就取一个使 P x 成立的新的 x。和 `erule` 一起用时，它把假设 ∃x. P x 变成一个固定变元 x 和一个假设 P x。

模块 6 的例子交换了 ∃x. ∀y. R x y 中的两个量词。把 R x y 读作“钥匙 x 能打开门 y”：一把万能钥匙能打开每扇门，所以每扇门都有一把钥匙。

```prooftree
(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)   (⟶I¹)
  ∀y. ∃x. R x y   (∀I)
    ∃x. R x b   (∃E²)
      [∃x. ∀y. R x y]¹
      ∃x. R x b   (∃I)
        R a b   (∀E)
          [∀y. R a y]²
```

从下往上读：先是 (⟶I)，然后是本征变元为 b 的 (∀I)，然后是本征变元为 a 的 (∃E)，然后是以 a 为见证的 (∃I)，最后是以 b 为实例的 (∀E)。在 Isabelle 中：

```isabelle
lemma ex_all: "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
  apply (rule impI)
  apply (rule allI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y. ∃x. ∀y. R x y ⟹ ∃x. R x y
```

```isabelle
  apply (erule exE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. ∀y. R x y ⟹ ∃x. R x y
```

现在有两个固定变元：y 由 `allI` 固定（即证明树中的 b），x 由 `exE` 固定（即 a）。

```isabelle
  apply (rule exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. ∀y. R x y ⟹ R (?x6 y x) y
```

见证是一个作用于两个固定变元的未知量：它可以由 y 和 x 构造出来。

```isabelle
  apply (erule allE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. R x (?y8 y x) ⟹ R (?x6 y x) y
```

```isabelle
  apply assumption
  done
```

`assumption` 取 x 作为见证、y 作为 ∀y 的实例，使 ⟹ 的两边完全相同。

### 先固定，后猜测 {#quantifiers-order}

如果在消去另一个量词之前就引入存在量词，会怎样？在 `exE` 之前应用 `exI`：

```isabelle
lemma "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
  apply (rule impI)
  apply (rule allI)
  apply (rule exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y. ∃x. ∀y. R x y ⟹ R (?x4 y) y
```

```isabelle
  apply (erule exE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. ∀y. R x y ⟹ R (?x4 y) y
```

```isabelle
  apply (erule allE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y
```

现在见证是 `?x4 y`。它产生的时候只有 y 已经固定，所以它可以由 y 构造，却不能由 x 构造，因为 x 是 `exE` 后来才固定的。要关闭这个子目标，Isabelle 必须使 ⟹ 的两边完全相同，而这需要见证就是 x。合一不允许这样做，所以 `assumption` 失败了，Isabelle 报告“Failed to apply proof method”（未能应用证明方法）：

```isabelle fails
  apply assumption
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. ⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y
```

其他证明方法也帮不上忙。证明卡住了，唯一的出路是退回去：

```isabelle
  oops
```

在纸上也会发生同样的事情。在证明树中把 (∃I) 放在 (∃E) 下面，就意味着要在 (∃E) 的本征变元 a 出现之前选定见证。唯一可行的见证是 a，可那样一来，(∃E) 的结论就会提到它自己的本征变元，而附加条件禁止这样做。Isabelle 的检查只是同一个条件的另一种形式。

::: keyidea
**先固定，后猜测。** `rule allI` 和 `erule exE` 固定变元；`rule exI`、`erule allE` 和 `drule spec` 产生未知量。一个未知量只能变成由它产生之前就已固定的变元构造出的项。所以，先应用固定变元的规则，再应用产生未知量的规则。这正是第 6.7 节的建议：先打开存在量词的假设，再选择实例和见证；而 Isabelle 的未知量说明了这条建议为什么行得通。
:::

如果一个陈述不是有效的（valid），那么什么顺序都不行。逆命题（converse）(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y) 说的是：如果每扇门都有钥匙，那么存在一把万能钥匙。[第 6.6 节](module_06_ZH.html#quantifiers)给出了一个反模型（countermodel），练习 7.9 则让你亲眼看着证明的尝试卡住。

### 自己选定实例 {#quantifiers-inst}

只有当目标显示出见证必须是什么时，合一才能找到它。下面这个目标就没有显示出来：

```isabelle
lemma "∃n::nat. n + n = 6"
  apply (rule exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ?n + ?n = 6
```

没有哪个假设说明 `?n` 应该是哪个数，而 `simp`（模块 1）不会求出等式中的未知量：

```isabelle fails
  apply simp
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. ?n + ?n = 6
```

```isabelle
  oops
```

自己说出见证：

```isabelle
lemma "∃n::nat. n + n = 6"
  apply (rule_tac x = 3 in exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. 3 + 3 = 6
```

```isabelle
  apply simp
  done
```

::: definition 证明方法 rule_tac、erule_tac、drule_tac 与 frule_tac
`apply (rule_tac x = t in r)` 先把规则 r 的图式变量 `?x` 换成项 t，再像 `rule` 那样应用 r。变量名按 `thm r` 显示的那样写，但不带问号；除非 t 是单个名字或数字，否则要给它加上引号；几个实例化之间用 `and` 隔开。`erule_tac`、`drule_tac` 和 `frule_tac` 的用法相同。另一种做法是用 `of`（第 7.2 节）实例化规则，再应用得到的结果：`apply (rule exI[of _ 3])`，其中 `_` 跳过 ?P。
:::

合一也可能选错。下面是一个小小的不变式（invariant）论证：如果从一个安全状态出发的每一步都通向一个安全状态，并且 s 是安全的，那么从 s 出发走两步，到达的也是一个安全状态。

```isabelle
lemma "⟦∀x. safe x ⟶ safe (step x); safe s⟧ ⟹ safe (step (step s))"
  apply (frule spec)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦∀x. safe x ⟶ safe (step x); safe s; safe ?x ⟶ safe (step ?x)⟧
    ⟹ safe (step (step s))
```

带量词的假设要用两次，每一步用一次，所以 `frule spec` 在加入一个带未知量 `?x` 的实例的同时保留了它。`erule impE` 使用这个实例；它的前提 `safe ?x` 变成子目标 1，`assumption` 取 ?x = s 关闭了这个子目标：

```isabelle
  apply (erule impE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦∀x. safe x ⟶ safe (step x); safe s; safe (step s)⟧
    ⟹ safe (step (step s))
```

对第二步，用同样的三个证明方法：

```isabelle
  apply (erule allE)
  apply (erule impE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦safe s; safe (step s); safe (step s)⟧ ⟹ safe (step (step s))
```

这一次，`assumption` 有两个候选的假设可以与 `safe ?x` 合一：safe s 和 safe (step s)。它取了第一个，于是未知量又变成了 s，证明就卡住了：没有哪个假设说 safe (step (step s))。

```isabelle
  oops
```

告诉 Isabelle 你想要哪个实例：

```isabelle
lemma safe_twice: "⟦∀x. safe x ⟶ safe (step x); safe s⟧ ⟹ safe (step (step s))"
  apply (frule spec)
  apply (erule impE)
  apply assumption
  apply (erule_tac x = "step s" in allE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦safe s; safe (step s); safe (step s) ⟶ safe (step (step s))⟧
    ⟹ safe (step (step s))
```

```isabelle
  apply (erule impE)
  apply assumption
  apply assumption
  done
```

这类关于系统所能到达的每个状态的论证，会在模块 13 中再次出现。

## 经典推理与相等 {#classical}

### 反证法 {#classical-raa}

到目前为止用到的规则都是直觉主义的（intuitionistic）：其中没有一条是 (RAA)。模块 6 说明了，有些重言式（tautology）不用 (RAA) 就推导不出来（[第 6.5 节](module_06_ZH.html#classical)），排中律（law of excluded middle）A ∨ ¬A 就是标准的例子。不用 (RAA) 试试看：

```isabelle
lemma "A ∨ ¬ A"
  apply (rule disjI1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A
```

A 是不可证的：关于 A，什么也不知道。`disjI2` 会留下 ¬A，也好不到哪里去。放弃这次尝试：

```isabelle
  oops
```

出路是 (RAA)，它在 Isabelle 中就是 `ccontr`。下面是第 6.5 节中的推导：

```prooftree
A ∨ ¬A   (RAA¹)
  ⊥   (¬E)
    [¬(A ∨ ¬A)]¹
    A ∨ ¬A   (∨I₂)
      ¬A   (¬I²)
        ⊥   (¬E)
          [¬(A ∨ ¬A)]¹
          A ∨ ¬A   (∨I₁)
            [A]²
```

```isabelle
lemma "A ∨ ¬ A"
  apply (rule ccontr)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ ¬ A) ⟹ False
```

这就是 (RAA¹)：假设目标的否定，推导出 False。下一步是证明树底部的那个 (¬E)，反向使用：

```isabelle
  apply (rule notE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ¬ (A ∨ ¬ A) ⟹ ¬ ?P2
 2. ¬ (A ∨ ¬ A) ⟹ ?P2
```

要推导出 False，就要找一个公式 `?P2`，使 ¬?P2 和 ?P2 都成立。这一步用的是 `rule notE`，而不是 `erule notE`，因为在证明树中更靠上的地方还要再用到假设 ¬(A ∨ ¬A)，而 `erule` 会把它删去。

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ ¬ A) ⟹ A ∨ ¬ A
```

子目标 1 与假设合一，这把 ?P2 定为 A ∨ ¬A：这就是叶子 [¬(A ∨ ¬A)]¹。剩下的步骤沿着证明树走：(∨I₂)、(¬I²)、(¬E) 和 (∨I₁)。

```isabelle
  apply (rule disjI2)
  apply (rule notI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦¬ (A ∨ ¬ A); A⟧ ⟹ False
```

```isabelle
  apply (erule notE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟹ A ∨ ¬ A
```

```isabelle
  apply (rule disjI1)
  apply assumption
  done
```

前三步，即 `rule ccontr`、`rule notE` 和 `assumption`，合起来完成的工作相当于一条规则 `classical`，即 `(¬ ?P ⟹ ?P) ⟹ ?P`：假设目标的否定，然后证明目标本身。

```isabelle
lemma "A ∨ ¬ A"
  apply (rule classical)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ ¬ A) ⟹ A ∨ ¬ A
```

```isabelle
  apply (rule disjI2)
  apply (rule notI)
  apply (erule notE)
  apply (rule disjI1)
  apply assumption
  done
```

库中已经有这条定律，只是两个析取项的顺序相反：

```isabelle
thm excluded_middle
```

```output result
¬ ?P ∨ ?P
```

### 一条德摩根律 {#classical-demorgan}

第 6.5 节说明了，在德摩根律（De Morgan's laws）的四个方向中，有一个需要 (RAA)：¬(A ∧ B) ⟶ ¬A ∨ ¬B。思路是：假设 ¬A ∨ ¬B 为假。那么 A 必定成立，否则 ¬A ∨ ¬B 就成立了；B 也是一样。但 A ∧ B 与 ¬(A ∧ B) 矛盾。

```prooftree
¬(A ∧ B) ⟶ ¬A ∨ ¬B   (⟶I¹)
  ¬A ∨ ¬B   (RAA²)
    ⊥   (¬E)
      [¬(A ∧ B)]¹
      A ∧ B   (∧I)
        A   (RAA³)
          ⊥   (¬E)
            [¬(¬A ∨ ¬B)]²
            ¬A ∨ ¬B   (∨I₁)
              [¬A]³
        B   (RAA⁴)
          ⊥   (¬E)
            [¬(¬A ∨ ¬B)]²
            ¬A ∨ ¬B   (∨I₂)
              [¬B]⁴
```

```isabelle
lemma de_morgan_and: "¬ (A ∧ B) ⟶ ¬ A ∨ ¬ B"
  apply (rule impI)
  apply (rule ccontr)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦¬ (A ∧ B); ¬ (¬ A ∨ ¬ B)⟧ ⟹ False
```

```isabelle
  apply (erule notE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (¬ A ∨ ¬ B) ⟹ A ∧ B
```

`erule notE` 取了第一个否定形式的假设 ¬(A ∧ B)，留下它的反面 A ∧ B 有待证明：这就是证明树底部的那个 (¬E)，它的第一个前提是 [¬(A ∧ B)]¹。A ∧ B 的每一半又各是一次反证法（proof by contradiction）：

```isabelle
  apply (rule conjI)
  apply (rule ccontr)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦¬ (¬ A ∨ ¬ B); ¬ A⟧ ⟹ False
 2. ¬ (¬ A ∨ ¬ B) ⟹ B
```

```isabelle
  apply (erule notE)
  apply (rule disjI1)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (¬ A ∨ ¬ B) ⟹ B
```

```isabelle
  apply (rule ccontr)
  apply (erule notE)
  apply (rule disjI2)
  apply assumption
  done
```

德摩根律的另外三个方向都不需要经典规则；练习 7.5 要你证明其中的两个。

### 相等 {#classical-eq}

`refl`，即 `?t = ?t`，就是 (=I)；`subst`，即 `⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t`，就是 (=E)：如果 s = t，并且某个性质对 s 成立，那么它对 t 也成立。性质 `?P` 是一个函数类型的图式变量，合一会用一个函数来填充它。模块 6 由这两条规则推导出了对称性（[第 6.8 节](module_06_ZH.html#equality)），其中取 P x 为 x = s。写成一条由 s = t 得出 t = s 的规则，推导就是：

```prooftree
t = s   (=E)
  s = t
  s = s   (=I)
```

这里 (=E) 用的是性质“等于 s”：它对 s 成立，所以对 t 也成立。

```isabelle
lemma "s = t ⟹ t = s"
  apply (erule subst)
```

```output state
proof (prove)
goal (1 subgoal):
 1. s = s
```

`erule` 把主前提 `?s = ?t` 与假设 s = t 合一，又把结论 `?P t` 与 t = s 合一。对于后者，Isabelle 必须找到一个性质 ?P，使 ?P t 就是 t = s。新的子目标显示了它选的是哪一个：性质“等于 s”，因为剩下的前提 ?P s 变成了 s = s。`refl` 能证明它：

```isabelle
  apply (rule refl)
  done
```

在日常的证明中，你很少手工使用 `subst`，因为化简器（simplifier）会自动用等式进行重写（rewriting，模块 9）。但在自然演绎中，这种重写的含义正是 `subst`。

### 等价 {#classical-iff}

对于 ⟷，`iffI` 把一个目标变成两个蕴涵。注意 Isabelle 是怎样显示这个目标的：

```isabelle
lemma "A ∧ B ⟷ B ∧ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. (A ∧ B) = (B ∧ A)
```

对于公式，⟷ 和 = 是一回事，Isabelle 把两者都显示为 =。`iffI` 给出两个方向：

```isabelle
  apply (rule iffI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ B ∧ A
 2. B ∧ A ⟹ A ∧ B
```

每个子目标都又是那条交换引理，只是没有了蕴涵：

```isabelle
  apply (erule conjE)
  apply (rule conjI)
  apply assumption
  apply assumption
  apply (erule conjE)
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

要使用一个已有的等价式，`iffD1` 和 `iffD2` 的作用就像两个方向上的 `mp`。

## When a step fails {#errors}

Any step can fail, and Isabelle's messages are short. This section collects the ones you will meet,
with their causes and fixes. Isabelle marks the step that failed and shows the proof state it was given.
The steps before it are not affected, so you can replace the failing step with another.

### Failed to apply proof method {#errors-apply}

This is the most common message. It means that the method could do nothing with subgoal 1: for `rule`,
the conclusion of the rule does not unify with the conclusion of the subgoal; for `erule`, either that or
no assumption fits the rule's major premise; for `drule` and `frule`, no assumption fits the major
premise; for `assumption`, no assumption unifies with the conclusion. Isabelle shows the proof state it
was given. Here is the early choice of a side that Module 6 warned about (Section 6.4), followed by a
hopeful `assumption`:

```isabelle fails
lemma "A ∨ ¬ A"
  apply (rule disjI1)
  apply assumption
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. A
```

`disjI1` left the subgoal A, which has no assumptions at all, so `assumption` has nothing to unify with.
Three other causes are common. Each gives the same message, followed by the proof state as it was before
the failing step.

**Taking an assumption apart before it is one.** In the goal A ∧ B ⟶ B ∧ A, the conjunction A ∧ B is
not an assumption; it is part of the implication, so `erule conjE` finds nothing to work on:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (erule conjE)
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. A ∧ B ⟶ B ∧ A
```

Apply `impI` first: it moves A ∧ B into the assumptions.

**Expecting assumption to look inside a formula.** After `impI` and `conjI`, subgoal 1 is A ∧ B ⟹ B. B
is part of the assumption, but it is not the assumption, so `assumption` fails:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (rule conjI)
  apply assumption
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (2 subgoals):
***  1. A ∧ B ⟹ B
***  2. A ∧ B ⟹ A
```

`assumption` only unifies whole formulas. Take the assumption apart first, with `erule conjE`.

**Using a rule for the wrong connective.** `disjI1` concludes a disjunction, but the conclusion of the
subgoal A ∧ B ⟹ B ∧ A is a conjunction:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (rule disjI1)
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. A ∧ B ⟹ B ∧ A
```

When in doubt, look the rule up with `thm`: for `rule`, its conclusion must have the same main connective
as the conclusion of the subgoal.

### Undefined fact {#errors-name}

A misspelt rule name gives a different message. Many rule names end in a capital I, which looks much
like a lower-case l:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (rule conjl)
  done
```

```output
*** Undefined fact: "conjl"⌂
```

### Failed to finish proof {#errors-done}

`done` fails if subgoals remain, and lists them. Take the same early choice as above and write `done`
straight after it:

```isabelle fails
lemma "A ∨ ¬ A"
  apply (rule disjI1)
  done
```

```output
*** Failed to finish proof:
*** goal (1 subgoal):
***  1. A
```

`done` never proves anything itself, not even a subgoal whose conclusion is one of its assumptions. Add
the missing steps or, if the subgoal left is unprovable, as here, go back and choose differently. (A
one-line proof `by m`, as in `by blast`, behaves a little differently: after the method m, it closes the
subgoals that are left by assumption, and reports Failed to finish proof only if something else
remains.)

### Forgetting done {#errors-forget}

Without `done`, the proof is still open when the next command arrives, and the next lemma is refused:

```isabelle fails
lemma "A ⟶ A"
  apply (rule impI)
  apply assumption

lemma "B ⟶ B"
```

```output
*** Bad context for command "lemma"⌂
```

A lemma cannot start inside a proof. Add `done` after the last `apply`. If the unfinished proof is the
last one in the theory, `end` is refused instead, with the message "Illegal application of proof command
in "prove" mode".

### A detour, not an error: rule instead of erule {#errors-rule}

Some mistakes produce no error at all, only a strange proof state. Applying an elimination rule with
`rule` instead of `erule` is the usual one:

```isabelle
lemma "A ∨ B ⟶ B ∨ A"
  apply (rule impI)
  apply (rule disjE)
```

```output state
proof (prove)
goal (3 subgoals):
 1. A ∨ B ⟹ ?P2 ∨ ?Q2
 2. ⟦A ∨ B; ?P2⟧ ⟹ B ∨ A
 3. ⟦A ∨ B; ?Q2⟧ ⟹ B ∨ A
```

`rule` unified only the conclusion ?R of `disjE` with B ∨ A. The major premise became subgoal 1, so
Isabelle asks you to prove some disjunction it does not know yet, and the two cases speak of unknown
formulas. `apply assumption` would repair this by unifying the unknown disjunction with A ∨ B, and the
result would be the `erule` version with the assumption A ∨ B kept in both cases. Use `erule` from the
start.

```isabelle
  oops
```

::: trouble
- **Failed to apply proof method**: the rule does not fit subgoal 1, or no assumption fits its major
  premise. Check the main connective; use `impI` before taking an assumption apart; read the rule with
  `thm`.
- **Undefined fact**: a misspelt rule name, such as `conjl` for `conjI`.
- **Failed to finish proof**: subgoals remain at `done`; they are listed.
- **Bad context for command "lemma"**: the previous proof has no `done`.
- **Inner syntax error … Failed to parse prop**: a mistake in the statement itself, such as ⟹ inside a
  formula (Section 7.1).
- **A subgoal that cannot be closed, with unknowns such as `?x4 y`**: a quantifier rule came too early.
  Fix variables before you create unknowns (Section 7.6).
:::

## Letting Isabelle search: blast and auto {#blast}

Module 6 ended by letting `blast` prove its derivations ([Section 6.9](module_06_EN.html#isabelle)). You
have now done by hand what `blast` does automatically. `blast` belongs to Isabelle's **classical
reasoner**, a family of proof methods built on natural-deduction rules. It applies introduction and
elimination rules like the ones in this module: the safe ones of Section 6.7 freely, the others as
choices. When a choice leads nowhere, it goes back and tries another, and in the end it either finds a
complete proof or fails. Each example of this module takes a single call:

```isabelle
lemma "¬ (A ∧ B) ⟶ ¬ A ∨ ¬ B"
  by blast

lemma "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
  by blast

lemma "⟦∀x. safe x ⟶ safe (step x); safe s⟧ ⟹ safe (step (step s))"
  by blast
```

`blast` found the instance step s that unification alone got wrong in Section 7.6: when one choice
fails, it tries another. And whatever `blast` finds, the theorem is built by Isabelle's kernel from the
rules of the logic, as for every other method (Module 1).

When the statement is not valid, `blast` fails, as Section 6.9 showed for the master key:

```isabelle fails
lemma "(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)
```

With `by`, Isabelle calls the method the *initial* proof method, so the message says only that `blast`
found no proof. It does not say whether the statement is false or too hard for `blast`; `nitpick`
(Modules 2 and 3) can look for a counterexample. `auto` behaves differently: it does what it can and
shows you what is left.

```isabelle
lemma "(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)"
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀y. ∃x. R x y ⟹ ∃x. ∀y. R x y
```

```isabelle
  oops
```

`auto` turned the implication into an assumption and stopped there. `auto` combines classical reasoning
with the simplifier, and leaves the subgoals it cannot prove; Module 9 covers it in depth. `blast` does
no rewriting and knows little about equality, but *Programming and Proving in Isabelle/HOL* calls it "the
method of choice for complex logical goals".

So which should you use? For routine logic, `blast` or `auto`. But automation fails often enough, on
goals that are too big or not quite true, and then the manual steps are how you find out why: apply a
few rules by hand, look at the subgoals, and call `blast` on the pieces, or discover that one of them
cannot be proved. That is why this module did everything by hand first.

::: tip
A good routine when `blast` fails: apply the obvious introduction rules with `intro` (`impI`, `allI`,
`conjI`, …) and take apart the obvious assumptions with `elim` (`conjE`, `exE`, …). Then try `blast` on
each subgoal. A subgoal that looks false is a hint that the whole statement may be false; try `nitpick`
on the lemma.
:::

## What you learned {#summary}

- Isabelle has two levels of logic: the meta-logic **Pure**, with ⟹, ⋀ and ≡, in which rules and goals
  are written, and the object logic **HOL**, with ¬ ∧ ∨ ⟶ ∀ ∃ and =, in which formulas are written.
- A rule is a theorem: `thm conjI` shows `⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q`. **Schematic variables** such as `?P` can
  be replaced by any term: by **unification** automatically, or by hand with `of` and `rule_tac`.
- Each rule of Module 6 has an Isabelle name: `conjI`, `conjunct1`, `conjunct2`, `conjE`, `disjI1`,
  `disjI2`, `disjE`, `impI`, `mp`, `impE`, `notI`, `notE`, `FalseE`, `allI`, `spec`, `allE`, `exI`,
  `exE`, `ccontr`, `classical`, `refl` and `subst`.
- A proof script builds the paper tree from the root: `rule` applies an introduction rule to the
  conclusion; `erule`, `drule` and `frule` apply elimination and destruction rules to assumptions;
  `assumption` closes a branch; `intro` and `elim` repeat; `done` checks that nothing is left.
- `allI` and `exE` create **fixed variables** (⋀x), which enforce the eigenvariable conditions; `exI`,
  `allE` and `spec` create unknowns. Fix first, guess later.
- Classical proofs use `ccontr`, which is (RAA), or `classical`.
- The common messages are Failed to apply proof method, Undefined fact, Failed to finish proof and Bad
  context for command.
- `blast` searches with the same rules and either succeeds or fails; `auto` shows what it could not
  prove.

## Exercises {#exercises}

:::: exercise Read a rule {#ex-7-1} ★
`thm impE` prints `⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R`.

1. Which premise is the major premise?
2. Which premise has an assumption of its own, and what is it?
3. Draw the rule as a paper rule, in the style of Module 6.
4. With which method do you normally use `impE`? What does it do to the subgoal ⟦A ⟶ B; A⟧ ⟹ C?

::: solution
1. `?P ⟶ ?Q`: it contains the connective that the rule eliminates.
2. The third, `?Q ⟹ ?R`: while proving ?R you may assume ?Q.
3. As a paper rule, with the discharged assumption marked:

   $$
   \dfrac{\begin{matrix}\\ \\ P \imp Q\end{matrix} \qquad \begin{matrix}\\ \\ P\end{matrix} \qquad \begin{matrix}[Q]^1\\ \vdots\\ R\end{matrix}}{R}\;(\mathrm{impE}^1)
   $$

4. With `erule`. It removes the assumption A ⟶ B and leaves two subgoals: prove A, and then prove C
   with B as an extra assumption.

   ```isabelle
   lemma "⟦A ⟶ B; A⟧ ⟹ C"
     apply (erule impE)
   ```

   ```output state
   proof (prove)
   goal (2 subgoals):
    1. A ⟹ A
    2. ⟦A; B⟧ ⟹ C
   ```

   The first subgoal is closed by `assumption`; the second cannot be proved, because C is unrelated to A
   and B, so abandon the attempt:

   ```isabelle
     oops
   ```
:::
::::

:::: exercise From tree to script {#ex-7-2} ★
Write an apply script that follows this tree step by step. Say which command closes which leaf. Then check
your script in Isabelle.

```prooftree
A ⟶ B ⟶ A ∧ B   (⟶I¹)
  B ⟶ A ∧ B   (⟶I²)
    A ∧ B   (∧I)
      [A]¹
      [B]²
```

::: solution
Two `impI` steps for (⟶I¹) and (⟶I²), one `conjI` step for (∧I), and one `assumption` for each leaf:

```isabelle
lemma "A ⟶ B ⟶ A ∧ B"
  apply (rule impI)
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A; B⟧ ⟹ A ∧ B
```

```isabelle
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

The first `assumption` closes the leaf [A]¹ (subgoal 1 is A), the second closes [B]².
:::
::::

:::: exercise Which method? {#ex-7-3} ★
For each subgoal, name the first step you would take (method and rule), and say what is left after it.
Then finish each proof in Isabelle.

1. `⟦A; B⟧ ⟹ B ∧ A`
2. `A ∧ B ⟹ B`
3. `¬ A ⟹ A ⟶ B`
4. `∀x. P x ⟹ P c`
5. `P c ⟹ ∃x. P x`

::: solution
1. `rule conjI` leaves B and A, each closed by `assumption`.
2. `erule conjE` leaves ⟦A; B⟧ ⟹ B, closed by `assumption`.
3. `rule impI` leaves ⟦¬ A; A⟧ ⟹ B. Then `erule notE` turns the goal into A, closed by `assumption`.
4. `erule allE` replaces the assumption with an instance P t, where t is an unknown, and `assumption`
   sets t to c. (`drule spec` works too.)
5. `rule exI` leaves P t to prove, with an unknown witness t, and `assumption` sets t to c.

```isabelle
lemma "⟦A; B⟧ ⟹ B ∧ A"
  apply (rule conjI)
  apply assumption
  apply assumption
  done

lemma "A ∧ B ⟹ B"
  apply (erule conjE)
  apply assumption
  done

lemma "¬ A ⟹ A ⟶ B"
  apply (rule impI)
  apply (erule notE)
  apply assumption
  done

lemma "∀x. P x ⟹ P c"
  apply (erule allE)
  apply assumption
  done

lemma "P c ⟹ ∃x. P x"
  apply (rule exI)
  apply assumption
  done
```
:::
::::

:::: exercise Currying {#ex-7-4} ★★
Exercise 6.4 derived these two formulas on paper. Prove them in Isabelle with `rule`, `erule`, `drule` and
`assumption`:

1. `(A ⟶ B ⟶ C) ⟶ (A ∧ B ⟶ C)`
2. `(A ∧ B ⟶ C) ⟶ (A ⟶ B ⟶ C)`

::: solution
In the first, take the conjunction apart and use the nested implication twice, with `drule mp`:

```isabelle
lemma "(A ⟶ B ⟶ C) ⟶ (A ∧ B ⟶ C)"
  apply (rule impI)
  apply (rule impI)
  apply (erule conjE)
  apply (drule mp)
  apply assumption
  apply (drule mp)
  apply assumption
  apply assumption
  done
```

In the second, `erule impE` asks you to prove A ∧ B, which `conjI` splits:

```isabelle
lemma "(A ∧ B ⟶ C) ⟶ (A ⟶ B ⟶ C)"
  apply (rule impI)
  apply (rule impI)
  apply (rule impI)
  apply (erule impE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ A ∧ B
 2. ⟦A; B; C⟧ ⟹ C
```

```isabelle
  apply (rule conjI)
  apply assumption
  apply assumption
  apply assumption
  done
```
:::
::::

:::: exercise Two De Morgan laws without RAA {#ex-7-5} ★★
Exercise 6.5 and Section 6.5 derived `¬ A ∨ ¬ B ⟶ ¬ (A ∧ B)` and `¬ A ∧ ¬ B ⟶ ¬ (A ∨ B)` on paper. Prove
both in Isabelle without `ccontr` or `classical`. In the second you will meet the pitfall of Section 7.5:
`erule notE` takes the first negated assumption. Name the one you want with `erule_tac P = B in notE`
(the variable of `notE` is called P).

::: solution
```isabelle
lemma "¬ A ∨ ¬ B ⟶ ¬ (A ∧ B)"
  apply (rule impI)
  apply (rule notI)
  apply (erule conjE)
  apply (erule disjE)
  apply (erule notE)
  apply assumption
  apply (erule notE)
  apply assumption
  done
```

In the second law, the case split leaves two subgoals with both ¬A and ¬B among the assumptions:

```isabelle
lemma "¬ A ∧ ¬ B ⟶ ¬ (A ∨ B)"
  apply (rule impI)
  apply (erule conjE)
  apply (rule notI)
  apply (erule disjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦¬ A; ¬ B; A⟧ ⟹ False
 2. ⟦¬ A; ¬ B; B⟧ ⟹ False
```

In the first case, ¬A is the right one, and it comes first. In the second case, `erule notE` would take
¬A again and leave A to prove, which is impossible; choose ¬B instead:

```isabelle
  apply (erule notE)
  apply assumption
  apply (erule_tac P = B in notE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦¬ A; B⟧ ⟹ B
```

```isabelle
  apply assumption
  done
```
:::
::::

:::: exercise Write access {#ex-7-6} ★★
In an access-control policy, every administrator may write. Prove that whoever may not write is not an
administrator:

`(∀u. admin u ⟶ can_write u) ⟶ (∀u. ¬ can_write u ⟶ ¬ admin u)`

Plan the order of the quantifier steps first: which rule fixes a variable, and which creates an
unknown?

::: solution
`allI` fixes u in the conclusion, and `allE` creates an unknown instance of the assumption. Fix first:

```isabelle
lemma "(∀u. admin u ⟶ can_write u) ⟶ (∀u. ¬ can_write u ⟶ ¬ admin u)"
  apply (rule impI)
  apply (rule allI)
  apply (rule impI)
  apply (rule notI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀u. ⟦∀u. admin u ⟶ can_write u; ¬ can_write u; admin u⟧ ⟹ False
```

```isabelle
  apply (erule allE)
  apply (erule impE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀u. ⟦¬ can_write u; admin u; can_write u⟧ ⟹ False
```

`assumption` instantiated the unknown with the fixed u, which is possible because u was fixed first.

```isabelle
  apply (erule notE)
  apply assumption
  done
```
:::
::::

:::: exercise Splitting an existential {#ex-7-7} ★★
Prove `(∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)`, which Exercise 6.6 derived on paper. Then explain in a
sentence or two, in terms of fixed variables and unknowns, why the converse,
`(∃x. P x) ∧ (∃x. Q x) ⟶ (∃x. P x ∧ Q x)`, cannot be proved.

::: solution
```isabelle
lemma "(∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)"
  apply (rule impI)
  apply (erule exE)
  apply (erule conjE)
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. ⟦P x; Q x⟧ ⟹ ∃x. P x
 2. ⋀x. ⟦P x; Q x⟧ ⟹ ∃x. Q x
```

```isabelle
  apply (rule exI)
  apply assumption
  apply (rule exI)
  apply assumption
  done
```

The converse is not valid: P could be "is even" and Q "is odd" on the natural numbers. Both have
witnesses, but no number is both. In a proof attempt, the two `exE` steps fix two different variables,
one with P and one with Q, and the single unknown witness of `exI` cannot become both: unification never
makes two different fixed variables equal. This is the broken eigenvariable condition of Exercise 6.6 in
Isabelle's form.
:::
::::

:::: exercise Peirce's law {#ex-7-8} ★★★
Exercise 6.8 derived Peirce's law, ((A ⟶ B) ⟶ A) ⟶ A, on paper with (RAA). Turn that derivation into an
apply script with `ccontr`, following the tree step by step, and say which step does the work of (⊥E).
Then shorten the script with `classical`.

::: solution
At the bottom of the tree of Exercise 6.8 are (⟶I¹), (RAA²) and (¬E) with the premises [¬A]² and A. As in
Section 7.7, `rule ccontr`, `rule notE` and `assumption` take the last two steps and leave A to prove:

```isabelle
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  apply (rule impI)
  apply (rule ccontr)
  apply (rule notE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦(A ⟶ B) ⟶ A; ¬ A⟧ ⟹ A
```

A comes from the assumption (A ⟶ B) ⟶ A by (⟶E), which needs A ⟶ B:

```isabelle
  apply (erule impE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ¬ A ⟹ A ⟶ B
 2. ⟦¬ A; A⟧ ⟹ A
```

To prove A ⟶ B, assume A (⟶I³). The goal is then B, and `erule notE` turns it into A, using ¬A:

```isabelle
  apply (rule impI)
  apply (erule notE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ A
 2. ⟦¬ A; A⟧ ⟹ A
```

This single `erule notE` does the work of both (¬E) and (⊥E) in the tree, because `notE` concludes any
formula, here B. Both subgoals left are assumptions:

```isabelle
  apply assumption
  apply assumption
  done
```

With `classical`, the three steps after `impI` become one:

```isabelle
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  apply (rule impI)
  apply (rule classical)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦(A ⟶ B) ⟶ A; ¬ A⟧ ⟹ A
```

```isabelle
  apply (erule impE)
  apply (rule impI)
  apply (erule notE)
  apply assumption
  apply assumption
  done
```
:::
::::

:::: exercise A proof that must fail {#ex-7-9} ★★★
Section 6.7 showed that a backward search for (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y) never closes. Watch it
happen in Isabelle: apply the quantifier rules in the best order you can find, and show the state where
you get stuck. Then explain, with fixed variables and unknowns, why no order can work.

::: solution
The conclusion starts with ∃x, so the only rule for the conclusion is `exI`, and it creates the unknown
witness before anything is fixed:

```isabelle
lemma "(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)"
  apply (rule impI)
  apply (rule exI)
  apply (rule allI)
  apply (erule allE)
  apply (erule exE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. R x (?y6 y) ⟹ R ?x2 y
```

```isabelle
  oops
```

To close the subgoal, R x (?y6 y) and R ?x2 y must become identical. The instance ?y6 y can become y,
because `allI` fixed y before `allE` created ?y6. But the witness ?x2 would have to become x, which `exE`
fixed after `exI` created ?x2, and that is not allowed. Taking the assumption apart first only moves the
problem: `erule allE` and `erule exE` then fix x before the witness is created, so the witness can become
x, but the instance of ∀y is created before `allI` fixes y, so it cannot become y. One unknown is always
created too early. The y of the conclusion can only be fixed after the witness is created, since its ∀y
lies inside ∃x; and the x of the assumption can only be fixed after the instance is created, since its ∃x
lies inside ∀y.

This is the never-ending search of Section 6.7 in Isabelle's terms: each new door needs a new key. The
formula is not valid (Section 6.6 gives a countermodel), so no order could have worked; the conditions
that make Isabelle refuse these unifications are what keep its proofs sound.
:::
::::

## Check yourself {#quiz}

```quiz
? In the subgoal `⟦A ⟶ B; A⟧ ⟹ B`, what does ⟹ say?
- [ ] That the formula (A ⟶ B) ∧ A ⟶ B has already been proved
- [x] That B must be proved, and A ⟶ B and A may be used as assumptions
- [ ] That A ⟶ B and A are the conclusions of the subgoal
- [ ] Nothing more than ⟶: Isabelle prints the two arrows differently only for display
> ⟹ is Pure's "from … infer". Left of it are the assumptions of the subgoal, right of it the conclusion still to be proved.

? `thm exI` prints `?P ?x ⟹ ∃x. ?P x`. What does the question mark in `?x` mean?
- [ ] That x is optional
- [ ] That x is a fixed variable of the current subgoal
- [x] That ?x is a schematic variable: when the rule is used, it can be replaced by any term
- [ ] That x has not been defined
> Schematic variables are placeholders. Isabelle fills them in by unification, or you choose them with `of` or `rule_tac`.

? The subgoal is `A ∨ B ⟹ B ∨ A`. Which step performs (∨E) on the assumption, leaving one subgoal per case?
- [ ] `apply (rule disjI1)`
- [ ] `apply (rule disjE)`
- [ ] `apply (drule disjI2)`
- [x] `apply (erule disjE)`
> `erule` matches the major premise A ∨ B with the assumption and leaves the two cases. `rule disjE` leaves three subgoals with unknown formulas.

? After `apply (rule allI)` the subgoal reads `⋀x. ∀x. P x ∧ Q x ⟹ P x`. What is the x after ⋀?
- [x] A fixed variable: it stands for an arbitrary value and unification never replaces it
- [ ] A schematic variable that unification will choose later
- [ ] The same variable as the x bound by ∀ in the assumption
- [ ] A constant from Isabelle's library
> `allI` turns the HOL quantifier into Pure's ⋀. The fixed variable is what Module 6 called the eigenvariable.

? A proof is stuck at `⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y`, and `apply assumption` fails. Why?
- [ ] The relation R would have to be reflexive
- [x] The unknown ?x4 was created before x was fixed, so it cannot become x
- [ ] `assumption` cannot handle two fixed variables
- [ ] The statement being proved is false
> The statement is valid (it is `ex_all`), but `exI` came before `exE`. Fix first, guess later.

? `by blast` reports "Failed to apply initial proof method". What do you know?
- [ ] The statement is false
- [ ] `blast` needs a `done` after it
- [x] `blast` found no proof; the statement may be false, or too hard for `blast`
- [ ] The kernel rejected a proof that `blast` found
> `blast` either finds a complete proof or fails. A failure says nothing about truth; use `nitpick` to look for a counterexample, or apply some rules by hand.
```
