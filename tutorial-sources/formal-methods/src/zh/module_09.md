---
title: 证明自动化
part: 3
lead: 理解 Isabelle 的自动化工具如何工作。引导化简器，为逻辑、集合或算术选择证明方法，查找引理与反例，使用 Sledgehammer，并在自动化失败后继续推导。
minutes: 210
needs: 模块 1–8，尤其是归纳（模块 5）、规则（模块 7）和定义（模块 8）
goals:
  - 解释化简器怎样重写目标，并用化简规则以及 `add:`、`del:`、`only:` 和 `split:` 引导它
  - 认出条件规则、情形拆分和会导致循环的规则，并读懂化简器的跟踪信息
  - 在 `simp`、`auto`、`blast`、`force`、`fastforce` 和各种算术方法之间做出选择，并认出每种方法失败时的表现
  - 用 `find_theorems` 搜索库，并在证明断言之前先用 Quickcheck 和 Nitpick 检验它们
  - 运行 Sledgehammer，使用它建议的证明，并解释为什么可以信任这些证明
  - 自动化失败时，按照一套步骤找出原因
imports: Main
---

## 自动化工具箱 {#toolbox}

从模块 1 开始，你就一直在用一个词结束证明：`by simp`、`by auto`、`by blast`。每个这样的词都会启动一个搜索证明的程序。它成功时，能为你省下几十次规则应用；它失败时，又可能让你摸不着头脑：目标（goal）看起来很简单，Isabelle 却只说这个方法失败了。本模块就来打开这个工具箱。你将了解这些工具是怎样工作的，每个工具擅长什么，怎样引导它们，以及当它们都不管用时该怎么办。

首先，回顾为何安全使用内部机制细节未知的工具：在 Section 1.4 中介绍了 LCF 架构：普通完成的证明由内核推理构建。此处使用的证明方法遵循此路径。搜索可能失败或运行很长时间，但其结果仅通过从给定假设和公理出发的已检查推理成为定理。Admissions 和 oracle 配置绕过此保证。`find_theorems`、Quickcheck 和 Nitpick 等搜索工具本身并不证明目标。Sledgehammer 重构的证明也经过检查，尽管它调用了 Isabelle 外部的程序；Section 9.8 展示了具体方法。

| 工具 | 它做什么 | 适用于 |
|---|---|---|
| `simp` | 用等式从左往右重写目标 | 等式、定义、列表和数上的函数 |
| `auto` | `simp` 加上逻辑推理，作用于每个子目标 | 一次处理许多简单的子目标 |
| `blast` | 用逻辑规则搜索证明 | 逻辑、集合和关系 |
| `force`、`fastforce` | 逻辑与重写相结合，作用于第一个子目标 | 量词与等式交织在一起的目标 |
| `linarith`、`arith`、`presburger` | 证明线性算术中的事实 | 不等式；奇数和偶数；除以常数的 `div` 和 `mod` |
| `find_theorems` | 搜索库 | 找到你需要的引理 |
| `quickcheck`、`nitpick` | 搜索反例 | 在试图证明一个断言之前先检验它 |
| `sledgehammer` | 求助于外部证明器，返回一个由 Isabelle 检查的证明 | 能由几条库引理推出的目标 |

### 贯穿本模块的例子：访问控制 {#acl}

为了让每个工具都有实实在在的工作可做，本模块自始至终使用同一个例子。一个文档共享服务要决定谁可以对每个文档做什么。它为每个文档保存一张**访问控制列表**（access-control list，ACL）：这是一个由条目组成的列表，每个条目给予一个用户一项权限。

```isabelle
datatype perm = Read | Write | Admin

type_synonym 'u acl = "('u × perm) list"
```

数据类型（datatype）`perm` 有三个值：`Read`（读）、`Write`（写）和 `Admin`（管理）。`type_synonym` 给一个类型起一个更短的名字：`'u acl` 就是类型 `('u × perm) list`，即由“用户和权限”组成的有序对（pair）的列表。类型变元（type variable）`'u` 是用户的类型。下面的例子使用 `''ann''` 这样的字符串；在 Isabelle 中，字符串的两边各写两个单引号。

```isabelle
fun allows :: "'u acl ⇒ 'u ⇒ perm ⇒ bool" where
  "allows [] u p = False"
| "allows (e # es) u p = (e = (u, p) ∨ allows es u p)"

definition grant :: "'u ⇒ perm ⇒ 'u acl ⇒ 'u acl" where
  "grant u p es = (u, p) # es"

fun revoke :: "'u ⇒ 'u acl ⇒ 'u acl" where
  "revoke u [] = []"
| "revoke u (e # es) = (if fst e = u then revoke u es else e # revoke u es)"
```

函数名 `allows`、`grant` 和 `revoke` 的意思分别是“允许”“授予”和“撤销”。当列表 `es` 给予用户 `u` 权限 `p` 时，也就是当某个条目恰好是有序对 `(u, p)` 时，`allows es u p` 成立。`grant u p es` 把条目 `(u, p)` 加在列表的最前面。`revoke u es` 删除用户 `u` 的所有条目：`fst e` 是有序对 `e` 的第一个分量，也就是它的用户。注意，`grant` 是用 `definition` 定义的，另外两个函数则是用 `fun` 定义的。你会在第 9.2 节看到，这个区别对化简器很重要。简单测试一下：

```isabelle
value "allows [(''ann'', Read), (''bob'', Write)] ''bob'' Write"
```

```output
"True"
  :: "bool"
```

```isabelle
value "revoke ''ann'' (grant ''ann'' Admin [(''bob'', Write), (''ann'', Read)])"
```

```output
"[(''bob'', Write)]"
  :: "(char list × perm) list"
```

第二个结果中的类型表明，字符串是由字符组成的列表，即 `char list`。

## 用化简器重写 {#simp}

### 纸上的重写 {#rewriting}

化简器（simplifier）只做一件事：**重写**（rewrite）。给定一个等式 `l = r`，它在目标中寻找具有 `l` 的形状的部分，并把这部分替换为 `r` 的相应实例。它不断重复这一步，直到再也没有等式可用。如果目标变成了 `True`，它就得证了。

下面是一个用到四个等式的例子。前两个是 `grant` 的定义和 `allows` 的第二个等式；另外两个是逻辑定律。

| 编号 | 等式 |
|---|---|
| (1) | `grant u p es = (u, p) # es` |
| (2) | `allows (e # es) u p = (e = (u, p) ∨ allows es u p)` |
| (3) | `(x = x) = True` |
| (4) | `(True ∨ P) = True` |

::: example 把目标重写成 True
考虑目标 `allows (grant u Read es) u Read`：用户 `u` 被授予读权限之后，就可以读。

1. 子项 `grant u Read es` 具有 (1) 左边的形状，其中 `u` 取 `u`，`p` 取 `Read`，`es` 取 `es`。替换它，目标变成 `allows ((u, Read) # es) u Read`。
2. 现在整个目标具有 (2) 左边的形状，其中 `e` 取 `(u, Read)`。替换它，得到 `(u, Read) = (u, Read) ∨ allows es u Read`。
3. 子项 `(u, Read) = (u, Read)` 与 (3) 匹配，其中 `x` 取 `(u, Read)`，于是得到 `True ∨ allows es u Read`。
4. 这与 (4) 匹配：目标变成了 `True`，证明完成。

等式 (2) 始终不会重写 `allows es u Read`，因为 `es` 不具有 `e # es` 的形式。目标的这一部分保持原样，不过到第 4 步之后，它已经无关紧要了。
:::

等式中的变量是占位符。在 Isabelle 显示的定理中，它们带有问号，例如 `?u`，就像模块 7 中的图式变量（schematic variable）一样。要使用一个等式，化简器就要为等式中的变量找到一些项，使等式的左边与目标的某一部分完全相同。这叫做**匹配**（matching）。它就是模块 7 中的合一（unification），只不过只朝一个方向进行：等式中的变量可以被实例化，目标中的变量则不可以。

::: definition 重写
**重写规则**（rewrite rule）是只从左往右使用的等式 `l = r`。用一组规则**重写**一个项，就是一次又一次地找出一个子项，它是某个左边 `l` 的实例，然后把它替换为右边 `r` 的相同实例。任何规则都无法再重写的项叫做**范式**（normal form）。化简器通过把目标重写成 `True` 来证明它。
:::

在逻辑中，`l = r` 和 `r = l` 表达相同含义。化简器仍仅沿单一方向使用每个等式，从而避免双向搜索。普通重写由内向外进行，如图 9.1 所示。同余规则可控制简化部分及其假设条件：例如，`if` 的条件可先被简化，其分支在该条件下被简化。

::: figure id=fig-09-1
化简器处理 `allows (grant u Read es) u Read` 的过程。每一步都用箭头旁标出的规则重写高亮的部分。内部的部分先于包含它们的项被重写。
:::

### 在 Isabelle 中观察 {#simp-only}

你可以让 Isabelle 逐步执行示例中的步骤。`simp only: r₁ r₂` 清除普通重写规则，并使用 `r₁ r₂`，结合第 9.2.4 节中描述的假设和内置支持：

```isabelle
lemma "allows (grant u Read es) u Read"
  apply (simp only: grant_def)
```

```output state
proof (prove)
goal (1 subgoal):
 1. allows ((u, Read) # es) u Read
```

`grant_def` 是 `definition` 命令生成的定理：`grant ?u ?p ?es = (?u, ?p) # ?es`。它就是规则 (1)。规则 (2) 属于 `allows.simps`，即 `fun` 为 `allows` 证明的那些等式：

```isabelle
  apply (simp only: allows.simps)
```

```output state
proof (prove)
goal (1 subgoal):
 1. (u, Read) = (u, Read) ∨ allows es u Read
```

就连 `(u, Read) = (u, Read)` 也原封未动，因为你没有允许任何适用于它的规则。规则 (3) 和 (4) 属于 `simp_thms`，这是一组基本的逻辑定律：

```isabelle
  apply (simp only: simp_thms)
  done
```

```output state
proof (prove)
goal:
No subgoals!
```

### 化简规则从哪里来 {#simp-rules}

不带任何修饰的 `simp` 不需要你给出规则列表。它使用**化简规则集**（simp set），这是一个随着理论的加载而不断增长的庞大规则集合，其中包括：

- 每个用 `fun` 或 `primrec` 定义的函数的等式，例如 `allows.simps` 和 `revoke.simps`；
- `datatype` 证明的事实：各个构造子（constructor）互不相同（`Read ≠ Write`），而且同一个构造子作用于不同的参数会得到不同的值，所以 `(x # xs = y # ys) = (x = y ∧ xs = ys)`；
- 库中成千上万条带有属性（attribute）`[simp]` 的引理，例如 `rev (rev xs) = xs`；
- 你自己的引理，只要你给它们加上 `[simp]`。

::: definition 化简规则与化简规则集
**化简规则**（simp rule）是化简器无需告知就会使用的定理。**化简规则集**是理论中某一处的全部化简规则。在引理的名字后面写上 `[simp]`，或者之后用 `declare name [simp]` 声明，就能使它成为化简规则；`declare name [simp del]` 则把它重新移除。
:::

列表缺少一项：由`definition`引入的等式默认不是 simp 规则，因此`simp`将`grant`视为未知函数：

```isabelle fails
lemma "allows (grant u Read es) u Read"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (grant u Read es) u Read
```

此处“Failed to apply initial proof method”表示`simp`对目标未产生进展：没有适用的规则展开`grant`或证明周围的主张。指示`simp`使用带有`add:`的定义

```isabelle
lemma "allows (grant u Read es) u Read"
  by (simp add: grant_def)
```

为什么定义不是化简规则？一个定义引入一个新概念，例如“授予一项权限”。一旦你证明了这个概念的那些你需要的性质，以后的证明就应该使用这些性质，而不是定义本身。这样，如果以后修改了定义，只有这些性质的证明需要跟着修改。所以通常的做法是：为定义出来的函数证明几条定律，并让这些定律成为化简规则：

```isabelle
lemma allows_grant [simp]:
  "allows (grant u p es) v q = ((u, p) = (v, q) ∨ allows es v q)"
  by (simp add: grant_def)
```

从现在起，`simp` 知道 `allows` 和 `grant` 是怎样配合工作的，而不必去看 `grant` 的内部：

```isabelle
lemma "allows (grant u Read (grant v Write es)) v Write"
  by simp
```

::: pitfall
对化简器来说，`u = v` 和 `v = u` 是不同的项，化简规则集中也没有哪条规则能把其中一个变成另一个。所以，等式的书写顺序可能决定 `simp` 能否成功。陈述 `allows_grant` 时把其中那个等式的两边对调，同样的证明就会失败：

```isabelle fails
lemma "allows (grant u p es) v q = ((v, q) = (u, p) ∨ allows es v q)"
  by (simp add: grant_def)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. (u = v ∧ p = q ∨ allows es v q) = (v = u ∧ q = p ∨ allows es v q)
```

化简器把两边都尽可能地重写了，最后左边剩下 `u = v ∧ p = q`，右边剩下 `v = u ∧ q = p`。陈述引理时，要采用定义展开后自然得到的那个方向。
:::

### `add:`、`del:`、`only:` 和 `simp_all` {#modifiers}

现在你已经见过改变化简器所用规则的大部分办法了。下面把它们放在一起。

| 方法 | 使用的规则 |
|---|---|
| `simp` | 化简规则集，以及第一个子目标的假设 |
| `simp add: a b` | 化简规则集，再加上定理 `a` 和 `b` |
| `simp del: a` | 去掉 `a` 之后的化简规则集 |
| `simp only: a b` | 只用 `a` 和 `b`，再加上假设 |
| `simp_all` | 与 `simp` 相同，但作用于每个子目标 |

即使用了 `only:`，也还有几个内置的辅助功能会保留下来：化简器仍然会了结已经变得平凡的目标，例如 `t = t`，而且仍然可能调用线性算术（第 9.5 节）来完成目标。

`del:` 在一次调用中去掉一条规则，例如一条会把项重写成你不想要的形式的化简规则。没有了 `allows_grant`，化简器又回到了起点：

```isabelle fails
lemma "allows (grant u Read (grant v Write es)) v Write"
  by (simp del: allows_grant)
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (grant u Read (grant v Write es)) v Write
```

`simp` 只作用于第一个子目标（subgoal）。`induction` 之后通常有好几个子目标，`simp_all` 会把它们全部化简。下面是后面几节要用到的一条定律：

```isabelle
lemma allows_append [simp]:
  "allows (es @ fs) u p = (allows es u p ∨ allows fs u p)"
  apply (induction es)
```

```output state
proof (prove)
goal (2 subgoals):
 1. allows ([] @ fs) u p = (allows [] u p ∨ allows fs u p)
 2. ⋀a es.
       allows (es @ fs) u p = (allows es u p ∨ allows fs u p) ⟹
       allows ((a # es) @ fs) u p = (allows (a # es) u p ∨ allows fs u p)
```

```isabelle
  apply simp_all
  done
```

在第二个子目标中，化简器把归纳假设（induction hypothesis）——这个子目标的一个假设（assumption）——用作了重写规则。第 9.3 节会解释 simp 怎样使用假设。

::: keyidea
为理解 simplifier，需从 simp set 中的定向规则、用户添加的规则以及假设入手，内置求解器与 case-splitting 规则亦会参与贡献；当 `simp` 失败时，应追问其所需的方程或 split 规则为何，以及是否已提供该规则。
:::

::: trouble
`by` 失败时会给出两种消息，它们的含义不同：

- **“初始证明方法应用失败”**：该方法未产生任何成功的初始结果。对于
  `simp`，它通常意味着没有进展。往往是因为定义未被展开，或者所需的引理未被设为 simp 规则。
- **“Failed to finish proof”**（未能完成证明）：方法有所进展，但没有证明目标。消息会显示剩下的部分。读一读它：它告诉你化简器做不到的是什么。
:::

## 引导化简器 {#steering}

### 条件重写规则 {#conditional}

许多有用的等式只在某个条件下成立。撤销 `u` 的条目不会改变另一个用户 `v` 能做的事，但前提是 `v` 确实是另一个用户：

```isabelle
lemma revoke_other [simp]: "v ≠ u ⟹ allows (revoke u es) v p = allows es v p"
  by (induction es) auto

lemma revoke_self [simp]: "allows (revoke u es) u p = False"
  by (induction es) auto
```

::: definition 条件重写规则
**条件重写规则**（conditional rewrite rule）的形式是 `H ⟹ l = r`，有多个条件时是 `⟦H₁; …; Hₙ⟧ ⟹ l = r`。在把 `l` 的一个实例替换为 `r` 的相同实例之前，化简器会尝试通过化简来证明每个条件 `Hᵢ` 的相同实例。如果证明不了，它就不使用这条规则。
:::

两个具体的用户是不同的，化简器能证明这一点：

```isabelle
lemma "allows (revoke ''ann'' es) ''bob'' Read = allows es ''bob'' Read"
  by simp
```

为了在这里使用 `revoke_other`，化简器必须证明条件 `''bob'' ≠ ''ann''`。它做到了：它把这个条件化简成了 `True`，因为这两个字符串的第一个字符不同。如果用变量代替这两个名字，条件就无法证明，这条规则也就不会被使用：

```isabelle fails
lemma "allows (revoke u es) v p = allows es v p"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (revoke u es) v p = allows es v p
```

化简器停下来是对的：当 `v = u` 时，这个断言是错的。

::: pitfall
规则的条件必须比它的左边简单，否则化简器可能会兜圈子。规则 `Suc n < m ⟹ (n < m) = True` 本身是对的，但作为化简规则它毫无用处：要重写 `n < m`，化简器必须先证明 `Suc n < m`；而只要能证明 `Suc (Suc n) < m`，同一条规则又会去重写 `Suc n < m`，依此类推。化简器要嵌套尝试 40 次才会放弃（40 是它的选项 `simp_depth_limit` 的默认值），然后让 `n < m` 保持原样。
:::

### simp 怎样使用假设 {#assumptions}

默认情况下，化简器会把子目标的假设，也就是 ⟹ 之前的那些公式，用作额外的重写规则，而且也会化简这些假设。它把每个假设变成一条规则：

- 等式 `t = s` 通常用来把 `t` 重写成 `s`；
- 否定式 `¬ P` 变成 `P = False`，所以 `v ≠ u` 变成 `(v = u) = False`；
- 其他任何公式 `P` 都变成 `P = True`；
- `∀x. P x ⟶ Q x` 变成条件规则 `P ?x ⟹ Q ?x = True`。

所以，只要加上它所需要的假设，上面那个错误的断言就变成正确的，并且可以用 `simp` 证明：

```isabelle
lemma "v ≠ u ⟹ allows (revoke u es) v p = allows es v p"
  by simp
```

这个假设给出了规则 `(v = u) = False`，它证明了 `revoke_other` 的条件 `v ≠ u`。列表中的最后一种假设，则说明了 simp 怎样使用关于所有用户的一般事实。假设每个可以写的用户也都可以读，并且 `u` 可以写：

```isabelle
lemma "⟦∀w. allows es w Write ⟶ allows es w Read; allows es u Write⟧
       ⟹ allows es u Read"
  by simp
```

第一个假设变成了条件规则 `allows es ?w Write ⟹ allows es ?w Read = True`。为了用它重写目标 `allows es u Read`，化简器必须证明 `allows es u Write`，而第二个假设（现在是规则 `allows es u Write = True`）做到了这一点。

::: tip
假设也可能让化简器陷入循环。像 `∀x. f x = g (f (g x))` 这样的假设会变成一条规则，它把 `f x` 重写成一个含有 `f (g x)` 的项，而同一条规则又会重写这个 `f (g x)`，如此永无止境。（对于较简单的情况，例如 `∀x. f x = g (f x)`，Isabelle 会察觉并把规则反过来用，但对这个例子不会。）如果目标中有这样一个证明用不到的假设，可以改用 `simp (no_asm)`，它会忽略子目标的假设。第 9.8 节展示了一个目标，它自己的假设就让化简器不停地兜圈子。
:::

### 情形拆分 {#splits}

包含`if c then a else b`的目标在化简器无法确定`c`或将两个分支归约到同一项时可能陷入停滞，此时它可使用此库规则**split**将目标拆分为`c`成立与不成立两种情况

```isabelle
thm if_split
```

```output result
?P (if ?Q then ?x else ?y) = ((?Q ⟶ ?P ?x) ∧ (¬ ?Q ⟶ ?P ?y))
```

把 `?P` 读作“目标中包围着这个 `if` 的其余部分”。化简器会自动拆分 `if`。在证明一条关于 `revoke` 的定律时，你可以观察到这一点，因为 `revoke` 的定义中含有一个 `if`：

```isabelle
lemma allows_revoke: "allows (revoke u es) v p = (v ≠ u ∧ allows es v p)"
  apply (induction es)
  apply simp_all
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a es.
       allows (revoke u es) v p = (v ≠ u ∧ allows es v p) ⟹
       (fst a = u ⟶
        (v ≠ u ∧ allows es v p) = (v ≠ u ∧ (a = (v, p) ∨ allows es v p))) ∧
       (fst a ≠ u ⟶
        (a = (v, p) ∨ v ≠ u ∧ allows es v p) =
        (v ≠ u ∧ (a = (v, p) ∨ allows es v p)))
```

基础情形（base case）已经证明了。在归纳步骤（induction step）中，化简器展开了 `revoke u (a # es)`，把以 `fst a = u` 为条件的 `if` 拆分成你看到的两个蕴涵式，并使用了归纳假设。然后它就卡住了。要继续下去，它必须从 `a = (v, p)` 推出 `fst a = v`，而化简器不会深入 `a` 这样的有序对变量的内部。你将在第 9.4 节遇到的 `auto` 会先把有序对变量替换成由两个变量组成的有序对，然后完成证明：

```isabelle
  apply auto
  done
```

`case` 表达式就不同了：化简器不会自动拆分它，因为对递归的数据类型来说，拆分可能会永远进行下去。下面是一个含有 `case` 的函数。第一个带有权限 `Admin` 的条目指明了文档的所有者（`owner`），而只有所有者才可以删除文档（`may_delete`）：

```isabelle
fun owner :: "'u acl ⇒ 'u option" where
  "owner [] = None"
| "owner (e # es) = (if snd e = Admin then Some (fst e) else owner es)"

definition may_delete :: "'u ⇒ 'u acl ⇒ bool" where
  "may_delete u es = (case owner es of None ⇒ False | Some v ⇒ v = u)"
```

类型 `'u option` 的值有 `None`（表示没有结果）和 `Some v`（表示结果为 `v`）。`snd e` 是 `e` 的第二个分量，也就是它的权限。展开定义之后，化简器卡在了 `case` 上：

```isabelle
lemma "may_delete u es = (owner es = Some u)"
  apply (simp add: may_delete_def)
```

```output state
proof (prove)
goal (1 subgoal):
 1. (case owner es of None ⇒ False | Some v ⇒ v = u) = (owner es = Some u)
```

修饰符（modifier）`split:` 指定一条拆分 `case` 的规则。对数据类型 `t`，这条规则叫做 `t.split`，所以对 `option` 来说就是 `option.split`：

```isabelle
thm option.split
```

```output result
?P (case ?option of None ⇒ ?f1.0 | Some x ⇒ ?f2.0 x) =
((?option = None ⟶ ?P ?f1.0) ∧ (∀x2. ?option = Some x2 ⟶ ?P (?f2.0 x2)))
```

这条规则把 `case` 变成两个蕴涵式，每个构造子一个，就像 `if_split` 对 `if` 所做的那样。把 `?f1.0` 读作名字为 `f1`、索引（index）为 0 的图式变量（模块 7 用 `?P5` 解释过索引）：当名字以数字结尾时，Isabelle 会在索引前加一个点，以免名字和索引连在一起。有了这条规则，化简器就能完成证明：

```isabelle
  apply (simp split: option.split)
  done
```

对列表用 `list.split`、对自然数用 `nat.split`，做法也一样。这些规则拆分的是目标的结论中的 `case`。假设中的 `case` 或 `if` 需要用变体 `option.splits` 和 `if_splits`，也就是末尾多一个 `s`。如果用 `option.split`，假设中的 `case` 会原样保留下来：

```isabelle fails
lemma "may_delete u es ⟹ owner es = Some u"
  by (simp add: may_delete_def split: option.split)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. case owner es of None ⇒ False | Some v ⇒ v = u ⟹ owner es = Some u
```

```isabelle
lemma "may_delete u es ⟹ owner es = Some u"
  by (simp add: may_delete_def split: option.splits)
```

### 会循环的规则 {#loops}

没有什么能保证重写一定会停下来。库中有化简规则 `append_assoc`：`(xs @ ys) @ zs = xs @ (ys @ zs)`。假设你把它的镜像 `xs @ (ys @ zs) = (xs @ ys) @ zs` 也添加为化简规则，那么一个含有 `es @ (fs @ gs)` 的目标就会这样被重写：

$$
\texttt{es @ (fs @ gs)} \;\to\; \texttt{(es @ fs) @ gs} \;\to\; \texttt{es @ (fs @ gs)} \;\to\; \cdots
$$

化简器永远不会停下来。在 Isabelle/jEdit 中，这个证明会一直运行，永远完成不了。把这条规则从文本中删掉，Isabelle 就会重新检查修改后的文本。

::: pitfall
保证化简规则集会终止，是你的责任。一条经验法则是：化简规则的右边应当比左边简单，条件规则的条件也应当比它的左边简单。绝不要同时添加一个等式和它的镜像。如果在某一次调用中需要一条方向相反的化简规则，就写 `simp flip: name`：它去掉这条规则，并加入它的镜像，只对这一次调用有效。
:::

有些有用的等式看起来似乎必然会循环。以任意顺序授予两项权限，得到的条目集合都相同，这是下面这条库规则的一个实例：

```isabelle
thm insert_commute
```

```output result
insert ?x (insert ?y ?A) = insert ?y (insert ?x ?A)
```

如果一再使用，这条规则会把 `x` 和 `y` 换过来又换过去。Isabelle 能认出这样的**置换规则**（permutative rule），即两边除了变量的顺序以外完全相同的规则，并且只在结果按照项上的某个固定顺序变得更小时才使用它们。所以，这条规则把两个元素交换成有序的排列，然后就停下来：

```isabelle
lemma "insert b (insert a A) = X"
  apply (simp only: insert_commute)
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. insert a (insert b A) = X
```

目标 `insert a (insert b A) = X` 已经是有序的，所以这条规则不会再作用于它。把这种**有序重写**（ordered rewriting）应用到等式的两边，就会把两边排成相同的顺序：

```isabelle
lemma "set (grant u p (grant v q es)) = set (grant v q (grant u p es))"
  by (simp add: grant_def insert_commute)
```

同样的思路也能处理满足结合律和交换律的运算符，例如 `+`、`*`、`∪` 和 `∩`。把结合律定向为从左往右，再加上两条置换规则，化简器就能把运算对象排成固定的顺序。对 `∪` 来说，这三条规则再加上另外一条，被汇集在名字 `Un_ac` 之下：

```isabelle
thm Un_ac
```

```output result
  ?A ∪ ?B ∪ ?C = ?A ∪ (?B ∪ ?C)
  ?A ∪ (?A ∪ ?B) = ?A ∪ ?B
  ?A ∪ ?B = ?B ∪ ?A
  ?A ∪ (?B ∪ ?C) = ?B ∪ (?A ∪ ?C)
```

```isabelle
lemma "C ∪ B ∪ A = X"
  apply (simp only: Un_ac)
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∪ (B ∪ C) = X
```

两个并集只要运算对象相同，无论顺序和分组如何，都会到达同一个范式，所以它们的相等可以用 `simp only: Un_ac` 证明。名字 `ac_simps` 一次汇集了许多运算符的这类规则。

### 跟踪 {#tracing}

当化简器做了出乎意料的事情时，你可以让它报告每一步。在方法前面加上 `using [[simp_trace]]`。双重方括号用来设置一个配置选项，这里只对这个证明有效：

```isabelle
lemma "allows (grant u Read es) u Read"
  using [[simp_trace]] by simp
```

**跟踪信息**（trace）出现在 **Output**（输出）面板中，位于证明状态（proof state）的下方。检查这些页面上的输出的构建过程不会记录跟踪信息，所以下面这段是从 Isabelle2026 的一次运行中复制过来的。这个证明的跟踪信息如下：

```text
[1]SIMPLIFIER INVOKED ON THE FOLLOWING TERM:
allows (grant u Read es) u Read
[1]Applying instance of rewrite rule "allows_grant":
allows (grant ?u1 ?p1 ?es1) ?v1 ?q1 ≡
(?u1, ?p1) = (?v1, ?q1) ∨ allows ?es1 ?v1 ?q1
[1]Rewriting:
allows (grant u Read es) u Read ≡ (u, Read) = (u, Read) ∨ allows es u Read
[1]Applying instance of rewrite rule "simp_thms(6)":
?x1 = ?x1 ≡ True
[1]Rewriting:
(u, Read) = (u, Read) ≡ True
[1]Applying instance of rewrite rule "simp_thms(30)":
True ∨ ?P1 ≡ True
[1]Rewriting:
True ∨ allows es u Read ≡ True
```

这些步骤对应第 9.2 节的例子，但这里化简器用了引理 `allows_grant`，没有展开 `grant`。“Applying instance of rewrite rule”指明应用的规则。例如，`simp_thms(6)` 是 `simp_thms` 中的第六条定律。重写规则用 Isabelle 元逻辑的等式 `≡` 陈述，变元带下标（`?u1`）。“Rewriting:”显示此次应用的实例，说明目标中的哪一部分被改写成什么。`[1]` 表示深度。化简器递归地证明条件规则的前提时，这些步骤标为 `[2]`。要显示它们，可把选项 `simp_trace_depth_limit` 调大，默认值为 1，例如使用 `using [[simp_trace, simp_trace_depth_limit = 3]]`。

轨迹可能很长。Isabelle/jEdit 对每个命令最多显示 1000 条轨迹消息，随后暂停并提示“Tracing paused. Stop, or continue with next 100, 1000, 10000 messages?”。若在小目标上出现此情况，应怀疑存在循环规则。完成后移除 `using [[simp_trace]]`。

## 逻辑与集合：blast、auto 及其相关工具 {#classical}

化简器进行重写，它从不搜索：它不会尝试一步后发现无果而返回尝试其他路径。许多目标需要此类搜索。应使用哪个假设？`∃` 应获得何值？Isabelle 的 **classical reasoner**（你在 Module 7 中已接触过 `blast`）通过搜索回答这些问题。它应用 Modules 6 和 7 中自然演绎的引入与消除规则，以及为集合和关系声明的规则，并在选择失败时回溯。

::: definition 安全与不安全规则
若将**安全**规则应用于可证明的目标时总能得到可证明的子目标，则该规则是`conjI`和`impI`所演示的：它们是第6.7节中的安全步骤。若某规则可能将可证明的目标转化为不可证明的目标，则该规则是**不安全**的：`disjI1`将`P ∨ Q`归约为`P`，这可能是错误的选择，且`allE`必须为变量猜测项。经典推理器自由地应用安全规则，并仅在回溯时应用不安全规则。
:::

为了使经典推理器有实际工作可做，在运行示例中扩展角色。在更大的服务中，权限属于角色，用户拥有角色。两个关系（如 Module 4 中的有序对集合）描述了这一点。当用户 `u` 拥有角色 `r` 时，`UR` 包含 `(u, r)`；当角色 `r` 授予权限 `p` 时，`RP` 包含 `(r, p)`。当用户的某个角色授予权限时，该用户就拥有此权限。Isabelle 将此关系组合写为 `UR O RP`：

```isabelle
thm relcomp_unfold
```

```output result
?r O ?s = {(x, z). ∃y. (x, y) ∈ ?r ∧ (y, z) ∈ ?s}
```

### blast {#blast}

`blast` 是用于一阶逻辑的搜索过程，该逻辑包含 Module 3 中的 ∀、∃ 及连接词，并内置了集合与关系的规则。此处存在一条策略事实：如果每个授予 `Write` 的角色也授予 `Read`，那么每个可能写入的用户均可读取。

```isabelle
lemma "⟦∀r. (r, Write) ∈ RP ⟶ (r, Read) ∈ RP; (u, Write) ∈ UR O RP⟧
       ⟹ (u, Read) ∈ UR O RP"
  by blast
```

在纸面上，证明需要一个角色 `r` 与 `(u, r) ∈ UR` 和 `(r, Write) ∈ RP` 配合，这是 `∀` 针对 `r` 的一个实例，并且角色 `r` 再次作为 `O` 中隐藏的 `∃` 的见证者。`blast` 找到了全部三个。给予用户更多角色绝不会剥夺任何权限：

```isabelle
lemma "UR ⊆ UR' ⟹ UR O RP ⊆ UR' O RP"
  by blast
```

原则上`blast`是一个**完备**的一阶逻辑方法：如果其搜索没有限制，它将找到每个有效一阶公式的证明。在实践中，其搜索是有界的，如第6.9节所述。它不调用化简器且等式推理能力有限，因此经常无法处理需要展开定义、计算函数或算术的目标：

```isabelle fails
lemma "allows (grant u Read es) u Read"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (grant u Read es) u Read
```

`blast` 要么证明目标，要么以该消息失败。它从不留下部分证明的目标，因此当它失败时，它不提供任何失败原因的提示。

### auto {#auto}

`auto` 结合了两个世界。它在每个子目标上执行化简、应用安全规则，并尝试使用不安全规则进行有界搜索。它证明能够处理的子目标，并将其余部分化简后保留在证明状态中。这使得它在处理包含许多简单部分的子目标时表现良好，并能清晰告知其无法处理的内容。以下是关于权限的一个错误声明：从 `RP` 中移除对 `(r, p)` 的引用并不会剥夺任何人的权限 `p`。

```isabelle
lemma "(u, p) ∈ UR O RP ⟹ (u, p) ∈ UR O (RP - {(r, p)})"
  apply auto
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y. ⟦(u, y) ∈ UR; (y, p) ∈ RP⟧ ⟹ (u, p) ∈ UR O (RP - {(r, p)})
```

`auto` 将组合分解，留下一个子目标，你可以将其读作关于角色的陈述。它不可证明，因为赋予 `u` 权限的角色 `y` 可能是 `r` 本身。当 `auto` 留下一个你认为简单的子目标时，请仔细阅读：它可能像这里一样为假，或者可能需要一个 `auto` 不知道的引理。第 9.7 节展示了如何自动区分这两种情况。

### force 与 fastforce {#force}

某些目标需要同时进行搜索和重写。存储服务将每条日志连续存储两次，因此集合 `A` 中的每条日志都是某个列表 `ys` 与其自身的拼接。于是 `A` 中的每条日志都具有偶数长度：

```isabelle fails
lemma "⟦∀xs ∈ A. ∃ys. xs = ys @ ys; us ∈ A⟧ ⟹ ∃n. length us = n + n"
  by auto
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. ⟦∀xs∈A. ∃ys. xs = ys @ ys; us ∈ A⟧ ⟹ ∃n. length us = n + n
```

`auto` 对此目标无法处理，`blast` 也失败，因为证明需要在搜索中间使用等式 `length (ys @ ys) = length ys + length ys`。`fastforce` 在每一步将经典推理器的搜索与化简器结合：

```isabelle
lemma "⟦∀xs ∈ A. ∃ys. xs = ys @ ys; us ∈ A⟧ ⟹ ∃n. length us = n + n"
  by fastforce
```

`force` 采用相同的方法，但搜索更彻底。有时 `fastforce` 失败时它仍能成功，代价可能是花费更长的时间。两种方法都只对第一个子目标起作用，并且都像 `blast` 一样，要么证明它，要么失败。

### clarsimp {#clarsimp}

`clarsimp` 应用安全规则与化简器。与 `auto` 不同，它不使用逻辑将目标拆分为多个子目标，并避免不安全搜索。它可以完成一个目标，否则整理目标以显示剩余部分。化简器拆分器仍可创建多个子目标，特别是在配置为拆分前提时：

```isabelle
lemma "∀u. (u, Write) ∈ UR O RP ⟶ (u, Read) ∈ UR O RP"
  apply clarsimp
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x y. ⟦(x, y) ∈ UR; (y, Write) ∈ RP⟧ ⟹ (x, Read) ∈ UR O RP
```

`clarsimp` 移除了 `∀` 和 `⟶`，并将假设 `(x, Write) ∈ UR O RP` 分解为角色 `y` 及其两个相关事实。剩余部分是问题的核心，且不可证明：没有任何内容表明角色 `y` 授予 `Read`。

| 方法 | Works on | 当它失败时 |
|---|---|---|
| `simp`, `simp_all` | 第一个子目标；所有子目标 | 留下简化后的目标，若未发生任何更改则失败 |
| `auto` | 所有子目标 | 留下未证的部分。如果目标没有变化，则失败 |
| `blast` | 第一个子目标 | 失败，且没有提示 |
| `force`, `fastforce` | 第一个子目标 | 失败，且没有提示 |
| `clarsimp` | 第一个子目标 | 留下一个经过整理（可能由化简分割）的目标，若未发生任何变化则失败 |

`auto`、`force`、`fastforce` 和 `clarsimp` 接受化简器的修饰符，写作 `simp add:`（或简写为 `simp:`）、`simp del:` 和 `split:`，因为单写 `add:` 会有歧义。这些方法也接受经典推理器的规则。按模块 7 的说法，`intro:`、`elim:` 和 `dest:` 分别用于引入、消去和析构规则。因此 `auto simp add: grant_def`（模块 4 写成 `auto simp: grant_def`）展开 `grant`，而 `blast intro: r` 允许 `blast` 使用你给出的规则 `r`。

## 算术 {#arith}

算术拥有其专属工具，因为重写和逻辑搜索均无法有效处理它。**线性算术**公式由变量、数字、`+`、`-`、`=`、`<`、`≤`及联结词构成，其中变量可与数字相乘（如`2 * x`），但不可与另一变量相乘。针对此类公式存在**决策过程**：即针对每类公式判定其是否成立，并在成立时予以证明的程序。

存储服务为每个用户分配配额。新文件可存入的条件是其大小不超过可用空间：

```isabelle
lemma "⟦used ≤ quota; new ≤ quota - used⟧ ⟹ used + new ≤ (quota :: nat)"
  by linarith
```

`linarith` 证明关于 `nat`、`int` 和 `real` 的线性算术目标。`nat` 上的减法很棘手，因为 `3 - 5 = 0` 对自然数不成立，而 `linarith` 通过区分 `used ≤ quota` 和 `quota < used` 的情况来处理它。实际上 `simp` 也证明此目标：化简器调用同一过程的快速但较弱的版本。当 `simp` 和 `auto` 留下算术目标时使用 `linarith`。

`linarith` 通过添加不等式的倍数来组合不等式，如同在实数上求解不等式组那样，并增加一条针对整数的规则：从 `a < b` 推导出 `a + 1 ≤ b`。这对于许多关于整数的目标已经足够，但并非适用于所有情况：对于 `nat` 和 `int`，`linarith` 不是判定过程。例如，它不知道偶数绝不可能是奇数。假设负载均衡器将带有偶数编号的请求发送给一个服务器，而将奇数编号的请求发送给另一个服务器；不应有任何请求同时发送到两个服务器：

```isabelle fails
lemma "(2::int) * x ≠ 2 * y + 1"
  by linarith
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. 2 * x ≠ 2 * y + 1
```

`presburger` 判定 **Presburger arithmetic**：关于整数与自然数的线性算术，包括量词、被固定数整除，以及 `div` 和 `mod` 被固定数整除。

```isabelle
lemma "(2::int) * x ≠ 2 * y + 1"
  by presburger
```

量词不是障碍。文件系统将数据存储在 3 和 5 千字节大小的块中；每个至少 8 千字节的数量都可以精确构成：

```isabelle
lemma "∀n ≥ 8. ∃a b. n = 3 * a + 5 * (b :: nat)"
  by presburger
```

`arith` 尝试 `linarith` 首先，`presburger` 在其后，因此它证明了上述三个目标。变量的乘积是另一回事：

```isabelle fails
lemma "(x::nat) ≤ y ⟹ x * x ≤ y * y"
  by linarith
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. x ≤ y ⟹ x * x ≤ y * y
```

`auto` 同样失败。该事实简单，但属于线性算术之外，因此不在这些方法所决定的范围之外。

::: fact 判定算术
Presburger 算术，即带有加法的一阶自然数理论，是可判定的（Mojżesz Presburger, 1929）。若包含变量的乘法，则不可判定，即使对于单个方程亦然：不存在一种算法能判定每个具有整数系数的多项式方程是否在整数范围内有解（Yuri Matiyasevich, 1970，完成了 Martin Davis、Hilary Putnam 和 Julia Robinson 的工作）。在实数域上，带有加法和乘法的公式再次变得可判定（Alfred Tarski），尽管决策过程在处理复杂输入时可能非常昂贵。
:::

形如 `x ≤ y ⟹ x * x ≤ y * y` 的目标为真，当且仅当 `x ≤ y` 与 `y * y < x * x` 联合无解。对于整数，不存在能始终正确回答所有此类多项式算术问题的判定过程。这并不妨碍证明方法解决特定的非线性目标，或库提供有用的定理。Isabelle 的库包含数千个关于乘法的已证事实。下一节展示如何找到所需的定理，第 9.8 节展示了一个为您查找的工具。

::: tip
决策过程需要正确的类型。`2 * x ≠ 2 * y + 1` 对实数不成立（取 `x = y + 1/2`），因此若不知 `x` 和 `y` 为整数，任何方法均无法证明它。在 `(2::int)` 中类似地标注类型，只要某数可能属于多种类型。
:::

## 搜索库 {#find}

即使由 `Main` 加载的库包含超过 20,000 个定理，且其命名遵循需要一段时间才能掌握的惯例，`find_theorems` 仍会按形状和名称进行检索。在理论文件中输入该命令，或使用 Isabelle/jEdit 的 **Query**面板：其**Find Theorems**标签页设有用于相同条件的**Find:**字段以及**Apply** 按钮。模式是带引号的项，其中 `_` 代表任意项。

```isabelle
find_theorems "rev (rev _)"
```

```output result
find_theorems
  "rev (rev _)"

found 1 theorem(s):
  List.rev_rev_ident: rev (rev ?xs) = ?xs
```

答案给出了完整名称，`List.rev_rev_ident`：理论与定理。你可以将其用作`rev_rev_ident`。对于第9.5节的乘法目标，仅凭模式会找到过多内容：

```isabelle
find_theorems (3) "_ * _ ≤ _ * _"
```

```output result
find_theorems
  "_ * _ ≤ _ * _"

found 31 theorem(s) (3 displayed):
  Nat.mult_le_mono1: ?i ≤ ?j ⟹ ?i * ?k ≤ ?j * ?k
  Nat.mult_le_mono2: ?i ≤ ?j ⟹ ?k * ?i ≤ ?k * ?j
  Nat.Suc_mult_le_cancel1: (Suc ?k * ?m ≤ Suc ?k * ?n) = (?m ≤ ?n)
```

`(3)` 将显示限制为三个匹配项。改为缩小搜索范围。给出类型，并添加第二个标准：单调性定律通常在名称中包含 `mono`。必须同时满足多个标准：

```isabelle
find_theorems "(_::nat) * _ ≤ _ * _" name: mono
```

```output result
find_theorems
  "_ * _ ≤ _ * _"
  name: "mono"

found 3 theorem(s):
  Nat.mult_le_mono1: ?i ≤ ?j ⟹ ?i * ?k ≤ ?j * ?k
  Nat.mult_le_mono2: ?i ≤ ?j ⟹ ?k * ?i ≤ ?k * ?j
  Nat.mult_le_mono: ⟦?i ≤ ?j; ?k ≤ ?l⟧ ⟹ ?i * ?k ≤ ?j * ?l
```

`mult_le_mono` fits: 与 `x ≤ y` 两次结合，得到 `x * x ≤ y * y`。化简器可将其作为条件规则使用，并从假设中证明两个条件：

```isabelle
lemma "(x::nat) ≤ y ⟹ x * x ≤ y * y"
  by (simp add: mult_le_mono)
```

你将最常使用的标准：

| 准则 | 查找定理 |
|---|---|
| `"pattern"` | 在某个位置包含该模式 |
| `name: s` | 其名称包含 `s` |
| `simp: "term"` | 那些左侧与该项匹配的等式，从而能够重写它 |
| `intro`, `elim`, `dest` | 在证明中可以作为此类规则应用于当前目标 |
| `-` 在某个标准之前 | 不满足该条件的结果 |

`simp:` 准则查找可重写某项的等式，包括当前未注册为 simp 规则的等式。

```isabelle
find_theorems simp: "set (filter _ _)"
```

```output result
find_theorems
  simp: "set (filter _ _)"

found 1 theorem(s):
  List.set_filter: set (filter ?P ?xs) = {x ∈ set ?xs. ?P x}
```

`find_consts` 通过类型查找函数。哪些函数将列表转换为集合？

```isabelle
find_consts "'a list ⇒ 'a set"
```

```output result
find_consts
  "'a list ⇒ 'a set"

found 3 constant(s):
  BNF_Greatest_Fixpoint.Succ :: "'a list set ⇒ 'a list ⇒ 'a set"
  List.coset :: "'a list ⇒ 'a set"
  List.list.set :: "'a list ⇒ 'a set"
```

除了`set`之外，答案还包含`coset`，以及一个类型包含`'a list ⇒ 'a set`作为部分的函数：`find_consts`也匹配更大类型内部的类型。

::: pitfall
在模式中使用`_`，而非变量名。在模式中，`xs`不是占位符：它仅匹配变量`xs`本身，且库定理使用其自身的变量进行陈述。应书写`"rev (rev _)"`，而非`"rev (rev xs)"`。对于运算符，需给出完整项如`"_ * _"`，而非单独使用符号`*`。
:::

## 反例：Quickcheck 与 Nitpick {#refute}

证明假命题会浪费时间，且自动化工具在假命题上失败时不会指出其假。因此，在尝试证明前应先测试声明。Isabelle 有两个反例查找器：Quickcheck（模块 1）和 Nitpick（模块 2 和 3）。使用默认设置时，Isabelle/jEdit 会在新目标上自动调用 Quickcheck；此后台检查可禁用。以下示例显式调用这些工具，你也可以这样做。

### Quickcheck {#quickcheck}

**Quickcheck** 将声明转化为程序并在其自由变元的许多值上运行。默认情况下，它系统地尝试所有不超过小规模的值。这里有一个看似合理的声明：任何拥有写权限的人也拥有读权限。

```isabelle
lemma "allows es u Write ⟹ allows es u Read"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  es = [(a⇩1, Write)]
  u = a⇩1
```

反例是一个包含单个条目的列表。`a₁` 是用户类型 `'u` 的一个值，Quickcheck 对其一无所知。仅被授予 `Write` 的用户可以写入但不能读取。该声明不是 ACL 的定律：它是某些 ACL 具有而其他 ACL 缺乏的性质。练习 9.8 将其转化为不变式。

Quickcheck 接受方括号中的选项：

| 选项 | 效果 |
|---|---|
| `quickcheck [random]` | 测试随机值而非所有小值 |
| `quickcheck [exhaustive]` | 测试所有值直至大小边界（默认值） |
| `quickcheck [size = 5]` | 设置所测试值的大小上限 |
| `quickcheck [timeout = 30]` | 在 30 秒后停止 |
| `quickcheck [expect = counterexample]` | 除非找到反例，否则报告错误；此外还有 `no_counterexample` |

```isabelle
lemma "allows es u Write ⟹ allows es u Read"
  quickcheck [random]
  oops
```

```output result
Testing conjecture with Quickcheck-random...

Quickcheck found a counterexample:
  es = [(a⇩1, Write)]
  u = a⇩1
```

如果命题涉及某个函数的结果，Quickcheck 也会显示相关项的值。给用户授权后再撤销该用户的条目，会还原原列表吗？

```isabelle
lemma "revoke u (grant u p es) = es"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  u = a⇩1
  p = Read
  es = [(a⇩1, Read)]
Evaluated terms:
  revoke u (grant u p es) = []
```

列表已包含用户 `a₁` 的条目，且 `revoke` 也移除了该条目。在真命题上，Quickcheck 报告未找到任何内容：

```isabelle
lemma "allows (revoke u es) v p = (v ≠ u ∧ allows es v p)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

这是证据，而非证明：Quickcheck 仅尝试了小值。

### Nitpick {#nitpick}

**Nitpick**的工作方式不同。它寻找使声明为假的**有限模型**，即为每个类型变元提供小的有限类型并为自由变元提供值。它将问题翻译为命题逻辑并交给 SAT 求解器。因为它直接对集合、关系和量词进行推理，所以擅长处理 Quickcheck 难以运行的声明。

关于角色的一个断言：如果角色 `r` 授予 `Read`，那么在从用户 `u` 移除 `r` 之后，该用户将不再能够读取。

```isabelle
lemma "(r::'r, Read) ∈ RP ⟹ (u::'u, Read) ∉ (UR - {(u, r)}) O RP"
  nitpick [card 'u = 1, card 'r = 2]
  oops
```

```output result varies
Nitpicking formula...

Nitpick found a counterexample for card 'r = 2 and card 'u = 1:
  Free variables:
    RP = {(r⇩1, Read), (r⇩2, Read)}
    UR = {(u⇩1, r⇩1)}
    r = r⇩2
    u = u⇩1
```

选项 `card 'r = 2` 指示 Nitpick 尝试一个恰好包含两个元素的类型 `'r`。若不使用该选项，Nitpick 会并行尝试大小为 1 到 10 的情况，且其报告的 counterexample 的大小可能因运行而异。即使使用该选项，您的运行结果仍可能显示不同的 counterexample。Nitpick 根据类型名称命名各类型的元素：`u₁` 是用户，`r₁` 和 `r₂` 是角色。解读 counterexample：两个角色均授予 `Read`，且用户 `u₁` 拥有角色 `r₁`。该声明从 `u₁` 处移除角色 `r₂`，但 `u₁` 仍可通过 `r₁` 进行读取。该声明遗漏了用户可能从其他角色获得权限的情况。添加假设“`u` 的其他任何角色均不授予 `Read`”，Nitpick 未找到任何内容；`blast` 随后证明了该声明：

```isabelle
lemma "⟦(r::'r, Read) ∈ RP; ∀r'. (u::'u, r') ∈ UR ∧ (r', Read) ∈ RP ⟶ r' = r⟧
       ⟹ (u, Read) ∉ (UR - {(u, r)}) O RP"
  nitpick [card 'u = 1, card 'r = 2]
```

```output result
Nitpicking goal:
  ⟦(r, Read) ∈ RP; ∀r'. (u, r') ∈ UR ∧ (r', Read) ∈ RP ⟶ r' = r⟧
  ⟹ (u, Read) ∉ (UR - {(u, r)}) O RP

Nitpick found no counterexample
```

```isabelle
  by blast
```

Nitpick 的反例 **genuine**在 Nitpick 验证其确实证伪该命题时成立。对于涉及无限类型如 `nat` 的命题，它可能报告反例为**potentially spurious**：有限近似可能不对应于预期类型中的任何反例。应将其视为调查线索。“无反例”亦非证明：可能存在大于 Nitpick 尝试大小的反例。在涉及列表上递归函数的命题中，Nitpick 常超时；此时 Quickcheck 是更好的工具。

| | Quickcheck | Nitpick |
|---|---|---|
| 方法 | 将断言作为程序在多个值上运行 | 使用 SAT 求解器搜索具有有限模型 |
| Strong on | 列表与数字上的函数 | 集合、关系、量词 |
| 需要 | 测试声明的可执行定义 | 支持编码；无限类型和部分构造需要近似 |
| 在 jEdit 中自动运行 | 是 | 否（可以开启） |
| 主选项 | `size` | `card` |

## Sledgehammer {#sledgehammer}

来自第 9.5 节的目标 `x * x ≤ y * y` 需要引理 `mult_le_mono`。使用 `find_theorems` 寻找它需要一些思考。**Sledgehammer** 会为你进行搜索。它将目标以及多达约一千个看似相关的库事实交给在 Isabelle 外部运行的几个自动定理证明器。如果其中一个找到了证明，Sledgehammer 会将其转换为单行 Isabelle 证明，你可以将其粘贴到你的理论中。

::: figure id=fig-09-2
从目标到已检查的证明。Sledgehammer 选择事实，将问题翻译给外部证明器，并根据证明器使用的事实重构证明。只有最后一步，由内核检查，才构成定理。
:::

Isabelle 内置了证明器（模块 1）：E、Vampire、Zipperposition 和 SPASS 是一阶和高阶逻辑的自动定理证明器；cvc5、veriT 和 Z3 是 SMT 求解器，也支持算术。Isabelle2026 还运行其部分自有证明方法，如 `metis` 和 `auto`，作为额外的“证明器”。无需信任外部程序或翻译，因为它们的答案仅用于构造内核检查的证明：

- `metis` 是 Isabelle 中的一个证明方法，它从简短列表中寻找一阶证明
  事实。使用三个事实进行搜索远比使用数千个事实容易，且每一步都通过内核。
- `smt` 将问题提交给 SMT 求解器，并在 Isabelle 中逐步回放求解器的证明。
- 当诸如`simp`或`auto`之类的普通方法利用所发现的事实时，Sledgehammer会建议它。

在下一个证明步骤应出现的位置写出 `sledgehammer`：

```isabelle
lemma "(x::nat) ≤ y ⟹ x * x ≤ y * y"
  sledgehammer
```

```output result varies
Sledgehammering...

metis found a proof...

metis: Try this: by (metis mult_le_mono mult_le_mono1) (82 ms)

cvc5 found a proof...

cvc5: Try this: by (simp add: mult_le_mono) (1 ms)

vampire found a proof...

vampire: Try this: by (simp add: mult_mono') (4 ms)

spass found a proof...

verit found a proof...

verit: Duplicate proof

zipperposition found a proof...

e found a proof...

e: Duplicate proof

zipperposition: Try this: using mult_le_mono by blast (1 ms)

spass: Try this: using mult_le_mono by presburger (1 ms)

Done
```

从顶部读取输出。“Sledgehammering...”表示证明器已启动。每个“… found a proof...”来自一个证明器。该证明器的建议紧随其后或几行之后，格式为“prover: Try this: …”，括号内为验证建议证明所花费的时间。“Duplicate proof”表示一个证明器找到了已由其他证明器提出的证明。“Done”表示所有证明器已完成。在 Isabelle/jEdit 中，点击建议即可插入。选择一个简短且快速的建议，并用它替换 `sledgehammer` 行。此处 cvc5 的建议正是你在第 9.6 节中手动找到的证明：

```isabelle
  by (simp add: mult_le_mono)
```

无论选择哪种建议，证明均由 Isabelle 方法 `simp` 执行，且内核会检查每一步。`sledgehammer` 命令本身并不进行证明：在获得证明后应将其删除。

当目标可由少数库事实推导得出且其他方法无法处理时，Sledgehammer 表现最佳。两个长度相同且可交换的日志段相等：`⟦es @ fs = fs @ es; length es = length fs⟧ ⟹ es = fs`。`blast` 在此目标上失败，`simp` 和 `auto` 表现更差：它们运行直至 Isabelle 内存耗尽。化简器使用库的 simp 规则 `append_eq_append_conv`（该规则说明当两个连接列表相等时）重写第一个假设，得到 `es = fs ∧ fs = es`。随后，它将这两个等式作为重写规则，反复将 `es` 转化为 `fs`，并将 `fs` 还原为 `es`。Sledgehammer 将相同的库引理作为事实而非重写规则使用，并建议如下证明：

```isabelle
lemma "⟦es @ fs = fs @ es; length es = length fs⟧ ⟹ es = fs"
  by (metis append_eq_append_conv)
```

你可能未曾想到以这种方式引理，但 Sledgehammer 找到了它。

Isabelle/jEdit 在窗口底部设有 **Sledgehammer**面板。将光标置于证明中并点击**Apply**：证明器在后台运行，同时你可继续工作，结果会显示在面板中，点击某个证明即可将其插入文本。**Provers:**字段列出要运行的证明器，**Cancel** 用于停止它们。

::: tip
Sledgehammer 在小型一阶目标上表现最佳。先用 `simp` 或 `auto` 进行化简，再对剩余部分调用 Sledgehammer。它不进行归纳，因此对于涉及所有列表的声明，需自行启动归纳，并对各情况调用 Sledgehammer。选项置于方括号中，例如 `sledgehammer [timeout = 60]` 可将证明器超时时间设为 60 秒而非默认的 30 秒。
:::

::: trouble
- **在 Windows 上，没有证明器启动，或出现某个证明器启动失败的消息。** Windows Defender 可能会阻止
  如 Module 1 所警告，Isabelle 的外部证明器需将 **Virus & threat protection** 整个 Isabelle 文件夹排除，正如 Isabelle 的安装页面所建议，然后再次运行 Sledgehammer。
- **没有证明器找到证明。** 目标可能为假：使用 `quickcheck` 和 `nitpick` 进行检查。它可能需要
  归纳法，或库中不存在的引理：先证明该引理。或者证明器需要更多时间：`sledgehammer [timeout = 120]`。
- **建议的`metis`调用失败或运行时间过长。**尝试列表中的另一个建议。
:::

## 当自动化失败时 {#strategy}

没有算法能对每个逻辑目标始终给出终止且正确的肯定或否定回答：一阶有效性已不可判定（Module 3）。系统化的证明搜索在原则上仍可枚举可推导的定理；对于无推导的目标，它无需终止。在实践中，有界自动化会在某些你可证明的目标上失败。然后按此大致顺序执行以下步骤。

1. **该主张是否成立？** 运行 `quickcheck` 和 `nitpick`。若找到真正的反例，则该命题
   需要修复的是逻辑，而非证明。
2. **化简并阅读。** `apply auto`（或`apply simp`）并阅读剩余部分。剩余的子目标
   展示工具无法完成的工作。
3. **展开定义。**定义方程默认不是化简规则：使用`simp add: f_def`添加它们。
4. **分情况讨论。**一个`case`需要`split: t.split`；假设中的`if`或`case`需要
   `split: if_splits` or `t.splits`.
5. **使用归纳法**当断言涉及递归类型的所有值且包含递归
   函数。启动它，然后自动处理案例。
6. **寻找或证明适用的引理。** 用 `find_theorems` 搜索。若库中没有合适的引理，则写出缺少的
   将 step 作为独立的引理并先证明它。
7. **尝试对剩余部分使用 Sledgehammer**。
8. **选择针对目标类型（图 9.3）的不同方法**。

::: figure id=fig-09-3
根据目标类型优先尝试哪个方法，当首选失败时，阅读其遗留部分并沿上述步骤列表向下推进。
:::

::: example 在步骤 1、2、4 和 5 中起作用
证明文档所有者可以管理它：如果 `owner es = Some v` 则 `allows es v Admin`。

步骤 1：`quickcheck` 在其边界内未找到反例；预期含义也表明该命题为真。步骤 5：`owner` 和 `allows` 均为列表上的递归函数，因此启动归纳法。步骤 2：令 `auto` 尽其所能。

```isabelle
lemma owner_admin: "owner es = Some v ⟹ allows es v Admin"
  apply (induction es)
  apply auto
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀a b es.
       ⟦owner es = Some v ⟹ False;
        (if b = Admin then Some (fst (a, b)) else owner es) = Some v;
        ¬ allows es v Admin⟧
       ⟹ a = v
 2. ⋀a b es.
       ⟦owner es = Some v ⟹ False;
        (if b = Admin then Some (fst (a, b)) else owner es) = Some v;
        ¬ allows es v Admin⟧
       ⟹ b = Admin
```

基本情况已证明。归纳步骤仍有两个子目标，且两者在假设中均包含 `if`：`auto` 将配对 `a` 拆分为 `a` 和 `b`，但未处理 `owner` 定义中的 `if`。第 4 步说明了操作：假设中的 `if` 需要 `split: if_splits`。

```isabelle
  oops

lemma owner_admin: "owner es = Some v ⟹ allows es v Admin"
  apply (induction es)
  apply (auto split: if_splits)
  done
```
:::

这个引理马上就能用于下一个命题。只有有权管理文档的人才能删除该文档：

```isabelle
lemma "may_delete u es ⟹ allows es u Admin"
  by (simp add: may_delete_def owner_admin split: option.splits)
```

该证明联合使用步骤 3、4 和 6：它展开 `may_delete`，拆分假设中的 `case`，并使用上述引理。

::: keyidea
自动化失败必有原因，且该原因通常可见：在剩余子目标中、在反例中，或在追踪记录中。在尝试其他方法前请先阅读。修复方案通常涉及展开一个定义、拆分一个案例、启动一个归纳法，或先证明一个引理。
:::

## 小结 {#summary}

- **化简器**使用定向等式进行重写，通常优先处理内部部分，并应用同余
  控制项下降的规则；重写为`True`的目标得证。它使用**simp set**：`fun`的方程、`datatype`的事实以及标记为`[simp]`的引理。由`definition`引入的方程默认不注册。
- `simp add:`、`simp del:` 和 `simp only:` 改变单次调用的规则；`simp_all` 作用于每一次
  子目标；`[simp]` 和 `declare … [simp]` 更改 simp 集合。
- 只有化简器能够证明其条件时，才应用**条件规则**。对于
  子目标也变为重写规则。
- `if` 被自动拆分；`case` 需要 `split: t.split`，且假设中的拆分需要 `if_splits`
  or `t.splits`.
- 重写可能陷入循环；保持右侧比左侧更简单。**交换**规则如交换律
  它们是安全的，因为 Isabelle 仅将它们应用于排序项。`using [[simp_trace]]` 展示了每一步。
- `blast` 搜索一阶逻辑、集合与关系；`auto` 化简并对所有子目标进行推理
  留下其无法证明的内容；`force` 和 `fastforce` 混合搜索与重写；`clarsimp` 整理目标。
- `linarith` 证明线性算术（在 `nat` 和 `int` 上，而非全部）；`presburger` 判定线性
  整数的算术运算，包含整除与量词；`arith` 尝试两种方法。包含变量乘积的整数算术是不可判定的；使用库引理。
- `find_theorems` 和 `find_consts` 搜索库；Quickcheck 和 Nitpick 搜索反例。
- **Sledgehammer** 向外部证明器请求证明所需的定理并重构证明
  内核检查。
- 当自动化失败时：测试主张，阅读剩余部分，展开，拆分，归纳，寻找或证明引理，
  并尝试 Sledgehammer。

## 练习 {#exercises}

:::: exercise 哪个工具？ {#ex-9-1} ★
对于每个目标，命名你首先尝试的方法，并说明原因，然后在 Isabelle 中验证你的答案。

1. `rev (rev xs @ ys) = rev ys @ xs`
2. `⟦A ⊆ B; B ∩ C ⊆ D⟧ ⟹ A ∩ C ⊆ D`
3. `⟦(a::int) < b; b < c⟧ ⟹ a + 2 ≤ c`
4. `(n::nat) mod 4 = 1 ⟹ n mod 2 = 1`
5. `allows es u Admin ⟹ allows es u Write`

::: solution
1. `simp`：关于库函数 `rev` 的等式，simp 集合对此非常熟悉。
2. `blast`: 关于集合的纯推理。
3. `linarith`: 线性算术。对于整数，`a < b` 意味着 `a + 1 ≤ b`，且 `linarith` 知晓此点。
4. `presburger`：按常数作 `mod` 的情形属于普雷斯堡算术。论证需要利用 `4 * q + 1`
   is odd，这超出了`linarith`的范围。
5. `quickcheck`: 一个仅授予 `Admin` 的访问控制列表（ACL）是一个反例，因此没有任何方法可以证明它。

```isabelle
lemma "rev (rev xs @ ys) = rev ys @ xs"
  by simp

lemma "⟦A ⊆ B; B ∩ C ⊆ D⟧ ⟹ A ∩ C ⊆ D"
  by blast

lemma "⟦(a::int) < b; b < c⟧ ⟹ a + 2 ≤ c"
  by linarith

lemma "(n::nat) mod 4 = 1 ⟹ n mod 2 = 1"
  by presburger

lemma "allows es u Admin ⟹ allows es u Write"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  es = [(a⇩1, Admin)]
  u = a⇩1
```
:::
::::

:::: exercise 手动重写 {#ex-9-2} ★
通过`revoke`和`allows`的等式以及这些定律：`fst (a, b) = a`、`(x = x) = True`和`(if True then s else t) = s`，将项`allows (revoke u [(u, Read)]) u Read`手工重写为`False`。写出每一步及其使用的规则。然后在Isabelle中确认这些规则足以证明`simp only:`。关于`fst`和`if`的两个定律分别称为`fst_conv`和`if_True`。

::: solution
先处理内部部分：

1. `revoke u [(u, Read)]` 匹配 `revoke` 的第二个方程，其中 `(u, Read)` 对应 `e`，`[]` 对应
   `es`: 它变为 `if fst (u, Read) = u then revoke u [] else (u, Read) # revoke u []`。
2. 现在这个新项的各部分。在条件中，`fst (u, Read)` 通过 `fst_conv` 变为 `u`，然后
   `u = u` 通过 `(x = x) = True` 变为 `True`。在两个分支中，`revoke u []` 通过 `revoke` 的第一个等式变为 `[]`。
3. `if True then [] else [(u, Read)]` 通过 `if_True` 变为 `[]`。
4. `allows [] u Read` 通过 `allows` 的第一个等式变为 `False`。

```isabelle
lemma "allows (revoke u [(u, Read)]) u Read = False"
  by (simp only: revoke.simps allows.simps fst_conv simp_thms if_True)
```

第4步之后，引理读作`False = False`，其中`(x = x) = True`由`simp_thms`转化为`True`。（以其他顺序进行重写，例如在化简其分支之前先解决`if`，会得到相同的结果。）
:::
::::

:::: exercise 为什么 simp 失败了？ {#ex-9-3} ★
这三个引理为真，但`by simp`对每个引理均失败。在Isabelle中尝试每个引理，阅读消息，说明证明失败的原因，并修复它。

1. `set (grant u p es) = insert (u, p) (set es)`
2. `may_delete u es ⟹ owner es ≠ None`，将 `by simp` 替换为 `by (simp add: may_delete_def)`
3. `x ∈ set (revoke u es) ⟹ fst x ≠ u`

::: solution
1. “无法应用初始证明方法”：无适用规则。`grant` 是定义，因此化简器
   它不会展开，且没有 simp 规则涉及 `set (grant u p es)`（`allows_grant` 关于 `allows` 而非 `set`）。添加 `grant_def`。
2. “证明未能完成”，且剩余目标的假设中包含位于 `owner es` 上的 `case`。一个 `case`
   在假设中仅使用`split: option.splits`进行拆分。
3. “Failed to apply initial proof method”。该断言涉及所有列表并包含递归
   定义函数 `revoke`，因此归纳法是合适的下一步。在归纳步骤中，`revoke` 的 `if` 出现在假设中，这需要 `split: if_splits`。

```isabelle
lemma "set (grant u p es) = insert (u, p) (set es)"
  by (simp add: grant_def)

lemma "may_delete u es ⟹ owner es ≠ None"
  by (simp add: may_delete_def split: option.splits)

lemma "x ∈ set (revoke u es) ⟹ fst x ≠ u"
  by (induction es) (auto split: if_splits)
```
:::
::::

:::: exercise 撤销的更多定律 {#ex-9-4} ★★
证明这三个定律。其中一些需要归纳法；选择 `simp` 或 `auto` 作为案例。

1. `revoke u (grant u p es) = revoke u es`
2. `revoke u (revoke v es) = revoke v (revoke u es)`
3. `length (revoke u es) ≤ length es`

::: solution
第一项无需归纳，仅需`grant`的定义；第二项和第三项对列表进行归纳以提供关于递归调用的事实；`revoke`包含一个`if`，由化简器进行拆分。

```isabelle
lemma "revoke u (grant u p es) = revoke u es"
  by (simp add: grant_def)

lemma revoke_commute: "revoke u (revoke v es) = revoke v (revoke u es)"
  by (induction es) auto

lemma "length (revoke u es) ≤ length es"
  by (induction es) auto
```

在第三步中，在拆分`if`之后，归纳步骤需要从归纳假设`length (revoke u es) ≤ length es`中获取`length (revoke u es) ≤ Suc (length es)`：线性算术，而`auto`做到了这一点。
:::
::::

:::: exercise 拆分案例 {#ex-9-5} ★★
定义一个函数 `latest :: "'u acl ⇒ ('u × perm) option"`，它返回列表的第一个元素，若列表为空则返回 `None`，在 `definition` 中使用 `case` 表达式。然后证明：

1. `latest (grant u p es) = Some (u, p)`
2. `(latest es = None) = (es = [])`

::: solution
```isabelle
definition latest :: "'u acl ⇒ ('u × perm) option" where
  "latest es = (case es of [] ⇒ None | e # _ ⇒ Some e)"

lemma "latest (grant u p es) = Some (u, p)"
  by (simp add: latest_def grant_def)

lemma "(latest es = None) = (es = [])"
  by (simp add: latest_def split: list.split)
```

第一个引理中的列表是 `(u, p) # es`，化简器可以直接化简 `case`，因为数据类型的 `case` 等式本身就是化简规则。第二个引理的列表为变元 `es`，必须用 `list.split` 对 `case` 作情形分析。
:::
::::

:::: exercise 配额算术 {#ex-9-6} ★★
使用算术方法证明每个目标，并说明该方法为何适用。对于最后一个目标，通过 `find_theorems` 找到所需的引理。

1. `⟦used ≤ quota; quota ≤ used + 5⟧ ⟹ quota - used ≤ (5::nat)`
2. `(x::nat) ≤ y ⟹ 3 * x ≤ 3 * y`
3. `even (n::nat) ⟹ ¬ even (n + 1)`
4. `(x::nat) ≤ y ⟹ x * z ≤ y * z`

::: solution
1. `linarith`: 线性，在 `nat` 上支持减法。
2. `linarith`: 乘以标量是线性的。
3. `presburger`: `even n` 表示 2 整除 `n`，且由数字整除的性质属于 Presburger 算术。
4. 变量乘积：非线性。`find_theorems "(_::nat) * _ ≤ _ * _" name: mono`（第9.6节）
   lists `mult_le_mono1: ?i ≤ ?j ⟹ ?i * ?k ≤ ?j * ?k`，这恰好是所声称的结论。

```isabelle
lemma "⟦used ≤ quota; quota ≤ used + 5⟧ ⟹ quota - used ≤ (5::nat)"
  by linarith

lemma "(x::nat) ≤ y ⟹ 3 * x ≤ 3 * y"
  by linarith

lemma "even (n::nat) ⟹ ¬ even (n + 1)"
  by presburger

lemma "(x::nat) ≤ y ⟹ x * z ≤ y * z"
  by (simp add: mult_le_mono1)
```
:::
::::

:::: exercise 找反例、修正、再证明 {#ex-9-7} ★★
安全审查声称：“如果用户拥有权限 `p`，那么在从角色 `r` 中移除权限 `p` 后，用户仍然拥有 `p`”。在 Isabelle 中形式化为：`(u, p) ∈ UR O RP ⟹ (u, p) ∈ UR O (RP - {(r, p)})`。使用 Nitpick 寻找反例并解释，然后添加使该声明成立的假设，并使用 `blast` 进行证明。

::: solution
```isabelle
lemma "(u::'u, p::perm) ∈ UR O RP ⟹ (u, p) ∈ UR O (RP - {(r::'r, p)})"
  nitpick [card 'u = 1, card 'r = 1]
  oops
```

```output result varies
Nitpicking formula...

Nitpick found a counterexample for card 'r = 1 and card 'u = 1:
  Free variables:
    RP = {(r⇩1, p⇩2)}
    UR = {(u⇩1, r⇩1)}
    p = p⇩2
    r = r⇩1
    u = u⇩1
```

这里 `p₂` 是三种权限之一。用户只有一个角色时，只能通过 `r` 获得 `p`。若 `r` 失去 `p`，用户也随之失去该权限。若 `u` 通过 `r` 以外的某个角色拥有 `p`，则该命题成立：

```isabelle
lemma "⟦(u, r') ∈ UR; (r', p) ∈ RP; r' ≠ r⟧ ⟹ (u, p) ∈ UR O (RP - {(r, p)})"
  by blast
```
:::
::::

:::: exercise 一个不变式 {#ex-9-8} ★★★
若每个可能写入的用户也可能读取，则称 ACL 是良构的：

```isabelle
definition wf_acl :: "'u acl ⇒ bool" where
  "wf_acl es = (∀u. allows es u Write ⟶ allows es u Read)"
```

1. 证明 `revoke` 保持 ACL 良构：`wf_acl es ⟹ wf_acl (revoke u es)`。
2. 使用 Quickcheck 证明 `grant u Write` 不成立。
3. 证明授予 `Read` 与 `Write` 共同保持其良构性：
   `wf_acl es ⟹ wf_acl (grant u Read (grant u Write es))`.

::: solution
```isabelle
lemma "wf_acl es ⟹ wf_acl (revoke u es)"
  by (simp add: wf_acl_def allows_revoke)
```

展开后，`allows_revoke` 重写 `allows (revoke u es) w …` 的两个出现以及假设，a `∀` 关于 `⟶` 的条件重写规则完成了证明（第 9.3 节）。

```isabelle
lemma "wf_acl es ⟹ wf_acl (grant u Write es)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  es = []
  u = a⇩1
```

空列表良构，但在单独授予 `Write` 后，用户可写不可读。

```isabelle
lemma "wf_acl es ⟹ wf_acl (grant u Read (grant u Write es))"
  by (simp add: wf_acl_def)
```

展开后，`allows_grant` 将每个用户 `w` 与两个新条目进行比较；对于 `w = u`，`Write` 和 `Read` 均成立；对于任何其他用户，旧列表决定两者，且假设（再次为条件规则）完成证明。
:::
::::

:::: exercise 循环与顺序 {#ex-9-9} ★★★
1. 库中的引理 `rev_append` 是一个 simp 规则：`rev (xs @ ys) = rev ys @ rev xs`。解释
   如果你也将 `rev ys @ rev xs = rev (xs @ ys)` 声明为 simp 规则，将会发生什么。
2. 使用 `simp only:` 和单个证明步骤证明 `insert a (insert b (insert c A)) = insert c (insert a (insert b A))`
   库规则，并解释为什么化简器会停止。

::: solution
1. 两条规则互相抵消：`rev (xs @ ys)` 被重写成 `rev ys @ rev xs`，然后又被改回原式，如此循环下去。
   两个规则均非置换性的（其两侧为不同的项，而非通过交换变量得到的相同项），因此有序重写不适用，且化简器会陷入循环。
2. `insert_commute` 具有置换性。Isabelle 仅在结果在其固定顺序中更小时才应用它
   关于项，它对插入的元素进行排序，类似于冒泡排序，并在元素有序时停止。两侧达到相同的排序形式。

```isabelle
lemma "insert a (insert b (insert c A)) = insert c (insert a (insert b A))"
  by (simp only: insert_commute)
```
:::
::::

## 自测题 {#quiz}

```quiz
? 为什么`by simp`在`allows (grant u Read es) u Read`上失败而`by (simp add: grant_def)`成功？
- [ ] `simp` 无法处理列表
- [ ] `grant_def` 是一个条件规则
- [x] `grant` 用 `definition` 定义，其定义等式默认不会成为 simp 规则
- [ ] `simp` 仅使用在同一理论中以 `[simp]` 编写的规则
> `fun` 和许多库引理的等式是化简规则。`definition` 默认不注册其等式；在需要时提供或注册其 `_def` 定理。

? 化简规则具有形式 `v ≠ u ⟹ allows (revoke u es) v p = allows es v p`。`simp` 在何时对 `allows (revoke a es) b Read` 使用它？
- [x] 仅当它能证明`b ≠ a`时，例如从子目标的假设中
- [ ] 始终，因为左侧匹配
- [ ] 从不，因为条件规则仅由 `auto` 使用
- [ ] 仅当你使用规则书写 `simp add:` 时
> 条件规则仅在化简器通过化简证明其条件实例后应用。

? 调用 `simp add: add.commute`，将交换律 `x + y = y + x` 加入 simp 集合。为何 `simp` 不会陷入循环？
- [ ] Isabelle 在 100 步后停止所有化简
- [ ] 它仅从右到左使用
- [x] 它具有置换性，且 Isabelle 仅在项的固定顺序下结果更小时应用它
- [ ] `simp` 从不使用关于 `+` 的规则
> 有序重写仅在规则使项进入有序状态时才应用置换规则，因此该规则对操作数排序一次后便停止。

? 哪种方法适用于涉及集合与关系、包含全称量词 ∀ 与存在量词 ∃ 且无算术运算的目标？
- [ ] `linarith`
- [x] `blast`
- [ ] `simp only:`
- [ ] `presburger`
> `blast` 搜索一阶逻辑，其中集合与关系的规则已内置。

? `linarith` 在 `(x::nat) ≤ y ⟹ x * x ≤ y * y` 上失败。原因是什么？
- [ ] 目标是假的
- [ ] `linarith` 仅适用于整数
- [ ] 目标需要 `presburger`
- [x] 目标对两个变量进行乘法运算，因此不属于线性算术
> 线性算术仅允许乘以固定数。形如 `mult_le_mono` 的引理可处理此非线性目标；不可判定性排除了能判定每个非线性整数算术目标的算法。

? Sledgehammer 建议了一个使用两条库引理的证明 `by (metis …)`。为何你能信任所得定理？
- [ ] 由于外部证明器是经过验证的程序
- [ ] 因为多个证明器达成一致
- [ ] 因为 Sledgehammer 会双重检查翻译
- [x] 因为 `metis` 在 Isabelle 内部构建证明，且内核检查每一步
> 外部证明器仅指出所需的事实。证明本身由 `metis` 再次找到并由内核检查，如同其他每个方法一样。
```
