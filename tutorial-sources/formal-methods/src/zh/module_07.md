---
title: 在 Isabelle 中使用自然演绎
part: 2
lead: 逐条应用规则，把模块 6 的纸上证明写成 Isabelle 证明脚本。读懂每一步的证明状态，并找出证明步骤失败的原因。
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
- **分解规则**把联结词放在主前提中，并用主前提的一部分或一个实例作为
  结论：`conjunct1`, `conjunct2`, `mp`, `spec`, `iffD1`, `iffD2`.
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
**子目标**的形式是 `⋀x₁ … xₖ. ⟦H₁; …; Hₙ⟧ ⟹ C`：对变元 x₁ … xₖ 的任意取值（第 7.6 节），在**假设**H₁ … Hₙ 之下，证明**结论**C。变元和假设都可以没有。**证明状态**（proof state）是子目标的列表。列表为空时，证明就完成了。
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

`conjI`有两个前提，因此现在有两个子目标，分别对应树的每个分支，两者都保留假设A ∧ B，`rule`和`assumption`步骤在此作用于子目标1，子目标2等待其轮次，其他方法如`auto`和`simp_all`可以作用于所有子目标（模块5）。

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
证明状态是一个待办事项列表。在这些逐条规则的脚本中，`apply` 将第一项替换为所选步骤的子目标；`done` 检查列表是否为空。
:::

### 合一 {#backward-unification}

::: definition 合一
**合一**通过为模式变量选择值使两个项相同。Isabelle 在应用规则时使用它：在`rule`中，在规则结论与子目标结论之间；在`assumption`中，在子目标结论与假设之间。如果没有值的选择能使两个项相同，则该应用无法成功。Isabelle 还尊重类型和变量作用域，并基于绑定变量重命名和 lambda 转换比较项；它在合一时不证明任意算术恒等式。高阶合一无一般判定过程，因此搜索未必找到所有可能的实例化。
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

第7.6节有一个`frule`有用的情况：一个需要两次使用的量化假设。

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

这些是惯例配对，并非由方法名强制执行的限制。`rule` 也可以逆向使用消去或破坏定理，正如 `rule conjunct2` 已做的那样。类似地，当 `erule` 的第一个前提和结论匹配时，它可以使用如 `mp` 这样的定理。这些方法在将定理与子目标及其假设进行合一（resolve）的方式上有所不同。

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

此直接规则序列阻塞了预期的 `assumption` 步骤。为此证明，在 `exI` 之前重启使用 `exE`，使得见证可以依赖于命名主密钥：

```isabelle
  oops
```

在纸面上，此尝试性树会在其（∃E）作用域外使用本征变元 a 作为存在见证，这违反了侧条件。Isabelle 拒绝用后续固定的 x 实例化 `?x4 y`，从而强制执行了相同的作用域限制。这并未证明不存在任何 HOL 方法能解决剩余的模式目标：HOL 的选择算子可以表达主密钥而无需引用该局部名称。要点在于此特定逐条证明所要求的依赖关系。

::: keyidea
**先固定，后猜测。** `rule allI`和`erule exE`固定变量；`rule exI`、`erule allE`和`drule spec`创建未知项。未知项只能由在创建它之前已固定的变量构成的项组成，这由显示子目标中的其参数记录。上下文参数和常量仍然可用。先固定变量是这些证明的一种有用策略，而非对每个可能的HOL证明的要求。这是第6.7节的建议，即先打开存在性假设，然后选择实例和见证，Isabelle的未知项展示了其工作原理。
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

无假设固定 `?n`，且 `simp`（模块 1）不通过搜索数值见证来求解此方程：

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

目前使用的显式自然演绎规则均有直觉主义对应规则；其中没有（RAA）。这并不意味着底层 HOL 理论是直觉主义的，也不意味着自动化使用的所有库事实都是构造性的。模块 6 解释了某些重言式在没有（RAA）的情况下无法推导（[Section 6.5](module_06_ZH.html#classical)），而 A ∨ ¬A，即排中律，是标准示例。尝试在不使用它的情况下：

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

在德摩根定律的四个方向中，第 6.5 节指出需要（RAA）：¬(A ∧ B) ⟶ ¬A ∨ ¬B。思路：假设 ¬A ∨ ¬B 为假。那么 A 必须成立，否则 ¬A ∨ ¬B 将成立；同理 B 也成立。但 A ∧ B 与 ¬(A ∧ B) 矛盾。

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

## 当步骤失败时 {#errors}

任何步骤都可能失败，且 Isabelle 的消息简短。本节收集你将遇到的消息及其原因和修复方法。Isabelle 标记失败的步骤并显示其接收到的证明状态。其前的步骤不受影响，因此你可以用其他步骤替换失败的步骤。

### 应用证明方法失败 {#errors-apply}

这是最常见的消息，表示该方法对子目标 1 无法执行任何操作：对于 `rule`，规则结论与子目标结论无法合一；对于 `erule`，要么无法合一，要么没有假设匹配规则的主要前提；对于 `drule` 和 `frule`，没有假设匹配主要前提；对于 `assumption`，没有假设与结论合一。Isabelle 展示了它接收到的证明状态。以下是模块 6 在 6.4 节中警告过的早期选择，随后是一个充满希望的 `assumption`：

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

`disjI1` 左侧的子目标 A 没有任何前提，因此 `assumption` 没有可合一的对象。另外三种常见原因也会产生相同的消息，随后显示失败步骤发生前的证明状态。

**在假设成为假设之前将其拆解。**在目标 A ∧ B ⟶ B ∧ A 中，合取 A ∧ B 不是假设，而是蕴含式的一部分，因此 `erule conjE` 找不到可操作的内容：

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

首先应用 `impI`：它将 A ∧ B 移入假设。

**期望假设能深入公式内部。** 在 `impI` 和 `conjI` 之后，子目标 1 为 A ∧ B ⟹ B。B 是假设的一部分，但并非假设本身，因此 `assumption` 失败：

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

`assumption` 仅对完整公式进行合一。首先使用 `erule conjE` 分解假设。

**使用适用于错误联结词的规则。** `disjI1` 结论为析取，但子目标 A ∧ B ⟹ B ∧ A 的结论为合取：

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

如有疑问，使用 `thm` 查阅该规则：对于 `rule`，其结论必须与子目标的结论合一。固定连接词必须匹配，但像 `?P` 这样的模式结论可以匹配不同的形状。该规则在实例化前不必显示目标的连接词。

### 未定义的定理 {#errors-name}

拼写错误的规则名会给出不同的消息。许多规则名以大写 I 结尾，其外观与小写 l 非常相似：

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (rule conjl)
  done
```

```output
*** Undefined fact: "conjl"⌂
```

### 证明失败 {#errors-done}

`done` 在子目标未消解时失败，并列出它们。采用与上文相同的早期选择，并在其后直接写入 `done`：

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

`done` 本身无法证明任何内容，甚至无法证明结论是其假设之一的子目标。添加缺失的步骤，或者如果剩余子目标不可证明，如本例所示，则返回并选择不同的策略。（一行证明 `by m`，如 `by blast` 所示，行为略有不同：在方法 m 之后，它通过假设关闭剩余子目标，并且仅当其他内容剩余时才报告 Failed to finish proof。）

### 遗忘完成 {#errors-forget}

没有`done`，当下一条命令到达时证明仍然开放，且下一条引理被拒绝：

```isabelle fails
lemma "A ⟶ A"
  apply (rule impI)
  apply assumption

lemma "B ⟶ B"
```

```output
*** Bad context for command "lemma"⌂
```

引理不能始于证明内部。在最后一个`apply`后添加`done`。若未完成的证明是理论中的最后一个，则拒绝`end`，并提示“在“prove”模式下非法使用证明命令”。

### 一次绕道，而非错误：使用 rule 而非 erule {#errors-rule}

某些错误根本不会报错，只会产生一个奇怪的证明状态。通常的情况是：将带有 `rule` 的消除规则应用于 `erule` 时

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

`rule` 仅将 `disjE` 的结论 ?R 与 B ∨ A 进行合一。主要前提成为子目标 1，因此 Isabelle 要求证明某个它尚不知晓的析取式，且两个案例涉及未知公式。`apply assumption` 通过将未知析取式与 A ∨ B 进行合一来修复此问题，结果将是 `erule` 版本，其中假设 A ∨ B 在两个案例中均予保留。从一开始就使用 `erule`。

```isabelle
  oops
```

::: trouble
- **应用证明方法失败**：该规则不适用于子目标 1，或其假设不匹配主要结论
  前提。检查主连接词；在分解假设前使用 `impI`；使用 `thm` 读取规则。
- **未定义的定理**：拼写错误的规则名称，例如将`conjl`误写为`conjI`。
- **证明未完成**：`done`处仍有子目标；它们已列出。
- **命令“lemma”的上下文错误**：前一个证明没有`done`。
- **内部语法错误…解析 prop** 失败：语句本身存在错误，例如在
  公式（第 7.1 节）。
- **一个无法关闭的子目标，包含如`?x4 y`**这样的未知量：量词规则应用过早。
  在创建未知变量之前先固定变量（第7.6节）。
:::

## 让 Isabelle 进行搜索：blast 与 auto {#blast}

模块 6 通过让 `blast` 证明其推导（[Section 6.9](module_06_ZH.html#isabelle)）结束。你现在已手动完成了 `blast` 自动执行的操作。`blast` 属于 Isabelle 的 **classical reasoner**，这是一组基于自然演绎规则证明方法的家族。它应用引入和消除规则，如本模块中的规则：安全规则（第 6.7 节）自由应用，其他规则作为选择。当选择无果时，它可以回溯并尝试其他选择，在其搜索范围内。它可能找到完整证明、失败或达到资源限制。以下示例采用单次调用：

```isabelle
lemma "¬ (A ∧ B) ⟶ ¬ A ∨ ¬ B"
  by blast

lemma "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
  by blast

lemma "⟦∀x. safe x ⟶ safe (step x); safe s⟧ ⟹ safe (step (step s))"
  by blast
```

`blast` 找到了在 7.6 节中仅靠合一无法正确处理的实例步骤 s：当一个选择失败时，它会尝试另一个选择。无论 `blast` 找到什么，定理均由 Isabelle 的内核根据逻辑规则构建。如 Module 1 所述，该保证针对相对于理论公理和可信基础设施的普通重构证明；承认和预言方法引入了不同的证据。

当命题无效时，`blast` 失败，正如第 6.9 节对主密钥所示：

```isabelle fails
lemma "(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)
```

借助`by`，Isabelle 调用该方法作为初始证明方法，因此消息仅表明`blast`未找到证明，它并未说明该命题为假或对于`blast`而言过于困难；`nitpick`（Modules 2 和 3）可以寻找反例。`auto` 的行为不同：它尽其所能并展示剩余部分。

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

`auto` 将蕴含式转化为假设并在此停止。`auto` 结合经典推理与化简器，并保留其无法证明的子目标；Module 9 深入介绍它。`blast` 不调用化简器且对等式知之甚少，但 *Programming and Proving in Isabelle/HOL* 称其为“复杂逻辑目标的首选方法”。

那么应该使用哪一个？对于常规逻辑，使用 `blast` 或 `auto`。但自动化在目标过大或不完全为真时经常失败，此时手动步骤是查明原因的方法：手动应用若干规则，查看子目标，并对各部分调用 `blast`，或发现其中一部分无法被证明。这就是为什么该模块首先全部手动操作的原因。

::: tip
当`blast`失败时的良好例程：使用`intro`（`impI`, `allI`, `conjI`, …）应用明显的引入规则，并用`elim`（`conjE`, `exE`, …）分解明显的假设。然后在每个子目标上尝试`blast`。看似错误的子目标是整个命题可能为假的提示；请在引理上尝试`nitpick`。
:::

## 小结 {#summary}

- Isabelle 具有两个逻辑层级：元逻辑 **Pure**，包含 ⟹、⋀ 和 ≡，用于规则和目标的
  被书写的是对象逻辑**HOL**，其中包含¬ ∧ ∨ ⟶ ∀ ∃ 和 =，公式在其中被书写。
- 规则是一个定理：`thm conjI` 展示了 `⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q`。**模式变量** 如 `?P` 可以
  由适当类型的项和允许的变量依赖关系实例化：通过**合一**自动完成，或通过`of`和`rule_tac`手动完成。
- 模块 6 的每条规则在 Isabelle 中均有对应名称：`conjI`, `conjunct1`, `conjunct2`, `conjE`, `disjI1`,
  `disjI2`, `disjE`, `impI`, `mp`, `impE`, `notI`, `notE`, `FalseE`, `allI`, `spec`, `allE`, `exI`, `exE`, `ccontr`, `classical`, `refl` and `subst`.
- 证明脚本从根节点构建论文树：`rule` 将规则的结论与
  目标；`erule`、`drule` 和 `frule` 以不同方式对假设应用规则进行形式化规约；`assumption` 关闭分支；`intro` 和 `elim` 重复；`done` 检查是否无剩余。
- `allI` 和 `exE` 创建 **固定变量** (⋀x)，它们强制执行本征变元条件；`exI`，
  `allE` 和 `spec` 创建未知项。先固定前者，稍后猜测后者。
- 经典证明使用`ccontr`，即（RAA），或`classical`。
- 常见的消息有 Failed to apply proof method、Undefined fact、Failed to finish proof 和 Bad
  上下文用于命令。
- `blast` 使用相同的规则进行搜索，且要么成功要么失败；`auto` 展示其无法处理的内容
  证明。

## 练习 {#exercises}

:::: exercise 读取一条规则 {#ex-7-1} ★
`thm impE` 打印 `⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R`。

1. 哪个前提是大前提？
2. 哪个前提拥有自己的假设，它是什么？
3. 将规则绘制为纸面规则，采用 Module 6 的风格。
4. 通常用哪种方法应用 `impE`？它怎样处理子目标 ⟦A ⟶ B; A⟧ ⟹ C？

::: solution
1. `?P ⟶ ?Q`: 它包含该规则所消除的连接词。
2. 第三条，`?Q ⟹ ?R`：在证明 ?R 时，你可以假设 ?Q。
3. 作为论文规则，已释放的假设标记为：

   $$
   \dfrac{\begin{matrix}\\ \\ P \imp Q\end{matrix} \qquad \begin{matrix}\\ \\ P\end{matrix} \qquad \begin{matrix}[Q]^1\\ \vdots\\ R\end{matrix}}{R}\;(\mathrm{impE}^1)
   $$

4. 根据 `erule`，它移除假设 A ⟶ B 并留下两个子目标：证明 A，然后证明 C
   以 B 作为额外假设。

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

   第一个子目标由 `assumption` 关闭；第二个子目标无法证明，因为 C 与 A 和 B 无关，因此放弃尝试：

   ```isabelle
     oops
   ```
:::
::::

:::: exercise 从树到脚本 {#ex-7-2} ★
编写一个 apply 脚本，按此树逐步执行，说明哪个命令关闭哪个叶节点，然后在 Isabelle 中验证该脚本。

```prooftree
A ⟶ B ⟶ A ∧ B   (⟶I¹)
  B ⟶ A ∧ B   (⟶I²)
    A ∧ B   (∧I)
      [A]¹
      [B]²
```

::: solution
针对 (⟶I¹) 和 (⟶I²) 的两个 `impI` 步骤，针对 (∧I) 的一个 `conjI` 步骤，以及每个叶节点的一个 `assumption` 步骤：

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

第一个`assumption`关闭叶节点[A]¹（子目标1为A），第二个关闭[B]²。
:::
::::

:::: exercise 采用哪种方法？ {#ex-7-3} ★
对每个子目标，命名你采取的第一步（方法与规则），并说明其后的剩余部分。随后在 Isabelle 中完成每个证明。

1. `⟦A; B⟧ ⟹ B ∧ A`
2. `A ∧ B ⟹ B`
3. `¬ A ⟹ A ⟶ B`
4. `∀x. P x ⟹ P c`
5. `P c ⟹ ∃x. P x`

::: solution
1. `rule conjI` 留下 B 和 A 两个子目标，分别用 `assumption` 完成。
2. `erule conjE` 留下 ⟦A; B⟧ ⟹ B，用 `assumption` 完成。
3. `rule impI` 留下 ⟦¬ A; A⟧ ⟹ B。再用 `erule notE` 把目标化为 A，最后用 `assumption` 完成。
4. `erule allE` 用实例 P t 替换假设，其中 t 是未知项，且 `assumption`
   将 sets 赋值为 c。（`drule spec` 同样适用。）
5. `rule exI` 留下待证的 P t，其中见证 t 未知。`assumption` 将 t 实例化为 c。

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

:::: exercise 柯里化 {#ex-7-4} ★★
练习 6.4 在纸上推导了这两个公式。请使用 `rule`、`erule`、`drule` 和 `assumption` 在 Isabelle 中证明它们：

1. `(A ⟶ B ⟶ C) ⟶ (A ∧ B ⟶ C)`
2. `(A ∧ B ⟶ C) ⟶ (A ⟶ B ⟶ C)`

::: solution
在第一个证明中，将合取式拆开，并两次使用嵌套蕴含，其中`drule mp`：

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

在第二种情况中，`erule impE`要求你证明 A ∧ B，`conjI` 将其分解：

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

:::: exercise 两个不含 RAA 的德摩根定律 {#ex-7-5} ★★
Exercise 6.5 和 Section 6.5 在纸上推导了 `¬ A ∨ ¬ B ⟶ ¬ (A ∧ B)` 和 `¬ A ∧ ¬ B ⟶ ¬ (A ∨ B)`。在 Isabelle 中证明两者，不使用 `ccontr` 或 `classical`。在第二个证明中，你将遇到 Section 7.5 中的陷阱：`erule notE` 取第一个被否定的假设。用 `erule_tac P = B in notE` 命名你希望的那个（`notE` 的变量名为 P）。

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

在第二条定律中，情况分解留下两个子目标，其中假设中同时包含 ¬A 和 ¬B：

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

在第一种情况下，¬A 是正确的且优先出现。在第二种情况下，`erule notE` 会再次选取 ¬A 而留下 A 需证明，这是不可能的；因此选择 ¬B：

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

:::: exercise 写访问 {#ex-7-6} ★★
在访问控制策略中，每位管理员均可写入。证明任何不可写入者均非管理员：

`(∀u. admin u ⟶ can_write u) ⟶ (∀u. ¬ can_write u ⟶ ¬ admin u)`

首先规划量词步骤的顺序：哪个规则固定变量，哪个生成未知项？

::: solution
`allI`在结论中固定u，`allE`创建假设的未知实例。先固定：

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

`assumption` 使用固定项 u 实例化了未知量，这是可能的，因为 u 是最先固定的。

```isabelle
  apply (erule notE)
  apply assumption
  done
```
:::
::::

:::: exercise 存在量词拆分 {#ex-7-7} ★★
证明`(∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)`，这是练习6.6在纸上推导出的结果。然后用一两句话，基于固定变量和未知项，解释为什么逆命题`(∃x. P x) ∧ (∃x. Q x) ⟶ (∃x. P x ∧ Q x)`无法被证明。

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

逆命题不成立：P 可为“是偶数”，Q 为“是奇数”，论域为自然数。二者均有见证，但无数字同时满足二者。在证明尝试中，两个 `exE` 步骤固定了两个不同的变量，一个满足 P，一个满足 Q，而 `exI` 的单一未知见证无法同时成为二者：合一从不使两个不同的固定变量相等。不同的名称并不断言不同的值；相反，我们没有等式允许我们将这些任意见证视为相同。这是 Isabelle 中练习 6.6 的本征变元条件失效情形。
:::
::::

:::: exercise Peirce 定律 {#ex-7-8} ★★★
练习 6.8 利用反证法 (RAA) 在纸上推导了皮尔士定律 ((A ⟶ B) ⟶ A) ⟶ A。请按照 `ccontr` 逐步跟随推导树，将其转化为 apply 脚本，并指出哪一步执行了 (⊥E) 的工作。随后，使用 `classical` 缩短该脚本。

::: solution
在练习 6.8 的树底部是 (⟶I¹)、(RAA²) 和 (¬E)，前提为 [¬A]² 和 A。与第 7.7 节类似，`rule ccontr`、`rule notE` 和 `assumption` 取最后两步并留下 A 以证明：

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

A 由 (A ⟶ B) ⟶ A 经 (⟶E) 得到，这需要 A ⟶ B：

```isabelle
  apply (erule impE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ¬ A ⟹ A ⟶ B
 2. ⟦¬ A; A⟧ ⟹ A
```

要证明 A ⟶ B，假设 A（⟶I³）。目标变为 B，而 `erule notE` 利用 ¬A 将其转化为 A。

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

此单个`erule notE`同时完成了树中(¬E)和(⊥E)的工作，因为`notE`可得出结论任意公式，此处为B。剩余的两个子目标均为假设：

```isabelle
  apply assumption
  apply assumption
  done
```

借助`classical`，`impI`之后的三个步骤合并为一个：

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

:::: exercise 一个必须失败的证明 {#ex-7-9} ★★★
第 6.7 节展示了针对 (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y) 的后向搜索永远无法闭合。在 Isabelle 中观察其过程：应用你能找到的最佳顺序的量词规则，并展示你陷入困境的状态。然后，使用本征变元和未知项解释为何任何顺序都无法奏效。

::: solution
结论中 ∃x 的直接引入使用 `exI`，并在任何内容被固定之前创建未知见证者：

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

为关闭子目标，R x (?y6 y) 与 R ?x2 y 必须完全相同。实例 ?y6 y 可化为 y，因为 `allI` 在 `allE` 创建 ?y6 之前固定了 y。但见证 ?x2 必须化为 x，而 `exE` 在 `exI` 创建 ?x2 之后才固定 x，这是不允许的。先分解假设仅转移问题：`erule allE` 和 `erule exE` 在创建见证前固定 x，使见证可化为 x，但 ∀y 的实例在 `allI` 固定 y 前创建，故无法化为 y。总有一个未知量创建过早。结论中的 y 只能在见证创建后固定，因其 ∀y 位于 ∃x 内部；假设中的 x 只能在实例创建后固定，因其 ∃x 位于 ∀y 内部。

这是 Isabelle 中第 6.7 节永无止境的搜索：每扇新门都需要一把新钥匙。该公式无效（第 6.6 节给出了反例），因此任何顺序都无效；导致 Isabelle 拒绝这些合一的条件正是保持其证明健全性的条件。
:::
::::

## 自测题 {#quiz}

```quiz
? 在子目标`⟦A ⟶ B; A⟧ ⟹ B`中，⟹表示什么？
- [ ] 公式 (A ⟶ B) ∧ A ⟶ B 已被证明
- [x] 必须证明 B，且 A ⟶ B 和 A 可用作假设
- [ ] A ⟶ B 和 A 是该子目标的结论
- [ ] 与 ⟶ 的含义相同，只是 Isabelle 显示时用了不同的箭头
> ⟹ 是 Pure 的“从 … 推断”。其左侧为子目标的假设，右侧为仍需证明的结论。

? `thm exI` 打印 `?P ?x ⟹ ∃x. ?P x`。`?x` 中的问号是什么意思？
- [ ] 该 x 是可选的
- [ ] 该 x 是当前子目标的本征变元
- [x] 该 ?x 是本征变元：它可由具有正确类型和允许作用域的项实例化
- [ ] x 尚未定义
> 本征变元是受类型和范围约束的占位符。Isabelle 通过合一填充它们，或者你使用 `of` 或 `rule_tac` 选择它们；后续局部变量不能通过早期未知变量逃逸。

? 子目标是 `A ∨ B ⟹ B ∨ A`。哪一步对假设执行了 (∨E)，使得每个情况各留下一个子目标？
- [ ] `apply (rule disjI1)`
- [ ] `apply (rule disjE)`
- [ ] `apply (drule disjI2)`
- [x] `apply (erule disjE)`
> `erule` 将大前提 A ∨ B 与假设进行合一，并留下两个分支。`rule disjE` 留下三个带有未知公式的子目标。

? 在`apply (rule allI)`之后，子目标读作`⋀x. ∀x. P x ∧ Q x ⟹ P x`。在⋀之后的x是什么？
- [x] 固定变量：它代表任意值，且合一操作从不替换它
- [ ] 一个统一（unification）稍后选择的本征变元
- [ ] 与假设中由 ∀ 绑定的 x 相同的变量
- [ ] Isabelle 库中的一个常量
> `allI` 将 HOL 量词规约为 Pure 的 ⋀。该固定变量即 Module 6 所称的本征变元。

? 证明在`⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y`处卡住，且`apply assumption`失败。为什么？
- [ ] 关系 R 必须具有自反性
- [x] 在 x 被固定之前创建了未知量 ?x4，因此它不能成为 x
- [ ] `assumption` 无法处理两个固定变量
- [ ] 所证明的陈述为假
> 该命题有效（即 `ex_all`），但 `exI` 出现在 `exE` 之前。先修正，后猜测。

? `by blast` 报告“初始证明方法应用失败”。你了解什么？
- [ ] 该命题为假
- [ ] `blast` 需要在其后跟随 `done`
- [x] `blast` 未找到证明；该命题可能为假，或对 `blast` 而言过于困难
- [ ] 内核拒绝了一个证明，该证明声称 `blast` 找到了
> `blast` 要么找到完整证明，要么失败。失败对真值不作任何断言；使用 `nitpick` 来寻找反例，或手动应用某些规则。
```
