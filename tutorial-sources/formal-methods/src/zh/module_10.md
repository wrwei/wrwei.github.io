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

Start the block with the rule for implication from Module 7:

```isabelle
proof (rule impI)
```

```output state
proof (state)
goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

The goal now says: assuming A ∧ B, show B ∧ A. The arrow ⟹ is Isabelle's own implication, which you met
in Module 7. In a paper proof you would now write "Assume A ∧ B". In Isar too:

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

`assume` adds the assumption to the proof and calls it `ab`. The state lists it under `this:`, the most
recent fact. The goal has not changed: an assumption proves nothing by itself, it is something you may
use. Now claim the conclusion:

```isabelle
  show "B ∧ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. B ∧ A
```

`show` states a claim that solves a pending goal. Like a lemma, the claim needs a proof, and the state
shows it as a goal of its own. Prove it with `blast`, giving it the assumption, and close the block:

```isabelle
    using ab by blast
qed
```

`using ab` hands the fact `ab` to `blast`; Section 10.3.3 explains why you have to. When the proof of
the `show` succeeds, Isabelle uses the shown fact to solve the pending goal, and `qed` finds nothing
left to do. This works because `ab` is the premise A ∧ B of the goal. An `assume` must match a premise
of the goal: assume something else, and the `show` at the end fails (Section 10.8).

::: note
The first line of every proof state names the **mode** Isabelle is in, which tells you what may come
next. `proof (prove)`: a claim (`lemma`, `have`, `show`) has been stated, and its proof comes next.
`proof (state)`: you are inside a block and may assume, claim or close it. `proof (chain)`: facts have
been picked up for the next claim (Section 10.3).
:::

### Steps on the way: have {#shape-have}

A paper proof rarely jumps to its conclusion: it reaches it through intermediate facts. `have` states
such a fact, with its own proof, and adds it to the proof for later steps. Unlike `show`, `have` does not
touch the pending goals.

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  have b: "B" using ab by blast
  have a: "A" using ab by blast
  show "B ∧ A" using b a by blast
qed
```

Each `have` gets a name, `b` and `a`, and the `show` uses both. The proof reads as on paper: from A ∧ B
we get B, and we get A, so B ∧ A.

### Nested blocks and next {#shape-nested}

The proof of a `have` or a `show` can itself be a block. Here the conclusion B ∧ A is proved with the
rule for conjunction, which leaves two goals:

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

Each of the two goals gets its own `show`:

```isabelle
    show "B" using ab by blast
  next
    show "A" using ab by blast
  qed
qed
```

A `show` may solve any pending goal of its block, not only the first: Isabelle looks for a goal that the
shown fact solves. `next` separates the proofs of different goals. It closes the current part of the
block and opens a fresh one, so that whatever you assume for one goal is not available for the next.
Here nothing is assumed inside the inner block, so `next` could be left out; with case analysis and
induction (Sections 10.5 and 10.6) it is needed. Figure 10.1 shows the structure of this proof.

::: figure id=fig-10-1
The block structure of the nested proof. Each `proof … qed` opens a block with its own pending goals,
and each `show` solves one of them. The fact `ab`, assumed in the outer block, can be used in every block
nested inside it.
:::

### Arbitrary values: fix {#shape-fix}

To prove a statement for all x, a paper proof says "let x be arbitrary" and proves the statement for
that x. This is the rule (∀I) of Module 6. Isar says `fix x`:

```isabelle
lemma "∀u. admin u ⟶ admin u ∨ staff u"
proof
```

```output state
proof (state)
goal (1 subgoal):
 1. ⋀u. admin u ⟶ admin u ∨ staff u
```

`proof` without a method applied the rule for ∀ (Section 10.2.6 lists what it does for each
connective). The goal starts with ⋀u, Isabelle's own "for every u" from Module 7. Fix such a u and
prove the statement for it:

```isabelle
  fix u
  show "admin u ⟶ admin u ∨ staff u"
  proof
    assume a: "admin u"
    show "admin u ∨ staff u" using a by blast
  qed
qed
```

::: definition Fixed variable
`fix x` introduces a **fixed variable** x, like the variables bound by ⋀ in Module 7: a name for an
arbitrary value, about which the proof knows nothing except what it assumes. When the block is closed,
a fact proved for the fixed x holds for every value of x.
:::

### Lemmas with assumptions: assumes, shows and ?thesis {#shape-assms}

Statements about programs usually have conditions. Here is a function that every programmer has written
in some form: `clamp lo hi x` keeps a value x inside the range from lo to hi, as a volume control or a
sensor reading does.

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

The result is never below lo, provided the range is not empty. A lemma can state the condition
separately, with `assumes`, and the claim with `shows`:

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

The goal shows only the claim. The assumption is available as a fact called `assms`, the list of all
assumptions of the lemma:

```isabelle
proof -
  show ?thesis using assms by simp
qed
```

Two new things appear here. `proof -` starts a block without changing the goal: the hyphen is the
method that does nothing. And `?thesis`, read "the thesis", is an abbreviation that Isabelle defines for
every claim: it stands for the statement after `shows` (or after `lemma`, `have` or `show`), here
`lo ≤ clamp lo hi x`. It saves you from copying long statements. You can also name each assumption,
`assumes order: "lo ≤ hi"`, or refer to the i-th one as `assms(i)`. The result of the lemma is the
implication `lo ≤ hi ⟹ lo ≤ clamp lo hi x`, which later proofs use under the name `clamp_lower`.

A one-step proof works too: `using assms by simp` directly after the statement. The block form pays off
when the proof needs several steps.

### How a block starts {#shape-start}

The initial method decides which pending goals the block has to prove. Three forms cover most proofs:

- `proof (rule r)` applies the rule r backwards, as `apply (rule r)` does, for example `rule impI`.
- `proof` with no method applies one **standard rule** chosen by the main connective of the goal (or, when
  facts are passed to it, an elimination rule for them; Section 10.5.3).
- `proof -` leaves the goal as it is.

For the standard rule, the block then follows the patterns of natural deduction:

| Goal | `proof` applies | Inside the block |
|---|---|---|
| `A ⟶ B` | `impI` | `assume "A"` … `show "B"` |
| `A ∧ B` | `conjI` | `show "A"` … `next` … `show "B"` |
| `A ⟷ B` | `iffI` | `assume "A"` … `show "B"` `next` `assume "B"` … `show "A"` |
| `¬ A` | `notI` | `assume "A"` … `show False` |
| `∀x. P x` | `allI` | `fix x` … `show "P x"` |
| `∃x. P x` | `exI` | `show "P t"` for a witness t of your choice |

::: pitfall
`proof` on its own fails when no standard rule fits the goal, for example when the goal is `False` or an
equation between numbers:

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

The fix is `proof -`, which starts the block without applying any rule:

```isabelle
lemma
  assumes "A" and "¬ A"
  shows False
proof -
  show False using assms by blast
qed
```
:::

## Passing facts along {#facts}

The proofs so far handed facts to methods with `using`. Isar has several ways to pass facts from one
step to the next. They make the flow of a proof visible, as words like "hence" and "from this" do on
paper.

### Chaining facts with then {#facts-then}

::: definition Fact, this and chaining
A **fact** is a proved statement available in a proof: an assumption, the result of `have` or `show`, or
a lemma from the library or from your theory. After each step, the fact it produced is called
**this**. **Forward chaining** passes facts to the next claim, whose proof method receives them, as
`using` does.
:::

`then` chains `this` into the next claim. A proof in which every step uses the result of the step before
reads like a pipeline:

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

Isabelle prints two states for the last line, one for each command. After `then` the mode is
`proof (chain)`, and `picking this` shows the fact being passed. After `have "B"` the new goal appears,
with the fact it will use listed under `using this`. In Isabelle/jEdit you see the state of the command
under the cursor. Finish the pipeline:

```isabelle
    by blast
  then show "B ∨ C" by blast
qed
```

### Names, from, with, using and note {#facts-names}

A pipeline breaks as soon as a step needs an older fact. `from` names the facts to pass, so `then` is
the same as `from this`. Facts can be referred to by name, or by their statement between the quotes
`‹` and `›`: `‹A›` reads "the fact A" and refers to the fact of the proof whose statement is A.

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  from ab have "A" by blast
  from ab have "B" by blast
  with ‹A› show "B ∧ A" by blast
qed
```

`with ‹A›` is short for `from ‹A› this`: it passes the named fact *and* the current one, here B.

::: tip
To type `‹` and `›` in Isabelle/jEdit, type a back-quote (`` ` ``) and accept the first completion,
which inserts `‹›` with the cursor between the two quotes.
:::

`note` puts facts into `this` without proving anything, and can give the group a name:

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

The order of the facts matters here: `rule conjI` uses the first fact for the left conjunct and the
second for the right one. For `blast`, `simp` and `auto` the order makes no difference.

::: fact Chaining shorthands
| You write | It means |
|---|---|
| `then` | `from this` |
| `with a` | `from a this` |
| `have "P" using a` | `from a have "P"` |
| `hence` | `then have` |
| `thus` | `then show` |
:::

You will meet `hence` and `thus` in older proofs, including the Isabelle tutorial. Isabelle2026 still
accepts them, but its reference manual calls them left-overs from the early history of Isar and
recommends the longer forms, which this series uses.

### Methods see only the facts you give them {#facts-visible}

In Section 10.2.5 the proof of `clamp_lower` said `using assms`. Leave it out:

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

The simplifier unfolded `clamp` and split the `if`s, and what remains is the one case that needs the
assumption: when x is above the range, `clamp` returns hi, and lo ≤ hi is exactly what `simp` did not
know. The assumption was in the proof all the time, but **a proof method sees only the goal and the
facts passed to it** with `then`, `from`, `with` or `using`, besides the rules it always uses (for
`simp`, the simp rules, which include the equation of `clamp`). This is deliberate: you decide which
facts matter, and automation does not get lost among hundreds of them.

::: keyidea
Assumptions and proved facts are available in a proof, but a method uses them only when you pass them.
When a step fails, first check that it receives the facts it needs.
:::

### Using an existential: obtain {#facts-obtain}

The rule (∃E) of Module 6 says: from ∃x. P x you may introduce a new name a with P a, provided the
conclusion does not mention a. In Isar this is `obtain`. Look again at the Isar proof of Section 10.1:

- `assume all: …` and `assume "∃u. admin u"` take the two premises that `proof (intro impI)` left.
- `then obtain a where "admin a" by blast` introduces a new fixed variable `a` and the fact `admin a`.
  The proof, `by blast`, shows that such an `a` exists, using the chained fact ∃u. admin u.
- `with all have "staff a"` passes `all` and `admin a` to `blast`.
- `then show "∃u. staff u"` uses `staff a`: `a` is the witness.

Forget to chain the existential, and `obtain` cannot be proved:

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

The goal in the message is what `obtain` has to prove: whatever you want to show (`thesis`), if it
follows from `admin a` for an arbitrary `a`, then it holds. `blast` cannot prove that without the fact
∃u. admin u. Write `then obtain`, or name the fact and write `obtain a where "admin a" using ex by blast`
with `using` after the clause.

### Collecting facts: moreover and ultimately {#facts-moreover}

Sometimes a step needs several facts that are proved one after another. Instead of naming each one, you
can collect them: `moreover` adds the most recent fact, `this`, to a collection, and `ultimately` adds
the last one and passes the whole collection to the next claim.

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

The proof says what a reviewer wants to see: the result is at least lo, it is at most hi, so it lies in
the range.

## Calculations {#calc}

Much of mathematics, and much reasoning about programs, is calculation: a chain of equations or
inequalities in which each step follows from the one before.

### Chains of equations {#calc-eq}

On paper, you multiply out (a + b)(a + b) like this:

$$
\begin{aligned}
(a + b)(a + b) &= a(a + b) + b(a + b) \\
&= a \cdot a + a \cdot b + (b \cdot a + b \cdot b) \\
&= a \cdot a + 2ab + b \cdot b
\end{aligned}
$$

and conclude that the first term equals the last. Isar writes the same chain:

```isabelle
lemma "(a + b) * (a + b) = a * a + 2 * a * b + b * (b :: int)"
proof -
  have "(a + b) * (a + b) = a * (a + b) + b * (a + b)" by (rule distrib_right)
  also have "… = a * a + a * b + (b * a + b * b)" by (simp add: distrib_left)
  also have "… = a * a + 2 * a * b + b * b" by (simp add: algebra_simps)
  finally show ?thesis .
qed
```

- `…` reads "the right-hand side of the previous step". To type it, type three dots `...`: Isabelle/jEdit
  offers the symbol …, and the three dots work as well.
- `also` adds the new step to the chain. Isabelle composes the steps by transitivity: from a = b and
  b = c it derives a = c.
- `finally` composes the last step and passes the result, first term = last term, to the next claim.
- `.` (a single dot) is a proof that succeeds when the claim is exactly the fact passed to it. Here the
  claim is `?thesis`, the statement of the lemma.

Each step has its own justification: `distrib_right` is the law (a + b)c = ac + bc, `distrib_left` the
law a(b + c) = ab + ac, and `algebra_simps` a collection of laws such as commutativity, which `simp`
uses to rearrange terms.

::: definition Calculation
A **calculation** is a chain of steps t₁ R t₂, t₂ R t₃, …, each with its own proof, from which Isabelle
derives t₁ R tₙ by **transitivity**: a R b and b R c give a R c. In Isar, `also` extends the chain and
`finally` ends it; `…` stands for the right-hand side of the previous step.
:::

### Inequalities {#calc-ineq}

Chains may mix `=`, `≤` and `<`. The result has the strictest relation of the chain: one `<` anywhere
makes the whole chain `<`.

::: example Indices in a binary heap
A binary heap is often stored in an array: the node at index i has its left child at index 2i + 1.
If i is one of the first n indices, is the child within the first 2n?

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

`fixes i n :: nat` declares the lemma's variables with their type, for the whole statement; without
it, Isabelle would not know which kind of numbers i and n are. The chain is < then = then ≤, so the
result is `2 * i + 1 < 2 * n`. Only the last step needs the assumption, and only that step is given it.
:::

::: pitfall
`finally` produces the strictest relation, and `.` accepts only that exact fact. A weaker claim fails,
even though it follows:

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

The message shows the fact the chain produced (`using this: x < z`) and the claim. Either claim
`x < z`, or replace `.` by a method that can weaken it, here `by simp`.

Chains with `≥` and `>` do not work as you might expect. Isabelle reads a ≥ b as b ≤ a, so `…` stands for
a, not b, and the steps no longer fit together:

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

Write chains from the small end to the big end, with `≤` and `<`.
:::

## Case analysis {#cases}

Many proofs about programs split into cases: the list is empty or not, the condition of an `if` holds or
not, the input is below, inside or above a range. In Isar each case gets its own part of the block,
separated by `next`.

### Two cases: true or false {#cases-bool}

`clamp lo hi x` should agree with the mathematical description "the maximum of lo and the minimum of hi
and x". Prove it by cases on the first test of `clamp`:

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

`proof (cases "x < lo")` splits the goal into the case where x < lo holds and the case where it does
not. The command `case True` enters the first case:

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

`case True` assumes the condition of the case, which the state lists under `this:`. The state still
lists both pending goals, and the claim to prove is still `?thesis`, the statement of the lemma. Shown
under the assumption x < lo, it solves the first goal:

```isabelle
  then show ?thesis using assms by simp
next
  case False
  then show ?thesis using assms by simp
qed
```

When you write `proof (cases …)` or `proof (induction …)`, Isabelle/jEdit also shows a message that
begins **Proof outline with cases:**, with the skeleton of the rest of the proof. For this lemma it is

```text
Proof outline with cases:
  case True
  then show ?thesis sorry
next
  case False
  then show ?thesis sorry
qed
```

Click on the skeleton and Isabelle/jEdit inserts it into your text. Each `sorry` marks a proof still to
be written: Isabelle/jEdit accepts it in place of a proof while you work, but a theory that contains
`sorry` is not proved. Replace every one.

### Cases of a datatype {#cases-datatype}

For a list, the cases are the two ways of building one: the empty list `[]`, called `Nil`, and `y # ys`,
called `Cons`. Take a function that returns the first element of a list, or a default value d for the
empty list:

```isabelle
fun first_or :: "'a ⇒ 'a list ⇒ 'a" where
  "first_or d [] = d"
| "first_or d (y # ys) = y"
```

The first element of `xs @ ys` is the first element of xs, unless xs is empty; then it is the first
element of ys:

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

`case (Cons z zs)` gives names to the head and tail of xs: the state shows the assumption xs = z # zs,
while the goal still uses Isabelle's own names for them, `a` and `list`. Choose names that the lemma does
not use already. `case (Cons y ys)` would create a second `ys`, which hides the lemma's own `ys` for the
rest of the case, although Isabelle prints both as `ys`. Finish the case:

```isabelle
  then show ?thesis by simp
qed
```

::: pitfall
Without `next`, the assumption of the first case stays in force in the second:

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

The second `show` proves its claim under both xs = [] and xs = z # zs, and no pending goal has both
assumptions, so the shown fact solves none of them. Put `next` between the cases.
:::

### Cases from a disjunction {#cases-or}

The rule (∨E) of Module 6 proves C from A ∨ B by proving C once from A and once from B. In Isar, pass the
disjunction to `proof` and give each case its `assume`. Here a user may read a file if they own it, or if
they are an administrator:

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

`using who` before `proof` passes the disjunction to the initial method, so `proof` applies the
elimination rule for ∨ instead of an introduction rule. In both cases `?thesis` is the claim of the
lemma, `may_read u`.

### Your own cases: consider {#cases-consider}

Sometimes the natural cases are neither a datatype nor a single condition. `clamp` distinguishes three:
x below the range, inside it, or above it. `consider` states such a split, with a name for each case, and
proves that the cases cover every possibility:

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

The proof of `consider`, here `linarith` from Module 9, shows that every x falls into one of the three
cases. `then show ?thesis proof cases` then splits the proof along them, and `case inside` assumes both
facts of that case. A lemma can state such a split for later use, with `obtains` in place of `shows`; in
a proof, `consider` is the local form.

## Induction with named cases {#induction}

In Module 5 you proved properties of recursive functions with `apply (induction xs)` and read the base
case and the induction step off the proof state. In Isar, each case of the induction becomes a named part of
the block, and the induction hypothesis becomes a named fact.

### The skeleton of an induction {#induction-skeleton}

Here is the total of a list of amounts, such as the items of a bill:

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

The total of two bills put together is the sum of their totals. Start an induction on xs:

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

These are the base case and the induction step of Module 5. The proof outline that Isabelle/jEdit shows
names the two cases after the constructors of lists:

```text
Proof outline with cases:
  case Nil
  then show ?case sorry
next
  case (Cons a xs)
  then show ?case sorry
qed
```

Prove the base case, then enter the induction step with names of your choice for the head and the tail:

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

`case (Cons x xs)` does three things. It fixes x and xs, your names for the variables the goal calls
`a` and `xs`. It assumes the induction hypothesis, which the state shows under `this:`. And it sets
`?case`, read "the case", to the claim of this case:
`mysum ((x # xs) @ ys) = mysum (x # xs) + mysum ys`. Pass the hypothesis to `simp` with `then`:

```isabelle
  then show ?case by simp
qed
```

::: definition Named case
In a proof by `cases` or `induction`, **`case c`** enters the case named c, and **`case (c x y …)`** also
gives names to its variables. The case assumes its facts, available together under the name c. In an
induction, `case` also sets **`?case`** to the claim of the case, **c.IH** is the induction hypothesis
and **c.prems** are the premises of the claim (Section 10.6.2). In a proof by `cases`, every case proves
the same claim, `?thesis`.
:::

For natural numbers the cases are called `0` and `Suc`: `case 0`, then `case (Suc n)` with the
hypothesis `Suc.IH`. For a datatype of your own they are named after its constructors.

### The induction hypothesis, premises and ?case {#induction-names}

A paper proof of the induction step is a calculation that uses the induction hypothesis once. The Isar proof
can say exactly that, with the hypothesis named `Cons.IH`:

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

When the claim has a premise, the induction keeps it apart from the hypothesis.

::: example A bill whose items are bounded
If every item of a bill costs at most m, the total is at most m times the number of items. `set xs` is
the set of the elements of xs, so ∀x ∈ set xs. x ≤ m says that every item is at most m.

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

`print_cases` lists the cases with everything they provide: the fixed variables, `?case`, the
induction hypothesis under `IH` and the premise of the claim under `prems`. The names `a_` and `xs_`,
with a trailing underscore, are hidden: the proof cannot refer to them until `case (Cons a xs)` gives
them names. Each case receives the premise for its own list, and the hypothesis is the whole
implication for the shorter list xs.

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

The second step needs only the premise: a ≤ m, because a is in the list. The third step needs the
hypothesis, and the hypothesis needs its own premise, that every item of xs is at most m, which again
follows from `Cons.prems`. So both are passed.
:::

::: trouble
- **`show ?thesis` instead of `show ?case`.** In an induction, `?thesis` is the whole lemma for the
  original xs, not the claim of the case:

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

  `simp` cannot prove the lemma about an unknown list, so the step fails. Write `?case`.
- **A case name that does not exist.** The names come from the constructors, here `Nil` and `Cons`:

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

  The proof outline and `print_cases` show the right names.
- **The hypothesis is not passed.** Without `then` (or `using Cons.IH`), `simp` does not see it:

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

  The remaining goal is the induction hypothesis itself: a sure sign that it was not passed.
:::

## From paper and apply scripts to Isar {#translate}

You have now seen every part of Isar that this series needs. This section puts it side by side with the
proofs of Modules 5, 6 and 7, so that you can translate in both directions.

### A natural-deduction proof {#translate-nd}

In Module 6 you proved A ∧ B ⟶ B ∧ A with this tree:

```prooftree
A ∧ B ⟶ B ∧ A   (⟶I¹)
  B ∧ A   (∧I)
    B   (∧E₂)
      [A ∧ B]¹
    A   (∧E₁)
      [A ∧ B]¹
```

In Module 7 you replayed it with `apply`:

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (erule conjE)
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

The Isar proof follows the tree rule by rule. It needs (∧E₁) and (∧E₂) in the form the tree uses them,
from A ∧ B to A and to B: the destruction rules `conjunct1` and `conjunct2` of Module 7.

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

Each rule of the tree is one line of the proof (Figure 10.2). The assumption [A ∧ B]¹, which the tree
discharges with (⟶I), is the `assume` inside the block that `rule impI` opened. The tree is read from
the leaves down, the Isar text from the top down, and both contain the same steps. The apply script, in
contrast, works backwards from the goal and never states B or A at all.

::: figure id=fig-10-2
The natural-deduction tree of Module 6 and its Isar proof. Each rule of the tree, in its colour, is one
step of the Isar text; the discharged assumption [A ∧ B]¹ is the `assume`.
:::

Writing the rule names is useful for learning. In practice you let Isabelle choose the rule: `..`
(two dots) is a proof by one standard rule step, so `from ab have "B" ..` works as well, and `by blast`
proves such steps too.

### Rule by rule {#translate-rules}

Every rule of natural deduction has an Isar counterpart. In the table, A, B and C are formulas, and
`ab`, `imp`, `a`, `b`, `na`, `all`, `pa` and `ex` are the names of facts A ∧ B, A ⟶ B, A, B, ¬ A,
∀x. P x, P a and ∃x. P x.

| Rule (Module 6) | Apply step (Module 7) | Isar |
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

`spec` is the destruction rule for (∀E) (Module 7): from ∀x. P x it gives P x for any x.

### An induction {#translate-induction}

Module 5 proved the sum formula $2 \cdot \mathit{sum\_upto}(n) = n \cdot (n + 1)$ twice: on paper, in
the example *The sum formula*, and in Isabelle, with an apply script. Here are the definition and the
script again:

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

The script does not say what the two cases are, or how the step uses the induction hypothesis. The
paper proof does: its step is a chain of four equations. The Isar proof repeats that chain line for
line:

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

| On paper (Module 5) | In Isar |
|---|---|
| Proof by induction on $n$. | `proof (induction n)` |
| Base case $P(0)$. | `case 0`, `show ?case by simp` |
| Let $n$ be any number, and assume the IH. | `next`, `case (Suc n)` |
| $2 \cdot \mathit{sum\_upto}(n+1) = 2 \cdot (\mathit{sum\_upto}(n) + (n+1))$, by sum_upto.2 | `have "2 * sum_upto (Suc n) = …" by simp` |
| $= 2 \cdot \mathit{sum\_upto}(n) + 2 \cdot (n+1)$, arithmetic | `also have "… = …" by simp` |
| $= n \cdot (n+1) + 2 \cdot (n+1)$, by the IH | `also have "… = …" using Suc.IH by simp` |
| $= (n+1) \cdot (n+2)$, arithmetic | `also have "… = …" by simp` |
| By induction, $P(n)$ holds for every $n$. | `finally show ?case .`, `qed` |

Isabelle writes n + 1 as `Suc n`, as in the subgoals of Module 5. Each step is checked on its own, so
the proof shows exactly where the hypothesis is used.

### From an apply script to Isar: a recipe {#translate-recipe}

To turn an apply script into Isar, run the script in Isabelle/jEdit and read the proof state after each
line. Then write down what the states say, not what the methods do:

1. The first steps usually only introduce: `rule impI`, `rule allI`, `intro impI`. They become
   `proof (intro …)` or `proof`, followed by `assume` for each premise and `fix` for each ⋀-variable
   that the state then shows.
2. A step that derives a new fact, such as `drule mp` or `erule conjE`, becomes a `have` with that fact
   as its statement.
3. The step that finishes the goal becomes `show`.
4. Prove each step with the rule of the apply step, or with automation.

Here is a script in the style of Module 7, for the transitivity of implication:

```isabelle
lemma "(A ⟶ B) ⟶ (B ⟶ C) ⟶ A ⟶ C"
  apply (intro impI)
  apply (erule mp)
  apply (erule mp)
  apply assumption
  done
```

After `intro impI` the state has the premises A ⟶ B, B ⟶ C and A and the conclusion C. The first
`erule mp` works backwards from C to B, the second from B to A. Written forwards, as a reader thinks:

```isabelle
lemma "(A ⟶ B) ⟶ (B ⟶ C) ⟶ A ⟶ C"
proof (intro impI)
  assume ab: "A ⟶ B" and bc: "B ⟶ C" and a: "A"
  from ab a have b: "B" by (rule mp)
  from bc b show "C" by (rule mp)
qed
```

## When an Isar proof fails {#errors}

Because every step of an Isar proof is a statement, Isabelle can tell you which step failed and what
remained of it. These are the messages you will meet most often; you have seen most of them in this
module already.

| Message | Meaning | What to do |
|---|---|---|
| Failed to finish proof, or Failed to apply initial proof method, at a `by` | The method could not prove this step from the facts it was given. The message shows what remained. | Pass the missing facts (`then`, `using`); add a lemma (`simp add:`); split the step; try `sledgehammer` (Module 9). |
| Failed to apply initial proof method, at `proof` | The initial method cannot start, for example no standard rule fits the goal. | Use `proof -`, or name the rule. |
| Failed to refine any pending goal | The shown fact, under the assumptions of its block, solves no pending goal. | Compare the claim with the goal in the state; check `?case` and `?thesis`, `next`, and assumptions that are not premises of the goal. |
| Illegal application of proof command in "prove" mode | A claim has no proof, so the next command comes too early. | Give the claim a proof, `by …` or `proof … qed`. |
| Undefined case, Undefined fact | A case or fact name is wrong. | Use the proof outline or `print_cases`. |
| Vacuous calculation result | The steps of a chain do not fit together. | Write chains with `=`, `≤` and `<`. |

The fourth message appears, for example, when a `have` has no proof:

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

After `have "B"` Isabelle is in `prove` mode and expects a proof; `show` is not one.

"Failed to refine any pending goal" deserves a closer look, because the step itself succeeded: the claim
was proved, but it does not fit the goal. Isabelle/jEdit warns about this before the proof of the
`show` has finished, with the message "Local statement fails to refine any pending goal". Here is the
typical case, a claim that is not the goal:

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

To find out what is wrong, change `show` into `have`: if the step is then accepted, the claim is right
and the mismatch is between the claim and the goal. Look at the goal in the state and compare.

A few habits make Isar proofs easier to write and to keep working:

- **Write the skeleton first.** State the lemma, write `proof …`, the `assume`, `fix` and `show` lines
  and `qed`, and let the proof outline fill in cases. Then prove the steps, one at a time.
- **One idea per step.** If a `by` needs a long list of facts or a clever method, put an intermediate
  `have` in between.
- **Chain what you need and nothing else.** Pass a fact where it is used, with `then`, `with` or
  `using`; name it only if it is used further away.
- **Let automation do the small steps.** `simp`, `blast`, `auto` and `linarith` prove the steps;
  Isar provides the structure that a person reads.

## What you learned {#summary}

- **Isar** writes proofs as structured text: each step states what is true, and Isabelle checks it.
  Such proofs can be read without Isabelle, and a failing step is marked where it fails.
- A **proof block** `proof m … qed` starts with an initial method: `proof (rule r)`, `proof` (a standard
  rule for the goal) or `proof -` (nothing). Inside it, `assume` takes a premise, `fix` an arbitrary
  value, `have` proves an intermediate fact and `show` solves a pending goal. `next` separates the
  proofs of different goals.
- **Facts** flow from step to step: `then` passes `this`, `from a` passes named facts, `with a` passes
  both, `using a` comes after the claim, `note` collects facts, and `moreover … ultimately` collects
  several before using them. `hence` and `thus` are old forms of `then have` and `then show`. A method
  sees only the facts passed to it.
- `obtain x where …` uses an existential fact, as the rule (∃E) does.
- **Calculations** chain steps with `also` and end them with `finally`; `…` stands for the previous
  right-hand side, and `.` proves the claim that the chain produced. The result has the strictest
  relation of the chain.
- **Case analysis** uses `proof (cases …)` with `case True`/`case False` or the constructors of a
  datatype, `consider` for cases of your own, and `proof` with a disjunction passed to it.
- **Induction** uses `proof (induction x)` with `case Nil`, `case (Cons x xs)`, `case 0`,
  `case (Suc n)`; inside a case, `?case` is its claim, `c.IH` the induction hypothesis and `c.prems` the
  premises.
- Natural-deduction proofs and apply scripts translate into Isar step by step, and Isabelle's messages
  (Failed to finish proof, Failed to refine any pending goal, Undefined case, …) point to the step to
  repair.

## Exercises {#exercises}

:::: exercise Read a proof {#ex-10-1} ★
Here is a proof about a login check: a user who is not locked out and enters a valid password may log
in.

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

1. What is `this` after the first `have`?
2. Which facts does `blast` receive in the second step?
3. What does `?thesis` stand for?
4. Rewrite the second step with `from` instead of `with`.

::: solution
1. `valid pw ∧ ¬ locked u`, the fact that this step proved.
2. `policy` and `this`, that is ∀p v. valid p ∧ ¬ locked v ⟶ login v p and valid pw ∧ ¬ locked u:
   `with policy` is short for `from policy this`.
3. The statement after `shows`: `login u pw ∧ valid pw`.
4. `from policy ‹valid pw ∧ ¬ locked u› have "login u pw" by blast`.
:::
::::

:::: exercise Spell out the shorthands {#ex-10-2} ★
Rewrite this proof without `hence`, `thus` and `with`: use only `from` with names. Check your version in
Isabelle.

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
`hence` is `then have`, that is `from this have`; `with prem` is `from prem this`; `thus` is
`from this show`. With names for the intermediate facts:

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

:::: exercise Predict the error {#ex-10-3} ★
Each of these proofs fails. Say which message Isabelle gives, why, and how to repair the proof.

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
1. **Failed to refine any pending goal.** The proof of `A ∧ B` succeeds, but the pending goal is A
   (under the assumption A ∧ B). Claim the goal: `then show "A" by blast`.
2. **Failed to apply initial proof method**, at the proof of `obtain`, with the goal
   `(⋀a. P a ∧ Q a ⟹ thesis) ⟹ thesis`. The existential is not passed to `blast`. Write
   `then obtain`.
3. **Failed to refine any pending goal**, at the second `show`: without `next`, the second case still
   has the assumption x < lo of the first, so its result fits no pending goal. Insert `next` before
   `case False`.

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

:::: exercise Disjunction the Isar way {#ex-10-4} ★★
Module 7 proved `A ∨ B ⟶ B ∨ A` with `erule disjE`. Prove it in Isar, with a case split on the assumed
disjunction as in Section 10.5.3. Use `blast` only for the steps inside the cases.

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

The outer `proof` applies `impI`. The inner `proof` receives the disjunction through `then`, so it
applies the elimination rule `disjE` and leaves two goals, one for each case. The steps inside the
cases are (∨I₂) and (∨I₁); `by (rule disjI2)` and `by (rule disjI1)` work as well.
:::
::::

:::: exercise Swap the quantifiers {#ex-10-5} ★★
Prove `(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)` in Isar with `obtain` and `fix`. Read the formula in words
first: if one x is related to every y, then every y has some x related to it.

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
