# Review of Module 4: Sets, relations and functions

Reviewer's log, 16 November 2026. Files: `src/en/module_04.md`, `src/widgets/relation-explorer.js`,
`tools/widget-tests/relation-explorer.mjs`, `src/figures/_gen/figs_04.py`. Line numbers refer to the page
as it was before the review.

## What was checked

- Every set law in the table (Section 4.1) against its propositional law, and the duals; Fact 4.2 and the
  one-element counterexample argument; both truth-table examples (the failing law's two differing rows).
- Every relation property and witness in Example 4.4, the pitfall box, Exercise 4.2 and the quiz;
  Fact 4.3; equivalence classes and the partition proof; the orders, minimal/maximal claims, Hasse
  diagrams (Figure 4.2); well-foundedness and the key idea; closures, the path-shortening argument, the
  order-of-closures pitfall, reachability (correctly the reflexive-transitive closure, image `T*[I]`,
  also in the quiz); the door example and Figure 4.3; injective/surjective/bijective examples,
  Fact 4.5, `inv`; counting rules, pigeonhole (13 people, 1000 keys/256 buckets, compression),
  countability listings, Cantor's proof, Figure 4.4 (diagonal values recomputed), Russell; all seven
  exercises and the quiz, worked by hand. All correct except as listed below.
- Isabelle facts against Isabelle2026 sources: `refl_on`, `irrefl_on`, `sym_on`, `antisym_on`,
  `trans_on`, `total_on` (Relation.thy; `sym`, `trans`, `refl` are abbreviations for the `_on UNIV`
  forms, and `sym_def`, `trans_def` are lemmas), `equiv` (includes `r ⊆ A × A`), `A // r`,
  `quotient_disj`, `wf_less`, `wf_iff_no_infinite_down_chain`, `wf_iff_acyclic_if_finite`,
  `Cantors_theorem`, `pigeonhole`, `card_Pow`, `sym_Int`, `trans_Int`; the typing abbreviations in
  `etc/symbols` (`:` `~:` `(=` `Un` `Int` `<*>`; `^-1`, `r^+`, `r^*` are ASCII notations). By scratch
  runs: `value "{x. x < (5::nat)}"` gives the `enum` wellsortedness error the trouble box describes;
  plain `auto` fails on `trans r ⟷ r O r ⊆ r` (so `simp: trans_def` is needed, as the text says);
  `auto` fails and `blast` runs away on `¬ surj (f :: 'a ⇒ 'a set)`, so `force` is the right method.
- The widget: built, `node tools/widget-test.mjs --only relation-explorer --lang en` passes, and a
  scratch script (out/scratch/rev48w/fuzz.mjs) compared it with an independent implementation on the
  11 hand-checked relations of the page and 150 random relations on 3–5 elements (properties, every
  witness, the classification line, the transitive closure), plus odd click sequences (closure twice,
  shrinking after a closure, all presets at all sizes): 1312 checks, no failure, no page error.
- Screenshots of the whole page at 1280 px, and the opened solutions: no layout problem.

## Issues found and what was done

| Line | Issue | Action |
|---|---|---|
| 6 | `needs:` in a style different from the series. | Now "Modules 1–3" (coordinator's request). |
| 85 | Fact 4.1(1) has two parts; only `∅ ⊆ A` was justified. | Added the one-line reason for `A ⊆ A`. |
| 516 | The image definition used `S` for a set right after `S` was a relation in the same box. | Renamed the set `X` (also in the Isabelle notation). |
| 603 | First use of `auto simp:` (before Module 9): the reason a definition must be named was thin. | Explained that `auto` does not unfold `trans r` by itself and what `simp: trans_def` does. |
| 660 | Partition proof did not say why the classes are subsets of `A`. | Added. |
| 672 | "Module 12 uses this" (the kernel of a function as an equivalence): Module 12 has abstraction functions but never states this. | Reworded to a true statement about abstraction functions, without claiming Module 12 says it. |
| 727 | "each gives the other" showed only one direction. | Added `x ≤ y ⟷ x < y ∨ x = y`. |
| 742 | "x ≤ y exactly when an upward path leads from x to y" is false for infinite orders (no covering pairs). | Restricted Hasse diagrams to partial orders on finite sets. |
| 790 | "the step" | "the induction step" (series terminology). |
| 864 | Claimed the widget's closure buttons compute R⁺ by repeated composition; the widget uses Warshall's algorithm. | Text now says the button computes the same relation. |
| 910 | First use of `definition` described as "like `fun` … for a value without arguments", which misdescribes the command. | Rewritten: a new constant with a defining equation, no recursion. |
| 960 | "closing a closure again adds nothing" introduced a lemma about `r⇧*` after talking about R⁺. | Reworded. |
| 992 | "Every HOL function is total" right after "total relations": two senses of "total". | Added a sentence separating them. |
| 994 | "HOL models the missing values explicitly" was vague. | Now points to the `option` type of Module 8. |
| 1172 | "the pigeonhole principle is `pigeonhole`:" followed only by the `card_Pow` lemma; the goal promises a check of pigeonhole in Isabelle. | Added a checked lemma `card (f ` A) < card A ⟶ ¬ inj_on f A` by `simp add: pigeonhole`, with an explanation; adjusted the "lemma above" reference at line 1182. |
| 1224 | Cantor: both steps of `d ∈ D ⟷ d ∉ f d ⟷ d ∉ D` were attributed to the definition of D; the second uses `f d = D`. The conclusion did not say which assumption was refuted. | Each step now has its reason, and the contradiction refutes surjectivity explicitly. |
| 1251 | Russell: "if there were a set of all sets, then R … would be one" is not the paradox's premise. | Rewritten: naive set theory lets every property define a set; HOL avoids it with types. |
| 1266 | `force` used before Module 9 with a thin explanation, and "follows" without saying from what. | Explained how the theorem follows from `diagonal`, and what `force` does differently from `auto`. |

All Isabelle changes rechecked: `python3 -I tools/isa.py --module 04` reports 46 blocks, 29 output
blocks, all outputs match. `node tools/check.mjs --lang en`: no errors or warnings.

## Not changed

- The widget and its test: correct as they stand; no change needed.
- The figures (4.1–4.4): checked by eye in both languages' sources; correct.
- Exercise 4.4's long `definition calls` line scrolls inside its code box at narrow widths; harmless.

## Other modules and shared tools

- Module 5 cites Module 4 for well-founded relations and the bounded quantifier; Modules 9, 11, 13 and
  14 cite Module 4 for `auto simp:`, `r⇧*`, the door state machine and strings. All consistent with the
  page after this review.
