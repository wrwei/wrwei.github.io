# Writing a module: the brief

Read this whole file, `PLAN.md`, `notes/FACTS.md` and `src/en/module_01.md` before you write. Module 1 is
the reference for voice, structure, density and the use of every element of the dialect. Your module
must read as if the same person wrote the whole series.

Paths below are relative to `tutorial-sources/formal-methods/`.

## 1. What you produce

| File | What |
|---|---|
| `src/en/module_NN.md` | The module page, in English |
| `src/figures/_gen/figs_NN.py` | Your module's figures (if any), see section 7 |
| `src/widgets/NAME.js` and `tools/widget-tests/NAME.mjs` | Your module's widget and its test, if PLAN.md section 6 gives your module one, see section 8 |
| `src/images/…` | Only if you take real screenshots (rarely needed) |

Do not edit anything else: not the tools, not `src/assets/`, not `src/widgets/_core.js`, not
`figlib.py`, not other modules, not PLAN.md. If a shared file has a bug or lacks something you need,
say so in your final report. Do not run git commands that change anything (no add, commit, stash,
checkout); the coordinator commits.

## 2. Readers and voice

From PLAN.md section 1, in short: readers can program a little and remember school algebra; they have no
logic, proof or proof-assistant experience; they work alone. So:

- Explain every idea on paper first, with a worked example, before Isabelle checks it.
- Define every new term where it first appears, in a `::: definition` box or in bold in the text.
- Read new notation aloud the first time: "∀x. P x reads 'for all x, P of x'".
- Short sentences, "you", present tense, British spelling (formalise, behaviour, colour, modelling).
- No filler and no talking down: avoid "simply", "just", "obviously", "clearly", "easy", "of course",
  and exclamation marks. No emoji.
- Prefer concrete examples from software (access control, traffic lights, bank accounts, sorting,
  schedules, protocols) to abstract letters, once the abstract form has been shown.
- Each concept follows the rhythm: motivation, explanation, definition box, worked example, check in
  Isabelle (Part I) or Isabelle first (Parts III–IV), common mistakes (`::: pitfall` or `::: trouble`).
- Mistakes are part of learning: show the errors beginners meet, with Isabelle's real message
  (a `fails` block) and the fix.

## 3. Size and structure

- Study time 150–240 minutes with exercises (front matter `minutes`). Module 1 has about 6,400 words;
  aim for 7,000–10,000 words. Depth beats breadth: cover the PLAN.md topics for your module properly.
- Front matter: `title`, `part`, `lead` (one or two sentences: what the reader will be able to do),
  `minutes`, `needs` (e.g. "Modules 1 and 2"), `goals` (4–6 items, each starting with a verb), and
  `imports` when the module theory needs more than `Main` (e.g. `imports: Main "HOL-Library.Multiset"`).
- 6–9 numbered sections `## Title {#id}`, with `### Title {#id}` subsections where useful. Ids are
  short, lowercase, hyphenated, unique in the page, and must not change later (the Chinese page keeps
  them).
- The page ends with exactly these three sections, in this order: `## What you learned {#summary}`
  (bullets), `## Exercises {#exercises}`, `## Check yourself {#quiz}`.
- Refer to boxes and figures by number ("Definition 2.3", "Figure 2.1"): the build numbers them in page
  order per kind (definition, example, fact each count separately; figures count separately). Refer to
  sections as "Section 2.4" (the build numbers `##` sections 1, 2, 3, … in order, the last three
  included). Count carefully, or refer by name.
- Refer to other modules as "Module 3". Links to other pages of the series are `module_03_EN.html`
  (with `#id` for a section); the coordinator checks them when all pages exist.

## 4. The dialect (tools/md.mjs is the renderer; Module 1 shows every element in use)

- Boxes: `::: definition TITLE`, `::: example TITLE`, `::: fact TITLE` (numbered), `::: keyidea`,
  `::: tip`, `::: pitfall`, `::: note`, `::: analogy`, `::: isabelle` ("Check it in Isabelle"),
  `::: trouble` (folded "If something went wrong").
- Exercises: `:::: exercise TITLE {#ex-N-k} ★★` (four colons; N = module number without a leading zero,
  k = 1, 2, …) containing the task and a `::: solution` box. Stars: ★ check understanding,
  ★★ apply, ★★★ stretch. 6–9 exercises, at least two at each level, every one with a full solution.
- Figures: `::: figure id=fig-NN-k` (drawn SVG, see section 7) or
  `::: figure id=fig-NN-k image=FILE.png alt="..."` (a picture in `src/images/`); the content is the
  caption.
- Widgets: `::: widget name=NAME`; the content is a caption that tells the reader what to try.
- Mathematics: `$...$` inline and `$$...$$` display (KaTeX, rendered at build time). Macros: `\imp` (⟶),
  `\iff` (⟷), `\Imp` (⟹), `\N`, `\Z`, `\R`, `\pow` (power set 𝒫). In prose, write logic with the
  symbols Isabelle uses: ¬ ∧ ∨ ⟶ ⟷ ∀ ∃ (as Unicode in text, or `\lnot \land \lor \imp \iff \forall
  \exists` in KaTeX), ⊨ and ⊢ for consequence and derivability.
- ` ```truthtable `: first line a propositional formula, further lines optional sub-formula columns;
  the build computes the table and verdict. Formulas use Isabelle's syntax and priorities: ¬ binds
  tighter than ∧, then ∨, then ⟶ and ⟷ (same priority, both group to the right). Parenthesise when
  you mix ⟶ and ⟷.
- ` ```prooftree `: natural-deduction tree, one formula per line, premises indented under their
  conclusion, rule names in brackets at the end, discharged assumptions in square brackets with a
  mark, as in PLAN.md section 5.
- ` ```quiz `: 6 questions; `? question`, options `- [ ]` / `- [x]` (exactly one right answer; vary
  its position), `> explanation`. Inline code and `$…$` work in options.
- ` ```terminal ` for shell commands (lines starting `$ `), ` ```text ` for other verbatim text.
- Tables are fine; keep them to 3–5 columns so they fit a phone.

## 5. Isabelle blocks: how outputs stay true

All ` ```isabelle ` blocks of your page form the theory `Module_NN` (in page order); blocks inside a
`::: solution` box form `Module_NN_Solutions`, which imports `Module_NN`. `tools/isa.py` builds them with
Isabelle2026 and fills every ` ```output ` block with what Isabelle printed.

Workflow, repeated until clean:

```terminal
$ python3 -I tools/isa.py --module NN --update
```

It prints each output that changed, every Isabelle error in a normal block, and every `fails` block that
did not fail, and ends with `all outputs match` when the page is consistent. Isabelle builds run one at a
time on this machine (a lock in `out/.isa-build.lock`), so a run may first print "waiting for another
isa.py run…": give the command a long timeout (10 minutes) and let it finish. Put scratch builds behind
the same lock: `flock out/.isa-build.lock …/bin/isabelle build -d out/scratch/X SESSION`. Run it again without
`--update` at the end: it must say `all outputs match` with no problems. After every run, **read the real
outputs** and make your prose agree with them (variable names, order of subgoals, the exact
counterexample). Never edit an output block by hand.

Rules:

- Write Isabelle text in Unicode (∀ ⟹ λ ⇒ …); the tool converts symbols. Subscripts print as `x⇩1` in
  outputs and render as x₁. In prose write x₁.
- An empty ` ```output ` block right after an isabelle block (prose between them is fine, but no other
  isabelle block) is filled by `--update`. Options on the fence line:
  - (none): every message of the block's last line that has messages;
  - `state`: only the proof state (use after `lemma` and `apply` lines);
  - `result`: everything but the proof state (use for `value`, `quickcheck`, `nitpick`, `term`,
    `thm`, `find_theorems`);
  - `all`: messages of every line of the block;
  - `varies`: for output that changes between runs (Sledgehammer, anything with timings): filled once,
    never compared, and labelled on the page as one run. Combine: ` ```output result varies `.
- What readers see in Isabelle/jEdit and what the batch build prints differ in a few ways; write the
  page so that both agree with it:
  - Isabelle/jEdit runs Auto Quickcheck, Auto Nitpick-style tools and Auto solve_direct on every new
    `lemma` automatically; the batch build does not. When you show a counterexample, call
    `quickcheck` or `nitpick` explicitly in the block, and say that jEdit also shows it automatically.
  - The batch build prints `theorem …` for a finished lemma at the `lemma` line; jEdit shows it at the
    end of the proof. Use `output state` after a lemma statement so that only the goal is shown.
  - Readers have ticked **Proof state** (Module 1), so they see proof states in the Output panel.
  - Positions in messages print as ⌂.
- Nitpick searches several sizes in parallel, so the size of the counterexample it reports can change
  between runs. Make it deterministic with options, e.g. `nitpick [card = 2]` or
  `nitpick [card 'a = 2]`, or mark the output `varies`.
- ` ```isabelle fails `: the block must make Isabelle report an error; it is checked in a separate probe
  theory (all earlier main blocks plus this one), so it does not break the module theory. Use it for
  the mistakes beginners make, with the error in an output block.
- ` ```isabelle norun `: shown, not checked. Only for templates with placeholders or for text that cannot
  live inside a theory (such as a theory header). Everything else is checked.
- Never `sorry`. Use `oops` only to show an abandoned or false claim.
- One theory per module: names must be unique within it. Do not redefine a name from Isabelle's
  library (`rev`, `sorted`, `insort`, `count`, `set`, `length`, `sum_list`, `map`, `filter`, `max`,
  `fold`, `size`, `tree`, `Node`, `Leaf` …): it makes input ambiguous. Use distinctive names (`itrev`,
  `isort`, `ins`, `mysum`, `tree2`, `bst`). Check with `find_consts` or `term` if unsure.
  The solutions theory imports the module theory, so its definitions are visible there; do not
  redefine them.
- Name a lemma (`lemma rev_app: …`) when the text or a later proof refers to it.
- Keep every proof fast (each block well under a few seconds). The whole module must build in under a
  minute.
- To try things out, write a scratch theory outside the page (in `out/scratch/`, which is ignored) and
  build it with `isabelle build -d out/scratch/X SESSION`; but every output on the page comes from
  `isa.py`. **Never use `isabelle build -f`, never build `Pure` or `HOL`, and never write to or delete
  anything in `~/.isabelle`**: a user-level Pure or HOL heap hides the prebuilt heaps, after which every
  build of every author rebuilds HOL and runs out of memory. `isa.py` refuses to run if it finds such
  files; tell the coordinator instead of removing them yourself.

The Isabelle installation is at
`/tmp/claude-0/-home-user-wrwei-github-io/7b6368c3-ecc9-5d53-a462-2dab7e36d355/scratchpad/isabelle/Isabelle2026`
(`bin/isabelle`, library sources in `src/HOL/`). Its manuals, as text, are in
`/tmp/claude-0/-home-user-wrwei-github-io/7b6368c3-ecc9-5d53-a462-2dab7e36d355/scratchpad/isadoc/`
(`prog-prove.txt`, `isar-ref.txt`, `tutorial.txt`, `main.txt`, `nitpick.txt`, `sledgehammer.txt`,
`functions.txt`, `datatypes.txt`, `codegen.txt`, `jedit.txt`).

## 6. Facts

Every statement about Isabelle (command and method names, options, lemma names, what a panel or
message says, how a feature behaves) must be checked against the Isabelle2026 distribution: its sources
(`src/HOL/*.thy`, e.g. `grep -n "lemma rev_rev_ident" src/HOL/List.thy`), its manuals (above), or a run.
Do not rely on memory of older versions; names change. History and applications: only well-established
facts, with dates you are sure of; leave out numbers you cannot vouch for. Mathematics must be correct and
stated with its conditions. If you add a fact about Isabelle that a reader might rely on (a menu, a
keyboard shortcut, a default), list it with its source in your final report so that it can be added to
`notes/FACTS.md`.

## 7. Figures

Draw figures as SVG in `src/figures/_gen/figs_NN.py`:

```python
"""Figures of Module NN."""
from figlib import *  # noqa: F401,F403   (SVG, C colours, SANS, MONO, arrow_label)


def fig_NN_1(L):
    T = {'en': dict(title='…', ...), 'zh': dict(title='…', ...)}[L]   # every visible string, both languages
    s = SVG(760, 300, T['title'])
    ...
    return s


FIGURES = {'fig-NN-1': fig_NN_1}
```

`SVG` offers `rect`, `text`, `lines`, `line` (with `arrow=True`), `path`, `circle`, `pill`; see
`figlib.py` and `figs_01.py`. Width 760 at most; font sizes 11–16; colours from `C` only. Formulas and
Isabelle text use `mono=True` (Isabelle's font). Write the Chinese strings too (plain, accurate
Simplified Chinese; the translator will review them). Then:

```terminal
$ python3 -I src/figures/_gen/figs.py fig-NN-1
$ node tools/shot.mjs src/figures/en/fig-NN-1.svg --out out/shots/fig-NN-1
```

and look at the PNG (and the Chinese one): no overlapping or clipped text. Use figures where a picture
explains better than words (structures, trees, state machines, the shape of a proof); 2–4 per module.

## 8. Widgets (Modules 2–6)

A widget is plain JavaScript in `src/widgets/NAME.js` (no libraries, no modules, ES5-compatible style is
fine but modern syntax is allowed), registered with

```js
FMWidgets.register('NAME', function (root, api) {
  // api.lang ('en' | 'zh'), api.t(en, zh), api.h(tag, attrs, ...children), api.css(id, text), api.Logic
})
```

`api.Logic` (in `src/widgets/_core.js`) parses, prints and evaluates formulas in Isabelle syntax:
`parse(src)` (accepts Unicode and ASCII: `~ & | --> <-> ALL EX`, also `P(x, y)` and Isabelle-style `P x y`),
`show(ast)`, `atoms(ast)`, `evalProp(ast, valuation)`, `holds(ast, structure, env)`, `freeVars(ast)`.
Read `_core.js` for the AST and structure formats; reuse it rather than writing another parser. The
common classes `fmw-…` give a consistent look; add your own rules with `api.css('NAME', '…')`, using the
site's CSS variables (`--navy --blue --sky --slate --muted --border --bg --white --font-isa`).

Requirements: every visible string in both languages via `api.t`; works at 360 px wide (wrap, scroll
tables horizontally inside `.fmw-scroll`); usable with the keyboard (real `<button>` and `<input>`
elements with labels); never throws on bad input (show a message instead); no network access; state
lives in the widget only.

Test it in `tools/widget-tests/NAME.mjs`:

```js
export const page = 'module_NN'
export async function run(t) {
  await t.type('input', 'A ∧ ¬A')
  t.check((await t.text('.verdict')).includes(t.lang === 'zh' ? '矛盾' : 'contradiction'), 'classifies a contradiction')
  await t.shot()
}
```

Run `node tools/build.mjs && node tools/widget-test.mjs --only NAME --lang en` and look at the
screenshot in `out/shots/`. The test must exercise the main interactions and check real results (5–15
checks), not only that the widget appears.

## 9. Before you finish

1. `python3 -I tools/isa.py --module NN` says `all outputs match` with no problems.
2. `node tools/check.mjs --lang en`: no errors for your page (links to pages that do not exist yet are
   reported as errors; list them in your report).
3. `node tools/build.mjs` builds your page without warnings about it.
4. `node tools/shot.mjs out/site/module_NN_EN.html --out out/shots/mNN --pages 40 --width 1280`, then
   look at the screenshots (combine several into one image with ImageMagick `montage` to save effort):
   boxes, tables, figures, outputs, exercises and quiz must render correctly.
5. Figures and widget checked as in sections 7 and 8.
6. Re-read the page once as the reader would, start to finish. Fix anything unclear.

Final report (your last message, under 300 words): what the module covers (sections), counts (words,
Isabelle blocks, output blocks, exercises, figures), the widget and its test result, Isabelle facts you
added that belong in FACTS.md (with sources), what you assume earlier modules taught and what you leave
to later modules, and any problem with the shared tools.

## 10. What each module teaches in Isabelle

So that modules neither repeat each other nor use what has not been taught. A module may use anything
from earlier rows, and should introduce the items in its own row.

| Module | Isabelle introduced |
|---|---|
| 1 | theory, imports Main, begin/end, `value`, `lemma … by simp`, simple `fun`, `quickcheck`, `oops`; jEdit basics, Proof state, symbols; `nat`, lists, `rev`, `@` |
| 2 | type `bool`, `True`, `False`, ¬ ∧ ∨ ⟶ ⟷ and their priorities; `value` on formulas; tautologies by `simp`, `blast`, `auto`; counterexamples with `quickcheck` and `nitpick`; free variables of type bool |
| 3 | ∀ ∃ and binder scope; type variables `'a`; predicates as functions to bool (`P :: "'a ⇒ bool"`); `blast` for first-order goals; `nitpick` countermodels for first-order formulas; `=` versus ⟷; free variables are implicitly universal |
| 4 | `'a set`, ∈ ∪ ∩ − ⊆, `{x. P x}`, `{a, b}`, `UNIV`, `Pow`; relations as sets of pairs; `inj`, `surj`, `bij`, `inv`; `finite`, `card`; `r⇧*` (`rtrancl`) and `r⇧+`; `auto` and `blast` on sets |
| 5 | recursion with `fun` on `nat` and lists; a first `datatype` (binary trees); `induction` (`by (induction xs) auto`, `apply (induction n)`), base and step cases in the proof state; termination in outline |
| 6 | natural deduction on paper; little or no Isabelle |
| 7 | `apply (rule …)`, `erule`, `drule`, `frule`, `assumption`, `intro`, `elim`, `done`; rules `conjI conjE disjI1 disjI2 disjE impI mp notI notE allI allE exI exE ccontr classical`; `thm`; schematic variables `?P`; unification; fixed variables; `blast` |
| 8 | `term`, `typ`, `value`; `datatype`, `definition`, `fun`, `primrec`; lists in depth; `nat`, `int`, type classes in outline; `export_code`; non-terminating definitions and their errors |
| 9 | simplifier in depth (`simp add:`, `simp only:`, `[simp]`, conditional rules, `split:`, tracing); `auto`, `blast`, `force`, `fastforce`; `arith`, `linarith`, `presburger`; `find_theorems`; Quickcheck and Nitpick options; Sledgehammer; strategies when automation fails |
| 10 | Isar: `proof … qed`, `assume`, `show`, `have`, `fix`, `obtain`, `from`, `with`, `then`, `hence`, `thus`, `using`, `moreover`, `ultimately`, `also`, `finally`, `cases`, induction with named cases (`case Nil`, `case (Cons x xs)`), `next` |
| 11 | `arbitrary:`, auxiliary lemmas, computation induction (`rule: f.induct`), `inductive` definitions and rule induction, trees, complete induction (`less_induct`) |
| 12 | specifications against implementations; insertion sort (sorted and `mset`, `HOL-Library.Multiset`); binary search trees and invariants; abstraction functions and refinement; `export_code` of verified code |
| 13 | states and transitions as datatypes; transition relations and reachability with `inductive`; invariants and strengthening; counterexample traces; refinement between models; pointer to the existing Isabelle model-verification guide (`../isabelle/`) |
| 14 | arithmetic expressions and evaluation; a stack machine; the compiler; correctness by generalised induction; constant folding proved correct; testing with `value` and `quickcheck`; `export_code`; extensions |
