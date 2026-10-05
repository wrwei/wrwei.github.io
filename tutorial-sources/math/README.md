# Mathematical Foundations tutorial sources

Published pages are built into `docs/tutorials/math/`. Edit these sources rather
than generated HTML. The complete release contains all 32 modules, the optional
algebra refresher, entry diagnostic, Python primer and NumPy preparation in English
and Simplified Chinese. The two capstones include implemented reference projects,
actual outputs and generated diagnostic plots, mathematical defences and rubrics.

## Build

From the repository root:

```powershell
node tutorial-sources/math/tools/figures.mjs
node tutorial-sources/math/build.mjs
node tutorial-sources/math/validate.mjs
python -m mkdocs build --strict
```

Use Python 3.11+ and Node 22+. The builder and browser checks reuse the existing
AI tools' installed Markdown renderer, KaTeX, and Puppeteer dependencies. If they
are absent, install the packages specified in `tutorial-sources/ai/tools/package.json`
using that directory's package workflow. No AI content is built or edited.
The site build requires the root `requirements.txt` environment. Set `MATH_PYTHON`
to an interpreter path if `python` is not the intended lab interpreter.

The numerical branch has a paired NumPy preparation page. Its tested baseline
uses CPython 3.11.8 and NumPy 1.26.4 on a Windows CPU; numerical requirements are
pinned in this folder's `requirements.txt`. The preparation page documents a
separate virtual environment. Modules 01–08 and the Python primer need only
the standard library. Numerical package compatibility is stated for the tested
baseline, rather than assumed for every newer Python release.

The builder executes every distributed lab and captures its actual output. It
renders and validates every mathematical expression with the installed KaTeX
package, copies the CSS/fonts with their licence, and writes both language
editions. Consequently the mathematics remains readable without JavaScript;
scripts add quizzes, local progress, copy controls, and interactive mathematical explorers.
The shared typography/base styles and page behaviour are read from the existing
AI tutorial assets, so retain that series' assets when copying this course.

## Source layout

- `plan/module_NN.json`: bilingual titles, outcomes, prerequisites, sessions,
  activity minutes, and lab filenames.
- `plan/pages.json`: diagnostic and Python primer metadata.
- `src/en/` and `src/zh/`: complete paired Markdown sources.
- `src/figures/en/` and `src/figures/zh/`: original figures with translated labels.
- `labs/module_NN/`, `labs/primer/`, and `labs/numpy_primer/`: standalone Python
  scripts; numerical dependencies are pinned in `requirements.txt`.
- `assets/`: small course-specific CSS and JavaScript additions.
- `tools/figures.mjs`: reproducible vector figure generation.
- `artifacts/`: generated outputs and build records; these are verification
  evidence outside the published documentation.

The Markdown dialect is shared with `tutorial-sources/ai/tools/md.mjs`: explicit
heading anchors, inline/display maths, worked/check/solution containers, figure
references, and quiz fences. `{{LAB:lab1}}` markers embed the downloaded script
and its executed output; published output must never be entered by hand.

Each taught module 01–30 has twelve required exercises, two extensions, nine automatic choice
questions, and one written/self-reviewed question. Automatic scores cover the
nine choice questions only. Language switching preserves session checkboxes and
the written response through independent `math-series:` browser-storage keys.
Capstones 31–32 have four project stages and a saved defence instead of a scored
choice quiz. All three capstone reference scripts are standalone, with exactly
the dataset, sampling and objective conventions stated in the lessons.

## Validation and availability

The builder checks formula syntax, session totals, required content counts, and
missing figures. `validate.mjs` additionally checks local links/anchors, bilingual
structure, downloads and captured outputs, quiz controls, written responses,
composition order/domain cases, prerequisite cycles, route hours, capstone output
parity, generated plots and desktop/mobile layouts. It uses a temporary
HTTP server and a fresh headless browser profile. Set `MATH_BROWSER_PATH` when
Chrome/Edge/Chromium is installed elsewhere.

To validate the complete built site, first run the strict MkDocs build, then set
`MATH_SITE_ROOT` to its output directory before running `validate.mjs`. Without
that variable, validation serves the documentation sources and resolves MkDocs
Markdown destinations for link checks.

When adding a module, write both sources and the complete metadata/labs before
building it. Extend content validation for the new module's contract and verify
the mathematical statements, solutions, and translations. The shared
`docs/tutorials/math/plan.json` keeps all 32 curriculum outlines; the builder only
updates availability and adds published-module status. Planned cards have no
lesson links. Current detailed contracts do not imply that other modules exist.

The original planning overview is retained at `docs/tutorials/math/roadmap.md`.
Keep it and `PLAN.md` consistent with publication status. Avoid adding `index.md`
beside the generated `index.html`: their MkDocs destinations would collide.

Original content and figures are by Ran Wei under CC BY 4.0. Vendored KaTeX
assets retain their MIT licence in `assets/KATEX-LICENSE.txt`.
