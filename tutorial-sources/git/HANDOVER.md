# Handover: Git and GitHub, Step by Step

A beginner's tutorial series in eleven lessons, in English and Simplified Chinese, published at
`docs/tutorials/git/` (<https://wrwei.github.io/tutorials/git/>). Read this first, then
`PLAN.md`, which is the design: audience, tools, the running example, the lessons, and the
Markdown conventions.

## Status

All fourteen pages are written in both languages and published (November 2026). Four reviews,
two by beginners following every step on Windows, macOS and Linux and two technical, were applied;
they are in `notes/reviews/`. The replay runs 164 commands, all matching; `tools/check.mjs` reports no
errors; both widgets pass `tools/widget-test.mjs` in both languages.

On 12 November 2026 this series replaced the earlier 10-module "Git and Version Control" series,
which had been published at the same paths (`docs/tutorials/git/`, `tutorial-sources/git/`), at the
site owner's request. That series' pages and sources remain in Git history: see commit `cf0482f`
on `main`.

## Where things are

| Path | What it is |
|---|---|
| `PLAN.md` | The design and the Markdown dialect |
| `notes/FACTS.md` | Every fact about GitHub's website, VS Code, GitHub CLI, the Git for Windows installer and Git's messages, with the source it was checked against |
| `notes/TRANSLATION.md` | Rules and terms for the Chinese edition |
| `notes/reviews/` | The four review reports (beginner and technical, Lessons 1 to 6 and 7 to 11); every finding has been applied or answered in the text |
| `src/en/*.md`, `src/zh/*.md` | The pages: `index`, `lesson_01` to `lesson_11`, `cheatsheet`, `troubleshooting` |
| `src/figures/_gen/figs.py` | Draws every figure, in both languages, into `src/figures/en/` and `src/figures/zh/` |
| `src/images/final-page.png` | The finished web page, shown in Lesson 1 |
| `src/widgets/git-playground.js` | The two interactive demos (Lesson 3: the three areas; Lesson 5: branches) |
| `src/assets/` | Stylesheet and page script |
| `replay/file-states.json` | Written by `tools/replay.py`, read by the build (what each file held before each file block, to highlight the lines to change) |
| `tools/` | Replay, build, checks and screenshots (below) |

## Setting up

```bash
cd tutorial-sources/git
(cd tools && npm install)        # Node 18 or later
```

Python 3.10 or later and Git are needed for the replay. Chromium (or Chrome) is needed for
screenshots and the widget test; set `CHROME_PATH` if it is not at `/opt/pw-browsers/chromium`.

## The tools

| Command | What it does |
|---|---|
| `python3 -I tools/replay.py` | Runs every command of Lessons 2 to 11 in order, in a sandbox, and the troubleshooting page's examples in another; reports every output that differs from the text |
| `python3 -I tools/replay.py --update` | The same, and writes the real outputs into `src/en/`, carrying changed commit hashes into the prose of both languages. Run it twice when a command itself contains a hash |
| `python3 -I tools/git256_audit.py OLD NEW` | Lists output lines whose Git message differs between two Git source trees (see `notes/FACTS.md`) |
| `node tools/check.mjs` | Checks the sources: Chinese pages against English ones, links, figures, front matter |
| `node tools/build.mjs [--out DIR]` | Builds the pages (default `out/git/`) |
| `node tools/widget-test.mjs out/git [--lang zh]` | Clicks through both demos and checks what they print |
| `node tools/shot.mjs PAGE --out shots/NAME` | Screenshots a page or an SVG, and reports page errors |
| `node tools/shot-parts.mjs DIR PAGE "text" ...` | Screenshots the parts of built pages that contain the given texts, to check changes by eye |
| `python3 -I src/figures/_gen/figs.py` | Redraws the figures (figure 4.1 takes its hashes from Lesson 4's replayed output) |

## How outputs stay true

Every terminal output in the lessons and on the troubleshooting page comes from running the
commands. The sandbox has a fixed clock, name and email, so hashes are the same on every run.
GitHub is played by local bare repositories reached through a URL rewrite, with a hook that prints
GitHub's "Create a pull request" hint; steps the reader does on GitHub's website are
`<!-- replay: -->` comments using `gh-new-repo`, `gh-web-edit`, `gh-merge-pr` and
`gh-delete-branch`.

The build machine runs Git 2.43. `tools/git256.py` rewrites the messages that differ in Git 2.56,
and the replay reproduces 2.56's creation of `origin/HEAD` on fetch. When the build machine has a
newer Git, re-run the audit, drop the rules that no longer apply, and re-run
`replay.py --update`.

## Changing a lesson

1. Edit `src/en/lesson_NN.md`. To change what the reader types, change the command; leave its
   output as it is.
2. `python3 -I tools/replay.py --update` (twice if a command contains a hash). Read the outputs
   that changed and make the prose agree.
3. If a hash shown in a figure changed, `python3 -I src/figures/_gen/figs.py`.
4. Make the same change in `src/zh/lesson_NN.md`: copy the changed terminal and file blocks
   exactly (`tools/check.mjs` compares them), and translate the prose, following
   `notes/TRANSLATION.md` (section 6 lists the conventions the Chinese pages settled on).
5. `node tools/check.mjs`, `node tools/build.mjs`, and look at the page.

## Publishing

```bash
node tools/build.mjs --out ../../docs/tutorials/git
```

The card on `docs/tutorials/index.md` links to `git/index.html`. Then, from the repository root,
`mkdocs build` must pass. Pushing to `main` publishes the site.

## Keeping it current

GitHub's website changes. When a reader reports a label that no longer matches, check it against
the GitHub Docs source (`github/docs`, `content/` and `data/reusables/`), update the lesson and
`notes/FACTS.md`, and redraw a figure if it shows that screen (figures 7.2 and 8.1 are sketches of
GitHub's pages).
