---
title: "在两个地方工作：拉取、推送、克隆"
lead: 把 GitHub 上的修改带到你的电脑上，处理被 GitHub 拒绝的推送，再用 git clone 给你的项目做第二份副本。
minutes: 40
needs: 第 7 课和第 8 课（`my-page` 已经放在 GitHub 上）
goals:
  - 用 `git pull` 把 GitHub 上的新提交带到你的电脑上
  - 理解 GitHub 为什么有时会拒绝推送，并解决这个问题
  - 用 `git clone` 得到任意一个仓库的副本
  - 按照日常流程工作：拉取、工作、提交、推送
---

## 为什么要拉取？ {#why}

在第 7 课中，你用 `git push` 把提交（commit）发送到了 GitHub。不过，GitHub 上的提交也可能不是从你的电脑来的：

- 你在 GitHub 网站上编辑了一个文件；
- 你在另一台电脑上工作，并从那里推送（push）；
- 和你一起工作的人推送了他们的成果。

用 `git pull` 拉取（pull），就能把这些提交带到你的电脑上。第一种情况你会亲手试一试，一个人扮演两个角色，从中也能看懂另外两种情况是怎么回事。

## 在 GitHub 上做的修改 {#web-edit}

GitHub 允许你直接在浏览器里编辑文件。用这个功能给你的 README 加一行：

::: where github
1. 在你的仓库（repository）页面上，点击文件列表中的 `README.md`。
2. 在文件的右上角，点击铅笔图标来编辑它。
3. 在末尾加一个空行，然后加上下面这一行，其中的用户名换成你自己的：`See it live: https://your-username.github.io/my-page/`
4. 点击 **Commit changes...**（提交更改）。会打开一个框，里面已经填好了一条提交信息“Update README.md”（更新 README.md）。不用改它。选择直接提交到 `main` 分支（branch），而不是提交到新分支，然后点击 **Commit changes**。
:::

<!-- replay:
gh-web-edit your-username/my-page main README.md "Update README.md" <<'EOF'
# My page

My first project with Git and GitHub: a small personal web page.

See it live: https://your-username.github.io/my-page/
EOF
-->

你刚刚在 GitHub 上做了一次提交。你的电脑上还没有它：在 VS Code 中看看 `README.md`，新加的那一行并不在。现在问问 Git：

```terminal
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

“Up to date”（一致）？其实不然。`git status` 是拿你的分支和 `origin/main` 比较，而 `origin/main` 是你的电脑对 GitHub 上 `main` 所在位置的**记录**。这份记录只有在 Git 和 GitHub 通信时才会刷新，而自从你上次推送以来，Git 还没有和 GitHub 通信过。所以 `git status` 还无从知道这个新提交。（如果你看到的已经是“Your branch is behind 'origin/main' by 1 commit”，也就是你的分支落后 'origin/main' 1 个提交，那说明 VS Code 已经在后台替你和 GitHub 通信过了。这没关系：继续运行 `git pull` 就行。）

`git pull` 会和 GitHub 通信，更新这份记录，并把新提交带进你的分支：

```terminal
$ git pull
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 441 bytes | 441.00 KiB/s, done.
From https://github.com/your-username/my-page
   a478f84..0399de7  main       -> origin/main
Updating a478f84..0399de7
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
```

前几行是 Git 在下载这个提交。`a478f84..0399de7 main -> origin/main` 表示那份记录被更新了。接着是 `Fast-forward`（快进）：你的 `main` 向前移到新提交上，就像第 5 课里的合并（merge）那样。在 VS Code 中看看 `README.md`：新的那一行出现了。

::: keyidea
**`git status` 只知道 Git 上一次和 GitHub 通信时看到的情况。**要确保你拥有全部内容，就拉取一次。
:::

## 两边都有修改时 {#diverged}

接下来这种情况，每个人第一次碰到时都会吃一惊。在 GitHub 上再做一处修改，同时在你的电脑上做另一处不同的修改，中间**不要**拉取。

先在 GitHub 上操作：

::: where github
像上面那样，在 GitHub 上再次编辑 `README.md`。在末尾加一个空行，然后加上 `Made while learning Git.` 这一行，并直接提交到 `main`。
:::

<!-- replay:
gh-web-edit your-username/my-page main README.md "Update README.md" <<'EOF'
# My page

My first project with Git and GitHub: a small personal web page.

See it live: https://your-username.github.io/my-page/

Made while learning Git.
EOF
-->

然后在你的电脑上，不要拉取，直接给 `index.html` 加一项爱好：

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
  <p>This is my first web page, published with GitHub Pages.</p>
  <p>I like walking, photography and good coffee.</p>
  <h2>My hobbies</h2>
  <ul>
    <li>Walking</li>
    <li>Photography</li>
    <li>Cooking</li>
  </ul>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Add cooking to my hobbies"
[main 2a80ae8] Add cooking to my hobbies
 1 file changed, 1 insertion(+)
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

GitHub 拒绝了这次推送。这不是你的工作出了错，也没有丢失任何东西。GitHub 上有一个你没有的提交（对 README 的修改），你这边也有一个 GitHub 没有的提交（添加 Cooking 的那个）。如果 GitHub 接受了你的推送，它那边的提交就会被丢掉，所以它拒绝了；以 `hint:` 开头的提示也告诉了你该怎么做：先拉取。

::: figure id=fig-09-2
推送为什么会被拒绝。在双方上一次一致之后，两边各自增加了一个提交。`git pull` 把 GitHub 上的提交带到你的电脑上，并把两者合并；这样就没有什么会被丢掉了，`git push` 也就被接受了。
:::

现在拉取。两边都有新提交，所以 Git 会像第 5 课那样创建一个合并提交（merge commit），并在 VS Code 中打开一个 `MERGE_MSG` 标签页，里面的信息是“Merge branch 'main' of https://github.com/your-username/my-page”（合并 https://github.com/your-username/my-page 的 'main' 分支）。关闭这个标签页，拉取就会完成，并显示：

```terminal
$ git pull
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 1), reused 3 (delta 1), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 386 bytes | 386.00 KiB/s, done.
From https://github.com/your-username/my-page
   0399de7..1b84697  main       -> origin/main
Merge made by the 'ort' strategy.
 README.md | 2 ++
 1 file changed, 2 insertions(+)
```

这两处修改在不同的文件里，所以 Git 自己就把它们合并了，并像第 5 课那样创建了一个合并提交。点击回到终端（terminal），然后推送：

```terminal
$ git push
Enumerating objects: 9, done.
Counting objects: 100% (8/8), done.
Delta compression using up to 8 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 745 bytes | 745.00 KiB/s, done.
Total 5 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/your-username/my-page.git
   1b84697..22893c9  main -> main
```

推送被接受了。下面的图展示了刚才发生的事情：

```terminal
$ git log --oneline --graph -4
*   22893c9 (HEAD -> main, origin/main, origin/HEAD) Merge branch 'main' of https://github.com/your-username/my-page
|\
| * 1b84697 Update README.md
* | 2a80ae8 Add cooking to my hobbies
|/
* 0399de7 Update README.md
```

`origin/HEAD` 标出的是 GitHub 首先显示的分支，这里是 `main`。你可以不用管它。（旧版本的 Git 在这里不会显示它。）

::: tip
如果两边改的是同样的几行，`git pull` 就会因为合并冲突（merge conflict）而停下来。第 6 课已经教过你该怎么做：改好文件，运行 `git add`、`git commit`，然后 `git push`。
:::

::: trouble
**`Your local changes to the following files would be overwritten by merge`**（你对下列文件的本地修改会被合并覆盖）。你有还没提交的修改，而拉取会覆盖它们。先提交它们，然后再拉取。

**`fatal: Need to specify how to reconcile divergent branches`**（致命错误：需要指定如何协调分叉的分支）。缺少第 2 课中的 `pull.rebase` 设置。运行 `git config --global pull.rebase false`，然后再拉取一次。
:::

## 第二份副本：git clone {#clone}

要把 GitHub 上的仓库放到一台电脑上（比如一台新的笔记本电脑），或者要得到别人的项目，你就要**克隆**（clone）它。克隆会下载整个仓库，包括它的完整历史记录，并为你设置好 `origin`。

要找到任何一个仓库的地址，就在 GitHub 上打开它的页面，点击绿色的 **Code**（代码）按钮，确认选中的是 **HTTPS**，然后复制地址。

用你自己的项目来试一试，假装你在第二台电脑上。首先往上走一层文件夹（folder），离开 `my-page`，这样副本就不会跑到它里面去：

```terminal
$ cd ..
$ pwd
/Users/you
```

`cd`（“change directory”，切换目录）会把终端移到另一个文件夹，`..` 的意思是“上一层文件夹”。显示的结果应该是你的主文件夹（home folder），而不是 `my-page`；在 Windows 上是 `/c/Users/you`，在 Linux 上是 `/home/you`。

现在开始克隆，把新副本命名为 `my-page-laptop`。输入地址时要换成你自己的用户名：这个框没有**复制**按钮，因为里面写的是 `your-username`。

```terminal nocopy
$ git clone https://github.com/your-username/my-page.git my-page-laptop
Cloning into 'my-page-laptop'...
remote: Enumerating objects: 46, done.
remote: Counting objects: 100% (46/46), done.
remote: Compressing objects: 100% (32/32), done.
remote: Total 46 (delta 15), reused 43 (delta 12), pack-reused 0 (from 0)
Receiving objects: 100% (46/46), 5.05 KiB | 5.05 MiB/s, done.
Resolving deltas: 100% (15/15), done.
```

看看里面有什么。`cd my-page-laptop` 会把终端移到这个副本里。移动的只是终端：VS Code 左边的文件列表显示的仍然是 `my-page`，而你的提示符（prompt）现在以 `my-page-laptop` 结尾，你的命令（command）就是在那里运行的。

```terminal
$ cd my-page-laptop
$ ls
README.md  index.html  style.css
$ git log --oneline -3
22893c9 (HEAD -> main, origin/main, origin/HEAD) Merge branch 'main' of https://github.com/your-username/my-page
2a80ae8 Add cooking to my hobbies
1b84697 Update README.md
$ git remote -v
origin	https://github.com/your-username/my-page.git (fetch)
origin	https://github.com/your-username/my-page.git (push)
```

所有东西都在：文件（列出的顺序可能不一样）、全部历史记录，还有已经连接好的 `origin`。如果是在真正的第二台电脑上，你会在 VS Code 中打开这个文件夹，然后照常工作：拉取、修改、提交、推送。

你已经不需要这个副本了。回到你的项目：

```terminal
$ cd ../my-page
$ pwd
/Users/you/my-page
```

你随时都可以删除 `my-page-laptop` 文件夹：它只是一份副本。要删除它，就在文件资源管理器（File Explorer）、访达（Finder）或“文件”（Files）中打开你的主文件夹，把 `my-page-laptop`（不是 `my-page`！）移到回收站或废纸篓。

::: trouble
**`fatal: destination path 'my-page-laptop' already exists`**（致命错误：目标路径 'my-page-laptop' 已经存在）。那里已经有一个同名的文件夹了。换一个名字，或者先删除旧文件夹。

**副本跑到了 `my-page` 里面。**你克隆之前没有先运行 `cd ..`。删除这个副本：在 VS Code 的文件列表中，右键点击 `my-page-laptop`，选择 **Delete**（删除）。然后先回到上一层文件夹，再克隆一次。
:::

## 日常流程 {#routine}

有了这一课学到的内容，和 GitHub 一起工作就可以归结为一套简短的流程：

::: figure id=fig-09-1
日常流程。开始时先拉取，拿到最新的提交。工作时分小步提交。结束时推送，让提交得到备份，别人也能看到它们。
:::

1. **开始：`git pull`。**拿到上次以来发生的所有变化。
2. **工作。**编辑文件，然后 `git add` 和 `git commit`，想做多少次都可以。
3. **结束：`git push`。**把你的提交发送到 GitHub。

如果你总是在开始前先拉取，推送被拒绝的情况就会很少见。

## 小结 {#summary}

- `git pull` 把 GitHub 上的新提交带过来，并把它们合并到你的分支。
- `git status` 只知道 Git 上一次和 GitHub 通信时看到的情况。
- 当 GitHub 上有你没有的提交时，它会**拒绝推送**。先 `git pull`，再 `git push`。
- `git clone URL` 会制作一个仓库的完整副本，包括历史记录和 `origin`。
- `cd FOLDER` 移动终端；`cd ..` 往上走一层文件夹。

| 命令 | 作用 |
|---|---|
| `git pull` | 把 GitHub 上的新提交带进你的分支 |
| `git clone URL [FOLDER]` | 把 GitHub 上的仓库复制到一个新文件夹 |
| `cd FOLDER`、`cd ..` | 把终端移到某个文件夹，或往上走一层 |

## 自测题 {#quiz}

```quiz
? 你在 GitHub 上编辑了一个文件。在你的电脑上，`git status` 显示“Your branch is up to date with 'origin/main'”。为什么？
- [ ] 在 GitHub 上的编辑失败了
- [x] 自从你上次推送以来，Git 还没有和 GitHub 通信过，所以 `git status` 用来比较的那份记录 `origin/main` 已经过时了
- [ ] `git status` 问过 GitHub 了，而 GitHub 上没有新东西
> `git status` 从来不会去问 GitHub。只有在 Git 和 GitHub 通信时，例如运行 `git pull` 时，`origin/main` 才会更新。

? GitHub 拒绝了你的推送，并显示“(fetch first)”（请先获取）。你该怎么做？
- [ ] 删除 GitHub 上的仓库，然后再推送一次
- [x] 先 `git pull`，再 `git push`
- [ ] 一直 `git push`，直到成功为止
> GitHub 上有你没有的提交。把它们拉取下来，和你的提交合并，然后再推送。

? `git clone` 会给你什么？
- [ ] 只有文件的最新版本
- [ ] 文件和历史记录，但你必须自己设置 `origin`
- [x] 文件、全部历史记录，以及已经设置好的 `origin`
> 克隆得到的是一个完整的仓库，可以直接拉取和推送。

? 坐下来开始做一个共享的项目时，最好的习惯是什么？
- [x] 先拉取
- [ ] 先推送
- [ ] 重新克隆一次
> 先拉取，你就能拿到所有人最新的成果，这样你的提交会建立在它们之上，推送也不会被拒绝。
```
