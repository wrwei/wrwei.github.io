---
title: 问题排查
lead: 新手最常遇到的报错和提示信息，按你当时在做的事情分组，每一条都说明它是什么意思、怎样解决。在本页搜索你看到的消息中的几个词就能找到它（按 Ctrl+F，Mac 上按 Cmd+F）。
---

<!-- replay:
git config --global user.name "Your Name"
git config --global user.email "12345678+your-username@users.noreply.github.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global pull.rebase false
-->

## 先做这几件事 {#first}

1. **把整条消息读完。**Git 常常会明确告诉你该怎么做，写在以 `hint:` 开头的行里，或者写在括号里。
2. **运行 `git status`。**它会告诉你现在在哪里、哪些东西有改动、Git 正在等你做什么。
3. **用 `pwd` 检查所在的文件夹。**很多问题都是因为在错误的文件夹里运行了命令。
4. **别慌。**你提交过的工作几乎总能找回来（第 11 课）。在弄清楚出了什么问题之前，不要使用你不理解的命令，尤其是带有 `--force` 或 `--hard` 的命令。

下面的终端框显示的是 Git 2.56 对所示命令的输出；GitHub 的消息则按 GitHub 显示的原样引用。你电脑上的哈希值、路径和名称会有所不同，较旧版本的 Git 对个别行的措辞也可能不一样。如果你的电脑设置为中文，Git 可能会用中文显示部分消息，而本页写的是英文原文。这时，在命令前面加上 `LANG=C` 再运行一次（例如 `LANG=C git status`），就能看到英文的消息，再在本页搜索其中的几个词即可。

## 在终端中 {#terminal}

### `git: command not found`，或 "'git' is not recognized"

终端找不到 Git。把 VS Code 完全关闭，再重新打开：终端只有在启动时，才会发现新安装的程序。在 Windows 上，检查终端是不是 Git Bash（提示符里显示 `MINGW64`；第 2 课第 4 步）。如果还是不行，就重新安装 Git。在中文版 Windows 上，这条消息会以中文显示，例如 `无法将“git”项识别为 cmdlet、函数、脚本文件或可运行程序的名称` 或 `'git' 不是内部或外部命令，也不是可运行的程序`。

### 你的 Git 版本低于 2.28 {#old-git}

`git --version` 显示的版本号低于 2.28。旧版本会忽略 `init.defaultBranch` 设置，所以你的分支会叫 `master` 而不是 `main`，有些消息也和课程里的不一样。请更新 Git：

- **Windows：**重新下载并安装最新版的 Git for Windows（第 2 课第 3 步）。
- **macOS：**Apple 的 Git 是随命令行工具（Command Line Tools）一起提供的。如果它们有更新，就在 **System Settings**（系统设置）> **General**（通用）> **Software Update**（软件更新）中安装。如果你的 Mac 太旧，没法通过这种方式得到较新的 Git，就从 [git-scm.com/install/mac](https://git-scm.com/install/mac) 安装 Git。
- **Linux：**在 Ubuntu 上，Git 维护者提供的软件源里有最新版本：先运行 `sudo add-apt-repository ppa:git-core/ppa`，然后运行 `sudo apt update` 和 `sudo apt install git`。

如果你已经建好了 `my-page`，而它的分支叫 `master`，就在 `my-page` 里用 `git branch -M main` 给它改名。

### 最下面一行显示 `:` 或 `(END)`，终端不理会你输入的命令

输出比屏幕还长，所以 Git 一屏一屏地显示它。按 <kbd>Space</kbd> 查看更多，或者按 <kbd>q</kbd> 退出。

### 一个奇怪的界面，左边一列都是 `~`

Git 打开了文本编辑器 Vim，通常是要你为一次提交或合并写提交信息，因为你没有设置别的编辑器。要接受这条提交信息并继续，先按 <kbd>Esc</kbd>，再输入 `:wq`，然后按 <kbd>Enter</kbd>。（改为输入 `:q!` 并不能取消合并、拉取或还原：Git 会照样用准备好的提交信息继续下去。要停止合并，按 <kbd>Esc</kbd>，输入 `:cq`，按 <kbd>Enter</kbd>，然后运行 `git merge --abort`。）之后，把 VS Code 设为 Git 的编辑器：`git config --global core.editor "code --wait"`（第 2 课第 6 步）。

### 顶部显示 `GNU nano` 的界面

Git 打开了文本编辑器 nano：有些 Linux 系统在没有设置其他编辑器时会使用它。按 <kbd>Ctrl</kbd>+<kbd>X</kbd> 接受这条提交信息并继续。然后按上一条的方法，把 VS Code 设为 Git 的编辑器。

### "hint: Waiting for your editor to close the file..."

Git 在 VS Code 中打开了一条提交信息（一个名为 `COMMIT_EDITMSG` 或 `MERGE_MSG` 的标签页），正在等你。检查这条提交信息，然后关闭这个标签页。标签页一关闭，Git 就会继续。

### `error: there was a problem with the editor 'code --wait'`，或 `code: command not found`

终端无法启动 VS Code。在 macOS 上，打开 VS Code，按 <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>，然后选择 **Shell Command: Install 'code' command in PATH**（Shell 命令：在 PATH 中安装“code”命令）。在 Windows 上，把 VS Code 完全关闭，再重新打开；如果还是不行，就重新安装 VS Code，并勾选 **Add to PATH**（添加到 PATH）。在 Linux 上，用 VS Code 的 `.deb` 或 `.rpm` 文件重新安装它。如果这是在合并过程中发生的，那么合并还没有完成：等 `code` 可以用了，运行 `git commit`，然后关闭随之打开的标签页。

### 终端卡住了，或显示 `>` 提示符（Mac 上是 `dquote>`）

有命令还在运行，或者你输入了开头的引号 `"`，却没有输入结尾的引号。按 <kbd>Ctrl</kbd>+<kbd>C</kbd> 取消，然后重新输入命令。

## 开始一个项目 {#starting}

### `fatal: not a git repository`

<!-- replay:
@cd ~
-->

```terminal
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

终端所在的文件夹不是仓库。用 `pwd` 查看你在哪里，然后打开你的项目文件夹：在 VS Code 中选择 **File**（文件）> **Open Folder...**（打开文件夹），再新建一个终端；或者用 `cd` 进入它。只有当你要在这个文件夹里开始一个新项目时，才运行 `git init`。

### 在错误的文件夹里运行了 `git init`

消息 `Initialized empty Git repository in ...`（已在……中初始化空的 Git 仓库）显示的路径不是你的项目文件夹，比如是你的主文件夹。那个文件夹现在变成了一个仓库。把它撤销：输入 `pwd`，确认你就在那个文件夹里（如果是主文件夹，输出的结尾是你的用户名），然后输入 `rm -rf .git`。这只会删除 Git 刚在那里开始记录的历史；你的文件不会受到影响。

### `Author identity unknown`

<!-- replay:
mkdir -p ~/identity-demo
@cd ~/identity-demo
git init -q
printf 'hello\n' > notes.txt
git add notes.txt
git config --global --unset user.name
git config --global --unset user.email
-->

```terminal
$ git commit -m "Add notes"
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: unable to auto-detect email address (got 'you@laptop.(none)')
```

<!-- replay:
git config --global user.name "Your Name"
git config --global user.email "12345678+your-username@users.noreply.github.com"
-->

Git 还不知道你的名字和邮箱地址。按第 2 课第 5 步设置好它们，然后再提交一次。

### `fatal: pathspec '...' did not match any files`

```terminal
$ git add indx.html
fatal: pathspec 'indx.html' did not match any files
```

这个文件夹里没有这个名字的文件。用 `ls` 检查拼写。如果列表里没有这个文件，那它就在别的文件夹里，或者名字不一样：看看 VS Code 里它的标签页上显示的名字。

### "nothing added to commit but untracked files present"

<!-- replay:
git commit -q -m "Add notes"
printf 'More notes\n' > ideas.txt
-->

```terminal
$ git commit -m "Add ideas"
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	ideas.txt

nothing added to commit but untracked files present (use "git add" to track)
```

你没有先添加就提交了，所以暂存区是空的。运行 `git add` 并带上文件名（或者运行 `git add .`），然后再提交。

### "nothing to commit, working tree clean"

这不是错误：没有新的内容需要保存。如果你以为有改动，请检查文件是否已经保存（如果开启了 Auto Save，也就是自动保存，VS Code 会替你保存），以及你是否在正确的文件夹里。

### `warning: in the working copy of '...', LF will be replaced by CRLF`

<!-- replay:
git config --global core.autocrlf true
printf 'Line one\nLine two\n' > list.txt
-->

```terminal
$ git add list.txt
warning: in the working copy of 'list.txt', LF will be replaced by CRLF the next time Git touches it
```

<!-- replay:
git config --global --unset core.autocrlf
git reset -q list.txt
-->

Windows 和其他系统在文本文件里标记行尾的方式不同，Git for Windows 会在两者之间转换。这条警告只是告诉你这一点。它没有害处：继续就好。

### "Aborting commit due to empty commit message."

<!-- replay:
git add ideas.txt
-->

```terminal
$ git commit
Aborting commit due to empty commit message.
```

你输入了不带 `-m` 的 `git commit`，又没写提交信息就关闭了 `COMMIT_EDITMSG` 标签页，所以 Git 没有进行这次提交。什么都没有丢：你的改动仍然是已暂存的。带上提交信息再提交一次：`git commit -m "MESSAGE"`。

### "You are in 'detached HEAD' state"

<!-- replay:
git add ideas.txt
git commit -q -m "Add ideas"
-->

```terminal
$ git log --oneline
c7d8c31 (HEAD -> main) Add ideas
dc1dabf Add notes
$ git checkout dc1dabf
Note: switching to 'dc1dabf'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at dc1dabf Add notes
```

你回到的是一个旧提交本身，而不是一个分支。用来四处看看没问题，但在这里做的新提交不属于任何分支。要回去，就切换到你的分支：

```terminal
$ git switch main
Previous HEAD position was dc1dabf Add notes
Switched to branch 'main'
```

### `.DS_Store` 出现在 `git status` 中（Mac）

macOS 会在你用 Finder（访达）打开过的文件夹里留下名为 `.DS_Store` 的隐藏文件。让 Git 在所有项目中都忽略它们，只需设置一次：

```terminal norun
$ mkdir -p ~/.config/git
$ echo .DS_Store >> ~/.config/git/ignore
```

如果你已经提交过一个，还要运行 `git rm --cached .DS_Store` 并提交：这样 Git 就不再跟踪它，而文件本身仍然留在原处。

## 分支与合并 {#branches}

<!-- replay:
mkdir -p ~/branch-demo
@cd ~/branch-demo
git init -q
printf 'Version 1\n' > page.txt
git add page.txt
git commit -q -m "Add the page"
git switch -q -c idea
printf 'Version 2\n' > page.txt
git commit -q -am "Try version 2"
git switch -q main
printf 'Version 1, edited\n' > page.txt
-->

### `Your local changes to the following files would be overwritten by checkout`

```terminal
$ git switch idea
error: Your local changes to the following files would be overwritten by checkout:
	page.txt
Please commit your changes or stash them before you switch branches.
Aborting
```

你修改了一个文件但没有提交，而另一个分支里有这个文件的不同版本。先提交你的改动（如果你不想要它，就用 `git restore` 恢复这个文件），然后再切换。（Git 还提到了 *stash*，即“贮藏”，一种把改动暂时放到一边的方法。本系列用不到它：要么提交，要么 `git restore`。）

<!-- replay:
git restore page.txt
-->

### `fatal: a branch named '...' already exists`

```terminal
$ git switch -c idea
fatal: a branch named 'idea' already exists
```

这个分支已经存在了。去掉 `-c` 切换过去就行：`git switch idea`。

### `error: the branch '...' is not fully merged`

```terminal
$ git branch -d idea
error: the branch 'idea' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D idea'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
```

这个分支上有当前分支里没有的提交，删除它会丢掉这些提交。如果你想要它的工作，先把它合并进来。如果你确实想丢弃这些工作，就用 `git branch -D`（大写的 D）。

### `git switch` 在 "Switched to branch" 前面输出了 `M` 和一个文件名

你改过那个文件但没有提交，所以这个改动跟着你来到了另一个分支。切换回去，然后在它所属的分支上 `git add` 并 `git commit` 这个文件。

### `CONFLICT (content): Merge conflict in ...`

两个分支修改了相同的行。这很正常；第 6 课会一步一步地教你解决。简单来说：打开文件，在 `<<<<<<<` 和 `>>>>>>>` 标记之间保留你想要的内容，并删掉这些标记，然后 `git add` 这个文件，再 `git commit`。

### `fatal: cannot switch branch while merging`

<!-- replay:
printf 'Version 1, edited on main\n' > page.txt
git commit -q -am "Edit the page on main"
git merge -q idea >/dev/null 2>&1 || true
-->

```terminal
$ git switch idea
fatal: cannot switch branch while merging
Consider "git merge --quit" or "git worktree add".
```

一次有冲突的合并仍在进行中，在它完成之前，Git 不会切换分支。解决冲突，`git add` 这个文件，然后 `git commit`（第 6 课）；或者用 `git merge --abort` 取消这次合并。不要使用 Git 建议的 `git merge --quit`：它会把合并了一半的内容留在你的文件里。（如果你已经 `git add` 过，`git merge` 显示的则是 `fatal: You have not concluded your merge (MERGE_HEAD exists)`，意思是你还没有完成合并：用 `git commit` 完成它。）

<!-- replay:
git merge --abort
-->

### 浏览器里的页面显示 `<<<<<<< HEAD`

冲突标记还留在文件里。删掉它们，然后 `git add` 这个文件。如果合并仍在进行中，`git commit` 会完成它。如果你已经提交了这次合并，就把修正保存为一个新提交：`git commit -m "Remove conflict markers"`。

## 使用 GitHub {#github}

<!-- replay:
gh-new-repo your-username/my-page
mkdir -p ~/my-page
@cd ~/my-page
git init -q
-->

### `error: src refspec main does not match any`

<!-- replay:
git remote add origin https://github.com/your-username/my-page.git
-->

```terminal
$ git push -u origin main
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/your-username/my-page.git'
```

没有叫 `main` 的分支可以发送。要么仓库还没有任何提交（先提交一次），要么你的分支叫别的名字：`git branch` 会显示它。如果它叫 `master`，就用 `git branch -M main` 改名，然后再推送。

### `error: remote origin already exists`

```terminal
$ git remote add origin https://github.com/your-username/my-page.git
error: remote origin already exists.
```

你已经把这个仓库连接到一个叫 `origin` 的远程仓库了。用 `git remote -v` 查看它的地址。如果地址不对，就用 `git remote set-url origin https://github.com/your-username/my-page.git` 修改它，并换成你自己的地址。

### `remote: Repository not found`

```terminal norun
$ git push -u origin main
remote: Repository not found.
fatal: repository 'https://github.com/your-username/my-pgae.git/' not found
```

GitHub 上那个地址没有仓库，或者你登录的账号看不到它。把 `git remote -v` 显示的地址和仓库 GitHub 页面上的地址比较一下（注意拼写错误，比如这里的 `my-pgae`；或者本该是你自己用户名的地方写成了 `your-username`），然后用 `git remote set-url origin` 修正（见上一条）。

### 有个框要你输入 `Username for 'https://github.com'`，或提示 "Support for password authentication was removed"

GitHub 不接受用你的账号密码来使用 Git，而通过浏览器登录这一步又没有发生，可能是因为你点了 **Cancel**（取消）。按 <kbd>Esc</kbd>（如果是在终端里，就按 <kbd>Ctrl</kbd>+<kbd>C</kbd>），再推送一次，然后通过浏览器登录（第 7 课）：在 Windows 上，这一步由 Git Credential Manager 完成；在 VS Code 的终端里，由 VS Code 完成。在其他终端里，请使用 GitHub CLI（`gh auth login`，第 7 课）。千万不要在那个框里输入你的 GitHub 密码。

如果保存了错误的登录信息，就把它删掉：在 Windows 上，在开始菜单中搜索并打开 **Credential Manager**（凭据管理器），在 **Windows Credentials**（Windows 凭据）下删除 `git:https://github.com` 这一项；在 macOS 上，在 **Keychain Access**（钥匙串访问）应用中删除 `github.com` 这一项。

### `fatal: Authentication failed for 'https://github.com/...'`

登录被取消了，或者保存了错误的登录信息。再推送一次，并允许登录。如果这样还不行，就按上一条的方法删除保存的登录信息，然后再推送一次。

### `Permission to ... denied to ...`，或 `The requested URL returned error: 403`

你没有权限写入那个仓库。要么它属于别人，你需要复刻它（第 10 课），或者请它的所有者把你添加为协作者；要么 Git 登录的是你的另一个 GitHub 账号，也就是“denied to”后面的那个。如果是后一种情况，就按上面的方法删除保存的登录信息；在 VS Code 中，还要点击左侧栏底部的 **Accounts**（账户）图标并退出登录。然后再推送一次，用你自己的账号登录。

### "warning: You appear to have cloned an empty repository"

<!-- replay:
gh-new-repo your-username/empty-project
@cd ~
-->

```terminal
$ git clone https://github.com/your-username/empty-project.git
Cloning into 'empty-project'...
warning: You appear to have cloned an empty repository.
```

这不是问题：GitHub 上的仓库还没有任何提交。你可以在新文件夹里开始工作，你的第一次推送会让它有内容。

### `fatal: destination path '...' already exists`

```terminal
$ git clone https://github.com/your-username/empty-project.git
fatal: destination path 'empty-project' already exists and is not an empty directory.
```

这里已经有一个同名的文件夹了。换个名字克隆（`git clone ADDRESS another-name`），或者先进入别的文件夹。

### `! [rejected] main -> main (fetch first)`

<!-- replay:
@cd ~/my-page
printf '<h1>Hello</h1>\n' > index.html
git add index.html
git commit -q -m "Add a page"
git push -q -u origin main 2>/dev/null
printf '# My page\n' | gh-web-edit your-username/my-page main README.md "Create README.md"
printf '<h1>Hello!</h1>\n' > index.html
git commit -q -am "Make the greeting friendlier"
-->

```terminal
$ git push
To https://github.com/your-username/my-page.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/your-username/my-page.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

GitHub 上有你没有的提交。运行 `git pull`（如果有冲突，就解决它），然后 `git push`。第 9 课解释了其中的原因。

### `! [rejected] main -> main (non-fast-forward)`

```terminal
$ git fetch
remote: Enumerating objects: 4, done.
remote: Counting objects: 100% (4/4), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 308 bytes | 308.00 KiB/s, done.
From https://github.com/your-username/my-page
   cd033aa..e63e0ac  main       -> origin/main
$ git push
To https://github.com/your-username/my-page.git
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'https://github.com/your-username/my-page.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

这和“fetch first”（先获取）是同一种情况，只是出现在你的电脑已经下载了 GitHub 上的新提交之后（这里用的是 `git fetch`，它只下载、不合并）。解决办法一样：先 `git pull`，再 `git push`。如果你修改了上一次提交或做了重置，而那个提交已经在 GitHub 上（第 11 课），也会出现这种情况。解决办法还是一样；不要强制推送。

### "Your branch and 'origin/main' have diverged"

```terminal
$ git status
On branch main
Your branch and 'origin/main' have diverged,
and have 1 and 1 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)

nothing to commit, working tree clean
```

你和 GitHub 各有一个对方没有的提交。`git pull` 会把它们合并；然后再 `git push`。

### `fatal: Need to specify how to reconcile divergent branches`

<!-- replay:
git config --global --unset pull.rebase
-->

```terminal
$ git pull
hint: You have divergent branches and need to specify how to reconcile them.
hint: You can do so by running one of the following commands sometime before
hint: your next pull:
hint:
hint:   git config pull.rebase false  # merge
hint:   git config pull.rebase true   # rebase
hint:   git config pull.ff only       # fast-forward only
hint:
hint: You can replace "git config" with "git config --global" to set a default
hint: preference for all repositories. You can also pass --rebase, --no-rebase,
hint: or --ff-only on the command line to override the configured default per
hint: invocation.
fatal: Need to specify how to reconcile divergent branches.
```

<!-- replay:
git config --global pull.rebase false
-->

Git 想知道 `git pull` 应该怎样把你的工作和 GitHub 上的工作结合起来。选择合并，也就是本系列使用的方式，设置一次，所有项目都适用：

```terminal
$ git config --global pull.rebase false
$ git pull
Merge made by the 'ort' strategy.
 README.md | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

### "Your branch is behind 'origin/main'"

<!-- replay:
git push -q 2>/dev/null
printf '# My page\n\nA small web page.\n' | gh-web-edit your-username/my-page main README.md "Update README.md"
git fetch -q
-->

```terminal
$ git status
On branch main
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)

nothing to commit, working tree clean
```

GitHub 上有一个你没有的提交，而你这边没有新的内容。`git pull` 会把它取回来。

### `error: Your local changes to the following files would be overwritten by merge`

<!-- replay:
printf '# My page, edited here\n' > README.md
-->

```terminal
$ git pull
Updating fbaafdb..78b093e
error: Your local changes to the following files would be overwritten by merge:
	README.md
Please commit your changes or stash them before you merge.
Aborting
```

你修改了一个文件但没有提交，而你要拉取的提交也修改了它。先提交你的改动，然后再拉取一次（如果 Git 报告有冲突，就解决它）。如果你不想要自己的改动，就用 `git restore` 恢复这个文件，然后拉取。（本系列不需要用到 Git 的 *stash*。）

<!-- replay:
git restore README.md
git pull -q
-->

### `Everything up-to-date`

```terminal
$ git push
Everything up-to-date
```

这不是错误：GitHub 已经有你所有的提交，所以没有东西要发送。如果你以为有东西要发送，那说明你还没有提交它：运行 `git status` 看看。

### `fatal: The current branch ... has no upstream branch`

<!-- replay:
git switch -q -c new-idea
-->

```terminal
$ git push
fatal: The current branch new-idea has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin new-idea

To have this happen automatically for branches without a tracking
upstream, see 'push.autoSetupRemote' in 'git help config'.
```

这个分支还不在 GitHub 上，所以不带参数的 `git push` 不知道要把它发送到哪里。第一次发送时加上 `-u`：`git push -u origin new-idea`，把其中的分支名换成你自己的（第 10 课）。Git 自己建议的 `--set-upstream` 意思相同。

### "There is no tracking information for the current branch"

```terminal
$ git pull
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> new-idea
```

你在一个还不在 GitHub 上的分支上运行了 `git pull`，所以 Git 不知道该拉取什么。先用 `-u` 推送这个分支（见上一条），或者切换到 `main`，在那里拉取。

<!-- replay:
git switch -q main
git branch -q -d new-idea
-->

### `warning: adding embedded git repository`

<!-- replay:
git clone -q https://github.com/your-username/my-page.git my-page-laptop
-->

```terminal
$ git add .
warning: adding embedded git repository: my-page-laptop
hint: You've added another git repository inside your current repository.
hint: Clones of the outer repository will not contain the contents of
hint: the embedded repository and will not know how to obtain it.
hint: If you meant to add a submodule, use:
hint:
hint: 	git submodule add <url> my-page-laptop
hint:
hint: If you added this path by mistake, you can remove it from the
hint: index with:
hint:
hint: 	git rm --cached my-page-laptop
hint:
hint: See "git help submodule" for more information.
hint: Disable this message with "git config set advice.addEmbeddedRepo false"
```

你的项目里有一个完整的仓库，通常是因为你克隆时终端还在项目文件夹里（第 9 课）。把它移出暂存区。Git 建议的 `git rm --cached` 在这里会拒绝执行；下面这样才行：

```terminal
$ git restore --staged my-page-laptop
```

然后把这个文件夹移出你的项目，或者删除它：在 VS Code 的文件列表中右键点击它，选择 **Delete**（删除）。

<!-- replay:
rm -rf my-page-laptop
-->

### `fatal: refusing to merge unrelated histories`

<!-- replay:
gh-new-repo your-username/new-site readme
mkdir -p ~/new-site
@cd ~/new-site
git init -q
printf '<h1>New site</h1>\n' > index.html
git add index.html
git commit -q -m "Add the first page"
git remote add origin https://github.com/your-username/new-site.git
-->

你在创建 GitHub 仓库时打开了 **Add README**（添加 README），然后把一个已有的项目推送了上去。推送被拒绝（“fetch first”），拉取也失败了：

```terminal
$ git pull origin main
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 235 bytes | 235.00 KiB/s, done.
From https://github.com/your-username/new-site
 * branch            main       -> FETCH_HEAD
 * [new branch]      main       -> origin/main
fatal: refusing to merge unrelated histories
```

两段历史没有共同的提交：一段从 GitHub 上的 README 开始，另一段从你的电脑上开始。告诉 Git 你确实要把它们合在一起，然后推送。（如果 Git 报告 `README.md` 有冲突，那是因为你的项目里也有一个 README：按第 6 课的方法解决冲突，`git add` 这个文件并 `git commit`，然后推送。）

```terminal
$ git pull origin main --allow-unrelated-histories
From https://github.com/your-username/new-site
 * branch            main       -> FETCH_HEAD
Merge made by the 'ort' strategy.
 README.md | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
$ git push -u origin main
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (5/5), 539 bytes | 539.00 KiB/s, done.
Total 5 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), done.
To https://github.com/your-username/new-site.git
   5d7f481..4531b4c  main -> main
branch 'main' set up to track 'origin/main'.
```

（拉取时会打开一个 `MERGE_MSG` 标签页，把它关掉即可。）下次创建仓库时，让它保持为空。

### `GH007: Your push would publish a private email address`

你的提交里含有你的真实邮箱地址，而你在 GitHub 上的邮箱设置会保护这个地址不被公开。按第 2 课第 5 步，改用 GitHub 给你的私密地址。然后查看哪些提交带有你的真实地址：`git log --format="%h %ae"`。如果只有最新的那个提交带有它，就运行 `git commit --amend --reset-author --no-edit`，然后再推送一次。如果更早的提交也带有它，只修改最新的那个提交是不够的：GitHub 只检查最新的提交，所以推送会成功，而你的地址会随着那些更早的提交被公开。改写旧的提交属于高级操作。如果你不介意这个地址在那些提交里公开，就在 GitHub 的 **Settings**（设置）> **Emails**（电子邮件）中取消勾选 **Block command line pushes that expose my email**（阻止会暴露我的电子邮件地址的命令行推送），推送，然后再把它勾选上。（重新勾选并不会隐藏你已经推送的提交里的地址。）

### 我推送了密码或私密文件

马上到这个密码或密钥所属的网站上更改它。在新的提交中删除这个文件，或者还原那个提交，都不能把它从历史中去掉，而任何人都能读到公开仓库的历史。把它从历史中删除属于高级操作；GitHub 的文档在“Removing sensitive data from a repository”（从仓库中删除敏感数据）一文中有说明。

## 拉取请求 {#pull-requests}

### 没有出现带 **Compare & pull request**（比较并创建拉取请求）按钮的黄色横幅

点击 **Pull requests**（拉取请求）标签页，然后点击 **New pull request**（新建拉取请求），并把你的分支选为 *compare*（对比分支）。

### 合并按钮是灰色的，并提示有冲突

在你创建分支之后，`main` 的相同几行也有了改动，通常是在 GitHub 上改的。在你的电脑上，先取得 GitHub 上最新的 `main`：`git switch main`，然后 `git pull`。接着切换到你的分支（`git switch BRANCH`），运行 `git merge main`，按第 6 课的方法解决冲突（`git add`、`git commit`），然后 `git push`。拉取请求会随之更新，然后你就可以合并了。

## GitHub Pages {#pages}

### "404: There isn't a GitHub Pages site here"

第一次发布可能最多需要十分钟。如果页面没有出现，请在 **Settings** > **Pages** 中检查来源是不是 **Deploy from a branch**（从分支部署），并且选择了 `main` 和 `/ (root)`；还要检查你的仓库最顶层有没有一个名字恰好是 `index.html` 的文件。如果是免费账号，仓库必须是公开的（见下一条）。

### Settings 里没有 Pages 选项，或者 Pages 设置要求你升级

这个仓库是私有的。在免费账号上，Pages 需要公开仓库。把它设为公开：在 **Settings** 的 **General**（常规）页面上，向下滚动到“Danger Zone”（危险区域），点击 **Change visibility**（更改可见性），然后按照确认提示一步步操作，把仓库设为公开。（这个部分虽然叫“Danger Zone”，但对这个项目来说，这个更改是安全的。）

### 页面出来了，但没有颜色或图片

浏览器找不到页面要用的某个文件。网上的文件名区分大小写：在那里，`Style.css` 和 `style.css` 是两个不同的文件，即使它们在你的电脑上是同一个。修改 HTML 里的文件名，让它们和 GitHub 列出的文件名完全一致。（在 Windows 和 macOS 上，Git 察觉不到只改变大小写的重命名，所以给文件改名没有用。）

### 我的修改没有出现在网站上

运行 `git status`：如果你的分支领先于 `origin/main`，就推送。如果你已经推送了，等一两分钟，然后让浏览器强制加载最新的副本：在 Windows 和 Linux 上按 <kbd>Ctrl</kbd>+<kbd>F5</kbd>；在 Mac 上按 <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>（在 Safari 中按 <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>R</kbd>）。仓库的 **Actions**（操作）标签页会显示发布是否已经完成。

## 撤销 {#undo}

### 我修改或重置了一个已经推送的提交，现在推送被拒绝了

不要使用 `git push --force`，尽管很多网站都这样建议：它会用你的历史替换 GitHub 上的历史，可能会删除那里的提交。先拉取（`git pull`），按第 6 课的方法解决冲突（如果有的话），然后推送。你的历史里会多一个合并提交，而且什么都不会丢失。

### `git revert` 因冲突停了下来

后来的提交修改了相同的行。按第 6 课的方法解决冲突，然后 `git add` 这些文件，再运行 `git revert --continue`。或者用 `git revert --abort` 放弃。

### `error: commit ... is a merge but no -m option was given.`

你试图还原一个合并提交，比如一个已经合并的拉取请求。请使用 `git revert -m 1 HASH`：它会撤销这次合并给当初所在的分支带来的改动。
