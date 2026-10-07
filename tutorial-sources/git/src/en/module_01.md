## Why version control? {#s1}

Almost everyone has seen a folder like this one: `report.docx`, `report_v2.docx`, `report_final.docx` and, sooner or later, `report_final_really.docx`. Each copy was made for a good reason, usually to keep a version that worked before trying something risky. A week later, though, nobody remembers which file is current, what changed between two of them, or why.

Copies are only the start of the trouble. Work gets lost when someone saves over a file or deletes the wrong one. Mistakes are hard to trace, because nothing records who changed a line, or when. And when two people work on the same files, they email copies back and forth and combine them by hand, which goes wrong sooner or later.

**Version control** solves these problems. A version control system records the history of a set of files, so that you can:

- see every change ever made, with who made it, when and why;
- go back to any earlier version of a file, or of the whole project;
- try out an idea without disturbing the version that works; and
- combine the work of several people safely.

Version control is used above all for software, but it suits any files that change over time: websites, books, research papers, data analysis scripts and configuration files. This website, for example, is kept in a Git repository on GitHub, so every page you are reading has a history.

::: keyidea
Version control keeps every saved version of your project, together with who made it, when and why. You can always go back.
:::

## How version control works {#s2}

The central idea is the **commit**: a saved snapshot of the whole project at one moment, together with a short message describing the change, the name of its author and the time. You decide when to make a commit, usually after finishing one small piece of work. The project's **history** is the chain of commits, each one pointing back to the one before it.

::: analogy
Commits work like save points in a video game: you can return to any of them. Unlike a game's save points, each one also carries a note saying what you had just done, which makes the history easy to read later.
:::

Older systems such as Subversion are **centralised**: the history lives on one server, and each person's computer holds only a working copy. You need a connection to the server to look at the history or to save a change. Git is **distributed**: every copy of a project holds its complete history. You can make commits on a train with no network, look through years of history instantly, and every copy is a full backup. When you want to share your work, you exchange commits with other copies.

Git was created in 2005 by Linus Torvalds, the creator of Linux, to manage the source code of the Linux kernel. It is now by far the most widely used version control system.

Beginners often mix up Git and GitHub. **Git** is the program that runs on your computer and keeps the history. **GitHub** is a website that stores Git repositories online and adds tools for working together, such as pull requests, code review and issue tracking; Modules 6 and 7 use it. GitLab and Bitbucket offer similar services. You can use Git without GitHub, but not GitHub without Git.

## Installing Git {#s3}

Install Git on the computer you will use for this series. It is free and takes a few minutes.

**Windows.** Download *Git for Windows* from <https://git-scm.com/downloads/win> and run the installer. The default answers are fine, with two you may want to change. When it asks which editor Git should use, pick one you know, such as Visual Studio Code. When it asks about the name of the initial branch in new repositories, you can choose to override it with `main` (Section 5 sets this anyway). The installer adds *Git Bash*, a terminal in which every command in this series works exactly as shown. PowerShell works too, with small differences pointed out where they matter.

**macOS.** Open the Terminal app (in Applications › Utilities) and type `git --version`. If Git is not installed, macOS offers to install the *command line developer tools*, which include Git: accept, and wait for the installation to finish. You can also start that installation with `xcode-select --install`, or install Git with Homebrew (`brew install git`) if you already use it.

**Linux.** Use your distribution's package manager: `sudo apt install git` on Debian and Ubuntu, or `sudo dnf install git` on Fedora. <https://git-scm.com/downloads/linux> lists the commands for other distributions.

::: pitfall
On Windows, a terminal that was already open when you installed Git does not know about it yet. Close it and open a new one.
:::

To check that Git works, open a terminal and run:

{{SESSION:m01-version}}

Git answers with its version number. This series needs Git 2.28 or later, which every installer released since 2020 provides; if your Linux distribution offers an older version, its download page lists newer packages. The output on these pages came from the version shown above; on a Mac, the part in brackets says that Apple built this copy of Git. Your number will probably be different, and that does not matter.

## The terminal survival kit {#s4}

Git is used mainly from a **terminal**: a window in which you type a command, press Enter and read the reply. On Windows, use Git Bash (or PowerShell); on macOS, the Terminal app; on Linux, any terminal. The terminal shows a *prompt* when it is ready for a command. On these pages, commands appear after a `$`, which you do not type.

Every command runs in a *current folder*, and much of using a terminal is moving between folders. Five commands are enough for this series:

| Command | What it does |
|---|---|
| `pwd` | prints the current folder (short for "print working directory") |
| `ls` | lists what is in a folder |
| `cd` | changes the current folder; `cd ..` goes up one level |
| `mkdir` | makes a new folder |
| `cat` | shows what a file contains |

Try them in the session below. The examples on these pages run in a home folder called `/home/alex`; yours will be your own, such as `C:\Users\you` on Windows or `/Users/you` on a Mac. Where a session asks you to create or edit a file, use your editor and save the file in the folder the session is working in.

{{SESSION:m01-terminal}}

Follow the output step by step. `pwd` shows where you start; after `cd projects`, it shows the new folder. The first `ls` lists the `projects` folder you have just made. Commands such as `mkdir` and `cd` print nothing when they succeed, which is normal: in a terminal, silence usually means success. Finally, `cat` prints the file you saved with your editor.

::: tip
Press Tab to complete a file or folder name, and the Up arrow to bring back an earlier command. In PowerShell, `ls` prints a table rather than a plain list of names, but it shows the same files.
:::

## Introduce yourself to Git {#s5}

Every commit records the name and email address of its author, so tell Git who you are before your first commit. The `--global` option stores a setting for every repository you work on as this user, in a file called `.gitconfig` in your home folder, so you only need to do this once on each computer.

Use the email address you will use on GitHub; Module 6 shows how to keep it private. Two more settings save trouble later:

- `init.defaultBranch main` makes new repositories start on a branch called `main`, as GitHub's do. Without it, Git names the first branch `master` and prints a long hint suggesting that you choose a name.
- `core.editor` chooses the editor Git opens when it needs you to write a longer message. `"code --wait"` opens Visual Studio Code, whose `code` command must be installed: on a Mac, run *Shell Command: Install 'code' command in PATH* from VS Code's command palette; the Windows installer adds it for you. `nano` works in any terminal, and `notepad` on Windows.

Run these commands, with your own name and email address:

{{SESSION:m01-config}}

The four `git config --global` commands print nothing when they succeed. `git config --global --list` then shows what you set. The names appear in lower case, as in `init.defaultbranch`, because Git ignores case in setting names; nothing went wrong. Finally, `git config user.name`, without a value, reads one setting back.

## Git in editors and apps {#s6}

You do not have to use Git from a terminal. Visual Studio Code has a Source Control view, GitHub Desktop is a free app for Windows and macOS, and JetBrains IDEs such as IntelliJ IDEA and PyCharm have Git built in. All of them run the same Git commands underneath.

This series uses the command line for three reasons: it shows exactly what Git does at each step, it works the same on every computer, and it is what most help pages and colleagues will tell you to type. Once you know the commands, the buttons in these tools make sense, including the ones that combine several commands. A *Sync* button, for example, typically pulls other people's commits and then pushes yours. Use whichever you prefer, but learn the commands first.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**Spot the problems.** A team keeps its report on a shared drive as `report.docx`, `report_v2.docx`, `report_v2_Sam.docx` and `report_final.docx`. Name three questions that the team cannot easily answer.
:::

::: solution
Any three of these:

- Which file is the current version?
- What changed between `report_v2.docx` and `report_final.docx`, and why?
- Who wrote or deleted a particular paragraph?
- How can Sam's changes be combined with everyone else's?
- How can they get back a paragraph that someone deleted last week?

Version control answers each of them: one folder holds the current version, and the history records every change with its author, time and reason.
:::

::: exercise #e2 level=1 kind=conceptual minutes=3
**Git or GitHub?** Say whether each statement is about Git or about GitHub.

1. "I made a commit on the train, without an internet connection."
2. "I opened a pull request so that my team could review my change."
3. "My laptop holds the whole history of the project."
4. "Our repository has a web page where people report bugs."
:::

::: solution
1. **Git.** Commits are made on your own computer and need no network.
2. **GitHub.** Pull requests are a feature of the GitHub website (Module 7).
3. **Git.** Git is distributed: every copy of a repository holds the full history.
4. **GitHub.** Issues are a feature of the GitHub website.
:::

::: exercise #e3 level=1 kind=coding minutes=4
**Install and check.** Install Git on your computer and run `git --version`. What should you do if the terminal answers that the command is not found?
:::

::: solution
A working installation prints one line such as `git version 2.50.1`; any version from 2.28 on is fine. If the command is not found:

- on Windows, close the terminal and open a new one, which picks up the newly installed Git; if that fails, run the installer again;
- on macOS, accept the offer to install the command line developer tools, or run `xcode-select --install`;
- on Linux, install the package called `git` with your distribution's package manager.
:::

::: exercise #e4 level=1 kind=coding minutes=4
**Change your editor.** Make nano the editor Git opens, then check that the setting took effect. How would you switch back to Visual Studio Code?
:::

::: solution
Set the editor, then read the setting back:

{{SESSION:m01-e4-solution}}

To switch back, run `git config --global core.editor "code --wait"`. Setting a key again replaces its old value.
:::

::: exercise #e5 level=1 kind=coding minutes=3
**Find your way around.** In your terminal, make a folder called `git-practice` inside your home folder, go into it, and print where you are. Then go back up to your home folder.
:::

::: solution
Run `mkdir git-practice`, then `cd git-practice`, then `pwd`, which prints your home folder's path followed by `/git-practice` (on Windows, `\git-practice`). Finally run `cd ..` to go back up. These are the same steps as the survival-kit session, with your own folder names.
:::

::: exercise #e6 level=2 kind=conceptual minutes=3
**Global or not?** You set `user.email` with `--global`. Does the setting apply to a repository you create next year? How could you use a different email address for your work projects only?
:::

::: solution
Yes. A `--global` setting is stored in the `.gitconfig` file in your home folder and applies to every repository you use as this user, including future ones.

To use another address for one project, run `git config user.email you@work.example` inside that project's repository, without `--global`. A setting made inside a repository applies to that repository only and takes priority over the global one.
:::

## Self-check quiz {#quiz}

```quiz
? What does a commit record?
- [ ] Only the files you changed since yesterday
- [x] A snapshot of the project, with a message, the author and the time
- [ ] A backup copy of the project on GitHub
- [ ] The name of the computer you used
> A commit is a saved snapshot of the whole project, labelled with who made it, when and why.

? Which statement about distributed version control is true?
- [ ] It needs a constant connection to a server.
- [ ] Only one person can make commits at a time.
- [x] Every copy of the repository holds the full history.
- [ ] It works only for program code.
> In Git, every clone is a complete repository, so you can commit offline and every copy is a backup.

? How are Git and GitHub related?
- [ ] They are two names for the same program.
- [x] Git is a program on your computer; GitHub is a website that hosts Git repositories.
- [ ] GitHub is the program and Git is its website.
- [ ] They are competing version control systems.
> GitHub stores Git repositories online and adds collaboration features; Git itself runs on your own computer.

? What does `cd ..` do?
- [ ] Lists the files in the current folder
- [ ] Makes a new folder called `..`
- [ ] Deletes the current folder
- [x] Moves up to the folder that contains the current one
> `..` means "the folder above this one", and `cd` changes into it.

? Why should you set `user.name` and `user.email` before your first commit?
- [x] Every commit records them as its author.
- [ ] GitHub uses them as your password.
- [ ] They encrypt your repository.
- [ ] Git cannot be installed without them.
> Commits store the author's name and email permanently, so set them before you start.

? `git config --global --list` shows `init.defaultbranch=main`, all in lower case. What does that mean?
- [ ] The setting failed and must be repeated.
- [ ] It applies to the current folder only.
- [x] Nothing is wrong: Git ignores case in the names of settings.
- [ ] You must type `defaultBranch` with a capital B to make it work.
> Git treats setting names case-insensitively and lists them in lower case.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, [*Pro Git*, chapter 1: Getting Started](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control): version control, a short history of Git, installation and first-time setup.
- [Git downloads](https://git-scm.com/downloads) for every operating system.
- The [git config reference](https://git-scm.com/docs/git-config), for every setting and where it is stored.
- GitHub Docs, [Set up Git](https://docs.github.com/en/get-started/git-basics/set-up-git).
- Visual Studio Code, [Source control](https://code.visualstudio.com/docs/sourcecontrol/overview), for using Git from the editor.
