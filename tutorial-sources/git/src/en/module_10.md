## The project {#s1}

This module puts the whole series to work on one small project, from the first commit to a published release. Alex and Sam build a **family cookbook**: a README, an index of recipes, and one file per recipe. The commands are the ones you already know. What is new is doing all of it together, in order, the way a team works.

The project has five milestones:

1. **A shared repository.** Alex starts the project and shares it; Sam clones it.
2. **Two features at once.** Alex adds a soup recipe and Sam a bread recipe, each on a branch, each proposed in a pull request.
3. **A conflict.** Alex's pull request is merged first, and Sam's now conflicts with it. Sam brings `main` into the branch and resolves the conflict.
4. **Review and merge.** Alex reviews Sam's pull request and merges it, and everyone tidies up.
5. **A release.** Alex tags the result as version 1.0 and publishes it.

The team follows the rules from Module 7: nobody commits to `main` directly, every change goes through a branch and a pull request, and someone other than the author reviews and merges it.

Do the project on GitHub. There are two ways:

- **With a friend.** Each of you has a GitHub account and a computer. One plays Alex and owns the repository; the other plays Sam.
- **On your own.** You play both people, with two folders and two terminal windows, as in Module 6. On GitHub, both people are you. GitHub does not let anyone approve their own pull request, so where the project says *approve*, leave a review comment instead, then merge.

The sessions show every step with the stand-in server from Module 6. Where a step happens on GitHub instead, such as creating the repository, opening a pull request or merging one, the text says how.

## Milestone 1: a shared repository {#s2}

Alex creates the project: a new folder, `git init`, three files and a first commit. Then Alex puts it on the server and pushes `main`, and Sam clones it.

On GitHub:
- Alex creates an empty repository called `cookbook`, as in Module 6, and pushes to its address instead of `/srv/git/cookbook.git`.
- With a friend, Alex then invites Sam to the repository, following [Inviting collaborators to a personal repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository). Once Sam accepts, Sam can push branches to it.
- On your own, you need no invitation. Clone the repository into Sam's folder, and set Sam's name and email in that clone as in Module 6.

{{SESSION:m10-start}}

Everything here comes from earlier modules. `git add` names the three files at once. The first commit is a root commit, and `git push -u` creates `main` on the server and makes it the upstream. Sam's clone then has the same single commit, `db5abad`.

::: tip
Teams often ask GitHub to enforce the rules. A **ruleset** or **branch protection** on `main` can require a pull request, and an approving review, before anything is merged. [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) explains the options. It is optional for this project.
:::

## Milestone 2: two features at once {#s3}

Alex and Sam now work at the same time, each on their own branch. Each adds a recipe file and a line for it in `index.md`, under the pancakes. Then each pushes the branch and opens a pull request on GitHub, as in Module 7: Alex's becomes pull request #1, Sam's #2. Write a title and a short description for each.

{{SESSION:m10-parallel}}

Each person's commit touches two files: the new recipe and `index.md`. The graph shows Sam's repository. Sam's branch, `add-bread`, is one commit ahead of `main`. Sam's repository has not fetched Alex's branch, so it does not appear.

Both changes add a line to `index.md` in the same place, straight after the pancakes. Neither person knows yet, but that makes a conflict certain, as Module 5 explained.

## Milestone 3: a conflict {#s4}

Sam reviews pull request #1, approves it and merges it with **Merge pull request**, then deletes the branch with **Delete branch**. Now `main` has the soup, and Sam's pull request #2 no longer merges cleanly. GitHub shows it on the pull request's page: *This branch has conflicts that must be resolved*.

The fix belongs on the branch, so it is Sam's job, as the branch's author: bring the new `main` into `add-bread`, resolve the conflict, and push. That is Module 7's "keeping a branch up to date", with Module 5's conflict resolution in the middle.

To follow along on your own, merge pull request #1 on GitHub first. Then work in Sam's folder, on `add-bread`.

{{SESSION:m10-conflict}}

`git fetch` brings in the merged `main`. `git merge origin/main` stops with a conflict in `index.md`. The markers show Sam's line, `HEAD`, which is the branch Sam is on, against the soup line from `origin/main`. Both lines belong in the index. Sam keeps both, in alphabetical order, and removes the markers. Then `git add`, `git commit` (accepting the ready-made message `Merge remote-tracking branch 'origin/main' into add-bread`) and `git push`.

The graph shows the result: `add-bread` now contains both the bread commit and everything on `main`, including Alex's merged pull request. On GitHub, the pull request updates by itself, and the conflict warning disappears.

## Milestone 4: review and merge {#s5}

Alex reviews pull request #2 in the **Files changed** tab, which now shows only Sam's changes: the new bread file and the resolved index. Alex approves it and merges it. Then both people bring their `main` up to date and delete the merged branches, as in Module 7.

{{SESSION:m10-merge}}

Sam switches to `main`, pulls the merge of pull request #2, deletes the local branch and prunes `origin/add-bread`. `cat index.md` shows the index with all three recipes.

The graph is the most tangled in this series, so read it from the bottom:
- the first commit, `db5abad`;
- the two feature commits, `0070943` (bread) and `7c82c56` (soup);
- the merge of pull request #1;
- Sam's merge of `main` into `add-bread`;
- at the top, the merge of pull request #2.

Every line of work is there, and every merge says where it came from. Such a history is normal for a team that merges; Module 8 showed how rebasing can keep it straighter.

## Milestone 5: a release {#s6}

The cookbook is ready for its first version. A **tag** gives a commit a permanent name, such as `v1.0`, that does not move as new work arrives, unlike a branch.

Git has two kinds of tag:
- a **lightweight tag**, made with `git tag <name>`, is just a name for a commit, like a branch that never moves;
- an **annotated tag**, made with `git tag -a <name> -m "<message>"`, is an object of its own (Module 9). It records who made it, when, and why.

Use annotated tags for releases.

Tags are not pushed by `git push`; push each one by name, as in `git push origin v1.0`. Many projects number their releases with [Semantic Versioning](https://semver.org/): `v1.0.1` for a fix, `v1.1.0` for a new feature that changes nothing existing, and `v2.0.0` for a change that breaks something people rely on.

{{SESSION:m10-release}}

- `git log --oneline --graph` shows the history being released. `git tag -a v1.0 -m "Family cookbook 1.0"` tags the newest commit, the merge of pull request #2.
- `git push origin v1.0` sends the tag: `* [new tag] v1.0 -> v1.0`. `git tag` lists the tags.
- `git show v1.0 --no-patch` shows the tag object (tagger, date and message), followed by the commit it names.
- The graph shows the tag as a yellow label on that commit.
- When Sam fetches, Git brings the new tag along: `* [new tag] v1.0 -> v1.0`.

To publish the release on GitHub, open the repository's **Releases** page, choose **Draft a new release**, select the tag `v1.0`, and write a title and a short list of what is in it. [Managing releases in a repository](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) shows the steps. A release is a page for people who use the project, built on the tag that Git records.

::: keyidea
That is the whole cycle: branch, commit, push, pull request, review, merge, update, tag. Everything in this series serves one of those steps, and every Git project you join, however large, works this way.
:::

## Exercises {#exercises}

These extension tasks continue the project. Do them in your cookbook, on GitHub.

::: exercise #e1 level=2 kind=coding minutes=10
**A fix release.** The pancake recipe has no salt. As Alex, fix it through a pull request, and release the fix as `v1.0.1`.
:::

::: solution
Branch, commit, push and open a pull request. Once it is merged, update `main`, then tag and push the tag:

{{SESSION:m10-e1-solution}}

In the session, Sam merges pull request #3, as the merge on GitHub would. A fix that changes nothing else gets the next patch number, `v1.0.1`.
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**Avoid the conflict.** The conflict in Milestone 3 was predictable: every new recipe adds a line in the same place in `index.md`. Suggest two ways the team could avoid such conflicts in future.
:::

::: solution
Any two of these:
- Agree that one person updates the index after each merge, so recipe branches never touch it.
- Keep the index in alphabetical order, so that different recipes usually go on different lines (though neighbouring lines can still conflict).
- Merge `main` into a branch just before opening its pull request, so that whoever is second sees the other change while it is small.
- Generate the index from the recipe files with a script, instead of editing it by hand.
:::

::: exercise #e3 level=2 kind=coding minutes=8
**Who added this?** A new member asks who added the soda bread to the index, and in which commit. Find out with `git log`.
:::

::: solution
`git log -S` lists the commits that added or removed a piece of text:

{{SESSION:m10-e3-solution}}

`-S "Soda bread"` finds `0070943`, the commit that added the text. `--format` then prints its author and message. `git blame index.md` gives a similar answer line by line: it shows, for every line, the last commit that changed it.
:::

::: exercise #e4 level=2 kind=coding minutes=8
**A tag pushed by mistake.** Alex tagged and pushed `v2.0` by mistake. Remove the tag, locally and on the server.
:::

::: solution
Delete the tag locally with `git tag -d`, and on the server with `git push origin --delete`:

{{SESSION:m10-e4-solution}}

Anyone who has already fetched `v2.0` keeps their copy, because fetching never deletes tags. Tags are meant to be permanent, so when a released version turns out to be wrong, release a new one, such as `v1.0.2`, rather than moving or deleting a tag that others may have.
:::

::: exercise #e5 level=1 kind=conceptual minutes=6
**Which kind of tag?** Why does the project use annotated tags for releases rather than lightweight ones? When might a lightweight tag be enough?
:::

::: solution
An annotated tag records who made the release, when, and a message, and GitHub shows that information on the release. It can also be signed. A lightweight tag is only a name for a commit: enough for a private bookmark, such as `before-big-change`, that you do not intend to share.
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**Protect `main`.** In Milestone 3, nothing stopped Sam from merging pull request #1 without reading it, or from pushing straight to `main`. What could the team set up on GitHub, and what would each person then have to do differently?
:::

::: solution
A ruleset or branch protection on `main` that requires a pull request with at least one approving review. Pushes straight to `main` are then rejected, and the **Merge pull request** button stays disabled until someone other than the author approves. Everyone keeps working exactly as in this project: branch, push, pull request, review.
:::

## Self-check quiz {#quiz}

```quiz
? GitHub says that your pull request *has conflicts that must be resolved*. What do you do?
- [ ] Close the pull request and start again from `main`
- [x] Merge the latest `main` into your branch, resolve the conflict, commit and push
- [ ] Ask the reviewer to merge it anyway
- [ ] Delete `main` and push your branch as `main`
> The pull request updates by itself once the branch contains `main` and the conflict is resolved.

? Who usually resolves a conflict in a pull request?
- [x] The branch's author, on the branch
- [ ] The reviewer, on `main`
- [ ] GitHub, automatically
- [ ] Whoever pushed to `main` last
> The resolution is a change to the branch, so it goes through review with the rest of it.

? What is the difference between a tag and a branch?
- [ ] A tag can point to several commits.
- [ ] A branch cannot be pushed.
- [x] A tag stays on its commit, while a branch moves forward with new commits.
- [ ] There is none.
> A tag names a commit permanently, which is what a release needs.

? You have tagged `v1.0` and run `git push`. Why is the tag not on GitHub?
- [ ] Tags are created on GitHub, not locally.
- [x] `git push` does not send tags; push it with `git push origin v1.0`.
- [ ] Only annotated tags can be pushed.
- [ ] You must fetch before tags are pushed.
> Tags are pushed one by one, or all at once with `--tags`.

? With Semantic Versioning, a release that only fixes a bug in `v1.4.2` is numbered:
- [ ] `v2.0.0`
- [ ] `v1.5.0`
- [x] `v1.4.3`
- [ ] `v1.4.2-fix`
> Fixes raise the last number, new features the middle one, and breaking changes the first.

? What does an annotated tag record that a lightweight tag does not?
- [ ] The files of the release
- [x] Who made it, when, and a message
- [ ] The branches that contain the commit
- [ ] The pull requests that were merged
> An annotated tag is an object of its own; a lightweight tag is only a name for a commit.

? Which order matches the cycle this project followed?
- [ ] Commit to `main`, push, tag, review
- [x] Branch, commit, push, pull request, review, merge, tag
- [ ] Fork, rebase, force-push, tag
- [ ] Tag, branch, merge, push
> Every change went through a branch and a reviewed pull request; the release tag came last.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, section [2.6: Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging), and the reference page for [git tag](https://git-scm.com/docs/git-tag).
- GitHub Docs, [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) and [About merge conflicts](https://docs.github.com/en/pull-requests/reference/merge-conflicts).
- Where to go next, when you need them:
  - [submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules), for a repository inside another;
  - [Git LFS](https://git-lfs.com/), for large files such as videos;
  - [hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks), for scripts that run on commit or push;
  - [git bisect](https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git), for finding the commit that introduced a bug;
  - [git worktree](https://git-scm.com/docs/git-worktree), for several branches checked out at once;
  - [signing your work](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work), with GitHub's [commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification).
