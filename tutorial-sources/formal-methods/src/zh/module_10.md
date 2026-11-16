---
title: Isar 结构化证明
part: 3
lead: 写出读者能逐行读懂、Isabelle 能逐步检查的证明。你将用 Isar 陈述证明的每一步，把事实从一步传给下一步，用等式链和不等式链进行计算推理，并把证明拆分成若干情形和归纳步骤。
minutes: 220
needs: 模块 1–9，尤其是模块 5（归纳）、模块 7（Isabelle 中的规则）和模块 9（自动化）
goals:
  - 用 assume、fix、have 和 show 把证明写成 proof … qed 块
  - 用 then、from、with、using、note、moreover 和 ultimately 在步骤之间传递事实
  - 用 also、finally 和 … 证明等式链和不等式链
  - 把证明拆分成若干情形，并用命名情形、?case 和归纳假设写出归纳证明
  - 把自然演绎证明和 apply 脚本改写成 Isar，并根据 Isabelle 的消息修复 Isar 证明
imports: Main
---

## 为什么需要结构化证明 {#why}

在模块 7 中，你用 `apply` 步骤构造证明，一次应用一条规则；在模块 9 中，你让自动化工具一次证明整个目标。两种做法都行得通，但也都有一个弱点，证明一旦超过几行，这个弱点就会显露出来。下面是一个模块 7 风格的证明。读一读它，然后问问自己：第四步之后，什么是成立的？

这个陈述与访问控制有关：如果每个管理员都是员工，并且存在一个管理员，那么存在一个员工。`∀u. admin u ⟶ staff u` 读作“对每个用户 u，如果 u 是管理员，那么 u 是员工”。

```isabelle
lemma "(∀u. admin u ⟶ staff u) ⟶ (∃u. admin u) ⟶ (∃u. staff u)"
  apply (rule impI)
  apply (rule impI)
  apply (erule exE)
  apply (rule exI)
  apply (erule allE)
  apply (erule mp)
  apply assumption
  done
```

Isabelle 接受这个脚本。但脚本记录的是 Isabelle 应该**做什么**，而不是什么**为真**。`exI` 选的是哪个用户？`erule allE` 拆开的是哪个假设？答案都在证明状态（proof state）里，而证明状态并不在文本中：要读懂这个脚本，你得在 Isabelle 中重放它，并查看每一行之后的状态。以后维护这个证明的人也是一样。如果库中的某处改动使某一步留下的子目标（subgoal）换了顺序，后面的某一步就会失败，失败的地方离原因很远，而脚本丝毫看不出原本的意图是什么。

下面是用 Isar 证明的同一个定理：

```isabelle
lemma "(∀u. admin u ⟶ staff u) ⟶ (∃u. admin u) ⟶ (∃u. staff u)"
proof (intro impI)
  assume all: "∀u. admin u ⟶ staff u"
  assume "∃u. admin u"
  then obtain a where "admin a" by blast
  with all have "staff a" by blast
  then show "∃u. staff u" by blast
qed
```

这些关键字你都还没有学过，但多半照样能读懂这个证明，因为它说出了每一步成立的是什么。它就是纸上的证明，一行对一行：“假设每个管理员都是员工，并且存在一个管理员。把其中一个管理员叫作 a。由第一个假设，a 是员工。所以存在一个员工。”

**Isar** 是 Isabelle 用来写这种**结构化证明**（structured proof）的语言，它的名字是 Intelligible semi-automated reasoning（可理解的半自动推理）的缩写。Isar 证明是由陈述组成的文本。每一步断言一个事实，Isabelle 检查这个断言确实能够得出，通常只需简短地调用一下自动化工具，例如 `by blast`。这样的设计带来了三点好处。

- **不用运行就能读懂证明。** 事实都写在文本里，而不是藏在证明状态中。
- **出错的步骤会在出错的地方被标出来。** 它的陈述告诉你原本想证明的是什么，所以你知道该修复什么。
- **它与纸上的证明一一对应。** 模块 6 的自然演绎（natural deduction）证明和模块 5 的归纳证明，几乎可以一行对一行地改写成 Isar（第 10.7 节）。

Isabelle 自带的教程《Programming and Proving in Isabelle/HOL》建议用 Isar 写较大的证明，本系列此后较长的证明也都用 Isar 来写。**apply 脚本**（apply script）仍然适合一步一步地探索一个目标，而简短的证明仍然写成 `by simp` 或 `by auto`。

| | apply 脚本 | Isar 证明 |
|---|---|---|
| 每一行说的是 | 下一步应用哪个方法 | 下一步哪个事实成立 |
| 要读懂它，你需要 | Isabelle，以便查看每个状态 | 文本本身 |
| 它的形状 | 一串步骤 | 嵌套的块，像程序一样 |

::: keyidea
apply 脚本告诉 Isabelle 对目标做什么。Isar 证明告诉读者每一步什么为真，而 Isabelle 检查每一个断言。
:::

## Isar 证明的结构 {#shape}

Isar 证明由少数几个命令构成。本节先在逻辑的小例子上介绍这些命令，好让你专心看清结构，然后再把它们用在第一个来自编程的函数上。

### 证明块 {#shape-blocks}

你已经知道完成一条引理的两种方式：一个单独的步骤 `by method`，以及以 `done` 结尾的 apply 脚本。Isar 增加了第三种方式，即证明块：

```isabelle norun
lemma "statement"
proof method
  steps
qed
```

`proof` 后面的证明方法（proof method）对目标走出第一步，就像 `apply` 那样。然后，`proof` 和 `qed` 之间的步骤证明剩下的部分，最后由 `qed` 关闭这个块。

::: definition 证明块
**证明块**（proof block）`proof m … qed` 证明紧挨在它前面陈述的目标。**初始方法**（initial method）m 把这个目标变成若干**待证目标**（pending goal）。块中的步骤确立事实，并解决这些待证目标；所有待证目标都解决之后，`qed` 关闭这个块。块中的每个断言都需要自己的证明，这个证明同样要么是一个单独的步骤 `by m`，要么是一个证明块，所以块可以嵌套。
:::

以 A ∧ B ⟶ B ∧ A 为例，你在模块 6 中手工证明过这个公式，在模块 7 中又用 `apply` 证明过它。先陈述它：

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟶ B ∧ A
```

用模块 7 中蕴涵的规则开始这个块：

```isabelle
proof (rule impI)
```

```output state
proof (state)
goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

现在目标说的是：假设 A ∧ B，证明 B ∧ A。箭头 ⟹ 是 Isabelle 自己的蕴涵，你在模块 7 中见过它。在纸上的证明中，你接下来会写“假设 A ∧ B”。在 Isar 中也是这样：

```isabelle
  assume ab: "A ∧ B"
```

```output state
proof (state)
this:
  A ∧ B

goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

`assume` 把这个假设加入证明，并把它命名为 `ab`。证明状态把它列在 `this:` 下面，`this` 就是最近得到的事实。目标没有变化：假设本身什么也没有证明，它只是你可以使用的东西。现在断言结论：

```isabelle
  show "B ∧ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. B ∧ A
```

`show` 陈述一个断言，用它来解决一个待证目标。和引理一样，这个断言需要证明，证明状态把它显示为一个单独的目标。把假设交给 `blast`，用 `blast` 证明它，然后关闭这个块：

```isabelle
    using ab by blast
qed
```

`using ab` 把事实 `ab` 交给 `blast`；第 10.3.3 节会解释为什么必须这样做。`show` 的证明成功之后，Isabelle 用 `show` 得到的事实解决待证目标，于是 `qed` 发现已经没有什么要做的了。这之所以行得通，是因为 `ab` 正是目标的前提（premise）A ∧ B。`assume` 必须与目标的某个前提相符：如果假设别的东西，最后的 `show` 就会失败（第 10.8 节）。

::: note
每个证明状态的第一行都给出 Isabelle 当前所处的**模式**（mode），它告诉你接下来可以写什么。`proof (prove)`：已经陈述了一个断言（`lemma`、`have`、`show`），接下来是它的证明。`proof (state)`：你在一个块中，可以做假设、提出断言，或者关闭这个块。`proof (chain)`：已经为下一个断言取好了事实（第 10.3 节）。
:::

### 中间步骤：have {#shape-have}

纸上的证明很少一步就跳到结论：它要经过一些中间事实才到达结论。`have` 陈述这样一个事实，并给出它自己的证明，然后把它加入证明，供后面的步骤使用。与 `show` 不同，`have` 不会动待证目标。

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  have b: "B" using ab by blast
  have a: "A" using ab by blast
  show "B ∧ A" using b a by blast
qed
```

两个 `have` 各有一个名字 `b` 和 `a`，`show` 用到了这两个事实。这个证明读起来和纸上的一样：由 A ∧ B 得到 B，也得到 A，所以 B ∧ A。

### 嵌套的块与 next {#shape-nested}

`have` 或 `show` 的证明本身也可以是一个块。这里，结论 B ∧ A 用合取的规则来证明，它留下两个目标：

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  show "B ∧ A"
  proof (rule conjI)
```

```output state
proof (state)
goal (2 subgoals):
 1. B
 2. A
```

两个目标各用一个 `show` 来证明：

```isabelle
    show "B" using ab by blast
  next
    show "A" using ab by blast
  qed
qed
```

`show` 可以解决它所在的块中任何一个待证目标，而不只是第一个：Isabelle 会寻找一个能被 `show` 得到的事实解决的目标。`next` 把不同目标的证明分隔开。它结束块中当前的这一部分，并开始新的一部分，这样，你为一个目标所做的假设，在下一个目标中就不能使用了。这里内层的块中没有做任何假设，所以 `next` 可以省略；但在情形分析（case analysis）和归纳（第 10.5 节和第 10.6 节）中就需要它。图 10.1 展示了这个证明的结构。

::: figure id=fig-10-1
这个嵌套证明的块结构。每个 `proof … qed` 开启一个块，它有自己的待证目标，每个 `show` 解决其中一个。在外层块中假设的事实 `ab`，可以在嵌套于其中的每个块中使用。
:::

### 任意的值：fix {#shape-fix}

要证明一个陈述对所有 x 都成立，纸上的证明会说“设 x 是任意的”，然后对这个 x 证明这个陈述。这就是模块 6 中的规则 (∀I)。在 Isar 中，这写作 `fix x`：

```isabelle
lemma "∀u. admin u ⟶ admin u ∨ staff u"
proof
```

```output state
proof (state)
goal (1 subgoal):
 1. ⋀u. admin u ⟶ admin u ∨ staff u
```

不带方法的 `proof` 应用了 ∀ 的规则（第 10.2.6 节列出了它对每个联结词做什么）。现在目标以 ⋀u 开头，这是模块 7 中讲过的 Isabelle 自己的“对每个 u”。固定这样一个 u，并对它证明这个陈述：

```isabelle
  fix u
  show "admin u ⟶ admin u ∨ staff u"
  proof
    assume a: "admin u"
    show "admin u ∨ staff u" using a by blast
  qed
qed
```

::: definition 固定变量
`fix x` 引入一个**固定变量**（fixed variable）x，就像模块 7 中由 ⋀ 约束的变量那样：它是一个任意值的名字，除了证明对它所做的假设之外，证明对它一无所知。块关闭之后，对固定的 x 证明了的事实，对 x 的每个值都成立。
:::

### 带假设的引理：assumes、shows 和 ?thesis {#shape-assms}

关于程序的陈述通常带有条件。下面这个函数，每个程序员都以某种形式写过：`clamp lo hi x` 把值 x 限制在从 lo 到 hi 的范围之内，音量调节或传感器读数就是这样处理的。

```isabelle
fun clamp :: "int ⇒ int ⇒ int ⇒ int" where
  "clamp lo hi x = (if x < lo then lo else if hi < x then hi else x)"
```

```output
consts
  clamp :: "int ⇒ int ⇒ int ⇒ int"

Found termination order: "{}"
```

```isabelle
value "clamp 0 100 150"
value "clamp 0 100 (-5)"
value "clamp 0 100 42"
```

```output all
"100"
  :: "int"

"0"
  :: "int"

"42"
  :: "int"
```

只要这个范围不是空的，结果就永远不会小于 lo。引理可以用 `assumes` 单独陈述条件，再用 `shows` 陈述断言：

```isabelle
lemma clamp_lower:
  assumes "lo ≤ hi"
  shows "lo ≤ clamp lo hi x"
```

```output state
proof (prove)
goal (1 subgoal):
 1. lo ≤ clamp lo hi x
```

目标中只显示断言。假设可以作为一个名为 `assms` 的事实来使用，它是这条引理所有假设的列表：

```isabelle
proof -
  show ?thesis using assms by simp
qed
```

这里出现了两样新东西。`proof -` 开始一个块，但不改变目标：连字符是一个什么也不做的方法。`?thesis` 读作“the thesis”（论题），它是 Isabelle 为每个断言定义的缩写：它代表 `shows` 后面（或者 `lemma`、`have`、`show` 后面）的陈述，这里就是 `lo ≤ clamp lo hi x`。有了它，你就不用照抄很长的陈述。你也可以给每个假设起名字，例如 `assumes order: "lo ≤ hi"`，或者用 `assms(i)` 指第 i 个假设。这条引理的结果是蕴涵 `lo ≤ hi ⟹ lo ≤ clamp lo hi x`，后面的证明用 `clamp_lower` 这个名字来使用它。

一步完成的证明也可以：在陈述之后直接写 `using assms by simp`。当证明需要好几步时，块的形式才显出它的好处。

### 块怎样开始 {#shape-start}

初始方法决定了块要证明哪些待证目标。大多数证明用的是下面三种形式之一：

- `proof (rule r)` 反向应用规则 r，就像 `apply (rule r)` 那样，例如 `rule impI`。
- 不带方法的 `proof` 应用一条**标准规则**（standard rule），这条规则由目标的主联结词选定；如果有事实传给它，它就应用这些事实的消去规则（elimination rule），见第 10.5.3 节。
- `proof -` 让目标保持原样。

用标准规则开始的块，接下来遵循自然演绎的模式：

| 目标 | `proof` 应用 | 块中 |
|---|---|---|
| `A ⟶ B` | `impI` | `assume "A"` … `show "B"` |
| `A ∧ B` | `conjI` | `show "A"` … `next` … `show "B"` |
| `A ⟷ B` | `iffI` | `assume "A"` … `show "B"` `next` `assume "B"` … `show "A"` |
| `¬ A` | `notI` | `assume "A"` … `show False` |
| `∀x. P x` | `allI` | `fix x` … `show "P x"` |
| `∃x. P x` | `exI` | `show "P t"`，其中 t 是你选定的见证（witness） |

::: pitfall
当没有标准规则适合目标时，单独的 `proof` 会失败，例如目标是 `False` 或者是数之间的等式时：

```isabelle fails
lemma
  assumes "A" and "¬ A"
  shows False
proof
  show False using assms by blast
qed
```

```output
*** Failed to apply initial proof method:
*** goal (1 subgoal):
***  1. False
```

解决办法是改用 `proof -`，它开始一个块，但不应用任何规则：

```isabelle
lemma
  assumes "A" and "¬ A"
  shows False
proof -
  show False using assms by blast
qed
```
:::

## 传递事实 {#facts}

到目前为止，证明都是用 `using` 把事实交给方法的。Isar 有好几种方式把事实从一步传给下一步。它们让证明的脉络清晰可见，就像纸上的“因此”“由此可得”这样的词语一样。

### 用 then 链接事实 {#facts-then}

::: definition 事实、this 与链接
**事实**（fact）是证明中可以使用的、已经得证的陈述：一个假设、`have` 或 `show` 的结果，或者来自库或你自己理论中的一条引理。每一步之后，这一步产生的事实叫作 **this**。**正向链接**（forward chaining）把事实传给下一个断言，由证明这个断言的方法接收，就像 `using` 那样。
:::

`then` 把 `this` 链接到下一个断言。如果证明的每一步都使用前一步的结果，它读起来就像一条流水线：

```isabelle
lemma "A ∧ (A ⟶ B) ⟶ B ∨ C"
proof (rule impI)
  assume "A ∧ (A ⟶ B)"
  then have "B"
```

```output state
proof (chain)
picking this:
  A ∧ (A ⟶ B)

proof (prove)
using this:
  A ∧ (A ⟶ B)

goal (1 subgoal):
 1. B
```

对最后一行，Isabelle 打印了两个状态，每个命令一个。`then` 之后的模式是 `proof (chain)`，`picking this`（选取 this）显示正在传递的事实。`have "B"` 之后出现了新的目标，它将要使用的事实列在 `using this`（使用 this）下面。在 Isabelle/jEdit 中，你看到的是光标所在命令的状态。完成这条流水线：

```isabelle
    by blast
  then show "B ∨ C" by blast
qed
```

### 名字，以及 from、with、using 和 note {#facts-names}

一旦某一步需要更早的事实，流水线就断了。`from` 指明要传递哪些事实，所以 `then` 就等于 `from this`。引用事实可以用它的名字，也可以把它的陈述写在引号 `‹` 和 `›` 之间：`‹A›` 读作“事实 A”，指的是证明中陈述为 A 的那个事实。

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  from ab have "A" by blast
  from ab have "B" by blast
  with ‹A› show "B ∧ A" by blast
qed
```

`with ‹A›` 是 `from ‹A› this` 的简写：它既传递指明的事实，**也**传递当前的事实，这里是 B。

::: tip
要在 Isabelle/jEdit 中输入 `‹` 和 `›`，就输入一个反引号（`` ` ``），然后接受第一个补全项，它会插入 `‹›`，并把光标放在两个引号之间。
:::

`note` 把事实放进 `this`，但不证明任何东西；它还可以给这组事实起一个名字：

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  from ab have a: "A" by blast
  from ab have b: "B" by blast
  note both = b a
```

```output state
proof (state)
this:
    B
    A

goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

```isabelle
  from both show "B ∧ A" by (rule conjI)
qed
```

这里事实的顺序很重要：`rule conjI` 用第一个事实证明左边的合取项，用第二个事实证明右边的合取项。对 `blast`、`simp` 和 `auto` 来说，顺序没有影响。

::: fact 链接的简写
| 你写的 | 它的意思 |
|---|---|
| `then` | `from this` |
| `with a` | `from a this` |
| `have "P" using a` | `from a have "P"` |
| `hence` | `then have` |
| `thus` | `then show` |
:::

你会在较早的证明中遇到 `hence` 和 `thus`，Isabelle 的教程中也有。Isabelle2026 仍然接受它们，但它的参考手册称它们是 Isar 早期历史的遗留物，并建议使用较长的形式，本系列用的也是较长的形式。

### 方法只看得到你交给它的事实 {#facts-visible}

在第 10.2.5 节中，`clamp_lower` 的证明写了 `using assms`。把它去掉：

```isabelle fails
lemma
  assumes "lo ≤ hi"
  shows "lo ≤ clamp lo hi x"
  by simp
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. hi < x ⟶ ¬ x < lo ⟶ lo ≤ hi
```

化简器（simplifier）展开了 `clamp`，拆开了其中的 `if`，剩下的正是需要这个假设的那一种情形：当 x 在范围之上时，`clamp` 返回 hi，而 lo ≤ hi 恰恰是 `simp` 不知道的。这个假设一直都在证明中，但是**证明方法只看得到目标，以及用 `then`、`from`、`with` 或 `using` 传给它的事实**，此外就是它总会使用的那些规则：对 `simp` 来说，就是化简规则（simp rule），其中包括 `clamp` 的等式。这是有意这样设计的：由你决定哪些事实是相关的，自动化工具也就不会迷失在成百上千个事实之中。

::: keyidea
假设和已经证明的事实在证明中都可以使用，但只有当你把它们传给方法时，方法才会使用它们。某一步失败时，先检查它是否得到了它需要的事实。
:::

### 使用存在性事实：obtain {#facts-obtain}

模块 6 中的规则 (∃E) 说：由 ∃x. P x，你可以引入一个新名字 a 以及 P a，只要结论中不提到 a。在 Isar 中，这就是 `obtain`。再看一看第 10.1 节中的 Isar 证明：

- `assume all: …` 和 `assume "∃u. admin u"` 接过 `proof (intro impI)` 留下的两个前提。
- `then obtain a where "admin a" by blast` 引入一个新的固定变量 `a` 和事实 `admin a`。它的证明 `by blast` 利用链接过来的事实 ∃u. admin u，说明这样的 `a` 确实存在。
- `with all have "staff a"` 把 `all` 和 `admin a` 传给 `blast`。
- `then show "∃u. staff u"` 使用 `staff a`：`a` 就是见证。

如果忘了链接这个存在性事实，`obtain` 就无法得到证明：

```isabelle fails
lemma "(∃u. admin u) ⟶ (∃u. admin u ∨ staff u)"
proof
  assume "∃u. admin u"
  obtain a where "admin a" by blast
  then show "∃u. admin u ∨ staff u" by blast
qed
```

```output result
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. (⋀a. admin a ⟹ thesis) ⟹ thesis
```

消息中的目标就是 `obtain` 必须证明的东西：无论你想证明的是什么（`thesis`），只要对任意的 `a`，它都能由 `admin a` 得出，它就成立。没有事实 ∃u. admin u，`blast` 证明不了这一点。要么写成 `then obtain`；要么给这个事实起个名字，然后写 `obtain a where "admin a" using ex by blast`，把 `using` 放在这个子句的后面。

### 收集事实：moreover 和 ultimately {#facts-moreover}

有时，一步需要好几个先后证明出来的事实。你不必给每个事实都起名字，而可以把它们收集起来：`moreover` 把最近的事实 `this` 加到一组事实中，`ultimately` 加入最后一个事实，然后把这一整组事实传给下一个断言。

```isabelle
lemma clamp_in_range:
  assumes "lo ≤ hi"
  shows "lo ≤ clamp lo hi x ∧ clamp lo hi x ≤ hi"
proof -
  have "lo ≤ clamp lo hi x" using assms by simp
  moreover have "clamp lo hi x ≤ hi" using assms by simp
  ultimately show ?thesis by blast
qed
```

这个证明说的正是审阅者想看到的：结果至少是 lo，至多是 hi，所以它落在这个范围之内。

## 计算推理 {#calc}

数学中的很多推理，以及关于程序的很多推理，都是计算推理：由等式或不等式组成的一条链，其中每一步都由前一步得出。

### 等式链 {#calc-eq}

在纸上，你会这样把 (a + b)(a + b) 展开：

$$
\begin{aligned}
(a + b)(a + b) &= a(a + b) + b(a + b) \\
&= a \cdot a + a \cdot b + (b \cdot a + b \cdot b) \\
&= a \cdot a + 2ab + b \cdot b
\end{aligned}
$$

然后得出结论：最前面的式子等于最后面的式子。Isar 写出的是同一条链：

```isabelle
lemma "(a + b) * (a + b) = a * a + 2 * a * b + b * (b :: int)"
proof -
  have "(a + b) * (a + b) = a * (a + b) + b * (a + b)" by (rule distrib_right)
  also have "… = a * a + a * b + (b * a + b * b)" by (simp add: distrib_left)
  also have "… = a * a + 2 * a * b + b * b" by (simp add: algebra_simps)
  finally show ?thesis .
qed
```

- `…` 读作“上一步的右边”。要输入它，就输入三个点 `...`：Isabelle/jEdit 会提供符号 …，而直接用三个点也可以。
- `also` 把新的一步加入链中。Isabelle 用传递性把各步组合起来：由 a = b 和 b = c 推出 a = c。
- `finally` 组合最后一步，并把结果“最前面的式子 = 最后面的式子”传给下一个断言。
- `.`（一个点）是一个证明，当断言恰好就是传给它的事实时，它就会成功。这里的断言是 `?thesis`，即引理的陈述。

每一步都有自己的依据：`distrib_right` 是定律 (a + b)c = ac + bc，`distrib_left` 是定律 a(b + c) = ab + ac，而 `algebra_simps` 是交换律等一组定律，`simp` 用它们来重新排列各项。

::: definition 计算推理
**计算推理**（calculation）是由步骤 t₁ R t₂、t₂ R t₃、… 组成的一条链，每一步都有自己的证明；Isabelle 由它们通过**传递性**（transitivity）推出 t₁ R tₙ：由 a R b 和 b R c 得到 a R c。在 Isar 中，`also` 延长这条链，`finally` 结束它；`…` 代表上一步的右边。
:::

### 不等式 {#calc-ineq}

一条链中可以混用 `=`、`≤` 和 `<`。结果取链中最严格的关系：只要任何地方有一个 `<`，整条链的结果就是 `<`。

::: example 二叉堆中的下标
二叉堆（binary heap）常常存放在数组中：下标为 i 的结点，它的左子结点的下标是 2i + 1。如果 i 是前 n 个下标之一，这个子结点是否在前 2n 个下标之内？

```isabelle
lemma heap_child:
  fixes i n :: nat
  assumes "i < n"
  shows "2 * i + 1 < 2 * n"
proof -
  have "2 * i + 1 < 2 * i + 2" by simp
  also have "… = 2 * (i + 1)" by simp
  also have "… ≤ 2 * n" using assms by simp
  finally show ?thesis .
qed
```

`fixes i n :: nat` 为整个陈述声明引理的变量及其类型；没有它，Isabelle 就不知道 i 和 n 是哪一种数。这条链依次是 <、= 和 ≤，所以结果是 `2 * i + 1 < 2 * n`。只有最后一步需要这个假设，也只有这一步得到了它。
:::

::: pitfall
`finally` 产生的是最严格的关系，而 `.` 只接受与这个事实完全相同的断言。较弱的断言会失败，尽管它可以由这个事实得出：

```isabelle fails
lemma
  fixes x y z :: nat
  assumes "x < y" and "y ≤ z"
  shows "x ≤ z"
proof -
  have "x < y" using assms by simp
  also have "… ≤ z" using assms by simp
  finally show "x ≤ z" .
qed
```

```output result
*** Failed to apply initial proof method:
*** using this:
***   x < z
*** goal (1 subgoal):
***  1. x ≤ z
```

消息显示了这条链产生的事实（`using this: x < z`）以及断言。要么断言 `x < z`，要么把 `.` 换成一个能弱化这个事实的方法，这里用 `by simp`。

用 `≥` 和 `>` 写的链，效果和你预想的不一样。Isabelle 把 a ≥ b 读作 b ≤ a，所以 `…` 代表的是 a 而不是 b，各步就再也接不上了：

```isabelle fails
lemma
  fixes a b c :: nat
  assumes "a ≥ b" and "b ≥ c"
  shows "a ≥ c"
proof -
  have "a ≥ b" using assms by simp
  also have "… ≥ c" using assms by simp
  finally show "a ≥ c" .
qed
```

```output result
*** Vacuous calculation result: (⋀x y. x ≤ y ⟹ a ≤ a) ⟹ b ≤ a
*** derived as projection (1) from:
***     b ≤ a
***     c ≤ a
```

写链时，要用 `≤` 和 `<`，从小的一端写到大的一端。
:::

## 情形分析 {#cases}

许多关于程序的证明都要分情形：列表为空或不为空，`if` 的条件成立或不成立，输入在某个范围之下、之内或之上。在 Isar 中，每种情形在块中各占一部分，彼此用 `next` 分隔。

### 两种情形：真或假 {#cases-bool}

`clamp lo hi x` 应当与这样的数学描述一致：“先取 hi 和 x 中较小的那个，再取它与 lo 中较大的那个”。按 `clamp` 的第一个条件判断分情形来证明这一点：

```isabelle
lemma clamp_max_min:
  assumes "lo ≤ hi"
  shows "clamp lo hi x = max lo (min hi x)"
proof (cases "x < lo")
```

```output state
proof (state)
goal (2 subgoals):
 1. x < lo ⟹ clamp lo hi x = max lo (min hi x)
 2. ¬ x < lo ⟹ clamp lo hi x = max lo (min hi x)
```

`proof (cases "x < lo")` 把目标分成两种情形：x < lo 成立的情形，以及它不成立的情形。命令 `case True` 进入第一种情形：

```isabelle
  case True
```

```output state
proof (state)
this:
  x < lo

goal (2 subgoals):
 1. x < lo ⟹ clamp lo hi x = max lo (min hi x)
 2. ¬ x < lo ⟹ clamp lo hi x = max lo (min hi x)
```

`case True` 假设这种情形的条件成立，证明状态把这个条件列在 `this:` 下面。状态中仍然列出两个待证目标，要证明的断言也仍然是 `?thesis`，即引理的陈述。在假设 x < lo 之下证明了它，就解决了第一个目标：

```isabelle
  then show ?thesis using assms by simp
next
  case False
  then show ?thesis using assms by simp
qed
```

当你写下 `proof (cases …)` 或 `proof (induction …)` 时，Isabelle/jEdit 还会显示一条以 **Proof outline with cases:**（带情形的证明大纲）开头的消息，给出证明其余部分的骨架。对这条引理，这条消息是：

```text
Proof outline with cases:
  case True
  then show ?thesis sorry
next
  case False
  then show ?thesis sorry
qed
```

点击这个骨架，Isabelle/jEdit 就会把它插入你的文本。每个 `sorry` 标出一个还没有写的证明：在你工作的过程中，Isabelle/jEdit 接受用它来代替证明，但含有 `sorry` 的理论并没有得到证明。要把每一个 `sorry` 都换掉。

### 数据类型的情形 {#cases-datatype}

对列表来说，情形就是构造列表的两种方式：空列表 `[]`，叫作 `Nil`；以及 `y # ys`，叫作 `Cons`。看一个函数：它返回列表的第一个元素，对空列表则返回一个默认值 d：

```isabelle
fun first_or :: "'a ⇒ 'a list ⇒ 'a" where
  "first_or d [] = d"
| "first_or d (y # ys) = y"
```

`xs @ ys` 的第一个元素就是 xs 的第一个元素，除非 xs 为空；这时它是 ys 的第一个元素：

```isabelle
lemma first_or_append: "first_or d (xs @ ys) = first_or (first_or d ys) xs"
proof (cases xs)
```

```output state
proof (state)
goal (2 subgoals):
 1. xs = [] ⟹ first_or d (xs @ ys) = first_or (first_or d ys) xs
 2. ⋀a list.
       xs = a # list ⟹ first_or d (xs @ ys) = first_or (first_or d ys) xs
```

```isabelle
  case Nil
  then show ?thesis by simp
next
  case (Cons z zs)
```

```output state
proof (state)
this:
  xs = z # zs

goal (1 subgoal):
 1. ⋀a list.
       xs = a # list ⟹ first_or d (xs @ ys) = first_or (first_or d ys) xs
```

`case (Cons z zs)` 给 xs 的头部和尾部起了名字：状态中显示假设 xs = z # zs，而目标仍然使用 Isabelle 自己给它们起的名字 `a` 和 `list`。要选引理中还没有用过的名字。`case (Cons y ys)` 会造出第二个 `ys`，在这种情形余下的部分中，它会遮住引理自己的 `ys`，尽管 Isabelle 把两者都显示为 `ys`。完成这种情形：

```isabelle
  then show ?thesis by simp
qed
```

::: pitfall
没有 `next`，第一种情形的假设在第二种情形中仍然有效：

```isabelle fails
lemma "first_or d (xs @ ys) = first_or (first_or d ys) xs"
proof (cases xs)
  case Nil
  then show ?thesis by simp
  case (Cons z zs)
  then show ?thesis by simp
qed
```

```output result
*** Failed to refine any pending goal
```

第二个 `show` 是在 xs = [] 和 xs = z # zs 这两个假设之下证明它的断言的，而没有哪个待证目标同时带有这两个假设，所以它得到的事实一个目标也解决不了。在两种情形之间加上 `next`。
:::

### 由析取式分情形 {#cases-or}

模块 6 中的规则 (∨E) 由 A ∨ B 证明 C 的方法是：由 A 证明一次 C，再由 B 证明一次 C。在 Isar 中，把这个析取式传给 `proof`，并在每种情形中写上相应的 `assume`。在下面的例子中，用户如果是文件的所有者，或者是管理员，就可以读这个文件：

```isabelle
lemma
  assumes who: "owner u ∨ admin u"
    and owners: "∀v. owner v ⟶ may_read v"
    and admins: "∀v. admin v ⟶ may_read v"
  shows "may_read u"
  using who
proof
  assume "owner u"
  with owners show ?thesis by blast
next
  assume "admin u"
  with admins show ?thesis by blast
qed
```

`proof` 之前的 `using who` 把这个析取式传给初始方法，所以 `proof` 应用的是 ∨ 的消去规则，而不是引入规则（introduction rule）。在两种情形中，`?thesis` 都是引理的断言 `may_read u`。

### 自己定义的情形：consider {#cases-consider}

有时，自然的情形划分既不来自数据类型，也不来自单个条件。`clamp` 区分三种情形：x 在范围之下、之内或之上。`consider` 陈述这样的一种划分，并给每种情形起一个名字，然后证明这些情形涵盖了所有的可能：

```isabelle
lemma
  assumes "lo ≤ hi"
  shows "lo ≤ clamp lo hi x ∧ clamp lo hi x ≤ hi"
proof -
  consider (below) "x < lo" | (inside) "lo ≤ x" "x ≤ hi" | (above) "hi < x"
    by linarith
  then show ?thesis
  proof cases
    case below
    then show ?thesis using assms by simp
  next
    case inside
    then show ?thesis by simp
  next
    case above
    then show ?thesis using assms by simp
  qed
qed
```

`consider` 的证明（这里是模块 9 中的 `linarith`）说明每个 x 都落在这三种情形之一中。接着，`then show ?thesis proof cases` 按这些情形拆分证明，`case inside` 假设这种情形的两个事实。引理也可以陈述这样的划分，供以后使用，这时用 `obtains` 代替 `shows`；在证明内部，`consider` 就是它的局部形式。

## 用命名情形做归纳 {#induction}

在模块 5 中，你用 `apply (induction xs)` 证明递归函数的性质，并从证明状态中读出基础情形（base case）和归纳步骤（induction step）。在 Isar 中，归纳的每种情形都成为块中有名字的一部分，而归纳假设（induction hypothesis）则成为一个有名字的事实。

### 归纳的骨架 {#induction-skeleton}

下面的函数求一列金额的总和，例如一张账单上各项的总额：

```isabelle
fun mysum :: "nat list ⇒ nat" where
  "mysum [] = 0"
| "mysum (x # xs) = x + mysum xs"
```

```output
consts
  mysum :: "nat list ⇒ nat"

Found termination order: "size_list size <*mlex*> {}"
```

把两张账单合在一起，总额等于两张账单的总额之和。对 xs 开始归纳：

```isabelle
lemma mysum_append: "mysum (xs @ ys) = mysum xs + mysum ys"
proof (induction xs)
```

```output state
proof (state)
goal (2 subgoals):
 1. mysum ([] @ ys) = mysum [] + mysum ys
 2. ⋀a xs.
       mysum (xs @ ys) = mysum xs + mysum ys ⟹
       mysum ((a # xs) @ ys) = mysum (a # xs) + mysum ys
```

这就是模块 5 中的基础情形和归纳步骤。Isabelle/jEdit 显示的证明大纲按照列表的构造子给这两种情形命名：

```text
Proof outline with cases:
  case Nil
  then show ?case sorry
next
  case (Cons a xs)
  then show ?case sorry
qed
```

先证明基础情形，然后进入归纳步骤，并给头部和尾部起你自己选定的名字：

```isabelle
  case Nil
  show ?case by simp
next
  case (Cons x xs)
```

```output state
proof (state)
this:
  mysum (xs @ ys) = mysum xs + mysum ys

goal (1 subgoal):
 1. ⋀a xs.
       mysum (xs @ ys) = mysum xs + mysum ys ⟹
       mysum ((a # xs) @ ys) = mysum (a # xs) + mysum ys
```

`case (Cons x xs)` 做了三件事。它固定 x 和 xs，这是你给目标中叫作 `a` 和 `xs` 的那两个变量起的名字。它假定归纳假设成立，状态把归纳假设显示在 `this:` 下面。它还把 `?case`（读作“the case”，即“这种情形”）设为这种情形的断言：`mysum ((x # xs) @ ys) = mysum (x # xs) + mysum ys`。用 `then` 把归纳假设传给 `simp`：

```isabelle
  then show ?case by simp
qed
```

::: definition 命名情形
在用 `cases` 或 `induction` 做的证明中，**`case c`** 进入名为 c 的情形，**`case (c x y …)`** 还会给这种情形的变量起名字。情形会假设它的那些事实，这些事实合在一起可以用名字 c 来引用。在归纳中，`case` 还会把 **`?case`** 设为这种情形的断言，**c.IH** 是归纳假设，**c.prems** 是断言的前提（第 10.6.2 节）。在用 `cases` 做的证明中，每种情形证明的都是同一个断言 `?thesis`。
:::

对自然数，两种情形叫作 `0` 和 `Suc`：先是 `case 0`，然后是 `case (Suc n)`，后者的归纳假设是 `Suc.IH`。对你自己定义的数据类型，情形以它的构造子命名。

### 归纳假设、前提与 ?case {#induction-names}

纸上证明中的归纳步骤，是一个只用一次归纳假设的计算推理。Isar 证明可以原原本本地写出这一点，其中归纳假设的名字是 `Cons.IH`：

```isabelle
lemma "mysum (xs @ ys) = mysum xs + mysum ys"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "mysum ((x # xs) @ ys) = x + mysum (xs @ ys)" by simp
  also have "… = x + (mysum xs + mysum ys)" using Cons.IH by simp
  also have "… = mysum (x # xs) + mysum ys" by simp
  finally show ?case .
qed
```

当断言带有前提时，归纳会把前提与归纳假设分开。

::: example 各项都有上限的账单
如果账单上的每一项都不超过 m，那么总额不超过 m 乘以项数。`set xs` 是由 xs 的元素组成的集合，所以 ∀x ∈ set xs. x ≤ m 说的是每一项都不超过 m。

```isabelle
lemma mysum_bound: "(∀x ∈ set xs. x ≤ m) ⟹ mysum xs ≤ length xs * m"
proof (induction xs)
  print_cases
```

```output result
cases:
  Nil:
    let "?case" = "mysum [] ≤ length [] * m"
    assume prems : "∀x∈set []. x ≤ m"
  Cons:
    fix a_ xs_
    let "?case" = "mysum (a_ # xs_) ≤ length (a_ # xs_) * m"
    assume IH : "∀x∈set xs_. x ≤ m ⟹ mysum xs_ ≤ length xs_ * m" and
      prems : "∀x∈set (a_ # xs_). x ≤ m"
```

`print_cases` 列出各种情形以及它们提供的一切：固定变量、`?case`、`IH` 下的归纳假设，以及 `prems` 下的断言前提。名字 `a_` 和 `xs_` 末尾带有下划线，它们是隐藏的：在 `case (Cons a xs)` 给它们起名字之前，证明无法引用它们。每种情形都得到关于它自己那个列表的前提，而归纳假设是关于较短的列表 xs 的整个蕴涵。

```isabelle
  case Nil
  then show ?case by simp
next
  case (Cons a xs)
  have "mysum (a # xs) = a + mysum xs" by simp
  also have "… ≤ m + mysum xs" using Cons.prems by simp
  also have "… ≤ m + length xs * m" using Cons.IH Cons.prems by simp
  also have "… = length (a # xs) * m" by simp
  finally show ?case .
qed
```

第二步只需要前提：因为 a 在列表中，所以 a ≤ m。第三步需要归纳假设，而归纳假设又需要它自己的前提，即 xs 的每一项都不超过 m，这同样可以由 `Cons.prems` 得出。所以两者都要传过去。
:::

::: trouble
- **把 `show ?case` 写成了 `show ?thesis`。** 在归纳中，`?thesis` 是关于原来的 xs 的整条引理，而不是这种情形的断言：

  ```isabelle fails
  lemma "mysum (xs @ ys) = mysum xs + mysum ys"
  proof (induction xs)
    case Nil
    show ?thesis by simp
  next
    case (Cons x xs)
    then show ?case by simp
  qed
  ```

  ```output result
  *** Failed to apply initial proof method⌂:
  *** goal (1 subgoal):
  ***  1. mysum (xs @ ys) = mysum xs + mysum ys
  ```

  `simp` 无法对一个未知的列表证明这条引理，所以这一步失败了。要写 `?case`。
- **不存在的情形名。** 情形名来自构造子，这里是 `Nil` 和 `Cons`：

  ```isabelle fails
  lemma "mysum (xs @ ys) = mysum xs + mysum ys"
  proof (induction xs)
    case Empty
    show ?case by simp
  next
    case (Cons x xs)
    then show ?case by simp
  qed
  ```

  ```output
  *** Undefined case: "Empty"⌂
  ```

  证明大纲和 `print_cases` 会显示正确的名字。
- **没有传递归纳假设。** 没有 `then`（或 `using Cons.IH`），`simp` 就看不到归纳假设：

  ```isabelle fails
  lemma "mysum (xs @ ys) = mysum xs + mysum ys"
  proof (induction xs)
    case Nil
    show ?case by simp
  next
    case (Cons x xs)
    show ?case by simp
  qed
  ```

  ```output result
  *** Failed to finish proof⌂:
  *** goal (1 subgoal):
  ***  1. mysum (xs @ ys) = mysum xs + mysum ys
  ```

  剩下的目标正是归纳假设本身：这清楚地表明归纳假设没有传过去。
:::

## 从纸上证明和 apply 脚本到 Isar {#translate}

现在你已经见过本系列需要的 Isar 的所有部分。本节把 Isar 和模块 5、6、7 中的证明并排放在一起，让你能在两个方向上互相改写。

### 一个自然演绎证明 {#translate-nd}

在模块 6 中，你用下面这棵树证明了 A ∧ B ⟶ B ∧ A：

```prooftree
A ∧ B ⟶ B ∧ A   (⟶I¹)
  B ∧ A   (∧I)
    B   (∧E₂)
      [A ∧ B]¹
    A   (∧E₁)
      [A ∧ B]¹
```

在模块 7 中，你用 `apply` 重现了它：

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (erule conjE)
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

Isar 证明一条规则一条规则地沿着这棵树走。它需要树中所用形式的 (∧E₁) 和 (∧E₂)，即由 A ∧ B 得到 A、由 A ∧ B 得到 B：这就是模块 7 中的析构规则（destruction rule）`conjunct1` 和 `conjunct2`。

```isabelle
thm conjunct1 conjunct2
```

```output result
  ?P ∧ ?Q ⟹ ?P
  ?P ∧ ?Q ⟹ ?Q
```

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  from ab have b: "B" by (rule conjunct2)
  from ab have a: "A" by (rule conjunct1)
  from b a show "B ∧ A" by (rule conjI)
qed
```

树中的每条规则都是证明中的一行（图 10.2）。树用 (⟶I) 解除的假设 [A ∧ B]¹，就是 `rule impI` 开启的块中的那个 `assume`。树从叶子往下读，Isar 文本从上往下读，两者包含的步骤完全相同。相比之下，apply 脚本从目标出发反向工作，根本没有陈述过 B 或 A。

::: figure id=fig-10-2
模块 6 中的自然演绎证明树及其 Isar 证明。证明树中的每条规则（以各自的颜色标出）是 Isar 证明中的一步；被解除的假设 [A ∧ B]¹ 就是那个 `assume`。
:::

写出规则的名字对学习很有帮助。实际使用时，你可以让 Isabelle 自己选择规则：`..`（两个点）是用一步标准规则完成的证明，所以写 `from ab have "B" ..` 也可以；`by blast` 同样能证明这样的步骤。

### 逐条规则对照 {#translate-rules}

自然演绎的每条规则在 Isar 中都有对应的写法。表中的 A、B 和 C 是公式，`ab`、`imp`、`a`、`b`、`na`、`all`、`pa` 和 `ex` 分别是事实 A ∧ B、A ⟶ B、A、B、¬ A、∀x. P x、P a 和 ∃x. P x 的名字。

| 规则（模块 6） | apply 步骤（模块 7） | Isar |
|---|---|---|
| (⟶I) | `rule impI` | `assume "A"` … `show "B"` |
| (⟶E) | `erule impE` | `from imp a have "B" by (rule mp)` |
| (∧I) | `rule conjI` | `from a b have "A ∧ B" by (rule conjI)` |
| (∧E₁), (∧E₂) | `erule conjE` | `from ab have "A" by (rule conjunct1)` |
| (∨I₁) | `rule disjI1` | `from a have "A ∨ B" by (rule disjI1)` |
| (∨E) | `erule disjE` | `from ‹A ∨ B› show "C" proof` … `next` … `qed` |
| (¬I) | `rule notI` | `assume "A"` … `show False` |
| (¬E) | `erule notE` | `from na a show False by (rule notE)` |
| (∀I) | `rule allI` | `fix x` … `show "P x"` |
| (∀E) | `erule allE` | `from all have "P a" by (rule spec)` |
| (∃I) | `rule exI` | `from pa have "∃x. P x" by (rule exI)` |
| (∃E) | `erule exE` | `from ex obtain a where "P a" by blast` |
| (RAA) | `rule ccontr` | `proof (rule ccontr)` `assume "¬ A"` … `show False` |

`spec` 是 (∀E) 对应的析构规则（模块 7）：由 ∀x. P x，它对任意 x 给出 P x。

### 一个归纳证明 {#translate-induction}

模块 5 两次证明了求和公式 $2 \cdot \mathit{sum\_upto}(n) = n \cdot (n + 1)$：一次在纸上，即“求和公式”这个例子；一次在 Isabelle 中，用的是 apply 脚本。下面再列出定义和那个脚本：

```isabelle
fun sum_upto :: "nat ⇒ nat" where
  "sum_upto 0 = 0"
| "sum_upto (Suc n) = sum_upto n + Suc n"
```

```isabelle
lemma "2 * sum_upto n = n * (n + 1)"
  apply (induction n)
  apply simp
  apply simp
  done
```

这个脚本既没有说出两种情形是什么，也没有说出归纳步骤怎样使用归纳假设。纸上的证明说出来了：它的归纳步骤是由四个等式组成的一条链。Isar 证明一行对一行地重复了这条链：

```isabelle
lemma sum_formula: "2 * sum_upto n = n * (n + 1)"
proof (induction n)
  case 0
  show ?case by simp
next
  case (Suc n)
  have "2 * sum_upto (Suc n) = 2 * (sum_upto n + Suc n)" by simp
  also have "… = 2 * sum_upto n + 2 * Suc n" by simp
  also have "… = n * (n + 1) + 2 * Suc n" using Suc.IH by simp
  also have "… = Suc n * (Suc n + 1)" by simp
  finally show ?case .
qed
```

| 纸上（模块 5） | Isar 中 |
|---|---|
| 对 $n$ 做归纳。 | `proof (induction n)` |
| 基础情形 $P(0)$。 | `case 0`，`show ?case by simp` |
| 设 $n$ 是任意一个数，并假设归纳假设成立。 | `next`，`case (Suc n)` |
| $2 \cdot \mathit{sum\_upto}(n+1) = 2 \cdot (\mathit{sum\_upto}(n) + (n+1))$，由 sum_upto.2 | `have "2 * sum_upto (Suc n) = …" by simp` |
| $= 2 \cdot \mathit{sum\_upto}(n) + 2 \cdot (n+1)$，算术 | `also have "… = …" by simp` |
| $= n \cdot (n+1) + 2 \cdot (n+1)$，由归纳假设 | `also have "… = …" using Suc.IH by simp` |
| $= (n+1) \cdot (n+2)$，算术 | `also have "… = …" by simp` |
| 由归纳法，$P(n)$ 对每个 $n$ 都成立。 | `finally show ?case .`，`qed` |

和模块 5 的子目标中一样，Isabelle 把 n + 1 写成 `Suc n`。每一步都单独检查，所以这个证明准确地显示出归纳假设用在了哪里。

### 从 apply 脚本到 Isar：改写的步骤 {#translate-recipe}

要把 apply 脚本改写成 Isar，先在 Isabelle/jEdit 中运行这个脚本，并查看每一行之后的证明状态。然后写下这些状态说了什么，而不是方法做了什么：

1. 开头几步通常只做引入：`rule impI`、`rule allI`、`intro impI`。它们变成 `proof (intro …)` 或 `proof`，后面跟上状态中随之出现的东西：每个前提写一个 `assume`，每个由 ⋀ 约束的变量写一个 `fix`。
2. 推出一个新事实的步骤，例如 `drule mp` 或 `erule conjE`，变成一个以这个事实为陈述的 `have`。
3. 完成目标的那一步变成 `show`。
4. 用 apply 步骤中的规则或者用自动化工具证明每一步。

下面是一个模块 7 风格的脚本，证明的是蕴涵的传递性：

```isabelle
lemma "(A ⟶ B) ⟶ (B ⟶ C) ⟶ A ⟶ C"
  apply (intro impI)
  apply (erule mp)
  apply (erule mp)
  apply assumption
  done
```

`intro impI` 之后，状态中有前提 A ⟶ B、B ⟶ C 和 A，以及结论 C。第一个 `erule mp` 从 C 反向推到 B，第二个从 B 反向推到 A。按照读者的思路正向写出来就是：

```isabelle
lemma "(A ⟶ B) ⟶ (B ⟶ C) ⟶ A ⟶ C"
proof (intro impI)
  assume ab: "A ⟶ B" and bc: "B ⟶ C" and a: "A"
  from ab a have b: "B" by (rule mp)
  from bc b show "C" by (rule mp)
qed
```

## Isar 证明失败时 {#errors}

由于 Isar 证明的每一步都是一个陈述，Isabelle 能告诉你哪一步失败了，以及它还剩下什么没有证明。下面是你最常遇到的消息，其中大多数你在本模块中已经见过。

| 消息 | 含义 | 怎么办 |
|---|---|---|
| 出现在 `by` 处的 Failed to finish proof（未能完成证明）或 Failed to apply initial proof method（未能应用初始的证明方法） | 方法无法用交给它的事实证明这一步。消息显示了还剩下什么。 | 传入缺少的事实（`then`、`using`）；加一条引理（`simp add:`）；把这一步拆开；试试 `sledgehammer`（模块 9）。 |
| 出现在 `proof` 处的 Failed to apply initial proof method | 初始方法无法开始，例如没有适合目标的标准规则。 | 用 `proof -`，或者写明规则。 |
| Failed to refine any pending goal（未能解决任何待证目标） | `show` 得到的事实，在它所在块的假设之下，解决不了任何待证目标。 | 把断言和状态中的目标比较一下；检查 `?case` 和 `?thesis`、`next`，以及那些不是目标前提的假设。 |
| Illegal application of proof command in "prove" mode（在“prove”模式下非法使用证明命令） | 某个断言没有证明，所以下一个命令来得太早了。 | 给这个断言加上证明：`by …` 或 `proof … qed`。 |
| Undefined case（未定义的情形）、Undefined fact（未定义的事实） | 情形名或事实名写错了。 | 参考证明大纲或 `print_cases`。 |
| Vacuous calculation result（空洞的计算结果） | 链中的各步接不上。 | 用 `=`、`≤` 和 `<` 写链。 |

例如，当一个 `have` 没有证明时，就会出现第四条消息：

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  have "B"
  show "B ∧ A" using ab by blast
qed
```

```output
*** Illegal application of proof command in "prove" mode
```

在 `have "B"` 之后，Isabelle 处于 `prove` 模式，等待一个证明；而 `show` 不是证明。

“Failed to refine any pending goal”值得仔细看一看，因为这一步本身是成功的：断言得到了证明，只是它与目标不相符。在 `show` 的证明完成之前，Isabelle/jEdit 就会用消息“Local statement fails to refine any pending goal”（局部陈述未能解决任何待证目标）对此发出警告。下面是典型的情况，即断言并不是目标：

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume "A ∧ B"
  then show "A ∧ B" by blast
qed
```

```output result
*** Failed to refine any pending goal
```

要找出哪里出了错，就把 `show` 改成 `have`：如果这一步随后被接受了，说明断言本身没有问题，不相符的是断言和目标。查看状态中的目标，把两者比较一下。

下面几个习惯能让 Isar 证明更容易写，也更容易长期保持可用：

- **先写骨架。** 陈述引理，写出 `proof …`、`assume`、`fix` 和 `show` 这几行以及 `qed`，让证明大纲来填入各种情形。然后一次证明一步。
- **每一步只表达一个想法。** 如果某个 `by` 需要一长串事实或者一个巧妙的方法，就在中间插入一个 `have`。
- **只链接需要的事实。** 在用到某个事实的地方，用 `then`、`with` 或 `using` 传递它；只有当它要在较远的地方用到时，才给它起名字。
- **让自动化工具完成小步骤。** `simp`、`blast`、`auto` 和 `linarith` 负责证明各个步骤；Isar 提供供人阅读的结构。

## 小结 {#summary}

- **Isar** 把证明写成结构化的文本：每一步陈述什么为真，由 Isabelle 检查。这样的证明不用 Isabelle 也能读懂，出错的步骤会在出错的地方被标出来。
- **证明块** `proof m … qed` 以一个初始方法开始：`proof (rule r)`、`proof`（应用目标的一条标准规则）或 `proof -`（什么也不做）。在块中，`assume` 取一个前提，`fix` 取一个任意的值，`have` 证明一个中间事实，`show` 解决一个待证目标。`next` 把不同目标的证明分隔开。
- **事实**从一步流向下一步：`then` 传递 `this`，`from a` 传递指明的事实，`with a` 两者都传递，`using a` 写在断言之后，`note` 收集事实，`moreover … ultimately` 先收集几个事实再一起使用。`hence` 和 `thus` 是 `then have` 和 `then show` 的旧形式。方法只看得到传给它的事实。
- `obtain x where …` 使用一个存在性事实，就像规则 (∃E) 那样。
- **计算推理**用 `also` 把各步串起来，用 `finally` 结束；`…` 代表上一步的右边，`.` 证明的是链所产生的断言。结果取链中最严格的关系。
- **情形分析**使用 `proof (cases …)`，配合 `case True`/`case False` 或数据类型的构造子；自己定义的情形用 `consider`；还可以把析取式传给 `proof`。
- **归纳**使用 `proof (induction x)`，配合 `case Nil`、`case (Cons x xs)`、`case 0`、`case (Suc n)`；在一种情形中，`?case` 是它的断言，`c.IH` 是归纳假设，`c.prems` 是前提。
- 自然演绎证明和 apply 脚本可以一步一步地改写成 Isar；Isabelle 的消息（Failed to finish proof、Failed to refine any pending goal、Undefined case……）会指出需要修复的那一步。

## 练习 {#exercises}

:::: exercise 读懂一个证明 {#ex-10-1} ★
下面是一个关于登录检查的证明：一个没有被锁定、并且输入了有效密码的用户可以登录。

```isabelle
lemma
  assumes valid: "valid pw"
    and fresh: "¬ locked u"
    and policy: "∀p v. valid p ∧ ¬ locked v ⟶ login v p"
  shows "login u pw ∧ valid pw"
proof -
  from valid fresh have "valid pw ∧ ¬ locked u" by blast
  with policy have "login u pw" by blast
  then show ?thesis using valid by blast
qed
```

1. 第一个 `have` 之后，`this` 是什么？
2. 在第二步中，`blast` 得到了哪些事实？
3. `?thesis` 代表什么？
4. 用 `from` 代替 `with`，改写第二步。

::: solution
1. `valid pw ∧ ¬ locked u`，即这一步证明的事实。
2. `policy` 和 `this`，也就是 ∀p v. valid p ∧ ¬ locked v ⟶ login v p 和 valid pw ∧ ¬ locked u：`with policy` 是 `from policy this` 的简写。
3. `shows` 后面的陈述：`login u pw ∧ valid pw`。
4. `from policy ‹valid pw ∧ ¬ locked u› have "login u pw" by blast`。
:::
::::

:::: exercise 展开简写 {#ex-10-2} ★
不用 `hence`、`thus` 和 `with` 改写这个证明：只用带名字的 `from`。在 Isabelle 中检查你写的版本。

```isabelle
lemma "(A ⟶ B) ∧ A ⟶ B ∨ C"
proof
  assume prem: "(A ⟶ B) ∧ A"
  hence "A ⟶ B" by blast
  with prem have "B" by blast
  thus "B ∨ C" by blast
qed
```

::: solution
`hence` 就是 `then have`，即 `from this have`；`with prem` 就是 `from prem this`；`thus` 就是 `from this show`。再给中间事实起上名字，就得到：

```isabelle
lemma "(A ⟶ B) ∧ A ⟶ B ∨ C"
proof
  assume prem: "(A ⟶ B) ∧ A"
  from prem have ab: "A ⟶ B" by blast
  from prem ab have b: "B" by blast
  from b show "B ∨ C" by blast
qed
```
:::
::::

:::: exercise 预测错误 {#ex-10-3} ★
下面每个证明都会失败。说出 Isabelle 给出什么消息、为什么，以及怎样修复这个证明。

```isabelle fails
lemma "A ∧ B ⟶ A"
proof
  assume "A ∧ B"
  then show "A ∧ B" by blast
qed
```

```isabelle fails
lemma "(∃x. P x ∧ Q x) ⟶ (∃x. P x)"
proof
  assume "∃x. P x ∧ Q x"
  obtain a where "P a ∧ Q a" by blast
  then show "∃x. P x" by blast
qed
```

```isabelle fails
lemma "clamp lo hi x ≤ max lo x"
proof (cases "x < lo")
  case True
  then show ?thesis by simp
  case False
  then show ?thesis by simp
qed
```

::: solution
1. **Failed to refine any pending goal**。`A ∧ B` 的证明成功了，但待证目标是 A（在假设 A ∧ B 之下）。要断言的是目标本身：`then show "A" by blast`。
2. **Failed to apply initial proof method**，出现在 `obtain` 的证明处，目标是 `(⋀a. P a ∧ Q a ⟹ thesis) ⟹ thesis`。存在性事实没有传给 `blast`。要写成 `then obtain`。
3. **Failed to refine any pending goal**，出现在第二个 `show` 处：没有 `next`，第二种情形仍然带着第一种情形的假设 x < lo，所以它的结果与任何待证目标都不相符。在 `case False` 之前插入 `next`。

```isabelle
lemma "A ∧ B ⟶ A"
proof
  assume "A ∧ B"
  then show "A" by blast
qed

lemma "(∃x. P x ∧ Q x) ⟶ (∃x. P x)"
proof
  assume "∃x. P x ∧ Q x"
  then obtain a where "P a ∧ Q a" by blast
  then show "∃x. P x" by blast
qed

lemma "clamp lo hi x ≤ max lo x"
proof (cases "x < lo")
  case True
  then show ?thesis by simp
next
  case False
  then show ?thesis by simp
qed
```
:::
::::

:::: exercise 用 Isar 的方式处理析取 {#ex-10-4} ★★
模块 7 用 `erule disjE` 证明了 `A ∨ B ⟶ B ∨ A`。在 Isar 中证明它：像第 10.5.3 节那样，对假设的析取式分情形。只在各情形内部的步骤中使用 `blast`。

::: solution
```isabelle
lemma "A ∨ B ⟶ B ∨ A"
proof
  assume "A ∨ B"
  then show "B ∨ A"
  proof
    assume "A"
    then show "B ∨ A" by blast
  next
    assume "B"
    then show "B ∨ A" by blast
  qed
qed
```

外层的 `proof` 应用 `impI`。内层的 `proof` 通过 `then` 得到这个析取式，所以它应用消去规则 `disjE`，留下两个目标，每种情形一个。各情形内部的步骤是 (∨I₂) 和 (∨I₁)；用 `by (rule disjI2)` 和 `by (rule disjI1)` 也可以。
:::
::::

:::: exercise 交换量词 {#ex-10-5} ★★
在 Isar 中用 `obtain` 和 `fix` 证明 `(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)`。先用话把这个公式读出来：如果有某一个 x 与每个 y 都有关系 R，那么每个 y 都有某个 x 与它有关系 R。

::: solution
```isabelle
lemma "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
proof
  assume "∃x. ∀y. R x y"
  then obtain a where a: "∀y. R a y" by blast
  show "∀y. ∃x. R x y"
  proof
    fix b
    from a have "R a b" by (rule spec)
    then show "∃x. R x b" by (rule exI)
  qed
qed
```

The proof uses (∃E), (∀I), (∀E) and (∃I) in this order. The same x, here a, works for every y. The
converse does not hold: each y may need a different x.
:::
::::

:::: exercise A calculation {#ex-10-6} ★★
Prove `(a + b) * (a - b) = a * a - b * b` for integers a and b with a chain of equations, one law per
step, as in Section 10.4.1.

::: solution
```isabelle
lemma
  fixes a b :: int
  shows "(a + b) * (a - b) = a * a - b * b"
proof -
  have "(a + b) * (a - b) = a * (a - b) + b * (a - b)" by (rule distrib_right)
  also have "… = (a * a - a * b) + (b * a - b * b)" by (simp add: right_diff_distrib)
  also have "… = a * a - b * b" by (simp add: algebra_simps)
  finally show ?thesis .
qed
```

`right_diff_distrib` is the law a(b − c) = ab − ac. The last step uses commutativity, b · a = a · b, so
that the middle terms cancel.
:::
::::

:::: exercise The total of a reversed bill {#ex-10-7} ★★
Prove `mysum (rev xs) = mysum xs` by induction with named cases. Use the lemma `mysum_append` of
Section 10.6.1 in the induction step, inside a calculation.

::: solution
```isabelle
lemma "mysum (rev xs) = mysum xs"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "mysum (rev (x # xs)) = mysum (rev xs @ [x])" by simp
  also have "… = mysum (rev xs) + mysum [x]" by (rule mysum_append)
  also have "… = mysum xs + x" using Cons.IH by simp
  also have "… = mysum (x # xs)" by simp
  finally show ?case .
qed
```

The second step is an instance of `mysum_append`, with `rev xs` for xs and `[x]` for ys; `rule` finds
the instance. Without the lemma, `simp` would get stuck at `mysum (rev xs @ [x])`.
:::
::::

:::: exercise Mirror a tree {#ex-10-8} ★★★
Module 5 defined binary trees and the function `mirror`, and proved on paper, in the example *Mirroring
twice*, that mirroring a tree twice gives the tree back. Here are the definitions again:

```isabelle
datatype 'a tree2 = Tip | Node "'a tree2" 'a "'a tree2"

fun mirror :: "'a tree2 ⇒ 'a tree2" where
  "mirror Tip = Tip"
| "mirror (Node l x r) = Node (mirror r) x (mirror l)"
```

Prove `mirror (mirror t) = t` in Isar by induction on t, with named cases. Write the induction step as
a calculation with the three steps of the paper proof. How many induction hypotheses does the induction
step have, and how do you refer to each one?

::: solution
```isabelle
lemma "mirror (mirror t) = t"
proof (induction t)
  case Tip
  show ?case by simp
next
  case (Node l x r)
  have "mirror (mirror (Node l x r)) = mirror (Node (mirror r) x (mirror l))" by simp
  also have "… = Node (mirror (mirror l)) x (mirror (mirror r))" by simp
  also have "… = Node l x r" using Node.IH by simp
  finally show ?case .
qed
```

The cases are named after the constructors, `Tip` and `Node`. A node has two subtrees, so the induction
step has two induction hypotheses, one for l and one for r. `Node.IH` is the list of both; `Node.IH(1)` is
the one for l and `Node.IH(2)` the one for r. The first two steps use the second equation of `mirror`,
the third uses both hypotheses.
:::
::::

:::: exercise Filtering never lengthens a list {#ex-10-9} ★★★
`filter P xs` keeps the elements of xs that satisfy P. Prove `length (filter P xs) ≤ length xs` by
induction on xs. In the induction step, split on whether `P x` holds, with a nested `proof (cases "P x")`,
and use a calculation in the case where it does not.

::: solution
```isabelle
lemma "length (filter P xs) ≤ length xs"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  show ?case
  proof (cases "P x")
    case True
    then show ?thesis using Cons.IH by simp
  next
    case False
    then have "length (filter P (x # xs)) = length (filter P xs)" by simp
    also have "… ≤ length xs" by (rule Cons.IH)
    also have "… ≤ length (x # xs)" by simp
    finally show ?thesis .
  qed
qed
```

Inside the nested block, `?thesis` is the claim of the `show` it proves, which is the claim of the case.
In the case where P x holds, filter keeps x, and both sides grow by one; the hypothesis does the rest.
:::
::::

## Check yourself {#quiz}

```quiz
? In `then have "B" by blast`, what does `then` do?
- [ ] It proves B from the pending goal
- [x] It passes the most recent fact, `this`, to the proof of B
- [ ] It starts a fresh block, like `next`
- [ ] It is needed before every `have`
> `then` is short for `from this`: the fact produced by the previous step is passed to the method that proves the next claim.

? Which command solves a pending goal of the enclosing block?
- [ ] `have`
- [ ] `assume`
- [ ] `note`
- [x] `show`
> `have` only adds a fact. `show` claims a statement and, once its proof is finished, uses it to solve a pending goal.

? In `also have "… = x + 1"`, what does `…` stand for?
- [x] The right-hand side of the previous step
- [ ] The left-hand side of the first step of the chain
- [ ] The whole previous equation
- [ ] Any term that makes the step true
> `…` abbreviates the right-hand side of the previous fact, so the chain continues from where it stopped.

? `proof` fails on the goal `False`, while `proof -` works. Why?
- [ ] `False` cannot be proved in Isar
- [ ] `proof -` proves the goal immediately
- [x] `proof` applies a standard rule for the goal, and none fits `False`; `proof -` leaves the goal as it is
- [ ] `proof` needs the assumptions to be named first
> Without a method, `proof` applies a standard introduction rule chosen by the goal. `proof -` applies no rule, so the steps inside the block have to prove the goal.

? In `case (Cons x xs)` of a proof by `induction xs`, what is `Cons.IH`?
- [ ] The claim of the case, `?case`
- [ ] The assumption `xs = x # xs`
- [x] The induction hypothesis: the claim for the tail `xs`
- [ ] The premises of the lemma
> The induction step assumes the claim for the shorter list. `Cons.prems` holds the premises, and `?case` the claim to prove.

? Isabelle reports "Failed to refine any pending goal" at a `show`. What is the most likely cause?
- [ ] The method after `by` is too weak
- [x] The shown statement, with the assumptions of its block, solves no pending goal, for example because a `next` is missing
- [ ] A fact name is misspelt
- [ ] The theory has no `end`
> The claim itself was proved, but it does not fit any goal. Compare it with the goal in the state, and check `next`, `?case` and the assumptions.
```
