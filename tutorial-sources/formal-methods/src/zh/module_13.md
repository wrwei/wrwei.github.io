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

Rule `init` makes the initial state reachable. Rule `step` says that one step from a reachable state
leads to a reachable state. Nothing else is reachable, because an inductive definition defines the
smallest predicate closed under its rules (Module 11). A run is a derivation with these rules. Here is
the run to `(Closing, False)`, step by step, in Isar (Module 10):

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

Each `lstep` fact is one event of the run, proved with its rule: `rule open_door` leaves the guard
`¬ False` to prove, which `simp` does. Each `ultimately` adds the step to the run with rule
`lreach.step`.

To prove something about *every* reachable state, you need the induction rule of `lreach`:

```isabelle
thm lreach.induct
```

```output result
⟦lreach ?x; ?P (Closed, False); ⋀s t. ⟦lreach s; ?P s; lstep s t⟧ ⟹ ?P t⟧
⟹ ?P ?x
```

Read it as the invariant method of Module 5. To prove that a property `?P` holds in every reachable
state `?x`, prove that it holds in the initial state, and that one step from a reachable state with
`?P` leads to a state with `?P`. Section 13.3 uses this rule.

### Reachability is a closure {#closure}

In Module 4 you met the reflexive–transitive closure `r⇧*` of a relation `r`: the pairs `(a, b)` such
that `b` can be reached from `a` in zero or more steps of `r`. The reachable states of the lift are the
states `s` with `((Closed, False), s)` in the closure of the step relation. Isabelle proves that the two
definitions agree:

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

`{(s, t). lstep s t}` is the step relation as a set of pairs, and `⇧*` (type `^*`) is the closure. In
each half, `then` passes the assumption to the `induction` method, which then needs no arguments: it
inducts on that fact with the fact's own induction rule. The first half is a rule induction on
`lreach s`. The second is an induction on the closure, with the library's rule `rtrancl_induct`. The
library rule `rtrancl_into_rtrancl` adds one step at the end of a path, as `lreach.step` does.

You could work with `r⇧*` directly. A definition of your own, such as `lreach`, gives its induction rule
exactly the two cases of the invariant method, with names you choose, and builds the initial state into
the definition. Module 11 defined reachability with the step at the front instead (`steps`). For
invariants, the step at the end is more convenient: the induction hypothesis is then about the state
*before* the last step, exactly as in the invariant method, and the initial state stays fixed. With the
step at the front, a rule induction about the runs from one initial state meets the problem that Module
11 met with `steps move Done s`: the induction rule replaces the start of the run by a variable.

## Safety properties and invariants {#invariants}

The property you want for the lift is that it never moves unless its door is closed. Properties of this
kind have a name.

::: definition Safety property
A **safety property** says that something bad never happens. In this module the bad thing is a bad
state, so a safety property is a property of states that must hold in every reachable state. A run that
reaches a state where it fails is a **counterexample** to it.
:::

::: definition Invariant and inductive invariant
A property $I$ of states is an **invariant** of a state machine if it holds in every reachable state. It
is **inductive** if it holds in every initial state and every step from a state that satisfies $I$ leads
to a state that satisfies $I$.
:::

Module 5 called a property an invariant when it holds initially and every step preserves it, which is
the second notion. From now on the difference matters: every inductive property is an invariant, but
Section 13.5 shows an invariant that is not inductive.

::: fact Inductive invariants hold in every reachable state
If $I$ is inductive, then $I$ holds in every reachable state.
:::

The proof is a rule induction over reachability: $I$ holds in the initial state, and the rule for a step
passes $I$ from a reachable state to the next one. In Isabelle, write the safety property of the lift
as a function of the state, and start the rule induction:

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

Subgoal 1 is the base case: the initial state is safe. Subgoal 2 is the induction step: for a
reachable state `s` that is safe and a step from `s` to `t`, the state `t` is safe. Both follow from the
rules of `lstep`:

```isabelle
  apply (auto elim: lstep.cases)
  done
```

`lstep.cases` is rule inversion (Module 11): from `lstep s t` it produces one case for each rule, with
`s` and `t` replaced by the states in that rule and the guard as an assumption. In four of the five cases
the new state is safe whatever the old state was: *open* needs a lift that stands still and keeps it
still, *start* needs a closed door, and *shut* and *stop* lead to a closed door or a still lift. In the
case *close*, the induction hypothesis matters. The door was open, so by `lift_ok s` the lift did not
move, and the new state `(Closing, False)` is safe. That is why an invariant proof needs the induction
hypothesis: an event that leaves part of the state alone relies on that part being safe already.

The theorem answers the question of Section 13.1:

```isabelle
corollary "¬ lreach (Open, True)"
  using lift_safe by force
```

Isabelle treats `corollary` and `theorem` exactly as it treats `lemma`. The words tell the reader what
role a result plays: a theorem is a main result, and a corollary follows directly from one.

::: pitfall
State the property for a state variable, not for a pattern. This version looks the same, but fails:

```isabelle fails
lemma "lreach (d, m) ⟹ m ⟶ d = Closed"
  by (induction rule: lreach.induct) (auto elim: lstep.cases)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. m ⟹ d = Closed
```

The goal left over is false: it claims that for the `d` and `m` of the lemma, a moving lift has a
closed door. The argument of `lreach` is the pair `(d, m)`, not a variable, and the induction rule is
about a variable state `?x`. Given a pattern, the method does not replace `d` and `m` by the states of
the rules; they stay as they are, so the base case asks for the claim about `d` and `m` instead of
about `(Closed, False)`. Module 11 met the same problem with a constant. Write the property as a
function of the whole state, as `lift_ok` does, and the induction works.
:::

## Modelling a pedestrian crossing {#crossing}

The rest of the module works with one larger system: a pedestrian crossing with a push button. Cars see a
traffic light (green, amber, red); pedestrians see a signal (walk or don't walk). The controller should
meet these requirements:

- **R1.** Pedestrians may walk only when the cars have red.
- **R2.** After someone presses the button, the pedestrians eventually get to walk.

R1 is a safety property, and Sections 13.5 to 13.7 prove it. R2 is of another kind, which Section 13.8
discusses.

### States as records {#records}

The state has three parts: the car light, the pedestrian signal, and whether a request is pending (the
button was pressed and the pedestrians have not walked yet). A pair would do for two parts. For three or
more, give the parts names with a **record**: a tuple whose components, its **fields**, have names.

```isabelle
datatype light = Green | Amber | Red
datatype signal = Walk | DontWalk

record crossing =
  cars :: light
  peds :: signal
  req  :: bool
```

The record command defines the type `crossing` and, for each field, a function that selects it: if `s`
is a crossing, `cars s` is its car light. A record value lists its fields in brackets, as in
`⦇cars = Green, peds = DontWalk, req = False⦈`; type `⦇` as `(|` and `⦈` as `|)`. The notation
`s⦇cars := Amber⦈` is the **update** of a field: the crossing `s` with its car light changed to amber and
the other fields unchanged. The simplifier knows how selectors and updates interact, so that it rewrites
`cars (s⦇req := True⦈)` to `cars s` by itself.

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
An update needs `:=`. With `=`, Isabelle reads `⦇cars = Amber⦈` as a record value, which must list
every field of the record, in the order of the `record` command:

```isabelle fails
value "start⦇cars = Amber⦈"
```

```output
*** exception TERM raised⌂:
***   Error in record input: expecting more fields
***   ??.cars = Amber::<position>
```

The message says that the record value lacks fields; `??.cars = Amber` is the field that Isabelle
read, in its internal form. Write `start⦇cars := Amber⦈`.
:::

### Events with guards and effects {#events}

The controller reacts to six events. The button press comes from outside; the other five are the
controller's own decisions.

| Event | Guard | Effect |
|---|---|---|
| Press | always | the request is set |
| ToAmber | cars have green and a request is pending | cars get amber |
| ToRed | cars have amber | cars get red |
| StartWalk | cars have red, pedestrians don't walk, a request is pending | pedestrians walk |
| EndWalk | pedestrians walk | pedestrians stop; the request is cleared |
| ToGreen | cars have red and no request is pending | cars get green |

Notice how the design uses the request. It stays set until the walk has ended, and the cars get green
only when no request is pending. For the lift, each event was a rule of an inductive definition. This
time, write the guards and the effects as two functions. Functions can be computed with `value`, so you
can run the model, which will matter when you look for bugs in Section 13.6.

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

The transition relation of the crossing is: $s \to t$ when $t$ = `effect e s` for some event `e` whose
guard holds in $s$. To run the model, apply a list of events in order. An event whose guard is false
cannot happen, and `run` skips it:

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

A pedestrian pressed the button, the car light went through amber to red, and the pedestrians walk. Now
the same events without the press:

```isabelle
value "run [ToAmber, ToRed, StartWalk] start"
```

```output
"⦇cars = Green, peds = DontWalk, req = False⦈"
  :: "crossing"
```

Nothing happened. Without a request the guard of `ToAmber` is false, and while the car light is green,
the guards of `ToRed` and `StartWalk` are false too, so `run` skips all three events. Figure 13.1 shows
every state that runs can reach.

::: figure id=fig-13-1
The reachable states of the crossing and the events between them. In each box, the small light shows the
car light. The thick box is the initial state `start`.
:::

The reachable states are defined as for the lift, with a rule for the initial state and a rule for one
event:

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

The induction rule has the same two cases as before. In the induction step, the event `e` is arbitrary: a
proof must deal with every event whose guard holds in a reachable state.

## When an invariant is not inductive {#strengthen}

Requirement R1 says: if the pedestrians walk, the cars have red.

```isabelle
definition safe :: "crossing ⇒ bool" where
  "safe s ⟷ (peds s = Walk ⟶ cars s = Red)"
```

### The proof that fails {#fails}

Try the proof of the lift. In Isar, with one case for the initial state and one for an event, and
`cases e` to consider every event in turn:

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

The base case went through, and so did five of the six events. The goal that is left belongs to
`ToGreen`. Read it as a state: the cars have red, no request is pending, and the pedestrians walk. The
state is safe, because the cars have red. The guard of `ToGreen` holds in it, because the cars have red
and no request is pending. After `ToGreen` the cars have green while the pedestrians walk, which is not
safe. So `safe` is *not inductive*: a step from a safe state can lead to an unsafe one.

You can ask Isabelle for such a step directly. The lemma below says that every event preserves `safe`,
from any state, reachable or not. Quickcheck tests it:

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

A state and an event that break the induction step in this way are a **counterexample to induction**. Isabelle
does not know whether this state can occur. There are two possibilities, and they call for different
actions:

1. The state is **reachable**. Then some run leads to it, the next `ToGreen` makes it unsafe, and the
   design is wrong. Section 13.6 shows this case.
2. The state is **not reachable**. Then the design may well be safe, but `safe` is too weak to carry
   the induction: it allows states that never occur, and the induction step fails on one of them.

Quickcheck cannot answer this question. It tests a statement by running the definitions in it, and an
inductive definition such as `reach` is not a function that it can run (Module 11):

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

Nitpick (Module 9) works differently: it searches for a model of the definitions, and it handles
inductive definitions. Let it search the reachable states for an unsafe one:

```isabelle
lemma "reach s ⟹ safe s"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found no counterexample
```

Nitpick finds no reachable state that breaks `safe`. That is not a proof, but it points to the second
possibility. Find out on paper why the state of the goal cannot be reached. The pedestrians start to
walk only through `StartWalk`, whose guard needs a request. While they walk, the request stays set,
since only `EndWalk` clears it, and `EndWalk` also ends the walk. So in every reachable state: *if the pedestrians walk, a
request is pending*. The state in the goal violates exactly this.

### Strengthen the invariant {#strengthen-invar}

Add the missing fact to the property you prove. The new invariant says that pedestrians walk only when
the cars have red *and* a request is pending:

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

The proof is the same as before, and this time it goes through. Check the critical event on paper: in a
state that satisfies `invar`, the guard of `ToGreen` says that no request is pending, so by `invar` the
pedestrians do not walk, and turning the cars green is safe. The other events keep `invar` too: `Press`
only sets the request; `StartWalk` needs red and a request, and keeps both; `EndWalk` ends the walk;
`ToAmber` and `ToRed` happen only when the cars do not have red, so by `invar` the pedestrians do not
walk. Safety follows at once, because `invar` says more than `safe`:

```isabelle
theorem crossing_safe: "reach s ⟹ safe s"
  using reach_invar by (simp add: invar_def safe_def)
```

The crossing has $3 \times 2 \times 2 = 12$ states, few enough to draw them all. Figure 13.2 shows how the
three sets of states fit together.

::: figure id=fig-13-2
The 12 states of the crossing. The 6 reachable states (the thick box is `start`) lie inside the 7
states that satisfy `invar`, which lie inside the 8 states that satisfy `safe`. No step leads out of
`invar`. From the one state that satisfies `safe` but not `invar` (cars red, pedestrians walking, no
request), the event `ToGreen` leads out of `safe`.
:::

::: keyidea
To prove that every reachable state is safe, find an **inductive invariant** in between: a set of
states that contains the initial state, that no step leaves, and that contains only safe states. The
reachable states themselves form such a set, but you rarely have a description of them. The safety
property itself is often too large, because it contains unreachable states from which a step leads out.
**Strengthening** the invariant shrinks it, by adding facts that hold in every reachable state, until no
step leads out.
:::

When an invariant proof fails, the goal left over tells you what to add. It describes a state that
satisfies your invariant but is not reachable (if the design is right). Find a fact about reachable
states that this state violates, add it to the invariant with ∧, and try again. A larger system may need
several rounds; each round removes the unreachable states that the last failure showed.

::: pitfall
- **Adding a fact that is false.** A fact that fails in some reachable state cannot be part of an
  invariant: the base case or the induction step fails, however many rounds you add. Test a candidate
  first: `nitpick` on `reach s ⟹ invar s` should find no counterexample. A fact that is true but not
  preserved together with the rest makes the induction step fail too; then you need another round.
- **Trying a stronger proof method.** No method can prove the failed induction step for `safe` from `safe s`
  and the guard alone: that claim is false, as Quickcheck showed. The induction step also has the premise
  `reach s`, but using it needs a fact about all reachable states, which is the invariant you are
  looking for. A failed induction step asks for a stronger invariant, not for more automation.
:::

## Counterexample traces {#traces}

Not every failed proof is a weak invariant. Sometimes the design is wrong, and then you want to see how.

Suppose a colleague proposes a change: the request has been served as soon as the pedestrians start to
walk, so `StartWalk` should clear it, and `EndWalk` need not. Only two effects change:

```isabelle
fun effect_early :: "event ⇒ crossing ⇒ crossing" where
  "effect_early StartWalk s = s⦇peds := Walk, req := False⦈"
| "effect_early EndWalk s = s⦇peds := DontWalk⦈"
| "effect_early e s = effect e s"
```

`fun` reads overlapping equations in order, so the last equation covers the four other events: for them,
`effect_early` does what `effect` does. Define the reachable states of the new design as before:

```isabelle
inductive reach_early :: "crossing ⇒ bool" where
  "reach_early start"
| "reach_early s ⟹ guard e s ⟹ reach_early (effect_early e s)"
```

The failed proof of Section 13.5, run on `reach_early`, stops at the same goal for `ToGreen`. This time
Nitpick finds a reachable state that is not safe:

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

The cars have green while the pedestrians walk. The option `card = 6` fixes the size of the models
that Nitpick tries: six values for each type whose size it has to choose, such as states and lists of
events. Six are enough here, and with one fixed size Nitpick reports the same counterexample every time.
Without the option it tries the sizes 1 to 10, and which counterexample it reports can change from run
to run.

Nitpick shows the bad state but not how to get there. To see the run, search for a list of events
instead. Define `run_early` as `run` was defined, with the new effects, and ask whether every run of the
new design ends in a safe state:

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

That is a **counterexample trace**: five events from `start` to an unsafe state. Replay it with `value`
to see every state on the way. `take n es` is the first `n` events of `es`, so the list below holds the
state after 0, 1, …, 5 events:

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

As a story: someone presses the button; the car light turns amber, then red; the pedestrian signal
shows walk and, in the new design, the request is cleared; the controller sees no request and turns the
car light green, while the pedestrians are still on the road.

| After | Event | cars | peds | req |
|---|---|---|---|---|
| 0 events | | Green | DontWalk | False |
| 1 | Press | Green | DontWalk | True |
| 2 | ToAmber | Amber | DontWalk | True |
| 3 | ToRed | Red | DontWalk | True |
| 4 | StartWalk | Red | Walk | False |
| 5 | ToGreen | Green | Walk | False |

Compare the state after 4 events with the goal of the failed proof in Section 13.5: cars red, pedestrians
walking, no request. In the design of Section 13.4 that state is unreachable, and the remedy was a
stronger invariant. In the new design it is reachable, and the remedy is to fix the design. Keep the
request until the walk ends, as the design of Section 13.4 does; or add `peds s = DontWalk` to the guard
of `ToGreen`, so that the controller checks the pedestrian signal itself (Exercise 13.6 asks you to prove
that this fix works).

::: keyidea
When the induction step of an invariant proof fails, the goal describes a state and an event. Find out whether
the state is reachable. If it is, the property you are proving fails in a reachable state; when that
property is your safety property, the design is wrong: search for a trace with Nitpick, or with
Quickcheck on an executable model, and fix the design. If it is not, the design may be right and the
invariant too weak: strengthen it.
:::

::: tip
Quickcheck and Nitpick search in different ways. Quickcheck runs the definitions on many small values,
so it needs functions it can execute, such as `guard`, `effect_early` and `run_early`. Nitpick translates
the problem into a SAT problem, which also covers inductive definitions such as `reach`. Quickcheck's
exhaustive search tries small values first and stops early (by default at size 5). On
`safe (run_early es start)` it finds nothing, because the shortest bad run has five events and its
search does not get that far. Fix the length of the run, with one variable for each event, and it finds
the trace at once:

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

Isabelle/jEdit runs Quickcheck on every new lemma by itself, but not Nitpick: call `nitpick` yourself.
:::

## Refinement: from abstract to concrete {#refinement}

The crossing of Section 13.4 has no time. A real controller keeps the amber light on for a few seconds,
gives the pedestrians a minimum time to cross, and gives the cars a minimum green time before it serves
the next request. You could add a timer to the model and prove safety again, with a new invariant. There
is a better way: show that the timed controller **refines** the crossing, and let the safety theorem
carry over.

### Two models of one system {#two-models}

The timed controller has the lights of the crossing and a timer, which counts down the ticks that the
current phase still lasts. A light may change only when the timer has run out, and a change sets the
timer to the length of the new phase. The button can be pressed at any time.

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

Amber lasts 3 ticks, the pedestrians get 6, and green lasts at least 10. A press does not start a phase,
so the value of `delay Press` is never used. The event `tick` is new: it changes the timer and leaves the
lights alone. The other events of the crossing are still there, with a stronger guard: the timer must
have run out.

The two models describe the same crossing at two levels of detail. The crossing is the **abstract**
model, the timed controller the **concrete** one. They are related by an **abstraction function**: the
field selector `lights` maps a concrete state to the abstract state it represents, by forgetting the
timer. In Module 12, an abstraction function mapped a data structure to the value it represents. Here it
maps the states of one machine to the states of another.

::: definition Refinement
Let $\alpha$ map the states of a concrete machine $C$ to the states of an abstract machine $A$. Then $C$
**refines** $A$ (with abstraction function $\alpha$) if

1. $\alpha$ maps every initial state of $C$ to an initial state of $A$, and
2. for every step $c \to c'$ of $C$, either $\alpha\ c \to \alpha\ c'$ is a step of $A$, or
   $\alpha\ c' = \alpha\ c$. A step of the second kind is a **stutter step**: the abstract state does
   not change.
:::

Stutter steps are what allow the concrete model to take more steps than the abstract one. Every `tick`
of the timed controller is a stutter step: the timer changes, the lights do not. Figure 13.3 shows a
run of the timed controller and the run of the crossing that it represents.

::: figure id=fig-13-3
A run of the timed controller (below) and its image under `lights` (above). The three ticks change only
the timer, so they are stutter steps; every other step is a step of the crossing.
:::

### The proof {#refinement-proof}

The initial states match: `lights ⦇lights = start, timer = 0⦈` is `start`. For the steps, prove that
each concrete step is a stutter step or a step of the crossing. In Isar, `proof cases` takes the step
apart by rule inversion, one case for each rule of `tstep`:

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

Case `tick` is a stutter step. Case `press` is the abstract event `Press`: the `have` states the step
with `Press` in place of `e`, and `blast` then proves the disjunction with `Press` as the witness for
`∃e`. Case `switch` is the abstract event `e`, and its abstract guard holds because it is part of the
concrete guard.

Now the general argument: every reachable concrete state represents a reachable abstract state. It is a
rule induction over `treach`, and it uses only the two conditions of the definition: the initial states
match, and `sim`.

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

In the induction step, a stutter step leads to the same abstract state, which is reachable by the induction
hypothesis; any other step is a step of the crossing from a reachable state, which `reach.step` covers.
And now the safety of the timed controller costs one line:

```isabelle
theorem timed_safe: "treach c ⟹ safe (lights c)"
  using treach_reach crossing_safe by blast
```

No new invariant was needed. The timed controller has more states than the crossing (one for every
value of the timer), but its proof only had to check that each of its steps is one the crossing allows.

::: fact Refinement preserves invariants
If $C$ refines $A$ with abstraction function $\alpha$, then $\alpha$ maps every reachable state of $C$ to
a reachable state of $A$. So for every invariant $I$ of $A$, the property "$I(\alpha\ c)$" is an
invariant of $C$.
:::

This is the idea behind **refinement-based development**, used for example in the B method, with which
the software of Paris Métro line 14 was developed (Module 1), and in its successor Event-B. You start with
an abstract model in which the important properties are simple to state and prove. Then you add detail in
small steps, timers, buttons, messages, data structures, and prove that each step is a refinement. The
safety properties proved at the top hold all the way down.

::: note
An abstraction function is a special case. In general, a concrete state may correspond to several
abstract states. Then a **simulation relation** $R$ between concrete and abstract states takes the place
of $\alpha$: every initial concrete state is related to some initial abstract state, and whenever
$R\ c\ a$ and $c \to c'$, there is an $a'$ with $R\ c'\ a'$ that $a$ reaches in zero steps or one. The
proof has the same shape.
:::

::: pitfall
The direction matters. The definition says that every concrete step is allowed by the abstract model;
that is why safety properties carry over from the abstract model to the concrete one. It does not say
that the concrete model can do everything the abstract one can. A concrete model may do *less*: the
timed controller never changes a light while its timer runs, which the crossing would allow. Section
13.8 shows what refinement therefore does not preserve.
:::

## Beyond safety, and where to go next {#next}

### Liveness {#liveness}

Requirement R2 says that after a press, the pedestrians *eventually* walk. It is not about bad states.

::: definition Liveness property
A **liveness property** says that something good eventually happens: a request is eventually served, a
message is eventually delivered, a program eventually terminates.
:::

No finite run can break a liveness property, because the good thing might still happen later. A
counterexample is an infinite run in which it never happens, typically a loop that repeats forever. The
crossing has one: press the button again and again, forever, and nothing else ever happens. Every state
of this run is reachable and safe, and the pedestrians never walk. To rule out such runs, a model needs a
**fairness** assumption, such as "an event whose guard stays true is eventually taken". Proofs of
liveness then use a measure that decreases until the good thing happens, like the termination measures
of Module 5. Leslie Lamport introduced the words *safety* and *liveness* for these two kinds of
properties in 1977.

An invariant cannot express a liveness property, because it talks about one state at a time. And
refinement as defined in Section 13.7 does not preserve liveness: a controller that never changes its
lights, whatever happens, refines the crossing, since all its steps are presses and stutter steps
(Exercise 13.9). It is perfectly safe and perfectly useless. Refinement methods add proof obligations
for liveness. Event-B, for example, can ask you to show that new events such as `tick` cannot run
forever, with a measure that each of them decreases, here the timer; that rules out a controller that
only ticks. A requirement such as R2 still needs a proof of its own.

Liveness is the home ground of **temporal logic**, which Amir Pnueli proposed for programs in 1977. Its
operators speak about runs: □ *P* ("always *P*") and ◇ *P* ("eventually *P*"). Requirement R2 becomes
□(*req* ⟶ ◇ *Walk*): at every point of a run, if a request is pending, the pedestrians walk then or at
some later point.
**Model checkers** check such formulas on finite models automatically, and print a counterexample run
when they fail: **SPIN** for models in its language Promela, **nuXmv** for models in the SMV language,
and **TLC** for specifications in Lamport's **TLA+**, the language that Amazon's engineers used
(Module 1). Isabelle can prove liveness too, but that needs more machinery than this series covers.

### Where to go next {#further}

- **Isabelle for model verification.** The site's single-page guide
  [Isabelle for model verification](../isabelle/) applies these ideas to a small model of a lid: a
  record of state, a guard that admits an operation, a lemma that the operation preserves the state
  invariant, and a proof that a translation between two representations preserves meaning. Its guard
  and update form an event in the sense of Section 13.4, and its lemma is the induction step of an invariant
  proof (Section 13.3); the translation theorem is of the kind that Module 14 proves for a compiler. The
  guide was written for Isabelle2025-2.
- **The Archive of Formal Proofs** is a large online library of checked Isabelle developments, among
  them models of protocols, algorithms and systems with their invariants and refinements.
- **Event-B** and its tool, the Rodin platform, are built around refinement: abstract machines, events
  with guards and actions, invariants, and refinement proofs, discharged mostly by automatic provers.
- **Model checkers** such as TLC, SPIN and nuXmv explore finite models automatically and handle
  liveness. They are the quickest way to find a counterexample trace in a design; a proof covers what a
  finite model cannot.

Module 14 ends the series with a different kind of system: a compiler, proved correct.

## What you learned {#summary}

- A **state machine** has states, initial states and a transition relation. Its steps are **events**, each
  with a **guard** (when it can happen) and an **effect** (how it changes the state). A **run** follows
  the steps from an initial state; a **trace** lists its events; a state is **reachable** if a run leads
  to it.
- In Isabelle, a state is a datatype, a pair or a **record** (fields `cars s`, values
  `⦇cars = …, …⦈`, updates `s⦇cars := …⦈`). The transition relation is an `inductive` definition with
  one rule per event, or a pair of functions `guard` and `effect`, which `value` can run. The reachable
  states are an inductive definition with a rule for the initial state and a rule for a step, the same
  as the reflexive–transitive closure `r⇧*` from the initial state.
- A **safety property** must hold in every reachable state. An **invariant** holds in every reachable
  state; it is **inductive** if it holds initially and every step preserves it. Rule induction over the
  reachable states proves an inductive invariant: a base case and an induction step.
- A safety property is often not inductive. The failed induction step shows a state and an event: a
  **counterexample to induction**. If the state is unreachable, **strengthen** the invariant with a fact
  that holds in every reachable state. If it is reachable, the design is wrong.
- Nitpick finds reachable bad states, also of inductive definitions, and with an executable `run` it finds
  **counterexample traces**: lists of events that lead to a bad state. `value` replays them. Fix the
  option `card` to make Nitpick report the same counterexample every time.
- A concrete model **refines** an abstract one if an **abstraction function** maps initial states to
  initial states and every concrete step to an abstract step or a **stutter step**. Then every invariant
  of the abstract model holds, through the abstraction function, in the concrete one.
- A **liveness property** says that something good eventually happens. Invariants and refinement do not
  cover it; temporal logic and model checkers such as SPIN, nuXmv and TLC do.

## Exercises {#exercises}

:::: exercise Runs of the lift {#ex-13-1} ★
Use the lift of Example 13.1.

1. Which events can happen in the state where the door is open and the lift stands still, and to which
   states do they lead?
2. Give a trace from the initial state to the state where the door is closed and the lift moves, that
   passes through the state where the door is closing.
3. Why is the state "door closing, lift moving" unreachable? Look at the events that could lead to it.

::: solution
1. *open* (the door stays open: same state), *close* (the door becomes Closing, the lift still) and
   *stop* (same state). *shut* needs a closing door and *start* a closed one.
2. *open, close, shut, start*: (Closed, still) → (Open, still) → (Closing, still) → (Closed, still) →
   (Closed, moving).
3. Only *close* leads to a closing door, and it keeps the motion as it is, so the state before would
   have to be "door open, lift moving". No event leads to that state: *open* needs a lift that stands
   still and keeps it still, *start* needs a closed door, and *close*, *shut* and *stop* never produce an
   open door with a moving lift. So neither unsafe state can be reached. The proof of `lift_safe` makes
   this argument for every state at once.
:::
::::

:::: exercise Safety or liveness? {#ex-13-2} ★
Say whether each requirement is a safety or a liveness property.

1. Two trains are never on the same section of track.
2. Every print job is eventually printed.
3. The balance of an account never becomes negative.
4. A message that is sent is eventually delivered.
5. The program never divides by zero.
6. The program terminates.

::: solution
1. Safety: the bad state is two trains on one section, and a finite run can reach it.
2. Liveness: something good (the printout) must eventually happen; a counterexample is an infinite run
   in which the job is never printed.
3. Safety.
4. Liveness.
5. Safety: the bad thing is a division by zero, and a finite run that performs one is a counterexample.
6. Liveness: termination says that the program eventually stops. No finite run shows that a program
   never stops; the counterexample is an infinite run.
:::
::::

:::: exercise Predict a run {#ex-13-3} ★
Work out on paper the result of `run [Press, Press, ToAmber, ToGreen, ToRed] start`, event by event.
Then check it with `value`.

::: solution
`Press` sets the request. The second `Press` changes nothing, since the request is already set. `ToAmber`
is enabled (green, request) and makes the car light amber. `ToGreen` needs red, so `run` skips it. `ToRed`
makes the car light red. The pedestrians never walk, and the request is still pending:

```isabelle
value "run [Press, Press, ToAmber, ToGreen, ToRed] start"
```

```output
"⦇cars = Red, peds = DontWalk, req = True⦈"
  :: "crossing"
```
:::
::::

:::: exercise Invariant, inductive, or neither? {#ex-13-4} ★★
For the crossing of Section 13.4, decide for each property whether it holds in every reachable state,
and whether it is inductive on its own. Use Figure 13.1 for the reachable states. When a property is not
inductive, give a state and an event that break the induction step; when it is not an invariant, give a run
that breaks it.

1. `peds s = Walk ⟶ req s`
2. `cars s = Amber ⟶ req s`
3. `peds s = DontWalk`
4. `cars s = Amber ⟶ peds s = DontWalk`

::: solution
1. **Invariant and inductive.** Only `StartWalk` makes the pedestrians walk, and its guard needs the
   request. While they walk, only `EndWalk` clears the request, and it ends the walk. No other event
   changes the two fields involved, except `Press`, which sets the request. (This is the part that
   Section 13.5 added to `safe`.)
2. **Invariant, not inductive.** The only reachable state with amber has a request. But take the
   unreachable state ⦇cars = Amber, peds = Walk, req = True⦈: it satisfies the property, and `EndWalk`
   clears the request and keeps the amber light. Exercise 13.7 proves the invariant.
3. **Not an invariant**, so not inductive either. The run *Press, ToAmber, ToRed, StartWalk* reaches a
   state where the pedestrians walk.
4. **Invariant, not inductive.** In the reachable states, amber comes only with don't walk. But the
   unreachable state ⦇cars = Green, peds = Walk, req = True⦈ satisfies the property (the cars are not
   amber), and `ToAmber` leads to amber while the pedestrians walk.
:::
::::

:::: exercise Runs reach reachable states {#ex-13-5} ★★
Prove that every state that `run` produces from a reachable state is reachable, and conclude that
`run es start` is reachable for every list of events `es`. Which variable must be generalised in the
induction, and why?

::: solution
Induct on `es`. In the recursive call `run es (…)`, the state changes, so the induction hypothesis must
hold for every state: generalise `s` with `arbitrary:` (Module 11).

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
