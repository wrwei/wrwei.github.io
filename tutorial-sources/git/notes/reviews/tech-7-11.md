# Technical review: Lessons 7 to 11, cheat sheet, troubleshooting

Reviewed 6 November 2026 against PLAN.md, notes/FACTS.md, tools/replay.py and tools/git256.py, the
Git v2.56.0 and v2.43.0 source, and the github/docs, cli/cli and microsoft/vscode files that FACTS.md
was checked against (scratchpad `ghdocs/out/`, `ghcli/`, `vscode/`). Where an entry says "checked",
I reproduced the behaviour with Git 2.43 in a scratch folder. No source file was edited.

Severity: **error** (wrong, or an instruction that fails as written), **misleading**, **unverified**
(a UI claim that FACTS.md does not support), **minor**.

## lesson_07.md

- **lesson_07.md:52-54** — unverified — "Make sure **HTTPS** is selected, and copy the address with the
  copy icon to its right." FACTS.md only says that an empty repository opens the "Quick setup" page. The
  HTTPS/SSH switch and the copy icon are not covered. — Soften: "GitHub shows a page with "Quick setup"
  at the top, and your new repository's address. If the page lets you choose between HTTPS and SSH,
  choose HTTPS. Copy the address. It looks like `https://github.com/your-username/my-page.git`." Or add
  the Quick setup layout to FACTS.md.

- **lesson_07.md:110-111, 115-117, 121-123** — unverified — Several sign-in details go beyond FACTS.md:
  - GCM: "Choose to sign in with your browser ... approve the request". FACTS.md only says "Git will
    prompt you to log in using a browser window". The scratchpad copies of the GCM UI files
    (`gcm/*.axaml`, `*.cs`) are "404: Not Found" pages, so this was never checked.
  - VS Code: "The extension 'GitHub' wants to sign in using GitHub." / **Allow**. This matches
    `confirmLogin` in src/vs/workbench/api/browser/mainThreadAuthentication.ts. But the same function
    shows `provider.confirmation` instead when the provider defines one, and the GitHub authentication
    provider was not checked for that.
  - "click the green button to authorise Visual Studio Code".

  — Check extensions/github-authentication for a `confirmation` override, then add the VS Code
  string to FACTS.md. Fetch GCM's GitHub UI source again. Until both are done, write "approve the
  request" instead of "click the green button to authorise Visual Studio Code".

- **lesson_07.md:137-140** — minor — "Use the browser sign-in above." This does not say how to make
  the sign-in appear. In VS Code's terminal, a password prompt means the terminal was opened without
  VS Code's sign-in helper. — Replace with: "Use the browser sign-in instead: close the terminal (bin
  icon), open a new one with **Terminal** > **New Terminal**, and push again. If Git still asks for a
  password in the terminal, see "Signing in from another terminal" below."

- **lesson_07.md:142-143** — misleading — Under `Repository not found`, the box gives as a cause "or
  you signed in as a different GitHub account". The repository is public. A push made with an account
  that has no write access is refused with a 403: `remote: Permission to your-username/my-page.git
  denied to OTHER-NAME.`, then `The requested URL returned error: 403`. "Repository not found" is what
  GitHub answers for a private repository you cannot see. A reader with the 403 finds no entry
  anywhere in the series. — Delete the clause, and add an entry: "**`Permission to
  your-username/my-page.git denied to ...`**. Git signed in as another GitHub account, the one named
  after "denied to". Delete the saved sign-in for `github.com` (on Windows in **Credential Manager** in
  the Control Panel, on macOS in the **Keychain Access** app). Then push again and sign in as
  `your-username`." The 403 wording is from experience and not in FACTS.md: check it on GitHub before
  you quote it.

- **lesson_07.md:149-151** — minor — After `git pull origin main --allow-unrelated-histories`, the
  project already has GitHub's `README.md` (`# my-page`). So "Create `README.md`" at line 179 is really
  an edit, and the commit output will differ: `1 file changed, 3 insertions(+), 1 deletion(-)`, with no
  `create mode` line. — Append: "Your project now has GitHub's `README.md`. In "Add a README" below,
  replace its content with the one shown."

- **lesson_07.md:153-157** — misleading (privacy) — The box says: "run `git commit --amend
  --reset-author --no-edit` to put it on your last commit, and push again. If older commits have the
  real address too, ask for help, or untick ...". GitHub checks only the newest commit: "each time you
  push to GitHub, we'll check the most recent commit. If the author email on that commit is a private
  email ... we will block the push" (github/docs,
  blocking-command-line-pushes-that-expose-your-personal-email-address). In this series every commit
  since Lesson 3 was made with the same setting. After the amend, the push therefore succeeds, with no
  warning, and publishes the real address in all the older commits. The reader cannot tell whether
  "older commits have the real address", and unticking the box publishes the address for good. —
  Replace from "Set the private address" with: "Set the private address (Lesson 2, Step 5). Then
  check which commits carry your real address: `git log --format="%h %ae"`. If only the last one
  does, run `git commit --amend --reset-author --no-edit` and push again. If older commits do too,
  amending the last one is not enough. GitHub checks only the newest commit, so the push would go
  through and publish your address in the older ones. Ask someone experienced to help you rewrite them
  before you push. (Unticking **Block command line pushes that expose my email** also lets the push
  through, but then your real address is public in those commits for good.)"

- **lesson_07.md:166-167** — unverified — "next to it, your latest commit's message, and how many
  commits there are. Click the number of commits". This is not in FACTS.md. Also, on the repository
  page this bar sits above the file list, not next to it. — Write "above the list, your latest commit's
  message and a link with the number of commits; click it to see your whole history", and add it to
  FACTS.md. Or drop the sentence.

- **lesson_07.md:237-239** — minor (missing step) — "on macOS with `brew install gh`". The series never
  installs Homebrew: Lesson 2 installs Git with `xcode-select --install`. A beginner then gets `command
  not found: brew`. cli/cli `docs/install_macos.md` also offers an installer on the releases page. —
  "Install **GitHub CLI** as described at github.com/cli/cli#installation: on macOS, `brew install gh` if
  you use Homebrew, otherwise the installer from the releases page; on Linux, GitHub's own package
  repositories." Optionally add: "On macOS, a sign-in you made once in VS Code's terminal is kept in the
  keychain and works in Terminal too."

- **lesson_07.md:241-252** — minor — The `gh auth login` output is incomplete compared with the cli/cli
  source that FACTS.md was checked against:
  - pkg/cmd/auth/shared/login_flow.go:264-265 prints `- gh config set -h github.com git_protocol https`
    and `✓ Configured git protocol` between `✓ Authentication complete.` and `✓ Logged in as ...`.
  - pkg/cmd/auth/login/login.go (about line 256) prints `! Did you know that expiring tokens can be
    requested with --expiring? Read more at https://gh.io/gh-expiring-tokens` after the first question.

  — Add the three lines. Or add one sentence: "gh may print a few more lines; what matters is the
  last one, `✓ Logged in as your-username`."

- **lesson_07.md:294** — minor — The quiz explanation says "The opposite, "behind", comes in Lesson 9."
  Lesson 9 never uses the word; only the troubleshooting page does. — "> "Ahead" means you have more
  than GitHub. The opposite, "behind", means GitHub has commits you do not have yet; `git pull`
  (Lesson 9) brings them."

## lesson_08.md

- **lesson_08.md:22-24** — minor — "`index.html` must be at the top level of the branch you publish,
  not in a subfolder". In fact the file must be at the top of the *folder* you publish, which FACTS.md
  says can be `/ (root)` or `/docs`. — "...and `index.html` must be at the top level of the folder you
  publish: here, the top of `main`."

- **lesson_08.md:59-60** — unverified — The run name "pages build and deployment" is not in FACTS.md,
  which only says the site is deployed by a GitHub Actions workflow run. — "Each publication appears
  there as a workflow run, with a green tick when it is done."

- **lesson_08.md:110-111** — error — <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> forces a fresh copy in
  Chrome and Firefox. In Safari, the Mac's default browser, it is "Show Reader"; Safari's reload that
  skips the cache is <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>R</kbd>. — "...<kbd>Ctrl</kbd>+<kbd>F5</kbd> on
  Windows and Linux; on a Mac, <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> (in Safari,
  <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>R</kbd>)." The same fix applies at troubleshooting.md:608-609.

- **lesson_08.md:115** — unverified — The text of the 404 page, "404: There isn't a GitHub Pages site
  here.", is not in FACTS.md. — Check it and add it to FACTS.md, or quote only "404".

- **lesson_08.md:119-121** — minor — "Check that the name in the `<link>` line matches the file's name
  exactly." On Windows and macOS, Git does not notice a rename that only changes upper and lower case.
  A reader who renames the file rather than editing the link sees no change on GitHub. — "Change the
  `<link>` line so that it matches the file's name exactly as GitHub lists it. (On Windows and macOS,
  Git does not notice a rename from `Style.css` to `style.css`.)"

- **lesson_08.md:123-124** — unverified, and no fix — "Settings has no Pages option". This is not in
  FACTS.md. As far as I know it is also wrong: for a private repository on GitHub Free, the **Pages**
  page is there and asks you to upgrade or make the repository public. The box gives the cause but
  not what to do. — "**The Pages settings ask you to upgrade.** The repository is private. On a free
  account, Pages needs a public repository: change the repository's visibility to public in its
  settings, then come back to **Pages**."

- **lesson_08.md:137** — minor — "every push to `main` updates the site within a minute or two". This
  is stated as a fact, but FACTS.md says publishing can take up to 10 minutes. — "...updates the site,
  usually within a minute or two (GitHub says it can take up to ten)."

- **lesson_08.md:131-138** — minor — The lesson has no "Commands in this lesson" table, which PLAN.md
  §4 requires on every lesson page. — Add one (`git add`, `git commit -m`, `git push` together: "publish
  a change to your site"), or record the exception in PLAN.md.

## lesson_09.md

- **lesson_09.md:34-35** — unverified — "A box opens with the message "Update README.md". Leave it, and
  leave **Commit directly to the main branch** selected." FACTS.md only says that you choose the current
  branch or a new branch. It covers neither the ready-made message nor which option is selected first.
  GitHub Docs (editing-files) recommend a new branch when you are on the default branch, and their
  screenshot shows "New branch" selected. — "Click **Commit changes...**. A box opens with a ready-made
  message, "Update README.md". Leave it. Choose to commit directly to the `main` branch, not to a new
  branch, then click **Commit changes**."

- **lesson_09.md:196-206** — minor — The label `origin/HEAD` appears for the first time here (line 200,
  again at 257) and is never explained, which breaks PLAN.md §1 rule 4. — Add after the graph:
  "`origin/HEAD` is your computer's note of which branch GitHub shows first, here `main`. Git adds it
  when it talks to GitHub. You can ignore it."

- **lesson_09.md:254-255** — minor — The `ls` output order differs by system. macOS lists
  `README.md  index.html  style.css`. GNU `ls` on Linux, and in Git Bash with a UTF-8 locale, usually
  lists `index.html  README.md  style.css`. — Add "(the order of the names may differ on your
  computer)".

- **lesson_09.md:319-323** — error (quiz) — The keyed answer, "`git status` has not asked GitHub since
  your last push", implies that `git status` sometimes asks GitHub. It never does: the lesson itself
  says the note is refreshed "when Git talks to GitHub". The distractor "`git status` only looks at
  your computer's files" is then the more accurate statement, and a careful reader can defend it. —
  Replace the options with:
  - [ ] The edit on GitHub failed
  - [x] Git has not talked to GitHub since your last push, so `origin/main`, the note `git status`
    compares with, is out of date
  - [ ] `git status` asked GitHub, and GitHub had nothing new

  Explanation: "> `git status` never asks GitHub. `origin/main` is updated only when Git talks to
  GitHub, for example with `git pull`."

## lesson_10.md

- **lesson_10.md:109-127** — unverified — These pull request details go beyond FACTS.md:
  - Line 109 puts "merge `add-contact` into `main`" in quotation marks, so it reads like text on the
    screen. The compare page does not show this sentence.
  - Line 111, "The title is filled in from your commit message", holds only for a branch with one
    commit, and FACTS.md does not cover it.
  - Line 117 says the page has "three tabs". FACTS.md only says "tabs include **Files changed**", and
    the real page also has a **Checks** tab, so "three" is probably wrong.
  - Line 127, "click the blue **+**".

  — Line 109: remove the quotation marks ("...: you ask to merge `add-contact` into `main`"). Line
  111: "The title box shows your commit message, "Add a contact section"; if it does not, type it."
  Line 117: "its own page with tabs, among them:". Line 127: keep the **+** only once it is checked.

- **lesson_10.md:152-153** — misleading — "with a merge commit, exactly like `git merge` did on your
  computer in Lesson 5". Here `main` had not moved since the branch was made. `git merge add-contact` on
  your computer would therefore have been a fast-forward, as with `dark-theme` in Lesson 5. GitHub
  makes a merge commit anyway; FACTS.md: "Pull requests use `--no-ff`". — "GitHub merged
  `add-contact` into `main` with a merge commit, like the second merge in Lesson 5. It always makes
  one, even when, as here, `git merge` on your computer would only have moved the label forward."

- **lesson_10.md:210-211** — unverified — "It disappears after a while" and the **New pull request**
  button are not in FACTS.md. — "If you do not see it, click the **Pull requests** tab, then **New pull
  request** ...", once the button is checked.

- **lesson_10.md:213-215** — error — The fix says "On your computer: `git switch add-contact`, `git
  merge main`". The conflicting change was made on GitHub (another merged pull request, or a web edit),
  and the local `main` does not have it until it is pulled. `git merge main` merges the old local
  `main`: it says "Already up to date." or merges without the conflict, and the pull request still shows
  conflicts. — "On your computer, first get GitHub's newest `main`: `git switch main`, `git pull`. Then
  `git switch add-contact`, `git merge main`, resolve the conflict as in Lesson 6 (`git add`, `git
  commit`), and `git push`. The pull request updates, and you can merge."

- **lesson_10.md:236** — minor — "You cannot push to a project that is not yours." This contradicts the
  section just above it: a collaborator pushes to a project that is not theirs. — "You cannot push to
  someone else's project unless they make you a collaborator."

- **lesson_10.md:239-244** — unverified — The fork steps are not in FACTS.md. The **Fork** button
  ("In the top-right corner of the page") and **Create fork** do match github/docs fork-a-repo, rendered
  at scratchpad `ghdocs/out/fork-a-repo.md`. No checked page covers line 243, "On your fork's page,
  GitHub offers to open a pull request to the original project". — Add fork-a-repo and
  creating-a-pull-request-from-a-fork to FACTS.md, or soften step 3 to "Open a pull request from your
  branch on your fork to the original project."

- **lesson_10.md:287** — minor — "Anything that happens on GitHub reaches your computer only when you
  pull." The same lesson teaches `git fetch --prune`, which also brings news from GitHub. — "...reaches
  your branch only when you pull."

## lesson_11.md

- **lesson_11.md:32** (also line 329 and cheatsheet.md:87) — minor — "`git restore FILE` puts the file
  back as it was in your last commit." It actually restores from the staging area. If the changes were
  already staged with `git add`, nothing happens. Checked: after `git add f`, `git restore f` leaves the
  staged content in place. — "...puts the file back as it was in your last commit. If you have already
  staged the changes with `git add`, run `git restore --staged FILE` first."

- **lesson_11.md:83-93** (also lines 118-121, 331 and cheatsheet.md:89) — minor — Nothing says that
  `.gitignore` only affects untracked files. A file that is already committed stays tracked: for
  example a `.DS_Store` caught by Lesson 4's `git add .` on a Mac, or a file of passwords. Checked:
  after the file is listed in `.gitignore`, `git status` still shows ` M f`. So the "Never track a
  file" row promises more than it does. — Add after line 93: "`.gitignore` only works for files Git
  does not track yet. A file you have already committed stays tracked until you run `git rm --cached
  FILE` and commit. Anything you have pushed stays in the history on GitHub, so change any password
  that got there."

- **lesson_11.md:252-254** — minor — "It also throws away your changes, and with them work that was
  never committed." It is unclear what is lost. — "`git reset --hard` undoes commits too, but it also
  throws away their changes and any work you have not committed, and work that was never committed
  cannot be recovered. Do not use it until you are sure you understand it."

- **lesson_11.md:291** — misleading — "You can revert any commit, not only the last one". A merge
  commit is the exception. `git revert HASH` on a merge stops with `error: commit ... is a merge but no
  -m option was given.` and then `fatal: revert failed` (sequencer.c:2341; checked). The reader's
  history has four merge commits, and a merged pull request is the commit they are most likely to want
  to undo. — Add: "A merge commit, such as a merged pull request, is the exception: use `git revert -m 1
  HASH` to undo what the merge brought in." Also add a troubleshooting entry for this message.

- **lesson_11.md:311-315** — minor — `git branch rescue d562547` fails with the page's hash (`fatal:
  not a valid object name`). A reader who tries it with their own hash is left with a stray branch. —
  "...put a branch on it, with the hash from your own reflog:". After line 318, add: "(If you tried it,
  remove the branch with `git branch -D rescue`.)"

- **lesson_11.md:317-318, 388** — error — "Git keeps reflog entries for about three months." The
  commits this section is about, the amended and the reset ones, are no longer on any branch. By
  default those entries are pruned after 30 days (`gc.reflogExpireUnreachable`,
  Documentation/config/gc.adoc in v2.56.0); 90 days applies only to entries that are still reachable.
  In addition, v2.56.0's reflog.h `REFLOG_EXPIRE_OPTIONS_INIT` sets `default_expire_total` to 30 days and
  `default_expire_unreachable` to 90 days, the other way round from 2.43's builtin/reflog.c:276-277. So
  with 2.56, `git gc` may prune every entry after 30 days. — Line 317-318: "Git keeps these entries for
  at least 30 days." Line 388: "> The reflog lists the commits `HEAD` has pointed at recently, for at
  least 30 days."

## cheatsheet.md

- **cheatsheet.md:3** — minor — The lead promises "Every command from the series", but some commands
  from the lessons' main text are missing:
  - `git commit` without `-m`, to finish a merge (Lesson 6)
  - `git commit --amend --no-edit` (Lesson 11)
  - `git branch NAME HASH` (Lesson 11), the series' only way to bring back a lost commit
  - `gh auth login` (Lesson 7)

  — Add these rows:
  - "`git commit` | Finishes a merge, with Git's ready-made message | 6"
  - "`git commit --amend --no-edit` | Adds what is staged to the last commit, keeping its message | 11"
  - "`git branch NAME HASH` | Puts a new branch on a commit, for example one found with `git reflog` |
    11"
  - "`gh auth login` | Signs Git in to GitHub from a terminal outside VS Code | 7"

- **cheatsheet.md:87** — minor — Same problem as lesson_11.md:32. — "Throw away changes to a file that
  you have not staged | `git restore FILE`".

- **cheatsheet.md:89** — minor — Same problem as lesson_11.md:83-93. — "Never track some files (not yet
  committed) | list them in `.gitignore`".

- **cheatsheet.md:90** — minor — "Fix the last commit's message or files | `git commit --amend -m
  "MESSAGE"`". Fixing files needs `git add` first, which the row does not say. — "`git add` the files,
  then `git commit --amend -m "MESSAGE"` (or `--no-edit` to keep the message)".

- **cheatsheet.md:105-127** — minor — The glossary lacks words that Lessons 7 to 11 introduce, which
  PLAN.md §1 rule 4 says it must collect: `origin/main` (your note of where `main` is on GitHub),
  `origin/HEAD`, README, Markdown, GitHub Pages, collaborator, `.gitignore`, amend, revert, reflog,
  ahead/behind. — Add them, worded as in the lessons.

## troubleshooting.md

- **troubleshooting.md:24-25** — minor — "Every message below was produced by running the commands
  shown, with Git 2.56." This is not quite true:
  - The "Repository not found" box is `norun`.
  - The password, GH007 and Pages entries quote GitHub without running anything.
  - The commands ran on Git 2.43, with the wording rewritten to 2.56.

  — "The terminal boxes below show what Git 2.56 prints for the commands shown; messages from GitHub
  are quoted as GitHub shows them. Hashes, paths and names will differ on your computer."

- **troubleshooting.md:43-44** — misleading — "To give up instead, type `:q!`". `:q!` leaves Vim with
  exit status 0 and the prepared message unchanged, so Git carries on. In every case where this series
  opens an editor, the operation then completes with the ready-made message: a merge, a `git pull`
  merge, a `git revert`, and the `git commit` that finishes a conflicted merge. Checked: with an editor
  that exits without saving, `git merge` printed "Merge made by the 'ort' strategy." `:q!` only cancels
  a plain `git commit` whose message is empty. — Delete the sentence, or replace it with: "(Typing `:q!`
  does not cancel a merge or a revert: Git uses the ready-made message anyway.)"

- **troubleshooting.md:56-57** — minor — "install VS Code again with **Add to PATH** ticked". The
  Linux .deb and .rpm installers have no such option. — "On Windows, close and reopen the terminal; if
  it still fails, install VS Code again with **Add to PATH** ticked. On Linux, install VS Code again from
  its `.deb` or `.rpm` file."

- **troubleshooting.md:333-343** — minor (missing entry) — There is no entry for the 403 that a push
  gets when Git is signed in as another account (see lesson_07.md:142-143). — Add the entry proposed
  there, after this one.

- **troubleshooting.md:428-430** — minor — The entry leaves out the cause of a non-fast-forward
  rejection that Lesson 11 readers meet most: amending or resetting a commit that was already pushed. —
  Add: "It also happens after you amended or reset a commit that was already on GitHub (Lesson 11). The
  fix is the same. Do not force the push."

- **troubleshooting.md:556-580** — minor — If the local project also has a file that GitHub added
  (`README.md`, `.gitignore`, `LICENSE`), the pull stops with an add/add conflict, which the entry does
  not mention. — Add after the second box: "If Git reports a conflict in `README.md` (your project had
  one too), resolve it as in Lesson 6, `git add` it and `git commit`, then push."

- **troubleshooting.md:584-588** — misleading (privacy) — Same problem as lesson_07.md:153-157, and
  worse: "the simplest way out is to untick ..., push, and tick it again afterwards" makes the reader's
  real address public in every pushed commit, and ticking the box again does not hide it. — Use the
  wording proposed for Lesson 7, ending with: "(Unticking **Block command line pushes that expose my
  email** lets the push through, but your real address is then public in those commits for good.
  Ticking it again later does not hide it.)"

- **troubleshooting.md:608-609** — error — The Safari shortcut is wrong here too; see
  lesson_08.md:110-111.

- **troubleshooting.md (whole page)** — minor — PLAN.md §1 rule 5 says this page collects every "If
  something went wrong" box. These boxes from the lessons are missing:
  - Lesson 8: "Settings has no Pages option..." (only partly covered by the 404 entry)
  - Lesson 9: "The copy ended up inside `my-page`"
  - Lesson 10: "There is no yellow banner" and "The merge button is grey..."
  - Lesson 11: "I amended or reset a commit that was already pushed..." and "`git revert` stopped with
    a conflict"

  An entry for `error: commit ... is a merge but no -m option was given.` (lesson_11.md:291) is also
  worth adding. — Add them.

## Checked and found correct

- **The running state.** Each lesson starts where the last one ended: no remote before Lesson 7; `main`
  pushed at `c3520de` before Lesson 9; the terminal back in `my-page` at the end of Lesson 9; `main` at
  `dca2d0a` and up to date before Lesson 11. Prose about hashes, counts, branch names and
  "ahead"/"up to date" matches the outputs next to it: `7f70e05..595b1e3`, "ahead by 1" (the
  `.gitignore` commit), the `-2`, `-3` and `-4` graphs, and the reflog read from the bottom up.
- **Git messages.** Every message quoted in the boxes of Lessons 7 to 11 and on the troubleshooting page
  has this wording in v2.56.0:
  - `remote %s already exists.`, `src refspec %s does not match any`
  - `Need to specify how to reconcile divergent branches.`, `refusing to merge unrelated histories`
  - `destination path ... already exists and is not an empty directory.`
  - `cannot switch branch while merging` plus the "Consider ..." line
  - the not-fully-merged error and its two hints, `You appear to have cloned an empty repository.`
  - `hint: Waiting for your editor to close the file...`
  - the fetch-first and non-fast-forward hints, printed with `advise()` and without a "Disable" line
    (builtin/push.c:325-358).
- **Git behaviour behind the prose:**
  - `origin/HEAD` is created without any message (builtin/fetch.c `set_head`, `create` mode).
  - `git pull` opens the editor for its merge message (builtin/merge.c `default_edit_option`), so the
    MERGE_MSG tab in Lesson 9 is right, and FETCH_HEAD strips `.git` from the URL in that message.
  - `--amend` keeps the author date and prints ` Date:` (builtin/commit.c `author_date_is_interesting`).
  - `git revert` opens the editor.
  - `git branch -d add-contact` gives no warning, because `origin/add-contact` still resolves and HEAD
    contains it (builtin/branch.c `branch_merged`).
  - The `fetch --prune` output and the "do not force; pull, resolve, push" advice after amending or
    resetting a pushed commit are right and safe.
- **`remote:` lines.** These match what GitHub prints:
  - `Resolving deltas ... done` and `... completed with N local objects`
  - the four-line "Create a pull request for 'add-contact' ..." block, with empty `remote:` lines and the
    URL indented five spaces
  - `remote: Repository not found.` followed by `fatal: repository '...git/' not found`

  Only the reuse counts in `remote: Total ...` vary on GitHub, and Lesson 7 says "Your numbers will
  differ".
- **The unrelated-histories fix.** `git pull origin main --allow-unrelated-histories` followed by `git
  push -u origin main` works with `pull.rebase false`, and at Lesson 7's stage there is no conflict.
  The `src refspec`, `remote origin already exists`, `fetch first`, `diverged`, `behind` and
  `overwritten by merge` fixes are right.
- **The password fix.** The cause is right, the cross-references to Lesson 7 and GitHub CLI are right,
  and removing a saved credential does no harm.
- **GitHub UI against FACTS.md:**
  - new repository: **+** > **New repository**, **Owner**, name, **Public**, **Add README** Off,
    **Create repository**
  - Pages: Settings (gear, or the **...** menu), "Code, planning, and automation", **Pages**, **Deploy
    from a branch**, `main`, `/ (root)`, **Save**, **Visit site**, up to ten minutes, public repository
    on Free, project-site URL
  - editing files: pencil, **Commit changes...**, **Commit changes**
  - pull requests: yellow banner, **Compare & pull request**, base/compare, **Create pull request**,
    **Files changed**, **Merge pull request**, **Confirm merge**, **Delete branch**, merge commit message
    "Merge pull request #1 from your-username/add-contact"
  - collaborators: "Access", **Collaborators**, **Add people**, email invitation
- **GitHub CLI.** The order and wording of the `gh auth login` prompts match FACTS.md.
- **VS Code.** `git.terminalAuthentication` is true by default, so the macOS and Linux sign-in paths
  hold. `git.autofetch` is false by default, and its prompt appears only after a remote operation run
  from VS Code's own Git UI. A reader who works in the terminal therefore sees the stale "up to date" in
  Lesson 9 as the text says.
- **Quizzes.** Lessons 7, 8, 10 and 11 each have exactly one right answer. Their explanations are
  correct, apart from the two noted above (lesson_07.md:294, lesson_10.md:287) and the reflog duration.
- **Cheat sheet.** Apart from the rows noted above, every command, description and lesson number agrees
  with the lessons, and the "On GitHub's website" paragraph agrees with FACTS.md.
