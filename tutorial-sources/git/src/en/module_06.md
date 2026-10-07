## What a remote is {#s1}

So far your repository has lived in one folder on one computer. That is enough to keep a history, but not to share it, or to keep a copy safe when a laptop is lost. For both, Git uses **remotes**: other copies of the same repository, somewhere else, that yours can exchange commits with.

Git is *distributed*: every copy of a repository is complete, with the whole history, and no copy is special to Git itself. In practice, a team agrees that one copy, usually on a hosting service such as GitHub, is the shared one that everybody sends work to and takes work from. To your repository, that copy is a remote with a short name. The usual name is **origin**: it is the name `git clone` gives the repository you cloned from, and the name most people choose when they add a remote themselves.

Four commands move work between your repository and a remote:

- `git clone` makes a new local copy of a remote repository, with all its history.
- `git push` sends your new commits to the remote.
- `git fetch` brings the remote's new commits into your repository, without changing your own branches or files.
- `git pull` fetches, and then merges what it fetched into your current branch.

To remember what the remote had, your repository keeps **remote-tracking branches** with names such as `origin/main`: "where `main` was on `origin`, last time I looked". They move only when you fetch, pull or push. Your own `main` moves only when you commit or merge.

::: figure #fig-06-01
Your repository holds your own branches, and remote-tracking branches such as `origin/main` that record what the remote had at your last fetch. `git push` sends commits to the remote; `git fetch` brings them back.
:::

## Your first push {#s2}

A remote does not have to be on another computer. Any repository Git can reach works, including a folder on your own disk, and that is the easiest way to learn. In this module, a **bare repository** stands in for a server. A bare repository has the history but no working tree: nobody edits files in it, so others can push to it safely. By convention its folder name ends in `.git`.

Three commands put your repository on the stand-in server:

- `git init --bare <path>` creates the empty bare repository.
- `git remote add origin <path>` tells your repository about it, under the name `origin`. `git remote -v` lists your remotes and their addresses.
- `git push -u origin main` sends `main` there. `-u` (short for `--set-upstream`) also records `origin/main` as the **upstream** of your `main`, so that later a plain `git push` or `git pull` knows where to go.

On these pages the server lives in a folder called `/srv/git`. You cannot create that folder on your own computer, so make your stand-in next to your recipes folder instead. Inside `recipes`, run `git init --bare ../server/recipes.git`. Git creates the `server` folder and prints the full path of the new repository, for example `/Users/you/server/recipes.git/` or `C:/Users/you/server/recipes.git/`. Wherever the pages show `/srv/git/recipes.git`, type that path instead. If the path contains a space, put it in quotes.

{{SESSION:m06-first-push}}

`git init --bare` reports the new, empty repository. `git remote add` prints nothing, and `git remote -v` then lists `origin` twice: once as the address to fetch from, once as the address to push to. They are normally the same.

`git push -u origin main` reports where it pushed (`To /srv/git/recipes.git`) and what: `* [new branch] main -> main` means that your `main` created a branch called `main` on the remote, which did not exist there before. The last line confirms the upstream. From now on, `git status` compares your branch with it, and says *Your branch is up to date with 'origin/main'*. The graph shows the new label `origin/main` next to `main`, on the same commit.

::: pitfall
If `git init --bare` prints a hint about the branch name `master`, your Git is not yet set to start repositories on `main`. Run `git config --global init.defaultBranch main` as in Module 1, delete the new `server` folder, and run `git init --bare` again.
:::

## Cloning {#s3}

Now someone else joins. Sam has no copy of the recipes yet. `git clone <address>` creates one: it makes a folder named after the repository (here `recipes`, from `recipes.git`), copies every commit into it, checks out the default branch, and sets up `origin` to point back at the address. There is no need for `git init`, `git remote add` or `-u`; cloning does all of it.

In the session, Sam clones in Sam's own folder. On these pages each person has a home folder, `/home/alex` or `/home/sam`, and a session can act as either of them.

::: note title="Two people on one computer"
To follow along as Sam, open a second terminal window. Make a folder for Sam next to your own recipes, for example a folder called `sam` in your home folder (`cd ~`, `mkdir sam`, `cd sam`), and clone there, using the path of your stand-in server. Then, inside Sam's clone, give it Sam's name and email, without `--global` so that they apply to that repository only: `git config user.name "Sam Lee"` and `git config user.email "sam@example.com"`. Use the first window whenever the pages act as Alex, and the second whenever they act as Sam.
:::

{{SESSION:m06-clone}}

`git clone` says what it is doing, `Cloning into 'recipes'...`, and `done.`. Sam's folder now holds the same files, and `git log --oneline` the same commits, with the same hashes as Alex's: a commit is the same commit in every copy.

`git remote -v` shows that the clone already knows its `origin`. `git branch -a` (for *all*) lists remote-tracking branches as well as local ones. Sam has one local branch, `main`, and two entries under `remotes/origin`: the branch `origin/main`, and `origin/HEAD`, which records the remote's default branch. You can ignore `origin/HEAD`; the graphs on these pages leave it out. Sam's `main` already has `origin/main` as its upstream, so Sam can push and pull straight away.

## Fetching and pulling {#s4}

Alex adds a lemon cake recipe and pushes it. How does Sam get it? Not automatically: Git talks to a remote only when you run a command that does. Until then, Sam's repository has no idea that anything has changed.

`git fetch` asks the remote for any commits you do not have yet. It stores them in your repository and moves the remote-tracking branches, such as `origin/main`, to match the remote. It changes nothing else: not your branches, not your files. You can look at what arrived before you decide what to do with it.

`git pull` does both steps at once: it fetches, then merges the upstream branch, here `origin/main`, into your current branch. When your branch has no commits of its own, the merge is a fast-forward, exactly as in Module 4.

{{SESSION:m06-fetch-pull}}

Alex's `git push` shows a different line from the first push: `8bf3c2d..d5392e7  main -> main` means that `main` on the remote moved from `8bf3c2d` to `d5392e7`.

Then look at Sam's two `git status` commands. Before fetching, Git says *Your branch is up to date with 'origin/main'*, although Alex's commit is already on the server. Git compares your branch only with what your repository knows, and Sam's repository has not asked yet. After `git fetch`, which reports `8bf3c2d..d5392e7  main -> origin/main`, the status is *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded*.

`git log --oneline main..origin/main` lists the commits that `origin/main` has and `main` does not: the two dots mean "reachable from the right-hand side, but not from the left". The graph shows the same thing: `origin/main` is one commit ahead of `main`. Finally, `git pull` fast-forwards `main`, and `ls` shows `cake.md` in Sam's folder.

::: tip
Fetch whenever you start work, and before you push. It is always safe: it never changes your branches or your files. Then `git status` tells you whether you are ahead, behind or both.
:::

## When a push is rejected {#s5}

Sometimes two people push in turn without fetching in between. In the next session, Alex has pushed the cake recipe, but Sam has not fetched it, and commits a soup recipe on top of the old `main`. Sam's push then fails, because the remote's `main` has a commit that Sam's `main` does not contain. Accepting the push would throw Alex's commit away, so Git refuses it. The remedy is to bring in Alex's work first, merge it, and then push.

Recent versions of Git also ask you to choose, once, how `git pull` should combine your work with the remote's when both have new commits. In this series you merge, as in Module 5. The session shows the question and the answer.

To follow along, commit something as Alex and push it, then, in Sam's window, commit something else without pulling first, and push.

{{SESSION:m06-rejected}}

The rejected push says `! [rejected] main -> main (fetch first)`, and the hints explain why: the remote contains work that you do not have locally. Nothing has been lost or changed on either side.

The first `git pull` then fetches Alex's commit (`8bf3c2d..d5392e7  main -> origin/main`) but stops with *fatal: Need to specify how to reconcile divergent branches*. *Divergent* means that both branches have commits the other lacks, as in a three-way merge. The hints list three settings:

- `pull.rebase false` merges, as you have done since Module 4.
- `pull.rebase true` rebases, which Module 8 explains.
- `pull.ff only` refuses unless a fast-forward is possible.

`git config --global pull.rebase false` chooses merging for all your repositories, so Git will not ask again. The second `git pull` then merges, and `git push` succeeds. On your computer, the merge opens your editor with the message `Merge branch 'main' of` followed by the remote's address; save and close it, as in Module 4. The graph shows the result: a merge commit that joins Sam's soup recipe and Alex's cake recipe, with `main` and `origin/main` on the same commit.

If both people had changed the same lines, the merge would stop with a conflict. You would resolve it exactly as in Module 5, commit, and then push.

::: note title="Windows"
On Windows, the Git installer asks how `git pull` should behave and, by default, sets `pull.rebase false` for you. Your first `git pull` then merges straight away, without the *fatal* message; carry on from the second `git pull`.
:::

## Your repository on GitHub {#s6}

The stand-in server taught you the commands; a hosting service makes the repository reachable from anywhere. This section puts your recipes on GitHub. Its web pages change from time to time, so follow the linked GitHub Docs for the exact buttons. The Git commands stay the same.

1. **Create an account** at github.com, following [Creating an account on GitHub](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github). Choose a username you are happy to show: it appears in the address of every repository you own.
2. **Create an empty repository** called `recipes`, following [Creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository). Leave it empty: do not add a README, a licence or a `.gitignore`, because your local repository already has history to push. You can make it private if you prefer.
3. **Set up sign-in for Git.** GitHub does not accept your account password for Git commands. The easiest secure option is the [GitHub CLI](https://cli.github.com/): install it, run `gh auth login`, choose GitHub.com and HTTPS, and agree when it offers to sign Git in with your GitHub credentials. Git for Windows includes Git Credential Manager, which opens a browser window to sign you in the first time you push. [Caching your GitHub credentials in Git](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git) describes both. Experienced users often [connect with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) instead.
4. **Point `origin` at GitHub and push.** First run `git pull` in your recipes folder, so that it has Sam's work from Section 5. GitHub shows the repository's address on its page, in the form `https://github.com/<username>/recipes.git`. In your recipes folder, run:

```text
git remote set-url origin https://github.com/<username>/recipes.git
git push -u origin main
```

`git remote set-url` changes the address of an existing remote, so `origin` now means GitHub instead of your stand-in folder. `git push -u` sends your history and sets the upstream, as before. Reload the repository's page on GitHub: your files and commits are there. From now on, `git push`, `git fetch` and `git pull` talk to GitHub.

::: note title="If you want to keep the stand-in"
You can also keep `origin` as it is and add GitHub as a second remote, under another name: `git remote add github https://github.com/<username>/recipes.git`, then `git push -u github main`. A repository can have as many remotes as you like. Module 7 assumes that `origin` is GitHub.
:::

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**Which one moved?** Your repository has `main` and `origin/main`. For each command, say which of the two can move: `git fetch`, `git pull`, `git commit`, `git push`.
:::

::: solution
- `git fetch` moves only `origin/main`, to where `main` is on the remote.
- `git pull` moves `origin/main` (the fetch), then `main` (the merge).
- `git commit` moves only `main`.
- `git push` moves `main` on the remote, and therefore your `origin/main` too, which records it. Your own `main` stays where it is.
:::

::: exercise #e2 level=1 kind=coding minutes=4
**Clone into a folder of your choice.** As Sam, clone the recipes repository into a folder called `family-recipes` instead of `recipes`.
:::

::: solution
Give `git clone` the folder name after the address:

{{SESSION:m06-e2-solution}}

The folder name is only local: the remote is still called `origin`, and its address is unchanged.
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**Read the status.** What does each message mean, and what would you run next?

1. *Your branch is ahead of 'origin/main' by 2 commits.*
2. *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.*
3. *Your branch and 'origin/main' have diverged, and have 1 and 1 different commits each, respectively.*
:::

::: solution
1. You have two commits that the remote does not have, as of your last fetch. Run `git push`.
2. The remote has one commit that you do not have, and you have none of your own. Run `git pull`, which fast-forwards.
3. Both sides have a commit the other lacks. Run `git pull`, which merges (resolve any conflict as in Module 5), then `git push`.

All three compare with `origin/main` as your repository last saw it, so run `git fetch` first for an up-to-date answer.
:::

::: exercise #e4 level=1 kind=coding minutes=5
**Share a new branch.** As Alex, create a branch called `soups`, commit a soup recipe on it, and push the branch so that Sam could fetch it. Check that it has an upstream. To follow along, use a new branch name, such as `salads`: your repository already has a `soups` branch from Module 4.
:::

::: solution
Push the branch with `-u`, as you did for `main`:

{{SESSION:m06-e4-solution}}

`git branch -vv` (two `v`s) shows each branch's upstream in square brackets: `soups` now tracks `origin/soups`.
:::

::: exercise #e5 level=1 kind=conceptual minutes=3
**Fetch or pull?** You are in the middle of a change on `main` and want to know whether a colleague has pushed anything, without changing your files yet. Which command do you run, and why?
:::

::: solution
`git fetch`. It brings in the colleague's commits and updates `origin/main`, but leaves your branch and your files alone. `git status` and `git log --oneline main..origin/main` then show what arrived. Pull when you are ready to merge it.
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**A refused password.** Your first push to GitHub asks for a username and password. You type your GitHub password, and the push fails with a message saying that support for password authentication was removed. What is going on, and what should you do?
:::

::: solution
GitHub stopped accepting account passwords for Git operations in 2021. Set up a secure sign-in instead: run `gh auth login` with the GitHub CLI, or let Git Credential Manager sign you in through the browser, as in Section 6. Then push again. Alternatives are a personal access token, typed where the password was asked, or SSH.
:::

## Self-check quiz {#quiz}

```quiz
? What is `origin`?
- [ ] A special branch that every repository has
- [x] The usual name of the remote a repository was cloned from
- [ ] The first commit in a repository
- [ ] GitHub's name for your account
> `git clone` names the remote `origin`, and most people use the same name with `git remote add`.

? What does `git fetch` change in your repository?
- [ ] Your files in the working tree
- [ ] Your current branch
- [x] Only the remote-tracking branches, such as `origin/main`
- [ ] Nothing at all: it only prints what is new
> Fetching stores the new commits and moves `origin/main`; your branches and files stay as they are.

? With `pull.rebase` set to `false`, what does `git pull` do?
- [x] `git fetch`, then a merge of the upstream branch
- [ ] `git push`, then `git fetch`
- [ ] It copies the whole repository again
- [ ] It deletes your local commits and takes the remote's
> A pull is a fetch followed by a merge (or, with other settings, a rebase).

? A push fails with `! [rejected] main -> main (fetch first)`. What does it mean?
- [ ] Your network connection failed.
- [ ] You are not allowed to push to the repository.
- [x] The remote has commits that your branch does not contain.
- [ ] Your commits contain a conflict.
> Pull first, so that your branch contains the remote's commits, then push again.

? What does `-u` add to `git push -u origin main`?
- [ ] It pushes all branches at once.
- [x] It records `origin/main` as the upstream of your `main`.
- [ ] It undoes the previous push.
- [ ] It pushes without asking for a password.
> With an upstream set, a plain `git push` or `git pull` knows where to go, and `git status` compares with it.

? `git status` says *Your branch is up to date with 'origin/main'*. What do you know for certain?
- [ ] Nobody has pushed anything since you last pulled.
- [x] Your branch matches `origin/main` as your repository last saw it.
- [ ] Your work has been backed up on the server.
- [ ] Your working tree has no changes.
> Git compares with its last record of the remote; run `git fetch` to bring that record up to date.

? Which is a good way to let Git sign in to GitHub?
- [ ] Type your GitHub account password when Git asks for one
- [ ] Put your password in the repository's address
- [x] Run `gh auth login`, or use Git Credential Manager
- [ ] Make the repository public, so that no sign-in is needed
> GitHub does not accept account passwords for Git; the GitHub CLI and Git Credential Manager set up a secure sign-in.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, section [2.5: Working with Remotes](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes).
- The reference pages for [git remote](https://git-scm.com/docs/git-remote), [git fetch](https://git-scm.com/docs/git-fetch), [git pull](https://git-scm.com/docs/git-pull) and [git push](https://git-scm.com/docs/git-push).
- GitHub Docs, [Adding locally hosted code to GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) and [About remote repositories](https://docs.github.com/en/get-started/git-basics/about-remote-repositories).
