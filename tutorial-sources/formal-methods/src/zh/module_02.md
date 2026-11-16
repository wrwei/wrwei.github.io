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
is one that is not built from other propositions. In formulas, atoms are names such as A, B or `fire`.
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
true, whereas the "or" of "tea or coffee?" means one but not both, which is *exclusive or*, ¬(A ⟷ B).
And **but** adds a contrast that logic ignores: "the badge is valid but the door stays shut" is
`badge ∧ ¬ opens`.

::: pitfall
"A only if B" is A ⟶ B, not B ⟶ A. "The door opens only if the badge is valid" says that whenever the
door opens, the badge was valid: `opens ⟶ badge`. It does not say that a valid badge opens the door;
that would be `badge ⟶ opens`, "the door opens if the badge is valid". A requirement with "only if"
limits what the system may do; it never forces the system to act.
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
yours. `value`, which you met in Module 1, cannot compute a truth value for a formula with variables;
for formulas like these, it prints the formula back. Put the cursor on each line in turn:

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

The tables on these pages are computed from their formulas when the page is built, so they contain no
slips. They list the atoms in alphabetical order, start with the row in which every atom is T, and end
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

With variables, `value` does not try the valuations for you. It prints the formula back, even when the
formula is true in every row:

```isabelle
value "A ∨ ¬ A"
```

```output
"A ∨ ¬ A"
  :: "bool"
```

To show that a formula is true in every row you need a proof, the subject of the next section.
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

- `simp`, the simplifier from Module 1, rewrites the goal with equations it knows until it becomes
  `True`.
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

"Failed to apply initial proof method" means that `simp` could not even start: none of its equations
applies to the goal. `blast` proves it:

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
(Section 2.8). For propositional formulas both answer at once. On a tautology both come back
empty-handed, with "Quickcheck found no counterexample." and "Nitpick found no counterexample".
Isabelle/jEdit runs Quickcheck automatically on every new lemma, as you saw in Module 1; Nitpick runs
only when you call it.
:::

::: keyidea
A proof shows that a formula is a tautology; a counterexample shows that it is not. A failed proof shows
neither, because the method may have been too weak, and "no counterexample found" is not a proof. In
Isabelle a question is settled only when `by …` succeeds or a counterexample appears.
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

So the test is equivalent to `if not valid or expired:`. Read as an implication, "if the ticket is
valid, it has expired", it suggests that the original test does not say what its author meant.
Simplifying a condition is a cheap way to find out what it really says.
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
definitions, as Module 7 explains.) `blast` proves the whole simplification of Example 2.5 in one step:

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
consistent. From inconsistent requirements every property follows, including its opposite, and every
proof succeeds.
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
- A formula is in **negation normal form (NNF)** if it uses only ¬, ∧ and ∨, and every ¬ stands directly
  in front of an atom.
- A formula is in **conjunctive normal form (CNF)** if it is a conjunction of clauses, such as
  (A ∨ ¬B) ∧ (¬A ∨ C ∨ D) ∧ ¬C.
- A formula is in **disjunctive normal form (DNF)** if it is a disjunction of conjunctions of literals,
  such as (A ∧ ¬B) ∨ (¬A ∧ C) ∨ D.
:::

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
SAT solvers avoid the explosion with the **Tseitin transformation**, which gives each sub-formula a new
atom as its name and adds a few clauses that define it. The resulting CNF grows only in proportion to
the original formula. It is not equivalent to the original, because it has extra atoms, but it is
**equisatisfiable**: satisfiable if and only if the original is, which is all a SAT solver needs.
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

## 可满足性与 SAT 求解器 {#sat}

本模块的所有问题都可以归结为同一个问题。

::: definition 可满足性问题
**可满足性问题**（satisfiability problem），简称 **SAT**，问的是：给定一个命题公式（通常是合取范式），它是可满足的吗？**SAT 求解器**（SAT solver）是回答这个问题的程序；当答案为“是”时，它还会返回一个满足该公式的赋值。
:::

由事实 2.1，φ 是重言式当且仅当 ¬φ 不可满足。由事实 2.5，φ₁, …, φₙ ⊨ ψ 当且仅当 φ₁ ∧ … ∧ φₙ ∧ ¬ψ 不可满足，因为这个公式的模型正是一个坏行。而一组需求是一致的，当且仅当它们的合取是可满足的。所以，一个 SAT 求解器就能回答本模块的所有问题。

SAT 有多难？检查别人给出的一个赋值很快：只要对公式求一次值。自己找出一个这样的赋值则是另一回事，因为真值表有 $2^n$ 行。

::: fact 库克定理
SAT 是 **NP 完全**的。这是斯蒂芬·库克（Stephen Cook）在 1971 年证明的。
:::

**NP** 是这样一类判定问题（即回答“是”或“否”的问题）：一旦有人给出一个解，答案“是”就能很快地得到**检验**，也就是说，检验所需的步数不超过问题规模的某个多项式。SAT 就是其中之一。下面这些问题也是：考试能否排出一张没有冲突的时间表？这个数独能否填完？这几个版本的软件包能否一起安装？如果一个问题属于 NP，并且 NP 中的每个问题都能高效地转化为它，这个问题就是 **NP 完全**的（NP-complete）。SAT 是第一个被证明为 NP 完全的问题；列昂尼德·列文（Leonid Levin）独立地得到了同样的结果。因此，只要 SAT 有一个快速的（多项式时间的）算法，NP 中的每个问题就都有快速算法。没有人知道这样的算法是否存在：这就是 **P 与 NP 问题**（P versus NP），其中 P 是能在多项式时间内**求解**的问题类。这个问题自 1971 年以来一直悬而未决，是克雷数学研究所的七个千禧年大奖难题之一。

尽管如此，SAT 求解仍是计算机科学在实践中取得的伟大成功之一。最坏情况需要指数时间，但来自实际问题的公式是有结构的，求解器能利用这些结构。大多数求解器都源自 **DPLL 算法**（DPLL procedure），它以 Davis、Putnam、Logemann 和 Loveland 的名字命名，他们在 20 世纪 60 年代初描述了这个算法。它作用于合取范式，反复执行两个步骤：

1. **单元传播**（unit propagation）。如果一个子句中除了一个文字之外，其余文字都为假，那么剩下的那个文字必须为真：把它设为真。只要还能这样做，就一直重复。
2. **决策**（decision）。否则，选一个还没有取值的原子，给它试一个值。

当某个子句变为假时，就出现了**冲突**（conflict）。这时算法回到最近的、另一个值还没有试过的那个决策，撤销该决策之后所做的一切，然后试另一个值。如果每个子句都变为真，公式就是可满足的；如果发生冲突时已经没有可以回退的决策，公式就是不可满足的。

从 20 世纪 90 年代末开始，求解器加入了**冲突驱动子句学习**（conflict-driven clause learning，CDCL）：出现冲突后，求解器找出是哪些决策导致了这个冲突，并加入一个排除这种组合的子句，这样搜索就永远不会犯同样的错误两次。现代 CDCL 求解器经常能判定来自工业界的、含有几十万个原子和几百万个子句的公式。

::: example 单元传播
这个合取范式是可满足的吗？

$$
(A \lor B) \land (\lnot A \lor C) \land (\lnot B \lor C) \land (\lnot C \lor D) \land \lnot D
$$

最后一个子句是单个文字，所以 D = F。于是子句 ¬C ∨ D 迫使 C = F。接着 ¬A ∨ C 迫使 A = F，¬B ∨ C 迫使 B = F。这时 A ∨ B 为假：出现了冲突，而且一次决策都没有做。这个公式是不可满足的，求解器没有写出它的 16 行真值表就证明了这一点。
:::

凡是能表述成许多相互约束的是非选择的问题，都有 SAT 求解器的用武之地：检查两个电路是否计算同一个函数，以及在一个设计中搜索在固定步数之内违反某条性质的运行（即有界模型检测）；判定哪些软件包可以一起安装（Eclipse 开发环境就用 SAT 求解器 Sat4j 来解决其插件之间的依赖关系）；排课表和排班表。SMT 求解器，例如模块 1 中提到的 Z3 和 cvc5，用数、数组和其他数据扩展了 SAT 求解，是程序验证器背后的引擎。Isabelle 的 Nitpick 则把寻找反例的问题转化为 SAT 问题。

::: isabelle
Isabelle 自带一个小型 CDCL 求解器，证明方法 `sat` 就使用它。`sat` 把目标的否定转换成合取范式，然后问求解器它是否可满足。下面用它确认例 2.9：

```isabelle
lemma "¬ ((A ∨ B) ∧ (¬ A ∨ C) ∧ (¬ B ∨ C) ∧ (¬ C ∨ D) ∧ ¬ D)"
  by sat
```

为什么要信任求解器？你不必信任它。当求解器发现否定后的目标不可满足时，它还会返回推理的各个步骤，即一个归结证明（proof by resolution），而 Isabelle 会在内核中重放每一步：这正是模块 1 中的 LCF 思想。当目标不是重言式时，求解器会找到目标的否定的一个模型，于是 `sat` 失败，并给出这个赋值，也就是一个反例：

```isabelle fails
lemma "A ⟶ B ⟶ A ∧ B ∧ C"
  by sat
```

```output
*** exception THM 0 raised⌂: SAT solver found a countermodel:
*** A: true, B: true, C: false
```

消息的第一行是技术性的；第二行说 SAT 求解器找到了一个反模型（countermodel），也就是你在第 2.4 节中找到的那个反例。另一个方法 `satx` 会先做一次 Tseitin 式的定义式合取范式变换，使大目标的合取范式保持较小的规模。
:::

## 把需求写成命题约束 {#requirements}

回到机房的门。经过一番讨论，安全团队就四条需求达成了一致：

| | 需求 | 公式 |
|---|---|---|
| R1 | 仅当出示了有效的门禁卡并输入了正确的密码，或者火警正在报警时，门才打开。 | `opens ⟶ badge ∧ pin ∨ fire` |
| R2 | 火警正在报警时，门打开。 | `fire ⟶ opens` |
| R3 | 封锁期间，门保持关闭。 | `lockdown ⟶ ¬ opens` |
| R4 | 有效的门禁卡加上正确的密码能打开门。 | `badge ∧ pin ⟶ opens` |

原子 `badge`、`pin`、`fire` 和 `lockdown`（正处于封锁状态）描述的是情形：它们由传感器报告，控制器无法选择。`opens` 是控制器的决定。有三个问题很重要：

1. 这些需求是一致的吗？也就是说，控制器能否同时满足它们？
2. 无论传感器报告什么，控制器能否在每一种情形下都满足它们？
3. 它们能否保证团队关心的那些性质？

::: definition 一致的需求
如果一组写成公式的需求的合取是可满足的，也就是存在一个赋值使它们全都为真，就称这组需求是**一致的**（consistent）。
:::

### 一致性 {#consistency}

::: isabelle
Nitpick 寻找反例，而由事实 2.1，¬φ 的反例就是 φ 的模型。所以，要找需求的一个模型，就写出它们的否定，再请 Nitpick 找反例：

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

这个否定式的反例就是需求的一个模型：门禁卡有效、密码错误、没有火警、也没有封锁时，门关着就满足全部四条需求。所以这些需求是一致的。
:::

::: tip
Nitpick 也可以直接找模型：对需求本身（不加 ¬）使用 `nitpick [satisfy]`，它会报告“Nitpick found a model”（Nitpick 找到了一个模型），后面跟着那个赋值。
:::

### 让需求失效的情形 {#scenarios}

有一个模型还不够：门必须在每一种情形下都能正常工作，包括罕见的情形。在封锁期间，如果火警响了，会怎么样？把 `fire` 和 `lockdown` 加到需求中，看看结果是否仍然可满足：

```isabelle
lemma "¬ ((opens ⟶ badge ∧ pin ∨ fire) ∧
         (fire ⟶ opens) ∧
         (lockdown ⟶ ¬ opens) ∧
         (badge ∧ pin ⟶ opens) ∧
         fire ∧ lockdown)"
  by blast
```

Isabelle 证明了没有任何赋值能满足它们。封锁期间发生火警时，R2 说门必须打开，R3 说门必须保持关闭，没有哪个控制器能两者兼顾。封锁期间有人出示有效的门禁卡并输入正确的密码时，R3 和 R4 之间也会发生同样的冲突。这样的冲突藏在罕见事件的组合之中，而这恰恰是测试很少触及的地方。而且在这些情形下，事实 2.6 适用：从这些需求出发，Isabelle 能证明任何东西，甚至能证明门既开着又关着。关于不一致需求的证明都会成功，却毫无意义。

### 修复需求 {#repair}

这些冲突不是逻辑上的错误，而是还没有人做出的决定，而且只有编写需求的人才能做出这些决定；这就是模块 1 所说的确认。假设团队决定人身安全优先：火警优先于封锁，封锁优先于门禁卡。R3 和 R4 变为：

| | 需求 | 公式 |
|---|---|---|
| R3′ | 封锁期间，除非火警正在报警，否则门保持关闭。 | `lockdown ∧ ¬ fire ⟶ ¬ opens` |
| R4′ | 有效的门禁卡加上正确的密码能打开门，封锁期间除外。 | `badge ∧ pin ∧ ¬ lockdown ⟶ opens` |

现在可以做更强的检查了。新需求与 R1 和 R2 一起，完全确定了门的行为：它们迫使 `opens` 与 fire ∨ (badge ∧ pin ∧ ¬lockdown) 取相同的值。

```isabelle
lemma door_determined:
  "(opens ⟶ badge ∧ pin ∨ fire) ∧
   (fire ⟶ opens) ∧
   (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
   (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
   ⟶ (opens ⟷ fire ∨ badge ∧ pin ∧ ¬ lockdown)"
  by blast
```

反过来，一个恰好在 fire ∨ (badge ∧ pin ∧ ¬lockdown) 成立时开门的控制器，无论传感器报告什么，都满足全部四条需求：

```isabelle
lemma door_rule_ok:
  "(opens ⟷ fire ∨ badge ∧ pin ∧ ¬ lockdown) ⟶
   (opens ⟶ badge ∧ pin ∨ fire) ∧
   (fire ⟶ opens) ∧
   (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
   (badge ∧ pin ∧ ¬ lockdown ⟶ opens)"
  by blast
```

引理 `door_rule_ok` 是一次具体而微的验证。需求是规约，`opens` 的规则是实现，而这个证明一次就覆盖了四个传感器的全部十六种情形。它还表明，修复后的需求在每一种情形下都是一致的，因为在每种情形下，按这条规则做出的决定都满足全部需求。引理 `door_determined` 进一步说明，其他任何决定都做不到这一点：需求没有给控制器留下任何选择的余地。

### 能推出的性质，以及一条推不出的性质 {#properties}

最后来看性质。团队希望确保：在没有火警时，不输入正确的密码，谁也进不去，即 `opens ∧ ¬ fire ⟶ pin`。这条性质能从需求推出：

```isabelle
lemma "(opens ⟶ badge ∧ pin ∨ fire) ∧
       (fire ⟶ opens) ∧
       (lockdown ∧ ¬ fire ⟶ ¬ opens) ∧
       (badge ∧ pin ∧ ¬ lockdown ⟶ opens)
       ⟶ (opens ∧ ¬ fire ⟶ pin)"
  by blast
```

原来的承诺“封锁期间，门保持关闭”则不再能推出了：

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

这个反例是封锁期间发生了火警，门开着：这正是团队做出的决定。反例并不总是意味着错误。这里，它在一个具体情形中记录了一个有意的权衡，而这正是向必须接受这个权衡的人展示它的最好方式。如果他们没有料到这一点，那么错的是需求，而不是证明。

::: keyidea
用命题逻辑分析需求的步骤是：选择原子，把由环境决定的和由系统决定的区分开；把每条需求写成公式；检查需求是否一致，包括在那些重要的罕见情形下；证明你需要的性质确实能够推出；把每个反例都当作一个需要讨论的情形来读。这些检查中的每一项都是一个可满足性问题。
:::

命题逻辑有它的局限。它无法表达“警报停止十秒后，门重新上锁”，因为这涉及时间；也无法表达“每个员工的门禁卡都能打开本部门的门”，因为这同时涉及许多对象。模块 3 的谓词逻辑加入了对象和量词，模块 13 则为随时间变化的系统建模。

## 小结 {#summary}

- **命题**要么为真，要么为假。公式由**原子**、`True` 和 `False` 用 ¬、∧、∨、⟶ 和 ⟷ 按归纳定义构造而成，每个公式都有一棵**语法树**。
- 在 Isabelle 中，¬ 结合得最紧，其次是 ∧，再次是 ∨，然后是优先级相同的 ⟶ 和 ⟷；二元联结词都向右结合。Isabelle 把 ⟷ 打印成 `=`。混用 ⟶ 和 ⟷ 时一定要加括号。
- **赋值**给每个原子一个真值，**真值表**列出全部 $2^n$ 种赋值。A ⟶ B 只在 A 为真、B 为假时为假。
- 公式要么是**重言式**（在每一行中都为真），要么是**可满足但非有效的**（在一些行中为真，在另一些行中为假），要么是**矛盾式**（在任何一行中都不为真）；φ 是重言式，恰好是在 ¬φ 不可满足的时候。
- 当 φ ⟷ ψ 是重言式时，φ ≡ ψ。各条**定律**（德摩根律、分配律、逆否律……）能在不改变意思的前提下变换公式。
- 当没有哪一行使前提全都为真而 ψ 为假时，φ₁, …, φₙ ⊨ ψ。肯定前件式和否定后件式是有效的；肯定后件和否定前件则不是。不一致的前提能推出一切。
- 每个公式都有与之等价的**否定范式**、**合取范式**和**析取范式**。分配律可能使合取范式变得指数级地大；Tseitin 变换能避免这一点。
- **SAT** 是 NP 完全的（库克，1971 年），但在实践中，CDCL 求解器能判定非常大的公式。
- 对于需求，**一致性**就是可满足性；当“需求 ⟶ 性质”是重言式时，这条性质就能从需求推出；每个反例都是一个需要讨论的情形。
- 在 Isabelle 中，变量类型为 `bool` 的引理断言的是一个重言式。`simp`、`blast` 和 `auto` 能证明重言式（`blast` 和 `auto` 能证明的比 `simp` 多）；`quickcheck` 和 `nitpick` 寻找反例；¬φ 的反例就是 φ 的模型。

数学基础系列中的模块[逻辑、量词与规格说明](../math/module_02_ZH.html)面向一般的计算机学科讲解命题逻辑和谓词逻辑，练习更多。

## 练习 {#exercises}

:::: exercise 括号与主联结词 {#ex-2-1} ★
按照 Isabelle 的优先级，为下面每个公式加上所有隐含的括号，并指出每个公式的主联结词。

1. ¬A ∨ B ∧ C
2. A ∧ B ⟶ C ∨ D
3. A ⟶ B ⟶ C ∧ D
4. A ∨ B ⟷ C ⟶ D

::: solution
1. (¬A) ∨ (B ∧ C)。主联结词是 ∨。
2. (A ∧ B) ⟶ (C ∨ D)。主联结词是 ⟶。
3. A ⟶ (B ⟶ (C ∧ D))。主联结词是第一个 ⟶，因为 ⟶ 向右结合。
4. (A ∨ B) ⟷ (C ⟶ D)。∨ 比 ⟷ 和 ⟶ 结合得更紧，而 ⟷ 和 ⟶ 优先级相同，并且向右结合。主联结词是 ⟷。

`value` 可以确认第三个答案：它打印加满括号的公式时，会去掉那些按优先级来看多余的括号。

```isabelle
value "A ⟶ (B ⟶ (C ∧ D))"
```

```output
"A ⟶ B ⟶ C ∧ D"
  :: "bool"
```
:::
::::

:::: exercise 用真值表分类 {#ex-2-2} ★
用真值表判断下面每个公式是重言式、矛盾式，还是可满足但非有效的公式。对每个可满足但非有效的公式，给出一个模型和一个反例。

1. (A ⟶ B) ∨ (B ⟶ A)
2. (A ⟶ B) ∧ A ∧ ¬B
3. (A ⟶ B) ⟶ (B ⟶ A)
4. (A ∧ B ⟶ C) ⟶ (A ⟶ C) ∨ (B ⟶ C)

::: solution
1. 重言式。无论 A 和 B 取什么值，两个蕴涵式中总有一个为真：如果 B 为真，A ⟶ B 为真；如果 B 为假，B ⟶ A 为真。

```truthtable
(A ⟶ B) ∨ (B ⟶ A)
A ⟶ B
B ⟶ A
```

2. 矛盾式：A ⟶ B 和 A 迫使 B 为真，这与 ¬B 矛盾。

```truthtable
(A ⟶ B) ∧ A ∧ ¬B
A ⟶ B
¬B
```

3. 可满足但非有效。一个模型：A = T，B = T。一个反例：A = F，B = T，此时 A ⟶ B 为真，而它的逆命题 B ⟶ A 为假。

```truthtable
(A ⟶ B) ⟶ (B ⟶ A)
A ⟶ B
B ⟶ A
```

4. 重言式，这也许出人意料。结论只有在 A ⟶ C 和 B ⟶ C 都为假时才为假，也就是 A 和 B 为真而 C 为假时；但这时前提 A ∧ B ⟶ C 也为假。

```truthtable
(A ∧ B ⟶ C) ⟶ (A ⟶ C) ∨ (B ⟶ C)
A ∧ B ⟶ C
(A ⟶ C) ∨ (B ⟶ C)
```
:::
::::

:::: exercise 用定律推导等价式 {#ex-2-3} ★★
用事实 2.3 中的定律一步一步地证明下面的等价式，并写出每一步所用的定律：

1. (A ⟶ B) ∧ (A ⟶ C) ≡ A ⟶ B ∧ C
2. A ⟶ (B ⟶ C) ≡ B ⟶ (A ⟶ C)
3. ¬fire ⟶ (opens ⟶ badge ∧ pin) ≡ opens ⟶ badge ∧ pin ∨ fire（例 2.1 中的两种理解）

然后在 Isabelle 中检查这三个等价式。

::: solution
1. (A ⟶ B) ∧ (A ⟶ C) ≡ (¬A ∨ B) ∧ (¬A ∨ C)（两次使用蕴涵律）；≡ ¬A ∨ (B ∧ C)（分配律，从右往左用）；≡ A ⟶ B ∧ C（蕴涵律）。
2. A ⟶ (B ⟶ C) ≡ A ∧ B ⟶ C（输出律）；≡ B ∧ A ⟶ C（交换律）；≡ B ⟶ (A ⟶ C)（输出律）。
3. ¬fire ⟶ (opens ⟶ badge ∧ pin) ≡ ¬fire ∧ opens ⟶ badge ∧ pin（输出律）；≡ ¬(¬fire ∧ opens) ∨ (badge ∧ pin)（蕴涵律）；≡ (fire ∨ ¬opens) ∨ (badge ∧ pin)（德摩根律和双重否定律）；≡ ¬opens ∨ ((badge ∧ pin) ∨ fire)（交换律和结合律）；≡ opens ⟶ badge ∧ pin ∨ fire（蕴涵律）。

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

:::: exercise 有效还是无效？ {#ex-2-4} ★★
把每个论证写成前提和结论，并判断它是否有效。对每个无效的论证，给出一个反例。然后在 Isabelle 中检查你的答案。

1. 如果缓存是热的，请求就很快。请求不快。所以缓存不是热的。
2. 如果输入合法，解析器就接受它。输入不合法。所以解析器不接受它。
3. 这个服务使用 TLS，或者运行在内部网络上。它没有运行在内部网络上。所以它使用 TLS。
4. 如果作业在夜间运行，它就会提早完成。如果它提早完成，报告就准备好了。报告准备好了。所以作业是在夜间运行的。

::: solution
1. `warm ⟶ fast`, `¬ fast` ⊨ `¬ warm`（`warm`、`fast` 分别表示缓存是热的、请求很快）：否定后件式，有效。
2. `ok ⟶ accepts`, `¬ ok` ⊨ `¬ accepts`（`ok` 表示“输入合法”，`accepts` 表示解析器接受输入）：否定前件，无效。反例：ok = F，accepts = T，即一个宽松的解析器接受了某个不合法的输入。
3. `tls ∨ internal`, `¬ internal` ⊨ `tls`（`tls`、`internal` 分别表示使用 TLS、运行在内部网络上）：析取三段论，有效。
4. `night ⟶ early`, `early ⟶ ready`, `ready` ⊨ `night`（`night`、`early`、`ready` 分别表示作业在夜间运行、提早完成、报告已准备好）：无效，这是肯定后件的一种形式。反例：night = F，ready = T；报告可能因为别的原因而准备好了。

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

:::: exercise 范式 {#ex-2-5} ★★
把下面每个公式先化为否定范式，再化为合取范式和析取范式。在 Isabelle 中检查你的答案。

1. A ⟷ B
2. ¬(A ∨ B ⟶ C)

::: solution
1. 先消去 ⟷，再消去 ⟶：A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) ≡ (¬A ∨ B) ∧ (¬B ∨ A)。这是否定范式，而且已经是合取范式。要得到析取范式，就用分配律展开：(¬A ∧ ¬B) ∨ (¬A ∧ A) ∨ (B ∧ ¬B) ∨ (B ∧ A)。中间两个合取式是矛盾式，等价于 False，而 φ ∨ False ≡ φ，所以析取范式是 (¬A ∧ ¬B) ∨ (A ∧ B)。
2. 消去 ⟶，再把 ¬ 向内推：¬(A ∨ B ⟶ C) ≡ ¬(¬(A ∨ B) ∨ C) ≡ ¬¬(A ∨ B) ∧ ¬C ≡ (A ∨ B) ∧ ¬C。这是否定范式，也是合取范式（含两个子句）。再用分配律展开，就得到析取范式 (A ∧ ¬C) ∨ (B ∧ ¬C)。

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

:::: exercise 水泵控制器 {#ex-2-6} ★★
一台水泵给水箱注水。两个传感器分别报告 `low`（水位低于低水位线）和 `high`（水位高于高水位线）；一个开关选择 `manual`（手动）模式；控制器决定 `pump`（水泵运行）。需求如下：

- R1：如果水位低，并且处于自动模式，水泵就运行。
- R2：如果水位高，水泵就不运行。
- R3：在手动模式下，水泵运行。

1. 把这些需求写成公式，并用 Nitpick 表明它们是一致的。
2. 找出一个使它们相互冲突的情形，并在 Isabelle 中证明这个冲突。你会怎样修复这些需求？
3. 按你的修复，能推出“如果水位低，水泵就运行”吗？如果再加上“水位不可能既低又高”这个假设，能推出吗？

::: solution
1. R1 是 `low ∧ ¬ manual ⟶ pump`，R2 是 `high ⟶ ¬ pump`，R3 是 `manual ⟶ pump`。它们的否定的反例，就是这三条需求的一个模型：

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

   在自动模式下，水位在两条水位线之间时，水泵可以运行。

2. 在手动模式下水位高时，R3 说水泵运行，R2 说水泵不运行：

```isabelle
lemma "¬ ((low ∧ ¬ manual ⟶ pump) ∧
         (high ⟶ ¬ pump) ∧
         (manual ⟶ pump) ∧
         manual ∧ high)"
  by blast
```

   去问工程师哪条需求优先。防止水箱溢出很可能是他们的回答，于是 R3 变为 R3′：`manual ∧ ¬ high ⟶ pump`。

   还有第二个冲突，R3′ 并没有消除它：在自动模式下，如果传感器同时报告水位低和水位高，R1 说水泵运行，R2 说水泵不运行。正常工作的传感器绝不会同时报告这两者；第 3 小题会把这一点变成一个假设。

3. 仅凭这些需求推不出来。Nitpick 找到了这样一种情形：传感器同时报告水位低和水位高，处于手动模式，而水泵关着：

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

   加上假设 `¬ (low ∧ high)` 之后，这条性质就能推出了。这个假设描述的是传感器（也就是环境），而不是控制器：

```isabelle
lemma "¬ (low ∧ high) ∧
       (low ∧ ¬ manual ⟶ pump) ∧
       (high ⟶ ¬ pump) ∧
       (manual ∧ ¬ high ⟶ pump)
       ⟶ (low ⟶ pump)"
  by blast
```

   关于环境的假设是规约的一部分：没有这些假设，一个正确的控制器也可能看起来是错的。
:::
::::

:::: exercise 两个联结词就够了 {#ex-2-7} ★★★
1. 证明每个公式都等价于一个只用 ⟶ 和 `False` 的公式：分别给出与 ¬A、A ∨ B、A ∧ B 和 A ⟷ B 等价的这样的公式，并在 Isabelle 中检查它们。为什么这样就涵盖了所有公式？
2. 证明只有 ∧ 和 ∨ 是不够的：只用 ∧ 和 ∨ 由原子构造的公式（不用 ¬、⟶、⟷、`True` 或 `False`）没有一个与 ¬A 等价。提示：当每个原子都为 T 时，这样的公式取什么值？

::: solution
1. 真值表表明 ¬A ≡ A ⟶ False。于是 A ∨ B ≡ ¬A ⟶ B ≡ (A ⟶ False) ⟶ B，而 A ∧ B ≡ ¬(A ⟶ ¬B) ≡ (A ⟶ B ⟶ False) ⟶ False。对于 ⟷，利用 A ⟷ B ≡ (A ⟶ B) ∧ (B ⟶ A) 和上面 ∧ 的公式：((A ⟶ B) ⟶ (B ⟶ A) ⟶ False) ⟶ False。

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

   这就涵盖了所有公式：由代入（事实 2.4），把 A 和 B 换成任意公式，这些等价式依然成立，所以你可以从里到外逐个替换联结词，而由置换，每一步得到的都是等价的公式。`True` 等价于 False ⟶ False。

2. 在使每个原子都为 T 的那个赋值下，只用 ∧ 和 ∨ 由原子构造的每个公式都为 T：在这个赋值下，原子都为 T；而如果 φ 和 ψ 为 T，那么 φ ∧ ψ 和 φ ∨ ψ 也为 T。由于这些公式由这些规则构造，而且只由这些规则构造（定义 2.3），所以每个这样的公式都为 T。但在这个赋值下 ¬A 为 F，所以它们之中没有一个与 ¬A 等价。这种沿着归纳定义的规则进行的论证叫做**结构归纳法**（structural induction）；模块 5 会正式讲解它。
:::
::::

:::: exercise 骑士与无赖 {#ex-2-8} ★★★
在一座岛上，骑士总是说真话，无赖总是说假话。你遇到两个岛民 P 和 Q。P 说：“Q 是无赖。”Q 说：“P 和我是同一类人。”用 `p` 表示“P 是骑士”，用 `q` 表示“Q 是骑士”。

1. 解释为什么 P 的话给出约束 p ⟷ ¬q，并把 Q 的话也写成一个约束。
2. 用 Nitpick 找出谁是骑士、谁是无赖。
3. 在 Isabelle 中证明这是唯一的解。

::: solution
1. 如果 P 是骑士，P 说的话为真；如果 P 是无赖，P 说的话为假。所以“P 说 S”意味着 p ⟷ S。P 说的是 ¬q，于是得到 p ⟷ ¬q。Q 说 P 和 Q 是同一类人，即 p ⟷ q，于是得到 q ⟷ (p ⟷ q)。
2. 约束的否定的反例，就是约束的一个模型：

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

   P 是骑士，Q 是无赖。验证一下：P 如实地说 Q 是无赖，而 Q 谎称他们两人是同一类人。

3. 由这些约束可以推出这个解：

```isabelle
lemma "(p ⟷ ¬ q) ∧ (q ⟷ (p ⟷ q)) ⟶ p ∧ ¬ q"
  by blast
```

   单是 Q 的约束就已经迫使 p 为真：q ⟷ (p ⟷ q) 等价于 p。如果 p 为真，p ⟷ q 与 q 的值相同，所以这个约束为真；如果 p 为假，p ⟷ q 与 q 的值相反，所以这个约束为假。p 为真时，P 的约束 p ⟷ ¬q 使 q 为假。
:::
::::

## 自测题 {#quiz}

```quiz
? Isabelle 怎样读 ¬A ∧ B ⟶ C？
- [ ] ¬(A ∧ B ⟶ C)
- [x] ((¬A) ∧ B) ⟶ C
- [ ] (¬A) ∧ (B ⟶ C)
- [ ] (¬(A ∧ B)) ⟶ C
> ¬ 结合得最紧，其次是 ∧，然后是 ⟶。所以 ¬ 只作用于 A，∧ 连接 ¬A 和 B，而 ⟶ 是主联结词。

? A ⟶ B 什么时候为假？
- [ ] A 为假时
- [ ] A 和 B 都为假时
- [ ] B 为真而 A 为假时
- [x] 只有在 A 为真而 B 为假时
> 只有当前件成立而后件不成立时，蕴涵式才被违背。A 为假时，A ⟶ B 为空真。

? 公式 φ 和它的否定 ¬φ 都是可满足的。φ 属于哪一类？
- [x] 可满足但非有效：在一些行中为真，在另一些行中为假
- [ ] 重言式
- [ ] 矛盾式
- [ ] 不可能出现这种情况
> φ 可满足，说明有某一行使 φ 为真；¬φ 可满足，说明有某一行使 φ 为假。所以 φ 既不是重言式，也不是矛盾式。

? 哪种论证形式是无效的？
- [ ] 由 A ⟶ B 和 A，推出 B
- [ ] 由 A ⟶ B 和 ¬B，推出 ¬A
- [x] 由 A ⟶ B 和 B，推出 A
- [ ] 由 A ∨ B 和 ¬A，推出 B
> 这是肯定后件。在 A = F、B = T 这一行中，两个前提都为真，而结论为假。

? 在一条关于命题公式的引理上，`by simp` 失败了。你能得出什么结论？
- [ ] 这个公式不是重言式
- [x] 暂时什么也得不出：试试 `blast` 或 `auto`，或者用 `quickcheck` 或 `nitpick` 找反例
- [ ] 这个公式是矛盾式
- [ ] Isabelle 处理不了命题公式
> 证明失败不等于找到了反例：`simp` 在皮尔士定律上就会失败，而皮尔士定律是重言式。只有成功的证明或者反例才能给问题下定论。

? Nitpick 为 ¬(R1 ∧ R2 ∧ R3) 找到了一个反例。这说明了什么？
- [ ] R1 ∧ R2 ∧ R3 是重言式
- [ ] 这些需求是不一致的
- [ ] 其中某条需求是错的
- [x] 这些需求是一致的：这个反例满足全部三条需求
> ¬(R1 ∧ R2 ∧ R3) 的反例使这个否定式为假，因而使 R1 ∧ R2 ∧ R3 为真。它是这些需求的一个模型，表明它们可以同时成立。
```
