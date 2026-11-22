# Calculus: how the series is made and maintained

The sources of the series published at `docs/tutorials/calculus/`. Everything on the published pages is
generated from this folder; never edit the published HTML by hand.

## Layout

| Path | What |
|---|---|
| `PLAN.md` | The design: readers, principles, modules, page structure, dialect, tools |
| `notes/AUTHORING.md` | The brief for writing a module (voice, dialect, checks, figures, widgets, what each module introduces) |
| `notes/REVIEWING.md` | The brief for reviewing a module |
| `notes/FACTS.md` | Facts about the software readers install, and the history the pages state, each with its source |
| `notes/reviews/` | One review log per module |
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
