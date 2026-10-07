## Objects and hashes {#s1}

You can use Git for years without knowing how it stores your work. But a look inside explains much of what you have learned: why commits have hashes, why a branch costs nothing, why rewriting a commit changes every commit after it, and why a detached HEAD is nothing to fear. This module opens the `.git` folder. Everything in it is read-only for you: you only look.

At heart, Git is a small database of **objects**. Each object is stored under a name calculated from its content, its **hash**, a 40-character hexadecimal number such as `8bf3c2d58c2d8d9c541c166d6e80435faab5756a`. Three kinds of object hold your history:

- A **blob** holds the contents of one file: just the bytes, without the file's name.
- A **tree** holds the contents of one folder: a list of names, each with the hash of a blob (for a file) or of another tree (for a subfolder).
- A **commit** holds the hash of the tree for the whole project, the hash of its parent commit (two for a merge, none for the first commit), the author, the committer, the dates and the message.

So a commit is a snapshot: its tree describes every file in the project at that moment. A fourth kind, the **annotated tag**, appears in Module 10.

::: figure #fig-09-01
Two commits from the recipes repository. Each points to its own tree, and the newer one to its parent. Both trees point to the same README blob, because the README did not change between them.
:::

## Looking inside a commit {#s2}

`git cat-file` shows any object: `-t` prints its type, and `-p` ("pretty-print") its contents. You can name an object by its full hash, or by the first few characters as long as no other object starts with them; seven usually suffice.

In the session, you follow the newest commit of the recipes repository down to a file. To follow along in your own repository, start from a hash that `git log --oneline` prints, then copy each hash you see into the next command.

{{SESSION:m09-look-inside}}

- `git cat-file -t 8bf3c2d` says that `8bf3c2d` is a `commit`.
- `-p` shows the whole commit object, and it is short. `tree` gives the hash of the project's tree, and `parent` the hash of the commit before it, `907a979`. `author` and `committer` give the name and email, then the date as seconds since 1 January 1970 (UTC), then the time zone, `+0000`. After a blank line comes the message. That is all a commit is.
- `git cat-file -p 063e137` shows that tree. Each line has a **mode** (`100644` means an ordinary file; `100755` an executable one, and `040000` a subfolder, which is another tree), a type, a hash and a name.
- `git cat-file -p 871d830` shows the blob for `pancakes.md`: exactly the file's contents, with no name and no date. The name lives in the tree.
- The first commit, `907a979`, has a `tree` but no `parent` line: that is what makes it the first.

The author and the committer are usually the same person. They differ when someone applies another person's work, for example when a rebase replays a colleague's commits: the author wrote the change, the committer made this commit of it.

## Hashes come from content {#s3}

Git calculates an object's hash from its content, with a short header that gives the object's type and size. The same content always gives the same hash, on every computer, and any change, however small, gives a completely different one. `git hash-object <file>` calculates the hash a file would have as a blob, without storing anything.

In the session, you compare the hash of `pancakes.md` with that of an identical copy, and then with the copy after changing one character, a full stop. To follow along, use any file in your repository.

{{SESSION:m09-hash}}

`pancakes.md` hashes to `871d830f…`, the same blob hash the tree listed in Section 2. The identical copy gives the same hash, so Git would store it only once, under that name. Adding one full stop gives a hash with nothing in common with the first.

This explains several things you have seen:

- **Unchanged files cost nothing.** A new commit's tree refers to the same blobs as before for every file that did not change. Only changed files add new blobs.
- **History cannot change unnoticed.** A commit contains its tree's hash and its parent's hash. Change anything in an old commit, even a typo in its message, and its hash changes; the next commit names a different parent, so its hash changes too, and so on to the newest commit. This is why amending and rebasing make *new* commits (Modules 3 and 8), and why others notice when shared history is rewritten.
- **Copies agree.** Two clones that have a commit with the same hash have exactly the same history up to that commit.

::: note title="SHA-1 and SHA-256"
Git's hashes are calculated with SHA-1, in a hardened form that detects known attacks. Recent versions of Git can also create repositories that use the stronger SHA-256 (`git init --object-format=sha256`), whose hashes are 64 characters long. Hosting services do not yet generally support them, so stay with the default for now.
:::

## Where objects live {#s4}

Everything Git knows about a repository is in its `.git` folder. In the session, you list it, find the objects, and pick out one by its hash. To follow along, run the same commands in your own repository; your folder names under `objects` will differ.

{{SESSION:m09-objects}}

The entries of `.git`, in the order `ls` lists them:

- `COMMIT_EDITMSG` holds the message of the last commit you made.
- `HEAD` records where you are (Section 5), and `config` holds the repository's settings, including its remotes.
- `description` is used only by an old web viewer, and `hooks` holds sample scripts that Git can run at certain moments.
- `index` is the staging area from Module 2: a list of the files and blobs the next commit will contain.
- `info` holds `exclude`, a private `.gitignore` for this clone only.
- `logs` holds the reflog from Module 8.
- `objects` and `refs` hold the objects and the branches.

Under `objects`, each object is a file named after its hash: the first two characters name a folder, and the other 38 the file. So blob `871d830f…` is the file `1d830f4cec…` in the folder `87`. The six folders correspond to the six objects of the two commits: two commits, two trees and two blobs. The README's blob is shared by both trees, as the figure in Section 1 shows.

The object files are compressed, so you cannot read them with `cat`; use `git cat-file`. As a repository grows, Git packs many objects into a few files under `objects/pack`, storing similar objects as differences from each other. That is why a repository with a long history usually takes less space than you might expect.

::: pitfall
Never edit or delete files inside `.git` by hand. A damaged object or reference can make commits unreadable. Everything this module shows has a Git command that does it safely. The one exception is `info/exclude`, which you may edit like a `.gitignore`.
:::

## Branches and HEAD {#s5}

A branch is not an object. It is a **ref**, a reference: a name that points at a commit, stored in `.git/refs/heads/` as a small file containing the commit's hash. **HEAD** is a ref too, usually a *symbolic* one: instead of a hash, it names the branch you are on.

In the session, you read HEAD and `main`, create a branch, switch to it, and watch the files change. To follow along, run the same commands; your hashes will differ, and `ls .git/refs/heads` lists all your branches. Afterwards, run `git switch main`.

{{SESSION:m09-refs}}

- `.git/HEAD` contains `ref: refs/heads/main`: you are on `main`. `.git/refs/heads/main` contains one line, the hash of the newest commit, `8bf3c2d…`.
- `git branch starters` creates `.git/refs/heads/starters`, with the same hash. That one small file is the whole branch, which is why creating a branch is instant and copies nothing (Module 4).
- `git switch starters` changes `.git/HEAD` to `ref: refs/heads/starters`. When you commit, Git writes the new commit's hash into the file of the branch that HEAD names, which is how the branch label moves forward.
- `git rev-parse HEAD` turns any name into the hash it stands for. It is the safe way to read refs from scripts.

Other refs follow the same pattern. Remote-tracking branches such as `origin/main` live under `refs/remotes/`, and tags under `refs/tags/`. A **detached HEAD** (Module 3) is simply a `.git/HEAD` that contains a commit's hash directly, instead of the name of a branch, as Exercise 4 shows.

Git does not always keep one file per ref. It can collect many refs in a single file, `.git/packed-refs`, and newer versions offer another storage format altogether. So read refs with commands such as `git rev-parse` and `git branch`, not by opening files.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**Which object?** For each, say whether it is stored in a blob, a tree or a commit: the text of `pancakes.md`; the name `pancakes.md`; the commit message; the hash of the parent commit; the fact that `pancakes.md` is an ordinary file, not an executable one.
:::

::: solution
The text: a blob. The name: a tree. The message: a commit. The parent's hash: a commit. The file mode (`100644`): a tree, next to the name.
:::

::: exercise #e2 level=1 kind=coding minutes=4
**The first commit's tree.** List the files in the tree of the first commit of your recipes repository, using only `git log` and `git cat-file`.
:::

::: solution
Find the first commit, read its tree's hash, then show the tree:

{{SESSION:m09-e2-solution}}

The first tree lists only `README.md`. Its blob, `2ecc1f2`, is the same as in the newer tree of Section 2: the README did not change.
:::

::: exercise #e3 level=2 kind=conceptual minutes=3
**One letter.** You correct a typo in the message of a commit that has three commits after it, with `reword` in an interactive rebase. Why do all four commits get new hashes, although only one message changed?
:::

::: solution
The changed commit's content differs, so its hash changes. The next commit contains its parent's hash, which is now different, so its content and hash change as well, and so on for each later commit. Each commit's hash covers the whole history before it.
:::

::: exercise #e4 level=2 kind=coding minutes=4
**A detached HEAD on disk.** Detach HEAD at the commit before the newest one, and look at `.git/HEAD`. Then switch back to `main` and look again.
:::

::: solution
{{SESSION:m09-e4-solution}}

Detached, `.git/HEAD` holds a commit hash; on a branch, it holds `ref: refs/heads/main`. A commit made while detached moves only HEAD, and no branch file records it, which is why such commits are easy to lose (Module 3).
:::

::: exercise #e5 level=2 kind=conceptual minutes=3
**Count the objects.** A new repository gets two commits. The first adds `a.txt` and `b.txt`. The second changes only `b.txt`. How many blobs, trees and commits does the repository hold?
:::

::: solution
Three blobs (`a.txt`, the first `b.txt`, the second `b.txt`), two trees (one per commit, both naming the same `a.txt` blob) and two commits: seven objects.
:::

::: exercise #e6 level=1 kind=conceptual minutes=3
**Cheap branches.** Explain, in terms of what is stored, why creating a branch takes no time, and why deleting a merged branch loses nothing.
:::

::: solution
A branch is one small file holding a commit's hash; creating it writes that file, and copies no objects. Deleting a merged branch deletes only that file. The commits are objects, and the branch they were merged into still reaches them through its own commits' parents.
:::

## Self-check quiz {#quiz}

```quiz
? What does a blob contain?
- [ ] A file's name and contents
- [x] Only a file's contents
- [ ] A list of files in a folder
- [ ] A commit message
> The name is stored in the tree that lists the blob.

? What does a commit object contain?
- [ ] Copies of every changed file
- [ ] Only the message and the date
- [x] A tree hash, parent hashes, author, committer, dates and the message
- [ ] The names of the branches that contain it
> The tree describes the whole project; the parents link the commit into the history.

? Two files in different folders have exactly the same contents. How many blobs does Git store for them?
- [x] One
- [ ] Two
- [ ] None until they are pushed
- [ ] One per commit that contains them
> The same content gives the same hash, so it is stored once.

? Why does changing an old commit change the hashes of all later commits?
- [ ] Git renumbers commits after every change.
- [x] Each commit contains its parent's hash, so a new parent hash changes the next commit's content.
- [ ] Hashes depend on the current date.
- [ ] Only the branch label changes, not the hashes.
> This chain of hashes is what makes history tamper-evident.

? What does `.git/refs/heads/main` usually contain?
- [ ] A copy of every commit on `main`
- [ ] The list of files on `main`
- [x] The hash of the newest commit on `main`
- [ ] The text `ref: main`
> A branch is a name for one commit; the history follows from that commit's parents.

? What does `.git/HEAD` contain when you are on `main`?
- [ ] The hash of the first commit
- [x] `ref: refs/heads/main`
- [ ] The word `main` and a date
- [ ] Nothing: HEAD is not a file
> When HEAD is detached, it contains a commit's hash instead.

? Which command safely shows the contents of any object?
- [ ] `cat .git/objects/…`
- [ ] `git show-object`
- [x] `git cat-file -p`
- [ ] `git log --raw`
> Object files are compressed, and some objects live in packs, so read them through Git.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [10.2: Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) and [10.3: Git References](https://git-scm.com/book/en/v2/Git-Internals-Git-References).
- The reference pages for [git cat-file](https://git-scm.com/docs/git-cat-file), [git hash-object](https://git-scm.com/docs/git-hash-object) and [git rev-parse](https://git-scm.com/docs/git-rev-parse).
- [gitrepository-layout](https://git-scm.com/docs/gitrepository-layout), which describes every file in the `.git` folder.
