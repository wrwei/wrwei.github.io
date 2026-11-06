---
title: 从容应对合并冲突
lead: 故意制造一个合并冲突，看懂 Git 在问你什么，在 VS Code 中解决它，然后完成合并。
minutes: 30
needs: 第 5 课（分支与合并）
goals:
  - 理解冲突为什么会发生，以及为什么它很正常
  - 看懂 Git 写进文件的冲突标记
  - 在 VS Code 中解决冲突并完成合并
  - 用 `git merge --abort` 中止一次你不想完成的合并
---

## 什么是冲突？ {#what}

在第 5 课里，Git 自己就把两个分支（branch）合在了一起，因为它们改的是 `index.html` 的不同部分。可如果两个分支以不同的方式修改了**同一行**呢？Git 没法知道你想要哪个版本，所以它会停下来问你。这就是**合并冲突**（merge conflict）。

冲突不是错误，没有任何东西坏掉或丢失。这只是 Git 在说：“你来决定。”每个用 Git 的人都会遇到冲突；只要你解决过一次，它们就不再可怕了。所以，现在就来故意制造一个。

## 故意制造一个冲突 {#make}

在 VS Code 中打开 `my-page`，并打开一个终端（terminal）。首先，建一个修改标题的分支：

```terminal
$ git switch -c new-heading
Switched to a new branch 'new-heading'
```

修改 `index.html` 里的 `<h1>` 那一行：

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
$ git commit -m "Change the heading"
[new-heading e54afda] Change the heading
 1 file changed, 1 insertion(+), 1 deletion(-)
```

现在回到 `main`，用另一种方式修改**同一行**：

```terminal
$ git switch main
Switched to branch 'main'
```

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello and welcome!</h1>
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
$ git commit -m "Make the heading friendlier"
[main 822c471] Make the heading friendlier
 1 file changed, 1 insertion(+), 1 deletion(-)
```

现在来合并，看着 Git 停下来：

```terminal
$ git merge new-heading
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

“CONFLICT ... in index.html”（index.html 中有冲突）：Git 把能合并的部分都合并了，剩下的留给你。这次合并现在**正在进行中**：Git 在等你把它完成。在 Windows 上，Git Bash 的提示符（prompt）会一直显示 `(main|MERGING)`，直到合并完成或被中止。

## 看看 Git 需要你做什么 {#status}

和往常一样，`git status` 会给你解释：

```terminal
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

“Both modified”（双方都已修改）表示两个分支都修改了 `index.html`，而且改法 Git 没办法自动合在一起。括号里的提示给出了做法：解决冲突，对文件执行 `git add`，然后执行 `git commit`。或者中止合并。

## 紧急出口：git merge --abort {#abort}

解决冲突之前，先试试这个紧急出口，这样你就知道它管用。如果你正合并到一半，想停下来，比如因为不确定哪个版本才对，`git merge --abort` 会把一切带回到你输入 `git merge` 之前的样子：

```terminal
$ git merge --abort
$ git status
On branch main
nothing to commit, working tree clean
```

一切都回到了合并之前的状态：你的标题又变回了“Hello and welcome!”。什么都没有丢，你随时可以再合并。现在就再合并一次：

```terminal
$ git merge new-heading
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

还是同一个冲突，等着你来解决。

## 读懂冲突 {#markers}

在 VS Code 中打开 `index.html`。Git 已经把两个版本都写进了文件，夹在几行标记之间：

```file index.html check
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<<<<<<< HEAD
  <h1>Hello and welcome!</h1>
=======
  <h1>Welcome to my page!</h1>
>>>>>>> new-heading
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

::: figure id=fig-06-1
冲突的结构。`<<<<<<< HEAD` 和 `=======` 之间是你的版本，也就是你所在的分支，这里是 `main`。`=======` 和 `>>>>>>> new-heading` 之间是你要合并进来的那个分支的版本。标记以外的内容都已经顺利合并了。
:::

这三行标记不是你页面的一部分。你要做的，是把从 `<<<<<<<` 到 `>>>>>>>` 的所有内容换成你想要的文字，并删掉这些标记。

VS Code 能帮上忙。它会用颜色区分两个版本，并在它们上方放几个可以点击的链接：

- **Accept Current Change**（采用当前更改）保留你的版本（来自 `HEAD`，也就是你所在的分支）。
- **Accept Incoming Change**（采用传入的更改）保留你要合并进来的那个分支的版本。
- **Accept Both Changes**（保留双方更改）把两个版本都保留，一个接着一个。
- **Compare Changes**（比较变更）把两个版本并排显示。

VS Code 可能还会显示一个 **Resolve in Merge Editor**（在合并编辑器中解析）按钮。你不需要它：那几个链接更简单。

## 解决冲突 {#resolve}

决定你想要哪个标题。这里保留“Welcome to my page!”：点击 **Accept Incoming Change**。你也可以手动编辑文件：删掉标记行和你不想要的那一行。无论用哪种方法，文件最后都必须是下面这样，不留任何标记：

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

你并不局限于这两个版本。你也可以自己写第三个标题：你在文件里留下什么，合并的结果就是什么。

::: trouble
**我点错了链接。**按 <kbd>Ctrl</kbd>+<kbd>Z</kbd>（Mac 上是 <kbd>Cmd</kbd>+<kbd>Z</kbd>）撤销（undo），或者手动编辑文件，直到它和上面的一样。
:::

::: pitfall
对有冲突的文件执行 `git add` 之前，先检查有没有留下标记行：一行忘了删的 `=======` 会出现在你的页面上。在 VS Code 中搜索这个文件（<kbd>Ctrl</kbd>+<kbd>F</kbd>，Mac 上是 <kbd>Cmd</kbd>+<kbd>F</kbd>），查找 `<<<<<<<`、`=======` 和 `>>>>>>>`。
:::

添加这个文件，就是告诉 Git 冲突已经解决了：

```terminal
$ git add index.html
$ git status
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
	modified:   index.html
```

“All conflicts fixed”（所有冲突都已解决）。用 `git commit` 完成合并，不要加 `-m`。输入之前先读完这一段：和第 5 课一样，VS Code 会打开一个标签页，这次叫 `COMMIT_EDITMSG`。它的第一行 `Merge branch 'new-heading'` 就是提交信息。下面那些以 `#` 开头的行是说明，Git 不会把它们写进提交（commit）里；其中一行提到了 `git update-ref`，你用不着它。关闭标签页就表示接受这条提交信息，提交随之完成。然后点回终端。

```terminal
$ git commit
[main 10984c7] Merge branch 'new-heading'
```

```terminal
$ git log --oneline --graph -4
*   10984c7 (HEAD -> main) Merge branch 'new-heading'
|\
| * e54afda (new-heading) Change the heading
* | 822c471 Make the heading friendlier
|/
*   618e8f4 Merge branch 'add-hobbies'
|\
```

`-4` 只显示最新的四个提交；最下面的几条线通向更早的提交。你解决了你的第一个冲突。删除这个分支：

```terminal
$ git branch -d new-heading
Deleted branch new-heading (was e54afda).
```

::: trouble
**`fatal: cannot switch branch while merging`**（致命错误：合并过程中不能切换分支）、`error: Merging is not possible because you have unmerged files`（错误：无法合并，因为你有未合并的文件）或 `fatal: You have not concluded your merge (MERGE_HEAD exists)`（致命错误：你还没有完成合并，MERGE_HEAD 存在）。合并还在进行中。要么完成它（修好文件，执行 `git add` 和 `git commit`），要么用 `git merge --abort` 中止它。Git 也会建议 `git merge --quit`，但不要用它：它会把合并到一半的内容留在你的文件里。

**浏览器里的页面显示了 `<<<<<<< HEAD`。**标记行还在文件里。把它们删掉，然后执行 `git add index.html`。如果合并还在进行中，`git commit` 会完成它。如果你已经提交了这次合并，就把修复保存为一个新提交：`git commit -m "Remove conflict markers"`。
:::

## 减少冲突 {#fewer}

冲突没法完全避免，但这些习惯能让冲突变得又少又小：

- **经常提交小改动**，而不是到最后才提交一个巨大的改动。
- **经常合并**，免得分支之间一连几周越走越远。
- 和别人合作时，**开始工作前先拿到他们的最新改动**（第 9 课），并商量好谁负责哪一部分。

## 小结 {#summary}

- 当两个分支以不同方式修改了同样的行时，就会发生**冲突**。Git 会请你来选择；什么都不会丢。
- 在文件里，从 `<<<<<<< HEAD` 到 `=======` 是你的版本；从 `=======` 到 `>>>>>>> branch` 是传入的版本。
- 解决方法：把文件改成你想要的样子（VS Code 的 **Accept ...** 链接能帮上忙），删掉标记，对文件执行 `git add`，然后执行 `git commit`。
- `git merge --abort` 会取消正在进行的合并。

| 命令 | 作用 |
|---|---|
| `git status` | 合并过程中：显示哪些文件有冲突 |
| `git add FILE` | 把一个文件的冲突标记为已解决 |
| `git commit` | 用 Git 准备好的提交信息完成合并 |
| `git merge --abort` | 取消合并，回到合并之前的状态 |

## 自测题 {#quiz}

```quiz
? Git 什么时候会报告合并冲突？
- [ ] 只要两个分支修改了同一个文件
- [x] 当两个分支以不同方式修改了一个文件中同样的行时
- [ ] 当一个分支上有不止一个提交时
> 对同一个文件不同部分的修改可以顺利合并，就像第 5 课那样。

? 发生冲突时，`<<<<<<< HEAD` 和 `=======` 之间是哪个版本？
- [x] 你所在分支的版本
- [ ] 你要合并进来的那个分支的版本
- [ ] 两个分支最后一个共同提交里的版本
> `HEAD` 表示你现在所在的位置，所以这是你当前分支的版本。传入的版本在 `=======` 下面。

? 你已经修好了文件。接下来的两步是什么？
- [ ] 再执行一次 `git merge`，然后 `git push`
- [x] 对文件执行 `git add`，然后 `git commit`
- [ ] 对文件执行 `git restore`，然后 `git commit`
> `git add` 告诉 Git 冲突已经解决；`git commit` 完成合并。

? 你解决冲突解决到一半，想以后再从头来。该用哪个命令（command）？
- [ ] `git restore .`
- [ ] `git branch -d`
- [x] `git merge --abort`
> 它会把一切恢复到你输入 `git merge` 之前的样子。
```
