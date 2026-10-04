# Computer Science Fundamentals: sources

Published pages live in `docs/tutorials/cs/`. This directory holds all fourteen
bilingual modules, lab scripts, course plan and reproducible page builder.

From the repository root, run:

```powershell
python tutorial-sources/cs/build.py
```

The builder executes all 29 labs, captures their actual output and embeds it in
both language editions. It writes only CS overview pages, lesson pages and
downloadable copies of the labs. Edit sources rather than generated HTML.
Module 01 uses its original HTML source fragments; Modules 02–14 use bilingual
structured content in `lessons/`, rendered by `series.py`. `lesson_data.py`
provides small authoring helpers. `plan.json` controls the titles and course map.

All 14 modules are complete in English and Chinese. Each has a five-hour core
study plan, eight worked exercises, learning checks, guided reading and a quiz.
Module 01 has three labs/eight quiz questions; each remaining module has two
labs/six quiz questions. The series totals 29 labs, 112 exercises and 86 quiz
questions. Practice times are estimates; extensions may take longer.

The course reuses `docs/tutorials/ai/assets/style.css` and `tutorial.js` to match
the established tutorial design and behaviour. CS-specific CSS and the search
demonstrations are in `docs/tutorials/cs/assets/`. Retain the imported assets when
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

Run `python tutorial-sources/cs/validate.py` for links, bilingual parity, build
reproducibility, captured outputs and independent algorithm/capstone checks.

The capstone (`labs/m14_capstone.py`) defaults to a finite integration suite.
For an ongoing local server, generate a random credential and use persistent mode:

```powershell
$env:CS_CATALOGUE_TOKEN = python -c "import secrets; print(secrets.token_urlsafe(32))"
python docs/tutorials/cs/labs/m14_capstone.py --serve --db catalogue.sqlite --port 8000
```

From a second PowerShell terminal with the same credential set, request the books:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/books -Headers @{ Authorization = "Bearer $env:CS_CATALOGUE_TOKEN" }
```

The credential is a local study credential. Persistent mode binds only loopback
and uses a single-threaded teaching HTTP server. It does not implement a public
deployment, password login, TLS termination, token rotation or a return workflow.
The lesson includes a design exercise for returns. Stop the server with Ctrl+C;
restart with the same database file to keep committed state.
