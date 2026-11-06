---
title: Troubleshooting
lead: The messages beginners meet most often, grouped by what you were doing, each with what it means and how to fix it. Search this page for a few words of your message (Ctrl+F, or Cmd+F on a Mac).
---

<!-- replay:
git config --global user.name "Your Name"
git config --global user.email "12345678+your-username@users.noreply.github.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global pull.rebase false
-->

## Before anything else {#first}

1. **Read the whole message.** Git often says exactly what to do, in lines starting with `hint:`
   or in brackets.
2. **Run `git status`.** It says where you are, what has changed, and what Git is waiting for.
3. **Check the folder with `pwd`.** Many problems come from running a command in the wrong folder.
4. **Do not panic.** Work you have committed can almost always be recovered (Lesson 11). Avoid
   commands you do not understand, especially anything with `--force` or `--hard`, until you know
   what went wrong.

Every message below was produced by running the commands shown, with Git 2.56. Hashes, paths and
names will differ on your computer.

## In the terminal {#terminal}

### `git: command not found`, or "'git' is not recognized"

The terminal cannot find Git. Close VS Code completely and open it again: a terminal only learns
about newly installed programs when it starts. On Windows, check that the terminal is Git Bash (the
prompt says `MINGW64`; Lesson 2, Step 4). If it still fails, install Git again.

### The bottom line shows `:` or `(END)`, and the terminal ignores your commands

The output was longer than the screen, so Git showed it one screenful at a time. Press
<kbd>Space</kbd> to see more, or <kbd>q</kbd> to quit.

### A strange screen with `~` down the left side

Git opened the text editor Vim, usually to ask for a commit or merge message, because no other
editor is set. To accept the message and continue, type `:wq` and press <kbd>Enter</kbd>. To give
up instead, type `:q!` and press <kbd>Enter</kbd>. Then set VS Code as Git's editor:
`git config --global core.editor "code --wait"` (Lesson 2, Step 6).

### "hint: Waiting for your editor to close the file..."

Git opened a message in VS Code (a tab called `COMMIT_EDITMSG` or `MERGE_MSG`) and is waiting.
Check the message, then close the tab. Git continues when the tab closes.

### `code: command not found`

The terminal cannot start VS Code. On macOS, open VS Code, press
<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> and choose **Shell Command: Install 'code' command in
PATH**. On Windows and Linux, close and reopen the terminal; if it still fails, install VS Code
again with **Add to PATH** ticked.

### The terminal is stuck, or shows a `>` prompt

A command is still running, or you typed an opening quote `"` without a closing one. Press
<kbd>Ctrl</kbd>+<kbd>C</kbd> to cancel, then type the command again.

## Starting a project {#starting}

### `fatal: not a git repository`

<!-- replay:
@cd ~
-->

```terminal
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

The terminal is in a folder that is not a repository. Check where you are with `pwd`, then open
your project folder (in VS Code: **File** > **Open Folder...**, then a new terminal), or move to it
with `cd`. Only run `git init` if you are starting a new project in this folder.

### `Author identity unknown`

<!-- replay:
mkdir -p ~/identity-demo
@cd ~/identity-demo
git init -q
printf 'hello\n' > notes.txt
git add notes.txt
git config --global --unset user.name
git config --global --unset user.email
-->

```terminal
$ git commit -m "Add notes"
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: unable to auto-detect email address (got 'you@laptop.(none)')
```

<!-- replay:
git config --global user.name "Your Name"
git config --global user.email "12345678+your-username@users.noreply.github.com"
-->

Git does not know your name and email yet. Set them as in Lesson 2, Step 5, then commit again.

### `fatal: pathspec '...' did not match any files`

```terminal
$ git add indx.html
fatal: pathspec 'indx.html' did not match any files
```

No file of that name is in this folder. Check the spelling with `ls`. If the file is not listed,
it is in another folder, or has another name: look at the name on its tab in VS Code.

### "nothing added to commit but untracked files present"

<!-- replay:
git commit -q -m "Add notes"
printf 'More notes\n' > ideas.txt
-->

```terminal
$ git commit -m "Add ideas"
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	ideas.txt

nothing added to commit but untracked files present (use "git add" to track)
```

You committed without adding first, so the staging area was empty. Run `git add` with the file's
name (or `git add .`), then commit.

### "nothing to commit, working tree clean"

Not an error: there is nothing new to save. If you expected changes, check that you saved the
file (with Auto Save on, VS Code does it for you) and that you are in the right folder.

### `warning: in the working copy of '...', LF will be replaced by CRLF`

<!-- replay:
git config --global core.autocrlf true
printf 'Line one\nLine two\n' > list.txt
-->

```terminal
$ git add list.txt
warning: in the working copy of 'list.txt', LF will be replaced by CRLF the next time Git touches it
```

<!-- replay:
git config --global --unset core.autocrlf
git reset -q list.txt
-->

Windows and the other systems end lines in text files differently, and Git for Windows converts
between them. This warning only tells you so. It is harmless: carry on.

### "You are in 'detached HEAD' state"

<!-- replay:
git add ideas.txt
git commit -q -m "Add ideas"
-->

```terminal
$ git log --oneline
1cdd25a (HEAD -> main) Add ideas
dc1dabf Add notes
$ git checkout dc1dabf
Note: switching to 'dc1dabf'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at dc1dabf Add notes
```

You went back to an old commit itself, instead of to a branch. That is fine for looking around,
but new commits made here belong to no branch. To get back, switch to your branch:

```terminal
$ git switch main
Previous HEAD position was dc1dabf Add notes
Switched to branch 'main'
```

## Branches and merging {#branches}

<!-- replay:
mkdir -p ~/branch-demo
@cd ~/branch-demo
git init -q
printf 'Version 1\n' > page.txt
git add page.txt
git commit -q -m "Add the page"
git switch -q -c idea
printf 'Version 2\n' > page.txt
git commit -q -am "Try version 2"
git switch -q main
printf 'Version 1, edited\n' > page.txt
-->

### `Your local changes to the following files would be overwritten by checkout`

```terminal
$ git switch idea
error: Your local changes to the following files would be overwritten by checkout:
	page.txt
Please commit your changes or stash them before you switch branches.
Aborting
```

You changed a file and did not commit it, and the other branch has a different version of it.
Commit your change first (or, if you do not want it, `git restore` the file), then switch.

<!-- replay:
git restore page.txt
-->

### `fatal: a branch named '...' already exists`

```terminal
$ git switch -c idea
fatal: a branch named 'idea' already exists
```

The branch exists already. Switch to it without `-c`: `git switch idea`.

### `error: the branch '...' is not fully merged`

```terminal
$ git branch -d idea
error: the branch 'idea' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D idea'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
```

The branch has commits that are not in your current branch, so deleting it would lose them. Merge
it first if you want its work. If you really want to throw the work away, use `git branch -D`
(capital D).

### `CONFLICT (content): Merge conflict in ...`

Both branches changed the same lines. This is normal; Lesson 6 shows how to resolve it, step by
step. In short: open the file, keep what you want between the `<<<<<<<` and `>>>>>>>` markers and
delete the markers, then `git add` the file and `git commit`.

### `fatal: cannot switch branch while merging`

<!-- replay:
printf 'Version 1, edited on main\n' > page.txt
git commit -q -am "Edit the page on main"
git merge -q idea >/dev/null 2>&1 || true
-->

```terminal
$ git switch idea
fatal: cannot switch branch while merging
Consider "git merge --quit" or "git worktree add".
```

A merge with a conflict is still in progress, and Git will not switch branches until it is
finished. Resolve the conflict, `git add` the file and `git commit` (Lesson 6), or cancel the merge
with `git merge --abort`. (You can ignore the commands Git suggests here; they are for unusual
situations.)

<!-- replay:
git merge --abort
-->

## Working with GitHub {#github}

<!-- replay:
gh-new-repo your-username/my-page
mkdir -p ~/my-page
@cd ~/my-page
git init -q
-->

### `error: src refspec main does not match any`

<!-- replay:
git remote add origin https://github.com/your-username/my-page.git
-->

```terminal
$ git push -u origin main
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/your-username/my-page.git'
```

There is no branch called `main` to send. Either the repository has no commits yet (make one
first), or your branch has another name: `git branch` shows it. If it is `master`, rename it with
`git branch -M main`, then push again.

### `error: remote origin already exists`

```terminal
$ git remote add origin https://github.com/your-username/my-page.git
error: remote origin already exists.
```

You have connected this repository to a remote called `origin` already. See its address with
`git remote -v`. If the address is wrong, change it with `git remote set-url origin` followed by the
right address.

### `remote: Repository not found`

```terminal norun
$ git push -u origin main
remote: Repository not found.
fatal: repository 'https://github.com/your-username/my-pgae.git/' not found
```

GitHub has no repository at that address, or you are signed in as someone who cannot see it.
Compare `git remote -v` with the address on the repository's GitHub page (look for typos, like
`my-pgae` here), and fix it with `git remote set-url origin`.

### "Support for password authentication was removed"

GitHub does not accept your account password in the terminal. Sign in through the browser instead:
on Windows, Git Credential Manager does this; in VS Code's terminal, VS Code does it (Lesson 7). In
another terminal, use GitHub CLI (`gh auth login`, Lesson 7). If a wrong password was saved, remove
it: on Windows, open **Credential Manager** in the Control Panel and delete the `github.com` entry;
on macOS, delete the `github.com` entry in the **Keychain Access** app.

### "warning: You appear to have cloned an empty repository"

<!-- replay:
gh-new-repo your-username/empty-project
@cd ~
-->

```terminal
$ git clone https://github.com/your-username/empty-project.git
Cloning into 'empty-project'...
warning: You appear to have cloned an empty repository.
```

Not a problem: the repository on GitHub has no commits yet. You can start working in the new
folder, and your first push fills it.

### `fatal: destination path '...' already exists`

```terminal
$ git clone https://github.com/your-username/empty-project.git
fatal: destination path 'empty-project' already exists and is not an empty directory.
```

A folder with that name is already here. Clone into a new name
(`git clone ADDRESS another-name`), or move to another folder first.

### `! [rejected] main -> main (fetch first)`

<!-- replay:
@cd ~/my-page
printf '<h1>Hello</h1>\n' > index.html
git add index.html
git commit -q -m "Add a page"
git push -q -u origin main 2>/dev/null
printf '# My page\n' | gh-web-edit your-username/my-page main README.md "Create README.md"
printf '<h1>Hello!</h1>\n' > index.html
git commit -q -am "Make the greeting friendlier"
-->

```terminal
$ git push
To https://github.com/your-username/my-page.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/your-username/my-page.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

GitHub has commits that you do not have. Run `git pull` (resolve a conflict if there is one), then
`git push`. Lesson 9 explains why.

### `! [rejected] main -> main (non-fast-forward)`

```terminal
$ git fetch
remote: Enumerating objects: 4, done.
remote: Counting objects: 100% (4/4), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 308 bytes | 308.00 KiB/s, done.
From https://github.com/your-username/my-page
   e7d2f4c..3e35d28  main       -> origin/main
$ git push
To https://github.com/your-username/my-page.git
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'https://github.com/your-username/my-page.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

The same situation as "fetch first", seen after your computer has already downloaded GitHub's new
commits (here with `git fetch`, which downloads without merging). The fix is the same: `git pull`,
then `git push`.

### "Your branch and 'origin/main' have diverged"

```terminal
$ git status
On branch main
Your branch and 'origin/main' have diverged,
and have 1 and 1 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)

nothing to commit, working tree clean
```

You and GitHub each have a commit the other does not. `git pull` merges them; then `git push`.

### `fatal: Need to specify how to reconcile divergent branches`

<!-- replay:
git config --global --unset pull.rebase
-->

```terminal
$ git pull
hint: You have divergent branches and need to specify how to reconcile them.
hint: You can do so by running one of the following commands sometime before
hint: your next pull:
hint:
hint:   git config pull.rebase false  # merge
hint:   git config pull.rebase true   # rebase
hint:   git config pull.ff only       # fast-forward only
hint:
hint: You can replace "git config" with "git config --global" to set a default
hint: preference for all repositories. You can also pass --rebase, --no-rebase,
hint: or --ff-only on the command line to override the configured default per
hint: invocation.
fatal: Need to specify how to reconcile divergent branches.
```

<!-- replay:
git config --global pull.rebase false
-->

Git wants to know how `git pull` should combine your work with GitHub's. Choose merging, the way
this series uses, once for all your projects:

```terminal
$ git config --global pull.rebase false
$ git pull
Merge made by the 'ort' strategy.
 README.md | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

### "Your branch is behind 'origin/main'"

<!-- replay:
git push -q 2>/dev/null
printf '# My page\n\nA small web page.\n' | gh-web-edit your-username/my-page main README.md "Update README.md"
git fetch -q
-->

```terminal
$ git status
On branch main
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)

nothing to commit, working tree clean
```

GitHub has a commit you do not have, and you have nothing new. `git pull` brings it in.

### `error: Your local changes to the following files would be overwritten by merge`

<!-- replay:
printf '# My page, edited here\n' > README.md
-->

```terminal
$ git pull
Updating 285d005..607f1ed
error: Your local changes to the following files would be overwritten by merge:
	README.md
Please commit your changes or stash them before you merge.
Aborting
```

You changed a file without committing it, and the commits you are pulling change it too. Commit
your change first, then pull again (and resolve the conflict if Git reports one). If you do not
want your change, `git restore` the file and pull.

<!-- replay:
git restore README.md
git pull -q
-->

### `fatal: refusing to merge unrelated histories`

<!-- replay:
gh-new-repo your-username/new-site readme
mkdir -p ~/new-site
@cd ~/new-site
git init -q
printf '<h1>New site</h1>\n' > index.html
git add index.html
git commit -q -m "Add the first page"
git remote add origin https://github.com/your-username/new-site.git
-->

You created the GitHub repository with **Add README** on, and then pushed an existing project to
it. The push is rejected ("fetch first"), and pulling fails:

```terminal
$ git pull origin main
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 236 bytes | 118.00 KiB/s, done.
From https://github.com/your-username/new-site
 * branch            main       -> FETCH_HEAD
 * [new branch]      main       -> origin/main
fatal: refusing to merge unrelated histories
```

The two histories have no commit in common: one started on GitHub with the README, the other on
your computer. Tell Git that joining them is what you want, then push:

```terminal
$ git pull origin main --allow-unrelated-histories
From https://github.com/your-username/new-site
 * branch            main       -> FETCH_HEAD
Merge made by the 'ort' strategy.
 README.md | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
$ git push -u origin main
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (5/5), 533 bytes | 533.00 KiB/s, done.
Total 5 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), done.
To https://github.com/your-username/new-site.git
   ab25ec3..04b6628  main -> main
branch 'main' set up to track 'origin/main'.
```

(Close the `MERGE_MSG` tab that opens during the pull.) Next time, create the repository empty.

### `GH007: Your push would publish a private email address`

Your commits contain your real email address, and your GitHub email settings protect it. Set your
private GitHub address as in Lesson 2, Step 5. Then, to fix your last commit, run
`git commit --amend --reset-author --no-edit` and push again. If several commits have the real
address, the simplest way out is to untick **Block command line pushes that expose my email** in
GitHub's **Settings** > **Emails**, push, and tick it again afterwards.

## GitHub Pages {#pages}

### "404: There isn't a GitHub Pages site here"

The first publication can take up to ten minutes. If the page does not appear, check in
**Settings** > **Pages** that the source is **Deploy from a branch**, with `main` and `/ (root)`,
and that your repository has a file called exactly `index.html` at its top level. On a free
account, the repository must be public.

### The page appears, but without its colours or pictures

The browser cannot find a file the page asks for. File names on the web are case-sensitive:
`Style.css` and `style.css` are different files there, even if they are the same on your computer.
Make the names in your HTML match the files' names exactly.

### My change does not appear on the site

Run `git status`: if your branch is ahead of `origin/main`, push. If you pushed, wait a minute or
two, then force your browser to load a fresh copy: <kbd>Ctrl</kbd>+<kbd>F5</kbd> on Windows and
Linux, <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> on a Mac. The **Actions** tab of your repository
shows whether the publication has finished.
