# Formal Methods with Isabelle: plan

A tutorial series that starts from the logic and discrete mathematics formal methods rest on, moves to
formal proof, and then teaches Isabelle/HOL in depth, ending with verified programs and a verified
compiler. English and Simplified Chinese, published at `docs/tutorials/formal-methods/`. This file is
the contract for writers, translators and reviewers; the tools in `tools/` enforce what can be checked.

The site already has two related pages, and this series works with both:

- **Mathematical Foundations** (`docs/tutorials/math/`) teaches logic, sets, proof methods and induction
  for computing in general. Part I here covers what formal methods need from those subjects (logic as a
  specification language, semantics, decidability, induction for recursive definitions) and links to
  Mathematical Foundations for more practice.
- **Isabelle for model verification** (`docs/tutorials/isabelle/`), a single-page guide checked with
  Isabelle2025-2, applies Isabelle to a small object model. Module 13 points to it as an applied
  follow-on.

## 1. Readers and what "detailed" means here

Readers can program a little in some language and remember school algebra. They have not studied logic,
discrete mathematics or proof, and have not used a proof assistant. They may be students of computer
science or software engineering, or engineers who want to verify designs. They work alone.

1. **Understanding before tools.** Each idea is explained on paper first, with a worked example, before
   Isabelle checks it. Part I is mostly mathematics; Isabelle appears in "Check it in Isabelle" boxes.
2. **Every Isabelle output is real.** Every proof state, value, counterexample and error message shown
   was produced by Isabelle2026, by `tools/isa.py` (section 7). Readers compare their screen with the
   page, line by line.
3. **Every proof in the series is checked.** All Isabelle text in a module, including the exercise
   solutions, is assembled into theory files and built by Isabelle. Nothing uses `sorry`.
4. **Nothing hand-computed.** Truth tables and natural-deduction trees in the text are produced by the
   build from the formula, so they cannot contain slips.
5. **New words are defined when they first appear**, in a definition box or in the text, and collected
   in the glossary.
6. **Mistakes are part of learning.** Each Isabelle module shows the errors beginners meet, with Isabelle's
   real message and the fix; the troubleshooting page collects them.
7. **Practice.** Every module has exercises at three levels (★ check your understanding, ★★ apply,
   ★★★ stretch), with full solutions, and a short quiz. Isabelle exercise solutions are checked.
8. **Plain voice.** Short sentences, "you", present tense, British spelling. Mathematical notation is
   introduced before it is used and read aloud the first time ("∀x. P x" reads "for all x, P of x").

## 2. Tools

- **Isabelle2026** (October 2026), the current release, on Linux, Windows or macOS: the application
  bundle contains everything (Isabelle/jEdit, the prebuilt HOL image, the automatic provers that
  Sledgehammer and Nitpick use, and the documentation). The series uses the **Isabelle/jEdit** prover
  IDE that starts with the application. Hardware: 4 GB memory and 2 cores for small experiments,
  8 GB and 4 cores recommended (Isabelle's home page).
- Readers type Isabelle symbols (∀, ⟹, λ …) in jEdit with abbreviations such as `\forall` and `==>`, or
  with the Symbols panel. The pages show Unicode; copying a block into jEdit works as is.
- Facts about Isabelle (commands, panels, labels, messages) are checked against the Isabelle2026
  distribution and its sources and documentation; `notes/FACTS.md` lists each with its source.

## 3. The series

Four parts, fourteen modules, about 40 hours of study. Each module takes 2 to 4 hours with its exercises.
Section ids are fixed (the Chinese pages keep them).

### Part I: Foundations

1. **Formal methods: what and why** — why some systems must not fail; what "formal" means
   (language, semantics, proof); specification and verification; the landscape (testing, model
   checking, SAT/SMT, interactive theorem proving); proof assistants, the LCF kernel idea, Isabelle and
   HOL; install Isabelle2026; a first theory (`value`, a first `lemma … by simp`); how the series works.
2. **Propositional logic** — connectives and formation rules; truth tables; tautology, satisfiable,
   contradiction; equivalence laws; logical consequence and valid argument forms; normal forms (NNF,
   CNF, DNF); requirements as propositional constraints; check it in Isabelle (`value`, tautologies by
   `simp`/`blast`, counterexamples with `nitpick`). Widget: truth-table explorer.
3. **Predicate logic** — terms, predicates, quantifiers, free and bound variables; structures and
   truth; quantifier laws; substitution and capture; writing specifications; typed logic as the bridge
   to HOL; decidability. Widget: model explorer.
4. **Sets, relations and functions** — sets and laws; relations and their properties; equivalence
   relations and partitions; orders and well-foundedness; closures and reachability; functions,
   injectivity, surjectivity, inverses; cardinality and Cantor. Widget: relation explorer.
5. **Induction and recursion** — recursive definitions on numbers, lists and trees; mathematical,
   strong and structural induction; termination and well-founded orders; invariants. Widget: evaluation
   stepper.

### Part II: Formal proof

6. **What is a proof? Natural deduction** — informal proof patterns; proof systems, ⊢ and ⊨,
   soundness and completeness; natural deduction for the connectives and quantifiers; classical
   reasoning; forward and backward proof search; equality. Widget: natural-deduction proof builder.
7. **Natural deduction in Isabelle** — meta-logic and object logic; rules as theorems; `rule`,
   `erule`, `drule`, `frule`, `assumption`; unification and schematic variables; quantifier rules and
   fixed variables; classical rules; from proof trees to proof scripts; error messages; `blast`.

### Part III: Isabelle/HOL in practice

8. **Functional programming in HOL** — types and terms, `term`, `typ`, `value`; datatypes; definitions
   with `definition`, `fun`, `primrec`; lists; numbers and type classes; code generation; termination.
9. **Proof automation** — the simplifier (rewriting, simp rules, conditional rules, splitting,
   tracing); `auto`, `blast`, `force`, `fastforce`; arithmetic; `find_theorems`; counterexamples with
   Quickcheck and Nitpick; Sledgehammer; what to do when automation fails.
10. **Structured proofs in Isar** — `proof … qed`, `assume`, `show`, `have`, `fix`, `obtain`; chaining
    facts; calculational reasoning; case analysis; induction with named cases; from apply scripts to Isar.
11. **Induction in depth** — generalising the goal; auxiliary lemmas; computation induction;
    inductive definitions and rule induction; trees; complete induction.

### Part IV: Verification

12. **Verifying functional programs** — specification against implementation; insertion sort
    (sortedness and permutation); binary search trees and invariants; refinement with an abstraction
    function; exporting verified code.
13. **Modelling systems: state machines and invariants** — states and transitions; reachable states as
    an inductive definition; safety invariants and how to strengthen them; counterexample traces;
    refinement between models; where to go next.
14. **Capstone: a verified compiler** — expressions and evaluation; a stack machine; the compiler;
    correctness by generalised induction; a verified optimisation; testing; code export; extensions.

### Reference pages

- **Cheat sheet**: symbols and how to type them, commands, proof methods, rules, keyboard.
- **Troubleshooting**: Isabelle's messages, each with the cause and the fix (real messages).
- **Glossary**: every term, with its Chinese equivalent.
- **Downloads**: all module theories and checked solutions, with a `ROOT` file, in one ZIP.

## 4. What a module page contains

Front matter, then the sections:

```
---
title: Propositional logic
part: 1
lead: One or two sentences: what the reader will be able to do.
minutes: 180
needs: Module 1
goals:
  - Read and write formulas with ¬, ∧, ∨, ⟶ and ⟷
imports: Main                  (optional; the module theory's imports)
---
```

Every module ends with **What you learned** (`{#summary}`), **Exercises** (`{#exercises}`) and
**Check yourself** (`{#quiz}`).

## 5. Markdown dialect

Sections are `## Title {#id}`; the build numbers them. `### Title {#id}` is allowed below them.

Text boxes (three colons; the build adds the label):

- `::: definition TITLE` — a definition, numbered ("Definition 2.3: TITLE").
- `::: example TITLE` — a worked example.
- `::: fact TITLE` — a theorem or law stated without proof, or proved in the text.
- `::: keyidea`, `::: tip`, `::: pitfall`, `::: note`, `::: analogy` — as in the other series.
- `::: isabelle` — a "Check it in Isabelle" box (Part I mostly).
- `::: trouble` — "If something went wrong", with real messages.
- `:::: tabs` with `::: tab Windows` / `::: tab macOS` / `::: tab Linux`.
- `::: figure id=fig-02-1` — a figure drawn by `src/figures/_gen/figs.py`; the content is the caption.
- `::: widget name=truth-table` — an interactive widget; the content is the caption.
- `:::: exercise TITLE {#ex-2-1} ★★` containing the task and a `::: solution` box (shown folded).

Blocks:

- ` ```isabelle ` — Isabelle text. It goes into the module's theory `Module_NN`, in page order (inside a
  solution: into `Module_NN_Solutions`, which imports `Module_NN`). Write symbols in Unicode (∀ ⟹ λ);
  the tool writes them as `\<forall>` etc. into the theory files.
- ` ```isabelle fails ` — text that must fail. Checked in a separate theory made of everything before
  it on the page plus this block; the build fails if Isabelle reports no error.
- ` ```isabelle norun ` — shown, not checked (templates with placeholders only).
- ` ```output ` — straight after an isabelle block: what Isabelle prints for the last command of that
  block (proof state, value, counterexample, warning, error), filled in by `tools/isa.py --update`.
  Warnings are prefixed `### ` and errors `*** `, as Isabelle prints them in a terminal.
- ` ```prooftree ` — a natural-deduction tree, one formula per line, premises indented below their
  conclusion, rule names in brackets at the end, discharged assumptions in square brackets with a mark:

  ```
  A ∧ B ⟶ B ∧ A   (⟶I¹)
    B ∧ A   (∧I)
      B   (∧E₂)
        [A ∧ B]¹
      A   (∧E₁)
        [A ∧ B]¹
  ```

- ` ```truthtable ` — one propositional formula (with optional sub-formula columns after `|`); the
  build computes the table and the verdict (tautology, contradiction, satisfiable).
- ` ```quiz ` — as in the other series (`? question`, `- [x]` right answer, `> explanation`).
- Mathematics in prose: `$...$` and `$$...$$` (KaTeX). Logic in prose uses the same symbols as Isabelle
  where it can: ¬ ∧ ∨ ⟶ ⟷ ∀ ∃, and ⊨ ⊢ for consequence and derivability.

## 6. Figures and widgets

Figures are SVG, drawn in both languages by `src/figures/_gen/figs.py`. Widgets are plain JavaScript in
`src/widgets/`, bilingual through `html[lang]`, and each has a scripted test in `tools/widget-test.mjs`.

| Widget | Module | What it does |
|---|---|---|
| `truth-table` | 2 | Type a formula; see its truth table, classification and a satisfying or falsifying row |
| `model-explorer` | 3 | A small domain and relation you can edit; formulas re-evaluate as you click |
| `relation-explorer` | 4 | Toggle pairs of a relation; see its properties and its closures |
| `eval-stepper` | 5 | Step through the evaluation of a recursive function call |
| `nd-builder` | 6 | Build a natural-deduction proof backwards by choosing rules, as Isabelle does |

## 7. How outputs stay true: `tools/isa.py`

1. Collects the Isabelle blocks of each module page, writes `Module_NN.thy`, `Module_NN_Solutions.thy`
   and one probe theory per `fails` block, with a `ROOT` file, under `out/isa/`.
2. Runs `isabelle build -o show_states` on them, then `isabelle build_log -U -v` to read every message
   (state, output, warning, error) with its line.
3. Maps the messages back to the blocks; reports any error in a normal block, any `fails` block that did
   not fail, and any output block that differs from what Isabelle printed. `--update` writes the real
   output into the page.
4. Writes the downloadable theories and the ZIP.

The Chinese pages share every Isabelle and output block with the English ones, byte for byte
(`tools/check.mjs` compares them).

## 8. Translation

As the other series: Chinese pages in `src/zh/`, same structure, same blocks, same ids, quiz answers in
the same positions; rules and terms in `notes/TRANSLATION.md`.

## 9. Publishing

`node tools/build.mjs --out ../../docs/tutorials/formal-methods`, a card on `docs/tutorials/index.md`,
then `mkdocs build` from the repository root must pass. Pushing to `main` publishes the site.
