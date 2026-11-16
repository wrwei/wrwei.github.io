---
title: 系统建模：状态机与不变式
part: 4
lead: 把系统描述为状态机，并在 Isabelle 中证明其中永远不会发生坏事。你将为状态、事件、守卫条件和效果建模，定义可达状态，用不变式证明安全性质，加强一个不是归纳的不变式，把反例变成一条轨迹，并把关于抽象模型的证明结果沿用到更具体的模型上。
minutes: 230
needs: 模块 1–12，尤其是模块 4（关系与 `r⇧*`）、模块 5（不变式）、模块 10（Isar）、模块 11（归纳定义与规则归纳）和模块 12（抽象函数）
goals:
  - 把系统建模为状态机：它有状态、初始状态，以及带守卫条件和效果的事件
  - 用 `inductive` 定义模型的迁移和可达状态，并把可达性与 `r⇧*` 联系起来
  - 借助不变式用规则归纳证明安全性质，并加强不是归纳的不变式
  - 用 Quickcheck 或 Nitpick 找出一次破坏有缺陷设计的运行，把它读作一条轨迹，并修正设计
  - 证明一个具体模型精化了一个抽象模型，从而使抽象模型的不变式在具体模型中成立
  - 区分安全性与活性，并说出检查活性的工具
imports: Main
---

## 响应事件的系统 {#machines}

你在模块 12 中验证的程序都会计算出一个结果：接受一个列表，返回排好序的列表；或者接受一棵树和一个键，返回一棵新树。它们的规约把输出和输入联系起来。很多系统却不是这样工作的。交通信号灯控制器、电梯、网络协议、银行和操作系统都永远不会结束。它们保存着一个**状态**（state），并对**事件**（event）作出反应：有人按下按钮，计时器到时，一条消息到达。对这样的系统，要问的不是“结果对不对？”，而是“系统会不会进入坏状态？”。两列火车在同一段轨道上，电梯开着门移动，一把锁同时被两个进程持有：这些都是坏状态。无论事件以什么顺序发生、系统运行多久，它都绝不能到达其中任何一个。

本模块把这样的系统描述为**状态机**（state machine），并在 Isabelle 中证明没有哪个可达状态是坏的。所用的方法是模块 5 的不变式，现在用在有许多事件的系统上，再加上模块 11 的归纳定义（inductive definition）和规则归纳（rule induction）。

先从一个小系统开始：电梯的门。门是打开的、正在关闭的或已关闭的，电梯要么在移动，要么没有在移动。可能发生的事件有五个。每个事件都有一个**守卫条件**（guard），即关于当前状态的一个条件，说明这个事件什么时候可以发生；还有一个**效果**（effect），说明这个事件怎样改变状态。

::: example 电梯门
状态由两部分组成：门（Open、Closing 或 Closed，即打开、正在关闭或已关闭），以及电梯是否在移动。初始时门是关闭的，电梯静止不动。

| 事件 | 守卫条件：何时可以发生 | 效果 |
|---|---|---|
| open | 电梯没有在移动 | 门变为 Open |
| close | 门是 Open | 门变为 Closing |
| shut | 门是 Closing | 门变为 Closed |
| start | 门是 Closed | 电梯开始移动 |
| stop | 任何时候 | 电梯停下 |

事件 *shut* 是门的机构报告门已经完全关好。*open* 的守卫条件允许门在关闭的过程中重新打开，就像有人走进来时真实的电梯门所做的那样。
:::

模块 4 介绍过状态机，用的例子是一扇门和它的锁，并用闭包 `r⇧*` 求出了它的可达状态。本模块沿用同样的定义，并用事件来描述每一步。

::: definition 状态机
**状态机**，又称**迁移系统**（transition system），由一个**状态**集合、一个**初始状态**（initial state）集合和一个**迁移关系**（transition relation）组成：$s \to t$ 表示机器可以一步从状态 $s$ 到达状态 $t$。在本模块中，每一步都由**事件**来描述。当一个事件的**守卫条件**在状态 $s$ 中成立时，这个事件就可以在 $s$ 中发生，并到达由它的**效果**给出的状态。
:::

::: definition 运行、轨迹与可达状态
**运行**（run）是一个有限或无限的状态序列 $s_0 \to s_1 \to s_2 \to \dots$，它从一个初始状态开始，并遵循迁移关系。**轨迹**（trace）用事件的列表来描述一次运行，各个状态则可以由这些事件推出。如果有某次运行到达一个状态，这个状态就是**可达的**（reachable）。
:::

下面是电梯从初始状态开始的一次运行，箭头上方写着事件：

$$
(\mathit{Closed}, \text{静止}) \xrightarrow{\ \mathit{open}\ } (\mathit{Open}, \text{静止})
\xrightarrow{\ \mathit{close}\ } (\mathit{Closing}, \text{静止}) \xrightarrow{\ \mathit{shut}\ }
(\mathit{Closed}, \text{静止}) \xrightarrow{\ \mathit{start}\ } (\mathit{Closed}, \text{移动})
$$

它的轨迹是 *open, close, shut, start*。这台状态机有 $3 \times 2 = 6$ 个状态，其中四个是可达的。另外两个正是危险的状态：

| 门 | 电梯 | 可达吗？ |
|---|---|---|
| Closed | 静止 | 是，它就是初始状态 |
| Open | 静止 | 是，经过 *open* |
| Closing | 静止 | 是，经过 *open*、*close* |
| Closed | 移动 | 是，经过 *start* |
| Open | 移动 | 否 |
| Closing | 移动 | 否 |

为什么电梯永远不会在门开着或正在关闭时移动？只有六个状态时，你可以手工检查每一个状态和每一个事件。真实的控制器有多得多的状态，而带有计数器或队列的模型有无限多个状态。**模型检测器**（model checker）逐个探索有限模型的可达状态（模块 1）。本模块则用归纳一次性地对所有可达状态证明这个性质，无论有多少个状态，这种方法都行得通。

::: note
建立模型，就是决定舍弃什么。电梯模型里没有楼层，没有乘客，没有电动机，也没有时间。关于模型的证明，对模型舍弃的东西什么也说明不了；正如模块 1 所说，证明表明的是模型满足它的规约，只有确认（validation）才能表明模型和规约描述的确实是真实的电梯。根据你想证明的性质来决定模型里放进什么：这里就是门和电梯的移动。
:::

## Isabelle 中的状态机 {#lift}

在 Isabelle 中，用你熟悉的类型描述状态，用一个归纳定义（模块 11）描述迁移，再用另一个归纳定义描述可达状态。电梯的一个状态是一个有序对：门，以及一个布尔值，电梯移动时它为 `True`。

```isabelle
datatype door = Open | Closing | Closed

inductive lstep :: "door × bool ⇒ door × bool ⇒ bool" where
  open_door:  "¬ m ⟹ lstep (d, m) (Open, m)"
| close_door: "d = Open ⟹ lstep (d, m) (Closing, m)"
| shut_door:  "d = Closing ⟹ lstep (d, m) (Closed, m)"
| start_lift: "d = Closed ⟹ lstep (d, m) (d, True)"
| stop_lift:  "lstep (d, m) (d, False)"
```

`lstep s t` 表示从状态 `s` 走一步可以到达状态 `t`：它就是迁移关系。每条规则对应例 13.1 中的一个事件。规则的前提是相应事件的守卫条件；结论把事件发生前的状态和发生后的状态联系起来，效果就是两者之间的差别。规则 `start_lift` 读作：如果门是关闭的，那么一步就可以从 `(d, m)` 到达 `(d, True)`，也就是门不变，电梯在移动。规则 `stop_lift` 没有前提，因为随时都可以停下。

可达状态就是从初始状态出发、经过任意多步所能得到的状态：

```isabelle
inductive lreach :: "door × bool ⇒ bool" where
  init: "lreach (Closed, False)"
| step: "lreach s ⟹ lstep s t ⟹ lreach t"
```

规则 `init` 使初始状态可达。规则 `step` 说，从一个可达状态走一步，到达的还是可达状态。除此之外没有别的状态是可达的，因为归纳定义所定义的是对其规则封闭的最小谓词（模块 11）。一次运行就是用这些规则构造的一个推导。下面用 Isar（模块 10）一步一步地写出到达 `(Closing, False)` 的运行：

```isabelle
lemma "lreach (Closing, False)"
proof -
  have "lreach (Closed, False)" by (rule lreach.init)
  moreover have "lstep (Closed, False) (Open, False)" by (rule open_door) simp
  ultimately have "lreach (Open, False)" by (rule lreach.step)
  moreover have "lstep (Open, False) (Closing, False)" by (rule close_door) simp
  ultimately show "lreach (Closing, False)" by (rule lreach.step)
qed
```

每个 `lstep` 事实是这次运行中的一个事件，用相应的规则来证明：`rule open_door` 留下守卫条件 `¬ False` 待证，由 `simp` 证明。每个 `ultimately` 都用规则 `lreach.step` 把这一步加到运行上。

要证明关于**每一个**可达状态的事情，你需要 `lreach` 的归纳规则（induction rule）：

```isabelle
thm lreach.induct
```

```output result
⟦lreach ?x; ?P (Closed, False); ⋀s t. ⟦lreach s; ?P s; lstep s t⟧ ⟹ ?P t⟧
⟹ ?P ?x
```

把它当作模块 5 的不变式方法来读。要证明性质 `?P` 在每个可达状态 `?x` 中都成立，就证明它在初始状态中成立，并且从一个满足 `?P` 的可达状态走一步，到达的状态也满足 `?P`。第 13.3 节会用到这条规则。

### 可达性是一种闭包 {#closure}

你在模块 4 中见过关系 `r` 的自反传递闭包（reflexive–transitive closure）`r⇧*`：它由这样的有序对 `(a, b)` 组成，从 `a` 出发，经过零步或多步 `r` 可以到达 `b`。电梯的可达状态，就是使 `((Closed, False), s)` 属于单步关系的闭包的那些状态 `s`。Isabelle 证明了这两个定义是一致的：

```isabelle
lemma lreach_rtrancl: "lreach s ⟷ ((Closed, False), s) ∈ {(s, t). lstep s t}⇧*"
proof
  assume "lreach s"
  then show "((Closed, False), s) ∈ {(s, t). lstep s t}⇧*"
    by induction (auto intro: rtrancl_into_rtrancl)
next
  assume "((Closed, False), s) ∈ {(s, t). lstep s t}⇧*"
  then show "lreach s"
    by induction (auto intro: lreach.intros)
qed
```

`{(s, t). lstep s t}` 是写成有序对集合的单步关系，`⇧*`（输入 `^*`）是闭包。在两半证明中，`then` 都把假设传给 `induction` 方法，于是这个方法不需要参数：它用这个事实自己的归纳规则对这个事实做归纳。前一半是对 `lreach s` 的规则归纳。后一半是对闭包的归纳，用的是库中的规则 `rtrancl_induct`。库中的规则 `rtrancl_into_rtrancl` 在一条路径的末尾加上一步，就像 `lreach.step` 那样。

你也可以直接使用 `r⇧*`。而像 `lreach` 这样自己写的定义，它的归纳规则恰好有不变式方法的两种情形，情形的名字由你来取，并且初始状态直接写在定义里。模块 11 定义可达性时，则是把那一步放在前面（`steps`）。对不变式来说，把那一步放在末尾更方便：这样，归纳假设说的就是最后一步**之前**的状态，与不变式方法完全一致，而初始状态保持固定。如果把那一步放在前面，对从某一个初始状态出发的运行做规则归纳，就会遇到模块 11 中 `steps move Done s` 遇到的问题：归纳规则会把运行的起点换成一个变量。

## 安全性质与不变式 {#invariants}

你希望电梯具有的性质是：除非门已经关闭，否则它永远不会移动。这类性质有一个专门的名字。

::: definition 安全性质
**安全性质**（safety property）说的是：坏事永远不会发生。在本模块中，坏事就是坏状态，所以安全性质是状态的一个性质，它必须在每个可达状态中都成立。如果一次运行到达了一个使它不成立的状态，这次运行就是它的一个**反例**（counterexample）。
:::

::: definition 不变式与归纳不变式
如果状态的一个性质 $I$ 在每个可达状态中都成立，它就是状态机的一个**不变式**（invariant）。如果 $I$ 在每个初始状态中都成立，并且从每个满足 $I$ 的状态出发，每一步都到达一个满足 $I$ 的状态，那么 $I$ 是**归纳的**（inductive）。
:::

模块 5 把一个初始时成立、并被每一步保持的性质称为不变式，那正是这里的第二个概念。从现在起，两者的区别很重要：每个归纳的性质都是不变式，但第 13.5 节会给出一个不是归纳的不变式。

::: fact 归纳不变式在每个可达状态中都成立
如果 $I$ 是归纳的，那么 $I$ 在每个可达状态中都成立。
:::

证明是对可达性的规则归纳：$I$ 在初始状态中成立，而关于一步的那条规则把 $I$ 从一个可达状态传到下一个状态。在 Isabelle 中，把电梯的安全性质写成状态的函数，然后开始规则归纳：

```isabelle
fun lift_ok :: "door × bool ⇒ bool" where
  "lift_ok (d, m) = (m ⟶ d = Closed)"

lemma lift_safe: "lreach s ⟹ lift_ok s"
  apply (induction rule: lreach.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. lift_ok (Closed, False)
 2. ⋀s t. ⟦lreach s; lift_ok s; lstep s t⟧ ⟹ lift_ok t
```

子目标 1 是基础情形（base case）：初始状态是安全的。子目标 2 是归纳步骤（induction step）：对于一个安全的可达状态 `s`，以及从 `s` 到 `t` 的一步，状态 `t` 也是安全的。两者都可以由 `lstep` 的规则得出：

```isabelle
  apply (auto elim: lstep.cases)
  done
```

`lstep.cases` 就是模块 11 中的规则反演（rule inversion）：由 `lstep s t`，它为每条规则各产生一种情形，其中 `s` 和 `t` 换成了该规则中的状态，守卫条件则成为一个假设。在五种情形中的四种里，无论原来的状态如何，新状态都是安全的：*open* 要求电梯静止，并让它保持静止；*start* 要求门是关闭的；*shut* 和 *stop* 分别得到关闭的门和静止的电梯。在 *close* 这种情形中，归纳假设（induction hypothesis）就起作用了。门原来是打开的，所以由 `lift_ok s`，电梯没有在移动，于是新状态 `(Closing, False)` 是安全的。这就是不变式证明需要归纳假设的原因：一个让状态的某一部分保持不变的事件，要依靠这一部分本来就是安全的。

这个定理回答了第 13.1 节的问题：

```isabelle
corollary "¬ lreach (Open, True)"
  using lift_safe by force
```

Isabelle 对待 `corollary` 和 `theorem` 与对待 `lemma` 完全一样。这些词是告诉读者一个结果起什么作用：定理（theorem）是主要结果，推论（corollary）则直接由某个定理得出。

::: pitfall
要对一个状态变量陈述性质，而不要对一个模式陈述。下面这个版本看起来一样，却会失败：

```isabelle fails
lemma "lreach (d, m) ⟹ m ⟶ d = Closed"
  by (induction rule: lreach.induct) (auto elim: lstep.cases)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. m ⟹ d = Closed
```

剩下的目标是假的：它断言，对于引理中的 `d` 和 `m`，移动中的电梯的门是关闭的。`lreach` 的参数是有序对 `(d, m)`，而不是一个变量，而归纳规则针对的是一个变量状态 `?x`。参数是模式时，这个方法不会把 `d` 和 `m` 换成各条规则中的状态；它们保持原样，于是基础情形要求证明的是关于 `d` 和 `m` 的断言，而不是关于 `(Closed, False)` 的断言。模块 11 在一个常量上遇到过同样的问题。像 `lift_ok` 那样，把性质写成整个状态的函数，归纳就能成功。
:::

## 为人行横道建模 {#crossing}

本模块其余部分只研究一个更大的系统：一个带按钮的人行横道。汽车看的是交通信号灯（绿灯、黄灯、红灯，在 Isabelle 中写作 Green、Amber、Red）；行人看的是行人信号灯（通行或禁止通行，写作 Walk、DontWalk）。控制器应当满足以下需求：

- **R1.** 只有当汽车信号灯是红灯时，行人才可以通行。
- **R2.** 有人按下按钮之后，行人最终能够通行。

R1 是一条安全性质，第 13.5 节到第 13.7 节会证明它。R2 属于另一类性质，第 13.8 节会讨论它。

### 用记录表示状态 {#records}

状态有三部分：汽车信号灯，行人信号灯，以及是否有待处理的请求（按钮已经按下，而行人还没有通行）。两个部分用有序对就够了。三个或更多部分时，就用**记录**（record）给各部分起名字：记录是一种元组，它的各个分量，即它的**字段**（field），都有名字。

```isabelle
datatype light = Green | Amber | Red
datatype signal = Walk | DontWalk

record crossing =
  cars :: light
  peds :: signal
  req  :: bool
```

`record` 命令定义类型 `crossing`，并为每个字段定义一个选取该字段的函数：如果 `s` 是一个 `crossing` 类型的值，`cars s` 就是它的汽车信号灯。记录值把它的字段列在括号里，例如 `⦇cars = Green, peds = DontWalk, req = False⦈`；`⦇` 输入为 `(|`，`⦈` 输入为 `|)`。记号 `s⦇cars := Amber⦈` 是对一个字段的**更新**（update）：它表示把 `s` 的汽车信号灯改为黄灯、其他字段保持不变所得到的状态。化简器知道这些选择函数（selector）和更新怎样相互作用，所以它会自己把 `cars (s⦇req := True⦈)` 重写成 `cars s`。

```isabelle
definition start :: crossing where
  "start = ⦇cars = Green, peds = DontWalk, req = False⦈"

value "start⦇cars := Amber⦈"
```

```output
"⦇cars = Amber, peds = DontWalk, req = False⦈"
  :: "crossing"
```

::: trouble
更新要用 `:=`。如果用 `=`，Isabelle 会把 `⦇cars = Amber⦈` 读成一个记录值，而记录值必须按 `record` 命令中的顺序列出记录的每一个字段：

```isabelle fails
value "start⦇cars = Amber⦈"
```

```output
*** exception TERM raised⌂:
***   Error in record input: expecting more fields
***   ??.cars = Amber::<position>
```

这条消息（“Error in record input: expecting more fields”，记录输入有误：还需要更多字段）说的是记录值缺少字段；`??.cars = Amber` 是 Isabelle 读到的那个字段，以它的内部形式显示。应该写成 `start⦇cars := Amber⦈`。
:::

### 带守卫条件和效果的事件 {#events}

控制器对六个事件作出反应。按下按钮来自外部；其余五个是控制器自己的决定。

| 事件 | 守卫条件 | 效果 |
|---|---|---|
| Press | 任何时候 | 设置请求 |
| ToAmber | 汽车信号灯是绿灯，并且有待处理的请求 | 汽车信号灯变为黄灯 |
| ToRed | 汽车信号灯是黄灯 | 汽车信号灯变为红灯 |
| StartWalk | 汽车信号灯是红灯，行人没有在通行，并且有待处理的请求 | 行人开始通行 |
| EndWalk | 行人正在通行 | 行人停止通行；清除请求 |
| ToGreen | 汽车信号灯是红灯，并且没有待处理的请求 | 汽车信号灯变为绿灯 |

注意这个设计是怎样使用请求的。请求一旦设置，就一直保留到行人通行结束；而只有在没有待处理的请求时，汽车信号灯才会变成绿灯。在电梯的例子中，每个事件是归纳定义中的一条规则。这一次，把守卫条件和效果写成两个函数。函数可以用 `value` 计算，所以你可以运行这个模型，这在第 13.6 节查找错误时会很重要。

```isabelle
datatype event = Press | ToAmber | ToRed | StartWalk | EndWalk | ToGreen

fun guard :: "event ⇒ crossing ⇒ bool" where
  "guard Press s = True"
| "guard ToAmber s = (cars s = Green ∧ req s)"
| "guard ToRed s = (cars s = Amber)"
| "guard StartWalk s = (cars s = Red ∧ peds s = DontWalk ∧ req s)"
| "guard EndWalk s = (peds s = Walk)"
| "guard ToGreen s = (cars s = Red ∧ ¬ req s)"

fun effect :: "event ⇒ crossing ⇒ crossing" where
  "effect Press s = s⦇req := True⦈"
| "effect ToAmber s = s⦇cars := Amber⦈"
| "effect ToRed s = s⦇cars := Red⦈"
| "effect StartWalk s = s⦇peds := Walk⦈"
| "effect EndWalk s = s⦇peds := DontWalk, req := False⦈"
| "effect ToGreen s = s⦇cars := Green⦈"
```

人行横道的迁移关系是：如果对某个守卫条件在 $s$ 中成立的事件 `e` 有 $t$ = `effect e s`，那么 $s \to t$。要运行这个模型，就按顺序应用一个事件列表。守卫条件为假的事件不能发生，`run` 会跳过它：

```isabelle
fun run :: "event list ⇒ crossing ⇒ crossing" where
  "run [] s = s"
| "run (e # es) s = run es (if guard e s then effect e s else s)"

value "run [Press, ToAmber, ToRed, StartWalk] start"
```

```output
"⦇cars = Red, peds = Walk, req = True⦈"
  :: "crossing"
```

一位行人按下了按钮，汽车信号灯经过黄灯变成红灯，行人开始通行。现在去掉按按钮这一步，再运行同样的事件：

```isabelle
value "run [ToAmber, ToRed, StartWalk] start"
```

```output
"⦇cars = Green, peds = DontWalk, req = False⦈"
  :: "crossing"
```

什么也没有发生。没有请求时，`ToAmber` 的守卫条件为假；而汽车信号灯是绿灯时，`ToRed` 和 `StartWalk` 的守卫条件也为假，所以 `run` 跳过了全部三个事件。图 13.1 展示了运行所能到达的每一个状态。

::: figure id=fig-13-1
人行横道的可达状态以及它们之间的事件。每个方框中的小信号灯显示的是汽车信号灯。粗框是初始状态 `start`。
:::

可达状态的定义方式和电梯一样：一条规则针对初始状态，一条规则针对一个事件：

```isabelle
inductive reach :: "crossing ⇒ bool" where
  init: "reach start"
| step: "reach s ⟹ guard e s ⟹ reach (effect e s)"

thm reach.induct
```

```output result
⟦reach ?x; ?P start; ⋀s e. ⟦reach s; ?P s; guard e s⟧ ⟹ ?P (effect e s)⟧
⟹ ?P ?x
```

这条归纳规则和前面一样有两种情形。在归纳步骤中，事件 `e` 是任意的：证明必须处理守卫条件在某个可达状态中成立的每一个事件。

## 当不变式不是归纳的 {#strengthen}

需求 R1 说：如果行人在通行，那么汽车信号灯是红灯。

```isabelle
definition safe :: "crossing ⇒ bool" where
  "safe s ⟷ (peds s = Walk ⟶ cars s = Red)"
```

### 失败的证明 {#fails}

试试电梯的那种证明。这次用 Isar 来写，初始状态一种情形，事件一种情形，并用 `cases e` 依次考虑每一个事件：

```isabelle fails
theorem "reach s ⟹ safe s"
proof (induction rule: reach.induct)
  case init
  show ?case by (simp add: safe_def start_def)
next
  case (step s e)
  then show ?case by (cases e) (auto simp: safe_def)
qed
```

```output result
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⟦reach s; e = ToGreen; cars s = Red; ¬ req s; peds s = Walk⟧ ⟹ False
```

基础情形通过了，六个事件中的五个也通过了。剩下的目标属于 `ToGreen`。把它当作一个状态来读：汽车信号灯是红灯，没有待处理的请求，而行人在通行。这个状态是安全的，因为汽车信号灯是红灯。`ToGreen` 的守卫条件在这个状态中成立，因为汽车信号灯是红灯，并且没有待处理的请求。`ToGreen` 之后，汽车信号灯变成绿灯，而行人还在通行，这就不安全了。所以 `safe` **不是归纳的**：从一个安全的状态走一步，可能到达一个不安全的状态。

你可以直接让 Isabelle 找出这样的一步。下面的引理说，从任何状态出发（无论它是否可达），每个事件都保持 `safe`。用 Quickcheck 来检验它：

```isabelle
lemma "safe s ⟹ guard e s ⟹ safe (effect e s)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  s = ⦇cars = Red, peds = Walk, req = False⦈
  e = ToGreen
```

像这样破坏归纳步骤的一个状态和一个事件，称为一个**归纳反例**（counterexample to induction）。Isabelle 并不知道这个状态能否出现。有两种可能，它们需要不同的处理：

1. 这个状态是**可达的**。那么有某次运行到达它，接下来的 `ToGreen` 就会导致不安全，设计是错的。第 13.6 节展示的就是这种情况。
2. 这个状态是**不可达的**。那么设计很可能是安全的，但 `safe` 太弱，撑不起归纳：它允许一些永远不会出现的状态，而归纳步骤在其中一个状态上失败了。

Quickcheck 回答不了这个问题。它通过运行陈述中的定义来检验陈述，而像 `reach` 这样的归纳定义不是它能运行的函数（模块 11），所以 Isabelle 报告“No code equations for reach”（reach 没有代码等式）：

```isabelle fails
lemma "reach s ⟹ safe s"
  quickcheck
  oops
```

```output
*** No code equations for reach,
*** requested by dependencies
***
```

Nitpick（模块 9）的工作方式不同：它为这些定义搜索模型，而且能处理归纳定义。让它在可达状态中搜索一个不安全的状态：

```isabelle
lemma "reach s ⟹ safe s"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found no counterexample
```

Nitpick 没有找到破坏 `safe` 的可达状态。这不是证明，但它指向第二种可能。在纸上弄清楚，为什么目标中的那个状态不可达。行人只能通过 `StartWalk` 开始通行，而它的守卫条件需要一个请求。行人通行期间，请求一直保持设置，因为只有 `EndWalk` 会清除请求，而 `EndWalk` 同时也结束了通行。所以在每个可达状态中：**如果行人在通行，那么有一个待处理的请求**。目标中的状态恰恰违反了这一点。

### 加强不变式 {#strengthen-invar}

把缺少的事实加到你要证明的性质里。新的不变式说：只有当汽车信号灯是红灯，**并且**有待处理的请求时，行人才会通行：

```isabelle
definition invar :: "crossing ⇒ bool" where
  "invar s ⟷ (peds s = Walk ⟶ cars s = Red ∧ req s)"

lemma reach_invar: "reach s ⟹ invar s"
proof (induction rule: reach.induct)
  case init
  show ?case by (simp add: invar_def start_def)
next
  case (step s e)
  then show ?case by (cases e) (auto simp: invar_def)
qed
```

证明和前面一样，这一次却成功了。在纸上检查那个关键的事件：在满足 `invar` 的状态中，`ToGreen` 的守卫条件说没有待处理的请求，所以由 `invar`，行人没有在通行，把汽车信号灯变成绿灯是安全的。其他事件也保持 `invar`：`Press` 只是设置请求；`StartWalk` 需要红灯和请求，并且两者都保持不变；`EndWalk` 结束通行；`ToAmber` 和 `ToRed` 只在汽车信号灯不是红灯时发生，所以由 `invar`，行人没有在通行。安全性随即可得，因为 `invar` 说的比 `safe` 更多：

```isabelle
theorem crossing_safe: "reach s ⟹ safe s"
  using reach_invar by (simp add: invar_def safe_def)
```

人行横道有 $3 \times 2 \times 2 = 12$ 个状态，少到可以全部画出来。图 13.2 展示了这三个状态集合之间的关系。

::: figure id=fig-13-2
人行横道的 12 个状态。6 个可达状态（粗框是 `start`）位于满足 `invar` 的 7 个状态之内，而这 7 个状态又位于满足 `safe` 的 8 个状态之内。没有哪一步会离开 `invar`。唯一一个满足 `safe` 但不满足 `invar` 的状态（汽车红灯、行人在通行、没有请求）经事件 `ToGreen` 会离开 `safe`。
:::

::: keyidea
要证明每个可达状态都是安全的，就在两者之间找一个**归纳不变式**（inductive invariant）：一个状态集合，它包含初始状态，没有哪一步会离开它，并且它只包含安全的状态。可达状态本身就构成这样一个集合，但你很少能给出对它们的描述。安全性质本身往往太大，因为它包含一些不可达的状态，从这些状态走一步就会离开它。**加强**（strengthen）不变式，就是不断添加在每个可达状态中都成立的事实来缩小它，直到没有哪一步能离开它。
:::

当不变式证明失败时，剩下的目标会告诉你要添加什么。它描述的是一个满足你的不变式、却不可达的状态（如果设计是正确的）。找出一个关于可达状态、而这个状态恰好违反的事实，用 ∧ 把它加到不变式中，然后再试一次。更大的系统可能需要好几轮；每一轮都会去掉上一次失败所暴露出来的那些不可达状态。

::: pitfall
- **加入一个假的事实。** 在某个可达状态中不成立的事实，不可能是不变式的一部分：无论你再加多少轮，基础情形或归纳步骤总会失败。先检验一下候选的不变式：对 `reach s ⟹ invar s` 运行 `nitpick`，应当找不到反例。一个为真、但和其余部分合在一起时不被保持的事实，同样会使归纳步骤失败；这时你还需要再加一轮。
- **换用更强的证明方法。** 只由 `safe s` 和守卫条件，任何方法都证明不了 `safe` 的那个失败的归纳步骤：正如 Quickcheck 所表明的，这个断言是假的。归纳步骤还有前提 `reach s`，但要用上它，就需要一个关于所有可达状态的事实，而这正是你在寻找的不变式。归纳步骤失败，需要的是更强的不变式，而不是更多的自动化。
:::

## 反例轨迹 {#traces}

并不是每次证明失败都是因为不变式太弱。有时候是设计错了，这时你会想看看它是怎样出错的。

假设一位同事提议做一处修改：行人一开始通行，请求就已经得到了处理，所以应该由 `StartWalk` 清除请求，而 `EndWalk` 不必再清除。只有两个效果发生了变化：

```isabelle
fun effect_early :: "event ⇒ crossing ⇒ crossing" where
  "effect_early StartWalk s = s⦇peds := Walk, req := False⦈"
| "effect_early EndWalk s = s⦇peds := DontWalk⦈"
| "effect_early e s = effect e s"
```

`fun` 按顺序读取相互重叠的等式，所以最后一个等式涵盖了其余四个事件：对这些事件，`effect_early` 和 `effect` 做的事情一样。像前面那样定义新设计的可达状态：

```isabelle
inductive reach_early :: "crossing ⇒ bool" where
  "reach_early start"
| "reach_early s ⟹ guard e s ⟹ reach_early (effect_early e s)"
```

把第 13.5 节中失败的那个证明用在 `reach_early` 上，它会停在同一个关于 `ToGreen` 的目标上。这一次，Nitpick 找到了一个不安全的可达状态：

```isabelle
lemma "reach_early s ⟹ safe s"
  nitpick [card = 6]
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variable:
    s = ⦇cars = Green, peds = Walk, req = False⦈
```

汽车信号灯是绿灯，而行人在通行。选项 `card = 6` 固定了 Nitpick 所尝试的模型的大小：对于每个需要由它来选定大小的类型（例如状态和事件列表），都取六个值。在这里六个就够了，而且大小固定后，Nitpick 每次报告的反例都相同。不加这个选项时，它会依次尝试 1 到 10 的大小，而它报告的是哪一个反例，每次运行都可能不同。

Nitpick 给出了坏状态，却没有说明怎样到达那里。要看到这次运行，就改为搜索一个事件列表。像定义 `run` 那样定义 `run_early`，只是换用新的效果，然后问：新设计的每一次运行是否都结束在安全的状态？

```isabelle
fun run_early :: "event list ⇒ crossing ⇒ crossing" where
  "run_early [] s = s"
| "run_early (e # es) s =
     run_early es (if guard e s then effect_early e s else s)"

lemma "safe (run_early es start)"
  nitpick [card = 6]
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variable:
    es = [Press, ToAmber, ToRed, StartWalk, ToGreen]
```

这就是一条**反例轨迹**（counterexample trace）：从 `start` 到一个不安全状态的五个事件。用 `value` 重放它，就能看到途中的每一个状态。`take n es` 是 `es` 的前 `n` 个事件，所以下面的列表依次是经过 0、1、……、5 个事件之后的状态：

```isabelle
value "map (λn. run_early (take n [Press, ToAmber, ToRed, StartWalk, ToGreen]) start)
         [0..<6]"
```

```output
"[⦇cars = Green, peds = DontWalk, req = False⦈,
  ⦇cars = Green, peds = DontWalk, req = True⦈,
  ⦇cars = Amber, peds = DontWalk, req = True⦈,
  ⦇cars = Red, peds = DontWalk, req = True⦈,
  ⦇cars = Red, peds = Walk, req = False⦈,
  ⦇cars = Green, peds = Walk, req = False⦈]"
  :: "crossing list"
```

把它当作一个故事来讲：有人按下按钮；汽车信号灯变成黄灯，再变成红灯；行人信号灯显示通行，并且在新设计中，请求被清除了；控制器看到没有请求，就把汽车信号灯变成绿灯，而这时行人还在马路上。

| 经过 | 事件 | cars | peds | req |
|---|---|---|---|---|
| 0 个事件 | | Green | DontWalk | False |
| 1 | Press | Green | DontWalk | True |
| 2 | ToAmber | Amber | DontWalk | True |
| 3 | ToRed | Red | DontWalk | True |
| 4 | StartWalk | Red | Walk | False |
| 5 | ToGreen | Green | Walk | False |

把 4 个事件之后的状态与第 13.5 节失败证明中的目标比较一下：汽车红灯，行人在通行，没有请求。在第 13.4 节的设计中，这个状态不可达，补救的办法是更强的不变式。在新设计中，它是可达的，补救的办法是修正设计：要么像第 13.4 节的设计那样，把请求保留到通行结束；要么在 `ToGreen` 的守卫条件中加上 `peds s = DontWalk`，让控制器自己检查行人信号灯（练习 13.6 要你证明这个修正是有效的）。

::: keyidea
当不变式证明的归纳步骤失败时，目标描述的是一个状态和一个事件。弄清楚这个状态是否可达。如果可达，你要证明的性质就在某个可达状态中不成立；当这个性质就是你的安全性质时，设计就是错的：用 Nitpick，或者在可执行的模型上用 Quickcheck 搜索一条轨迹，然后修正设计。如果不可达，设计可能是正确的，只是不变式太弱：加强它。
:::

::: tip
Quickcheck 和 Nitpick 的搜索方式不同。Quickcheck 在许多较小的值上运行定义，所以它需要能执行的函数，例如 `guard`、`effect_early` 和 `run_early`。Nitpick 把问题转换成一个 SAT 问题，这也涵盖了像 `reach` 这样的归纳定义。Quickcheck 的穷举搜索先尝试较小的值，并且很早就会停止（默认在大小 5 处停止）。对 `safe (run_early es start)`，它什么也找不到，因为最短的坏运行有五个事件，而它的搜索走不到那么远。把运行的长度固定下来，每个事件用一个变量，它立刻就能找到这条轨迹：

```isabelle
lemma "safe (run_early [e1, e2, e3, e4, e5] start)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  e1 = Press
  e2 = ToAmber
  e3 = ToRed
  e4 = StartWalk
  e5 = ToGreen
```

Isabelle/jEdit 会自动对每条新引理运行 Quickcheck，但不会运行 Nitpick：`nitpick` 要你自己调用。
:::

## 精化：从抽象到具体 {#refinement}

第 13.4 节的人行横道模型中没有时间。真实的控制器会让黄灯亮几秒钟，给行人一段最短的过街时间，并且在响应下一个请求之前，给汽车一段最短的绿灯时间。你可以在模型中加入一个计时器，再用一个新的不变式把安全性重新证明一遍。还有更好的办法：证明带计时器的控制器**精化**（refine）了人行横道模型，让安全性定理直接沿用过来。

### 同一系统的两个模型 {#two-models}

带计时器的控制器有人行横道模型中的那些信号灯，外加一个计时器，它倒数当前阶段还要持续的节拍（tick）数。只有在计时器归零时，信号灯才可以变化，而每次变化都会把计时器设为新阶段的长度。按钮在任何时候都可以按下。

```isabelle
record timed =
  lights :: crossing
  timer :: nat

fun delay :: "event ⇒ nat" where
  "delay ToAmber = 3"
| "delay ToRed = 2"
| "delay StartWalk = 6"
| "delay EndWalk = 2"
| "delay ToGreen = 10"
| "delay Press = 0"

inductive tstep :: "timed ⇒ timed ⇒ bool" where
  tick:   "timer c > 0 ⟹ tstep c (c⦇timer := timer c - 1⦈)"
| press:  "tstep c (c⦇lights := effect Press (lights c)⦈)"
| switch: "e ≠ Press ⟹ timer c = 0 ⟹ guard e (lights c) ⟹
             tstep c ⦇lights = effect e (lights c), timer = delay e⦈"

inductive treach :: "timed ⇒ bool" where
  init: "treach ⦇lights = start, timer = 0⦈"
| step: "treach c ⟹ tstep c c' ⟹ treach c'"
```

黄灯持续 3 个节拍，行人有 6 个节拍，绿灯至少持续 10 个节拍。按按钮不会开始一个新阶段，所以 `delay Press` 的值从来不会被用到。事件 `tick` 是新增的：它改变计时器，而不动信号灯。人行横道模型的其他事件仍然存在，只是守卫条件更强了：计时器必须已经归零。

这两个模型以两种详细程度描述同一个人行横道。人行横道模型是**抽象**（abstract）模型，带计时器的控制器是**具体**（concrete）模型。两者通过一个**抽象函数**（abstraction function）联系起来：字段选择函数 `lights` 忘掉计时器，从而把一个具体状态映射到它所表示的抽象状态。在模块 12 中，抽象函数把一个数据结构映射到它所表示的值。这里，它把一台状态机的状态映射到另一台状态机的状态。

::: definition 精化
设 $\alpha$ 把具体状态机 $C$ 的状态映射到抽象状态机 $A$ 的状态。如果下面两条成立，就说 $C$（以 $\alpha$ 为抽象函数）**精化**了 $A$：

1. $\alpha$ 把 $C$ 的每个初始状态映射到 $A$ 的一个初始状态；
2. 对于 $C$ 的每一步 $c \to c'$，要么 $\alpha\ c \to \alpha\ c'$ 是 $A$ 的一步，要么 $\alpha\ c' = \alpha\ c$。第二种步称为**停顿步**（stutter step）：抽象状态没有变化。
:::

正是停顿步让具体模型可以比抽象模型走更多的步。带计时器的控制器的每个 `tick` 都是停顿步：计时器变了，信号灯没有变。图 13.3 展示了带计时器的控制器的一次运行，以及它所表示的人行横道模型的运行。

::: figure id=fig-13-3
带计时器的控制器的一次运行（下）及其在 `lights` 下的像（上）。三次 tick 只改变计时器，所以它们是停顿步；其余每一步都是人行横道模型的一步。
:::

### 证明 {#refinement-proof}

初始状态是对应的：`lights ⦇lights = start, timer = 0⦈` 就是 `start`。对于各步，要证明每个具体的步要么是停顿步，要么是人行横道模型的一步。在 Isar 中，`proof cases` 用规则反演把这一步拆开，`tstep` 的每条规则对应一种情形：

```isabelle
lemma sim:
  assumes "tstep c c'"
  shows "lights c' = lights c ∨
         (∃e. guard e (lights c) ∧ lights c' = effect e (lights c))"
  using assms
proof cases
  case tick
  then show ?thesis by simp
next
  case press
  then have "guard Press (lights c) ∧ lights c' = effect Press (lights c)" by simp
  then show ?thesis by blast
next
  case (switch e)
  then show ?thesis by auto
qed
```

情形 `tick` 是停顿步。情形 `press` 是抽象事件 `Press`：`have` 陈述了用 `Press` 代替 `e` 的那一步，然后 `blast` 以 `Press` 作为 `∃e` 的见证（witness）证明这个析取式。情形 `switch` 是抽象事件 `e`，它的抽象守卫条件成立，因为这个守卫条件是具体守卫条件的一部分。

现在来看一般性的论证：每个可达的具体状态都表示一个可达的抽象状态。这是一个对 `treach` 的规则归纳，它只用到定义中的两个条件：初始状态相对应，以及 `sim`。

```isabelle
lemma treach_reach: "treach c ⟹ reach (lights c)"
proof (induction rule: treach.induct)
  case init
  show ?case by (simp add: reach.init)
next
  case (step c c')
  from ‹tstep c c'› have "lights c' = lights c ∨
      (∃e. guard e (lights c) ∧ lights c' = effect e (lights c))"
    by (rule sim)
  with step.IH show ?case by (auto intro: reach.step)
qed
```

在归纳步骤中，停顿步到达的是同一个抽象状态，由归纳假设，它是可达的；其他任何一步都是人行横道模型从一个可达状态出发的一步，由 `reach.step` 处理。现在，带计时器的控制器的安全性只需一行：

```isabelle
theorem timed_safe: "treach c ⟹ safe (lights c)"
  using treach_reach crossing_safe by blast
```

不需要新的不变式。带计时器的控制器比人行横道模型的状态多（计时器的每一个值都带来不同的状态），但它的证明只需检查它的每一步都是人行横道模型所允许的。

::: fact 精化保持不变式
如果 $C$ 以抽象函数 $\alpha$ 精化了 $A$，那么 $\alpha$ 把 $C$ 的每个可达状态都映射到 $A$ 的一个可达状态。所以对于 $A$ 的每个不变式 $I$，性质“$I(\alpha\ c)$”都是 $C$ 的不变式。
:::

这就是**基于精化的开发**（refinement-based development）背后的思想。例如 B 方法就采用了这种思想（巴黎地铁 14 号线的软件就是用它开发的，见模块 1），它的后继者 Event-B 也是如此。你从一个抽象模型开始，在其中，重要的性质很容易陈述和证明。然后你一小步一小步地加入细节，例如计时器、按钮、消息和数据结构，并证明每一步都是一次精化。在最顶层证明的安全性质，会一直保持到最底层。

::: note
抽象函数只是一种特殊情况。一般来说，一个具体状态可能对应几个抽象状态。这时，用具体状态和抽象状态之间的一个**模拟关系**（simulation relation）$R$ 来代替 $\alpha$：每个初始的具体状态都与某个初始的抽象状态相关；并且只要 $R\ c\ a$ 且 $c \to c'$，就存在一个 $a'$，使得 $R\ c'\ a'$，并且 $a$ 经过零步或一步可以到达 $a'$。证明的形状是一样的。
:::

::: pitfall
方向很重要。定义说的是：每个具体的步都是抽象模型所允许的；正因为如此，安全性质才能从抽象模型沿用到具体模型。它并没有说具体模型能做抽象模型能做的一切。具体模型可能做得**更少**：带计时器的控制器在计时器运行期间从不改变信号灯，而人行横道模型是允许这样做的。第 13.8 节会说明，正因为如此，精化不能保持什么。
:::

## 安全性之外，以及接下来学什么 {#next}

### 活性 {#liveness}

需求 R2 说：按下按钮之后，行人**最终**能够通行。它说的不是坏状态。

::: definition 活性性质
**活性性质**（liveness property）说的是：好事最终会发生。例如请求最终会得到处理，消息最终会送达，程序最终会终止。
:::

任何有限的运行都不能破坏活性性质，因为那件好事可能还会在以后发生。反例是一次那件好事永远不会发生的无限运行，通常是一个永远重复下去的循环。人行横道模型就有这样的运行：一次又一次地按按钮，永远如此，其他事情一件也不发生。这次运行中的每个状态都是可达的、安全的，而行人永远不能通行。要排除这样的运行，模型需要一个**公平性**（fairness）假设，例如“守卫条件一直为真的事件最终会被执行”。这样，活性的证明就可以使用一个不断减小、直到好事发生为止的度量，就像模块 5 中的终止性度量那样。莱斯利·兰伯特（Leslie Lamport）在 1977 年为这两类性质引入了“安全性”（safety）和“活性”（liveness）这两个名称。

不变式无法表达活性性质，因为它每次只谈论一个状态。而且第 13.7 节定义的精化也不保持活性：一个无论发生什么都从不改变信号灯的控制器同样精化了人行横道模型，因为它的所有步都是按按钮和停顿步（练习 13.9）。它绝对安全，也绝对没用。精化方法会为活性增加证明义务（proof obligation）。例如，Event-B 可以要求你证明像 `tick` 这样的新事件不能永远运行下去，所用的是一个这些事件每次都会使之减小的度量，这里就是计时器；这就排除了只会 tick 的控制器。像 R2 这样的需求仍然需要单独的证明。

活性是**时序逻辑**（temporal logic）的主场，阿米尔·伯努利（Amir Pnueli）在 1977 年提出把它用于程序。它的算子谈论的是运行：□ *P*（“总是 *P*”）和 ◇ *P*（“最终 *P*”）。需求 R2 变成 □(*req* ⟶ ◇ *Walk*)：在一次运行的每一个时刻，如果有待处理的请求，那么行人在这一时刻或之后的某个时刻会通行。**模型检测器**能在有限模型上自动检查这样的公式，并在公式不成立时打印出一次反例运行：**SPIN** 检查用它自己的语言 Promela 写的模型，**nuXmv** 检查用 SMV 语言写的模型，**TLC** 检查用兰伯特的 **TLA+** 写的规约，亚马逊的工程师用的就是 TLA+（模块 1）。Isabelle 也能证明活性，但那需要的工具超出了本系列的范围。

### 接下来学什么 {#further}

- **Isabelle 模型验证。** 本站的单页指南 [Isabelle 模型验证](../isabelle/)（英文）把这些思想用在一个关于盖子的小模型上：一个表示状态的记录，一个允许某个操作的守卫条件，一条说明该操作保持状态不变式的引理，以及一个证明，说明两种表示之间的转换保持含义。它的守卫条件和更新构成第 13.4 节意义上的一个事件，它的引理就是不变式证明（第 13.3 节）中的归纳步骤；而那个关于转换的定理，与模块 14 为编译器证明的定理属于同一类。这份指南是为 Isabelle2025-2 编写的。
- **形式化证明档案库**（Archive of Formal Proofs）是一个大型在线库，收录了经过检查的 Isabelle 项目，其中包括协议、算法和系统的模型，以及它们的不变式和精化。
- **Event-B** 及其工具 Rodin 平台都是围绕精化构建的：抽象机、带守卫条件和动作的事件、不变式，以及精化证明，这些证明大多由自动证明器完成。
- TLC、SPIN 和 nuXmv 这样的**模型检测器**能自动探索有限模型，也能处理活性。要在设计中找出反例轨迹，它们是最快的途径；而证明能覆盖有限模型覆盖不了的东西。

模块 14 将用另一种系统为本系列收尾：一个经过证明的、正确的编译器。

## 小结 {#summary}

- **状态机**有状态、初始状态和迁移关系。它的每一步由**事件**给出，每个事件都有一个**守卫条件**（它什么时候可以发生）和一个**效果**（它怎样改变状态）。**运行**从一个初始状态出发，沿着这些步前进；**轨迹**列出运行中的事件；如果某次运行到达一个状态，这个状态就是**可达的**。
- 在 Isabelle 中，状态是一个数据类型、一个有序对或一个**记录**（字段 `cars s`，值 `⦇cars = …, …⦈`，更新 `s⦇cars := …⦈`）。迁移关系可以是每个事件一条规则的 `inductive` 定义，也可以是一对函数 `guard` 和 `effect`，后者可以用 `value` 运行。可达状态是一个归纳定义，一条规则针对初始状态，一条规则针对一步，它与从初始状态出发的自反传递闭包 `r⇧*` 是一回事。
- **安全性质**必须在每个可达状态中都成立。**不变式**在每个可达状态中都成立；如果它在初始时成立，并且被每一步保持，它就是**归纳的**。对可达状态做规则归纳，可以证明一个归纳不变式：一个基础情形和一个归纳步骤。
- 安全性质往往不是归纳的。失败的归纳步骤会给出一个状态和一个事件，即一个**归纳反例**。如果这个状态不可达，就用一个在每个可达状态中都成立的事实**加强**不变式。如果它可达，设计就是错的。
- Nitpick 能找到可达的坏状态，对归纳定义也一样；借助可执行的 `run`，它还能找到**反例轨迹**，即通向坏状态的事件列表。`value` 可以重放它们。固定选项 `card`，可以让 Nitpick 每次都报告同一个反例。
- 如果一个**抽象函数**把初始状态映射到初始状态，并把每个具体的步映射到一个抽象的步或一个**停顿步**，那么具体模型就**精化**了抽象模型。这时，抽象模型的每个不变式都通过抽象函数在具体模型中成立。
- **活性性质**说的是好事最终会发生。不变式和精化都覆盖不了它；时序逻辑以及 SPIN、nuXmv 和 TLC 这样的模型检测器能处理它。

## 练习 {#exercises}

:::: exercise 电梯的运行 {#ex-13-1} ★
使用例 13.1 中的电梯。

1. 在门打开、电梯静止的状态中，哪些事件可以发生？它们分别到达哪些状态？
2. 给出一条从初始状态到“门关闭、电梯移动”这个状态的轨迹，要求它经过门正在关闭的状态。
3. 为什么状态“门正在关闭，电梯移动”不可达？看一看哪些事件可能到达它。

::: solution
1. *open*（门保持打开：状态不变）、*close*（门变为 Closing，电梯静止）和 *stop*（状态不变）。*shut* 需要正在关闭的门，*start* 需要关闭的门。
2. *open, close, shut, start*：(Closed, 静止) → (Open, 静止) → (Closing, 静止) → (Closed, 静止) → (Closed, 移动)。
3. 只有 *close* 会得到正在关闭的门，而它不改变电梯是否移动，所以之前的状态必须是“门打开，电梯移动”。没有任何事件能到达那个状态：*open* 要求电梯静止，并让它保持静止；*start* 要求门是关闭的；而 *close*、*shut* 和 *stop* 都不会得到门打开、电梯移动的状态。所以两个不安全的状态都不可达。`lift_safe` 的证明一次性地对每个状态做了这个论证。
:::
::::

:::: exercise 安全性还是活性？ {#ex-13-2} ★
说明下面每条需求是安全性质还是活性性质。

1. 两列火车永远不会在同一段轨道上。
2. 每个打印任务最终都会被打印出来。
3. 账户余额永远不会变成负数。
4. 发出的消息最终会送达。
5. 程序永远不会除以零。
6. 程序会终止。

::: solution
1. 安全性质：坏状态是两列火车在同一段轨道上，一次有限的运行就可以到达它。
2. 活性性质：某件好事（打印出来）必须最终发生；反例是一次这个任务永远没有被打印的无限运行。
3. 安全性质。
4. 活性性质。
5. 安全性质：坏事是除以零，而一次执行了除以零的有限运行就是反例。
6. 活性性质：终止说的是程序最终会停下来。没有哪次有限的运行能表明程序永远不停；反例是一次无限运行。
:::
::::

:::: exercise 预测一次运行 {#ex-13-3} ★
在纸上逐个事件地算出 `run [Press, Press, ToAmber, ToGreen, ToRed] start` 的结果。然后用 `value` 检验。

::: solution
`Press` 设置请求。第二个 `Press` 什么也不改变，因为请求已经设置了。`ToAmber` 可以发生（绿灯，有请求），它把汽车信号灯变成黄灯。`ToGreen` 需要红灯，所以 `run` 跳过它。`ToRed` 把汽车信号灯变成红灯。行人一直没有通行，请求仍在等待处理：

```isabelle
value "run [Press, Press, ToAmber, ToGreen, ToRed] start"
```

```output
"⦇cars = Red, peds = DontWalk, req = True⦈"
  :: "crossing"
```
:::
::::

:::: exercise 不变式、归纳不变式，还是都不是？ {#ex-13-4} ★★
对第 13.4 节的人行横道模型，判断下面每个性质是否在每个可达状态中都成立，以及它单独来看是不是归纳的。可达状态见图 13.1。如果一个性质不是归纳的，给出破坏归纳步骤的一个状态和一个事件；如果它不是不变式，给出一次破坏它的运行。

1. `peds s = Walk ⟶ req s`
2. `cars s = Amber ⟶ req s`
3. `peds s = DontWalk`
4. `cars s = Amber ⟶ peds s = DontWalk`

::: solution
1. **是不变式，也是归纳的。** 只有 `StartWalk` 会让行人通行，而它的守卫条件需要请求。行人通行期间，只有 `EndWalk` 会清除请求，而它同时结束了通行。除了设置请求的 `Press` 之外，没有别的事件会改变涉及的这两个字段。（这正是第 13.5 节加到 `safe` 上的那一部分。）
2. **是不变式，但不是归纳的。** 唯一一个黄灯的可达状态有请求。但是取不可达的状态 ⦇cars = Amber, peds = Walk, req = True⦈：它满足这个性质，而 `EndWalk` 会清除请求，同时保持黄灯不变。练习 13.7 证明了这个不变式。
3. **不是不变式**，所以也不是归纳的。运行 *Press, ToAmber, ToRed, StartWalk* 会到达一个行人在通行的状态。
4. **是不变式，但不是归纳的。** 在可达状态中，黄灯只与“禁止通行”同时出现。但不可达的状态 ⦇cars = Green, peds = Walk, req = True⦈ 满足这个性质（汽车信号灯不是黄灯），而 `ToAmber` 会在行人通行时把汽车信号灯变成黄灯。
:::
::::

:::: exercise 运行到达的都是可达状态 {#ex-13-5} ★★
证明：`run` 从一个可达状态出发产生的每个状态都是可达的，并由此得出：对每个事件列表 `es`，`run es start` 都是可达的。在归纳中必须推广哪个变量？为什么？

::: solution
对 `es` 做归纳。在递归调用 `run es (…)` 中，状态会变化，所以归纳假设必须对每个状态都成立：用 `arbitrary:` 推广 `s`（模块 11）。

```isabelle
lemma reach_run: "reach s ⟹ reach (run es s)"
  by (induction es arbitrary: s) (auto intro: reach.step)

corollary "reach (run es start)"
  by (simp add: reach.init reach_run)
```

In the induction step, the simplifier splits the `if` in the definition of `run`. If the guard holds, the next
state is reachable by `reach.step`; if not, it is `s` itself. Together with `crossing_safe`, this shows
that no run of events leads to an unsafe state: the property that Nitpick refuted for the colleague's
design in Section 13.6 holds for the design of Section 13.4.
:::
::::

:::: exercise Fix the guard instead {#ex-13-6} ★★
Keep the colleague's effects `effect_early` from Section 13.6, but give `ToGreen` the guard
`cars s = Red ∧ peds s = DontWalk ∧ ¬ req s`. Define the new guard function `guard_safe` and the
reachable states `reach_fixed` of this design, and prove that every reachable state is safe. Do you need
to strengthen `safe`?

::: solution
Only one equation of the guard changes; as in Section 13.6, a final equation covers the other events.

```isabelle
fun guard_safe :: "event ⇒ crossing ⇒ bool" where
  "guard_safe ToGreen s = (cars s = Red ∧ peds s = DontWalk ∧ ¬ req s)"
| "guard_safe e s = guard e s"

inductive reach_fixed :: "crossing ⇒ bool" where
  init: "reach_fixed start"
| step: "reach_fixed s ⟹ guard_safe e s ⟹ reach_fixed (effect_early e s)"

lemma "reach_fixed s ⟹ safe s"
proof (induction rule: reach_fixed.induct)
  case init
  show ?case by (simp add: safe_def start_def)
next
  case (step s e)
  then show ?case by (cases e) (auto simp: safe_def)
qed
```

No strengthening is needed: `safe` is inductive in this design. The guard of `ToGreen` now checks the
pedestrian signal itself, so the step that broke the proof in Section 13.5 is no longer possible. A
guard that checks the property it protects makes the proof short; a design that relies on another
variable, as the request did, needs an invariant that relates the two.
:::
::::

:::: exercise One invariant helps another {#ex-13-7} ★★
Prove that in every reachable state of the crossing, the car light is amber only while a request is
pending: `reach s ⟹ cars s = Amber ⟶ req s`. The rule induction alone fails (Exercise 13.4). Use the
invariant `reach_invar`, which you have already proved.

::: solution
In the induction step, the premise `reach s` is available, so `reach_invar` gives `invar s` for the state
before the event. That is the missing fact: in the state where `EndWalk` clears the request, the
pedestrians walk, so by `invar` the cars have red, not amber.

```isabelle
lemma "reach s ⟹ cars s = Amber ⟶ req s"
proof (induction rule: reach.induct)
  case init
  show ?case by (simp add: start_def)
next
  case (step s e)
  moreover from ‹reach s› have "invar s" by (rule reach_invar)
  ultimately show ?case by (cases e) (auto simp: invar_def)
qed
```

Using an invariant that is already proved is often easier than putting everything into one big
invariant: each proof stays small, and later proofs can use the earlier ones.
:::
::::

:::: exercise A turnstile {#ex-13-8} ★★★
A turnstile is locked until a coin is inserted. A coin unlocks it; pushing an unlocked turnstile lets one
person through and locks it again. It counts coins and passes:

```isabelle
record gate =
  locked :: bool
  coins :: nat
  passes :: nat

inductive greach :: "gate ⇒ bool" where
  "greach ⦇locked = True, coins = 0, passes = 0⦈"
| "greach g ⟹ greach (g⦇locked := False, coins := coins g + 1⦈)"
| "greach g ⟹ ¬ locked g ⟹ greach (g⦇locked := True, passes := passes g + 1⦈)"
```

The safety property is that nobody passes without paying: `passes g ≤ coins g`. Try to prove that it
holds in every reachable state, read the goal that is left, and strengthen the invariant until the proof
works.

::: solution
The direct attempt leaves the push:

```isabelle
lemma "greach g ⟹ passes g ≤ coins g"
  apply (induction rule: greach.induct)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀g. ⟦greach g; passes g ≤ coins g; ¬ locked g⟧
        ⟹ Suc (passes g) ≤ coins g
```

```isabelle
  oops
```

The goal is the push. From `passes g ≤ coins g` and an unlocked turnstile, it must show that one more
pass still fits, `Suc (passes g) ≤ coins g`. That fails when passes and coins are equal: an unlocked
turnstile with as many passes as coins satisfies the invariant, and a push lets someone through without
paying. That state is unreachable, because a turnstile is unlocked only by a coin that has not been used
for a pass yet. Say so in the invariant: when the turnstile is unlocked, passes are strictly fewer than
coins.

```isabelle
lemma "greach g ⟹ passes g ≤ coins g ∧ (¬ locked g ⟶ passes g < coins g)"
  by (induction rule: greach.induct) auto
```

The safety property is the first half of the strengthened invariant. The second half is the fact about
reachable states that the failed goal violated.
:::
::::

:::: exercise A lazy controller {#ex-13-9} ★★★
A lazy controller accepts presses and does nothing else:

```isabelle
inductive lazy :: "crossing ⇒ bool" where
  init:  "lazy start"
| press: "lazy s ⟹ lazy (s⦇req := True⦈)"
```

1. Each step of the lazy controller is the abstract event `Press`, so it refines the crossing, with the
   identity as abstraction function. Prove what follows by Fact 13.2, `lazy s ⟹ reach s`, by rule
   induction as for `treach_reach`, and conclude that the lazy controller is safe.
2. Prove that in the lazy controller the cars always have green.
3. What do 1 and 2 say about requirement R2, and about what refinement preserves?

::: solution
1. In case `press`, the step is the abstract event `Press` from a reachable state:

   ```isabelle
   lemma lazy_reach: "lazy s ⟹ reach s"
   proof (induction rule: lazy.induct)
     case init
     show ?case by (rule reach.init)
   next
     case (press s)
     from press.IH have "reach (effect Press s)" by (rule reach.step) simp
     then show ?case by simp
   qed

   corollary "lazy s ⟹ safe s"
     by (simp add: crossing_safe lazy_reach)
   ```

   The `have` states the new state in the form that `reach.step` produces: `rule reach.step` takes the
   induction hypothesis `reach s` for its first premise and leaves the guard `guard Press s`, which
   `simp` proves. In the last step, `simp` turns `effect Press s` into `s⦇req := True⦈`.
2. The cars have green in `start`, and a press does not change the car light:

   ```isabelle
   lemma "lazy s ⟹ cars s = Green"
     by (induction rule: lazy.induct) (auto simp: start_def)
   ```

3. The lazy controller is safe, and it never lets anyone cross: after a press, the pedestrians never
   walk, so it breaks R2. Refinement preserves safety properties, but not liveness properties. A
   refinement may do less than the abstract model, including nothing at all.
:::
::::

## Check yourself {#quiz}

```quiz
? In a model of a state machine, what does the guard of an event describe?
- [ ] How the event changes the state
- [x] The states in which the event can happen
- [ ] The initial state
- [ ] The property that every reachable state must have
> The guard is a condition on the current state; the effect describes the change.

? A property I holds in the initial state and in every reachable state. What else must hold for I to be inductive?
- [ ] I must hold in every state, reachable or not
- [ ] Every run must be finite
- [x] Every step from any state that satisfies I must lead to a state that satisfies I
- [ ] I must be a liveness property
> An inductive invariant is preserved by every step from every state that satisfies it, including unreachable ones. That is what the induction step of the rule induction checks.

? The induction step of an invariant proof fails, and the goal describes a state s and an event e. What should you find out first?
- [ ] Whether a stronger proof method such as auto or force proves the goal
- [ ] Whether e is the last event of the datatype
- [ ] Whether the initial state satisfies the invariant
- [x] Whether s is reachable
> If s is reachable, the property fails in a reachable state, and a trace shows how; for a safety property, the design is wrong. If it is not, the invariant is too weak and must be strengthened.

? Why can Quickcheck test `safe (run es start)` but not `reach s ⟹ safe s`?
- [x] Quickcheck executes definitions, and an inductive predicate such as reach is not executable by default
- [ ] Quickcheck cannot handle records
- [ ] reach has too many states for Quickcheck
- [ ] Quickcheck only works on lists
> Quickcheck evaluates the statement on test values, so it needs executable functions such as run. Nitpick also handles inductive definitions.

? In a refinement proof, a concrete step changes only the timer, and the abstraction function forgets the timer. What is this step in the abstract model?
- [ ] An error: every concrete step must be an abstract step
- [ ] A new abstract event that must be added to the abstract model
- [x] A stutter step: the abstract state does not change
- [ ] A liveness violation
> Refinement allows stutter steps, which is why a concrete model can take more steps than the abstract one.

? Which requirement is a liveness property?
- [ ] The cars never have green while pedestrians walk
- [ ] The lift never moves with its door open
- [ ] The balance of an account never becomes negative
- [x] After a press, the pedestrians eventually get to walk
> "Eventually" makes it a liveness property: no finite run can break it, and invariants and refinement do not cover it.
```
