---
title: Troubleshooting
lead: Isabelle's messages that beginners meet most often, grouped by what you were doing, each with what it means, its usual causes and the fix. Search this page for a few words of your message (Ctrl+F, or Cmd+F on a Mac).
---

## Before anything else {#first}

1. **Put the cursor on the line with the red underline** and read the whole message in the **Output**
   panel. If there are several errors, fix the first one: later errors often follow from it.
2. **Read what is left.** Many messages end with the goal that Isabelle could not prove. Compare it with
   what you expected: it usually shows the missing fact, the false claim or the wrong step.
3. **Tick Proof state** in the Output panel, so that you see the goals as you move the cursor
   ([Section 1.6](module_01_EN.html#tour)).
4. **Test the claim.** A proof of a false statement fails whatever you do; `quickcheck` and `nitpick` find
   many false claims in seconds ([Section 9.9](module_09_EN.html#strategy)).
5. **Only the red message counts.** A line `theorem …` above a failed proof does not mean that the proof
   worked ([Section 1.7.5](module_01_EN.html#first-refute)).

The messages below are copied from the modules, where Isabelle2026 printed them. The goals in them belong
to the modules' examples; yours will show your own. ⌂ marks a position: in Isabelle/jEdit it is a link to
the place in the text that the message is about. If you are stuck, Isabelle's community answers questions
on the isabelle-users mailing list, on Zulip chat and on Stack Overflow.

## Theories and files {#theory}

### Bad theory name {#bad-theory-name}

```text
Bad theory name "First" for file "Scratch.thy"⌂
```

The name after `theory` and the name of the file differ. A theory `First` must live in the file
`First.thy`. Save the file under the theory's name, or change the name after `theory` to match the file
([Section 1.7.1](module_01_EN.html#first-file)).

### Bad context for command {#bad-context}

```text
Bad context for command "lemma"⌂
```

A command that belongs at the top level of the theory arrived while a proof was still open.

- **An apply script without `done`.** The next `lemma` is refused. Add `done` after the last `apply`, or
  `oops` to abandon the proof ([Section 7.8.4](module_07_EN.html#errors-forget)).
- **A numbered case name without quotes.** In an Isar proof by computation induction, `3.IH` is not read as
  one name, and Isabelle reports a confusing error, for example `Bad context for command "qed"`. Write
  `"3.IH"` ([Section 11.5.3](module_11_EN.html#f-induct)).

If the unfinished proof is the last one in the theory, `end` is refused instead, with
[Illegal application of proof command in "prove" mode](#illegal-prove).

### Outer syntax error {#outer-syntax}

```text
Outer syntax error⌂: name expected,
but keyword file⌂ was found
```

Isabelle expected a name in a command and found one of its keywords. Some English words are keywords of
Isabelle's command language, `file` among them. Choose another name, such as `doc`
([Section 3.8](module_03_EN.html#types)).

## Syntax and types {#syntax}

### Inner syntax error {#inner-syntax}

```text
Inner syntax error⌂
at "∧ C"
Failed to parse prop
```

The text between the quotation marks is not a well-formed statement; `at "…"` shows where Isabelle stopped
reading. The usual cause is ⟹ inside a formula: ⟹ belongs to Pure and may appear only at the outside of a
statement. Inside a formula, write ⟶ ([Section 7.1.3](module_07_EN.html#meta-def)).

### Clash of types: incompatible operand type {#type-clash}

```text
Type unification failed: Clash of types "bool" and "nat"

Type error in application: incompatible operand type

Operator:  Suc :: nat ⇒ nat
Operand:   True :: bool
```

A function, the **Operator**, is applied to an argument, the **Operand**, of the wrong type. The clash names
the two types that could not be made equal ([Section 8.1.4](module_08_EN.html#type-errors)).

- **An argument of the wrong type**, as in `Suc True`, or arguments in the wrong order, as in
  `owns report alice` ([Section 3.8](module_03_EN.html#types)). Check the types with `term`.
- **Missing parentheses.** Application groups to the left, so `Suc Suc 0` means `(Suc Suc) 0`. Write
  `Suc (Suc 0)` ([Section 8.2.2](module_08_EN.html#currying)).
- **∈ where ⊆ is meant.** `{1} ∈ {1, 2 :: nat}` asks whether a set is an element of a set of numbers. Write
  `{1} ⊆ {1, 2}` or `1 ∈ {1, 2}` ([Section 4.1.4](module_04_EN.html#sets-isabelle)).
- **Book notation for sets.** In Isabelle `|` is a way to type ∨, so `{x | x < (5::nat)}` clashes `nat`
  with `bool`. Write `{x. x < 5}`, with a dot ([Section 4.1.4](module_04_EN.html#sets-isabelle)).

### Clash of types: operator not of function type {#not-function}

```text
Type unification failed: Clash of types "_ ⇒ _" and "_ list"

Type error in application: operator not of function type

Operator:  rev [1, 2] :: nat list
Operand:   [3::??'a] :: ??'a list
```

Something that is not a function has been given an argument. `_ ⇒ _` stands for "some function type", and
`??'a` for a type that Isabelle had not worked out yet ([Section 8.1.4](module_08_EN.html#type-errors)).

- **Too many arguments**, as in `rev [1, 2] [3]`: `rev` takes one list.
- **A predicate with different numbers of arguments** in different places, as in `P x ⟶ P x y`. Give each
  predicate the same number of arguments everywhere ([Section 3.8](module_03_EN.html#types)).

### No type arity {#no-type-arity}

```text
Type unification failed: No type arity light :: numeral

Type error in application: incompatible operand type

Operator:  next_light :: light ⇒ light
Operand:   3::??'a :: ??'a
```

The type `light` is not in the class `numeral`, the class of types that have numerals, so `3` cannot be a
light. An arity is Isabelle's record that a type belongs to a class. Give the function a value of its own
type, such as `Red` ([Section 8.6.2](module_08_EN.html#classes)).

### Variable not of sort {#not-of-sort}

```text
Type unification failed: Variable 'a::type not of sort ord

Type error in application: incompatible operand type

Operator:  (≤) :: ??'a ⇒ ??'a ⇒ bool
Operand:   x :: 'a
```

A function uses `≤` on a type variable that may stand for any type, including types without `≤`. Restrict
the type variable to a class: `'a::linorder` for a linear order ([Section 12.2.1](module_12_EN.html#isort-program)).

### Wellsortedness error {#wellsortedness}

```text
Wellsortedness error:
Type 'a not of sort term_of
Cannot derive subsort relation numeral < term_of
```

A type is required to be in a class that it is not known to be in. For `value "2 + 2"`, all Isabelle knows
about the type of `2 + 2` is that it has numerals, and `value` needs a type whose values it can print
([Section 8.6.2](module_08_EN.html#classes)).

- **A number without a type.** Add an annotation: `value "2 + 3 :: nat"`
  ([Section 1.7.2](module_01_EN.html#first-compute)).
- **`value` on an infinite set**, such as `{x. x < (5::nat)}`. The message then says `not of sort enum`:
  `value` would have to try every natural number. Take the elements from a finite set, as in
  `{x ∈ {0..10}. x < 5}` ([Section 4.1.4](module_04_EN.html#sets-isabelle)).
- **`export_code` on a definition that quantifies over `nat`.** It has no program, for the same reason
  ([Section 8.8](module_08_EN.html#codegen)).

### Undefined type name {#undefined-type}

```text
Undefined type name: "lights"
```

A type in a signature is misspelt: here `lights` for `light`. Correct the name
([Section 8.4.4](module_08_EN.html#names)).

### Error in record input {#record-input}

```text
exception TERM raised⌂:
  Error in record input: expecting more fields
  ??.cars = Amber::<position>
```

With `=`, Isabelle reads `⦇cars = Amber⦈` as a record value, which must list every field. An update needs
`:=`: write `start⦇cars := Amber⦈` ([Section 13.4.1](module_13_EN.html#records)).

### value gives your term back {#value-unevaluated}

```text
"lenght [1, 2]"
  :: "'a"
```

No error, but no result either. A misspelt name is a free variable, which `value` cannot evaluate; the
type variable `'a` in the answer is the sign. Isabelle/jEdit shows free variables in blue. Correct the name
([Section 8.1.3](module_08_EN.html#value)).

### Isabelle reads the formula differently {#reading}

```text
proof (prove)
goal (1 subgoal):
 1. (A = B ∧ C) = (A = (B ∧ C))
```

No error: the statement means something other than you intended. State it and read the goal, which
Isabelle prints with only the parentheses that matter.

- `=` binds more tightly than ∧ and ∨, but ⟷ as loosely as ⟶; Isabelle prints ⟷ as `=`. Write `=` between
  terms and ⟷ between formulas ([Section 3.6](module_03_EN.html#equality)).
- ¬A ∧ B is (¬A) ∧ B, and ⟶ and ⟷ have the same priority: write parentheses when you mix them
  ([Section 2.2.2](module_02_EN.html#priorities)).
- A quantifier's scope runs as far to the right as possible: ∀x. P x ⟶ Q x is ∀x. (P x ⟶ Q x)
  ([Section 3.2.4](module_03_EN.html#scope)).

## Definitions and termination {#definitions}

### Could not find lexicographic termination order {#termination}

```text
consts
  bad :: "nat ⇒ nat"

Unfinished subgoals:
(a, 1, <):
 1. False
Calls:
  a) n ~> n
Measures:
  1) size
Result matrix:
    1
a:  <=

Could not find lexicographic termination order.
```

`fun` could not prove that the recursion terminates, and rejected the definition; the first lines only
announce the constant, which is not defined afterwards. Read the message from the bottom up: **Calls**
lists the recursive calls (`~>` means "calls"), **Measures** the measures tried, and the **Result matrix**
says for each call and measure whether it decreases (`<`), does not grow (`<=`) or neither could be shown
(`?`). **Unfinished subgoals** are what Isabelle could not prove
([Section 8.7.2](module_08_EN.html#termination-messages)).

- **The recursion does not terminate**, as in `bad n = bad n + 1`. Such an equation could prove `0 = 1`;
  rethink the definition ([Section 5.7.1](module_05_EN.html#why-terminate)).
- **A missing base case.** `sum_down n = sum_down (n - 1) + n` calls itself for ever at 0, because
  `0 - 1 = 0` on `nat`. Use the patterns `0` and `Suc n` ([Section 5.7.3](module_05_EN.html#no-measure)).
- **The function terminates, but not by the size of an argument**, like `wait` on traffic lights. Rewrite
  it so that termination is evident, for example with library functions, or prove termination yourself
  with `function` ([Section 8.7.3](module_08_EN.html#termination-help)).

### Missing patterns in function definition {#missing-patterns}

```text
Missing patterns in function definition:
top_value Empty = undefined
```

A warning: the equations do not cover every constructor. Isabelle completes the function with
`undefined`, so its value there is unspecified, and `value` stops with
[exception Match raised](#exception-match) on it. Add the missing equation, or return an option such as
`None` ([Section 8.4.3](module_08_EN.html#patterns)). `primrec` warns about a missing constructor with
`No equation for constructor "Empty"`.

### exception Match raised {#exception-match}

```text
exception Match raised⌂
```

`value` reached an unspecified value, for which no equation exists: `top_value Empty` above, `hd []`, or
`xs ! n` with `n` beyond the end of the list. The ⌂ points into the generated program, not into your
theory. Handle the missing case, or make sure that `xs` is not empty and that `n < length xs`
([Section 8.4.3](module_08_EN.html#patterns), [Section 8.5.2](module_08_EN.html#comprehension)).

### Equation is redundant {#redundant}

```text
Equation is redundant (covered by preceding clauses):
is_red2 Red =
True
```

`fun` uses the first equation that matches. A general equation before a specific one hides it. Put the
specific equation first ([Section 8.4.3](module_08_EN.html#patterns)).

### Constructor pattern missing {#constructor-pattern}

```text
Constructor pattern missing in left-hand side at
  is_red3 l =
  False
```

`primrec` needs one equation per constructor, each with the constructor applied to variables; a plain
variable is not such a pattern. Write an equation for each constructor, or use `fun`
([Section 8.4.3](module_08_EN.html#patterns)).

### Variable occurs on right hand side only {#rhs-only}

```text
Variable "duraton" occurs on right hand side only:
⋀l ls duraton.
   cycle_time (l # ls) =
   duraton l +
   cycle_time
    ls
```

A name on the right-hand side is not a constant, so Isabelle took it for a variable, which has no value.
Usually it is a misspelt function name, here `duraton` for `duration`
([Section 8.4.4](module_08_EN.html#names)).

### Bad arguments on lhs {#bad-lhs}

```text
Bad arguments on lhs: "(a, b)"
The error(s) above occurred in definition:
"safe2 (a, b) ≡
 a = Red ∨
 b =
 Red"
```

`definition` takes no patterns: its left-hand side is the constant applied to variables. Use `fst` and
`snd`, a `case` expression, or `fun`, which accepts patterns ([Section 8.4.1](module_08_EN.html#definition)).

### Proof failed for an inductive definition {#inductive-mono}

```text
Proof failed.
 1. ⋀x y xa n. x (?x10 x y xa n) ⟶ y (?x10 x y xa n) ⟹ y n ⟶ x n
The error(s) above occurred for the goal statement⌂:
mono (λp x. ∃n. x = Suc n ∧ ¬ p n)
```

The predicate being defined appears negated in a premise of one of its own rules. The rules must be
monotone, which the goal `mono (…)` says, and a negated premise breaks that. The details of the goal may
differ on your screen. Rewrite the rules without negating the predicate
([Section 11.6.4](module_11_EN.html#versus)).

### No code equations {#no-code-equations}

```text
No code equations for ev,
requested by dependencies
```

An inductive predicate is not a program, so `value` and Quickcheck cannot run it. Prove facts about it with
its rules instead, search for counterexamples with Nitpick, or define a recursive function if you need to
compute ([Section 11.6.4](module_11_EN.html#versus), [Section 13.5.1](module_13_EN.html#fails)).

## Proofs that fail {#proofs}

### Failed to apply initial proof method {#initial-method}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. ((A ⟶ B) ⟶ A) ⟶ A
```

The method after `by` could do nothing with the goal, which the message shows unchanged. For `simp` it means
that no rule applied at all, for `auto` that it could not change the goal; `blast` and `linarith` say it
whenever they find no proof ([Section 2.4](module_02_EN.html#classify),
[Section 9.2.4](module_09_EN.html#modifiers), [Section 9.5](module_09_EN.html#arith)).

- **A definition is not unfolded.** The equation of a `definition` is not a simp rule: write
  `simp add: safe_def` ([Section 8.4.1](module_08_EN.html#definition)).
- **The method is the wrong kind.** Rewriting does not prove every tautology: try `blast` or `auto` for
  logic, `fastforce` when the search needs rewriting, `presburger` or `arith` for arithmetic
  ([Section 9.4](module_09_EN.html#classical), [Section 9.5](module_09_EN.html#arith)).
- **A lemma is missing.** Find it with `find_theorems` and pass it with `simp add:`, or let Sledgehammer
  look for it ([Section 9.6](module_09_EN.html#find), [Section 9.8](module_09_EN.html#sledgehammer)).
- **A numeral meets a `Suc` pattern.** `simp` does not match `2` against `Suc n`; add `numeral_eq_Suc`
  ([Section 8.6.2](module_08_EN.html#classes)).
- **The type is open.** In `x + 0 = x`, `x` has some type with `+` and `0`, and nothing more is known.
  Annotate it: `x + 0 = (x::nat)` ([Section 8.6.2](module_08_EN.html#classes)).
- **The claim is false.** Test it with `quickcheck` and `nitpick` ([Section 9.7](module_09_EN.html#refute)).

### Failed to finish proof {#finish-proof}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. n + n = n * n
```

The method made progress but did not prove the goal; the message shows what is left. At `done` the message
reads `Failed to finish proof:` and lists the subgoals that remain
([Section 1.7.5](module_01_EN.html#first-refute), [Section 7.8.3](module_07_EN.html#errors-done)).

- **The claim is false**, as here: `n + n = n * n` does not hold in general. Fix the statement, or abandon
  it with `oops`.
- **A fact is not passed to the method.** A method sees only the facts you give it
  ([Section 10.3.3](module_10_EN.html#facts-visible)), and see [the entry below](#not-passed).
- **An equation in the other orientation.** To the simplifier, `u = v` and `v = u` are different terms.
  State lemmas in the orientation that the definitions produce
  ([Section 9.2.3](module_09_EN.html#simp-rules)).
- **A `case` or `if` in an assumption.** Split it with `split: option.splits` or `split: if_splits`
  ([Section 9.3.3](module_09_EN.html#splits)).
- **A recursive function applied to a variable**, such as `sum_upto n`: no equation applies until you do
  induction ([Section 5.4.1](module_05_EN.html#simp-not-enough)).
- **`done` with subgoals left.** `done` proves nothing itself; add the missing steps.

### An induction leaves a goal {#induction-stuck}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ⋀a xs. sumacc xs 0 = sum_list xs ⟹ sumacc xs a = a + sum_list xs
```

The base case or the step cannot be finished from the definitions and the induction hypothesis. Compare
the hypothesis, to the left of ⟹, with the conclusion: the difference shows what to change
([Section 11.1.2](module_11_EN.html#stuck-isabelle)). The [cheat sheet](cheatsheet_EN.html#induction) has
the table of remedies.

- **Induction on the wrong variable.** Induct on the argument that the function takes apart
  ([Section 5.5.1](module_05_EN.html#list-induction)).
- **A missing lemma.** A term in the goal that no equation can rewrite needs a lemma about it, proved first
  and declared `[simp]` ([Section 5.5.3](module_05_EN.html#lemmas), [Section 11.3](module_11_EN.html#lemmas)).
- **The hypothesis fixes a value that the step needs to vary**, as `0` above. Generalise it:
  `induction xs arbitrary: acc` ([Section 11.2](module_11_EN.html#generalise)).
- **The hypothesis is true but says too little.** Prove a stronger claim
  ([Section 5.6](module_05_EN.html#strong), [Section 11.2.3](module_11_EN.html#strengthen)).
- **The function recurses in its own pattern.** Use computation induction, `rule: f.induct`
  ([Section 11.5](module_11_EN.html#computation)).

### Failed to apply proof method {#apply-method}

```text
Failed to apply proof method⌂:
goal (1 subgoal):
 1. A ∧ B ⟶ B ∧ A
```

An `apply` step could do nothing with subgoal 1, which the message shows as it was before the step
([Section 7.8.1](module_07_EN.html#errors-apply)).

- **The rule does not fit the conclusion.** For `rule`, the rule's conclusion must have the main
  connective of the subgoal's conclusion: `disjI1` cannot prove a conjunction. Look the rule up with `thm`.
- **Taking an assumption apart before it is one.** In A ∧ B ⟶ B ∧ A, the conjunction is not yet an
  assumption: apply `impI` before `erule conjE`.
- **Expecting `assumption` to look inside a formula.** It only unifies whole formulas; take the assumption
  apart first.
- **A numeral against a `Suc` pattern.** `rule ev_SS` does not apply to `ev 4`. Write the number with
  `Suc`, or simplify with `numeral_eq_Suc` first ([Section 11.6.1](module_11_EN.html#ev)).

### Unknowns that nothing can close {#unknowns}

```text
Failed to apply proof method⌂:
goal (1 subgoal):
 1. ⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y
```

The unknown `?x4 y` was created before `x` was fixed, so it can never become `x`. Fix first, guess later:
apply `allI` and `exE`, which fix variables, before `exI`, `allE` and `spec`, which create unknowns
([Section 7.6.3](module_07_EN.html#quantifiers-order)). When the goal does not show what an unknown must
be, as in `?n + ?n = 6`, name the witness yourself: `apply (rule_tac x = 3 in exI)`
([Section 7.6.4](module_07_EN.html#quantifiers-inst)).

### Undefined fact {#undefined-fact}

```text
Undefined fact: "conjl"⌂
```

No theorem has this name. Often a capital I has become a lower-case l, as in `conjl` for `conjI`
([Section 7.8.2](module_07_EN.html#errors-name)), or a function name is misspelt, as in `duraton.simps`
([Section 8.4.4](module_08_EN.html#names)). A definition's equation is called `f_def`, the equations of a
`fun` `f.simps`. Search with `find_theorems name:` ([Section 9.6](module_09_EN.html#find)).

### SAT solver found a countermodel {#sat-countermodel}

```text
exception THM 0 raised⌂: SAT solver found a countermodel:
A: true, B: true, C: false
```

`sat` failed because the goal is not a tautology. The first line is technical; the second is a
counterexample ([Section 2.8](module_02_EN.html#sat)).

### exception THM: infer_instantiate_types {#thm-instantiate}

```text
exception THM 0 raised⌂:
  infer_instantiate_types: type ?'a of variable ?a
  cannot be unified with type 'a of term n
  (⋀x. (⋀y. y < x ⟹ ?P y) ⟹ ?P x) ⟹
  ?P ?a
```

The rule `less_induct` cannot be used on a variable whose type is unknown. Annotate the variable, as in
`0 < (n::nat)` ([Section 11.8](module_11_EN.html#complete)).

### Rule induction leaves a goal that makes no sense {#rule-induction-pattern}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. m ⟹ d = Closed
```

The inductive premise has a pattern, here `lreach (d, m)`, or a constant where the rule has a variable, and
the cases lose their meaning. State the property as a function of the whole state, as in
`lreach s ⟹ lift_ok s` ([Section 13.3](module_13_EN.html#invariants)), or replace the constant by a
variable with an equation ([Section 11.7.2](module_11_EN.html#constants)).

### Rule induction on the wrong premise {#rule-induction-premise}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ⋀aa b c.
       ⟦r aa b; steps r b c; steps r a b ⟹ steps r a c; steps r a aa⟧
       ⟹ steps r a c
```

`induction rule: steps.induct` always inducts on the first premise. Put the premise you want to induct on
first ([Section 11.7.1](module_11_EN.html#closure)).

### The step case of an invariant fails {#invariant-step}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ⟦reach s; e = ToGreen; cars s = Red; ¬ req s; peds s = Walk⟧ ⟹ False
```

The goal describes a state that satisfies the property and an event that leads out of it: a
counterexample to induction. If the state is reachable, the design is wrong; search for a trace with
`nitpick`. If it is not, strengthen the invariant with a fact that holds in every reachable state
([Section 13.5](module_13_EN.html#strengthen), [Section 13.6](module_13_EN.html#traces)).

## Isar proofs {#isar}

### Failed to apply initial proof method at proof {#proof-start}

```text
Failed to apply initial proof method:
goal (1 subgoal):
 1. False
```

`proof` with no method applies the standard rule for the goal, and no rule fits a goal such as `False` or
an equation between numbers. Write `proof -`, which starts the block without changing the goal, or name
the rule: `proof (rule r)` ([Section 10.2.6](module_10_EN.html#shape-start)).

### Failed to refine any pending goal {#refine}

```text
Failed to refine any pending goal
```

The claim of a `show` was proved, but under the assumptions of its block it solves no pending goal.
Isabelle/jEdit warns about this before the proof of the `show` has finished, with "Local statement fails
to refine any pending goal" ([Section 10.8](module_10_EN.html#errors)).

- **The claim is not the goal.** Compare it with the goal in the proof state; check `?thesis` and `?case`.
  Changing `show` into `have` tells you whether the claim itself is right.
- **A missing `next`** between cases: the assumption of the first case stays in force in the second
  ([Section 10.5.2](module_10_EN.html#cases-datatype)).
- **An `assume` that is not a premise of the goal** ([Section 10.2.1](module_10_EN.html#shape-blocks)).

### Illegal application of proof command in "prove" mode {#illegal-prove}

```text
Illegal application of proof command in "prove" mode
```

A claim (`have`, `show`, `lemma`) has no proof, so the next command comes too early. Give the claim a
proof, `by …` or `proof … qed` ([Section 10.8](module_10_EN.html#errors)). At `end`, the same message means
that the last proof of the theory is unfinished ([Section 7.8.4](module_07_EN.html#errors-forget)).

### Undefined case {#undefined-case}

```text
Undefined case: "Empty"⌂
```

The case names come from the constructors (`Nil` and `Cons` for lists, `0` and `Suc` for numbers), from the
rules of an inductive definition, from the equations of a function (`1`, `2`, `3`), or `less` for
`less_induct`. The proof outline that Isabelle/jEdit shows, and `print_cases`, list the right names
([Section 10.6.2](module_10_EN.html#induction-names)).

### show ?thesis in an induction {#thesis-in-induction}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. mysum (xs @ ys) = mysum xs + mysum ys
```

In an induction, `?thesis` is the whole lemma for the original variable, not the claim of the case. Write
`show ?case` ([Section 10.6.2](module_10_EN.html#induction-names)).

### A fact is not passed {#not-passed}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. hi < x ⟶ ¬ x < lo ⟶ lo ≤ hi
```

A proof method sees only the goal and the facts passed to it with `then`, `from`, `with` or `using`. Here
the lemma's assumption `lo ≤ hi` was not passed: write `using assms`
([Section 10.3.3](module_10_EN.html#facts-visible)). When the goal left over is the induction hypothesis
itself, the hypothesis was not passed: write `then show ?case` or `using Cons.IH`
([Section 10.6.2](module_10_EN.html#induction-names)).

### The induction hypothesis does not fit {#ih-not-fit}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. sumacc xs (acc + x) = acc + x + sum_list xs
```

The step needs the hypothesis for another value (here `acc + x`), but the hypothesis is about the fixed
`acc` of the claim, so `rule Cons.IH` does not fit. Generalise the variable: `induction xs arbitrary: acc`
([Section 11.2.2](module_11_EN.html#arbitrary)). The compiler proof of Module 14 needs `arbitrary: stk` for
the same reason ([Section 14.5.4](module_14_EN.html#isar)).

### A chain proves something stronger {#calc-strict}

```text
Failed to apply initial proof method:
using this:
  x < z
goal (1 subgoal):
 1. x ≤ z
```

`finally` produces the strictest relation of the chain, and `.` accepts only that exact fact. Claim
`x < z`, or replace `.` by a method that can weaken it, such as `by simp`
([Section 10.4.2](module_10_EN.html#calc-ineq)).

### Vacuous calculation result {#vacuous}

```text
Vacuous calculation result: (⋀x y. x ≤ y ⟹ a ≤ a) ⟹ b ≤ a
derived as projection (1) from:
    b ≤ a
    c ≤ a
```

The steps of a calculation do not fit together. Isabelle reads a ≥ b as b ≤ a, so in a chain written with
≥, `…` stands for the wrong term. Write chains from the small end to the big end, with `=`, `≤` and `<`
([Section 10.4.2](module_10_EN.html#calc-ineq)).

### obtain cannot be proved {#obtain}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. (⋀a. admin a ⟹ thesis) ⟹ thesis
```

This goal is what `obtain` has to prove, and its proof did not receive the existential fact. Write
`then obtain`, or pass the fact with `using` ([Section 10.3.4](module_10_EN.html#facts-obtain)).

### A case hides a rule of the same name {#case-hides-rule}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ev (Suc (Suc (k + n)))
```

Inside `case ev_SS`, the name `ev_SS` means the facts of the case, not the rule. Use the qualified name of
the rule, `ev.ev_SS` ([Section 11.6.2](module_11_EN.html#rule-induction)).

## Automatic tools {#tools}

### Quickcheck found a counterexample {#quickcheck-found}

```text
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  n = 1
Evaluated terms:
  double n = 2
  n * n = 1
```

The claim is false for these values, so no proof can succeed. Fix the statement, or abandon it with `oops`.
Isabelle/jEdit runs Quickcheck on every new lemma and marks the line with a blue **i** when it finds a
counterexample ([Section 1.7.5](module_01_EN.html#first-refute), [Section 9.7.1](module_09_EN.html#quickcheck)).
Values such as a₁ and a₂ are different elements of a type about which Quickcheck knows nothing else.

### Quickcheck found no counterexample {#quickcheck-none}

```text
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

Evidence, not proof: Quickcheck tried small values only ([Section 9.7.1](module_09_EN.html#quickcheck)).
On a claim whose counterexamples are large, such as a run of five events, fix the size of the input
([Section 13.6](module_13_EN.html#traces)). When a claim has functions among its variables, Quickcheck may
stop with "Quickcheck ran out of time": limit the search with `quickcheck [size = 3]`
([Section 14.4.3](module_14_EN.html#testing)).

### Nitpick found a counterexample {#nitpick-found}

```text
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = True
    B = True
    C = False
```

Nitpick found values for the free variables that make the claim false
([Section 2.4](module_02_EN.html#classify)). In larger answers, `card 'a = 2` gives the size of the domain
it used, and **Skolem constant** shows values chosen for bound variables
([Section 3.4](module_03_EN.html#validity)). A counterexample marked potentially spurious might disappear
in a larger model: treat it as a hint ([Section 9.7.2](module_09_EN.html#nitpick)). Without the option
`card`, Nitpick tries several sizes in parallel, and its answer can change from run to run; `[card = 6]`
or `[card 'a = 2]` makes it repeatable ([Section 13.6](module_13_EN.html#traces)).

### Nitpick found no counterexample {#nitpick-none}

```text
Nitpicking formula...

Nitpick found no counterexample
```

Nitpick searched domains up to a size limit and found nothing. That is not a proof: some formulas that are
not valid have only infinite countermodels ([Section 3.4](module_03_EN.html#validity),
[Section 3.9](module_03_EN.html#decidability)).

### Hint: Maybe you forgot a type constraint? {#type-constraint}

```text
Hint: Maybe you forgot a type constraint?
```

The last line of a Nitpick answer whose counterexample may rely on types you did not intend: in
`A - (B - C) = A - B - C`, `-` also exists for other types than sets. Annotate a variable, as in
`(C :: 'a set)` ([Section 4.1.4](module_04_EN.html#sets-isabelle)).

### Reading Sledgehammer's answer {#sledgehammer}

```text
Sledgehammering...

metis found a proof...

metis: Try this: by (metis mult_le_mono mult_le_mono1) (82 ms)
```

Each prover that succeeds reports "… found a proof..." and suggests a proof after "Try this:", with the time
it took to check. "Duplicate proof" means that the proof was already suggested, and "Done" that all
provers have finished. Click a short, fast suggestion to insert it, and delete the `sledgehammer` line
([Section 9.8](module_09_EN.html#sledgehammer)).

- **No prover finds a proof.** The goal may be false (try `quickcheck` and `nitpick`), may need induction,
  or a lemma that is not in the library. Or give the provers more time: `sledgehammer [timeout = 120]`.
- **The suggested `metis` call fails or runs for a long time.** Try another suggestion.

### Tracing paused {#tracing-paused}

```text
Tracing paused. Stop, or continue with next 100, 1000, 10000 messages?
```

Isabelle/jEdit shows at most 1000 trace messages for a command. If this happens with a small goal, suspect
a rule that loops. Remove `using [[simp_trace]]` when you are done
([Section 9.3.5](module_09_EN.html#tracing)).

### The simplifier never stops {#simp-loops}

No message: the proof keeps running. The simp set contains rules that loop, such as an equation and its
mirror image, or an assumption like `∀x. f x = g (f x)` that rewrites a term into one that contains it.
Remove the rule; use `simp flip: name` to turn a rule round for one call, and `simp (no_asm)` to ignore the
assumptions ([Section 9.3.4](module_09_EN.html#loops), [Section 9.3.2](module_09_EN.html#assumptions)).

### A blue i next to a new lemma {#auto-tools}

```text
Auto solve_direct: the current goal can be solved directly with List.rev_rev_ident: rev (rev ?xs) = ?xs
```

Isabelle/jEdit runs Auto Quickcheck and Auto solve_direct on every new statement. This message says that
the library already has the lemma; you can use the library's theorem instead of proving it again. The
message "Auto Quickcheck found a counterexample:" says that the statement is false
([Section 1.7.3](module_01_EN.html#first-prove), [Section 1.7.5](module_01_EN.html#first-refute)).

## Installation and the editor {#install}

### Windows protected your PC {#windows-protected}

Isabelle is not signed by a registered developer, so Windows rejects it at first. In the blue window
"Windows protected your PC", click **More info**, then **Run anyway**
([Section 1.5](module_01_EN.html#install)).

### macOS: there is no Open Anyway button {#macos-open-anyway}

The button appears in **System Settings → Privacy & Security** only after you have tried to open the
application once. Open Isabelle2026.app again, click **Cancel**, and look again
([Section 1.5](module_01_EN.html#install)).

### Linux: Isabelle/jEdit does not start {#linux-desktop}

Isabelle/jEdit needs a graphical desktop that works with Java. Start it from a desktop session with
`Isabelle2026/Isabelle2026` ([Section 1.5](module_01_EN.html#install)).

### Isabelle is very slow, or runs out of memory {#memory}

Close other large programs. Isabelle's home page asks for 4 GB of memory and 2 processor cores for small
experiments, and 8 GB and 4 cores for medium-sized applications ([Section 1.5](module_01_EN.html#install)).

### A prover fails to run on Windows {#windows-defender}

Windows Defender can block Isabelle's external provers, which Sledgehammer and `smt` use. Exclude the whole
Isabelle folder in **Virus & threat protection**, as Isabelle's installation page recommends, and try
again ([Section 1.5](module_01_EN.html#install), [Section 9.8](module_09_EN.html#sledgehammer)).

### Nothing is checked yet {#prover-ready}

After a start, Isabelle loads HOL first. Wait until the **Theories** panel on the right says
**Prover: ready** ([Section 1.5](module_01_EN.html#install)). A theory that imports a library theory
outside `Main`, such as `"HOL-Library.Multiset"`, loads it each time you start Isabelle/jEdit, which takes
a little while; the Theories panel shows the progress ([Section 12.2.1](module_12_EN.html#isort-program)).

### The proof state does not show {#proof-state}

Open the **Output** panel with its tab at the bottom of the window, and tick **Proof state** there; the
setting is remembered. Then put the cursor at the end of the line whose state you want to see
([Section 1.6](module_01_EN.html#tour), [Section 5.4.3](module_05_EN.html#by-induction)). While **Proof
state** is not ticked, goals appear in the separate **State** panel instead.

### A symbol is not accepted {#symbol}

Type ⟷ as `<-->`: the shorter `<->` is also the abbreviation of ↔, which jEdit offers first and HOL
rejects. Accept a completion with <kbd>Tab</kbd>; <kbd>Return</kbd> does not accept it. The cheat sheet
lists [every symbol](cheatsheet_EN.html#symbols).

### Where is the generated code? {#theory-exports}

```text
See theory exports
```

`export_code` stores the code as theory exports instead of printing it. In Isabelle/jEdit, *theory exports*
in the message is a link: click it, and the File Browser opens on the generated files, in a folder whose
name begins with `isabelle-export:` ([Section 8.8](module_08_EN.html#codegen),
[Section 12.7](module_12_EN.html#export)).
