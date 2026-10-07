## Create a repository {#s1}

A **repository** (often shortened to *repo*) is a project folder whose history Git keeps. Any folder can become one: `git init` turns the current folder into a repository by creating a hidden folder called `.git` inside it. Everything Git knows about the project's history lives in `.git`, while your own files stay where they are. You never need to open `.git` or change what is inside it, and you should not.

The command you will use more than any other is `git status`. It tells you which branch you are on, what Git sees in the folder and, often, which command to try next. Whenever you are unsure what state your work is in, run `git status`.

The rest of this series builds a small collection of family recipes. Start it now:

{{SESSION:m02-init}}

`git init` reports where it created the repository: a `.git` folder inside `recipes`. A plain `ls` would print nothing, because the folder is empty and `.git` is hidden; `ls -a` (for *all*) shows hidden entries as well, including `.` (this folder) and `..` (the folder above). `git status` confirms that you are on a branch called `main` and that there are no commits yet, and the hint in brackets says what to do next: create files and use `git add`.

::: pitfall
Run `git init` inside your project's folder, never in your home folder: that would put everything you own under version control. If you do it by mistake, delete the `.git` folder it created there, and only that folder.
:::

::: note title="Windows"
In PowerShell, `ls -a` does not work: type `ls -Force` to see hidden items such as `.git`. In Git Bash, `ls -a` works as shown.
:::

## The three areas {#s2}

Git keeps your work in three places, and most of its commands move changes between them:

- The **working tree** is the project's files as you see and edit them, in the folder.
- The **staging area** (also called the *index*) holds what will go into your next commit. You put changes there with `git add`.
- The **repository** holds the commits: every snapshot you have saved, stored in `.git`. `git commit` turns the contents of the staging area into a new commit.

::: figure #fig-02-01
Changes travel from the working tree to the staging area with `git add`, and from the staging area into the repository with `git commit`.
:::

Why not simply commit everything at once? The staging area lets you choose exactly what goes into each commit, and look at it before you commit. If you fixed a typo and also started a new recipe, you can commit the two separately, so that each commit tells one story. Section 4 does exactly that.

As you work, each file is in one of a few states. A new file is **untracked**: Git has never stored it. After `git add`, it is **staged**. After `git commit`, it is committed, and while it matches the last commit Git says nothing about it. Once you change it again, it is **modified**, and the cycle starts over.

::: analogy
Staging is like packing a parcel, and committing is like sealing it and writing the label. You can keep adding to the parcel, or take things out, until you seal it. Once it is sealed, its contents are fixed.
:::

## Your first commit {#s3}

Time for the first commit. Use your editor to create a file called `README.md` in the `recipes` folder, with the contents shown in the session. Then run the commands one at a time, and read what `git status` says after each step: the file starts as untracked, becomes a change to be committed, and ends up committed, leaving a clean working tree.

::: note title="Windows"
On Windows, `git add` may print `warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it`. This is harmless: Git for Windows converts between the line endings Windows editors use and the ones stored in the repository. You can ignore the warning.
:::

{{SESSION:m02-first-commit}}

The output of `git commit` packs in a lot. `[main (root-commit) 2cf38b1]` names the branch the commit was made on, says that this is the root commit (the first in the repository, with no commit before it), and gives the start of the commit's **hash**, `2cf38b1`. The next lines summarise the change: one file, three lines added (the heading, the blank line and the sentence), and a new file created.

`git log` lists the history, newest commit first. For each commit it shows the full hash, a 40-character name that identifies the commit, then the author, the date and the message. Git usually needs only the first seven characters to tell commits apart, which is why short hashes appear elsewhere.

Your hash will be different from `2cf38b1`. Git calculates it from the commit's content, its author and its time, so two commits share a hash only if they are identical in every respect.

## Stage what you mean to commit {#s4}

Suppose that while adding a pancake recipe, you also reworded the README. These are two unrelated changes, so they belong in two commits: one that adds the recipe, and one that explains the README change. With the staging area, you can commit them separately even though you made them at the same time. Create or edit both files as the session shows, then stage only the recipe first.

{{SESSION:m02-staging}}

The first `git status` lists two kinds of change: `README.md` is modified but not staged, and `pancakes.md` is untracked. After `git add pancakes.md`, the recipe moves to the "Changes to be committed" section, while `README.md` stays under "Changes not staged for commit". The commit therefore contains only the recipe, and the next `git status` confirms that the README change is still waiting. Adding and committing it makes the second commit.

The lines in brackets are Git's hints about what you might do next. `git restore`, which they mention, undoes changes; Module 3 covers it.

`git log --oneline` shows each commit on a single line, newest first: the short hash and the message. The graph below the session draws the same three commits as a straight line. The label `HEAD → main` on the newest one says that you are on the branch `main`, and that your next commit will go there. What branches are, and what `HEAD` means, is Module 4's subject.

## Good commit messages {#s5}

A commit message tells your future self, and anyone you work with, *why* a change was made. The change itself shows *what* changed; the message is the only place where the reason is recorded. A few habits make messages useful:

- Write a short summary line, of about 50 characters or fewer.
- Use the imperative mood, as if giving an instruction: *Add a pancake recipe*, not *Added* or *Adds*. A good test is that the summary completes the sentence "If applied, this commit will…".
- Make each commit one change. If the summary needs the word "and", it probably describes two commits.
- When the reason is not obvious, add more detail. Run `git commit` without `-m`, and Git opens your editor: write the summary on the first line, leave a blank line, then explain. Save and close the file to finish the commit.

| Weak message | Better message |
|---|---|
| `stuff` | `Add a pancake recipe` |
| `fixed it` | `Fix the oven temperature in the bread recipe` |
| `changes` | `Say what the notes are for` |
| `Fixed typo and added soup and updated README` | three commits, one for each change |

Good messages cost a few seconds when you commit, and save minutes or hours whenever someone tries to understand the history.

## Ignoring files {#s6}

Some files should never be in the history: temporary files and backups that editors create, files your operating system adds (`.DS_Store` on macOS, `Thumbs.db` on Windows), large or generated files that can be recreated, and above all secrets such as passwords and access keys.

A file called `.gitignore` tells Git which names to ignore, one pattern per line. It is committed like any other file, so everyone who works on the project shares the same rules. In the session, a shopping list saved as `shopping.tmp` should stay out of the repository.

{{SESSION:m02-ignore}}

The first `git status` lists `shopping.tmp` as untracked. Once `.gitignore` contains the pattern `*.tmp`, the second `git status` no longer mentions it: only `.gitignore` itself is left to commit. The file is still on your disk; Git simply ignores it.

A few pattern rules cover most needs. `*` matches any characters, so `*.tmp` matches every name ending in `.tmp`. A pattern ending in `/`, such as `photos/`, matches a folder and everything in it. Lines starting with `#` are comments. GitHub keeps ready-made `.gitignore` files for many languages and tools at <https://github.com/github/gitignore>.

`.gitignore` affects only files that are not yet tracked. A file that is already committed stays tracked even if a pattern matches it; Module 3 shows how to stop tracking one.

::: pitfall
Never commit a password or a key. Once a secret is in the history, treat it as leaked and change it at once, even if you delete the file later.
:::

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**Which area?** For each step, say where the newest version of `pancakes.md` is: the working tree, the staging area or the repository.

1. You save `pancakes.md` in your editor.
2. You run `git add pancakes.md`.
3. You run `git commit -m "Add a pancake recipe"`.
4. You change the recipe again and save it.
:::

::: solution
1. **Working tree** only: Git has not been told about the file.
2. **Staging area** (and still the working tree): the next commit will include this version.
3. **Repository**: the commit has saved it as part of a snapshot; the working tree and staging area now match it.
4. **Working tree**: the file is modified; the repository still holds the version from step 3 until you add and commit again.
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**Read the status.** Here is part of the output of `git status`:

```text
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   pancakes.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md
```

Which file will the next `git commit` include? Which file is modified but not staged, and which command would stage it?
:::

::: solution
The next commit will include `pancakes.md` only, because it is under "Changes to be committed". `README.md` is modified but not staged; `git add README.md` would stage it. This is the situation in the middle of the session in Section 4.
:::

::: exercise #e3 level=1 kind=coding minutes=10
**Two files, two commits.** Make a new folder called `menu`, next to your `recipes` folder rather than inside it, and turn it into a repository. Then create `soup.md` and `bread.md`, each with a heading. Commit them separately, each with a clear message, then list the history in one line per commit.
:::

::: solution
Make the folder and its repository first, then stage and commit one file at a time:

{{SESSION:m02-e3-solution}}

`git log --oneline` lists the newest commit first. Your hashes will differ from these.
:::

::: exercise #e4 level=1 kind=conceptual minutes=6
**Improve these messages.** Rewrite each commit message, splitting the commit where that would help: `update`, `fixed typo and added new recipe and changed readme`, `WIP`.
:::

::: solution
- `update` says nothing; name the change, for example `Update the bread recipe for a smaller tin`.
- `fixed typo and added new recipe and changed readme` describes three changes. Make three commits: `Fix a typo in the soup recipe`, `Add a lemon cake recipe` and `Say what the notes are for`.
- `WIP` ("work in progress") gives no reason to keep the commit. Commit when a piece of work is complete, and describe it, for example `Add the first half of the cake recipe`.
:::

::: exercise #e5 level=1 kind=coding minutes=10
**Ignore a whole folder.** Your recipes folder has a `photos` folder full of large pictures. Keep the folder out of the repository and commit the rule.
:::

::: solution
A pattern ending in `/` matches a folder and everything in it:

{{SESSION:m02-e5-solution}}

`git status` lists only `.gitignore`: the `photos` folder no longer appears as untracked.
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**Too late to ignore?** Yesterday you committed `passwords.txt` by mistake. Today you add `passwords.txt` to `.gitignore`. Is the file safe now? What should you do?
:::

::: solution
No. `.gitignore` affects only untracked files. `passwords.txt` is already tracked, so Git keeps tracking it, and yesterday's commit keeps the passwords in the history.

Change every password in the file at once, and treat the old ones as leaked. Then stop tracking the file (`git rm --cached`, in Module 3) so that `.gitignore` applies from now on. Removing it from old commits means rewriting history (Module 8), which is no help once the repository has been shared. The best protection is never to commit secrets at all.
:::

## Self-check quiz {#quiz}

```quiz
? What does `git init` create?
- [ ] Your first commit
- [x] A hidden `.git` folder that will hold the project's history
- [ ] A repository on GitHub
- [ ] A backup copy of the folder
> `git init` turns a folder into a repository by creating `.git`; the first commit comes later.

? After `git add pancakes.md`, where is that version of the file recorded?
- [ ] Only in the working tree
- [ ] In the repository
- [x] In the staging area
- [ ] On GitHub
> `git add` copies the file's current content into the staging area, ready for the next commit.

? `git status` says "nothing to commit, working tree clean". What does that mean?
- [x] Every change you made is committed.
- [ ] The repository has no commits.
- [ ] Git has deleted your files.
- [ ] You must run `git add` first.
> The working tree, the staging area and the last commit all match.

? Which is the best commit message?
- [ ] `changes`
- [ ] `stuff for Sam`
- [ ] `Fixed things and updated README and recipes`
- [x] `Add a pancake recipe`
> It names one change, in the imperative mood; the third option describes several changes.

? Why might you stage only some of your changes?
- [ ] Git cannot commit more than one file at a time.
- [x] To make each commit contain one change.
- [ ] Staged files are uploaded to GitHub.
- [ ] To make the repository smaller.
> Staging lets you choose what goes into each commit, so every commit tells one story.

? The output of a commit says `(root-commit)`. Why?
- [ ] The commit was made by an administrator.
- [ ] The commit changed the root folder.
- [x] It is the first commit in the repository.
- [ ] The commit failed and must be repeated.
> The root commit has no parent: history starts there.

? Which file belongs in `.gitignore`?
- [x] A temporary file that your editor creates
- [ ] `README.md`
- [ ] A recipe you wrote
- [ ] `.gitignore` itself
> Ignore files that should not be shared; `.gitignore` itself is committed so that everyone shares the rules.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, [*Pro Git*, section 2.2: Recording Changes to the Repository](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository).
- The reference pages for [git status](https://git-scm.com/docs/git-status), [git add](https://git-scm.com/docs/git-add) and [git commit](https://git-scm.com/docs/git-commit).
- The reference page for [gitignore](https://git-scm.com/docs/gitignore), with every pattern rule, and GitHub's [collection of .gitignore templates](https://github.com/github/gitignore).
- Chris Beams, [How to write a Git commit message](https://cbea.ms/git-commit/).
