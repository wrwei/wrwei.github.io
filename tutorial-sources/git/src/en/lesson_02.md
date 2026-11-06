---
title: Install and set up
lead: Make a GitHub account, install VS Code and Git, open a terminal, and tell Git who you are. You do this once on each computer.
minutes: 45
needs: A computer with Windows 10 or 11, macOS or Linux, and an internet connection
goals:
  - Create a free GitHub account
  - Install VS Code and Git
  - Open a terminal inside VS Code and type your first command
  - Tell Git your name and email, and set three useful defaults
---

## What you will install {#what}

You need three things. All of them are free.

| What | What it is | Why you need it |
|---|---|---|
| A **GitHub account** | Your login on the website github.com | To keep your projects online and share them |
| **VS Code** | A text editor made by Microsoft | To write your files, and to type commands in its built-in terminal |
| **Git** | A program that runs on your computer | To take the snapshots of your work |

If you use a computer at work or at a university, you may need permission to install programs.
Ask your IT team if an installer refuses to run.

::: note
VS Code is not part of Git. You could use any editor and any terminal. We use VS Code because it
puts the editor and the terminal in one window, which makes every lesson easier to follow.
:::

## Step 1: Create a GitHub account {#account}

::: where browser
1. Go to [github.com/signup](https://github.com/signup).
2. Type your email address, a password and a **username**, and follow the prompts. GitHub asks
   you to solve a small puzzle and sends a code to your email address to check that it is yours.
3. If GitHub asks you to choose a plan, choose **Free**.
:::

Choose your username with care. It becomes part of your web addresses: your profile will be at
`github.com/your-username`, and in Lesson 8 your web page will be at
`your-username.github.io`. Short, lower-case names that you would be happy to show an employer
work best.

::: keyidea
In this series, **`your-username`** stands for your GitHub username. Wherever you see it, type
your own username instead.
:::

::: trouble
**I did not get the email with the code.** Look in your spam folder. If it is not there, ask
GitHub to send it again, or try another email address.

**"This email can't be used" or "We couldn't create your account".** GitHub suggests trying another
browser, turning off browser extensions, or waiting a while and trying again.
:::

## Step 2: Install VS Code {#vscode}

:::: tabs
::: tab Windows
1. Go to [code.visualstudio.com](https://code.visualstudio.com/) and click the download button
   for Windows.
2. Open the file you downloaded and click through the installer. On the page **Select Additional
   Tasks**, leave **Add to PATH (requires shell restart)** ticked. It is ticked already.
3. When the installer finishes, open VS Code.
:::
::: tab macOS
1. Go to [code.visualstudio.com](https://code.visualstudio.com/) and click the download button
   for macOS.
2. Open the downloaded file. Drag **Visual Studio Code** into your **Applications** folder, then
   open it from there.
3. Let VS Code start from the terminal later. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>,
   type `shell command`, and choose **Shell Command: Install 'code' command in PATH**.
:::
::: tab Linux
1. Go to [code.visualstudio.com](https://code.visualstudio.com/) and download the `.deb` file
   (Ubuntu, Debian) or the `.rpm` file (Fedora).
2. Open the file to install it with your software centre, or install it from a terminal, for
   example on Ubuntu:

   ```terminal norun
   $ sudo apt install ./code_*.deb
   ```

3. Open VS Code from your applications menu.
:::
::::

One setting makes life easier: in VS Code, open the **File** menu and click **Auto Save**, so
that a tick appears next to it. From now on VS Code saves your files as you type. Without it,
Git cannot see changes you have not saved, which confuses everyone at first.

## Step 3: Install Git {#install-git}

:::: tabs
::: tab Windows
1. Go to [git-scm.com/install/windows](https://git-scm.com/install/windows) and click
   **Click here to download** the latest version of Git for Windows.
2. Open the file you downloaded. The installer has many pages. Click **Next** on all of them,
   except these two:
   - On **Choosing the default editor used by Git**, choose **Use Visual Studio Code as Git's
     default editor**.
   - On **Adjusting the name of the initial branch in new repositories**, choose **Override the
     default branch name for new repositories**. The box below it already says `main`. Leave it.
3. Click **Install**, then **Finish**.

Git for Windows also installs **Git Bash**, a terminal that understands the same commands as the
terminals on macOS and Linux. We use it in the next step.
:::
::: tab macOS
macOS can install Git for you, as part of Apple's "command line developer tools".

1. Open the **Terminal** app: press <kbd>Cmd</kbd>+<kbd>Space</kbd>, type `Terminal` and press
   <kbd>Return</kbd>.
2. Type this command and press <kbd>Return</kbd>:

   ```terminal norun
   $ xcode-select --install
   ```

3. A window asks whether you want to install the tools. Click **Install**, agree to the licence,
   and wait until it says the software was installed. It can take a few minutes.

If the terminal says the command line tools are already installed, you already have Git.
:::
::: tab Linux
Use your system's package manager. On Ubuntu or Debian:

```terminal norun
$ sudo apt update
$ sudo apt install git
```

On Fedora:

```terminal norun
$ sudo dnf install git
```

Type your password when asked. Nothing appears on the screen while you type it; that is normal.
:::
::::

## Step 4: Open a terminal in VS Code {#terminal}

A **terminal** is a window where you give the computer instructions by typing them, instead of
clicking. Each instruction is called a **command**. You type it and press <kbd>Enter</kbd>
(<kbd>Return</kbd> on a Mac), and the computer answers with some text.

::: where vscode
1. If VS Code was open while you installed Git, close it and open it again, so that it finds Git.
2. Open the **Terminal** menu and click **New Terminal**. A panel opens at the bottom of the
   window, with a blinking cursor.
:::

:::: tabs
::: tab Windows
On Windows, VS Code opens PowerShell by default. Switch it to Git Bash, so that every command in
this series works exactly as shown:

1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, type `default profile` and choose
   **Terminal: Select Default Profile**.
2. Choose **Git Bash**.
3. Close the terminal you have: click the bin icon at the top right of the terminal panel. Then
   open a new one with **Terminal** > **New Terminal**.

The new terminal shows something like this, with your own name and computer:

```terminal norun
you@LAPTOP MINGW64 ~
$
```
:::
::: tab macOS
The terminal shows something like this, with your own name and computer:

```terminal norun
you@MacBook ~ %
```

macOS uses `%` at the end where the other systems use `$`. It means the same thing.
:::
::: tab Linux
The terminal shows something like this, with your own name and computer:

```terminal norun
you@laptop:~$
```
:::
::::

The text before the cursor is called the **prompt**. It tells you that the terminal is ready for a
command. In this series, every command is shown after a `$`, like this:

```terminal
$ git --version
git version 2.56.0
```

Type only what comes after the `$` (here `git --version`), then press <kbd>Enter</kbd>. The lines
below the command are what the computer answers. Try it now.

Your version number may be different, and that is fine: anything from 2.28 upwards works for
this series. Windows adds `.windows` and a number to the version, and macOS adds
`(Apple Git-...)`.

::: tip
You can copy a command with the **Copy** button on each box and paste it into the terminal. On
Windows and Linux, paste into VS Code's terminal with <kbd>Ctrl</kbd>+<kbd>V</kbd>; on a Mac,
with <kbd>Cmd</kbd>+<kbd>V</kbd>. Typing the commands yourself helps you remember them, though.
:::

::: trouble
**`git: command not found`, or "The term 'git' is not recognized".** The terminal does not know
about Git yet. Close VS Code completely and open it again. On Windows, check that the terminal is
Git Bash (it says `MINGW64` in the prompt). If it still does not work, install Git again (Step 3).

**Nothing happens when I press Enter, or I see a `>` prompt.** You may have typed an opening
quote `"` without a closing one. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to cancel and type the command
again.
:::

## Step 5: Tell Git who you are {#identity}

Every snapshot Git takes records who made it, with a name and an email address. Tell Git yours.

Your projects on GitHub will be public, and so will the email address inside every snapshot.
GitHub gives you a private address to use instead, so your real address stays private:

::: where github
1. Click your profile picture in the upper-right corner, then **Settings**.
2. In the sidebar, under "Access", click **Emails**.
3. Tick **Keep my email addresses private**. The text under it shows your private address. It
   looks like `12345678+your-username@users.noreply.github.com`, with your own number and
   username. Copy it.
:::

Now type these two commands, with your own name and the address you copied. Keep the quotes:

```terminal
$ git config --global user.name "Your Name"
$ git config --global user.email "12345678+your-username@users.noreply.github.com"
```

Neither command prints anything. In the terminal, no news is good news: a command that worked
often says nothing at all.

`git config` changes Git's settings. `--global` means "for every project on this computer", so you
only do this once.

::: tip
Made a typo? Type the command again with the right value. The new value replaces the old one.
:::

## Step 6: Three useful defaults {#defaults}

Three more settings save you trouble later. Type them exactly as shown:

```terminal
$ git config --global init.defaultBranch main
$ git config --global core.editor "code --wait"
$ git config --global pull.rebase false
```

What they do:

- **`init.defaultBranch main`** names the main line of every new project `main`. That is the
  name GitHub uses, and the name the rest of this series uses.
- **`core.editor "code --wait"`** tells Git to use VS Code when it needs you to write or check a
  message. You will see this in Lesson 5.
- **`pull.rebase false`** chooses the simplest way for `git pull` to combine your work with work
  from GitHub. You will meet `git pull` in Lesson 9.

## Step 7: Check your settings {#check}

Ask Git to list your settings:

```terminal
$ git config --global --list
user.name=Your Name
user.email=12345678+your-username@users.noreply.github.com
init.defaultbranch=main
core.editor=code --wait
pull.rebase=false
```

You should see your own name and email, and the three defaults. Git shows `defaultbranch` in
lower case; that is normal.

::: note
If your computer's language is not English, Git may print some of its messages in your language.
They mean the same as the English ones shown in this series.
:::

::: trouble
**I see more lines than these.** Lines you did not type (for example `filter.lfs...` or
`credential...`) come from programs you installed earlier. They are fine.

**The list is empty, or a line is missing.** Type the missing command again from Step 5 or Step 6.
:::

## What you learned {#summary}

- **GitHub** is a website; **Git** is a program on your computer; **VS Code** is the editor and
  terminal we use for both.
- A **terminal** takes typed **commands**. The **prompt** shows it is ready. In this series `$`
  stands for the prompt: do not type it.
- `git config --global` sets Git's settings once for your whole computer.
- Your commits will carry your name and your private GitHub email address.

| Command | What it does |
|---|---|
| `git --version` | Shows which version of Git is installed |
| `git config --global user.name "..."` | Sets the name recorded in your snapshots |
| `git config --global user.email "..."` | Sets the email recorded in your snapshots |
| `git config --global --list` | Lists your settings |

## Check yourself {#quiz}

```quiz
? What does the `$` at the start of a command in this series mean?
- [ ] It is part of the command and must be typed
- [x] It stands for the prompt; you type only what comes after it
- [ ] It means the command needs administrator rights
> The `$` stands for your terminal's prompt. Type the text after it, then press Enter.

? You ran `git config --global user.email "..."` and nothing was printed. What happened?
- [ ] The command failed silently
- [x] It worked; many commands print nothing when they succeed
- [ ] Git is waiting for you to press Enter again
> In the terminal, no news is usually good news. Check with `git config --global --list` if you want to be sure.

? Why use the `...@users.noreply.github.com` address instead of your own email?
- [ ] GitHub refuses other addresses
- [ ] Git only accepts GitHub addresses
- [x] Your snapshots in public projects show the address, and this one keeps your real address private
> Anyone can read the email address inside a public project's history. The noreply address still links your snapshots to your GitHub account.
```
