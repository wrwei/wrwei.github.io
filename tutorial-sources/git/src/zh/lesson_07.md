---
title: 把项目放到 GitHub 上
lead: 在 GitHub 上创建一个空仓库，把你的项目连接上去，登录，再推送你的提交，让你的工作安全地保存在网上。
minutes: 40
needs: 第 2 至 6 课（一个 GitHub 账号，以及 `my-page` 仓库）
goals:
  - 理解什么是远程仓库，以及 `origin` 是什么意思
  - 在 GitHub 上创建一个空仓库
  - 把你的仓库连接上去，并用 `git push` 推送你的提交
  - 看懂 `git status` 中的“ahead of”和“up to date with”
---

## 你的电脑和 GitHub {#idea}

到目前为止，你的仓库（repository）只存在于你的电脑上。万一笔记本电脑坏了，历史记录也会跟着没了。在这一课里，你要把一份副本放到 GitHub 上。

放在别处的仓库副本叫作**远程仓库**（remote）。你的电脑和 GitHub 各自保存着完整的历史记录，你用两个命令（command）让它们保持同步：

- **`git push`** 把你的新提交（commit）发送到 GitHub。
- **`git pull`** 把 GitHub 上的新提交带到你的电脑上（第 9 课）。

::: figure id=fig-07-1
你的仓库和它在 GitHub 上的副本。在你的电脑上，这个远程仓库有一个简短的名字：`origin`。`git push` 会发送 GitHub 还没有的提交。`origin/main` 是你的电脑对 GitHub 上 `main` 所在位置的记录。
:::

## 在 GitHub 上创建一个空仓库 {#create}

::: where github
1. 打开 [github.com](https://github.com/) 并登录（sign in）。在右上角点击 **+**，然后点击 **New repository**（新建仓库）。
2. **Owner**（所有者）已经是你了。在 **Repository name**（仓库名称）中输入 `my-page`。
3. 描述可以留空，也可以写一句，例如“我的第一个网页”。
4. 选择 **Public**（公开）。第 8 课需要这样设置：免费账号只能从公开仓库发布网页。
5. 下面的选项保持原样：**Add README**（添加 README）设为 **Off**（关闭），不添加 `.gitignore`，也不添加许可证。你的项目已经有了历史记录。只要选了其中任何一项，GitHub 就会另外开始一段历史记录，并拒绝你的第一次推送（push）。
6. 点击 **Create repository**（创建仓库）。
:::

::: figure id=fig-07-2
在 GitHub 的“Create a new repository”（创建新仓库）页面上要填写的内容（简化示意图，真实的页面上还有几个其他选项）。把它命名为 `my-page`，设为公开，README 保持关闭，然后创建。
:::

<!-- replay:
gh-new-repo your-username/my-page
-->

GitHub 会显示一个顶部写着“Quick setup”（快速设置）的页面，上面有你的新仓库的地址。确认选中的是 **HTTPS**，然后点击地址右边的复制图标，复制这个地址。它看起来像 `https://github.com/your-username/my-page.git`。在它下面，GitHub 列出了一些命令，那是给以前做过这件事的人准备的。你用不着它们：这一课会带你一条一条地完成你需要的命令。先不要关闭这个页面。

::: pitfall
**公开就是公开。**任何人都能看到你推送到公开仓库的所有内容，包括它的全部历史记录。千万不要把密码、密钥或私人文件放进去。
:::

## 把你的仓库连接到 GitHub {#remote}

在 VS Code 中用 **File**（文件）> **Open Recent**（打开最近的文件）打开 `my-page`，然后打开一个终端（terminal）。把新的远程仓库告诉你的仓库：输入 `git remote add origin `（末尾有一个空格），粘贴你复制的地址（用第 2 课学过的快捷键：Windows 上是 <kbd>Ctrl</kbd>+<kbd>V</kbd>，Linux 上是 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>，Mac 上是 <kbd>Cmd</kbd>+<kbd>V</kbd>），然后按 <kbd>Enter</kbd>。下面这个框没有**复制**按钮，因为地址里必须是你自己的用户名：

```terminal nocopy
$ git remote add origin https://github.com/your-username/my-page.git
```

`git remote add` 给这个地址起了一个简短的名字。`origin` 是大家通用的名字，指的是“GitHub 上的那份主副本”。检查一下：

```terminal
$ git remote -v
origin	https://github.com/your-username/my-page.git (fetch)
origin	https://github.com/your-username/my-page.git (push)
```

获取提交（`fetch`）和推送提交（`push`）用的是同一个地址。

::: trouble
**`error: remote origin already exists`**（错误：远程仓库 origin 已经存在）。你已经添加过它了。用 `git remote -v` 检查地址。如果地址不对，就用 `git remote set-url origin https://github.com/your-username/my-page.git` 改正，其中的地址要换成你自己的。
:::

## 发送你的提交：git push {#push}

第一次推送时，Git 需要确认你有权限写入这个仓库，所以会要求你登录 GitHub。先阅读你所用系统的标签页，然后再输入命令。你登录的时候，终端会一直等着，这是正常的。

:::: tabs
::: tab Windows
会打开一个 **Git Credential Manager** 的窗口，标题是“Connect to GitHub”（连接到 GitHub）。点击 **Sign in with your browser**（使用浏览器登录）。浏览器会打开 GitHub：如果要求登录，就登录，然后点击绿色按钮，授权（authorise）Git Credential Manager。浏览器显示你已经登录后，回到 VS Code。Git 会记住这次登录，所以你只需要做一次。

如果好像什么都没发生，这个窗口可能被 VS Code 挡住了：在任务栏上找找它。如果 VS Code 显示的是“The extension 'GitHub' wants to sign in using GitHub”（扩展“GitHub”想要使用 GitHub 登录），就点击 **Allow**（允许），然后像在 Mac 上一样继续操作。
:::
::: tab macOS
VS Code 会显示一条消息：“The extension 'GitHub' wants to sign in using GitHub.”（扩展“GitHub”想要使用 GitHub 登录。）点击 **Allow**（允许）。浏览器会打开 GitHub：如果要求登录，就登录，然后点击绿色按钮，授权（authorise）Visual Studio Code。如果浏览器询问是否打开 VS Code，就同意。macOS 会把这次登录保存在钥匙串（keychain）里，所以你只需要做一次。

如果没有出现任何消息，推送就完成了，那说明你已经登录过了。
:::
::: tab Linux
VS Code 会显示一条消息：“The extension 'GitHub' wants to sign in using GitHub.”（扩展“GitHub”想要使用 GitHub 登录。）点击 **Allow**（允许）。浏览器会打开 GitHub：如果要求登录，就登录，然后点击绿色按钮，授权（authorise）Visual Studio Code。如果浏览器询问是否打开 VS Code，就同意。VS Code 会记住这次登录。

如果 VS Code 警告“An OS keyring couldn't be identified”（无法识别操作系统的密钥环），就点击 **Use weaker encryption**（使用较弱的加密）。如果没有出现任何消息，推送就完成了，那说明你已经登录过了。
:::
::::

现在输入这个命令。它的意思是“把我的 `main` 分支（branch）发送到 `origin`”：

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

第一次推送时，在出现上面这段输出之前，Git 需要确认你有权限写入这个仓库，所以会要求你登录 GitHub：

:::: tabs
::: tab Windows
会打开一个 **Git Credential Manager** 的窗口，要求你登录 GitHub。选择用浏览器登录。浏览器会打开 GitHub：如果要求登录，就登录，然后批准这个请求。之后回到 VS Code。Git 会记住这次登录，所以你只需要做一次。
:::
::: tab macOS
VS Code 会显示一条消息：“The extension 'GitHub' wants to sign in using GitHub.”点击 **Allow**。浏览器会打开 GitHub：如果要求登录，就登录，然后点击绿色按钮，授权 Visual Studio Code。如果浏览器询问是否打开 VS Code，就同意。macOS 会把这次登录保存在钥匙串里，所以你只需要做一次。
:::
::: tab Linux
VS Code 会显示一条消息：“The extension 'GitHub' wants to sign in using GitHub.”点击 **Allow**。浏览器会打开 GitHub：如果要求登录，就登录，然后点击绿色按钮，授权 Visual Studio Code。如果浏览器询问是否打开 VS Code，就同意。VS Code 会记住这次登录。
:::
::::

登录之后，推送就会完成，并显示上面这段输出。它的意思是：

- 前几行在清点、打包你的提交（“objects”是 Git 存储的一块块数据），然后把它们发送出去。你看到的数字会不一样。
- `To https://github.com/...` 表示它们被发送到了哪里。
- `* [new branch] main -> main`：GitHub 现在也有了一个 `main` 分支。
- `branch 'main' set up to track 'origin/main'`（分支 'main' 已设置为跟踪 'origin/main'）：这是 `-u` 的作用。`origin/main` 是你的电脑对 GitHub 上 `main` 所在位置的记录；Git 每次和 GitHub 通信时都会更新它。这里的“跟踪”（track）是指，你的 `main` 现在和它配成了一对，所以直接运行 `git push`（以及以后的 `git pull`）时，Git 就知道该去哪里。

::: trouble
**VS Code 顶部出现一个输入框，或者终端里出现提示，要你输入用户名或密码。**浏览器登录没有完成，可能是因为你点了 **Cancel**（取消）。按 <kbd>Esc</kbd>（在终端里按 <kbd>Ctrl</kbd>+<kbd>C</kbd>），再运行一次 `git push -u origin main`，然后点击 **Allow**。如果终端又来询问，就把它关掉（点垃圾桶图标），用 **Terminal**（终端）> **New Terminal**（新建终端）打开一个新终端，再推送一次。千万不要在那里输入你的 GitHub 密码：GitHub 会拒绝它，并显示 `Support for password authentication was removed`（已移除对密码认证的支持）。如果你用的不是 VS Code 的终端，请看下面的“从其他终端登录”一节。

**`Repository not found`**（找不到仓库）。地址错了（里面写的是不是 `your-username`，而不是你自己的用户名？），或者这个仓库不存在。把 `git remote -v` 显示的地址和 GitHub 上的地址对比一下，然后用 `git remote set-url` 改正（见上文）。

**`Permission to your-username/my-page.git denied to ...`**（拒绝了 ... 对 your-username/my-page.git 的访问权限），或者 **`The requested URL returned error: 403`**（请求的 URL 返回了错误 403）。Git 用另一个 GitHub 账号登录了，也就是“denied to”后面写的那个账号。删除保存的登录信息：在 Windows 上，在开始菜单中搜索并打开 **Credential Manager**（凭据管理器），在 **Windows Credentials**（Windows 凭据）下删除 `git:https://github.com` 这一项；在 macOS 上，打开 **Keychain Access**（钥匙串访问）应用，删除 `github.com` 这一项；在 VS Code 中，点击左侧竖栏底部的 **Accounts**（账户）图标，然后退出登录。之后再推送一次，用你自己的账号登录。

**`error: src refspec main does not match any`**（错误：源引用 main 没有匹配到任何内容）。你没有叫 `main` 的分支。运行 `git branch`：如果你的分支叫 `master`，就用 `git branch -M main` 给它改名，然后再推送一次。

**`! [rejected] main -> main (fetch first)`**（被拒绝：请先获取）。GitHub 上的仓库不是空的，比如因为当时 **Add README** 是打开的。运行 `git pull origin main --allow-unrelated-histories`，关闭随后打开的提交信息标签页，然后再运行一次 `git push -u origin main`。现在你的项目里有了 GitHub 生成的 `README.md`：到下面的“添加 README”一节时，把它的内容替换成那里给出的内容。

**`GH007: Your push would publish a private email address`**（你的推送会公开一个设为不公开的邮箱地址）。你的提交里用的是你的真实邮箱地址，而你的 GitHub 设置会保护这个地址。先设置私密地址（第 2 课第 5 步）。然后查看哪些提交带有你的真实地址：`git log --format="%h %ae"`。如果只有最新的那个提交带有它，就运行 `git commit --amend --reset-author --no-edit`，然后再推送一次。如果更早的提交也带有它，只修改上一次提交（amend）是不够的：GitHub 只检查最新的提交，所以推送会成功，而你的地址会随着那些更早的提交被公开。改写旧的提交属于高级操作。如果你不介意这个地址在那些提交里公开，就在 GitHub 的邮箱设置中取消勾选 **Block command line pushes that expose my email**（阻止会暴露我的邮箱地址的命令行推送），推送，然后再把它勾选上。
:::

## 在 GitHub 上查看你的项目 {#look}

::: where github
刷新你的仓库页面 `https://github.com/your-username/my-page`。你会看到：

- 你的文件列表：`index.html` 和 `style.css`；
- 列表上方是你最近一次提交的提交信息，以及提交的数量。点击这个数字，就能像 `git log` 那样看到你的全部历史记录；
- 点击 `index.html`，就能在 GitHub 上阅读它。

GitHub 还会建议你 **Add a README**（添加 README）。不要点它：下一步你会从自己的电脑上添加一个。
:::

你在电脑上提交的所有内容，现在也都在 GitHub 上了，连同全部历史记录。

## 添加 README {#readme}

**README** 是一个介绍项目的文件。GitHub 会把它显示在仓库首页的文件列表下方。它的文件名通常是 `README.md`；`.md` 表示它是用 **Markdown** 写的，也就是带有少量格式符号的纯文本：`#` 表示标题。

在 VS Code 中创建 `README.md`，和 `index.html` 放在一起：

```file README.md
# My page

My first project with Git and GitHub: a small personal web page.
```

```terminal
$ git add README.md
$ git commit -m "Add a README"
[main 315e479] Add a README
 1 file changed, 3 insertions(+)
 create mode 100644 README.md
```

推送之前，先看看 `git status` 现在怎么说：

```terminal
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

“ahead of 'origin/main' by 1 commit”（比 'origin/main' 领先 1 个提交）：就你的电脑所知，GitHub 上还缺你的一个提交。把它推送上去。因为之前用过 `-u`，现在直接运行 `git push` 就够了：

```terminal
$ git push
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 408 bytes | 408.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To https://github.com/your-username/my-page.git
   10984c7..315e479  main -> main
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

`10984c7..315e479 main -> main` 表示 GitHub 上的 `main` 从你原来最新的那个提交移到了新的提交。“up to date with 'origin/main'”（与 'origin/main' 一致）：就你的电脑所知，GitHub 上的提交和你的一样。刷新 GitHub 上的页面：你的 README 出现在文件列表下方。

VS Code 窗口底部的状态栏也会用箭头和数字显示同样的信息。在本系列中，请在终端里推送和拉取（pull），不要用 VS Code 的 **Sync Changes**（同步更改）按钮，这样你看到的内容才会和课程一致。

::: keyidea
**经常提交，完成时推送。**提交只保存在你的电脑上。只有推送之后，它才有了备份，别人也才能看到它。
:::

## 从其他终端登录 {#gh}

如果你在 VS Code 之外的终端里输入命令，VS Code 就没法帮你登录。最简单的办法是使用 VS Code 的终端，就像本系列的其他部分那样。你可能根本用不到这一节：

- 在 Windows 上，无论用哪个终端，Git Credential Manager 都能帮你登录。
- 在 Mac 上，你在 VS Code 终端里完成的登录保存在钥匙串里，所以在“终端”（Terminal）应用中也能用。

否则（多半是在 Linux 上），请按照 [github.com/cli/cli](https://github.com/cli/cli#installation) 上的说明安装 **GitHub CLI**。（在 Mac 上，只有安装了 Homebrew，`brew install gh` 才能用；如果终端显示 `command not found: brew`（找不到命令：brew），就改用那个页面上的 macOS 安装程序。）然后运行：

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

用方向键和 <kbd>Enter</kbd> 选择上面显示的答案。gh 打印的内容可能会比这里多几行；重要的是最后一行 `✓ Logged in as your-username`（已作为 your-username 登录）。浏览器打开后，输入终端里显示的 8 个字符的代码，然后点击 **Continue**（继续），再点击绿色按钮授权 GitHub CLI。手动输入代码比复制更省事：在终端里，<kbd>Ctrl</kbd>+<kbd>C</kbd> 会取消命令。之后，Git 每次推送都会使用这次登录。

## 小结 {#summary}

- **远程仓库**是你的仓库的另一份副本。`origin` 是 GitHub 上那份副本的常用名字。
- 如果你已经有了一个项目，就把 GitHub 上的仓库创建成**空的**。
- `git remote add origin URL` 把两者连接起来，只需要做一次。第一次用 `git push -u origin main` 发送 `main`；之后，用 `git push` 就够了。
- `git status` 会告诉你，你是**领先于** GitHub（有提交要推送），还是和它**一致**。
- 第一次推送时，GitHub 需要你通过浏览器登录，而不是输入你的密码。

| 命令 | 作用 |
|---|---|
| `git remote add origin URL` | 把你的仓库连接到一个名为 `origin` 的远程仓库 |
| `git remote -v` | 显示你的远程仓库及其地址 |
| `git push -u origin main` | 把 `main` 发送到 GitHub，并记住它要发往哪里 |
| `git push` | 把你的新提交发送到 GitHub |

## 自测题 {#quiz}

```quiz
? `origin` 是什么？
- [ ] 一个特殊的分支
- [x] 你的远程仓库的简短名字，也就是你的仓库在 GitHub 上的那份副本
- [ ] 仓库里的第一个提交
> `origin` 只是一个地址的昵称，由 `git remote add` 设置。它只是惯用的名字，不是规定。

? 在这里，为什么新的 GitHub 仓库要在不带 README 的情况下创建？
- [ ] 公开仓库里不允许有 README
- [x] 你的项目已经有了历史记录；在 GitHub 上创建的 README 会开始另一段历史，你的第一次推送就会被拒绝
- [ ] README 会让仓库变成私有的
> 如果你是在 GitHub 上新建一个项目，添加 README 没有问题。如果你要上传一个已有的项目，就从一个空仓库开始。

? `git status` 显示“Your branch is ahead of 'origin/main' by 2 commits”。这是什么意思？
- [ ] GitHub 上有两个你没有的提交
- [x] 你有两个提交还不在 GitHub 上；`git push` 会把它们发送过去
- [ ] 你有两个文件没有保存
> “ahead”（领先）表示你有 GitHub 没有的提交。反过来，“behind”（落后）表示 GitHub 上有你还没有的提交；`git pull`（第 9 课）会把它们带过来。

? 你提交了一个修改，但没有推送。它在 GitHub 上吗？
- [ ] 在，提交会自动发送到 GitHub
- [x] 不在，在你推送之前，它只在你的电脑上
- [ ] 只有仓库是公开的时候才在
> 提交是把修改保存在你的电脑上。推送才会把提交复制到 GitHub。
```
