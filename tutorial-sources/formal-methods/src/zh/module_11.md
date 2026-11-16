---
title: 深入归纳
part: 3
lead: 学习当最直接的归纳卡住时该怎么办。你将从证明状态中看出归纳为什么失败，推广或加强断言，找出缺少的引理，沿着函数自身的递归做归纳，证明关于由规则定义的谓词的事实，并为每个目标选择合适的归纳方式。
minutes: 220
needs: 模块 5 和模块 7–10
goals:
  - 根据证明状态诊断卡住的归纳，并用 arbitrary 推广目标
  - 当归纳假设太弱时，加强断言，或者找出并证明一条辅助引理
  - 用规则 f.induct 做计算归纳，证明关于递归函数的事实
  - 用 inductive 定义谓词，并用规则归纳和规则反演对它们进行推理
  - 证明关于树的事实，并用 less_induct 做完全归纳
  - 选择适合目标的归纳方式
imports: Main
---

## 最直接的归纳卡住时 {#stuck}

在模块 5 中，你用 `by (induction xs) auto` 证明了关于每个列表的断言；在模块 10 中，你又用 Isar 逐个情形地写出了同样的证明。关于函数式程序的许多证明确实就这么短。但迟早会有这样的时候：你陈述了一个正确的断言，开始做归纳，Isabelle 却停在一个它证明不了的目标上。本模块讲的就是这一刻：怎样读懂卡住的目标，它告诉了你什么，以及怎样修改证明，让它能够通过。第四部分的验证工作也要靠这些技巧，例如模块 14 中编译器的证明，就建立在一个经过推广（generalise）的归纳之上。

回忆一下列表上的归纳证明是怎样进行的。要证明断言 $P\ xs$ 对每个列表都成立，你先对 `[]` 证明它，这是**基础情形**（base case）；再对 `x # xs` 证明它，同时可以假设它对 `xs` 成立，这是**归纳步骤**（induction step）。这个假设就是**归纳假设**（induction hypothesis），简写为 IH。整个模块都要记住一点：归纳假设就是断言本身，只不过针对的是更小的列表，**而其他每个变量都保持不变**。

### 累计求和 {#running-total}

模块 10 用 `mysum` 把账单上的各项加起来，它直接在列表上递归。而在 Python 这样的语言中，循环借助一个不断累加的总数来完成同样的工作：

```text
total = 0
for x in xs:
    total = total + x
return total
```

函数式程序没有循环。它使用一个递归函数，并多带一个参数，把累计的总数从一次调用传给下一次调用：

```isabelle
fun sumacc :: "nat list ⇒ nat ⇒ nat" where
  "sumacc [] acc = acc"
| "sumacc (x # xs) acc = sumacc xs (acc + x)"
```

```output
consts
  sumacc :: "nat list ⇒ nat ⇒ nat"

Found termination order: "(λp. size_list size (fst p)) <*mlex*> {}"
```

```isabelle
value "sumacc [3, 1, 4] 0"
```

```output
"8"
  :: "nat"
```

::: definition 累加器与尾递归
**累加器**（accumulator）是函数在计算过程中用来逐步收集结果的参数。如果递归调用是一个函数所做的最后一件事，就称这个函数是**尾递归的**（tail-recursive）：调用返回之后不再有任何事要做，所以编译器可以把它当作循环来运行，而不必让调用栈增长。
:::

手工对 `sumacc [3, 1, 4] 0` 求值，每步用一个等式：

$$
\mathit{sumacc}\ [3,1,4]\ 0 = \mathit{sumacc}\ [1,4]\ 3 = \mathit{sumacc}\ [4]\ 4
= \mathit{sumacc}\ [\,]\ 8 = 8
$$

列表越来越短，累加器越来越大。库函数 `sum_list` 直接把一个列表中的数加起来，所以很自然的断言是：这个循环算出的总数与它相同，即 `sumacc xs 0 = sum_list xs`。

::: example 在纸上尝试证明
对 `xs` 做归纳，证明 `sumacc xs 0 = sum_list xs`。

- 基础情形：`sumacc [] 0 = 0`，并且 `sum_list [] = 0`。这一情形得证。
- 归纳步骤：设归纳假设 `sumacc xs 0 = sum_list xs` 成立，要证明 `sumacc (x # xs) 0 = sum_list (x # xs)`。右边是 `x + sum_list xs`。左边是 `sumacc xs (0 + x)`，也就是 `sumacc xs x`。所以你需要的是 `sumacc xs x = x + sum_list xs`。

归纳假设说的是累加器为 `0` 时 `sumacc xs` 返回什么，而归纳步骤需要的是累加器为 `x` 时的结果。两者对不上，证明就卡住了。
:::

### Isabelle 显示了什么 {#stuck-isabelle}

Isabelle 恰好卡在同一个地方。通常的一行证明失败了：

```isabelle fails
lemma "sumacc xs 0 = sum_list xs"
  by (induction xs) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀a xs. sumacc xs 0 = sum_list xs ⟹ sumacc xs a = a + sum_list xs
```

要看清卡在哪里，就用 `apply` 一步一步地执行证明：

```isabelle
lemma "sumacc xs 0 = sum_list xs"
  apply (induction xs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. sumacc [] 0 = sum_list []
 2. ⋀a xs.
       sumacc xs 0 = sum_list xs ⟹ sumacc (a # xs) 0 = sum_list (a # xs)
```

子目标 1 是基础情形，子目标 2 是归纳步骤。把子目标 2 读出来：“对任意的 `a` 和 `xs`，如果 `sumacc xs 0 = sum_list xs`，那么 `sumacc (a # xs) 0 = sum_list (a # xs)`”。Isabelle 把列表的头部叫做 `a`；归纳假设位于 ⟹ 的左边。现在让 `auto` 尽力而为：

```isabelle
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs. sumacc xs 0 = sum_list xs ⟹ sumacc xs a = a + sum_list xs
```

`auto` 解决了基础情形，并把归纳步骤化简到了它所能做到的程度。剩下的正是你在纸上遇到的那个目标：归纳假设说的是 `sumacc xs 0`，结论说的却是 `sumacc xs a`。任何重写都不能把一个变成另一个。只好放弃这个证明：

```isabelle
  oops
```

::: keyidea
卡住的目标不只是一次失败，它还带来了信息。把归纳假设和结论对照一下，问问它们有什么不同。这里两者在一个参数上不同：归纳假设把累加器固定为 `0`，而递归调用会改变它。如果一个函数在递归调用中改变了某个参数，断言就必须涉及这个参数的每一个值。
:::

## 推广与加强目标 {#generalise}

### 用变量代替常量 {#gen-variable}

上面 `sumacc [3, 1, 4] 0` 的求值过程提示了 `sumacc` 对任意累加器计算的是什么：累加器加上列表剩余部分之和。在每次调用中，`acc + sum_list xs` 都等于 8。所以一般的断言是

$$
\mathit{sumacc}\ xs\ acc = acc + \mathit{sum\_list}\ xs
$$

而原来的断言就是 `acc = 0` 的情形。用模块 5 的话说，这个一般的断言描述了循环的一个**不变式**（invariant）：“`acc + sum_list xs` 就是最终的总数”在第一次调用时成立，并且每次调用都把它传给下一次调用（图 11.1）。

::: figure id=fig-11-1
累加器在每次调用时都会改变。带 `0` 的断言只描述了第一次调用；一般的断言在每次调用时都成立，所以归纳假设可以用在下一次调用上。
:::

如果盲目地把 `0` 换成 `acc`，就会得到 `sumacc xs acc = sum_list xs`，而它是错的。在尝试证明一个推广之前，先测试它。Quickcheck（模块 9）立刻就能发现问题：

```isabelle
lemma "sumacc xs acc = sum_list xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = []
  acc = 1
Evaluated terms:
  sumacc xs acc = 1
  sum_list xs = 0
```

正确的推广能通过测试，那就试着证明它：

```isabelle
lemma "sumacc xs acc = acc + sum_list xs"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs.
       sumacc xs acc = acc + sum_list xs ⟹
       sumacc xs (acc + a) = acc + (a + sum_list xs)
```

```isabelle
  oops
```

还是卡住了，但目标变了。归纳假设说的是 `sumacc xs acc`，结论说的是 `sumacc xs (acc + a)`。原因在于：`acc` 是引理中的自由变元（free variable），所以在整个归纳过程中它都是**固定的**（fixed，见模块 7）。对 `xs` 做归纳，证明的是断言对某一个任意但固定的 `acc` 成立，而归纳假设说的也是这同一个 `acc`。

### 用 arbitrary 推广 {#arbitrary}

在纸上，补救的办法是对 `xs` 做归纳，**一次性地对 `acc` 的所有值**证明这个断言。这样，归纳假设说的就是“对每个 `acc'`，`sumacc xs acc' = acc' + sum_list xs`”，而归纳步骤取 `acc' = acc + x` 来使用它：

$$
\mathit{sumacc}\ (x \# xs)\ acc = \mathit{sumacc}\ xs\ (acc + x) \overset{\text{IH}}{=} (acc + x) +
\mathit{sum\_list}\ xs = acc + \mathit{sum\_list}\ (x \# xs)
$$

在 Isabelle 中，只要在归纳中加上 `arbitrary: acc`，就能做到这一点：

```isabelle
lemma "sumacc xs acc = acc + sum_list xs"
  apply (induction xs arbitrary: acc)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀acc. sumacc [] acc = acc + sum_list []
 2. ⋀a xs acc.
       (⋀acc. sumacc xs acc = acc + sum_list xs) ⟹
       sumacc (a # xs) acc = acc + sum_list (a # xs)
```

现在子目标 2 中的归纳假设是 `(⋀acc. sumacc xs acc = acc + sum_list xs)`，读作“对任意的 `acc`，`sumacc xs acc = acc + sum_list xs`”（模块 7）：它对 `acc` 的每个值都成立。化简器可以把它用于任何累加器，特别是 `acc + a`：

```isabelle
  apply auto
  done
```

::: definition 推广归纳
`induction x arbitrary: y₁ … yₖ` 对 `x` 做归纳，一次性地对 `y₁ … yₖ` 的所有值证明目标。在每个情形中，变量 `y₁ … yₖ` 在归纳假设中都由 ⋀ 约束，所以归纳假设可以用于任意的值，而不只是结论中出现的那些值。
:::

下面是同一个证明的 Isar 版本，其中归纳步骤写成了一串等式。第二步用的是归纳假设，只是用 `acc + x` 代替了 `acc`：

```isabelle
lemma sumacc_sum: "sumacc xs acc = acc + sum_list xs"
proof (induction xs arbitrary: acc)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "sumacc (x # xs) acc = sumacc xs (acc + x)" by simp
  also have "… = (acc + x) + sum_list xs" by (rule Cons.IH)
  also have "… = acc + sum_list (x # xs)" by simp
  finally show ?case .
qed
```

你最初想要的断言，现在可以由这个一般的断言推出：

```isabelle
lemma sumacc_total: "sumacc xs 0 = sum_list xs"
  by (simp add: sumacc_sum)
```

::: trouble
如果去掉 `arbitrary: acc`，Isar 证明就会在使用归纳假设的那一步失败：

```isabelle fails
lemma "sumacc xs acc = acc + sum_list xs"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "sumacc (x # xs) acc = sumacc xs (acc + x)" by simp
  also have "… = (acc + x) + sum_list xs" by (rule Cons.IH)
  also have "… = acc + sum_list (x # xs)" by simp
  finally show ?case .
qed
```

```output result
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. sumacc xs (acc + x) = acc + x + sum_list xs
```

目标说的是 `acc + x`，而 `Cons.IH` 只涉及那个固定的 `acc`，所以这条规则对不上。当带着归纳假设的 `rule` 像这样失败时，检查一下是否有某个变量需要推广。
:::

::: tip
哪些变量应该写在 `arbitrary:` 后面？是那些在递归调用中会改变的变量，这里就是累加器。看一看定义等式的右边：每个没有原样传下去的参数都是候选者。永远不要把归纳变量本身列进去。推广一个本不需要推广的变量，很少会让证明失败，但它会增加 ⋀ 量词，而自动化工具随后必须把它们实例化。
:::

### 加强陈述 {#strengthen}

有时没有哪个变量需要推广，归纳却还是卡住了，因为断言太**弱**，不能充当有用的归纳假设。一个小小的数学例子可以说明这种现象。

```isabelle
fun oddsum :: "nat ⇒ nat" where
  "oddsum 0 = 0"
| "oddsum (Suc n) = oddsum n + (2 * n + 1)"
```

`oddsum n` 把前 `n` 个奇数加起来，即 $1 + 3 + \dots + (2n - 1)$：

```isabelle
value "oddsum 4"
```

```output
"16"
  :: "nat"
```

::: example 一个太弱的断言
断言：前 $n$ 个奇数之和是一个完全平方数，即 $\exists k.\ \mathit{oddsum}\ n = k \cdot k$（读作“存在一个 $k$，使得……”）。试着对 $n$ 做归纳。取 $k = 0$，基础情形成立。在归纳步骤中，归纳假设说的是对**某个** $k$ 有 $\mathit{oddsum}\ n = k \cdot k$，而你必须证明 $k \cdot k + 2n + 1$ 是一个平方数。当 $k = n$ 时这是对的，但归纳假设并没有说这个 $k$ 是哪一个。它恰好丢掉了归纳步骤所需要的那个事实。

现在断言得更多一些：$\mathit{oddsum}\ n = n \cdot n$。归纳假设变成了 $\mathit{oddsum}\ n = n \cdot n$，而归纳步骤只是算术：$n \cdot n + 2n + 1 = (n + 1) \cdot (n + 1)$。更强的断言反而更容易证明，而较弱的断言取 $k = n$ 就能由它推出。
:::

Isabelle 直接显示出了被丢掉的事实。`auto` 之后，归纳假设提到的是某个与 `n` 无关的 `k`：

```isabelle
lemma "∃k. oddsum n = k * k"
  apply (induction n)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀n k. oddsum n = k * k ⟹ ∃ka. Suc (k * k + 2 * n) = ka * ka
```

```isabelle
  oops
```

加强后的断言可以证明，而较弱的断言用 `blast` 就能推出，`blast` 会找到见证（witness）`n`：

```isabelle
lemma oddsum_square: "oddsum n = n * n"
  by (induction n) auto

lemma "∃k. oddsum n = k * k"
  using oddsum_square by blast
```

::: note
数学家乔治·波利亚（George Pólya）在 1945 年出版的《怎样解题》（How to Solve It）中，把这种现象称为**发明者悖论**（inventor's paradox）：越是雄心勃勃的计划，成功的机会可能越大。在归纳中，原因一目了然：你要证明的东西，也正是你在归纳步骤中可以假设的东西，所以更强的断言会给你更强的归纳假设。用 `arbitrary:` 做推广也是同样的道理：对所有累加器成立的断言，比只对一个累加器成立的断言更强。
:::

## 辅助引理 {#lemmas}

推广改变的是断言。有时断言本身没有问题，而是归纳步骤需要一个关于另一个函数的事实，化简器却不知道这个事实。你在模块 5 中遇到过这种情况：把一个列表反转两次，需要一条关于“连接后的反转”的引理，而卡住的目标正指向了它。本节把这一经验发展成一套方法，并把它用到一个新例子上。

二进制计数器把一个数存成由位组成的列表，最低位在前：`[True, False, True]` 表示 $1 + 0 \cdot 2 + 1 \cdot 4 = 5$。`val` 计算一个位列表的值，`inc` 把值加一并向后传递进位，而 `counter n` 是计数器从空列表开始、加了 `n` 次一之后显示的内容：

```isabelle
fun val :: "bool list ⇒ nat" where
  "val [] = 0"
| "val (b # bs) = (if b then 1 else 0) + 2 * val bs"

fun inc :: "bool list ⇒ bool list" where
  "inc [] = [True]"
| "inc (b # bs) = (if b then False # inc bs else True # bs)"

fun counter :: "nat ⇒ bool list" where
  "counter 0 = []"
| "counter (Suc n) = inc (counter n)"
```

```isabelle
value "counter 6"
```

```output
"[False, True, True]"
  :: "bool list"
```

6 的二进制是 110，而列表从右往左存放它的各位。计数器应该计数正确，即 `val (counter n) = n`：

```isabelle
lemma "val (counter n) = n"
  apply (induction n)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀n. val (counter n) = n ⟹ val (inc (counter n)) = Suc n
```

```isabelle
  oops
```

读一读卡住的目标。归纳假设是 `val (counter n) = n`，而结论需要的是 `val (inc (counter n)) = Suc n`。化简器知道 `inc` 作用在 `[]` 和 `b # bs` 上会得到什么，但 `counter n` 两者都不是，所以 `inc` 的等式一个也用不上。推广也帮不上忙：没有哪个变量被不恰当地固定了。缺少的是一个关于 `val` 和 `inc` 的事实。

是哪个事实？看看化简器动不了的那个子项 `val (inc (counter n))`。里面的 `counter n` 只是这个证明中碰巧出现的东西；这个事实应该对那个位置上的每个位列表都成立。把它写成 `bs`，再计算一个例子：

```isabelle
value "val (inc [True, True, False])"
```

```output
"4"
  :: "nat"
```

`[True, True, False]` 表示 3，加一之后得到 4。所以猜想是 `val (inc bs) = Suc (val bs)`：加一操作使值增加 1。在证明之前，先测试它：

```isabelle
lemma "val (inc bs) = Suc (val bs)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

没有反例。这条引理有它自己的一个简短的归纳证明：对位列表做归纳，其中 `auto` 把 `inc` 中的 `if` 拆成最低位的两种情况。属性 `[simp]` 把这条引理加入化简器的规则（模块 9），这样后面的证明就会自动使用它：

```isabelle
lemma val_inc [simp]: "val (inc bs) = Suc (val bs)"
  by (induction bs) auto

lemma val_counter: "val (counter n) = n"
  by (induction n) auto
```

有了这条引理，卡住的目标分两步就能重写完：由这条引理，`val (inc (counter n))` 变成 `Suc (val (counter n))`，再由归纳假设变成 `Suc n`。

::: keyidea
从卡住的目标到辅助引理（auxiliary lemma）：

1. 找出化简器无法重写的子项，例如 `val (inc (counter n))`。
2. 把其中专属于这个证明的部分换成新的变量（`counter n` 变成 `bs`）。
3. 用 `value` 算一些例子，猜出右边应该是什么，再用 `quickcheck` 测试这个猜想。
4. 证明这条引理，通常要用它自己的归纳；用 `[simp]` 或 `simp add:` 把它加进来，然后再试一次。
:::

对于库中的函数，你需要的引理通常已经存在。例如，模块 5 中那条关于连接后的反转的引理，库中就有针对 `rev` 的版本。`find_theorems`（模块 9）可以按模式搜索它；下划线代表任意的项：

```isabelle
find_theorems "rev (_ @ _)"
```

```output result
find_theorems
  "rev (_ @ _)"

found 1 theorem(s):
  List.rev_append: rev (?xs @ ?ys) = rev ?ys @ rev ?xs
```

::: pitfall
不要把卡住的目标本身当作引理来陈述。`val (inc (counter n)) = Suc n` 提到的是特定的列表 `counter n`，对 `n` 做归纳只会把问题挪个地方：它的归纳步骤需要的是 `val (inc (inc (counter n)))`。引理必须比目标更一般。Sledgehammer（模块 9）在这里也帮不上忙：它从已有的事实中搜索证明，而且不做归纳，所以它不能替你发明出 `val_inc`。
:::

## 树上的归纳 {#trees}

列表并不是唯一的数据结构。你在模块 5 中见过二叉树。每个模块都有自己的理论，所以本模块定义了自己的一份副本 `btree`，构造子（constructor）的名字也更短：`Lf`（leaf，叶子）对应模块 5 中的 `Tip`，`Nd`（node，结点）对应其中的 `Node`。下面是这种树上的四个函数：结点的个数、高度、镜像，以及中序遍历（先左子树，再结点，最后右子树）。

```isabelle
datatype 'a btree = Lf | Nd "'a btree" 'a "'a btree"

fun nodes :: "'a btree ⇒ nat" where
  "nodes Lf = 0"
| "nodes (Nd l x r) = nodes l + 1 + nodes r"

fun height :: "'a btree ⇒ nat" where
  "height Lf = 0"
| "height (Nd l x r) = max (height l) (height r) + 1"

fun mirror :: "'a btree ⇒ 'a btree" where
  "mirror Lf = Lf"
| "mirror (Nd l x r) = Nd (mirror r) x (mirror l)"

fun inorder :: "'a btree ⇒ 'a list" where
  "inorder Lf = []"
| "inorder (Nd l x r) = inorder l @ [x] @ inorder r"
```

```isabelle
value "inorder (mirror (Nd (Nd Lf 1 Lf) (2::nat) (Nd Lf 3 Lf)))"
```

```output
"[3, 2, 1]"
  :: "nat list"
```

把一棵树做镜像，它的遍历结果就会反过来。树上的归纳对每个构造子各有一个情形，而 `Nd` 的情形有两个归纳假设，每棵子树各一个：

```isabelle
lemma "inorder (mirror t) = rev (inorder t)"
  apply (induction t)
```

```output state
proof (prove)
goal (2 subgoals):
 1. inorder (mirror Lf) = rev (inorder Lf)
 2. ⋀t1 x2 t2.
       ⟦inorder (mirror t1) = rev (inorder t1);
        inorder (mirror t2) = rev (inorder t2)⟧
       ⟹ inorder (mirror (Nd t1 x2 t2)) = rev (inorder (Nd t1 x2 t2))
```

Isabelle 把结点的各个部分叫做 `t1`、`x2` 和 `t2`。两个归纳假设都要用到，`auto` 会把它们和你在上面找到的库引理 `rev_append` 一起使用：

```isabelle
  apply auto
  done
```

### 结点数与高度的关系 {#size-height}

高度为 $h$ 的树最多有 $2^h - 1$ 个结点：每一层最多能容纳上一层两倍的结点。不用减法写出来，就是 `nodes t < 2 ^ height t`。在纸上，归纳步骤是这样的。令 $h$ 为两棵子树高度中较大的那个。每棵子树的结点都少于 $2^h$ 个，因为它自己的高度至多是 $h$。所以整棵树至多有 $(2^h - 1) + 1 + (2^h - 1) = 2^{h+1} - 1$ 个结点，少于 $2^{h+1}$ 个。

自动证明找不到这个论证：

```isabelle
lemma "nodes t < 2 ^ height t"
  apply (induction t)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀t1 t2.
       ⟦nodes t1 < 2 ^ height t1; nodes t2 < 2 ^ height t2⟧
       ⟹ Suc (nodes t1 + nodes t2) < 2 * 2 ^ max (height t1) (height t2)
```

```isabelle
  oops
```

化简器已经展开了定义，但两个归纳假设提到的是 `2 ^ height t1` 和 `2 ^ height t2`，而结论提到的是 `2 ^ max (height t1) (height t2)`。缺少的一环是幂的单调性：$2^{a} \le 2^{\max\,a\,b}$。在 Isar 中，你可以分几小步把它补上。命令 `let ?h = "…"` 在证明内部给一个很长的项起一个简短的名字：

```isabelle
lemma nodes_height: "nodes t < 2 ^ height t"
proof (induction t)
  case Lf
  show ?case by simp
next
  case (Nd l x r)
  let ?h = "max (height l) (height r)"
  have "(2::nat) ^ height l ≤ 2 ^ ?h" by simp
  with Nd.IH(1) have l: "nodes l < 2 ^ ?h" by linarith
  have "(2::nat) ^ height r ≤ 2 ^ ?h" by simp
  with Nd.IH(2) have r: "nodes r < 2 ^ ?h" by linarith
  have "nodes (Nd l x r) = nodes l + 1 + nodes r" by simp
  also have "… < 2 ^ ?h + 2 ^ ?h" using l r by linarith
  also have "… = 2 ^ height (Nd l x r)" by simp
  finally show ?case .
qed
```

`Nd.IH(1)` 和 `Nd.IH(2)` 是两个归纳假设，分别对应 `l` 和 `r`，顺序与构造子的参数顺序一致。标注 `(2::nat)` 告诉 Isabelle，这些不等式说的是哪种数。

## 计算归纳 {#computation}

结构归纳法（structural induction）遵循数据的形状：每个构造子一个情形。很多函数并不是这样递归的。它们要往回看不止一步，或者接受两个参数，有时缩短这一个，有时缩短那一个，或者先检测一个条件。对于这样的函数，改为沿着函数自身的递归做归纳会更划算。

### 沿着 fib 的递归 {#fib}

模块 5 是先加强了断言，才证明了 `fib n < 2 ^ n`。对 `n` 做普通的归纳，只能得到关于 `n` 本身的归纳假设，而 `fib (Suc (Suc n))` 是由 `fib n` 和 `fib (Suc n)` 构成的。每个用 `fun` 定义的函数都附带一条沿着它自身递归进行的归纳规则（模块 8 提到过）；对 `fib` 来说，这条规则叫做 `fib.induct`：

```isabelle
fun fib :: "nat ⇒ nat" where
  "fib 0 = 0"
| "fib (Suc 0) = 1"
| "fib (Suc (Suc n)) = fib n + fib (Suc n)"

lemma "fib n < 2 ^ n"
  apply (induction n rule: fib.induct)
```

```output state
proof (prove)
goal (3 subgoals):
 1. fib 0 < 2 ^ 0
 2. fib (Suc 0) < 2 ^ Suc 0
 3. ⋀n. ⟦fib n < 2 ^ n; fib (Suc n) < 2 ^ Suc n⟧
        ⟹ fib (Suc (Suc n)) < 2 ^ Suc (Suc n)
```

`fib` 的每个等式各对应一个情形，而第三个情形有两个归纳假设，每个递归调用各一个：恰好是归纳步骤需要的那两个事实。原来的断言不必加强就能证明：

```isabelle
  apply auto
  done
```

### 两个列表上的函数 {#merge}

`merge` 把两个有序列表合并成一个有序列表，就像归并排序中那样。每一步它都比较两个列表的头部，取较小的那个：

```isabelle
fun merge :: "nat list ⇒ nat list ⇒ nat list" where
  "merge [] ys = ys"
| "merge xs [] = xs"
| "merge (x # xs) (y # ys) =
     (if x ≤ y then x # merge xs (y # ys) else y # merge (x # xs) ys)"
```

```output
consts
  merge :: "nat list ⇒ nat list ⇒ nat list"

Found termination order:
  "(λp. size_list size (snd p)) <*mlex*>
   (λp. size_list size (fst p)) <*mlex*> {}"
```

从终止序（termination order）可以看出，没有哪个参数在每次调用中都变小。第一个递归调用缩短第一个列表，第二个递归调用缩短第二个列表。Isabelle 用大小（`size_list`）来度量每个列表，并按字典序（`<*mlex*>`）把两个大小组合起来：在每次调用中，要么第二个列表变小，要么它保持不变而第一个列表变小。

```isabelle
value "merge [1, 4, 6] [2, 3, 7]"
```

```output
"[1, 2, 3, 4, 6, 7]"
  :: "nat list"
```

合并不应丢失任何元素：`length (merge xs ys) = length xs + length ys`。试试对 `xs` 做结构归纳，并且事先对 `ys` 做好推广：

```isabelle
lemma "length (merge xs ys) = length xs + length ys"
  apply (induction xs arbitrary: ys)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs ys.
       (⋀ys. length (merge xs ys) = length xs + length ys) ⟹
       length (merge (a # xs) ys) = Suc (length xs + length ys)
```

```isabelle
  oops
```

目标卡在 `merge (a # xs) ys` 上，因为只有知道了 `ys` 的形状，才能展开 `merge`。对 `ys` 分情况讨论可以走得更远一些，但在 `ys` 的头部较小的那个分支中，`merge` 又会用 `a # xs` 调用自己。这个列表并不比 `a # xs` 短，所以关于 `xs` 的归纳假设用不上。无论对哪个列表做结构归纳，都与这里的递归不匹配。

### 函数的归纳规则 {#f-induct}

和 `fib` 一样，`merge` 的归纳规则也沿着函数自身的递归进行。它叫做 `merge.induct`：

```isabelle
thm merge.induct
```

```output result
⟦⋀ys. ?P [] ys; ⋀v va. ?P (v # va) [];
 ⋀x xs y ys.
    ⟦x ≤ y ⟹ ?P xs (y # ys); ¬ x ≤ y ⟹ ?P (x # xs) ys⟧
    ⟹ ?P (x # xs) (y # ys)⟧
⟹ ?P ?a0.0 ?a1.0
```

从它的结论读起。要对所有参数证明 `?P ?a0.0 ?a1.0`，就要证明三个情形，每个定义等式各一个。第三个情形带有两个归纳假设，每个递归调用各一个，并且每个归纳假设都带着那次调用发生的条件：第一个调用是 `x ≤ y`，第二个调用是 `¬ x ≤ y`。图 11.2 展示了这种对应关系。

::: figure id=fig-11-2
`merge` 的计算归纳（computation induction）：每个等式对应一个情形，每个递归调用对应一个归纳假设，并以 `if` 的条件作为这个归纳假设的前提。在一次运行中，每次调用都会使两个列表中的某一个变短。
:::

情形 2 用的变量名是 `v` 和 `va`。`fun` 按顺序读这些等式，所以只有在第一个等式不适用时，也就是第一个列表不为空时，第二个等式才适用。`fun` 把第二个等式中的 `xs` 换成 `v # va`，从而把这一点明确地表达出来。你可以在 `merge.simps` 中看到结果，它就是 Isabelle 所存储的那些等式：

```isabelle
thm merge.simps
```

```output result
  merge [] ?ys = ?ys
  merge (?v # ?va) [] = ?v # ?va
  merge (?x # ?xs) (?y # ?ys) =
  (if ?x ≤ ?y then ?x # merge ?xs (?y # ?ys) else ?y # merge (?x # ?xs) ?ys)
```

现在应用这条规则。你要按照函数参数的顺序给出变量：

```isabelle
lemma "length (merge xs ys) = length xs + length ys"
  apply (induction xs ys rule: merge.induct)
```

```output state
proof (prove)
goal (3 subgoals):
 1. ⋀ys. length (merge [] ys) = length [] + length ys
 2. ⋀v va. length (merge (v # va) []) = length (v # va) + length []
 3. ⋀x xs y ys.
       ⟦x ≤ y ⟹ length (merge xs (y # ys)) = length xs + length (y # ys);
        ¬ x ≤ y ⟹ length (merge (x # xs) ys) = length (x # xs) + length ys⟧
       ⟹ length (merge (x # xs) (y # ys)) =
          length (x # xs) + length (y # ys)
```

```isabelle
  apply auto
  done
```

::: definition 计算归纳
对于用 `fun` 定义的函数 `f`，规则 `f.induct` 为每个定义等式各给出一个情形（重叠的等式事先已被改写成互不重叠的），并且在每个情形中，等式右边的每个递归调用各对应一个归纳假设，以导致这次调用的条件为前提。用法是 `induction x₁ … xₙ rule: f.induct`，其中 `x₁ … xₙ` 是目标中 `f` 的参数。这条规则是可靠的，因为 `f` 会终止：它就是沿着终止序进行的归纳。
:::

在 Isar 中，`merge.induct` 的情形按等式的顺序编号为 `1`、`2` 和 `3`。Isabelle/jEdit 在 `proof` 那一行显示的证明提纲（proof outline，模块 10）会列出这些情形。由于 `3.IH` 以数字开头，它必须写在引号里，即 `"3.IH"`，它的两个部分是 `"3.IH"(1)` 和 `"3.IH"(2)`：

```isabelle
lemma set_merge: "set (merge xs ys) = set xs ∪ set ys"
proof (induction xs ys rule: merge.induct)
  case (1 ys)
  show ?case by simp
next
  case (2 x xs)
  show ?case by simp
next
  case (3 x xs y ys)
  show ?case
  proof (cases "x ≤ y")
    case True
    then show ?thesis using "3.IH"(1) by auto
  next
    case False
    then show ?thesis using "3.IH"(2) by auto
  qed
qed
```

注意 `case (2 x xs)`：你可以把一个情形中的变量 `v va` 随意改成你喜欢的名字。

::: pitfall
- 如果不加引号，`3.IH` 就不会被当作一个名字来读，Isabelle 会报告一个令人困惑的错误，例如 `Bad context for command "qed"`（命令“qed”的上下文不正确）。要写成 `"3.IH"`。
- 按照函数参数的顺序给出变量。如果写成 `induction ys xs rule: merge.induct`，规则的各个情形就会与错误的变量相匹配，证明会失败，留下一些毫无意义的目标。
:::

## 归纳定义 {#inductive}

到目前为止，每个新概念都是一个函数：你说明了怎样计算它。而有些概念，更自然的描述方式是说明可以通过哪些途径**确立**它们。“0 是偶数；如果 $n$ 是偶数，那么 $n + 2$ 也是。”“空串是平衡的；把一个平衡的串放进一对括号里，得到的串是平衡的；把两个平衡的串并排放在一起，得到的串也是平衡的。”“每个状态都可以从它自身到达；如果 $b$ 可以从 $a$ 到达，并且一步就能从 $b$ 走到 $c$，那么 $c$ 可以从 $a$ 到达。”文法、状态机中的可达性、类型系统以及程序的含义，都是这样用**规则**来定义的。

::: definition 归纳定义
谓词 $I$ 的**归纳定义**（inductive definition）是一组规则，每条规则的形式都是
$$I\ a_1 \Imp \dots \Imp I\ a_n \Imp I\ a$$
这些规则称为**引入规则**（introduction rule）。其中 $n$ 可以为 0；一条规则还可以有其他不涉及 $I$ 的前提，称为附加条件（side condition）。$I\ x$ 成立，当且仅当它可以通过有限次应用规则推导出来。等价地说，$I$ 是在这些规则下封闭的**最小**谓词：规则迫使它成立的地方，它就成立，此外它都不成立。
:::

### 偶数 {#ev}

在 Isabelle 中，`inductive` 通过规则来定义谓词。每条规则都可以有一个名字：

```isabelle
inductive ev :: "nat ⇒ bool" where
  ev_0: "ev 0"
| ev_SS: "ev n ⟹ ev (Suc (Suc n))"
```

规则 `ev_0` 说 0 是偶数。规则 `ev_SS` 读作“如果 `n` 是偶数，那么 `n + 2` 是偶数”；⟹ 左边的公式是规则的**前提**（premise），右边的公式是规则的**结论**（conclusion）。Isabelle 先根据这些规则定义出 `ev`，再把这些规则作为定理证明出来，这与模块 1 讲的 LCF 方法一脉相承。把光标放在定义上，**Output**（输出）面板会报告各个步骤：“Proving monotonicity”（正在证明单调性）、“Proving the introduction rules”（正在证明引入规则）等等。可以用 `ev.intros` 来引用这些规则：

```isabelle
thm ev.intros
```

```output result
  ev 0
  ev ?n ⟹ ev (Suc (Suc ?n))
```

**推导**（derivation）把规则组合成一棵树，就像模块 6 中的证明树：每次应用规则，都在它的前提下面画一条横线，结论写在横线下方。下面是 4 为偶数的推导：

```prooftree
ev 4   (ev_SS)
  ev 2   (ev_SS)
    ev 0   (ev_0)
```

在 Isabelle 中，要像模块 7 那样反向应用这些规则。用 `Suc` 来写这个数，原因见下面的**如果出了问题**框：

```isabelle
lemma "ev (Suc (Suc (Suc (Suc 0))))"
  apply (rule ev_SS)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ev (Suc (Suc 0))
```

```isabelle
  apply (rule ev_SS)
  apply (rule ev_0)
  done
```

每个 `rule` 步骤对应推导中的一条横线，从下往上读。

::: trouble
如果用数字 `4`，第一步就会失败：

```isabelle fails
lemma "ev 4"
  apply (rule ev_SS)
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. ev 4
```

`rule` 必须通过实例化 `?n`，使目标 `ev 4` 和结论 `ev (Suc (Suc ?n))` 完全相同。这是语法上的事，而 `4` 并不是用 `Suc` 写成的。在这种匹配中不会做任何算术。要么用 `Suc` 来写这个数，要么先让化简器转换数字：`numeral_eq_Suc` 把一个数字重写成它的前驱的 `Suc`。

```isabelle
lemma "ev 4"
  by (simp add: ev.intros numeral_eq_Suc)
```
:::

### 规则归纳 {#rule-induction}

这些规则说明了怎样证明一个数是偶数。那么，怎样证明**每个**偶数都具有某个性质呢？每个事实 `ev n` 都有一个有限的推导，它最上面是 `ev_0`，往下是一步步的 `ev_SS`。如果某个性质对 `0` 成立，并且每次应用 `ev_SS` 都把它从 `n` 传给 `Suc (Suc n)`，那么它在每个推导的每一步上都成立，因而对每个偶数都成立。这就是对推导做的归纳（图 11.3）。

::: definition 规则归纳
要对一个归纳定义的 $I$ 证明 $I\ x \Imp P\ x$，**规则归纳**（rule induction）的做法是：对每条规则 $I\ a_1 \Imp \dots \Imp I\ a_n \Imp I\ a$，证明 $P\ a$ 可以由前提 $I\ a_1, …, I\ a_n$ 和归纳假设 $P\ a_1, …, P\ a_n$ 推出；规则的附加条件也可以作为假设使用。没有关于 $I$ 的前提的规则给出基础情形。
:::

::: figure id=fig-11-3
一个推导，这里推导的是第 11.7 节中的一个平衡的括号串。规则归纳由每条规则的前提所具有的性质，证明它的结论也具有这个性质，所以这个性质会沿着推导向下传递，一直传到根。
:::

Isabelle 生成的这条规则叫做 `ev.induct`：

```isabelle
thm ev.induct
```

```output result
⟦ev ?x; ?P 0; ⋀n. ⟦ev n; ?P n⟧ ⟹ ?P (Suc (Suc n))⟧ ⟹ ?P ?x
```

第一个前提 `ev ?x` 说明这条规则适用于偶数 `?x`。另外两个前提是各个情形：规则 `ev_0` 对应 `?P 0`；规则 `ev_SS` 对应从 `?P n` 到 `?P (Suc (Suc n))` 的一步，其中还可以假设 `ev n`。举个例子，库中把 `even n` 定义为“2 整除 n”。每个有推导的数在这个意义上都是偶数：

```isabelle
lemma "ev n ⟹ even n"
  apply (induction rule: ev.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. even 0
 2. ⋀n. ⟦ev n; even n⟧ ⟹ even (Suc (Suc n))
```

这个方法在前提中找到 `ev n`，并对它做归纳。子目标 2 有两个假设：`ev n` 是规则 `ev_SS` 的前提，`even n` 是归纳假设。`auto` 知道一个数加 2 之后仍是偶数：

```isabelle
  apply auto
  done
```

在 Isar 中，规则归纳的各个情形以规则的名字命名。在情形 `ev_SS` 中，归纳假设是 `ev_SS.IH`，规则的前提是 `ev_SS.hyps`：

```isabelle
lemma ev_even: "ev n ⟹ even n"
proof (induction rule: ev.induct)
  case ev_0
  show ?case by simp
next
  case (ev_SS n)
  from ev_SS.IH show ?case by simp
qed
```

如果陈述还有其他前提，它们就成为用归纳来证明的断言的一部分，并且在每个情形中都可以通过 `.prems` 使用。下面对 `ev m` 做规则归纳，证明两个偶数之和是偶数：

```isabelle
lemma ev_add: "ev m ⟹ ev n ⟹ ev (m + n)"
proof (induction rule: ev.induct)
  case ev_0
  then show ?case by simp
next
  case (ev_SS k)
  then have "ev (k + n)" by simp
  then show ?case by (simp add: ev.ev_SS)
qed
```

在情形 `ev_SS` 中，归纳假设是 `ev n ⟹ ev (k + n)`，前提 `ev n` 是 `ev_SS.prems`，`then` 把它们全部传给 `simp`。结论 `ev (Suc (Suc k) + n)` 由规则 `ev_SS` 得出，而这条规则现在必须写成 `ev.ev_SS`。

::: trouble
在证明内部，`case ev_SS` 以名字 `ev_SS` 引入一些事实，它们会遮住同名的规则。使用这个短名字，得到的是这个情形的事实，而不是那条规则：

```isabelle fails
lemma "ev m ⟹ ev n ⟹ ev (m + n)"
proof (induction rule: ev.induct)
  case ev_0
  then show ?case by simp
next
  case (ev_SS k)
  then have "ev (k + n)" by simp
  then show ?case by (simp add: ev_SS)
qed
```

```output result
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ev (Suc (Suc (k + n)))
```

要引用这条规则，请使用限定名 `ev.ev_SS`。
:::

### 规则反演 {#inversion}

规则归纳证明的是关于**所有**偶数的事实。而你常常是知道一个事实，比如 `ev (Suc (Suc n))`，想知道它蕴涵着什么。问一问：哪条规则可能推导出了它？不会是 `ev_0`，它的结论 `ev 0` 形状不对。只能是 `ev_SS`，而且只能来自前提 `ev n`。所以 `ev n` 成立。同样，根本没有哪条规则的结论具有 `ev (Suc 0)` 的形式，所以 `ev 1` 推导不出来：1 不是偶数。

::: definition 规则反演
**规则反演**（rule inversion）从一个事实 $I\ t$ 出发反向推理：它考察每一条结论可能与 $t$ 匹配的规则，并在每个这样的情形中断定这条规则的前提成立。结论无法与 $t$ 匹配的情形是不可能发生的，直接被排除。
:::

Isabelle 会为每个归纳定义生成一条通用的反演规则，对 `ev` 来说就是 `ev.cases`。命令 `inductive_cases` 则为某种特定形状的事实推导出专门的反演规则：

```isabelle
inductive_cases ev_SSE: "ev (Suc (Suc n))"
inductive_cases ev_1E: "ev (Suc 0)"
```

```output all
theorem ev_SSE: ⟦ev (Suc (Suc ?n)); ev ?n ⟹ ?P⟧ ⟹ ?P

theorem ev_1E: ev (Suc 0) ⟹ ?P
```

`ev_SSE` 说的是：由 `ev (Suc (Suc n))` 可以推出任何能由 `ev n` 推出的 `?P`。`ev_1E` 没有剩下任何情形，所以由 `ev (Suc 0)` 可以推出任何东西。这样的规则是**消去规则**（elimination rule，模块 7），用 `elim:` 把它们交给 `auto`。下面是一个否定的事实，没有哪条引入规则能证明它：

```isabelle
lemma "¬ ev (Suc (Suc (Suc 0)))"
  by (auto elim: ev_SSE ev_1E)
```

在 Isar 中，把这个事实传给 `proof cases`。不可能的情形 `ev_0` 不需要证明；只剩下 `ev_SS`：

```isabelle
lemma ev_SS_inv: "ev (Suc (Suc n)) ⟹ ev n"
proof -
  assume "ev (Suc (Suc n))"
  then show "ev n"
  proof cases
    case ev_SS
    then show ?thesis by simp
  qed
qed
```

如果没有任何情形是可能的，`cases` 会自己了结这个目标：

```isabelle
lemma "¬ ev (Suc 0)"
proof
  assume "ev (Suc 0)"
  then show False by cases
qed
```

### 归纳定义还是递归定义？ {#versus}

你也可以改用递归函数来定义“偶数”，分别为 `0`、`Suc 0` 和 `Suc (Suc n)` 给出等式。两种风格各有用处：

| | 归纳定义（`inductive`） | 递归定义（`fun`） |
|---|---|---|
| 你写的是 | 构造证据的规则 | 进行计算的等式 |
| 终止性 | 不需要 | 必须证明 |
| 肯定的事实（`ev 4`） | 应用规则 | 求值 |
| 否定的事实（`¬ ev 3`） | 规则反演 | 求值 |
| 关于所有成员的事实 | 规则归纳 | 计算归纳 |
| `value` | 默认不能用 | 可以用 |

最后一行值得演示一下。归纳定义的谓词不是程序，`value` 无法运行它：

```isabelle fails
value "ev (Suc (Suc 0))"
```

```output
*** No code equations for ev,
*** requested by dependencies
***
```

（Isabelle 可以用命令 `code_pred` 把许多归纳定义的谓词转换成程序；本系列用不到它。）如果这个概念是一个你想要运行的计算，就优先使用递归函数。如果不存在会终止的递归，就优先使用归纳定义，例如带有环路的状态机中的可达性、含有连接的文法、可能永远运行下去的程序的求值。这时规则归纳恰好给出那些要紧的情形。

::: pitfall
被定义的谓词在其规则的前提中只能**正向地**（positively）出现，不能出现在否定之下。像“如果 `odd' n` 不成立，那么 `odd' (Suc n)` 成立”这样的规则，描述不出一个最小的谓词，Isabelle 会拒绝它。Isabelle 照常开始各项证明，然后报告其中一项失败了。这项证明与其他证明并行运行，所以在你的屏幕上，这些消息出现的顺序可能不同。它证明不了的目标 `mono (…)` 说的是，规则必须是**单调的**（monotone）：当更多的事实 `odd' n` 成立时，规则推导出的结论不能因此变少。而否定的前提恰恰会造成这种情况。

```isabelle fails
inductive odd' :: "nat ⇒ bool" where
  "¬ odd' n ⟹ odd' (Suc n)"
```

```output varies
Proofs for inductive predicate(s) "odd'"

  Proving monotonicity ...

  Proving the introduction rules ...

  Proving the elimination rules ...

  Proving the induction rule ...

  Proving the simplification rules ...

*** Proof failed.
***  1. ⋀x y xa n. x (?x10 x y xa n) ⟶ y (?x10 x y xa n) ⟹ y n ⟶ x n
*** The error(s) above occurred for the goal statement⌂:
*** mono (λp x. ∃n. x = Suc n ∧ ¬ p n)
```
:::

## 可达性与文法 {#reach}

在验证中，有两类归纳定义会反复出现：迁移系统中的可达性，以及文法所生成的串。由它们引出的规则归纳，同样需要第 11.2 节的技巧。

### 可达性 {#closure}

**迁移关系**（transition relation）`r` 说明哪个状态可以跟在哪个状态之后：`r a b` 表示一步就能从 `a` 走到 `b`。从 `a` 可达的状态，就是经过零步或多步能够到达的那些状态。这就是模块 4 中 `r` 的自反传递闭包，这里写成一个归纳定义的谓词：

```isabelle
inductive steps :: "('a ⇒ 'a ⇒ bool) ⇒ 'a ⇒ 'a ⇒ bool" for r where
  stay: "steps r a a"
| step: "r a b ⟹ steps r b c ⟹ steps r a c"
```

规则 `stay` 走零步。规则 `step` 先从 `a` 走一步到 `b`，再从 `b` 走任意多步到 `c`。子句 `for r` 声明 `r` 是一个固定的参数：与 `a`、`b`、`c` 不同，它在每条规则中都相同，这样 Isabelle 生成的归纳规则会更简单。模块 4 中库里的 `r⇧*` 也是用同样的方式定义的（用 `inductive_set`，在理论 `Transitive_Closure` 中），只不过它的第二条规则把多出来的那一步加在最后。

看一个来自问题跟踪系统的小型工作流。一个工单从**待办**（to do）转到**进行中**（doing），从**进行中**转到**审核**（review），再从**审核**退回**进行中**或者前进到**完成**（done）。这些迁移就是四条没有前提的规则：

```isabelle
datatype status = Todo | Doing | Review | Done

inductive move :: "status ⇒ status ⇒ bool" where
  "move Todo Doing"
| "move Doing Review"
| "move Review Doing"
| "move Review Done"
```

一个工单能够完成，`blast` 会根据这些规则找到推导：

```isabelle
lemma "steps move Todo Done"
  by (blast intro: move.intros step stay)
```

可达性是传递的。证明是对第一个前提做规则归纳：

```isabelle
lemma steps_trans: "steps r a b ⟹ steps r b c ⟹ steps r a c"
  apply (induction rule: steps.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀a. steps r a c ⟹ steps r a c
 2. ⋀a b ca.
       ⟦r a b; steps r b ca; steps r ca c ⟹ steps r b c; steps r ca c⟧
       ⟹ steps r a c
```

归纳是对 `steps r a b` 做的，所以用归纳证明的断言是“`steps r b c` 蕴涵 `steps r a c`”。子目标 1 是情形 `stay`。在子目标 2，即情形 `step` 中，Isabelle 把规则的第三个变量改名为 `ca`，因为引理中已经用了 `c`。假设包括规则的前提 `r a b` 和 `steps r b ca`、归纳假设 `steps r ca c ⟹ steps r b c`，以及引理的第二个前提 `steps r ca c`。由归纳假设和这个前提得到 `steps r b c`，再用规则 `step` 在前面加上第一步：

```isabelle
  apply (auto intro: step)
  done
```

::: trouble
`induction rule: steps.induct` 总是对**第一个**前提做归纳。如果把两个前提的顺序倒过来，它就会对错误的那个前提做归纳，证明也就失败了：

```isabelle fails
lemma "steps r b c ⟹ steps r a b ⟹ steps r a c"
  by (induction rule: steps.induct) (auto intro: step)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀aa b c.
***        ⟦r aa b; steps r b c; steps r a b ⟹ steps r a c; steps r a aa⟧
***        ⟹ steps r a c
```

把你要对之做归纳的那个前提放在最前面。
:::

### 前提中的常量 {#constants}

下面是这个工作流的一条安全性质（safety property）：已完成的工单会一直保持完成状态。最直接的规则归纳会产生毫无意义的目标：

```isabelle
lemma "steps move Done s ⟹ s = Done"
  apply (induction rule: steps.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀a. a = a
 2. ⋀a b c. ⟦move a b; steps move b c; c = b⟧ ⟹ c = a
```

```isabelle
  oops
```

子目标 2 要求由 `c = b` 证明 `c = a`，这一般是不成立的，而且 `Done` 不见了。规则 `steps.induct` 说的是对于**变量** `x` 和 `y` 的 `steps r x y`。当 `x` 的位置上是常量 `Done` 时，这个方法把目标中的每个 `Done` 都抽象成了规则中的变量，断言也就失去了原来的意义。补救的办法就是第 11.2 节的推广：用变量代替常量，并把它的值记录为一个前提。

```isabelle
lemma done_stays: "steps move a s ⟹ a = Done ⟹ s = Done"
  by (induction rule: steps.induct) (auto elim: move.cases)
```

在情形 `step` 中，等式 `a = Done` 把规则的前提变成 `move Done b`，而用 `move.cases` 做规则反演可以说明，没有哪个迁移能离开 `Done`：这个情形是不可能的。`induction` 方法也可以替你引入这个变量：在 `induction Done s rule: steps.induct` 中，不是变量的项代表一个新变量，并附带一个等式，这样得到的各个情形就都是对的：

```isabelle
lemma "steps move Done s ⟹ s = Done"
  apply (induction Done s rule: steps.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. Done = Done
 2. ⋀b c. ⟦move Done b; steps move b c; b = Done ⟹ c = Done⟧ ⟹ c = Done
```

```isabelle
  apply (auto elim: move.cases)
  done
```

::: pitfall
规则归纳要求归纳所针对的前提中是变量。如果某个参数是常量或复合项，就手工推广它（把 `a = Done` 作为额外的前提），或者在 `induction` 后面写出这些项。模块 13 在把状态写成有序对时会遇到同样的情况；对于初始状态，它则把初始状态直接写进可达性的定义，从而避开了这个问题。
:::

### 一个文法：平衡的括号 {#grammar}

上下文无关文法（context-free grammar）也是一种归纳定义。考虑由括号组成的串，用 `LP` 表示“(”，用 `RP` 表示“)”。平衡的括号串由文法 $B \to \varepsilon \mid (\,B\,) \mid B\,B$ 给出：

```isabelle
datatype paren = LP | RP

inductive bal :: "paren list ⇒ bool" where
  bal_nil: "bal []"
| bal_wrap: "bal w ⟹ bal (LP # w @ [RP])"
| bal_cat: "bal v ⟹ bal w ⟹ bal (v @ w)"
```

上面的图 11.3 展示了串 `(())()` 的一个推导。检查括号的程序并不搜索推导；它把串从头到尾读一遍，同时数着还有多少个括号没有闭合：

```isabelle
fun chk :: "paren list ⇒ nat ⇒ bool" where
  "chk [] n = (n = 0)"
| "chk (LP # w) n = chk w (Suc n)"
| "chk (RP # w) 0 = False"
| "chk (RP # w) (Suc n) = chk w n"
```

`chk w n` 在已有 `n` 个括号未闭合的情况下读串 `w`。在没有未闭合的括号时遇到右括号是一个错误，而读到最后，每个括号都必须已经闭合：

```isabelle
value "chk [LP, LP, RP, RP, LP, RP] 0"
```

```output
"True"
  :: "bool"
```

```isabelle
value "chk [RP, LP] 0"
```

```output
"False"
  :: "bool"
```

这个检查器对吗？先看一个方向：它接受每个平衡的串，即 `bal w ⟹ chk w 0`。对 `bal w` 做规则归纳会卡住：

```isabelle
lemma "bal w ⟹ chk w 0"
  apply (induction rule: bal.induct)
  apply auto
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀w. ⟦bal w; chk w 0⟧ ⟹ chk (w @ [RP]) (Suc 0)
 2. ⋀v w. ⟦bal v; chk v 0; bal w; chk w 0⟧ ⟹ chk (v @ w) 0
```

```isabelle
  oops
```

在子目标 1（规则 `bal_wrap`）中，归纳假设说的是从计数 0 开始单独读 `w`，而目标是在有一个括号未闭合的情况下读 `w`，然后再读闭合的 `RP`。子目标 2（规则 `bal_cat`）有同样的问题：`v` 后面还有别的括号。归纳假设在两个方面都太特殊了，所以把两者都推广。一个平衡的串，无论后面跟着什么，都不会改变计数：

```isabelle
lemma bal_chk: "bal w ⟹ chk (w @ v) n = chk v n"
  apply (induction arbitrary: v n rule: bal.induct)
```

```output state
proof (prove)
goal (3 subgoals):
 1. ⋀v n. chk ([] @ v) n = chk v n
 2. ⋀w v n.
       ⟦bal w; ⋀v n. chk (w @ v) n = chk v n⟧
       ⟹ chk ((LP # w @ [RP]) @ v) n = chk v n
 3. ⋀v w va n.
       ⟦bal v; ⋀va n. chk (v @ va) n = chk va n; bal w;
        ⋀v n. chk (w @ v) n = chk v n⟧
       ⟹ chk ((v @ w) @ va) n = chk va n
```

```isabelle
  apply auto
  done
```

现在每个归纳假设都对每个后续部分 `v` 和每个计数 `n` 成立，`auto` 会取各个情形所需的值来使用它们。关于检查器的断言就是 `v = []` 且 `n = 0` 的特例。属性 `[of w "[]" 0]` 按照 `bal_chk` 中各变量首次出现的顺序把它们实例化。命令 `corollary`（推论）和 `lemma` 的意思相同；这个名字表明，它是由前一个事实推出的事实：

```isabelle
corollary bal_chk0: "bal w ⟹ chk w 0"
  using bal_chk[of w "[]" 0] by simp
```

另一个方向，即检查器接受的每个串都是平衡的，也同样成立，但它的证明需要更多关于 `bal` 的引理；本模块略去不讲。

## 完全归纳法 {#complete}

有些论证需要的不是断言对 $n$ 的前驱成立，而是对某个更小的数成立。模块 5 把这种归纳叫做强归纳法；它也叫**完全归纳法**（complete induction）。

::: example 2 的幂
每个正整数都是 2 的某个幂乘以一个奇数：$40 = 2^3 \cdot 5$，$12 = 2^2 \cdot 3$，$7 = 2^0 \cdot 7$。在二进制中，这个幂的指数就是末尾 0 的个数：$40$ 是 $101000_2$，而 $101_2 = 5$。下面对 $n > 0$ 给出证明，假设断言对所有更小的正整数都成立：

- 如果 $n$ 是奇数，取 $2^0 \cdot n$。
- 如果 $n$ 是偶数，那么 $n = 2h$，其中 $0 < h < n$。由断言对 $h$ 成立，得 $h = 2^k \cdot m$，其中 $m$ 是奇数，所以 $n = 2^{k+1} \cdot m$。

知道断言对 $n - 1$ 成立是没有用的：39 的分解对 40 什么也说明不了。归纳步骤需要的是 $h = n / 2$。
:::

在 Isabelle 中，自然数上的完全归纳法就是规则 `less_induct`：

```isabelle
thm less_induct
```

```output result
(⋀x. (⋀y. y < x ⟹ ?P y) ⟹ ?P x) ⟹ ?P ?a
```

要证明 `?P ?a`，就对任意的 `x` 证明 `?P x`，同时可以假设 `?P y` 对每个 `y < x` 都成立。这条规则对每个其序为**良序**（well-order）的类型都成立；良序是没有无穷递降链（$x_1 > x_2 > x_3 > \dots$）的全序，`nat` 上的序就是一个良序。对于 `nat`，库中还有 `nat_less_induct`，它用 ∀ 陈述同一个原理。把规则应用到这个断言上：

```isabelle
lemma "0 < (n::nat) ⟹ ∃k m. n = 2 ^ k * m ∧ odd m"
  apply (induction n rule: less_induct)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x. ⟦⋀y. ⟦y < x; 0 < y⟧ ⟹ ∃k m. y = 2 ^ k * m ∧ odd m; 0 < x⟧
        ⟹ ∃k m. x = 2 ^ k * m ∧ odd m
```

```isabelle
  oops
```

前提 `0 < n` 已经成为断言的一部分：对于既小于 `x` 又是正数的 `y`，可以使用归纳假设。在 Isar 中，唯一的情形叫做 `less`，它的归纳假设是 `less.IH`：

```isabelle
lemma odd_part: "0 < (n::nat) ⟹ ∃k m. n = 2 ^ k * m ∧ odd m"
proof (induction n rule: less_induct)
  case (less n)
  show ?case
  proof (cases "even n")
    case False
    then have "n = 2 ^ 0 * n ∧ odd n" by simp
    then show ?thesis by blast
  next
    case True
    then obtain h where h: "n = 2 * h" by (rule evenE)
    with less.prems have "h < n" and "0 < h" by simp_all
    then obtain k m where "h = 2 ^ k * m ∧ odd m" using less.IH by blast
    with h have "n = 2 ^ Suc k * m ∧ odd m" by simp
    then show ?thesis by blast
  qed
qed
```

库中的规则 `evenE` 把 `even n` 变成一个满足 `n = 2 * h` 的见证 `h`。先证明 `h < n` 和 `0 < h` 这两个归纳假设所要求的条件，再把归纳假设应用到 `h` 上。一个 `have` 可以同时断言几个事实，它们用 `and` 连接；`simp_all`（模块 5）把两者都证明出来。

::: trouble
如果去掉标注 `(n::nat)`，归纳就会失败，并给出一条吓人的消息：

```isabelle fails
lemma "0 < n ⟹ ∃k m. n = 2 ^ k * m ∧ odd m"
  apply (induction n rule: less_induct)
```

```output
*** exception THM 0 raised⌂:
***   infer_instantiate_types: type ?'a of variable ?a
***   cannot be unified with type 'a of term n
***   (⋀x. (⋀y. y < x ⟹ ?P y) ⟹ ?P x) ⟹
***   ?P ?a
```

断言中的数可以属于任何带有 `0`、`^` 和 `odd` 的类型，所以 Isabelle 给 `n` 的类型是一个类型变量。在证明状态中，这个症状表现为 `(2::'a)`。`less_induct` 是针对良序类型陈述的，Isabelle 无法把它与一个一无所知的类型匹配起来。给变量加上标注 `(n::nat)`，错误就消失了。
:::

::: note
完全归纳法和计算归纳是近亲。`fib.induct` 和 `merge.induct` 就是沿着 `fib` 和 `merge` 的终止序进行的完全归纳，只是按照它们递归的形状做了剪裁。当一个函数在 `n div 2`、`n - 2` 或任何一种更短的列表上递归时，它自己的归纳规则通常就是最方便的完全归纳形式。练习 11.7 也用 `less_induct` 证明了 `fib` 的上界。
:::

## 选择归纳方式 {#choose}

大多数失败的归纳都可以归入少数几种模式。首先根据目标的形状选择归纳方式：

| 目标涉及 | 使用 | 在 Isabelle 中 |
|---|---|---|
| 每个构造子各用一个等式定义的函数 | 结构归纳法 | `induction xs` |
| 递归时会改变另一个参数的函数 | 结构归纳法，并做推广 | `induction xs arbitrary: acc` |
| 有自己独特递归模式的函数 | 计算归纳 | `induction xs ys rule: f.induct` |
| 一个前提 `I x`，其中 `I` 由 `inductive` 定义 | 规则归纳 | `induction rule: I.induct` |
| 单个事实 `I t` 蕴涵着什么 | 规则反演 | `cases`、`inductive_cases` |
| 需要某个更小的值的归纳步骤 | 完全归纳法 | `induction n rule: less_induct` |

然后，如果证明卡住了，就读一读卡住的目标，把归纳假设和结论对照一下：

| 卡住的目标显示 | 补救办法 |
|---|---|
| 归纳假设固定了一个参数（`0`、`[]`、`acc`），而结论需要这个参数取另一个值 | 推广：用变量代替常量，并使用 `arbitrary:` |
| 归纳假设是对的，但说得太少（`∃k. …`） | 加强断言 |
| 化简器无法重写的子项，例如 `val (inc (counter n))` | 一条经过推广的辅助引理，声明为 `[simp]` |
| 归纳假设涉及错误的参数，或者涉及错误的列表 | 计算归纳 |
| 规则归纳之后出现毫无意义的目标 | 让归纳所针对的前提中是变量，或者使用 `induction t rule: …` |
| 一个关于由构造子构成的项的事实 | 规则反演 |

::: tip
在动手写一个很长的证明之前，先用 `quickcheck` 检查断言，并在每个 `apply (induction …)` 之后试一试 `auto`。`auto` 留下的目标，是找出缺了什么的最快线索。
:::

## 小结 {#summary}

- 当**归纳假设**太弱时，归纳就会卡住。读一读卡住的目标，把归纳假设和结论对照一下：两者的差别会告诉你该改什么。
- 如果递归调用会改变某个参数，就像**累加器**那样，就把断言**推广**到这个参数的每一个值，并使用 `induction xs arbitrary: acc`；这时归纳假设由 ⋀ 约束。
- 如果归纳假设是对的但太弱，就**加强**断言（用 `oddsum n = n * n`，而不是“是一个平方数”）。
- 如果化简器无法重写像 `val (inc (counter n))` 这样的子项，就找一条**辅助引理**：推广这个子项，用 `value` 和 `quickcheck` 测试，证明它，再把它加入化简器。
- 树上的归纳每棵子树各有一个归纳假设（`Nd.IH(1)`、`Nd.IH(2)`）。
- 用 `rule: f.induct` 做**计算归纳**时，每个定义等式对应一个情形，每个递归调用对应一个归纳假设（`fib` 的最后一个情形有两个）；在 Isar 中，情形是编号的，而 `"3.IH"` 需要加引号。
- **归纳定义**（`inductive`）定义的是在其规则下封闭的最小谓词。**规则归纳**（`rule: I.induct`）证明关于它的所有成员的事实，作用于第一个前提，而这个前提的参数必须是变量；**规则反演**（`cases`、`inductive_cases`）从单个事实中得出结论，包括否定的事实。
- **完全归纳法**（`less_induct`）允许归纳步骤对任何更小的值使用断言。

## 练习 {#exercises}

:::: exercise 读懂卡住的目标 {#ex-11-1} ★
下面是一个尾递归的列表反转函数，它把第一个参数中的元素逐个堆到第二个参数上：

```isabelle
fun itrev :: "'a list ⇒ 'a list ⇒ 'a list" where
  "itrev [] ys = ys"
| "itrev (x # xs) ys = itrev xs (x # ys)"

lemma "itrev xs [] = rev xs"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs. itrev xs [] = rev xs ⟹ itrev xs [a] = rev xs @ [a]
```

```isabelle
  oops
```

1. 把归纳假设和结论对照一下。哪个参数不同？
2. 推广这个断言。对每个 `ys`，`itrev xs ys` 应该等于什么？用 `itrev [1, 2] [3]` 检验你的答案。
3. 证明这个一般的断言，并由它推出 `itrev xs [] = rev xs`。

::: solution
1. 归纳假设说的是 `itrev xs []`，结论说的是 `itrev xs [a]`：不同的是第二个参数，也就是累加器。
2. `itrev xs ys` 把 `xs` 反转后放到 `ys` 的前面：`itrev xs ys = rev xs @ ys`。例如，`itrev [1, 2] [3] = itrev [2] [1, 3] = itrev [] [2, 1, 3] = [2, 1, 3]`，而 `rev [1, 2] @ [3] = [2, 1, 3]`。取 `ys = []`，这个断言就变成原来的断言。
3. 累加器在递归调用中会改变，所以把它写在 `arbitrary:` 后面：

```isabelle
lemma itrev_rev: "itrev xs ys = rev xs @ ys"
  by (induction xs arbitrary: ys) auto

lemma "itrev xs [] = rev xs"
  by (simp add: itrev_rev)
```
:::
::::

:::: exercise 用哪种归纳？ {#ex-11-2} ★
对下面每个目标，说出你会首先尝试哪种归纳，以及对什么做归纳。使用本模块中的函数和谓词；库函数 `count_list xs z` 计算 z 在 xs 中出现的次数。

1. `nodes (mirror t) = nodes t`
2. `steps r a b ⟹ r b c ⟹ steps r a c`
3. `count_list (merge xs ys) z = count_list xs z + count_list ys z`
4. `sumacc (xs @ ys) acc = sumacc ys (sumacc xs acc)`
5. `ev n ⟹ ¬ ev (Suc n)`
6. `0 < n ⟹ n div 2 < n`，其中 n 是自然数

::: solution
1. 对 `t` 做结构归纳：`mirror` 和 `nodes` 都是每个构造子各有一个等式。
2. 对第一个前提 `steps r a b` 做规则归纳；`c` 只出现在结论和 `r b c` 中，而 `r b c` 会成为断言的一部分。
3. 用 `merge.induct` 对 `xs ys` 做计算归纳，就像第 11.5 节中关于 `length` 的证明那样。
4. 对 `xs` 做结构归纳，并加上 `arbitrary: acc`：累加器在递归调用中会改变。
5. 对 `ev n` 做规则归纳，两个情形中都要用到规则反演：`¬ ev (Suc 0)` 由 `ev_1E` 得出；在情形 `ev_SS` 中，由 `ev_SSE`，`ev (Suc (Suc (Suc n)))` 会推出 `ev (Suc n)`，与归纳假设矛盾。
6. 根本不需要归纳：这是关于 `div` 的线性算术，`simp` 或 `arith` 就能证明。并不是每个关于数的目标都需要归纳；先用自动化工具检查一下。

在 Isabelle 中，每个只需一行：

```isabelle
lemma "nodes (mirror t) = nodes t"
  by (induction t) auto

lemma "steps r a b ⟹ r b c ⟹ steps r a c"
  by (induction rule: steps.induct) (auto intro: step stay)

lemma "count_list (merge xs ys) z = count_list xs z + count_list ys z"
  by (induction xs ys rule: merge.induct) auto

lemma "sumacc (xs @ ys) acc = sumacc ys (sumacc xs acc)"
  by (induction xs arbitrary: acc) auto

lemma "ev n ⟹ ¬ ev (Suc n)"
  by (induction rule: ev.induct) (auto elim: ev_SSE ev_1E)

lemma "0 < n ⟹ (n::nat) div 2 < n"
  by simp
```
:::
::::

:::: exercise 两个推导 {#ex-11-3} ★
串 `()()()` 是平衡的。用 `bal` 的规则画出它的两个不同的推导。一个串可以有好几个推导，这对规则归纳有影响吗？

::: solution
用 ε 表示空串。两个推导都先用 `bal_wrap` 由 ε 推导出 `()`。然后：

- 推导 1：`bal_cat` 把 `()` 和 `()` 连接成 `()()`，第二次 `bal_cat` 再把 `()()` 和 `()` 连接成 `()()()`。
- 推导 2：`bal_cat` 把 `()` 和 `()` 连接成 `()()`，第二次 `bal_cat` 再把 `()` 和 `()()` 连接成 `()()()`。

它们的区别在于三个部分的组合方式，就像 $(a + b) + c$ 和 $a + (b + c)$ 那样。如果一个文法能为同一个串给出几个不同的推导，就称它是**有二义性的**（ambiguous）。这对规则归纳没有影响：证明表明**每条**规则都会把性质传递下去，所以无论存在的是哪个推导，性质都成立。
:::
::::

:::: exercise 用累加器展平树 {#ex-11-4} ★★
函数 `inorder` 在每个结点上都要用 `@`，这使它在大树上很慢。定义使用累加器的版本

```text
flat Lf acc = acc
flat (Nd l x r) acc = flat l (x # flat r acc)
```

并证明 `flat t [] = inorder t`。你需要做什么样的推广？

::: solution
`flat t acc` 把 `t` 的遍历结果放在 `acc` 的前面，所以一般的断言是 `flat t acc = inorder t @ acc`。在 `l` 上的递归调用传递的是一个不同的累加器 `x # flat r acc`，所以要推广 `acc`：

```isabelle
fun flat :: "'a btree ⇒ 'a list ⇒ 'a list" where
  "flat Lf acc = acc"
| "flat (Nd l x r) acc = flat l (x # flat r acc)"

lemma flat_inorder: "flat t acc = inorder t @ acc"
  by (induction t arbitrary: acc) auto

lemma "flat t [] = inorder t"
  by (simp add: flat_inorder)
```

在情形 `Nd` 中，关于 `r` 的归纳假设取累加器 `acc` 来使用，关于 `l` 的归纳假设则取 `x # flat r acc`。
:::
::::

:::: exercise 再谈偶数 {#ex-11-5} ★★
1. 证明 `ev (n + n)` 对每个 `n` 都成立。
2. 证明 `ev m ⟹ ev (m * n)`。这里哪种归纳最合适？你可以使用 `ev_add`。

::: solution
1. 对 `n` 做结构归纳。在归纳步骤中，`Suc n + Suc n` 化简为 `Suc (Suc (n + n))`，再对归纳假设应用规则 `ev_SS`：

```isabelle
lemma ev_double: "ev (n + n)"
proof (induction n)
  case 0
  show ?case by (simp add: ev_0)
next
  case (Suc n)
  then show ?case by (simp add: ev_SS)
qed
```

2. 对 `n` 做归纳，而不是对 `ev m` 做规则归纳：`m * Suc n` 化简为 `m + m * n`，再由 `ev_add` 把 `ev m` 和归纳假设 `ev (m * n)` 结合起来。（对 `ev m` 做规则归纳会得到 `ev (n + (n + k * n))`，那需要更多的引理。）

```isabelle
lemma "ev m ⟹ ev (m * n)"
proof (induction n)
  case 0
  show ?case by (simp add: ev_0)
next
  case (Suc n)
  then have "ev (m * n)" by simp
  with Suc.prems have "ev (m + m * n)" by (rule ev_add)
  then show ?case by simp
qed
```

在归纳步骤中，`Suc.IH` 是 `ev m ⟹ ev (m * n)`，`Suc.prems` 是 `ev m`；`then` 把两者都传给 `simp`。
:::
::::

:::: exercise 检查器拒绝的串 {#ex-11-6} ★★
证明 `¬ bal [RP, LP]` 和 `¬ bal [LP]`。在这里只用规则反演会很别扭：规则 `bal_cat` 可以用好几种方式拆分 `[RP, LP]`，其中包括 `[] @ [RP, LP]`，而这又回到了同一个问题。改用检查器吧。

::: solution
由 `bal_chk0`，平衡的串都能通过检查；而 `simp` 算出这两个串通不过检查：

```isabelle
lemma "¬ bal [RP, LP]"
proof
  assume "bal [RP, LP]"
  then have "chk [RP, LP] 0" by (rule bal_chk0)
  then show False by simp
qed

lemma "¬ bal [LP]"
proof
  assume "bal [LP]"
  then have "chk [LP] 0" by (rule bal_chk0)
  then show False by simp
qed
```

要说明某个东西不是成员，最简单的办法往往是借助一个已经证明的、所有成员都具有的性质（这里是“能通过检查”）。
:::
::::

:::: exercise 用完全归纳法证明斐波那契上界 {#ex-11-7} ★★
再证明一次模块 5 中的上界 `fib n < 2 ^ n`，这次用 `less_induct`。用 `cases n rule: fib.cases` 区分 `n` 的三种形式，`fib.cases` 为 `fib` 的每个等式各给出一个情形。

::: solution
在第三个情形中，`n = Suc (Suc k)`。`k` 和 `Suc k` 都比 `n` 小，所以归纳假设对两者都适用：

```isabelle
lemma "fib n < 2 ^ n"
proof (induction n rule: less_induct)
  case (less n)
  show ?case
  proof (cases n rule: fib.cases)
    case 1
    then show ?thesis by simp
  next
    case 2
    then show ?thesis by simp
  next
    case (3 k)
    have "fib k < 2 ^ k" by (rule less.IH) (simp add: 3)
    moreover have "fib (Suc k) < 2 ^ Suc k" by (rule less.IH) (simp add: 3)
    ultimately show ?thesis using 3 by simp
  qed
qed
```

Each IH is used as a rule: `rule less.IH` reduces `fib k < 2 ^ k` to `k < n`, which follows from the
case's fact `n = Suc (Suc k)`, named `3`. (Passing `less.IH` to `simp` instead does not work here: the
simplifier first rewrites `2 ^ Suc k` to `2 * 2 ^ k`, and then the IH no longer matches.) `fib.cases`
is the case analysis that `fun` generates together with `fib.induct`. Compare the three
proofs of the bound: by strengthening (Module 5), by computation induction (Section 11.5) and by
complete induction. Computation induction gives the shortest proof, because `fib.induct` provides
induction hypotheses for exactly the calls that `fib` makes.
:::
::::

:::: exercise Even in both senses {#ex-11-8} ★★★
Prove `even n ⟹ ev n` by complete induction, and conclude `ev n ⟷ even n`. Hint: for `n ≥ 2`, the
claim for `n - 2` helps.

::: solution
If `n = 0`, rule `ev_0` applies. Otherwise `n` is even and not 0, so it is at least 2: `n = Suc (Suc k)`
with `even k` and `k < n`. The IH gives `ev k`, and rule `ev_SS` gives `ev n`.

```isabelle
lemma even_ev: "even n ⟹ ev n"
proof (induction n rule: less_induct)
  case (less n)
  show ?case
  proof (cases n)
    case 0
    then show ?thesis by (simp add: ev_0)
  next
    case (Suc m)
    with less.prems obtain k where "n = Suc (Suc k)" by (cases m) auto
    with less.prems have "even k" and "k < n" by simp_all
    then have "ev k" using less.IH by blast
    with ‹n = Suc (Suc k)› show ?thesis by (simp add: ev_SS)
  qed
qed

lemma "ev n ⟷ even n"
  using ev_even even_ev by blast
```

`cases m` excludes `n = Suc 0`: then `n` would be odd, which contradicts `less.prems`. As in Module 10,
`‹n = Suc (Suc k)›` refers to the fact with that statement. Computation induction with a
function that recurses on `n - 2` would work as well; complete induction needs no extra function.
:::
::::

:::: exercise Merging sorted lists {#ex-11-9} ★★★
The point of `merge` is that it keeps lists sorted. Prove
`sorted xs ⟹ sorted ys ⟹ sorted (merge xs ys)` with the library's `sorted`. You will need `set_merge`
from Section 11.5. Why?

::: solution
Computation induction with `merge.induct`. In case 3 with `x ≤ y`, the result is
`x # merge xs (y # ys)`. It is sorted if `merge xs (y # ys)` is sorted (the IH) and `x` is at most every
element of `merge xs (y # ys)`. The second part is a statement about the *elements* of a merge, and
`set_merge` turns it into a statement about the elements of `xs` and `y # ys`, which the premises
cover. The case `¬ x ≤ y` is symmetric. `auto` does all of this:

```isabelle
lemma "sorted xs ⟹ sorted ys ⟹ sorted (merge xs ys)"
  by (induction xs ys rule: merge.induct) (auto simp: set_merge)
```

Without `set_merge`, the simplifier is stuck at goals about `set (merge xs (y # ys))`: this is the
auxiliary-lemma situation of Section 11.3, with the lemma already proved.
:::
::::

## Check yourself {#quiz}

```quiz
? An induction on `xs` gets stuck with the goal `⋀a xs. f xs 0 = g xs ⟹ f xs a = a + g xs`. What is the most likely fix?
- [ ] Add `f.simps` to the simplifier
- [ ] Use `less_induct` instead of structural induction
- [x] Generalise: prove the claim for every value of the second argument, with `arbitrary:`
- [ ] Use `blast` instead of `auto`
> The IH fixes the second argument to `0`, but the conclusion needs it with value `a`. The claim must speak about every value of that argument, and the induction must not fix it.

? What does `arbitrary: acc` change in an induction?
- [x] `acc` is bound by ⋀ in the induction hypothesis, so the hypothesis holds for every value of `acc`
- [ ] Isabelle chooses a value for `acc` that makes the proof work
- [ ] The induction is done on `acc` instead of the list
- [ ] `acc` is removed from the goal
> The claim is proved for all values of `acc` at once, so in the step the IH can be used with the value the recursive call passes, such as `acc + x`.

? How many cases and induction hypotheses does `f.induct` have for a function `f` defined by `fun`?
- [ ] One case per constructor of the argument type, one IH per case
- [ ] Always two cases, base and step
- [ ] One case per recursive call, no IH
- [x] One case per defining equation, one IH per recursive call in that equation
> Computation induction follows the recursion of the function. An IH can carry a condition, such as `x ≤ y`, when the call happens only under that condition.

? An inductive definition of `ev` has rules `ev 0` and `ev n ⟹ ev (Suc (Suc n))`. Why is `ev 1` false?
- [ ] Because `value "ev 1"` returns `False`
- [x] Because no derivation ends in `ev 1`: no rule has a conclusion of that form
- [ ] Because 1 is odd in the library
- [ ] It is not false; nothing excludes it
> The predicate holds exactly for what the rules can derive. Rule inversion makes this formal: no rule's conclusion matches `ev (Suc 0)`, so the fact is impossible.

? You try `apply (induction rule: steps.induct)` on `steps move Done s ⟹ s = Done` and get goals such as `c = b ⟹ c = a`. Why?
- [ ] The lemma is false
- [ ] Rule induction only works for `nat`
- [ ] `blast` should have been used first
- [x] The inductive premise has a constant where the rule expects a variable, so the claim lost its meaning
> Rule induction is about `steps r x y` for variables `x` and `y`. Generalise: state `steps move a s ⟹ a = Done ⟹ s = Done`, or write `induction Done s rule: steps.induct`.

? In a proof by `induction n rule: less_induct`, what may you assume when you prove the claim for `n`?
- [ ] The claim for `n - 1` only
- [ ] Nothing: `less_induct` has no induction hypothesis
- [x] The claim for every `y < n`
- [ ] The claim for every `y > n`
> Complete induction lets the step use any smaller value, such as `n div 2` or `n - 3`, not only the predecessor.
```
