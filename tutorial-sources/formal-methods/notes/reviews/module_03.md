# Review of Module 3, Predicate logic

## Audit and revision — 17 November 2026

English content audit against commit `a79a552`. Line numbers below refer to that baseline; current sections retain their IDs.

- **L25.** Opening example: added document guards and the report-is-a-document premise in the one-domain formula, while keeping the later typed Isabelle example intact.
- **L99.** Semantics: separated denotation from executable computation and corrected the claim that enumeration over an infinite domain never returns early.
- **L449.** Validity: limited the arbitrary-interpretation explanation to the first-order examples; concrete types, definitions and assumptions remain fixed in general Isabelle lemmas.
- **L495.** Countermodels: fixed-size search does not guarantee identical witnesses or labels; conservative quiz wording now reports only what the search found.
- **L710.** Substitution: made capture-avoiding renaming part of the definition.
- **L933.** Policies: stated the one-domain typing assumptions for admins, ownership and permissions. Added the missing train/block guards in independently translated exercise sentences.
- **L1007.** Types: qualified the first-order translation with non-empty sorts and sort-respecting functions; distinguished it from higher-order quantification.
- **L1047.** Permissions: ownership is sufficient, not necessary, for deletion under the stated rule.
- **L1183.** Decidability: removed a stale cross-reference and guaranteed-efficiency wording; revised Figure 3.3 to show exhaustive theoretical searches rather than promising completeness for simp/blast.
- **L1550.** Names: explained that Alice and Bob can denote the same user in the one-element countermodel.

### Validation and scope

- Re-read the English page, worked examples, exercise solutions and quiz; retained the established section and exercise IDs.
- Every Isabelle and captured-output block is byte-for-byte unchanged from commit `a79a552`. The existing downloadable theories are reused unchanged.
- `node tools/check.mjs --lang en`: 18 pages, 0 errors, 0 warnings. The English site builds successfully, and `mkdocs build` from the repository root passes.
- Browser checks cover desktop (1280 px) and phone (390 px), expanded solutions, image decoding, formula rendering, internal anchors, page overflow and JavaScript errors. See the local `out/audit-module-03/` screenshots and metrics.
- Isabelle2026 is not installed on this computer. The requested Isabelle recheck could not run; unchanged code/output comparison and the earlier successful proof-check logs are not represented as a fresh prover run.
- Chinese work remains paused. These English changes must be reconciled before publishing the Chinese edition.

### Additional checks and sources

- Model-explorer widget: 29 existing scripted checks passed, 0 failed.
- [Isabelle2026 implementation manual](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Implementation/Logic.html), for theory context and logical variables; [official Nitpick manual](https://isabelle.in.tum.de/doc/nitpick.pdf), for bounded search and potentially spurious results.
- Figure 3.3 distinguishes exhaustive theoretical search from the bounded practical tools. The Chinese figure is unchanged while translation is paused.

## Earlier review — 16 November 2026

Reviewed on 16 November 2026: `src/en/module_03.md`, `src/widgets/model-explorer.js` (with its test
`tools/widget-tests/model-explorer.mjs`) and `src/figures/_gen/figs_03.py`. Line numbers are those of the
page as I found it (snapshot commit 710e1a5), before my edits.

## How it was checked

- Every definition, law, example, exercise solution and quiz answer worked by hand: the evaluations in
  𝓜₁ (Figure 3.2) and 𝓜₂ (Exercise 3.2), the countermodels of Example 3.5 and Exercise 3.4, the
  quantifier laws (negation, distribution and the one-way laws, quantifiers and formulas without the
  variable, order of quantifiers), the substitutions of Example 3.8 and Exercise 3.7, the counting
  formulas, the policy of Example 3.10 and the translations of Exercise 3.3, the finite-model argument
  of Exercise 3.8.
- Every Nitpick countermodel read against the prose (tables of tables, Skolem constants, the two-type
  countermodels).
- Decidability statements checked against standard accounts: Hilbert and Ackermann (1928), Gödel's
  completeness theorem (thesis 1929, published 1930), Church and Turing (1936), the incompleteness
  theorems (1931), semi-decidability of validity and unsatisfiability, satisfiability not
  semi-decidable, decidability of the monadic fragment, the formula with only infinite countermodels.
- Isabelle claims checked: `value "∀x::nat. x < x + 1"` fails with "Wellsortedness error: Type nat not
  of sort enum" and Quickcheck prints predicates as sets (`P = {a⇩1}`) (scratch build
  `out/scratch/rev123`); `blast`'s bound on unsafe steps rises from 0 to 20 (isar-ref §9.4); Nitpick's
  default `card` is 1–10 (nitpick manual); HOL types are non-empty; `∃!` syntax (`HOL.thy`).
- `python3 -I tools/isa.py --module 03`: all outputs match, before and after the edits (no Isabelle block
  was changed).
- The widget exercised in a browser with odd inputs (free variables, unknown predicates and elements,
  wrong arities, function symbols, numbers, `∃!`, shadowed variables, `P(x)` and ASCII, `≠`, mixed ⟶/⟷,
  8 and 10 quantified variables); built page and figures 3.1–3.3 (both languages) looked at;
  `node tools/check.mjs --lang en` clean.

## Issues found and what I did

1. **L46–47: "predicate logic has been the standard language of mathematics ever since [1879]"** is an
   overstatement (Frege's notation was little used for decades; first-order logic became standard in the
   twentieth century). **Softened:** "has since become the standard language for stating mathematics
   precisely".
2. **L139–140:** the formation rule for the binary connectives dropped Module 2's parentheses without
   saying so. **Added** "with parentheses where the priorities of Module 2 need them".
3. **L262–270, Definition 3.6:** "n-tuple" and the notation c^𝓜 were used without explanation, a
   module before sets and relations. **Added** one sentence that defines n-tuples and reads c^𝓜 aloud.
4. **L499:** "a false formula whose countermodels are all infinite": the formula is not valid, not false.
   **Fixed.**
5. **L643–649 and Exercise 3.4 (L1424–1427):** Nitpick's countermodels use two types, 'a and 'b, for
   formulas about one domain, and a two-type countermodel is not in general a one-domain countermodel.
   **Added** in both places how to read these two as one-domain countermodels (b₁ as a₁, b₂ as a₂).
6. **L1144–1147: Gödel's completeness theorem** read as if Gödel had proved it for natural deduction,
   which dates from 1934. **Fixed:** "proved this for one such system" (Module 6 says the same).
7. **L1156–1159: undecidability.** Added that validity stays undecidable with a single two-place
   predicate symbol, which the later remark on the decidable one-place fragment relies on.
8. **L1181–1185, Figure 3.3:** the caption said that proof search "finds one in the end", and the figure
   lists `simp`, `blast` and Sledgehammer, which search only up to a bound. **Caption now** says "in
   principle" and that Isabelle's tools can give up in practice. The SVG is unchanged.
9. **L357, widget caption:** "there is only one way" (many structures work; only P is forced).
   **Fixed:** "only one way to choose P".
10. **Front matter: `minutes: 210` → 240.** The page has about 12,900 words and nine exercises, three of
    them ★★★; Module 5, of similar size, has 240.
11. **Model-explorer widget.** It printed `¬ x = y` where Isabelle (and the page) shows `x ≠ y`, and
    dropped the parentheses of ⟶ inside ⟷; `∃!x. P x`, which the page introduces, gave "A variable must
    follow ∃"; a formula with ten quantified variables took 4^10 evaluations over four elements (seconds
    of a frozen page; more variables, indefinitely). **Fixed:** Isabelle-style printing with the
    parentheses the series advises; a message for `∃!` that gives the formula to write instead; at most
    eight quantified variables, with a message; `<-->` in the ASCII list. Three checks added to the test
    (29 pass).

Checked and left as they are: "Structures are also called models" (common usage, and 𝓜 ⊨ φ is read as
"𝓜 is a model of φ"); Isabelle's ∀ over a type standing for "every domain" (true for first-order
formulas, since HOL types are arbitrary non-empty sets); the widget's starting structure differs from
𝓜₁ on purpose (the caption's first task would otherwise be solved already).

## Left open

- The page has about 12,900 words, above the 7,000–10,000 of the brief; I did not cut it.
- There is no Chinese page yet; the translator needs the changes above.

## Problems in other modules and shared files

- Module 5 L378 writes "In the logical notation of Modules 2 and 3: P(0) ∧ (∀n. P(n) ⟶ P(n+1)) ⟶ …", but
  Module 3 (L80–83) fixes Isabelle's notation P 0, P n for the series.
- `src/widgets/_core.js`: see the Module 2 review (`Logic.show` and mixed ⟶/⟷, `¬ x = y`).
- Modules 2 and 3 agree with each other and with Module 1 on terms (valuation and structure, model,
  counterexample and countermodel, valid, satisfiable, ⊨, ≡) and notation (Isabelle's priorities, scope
  as far right as possible); every reference from Module 3 to Modules 1, 2, 6, 7, 8 and 9 holds.
