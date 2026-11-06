# Facts the series relies on, and where each was checked

Checked on 6 November 2026. The websites themselves (docs.github.com, cli.github.com,
git-scm.com, code.visualstudio.com) were not reachable from the build environment, so each fact
was read from the source the website is built from. Re-check before a major revision.

## GitHub's website (source: `github/docs` repository, `content/` and `data/reusables/`, commit 4df2385, 6 Nov 2026)

Rendered for github.com Free/Pro/Team users with a small resolver of the docs' Liquid templates.

| Fact | Docs page |
|---|---|
| New repository: upper-right corner, select **+**, then **New repository**; fields **Owner**, repository name (ASCII letters, digits, `.`, `-`, `_`, at most 100 characters), optional description, visibility; optional README (**Add README** toggle, **On**/**Off**), `.gitignore`, licence; button **Create repository**; an empty repository opens the "Quick setup" page | repositories/creating-and-managing-repositories/creating-a-new-repository, quickstart-for-repositories |
| "If you're importing an existing repository to GitHub, don't choose any of these options, as you may introduce a merge conflict" | creating-a-new-repository |
| Edit a file: in the file view, upper right, the pencil icon; **Preview**; **Commit changes...**; "Commit message" field; choose to commit to the current branch or a new branch; **Commit changes** or **Propose changes** | repositories/working-with-files/managing-files/editing-files |
| Pull request: in the yellow banner, **Compare & pull request**; *base* and *compare* dropdowns; title and description; **Create pull request** (the docs also write "Create Pull Request"); tabs include **Files changed** | pull-requests/how-tos/create-pull-requests/creating-a-pull-request |
| Merge: under the repository name, **Pull requests**; at the bottom, **Merge pull request** (or the dropdown: **Create a merge commit**, **Squash and merge**, **Rebase and merge**); **Confirm merge**; optionally delete the branch (**Delete branch**). Pull requests use `--no-ff`. | pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request |
| Collaborators: **Settings**, in the "Access" section of the sidebar **Collaborators**, **Add people**, pick the person, **Add NAME to REPOSITORY**; they get an email invitation | repositories/.../inviting-collaborators-to-a-personal-repository |
| Pages: on GitHub Free the repository must be public; **Settings**, "Code, planning, and automation" section, **Pages**; "Build and deployment", "Source", **Deploy from a branch**; branch dropdown, folder dropdown (`/ (root)` or `/docs`); **Save**; entry file `index.html`, `index.md` or `README.md`; "It can take up to 10 minutes for changes to your site to publish"; **Visit site**; project sites live at `https://<user>.github.io/<repository>/`; the site is deployed by a GitHub Actions workflow run | pages/getting-started-with-github-pages/creating-a-github-pages-site, configuring-a-publishing-source-for-your-github-pages-site |
| Email: profile picture, **Settings**, "Access" section, **Emails**; **Keep my email addresses private**; **Block command line pushes that expose my email**; noreply address `ID+USERNAME@users.noreply.github.com` for accounts created after 18 July 2017. Whether either box is on by default for new accounts is not stated, so the series does not say. | account-and-profile/how-tos/email-preferences/*, account-and-profile/reference/email-addresses-reference |
| Sign-up at `https://github.com/signup` (or **Continue with Google**), "Follow the prompts"; the email must be verified; without a verified email you cannot create repositories | account-and-profile/how-tos/account-management/creating-an-account-on-github, email-addresses-reference |
| Password authentication for Git was removed; use a credential helper (GitHub CLI or Git Credential Manager) or a personal access token. HTTPS URLs "work even if you are behind a firewall or proxy" | get-started/git-basics/caching-your-github-credentials-in-git, about-remote-repositories |
| Git Credential Manager is included in Git for Windows; "The next time you clone an HTTPS URL that requires authentication, Git will prompt you to log in using a browser window" | caching-your-github-credentials-in-git (Windows tab) |

## GitHub CLI (source: `cli/cli`, branch `trunk`)

`gh auth login` prompts, in order (`pkg/cmd/auth/login/login.go`, `pkg/cmd/auth/shared/login_flow.go`,
`git_credential.go`, `internal/authflow/flow.go`): "Where do you use GitHub?" (GitHub.com, Other);
"What is your preferred protocol for Git operations on this host?" (HTTPS, SSH); "Authenticate
Git with your GitHub credentials?" (Y/n); "How would you like to authenticate GitHub CLI?"
(Login with a web browser, Paste an authentication token); "! First copy your one-time code:";
"Press Enter to open https://github.com/login/device in your browser..."; "✓ Authentication
complete."; "✓ Logged in as USERNAME". Install: macOS `brew install gh` (official); Linux:
GitHub's own apt/dnf repositories (`docs/install_linux.md`).

## VS Code (source: `microsoft/vscode`, branch `main`)

| Fact | File |
|---|---|
| `git.terminalAuthentication` defaults to true: "Controls whether to enable VS Code to be the authentication handler for Git processes spawned in the Integrated Terminal" | extensions/git/package.json, package.nls.json |
| The GitHub extension answers credential requests for github.com with a GitHub sign-in session | extensions/github/src/credentialProvider.ts |
| Workspace trust: "Do you trust the authors of the files in this folder?", **Yes, I trust the authors** / **No, I don't trust the authors** | src/vs/workbench/contrib/workspace/browser/workspace.contribution.ts |
| Conflict buttons: **Accept Current Change**, **Accept Incoming Change**, **Accept Both Changes**, **Compare Changes** | extensions/merge-conflict/src/codelensProvider.ts |
| "Would you like Code to periodically run "git fetch"?" (**Yes**, **No**, **Ask Me Later**) | extensions/git/src/autofetch.ts |
| Menus and commands: **Terminal > New Terminal**; **File > Open Folder...**; **Terminal: Select Default Profile**; macOS **Shell Command: Install 'code' command in PATH** | terminalStrings.ts, workspaceActions.ts, terminalActions.ts, installActions.ts |
| Windows installer task "Add to PATH (requires shell restart)" is ticked by default | build/win32/code.iss, build/win32/i18n/messages.en.isl |

## Git for Windows installer (source: `git-for-windows/build-extra`, `installer/install.iss`)

- Pages include "Choosing the default editor used by Git" (default Vim; options include "Use
  Visual Studio Code as Git's default editor", usable only if VS Code is installed, "Use Notepad
  as Git's default editor", "Use the Nano editor by default"), "Adjusting the name of the initial
  branch in new repositories" ("Let Git decide" by default, or "Override the default branch name
  for new repositories", prefilled with `main`), "Adjusting your PATH environment", "Choosing the
  SSH executable", "Choosing HTTPS transport backend", "Configuring the line ending conversions",
  "Configuring the terminal emulator to use with Git Bash", "Choose the default behavior of
  `git pull`", "Choose a credential helper" (Git Credential Manager), "Configuring extra options",
  "Configuring experimental options".
- The installer writes its settings to the **system** config (`git config --system`), so
  `git config --global --list` shows only what the reader sets.

## Git (source: `git/git` tags v2.43.0 and v2.56.0; `git/git-scm.com` branch `gh-pages`)

- Current release 2.56.0 (28 September 2026); Git for Windows 2.56.0.windows.4. Git 3.0 is not
  released, so `git init` still names the first branch `master` unless `init.defaultBranch` is
  set.
- Download pages: `https://git-scm.com/install/windows` ("Click here to download the latest
  (2.56.0) x64 version of Git for Windows"), `/install/mac` (Homebrew, MacPorts or Xcode Command
  Line Tools: `xcode-select --install`), `/install/linux` (`apt-get install git`,
  `dnf install git`).

### Git messages: 2.43 (the build machine) against 2.56

Rules applied by `tools/git256.py`, each checked in both versions' source:

| Message | 2.43 | 2.56 | Source |
|---|---|---|---|
| pack summary | `pack-reused N` | `pack-reused N (from M)` | builtin/pack-objects.c |
| deleting an unmerged branch | `error: the branch 'X' is not fully merged.` then `If you are sure ...` | `error: the branch 'X' is not fully merged`, then the same advice as a `hint:`, then `hint: Disable this message with "git config set advice.forceDeleteBranch false"` | builtin/branch.c, advice.c (`advise_if_enabled` adds the "Disable" line when the advice is not configured) |
| adding an embedded repository (troubleshooting) | the advice ends with `hint: See "git help submodule" for more information.` | the same, then `hint: Disable this message with "git config set advice.addEmbeddedRepo false"` | builtin/add.c (`advise` became `advise_if_enabled`) |

Two more differences need no rule. Empty hint lines are `hint: ` in 2.43 and `hint:` in 2.56
(advice.c `vadvise`); the replay strips trailing spaces, which gives the 2.56 form. The editor
error, quoted in prose only, is `error: There was a problem with the editor '...'.` in 2.43 and
`error: there was a problem with the editor '...'` in 2.56 (editor.c); the lessons quote 2.56.

One behaviour, not a message, also differs, and `tools/replay.py` reproduces it
(`Sandbox.follow_remote_head`): since 2.48, a `git fetch` or `git pull` from a configured remote
with no refspec on the command line creates `refs/remotes/origin/HEAD` if it is missing
(`remote.<name>.followRemoteHEAD`, default `create`; builtin/fetch.c `set_head`, remote.h
`BUILTIN_FOLLOW_REMOTE_HEAD_DFLT`). Readers therefore see the label `origin/HEAD` in `git log`
after their first pull, in a repository connected with `git remote add`.

How this was established: `tools/git256_audit.py` collects every message string (`_()`, `N_()`,
`Q_()`) of both releases (5,326 in v2.43.0, 6,181 in v2.56.0), keeps the 304 that v2.43.0 has and
v2.56.0 does not, and matches them against every output line of Lessons 2 to 11. The only match
is the pack summary above; on the troubleshooting page, also the unmerged-branch message. Hints the lessons show were checked separately, because 2.56 could add
lines that 2.43 never prints: the rejected-push hint (`advise_ref_fetch_first` in
builtin/push.c) is identical and printed with `advise()`, which adds no "Disable this message"
line, in both releases. Re-run the audit when the replay moves to a newer Git, or when a lesson
shows a new command.

## Checked after the reviews (6 November 2026)

The four reviews in `notes/reviews/` raised claims that the sources above did not cover. Each was
checked as follows before the lessons used it.

**Git** (v2.56.0 source, and Git 2.43 in a scratch repository):

- `git commit` with nothing staged prints the status, with `Initial commit` where `git status`
  says `No commits yet` (wt-status.c, `commit_template`, set in builtin/commit.c); the Lesson 3
  widget prints this.
- `git restore FILE` restores from the index, not from `HEAD` (Documentation/git-restore.adoc).
- Reflog: `gc.reflogExpire` 90 days, `gc.reflogExpireUnreachable` 30 days
  (Documentation/config/gc.adoc). v2.56.0's `reflog.h` `REFLOG_EXPIRE_OPTIONS_INIT` sets 30 days for
  all entries and 90 for unreachable ones, the other way round. Either way "at least 30 days" holds,
  which is what Lesson 11 says.
- Git reads `~/.config/git/ignore` when `core.excludesFile` is not set (Documentation/gitignore.adoc);
  Lesson 2 uses it for `.DS_Store` on a Mac.
- `git rm --cached` refuses to unstage a newly added embedded repository without `-f`;
  `git restore --staged` works (checked with 2.43). The troubleshooting page says so.
- `git revert` on a merge commit: `error: commit %s is a merge but no -m option was given.`
  (sequencer.c).
- `fatal: The current branch %s has no upstream branch.` (builtin/push.c),
  `There is no tracking information for the current branch.` (builtin/pull.c),
  `Authentication failed for '%s'` (remote-curl.c), `Everything up-to-date` (transport.c),
  `Aborting commit due to empty commit message.` (builtin/commit.c),
  `You have not concluded your merge (MERGE_HEAD exists).` (builtin/merge.c), and the
  `COMMIT_EDITMSG` notes "It looks like you may be committing a merge ... git update-ref -d
  MERGE_HEAD" (builtin/commit.c).
- `git-scm.com/install/linux` gives the Git maintainers' Ubuntu archive, `ppa:git-core/ppa`;
  `/install/mac` lists Homebrew, MacPorts, the Xcode Command Line Tools and a binary installer.

**VS Code** (`microsoft/vscode`, `main`, 6 November 2026):

- Terminal paste: <kbd>Ctrl</kbd>+<kbd>V</kbd> on Windows, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>
  on Linux, <kbd>Cmd</kbd>+<kbd>V</kbd> on macOS
  (`terminalContrib/clipboard/browser/terminal.clipboard.contribution.ts`).
- The sign-in prompt is "The extension '{0}' wants to sign in using {1}." with **Allow**, unless the
  provider defines its own `confirmation`; the GitHub provider (`extensions/github-authentication`)
  does not (`api/browser/mainThreadAuthentication.ts`, `loginPrompt`).
- Linux without a keyring: "An OS keyring couldn't be identified for storing the encryption related
  data in your current desktop environment." with **Use weaker encryption**
  (`services/secrets/electron-browser/secretStorageService.ts`).
- macOS shell command: "Code will now prompt with 'osascript' for Administrator privileges to
  install the shell command." with **OK** and **Cancel** (`platform/native/electron-main/nativeHostMainService.ts`).
- **Resolve in Merge Editor** (`extensions/git/package.nls.json`, `command.git.openMergeEditor`).
- **File** > **Auto Save**, **Reveal in File Explorer** / **Reveal in Finder** / **Open Containing
  Folder**, and `files.exclude` hiding `.git` and `.DS_Store` (checked by the technical review in
  `files/browser/fileActions.contribution.ts`, `files/electron-browser/fileActions.contribution.ts`
  and `files.contribution.ts`).

**Git Credential Manager** (`git-ecosystem/git-credential-manager`, `src/GitHub/UI/`): the window is
titled "Connect to GitHub" (`ViewModels/CredentialsViewModel.cs`) and offers **Sign in with your
browser** and **Sign in with a code**, and a **Token** tab (`Views/CredentialsView.axaml`).

**GitHub Docs** (`github/docs`, rendered with the scratchpad's `resolve.py`):

- Pull request tabs: **Conversation**, **Commits**, **Checks**, **Files changed** (pull-requests/get-started/about-pull-requests.md).
- Commenting on a line: hover, click the blue comment icon, then **Comment**, or **Start a review**
  for several (commenting-on-a-pull-request.md). Some views label the first button **Add single
  comment**; Lesson 10 names both.
- **Pull requests** > **New pull request** (pull-request-quickstart.md).
- A pull request from a fork starts on the original repository's page, in the yellow banner, with
  **Compare & pull request** (creating-a-pull-request-from-a-fork.md).
- Sensitive actions may ask you to confirm access: password, passkey, security key, GitHub Mobile
  or a 2FA code (authentication/.../sudo-mode.md).
- Visibility: **Settings**, "Danger Zone", **Change visibility**, choose, confirm, **I have read and
  understand these effects**, **Make this repository public** (setting-repository-visibility.md).
- Address of any repository: above the files, **Code**, then the copy icon under "HTTPS"; on an
  empty repository's Quick setup, the copy icon next to the HTTPS address, with **SSH** as the
  other choice (cloning-a-repository.md).
- "Block command line pushes that expose my email": "each time you push to GitHub, we'll check the
  most recent commit" (blocking-command-line-pushes-that-expose-your-personal-email-address.md).
- `The requested URL returned error: 403` (troubleshooting-cloning-errors.md); "Permission to
  user/repo denied to other-user" (the SSH troubleshooting page of that title).
- "Removing sensitive data from a repository" is the page the troubleshooting entry names.
- The sign-up error messages in Lesson 2 (creating-an-account-on-github.md, "Troubleshooting
  signup errors").

**Not in any source we could read**, kept because they are what readers see, and worded so that a
small difference does no harm: the GitHub Pages 404 text "There isn't a GitHub Pages site here.";
the Emails page showing the noreply address under **Keep my email addresses private**; the green
authorise buttons on GitHub's sign-in pages; the commit count above a repository's file list.
Ubuntu's `sudo` showing a `*` per character comes from the sudo-rs changelog ("`Defaults
pwfeedback` is now on by default", 0.2.13), checked by the technical review.
