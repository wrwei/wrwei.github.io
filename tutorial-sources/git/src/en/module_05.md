## Why conflicts happen {#s1}

In Module 4, Git combined two branches on its own. It can do that because it merges line by line. It compares each branch with the commit where they split, and takes every change from whichever side made it. Changes to different files combine automatically, and so do changes to different parts of the same file.

Sometimes that is not enough. A **merge conflict** happens when both branches changed the same lines in different ways, or when one branch deleted a file that the other changed. Git cannot know which version is right: perhaps one is, perhaps you need parts of both, perhaps neither. So it does as much of the merge as it can, stops, and asks you to decide the rest.

A conflict is not an error, and it does not mean that anything is broken or lost. Both versions are safe, and Git shows you exactly where they disagree. Conflicts are a normal part of working with other people, and of working on several branches yourself. This module shows you how to read one, how to resolve it, how to back out when you are not ready, and how to keep conflicts rare and small.

Merging is not the only way to meet a conflict. Reverting an old commit (Module 3), pulling other people's work (Module 6) and rebasing (Module 8) combine changes in the same way, and can stop in the same way. The markers and the steps to resolve them are the same every time, so what you learn here applies to all of them.

::: analogy
Two editors mark up the same manuscript. One rewrites a sentence in chapter 2, the other fixes a typo in chapter 9, and both sets of changes go in. But if both rewrite the *same* sentence in different ways, someone has to decide which wording the book keeps.
:::

## When Git merges on its own {#s2}

First, a merge that succeeds although both branches changed the same file. The recipe starts with 200 g of flour and a 30-minute rest. On a branch called `resting-time`, the rest is shortened to 20 minutes; meanwhile, on `main`, the flour goes up to 250 g. The two changes are several lines apart. To follow along, make those two commits yourself, one on each branch, and merge from `main`.

{{SESSION:m05-no-conflict}}

`Auto-merging pancakes.md` says that Git had to combine changes inside the file, and the next line says that it succeeded and made a merge commit. `cat` shows the result: 250 g of flour from `main`, and 20 minutes from `resting-time`.

Changes on neighbouring lines can still conflict, even when they do not touch the same line. Git needs at least one unchanged line between two changes to tell them apart; without one, it treats them as a single change made differently on each side.

## Reading and resolving a conflict {#s3}

This time the two branches change the same line. The recipe starts with 50 g of sugar. On the branch `less-sugar`, someone changes it to 30 g ("Use less sugar"); meanwhile, on `main`, someone changes it to 40 g ("Reduce the sugar a little"). Both are reasonable, and they disagree, so Git cannot merge them alone.

In the session, you are on `main` and merge `less-sugar`. The merge stops with a conflict, and you resolve it step by step: look at the state with `git status`, read the file, edit it into the version you want, mark it resolved, and commit.

{{SESSION:m05-conflict}}

The merge reports `CONFLICT (content): Merge conflict in pancakes.md` and stops, as its last line says: `Automatic merge failed; fix conflicts and then commit the result.` The merge is now in progress, and it stays that way until you finish it or abort it. `git status` confirms this with `You have unmerged paths`, lists `pancakes.md` as `both modified`, and even suggests the next commands.

`cat` shows where the branches disagree. The conflicting part sits between three **conflict markers**:

- From `<<<<<<< HEAD` to `=======` is the version on your current branch, `main`: 40 g.
- From `=======` to `>>>>>>> less-sugar` is the version from the branch you are merging: 30 g.

Everything outside the markers merged cleanly and needs nothing from you.

When several files conflict, `git status` lists each of them under `Unmerged paths`. Resolve and `git add` them one at a time, in any order; `git status` shows which ones are left.

To **resolve** the conflict, edit the file into the version you want, and delete all three marker lines. You can keep one side, keep both, or write something new; here the cooks settle on 35 g. Then `git add pancakes.md` marks the file as resolved, and `git status` says `All conflicts fixed but you are still merging`. Finally, `git commit` concludes the merge. Git opens your editor with the message `Merge branch 'less-sugar'`; save and close it to accept, as the session does. The graph shows the finished merge: a merge commit with both sugar commits as its parents.

A resolution is your own edit, and Git trusts it completely: whatever the file contains when you run `git add` goes into the merge commit. Read the whole file once more before you add it, and make sure the result still makes sense, not just that the markers are gone.

::: tip
Editors such as Visual Studio Code highlight conflicts in colour and offer buttons above each one: *Accept Current Change* (your branch), *Accept Incoming Change* (the branch you are merging) and *Accept Both Changes*. They only edit the file for you. You still finish with `git add` and `git commit`.
:::

## Backing out of a merge {#s4}

Sometimes you start a merge and realise that you cannot resolve it now: you need to ask a colleague which version is right, or the conflict is bigger than you expected. `git merge --abort` puts everything back as it was before the merge started, as if you had never run it. In the session, the sugar conflict happens again, and this time you back out.

{{SESSION:m05-abort}}

After the abort, `git status` reports a clean working tree, and `cat` shows that `pancakes.md` still has `main`'s 40 g, with no markers. You can merge again whenever you are ready.

Aborting works only while the merge is in progress. Once you have committed the merge, there is nothing left to abort: the merge commit is an ordinary part of your history.

If you had uncommitted changes when the merge started, `--abort` may not be able to restore them. So commit your own changes before you merge.

## Keeping conflicts small {#s5}

You cannot avoid conflicts entirely, but a few habits keep them rare, and small when they do happen:

- **Merge `main` into your branch often.** You then meet other people's changes early, while they are small and fresh in everyone's mind, instead of all at once at the end. Module 8 shows rebasing as an alternative.
- **Keep branches short-lived and commits focused.** A branch that lives for a day collects fewer surprises than one that lives for a month, and a commit that does one thing is easier to merge, and to understand when it conflicts.
- **Talk to each other.** Agree who works on which files, and speak up before two people rework the same part.
- **Do not reformat whole files on a feature branch.** Re-indenting a file, or changing its line endings, touches every line, so it conflicts with every other change to that file. If a file needs reformatting, do it in a commit of its own, agreed with everyone, and merge it quickly.
- **Check before committing a resolution.** A forgotten marker line is easy to miss in a long file. `git diff --check` reports leftover conflict markers, and Exercise 6 shows it at work.

::: keyidea
A conflict is Git asking a question, not reporting a failure. Read the markers, decide what the file should say, then `git add` and `git commit`. When you are not ready to answer, `git merge --abort` takes you back to where you started.
:::

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Will it conflict?** Say whether each merge stops with a conflict.

1. Branch A edits `soup.md`; branch B edits `bread.md`.
2. Both edit `pancakes.md`: A the first ingredient, B the last line of the method.
3. Both change the sugar line of `pancakes.md`, to different amounts.
4. Branch A deletes `cake.md`; branch B edits it.
:::

::: solution
1. **No.** Different files merge automatically.
2. **No**, as long as unchanged lines separate the two changes, as in Section 2.
3. **Yes.** Both changed the same line differently.
4. **Yes.** Git cannot both delete the file and keep the edit, so it asks you to choose.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Read the markers.** A conflicted file contains:

```text
<<<<<<< HEAD
- 40 g sugar
=======
- 30 g sugar
>>>>>>> less-sugar
```

Which version is from the branch you are on, and which from the branch you are merging? What must the file contain when you have resolved the conflict?
:::

::: solution
`- 40 g sugar`, between `<<<<<<< HEAD` and `=======`, is from the branch you are on. `- 30 g sugar`, between `=======` and `>>>>>>> less-sugar`, is from `less-sugar`. When resolved, the file contains only the line you choose (one of them, both, or something new), and none of the three marker lines.
:::

::: exercise #e3 level=2 kind=coding minutes=8
**Keep both changes.** On one branch you added chocolate chips to the pancakes; on `main` someone added a banana, in the same place. Merge the branch and keep both ingredients.
:::

::: solution
The merge stops, because both changes are on the same line of the list. Keep both lines and remove the markers:

{{SESSION:m05-e3-solution}}

A resolution does not have to pick a side: here the right answer is both.
:::

::: exercise #e4 level=1 kind=conceptual minutes=4
**Committing too early.** You removed the markers from `pancakes.md` and ran `git commit`, but Git refused, saying that committing is not possible because you have unmerged files. Why?
:::

::: solution
You skipped `git add pancakes.md`. Until you stage the file, Git still counts it as unmerged, whatever its content. Run `git add pancakes.md`, then `git commit`.
:::

::: exercise #e5 level=1 kind=conceptual minutes=4
**Prevent it.** Two cooks changed the sugar line at the same time, on different branches. What could they have done to avoid the conflict?
:::

::: solution
Any of these: talk first and let one person make the change; keep the branches short, so that one change is merged before the other begins; merge `main` into each branch often, so that the second cook sees the first change before editing the same line.
:::

::: exercise #e6 level=2 kind=coding minutes=4
**A leftover marker.** Someone resolved the sugar conflict in a hurry and committed the file with the markers still in it. Find them and fix the file.
:::

::: solution
`git diff --check` reports leftover conflict markers, and fails when it finds any; comparing with `HEAD~1` checks what the last commit changed:

{{SESSION:m05-e6-solution}}

Run `git diff --check` (without arguments, for your unstaged changes) before you commit a resolution, and you will not need this repair.
:::

## Self-check quiz {#quiz}

```quiz
? When does Git report a merge conflict?
- [ ] Whenever both branches changed the same file
- [x] When both branches changed the same lines differently
- [ ] Whenever a merge creates a merge commit
- [ ] When the branches have different names
> Changes to different parts of a file merge automatically; the same lines changed differently need a decision.

? In a conflicted file, what lies between `<<<<<<< HEAD` and `=======`?
- [ ] The version from the branch you are merging
- [ ] The version from the first commit
- [x] The version from the branch you are on
- [ ] Git's suggested resolution
> HEAD is your current branch; the part after `=======` comes from the other branch.

? You have edited a conflicted file into its final form. What do you run next?
- [ ] `git merge` again
- [ ] `git restore` on the file
- [ ] `git merge --abort`
- [x] `git add` on the file
> Staging the file marks it as resolved; `git commit` then concludes the merge.

? Which command puts everything back as it was before the merge started?
- [x] `git merge --abort`
- [ ] `git revert HEAD`
- [ ] `git restore --staged .`
- [ ] `git branch -D`
> Aborting undoes the unfinished merge.

? Which habit keeps conflicts small?
- [ ] Reformatting whole files on feature branches
- [x] Merging `main` into your branch often
- [ ] Keeping a branch open for months
- [ ] Making one large commit at the end
> Meeting other people's changes early keeps each conflict small.

? What does `git diff --check` warn about?
- [ ] Commits that have not been pushed
- [ ] Branches that have not been merged
- [x] Leftover conflict markers and whitespace errors
- [ ] Files that are not tracked
> It is a quick check before committing a resolution.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, section [3.2: Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging), part "Basic Merge Conflicts".
- The reference page for [git merge](https://git-scm.com/docs/git-merge), section "How conflicts are presented".
- GitHub Docs, [Resolving a merge conflict using the command line](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line).
