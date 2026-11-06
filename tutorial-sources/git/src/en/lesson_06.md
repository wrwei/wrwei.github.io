---
title: Merge conflicts, calmly
lead: Make a merge conflict on purpose, read what Git is asking you, resolve it in VS Code, and finish the merge.
minutes: 30
needs: Lesson 5 (branches and merging)
goals:
  - Understand why conflicts happen and why they are normal
  - Read the conflict markers Git writes into a file
  - Resolve a conflict in VS Code and finish the merge
  - Stop a merge you do not want to finish, with `git merge --abort`
---

## What is a conflict? {#what}

In Lesson 5, Git combined two branches by itself, because they changed different parts of
`index.html`. But what if both branches change **the same line**, in different ways? Git cannot
know which version you want, so it stops and asks you. That is a **merge conflict**.

A conflict is not an error, and nothing is broken or lost. It is Git saying: "you decide".
Everyone who uses Git meets them, and after you have solved one, they stop being scary. So make
one on purpose.

## Make a conflict on purpose {#make}

Open `my-page` in VS Code with a terminal. First, a branch that changes the heading:

```terminal
$ git switch -c new-heading
Switched to a new branch 'new-heading'
```

Change the `<h1>` line in `index.html`:

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Welcome to my page!</h1>
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
  <h2>My hobbies</h2>
  <ul>
    <li>Walking</li>
    <li>Photography</li>
  </ul>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Change the heading"
[new-heading e54afda] Change the heading
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Now go back to `main` and change **the same line**, differently:

```terminal
$ git switch main
Switched to branch 'main'
```

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello and welcome!</h1>
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
  <h2>My hobbies</h2>
  <ul>
    <li>Walking</li>
    <li>Photography</li>
  </ul>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Make the heading friendlier"
[main 822c471] Make the heading friendlier
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Now merge, and watch Git stop:

```terminal
$ git merge new-heading
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

"CONFLICT ... in index.html": Git combined what it could, and left the rest for you. The merge is
now **in progress**: Git is waiting for you to finish it. (On Windows, Git Bash's prompt shows
`(main|MERGING)` until the merge is finished or stopped.)

## See what Git needs from you {#status}

As always, `git status` explains:

```terminal
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

"Both modified" means both branches changed `index.html` in a way Git could not combine. The
hints give you the plan: fix the conflicts, `git add` the file, then `git commit`. Or abort.

## The emergency exit: git merge --abort {#abort}

Before you solve the conflict, try the emergency exit, so that you know it works. If you are in
the middle of a merge and want to stop, for example because you are not sure which version is
right, `git merge --abort` takes you back to how things were before you typed `git merge`:

```terminal
$ git merge --abort
$ git status
On branch main
nothing to commit, working tree clean
```

Everything is back to its state before the merge: your heading says "Hello and welcome!" again.
Nothing is lost, and you can merge again whenever you like. Do it now:

```terminal
$ git merge new-heading
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

The same conflict, ready for you to solve.

## Read the conflict {#markers}

Open `index.html` in VS Code. Git has written both versions into the file, between marker lines:

```file index.html check
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<<<<<<< HEAD
  <h1>Hello and welcome!</h1>
=======
  <h1>Welcome to my page!</h1>
>>>>>>> new-heading
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
  <h2>My hobbies</h2>
  <ul>
    <li>Walking</li>
    <li>Photography</li>
  </ul>
</body>
</html>
```

::: figure id=fig-06-1
Anatomy of a conflict. Between `<<<<<<< HEAD` and `=======` is your version: the branch you are
on, here `main`. Between `=======` and `>>>>>>> new-heading` is the version from the branch you
are merging in. Everything outside the markers was combined without trouble.
:::

The three marker lines are not part of your page. Your job is to replace everything from
`<<<<<<<` to `>>>>>>>` with the text you want, and remove the markers.

VS Code helps. It colours the two versions and puts clickable links above them:

- **Accept Current Change** keeps your version (from `HEAD`, the branch you are on).
- **Accept Incoming Change** keeps the version from the branch you are merging in.
- **Accept Both Changes** keeps both, one after the other.
- **Compare Changes** shows them side by side.

VS Code may also show a **Resolve in Merge Editor** button. You do not need it: the links are
simpler.

## Resolve it {#resolve}

Decide which heading you want. Here, keep "Welcome to my page!": click **Accept Incoming Change**.
Or edit the file by hand: delete the marker lines and the line you do not want. Either way, the
file must end up like this, with no markers left:

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Welcome to my page!</h1>
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
  <h2>My hobbies</h2>
  <ul>
    <li>Walking</li>
    <li>Photography</li>
  </ul>
</body>
</html>
```

You are not limited to the two versions. You could write a third heading of your own: whatever
you leave in the file is what the merge will contain.

::: trouble
**I clicked the wrong link.** Press <kbd>Ctrl</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd>+<kbd>Z</kbd> on a
Mac) to undo it, or edit the file by hand until it looks like the one above.
:::

::: pitfall
Before you `git add` a file with a conflict, check that no marker lines are left: a forgotten
`=======` ends up in your page. In VS Code, search the file (<kbd>Ctrl</kbd>+<kbd>F</kbd>, or
<kbd>Cmd</kbd>+<kbd>F</kbd> on a Mac) for `<<<<<<<`, `=======` and `>>>>>>>`.
:::

Tell Git the conflict is solved by adding the file:

```terminal
$ git add index.html
$ git status
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
	modified:   index.html
```

"All conflicts fixed". Finish the merge with `git commit`, without `-m`. Read this before you type
it: as in Lesson 5, VS Code opens a tab, this time called `COMMIT_EDITMSG`. Its first line,
`Merge branch 'new-heading'`, is the message. The lines below it that start with `#` are notes,
which Git leaves out of the commit; one of them mentions `git update-ref`, which you do not need.
Close the tab to accept the message, and the commit is made. Then click back in the terminal.

```terminal
$ git commit
[main 10984c7] Merge branch 'new-heading'
```

```terminal
$ git log --oneline --graph -4
*   10984c7 (HEAD -> main) Merge branch 'new-heading'
|\
| * e54afda (new-heading) Change the heading
* | 822c471 Make the heading friendlier
|/
*   618e8f4 Merge branch 'add-hobbies'
|\
```

`-4` shows only the four newest commits; the lines at the bottom lead on to the older ones. You
resolved your first conflict. Delete the branch:

```terminal
$ git branch -d new-heading
Deleted branch new-heading (was e54afda).
```

::: trouble
**`fatal: cannot switch branch while merging`**, `error: Merging is not possible because you have
unmerged files`, or `fatal: You have not concluded your merge (MERGE_HEAD exists)`. A merge is
still in progress. Finish it (fix the file, `git add`, `git commit`) or stop it with
`git merge --abort`. Do not use `git merge --quit`, which Git also suggests: it leaves the
half-finished merge in your files.

**The page shows `<<<<<<< HEAD` in the browser.** The marker lines are still in the file. Remove
them, then `git add index.html`. If the merge is still in progress, `git commit` finishes it. If
you already committed the merge, save the fix as a new commit:
`git commit -m "Remove conflict markers"`.
:::

## Fewer conflicts {#fewer}

You cannot avoid conflicts completely, but these habits make them rare and small:

- **Commit small changes often**, rather than one huge change at the end.
- **Merge often**, so branches do not drift apart for weeks.
- When you work with others, **get their latest work before you start** (Lesson 9) and agree who
  works on which part.

## What you learned {#summary}

- A **conflict** happens when two branches change the same lines differently. Git asks you to
  choose; nothing is lost.
- In the file, `<<<<<<< HEAD` to `=======` is your version; `=======` to `>>>>>>> branch` is the
  incoming one.
- To resolve: edit the file to what you want (VS Code's **Accept ...** links help), remove the
  markers, `git add` the file, then `git commit`.
- `git merge --abort` cancels a merge in progress.

| Command | What it does |
|---|---|
| `git status` | During a merge: shows which files have conflicts |
| `git add FILE` | Marks a file's conflict as resolved |
| `git commit` | Finishes the merge, with Git's ready-made message |
| `git merge --abort` | Cancels the merge and goes back to before it |

## Check yourself {#quiz}

```quiz
? When does Git report a merge conflict?
- [ ] Whenever two branches change the same file
- [x] When two branches change the same lines of a file in different ways
- [ ] When a branch has more than one commit
> Changes to different parts of the same file merge without trouble, as in Lesson 5.

? In a conflict, which version is between `<<<<<<< HEAD` and `=======`?
- [x] The version from the branch you are on
- [ ] The version from the branch you are merging in
- [ ] The version from the last commit both branches share
> `HEAD` means where you are now, so it is your current branch's version. The incoming one is below the `=======`.

? You fixed the file. What are the next two steps?
- [ ] `git merge` again, then `git push`
- [x] `git add` the file, then `git commit`
- [ ] `git restore` the file, then `git commit`
> `git add` tells Git the conflict is resolved; `git commit` finishes the merge.

? You are halfway through a conflict and want to start again later. Which command?
- [ ] `git restore .`
- [ ] `git branch -d`
- [x] `git merge --abort`
> It puts everything back to how it was before you typed `git merge`.
```
