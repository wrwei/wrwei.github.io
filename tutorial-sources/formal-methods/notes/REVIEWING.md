# Reviewing a module: the brief

You review finished English module pages with fresh eyes, as the last check before translation and
publication, and you fix what you find. Read `notes/AUTHORING.md` (the rules the authors followed), `PLAN.md`,
`notes/FACTS.md` and `src/en/module_01.md` (the reference module) first. Paths are relative to
`tutorial-sources/formal-methods/`.

## What to check, in order of importance

1. **Correctness.** Every mathematical and logical statement is true, with its conditions stated. Every
   definition is precise. Every worked example, exercise solution, quiz answer and quiz explanation is
   right; work them yourself. Every claim about Isabelle (names of commands, methods, options and lemmas,
   what a message means, how a tool behaves) holds for Isabelle2026: check it against the sources
   (`$ISABELLE/src/HOL/*.thy`), the manuals (text versions in the `isadoc/` folder named in AUTHORING.md)
   or a run. Historical and industrial facts are well established; remove or soften any you cannot
   confirm. The prose around each output block agrees with the output (variable names, subgoal order,
   counterexample values).
2. **Teaching.** A reader who has done the earlier modules, and nothing else, can follow every step. New
   terms are defined before or where they are first used; new notation is read aloud once; no step that a
   beginner needs is skipped; examples come before abstraction where possible; the exercises practise
   the module's goals at three levels; the module's `needs`, `goals` and `minutes` are accurate.
   Flag passages that would lose a beginner and rewrite them.
3. **Consistency across the series.** Terminology, notation and rule names match the other modules
   (Module 6 fixed the natural-deduction rule names; AUTHORING.md section 10 says which module
   introduces which Isabelle feature). Every cross-reference is right: "Section 3.4", "Definition 2.3",
   "Figure 5.1" and "Exercise 4.2" point to what they claim (the build numbers sections, boxes, figures
   and exercises in page order, per kind); every claim of the form "Module N showed/will show X" is true
   of Module N (open it and check). Report inconsistencies in modules you are not reviewing; do not edit
   those.
4. **Style.** The voice of Module 1: short sentences, "you", British spelling, no filler words, no
   exclamation marks; `node tools/check.mjs --lang en` lists style warnings for your pages.
5. **Rendering.** Build and look at screenshots of the whole page: boxes, tables, truth tables, proof
   trees, figures (English and Chinese SVGs), widgets, exercises, quiz. Nothing overlaps, overflows or
   breaks at 1280 px; tables and trees scroll rather than break the layout on a phone.

## How to fix

Edit the module pages, their figure files (`src/figures/_gen/figs_NN.py`, then regenerate) and their
widgets directly. After changing any Isabelle block, run `python3 -I tools/isa.py --module NN --update`
(it waits for a build lock; give it a 10-minute timeout) and re-read the outputs. Never edit an output
block by hand. Keep the page's section ids, figure ids and exercise ids unless one is wrong (the Chinese
edition depends on them). Do not edit shared tools, `src/assets/`, `src/widgets/_core.js`, other modules'
files or PLAN.md; report needed changes instead. Do not run git commands that change anything.

Large changes are fine when they are needed (a wrong proof, a confusing section rewritten), but do not
rewrite what works: the authors' structure and examples stay unless they are wrong or unclear.

## Finish

1. `python3 -I tools/isa.py --module NN` says `all outputs match` with no problems, for each module.
2. `node tools/check.mjs --lang en` reports no errors and no style warnings for your pages.
3. `node tools/build.mjs`, and `node tools/widget-test.mjs --only NAME --lang en` for any widget you
   touched.
4. Write `notes/reviews/module_NN.md` for each module: the issues you found (with line numbers at the time
   of the review) and what you did about each; anything you could not fix; problems you saw in other
   modules or shared tools.
5. Final report (under 250 words): the most important problems found and fixed, anything left open, and
   cross-module issues for the coordinator.
