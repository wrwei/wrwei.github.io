# Technical review: Lessons 1 to 6 (English sources)

Reviewed on 6 November 2026 against `PLAN.md`, `notes/FACTS.md`, the Git v2.56.0 source, and Git 2.43
on the build machine (to run small cases). Where FACTS.md does not cover something, I read the
upstream sources FACTS.md names, fetched today from raw.githubusercontent.com: `github/docs` (`main`),
`microsoft/vscode` (`main`), `git-for-windows/build-extra` (`main`), plus
`trifectatechfoundation/sudo-rs` (`main`). I did not question the outputs themselves. I did not
edit any lesson file.

Severity: **error** = wrong, or an instruction that fails as written; **misleading** = true in this
case but teaches a wrong rule, or contradicts another page; **minor** = small inaccuracy, gap, or
a claim not covered by FACTS.md.

## Issues

### lesson_01.md

- **lesson_01.md:35** — minor — "you tell Git to take a **snapshot** of everything in the folder".
  A commit holds only what you staged with `git add`, and Lesson 3 ("Choose what goes into the
  snapshot") and Lesson 11 (`.gitignore`) say so. Fix: "you tell Git to take a **snapshot** of the
  files in the folder, with a short message ...".

- **lesson_01.md:36** (also lesson_03.md:291 "Every commit, forever"; fig-03-1 "every commit, kept
  for good") — minor — "Git keeps every snapshot, forever." Lesson 5 (`git branch -D` "throw that
  work away") and Lesson 11 (`commit --amend`, `reset --soft`) drop commits from the history, and Git
  later deletes commits that nothing points to. Fix: "Git keeps every snapshot you save, so you can
  always go back to it." In the Lesson 3 table: "Every commit you made".

- **lesson_01.md:74-75** — minor — "what you learn here works with all of them". The Git commands
  do. The website steps in Lessons 7 to 10 (GitHub Pages, pull requests) belong to GitHub; GitLab,
  for example, calls pull requests "merge requests". Fix: "the Git you learn here works with all of
  them; only their websites look different."

### lesson_02.md

- **lesson_02.md:35-37** — minor (goes beyond FACTS.md) — "GitHub asks you to solve a small puzzle
  and sends a code to your email address" and "If GitHub asks you to choose a plan". FACTS.md and its
  source (`creating-an-account-on-github.md`) only say "Follow the prompts" and "you'll be asked to
  verify your email address". The docs' verification email has a link, not a code
  (`verifying-your-email-address.md`). Fix: "Type your email address, a password and a
  **username**, and follow the prompts. GitHub asks you to verify your email address: follow the
  instructions in the email it sends you." Item 3 is hedged and harmless, but it is also not in
  FACTS.md.

- **lesson_02.md:41-42** — minor — "in Lesson 8 your web page will be at `your-username.github.io`".
  The series publishes a project site at `https://your-username.github.io/my-page/` (lesson_01.md:99,
  lesson_08.md:20). Fix: "... your web page will be at `your-username.github.io/my-page/`."

- **lesson_02.md:51, 54-55** — minor — (a) "**I did not get the email with the code.**" has the same
  problem as the entry for lines 35-37. Fix: "**I did not get GitHub's email.**" (b) The two quoted
  messages and the advice are real: they are in github/docs `creating-an-account-on-github.md`,
  "Troubleshooting signup errors". But they are not in FACTS.md; add them there. The same page also
  says, for "This email can't be used", to "try a different email address or email domain". Add:
  "For "This email can't be used", also try another email address."

- **lesson_02.md:64, 71-72, 90, 100-106, 122, 165, 234; lesson_03.md:21-22, 89, 125, 148-149;
  lesson_04.md:28, 102-103, 108; lesson_05.md:42** — minor (goes beyond FACTS.md) — These UI
  details are not in FACTS.md: the installer page "Select Additional Tasks"; dragging VS Code to
  Applications; **File** > **Auto Save**; the installer's **Next**/**Install**/**Finish** buttons;
  the macOS **Install** dialog; the bin icon; where GitHub shows the noreply address; the OS
  dialogs' **New Folder**/**Open**/**Select Folder**; VS Code hiding `.git`; **New File...**;
  **Reveal in File Explorer**/**Reveal in Finder**/**Open Containing Folder**; **Open Recent**;
  **Source Control** and "Changes"; the dot on an unsaved tab; the branch in the status bar. As far
  as I know all are correct. I confirmed these in `microsoft/vscode`: Auto Save
  (`files/browser/fileActions.contribution.ts`, "A&&uto Save"); the Reveal labels
  (`files/electron-browser/fileActions.contribution.ts`); `.git` hidden (`files.exclude` default in
  `files.contribution.ts`). Add them to FACTS.md with their sources.

- **lesson_02.md:79-84** — error — `$ sudo apt install ./code_*.deb` works only in the folder the
  file was downloaded to. A new terminal starts in the home folder, so `./code_*.deb` matches nothing
  and apt fails. The Linux tab also never says how to open a terminal (Step 4 comes later). The
  password note ("Nothing appears ...") comes only in Step 3, after this first `sudo`. Fix: "...
  or install it from a terminal (on Ubuntu, press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd>). Go
  to the folder you downloaded it to, then install it, and type your password when asked:" with
  `$ cd ~/Downloads` and `$ sudo apt install ./code_*.deb`.

- **lesson_02.md:128-141** — minor — There are three gaps. (a) The Linux tab does not say how to
  open a terminal. (b) `apt install git` asks "Do you want to continue? [Y/n]" when it installs extra
  packages (git-man, liberror-perl), and `dnf install git` asks "Is this ok [y/N]". With dnf, pressing
  <kbd>Enter</kbd> means **no**. (c) "Nothing appears on the screen while you type it" is no longer
  always true. sudo-rs is Ubuntu's default `sudo` since 25.10, and since 0.2.13 (10 March 2026) it
  shows a `*` per character (CHANGELOG: "`Defaults pwfeedback` is now on by default!"). Fix: "Open a
  terminal (on Ubuntu, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd>) and use your system's package
  manager. ... If apt asks "Do you want to continue? [Y/n]", press <kbd>Enter</kbd>; if dnf asks "Is
  this ok [y/N]", type `y` and press <kbd>Enter</kbd>. Type your password when asked. Nothing, or a
  `*` for each character, appears while you type it; that is normal."

- **lesson_02.md:204-206** — minor — "anything from 2.28 upwards works for this series". Every
  command works from 2.28, but before 2.34 Lesson 5 prints "Merge made by the 'recursive'
  strategy." More importantly, the text gives no way forward for an older Git. Ubuntu 20.04's
  packaged Git is 2.25.1, which ignores `init.defaultBranch`, so Lesson 3 would say `On branch
  master`. Fix:
  add "If yours is older than 2.28, update Git before you go on: Lesson 3 needs it."

- **lesson_02.md:209-211** — error — "On Windows and Linux, paste into VS Code's terminal with
  <kbd>Ctrl</kbd>+<kbd>V</kbd>". On Linux, VS Code binds terminal paste to
  <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> only
  (`terminalContrib/clipboard/browser/terminal.clipboard.contribution.ts`: `linux: { primary:
  CtrlCmd | Shift | KeyV }`). <kbd>Ctrl</kbd>+<kbd>V</kbd> reaches bash as `^V`, and nothing is
  pasted. Fix: "On Windows, paste into VS Code's terminal with <kbd>Ctrl</kbd>+<kbd>V</kbd>; on
  Linux, with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>; on a Mac, with
  <kbd>Cmd</kbd>+<kbd>V</kbd>."

- **lesson_02.md:219** — minor — "or I see a `>` prompt". On macOS, VS Code's terminal runs zsh,
  and its continuation prompt for an open `"` is `dquote>`. A missing closing quote is likely in this
  very lesson (`"Your Name"`). Fix: "or I see a `>` prompt (`dquote>` on a Mac)".

- **lesson_02.md:234** — minor — "Tick **Keep my email addresses private**." FACTS.md says the box's
  default state is unknown. If the box is already ticked, a reader who "ticks" it unticks it. Fix:
  "Make sure **Keep my email addresses private** is ticked (tick it if it is not)." The next sentence
  ("The text under it shows your private address") is not in FACTS.md either; the docs give only the
  address format.

- **lesson_02.md:300** — minor — "**The list is empty, or a line is missing.**" With no settings
  saved, `git config --global --list` does not print an empty list. It fails with `fatal: unable to
  read config file '/Users/you/.gitconfig': No such file or directory` (builtin/config.c
  `die_errno(_("unable to read config file '%s'"))`; reproduced with Git 2.43). Fix: "**`fatal:
  unable to read config file '.../.gitconfig': No such file or directory`, or a line is missing.**
  Some or all of your settings were not saved. Type the missing commands again from Step 5 or
  Step 6."

### lesson_03.md

- **lesson_03.md:20-21** — minor — "go to your home folder ... click **New Folder**". The macOS Open
  dialog does not list the home folder in its sidebar by default. Windows readers often do not know
  where their home folder is. The button reads **New folder** on Windows and is a folder icon
  ("Create Folder") in GNOME's dialog. Fix: "go to your home folder (the folder with your user name;
  on Windows `C:\Users\` and your name; on a Mac, press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd>)
  ... click **New Folder** (on Windows **New folder**; on Linux, the folder icon with a plus)".

- **lesson_03.md:74** — minor — On Windows, `git init` prints `Initialized empty Git repository in
  C:/Users/you/my-page/.git/`. That looks different from `pwd`'s `/c/Users/you/my-page` (line 42), so
  the trouble box at line 115 ("The path ... is not your `my-page` folder") can raise a false alarm.
  PLAN §3 asks the text to mention the Windows form. Fix after the block: "On Windows the path is
  written `C:/Users/you/my-page/.git/`."

- **lesson_03.md:84-86** — minor — Git Bash shows different `ls -a` output. Git for Windows defines
  `alias ls='ls -F --color=auto --show-control-chars'` (build-extra `git-extra/aliases.sh`, loaded
  because VS Code starts Git Bash with `--login -i`, `platform/terminal/node/terminalProfiles.ts`).
  Windows readers therefore see `./  ../  .git/`, which conflicts with "Everything else should match"
  (lesson_01.md:124). Fix: after the block, "(In Git Bash on Windows, folder names end in `/`:
  `./  ../  .git/`.)"

- **lesson_03.md:126** — minor — "Or use **File** > **New File...**." When you type a name there,
  VS Code opens a **Create File** save dialog first (`files/browser/fileCommands.ts`,
  `NEW_FILE_COMMAND_ID` → `showSaveDialog`). So step 2 ("press Enter. The file opens in the editor")
  does not describe this route. Fix: delete the sentence (PLAN rule 1, one path), or add "and click
  **Create File** in the window that appears".

- **lesson_03.md:148-150** (affects 154-165 and lesson_04.md:169-205) — misleading — On a Mac,
  "Reveal in Finder" opens `my-page` in Finder. Lesson 11:120-121 itself says "macOS creates
  [`.DS_Store`] files in every folder you open in Finder". VS Code hides the file (`files.exclude`
  default includes `**/.DS_Store`), but `git status` lists it as untracked, so the reader's output
  stops matching here. In Lesson 4, `git add .` then commits it ("3 files changed"), and Lesson 7
  publishes it. Fix: add a macOS step to Lesson 2, Step 6 (a macOS tab, `norun`): `$ mkdir -p
  ~/.config/git` and `$ echo .DS_Store >> ~/.config/git/ignore`, which Git reads with no setting
  (the default `core.excludesFile`). Or add a note here: "On a Mac, Finder may leave a hidden file
  called `.DS_Store` in the folder. If `git status` lists it, do not add it; Lesson 11 shows how to
  make Git ignore it."

- **lesson_03.md:297-299** (widget, `src/widgets/git-playground.js:90`) — minor — The `git status`
  texts are exact; I checked all seven, including staged-then-edited, with Git. But after
  `$ git commit -m "..."` without `git add`, the widget prints "Nothing to commit: run git add
  first." in the same terminal box, as if Git had printed it. Git prints the status followed by
  `nothing added to commit but untracked files present (use "git add" to track)`, the message this
  lesson's trouble box (250) and quiz (328) quote. Once there is a commit, Git prints `no changes
  added to commit (use "git add" and/or "git commit -a")` or `nothing to commit, working tree
  clean`. Fix in `act('commit')`: print the status text plus that last line, chosen by
  `statusKey()` (`new_untracked`, `modified`, `clean`).

### lesson_04.md

- **lesson_04.md:89-93** (fig-04-2, `src/figures/_gen/figs.py:228-246`) — minor — The figure is not
  the diff above it, and Git would not print it. It shows Lesson 6's heading change against blob
  7baeae6 as `index 7baeae6..1f0c2d4`, `@@ -6,5 +6,5 @@`, starting at `</head>` with four lines per
  side, labelled "where: around line 6". For that change Git prints `index 7baeae6..8140beb` and
  `@@ -5,7 +5,7 @@`, starting at `<title>` (three lines of context; checked with Git). The text next
  to the figure says "around line 7". Fix: draw this page's own diff (`index 800ba6d..7baeae6`,
  `@@ -7,5 +7,6 @@`, one `+` line). If a `-` line is wanted, use the rows of a real `git diff` and
  the label "around line 5".

- **lesson_04.md:167** — minor — "the heading is blue and the text is centred". `max-width: 40em;
  margin: 2em auto` centres the column, and the text inside stays left-aligned; on a narrow window
  nothing moves. Fix: "the heading is blue, and the text sits in a column in the middle of the
  window."

- **lesson_04.md:295, 307, 331, 341** — misleading — "`git restore` puts a file back the way it was
  in your last commit"; "throws your uncommitted changes in that file away"; "throws away
  uncommitted changes to a file"; "Discards uncommitted changes to a file". `git restore FILE`
  restores the file from the staging area: "By default, if `--staged` is given, the contents are
  restored from `HEAD`, otherwise from the index" (Documentation/git-restore.adoc). Changes already
  added with `git add` survive, and the file goes back to its staged version, not the last commit.
  The demo here is right, because nothing is staged. But the rule is stated wrongly, and Lesson 3's
  widget invites the staged-then-edited state. Fix:
  - 295: "`git restore` throws away the changes you have not added with `git add`. Here nothing is
    staged, so the file goes back to how it was in your last commit."
  - 307: "`git restore` throws those changes away for good."
  - 331: "`git restore FILE` throws away changes to a file that you have not staged. They cannot be
    recovered."
  - 341: "Discards changes to a file that are not staged".
  - lesson_11.md:32 and cheatsheet.md:87 repeat the "last commit" wording.

### lesson_05.md

- **lesson_05.md:133-136** — minor — The box covers only the refusal. The likelier slip in this
  lesson does not fail at all: you edit `style.css` and switch before committing. The change comes
  along, the terminal shows `M	style.css` and then `Switched to branch 'main'` (checked with Git in
  a terminal), and the page stays dark on `main`, contradicting line 103. Fix: add "**`git switch`
  printed `M` and a file name (`M	style.css`) before "Switched to branch".** You had not committed
  that change, so it came with you. Switch back (`git switch dark-theme`), then `git add` and `git
  commit` it there."

- **lesson_05.md:328-331** — error — "Git opened the editor Vim instead of VS Code (the `core.editor`
  setting from Lesson 2 is missing, or VS Code's `code` command cannot be found)". When `core.editor`
  is `code --wait` and `code` is missing, Git does not fall back to Vim. The shell reports that
  `code` is not found, and Git stops with `error: there was a problem with the editor 'code --wait'`
  and `Not committing merge; use 'git commit' to complete the merge.` (editor.c
  `launch_specified_editor`; builtin/merge.c `abort_commit`). Vim opens only when no editor is set,
  which is what troubleshooting.md:42 says. There are two more gaps:
  - On Linux the fallback is not Vim. Ubuntu's Git falls back to `editor`, which is nano (`git var
    GIT_EDITOR` prints `editor` on the Ubuntu 24.04 build machine), and Fedora sets `EDITOR=nano`.
  - `:wq` typed in Vim's insert mode only adds text.

  Fix: "**The terminal filled with a strange screen with `~` down the left side.** Git opened the
  editor Vim, because no editor is set (the `core.editor` setting from Lesson 2 is missing). Press
  <kbd>Esc</kbd>, type `:wq` and press <kbd>Enter</kbd> to accept the message and finish the merge.
  (On Linux it may be nano instead, with `^X Exit` at the bottom: press
  <kbd>Ctrl</kbd>+<kbd>X</kbd>.) Then set the editor: `git config --global core.editor "code
  --wait"`." Add a second entry: "**`error: there was a problem with the editor 'code --wait'`.**
  The terminal cannot find VS Code's `code` command (Lesson 2, Step 2). The merge is not finished.
  Once `code` works, run `git commit` to finish it."

- **lesson_05.md:392** — misleading — The quiz explanation says "Git refuses `-d` if the commits are
  not merged anywhere". `-d` checks the branch you are on, or the branch's upstream if it has one
  (builtin/branch.c `branch_merged`). A branch merged into some other branch, but not into yours, is
  still refused. The explanation also contradicts the trouble box at lines 183-184. Fix: "Deleting a
  branch removes only the label. Git refuses `-d` if the branch's commits are not in the branch you
  are on, so you cannot lose them by accident."

### lesson_06.md

- **lesson_06.md:248-250** — minor — "A forgotten `=======` ends up in your page. In VS Code, search
  the file for `<<<<<<<`". That search does not find a forgotten `=======` or `>>>>>>>` on its own.
  Fix: "In VS Code, search the file (<kbd>Ctrl</kbd>+<kbd>F</kbd>, or <kbd>Cmd</kbd>+<kbd>F</kbd> on a
  Mac) for `<<<<<<<`, `=======` and `>>>>>>>`."

- **lesson_06.md:258-260** — minor — `$ git merge --abort` appears as a command although no merge is
  in progress. Lesson 1 tells readers to type every command, and typing this one now gives
  `fatal: There is no merge to abort (MERGE_HEAD missing).` (builtin/merge.c:1428). Fix, before the
  block: "You have no merge in progress now, so there is nothing to try here. This is for next
  time:"

- **lesson_06.md:265-267** — minor — Both quoted messages are real (builtin/checkout.c:1632, `git
  switch` only; advice.c:209). There are two gaps:
  - Git 2.56 follows the first message with `Consider "git merge --quit" or "git worktree add".`, and
    a beginner may try `--quit`, which forgets the merge but leaves the half-merged files.
  - After `git add` but before `git commit`, `git merge` says `fatal: You have not concluded your
    merge (MERGE_HEAD exists).` instead (builtin/merge.c:1481).

  Fix: "**`fatal: cannot switch branch while merging`**, `error: Merging is not possible because you
  have unmerged files`, or `fatal: You have not concluded your merge (MERGE_HEAD exists)`. A merge is
  still in progress. Finish it (fix, `git add`, `git commit`) or abort it with `git merge --abort`.
  Do not use `git merge --quit`, which Git suggests: it leaves the half-finished merge in your
  files."

- **lesson_06.md:269-270** — minor — "The markers were committed by mistake. Remove them from the
  file, then `git add` and `git commit` again." The browser shows the file on disk, so markers there
  only mean they are still in the file; the merge may not be finished yet. If the merge was already
  committed, a plain `git commit` opens an empty message tab. Fix: "**The page shows `<<<<<<< HEAD`
  in the browser.** The marker lines are still in the file. Remove them, then `git add index.html`.
  If the merge is still in progress, `git commit` finishes it. If you already committed the merge,
  save the fix as a new commit: `git commit -m "Remove conflict markers"`."

### Outside lessons 1 to 6 (found while cross-checking)

- **troubleshooting.md:43-44** — error — "To give up instead, type `:q!`". That works for a normal
  commit, whose message starts empty. For a merge, the message is already filled in (`Merge branch
  '...'`), so quitting without saving keeps it, and the merge commit is made. The replay does exactly
  this with `GIT_EDITOR=true`. Fix: "To give up on a commit, type `:q!` and press
  <kbd>Enter</kbd>. To stop a merge, type `:cq` and press <kbd>Enter</kbd>, then run `git merge
  --abort`." Also mention nano, as in the lesson_05.md:328-331 entry.
- **lesson_11.md:32, cheatsheet.md:87** — misleading — Both repeat the `git restore` "last commit"
  rule; see the lesson_04.md:295 entry.

## Checked and found correct

- **Quoted Git messages** in the trouble boxes of Lessons 3 to 6 match the v2.56.0 source word for
  word:
  - `Reinitialized existing Git repository` (setup.c)
  - `pathspec '...' did not match any files` (builtin/add.c)
  - `Author identity unknown` and `*** Please tell me who you are.` (ident.c)
  - `nothing added to commit` (wt-status.c)
  - `ambiguous argument '...': unknown revision or path not in the working tree.` (setup.c)
  - `Your local changes to the following files would be overwritten by checkout` (unpack-trees.c;
    `git switch` uses the "checkout" messages)
  - `a branch named '...' already exists` (branch.c)
  - `the branch '...' is not fully merged`, with no full stop in 2.56 (builtin/branch.c)
  - `hint: Waiting for your editor to close the file...` (editor.c)
  - `cannot switch branch while merging` and `Merging is not possible because you have unmerged
    files.`

  The fixes in those boxes are right, apart from the entries above.
- **The merge editor step in Lesson 5 (lines 285-289)** is described correctly:
  - `git merge` opens the editor only when stdin and stdout are a terminal (`default_edit_option`),
    on `.git/MERGE_MSG`.
  - "Auto-merging" prints before the editor opens. "Merge made by the 'ort' strategy." and the
    diffstat print after it closes (`finish_automerge`).
  - The waiting hint is erased when the editor closes.

  Lesson 6's `git commit` opens a tab with `Merge branch 'new-heading'` already filled in.
- **Prose against the outputs next to it:**
  - The quoted hashes are right (`c50e3a0`, `358630b`, and every one in brackets).
  - Counts: "eleven new lines" = 11; 13 = 12 + 1; three colours = 3+/3−; five hobby lines; "four
    shared commits"; `-4` → four commits.
  - "`@@ -7,5 +7,6 @@` ... around line 7" and "the second hint" are right.
  - The dates are right: 4 Nov 2026 is a Wednesday, 5 Nov a Thursday.
  - The hint wording matches the outputs.
- **What the reader has at the start of each lesson:** file contents and the history follow on
  correctly from Lesson 3 to Lesson 6, and Lesson 6 ends in the state Lesson 7 starts from. Lesson 1's
  final-page image and alt text match the page that Lessons 9 to 11 build.
- **Quizzes:** each of the 22 questions has exactly one right answer. The explanations are correct,
  except lesson_05.md:392.
- **Everything taken from FACTS.md is used correctly:**
  - the Git for Windows pages and options, and the order (VS Code installed before Git)
  - the VS Code labels: "Add to PATH (requires shell restart)", **Shell Command: Install 'code'
    command in PATH**, **Terminal: Select Default Profile**, **Terminal** > **New Terminal**,
    **File** > **Open Folder...**, the trust dialog, and the four conflict links
  - the GitHub path to **Emails**, **Keep my email addresses private**, and the noreply format
  - `xcode-select --install` and the apt and dnf commands
- **Lesson 2 settings:** `--global` overrides the `core.editor` that the Windows installer writes to
  the system config, and `git config --list` prints `defaultbranch` in lower case.
- **Widgets:**
  - three-areas: all seven `git status` texts match Git.
  - branch-graph: its messages are real: `Already up to date.`, `Already on 'main'`, `Switched to a
    new branch '...'`, `fatal: a branch named '...' already exists`, the fast-forward lines, and
    `Merge made by the 'ort' strategy.`
  - The labels in the lessons match the buttons.
- **Labels in Lesson 1:** **Mark as done**, **Copy** and "If something went wrong" match
  `tools/build.mjs` and `tools/md.mjs`.
