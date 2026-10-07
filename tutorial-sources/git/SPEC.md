# Git and version control tutorial series: design spec

Date: 2026-10-07 · Status: draft for review

## 1. Goal and audience

A ten-module, bilingual (English and Simplified Chinese) tutorial series that teaches Git and
version control to **complete beginners**: people who have never used version control. It starts
from why version control exists and ends with learners collaborating on GitHub with confidence.

Learners use **real Git on their own computer, from the command line**. Every command a lesson
shows is executed while the site is built, so the output on the page is what Git actually printed.
Commit graphs are drawn from the real repository at that point.

Success means a learner who finishes the series can:

- explain what version control is for, and how Git records history;
- create repositories, make focused commits with good messages, and inspect and undo changes;
- branch, merge and resolve conflicts;
- work with remotes and GitHub: clone, fetch, pull, push, pull requests and code review;
- tidy history safely (rebase, amend, squash) and recover work that seems lost (reflog); and
- reason about Git's object model well enough to predict what a command will do.

## 2. Relationship to other series

The series stands alone. The DevOps series, which is offline for revision, keeps its own Git
modules (03 Version Control & Git, 04 Collaborating with Git); some overlap is accepted. Module 10
points to the DevOps series for continuous integration once that series is back online. The
series reuses the site's tutorial design and the shared tooling established by the AI, Maths and
MDE series.

## 3. Module outline

Each module takes about **2–3 hours**. It has: learning outcomes; concept sections; **3–6 worked
command sessions** with real output; commit-graph figures where history matters; **6 exercises
with worked solutions**; a **6–8 question self-check quiz**; and further reading.

| # | Title | Key content |
|---|---|---|
| 1 | Why version control? | The problems it solves (copies of files, lost work, collaboration); centralised vs distributed; installing Git on Windows, macOS and Linux; first configuration (name, email, default branch, editor); a terminal survival kit (`pwd`, `ls`, `cd`, `mkdir`) |
| 2 | Your first repository | `init`; the working tree, staging area and repository; `status`, `add`, `commit`; good commit messages; `log`; `.gitignore` |
| 3 | History and undoing | `log` options, `diff` (unstaged, staged, between commits), `show`, `restore`, `commit --amend`, `revert`, looking at an old version safely |
| 4 | Branches | A branch as a movable label; `HEAD`; `switch` and `branch`; the commit graph; fast-forward and three-way merges; deleting branches |
| 5 | Merge conflicts | How conflicts arise; reading conflict markers; resolving, committing and aborting; keeping conflicts small |
| 6 | Remotes | `clone`, `remote`, `fetch`, `pull`, `push`, tracking branches, first with a local repository standing in for a server, then on GitHub (account, authentication, first push) |
| 7 | Collaborating with pull requests | Shared repositories and forks; the feature-branch workflow; pull requests and code review; keeping a branch up to date; issues |
| 8 | Rewriting history and recovering | `rebase` (plain and interactive), squashing, the rule never to rewrite shared history, `reset` (soft, mixed, hard), `stash`, `reflog` |
| 9 | How Git works inside | Blobs, trees and commits; hashes; refs and `HEAD`; why branches are cheap; using `cat-file` to look inside |
| 10 | Capstone: a team project | Two people, two clones and a shared remote build a small project end to end: branches, a conflict, a pull request and a release tag |

Teaching choices:

- The modern commands `git switch` and `git restore` are taught. The older `git checkout`
  equivalents are noted, because learners will meet them online.
- The command line comes first. Module 1 includes a short aside on the Git panels in VS Code and
  GitHub Desktop, so learners recognise them.
- GitHub is the hosting service. Its web pages (creating a repository, pull requests, reviews) are
  explained in text and diagrams rather than screenshots, which go out of date. Steps link to
  GitHub Docs.
- Windows users meet different messages (line-ending warnings, PowerShell output). These get
  callouts where they matter.
- Git output stays in English in both editions. The Chinese edition explains it, and notes that
  Git may print translated messages when the computer's language is Chinese.

## 4. Command sessions

A **session** is a short script of steps that the build runs in a fresh, empty sandbox:

- **Shown commands** appear in the lesson with their real output: `git` commands and a few
  terminal built-ins (`pwd`, `ls`, `cd`, `mkdir`, `cat`).
- **File edits** appear as "edit this file so it reads…" with the new contents. Learners use their
  editor, so nothing depends on a particular shell's syntax.
- **Hidden setup steps** prepare a situation without cluttering the lesson.
- **Identity switches** let the collaboration modules act as two people, *Alex* and *Sam*.
- **Graph snapshots** draw the commit graph at that point as a figure.

Every command declares whether it should succeed or fail; a merge that stops on a conflict, for
example, is declared to fail. The build stops if a command behaves differently from its
declaration.

**Determinism.** Rebuilding must not change the pages, so every session runs in the same
controlled environment:

- fixed names, emails and dates, with a clock that ticks forward for each command, which makes
  commit hashes identical on every build;
- an empty home folder and no system configuration;
- `init.defaultBranch=main`, no colour, no pager, and the English locale;
- sandbox paths rewritten to a fixed, readable path (`/home/alex/recipes`).

The terminal built-ins are implemented by the build itself, so their output is the same on every
operating system.

**Remotes.** A bare repository inside the sandbox stands in for a server. Clone, fetch, push and
pull therefore run for real, with no network access.

**Git version.** `plan/series.json` records the Git version that produced the published output
(currently 2.50.1). The build stops if it finds a different version, and says that updating the
version means reviewing the changed output. Each page's caption names the version.

**Commit graphs.** At a snapshot step, the build reads the repository's commits, parents and refs
and draws an SVG diagram: commits as circles labelled with the short hash and message, branch
labels, and `HEAD`. The same data appears as `git log --graph --oneline` text for screen readers.

## 5. Architecture

Following the MDE series' layout and conventions:

```
tutorial-sources/git/            (not published by MkDocs)
  SPEC.md, PLAN.md, README.md, GLOSSARY.md
  plan/series.json               modules, overview text, Git version
  plan/module_NN.json            outcomes, sessions, study plan, contract
  src/en/module_NN.md            lessons; {{SESSION:id}} and {{GRAPH:id@label}} markers
  src/zh/module_NN.md
  sessions/module_NN/<id>.session  session scripts (a small line-based format)
  tools/                         session runner, sandbox, graph drawing, page templates
  build.mjs, validate.mjs, tests/
docs/tutorials/git/              (published)
  index.html, index_ZH.html, module_NN_EN.html, module_NN_ZH.html, assets/
```

The lessons use the AI series' Markdown dialect (`tutorial-sources/ai/tools/md.mjs`), styles and
page script, without modifying them. The page template, the English/Chinese parity check and the
per-module contract follow the MDE series. Terminal transcripts get a terminal style: a `$` prompt,
the command highlighted, and the output plain. Copying a transcript copies only its commands.
Progress keys start with `git-series:`.

## 6. Quality checks

A module counts as done only when all of these pass:

1. `build.mjs` passes: every session runs with every command behaving as declared, on the recorded
   Git version.
2. A rebuild changes no file, which shows that hashes, dates and paths are deterministic.
3. The English and Chinese editions have the same structure (sections, sessions, figures,
   exercises, quiz answers).
4. `validate.mjs` passes. It checks links and anchors, quiz behaviour, the language switch,
   transcript copy buttons, and layout from 360 to 1280 px.
5. `python -m mkdocs build --strict` succeeds.
6. A content check against the official Git documentation for every command and option taught,
   and against GitHub Docs for every GitHub step.

## 7. Delivery

The first implementation plan covers the shared tooling (sandbox, session runner, graph drawing,
builder, validator, overview pages) and Modules 1 and 2. Module 1 alone hardly exercises the
session runner, while Module 2 exercises real repository work: `init`, `add`, `commit`, `log`
and the first graph. Modules 3–10 then follow the same recipe in order, each complete in both
languages before the next. Nothing is pushed or published until the site owner asks.

## 8. Out of scope

- GUI clients beyond the Module 1 aside; GitLab, Bitbucket and self-hosted servers.
- Submodules, Git LFS, hooks, `bisect`, worktrees and signing; Module 10's further reading points to them.
- Continuous integration (the DevOps series' subject).
- An in-browser Git simulator. *Learn Git Branching* is linked as optional extra practice.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Learners' Git versions word messages differently | Each caption names the Git version; lessons explain the meaning of messages rather than their exact words |
| A different Git version on the build machine (for example on Windows) would change the output | The build stops on a version mismatch; updating the version is a deliberate, reviewed step |
| GitHub's web pages change | Text and diagrams instead of screenshots, with links to GitHub Docs for the current steps |
| Authentication setup (SSH keys, tokens) defeats beginners | Recommend the GitHub CLI's `gh auth login` or Git Credential Manager first; SSH as an alternative |
| Windows and PowerShell differences confuse beginners | Callouts where output or behaviour differs; built-in terminal commands chosen to exist in PowerShell too |
| Chinese terminology is inconsistent | A shared English–Chinese glossary, applied to all modules |
