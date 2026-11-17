---
title: Natural deduction in Isabelle
part: 2
lead: Turn the paper proofs of Module 6 into Isabelle proof scripts, rule by rule, read every proof state on the way, and recognise what went wrong when a step fails.
minutes: 240
needs: Modules 1–3 and 6
goals:
  - Tell Isabelle's meta-logic (⟹, ⋀, ≡) from the object logic HOL (⟶, ∀, =) and read rules written with ⟹
  - Look up the Isabelle name and statement of every natural-deduction rule with `thm`
  - Build proofs backwards with `rule`, `erule`, `drule`, `frule`, `assumption`, `intro` and `elim`, and close them with `done`
  - Explain schematic variables, unification and fixed variables, and why quantifier steps must come in the right order
  - Prove classical laws with `ccontr` and `classical`, and repair a step from its error message
  - Let `blast` find such proofs automatically, knowing what it does for you
imports: Main
---

## Two logics in one system {#meta}

In [Module 6](module_06_EN.html) you built natural-deduction proofs on paper. You started from the
formula you wanted, chose the rule that could have produced it, and worked upwards until every branch
ended in an assumption. Isabelle builds proofs in exactly this way, and checks every step. In this module
you redo the proofs of Module 6 in Isabelle, rule by rule, so that each paper tree becomes a short proof
script.

Before the first proof you need to read the notation Isabelle uses for rules and goals. It involves a
second, smaller logic underneath HOL.

### Pure, the meta-logic {#meta-pure}

Module 1 described Isabelle as a framework in which many logics can be defined. The framework has a small
logic of its own, **Isabelle/Pure**, or Pure for short. Its only job is to say what rules and proofs are.
Every other logic, HOL included, is defined inside Pure.

::: definition Meta-logic and object logic
A **meta-logic** is a logic for stating rules and proofs about another logic, the **object logic**. In
Isabelle the meta-logic is **Pure** and the object logic is **HOL**. Pure has three symbols of its own:
⟹ ("from … infer"), ⋀ ("for an arbitrary …") and ≡, Pure's own equality, which Isabelle uses above all
to state definitions.
:::

Each Pure symbol has a HOL counterpart that you already know from Modules 2 and 3:

| Pure | Read it as | HOL | Read it as |
|---|---|---|---|
| `A ⟹ B` | from A, infer B | `A ⟶ B` | A implies B |
| `⋀x. P x` | for an arbitrary x, P x | `∀x. P x` | for all x, P x |
| `a ≡ b` | a equals b; in a definition, a is defined as b | `a = b` | a equals b |

In Isabelle/jEdit you type ⟹ as `==>`, ⋀ as `!!` and ≡ as `==`. The brackets ⟦ and ⟧, which appear
below, are `[|` and `|]`.

Why does Isabelle need two arrows? Because a rule of natural deduction is not a formula. The rule (∧I) of
Module 6 does not say "A ∧ B is true". It says "if you have derived A and you have derived B, you may
write down A ∧ B". It is a statement about derivations, which Module 6 drew as a horizontal line. Pure
gives Isabelle a language for statements of this kind. In Pure, (∧I) reads

$$
\llbracket A;\ B \rrbracket \Imp A \land B
$$

"from A and B, infer A ∧ B". The formulas A, B and A ∧ B belong to HOL; the brackets, the semicolon and
⟹ belong to Pure. HOL formulas have the type `bool`. Pure statements have a type of their own, `prop`,
and Isabelle turns each HOL formula into a Pure statement where one is needed, without showing you.

::: fact Rules with several premises
`A₁ ⟹ A₂ ⟹ … ⟹ Aₙ ⟹ C` means `A₁ ⟹ (A₂ ⟹ … ⟹ (Aₙ ⟹ C))`, and Isabelle prints it as
`⟦A₁; A₂; …; Aₙ⟧ ⟹ C`: from the premises A₁ to Aₙ, infer the conclusion C. A premise can itself be a
rule: in `(A ⟹ B) ⟹ C`, the premise `A ⟹ B` is a derivation of B that may assume A.
:::

Figure 7.1 shows the two layers, and how one rule uses both.

::: figure id=fig-07-1
Isabelle's two layers. HOL formulas, of type `bool`, are written with ¬ ∧ ∨ ⟶ ∀ ∃ and =. Rules and
goals are Pure statements, of type `prop`, built from HOL formulas with ⟹, ⋀ and ≡.
:::

### Goals use the same arrow {#meta-goals}

Isabelle writes goals with ⟹ too. Compare two lemmas:

```isabelle
lemma "A ⟹ A ∨ B"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟹ A ∨ B
```

This goal is a rule: from A, infer A ∨ B. A is an **assumption** you may use, and A ∨ B is the
**conclusion** you must reach. `blast`, from Module 2, proves it:

```isabelle
  by blast
```

```isabelle
lemma "A ⟶ A ∨ B"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟶ A ∨ B
```

Here the whole goal is one HOL formula, and there are no assumptions yet. It says the same thing, and
`blast` proves it too:

```isabelle
  by blast
```

The difference lies in how you work with the two forms. On paper, the first step of a proof of
A ⟶ A ∨ B is (⟶I): assume A, then prove A ∨ B. In Isabelle that step turns the ⟶ of the goal into ⟹,
after which the goal looks exactly like the first lemma. You will take this step in Section 7.3.

The manual *Programming and Proving in Isabelle/HOL* gives a practical rule: state a lemma as
⟦A₁; …; Aₙ⟧ ⟹ C rather than A₁ ∧ … ∧ Aₙ ⟶ C when you want to use it as a rule later, because Isabelle
can apply the first form directly. In this module the lemmas keep the ⟶ form of Module 6, so that each
Isabelle proof follows its paper tree step by step.

### Definitions with ≡ {#meta-def}

The third symbol of Pure, ≡, appears in definitions. Module 6 explained ¬A as A ⟶ ⊥. HOL defines
negation in the same way, as the command `thm` shows (it displays a stored theorem by its
name; Section 7.2 uses it all the time):

```isabelle
thm not_def
```

```output result
¬ ?P ≡ ?P ⟶ False
```

Read it as "¬P is defined as P ⟶ False". Isabelle writes ⊥ as `False`. The question marks are explained
in Section 7.2.

::: pitfall
⟹ belongs to Pure. It joins statements, but it can never appear inside a HOL formula:

```isabelle fails
lemma "(A ⟹ B) ∧ C"
```

```output
*** Inner syntax error⌂
*** at "∧ C"
*** Failed to parse prop
```

Isabelle read `(A ⟹ B)` as a Pure statement and then could not go on with `∧ C`, because ∧ joins HOL
formulas. Inside a formula, write ⟶. Note also that ⟹ binds more weakly than every symbol of HOL:
`A ∧ B ⟹ C` means `(A ∧ B) ⟹ C`.
:::

## Rules are theorems {#rules}

### Look a rule up with thm {#rules-thm}

In Isabelle a rule is not a separate kind of object. It is a theorem whose statement uses ⟹, and `thm`
shows it:

```isabelle
thm conjI
```

```output result
⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q
```

Compare it with (∧I) as Module 6 drew it:

```prooftree
P ∧ Q   (∧I)
  P
  Q
```

The premises above the line become the premises before ⟹, and the conclusion below the line becomes the
conclusion after it. The name, conjI, is short for *conjunction introduction*.

::: definition Schematic variable
A **schematic variable**, or **unknown**, is a variable written with a question mark, such as `?P`. It is
a placeholder: when a theorem is used, Isabelle may replace it with any term of the right type, the same
term at every occurrence. When Isabelle stores a proved lemma, it turns the lemma's free variables into
schematic variables, which records that the lemma holds for all their values.
:::

So conjI works for any two formulas. You can choose them yourself with `of`, which replaces the schematic
variables from left to right:

```isabelle
thm conjI[of "door_closed" "lift_stopped"]
```

```output result
⟦door_closed; lift_stopped⟧ ⟹ door_closed ∧ lift_stopped
```

Here `door_closed` and `lift_stopped` are free variables of type `bool`: two facts about a lift, say.
Usually you do not choose by hand. Isabelle finds the right replacement itself, by unification
(Section 7.3).

### The rules of Module 6 {#rules-table}

Here are the rules of Module 6 as Isabelle states them. Each `thm` command below shows several rules, one
per line, in the order of their names:

```isabelle
thm conjI conjunct1 conjunct2 conjE disjI1 disjI2 disjE
```

```output result
  ⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q
  ?P ∧ ?Q ⟹ ?P
  ?P ∧ ?Q ⟹ ?Q
  ⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R
  ?P ⟹ ?P ∨ ?Q
  ?Q ⟹ ?P ∨ ?Q
  ⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R
```

```isabelle
thm impI mp impE notI notE FalseE
```

```output result
  (?P ⟹ ?Q) ⟹ ?P ⟶ ?Q
  ⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q
  ⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R
  (?P ⟹ False) ⟹ ¬ ?P
  ⟦¬ ?P; ?P⟧ ⟹ ?R
  False ⟹ ?P
```

```isabelle
thm allI spec allE exI exE
```

```output result
  (⋀x. ?P x) ⟹ ∀x. ?P x
  ∀x. ?P x ⟹ ?P ?x
  ⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R
  ?P ?x ⟹ ∃x. ?P x
  ⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q
```

```isabelle
thm ccontr classical refl subst ssubst iffI iffD1 iffD2
```

```output result
  (¬ ?P ⟹ False) ⟹ ?P
  (¬ ?P ⟹ ?P) ⟹ ?P
  ?t = ?t
  ⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t
  ⟦?t = ?s; ?P ?s⟧ ⟹ ?P ?t
  ⟦?P ⟹ ?Q; ?Q ⟹ ?P⟧ ⟹ ?P = ?Q
  ⟦?Q = ?P; ?Q⟧ ⟹ ?P
  ⟦?P = ?Q; ?Q⟧ ⟹ ?P
```

The table puts each one next to its paper rule:

| Paper rule (Module 6) | Isabelle name | Statement, as `thm` prints it |
|---|---|---|
| (∧I) | `conjI` | `⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q` |
| (∧E₁) | `conjunct1` | `?P ∧ ?Q ⟹ ?P` |
| (∧E₂) | `conjunct2` | `?P ∧ ?Q ⟹ ?Q` |
| (∧E₁) and (∧E₂) at once | `conjE` | `⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R` |
| (∨I₁) | `disjI1` | `?P ⟹ ?P ∨ ?Q` |
| (∨I₂) | `disjI2` | `?Q ⟹ ?P ∨ ?Q` |
| (∨E) | `disjE` | `⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R` |
| (⟶I) | `impI` | `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q` |
| (⟶E) | `mp` | `⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q` |
| (⟶E), elimination form | `impE` | `⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R` |
| (¬I) | `notI` | `(?P ⟹ False) ⟹ ¬ ?P` |
| (¬E), with ⊥ as ?R | `notE` | `⟦¬ ?P; ?P⟧ ⟹ ?R` |
| (⊥E) | `FalseE` | `False ⟹ ?P` |
| (∀I) | `allI` | `(⋀x. ?P x) ⟹ ∀x. ?P x` |
| (∀E) | `spec` | `∀x. ?P x ⟹ ?P ?x` |
| (∀E), elimination form | `allE` | `⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R` |
| (∃I) | `exI` | `?P ?x ⟹ ∃x. ?P x` |
| (∃E) | `exE` | `⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q` |
| (RAA) | `ccontr` | `(¬ ?P ⟹ False) ⟹ ?P` |
| (RAA), variant | `classical` | `(¬ ?P ⟹ ?P) ⟹ ?P` |
| (=I) | `refl` | `?t = ?t` |
| (=E) | `subst` | `⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t` |
| (=E), right to left | `ssubst` | `⟦?t = ?s; ?P ?s⟧ ⟹ ?P ?t` |
| none | `iffI` | `⟦?P ⟹ ?Q; ?Q ⟹ ?P⟧ ⟹ ?P = ?Q` |
| none | `iffD1` | `⟦?Q = ?P; ?Q⟧ ⟹ ?P` |
| none | `iffD2` | `⟦?P = ?Q; ?Q⟧ ⟹ ?P` |

A few things to notice:

- The names follow a pattern: `I` for introduction, `E` for elimination, `D` for destruction (explained
  below), and `1` and `2` for the two versions of a rule. `mp` is *modus ponens*, `spec` is
  *specialisation*, `refl` is *reflexivity*.
- ⊥ is `False`, and Isabelle prints ¬ followed by a space: `¬ ?P`.
- `notE` concludes any formula `?R`. With `?R` taken to be `False` it is (¬E), which derives ⊥ from ¬P
  and P. With any other `?R` it is (¬E) followed by (⊥E), which derives anything from ⊥.
- `ccontr` is (RAA) exactly: if assuming ¬P leads to ⊥, then P. Section 7.7 explains `classical`.
- On formulas, Isabelle prints ⟷ as `=` (Module 3), so `?P = ?Q` in `iffI` is ?P ⟷ ?Q. Module 6's list
  has no rules for ⟷: `iffI` proves an equivalence from the two implications, and `iffD1` and `iffD2`
  use one in either direction.

### Three shapes of rule {#rules-shapes}

Most rules in the table come in one of three shapes. The shape decides how you use a rule (Sections 7.3
and 7.4), so it is worth learning to see it.

::: definition Introduction, elimination and destruction rules
- An **introduction rule** has the connective in its conclusion: `conjI`, `disjI1`, `disjI2`, `impI`,
  `notI`, `allI`, `exI`, `iffI`.
- An **elimination rule** has the connective (or `False`) in its first premise, the **major premise**,
  and an arbitrary formula, a schematic variable such as `?R`, as its conclusion. Its other premises say
  what you may assume while you prove that formula: `conjE`, `disjE`, `impE`, `notE`, `FalseE`, `allE`,
  `exE`.
- A **destruction rule** has the connective in its major premise and a part or instance of the major premise as its
  conclusion: `conjunct1`, `conjunct2`, `mp`, `spec`, `iffD1`, `iffD2`.
:::

Isabelle often offers two versions of one paper rule: a destruction rule that reads like the paper rule
(`conjunct1`, `mp`, `spec`), and an elimination rule that does the same work in a form better suited to
reasoning about assumptions (`conjE`, `impE`, `allE`). Section 7.4 shows why the second form helps.

The rules that discharge assumptions or need an eigenvariable deserve a closer look, because Pure states
their side conditions without any words.

::: fact How Pure writes discharge and eigenvariables
- In `impI`, `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q`, the premise `?P ⟹ ?Q` is a derivation of ?Q that may use the
  assumption ?P: the [A]¹ of Module 6. The assumption is available exactly inside that premise, so no
  discharge numbers are needed.
- In `disjE`, the premises `?P ⟹ ?R` and `?Q ⟹ ?R` are the two cases, each with its own assumption.
- In `allI`, `(⋀x. ?P x) ⟹ ∀x. ?P x`, the premise says "?P x for an arbitrary x". The variable x is
  local to the premise, so it cannot occur in any assumption from outside. This is the eigenvariable
  condition of (∀I).
- In `exE`, `⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q`, the second premise says "for an arbitrary x with ?P x,
  derive ?Q". ?Q stands outside the scope of ⋀x, so it cannot mention x. This is the condition of (∃E)
  that the eigenvariable must not occur in the conclusion.
:::

## Proving backwards: rule and assumption {#backward}

### The plan {#backward-plan}

Take the first theorem that Module 6 derived with natural deduction, A ∧ B ⟶ B ∧ A ([Section
6.4](module_06_EN.html#connectives)). Here is its tree:

```prooftree
A ∧ B ⟶ B ∧ A   (⟶I¹)
  B ∧ A   (∧I)
    B   (∧E₂)
      [A ∧ B]¹
    A   (∧E₁)
      [A ∧ B]¹
```

Read it from the bottom up, the way you found it. The formula is an implication, so the last step is
(⟶I): assume A ∧ B and prove B ∧ A. That is a conjunction, so the step above is (∧I), which leaves B and
A. Each of them comes out of the assumption, by (∧E₂) and (∧E₁). In Isabelle you take the same steps in
the same order. Each step names a rule; Isabelle applies it to the goal and shows you what is left.

### Applying a rule {#backward-rule}

State the lemma. The name `swap_and` lets you refer to it later:

```isabelle
lemma swap_and: "A ∧ B ⟶ B ∧ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟶ B ∧ A
```

`proof (prove)` means that Isabelle is waiting for proof steps. Below it are the **subgoals** still to be
proved, numbered. At the start there is one: the whole statement.

::: definition Subgoal and proof state
A **subgoal** has the form `⋀x₁ … xₖ. ⟦H₁; …; Hₙ⟧ ⟹ C`: for arbitrary values of the variables x₁ … xₖ
(Section 7.6), and under the **assumptions** H₁ … Hₙ, prove the **conclusion** C. The variables and the
assumptions may be missing. The **proof state** is the list of subgoals. The proof is complete when the
list is empty.
:::

A subgoal is the goal Γ ⊢ C of Module 6's backward search ([Section 6.7](module_06_EN.html#search)),
written in Pure: the assumptions Γ go before ⟹, and the conclusion C after it.

::: definition The method rule
`apply (rule r)` applies the rule r backwards to subgoal 1. It unifies the conclusion of r with the
conclusion of the subgoal (see "Unification" below), and replaces the subgoal with one new subgoal for
each premise of r. Each new subgoal keeps the assumptions of the old one; a premise of the form `P ⟹ Q`
adds P to them.
:::

The first step is (⟶I):

```isabelle
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

`impI` is `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q`. Its conclusion `?P ⟶ ?Q` matches the goal with ?P = A ∧ B and
?Q = B ∧ A, so the new subgoal is the premise, `A ∧ B ⟹ B ∧ A`. A ∧ B is now an assumption. It is
available in this subgoal and in every subgoal that grows out of it, exactly like the open assumption
[A ∧ B]¹ in the tree.

Next, (∧I):

```isabelle
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ B
 2. A ∧ B ⟹ A
```

`conjI` has two premises, so there are now two subgoals, one for each branch of the tree. Both keep the
assumption A ∧ B. The `rule` and `assumption` steps used here act on subgoal 1; subgoal 2 waits its turn.
Other methods, such as `auto` and `simp_all`, can work on all subgoals (Module 5).

Now (∧E₂), used backwards:

```isabelle
  apply (rule conjunct2)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ ?P5 ∧ B
 2. A ∧ B ⟹ A
```

`conjunct2` is `?P ∧ ?Q ⟹ ?Q`. Its conclusion ?Q matches B, so its premise becomes a conjunction whose
right half is B and whose left half is not yet known. Isabelle keeps that left half as a schematic
variable in the new subgoal, `?P5`: the variable `?P` with the number 5 attached, its **index**, so that
it cannot clash with other variables (the index has no other meaning). On paper you would look at the assumptions and write A ∧ B at once. Isabelle postpones
the choice until a later step settles it.

### Closing a subgoal with an assumption {#backward-assumption}

::: definition The method assumption
`apply assumption` proves subgoal 1 if its conclusion unifies with one of its assumptions. Schematic
variables in the conclusion are instantiated as needed, everywhere in the proof state.
:::

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ A
```

Unifying `?P5 ∧ B` with the assumption `A ∧ B` sets ?P5 to A, and the subgoal is closed: that is the leaf
[A ∧ B]¹ of the left branch. The right branch goes the same way with `conjunct1`, whose premise becomes a
conjunction with A on the left:

```isabelle
  apply (rule conjunct1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ A ∧ ?Q7
```

```isabelle
  apply assumption
```

```output state
proof (prove)
goal:
No subgoals!
```

No subgoals are left. `done` ends the proof:

```isabelle
  done
```

::: definition The command done
`done` finishes a proof when no subgoals are left. It does not prove anything itself: if any subgoal
remains, `done` fails (Section 7.8).
:::

Isabelle has now stored the lemma under its name:

```isabelle
thm swap_and
```

```output result
?A ∧ ?B ⟶ ?B ∧ ?A
```

The free variables A and B have become schematic. `swap_and` holds for any two formulas, and you can use
it as a rule, like `conjI`. Figure 7.2 puts the tree and the script side by side.

::: figure id=fig-07-2
The tree of A ∧ B ⟶ B ∧ A and its proof script. Each `rule` step adds one inference to the tree,
starting at the root; each `assumption` step closes one leaf. The goal after each step lists the
branches that are still open.
:::

::: analogy
The proof state is a to-do list. In these rule-by-rule scripts, `apply` replaces the first item with
the subgoals of the chosen step; `done` checks that the list is empty.
:::

### Unification {#backward-unification}

::: definition Unification
**Unification** makes two terms identical by choosing values for their schematic variables. Isabelle uses
it whenever it applies a rule: in `rule`, between the conclusion of the rule and the conclusion of the
subgoal; in `assumption`, between the conclusion of the subgoal and an assumption. If no choice of values
makes the two terms identical, that application cannot succeed. Isabelle also respects types and
variable scopes, and compares terms modulo bound-variable renaming and lambda conversion; it does
not prove arbitrary arithmetic identities while unifying. Higher-order unification is not a general
decision procedure, so a search need not find every possible instantiation.
:::

| Unify | with | Result |
|---|---|---|
| `?P ⟶ ?Q` | `A ∧ B ⟶ B ∧ A` | ?P = A ∧ B and ?Q = B ∧ A |
| `?P5 ∧ B` | `A ∧ B` | ?P5 = A |
| `?P ∧ ?Q` | `A ∧ (B ∨ C)` | ?P = A and ?Q = B ∨ C |
| `?P ∨ ?Q` | `B ∧ A` | impossible: ∨ is not ∧ |
| `A ∧ ?Q` | `B ∧ A` | impossible: A is not B |

The last row matters. A and B in the goal are not schematic: they are free variables that stand for
fixed but arbitrary formulas, and unification never replaces them. That is why the proof works for every
A and B. It never used anything about them.

::: keyidea
Proving in Isabelle is building the paper tree from the root upwards. `rule` adds an inference on top of
an open branch, `assumption` closes a branch at an open assumption, and schematic variables are the parts
of the tree you have not filled in yet.
:::

## Using assumptions: erule, drule and frule {#assumptions}

In Section 7.3 the conjunction A ∧ B sat among the assumptions, and you reached its parts by working
backwards from B and from A, leaving Isabelle to guess ?P5 on the way. On paper you think the other way
round: you have A ∧ B, so you take it apart. Elimination and destruction rules are made for that, and
Isabelle has three methods that apply them to assumptions.

### erule: take an assumption apart {#assumptions-erule}

::: definition The method erule
`apply (erule r)` applies an elimination rule r to an assumption of subgoal 1. It unifies the major
premise of r with an assumption, and the conclusion of r with the conclusion of the subgoal. It removes
that assumption and adds one new subgoal for each of the other premises of r.
:::

With `conjE`, `⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R`, the effect is to replace an assumption P ∧ Q with the two
assumptions P and Q. The swap proof becomes shorter:

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∧ B ⟹ B ∧ A
```

```isabelle
  apply (erule conjE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A; B⟧ ⟹ B ∧ A
```

```isabelle
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ B
 2. ⟦A; B⟧ ⟹ A
```

```isabelle
  apply assumption
  apply assumption
  done
```

After `erule conjE`, A and B are separate assumptions, so each half of B ∧ A is closed by `assumption`
with nothing to guess. This is the usual way to use a conjunction you have.

### Proof by cases: disjE {#assumptions-cases}

Disjunction elimination, (∨E), is a proof by cases: to use A ∨ B, prove the goal once assuming A and once
assuming B. Here is A ∨ B ⟶ B ∨ A from Module 6:

```prooftree
A ∨ B ⟶ B ∨ A   (⟶I¹)
  B ∨ A   (∨E²)
    [A ∨ B]¹
    B ∨ A   (∨I₂)
      [A]²
    B ∨ A   (∨I₁)
      [B]²
```

```isabelle
lemma swap_or: "A ∨ B ⟶ B ∨ A"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∨ B ⟹ B ∨ A
```

```isabelle
  apply (erule disjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ B ∨ A
 2. B ⟹ B ∨ A
```

`disjE` is `⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R`. `erule` matched its major premise with the assumption
A ∨ B and removed it. The two other premises became the two cases, each with its own assumption: [A]²
and [B]² in the tree. In the first case, B ∨ A follows from A by (∨I₂):

```isabelle
  apply (rule disjI2)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ A
 2. B ⟹ B ∨ A
```

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. B ⟹ B ∨ A
```

The second case uses (∨I₁):

```isabelle
  apply (rule disjI1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. B ⟹ B
```

```isabelle
  apply assumption
  done
```

### drule and frule: reason forwards {#assumptions-drule}

::: definition The methods drule and frule
`apply (drule r)` applies a destruction rule r forwards. It unifies the major premise of r with an
assumption of subgoal 1 and removes that assumption. Each other premise of r becomes a new subgoal, and
then the original subgoal comes back with the conclusion of r as a new assumption. `apply (frule r)` does
the same but keeps the assumption it used.
:::

Modus ponens is the typical destruction rule. Module 6 proved (A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C) with three
(⟶I) steps and two (⟶E) steps:

```prooftree
(A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)   (⟶I¹)
  (B ⟶ C) ⟶ (A ⟶ C)   (⟶I²)
    A ⟶ C   (⟶I³)
      C   (⟶E)
        [B ⟶ C]²
        B   (⟶E)
          [A ⟶ B]¹
          [A]³
```

In Isabelle the three implications become three assumptions, one `rule impI` for each (⟶I) of the
tree:

```isabelle
lemma imp_chain: "(A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟶ B ⟹ (B ⟶ C) ⟶ A ⟶ C
```

```isabelle
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A ⟶ B; B ⟶ C⟧ ⟹ A ⟶ C
```

```isabelle
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A ⟶ B; B ⟶ C; A⟧ ⟹ C
```

The assumptions appear in the order of the discharge numbers, [A ⟶ B]¹, [B ⟶ C]² and [A]³, and Isabelle
has dropped the parentheses around A ⟶ C because ⟶ groups to the right (Module 2). Now reason forwards,
from the leaves of the tree: A and A ⟶ B give B.

```isabelle
  apply (drule mp)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦B ⟶ C; A⟧ ⟹ A
 2. ⟦B ⟶ C; A; B⟧ ⟹ C
```

`mp` is `⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q`. `drule` matched its major premise with the first implication among the
assumptions, A ⟶ B, and removed it. The second premise of `mp`, here A, became subgoal 1: to use A ⟶ B,
you must show A. Subgoal 2 is the original goal with the conclusion B added to the assumptions.

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦B ⟶ C; A; B⟧ ⟹ C
```

The same again, with B ⟶ C:

```isabelle
  apply (drule mp)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ B
 2. ⟦A; B; C⟧ ⟹ C
```

```isabelle
  apply assumption
  apply assumption
  done
```

`erule impE` does the same work as `drule mp`, since `impE` is the elimination form of `mp`; which of the
two you use is a matter of taste.

`frule` matters when you need an assumption again after using it. A small demonstration: `frule
conjunct1` adds A but keeps A ∧ B, so that `drule conjunct2` can still take B from it.

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (frule conjunct1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A ∧ B; A⟧ ⟹ B ∧ A
```

```isabelle
  apply (drule conjunct2)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A; B⟧ ⟹ B ∧ A
```

```isabelle
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

Section 7.6 has a case where `frule` is useful: a quantified assumption that is needed twice.

### Many steps at once: intro and elim {#assumptions-intro}

::: definition The methods intro and elim
`apply (intro r₁ … rₙ)` applies the given introduction rules to subgoal 1, then again to the subgoals
that result, for as long as one of them applies. `apply (elim r₁ … rₙ)` does the same with elimination
rules on assumptions.
:::

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  apply (intro impI conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ B
 2. A ∧ B ⟹ A
```

```isabelle
  apply (elim conjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ B
 2. A ∧ B ⟹ A
```

```isabelle
  apply assumption
  apply (elim conjE)
  apply assumption
  done
```

`intro` applied `impI` and then `conjI`, which split the goal; `elim` took the conjunction apart in
subgoal 1 only. In `imp_chain` above, `apply (intro impI)` would replace the three `rule impI` steps.

### Which method when {#assumptions-which}

| Situation | Kind of rule | Method | Example |
|---|---|---|---|
| The conclusion has a connective to break up | introduction | `rule` | `apply (rule conjI)` |
| An assumption has a connective to take apart | elimination | `erule` | `apply (erule disjE)` |
| An assumption gives a new fact | destruction | `drule`, or `frule` to keep it | `apply (drule mp)` |
| The conclusion is one of the assumptions | none | `assumption` | `apply assumption` |
| Many steps of one kind | introduction or elimination | `intro`, `elim` | `apply (intro impI conjI)` |

These are customary pairings, not restrictions enforced by the method names. `rule` can use an
elimination or destruction theorem backwards too, as `rule conjunct2` already did. Likewise, `erule`
can use a theorem such as `mp` when its first premise and conclusion fit. The methods differ in how
they resolve the theorem against the subgoal and its assumptions.

::: tip
Look at the subgoal before you look for a rule. If you want to attack the main connective of the
conclusion, apply its introduction rule with `rule`. If you want to use an assumption, apply the
elimination rule of its connective with `erule`. Section 7.8 shows what happens when the two are mixed
up.
:::

## Negation and falsity {#negation}

Section 7.1 showed that HOL defines ¬A as A ⟶ False, in the same way as Module 6. The negation rules
follow from that definition:

- `notI`, `(?P ⟹ False) ⟹ ¬ ?P`, is (¬I): to prove ¬A, assume A and derive False.
- `notE`, `⟦¬ ?P; ?P⟧ ⟹ ?R`, is (¬E) when ?R is False, and (¬E) followed by (⊥E) otherwise: from ¬A
  and A, anything follows.
- `FalseE`, `False ⟹ ?P`, is (⊥E).

You use `notE` with `erule`, and its effect is worth remembering: **to use an assumption ¬A, prove A**.
`erule notE` removes ¬A, and whatever the conclusion was, it becomes A. Here is
¬(A ∨ B) ⟶ ¬A ∧ ¬B from Module 6:

```prooftree
¬(A ∨ B) ⟶ ¬A ∧ ¬B   (⟶I¹)
  ¬A ∧ ¬B   (∧I)
    ¬A   (¬I²)
      ⊥   (¬E)
        [¬(A ∨ B)]¹
        A ∨ B   (∨I₁)
          [A]²
    ¬B   (¬I³)
      ⊥   (¬E)
        [¬(A ∨ B)]¹
        A ∨ B   (∨I₂)
          [B]³
```

```isabelle
lemma "¬ (A ∨ B) ⟶ ¬ A ∧ ¬ B"
  apply (rule impI)
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ¬ (A ∨ B) ⟹ ¬ A
 2. ¬ (A ∨ B) ⟹ ¬ B
```

To prove ¬A, assume A and derive False, (¬I²):

```isabelle
  apply (rule notI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦¬ (A ∨ B); A⟧ ⟹ False
 2. ¬ (A ∨ B) ⟹ ¬ B
```

False follows from ¬(A ∨ B) once you show A ∨ B, (¬E):

```isabelle
  apply (erule notE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ A ∨ B
 2. ¬ (A ∨ B) ⟹ ¬ B
```

```isabelle
  apply (rule disjI1)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ B) ⟹ ¬ B
```

The second half is the same with `disjI2`:

```isabelle
  apply (rule notI)
  apply (erule notE)
  apply (rule disjI2)
  apply assumption
  done
```

When False itself is among the assumptions, `erule FalseE` closes the subgoal at once, because `FalseE`
has no other premises:

```isabelle
lemma "False ⟶ A"
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. False ⟹ A
```

```isabelle
  apply (erule FalseE)
  done
```

::: pitfall
`erule` uses the first assumption that fits. With several negated assumptions, `erule notE` takes the
first one, which may not be the one you want. Section 7.7 has a proof where the first one is right, and
Section 7.6 shows how to name the formula you want (Exercise 7.5 needs it).
:::

## Quantifiers and fixed variables {#quantifiers}

### ∀ and fixed variables {#quantifiers-all}

Module 6 proved that a universally quantified conjunction gives two universally quantified formulas:

```prooftree
(∀x. P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x)   (⟶I¹)
  (∀x. P x) ∧ (∀x. Q x)   (∧I)
    ∀x. P x   (∀I)
      P a   (∧E₁)
        P a ∧ Q a   (∀E)
          [∀x. P x ∧ Q x]¹
    ∀x. Q x   (∀I)
      Q a   (∧E₂)
        P a ∧ Q a   (∀E)
          [∀x. P x ∧ Q x]¹
```

::: pitfall
Some books write this formula ∀x.(P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x), with the quantifier applying only
to the bracket after it. In Isabelle, as in Modules 3 and 6, the body of ∀x reaches as far to the right
as possible, so `∀x. (P x ∧ Q x) ⟶ …` would put the whole implication inside the quantifier. Put the
parentheses around the quantifier instead: `(∀x. P x ∧ Q x) ⟶ …`.
:::

```isabelle
lemma "(∀x. P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x)"
  apply (rule impI)
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ∀x. P x ∧ Q x ⟹ ∀x. P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

Subgoal 1 asks for ∀x. P x, so the next step is (∀I):

```isabelle
  apply (rule allI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. ∀x. P x ∧ Q x ⟹ P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

`allI`, `(⋀x. ?P x) ⟹ ∀x. ?P x`, replaced the HOL quantifier ∀x with the Pure quantifier ⋀x. The subgoal
now reads: for an arbitrary x, assuming ∀x. P x ∧ Q x, prove P x. The x inside the assumption is bound by
its own ∀ and is a different variable that happens to have the same name. The x after ⋀ is the arbitrary
one; the paper tree calls it a.

::: definition Fixed variable
A variable bound by ⋀ at the front of a subgoal is a **fixed variable**; Isabelle also calls it a
**parameter**. It stands for an arbitrary value: it belongs to its subgoal alone, and unification never
replaces it. `allI` creates one, and in doing so enforces the eigenvariable condition of (∀I).
:::

Now use the assumption, by (∀E) in its elimination form `allE`:

```isabelle
  apply (erule allE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. P (?x7 x) ∧ Q (?x7 x) ⟹ P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

`allE`, `⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R`, replaced the assumption ∀x. P x ∧ Q x with an instance P t ∧ Q t
for a term t that is not chosen yet. Isabelle writes that term as `?x7 x`: a schematic variable applied
to the fixed variable x. This records that the term may be built from x, since x was fixed before the
unknown was created.

```isabelle
  apply (erule conjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. ⟦P (?x7 x); Q (?x7 x)⟧ ⟹ P x
 2. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀x. P x ∧ Q x ⟹ ∀x. Q x
```

`assumption` unified P (?x7 x) with P x, which makes the term x itself: the instance chosen for (∀E) is
the arbitrary x, as the tree uses a in both places. The second half goes the same way. This time it
uses `spec`, the destruction form of (∀E), through `drule`:

```isabelle
  apply (rule allI)
  apply (drule spec)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x. P (?x13 x) ∧ Q (?x13 x) ⟹ Q x
```

```isabelle
  apply (erule conjE)
  apply assumption
  done
```

::: pitfall
⟹ binds more weakly than ∀. So `∀x. P x ⟹ P x` is not a statement about one x: it means
(∀x. P x) ⟹ P x, and the x of the conclusion is a free variable, unrelated to the bound one. The stored
theorem shows it:

```isabelle
lemma all_inst: "∀x. P x ⟹ P x"
  apply (erule allE)
  apply assumption
  done

thm all_inst
```

```output result
∀x. ?P x ⟹ ?P ?x
```

The x of the conclusion has become `?x`, a separate schematic variable. Here no harm is done, since the
lemma is (∀E) itself. But if you mean "for every x, P x implies P x", write `⋀x. P x ⟹ P x` or
`∀x. P x ⟶ P x`.
:::

### ∃ and the order of steps {#quantifiers-ex}

`exI`, `?P ?x ⟹ ∃x. ?P x`, is (∃I): to prove ∃x. P x, prove P t for some term t, the witness. Used
backwards, it leaves the witness as an unknown, to be settled later by unification. `exE`,
`⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q`, is (∃E): to use ∃x. P x, take a new x for which P x holds. Used with
`erule`, it turns the assumption ∃x. P x into a fixed variable x and an assumption P x.

Module 6's example swaps the quantifiers of ∃x. ∀y. R x y. Read R x y as "key x opens door y": a master
key opens every door, so every door has a key.

```prooftree
(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)   (⟶I¹)
  ∀y. ∃x. R x y   (∀I)
    ∃x. R x b   (∃E²)
      [∃x. ∀y. R x y]¹
      ∃x. R x b   (∃I)
        R a b   (∀E)
          [∀y. R a y]²
```

Read from the bottom: (⟶I), then (∀I) with the eigenvariable b, then (∃E) with the eigenvariable a, then
(∃I) with the witness a, then (∀E) with the instance b. In Isabelle:

```isabelle
lemma ex_all: "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
  apply (rule impI)
  apply (rule allI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y. ∃x. ∀y. R x y ⟹ ∃x. R x y
```

```isabelle
  apply (erule exE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. ∀y. R x y ⟹ ∃x. R x y
```

Two fixed variables now: y, which `allI` fixed (the b of the tree), and x, which `exE` fixed (the a).

```isabelle
  apply (rule exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. ∀y. R x y ⟹ R (?x6 y x) y
```

The witness is an unknown applied to both fixed variables: it may be built from y and from x.

```isabelle
  apply (erule allE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. R x (?y8 y x) ⟹ R (?x6 y x) y
```

```isabelle
  apply assumption
  done
```

`assumption` made the two sides of ⟹ identical, by taking x as the witness and y as the instance of ∀y.

### Fix first, guess later {#quantifiers-order}

What if you introduce the existential quantifier before eliminating the other one? Apply `exI` before
`exE`:

```isabelle
lemma "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
  apply (rule impI)
  apply (rule allI)
  apply (rule exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y. ∃x. ∀y. R x y ⟹ R (?x4 y) y
```

```isabelle
  apply (erule exE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. ∀y. R x y ⟹ R (?x4 y) y
```

```isabelle
  apply (erule allE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y
```

The witness is now `?x4 y`. It was created when only y was fixed, so it may be built from y but not from
x, which `exE` fixed afterwards. To close the subgoal, Isabelle would have to make the two sides of ⟹
identical, and that needs the witness to be x. Unification may not do that, so `assumption` fails:

```isabelle fails
  apply assumption
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. ⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y
```

This direct rule sequence has blocked the intended `assumption` step. For this proof, restart with
`exE` before `exI`, so that the witness can depend on the named master key:

```isabelle
  oops
```

On paper, this attempted tree would use the eigenvariable a as an existential witness outside the
scope of its (∃E). That violates the side condition. Isabelle's refusal to instantiate `?x4 y` with
the later fixed x enforces the same scope restriction. This does not prove that no HOL method could
solve the remaining schematic goal: HOL's choice operator can express a master key without referring
to that local name. The point is the dependency required by this particular rule-by-rule proof.

::: keyidea
**Fix first, guess later.** `rule allI` and `erule exE` fix variables; `rule exI`, `erule allE` and
`drule spec` create unknowns. An unknown can only become a term built from variables that were fixed
before it was created, as recorded by its arguments in the displayed subgoal. Context parameters and
constants remain available too. Fixing variables first is a useful strategy for these proofs, rather
than a requirement on every possible HOL proof. This is the advice of Section 6.7, to open existential assumptions first and then choose
instances and witnesses, and Isabelle's unknowns show why it works.
:::

For a statement that is not valid, no order works. The converse, (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y), says
that if every door has a key, there is a master key. [Section 6.6](module_06_EN.html#quantifiers) gave a
countermodel, and Exercise 7.9 lets you watch the attempt get stuck.

### Choosing an instance yourself {#quantifiers-inst}

Unification finds a witness only when the goal shows what it must be. Here it does not:

```isabelle
lemma "∃n::nat. n + n = 6"
  apply (rule exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ?n + ?n = 6
```

No assumption fixes `?n`, and `simp` (Module 1) does not solve this equation by searching for a
numerical witness:

```isabelle fails
  apply simp
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. ?n + ?n = 6
```

```isabelle
  oops
```

Name the witness yourself:

```isabelle
lemma "∃n::nat. n + n = 6"
  apply (rule_tac x = 3 in exI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. 3 + 3 = 6
```

```isabelle
  apply simp
  done
```

::: definition The methods rule_tac, erule_tac, drule_tac and frule_tac
`apply (rule_tac x = t in r)` applies the rule r as `rule` does, after replacing its schematic variable
`?x` with the term t. Name the variable as `thm r` shows it, without the question mark, and put t in
quotation marks unless it is a single name or number; several instantiations are separated by `and`.
`erule_tac`, `drule_tac` and `frule_tac` work in the same way. Alternatively, instantiate the rule with
`of` (Section 7.2) and apply the result: `apply (rule exI[of _ 3])`, where `_` skips ?P.
:::

Unification can also choose wrongly. Here is a small invariant argument: if every step from a safe
state leads to a safe state, and s is safe, then two steps from s lead to a safe state.

```isabelle
lemma "⟦∀x. safe x ⟶ safe (step x); safe s⟧ ⟹ safe (step (step s))"
  apply (frule spec)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦∀x. safe x ⟶ safe (step x); safe s; safe ?x ⟶ safe (step ?x)⟧
    ⟹ safe (step (step s))
```

The quantified assumption is needed twice, once for each step, so `frule spec` keeps it while adding an
instance with an unknown `?x`. `erule impE` uses that instance; its premise `safe ?x` becomes subgoal 1,
which `assumption` closes with ?x = s:

```isabelle
  apply (erule impE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦∀x. safe x ⟶ safe (step x); safe s; safe (step s)⟧
    ⟹ safe (step (step s))
```

For the second step, the same three methods:

```isabelle
  apply (erule allE)
  apply (erule impE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦safe s; safe (step s); safe (step s)⟧ ⟹ safe (step (step s))
```

This time `assumption` had two candidates for `safe ?x`: safe s and safe (step s). It took the first,
so the unknown became s again, and the proof is stuck: no assumption says safe (step (step s)).

```isabelle
  oops
```

Tell Isabelle which instance you want:

```isabelle
lemma safe_twice: "⟦∀x. safe x ⟶ safe (step x); safe s⟧ ⟹ safe (step (step s))"
  apply (frule spec)
  apply (erule impE)
  apply assumption
  apply (erule_tac x = "step s" in allE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦safe s; safe (step s); safe (step s) ⟶ safe (step (step s))⟧
    ⟹ safe (step (step s))
```

```isabelle
  apply (erule impE)
  apply assumption
  apply assumption
  done
```

Arguments of this kind, about every state a system can reach, return in Module 13.

## Classical reasoning and equality {#classical}

### Proof by contradiction {#classical-raa}

The explicit natural-deduction rules used so far have intuitionistic counterparts; none is (RAA).
This does not make the underlying HOL theory intuitionistic or classify every library fact used by
automation as constructive. Module 6 explained that some
tautologies cannot be derived without (RAA) ([Section 6.5](module_06_EN.html#classical)), and A ∨ ¬A, the
law of excluded middle, is the standard example. Try it without:

```isabelle
lemma "A ∨ ¬ A"
  apply (rule disjI1)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A
```

A is not provable: nothing is known about A. `disjI2` would leave ¬A, which is no better. Abandon the
attempt:

```isabelle
  oops
```

The way out is (RAA), which in Isabelle is `ccontr`. Here is the derivation from Section 6.5:

```prooftree
A ∨ ¬A   (RAA¹)
  ⊥   (¬E)
    [¬(A ∨ ¬A)]¹
    A ∨ ¬A   (∨I₂)
      ¬A   (¬I²)
        ⊥   (¬E)
          [¬(A ∨ ¬A)]¹
          A ∨ ¬A   (∨I₁)
            [A]²
```

```isabelle
lemma "A ∨ ¬ A"
  apply (rule ccontr)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ ¬ A) ⟹ False
```

(RAA¹): assume the negation, and derive False. The next step is the (¬E) at the bottom of the tree,
used backwards:

```isabelle
  apply (rule notE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ¬ (A ∨ ¬ A) ⟹ ¬ ?P2
 2. ¬ (A ∨ ¬ A) ⟹ ?P2
```

To derive False, find a formula `?P2` such that both ¬?P2 and ?P2 hold. This step uses `rule notE`, not
`erule notE`, because the assumption ¬(A ∨ ¬A) is needed again further up the tree, and `erule` would
remove it.

```isabelle
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ ¬ A) ⟹ A ∨ ¬ A
```

Subgoal 1 unified with the assumption, which set ?P2 to A ∨ ¬A: that is the leaf [¬(A ∨ ¬A)]¹. The rest
follows the tree: (∨I₂), (¬I²), (¬E) and (∨I₁).

```isabelle
  apply (rule disjI2)
  apply (rule notI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦¬ (A ∨ ¬ A); A⟧ ⟹ False
```

```isabelle
  apply (erule notE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ⟹ A ∨ ¬ A
```

```isabelle
  apply (rule disjI1)
  apply assumption
  done
```

The first three steps, `rule ccontr`, `rule notE` and `assumption`, together do the work of a single
rule, `classical`, `(¬ ?P ⟹ ?P) ⟹ ?P`: assume the negation of the goal, and prove the goal itself.

```isabelle
lemma "A ∨ ¬ A"
  apply (rule classical)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (A ∨ ¬ A) ⟹ A ∨ ¬ A
```

```isabelle
  apply (rule disjI2)
  apply (rule notI)
  apply (erule notE)
  apply (rule disjI1)
  apply assumption
  done
```

The library has this law already, with the disjuncts the other way round:

```isabelle
thm excluded_middle
```

```output result
¬ ?P ∨ ?P
```

### A De Morgan law {#classical-demorgan}

Of the four directions of De Morgan's laws, Section 6.5 stated that one needs (RAA):
¬(A ∧ B) ⟶ ¬A ∨ ¬B. The idea: suppose ¬A ∨ ¬B were false. Then A would have to hold, since otherwise
¬A ∨ ¬B would; and B likewise. But A ∧ B contradicts ¬(A ∧ B).

```prooftree
¬(A ∧ B) ⟶ ¬A ∨ ¬B   (⟶I¹)
  ¬A ∨ ¬B   (RAA²)
    ⊥   (¬E)
      [¬(A ∧ B)]¹
      A ∧ B   (∧I)
        A   (RAA³)
          ⊥   (¬E)
            [¬(¬A ∨ ¬B)]²
            ¬A ∨ ¬B   (∨I₁)
              [¬A]³
        B   (RAA⁴)
          ⊥   (¬E)
            [¬(¬A ∨ ¬B)]²
            ¬A ∨ ¬B   (∨I₂)
              [¬B]⁴
```

```isabelle
lemma de_morgan_and: "¬ (A ∧ B) ⟶ ¬ A ∨ ¬ B"
  apply (rule impI)
  apply (rule ccontr)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦¬ (A ∧ B); ¬ (¬ A ∨ ¬ B)⟧ ⟹ False
```

```isabelle
  apply (erule notE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (¬ A ∨ ¬ B) ⟹ A ∧ B
```

`erule notE` took the first negated assumption, ¬(A ∧ B), and left its opposite, A ∧ B, to prove: the
(¬E) at the bottom of the tree, with [¬(A ∧ B)]¹ as its first premise. Each half of A ∧ B is another
proof by contradiction:

```isabelle
  apply (rule conjI)
  apply (rule ccontr)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦¬ (¬ A ∨ ¬ B); ¬ A⟧ ⟹ False
 2. ¬ (¬ A ∨ ¬ B) ⟹ B
```

```isabelle
  apply (erule notE)
  apply (rule disjI1)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ¬ (¬ A ∨ ¬ B) ⟹ B
```

```isabelle
  apply (rule ccontr)
  apply (erule notE)
  apply (rule disjI2)
  apply assumption
  done
```

The other three directions of the De Morgan laws need no classical rule; Exercise 7.5 asks you to prove
two of them.

### Equality {#classical-eq}

`refl`, `?t = ?t`, is (=I), and `subst`, `⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t`, is (=E): if s = t and some property
holds of s, it holds of t. The property `?P` is a schematic variable of function type, which unification
fills in with a function. Module 6 derived symmetry from these two rules ([Section
6.8](module_06_EN.html#equality)), with x = s as P x. Written as a rule, from s = t to t = s, the
derivation is:

```prooftree
t = s   (=E)
  s = t
  s = s   (=I)
```

Here (=E) uses the property "equal to s": it holds of s, so it holds of t.

```isabelle
lemma "s = t ⟹ t = s"
  apply (erule subst)
```

```output state
proof (prove)
goal (1 subgoal):
 1. s = s
```

`erule` unified the major premise `?s = ?t` with the assumption s = t, and the conclusion `?P t` with
t = s. For the second, Isabelle had to find a property ?P such that ?P t is t = s. The new subgoal shows
which one it chose: the property "equal to s", since the remaining premise ?P s has become s = s.
`refl` proves it:

```isabelle
  apply (rule refl)
  done
```

In everyday proofs you rarely use `subst` by hand, because the simplifier rewrites with equations
automatically (Module 9). But `subst` is what such rewriting means in natural deduction.

### Equivalence {#classical-iff}

For ⟷, `iffI` turns one goal into two implications. Notice how Isabelle prints the goal:

```isabelle
lemma "A ∧ B ⟷ B ∧ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. (A ∧ B) = (B ∧ A)
```

On formulas, ⟷ and = are the same, and Isabelle prints both as =. `iffI` gives the two directions:

```isabelle
  apply (rule iffI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ∧ B ⟹ B ∧ A
 2. B ∧ A ⟹ A ∧ B
```

Each subgoal is the swap lemma again, without the implication:

```isabelle
  apply (erule conjE)
  apply (rule conjI)
  apply assumption
  apply assumption
  apply (erule conjE)
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

To use an equivalence that you have, `iffD1` and `iffD2` act like `mp` in either direction.

## When a step fails {#errors}

Any step can fail, and Isabelle's messages are short. This section collects the ones you will meet,
with their causes and fixes. Isabelle marks the step that failed and shows the proof state it was given.
The steps before it are not affected, so you can replace the failing step with another.

### Failed to apply proof method {#errors-apply}

This is the most common message. It means that the method could do nothing with subgoal 1: for `rule`,
the conclusion of the rule does not unify with the conclusion of the subgoal; for `erule`, either that or
no assumption fits the rule's major premise; for `drule` and `frule`, no assumption fits the major
premise; for `assumption`, no assumption unifies with the conclusion. Isabelle shows the proof state it
was given. Here is the early choice of a side that Module 6 warned about (Section 6.4), followed by a
hopeful `assumption`:

```isabelle fails
lemma "A ∨ ¬ A"
  apply (rule disjI1)
  apply assumption
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. A
```

`disjI1` left the subgoal A, which has no assumptions at all, so `assumption` has nothing to unify with.
Three other causes are common. Each gives the same message, followed by the proof state as it was before
the failing step.

**Taking an assumption apart before it is one.** In the goal A ∧ B ⟶ B ∧ A, the conjunction A ∧ B is
not an assumption; it is part of the implication, so `erule conjE` finds nothing to work on:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (erule conjE)
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. A ∧ B ⟶ B ∧ A
```

Apply `impI` first: it moves A ∧ B into the assumptions.

**Expecting assumption to look inside a formula.** After `impI` and `conjI`, subgoal 1 is A ∧ B ⟹ B. B
is part of the assumption, but it is not the assumption, so `assumption` fails:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (rule conjI)
  apply assumption
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (2 subgoals):
***  1. A ∧ B ⟹ B
***  2. A ∧ B ⟹ A
```

`assumption` only unifies whole formulas. Take the assumption apart first, with `erule conjE`.

**Using a rule for the wrong connective.** `disjI1` concludes a disjunction, but the conclusion of the
subgoal A ∧ B ⟹ B ∧ A is a conjunction:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (rule disjI1)
  done
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. A ∧ B ⟹ B ∧ A
```

When in doubt, look the rule up with `thm`: for `rule`, its conclusion must unify with the conclusion
of the subgoal. A fixed connective must match, but a schematic conclusion such as `?P` can match
different shapes. The rule need not display the goal's connective before instantiation.

### Undefined fact {#errors-name}

A misspelt rule name gives a different message. Many rule names end in a capital I, which looks much
like a lower-case l:

```isabelle fails
lemma "A ∧ B ⟶ B ∧ A"
  apply (rule impI)
  apply (rule conjl)
  done
```

```output
*** Undefined fact: "conjl"⌂
```

### Failed to finish proof {#errors-done}

`done` fails if subgoals remain, and lists them. Take the same early choice as above and write `done`
straight after it:

```isabelle fails
lemma "A ∨ ¬ A"
  apply (rule disjI1)
  done
```

```output
*** Failed to finish proof:
*** goal (1 subgoal):
***  1. A
```

`done` never proves anything itself, not even a subgoal whose conclusion is one of its assumptions. Add
the missing steps or, if the subgoal left is unprovable, as here, go back and choose differently. (A
one-line proof `by m`, as in `by blast`, behaves a little differently: after the method m, it closes the
subgoals that are left by assumption, and reports Failed to finish proof only if something else
remains.)

### Forgetting done {#errors-forget}

Without `done`, the proof is still open when the next command arrives, and the next lemma is refused:

```isabelle fails
lemma "A ⟶ A"
  apply (rule impI)
  apply assumption

lemma "B ⟶ B"
```

```output
*** Bad context for command "lemma"⌂
```

A lemma cannot start inside a proof. Add `done` after the last `apply`. If the unfinished proof is the
last one in the theory, `end` is refused instead, with the message "Illegal application of proof command
in "prove" mode".

### A detour, not an error: rule instead of erule {#errors-rule}

Some mistakes produce no error at all, only a strange proof state. Applying an elimination rule with
`rule` instead of `erule` is the usual one:

```isabelle
lemma "A ∨ B ⟶ B ∨ A"
  apply (rule impI)
  apply (rule disjE)
```

```output state
proof (prove)
goal (3 subgoals):
 1. A ∨ B ⟹ ?P2 ∨ ?Q2
 2. ⟦A ∨ B; ?P2⟧ ⟹ B ∨ A
 3. ⟦A ∨ B; ?Q2⟧ ⟹ B ∨ A
```

`rule` unified only the conclusion ?R of `disjE` with B ∨ A. The major premise became subgoal 1, so
Isabelle asks you to prove some disjunction it does not know yet, and the two cases speak of unknown
formulas. `apply assumption` would repair this by unifying the unknown disjunction with A ∨ B, and the
result would be the `erule` version with the assumption A ∨ B kept in both cases. Use `erule` from the
start.

```isabelle
  oops
```

::: trouble
- **Failed to apply proof method**: the rule does not fit subgoal 1, or no assumption fits its major
  premise. Check the main connective; use `impI` before taking an assumption apart; read the rule with
  `thm`.
- **Undefined fact**: a misspelt rule name, such as `conjl` for `conjI`.
- **Failed to finish proof**: subgoals remain at `done`; they are listed.
- **Bad context for command "lemma"**: the previous proof has no `done`.
- **Inner syntax error … Failed to parse prop**: a mistake in the statement itself, such as ⟹ inside a
  formula (Section 7.1).
- **A subgoal that cannot be closed, with unknowns such as `?x4 y`**: a quantifier rule came too early.
  Fix variables before you create unknowns (Section 7.6).
:::

## Letting Isabelle search: blast and auto {#blast}

Module 6 ended by letting `blast` prove its derivations ([Section 6.9](module_06_EN.html#isabelle)). You
have now done by hand what `blast` does automatically. `blast` belongs to Isabelle's **classical
reasoner**, a family of proof methods built on natural-deduction rules. It applies introduction and
elimination rules like the ones in this module: the safe ones of Section 6.7 freely, the others as
choices. When a choice leads nowhere, it can go back and try another, within its search bounds.
It may find a complete proof, fail, or hit a resource limit. The examples below take a single call:

```isabelle
lemma "¬ (A ∧ B) ⟶ ¬ A ∨ ¬ B"
  by blast

lemma "(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)"
  by blast

lemma "⟦∀x. safe x ⟶ safe (step x); safe s⟧ ⟹ safe (step (step s))"
  by blast
```

`blast` found the instance step s that unification alone got wrong in Section 7.6: when one choice
fails, it tries another. And whatever `blast` finds, the theorem is built by Isabelle's kernel from the
rules of the logic. As Module 1 explains, this guarantee concerns ordinary reconstructed proofs,
relative to the theory's axioms and trusted infrastructure; admissions and oracle methods introduce
different evidence.

When the statement is not valid, `blast` fails, as Section 6.9 showed for the master key:

```isabelle fails
lemma "(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)
```

With `by`, Isabelle calls the method the *initial* proof method, so the message says only that `blast`
found no proof. It does not say whether the statement is false or too hard for `blast`; `nitpick`
(Modules 2 and 3) can look for a counterexample. `auto` behaves differently: it does what it can and
shows you what is left.

```isabelle
lemma "(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)"
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀y. ∃x. R x y ⟹ ∃x. ∀y. R x y
```

```isabelle
  oops
```

`auto` turned the implication into an assumption and stopped there. `auto` combines classical reasoning
with the simplifier, and leaves the subgoals it cannot prove; Module 9 covers it in depth. `blast` does
not invoke the simplifier and knows little about equality, but *Programming and Proving in Isabelle/HOL* calls it "the
method of choice for complex logical goals".

So which should you use? For routine logic, `blast` or `auto`. But automation fails often enough, on
goals that are too big or not quite true, and then the manual steps are how you find out why: apply a
few rules by hand, look at the subgoals, and call `blast` on the pieces, or discover that one of them
cannot be proved. That is why this module did everything by hand first.

::: tip
A good routine when `blast` fails: apply the obvious introduction rules with `intro` (`impI`, `allI`,
`conjI`, …) and take apart the obvious assumptions with `elim` (`conjE`, `exE`, …). Then try `blast` on
each subgoal. A subgoal that looks false is a hint that the whole statement may be false; try `nitpick`
on the lemma.
:::

## What you learned {#summary}

- Isabelle has two levels of logic: the meta-logic **Pure**, with ⟹, ⋀ and ≡, in which rules and goals
  are written, and the object logic **HOL**, with ¬ ∧ ∨ ⟶ ∀ ∃ and =, in which formulas are written.
- A rule is a theorem: `thm conjI` shows `⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q`. **Schematic variables** such as `?P` can
  be instantiated by terms of the appropriate type and permitted variable dependencies: by
  **unification** automatically, or by hand with `of` and `rule_tac`.
- Each rule of Module 6 has an Isabelle name: `conjI`, `conjunct1`, `conjunct2`, `conjE`, `disjI1`,
  `disjI2`, `disjE`, `impI`, `mp`, `impE`, `notI`, `notE`, `FalseE`, `allI`, `spec`, `allE`, `exI`,
  `exE`, `ccontr`, `classical`, `refl` and `subst`.
- A proof script builds the paper tree from the root: `rule` matches a rule's conclusion against the
  goal; `erule`, `drule` and `frule` resolve rules against assumptions in different ways;
  `assumption` closes a branch; `intro` and `elim` repeat; `done` checks that nothing is left.
- `allI` and `exE` create **fixed variables** (⋀x), which enforce the eigenvariable conditions; `exI`,
  `allE` and `spec` create unknowns. Fix first, guess later.
- Classical proofs use `ccontr`, which is (RAA), or `classical`.
- The common messages are Failed to apply proof method, Undefined fact, Failed to finish proof and Bad
  context for command.
- `blast` searches with the same rules and either succeeds or fails; `auto` shows what it could not
  prove.

## Exercises {#exercises}

:::: exercise Read a rule {#ex-7-1} ★
`thm impE` prints `⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R`.

1. Which premise is the major premise?
2. Which premise has an assumption of its own, and what is it?
3. Draw the rule as a paper rule, in the style of Module 6.
4. With which method do you normally use `impE`? What does it do to the subgoal ⟦A ⟶ B; A⟧ ⟹ C?

::: solution
1. `?P ⟶ ?Q`: it contains the connective that the rule eliminates.
2. The third, `?Q ⟹ ?R`: while proving ?R you may assume ?Q.
3. As a paper rule, with the discharged assumption marked:

   $$
   \dfrac{\begin{matrix}\\ \\ P \imp Q\end{matrix} \qquad \begin{matrix}\\ \\ P\end{matrix} \qquad \begin{matrix}[Q]^1\\ \vdots\\ R\end{matrix}}{R}\;(\mathrm{impE}^1)
   $$

4. With `erule`. It removes the assumption A ⟶ B and leaves two subgoals: prove A, and then prove C
   with B as an extra assumption.

   ```isabelle
   lemma "⟦A ⟶ B; A⟧ ⟹ C"
     apply (erule impE)
   ```

   ```output state
   proof (prove)
   goal (2 subgoals):
    1. A ⟹ A
    2. ⟦A; B⟧ ⟹ C
   ```

   The first subgoal is closed by `assumption`; the second cannot be proved, because C is unrelated to A
   and B, so abandon the attempt:

   ```isabelle
     oops
   ```
:::
::::

:::: exercise From tree to script {#ex-7-2} ★
Write an apply script that follows this tree step by step. Say which command closes which leaf. Then check
your script in Isabelle.

```prooftree
A ⟶ B ⟶ A ∧ B   (⟶I¹)
  B ⟶ A ∧ B   (⟶I²)
    A ∧ B   (∧I)
      [A]¹
      [B]²
```

::: solution
Two `impI` steps for (⟶I¹) and (⟶I²), one `conjI` step for (∧I), and one `assumption` for each leaf:

```isabelle
lemma "A ⟶ B ⟶ A ∧ B"
  apply (rule impI)
  apply (rule impI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦A; B⟧ ⟹ A ∧ B
```

```isabelle
  apply (rule conjI)
  apply assumption
  apply assumption
  done
```

The first `assumption` closes the leaf [A]¹ (subgoal 1 is A), the second closes [B]².
:::
::::

:::: exercise Which method? {#ex-7-3} ★
For each subgoal, name the first step you would take (method and rule), and say what is left after it.
Then finish each proof in Isabelle.

1. `⟦A; B⟧ ⟹ B ∧ A`
2. `A ∧ B ⟹ B`
3. `¬ A ⟹ A ⟶ B`
4. `∀x. P x ⟹ P c`
5. `P c ⟹ ∃x. P x`

::: solution
1. `rule conjI` leaves B and A, each closed by `assumption`.
2. `erule conjE` leaves ⟦A; B⟧ ⟹ B, closed by `assumption`.
3. `rule impI` leaves ⟦¬ A; A⟧ ⟹ B. Then `erule notE` turns the goal into A, closed by `assumption`.
4. `erule allE` replaces the assumption with an instance P t, where t is an unknown, and `assumption`
   sets t to c. (`drule spec` works too.)
5. `rule exI` leaves P t to prove, with an unknown witness t, and `assumption` sets t to c.

```isabelle
lemma "⟦A; B⟧ ⟹ B ∧ A"
  apply (rule conjI)
  apply assumption
  apply assumption
  done

lemma "A ∧ B ⟹ B"
  apply (erule conjE)
  apply assumption
  done

lemma "¬ A ⟹ A ⟶ B"
  apply (rule impI)
  apply (erule notE)
  apply assumption
  done

lemma "∀x. P x ⟹ P c"
  apply (erule allE)
  apply assumption
  done

lemma "P c ⟹ ∃x. P x"
  apply (rule exI)
  apply assumption
  done
```
:::
::::

:::: exercise Currying {#ex-7-4} ★★
Exercise 6.4 derived these two formulas on paper. Prove them in Isabelle with `rule`, `erule`, `drule` and
`assumption`:

1. `(A ⟶ B ⟶ C) ⟶ (A ∧ B ⟶ C)`
2. `(A ∧ B ⟶ C) ⟶ (A ⟶ B ⟶ C)`

::: solution
In the first, take the conjunction apart and use the nested implication twice, with `drule mp`:

```isabelle
lemma "(A ⟶ B ⟶ C) ⟶ (A ∧ B ⟶ C)"
  apply (rule impI)
  apply (rule impI)
  apply (erule conjE)
  apply (drule mp)
  apply assumption
  apply (drule mp)
  apply assumption
  apply assumption
  done
```

In the second, `erule impE` asks you to prove A ∧ B, which `conjI` splits:

```isabelle
lemma "(A ∧ B ⟶ C) ⟶ (A ⟶ B ⟶ C)"
  apply (rule impI)
  apply (rule impI)
  apply (rule impI)
  apply (erule impE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦A; B⟧ ⟹ A ∧ B
 2. ⟦A; B; C⟧ ⟹ C
```

```isabelle
  apply (rule conjI)
  apply assumption
  apply assumption
  apply assumption
  done
```
:::
::::

:::: exercise Two De Morgan laws without RAA {#ex-7-5} ★★
Exercise 6.5 and Section 6.5 derived `¬ A ∨ ¬ B ⟶ ¬ (A ∧ B)` and `¬ A ∧ ¬ B ⟶ ¬ (A ∨ B)` on paper. Prove
both in Isabelle without `ccontr` or `classical`. In the second you will meet the pitfall of Section 7.5:
`erule notE` takes the first negated assumption. Name the one you want with `erule_tac P = B in notE`
(the variable of `notE` is called P).

::: solution
```isabelle
lemma "¬ A ∨ ¬ B ⟶ ¬ (A ∧ B)"
  apply (rule impI)
  apply (rule notI)
  apply (erule conjE)
  apply (erule disjE)
  apply (erule notE)
  apply assumption
  apply (erule notE)
  apply assumption
  done
```

In the second law, the case split leaves two subgoals with both ¬A and ¬B among the assumptions:

```isabelle
lemma "¬ A ∧ ¬ B ⟶ ¬ (A ∨ B)"
  apply (rule impI)
  apply (erule conjE)
  apply (rule notI)
  apply (erule disjE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⟦¬ A; ¬ B; A⟧ ⟹ False
 2. ⟦¬ A; ¬ B; B⟧ ⟹ False
```

In the first case, ¬A is the right one, and it comes first. In the second case, `erule notE` would take
¬A again and leave A to prove, which is impossible; choose ¬B instead:

```isabelle
  apply (erule notE)
  apply assumption
  apply (erule_tac P = B in notE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦¬ A; B⟧ ⟹ B
```

```isabelle
  apply assumption
  done
```
:::
::::

:::: exercise Write access {#ex-7-6} ★★
In an access-control policy, every administrator may write. Prove that whoever may not write is not an
administrator:

`(∀u. admin u ⟶ can_write u) ⟶ (∀u. ¬ can_write u ⟶ ¬ admin u)`

Plan the order of the quantifier steps first: which rule fixes a variable, and which creates an
unknown?

::: solution
`allI` fixes u in the conclusion, and `allE` creates an unknown instance of the assumption. Fix first:

```isabelle
lemma "(∀u. admin u ⟶ can_write u) ⟶ (∀u. ¬ can_write u ⟶ ¬ admin u)"
  apply (rule impI)
  apply (rule allI)
  apply (rule impI)
  apply (rule notI)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀u. ⟦∀u. admin u ⟶ can_write u; ¬ can_write u; admin u⟧ ⟹ False
```

```isabelle
  apply (erule allE)
  apply (erule impE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀u. ⟦¬ can_write u; admin u; can_write u⟧ ⟹ False
```

`assumption` instantiated the unknown with the fixed u, which is possible because u was fixed first.

```isabelle
  apply (erule notE)
  apply assumption
  done
```
:::
::::

:::: exercise Splitting an existential {#ex-7-7} ★★
Prove `(∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)`, which Exercise 6.6 derived on paper. Then explain in a
sentence or two, in terms of fixed variables and unknowns, why the converse,
`(∃x. P x) ∧ (∃x. Q x) ⟶ (∃x. P x ∧ Q x)`, cannot be proved.

::: solution
```isabelle
lemma "(∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)"
  apply (rule impI)
  apply (erule exE)
  apply (erule conjE)
  apply (rule conjI)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀x. ⟦P x; Q x⟧ ⟹ ∃x. P x
 2. ⋀x. ⟦P x; Q x⟧ ⟹ ∃x. Q x
```

```isabelle
  apply (rule exI)
  apply assumption
  apply (rule exI)
  apply assumption
  done
```

The converse is not valid: P could be "is even" and Q "is odd" on the natural numbers. Both have
witnesses, but no number is both. In a proof attempt, the two `exE` steps fix two different variables,
one with P and one with Q, and the single unknown witness of `exI` cannot become both: unification never
makes two different fixed variables equal. Different names do not assert different values; rather,
we have no equality that lets us treat these arbitrary witnesses as the same. This is the broken eigenvariable condition of Exercise 6.6 in
Isabelle's form.
:::
::::

:::: exercise Peirce's law {#ex-7-8} ★★★
Exercise 6.8 derived Peirce's law, ((A ⟶ B) ⟶ A) ⟶ A, on paper with (RAA). Turn that derivation into an
apply script with `ccontr`, following the tree step by step, and say which step does the work of (⊥E).
Then shorten the script with `classical`.

::: solution
At the bottom of the tree of Exercise 6.8 are (⟶I¹), (RAA²) and (¬E) with the premises [¬A]² and A. As in
Section 7.7, `rule ccontr`, `rule notE` and `assumption` take the last two steps and leave A to prove:

```isabelle
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  apply (rule impI)
  apply (rule ccontr)
  apply (rule notE)
  apply assumption
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦(A ⟶ B) ⟶ A; ¬ A⟧ ⟹ A
```

A comes from the assumption (A ⟶ B) ⟶ A by (⟶E), which needs A ⟶ B:

```isabelle
  apply (erule impE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ¬ A ⟹ A ⟶ B
 2. ⟦¬ A; A⟧ ⟹ A
```

To prove A ⟶ B, assume A (⟶I³). The goal is then B, and `erule notE` turns it into A, using ¬A:

```isabelle
  apply (rule impI)
  apply (erule notE)
```

```output state
proof (prove)
goal (2 subgoals):
 1. A ⟹ A
 2. ⟦¬ A; A⟧ ⟹ A
```

This single `erule notE` does the work of both (¬E) and (⊥E) in the tree, because `notE` concludes any
formula, here B. Both subgoals left are assumptions:

```isabelle
  apply assumption
  apply assumption
  done
```

With `classical`, the three steps after `impI` become one:

```isabelle
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  apply (rule impI)
  apply (rule classical)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⟦(A ⟶ B) ⟶ A; ¬ A⟧ ⟹ A
```

```isabelle
  apply (erule impE)
  apply (rule impI)
  apply (erule notE)
  apply assumption
  apply assumption
  done
```
:::
::::

:::: exercise A proof that must fail {#ex-7-9} ★★★
Section 6.7 showed that a backward search for (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y) never closes. Watch it
happen in Isabelle: apply the quantifier rules in the best order you can find, and show the state where
you get stuck. Then explain, with fixed variables and unknowns, why no order can work.

::: solution
Direct introduction of the conclusion's ∃x uses `exI`, and it creates the unknown
witness before anything is fixed:

```isabelle
lemma "(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)"
  apply (rule impI)
  apply (rule exI)
  apply (rule allI)
  apply (erule allE)
  apply (erule exE)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y x. R x (?y6 y) ⟹ R ?x2 y
```

```isabelle
  oops
```

To close the subgoal, R x (?y6 y) and R ?x2 y must become identical. The instance ?y6 y can become y,
because `allI` fixed y before `allE` created ?y6. But the witness ?x2 would have to become x, which `exE`
fixed after `exI` created ?x2, and that is not allowed. Taking the assumption apart first only moves the
problem: `erule allE` and `erule exE` then fix x before the witness is created, so the witness can become
x, but the instance of ∀y is created before `allI` fixes y, so it cannot become y. One unknown is always
created too early. The y of the conclusion can only be fixed after the witness is created, since its ∀y
lies inside ∃x; and the x of the assumption can only be fixed after the instance is created, since its ∃x
lies inside ∀y.

This is the never-ending search of Section 6.7 in Isabelle's terms: each new door needs a new key. The
formula is not valid (Section 6.6 gives a countermodel), so no order could have worked; the conditions
that make Isabelle refuse these unifications are what keep its proofs sound.
:::
::::

## Check yourself {#quiz}

```quiz
? In the subgoal `⟦A ⟶ B; A⟧ ⟹ B`, what does ⟹ say?
- [ ] That the formula (A ⟶ B) ∧ A ⟶ B has already been proved
- [x] That B must be proved, and A ⟶ B and A may be used as assumptions
- [ ] That A ⟶ B and A are the conclusions of the subgoal
- [ ] Nothing more than ⟶: Isabelle prints the two arrows differently only for display
> ⟹ is Pure's "from … infer". Left of it are the assumptions of the subgoal, right of it the conclusion still to be proved.

? `thm exI` prints `?P ?x ⟹ ∃x. ?P x`. What does the question mark in `?x` mean?
- [ ] That x is optional
- [ ] That x is a fixed variable of the current subgoal
- [x] That ?x is schematic: it may be instantiated by a term of the right type and permitted scope
- [ ] That x has not been defined
> Schematic variables are placeholders constrained by types and scope. Isabelle fills them in by unification, or you choose them with `of` or `rule_tac`; a later local variable cannot escape through an earlier unknown.

? The subgoal is `A ∨ B ⟹ B ∨ A`. Which step performs (∨E) on the assumption, leaving one subgoal per case?
- [ ] `apply (rule disjI1)`
- [ ] `apply (rule disjE)`
- [ ] `apply (drule disjI2)`
- [x] `apply (erule disjE)`
> `erule` matches the major premise A ∨ B with the assumption and leaves the two cases. `rule disjE` leaves three subgoals with unknown formulas.

? After `apply (rule allI)` the subgoal reads `⋀x. ∀x. P x ∧ Q x ⟹ P x`. What is the x after ⋀?
- [x] A fixed variable: it stands for an arbitrary value and unification never replaces it
- [ ] A schematic variable that unification will choose later
- [ ] The same variable as the x bound by ∀ in the assumption
- [ ] A constant from Isabelle's library
> `allI` turns the HOL quantifier into Pure's ⋀. The fixed variable is what Module 6 called the eigenvariable.

? A proof is stuck at `⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y`, and `apply assumption` fails. Why?
- [ ] The relation R would have to be reflexive
- [x] The unknown ?x4 was created before x was fixed, so it cannot become x
- [ ] `assumption` cannot handle two fixed variables
- [ ] The statement being proved is false
> The statement is valid (it is `ex_all`), but `exI` came before `exE`. Fix first, guess later.

? `by blast` reports "Failed to apply initial proof method". What do you know?
- [ ] The statement is false
- [ ] `blast` needs a `done` after it
- [x] `blast` found no proof; the statement may be false, or too hard for `blast`
- [ ] The kernel rejected a proof that `blast` found
> `blast` either finds a complete proof or fails. A failure says nothing about truth; use `nitpick` to look for a counterexample, or apply some rules by hand.
```
