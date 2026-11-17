---
title: Propositional logic
part: 1
lead: Read and write formulas built with ¬, ∧, ∨, ⟶ and ⟷, decide with truth tables whether they are tautologies, equivalences or valid arguments, put them into normal forms, and use Isabelle to check requirements written as formulas.
minutes: 210
needs: Module 1
goals:
  - Read and write formulas with ¬, ∧, ∨, ⟶ and ⟷, and know how Isabelle groups them
  - Compute truth tables and classify a formula as a tautology, a contradiction or contingent
  - Transform formulas with the equivalence laws and into the normal forms NNF, CNF and DNF
  - Tell valid argument forms from invalid ones, and show a counterexample for an invalid one
  - Write requirements as formulas, check that they are consistent and that a property follows from them
  - Prove tautologies in Isabelle with `simp`, `blast` and `auto`, and find counterexamples with `quickcheck` and `nitpick`
imports: Main
---

## Propositions and connectives {#connectives}

Module 1 wrote the specification of sorting with an "and" in the middle: sorted ys ∧ mset ys = mset xs.
Requirements are full of such small words: *not*, *and*, *or*, *if … then*, *only if*, *unless*. Each
builds a larger statement from smaller ones, and whether the larger one is true depends only on whether
the smaller ones are. **Propositional logic** is the logic of these words. It is the simplest logic in
this series, and already a useful one: SAT solvers, programs that decide questions of propositional
logic, check hardware designs and software configurations every day. Every later logic, Isabelle's
included, contains it.

One example runs through this module: the controller of a server-room door, which reads a badge reader,
a PIN pad, the fire alarm and a lockdown switch, and decides whether to unlock the door.

::: definition Proposition
A **proposition** is a statement that is either true or false. An **atomic proposition**, or **atom**,
is one treated as indivisible at the chosen level of modelling. In formulas, atoms are names such as A, B or `fire`.
Propositional logic never looks inside an atom: all it uses is whether the atom is true or false.
:::

For the door, "the fire alarm is on" and "a valid badge is shown" are atoms. A command such as "unlock
the door" is not a proposition, and neither is "x > 3" until you know what x is; statements about
variables are the subject of Module 3. Five **connectives** build larger propositions from smaller ones.

::: definition Connectives
| Formula | Read it as | Name | True exactly when |
|---|---|---|---|
| ¬A | "not A" | negation | A is false |
| A ∧ B | "A and B" | conjunction | A and B are both true |
| A ∨ B | "A or B" | disjunction | at least one of A and B is true |
| A ⟶ B | "A implies B", "if A then B" | implication | A is false, or B is true |
| A ⟷ B | "A if and only if B" | equivalence | A and B are both true, or both false |

There are also two constants: `True`, which is always true, and `False`, which is always false. In
A ⟶ B, A is the **antecedent** and B the **consequent**.
:::

Section 2.3 makes the last column exact. In Isabelle/jEdit you type the symbols with the abbreviations
from Module 1: `~` for ¬, `&` for ∧, `|` for ∨, `-->` for ⟶ and `<-->` for ⟷.

### From English to formulas {#english}

English has many ways to express each connective:

| English | Formula |
|---|---|
| not A; it is not the case that A | ¬A |
| A and B; A but B; A although B | A ∧ B |
| A or B (or both) | A ∨ B |
| either A or B, but not both | ¬(A ⟷ B) |
| neither A nor B | ¬A ∧ ¬B |
| if A then B; B if A; B whenever A; A only if B | A ⟶ B |
| A is sufficient for B; B is necessary for A | A ⟶ B |
| A unless B | ¬B ⟶ A, which says the same as A ∨ B |
| A if and only if B; A exactly when B | A ⟷ B |

Two entries deserve a second look. **Or** is inclusive in logic: A ∨ B is true when both A and B are
true, whereas a question such as "tea or coffee?" often invites a choice of one but not both. That
exclusive reading is *exclusive or*, ¬(A ⟷ B); context determines which reading English intends.
And **but** adds a contrast that logic ignores: "the badge is valid but the door stays shut" is
`badge ∧ ¬ opens`.

::: pitfall
"A only if B" is A ⟶ B, not B ⟶ A. "The door opens only if the badge is valid" says that whenever the
door opens, the badge was valid: `opens ⟶ badge`. It does not say that a valid badge opens the door;
that would be `badge ⟶ opens`, "the door opens if the badge is valid". A requirement with "only if"
states a necessary condition; this example does not require the door to open when a badge is valid.
:::

::: example Formalising an access rule
The security team's first requirement reads: *"The door opens only if a valid badge is shown and the
correct PIN is entered, unless the fire alarm is on."* Choose an atom for each basic statement:

| Atom | Meaning |
|---|---|
| `opens` | the door unlocks |
| `badge` | a valid badge is shown |
| `pin` | the correct PIN is entered |
| `fire` | the fire alarm is on |

Here `opens` models the controller's decision to unlock. It does not model physical door movement,
actuator failures or people entering. The formulas below describe one situation at a time.

"The door opens only if a valid badge is shown and the correct PIN is entered" is
`opens ⟶ badge ∧ pin`, and "X unless F" is ¬F ⟶ X, so the requirement is

$$
\lnot \mathit{fire} \imp (\mathit{opens} \imp \mathit{badge} \land \mathit{pin})
$$

An equally natural reading is "the door may open only when there is a valid badge and the right PIN, or
a fire":

$$
\mathit{opens} \imp \mathit{badge} \land \mathit{pin} \lor \mathit{fire}
$$

The two formulas look different but say the same thing, as Exercise 2.3 shows. Notice what the
requirement does *not* say: that a valid badge with the right PIN does open the door. "Only if" states a
necessary condition, so another requirement must say when the door has to open.
:::

## The structure of formulas {#syntax}

To evaluate formulas, transform them or let a computer check them, you need to know exactly what counts
as a formula and how each one is put together.

### Formation rules {#formation}

::: definition Formula
The **formulas** of propositional logic are built by these rules, and only by them:

1. Every atom is a formula, and so are `True` and `False`.
2. If φ is a formula, then ¬φ is a formula.
3. If φ and ψ are formulas, then (φ ∧ ψ), (φ ∨ ψ), (φ ⟶ ψ) and (φ ⟷ ψ) are formulas.
:::

The Greek letters φ ("phi") and ψ ("psi") stand for any formulas, not only atoms. For example, A, B and C
are formulas by rule 1, so ¬A is a formula by rule 2, (¬A ∧ B) by rule 3, and ((¬A ∧ B) ⟶ C) by rule 3
again. A ∧ ∨ B and A ¬ B are not formulas: no rule produces them. A definition of this shape, with basic
cases and rules that build larger objects from smaller ones, is an **inductive definition**. In Module 5
such definitions support proofs by induction and become datatypes in Isabelle.

Every formula remembers how it was built. Draw the last rule used as the root of a tree and the parts it
combined as its children, and repeat for the parts: the result is the formula's **parse tree**
(Figure 2.1).

::: figure id=fig-02-1
The parse tree of `opens ⟶ badge ∧ pin ∨ fire`. Each inner node is a connective, and each node stands
for the sub-formula written beside it. The T and F labels evaluate the formula for one situation, as
Section 2.3 explains.
:::

::: definition Sub-formula and main connective
The **sub-formulas** of a formula are the formulas at the nodes of its parse tree, the formula itself
included. The **main connective** is the connective at the root. A formula is named after its main
connective: ¬(A ∧ B) is a negation, while ¬A ∧ B is a conjunction.
:::

In Figure 2.1 the main connective is ⟶, so the requirement is an implication. Its sub-formulas are the
four atoms, `badge ∧ pin`, `badge ∧ pin ∨ fire` and the whole formula.

### Priorities and grouping {#priorities}

Rule 3 puts parentheses around every binary connective, so that each formula has exactly one parse
tree. But the parentheses make formulas hard to read: the door requirement would be
(opens ⟶ ((badge ∧ pin) ∨ fire)). School algebra solves the same problem with a convention: × binds more
tightly than +, so 2 + 3 × 4 means 2 + (3 × 4). Logic has the same kind of convention: each connective
has a **priority**, and a higher priority binds more tightly. In Isabelle, the binary connectives also
**group to the right**:

| Connective | Priority in Isabelle | Grouping |
|---|---|---|
| ¬ | 40 | (applies to what follows) |
| ∧ | 35 | to the right |
| ∨ | 30 | to the right |
| ⟶ | 25 | to the right |
| ⟷ | 25 | to the right |

The numbers are Isabelle's own. In the library theory `HOL.thy`, where the connectives are introduced,
∧ is declared `infixr 35` ("infix, grouping to the right, priority 35"), ∨ `infixr 30`, ⟶ and ⟷
`infixr 25`, and ¬ has priority 40. So:

| You write | It means |
|---|---|
| ¬A ∧ B | (¬A) ∧ B |
| A ∧ B ∨ C | (A ∧ B) ∨ C |
| A ∨ B ∧ C | A ∨ (B ∧ C) |
| A ∧ B ⟶ C | (A ∧ B) ⟶ C |
| A ⟶ B ⟶ C | A ⟶ (B ⟶ C) |
| A ⟶ B ⟷ C | A ⟶ (B ⟷ C) |

Grouping to the right suits implication: A ⟶ (B ⟶ C) reads "if A, then if B, then C", which says the
same as "if A and B, then C", while (A ⟶ B) ⟶ C is rarely what anyone means. For ∧ and ∨ the grouping
changes the parse tree but not the meaning (Section 2.5).

::: pitfall
- ¬A ∧ B is (¬A) ∧ B. To negate the whole conjunction, write ¬(A ∧ B).
- ⟶ and ⟷ have the same priority, so A ⟶ B ⟷ C means A ⟶ (B ⟷ C). Books and tools differ here; some
  give ⟷ a lower priority than ⟶ and read the same text as (A ⟶ B) ⟷ C. Whenever you mix ⟶ and ⟷,
  write the parentheses.
:::

::: isabelle
Isabelle prints a formula with only the parentheses its priorities need, so it can show you how it read
yours. `value`, which you met in Module 1, can simplify expressions symbolically, but it does not
enumerate valuations of free variables. For the examples below, it prints the formula back. Put the
cursor on each line in turn:

```isabelle
value "(¬ A) ∧ (B ⟶ C)"
value "A ⟶ (B ⟶ C)"
value "(A ⟶ B) ⟶ C"
```

```output all
"¬ A ∧ (B ⟶ C)"
  :: "bool"

"A ⟶ B ⟶ C"
  :: "bool"

"(A ⟶ B) ⟶ C"
  :: "bool"
```

Isabelle dropped the parentheses that the priorities make unnecessary and kept those that change the
meaning. The type `bool` in the output is the type of formulas: in Isabelle a formula is a term of type
`bool`, whose only two values are `True` and `False`. One more example holds a surprise:

```isabelle
value "A ⟶ (B ⟷ C)"
```

```output
"A ⟶ B = C"
  :: "bool"
```

Isabelle prints ⟷ as `=`. For truth values, "if and only if" is equality: A ⟷ B holds exactly when A
and B have the same value. The equals sign binds more tightly than every connective (its priority is
50), so `A ⟶ B = C` means A ⟶ (B ⟷ C). In Isabelle's output, read `=` between two formulas as ⟷;
Module 3 says more about the two.
:::

## Truth tables {#truth-tables}

The connectives table in Section 2.1 described each connective in words. Truth tables make the
descriptions exact.

::: definition Valuation
A **valuation** assigns a truth value, T (true) or F (false), to each atom. A valuation gives every
formula a truth value: an atom gets its value from the valuation, `True` is T, `False` is F, and each
connective combines the values of its parts according to its truth table below.
:::

Here are the truth tables of all the connectives in one table. Each row is one valuation of A and B, and
each column gives the value of one formula in that row.

```truthtable
A ⟷ B
¬A
A ∧ B
A ∨ B
A ⟶ B
```

The tables on these pages are generated from their formulas when the page is built. This avoids
transcribing the rows by hand; we must still choose the right formula. They list the atoms in
alphabetical order, start with the row in which every atom is T, and end
with a line that classifies the last column; Section 2.4 explains the words.

The column for A ⟶ B surprises most people. An implication is false in exactly one row: when its
antecedent is true and its consequent false. When A is false, A ⟶ B is true whatever B is; it is then
said to be **vacuously true**.

::: analogy
Think of A ⟶ B as a promise: "if you pass the exam, I will buy you dinner". The promise is broken only
if you pass and I do not buy dinner. If you fail the exam, I have kept my promise whether I buy dinner
or not.
:::

For specifications this is what you want. The rule "during a lockdown, the door stays shut",
`lockdown ⟶ ¬ opens`, constrains the door only during a lockdown; on an ordinary day it holds whatever
the door does. Nor is implication about cause: "if 2 + 2 = 5, the door is open" is true, because its
antecedent is false.

To find the value of a formula under a valuation, work up its parse tree from the atoms, applying the
table of each connective on the way.

::: example Evaluating the door requirement
Someone shows a valid badge, types the wrong PIN, there is no fire, and the door opens. The valuation is
opens = T, badge = T, pin = F, fire = F. Work up the tree of Figure 2.1:

1. `badge ∧ pin` is T ∧ F, which is F.
2. `badge ∧ pin ∨ fire` is F ∨ F, which is F.
3. `opens ⟶ badge ∧ pin ∨ fire` is T ⟶ F, which is F.

The requirement is false in this situation: the controller has broken it. The labels in Figure 2.1 show
the same computation.
:::

::: definition Truth table
The **truth table** of a formula has one row for each valuation of its atoms and gives the formula's
value in each row. A formula with n atoms has $2^n$ rows, because each atom can be T or F independently
of the others.
:::

::: example A truth table
Here is the truth table of `opens ⟶ badge ∧ pin`, the first requirement without its fire exception,
with a column for the sub-formula `badge ∧ pin`:

```truthtable
opens ⟶ badge ∧ pin
badge ∧ pin
```

The formula is false in exactly three rows: those in which the door opens without both a valid badge and
the right PIN.
:::

Truth tables always work, but they grow fast. The full door requirement, with `fire`, has 16 rows; ten
atoms give 1,024 rows, twenty more than a million, and thirty more than a billion. Section 2.8 returns
to this problem.

::: widget name=truth-table
Type a formula, with symbols or in ASCII (`~ & | --> <-->`); the table updates as you type. Start with
the full door requirement, `opens --> badge & pin | fire`: in how many rows is it false, and why? Then try
the presets, and switch to **Compare** to see whether two formulas have the same truth table.
:::

::: isabelle
A valuation turns a formula into one without variables: replace each atom by `True` or `False`. `value`
computes such a formula, and its result is one row of the truth table. Here is the row of Example 2.2,
with opens = T, badge = T, pin = F and fire = F:

```isabelle
value "True ⟶ True ∧ False ∨ False"
```

```output
"False"
  :: "bool"
```

With variables, `value` does not try the valuations for you. In this example it prints the formula
back, even though the formula is true in every row:

```isabelle
value "A ∨ ¬ A"
```

```output
"A ∨ ¬ A"
  :: "bool"
```

To establish that a formula is true in every row, you can check its complete truth table or give a
general proof. The next section introduces proofs checked by Isabelle.
:::

## Tautologies, contradictions and satisfiable formulas {#classify}

Some formulas are true in every row of their truth table, some in none. These two extremes, and the
formulas between them, are the central ideas of propositional logic.

::: definition Tautology, satisfiable, contradiction
Let φ be a formula.

- φ is a **tautology**, or **valid**, if it is true under every valuation: every row of its truth table
  is T.
- φ is **satisfiable** if it is true under at least one valuation. A valuation that makes φ true
  **satisfies** φ and is called a **model** of φ.
- φ is a **contradiction**, or **unsatisfiable**, if it is true under no valuation.
- φ is **contingent** if it is satisfiable but not a tautology. A valuation that makes φ false is a
  **counterexample** to φ.
:::

The verdicts under the computed tables use these words, with "Satisfiable but not valid" for a
contingent formula. The simplest tautology is the **law of excluded middle**: every proposition is true
or false.

```truthtable
A ∨ ¬A
¬A
```

Its opposite is the simplest contradiction:

```truthtable
A ∧ ¬A
¬A
```

The requirement of Example 2.3 is contingent: three rows are counterexamples and the others satisfy it.
Figure 2.2 shows how the classes fit together.

::: figure id=fig-02-2
Every formula is in exactly one of three classes. The satisfiable formulas include the tautologies.
Negation turns each tautology into a contradiction and back, and turns contingent formulas into
contingent formulas.
:::

::: fact Negation and the three classes
For every formula φ:

1. φ is a tautology if and only if ¬φ is a contradiction.
2. φ is satisfiable if and only if ¬φ is not a tautology.
:::

The reason is that ¬ flips every row of the truth table. Fact 2.1 turns one question into another: to
show that φ is a tautology, show that ¬φ has no model; to find a model of φ, look for a counterexample to
¬φ. SAT solvers and Isabelle's Nitpick both rely on it (Sections 2.8 and 2.9).

::: example Peirce's law
Is ((A ⟶ B) ⟶ A) ⟶ A a tautology? Looking at it does not tell you. The truth table does:

```truthtable
((A ⟶ B) ⟶ A) ⟶ A
A ⟶ B
(A ⟶ B) ⟶ A
```

Every row is T. The formula is called Peirce's law, after the logician Charles Sanders Peirce.
:::

::: isabelle
**Tautologies are lemmas.** When a lemma contains variables, Isabelle reads it as a claim about every
value of the variables, as with `xs` in Module 1. In a formula, Isabelle infers from the connectives
that the variables have type `bool`, so the claim is that the formula is true for every combination of
`True` and `False`: proving the lemma shows that the formula is a tautology.

```isabelle
lemma "A ∨ ¬ A"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∨ ¬ A
```

```isabelle
  by simp
```

Three proof methods prove tautologies:

- `simp`, the simplifier from Module 1, simplifies the goal using known equations and logical rules.
  Some goals close this way; others need additional reasoning.
- `blast` searches for a proof: it takes the formula apart, considers cases and backtracks when a
  choice leads nowhere. It either proves the goal completely or fails.
- `auto` combines the simplifier with logical steps of the kind `blast` takes, and leaves behind what it
  cannot prove.

Rewriting is not enough for every tautology. Peirce's law defeats `simp`:

```isabelle fails
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. ((A ⟶ B) ⟶ A) ⟶ A
```

Here "Failed to apply initial proof method" means that the method did not produce a successful
initial proof step. The message does not establish that the statement is false, nor does it identify
which reasoning rule is missing. `blast` proves it:

```isabelle
lemma "((A ⟶ B) ⟶ A) ⟶ A"
  by blast
```

So a failed proof does not mean that the formula is false. In this module, when `simp` fails, try
`blast` or `auto`; Module 9 explains what each method can and cannot do.
:::

What happens when the formula is not a tautology? Take A ⟶ B ⟶ A ∧ B ∧ C, which claims too much: from
A and B it concludes not only A ∧ B but also C.

::: isabelle
Every proof method fails, each in its own way. `simp` gets as far as it can and shows what is left:

```isabelle fails
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  by simp
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. A ⟶ B ⟶ C
```

The remaining goal, A ⟶ B ⟶ C, shows what is missing: nothing says that C holds. `blast` fails with
"Failed to apply initial proof method", as above, because it never leaves a partial result. `auto` shows
its remaining goal in a different notation:

```isabelle fails
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  by auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⟦A; B⟧ ⟹ C
```

Read ⟦A; B⟧ ⟹ C as "assuming A and B, show C"; Module 7 explains this notation.

A failed proof cannot tell you whether the formula is false. To find out, ask for a counterexample with
one of Isabelle's two tools for this, Quickcheck and Nitpick:

```isabelle
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  A = True
  B = True
  C = False
```

```isabelle
  nitpick
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = True
    B = True
    C = False
```

```isabelle
  oops
```

Both found the same counterexample: A and B true, C false. In that row the formula is T ⟶ T ⟶ F, which
is F. Quickcheck *tests*: it evaluates the formula for one valuation after another until one makes it
false. Nitpick *searches*: it translates the question into a satisfiability problem for a SAT solver
(Section 2.8). Both tools quickly find the valuation in this example. A search that finds no
counterexample, or reaches a resource limit, has not supplied a kernel-checked proof. With the default
settings Isabelle/jEdit also tries Quickcheck automatically on new lemmas, as you saw in Module 1;
Nitpick is not automatic by default.
:::

::: keyidea
A proof shows that a formula is a tautology; a counterexample shows that it is not. A failed proof shows
neither, because the method may have been too weak, and "no counterexample found" is not a proof. In
these examples, a completed proof establishes the universal claim, while a genuine counterexample
refutes it.
:::

## Logical equivalence and the laws {#equivalence}

A ⟶ B and ¬A ∨ B look different, yet they have the same truth table. Programmers meet the same question
whenever they rewrite a condition: is the new `if` test the same as the old one?

::: definition Logical equivalence
Two formulas φ and ψ are **logically equivalent**, written φ ≡ ψ and read "φ is equivalent to ψ", if
they have the same truth value under every valuation.
:::

The symbol ≡ is not a connective. φ ≡ ψ is a statement *about* two formulas, made outside the logic, like
"these two programs compute the same function"; the connective ⟷ lives inside formulas. The two are
linked:

::: fact Equivalence and ⟷
φ ≡ ψ if and only if φ ⟷ ψ is a tautology.
:::

This holds because φ ⟷ ψ is true in a row exactly when φ and ψ have the same value there. So a truth
table with a column for each side checks an equivalence. Here is A ⟶ B ≡ ¬A ∨ B:

```truthtable
(A ⟶ B) ⟷ ¬A ∨ B
A ⟶ B
¬A ∨ B
```

A small set of equivalences, the **laws** of propositional logic, does most of the everyday work. Each
can be checked with a truth table like the one above.

::: fact Laws of equivalence
| Law | Equivalences |
|---|---|
| Double negation | ¬¬A ≡ A |
| De Morgan | ¬(A ∧ B) ≡ ¬A ∨ ¬B;  ¬(A ∨ B) ≡ ¬A ∧ ¬B |
| Commutativity | A ∧ B ≡ B ∧ A;  A ∨ B ≡ B ∨ A |
| Associativity | (A ∧ B) ∧ C ≡ A ∧ (B ∧ C);  (A ∨ B) ∨ C ≡ A ∨ (B ∨ C) |
| Distributivity | A ∧ (B ∨ C) ≡ (A ∧ B) ∨ (A ∧ C);  A ∨ (B ∧ C) ≡ (A ∨ B) ∧ (A ∨ C) |
| Idempotence | A ∧ A ≡ A;  A ∨ A ≡ A |
| Absorption | A ∧ (A ∨ B) ≡ A;  A ∨ (A ∧ B) ≡ A |
| Identity | A ∧ True ≡ A;  A ∨ False ≡ A |
| Domination | A ∧ False ≡ False;  A ∨ True ≡ True |
| Complement | A ∧ ¬A ≡ False;  A ∨ ¬A ≡ True |
| Implication | A ⟶ B ≡ ¬A ∨ B |
| Contrapositive | A ⟶ B ≡ ¬B ⟶ ¬A |
| Negated implication | ¬(A ⟶ B) ≡ A ∧ ¬B |
| Exportation | A ∧ B ⟶ C ≡ A ⟶ B ⟶ C |
| Equivalence | A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) |
:::

The laws are stated with atoms, but they hold for all formulas, and they can be used inside larger
formulas:

::: fact Substitution and replacement
1. **Substitution.** If a formula is a tautology, replacing an atom everywhere in it by the same
   formula gives a tautology. Each law of Fact 2.3, written with ⟷, is a tautology (Fact 2.2), so it
   holds with any formulas in place of A, B and C.
2. **Replacement.** If φ ≡ ψ, replacing an occurrence of φ inside a formula by ψ gives an equivalent
   formula.
:::

Substitution holds because a tautology is true whatever values its atoms take, and so whatever values
the substituted formulas take. Replacement holds because the value of a formula depends only on the
values of its parts.

::: example Simplifying a condition in code
A program contains the test

```text
if not (valid and not expired) or expired:
```

Write v for `valid` and e for `expired`, and simplify step by step, naming the law used at each step:

$$
\begin{array}{lll}
 & \lnot(v \land \lnot e) \lor e & \\
\equiv & (\lnot v \lor \lnot\lnot e) \lor e & \text{De Morgan} \\
\equiv & (\lnot v \lor e) \lor e & \text{double negation} \\
\equiv & \lnot v \lor (e \lor e) & \text{associativity} \\
\equiv & \lnot v \lor e & \text{idempotence} \\
\equiv & v \imp e & \text{implication}
\end{array}
$$

So the test is equivalent to `if not valid or expired:`. This could be a sensible condition for rejecting
a ticket: reject it when it is invalid or expired. The implication `valid ⟶ expired` has the same truth
table, but is less helpful wording for that purpose; it does not assert a causal relationship between
validity and expiry. Simplification has exposed a redundant check, not established that the policy is
wrong. Deciding whether rejection is intended remains a validation question.
:::

::: pitfall
Three formulas look like A ⟶ B, and only one of them is equivalent to it:

| Formula | Name | Equivalent to A ⟶ B? |
|---|---|---|
| ¬B ⟶ ¬A | contrapositive | yes |
| B ⟶ A | converse | no |
| ¬A ⟶ ¬B | inverse | no |

In the same way, ¬(A ∧ B) is equivalent to ¬A ∨ ¬B, not to ¬A ∧ ¬B: negation turns ∧ into ∨ and back.
:::

::: isabelle
In Isabelle, an equivalence is a lemma with ⟷. (Isabelle has a symbol ≡ too, but it uses it for
meta-equality, often used in definitions, as Module 7 explains.) `blast` proves the whole simplification
of Example 2.5 in one step:

```isabelle
lemma "¬ (valid ∧ ¬ expired) ∨ expired ⟷ (valid ⟶ expired)"
  by blast
```

The parentheses around `valid ⟶ expired` are not needed, since ⟷ and ⟶ group to the right, but write
them whenever you mix the two. A wrong law produces a counterexample. Here is the wrong version of
De Morgan's law:

```isabelle
lemma "¬ (A ∧ B) ⟷ ¬ A ∧ ¬ B"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  A = True
  B = False
Evaluated terms:
  ¬ (A ∧ B) = True
  ¬ A ∧ ¬ B = False
```

For an equivalence, Quickcheck also lists, under "Evaluated terms", the value of each side in the
counterexample: here the left side is `True` and the right side `False`. The correct laws are in
Isabelle's library; for example, the theorem `de_Morgan_conj` states ¬ (P ∧ Q) ⟷ ¬ P ∨ ¬ Q. The
simplifier uses both of De Morgan's laws automatically.
:::

::: pitfall
In Isabelle, write ⟷ between formulas, not `=`. Because `=` binds more tightly than the connectives,
`A ∧ B = B ∧ A` means A ∧ (B = B) ∧ A, which is not the commutativity law at all:

```isabelle
lemma "A ∧ B = B ∧ A"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  A = False
  B = a⇩1
```

The value a₁ for B shows that B is no longer even a truth value. In `B = B`, B could be anything, so
Isabelle gave it an unknown type, and Quickcheck picked an element of that type; Module 3 explains such
types. With ⟷, `A ∧ B ⟷ B ∧ A` means what it says.
:::

## Logical consequence and arguments {#consequence}

Reasoning about systems is full of arguments: *if all tests pass, the release is built; the release was
not built; so some test failed*. An argument has premises and a conclusion, and the question is whether
the conclusion must be true when the premises are.

::: definition Logical consequence
A formula ψ is a **logical consequence** of formulas φ₁, …, φₙ, written

$$
\varphi_1, \ldots, \varphi_n \models \psi
$$

if every valuation that makes all of φ₁, …, φₙ true also makes ψ true. The φᵢ are the **premises** and
ψ is the **conclusion**; read ⊨ as "entails". An **argument** is **valid** if its conclusion is a logical
consequence of its premises. With no premises, ⊨ ψ says that ψ is a tautology.
:::

The symbol ⊨ is about truth. Module 6 introduces its partner ⊢, which is about proof: φ ⊢ ψ says that ψ
can be *derived* from φ by the rules of a proof system. To check an argument with a truth table, look
for a **bad row**: a row in which every premise is true and the conclusion is false. The argument is
valid exactly when there is no bad row, which gives a second way to check it:

::: fact Consequence as a tautology
φ₁, …, φₙ ⊨ ψ if and only if φ₁ ∧ … ∧ φₙ ⟶ ψ is a tautology.
:::

The implication is false exactly in the bad rows. Six argument forms come up so often that they have
names. Four are valid; the other two are mistakes common enough to be named too.

| Name | Premises | Conclusion | Valid? |
|---|---|---|---|
| Modus ponens | A ⟶ B, A | B | yes |
| Modus tollens | A ⟶ B, ¬B | ¬A | yes |
| Chaining (hypothetical syllogism) | A ⟶ B, B ⟶ C | A ⟶ C | yes |
| Disjunctive syllogism | A ∨ B, ¬A | B | yes |
| Affirming the consequent | A ⟶ B, B | A | no |
| Denying the antecedent | A ⟶ B, ¬A | ¬B | no |

By substitution (Fact 2.4) the valid forms stay valid with any formulas in place of A, B and C.

::: example Two arguments about a release
Write `tests` for "all tests pass" and `built` for "the release is built".

1. *If all tests pass, the release is built. The release was not built. So not all tests passed.* This
   is modus tollens, so the argument is valid.
2. *If all tests pass, the release is built. The release was built. So all tests passed.* This is
   affirming the consequent, and it is invalid. The truth table finds the bad row:

```truthtable
(tests ⟶ built) ∧ built ⟶ tests
tests ⟶ built
```

The premises are the columns `built` and `tests ⟶ built`, and the conclusion is the column `tests`. In
the row with built = T and tests = F, both premises are true and the conclusion is false: someone built
the release by hand although a test failed. One bad row is enough to make an argument invalid.
:::

::: note
Validity is about the form of an argument, not about the facts. A valid argument with a false premise
can have a false conclusion, and an invalid argument can have a true conclusion by luck. When you review
a design argument, ask both questions: is the form valid, and are the premises true?
:::

One special case matters a great deal for specifications.

::: fact Inconsistent premises entail everything
If no valuation makes all of φ₁, …, φₙ true, then φ₁, …, φₙ ⊨ ψ for every formula ψ. In particular,
A, ¬A ⊨ B.
:::

There is no row in which the premises are all true, so there is no bad row, whatever ψ is. This is the
**principle of explosion**, known by its Latin name *ex falso quodlibet*: from a falsehood, anything
follows.

::: keyidea
Before you believe that a property follows from a set of requirements, check that the requirements are
consistent. From inconsistent premises every conclusion follows, including its opposite. That does
not mean every proof method will find a proof; it means that entailment alone is no evidence that
the requirements describe an achievable system.
:::

::: isabelle
By Fact 2.5, an argument is valid when the implication from its premises to its conclusion is a
tautology, so `blast` can check it. Modus tollens:

```isabelle
lemma "(A ⟶ B) ∧ ¬ B ⟶ ¬ A"
  by blast
```

For an invalid argument, Nitpick finds the bad row:

```isabelle
lemma "(A ⟶ B) ∧ B ⟶ A"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = False
    B = True
```

With A false and B true, the premises A ⟶ B and B hold and the conclusion A does not. Explosion is a
theorem too:

```isabelle
lemma "A ∧ ¬ A ⟶ B"
  by blast
```
:::

## Normal forms {#normal-forms}

Equivalent formulas can look very different, which makes them hard to compare and hard for programs to
process. A **normal form** is a standard shape that every formula can be brought into without changing
its meaning. Three are in common use.

::: definition Literal and clause
A **literal** is an atom or a negated atom, such as A or ¬A. A **clause** is a disjunction of literals,
such as ¬A ∨ B ∨ ¬C; a single literal counts as a clause too.
:::

::: definition Normal forms
- A formula is in **negation normal form (NNF)** if it uses only atoms, `True`, `False` and the
  connectives ¬, ∧ and ∨, and every ¬ stands directly in front of an atom.
- A formula is in **conjunctive normal form (CNF)** if it is a conjunction of clauses, such as
  (A ∨ ¬B) ∧ (¬A ∨ C ∨ D) ∧ ¬C.
- A formula is in **disjunctive normal form (DNF)** if it is a disjunction of conjunctions of literals,
  such as (A ∧ ¬B) ∨ (¬A ∧ C) ∨ D.
:::

A single clause counts as a CNF, and a single conjunction of literals counts as a DNF. We also allow
empty conjunctions, meaning `True`, and empty disjunctions, meaning `False`. An empty clause is therefore
false. These conventions cover formulas that are always true or always false.

A CNF is a list of small rules that must all hold: the clause ¬A ∨ ¬B ∨ C says A ∧ B ⟶ C. SAT solvers
take their input in CNF. A DNF lists the situations in which the formula is true, so its satisfiability
can be read off: a DNF is satisfiable exactly when one of its conjunctions does not contain both an atom
and its negation. NNF is the first step towards both.

### Negation normal form {#nnf}

Three steps bring any formula into NNF:

1. Replace each φ ⟷ ψ by (φ ⟶ ψ) ∧ (ψ ⟶ φ).
2. Replace each φ ⟶ ψ by ¬φ ∨ ψ.
3. Push each ¬ inwards: replace ¬¬φ by φ, ¬(φ ∧ ψ) by ¬φ ∨ ¬ψ, ¬(φ ∨ ψ) by ¬φ ∧ ¬ψ, ¬True by
   False and ¬False by True.

Each step replaces a sub-formula by an equivalent one, using the equivalence, implication, double
negation and De Morgan laws, so by Fact 2.4 the result is equivalent to the formula you started with.

::: example Negation normal form
Bring ¬(A ⟶ B ∧ C) into NNF:

$$
\begin{array}{lll}
 & \lnot(A \imp B \land C) & \\
\equiv & \lnot(\lnot A \lor B \land C) & \text{implication} \\
\equiv & \lnot\lnot A \land \lnot(B \land C) & \text{De Morgan} \\
\equiv & A \land (\lnot B \lor \lnot C) & \text{double negation, De Morgan}
\end{array}
$$

The result is in NNF, and also in CNF: it is the conjunction of the clauses A and ¬B ∨ ¬C.
:::

### Conjunctive and disjunctive normal form {#cnf-dnf}

From NNF, the distributive laws do the rest:

- For **CNF**, move ∨ inside ∧: replace φ ∨ (ψ ∧ χ) by (φ ∨ ψ) ∧ (φ ∨ χ), and (φ ∧ ψ) ∨ χ by
  (φ ∨ χ) ∧ (ψ ∨ χ), until no ∧ is inside an ∨.
- For **DNF**, move ∧ inside ∨: replace φ ∧ (ψ ∨ χ) by (φ ∧ ψ) ∨ (φ ∧ χ), and (φ ∨ ψ) ∧ χ by
  (φ ∧ χ) ∨ (ψ ∧ χ), until no ∨ is inside an ∧.

Here χ ("chi") is one more letter for an arbitrary formula. Figure 2.3 shows the whole route.

::: figure id=fig-02-3
From any formula to CNF and DNF, with (A ⟶ B) ⟶ C as the example. Steps 1 and 2 give the negation normal
form; distributing one connective over the other then gives CNF or DNF.
:::

The door requirement `opens ⟶ badge ∧ pin ∨ fire` becomes ¬opens ∨ (badge ∧ pin) ∨ fire, which is
already in DNF, and distributing gives the CNF (¬opens ∨ badge ∨ fire) ∧ (¬opens ∨ pin ∨ fire). Read
back as rules, the two clauses say that when the door opens without a fire, there was a valid badge, and
there was the right PIN.

::: pitfall
Distribution can make formulas explode. Bringing (A₁ ∧ B₁) ∨ (A₂ ∧ B₂) ∨ … ∨ (Aₙ ∧ Bₙ) into CNF by
distribution gives $2^n$ clauses, one for each way of choosing Aᵢ or Bᵢ from every pair: 8 clauses for
three pairs, more than a million for twenty. This is why Isabelle's simplifier does not use the
distributive laws by default. A comment in `HOL.thy`, next to the list of laws the simplifier does use,
says that adding them "might cause exponential blow-up".
:::

::: note
SAT encodings can avoid this explosion with the **Tseitin transformation**: give each compound
sub-formula a new atom as its name, add clauses relating that name to its parts, and require the atom
naming the whole formula to be true. That last requirement matters: definitions of the names alone
would not require the original formula to hold. The resulting CNF has size proportional to the original
formula. It need not be logically equivalent over the expanded set of atoms, but it is
**equisatisfiable**: satisfiable if and only if the original is. Each satisfying valuation of the
original can be extended with suitable values for the new atoms, and a model of the CNF gives a model
of the original when the new atoms are discarded.
:::

### Normal forms from truth tables {#nf-tables}

A truth table gives both normal forms directly.

- **DNF:** for each row in which the formula is T, write the conjunction of literals that describes the
  row (A if A is T in the row, ¬A if A is F), and join these conjunctions with ∨.
- **CNF:** for each row in which the formula is F, write the clause that rules the row out (¬A if A is T
  in the row, A if A is F), and join these clauses with ∧.

::: example Exclusive or
Exclusive or, ¬(A ⟷ B), is true when exactly one of A and B is:

```truthtable
¬(A ⟷ B)
A ⟷ B
```

It is T in the rows A = T, B = F and A = F, B = T, so its DNF is (A ∧ ¬B) ∨ (¬A ∧ B). It is F in the rows
A = T, B = T and A = F, B = F; the clauses that rule them out are ¬A ∨ ¬B and A ∨ B, so its CNF is
(¬A ∨ ¬B) ∧ (A ∨ B).
:::

::: fact Normal forms exist
Every formula is equivalent to a formula in DNF and to a formula in CNF.
:::

The truth-table method proves it. In the corner cases, a formula with no T row gets the empty
disjunction, which is `False`, and one with no F row gets the empty conjunction, which is `True`. Fact 2.7
also shows that ¬, ∧ and ∨ can express every possible truth table; Exercise 2.7 shows that even fewer
connectives suffice.

::: isabelle
Each conversion is an equivalence, so `blast` can confirm it. Here are both results of Figure 2.3:

```isabelle
lemma "((A ⟶ B) ⟶ C) ⟷ (A ∧ ¬ B) ∨ C"
  by blast

lemma "((A ⟶ B) ⟶ C) ⟷ (A ∨ C) ∧ (¬ B ∨ C)"
  by blast
```

A slip shows up as a counterexample. Moving one pair of parentheses changes the meaning:

```isabelle
lemma "(A ∧ B) ∨ C ⟷ A ∧ (B ∨ C)"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = False
    B = False
    C = True
```

With A false and C true, the left side is true and the right side false.
:::

## Satisfiability and SAT solvers {#sat}

All the questions of this module come down to one problem.

::: definition The satisfiability problem
The **satisfiability problem**, **SAT** for short, asks: given a propositional formula, usually in
CNF, is it satisfiable? A **SAT solver** is a program that answers this question and, when the answer
is yes, returns a satisfying valuation.
:::

By Fact 2.1, φ is a tautology exactly when ¬φ is unsatisfiable. By Fact 2.5, φ₁, …, φₙ ⊨ ψ exactly when
φ₁ ∧ … ∧ φₙ ∧ ¬ψ is unsatisfiable, because a model of that formula is a bad row. And requirements are
consistent exactly when their conjunction is satisfiable. So one SAT solver answers every question of
this module.

How hard is SAT? Checking a proposed valuation is quick: evaluate the formula once. Finding one is
another matter, since a truth table has $2^n$ rows.

::: fact Cook's theorem
SAT is **NP-complete** (Stephen Cook, 1971).
:::

**NP** is the class of yes-or-no problems in which a "yes" can be *checked* quickly once someone proposes
a solution, that is, in a number of steps bounded by a polynomial in the size of the problem. SAT is one
of them. So are these: Can the exams be timetabled without clashes? Can this Sudoku be completed? Can
these versions of software packages be installed together? A problem is **NP-complete** if it is in NP
and every problem in NP can be translated into it efficiently. SAT was the first problem shown to be
NP-complete; Leonid Levin found the same result independently. So a fast (polynomial-time) algorithm for
SAT would give fast algorithms for every problem in NP. Nobody knows whether one exists: this is the
**P versus NP** question (P is the class of problems that can be *solved* in polynomial time), open since
1971 and one of the seven Millennium Prize Problems of the Clay Mathematics Institute.

Even so, SAT solving is a practical success. Truth-table enumeration takes exponential time in the
number of atoms; no polynomial-time algorithm for general SAT is known. Formulas from real problems
often have structure that solvers can exploit. Many solvers
descend from the **DPLL procedure**, named after Davis, Putnam, Logemann and Loveland, who described it in
the early 1960s. It works on a CNF and repeats two steps:

1. **Unit propagation.** If an unsatisfied clause has exactly one unassigned literal and all its other
   literals are false, that literal must be true: assign it accordingly. Repeat while possible.
2. **Decision.** Otherwise, choose an atom without a value and try a value for it.

When a clause becomes false (a **conflict**), the procedure goes back to its latest decision whose other
value it has not tried yet, undoes everything it did after that decision, and tries the other value. If
every clause becomes true, the formula is satisfiable; if a conflict leaves no decision to go back to,
the formula is unsatisfiable.

Since the late 1990s, solvers have added **conflict-driven clause learning (CDCL)**: after a conflict,
the solver analyses the conflict and adds a clause that rules out a combination of assignments
responsible for it. Retaining that clause prevents the same combination from being tried again.
Modern CDCL solvers can solve formulas from industry with
hundreds of thousands of atoms and millions of clauses.

::: example Unit propagation
Is this CNF satisfiable?

$$
(A \lor B) \land (\lnot A \lor C) \land (\lnot B \lor C) \land (\lnot C \lor D) \land \lnot D
$$

The last clause is a single literal, so D = F. Then the clause ¬C ∨ D forces C = F. Then ¬A ∨ C forces
A = F, and ¬B ∨ C forces B = F. Now A ∨ B is false: a conflict, reached without a single decision. The
formula is unsatisfiable, and the solver has shown it without writing the 16 rows of its truth table.
:::

SAT solvers are at work wherever a problem can be phrased as many yes-or-no choices with constraints
between them: checking that two circuits compute the same function, and searching a design for a run
that breaks a property within a fixed number of steps (bounded model checking); deciding which software
packages can be installed together (the Eclipse development environment resolves the dependencies of its
plug-ins with the SAT solver Sat4j); timetables and rosters. SMT solvers, such as Z3 and cvc5 from
Module 1, extend SAT solving with numbers, arrays and other data, and power program verifiers. And
Isabelle's Nitpick turns the search for a counterexample into a SAT problem.

::: isabelle
Isabelle contains a small CDCL solver of its own, and the proof method `sat` uses it. `sat` converts the
negation of the goal into CNF and asks the solver whether that is satisfiable. Here it confirms
Example 2.9:

```isabelle
lemma "¬ ((A ∨ B) ∧ (¬ A ∨ C) ∧ (¬ B ∨ C) ∧ (¬ C ∨ D) ∧ ¬ D)"
  by sat
```

Why trust the solver? You do not have to. When the solver finds the negated goal unsatisfiable, it also
returns the steps of its reasoning, a proof by resolution, and Isabelle replays every step in its
kernel: the LCF idea of Module 1. When the goal is not a tautology, the solver finds a model of its
negation, and `sat` fails with that valuation, a counterexample:

```isabelle fails
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  by sat
```

```output
*** exception THM 0 raised⌂: SAT solver found a countermodel:
*** A: true, B: true, C: false
```

The first line of the message is technical; the second is the counterexample you found in Section 2.4.
A second method, `satx`, first applies a definitional CNF transformation of the Tseitin kind, which keeps
the CNF of large goals small.
:::

## Requirements as propositional constraints {#requirements}

Back to the server-room door. After some discussion, the security team agrees on four requirements:

| | Requirement | Formula |
|---|---|---|
| R1 | The door opens only if a valid badge is shown and the correct PIN is entered, or the fire alarm is on. | `opens ⟶ badge ∧ pin ∨ fire` |
| R2 | When the fire alarm is on, the door opens. | `fire ⟶ opens` |
| R3 | During a lockdown, the door stays shut. | `lockdown ⟶ ¬ opens` |
| R4 | A valid badge with the correct PIN opens the door. | `badge ∧ pin ⟶ opens` |

The atoms `badge`, `pin`, `fire` and `lockdown` describe the situation: the sensors report them, and the
controller cannot choose them. `opens` is the controller's decision. Three questions matter:

1. Are the requirements consistent: is there at least one situation and decision satisfying them all?
2. Can it meet them in every situation, whatever the sensors report?
3. Do they guarantee the properties the team cares about?

::: definition Consistent requirements
A set of requirements, written as formulas, is **consistent** if their conjunction is satisfiable: some
valuation makes all of them true.
:::

### Consistency {#consistency}

::: isabelle
Nitpick looks for counterexamples, and by Fact 2.1 a counterexample to ¬φ is a model of φ. So to find a
model of the requirements, state their negation and ask Nitpick for a counterexample:

```isabelle
lemma "¬ ((opens ⟶ badge ∧ pin ∨ fire) ∧
         (fire ⟶ opens) ∧
         (lockdown ⟶ ¬ opens) ∧
         (badge ∧ pin ⟶ opens))"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    badge = True
    fire = False
    lockdown = False
    opens = False
    pin = False
```

The counterexample to the negation is a model of the requirements: with a valid badge, the wrong PIN, no
fire and no lockdown, a shut door meets all four. So the requirements are consistent.
:::

::: tip
Nitpick can also look for a model directly: `nitpick [satisfy]` on the requirements themselves (without
the ¬) reports "Nitpick found a model", followed by the valuation.
:::

### Situations that break the requirements {#scenarios}

One model is not enough: the door must work in every situation, including rare ones. What happens during
a lockdown when the fire alarm goes off? Add `fire` and `lockdown` to the requirements and ask whether the
result is still satisfiable:

```isabelle
lemma "¬ ((opens ⟶ badge ∧ pin ∨ fire) ∧
         (fire ⟶ opens) ∧
         (lockdown ⟶ ¬ opens) ∧
         (badge ∧ pin ⟶ opens) ∧
         fire ∧ lockdown)"
  by blast
```

Isabelle proves that no valuation satisfies them. In a fire during a lockdown, R2 says that the door
must open and R3 that it must stay shut, and no controller can do both. The same happens between R3 and
R4 when someone shows a valid badge and the right PIN during a lockdown. Conflicts like these hide in
combinations of rare events, which is exactly where testing seldom looks. And in these situations
Fact 2.6 applies: from the requirements **together with the conflicting sensor readings**, any conclusion
follows, even that the door is both open and shut. The original requirements are satisfiable in other
situations; the problem is that they cannot all hold in these situations. A proof restricted to
impossible premises gives no assurance about how a controller should respond.

### Repairing the requirements {#repair}

The conflicts are not mistakes in logic but decisions nobody has made, and only the people who wrote the
requirements can make them; this is validation, in the sense of Module 1. Suppose the team decides that
people's safety comes first: a fire overrides a lockdown, and a lockdown overrides badges. R3 and R4
become:

| | Requirement | Formula |
|---|---|---|
| R3′ | During a lockdown, the door stays shut unless the fire alarm is on. | `lockdown ∧ ¬ fire ⟶ ¬ opens` |
| R4′ | A valid badge with the correct PIN opens the door, except during a lockdown. | `badge ∧ pin ∧ ¬ lockdown ⟶ opens` |

Now a stronger check is possible. Together with R1 and R2, the new requirements fix the door's behaviour
completely: they force `opens` to have the same value as fire ∨ (badge ∧ pin ∧ ¬lockdown).

```isabelle
lemma door_determined:
  "(opens ⟶ badge ∧ pin ∨ fire) ∧
   (fire ⟶ opens) ∧
   (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
   (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
   ⟶ (opens ⟷ fire ∨ badge ∧ pin ∧ ¬ lockdown)"
  by blast
```

Conversely, a controller that opens the door exactly when fire ∨ (badge ∧ pin ∧ ¬lockdown) meets all
four requirements, whatever the sensors report:

```isabelle
lemma door_rule_ok:
  "(opens ⟷ fire ∨ badge ∧ pin ∧ ¬ lockdown) ⟶
   (opens ⟶ badge ∧ pin ∨ fire) ∧
   (fire ⟶ opens) ∧
   (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
   (badge ∧ pin ∧ ¬ lockdown ⟶ opens)"
  by blast
```

The lemma `door_rule_ok` is verification in miniature. The requirements are the specification, the rule
for `opens` is the implementation, and the proof covers all sixteen situations of the four sensors at
once. It also shows that the repaired requirements are consistent in every situation, since in each one
the rule's decision meets them all. The lemma `door_determined` adds that no other decision would: the
requirements leave the controller no choice.

### Properties that follow, and one that does not {#properties}

Finally, the properties. The team wants to be sure that, outside a fire, the controller never commands
the door to unlock without the right PIN: `opens ∧ ¬ fire ⟶ pin`. It follows from the requirements.
Whether this prevents unauthorised physical entry also depends on aspects outside this model:

```isabelle
lemma "(opens ⟶ badge ∧ pin ∨ fire) ∧
       (fire ⟶ opens) ∧
       (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
       (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
       ⟶ (opens ∧ ¬ fire ⟶ pin)"
  by blast
```

The old promise "during a lockdown, the door stays shut" no longer follows:

```isabelle
lemma "(opens ⟶ badge ∧ pin ∨ fire) ∧
       (fire ⟶ opens) ∧
       (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
       (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
       ⟶ (lockdown ⟶ ¬ opens)"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    badge = False
    fire = True
    lockdown = True
    opens = True
    pin = False
```

The counterexample is a fire during a lockdown, with the door open: exactly the decision the team made.
A counterexample is not always a bug. Here it documents a deliberate trade-off in one concrete
situation, which is the best way to show it to the people who must accept it. If they did not expect
it, the requirements are wrong, not the proof.

::: keyidea
To analyse requirements with propositional logic: choose atoms, separating what the environment decides
from what the system decides; write each requirement as a formula; check that the requirements are
consistent, also in the rare situations that matter; prove that the properties you need follow; and
read every counterexample as a situation to discuss. Each of these checks is a satisfiability question.
:::

Our propositional model has limits. Its atoms describe a single situation, so they do not express
"the door locks again ten seconds after the alarm stops" or quantify over every employee and department.
One can encode finitely many employees or time steps using more atoms, but propositional logic has no
variables ranging over objects or times. Predicate logic in Module 3 adds objects and quantifiers,
and Module 13 models systems that change over time.

## What you learned {#summary}

- A **proposition** is true or false. Formulas are built from **atoms**, `True` and `False` with ¬, ∧, ∨,
  ⟶ and ⟷, by an inductive definition, and each formula has a **parse tree**.
- In Isabelle, ¬ binds most tightly, then ∧, then ∨, then ⟶ and ⟷, which share a priority; the binary
  connectives group to the right. Isabelle prints ⟷ as `=`. Mix ⟶ and ⟷ only with parentheses.
- A **valuation** gives each atom a truth value, and a **truth table** lists all $2^n$ valuations.
  A ⟶ B is false only when A is true and B false.
- A formula is a **tautology** (true in every row), **contingent** (true in some rows and false in
  others) or a **contradiction** (true in none); φ is a tautology exactly when ¬φ is unsatisfiable.
- φ ≡ ψ when φ ⟷ ψ is a tautology. The **laws** (De Morgan, distributivity, contrapositive …) transform
  formulas without changing their meaning.
- φ₁, …, φₙ ⊨ ψ when no row makes the premises true and ψ false. Modus ponens and modus tollens are
  valid; affirming the consequent and denying the antecedent are not. Inconsistent premises entail
  everything.
- Every formula has an equivalent **NNF**, **CNF** and **DNF**. Distribution can make a CNF exponentially
  large; the Tseitin transformation avoids that.
- **SAT** is NP-complete (Cook, 1971), yet CDCL solvers decide very large formulas in practice.
- For requirements, **consistency** is satisfiability, a property follows when requirements ⟶ property is
  a tautology, and each counterexample is a situation to discuss.
- In Isabelle, a lemma whose variables have type `bool` claims a tautology. `simp`, `blast` and `auto`
  prove tautologies (`blast` and `auto` more of them than `simp`); `quickcheck` and `nitpick` find
  counterexamples; a counterexample to ¬φ is a model of φ. These methods have different strengths;
  failure of one method does not establish that a claim is false.

The Mathematical Foundations series covers propositional and predicate logic for computing in general,
with more practice, in [Logic, quantifiers, and specifications](../math/module_02_EN.html).

## Exercises {#exercises}

:::: exercise Parentheses and main connectives {#ex-2-1} ★
Add all the parentheses that Isabelle's priorities imply, and name the main connective of each formula.

1. ¬A ∨ B ∧ C
2. A ∧ B ⟶ C ∨ D
3. A ⟶ B ⟶ C ∧ D
4. A ∨ B ⟷ C ⟶ D

::: solution
1. (¬A) ∨ (B ∧ C). The main connective is ∨.
2. (A ∧ B) ⟶ (C ∨ D). The main connective is ⟶.
3. A ⟶ (B ⟶ (C ∧ D)). The main connective is the first ⟶, because ⟶ groups to the right.
4. (A ∨ B) ⟷ (C ⟶ D). ∨ binds more tightly than ⟷ and ⟶, which have the same priority and group to the
   right. The main connective is ⟷.

`value` confirms the third answer: it prints the fully parenthesised formula without the parentheses
that the priorities make unnecessary.

```isabelle
value "A ⟶ (B ⟶ (C ∧ D))"
```

```output
"A ⟶ B ⟶ C ∧ D"
  :: "bool"
```
:::
::::

:::: exercise Classify by truth table {#ex-2-2} ★
Use truth tables to classify each formula as a tautology, a contradiction or contingent. For each
contingent formula, give a model and a counterexample.

1. (A ⟶ B) ∨ (B ⟶ A)
2. (A ⟶ B) ∧ A ∧ ¬B
3. (A ⟶ B) ⟶ (B ⟶ A)
4. (A ∧ B ⟶ C) ⟶ (A ⟶ C) ∨ (B ⟶ C)

::: solution
1. A tautology. Whatever the values, one of the two implications is true: if B is true, A ⟶ B is; if B
   is false, B ⟶ A is.

```truthtable
(A ⟶ B) ∨ (B ⟶ A)
A ⟶ B
B ⟶ A
```

2. A contradiction: A ⟶ B and A force B, which contradicts ¬B.

```truthtable
(A ⟶ B) ∧ A ∧ ¬B
A ⟶ B
¬B
```

3. Contingent. A model: A = T, B = T. A counterexample: A = F, B = T, where A ⟶ B is true but its
   converse B ⟶ A is false.

```truthtable
(A ⟶ B) ⟶ (B ⟶ A)
A ⟶ B
B ⟶ A
```

4. A tautology, perhaps surprisingly. The conclusion is false only when both A ⟶ C and B ⟶ C are false,
   that is, when A and B are true and C is false; but then the premise A ∧ B ⟶ C is false too.

```truthtable
(A ∧ B ⟶ C) ⟶ (A ⟶ C) ∨ (B ⟶ C)
A ∧ B ⟶ C
(A ⟶ C) ∨ (B ⟶ C)
```
:::
::::

:::: exercise Equivalences by the laws {#ex-2-3} ★★
Show with the laws of Fact 2.3, step by step and naming each law, that

1. (A ⟶ B) ∧ (A ⟶ C) ≡ A ⟶ B ∧ C
2. A ⟶ (B ⟶ C) ≡ B ⟶ (A ⟶ C)
3. ¬fire ⟶ (opens ⟶ badge ∧ pin) ≡ opens ⟶ badge ∧ pin ∨ fire (the two readings of Example 2.1)

Then check all three in Isabelle.

::: solution
1. (A ⟶ B) ∧ (A ⟶ C) ≡ (¬A ∨ B) ∧ (¬A ∨ C) by implication, twice; ≡ ¬A ∨ (B ∧ C) by distributivity,
   read from right to left; ≡ A ⟶ B ∧ C by implication.
2. A ⟶ (B ⟶ C) ≡ A ∧ B ⟶ C by exportation; ≡ B ∧ A ⟶ C by commutativity; ≡ B ⟶ (A ⟶ C) by exportation.
3. ¬fire ⟶ (opens ⟶ badge ∧ pin) ≡ ¬fire ∧ opens ⟶ badge ∧ pin by exportation; ≡ ¬(¬fire ∧ opens) ∨
   (badge ∧ pin) by implication; ≡ (fire ∨ ¬opens) ∨ (badge ∧ pin) by De Morgan and double negation;
   ≡ ¬opens ∨ ((badge ∧ pin) ∨ fire) by commutativity and associativity; ≡ opens ⟶ badge ∧ pin ∨ fire by
   implication.

```isabelle
lemma "(A ⟶ B) ∧ (A ⟶ C) ⟷ (A ⟶ B ∧ C)"
  by blast

lemma "(A ⟶ (B ⟶ C)) ⟷ (B ⟶ (A ⟶ C))"
  by blast

lemma "(¬ fire ⟶ (opens ⟶ badge ∧ pin)) ⟷ (opens ⟶ badge ∧ pin ∨ fire)"
  by blast
```
:::
::::

:::: exercise Valid or invalid? {#ex-2-4} ★★
Write each argument with premises and a conclusion, and decide whether it is valid. For each invalid
argument, give a counterexample. Then check your answers in Isabelle.

1. If the cache is warm, the request is fast. The request is not fast. So the cache is not warm.
2. If the input is valid, the parser accepts it. The input is not valid. So the parser does not accept
   it.
3. The service uses TLS or runs on an internal network. It does not run on an internal network. So it
   uses TLS.
4. If the job runs at night, it finishes early. If it finishes early, the report is ready. The report is
   ready. So the job ran at night.

::: solution
1. `warm ⟶ fast`, `¬ fast` ⊨ `¬ warm`: modus tollens, valid.
2. `ok ⟶ accepts`, `¬ ok` ⊨ `¬ accepts` (with `ok` for "the input is valid"): denying the antecedent,
   invalid. Counterexample: ok = F, accepts = T, a lenient parser that accepts some invalid input.
3. `tls ∨ internal`, `¬ internal` ⊨ `tls`: disjunctive syllogism, valid.
4. `night ⟶ early`, `early ⟶ ready`, `ready` ⊨ `night`: invalid, a form of affirming the consequent.
   Counterexample: night = F, early = F, ready = T; the report can be ready for another reason.

```isabelle
lemma "(warm ⟶ fast) ∧ ¬ fast ⟶ ¬ warm"
  by blast

lemma "(ok ⟶ accepts) ∧ ¬ ok ⟶ ¬ accepts"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    accepts = True
    ok = False
```

```isabelle
lemma "(tls ∨ internal) ∧ ¬ internal ⟶ tls"
  by blast

lemma "(night ⟶ early) ∧ (early ⟶ ready) ∧ ready ⟶ night"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    early = False
    night = False
    ready = True
```
:::
::::

:::: exercise Normal forms {#ex-2-5} ★★
Bring each formula into NNF, then into CNF and DNF. Check your answers in Isabelle.

1. A ⟷ B
2. ¬(A ∨ B ⟶ C)

::: solution
1. Remove ⟷, then ⟶: A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) ≡ (¬A ∨ B) ∧ (¬B ∨ A). This is in NNF and already in
   CNF. For DNF, distribute: (¬A ∧ ¬B) ∨ (¬A ∧ A) ∨ (B ∧ ¬B) ∨ (B ∧ A). The middle two conjunctions are
   contradictions, equivalent to False, and φ ∨ False ≡ φ, so the DNF is (¬A ∧ ¬B) ∨ (A ∧ B).
2. Remove ⟶ and push ¬ inwards: ¬(A ∨ B ⟶ C) ≡ ¬(¬(A ∨ B) ∨ C) ≡ ¬¬(A ∨ B) ∧ ¬C ≡ (A ∨ B) ∧ ¬C. This is
   in NNF and in CNF (two clauses). Distributing gives the DNF (A ∧ ¬C) ∨ (B ∧ ¬C).

```isabelle
lemma "(A ⟷ B) ⟷ (¬ A ∨ B) ∧ (¬ B ∨ A)"
  by blast

lemma "(A ⟷ B) ⟷ (¬ A ∧ ¬ B) ∨ (A ∧ B)"
  by blast

lemma "¬ (A ∨ B ⟶ C) ⟷ (A ∨ B) ∧ ¬ C"
  by blast

lemma "¬ (A ∨ B ⟶ C) ⟷ (A ∧ ¬ C) ∨ (B ∧ ¬ C)"
  by blast
```
:::
::::

:::: exercise A pump controller {#ex-2-6} ★★
A pump fills a water tank. Two sensors report `low` (the water is below the low mark) and `high` (the
water is above the high mark); a switch selects `manual` mode; the controller decides `pump`. The
requirements are:

- R1: If the water is low and the mode is automatic, the pump runs.
- R2: If the water is high, the pump does not run.
- R3: In manual mode, the pump runs.

1. Write the requirements as formulas and use Nitpick to show that they are consistent.
2. Find a situation in which they conflict, and prove the conflict in Isabelle. How would you repair
   the requirements?
3. With your repair, does "if the water is low, the pump runs" follow? Does it follow if you add the
   assumption that the water cannot be both low and high?

::: solution
1. R1 is `low ∧ ¬ manual ⟶ pump`, R2 is `high ⟶ ¬ pump`, R3 is `manual ⟶ pump`. A counterexample to
   their negation is a model of the three:

```isabelle
lemma "¬ ((low ∧ ¬ manual ⟶ pump) ∧
         (high ⟶ ¬ pump) ∧
         (manual ⟶ pump))"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    high = False
    low = False
    manual = False
    pump = True
```

   In automatic mode, with the water between the marks, the pump may run.

2. In manual mode with the water high, R3 says the pump runs and R2 says it does not:

```isabelle
lemma "¬ ((low ∧ ¬ manual ⟶ pump) ∧
         (high ⟶ ¬ pump) ∧
         (manual ⟶ pump) ∧
         manual ∧ high)"
  by blast
```

   Ask the engineers which requirement wins. Protecting the tank from overflowing is the likely
   answer, so R3 becomes R3′: `manual ∧ ¬ high ⟶ pump`.

   There is a second conflict, which R3′ does not remove: in automatic mode, with the water reported
   both low and high, R1 says the pump runs and R2 says it does not. Working sensors never report
   both when the marks are ordered as described; part 3 makes that environmental assumption explicit.

3. Not on its own. Nitpick finds a situation in which the water is reported both low and high, in manual
   mode, and the pump is off:

```isabelle
lemma "(low ∧ ¬ manual ⟶ pump) ∧
       (high ⟶ ¬ pump) ∧
       (manual ∧ ¬ high ⟶ pump)
       ⟶ (low ⟶ pump)"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    high = True
    low = True
    manual = True
    pump = False
```

   With the assumption `¬ (low ∧ high)`, which describes the sensors (the environment) rather than the
   controller, the property follows:

```isabelle
lemma "¬ (low ∧ high) ∧
       (low ∧ ¬ manual ⟶ pump) ∧
       (high ⟶ ¬ pump) ∧
       (manual ∧ ¬ high ⟶ pump)
       ⟶ (low ⟶ pump)"
  by blast
```

   Assumptions about the environment are part of a specification: without them, a correct controller
   can look wrong.
:::
::::

:::: exercise Two connectives are enough {#ex-2-7} ★★★
1. Show that every formula is equivalent to one that uses only ⟶ and `False`: give such formulas for
   ¬A, A ∨ B, A ∧ B and A ⟷ B, and check them in Isabelle. Why does this cover every formula?
2. Show that ∧ and ∨ alone are not enough: no formula built from atoms with ∧ and ∨ only (without ¬,
   ⟶, ⟷, `True` or `False`) is equivalent to ¬A. Hint: what is the value of such a formula when every
   atom is T?

::: solution
1. ¬A ≡ A ⟶ False, as the truth tables show. Then A ∨ B ≡ ¬A ⟶ B ≡ (A ⟶ False) ⟶ B, and
   A ∧ B ≡ ¬(A ⟶ ¬B) ≡ (A ⟶ B ⟶ False) ⟶ False. For ⟷, use A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) and the
   formula for ∧: ((A ⟶ B) ⟶ (B ⟶ A) ⟶ False) ⟶ False.

```isabelle
lemma "¬ A ⟷ (A ⟶ False)"
  by blast

lemma "A ∨ B ⟷ ((A ⟶ False) ⟶ B)"
  by blast

lemma "A ∧ B ⟷ ((A ⟶ B ⟶ False) ⟶ False)"
  by blast

lemma "(A ⟷ B) ⟷ (((A ⟶ B) ⟶ (B ⟶ A) ⟶ False) ⟶ False)"
  by blast
```

   This covers every formula: by substitution (Fact 2.4) the equivalences hold with any formulas in
   place of A and B, so you can replace the connectives one at a time, from the inside out, and by
   replacement each step gives an equivalent formula. `True` is equivalent to False ⟶ False.

2. Every formula built from atoms with ∧ and ∨ only is T under the valuation that makes every atom T.
   Atoms are T under it; and if φ and ψ are T, so are φ ∧ ψ and φ ∨ ψ. Since the formulas are built by
   these rules and only by them (Definition 2.3), every such formula is T. But ¬A is F under that
   valuation, so none of them is equivalent to ¬A. This style of argument, which follows the rules of an
   inductive definition, is **structural induction**; Module 5 treats it properly.
:::
::::

:::: exercise Knights and knaves {#ex-2-8} ★★★
On an island, knights always tell the truth and knaves always lie. You meet two inhabitants, P and Q.
P says: "Q is a knave." Q says: "P and I are of the same kind." Let `p` mean "P is a knight" and `q`
"Q is a knight".

1. Explain why P's statement gives the constraint p ⟷ ¬q, and write Q's statement as a constraint.
2. Use Nitpick to find out who is a knight and who a knave.
3. Prove in Isabelle that this is the only solution.

::: solution
1. If P is a knight, what P says is true; if P is a knave, it is false. So "P says S" means p ⟷ S. P says
   ¬q, which gives p ⟷ ¬q. Q says that P and Q are of the same kind, p ⟷ q, which gives q ⟷ (p ⟷ q).
2. A counterexample to the negation of the constraints is a model of them:

```isabelle
lemma "¬ ((p ⟷ ¬ q) ∧ (q ⟷ (p ⟷ q)))"
  nitpick
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    p = True
    q = False
```

   P is a knight and Q is a knave. Check: P truthfully says that Q is a knave, and Q falsely claims that
   the two are of the same kind.

3. The constraints imply this solution:

```isabelle
lemma "(p ⟷ ¬ q) ∧ (q ⟷ (p ⟷ q)) ⟶ p ∧ ¬ q"
  by blast
```

   Q's constraint alone already forces p: q ⟷ (p ⟷ q) is equivalent to p. If p is true, p ⟷ q has the
   same value as q, so the constraint is true; if p is false, p ⟷ q has the opposite value to q, so the
   constraint is false. With p true, P's constraint p ⟷ ¬q makes q false.
:::
::::

## Check yourself {#quiz}

```quiz
? How does Isabelle read ¬A ∧ B ⟶ C?
- [ ] ¬(A ∧ B ⟶ C)
- [x] ((¬A) ∧ B) ⟶ C
- [ ] (¬A) ∧ (B ⟶ C)
- [ ] (¬(A ∧ B)) ⟶ C
> ¬ binds most tightly, then ∧, then ⟶. So ¬ applies to A alone, ∧ joins ¬A and B, and ⟶ is the main connective.

? When is A ⟶ B false?
- [ ] When A is false
- [ ] When A and B are both false
- [ ] When B is true and A is false
- [x] Only when A is true and B is false
> An implication is broken only when its antecedent holds and its consequent does not. When A is false, A ⟶ B is vacuously true.

? A formula φ and its negation ¬φ are both satisfiable. What is φ?
- [x] Contingent: true in some rows and false in others
- [ ] A tautology
- [ ] A contradiction
- [ ] This cannot happen
> φ satisfiable means some row makes φ true; ¬φ satisfiable means some row makes φ false. So φ is neither a tautology nor a contradiction.

? Which argument form is invalid?
- [ ] From A ⟶ B and A, conclude B
- [ ] From A ⟶ B and ¬B, conclude ¬A
- [x] From A ⟶ B and B, conclude A
- [ ] From A ∨ B and ¬A, conclude B
> This is affirming the consequent. The row A = F, B = T makes both premises true and the conclusion false.

? `by simp` fails on a lemma about a propositional formula. What do you know?
- [ ] The formula is not a tautology
- [x] Nothing yet: try `blast` or `auto`, or look for a counterexample with `quickcheck` or `nitpick`
- [ ] The formula is a contradiction
- [ ] Isabelle cannot handle propositional formulas
> A failed proof is not a counterexample: `simp` fails on Peirce's law, which is a tautology. Only a successful proof or a counterexample settles the question.

? Nitpick finds a counterexample to ¬(R1 ∧ R2 ∧ R3). What does that show?
- [ ] R1 ∧ R2 ∧ R3 is a tautology
- [ ] The requirements are inconsistent
- [ ] One of the requirements is wrong
- [x] The requirements are consistent: the counterexample satisfies all three
> A counterexample to ¬(R1 ∧ R2 ∧ R3) makes that negation false, so it makes R1 ∧ R2 ∧ R3 true. It is a model of the requirements, which shows that they can all hold at once.
```
