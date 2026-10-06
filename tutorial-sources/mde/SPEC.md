# Model-Driven Engineering tutorial series: design spec

Date: 2026-10-06 · Status: draft for review

## 1. Goal and audience

A ten-module, bilingual (English and Simplified Chinese) tutorial series that teaches
Model-Driven Engineering (MDE) to **self-learners and practitioners**: developers and
engineers who are new to MDE. They want the concepts and enough hands-on practice
to use MDE tools on a real problem afterwards.

All tooling is **Eclipse Epsilon**. Hands-on work happens in the browser-based
[Epsilon Playground](https://eclipse.dev/epsilon/playground/), so a learner can run
every example from Module 1 without installing anything. Eclipse itself is
introduced in Module 9.

Success means a learner who finishes the series can:

- explain models, metamodels, conformance and model management in precise terms;
- write a metamodel (Emfatic) and models (Flexmi) for a small domain;
- query (EOL), validate (EVL), transform (ETL) and generate text from (EGL/EGX) those models;
- judge where MDE (and LLM assistance in MDE) helps or does not; and
- set up Epsilon outside the Playground for a real project.

## 2. Reuse of Dimitris Kolovos' blog

Sources: <https://www-users.york.ac.uk/dimitris.kolovos/blog/>.

| Post | Used in | How |
|---|---|---|
| *Model-Driven Engineering Terminology* (2022) | M1, M3 | Core vocabulary: model (descriptive and prescriptive; sketch, blueprint, program), metamodel as abstract syntax, conformance, model elements, textual and graphical syntaxes, modelling and programming languages |
| *Metamodelling with ChatGPT*, Episodes 1–2 (2022) | M2, M8 | The component/port running example and its stepwise evolution; findings on LLM strengths and weaknesses (containment, opposites) |
| *Minimal JHipster JDL Monolith Example* (2021) | M1, M6, M10 | Motivating case of whole-application generation from a textual model; inspiration for the capstone DSL |
| Public lectures playlist | M9 | Further viewing |

Policy:

- The blog has no licence statement. Its ideas and examples are **adapted and
  paraphrased**, not copied. Direct quotations are kept short (at most two sentences),
  are marked as quotations and are cited.
- Every point of reuse carries an inline credit ("Adapted from Dimitris Kolovos,
  *Title* (year)" with a link). The series index has an acknowledgements section
  listing all sources.
- If the author grants permission for closer reuse, the policy can be relaxed; the
  record of that permission goes in `tutorial-sources/mde/README.md`.
- All Epsilon example code is written for this series. The Playground's own CCL
  example and Kolovos' metamodel are credited as inspiration, not copied.

## 3. Running example

A **component-and-connector language**, following Kolovos' post: a `System` contains
`Component`s; components own typed `InPort`s and `OutPort`s (`PortType` enumeration);
`Connector`s join an `OutPort` to an `InPort`. The main model is a small logic circuit,
and a second model (a sensor-processing pipeline) is used for exercises. The
metamodel grows across Modules 2–7. The capstone uses a different domain to test
transfer (section 4, M10).

## 4. Module outline

Each module takes about **3–4 hours of study**. It has: learning outcomes; concept sections;
**4–6 Playground examples**; **6 exercises with worked solutions**; a
**6–8 question self-check quiz**; and further reading.

| # | Title | Epsilon focus | Key content |
|---|---|---|---|
| 1 | What is MDE? | Playground tour | Terminology (Kolovos); why MDE; model management tasks; JHipster as motivation; tour of the Playground panels |
| 2 | Metamodelling | Emfatic / Ecore | Classes, attributes, enums, references, containment (`val`/`ref`), multiplicity, opposites, inheritance, abstract classes; building the component metamodel in the same increments as Kolovos' post |
| 3 | Building and viewing models | Flexmi | XML and YAML flavours, name-based references, nesting, conformance errors, abstract vs concrete syntax, diagrams from Emfatic annotations |
| 4 | Querying models | EOL | Navigation, `Type.all`, collection operations (`select`, `collect`, `exists`, `forAll`, `sortBy`), user and context operations, modifying models |
| 5 | Validating models | EVL | Contexts, constraints vs critiques, guards, messages, dependencies; fixes (explained; interactive only in Eclipse) |
| 6 | Generating code and text | EGL + EGX | Templates, static and dynamic sections, one file per element with EGX, Java/HTML/Graphviz outputs, protected regions (Eclipse) |
| 7 | Model-to-model transformation | ETL | Source and target metamodels, rules, guards, `equivalent()`, lazy and primary rules; components to a graph metamodel |
| 8 | MDE meets LLMs | Emfatic + EVL as checks | Kolovos' findings; LLM drafts, MDE tools verify; generating prompts from models with EGX |
| 9 | From Playground to real projects | Eclipse Epsilon, Java API | Installing Epsilon; Ant/Maven workflows; running Epsilon from Java; non-EMF models (CSV/XML via EMC); pointers to ECL, EML, Flock, EUnit, Picto |
| 10 | Capstone | All of the above | Learners build "MiniJDL", a JHipster-style entity DSL: metamodel, models, validation, generation (SQL DDL, Java, HTML docs) and an ETL transformation to a relational model. The reference solution runs in the Playground and comes with a self-assessment checklist |

Module 8 makes **no live LLM calls**. LLM-drafted artefacts are illustrative drafts written
for the tutorial and are labelled as such. Kolovos' observations are reported with
citation. The Epsilon checks run on those drafts are real and their output is captured.

## 5. Architecture

This follows the conventions of the Maths and CS series.

```
tutorial-sources/mde/            (not published by MkDocs)
  SPEC.md, README.md, PLAN.md, GLOSSARY.md (EN/ZH terminology)
  plan/series.json               module titles (EN/ZH), status, order
  plan/module_NN.json            outcomes, examples, exercises, quiz, reading
  src/en/module_NN.md            English lesson source
  src/zh/module_NN.md            Chinese lesson source
  examples/module_NN/<id>/       one folder per runnable example or solution:
                                 *.emf, *.flexmi, program file(s), example.json
  runner/                        Maven project: runs one example on Epsilon 2.8.0
  build.mjs                      builds pages and Playground bundle
  validate.mjs                   browser and link checks
docs/tutorials/mde/              (published)
  index.html, index_ZH.html
  module_NN_EN.html, module_NN_ZH.html
  assets/                        MDE-specific CSS; shares ../ai/assets/style.css and tutorial.js
  playground/examples.json       all examples, one submenu per module
  playground/module_NN/...       example files referenced by examples.json
  downloads/module_NN.zip        each module's examples, for running in Eclipse (M9)
```

**Lesson rendering.** `build.mjs` renders Markdown with the shared dialect in
`tutorial-sources/ai/tools/md.mjs`. Pages carry the site's CC BY 4.0 notice and footer,
a language switch, and progress tracking under keys prefixed `mde-series:`.

**Playground integration.** Each example becomes an entry in
`playground/examples.json` (fields: `id`, `title`, `language`, `program`,
`secondProgram`, `emfatic`, `secondEmfatic`, `flexmi`, `outputType`,
`outputLanguage`). Its "Open in Playground" button links to
`https://eclipse.dev/epsilon/playground/?examples=https://wrwei.github.io/tutorials/mde/playground/examples.json&<id>`.
The Playground resolves file paths relative to `examples.json`. GitHub Pages sends
`Access-Control-Allow-Origin: *`, so the cross-origin fetch works (checked 2026-10-06).
Example IDs are `mNN-<slug>` and must be unique.

**Example verification.** For every example and code solution, the build calls the Java
runner. The runner parses the Emfatic metamodel(s), loads the Flexmi model(s), runs
the program on Epsilon 2.8.0 (Maven Central: `org.eclipse.epsilon.*` 2.8.0,
`org.eclipse.emfatic.core` 1.1.0) and captures console output and generated text.
The page shows that captured output beneath the code. Outputs are never written by
hand. An example that demonstrates an error declares `"expect": "error"` and the
substring it expects. The build fails if any example behaves differently from its
declaration.

**Overview and site integration.** `index.html` and `index_ZH.html` list the modules
and mark unbuilt ones "Planned". They also hold the acknowledgements. A card is
added to `docs/tutorials/index.md`.

## 6. Quality checks

A module counts as done only when all of these pass:

1. `build.mjs` passes: every example and solution runs on Epsilon 2.8.0 and matches its declared outcome.
2. English and Chinese editions have the same structure (sections, examples, exercises, quiz items).
3. `validate.mjs` passes. It checks local links and anchors, quiz behaviour, the language switch, and layout at desktop and mobile widths in headless Chrome, reusing the AI tools' Puppeteer.
4. `examples.json` is valid, and every file it references exists.
5. `python -m mkdocs build --strict` succeeds.
6. **Live Playground check** (opt-in, networked, rate-limited): open each of the module's Playground links in headless Chrome, run the example and confirm it finishes without error. This catches drift between the Playground's Epsilon version and 2.8.0.
7. Reuse audit: every adaptation of Kolovos' material carries its credit, and no unattributed passage is reproduced.

## 7. Delivery

The first implementation plan covers the shared infrastructure (runner, builder,
validator, Playground bundle, overview pages) and Module 1 from start to finish.
That proves the full pipeline. Modules 2–10 then follow the same recipe in order,
and each is complete in both languages before the next one starts. Nothing is pushed or published until the user asks; publication can happen
in batches, as with the AI series.

## 8. Out of scope

- In-depth model comparison, merging and migration (ECL, EML, Flock), pattern matching (EPL) and EUnit. M9 points to them.
- Building graphical or textual editors (Sirius, Xtext, Eugenia).
- Live LLM calls, and custom interactive widgets beyond the Playground.
- Eclipse screenshots outside Module 9.

## 9. Risks

| Risk | Mitigation |
|---|---|
| The Playground backend (hosted by York) is unavailable | Captured outputs make every page readable without it; per-module zip downloads run in Eclipse |
| The Playground runs a different Epsilon version | Live Playground check (section 6, item 6) before each publication |
| Emfatic `@node`/`@edge` diagram annotations are Playground-specific | Used only for diagrams; the runner ignores them |
| Reuse beyond fair attribution | The policy in section 2; reuse audit before publication |
| Chinese terminology is inconsistent | A shared EN/ZH glossary in `tutorial-sources/mde/GLOSSARY.md`, applied to all modules |
