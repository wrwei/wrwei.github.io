---
title: 谓词逻辑
part: 1
lead: 说出什么对每个对象都成立、什么对某些对象成立，判断一个公式在某个结构中是否为真，寻找反模型，并把需求变成精确的公式；在纸上做，也在 Isabelle 中做。
minutes: 240
needs: 学完模块 1 和模块 2
goals:
  - 读写含有谓词、函数、∀ 和 ∃ 的公式，分清自由变元和约束变元
  - 手工判断一个公式在一个小结构中是否为真，并构造反模型
  - 运用量词定律，并认出那些不成立的“定律”
  - 把用自然语言写成的需求翻译成谓词逻辑，避开经典的错误
  - 在 Isabelle 中用 `blast` 和 `nitpick` 检查一阶逻辑的断言，并声明带类型的词汇表
  - 解释为什么没有程序能判定谓词逻辑公式的有效性，以及这对工具意味着什么
imports: Main
---

## 命题逻辑之外 {#beyond}

模块 2 把每个陈述都看作一个不可分割的原子。对于“如果门开着并且警报已布防，警笛就会响”这样的规则，这就够用了。但大多数需求会同时谈到许多对象：“**每个**请求”“**某台**服务器”“**没有**两列火车”“文件的**所有者**”。下面是一条访问控制策略，以及任何人都会从中得出的结论：

1. 每个管理员都能删除每一份文档。
2. Alice 是管理员。
3. 所以，Alice 能删除那份季度报告。

在命题逻辑中，每个句子都变成一个原子，比如 $A$、$B$ 和 $C$，整个论证就变成公式 $A \land B \imp C$。它的真值表是：

```truthtable
A ∧ B ⟶ C
```

第二行使公式为假：$A$ 和 $B$ 为真，$C$ 为假。就命题逻辑所能看到的而言，结论推不出来。可它明明推得出来，原因藏在句子**内部**：第 2 句中的 Alice 就是第 3 句中的 Alice，第 1 句中的“每个管理员”包括她，“每一份文档”也包括那份报告。要捕捉这样的原因，逻辑需要

- **对象的名字**，例如 Alice 和那份报告；
- 对象的**性质和关系**，例如“是管理员”和“能删除”；
- **量词**（quantifier），即“每个”“某个”这类表示数量的词，以及在这些对象上取值的变元。

**谓词逻辑**（predicate logic）正是在模块 2 的联结词之上加入了这些东西。它也叫**一阶逻辑**（first-order logic），因为它的变元在对象上取值，对象是“第一阶”的东西，而变元不在对象的性质上取值。戈特洛布·弗雷格（Gottlob Frege）在 1879 年的《概念文字》（Begriffsschrift）中引入了量词，此后谓词逻辑逐渐成为精确陈述数学的标准语言。用它来写，整个论证就是一个公式：

$$
(\forall u\ d.\ \mathit{admin}\ u \imp \mathit{can\_delete}\ u\ d) \land \mathit{admin}\ \mathit{alice} \imp \mathit{can\_delete}\ \mathit{alice}\ \mathit{report}
$$

读作“如果每个管理员 $u$ 都能删除每一份文档 $d$，并且 Alice 是管理员，那么 Alice 能删除那份报告”。学完本模块，你就会知道“无论怎样解释其中的词，这个公式都为真”是什么意思，而 Isabelle 只用一行就能证明它（第 3.8 节）。

谓词逻辑是规约的语言：模块 1 中的排序规约 $\mathit{sorted}\ ys \land \mathit{mset}\ ys = \mathit{mset}\ xs$ 就是它的一个公式，而 Isabelle 的逻辑 HOL 是它的扩展。

## 项、谓词与公式 {#language}

谓词逻辑的公式由两类符号构成。**逻辑符号**在每个应用中都一样：模块 2 的联结词、量词、等号，还有变元。其他符号则为某个特定应用中的事物命名，例如用户、文档和权限。这些符号组成了这个应用的词汇表。

::: definition 词汇表
**词汇表**（vocabulary），也称**签名**（signature），列出一种语言的非逻辑符号，并给出每个符号的参数个数，即它的**元数**（arity）：

- **常量**（constant）为单个对象命名：$\mathit{alice}$、$\mathit{report}$、$0$；
- **函数符号**（function symbol）为得出一个对象的运算命名：$\mathit{owner}$（一个参数：一份文档的所有者）、$+$（两个参数）；
- **谓词符号**（predicate symbol）为性质和关系命名，性质和关系要么成立，要么不成立：$\mathit{admin}$（一个参数：是管理员）、$\mathit{can\_delete}$（两个参数：能删除）、$<$（两个参数）。
:::

大多数逻辑书写作 $P(x)$、$R(x, y)$ 和 $f(x)$。本系列按 Isabelle 的方式书写：先写符号，再写参数，中间用空格隔开：$P\ x$、$R\ x\ y$、$f\ x$。括号只用来分组：$\mathit{can\_delete}\ (\mathit{owner}\ d)\ d$ 把 $\mathit{can\_delete}$ 应用于两个参数 $\mathit{owner}\ d$ 和 $d$。$+$ 和 $<$ 这样的符号照常写在两个参数之间。

### 项 {#terms}

::: definition 项
**项**（term）是下面两者之一：

1. 一个变元（$x$、$y$、$z$……）或一个常量；
2. $f\ t_1\ \dots\ t_n$，其中 $f$ 是有 $n$ 个参数的函数符号，$t_1, \dots, t_n$ 都是项。

项为一个对象命名。它永远不会为真或为假。
:::

$\mathit{alice}$、$d$、$\mathit{owner}\ d$、$x + 1$ 和 $2 * (x + y)$ 都是项。$\mathit{owner}\ d$ 指的是 $d$ 所代表的那份文档的所有者，$x + 1$ 指的是一个数。项就像编程语言中的表达式：它们计算出值。

### 原子公式 {#atoms}

::: definition 原子公式
**原子公式**（atomic formula）要么是 $P\ t_1\ \dots\ t_n$，其中 $P$ 是有 $n$ 个参数的谓词符号，$t_1, \dots, t_n$ 是项；要么是两个项之间的等式 $t_1 = t_2$。
:::

$\mathit{admin}\ \mathit{alice}$、$\mathit{can\_delete}\ x\ \mathit{report}$、$x < y + 1$ 和 $\mathit{owner}\ \mathit{report} = \mathit{alice}$ 都是原子公式。一旦知道其中的项代表哪些对象，每个原子公式就有了真假。没有参数的谓词符号就是模块 2 中的命题原子，所以命题逻辑的每个公式也都是谓词逻辑的公式。

::: pitfall
项和公式处在不同的层次上，一个不能出现在另一个该出现的位置。$\mathit{admin}\ (\mathit{can\_delete}\ \mathit{alice}\ \mathit{report})$ 不是公式：$\mathit{admin}$ 需要一个对象，而 $\mathit{can\_delete}\ \mathit{alice}\ \mathit{report}$ 是一个陈述。$\mathit{owner}\ \mathit{report} \land \mathit{admin}\ \mathit{alice}$ 也不是公式：$\land$ 连接的是陈述，而 $\mathit{owner}\ \mathit{report}$ 是一个对象。Isabelle 会拒绝这样的表达式，第 3.8 节会演示这一点。
:::

### 量词 {#quantifiers}

新的成分是对对象的量化。下面的 $\varphi$（希腊字母 phi）和 $\psi$（psi）代表任意公式。

- $\forall x.\ \varphi$ 读作“对所有 $x$，$\varphi$”。它说的是：无论 $x$ 代表哪个对象，$\varphi$ 都成立。$\forall$ 是**全称量词**（universal quantifier）。
- $\exists x.\ \varphi$ 读作“存在 $x$，使得 $\varphi$”，或“对某个 $x$，$\varphi$”。它说的是：$\varphi$ 至少对一个对象成立。$\exists$ 是**存在量词**（existential quantifier）。

一个量词可以引入多个变元：$\forall x\ y.\ \varphi$ 是 $\forall x.\ \forall y.\ \varphi$ 的简写。

::: definition 公式
一个词汇表上的**公式**（formula）按下面的规则构造：

1. 每个原子公式都是公式，$\mathit{True}$ 和 $\mathit{False}$ 也是公式。
2. 如果 $\varphi$ 和 $\psi$ 是公式，那么 $\lnot \varphi$、$\varphi \land \psi$、$\varphi \lor \psi$、$\varphi \imp \psi$ 和 $\varphi \iff \psi$ 也是公式；按模块 2 的优先级需要括号的地方要加上括号。
3. 如果 $\varphi$ 是公式，$x$ 是变元，那么 $\forall x.\ \varphi$ 和 $\exists x.\ \varphi$ 是公式。
:::

要流畅地读公式，需要练习。先逐个符号地把公式念出来，再用平实的中文说出它的意思。

::: example 读公式
| 公式 | 读作 | 用平实的中文说 |
|---|---|---|
| $\forall x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$ | 对所有 $x$，如果 $x$ 是管理员，那么 $x$ 在值班 | 每个管理员都在值班 |
| $\exists x.\ \mathit{admin}\ x \land \lnot\, \mathit{on\_call}\ x$ | 存在 $x$，使得 $x$ 是管理员并且 $x$ 不在值班 | 有的管理员不在值班 |
| $\forall x.\ \exists y.\ \mathit{trusts}\ x\ y$ | 对所有 $x$，存在 $y$，使得 $x$ 信任 $y$ | 每个人都信任某个人 |
| $\exists y.\ \forall x.\ \mathit{trusts}\ x\ y$ | 存在 $y$，使得对所有 $x$，$x$ 信任 $y$ | 有某个人被所有人信任 |
| $\forall x\ y.\ x < y \imp (\exists z.\ x < z \land z < y)$ | 对所有 $x$ 和 $y$，如果 $x < y$，那么存在 $z$，使得 $x < z$ 并且 $z < y$ | 两个不同的数之间还有第三个数 |

第三行和第四行只是量词的顺序不同，说的却是很不一样的事情。第 3.3 节和第 3.5 节会再回到这一点。最后一行对分数成立，对整数却不成立：1 和 2 之间没有整数。
:::

Isabelle 中量词的写法和这里一样：∀ 或 ∃，接一个变元，再接一个点。输入时用 `\forall` 和 `\exists`（模块 1）。

### 辖域、自由变元与约束变元 {#scope}

在 $\forall x.\ \varphi$ 中，公式 $\varphi$ 是这个量词的**辖域**（scope）：在这个范围里，$x$ 指的就是这个量词所引入的变元。公式没有括号时，辖域延伸到哪里为止？本系列遵循 Isabelle 的约定：**量词的辖域尽可能向右延伸**。所以 $\forall x.\ P\ x \imp Q\ x$ 的意思是 $\forall x.\ (P\ x \imp Q\ x)$。要让辖域提前结束，就加括号：$(\forall x.\ P\ x) \imp Q\ x$。

::: pitfall
许多逻辑教科书采用相反的约定：在那里，量词和 $\lnot$ 结合得一样紧，$\forall x\, P(x) \imp Q(x)$ 的意思是 $(\forall x\, P(x)) \imp Q(x)$。读其他书时，先弄清它们的约定。为 Isabelle 写公式时，要记住量词的辖域一直延伸到公式的末尾，或者延伸到量词所在的那组括号的右括号为止。
:::

::: definition 自由变元与约束变元
变元 $x$ 在公式中的一次出现，如果位于某个量词 $\forall x$ 或 $\exists x$ 的辖域之内，就是**约束的**（bound），并且属于包围它的、离它最近的那个这样的量词。否则，这次出现是**自由的**（free）。有约束出现的变元称为**约束变元**（bound variable），有自由出现的变元称为**自由变元**（free variable）。没有任何变元自由出现的公式称为**语句**（sentence），也叫闭公式。
:::

图 3.1 标出了一个公式中的各个辖域，在这个公式里，同一个变元名既有约束出现，也有自由出现。

::: figure id=fig-03-1
$\forall x.\ P\ x \imp (\exists y.\ R\ x\ y) \land Q\ y$ 中的辖域。$\forall x$ 的辖域一直延伸到末尾，所以每个 $x$ 都是约束的。括号结束了 $\exists y$ 的辖域，所以最后一个 $y$ 是自由的：它和那个约束的 $y$ 同名，却是另一个变元。
:::

一旦语句中的符号有了含义，语句就有了真假。含有自由变元的公式还取决于这些变元代表什么：在 $x$ 取值之前，$x < 3$ 既不为真也不为假；而 $\exists x.\ x < 3$ 是一个语句，在自然数上为真。自由变元就像函数的参数，约束变元就像局部变量：在约束变元的整个辖域中把它统一换成一个新名字，什么也不会改变，所以 $\forall x.\ P\ x$ 和 $\forall y.\ P\ y$ 说的是同一件事。

::: example 找出辖域和自由变元
1. $\forall x.\ P\ x \imp Q\ x$：$\forall x$ 的辖域是 $P\ x \imp Q\ x$，$x$ 的两次出现都是约束的。这是一个语句。
2. $(\forall x.\ P\ x) \imp Q\ x$：辖域只有 $P\ x$。$Q\ x$ 中的 $x$ 是自由的。
3. $\forall x.\ \exists y.\ R\ x\ y \land \lnot\, R\ y\ z$：$x$ 和 $y$ 是约束的，$z$ 是自由的。不是语句。
4. $\exists x.\ P\ x \land (\forall x.\ Q\ x) \imp R\ x$：里面的 $\forall x$ 只约束 $Q\ x$ 中的 $x$。$\exists x$ 的辖域一直延伸到末尾，所以 $R\ x$ 中的 $x$ 属于 $\exists x$。这是一个语句，但容易把人弄糊涂：最好给每个量词用一个它自己的变元。
:::

::: isabelle
想知道 Isabelle 怎样读一个公式，就把它写成一条引理，然后看 **Output**（输出）面板中的目标。Isabelle 打印公式时会尽量少用括号，所以从目标可以看出你加的括号中哪些起了作用：

```isabelle
lemma "∀x. (P x ⟶ Q x)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀x. P x ⟶ Q x
```

括号不见了：`∀x` 的辖域本来就延伸到末尾，所以这对括号什么也没改变。用 `oops` 放弃这条引理，然后移动括号：

```isabelle
  oops
```

```isabelle
lemma "(∀x. P x) ⟶ Q x"
```

```output state
proof (prove)
goal (1 subgoal):
 1. (∀x. P x) ⟶ Q x
```

这次括号保留了下来，因为它们让 `∀x` 的辖域提前结束。`Q x` 中的 `x` 是自由的；引理中的自由变元是什么意思，是第 3.4 节要讲的内容。

```isabelle
  oops
```
:::

## 结构与真值 {#structures}

$\forall x.\ \exists y.\ R\ x\ y$ 为真吗？这个问题现在还没有答案。如果 $x$ 和 $y$ 在自然数上取值，$R$ 是 $<$，它就为真：每个数都有比它大的数。如果 $R$ 是 $>$，它就为假：没有比 0 小的自然数。只有说清楚变元在什么范围内取值、符号是什么意思，公式才有真值。这些信息就是一个结构。

::: definition 结构
一个词汇表的**结构**（structure）$\mathcal M$ 由以下几部分组成：

1. 一个非空集合 $D$，称为**论域**（domain）：变元在其中取值的那些对象；
2. 对每个常量 $c$，$D$ 中的一个元素 $c^{\mathcal M}$；
3. 对每个有 $n$ 个参数的函数符号 $f$，一个函数 $f^{\mathcal M}$，它把由 $D$ 的元素组成的每个 $n$ 元组映射到 $D$ 的一个元素；
4. 对每个有 $n$ 个参数的谓词符号 $P$，一个由 $D$ 的元素组成的 $n$ 元组的集合 $P^{\mathcal M}$：也就是使 $P$ 成立的那些元组。

**$n$ 元组**（$n$-tuple）是按顺序排列的 $n$ 个元素 $(d_1, \dots, d_n)$；2 元组就是**有序对**（pair）。$c^{\mathcal M}$ 读作“$\mathcal M$ 中的 $c$”，即 $\mathcal M$ 让符号 $c$ 表示的东西；$f^{\mathcal M}$ 和 $P^{\mathcal M}$ 也是这样读。第 2 到第 4 项合起来是词汇表的**解释**（interpretation）。结构也叫**模型**（model）或解释。
:::

论域可以是有限的，也可以是无限的，但按照惯例，它永远不是空的；Isabelle 也遵循同样的惯例。函数符号被解释为一个对每个参数都给出值的函数，即使对某些参数来说这个值毫无意义，比如一个不是文档的东西的“所有者”。第 3.8 节会说明类型怎样避免这类无意义的东西。

要对含有自由变元的公式求值，还需要给这些变元一些值。

::: definition 结构中的真值
**赋值**（assignment）$s$ 给每个变元一个 $D$ 中的值。项的**值**由它的变元和常量的值，借助 $\mathcal M$ 中的函数算出。公式是否**在 $\mathcal M$ 中、在 $s$ 下为真**，按以下规则确定：

- 当 $t_1, \dots, t_n$ 的值组成的元组属于 $P^{\mathcal M}$ 时，$P\ t_1\ \dots\ t_n$ 为真；当两个项的值相同时，$t_1 = t_2$ 为真。
- $\lnot$、$\land$、$\lor$、$\imp$ 和 $\iff$ 按模块 2 中它们的真值表计算。
- 当 $x$ 取 $D$ 中的**每一个**值（其他变元保持原值）时 $\varphi$ 都为真，$\forall x.\ \varphi$ 就为真。
- 当 $x$ 取 $D$ 中**至少一个**值时 $\varphi$ 为真，$\exists x.\ \varphi$ 就为真。

对于语句，赋值不起作用。这时写作 $\mathcal M \models \varphi$，读作“$\varphi$ 在 $\mathcal M$ 中为真”，或“$\mathcal M$ 是 $\varphi$ 的模型”。
:::

::: analogy
在有限论域上，量词就是一个循环。$\forall x$ 是一个只有每一轮都成功才算成功的循环；$\exists x$ 则只要有一轮成功就成功。在 Python 中，在列表 `D` 上求 $\forall x.\ \exists y.\ R\ x\ y$ 的值就是 `all(any(R(x, y) for y in D) for x in D)`。在无限论域上，循环永远不会结束，这时你需要的是证明。
:::

现在手工做一个例子。图 3.2 画出了一个结构，它的词汇表有两个一元谓词 $P$ 和 $Q$，以及一个二元谓词 $R$。

::: figure id=fig-03-2
结构 $\mathcal M_1$。它的论域有三个元素；$P$ 对 $a$ 和 $b$ 成立，$Q$ 只对 $b$ 成立；从 $x$ 指向 $y$ 的箭头表示 $R\ x\ y$ 成立。
:::

写出来，$\mathcal M_1$ 的论域是 $D = \{a, b, c\}$，并且 $P^{\mathcal M_1} = \{a, b\}$，$Q^{\mathcal M_1} = \{b\}$，$R^{\mathcal M_1} = \{(a, b), (b, c), (c, c)\}$。如果具体的解读对你有帮助，可以把它想成三台服务器：$P$ 表示“正在生产环境中运行”，$Q$ 表示“已经备份”，$R\ x\ y$ 表示“$x$ 把日志转发给 $y$”。求值并不依赖于这种解读。

::: example 手工求公式的值
1. $\forall x.\ P\ x \imp Q\ x$，“每个 $P$ 都是 $Q$”。逐个试每个元素。对 $a$，$P\ a \imp Q\ a$ 是 $\mathit{True} \imp \mathit{False}$，为假。一次失败就够了：这个公式在 $\mathcal M_1$ 中为假，$a$ 是一个**反例**（counterexample）。
2. $\exists x.\ P\ x \land Q\ x$，“有的 $P$ 是 $Q$”。对 $b$，$P\ b \land Q\ b$ 为真。这个公式为真，$b$ 是一个**见证**（witness）。
3. $\exists x.\ R\ x\ x$，“有某个元素有一个指向自己的箭头”。为真，见证是 $c$。
4. $\forall x.\ P\ x \imp (\exists y.\ R\ x\ y \land Q\ y)$，“每个 $P$ 都有一个指向某个 $Q$ 的箭头”。这个需要列一张表，$x$ 的每个值占一行：

   | $x$ | $P\ x$ | 有从 $x$ 指向某个 $Q$ 的箭头吗？ | $P\ x \imp (\exists y.\ R\ x\ y \land Q\ y)$ |
   |---|---|---|---|
   | $a$ | 真 | 有：$R\ a\ b$ 并且 $Q\ b$ | 真 |
   | $b$ | 真 | 没有：它唯一的箭头指向 $c$，而 $Q\ c$ 为假 | 假 |
   | $c$ | 假 | 没有 | 真 |

   $b$ 这一行为假，所以这个公式在 $\mathcal M_1$ 中为假，反例是 $b$。
:::

::: example 量词的顺序
在 $\mathcal M_1$ 中，语句 $\forall x.\ \exists y.\ R\ x\ y$ 说的是每个元素都有一个向外的箭头。确实如此：$a \to b$、$b \to c$ 和 $c \to c$。每个 $x$ 都有自己的见证 $y$。

$\exists y.\ \forall x.\ R\ x\ y$ 说的是有某个元素从每个元素（包括它自己）那里都收到一个箭头。逐个试每个候选的 $y$：$a$ 没有收到任何箭头；$b$ 只从 $a$ 那里收到箭头；$c$ 从 $b$ 和 $c$ 那里收到箭头，但没有从 $a$ 那里收到。没有一个候选行得通，所以这个语句为假。

这两个语句只是 $\forall x$ 和 $\exists y$ 的顺序不同。在第一个语句中，$y$ 可以依赖于 $x$；在第二个语句中，必须由同一个 $y$ 满足每一个 $x$。
:::

一个 ∀ 语句为真，还可能出于一个不那么明显的原因。在没有任何元素具有性质 $P$ 的结构中，无论 $Q$ 是什么，语句 $\forall x.\ P\ x \imp Q\ x$ 都为真：对每个 $x$，条件 $P\ x$ 都为假，所以蕴涵式为真。这样的语句是**空真**的（vacuously true）。在一家没有管理员的公司里，“每个管理员都在值班”成立；对一台从未收到请求的服务器来说，“每个请求都得到了响应”也成立。写规约时必须考虑到这一点。

::: widget name=model-explorer
点击就能修改结构：添加或删除元素，在 $P$ 和 $Q$ 成立的地方打勾，并在网格中打开或关闭 $R$ 的箭头（第 $x$ 行、第 $y$ 列）。每次点击之后，每个公式都会重新求值；为假的 ∀ 公式会给出一个反例，为真的 ∃ 公式会给出一个见证。试着让 $\forall x.\ \exists y.\ R\ x\ y$ 为真，同时让 $\exists y.\ \forall x.\ R\ x\ y$ 保持为假。然后让 $\forall x.\ P\ x \imp Q\ x$ 为真，而 $\exists x.\ P\ x \land Q\ x$ 为假；$P$ 只有一种选法。你也可以添加自己的公式，用 Isabelle 的记法或 ASCII 写法（`ALL`、`EX`、`~`、`&`、`|`、`-->`）都可以。
:::

::: isabelle
当论域是一个 Isabelle 能列出全部元素的类型时，它就能对带量词的公式求值。类型 `bool` 有两个元素：`True` 和 `False`。取 ≠（“不同于”）作为关系，比较量词的两种顺序：

```isabelle
value "∀x::bool. ∃y. y ≠ x"
```

```output
"True"
  :: "bool"
```

```isabelle
value "∃y::bool. ∀x. y ≠ x"
```

```output
"False"
  :: "bool"
```

量词中的 `x::bool` 表示 `x` 在 `bool` 上取值。每个 `x` 都有一个与它不同的 `y`，但没有哪个 `y` 与每个 `x` 都不同，因为任何东西都不会与自己不同。像 `nat` 这样有无穷多个元素的类型，没法逐个走一遍：`value "∀x::nat. x < x + 1"` 会报错停止，错误消息说 `nat` 不属于 sort `enum`，也就是不属于 Isabelle 能列出全部元素的那一类类型。对这样的类型，你需要的是证明。
:::

## 有效性、可满足性与反模型 {#validity}

模块 2 的核心概念都可以沿用过来，只是把“真值表的每一行”换成“每一个结构”。

::: definition 有效性与可满足性
公式 $\varphi$ 是

- **有效的**（valid），记作 $\models \varphi$，如果它在每个结构中、在每个赋值下都为真；
- **可满足的**（satisfiable），如果它至少在一个结构中、在至少一个赋值下为真；
- **不可满足的**（unsatisfiable），如果它在任何结构中、任何赋值下都不为真。

如果在每一个使 $\Gamma$ 中所有公式都为真的结构和赋值下，$\varphi$ 都为真，就说公式集 $\Gamma$（gamma）**逻辑蕴涵**（entails）$\varphi$，记作 $\Gamma \models \varphi$。这时 $\varphi$ 是 $\Gamma$ 的**逻辑推论**（logical consequence）。
:::

和模块 2 一样，$\varphi$ 是有效的，当且仅当 $\lnot \varphi$ 不可满足。区别在于情况的数目：真值表只有有限多行，结构却有无穷多个，大小各异，你不可能把它们全部检查一遍。不过，要表明一个公式**不是**有效的，一个结构就够了。

::: definition 反模型
$\varphi$ 的**反模型**（countermodel）是一个结构，连同对 $\varphi$ 的自由变元的一个赋值，使 $\varphi$ 在其中为假。一个公式是有效的，当且仅当它没有反模型。
:::

::: example 一个反模型
$(\forall x.\ P\ x \lor Q\ x) \imp (\forall x.\ P\ x) \lor (\forall x.\ Q\ x)$ 是有效的吗？它说的是：“如果每样东西都是 $P$ 或 $Q$，那么每样东西都是 $P$，或者每样东西都是 $Q$”。这听起来似乎有道理，直到你设想一个只是 $P$ 的元素和另一个只是 $Q$ 的元素：$D = \{a, b\}$，$P = \{a\}$，$Q = \{b\}$。前提为真，因为 $a$ 是 $P$，$b$ 是 $Q$。但 $\forall x.\ P\ x$ 在 $b$ 处不成立，$\forall x.\ Q\ x$ 在 $a$ 处不成立，所以结论为假。这个结构就是一个反模型，因此这个公式不是有效的。不过它是可满足的：在每样东西都是 $P$ 的每个结构中，它都为真。
:::

要表明一个公式**是**有效的，就要对一个任意的结构进行论证：关于论域和解释，论证中除了公式本身所说的，什么也不能用。

::: example 证明有效性
断言：$(\forall x.\ P\ x \imp Q\ x) \land P\ c \imp Q\ c$ 是有效的。任取一个结构 $\mathcal M$。如果蕴涵式的左边在 $\mathcal M$ 中为假，那么蕴涵式为真。否则两个合取项都为真。第一个合取项说 $P\ x \imp Q\ x$ 对 $x$ 的每个值都成立，特别是对元素 $c^{\mathcal M}$ 成立；第二个合取项说 $P$ 对 $c^{\mathcal M}$ 成立。两者合起来就得到 $Q\ c$。无论哪种情况，这个公式在 $\mathcal M$ 中都为真；而 $\mathcal M$ 是任意取的，所以这个公式是有效的。这就是第 3.1 节那个论证的缩影。
:::

有效的公式包括命题重言式的每一个实例，例如 $P\ x \lor \lnot\, P\ x$，还包括许多命题逻辑无法解释的公式，例如 $(\forall x.\ P\ x) \imp P\ c$。

::: isabelle
在 Isabelle 的引理中，**自由变元隐含地是全称量化的**：引理断言，无论这些变元取什么值，它的公式都成立。自由的 `P` 代表任意谓词，自由的 `c` 代表任意元素，而这些元素可以来自任何论域。所以，一条含有自由变元的引理断言的是：它的公式是有效的。模块 2 用来证明重言式的 `blast` 也能在谓词逻辑中搜索证明：

```isabelle
lemma "(∀x. P x ⟶ Q x) ∧ P c ⟶ Q c"
  by blast
```

证明成功了：例 3.6 得到了检验。现在来看一个无效的断言。从某一个 `a` 满足 `P a`，推不出 `P` 对一切都成立。Nitpick 会搜索反模型：

```isabelle
lemma "P a ⟶ (∀x. P x)"
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    P = (λx. _)(a⇩1 := False, a⇩2 := True)
    a = a⇩2
  Skolem constant:
    x = a⇩1
```

从上往下读 Nitpick 的回答。

- `card 'a = 2`：论域有两个元素，Nitpick 把它们叫做 a₁ 和 a₂。`'a` 这个名字来自 Isabelle：它给 `x` 和 `a` 指定了类型 `'a`（读作“alpha”），这是一个**类型变量**（type variable），代表任意类型，所以这条引理同时谈论所有的论域。选项 `[card 'a = 2]` 让 Nitpick 尝试恰好有两个元素的论域。
- `P = (λx. _)(a₁ := False, a₂ := True)` 是 Nitpick 表示“由一张表给出的函数”的记法：`P a₁` 是 `False`，`P a₂` 是 `True`。所以 `P` 只对 a₂ 成立。
- `a = a₂` 是自由变元 `a` 的值。
- 在 **Skolem constant**（斯科伦常量）下面，Nitpick 列出它为约束变元选定的值：`x = a₁` 就是使 `∀x. P x` 不成立的那个元素。

所以 `P a` 为真而 `∀x. P x` 为假：这正是定义 3.9 所说的反模型。

```isabelle
  oops
```

不加选项时，Nitpick 会并行地尝试 1 到 10 个元素的论域，它最先报告的反模型有多大，每次运行都可能不同；`[card 'a = 2]` 让它的回答可以重现。Isabelle/jEdit 还会对每条新引理运行 Quickcheck，所以在你调用 Nitpick 之前，可能就已经出现了一个反例。Quickcheck 把谓词写成使它为真的那些元素组成的集合，例如 `P = {a₁}`。
:::

::: pitfall
“Nitpick found no counterexample”（Nitpick 没有找到反例）并不意味着引理为真。Nitpick 只搜索不超过一定大小的论域，而第 3.9 节会给出一个公式，它不是有效的，但它的反模型全都是无限的。只有证明才能表明一个公式是有效的。
:::

## 量词推理 {#reasoning}

如果两个公式恰好在相同的结构和赋值下为真，也就是说 $\varphi \iff \psi$ 是有效的，就说它们是**等价的**（equivalent），记作 $\varphi \equiv \psi$。利用等价式可以改写公式：化简一个规约，否定一条需求，看懂一个证明。本节汇集了你最常用的定律，以及那些看起来对、其实不成立的“定律”。

### 量词定律 {#quantifier-laws}

在两个元素的论域 $\{a, b\}$ 上，$\forall x.\ P\ x$ 的意思是 $P\ a \land P\ b$，$\exists x.\ P\ x$ 的意思是 $P\ a \lor P\ b$。所以 ∀ 就像一个长长的合取，∃ 就像一个长长的析取，模块 2 中关于 ∧ 和 ∨ 的定律都有对应的量词版本。

::: fact 量词的否定
$$
\lnot (\forall x.\ \varphi) \equiv \exists x.\ \lnot \varphi
\qquad\qquad
\lnot (\exists x.\ \varphi) \equiv \forall x.\ \lnot \varphi
$$
:::

“并非一切都是 $\varphi$”意味着“有某样东西不是 $\varphi$”，“没有东西是 $\varphi$”意味着“一切都不是 $\varphi$”。这就是量词的德摩根律（De Morgan's laws）。把否定向内推时，它经过的每个量词都会变成另一种量词。

::: example 否定一条需求
一条需求和对它的违反互为否定。以“每个请求都得到响应”为例：

$$\forall r.\ \mathit{request}\ r \imp \mathit{answered}\ r$$

它的否定描述了测试或模型检测器要表明这条需求被违反，必须找到什么：

$$
\lnot (\forall r.\ \mathit{request}\ r \imp \mathit{answered}\ r)
\;\equiv\; \exists r.\ \lnot (\mathit{request}\ r \imp \mathit{answered}\ r)
\;\equiv\; \exists r.\ \mathit{request}\ r \land \lnot\, \mathit{answered}\ r
$$

“有某个请求没有得到响应。”最后一步用到了模块 2 中的 $\lnot (A \imp B) \equiv A \land \lnot B$。遇到嵌套的量词，否定会依次穿过每一个量词：$\lnot (\forall x.\ \exists y.\ \mathit{trusts}\ x\ y) \equiv \exists x.\ \forall y.\ \lnot\, \mathit{trusts}\ x\ y$，即“有某个人谁也不信任”。
:::

::: fact 分配律
$$
\forall x.\ (\varphi \land \psi) \equiv (\forall x.\ \varphi) \land (\forall x.\ \psi)
\qquad\qquad
\exists x.\ (\varphi \lor \psi) \equiv (\exists x.\ \varphi) \lor (\exists x.\ \psi)
$$

另外两种组合只在一个方向上成立：

$$
(\forall x.\ \varphi) \lor (\forall x.\ \psi) \models \forall x.\ (\varphi \lor \psi)
\qquad\qquad
\exists x.\ (\varphi \land \psi) \models (\exists x.\ \varphi) \land (\exists x.\ \psi)
$$
:::

例 3.5 已经表明，第一条单向定律不能反过来。第二条也不能：“有人是管理员，也有人在值班”并不意味着有管理员在值班。反模型仍然是 $D = \{a, b\}$，$P = \{a\}$，$Q = \{b\}$。

::: fact 量词与不含该变元的公式
如果 $x$ 不在 $\psi$ 中自由出现：

$$
\forall x.\ (\psi \imp \varphi) \equiv \psi \imp (\forall x.\ \varphi)
\qquad\qquad
\forall x.\ (\varphi \imp \psi) \equiv (\exists x.\ \varphi) \imp \psi
$$

$$
\exists x.\ (\varphi \land \psi) \equiv (\exists x.\ \varphi) \land \psi
\qquad\qquad
\forall x.\ (\varphi \lor \psi) \equiv (\forall x.\ \varphi) \lor \psi
$$
:::

第二条定律乍一看令人意外：从蕴涵式左边移出来的 ∀ 变成了 ∃。举个例子就容易接受了：“对每个用户 $x$，如果 $x$ 已登录，那么服务器忙”与“如果有某个用户已登录，那么服务器忙”说的是同一件事。模块 6 和模块 7 中 ∃ 的证明规则，背后正是这条定律的思想。

::: fact 量词的顺序
$$
\forall x.\ \forall y.\ \varphi \equiv \forall y.\ \forall x.\ \varphi
\qquad\qquad
\exists x.\ \exists y.\ \varphi \equiv \exists y.\ \exists x.\ \varphi
$$

$$
\exists y.\ \forall x.\ \varphi \models \forall x.\ \exists y.\ \varphi\text{，但反过来不成立。}
$$
:::

同一种量词可以交换次序；∀ 和 ∃ 却不能。如果有一个 $y$ 对每个 $x$ 都行得通，那么每个 $x$ 都有一个 $y$，也就是那一个。反过来不成立，因为 $y$ 可以依赖于 $x$：每把锁都有一把能打开它的钥匙，但不一定有一把能打开所有锁的万能钥匙。例 3.4 给出了一个结构，其中 $\forall x.\ \exists y.\ R\ x\ y$ 为真而 $\exists y.\ \forall x.\ R\ x\ y$ 为假。

::: isabelle
`blast` 能证明这些定律。下面是其中的四条。`S` 是类型为 `bool` 的自由变元，所以它代表一个不含 `x` 的公式：

```isabelle
lemma "¬ (∀x. P x) ⟷ (∃x. ¬ P x)"
  by blast

lemma "(∀x. P x ∧ Q x) ⟷ (∀x. P x) ∧ (∀x. Q x)"
  by blast

lemma "(∀x. P x ⟶ S) ⟷ ((∃x. P x) ⟶ S)"
  by blast

lemma "(∃y. ∀x. R x y) ⟶ (∀x. ∃y. R x y)"
  by blast
```

对于不成立的定律，Nitpick 会找到反模型。下面是最后一条引理的逆：

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∃y. ∀x. R x y)"
  nitpick [card = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2 and card 'b = 2:
  Free variable:
    R = (λx. _)
        (a⇩1 := (λx. _)(b⇩1 := False, b⇩2 := True),
           a⇩2 := (λx. _)(b⇩1 := True, b⇩2 := False))
  Skolem constants:
    λy. x = (λx. _)(b⇩1 := a⇩1, b⇩2 := a⇩2)
    λx. y = (λx. _)(a⇩1 := b⇩2, a⇩2 := b⇩1)
```

这一次有两个类型变量。公式中没有任何东西说明 `x` 和 `y` 是同一类东西，所以 Isabelle 给了它们不同的类型 `'a` 和 `'b`，`R` 把 `'a` 的元素关联到 `'b` 的元素。选项 `[card = 2]` 让每个类型都有两个元素。`R` 是一张由表组成的表：`R a₁` 是只在 b₂ 处为真的函数，所以 `R a₁ b₂` 成立；同样，`R a₂ b₁` 也成立；其他所有的对都为假。每个 `x` 都有一个 `y`，但没有一个 `y` 能同时满足两个 `x`。有两个类型的反模型不一定能看作只有一个论域的反模型，但这一个可以：把 b₁ 看成 a₁，b₂ 看成 a₂，`R` 就把 {a₁, a₂} 中的每个元素关联到另一个元素。斯科伦常量显示了这种依赖关系：`λx. y` 是 Nitpick 为每个 `x` 选定的、使左边为真的 `y`，它是 `x` 的函数；`λy. x` 则对每个 `y` 给出一个使 `∀x. R x y` 不成立的 `x`。

```isabelle
  oops
```
:::

::: pitfall
如果你把一条定律输入 Isabelle 时漏掉了事实框里的括号，辖域就会给你制造麻烦。去掉上面第二条引理中 `∀x. P x ∧ Q x` 两边的括号：

```isabelle
lemma "∀x. P x ∧ Q x ⟷ (∀x. P x) ∧ (∀x. Q x)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀x. (P x ∧ Q x) = ((∀x. P x) ∧ (∀x. Q x))
```

目标显示了 Isabelle 的读法。第一个 `∀x` 把它右边的一切都当作自己的辖域，所以这条引理现在断言的是：对每个 `x`，`P x ∧ Q x` 与 `(∀x. P x) ∧ (∀x. Q x)` 等价。（Isabelle 把 `⟷` 打印成 `=`；第 3.6 节会解释原因。）这是另一个断言，而且是错的：

```isabelle
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    P = (λx. _)(a⇩1 := False, a⇩2 := True)
    Q = (λx. _)(a⇩1 := False, a⇩2 := True)
  Skolem constant:
    x = a⇩2
```

在这个反模型中，`P` 和 `Q` 都只对 a₂ 成立。取 `x = a₂`：`P x ∧ Q x` 为真，但因为 a₁，`∀x. P x` 为假，所以等价式两边的值不同。把括号加回去，`blast` 就能证明这条定律。

```isabelle
  oops
```
:::

### 代入与变元捕获 {#substitution}

从 $\forall x.\ \varphi$ 可以对任何一个特定的对象推出 $\varphi$：从“每个管理员都在值班”可以推出“如果 Alice 是管理员，那么 Alice 在值班”。这一步把变元 $x$ 替换成了一个项。

::: definition 代入
$\varphi[t/x]$ 读作“在 $\varphi$ 中用 $t$ 代入 $x$”，是把 $\varphi$ 中变元 $x$ 的每一次**自由**出现都替换为项 $t$ 后得到的公式。这种操作称为**代入**（substitution）。$x$ 的约束出现保持原样。
:::

例如，$(P\ x \land (\forall x.\ Q\ x))[a/x]$ 是 $P\ a \land (\forall x.\ Q\ x)$：只有第一个 $x$ 是自由的。

::: fact 实例化
$$
\forall x.\ \varphi \models \varphi[t/x]
\qquad\qquad
\varphi[t/x] \models \exists x.\ \varphi
$$

前提是：把 $t$ 放到 $x$ 的位置上时，$t$ 中没有任何变元因此被约束。
:::

这个附加条件并不是吹毛求疵。设 $\varphi$ 是 $\exists y.\ R\ x\ y$，即“$x$ 有一个 $R$ 后继”。那么 $\forall x.\ \varphi$ 说的是每样东西都有后继。如果不小心用 $y$ 代入 $x$，就会得到 $\exists y.\ R\ y\ y$，即“有某样东西是它自己的后继”：你代入的 $y$ 被 $\exists y$ **捕获**（capture）了，意思也就变了。以自然数为论域、以 $<$ 为 $R$，$\forall x.\ \exists y.\ x < y$ 为真，而 $\exists y.\ y < y$ 为假，所以这个粗心的步骤从一个真命题推出了一个假命题。补救的办法是先给约束变元改名。$\exists y.\ R\ x\ y$ 与 $\exists z.\ R\ x\ z$ 等价，而 $(\exists z.\ R\ x\ z)[y/x]$ 是 $\exists z.\ R\ y\ z$，即“$y$ 有一个后继”，这确实可以推出。

只在约束变元的名字上不同的公式，例如 $\exists y.\ R\ x\ y$ 和 $\exists z.\ R\ x\ z$，称为 **α 等价的**（alpha-equivalent）。它们的意思相同；谈论代入时，总是允许先做这样的改名。

::: example 带改名的代入
计算 $(\forall y.\ R\ x\ y \imp P\ y)[f\ y/x]$。项 $f\ y$ 含有 $y$，而公式约束了 $y$，所以直接放入 $f\ y$ 会捕获它的 $y$。先把约束的 $y$ 改名为一个新的 $z$，得到 $\forall z.\ R\ x\ z \imp P\ z$，然后再代入：

$$\forall z.\ R\ (f\ y)\ z \imp P\ z$$

$f\ y$ 中的 $y$ 仍然是自由的，和它在你代入的那个项中一样。
:::

::: isabelle
Isabelle 在代入时从不捕获变元。在 Isabelle 内部，约束变元不是按名字存储的，而是存成一个数，这个数数的是它与自己的量词之间隔着多少个量词（称为德布鲁因索引，de Bruijn index）；名字只是为了打印才保留的。`blast` 能证明正确的实例：

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∃z. R y z)"
  by blast
```

而 Nitpick 会驳倒发生了捕获的那个：

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∃y. R y y)"
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variable:
    R = (λx. _)
        (a⇩1 := (λx. _)(a⇩1 := False, a⇩2 := True),
           a⇩2 := (λx. _)(a⇩1 := True, a⇩2 := False))
  Skolem constant:
    λx. y = (λx. _)(a⇩1 := a⇩2, a⇩2 := a⇩1)
```

在这个反模型中，`R` 把 a₁ 关联到 a₂，又把 a₂ 关联到 a₁：每个元素都有后继，但没有一个元素是它自己的后继。

```isabelle
  oops
```
:::

## 相等 {#equality}

相等是一个含义固定的谓词。结构可以选择 $P$ 和 $R$ 的含义，却不能选择 $=$ 的含义：在每个结构中，$t_1 = t_2$ 为真，当且仅当 $t_1$ 和 $t_2$ 代表同一个元素。这就是 $=$ 被算作逻辑符号的原因。它的定律在每个结构中都成立。

::: fact 相等的定律
- 自反性：$t = t$。
- 对称性：$t = u \imp u = t$。
- 传递性：$t = u \land u = v \imp t = v$。
- 等量代换：$t = u \imp (\varphi[t/x] \imp \varphi[u/x])$。
:::

最后一条定律说的是：相等的对象具有相同的性质。如果 $\mathit{owner}\ \mathit{report} = \mathit{alice}$，并且 $\mathit{admin}\ (\mathit{owner}\ \mathit{report})$，那么 $\mathit{admin}\ \mathit{alice}$。

有了相等，就可以计数。两个变元不一定代表不同的对象：只要有一个元素具有性质 $P$，$\exists x\ y.\ P\ x \land P\ y$ 就为真，$x$ 和 $y$ 都代表这个元素。要说“两个”，就必须说明它们不同。

::: example 用相等来计数
| 说法 | 公式 |
|---|---|
| 至少有一个 $P$ | $\exists x.\ P\ x$ |
| 至少有两个 $P$ | $\exists x\ y.\ x \neq y \land P\ x \land P\ y$ |
| 至多有一个 $P$ | $\forall x\ y.\ P\ x \land P\ y \imp x = y$ |
| 恰好有一个 $P$ | $\exists x.\ P\ x \land (\forall y.\ P\ y \imp y = x)$ |

$x \neq y$ 是 $\lnot (x = y)$ 的缩写。“至多一个”并没有断言存在任何 $P$：没有东西是 $P$ 时，它空真。“恰好一个”把“至少一个”和“至多一个”结合了起来。Isabelle 为它提供了一个量词：$\exists!\, x.\ P\ x$ 读作“恰好存在一个 $x$，使得 $P\ x$”。
:::

::: isabelle
Isabelle 中 `=` 的两个细节让许多初学者栽过跟头。

第一，`=` 比 `¬` 结合得更紧。所以 `¬ x = y` 的意思是 `¬ (x = y)`，Isabelle 会用 `≠` 把它打印出来：

```isabelle
lemma "¬ x = y"
```

```output state
proof (prove)
goal (1 subgoal):
 1. x ≠ y
```

```isabelle
  oops
```

第二，在两个公式之间，`=` 的意思是“当且仅当”：在公式的类型 `bool` 上，`=` 和 `⟷` 是同一个函数。正如你在第 3.5 节看到的，Isabelle 甚至把 `⟷` 打印成 `=`。但语法分析器给这两个符号的优先级不同：`=` 比 `∧` 结合得更紧，而 `⟷` 结合得更松，和 `⟶` 一样。比较一下：

```isabelle
lemma "(A = B ∧ C) ⟷ (A ⟷ B ∧ C)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. (A = B ∧ C) = (A = (B ∧ C))
```

目标显示了 Isabelle 的读法。`A = B ∧ C` 是 `(A = B) ∧ C`，而 `A ⟷ B ∧ C` 是 `A ⟷ (B ∧ C)`，Isabelle 把后者打印成 `A = (B ∧ C)`。两者并不等价：

```isabelle
  nitpick
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = False
    B = True
    C = False
```

当 `A` 为假、`B` 为真、`C` 为假时，左边为假而右边为真。由此得到一条规则：在代表对象的项之间写 `=`，在公式之间写 `⟷`。

```isabelle
  oops
```

`∃!` 量词的写法和正文中一样（先输入 `∃`，再输入 `!`），`blast` 证实了它的含义：

```isabelle
lemma "(∃!x. P x) ⟷ (∃x. P x ∧ (∀y. P y ⟶ y = x))"
  by blast
```
:::

## 编写规约 {#specifications}

把需求变成公式是一门手艺，公式好不好，全看它背后的翻译好不好。按下面的步骤做会有帮助：

1. 确定论域和词汇表：有哪些对象，哪些性质和关系，哪些函数。
2. 利用下面的模式，一条一条地翻译每个需求。
3. 把公式逐个符号、按字面意思用平实的中文读回来，再与需求比较。
4. 在小结构上检验它：找一个应当满足它的结构，再找一个不应当满足它的结构。第 3.3 节的模型探索器和 Nitpick 都能帮上忙。

大多数需求都符合少数几种模式。$A$ 和 $B$ 代表性质。

| 说法 | 公式 | 说明 |
|---|---|---|
| 每个 $A$ 都是 $B$ | $\forall x.\ A\ x \imp B\ x$ | ∀ 与 ⟶ 搭配 |
| 有的 $A$ 是 $B$ | $\exists x.\ A\ x \land B\ x$ | ∃ 与 ∧ 搭配 |
| 没有 $A$ 是 $B$ | $\forall x.\ A\ x \imp \lnot\, B\ x$ | 等同于 $\lnot (\exists x.\ A\ x \land B\ x)$ |
| 只有 $A$ 才是 $B$ | $\forall x.\ B\ x \imp A\ x$ | “只有”使箭头反向 |
| 至多有一个 $A$ | $\forall x\ y.\ A\ x \land A\ y \imp x = y$ | 第 3.6 节 |
| 恰好有一个 $A$ | $\exists x.\ A\ x \land (\forall y.\ A\ y \imp y = x)$ | 第 3.6 节 |

::: pitfall
**∀ 与 ∧ 连用。** “每个管理员都在值班”不是 $\forall x.\ \mathit{admin}\ x \land \mathit{on\_call}\ x$：这个公式说的是每个人都是管理员，并且每个人都在值班。用 ∀ 时，“是管理员”这一限制是一个条件，所以要放在 ⟶ 前面。

**∃ 与 ⟶ 连用。** “有管理员在值班”不是 $\exists x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$：只要有一个人不是管理员，这个公式就为真，因为对这个人来说，蕴涵式空真。用 ∃ 时，这个限制是必须成立的内容的一部分，所以要用 ∧ 连接。
:::

::: pitfall
**“只有”。** “只有管理员才能删除文档”的意思是：凡是能删除某份文档的人都是管理员，即 $\forall u\ d.\ \mathit{can\_delete}\ u\ d \imp \mathit{admin}\ u$。它并没有说管理员能删除任何东西；那是另一条需求，箭头方向相反。

**不用 ≠ 表达“至多一个”。** 本意是“没有两个用户同时持有锁”的 $\lnot (\exists x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y)$，其实连一个用户持有锁都禁止了：取 $y$ 为 $x$ 就能看出来。应当写成 $\forall x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y \imp x = y$。
:::

::: example 形式化一条访问策略
一个文档系统中有用户和文档。在这个例子中，两者都在同一个论域里，谓词 $\mathit{user}$ 和 $\mathit{doc}$ 说明一个对象属于哪一类；这样的谓词称为**守卫**（guard）。其他符号是 $\mathit{admin}\ u$（$u$ 是管理员）、$\mathit{owns}\ u\ d$（$u$ 拥有 $d$）、$\mathit{can\_read}\ u\ d$（$u$ 能读 $d$）和 $\mathit{can\_delete}\ u\ d$（$u$ 能删除 $d$）。

1. 每份文档恰好有一个所有者，并且所有者是用户：
   $$\forall d.\ \mathit{doc}\ d \imp (\exists u.\ \mathit{user}\ u \land \mathit{owns}\ u\ d \land (\forall v.\ \mathit{owns}\ v\ d \imp v = u))$$
2. 只有文档的所有者或管理员才能删除它：
   $$\forall u\ d.\ \mathit{can\_delete}\ u\ d \imp \mathit{owns}\ u\ d \lor \mathit{admin}\ u$$
3. 管理员能读每一份文档：
   $$\forall u\ d.\ \mathit{admin}\ u \land \mathit{doc}\ d \imp \mathit{can\_read}\ u\ d$$
4. 有某个管理员不拥有任何文档：
   $$\exists u.\ \mathit{admin}\ u \land \lnot (\exists d.\ \mathit{doc}\ d \land \mathit{owns}\ u\ d)$$

现在把它们读回来。需求 1 是在一个 ∀ 里面套用“恰好一个”模式。需求 2 含有“只有”，所以箭头从 $\mathit{can\_delete}$ 指向条件。需求 3 需要守卫 $\mathit{doc}\ d$：没有它，这条需求还会说管理员能“读”用户。需求 4 是“有的 $A$ 是 $B$”模式，其中“不拥有任何文档”写成了一个被否定的 ∃。
:::

::: isabelle
Isabelle 可以比较两种译法。如果它们等价，`blast` 能证明两者之间的 `⟷`。如果不等价，Nitpick 会给出一个能区分它们的结构，从这个结构可以看出哪个公式说的才是你的本意。下面是第 3.6 节中表达“恰好一个”的两种方式：

```isabelle
lemma "(∃x. holds x ∧ (∀y. holds y ⟶ y = x)) ⟷
       (∃x. holds x) ∧ (∀x y. holds x ∧ holds y ⟶ x = y)"
  by blast
```

下面把“有管理员在值班”的正确译法和错误译法放在一起比较：

```isabelle
lemma "(∃x. admin x ∧ on_call x) ⟷ (∃x. admin x ⟶ on_call x)"
  nitpick [card 'a = 1]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 1:
  Free variables:
    admin = (λx. _)(a⇩1 := False)
    on_call = (λx. _)(a⇩1 := False)
```

论域只有一个元素，而且它不是管理员：错误的公式在这里为真，正确的公式为假。

```isabelle
  oops
```
:::

想多练习翻译，可以学习数学基础系列中的[逻辑、量词与规格说明](../math/module_02_ZH.html)。

## 类型：从多类别逻辑到 HOL {#types}

例 3.10 的策略需要守卫 $\mathit{user}$ 和 $\mathit{doc}$，因为一个论域里装着两类对象。守卫写起来很烦琐，而漏掉一个就会悄无声息地改变意思。去掉需求 3 中的守卫，它就会说管理员能“读”用户。把“每份文档都有所有者”写成 $\forall d.\ \exists u.\ \mathit{owns}\ u\ d$，你就断言了每个对象（包括用户）都被某个东西拥有。还有，像 $\mathit{owner}$ 这样的函数符号即使对用户也必须给出一个值，因为结构是用整个论域上的函数来解释它的。

::: definition 多类别逻辑
在**多类别逻辑**（many-sorted logic）或**类型化逻辑**（typed logic）中，词汇表给每个常量、函数符号或谓词符号的每个参数以及每个函数的结果都指定一个**类别**（sort），类别也叫**类型**（type）。结构为每个类别各配一个论域，每个变元只在一个类别的论域上取值：$\forall d{::}\mathit{doc}.\ \exists u{::}\mathit{user}.\ \mathit{owns}\ u\ d$ 读作“对每份文档 $d$，都有一个拥有 $d$ 的用户 $u$”。一个表达式如果在某处放了类别不对的参数，它根本就不是公式。
:::

类型并不增加表达能力：$\forall d{::}\mathit{doc}.\ \varphi$ 说的就是 $\forall d.\ \mathit{doc}\ d \imp \varphi$ 所说的，$\exists u{::}\mathit{user}.\ \varphi$ 说的就是 $\exists u.\ \mathit{user}\ u \land \varphi$ 所说的，正是第 3.7 节的那些模式。类型增加的是一道检查。上面那些错误都变成了类型错误，在任何人用这个公式推理之前，计算机就能发现它们。

Isabelle/HOL 从头到尾都是有类型的。每个项都有一个类型。公式是类型为 `bool` 的项，`bool` 的两个值是 `True` 和 `False`。类型为 `τ`（tau）的对象上的谓词，是一个类型为 `τ ⇒ bool` 的函数，它把每个对象映射到 `True` 或 `False`；`τ` 与 `σ`（sigma）之间的关系，是一个类型为 `τ ⇒ σ ⇒ bool` 的函数。所以 Isabelle 中的 `P x` 是把一个函数应用于一个参数，结果是一个公式。由于谓词和函数都和其他东西一样是值，HOL 还允许你对它们进行量化，例如 `∀P. P x ⟶ P x`：正是这一点使它成为一种**高阶**逻辑（higher-order logic）。模块 8 会深入讲解 HOL 的类型和函数。

在 Isabelle 中声明一个词汇表时，用 `typedecl` 声明它的类型，用 `consts` 声明它的符号：

```isabelle
typedecl user
typedecl doc

consts
  admin :: "user ⇒ bool"
  owns :: "user ⇒ doc ⇒ bool"
  can_delete :: "user ⇒ doc ⇒ bool"
  alice :: user
  report :: doc
```

`typedecl user` 声明一个新类型，关于它，除了它至少有一个元素之外一无所知：它就是一个论域。`consts` 声明常量及其类型，但不给出定义。它们是**未解释的**（uninterpreted），和词汇表中的符号完全一样：由结构决定它们的含义；而一条关于它们的引理，只有在无论它们是什么含义都成立时，Isabelle 才能证明它。现在，终于可以写出第 3.1 节的那个论证了：

```isabelle
lemma "(∀u d. admin u ⟶ can_delete u d) ∧ admin alice ⟶ can_delete alice report"
  by blast
```

变元 `u` 和 `d` 不需要守卫：它们的类型可以从 `admin u` 和 `can_delete u d` 推断出来。现在来看一个推不出来的结论。如果所有者能删除自己的文档，Alice 能删除那份报告吗？只有当报告归她所有时才行。Nitpick 需要选项 `show_consts` 才会显示常量的值：

```isabelle
lemma "(∀u d. owns u d ⟶ can_delete u d) ⟶ can_delete alice report"
  nitpick [card user = 2, card doc = 1, show_consts]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card doc = 1 and card user = 2:
  Constants:
    alice = u⇩1
    can_delete =
      (λx. _)(u⇩1 := (λx. _)(d⇩1 := False), u⇩2 := (λx. _)(d⇩1 := False))
    owns = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False), u⇩2 := (λx. _)(d⇩1 := False))
    report = d⇩1
```

Nitpick 按类型给元素起名：u₁ 和 u₂ 是用户，d₁ 是文档。在这个结构中，谁也不拥有任何东西，所以前提空真，而谁也不能删除任何东西。

```isabelle
  oops
```

类型能抓住第 3.2 节“注意”框中的那类错误，而且不止这些。把 `owns` 的两个参数对调一下：

```isabelle fails
lemma "owns report alice"
```

```output
*** Type unification failed: Clash of types "doc" and "user"
***
*** Type error in application: incompatible operand type
***
*** Operator:  owns :: user ⇒ doc ⇒ bool
*** Operand:   report :: doc
***
```

Isabelle 在尝试证明任何东西之前就拒绝了这个陈述。消息指出了函数（`Operator`，运算符）和不匹配的参数（`Operand`，操作数）：`owns` 的第一个参数应当是 `user`，而 `report` 是 `doc`。

如果你写引理时不做声明，Isabelle 会推断出最一般的类型。在 `(∀x. P x) ⟶ (∃x. P x)` 中，没有任何东西说明 `x` 是什么，所以 `x` 得到一个类型变量 `'a`，`P` 得到类型 `'a ⇒ bool`。对类型变量证明的引理对每个类型都成立，也就是对每个论域都成立：

```isabelle
lemma "(∀x. P x) ⟶ (∃x. P x)"
  by blast
```

这个公式之所以有效，是因为每个类型都和结构的每个论域一样，至少有一个元素。在空论域上，`∀x. P x` 会空真，而 `∃x. P x` 为假。

::: trouble
- **谓词的参数太多。** 如果 `P` 在一处用了一个参数，在另一处用了两个，Isabelle 就无法给它指定类型：

  ```isabelle fails
  lemma "P x ⟶ P x y"
  ```

  ```output
  *** Type unification failed: Clash of types "_ ⇒ _" and "bool"
  ***
  *** Type error in application: operator not of function type
  ***
  *** Operator:  P x :: bool
  *** Operand:   y :: ??'a
  ***
  ```

  根据 `P x`，Isabelle 判定 `P x` 是一个类型为 `bool` 的公式，而公式不能应用于 `y`；`??'a` 代表一个 Isabelle 还没有推断出来的类型。每个谓词在各处都要用相同个数的参数。
- **名字是关键字。** 有些英文单词是 Isabelle 命令语言的关键字，`file` 就是其中之一：

  ```isabelle fails
  typedecl file
  ```

  ```output
  *** Outer syntax error⌂: name expected,
  *** but keyword file⌂ was found
  ```

  换一个名字，例如 `doc`。
:::

## 可判定性：工具能做什么，不能做什么 {#decidability}

对于命题逻辑，模块 2 给出了一个判定有效性的算法：计算真值表。这个算法可能很慢，但它总会结束，并给出正确的答案。谓词逻辑有这样的算法吗？大卫·希尔伯特（David Hilbert）和威廉·阿克曼（Wilhelm Ackermann）在 1928 年提出了这个问题，称为**判定问题**（Entscheidungsproblem）。答案分两部分给出。

::: fact 哥德尔完备性定理
谓词逻辑有这样的证明系统（自然演绎就是其中之一，见模块 6）：在其中，一个公式能被证明，当且仅当它是有效的。库尔特·哥德尔（Kurt Gödel）在 1929 年的博士论文中对其中一个这样的系统证明了这一点，论文发表于 1930 年。
:::

完备性（completeness）有一个实际的推论。证明是程序可以检查的有限文本，所以程序可以按从短到长的顺序列出所有证明，连同它们证明的公式。每个有效公式迟早都会出现在这个列表中。要弄清一个公式是否有效，就运行这个程序，等着这个公式出现：如果它是有效的，最终会得到答案“是”。如果它不是有效的，你就会永远等下去，而且在任何时刻，你都不知道再等一会儿是否有用。

::: fact 谓词逻辑的不可判定性
没有算法能对谓词逻辑的每个公式判定它是否有效。阿朗佐·丘奇（Alonzo Church）和艾伦·图灵（Alan Turing）在 1936 年各自独立地证明了这一点。即使词汇表只有一个二元谓词符号，有效性仍然是不可判定的（undecidable）。
:::

图灵的证明与模块 1 提到的停机问题有关：对每个程序，都可以写出一个公式，使这个公式有效当且仅当这个程序会停机；所以，判定有效性的算法也就能判定停机，而没有算法能做到这一点。

::: definition 可判定与半可判定
一个关于输入的问题，如果有某个算法对每个输入都能正确地回答它，并且总会终止，这个问题就是**可判定的**（decidable）。如果有某个算法对每个答案为“是”的输入都回答“是”，但对其他输入可能永远运行下去，这个问题就是**半可判定的**（semi-decidable）。
:::

谓词逻辑中的有效性是半可判定的，但不是可判定的。不可满足性也是如此，因为 $\varphi$ 不可满足当且仅当 $\lnot \varphi$ 有效；而可满足性连半可判定都不是。

哥德尔的两个定理很容易混淆。**完备性定理**（completeness theorem，1929/1930）讲的是有效的公式，即在每个结构中都为真的公式：它们全都能被证明。他的**不完备性定理**（incompleteness theorems，1931），也就是模块 1 提到的那个结果，讲的是在一个特定结构（自然数）中为真的公式：任何证明系统，只要它的公理能由程序检查，并且它只证明真的陈述，就不能证明所有这些公式。HOL 能描述自然数，所以不完备性也适用于 Isabelle 的逻辑。

::: figure id=fig-03-3
原则上，搜索能解决什么。有效的公式都有证明，系统的证明搜索终将找到一个。有有限反模型的公式，可以通过搜索有限结构来驳倒。对于反模型全都是无限的公式，两种搜索都永远不会停止。Isabelle 的工具只搜索到一定的界限，所以在实践中，它们对前两类公式也可能放弃。
:::

为什么有些公式能让两种搜索都无功而返？因为反模型可以是无限的。看这个公式：

$$
(\forall x.\ \lnot\, R\ x\ x) \land (\forall x\ y\ z.\ R\ x\ y \land R\ y\ z \imp R\ x\ z) \imp \lnot (\forall x.\ \exists y.\ R\ x\ y)
$$

“如果 $R$ 是反自反（irreflexive）且传递的，那么有某个元素没有 $R$ 后继。”它不是有效的：以自然数为论域、以 $<$ 为 $R$，两个前提都成立，而每个数都有比它大的数。但它在每个有限结构中都为真（练习 3.8 请你说明原因），所以在有限结构中搜索永远找不到反模型，而证明搜索也永远找不到证明，因为根本没有证明。这样的公式一定存在。如果每个无效的公式都有有限反模型，你就可以让证明搜索和反模型搜索并排运行；两者之中总有一个会结束，有效性也就是可判定的了，而丘奇和图灵已经证明它不是。

::: isabelle
Isabelle 的两种工具都拿这个公式没办法。Nitpick 尝试了 1 到 10 个元素的论域：

```isabelle
lemma "(∀x. ¬ R x x) ∧ (∀x y z. R x y ∧ R y z ⟶ R x z) ⟶ ¬ (∀x. ∃y. R x y)"
  nitpick
```

```output result
Nitpicking formula...

Nitpick found no counterexample
```

```isabelle
  oops
```

而 `blast` 失败了：

```isabelle fails
lemma "(∀x. ¬ R x x) ∧ (∀x y z. R x y ∧ R y z ⟶ R x z) ⟶ ¬ (∀x. ∃y. R x y)"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. (∀x. ¬ R x x) ∧ (∀x y z. R x y ∧ R y z ⟶ R x z) ⟶ ¬ (∀x. ∃y. R x y)
```

`blast` 搜索证明时，会给它的“不安全”步骤（例如为一个以后可能还要再用的 ∀ 选定一个实例）设一个逐渐增大的上限，默认从 0 增加到 20，然后放弃，并给出这条消息：“Failed to apply initial proof method”（未能应用初始证明方法）。两条消息都不能解决这个问题。你需要动脑筋，而在这里，要想到的正是上面那个无限反模型。
:::

这在实践中意味着：

- **证明搜索**（`simp`、`blast`、`auto`，以及模块 9 中 Sledgehammer 调用的证明器）要么成功，要么放弃。成功会给你一个定理；放弃则什么也没告诉你。
- **反模型搜索**（Nitpick 和 Quickcheck）是另一半：一个真正的反例表明公式不是有效的；找不到反例则什么也说明不了。
- 两者都放弃时，就轮到你了：找出证明的思路并引导 Isabelle 完成它（第二部分和第三部分会教你怎么做），或者找出一个工具看不到的反模型。

并非一切都不可判定。命题逻辑是可判定的；谓词逻辑中每个谓词都只有一个参数、并且没有函数符号的那一部分，也是可判定的。SAT 求解器和 SMT 求解器（模块 1）能高效地判定一些有用的片段，这就是 Isabelle 的工具要请它们帮忙的原因。

::: keyidea
谓词逻辑中的有效性是半可判定的：只要证明存在，系统的搜索就能找到它；但没有程序总能告诉你证明不存在。这就是为什么 Isabelle 既提供证明器，也提供反例搜索器；为什么自动化有时会在真的陈述上放弃；也是为什么本系列的其余部分要教你自己引导证明。
:::

## 小结 {#summary}

- 谓词逻辑在命题逻辑的基础上加入了为对象命名的**项**、陈述性质和关系的**谓词**，以及**量词** ∀（“对所有”）和 ∃（“存在”）。
- 在 Isabelle 中，量词的**辖域**尽可能向右延伸。变元在其量词辖域中的出现是**约束的**，其他出现是**自由的**；**语句**没有自由变元。
- **结构**是一个非空论域，加上对词汇表的一个解释。为假的 ∀ 语句有**反例**，为真的 ∃ 语句有**见证**。
- 公式如果在每个结构中都为真，就是**有效的**；如果在某个结构中为真，就是**可满足的**。一个**反模型**就能否定有效性；而要确立有效性，需要一个对每个结构都成立的论证。
- 否定使 ∀ 和 ∃ 互换；∀ 对 ∧ 可分配，∃ 对 ∨ 可分配，反过来则不行；∃y. ∀x 蕴涵 ∀x. ∃y，反之不然。**代入**不能**捕获**变元。
- 在规约中，∀ 与 ⟶ 搭配，∃ 与 ∧ 搭配，“只有”使箭头反向，计数需要 `=`。
- 在 Isabelle 中，谓词是取值为 `bool` 的函数；`typedecl` 和 `consts` 声明词汇表；引理中的自由变元隐含地是全称量化的；`blast` 证明一阶目标，`nitpick` 寻找反模型。`=` 比 `¬` 和 `∧` 结合得更紧，`⟷` 则和 `⟶` 一样松。
- 有效性是**半可判定的**（哥德尔完备性定理），但不是可判定的，即**不可判定的**（丘奇和图灵，1936）：证明器可能在有效的公式上放弃，反模型搜索器会漏掉无限反模型。

## 练习 {#exercises}

:::: exercise 自由还是约束？ {#ex-3-1} ★
对下面每个公式，说出变元的哪些出现是自由的，以及每个约束出现属于哪个量词。哪些公式是语句？按 Isabelle 的辖域约定来判断。

1. $\forall x.\ R\ x\ y \imp (\exists y.\ R\ y\ x)$
2. $(\exists x.\ P\ x) \land Q\ x$
3. $\exists x.\ P\ x \land Q\ x$
4. $\forall x.\ (\exists x.\ R\ x\ x) \imp P\ x$

::: solution
1. $\forall x$ 的辖域是公式的其余全部。在 $R\ x\ y$ 中，$x$ 属于 $\forall x$，$y$ 是自由的。在 $\exists y.\ R\ y\ x$ 中，$y$ 属于 $\exists y$，$x$ 属于 $\forall x$。因为第一个 $y$，它不是语句。
2. 括号在 $P\ x$ 之后结束了 $\exists x$ 的辖域，所以 $Q\ x$ 中的 $x$ 是自由的。不是语句。
3. $\exists x$ 的辖域一直延伸到末尾，所以 $x$ 的两次出现都属于它。是语句。公式 2 和公式 3 只是括号不同，意思却不一样。
4. $R\ x\ x$ 中 $x$ 的两次出现都属于里面的 $\exists x$，它的辖域在右括号处结束。$P\ x$ 中的 $x$ 属于 $\forall x$。是语句。
:::
::::

:::: exercise 在结构中为真吗？ {#ex-3-2} ★
设 $\mathcal M_2$ 的论域是 $\{1, 2, 3\}$，$P^{\mathcal M_2} = \{1, 3\}$（“是奇数”），并且当 $x < y$ 时 $R\ x\ y$ 成立。判断下面每个语句在 $\mathcal M_2$ 中是否为真。对每个为真的 ∃ 语句给出一个见证，对每个为假的 ∀ 语句给出一个反例。

1. $\forall x.\ \exists y.\ R\ x\ y$
2. $\exists y.\ \forall x.\ \lnot\, R\ y\ x$
3. $\forall x.\ P\ x \imp (\exists y.\ R\ x\ y)$
4. $\exists x.\ \forall y.\ x = y \lor R\ x\ y$
5. $\forall x\ y.\ R\ x\ y \imp \lnot\, R\ y\ x$

::: solution
1. 假。反例 $x = 3$：论域中没有比 3 大的元素。
2. 真。见证 $y = 3$：对每个 $x$，$R\ 3\ x$ 都为假，因为没有比 3 大的元素。
3. 假。反例 $x = 3$：3 是奇数，而没有比它大的元素。（对 $x = 1$，见证 $y = 2$ 可行；对 $x = 2$，蕴涵式空真。）
4. 真。见证 $x = 1$：对 $y = 1$，$x = y$ 成立；对 $y = 2$ 和 $y = 3$，$R\ 1\ y$ 成立。
5. 真。$x < y$ 和 $y < x$ 永远不会同时成立。

你可以在第 3.3 节的模型探索器中搭一个 $\mathcal M_2$ 的副本，检查全部五个语句：让 $a$、$b$、$c$ 分别代表 1、2、3，为 $a$ 和 $c$ 勾选 $P$，并为有序对 $(a, b)$、$(a, c)$ 和 $(b, c)$ 打开 $R$。
:::
::::

:::: exercise 从自然语言到公式 {#ex-3-3} ★
词汇表有一元谓词 $\mathit{train}$（是列车）和 $\mathit{block}$（是区段）、二元谓词 $\mathit{occupies}\ t\ b$（“列车 $t$ 占用区段 $b$”），以及常量 $\mathit{depot}$（车库）。把下面的句子翻译成公式：

1. 每列列车都占用某个区段。
2. 没有哪个区段被两列不同的列车占用。
3. 有某个区段是空闲的，也就是说，没有列车占用它。
4. 只有列车才占用区段。
5. 恰好有一列列车占用车库。

::: solution
1. $\forall t.\ \mathit{train}\ t \imp (\exists b.\ \mathit{block}\ b \land \mathit{occupies}\ t\ b)$
2. $\forall b\ t\ u.\ \mathit{block}\ b \land \mathit{occupies}\ t\ b \land \mathit{occupies}\ u\ b \imp t = u$。另一种等价的形式更贴近原句：$\lnot (\exists b\ t\ u.\ \mathit{block}\ b \land t \neq u \land \mathit{occupies}\ t\ b \land \mathit{occupies}\ u\ b)$。
3. $\exists b.\ \mathit{block}\ b \land \lnot (\exists t.\ \mathit{train}\ t \land \mathit{occupies}\ t\ b)$
4. $\forall x\ b.\ \mathit{occupies}\ x\ b \imp \mathit{train}\ x$：“只有”使箭头反向。
5. $\exists t.\ \mathit{train}\ t \land \mathit{occupies}\ t\ \mathit{depot} \land (\forall u.\ \mathit{train}\ u \land \mathit{occupies}\ u\ \mathit{depot} \imp u = t)$

正如第 3.7 节的模式所说，在 1 和 3 中，∀ 与 ⟶ 搭配，∃ 与 ∧ 搭配。在 2 中，由于第 4 句，守卫 $\mathit{train}\ t$ 和 $\mathit{train}\ u$ 是不必要的，但加上它们也无妨。
:::
::::

:::: exercise 是否有效？ {#ex-3-4} ★★
判断下面每个公式是否有效。对有效的公式，给出一个简短的论证；对其他公式，给出一个反模型。然后在 Isabelle 中用 `blast` 或 `nitpick [card = 2]` 检查你的答案。

1. $(\exists x.\ P\ x \land Q\ x) \imp (\exists x.\ P\ x) \land (\exists x.\ Q\ x)$
2. $(\exists x.\ P\ x) \land (\exists x.\ Q\ x) \imp (\exists x.\ P\ x \land Q\ x)$
3. $(\forall x.\ P\ x \imp Q\ x) \imp (\exists x.\ P\ x) \imp (\exists x.\ Q\ x)$
4. $(\forall x.\ \exists y.\ R\ x\ y) \imp (\forall x.\ \exists y.\ R\ y\ x)$

::: solution
1. 有效。$\exists x.\ P\ x \land Q\ x$ 的见证同时也是 $\exists x.\ P\ x$ 和 $\exists x.\ Q\ x$ 的见证。
2. 无效：$D = \{a, b\}$，$P = \{a\}$，$Q = \{b\}$。有东西是 $P$，也有东西是 $Q$，但没有东西同时是两者。
3. 有效。取 $P\ x$ 的一个见证 $x$；前提对它给出 $Q\ x$，所以它也是 $\exists x.\ Q\ x$ 的见证。
4. 无效。“每个人都信任某个人”推不出“每个人都被某个人信任”：取 $D = \{a, b\}$，$R = \{(a, a), (b, a)\}$。每个人都信任 $a$，而没有人信任 $b$。

在 Isabelle 中：

```isabelle
lemma "(∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)"
  by blast

lemma "(∀x. P x ⟶ Q x) ⟶ (∃x. P x) ⟶ (∃x. Q x)"
  by blast
```

```isabelle
lemma "(∃x. P x) ∧ (∃x. Q x) ⟶ (∃x. P x ∧ Q x)"
  nitpick [card = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    P = (λx. _)(a⇩1 := False, a⇩2 := True)
    Q = (λx. _)(a⇩1 := True, a⇩2 := False)
  Skolem constants:
    x = a⇩2
    x = a⇩1
```

```isabelle
  oops
```

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∀x. ∃y. R y x)"
  nitpick [card = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2 and card 'b = 2:
  Free variable:
    R = (λx. _)
        (a⇩1 := (λx. _)(b⇩1 := False, b⇩2 := True),
           a⇩2 := (λx. _)(b⇩1 := False, b⇩2 := True))
  Skolem constants:
    x = b⇩1
    λx. y = (λx. _)(a⇩1 := b⇩2, a⇩2 := b⇩2)
```

```isabelle
  oops
```

在公式 4 中，没有什么迫使 `x` 和 `y` 具有相同的类型，所以 Isabelle 和第 3.5 节一样给了它们两个类型，Nitpick 的反模型把 `'a` 的元素关联到 `'b` 的元素；选项 `[card = 2]` 固定了这两个类型的大小。把 b₁ 看成 a₁、b₂ 看成 a₂，就得到一个只有一个论域的反模型：每个人都信任 a₂，而没有人信任 a₁。Nitpick 的反模型与你的反模型在哪个元素是哪个上可能不同；任何反模型都可以。
:::
::::

:::: exercise 否定规约 {#ex-3-5} ★★
否定每条需求，并把否定向内推，直到它只出现在原子公式前面。然后用中文说出违反这条需求的情形是什么样的。（$\mathit{handles}\ s\ r$ 表示服务器 $s$ 处理请求 $r$，$\mathit{holds}\ x$ 表示 $x$ 持有锁。）

1. $\forall r.\ \mathit{request}\ r \imp (\exists s.\ \mathit{server}\ s \land \mathit{handles}\ s\ r)$
2. $\exists s.\ \mathit{server}\ s \land (\forall r.\ \mathit{request}\ r \imp \mathit{handles}\ s\ r)$
3. $\forall x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y \imp x = y$

::: solution
1. $\exists r.\ \mathit{request}\ r \land (\forall s.\ \mathit{server}\ s \imp \lnot\, \mathit{handles}\ s\ r)$：有某个请求没有任何服务器处理。步骤是：$\lnot \forall$ 变成 $\exists \lnot$；$\lnot (A \imp B)$ 变成 $A \land \lnot B$；$\lnot \exists$ 变成 $\forall \lnot$；$\lnot (C \land D)$ 变成 $C \imp \lnot D$，这个等价式可以用真值表验证。
2. $\forall s.\ \mathit{server}\ s \imp (\exists r.\ \mathit{request}\ r \land \lnot\, \mathit{handles}\ s\ r)$：每台服务器都有某个请求没有处理，所以没有一台服务器能处理所有请求。
3. $\exists x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y \land x \neq y$：有两个不同的用户持有锁。

:::
::::

:::: exercise 在 Isabelle 中计数 {#ex-3-6} ★★
1. 利用例 3.9 中的公式，用 `blast` 证明：“至多有一个元素满足 `P`”的否定是“至少有两个元素满足 `P`”。
2. 有人把“恰好有一个元素满足 `P`”写成 `∃x. ∀y. P y ⟶ y = x`。用 Nitpick 比较这个公式和 `∃!x. P x`，并解释这个公式实际上说的是什么。

::: solution
1. 把否定推进去：$\lnot \forall$ 变成 $\exists \lnot$，$\lnot (P\ x \land P\ y \imp x = y)$ 变成 $P\ x \land P\ y \land x \neq y$。

   ```isabelle
   lemma "¬ (∀x y. P x ∧ P y ⟶ x = y) ⟷
          (∃x y. x ≠ y ∧ P x ∧ P y)"
     by blast
   ```

2. Nitpick 找到一个使两个公式取值不同的结构：

   ```isabelle
   lemma "(∃x. ∀y. P y ⟶ y = x) ⟷ (∃!x. P x)"
     nitpick [card 'a = 1]
   ```

   ```output result
   Nitpicking formula...

   Nitpick found a counterexample for card 'a = 1:
     Free variable:
       P = (λx. _)(a⇩1 := False)
   ```

   ```isabelle
     oops
   ```

   在一个只有一个元素、并且 `P` 对什么都不成立的论域中，`∃x. ∀y. P y ⟶ y = x` 为真（对每个 `x` 都空真），而 `∃!x. P x` 为假。这个公式说的是“至多有一个元素满足 `P`”：它忘了说确实有一个元素满足 `P`。
:::
::::

:::: exercise 代入 {#ex-3-7} ★★★
计算下面每个代入，必要时给约束变元改名：

1. $(\forall y.\ R\ x\ y)[z/x]$
2. $(\forall y.\ R\ x\ y)[y/x]$
3. $(\exists x.\ R\ x\ y \land P\ x)[f\ x/y]$
4. $(P\ x \land (\exists x.\ R\ x\ y))[g\ y/x]$

然后解释：如果用 $y$ 代入 $x$，从 $\forall x.\ \exists y.\ y \neq x$ 推出 $\exists y.\ y \neq y$，哪里出了错？前提在哪些结构中为真？

::: solution
1. $\forall y.\ R\ z\ y$。项 $z$ 不含公式中的约束变元，所以不需要改名。
2. 直接放入 $y$ 会得到 $\forall y.\ R\ y\ y$，$y$ 被捕获了。先改名：$\forall w.\ R\ y\ w$。
3. 项 $f\ x$ 含有 $x$，而公式约束了 $x$。把约束的 $x$ 改名为 $w$，得到 $\exists w.\ R\ w\ y \land P\ w$，再代入：$\exists w.\ R\ w\ (f\ x) \land P\ w$。
4. 只有第一个 $x$ 是自由的，而项 $g\ y$ 不含公式所约束的变元：$P\ (g\ y) \land (\exists x.\ R\ x\ y)$。

前提 $\forall x.\ \exists y.\ y \neq x$ 说的是每个元素都有一个与它不同的元素，这在每个至少有两个元素的结构中都为真。不改名就用 $y$ 代入 $x$，会捕获 $y$，得到 $\exists y.\ y \neq y$，它在每个结构中都为假。正确的实例要先改名：$\exists w.\ w \neq y$，即“有某样东西与 $y$ 不同”，这确实可以推出。
:::
::::

:::: exercise 只有无限反模型 {#ex-3-8} ★★★
证明第 3.9 节的公式 $(\forall x.\ \lnot\, R\ x\ x) \land (\forall x\ y\ z.\ R\ x\ y \land R\ y\ z \imp R\ x\ z) \imp \lnot (\forall x.\ \exists y.\ R\ x\ y)$ 在每个有限结构中都为真。提示：假设有一个有限结构，其中 $R$ 反自反且传递，并且每个元素都有 $R$ 后继；从任意一个元素出发，一直沿着后继走下去。

::: solution
反过来假设 $\mathcal M$ 是有限的，$R$ 在 $\mathcal M$ 中反自反且传递，并且每个元素都有 $R$ 后继。任取一个元素 $x_0$，再取满足 $R\ x_0\ x_1$ 的 $x_1$，再取满足 $R\ x_1\ x_2$ 的 $x_2$，依此类推。反复运用传递性，可以得到：只要 $i < j$，就有 $R\ x_i\ x_j$。论域是有限的，所以这个序列一定会重复：对某个 $i < j$，有 $x_i = x_j$。于是 $R\ x_i\ x_j$ 就是 $R\ x_i\ x_i$，而反自反性不允许这种情况。所以在前提成立的有限结构中，有某个元素没有后继，公式为真。

对无限论域，这个论证就不成立了，因为序列不一定会重复：在带有 $<$ 的自然数中，序列 $0, 1, 2, \dots$ 会永远延续下去。这就是第 3.9 节的那个无限反模型。
:::
::::

:::: exercise Isabelle 中的类型化策略 {#ex-3-9} ★★★
给第 3.8 节的词汇表加上 `can_read :: "user ⇒ doc ⇒ bool"` 和第二个用户 `bob :: user`。考虑这两条需求：谁都不能删除自己不能读的文档；所有者能删除自己的文档。

1. 用 `blast` 证明：如果另外还有 Alice 拥有那份报告，那么 Alice 能读那份报告。
2. 用 Nitpick 表明：这两条需求加上 `admin bob`，推不出 Bob 能读那份报告。解释这个反模型。

::: solution
```isabelle
consts
  can_read :: "user ⇒ doc ⇒ bool"
  bob :: user

lemma "(∀u d. can_delete u d ⟶ can_read u d) ∧
       (∀u d. owns u d ⟶ can_delete u d) ∧
       owns alice report ⟶ can_read alice report"
  by blast
```

Alice 拥有那份报告，所以她能删除它，因而她能读它：这要用到两条 ∀ 需求的两个实例，`blast` 能找到它们。

```isabelle
lemma "(∀u d. can_delete u d ⟶ can_read u d) ∧
       (∀u d. owns u d ⟶ can_delete u d) ∧
       admin bob ⟶ can_read bob report"
  nitpick [card user = 1, card doc = 1, show_consts]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card doc = 1 and card user = 1:
  Constants:
    admin = (λx. _)(u⇩1 := True)
    can_delete = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False))
    owns = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False))
    report = d⇩1
    bob = u⇩1
    can_read = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False))
```

```isabelle
  oops
```

在这个反模型中，Bob 是管理员，但谁也不拥有任何东西，谁也不能读或删除任何东西；两条需求都空真地成立。需求中没有任何内容赋予管理员什么权限。如果管理员应当能读一切，那就需要再加一条需求，比如例 3.10 中的需求 3。
:::
::::

## 自测题 {#quiz}

```quiz
? 哪个公式表达“每个管理员都在值班”？
- [ ] $\forall x.\ \mathit{admin}\ x \land \mathit{on\_call}\ x$
- [x] $\forall x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$
- [ ] $\exists x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$
- [ ] $\forall x.\ \mathit{on\_call}\ x \imp \mathit{admin}\ x$
> 用 ∀ 时，“是管理员”这一限制是一个条件，所以 ∀ 与 ⟶ 搭配。第一个选项说的是每个人都是管理员；最后一个选项说的是只有管理员才值班。

? 按照 Isabelle 的辖域约定，在 $\forall x.\ P\ x \imp (\exists y.\ R\ x\ y) \land Q\ y$ 中，哪一个出现是自由的？
- [ ] $R\ x\ y$ 中的 $x$
- [ ] $R\ x\ y$ 中的 $y$
- [ ] $P\ x$ 中的 $x$
- [x] $Q\ y$ 中的 $y$
> 括号在 $R\ x\ y$ 之后结束了 $\exists y$ 的辖域，所以 $Q\ y$ 中的 $y$ 在这个辖域之外。$\forall x$ 的辖域一直延伸到公式末尾。

? 哪个公式是有效的？
- [x] $(\exists y.\ \forall x.\ R\ x\ y) \imp (\forall x.\ \exists y.\ R\ x\ y)$
- [ ] $(\forall x.\ \exists y.\ R\ x\ y) \imp (\exists y.\ \forall x.\ R\ x\ y)$
- [ ] $(\forall x.\ P\ x \lor Q\ x) \imp (\forall x.\ P\ x) \lor (\forall x.\ Q\ x)$
- [ ] $(\exists x.\ P\ x) \land (\exists x.\ Q\ x) \imp (\exists x.\ P\ x \land Q\ x)$
> 如果有一个 $y$ 对每个 $x$ 都行得通，那么每个 $x$ 都有一个 $y$。另外三个公式都有含两个元素的反模型。

? 一个公式的反模型能说明什么？
- [ ] 这个公式不可满足
- [ ] 这个公式在某个结构中为真
- [x] 这个公式不是有效的
- [ ] `blast` 证明不了这个公式，但别的方法可以
> 反模型是一个使公式为假的结构，所以这个公式并非在每个结构中都为真。它仍然可能是可满足的。

? Isabelle 怎样读 `¬ x = y ∧ P x`？
- [ ] `¬ (x = y ∧ P x)`
- [x] `(¬ (x = y)) ∧ P x`
- [ ] `¬ x = (y ∧ P x)`
- [ ] 它认为这个公式有歧义，拒绝接受
> `=` 比 `¬` 结合得更紧，`¬` 又比 `∧` 结合得更紧。Isabelle 把这个公式打印成 `x ≠ y ∧ P x`。

? Nitpick 对一条引理回答“Nitpick found no counterexample”。你能得出什么结论？
- [ ] 这条引理是有效的
- [ ] 这条引理不可满足
- [ ] 这条引理有无限反模型
- [x] 在 Nitpick 搜索过的有限结构中没有反模型；这条引理仍然可能是错的
> Nitpick 只搜索不超过一定大小的论域，默认最多 10 个元素。有些无效的公式，例如第 3.9 节中的那个，只有无限反模型。
```
