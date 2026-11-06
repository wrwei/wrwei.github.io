---
title: 保存改动，回顾历史
lead: 修改你的网页，准确看清改了什么，保存更多快照，回看以前的快照，再丢弃一个你不想要的改动。
minutes: 40
needs: 第 3 课（已有一个提交的 `my-page` 仓库）
goals:
  - 用 `git diff` 查看你改了什么
  - 用 `git add .` 保存更多提交，包括一个新文件
  - 用简短的形式列出历史记录，并查看某一个提交的内容
  - 用 `git restore` 丢弃还没有提交的改动
  - 写出日后对你有帮助的提交信息
---

## 从上次停下的地方继续 {#start}

在 VS Code 中打开你的项目：**File**（文件）> **Open Folder...**（打开文件夹），选择 `my-page`。然后通过 **Terminal**（终端）> **New Terminal**（新建终端）打开终端，检查一切是否还是你上次离开时的样子：

```terminal
$ git status
On branch main
nothing to commit, working tree clean
```

“Working tree clean”（工作区干净）：自上次提交（commit）以来，什么都没有改动。很好。

::: tip
VS Code 会记住你打开过的文件夹。下次用 **File** > **Open Recent**（打开最近的文件）就能很快回到 `my-page`。
:::

## 修改你的网页 {#edit}

在 `index.html` 里加一行关于你自己的话。下面的方框显示了整个文件，要添加的那一行已经高亮。如果你想让自己的输出和本课完全一致，就用这段文字。

修改文件最稳妥的办法如下，本课和以后每一课都适用：点击方框上的**复制**按钮，在 VS Code 里点一下 `index.html`，按 <kbd>Ctrl</kbd>+<kbd>A</kbd>（Mac 上按 <kbd>Cmd</kbd>+<kbd>A</kbd>）选中全部内容，再按 <kbd>Ctrl</kbd>+<kbd>V</kbd>（<kbd>Cmd</kbd>+<kbd>V</kbd>）粘贴覆盖。这样文件就和方框里的完全一样了。如果你改为自己输入这一行，要记住：你一输入 `<p>`，VS Code 就会自动补上结束标签 `</p>`，所以只需接着输入后面那句话。

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
  <p>I like walking, photography and good coffee.</p>
</body>
</html>
```

问问 Git 看到了什么：

```terminal
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

Git 知道 `index.html` 处于**已修改**（modified）状态：它和上一次提交时不一样了。这个改动“not staged”（未暂存）：它在你的工作文件夹（working folder）里，但还不在暂存区（staging area）里。

## 准确查看改了什么：git diff {#diff}

`git status` 告诉你*哪些*文件改了，`git diff` 则告诉你*怎么*改的：

```terminal
$ git diff
diff --git a/index.html b/index.html
index 800ba6d..7baeae6 100644
--- a/index.html
+++ b/index.html
@@ -7,5 +7,6 @@
 <body>
   <h1>Hello, I'm learning Git!</h1>
   <p>This is my first web page.</p>
+  <p>I like walking, photography and good coffee.</p>
 </body>
 </html>
```

看起来很专业，但你只需要看懂三点：

::: figure id=fig-04-2
怎样阅读 `git diff`。开头几行写明是哪个文件。以 `+` 开头的行是添加的，以 `-` 开头的行是删除的，以空格开头的行没有改动：Git 会显示其中几行，好让你看出改动在哪里。
:::

- 前四行说明这是哪个文件。`index` 那一行上的数字不用管。
- `@@ -7,5 +7,6 @@` 说明改动在文件里的位置：大约第 7 行。
- 接下来是各行内容本身：`+` 表示添加，`-` 表示删除，空格表示这一行没有变化。

在你的终端里，添加的行是绿色的，删除的行是红色的。

::: tip
VS Code 也能用图形的方式显示同样的内容。点击左侧栏里的 **Source Control**（源代码管理）图标（样子像一条分叉的线），然后点击“Changes”（更改）下面的 `index.html`。VS Code 会把新旧两个版本并排显示出来。要回到你的文件，点击同一栏最上面的图标（两张纸）。
:::

::: trouble
**`git diff` 什么也没输出。**要么是改动还没保存（VS Code 里文件标签上有个圆点，就表示还没保存：按 <kbd>Ctrl</kbd>+<kbd>S</kbd>，Mac 上按 <kbd>Cmd</kbd>+<kbd>S</kbd>），要么是你已经运行过 `git add`：`git diff` 只显示还没暂存的改动。要查看已暂存的改动，请用 `git diff --staged`。

**底部出现了 `:` 或 `(END)`，我没法输入。**输出比屏幕还长。按 <kbd>q</kbd>。
:::

## 保存这个改动 {#commit}

和之前一样，分两步：

```terminal
$ git add index.html
$ git commit -m "Add a sentence about me"
[main 358630b] Add a sentence about me
 1 file changed, 1 insertion(+)
```

现在有两个提交了。每一个都是一个快照（snapshot），你随时可以回到那里。

## 添加第二个文件 {#css}

给你的网页加点颜色。新建一个叫 `style.css` 的文件，方法和创建 `index.html` 时一样：在 Explorer（资源管理器）中点击 **New File...**（新建文件）。然后把下面这段文字粘贴进去：

```file style.css
body {
  font-family: sans-serif;
  max-width: 40em;
  margin: 2em auto;
  padding: 0 1em;
  background: #fdfaf3;
  color: #222;
}

h1 {
  color: #2a6f97;
}
```

接着让网页用上它：把高亮的那一行加到 `index.html` 里（复制方框里的内容，在文件中全选，再粘贴）。

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, I'm learning Git!</h1>
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
</body>
</html>
```

如果你的网页正在浏览器里打开着，刷新一下（按 <kbd>F5</kbd>，Mac 上按 <kbd>Cmd</kbd>+<kbd>R</kbd>）：背景变成奶油色，字体变了，标题变成蓝色，文字排成一栏，位于窗口正中。

```terminal
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	style.css

no changes added to commit (use "git add" and/or "git commit -a")
```

一个文件被修改了，另一个是新文件。它们应该放进同一个快照，因为它们合起来是一个改动：“添加颜色”。你可以一个一个地添加，也可以一次全部添加：

```terminal
$ git add .
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html
	new file:   style.css
```

`.` 表示“这个文件夹”，所以 `git add .` 会添加这个文件夹里的所有改动。这样很快，但一定要先运行 `git status`，确保你添加的只是你想添加的东西。

```terminal
$ git commit -m "Add colours with a style sheet"
[main f952430] Add colours with a style sheet
 2 files changed, 13 insertions(+)
 create mode 100644 style.css
```

## 回顾你的历史记录 {#oneline}

`git log` 会为每个提交显示很多信息。加上 `--oneline`，每个提交就只占一行：

```terminal
$ git log --oneline
f952430 (HEAD -> main) Add colours with a style sheet
358630b Add a sentence about me
c50e3a0 Add my first web page
```

最新的在最前面。每一行开头是提交的短哈希值（short hash），后面是它的提交信息。你可以把历史记录想象成一条链：

::: figure id=fig-04-1
你的历史记录是一条由提交组成的链。每个提交都是整个项目的完整快照，带有一个哈希值和一条提交信息，并指回它的前一个提交。`main` 是贴在最新提交上的标签，`HEAD` 标出你当前所在的提交。
:::

要查看某一个提交的内容，就把它的哈希值交给 `git show`。请使用**你自己**列表里的哈希值，不要用这里显示的那个：

```terminal
$ git show 358630b
commit 358630b7b7a64b3326a6d4c22d224a02ffaaf8a9
Author: Your Name <12345678+your-username@users.noreply.github.com>
Date:   Thu Nov 5 10:05:00 2026 +0000

    Add a sentence about me

diff --git a/index.html b/index.html
index 800ba6d..7baeae6 100644
--- a/index.html
+++ b/index.html
@@ -7,5 +7,6 @@
 <body>
   <h1>Hello, I'm learning Git!</h1>
   <p>This is my first web page.</p>
+  <p>I like walking, photography and good coffee.</p>
 </body>
 </html>
```

`git show` 先打印这个提交的详细信息，再打印它的差异（diff），也就是那个快照究竟改了什么。

::: tip
你不必输入完整的哈希值。前七个字符就够了，通常连四个字符也行。
:::

::: trouble
**`fatal: ambiguous argument '358630b': unknown revision or path not in the working tree`（有歧义的参数 `358630b`：未知的版本，或者不在工作区中的路径）。**你输入的是本页上的哈希值。你的哈希值和这里的不一样：从你自己的 `git log --oneline` 输出里复制一个。

**输出停住了，底部出现一个 `:`。**这是因为输出比终端面板还长。按 <kbd>Space</kbd> 查看剩下的内容，按 <kbd>q</kbd> 回到提示符（prompt）。想让面板高一些，就把它的上边缘往上拖。
:::

## 丢弃不想要的改动：git restore {#restore}

谁都有搞砸的时候。现在故意搞砸一次：在 `index.html` 里改掉标题，再删掉介绍你自己的那一行，让文件变成下面这样。

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Oops, I broke it</h1>
  <p>This is my first web page.</p>
</body>
</html>
```

```terminal
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

看第二条提示：`git restore` 会丢弃你还没有用 `git add` 添加的改动。这里没有任何已暂存的内容，所以文件会回到你上一次提交时的样子。

```terminal
$ git restore index.html
$ git status
On branch main
nothing to commit, working tree clean
```

看看 VS Code 里的 `index.html`：标题和你写的那句话都回来了。

::: pitfall
`git restore` 会永久丢弃这些改动。Git 没法把它们找回来，因为它们从来没有进入过任何提交。只有在你确定的时候才用它。
:::

## 写出将来的你会感谢的提交信息 {#messages}

过上几个月，关于每一次改动，你还能记得的就只有提交信息了。好的提交信息：

- **说清这个提交做了什么**，写成一条指令：“Add a sentence about me”（添加一句关于我的话）、“Fix the broken link”（修复失效的链接）、“Change the heading colour”（修改标题颜色）；
- **简短**，大约 50 个字符以内，这样在 `git log --oneline` 里能放进一行；
- **只描述一个改动。**如果描述它时需要用到“and”（和），它可能应该是两个提交。

| 不太有用 | 有用 |
|---|---|
| `update`（更新） | `Add a list of hobbies`（添加爱好列表） |
| `stuff`（一些东西） | `Fix the spelling of "photography"`（修正“photography”的拼写） |
| `changes to index and css and README`（对 index、css 和 README 的改动） | 三个提交，每个改动一个 |

## 小结 {#summary}

- `git diff` 显示已经改动但还没暂存的内容：`+` 表示添加，`-` 表示删除。
- `git add .` 暂存文件夹里的所有改动。先检查一下 `git status`。
- `git log --oneline` 列出你的历史记录，每个提交一行；`git show HASH` 显示某一个提交。
- `git restore FILE` 丢弃某个文件里还没暂存的改动。这些改动无法恢复。
- 好的提交信息会简短地说明这个提交做了什么。

| 命令 | 作用 |
|---|---|
| `git diff` | 显示未暂存的改动 |
| `git diff --staged` | 显示已暂存的改动 |
| `git add .` | 暂存当前文件夹里的所有改动 |
| `git log --oneline` | 列出提交，每个一行 |
| `git show HASH` | 显示一个提交及其改动 |
| `git restore FILE` | 丢弃某个文件中未暂存的改动 |

## 自测题 {#quiz}

```quiz
? 在 `git diff` 中，以 `+` 开头的行表示什么？
- [ ] 很重要的一行
- [x] 新添加的一行
- [ ] 提交时会被删除的一行
> `+` 标出添加的行，`-` 标出删除的行。前面是空格的行没有改动。

? 你运行了 `git add index.html`，接着运行 `git diff`，结果什么都没输出。为什么？
- [x] `git diff` 只显示未暂存的改动，而你已经把改动暂存了
- [ ] `git add` 已经保存了提交
- [ ] 改动丢失了
> 改动安全地放在暂存区里。`git diff --staged` 可以显示它。

? 你想看看昨天的某个提交改了什么。该用哪个命令？
- [ ] `git status`
- [ ] `git diff`
- [x] `git show`，后面加上这个提交的哈希值
> `git log --oneline` 能告诉你哈希值；`git show HASH` 显示那个提交的改动。

? 哪一条提交信息更好？
- [ ] `fixed stuff`（修了些东西）
- [x] `Fix the link to the style sheet`（修复指向样式表的链接）
- [ ] `Changed index.html, style.css and README.md and fixed the title`（修改了 index.html、style.css 和 README.md，并修正了标题）
> 它用几个词说清了这个提交做了什么。第三条描述了好几个改动，这些改动最好分成几个单独的提交。
```
