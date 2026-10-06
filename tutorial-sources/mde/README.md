# Model-Driven Engineering with Eclipse Epsilon: sources

Published pages are built into `docs/tutorials/mde/`. Edit these sources, never the generated HTML.
`SPEC.md` is the design, `PLAN.md` the implementation plan for the shared tooling and Module 1, and
`GLOSSARY.md` the English–Chinese terminology.

## Requirements

- Java 17 or later and Maven 3.9 or later. The first build downloads Eclipse Epsilon 2.8.0 and
  Emfatic 1.1.0 from Maven Central.
- Node 22.2 or later, with the AI tools' packages installed: `npm ci --prefix tutorial-sources/ai/tools`.
- Chrome or Edge for the browser checks, or set `MDE_BROWSER_PATH` to another Chromium-based browser.
- Python with the repository's `requirements.txt` for the MkDocs build.

## Build and check

From the repository root:

```
node --test --test-concurrency=1 "tutorial-sources/mde/tests/*.test.mjs"
node tutorial-sources/mde/build.mjs
node tutorial-sources/mde/validate.mjs
python -m mkdocs build --strict
```

The tests run one file at a time because several of them may need to build the Java runner.

Before publishing, run `node tutorial-sources/mde/live-check.mjs` (or `… live-check.mjs 1` for one
module). It opens every example in the real Epsilon Playground, serving the built bundle from `docs/`
in place of the live site, and compares what the Playground shows with the build's captured output.
It sends each example to the Playground's public service, one every few seconds. After deployment,
`node tutorial-sources/mde/live-check.mjs --published` repeats the check against the live bundle.

## How a module is put together

- `plan/series.json`: all ten modules (titles, summaries, hours, focus) and the overview page text.
- `plan/module_NN.json`: outcomes, study sessions and the module's contract (how many teaching
  examples, exercises and quiz questions it has, and which sections it must contain).
- `src/en/module_NN.md` and `src/zh/module_NN.md`: the lesson, in the AI series' Markdown dialect
  (`tutorial-sources/ai/tools/md.mjs`). A module is published once both files exist.
- `examples/module_NN/<id>/`: one folder per runnable example or exercise solution. Its
  `example.json` has these fields:

  | Field | Meaning |
  |---|---|
  | `id` | `mNN-<slug>`, equal to the folder name |
  | `role` | `example` (default) or `solution` |
  | `title` | `{"en": …, "zh": …}`; the Playground shows the English title |
  | `language` | `eol`, `evl`, `egl`, `egx` or `etl` |
  | `program`, `flexmi`, `emfatic` | file names in the folder (required) |
  | `secondProgram` | EGX only: the template, which must be called `template.egl` |
  | `secondEmfatic` | ETL only: the target metamodel |
  | `outputType`, `outputLanguage` | passed to the Playground (for example `"outputType": "html"`) |
  | `show` | files shown open on the page, in order; the rest go under "More files" (default: the program) |
  | `expect` | `ok` or `error`; with `error`, `expectContains` names text the output must contain |
  | `allowWarnings` | `true` only when the example is about a model that does not conform |

- A line `{{EXAMPLE:<id>}}` in a lesson shows that example: its files, an Open in Playground button
  and the output captured during the build.

## Rules the build enforces

- Every example runs on Epsilon 2.8.0 during the build, and pages show that output. Never type
  expected output by hand.
- The build stops if a run differs from its `example.json`; if a model produces warnings without
  `allowWarnings` (unresolved references, and XML attributes that no class in the metamodel declares); if output contains a file path or a Java object identity; if the English and
  Chinese editions differ in sections, examples, exercises or quiz answers; if a lesson still
  contains a `<!-- BRIEF` note; if the Chinese source is a copy of the English one; or if a module
  breaks its contract.

## Things the tools do not catch

- Flexmi references must use fully qualified names that start at the root element
  (`Alarm.Siren.sound`). Epsilon 2.8.0 does not resolve partial names, although newer versions do,
  so a partial name may work in the Playground and fail in the build.
- Do not name a metamodel class `System` (it clashes with EOL's built-in `System` object) or a
  feature `from` (an ETL keyword).
- Flexmi guesses the meaning of unknown element names instead of always warning: a misspelt tag can
  silently become a different element. It also matches misspelt attribute names to the closest
  feature (`nme` becomes `name`) without a warning. The runner reports only attributes that no class
  in the metamodel declares.
- The Playground does not show model warnings such as unresolved references: its console shows only
  the program's output. Learners see such problems only on the model diagram (a connector with one
  arrow instead of two). For EVL programs the console stays empty and the results appear as notes on
  the validated model diagram. `live-check.mjs` knows both behaviours; lessons must describe them.
- Playground links work only once the bundle is published at
  `https://wrwei.github.io/tutorials/mde/playground/examples.json`.

## Reuse of Dimitris Kolovos's blog

As set out in `SPEC.md` section 2: his ideas and examples are adapted and paraphrased, never
copied; each use carries an inline credit with a link; quotations are at most two sentences, in
quotation marks, with a citation; all example code is written for this series.

Permission for closer reuse: not requested. If the author grants it, record here who granted it,
when, and what it covers.

## Publishing

Publishing means pushing to `main`, which triggers the GitHub Pages deployment. Do it only when the
site owner asks. Run `live-check.mjs` before merging; after the deployment finishes, run
`live-check.mjs --published` and record the result.

## Publication log

- 2026-10-06: Module 1 published (commit 9192b08). Live Playground check: 9/9 examples as the build shows them, before merging (local bundle) and after deployment (published bundle).
