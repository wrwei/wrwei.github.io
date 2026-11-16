---
title: What is a proof? Natural deduction
part: 2
lead: What turns an argument into a proof, and how to write proofs that a machine can check. You will learn the rules of natural deduction for every connective, both quantifiers and equality, build derivations by hand, and find them by working backwards from the goal, as Isabelle does.
minutes: 220
needs: Modules 1–5, especially Modules 2 and 3 (truth tables and ⊨, quantifiers and structures)
goals:
  - Recognise the common patterns of informal proof and name the rule behind each
  - Explain the difference between ⊢ and ⊨, and what soundness and completeness guarantee
  - Build natural-deduction derivations with ∧, ∨, ⟶, ¬, ∀, ∃ and =, discharging assumptions correctly
  - Check the side conditions of the quantifier rules and find the error in a proof that breaks them
  - Tell which proofs need classical reasoning (RAA) and which do not
  - Find derivations by working backwards from the goal, applying safe rules first
imports: Main
---

## Proofs you already know {#informal}

A **proof** is an argument that leaves no room for doubt: each step follows from earlier ones, for reasons
that everyone accepts. You have built such arguments before, perhaps without the name. When you convince a
colleague that a loop always terminates, or that a function never returns a negative number, you give
reasons, and each reason rests on the ones before it.

This section collects the patterns that such arguments use. The rest of the module turns each one into a
precise rule, so that a computer can check every step. Modules 2 and 3 gave you formulas and their meaning;
this module adds the third ingredient of a formal method from Module 1, a proof system.

::: example A withdrawal never makes the balance negative
**Claim.** If the balance b is at least 0 and the amount a is at most b, then b − a is at least 0.

**Proof.** Assume b ≥ 0 and a ≤ b. Subtract a from both sides of a ≤ b: this gives 0 ≤ b − a. ∎
:::

The mark ∎ ends a proof. Two patterns are at work. To prove an *if … then …* statement, the proof
**assumes** the *if* part and proves the *then* part; the assumption is available only inside this
argument. And the step it takes is a **direct** consequence of what is known, here a law of arithmetic.
Notice also that the assumption b ≥ 0 is never used. A proof may ignore an assumption; when it does, the
claim holds more generally than stated.

::: example The maximum is at least its first argument
**Claim.** For all integers x and y, max(x, y) ≥ x, where max is defined by

```text
max(x, y) = if x ≥ y then x else y
```

**Proof.** Either x ≥ y or x < y. *Case x ≥ y:* then max(x, y) = x, and x ≥ x. *Case x < y:* then
max(x, y) = y, and y > x. In both cases max(x, y) ≥ x. ∎
:::

This is **case analysis**: when you know that one of several cases holds, prove the claim in each case. The
cases follow the `if` in the definition, which is typical: a program with a branch usually needs a proof
with a case split. The cases must cover every possibility. Here they do, because for any two integers
x ≥ y or x < y.

::: example The sum of two even numbers is even
An integer n is **even** if n = 2k for some integer k.

**Claim.** For all integers m and n, if m and n are even, then m + n is even.

**Proof.** Let m and n be any integers, and assume that both are even. Since m is even, m = 2k for some
integer k. Since n is even, n = 2j for some integer j. Then m + n = 2k + 2j = 2(k + j). So m + n = 2i for
the integer i = k + j, and m + n is even. ∎
:::

This short proof uses three patterns, all about quantifiers:

- "Let m and n be **any** integers": to prove that something holds **for all** integers, take arbitrary
  ones, about which you assume nothing beyond what the claim allows, and prove it for them. Because nothing
  was assumed about them, the argument works for every choice.
- "m = 2k for **some** integer k": to **use** a fact of the form *there is a k with …*, give the unknown
  value a name and work with it, assuming nothing about it except what the fact says.
- "for the integer i = k + j": to **prove** a fact of the form *there is an i with …*, show one, a
  **witness**, and check that it works.

::: pitfall
The name you give an unknown value must be **new**. Had the proof written "n = 2k" for the second number
as well, reusing the k of m, it would have assumed that n has the same half as m, that is, n = m. The
"proof" would then cover only sums m + m. Section 6.6 shows how natural deduction rules this mistake out.
:::

::: note
A witness is the one kind of proof a test can deliver. "Some input makes the parser crash" is proved by a
single crashing input. Claims about *all* inputs are another matter: as Module 1 put it, tests can show the
presence of bugs, never their absence.
:::

::: example There is no largest natural number
**Claim.** There is no largest natural number.

**Proof.** Suppose, for a contradiction, that there is a largest natural number, and call it N. Then
N + 1 is a natural number, and N + 1 > N, so N is not the largest. This contradicts the choice of N. So no
largest natural number exists. ∎
:::

This is **proof by contradiction**: assume the opposite of what you want, and derive something impossible;
the assumption must then be false. The argument relies on N + 1 being a natural number. That is true of the
mathematical natural numbers and false of 64-bit machine integers, where the largest value plus one
overflows. A proof is only as good as the facts it uses, which is why a proof about a program needs an exact
model of the program's numbers.

::: example If n² is even, then n is even
A direct proof is awkward: from n² = 2k, how do you get at n? Prove instead the **contrapositive**: if n is
not even, then n² is not even.

**Proof.** Let n be an integer that is not even. Then n is odd: n = 2k + 1 for some integer k. So
n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which is odd, and therefore not even. ∎
:::

An implication *if A then B* and its contrapositive *if not B then not A* rule out the same situation: A
true and B false. Proving one proves the other. (Going from the contrapositive back to the implication
needs classical logic, as Section 6.5 explains.)

The table collects the patterns, with the rules of natural deduction that the rest of the module gives for
them.

| Pattern | When | What you do | Rule |
|---|---|---|---|
| Assume the premise | proving *if A then B* | assume A, prove B | (⟶I), Section 6.4 |
| Case analysis | using *A or B* | prove the goal assuming A, then assuming B | (∨E), Section 6.4 |
| Contradiction | proving *not A*, or A | assume A (or *not A*), derive something impossible | (¬I), (RAA), Sections 6.4–6.5 |
| Contrapositive | proving *if A then B* | prove *if not B then not A* | derived, Section 6.5 |
| Arbitrary element | proving *for all x* | take an arbitrary x, prove the claim for it | (∀I), Section 6.6 |
| Witness | proving *there is an x* | exhibit one and check it | (∃I), Section 6.6 |
| Naming a witness | using *there is an x* | give it a new name, use what you know about it | (∃E), Section 6.6 |

::: keyidea
Every pattern in the table either **proves** a statement of some shape (an implication, a *for all*, a
*there is*) or **uses** one (an *or*, a *there is*). Natural deduction is built on exactly this split: each
connective and quantifier gets **introduction rules**, which prove it, and **elimination rules**, which use
it.
:::

::: pitfall
Three mistakes are common in informal proofs:

- **Checking examples instead of proving.** In Module 1, double n = n * n held for n = 0 and n = 2 and
  failed for n = 1. Examples can refute a *for all* claim, never prove it.
- **Assuming what you want to prove.** An argument that uses its own conclusion along the way proves
  nothing, however convincing each step looks.
- **Proving the converse.** Asked for *if A then B*, it is easy to slip into proving *if B then A*. They
  are different claims: "if it rained, the street is wet" is not "if the street is wet, it rained".
:::

## What a proof system is {#systems}

Informal proofs rely on their reader. Phrases such as "similarly", "it follows that" and "without loss of
generality" each ask the reader to fill a gap, and readers fill gaps differently, or wrongly. For a machine
to check a proof, every step must be an instance of a rule fixed in advance, and checking a step must need
no insight at all. A set of such rules is a **proof system**.

A tiny example first, far from logic. Here are two rules for statements of the form *even n*:

$$
\dfrac{}{\mathit{even}\ 0}\;(\mathrm{ev}_0)
\qquad\qquad
\dfrac{\mathit{even}\ n}{\mathit{even}\ (n+2)}\;(\mathrm{ev}_2)
$$

Read each rule as: from the statements above the line, the **premises**, you may conclude the statement
below the line, the **conclusion**. The name of the rule is written beside the line. (ev₀) has no premises:
you may write *even 0* at any time. (ev₂) says that from *even n* you may conclude *even (n + 2)*, for any
number n. Here is a **derivation** built from these rules:

```prooftree
even 4   (ev₂)
  even 2   (ev₂)
    even 0   (ev₀)
```

Read it from the top down: (ev₀) gives *even 0*; (ev₂) with n = 0 gives *even 2*; (ev₂) with n = 2 gives
*even 4*. Each horizontal line is one step, labelled with its rule. To check the derivation, a program
looks at each line and asks a single question: is the formula below the line what the rule makes of the
formulas above it? It needs no idea of what *even* means.

::: definition Proof system and derivation
A **proof system** fixes a language of formulas and a set of **inference rules**. A rule has zero or more
**premises** and one **conclusion**; a rule without premises is an **axiom**. A **derivation** is a tree of
formulas, drawn with its root at the bottom. Every formula in it either is an **assumption**, a leaf with no
line above it, or follows from the formulas directly above it by one of the rules. The formula at the
root is the **conclusion** of the derivation.
:::

An assumption is a formula taken as given, without proof: the derivation then shows what follows *if* the
assumption holds. Here is a derivation in the same system with an assumption at the top:

```prooftree
even 5   (ev₂)
  even 3   (ev₂)
    even 1
```

It shows that *even 5* follows from the assumption *even 1*. The assumption is false, but the derivation
is correct: it says what would follow if *even 1* held.

::: definition Derivability
**Γ ⊢ A**, read "Γ derives A" or "A is derivable from Γ", means that some derivation has conclusion A
and all its assumptions in the set of formulas Γ (the Greek capital letter gamma). The set is written as a
list: *even 1* ⊢ *even 5*. **⊢ A**, with nothing on the left, means that A has a derivation without any
assumptions; A is then a **theorem** of the proof system.
:::

So ⊢ *even 4* and *even 1* ⊢ *even 5*. What about *even 3*? No derivation without assumptions reaches it,
and the next section shows how to be sure of that without trying every possible tree.

::: analogy
A compiler's type checker does not run your program. It checks each expression against typing rules: if
`e1` has type `int` and `e2` has type `int`, then `e1 + e2` has type `int`. A proof checker works the same
way on derivations. It checks the shape of each step against the rules, not whether the formulas are true.
This is why the kernel of a proof assistant can be small (Module 1): the kernel is a checker of this kind.
:::

There are many proof systems for logic: Hilbert-style systems with many axioms and one or two rules,
sequent calculi, tableaux, and resolution, which automatic provers use. For propositional and first-order
logic they all establish the same consequences; they differ in convenience. This module uses **natural
deduction**, because it follows the informal patterns of Section 6.1 closely and because Isabelle is
designed around it (Module 7).

## Derivable and true {#soundness}

A proof system manipulates symbols. It does not know what *even* means, or what ∧ means. Truth is a
separate matter, which Modules 2 and 3 defined: a valuation makes a propositional formula true or false,
and a structure, with values for the free variables, makes a first-order formula true or false. So there
are two questions about a set of formulas Γ and a formula A:

- **Γ ⊢ A**: is there a derivation of A from Γ? This is a question about rules (syntax).
- **Γ ⊨ A**: is A true in every valuation, or every structure, that makes all formulas in Γ true? This is
  logical consequence from Module 2, a question about meaning (semantics).

They are different questions. A good proof system gives the same answer to both.

::: definition Soundness and completeness
A proof system is **sound** if everything it derives is a consequence: for all Γ and A, if Γ ⊢ A then
Γ ⊨ A. It is **complete** if it derives every consequence: for all Γ and A, if Γ ⊨ A then Γ ⊢ A.
:::

The even system shows both properties on a small scale. Give *even n* its natural meaning, "n is divisible
by 2". The system is **sound**: (ev₀) concludes a true statement, and (ev₂) turns a true statement into a
true one, because n + 2 is divisible by 2 whenever n is. A derivation applies these rules finitely often, so
its conclusion is true (an induction on the size of the derivation, as in Module 5). In particular *even 3*
is false, so it has no derivation: soundness answers the question of the last section without trying a
single tree. For statements without assumptions the system is also **complete**: every true statement
*even 2k* has a derivation, with one use of (ev₀) and k uses of (ev₂).

::: figure id=fig-06-1
Two questions with the same answers. ⊢ asks whether a derivation exists, ⊨ whether the formula is true
in every valuation or structure that makes the assumptions true. Soundness and completeness connect them.
:::

What would it mean if one of the two properties failed?

- **If soundness fails**, the system can derive something false. Suppose you add to the rules of this
  module one plausible-looking rule: from A ∨ B, conclude A. ("The request came from the admin or from a
  guest, so it came from the admin.") Then A ∨ B ⊢ A, although A ∨ B ⊭ A (read "A ∨ B does not entail
  A"): with A false and B true, A ∨ B is true and A is false. It gets worse. Section 6.5 derives A ∨ ¬A
  for every formula A; with the new rule, every A would follow, including ⊥, the formula that is always
  false. A derivation in an unsound system
  proves nothing. For a proof assistant this is the worst possible bug, which is why Module 1's LCF kernel
  is kept small and checked with care.
- **If completeness fails**, some consequence has no derivation. The system never derives anything false,
  but it cannot prove everything you need, and a failed search does not tell you whether you were unlucky
  or the system is too weak. Section 6.5 meets an example: without its last rule, natural deduction cannot
  derive A ∨ ¬A, although every row of its truth table is true.

::: fact Natural deduction is sound and complete
For propositional logic and for first-order logic, the natural-deduction system of this module, with all
its rules, is sound and complete: for every set of formulas Γ and every formula A, Γ ⊢ A if and only if
Γ ⊨ A.
:::

Soundness is the routine half: check that each rule turns true premises into a true conclusion. The rules
that discharge assumptions and the quantifier rules need some care, and their side conditions (Section 6.6)
are there to make this check succeed. Completeness is a deep theorem. Kurt Gödel proved it for first-order
logic in his doctoral thesis of 1929, for a different proof system that derives the same formulas.

Three consequences matter in practice.

1. **Counterexamples show that a proof does not exist.** To show that A is *not* derivable from Γ, you do
   not have to try every derivation. Find one valuation or structure that makes Γ true and A false; by
   soundness, no derivation exists. This is what Quickcheck and Nitpick do in Isabelle (Modules 1–3): a
   counterexample means "stop trying to prove it".
2. **Proof search can succeed, but not always fail.** Derivations can be listed one after another, by size,
   and each can be checked mechanically. A program that works through the list will find a derivation of
   every valid first-order formula, eventually. For a formula that is not valid, it may search forever:
   validity in first-order logic is undecidable (Module 3), so no program can always answer "no". Proof
   search tools such as Isabelle's `blast` live with this: they search up to a bound and then give up.
3. **Gödel's incompleteness theorem is about something else.** Completeness concerns truth in *every*
   structure; the incompleteness theorem of 1931 (Module 1) concerns truth in one structure, the natural
   numbers: no mechanically checkable proof system that derives only true statements about arithmetic
   derives all of them. Isabelle/HOL can express arithmetic, so its proof system, like every other that a
   machine can check, cannot derive every true statement about the natural numbers. What Isabelle
   guarantees is soundness, and soundness is what you rely on when you trust a theorem.

## Natural deduction: the connectives {#connectives}

Gerhard Gentzen introduced natural deduction in 1934/35, in a paper that also introduced the sequent
calculus; Stanisław Jaśkowski published a similar system independently in 1934. Gentzen wanted a formal
system that reasons the way mathematicians do: by making assumptions and drawing conclusions from them. So
natural deduction has no axioms for the connectives. Instead you may assume any formula, and some rules
**discharge** assumptions, the formal version of "assume A … therefore, if A then B". Each connective has
**introduction rules**, which say how to prove a formula with that connective, and **elimination rules**,
which say how to use one.

Which rules apply to a formula depends on its **main connective**: the connective applied last when the
formula is built, at the root of its syntax tree. In A ∧ B ⟶ B ∧ A the main connective is ⟶, because ∧
binds more tightly (Module 2). In the rules below, A, B and C stand for any formulas: a rule applies to
every formula of the right shape.

### Conjunction {#and}

$$
\dfrac{A \qquad B}{A \land B}\;(\land\mathrm{I})
\qquad\qquad
\dfrac{A \land B}{A}\;(\land\mathrm{E}_1)
\qquad\qquad
\dfrac{A \land B}{B}\;(\land\mathrm{E}_2)
$$

(∧I), "and-introduction", says: to prove A ∧ B, prove A and prove B. (∧E₁) and (∧E₂), "and-elimination",
say: from A ∧ B you may conclude A, and you may conclude B. Together the three rules say what "and" means:
a conjunction holds exactly when both parts do. Here is a derivation that uses all three:

```prooftree
B ∧ A   (∧I)
  B   (∧E₂)
    A ∧ B
  A   (∧E₁)
    A ∧ B
```

Its two leaves are the same assumption, A ∧ B, used twice; an assumption may be used as often as you
like. The derivation shows A ∧ B ⊢ B ∧ A.

### Implication and assumptions {#imp}

To prove *if A then B* informally, you assume A and prove B. Natural deduction does the same:

$$
\dfrac{\begin{matrix}[A]^1\\ \vdots\\ B\end{matrix}}{A \imp B}\;({\imp}\mathrm{I}^1)
\qquad\qquad
\dfrac{A \imp B \qquad A}{B}\;({\imp}\mathrm{E})
$$

(⟶I) has one premise, B, and the dots stand for a derivation of B that may use A as an assumption. When
(⟶I) is applied, the assumption A is **discharged**: the conclusion A ⟶ B no longer depends on it, because
A is now part of the conclusion. To record this, every discharged occurrence of A is written in square
brackets with a number, [A]¹, and the rule that discharges it carries the same number, (⟶I¹). The numbers
only link assumptions to rules; any number not used elsewhere in the derivation will do. (⟶E), also called
**modus ponens**, uses an implication: from A ⟶ B and A, conclude B.

::: definition Open and discharged assumptions
An assumption in a derivation is **discharged** if some rule below it, on the path from the assumption
down to the root, discharges it; it is then written [A]ⁿ, where n is the number of that rule. Otherwise the
assumption is **open**. The conclusion of a derivation depends only on its open assumptions: Γ ⊢ A means
that there is a derivation of A whose open assumptions are all in Γ.
:::

Add one step to the derivation of A ∧ B ⊢ B ∧ A from the conjunction rules above:

```prooftree
A ∧ B ⟶ B ∧ A   (⟶I¹)
  B ∧ A   (∧I)
    B   (∧E₂)
      [A ∧ B]¹
    A   (∧E₁)
      [A ∧ B]¹
```

(⟶I¹) discharges both occurrences of A ∧ B. No open assumption remains, so ⊢ A ∧ B ⟶ B ∧ A: the formula
is a theorem. Read the derivation from the bottom up and you can see how it was found. The goal
A ∧ B ⟶ B ∧ A is an implication, so (⟶I): assume A ∧ B and prove B ∧ A. That is a conjunction, so (∧I):
prove B and prove A. Each follows from the assumption by an elimination rule. Section 6.7 turns this way of
working into a method.

The next formula says that implication can be chained: if A gives B, and B gives C, then A gives C.

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

Because ⟶ groups to the right (Module 2), the formula has three premises: A ⟶ B, B ⟶ C and A. The last
pair of parentheses is not needed, but it shows the structure. Each (⟶I) assumes one premise and discharges
it, and two uses of (⟶E) chain the implications: A and A ⟶ B give B, and B and B ⟶ C give C.

A rule may also discharge an assumption that is never used:

```prooftree
A ⟶ B ⟶ A   (⟶I¹)
  B ⟶ A   (⟶I²)
    [A]¹
```

(⟶I²) discharges the assumption B, which does not occur in the derivation: A was available without it.
This is allowed, in the same way as a function may ignore one of its arguments.

### Assumptions and their scope {#discharge}

A discharged assumption may be used only above the rule that discharges it. Here is a "derivation" that
breaks this rule:

```prooftree
(A ⟶ A) ∧ A   (∧I)
  A ⟶ A   (⟶I¹)
    [A]¹
  [A]¹
```

On the left branch, (⟶I¹) discharges [A]¹ correctly. On the right branch, [A]¹ is not above any (⟶I¹),
so there A is still an open assumption, and the brackets are wrong. The honest conclusion is
A ⊢ (A ⟶ A) ∧ A, which is true but not useful. The tree claims ⊢ (A ⟶ A) ∧ A, and that is false: when A is
false, (A ⟶ A) ∧ A is false, so by soundness the formula has no derivation without assumptions. Soundness
works here as a debugging tool: a false conclusion means that some step is wrong.

::: figure id=fig-06-2
The scope of a discharged assumption is the part of the derivation above the rule that discharges it.
Scopes nest like blocks in a program. On the right, the second [A]¹ is outside the scope of (⟶I¹).
:::

::: analogy
Discharged assumptions behave like local variables. In this fragment of a program

```text
if (x > 0) {
    int y = x;     // y exists only inside this block
}
return y;          // error: y is not in scope
```

y exists only inside its block, and a compiler rejects the use of y after the block has closed. An
assumption [A]¹ exists only in the part of the derivation above the (⟶I¹) that discharges it, and a proof
checker rejects a derivation that uses it anywhere else.
:::

### Disjunction {#or}

$$
\dfrac{A}{A \lor B}\;(\lor\mathrm{I}_1)
\qquad\qquad
\dfrac{B}{A \lor B}\;(\lor\mathrm{I}_2)
$$

$$
\dfrac{\begin{matrix}\\ \\ A \lor B\end{matrix} \qquad \begin{matrix}[A]^1\\ \vdots\\ C\end{matrix} \qquad \begin{matrix}[B]^1\\ \vdots\\ C\end{matrix}}{C}\;(\lor\mathrm{E}^1)
$$

(∨I₁) and (∨I₂): to prove A ∨ B, prove one of the two sides. (∨E) is case analysis: to use A ∨ B for a goal
C, derive C assuming A, and derive C again assuming B. The rule discharges both assumptions, with the same
number. Here it is at work on the disjunction version of the first theorem:

```prooftree
A ∨ B ⟶ B ∨ A   (⟶I¹)
  B ∨ A   (∨E²)
    [A ∨ B]¹
    B ∨ A   (∨I₂)
      [A]²
    B ∨ A   (∨I₁)
      [B]²
```

Read it from the bottom: to prove the implication, assume A ∨ B (⟶I¹). To use this disjunction, split into
two cases (∨E²). In the case A, the goal B ∨ A follows by (∨I₂), because A is its right side; in the case B,
it follows by (∨I₁).

::: pitfall
(∨I₁) and (∨I₂) make you choose a side. Choose too early and you are stuck: had the derivation above
applied (∨I₁) to the goal B ∨ A straight after (⟶I¹), it would have to prove B from A ∨ B, which is
impossible, since A ∨ B can be true while B is false. When the goal is a disjunction, first look at the
assumptions; here, splitting A ∨ B with (∨E) is what makes the choice possible. Section 6.7 turns this into
a rule of thumb.
:::

### Negation and falsity {#not}

Negation is handled through a new formula, **⊥** (read "bottom" or "falsum"): the formula that is false
in every valuation and every structure. Isabelle writes it `False`. ¬A is treated as A ⟶ ⊥: to say that A
is false is to say that A leads to absurdity. The rules for ¬ are then the rules for ⟶ with ⊥ in place of
B, and ⊥ gets one rule of its own:

$$
\dfrac{\begin{matrix}[A]^1\\ \vdots\\ \bot\end{matrix}}{\lnot A}\;(\lnot\mathrm{I}^1)
\qquad\qquad
\dfrac{\lnot A \qquad A}{\bot}\;(\lnot\mathrm{E})
\qquad\qquad
\dfrac{\bot}{C}\;(\bot\mathrm{E})
$$

(¬I): to prove ¬A, assume A and derive ⊥, as in "suppose there were a largest natural number; then …, a
contradiction". (¬E): A and ¬A together give ⊥. (⊥E), *ex falso quodlibet* ("from falsehood, anything"),
concludes any formula C from ⊥. It never leads from truth to falsehood, because ⊥ is never true. Proofs use
it to dismiss an impossible case: a case that leads to ⊥ proves whatever the goal is. Programmers know the
idea from unreachable code: a branch that can never run may promise any result, because it never delivers
one.

Here is one of De Morgan's laws from Module 2: if neither A nor B holds, then A fails and B fails.

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

To prove ¬A, assume A (¬I²). Then A ∨ B holds (∨I₁), which contradicts the assumption ¬(A ∨ B) (¬E). ¬B
follows in the same way, and (∧I) puts the two together.

The rules so far, in one table:

| Formula | Introduction: to prove it | Elimination: to use it |
|---|---|---|
| A ∧ B | prove A and prove B (∧I) | conclude A (∧E₁), or B (∧E₂) |
| A ∨ B | prove A (∨I₁), or B (∨I₂) | prove the goal from A, and from B (∨E) |
| A ⟶ B | assume A, prove B (⟶I) | with A, conclude B (⟶E) |
| ¬A | assume A, prove ⊥ (¬I) | with A, conclude ⊥ (¬E) |
| ⊥ | no rule | conclude any formula (⊥E) |

## Classical reasoning {#classical}

With the rules of Section 6.4 you can derive many tautologies, but not all. Try A ∨ ¬A, the **law of
excluded middle**: (∨I₁) would need a derivation of A, (∨I₂) one of ¬A, and you have neither. The same
goes for ¬¬A ⟶ A and for one of De Morgan's laws, ¬(A ∧ B) ⟶ ¬A ∨ ¬B. All three are tautologies (check
their truth tables), and none can be derived with the rules so far. One more rule closes the gap:

$$
\dfrac{\begin{matrix}[\lnot A]^1\\ \vdots\\ \bot\end{matrix}}{A}\;(\mathrm{RAA}^1)
$$

**(RAA)**, from the Latin *reductio ad absurdum*, is proof by contradiction in its full form: to prove A,
assume ¬A and derive ⊥. Compare it with (¬I), which assumes A, derives ⊥, and concludes ¬A. (¬I) proves a
negative statement by refuting the positive one; the proof that there is no largest natural number
(Section 6.1) is of this kind. (RAA) proves a positive statement from the impossibility of its negation.

::: fact Classical logic needs one more rule
Without (RAA), the rules of Section 6.4 do not derive A ∨ ¬A, ¬¬A ⟶ A or ¬(A ∧ B) ⟶ ¬A ∨ ¬B, although
all three are tautologies. Adding any one of three rules, (RAA), excluded middle (A ∨ ¬A for every A) or
double-negation elimination (from ¬¬A conclude A), gives the same derivable formulas: those of
**classical logic**.
:::

Here is double-negation elimination:

```prooftree
¬¬A ⟶ A   (⟶I¹)
  A   (RAA²)
    ⊥   (¬E)
      [¬¬A]¹
      [¬A]²
```

To prove A, assume ¬A (RAA²); together with ¬¬A that is a contradiction (¬E). The other direction,
A ⟶ ¬¬A, needs no (RAA): assume A, and to prove ¬¬A assume ¬A (¬I); A and ¬A give ⊥ (¬E).

Excluded middle takes a little more ingenuity:

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

Assume the opposite, ¬(A ∨ ¬A). If A held, then A ∨ ¬A would hold, contradicting the assumption, so ¬A
(¬I²). But from ¬A, A ∨ ¬A holds after all (∨I₂): a contradiction again, and (RAA¹) concludes A ∨ ¬A. The
assumption ¬(A ∨ ¬A) is used twice, once inside the scope of [A]² and once outside it.

De Morgan's laws come in four directions, and only one of them needs (RAA):

| Law | Needs (RAA)? |
|---|---|
| ¬(A ∨ B) ⟶ ¬A ∧ ¬B | no: Section 6.4 |
| ¬A ∧ ¬B ⟶ ¬(A ∨ B) | no: below |
| ¬A ∨ ¬B ⟶ ¬(A ∧ B) | no: Exercise 6.5 |
| ¬(A ∧ B) ⟶ ¬A ∨ ¬B | yes: below |

```prooftree
¬A ∧ ¬B ⟶ ¬(A ∨ B)   (⟶I¹)
  ¬(A ∨ B)   (¬I²)
    ⊥   (∨E³)
      [A ∨ B]²
      ⊥   (¬E)
        ¬A   (∧E₁)
          [¬A ∧ ¬B]¹
        [A]³
      ⊥   (¬E)
        ¬B   (∧E₂)
          [¬A ∧ ¬B]¹
        [B]³
```

The goal ¬(A ∨ B) is a negation, so assume A ∨ B (¬I²) and derive ⊥ by cases (∨E³): in each case the
assumption ¬A ∧ ¬B supplies the matching negation. The fourth law needs (RAA), and the derivation below
uses it three times. Suppose ¬A ∨ ¬B were false (RAA²). Then A must hold, because ¬A would make ¬A ∨ ¬B
true (RAA³); in the same way B must hold (RAA⁴). But A ∧ B contradicts the assumption ¬(A ∧ B) (¬E):

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

Why does this direction need (RAA)? To prove ¬A ∨ ¬B with (∨I₁) or (∨I₂), you would have to know *which*
of A and B fails, and ¬(A ∧ B) does not say. (RAA) concludes the disjunction without knowing the side.
The same holds for the contrapositive pattern of Section 6.1: (A ⟶ B) ⟶ (¬B ⟶ ¬A) needs no (RAA), but
the direction the pattern uses, (¬B ⟶ ¬A) ⟶ (A ⟶ B), does (Exercise 6.5).

### Intuitionistic logic {#intuitionistic}

Natural deduction without (RAA) is **intuitionistic logic**. It goes back to L. E. J. Brouwer's view,
early in the twentieth century, that a proof must construct what it talks about; Arend Heyting set down its
rules in 1930. In intuitionistic logic a proof of A ∨ B tells you which side holds, and a proof of ∃x. P x
supplies a witness. Classical proofs need not, as this famous example shows.

::: example A proof that does not say which
**Claim.** There are irrational numbers a and b such that $a^b$ is rational.

**Proof.** $\sqrt2$ is irrational. The number $\sqrt2^{\sqrt2}$ is either rational or not (excluded
middle). If it is rational, take $a = b = \sqrt2$. If it is not, take $a = \sqrt2^{\sqrt2}$ and
$b = \sqrt2$; then $a^b = \sqrt2^{\sqrt2 \cdot \sqrt2} = \sqrt2^{\,2} = 2$, which is rational. ∎

The proof shows that a suitable pair exists, but not which of the two candidates it is.
:::

::: note
Intuitionistic proofs can be read as programs: a proof of A ⟶ B is a function from evidence for A to
evidence for B, a proof of A ∧ B is a pair, and a proof of A ∨ B is a value tagged *left* or *right*. The
derivation of A ∧ B ⟶ B ∧ A is then the function that swaps a pair, and that of
(A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C) composes two functions. This is the **Curry–Howard correspondence**, on which
proof assistants such as Rocq and Lean are built. (RAA) has no such reading in general: a program that
produced evidence for A ∨ ¬A for every A would decide every question, including whether any program halts.
:::

Isabelle/HOL is classical, like most of mathematics: (RAA) is one of its rules (Module 7). Still, notice
when a proof uses (RAA): it shows *that* something holds without showing *which* case or *what* witness.

## The quantifier rules {#quantifiers}

In the rules for ∀ and ∃, **P x** stands for any formula in which the variable x may occur free, and
**P t** for the same formula with the term t in place of every free x. As in Module 3, bound variables
are renamed when necessary, so that no variable of t is captured. For example, if P x is x ≤ y, then P 3
is 3 ≤ y; if P x is ∃y. x < y, then P y is ∃z. y < z, not ∃y. y < y.

$$
\dfrac{P\,a}{\forall x.\; P\,x}\;(\forall\mathrm{I})
\qquad\qquad
\dfrac{\forall x.\; P\,x}{P\,t}\;(\forall\mathrm{E})
$$

$$
\dfrac{P\,t}{\exists x.\; P\,x}\;(\exists\mathrm{I})
\qquad\qquad
\dfrac{\begin{matrix}\\ \\ \exists x.\; P\,x\end{matrix} \qquad \begin{matrix}[P\,a]^1\\ \vdots\\ C\end{matrix}}{C}\;(\exists\mathrm{E}^1)
$$

Each rule is one of the informal patterns of Section 6.1:

- **(∀I)** is the arbitrary element. If you have proved P a for a name a about which nothing is assumed,
  the same argument works for every element, so ∀x. P x. *Side condition:* a does not occur free in
  ∀x. P x or in any open assumption of the derivation of P a.
- **(∀E)** applies a general fact: what holds for all elements holds for t, for any term t you choose.
- **(∃I)** is the witness: from P t, for some term t, conclude ∃x. P x.
- **(∃E)** names a witness. To use ∃x. P x for a goal C, give the witness a new name a, assume P a, and
  derive C; the rule discharges [P a]. *Side condition:* a does not occur free in ∃x. P x, in C, or in any
  open assumption of the derivation of C other than [P a]. C may not mention a, because the witness is
  unknown outside this argument.

::: definition Eigenvariable condition
The name a in (∀I) and (∃E) is the rule's **eigenvariable**, Gentzen's term ("own variable"). The
**eigenvariable condition** is the side condition of each rule above: a must be **fresh**. It may not occur
free in the rule's conclusion, in the quantified formula, or in any open assumption that the argument about
a relies on, except the assumption [P a] that (∃E) discharges.
:::

The first example: if every account is open and verified, then every account is open and every account is
verified. With P x for "x is open" and Q x for "x is verified":

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

Read the formula with Isabelle's rule from Module 3: the body of a quantifier extends as far to the right
as possible, so the parentheses around ∀x. P x ∧ Q x are needed. Now check the side conditions. At each
(∀I), the eigenvariable a does not occur in the conclusion, ∀x. P x or ∀x. Q x, and the only open
assumption above it, ∀x. P x ∧ Q x, does not mention a either. (∀E) instantiates the assumption with a. The
two branches may use the same name, because each (∀I) is checked on its own branch.

The second example swaps two quantifiers. Read R x y as "key x opens door y". Then ∃x. ∀y. R x y says that
there is a master key, one key that opens every door, and ∀y. ∃x. R x y says that every door has a key. A
master key is a key for every door:

```prooftree
(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)   (⟶I¹)
  ∀y. ∃x. R x y   (∀I)
    ∃x. R x b   (∃E²)
      [∃x. ∀y. R x y]¹
      ∃x. R x b   (∃I)
        R a b   (∀E)
          [∀y. R a y]²
```

From the bottom: assume there is a master key (⟶I¹). To show that every door has a key, take an arbitrary
door b (∀I). Call the master key a (∃E²), so that ∀y. R a y. In particular a opens b (∀E), so door b has a
key, namely a (∃I). Check the side conditions:

- (∃E²) has eigenvariable a, which occurs neither in ∃x. ∀y. R x y, nor in the conclusion ∃x. R x b, nor in
  any open assumption other than [∀y. R a y]².
- (∀I) has eigenvariable b. The derivation above it has one open assumption, ∃x. ∀y. R x y, because
  [∀y. R a y]² is discharged inside that derivation by (∃E²). Neither it nor the conclusion
  ∀y. ∃x. R x y mentions b.

The converse, (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y), says that if every door has a key, then there is a master
key. It is not valid. Take the structure with domain {0, 1} in which R x y holds when x = y: each element
opens itself and nothing else. Every element is opened by something, so ∀y. ∃x. R x y is true; no element
opens both, so ∃x. ∀y. R x y is false, and the converse is false in this structure. By soundness, it has no
derivation.

### Two wrong proofs {#wrong}

What goes wrong if you try anyway? Here is an attempt at the converse:

```prooftree
(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)   (⟶I¹)
  ∃x. ∀y. R x y   (∃E²)
    ∃x. R x b   (∀E)
      [∀y. ∃x. R x y]¹
    ∃x. ∀y. R x y   (∃I)
      ∀y. R a y   (∀I)
        [R a b]²
```

Every step except one follows the rules. In words: "door b has a key; call it a (∃E²); so a opens b; b was
arbitrary, so a opens every door (∀I); so there is a master key (∃I)". The (∀I) step is wrong. Its
eigenvariable b occurs in the open assumption [R a b]², which is discharged only further down, by (∃E²). The
door b is not arbitrary: it is the door whose key was called a.

The second attempt "proves" that if some element has a property, all elements do:

```prooftree
(∃x. P x) ⟶ (∀x. P x)   (⟶I¹)
  ∀x. P x   (∀I)
    P a   (∃E²)
      [∃x. P x]¹
      [P a]²
```

In words: "some user is an administrator; call that user a; so a is an administrator; a was arbitrary, so
every user is an administrator". This time (∀I) follows its rule: its only open assumption, ∃x. P x, does
not mention a. The error is in (∃E²), whose conclusion P a mentions the eigenvariable a. The name escaped
from the argument in which it was introduced, and (∀I) then treated a particular, unknown witness as an
arbitrary element.

The mistake from Section 6.1, using the name k for the halves of both m and n, breaks the same condition.
After the first (∃E) has introduced k with the assumption m = 2k, a second (∃E) with the same eigenvariable
k would have an open assumption, m = 2k, that mentions k.

::: keyidea
The side conditions are what make (∀I) and (∃E) sound. Both wrong conclusions above are false in a
structure with two elements, so no correct derivation of them exists, and the side conditions are exactly
where the wrong derivations break. When you check a derivation by hand, check every eigenvariable first.
:::

::: pitfall
(∀E) needs care with bound variables. From ∀x. ∃y. x < y ("there is no largest number") you may conclude
∃z. y < z by instantiating x with y. Replacing x by y without renaming would give ∃y. y < y, which says
something else entirely and is false for numbers. The y you substitute must stay free (Module 3).
:::

## Finding proofs: backwards and forwards {#search}

Checking a derivation is mechanical; finding one takes search. There are two directions to search in.

**Forwards**: start from the assumptions and apply rules until the goal appears. This is how the even
system produced *even 4*. Its weakness is that the rules derive endlessly many formulas ((∧I) alone makes
A ∧ A, A ∧ (A ∧ A), …), and nothing tells you which of them lead to the goal.

**Backwards**: start from the goal. Choose a rule whose conclusion matches it; the rule's premises become
new goals, called **subgoals**, and the assumptions that the rule discharges become available in them.
Repeat until every remaining goal is one of its own assumptions. The goal guides the search: its main
connective selects the introduction rule, and its assumptions suggest the elimination rules. This is how
Isabelle works. Its proof state is a list of goals, each with its assumptions, and each proof step replaces
one goal by the subgoals of a rule (Module 7).

Write a goal as Γ ⊢ C: Γ lists its assumptions and C is what remains to be shown. Here is the search for
A ∨ B ⟶ B ∨ A, step by step (Figure 6.3):

1. ⊢ A ∨ B ⟶ B ∨ A. The main connective is ⟶, so apply (⟶I¹). The new goal is A ∨ B ⊢ B ∨ A.
2. A ∨ B ⊢ B ∨ A. Two kinds of rule fit. (∨I₁) on the goal would leave A ∨ B ⊢ B, which is false when A is
   true and B is false: a dead end. (∨E²) on the assumption A ∨ B leaves two goals, A ⊢ B ∨ A and
   B ⊢ B ∨ A, and both must be proved.
3. A ⊢ B ∨ A. (∨I₂) leaves A ⊢ A, a goal that is one of its own assumptions: it is closed.
4. B ⊢ B ∨ A. (∨I₁) leaves B ⊢ B: closed.

No goals remain. The steps, read from the last one back to the first, form the derivation of Section 6.4.

::: figure id=fig-06-3
Backward search for A ∨ B ⟶ B ∨ A. Each box is a goal with its assumptions. Solid arrows lead to subgoals
that must all be proved; the dashed arrow is an alternative step that leads into a dead end.
:::

Working backwards, an elimination rule acts on an assumption of the goal:

- (∧E₁) and (∧E₂) add A, or B, to the assumptions, given A ∧ B.
- (∨E) splits the goal into two, one with A and one with B as a new assumption, given A ∨ B.
- (⟶E) with an assumption A ⟶ B turns the goal B into the goal A.
- (¬E) with an assumption ¬A turns the goal ⊥ into the goal A.
- (∀E) adds P t, for a term t you choose, given ∀x. P x.
- (∃E) adds P a, for a fresh name a, given ∃x. P x.

Some steps can never go wrong; others are bets.

::: definition Safe step
A step of backward search is **safe** if it never turns a provable goal into an unprovable one: whenever
the goal can be proved, so can all the subgoals. A step that is not safe can lead into a dead end, from
which you must go back and try something else.
:::

(⟶I), (¬I), (∧I) and (∀I) are safe on the goal, and so are (∧E₁), (∧E₂), (∨E) and (∃E) on the
assumptions. (∨I₁) and (∨I₂) are not, as step 2 showed, nor is (∃I), whose witness may be the wrong one,
nor (⊥E), which replaces the goal by ⊥. Isabelle's reference manual draws the same distinction for its
automatic provers: a safe rule "must never reduce a provable goal to an unprovable set of subgoals". The
rules of thumb follow:

1. **Close** a goal that is one of its assumptions.
2. **Apply safe introduction rules** to the goal: (⟶I), (¬I), (∧I), and (∀I) with a fresh name.
3. **Apply safe elimination rules** to the assumptions: split A ∧ B, split cases on A ∨ B, and open
   ∃x. P x with a fresh name.
4. **Then make choices**, and be ready to go back. Use an assumption A ⟶ B whose conclusion is the goal
   (⟶E). Instantiate ∀x. P x with a term that already occurs (∀E). For a goal ∃x. P x, choose a witness you
   already have (∃I). For a goal A ∨ B, choose the side that follows from the assumptions (∨I₁, ∨I₂).
5. **If the goal is ⊥**, look for an assumption ¬A and try to prove A (¬E). If the goal is anything else
   and the assumptions contradict each other, (⊥E) turns it into ⊥.
6. **If you are stuck**, use (RAA): assume the negation of the goal and aim for ⊥. A goal A ∨ B in which
   neither side can be proved on its own, such as A ∨ ¬A, needs this.

The order of steps 3 and 4 matters for quantifiers: open the existential assumptions first, so that their
witnesses have names, and then instantiate the universal ones with those names. In the master-key
derivation, (∃E²) names the master key a, and (∃I) then uses a as its witness.

Try the strategy on the converse, (∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y). After (⟶I), the goal ∃x. ∀y. R x y
offers no safe rule, and neither does the assumption, so you must choose. Instantiate the assumption with
some name c and open the result: R a c for a fresh key a. Take a as the witness: the goal becomes
∀y. R a y, and (∀I) needs a fresh door, which cannot be c, because c occurs in the assumptions. So it is a
new door d, and the goal R a d is out of reach: what you know is R a c. Instantiating the assumption with d
gives a key for d, but (∃E) must call it by a fresh name, not a. Every new door brings a new key, and the
search never closes. That is no accident: the formula is not valid, so by soundness every search must fail.

::: widget name=nd-builder
Build proofs backwards, as above. Pick a goal from the list or type your own. Select a goal, then a rule;
for an elimination rule, first click the assumption it should use. The box for terms and names serves
(∀I), (∃I), (∀E) and (∃E); left empty, it gives (∀I) and (∃E) a fresh name. Start with A ∧ B ⟶ B ∧ A and
compare the finished tree with Section 6.4. Then apply (∨I₁) too early in A ∨ B ⟶ B ∨ A, see the dead-end
warning, and undo. Finally take the last-but-one goal, the converse above, and watch the eigenvariable
checks refuse every way out.
:::

## Equality {#equality}

Equality has two rules: one to prove an equation and one to use it.

$$
\dfrac{}{t = t}\;(\mathord{=}\mathrm{I})
\qquad\qquad
\dfrac{s = t \qquad P\,s}{P\,t}\;(\mathord{=}\mathrm{E})
$$

(=I), **reflexivity**, has no premises: every term equals itself. (=E), **substitution**, says that if
s = t, then anything true of s is true of t: you may replace equals by equals. As in the quantifier rules,
P x is a formula with x free, and P s and P t are that formula with s and with t in place of x. You choose
which occurrences to replace, by choosing where x stands in P x.

Symmetry of equality follows:

```prooftree
s = t ⟶ t = s   (⟶I¹)
  t = s   (=E)
    [s = t]¹
    s = s   (=I)
```

Here P x is x = s. Then P s is s = s, which (=I) provides, and P t is t = s, the conclusion. Transitivity
follows too:

```prooftree
r = s ⟶ s = t ⟶ r = t   (⟶I¹)
  s = t ⟶ r = t   (⟶I²)
    r = t   (=E)
      [s = t]²
      [r = s]¹
```

This time P x is r = x: from s = t and P s, which is r = s, conclude P t, which is r = t.

A third consequence matters to programmers. For a function symbol f:

```prooftree
s = t ⟶ f s = f t   (⟶I¹)
  f s = f t   (=E)
    [s = t]¹
    f s = f s   (=I)
```

Here P x is f s = f x: a function gives equal results for equal arguments. In programs this holds only
for **pure** functions, whose result depends on nothing but their arguments, and not for a method that
reads a clock. A compiler that reuses the value of `f(s)` instead of calling `f` again relies on this law,
and must first check that `f` is pure. Functions in Isabelle/HOL are mathematical functions, so there the
law always holds.

::: pitfall
Substitution must not capture variables. From x = y and ∀y. R x y you may not conclude ∀y. R y y. With
P z = ∀y. R z y, the formula P y is ∀w. R y w, after renaming the bound variable (Module 3); the y that is
substituted must stay free.
:::

## From paper to Isabelle {#isabelle}

The Isabelle/HOL tutorial that comes with Isabelle says that Isabelle "is designed around natural
deduction". Module 7 replays this module's derivations in Isabelle, rule by rule; here, let proof search do
the work. `blast` (Modules 2 and 3) is Isabelle's proof-search tool for such goals. Its reference manual
describes it as a tableau prover that uses Isabelle's classical rules, sorted into safe and unsafe ones as
in Section 6.7, and the proof it finds is rebuilt from Isabelle's rules and checked by the kernel. Add these
lemmas to a theory, for example to the one from Module 1:

```isabelle
lemma "A ∧ B ⟶ B ∧ A"
  by blast

lemma "(A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)"
  by blast

lemma "A ∨ B ⟶ B ∨ A"
  by blast

lemma "¬(A ∨ B) ⟶ ¬A ∧ ¬B"
  by blast
```

Isabelle accepts all four: no error appears. Isabelle/HOL is classical, so the formulas of Section 6.5 are
theorems too:

```isabelle
lemma "¬¬A ⟶ A"
  by blast

lemma "A ∨ ¬A"
  by blast

lemma "¬(A ∧ B) ⟶ ¬A ∨ ¬B"
  by blast
```

The quantifier examples work in the same way. With a more telling name than R for the relation, and k
and d for keys and doors, the master-key lemma reads:

```isabelle
lemma "(∀x. P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x)"
  by blast

lemma "(∃k. ∀d. opens k d) ⟶ (∀d. ∃k. opens k d)"
  by blast
```

As in Module 3, the free variables `P`, `Q` and `opens` need no declaration: Isabelle infers their types
and treats them as standing for any predicate. The converse fails:

```isabelle fails
lemma "(∀d. ∃k. opens k d) ⟶ (∃k. ∀d. opens k d)"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. (∀d. ∃k. opens k d) ⟶ (∃k. ∀d. opens k d)
```

`blast` gives up. On its own, that proves nothing: `blast` searches only up to a bound (its reference
manual says that it allows first no unsafe step, then one, and so on up to 20, and then stops), and a
cleverer search might have succeeded. A counterexample settles the question. In Isabelle/jEdit, Auto
Quickcheck (Module 1) may already have marked the lemma with one; Nitpick gives a clearer picture:

```isabelle
lemma "(∀d. ∃k. opens k d) ⟶ (∃k. ∀d. opens k d)"
  nitpick [card = 2]
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2 and card 'b = 2:
  Free variable:
    opens =
      (λx. _)
      (b⇩1 := (λx. _)(a⇩1 := False, a⇩2 := True),
         b⇩2 := (λx. _)(a⇩1 := True, a⇩2 := False))
  Skolem constants:
    λk. d = (λx. _)(b⇩1 := a⇩1, b⇩2 := a⇩2)
    λd. k = (λx. _)(a⇩1 := b⇩2, a⇩2 := b⇩1)
```

Isabelle has inferred two types, one for keys and one for doors, and Nitpick has looked at two elements of
each: keys b₁ and b₂, doors a₁ and a₂. Its value for `opens` is a table of tables: key b₁ opens door a₂ and
not a₁, key b₂ opens door a₁ and not a₂. So every door has a key, and no key opens both. The **Skolem
constants** show the choices behind the counterexample: `λk. d` gives, for each key k, a door d that it
does not open, and `λd. k` gives, for each door d, the key k that opens it. That the key is a function of
the door is the point of the example: in ∀d. ∃k, the key may depend on the door. By soundness, no proof of
the lemma exists.

Equality, finally, is in Isabelle's rule set as well:

```isabelle
lemma "s = t ⟶ t = s"
  by blast
```

::: keyidea
On paper and in Isabelle you use the same two tools: derivations establish ⊢, and counterexamples refute
⊨. Soundness links them, and a proof assistant adds a guarantee that paper cannot give: every step of every
derivation has been checked by its kernel.
:::

## What you learned {#summary}

- A **proof** is a chain of steps, each justified by a rule. Informal proofs follow a few patterns: assume
  the premise, case analysis, contradiction, contrapositive, arbitrary element, witness, and naming a
  witness.
- A **proof system** has inference rules; a **derivation** is a tree of rule applications. **Γ ⊢ A**
  means that A has a derivation whose open assumptions are in Γ; checking a derivation is mechanical.
- **Γ ⊨ A** is about truth. **Soundness** (⊢ implies ⊨) means that the system derives nothing false;
  **completeness** (⊨ implies ⊢) means that it derives every consequence. Natural deduction is both, for
  propositional and first-order logic. A counterexample shows that no derivation exists.
- **Natural deduction** has introduction rules, which prove a connective, and elimination rules, which use
  one: (∧I), (∧E₁), (∧E₂), (∨I₁), (∨I₂), (∨E), (⟶I), (⟶E), (¬I), (¬E) and (⊥E). Rules such as (⟶I)
  **discharge** assumptions, written [A]¹; a discharged assumption may be used only above the rule that
  discharges it.
- **(RAA)** makes the system classical: A ∨ ¬A, ¬¬A ⟶ A and ¬(A ∧ B) ⟶ ¬A ∨ ¬B need it. Without it the
  logic is **intuitionistic**, and its proofs can be read as programs.
- The quantifier rules (∀I), (∀E), (∃I), (∃E) follow the informal patterns. The **eigenvariable** of
  (∀I) and (∃E) must be fresh; most wrong quantifier proofs break this condition.
- Equality has (=I), reflexivity, and (=E), substitution of equals for equals.
- **Backward search** starts from the goal and replaces it by subgoals, as Isabelle does. Apply **safe**
  rules first, then make choices, and use (RAA) when stuck. `blast` searches in this way; Nitpick finds
  counterexamples.

## Exercises {#exercises}

:::: exercise Name the pattern {#ex-6-1} ★
Each argument below uses one or two patterns from Section 6.1. Name them, and the natural-deduction rule
behind each.

1. "If the door is locked, the alarm is armed. The door is locked. So the alarm is armed."
2. "Let u be any user. Every user has a password, so u has one; every password is stored hashed, so u's is.
   Since u was arbitrary, every user's password is stored hashed."
3. "A transaction either commits or aborts. If it commits, the log records it; if it aborts, the log records
   the abort. Either way, the log has an entry for the transaction."
4. "Suppose some process held both locks at once; call it p. Then p acquired the second lock while holding
   the first, which the lock manager never allows. So no process holds both locks."
5. "On the input [3, 1, 2] the function returns [1, 3, 2], which is not sorted. So the function is wrong for
   some input."

::: solution
1. A direct step, **modus ponens**: from A ⟶ B and A, conclude B. Rule (⟶E).
2. **Arbitrary element**, (∀I) on u, after using two general facts about all users and all passwords by
   (∀E). The eigenvariable condition holds: the facts used do not mention u.
3. **Case analysis**, (∨E) on "commits or aborts", with (⟶E) inside each case.
4. **Contradiction** proving a negative statement, (¬I): assume that some process holds both locks and
   derive something impossible. Inside, **naming a witness**: "call it p" is (∃E).
5. **Witness**: the input [3, 1, 2] is a witness for "there is an input on which the function is wrong",
   rule (∃I). A single test proves an existential claim.
:::
::::

:::: exercise Sound, complete, or neither? {#ex-6-2} ★
1. A proof system for propositional logic has all the rules of Section 6.4 and one more: from A ⟶ B and
   B, conclude A. Is it sound? Justify your answer with a valuation.
2. Another system has only the rules (∧I), (∧E₁) and (∧E₂). Is it sound? Is it complete for propositional
   logic?
3. A proof search for a formula A has run for an hour without finding a derivation. What do you know about
   A?
4. Nitpick finds a counterexample to A. What do you know about ⊢ A?

::: solution
1. **Not sound.** The new rule derives A from A ⟶ B and B. The valuation with A false and B true makes
   both premises true (A ⟶ B is true because A is false) and the conclusion A false, so
   A ⟶ B, B ⊭ A. In words: "if it rained, the street is wet; the street is wet; so it rained" is not a
   valid argument.
2. **Sound**, because each rule turns true premises into a true conclusion. **Not complete**: without
   assumptions it derives nothing at all, since every rule needs premises, so it misses every tautology,
   for example A ⟶ A. Even from assumptions it can only take conjunctions apart and put them together:
   A ∧ B ⊨ A ∨ B, but no derivation reaches a formula with ∨.
3. **Nothing.** The formula may be valid and the search slow, or it may not be valid; first-order validity
   is undecidable, so no search can always tell. Look for a counterexample: if there is one, A is not
   derivable.
4. **There is no derivation of A**: by soundness, ⊢ A would imply ⊨ A, and the counterexample shows that A
   is not true in every structure. Stop trying to prove A; correct the statement instead.
:::
::::

:::: exercise Which derivations are correct? {#ex-6-3} ★
Decide for each derivation whether it follows the rules. For each one that does not, name the rule that is
misused, and give a structure that shows its conclusion is not valid.

**Derivation 1**

```prooftree
P a ⟶ ∀x. P x   (⟶I¹)
  ∀x. P x   (∀I)
    [P a]¹
```

**Derivation 2**

```prooftree
(∀x. P x) ⟶ (∀y. P y)   (⟶I¹)
  ∀y. P y   (∀I)
    P a   (∀E)
      [∀x. P x]¹
```

**Derivation 3**

```prooftree
(∃x. P x) ⟶ P a   (⟶I¹)
  P a   (∃E²)
    [∃x. P x]¹
    [P a]²
```

::: solution
1. **Wrong.** At the (∀I) step, the eigenvariable a occurs free in the open assumption [P a]¹ (it is
   discharged only below, by (⟶I¹)). Structure: domain {0, 1}, P true of 0 only, a = 0. Then P a is true
   and ∀x. P x is false, so the implication is false.
2. **Correct.** At (∀I), the only open assumption is ∀x. P x, in which a does not occur free, and a does not
   occur in the conclusion ∀y. P y. The formula says that renaming a bound variable changes nothing.
3. **Wrong.** The conclusion P a of (∃E²) mentions its eigenvariable a. Structure: domain {0, 1}, P true of
   0 only, a = 1. Then ∃x. P x is true and P a is false.
:::
::::

:::: exercise Currying {#ex-6-4} ★★
Derive both formulas:

1. (A ⟶ B ⟶ C) ⟶ (A ∧ B ⟶ C)
2. (A ∧ B ⟶ C) ⟶ (A ⟶ B ⟶ C)

Programmers know them as *uncurrying* and *currying*: a function of two arguments can take them as a pair,
or one after the other.

::: solution
1. Assume A ⟶ B ⟶ C (⟶I¹) and A ∧ B (⟶I²). Take A and B out of the conjunction and apply the
   implication twice:

   ```prooftree
   (A ⟶ B ⟶ C) ⟶ (A ∧ B ⟶ C)   (⟶I¹)
     A ∧ B ⟶ C   (⟶I²)
       C   (⟶E)
         B ⟶ C   (⟶E)
           [A ⟶ B ⟶ C]¹
           A   (∧E₁)
             [A ∧ B]²
         B   (∧E₂)
           [A ∧ B]²
   ```

2. Assume A ∧ B ⟶ C, A and B (three uses of (⟶I)), build A ∧ B, and apply the implication:

   ```prooftree
   (A ∧ B ⟶ C) ⟶ (A ⟶ B ⟶ C)   (⟶I¹)
     A ⟶ B ⟶ C   (⟶I²)
       B ⟶ C   (⟶I³)
         C   (⟶E)
           [A ∧ B ⟶ C]¹
           A ∧ B   (∧I)
             [A]²
             [B]³
   ```

Neither derivation uses (RAA). Read as programs (Section 6.5), the first turns a function that takes its
arguments one after the other into one that takes a pair, and the second does the reverse.
:::
::::

:::: exercise Contraposition and De Morgan {#ex-6-5} ★★
Derive the three formulas. Which one needs (RAA)?

1. (A ⟶ B) ⟶ (¬B ⟶ ¬A)
2. ¬A ∨ ¬B ⟶ ¬(A ∧ B)
3. (¬B ⟶ ¬A) ⟶ (A ⟶ B)

::: solution
1. No (RAA): to prove ¬A, assume A (¬I³); A ⟶ B gives B, which contradicts ¬B.

   ```prooftree
   (A ⟶ B) ⟶ (¬B ⟶ ¬A)   (⟶I¹)
     ¬B ⟶ ¬A   (⟶I²)
       ¬A   (¬I³)
         ⊥   (¬E)
           [¬B]²
           B   (⟶E)
             [A ⟶ B]¹
             [A]³
   ```

2. No (RAA): to prove ¬(A ∧ B), assume A ∧ B (¬I²) and derive ⊥ by cases on ¬A ∨ ¬B (∨E³).

   ```prooftree
   ¬A ∨ ¬B ⟶ ¬(A ∧ B)   (⟶I¹)
     ¬(A ∧ B)   (¬I²)
       ⊥   (∨E³)
         [¬A ∨ ¬B]¹
         ⊥   (¬E)
           [¬A]³
           A   (∧E₁)
             [A ∧ B]²
         ⊥   (¬E)
           [¬B]³
           B   (∧E₂)
             [A ∧ B]²
   ```

3. This one needs (RAA): the goal B is an atom, so no introduction rule applies, and nothing in the
   assumptions produces B directly. Assume ¬B (RAA³); then ¬A follows, which contradicts A.

   ```prooftree
   (¬B ⟶ ¬A) ⟶ (A ⟶ B)   (⟶I¹)
     A ⟶ B   (⟶I²)
       B   (RAA³)
         ⊥   (¬E)
           ¬A   (⟶E)
             [¬B ⟶ ¬A]¹
             [¬B]³
           [A]²
   ```

The third formula is the step that the contrapositive pattern of Section 6.1 relies on, so that pattern is
classical reasoning.
:::
::::

:::: exercise Some and all {#ex-6-6} ★★
1. Derive (∀x. P x ⟶ Q x) ⟶ (∃x. P x) ⟶ (∃x. Q x). In words: if every administrator may delete files and
   some user is an administrator, then some user may delete files.
2. Derive (∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x).
3. The converse of 2 is (∃x. P x) ∧ (∃x. Q x) ⟶ (∃x. P x ∧ Q x). Give a structure in which it is false,
   and say where an attempt to derive it breaks a rule.

::: solution
1. Open the existential assumption first (∃E³), with a fresh name a, then instantiate the universal one
   with the same a:

   ```prooftree
   (∀x. P x ⟶ Q x) ⟶ (∃x. P x) ⟶ (∃x. Q x)   (⟶I¹)
     (∃x. P x) ⟶ (∃x. Q x)   (⟶I²)
       ∃x. Q x   (∃E³)
         [∃x. P x]²
         ∃x. Q x   (∃I)
           Q a   (⟶E)
             P a ⟶ Q a   (∀E)
               [∀x. P x ⟶ Q x]¹
             [P a]³
   ```

   The eigenvariable a of (∃E³) occurs neither in ∃x. P x, nor in the conclusion ∃x. Q x, nor in the other
   open assumption ∀x. P x ⟶ Q x.

2. One (∃E) and one witness for both parts:

   ```prooftree
   (∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)   (⟶I¹)
     (∃x. P x) ∧ (∃x. Q x)   (∃E²)
       [∃x. P x ∧ Q x]¹
       (∃x. P x) ∧ (∃x. Q x)   (∧I)
         ∃x. P x   (∃I)
           P a   (∧E₁)
             [P a ∧ Q a]²
         ∃x. Q x   (∃I)
           Q a   (∧E₂)
             [P a ∧ Q a]²
   ```

3. Domain {1, 2}, P true of 1 only, Q true of 2 only: some element has P and some has Q, but none has
   both. ("Some user is an administrator and some user is a guest" does not give a user who is both.) A
   derivation would have to open both existentials. The first (∃E) introduces a with P a; the second needs
   a fresh name, say b, with Q b, and P and Q are then about different elements. Opening the second with a
   instead breaks the eigenvariable condition, because the open assumption P a mentions a. Nitpick finds a
   counterexample of the same kind, with elements a₁ and a₂: P holds only of a₂, and Q only of a₁.

   ```isabelle
   lemma "(∃x. P x) ∧ (∃x. Q x) ⟶ (∃x. P x ∧ Q x)"
     nitpick [card = 2]
     oops
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
:::
::::

:::: exercise Search backwards {#ex-6-7} ★★
Use the rules of thumb of Section 6.7 to find a derivation of A ∧ (B ∨ C) ⟶ (A ∧ B) ∨ (A ∧ C). For each
step, say whether it is safe. Then build the proof in the widget of Section 6.7, where the formula is
displayed as A ∧ (B ∨ C) ⟶ A ∧ B ∨ A ∧ C because ∧ binds more tightly than ∨.

::: solution
1. Goal ⊢ A ∧ (B ∨ C) ⟶ (A ∧ B) ∨ (A ∧ C): apply (⟶I¹), **safe**.
2. Goal A ∧ (B ∨ C) ⊢ (A ∧ B) ∨ (A ∧ C). Do not choose a side of the goal yet. Split the assumption with
   (∧E₁) and (∧E₂), **safe**: A and B ∨ C become assumptions.
3. Split cases on B ∨ C with (∨E²), **safe**: one goal with B, one with C.
4. Case B: now choose (∨I₁), **unsafe** but right here, then (∧I), **safe**: the goals A and B are both
   assumptions.
5. Case C: (∨I₂), then (∧I): A and C are assumptions.

```prooftree
A ∧ (B ∨ C) ⟶ (A ∧ B) ∨ (A ∧ C)   (⟶I¹)
  (A ∧ B) ∨ (A ∧ C)   (∨E²)
    B ∨ C   (∧E₂)
      [A ∧ (B ∨ C)]¹
    (A ∧ B) ∨ (A ∧ C)   (∨I₁)
      A ∧ B   (∧I)
        A   (∧E₁)
          [A ∧ (B ∨ C)]¹
        [B]²
    (A ∧ B) ∨ (A ∧ C)   (∨I₂)
      A ∧ C   (∧I)
        A   (∧E₁)
          [A ∧ (B ∨ C)]¹
        [C]²
```

Choosing (∨I₁) at step 2, before splitting the cases, would have left the goal A ∧ (B ∨ C) ⊢ A ∧ B: a
dead end, which the widget marks with the valuation A true, B false, C true.
:::
::::

:::: exercise Peirce's law {#ex-6-8} ★★★
Derive ((A ⟶ B) ⟶ A) ⟶ A. The formula contains no connective other than ⟶, yet its derivation needs
(RAA). Hint: use (RAA) at once, and remember that from ¬A and A any formula follows.

::: solution
After (⟶I¹), assume ¬A (RAA²). To use the assumption (A ⟶ B) ⟶ A, you need A ⟶ B. Prove it by assuming A
(⟶I³): together with ¬A this gives ⊥, and (⊥E) gives B. Then (⟶E) yields A, which contradicts ¬A.

```prooftree
((A ⟶ B) ⟶ A) ⟶ A   (⟶I¹)
  A   (RAA²)
    ⊥   (¬E)
      [¬A]²
      A   (⟶E)
        [(A ⟶ B) ⟶ A]¹
        A ⟶ B   (⟶I³)
          B   (⊥E)
            ⊥   (¬E)
              [¬A]²
              [A]³
```

The assumption ¬A of (RAA²) is used twice: once to finish the derivation and once inside the scope of
[A]³. Peirce's law is a tautology (its truth table has only T in the last column) but is not derivable
without (RAA): it is one of the classical laws.
:::
::::

:::: exercise From all to some {#ex-6-9} ★★★
1. Derive (∀x. P x) ⟶ (∃x. P x).
2. Which witness did your derivation use, and where did it come from?
3. Why is the formula valid? Describe what would happen in a "structure" with no elements at all.
4. Check the formula with `blast` in Isabelle.

::: solution
1. Two steps after (⟶I¹):

   ```prooftree
   (∀x. P x) ⟶ (∃x. P x)   (⟶I¹)
     ∃x. P x   (∃I)
       P a   (∀E)
         [∀x. P x]¹
   ```

2. The witness is a name a that occurs nowhere else. (∀E) allows any term, and (∃I) accepts any term as a
   witness, so the derivation needs no element that is known to exist.
3. The formula is valid because the domain of every structure has at least one element, and the
   rules build this in: any name may serve as a witness. In an empty domain, ∀x. P x would be true, since
   there is nothing to check, and ∃x. P x would be false, since there is nothing to find. First-order logic
   excludes empty domains, so the derivation is sound.
4. Isabelle's types are never empty either. The Isabelle/HOL tutorial explains why: otherwise "the
   quantifier rules would be unsound, because ∃x. x = x is a theorem". So `blast` proves the formula:

   ```isabelle
   lemma "(∀x. P x) ⟶ (∃x. P x)"
     by blast
   ```
:::
::::

## Check yourself {#quiz}

```quiz
? What does ⊢ A ∧ B ⟶ B ∧ A say?
- [ ] A ∧ B ⟶ B ∧ A is true in every valuation
- [x] There is a derivation of A ∧ B ⟶ B ∧ A with no open assumptions
- [ ] A ∧ B ⟶ B ∧ A has been checked by Isabelle
- [ ] B ∧ A follows from A ∧ B in some valuation
> ⊢ is about derivations: a tree of rule applications whose open assumptions are all on the left of ⊢, here none. Truth in every valuation is ⊨; soundness and completeness say that the two agree.

? A proof system is sound if …
- [x] every formula it derives from Γ is true in every valuation or structure that makes Γ true
- [ ] every formula that is true in every valuation can be derived
- [ ] every derivation can be checked by a computer
- [ ] it has an introduction and an elimination rule for each connective
> Soundness is "⊢ implies ⊨": the system derives nothing false. The second option is completeness.

? In a derivation, (⟶I¹) concludes A ⟶ B. What happens to the assumption [A]¹?
- [ ] It becomes an open assumption of the conclusion
- [ ] It must have been derived earlier by another rule
- [x] It is discharged: the conclusion A ⟶ B no longer depends on it, and it may be used only above this rule
- [ ] It is deleted from the derivation
> Discharging moves the assumption into the conclusion. Its scope is the part of the derivation above the rule that discharges it.

? Which formula cannot be derived without (RAA)?
- [ ] A ⟶ ¬¬A
- [ ] ¬(A ∨ B) ⟶ ¬A ∧ ¬B
- [ ] (A ⟶ B) ⟶ (¬B ⟶ ¬A)
- [x] ¬¬A ⟶ A
> Double-negation elimination is classical. The other three have derivations in Sections 6.4 and 6.5 and in Exercise 6.5 that use no (RAA).

? Why is this step wrong: from the open assumption P a, conclude ∀x. P x by (∀I)?
- [ ] (∀I) needs two premises
- [x] The eigenvariable a occurs free in an open assumption, so a is not arbitrary
- [ ] P a must first be turned into ∃x. P x
- [ ] A variable named a cannot be generalised, only x can
> The eigenvariable condition of (∀I): a may not occur free in any open assumption. Here the assumption P a is exactly what makes a special.

? Backward search has reached the goal A ∨ B ⊢ B ∨ A. Which step is safe?
- [ ] (∨I₁), turning the goal into B
- [ ] (∨I₂), turning the goal into A
- [x] (∨E) on the assumption A ∨ B, giving two goals
- [ ] (⊥E), turning the goal into ⊥
> (∨E) never loses provability. (∨I₁), (∨I₂) and (⊥E) can: A ∨ B ⊢ B, A ∨ B ⊢ A and A ∨ B ⊢ ⊥ are all unprovable, although the goal is provable.
```
