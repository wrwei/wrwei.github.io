---
title: "Branches: try ideas safely"
lead: Try a new look for your page on a branch, switch between versions in a second, then bring the change into your main line.
minutes: 40
needs: Lesson 4 (the `my-page` repository with three commits)
goals:
  - Understand what a branch is, and what `HEAD` means
  - Create a branch and switch between branches
  - Bring a branch's work into `main` with `git merge`
  - Recognise a fast-forward merge and a merge commit
  - Delete a branch you have finished with
---

## Why branches? {#why}

Suppose you want to try a dark colour scheme for your page. You are not sure you will like it.
You could edit `style.css`, and if you do not like the result, try to undo it all. Or you could
work on a **branch**: a separate line of work where you can try anything, while `main` stays as it
was.

::: figure id=fig-05-1
A branch is a label that points at a commit. `main` points at your newest commit. A new branch,
`dark-theme`, starts at the same commit. New commits move the label of the branch you are on, and
`HEAD` shows which branch that is.
:::

A branch is not a copy of your files. It is only a label on a commit, so making one is instant,
and it costs nothing. You can have as many as you like.

## See your branches {#list}

Open `my-page` in VS Code and open a terminal, as before. Then:

```terminal
$ git branch
* main
```

You have one branch, `main`. The `*` marks the branch you are on.

::: tip
VS Code shows the current branch in the bottom-left corner of the window, in the status bar. Glance
at it whenever you are not sure which branch you are on.
:::

## Create a branch and switch to it {#create}

```terminal
$ git switch -c dark-theme
Switched to a new branch 'dark-theme'
```

`git switch` moves you to another branch; `-c` ("create") makes it first. Branch names cannot have
spaces, so use hyphens.

```terminal
$ git branch
* dark-theme
  main
```

You are now on `dark-theme`. Nothing else has changed yet: both branches point at the same commit.

## Try the dark theme {#dark}

Change three colours in `style.css`, the highlighted lines:

```file style.css
body {
  font-family: sans-serif;
  max-width: 40em;
  margin: 2em auto;
  padding: 0 1em;
  background: #1e1e2e;
  color: #e6e6e6;
}

h1 {
  color: #8ec5fc;
}
```

Reload the page in your browser: it is dark. Commit the change, on this branch:

```terminal
$ git add style.css
$ git commit -m "Try a dark theme"
[dark-theme 85f8f42] Try a dark theme
 1 file changed, 3 insertions(+), 3 deletions(-)
```

The first part of the answer, `[dark-theme ...]`, confirms which branch the commit went to.

## Switch back and forth {#switch}

Now the interesting part. Switch back to `main`:

```terminal
$ git switch main
Switched to branch 'main'
```

Look at `style.css` in VS Code, and reload the page in the browser: the light colours are back.
Git changed your files to match the branch you switched to. Switch again:

```terminal
$ git switch dark-theme
Switched to branch 'dark-theme'
```

Dark again. Your work on each branch is safe in its commits, and `git switch` brings back
whichever version you ask for.

To see both branches in your history, ask `git log` for all branches:

```terminal
$ git log --oneline --all
85f8f42 (HEAD -> dark-theme) Try a dark theme
f952430 (main) Add colours with a style sheet
358630b Add a sentence about me
c50e3a0 Add my first web page
```

The labels in brackets show where each branch points. `HEAD -> dark-theme` means "you are here,
on `dark-theme`".

::: keyidea
**`HEAD` means "where you are now".** It points at the branch you are on, and that branch points
at a commit. When you commit, the branch you are on moves forward to the new commit, and `HEAD`
moves with it.
:::

::: trouble
**`error: Your local changes to the following files would be overwritten by checkout`.** You changed
a file and did not commit, and switching would overwrite your change. Commit it first (or, if you
do not want it, throw it away with `git restore`), then switch.

**`fatal: a branch named 'dark-theme' already exists`.** You already made it. Switch to it without
`-c`: `git switch dark-theme`.
:::

## Bring the change into main: git merge {#merge}

You like the dark theme. To bring it into `main`, go to `main` and **merge** the branch into it:

```terminal
$ git switch main
Switched to branch 'main'
$ git merge dark-theme
Updating f952430..85f8f42
Fast-forward
 style.css | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)
```

`git merge dark-theme` means "bring the work of `dark-theme` into the branch I am on".

"Fast-forward" is the simplest kind of merge. Nothing had happened on `main` since `dark-theme`
began, so Git only had to move the `main` label forward to the branch's newest commit.

```terminal
$ git log --oneline
85f8f42 (HEAD -> main, dark-theme) Try a dark theme
f952430 Add colours with a style sheet
358630b Add a sentence about me
c50e3a0 Add my first web page
```

Both labels now point at the same commit.

## Tidy up: delete the branch {#delete}

The branch has done its job. Delete the label:

```terminal
$ git branch -d dark-theme
Deleted branch dark-theme (was 85f8f42).
```

Only the label goes. The commit "Try a dark theme" is part of `main` now, and stays.

::: trouble
**`error: the branch '...' is not fully merged`.** Git refuses to delete a branch whose commits are
not in your current branch, so you do not lose work by accident. Merge it first. If you really
want to throw that work away, `git branch -D` (capital D) deletes it anyway.
:::

## When both lines have moved on: a merge commit {#merge-commit}

A fast-forward is only possible when nothing happened on `main` in the meantime. Often something
did. Try it: make a branch for a list of hobbies.

```terminal
$ git switch -c add-hobbies
Switched to a new branch 'add-hobbies'
```

Add the highlighted lines to `index.html`:

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, I'm learning Git!</h1>
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
$ git commit -m "Add a list of hobbies"
[add-hobbies b8140ac] Add a list of hobbies
 1 file changed, 5 insertions(+)
```

Now go back to `main` and change something else there: the page title, which browsers show on
the tab.

```terminal
$ git switch main
Switched to branch 'main'
```

The hobbies have disappeared from `index.html`: they only exist on `add-hobbies`. Change the
title, the highlighted line:

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, I'm learning Git!</h1>
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Change the page title"
[main 15e66cc] Change the page title
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Both branches have moved on from the same starting point. `--graph` draws it:

```terminal
$ git log --oneline --graph --all
* 15e66cc (HEAD -> main) Change the page title
| * b8140ac (add-hobbies) Add a list of hobbies
|/
* 85f8f42 Try a dark theme
* f952430 Add colours with a style sheet
* 358630b Add a sentence about me
* c50e3a0 Add my first web page
```

Read it from the bottom up: four shared commits, then the line splits in two. Now merge:

```terminal
$ git merge add-hobbies
Auto-merging index.html
Merge made by the 'ort' strategy.
 index.html | 5 +++++
 1 file changed, 5 insertions(+)
```

This merge has a step in the middle. After "Auto-merging index.html" (Git is combining the two
versions of the file), Git opens a tab called `MERGE_MSG` in VS Code, and the terminal waits with
"hint: Waiting for your editor to close the file...". Git is asking you to check the message for
the merge commit. The first line, `Merge branch 'add-hobbies'`, is fine as it is. **Close the
tab** (click the × on it). The merge finishes, and the terminal prints the rest of the lines above.

This time Git could not just move a label forward, so it made a new commit, a **merge commit**,
that joins the two lines. "ort" is the name of the method Git uses to combine them; you can
ignore it.

```terminal
$ git log --oneline --graph
*   618e8f4 (HEAD -> main) Merge branch 'add-hobbies'
|\
| * b8140ac (add-hobbies) Add a list of hobbies
* | 15e66cc Change the page title
|/
* 85f8f42 Try a dark theme
* f952430 Add colours with a style sheet
* 358630b Add a sentence about me
* c50e3a0 Add my first web page
```

`index.html` now has the new title *and* the hobbies. Git combined the two changes because they
were in different parts of the file.

::: figure id=fig-05-2
Two kinds of merge. Left: nothing happened on `main`, so the merge only moves the `main` label
forward (a fast-forward). Right: both branches have new commits, so Git makes a merge commit with
two parents.
:::

Delete the finished branch:

```terminal
$ git branch -d add-hobbies
Deleted branch add-hobbies (was b8140ac).
```

::: trouble
**The terminal says "Waiting for your editor to close the file..." and nothing happens.** Git is
waiting for you to close the `MERGE_MSG` tab in VS Code. Find the tab and close it.

**The terminal filled with a strange screen with `~` down the left side.** Git opened the editor
Vim instead of VS Code (the `core.editor` setting from Lesson 2 is missing, or VS Code's `code`
command cannot be found). Type `:wq` and press <kbd>Enter</kbd> to accept the message and finish
the merge. Then set the editor again: `git config --global core.editor "code --wait"`.
:::

## Try it: branches in pictures {#try}

Branches are easier to understand when you can see them. Use the buttons below as you like; each
one shows the command it stands for. Some ideas:

- Click **Commit** twice on `main`. Then make a new branch, commit twice on it, switch back to
  `main`, and merge the branch: a fast-forward.
- Now commit on `main` *and* on a branch, then merge: a merge commit.
- Try to merge a branch that is already merged.

::: widget name=branch-graph
A model of a repository's history. The green circle is the commit you are on; `HEAD ->` marks your
current branch.
:::

## What you learned {#summary}

- A **branch** is a label on a commit. `main` is your main line; others are for trying things.
- `HEAD` means "where you are now". The branch you are on moves when you commit.
- `git switch` changes your files to match the branch you switch to.
- `git merge BRANCH` brings a branch's work into the branch you are on: by **fast-forward** if
  nothing else changed, otherwise with a **merge commit**.
- `git branch -d` deletes a label. The commits stay.

| Command | What it does |
|---|---|
| `git branch` | Lists branches; `*` marks the one you are on |
| `git switch -c NAME` | Creates a branch and switches to it |
| `git switch NAME` | Switches to an existing branch |
| `git merge NAME` | Brings branch `NAME` into the current branch |
| `git branch -d NAME` | Deletes a branch that has been merged |
| `git log --oneline --graph --all` | Draws the history of all branches |

## Check yourself {#quiz}

```quiz
? What is a branch in Git?
- [ ] A full copy of all your files in another folder
- [x] A label that points at a commit and moves forward when you commit on it
- [ ] A backup on GitHub
> That is why branches are instant and free to make.

? You are on `main` and run `git merge dark-theme`. What happens?
- [ ] `main`'s work is copied into `dark-theme`
- [x] The work of `dark-theme` is brought into `main`
- [ ] The two branches are swapped
> You merge *into* the branch you are on. Switch to `main` first, then merge the other branch.

? When does Git make a merge commit instead of a fast-forward?
- [ ] Always
- [ ] When the branch has more than one commit
- [x] When both branches have new commits since they split
> If only the other branch moved on, Git just moves your branch's label forward. If both moved on, it needs a new commit that joins them.

? After `git branch -d dark-theme`, what happens to the commit "Try a dark theme"?
- [x] It stays, because it is part of `main`
- [ ] It is deleted
- [ ] It moves to a new branch
> Deleting a branch removes only the label. Git refuses `-d` if the commits are not merged anywhere, so you cannot lose them by accident.
```
