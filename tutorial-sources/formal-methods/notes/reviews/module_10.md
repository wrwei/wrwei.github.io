# Review of Module 10, Structured proofs in Isar

## Follow-up content audit, 17 November 2026

Read every proof, calculation, error example, exercise solution and quiz. The examples are
consistent; corrections concern their surrounding claims. Line numbers refer to the source at the
start of this follow-up.

- **L244–247, 283–285:** `next` separates case contexts in the displayed pattern. Generalising a fixed
  variable does not discard assumptions: `P x` proved under `A x` exports as `⋀x. A x ⟹ P x`, not an
  unconditional universal fact.
- **L506–508:** automation does not give chained facts the positional roles used by `rule conjI`,
  but their order can still affect search and simplification. Removed the blanket promise that fact
  order makes no difference to `blast`, `simp` and `auto`.
- **L523–552 and summary:** ordinary methods do not automatically consume every local fact, but can
  use subgoal premises and configured context rules. A local fact registered with `[simp]` need not
  be separately passed with `using`.
- **L637–645, 673–675 and summary:** single-dot proofs directly use matching chained facts; they do
  not automatically weaken `<` to `≤`. Scoped the “strictest relation” claim to numeric chains.
  Described the introduced forms as core Isar rather than an exhaustive description of the language.

Primary references: [Isar reference, Proof](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Proof.html)
(local contexts, export, `this`, and calculations) and
[Generic tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Generic.html)
(chained facts and context rules).

Validation: all 75 Isabelle blocks, 31 captured-output blocks, the proof tree and existing IDs are
unchanged. English checker: no errors or warnings. English HTML and root MkDocs builds passed.
Inspected the whole page at 1280 and 390 px with solutions expanded: no page overflow, broken images,
KaTeX errors, missing local anchors or browser errors. Isabelle is unavailable on this Mac, so the
earlier successful prover run was not repeated. Chinese synchronisation remains deferred.

## Original review, 16 November 2026

Reviewed 16 November 2026 against Isabelle2026. Line numbers are those of `src/en/module_10.md` before
the review's edits. Claims about Isabelle were checked in the sources, the manuals (`isar-ref`, `jedit`,
`prog-prove`) or scratch builds (`out/scratch/rev1011`, `out/scratch/rev1011b`).

## Issues found and fixed

| Line | Issue | Kind | Fix |
|---|---|---|---|
| 830–848, 863, 872 | `case (Cons y ys)` in `proof (cases xs)` for a lemma that already has a variable `ys`: the new `ys` hides the lemma's `ys`, yet the state prints both as `ys` (checked with `term`), so the reader sees `this: xs = y # ys` next to a goal whose `ys` is a different variable. | correctness, teaching | Renamed to `case (Cons z zs)` in the example and in the pitfall; added a sentence that warns about reusing a name of the lemma. Outputs regenerated. |
| 1012–1017 | Definition 10.5 said that `case` sets `?case` in a proof by `cases` as well. It does not: `term ?case` there gives "Unbound schematic variable: ?case", and `print_cases` shows `?case = ?P`. | correctness | `?case` now only for induction; a proof by `cases` proves `?thesis` in every case. |
| 376–378 | "`proof` fails when … the goal is `False` or an equation": false for equations of sets (`equalityI`) and functions (`ext`), checked. | correctness | "an equation between numbers" (checked: `proof` fails on `x + 0 = x`). |
| 585–587 | "`moreover` adds the next fact": `moreover` stores the current fact, `ultimately` adds the last one. | correctness | Reworded. |
| 539–543 | "A proof method sees only the goal and the facts passed to it": a beginner may conclude that `simp` does not use the library or `clamp`'s equation. | teaching | Added "besides the rules it always uses (for `simp`, the simp rules …)". |
| 179–181 | Nowhere said that an `assume` must match a premise of the goal (only hinted at in the error table), the most common beginner error with `show`. | teaching | One sentence after the first proof block; checked that `assume "A ∧ B"` for the goal `A ⟹ A ∨ B` makes `show` fail with "Failed to refine any pending goal". |
| 661 | `fixes` used for the first time in the series without explanation. | teaching | Explained in Example 10.1. |
| 770–771 | After `case True` the state still shows both goals; the text did not say why. | teaching | Explained. |
| 281–285 | Definition "Fixed variable" redefined Module 7's term without relating the two. | consistency | Related to the ⋀-bound variables of Module 7. |
| 933, 969, 982, 1024, 1620, 1655–1656, 1674, 1683, 1749 | "step case"; Module 5 calls it the **induction step**. | consistency | "induction step" throughout. |
| 1181–1182, 1239 | `conjunct1`, `conjunct2` and `spec` called "forward form"; Module 7 names them **destruction rules**. | consistency | Module 7's term. |
| 1332–1333 | "The messages …, all shown in this module": "Undefined fact" is not shown. | correctness (minor) | Reworded. |

## Checked and found right

- The side-by-side translations: Module 6's tree of A ∧ B ⟶ B ∧ A (identical), Module 6's rule names
  and the conditions of (∃E) and (∨E); Module 7's apply script for it (`impI`, `conjE`, `conjI`, two
  `assumption`), `swap_or` with `erule disjE`, the rule names and apply steps of the table, ⟹ and ⋀
  from Module 7; Module 5's example *The sum formula* (four-step chain), its apply script and table
  wording, *Mirroring twice* (three steps), `tree2`/`Tip`/`Node`.
- Isar facts: the name Isar; prog-prove recommends Isar for larger proofs; isar-ref §6.2.4 calls
  `hence`/`thus` "left-over from early history of Isar" and prefers the expanded forms; the jEdit
  warning "Local statement fails to refine any pending goal" (isar-ref, `Pure/Isar/proof.ML`); the exact
  format of "Proof outline with cases" (`Proof_Context.print_cases_proof`, printed at `proof`); back-quote
  completion to `‹›` (jedit manual); `...` as abbreviation of `…` (`etc/symbols`); `proof` followed by
  `show "P t"` on an ∃ goal; `..` for single rule steps; `proof -` as the do-nothing method; modes
  prove/state/chain.
- The three predicted errors of Exercise 10.3 (scratch build: "Failed to refine any pending goal",
  "Failed to apply initial proof method" with `(⋀a. P a ∧ Q a ⟹ thesis) ⟹ thesis`, "Failed to refine
  any pending goal" at the second `show`).
- All worked examples, exercises and quiz answers; cross-references (sections, figures); figures 10.1
  and 10.2 in both languages.

## Not fixed

- The two apply scripts "in the style of Module 7" use `erule mp`, a destruction rule with `erule`,
  which Module 7 never shows (it uses `drule mp` and `erule impE`). It works and the text explains each
  step, so it was left.

## Other modules and shared tools

- Terminology: Module 5 says "induction step"; Modules 8, 9 and especially 13 (16 times, with "initial
  case") say "step case". Modules 10 and 11 now follow Module 5.
- Trees: Modules 5 and 10 use `tree2` with `Tip`/`Node`, Modules 11 and 12 use `btree` with `Lf`/`Nd`
  (Module 11 now says so). AUTHORING.md lists `Node` among names not to reuse, but Module 5 uses it.
