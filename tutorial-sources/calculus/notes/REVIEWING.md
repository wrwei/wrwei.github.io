# Reviewing a module: the brief

You review finished module pages with fresh eyes, as the last check before publication, and you fix
what you find. Read `notes/AUTHORING.md` (the rules the authors followed), `PLAN.md`, `notes/FACTS.md`
and `src/en/module_01.md` (the reference module) first, and `notes/reviews/cross-module.md`: the series-wide
decisions made during the reviews, and the items other reviewers found in your module. Paths are relative to
`tutorial-sources/calculus/`; set `CALC_PYTHON` as AUTHORING.md says.

## What to check, in order of importance

1. **Correctness.** Every mathematical statement is true, with its conditions stated (domains,
   hypotheses of theorems, "for $x > 0$"). Every definition is precise. Every proof proves what it
   claims; an argument that is only a plausibility argument says so. Every worked example, exercise
   solution, quiz answer and quiz explanation is right: **work them yourself, on paper**, before you
   look at the check blocks.
2. **The check blocks check what the page says.** For every check block, compare it with the prose and
   displayed mathematics around it: does it verify the result as the page states it (the same
   expression, the same number of digits), and every intermediate result that could hide a slip? Add
   the checks that are missing (a displayed derivative, an antiderivative before the limits, a rounded
   number without `rounds`). A check that tests something other than what the page says is a defect
   even when it passes. `nocheck` examples must really compute nothing.
3. **Teaching.** A reader who has done the earlier modules, and nothing else, can follow every step.
   New terms are defined before or where they are first used; new notation is read aloud once; no step
   that a learner needs is skipped (algebra included); each idea comes with a picture or numbers before
   the formal definition; the exercises practise the module's goals at three levels; the module's
   `needs`, `goals` and `minutes` are accurate. Flag passages that would lose a learner and rewrite them.
4. **Consistency across the series.** Notation (AUTHORING.md section 4) and terminology match the other
   modules; AUTHORING.md section 11 says which module introduces what: a module must not use what a
   later module introduces without saying so. Every cross-reference is right: "Section 3.4",
   "Definition 2.3", "Theorem 5.1", "Example 4.2", "Figure 5.1" and "Exercise 4.2" point to what they
   claim (the build numbers them in page order, per kind); every claim of the form "Module N showed /
   will show X" is true of Module N (open it and check). Report inconsistencies in modules you are not
   reviewing; do not edit those.
5. **Style.** The voice of Module 1: short sentences, "you", British spelling, no filler words, no
   exclamation marks; `node tools/check.mjs --lang en` lists style warnings.
6. **Rendering.** Build and look at screenshots of the whole page at 1100 px, and of the widget and
   any wide formula or table at 360 px: boxes, mathematics (no red KaTeX errors), value tables, figures,
   Python outputs, exercises, quiz. Nothing overlaps, overflows or is cut off; wide formulas scroll
   inside their line rather than widening the page. Look at every figure preview
   (`$CALC_PYTHON -I src/figures/_gen/figs.py NN --png`, then `out/figs/`).

## How to fix

Edit the module pages, their figure files (`src/figures/_gen/figs_NN.py`, then regenerate) and their
widgets directly. After changing any python, check or valuetable block, run
`$CALC_PYTHON -I tools/calc.py --module NN --update` and re-read the outputs; never edit an output block
or a computed table by hand. Keep the page's section ids, figure ids and exercise ids unless one is wrong.
Do not edit shared tools, `src/assets/`, `src/widgets/_core.js`, `figstyle.py`, other modules' files or
PLAN.md; report needed changes instead. Do not run git commands that change anything.

Large changes are fine when they are needed (a wrong proof, a confusing section rewritten), but do not
rewrite what works: the authors' structure and examples stay unless they are wrong or unclear.

## Finish

1. `$CALC_PYTHON -I tools/calc.py --module NN` ends with `all outputs match`, no problems.
2. `node tools/check.mjs --lang en` reports no errors and no style warnings for your pages.
3. `node tools/build.mjs`, and `node tools/widget-test.mjs --only NAME` for any widget you touched.
4. Write `notes/reviews/module_NN.md`: the issues you found (with line numbers at the time of the
   review) and what you did about each; anything you could not fix; problems you saw in other modules or
   shared tools.
5. Final report (under 250 words): the most important problems found and fixed, anything left open, and
   cross-module issues for the coordinator.
