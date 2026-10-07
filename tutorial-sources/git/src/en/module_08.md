## The one rule {#s1}

This module gives you tools that change history: commands that move a branch backwards, replay commits somewhere else, or fold several commits into one. Used on your own work, they help you keep a clean, readable history. Used carelessly on shared work, they cause real trouble. So first, the one rule:

::: keyidea
**Do not rewrite commits that other people already have.** Once you have pushed commits to a branch that others use, such as `main`, treat them as fixed. Undo them with `git revert` (Module 3), which adds a new commit, rather than by rewriting them.
:::

Why? Rewriting history never edits commits; it makes new ones, with new hashes, and moves the branch to them, as you saw with `--amend` in Module 3. Everyone who already has the old commits now has a history that no longer matches yours. Their next pull merges the old and new versions together, duplicating work. Your next push is rejected, and forcing it throws their work away.

On your own branches, before anyone else builds on them, rewriting is fine, and often a kindness to reviewers. A feature branch that only you work on, even one already pushed for a pull request, counts as yours, as long as you tell Git that you mean to overwrite it (Section 4).

Two tools in this module rewrite nothing: `git stash` (Section 2) puts uncommitted work aside, and `git reflog` (Section 6) finds commits you thought you had lost.

## Putting work aside {#s2}

You are half-way through a change when something more urgent comes up: a fix on another branch, or a colleague's pull request to try. Your work is not ready to commit, and switching branches with uncommitted changes is risky (Module 4, Exercise 4). `git stash` solves this. It saves your uncommitted changes, both staged and unstaged, on a stack called the **stash**, and returns your working tree to the last commit. Later, `git stash pop` puts the changes back and removes them from the stash.

In the session, Alex is adding an ingredient to the pancakes when the README needs fixing first. To follow along, start an edit to any tracked file, then stash it.

{{SESSION:m08-stash}}

`git stash` reports what it saved, `WIP on main` ("work in progress"), and names the commit it was based on. `git status` then shows a clean working tree, and `git stash list` shows one entry, `stash@{0}`, the newest. With a clean tree, Alex commits the README change. `git stash pop` brings the half-written pancake line back as an unstaged change, and `git diff` shows it waiting to be finished.

A few more things to know:

- `git stash` saves only tracked files. To include new, untracked files, use `git stash -u`.
- `git stash list` shows every entry, newest first. `git stash apply` puts the newest back but keeps it on the stash; `git stash drop` deletes it.
- If the stashed changes conflict with what you have committed since, `git stash pop` stops with conflict markers. Resolve them as in Module 5, then run `git stash drop`, because in that case the entry is kept.
- Stashes are local: they are not pushed. Do not leave work there for long; a branch with a work-in-progress commit is easier to find again.

## Taking back commits {#s3}

`git reset <commit>` moves your current branch back to an earlier commit, taking back the commits after it. Unlike `git revert`, it rewrites history, so use it only on commits that you have not pushed. Its options say what happens to the changes those commits contained:

- `git reset --soft <commit>` moves only the branch. The changes stay in the staging area, ready to commit again.
- `git reset <commit>`, the default, called *mixed*, also resets the staging area. The changes stay in your working tree, unstaged.
- `git reset --hard <commit>` also resets the working tree. The changes are gone from your files, and so is any uncommitted work.

::: figure #fig-08-01
What each form of `git reset` keeps. All three move the branch back; they differ in what happens to the staging area and the working tree.
:::

As in Module 3, `HEAD~1` means "one commit before HEAD". In the session, Alex commits a pinch of salt with a vague message, takes the commit back with `--soft` and commits again with a better message, then takes it back once more with the default reset. To follow along, add a line to any recipe and commit it with `git commit -am`.

{{SESSION:m08-reset}}

`git reset --soft HEAD~1` prints nothing, but `git status` shows the salt as *Changes to be committed*: the commit is gone, and its change is staged again. That makes `--soft` a way to redo a commit, for example to merge the last few commits into one: reset back over them with `--soft`, then commit once.

After the default reset, Git reports `Unstaged changes after reset:` and lists `pancakes.md`. `git status` agrees: the change is now unstaged, in the working tree. This is the way to split a commit into smaller ones: reset it, then stage and commit the parts separately. `git log --oneline` confirms that both salt commits are gone from `main`.

::: pitfall
`git reset --hard` throws away uncommitted changes in your working tree, and Git cannot bring those back. Commits it takes back can usually be recovered from the reflog (Section 6), but uncommitted work cannot. Run `git status` first, and stash anything you want to keep.
:::

## Rebasing {#s4}

In Module 7, Alex brought a feature branch up to date by merging `origin/main` into it. **Rebasing** is the other way. `git rebase main` takes the commits on your branch that `main` does not have, and replays them, one by one, on top of the newest commit of `main`. The result is the same files as a merge, but a straight line of history with no merge commit, as if you had started the branch from today's `main`.

Replaying makes new commits, with new hashes, so rebasing rewrites the branch. That is fine for your own feature branch, but it has a consequence when the branch is already pushed, and the session shows it. Alex's `soups` branch is on the server, and `main` has moved on. To follow along, make a commit on a branch and push it, then add a commit to `main`.

{{SESSION:m08-rebase}}

Compare the graphs. Before, `soups` and `main` have split, as in a three-way merge. After `git rebase main`, which reports `Successfully rebased and updated refs/heads/soups`, the soup commit sits on top of `main`'s newest commit as a new commit, `a11c867`. The old soup commit, `968c34b`, is still where `origin/soups` points: the server has not changed.

So `git push` is rejected as `non-fast-forward`: the server's `soups` contains `968c34b`, which your rebased branch has replaced. Here you know the branch is yours, so you overwrite it with `git push --force-with-lease`. Git reports `(forced update)`. `--force-with-lease` refuses if the server's branch is not where your `origin/soups` says it is, that is, if someone pushed to it since you last fetched. Plain `--force` overwrites regardless, which can destroy a colleague's work; avoid it.

When should you rebase rather than merge? Many teams rebase their own feature branches to keep history linear, and merge when the branch is finished. Others always merge. Either way, the one rule applies: never rebase a branch that others are working on. Remember too that `git pull` can rebase instead of merge, with `git pull --rebase` or the `pull.rebase true` setting from Module 6.

If a replayed commit conflicts, the rebase stops, much like a merge. Resolve the file, `git add` it, then run `git rebase --continue`; or `git rebase --abort` to go back to where you started. Exercise 5 shows one, and a difference from merging that surprises everyone the first time.

## Squashing a fix {#s5}

Before a branch is reviewed, you may notice a mistake in one of its earlier commits: a typo, a forgotten line. A separate "fix typo" commit makes the history noisier for everyone who reads it later. An **interactive rebase**, `git rebase -i`, lets you edit the list of commits before they are replayed: reorder them, reword their messages, drop them, or **squash** several into one.

The easiest way to squash a fix is to let Git write the instructions for you:

1. Make the fix, and commit it with `git commit --fixup <commit>`, naming the commit it belongs to. Git gives it the message `fixup! ` followed by that commit's message.
2. Run `git rebase -i --autosquash main`. Git opens your editor with a **to-do list**, one line per commit on the branch, already arranged so that the fixup follows the commit it fixes, marked `fixup`.
3. Save and close the editor. Git replays the commits, folding the fix into the earlier commit.

In the session, the soup recipe's title has a typo, "Tomatoe", and a bread recipe has been committed since. To follow along, make two commits on a branch, then fix something from the first.

{{SESSION:m08-squash}}

`git commit --fixup HEAD~1` names the commit before the newest, the soup commit, and Git calls the new commit `fixup! Add a tomato soup recipe`. When you run `git rebase -i --autosquash main` on your computer, the editor shows this to-do list (followed by a long comment explaining the commands):

```text
pick bc5616c # Add a tomato soup recipe
fixup 2b52993 # fixup! Add a tomato soup recipe
pick 49f29eb # Add a soda bread recipe

# Rebase 8bf3c2d..2b52993 onto 8bf3c2d (3 commands)
```

Each line is a command and a commit, applied from top to bottom: `pick` replays a commit as it is, and `fixup` folds it into the commit above, keeping that commit's message. Saving the list unchanged runs it, as the session does. The final `git log --oneline` shows two commits instead of three, with new hashes: the soup commit now contains the corrected title.

You can also edit the list yourself. Change `pick` to `reword` to change a message, to `squash` to fold a commit into the one above and combine both messages, or to `drop` to remove it; move lines to reorder commits. If you save an empty list, the rebase stops without changing anything.

## The reflog {#s6}

Commits that no branch points at any more are not deleted at once. Git keeps them for a while, and the **reflog**, short for *reference log*, records every position HEAD has had: each commit, reset, switch, merge and rebase. `git reflog` lists them, newest first, so you can find a commit that a hard reset, a rebase or a deleted branch took away.

In the session, Alex resets two commits away by mistake, then gets them back. To follow along, make two commits, then `git reset --hard HEAD~2`.

{{SESSION:m08-reflog}}

After `git reset --hard HEAD~2`, `git log --oneline` no longer shows the cake and soup commits. `git reflog` still does. Each line shows where HEAD was, a name for that position, and what moved it: `HEAD@{0}` is now (`reset: moving to HEAD~2`), and `HEAD@{1}` is just before, after the soup commit `ab03771`. `git reset --hard ab03771` moves `main` back there, and the log is exactly as it was.

To rescue a commit without moving your branch, create a new branch at it instead, for example `git branch rescue ab03771`. That also brings back a branch deleted with `git branch -D`: find its last commit in the reflog, and create the branch again.

::: note title="HEAD@{1} and PowerShell"
You can also name positions in the reflog directly, as in `git reset --hard HEAD@{1}`. In PowerShell, put such names in quotes, `'HEAD@{1}'`, because PowerShell gives braces a meaning of its own. The hash from the reflog works in every shell.
:::

The reflog has limits: it is local to your repository and never pushed, and Git eventually deletes old entries, by default after 90 days, or 30 days for commits no longer on any branch. And it records commits only, so it cannot help with uncommitted changes lost to `git reset --hard` or `git restore`. Commit often, and very little can be lost for good.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**Safe to rewrite?** Which of these are safe? Explain each.

1. Amending your last commit, which you have not pushed.
2. Rebasing your feature branch, pushed for a pull request that only you work on, and pushing it with `--force-with-lease`.
3. Resetting `main` back two commits, after pushing those commits to the shared repository.
4. Reverting a commit on `main` that the whole team has.
:::

::: solution
1. Safe: nobody else has the commit.
2. Safe: the branch is yours, and `--force-with-lease` stops if someone has pushed to it after all. Tell reviewers you have rewritten it.
3. Not safe: the team already has those commits. Use `git revert` instead.
4. Safe: reverting adds a new commit and rewrites nothing.
:::

::: exercise #e2 level=1 kind=coding minutes=5
**An urgent fix.** You are half-way through a soup recipe on the `soups` branch when the README on `main` needs a fix. Put your work aside, make the fix on `main`, and return to your soup with your work restored. To follow along, start an edit on a branch without committing it.
:::

::: solution
Stash, switch, commit the fix, switch back and pop:

{{SESSION:m08-e2-solution}}

The stash entry records the branch it came from (`WIP on soups`), but you can pop it on any branch.
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**Which reset?** None of these commits has been pushed. Which form of `git reset HEAD~1` fits each situation?

1. Your last commit mixes two unrelated changes, and you want to commit them separately.
2. You want to add one more file to your last commit and write a better message.
3. Your last commit was a failed experiment, and you want neither the commit nor its changes.
:::

::: solution
1. The default (mixed): the changes come back unstaged, so you can stage and commit each part separately.
2. `--soft`: the changes stay staged; add the file and commit again. (`git commit --amend` does the same in one step.)
3. `--hard`: the commit and its changes are gone. Check `git status` first, so that you do not lose uncommitted work.
:::

::: exercise #e4 level=2 kind=conceptual minutes=5
**A deleted branch.** Yesterday you deleted a branch called `experiment` with `git branch -D`, and today you need one of its commits. How do you get the branch back?
:::

::: solution
Run `git reflog` and find `checkout: moving from experiment to main`. The hash on that line is where HEAD went, the tip of `main`; the line just below it shows where HEAD was before, the last commit of `experiment`. Note that hash, then run `git branch experiment <hash>`. The branch is back, with all its commits.
:::

::: exercise #e5 level=2 kind=coding minutes=7
**A conflict during a rebase.** On `less-sugar`, you changed the sugar to 30 g; meanwhile `main` changed it to 40 g. Rebase `less-sugar` onto `main`, settling on 35 g. To follow along, make the two changes as in Module 5, Section 3, but on a new branch such as `less-sugar-2`, because `less-sugar` already exists in your repository.
:::

::: solution
The rebase stops at the conflicting commit. Resolve the file, stage it, and continue:

{{SESSION:m08-e5-solution}}

Look at the markers: in a rebase, `<<<<<<< HEAD` holds `main`'s version, 40 g, and `>>>>>>> cbca0db (Use less sugar)` holds yours. The labels are the other way round from a merge, because a rebase replays your commits on top of `main`, so HEAD is the new base. `git rebase --continue` then commits the replayed commit, letting you edit its message on your computer, and finishes the rebase.
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**Which tool?** Name the command for each situation.

1. The message of your last commit, not yet pushed, has a typo.
2. A commit on the shared `main` broke the build.
3. You need a clean working tree for ten minutes, without committing.
4. Your pull request has a "fix typo" commit that belongs in an earlier commit.
5. You reset too far and need the commits back.
:::

::: solution
1. `git commit --amend`.
2. `git revert <commit>`.
3. `git stash`, then `git stash pop`.
4. `git commit --fixup <commit>` and `git rebase -i --autosquash main`, then `git push --force-with-lease`.
5. `git reflog`, then `git reset --hard <hash>`.
:::

## Self-check quiz {#quiz}

```quiz
? What is the rule about rewriting history?
- [ ] Never use `git rebase`.
- [x] Do not rewrite commits that other people already have.
- [ ] Only rewrite history on `main`.
- [ ] Always use `--force` after rewriting.
> On your own unpushed or unshared work, rewriting is fine; shared commits are undone with `git revert`.

? What does `git stash` do?
- [ ] It commits your changes on a hidden branch on the server.
- [x] It saves your uncommitted changes and returns your working tree to the last commit.
- [ ] It deletes your uncommitted changes.
- [ ] It moves the branch back one commit.
> `git stash pop` brings the changes back later.

? After `git reset --soft HEAD~1`, where are the last commit's changes?
- [x] In the staging area
- [ ] Only in the reflog
- [ ] Gone
- [ ] On a new branch
> `--soft` moves only the branch; the default reset unstages the changes, and `--hard` removes them.

? Which command can destroy uncommitted work for good?
- [ ] `git reset --soft HEAD~1`
- [ ] `git stash`
- [ ] `git rebase main`
- [x] `git reset --hard HEAD~1`
> `--hard` resets the working tree; uncommitted changes are not in the reflog.

? After rebasing a branch you had already pushed, why is `git push` rejected?
- [ ] The rebase failed.
- [x] The rebased commits replace the pushed ones, so the push is not a fast-forward.
- [ ] Rebased branches cannot be pushed.
- [ ] The remote is out of date.
> If the branch is yours alone, push with `--force-with-lease`.

? During a rebase onto `main`, which version lies between `<<<<<<< HEAD` and `=======`?
- [ ] Your branch's version
- [x] `main`'s version, the base the commits are being replayed onto
- [ ] The version from the first commit
- [ ] Git's suggested resolution
> In a rebase, HEAD is the new base; your commit's version comes after `=======`.

? What does `git reflog` show?
- [ ] Every commit on the remote
- [ ] The commits that are about to be pushed
- [x] Where HEAD has been, including commits no longer on any branch
- [ ] Changes you have not committed
> Use a hash from the reflog to reset or create a branch, and get lost commits back.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [3.6: Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing), [7.3: Stashing and Cleaning](https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning), [7.6: Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) and [7.7: Reset Demystified](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified).
- The reference pages for [git stash](https://git-scm.com/docs/git-stash), [git reset](https://git-scm.com/docs/git-reset), [git rebase](https://git-scm.com/docs/git-rebase) and [git reflog](https://git-scm.com/docs/git-reflog).
