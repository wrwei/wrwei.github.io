---
title: "Working from two places: pull, push, clone"
lead: Bring changes from GitHub to your computer, deal with a push that GitHub refuses, and make a second copy of your project with git clone.
minutes: 40
needs: Lessons 7 and 8 (`my-page` on GitHub)
goals:
  - Bring new commits from GitHub to your computer with `git pull`
  - Understand why GitHub sometimes rejects a push, and fix it
  - Get a copy of any repository with `git clone`
  - Follow the daily routine: pull, work, commit, push
---

## Why pull? {#why}

In Lesson 7 you sent commits *to* GitHub with `git push`. Commits can also arrive on GitHub
without coming from your computer:

- you edit a file on GitHub's website;
- you work on another computer and push from there;
- someone you work with pushes their work.

`git pull` brings those commits to your computer. You will try the first one yourself, playing
both parts, and see how the others work.

## A change made on GitHub {#web-edit}

GitHub lets you edit files in the browser. Use it to add a line to your README:

::: where github
1. On your repository's page, click `README.md` in the list of files.
2. In the upper-right corner of the file, click the pencil icon to edit it.
3. Add a blank line at the end, then this line, with your own username:
   `See it live: https://your-username.github.io/my-page/`
4. Click **Commit changes...**. A box opens with a ready-made message, "Update README.md". Leave
   it. Choose to commit directly to the `main` branch, not to a new branch, then click **Commit
   changes**.
:::

<!-- replay:
gh-web-edit your-username/my-page main README.md "Update README.md" <<'EOF'
# My page

My first project with Git and GitHub: a small personal web page.

See it live: https://your-username.github.io/my-page/
EOF
-->

You have just made a commit on GitHub. Your computer does not have it yet: look at `README.md` in
VS Code, and the new line is not there. Now ask Git:

```terminal
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

"Up to date"? Not really. `git status` compares your branch with `origin/main`, your computer's
**note** of where `main` is on GitHub. That note is only refreshed when Git talks to GitHub, and
it has not talked to GitHub since your last push. So `git status` cannot know about the new
commit yet. (If yours already says "Your branch is behind 'origin/main' by 1 commit", VS Code has
talked to GitHub for you in the background. That is fine: carry on with `git pull`.)

`git pull` talks to GitHub, updates the note and brings the new commits into your branch:

```terminal
$ git pull
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 441 bytes | 441.00 KiB/s, done.
From https://github.com/your-username/my-page
   a478f84..0399de7  main       -> origin/main
Updating a478f84..0399de7
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
```

The first lines are Git downloading the commit. `a478f84..0399de7 main -> origin/main` is the
note being updated. Then `Fast-forward`: your `main` moves forward to the new commit, like the
merge in Lesson 5. Look at `README.md` in VS Code: the new line is there.

::: keyidea
**`git status` only knows what Git saw the last time it talked to GitHub.** To be sure you have
everything, pull.
:::

## When both sides have changed {#diverged}

Now the situation that surprises everyone once. Make a second change on GitHub, and a different
change on your computer, *without* pulling in between.

First, on GitHub:

::: where github
Edit `README.md` on GitHub again, as above. Add a blank line and then the line
`Made while learning Git.` at the end, and commit it directly to `main`.
:::

<!-- replay:
gh-web-edit your-username/my-page main README.md "Update README.md" <<'EOF'
# My page

My first project with Git and GitHub: a small personal web page.

See it live: https://your-username.github.io/my-page/

Made while learning Git.
EOF
-->

Then, on your computer, without pulling, add a hobby to `index.html`:

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
  <p>This is my first web page, published with GitHub Pages.</p>
  <p>I like walking, photography and good coffee.</p>
  <h2>My hobbies</h2>
  <ul>
    <li>Walking</li>
    <li>Photography</li>
    <li>Cooking</li>
  </ul>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Add cooking to my hobbies"
[main 2a80ae8] Add cooking to my hobbies
 1 file changed, 1 insertion(+)
$ git push
To https://github.com/your-username/my-page.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/your-username/my-page.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

GitHub refused the push. This is not an error in your work, and nothing is lost. GitHub has a
commit you do not have (the README change), and you have one GitHub does not have (cooking).
If GitHub accepted your push, its commit would be thrown away, so it refuses, and the hint tells
you what to do: pull first.

::: figure id=fig-09-2
Why a push is rejected. Both sides added a commit after the last time they agreed. `git pull`
brings GitHub's commit to your computer and merges the two; then there is nothing left to throw
away, and `git push` is accepted.
:::

Pull. Both sides have new commits, so, as in Lesson 5, Git makes a merge commit and opens a
`MERGE_MSG` tab in VS Code with the message "Merge branch 'main' of
https://github.com/your-username/my-page". Close the tab; the pull then finishes with this:

```terminal
$ git pull
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 1), reused 3 (delta 1), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 386 bytes | 386.00 KiB/s, done.
From https://github.com/your-username/my-page
   0399de7..1b84697  main       -> origin/main
Merge made by the 'ort' strategy.
 README.md | 2 ++
 1 file changed, 2 insertions(+)
```

The two changes were in different files, so Git merged them by itself, with a merge commit, as in
Lesson 5. Click back in the terminal, and push:

```terminal
$ git push
Enumerating objects: 9, done.
Counting objects: 100% (8/8), done.
Delta compression using up to 8 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 745 bytes | 745.00 KiB/s, done.
Total 5 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/your-username/my-page.git
   1b84697..22893c9  main -> main
```

Accepted. The graph shows what happened:

```terminal
$ git log --oneline --graph -4
*   22893c9 (HEAD -> main, origin/main, origin/HEAD) Merge branch 'main' of https://github.com/your-username/my-page
|\
| * 1b84697 Update README.md
* | 2a80ae8 Add cooking to my hobbies
|/
* 0399de7 Update README.md
```

`origin/HEAD` marks the branch GitHub shows first, here `main`. You can ignore it. (Older versions
of Git do not show it here.)

::: tip
If the two sides had changed the same lines, `git pull` would have stopped with a conflict. You
know what to do from Lesson 6: fix the file, `git add`, `git commit`, then `git push`.
:::

::: trouble
**`Your local changes to the following files would be overwritten by merge`.** You have changes you
have not committed, and the pull would overwrite them. Commit them first, then pull.

**`fatal: Need to specify how to reconcile divergent branches`.** The `pull.rebase` setting from
Lesson 2 is missing. Run `git config --global pull.rebase false` and pull again.
:::

## A second copy: git clone {#clone}

To get a repository from GitHub onto a computer, for example a new laptop, or someone else's
project, you **clone** it. Cloning downloads the whole repository, with its full history, and sets
up `origin` for you.

To find any repository's address, open its page on GitHub, click the green **Code** button, check
that **HTTPS** is selected, and copy the address.

Try it with your own project, as if you were on a second computer. First go up one folder, out of
`my-page`, so the copy does not end up inside it:

```terminal
$ cd ..
$ pwd
/Users/you
```

`cd` ("change directory") moves the terminal to another folder, and `..` means "the folder
above". The answer should be your home folder (on Windows `/c/Users/you`, on Linux `/home/you`),
not `my-page`.

Now clone, naming the new copy `my-page-laptop`. Type the address with your own username: this
box has no **Copy** button, because it contains `your-username`.

```terminal nocopy
$ git clone https://github.com/your-username/my-page.git my-page-laptop
Cloning into 'my-page-laptop'...
remote: Enumerating objects: 46, done.
remote: Counting objects: 100% (46/46), done.
remote: Compressing objects: 100% (32/32), done.
remote: Total 46 (delta 15), reused 43 (delta 12), pack-reused 0 (from 0)
Receiving objects: 100% (46/46), 5.05 KiB | 5.05 MiB/s, done.
Resolving deltas: 100% (15/15), done.
```

Look inside it. `cd my-page-laptop` moves the terminal into the copy. Only the terminal moves:
VS Code's file list on the left still shows `my-page`, while your prompt now ends in
`my-page-laptop`, which is where your commands run.

```terminal
$ cd my-page-laptop
$ ls
README.md  index.html  style.css
$ git log --oneline -3
22893c9 (HEAD -> main, origin/main, origin/HEAD) Merge branch 'main' of https://github.com/your-username/my-page
2a80ae8 Add cooking to my hobbies
1b84697 Update README.md
$ git remote -v
origin	https://github.com/your-username/my-page.git (fetch)
origin	https://github.com/your-username/my-page.git (push)
```

Everything is there: the files (perhaps listed in another order), the whole history, and
`origin`, already connected. On a real second computer, you would open this folder in VS Code and
work as usual: pull, change, commit, push.

You do not need the copy any more. Go back to your project:

```terminal
$ cd ../my-page
$ pwd
/Users/you/my-page
```

You can delete the `my-page-laptop` folder whenever you like: it is only a copy. To delete it,
open your home folder in File Explorer, Finder or Files, and move `my-page-laptop` (not
`my-page`!) to the Recycle Bin or Trash.

::: trouble
**`fatal: destination path 'my-page-laptop' already exists`.** A folder with that name is already
there. Choose another name, or delete the old folder first.

**The copy ended up inside `my-page`.** You cloned without `cd ..` first. Delete the copy: in
VS Code's file list, right-click `my-page-laptop` and choose **Delete**. Then do it again from the
folder above.
:::

## The daily routine {#routine}

With everything from this lesson, working with GitHub comes down to a short routine:

::: figure id=fig-09-1
The daily routine. Pull when you start, so you have the latest commits. Work and commit in small
steps. Push when you finish, so the commits are backed up and others can see them.
:::

1. **Start: `git pull`.** Get everything that happened since last time.
2. **Work.** Edit, then `git add` and `git commit`, as many times as you like.
3. **Finish: `git push`.** Send your commits to GitHub.

If you always pull before you start, rejected pushes become rare.

## What you learned {#summary}

- `git pull` brings new commits from GitHub and merges them into your branch.
- `git status` only knows what Git saw the last time it talked to GitHub.
- GitHub **rejects a push** when it has commits you do not have. `git pull`, then `git push`.
- `git clone URL` makes a full copy of a repository, history and `origin` included.
- `cd FOLDER` moves the terminal; `cd ..` goes up one folder.

| Command | What it does |
|---|---|
| `git pull` | Brings new commits from GitHub into your branch |
| `git clone URL [FOLDER]` | Copies a repository from GitHub into a new folder |
| `cd FOLDER`, `cd ..` | Moves the terminal into a folder, or up one |

## Check yourself {#quiz}

```quiz
? You edited a file on GitHub. On your computer, `git status` says "Your branch is up to date with 'origin/main'". Why?
- [ ] The edit on GitHub failed
- [x] Git has not talked to GitHub since your last push, so `origin/main`, the note `git status` compares with, is out of date
- [ ] `git status` asked GitHub, and GitHub had nothing new
> `git status` never asks GitHub. `origin/main` is updated only when Git talks to GitHub, for example with `git pull`.

? GitHub rejects your push with "(fetch first)". What do you do?
- [ ] Delete the repository on GitHub and push again
- [x] `git pull`, then `git push`
- [ ] `git push` again until it works
> GitHub has commits you do not have. Pull them, so they are merged with yours, then push.

? What does `git clone` give you?
- [ ] Only the newest version of the files
- [ ] The files and history, but you must set up `origin` yourself
- [x] The files, the whole history, and `origin` already set up
> A clone is a complete repository, ready to pull and push.

? What is the best habit when you sit down to work on a shared project?
- [x] Pull first
- [ ] Push first
- [ ] Clone it again
> Pulling first gives you everyone's latest work, so your commits build on it and your push is not rejected.
```
