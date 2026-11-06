# Git and GitHub, Step by Step: plan

A beginner's tutorial series on Git and GitHub, in English and Simplified Chinese, published at
`docs/tutorials/git/`. This file is the contract for writers, translators and reviewers. The build
and the replay checker (`tools/`) enforce the parts of it that can be checked.

## 1. Who it is for and what "easy to follow" means here

Readers have never used Git, may never have used a terminal, and may not be programmers (students
writing a thesis, researchers, designers). The series must work for someone following it alone,
on Windows, macOS or Linux.

Rules that follow from that:

1. **One path.** Where there are many ways to do something, the text shows one, the simplest that
   works on all three systems. Alternatives go in a short note, if at all.
2. **Every command shows what you should see.** Every terminal block gives the command and the
   output a reader gets, produced by actually running it (section 6). The reader compares, line by
   line. Where their output can differ (hashes, dates, paths, version numbers), the text says so
   the first time.
3. **One action per step, then what it means.** A step says what to do (UI labels in **bold**,
   exactly as the screen shows them), shows what you should see, then explains in one or two
   sentences what just happened.
4. **New words are explained when they first appear**, in everyday language, and collected in the
   cheat sheet's glossary. No word is used before it is explained.
5. **Mistakes are expected.** Each lesson has "If something went wrong" boxes with the exact error
   messages a beginner meets at that step and how to fix them. The troubleshooting page collects
   them all.
6. **One running project.** From Lesson 3 to the end the reader builds one thing, a small personal
   web page, and in Lesson 8 it goes online with GitHub Pages. Each lesson starts from where the
   last one ended.
7. **Short lessons.** 15 to 45 minutes each, one topic each, ending with a summary, the commands
   used and a short self-check quiz.
8. **Plain voice.** Short sentences, "you", present tense, no jokes that need a native speaker,
   no idioms that do not translate. British spelling, matching the site.

## 2. Tools the series uses, and why

- **Git** (current release 2.56; anything from 2.28 works, because `init.defaultBranch` is needed).
- **VS Code** as the editor and, through its built-in terminal, as the terminal on every system.
  It removes three beginner problems: it opens the terminal in the project folder, it shows files
  and their changes side by side, and in its terminal Git can sign in to GitHub through the
  browser (`git.terminalAuthentication`, on by default), so macOS and Linux need no extra sign-in
  tool. It also shows clickable buttons to resolve merge conflicts.
- **Git Bash** on Windows, chosen as VS Code's default terminal, so every command and every output
  is the same on all three systems.
- **HTTPS remotes**, not SSH: they work behind firewalls and proxies, and need no keys.
- **Sign-in:** on Windows, Git Credential Manager (installed with Git for Windows) opens a browser
  sign-in on the first push. On macOS and Linux, VS Code's terminal does the same. GitHub CLI
  (`gh auth login`) is given as the fallback for readers who use another terminal.
- **Settings made in Lesson 2:** `user.name`, `user.email` (the GitHub noreply address, so the
  reader's email is not published in a public repository), `init.defaultBranch main`,
  `core.editor "code --wait"`, `pull.rebase false` (so `git pull` merges, as taught, and never
  stops with "Need to specify how to reconcile divergent branches").

Facts about GitHub's website, VS Code and the Git for Windows installer were checked on
6 November 2026 against their sources (GitHub Docs content, `microsoft/vscode`,
`git-for-windows/build-extra`, `cli/cli`); `notes/FACTS.md` lists each fact and its source.

## 3. The running example

- The reader's GitHub username is written `your-username`, their name `Your Name`, their noreply
  email `12345678+your-username@users.noreply.github.com`.
- The project folder is `my-page` in the home folder. Outputs show macOS paths (`/Users/you/...`);
  the text says Windows shows `C:/Users/you/...` and Linux `/home/you/...`.
- Files: `index.html` (the page), `style.css` (colours, from Lesson 4), `README.md` (from
  Lesson 7), `.gitignore` (Lesson 11).
- The GitHub repository is `https://github.com/your-username/my-page`, public, and the page is
  published at `https://your-username.github.io/my-page/`.

## 4. The lessons

| # | Title | Minutes | What the reader does |
|---|---|---|---|
| 1 | What are Git and GitHub? | 15 | No commands. Snapshots, repositories, commits, branches, GitHub; what they will build |
| 2 | Install and set up | 45 | GitHub account, VS Code, Git, terminal; tell Git who you are; five settings |
| 3 | Your first repository | 40 | `git init`, create `index.html`, `status`, `add`, `commit`, `log`; the three areas |
| 4 | Saving changes and looking back | 40 | Edit, `diff`, commit again, add `style.css`, `add .`, `log --oneline`, `show`, `restore` |
| 5 | Branches: try ideas safely | 40 | `branch`, `switch -c`, switch back and forth, fast-forward merge, a merge commit, `branch -d` |
| 6 | Merge conflicts, calmly | 30 | Make a conflict on purpose, read the markers, resolve in VS Code, `merge --abort` |
| 7 | Put your project on GitHub | 40 | Create an empty repository, `remote add`, sign in, `push -u`, README, `push` |
| 8 | Publish your page with GitHub Pages | 15 | Settings, Pages, deploy from `main`; the page is online; update it with a push |
| 9 | Working from two places: pull, push, clone | 40 | Edit on GitHub and `pull`; a rejected push, `pull` then `push`; `clone` a second copy |
| 10 | Pull requests | 40 | Branch, `push -u`, open a pull request, review, merge on GitHub, tidy up locally; collaborators and forks |
| 11 | Undo and fix mistakes | 40 | Recipes: `restore`, `restore --staged`, `commit --amend`, `revert`, `reset --soft`, `.gitignore`, `reflog` |

Plus three pages that are not numbered: the series index, the **cheat sheet** (commands by task,
the daily routine, the glossary) and **troubleshooting** (error messages in the order a beginner
meets them, each with what it means and how to fix it).

Every lesson page has: the hero (number, title, one-line lead, time, what you need first), an "In
this lesson" box, the sections, "What you learned", "Commands in this lesson", a quiz of 3 to 5
questions with explanations, a "Mark this lesson as done" box, and links to the previous and next
lessons.

## 5. How the text is written down (the Markdown dialect)

Sources are `src/en/lesson_NN.md` and `src/zh/lesson_NN.md` (plus `index.md`, `cheatsheet.md`,
`troubleshooting.md`), with a front-matter block:

```
---
title: Your first repository
lead: Create a project folder, turn it into a Git repository and save your first snapshot.
minutes: 40
needs: Lesson 2 (Git installed and set up)
goals:
  - Turn a folder into a Git repository with `git init`
  - ...
---
```

Sections are `## Title {#id}`. Inside them:

- ` ```terminal ` — a terminal session. Lines starting with `$ ` are commands (the reader types
  what follows `$ `); the lines after a command, up to the next `$ ` line, are its output. The
  page shows a copy button that copies the commands only. ` ```terminal norun ` marks a block the
  checker does not run (OS-specific steps, `gh auth login`, `code .`). ` ```terminal nocopy `
  shows no copy button, for commands the reader must type with their own details (their name
  and email, their GitHub address).
- ` ```file index.html ` — the whole content of a file, as the reader should make it. The checker
  writes it into the project; the page highlights the lines that changed since the previous
  version of the same file on that page (or earlier lessons), so the reader sees what to edit.
  ` ```file index.html norun ` shows a file without writing it.
- `<!-- replay: ... -->` — commands the checker runs but the page does not show, to stand in for
  something the reader does by hand on GitHub's website (section 6). One shell command per line.
- `::: where github` / `::: where vscode` / `::: where browser` — a box for steps done outside the
  terminal, labelled "On GitHub", "In VS Code", "In your browser".
- `::: trouble` — a collapsed "If something went wrong" box.
- `::: note`, `::: tip`, `::: pitfall` ("Watch out"), `::: keyidea`, `::: analogy` — callouts.
- `:::: tabs` with `::: tab Windows` / `::: tab macOS` / `::: tab Linux` inside — OS tabs
  (the outer fence has four colons). The page opens the reader's own system first.
- `::: check` + `::: answer` — a quick question inside the text.
- ` ```quiz ` — the end-of-lesson quiz, in the AI series' format (`? question`, `- [ ]`, `- [x]`,
  `> explanation`).
- `::: figure id=fig-NN-k` — a figure from `src/figures/<lang>/fig-NN-k.svg`, caption inside.
- `::: widget name=...` — an interactive demo from `src/widgets/`.

## 6. Every output is real: the replay checker

`tools/replay.py` runs every command of Lessons 2 to 11 in order, in a sandbox, and compares each
output with the text. It is what writes the outputs: `--update` replaces each terminal block's
output with the real one.

- The sandbox has its own home folder (shown as `/Users/you`), its own global Git config, a fixed
  clock (each command one minute after the last, from 2 November 2026, 10:00 UTC) and a fixed
  name and email, so commit hashes are the same on every run.
- GitHub is played by bare repositories in the sandbox. A URL rewrite sends
  `https://github.com/...` there, so the commands in the text are the commands a reader types, and
  outputs show the GitHub URL. A server hook prints the messages GitHub adds to a push (the
  "Create a pull request" hint). What the reader does on GitHub's website (create a repository,
  edit a file, merge a pull request) is done by `<!-- replay: -->` steps with helper commands
  (`gh-new-repo`, `gh-web-edit`, `gh-merge-pr`, `gh-delete-branch`), committing as GitHub does.
- Outputs are compared after normalising what differs from run to run or machine to machine
  (transfer speeds). The text keeps one realistic value.
- The sandbox runs the Git installed on the build machine (2.43). Messages that changed between
  2.43 and 2.56 were found by comparing the two versions' source and are rewritten to 2.56's
  wording by `tools/git256.py`, so the text matches the Git readers install today
  (`notes/FACTS.md`, "Git messages").

## 7. Figures

SVG, drawn by `src/figures/_gen/figs.py` in one style, in English and Chinese. Planned:

| Id | Lesson | Shows |
|---|---|---|
| fig-01-1 | 1 | Files named final, final2, final-really-final, against one folder with a history of snapshots |
| fig-01-2 | 1 | Git on your computer, GitHub on the internet, push and pull between them |
| fig-03-1 | 3 | The three areas: working folder, staging area, repository; `git add` and `git commit` |
| fig-04-1 | 4 | Commits as a chain of snapshots, each with a hash and a message; `main` and `HEAD` |
| fig-04-2 | 4 | How to read `git diff`: lines removed and added |
| fig-05-1 | 5 | A branch is a label: `main` and `dark-theme` pointing at commits, `HEAD` on the current one |
| fig-05-2 | 5 | Fast-forward merge against a merge commit |
| fig-06-1 | 6 | Anatomy of a conflict: the three marker lines and the two versions |
| fig-07-1 | 7 | Your computer and GitHub: `origin`, `main` and `origin/main`, `push` |
| fig-07-2 | 7 | Sketch of GitHub's "Create a new repository" form, with what to fill in |
| fig-08-1 | 8 | Sketch of the Pages settings: Deploy from a branch, main, / (root), Save |
| fig-09-1 | 9 | The daily routine: pull, work, add, commit, push |
| fig-09-2 | 9 | A rejected push: both sides have new commits; pull merges them; push succeeds |
| fig-10-1 | 10 | The pull request flow: branch, push, open, review, merge, tidy up |
| fig-11-1 | 11 | Which undo to use: a decision chart |

## 8. Translation

`TRANSLATION.md` of the AI series applies, with these additions: commands, outputs, file
contents, URLs and UI labels of English-only software stay as they are; UI labels are given in
English (as the reader's screen shows them if their software is in English) with a Chinese gloss
the first time, e.g. **New repository**（新建仓库）. Git's own messages stay in English, with a
note in Lesson 2 that a Chinese system may show some of them in Chinese. Terminal and file blocks
must be identical to the English; the checker compares them.

## 9. Publishing

`node tools/build.mjs --out ../../docs/tutorials/git` writes `index.html`, `index_ZH.html`,
`lesson_NN_EN.html`, `lesson_NN_ZH.html`, `cheatsheet_EN.html`, `troubleshooting_EN.html` (and
`_ZH`), and `assets/`. The card on `docs/tutorials/index.md` links to `git/index.html`.
