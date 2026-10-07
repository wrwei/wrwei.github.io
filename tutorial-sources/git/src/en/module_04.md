## What a branch is {#s1}

So far, every commit has gone onto one line of history. Real work rarely stays that tidy. You may want to try a new recipe without disturbing the ones that work, or fix a typo while a bigger change is half done. **Branches** let you keep separate lines of work side by side, and combine them when they are ready.

In Git, a branch is simply a **movable label that points at a commit**. Creating one copies nothing: Git writes down the new name and the commit it points at, and that is all. This is why branches are cheap and fast, and why it is normal to create one for every idea, however small, and delete it afterwards.

`main` is an ordinary branch. It has no special powers; it is just the branch a repository starts with, and the one most projects treat as the main line.

The label is what makes a branch move. When you commit, Git makes the new commit and moves the label of the branch you are on forward to it. The other branches stay where they were. So each branch grows its own line of commits, and they all share the history from before they split.

::: analogy
Branches are like bookmarks in a book rather than photocopies of it. A bookmark costs nothing, you can have several, and you can move each one on as you read. The pages themselves exist only once.
:::

Most work with branches follows the same short cycle, which this module walks through:

1. Create a branch for one piece of work, and switch to it.
2. Commit on it as often as you like. `main` is not affected.
3. When the work is ready, switch back to `main` and merge the branch into it.
4. Delete the branch, which has done its job.

## Creating and switching branches {#s2}

Two commands do most of the work:

- `git branch` lists your branches, with an asterisk (`*`) next to the one you are on. `git branch <name>` creates a new branch at the commit you are on, but does not switch to it.
- `git switch <name>` moves you onto a branch. It updates the files in your working tree to match the branch's newest commit.

The sessions in this module start from a small recipes repository with two commits, a README and a pancake recipe. Your own repository has more commits and different hashes, which changes nothing about the commands. In this session, you create a branch for desserts and add a cake recipe on it.

{{SESSION:m04-branches}}

Right after `git branch desserts`, the list shows two branches, and the asterisk shows that you are still on `main`. The first graph shows why creating the branch was instant: `desserts` and `main` are two labels on the same commit, `288d56b`.

The graphs on these pages show commits as circles, newest at the top, with a line from each commit down to its parent. Labels name the branches that point at each commit, and `HEAD → main` marks the branch you are on. In a terminal, `git log --oneline --graph --all` draws the same picture in text.

After `git switch desserts` and a commit, the second graph shows that only the `desserts` label moved, to the new commit `ccf2a69`. `main` stays on `288d56b`.

Now look at the two `ls` commands. On `main`, the folder holds only `README.md` and `pancakes.md`; on `desserts`, `cake.md` is back. Switching branches changes the files in your folder to match the branch you switch to. The cake recipe was never lost: it lives in the `desserts` commit, and Git puts it back whenever you switch to that branch.

## HEAD {#s3}

You have seen HEAD in Module 3 and in the graphs above. **HEAD** is Git's name for "where you are now". Normally it points at a branch, and the branch points at a commit: in the graphs, `HEAD → desserts` means that you are on `desserts`, and that `desserts` points at that commit.

This two-step arrangement explains the two kinds of movement you have seen:

- When you **commit**, Git moves the branch that HEAD points at to the new commit. HEAD goes along, because it points at the branch.
- When you **switch**, Git moves HEAD itself to another branch, and changes your files to match. No branch label moves.

`git status` reports where HEAD is in its first line: *On branch main* means that HEAD points at `main`.

The detached HEAD from Module 3 fits the same picture. After `git switch --detach`, HEAD points straight at a commit instead of at a branch, so a new commit there moves no branch label. That is why such commits are easy to lose, and why you create a branch before you switch away from them.

## Fast-forward merges {#s4}

Sooner or later you want the work from one branch in another. `git merge <branch>` brings the named branch's work into the branch you are on. So first switch to the branch that should receive the work, usually `main`, and then merge.

How Git merges depends on how the two branches relate. The simplest case is when the other branch contains everything on your branch, plus some newer commits. Then there is nothing to combine: Git simply moves your branch's label forward to the other branch's newest commit. This is called a **fast-forward**, and it makes no new commit.

In the session, you are on `main`, and `desserts` is one commit ahead with a cake recipe, as the first graph shows. To follow along, run `git switch main` first.

{{SESSION:m04-fast-forward}}

Git reports `Updating 288d56b..4d632df` and `Fast-forward`: it moved `main` from `288d56b` to `4d632df`, `desserts`' newest commit. The summary below lists what the merge brought in, the new file `cake.md`. Compare the graphs before and after. The commits did not change; only the `main` label jumped forward, so that `main` and `desserts` now point at the same commit.

The name *fast-forward* describes what happened: `main` was behind, and Git wound it forward along commits that already existed, the way you would fast-forward a recording.

With its work merged, the `desserts` branch has done its job. `git branch -d desserts` deletes it, and Git reports which commit the label was on (`was 4d632df`). Only the label goes. The commits stay, because `main` contains them, and `git branch` now lists only `main`.

Git refuses `-d` for a branch whose commits are not contained in the branch you are on, to protect work that would otherwise be on no branch at all. Exercise 5 shows what to do then.

## Three-way merges {#s5}

Often both branches move on after they split. You add a soup recipe on a `soups` branch while someone adds salt to the pancakes on `main`. Now neither branch contains the other, and Git cannot just move a label. Instead it makes a **merge commit**: a new commit that combines the work of both branches. Unlike every commit so far, it has two parents, one on each branch.

The session starts from the first graph: `soups` has a tomato soup commit, and `main` has a salt commit that `soups` lacks. To follow along, set that up yourself: create `soups`, commit a soup recipe on it, switch back to `main`, and commit a change to `pancakes.md`. Then merge.

A merge commit needs a message. On your computer, Git opens your editor with a ready-made one, `Merge branch 'soups'`. Save and close the editor to accept it; the session keeps it as it is.

{{SESSION:m04-three-way}}

Compare the two graphs. Before the merge, the branches have split after `288d56b`: `main` went one way, `soups` the other. After it, the merge commit `e59bfd4` joins them, with lines down to both of its parents, `5049848` on `main` and `689ed1b` on `soups`. `main` moved to the merge commit; `soups` stayed where it was, and could now be deleted with `git branch -d soups`.

`Merge made by the 'ort' strategy.` names the method Git used to combine the changes. You do not need to know more about it. Versions of Git older than 2.34 used a method called `recursive` by default, and print that name instead.

`git log --oneline --graph` draws the same shape in text. The merge commit is at the top, and the `|\` and `|/` lines show the history splitting into two lines and joining again, with each branch's commit on its own line.

This is called a **three-way merge**, because Git compares three versions of the project: the newest commit on each branch, and the commit where the branches split. Whatever changed on only one side since the split is taken from that side. When both sides changed the same lines, Git cannot decide alone. That is a conflict, the subject of Module 5.

::: keyidea
A merge never changes existing commits. If your branch has nothing the other lacks, Git fast-forwards it: the label moves and no commit is made. If both branches have new commits, Git adds a merge commit with two parents. Either way, every commit from both branches ends up in your branch's history.
:::

## Tidying up branches {#s6}

A few more commands make branches quicker to use:

- `git switch -c <name>` creates a branch and switches to it in one step. It is the usual way to start new work.
- `git branch -v` lists each branch with its newest commit.
- `git switch -` goes back to the branch you were on before.
- `git branch -m <old> <new>` renames a branch.

In the session, you start a breakfast branch, then decide it should be called brunch.

{{SESSION:m04-switch-c}}

`git branch -v` shows the porridge commit `5ad8c30` on the new branch, and `main` still on `288d56b`. After `git switch -` takes you back to `main`, the rename changes only the name: `brunch` points at the same commit as `breakfast` did.

Older guides use `git checkout -b <name>` to create a branch and switch to it, and `git checkout <name>` to switch. They still work; `git switch` does the same jobs and is harder to misuse.

Name branches after what they are for: short, lower case, with hyphens between words, such as `fix-oven-temperature`. Slashes are allowed, and teams often use them to group branches, as in `feature/login`.

Delete branches once they are merged. A short `git branch` list shows at a glance which work is still in progress.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**True or false?**

1. Creating a branch copies all your files.
2. A branch is a label that points at a commit.
3. When you commit, the label of the branch you are on moves to the new commit.
4. Deleting a merged branch deletes its commits.
:::

::: solution
1. **False.** Creating a branch creates a label; no files are copied.
2. **True.**
3. **True.**
4. **False.** Only the label is deleted; the commits stay, because the branch they were merged into still contains them.
:::

::: exercise #e2 level=1 kind=conceptual minutes=7
**Fast-forward or merge commit?** Say which kind of merge each situation produces.

1. You create `fix-typo` from `main`, commit twice, and nobody changes `main`. Then you merge `fix-typo` into `main`.
2. You create `soups` from `main` and commit; meanwhile someone commits to `main`. Then you merge `soups` into `main`.
3. You are on your branch, which has no new commits, and you merge `main`, which has two new ones.
:::

::: solution
1. **Fast-forward.** `main` has not moved, so its label can jump to `fix-typo`'s newest commit.
2. **Merge commit.** Both branches have new commits, so Git creates a commit with two parents.
3. **Fast-forward** of your branch: it contains nothing that `main` lacks, so its label simply moves to `main`'s newest commit.
:::

::: exercise #e3 level=1 kind=coding minutes=10
**A feature branch.** Create a branch called `drinks`, make two commits on it, merge it into `main` and delete it.
:::

::: solution
{{SESSION:m04-e3-solution}}

Because `main` did not move while you worked on `drinks`, the merge is a fast-forward, and `git log --oneline` shows a straight line.
:::

::: exercise #e4 level=2 kind=conceptual minutes=7
**Uncommitted changes and switching.** You edited `pancakes.md` without committing and run `git switch desserts`. What can happen?
:::

::: solution
If `pancakes.md` is the same on both branches, Git switches and carries your uncommitted edit along. If switching would overwrite your edit, because the file differs on `desserts`, Git refuses with "Your local changes to the following files would be overwritten by checkout" and leaves everything as it was. Commit your change first, or put it aside with `git stash` (Module 8).
:::

::: exercise #e5 level=1 kind=coding minutes=8
**Delete a branch that was never merged.** A branch called `experiment` holds a recipe that did not work. Delete the branch.
:::

::: solution
`git branch -d` refuses, because the branch has commits that no other branch contains; `-D` deletes it anyway:

{{SESSION:m04-e5-solution}}

Use `-D` with care: the commit is no longer on any branch. For a while it can still be found through the reflog (Module 8).
:::

::: exercise #e6 level=2 kind=conceptual minutes=8
**Read the graph.** `git log --oneline --graph --all` prints:

```text
* 5049848 (HEAD -> main) Add salt to the pancakes
| * 689ed1b (soups) Add a tomato soup recipe
|/
* 288d56b Add a pancake recipe
* 02804ba Add a README
```

Which branch are you on? Which commits are on both branches? What would `git merge soups` do?
:::

::: solution
You are on `main`. Commits `288d56b` and `02804ba` are on both branches. Both branches have a commit the other lacks, so `git merge soups` would create a merge commit whose parents are `5049848` and `689ed1b`, exactly as in Section 5.
:::

## Self-check quiz {#quiz}

```quiz
? What is a branch in Git?
- [ ] A copy of all the project's files
- [x] A movable label that points at a commit
- [ ] A backup of the repository
- [ ] A connection to a server
> Creating a branch copies nothing; it is a label that moves forward as you commit.

? Which command creates a branch and switches to it?
- [ ] `git branch -v`
- [ ] `git switch -`
- [x] `git switch -c <name>`
- [ ] `git merge <name>`
> `-c` creates the branch; `git branch <name>` creates it without switching.

? You are on `main` and run `git merge desserts`. `desserts` contains `main`'s newest commit plus two more. What happens?
- [x] A fast-forward: `main`'s label moves to `desserts`' newest commit.
- [ ] Git creates a merge commit with two parents.
- [ ] Git reports a conflict.
- [ ] The `desserts` branch is deleted.
> Nothing on `main` is missing from `desserts`, so no merge commit is needed.

? How many parents does a merge commit have?
- [ ] None
- [ ] One
- [ ] Three
- [x] Two
> It joins two lines of work, so it has one parent on each side.

? What does the label `HEAD → desserts` in a graph mean?
- [ ] The `desserts` branch has been deleted.
- [x] You are on `desserts`, and your next commit will move it.
- [ ] `desserts` is a detached HEAD.
- [ ] `desserts` has been merged into `main`.
> HEAD points at the branch you are on.

? `git branch -d experiment` reports that the branch is not fully merged. Why?
- [ ] The branch name is misspelt.
- [ ] You are on the `experiment` branch.
- [x] It has commits that the current branch does not contain.
- [ ] Git cannot delete branches.
> `-d` protects work that would no longer be on any branch; `-D` deletes anyway.

? Which older command does `git switch -c fix` replace?
- [x] `git checkout -b fix`
- [ ] `git branch -d fix`
- [ ] `git merge fix`
- [ ] `git commit -b fix`
> Older guides use `git checkout -b`; `git switch -c` does the same job.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [3.1: Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) and [3.2: Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging).
- The reference pages for [git branch](https://git-scm.com/docs/git-branch), [git switch](https://git-scm.com/docs/git-switch) and [git merge](https://git-scm.com/docs/git-merge).
- [Learn Git Branching](https://learngitbranching.js.org/), for extra practice with branches and merges in your browser.
