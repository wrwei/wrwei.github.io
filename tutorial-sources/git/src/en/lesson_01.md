---
title: What are Git and GitHub?
lead: What Git does, what GitHub adds, the handful of words you will meet, and what you will have built by the end of this series. No commands yet.
minutes: 15
needs: Nothing. Start here
goals:
  - Know what problem Git solves, and what GitHub adds to it
  - Know the difference between Git and GitHub
  - Recognise the words repository, commit, branch, remote, push, pull and pull request
  - Know what you will build in this series, and how the lessons work
---

## The problem {#problem}

You have probably seen a folder like this, or made one:

::: figure id=fig-01-1
Left: the usual way of keeping versions, a new copy of the file for every change, until nobody
knows which one is the latest or what changed between them. Right: one folder, with a history of
snapshots that records what changed, when, who changed it, and why.
:::

Copies like `report-final-2-really-final.docx` answer none of the questions you will have later:

- Which version is the newest?
- What exactly changed between two versions, and why?
- How do I get back the paragraph I deleted last Tuesday?
- My colleague edited the same file. How do we put our changes together?

**Git** answers all of them.

## What Git does {#git}

Git is a program that looks after a folder for you. Whenever you like, you tell Git to take a
**snapshot** of everything in the folder, with a short message saying what you did: "Add a
contact page", "Fix the spelling of the title". Git keeps every snapshot, forever.

With those snapshots you can:

- see the whole history of your project: what changed, when, who changed it, and why;
- compare any two versions, line by line;
- go back to any earlier version of a file, or of the whole project;
- try out an idea on the side, and keep it or drop it without touching your working version;
- combine your work with other people's work.

::: analogy
Think of the save points in a video game. You save before the difficult part. If it goes wrong,
you go back to the save point and try again. Git gives you save points for your work, as many as
you like, each with a note saying what you did.
:::

Git runs on your own computer and works without the internet. It works with any kind of file,
but it is best with text: web pages, program code, notes, data, LaTeX papers. Most software in
the world is kept in Git.

## What GitHub adds {#github}

**GitHub** is a website, [github.com](https://github.com/), that keeps a copy of your Git projects
on the internet. That gives you:

- **a backup**: if your laptop breaks, your work and its history are safe;
- **the same work on several computers**, kept in step;
- **working with other people**: they can see your project, suggest changes, and you review
  them before they go in;
- **a free website** for your project, with GitHub Pages.

::: figure id=fig-01-2
Git runs on your computer and keeps the history of your project there. GitHub keeps a copy on the
internet. You send your new snapshots to GitHub, and bring other people's snapshots from it.
:::

::: keyidea
**Git is the tool; GitHub is a website built around it.** You can use Git without GitHub. GitHub
is one of several such websites (GitLab and Bitbucket are others); what you learn here works with
all of them.
:::

## The words you will meet {#words}

You do not need to remember these now. Each one is explained again when you first use it.

| Word | In plain words | Lesson |
|---|---|---|
| **repository** (or "repo") | A project folder whose history Git keeps | 3 |
| **commit** | One snapshot of the project, with a message | 3 |
| **branch** | A separate line of work, to try something without disturbing the main version | 5 |
| **merge** | Combining the work of two branches | 5 |
| **remote** | A copy of your repository somewhere else, usually on GitHub | 7 |
| **push** | Sending your new commits to GitHub | 7 |
| **pull** | Bringing new commits from GitHub to your computer | 9 |
| **clone** | Copying a whole repository from GitHub to your computer | 9 |
| **pull request** | A request, on GitHub, to merge a branch, with a place to review it first | 10 |

## What you will build {#build}

In this series you build a small personal web page, one step at a time, and keep it in Git from
the very first line. Along the way you change it, try ideas on branches, fix a conflict, put it on
GitHub, and publish it. At the end it is online at your own address,
`https://your-username.github.io/my-page/`, and looks like this:

::: figure id=fig-01-3 image=final-page.png url="your-username.github.io/my-page/" alt="A web page with a dark background: the heading 'Welcome to my page!', two sentences, a list of hobbies and a contact section."
The page you will have built by Lesson 11, published with GitHub Pages. You do not need to know
anything about web pages: every line is given to you.
:::

You do not need to be a programmer. If you can type and follow instructions, you can do this.

## How the lessons work {#how}

Each lesson takes 15 to 45 minutes. Do them in order: each one starts where the last one ended.

**Type every command yourself**, in your own terminal. Commands appear in dark boxes like this,
after a `$`, followed by what the computer answers:

```terminal norun
$ git status
On branch main
nothing to commit, working tree clean
```

**Compare your answer with the one shown.** Every answer in this series was produced by actually
running the commands, so yours should look the same, except for a few things that are different
on every computer: the long codes called hashes (like `c50e3a0`), dates and times, the path to your
home folder, version numbers, and sizes and speeds. Everything else should match. If it does not,
look for the **If something went wrong** box below the step, or the
[troubleshooting page](troubleshooting_EN.html).

You will also see these boxes:

::: where github
Steps you do on GitHub's website, in your browser.
:::

::: where vscode
Steps you do in VS Code, the editor you install in Lesson 2.
:::

::: tip
A shortcut or a good habit.
:::

::: pitfall
Something that catches many people out.
:::

At the end of each lesson there is a summary, a table of the commands you used, and a short quiz.
Click **Mark as done** at the bottom when you finish, and the list of lessons shows your progress
(it is kept in your browser, nowhere else).

## Check yourself {#quiz}

```quiz
? What is the difference between Git and GitHub?
- [ ] They are two names for the same thing
- [x] Git is a program on your computer that keeps your project's history; GitHub is a website that keeps a copy online and helps people work together
- [ ] Git is the website and GitHub is the program
> You can use Git on its own, offline. GitHub adds backup, sharing, collaboration and web pages.

? What is a commit?
- [ ] A file on GitHub
- [x] A snapshot of your project at one moment, with a message saying what changed
- [ ] A promise to finish your work
> Every commit records what changed, who made the change, when, and why.

? Do you need an internet connection to use Git?
- [ ] Yes, always
- [x] No; you only need it to exchange work with GitHub
- [ ] Only for your first commit
> Git keeps everything on your computer. You need the internet only to push to GitHub and pull from it.
```
