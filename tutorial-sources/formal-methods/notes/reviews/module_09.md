# Review of Module 9, Proof automation

Reviewer's pass, 16 November 2026. Line numbers are those of `src/en/module_09.md` before the review.
Claims that no output block covers were checked in scratch sessions (`out/scratch/rev79/`: theories
`R79_*`) or in the Isabelle2026 sources and manuals.

## Issues found and fixed

| Line | Issue | Fix |
|---|---|---|
| 386–391 | "The simplifier gives up only after 100 nested attempts, the default of `simp_depth_limit`." Isabelle2026 declares the default as 40 (`src/Pure/raw_simplifier.ML`, line 433; `Config.get` prints 40 in a scratch run). The isar-ref table still says 100: the manual is out of date. The rule was also said to "loop", although the simplifier gives up after 18 ms and leaves `n < m` unchanged (scratch). | "useless … gives up only after 40 nested attempts … and then leaves `n < m` as it was". |
| 424–428 | Tip: "`∀x. f x = g (f x)` becomes a rule that rewrites `f x` to a term that contains `f x` again." False: Isabelle turns such an assumption round, and `simp` proves `∀x. f x = g (f x) ⟹ f 0 = f 0 + 0` at once (scratch). | The tip now uses the manuals' example `∀x. f x = g (f (g x))` (isar-ref §9.3.1, tutorial §3.1.5), which does loop (scratch, timed out), says that Isabelle catches the simpler case, and points to the real loop in Section 9.8. |
| 1268–1278 | Sledgehammer example: "`simp`, `auto` and `blast` all fail on this goal, but Sledgehammer finds the library lemma `append_eq_append_conv` … You may not have known that the lemma existed". `blast` fails, but `simp` and `auto` do not fail: they run until the ML stack is exhausted (about 2 minutes in batch, then `Interrupt_Breakdown`). `append_eq_append_conv` is itself a simp rule: a captured trace shows the simplifier turn `es @ fs = fs @ es` into `es = fs ∧ fs = es` and then rewrite `es` to `fs` and back without end. | Paragraph rewritten with the true account; the closing sentence now says Sledgehammer used the lemma as a fact rather than as a rewrite rule. The checked `metis` proof is unchanged. |
| 723–726 | "`blast` is a complete method … given unlimited time": its search is bounded (depth 20), so time does not help. | "In principle … if its search had no limit …", as *Programming and Proving* §3.3 says, with a pointer to the bound in Section 6.9. |
| 37, 845, 850–852, 1400–1401 | `linarith` was described as deciding linear arithmetic on `nat`, `int` and `real` (table: "decide questions of arithmetic"; summary: "`linarith` decides linear arithmetic"), while the page's own example shows it cannot prove `2 * x ≠ 2 * y + 1` on `int`. | Table: "prove facts of linear arithmetic"; text: for `nat` and `int`, `linarith` is not a decision procedure; summary rewritten (`presburger` decides linear arithmetic on whole numbers). |
| 899–910 | Fact box: made precise (undecidable "not even for single equations"; Tarski's result stated for formulas with addition and multiplication); the step from Matiyasevich's theorem to "no complete method" was missing. Over-long line. | Added one sentence: a goal such as `x ≤ y ⟹ x * x ≤ y * y` is true exactly when its opposite has no solution, so a complete method would answer questions no algorithm can. |
| 640 | The simp trace (a `text` block) was not labelled as coming from outside the checked build. | Label added. The trace itself is exactly what Isabelle2026 prints: captured line for line in a scratch run (tracing redirected in ML), including `simp_thms(6)` and `simp_thms(30)`. |
| 283 | Table: `simp only: a b` uses "only `a` and `b`, plus the assumptions". The simplifier's solvers stay (reflexivity, linear arithmetic), as isar-ref warns. | One sentence after the table. |
| 511–515 | `?f1.0` in `thm option.split` (its first appearance in Modules 7 and 9) was unexplained (also raised by the Module 12 review). | One sentence, checked against isar-ref §3.2 and `Term.string_of_vname`: an unknown is a name plus an index, and when the name ends in a digit the index follows a dot, so `?f1.0` is the variable named `f1` with index 0. (Calling it "`?f1`" would mislead: `?f1` is read as name `f`, index 1.) It refers back to Module 7's `?P5`. |
| 825–828 | Modules 4, 11 and 12 write `auto simp: …`, and Module 4 says Module 9 explains it, but Module 9 only showed `simp add:`. | Mentions `simp:` as the short form; names the rule kinds for `intro:`, `elim:`, `dest:` (coordinator's note). |
| 677, 681–686 | The classical reasoner and safe rules were introduced as new; Module 7 introduced the classical reasoner and Module 6 safe steps. | Linked to Module 7 and Section 6.7. |
| 1032–1034 | Nitpick's origin not stated (coordinator's note). | "Quickcheck (Module 1) and Nitpick (Modules 2 and 3)". |
| 465, 1355, 1497, 1535 | "step case" (coordinator's note: the series says "induction step"). | Changed. |
| 1254–1256 | "Each '… found a proof...' … is followed by its suggestion": in the run shown, some suggestions come several lines later. | Reworded. |
| 1462–1479 | Exercise 9.2, solution: headed "Inner parts first", but it resolved the `if` before rewriting the `revoke u []` inside its branch. | Steps reordered so that they really go inside out (which is also what `simp only:` does, since `only:` drops congruence rules); a note says other orders reach the same result. |

## Checked and correct (no change)

- Every output block (`isa.py`); the `varies` blocks (Nitpick on roles, Sledgehammer) agree with the
  prose that describes them.
- `simp_trace_depth_limit` default 1 (`raw_simplifier.ML` line 434); the tracing pause message and the
  1000-message limit (`src/Pure/System/isabelle_process.ML`, option `editor_tracing_messages`).
- "strictly bottom up, except for congruence rules" (isar-ref §9.3), so "inner parts first" is right.
- `arith` tries linear arithmetic, then Presburger (`src/HOL/Tools/arith_data.ML`: tactics run in the
  order registered) and proves all three goals of Section 9.5 (scratch). `simp` proves the quota goal
  (scratch). `auto` fails on `x * x ≤ y * y`; `linarith` fails on `n mod 4 = 1 ⟹ n mod 2 = 1`
  (Exercise 9.1); `blast` fails and `force` succeeds on the `ys @ ys` goal (scratch).
- Exercise 9.3: the three messages the solution names are the ones Isabelle gives (scratch).
- Main has more than 20,000 facts (`find_theorems` with no criteria: 23,848, scratch). A free variable in
  a pattern finds nothing: `find_theorems "rev (rev xs)"` says "found nothing" (scratch).
- jEdit panels: Query panel tab "Find Theorems", label "Find:", button "Apply"; Sledgehammer panel
  "Provers:", "Apply", "Cancel" (`src/Tools/jEdit/src/query_dockable.scala`,
  `sledgehammer_dockable.scala`).
- Sledgehammer: up to about 1000 facts, default timeout 30 s, `metis` and `auto` among the possible
  "provers", proofs reconstructed and checked by the kernel (sledgehammer manual §1, §4.2, §7.1).
- Quickcheck options `random`, `exhaustive`, `size`, `timeout`, `expect` (isar-ref §12.1); Nitpick
  `card` default 1–10, "genuine" and "potentially spurious" (nitpick manual).
- Undecidability: Presburger 1929; Matiyasevich 1970 completing Davis, Putnam and Robinson; Tarski for the
  reals.
- All exercises and quiz answers; rendering at 1280 px (46 screens) and 375 px (no horizontal
  overflow); the three figures in English and Chinese.

## Facts for `notes/FACTS.md`

| Fact | Source |
|---|---|
| `simp_depth_limit` defaults to 40 (the isar-ref table says 100, wrongly) | `src/Pure/raw_simplifier.ML` line 433; `Config.get` in a run |
| `simp_trace_depth_limit` defaults to 1 | `raw_simplifier.ML` line 434; isar-ref §9.3.4 |
| jEdit pauses after 1000 tracing messages per command: "Tracing paused. Stop, or continue with next 100, 1000, 10000 messages?" | `src/Pure/System/isabelle_process.ML`; option `editor_tracing_messages` in `etc/options` |
| Query panel: tab Find Theorems, field Find:, button Apply; Sledgehammer panel: Provers:, Apply, Cancel, Locate | `src/Tools/jEdit/src/query_dockable.scala`, `sledgehammer_dockable.scala` |
| Sledgehammer: default timeout 30 s; up to about 1000 facts depending on the prover; proof methods such as `metis` and `auto` can act as provers | sledgehammer manual §1, §4.2, §7.1 |
| `arith` runs linear arithmetic first, then Presburger arithmetic | `src/HOL/Tools/arith_data.ML` |

## Problems outside this module (for the coordinator)

- isar-ref (Isabelle2026) gives 100 as the default of `simp_depth_limit`; the code says 40.
- Module 14, line 365: "`find_consts` (Module 9) searches by name or by type"; Module 9 shows the search
  by type only (`find_consts` does accept `name:`).
