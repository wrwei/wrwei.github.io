## Reading the history {#s1}

Every commit you make is kept, with its author, its date and the message you wrote. `git log` is how you read that history. Without options, it lists the commits newest first, and shows each one's full hash, author, date and message. For a long history that is a lot of text, so a few options help:

- `--oneline` prints one line per commit: the short hash and the message.
- `-n 2` shows only the newest two commits. Any number works; `-n 1` shows just the newest.
- `--stat` adds which files each commit changed, and by how much.
- A file name at the end, as in `git log pancakes.md`, lists only the commits that changed that file.

Options combine freely: `git log --oneline -n 5` shows the newest five commits, one line each.

Every session on this page starts from the recipes repository as Module 2's main example left it, with three commits. Your own repository may hold a few more, if you also committed a `.gitignore` or did the exercises, and your hashes are different, because Git calculates them from the time of each commit as well as its content. Always use the hashes your own `git log` prints. Your repository also grows as you work through this module, so your output may differ from the pages in small ways; the commands work the same.

::: tip
When the history is longer than your window, `git log` shows it in a *pager*, a viewer that shows one screen at a time. Scroll with the arrow keys or Space, and press `q` to leave it and return to the prompt. The sessions on these pages print everything at once.
:::

{{SESSION:m03-log}}

`git log -n 1` shows the newest commit in full: its 40-character hash, the author, the date and the message. With `--stat`, each commit gets a short summary of its changes. `README.md | 2 +-` says that the commit changed two lines of `README.md`: one added (`+`) and one removed (`-`), which is how Git records a line that was reworded. `pancakes.md | 5 +++++` says that five lines were added.

The last command, `git log --oneline pancakes.md`, lists only `8bf3c2d Add a pancake recipe`, because no other commit touched `pancakes.md`. When you want to know when, and why, a file changed, this is the place to start.

## Seeing what changed {#s2}

`git log` tells you which commits exist. Three related commands show what actually changed:

- `git diff` compares the working tree with the staging area. It shows the changes you have made but not yet staged.
- `git diff --staged` compares the staging area with the last commit. It shows what your next commit will contain. (`--cached` is another name for the same option.)
- `git show` shows one commit: its hash, author, date and message, followed by its changes. On its own it shows the newest commit; give it a hash to see another one.

`git status` tells you *which* files changed; these commands show you *how*, so you can check every change before it goes into the history. In the session, you change the pancake recipe to use less milk and add a pinch of salt, then follow the change from the working tree into a commit.

{{SESSION:m03-diff}}

The output of `git diff` is called a **diff**, and every diff has the same parts:

- `diff --git a/pancakes.md b/pancakes.md` names the file: `a/` is the old version and `b/` the new one. The `index`, `---` and `+++` lines that follow say the same in more detail, and you can skip them.
- `@@ -2,4 +2,5 @@` starts a *hunk*, one block of changes. `-2,4` means the block covers four lines of the old version, starting at line 2. `+2,5` means it covers five lines of the new version, also starting at line 2: the new version is one line longer.
- Below it, each line starts with a marker. A line starting with `-` was removed, a line starting with `+` was added, and a line starting with a space is unchanged **context**, shown to help you find the place. Here, `- 300 ml milk` was replaced by `- 250 ml milk`, and `- a pinch of salt` was added. The first character of each line is the diff's marker; the `-` after it belongs to the recipe's list.

After `git add pancakes.md`, the second `git diff` prints nothing, because the working tree and the staging area now match. The change has not vanished: `git diff --staged` shows exactly the same diff, because the change now sits between the staging area and the last commit. Once you commit, `git show` displays it once more, with the commit's hash, author, date and message above it.

`git diff` can also compare two commits: `git diff <older> <newer>`, with hashes from `git log --oneline`. The diff then shows how the newer commit differs from the older one: lines marked `-` are only in the older commit, and lines marked `+` only in the newer one. Exercise 2 practises this.

## Undoing changes you have not committed {#s3}

Mistakes are easiest to undo before they reach a commit. Two forms of `git restore` cover the two cases:

- `git restore <file>` throws away your edits to a file. It replaces the file in the working tree with the version in the staging area, which is the version from the last commit unless you have staged something since.
- `git restore --staged <file>` unstages a file. It takes the change out of the staging area, so that it will not go into the next commit, but leaves your edit in the working tree.

You do not need to memorise either: `git status` suggests both in its hints, as the session shows. First, the README's description has been deleted by accident. Then a change to the pancake recipe, three eggs instead of two, is staged before it is ready.

{{SESSION:m03-restore}}

After `git restore README.md`, `git status` reports a clean working tree, and `cat` shows the description again. After `git restore --staged pancakes.md`, the change is back under "Changes not staged for commit": the three eggs are still in the file, but they are no longer staged. If you are following along, run `git restore pancakes.md` now to throw that edit away as well, so that your working tree is clean for the next section.

::: pitfall
`git restore <file>` without `--staged` throws away edits that were never committed. Git never had a copy of them, so it cannot bring them back. If you are unsure, look at `git diff` first.
:::

Older guides and many answers online use `git checkout -- <file>` to throw away edits and `git reset HEAD <file>` to unstage. Both still work, but `git restore`, added in Git 2.23, says what it does, and it is what `git status` suggests.

## Fixing the last commit {#s4}

Sometimes you notice a mistake just after committing: a typo in the message, or a file you forgot to stage. As long as you have not shared the commit, `git commit --amend` fixes it by replacing the last commit with a new one:

- `git commit --amend -m "new message"` gives the commit a new message.
- `git commit --amend --no-edit` keeps the message, and adds whatever you have staged since.

With neither option, Git opens your editor with the old message, ready to change. In the session, you commit a soda bread recipe with a typo in the message, correct the message, and then notice that the recipe has no raising agent.

{{SESSION:m03-amend}}

Look at the hashes. The first commit was `087bb2c`; after the first amend the newest commit is `3fc0d24`, and after the second it is `31783ba`. Amending does not edit a commit in place, because a commit never changes once it is made. Git makes a new commit, with the same parent as the old one, and moves the branch to it. The old commit is no longer part of the branch, which is why `git log --oneline -n 2` shows `31783ba` directly above `1ad5842`. `git show --stat` confirms that the new commit holds all five lines of `bread.md`.

The `Date:` line in each amend's output is the time of the original commit: an amended commit keeps its original author and date.

::: pitfall
Amend only commits you have not shared. If someone already has the old commit, amending leaves you with a history that differs from theirs. Module 8 covers rewriting history, and why to avoid it on shared branches.
:::

## Undoing a commit {#s5}

`--amend` reaches only the newest commit, and it rewrites history. For a commit that is older, or that others already have, use `git revert <commit>`. It removes nothing: it makes a new commit that undoes the old commit's changes. Lines that the old commit added are removed, and lines it removed are put back.

You name the commit to undo by its hash, or as `HEAD`, Git's name for the commit you are on, normally the newest on your branch. Revert needs a clean working tree, so commit or restore your edits first. In the session, a mistake slips in: the pancake recipe asks for 2000 g of flour instead of 200 g.

{{SESSION:m03-revert}}

`git revert HEAD` made a new commit, `4407f3a`, with the message `Revert "Use more flour"`. On your computer, Git first opens your editor with this ready-made message, followed by a line saying which commit it reverts. Save and close the editor to accept it; the sessions here accept it automatically. The `Date:` line is simply the time of the new commit.

The log now shows both commits: the mistake, `654de4f`, and the commit that undoes it, `4407f3a`. That may look untidy, but it is honest, and it is safe on a branch that others share: nobody's history is rewritten, they simply receive one more commit. `cat` confirms that the recipe asks for 200 g of flour again.

You can revert any commit, not only the newest, by giving its hash. If later commits changed the same lines, Git may stop with a conflict for you to resolve, which Module 5 explains.

## Looking at an old version {#s6}

Sometimes you want to see how the project looked earlier: to find out when something still worked, or to copy an old paragraph back. Git offers two safe ways to look.

To see one file, use `git show <commit>:<file>`. It prints the file as it was in that commit, and changes nothing. You can name a commit by its hash, or by counting back from HEAD: `HEAD~1` is the commit before the one you are on, and `HEAD~2` the one before that.

To see the whole project, use `git switch --detach <commit>`. It puts every file in the working tree back to that commit, so that you can look around, open files or run the project, and it leaves your branch untouched. HEAD, Git's marker for where you are, then points straight at a commit instead of at a branch. Git calls this a **detached HEAD**.

You have made more commits by now, so in your repository `HEAD~2` is a different commit. To follow along, use the hash of your first commit, *Add a README*, from `git log --oneline`.

{{SESSION:m03-old-version}}

`git show HEAD~2:README.md` printed the README's first wording, and `git switch --detach HEAD~2` reported the move: `HEAD is now at 907a979 Add a README`. `git status` no longer says *On branch main* but *HEAD detached at 907a979*, and `cat README.md` shows the old wording in the working tree itself.

The graph shows where everything is. `main` still points at the newest commit, `1ad5842`, while HEAD sits alone on `907a979`. Nothing has been lost or changed: the newer commits are all still there, and `git switch main` takes you back. Git tells you where you came from (*Previous HEAD position was 907a979*), and `git status` says *On branch main* again.

::: tip
A detached HEAD is fine for looking around. If you make commits there and want to keep them, create a branch for them with `git switch -c <name>` before you switch away. Exercise 6 shows why.
:::

Older guides use `git checkout <commit>` for the same thing. It detaches HEAD as well, and prints a longer explanation when it does.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**Which command shows it?** Name the command that shows each of these.

1. The changes you have made but not yet staged.
2. The changes you have staged for the next commit.
3. What the last commit changed.
4. Every commit that changed `pancakes.md`.
:::

::: solution
1. `git diff`
2. `git diff --staged`
3. `git show`
4. `git log --oneline pancakes.md` (or `git log pancakes.md` for the full entries)
:::

::: exercise #e2 level=1 kind=coding minutes=8
**Compare two commits.** In the recipes repository, show everything that changed between the first commit and the newest one.
:::

::: solution
List the commits to see how far back the first one is, then compare it with `HEAD`:

{{SESSION:m03-e2-solution}}

`HEAD~2` is the first commit here. The diff shows the reworded line in `README.md`, and the whole of `pancakes.md` as added lines, because the file did not exist in the first commit.
:::

::: exercise #e3 level=1 kind=conceptual minutes=7
**Choose the undo.** Which command fits each situation?

1. You edited `README.md` and want the committed version back.
2. You staged `notes.md` by mistake, but want to keep your edits.
3. The last commit, which you have not shared, has a typo in its message.
4. A commit from last week, already shared with your team, broke the bread recipe.
:::

::: solution
1. `git restore README.md`
2. `git restore --staged notes.md`
3. `git commit --amend -m "…"` with the corrected message
4. `git revert <hash>`, which undoes the commit with a new commit instead of rewriting shared history
:::

::: exercise #e4 level=2 kind=coding minutes=10
**Stop tracking a file.** Suppose that `passwords.txt` was committed by mistake, as in Module 2's last exercise. Keep the file on your disk, but stop tracking it from now on. To try it, first create `passwords.txt` with any text, and commit it.
:::

::: solution
List the file in `.gitignore`, remove it from the staging area only, and commit. The session's repository has no `.gitignore` yet; if yours has one, add the line `passwords.txt` to it and keep the lines already there.

{{SESSION:m03-e4-solution}}

`git rm --cached` removes the file from the next commit but leaves it on disk, as `ls` shows. The passwords are still in the older commits, so change them, as Module 2 advised.
:::

::: exercise #e5 level=1 kind=coding minutes=7
**Forgot a file.** You committed `bread.md`, then noticed that `butter.md`, part of the same change, was never added. Fix this without making a second commit. When should you not do this?
:::

::: solution
Stage the file and amend the commit, keeping its message:

```text
git add butter.md
git commit --amend --no-edit
```

Do not amend a commit you have already shared: amending replaces it with a new commit, and anyone who has the old one ends up with a different history (Module 8).
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**Commits on a detached HEAD.** You ran `git switch --detach HEAD~2`, edited a file and made a commit. What happens when you run `git switch main`? How can you keep the commit?
:::

::: solution
Git switches, but warns that you are leaving a commit behind that is not connected to any of your branches, and suggests a `git branch` command with its hash. The commit still exists, but no branch points at it.

To keep it, create a branch before you switch away: `git switch -c rescue`. If you have already switched, the hash in Git's warning (or the reflog, in Module 8) lets you create the branch afterwards.
:::

## Self-check quiz {#quiz}

```quiz
? Which command shows the changes you have staged but not yet committed?
- [ ] `git diff`
- [x] `git diff --staged`
- [ ] `git log`
- [ ] `git status --all`
> `git diff` compares the working tree with the staging area; `--staged` compares the staging area with the last commit.

? In a diff, what does a line starting with `+` mean?
- [ ] The line was removed.
- [ ] The line is unchanged context.
- [x] The line was added.
- [ ] The line has a conflict.
> `+` marks added lines, `-` removed lines, and a leading space unchanged context.

? You want to throw away your uncommitted edits to `README.md`. Which command does that?
- [ ] `git revert README.md`
- [ ] `git restore --staged README.md`
- [ ] `git commit --amend`
- [x] `git restore README.md`
> `git restore <file>` replaces the working-tree file with the staged version; `--staged` only unstages.

? What does `git commit --amend` do?
- [x] It replaces the last commit with a new one.
- [ ] It adds a note to an old commit without changing it.
- [ ] It undoes the last commit with a new commit.
- [ ] It merges the last two commits.
> Amending makes a new commit, with a new hash, in place of the last one.

? A commit you shared last week introduced a bug. What is the safe way to undo it?
- [ ] `git commit --amend`
- [x] `git revert <commit>`
- [ ] Delete the `.git` folder
- [ ] `git restore`
> `git revert` adds a new commit that undoes the old one, without rewriting shared history.

? What does "HEAD detached at 907a979" mean?
- [ ] The repository is damaged.
- [ ] HEAD has been deleted.
- [x] You are looking at a commit directly, not at a branch.
- [ ] Commit 907a979 is not in the history.
> HEAD normally points at a branch; detached, it points straight at a commit.

? What does `HEAD~2` refer to?
- [x] The commit two before the current one
- [ ] The second branch
- [ ] The two newest commits
- [ ] A file called `HEAD~2`
> `~2` means "go back two commits from HEAD".
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [2.3: Viewing the Commit History](https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History) and [2.4: Undoing Things](https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things).
- The reference pages for [git log](https://git-scm.com/docs/git-log), [git diff](https://git-scm.com/docs/git-diff), [git restore](https://git-scm.com/docs/git-restore) and [git revert](https://git-scm.com/docs/git-revert).
