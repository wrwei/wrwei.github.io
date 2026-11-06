---
title: Saving changes and looking back
lead: Change your page, see exactly what changed, save more snapshots, look back at old ones, and throw away a change you do not want.
minutes: 40
needs: Lesson 3 (the `my-page` repository with one commit)
goals:
  - See what you changed with `git diff`
  - Save more commits, including a new file, with `git add .`
  - List your history in short form and look inside one commit
  - Throw away a change you have not committed, with `git restore`
  - Write commit messages that help you later
---

## Pick up where you left off {#start}

Open your project in VS Code: **File** > **Open Folder...**, choose `my-page`. Then open a terminal
(**Terminal** > **New Terminal**) and check that everything is as you left it:

```terminal
$ git status
On branch main
nothing to commit, working tree clean
```

"Working tree clean": nothing has changed since your last commit. Good.

::: tip
VS Code remembers the folders you opened. **File** > **Open Recent** gets you back to `my-page`
quickly next time.
:::

## Change your page {#edit}

Add a line about yourself to `index.html`. The highlighted line is the one to add; write about
yourself if you like, but use this text if you want your outputs to match this lesson exactly.

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My page</title>
</head>
<body>
  <h1>Hello, I'm learning Git!</h1>
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
</body>
</html>
```

Ask Git what it sees:

```terminal
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

Git knows `index.html` is **modified**: it is different from the last commit. The change is "not
staged": it is in your working folder, but not yet in the staging area.

## See exactly what changed: git diff {#diff}

`git status` says *which* files changed. `git diff` shows *how*:

```terminal
$ git diff
diff --git a/index.html b/index.html
index 800ba6d..7baeae6 100644
--- a/index.html
+++ b/index.html
@@ -7,5 +7,6 @@
 <body>
   <h1>Hello, I'm learning Git!</h1>
   <p>This is my first web page.</p>
+  <p>I like walking, photography and good coffee.</p>
 </body>
 </html>
```

It looks technical, but you only need three things:

::: figure id=fig-04-2
How to read `git diff`. The header names the file. Lines starting with `+` were added, lines
starting with `-` were removed, and lines starting with a space did not change: Git shows a few
of them so you can see where the change is.
:::

- The first four lines say which file this is. Ignore the numbers on the `index` line.
- `@@ -7,5 +7,6 @@` says where in the file: around line 7.
- Then the lines themselves: `+` added, `-` removed, a space for lines that stayed the same.

In your terminal, added lines are green and removed lines are red.

::: tip
VS Code shows the same thing in pictures. Click the **Source Control** icon in the bar on the left
(it looks like a branching line), then click `index.html` under "Changes". VS Code shows the old and
new versions side by side.
:::

::: trouble
**`git diff` prints nothing.** Either the change is not saved yet (a dot on the file's tab in
VS Code means unsaved), or you already ran `git add`: `git diff` only shows changes that are not
staged. To see staged changes, use `git diff --staged`.

**I see a `:` or `(END)` at the bottom and cannot type.** The output was longer than the screen.
Press <kbd>q</kbd>.
:::

## Save the change {#commit}

The same two steps as before:

```terminal
$ git add index.html
$ git commit -m "Add a sentence about me"
[main 358630b] Add a sentence about me
 1 file changed, 1 insertion(+)
```

Two commits now. Each one is a snapshot you can come back to.

## Add a second file {#css}

Give your page some colour. Create a new file called `style.css`, the same way you created
`index.html` (**New File...** in the Explorer):

```file style.css
body {
  font-family: sans-serif;
  max-width: 40em;
  margin: 2em auto;
  padding: 0 1em;
  background: #fdfaf3;
  color: #222;
}

h1 {
  color: #2a6f97;
}
```

Then tell the page to use it: add the highlighted line to `index.html`.

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
</body>
</html>
```

If your page is open in the browser, reload it: the heading is blue and the text is centred.

```terminal
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	style.css

no changes added to commit (use "git add" and/or "git commit -a")
```

One file is modified and one is new. Both belong in the same snapshot, because together they
make one change: "add colours". You could add them one by one, or all at once:

```terminal
$ git add .
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html
	new file:   style.css
```

The `.` means "this folder", so `git add .` adds every change in the folder. It is quick, but
always run `git status` first, to be sure you are adding only what you mean to.

```terminal
$ git commit -m "Add colours with a style sheet"
[main f952430] Add colours with a style sheet
 2 files changed, 13 insertions(+)
 create mode 100644 style.css
```

## Look back at your history {#oneline}

`git log` shows a lot for each commit. Add `--oneline` for one line each:

```terminal
$ git log --oneline
f952430 (HEAD -> main) Add colours with a style sheet
358630b Add a sentence about me
c50e3a0 Add my first web page
```

Newest first. Each line starts with the commit's short hash, then its message. You can picture
your history as a chain:

::: figure id=fig-04-1
Your history is a chain of commits. Each commit is a full snapshot of the project, with a hash
and a message, and points back to the one before it. `main` is a label on the newest commit, and
`HEAD` marks the commit you are working on.
:::

To look inside one commit, give `git show` its hash. Use a hash from **your own** list, not the one
printed here:

```terminal
$ git show 358630b
commit 358630b7b7a64b3326a6d4c22d224a02ffaaf8a9
Author: Your Name <12345678+your-username@users.noreply.github.com>
Date:   Thu Nov 5 10:05:00 2026 +0000

    Add a sentence about me

diff --git a/index.html b/index.html
index 800ba6d..7baeae6 100644
--- a/index.html
+++ b/index.html
@@ -7,5 +7,6 @@
 <body>
   <h1>Hello, I'm learning Git!</h1>
   <p>This is my first web page.</p>
+  <p>I like walking, photography and good coffee.</p>
 </body>
 </html>
```

`git show` prints the commit's details and then its diff: exactly what that snapshot changed.

::: tip
You do not have to type the whole hash. The first seven characters are enough, and even four
usually work.
:::

::: trouble
**`fatal: ambiguous argument '358630b': unknown revision or path not in the working tree`.**
You typed the hash from this page. Your hashes are different: copy one from your own
`git log --oneline`.
:::

## Throw away a change you do not want: git restore {#restore}

Everyone makes a mess sometimes. Make one on purpose: in `index.html`, change the heading and
delete the line about yourself, so the file looks like this.

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Oops, I broke it</h1>
  <p>This is my first web page.</p>
</body>
</html>
```

```terminal
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

Look at the second hint: `git restore` puts a file back the way it was in your last commit.

```terminal
$ git restore index.html
$ git status
On branch main
nothing to commit, working tree clean
```

Look at `index.html` in VS Code: the heading and your sentence are back.

::: pitfall
`git restore` throws your uncommitted changes in that file away for good. Git cannot bring them
back, because they were never in a commit. Use it only when you are sure.
:::

## Write messages your future self will thank you for {#messages}

In a few months, your commit messages are all you will remember about each change. Good messages:

- **say what the commit does**, as an instruction: "Add a sentence about me", "Fix the broken
  link", "Change the heading colour";
- **are short**, about 50 characters or fewer, so they fit on one line in `git log --oneline`;
- **describe one change.** If you need "and" to describe it, it may be two commits.

| Not so helpful | Helpful |
|---|---|
| `update` | `Add a list of hobbies` |
| `stuff` | `Fix the spelling of "photography"` |
| `changes to index and css and README` | Three commits, one for each change |

## What you learned {#summary}

- `git diff` shows what changed and is not yet staged: `+` added, `-` removed.
- `git add .` stages every change in the folder. Check `git status` first.
- `git log --oneline` lists your history, one commit per line; `git show HASH` shows one commit.
- `git restore FILE` throws away uncommitted changes to a file. They cannot be recovered.
- A good message says what the commit does, briefly.

| Command | What it does |
|---|---|
| `git diff` | Shows changes that are not staged |
| `git diff --staged` | Shows changes that are staged |
| `git add .` | Stages every change in the current folder |
| `git log --oneline` | Lists commits, one per line |
| `git show HASH` | Shows one commit and its changes |
| `git restore FILE` | Discards uncommitted changes to a file |

## Check yourself {#quiz}

```quiz
? In `git diff`, what does a line starting with `+` mean?
- [ ] A line that is important
- [x] A line that was added
- [ ] A line that will be deleted when you commit
> `+` marks an added line and `-` a removed one. Lines with a space in front did not change.

? You ran `git add index.html`, then `git diff`, and nothing was printed. Why?
- [x] `git diff` shows only changes that are not staged, and you have staged them
- [ ] `git add` saved the commit already
- [ ] The change was lost
> The change is safe in the staging area. `git diff --staged` shows it.

? You want to look at what a commit from yesterday changed. Which command?
- [ ] `git status`
- [ ] `git diff`
- [x] `git show` followed by the commit's hash
> `git log --oneline` gives you the hash; `git show HASH` shows that commit's changes.

? Which is the better commit message?
- [ ] `fixed stuff`
- [x] `Fix the link to the style sheet`
- [ ] `Changed index.html, style.css and README.md and fixed the title`
> It says what the commit does, in a few words. The third one describes several changes, which are better as separate commits.
```
