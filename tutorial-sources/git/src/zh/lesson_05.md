---
title: 分支：放心尝试新想法
lead: 在分支上给你的页面试一个新外观，一秒钟就能在两个版本之间切换，最后把改动并入你的主线。
minutes: 40
needs: 第 4 课（`my-page` 仓库，里面已有三个提交）
goals:
  - 理解什么是分支，以及 `HEAD` 是什么意思
  - 创建分支，并在分支之间切换
  - 用 `git merge` 把一个分支上的工作并入 `main`
  - 认出快进合并和合并提交
  - 删除用完的分支
---

## 为什么要用分支？ {#why}

假设你想给页面试一套深色配色，又不确定自己会不会喜欢。你可以直接修改 `style.css`，如果不喜欢结果，再想办法把改动全部撤销（undo）。或者，你也可以在一个**分支**（branch）上工作：分支是一条独立的工作线，你可以在上面随意尝试，而 `main` 保持原样。

::: figure id=fig-05-1
分支是一个指向提交（commit）的标签。`main` 指向你最新的提交。新分支 `dark-theme` 从同一个提交开始。新的提交会让你所在分支的标签向前移动，`HEAD` 则表明你在哪个分支上。
:::

分支并不是你文件的副本。它只是贴在某个提交上的一个标签，所以创建分支只要一瞬间，而且没有任何代价。你想建多少个都行。

## 查看你的分支 {#list}

像之前一样，在 VS Code 中打开 `my-page`，再打开一个终端（terminal）。然后输入：

```terminal
$ git branch
* main
```

你只有一个分支：`main`。`*` 标出你当前所在的分支。

::: tip
VS Code 会在窗口左下角的状态栏里显示当前分支。每当你不确定自己在哪个分支上，就看一眼那里。
:::

## 创建分支并切换过去 {#create}

```terminal
$ git switch -c dark-theme
Switched to a new branch 'dark-theme'
```

`git switch` 会把你带到另一个分支；`-c`（create，即“创建”）会先把这个分支建出来。分支名里不能有空格，所以用连字符 `-` 代替空格。

```terminal
$ git branch
* dark-theme
  main
```

现在你在 `dark-theme` 上了。除此之外还什么都没变：两个分支指向同一个提交。

## 试试深色主题 {#dark}

修改 `style.css` 中的三个颜色，也就是高亮的那几行（和第 4 课一样，复制这个框里的内容，粘贴覆盖整个文件）：

```file style.css
body {
  font-family: sans-serif;
  max-width: 40em;
  margin: 2em auto;
  padding: 0 1em;
  background: #1e1e2e;
  color: #e6e6e6;
}

h1 {
  color: #8ec5fc;
}
```

在浏览器里刷新页面（如果页面没有打开，就像第 3 课那样打开它）：页面变成深色了。在这个分支上提交这个改动：

```terminal
$ git add style.css
$ git commit -m "Try a dark theme"
[dark-theme 85f8f42] Try a dark theme
 1 file changed, 3 insertions(+), 3 deletions(-)
```

Git 回复的开头部分 `[dark-theme ...]` 确认了这个提交进的是哪个分支。

## 来回切换 {#switch}

现在到了有趣的部分。切换回 `main`：

```terminal
$ git switch main
Switched to branch 'main'
```

在 VS Code 里看看 `style.css`，再在浏览器里刷新页面：浅色又回来了。Git 修改了你的文件，让它们和你切换到的分支一致。再切换一次：

```terminal
$ git switch dark-theme
Switched to branch 'dark-theme'
```

又变成深色了。你在每个分支上的工作都安全地保存在它的提交里；你要哪个版本，`git switch` 就把哪个版本带回来。

要在历史中同时看到两个分支，就让 `git log` 显示所有分支：

```terminal
$ git log --oneline --all
85f8f42 (HEAD -> dark-theme) Try a dark theme
f952430 (main) Add colours with a style sheet
358630b Add a sentence about me
c50e3a0 Add my first web page
```

括号里的标签表示每个分支指向哪里。`HEAD -> dark-theme` 的意思是“你在这里，在 `dark-theme` 上”。

::: keyidea
**`HEAD` 的意思是“你现在所在的位置”。**它指向你所在的分支，而这个分支指向一个提交。你提交时，你所在的分支会向前移到新的提交上，`HEAD` 也随之移动。
:::

::: trouble
**`error: Your local changes to the following files would be overwritten by checkout`**（错误：你对下列文件的本地修改会被检出操作覆盖）。你修改了一个文件但没有提交，而切换分支会覆盖你的改动。先提交它（如果你不想要这个改动，就用 `git restore` 丢弃它），然后再切换。

**`fatal: a branch named 'dark-theme' already exists`**（致命错误：名为 dark-theme 的分支已经存在）。你之前已经创建过它了。不加 `-c` 就能切换过去：`git switch dark-theme`。

**`git switch` 在“Switched to branch”（已切换到分支）前面显示了 `M` 和一个文件名，而且页面还是深色的。**你没有提交对那个文件的改动，所以这个改动跟着你到了另一个分支。切换回去（`git switch dark-theme`），然后在那里对这个文件执行 `git add` 和 `git commit`。
:::

## 把改动并入 main：git merge {#merge}

你喜欢这个深色主题。要把它并入 `main`，就先回到 `main`，再把这个分支**合并**（merge）进来：

```terminal
$ git switch main
Switched to branch 'main'
$ git merge dark-theme
Updating f952430..85f8f42
Fast-forward
 style.css | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)
```

`git merge dark-theme` 的意思是“把 `dark-theme` 上的工作并入我所在的分支”。

“Fast-forward”（快进）是最简单的一种合并。自从 `dark-theme` 创建以来，`main` 上什么都没有发生，所以 Git 只需要把 `main` 这个标签向前移到这个分支最新的提交上。

```terminal
$ git log --oneline
85f8f42 (HEAD -> main, dark-theme) Try a dark theme
f952430 Add colours with a style sheet
358630b Add a sentence about me
c50e3a0 Add my first web page
```

现在两个标签都指向同一个提交。

## 收拾一下：删除分支 {#delete}

这个分支已经完成了它的任务。把这个标签删掉：

```terminal
$ git branch -d dark-theme
Deleted branch dark-theme (was 85f8f42).
```

删掉的只是标签。提交“Try a dark theme”现在已经是 `main` 的一部分，会保留下来。

::: trouble
**`error: the branch '...' is not fully merged`**（错误：这个分支没有完全合并）。如果一个分支上的提交不在你当前的分支里，Git 会拒绝删除它，免得你不小心丢掉工作。先合并它。如果你真的想丢掉那些工作，`git branch -D`（大写的 D）仍然会删除它。
:::

## 两条线都向前走了：合并提交 {#merge-commit}

只有在这期间 `main` 上什么都没发生，才可能快进。但很多时候并非如此。来试一下：为一个爱好列表建一个分支。

```terminal
$ git switch -c add-hobbies
Switched to a new branch 'add-hobbies'
```

把高亮的几行加到 `index.html` 里：

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
$ git commit -m "Add a list of hobbies"
[add-hobbies b8140ac] Add a list of hobbies
 1 file changed, 5 insertions(+)
```

现在回到 `main`，在那里改点别的：页面标题，也就是浏览器在标签页上显示的文字。

```terminal
$ git switch main
Switched to branch 'main'
```

爱好列表从 `index.html` 里消失了：它只存在于 `add-hobbies` 上。修改标题，也就是高亮的那一行：

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, I'm learning Git!</h1>
  <p>This is my first web page.</p>
  <p>I like walking, photography and good coffee.</p>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Change the page title"
[main 15e66cc] Change the page title
 1 file changed, 1 insertion(+), 1 deletion(-)
```

两个分支都从同一个起点向前走了。`--graph` 会把这个情况画出来：

```terminal
$ git log --oneline --graph --all
* 15e66cc (HEAD -> main) Change the page title
| * b8140ac (add-hobbies) Add a list of hobbies
|/
* 85f8f42 Try a dark theme
* f952430 Add colours with a style sheet
* 358630b Add a sentence about me
* c50e3a0 Add my first web page
```

从下往上读：先是四个共同的提交，然后这条线分成了两条。

现在来合并。这次合并需要你做一件事，所以输入命令（command）之前，先读完这一段。Git 会在 VS Code 中打开一个名为 `MERGE_MSG` 的标签页，里面是这次合并的提交信息 `Merge branch 'add-hobbies'`；终端则会显示“hint: Waiting for your editor to close the file...”（提示：正在等待你的编辑器关闭文件……），并停在那里等待。这条提交信息不用改：**关闭这个标签页**（点击标签页上的 ×）。Git 随后会完成合并，那行等待提示会消失，终端会显示下面的内容。输入下一条命令之前，记得先点回终端。

```terminal
$ git merge add-hobbies
Auto-merging index.html
Merge made by the 'ort' strategy.
 index.html | 5 +++++
 1 file changed, 5 insertions(+)
```

“Auto-merging index.html”（正在自动合并 index.html）表示 Git 把这个文件的两个版本合到了一起。这一次 Git 没法只把标签向前移，所以它新建了一个提交，也就是**合并提交**（merge commit），用它把两条线连接起来。“ort”是 Git 合并时所用方法的名字，你可以不用管它。

```terminal
$ git log --oneline --graph
*   618e8f4 (HEAD -> main) Merge branch 'add-hobbies'
|\
| * b8140ac (add-hobbies) Add a list of hobbies
* | 15e66cc Change the page title
|/
* 85f8f42 Try a dark theme
* f952430 Add colours with a style sheet
* 358630b Add a sentence about me
* c50e3a0 Add my first web page
```

现在 `index.html` 里既有新标题，**也有**爱好列表。Git 之所以能把两处改动合在一起，是因为它们在文件的不同部分。

::: figure id=fig-05-2
两种合并。左：`main` 上什么都没发生，所以合并只是把 `main` 标签向前移（快进）。右：两个分支都有新提交，所以 Git 会新建一个有两个父提交的合并提交。
:::

把用完的分支删掉：

```terminal
$ git branch -d add-hobbies
Deleted branch add-hobbies (was b8140ac).
```

::: trouble
**终端显示“Waiting for your editor to close the file...”，然后就没有反应了。**Git 在等你关闭 VS Code 里的 `MERGE_MSG` 标签页。找到这个标签页，把它关掉。

**`error: there was a problem with the editor 'code --wait'`**（错误：编辑器“code --wait”出了问题）。Git 没能启动 VS Code，因为终端找不到 VS Code 的 `code` 命令。在 Mac 上，按第 2 课第 2 步的第 3 项操作；在 Windows 和 Linux 上，把 VS Code 完全关掉，再重新打开。合并还没有完成：等 `code` 能用了，输入 `git commit`，再关闭打开的那个标签页。

**终端里出现了一个奇怪的界面，左边一列全是 `~`。**Git 打开了 Vim 编辑器，因为你还没有设置编辑器（缺少第 2 课里的 `core.editor` 设置）。按 <kbd>Esc</kbd>，输入 `:wq`，再按 <kbd>Enter</kbd>，就能接受这条提交信息并完成合并。然后设置编辑器：`git config --global core.editor "code --wait"`。

**终端顶部显示 `GNU nano`。**这是 Linux 上的同一种情况，只是编辑器换成了 nano。按 <kbd>Ctrl</kbd>+<kbd>X</kbd> 就能接受提交信息并完成合并。然后像上面那样设置编辑器。
:::

## 试一试：图解分支 {#try}

能看见分支，就更容易理解它们。下面的按钮你可以随意使用；每个按钮都会显示它所代表的命令。可以试试这些：

- 在 `main` 上点两次 **Commit**（提交）。然后新建一个分支，在上面提交两次，切换回 `main`，再合并这个分支：这是一次快进。
- 这次在 `main` 和分支上**都**提交，然后合并：这会产生一个合并提交。
- 试着合并一个已经合并过的分支。

::: widget name=branch-graph
这是一个仓库（repository）历史的模型。绿色圆圈是你所在的提交；`HEAD ->` 标出你当前的分支。
:::

## 小结 {#summary}

- **分支**是贴在提交上的一个标签。`main` 是你的主线；其他分支用来尝试新东西。
- `HEAD` 的意思是“你现在所在的位置”。你提交时，你所在的分支会向前移动。
- `git switch` 会修改你的文件，让它们和你切换到的分支一致。
- `git merge BRANCH` 把一个分支上的工作并入你所在的分支：如果在此期间没有别的改动，就**快进**；否则就新建一个**合并提交**。
- `git branch -d` 删除的是标签，提交会保留下来。

| 命令 | 作用 |
|---|---|
| `git branch` | 列出所有分支；`*` 标出你所在的分支 |
| `git switch -c NAME` | 创建一个分支并切换过去 |
| `git switch NAME` | 切换到一个已有的分支 |
| `git merge NAME` | 把分支 `NAME` 并入当前分支 |
| `git branch -d NAME` | 删除一个已经合并过的分支 |
| `git log --oneline --graph --all` | 画出所有分支的历史 |

## 自测题 {#quiz}

```quiz
? 在 Git 里，分支是什么？
- [ ] 放在另一个文件夹（folder）里的、你所有文件的完整副本
- [x] 一个指向提交的标签，你在它上面提交时它会向前移动
- [ ] GitHub 上的一份备份
> 正因为如此，创建分支只要一瞬间，而且没有任何代价。

? 你在 `main` 上运行 `git merge dark-theme`。会发生什么？
- [ ] `main` 上的工作被复制到 `dark-theme`
- [x] `dark-theme` 上的工作被并入 `main`
- [ ] 两个分支互换了位置
> 你是把别的分支合并**进**你所在的分支。所以要先切换到 `main`，再合并另一个分支。

? Git 什么时候会新建合并提交，而不是快进？
- [ ] 每次都会
- [ ] 当分支上有不止一个提交时
- [x] 当两个分支在分开之后都有了新提交时
> 如果只有另一个分支向前走了，Git 只需把你所在分支的标签向前移。如果两个分支都向前走了，就需要一个新提交把它们连接起来。

? 执行 `git branch -d dark-theme` 之后，提交“Try a dark theme”会怎样？
- [x] 它会保留，因为它是 `main` 的一部分
- [ ] 它会被删除
- [ ] 它会被移到一个新分支上
> 删除分支只会删掉标签。如果这个分支上的提交不在你所在的分支里，Git 会拒绝执行 `-d`，所以你不会不小心丢掉它们。
```
