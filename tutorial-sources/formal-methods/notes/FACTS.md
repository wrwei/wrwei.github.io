# Facts about Isabelle2026 used in the series

Every fact about Isabelle that the pages state is listed here with its source. Sources are the
Isabelle web site (read 16 November 2026), the Isabelle2026 Linux bundle (`Isabelle2026_linux.tar.gz`,
ISABELLE_ID `096842708b28`) and its manuals in `doc/`, and screenshots of Isabelle2026/jEdit running
on Linux in this project (scratchpad, `jedit/`). Outputs of Isabelle are not listed here: they are
produced and compared by `tools/isa.py` when the prover checks are run. The HTML site builder does not
rerun Isabelle.

## Clarifications checked during the 17 November 2026 audit

| Fact | Primary source |
|---|---|
| The inference kernel works relative to a theory containing declarations and axioms. Oracles introduce additional trusted results; they are not ordinary derived proofs. | [Isabelle2026 implementation manual, Logic](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Implementation/Logic.html), primitive derivations and `Thm.add_oracle`. |
| `fun` includes proof obligations for pattern completeness and compatibility as well as termination. Its default termination method searches lexicographic combinations of size measures; failure need not mean that the function diverges. | [Isabelle2026 functions manual](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Functions/Functions.html), “From `fun` to `function`” and “Termination”. |
| `rtrancl` includes `(a, a)` for every value of the element type, even outside a finite carrier drawn in an example. A carrier-restricted closure is obtained by intersecting with `A × A`. | `Transitive_Closure.thy`, constructor `rtrancl_refl`; [Isabelle2026 library](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL/Transitive_Closure.html). |
| A bounded Nitpick search is not a validity proof; some HOL encodings use approximations and distinguish genuine from potentially spurious counterexamples. Fixing a cardinality does not specify a unique countermodel. | [Nitpick manual](https://isabelle.in.tum.de/doc/nitpick.pdf), counterexamples, scopes and infinite-type approximation. |
| `rule` is not restricted to introduction rules: it resolves a theorem's conclusion against the goal. Resolution and unification respect types and parameter dependencies. | [Isabelle2026 Isar reference, Proof](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Proof.html), basic methods; [Generic tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Generic.html), classical rule methods. |
| HOL choice can select a witness satisfying `P` when one exists: `someI_ex` derives `P (SOME x. P x)` from `∃x. P x`. A blocked direct unification is not a general impossibility proof. | [Isabelle2026 `Hilbert_Choice`](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL/Hilbert_Choice.html), `someI_ex`. |
| `definition` does not register its defining equation with `simp` by default; `[simp]`, `declare` and method modifiers can change the rule set. `simp only:` retains implicit solvers. Congruence rules control recursive descent. | [Isabelle2026 Isar reference, Generic tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Generic.html), simplification. |
| `clarsimp` combines non-branching clarification with simplification; configured simplifier splitters can still split its subgoal. | Same reference, “Partially automated methods”. |
| Generated code uses equational theorems and provides partial correctness under its translation/runtime assumptions. A total logical function need not have executable code equations; different proved code equations can make an otherwise non-executable definition executable. | [Isabelle2026 code generation manual, Introduction](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Codegen/Introduction.html) and [Foundations](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Codegen/Foundations.html), “Understanding code equations”. |
| Datatypes have generated size equations, with special behaviour for nested recursion and some nonrecursive constructors. The stack/light examples do not justify a universal constructor-counting formula. | [Isabelle2026 datatype manual](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Datatypes/Datatypes.html), size plugin and old/new datatype differences. |
| Leaving an Isar context generalises fixed variables and discharges its assumptions; the resulting fact remains conditional. Local facts are not all passed automatically to ordinary methods, but configured context rules remain available. | [Isabelle2026 Isar reference, Proof](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Proof.html), local contexts and proof steps. |
| An inductive definition requires a monotone defining operator. For the finitely branching rule forms used here, membership has a finite derivation; an inductive declaration does not supply executable code equations by default. | [Isabelle2026 Isar reference, HOL-specific tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/HOL_Specific.html), inductive definitions and executable predicates. |
| Schematic variables carry a name and an index: `?x21.0` means name `x21`, index 0, while `?x21` means name `x`, index 21. | [Isabelle2026 Isar reference, outer syntax](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/Outer_Syntax.html), lexical matters and indexed variables. |
| `Queue_2Lists` proves amortised bounds in an explicit cost model using potential `length rs`; the bounds are not probabilistic average-case statements. | [Isabelle2026 `Queue_2Lists`](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL-Data_Structures/Queue_2Lists.html), `Φ`, `a_enq` and `a_deq`; [queue interface](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL-Data_Structures/Queue_Spec.html). |
| Nitpick's unqualified `card` option gives default search scopes, subject to type-specific settings, datatype structure and approximations. It does not change the logical cardinality of the crossing record or guarantee reproducible counterexample selection. | [Nitpick manual](https://isabelle.in.tum.de/doc/nitpick.pdf), scope of search and record/datatype encodings; [Isabelle2026 scope implementation](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL/ISABELLE_HOME/src/HOL/Tools/Nitpick/nitpick_scope.ML.html). |

## Release and download

| Fact | Source |
|---|---|
| The current release is **Isabelle2026 (October 2026)**. | isabelle.in.tum.de home page, "Now available: Isabelle2026 (October 2026)", last updated 2026-10-05 |
| Downloads: Linux, Linux (ARM), Windows, macOS (ARM), macOS (Intel). | home page |
| Hardware: small experiments 4 GB memory, 2 CPU cores; medium applications 8 GB, 4 cores; large projects 16–32 GB, 8 cores. | home page, "Hardware requirements" |
| Isabelle is free, under several open-source licences; the main code base is BSD-style. | home page, "Distribution & Support" |
| Support: isabelle-users mailing list, Zulip chat, Stack Overflow. | home page |
| Isabelle was originally developed at the University of Cambridge and Technische Universität München. | home page, "What is Isabelle?" |
| The Archive of Formal Proofs is a large collection of Isabelle developments. | home page |

## Installation (isabelle.in.tum.de/installation.html, last updated 2026-10-06)

| Platform | Steps |
|---|---|
| Linux | Download `Isabelle2026_linux.tar.gz`; `tar -xzf Isabelle2026_linux.tar.gz`; start the IDE with `Isabelle2026/Isabelle2026`; command-line tools with `Isabelle2026/bin/isabelle`. Needs a window manager or desktop that works with Java/AWT/Swing. |
| Windows 10, 11 | `Isabelle2026.exe` is a self-extracting archive; unpack it into any directory. The installer starts Isabelle/jEdit the first time and creates a desktop alias. The application lacks developer signatures, so Microsoft rejects it by default: the first start "requires some careful clicks in the proper spots". Windows Defender may stop external provers (Sledgehammer, `smt`); then exclude the Isabelle directory from Virus & threat protection. `Isabelle2026\Cygwin-Terminal` runs command-line tools. |
| macOS (Apple Silicon 13, 14, 15, 26, 27; Intel 12–15) | Download `Isabelle2026_macos_arm.tar.gz` (or the Intel one); put the application in `/Applications` and start it as usual. It lacks developer signatures, so Apple rejects it by default: open `Isabelle2026.app` and press Cancel in the security dialog; open System Settings, Privacy & Security, where "Allow apps …" lists the blocked application; click Open Anyway and confirm. |
| Docker | `docker pull makarius/isabelle:Isabelle2026` (Ubuntu 22.04, no GUI); ARM: `makarius/isabelle:Isabelle2026_ARM`. |
| LaTeX (optional, for documents only) | TeX Live (Linux), MiKTeX (Windows), MacTeX (macOS). Not needed for this series. |

## What the bundle contains (Linux bundle, `contrib/` and `doc/`)

- Java runtime `jdk-25.0.4`, jEdit `jedit-20260515`, Poly/ML `polyml-5.9.2-6`, Scala `scala-3.3.8-1`.
- Automatic provers used by Sledgehammer, Nitpick and `smt`: `cvc5-1.3.4`, `e-3.2`, `spass-3.8ds-5`,
  `vampire-4.8-2`, `verit-2026.05`, `z3-4.4.0pre-8`, `zipperposition-2.1-2`, `kodkodi-20260628`
  (Nitpick), `minisat-2.2.1-2`.
- Manuals in `doc/`: `prog-prove.pdf` (Programming and Proving in Isabelle/HOL), `isar-ref.pdf`,
  `jedit.pdf`, `main.pdf` (What's in Main), `tutorial.pdf`, `nitpick.pdf`, `sledgehammer.pdf`,
  `functions.pdf`, `datatypes.pdf`, `codegen.pdf`, `locales.pdf`, `classes.pdf` and more. The
  Documentation panel in jEdit lists them under "Isabelle Tutorials" and "Isabelle Reference Manuals".
- Fonts `isabelle_fonts-20241227` (Isabelle DejaVu); the pages use the same font for Isabelle text.

## Isabelle/jEdit, as it appears (screenshots, Isabelle2026 on Linux)

- Menu bar: File, Edit, Search, Markers, Folding, View, Utilities, Plugins, Isabelle, Options, Help.
- Docked panels on first start: left **Documentation** and **File Browser**; right **HyperSearch Results**,
  **Sidekick**, **State**, **Theories**; bottom **Output**, **Query**, **Sledgehammer**, **Symbols**.
  The Theories panel is open on the right; the Output panel is closed until you click its tab.
- Theories panel: **Purge** button, **Continuous checking** (ticked), status **Prover: ready**, the logic
  ("Default (HOL)"), and the open theories, each with a check box.
- Output panel controls: **Proof state** (not ticked by default), **Auto hovering** (ticked), **Auto update**
  (ticked), **Update** button, **Search:** field, zoom (100%).
- The Output panel shows the messages of the command at the cursor. Proof states appear in it only when
  **Proof state** is ticked; otherwise they appear in the separate **State** panel. Ticking it "is a
  globally persistent option: it affects all open panels and future editor sessions." (jedit.pdf §3.2, §3.3)
- A blue **i** in the left gutter marks a line with an information message, for example from
  Auto solve_direct or Auto Quickcheck, which Isabelle/jEdit runs on every new `lemma` statement.
  Seen messages: "Auto solve_direct: the current goal can be solved directly with
  List.rev_rev_ident: rev (rev ?xs) = ?xs" and "Auto Quickcheck found a counterexample:".
  In batch builds (`isa.py`) these automatic tools do not run, so the pages call `quickcheck`,
  `nitpick` or `solve_direct` explicitly when they show such output.
- Status bar: cursor line,column, encoding `UTF-8-Isabelle`, ML heap use.
- Positions inside messages (for example "Failed to finish proof⌂:") are shown as a clickable ⌂; batch
  builds print them as `(line N of "file")`, and `isa.py` writes ⌂ instead, as jEdit shows them.

## Typing symbols (jedit.pdf §2.2, table from `etc/symbols`)

| Symbol | Name with backslash | Abbreviation |
|---|---|---|
| λ | `\lambda` | `%` |
| ⇒ | `\Rightarrow` | `=>` |
| ⟹ | `\Longrightarrow` | `==>` |
| ⋀ | `\And` | `!!` |
| ≡ | `\equiv` | `==` |
| ∀ | `\forall` | `!` |
| ∃ | `\exists` | `?` |
| ⟶ | `\longrightarrow` | `-->` |
| ⟷ | `\longleftrightarrow` | `<-->` (also `<->` and `<>`, but `<->` is also the abbreviation of ↔, which jEdit offers first and HOL rejects) |
| ∧ | `\and` | `&` |
| ∨ | `\or` | `\|` |
| ¬ | `\not` | `~` |
| ≠ | `\noteq` | `~=` |
| ∈ | `\in` | `:` |
| ∉ | `\notin` | `~:` |

Other input methods (same section): the Symbols panel; copy and paste of rendered Unicode text between
applications (so copying a block from the pages into jEdit works); completion of a symbol's name after
a backslash. The pages show Unicode and tell readers to type the abbreviation or `\name` and accept the
completion with Tab (Return does not select by default: `jedit_completion_select_enter = false`,
`jedit_completion_select_tab = true` in `src/Tools/jEdit/etc/options`; jedit.pdf §3.7.4).

## Keyboard actions in jEdit (jedit.pdf §3.2)

`isabelle.tooltip` CS+b, `isabelle.message` CS+m, `isabelle.line-status` CS+l, `isabelle.first-error`
CS+a, `isabelle.last-error` CS+z, `isabelle.next-error` CS+n, `isabelle.prev-error` CS+p
(C = Control, S = Shift; Command instead of Control on macOS).

## Facts the modules rely on

Collected from the module authors' reports (November 2026); each was checked against the source named, or
by a run of Isabelle2026 ("run").

### Automatic tools in Isabelle/jEdit

| Fact | Source |
|---|---|
| By default jEdit runs Auto Quickcheck and Auto solve_direct on every new statement; Auto Nitpick and Auto Sledgehammer are off. The batch build runs none of them. | `src/HOL/Tools/etc/options`; `isabelle options -l` |
| Quickcheck's defaults in HOL are size 5 and 50 iterations; it prints predicates as sets, e.g. `P = {a⇩1}`. | `HOL.thy` (`quickcheck_params`); run |
| Nitpick's defaults: `card` 1–10, timeout 30 s; constants are shown only with `show_consts`; `nitpick [satisfy]` prints "Nitpick found a model". | nitpick manual §5; run |
| Sledgehammer runs cvc5, verit, z3, e, spass, vampire and zipperposition, plus proof methods such as `metis`; timeout 30 s. Its panel has Provers:, Isar proofs, Try methods, Apply, Cancel, Locate. | sledgehammer manual; `sledgehammer_dockable.scala` |
| jEdit pauses after 1000 trace messages ("Tracing paused…"); batch builds drop tracing messages. | `etc/options`, `isabelle_process.ML`; run |
| jEdit shows free variables in blue (`free_color`). | `src/Tools/jEdit/etc/options` |

### Syntax, priorities and input

| Fact | Source |
|---|---|
| Priorities: ¬ 40; ∧ infixr 35; ∨ infixr 30; ⟶ and ⟷ infixr 25; `=` 50; binders 10. ⟷ prints as `=`; `¬ x = y` prints as `x ≠ y`; `¬ (∃x. P x)` as `∄x. P x`. | `HOL.thy` 92–186 |
| Input: ⟦ ⟧ `[|` `|]`; ⦇ ⦈ `(|` `|)`; ∈ `:`; ∉ `~:`; ⊆ `(=`; ∪ `Un`; ∩ `Int`; × `<*>` (ASCII `*`); ∄ `~?`; `⇧*` `^*`; `…` `...`; cartouches ‹› by a back-quote completion. | `etc/symbols`; `Transitive_Closure.thy`; jedit §3.7.1 |
| `typedecl file` is an outer syntax error (`file` is a keyword). | run |
| "Isar" stands for "Intelligible semi-automated reasoning"; `hence`/`thus` still work but are left-overs (prefer `then have`/`then show`). | isar-ref, Preface and §6.2.4 |
| `theorem`, `corollary` and `proposition` mean the same as `lemma`. | isar-ref |

### Proof methods and rules

| Fact | Source |
|---|---|
| `simp` works on subgoal 1 only; `auto` and `simp_all` on all subgoals. | prog-prove §2.5.4 |
| The simplifier's depth limit `simp_depth_limit` is 40 in Isabelle2026 (the isar-ref still says 100). | `src/Pure/raw_simplifier.ML`; Module 9 review |
| `by m₁ m₂` abbreviates `proof m₁ qed m₂`; `by m` also closes leftover subgoals by assumption, `done` only checks that none is left. | isar-ref §6.4.2, §7.1; run |
| `fun` equations and `datatype` distinctness and injectivity facts are simp rules; equations are selected as `f.simps(i)`; overlapping equations are taken in order and split, with new variables named `v va`. | prog-prove §2.3.1, §2.5.1; isar-ref; functions §2.1; run |
| The default simp set has De Morgan's laws but not distributivity, which "might cause exponential blow-up". | `HOL.thy` ~1424 |
| `intro`/`elim` apply the given rules repeatedly to subgoal 1 and its descendants; instantiation `rule_tac x = t in r` or `r[of _ t]`. | isar-ref §9.2.1, §7.3; prog-prove §3.4.1 |
| `blast` is "a separate classical tableau prover" and raises its bound on unsafe steps from 0 to 20; "A safe rule must never reduce a provable goal to an unprovable set of subgoals." | isar-ref §9.4 |
| `arith` is `linarith`, then `presburger`; `smt` replays proofs in the kernel; `sat` uses the internal CDCL solver "cdclite" and replays its proofs. | `arith_data.ML`; `SMT.thy`; `sat.ML` |
| `not_def`: `¬ ?P ≡ ?P ⟶ False`; `ccontr = FalseE [THEN classical]`. | `HOL.thy` |
| Rule induction uses the first premise; `f.induct` cases are numbered and their hypotheses need quotes (`"3.IH"`); `less_induct` has the case name `less` and is the `wellorder` class axiom. | prog-prove §3.5.3, §4.4.3; `Orderings.thy` |
| HOL's types are non-empty, "otherwise the quantifier rules would be unsound"; Isabelle "is designed around natural deduction". | tutorial §8.5, §5.1 |

### Evaluation and code generation

| Fact | Source |
|---|---|
| `value` compiles closed terms with the code generator (and `term_of`) and evaluates terms with variables symbolically (normalisation by evaluation); quantifiers evaluate only over `enum` types ("Type nat not of sort enum"); an inductive predicate has "No code equations". | `value_command.ML`; `Enum.thy`; run |
| `export_code` prints "See theory exports"; the files appear under `isabelle-export:` in jEdit's File Browser, with the default prefix `export` and a number. | `export.ML`; jedit §2.4.2; codegen §1.2 |
| Generated Haskell represents characters as eight Booleans and `int` as `Zero_int | Pos | Neg`; `HOL-Library.Code_Target_Int` and `Code_Target_Nat` switch to the target's integers. | run; library headers |
| `card` of an infinite set is 0; `value` fails on `sym r` but works on `sym_on A r`. | run |

### Library names used

`rev_rev_ident` (List.thy), `Cantors_theorem` (Set.thy), `wf_iff_no_infinite_down_chain` (Hilbert_Choice.thy),
`wf_less` (Wellfounded.thy), `quotient_disj` (Equiv_Relations.thy), `card_Pow` (Power.thy), `pigeonhole`
(Finite_Set.thy), `div_by_0` and `mod_by_0` (Rings.thy), `numeral_eq_Suc` (Num.thy); `rtrancl` is defined with
`inductive_set` (Transitive_Closure.thy).

### Messages quoted on the pages (all from runs)

"Failed to apply proof method", "Failed to apply initial proof method", "Failed to finish proof",
"Undefined fact", "Bad context for command …", "Illegal application of proof command in "prove" mode",
"Local statement fails to refine any pending goal" (a jEdit warning), "Vacuous calculation result",
"Function has no arguments", "Could not find lexicographic termination order", "Bad theory name … for file …",
"Wellsortedness error".
