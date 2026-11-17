# Review of Module 6, What is a proof? Natural deduction

## Follow-up content audit, 17 November 2026

Read the whole English module, including rule side conditions, derivations, exercises and quiz.
Line numbers refer to the source at the start of this follow-up.

- **L19–23, 83–87, 135–141:** made proof relative to explicit assumptions and rules, distinguished
  sampled tests from exhaustive finite checking, and distinguished circularity from discharged
  assumptions. The withdrawal example now uses mathematical integers without overflow.
- **L163, 198, 213–219:** restricted the even system to natural numbers, specified open assumptions,
  and qualified equivalence of proof systems. Added the missing convention that `True` and `⟷`
  abbreviate `¬⊥` and `(A ⟶ B) ∧ (B ⟶ A)` when using the listed rules and completeness claim.
- **L240–291:** soundness requires true open premises; incompleteness does not imply soundness.
  Qualified genuine/spurious counterexamples, corrected the undecidability statement to exclude a
  terminating, correct yes-or-no algorithm, and fixed the reference to Module 3.
- **L640–666:** qualified intuitionistic disjunction/witness extraction for closed proofs in the basic
  calculus and suitable evidence for premises. Classical use of Rocq or Lean does not automatically
  provide constructive extraction; classical computational interpretations also exist.
- **L859–898, 1053–1057:** separated preservation of provability from termination of search, documented
  the widget's restricted equality rewriting, and qualified the kernel guarantee. A stuck widget is
  not an unprovability result.
- **L1116–1119, 1426–1430 and quiz:** clarified first-order search, matching assumptions for a genuine
  counterexample, and why a free parameter can witness existence in a non-empty domain.

Primary references: [Isabelle2026 implementation manual, Logic](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Implementation/Logic.html)
and [Isar reference, Generic tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Generic.html).
Mathematical arguments and countermodels were checked by hand.

Validation: all 8 Isabelle blocks, 3 captured-output blocks, 33 proof trees and existing IDs are
unchanged. English source checker: no errors or warnings. The natural-deduction widget passes all 14
checks. English HTML and root MkDocs builds passed. Inspected the whole page at 1280 and 390 px with
solutions expanded: no page overflow, broken images, KaTeX errors, missing local anchors or browser
errors. Wide proof trees continue to scroll in their containers; the shared renderer issue below is
unchanged. Isabelle is unavailable on this Mac, so no fresh prover run was possible. Chinese
synchronisation remains deferred while that edition is paused.

## Original review, 16 November 2026

Reviewed on 16 November 2026: `src/en/module_06.md`, `src/widgets/nd-builder.js` (with its test
`tools/widget-tests/nd-builder.mjs`) and `src/figures/_gen/figs_06.py`. Line numbers are those of the
page as I found it, before my edits.

## How it was checked

- **Every derivation tree checked mechanically.** A script (scratchpad `ndcheck/check.mjs`, which parses
  the ```prooftree blocks with the widgets' formula parser) checks each step against its named rule,
  every [A]ⁿ leaf against the rule numbered n below it and the formula that rule discharges, label
  reuse, and the eigenvariable conditions of (∀I) and (∃E); it lists each tree's open assumptions. All
  28 correct trees pass with the open assumptions the text claims (none, or A ∧ B, or *even 1*). The five
  deliberately wrong trees fail exactly where the text says: the scope example (L404), the converse
  attempt at (∀I) (L753), the ∃-to-∀ attempt at (∃E²) with (∀I) correct (L770), and Exercise 6.3's
  derivations 1 and 3; derivation 2 is correct, as the solution says.
- Soundness and completeness statements, the classical/intuitionistic remarks, the safe-rule
  classification and every exercise and quiz answer worked through by hand.
- Quotations checked in the manuals: tutorial "Isabelle is designed around natural deduction" (§5.1)
  and "the quantifier rules would be unsound, because ∃x. x = x is a theorem" (§8.5); isar-ref §9.4.2
  ("A safe rule must never reduce a provable goal to an unprovable set of subgoals") and §9.4.3 (`blast`
  is a tableau prover whose proofs are reconstructed by Isabelle; bound 0 rising to 20).
- In a scratch build, Quickcheck does find a counterexample to the master-key converse, so "Auto
  Quickcheck may already have marked the lemma" holds (`auto_quickcheck` is on by default,
  `auto_nitpick` off: `src/HOL/Tools/etc/options`). Nitpick's output and the page's reading of it (keys
  b₁ b₂, doors a₁ a₂, the Skolem functions) agree.
- `python3 -I tools/isa.py --module 06`: all outputs match (no Isabelle block was changed).
- The widget driven in a browser: every provable preset, the exercise 6.7 and Peirce derivations and
  (∀x. P x) ⟶ (∃x. P x) built step by step; each finished tree is identical to the page's tree. Odd and
  wrong input tried (see below).

## Issues found and what I did

1. **L606, "The fourth law needs (RAA) three times".** False: one (RAA) is enough (¬(¬A ∨ ¬B) gives ¬¬A
   and ¬¬B, and these with ¬(A ∧ B) give ⊥, all without (RAA)). Now: the law needs (RAA) and the
   derivation below uses it three times. The tree had no reading in words; added one. I kept the tree
   itself, because Module 7 replays exactly this tree in Isabelle.
2. **L240–242, the even system "is also complete".** Under Definition 6.3 (for all Γ) this is false:
   *even 3* ⊨ *even 1* holds (no situation makes *even 3* true) but nothing derives *even 1* from *even 3*.
   Now restricted to statements without assumptions, which is what the argument shows.
3. **L287–288, "no proof system is complete for it".** Imprecise: the incompleteness theorem is about
   mechanically checkable systems. Now "its proof system, like every other that a machine can check,
   cannot derive every true statement about the natural numbers".
4. **L745 and L877.** "It is false" / "the formula is false" for a formula that is merely not valid (it
   is true in some structures). Now "not valid", and the countermodel sentence says the converse is false
   *in this structure*.
5. **L110.** "(Section 6.5 shows that this step needs classical logic.)": "this step" was ambiguous and
   Section 6.5 states rather than proves it. Reworded: going from the contrapositive back to the
   implication needs classical logic, as Section 6.5 explains.
6. **L253.** ⊭ used without being read aloud (Modules 2–3 do not introduce it). Added the reading.
7. **L31.** ∎ is used for the first time in the series without a word. Added "The mark ∎ ends a proof."
8. **L6, `needs`.** Only "Modules 2 and 3", but the page relies on Module 1 (LCF kernel, Quickcheck,
   Dijkstra) and Module 5 (induction over derivations). Now "Modules 1–5, especially Modules 2 and 3 (…)".
9. **Figure 6.2.** The labels (⟶I³), (⟶I²), (⟶I¹) sat on the dashed borders of the scope boxes, in both
   languages. Labels moved a few pixels below their lines and the boxes shortened; regenerated, both
   languages checked.
10. **Widget: goals with True.** A formula containing True (or ⊤) was accepted, but no rule handles True,
    so the reader was stuck with no explanation and no dead-end mark. It is now refused, like ⟷, with a
    suggestion (¬⊥, which (¬I) proves). Test extended by one check; `node tools/widget-test.mjs --only
    nd-builder --lang en`: 14 passed.

Verified and left unchanged: rule names and conventions (premise order of (⟶E), (¬E), (=E) as in
Module 7's table; (∨E) discharging both cases with one number); soundness and completeness (Fact 6.1),
Gödel 1929/1931, Gentzen 1934/35, Jaśkowski 1934, Heyting 1930; the √2 example; the Curry–Howard note;
the safe and unsafe steps of Section 6.7; all cross-references (Sections 6.1–6.9, Exercises 6.5, Figures
6.1–6.3).

The widget with odd input: it refuses introduction rules on goals of the wrong shape (with a hint),
elimination rules without a selected assumption or on one of the wrong shape, (⟶E) on a negation, (¬E)
when the goal is not ⊥, (=I) on unequal sides, (∃I)/(∀E) without a term, unreadable formulas, ⟷ and
names used both as predicate and term. **Fresh-variable conditions are enforced**: (∀I) and (∃E) refuse
a name that occurs free in the goal or any assumption (P a ⟶ ∀x. P x; (∃x. P x) ⟶ P a; reusing k for a
second (∃E), the mistake of Section 6.1; every way out of the converse); an empty box gives a fresh name.
(∀E) and (=E) substitute without capture (∃y1. R y y1). Dead ends show correct countermodels (A = T,
B = F, C = T for Exercise 6.7, as the solution says).

## Not fixed

- **Four trees are wider than the text column at 1280 px** and scroll sideways, hiding their lowest rule
  labels until scrolled: ¬(A ∧ B) ⟶ ¬A ∨ ¬B (1032 px in an 820 px column), Exercise 6.5 part 2
  (769/714), Exercise 6.6 part 2 (728/714) and Exercise 6.7 (975/738). The formulas cannot be shortened;
  see the renderer note below.
- **Widget limitation (sound, not complete):** (=E) always rewrites every occurrence of t into s, using
  the equation left to right only, so for example f x = x ⟶ f (f x) = x cannot be finished in the widget.
  The button's description says exactly what it does, and the module's equality examples (symmetry,
  transitivity, congruence) all work. Left as it is.

## Other modules and shared tools

- **tools/md.mjs, renderProofTree:** each node with a rule reserves 0.6rem + 0.5rem per character of its
  label as right margin, and the reservations add up through the nesting levels, so deep trees grow far
  wider than their formulas. Reserving the room once per row, or letting wide trees use the full content
  width, would fit all four trees above. Module 7 shows the same De Morgan tree and overflows likewise.
- **Module 7, line 1587**: "Section 6.5 showed that one needs (RAA)": Module 6 states this, it does not
  prove it ("states" would be exact). Module 7's references to Module 6 (Sections 6.4–6.9, Exercises
  6.4–6.8, the tree shapes and rule names) all hold.
- Module 2's forward reference to ⊢ in Module 6 holds.
- Facts that could go into FACTS.md: the four manual quotations above with their sections, and the
  defaults `auto_quickcheck = true`, `auto_nitpick = false`.
