---
title: Undo and fix mistakes
lead: The commands that get you out of trouble, as recipes. Try each one on your project, so you know what to do when it happens for real.
minutes: 40
needs: Lesson 10 (`my-page` on GitHub, up to date)
goals:
  - Take a file out of the staging area with `git restore --staged`
  - Keep files out of Git with `.gitignore`
  - Fix your last commit with `git commit --amend`, before you push
  - Undo your last commit but keep the work, with `git reset --soft`
  - Undo a commit that is already on GitHub, with `git revert`
  - Find "lost" commits with `git reflog`
---

## Two rules first {#rules}

Git almost never loses work that you have committed. Most "disasters" can be undone. Two rules
keep it that way:

::: keyidea
1. **Commit before you try anything risky.** What is committed can be recovered; changes that were
   never committed cannot.
2. **Only rewrite commits that you have not pushed.** `--amend` and `reset` change your history.
   That is fine on your computer, but if GitHub already has those commits, use `git revert`
   instead.
:::

Open `my-page` in VS Code with a terminal. Each recipe below starts with the situation in bold.

## "I want to throw away my changes to a file" {#restore}

You met this in Lesson 4: `git restore FILE` puts the file back as it was in your last commit.

```terminal norun
$ git restore index.html
```

Remember that the changes you throw away cannot be recovered.

## "I added a file I did not mean to" {#unstage}

Suppose you keep private notes in the project folder. Create a file `notes.txt`:

```file notes.txt
Ideas for my page:
- add a photo
- try a different font
```

Out of habit, you add everything:

```terminal
$ git add .
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   notes.txt
```

The notes are about to go into a commit, and then to GitHub, where anyone can read them. The hint
says how to take a file back out of the staging area:

```terminal
$ git restore --staged notes.txt
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

nothing added to commit but untracked files present (use "git add" to track)
```

`notes.txt` is untracked again. `--staged` only changes the staging area; your file is untouched.

## "Git should never track this file" {#ignore}

`notes.txt` is safe for now, but the next `git add .` would add it again. To tell Git to ignore a
file for good, list it in a file called `.gitignore` (with a dot at the start), at the top of your
project:

```file .gitignore
# My private notes
notes.txt
```

Lines starting with `#` are comments. Every other line is the name of a file, or a pattern, to
ignore.

```terminal
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.gitignore

nothing added to commit but untracked files present (use "git add" to track)
```

`notes.txt` has disappeared from the list: Git ignores it now. `.gitignore` itself is a normal
file that belongs in the project, so commit it:

```terminal
$ git add .gitignore
$ git commit -m "Ignore my private notes"
[main a2f765c] Ignore my private notes
 1 file changed, 2 insertions(+)
 create mode 100644 .gitignore
```

::: tip
`.gitignore` takes patterns too: `*.log` ignores every file ending in `.log`, and `drafts/`
ignores a whole folder. On a Mac, add `.DS_Store`: macOS creates such files in every folder you
open in Finder.
:::

## "My last commit has a mistake, and I have not pushed it" {#amend}

You add one more hobby, and some space between the list items. Change both files:

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
    <li>Reading</li>
  </ul>
  <h2>Contact</h2>
  <p>You can find me on GitHub as your-username.</p>
</body>
</html>
```

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

li {
  margin-bottom: 0.3em;
}
```

Then you commit in a hurry: only one file, and a typo in the message.

```terminal
$ git add index.html
$ git commit -m "Add redaing to my hobbies"
[main d562547] Add redaing to my hobbies
 1 file changed, 1 insertion(+)
```

Two mistakes: "redaing", and `style.css` was left out. Because you have **not pushed** this commit,
you can fix it. Add the forgotten file, then use `--amend` with the right message:

```terminal
$ git add style.css
$ git commit --amend -m "Add reading to my hobbies"
[main e9fccc7] Add reading to my hobbies
 Date: Thu Nov 12 10:09:00 2026 +0000
 2 files changed, 5 insertions(+)
```

`--amend` replaces your last commit with a new one, made from what it had plus what is staged now,
and with the new message. `Date:` shows that it keeps the time of the original commit. Check:

```terminal
$ git log --oneline -2
e9fccc7 (HEAD -> main) Add reading to my hobbies
a2f765c Ignore my private notes
```

The commit with the typo is gone from your history. Notice that the hash changed: it is a new
commit.

::: tip
To add a forgotten file without changing the message, use `git commit --amend --no-edit`.
:::

## "I want to undo my last commit, but keep the work" {#reset}

Sometimes you want the commit gone, but not the changes: to change them more, or to commit them
differently. As long as you have not pushed, `git reset --soft` takes the last commit back and
leaves its changes staged:

```terminal
$ git reset --soft HEAD~1
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html
	modified:   style.css
```

`HEAD~1` means "one commit before `HEAD`". The commit "Add reading to my hobbies" is undone, but its
changes are waiting in the staging area, so nothing is lost. ("Ahead by 1 commit" is the
`.gitignore` commit, which you have not pushed yet.) Commit them again:

```terminal
$ git commit -m "Add reading to my hobbies"
[main 38d3619] Add reading to my hobbies
 2 files changed, 5 insertions(+)
```

And push both commits:

```terminal
$ git push
Enumerating objects: 10, done.
Counting objects: 100% (10/10), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (7/7), 857 bytes | 857.00 KiB/s, done.
Total 7 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To https://github.com/your-username/my-page.git
   dca2d0a..38d3619  main -> main
```

::: pitfall
You may read about `git reset --hard`. It also throws away your changes, and with them work that
was never committed. Do not use it until you are sure you understand it.
:::

## "I want to undo a commit that is already on GitHub" {#revert}

The reading hobby is online now, and you change your mind about it. The commit is on GitHub, so
**do not** amend or reset it: GitHub would then have commits your computer does not, and your next
push would be rejected. Instead, make a new commit that undoes it, with `git revert` and the
commit's hash. `HEAD` works too, because it is the latest commit:

```terminal
$ git revert HEAD
[main 23f85a5] Revert "Add reading to my hobbies"
 2 files changed, 5 deletions(-)
```

As with a merge, VS Code opens a tab with a ready-made message, `Revert "Add reading to my
hobbies"`; close it to accept. The reading line and the list spacing are gone from your files.
Your history now has both commits, the change and its undoing, which is honest and safe:

```terminal
$ git log --oneline -3
23f85a5 (HEAD -> main) Revert "Add reading to my hobbies"
38d3619 (origin/main, origin/HEAD) Add reading to my hobbies
a2f765c Ignore my private notes
$ git push
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 8 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 470 bytes | 470.00 KiB/s, done.
Total 4 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To https://github.com/your-username/my-page.git
   38d3619..23f85a5  main -> main
```

You can revert any commit, not only the last one: use its hash from `git log --oneline`.

## "I think I lost a commit" {#reflog}

You amended a commit and reset one. Where did the old versions go? Nowhere yet. Git keeps a diary
of every place `HEAD` has been, called the **reflog**:

```terminal
$ git reflog -7
23f85a5 (HEAD -> main, origin/main, origin/HEAD) HEAD@{0}: revert: Revert "Add reading to my hobbies"
38d3619 HEAD@{1}: commit: Add reading to my hobbies
a2f765c HEAD@{2}: reset: moving to HEAD~1
e9fccc7 HEAD@{3}: commit (amend): Add reading to my hobbies
d562547 HEAD@{4}: commit: Add redaing to my hobbies
a2f765c HEAD@{5}: commit: Ignore my private notes
dca2d0a HEAD@{6}: pull: Fast-forward
```

Read it from the bottom up: the pull at the end of Lesson 10, then the story of this lesson.
Even the commit with the typo,
`d562547`, is still there. To bring back any of these commits, put a branch on it:

```terminal norun
$ git branch rescue d562547
```

Now `rescue` points at that commit, and you can switch to it, look at it, or merge it. Git keeps
reflog entries for about three months.

## Which undo do I need? {#which}

::: figure id=fig-11-1
Which undo to use. Start from what you want to undo: changes in a file, a file in the staging
area, your last commit (before or after pushing), or a commit you cannot find.
:::

| Situation | Command | Safe after pushing? |
|---|---|---|
| Throw away changes to a file | `git restore FILE` | Not about commits; the changes are lost |
| Take a file out of the staging area | `git restore --staged FILE` | Yes, it changes nothing in the history |
| Never track a file | add it to `.gitignore` | Yes |
| Fix the last commit's message or files | `git commit --amend` | **No**: only before pushing |
| Undo the last commit, keep the changes | `git reset --soft HEAD~1` | **No**: only before pushing |
| Undo a commit that is on GitHub | `git revert HASH` | **Yes**: this is the way |
| Find a commit that seems lost | `git reflog` | Yes |

::: trouble
**I amended or reset a commit that was already pushed, and now my push is rejected.** Do not force
it. Pull (`git pull`), resolve any conflict as in Lesson 6, and push. Your history will have a merge
commit, and nothing is lost.

**`git revert` stopped with a conflict.** Later commits changed the same lines. Resolve it as in
Lesson 6, then `git add` the files and `git revert --continue`. Or give up with
`git revert --abort`.
:::

## What you learned {#summary}

- Commit before anything risky; what is committed can be found again.
- Rewrite history (`--amend`, `reset`) only for commits you have not pushed. After pushing, use
  `git revert`.
- `git restore --staged FILE` unstages; `.gitignore` keeps files out of Git for good.
- `git reflog` lists everywhere `HEAD` has been, so "lost" commits can be found.

| Command | What it does |
|---|---|
| `git restore --staged FILE` | Takes a file out of the staging area |
| `git commit --amend -m "..."` | Replaces the last commit, with what is staged and a new message |
| `git reset --soft HEAD~1` | Undoes the last commit and keeps its changes staged |
| `git revert HASH` | Makes a new commit that undoes commit `HASH` |
| `git reflog` | Lists every commit `HEAD` has pointed at |

## Check yourself {#quiz}

```quiz
? You committed with a typo in the message and have not pushed. What is the simplest fix?
- [x] `git commit --amend -m "the right message"`
- [ ] `git revert HEAD`
- [ ] Delete the `.git` folder and start again
> `--amend` replaces the last commit. It is safe because GitHub has not seen the old one.

? A commit with a mistake is already on GitHub. How do you undo it?
- [ ] `git reset --soft HEAD~1`, then push
- [x] `git revert` with the commit's hash, then push
- [ ] `git commit --amend`, then push
> `revert` adds a new commit that undoes the old one, so the history GitHub has stays intact.

? You ran `git add .` and staged a file with passwords in it. You have not committed. What do you do?
- [x] `git restore --staged` the file, and add it to `.gitignore`
- [ ] Commit, then revert
- [ ] Nothing, Git never uploads such files
> Unstaging keeps it out of the commit; `.gitignore` keeps it out of every future `git add .`.

? Where can you find a commit that you replaced with `--amend`?
- [ ] Nowhere, it is deleted at once
- [ ] On GitHub
- [x] In `git reflog`
> The reflog lists every commit `HEAD` has pointed at, for about three months.
```
