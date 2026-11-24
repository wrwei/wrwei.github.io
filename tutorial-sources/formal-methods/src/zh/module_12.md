---
title: 验证函数式程序
part: 4
lead: 证明程序对每个输入都满足规约。你将验证插入排序、二叉搜索树和用两个列表实现的队列，理解规约中每个条件的作用，并把验证过的函数导出为 Haskell 代码。
minutes: 230
needs: 模块 1–11，尤其是模块 8（函数）、模块 10（Isar）和模块 11（辅助引理）
goals:
  - 区分规约（程序必须做什么）和实现（程序怎样做），并陈述把两者联系起来的定理
  - 对照规约“有序，并且是输入的一个排列”验证插入排序，并找出证明所需的引理
  - 解释为什么规约的每一半都不可缺少，并用 Quickcheck 和 Nitpick 发现过弱的规约
  - 借助不变式和抽象函数验证二叉搜索树
  - 用数据精化证明由两个列表构成的队列是正确的，并指出哪里需要它的不变式
  - 把经过验证的函数导出为 Haskell 代码，并说明生成的代码能保证什么、不能保证什么
imports: Main "HOL-Library.Multiset"
---

## 验证一个程序意味着什么 {#verify}

模块 1 从学校软件中的一条需求讲起：“打印成绩列表之前，先把它排好序。”它把这句话变成了一个关于输入列表 xs 和输出列表 ys 的公式，

$$
\mathit{sorted}(ys) \;\land\; \mathit{mset}(ys) = \mathit{mset}(xs),
$$

并且许诺：可以用证明来表明，一个排序程序对每个输入都满足这个公式。第二部分和第三部分为你准备好了工具：用 `fun` 定义的函数（模块 8）、自动化（模块 9）、结构化证明（模块 10），以及找出合适的归纳和所缺引理的技巧（模块 11）。本模块把它们结合起来，兑现这个承诺。

每一次验证都涉及三样东西，把它们区分清楚是值得的。

::: definition 实现、规约、正确性定理
**实现**（implementation）是完成实际工作的程序：在这里，就是一个用 `fun` 定义的函数。它说明**怎样**计算结果。

**规约**（specification）是每个可接受的结果都必须具有的性质。它说明结果必须是**什么**，而不说明怎样计算它。

**正确性定理**指出，对于满足其声明前提的每个输入，实现的结果都具有指定的性质。当该定理已被证明时，程序**针对该规范被验证**。下面的排序没有类型之外的输入前提；树和队列定理使用表示不变式。
:::

就排序而言，本模块中的实现是插入排序（insertion sort），即函数 `isort`。规约就是上面的公式。正确性定理把两者连接起来：

$$
\forall xs.\; \mathit{sorted}(\mathit{isort}\ xs) \land \mathit{mset}(\mathit{isort}\ xs) = \mathit{mset}(xs)
$$

::: figure id=fig-12-1
验证把两份互相独立的描述联系起来。规约说明一个列表排好序的副本是什么样的；实现说明插入排序怎样算出这样一个副本。正确性定理只需证明一次，就对每个列表都把两者联系了起来。
:::

为什么要为同一件事写两份描述？因为它们是写给不同的读者的。

- **规约是写给人看的。** 它应该简短，并且贴近本来想表达的意思，这样你读一读就能检查它说得对不对。这就是确认（模块 1）；规约讲到的计算细节越少，确认就越容易。
- **实现是写给计算机的。** 它应该运行得快、占用内存少，或者适合手头的数据结构。巧妙的实现很难靠阅读来检查。
- **证明是桥梁。** 经过验证的正确性定理让你可以信赖指定的行为
  无需人工重新检查算法，只要其假设与可信基础适用即可。它不确立规范所遗漏的性质。

一个规约也可对应多种实现。插入排序、归并排序和快速排序均满足同一排序规约；每种实现代入正确性陈述后，均需各自的证明。

本模块使用两种方式呈现规约。**性质**直接描述结果，如`sorted`和`mset`对排序的处理。**模型**描述数据及其操作的简单版本，例如数学集合或普通列表，定理表明智能版本的行为与简单版本一致。第12.5节和第12.6节发展了第二种规约。

::: keyidea
测试在选定输入上检查实现。正确性定理覆盖其声明前提下的所有输入，但其质量取决于规范：针对规定过少的规范进行的证明仅能证明过少。第 12.4 节展示了当规范的一半缺失时会发生什么。
:::

::: note
本模块中的正确性是**功能正确性**（functional correctness）：它关心的是程序算出什么结果。程序运行多长时间、占用多少内存是另外的性质，有它们自己的规约。这些性质也可以验证，但本模块不做；第 12.6 节会指出一个库理论，它为这里的一个程序做了这件事。
:::

## 插入排序及其规约 {#isort}

### 程序 {#isort-program}

插入排序就是许多人整理手中扑克牌的方法：一次拿起一张牌，把它插到已经排好的那些牌中合适的位置上。写成递归函数，就是：要给列表 x # xs 排序，先给尾部 xs 排序，再把 x 插到正确的位置上。把 x 插入一个有序的（sorted）列表时，沿着列表往后走，直到遇到一个不小于 x 的元素，然后把 x 放在它前面。

::: example 在纸上做插入排序
用 `ins x ys` 表示把 x 插入有序列表 ys，用 `isort` 表示排序。于是

$$
\begin{aligned}
\mathit{isort}\ [3, 1, 2]
&= \mathit{ins}\ 3\ (\mathit{ins}\ 1\ (\mathit{ins}\ 2\ [\,]))
 = \mathit{ins}\ 3\ (\mathit{ins}\ 1\ [2]) \\
&= \mathit{ins}\ 3\ [1, 2]
 = 1 \mathbin{\#} \mathit{ins}\ 3\ [2]
 = 1 \mathbin{\#} 2 \mathbin{\#} \mathit{ins}\ 3\ [\,]
 = [1, 2, 3].
\end{aligned}
$$

`ins 1 [2]` 立即把 1 放在最前面，因为 1 ≤ 2。`ins 3 [1, 2]` 会越过 1 和 2，因为它们都小于 3，最后到达列表的末尾。
:::

为本模块新建一个理论，例如 `Verify.thy`。它的开头除了 `Main` 之外，还导入了 Isabelle 的库 **HOL-Library** 中的一个理论：

```isabelle norun
theory Verify
  imports Main "HOL-Library.Multiset"
begin

end
```

本模块的 Isabelle 文本都写在 `begin` 和 `end` 之间。HOL-Library 是随 Isabelle 一起提供、但不属于 `Main` 的一组理论。`"HOL-Library.Multiset"` 指的是其中的理论 `Multiset`，它定义了多重集（multiset）和规约中用到的函数 `mset`。引号是必需的，因为名字里有连字符：没有引号，Isabelle 会把它读成三个导入项：`HOL`、`-` 和 `Library.Multiset`。（在这里，引号并不像在 `lemma` 中那样标记内层语法。）

当打开带有此导入的理论时，Isabelle/jEdit 首先检查 `Multiset` 及其所依赖的库理论，然后才检查您自己的文本。这可能需要数十秒或更长时间。**Theories** 面板显示进度；在进度完成之前，您自己的文本保持未检查状态，且 Output 面板对其无任何输出。使用默认的预构建 HOL 镜像时，这些额外理论必须在每个新的证明器会话中进行检查；自定义会话镜像可以已包含它们。

现在来看这两个函数：

```isabelle
fun ins :: "'a::linorder ⇒ 'a list ⇒ 'a list" where
  "ins x [] = [x]"
| "ins x (y # ys) = (if x ≤ y then x # y # ys else y # ins x ys)"
```

```output
consts
  ins :: "'a ⇒ 'a list ⇒ 'a list"

Found termination order: "(λp. length (snd p)) <*mlex*> {}"
```

```isabelle
fun isort :: "'a::linorder list ⇒ 'a list" where
  "isort [] = []"
| "isort (x # xs) = ins x (isort xs)"
```

```output
consts
  isort :: "'a list ⇒ 'a list"

Found termination order: "length <*mlex*> {}"
```

类型 `'a::linorder` 读作“类 `linorder` 中的任意类型 `'a`”。模块 8 介绍过类型类（type class）；`linorder` 是**线性有序**（linearly ordered）类型的类。这些类型的 `≤` 是自反的、传递的和反对称的，并且任意两个值都能比较：x ≤ y 或 y ≤ x；也就是说，`≤` 是一个全序（模块 4）。自然数和整数都是线性有序的，所以 `isort` 既能给自然数列表排序，也能给整数列表排序。Isabelle 的回答打印类型时没有写出类，这是它的默认做法；模块 8 演示过怎样让类别（sort）显示出来。之所以取名 `ins` 和 `isort`，是为了不与库中自带的插入排序 `insort` 和 `sort` 冲突。

在试图证明关于这个程序的任何东西之前，先测试它：

```isabelle
value "isort [3, 1, 4, 1, 5, 9, 2, 6 :: int]"
```

```output
"[1, 1, 2, 3, 4, 5, 6, 9]"
  :: "int list"
```

::: trouble
如果去掉 `::linorder`，Isabelle 就不知道类型 `'a` 上有 `≤`：

```isabelle fails
fun ins_any :: "'a ⇒ 'a list ⇒ 'a list" where
  "ins_any x [] = [x]"
| "ins_any x (y # ys) = (if x ≤ y then x # y # ys else y # ins_any x ys)"
```

```output
*** Type unification failed: Variable 'a::type not of sort ord
***
*** Type error in application: incompatible operand type
***
*** Operator:  (≤) :: ??'a ⇒ ??'a ⇒ bool
*** Operand:   x :: 'a
***
```

不加限制的 `'a` 可以代表任何类型，包括没有 `≤` 的类型；用 Isabelle 的话说，它的类别是 `type`，即所有类型构成的类别。消息开头的“Type unification failed”意思是类型合一失败；它接着说，这样的变量不属于类别 `ord`，而 `ord` 是带有 `≤` 和 `<` 的类型构成的类。`::` 后面的**类别**（模块 8）把 `'a` 限制为具有这些运算的类型。写成 `'a::ord` 就足以让这个定义通过类型检查，但下面的证明需要线性序的定律，所以要用 `linorder`。
:::

### 规约 {#isort-spec}

这个规约分为两半，两半都由库函数构成。

**有序。** 库中的 `sorted` 说的是：列表中的每个元素都不大于它后面的每个元素。库是通过一个更一般的函数 `sorted_wrt` 来定义 `sorted` 的，所以它的等式不叫 `sorted.simps`，而是引理 `sorted_simps`：

```isabelle
thm sorted_simps
```

```output
  sorted [] = True
  sorted (?x # ?ys) = ((∀y∈set ?ys. ?x ≤ y) ∧ sorted ?ys)
```

问号标出的是图式变量（schematic variable，模块 7）：这些等式对每个 x 和 ys 都成立。把第二个等式读出来：“x # ys 是有序的，当且仅当 x 不大于 ys 中的每个 y，并且 ys 是有序的”。`set ys` 是 ys 的元素组成的集合，`∀y∈set ys. P y` 读作“对 ys 中的每个 y，P y 成立”。在两个列表上试一试：

```isabelle
value "sorted [1, 2, 2, 5 :: nat]"
value "sorted [1, 3, 2 :: nat]"
```

```output all
"True"
  :: "bool"

"False"
  :: "bool"
```

**是一个排列。** 正如模块 1 已经注意到的，光是有序还不够：空列表也是有序的。结果还必须与输入含有相同的元素，并且每个元素出现的次数也相同。集合无法表达“次数相同”，所以规约使用多重集。

::: definition 多重集与排列
**多重集**也叫**袋**（bag），它是这样一种汇集：元素的顺序无关紧要，但每个元素有几个副本是要紧的。`mset xs` 的类型是 `'a multiset`，它是列表 xs 的元素组成的多重集；`count M x` 是 x 在 M 中的副本个数。如果列表 ys 与 xs 含有相同的元素，并且每个元素出现的次数也相同，即 `mset ys = mset xs`，就说 ys 是 xs 的一个**排列**（permutation）。
:::

```isabelle
value "mset [2, 1, 2 :: nat] = mset [1, 2, 2]"
value "mset [1, 2 :: nat] = mset [1, 2, 2]"
value "count (mset [2, 1, 2 :: nat]) 2"
```

```output all
"True"
  :: "bool"

"False"
  :: "bool"

"2"
  :: "nat"
```

`[2, 1, 2]` 和 `[1, 2, 2]` 互为排列；`[1, 2]` 则少了一个 2。在证明中，你会通过定义 `mset` 的两个等式与多重集打交道：

```isabelle
thm mset.simps
```

```output
  mset [] = {#}
  mset (?a # ?x) = add_mset ?a (mset ?x)
```

第二个等式读作“a # x 的多重集，就是 x 的多重集再加上一个 a 的副本”。`{#}` 是空多重集，`add_mset a M` 是 M 再加上一个 a 的副本。所以 `mset [3, 1] = add_mset 3 (add_mset 1 {#})`，Isabelle 也把它写成 `{#3, 1#}`。不过，当 `value` 计算出一个多重集时，它会把结果显示成某个列表的 `mset`：

```isabelle
value "mset [3, 1 :: nat]"
```

```output
"mset [3, 1]"
  :: "nat multiset"
```

为了用多重集进行计算，Isabelle 用一个由元素组成的列表来表示每个多重集，而 `value` 打印的正是这种表示。第 12.6 节还会回到这一点。

::: definition 排序规约
如果对每个列表 xs，都有 `sorted (f xs)` 和 `mset (f xs) = mset xs`，也就是说，结果是有序的，并且是输入的一个排列，就说函数 `f :: 'a::linorder list ⇒ 'a list` **满足排序规约**。
:::

在花时间做证明之前，先测试这个断言。Quickcheck（模块 9）会尝试反驳它：

```isabelle
lemma "sorted (isort xs) ∧ mset (isort xs) = mset xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

Quickcheck 在其对列表和测试值的界限内未找到反例。一个 bug 可能需要一个未经测试的情况，包括更长的列表或不同的元素值。使用其默认设置，Isabelle/jEdit 也会在新目标上尝试 Auto Quickcheck，并在找到反例时用蓝色 **i** 标记该行（Module 1）。现在证明它。

## 证明插入排序的正确性 {#isort-proof}

正确性定理是一个合取式，所以分别证明它的两半，最后再把它们合起来。两半都遵循同一个计划，也就是模块 11 教过的那个：先尝试最直接的归纳，读一读自动化工具卡住的那个目标，再找出缺少的引理。

### 有序：最直接的尝试 {#sorted-attempt}

`isort` 是通过在列表上递归来定义的，所以试试对列表做归纳：

```isabelle fails
lemma "sorted (isort xs)"
  by (induction xs) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀a xs. sorted (isort xs) ⟹ sorted (ins a (isort xs))
```

基本情况已解决；归纳步骤尚未解决。阅读剩余的证明目标。其前提为归纳假设 `sorted (isort xs)`，结论为 `sorted (ins a (isort xs))`，其中 a 是 Isabelle 对列表头部的命名。因此该步骤需要一个事实：**将元素插入有序列表仍得到有序列表**。该事实仅涉及 `ins`；`isort` 仅提供有序列表。遵循 Module 11 的配方，将具体列表 `isort xs` 替换为变量，并将该事实声明为独立的引理：

$$
\mathit{sorted}\ xs \Longrightarrow \mathit{sorted}\ (\mathit{ins}\ x\ xs)
$$

### 关于 ins 的引理 {#ins-lemmas}

在纸面上，该引理通过对 xs 进行归纳得出。对于空列表，`ins x [] = [x]` 已排序。对于 y # ys，考察 `ins` 的两个分支：

- 若 x ≤ y，则结果为 x # y # ys。其已排序，因为 x ≤ y，且 y 不超过 ys 的每个元素（
  列表 y # ys 有序），故 x 也是如此，且 y # ys 有序。
- 否则 y < x，结果为 y # ins x ys。尾部 `ins x ys` 由归纳假设排序
  假设，因为 ys 已排序。且 y 必须至多为 `ins x ys` 中的每个元素。这些元素是哪些？它们是 ys 中的元素和 x。y 至多为其中的每个元素：至多为 x，因为 y < x；至多为 ys 中的元素，因为 y # ys 已排序。

第二个分支使用了一个在纸面上显而易见却容易被忽略的事实：`ins x ys` 的元素是 x 和 ys 的元素。Isabelle 不会忽略这一点。启动引理证明并查看 `auto` 留下的目标：

```isabelle
lemma "sorted xs ⟹ sorted (ins x xs)"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs xa.
       ⟦sorted (ins x xs); ∀x∈set xs. a ≤ x; sorted xs; ¬ x ≤ a;
        xa ∈ set (ins x xs)⟧
       ⟹ a ≤ xa
```

```isabelle
  oops
```

一个目标仍然存在，来自 ¬ x ≤ a 分支：头元素 a 必须不大于 `ins x xs` 的每个元素 xa。（`∀x∈set xs. a ≤ x` 中的界 x 与正在插入的 x 不同；Isabelle 重用了该名称。）`auto` 知道 a 不大于 xs 的每个元素且 ¬ x ≤ a，但关于 `ins x xs` 的元素一无所知：仅包含论文证明中未加评论使用的事实。将其表述为引理。它拥有自己的简单归纳法：

```isabelle
lemma set_ins: "set (ins x xs) = insert x (set xs)"
  by (induction xs) auto
```

`insert x A` 是向集合 A 添加 x 后的集合，`{x} ∪ A`。利用 `set_ins` 可得，排序性引理成立。以下是遵循论文证明逐例推导的 Isar 形式：

```isabelle
lemma sorted_ins: "sorted xs ⟹ sorted (ins x xs)"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons y ys)
  show ?case
  proof (cases "x ≤ y")
    case True
    with Cons.prems show ?thesis by auto
  next
    case False
    with Cons show ?thesis by (auto simp: set_ins)
  qed
qed
```

在 x ≤ y 的情况下，前提 `Cons.prems`（即 y # ys 已排序）是 `auto` 所需的全部信息。在另一种情况下，它还需要归纳假设（通过整个 `Cons` 传递）以及新引理。一旦你了解每个步骤需要哪些事实，整个归纳证明也可以写在一行中；Isar 版本向读者展示了每个事实的使用位置。

```isabelle
lemma "sorted xs ⟹ sorted (ins x xs)"
  by (induction xs) (auto simp: set_ins)
```

现在定理的前半部分是原始的归纳法，将引理传递给 `auto`：

```isabelle
lemma sorted_isort: "sorted (isort xs)"
  by (induction xs) (auto simp: sorted_ins)
```

### 一个排列 {#perm-proof}

后半部分同理。尝试明显的归纳法并查看步骤：

```isabelle
lemma "mset (isort xs) = mset xs"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs.
       mset (isort xs) = mset xs ⟹
       mset (ins a (isort xs)) = add_mset a (mset xs)
```

```isabelle
  oops
```

该步骤需要 `ins a (isort xs)` 的多重集。在假设 `mset (isort xs) = mset xs` 下，目标可从关于 `ins` 的事实直接得出：插入 x 会在多重集中增加一个 x 的副本。与之前一样，将 `isort xs` 泛化为任意列表：

```isabelle
lemma mset_ins: "mset (ins x xs) = add_mset x (mset xs)"
  by (induction xs) auto

lemma mset_isort: "mset (isort xs) = mset xs"
  by (induction xs) (auto simp: mset_ins)
```

注意 `mset_ins` 对每个列表（无论是否排序）均成立：`ins` 在其停止时从不丢失或重复任何元素。

### 正确性定理 {#isort-theorem}

这两部分共同构成定理。`proof` 在不使用方法的情况下应用 `∧`（Module 10）的标准规则，这为每一半各留下一个目标：

```isabelle
theorem isort_correct: "sorted (isort xs) ∧ mset (isort xs) = mset xs"
proof
  show "sorted (isort xs)" by (rule sorted_isort)
next
  show "mset (isort xs) = mset xs" by (rule mset_isort)
qed
```

命令`theorem`，如同`corollary`（Module 11）和`proposition`，含义与`lemma`相同；该词标记一个主要结果。插入排序得到验证：对于每个线性有序类型的每个列表，`isort`返回其输入的已排序排列。

::: keyidea
程序证明自顶向下进行，自底向上书写。从定理开始，尝试归纳法，阅读自动化停止时的目标；该目标告诉你缺少关于更小函数的哪个引理，通常是在将特定项泛化为变量之后。完成的理论首先列出引理（`set_ins`, `sorted_ins`, `mset_ins`），最后列出定理。
:::

::: tip
当目标提及库函数，例如已追加列表的 `mset` 时，所需引理可能已在库中。在自行证明前，使用 `find_theorems`（模块 9）进行查找。对于您自己的函数，如 `ins`，引理由您声明。
:::

## 为什么规约需要两半 {#halves}

已验证程序的质量仅取决于其规约，因此需像审查程序一样严格审视规约。半个版本是否足够？两个故意错误的“排序”函数回答了该问题。

```isabelle
definition sort_drop :: "'a::linorder list ⇒ 'a list" where
  "sort_drop xs = []"

definition sort_keep :: "'a::linorder list ⇒ 'a list" where
  "sort_keep xs = xs"
```

`sort_drop` 丢弃列表；`sort_keep` 原样返回。两者均未排序。但`sort_drop` 满足规范的前半部分，因为空列表已排序：

```isabelle
lemma "sorted (sort_drop xs)"
  by (simp add: sort_drop_def)
```

其失败仅在后半部分显现，且 Quickcheck 能立即找到它：

```isabelle
lemma "mset (sort_drop xs) = mset xs"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1]
Evaluated terms:
  mset (sort_drop xs) = mset []
  mset xs = mset [a⇩1]
```

反例是一个包含单个元素 a₁ 的列表。Quickcheck 在值被调用为 a₁, a₂, a₃ 等的小类型上测试关于未知元素类型的声明。求值后的项展示了方程的两边，每个多重集作为 `mset` 的列表打印，如 `value` 所示：左侧为空多重集，右侧为包含 a₁ 的多重集。Nitpick（模块 9）表示同意。它同时尝试几种元素类型的大小，因此它首先报告的反例可能因运行而异；选项 `card 'a = 2` 将 `'a` 的大小固定为两个值：

```isabelle
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variable:
    xs = [a⇩1]
```

```isabelle
  oops
```

`sort_keep` 是镜像。它与后半部分匹配，因为每个列表都是自身的排列：

```isabelle
lemma "mset (sort_keep xs) = mset xs"
  by (simp add: sort_keep_def)
```

并且失败于第一个：

```isabelle
lemma "sorted (sort_keep xs)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩2, a⇩1]
```

Quickcheck 的小类型按其值的索引排序，a₁ < a₂ < a₃，因此列表 `[a₂, a₁]` 顺序错误，`sort_keep` 将其原样返回。

每个半规则排除一类错误的程序。“Sorted”排除将元素置于无序状态的程序；“permutation”排除丢失、添加或重复元素的程序。只有两者结合才定义了排序的含义。

这两部分合起来是否足够，还是错误的程序仍可能同时满足两者？它们是足够的：对于每个输入，恰好有一个列表是已排序的且是另一个列表的排列。库证明了关于其自身排序函数的性质 `sort`：

```isabelle
thm properties_for_sort
```

```output
⟦mset ?ys = mset ?xs; sorted ?ys⟧ ⟹ sort ?xs = ?ys
```

将其读作：如果 ys 是 xs 的排列且 ys 已排序，则 ys 为 `sort xs`。因此，每个满足规范的函数都计算出与 `sort` 相同的结果；Exercise 12.7 利用此点证明 `isort xs = sort xs`。该规范确定了每个输入对应的结果。

::: pitfall
规范的一个常见弱化使用集合而非多重集：`sorted ys ∧ set ys = set xs`。它看起来正确，但实际上是错误的。一个既排序又去除重复项的函数，将`[2, 1, 2]`转换为`[1, 2]`，便满足该规范。对于学校分数，当两名学生分数相同时，这会丢失一名学生的成绩。练习 12.8 构建了这样一个函数，并让 Quickcheck 暴露它。
:::

::: note
并非每个规范都必须确定结果。当任何结果均可接受时，允许多种结果的规范是有用的，例如“返回列表中的某个元素”或“返回最短路径”。但此时“满足规范”是定理所保证的全部内容，程序使用者不得依赖他们获得的具体结果。
:::

## 二叉搜索树 {#bst}

排序是从输入到输出的函数。许多程序改为将数据保存在结构中并提供操作：插入键，询问键是否存在。如果操作在结构所代表的数据上按预期行为，则该结构是正确的。**二叉搜索树**是标准示例。

为了在排序的电话簿中查找名称，你不会从第一页开始阅读：你在中间打开它，查看名称是在之前还是之后，并在剩余的半部分中重复。二叉搜索树存储键，使得每次搜索都可以这样工作。每个节点包含一个键；其左子树中的键较小，右子树中的键较大。为了查找一个键，将其与根节点的键进行比较，然后向左或向右移动。搜索遵循从根节点出发的单一路径，并检查最多与树高度一样多的键。具有 n 个键的平衡良好的树的高度与 log₂(n + 1) 成正比。下面实现的树未保持平衡，因此其高度可能为 n。

### 树及其所表示的集合 {#bst-trees}

树为 Module 11 中的树：树要么是空叶 `Lf`，不持有任何内容，要么是具有左子树 l、键 x 和右子树 r 的节点 `Nd l x r`。此模块的理论需要其自身的数据类型副本：

```isabelle
datatype 'a btree = Lf | Nd "'a btree" 'a "'a btree"
```

搜索树表示一组键：其所有节点中的键的集合。这是用户所关心的内容。树的形状以及每个键的位置是树自身的事务。将集合定义为函数：

```isabelle
fun set_of :: "'a btree ⇒ 'a set" where
  "set_of Lf = {}"
| "set_of (Nd l x r) = set_of l ∪ {x} ∪ set_of r"
```

`set_of` 是搜索树的 **抽象函数**：它将每棵表示具体数据的树映射到其表示的集合，即抽象值。第 12.6 节使该思想一般化。

::: note
`datatype` 命令会自动定义这样的函数，名称为 `set_btree`。它还定义 `map_btree` 等函数，完整列表见 Isabelle 的数据类型手册 `datatypes.pdf`。下面等式中的变元名由 Isabelle 生成，等式与 `set_of` 表达同一个函数：

```isabelle
thm btree.set
```

```output
  set_btree Lf = {}
  set_btree (Nd ?x21.0 ?x22.0 ?x23.0) =
  set_btree ?x21.0 ∪ {?x22.0} ∪ set_btree ?x23.0
```

`?x21.0` 具有名称 `x21` 和索引 0。点分隔索引与以数字结尾的名称；若无该点，`?x21` 将表示名称为 `x` 且索引为 21（模块 9）。此模块定义其自身的函数，使得抽象函数在理论中可见。
:::

### 搜索与插入 {#bst-ops}

搜索将键与节点的键进行比较，然后向左、向右或停止：

```isabelle
fun isin :: "'a::linorder ⇒ 'a btree ⇒ bool" where
  "isin x Lf = False"
| "isin x (Nd l y r) =
     (if x < y then isin x l else if y < x then isin x r else True)"
```

以相同方式执行插入搜索。若找到键，树保持不变；若到达叶节点，则键不存在，该叶节点变为新节点：

```isabelle
fun tinsert :: "'a::linorder ⇒ 'a btree ⇒ 'a btree" where
  "tinsert x Lf = Nd Lf x Lf"
| "tinsert x (Nd l y r) =
     (if x < y then Nd (tinsert x l) y r
      else if y < x then Nd l y (tinsert x r)
      else Nd l y r)"
```

这里有一棵包含六个键的树，用于尝试它们；Figure 12.2 绘制了它。

```isabelle
definition t0 :: "int btree" where
  "t0 = Nd (Nd (Nd Lf 1 Lf) 2 (Nd Lf 4 Lf)) 5 (Nd Lf 8 (Nd Lf 9 Lf))"

value "set_of t0"
value "isin 4 t0"
value "isin 7 t0"
```

```output all
consts
  t0 :: "int btree"

"{5, 2, 1, 4, 8, 9}"
  :: "int set"

"True"
  :: "bool"

"False"
  :: "bool"
```

集合没有顺序：Isabelle 按生成代码收集键的顺序打印键，`{5, 2, 1, 4, 8, 9}` 与 `{1, 2, 4, 5, 8, 9}` 是同一集合。查找 4 在 5 处向左、在 2 处向右，并找到 4。查找 7 在 5 处向右、在 8 处向左，到达叶节点：7 不存在。插入 6 遵循与查找 7 相同的路径，并在该查找结束处放置新节点：

```isabelle
value "tinsert 6 t0"
```

```output
"Nd (Nd (Nd Lf 1 Lf) 2 (Nd Lf 4 Lf)) 5 (Nd (Nd Lf 6 Lf) 8 (Nd Lf 9 Lf))"
  :: "int btree"
```

::: figure id=fig-12-2
搜索树 `t0` 在 `tinsert 6` 之前和之后的状态。插入操作遵循搜索路径（在 5 处向右，在 8 处向左），并将搜索终止处的叶子节点替换为新节点。在每个节点处，左子树中的键小于该节点的键，而右子树中的键大于该节点的键：即不变式 `bst`。
:::

### 不变式 {#bst-invariant}

搜索只有在键位于正确位置时才有效。这棵树里的 6 位于 5 的左子树，但左子树中只应有更小的键：

```isabelle
value "isin 6 (Nd (Nd Lf 1 (Nd Lf 6 Lf)) 5 (Lf :: int btree))"
```

```output
"False"
  :: "bool"
```

关键 6 在树中，但搜索在 5 处向右并找到叶节点。函数没有错误；它们对树做出假设，而此树不满足该假设。该假设是树的不变式。

::: definition 数据结构的不变式
数据结构的**不变式**是其操作构建的每个值都具有的性质，且操作可依赖该性质。操作必须**保持**它：若输入满足不变式，则输出也满足。
:::

对于搜索树，其性质（不变式）为：在每个节点处，左子树的所有键均小于该节点的键，且右子树的所有键均大于该节点的键：

```isabelle
fun bst :: "'a::linorder btree ⇒ bool" where
  "bst Lf = True"
| "bst (Nd l x r) =
     (bst l ∧ bst r ∧ (∀y ∈ set_of l. y < x) ∧ (∀y ∈ set_of r. x < y))"
```

`∀y ∈ set_of l. y < x` 读作“l 的每个键 y 都小于 x”。在两个树上验证它：

```isabelle
value "bst t0"
value "bst (Nd (Nd Lf 1 (Nd Lf 6 Lf)) 5 (Lf :: int btree))"
```

```output all
"True"
  :: "bool"

"False"
  :: "bool"
```

搜索树的规约现在包含三个部分，第 12.6 节表明它们是通用模式的一个实例：

1. 插入操作保持不变式：`bst t ⟹ bst (tinsert x t)`。
2. 插入操作插入：`set_of (tinsert x t) = insert x (set_of t)`.
3. 搜索正确性：`bst t ⟹ isin x t = (x ∈ set_of t)`。

第二、第三部分说明，`tinsert` 与 `isin` 对树的作用分别对应 `insert` 与 `∈` 对树所表示集合的作用。第三部分只对满足不变式的树成立。前面将 6 放错位置的树就是反例。

空树 `Lf` 也必须满足不变式并代表空集；两者均源于定义；第 12.6 节在一般模式中明确包含了初始化。

### 一个错误的不变式 {#bst-wrong}

不变式必须正确表述，而这很容易出错。一个诱人的简化方案仅将每个节点与其两个子节点进行比较：左子节点的键必须较小，右子节点的键必须较大。这种表述更简洁且检查更快：

```isabelle
fun bst_local :: "'a::linorder btree ⇒ bool" where
  "bst_local Lf = True"
| "bst_local (Nd l x r) =
     (bst_local l ∧ bst_local r ∧
      (case l of Lf ⇒ True | Nd _ y _ ⇒ y < x) ∧
      (case r of Lf ⇒ True | Nd _ y _ ⇒ x < y))"
```

模式`Nd _ y _`匹配任意节点且仅命名其键；`_`代表你不需要的一部分。具有此不变式的树搜索是否正确？在尝试证明之前，先询问 Quickcheck：

```isabelle
lemma "bst_local t ⟹ isin x t = (x ∈ set_of t)"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  t = Nd Lf a⇩2 (Nd (Nd Lf a⇩1 Lf) a⇩3 Lf)
  x = a⇩1
Evaluated terms:
  isin x t = False
  x ∈ set_of t = True
```

```isabelle
  oops
```

画出这棵树。其根节点持有 a₂ 且左子树为空。右子节点持有 a₃，该节点的左子节点持有 a₁。每个节点与其子节点保持有序关系：a₃ 大于 a₂，且 a₁ 小于 a₃。因此 `bst_local` 成立。但 a₁ 小于 a₂ 且位于 a₂ 的右子树中。对 a₁ 的搜索将其与 a₂ 比较，向左查找并找到叶节点：`isin` 返回 False，尽管 a₁ 存在于树中。求值后的项精确地展示了这一点。

::: pitfall
关于递归结构的不变式通常必须涉及整棵子树，而不仅仅是邻居。如果某性质仅在邻居之间成立，请在基于此构建证明之前，使用 Quickcheck 或 Nitpick 检查它是否蕴含操作所需的内容。
:::

### 证明搜索树正确 {#bst-proofs}

从规范的初始部分，即不变式开始，并尝试明显的归纳法：

```isabelle
lemma "bst t ⟹ bst (tinsert x t)"
  apply (induction t)
  apply auto
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀t1 x2 t2 xa.
       ⟦bst (tinsert x t1); bst (tinsert x t2); bst t1; bst t2;
        ∀y∈set_of t1. y < x2; ∀x∈set_of t2. x2 < x; x2 < x; ¬ x < x2;
        xa ∈ set_of (tinsert x t2)⟧
       ⟹ x2 < xa
 2. ⋀t1 x2 t2 y.
       ⟦bst (tinsert x t1); bst (tinsert x t2); bst t1; bst t2;
        ∀y∈set_of t1. y < x2; ∀x∈set_of t2. x2 < x; ¬ x2 < x; x < x2;
        y ∈ set_of (tinsert x t1)⟧
       ⟹ y < x2
```

```isabelle
  oops
```

剩余两个目标，分别对应`tinsert`下降的两个方向。考察第一个：插入向右（x2 < x，其中 x2 是节点处的键），目标要求 x2 小于`tinsert x t2`的每个键 xa。前提表明 x2 小于 t2 的每个键且小于 x。若`auto`知道`tinsert x t2`的键是 x 和 t2 的键，则这就足够了，这是规范的第二部分。先证明它，并将其传递给`auto`：

```isabelle
lemma set_of_tinsert: "set_of (tinsert x t) = insert x (set_of t)"
  by (induction t) auto

lemma bst_tinsert: "bst t ⟹ bst (tinsert x t)"
  by (induction t) (auto simp: set_of_tinsert)
```

引理`set_of_tinsert`是规约的第二部分。它扮演了`set_ins`在插入排序中所起的作用：不变式讨论子树中的键，因此保持该不变式需要知道插入添加了哪些键。

第三部分，搜索的正确性，不需要新的引理。尝试明显的归纳法：

```isabelle
lemma isin_set_of: "bst t ⟹ isin x t = (x ∈ set_of t)"
  by (induction t) auto
```

它立即生效。了解其成立原因仍有价值，因为该论证展示了不变式在何处被需要。在纸面上：取一个满足不变式的树 Nd l y r，并将 x 与 y 比较。存在三种情况。

- **x < y.** 搜索在 l 中继续，根据归纳假设，它回答 x ∈ set_of l 是否成立。
  这个结果是正确的，因为 x 既不可能等于 y，也不可能出现在 r 中。r 中的键都大于 y。
- **x = y.** 搜索停止并返回 True，这是正确的。
- **y < x.** 第一种情况的镜像。

在每一个外层案例中，不变式被使用了两次：一次用于归纳假设，这需要子树是一棵搜索树，另一次用于排除另一棵子树。`auto` 自行找到了这两个用途，因为 `bst` 的定义是一个化简规则。

## 数据精化 {#refinement}

搜索树以特定方式验证，其规范并未描述树，而是描述集合，且证明通过抽象函数将树操作与集合操作关联起来。这种验证数据结构的方式称为数据精化，它几乎适用于所有数据结构。

### 模式 {#refine-pattern}

::: definition 数据精化
本模块使用带有确定性操作和抽象函数的数据精化。一个**抽象模型**是一个简单的数学类型，其操作含义明确，例如带有`{}`、`insert`和`∈`的集合。一个**具体数据结构**通过其自身的类型和操作来实现它，这些类型和操作是出于效率考虑而选择的。它们通过一个**抽象函数**α连接，该函数将每个具体值映射到它所代表的抽象值，以及一个关于具体值的**不变式**I。如果满足以下条件，则具体结构**精化**模型：

1. 具体的空值表示抽象值并满足 I；
2. 每个具体操作在其前提条件成立时保持 I；
3. 对于满足 I 和操作前置条件的值，每个具体操作都对应于
   其抽象版本为：先应用具体操作再应用 α 与先应用 α 再应用抽象操作所得结果相同；且每个查询的答案均与其抽象查询的答案一致。
:::

条件 3 常如 Figure 12.3 所示画为正方形：沿顶部再向下与先向下再沿底部给出相同结果。此类图称为 **commuting squares**。

对于搜索树，其组成部分为：

| | 抽象模型 | 具体结构 |
|---|---|---|
| 值 | `'a set` | `'a btree` 满足 `bst` |
| 空 | `{}` | `Lf` |
| 插入 | `insert x A` | `tinsert x t` |
| 成员 | `x ∈ A` | `isin x t` |
| 连接 | | α = `set_of`, I = `bst` |

`set_of Lf = {}` 和 `bst Lf` 由定义成立，`bst_tinsert` 是条件 2，`set_of_tinsert` 和 `isin_set_of` 是条件 3。

当使用数据结构时获得奖励。使用搜索树的程序可以使用集合（您已熟悉）而非树进行推理。以下是仅凭三个引理证明的关于树的性质，无需查看任何树：

```isabelle
lemma "bst t ⟹ isin y (tinsert x t) = (y = x ∨ isin y t)"
  by (simp add: bst_tinsert isin_set_of set_of_tinsert)
```

化简器将两侧转化为关于`set_of t`的陈述，其中主张是集合论的一条定律。该证明从不深入`isin`或`tinsert`内部：若你将树替换为具有相同三个引理的平衡树，此证明亦不会改变。

### 由两个列表构成的队列 {#queue}

A **queue** 是一个等待队列：元素从后端加入并从前端离开，因此先加入的元素最先离开。抽象模型是一个列表，队列的前端对应列表的头部。加入操作是 `xs @ [x]`。离开操作是 `tl xs`，即列表的尾部：去掉第一个元素后的列表。前端的元素是 `hd xs`，即列表的头部。在 Isabelle `tl [] = []` 中，尽管 `hd []` 没有指定值（Module 8）。

作为程序，普通列表效率低下：`xs @ [x]` 复制整个列表，因此包含 n 个元素的队列在每次元素入队时需耗费 n 步。一种经典的函数式实现使用两个列表。**front**列表按顺序保存前部元素；**back** 列表以逆序保存后部元素，使得队列入队操作只需一步即可将元素添加到 back 列表头部。元素从 front 列表头部出队。当 front 列表为空时，对 back 列表进行反转并作为新的 front 列表。

```isabelle
datatype 'a queue = Queue "'a list" "'a list"
```

值 `Queue f b` 具有前列表 f 和后列表 b。其表示的队列是前列表后接后列表的反转。即抽象函数：

```isabelle
fun list_of :: "'a queue ⇒ 'a list" where
  "list_of (Queue f b) = f @ rev b"
```

```isabelle
value "list_of (Queue [1, 2] [4, 3 :: nat])"
```

```output
"[1, 2, 3, 4]"
  :: "nat list"
```

现在考虑操作。`refill` 在前端列表为空时将后端列表移至前端；`enq`（入队）在末尾添加元素，`deq`（出队）移除前端元素，`first` 返回该元素。

```isabelle
definition qempty :: "'a queue" where
  "qempty = Queue [] []"

fun refill :: "'a queue ⇒ 'a queue" where
  "refill (Queue [] b) = Queue (rev b) []"
| "refill q = q"

fun enq :: "'a ⇒ 'a queue ⇒ 'a queue" where
  "enq x (Queue f b) = refill (Queue f (x # b))"

fun deq :: "'a queue ⇒ 'a queue" where
  "deq (Queue [] b) = Queue [] b"
| "deq (Queue (x # f) b) = refill (Queue f b)"

fun first :: "'a queue ⇒ 'a" where
  "first (Queue f b) = hd f"
```

`refill` 中的第二个方程仅在前一个方程不适用时生效，即当 front 列表非空时（Module 8 解释了 `fun` 如何解决重叠模式）。尝试以下操作：

```isabelle
value "enq 5 (Queue [1, 2] [4, 3 :: nat])"
value "deq (Queue [1] [4, 3, 2 :: nat])"
```

```output all
"Queue [1, 2] [5, 4, 3]"
  :: "nat queue"

"Queue [2, 3, 4] []"
  :: "nat queue"
```

将 5 添加到头部使后列表非空，移除 1 使前列表为空，因此 `refill` 将后列表反转到前列表：`[4, 3, 2]` 变为 `[2, 3, 4]`。沿从 `qempty` 开始的一条序列，将每个操作的结果作为下一个队列，每个入队的元素从后到前最多被反转一次。这给出了每个操作的常数 **amortised** 列表处理成本：m 个操作的总成本与 m 成正比，尽管一个 `deq` 可能需要线性时间。这不是每个调用的概率或界限。重用较旧的队列版本可能会重复相同的反转。成本模型和 amortised 界限的证明与这里的函数式证明是分开的；`Queue_2Lists`，如下所述，开发了此类界限。

`first` 返回前列表的头部。仅当整个队列为空时前列表为空，该答案才是正确的；否则，第一个元素可能正等待在后列表中。这些操作保持此性质成立，因为 `refill` 绝不会在非空后列表之前留下空的前列表。这是队列的不变式：

```isabelle
fun qinv :: "'a queue ⇒ bool" where
  "qinv (Queue f b) = (f = [] ⟶ b = [])"
```

::: figure id=fig-12-3
双列表队列作为交换图。沿顶部是具体操作 `enq 5`；沿底部是抽象操作，即追加 `[5]`；抽象函数 `list_of` 在两侧向下。从左上角出发的两条路径均得到列表 `[1, 2, 3, 4, 5]`。
:::

### 证明队列正确性 {#queue-proof}

规范遵循定义 12.5 的模式，以列表作为抽象模型：

| | 抽象模型 | 队列 |
|---|---|---|
| 空 | `[]` | `qempty` |
| 在尾部连接 | `xs @ [x]` | `enq x q` |
| 在队首出队 | `tl xs` | `deq q` |
| 前元素 | `hd xs` | `first q` |
| 连接 | | α = `list_of`, I = `qinv` |

从空队列开始，它仅需定义 `qempty`：

```isabelle
lemma list_of_qempty: "list_of qempty = []"
  by (simp add: qempty_def)
```

接下来，`enq`。队列始终具有 `Queue f b` 的形式，因此使用 `cases q`（Module 10）将证明拆分为该情况，并尝试 `auto`：

```isabelle
lemma "list_of (enq x q) = list_of q @ [x]"
  apply (cases q)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x1 x2.
       q = Queue x1 x2 ⟹
       list_of (refill (Queue x1 (x # x2))) = x1 @ rev x2 @ [x]
```

```isabelle
  oops
```

`cases q` 命名队列 x1 和 x2 的两个列表。`auto` 在左侧展开了 `enq` 并在右侧展开了 `list_of q`，但在 `list_of (refill (Queue x1 (x # x2)))` 处卡住。`refill` 的方程取决于前部列表 x1 是否为空，而 `auto` 不会自行对此进行分支。你可以指示它这样做，但有一种更好的方法：一劳永逸地声明 `refill` 对队列所代表的列表 a 的作用，即没有任何作用。该引理将为每个调用 `refill` 的操作服务：

```isabelle
lemma list_of_refill: "list_of (refill q) = list_of q"
  by (cases q rule: refill.cases) auto

lemma list_of_enq: "list_of (enq x q) = list_of q @ [x]"
  by (cases q) (simp add: list_of_refill)
```

`cases q rule: refill.cases` 将证明分解为 `refill` 中方程的两种情况：队首列表为空的队列与队首列表非空的队列。这是跟随函数模式的情况分析，而 `rule: f.induct` 是跟随其递归的归纳（Module 11）。注意 `list_of_enq` 没有前提：`enq` 对所有队列均正确，无论是否满足不变式，因为它仅向队尾添加元素。

`deq` 在每一个队列上是否都正确？在证明之前先询问 Quickcheck：

```isabelle
lemma "list_of (deq q) = tl (list_of q)"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  q = Queue [] [a⇩1]
Evaluated terms:
  list_of (deq q) = [a⇩1]
  tl (list_of q) = []
```

```isabelle
  oops
```

队列`Queue [] [a₁]`具有空的前置列表和后置列表中的一个元素。它表示列表`[a₁]`，因此移除前置元素应留下空列表。但`deq`看到前置列表为空并返回不变的队列。该队列破坏了不变式，且从`qempty`开始的`enq`和`deq`的任何序列都无法构建它。因此，`deq`的对应关系仅在不变式下成立，且不变式在前置列表为空时是必需的。Isar 证明使这一点变得清晰：

```isabelle
lemma list_of_deq:
  assumes "qinv q"
  shows "list_of (deq q) = tl (list_of q)"
proof (cases q)
  case (Queue f b)
  show ?thesis
  proof (cases f)
    case Nil
    with Queue assms have "b = []" by simp
    with Nil Queue show ?thesis by simp
  next
    case (Cons x f')
    with Queue show ?thesis by (simp add: list_of_refill)
  qed
qed
```

对于空的前列表，不变式表明后列表也为空，因此队列为空，`deq` 正确地保持其状态，因为 `tl [] = []`。对于非空的前列表，`deq` 移除其头部，而 `refill` 不改变列表。剩余部分较短：

```isabelle
lemma first_correct: "qinv q ⟹ list_of q ≠ [] ⟹ first q = hd (list_of q)"
  by (cases q) auto

lemma qinv_refill: "qinv (refill q)"
  by (cases q rule: refill.cases) auto

lemma qinv_qempty: "qinv qempty"
  by (simp add: qempty_def)

lemma qinv_enq: "qinv (enq x q)"
  by (cases q) (simp add: qinv_refill)

lemma qinv_deq: "qinv q ⟹ qinv (deq q)"
  by (cases q rule: deq.cases) (auto simp: qinv_refill)
```

`first_correct`有两个前提：不变式和队列非空。空队列没有前导元素：在模型中，`hd []`没有指定值。因此规范对空队列上的`first`不作任何承诺，并允许实现自由返回任意值。（该实现恰好对空队列返回`hd []`，因此这个特定证明即使没有第二个前提也能成立。）

引理`qinv_qempty`、`qinv_enq`和`qinv_deq`表明，由`qempty`、`enq`和`deq`构建的每个队列都满足不变式，因此`list_of_deq`和`first_correct`的前提`qinv q`对通过那些操作构造的队列成立。调用`first_correct`还需要非空性。

### 在实践中验证数据结构 {#practice}

搜索树和队列是教科书中的经典示例，但该模式是通用验证软件所采用的模式。

- **Isabelle 自身的库。** Isabelle 发行版包含 HOL-Data_Structures 会话，一个
  已验证函数式数据结构集合（位于 Isabelle 安装文件夹 `src/HOL/Data_Structures` 中）。其理论 `Queue_Spec` 陈述了本节队列规范，包含空性测试（练习 12.6）：八个性质，带有抽象函数 `list` 和不变式 `invar`。`Queue_2Lists` 针对双列表队列证明它们，并在显式操作成本模型中确立摊销界限。`Set_Specs` 陈述第 12.5 节的集合规范，包含删除操作，而理论 `Tree_Set`、`AVL_Set` 和 `RBT_Set` 针对不平衡树、AVL 树和红黑树证明该规范。
- **代码生成器。** 当 Isabelle 为集合生成代码时，它通过列表表示有限集合
  其元素，一种内置于库的数据精化；导入 `HOL-Library.RBT_Set` 切换到红黑树。多重集也由列表表示，这就是为什么 `value` 在第 12.2 节中打印了 `mset [3, 1]` 的原因。
- **大型系统。** seL4 证明（Module 1）是一个大规模的精化证明：它表明
  内核的 C 代码精化了一个可执行规范，该规范又精化了内核行为的抽象规范。

::: keyidea
数据精化分离了两个问题：数据结构所代表的含义（抽象模型）及其构建方式（具体结构）。抽象函数将二者关联，而不变式记录了具体操作所依赖的前提。使用数据结构的程序仅基于抽象模型进行推理。
:::

## 从已验证的函数到可运行代码 {#export}

模块 8 展示了如何将 `export_code` 翻译为 HOL 函数到 Standard ML、OCaml、Haskell 或 Scala。应用于已验证函数时，它将其转化为已验证程序，并保证本节末尾将对此做出精确说明。导出本模块验证的所有内容，作为一个 Haskell 模块。首先增加一项：使用搜索树的 Haskell 代码需要一个空树作为起点，因此给空树一个独立的名称（不使用 `Lf` 的原因见下文）：

```isabelle
definition tempty :: "'a btree" where
  "tempty = Lf"

export_code isort tempty isin tinsert qempty enq deq first
  in Haskell module_name Verified
```

```output
See theory exports
```

和模块 8 一样，**Output**面板只告诉你代码存放在哪里。Isabelle 把生成的代码存放在**理论导出文件**中，不会直接打印。Isabelle/jEdit 消息中的 *theory exports* 是链接。点击后，**File Browser**（文件浏览器）会在虚拟地址 `isabelle-export:` 打开该理论的导出目录。其中的文件夹 `export1` 包含文件 `Verified.hs`。`export_code` 默认将理论的导出目录编为 `export1`、`export2` 等，也可通过选项 `file_prefix` 自行命名。

打开 `Verified.hs`，就能看到转换成 Haskell 的理论。数据类型变成了 Haskell 的 `data` 声明，分别是带构造子 `Lf` 和 `Nd` 的 `Btree`，以及带构造子 `Queue` 的 `Queue`。函数使用 `fun` 从原定义导出的等式，其中把 `#` 写成 `:`，把 `rev` 写成 `reverse`。导出函数所依赖的 `ins`、`refill` 和库中的 `hd` 也包含在内。比较运算 `≤`、`<` 变成 `less_eq`、`less`，它们属于 Isabelle 由自身的类 `ord` 生成的 Haskell 类型类 `Ord`。`preorder`、`order` 和 `linorder` 也成为 Haskell 类型类（模块 8 对比了两种语言的类型类）。模块开头列出了导出内容，包括函数、类 `Linorder` 和类型 `Btree`、`Queue`。这些类型的构造子不导出。

在此 Haskell 导出中，`export_code` 暴露其列表中的函数，并在不含构造函数的情况下暴露这些函数直接使用的数据类型和类。仅当列表命名了某个构造函数的数据类型时，才导出其构造函数。隐藏构造函数保护了表示：普通客户端通过 `tempty` 和 `tinsert` 构造有限且定义良好的树，并通过 `qempty`、`enq` 和 `deq` 构造队列，从而保持已证明的不变式。这并未强制执行操作前置条件，例如 `first` 所需的非空队列。若列表命名的是构造函数 `Lf` 而非 `tempty`，Isabelle 将导出类型 `Btree` 及其所有构造函数，包括 `Nd`，从而赋予构建任意树的能力。

模块内部还包含类 `Ord`、`Preorder` 和 `Order`，`Linorder` 基于它们构建。如当前导出所示，其他 Haskell 代码无法说明如何比较其自有类型的元素，因此尚不能调用 `isort` 或树函数。编写 `export_code open …` 会导出所有内容：带有操作的类以及带有构造器的数据类型。然后，这些函数可用于任何类型，但不变式的保护随之消失。选择导出内容是经过验证的代码接口设计的一部分。

### 什么是保证 {#guarantee}

生成的模块中的每个函数都源自逻辑中的定理方程：对于你自己的函数，你的`fun`和`definition`命令（Module 8）的方程。代码生成器将每个方程翻译为目标语言的方程，并添加库中所需的定义。因此，当生成的`isort`返回一个列表时，该列表是在以下可信基础假设下`isort`在逻辑中的值，且正确性定理表明它是排序的且是输入的一个排列。这一保证，即程序产生的每个结果都是逻辑所认可的结果，被称为**partial correctness**（Module 8）：它讨论的是程序返回的结果，而不是它是否返回。例如，生成的`first`在遇到空队列时会因错误而停止，因为库的`hd`没有`[]`的方程。非空前提条件将调用从`first_correct`中排除；仅靠部分正确性无论如何都不会保证有结果。这种对应关系涉及代表HOL值的输入和定义结果。Haskell还允许`undefined`和无限列表，它们不代表HOL的有限列表数据类型的值。

保证所依赖的是模块1的可信基础，经证明后的步骤扩充：

- **代码生成器。** 其将等式翻译为目标语言的过程发生在
  kernel。Isabelle 的代码生成手册 (`codegen.pdf`) 解释称，最后步骤（翻译与打印）在逻辑之外执行，且保持尽可能精简，以最小化需信任的代码量。精简不等于无。
- **目标编译器及其运行时系统**：Haskell 编译器、其库、垃圾
  collector 与整数算术。
- **机器**：硬件、操作系统以及逻辑所不知的界限。
  在逻辑`isort`中，对任意长度的列表均有效；而真实计算机在达到某一长度时会耗尽内存或栈空间。
- **其周围的代码。** 关于 `isin`、`deq` 和 `first` 的定理假设不变式 `bst` 和
  `qinv`。`first_correct` 还要求队列非空。隐藏构造器可以确保通过该接口构造的有限、有定义的值保持表示不变式。手动修改生成的代码、公开构造器或绕过类型系统都可能使这个推理失效。同样，关于 `isort` 以及树上函数的定理假定 `≤` 与 `<` 构成线性序。`export_code open` 之后，其他代码用自己提供的运算比较其类型的元素，而这些运算是否遵守 `linorder` 的公理并没有经过检查。
- **规范。** 已验证函数符合其规范所述行为。
  用户所需的是验证。

::: note
HOL 与目标语言之间的一些对应关系由手工建立，它们也属于可信基础。即使默认设置也有少量：生成的代码使用 Haskell 自身的列表、布尔值和 `reverse`。库理论如 `HOL-Library.Code_Target_Nat`（模块 8 曾提及）增加了更多：它们使生成的代码使用目标语言自身的整数而非自然数数据类型。Haskell 的 `Integer` 使用任意精度，受资源限制约束；内核不检查此实现。表示 HOL 自然数的输入仍必须为非负数：调用代码提供的任意负数 `Integer` 不是自然数值。
:::

## 小结 {#summary}

- 要**验证**程序，即证明一个**正确性定理**：对于满足其
  前置条件，**实现**（如何）的结果具有**规范**（什么）的性质。规范是为人类阅读和验证而编写的；实现是为计算机编写的。
- **插入排序**满足排序规范：`sorted (isort xs) ∧ mset (isort xs) = mset xs`。
  `mset` 从 `HOL-Library.Multiset` 将列表转换为其元素的多重集；`mset ys = mset xs` 表明 ys 是 xs 的一个排列。
- 程序证明是自顶向下进行的：尝试归纳法，阅读`auto`停止时的目标
  将其泛化为关于较小函数（`set_ins`, `sorted_ins`, `mset_ins`）的引理，并首先证明该引理。
- 规范的每一半都排除了其自身的错误程序类型：`[]` 已排序，且输入
  它本身是一个置换。在证明之前使用 Quickcheck 和 Nitpick 测试规范，并针对故意错误的程序进行测试。使用集合而非多重集会使重复项消失。
- A **二叉搜索树**通过**抽象函数** (`set_of`) 和
  **invariant** (`bst`): 插入操作保持不变式并插入到集合中，且搜索回答集合中的成员关系。仅比较邻居的不太强。
- **数据精化** 是通用模式：具体结构、抽象模型、抽象
  函数与不变式，具体操作对应抽象操作。双列表队列精化列表，并需要其不变式以用于 `deq` 和 `first`。
- `export_code` 将已验证的函数转化为代码，存储为理论导出。生成的代码是
  相对于已证明的方程部分正确；代码生成器、编译器、机器和调用代码仍位于可信基中。隐藏构造函数保护通过接口构建的定义值的表示不变式；调用者仍需满足操作前置条件。

## 练习 {#exercises}

:::: exercise 哪些函数是排序函数？ {#ex-12-1} ★
在纸上判定哪些函数满足定义 12.3 的排序规约，并说明理由。随后在 Isabelle 中验证答案：从 `sorted_isort` 和 `mset_isort` 证明成立的断言，并让 Quickcheck 反驳其余部分。

1. `isort (rev xs)`
2. `rev (isort xs)`
3. `isort (isort xs)`
4. `remdups (isort xs)`，其中 `remdups` 从列表中移除重复元素

::: solution
1. **满足规约。** `isort` 对任意列表排序，因此结果有序，并且
   `mset (isort (rev xs)) = mset (rev xs) = mset xs`: reversing 不改变 multiset。
2. **不满足规约。** 结果是 xs 的一个排列，但按降序排列。Quickcheck 的
   下面的反例 `xs = [a₁, a₂]` 被转化为 `[a₂, a₁]`。
3. **Meets it.** 对已排序列表进行排序不会改变其内容，且无论如何 `isort` 均返回一个已排序的列表
   `isort xs` 的排列，它是 xs 的排列。
4. **不满足规约。** 结果有序，却丢掉了重复元素，因此不是原列表的排列：
   `[a₁, a₁]` 变为 `[a₁]`。

```isabelle
lemma "sorted (isort (rev xs)) ∧ mset (isort (rev xs)) = mset xs"
  by (simp add: sorted_isort mset_isort)

lemma "sorted (isort (isort xs)) ∧ mset (isort (isort xs)) = mset xs"
  by (simp add: sorted_isort mset_isort)

lemma "sorted (rev (isort xs))"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1, a⇩2]
```

```isabelle
lemma "mset (remdups (isort xs)) = mset xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1, a⇩1]
Evaluated terms:
  mset (remdups (isort xs)) = mset [a⇩1]
  mset xs = mset [a⇩1, a⇩1]
```

在第一个证明 `simp` 中，还使用了库的 `mset_rev`、`mset (rev xs) = mset xs`，后者是一个 simp 规则。
:::
::::

:::: exercise 手动实现队列 {#ex-12-2} ★
对每个队列，写出其表示的列表并判断是否满足`qinv`：`Queue [1] [3, 2]`，`Queue [] [2, 1]`，`Queue [] []`。然后通过手工计算`deq (Queue [1] [3, 2])`和`enq 4 qempty`，使用第12.6节的方程。用`value`检查你的答案。

::: solution
`Queue [1] [3, 2]` 表示 `[1] @ rev [3, 2] = [1, 2, 3]` 并满足不变式（其前列表非空）。`Queue [] [2, 1]` 表示 `[1, 2]` 但破坏不变式：其前列表为空而后列表非空。`Queue [] []` 表示 `[]` 并满足不变式。

`deq (Queue [1] [3, 2]) = refill (Queue [] [3, 2]) = Queue [2, 3] []`，它表示`[2, 3]`，即`[1, 2, 3]`的尾部。`enq 4 qempty = refill (Queue [] [4]) = Queue [4] []`。

```isabelle
value "list_of (Queue [1] [3, 2 :: nat])"
value "qinv (Queue [] [2, 1 :: nat])"
value "deq (Queue [1] [3, 2 :: nat])"
value "enq 4 (qempty :: nat queue)"
```

```output all
"[1, 2, 3]"
  :: "nat list"

"False"
  :: "bool"

"Queue [2, 3] []"
  :: "nat queue"

"Queue [4] []"
  :: "nat queue"
```
:::
::::

:::: exercise 手动搜索树 {#ex-12-3} ★
哪些树满足`bst`？先画出每一棵。

1. `Nd (Nd Lf 2 Lf) 3 (Nd Lf 1 Lf)`
2. `Nd Lf 1 (Nd (Nd Lf 2 Lf) 3 Lf)`
3. `Nd (Nd Lf 1 (Nd Lf 4 Lf)) 3 (Nd Lf 5 Lf)`

`tinsert 3 t0` 将密钥 3 放置于何处，其中 `t0` 来自第 12.5 节？使用 `value` 验证你的答案。

::: solution
1. **No**: 1 在 3 的右子树中但小于 3。
2. **Yes**: 2 和 3 大于 1 且位于其右侧；2 位于 3 的左侧。
3. **No**: 4 在 3 的左子树中但大于 3。每个节点都大于其左子节点
   且小于其右子节点，因此该树满足第 12.5 节中的 `bst_local`：这是导致错误不变式失效的树类型。

`tinsert 3 t0` 在 5 处向左，在 2 处向右，在 4 处向左并找到叶节点，因此 3 成为 4 的左子节点。

```isabelle
value "bst (Nd (Nd Lf 2 Lf) 3 (Nd Lf 1 Lf) :: int btree)"
value "bst (Nd Lf 1 (Nd (Nd Lf 2 Lf) 3 Lf) :: int btree)"
value "bst (Nd (Nd Lf 1 (Nd Lf 4 Lf)) 3 (Nd Lf 5 Lf) :: int btree)"
value "bst_local (Nd (Nd Lf 1 (Nd Lf 4 Lf)) 3 (Nd Lf 5 Lf) :: int btree)"
value "tinsert 3 t0"
```

```output all
"False"
  :: "bool"

"True"
  :: "bool"

"False"
  :: "bool"

"True"
  :: "bool"

"Nd (Nd (Nd Lf 1 Lf) 2 (Nd (Nd Lf 3 Lf) 4 Lf)) 5 (Nd Lf 8 (Nd Lf 9 Lf))"
  :: "int btree"
```
:::
::::

:::: exercise 排序保持长度 {#ex-12-4} ★★
用两种方式证明`length (isort xs) = length xs`。

1. 通过归纳法，并借助关于 `ins x xs` 长度的引理。
2. 无需归纳法，由`mset_isort`。多重集M的元素数量，按
   copies 是 `size M`。使用 `find_theorems` 查找一个将 `size (mset xs)` 与 xs 的长度相关联的库事实。

::: solution
1. 引理与归纳法：

   ```isabelle
   lemma length_ins: "length (ins x xs) = Suc (length xs)"
     by (induction xs) auto

   lemma "length (isort xs) = length xs"
     by (induction xs) (auto simp: length_ins)
   ```

2. 搜索关于`mset xs`大小的事实；下划线代表任意项：

   ```isabelle
   find_theorems "size (mset _)"
   ```

   ```output result
   find_theorems
     "size (mset _)"

   found 1 theorem(s):
     Multiset.size_mset: size (mset ?xs) = length ?xs
   ```

   `size_mset` 是一个 simp 规则，因此 `simp` 将 sizes 转换为 lengths：

   ```isabelle
   lemma "length (isort xs) = length xs"
   proof -
     have "size (mset (isort xs)) = size (mset xs)" by (simp add: mset_isort)
     then show ?thesis by simp
   qed
   ```

第二个证明展示了强规约的好处：无需新的归纳即可推导出其他性质。
:::
::::

:::: exercise 插入操作中的缺陷 {#ex-12-5} ★★
一位同事的插入存在一个 bug:

```isabelle
fun ins_bad :: "'a::linorder ⇒ 'a list ⇒ 'a list" where
  "ins_bad x [] = [x]"
| "ins_bad x (y # ys) = (if x ≤ y then x # ys else y # ins_bad x ys)"

fun isort_bad :: "'a::linorder list ⇒ 'a list" where
  "isort_bad [] = []"
| "isort_bad (x # xs) = ins_bad x (isort_bad xs)"
```

通过阅读查找错误。然后使用 Quickcheck 测试规范的每一半。哪一半捕获了错误，而另一半为何没有？

::: solution
在 x ≤ y 的情况下，`ins_bad` 返回 `x # ys` 并遗忘 y。Quickcheck 未发现前半部分存在反例：

```isabelle
lemma "sorted (isort_bad xs)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

但反驳了第二个：

```isabelle
lemma "mset (isort_bad xs) = mset xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1, a⇩1]
Evaluated terms:
  mset (isort_bad xs) = mset [a⇩1]
  mset xs = mset [a⇩1, a⇩1]
```

丢弃 y 不会破坏列表的有序性：x ≤ y 且 y 至多是 ys 的每个元素，因此 `x # ys` 仍然有序。事实上 `sorted (isort_bad xs)` 对每个列表都成立。证明过程与 `sorted_ins` 和 `sorted_isort` 相同，使用引理 `set (ins_bad x xs) ⊆ insert x (set xs)` 代替 `set_ins`：`ins_bad` 可能会丢失元素，但除了 x 外不会添加任何元素。只有排列的一半注意到元素丢失。修复方案是 `ins` 的等式：`x # y # ys`。
:::
::::

:::: exercise 队列是否为空？ {#ex-12-6} ★★
添加一个通过仅查看前部列表来测试队列是否为空的运算：

```isabelle
fun isempty :: "'a queue ⇒ bool" where
  "isempty (Queue f b) = (f = [])"
```

按照第 12.6 节的风格陈述其正确性：它应与抽象测试 `list_of q = []` 一致。首先让 Quickcheck 表明该断言需要不变式，然后利用该不变式进行证明。

::: solution
```isabelle
lemma "isempty q = (list_of q = [])"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  q = Queue [] [a⇩1]
Evaluated terms:
  isempty q = True
  list_of q = [] = False
```

反例具有空的前列表和非空的后列表：`isempty` 对非空队列回答 True。这样的队列破坏了不变式，且以不变式为前提，该断言成立：

```isabelle
lemma isempty_correct: "qinv q ⟹ isempty q = (list_of q = [])"
  by (cases q) auto
```
:::
::::

:::: exercise 规范确定了结果 {#ex-12-7} ★★★
证明`isort xs = sort xs`，其中`sort`是库的排序函数。使用`properties_for_sort`（第12.4节）与`mset_isort`和`sorted_isort`，且不使用归纳法。

::: solution
`properties_for_sort` 从 `mset ys = mset xs` 和 `sorted ys` 推导出 `sort xs = ys`。借助 `ys = isort xs`，其两个前提恰好是 `mset_isort` 和 `sorted_isort`，按此顺序，因此 `rule` 可将它们用作解除前提的事实：

```isabelle
lemma isort_sort: "isort xs = sort xs"
proof -
  have "sort xs = isort xs"
    using mset_isort sorted_isort by (rule properties_for_sort)
  then show ?thesis by simp
qed
```

该证明从不考察 `isort` 的工作原理。任何具备这两个性质的函数都等于 `sort`，因此该引理可以以相同方式对 merge sort 或 quicksort 进行证明。
:::
::::

:::: exercise 树排序与弱规范 {#ex-12-8} ★★★
通过将其元素插入搜索树并从左到右读取树来对列表进行排序：

```isabelle
fun inorder :: "'a btree ⇒ 'a list" where
  "inorder Lf = []"
| "inorder (Nd l x r) = inorder l @ [x] @ inorder r"

fun build :: "'a::linorder list ⇒ 'a btree" where
  "build [] = Lf"
| "build (x # xs) = tinsert x (build xs)"

definition tsort :: "'a::linorder list ⇒ 'a list" where
  "tsort xs = inorder (build xs)"
```

1. 证明 `tsort` 满足第 12.4 节的弱规约
   `sorted (tsort xs) ∧ set (tsort xs) = set xs`. 你需要关于 `set (inorder t)`、`sorted (inorder t)`、`bst (build xs)` 和 `set_of (build xs)` 的引理；库引理 `sorted_append` 描述了追加列表有序的条件。
2. 使用 Quickcheck 证明 `tsort` 不满足排序规范，并解释原因。

::: solution
1. 四个引理，然后是断言：

   ```isabelle
   lemma set_inorder: "set (inorder t) = set_of t"
     by (induction t) auto

   lemma sorted_inorder: "bst t ⟹ sorted (inorder t)"
     by (induction t)
        (auto simp: sorted_append set_inorder intro: less_imp_le less_trans)

   lemma bst_build: "bst (build xs)"
     by (induction xs) (auto simp: bst_tinsert)

   lemma set_of_build: "set_of (build xs) = set xs"
     by (induction xs) (auto simp: set_of_tinsert)

   lemma "sorted (tsort xs) ∧ set (tsort xs) = set xs"
     by (simp add: tsort_def sorted_inorder bst_build set_inorder set_of_build)
   ```

   `sorted_inorder` 是难点。仅凭 `sorted_append` 和 `set_inorder`，`auto` 在涉及左子树键 x 和右子树键 xa 的目标 `x ≤ xa` 处停止。其前提说明左子树的所有键均小于节点处的键 x2 且右子树的所有键均大于该键，即 `x < x2` 和 `x2 < xa`，但 `auto` 未能将两者链接。库规则 `less_trans`（由 `x < y` 和 `y < z` 推导 `x < z`）与 `less_imp_le`（由 `x < y` 推导 `x ≤ y`）在 Module 9 中随 `intro:` 提供给 `auto`，从而补全缺失步骤。

2. Quickcheck 立即反驳排序规范：

   ```isabelle
   lemma "mset (tsort xs) = mset xs"
     quickcheck
     oops
   ```

   ```output result
   Testing conjecture with Quickcheck-exhaustive...

   Quickcheck found a counterexample:
     xs = [a⇩1, a⇩1]
   Evaluated terms:
     mset (tsort xs) = mset [a⇩1]
     mset xs = mset [a⇩1, a⇩1]
   ```

   搜索树存储一个集合：`tinsert` 在键已存在时使树保持不变。因此 `tsort` 移除重复项。它满足与集合相关的弱规约，这正是该规约过于薄弱的原因。
:::
::::

## 自测题 {#quiz}

```quiz
? 程序的正确性定理断言了什么？
- [ ] 程序通过其所有测试
- [ ] 规范说明了用户的期望
- [x] 对于满足定理前提的每个输入，其结果具有指定的性质
- [ ] 程序在每个输入上快速终止
> 定理在所述假设与前置条件下连接实现与规约。规约是否满足用户需求属于验证。

? `sort_drop xs = []` 对于每个列表，它满足排序规范的哪一半？
- [x] `sorted (sort_drop xs)`，但非`mset (sort_drop xs) = mset xs`
- [ ] `mset (sort_drop xs) = mset xs`，但非`sorted (sort_drop xs)`
- [ ] 两个半部分
- [ ] 两部分都捕捉不到这个问题
> 空列表是有序的，但不是任何非空列表的排列。只有排列条件能发现这个问题。

? 为什么排序规范使用 `mset` 而不是 `set`？
- [ ] `set` 不能用于 Isabelle 证明
- [ ] `mset` 使证明更简洁
- [ ] `set` 不允许对元素进行重排序
- [x] 借助 `set`，一个去除重复元素的函数将满足规范
> `set [2, 1, 2] = set [1, 2]`，所以集合无法分辨相同元素中是否少了一份。多重集会记录每个元素出现的次数。

? 搜索仅在满足不变式 `bst` 的树上正确。为何 `bst` 将节点的键与其所有子树中的键进行比较，而不仅仅是其子节点？
- [ ] 与仅考虑子节点相比，会使 `bst` 无法计算
- [x] 一棵树可以使得每个节点都按序排列于其子节点之间，但仍可能在祖先的某一侧存在错误的键，从而导致搜索失败。
- [ ] Isabelle 无法表达与子级的比较
- [ ] 这无关紧要；两个不变式均使搜索正确
> Quickcheck 为 `bst_local` 找到了这样一棵树：a₁ 位于 a₂ 的右子树中，尽管它比 a₂ 小，因此搜索向左进行并错过了它。

? `list_of (Queue [1, 2] [5, 4, 3])`是什么？
- [ ] `[1, 2, 5, 4, 3]`
- [ ] `[3, 4, 5, 1, 2]`
- [x] `[1, 2, 3, 4, 5]`
- [ ] `[5, 4, 3, 2, 1]`
> 抽象函数是`f @ rev b`：前接列表后跟反向的后接列表。

? `export_code` 为已验证函数生成 Haskell 代码。哪个陈述正确？
- [ ] Haskell 代码由 Isabelle 的 kernel 检查
- [ ] 生成的程序永远不会崩溃或耗尽内存
- [ ] 由于代码生成器未经验证，程序没有任何保证
- [x] 程序返回的每个结果都与逻辑一致，前提是代码生成器、编译器和机器按假设工作
> 保证是相对于可信基的偏正确性，现在包括代码生成器和目标编译器。
```
