---
title: 拉取请求
lead: 在分支上提出一项改动，在 GitHub 上审查并合并它，再把本地整理干净。然后看看同样的步骤怎样让你和别人一起工作。
minutes: 40
needs: 第 9 课（GitHub 上的 `my-page`，以及每天拉取、推送的工作流程）
goals:
  - 理解拉取请求的用途
  - 把分支推送到 GitHub，并创建拉取请求
  - 在 GitHub 上审查改动，并合并拉取请求
  - 把合并结果取回你的电脑，并删除分支
  - 邀请协作者，并知道怎样为别人的项目贡献改动
---

## 什么是拉取请求？ {#what}

到目前为止，你都是一个人在自己的电脑上合并（merge）分支（branch）。几个人一起工作时，大家希望在改动进入 `main` **之前**就先看到它：检查一下，提提意见，达成一致。GitHub 为此提供的工具叫**拉取请求**（pull request）：它是一个网页，上面写着“请把我的分支合并到 `main`”，准确显示会改变哪些内容，还有讨论的地方。等大家都满意了，点一下就能合并。这个名字的意思是“请把我的分支拉取（pull）到你的分支里”。它不是 `git pull` 命令：拉取请求是在 GitHub 网站上创建的。

GitHub 上几乎每个团队都用拉取请求来工作，你给别人的项目提改动建议，也要用它。在自己的项目里用拉取请求同样是好习惯，所以现在你就来试一试。

::: figure id=fig-10-1
拉取请求的流程。创建一个分支并在上面提交（commit），把分支推送（push）到 GitHub，创建拉取请求，审查（review）它，在 GitHub 上合并，最后在你的电脑上拉取 `main` 并删除这个分支。
:::

## 在新分支上做一处改动 {#branch}

在 VS Code 中打开 `my-page` 和终端，确认你在 `my-page` 里，而不是在 `my-page-laptop` 里：

```terminal
$ pwd
/Users/you/my-page
```

然后按第 9 课每天的工作流程开始：先拉取最新的内容。

```terminal
$ git pull
Already up to date.
```

现在为页面上的一个新部分建一个分支：

```terminal
$ git switch -c add-contact
Switched to a new branch 'add-contact'
```

在页面末尾、`</body>` 之前，加上高亮的两行：

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
  <h2>Contact</h2>
  <p>You can find me on GitHub as your-username.</p>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Add a contact section"
[add-contact 904037b] Add a contact section
 1 file changed, 2 insertions(+)
```

## 推送分支 {#push}

把这个分支发送到 GitHub。GitHub 上还没有 `add-contact`，所以只写 `git push` 的话，Git 不知道该把它发到哪里。和第 7 课推送 `main` 时一样，第一次要加上 `-u`：`-u origin add-contact` 会在 GitHub 上创建这个分支，并让两边的分支配成一对。

```terminal
$ git push -u origin add-contact
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 450 bytes | 450.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
remote:
remote: Create a pull request for 'add-contact' on GitHub by visiting:
remote:      https://github.com/your-username/my-page/pull/new/add-contact
remote:
To https://github.com/your-username/my-page.git
 * [new branch]      add-contact -> add-contact
branch 'add-contact' set up to track 'origin/add-contact'.
```

以 `remote:` 开头的几行来自 GitHub 本身：它发现了一个新分支，建议你创建拉取请求，还附上了链接。你可以用 <kbd>Ctrl</kbd>+单击这个链接来打开它（Mac 上用 <kbd>Cmd</kbd>+单击），也可以像下面那样进入仓库（repository）页面。

::: trouble
**`fatal: The current branch add-contact has no upstream branch`**（当前分支 add-contact 没有上游分支）。你只输入了 `git push`，后面什么也没加。请运行 `git push -u origin add-contact`。（Git 自己建议的 `--set-upstream` 和 `-u` 是一个意思。）
:::

## 创建拉取请求 {#open}

::: where github
1. 打开你的仓库页面。一条黄色横幅会提示 `add-contact` 最近有推送。点击 **Compare & pull request**（比较并创建拉取请求）。
2. 页面上显示 *base*（基准）`main` 和 *compare*（比较）`add-contact`：你请求把 `add-contact` 合并到 `main`。下面是这次的提交和改动。
3. 标题框里是你的提交信息“Add a contact section”；如果不是，就自己输入。在描述框里用一句话说明这次改动，例如：“在页面末尾添加一个简短的联系方式部分。”
4. 点击 **Create pull request**（创建拉取请求）。
:::

你的拉取请求有一个编号 **#1**，还有自己的页面，页面上有几个标签页。这里要用到其中三个：

- **Conversation**（对话）：描述、评论，以及底部的合并按钮。
- **Commits**（提交）：这个分支上的提交。
- **Files changed**（更改的文件）：差异（diff），新增的行显示为绿色，和 `git diff` 一样。

另外，**Checks**（检查）标签页显示自动测试的结果；你的项目没有自动测试。

## 审查改动 {#review}

::: where github
点击 **Files changed**，读一读这次改动。审查者做的就是这件事。在你自己的项目里没有别人来审查，所以你自己仔细读一遍就够了。

（可选）要对某一行发表评论，就把鼠标悬停在这一行上，点击出现的蓝色评论图标，写下评论，然后点击 **Comment**（评论）；在某些视图中，这个按钮叫 **Add single comment**（添加单条评论）。**Start a review**（开始审查）用来先攒下几条评论，再一起发出。
:::

审查的意义在于赶在错误进入 `main` 之前发现它们，而在你的项目里，`main` 就是线上的网页。多看一眼花不了多少工夫；修好一个坏掉的网页可就费事了。

::: tip
如果审查发现了问题，不需要新建拉取请求。在你的电脑上、在同一个分支上把它改好，提交，然后 `git push`。拉取请求会自动更新，加入这个新提交。
:::

## 在 GitHub 上合并 {#merge}

::: where github
1. 回到 **Conversation** 标签页，滚动到底部。
2. 点击 **Merge pull request**（合并拉取请求），再点击 **Confirm merge**（确认合并）。拉取请求现在的状态是“Merged”（已合并）。
3. 点击 **Delete branch**（删除分支）。这个分支已经完成了任务；它的提交会留在 `main` 里。
:::

<!-- replay:
gh-merge-pr your-username/my-page 1 add-contact "Add a contact section"
gh-delete-branch your-username/my-page add-contact
-->

GitHub 用一个合并提交（merge commit）把 `add-contact` 合并进了 `main`，就像第 5 课的第二次合并那样。GitHub 总会创建合并提交，好让历史记下这个拉取请求；即使像这里这样，在你的电脑上用 `git merge` 只会把标签向前移，它也照样创建。因为 `main` 变了，GitHub Pages 会重新发布你的网站：一两分钟后，联系方式这部分就上线了。

## 把合并取回本地，整理分支 {#tidy}

合并是在 GitHub 上完成的，所以你的电脑上还没有它。切换到 `main` 并拉取：

```terminal
$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
$ git pull
remote: Enumerating objects: 1, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 1 (delta 0), reused 1 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (1/1), 264 bytes | 264.00 KiB/s, done.
From https://github.com/your-username/my-page
   22893c9..32cd9ea  main       -> origin/main
Updating 22893c9..32cd9ea
Fast-forward
 index.html | 2 ++
 1 file changed, 2 insertions(+)
```

和第 9 课一样，“Up to date with 'origin/main'”（与 'origin/main' 一致）依据的还是那份旧记录。你的 `main` 没有动过，所以它只需要向前移到 GitHub 的合并提交上：这就是 Git 显示“Fast-forward”（快进）的原因。现在把你电脑上的这个分支也删掉：

```terminal
$ git branch -d add-contact
Deleted branch add-contact (was 904037b).
```

你的电脑上还留着一份关于 GitHub 上那个分支的记录：`origin/add-contact`。获取（fetch）是 `git pull` 的前一半：`git fetch` 会从 GitHub 下载最新的变化，更新你的记录（比如 `origin/main`），但不会改动你的文件和分支。`--prune`（prune 意为“修剪”，就像园丁剪掉枯枝）还会删掉那些已在 GitHub 上删除的分支的记录。这只是整理：就算忘了做，也不会出问题。

```terminal
$ git fetch --prune
From https://github.com/your-username/my-page
 - [deleted]         (none)     -> origin/add-contact
```

历史里能看到 GitHub 做的那次合并：

```terminal
$ git log --oneline --graph -3
*   32cd9ea (HEAD -> main, origin/main, origin/HEAD) Merge pull request #1 from your-username/add-contact
|\
| * 904037b Add a contact section
|/
*   22893c9 Merge branch 'main' of https://github.com/your-username/my-page
|\
```

这就是拉取请求的完整流程：**建分支、提交、推送、创建拉取请求、审查、合并、拉取、删除分支。**

::: trouble
**没有出现黄色横幅。**点击 **Pull requests**（拉取请求）标签页，再点击 **New pull request**（新建拉取请求），然后选择 `add-contact` 作为 *compare* 分支。

**合并按钮是灰色的，还提示有冲突。**在你建这个分支之后，`main` 上的同几行也被改过了，通常是在 GitHub 上改的。先在你的电脑上取回 GitHub 上最新的 `main`：`git switch main`，然后 `git pull`。接着运行 `git switch add-contact` 和 `git merge main`，像第 6 课那样解决冲突（`git add`、`git commit`），再 `git push`。拉取请求会随之更新，你就可以合并了。
:::

## 与他人协作 {#others}

有别人加入时，你做过的这一切都照样适用。

### 邀请协作者加入你的仓库

::: where github
1. 在你的仓库页面上，点击 **Settings**（设置）。
2. 在侧边栏的“Access”（访问）部分，点击 **Collaborators**（协作者），再点击 **Add people**（添加人员）。GitHub 可能会先要求你确认密码：这是正常的安全检查。
3. 输入对方的 GitHub 用户名，选中这个人，然后点击按钮把对方添加进来。
:::

对方会收到一封邀请邮件。接受邀请后，对方就可以推送到你的仓库了。一种好的协作方式是：你们每个人都在自己的分支上工作，推送分支，然后创建拉取请求；由另一个人审查并合并。每个人开始新工作之前，都先拉取 `main`。

### 为别人的项目提出改动

除非别人把你设为协作者，否则你不能推送到他们的项目。你可以换个办法：在 GitHub 上为这个项目做一份你自己的副本，叫作**复刻**（fork），再从那里发送你的改动：

1. 在项目的 GitHub 页面上，点击右上角的 **Fork**（复刻），再点击 **Create fork**（创建复刻）。GitHub 会在你的账户下创建一份副本。
2. 在你的主文件夹里克隆（clone）**你的复刻**（先用 `cd ..` 离开 `my-page`）。要拿到它的地址，就打开复刻的页面（它的名称以你的用户名开头），点击绿色的 **Code**（代码）按钮，复制地址。然后建一个分支，提交，再把分支推送到你的复刻。
3. 打开原项目的页面。GitHub 在那里也会为你的分支显示一条黄色横幅：点击 **Compare & pull request**，描述你的改动，然后创建拉取请求。
4. 项目的所有者会审查它。他们可能会请你修改（你就往分支上推送更多提交）；如果他们满意，就会合并它。

数以百万计的人就是这样为开源项目做贡献的。想练习的话，[github.com/firstcontributions/first-contributions](https://github.com/firstcontributions/first-contributions) 正是为此而建的项目。

::: trouble
**`Permission to OWNER/PROJECT.git denied to your-username`**（your-username 没有访问 OWNER/PROJECT.git 的权限），或 **`The requested URL returned error: 403`**（请求的网址返回了 403 错误）。你克隆的是原项目，而不是你的复刻。`git remote -v` 显示的地址里必须包含你的用户名。请克隆你的复刻，在那里做改动。
:::

## 小结 {#summary}

- **拉取请求**请求合并一个分支，它会显示改动，也是审查和讨论这些改动的地方。
- 流程是：**建分支、提交、推送分支、创建拉取请求、审查、在 GitHub 上合并，然后拉取 `main` 并删除分支。**
- 拉取请求还没合并时，往分支上推送更多提交，它就会跟着更新。
- `git fetch --prune` 会删掉 GitHub 上已删除分支的记录。
- **协作者**可以推送到你的仓库；其他任何人都可以**复刻**它，然后发送拉取请求。

| 命令 | 作用 |
|---|---|
| `git push -u origin BRANCH` | 把一个新分支发送到 GitHub |
| `git switch main`，然后 `git pull` | 把已合并的拉取请求取回你的电脑 |
| `git branch -d BRANCH` | 删除你电脑上已经完成任务的分支 |
| `git fetch --prune` | 从 GitHub 获取最新变化，并去掉已删除分支的记录 |

## 自测题 {#quiz}

```quiz
? 拉取请求是用来请求什么的？
- [ ] 下载一个仓库
- [x] 在改动被查看和讨论之后，把一个分支合并到另一个分支
- [ ] 从 GitHub 拉取最新的提交
> 别看名字里有“拉取”，拉取请求其实是请求**合并**。`git pull` 是另一回事。

? 审查者在你尚未合并的拉取请求里发现了一个错别字。你该怎么做？
- [ ] 关闭它，再新建一个
- [x] 在同一个分支上修好、提交并推送；拉取请求会自动更新
- [ ] 请审查者在合并之后再改
> 拉取请求跟着它的分支走。分支上的新提交会出现在拉取请求里。

? 在 GitHub 上合并拉取请求之后，为什么还要在你的电脑上对 `main` 运行 `git pull`？
- [x] 合并提交是在 GitHub 上生成的，所以你的电脑上还没有它
- [ ] 为了删除 GitHub 上的分支
- [ ] 为了撤销这次合并
> GitHub 上发生的任何事，只有在你拉取之后才会进入你的分支。

? 你想给一个自己不能推送的项目提出改动。第一步是什么？
- [ ] 克隆它，然后向它推送
- [x] 在 GitHub 上复刻它
- [ ] 向所有者要密码
> 复刻是你自己在 GitHub 上的副本。你把分支推送到那里，再向原项目创建拉取请求。
```
