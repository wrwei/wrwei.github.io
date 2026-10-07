# Git and version control: sources

Published pages are built into `docs/tutorials/git/`. Edit these sources, never the generated HTML.
`SPEC.md` is the design, `PLAN.md` the implementation plan for the shared tooling and Modules 1–2,
`PLAN-modules-03-05.md`, `PLAN-modules-06-08.md` and `PLAN-modules-09-10.md` the plans for the later modules, and `GLOSSARY.md`
the English–Chinese terminology.

## Requirements

- Git: exactly the version named in `plan/series.json` ("gitVersion"), because every output on the
  pages comes from it. That is currently Apple's Git on macOS, so build the pages on a Mac; on any
  other version the build stops (see "Changing the Git version").
- Node 22.2 or later, with the AI tools' packages installed: `npm ci --prefix tutorial-sources/ai/tools`.
- Chrome or Edge for the browser checks, or set `GIT_SERIES_BROWSER_PATH` to another Chromium-based browser.
- Python with the repository's `requirements.txt` for the MkDocs build.

## Build and check

From the repository root:

```
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
node tutorial-sources/git/validate.mjs
python -m mkdocs build --strict
```

Rebuilding must not change any file under `docs/tutorials/git`: `git status --short docs/tutorials/git`
should print nothing after a second build.

## How a module is put together

- `plan/series.json`: the Git version, all ten modules and the overview page text.
- `plan/module_NN.json`: outcomes, study sessions and the module's contract (how many teaching
  sessions, exercises and quiz questions it has, and which sections it must contain).
- `src/en/module_NN.md` and `src/zh/module_NN.md`: the lesson, in the AI series' Markdown dialect.
  A module is published once both exist. `{{SESSION:id}}` on a line of its own shows a session;
  `{{GRAPH:id@label}}` shows one of its graph snapshots on its own.
- `sessions/module_NN/mNN-<words>.session`: the command sessions. The format:

  ```
  title: Your first commit
  title-zh: 你的第一次提交
  role: solution            (optional; solutions do not count towards the contract)
  ---
  $ git status              shown command that must succeed
  $! git switch nowhere     shown command that must fail
  > git init                hidden setup command
  >! git merge topic        hidden setup command that must fail (to prepare a conflict, say)
  +file README.md           shown file edit; the contents follow, ending with +end
  # Recipes
  +end
  +hidden notes.txt         hidden file edit, ending with +end
  +end
  @as sam                   act as Sam Lee (alex is the default; each has a folder). The page shows
                            the change of person only before that person's next visible step
  @graph after-merge        draw the commit graph here
  ```

  Commands are `git` or one of the built-ins in the forms the runner implements: `pwd`,
  `ls [-a] [folder]`, `cd [folder]` (also `cd ~` and `cd ..`), `mkdir folder…` and `cat file…`.
  Arguments are plain: no pipes, redirection, wildcards, brackets, variables, `~` or words starting
  with `#`, so that learners can type them in any shell. Paths such as `/home/alex`, `/home/sam` and `/srv/git` (a stand-in server) are what the
  lesson shows; the build maps them to a temporary sandbox.
- `figures/en/fig-NN-MM.svg` and `figures/zh/fig-NN-MM.svg`: hand-drawn diagrams, one per language.

## What the build guarantees

- Every session runs in a fresh sandbox with fixed names, dates, configuration and paths, so its
  output and commit hashes are the same on every build. The sandbox is always the same folder,
  `/tmp/wrwei-git-sessions/<session id>`, created for each run and removed afterwards, because `git pull`
  writes the server's real path into merge messages, and so into commit hashes. A second build or
  test run waits until the first has finished with a session. Each folder records the process that
  holds it, and a folder whose process has exited (after Ctrl-C, say) is reclaimed at once. If a
  build reports that a folder is in use while no other build is running, delete that folder. The sandbox looks like a
  small file system (`/home/alex`, `/home/sam`, `/srv/git`); each person's home folder is their
  `HOME`, and no system or vendor configuration is read. New repositories start on `main` through a
  command-line setting, which `git config --show-origin` would list as "command line", so avoid
  `--show-origin` and `--show-scope` in sessions.
- The build stops if any output shows a path outside the sandbox. Paths in outputs and in graph
  labels appear as the shown paths, and progress lines that a terminal would overwrite appear only
  in their final form.
- The build stops if a command fails or succeeds against its declaration, if the English and
  Chinese editions differ in sections, sessions, graphs, figures, exercises or quiz answers, if a
  lesson still contains a `<!-- BRIEF` note, if the Chinese source is a copy of the English one, or
  if a module breaks its contract.

## Things the tools do not catch

- Learners use other versions of Git and other shells. Lessons explain what messages mean rather
  than relying on exact wording, and point out where PowerShell behaves differently.
- GitHub's web pages change. Describe GitHub steps in words and link to GitHub Docs for details;
  avoid screenshots.
- Git prints messages in Chinese on computers set to Chinese. The Chinese edition says so where
  learners first meet Git's output.

## Changing the Git version

On a machine with a different Git, the build stops and names both versions. To move the series to
that version, set "gitVersion" in `plan/series.json` to the new version line, rebuild, and review
every changed output in `git diff docs/tutorials/git` before committing: messages and hints can
change between versions, and the lesson text must still match them.

## Publishing

Publishing means pushing to `main`, which triggers the GitHub Pages deployment. Do it only when the
site owner asks.
