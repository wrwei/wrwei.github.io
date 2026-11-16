# Review of Module 8: Functional programming in HOL

Reviewer's log, 16 November 2026. Files: `src/en/module_08.md`, `src/figures/_gen/figs_08.py`. Line
numbers refer to the page as it was before the review.

## What was checked

- Types, terms, `typ`/`term`/`value`, type inference, the type errors and their reading; λ, β-reduction,
  currying and partial application (Figure 8.1); datatypes and pattern matching (the four facts of
  Definition 8.5), `cases`, recursive datatypes (Figure 8.2), options, pairs, `case`; `definition`
  versus `fun`/`primrec` and when `simp` unfolds what; missing and overlapping patterns; the list
  library, the hand evaluation of `trace`, Figure 8.3; truncated subtraction, `div`/`mod` on `int`,
  division by zero; type classes, sorts, and the reading of Module 1's wellsortedness message (the
  promise of Module 1 is kept); termination; `export_code`. All exercises and the quiz worked by hand.
- Isabelle facts, by sources, manuals or scratch runs (out/scratch/rev48*): jEdit shows free
  variables in blue (`free_color` 0000FF); `<-` is ASCII syntax for `←` in comprehensions; List.thy
  has about a hundred definitions (106) and more than a thousand lemmas (~1300); `hd []` and an
  out-of-range `!` raise `Match` under `value`; `primrec` warns `No equation for constructor "Empty"`;
  a misspelt type gives `Undefined type name: "lights"`; `export_code` of `all_small` fails with the
  `enum` wellsortedness error; the `F` matrix entry for `forever`; `fun`'s pattern completion
  (`src/HOL/Tools/Function/fun.ML`: the catch-all `= undefined` equation is used in the construction
  but not exported in `f.simps`); `size` of datatype values (counts only constructors with a
  recursive argument: `size (A 5) = 0` for `datatype t = A nat | B t`); `merge`, `count_up`,
  `sum_from` with `function`/`termination` before adding them; the code targets (SML, OCaml,
  Haskell, Scala) and the `isabelle-export:` browser (codegen and jEdit manuals, `active.scala`).
- The Haskell in the `text` block: extracted with `isabelle export` from the module's build
  (`Module_08.Module_08:code/export1/Traffic.hs`); it matches the current definitions line for line.
- Screenshots of the whole page at 1280 px.

## Issues found and what was done

| Line | Issue | Action |
|---|---|---|
| 6 | `needs:` style. | "Modules 1–7" (coordinator's request). |
| 12 | Goal did not cover the new `function`/`termination` material. | Extended. |
| 655, 1809 | The safety rule said "shows red"; `RedAmber` shows red too, but the rule is `= Red`. | The rule now says "in the state `Red` (red alone)"; the exercise solution matches. |
| 818 | "completes it with the equation `top_value Empty = undefined`" invites `by simp`, which fails: the equation is not in `top_value.simps`. | Said so. |
| 1094 | `(l, duration l)` called a "pattern"; it is the expression. | Fixed; named the generator. |
| 1114 | "A numeral such as 3 is another way of writing `Suc (Suc (Suc 0))`" contradicts the pitfall that `simp` does not match `2` against `Suc`. | "denotes the same number", with a pointer to the pitfall. |
| 1329–1530 | Section 8.7 repeated Module 5 §5.7 (the `bad` argument, the `fun bad` error and its reading, measures) without acknowledging it (coordinator). The 0 = 1 argument jumped from "0 = 1" to "every statement follows, as Module 6 showed": it needs `0 ≠ 1` as a theorem and then explosion (Module 2) / (⊥E) (Module 6). | Rewritten to build on Module 5: a numbered, step-by-step recap of the argument with the missing step; a key idea connecting `definition` (safe, non-circular) with how `fun` is built (definitional construction, functions manual §1); why missing patterns are only warned about. The `fun bad` block is no longer repeated. Kept and extended what is new: the four parts of the failure message, all four matrix entries (`<`, `<=`, `?`, `F`), the subgoal labels, the rule for when a lexicographic order exists, the Collatz message read in detail (now acknowledging Module 5's note), `wait`, and a new worked `function`/`termination` example for Module 5's `sum_from`, which keeps Module 5's promise that Module 8 returns to such definitions. |
| 1397–1402 | Definition "Measure and size": the size of a datatype value was "the number of constructors in it that take arguments", false (`size (A 5) = 0`); the measure itself was already defined in Module 5. | Now Definition 8.9 "Size", stated correctly with examples. |
| 1466 | Collatz: "Nobody can supply a termination proof" overstates; title "nobody can prove". | "nobody has proved"; "no other measure is known". |
| 1502–1503 | `wait`: "the size of every light is 0, so the subgoal … is false, and the matrix entry is `?`" — with sizes all 0 the `<=` goal is true; the text did not explain why the entry is not `<=`. | Explained (Isabelle would need a case split). |
| 1557, 1559–1599 | The Haskell excerpt dropped the `module … where {` line but kept the closing `}`; "the beginning … a list of import declarations" omitted the compiler pragma. | The block now starts at the `module` line (taken from `isabelle export`), and the prose says exactly what is left out and where the file is (`export1`). |
| 1780 | "the library's choice that makes `mod` total": `mod` is total anyway; the choice is the value. | Reworded. |
| 1858 | "step case" | "induction step" (series terminology, coordinator). |
| 1966–2025 | Exercise 8.8 duplicated Module 5's Exercise 5.8 (same title, `count_down` ≈ `nbits`, Ackermann with `ack 2 3` and the 19,729 digits from §5.7, a harmless non-terminating equation). | Replaced by "Termination in Isabelle's words": `merge` (a new two-measure lexicographic order to predict and explain), `forever` (the `F` entry; not contradictory, now with the real message), and Module 5's `count_up` defined with `function` and an explicit measure. |
| 2062 | Quiz: "can contradict each other" (it is one equation). | "can be contradictory". |

All Isabelle changes rechecked: `python3 -I tools/isa.py --module 08` reports 74 blocks, 75 output
blocks, all outputs match. `node tools/check.mjs --lang en`: no errors or warnings for this page (the
one error it reports is `en/cheatsheet.md` linking to a glossary page that does not exist yet).

## Facts the page states, for notes/FACTS.md

- Isabelle/jEdit shows free variables in blue and bound ones in green: `src/Tools/jEdit/etc/options`,
  `free_color = "0000FFFF"`, `bound_color = "008000FF"`.
- In the message "See theory exports" the words *theory exports* are an active link that opens
  `isabelle-export:<theory>` in the File Browser: `src/Pure/Build/export.ML` (`message`),
  `src/Tools/jEdit/src/active.scala` (`THEORY_EXPORTS`); jedit.pdf §2.4.2.
- `export_code` writes `code/export1`, `export2`, … unless `file_prefix` is given; for Haskell the
  prefix is a folder with one `.hs` file per module (codegen.pdf §1).
- `fun` completes missing patterns with `= undefined` but does not add those equations to `f.simps`
  (`src/HOL/Tools/Function/fun.ML`, `add_catchall`, `restore_spec`).
- The function package is a definitional extension: recursive definitions are reduced to
  non-recursive ones and the equations are derived (functions.pdf §1).

## Problems seen elsewhere

- `tools/isa.py --update` captured a spurious `*** exception Interrupt_Breakdown raised` into the
  output of the `wait` probe while other builds were running; a rerun produced the real message. Under
  load an `--update` can write an interrupt into a page and the next check then reports a difference.
  Worth a filter or a retry in `isa.py`, and a grep for `Interrupt_Breakdown` before publishing.
- Module 1, line 435 ("Module 8 explains why termination matters"): Module 5 now explains it first and
  Module 8 recaps and deepens it; "Modules 5 and 8" would be more accurate. Optional.
- Module 12 (line 1298 today): "your `fun` and `definition` commands, which are theorems (Module 8)":
  it is their equations that are theorems.
