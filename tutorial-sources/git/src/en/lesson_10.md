---
title: Pull requests
lead: Propose a change on a branch, review it on GitHub, merge it there, and tidy up. Then see how the same steps let you work with other people.
minutes: 40
needs: Lesson 9 (`my-page` on GitHub, and the pull and push routine)
goals:
  - Understand what a pull request is for
  - Push a branch to GitHub and open a pull request
  - Review the changes and merge the pull request on GitHub
  - Bring the merge back to your computer and delete the branch
  - Invite a collaborator, and know how to contribute to someone else's project
---

## What is a pull request? {#what}

So far you have merged branches on your computer, by yourself. When people work together, they
want to see a change *before* it goes into `main`: to check it, comment on it, and agree. GitHub's
tool for this is the **pull request**: a page that says "please merge my branch into `main`",
shows exactly what would change, and has a place to discuss it. When everyone is happy, a click
merges it.

Pull requests are how almost every team on GitHub works, and how you suggest changes to someone
else's project. Using them for your own project is good practice too, so you will do that now.

::: figure id=fig-10-1
The pull request flow. Make a branch and commit to it, push the branch to GitHub, open a pull
request, review it, merge it on GitHub, then pull `main` and delete the branch on your computer.
:::

## Make a branch with a change {#branch}

Start with the daily routine from Lesson 9: get the latest work first.

```terminal
$ git pull
Already up to date.
```

Now a branch for a new section of your page:

```terminal
$ git switch -c add-contact
Switched to a new branch 'add-contact'
```

Add the two highlighted lines at the end of the page, before `</body>`:

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
  <h2>Contact</h2>
  <p>You can find me on GitHub as your-username.</p>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Add a contact section"
[add-contact 8da60b7] Add a contact section
 1 file changed, 2 insertions(+)
```

## Push the branch {#push}

Send the branch to GitHub. As with `main` in Lesson 7, use `-u` the first time:

```terminal
$ git push -u origin add-contact
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 450 bytes | 450.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
remote:
remote: Create a pull request for 'add-contact' on GitHub by visiting:
remote:      https://github.com/your-username/my-page/pull/new/add-contact
remote:
To https://github.com/your-username/my-page.git
 * [new branch]      add-contact -> add-contact
branch 'add-contact' set up to track 'origin/add-contact'.
```

The lines starting with `remote:` come from GitHub itself. It noticed a new branch and suggests a
pull request, with a link. You can open the link, or go to the repository page as below.

## Open the pull request {#open}

::: where github
1. Go to your repository's page. A yellow banner says that `add-contact` had recent pushes. Click
   **Compare & pull request**.
2. The page shows *base* `main` and *compare* `add-contact`: "merge `add-contact` into `main`".
   Below it are the commit and the changes.
3. The title is filled in from your commit message, "Add a contact section". In the description
   box, write a sentence about the change, for example: "Adds a short contact section at the end of
   the page."
4. Click **Create pull request**.
:::

Your pull request has a number, **#1**, and its own page with three tabs:

- **Conversation**: the description, comments, and the merge button at the bottom.
- **Commits**: the commits on the branch.
- **Files changed**: the diff, with added lines in green, as in `git diff`.

## Review it {#review}

::: where github
Click **Files changed** and read the change. This is what a reviewer does. To comment on a line,
hover over it and click the blue **+** that appears, write your comment, and add it. On your own
project there is nobody to review it, so a careful read is enough.
:::

The point of a review is to catch mistakes before they reach `main`, and on your project
`main` is your live web page. A second look is cheap; fixing a broken page is not.

::: tip
If the review finds a problem, you do not need a new pull request. Fix it on your computer, on
the same branch, commit, and `git push`. The pull request updates itself with the new commit.
:::

## Merge it on GitHub {#merge}

::: where github
1. Go back to the **Conversation** tab and scroll to the bottom.
2. Click **Merge pull request**, then **Confirm merge**. The pull request is now "Merged".
3. Click **Delete branch**. The branch has done its job; the commits stay in `main`.
:::

<!-- replay:
gh-merge-pr your-username/my-page 1 add-contact "Add a contact section"
gh-delete-branch your-username/my-page add-contact
-->

GitHub merged `add-contact` into `main` with a merge commit, exactly like `git merge` did on your
computer in Lesson 5. Because `main` changed, GitHub Pages republishes your site: in a minute or
two the contact section is online.

## Bring the merge home and tidy up {#tidy}

The merge happened on GitHub, so your computer does not have it yet. Switch to `main` and pull:

```terminal
$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
$ git pull
remote: Enumerating objects: 1, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 1 (delta 0), reused 1 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (1/1), 263 bytes | 263.00 KiB/s, done.
From https://github.com/your-username/my-page
   6c2cb6d..dca2d0a  main       -> origin/main
Updating 6c2cb6d..dca2d0a
Fast-forward
 index.html | 2 ++
 1 file changed, 2 insertions(+)
```

("Up to date with 'origin/main'" was the old note again, as in Lesson 9.) Now delete the branch on
your computer too:

```terminal
$ git branch -d add-contact
Deleted branch add-contact (was 8da60b7).
```

Your computer still has a note of the branch on GitHub, `origin/add-contact`. `git fetch --prune`
asks GitHub for news and removes notes of branches that no longer exist there:

```terminal
$ git fetch --prune
From https://github.com/your-username/my-page
 - [deleted]         (none)     -> origin/add-contact
```

The history shows the merge GitHub made:

```terminal
$ git log --oneline --graph -3
*   dca2d0a (HEAD -> main, origin/main, origin/HEAD) Merge pull request #1 from your-username/add-contact
|\
| * 8da60b7 Add a contact section
|/
*   6c2cb6d Merge branch 'main' of https://github.com/your-username/my-page
|\
```

That is the whole pull request routine: **branch, commit, push, open, review, merge, pull,
delete.**

::: trouble
**There is no yellow banner.** It disappears after a while. Click the **Pull requests** tab, then
**New pull request**, and choose `add-contact` as the *compare* branch.

**The merge button is grey and says there are conflicts.** `main` changed in the same lines since
you made the branch. On your computer: `git switch add-contact`, `git merge main`, resolve the
conflict as in Lesson 6, commit, and `git push`. The pull request updates, and you can merge.
:::

## Working with other people {#others}

Everything you have done works the same when other people join in.

### Invite a collaborator to your repository

::: where github
1. On your repository's page, click **Settings**.
2. In the sidebar, under "Access", click **Collaborators**, then **Add people**.
3. Type the person's GitHub username, choose them, and click the button to add them.
:::

They get an email invitation. Once they accept, they can push to your repository. A good way to
work together: each of you works on your own branches, pushes them, and opens pull requests; the
other reviews and merges. Everyone pulls `main` before starting new work.

### Suggest a change to someone else's project

You cannot push to a project that is not yours. Instead, you make your own copy of it on GitHub,
called a **fork**, and send your change from there:

1. On the project's GitHub page, click **Fork** in the top-right corner, then **Create fork**.
   GitHub makes a copy under your account.
2. Clone **your fork** to your computer (`git clone` with your fork's address), make a branch,
   commit, and push it to your fork.
3. On your fork's page, GitHub offers to open a pull request to the original project. Describe
   your change and create it.
4. The project's owners review it. They may ask for changes (you push more commits to your branch)
   and, if they like it, merge it.

That is how millions of people contribute to open-source projects.

## What you learned {#summary}

- A **pull request** asks to merge a branch, shows the changes, and is the place to review and
  discuss them.
- The routine: **branch, commit, push the branch, open the pull request, review, merge on GitHub,
  then pull `main` and delete the branch.**
- More commits pushed to the branch update an open pull request.
- `git fetch --prune` removes notes of branches deleted on GitHub.
- **Collaborators** can push to your repository; anyone else can **fork** it and send a pull
  request.

| Command | What it does |
|---|---|
| `git push -u origin BRANCH` | Sends a new branch to GitHub |
| `git switch main` then `git pull` | Brings a merged pull request to your computer |
| `git branch -d BRANCH` | Deletes the finished branch on your computer |
| `git fetch --prune` | Gets news from GitHub and drops notes of deleted branches |

## Check yourself {#quiz}

```quiz
? What does a pull request ask for?
- [ ] To download a repository
- [x] To merge one branch into another, after the changes have been seen and discussed
- [ ] To pull the latest commits from GitHub
> Despite the name, a pull request is a request to *merge*. `git pull` is a different thing.

? A reviewer finds a typo in your open pull request. What do you do?
- [ ] Close it and open a new one
- [x] Fix it on the same branch, commit and push; the pull request updates itself
- [ ] Ask the reviewer to fix it after merging
> A pull request follows its branch. New commits on the branch appear in it.

? After merging a pull request on GitHub, why do you run `git pull` on `main` on your computer?
- [x] The merge commit was made on GitHub, so your computer does not have it yet
- [ ] To delete the branch on GitHub
- [ ] To undo the merge
> Anything that happens on GitHub reaches your computer only when you pull.

? You want to suggest a change to a project you cannot push to. What is the first step?
- [ ] Clone it and push to it
- [x] Fork it on GitHub
- [ ] Ask the owner for their password
> A fork is your own copy on GitHub. You push your branch there and open a pull request to the original.
```
