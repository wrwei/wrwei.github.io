# Computer Science Fundamentals: sources

Published pages live in `docs/tutorials/cs/`. This directory holds the bilingual
Module 01 content, lab scripts, course plan and reproducible page builder.

From the repository root, run:

```powershell
python tutorial-sources/cs/build.py
```

The builder executes all three labs, captures their actual output and embeds it
in both language editions. It writes only CS overview pages, Module 01 pages and
downloadable copies of the labs. Edit the source fragments rather than generated
HTML. The course plan in `plan.json` controls the bilingual roadmap and status.

Module 01 is complete in English and Chinese. Modules 02–14 are planned. Add
their source content, generation support and validation before changing their
status to available. Planned cards intentionally have no lesson links.

The course reuses `docs/tutorials/ai/assets/style.css` and `tutorial.js` to match
the established tutorial design and behaviour. CS-specific CSS and the search
demonstration are in `docs/tutorials/cs/assets/`. Retain the imported assets when
moving or publishing the course. Progress keys start with `cs-series:` and are
shared between the two language editions, independently of AI course progress.

Validation should include executing labs, matching captured outputs, checking
local links and fragment targets, exercising the widget and quiz, checking both
languages at desktop/mobile sizes, and building the MkDocs site.

Run `node tutorial-sources/cs/validate.mjs` for browser checks. It uses the existing
AI tools' `puppeteer-core` installation and Chrome or Edge; alternatively set
`CS_BROWSER_PATH` to a Chromium executable. It starts an ephemeral local server,
checks both languages at several widths and saves screenshots in the system
temporary directory. It does not change your normal browser profile.
