# Calculus: how the series is made and maintained

The sources of the series published at `docs/tutorials/calculus/`. Everything on the published pages is
generated from this folder; never edit the published HTML by hand.

## Status and next steps (handover, 22 November 2026)

**Where things stand.** Work is on the branch `claude/sweet-johnson-24038f` (pushed). `main` holds the
published Formal Methods series; the calculus series is **not published and not merged**: ask the
repository owner before merging anything to `main`. The series is English only for now (the owner asked
for English first).

| Part | State |
|---|---|
| Modules 1–20 (`src/en/module_NN.md`) | Written. Each has its figures, a widget with a test (Module 12 has no widget) and check blocks; each passed `calc.py`, `check.mjs` and its widget test when last changed |
| Reviews (`notes/REVIEWING.md`) | **Done for Modules 1–14**; fixes committed, logs in `notes/reviews/module_NN.md`. **Not done: Modules 15–20, the formula sheet and the index** (reviews of 15–19 were started and stopped before changing anything) |
| Formula sheet (`src/en/formulas.md`) | Written; updated during the reviews (derivative definition, difference formulas, L'Hôpital's rule, arcsec, …) |
| Front page (`src/en/index.md`) | Written; its Reference section names the mistakes and glossary pages, which do not exist yet |
| Glossary | **Draft only**, in `notes/handover/glossary-draft/`: about 545 terms (`terms-01.txt` … `terms-05.txt`, all 20 modules) in the format the docstring of `tools/gen.py` there describes; the notation part has 1 entry. `src/en/glossary.md` does not exist yet |
| Common mistakes (`src/en/mistakes.md`) | **Not started** |
| Publishing | Not done |

On 22 November 2026 the whole series passed: `check.mjs` 0 errors and 0 warnings on 22 pages; all 258
widget checks; `calc.py` on every page (see the counts below).

**What remains, in order.**

1. **Review Modules 15–20**, one at a time, following `notes/REVIEWING.md`, and log each review in
   `notes/reviews/module_NN.md`. Read `notes/reviews/cross-module.md` first: it holds the series-wide
   decisions (above all the sign of an error) and items addressed to Modules 15 and 19. Then review the
   formula sheet and the index the same way: every row right, credited to the module that really teaches it,
   every link right.
2. **Fix the items under "Not done yet"** in `notes/reviews/cross-module.md` (formula sheet rows and
   credits, two sentences in Module 10, one in Module 12).
3. **Finish the glossary.** In `notes/handover/glossary-draft/`: write the notation entries in
   `notation.txt` (the symbols of the series, how the modules read them aloud, where introduced);
   `tools/coverage.py` lists defined terms the draft misses; check each meaning against the module's own
   definition. Then `python3 -I notes/handover/glossary-draft/tools/gen.py` writes `src/en/glossary.md`
   (it checks every link: anchor and section number).
4. **Write the common mistakes page**, `src/en/mistakes.md` (PLAN.md, "Reference pages"): sections by topic
   in the order of the series, one `###` entry with an id per mistake, saying why it is wrong (with a
   counterexample in numbers), the right rule with its conditions, and a link to the section that explains
   it; about 80–110 entries; every formula and number checked in ` ```check ` blocks
   (`$CALC_PYTHON -I tools/calc.py --page mistakes`). Raw material: `python3 -I tools/extract_refs.py
   src/en OUTDIR` writes `OUTDIR/pitfalls.md`, all 181 "Watch out" boxes with their sections and anchors
   (and `terms.md`, the defined terms).
5. **Link the two pages** from the index's Reference section; the build already lists formulas, mistakes
   and glossary in the sidebar when the files exist.
6. **QA and publish.** A full `$CALC_PYTHON -I tools/calc.py` (writes `out/calculus-code.zip`),
   `node tools/check.mjs --lang en`, `node tools/widget-test.mjs`, screenshots of every page at 360 px;
   then `node tools/build.mjs --lang en --out ../../docs/tutorials/calculus`, add a card for the series to
   `docs/tutorials/index.md` (as for the other series), run `mkdocs build` from the repository root to
   check the site, commit and push the branch, and ask the owner before merging to `main`.

**Decisions to keep.** The error of an approximation is the exact value minus the approximation
(absolute errors and O(·) statements are sign-free; Newton's e_n = x_n − r is Module 7's named
exception). Keep every section, exercise and figure id: other pages link to them, and `check.mjs`
checks every link. British spelling and the voice of Module 1, no filler words (`check.mjs` warns).
Never edit an output block or a computed table by hand: change the code, then `calc.py --update`. Read
the SymPy pitfalls in `notes/AUTHORING.md` (section 6.1) before writing checks: several SymPy 1.14
results are wrong (one-sided default of `limit`, `limit(2**x, x, -oo)`, `solveset` on trigonometric
inequalities, `summation` of some convergent series).

**Setting up a new machine.** The virtual environment used so far lived in a temporary folder: create
one as "Requirements" below says (`export CALC_PYTHON=$PWD/.venv/bin/python`), and `npm ci` in `tools/`.

## Layout

| Path | What |
|---|---|
| `PLAN.md` | The design: readers, principles, modules, page structure, dialect, tools |
| `notes/AUTHORING.md` | The brief for writing a module (voice, dialect, checks, figures, widgets, what each module introduces) |
| `notes/REVIEWING.md` | The brief for reviewing a module |
| `notes/FACTS.md` | Facts about the software readers install, and the history the pages state, each with its source |
| `notes/reviews/` | One review log per module, and `cross-module.md`: series-wide decisions and open items |
| `notes/handover/glossary-draft/` | The unfinished glossary: term data, notation data, and the generator that writes `src/en/glossary.md` |
| `tools/extract_refs.py` | Lists the defined terms and the "Watch out" boxes of all modules, as raw material for the glossary and the mistakes page |
| `src/en/*.md` | The pages: `index`, `module_NN`, `formulas`, `mistakes`, `glossary` |
| `src/figures/_gen/` | Figure generator: `figs.py` (runner), `figstyle.py` (house style and helpers), `figs_NN.py` (one per module) |
| `src/figures/en/` | The generated SVG figures (committed) |
| `src/widgets/` | Interactive widgets: `_core.js` (shared: expression parser, plot, numerics, controls) and one file per widget |
| `src/assets/` | Style sheet, page script, favicon |
| `tools/calc.py` | Runs every Python block, check block and value table; fills outputs and tables; writes the code ZIP |
| `tools/calc_worker.py`, `tools/calccheck.py` | The worker process calc.py runs code in, and the helpers of the check blocks |
| `tools/md.mjs`, `tools/build.mjs` | Renderer and site builder |
| `tools/check.mjs` | Structure, links and anchors, numbering, widgets, prose style |
| `tools/widget-test.mjs`, `tools/widget-tests/` | Scripted tests of the widgets in a headless browser |
| `tools/shot.mjs`, `tools/shot-parts.mjs` | Screenshots of built pages, for checking layout |
| `tools/requirements.txt` | The Python packages (pinned) the outputs were produced with |
| `out/` | Build output (ignored by Git) |

## Requirements

- Python 3.11 or later with the packages of `tools/requirements.txt`, in a virtual environment:
  `python3 -m venv .venv && .venv/bin/pip install -r tools/requirements.txt`, then point `CALC_PYTHON` at
  `.venv/bin/python` (`tools/calc.py` runs page code with it; the figure generator needs it too).
- Node.js 20 or later, then `npm ci` in `tools/` (markdown-it, KaTeX, puppeteer-core).
- For screenshots and widget tests: Chromium (set `CHROME_PATH` if it is not at `/opt/pw-browsers/chromium`).

## Everyday commands (from this folder)

```bash
$CALC_PYTHON -I tools/calc.py                    # run and check every page; writes out/calculus-code.zip
$CALC_PYTHON -I tools/calc.py --module 05 --update   # one module; fill in outputs and value tables
$CALC_PYTHON -I src/figures/_gen/figs.py         # redraw every figure (figs.py 05 --png: one module, with previews)
node tools/check.mjs --lang en                   # structure, links, numbering, widgets, style
node tools/build.mjs                             # build the site into out/site
node tools/widget-test.mjs                       # test every widget
node tools/build.mjs --lang en --out ../../docs/tutorials/calculus   # publish
```

## How results stay true

`calc.py` parses each page into blocks and boxes. The python blocks of each `::: compute` box (or
solution) run as one script in a fresh worker process (`calc_worker.py`, with `$CALC_PYTHON`, a fixed hash
seed and matplotlib's Agg backend); what each prints must equal its output block. The check blocks of a
page run in page order in one namespace (SymPy, the helpers of `calccheck.py`, common symbols); every
failed check is reported with its line. Value tables are computed with 40-digit arithmetic from exact
inputs. Every example and solution must contain a check block unless marked `nocheck`. A full run also
writes `out/code/module_NN.py` (and `_solutions.py`), runs each script to be sure the download works,
and zips them.

## Updating to new versions of Python, SymPy, NumPy or matplotlib

1. Install the new versions in the virtual environment and update `tools/requirements.txt`.
2. `$CALC_PYTHON -I tools/calc.py` and read every reported difference: most are harmless changes in how
   SymPy orders or prints terms; fix the prose where it describes the old output, then
   `$CALC_PYTHON -I tools/calc.py --update`.
3. Redraw the figures and look at them; update `notes/FACTS.md` and the setup section of Module 1
   (installation steps change more often than mathematics).
