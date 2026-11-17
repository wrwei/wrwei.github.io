# Review of Module 14, Capstone: a verified compiler

## Follow-up content audit, 17 November 2026

Read every definition, execution example, proof, exercise solution and quiz, and checked the three
figure sources. Line numbers refer to the source at the start of this follow-up.

- **L17–31, 53–68, 72–77:** a verified compiler theorem states what successful compilation preserves
  under its semantics and assumptions. Semantics need not always be total functions. This example
  starts from syntax trees and does not verify a textual parser.
- **L206–230, 284–298, Exercise 14.7:** the short-stack case deliberately specifies underflow
  behaviour; totality alone does not force that runtime choice. Arbitrary programs can consume
  pre-existing stack contents. The preservation property is proved for compiled expressions, rather
  than being true of every stack-machine program.
- **L360–369:** qualified constant names depend on print context; an unconstrained, fresh unknown
  term is a free variable, not evidence that a constant of that name exists.
- **L409–420, 479–489, summary:** Quickcheck searches bounded generators, including representations
  of function values. It does not enumerate all mathematical states, guarantee a smallest
  counterexample or find every false claim. A genuine counterexample refutes a claim; a failed proof
  attempt alone does not determine whether the statement or strategy is wrong.
- **L581–590, 632–641, 919–924:** explained the generalisation needed by these inductions without
  claiming that every changed argument universally requires it or that an auxiliary lemma is impossible.
- **L803–821, 940–949:** scoped optimisation correctness to its specified semantics. Constant
  folding evaluates constants; dropping a right-hand zero is an algebraic simplification in the same
  pass. The signed-zero example needs a rounding-mode qualification; relaxed floating-point options
  can permit transformations that strict signed-zero semantics would disallow.
- **L1015–1023:** stated the code-generator, extraction, runtime and representation trust boundaries;
  the theorem does not verify a parser, assembler or physical stack-machine implementation.
- **L1077–1082, 1214–1230:** unrestricted backward jumps obstruct this unfuelled total interpreter;
  a relation or fuelled interpreter are alternatives. Running out of fuel does not prove divergence.
  Multiplication adds proof cases, and storing `let` bindings is one implementation choice.
- **L1391–1396:** the optimisation exercise bounds instruction counts, not elapsed time, compilation
  cost or integer memory. Clarified the trusted-software quiz and linked the book's official site.

Primary references: [Isabelle code generation manual](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Codegen/Introduction.html)
and [foundations](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Codegen/Foundations.html),
[functions manual](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Functions/Functions.html),
[GCC optimisation options](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html) (`-fsigned-zeros`),
[CompCert manual](https://compcert.org/man/manual001.html) (semantic preservation and verified boundaries),
and [Concrete Semantics](https://concrete-semantics.org/). The stack and instruction-count statements
were also checked directly against the equations and proofs.

Validation: all 76 Isabelle blocks, 40 captured-output blocks, three raw-text blocks and existing
IDs are unchanged. English checker: no errors or warnings. English HTML and root MkDocs builds passed.
Inspected the whole page at 1280 and 390 px with solutions expanded: no page overflow, broken images,
KaTeX errors, missing local anchors, SVG text outside its view box or browser errors. Isabelle is
unavailable on this Mac, so the earlier successful prover run was not repeated. Chinese synchronisation
remains deferred. No figure, widget or shared-tool changes were needed.

## Original review, 16 November 2026

Reviewed on 16 November 2026: `src/en/module_14.md` and `src/figures/_gen/figs_14.py`. Line numbers are
those of the page as I found it (snapshot commit 0230b69, 1686 lines), before my edits.

## How it was checked

- Every computation redone by hand: `eval sample s0 = 14` (Example 14.1), `exec1.simps` and the two
  equations that replace the catch-all, the stacks of Figure 14.2, `compile_bad` on `sample`, the four
  Quickcheck counterexamples and their readings (stack not forgotten; 0 + 0; swapped `SUB` with a = −1,
  b = 0; `JMP 1` before `PUSH2 (- 1)`), `cfold` on both examples, the code of `Cond`, Exercises 14.1–14.8
  and the quiz.
- The paper proof, the two failed attempts (append lemma, generalisation) and the Isar proof read against
  their outputs; `fold_add.induct`'s five cases against the derived equations; `compile2_correct`'s
  argument for jumps.
- Scratch builds (`out/scratch/r14`): `isabelle export` of the module's theory; the generated
  `StackCompiler.hs` (folder `code/export1`) has exactly the datatypes and the three functions shown on
  the page. `quickcheck` without `size` on `compile_correct` prints "Quickcheck ran out of time". A
  function named `comp` in a theory `T` is printed `T.comp (Num 1)`. The continuation lemma of Exercise
  14.6 is proved by `(induction e arbitrary: c stk) auto` *with* `exec_append` in the simp set (issue 14).
  `export_code open` exports all constructors; naming `Num Var Add` exports `Expr(..)` but leaves `Int` and
  `Char` abstract.
- History: Leroy, "A formally verified compiler back-end" (J. Autom. Reasoning 2009), related work: the
  seminal paper of McCarthy and Painter (1967); Milner and Weyhrauch (Machine Intelligence 7, 1972)
  "arguably the first to mechanically verify semantic preservation for a compilation algorithm (the
  translation of arithmetic expressions to stack machine code), using the Stanford LCF prover".
  McCarthy–Painter's source language has constants, variables and binary + only (the language of `expr`),
  compiled to a single-address machine with an accumulator and registers. CompCert (large subset of C,
  Rocq, extraction to OCaml), CakeML (HOL4), JVM/WebAssembly/CPython as stack machines, IEEE
  −0.0 + 0.0 = +0.0, *Concrete Semantics* (Springer 2014), the AFP.
- Cross-references to Modules 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12 (current draft) and 13, and the site
  guide `docs/tutorials/isabelle/index.md` (lid model, Isabelle2025-2) checked; section numbers such as
  14.4.3, 14.5.4, 14.6.2 and 14.8.4 counted.
- `python3 -I tools/isa.py --module 14`: all outputs match (75 blocks). `node tools/check.mjs --lang en`: no
  errors or warnings for this page. Built page looked at in full at 1280 px; no horizontal page scroll at
  390 px; Figures 14.1–14.3 looked at in both languages (no change needed).

## Issues found and what I did

1. **L23–25: "A verified compiler takes it off that list"**, while Section 14.7 says the code generator,
   the Haskell compiler and the hardware remain trusted. **Fixed:** "or nearly so (Section 14.7 says what
   remains)".
2. **L27–32, history:** McCarthy–Painter and Milner–Weyhrauch confirmed (above). **Changed:** the
   Milner–Weyhrauch sentence now says what they checked: a compiler from arithmetic expressions to
   stack-machine code, the compiler of this module.
3. **L82–83:** strings with `''…''` were introduced in Module 4, not Module 1. **Fixed.**
4. **L486–487 keyidea:** "A proof attempt on a false claim only fails, without telling you why"
   overstated (Modules 11 and 13 read failed goals). **Fixed:** a failed attempt does not tell you whether
   the claim or the proof is at fault.
5. **L633:** "no lemma can help" overstated. **Fixed:** the remedy is to change the claim.
6. **L935–936: "because the theorems compose, the whole compiler is correct"** (CompCert): the composed
   theorem covers the chain of verified passes, not the whole tool. **Fixed.**
7. **L941–942:** "compilers do not make that replacement": only compilers that follow the IEEE rules (not
   fast-math modes). **Fixed.**
8. **L959–1002, the generated Haskell.** The excerpts match `export_code` exactly. Fixed around them: the
   folder sentence (each `export_code` of a theory writes to `export1`, `export2`, …); "The parts left out
   define the types `Char` and `Int`" (they also hold the equality tests and integer operations such as
   `plus_int`); "integers are written in binary … as natural numbers were in Module 8" (Module 8's `Nat` is
   unary; its numerals are binary). **Added:** the module header exports `Char, Int, Expr, Instr, cfold,
   compile` without constructors, so other Haskell code cannot build an expression to compile;
   `export_code open …` exports everything (this refers to Module 12's explanation of the export list).
9. **L1069–1070:** "`exec2` could not be a function" → `fun` could not define it.
10. **L1225, table:** "Functions as values" for Module 4 (that is Module 8's phrase). **Fixed:** "Functions".
11. **L1235: "The series started with truth tables"**: it starts with Module 1; truth tables are in Module 2.
    **Fixed.**
12. **L1238–1240:** "its proof has the structure of the proofs behind seL4 and CompCert" softened to "the
    ingredients of"; seL4's proof is a refinement proof.
13. **L1278–1279, summary:** "Constant folding is proved correct by computation induction": the theorem is by
    structural induction; only the lemma about `fold_add` uses computation induction. **Fixed.**
14. **L1482–1484, solution of Exercise 14.6:** "remove it with `simp del:` …, or the simplifier would split
    the program before the hypotheses can be used" is false (scratch run: the proof works with
    `exec_append`). **Fixed:** the reason is that the exercise asks for a proof without `exec_append`, which
    `auto` would otherwise use silently.
15. **Exercise 14.8 (L1556):** added one sentence: McCarthy and Painter's machine had an accumulator and
    registers, like this one.

The closing section reads as an end to the series (where each module's ideas appeared, what proof adds to
testing, where to go next); only issues 10–12 needed changes there.

## Left open

- None in this module.

## Other modules and shared tools

- Module 12 (draft): Section 14.7 now relies on Module 12's explanation that `export_code` exports types
  without constructors unless `open` is given. If Module 12 drops it, Module 14 needs a sentence of its own.
- Module 12 uses `theorem` (L480) and Module 11 `corollary` (L1447) without explanation; Module 13 now
  explains both, and Module 14's two sentences about them read as reminders.
- For `notes/FACTS.md`: `export_code` without `file_prefix` writes to `code/exportN` of the theory's
  exports, N counting the theory's `export_code` commands; exported identifiers are minimised unless
  `open` precedes the constants (isar-ref ch. 13, `code_target.ML` `next_export`).
