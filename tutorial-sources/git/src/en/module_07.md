## How teams share work {#s1}

In Module 6, two people pushed straight to `main`, and one push was rejected because the other had got there first. That works for two careful people, but not for a team. Most teams follow a few simple rules instead:

- `main` always works. Nobody commits to it directly.
- Every change, however small, is made on its own branch, called a **feature branch**.
- When a change is ready, its author proposes it with a **pull request**: a page on GitHub that shows the branch's commits and changes, and invites others to review them.
- After review, the pull request is merged into `main`, and the branch is deleted.

This is the **feature-branch workflow**. Its strength is that every change is looked at before it reaches `main`, and that several people can work at once without stepping on each other.

::: figure #fig-07-01
The life of a pull request: a branch is created, committed to and pushed; a pull request proposes it; review may add commits; the branch is merged into `main` on GitHub, and everyone tidies up.
:::

There are two ways to share a project on GitHub. In a **shared repository**, the team members have permission to push branches to the same repository, and pull requests go from one branch of it to another. Companies and small teams usually work this way. In open-source projects, most contributors cannot push to the project at all. Each makes a **fork**, a personal copy of the repository on GitHub, pushes to it, and opens pull requests from the fork to the original. Section 7 covers forks; until then, everyone shares one repository.

GitHub also has **issues**: a list of bugs, ideas and tasks for each repository. A pull request often says which issue it resolves, and GitHub can close the issue automatically when the pull request is merged.

## A branch for each change {#s2}

Alex wants to add a soup recipe. Instead of committing on `main`, Alex starts a branch, commits on it, and pushes the branch to the shared repository with `git push -u`, exactly as in Module 6's Exercise 4.

The sessions in this module use the stand-in server from Module 6, with Alex and Sam each in their own clone. To follow along, use your GitHub repository from Module 6: your own recipes folder plays Alex. For Sam, clone the same GitHub repository into Sam's folder, or point Sam's existing clone at it with `git remote set-url origin` and the GitHub address. On GitHub, both people are you, which works for everything in this module: you can open, review and merge your own pull requests.

{{SESSION:m07-feature-branch}}

The push creates the branch `add-soups` on the server, and `-u` makes `origin/add-soups` its upstream. `git branch -vv` shows both local branches with their upstreams: `add-soups` with the new commit, `main` unchanged at `8bf3c2d`.

Name the branch after the change, short and specific, as Module 4 advised: `add-soups`, `fix-oven-temperature`. The name appears on the pull request, so others read it too.

## Opening a pull request {#s3}

A pull request is a GitHub feature, not a Git command, so this section has no session. Follow the steps on your own repository; GitHub Docs' [Creating a pull request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request) shows the current pages.

1. Open your repository on GitHub. Shortly after a push, GitHub offers a **Compare & pull request** button for the branch. Otherwise, go to the **Pull requests** tab and choose **New pull request**.
2. Choose the **base** branch, the one the change should go into (`main`), and the **compare** branch, the one with the change (`add-soups`). GitHub shows the commits and the changes that the pull request would bring.
3. Write a **title** that says what the change does, such as "Add a tomato soup recipe", and a **description** that says why, and anything a reviewer should know.
4. If the change resolves an issue, write `Closes #` followed by the issue number in the description, for example `Closes #4`. When the pull request is merged into the default branch, GitHub closes the issue. [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue) lists the other keywords.
5. Choose **Create pull request**.

The pull request's page has three tabs: **Conversation**, for the description and comments; **Commits**, listing the branch's commits; and **Files changed**, showing the diff in the same `+` and `-` form as `git diff`. The pull request follows the branch: when you push more commits to `add-soups`, they appear in it automatically.

::: tip
Keep pull requests small. A pull request that does one thing is reviewed quickly and carefully; one that changes thirty files waits for days and gets a quick "looks good". If a change is large, split it into several branches that build on each other.
:::

## Reviewing a pull request {#s4}

Sam is asked to review. Most reviews happen on GitHub: in the **Files changed** tab, you can comment on any line, and then submit the review with **Comment**, **Approve** or **Request changes**. GitHub Docs' [Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request) shows the steps.

Sometimes a reviewer wants the branch on their own computer: to try the change, or to read it in their own editor. In the session, Sam fetches, switches to `add-soups`, and lists what the branch adds.

{{SESSION:m07-review}}

`git fetch` reports the new branch: `* [new branch] add-soups -> origin/add-soups`. Sam has no local `add-soups` yet, but `git switch add-soups` notices that `origin/add-soups` exists, creates a local branch from it, and sets it up to track it, all in one step.

Two commands then show what the branch adds:

- `git log --oneline main..add-soups` lists the commits on `add-soups` that are not on `main`, here the one soup commit. Two dots, as in Module 6, mean "reachable from the right-hand side, but not from the left".
- `git diff main...add-soups`, with three dots, shows the changes made on `add-soups` since it split from `main`, ignoring anything that has happened on `main` since. That is exactly what GitHub shows under **Files changed**.

Suppose that Sam's review asks for the ingredients. Alex answers by changing the file on the same branch, committing and pushing again. Nothing else is needed: the pull request picks up the new commit. Sam then pulls to get it.

{{SESSION:m07-address-review}}

Alex's push moves `add-soups` on the server from `22abb2e` to `b9835b7`, and Sam's `git pull` fast-forwards Sam's copy of the branch. `git log --oneline main..add-soups` now lists both commits of the pull request.

::: note title="Fix or rewrite?"
Answer a review by adding commits, not by amending the ones already pushed: other people may have fetched them, and new commits let reviewers see exactly what changed since their last look. If you want a tidier history before merging, Module 8 shows how to squash commits, and GitHub can squash a pull request when it merges it.
:::

## Merging and tidying up {#s5}

Once the pull request is approved, someone with permission merges it with the **Merge pull request** button. By default GitHub makes a merge commit on `main`, exactly like `git merge --no-ff`: a commit with two parents, even if a fast-forward would have been possible, so that the history shows the whole branch as one unit. Its message reads "Merge pull request #1 from" followed by the branch. GitHub then offers a **Delete branch** button, which deletes the branch on GitHub; your local branch stays. [Merging a pull request](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request) describes the button and its other options, *Squash and merge* and *Rebase and merge*.

In the session, Sam has merged the branch on the server and deleted it there, as the buttons would. Alex now brings `main` up to date and tidies up.

{{SESSION:m07-after-merge}}

- `git switch main` says that Alex's `main` is up to date with `origin/main`, but that refers to Alex's last fetch. `git pull` then fetches the merge and fast-forwards `main` to it.
- `git branch -d add-soups` deletes Alex's local branch. It succeeds without complaint, because `main` now contains its commits.
- `git fetch --prune` removes remote-tracking branches whose branch no longer exists on the server: `- [deleted] (none) -> origin/add-soups`. Without `--prune`, `origin/add-soups` would stay in Alex's repository indefinitely.
- `git branch -a` confirms the result: only `main` and `origin/main` remain.

The graph shows the merge commit joining the soup commit into `main`. In the session it says `Merge branch 'add-soups'`, because Sam merged with `git merge --no-ff`; on GitHub the message names the pull request instead.

::: tip
Run `git config --global fetch.prune true` once, and every `git fetch` and `git pull` will prune automatically.
:::

## Keeping a branch up to date {#s6}

While you work on a branch, `main` moves on: other pull requests are merged. Before you ask for a review, and again if GitHub says that the branch is out of date or has conflicts, bring the latest `main` into your branch. Fetch, then merge `origin/main` into your branch, and push.

In the session, Alex is working on `add-breads`, which is already pushed, and Sam's README change has meanwhile reached `main`. To follow along, push a branch with a commit, then, on GitHub or as Sam, add a commit to `main`.

{{SESSION:m07-update-branch}}

Look at `git status` after the fetch: *Your branch is up to date with 'origin/add-breads'*. That is true, but beside the point: a branch's status compares it with its own upstream, not with `main`. The first graph shows the real situation: `origin/main` has a commit that `add-breads` lacks.

`git merge origin/main` merges it in, with a merge commit whose message is `Merge remote-tracking branch 'origin/main' into add-breads`, and `git push` updates the pull request. The second graph shows `add-breads` with both lines of history. Merging `origin/main` rather than your local `main` saves you from updating `main` first.

If the merge stops with a conflict, resolve it as in Module 5, commit and push. GitHub's **Update branch** button, where it appears, does the same merge on GitHub. Module 8 shows rebasing, an alternative that some teams prefer.

## Contributing through a fork {#s7}

To contribute to a project you cannot push to, such as most open-source projects, you work through a fork:

1. On the project's GitHub page, choose **Fork**. GitHub creates your own copy of the repository, under your account.
2. Clone your fork. In your clone, `origin` is your fork, which you can push to.
3. Add the original project as a second remote, by convention called **upstream**, so that you can fetch its new commits.
4. Work on a branch as usual, push it to `origin`, and open a pull request from your fork's branch to the original project's `main`. GitHub offers this when you open a pull request on either repository.
5. To keep your fork's `main` up to date, fetch `upstream`, merge `upstream/main` into your `main`, and push it to `origin`. GitHub's **Sync fork** button does the same on GitHub.

::: figure #fig-07-02
Working through a fork. You cannot push to the original project, `upstream`. You push to your fork, `origin`, and open pull requests from it; you fetch new work from `upstream`.
:::

In the session, the server holds the original repository and Sam's fork of it, `sam-recipes.git`, which Sam can push to. Sam clones the fork and adds `upstream`. Then Alex, who maintains the original, adds a cake recipe, and Sam brings it into the fork.

{{SESSION:m07-fork}}

`git remote -v` now lists two remotes: `origin`, Sam's fork, and `upstream`, the original. `git fetch upstream` brings in the original's `main` as `upstream/main`, `git merge upstream/main` fast-forwards Sam's `main` to it, and `git push` updates the fork, because Sam's `main` still pushes to `origin`.

To practise on GitHub, fork the practice repository [octocat/Spoon-Knife](https://github.com/octocat/Spoon-Knife), as GitHub Docs' [Fork a repository](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo) suggests, then clone your fork and add `https://github.com/octocat/Spoon-Knife.git` as `upstream`.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**Put the steps in order.** Arrange these steps of the feature-branch workflow: merge the pull request; `git push -u origin fix-typo`; `git switch -c fix-typo`; open a pull request; `git switch main` and `git pull`; commit the fix; answer the review with another commit; `git branch -d fix-typo`.
:::

::: solution
`git switch -c fix-typo`; commit the fix; `git push -u origin fix-typo`; open a pull request; answer the review with another commit (and push it); merge the pull request; `git switch main` and `git pull`; `git branch -d fix-typo`.
:::

::: exercise #e2 level=2 kind=conceptual minutes=5
**Two dots or three?** `main` has gained two commits since `add-soups` split from it, and `add-soups` has one commit of its own. What does `git log --oneline main..add-soups` list? What does `git diff main...add-soups` show, and why would `git diff main add-soups`, without dots, mislead a reviewer?
:::

::: solution
`main..add-soups` lists the one commit on `add-soups` that `main` does not have. `main...add-soups` shows only the changes made on `add-soups` since the split, which is what the pull request would add. `git diff main add-soups` compares the two newest commits directly, so `main`'s two new commits would appear as if `add-soups` removed them, although the branch never touched them.
:::

::: exercise #e3 level=2 kind=coding minutes=6
**Add to a colleague's branch.** Alex's pull request for `add-soups` is missing a note on how many the soup serves. As Sam, add that to the branch, so that the pull request includes it, and let Alex get the change. To follow along, push a branch from Alex's window first.
:::

::: solution
Fetch the branch, switch to it, commit and push; Alex then pulls:

{{SESSION:m07-e3-solution}}

Anyone with push access can add commits to a pull request's branch. Agree on it first, so that two people do not edit the same lines at once.
:::

::: exercise #e4 level=1 kind=conceptual minutes=4
**Write the pull request.** Your branch adds a soup recipe, which issue #4 asked for. Write a title and a description, so that merging the pull request closes the issue.
:::

::: solution
For example, title: *Add a tomato soup recipe*. Description: *Adds `soup.md` with the ingredients and method we used last week. Closes #4.* Any wording works, as long as the description contains `Closes #4` (or `Fixes #4`, or `Resolves #4`).
:::

::: exercise #e5 level=2 kind=coding minutes=6
**A branch that will not delete.** Your pull request was merged with *Squash and merge*: GitHub added one new commit to `main` containing all the branch's changes, and deleted the branch. After `git pull`, `git branch -d add-soups` refuses, saying that the branch is not fully merged. Check that nothing would be lost, and delete the branch. To follow along, merge a pull request on GitHub with *Squash and merge*.
:::

::: solution
Squashing copies the branch's changes into a new commit, so `main` never contains the branch's own commits, and `-d` cannot tell that the work is in `main`. Compare the contents instead:

{{SESSION:m07-e5-solution}}

`git diff main add-soups` prints nothing: the files are identical, so `git branch -D` loses nothing. Prune first: while `origin/add-soups` still exists in your repository, `-d` checks against it and deletes the branch with only a warning.
:::

::: exercise #e6 level=1 kind=conceptual minutes=5
**Fork or branch?** For each situation, would you push a branch to the repository, or work through a fork?

1. You are a member of the team that owns the repository.
2. You found a typo in the documentation of a popular open-source library.
3. You want to experiment with a project's code without anyone seeing it, and you may never contribute it.
:::

::: solution
1. A branch: you can push to the repository, and pull requests between its branches keep things simple.
2. A fork: you cannot push to the library's repository, so you push to your fork and open a pull request from it.
3. A fork, or simply a clone: a clone needs no account, and a fork gives you a copy on GitHub to push to. Keep in mind that a fork of a public repository is public.
:::

## Self-check quiz {#quiz}

```quiz
? What is a pull request?
- [ ] A Git command that pulls a branch from a server
- [x] A proposal on GitHub to merge one branch into another, with room for review
- [ ] A request for permission to push to a repository
- [ ] An automatic copy of a repository
> A pull request is a GitHub page that shows a branch's changes and lets others discuss and review them before merging.

? A reviewer asks for a change. How do you update your pull request?
- [ ] Close it and open a new one
- [x] Commit the change to the same branch and push it
- [ ] Edit the files on the pull request's page
- [ ] Send the reviewer a new branch name
> The pull request follows its branch; new commits on the branch appear in it automatically.

? What does `git diff main...add-soups` show?
- [ ] Every difference between the two newest commits
- [x] The changes made on `add-soups` since it split from `main`
- [ ] The commits on `main` that `add-soups` lacks
- [ ] Nothing, unless the branches have been merged
> Three dots compare with the point where the branches split, which is what GitHub's Files changed tab shows.

? A branch was merged and deleted on GitHub. Which command removes `origin/add-soups` from your repository?
- [ ] `git branch -d add-soups`
- [ ] `git pull`
- [x] `git fetch --prune`
- [ ] `git push origin --delete add-soups`
> `--prune` removes remote-tracking branches whose branch no longer exists on the remote.

? `git status` on your feature branch says *Your branch is up to date with 'origin/add-breads'*. Does that mean your branch has everything on `main`?
- [ ] Yes, Git always compares with `main`.
- [x] No: it compares with the branch's own upstream, `origin/add-breads`.
- [ ] Yes, if you have run `git fetch`.
- [ ] No: it means that the branch has been deleted.
> To bring in `main`'s new commits, fetch and merge `origin/main` into your branch.

? In a fork setup, what is `upstream` usually?
- [x] The original project's repository
- [ ] Your fork on GitHub
- [ ] The branch your pull request goes into
- [ ] Your local clone
> `origin` is your fork, which you push to; `upstream` is the original, which you fetch from.

? Your pull request's description says `Closes #12`. What happens when it is merged into the default branch?
- [ ] Pull request #12 is closed.
- [ ] Twelve commits are squashed.
- [x] Issue #12 is closed automatically.
- [ ] Nothing: it is only a comment.
> GitHub links the pull request to the issue and closes the issue on merging.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [5.1: Distributed Workflows](https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows) and [6.2: Contributing to a Project](https://git-scm.com/book/en/v2/GitHub-Contributing-to-a-Project).
- GitHub Docs, [About pull requests](https://docs.github.com/en/pull-requests/reference/pull-requests), [About forks](https://docs.github.com/en/pull-requests/reference/forks) and [About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues).
- The reference pages for [git fetch](https://git-scm.com/docs/git-fetch) (`--prune`) and [git diff](https://git-scm.com/docs/git-diff) (the `A...B` form).
