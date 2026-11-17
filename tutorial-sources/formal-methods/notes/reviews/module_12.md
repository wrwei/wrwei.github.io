# Review of Module 12, Verifying functional programs

## Follow-up content audit, 17 November 2026

Read every definition, computation, proof, exercise solution and quiz, and checked all three figure
sources. Line numbers refer to the source at the start of this follow-up.

- **L37–79, summary and quiz:** a correctness theorem establishes its specified property under its
  stated preconditions and trusted assumptions. It does not validate the specification or establish
  omitted properties. The two specification forms introduced here are not an exhaustive taxonomy.
- **L131–140, 319–325:** import time and session images vary. Quickcheck's bounded search limits
  test values as well as list structure, and automatic background checks are configurable.
- **L640–645:** the search bound counts examined keys; logarithmic height requires balance, which
  this implementation does not maintain. Used `log₂(n + 1)` to cover empty and singleton trees.
- **L681–685:** corrected schematic-variable indexing: `?x21.0` is name `x21`, index 0, whereas
  `?x21` is name `x`, index 21. This now agrees with Module 9.
- **L813–817, 941–957:** added empty-tree initialisation to the discussion and operation preconditions
  to the deterministic abstraction-function refinement pattern.
- **L1059–1065, 1225–1230:** replaced average-case language with amortised bounds in an explicit
  list-cost model. Linear total cost applies along a single history starting at `qempty` and using
  each operation's result next; persistent reuse of older queues can repeat reversal work.
- **L1213–1217, 1280–1291, 1301–1341, summary:** representation invariants hold for finite, defined
  values built through the proved interface. Constructor hiding does not enforce non-emptiness or
  ordering laws. Qualified code-generation guarantees by represented HOL inputs, defined results,
  target adaptations and runtime assumptions; Haskell's partial and infinite values need not represent
  HOL finite-list values. Natural-number representations must exclude negative target integers.

Primary references: [Queue_Spec](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL-Data_Structures/Queue_Spec.html)
(eight interface properties), [Queue_2Lists](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL-Data_Structures/Queue_2Lists.html)
(potential `length rs`, `a_enq`, `a_deq`), [Isar syntax](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Outer_Syntax.html)
(indexed variables), and [code generation manual](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Codegen/Introduction.html)
with its [foundations](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Codegen/Foundations.html).

Validation: all 80 Isabelle blocks, 38 captured-output blocks and existing IDs are unchanged.
English checker: no errors or warnings. English HTML and root MkDocs builds passed. Inspected the
whole page at 1280 and 390 px with solutions expanded: no page overflow, broken images, KaTeX errors,
missing local anchors, SVG text outside its view box or browser errors. Isabelle is unavailable on
this Mac, so the earlier successful prover run was not repeated. Chinese synchronisation remains
deferred. No figure, widget or shared-tool changes were needed.

## Original review, 16 November 2026

Reviewed on 16 November 2026: `src/en/module_12.md` and `src/figures/_gen/figs_12.py`. Line numbers are
those of the page as I found it, before my edits.

## How it was checked

- `python3 -I tools/isa.py --module 12`: all outputs match before and after the review (two Isabelle
  blocks were re-laid out, see 7 and 19; `--update` changed no output).
- Every proof, exercise solution and quiz answer worked through; every stuck goal compared with the prose
  that reads it.
- A scratch session (`out/scratch/m12rev`, the module theory plus experiments) to test claims the page
  makes without showing them: `qinv q ⟹ first q = hd (list_of q)` holds without the non-empty premise
  (`by (cases q) auto`); `sorted (isort_bad xs)` holds, via `set (ins_bad x xs) ⊆ insert x (set xs)`; the
  goal at which `auto` stops in `sorted_inorder` (Exercise 12.8); an unquoted
  `imports Main HOL-Library.Multiset` is read as the three imports `HOL`, `-` and `Library.Multiset`; a
  build that only loads `HOL-Library.Multiset` takes 17 s elapsed on this machine (4 threads).
- The generated code itself, extracted with `isabelle export`: `Verified.hs` lies in `code/export1/`;
  its export list is `Verified(Linorder, Btree, Queue, deq, enq, isin, first, isort, qempty, tempty,
  tinsert)`; classes `Ord`, `Preorder`, `Order`, `Linorder`; `rev` printed as `reverse`; `hd` generated
  from its code equation (no case for `[]`). With `Lf` in the list the header has `Btree(..)`; with
  `open` it has every class and datatype with `(..)` and the auxiliary functions too. The export rule
  read in `src/Tools/Code/code_namespace.ML` (`mark_exports_aux`): named functions public, the datatypes
  and classes they use directly opaque, a named constructor makes its datatype public. Numbering
  `export1`, `export2`, … per theory: `next_export` in `code_target.ML` (reset at each theory begin).
- Library facts against the Isabelle2026 sources: `sorted` is an abbreviation for `sorted_wrt (≤)`
  and its equations are `sorted_simps` (List.thy 409–412); `properties_for_sort` (Multiset.thy 3122);
  `mset_rev` and `size_mset` are `[simp]`; `sorted_append` is not (the solution passes it); Quickcheck's
  finite types are ordered a₁ < a₂ < a₃ (Enum.thy, `linorder` instances); `code_datatype set coset`
  (List.thy 822), `code_datatype mset` (Multiset.thy 4367), `HOL-Library.RBT_Set` (`code_datatype Set
  Coset`); HOL-Data_Structures (`src/HOL/ROOT` 297): `Queue_Spec` has exactly eight assumptions over
  `list` and `invar`, `Queue_2Lists` interprets it and proves amortised bounds (`a_enq`, `a_deq`),
  `Set_Specs` has `delete`, and `Tree_Set`, `AVL_Set`, `RBT_Set` interpret `Set_by_Ordered`.
- Codegen manual: partial correctness (§1.1), "only the last two [steps] are carried out outside the
  logic; by keeping this layer as thin as possible, the amount of code to trust is kept to a minimum"
  (§2.1), default prefix "export" with a consecutive number (§1.2); isar-ref on `open` ("exported
  identifiers are minimized per module. This can be suppressed by prepending open"). jedit manual §3.1.2:
  imports are loaded into the document model and shown in the Theories panel.
- Figures 12.1–12.3 regenerated and looked at in both languages: no overlap or clipping. The page built
  and looked at in 40 screenshots at 1280 px, with solutions and the trouble box opened separately.

## Issues found and what I did

1. **L127–132, the import.** The quotation marks around `"HOL-Library.Multiset"` were unexplained, though
   Module 1 taught quotes as the mark of inner syntax; "takes a little while" did not say what the reader
   sees meanwhile. Now: why the quotes are needed (with what happens without them), "can take up to a
   minute", the Theories panel shows progress, and the reader's own text stays unchecked until then.
2. **L210, `thm sorted_simps`.** Readers learned `f.simps`; `thm sorted.simps` fails because `sorted` is
   an abbreviation. One sentence says so.
3. **L246, Definition 12.2.** The type `'a multiset`, shown in later outputs, was never named. Added.
4. **L480–489, `theorem`.** First use in the series, unexplained. One sentence: like `corollary` (Module
   11) and `proposition`, it means the same as `lemma` (coordinator's request too).
5. **L641.** The datatype is declared again without saying why. Added "Your theory for this module needs
   its own copy of the datatype".
6. **L671–676.** `?x21.0` unexplained. Added: Isabelle adds `.0` to a schematic name ending in a digit
   (`Term.string_of_vname`).
7. **L686, `isin`.** The defining line (86 characters) overflowed its code block at 1280 px and hid
   `else True`. Broken over two lines, as `tinsert` is.
8. **L741–743, Figure 12.2 caption.** "smaller than the key above it" reads like the parent–child
   comparison that Section 12.5 then shows to be the wrong invariant. Now "at every node, … the node's
   key".
9. **L981, `tl`.** No earlier module introduces `tl`, and `deq`'s proof needs `tl [] = []`. Now defined
   where first used, with `tl [] = []` and `hd []` unspecified (Module 8); L1177 says "since
   `tl [] = []`".
10. **L1197, `first_correct`.** "two premises: … not empty, because `hd []` has no specified value"
    suggested the second premise is needed; it is not (checked). Now explained as a choice of the
    specification (as in HOL-Data_Structures' `list_first`) that leaves implementations free on the empty
    queue, with a note that this proof would work without it.
11. **L1211.** "bounds its running time": made exact (on average a constant number of steps per
    operation; the theory proves amortised bounds).
12. **L1248.** "the batch build and the Output panel": readers never see the batch build. Removed.
13. **L1261–1268, export list.** The header also exports the class `Linorder`; added. The rule behind it
    was only implied, and Module 14 §14.7 cites Module 12 for it: now stated (named functions; datatypes
    and classes they use directly, without constructors; constructors only when one is named). The
    explanation of `open` is unchanged.
14. **L1279–1285, guarantee.** "the equations of your `fun` and `definition` commands, which are
    theorems" was ambiguous (Module 8's reviewer read it as the commands). Reworded. Added a concrete
    case of partial correctness: the generated `first` raises an error on an empty queue (`hd` has no
    equation for `[]`).
15. **L1298–1301, "The code around it".** Missing assumption: the theorems about `isort` and the trees
    assume `≤`/`<` form a linear order; after `export_code open`, Haskell code supplies its own
    comparison and nothing checks the `linorder` laws. Added.
16. **L1486–1488, Exercise 12.4.** The task asked for "the size of `mset xs`" without saying the function
    is `size`, which only the solution revealed. The explanation moved into the task.
17. **L1581–1583, Exercise 12.5 solution.** "by an induction like the one for `sorted_ins`": the analogue
    of `set_ins` is false for `ins_bad`. Now names the lemma that works (subset instead of equality).
18. **L1692–1696, Exercise 12.8 solution.** "it has `x < x2` and `x2 < xa`": the stuck goal has the
    bounded quantifiers and memberships, from which these follow. Reworded to match the real goal.
19. **L1680.** The `sorted_inorder` proof line (90 characters) overflowed; broken after `(induction t)`.
20. **L1751, quiz question 4.** The explanation described the mirror image of Quickcheck's counterexample
    ("in the left subtree … larger"); the tree found has a₁ in the right subtree of a₂ although smaller.
    Fixed.
21. Over-long source lines rewrapped (L728, 1050, 1112, 1582).

Verified and left unchanged: the specification/implementation/correctness-theorem framing; insertion sort
on paper; every stuck goal and the lemma read from it; both wrong implementations and their Quickcheck
and Nitpick counterexamples; uniqueness via `properties_for_sort`; the set-based pitfall; the BST
invariant, `bst_local` and its counterexample, the three-case argument for `isin_set_of`; Definition 12.5
and both refinement tables; the queue lemmas and what each needs; seL4's refinement chain (abstract
specification, executable specification, C); the code-generator, compiler, machine and specification
items of the trusted base; all exercises and quiz answers; every "Section/Definition/Figure/Exercise
12.n" reference; front matter (`minutes`, `needs`, goals). Every claim about Modules 1, 3 and 7–11 holds
in their current text, including "the trees are those of Module 11" (`'a btree`, `Lf`, `Nd`) and
"induction step" as the series' term.

## Not fixed

- "Every element is moved from the back to the front at most once" holds when each queue value is used
  once (the usual setting of the amortised bound); left as is.
- "can take up to a minute" is an estimate from the batch build (17 s here); not timed in jEdit.

## Other modules and shared tools

- **Module 12 depends on** (tell me or the coordinator if these change): Module 11's `btree`/`Lf`/`Nd`,
  its stuck-goal recipe (key idea in §11.3), the `corollary` sentence and `cases n rule: fib.cases`;
  Module 10's standard rule of `proof`, named cases, `.IH`/`.prems`; Module 9's `intro:` and
  `find_theorems`; Module 8's `show_sorts`, the Haskell type-class analogy, overlapping patterns,
  `hd []` unspecified, theory exports and `export1`, `Code_Target_Nat`, the partial-correctness note;
  Module 3's `nitpick [card 'a = 2]`; Module 1's sorting formula, Auto Quickcheck's blue **i**, the
  trusted base and seL4.
- Module 14 §14.7 cites Module 12's export explanation; it holds (and is now explicit).
- Modules 9 (L511, `?f1.0`) and 11 (L760, `?a0.0`) print `.0` names without explaining them; a
  one-line note at the first occurrence would help. `tl` is introduced only in Module 12; the cheat
  sheet could list `hd` and `tl`.
- FACTS.md candidates: unquoted `HOL-Library.Multiset` splits into three imports (run); `sorted` is an
  abbreviation, equations `sorted_simps` (List.thy); export prefix `export<n>` per theory under
  `<theory>/code/` (codegen §1.2, `code_target.ML`); default exports minimised, `open` suppresses it
  (isar-ref; `code_namespace.ML`); `rev` printed as Haskell `reverse` (List.thy `code_printing`);
  `code_datatype mset` and `set coset`; the HOL-Data_Structures theories named above.
