---
title: Your first repository
lead: Make a folder for your project, turn it into a Git repository, write a small web page and save your first snapshot of it.
minutes: 40
needs: Lesson 2 (Git and VS Code installed, your name and email set)
goals:
  - Open a project folder in VS Code and find your way in the terminal
  - Turn the folder into a Git repository with `git init`
  - See what Git notices with `git status`
  - Save a snapshot with `git add` and `git commit`
  - Read your history with `git log`
---

## Make a folder for your project {#folder}

Your project is a small personal web page. It lives in a folder called `my-page`.

::: where vscode
1. Open the **File** menu and click **Open Folder...**.
2. In the window that appears, go to your home folder (the folder with your user name).
3. Make a new folder there called `my-page`: click **New Folder**, type `my-page` and confirm.
4. Select `my-page` and click **Open** (on Windows, **Select Folder**).
5. VS Code asks: "Do you trust the authors of the files in this folder?" You are the author, so
   click **Yes, I trust the authors**.
6. Open a terminal: **Terminal** > **New Terminal**.
:::

<!-- replay:
mkdir -p ~/my-page
@cd ~/my-page
-->

The terminal opens inside your project folder. To check where you are, type `pwd` ("print
working directory"):

```terminal
$ pwd
/Users/you/my-page
```

The answer is the path to your folder. It starts with your home folder, so yours looks a little
different: on Windows it looks like `/c/Users/you/my-page`, on Linux like `/home/you/my-page`.

Now type `ls` ("list") to see what is in the folder:

```terminal
$ ls
```

Nothing is printed, because the folder is empty. That will change soon.

::: tip
`pwd` and `ls` are the two commands to type whenever you are not sure where you are. Most
mistakes in the terminal happen because a command ran in a different folder from the one you
meant.
:::

## Turn the folder into a repository {#init}

So far `my-page` is an ordinary folder. Ask Git what it thinks of it:

```terminal
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

This message looks alarming, but it only means "Git is not looking after this folder". You will
see it whenever you run a Git command in the wrong folder, so it is useful to know it.

To ask Git to look after the folder, type:

```terminal
$ git init
Initialized empty Git repository in /Users/you/my-page/.git/
```

`git init` ("initialise") turns the folder into a **repository**: a folder whose history Git
keeps. You only do this once per project.

Git keeps that history in a hidden folder called `.git`, inside your project. `ls -a` lists
hidden files too:

```terminal
$ ls -a
.  ..  .git
```

(`.` means "this folder" and `..` means "the folder above it". Ignore them.) You never need to
open or change anything inside `.git`. VS Code hides it from its file list so you cannot delete it
by accident.

::: pitfall
Deleting the `.git` folder deletes your whole history. Your files stay, but Git forgets every
snapshot.
:::

Ask Git again:

```terminal
$ git status
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

This time Git answers properly. "On branch main" is the name of your project's main line (you
set it in Lesson 2; branches come in Lesson 5). "No commits yet" means there are no snapshots so
far. Git calls a snapshot a **commit**.

::: trouble
**`git init` says "Reinitialized existing Git repository".** You ran it twice. That is harmless.

**The path in the `git init` message is not your `my-page` folder.** You ran it in another folder,
and that folder is now a repository. If it was your home folder, delete the `.git` folder it made
there (ask for help if you are not sure how), then open `my-page` in VS Code as shown above.
:::

## Write your web page {#page}

A web page is a text file whose name ends in `.html`.

::: where vscode
1. In the file list on the left (the **Explorer**), hover over the `MY-PAGE` heading and click the
   **New File...** icon (a page with a plus sign). Or use **File** > **New File...**.
2. Type the name `index.html` and press <kbd>Enter</kbd>. The file opens in the editor.
3. Copy the text below into it. With Auto Save on (Lesson 2), VS Code saves it for you.
:::

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
</body>
</html>
```

You do not need to know HTML for this series. The lines that matter are `<h1>`, a heading, and
`<p>`, a paragraph.

Want to see it as a web page? In the Explorer, right-click `index.html` and choose **Reveal in File
Explorer** (Windows), **Reveal in Finder** (macOS) or **Open Containing Folder** (Linux). Then
double-click `index.html`: it opens in your web browser.

## Ask Git what it sees {#status}

```terminal
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	index.html

nothing added to commit but untracked files present (use "git add" to track)
```

Git has noticed the new file, but it is **untracked**: Git sees it and is not looking after it
yet. Notice that Git tells you what to do next, in brackets. `git status` often does that; when in
doubt, run it and read the hints.

## Choose what goes into the snapshot: git add {#add}

Saving a snapshot takes two steps. First you choose what goes into it:

```terminal
$ git add index.html
```

No output means it worked. Ask Git again:

```terminal
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   index.html
```

`index.html` has moved to "Changes to be committed". Git calls this place the **staging area**:
the things you have chosen for your next snapshot.

::: analogy
Think of a group photo. `git add` asks people to step into the picture. `git commit` takes the
photo. Anyone who has not stepped in is not in the photo, even if they are in the room.
:::

Why two steps? Because you often change several files but want to save them as separate,
meaningful snapshots, a few at a time. For now, you will always add, then commit.

::: trouble
**`fatal: pathspec 'index.html' did not match any files`.** Git cannot find a file with that name
here. Check the spelling with `ls`. If `ls` does not show `index.html`, the file was saved in
another folder or under another name: look at the file's name in VS Code's tab and in the
Explorer.
:::

## Take the snapshot: git commit {#commit}

```terminal
$ git commit -m "Add my first web page"
[main (root-commit) c50e3a0] Add my first web page
 1 file changed, 11 insertions(+)
 create mode 100644 index.html
```

`git commit` takes the snapshot; `-m` ("message") gives it a short description. Every commit
needs a message. Write it as an instruction that says what the commit does, like "Add my first
web page".

What the answer means:

- `main` is the branch the commit was added to. `root-commit` means it is the very first one.
- `c50e3a0` is the commit's **hash**, its unique name. Yours will be different: it is calculated
  from the content, your name and the exact time.
- `1 file changed, 11 insertions(+)`: one file, eleven new lines.
- `create mode 100644 index.html`: a new file. You can ignore the number.

Check the status once more:

```terminal
$ git status
On branch main
nothing to commit, working tree clean
```

"Working tree clean" means that your files are exactly as in your last snapshot. This is the
calm state to aim for at the end of each piece of work.

::: trouble
**`Author identity unknown` and "Please tell me who you are".** Git does not know your name and
email yet. Do Step 5 of Lesson 2, then run the `git commit` command again.

**I typed `git commit` without `-m`, and a tab called `COMMIT_EDITMSG` opened in VS Code.** Git is
asking you for the message. Type it on the first line, save the file, and close the tab. The
commit is made when the tab closes. To give up, close the tab without typing anything.

**`nothing added to commit`.** You skipped `git add`. Run `git add index.html`, then commit.
:::

## Read your history: git log {#log}

```terminal
$ git log
commit c50e3a0c6ce098bd6f6ca0fa80fcc20a3965c2d8 (HEAD -> main)
Author: Your Name <12345678+your-username@users.noreply.github.com>
Date:   Wed Nov 4 10:11:00 2026 +0000

    Add my first web page
```

`git log` lists your commits, newest first. Each one shows:

- `commit` and the full hash. Git usually shows only the first seven characters, as in
  `c50e3a0`.
- `(HEAD -> main)`: this is the commit you are on now, at the tip of `main`. Lesson 5 explains it.
- `Author` and `Date`: who made the commit and when.
- The message, indented.

::: tip
When the history is longer than your screen, `git log` shows one screenful at a time and waits.
Press <kbd>Space</kbd> to see more, and <kbd>q</kbd> to quit and get your prompt back.
:::

## The three places your work can be {#areas}

You have now met the three places Git thinks about:

::: figure id=fig-03-1
The three areas. You edit files in your **working folder**. `git add` copies changes into the
**staging area**, where you collect what goes into the next snapshot. `git commit` saves
everything in the staging area as a new commit in the **repository**, inside the `.git` folder.
:::

| Place | What it holds | How things get there |
|---|---|---|
| Working folder | Your files, as you see them in VS Code | You edit them |
| Staging area | The changes chosen for the next commit | `git add` |
| Repository | Every commit, forever | `git commit` |

`git status` tells you what is in each place right now. Try it below: click the buttons in any
order, and watch where `index.html` is and what `git status` says.

::: widget name=three-areas
A small model of your repository with one file. Try **Edit index.html**, then **git commit**
without **git add** first; then edit the file again *after* adding it. The `git status` text is
exactly what Git prints in each situation.
:::

## What you learned {#summary}

- `git init` turns a folder into a repository, once per project. The history lives in `.git`.
- Saving a snapshot takes two steps: `git add` chooses, `git commit -m "..."` saves.
- `git status` shows what Git sees and hints at what to do next. Run it often.
- `git log` lists your commits, newest first.

| Command | What it does |
|---|---|
| `pwd` | Shows which folder the terminal is in |
| `ls`, `ls -a` | Lists the files in the folder (`-a`: hidden ones too) |
| `git init` | Turns the current folder into a repository |
| `git status` | Shows what has changed and what is staged |
| `git add FILE` | Puts a file's changes into the staging area |
| `git commit -m "MESSAGE"` | Saves the staged changes as a commit |
| `git log` | Lists the commits (press <kbd>q</kbd> to quit) |

## Check yourself {#quiz}

```quiz
? You see `fatal: not a git repository`. What is the most likely reason?
- [ ] Git is not installed
- [x] The terminal is in a folder that is not a repository
- [ ] The repository is broken
> It almost always means the terminal is in the wrong folder. Check with `pwd`, then open your project folder.

? You created `about.html` and committed straight away with `git commit -m "Add about page"`. Git says "nothing added to commit". Why?
- [ ] The message was too short
- [x] You did not `git add about.html` first, so nothing was in the staging area
- [ ] New files must be committed with `git init`
> A commit saves what is in the staging area. Add the file first, then commit.

? What does "working tree clean" mean?
- [ ] The `.git` folder is empty
- [ ] Every file has been deleted
- [x] Your files are exactly as they were in the last commit
> Nothing has changed since your last snapshot, and nothing is waiting in the staging area.

? Why is your commit hash different from the one in this lesson?
- [ ] Your Git is a different version
- [x] The hash is calculated from the content, the author and the exact time, so every commit gets its own
- [ ] You made a mistake
> Hashes are unique names. Two people making "the same" commit at different times get different hashes.
```
