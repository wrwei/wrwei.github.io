# Formal Methods with Isabelle: how the series is made and maintained

The sources of the series published at `docs/tutorials/formal-methods/`. Everything on the published
pages is generated from this folder; never edit the published HTML by hand.

## Layout

| Path | What |
|---|---|
| `PLAN.md` | The design: readers, principles, modules, page structure, dialect, tools |
| `notes/AUTHORING.md` | The brief for writing a module (voice, dialect, Isabelle workflow, checks) |
| `notes/TRANSLATION.md` | Rules and terms for the Chinese edition |
| `notes/FACTS.md` | Facts about Isabelle2026 that the pages state, each with its source |
| `src/en/*.md`, `src/zh/*.md` | The pages: `index`, `module_NN`, `cheatsheet`, `troubleshooting`, `glossary` |
| `src/figures/_gen/` | Figure generator: `figs.py` (runner), `figlib.py` (style), `figs_NN.py` (one per module) |
| `src/figures/en/`, `src/figures/zh/` | Generated SVG figures (committed) |
| `src/images/` | Screenshots of Isabelle/jEdit (made with `tools/shots/jedit-shots.sh`) |
| `src/widgets/` | Interactive widgets: `_core.js` (shared) and one file per widget |
| `src/assets/` | Style sheet, page script, favicon, Isabelle's fonts (with their licence files) |
| `tools/isa.py` | Checks every Isabelle block with Isabelle and writes Isabelle's real output into the pages |
| `tools/md.mjs`, `tools/build.mjs` | Renderer and site builder |
| `tools/check.mjs` | Structure, links, English–Chinese parity and prose style checks |
| `tools/widget-test.mjs`, `tools/widget-tests/` | Scripted tests of the widgets in a headless browser |
| `tools/shot.mjs`, `tools/shot-parts.mjs` | Screenshots of built pages, for checking layout |
| `out/` | Build output (ignored by Git) |

## Requirements

- Isabelle2026 (from isabelle.in.tum.de). `tools/isa.py` looks for it at the path in `ISABELLE_TOOL`
  (the `bin/isabelle` script) or `--isabelle PATH`.
- Node.js 20 or later, then `npm ci` in `tools/` (markdown-it, KaTeX, puppeteer-core).
- Python 3.10 or later (standard library only).
- For screenshots and widget tests: Chromium (set `CHROME_PATH` if it is not at
  `/opt/pw-browsers/chromium`).

## Everyday commands (from this folder)

```bash
python3 -I tools/isa.py                 # check all Isabelle blocks; writes out/theories and the ZIP
python3 -I tools/isa.py --module 05 --update   # check one module and fill in its output blocks
python3 -I src/figures/_gen/figs.py     # redraw all figures (both languages)
node tools/check.mjs                    # structure, links, parity, style
node tools/build.mjs                    # build the site into out/site
node tools/widget-test.mjs              # test every widget in English and Chinese
node tools/build.mjs --out ../../docs/tutorials/formal-methods   # publish
```

`isa.py` assembles the Isabelle blocks of each module page into theories (`Module_NN`, with the
exercise solutions in `Module_NN_Solutions`), builds them with `isabelle build -o show_states`, reads
every message with `isabelle build_log`, and compares each `output` block with what Isabelle printed.
A block marked `fails` must produce an error; it is checked in a separate probe theory. Output blocks
marked `varies` (Sledgehammer) are captured once and not compared. The full run (no `--module`) also
writes `out/formal-methods-theories.zip`, which the build copies to the site.

## Updating to a new Isabelle release

1. Install the new release and point `ISABELLE_TOOL` at it; change `VERSION` in `tools/isa.py`.
2. `python3 -I tools/isa.py` and read every reported difference. Most are harmless changes in
   wording; some reveal renamed lemmas or changed behaviour. Fix the Isabelle text where it no longer
   works, then `python3 -I tools/isa.py --update` and re-read the prose around every changed output.
3. Copy the Chinese pages' Isabelle and output blocks from the English ones (they must be identical;
   `node tools/check.mjs` reports every difference).
4. Re-check `notes/FACTS.md` against the new release (download page, installation page, jEdit's
   panels and labels) and update the install section of Module 1.
5. Retake the screenshots with `tools/shots/jedit-shots.sh` and look at each one.
6. Replace "Isabelle2026" in the pages, `tools/build.mjs` and `notes/` with the new name.

## Conventions worth knowing

- Every Isabelle output on the pages comes from `isa.py`; never edit an output block by hand.
- Each module's theory is self-contained (it imports `Main` or a HOL library theory, not other
  modules), so modules can be checked and downloaded independently.
- Figures are drawn in both languages by `figs_NN.py`; captions are in the pages.
- Widgets are plain JavaScript with no dependencies; each registers itself with `FMWidgets.register`
  and gets its strings in both languages from `api.t(en, zh)`.
