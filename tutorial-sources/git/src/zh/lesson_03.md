---
title: 你的第一个仓库
lead: 为你的项目建一个文件夹，把它变成 Git 仓库，写一个小网页，再为它保存第一个快照。
minutes: 40
needs: 第 2 课（已安装 Git 和 VS Code，并设置好你的名字和邮箱）
goals:
  - 在 VS Code 中打开项目文件夹，并在终端里弄清自己在哪儿
  - 用 `git init` 把文件夹变成 Git 仓库
  - 用 `git status` 查看 Git 注意到了什么
  - 用 `git add` 和 `git commit` 保存快照
  - 用 `git log` 查看你的历史记录
---

## 为项目建一个文件夹 {#folder}

你的项目是一个小小的个人网页，放在一个叫 `my-page` 的文件夹里。

::: where vscode
1. 打开 **File**（文件）菜单，点击 **Open Folder...**（打开文件夹）。
2. 在弹出的窗口中，进入你的主文件夹（home folder），也就是以你的用户名命名的那个文件夹：
   - Windows：点击窗口顶部的地址栏，输入 `%USERPROFILE%`，然后按 <kbd>Enter</kbd>。
   - macOS：按 <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd>。
   - Linux：点击左侧列表中的 **Home**（主文件夹）。
3. 在这里新建一个叫 `my-page` 的文件夹：点击 **New folder**（新建文件夹）按钮（Mac 上是 **New Folder**；Linux 上是那个带加号的文件夹图标），输入 `my-page`，然后确认。
4. 选中 `my-page`，点击 **Open**（打开）；在 Windows 上，这个按钮叫 **Select Folder**（选择文件夹）。
5. VS Code 会问：“Do you trust the authors of the files in this folder?”（你信任此文件夹中文件的作者吗？）作者就是你自己，所以点击 **Yes, I trust the authors**（是的，我信任这些作者）。
6. 打开终端：**Terminal**（终端）> **New Terminal**（新建终端）。
:::

<!-- replay:
mkdir -p ~/my-page
@cd ~/my-page
-->

终端会在你的项目文件夹里打开。想确认自己在哪儿，就输入 `pwd`（“print working directory”的缩写，意思是显示当前所在的文件夹）：

```terminal
$ pwd
/Users/you/my-page
```

输出的就是你这个文件夹的路径（path）。它以你的主文件夹开头，所以你的输出会和这里略有不同：在 Windows 上类似 `/c/Users/you/my-page`，在 Linux 上类似 `/home/you/my-page`。

现在输入 `ls`（“list”，列出）看看文件夹里有什么：

```terminal
$ ls
```

什么都没有输出，因为文件夹是空的。很快就不是这样了。

::: tip
每当你不确定自己在哪儿，就输入 `pwd` 和 `ls` 这两条命令。终端里的错误，大多是因为命令在另一个文件夹里运行了，而不是在你想要的那个文件夹里。
:::

## 把文件夹变成仓库 {#init}

到目前为止，`my-page` 只是一个普通的文件夹。问问 Git 它怎么看这个文件夹：

```terminal
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

这条消息看起来很吓人，其实它的意思只是“Git 没有在管理这个文件夹”。每当你在错误的文件夹里运行 Git 命令，都会看到它，所以认识它很有用。

要让 Git 管理这个文件夹，输入：

```terminal
$ git init
Initialized empty Git repository in /Users/you/my-page/.git/
```

在 Windows 上，Git 会按 Windows 的写法显示同一个路径：`C:/Users/you/my-page/.git/`。

`git init`（“initialise”，初始化）会把文件夹变成一个**仓库**（repository），也就是 Git 会为它保存历史记录的文件夹。每个项目只需要这样做一次。

Git 把这些历史记录保存在项目里一个叫 `.git` 的隐藏文件夹中。`ls -a` 会连隐藏文件也一起列出来：

```terminal
$ ls -a
.  ..  .git
```

（`.` 表示“这个文件夹”，`..` 表示“上一级文件夹”，不用管它们。在 Windows 的 Git Bash 里，文件夹名后面会带一个 `/`：`./  ../  .git/`。）你永远不需要打开或修改 `.git` 里的任何东西。VS Code 不会在文件列表里显示它，这样你就不会误删它。

::: pitfall
删除 `.git` 文件夹，就会删掉你的全部历史记录。你的文件还在，但 Git 会忘掉每一个快照（snapshot）。
:::

再问一次 Git：

```terminal
$ git status
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

这次 Git 正常回答了。“On branch main”（在 main 分支上）告诉你项目主线的名字是 main，这是你在第 2 课设置的；分支（branch）会在第 5 课讲到。“No commits yet”（还没有提交）表示到目前为止还没有任何快照。Git 把快照叫作**提交**（commit）。

::: trouble
**`git init` 显示“Reinitialized existing Git repository”（重新初始化了已有的 Git 仓库）。**你运行了两次，这没有任何害处。

**`git init` 消息里的路径不是你的 `my-page` 文件夹。**你是在另一个文件夹里运行的，现在那个文件夹变成了仓库。如果那是你的主文件夹，就把这一步撤销。输入 `pwd`，确认输出的是你的主文件夹：它以你的用户名结尾，而不是以 `my-page` 结尾。然后输入 `rm -rf .git`。这只会删除 Git 刚在那里开始记录的历史，你的文件不会受影响。之后按上面的步骤，在 VS Code 中打开 `my-page`。
:::

## 编写你的网页 {#page}

网页就是一个文件名以 `.html` 结尾的文本文件。

::: where vscode
1. 左侧的文件列表叫作 **Explorer**（资源管理器）。把鼠标移到 `MY-PAGE` 标题上，点击 **New File...**（新建文件）图标（一张带加号的纸）。如果看不到文件列表，就点击最左侧窄栏里最上面的图标（两张纸）。
2. 输入文件名 `index.html`，按 <kbd>Enter</kbd>。文件会在编辑器中打开。
3. 点击下面方框上的**复制**按钮，在 VS Code 里点一下这个空文件，然后按 <kbd>Ctrl</kbd>+<kbd>V</kbd> 粘贴（Mac 上按 <kbd>Cmd</kbd>+<kbd>V</kbd>）。你在第 2 课已经打开了 Auto Save（自动保存），所以 VS Code 会替你保存。
:::

::: tip
文件内容要粘贴，不要自己输入。你输入 HTML 时，VS Code 会自动补上 `</p>` 这样的结束标签，所以如果你自己把整行都打出来，就会多出一个。
:::

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My page</title>
</head>
<body>
  <h1>Hello, I'm learning Git!</h1>
  <p>This is my first web page.</p>
</body>
</html>
```

学这个系列不需要懂 HTML。要紧的只有 `<h1>`（标题）和 `<p>`（段落）这两行。你以后可以把网页改成中文，但现在请先保留这些英文：后面几课的输出都以它们为准。

想看看它作为网页是什么样子吗？在 Explorer 中右键点击 `index.html`，Windows 上选择 **Reveal in File Explorer**（在文件资源管理器中显示），macOS 上选择 **Reveal in Finder**（在访达中显示），Linux 上选择 **Open Containing Folder**（打开所在的文件夹）。然后双击 `index.html`，它就会在你的网页浏览器中打开。

## 问问 Git 看到了什么 {#status}

点一下底部的终端面板，这样你输入的内容才会进到终端里，而不是进到你的文件里。然后输入：

```terminal
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	index.html

nothing added to commit but untracked files present (use "git add" to track)
```

Git 注意到了这个新文件，但它是**未跟踪**（untracked）的：Git 看得见它，但还没有开始管理它。注意，Git 在括号里告诉了你下一步该做什么。`git status` 经常这样做；拿不准的时候，就运行它，读一读这些提示。

::: trouble
**在 Mac 上，`git status` 还列出了 `.DS_Store`。**这是 Finder（访达）创建的隐藏文件。输入[第 2 课第 6 步](lesson_02_ZH.html#defaults)中“在 Mac 上，还要多做一项设置”里的两条命令，然后再运行一次 `git status`：`.DS_Store` 就不会再出现了。
:::

## 选好要放进快照的内容：git add {#add}

保存快照分两步。第一步，选好要放进快照的内容：

```terminal
$ git add index.html
```

没有输出，就说明成功了。再问一次 Git：

```terminal
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   index.html
```

`index.html` 移到了“Changes to be committed”（要提交的改动）下面。Git 把这个地方叫作**暂存区**（staging area）：这里放着你为下一个快照选好的东西。

::: analogy
想想拍合影的场景。`git add` 是请人走进画面，`git commit` 是按下快门。没有走进画面的人不会出现在照片里，哪怕他就在房间里。
:::

为什么要分两步？因为你常常会改动好几个文件，却想把它们分成几个各有意义的快照来保存，每次只存其中几个。目前，你每次都会先 `git add`，再 `git commit`。

::: trouble
**`fatal: pathspec 'index.html' did not match any files`（路径 `index.html` 没有匹配到任何文件）。**Git 在这里找不到叫这个名字的文件。用 `ls` 检查一下拼写。如果 `ls` 没有列出 `index.html`，说明文件保存到了别的文件夹，或者用了别的名字：看看 VS Code 标签页上和 Explorer 里显示的文件名。
:::

## 拍下快照：git commit {#commit}

```terminal
$ git commit -m "Add my first web page"
[main (root-commit) c50e3a0] Add my first web page
 1 file changed, 11 insertions(+)
 create mode 100644 index.html
```

`git commit` 负责拍下快照，`-m`（“message”，提交信息）给它加上一段简短的说明。每个提交都需要一条提交信息。把它写成一条指令，说清这个提交做了什么，比如“Add my first web page”（添加我的第一个网页）。

输出的意思是：

- `main` 是这个提交所在的分支。`root-commit`（根提交）表示这是第一个提交。
- `c50e3a0` 是这个提交的**哈希值**（hash），也就是它独一无二的名字。你的会不一样：它是根据内容、你的名字和精确的时间算出来的。
- `1 file changed, 11 insertions(+)`：改动了一个文件，新增了 11 行。
- `create mode 100644 index.html`：一个新文件。那个数字可以不用管。

再查看一次状态：

```terminal
$ git status
On branch main
nothing to commit, working tree clean
```

“Working tree clean”（工作区干净）表示你的文件和上一个快照里的完全一样。每完成一段工作，都争取回到这个平静的状态。“Working tree”（有些提示里写作“working directory”）是 Git 对你的工作文件夹（working folder）的叫法，也就是你能看到、能编辑的那些文件。

::: trouble
**`Author identity unknown`（作者身份未知）和“Please tell me who you are”（请告诉我你是谁）。**Git 还不知道你的名字和邮箱。完成第 2 课的第 5 步，然后再运行一次 `git commit` 命令。

**我输入 `git commit` 时没有加 `-m`，VS Code 里打开了一个叫 `COMMIT_EDITMSG` 的标签页。**Git 在向你要提交信息。在第一行输入信息，保存文件，然后关闭这个标签页。标签页一关闭，提交就完成了。如果想放弃，什么都不输入，直接关闭标签页即可。

**`nothing added to commit`（没有添加要提交的内容）。**你跳过了 `git add`。先运行 `git add index.html`，再提交。
:::

## 查看历史记录：git log {#log}

```terminal
$ git log
commit c50e3a0c6ce098bd6f6ca0fa80fcc20a3965c2d8 (HEAD -> main)
Author: Your Name <12345678+your-username@users.noreply.github.com>
Date:   Wed Nov 4 10:11:00 2026 +0000

    Add my first web page
```

`git log` 会列出你的提交，最新的排在最前面。每个提交会显示：

- `commit` 和完整的哈希值。Git 通常只显示前七个字符，比如 `c50e3a0`。
- `(HEAD -> main)`：这是你当前所在的提交，位于 `main` 的最前端。第 5 课会解释它。
- `Author` 和 `Date`：谁在什么时候做了这个提交。
- 提交信息，缩进显示。

::: tip
历史记录比屏幕还长时，`git log` 会一次只显示一屏，然后停下来等你。按 <kbd>Space</kbd> 查看更多，按 <kbd>q</kbd> 退出并回到提示符（prompt）。
:::

## 你的工作所在的三个地方 {#areas}

现在你已经认识了 Git 关心的三个地方：

::: figure id=fig-03-1
三个区域。你在**工作文件夹**里编辑文件。`git add` 把改动复制到**暂存区**，你在这里收集要放进下一个快照的内容。`git commit` 把暂存区里的所有内容保存为**仓库**中的一个新提交，仓库就在 `.git` 文件夹里。
:::

| 地方 | 存放什么 | 怎样放进去 |
|---|---|---|
| 工作文件夹 | 你的文件，就是你在 VS Code 里看到的样子 | 你编辑它们 |
| 暂存区 | 为下一个提交选好的改动 | `git add` |
| 仓库 | 你做过的每一个提交 | `git commit` |

`git status` 会告诉你此刻每个地方都有什么。在下面试一试：按任意顺序点击按钮，看看 `index.html` 在哪里，`git status` 又说了什么。

::: widget name=three-areas
一个只有一个文件的小仓库模型。试试先点 **编辑 index.html**，然后不点 **git add**，直接点 **git commit**；再试试点过 **git add** *之后*，再编辑一次文件。演示里 `git status` 的文字，就是 Git 在每种情况下实际打印的内容。
:::

## 小结 {#summary}

- `git init` 把一个文件夹变成仓库，每个项目只需一次。历史记录就保存在 `.git` 里。
- 保存快照分两步：`git add` 负责选择，`git commit -m "..."` 负责保存。
- `git status` 显示 Git 看到了什么，还会提示你下一步该做什么。要经常运行它。
- `git log` 列出你的提交，最新的排在最前面。

| 命令 | 作用 |
|---|---|
| `pwd` | 显示终端当前所在的文件夹 |
| `ls`、`ls -a` | 列出文件夹里的文件（`-a`：连隐藏文件也列出） |
| `git init` | 把当前文件夹变成仓库 |
| `git status` | 显示哪些内容有改动、哪些已暂存 |
| `git add FILE` | 把一个文件的改动放进暂存区 |
| `git commit -m "MESSAGE"` | 把已暂存的改动保存为一个提交 |
| `git log` | 列出提交（按 <kbd>q</kbd> 退出） |

## 自测题 {#quiz}

```quiz
? 你看到了 `fatal: not a git repository`。最可能的原因是什么？
- [ ] 没有安装 Git
- [x] 终端所在的文件夹不是仓库
- [ ] 仓库坏了
> 这几乎总是说明终端在错误的文件夹里。先用 `pwd` 检查，再打开你的项目文件夹。

? 你新建了 `about.html`，然后马上用 `git commit -m "Add about page"` 提交。Git 显示“nothing added to commit”。为什么？
- [ ] 提交信息太短了
- [x] 你没有先运行 `git add about.html`，所以暂存区里什么都没有
- [ ] 新文件必须用 `git init` 来提交
> 提交保存的是暂存区里的内容。先添加文件，再提交。

? “working tree clean”是什么意思？
- [ ] `.git` 文件夹是空的
- [ ] 所有文件都被删除了
- [x] 你的文件和上一次提交时完全一样
> 自上一个快照以来什么都没有改动，暂存区里也没有等待提交的内容。

? 为什么你的提交哈希值和本课里的不一样？
- [ ] 你的 Git 版本不同
- [x] 哈希值是根据内容、作者和精确的时间算出来的，所以每个提交都有自己的哈希值
- [ ] 你做错了什么
> 哈希值是独一无二的名字。两个人在不同的时间做出“同样”的提交，得到的哈希值也不同。
```
