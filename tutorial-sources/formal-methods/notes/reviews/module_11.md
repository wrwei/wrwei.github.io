# Review of Module 11, Induction in depth

## Follow-up content audit, 17 November 2026

Read every definition, worked proof, exercise solution and quiz, and checked the three figure
sources against their examples. Line numbers refer to the source at the start of this follow-up.

- **L40–43, 78:** scoped the description of recursion to these HOL functions; accumulator updates
  need not strictly increase the value.
- **L148–151, 444–447, 517–526, summary and quiz:** generalising changed arguments is a useful
  induction strategy, not a universal necessity. A failed method may need a lemma or better
  automation. Explained why `arbitrary:` alone does not supply `val_inc`, without claiming that
  all alternative proofs or Sledgehammer uses are impossible.
- **L717–723:** length preservation does not establish element preservation. Distinguished the
  length theorem, the following set theorem and Exercise 11.2's occurrence-count theorem.
- **L811–822, 863–874:** scoped computation induction to the single-function forms shown and
  finite-derivation claims to the finitely branching inductive rules introduced here.
- **L1141–1175:** a logical function need not have executable code; an inductive declaration does
  not supply code equations by default. Cyclic finite graphs still have terminating reachability
  algorithms. Monotonicity is the actual requirement for an inductive definition; the displayed
  direct negative dependency fails it, rather than every occurrence beneath a negation being banned.
- **L1268–1287, 1342–1346:** scoped premise selection to the displayed induction invocation and
  explained explicitly passing the intended fact. Constants and compound terms need their constraints
  preserved in these induction patterns; they are not universally forbidden.
- **L1724–1727:** the naive flattening function can take quadratic list-processing time on left-skewed
  trees because append copies its left operand; tree size alone does not imply quadratic behaviour.

Primary references: [Isar reference, HOL-specific tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/HOL_Specific.html)
(inductive definitions and induction), [functions manual](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Functions/Functions.html)
(induction rules and pattern preprocessing), and [code generation foundations](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Codegen/Foundations.html)
(code equations). The negative rule has no least closed predicate: the odd and even naturals each
satisfy it, while their empty intersection does not.

Validation: all 99 Isabelle blocks, 47 captured-output blocks, the proof tree, two raw-text blocks
and existing IDs are unchanged. English checker: no errors or warnings. English HTML and root
MkDocs builds passed. Inspected the whole page at 1280 and 390 px with solutions expanded: no page
overflow, broken images, KaTeX errors, missing local anchors, SVG text outside its view box or browser
errors. Isabelle is unavailable on this Mac, so the earlier successful prover run was not repeated.
Chinese synchronisation remains deferred. No figure, widget or shared-tool changes were needed.

## Original review, 16 November 2026

Reviewed 16 November 2026 against Isabelle2026. Line numbers are those of `src/en/module_11.md` before
the review's edits. Claims about Isabelle were checked in the sources, the manuals (`isar-ref`) or
scratch builds (`out/scratch/rev1011`).

## Issues found and fixed

| Line | Issue | Kind | Fix |
|---|---|---|---|
| 1177 | The output of the failing `inductive odd'` is not reproducible: the monotonicity proof is forked (`Goal.prove_future` in `inductive.ML`), so the error lands at different places among the "Proving …" messages. One `isa.py` run matched, the next reported "output differs". | correctness (build) | Output block marked `varies` (labelled "one run; yours may differ"); the text says why the order can differ. |
| 1734 | Exercise 11.4: "Both recursive calls pass a different accumulator"; `flat r acc` passes it unchanged (the solution's last sentence says so). | correctness | Only the call on `l` changes it, to `x # flat r acc`. |
| 1342–1345 | Pitfall: "Module 13 meets the same situation: the reachable states … start from one fixed initial state". Module 13 builds the initial state into `lreach` and meets the problem with the pair pattern `lreach (d, m)`. | cross-reference | Rephrased to what Module 13 does. |
| 167–168 | "In the words of Module 5, the claim is a **loop invariant**": Module 5 defines *invariant* (a property of states, initially true and preserved); the lemma is not such a property. | consistency, precision | Names the invariant property "`acc + sum_list xs` is the final total". |
| 70–71 | Tail recursion runs "without a call stack". | correctness (minor) | "without growing the call stack". |
| 1362–1363 | "A parser does not search for derivations": parsers build derivations. | correctness (minor) | "A program that checks brackets …". |
| 27–28, 88, 126, 140 | "step case"; Module 5 calls it the **induction step**. Line 126 read ⋀ as "for all", Modules 5 and 7 as "for arbitrary". | consistency | Module 5's term and reading. |
| 527–530 | The tree type switches from Module 5's `Tip`/`Node` to `Lf`/`Nd` without saying so. | teaching | Says which constructor is which. |
| 762 | "Read it from the inside" (`merge.induct`). | clarity | "Read it from its conclusion". |
| 820–822 | Proof outline described as a message "which you can copy"; Module 10 describes the same outline (click to insert). | consistency | Refers to Module 10. |
| 1447 | `corollary`, first use in the series, unexplained. | teaching | One sentence. |
| 1518 | `have "h < n" and "0 < h"`: two claims in one `have`, not taught in Module 10. | teaching | One sentence. |
| 1657 | Exercise 11.2 uses the library's `count_list`, never introduced. | teaching | Explained in the task. |
| 1889 | Exercise 11.8: "in cartouches", a term the series never defines. | consistency | Refers to Module 10's `‹…›`. |
| Figure 11.3 | On the third row the label `bal_wrap` of the left branch ran into the bar of the right branch (both languages). | rendering | Branches moved apart in `figs_11.py` (`lx, rx = 110, 320`); regenerated and checked. |

## Checked and found right

- Every induction proof and its prose: the stuck goals and their reading, `arbitrary:` and the failure
  without it, strengthening (`oddsum`), the auxiliary-lemma recipe (`val_inc`), trees (`Nd.IH(1)`,
  `Nd.IH(2)`), `fib.induct` and `merge.induct` (case names `1`–`3`, `"3.IH"`, `v`/`va`), rule induction
  (`ev.induct`, `.IH`, `.hyps`, `.prems`, the hidden rule name `ev_SS`), `inductive_cases`, `cases` on
  impossible cases, `steps` and `steps_trans`, constants in the inductive premise, `bal`/`chk`,
  `less_induct` and `less.IH`, all exercise solutions and quiz answers.
- Scratch builds: `inductive` prints "Proofs for inductive predicate(s)" and "Proving monotonicity …"
  for a correct definition too; without `(n::nat)` the goal shows `(2::'a)`; `3.IH` without quotes ends in
  "Bad context for command "qed""; `induction ys xs rule: merge.induct` fails with meaningless goals;
  `less.IH` passed to `simp` fails on `2 ^ Suc k` (rewritten to `2 * 2 ^ k`).
- Library and manuals: `rtrancl` is an `inductive_set` in `Transitive_Closure.thy` whose second rule adds
  the step at the end; `less_induct` belongs to class `wellorder`; `nat_less_induct` is stated with ∀;
  `evenE`, `numeral_eq_Suc`, `even` as `2 dvd`; isar-ref §6.5: a non-variable instantiation `t` stands
  for `x ≡ t` with a fresh `x` (`induction Done s`).
- Earlier modules: Module 5 (`fib` bound by strengthening, strong = complete induction, the lemma about
  reversing an append, binary trees), Module 7 (fixed free variables, ⋀ read as "arbitrary"), Module 8
  (`f.induct` announced), Module 9 (`elim:`, `[simp]`, `find_theorems`, Sledgehammer).
- Module 13 agrees with this module: `steps` puts the step at the front, `lreach` at the end; "smallest
  predicate closed under its rules"; `.cases` as rule inversion; `value` fails on inductive predicates.
  Modules 12 and 14 cite this module correctly (recipe, tip on `arbitrary:`, inventor's paradox).
- The table for choosing an induction matches the sections.

## Other modules and shared tools

- Module 13 uses "step case" and "initial case" for its invariant proofs, Module 5 "induction step".
- Modules 5 and 10 name trees `tree2` with `Tip`/`Node`; Modules 11 and 12 `btree` with `Lf`/`Nd`.
- `tools/isa.py`: once, with other builds queued, the main session `Module_11` left an almost empty log
  (`Module_11.gz`, 20 bytes) and `isa.py` reported "Isabelle printed nothing for this block" for 39
  blocks instead of retrying, as it does for probes; the next run was clean. A retry for incomplete
  main-session logs would avoid false alarms.
- Other inductive definitions that fail (any module) will show the same unstable message order as
  `odd'`; they need `output varies`.
