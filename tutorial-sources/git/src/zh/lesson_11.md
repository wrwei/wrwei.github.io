---
title: 撤销与修正错误
lead: 帮你摆脱麻烦的命令，按情形整理成一份份“菜谱”。每一份都在你的项目上试一试，等真遇到的时候，你就知道该怎么做了。
minutes: 40
needs: 第 10 课（GitHub 上的 `my-page`，本地已是最新）
goals:
  - 用 `git restore --staged` 把文件移出暂存区
  - 用 `.gitignore` 让某些文件不进入 Git
  - 在推送之前，用 `git commit --amend` 修正上一次提交
  - 用 `git reset --soft` 撤销上一次提交，但保留改动
  - 用 `git revert` 撤销一个已经在 GitHub 上的提交
  - 用 `git reflog` 找回“丢失”的提交
---

## 先记住两条规则 {#rules}

你提交（commit）过的工作，Git 几乎从不会弄丢。大多数“灾难”都可以撤销（undo）。只要遵守两条规则，就能一直如此：

::: keyidea
1. **做任何有风险的尝试之前，先提交。**提交过的东西可以找回来；从没提交过的改动就找不回来了。
2. **只改写还没有推送（push）的提交。**`--amend` 和 `reset` 会改变你的历史。在你自己的电脑上这样做没问题，但如果 GitHub 上已经有了这些提交，就改用 `git revert`。
:::

在 VS Code 中打开 `my-page` 和终端。下面每一节都是一份“菜谱”，开头的粗体标题就是你遇到的情形。

## “我想丢掉对某个文件的改动” {#restore}

这个你在第 4 课见过：`git restore FILE` 会丢掉一个文件里还没暂存的改动，把它恢复成你上一次提交时的样子。如果你已经用 `git add` 暂存了这些改动，就先运行 `git restore --staged FILE`（见下文）。同一个命令还能找回你误删的文件。现在不用试：你在第 4 课已经做过了。

```terminal norun
$ git restore index.html
```

记住：丢掉的改动是找不回来的。

## “我想把文件恢复成旧提交里的样子” {#old-version}

先在 `git log --oneline` 里找到那个提交，再把它的哈希值（hash）交给 `git restore --source`。例如，要把 `index.html` 恢复成你第一次提交时的样子（请用**你自己**列表里的哈希值）：

```terminal norun
$ git restore --source c50e3a0 index.html
```

现在你的文件就是当时的样子。其他什么都没变：如果你想保留这个旧版本，就用 `git add` 和 `git commit` 把它作为一次新的改动提交；如果不想要，`git restore index.html` 会让它回到你上一次提交时的样子。现在不用试。

## “我不小心添加了一个文件” {#unstage}

假设你在项目文件夹里放了一些私人笔记。创建一个文件 `notes.txt`：

```file notes.txt
Ideas for my page:
- add a photo
- try a different font
```

你习惯性地把所有文件都添加了：

```terminal
$ git add .
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   notes.txt
```

这些笔记眼看就要进入一个提交，接着被推送到 GitHub，在那里谁都能读到。Git 的提示告诉了你怎样把文件移出暂存区（staging area）：

```terminal
$ git restore --staged notes.txt
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

nothing added to commit but untracked files present (use "git add" to track)
```

`notes.txt` 又回到了未跟踪（untracked）状态。`--staged` 只改变暂存区；你的文件本身原封未动。要一次把所有东西都移出暂存区，就用 `git restore --staged .`。

## “我希望 Git 永远不跟踪这个文件” {#ignore}

`notes.txt` 暂时安全了，但下一次 `git add .` 又会把它添加进去。要让 Git 永久忽略（ignore）一个文件，就把它列在一个名叫 `.gitignore` 的文件里（注意开头有一个点）。就像当初创建 `README.md` 那样，在 `my-page` 里、`index.html` 旁边创建它：

```file .gitignore
# My private notes
notes.txt
```

以 `#` 开头的行是注释。其余每一行都是一个要忽略的文件名或模式。

```terminal
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.gitignore

nothing added to commit but untracked files present (use "git add" to track)
```

`notes.txt` 从列表里消失了：Git 现在会忽略它，VS Code 也会把它显示成灰色。`.gitignore` 本身是一个普通文件，也是项目的一部分，所以要提交它：

```terminal
$ git add .gitignore
$ git commit -m "Ignore my private notes"
[main 5841c42] Ignore my private notes
 1 file changed, 2 insertions(+)
 create mode 100644 .gitignore
```

::: tip
`.gitignore` 里也可以写模式：`*.log` 会忽略所有以 `.log` 结尾的文件，`drafts/` 会忽略整个文件夹。
:::

::: pitfall
`.gitignore` 只对 Git 还没跟踪的文件起作用。已经提交过的文件会一直是已跟踪（tracked）的，直到你运行 `git rm --cached FILE` 并提交。还有，你推送过的任何内容都会留在 GitHub 上的历史里：如果有密码被推送上去了，就把这个密码改掉。
:::

## “我上一次提交有错，而且还没推送” {#amend}

你又加了一个爱好，还想让列表项之间留出一点空隙。把两个文件都改一下：

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
    <li>Reading</li>
  </ul>
  <h2>Contact</h2>
  <p>You can find me on GitHub as your-username.</p>
</body>
</html>
```

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

li {
  margin-bottom: 0.3em;
}
```

然后你匆匆提交了：只提交了一个文件，提交信息里还有个拼写错误。

```terminal
$ git add index.html
$ git commit -m "Add redaing to my hobbies"
[main b0c7144] Add redaing to my hobbies
 1 file changed, 1 insertion(+)
```

两处错误：“redaing”拼错了，`style.css` 也被漏掉了。因为这个提交你**还没推送**，所以可以修正它。先添加漏掉的文件，再用 `--amend` 修改上一次提交，并写上正确的提交信息：

```terminal
$ git add style.css
$ git commit --amend -m "Add reading to my hobbies"
[main cab53b1] Add reading to my hobbies
 Date: Thu Nov 12 10:09:00 2026 +0000
 2 files changed, 5 insertions(+)
```

`--amend` 会用一个新提交替换你的上一次提交：新提交包含原来那次提交的内容，加上现在已暂存（staged）的内容，提交信息则换成新的。`Date:` 这一行表明，它保留了原来那次提交的时间。检查一下：

```terminal
$ git log --oneline -2
cab53b1 (HEAD -> main) Add reading to my hobbies
5841c42 Ignore my private notes
```

那个有拼写错误的提交已经从你的历史里消失了。注意哈希值变了：这是一个新提交。

::: tip
如果只想补上漏掉的文件、不改提交信息，就用 `git commit --amend --no-edit`。
:::

## “我想撤销上一次提交，但保留改动” {#reset}

有时你想让提交消失，但想留下其中的改动：也许还要再改一改，或者想换一种方式提交。只要还没推送，`git reset --soft` 就能收回上一次提交，并让它的改动保持已暂存。`--soft` 的意思是“保留改动”，`HEAD~1` 的意思是“`HEAD` 之前的一个提交”。`~` 是波浪号：在某些键盘上，要先按它，再按 <kbd>Space</kbd>。如果找不到这个键，就点**复制**按钮。

```terminal
$ git reset --soft HEAD~1
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html
	modified:   style.css
```

提交“Add reading to my hobbies”被撤销了，但它的改动还在暂存区里等着，所以什么都没丢。（“Ahead by 1 commit”意为领先 1 个提交，指的是你还没推送的 `.gitignore` 那个提交。）把这些改动再提交一次。这里原样提交，是为了看到确实什么都没丢；实际工作中，你会先改点什么，或者把文件分开提交。

```terminal
$ git commit -m "Add reading to my hobbies"
[main dc4f482] Add reading to my hobbies
 2 files changed, 5 insertions(+)
```

然后推送这两个提交：

```terminal
$ git push
Enumerating objects: 10, done.
Counting objects: 100% (10/10), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (7/7), 856 bytes | 856.00 KiB/s, done.
Total 7 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To https://github.com/your-username/my-page.git
   32cd9ea..dc4f482  main -> main
```

::: pitfall
你可能会在别处看到 `git reset --hard`。它会撤销提交，**并且**把它的改动从你的文件里删掉，连同你所有还没提交的工作。这些工作是找不回来的。在你确定自己理解它之前，不要用它。
:::

## “我想撤销一个已经在 GitHub 上的提交” {#revert}

新加的爱好“Reading”现在已经上线了，可你又改了主意。这个提交已经在 GitHub 上了，所以**不要**用 `--amend` 修改它，也不要用 `reset` 重置它：否则 GitHub 上就会有你电脑上没有的提交，你下次推送时会被拒绝。正确的做法是还原（revert）它：用 `git revert` 加上这个提交的哈希值，创建一个新提交来撤销它。直接写 `HEAD` 也可以，因为它就是最新的提交。和合并（merge）时一样，VS Code 会打开一个标签页，里面是写好的提交信息 `Revert "Add reading to my hobbies"`：关闭这个标签页就表示接受，然后再点回终端。

```terminal
$ git revert HEAD
[main 3189807] Revert "Add reading to my hobbies"
 2 files changed, 5 deletions(-)
```

“Reading”那一行和列表的间距都从你的文件里消失了。现在你的历史里两个提交都在：一个是改动，一个是对它的撤销。这样既诚实又安全：

```terminal
$ git log --oneline -3
3189807 (HEAD -> main) Revert "Add reading to my hobbies"
dc4f482 (origin/main, origin/HEAD) Add reading to my hobbies
5841c42 Ignore my private notes
$ git push
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 8 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 471 bytes | 471.00 KiB/s, done.
Total 4 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To https://github.com/your-username/my-page.git
   dc4f482..3189807  main -> main
```

你可以还原任何一个提交，不只是最近的那个：用 `git log --oneline` 里它的哈希值就行。合并提交（merge commit）是例外，比如合并拉取请求（pull request）时产生的提交：要撤销一次合并带进来的内容，请用 `git revert -m 1 HASH`。

::: pitfall
**还原不会把任何东西藏起来。**旧提交仍然留在历史里，而公开仓库的历史谁都能看。如果你推送了密码或密钥，请立刻到它所属的网站上把它改掉。把它从历史中删除，是一项高级操作。
:::

## “我好像弄丢了一个提交” {#reflog}

你修改过一次提交（`--amend`），又重置过一次（`reset`）。旧的版本去哪儿了？暂时哪儿也没去。Git 会为 `HEAD` 到过的每一个位置记日记，这本日记叫 **reflog**（引用日志）：

```terminal
$ git reflog -7
3189807 (HEAD -> main, origin/main, origin/HEAD) HEAD@{0}: revert: Revert "Add reading to my hobbies"
dc4f482 HEAD@{1}: commit: Add reading to my hobbies
5841c42 HEAD@{2}: reset: moving to HEAD~1
cab53b1 HEAD@{3}: commit (amend): Add reading to my hobbies
b0c7144 HEAD@{4}: commit: Add redaing to my hobbies
5841c42 HEAD@{5}: commit: Ignore my private notes
32cd9ea HEAD@{6}: pull: Fast-forward
```

从下往上读：最下面是第 10 课结尾的那次拉取（pull），再往上是本课的经过。`HEAD@{0}` 是 `HEAD` 现在的位置，`HEAD@{1}` 是它上一步所在的位置，依此类推。就连那个有拼写错误的提交 `b0c7144` 也还在。要找回其中任何一个提交，就在它上面建一个分支（branch），哈希值请用**你自己的** reflog 里的：

```terminal norun
$ git branch rescue b0c7144
```

现在 `rescue` 指向那个提交，你可以切换过去看看。现在不必这样做。如果你试了，之后请用 `git branch -D rescue` 删掉这个分支（要用大写的 D，因为它的提交没有被合并）。Git 至少会把这类“丢失”的提交保留 30 天，所以要尽早把它们救回来。

## 我该用哪种撤销？ {#which}

::: figure id=fig-11-1
该用哪种撤销。从你想撤销的东西出发：文件里的改动、暂存区里的文件、你的上一次提交（推送之前或之后），或者一个找不到的提交。
:::

| 情形 | 命令 | 推送之后还安全吗？ |
|---|---|---|
| 丢掉文件中尚未暂存的改动 | `git restore FILE` | 与提交无关；改动会丢失 |
| 把文件恢复成旧提交里的样子 | `git restore --source HASH FILE` | 是：你会把结果作为一次新的改动来提交 |
| 把文件移出暂存区 | `git restore --staged FILE` | 是，它不会改变历史里的任何东西 |
| 永不跟踪某个文件（尚未提交过） | 把它加入 `.gitignore` | 是 |
| 修正上一次提交的信息或文件 | `git commit --amend` | **否**：只能在推送之前用 |
| 撤销上一次提交，保留改动 | `git reset --soft HEAD~1` | **否**：只能在推送之前用 |
| 撤销已经在 GitHub 上的提交 | `git revert HASH` | **是**：就该用这个办法 |
| 找回看似丢失的提交 | `git reflog` | 是 |

::: trouble
**我对一个已经推送的提交用了 `--amend` 或 `reset`，现在推送被拒绝了。**不要用 `git push --force`，尽管很多网站都这么建议：它会用你的历史替换 GitHub 上的历史，可能会删掉那里的提交。先拉取（`git pull`），如果有冲突，就像第 6 课那样解决，然后推送。你的历史里会多一个合并提交，但什么都不会丢。

**`git revert` 因冲突停了下来。**后来的提交改动了相同的行。像第 6 课那样解决冲突，然后 `git add` 这些文件，再运行 `git revert --continue`。也可以用 `git revert --abort` 放弃。

**`error: commit ... is a merge but no -m option was given.`**（提交 ... 是一个合并提交，但没有给出 -m 选项。）你试图还原一个合并提交。请用 `git revert -m 1 HASH`：它会撤销这次合并给当时所在分支带进来的内容。
:::

## 小结 {#summary}

- 做任何有风险的事之前先提交；提交过的东西还能再找回来。
- 只对还没推送的提交改写历史（`--amend`、`reset`）。推送之后，用 `git revert`。
- `git restore --staged FILE` 取消暂存；`.gitignore` 让还没提交过的文件不进入 Git。
- `git restore --source HASH FILE` 能找回文件的旧版本。
- `git reflog` 列出 `HEAD` 到过的每一个地方，所以“丢失”的提交能被找回来。

| 命令 | 作用 |
|---|---|
| `git restore --staged FILE` | 把文件移出暂存区 |
| `git restore --source HASH FILE` | 把文件恢复成提交 `HASH` 里的样子 |
| `git commit --amend -m "..."` | 用已暂存的内容和新的提交信息替换上一次提交 |
| `git reset --soft HEAD~1` | 撤销上一次提交，并让它的改动保持已暂存 |
| `git revert HASH` | 创建一个新提交，撤销提交 `HASH` |
| `git reflog` | 列出 `HEAD` 指向过的每一个提交 |

## 自测题 {#quiz}

```quiz
? 你提交时，提交信息里有个拼写错误，而且还没推送。最简单的修正方法是什么？
- [x] `git commit --amend -m "the right message"`
- [ ] `git revert HEAD`
- [ ] 删除 `.git` 文件夹，从头再来
> `--amend` 会替换上一次提交。这样做是安全的，因为 GitHub 还没见过旧的那个提交。

? 一个有错误的提交已经在 GitHub 上了。怎样撤销它？
- [ ] `git reset --soft HEAD~1`，然后推送
- [x] 用 `git revert` 加上这个提交的哈希值，然后推送
- [ ] `git commit --amend`，然后推送
> `revert` 会添加一个新提交来撤销旧提交，所以 GitHub 上已有的历史保持完整。

? 你运行了 `git add .`，把一个含有密码的文件也暂存了。你还没有提交。该怎么办？
- [x] 对这个文件运行 `git restore --staged`，并把它加入 `.gitignore`
- [ ] 先提交，再还原
- [ ] 什么都不用做，Git 从来不会上传这类文件
> 取消暂存能让它不进入这次提交；`.gitignore` 能让以后的每一次 `git add .` 都不再添加它。

? 被你用 `--amend` 替换掉的提交，在哪里能找到？
- [ ] 哪里都找不到，它会被立刻删除
- [ ] 在 GitHub 上
- [x] 在 `git reflog` 里
> reflog 列出了 `HEAD` 最近指向过的提交。Git 会把丢失的提交在那里保留至少 30 天。
```
