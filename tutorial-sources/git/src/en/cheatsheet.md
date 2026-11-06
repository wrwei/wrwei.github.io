---
title: Cheat sheet
lead: Every command from the series on one page, grouped by task, with the daily routine and a glossary. Words in capitals, like FILE, stand for your own names.
---

## The daily routine {#routine}

| When | Command | Lesson |
|---|---|---|
| You start working | `git pull` | 9 |
| After each small piece of work | `git status`, then `git add FILE` (or `git add .`), then `git commit -m "MESSAGE"` | 3 |
| You finish | `git push` | 7 |

## Set up a computer (once) {#setup}

| Command | What it does | Lesson |
|---|---|---|
| `git --version` | Shows that Git is installed, and which version | 2 |
| `git config --global user.name "NAME"` | Sets the name recorded in your commits | 2 |
| `git config --global user.email "EMAIL"` | Sets the email recorded in your commits (use your GitHub noreply address) | 2 |
| `git config --global init.defaultBranch main` | Names the first branch of new projects `main` | 2 |
| `git config --global core.editor "code --wait"` | Uses VS Code when Git needs a message from you | 2 |
| `git config --global pull.rebase false` | Makes `git pull` combine work with a merge | 2 |
| `git config --global --list` | Lists your settings | 2 |

## Start a project {#start}

| Command | What it does | Lesson |
|---|---|---|
| `git init` | Turns the current folder into a repository | 3 |
| `git clone URL` | Copies a repository from GitHub into a new folder | 9 |
| `git clone URL FOLDER` | The same, into a folder with the name you choose | 9 |

## Save your work {#save}

| Command | What it does | Lesson |
|---|---|---|
| `git status` | Shows what has changed, and what is staged | 3 |
| `git diff` | Shows changes that are not staged yet, line by line | 4 |
| `git diff --staged` | Shows changes that are staged | 4 |
| `git add FILE` | Stages a file's changes for the next commit | 3 |
| `git add .` | Stages every change in the current folder | 4 |
| `git commit -m "MESSAGE"` | Saves the staged changes as a commit | 3 |

## Look at your history {#history}

| Command | What it does | Lesson |
|---|---|---|
| `git log` | Lists commits, newest first (press <kbd>q</kbd> to quit) | 3 |
| `git log --oneline` | One line per commit | 4 |
| `git log --oneline --graph --all` | Draws the history of every branch | 5 |
| `git log --oneline -5` | Only the five newest commits | 6 |
| `git show HASH` | Shows one commit and its changes | 4 |
| `git reflog` | Lists every commit `HEAD` has pointed at, to find "lost" ones | 11 |

## Branches {#branches}

| Command | What it does | Lesson |
|---|---|---|
| `git branch` | Lists branches; `*` marks the current one | 5 |
| `git switch -c NAME` | Creates a branch and switches to it | 5 |
| `git switch NAME` | Switches to a branch | 5 |
| `git merge NAME` | Brings branch `NAME` into the current branch | 5 |
| `git merge --abort` | Cancels a merge that stopped with a conflict | 6 |
| `git branch -d NAME` | Deletes a merged branch | 5 |

## Work with GitHub {#github}

| Command | What it does | Lesson |
|---|---|---|
| `git remote add origin URL` | Connects your repository to one on GitHub | 7 |
| `git remote -v` | Shows the remotes and their addresses | 7 |
| `git push -u origin BRANCH` | Sends a branch to GitHub the first time | 7 |
| `git push` | Sends new commits to GitHub | 7 |
| `git pull` | Brings new commits from GitHub and merges them | 9 |
| `git fetch --prune` | Gets news from GitHub, and forgets branches deleted there | 10 |

On GitHub's website: **+** > **New repository** creates a repository (Lesson 7); **Settings** >
**Pages** publishes it (Lesson 8); **Compare & pull request** opens a pull request, and **Merge
pull request** merges it (Lesson 10); **Settings** > **Collaborators** invites people, and **Fork**
copies someone else's project to your account (Lesson 10).

## Undo {#undo}

| Situation | Command | Safe after pushing? | Lesson |
|---|---|---|---|
| Throw away changes to a file | `git restore FILE` | The changes are lost for good | 4 |
| Take a file out of the staging area | `git restore --staged FILE` | Yes | 11 |
| Never track some files | list them in `.gitignore` | Yes | 11 |
| Fix the last commit's message or files | `git commit --amend -m "MESSAGE"` | **No** | 11 |
| Undo the last commit, keep its changes | `git reset --soft HEAD~1` | **No** | 11 |
| Undo a commit that is on GitHub | `git revert HASH` | **Yes** | 11 |

## Terminal basics {#terminal}

| Command or key | What it does |
|---|---|
| `pwd` | Shows which folder the terminal is in |
| `ls`, `ls -a` | Lists the files in the folder (`-a`: hidden ones too) |
| `cd FOLDER`, `cd ..` | Moves into a folder, or up one |
| <kbd>q</kbd> | Leaves a long output (`:` or `(END)` at the bottom) |
| <kbd>Ctrl</kbd>+<kbd>C</kbd> | Cancels the command that is running |
| <kbd>↑</kbd> | Brings back your previous command |

## Glossary {#glossary}

| Word | Meaning |
|---|---|
| **branch** | A separate line of work: a label on a commit that moves forward as you commit |
| **clone** | A full copy of a repository, made from GitHub; also the command that makes it |
| **commit** | A snapshot of the project, with a message, an author, a date and a hash |
| **conflict** | Two branches changed the same lines differently; Git asks you to choose |
| **fast-forward** | A merge where Git only moves a branch's label forward, without a new commit |
| **fork** | Your own copy, on GitHub, of someone else's repository |
| **hash** | A commit's unique name, like `c50e3a0` (the first characters of a long code) |
| **`HEAD`** | Where you are now: the branch, and so the commit, you are working on |
| **`main`** | The usual name of a repository's main branch |
| **merge** | Combining the work of two branches; a **merge commit** joins two lines of history |
| **`origin`** | The usual name of the remote on GitHub |
| **pull** | Bringing new commits from GitHub and merging them into your branch |
| **pull request** | A request on GitHub to merge a branch, with a page to review and discuss it |
| **push** | Sending your new commits to GitHub |
| **remote** | Another copy of your repository, usually on GitHub |
| **repository** | A folder whose history Git keeps, in its hidden `.git` folder |
| **staging area** | The changes you have chosen (with `git add`) for your next commit |
| **untracked** | A file Git sees but does not look after yet |
| **working folder** | Your files, as you see and edit them |
