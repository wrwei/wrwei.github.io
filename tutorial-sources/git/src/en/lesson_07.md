---
title: Put your project on GitHub
lead: Create an empty repository on GitHub, connect your project to it, sign in, and push your commits, so your work is safe online.
minutes: 40
needs: Lessons 2 to 6 (a GitHub account, and the `my-page` repository)
goals:
  - Understand what a remote is, and what `origin` means
  - Create an empty repository on GitHub
  - Connect your repository to it and push your commits with `git push`
  - Read "ahead of" and "up to date with" in `git status`
---

## Your computer and GitHub {#idea}

Until now your repository has lived only on your computer. If your laptop breaks, the history
goes with it. In this lesson you put a copy on GitHub.

A copy of your repository somewhere else is called a **remote**. Your computer and GitHub each
hold the whole history, and you keep them in step with two commands:

- **`git push`** sends your new commits to GitHub.
- **`git pull`** brings new commits from GitHub to your computer (Lesson 9).

::: figure id=fig-07-1
Your repository and its copy on GitHub. On your computer, the remote is known by a short name,
`origin`. `git push` sends the commits GitHub does not have yet. `origin/main` is your computer's
note of where `main` is on GitHub.
:::

## Create an empty repository on GitHub {#create}

::: where github
1. In the upper-right corner of any page, click **+**, then **New repository**.
2. **Owner** is already you. As the **Repository name**, type `my-page`.
3. Leave the description empty, or write one, for example "My first web page".
4. Choose **Public**. Lesson 8 needs it: free accounts can only publish web pages from public
   repositories.
5. Leave the options below as they are: **Add README** set to **Off**, no `.gitignore`, no
   licence. Your project already exists, and these would add files that are not in it.
6. Click **Create repository**.
:::

::: figure id=fig-07-2
What to fill in on GitHub's "Create a new repository" page (a simplified sketch; the real page has
a few more options). Name it `my-page`, make it public, leave the README off, and create it.
:::

<!-- replay:
gh-new-repo your-username/my-page
-->

GitHub shows a page with "Quick setup" at the top, and your new repository's address. Make sure
**HTTPS** is selected, and copy the address with the copy icon to its right. It looks like
`https://github.com/your-username/my-page.git`.

::: pitfall
**Public means public.** Anyone can see everything you push to a public repository, including its
whole history. Never put passwords, keys or private documents in it.
:::

## Connect your repository to GitHub {#remote}

In VS Code's terminal, in `my-page`, tell your repository about its new remote. Paste the address
you copied:

```terminal
$ git remote add origin https://github.com/your-username/my-page.git
```

`git remote add` gives the address a short name. `origin` is the name everyone uses for "the main
copy on GitHub". Check it:

```terminal
$ git remote -v
origin	https://github.com/your-username/my-page.git (fetch)
origin	https://github.com/your-username/my-page.git (push)
```

The same address is used to get commits (`fetch`) and to send them (`push`).

::: trouble
**`error: remote origin already exists`.** You have already added it. Check the address with
`git remote -v`. If it is wrong, fix it with `git remote set-url origin` followed by the right
address.
:::

## Send your commits: git push {#push}

Type this command. It means "send my `main` branch to `origin`":

```terminal
$ git push -u origin main
Enumerating objects: 29, done.
Counting objects: 100% (29/29), done.
Delta compression using up to 8 threads
Compressing objects: 100% (27/27), done.
Writing objects: 100% (29/29), 2.96 KiB | 1.48 MiB/s, done.
Total 29 (delta 11), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (11/11), done.
To https://github.com/your-username/my-page.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

The first time, before this answer appears, Git has to check that you are allowed to write to
this repository, so it asks you to sign in to GitHub:

:::: tabs
::: tab Windows
A window from **Git Credential Manager** opens and asks you to sign in to GitHub. Choose to sign
in with your browser. GitHub opens in your browser: sign in if asked, and approve the request.
Then go back to VS Code. Git remembers the sign-in, so you only do this once.
:::
::: tab macOS
VS Code shows a message: "The extension 'GitHub' wants to sign in using GitHub." Click **Allow**.
Your browser opens GitHub: sign in if asked, and click the green button to authorise Visual Studio
Code. If the browser asks whether to open VS Code, say yes. macOS keeps the sign-in in its
keychain, so you only do this once.
:::
::: tab Linux
VS Code shows a message: "The extension 'GitHub' wants to sign in using GitHub." Click **Allow**.
Your browser opens GitHub: sign in if asked, and click the green button to authorise Visual Studio
Code. If the browser asks whether to open VS Code, say yes. VS Code remembers the sign-in.
:::
::::

When you are signed in, the push finishes with the answer above. What it means:

- The first lines count and pack up your commits ("objects" are the pieces Git stores) and send
  them. Your numbers will differ.
- `To https://github.com/...` is where they went.
- `* [new branch] main -> main`: GitHub now has a `main` branch too.
- `branch 'main' set up to track 'origin/main'`: this is what `-u` did. From now on, a plain
  `git push` knows where to send `main`.

::: trouble
**`Support for password authentication was removed`.** Git asked for a username and password in
the terminal, and you typed your password. GitHub does not accept passwords there. Use the
browser sign-in above. If you are not using VS Code's terminal, see "Signing in from another
terminal" below.

**`Repository not found`.** The address is wrong, or the repository does not exist, or you signed
in as a different GitHub account. Compare `git remote -v` with the address on GitHub.

**`error: src refspec main does not match any`.** You have no branch called `main`. Run
`git branch`: if your branch is called `master`, rename it with `git branch -M main` and push
again.

**`! [rejected] main -> main (fetch first)`.** The repository on GitHub is not empty, for example
because **Add README** was on. Run `git pull origin main --allow-unrelated-histories`, close the
message tab that opens, then `git push -u origin main` again.

**`GH007: Your push would publish a private email address`.** Your commits use your real email
address, and your GitHub settings protect it. Set the private address (Lesson 2, Step 5), run
`git commit --amend --reset-author --no-edit` to put it on your last commit, and push again. If
older commits have the real address too, ask for help, or untick **Block command line pushes that
expose my email** in GitHub's email settings.
:::

## See your project on GitHub {#look}

::: where github
Reload your repository's page, `https://github.com/your-username/my-page`. You see:

- the list of your files, `index.html` and `style.css`;
- next to it, your latest commit's message, and how many commits there are. Click the number of
  commits to see your whole history, as in `git log`;
- click `index.html` to read it on GitHub.
:::

Everything you committed on your computer is now on GitHub too, history and all.

## Add a README {#readme}

A **README** is a file that explains a project. GitHub shows it below the file list, on the
repository's front page. Its name is usually `README.md`; the `.md` means it is written in
**Markdown**, plain text with a few symbols for formatting: `#` makes a heading.

Create `README.md` in VS Code, next to `index.html`:

```file README.md
# My page

My first project with Git and GitHub: a small personal web page.
```

```terminal
$ git add README.md
$ git commit -m "Add a README"
[main 595b1e3] Add a README
 1 file changed, 3 insertions(+)
 create mode 100644 README.md
```

Before you push, look at what `git status` says now:

```terminal
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

"Ahead of 'origin/main' by 1 commit": you have one commit that GitHub does not have yet. Push it.
Because of the `-u` earlier, plain `git push` is enough:

```terminal
$ git push
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 409 bytes | 409.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To https://github.com/your-username/my-page.git
   7f70e05..595b1e3  main -> main
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

`7f70e05..595b1e3 main -> main` says GitHub's `main` moved from your old newest commit to the new
one. "Up to date with 'origin/main'": GitHub and your computer agree. Reload the page on GitHub:
your README appears below the files.

::: keyidea
**Commit often, push when you finish.** A commit is saved on your computer only. It is backed up,
and visible to others, only once you push it.
:::

## Signing in from another terminal {#gh}

If you type commands in a terminal outside VS Code (Terminal on macOS, or a Linux terminal), VS
Code cannot sign you in. Install **GitHub CLI** (on macOS with `brew install gh`; on Linux, follow
the instructions at [github.com/cli/cli](https://github.com/cli/cli#installation)), then run:

```terminal norun
$ gh auth login
? Where do you use GitHub? GitHub.com
? What is your preferred protocol for Git operations on this host? HTTPS
? Authenticate Git with your GitHub credentials? Yes
? How would you like to authenticate GitHub CLI? Login with a web browser

! First copy your one-time code: 1A2B-3C4D
Press Enter to open https://github.com/login/device in your browser...
✓ Authentication complete.
✓ Logged in as your-username
```

Choose the answers shown, using the arrow keys and <kbd>Enter</kbd>. When your browser opens,
paste the one-time code. After that, Git uses this sign-in for every push.

## What you learned {#summary}

- A **remote** is another copy of your repository. `origin` is the usual name for the one on
  GitHub.
- Create the GitHub repository **empty** when you already have a project.
- `git remote add origin URL` connects the two, once. `git push -u origin main` sends `main` the
  first time; after that, `git push` is enough.
- `git status` says whether you are **ahead of** GitHub (you have commits to push) or **up to
  date**.
- GitHub needs a sign-in through the browser, not your password, the first time you push.

| Command | What it does |
|---|---|
| `git remote add origin URL` | Connects your repository to a remote called `origin` |
| `git remote -v` | Shows your remotes and their addresses |
| `git push -u origin main` | Sends `main` to GitHub and remembers where it goes |
| `git push` | Sends your new commits to GitHub |

## Check yourself {#quiz}

```quiz
? What is `origin`?
- [ ] A special branch
- [x] The short name of your remote, the copy of your repository on GitHub
- [ ] The first commit in a repository
> `origin` is only a nickname for an address, set by `git remote add`. It is the usual name, not a rule.

? Why should the new GitHub repository be created without a README here?
- [ ] READMEs are not allowed in public repositories
- [x] Your project already has a history; a README made on GitHub would start a different one, and your first push would be rejected
- [ ] A README makes the repository private
> When you start a project on GitHub, adding a README is fine. When you upload an existing project, start with an empty repository.

? `git status` says "Your branch is ahead of 'origin/main' by 2 commits". What does it mean?
- [ ] GitHub has two commits you do not have
- [x] You have two commits that are not on GitHub yet; `git push` sends them
- [ ] Two of your files are not saved
> "Ahead" means you have more than GitHub. The opposite, "behind", comes in Lesson 9.

? You committed a change but did not push. Is it on GitHub?
- [ ] Yes, commits go to GitHub automatically
- [x] No, it is only on your computer until you push
- [ ] Only if the repository is public
> Committing saves on your computer. Pushing copies the commits to GitHub.
```
