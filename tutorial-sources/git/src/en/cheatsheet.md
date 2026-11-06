---
title: Cheat sheet
lead: Every command from the series on one page, grouped by task, with the daily routine and a glossary. Words in capitals, like FILE, stand for your own names.
---

Got an error message? See the [troubleshooting page](troubleshooting_EN.html).

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
| `git commit` | Finishes a merge, with Git's ready-made message | 6 |

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
| `git branch -D NAME` | Deletes a branch even if it is not merged, throwing its work away | 5 |
| `git branch NAME HASH` | Puts a new branch on a commit, for example one found with `git reflog` | 11 |

## Work with GitHub {#github}

| Command | What it does | Lesson |
|---|---|---|
| `git remote add origin URL` | Connects your repository to one on GitHub | 7 |
| `git remote -v` | Shows the remotes and their addresses | 7 |
| `git remote set-url origin URL` | Changes the address of `origin` | 7 |
| `git push -u origin BRANCH` | Sends a branch to GitHub the first time, and pairs the two | 7 |
| `git push` | Sends new commits to GitHub | 7 |
| `git pull` | Brings new commits from GitHub and merges them | 9 |
| `git fetch --prune` | Gets news from GitHub, and forgets branches deleted there | 10 |
| `gh auth login` | Signs Git in to GitHub from a terminal outside VS Code | 7 |

On GitHub's website:

| To | On GitHub | Lesson |
|---|---|---|
| Create a repository | **+** > **New repository** | 7 |
| Copy a repository's address | the green **Code** button, with **HTTPS** selected | 9 |
| Edit a file | open the file, then the pencil icon | 9 |
| Publish a repository as a website | **Settings** > **Pages** | 8 |
| Open a pull request | **Compare & pull request**, or **Pull requests** > **New pull request** | 10 |
| Merge a pull request | **Merge pull request**, then **Confirm merge** | 10 |
| Invite people to push | **Settings** > **Collaborators** > **Add people** | 10 |
| Copy someone else's project to your account | **Fork**, then **Create fork** | 10 |

## Undo {#undo}

| Situation | Command | Safe after pushing? | Lesson |
|---|---|---|---|
| Throw away changes to a file that are not staged | `git restore FILE` | The changes are lost for good | 4 |
| Get a file as it was in an older commit | `git restore --source HASH FILE` | Yes: commit the result as a new change | 11 |
| Take a file out of the staging area | `git restore --staged FILE` (all files: `git restore --staged .`) | Yes | 11 |
| Never track some files (not yet committed) | list them in `.gitignore` | Yes | 11 |
| Fix the last commit's message | `git commit --amend -m "MESSAGE"` | **No** | 11 |
| Add forgotten files to the last commit | `git add` them, then `git commit --amend --no-edit` | **No** | 11 |
| Undo the last commit, keep its changes | `git reset --soft HEAD~1` | **No** | 11 |
| Undo a commit that is on GitHub | `git revert HASH` (for a merge commit: `git revert -m 1 HASH`) | **Yes** | 11 |
| Stop a merge or a revert halfway | `git merge --abort`, `git revert --abort` | Yes | 6, 11 |
| Find a commit that seems lost | `git reflog` | Yes | 11 |
| Bring a lost commit back | `git branch NAME HASH` | Yes | 11 |

## Terminal basics {#terminal}

| Command or key | What it does |
|---|---|
| `pwd` | Shows which folder the terminal is in |
| `ls`, `ls -a` | Lists the files in the folder (`-a`: hidden ones too) |
| `cd FOLDER`, `cd ..` | Moves into a folder, or up one |
| <kbd>Ctrl</kbd>+<kbd>V</kbd> (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> on Linux, <kbd>Cmd</kbd>+<kbd>V</kbd> on a Mac) | Pastes into VS Code's terminal |
| <kbd>Tab</kbd> | Completes a file or folder name you have started typing |
| <kbd>←</kbd>, <kbd>→</kbd> | Move the cursor in the command you are typing (clicking does not) |
| <kbd>↑</kbd> | Brings back your previous command |
| <kbd>q</kbd> | Leaves a long output (`:` or `(END)` at the bottom) |
| <kbd>Ctrl</kbd>+<kbd>C</kbd> (also on a Mac) | Cancels the command that is running |

## Glossary {#glossary}

| Word | Meaning |
|---|---|
| **ahead, behind** | As far as your computer knows, your branch has commits GitHub does not have (ahead), or GitHub has commits you do not have (behind) |
| **amend** | Replacing your last commit with a corrected one (`git commit --amend`) |
| **branch** | A separate line of work: a label on a commit that moves forward as you commit |
| **clone** | A full copy of a repository, made from GitHub; also the command that makes it |
| **collaborator** | Someone you allow to push to your repository on GitHub |
| **commit** | A snapshot of the project, with a message, an author, a date and a hash |
| **conflict** | Two branches changed the same lines differently; Git asks you to choose |
| **fast-forward** | A merge where Git only moves a branch's label forward, without a new commit |
| **fetch** | Downloading news from GitHub without changing your files or branches; the first half of a pull |
| **fork** | Your own copy, on GitHub, of someone else's repository |
| **GitHub Pages** | GitHub's free service that publishes a repository's files as a website |
| **`.gitignore`** | A file listing the files Git should not track |
| **hash** | A commit's unique name, like `c50e3a0` (the first characters of a long code) |
| **`HEAD`** | Where you are now: the branch, and so the commit, you are working on |
| **`HEAD~1`** | The commit before `HEAD` |
| **`main`** | The usual name of a repository's main branch |
| **Markdown** | Plain text with a few symbols for formatting (`#` makes a heading), used in `.md` files |
| **merge** | Combining the work of two branches; a **merge commit** joins two lines of history |
| **`origin`** | The usual name of the remote on GitHub |
| **`origin/main`** | Your computer's note of where `main` is on GitHub, updated when you push, pull or fetch |
| **`origin/HEAD`** | Your computer's note of which branch GitHub shows first; you can ignore it |
| **pull** | Bringing new commits from GitHub and merging them into your branch |
| **pull request** | A request on GitHub to merge a branch, with a page to review and discuss it |
| **push** | Sending your new commits to GitHub |
| **README** | A file that explains a project; GitHub shows it on the repository's page |
| **reflog** | Git's diary of the commits `HEAD` has pointed at, to find "lost" commits |
| **remote** | Another copy of your repository, usually on GitHub |
| **repository** | A folder whose history Git keeps, in its hidden `.git` folder |
| **revert** | A new commit that undoes an earlier one (`git revert`) |
| **staging area** | The changes you have chosen (with `git add`) for your next commit |
| **untracked** | A file Git sees but does not look after yet |
| **upstream** | The branch on GitHub that your branch is paired with ("tracks"), set by `git push -u` |
| **working folder** | Your files, as you see and edit them (Git says *working tree*) |
