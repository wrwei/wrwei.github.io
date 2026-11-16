---
title: 归纳与递归
part: 1
lead: 用递归定义数、列表和树上的函数，并一步一步地对它们求值；在纸上和 Isabelle 中用归纳法证明一个性质对每个输入都成立；并弄清为什么每个递归定义都必须终止。
minutes: 240
needs: 模块 1–4，尤其是良基关系（模块 4）
goals:
  - 用递归定义自然数、列表和二叉树上的函数，并通过重写对它们求值
  - 用归纳法证明一个陈述对每个自然数都成立，并指出其中的基础情形、归纳步骤和归纳假设
  - 使用强归纳法，以及列表和树上的结构归纳法
  - 解释为什么递归定义必须终止，并用度量论证终止性
  - 在 Isabelle 中用归纳法证明性质，并在证明状态中读出基础情形和归纳步骤
  - 用不变式说明：一个循环或一台机器无论运行多少步，某个性质都始终成立
imports: Main
---

## 递归定义 {#recursion}

循环把一项工作反复地做，直到做完为止。数学用另一种方式描述重复：**递归定义**（recursive definition）。它借助函数自身在更小参数上的值来定义这个函数。“和 0 + 1 + ⋯ + n 等于到 n − 1 为止的和，再加上 n”就是这样一个定义。递归定义简短而精确，而且可以直接拿来计算。与它配套的还有一种证明方法，即**归纳**（induction），它能一次性地证明一个陈述对无穷多个输入中的每一个都成立。

递归和归纳是 Isabelle/HOL 的核心。你在本系列中定义的函数几乎都是递归的，关于这些函数的证明也几乎都要用到归纳。本模块讲授这两者，先在纸上讲，再到 Isabelle 中做。

### 从零构造自然数 {#peano}

从 0 出发，反复加 1 足够多次，就能到达任何一个自然数：3 就是 0 + 1 + 1 + 1。朱塞佩·皮亚诺（Giuseppe Peano）在 1889 年把这一观察作为算术的基础，它也是本模块所有内容的基础。

::: definition 自然数
**自然数**（natural numbers）$\N = \{0, 1, 2, \dots\}$ 由两个构造子（constructor）构造而成：$0$ 是自然数；如果 $n$ 是自然数，那么它的**后继**（successor）$\mathit{Suc}\ n$（读作“n 的后继”）也是自然数，也就是 $n + 1$。除此之外没有别的自然数。不同的构造方式给出不同的数：$0 \neq \mathit{Suc}\ n$，并且只有当 $m = n$ 时才有 $\mathit{Suc}\ m = \mathit{Suc}\ n$。
:::

所以每个自然数要么是 0，要么是 `Suc m`，而且这样的 `m` 恰好只有一个：3 就是 `Suc (Suc (Suc 0))`。Isabelle 的类型 `nat` 正是这样构造的。它把数打印成通常的数字，但 `3` 和 `Suc (Suc (Suc 0))` 是同一个值：

```isabelle
value "Suc (Suc (Suc 0))"
```

```output
"3"
  :: "nat"
```

正因为每个数要么是 0，要么是某个数的后继，递归定义才行得通。要在整个 $\N$ 上定义一个函数，只需说明它在 0 处做什么，再借助它在 $n$ 处做的事，说明它在 $n + 1$ 处做什么。

### 数上的四个函数 {#nat-functions}

下面是和 $0 + 1 + \dots + n$ 的递归定义，我们把它叫做 $\mathit{sum\_upto}$：

$$
\begin{aligned}
\mathit{sum\_upto}(0) &= 0\\
\mathit{sum\_upto}(n+1) &= \mathit{sum\_upto}(n) + (n+1)
\end{aligned}
$$

第一个等式是**基础情形**（base case）。第二个等式是**递归情形**（recursive case），它用到 $n$ 为止的和来定义到 $n + 1$ 为止的和，而前者正是同一个问题的一个更小的实例。由于每个数要么是 0，要么对某个 $n$ 等于 $n + 1$，这两个等式覆盖了每一个数，而且每个数恰好只被覆盖一次。

::: definition 递归定义
**递归定义**用等式来定义一个函数，而这个函数本身也可以出现在等式的右边。这些等式覆盖每一个可能的参数。**基础情形**不使用这个函数；**递归情形**在更小的参数上调用它。
:::

另外三个函数也遵循同样的模式：阶乘 $n! = 1 \cdot 2 \cdot \ldots \cdot n$，这里叫做 $\mathit{fac}$；幂 $x^n$，叫做 $\mathit{pow}$；以及斐波那契数 0、1、1、2、3、5、8、13……，其中每个数都是它前面两个数之和。

| 函数 | 基础情形 | 递归情形 |
|---|---|---|
| 和 $0 + 1 + \dots + n$ | $\mathit{sum\_upto}(0) = 0$ | $\mathit{sum\_upto}(n+1) = \mathit{sum\_upto}(n) + (n+1)$ |
| 阶乘 $n!$ | $\mathit{fac}(0) = 1$ | $\mathit{fac}(n+1) = \mathit{fac}(n) \cdot (n+1)$ |
| 幂 $x^n$ | $\mathit{pow}(x, 0) = 1$ | $\mathit{pow}(x, n+1) = \mathit{pow}(x, n) \cdot x$ |
| 斐波那契数 | $\mathit{fib}(0) = 0$，$\mathit{fib}(1) = 1$ | $\mathit{fib}(n+2) = \mathit{fib}(n) + \mathit{fib}(n+1)$ |

$\mathit{pow}$ 有两个参数，递归作用在第二个参数（即指数）上；$x$ 在每次调用中都保持不变。$\mathit{fib}$ 需要两个基础情形，因为它的递归情形要往回看两步。

::: isabelle
在 Isabelle 中，`fun` 用这样的等式来定义函数，等式之间用 `|` 分隔。纸上写 $n + 1$ 的地方，模式（pattern）中写的是 `Suc n`：

```isabelle
fun sum_upto :: "nat ⇒ nat" where
  "sum_upto 0 = 0"
| "sum_upto (Suc n) = sum_upto n + Suc n"
```

```output
consts
  sum_upto :: "nat ⇒ nat"

Found termination order: "size <*mlex*> {}"
```

Isabelle 报告了新常量和它的类型，并说它找到了一个“终止序”（termination order）；第 5.7 节会解释这是什么意思。另外三个函数是：

```isabelle
fun fac :: "nat ⇒ nat" where
  "fac 0 = 1"
| "fac (Suc n) = fac n * Suc n"

fun pow :: "nat ⇒ nat ⇒ nat" where
  "pow x 0 = 1"
| "pow x (Suc n) = pow x n * x"

fun fib :: "nat ⇒ nat" where
  "fib 0 = 0"
| "fib (Suc 0) = 1"
| "fib (Suc (Suc n)) = fib n + fib (Suc n)"
```

模式 `Suc 0` 只匹配数 1，而 `Suc (Suc n)` 匹配从 2 开始的每个数，这时 `n` 比这个数小 2。现在来计算几个值：

```isabelle
value "[sum_upto 3, fac 5, pow 2 10, fib 10]"
```

```output
"[6, 120, 1024, 55]"
  :: "nat list"
```
:::

### 求值就是重写 {#rewriting}

怎样根据这些等式计算 $\mathit{sum\_upto}(3)$？把每个等式从左往右读，当作一条**重写规则**（rewrite rule）：只要某个项与等式的左边匹配，就可以把它替换成等式的右边。由于 $3 = 2 + 1$，递归情形在 $n = 2$ 时适用，依此类推，一直到 0：

$$
\begin{aligned}
\mathit{sum\_upto}(3) &= \mathit{sum\_upto}(2) + 3\\
&= \mathit{sum\_upto}(1) + 2 + 3\\
&= \mathit{sum\_upto}(0) + 1 + 2 + 3\\
&= 0 + 1 + 2 + 3\\
&= 6
\end{aligned}
$$

其中三步用的是递归情形，一步用的是基础情形，最后一步做算术。每一步都有一个等式作为依据，所以这一串等式同时也是 $\mathit{sum\_upto}(3) = 6$ 的一个证明。

::: definition 通过重写求值
通过**重写**（rewriting）对一个项**求值**（evaluate），就是反复地在项中选出与某个等式左边匹配的部分，把它替换成等式的右边，同时把等式中的变量替换成它们所匹配的那些部分。当再也没有等式可用时，这个项就是一个**值**（value），也就是结果。
:::

一个项中常常有好几个部分都可以重写。本模块的做法和大多数编程语言一样：先对调用的参数求值，再执行调用本身，这叫做**传值调用**（call by value）。也就是说，它总是重写最左边的、参数都已经是值的那个调用或算术运算。对本模块的函数来说，重写的顺序会改变你中途看到的项，但从不改变最终的值。

::: note
Isabelle 的 `value` 命令并不是一步一步地重写：它把等式转换成程序再运行，这要快得多。而化简器 `simp` 确实是在重写：它把每个用 `fun` 定义的函数的定义等式都用作重写规则，你会在第 5.4 节看到这一点。
:::

## 列表与树 {#data}

数由 `0` 和 `Suc` 构造而成。列表和树也以同样的方式由少数几个构造子构造而成，在它们上面的递归和在数上的递归完全一样。

### 列表 {#lists}

你在模块 1 中见过 Isabelle 的列表。列表有两个构造子：`[]` 是**空列表**（empty list），`x # xs`（读作“x cons xs”）把元素 `x` 放在列表 `xs` 的前面。列表 `[1, 2, 3]` 是 `1 # (2 # (3 # []))` 的简写，又因为 `#` 向右结合，你也可以把它写成 `1 # 2 # 3 # []`。一个列表的所有元素都具有相同的类型：`nat list` 是自然数列表的类型，`'a list`（读作“alpha list”）是元素属于某个类型 `'a` 的列表的类型。

::: definition 列表
每个列表要么是**空列表** `[]`，要么是 `x # xs`：把一个**头部**（head）`x` 放在一个**尾部**（tail）`xs` 的前面。除此之外没有别的列表，而且以不同方式构造的列表是不同的：`x # xs ≠ []`，并且只有当 `x = y` 且 `xs = ys` 时才有 `x # xs = y # ys`。
:::

```isabelle
value "1 # 2 # [3 :: nat]"
```

```output
"[1, 2, 3]"
  :: "nat list"
```

Isabelle 用简写形式打印结果。列表上的函数需要一个关于 `[]` 的等式和一个关于 `x # xs` 的等式。下面是四个这样的函数：列表的长度、连接两个列表、反转一个列表，以及一个数的列表中各数之和。

```isabelle
fun len :: "'a list ⇒ nat" where
  "len [] = 0"
| "len (x # xs) = len xs + 1"

fun app :: "'a list ⇒ 'a list ⇒ 'a list" where
  "app [] ys = ys"
| "app (x # xs) ys = x # app xs ys"

fun reverse :: "'a list ⇒ 'a list" where
  "reverse [] = []"
| "reverse (x # xs) = app (reverse xs) [x]"

fun lsum :: "nat list ⇒ nat" where
  "lsum [] = 0"
| "lsum (x # xs) = x + lsum xs"
```

`app` 的第二个等式可以这样读：要把 `x # xs` 放到 `ys` 前面，先把 `xs` 放到 `ys` 前面，再把 `x` 放到结果的前面。`reverse` 的第二个等式说：先反转尾部，再把头部接到末尾。本模块用函数名加编号来指称等式：`app.2` 是 `app` 的第二个等式。Isabelle 把它叫做 `app.simps(2)`。

库中已经有这四个函数，名字分别是 `length`、`@`（你在模块 1 中见过）、`rev` 和 `sum_list`。库中的理论 `List.thy` 正是用这些等式来定义 `@` 和 `rev` 的，例如 `[] @ ys = ys` 和 `(x # xs) @ ys = x # xs @ ys`；`length` 和 `sum_list` 的定义方式不同，但满足同样的等式。这里你自己定义它们的版本，一是为了看清它们是怎样工作的，二是因为这样一来，关于它们的每一个事实，Isabelle 都必须在你的帮助下从头证明。

`value` 不仅能处理数，也能处理变量：

```isabelle
value "reverse [a, b, c]"
```

```output
"[c, b, a]"
  :: "'a list"
```

### 二叉树：你的第一个数据类型 {#trees}

列表是**数据类型**（datatype）的一个例子：数据类型的值由构造子构造而成。你也可以定义自己的数据类型。一棵**二叉树**（binary tree）要么是空树，要么是一个结点，结点中存放一个元素和两棵更小的树，即它的左子树和右子树：

```isabelle
datatype 'a tree2 = Tip | Node "'a tree2" 'a "'a tree2"
```

这样读：元素类型为 `'a` 的树，要么是空树 `Tip`，要么是 `Node l x r`，其中有左子树 `l`、元素 `x` 和右子树 `r`。`Node` 的各个参数的类型写在它的名字后面；凡是不只是单个名字或类型变量的类型，都要放在引号里。Isabelle 自带一个关于树的库理论，其中的类型叫做 `tree`（它不属于 `Main`），所以这里的类型叫做 `tree2`，以便把两者区分开。

::: definition 数据类型
**数据类型**是一种类型，它的值由**构造子**构造而成。每个值都是通过有限次应用构造子得到的，而以不同方式构造的值是不同的。命令 `datatype` 引入一个新类型及其构造子，Isabelle 会自动证明：不同的构造子给出不同的值，并且每个构造子都是单射。
:::

图 5.1 左边的树有 4 个结点和 5 个 Tip。下面是树上的三个函数：`mirror` 在每一处交换左右，`nodes` 数结点的个数，`tips` 数 Tip 的个数。

```isabelle
fun mirror :: "'a tree2 ⇒ 'a tree2" where
  "mirror Tip = Tip"
| "mirror (Node l x r) = Node (mirror r) x (mirror l)"

fun nodes :: "'a tree2 ⇒ nat" where
  "nodes Tip = 0"
| "nodes (Node l x r) = nodes l + nodes r + 1"

fun tips :: "'a tree2 ⇒ nat" where
  "tips Tip = 1"
| "tips (Node l x r) = tips l + tips r"
```

每个递归情形都调用函数两次，每棵子树各一次。两棵子树都比原来的树小，而这就是递归定义所需要的全部条件。

::: figure id=fig-05-1
一棵树 `t` 和它的镜像。Tip 画成小方块。`mirror` 在每个结点处交换左右子树：含有 4 和 3 的那棵子树移到了左边，并且在移动的同时，它自身也被镜像了。
:::

```isabelle
value "mirror (Node (Node Tip 1 Tip) 2 (Node (Node Tip 3 Tip) 4 Tip) :: nat tree2)"
```

```output
"Node (Node Tip 4 (Node Tip 3 Tip)) 2 (Node Tip 1 Tip)"
  :: "nat tree2"
```

标注 `:: nat tree2` 说明元素是自然数，就像模块 1 中的 `:: nat` 对数所起的作用一样。

### 逐步查看求值 {#stepper}

在列表和树上，重写的方式和在数上完全一样。下面是 `reverse [1, 2]` 的求值过程，每步用一个等式，右边注明所用的等式：

```text
  reverse [1, 2]
= app (reverse [2]) [1]             由 reverse.2
= app (app (reverse []) [2]) [1]    由 reverse.2
= app (app [] [2]) [1]              由 reverse.1
= app [2] [1]                       由 app.1
= 2 # app [] [1]                    由 app.2
= 2 # [1]                           由 app.1
```

而 `2 # [1]` 就是列表 `[2, 1]`。注意 `reverse` 是怎样先堆起一串对 `app` 的调用，然后才开始连接的。下面的单步求值器可以对本模块的每个函数做这样的求值。

::: widget name=eval-stepper
选择一个函数和它的参数，然后按**下一步**，重写项中高亮的部分；所用的等式会在上方的定义中亮起。先从 `sum_upto` 和 3 开始，再试试 `reverse` 和 `[1, 2, 3]`，以及 `mirror` 和图 5.1 中的树。最后选择 `fib` 和 5，按**运行到底**，看一看调用的次数。然后再试试 `fib` 和 10。
:::

`fib` 的调用次数暴露了一个问题。`fib 5` 调用 `fib 3` 和 `fib 4`；但 `fib 4` 又会调用 `fib 3`，把第一次调用已经算过的东西全部从头再算一遍（图 5.2）。调用次数的增长和斐波那契数本身一样快：计算 `fib n` 需要 $2 \cdot \mathit{fib}(n+1) - 1$ 次调用，`fib 5` 需要 15 次，`fib 30` 则需要超过 260 万次。

::: figure id=fig-05-2
计算 `fib 5` 时发生的调用。每次用 2 或更大的数调用 `fib`，都会再引发两次调用。`fib 3` 被计算了两次，`fib 2` 被计算了三次，每次都是从头算起。
:::

作为定义，`fib` 没有问题：它准确地说明了斐波那契数是什么。但作为程序，它很慢。一个记住最近两个值的程序只需大约 n 步就能算出 `fib n`。证明这样一个更快的程序和那个清晰的定义计算的是同一个函数，是一项典型的验证任务，模块 11 和模块 12 会做这样的证明。

## 数学归纳法 {#induction}

对任何一个具体的 $n$，`value` 都能算出 $\mathit{sum\_upto}(n)$，测试也能做到。但像“对每个 $n$，$2 \cdot \mathit{sum\_upto}(n) = n \cdot (n+1)$”这样的断言涉及无穷多个数，而正如模块 1 所说，再多的测试也覆盖不了所有的数。你需要一个对所有的 $n$ 一次性成立的论证。数学归纳法（mathematical induction）就是这样一种论证。

### 原理 {#principle}

假设你已经证明了两件事：断言对 0 成立；并且只要它对某个数 $n$ 成立，它就对 $n + 1$ 也成立。那么它对 0 成立，因而对 1 成立，因而对 2 成立，依此类推。从 0 出发，经过有限次 $+1$ 就能到达每一个自然数，所以断言能一直传递到每一个数。图 5.3 给出了常用的比喻：一排多米诺骨牌。

::: figure id=fig-05-3
把归纳看作一排多米诺骨牌。基础情形推倒第一块骨牌。归纳步骤是说，任何一块倒下的骨牌都会推倒下一块。两者合在一起，就使每一块骨牌都倒下，无论它在这一排中离起点多远。
:::

::: fact 数学归纳法
设 $P(n)$ 是关于自然数 $n$ 的一个陈述。如果

1. **基础情形**：$P(0)$ 成立，并且
2. **归纳步骤**（induction step）：对每个 $n$，$P(n)$ 蕴涵 $P(n+1)$，

那么 $P(n)$ 对每个自然数 $n$ 都成立。在归纳步骤中，假设 $P(n)$ 称为**归纳假设**（induction hypothesis，常简写为 IH）。
:::

用模块 2 和模块 3 的逻辑记号写出来就是：$P(0) \land (\forall n.\ P(n) \imp P(n+1)) \imp (\forall n.\ P(n))$。读作“如果 P(0) 成立，并且对所有 n，P(n) 蕴涵 P(n+1)，那么对所有 n，P(n) 成立”。

为什么这是一种正确的证明方式？除了多米诺骨牌之外，这里还有第二个论证。假设 $P$ 对某个数不成立。在所有使它不成立的数中，取最小的一个，记为 $m$。$m$ 不是 0，因为 $P(0)$ 成立。所以对某个 $k$ 有 $m = k + 1$，并且 $P(k)$ 成立，因为 $k < m$，而 $m$ 是使 $P$ 不成立的最小的数。但这样一来，归纳步骤就给出了 $P(k + 1)$，也就是 $P(m)$：矛盾。这个论证用到了 $\N$ 的一个性质：自然数的每个非空集合都有最小元素。用模块 4 的话说，$\N$ 上的序 $<$ 是**良基的**（well-founded）：不存在无穷递降链 $n_0 > n_1 > n_2 > \cdots$。第 5.6 节和第 5.7 节都建立在这一点之上。

归纳不一定从 0 开始。要证明 $P(n)$ 对每个 $n \ge k$ 都成立，只需证明 $P(k)$，并证明对每个 $n \ge k$，$P(n)$ 蕴涵 $P(n + 1)$。

### 第一个归纳证明 {#first-proof}

::: example 求和公式
**断言**：对每个自然数 $n$，$2 \cdot \mathit{sum\_upto}(n) = n \cdot (n + 1)$。

**证明**：对 $n$ 做归纳。令 $P(n)$ 为陈述 $2 \cdot \mathit{sum\_upto}(n) = n \cdot (n+1)$。

**基础情形** $P(0)$：由 $\mathit{sum\_upto}$ 的第一个等式，$2 \cdot \mathit{sum\_upto}(0) = 2 \cdot 0 = 0 = 0 \cdot (0 + 1)$。

**归纳步骤**：设 $n$ 是任意一个自然数，归纳假设是 $2 \cdot \mathit{sum\_upto}(n) = n \cdot (n+1)$。要证明 $P(n+1)$，即 $2 \cdot \mathit{sum\_upto}(n+1) = (n+1) \cdot (n+2)$：

$$
\begin{aligned}
2 \cdot \mathit{sum\_upto}(n+1) &= 2 \cdot (\mathit{sum\_upto}(n) + (n+1)) && \text{由 sum\_upto.2}\\
&= 2 \cdot \mathit{sum\_upto}(n) + 2 \cdot (n+1) && \text{算术}\\
&= n \cdot (n+1) + 2 \cdot (n+1) && \text{由归纳假设}\\
&= (n+1) \cdot (n+2) && \text{算术}
\end{aligned}
$$

由归纳法，$P(n)$ 对每个 $n$ 都成立。
:::

两边除以 2，就得到熟悉的公式 $0 + 1 + \dots + n = n(n+1)/2$。断言把因子 2 留在左边，这样就不需要除法，从而更容易准确地陈述和证明：在自然数上，除法会向下取整。

### 怎样写归纳证明 {#writing}

::: tip
一个归纳证明由五个部分组成。每次都把它们全部写出来。

1. 说明你对哪个变量做归纳，并准确地陈述 $P(n)$。
2. **基础情形**：证明 $P(0)$。
3. **归纳步骤**：取任意一个 $n$，写下归纳假设 $P(n)$。
4. 写下目标 $P(n + 1)$ 并证明它。标出用到归纳假设的那一步。如果你根本没有用到归纳假设，那么要么证明有错，要么这个证明本来就不需要归纳。
5. 下结论：由归纳法，$P(n)$ 对每个 $n$ 都成立。
:::

第二个例子证明一个不等式。不等式的证明不像等式那样完全机械，因为你得决定要估计什么。

::: example 2 的幂比 n 增长得快
**断言**：对每个自然数 $n$，$n < \mathit{pow}(2, n)$。

**证明**：对 $n$ 做归纳。

**基础情形**：由 pow.1，$0 < 1 = \mathit{pow}(2, 0)$。

**归纳步骤**：设归纳假设 $n < \mathit{pow}(2, n)$ 成立，要证明 $n + 1 < \mathit{pow}(2, n+1)$。在自然数上，$n < \mathit{pow}(2, n)$ 意味着 $\mathit{pow}(2, n) \ge n + 1$，特别地，$\mathit{pow}(2, n) \ge 1$。所以

$$
\mathit{pow}(2, n+1) = \mathit{pow}(2, n) \cdot 2 = \mathit{pow}(2, n) + \mathit{pow}(2, n) \;\ge\; (n + 1) + 1 \;>\; n + 1,
$$

这里先用了 pow.2，然后对两个加数都用了归纳假设。由归纳法，断言对每个 $n$ 都成立。
:::

::: pitfall
**两个部分缺一不可。**取 $P(n)$ 为“$n = n + 1$”。归纳步骤是成立的：如果 $n = n + 1$，两边同时加 1 就得到 $n + 1 = n + 2$。但基础情形 $0 = 1$ 是假的，这个断言也是假的。没有基础情形，归纳步骤什么也证明不了。

**归纳步骤必须对每个 $n$ 都成立，包括最小的那个。**有一个著名的错误证明，声称在任何一群 $n \ge 1$ 匹马中，所有的马颜色都相同。基础情形：一匹马只有一种颜色。归纳步骤：从一群 $n + 1$ 匹马中牵走一匹，由归纳假设，剩下的 $n$ 匹颜色相同。把它牵回来，再牵走另一匹，剩下的 $n$ 匹同样颜色相同。这两群马有重叠，所以全部 $n + 1$ 匹马颜色都相同。漏洞在于：当 $n = 1$ 时，两群马各只有一匹，并不重叠。从 1 到 2 的那一步不成立，所以骨牌在第一块之后就停住了。
:::

## Isabelle 中的归纳 {#isabelle-induction}

Isabelle 也能检查归纳证明。你陈述引理，并告诉 Isabelle 使用归纳；Isabelle 随后把基础情形和归纳步骤显示为两个单独的目标，由你来证明。读懂这些目标，是本节要掌握的主要技能。

### 为什么光用 simp 不够 {#simp-not-enough}

试着只用化简器来证明求和公式：

```isabelle fails
lemma "2 * sum_upto n = n * (n + 1)"
  by simp
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. 2 * sum_upto n = n + n * n
```

化简器把 `n * (n + 1)` 重写成了 `n + n * n`，却动不了 `sum_upto n`。`sum_upto` 的两个等式都不与它匹配：第一个需要 `0`，第二个需要某个东西的 `Suc`，而 `n` 是一个任意的数，化简器对它一无所知。归纳恰好把证明分成这两种情况。

### 证明状态中的基础情形和归纳步骤 {#induction-state}

再次陈述这条引理，给它起个名字，并要求对 `n` 做归纳：

```isabelle
lemma sum_formula: "2 * sum_upto n = n * (n + 1)"
  apply (induction n)
```

```output state
proof (prove)
goal (2 subgoals):
 1. 2 * sum_upto 0 = 0 * (0 + 1)
 2. ⋀n. 2 * sum_upto n = n * (n + 1) ⟹
        2 * sum_upto (Suc n) = Suc n * (Suc n + 1)
```

`apply` 把一个**证明方法**（proof method）应用到目标上，并显示还剩下什么要证明；方法 `induction n` 对 `n` 做归纳。原来的一个目标变成了两个**子目标**（subgoal）。子目标 1 是基础情形：把断言中的 `n` 换成 `0`。子目标 2 是归纳步骤，其中出现了两个新符号：

- `⋀n.`（输入 `\And` 或 `!!`）的意思是“对任意的 n”：在这个子目标中，`n` 代表任意一个数，除了子目标本身所说的以外，对它一无所知。
- `A ⟹ B`（输入 `==>`）的意思是“A 蕴涵 B”：要证明这个子目标，就要证明 `B`，而你可以假设 `A`。

`⟹` 的左边是归纳假设；右边是关于 `Suc n`（也就是 $n + 1$）的断言。和例 5.1 的纸上证明对照如下：

| 纸上证明 | Isabelle 的子目标 |
|---|---|
| 基础情形 $P(0)$ | `1. 2 * sum_upto 0 = 0 * (0 + 1)` |
| 取任意一个 $n$ | `2. ⋀n.` |
| 设归纳假设 $P(n)$ 成立 | `2 * sum_upto n = n * (n + 1) ⟹` |
| 证明 $P(n + 1)$ | `2 * sum_upto (Suc n) = Suc n * (Suc n + 1)` |

现在逐个证明这些子目标。`simp` 作用于第一个子目标：

```isabelle
  apply simp
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀n. 2 * sum_upto n = n * (n + 1) ⟹
        2 * sum_upto (Suc n) = Suc n * (Suc n + 1)
```

基础情形消失了：`simp` 用第一个等式把 `sum_upto 0` 重写成 `0`，并把两边都化成了 `0`。剩下的是归纳步骤。再应用一次 `simp`：

```isabelle
  apply simp
```

```output state
proof (prove)
goal:
No subgoals!
```

在归纳步骤中，`simp` 用了 `sum_upto` 的第二个等式、归纳假设（化简器会使用 `⟹` 左边的假设）以及算术：正是纸上证明用到的那三样东西。已经没有子目标了，用 `done` 结束证明：

```isabelle
  done
```

现在这条引理成了一个名为 `sum_formula` 的定理，后面的证明可以使用它。

::: note
由一串 `apply` 步骤组成、以 `done` 结尾的证明称为 **apply 脚本**（apply script）。模块 7 会用这种风格一步一步地构造证明，模块 10 则会介绍 Isar，一种读起来更像纸上证明的证明语言。目前，要查看各个步骤之间的证明状态，apply 脚本是最好的方式：把光标放在任意一行的后面，就能看到那一处的证明状态。
:::

### 一行写完整个证明 {#by-induction}

一旦知道了证明的思路，你就可以把它写成一行：

```isabelle
lemma "2 * sum_upto n = n * (n + 1)"
  by (induction n) simp_all

lemma pow_gt: "n < pow 2 n"
  by (induction n) auto
```

`by m₁ m₂` 先应用方法 `m₁`，再应用 `m₂`，如果最后还有子目标剩下，它就会失败。`simp` 不能用作 `m₂`，因为它只作用于第一个子目标；`simp_all` 会化简所有子目标，`auto` 也作用于所有子目标，它把化简和逻辑推理结合在一起。如果一个归纳的基础情形和归纳步骤都能由定义和归纳假设推出，首先就该试试 `by (induction n) auto`。

::: trouble
- **`by simp` 或 `by auto` 之后出现 `Failed to finish proof`（未能完成证明），而目标中仍有 `sum_upto n`（或者其他作用在变量上的递归函数）。**这个证明需要归纳：写成 `by (induction n) auto`。
- **`by (induction n) auto` 之后出现 `Failed to finish proof`。**查看剩下的子目标。第 5.5 节和第 5.6 节给出了常见的原因：对错误的变量做了归纳、缺少一条引理，以及归纳假设太弱。
- **没有显示证明状态。**按模块 1 所说，在 **Output**（输出）面板中勾选 **Proof state**（证明状态），并把光标放在 `apply` 那一行的末尾。
:::

## 结构归纳法 {#structural}

自然数上的归纳遵循数的构造方式，即从 `0` 和 `Suc` 构造。每种数据类型都以同样的方式由它的构造子构造而成，所以每种数据类型都有一个形式相同的归纳原理，称为**结构归纳法**（structural induction）。

### 列表上的归纳 {#list-induction}

::: fact 列表上的结构归纳法
设 $P(xs)$ 是关于列表 $xs$ 的一个陈述。如果

1. $P([\,])$ 成立，并且
2. 对每个 $x$ 和 $xs$，$P(xs)$ 蕴涵 $P(x \mathbin{\#} xs)$，

那么 $P(xs)$ 对每个列表 $xs$ 都成立。
:::

它成立的理由和数上的归纳一样：每个列表都是从 `[]` 出发、有限次使用 `#` 构造出来的。实际上，它就是换了个样子的、对列表长度的归纳。下面的证明用 Isabelle 的记号书写等式，每行一步，就像前面 `reverse [1, 2]` 的求值过程那样。

::: example 连接后的长度
**断言**：对所有列表 `xs` 和 `ys`，`len (app xs ys) = len xs + len ys`。

应该对哪个变量做归纳？`app` 会拆开它的第一个参数（app.2），而不去动第二个参数。所以对 `xs` 做归纳，并保持 `ys` 固定：$P(xs)$ 就是 `len (app xs ys) = len xs + len ys`。

**基础情形**，`xs = []`：

```text
  len (app [] ys)
= len ys                     由 app.1
= 0 + len ys                 算术
= len [] + len ys            由 len.1
```

**归纳步骤**：设归纳假设 `len (app xs ys) = len xs + len ys` 成立，证明断言对 `x # xs` 也成立：

```text
  len (app (x # xs) ys)
= len (x # app xs ys)        由 app.2
= len (app xs ys) + 1        由 len.2
= len xs + len ys + 1        由归纳假设
= (len xs + 1) + len ys      算术
= len (x # xs) + len ys      由 len.2
```
:::

::: isabelle
归纳方法在列表上的用法完全一样：

```isabelle
lemma len_app: "len (app xs ys) = len xs + len ys"
  apply (induction xs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. len (app [] ys) = len [] + len ys
 2. ⋀a xs.
       len (app xs ys) = len xs + len ys ⟹
       len (app (a # xs) ys) = len (a # xs) + len ys
```

这正是例 5.3 的基础情形和归纳步骤。Isabelle 把列表的头部叫做 `a` 而不是 `x`；名字无关紧要，因为 `⋀a xs` 使两者都是任意的。`auto` 能证明这两个子目标：

```isabelle
  apply auto
  done
```

对另一个变量做归纳就会失败：

```isabelle fails
lemma "len (app xs ys) = len xs + len ys"
  by (induction ys) auto
```

```output
*** Failed to finish proof⌂:
*** goal (2 subgoals):
***  1. len (app xs []) = len xs
***  2. ⋀a ys.
***        len (app xs ys) = len xs + len ys ⟹
***        len (app xs (a # ys)) = Suc (len xs + len ys)
```

剩下的每个子目标都含有作用在某个东西上的 `app xs`，而 `app` 的等式无法重写它，因为 `xs` 既不是 `[]`，也不具有 `x # xs` 的形式。经验法则是：对函数拆开的那个参数做归纳。
:::

### 树上的归纳 {#tree-induction}

::: fact 树上的结构归纳法
设 $P(t)$ 是关于树 $t$ 的一个陈述。如果

1. $P(\mathit{Tip})$ 成立，并且
2. 对所有 $l$、$x$ 和 $r$，$P(l)$ 和 $P(r)$ 合起来蕴涵 $P(\mathit{Node}\ l\ x\ r)$，

那么 $P(t)$ 对每棵树 $t$ 都成立。
:::

现在归纳步骤有两个归纳假设，每棵子树各一个，因为一个结点是由两棵更小的树构造而成的。

::: example 镜像两次
**断言**：对每棵树 `t`，`mirror (mirror t) = t`。

**基础情形**：两次使用 mirror.1，得 `mirror (mirror Tip) = mirror Tip = Tip`。

**归纳步骤**：设两个归纳假设 `mirror (mirror l) = l` 和 `mirror (mirror r) = r` 都成立：

```text
  mirror (mirror (Node l x r))
= mirror (Node (mirror r) x (mirror l))             由 mirror.2
= Node (mirror (mirror l)) x (mirror (mirror r))    由 mirror.2
= Node l x r                                        由两个归纳假设
```
:::

::: isabelle
```isabelle
lemma mirror_mirror: "mirror (mirror t) = t"
  apply (induction t)
```

```output state
proof (prove)
goal (2 subgoals):
 1. mirror (mirror Tip) = Tip
 2. ⋀t1 x2 t2.
       ⟦mirror (mirror t1) = t1; mirror (mirror t2) = t2⟧
       ⟹ mirror (mirror (Node t1 x2 t2)) = Node t1 x2 t2
```

记号 `⟦A; B⟧ ⟹ C` 是“A 和 B 蕴涵 C”的简写。两个归纳假设都在这里，分别对应 Isabelle 称为 `t1` 和 `t2` 的两棵子树。

```isabelle
  apply auto
  done
```
:::

结构归纳法还能把衡量大小的不同方式联系起来。一棵有 $n$ 个结点的树，无论形状如何，都有 $n + 1$ 个 Tip：图 5.1 中的树有 4 个结点和 5 个 Tip。证明很短。基础情形：`tips Tip = 1 = nodes Tip + 1`。归纳步骤：

```text
  tips (Node l x r)
= tips l + tips r                          由 tips.2
= (nodes l + 1) + (nodes r + 1)            由两个归纳假设
= (nodes l + nodes r + 1) + 1              算术
= nodes (Node l x r) + 1                   由 nodes.2
```

```isabelle
lemma tips_nodes: "tips t = nodes t + 1"
  by (induction t) auto
```

### 当归纳需要一条引理时 {#lemmas}

把一个列表反转两次，会得到原来的列表。试着用通常的方式证明它：

```isabelle fails
lemma "reverse (reverse xs) = xs"
  by (induction xs) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀a xs.
***        reverse (reverse xs) = xs ⟹ reverse (app (reverse xs) [a]) = a # xs
```

基础情形通过了，归纳步骤却没有。`auto` 把 `reverse (reverse (a # xs))` 展开成 `reverse (app (reverse xs) [a])`，然后就卡住了：归纳假设说的是 `reverse (reverse xs)`，而目标是把 `reverse` 作用在一个 `app` 上，没有哪个等式说明这时该怎么办。用定义来重写帮不上忙；缺少的是一个关于 `reverse` 和 `app` 的事实。卡住的目标告诉你该找什么：`reverse` 作用在 `app` 上会怎样？把两个连接起来的列表反转，就是把两部分各自反转，再交换它们的位置。

::: example 连接后的反转
这个证明需要两个关于 `app` 的简单事实。两者都对 `xs` 做归纳来证明：

- **引理 A**：`app xs [] = xs`。基础情形：由 app.1，`app [] [] = []`。归纳步骤：由 app.2 和归纳假设，`app (x # xs) [] = x # app xs [] = x # xs`。
- **引理 B**：`app (app xs ys) zs = app xs (app ys zs)`。基础情形：由 app.1，两边都是 `app ys zs`。归纳步骤：`app (app (x # xs) ys) zs = app (x # app xs ys) zs = x # app (app xs ys) zs`，由归纳假设，它等于 `x # app xs (app ys zs)`，再由 app.2，这就是 `app (x # xs) (app ys zs)`。

**引理 C**：`reverse (app xs ys) = app (reverse ys) (reverse xs)`，对 `xs` 做归纳。基础情形：`reverse (app [] ys) = reverse ys`，由引理 A，它等于 `app (reverse ys) []`，而 `reverse [] = []`。归纳步骤：

```text
  reverse (app (x # xs) ys)
= reverse (x # app xs ys)                      由 app.2
= app (reverse (app xs ys)) [x]                由 reverse.2
= app (app (reverse ys) (reverse xs)) [x]      由归纳假设
= app (reverse ys) (app (reverse xs) [x])      由引理 B
= app (reverse ys) (reverse (x # xs))          由 reverse.2
```

**定理**：`reverse (reverse xs) = xs`，对 `xs` 做归纳。基础情形：两次使用 reverse.1，得 `reverse (reverse []) = []`。归纳步骤要用到 `reverse [x] = app [] [x] = [x]`：

```text
  reverse (reverse (x # xs))
= reverse (app (reverse xs) [x])               由 reverse.2
= app (reverse [x]) (reverse (reverse xs))     由引理 C
= app [x] xs                                   由 reverse [x] = [x] 和归纳假设
= x # xs                                       由 app.2 和 app.1
```
:::

::: isabelle
在 Isabelle 中，先证明这些引理，并给每条引理标上 `[simp]`：

```isabelle
lemma app_nil [simp]: "app xs [] = xs"
  by (induction xs) auto

lemma app_assoc [simp]: "app (app xs ys) zs = app xs (app ys zs)"
  by (induction xs) auto

lemma reverse_app [simp]: "reverse (app xs ys) = app (reverse ys) (reverse xs)"
  by (induction xs) auto

lemma reverse_reverse: "reverse (reverse xs) = xs"
  by (induction xs) auto
```

属性（attribute）`[simp]` 使一条引理成为**化简规则**（simplification rule）：从此以后，`simp` 和 `auto` 会像使用定义等式一样，用它来重写。`reverse_app` 的证明就是这样用上 `app_nil` 和 `app_assoc` 的，`reverse_reverse` 的证明也是这样用上 `reverse_app` 的。如果你在这两条引理之前就去证明 `reverse_app`，它会卡在需要这两条引理的目标上，就像 `reverse_reverse` 在没有 `reverse_app` 时卡住一样。模块 9 会解释哪些引理适合用作化简规则。
:::

::: keyidea
归纳卡住时，读一读卡住的目标。它通常含有一个没有任何等式能重写的项，例如 `reverse (app (reverse xs) [a])`。找出关于这个项的一般事实，把它作为引理来证明（往往本身也要用归纳），声明为 `[simp]`，然后再试一次。模块 11 会把这种做法发展成一套方法。
:::

## 强归纳法 {#strong}

在普通的归纳中，归纳步骤证明 $P(n + 1)$ 时只能使用 $P(n)$，也就是紧挨在它前面的那块骨牌。有些证明需要更多。斐波那契数要往回看两步，而一个数的因数可以是任何比它小的数，不只是它前面的那一个。

::: fact 强归纳法
设 $P(n)$ 是关于自然数 $n$ 的一个陈述。如果对每个 $n$，由“$P(m)$ 对所有 $m < n$ 成立”（归纳假设）都能推出 $P(n)$，那么 $P(n)$ 对每个自然数 $n$ 都成立。
:::

用符号写就是：$(\forall n.\ (\forall m < n.\ P(m)) \imp P(n)) \imp (\forall n.\ P(n))$。其中 $\forall m < n.\ P(m)$ 读作“对所有小于 n 的 m，P(m) 成立”，它是 $\forall m.\ m < n \imp P(m)$ 的简写，就像模块 4 中的有界量词 $\forall x \in A$ 一样。强归纳法（strong induction）也叫**完全归纳法**（complete induction）或累积归纳法（course-of-values induction）。它没有单独的基础情形。当 $n = 0$ 时，不存在 $m < 0$，所以归纳假设什么也没说，$P(0)$ 必须在没有任何帮助的情况下证明；在实践中，用强归纳法的证明会单独处理最小的几个值。

强归纳法并不比普通的归纳更强，它可以由普通的归纳推出。对陈述 $Q(n)$：“$P(m)$ 对每个 $m < n$ 成立”应用普通的归纳。$Q(0)$ 成立，因为不存在 $m < 0$。如果 $Q(n)$ 成立，那么由强归纳法的前提，$P(n)$ 成立，所以 $P(m)$ 对每个 $m < n + 1$ 都成立：这就是 $Q(n + 1)$。因此 $Q(n)$ 对每个 $n$ 都成立，而 $P(n)$ 可以由 $Q(n + 1)$ 推出。

::: definition 素数
如果自然数 $p \ge 2$，并且它的因数只有 1 和 $p$，就称 $p$ 是**素数**（prime）。$n$ 的**素因数**（prime factor）是能整除 $n$ 的素数。
:::

::: example 从 2 起的每个数都有素因数
**断言**：每个自然数 $n \ge 2$ 都有素因数。

**证明**：对 $n$ 做强归纳，其中 $P(n)$ 为“如果 $n \ge 2$，那么 $n$ 有素因数”。设 $n \ge 2$，并假设 $P(m)$ 对每个 $m < n$ 都成立。

- 如果 $n$ 是素数，那么 $n$ 本身就是 $n$ 的一个素因数。
- 如果 $n$ 不是素数，它就有一个因数 $a$，满足 $1 < a < n$。由归纳假设，$P(a)$ 成立，又因为 $a \ge 2$，所以 $a$ 有一个素因数 $p$。由于 $p$ 整除 $a$，而 $a$ 整除 $n$，所以 $p$ 整除 $n$。

当 $n < 2$ 时，没有什么需要证明的。由强归纳法，$P(n)$ 对每个 $n$ 都成立。
:::

普通的归纳在这里帮不上忙：知道 $n - 1$ 有素因数，对 $n$ 来说什么也说明不了。因数 $a$ 可以是小于 $n$ 的任何数，所以证明需要 $P$ 对它们全都成立。

::: example 斐波那契数的一个上界
**断言**：对每个自然数 $n$，$\mathit{fib}(n) < 2^n$。

**证明**：对 $n$ 做强归纳。假设对每个 $m < n$，都有 $\mathit{fib}(m) < 2^m$。

- $n = 0$：$\mathit{fib}(0) = 0 < 1 = 2^0$。
- $n = 1$：$\mathit{fib}(1) = 1 < 2 = 2^1$。
- $n \ge 2$：这时 $n = k + 2$，而 $k$ 和 $k + 1$ 都比 $n$ 小。对两者都使用归纳假设，得

$$
\mathit{fib}(k+2) = \mathit{fib}(k) + \mathit{fib}(k+1) < 2^k + 2^{k+1} < 2^{k+1} + 2^{k+1} = 2^{k+2}.
$$
:::

::: isabelle
对 `n` 做普通的归纳会失败，原因正如上面所说：

```isabelle fails
lemma "fib n < 2 ^ n"
  by (induction n) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀n. fib n < 2 ^ n ⟹ fib (Suc n) < 2 * 2 ^ n
```

归纳假设只说到 `fib n`，但 `fib (Suc n)` 是它前面两个值之和，而且它甚至无法展开：只要对 `n` 一无所知，`Suc n` 就既不匹配 `Suc 0`，也不匹配 `Suc (Suc m)`。（`2 ^ n` 是库中的幂函数，和 `pow` 一样对 `n` 递归定义；它的值和 `pow 2 n` 相同。）

补救的办法，就是前面由普通的归纳推出强归纳法时用的那个技巧：证明一个更强的陈述，把前两个值一起带上。

```isabelle
lemma fib_bound: "fib n < 2 ^ n ∧ fib (Suc n) < 2 ^ Suc n"
  apply (induction n)
```

```output state
proof (prove)
goal (2 subgoals):
 1. fib 0 < 2 ^ 0 ∧ fib (Suc 0) < 2 ^ Suc 0
 2. ⋀n. fib n < 2 ^ n ∧ fib (Suc n) < 2 ^ Suc n ⟹
        fib (Suc n) < 2 ^ Suc n ∧ fib (Suc (Suc n)) < 2 ^ Suc (Suc n)
```

现在归纳假设同时包含了 `fib n` 和 `fib (Suc n)`，这正是 `fib (Suc (Suc n))` 所需要的：

```isabelle
  apply auto
  done
```

模块 11 会介绍两种更直接的方式：沿着 `fib` 的递归结构做归纳（`fib.induct`），以及直接使用强归纳法（`less_induct`）。
:::

强归纳法是沿着 $\N$ 上的序 $<$ 进行的归纳，它之所以成立，是因为这个序是良基的。对每个良基关系 $R$（模块 4）都有同样的结论：如果对每个 $x$，只要 $P(y)$ 对所有满足 $(y, x) \in R$ 的 $y$ 都成立，就能推出 $P(x)$，那么 $P(x)$ 对每个 $x$ 都成立。这称为**良基归纳法**（well-founded induction）。结构归纳法是它的一个特例：这时 $R$ 把 `xs` 与 `x # xs` 联系起来，把 `l` 和 `r` 与 `Node l x r` 联系起来。

## 终止性 {#termination}

到目前为止，每个函数在每个输入上都会停下来：每次递归调用都作用在一个更小的参数上，而参数不可能无休止地变小。本节解释 Isabelle 为什么坚持要求终止性（termination），以及它怎样检查终止性。

### 为什么递归必须终止 {#why-terminate}

在编程语言中，你可以写出一个永不停止的函数；调用它会让程序卡住，仅此而已。在逻辑中，危险要严重得多。看看这个“定义”：

$$
\mathit{bad}(n) = \mathit{bad}(n) + 1
$$

如果 $\N$ 上真有一个具有这个性质的函数 $\mathit{bad}$，那么两边同时减去 $\mathit{bad}(n)$，就会得到 $0 = 1$。定义中的等式是在断言某件事为真，而这个等式对任何函数都不成立。如果 Isabelle 原样接受它，你就能证明 $0 = 1$，而从一个假陈述可以推出任何陈述（模块 2）：所有定理都会变得毫无价值。

所以 Isabelle 从不轻信 `fun` 的等式。它先根据这些等式构造出一个函数，再把这些等式作为定理证明出来，而这个证明需要一个说明递归会终止的论证。`fun` 会自动寻找这样的论证。对 `bad` 来说，这样的论证并不存在：

```isabelle fails
fun bad :: "nat ⇒ nat" where
  "bad n = bad n + 1"
```

```output
consts
  bad :: "nat ⇒ nat"

*** Unfinished subgoals:
*** (a, 1, <):
***  1. False
*** Calls:
***   a) n ~> n
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  <=
***
*** Could not find lexicographic termination order.
```

开头几行只是宣布新常量的名字和类型；整个定义是失败的，之后 `bad` 并没有被定义。从下往上读这条错误消息。最后一行是说，Isabelle 找不到终止序。它考察了一个递归调用 `a)`，即从 `n` 到 `n` 的调用（箭头 `~>` 表示“调用”），以及一个度量（measure），即 `size`，对数来说，它就是这个数本身。要接受这个定义，Isabelle 必须证明在这次调用中度量严格变小（`<`）；对这个调用来说，这就意味着要证明 `False`，而这是做不到的。“Result matrix”（结果矩阵）记录了它找到的最好结果：度量保持不变或者变小（`<=`），这还不够。

::: keyidea
在 HOL 中，每个函数都是**全函数**（total）：它对每个参数都有值。递归会终止的递归定义恰好确定一个函数，所以它是安全的。`fun` 在接受一个定义之前会先证明它终止，因此用 `fun` 做出的定义永远不会使逻辑变得不一致。
:::

并不是每个不终止的等式都自相矛盾：每个函数都满足 $f(n) = f(n)$。但 Isabelle 并不试图区分无害的情况和有害的情况；只有在能证明终止性时，它才会接受用 `fun` 给出的递归定义。

### 度量 {#measures}

::: definition 度量
递归定义的**度量**是一个从参数到 $\N$ 的函数 $m$，它在每次递归调用时都严格变小：只要 $f(a)$ 的定义调用了 $f(b)$，就有 $m(b) < m(a)$。
:::

::: fact 用度量证明终止性
如果一个递归定义有度量，那么这个函数的每次求值都会终止。
:::

原因在于第 5.3 节讲过的 $\N$ 的良基性：一个永不停止的求值会产生无穷多层嵌套调用，参数依次为 $a_0, a_1, a_2, \dots$，于是 $m(a_0) > m(a_1) > m(a_2) > \cdots$ 就是一条由自然数组成的无穷递降链。而这样的链并不存在。

| 函数 | 递归调用 | 度量 |
|---|---|---|
| `sum_upto`、`fac` | `f (Suc n)` 调用 `f n` | 这个数本身 |
| `fib` | `fib (Suc (Suc n))` 调用 `fib n` 和 `fib (Suc n)` | 这个数本身 |
| `pow` | `pow x (Suc n)` 调用 `pow x n` | 第二个参数 |
| `len`、`reverse`、`lsum` | `f (x # xs)` 调用 `f xs` | 列表的长度 |
| `app` | `app (x # xs) ys` 调用 `app xs ys` | 第一个列表的长度 |
| `mirror`、`nodes`、`tips` | `f (Node l x r)` 调用 `f l` 和 `f r` | 结点的个数 |

这些正是 Isabelle 报告的终止序。对 `sum_upto`，它给出的是 `size <*mlex*> {}`：度量是 `size`，对数来说它是这个数本身，对列表来说是列表的长度，对树来说是结点的个数。把 `f <*mlex*> {}` 读作“度量 `f`”。对列表上的函数，Isabelle 写的是 `length` 而不是 `size`，例如对 `reverse` 是 `length <*mlex*> {}`。

有时没有哪个单一的度量能在每次调用时都变小。阿克曼函数（Ackermann function）就是一个著名的例子：

```isabelle
fun ack :: "nat ⇒ nat ⇒ nat" where
  "ack 0 n = Suc n"
| "ack (Suc m) 0 = ack m 1"
| "ack (Suc m) (Suc n) = ack m (ack (Suc m) n)"
```

```output
consts
  ack :: "nat ⇒ nat ⇒ nat"

Found termination order:
  "(λp. size (fst p)) <*mlex*> (λp. size (snd p)) <*mlex*> {}"
```

在从 `ack (Suc m) (Suc n)` 到 `ack (Suc m) n` 的调用中，第一个参数保持不变；而在外层调用 `ack m (ack (Suc m) n)` 中，第二个参数可以是任何数。但在每次调用中，参数组成的有序对都按**字典序**（lexicographic order）变小。字典序就是词典里单词的排列顺序：先比较第一个参数，只有当它们相等时，才比较第二个参数。这就是 Isabelle 找到的终止序。参数组成一个有序对 `p`；`fst p` 和 `snd p` 是它的第一个和第二个分量；`λp. size (fst p)`（读作“lambda p”）是把 `p` 映射到其第一个分量大小的函数。这个序先用这个度量，再用第二个参数的大小。自然数有序对上的字典序也是良基的，所以它能像度量一样证明终止性。

阿克曼函数之所以著名，是因为它增长得极快。小的参数给出的值还不大：

```isabelle
value "ack 2 3"
```

```output
"9"
  :: "nat"
```

但 `ack 4 2` 就已经是 $2^{65536} - 3$，一个有 19729 位的十进制数。

### 当 `fun` 无法证明终止性时 {#no-measure}

初学者可能会这样写求和函数：

```isabelle fails
fun sum_down :: "nat ⇒ nat" where
  "sum_down n = sum_down (n - 1) + n"
```

```output
consts
  sum_down :: "nat ⇒ nat"

*** Unfinished subgoals:
*** (a, 1, <):
***  1. ⋀n. n - Suc 0 < n
*** Calls:
***   a) n ~> n - 1
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  <=
***
*** Could not find lexicographic termination order.
```

这一次，未完成的子目标是 `n - Suc 0 < n`，即 $n - 1 < n$，而它在 $n = 0$ 时为假。自然数上的减法不会低于 0，所以在 Isabelle 中 `0 - 1 = 0`，于是 `sum_down 0` 会永远调用 `sum_down 0`。这个定义忘了写基础情形。和 `bad` 不同，它并不自相矛盾：当 $n = 0$ 时，它说的是 `sum_down 0 = sum_down 0 + 0`，无论 `sum_down 0` 的值是什么，这都成立。但它没有确定这个值，而 `fun` 照样拒绝这个定义，因为它无法证明终止性。像 `sum_upto` 那样使用模式匹配就能避免这个错误：在那里，递归等式只适用于 `Suc n`，而这时 `n` 确实更小。

有时一个函数确实会终止，但 `fun` 看不出原因。它只尝试由参数的大小构成、按字典序组合起来的度量。一个向上计数的函数，例如 `sum_from i n = (if n < i then 0 else i + sum_from (i + 1) n)`，之所以会终止，是因为 $n + 1 - i$ 在每次调用时都会变小；但两个参数都没有变小，所以 `fun` 只好放弃。对于这样的定义，Isabelle 有一个更一般的命令 `function`，用它可以由你自己提供度量；模块 8 会再谈终止性。

::: note
对有些函数，没有人知道它的度量。考拉兹函数（Collatz function）计算一个著名过程的步数：

$$
\mathit{collatz}(n) = \begin{cases}
0 & \text{如果 } n \le 1\\
\mathit{collatz}(n / 2) + 1 & \text{如果 } n \text{ 是偶数}\\
\mathit{collatz}(3n + 1) + 1 & \text{其他情况}
\end{cases}
$$

计算机已经验证过：对不超过某个天文数字的每个 $n$，它都会终止；但它是否对每个 $n$ 都终止，仍是一个悬而未决的问题，即洛塔尔·考拉兹（Lothar Collatz）在 1937 年提出的考拉兹猜想。Isabelle 的 `fun` 拒绝这个定义，而且也没有人能手工给出终止性证明：这样的证明将解决这个猜想。
:::

## 不变式 {#invariants}

归纳可以证明关于递归函数的事实，也可以证明关于一步一步运行的过程（例如循环、协议和机器）的事实。用于后者的工具是不变式（invariant）。

::: definition 不变式
一个过程的**不变式**是关于其状态的一个性质：它在初始状态成立，并且被每一步**保持**（preserved），也就是说，如果它在某一步之前成立，那么在这一步之后也成立。
:::

::: fact 不变式在每个可达状态中都成立
如果 $I$ 是一个过程的不变式，那么无论经过多少步，$I$ 在这个过程所到达的每个状态中都成立。
:::

证明是对步数 $k$ 做归纳。经过 0 步时，过程处于初始状态，而 $I$ 在初始状态成立。如果 $I$ 在 $k$ 步之后成立，下一步会保持它，所以 $I$ 在 $k + 1$ 步之后也成立。

### 一个循环 {#loop-invariant}

下面这个程序用一个循环求从 1 到 `n` 的各数之和：

```text
i := 0
s := 0
while i < n:
    i := i + 1
    s := s + i
return s
```

**断言**：这个循环返回 $\mathit{sum\_upto}(n)$。取不变式 $I$ 为“$s = \mathit{sum\_upto}(i)$ 并且 $i \le n$”。

- **初始时**：$i = 0$，$s = 0 = \mathit{sum\_upto}(0)$，并且 $0 \le n$。
- **保持**：假设 $I$ 成立，并且循环又执行了一次，所以 $i < n$。执行之后，$i' = i + 1$，并且由 sum_upto.2，$s' = s + (i + 1) = \mathit{sum\_upto}(i) + (i + 1) = \mathit{sum\_upto}(i + 1) = \mathit{sum\_upto}(i')$；又因为 $i < n$，所以 $i' \le n$。
- **结束时**：条件 $i < n$ 为假，所以 $i \ge n$；结合 $i \le n$ 就得到 $i = n$，而不变式说明 $s = \mathit{sum\_upto}(n)$。

结合例 5.1，这个循环返回 $n(n+1)/2$。它也会终止：$n - i$ 是一个每步减少 1 的自然数，也就是一个度量；对循环来说，这样的度量称为**变式**（variant）。注意，虽然断言只涉及 $s$，不变式却需要 $i \le n$ 这一部分：没有它，退出条件 $i \ge n$ 就推不出 $i = n$。找到一个足够强的不变式，是这类证明中需要创造力的部分。这种关于循环的推理方式可以追溯到罗伯特·弗洛伊德（Robert Floyd，1967 年）和托尼·霍尔（Tony Hoare，1969 年）。

### 一台机器 {#machine-invariant}

一台售票机接受 5 分和 10 分的硬币，其他硬币一律退回。它的状态是余额（credit），即已经投入的金额，初始为 0。余额有没有可能恰好是 12 分？无论顾客怎样投币，答案都是否定的，而不变式能说明原因。取 $I$ 为“余额是 5 的倍数”。

- **初始时**：余额是 0，它是 5 的倍数。
- **保持**：一枚 5 分或 10 分的硬币使余额增加 5 或 10，余额仍是 5 的倍数。其他硬币都被退回，余额不变。

所以售票机能达到的每个余额都是 5 的倍数，而 12 不是。这个论证覆盖了任意长度的每一种投币序列：这是无穷多种运行过程，再多的测试也试不完。

::: isabelle
用投入的硬币列表来描述一次运行（最后投入的排在最前面），并通过在列表上递归来计算余额：

```isabelle
fun insert_coin :: "nat ⇒ nat ⇒ nat" where
  "insert_coin c m = (if c = 5 ∨ c = 10 then m + c else m)"

fun credit :: "nat list ⇒ nat" where
  "credit [] = 0"
| "credit (c # cs) = insert_coin c (credit cs)"

value "credit [10, 3, 5]"
```

```output
"15"
  :: "nat"
```

那枚 3 分的硬币被退回了。`m mod 5` 是 `m` 除以 5 的余数（相当于许多编程语言中的 `%` 运算符），所以不变式是：对每次运行 `cs`，`credit cs mod 5 = 0`：

```isabelle
lemma credit_mod: "credit cs mod 5 = 0"
  apply (induction cs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. credit [] mod 5 = 0
 2. ⋀a cs. credit cs mod 5 = 0 ⟹ credit (a # cs) mod 5 = 0
```

基础情形对应初始状态；归纳步骤是说，再投入一枚硬币 `a` 会保持不变式。对硬币列表做归纳，就是对步数做归纳。

```isabelle
  apply auto
  done
```
:::

模块 13 把这当作它的主要方法。它把系统描述为状态机（state machine），在 Isabelle 中定义它们的可达状态（reachable state），并用不变式证明安全性质。当一个性质本身不是不变式时，补救的办法就是你在第 5.6 节证明斐波那契数上界时用过的那个：证明一个更强的、本身是不变式的陈述。要更多地练习归纳证明和循环不变式，请参阅数学基础系列中的[证明方法、归纳法与不变式](../math/module_04_ZH.html)。

## 小结 {#summary}

- 自然数由 `0` 和 `Suc` 构造，列表由 `[]` 和 `#` 构造，树由 `Tip` 和 `Node` 构造。递归定义为值的每一种构造方式各给出一个等式，并且只在更小的参数上调用函数。`datatype` 用来定义这类新类型。
- 求值就是用定义等式进行重写。重写的顺序会改变中间的项，但不会改变最终的值。清晰的定义可能是很慢的程序：朴素的 `fib` 会重复计算。
- **数学归纳法**：证明 $P(0)$，并对任意的 $n$ 证明 $P(n) \imp P(n+1)$；那么 $P(n)$ 对每个 $n$ 都成立。两个部分缺一不可，而且归纳步骤必须对每个 $n$ 都成立。
- **结构归纳法**对列表和树做同样的事，每个更小的部分各有一个归纳假设。**强归纳法**可以假设 $P(m)$ 对每个 $m < n$ 都成立。它们都建立在良基序之上。
- 在 Isabelle 中，`apply (induction n)` 把一个目标变成基础情形和归纳步骤。把 `⋀n.` 读作“对任意的 n”，把 `⟹` 读作“蕴涵”；归纳假设位于 `⟹` 的左边。`by (induction xs) auto` 能证明由定义和归纳假设推得出的结论。如果它卡住了，就对函数拆开的那个参数做归纳，或者证明卡住的目标所需要的引理，并把它声明为 `[simp]`。
- `fun` 只有在证明了一个递归定义会终止之后才接受它，证明所用的是一个在每次调用时都变小的度量，或者是若干度量的字典序组合。如果没有这项检查，像 $f(n) = f(n) + 1$ 这样的“定义”就能证明 $0 = 1$。
- **不变式**在初始时成立，并被每一步保持，所以对步数做归纳可知，它在每个可达状态中都成立。

## 练习 {#exercises}

:::: exercise 手工求值 {#ex-5-1} ★
通过重写对下面每个项求值，每步用一个等式，并写出每一步所用的等式：

1. `pow 3 2`
2. `app [a] [b, c]`
3. `mirror (Node Tip a (Node Tip b Tip))`

然后用 `value` 以及第 5.2 节的单步求值器检查结果。

::: solution
```text
  pow 3 2
= pow 3 1 * 3                   由 pow.2，因为 2 = Suc 1
= pow 3 0 * 3 * 3               由 pow.2，因为 1 = Suc 0
= 1 * 3 * 3                     由 pow.1
= 3 * 3                         算术
= 9                             算术
```

```text
  app [a] [b, c]
= a # app [] [b, c]             由 app.2
= a # [b, c]                    由 app.1
```

也就是列表 `[a, b, c]`。

```text
  mirror (Node Tip a (Node Tip b Tip))
= Node (mirror (Node Tip b Tip)) a (mirror Tip)              由 mirror.2
= Node (Node (mirror Tip) b (mirror Tip)) a (mirror Tip)     由 mirror.2
= Node (Node Tip b (mirror Tip)) a (mirror Tip)              由 mirror.1
= Node (Node Tip b Tip) a (mirror Tip)                       由 mirror.1
= Node (Node Tip b Tip) a Tip                                由 mirror.1
```

单步求值器走的也是同样的步骤。用 `value` 检查：

```isabelle
value "pow 3 2"
value "app [a] [b, c]"
value "mirror (Node Tip a (Node Tip b Tip))"
```

```output all
"9"
  :: "nat"

"[a, b, c]"
  :: "'a list"

"Node (Node Tip b Tip) a Tip"
  :: "'a tree2"
```
:::
::::

:::: exercise 这个证明错在哪里？ {#ex-5-2} ★
**断言**：对每个自然数 $n$，数 $n^2 + n$ 是奇数。

**证明**：假设 $n^2 + n$ 是奇数。那么 $(n + 1)^2 + (n + 1) = (n^2 + n) + 2(n + 1)$ 是一个奇数加上一个偶数，所以它是奇数。由归纳法，$n^2 + n$ 对每个 $n$ 都是奇数。

找出其中的错误。这个断言是真的吗？

::: solution
归纳步骤是正确的，但这个证明没有基础情形，而基础情形是假的：$0^2 + 0 = 0$ 是偶数。这个断言对每个 $n$ 都不成立：$n^2 + n = n(n + 1)$ 是两个相邻自然数的乘积，其中必有一个是偶数，所以 $n^2 + n$ 总是偶数。归纳步骤只说明：如果 $n^2 + n$ 对某一个 $n$ 是奇数，那么它对所有更大的 $n$ 也是奇数。没有第一块骨牌，什么也不会倒下。
:::
::::

:::: exercise 连接后的和 {#ex-5-3} ★★
在纸上证明：对所有数的列表 `xs` 和 `ys`，`lsum (app xs ys) = lsum xs + lsum ys`。你对哪个变量做归纳？然后写下你预期在 `apply (induction xs)` 之后出现的两个子目标，把它们和 Isabelle 给出的子目标对比，并在 Isabelle 中完成证明。

::: solution
对 `xs` 做归纳，因为 `app` 会拆开它的第一个参数。基础情形：由 app.1 和 lsum.1，`lsum (app [] ys) = lsum ys = 0 + lsum ys = lsum [] + lsum ys`。归纳步骤，归纳假设为 `lsum (app xs ys) = lsum xs + lsum ys`：

```text
  lsum (app (x # xs) ys)
= lsum (x # app xs ys)           由 app.2
= x + lsum (app xs ys)           由 lsum.2
= x + (lsum xs + lsum ys)        由归纳假设
= (x + lsum xs) + lsum ys        算术
= lsum (x # xs) + lsum ys        由 lsum.2
```

在 Isabelle 中：

```isabelle
lemma lsum_app: "lsum (app xs ys) = lsum xs + lsum ys"
  apply (induction xs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. lsum (app [] ys) = lsum [] + lsum ys
 2. ⋀a xs.
       lsum (app xs ys) = lsum xs + lsum ys ⟹
       lsum (app (a # xs) ys) = lsum (a # xs) + lsum ys
```

这两个子目标就是上面的基础情形和归纳步骤，只是用 `a` 代替了 `x`。

```isabelle
  apply auto
  done
```
:::
::::

:::: exercise 奇数之和 {#ex-5-4} ★★
前 $n$ 个奇数之和 $1 + 3 + \dots + (2n - 1)$ 由 $\mathit{odds}(0) = 0$ 和 $\mathit{odds}(n + 1) = \mathit{odds}(n) + (2n + 1)$ 定义。用归纳法证明 $\mathit{odds}(n) = n^2$。然后在 Isabelle 中定义 `odds`，并在那里证明同一条引理。

::: solution
基础情形：$\mathit{odds}(0) = 0 = 0^2$。归纳步骤：假设 $\mathit{odds}(n) = n^2$。先用定义、再用归纳假设，得 $\mathit{odds}(n + 1) = \mathit{odds}(n) + 2n + 1 = n^2 + 2n + 1 = (n + 1)^2$。由归纳法，$\mathit{odds}(n) = n^2$ 对每个 $n$ 都成立。

```isabelle
fun odds :: "nat ⇒ nat" where
  "odds 0 = 0"
| "odds (Suc n) = odds n + (2 * n + 1)"

lemma odds_square: "odds n = n * n"
  by (induction n) auto
```
:::
::::

:::: exercise 用两种硬币付款 {#ex-5-5} ★★
用强归纳法证明：每个不少于 12 分的金额，都能恰好用 4 分和 5 分的硬币付清。提示：直接处理 12、13、14 和 15；对于更大的金额，考虑这个金额减去 4。

::: solution
令 $P(n)$ 为：“如果 $n \ge 12$，那么存在自然数 $a$ 和 $b$，使得 $n = 4a + 5b$”。设 $n \ge 12$，并假设 $P(m)$ 对每个 $m < n$ 都成立。

- $12 = 4 \cdot 3$，$13 = 4 \cdot 2 + 5$，$14 = 4 + 5 \cdot 2$，$15 = 5 \cdot 3$。
- 如果 $n \ge 16$，那么 $12 \le n - 4 < n$，所以由归纳假设，存在 $a$ 和 $b$ 使得 $n - 4 = 4a + 5b$，于是 $n = 4(a + 1) + 5b$。

由强归纳法，$P(n)$ 对每个 $n$ 都成立。归纳步骤要往回看四个数，而不是一个，所以在这里强归纳法是最顺手的工具。界限 12 已经是最好的了：11 分付不清，因为 $11 = 4a + 5b$ 没有自然数解。
:::
::::

:::: exercise 掰巧克力 {#ex-5-6} ★★
一块巧克力有 $m \times n$ 个小格。你要把它掰成一个个单独的小格。每掰一次，就是拿起一块，沿着小格之间的一条线把它分成两块。找出一个不变式，把块数和到目前为止掰过的次数联系起来，并用它证明：无论怎样掰，都恰好需要掰 $m \cdot n - 1$ 次。

::: solution
不变式：**块数 = 掰过的次数 + 1**。初始时有 1 块，掰过 0 次。每掰一次都把一块变成两块，所以块数和次数都增加 1，等式保持成立。由这个不变式，当巧克力变成 $m \cdot n$ 个单独的小格时，掰过的次数就是 $m \cdot n - 1$，无论你按什么顺序掰。这个过程也会终止：$m \cdot n - \text{块数}$ 是一个度量，它是一个每掰一次就减少 1 的自然数。
:::
::::

:::: exercise 中序遍历 {#ex-5-7} ★★★
函数 `inorder` 借助库中的 `@`，从左到右列出树中的元素：

```text
inorder Tip = []
inorder (Node l x r) = inorder l @ [x] @ inorder r
```

1. 在纸上证明 `inorder (mirror t) = rev (inorder t)`。你可以使用库中的事实 `rev (xs @ ys) = rev ys @ rev xs`、`(xs @ ys) @ zs = xs @ (ys @ zs)` 和 `rev [x] = [x]`。
2. 在 Isabelle 中定义 `inorder`，并证明 `length (inorder t) = nodes t` 和 `inorder (mirror t) = rev (inorder t)`。

::: solution
1. 对 `t` 做结构归纳。基础情形：`inorder (mirror Tip) = inorder Tip = [] = rev []`，也就是 `rev (inorder Tip)`。归纳步骤，两个归纳假设为 `inorder (mirror l) = rev (inorder l)` 和 `inorder (mirror r) = rev (inorder r)`：

   ```text
     inorder (mirror (Node l x r))
   = inorder (Node (mirror r) x (mirror l))            由 mirror.2
   = inorder (mirror r) @ [x] @ inorder (mirror l)     由 inorder.2
   = rev (inorder r) @ [x] @ rev (inorder l)           由两个归纳假设
   = rev (inorder r) @ rev [x] @ rev (inorder l)       因为 rev [x] = [x]
   = rev (inorder l @ [x] @ inorder r)                 两次使用 rev 关于 @ 的定律
   = rev (inorder (Node l x r))                        由 inorder.2
   ```

   标有“两次使用”的那一步还用到了 `@` 的结合律，以便把三个部分重新分组。

2. 在 Isabelle 中：

   ```isabelle
   fun inorder :: "'a tree2 ⇒ 'a list" where
     "inorder Tip = []"
   | "inorder (Node l x r) = inorder l @ [x] @ inorder r"

   lemma length_inorder: "length (inorder t) = nodes t"
     by (induction t) auto

   lemma inorder_mirror: "inorder (mirror t) = rev (inorder t)"
     by (induction t) auto
   ```

   两个证明用 `auto` 都能通过，因为库中已经证明了它们所需要的关于 `@`、`rev` 和 `length` 的事实（例如 `rev_append` 和 `length_append`），并把这些事实声明为化简规则。
:::
::::

:::: exercise 哪些定义会终止？ {#ex-5-8} ★★★
对下面每个定义，判断它的每次求值是否都会终止。如果会，给出一个度量；如果不会，给出一个使它永远运行下去的参数。然后预测 `fun` 是否接受这个定义，并在 Isabelle 中检查。

1. `half 0 = 0`、`half (Suc 0) = 0` 和 `half (Suc (Suc n)) = half n + 1`
2. `nbits n = (if n = 0 then 0 else nbits (n div 2) + 1)`
3. `nbits2 n = nbits2 (n div 2) + 1`
4. `count_up i n = (if i < n then count_up (i + 1) n + 1 else 0)`

（`n div 2` 是 $n / 2$ 向下取整的结果。）

::: solution
1. 会终止，度量为 $n$：调用从 $n + 2$ 到 $n$。`fun` 接受它。
2. 会终止，度量为 $n$：递归调用只在 $n \ne 0$ 时发生，而这时 $n \mathbin{\mathrm{div}} 2 < n$。`fun` 接受它，因为它在比较参数时会把 `if` 的条件考虑进去。

   ```isabelle
   fun half :: "nat ⇒ nat" where
     "half 0 = 0"
   | "half (Suc 0) = 0"
   | "half (Suc (Suc n)) = half n + 1"

   fun nbits :: "nat ⇒ nat" where
     "nbits n = (if n = 0 then 0 else nbits (n div 2) + 1)"
   ```

   ```output all
   consts
     half :: "nat ⇒ nat"

   Found termination order: "size <*mlex*> {}"

   consts
     nbits :: "nat ⇒ nat"

   Found termination order: "size <*mlex*> {}"
   ```

3. 当 $n = 0$ 时不终止：`0 div 2 = 0`，所以 `nbits2 0` 会再次调用 `nbits2 0`。更糟的是，$n = 0$ 时的等式是 `nbits2 0 = nbits2 0 + 1`，这正是 `bad` 的那种矛盾。`fun` 拒绝这个定义：

   ```isabelle fails
   fun nbits2 :: "nat ⇒ nat" where
     "nbits2 n = nbits2 (n div 2) + 1"
   ```

   ```output
   consts
     nbits2 :: "nat ⇒ nat"

   *** Unfinished subgoals:
   *** (a, 1, <):
   ***  1. ⋀n. n div 2 < n
   *** Calls:
   ***   a) n ~> n div 2
   *** Measures:
   ***   1) size
   *** Result matrix:
   ***     1
   *** a:  <=
   ***
   *** Could not find lexicographic termination order.
   ```

   未完成的子目标 `n div 2 < n` 在 $n = 0$ 时为假。

4. 会终止，度量为 $n - i$：只要 $i < n$，它在每次调用时都减少 1。但两个参数都没有变小，所以 `fun` 找不到终止序：这和第 5.7 节中 `sum_from` 的情况一样。模块 8 会再谈这样的定义。

   ```isabelle fails
   fun count_up :: "nat ⇒ nat ⇒ nat" where
     "count_up i n = (if i < n then count_up (i + 1) n + 1 else 0)"
   ```

   ```output
   consts
     count_up :: "nat ⇒ nat ⇒ nat"

   *** Unfinished subgoals:
   *** (a, 1, <):
   ***  1. ⋀i n. i < n ⟹ False
   *** (a, 2, <):
   ***  1. ⋀i n. i < n ⟹ False
   *** (a, 2, <=):
   ***  1. ⋀i n. i < n ⟹ False
   *** (a, 3, <):
   ***  1. ⋀i n. i < n ⟹ False
   *** Calls:
   ***   a) (i, n) ~> (i + 1, n)
   *** Measures:
   ***   1) λp. size (snd p)
   ***   2) λp. size (fst p)
   ***   3) size
   *** Result matrix:
   ***     1  2  3
   *** a:  <= ?  <=
   ***
   *** Could not find lexicographic termination order.
   ```
:::
::::

## 自测题 {#quiz}

```quiz
? 在证明“$P(n)$ 对所有 $n$ 成立”的归纳步骤中，你可以假设什么？
- [ ] $P(n + 1)$
- [x] 对任意的 $n$ 假设 $P(n)$，以便证明 $P(n + 1)$
- [ ] $P(n)$ 对每个 $n$ 都成立
- [ ] 什么也不能假设：归纳步骤必须在没有任何假设的情况下证明
> 归纳假设是关于眼前这个 $n$ 的 $P(n)$。假设 $P(n + 1)$，或者假设 $P(n)$ 对每个 $n$ 都成立，就等于假设了你要证明的东西。

? `apply (induction xs)` 之后，Isabelle 显示子目标 `⋀a xs. P xs ⟹ P (a # xs)`。它说的是什么？
- [ ] $P$ 对 `a` 和 `xs` 都成立
- [ ] `P xs` 与 `P (a # xs)` 等价
- [x] 对任意的 `a` 和 `xs`：如果 `P xs` 成立，那么 `P (a # xs)` 成立
- [ ] 存在 `a` 和 `xs`，使得 `P (a # xs)` 成立
> `⋀` 使 `a` 和 `xs` 成为任意的。`⟹` 的左边是归纳假设，右边是要证明的陈述。

? 为什么 Isabelle 坚持要求每个用 `fun` 定义的函数都终止？
- [x] 否则像 `f n = f n + 1` 这样的定义就可以用来证明 `0 = 1` 这样的假陈述
- [ ] 因为 `value` 会永远运行下去
- [ ] 因为不终止的函数无法编译
- [ ] 因为终止性能让化简器运行得更快
> 在 HOL 中，每个函数都是全函数，而定义中的等式是在断言某件事为真。一个不终止的递归可能根本没有解，接受这样的等式会使逻辑不一致。`fun` 不去区分这类情况和无害的情况，所以它坚持要求终止性证明。

? 哪个度量能说明 `app` 会终止？
- [ ] 第二个参数的长度
- [ ] 元素之和
- [x] 第一个参数的长度
- [ ] 结果的长度
> `app (x # xs) ys` 调用 `app xs ys`：第一个参数少了一个元素，而第二个参数保持不变。

? 要证明 $P(n)$，你需要某个 $m$ 的 $P(m)$，而这个 $m$ 可以是任何比 $n$ 小的数。哪种证明方法合适？
- [ ] 普通的归纳，因为每个 $m < n$ 都可以从 0 到达
- [ ] 列表上的结构归纳法
- [ ] 按 $n$ 是否为偶数分情况证明
- [x] 强归纳法
> 强归纳法允许你假设 $P(m)$ 对每个 $m < n$ 都成立，而不只是 $P(n - 1)$。

? `by (induction xs) auto` 失败了，剩下的目标中含有 `reverse (app (reverse xs) [a])`。通常最好的下一步是什么？
- [ ] 对一个没有在目标中出现的变量做归纳
- [x] 证明一条关于 `reverse` 怎样作用在 `app` 上的引理，把它声明为 `[simp]`，然后再试一次
- [ ] 把 `auto` 换成 `simp`
- [ ] 放弃：这个陈述一定是错的
> 卡住的目标表明缺少的是哪个事实。把引理 `reverse (app xs ys) = app (reverse ys) (reverse xs)` 作为化简规则之后，证明就能通过。
```
