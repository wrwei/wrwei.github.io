---
title: Publish your page with GitHub Pages
lead: Turn on GitHub Pages and your web page is on the internet, at your own address. Then update it with a push.
minutes: 15
needs: Lesson 7 (`my-page` on GitHub, as a public repository)
goals:
  - Publish a repository as a website with GitHub Pages
  - Find your site's address
  - Update the site by pushing a commit
---

## What GitHub Pages does {#what}

**GitHub Pages** takes the files in one of your repositories and puts them on the web as a
website, for free. Your `my-page` repository already has what it needs: an `index.html` at the
top, which is the page a browser shows first.

Your page will be at this address, with your own username:

`https://your-username.github.io/my-page/`

Two conditions: on a free GitHub account the repository must be **public** (yours is, from
Lesson 7), and `index.html` must be at the top level of the folder you publish: here, the top of
`main`.

## Turn on GitHub Pages {#enable}

::: where github
1. Go to your repository, `https://github.com/your-username/my-page`.
2. Under the repository name, click **Settings** (the tab with a gear). If you cannot see it,
   click the **...** menu at the end of the tabs, then **Settings**.
3. In the sidebar on the left, in the "Code, planning, and automation" section, click **Pages**.
4. Under "Build and deployment", under "Source", choose **Deploy from a branch**.
5. Under "Branch", choose **main** in the first menu and **/ (root)** in the second. Click
   **Save**.
:::

::: figure id=fig-08-1
The Pages settings, simplified: under "Build and deployment", the source is "Deploy from a
branch", the branch is `main` and the folder is `/ (root)`. Then click Save.
:::

`/ (root)` means "the top level of the branch", where your `index.html` is.

## Wait a minute, then visit your site {#visit}

GitHub now builds your site. It usually takes a minute or two; GitHub says it can take up to ten.

::: where github
1. Reload the Pages settings page. When the site is ready, the page shows your site's address,
   with a **Visit site** button.
2. Click **Visit site**. Your page opens, with its dark theme, its heading and your hobbies, on
   the internet.
:::

Send the address to a friend: anyone can open it.

::: tip
To watch GitHub publish your site, open the **Actions** tab of your repository. Each publication
appears there as a workflow run, with a green tick when it is done.
:::

## Change the page and publish again {#update}

From now on, every push to `main` updates the site. Try it: change the first paragraph in
`index.html`, the highlighted line.

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
  </ul>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Mention GitHub Pages"
[main a478f84] Mention GitHub Pages
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 402 bytes | 402.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/your-username/my-page.git
   315e479..a478f84  main -> main
```

Wait a minute, then reload your site in the browser. The new sentence is there.

::: tip
Browsers keep copies of pages they have shown. If you do not see your change, force a fresh copy:
<kbd>Ctrl</kbd>+<kbd>F5</kbd> on Windows and Linux; on a Mac,
<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> (in Safari,
<kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>R</kbd>).
:::

::: trouble
**A 404 page: "There isn't a GitHub Pages site here."** Wait a few minutes: the first publication takes
longest. If it stays, check in the Pages settings that the source is `main` and `/ (root)`, and
that your file is called exactly `index.html`, at the top of the repository.

**The page appears, but without its colours.** The browser cannot find `style.css`. On the web,
file names are case-sensitive: `Style.css` and `style.css` are different files. Change the
`<link>` line so that it matches the file's name exactly as GitHub lists it. (On Windows and
macOS, Git does not notice a rename from `Style.css` to `style.css`, so renaming the file does
not help.)

**Settings has no Pages option, or the Pages settings ask you to upgrade.** The repository is
private. On a free account, Pages needs a public repository. Make it public: in **Settings**, on
the **General** page, scroll down to "Danger Zone", click **Change visibility**, and follow the
confirmations to make the repository public. (The section is called "Danger Zone", but for this
project the change is safe.)

**My change does not appear.** Run `git status`. If it says your branch is ahead of
`origin/main`, you have not pushed yet. If you have pushed, wait a minute and force a fresh copy
of the page (see the tip above).
:::

## What you learned {#summary}

- **GitHub Pages** publishes a repository's files as a website, at
  `https://your-username.github.io/REPOSITORY/`.
- You turn it on once: **Settings** > **Pages** > **Deploy from a branch** > `main`, `/ (root)` >
  **Save**.
- After that, every push to `main` updates the site, usually within a minute or two (GitHub says
  it can take up to ten).
- File names on the web are case-sensitive.

| Commands | What they do |
|---|---|
| `git add FILE`, `git commit -m "..."`, `git push` | Together: publish a change to your site |

## Check yourself {#quiz}

```quiz
? Your repository is `my-page` and your username is `alex`. Where is your site?
- [ ] `https://github.com/alex/my-page`
- [x] `https://alex.github.io/my-page/`
- [ ] `https://my-page.github.io/alex/`
> The first address is the repository on GitHub. The site is at your username `.github.io`, then the repository name.

? You changed `index.html` and committed, but the site does not change. What is the most likely reason?
- [ ] GitHub Pages only updates once a day
- [x] You have not pushed the commit yet
- [ ] You must turn Pages off and on again
> Pages publishes what is on GitHub. A commit on your computer is not there until you push it.

? Which file does a browser show first when it opens your site's address?
- [x] `index.html`
- [ ] `README.md`
- [ ] `style.css`
> `index.html` is the entry page. Without it, Pages falls back to `README.md`, which is not what you want here.
```
