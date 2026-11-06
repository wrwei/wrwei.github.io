---
title: 速查表
lead: 本系列的所有命令都在这一页上，按任务分组，另附日常流程和术语表。像 FILE 这样全大写的词，要换成你自己的名称。
---

遇到错误消息了？请看[问题排查页](troubleshooting_ZH.html)。

## 日常流程 {#routine}

| 什么时候 | 命令 | 课 |
|---|---|---|
| 开始工作时 | `git pull` | 9 |
| 每做完一小部分工作 | `git status`，然后 `git add FILE`（或 `git add .`），然后 `git commit -m "MESSAGE"` | 3 |
| 结束工作时 | `git push` | 7 |

## 设置电脑（只需一次） {#setup}

| 命令 | 作用 | 课 |
|---|---|---|
| `git --version` | 显示 Git 已经安装，以及它的版本 | 2 |
| `git config --global user.name "NAME"` | 设置记录在你的提交里的名字 | 2 |
| `git config --global user.email "EMAIL"` | 设置记录在你的提交里的邮箱地址（请使用 GitHub 给你的私密地址） | 2 |
| `git config --global init.defaultBranch main` | 把新项目的第一个分支命名为 `main` | 2 |
| `git config --global core.editor "code --wait"` | 当 Git 需要你写说明时，使用 VS Code | 2 |
| `git config --global pull.rebase false` | 让 `git pull` 用合并的方式把工作结合起来 | 2 |
| `git config --global --list` | 列出你的设置 | 2 |

## 开始一个项目 {#start}

| 命令 | 作用 | 课 |
|---|---|---|
| `git init` | 把当前文件夹变成一个仓库 | 3 |
| `git clone URL` | 把 GitHub 上的一个仓库复制到一个新文件夹里 | 9 |
| `git clone URL FOLDER` | 同上，但复制到你指定名字的文件夹里 | 9 |

## 保存你的工作 {#save}

| 命令 | 作用 | 课 |
|---|---|---|
| `git status` | 显示哪些内容有改动，哪些已经暂存 | 3 |
| `git diff` | 逐行显示还没有暂存的改动 | 4 |
| `git diff --staged` | 显示已经暂存的改动 | 4 |
| `git add FILE` | 暂存一个文件的改动，留给下一次提交 | 3 |
| `git add .` | 暂存当前文件夹里的所有改动 | 4 |
| `git commit -m "MESSAGE"` | 把已暂存的改动保存为一次提交 | 3 |
| `git commit` | 用 Git 准备好的说明完成一次合并 | 6 |

## 查看历史 {#history}

| 命令 | 作用 | 课 |
|---|---|---|
| `git log` | 列出提交，最新的在最前面（按 <kbd>q</kbd> 退出） | 3 |
| `git log --oneline` | 每个提交只占一行 | 4 |
| `git log --oneline --graph --all` | 画出所有分支的历史 | 5 |
| `git log --oneline -5` | 只显示最新的五个提交 | 6 |
| `git show HASH` | 显示一个提交及其改动 | 4 |
| `git reflog` | 列出 `HEAD` 指向过的每一个提交，用来找回“丢失”的提交 | 11 |

## 分支 {#branches}

| 命令 | 作用 | 课 |
|---|---|---|
| `git branch` | 列出分支；`*` 标出当前所在的分支 | 5 |
| `git switch -c NAME` | 创建一个分支并切换过去 | 5 |
| `git switch NAME` | 切换到一个分支 | 5 |
| `git merge NAME` | 把分支 `NAME` 合并到当前分支 | 5 |
| `git merge --abort` | 取消一次因冲突而停下来的合并 | 6 |
| `git branch -d NAME` | 删除一个已经合并的分支 | 5 |
| `git branch -D NAME` | 即使分支没有合并也删除它，丢弃其中的工作 | 5 |
| `git branch NAME HASH` | 在某个提交上新建一个分支，例如用 `git reflog` 找到的提交 | 11 |

## 使用 GitHub {#github}

| 命令 | 作用 | 课 |
|---|---|---|
| `git remote add origin URL` | 把你的仓库和 GitHub 上的一个仓库连接起来 | 7 |
| `git remote -v` | 显示各个远程仓库及其地址 | 7 |
| `git remote set-url origin URL` | 修改 `origin` 的地址 | 7 |
| `git push -u origin BRANCH` | 第一次把一个分支发送到 GitHub，并让两边的分支配对 | 7 |
| `git push` | 把新提交发送到 GitHub | 7 |
| `git pull` | 从 GitHub 取回新提交，并把它们合并进来 | 9 |
| `git fetch --prune` | 从 GitHub 获取最新情况，并忘掉那边已经删除的分支 | 10 |
| `gh auth login` | 在 VS Code 以外的终端里，让 Git 登录 GitHub | 7 |

在 GitHub 网站上：

| 要做的事 | 在 GitHub 上 | 课 |
|---|---|---|
| 创建一个仓库 | **+** > **New repository**（新建仓库） | 7 |
| 复制仓库的地址 | 绿色的 **Code**（代码）按钮，并选中 **HTTPS** | 9 |
| 编辑一个文件 | 打开这个文件，然后点击铅笔图标 | 9 |
| 把仓库发布成网站 | **Settings**（设置）> **Pages** | 8 |
| 创建拉取请求 | **Compare & pull request**（比较并创建拉取请求），或 **Pull requests**（拉取请求）> **New pull request**（新建拉取请求） | 10 |
| 合并拉取请求 | **Merge pull request**（合并拉取请求），然后 **Confirm merge**（确认合并） | 10 |
| 邀请别人推送 | **Settings** > **Collaborators**（协作者）> **Add people**（添加人员） | 10 |
| 把别人的项目复制到你的账号下 | **Fork**（复刻），然后 **Create fork**（创建复刻） | 10 |

## 撤销 {#undo}

| 情况 | 命令 | 推送之后也安全吗？ | 课 |
|---|---|---|---|
| 丢弃一个文件中还没有暂存的改动 | `git restore FILE` | 这些改动会永久丢失 | 4 |
| 取回一个文件在某个较早提交中的样子 | `git restore --source HASH FILE` | 安全：把结果作为一次新的改动提交 | 11 |
| 把一个文件移出暂存区 | `git restore --staged FILE`（所有文件：`git restore --staged .`） | 安全 | 11 |
| 让 Git 永远不跟踪某些文件（还没有提交过的） | 把它们写进 `.gitignore` | 安全 | 11 |
| 改正上一次提交的说明 | `git commit --amend -m "MESSAGE"` | **不安全** | 11 |
| 把忘了加的文件补进上一次提交 | 先用 `git add` 添加它们，然后 `git commit --amend --no-edit` | **不安全** | 11 |
| 撤销上一次提交，但保留其中的改动 | `git reset --soft HEAD~1` | **不安全** | 11 |
| 撤销一个已经在 GitHub 上的提交 | `git revert HASH`（合并提交用 `git revert -m 1 HASH`） | **安全** | 11 |
| 让进行到一半的合并或还原停下来 | `git merge --abort`、`git revert --abort` | 安全 | 6, 11 |
| 找到一个似乎丢失了的提交 | `git reflog` | 安全 | 11 |
| 找回一个丢失的提交 | `git branch NAME HASH` | 安全 | 11 |

## 终端基础 {#terminal}

| 命令或按键 | 作用 |
|---|---|
| `pwd` | 显示终端当前所在的文件夹 |
| `ls`、`ls -a` | 列出文件夹里的文件（`-a`：连隐藏文件也列出来） |
| `cd FOLDER`、`cd ..` | 进入一个文件夹，或者返回上一级 |
| <kbd>Ctrl</kbd>+<kbd>V</kbd>（Linux 上是 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>，Mac 上是 <kbd>Cmd</kbd>+<kbd>V</kbd>） | 粘贴到 VS Code 的终端里 |
| <kbd>Tab</kbd> | 补全你已经开始输入的文件名或文件夹名 |
| <kbd>←</kbd>、<kbd>→</kbd> | 在你正在输入的命令里移动光标（用鼠标点击不行） |
| <kbd>↑</kbd> | 调出你的上一条命令 |
| <kbd>q</kbd> | 退出很长的输出（底部显示 `:` 或 `(END)` 时） |
| <kbd>Ctrl</kbd>+<kbd>C</kbd>（Mac 上也是这样） | 取消正在运行的命令 |

## 术语表 {#glossary}

| 术语 | 含义 |
|---|---|
| **ahead, behind**（领先、落后） | 就你的电脑所知，你的分支有 GitHub 上没有的提交（领先），或者 GitHub 上有你没有的提交（落后） |
| **amend**（修改上一次提交） | 用一个改正后的提交替换你的上一次提交（`git commit --amend`） |
| **branch**（分支） | 一条独立的工作线：贴在某个提交上的一个标签，你每提交一次，它就向前移动一步 |
| **clone**（克隆） | 从 GitHub 复制而来的一个仓库的完整副本；也指制作这个副本的命令 |
| **collaborator**（协作者） | 你允许推送到你的 GitHub 仓库的人 |
| **commit**（提交） | 项目的一张快照，带有说明、作者、日期和哈希值 |
| **conflict**（冲突） | 两个分支以不同的方式修改了相同的行；Git 会请你来选择 |
| **fast-forward**（快进） | 一种合并：Git 只是把分支的标签向前移动，不产生新的提交 |
| **fetch**（获取） | 从 GitHub 下载最新情况，但不改变你的文件或分支；是拉取的前一半 |
| **fork**（复刻） | 别人的仓库在 GitHub 上的一份副本，归你自己所有 |
| **GitHub Pages** | GitHub 的一项免费服务，把仓库里的文件发布成网站 |
| **`.gitignore`** | 一个文件，列出 Git 不应该跟踪的文件 |
| **hash**（哈希值） | 一个提交的唯一名称，例如 `c50e3a0`（一长串代码的前几个字符） |
| **`HEAD`** | 你现在所在的位置：你正在使用的分支，以及由此确定的那个提交 |
| **`HEAD~1`** | `HEAD` 的前一个提交 |
| **`main`** | 仓库主分支的常用名称 |
| **Markdown** | 用几个符号表示格式的纯文本（`#` 表示标题），用于 `.md` 文件 |
| **merge**（合并） | 把两个分支的工作结合到一起；**merge commit**（合并提交）把两条历史线连接起来 |
| **`origin`** | GitHub 上那个远程仓库的常用名称 |
| **`origin/main`** | 你的电脑记下的 GitHub 上 `main` 的位置，在你推送、拉取或获取时更新 |
| **`origin/HEAD`** | 你的电脑记下的 GitHub 首先显示哪个分支；你可以不用管它 |
| **pull**（拉取） | 从 GitHub 取回新提交，并把它们合并到你的分支 |
| **pull request**（拉取请求） | 在 GitHub 上提出的合并一个分支的请求，附有一个用来审查和讨论它的页面 |
| **push**（推送） | 把你的新提交发送到 GitHub |
| **README** | 介绍一个项目的文件；GitHub 会把它显示在仓库的页面上 |
| **reflog**（引用日志） | Git 的日记，记录 `HEAD` 指向过的提交，用来找回“丢失”的提交 |
| **remote**（远程仓库） | 你的仓库的另一份副本，通常在 GitHub 上 |
| **repository**（仓库） | 一个由 Git 保存其历史的文件夹，历史存放在其中隐藏的 `.git` 文件夹里 |
| **revert**（还原） | 一个撤销之前某个提交的新提交（`git revert`） |
| **staging area**（暂存区） | 你（用 `git add`）为下一次提交挑选好的改动 |
| **untracked**（未跟踪） | Git 看得到、但还没有开始照管的文件 |
| **upstream**（上游） | 与你的分支配对（“跟踪”）的 GitHub 上的分支，由 `git push -u` 设置 |
| **working folder**（工作文件夹） | 你的文件，也就是你看到并编辑的样子（Git 称之为 *working tree*，即工作区） |
