---
title: Modelling systems: state machines and invariants
part: 4
lead: Describe a system as a state machine and prove in Isabelle that nothing bad ever happens in it. You will model states, events, guards and effects, define the reachable states, prove safety properties with invariants, strengthen an invariant that is not inductive, turn a counterexample into a trace, and carry what you proved about an abstract model over to a more concrete one.
minutes: 230
needs: Modules 4, 5 and 10 to 12 (relations and `r⇧*`, invariants on paper, Isar, inductive definitions and rule induction, abstraction functions)
goals:
  - Model a system as a state machine with states, an initial state, and events that have guards and effects
  - Define the transitions and the reachable states of a model with `inductive`, and relate reachability to `r⇧*`
  - Prove a safety property by rule induction with an invariant, and strengthen an invariant that is not inductive
  - Find a run that breaks a faulty design with Quickcheck or Nitpick, read it as a trace, and fix the design
  - Prove that a concrete model refines an abstract one, so that the abstract invariants hold in the concrete model
  - Tell safety from liveness, and name the tools that check liveness
imports: Main
---

## Systems that react {#machines}

The programs you verified in Module 12 compute a result: they take a list and return it sorted, or take a
tree and a key and return a new tree. Their specification relates the output to the input. Many systems
do not work like that. A traffic light controller, a lift, a network protocol, a bank and an operating
system never finish. They keep a **state**, and they react to **events**: a button is pressed, a timer
runs out, a message arrives. For such a system the question is not "is the result right?" but "can the
system ever get into a bad state?". Two trains on the same piece of track, a lift that moves with its
door open, a lock held by two processes at once: these are bad states, and the system must never reach
one, however its events are ordered and however long it runs.

This module describes such systems as **state machines** and proves in Isabelle that no reachable state
is bad. The method is the invariant of Module 5, now on systems with many events, together with the
inductive definitions and rule induction of Module 11.

Start with a small system, the door of a lift. The door is open, closing or closed, and the lift is
moving or not. Five events can happen. Each has a **guard**, a condition on the current state that says
when the event can happen, and an **effect**, which says how the event changes the state.

::: example The lift door
The state has two parts: the door (Open, Closing or Closed) and whether the lift moves. Initially the
door is closed and the lift stands still.

| Event | Guard: it can happen when | Effect |
|---|---|---|
| open | the lift does not move | the door becomes Open |
| close | the door is Open | the door becomes Closing |
| shut | the door is Closing | the door becomes Closed |
| start | the door is Closed | the lift moves |
| stop | always | the lift stops |

The event *shut* is the door mechanism reporting that the door has finished closing. The guard of
*open* allows the door to reopen while it is closing, as real lift doors do when someone steps in.
:::

::: definition State machine
A **state machine**, or **transition system**, consists of a set of **states**, a set of **initial
states**, and a **transition relation**: $s \to t$ means that the machine can go from state $s$ to state
$t$ in one step. In this module the steps are described by **events**. An event can happen in state $s$
when its **guard** holds in $s$, and it leads to the state given by its **effect**.
:::

::: definition Run, trace and reachable state
A **run** is a sequence of states $s_0 \to s_1 \to s_2 \to \dots$ that starts in an initial state and
follows the transition relation. Written as the list of its events, with the states they lead to, a run
is a **trace**. A state is **reachable** if some run leads to it.
:::

Here is a run of the lift, from the initial state, with the events written over the arrows:

$$
(\mathit{Closed}, \text{still}) \xrightarrow{\ \mathit{open}\ } (\mathit{Open}, \text{still})
\xrightarrow{\ \mathit{close}\ } (\mathit{Closing}, \text{still}) \xrightarrow{\ \mathit{shut}\ }
(\mathit{Closed}, \text{still}) \xrightarrow{\ \mathit{start}\ } (\mathit{Closed}, \text{moving})
$$

Its trace is *open, close, shut, start*. The machine has $3 \times 2 = 6$ states, and four of them are
reachable. The other two are the dangerous ones:

| Door | Lift | Reachable? |
|---|---|---|
| Closed | still | yes, it is the initial state |
| Open | still | yes, by *open* |
| Closing | still | yes, by *open*, *close* |
| Closed | moving | yes, by *start* |
| Open | moving | no |
| Closing | moving | no |

Why can the lift never move with its door open or closing? With six states you can check every state
and every event by hand. A real controller has many more states, and a model with a counter or a queue
has infinitely many. A **model checker** explores the reachable states of a finite model one by one
(Module 1). This module proves the property for all reachable states at once, by induction, which works
however many states there are.

::: note
A model is a decision about what to leave out. The lift model has no floors, no passengers, no motor and
no time. A proof about the model says nothing about what the model leaves out; as Module 1 put it, a
proof shows that the model meets its specification, and only validation shows that the model and the
specification describe the real lift. Choose what goes into a model by the property you want to prove:
here, the door and the motion.
:::

## State machines in Isabelle {#lift}

In Isabelle, describe the states with types you know, the transitions with an inductive definition
(Module 11), and the reachable states with another one. A state of the lift is a pair: the door, and a
Boolean that is `True` when the lift moves.

```isabelle
datatype door = Open | Closing | Closed

inductive lstep :: "door × bool ⇒ door × bool ⇒ bool" where
  open_door:  "¬ m ⟹ lstep (d, m) (Open, m)"
| close_door: "d = Open ⟹ lstep (d, m) (Closing, m)"
| shut_door:  "d = Closing ⟹ lstep (d, m) (Closed, m)"
| start_lift: "d = Closed ⟹ lstep (d, m) (d, True)"
| stop_lift:  "lstep (d, m) (d, False)"
```

`lstep s t` says that one step leads from state `s` to state `t`: it is the transition relation. Each
rule is one event of Example 13.1. The premise of a rule is the guard of its event, and the conclusion
relates the state before the event to the state after it; the effect is the difference between the two.
Rule `start_lift` reads: if the door is closed, one step leads from `(d, m)` to `(d, True)`, the same door
with the lift moving. Rule `stop_lift` has no premise, because stopping is always possible.

The reachable states are those you get from the initial state by any number of steps:

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
*before* the last step, exactly as in the invariant method.

## Safety properties and invariants {#invariants}

The property you want for the lift is that it never moves unless its door is closed. Properties of this
kind have a name.

::: definition Safety property
A **safety property** says that something bad never happens. For a state machine, it is a property of
states that must hold in every reachable state. A run that reaches a state where it fails is a
**counterexample** to it.
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
```

Subgoal 1 is the **initial case**: the initial state is safe. Subgoal 2 is the **step case**: for a
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

::: pitfall
State the property for a state variable, not for a pattern. This version looks the same, but fails:

```isabelle fails
lemma "lreach (d, m) ⟹ m ⟶ d = Closed"
  by (induction rule: lreach.induct) (auto elim: lstep.cases)
```

```output
```

The argument of `lreach` is the pair `(d, m)`, not a variable. Rule induction needs a variable there,
as Module 11 explained for constants: given a compound term, the method cannot connect the claim to the
states in the rule, and the cases make no sense. Write the property as a function of the whole state, as
`lift_ok` does, and the induction works.
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
`⦇cars = Green, peds = DontWalk, req = False⦈`; type ⦇ as `(|` and ⦈ as `|)`. The notation
`s⦇cars := Amber⦈` is the **update** of a field: the crossing `s` with its car light changed to amber and
the other fields unchanged. The simplifier knows how selectors and updates interact, so that it rewrites
`cars (s⦇req := True⦈)` to `cars s` by itself.

```isabelle
definition start :: crossing where
  "start = ⦇cars = Green, peds = DontWalk, req = False⦈"

value "start⦇cars := Amber⦈"
```

```output
```

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
```

A pedestrian pressed the button, the car light went through amber to red, and the pedestrians walk. Now
the same events without the press:

```isabelle
value "run [ToAmber, ToRed, StartWalk] start"
```

```output
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
```

The induction rule has the same two cases as before. In the step case, the event `e` is arbitrary: a
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

```output
```

The initial case went through, and so did five of the six events. The goal that is left belongs to
`ToGreen`. Read it as a state: the cars have red, no request is pending, and the pedestrians walk. The
state is safe, because the cars have red. The guard of `ToGreen` holds in it, because the cars have red
and no request is pending. After `ToGreen` the cars have green while the pedestrians walk, which is not
safe.
So `safe` is *not inductive*: a step from a safe state can lead to an unsafe one.

You can ask Isabelle for such a step directly. The lemma below says that every event preserves `safe`,
from any state, reachable or not. Quickcheck tests it:

```isabelle
lemma "safe s ⟹ guard e s ⟹ safe (effect e s)"
  quickcheck
  oops
```

```output result
```

A state and an event that break the step case in this way are a **counterexample to induction**. Isabelle
does not know whether this state can occur. There are two possibilities, and they call for different
actions:

1. The state is **reachable**. Then some run leads to it, the next `ToGreen` makes it unsafe, and the
   design is wrong. Section 13.6 shows this case.
2. The state is **not reachable**. Then the design may well be safe, but `safe` is too weak to carry
   the induction: it allows states that never occur, and the step case fails on one of them.

Nitpick (Module 9) can search the reachable states for an unsafe one. It works with inductive
definitions such as `reach`, which Quickcheck cannot run:

```isabelle
lemma "reach s ⟹ safe s"
  nitpick
  oops
```

```output result
```

No reachable state breaks `safe`. That is not a proof, but it points to the second possibility. Find
out on paper why the state of the goal cannot be reached. The pedestrians start to walk only through
`StartWalk`, whose guard needs a request. While they walk, the request stays set, since only `EndWalk`
clears it, and `EndWalk` also ends the walk. So in every reachable state: *if the pedestrians walk, a
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
only sets the request; `StartWalk` needs red and a request, and keeps both; `EndWalk` ends the walk.
Safety follows at once, because `invar` says more than `safe`:

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
- **Adding a fact that is false.** If the new part does not hold initially, the initial case fails. If
  it holds in every reachable state but is not preserved together with the rest, another step case
  fails, and you need another round. Test a candidate first: `nitpick` on `reach s ⟹ invar s` should
  find no counterexample.
- **Trying a stronger proof method.** No method can prove the step case for `safe`, because it is
  false: Quickcheck showed a counterexample. A failed step case asks for a stronger invariant, not for
  more automation.
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

The proof of Section 13.5 fails here with the same goal. This time Nitpick finds a reachable state that
is not safe:

```isabelle
lemma "reach_early s ⟹ safe s"
  nitpick [card = 6]
  oops
```

```output result
```

The cars have green while the pedestrians walk. The option `card = 6` sets the size of the models that
Nitpick tries: it may use up to six different values of each type whose size is not fixed, such as
states and lists. Six are enough here, and with one fixed size Nitpick reports the same counterexample
every time. Without the option it tries the sizes 1 to 10, and which counterexample it reports first can
change from run to run.

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
```

That is a **counterexample trace**: five events from `start` to an unsafe state. Replay it with `value`
to see every state on the way. `take n es` is the first `n` events of `es`, so the list below holds the
state after 0, 1, …, 5 events:

```isabelle
value "map (λn. run_early (take n [Press, ToAmber, ToRed, StartWalk, ToGreen]) start)
         [0..<6]"
```

```output
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
When the step case of an invariant proof fails, the goal describes a state and an event. Find out whether
the state is reachable. If it is, the design is wrong: search for a trace with Nitpick, or with
Quickcheck on an executable model, and fix the design. If it is not, the design may be right and the
invariant too weak: strengthen it.
:::

::: tip
Quickcheck and Nitpick search in different ways. Quickcheck runs the definitions on many small values,
so it needs functions it can execute, such as `guard`, `effect` and `run`. Nitpick translates the
problem into a SAT problem and also handles inductive definitions such as `reach`. Here Quickcheck found
the counterexample to induction at once, but finds no trace for `run_early`: it tries only short lists
of events. Try both. Isabelle/jEdit runs Quickcheck on every new lemma by itself, but not Nitpick.
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

Case `tick` is a stutter step. Case `press` is the abstract event `Press`; the `have` names it as the
witness for `∃e`, which `blast` then needs. Case `switch` is the abstract event `e`, and its abstract
guard holds because it is part of the concrete guard.

Now the general argument: every reachable concrete state represents a reachable abstract state. It is a
rule induction over `treach`, and it uses nothing about the crossing except `sim`:

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

In the step case, a stutter step leads to the same abstract state, which is reachable by the induction
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
properties proved at the top hold all the way down.

::: note
An abstraction function is a special case. In general, a concrete state may correspond to several
abstract states, or the correspondence may depend on more than the concrete state. Then a **simulation
relation** $R$ between concrete and abstract states takes the place of $\alpha$: related states are
related initially, and whenever $R\ c\ a$ and $c \to c'$, there is an $a'$ with $R\ c'\ a'$ that $a$
reaches in zero or one step. The proof has the same shape.
:::

::: pitfall
The direction matters. The definition says that every concrete step is allowed by the abstract model,
not that the concrete model can do everything the abstract one can. A concrete model may do *less*: the
timed controller never changes a light while its timer runs, which the crossing would allow. That is
why refinement preserves safety properties. Section 13.8 shows what it does not preserve.
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
against this; Event-B, for example, asks you to show that new events such as `tick` cannot run forever,
with a decreasing measure, here the timer.

Liveness is the home ground of **temporal logic**, which Amir Pnueli proposed for programs in 1977. Its
operators speak about runs: □ *P* ("always *P*") and ◇ *P* ("eventually *P*"). Requirement R2 becomes
□(*req* ⟶ ◇ *Walk*): at every point, if a request is pending, the pedestrians walk at some later point.
**Model checkers** check such formulas on finite models automatically, and print a counterexample run
when they fail: **SPIN** for models in its language Promela, **nuXmv** for models in the SMV language,
and **TLC** for specifications in Lamport's **TLA+**, the language that Amazon's engineers used
(Module 1). Isabelle can prove liveness too, but that needs more machinery than this series covers.

### Where to go next {#further}

- **Isabelle for model verification.** The site's single-page guide
  [Isabelle for model verification](../isabelle/) applies the ideas of this module to a small object
  model: a record of state, a guard that admits an operation, a lemma that the operation preserves the
  state invariant, and a proof that a translation between two representations preserves meaning. You
  can now read it as an application of Sections 13.4, 13.5 and 13.7.
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
  the steps from an initial state; a **trace** lists its events and states; a state is **reachable** if a
  run leads to it.
- In Isabelle, a state is a datatype, a pair or a **record** (fields `cars s`, values
  `⦇cars = …, …⦈`, updates `s⦇cars := …⦈`). The transition relation is an `inductive` definition with
  one rule per event, or a pair of functions `guard` and `effect`, which `value` can run. The reachable
  states are an inductive definition with a rule for the initial state and a rule for a step, the same
  as the reflexive–transitive closure `r⇧*` from the initial state.
- A **safety property** must hold in every reachable state. An **invariant** holds in every reachable
  state; it is **inductive** if it holds initially and every step preserves it. Rule induction over the
  reachable states proves an inductive invariant: an initial case and a step case.
- A safety property is often not inductive. The failed step case shows a state and an event: a
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
```
:::
::::

:::: exercise Invariant, inductive, or neither? {#ex-13-4} ★★
For the crossing of Section 13.4, decide for each property whether it holds in every reachable state,
and whether it is inductive on its own. Use Figure 13.1 for the reachable states. When a property is not
inductive, give a state and an event that break the step case; when it is not an invariant, give a run
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
3. **Not an invariant.** The run *Press, ToAmber, ToRed, StartWalk* reaches a state where the
   pedestrians walk.
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

In the step case, the simplifier splits the `if` in the definition of `run`. If the guard holds, the next
state is reachable by `reach.step`; if not, it is `s` itself. Together with `crossing_safe`, this shows
that no run of events leads to an unsafe state, which is what Quickcheck and Nitpick were testing in
Section 13.6.
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
In the step case, the premise `reach s` is available, so `reach_invar` gives `invar s` for the state
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
```

```isabelle
  oops
```

The goal describes an unlocked turnstile with as many passes as coins. Pushing it would make passes
exceed coins. That state is unreachable: a turnstile is unlocked only after a coin that has not been used
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
  "lazy start"
| "lazy s ⟹ lazy (s⦇req := True⦈)"
```

1. Prove that it refines the crossing, with the identity as abstraction function: `lazy s ⟹ reach s`.
   Conclude that it is safe.
2. Prove that in the lazy controller the cars always have green.
3. What do 1 and 2 say about requirement R2, and about what refinement preserves?

::: solution
1. Each step of the lazy controller is the abstract event `Press`:

   ```isabelle
   lemma lazy_reach: "lazy s ⟹ reach s"
   proof (induction rule: lazy.induct)
     case 1
     show ?case by (rule reach.init)
   next
     case (2 s)
     then have "reach (effect Press s)" by (simp add: reach.step)
     then show ?case by simp
   qed

   corollary "lazy s ⟹ safe s"
     by (simp add: crossing_safe lazy_reach)
   ```

   The rules of `lazy` have no names, so Isabelle numbers the cases. The `have` states the reachable
   state in the form that `reach.step` produces, and `simp` turns `effect Press s` into `s⦇req := True⦈`.
2. ```isabelle
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
> An inductive invariant is preserved by every step from every state that satisfies it, including unreachable ones. That is what the step case of the rule induction checks.

? The step case of an invariant proof fails, and the goal describes a state s and an event e. What should you find out first?
- [ ] Whether a stronger proof method such as auto or force proves the goal
- [ ] Whether e is the last event of the datatype
- [ ] Whether the initial state satisfies the invariant
- [x] Whether s is reachable
> If s is reachable, the design is wrong and a trace shows how. If it is not, the invariant is too weak and must be strengthened.

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
