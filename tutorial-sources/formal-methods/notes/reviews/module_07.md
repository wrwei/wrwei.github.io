# Review of Module 7, Natural deduction in Isabelle

## Follow-up content audit, 17 November 2026

Read all explanations, rule applications, proof-state/error examples, exercises and quizzes.
Line numbers refer to the source at the start of this follow-up.

- **L319–323, 530–542, 879–896:** destruction can produce an instance, not just a literal part of a
  premise. Unification respects types and scope. Clarified first-subgoal methods and customary method
  pairings: `rule conjunct2` and `erule mp` are legitimate uses already present in the series.
- **L1284–1304:** removed “no other method can help” after the early existential-witness choice.
  Scope prevents the intended direct instantiation with the later parameter; it does not establish
  impossibility of a HOL proof. A choice term can name a master key without the local parameter.
  In the later displayed state, choosing a counterexample door also recovers the information lost by
  consuming the universal assumption. The simple teaching repair remains `exE` before `exI`; no new
  untested proof script was added.
- **L1322–1325, 1448–1453, 1839–1841:** restricted the `simp` failure to the displayed witness-search
  problem, distinguished explicit intuitionistic rules from classical HOL, and replaced the “same
  main connective” criterion for `rule` with unification against the goal.
- **L1950–2019, 2353–2357, 2451 and quiz:** search can hit resource limits, reconstructed proofs remain
  relative to assumptions/axioms, and distinct fixed names do not assert unequal values. “Fix first,
  guess later” is a useful strategy, not a requirement on every possible HOL proof.

Primary references: [Isar reference, Generic tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Generic.html),
[implementation manual, Proof](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Implementation/Proof.html),
and [`Hilbert_Choice`, notably `someI_ex`](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL/Hilbert_Choice.html).

Validation: all 139 Isabelle blocks, 101 captured-output blocks, 11 proof trees and existing IDs are
unchanged. English checker: no errors or warnings. English HTML and root MkDocs builds passed.
Inspected the whole page at 1280 and 390 px with solutions expanded: no page overflow, broken images,
KaTeX errors, missing local anchors or browser errors. Wide trees use existing horizontal scroll
containers. No fresh Isabelle run was possible on this Mac. Chinese synchronisation remains deferred.

## Original review, 16 November 2026

Reviewer's pass, 16 November 2026. Line numbers are those of `src/en/module_07.md` before the review.
Every `thm` output, proof state and error message on the page comes from `tools/isa.py`. Claims that
no output block covers were checked in scratch sessions (`out/scratch/rev79/`) or in the Isabelle2026
sources and manuals.

## Issues found and fixed

| Line | Issue | Fix |
|---|---|---|
| 35–47, Fig. 7.1 | ≡ was read only as "is defined as". It is Pure's equality: Module 9 shows rewrite rules such as `?x1 = ?x1 ≡ True`, which are not definitions. | Definition box and table now say "Pure's own equality, used above all to state definitions"; the table reads "a equals b; in a definition, a is defined as b". Figure 7.1 label changed in English and Chinese ("equals (used in definitions)", "等于（用于定义）") and redrawn. |
| 142 | "⟹ can only appear at the outside of a statement" contradicts the fact box just above (`(A ⟹ B) ⟹ C`). | "It joins statements, but it can never appear inside a HOL formula." |
| 312–323 | "The rules in the table come in three shapes": `ccontr`, `classical`, `refl`, `subst`, `ssubst` fit none. Elimination rules were said to conclude `?R` or `?Q`, but `FalseE` concludes `?P`, and its major premise has no connective. | "Most rules … come in one of three shapes"; elimination rules have "the connective (or `False`)" in the major premise and "a schematic variable such as `?R`" as conclusion. |
| 349 | "The first theorem that Module 6 derived" is ⊢ even 4 (Section 6.2). | "… derived with natural deduction". |
| 448–450 | `?P5` was described as "renamed"; the number is the variable's index (isar-ref §3.2), which Module 9 needs to explain `?f1.0`. | "the variable `?P` with the number 5 attached, its **index**". |
| 1026–1031 | Pitfall said "On paper this formula is written ∀x.(P x ∧ Q x) ⟶ …". Module 6 writes it with the parentheses round the quantifier, using Isabelle's convention (Module 6, line 720). | "Some books write …; in Isabelle, as in Modules 3 and 6, …". Reflowed an over-long line. |
| 1551–1553 | "occur so often together that HOL provides them as one rule, `classical`": an unverifiable claim about motive. | "together do the work of a single rule, `classical`". |
| 1761–1763 | "for `erule` and `drule`, in addition, no assumption fits the rule's major premise": `drule` never unifies the rule's conclusion, and "in addition" suggests both conditions are needed. | Separate cases for `erule` (either condition) and for `drule`/`frule` (major premise). |
| 1978–1979 | Nitpick credited to Module 3 only; Module 2 introduces it (coordinator's note). The word "initial" in "Failed to apply initial proof method" was never explained. | "`nitpick` (Modules 2 and 3)"; one clause explains that with `by` the method is the *initial* proof method. |
| 2049–2055 | Exercise 7.1, solution 3: the paper rule `impE` was a `prooftree` with [Q]¹ above a rule line under which R stands. That draws a one-step inference from Q to R, not a derivation of R from the assumption Q. | Drawn as Module 6 draws (∨E) and (⟶I): KaTeX `\dfrac` with `[Q]^1 ⋮ R` (checked in the built page). |

## Checked and correct (no change)

- The rule table against Module 6: every name of Module 6's rules, the premise order of (⟶E) `mp`,
  (¬E) `notE`, (∨E) `disjE`, (∃E) `exE` and (=E) `subst`, and every statement as `thm` prints it.
- Every cross-reference into Module 6 (Sections 6.4, 6.5, 6.6, 6.7, 6.8, 6.9; Exercises 6.4, 6.5, 6.6,
  6.8) and within the module (sections, figures, exercises).
- `done` does not close goals by assumption, `by` does: `apply (rule conjI) done` on ⟦A; B⟧ ⟹ A ∧ B
  fails with "Failed to finish proof", `by (rule conjI)` succeeds (scratch).
- `end` after an unfinished apply script is refused with "Illegal application of proof command in
  "prove" mode" (scratch), as Section 7.8 says.
- `apply (rule exI[of _ 3])` works on `∃n::nat. n + n = 6` (scratch).
- Abbreviations `==>`, `!!`, `==`, `[|`, `|]` (Isabelle2026 `etc/symbols`).
- The *Programming and Proving* quotations: "method of choice for complex logical goals", "knows very
  little about equality", and the advice to state theorems as ⟦A₁; …; Aₙ⟧ ⟹ A (prog-prove §3.1, §3.3).
- Eigenvariable and `exI`/`exE` ordering explanations (Sections 7.6, Exercises 7.7 and 7.9), the
  error-message section, every exercise solution and quiz answer.
- Rendering at 1280 px (all 59 screens) and at 375 px (no horizontal overflow); both figures in English
  and Chinese.

## Left as it is

- Figure 7.1 uses 18 px Isabelle text (AUTHORING asks for 11–16). It renders cleanly and is legible in
  both languages; changing it would mean re-spacing the coloured spans.

## Problems outside this module (for the coordinator)

- Intermittent: `tools/isa.py --module 07` (default `--jobs 4`) twice produced an empty log for the main
  session `Module_07` (no `PIDE/messages` exports, empty theory timings, return code 0), so all 90 output
  blocks were reported as "Isabelle printed nothing". The same theories built under another session name
  produced every message. A third run lost only the messages of `Module_07_Solutions` (13 blocks). Runs
  in between, and the last run, gave "all outputs match" with no change to any Isabelle block. `isa.py`
  retries incomplete probe logs but not the main session; it could do the same for `Module_NN`, or at
  least say "incomplete log" instead of 90 separate "printed nothing" lines.
