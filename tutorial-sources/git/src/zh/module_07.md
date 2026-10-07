## 团队如何共享工作 {#s1}

在第 6 模块中，两个人都直接推送到 `main`，其中一次推送因为对方抢先一步而被拒绝。两个细心的人这样做还行，换成一个团队就不行了。大多数团队转而遵循几条简单的规则：

- `main` 始终可用。没有人直接向它提交。
- 每项改动，无论多小，都在自己的分支上进行，这种分支称为**功能分支**（feature branch）。
- 改动准备好之后，作者用**拉取请求**（pull request）提出它：这是 GitHub 上的一个页面，展示分支的提交和改动，并邀请别人审查（review）。
- 审查通过后，拉取请求被合并到 `main`，分支随即删除。

这就是**功能分支工作流**（feature-branch workflow）。它的长处在于，每项改动在进入 `main` 之前都有人看过，而且好几个人可以同时工作，互不妨碍。

::: figure #fig-07-01
拉取请求的生命周期：创建分支、提交并推送；用拉取请求提出改动；审查过程中可能追加提交；在 GitHub 上把分支合并到 `main`，然后大家各自整理。
:::

在 GitHub 上共享项目有两种方式。在**共享仓库**中，团队成员有权限向同一个仓库推送分支，拉取请求从仓库的一个分支指向另一个分支。公司和小团队通常这样工作。在开源项目中，大多数贡献者根本无法向项目推送。每个人各自创建一个**复刻**（fork），即仓库在 GitHub 上的个人副本，向复刻推送，再从复刻向原项目发起拉取请求。第 7 节会讲复刻；在那之前，大家共用一个仓库。

GitHub 还有**议题**（issue）：每个仓库都有一份关于缺陷、想法和任务的列表。拉取请求常常会说明它解决了哪个议题，GitHub 可以在拉取请求合并时自动关闭该议题。

## 每项改动一个分支 {#s2}

Alex 想加入一份汤的食谱。Alex 没有在 `main` 上提交，而是新建一个分支，在上面提交，然后用 `git push -u` 把分支推送到共享仓库，与第 6 模块练习 4 完全一样。

本模块的动手环节使用第 6 模块中的替身服务器，Alex 和 Sam 各有一个克隆。要跟着操作，请使用你在第 6 模块中创建的 GitHub 仓库：你自己的 recipes 文件夹扮演 Alex。至于 Sam，可以把同一个 GitHub 仓库克隆到 Sam 的文件夹，或者用 `git remote set-url origin` 加上 GitHub 地址，让 Sam 现有的克隆指向它。在 GitHub 上，两个人都是你，这对本模块的所有内容都适用：你可以发起、审查并合并自己的拉取请求。

{{SESSION:m07-feature-branch}}

这次推送在服务器上创建了分支 `add-soups`，`-u` 则把 `origin/add-soups` 设为它的上游。`git branch -vv` 显示两个本地分支及其上游：`add-soups` 位于新提交上，`main` 仍在 `8bf3c2d`。

按改动的内容给分支命名，像第 4 模块建议的那样简短而具体：`add-soups`、`fix-oven-temperature`。这个名字会显示在拉取请求上，别人也会看到。

## 发起拉取请求 {#s3}

拉取请求是 GitHub 的功能，不是 Git 命令，所以本节没有动手环节。请在你自己的仓库上按以下步骤操作；GitHub 文档中的[创建拉取请求](https://docs.github.com/zh/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)展示了当前的页面。

1. 在 GitHub 上打开你的仓库。推送后不久，GitHub 会为这个分支显示一个 **Compare & pull request** 按钮。如果没有，就进入 **Pull requests** 标签页，选择 **New pull request**。
2. 选择 **base** 分支，即改动要进入的分支（`main`），以及 **compare** 分支，即包含改动的分支（`add-soups`）。GitHub 会显示这个拉取请求将带来的提交和改动。
3. 写一个说明改动作用的**标题**，例如“Add a tomato soup recipe”，再写一段**描述**，说明为什么要改，以及审查者需要知道的事情。
4. 如果这项改动解决了某个议题，就在描述中写上 `Closes #` 加议题编号，例如 `Closes #4`。拉取请求合并到默认分支时，GitHub 会关闭该议题。[将拉取请求关联到议题](https://docs.github.com/zh/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)列出了其他关键词。
5. 选择 **Create pull request**。

拉取请求页面有三个标签页：**Conversation**，用于描述和评论；**Commits**，列出分支的提交；**Files changed**，以与 `git diff` 相同的 `+`、`-` 形式显示差异。拉取请求会跟随分支：当你向 `add-soups` 推送更多提交时，它们会自动出现在拉取请求中。

::: tip
让拉取请求保持小巧。只做一件事的拉取请求能得到快速而仔细的审查；改动三十个文件的拉取请求要等好几天，最后只换来一句草草的“看起来没问题”。如果改动很大，就把它拆成几个前后衔接的分支。
:::

## 审查拉取请求 {#s4}

Sam 被请来做审查。大多数审查都在 GitHub 上进行：在 **Files changed** 标签页中，你可以对任意一行发表评论，然后用 **Comment**、**Approve** 或 **Request changes** 提交审查。GitHub 文档中的[审查拉取请求中提议的更改](https://docs.github.com/zh/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request)展示了具体步骤。

有时审查者希望把分支拿到自己的电脑上：试一试这项改动，或者在自己的编辑器里阅读。在这个动手环节中，Sam 获取、切换到 `add-soups`，并列出这个分支带来了什么。

{{SESSION:m07-review}}

`git fetch` 报告了新分支：`* [new branch] add-soups -> origin/add-soups`。Sam 还没有本地的 `add-soups`，但 `git switch add-soups` 注意到存在 `origin/add-soups`，于是一步之内就从它创建了本地分支，并设置为跟踪它。

接着，两条命令显示这个分支带来了什么：

- `git log --oneline main..add-soups` 列出 `add-soups` 上有而 `main` 上没有的提交，这里是那一次汤的提交。两个点的含义和第 6 模块中一样：“从右边能到达、从左边不能到达”。
- `git diff main...add-soups` 用三个点，显示 `add-soups` 自从与 `main` 分叉以来所做的改动，而不管 `main` 在那之后发生了什么。这正是 GitHub 在 **Files changed** 下显示的内容。

假设 Sam 的审查要求列出配料。Alex 的回应方式是：在同一个分支上修改文件、提交，然后再次推送。不需要做别的：拉取请求会自动收到新提交。随后 Sam 拉取，拿到这次改动。

{{SESSION:m07-address-review}}

Alex 的推送把服务器上的 `add-soups` 从 `22abb2e` 移到了 `b9835b7`，Sam 的 `git pull` 则把 Sam 那份分支快进到同样的位置。`git log --oneline main..add-soups` 现在列出了拉取请求中的两次提交。

::: note title="追加还是改写？"
回应审查时请追加提交，而不是修补已经推送的提交：别人可能已经获取了它们，而新的提交能让审查者准确看到自上次查看以来改了什么。如果你希望合并前的历史更整洁，第 8 模块会介绍如何压缩提交，GitHub 在合并拉取请求时也可以把它压缩。
:::

## 合并与整理 {#s5}

拉取请求获得批准后，有权限的人用 **Merge pull request** 按钮合并它。默认情况下，GitHub 会在 `main` 上生成一次合并提交，与 `git merge --no-ff` 完全一样：即使可以快进，也生成一次有两个父提交的提交，让历史把整个分支作为一个整体显示出来。它的说明写作“Merge pull request #1 from”，后面跟着分支名。随后 GitHub 会提供一个 **Delete branch** 按钮，用来删除 GitHub 上的分支；你的本地分支仍然保留。[合并拉取请求](https://docs.github.com/zh/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request)介绍了这个按钮及其他选项：*Squash and merge* 和 *Rebase and merge*。

在这个动手环节中，Sam 已经像按下这些按钮那样，在服务器上合并并删除了分支。现在 Alex 更新 `main` 并进行整理。

{{SESSION:m07-after-merge}}

- `git switch main` 说 Alex 的 `main` 与 `origin/main` 一致，但这指的是 Alex 上次获取时的情况。接着 `git pull` 获取到合并提交，并把 `main` 快进过去。
- `git branch -d add-soups` 删除 Alex 的本地分支。它顺利完成，因为 `main` 现在包含了这个分支的提交。
- `git fetch --prune` 删除那些在服务器上已不存在的分支所对应的远程跟踪分支：`- [deleted] (none) -> origin/add-soups`。如果不加 `--prune`，`origin/add-soups` 会一直留在 Alex 的仓库里。
- `git branch -a` 确认了结果：只剩下 `main` 和 `origin/main`。

提交图显示合并提交把汤的提交并入了 `main`。在动手环节中，它的说明是 `Merge branch 'add-soups'`，因为 Sam 用的是 `git merge --no-ff`；在 GitHub 上，说明里写的则是拉取请求。

::: tip
运行一次 `git config --global fetch.prune true`，以后每次 `git fetch` 和 `git pull` 都会自动清理。
:::

## 让分支保持最新 {#s6}

在你开发分支的同时，`main` 也在前进：别的拉取请求被合并了。在你请别人审查之前，以及当 GitHub 提示分支已过时或有冲突时，请把最新的 `main` 带进你的分支：先获取，再把 `origin/main` 合并到你的分支，然后推送。

在这个动手环节中，Alex 正在开发已经推送过的 `add-breads`，与此同时，Sam 对 README 的改动已经进入了 `main`。要跟着操作，请推送一个带有提交的分支，然后在 GitHub 上或以 Sam 的身份向 `main` 添加一次提交。

{{SESSION:m07-update-branch}}

看看获取之后的 `git status`：*Your branch is up to date with 'origin/add-breads'*。这话没错，却不是重点：分支的状态是与它自己的上游比较，而不是与 `main` 比较。第一张提交图显示了真实情况：`origin/main` 上有一次 `add-breads` 所没有的提交。

`git merge origin/main` 把它合并进来，生成一次合并提交，说明为 `Merge remote-tracking branch 'origin/main' into add-breads`，然后 `git push` 更新拉取请求。第二张提交图显示 `add-breads` 包含了两条历史线。合并 `origin/main` 而不是你的本地 `main`，可以省去先更新 `main` 这一步。

如果合并因冲突而停下，就像第 5 模块那样解决、提交并推送。GitHub 上出现的 **Update branch** 按钮会在 GitHub 上完成同样的合并。第 8 模块会介绍变基（rebase），这是一些团队更喜欢的另一种做法。

## 通过复刻做贡献 {#s7}

要为你无法推送的项目（例如大多数开源项目）做贡献，就要通过复刻来工作：

1. 在项目的 GitHub 页面上选择 **Fork**。GitHub 会在你的账户下创建这个仓库的副本。
2. 克隆你的复刻。在你的克隆中，`origin` 就是你的复刻，你可以向它推送。
3. 把原项目添加为第二个远程仓库，按照惯例命名为 **upstream**，这样你就能获取它的新提交。
4. 像平常一样在分支上工作，把分支推送到 `origin`，然后从你复刻中的分支向原项目的 `main` 发起拉取请求。无论你在哪一个仓库上发起拉取请求，GitHub 都会提供这个选项。
5. 要让复刻的 `main` 保持最新，就获取 `upstream`，把 `upstream/main` 合并到你的 `main`，再推送到 `origin`。GitHub 的 **Sync fork** 按钮会在 GitHub 上完成同样的事。

::: figure #fig-07-02
通过复刻工作。你无法向原项目 `upstream` 推送。你向自己的复刻 `origin` 推送，并从它发起拉取请求；你从 `upstream` 获取新的工作。
:::

在这个动手环节中，服务器上有原仓库以及 Sam 的复刻 `sam-recipes.git`，Sam 可以向后者推送。Sam 克隆复刻并添加 `upstream`。随后，维护原仓库的 Alex 加入了一份蛋糕食谱，Sam 再把它带进自己的复刻。

{{SESSION:m07-fork}}

`git remote -v` 现在列出两个远程仓库：Sam 的复刻 `origin`，以及原仓库 `upstream`。`git fetch upstream` 把原仓库的 `main` 取回为 `upstream/main`，`git merge upstream/main` 把 Sam 的 `main` 快进过去，`git push` 则更新复刻，因为 Sam 的 `main` 仍然推送到 `origin`。

要在 GitHub 上练习，可以像 GitHub 文档中的[复刻仓库](https://docs.github.com/zh/pull-requests/how-tos/work-with-forks/fork-a-repo)建议的那样，复刻练习仓库 [octocat/Spoon-Knife](https://github.com/octocat/Spoon-Knife)，然后克隆你的复刻，并把 `https://github.com/octocat/Spoon-Knife.git` 添加为 `upstream`。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**排列步骤。** 把功能分支工作流的这些步骤排好顺序：合并拉取请求；`git push -u origin fix-typo`；`git switch -c fix-typo`；发起拉取请求；`git switch main` 和 `git pull`；提交修正；用另一次提交回应审查；`git branch -d fix-typo`。
:::

::: solution
`git switch -c fix-typo`；提交修正；`git push -u origin fix-typo`；发起拉取请求；用另一次提交回应审查（并推送）；合并拉取请求；`git switch main` 和 `git pull`；`git branch -d fix-typo`。
:::

::: exercise #e2 level=2 kind=conceptual minutes=5
**两个点还是三个点？** 自从 `add-soups` 与 `main` 分叉以来，`main` 多了两次提交，而 `add-soups` 有一次自己的提交。`git log --oneline main..add-soups` 会列出什么？`git diff main...add-soups` 会显示什么？为什么不带点的 `git diff main add-soups` 会误导审查者？
:::

::: solution
`main..add-soups` 列出 `add-soups` 上那一次 `main` 所没有的提交。`main...add-soups` 只显示 `add-soups` 自分叉以来的改动，也就是拉取请求将要带来的内容。`git diff main add-soups` 直接比较两边最新的提交，因此 `main` 上的两次新提交看起来就像是被 `add-soups` 删除了，尽管这个分支从未碰过它们。
:::

::: exercise #e3 level=2 kind=coding minutes=6
**向同事的分支追加提交。** Alex 关于 `add-soups` 的拉取请求缺少一句说明这份汤够几个人吃。请以 Sam 的身份把它加到这个分支上，使拉取请求包含这处改动，并让 Alex 拿到它。要跟着操作，请先在 Alex 的窗口中推送一个分支。
:::

::: solution
获取分支、切换过去、提交并推送；然后 Alex 拉取：

{{SESSION:m07-e3-solution}}

任何有推送权限的人都可以向拉取请求的分支追加提交。请事先商量好，免得两个人同时修改相同的行。
:::

::: exercise #e4 level=1 kind=conceptual minutes=4
**撰写拉取请求。** 你的分支加入了一份汤的食谱，这是议题 #4 所要求的。写一个标题和一段描述，使拉取请求合并时能关闭这个议题。
:::

::: solution
例如，标题：*Add a tomato soup recipe*。描述：*Adds `soup.md` with the ingredients and method we used last week. Closes #4.* 措辞随意，只要描述中包含 `Closes #4`（或 `Fixes #4`、`Resolves #4`）即可。
:::

::: exercise #e5 level=2 kind=coding minutes=6
**删不掉的分支。** 你的拉取请求是用 *Squash and merge* 合并的：GitHub 在 `main` 上添加了一次包含该分支全部改动的新提交，并删除了分支。运行 `git pull` 之后，`git branch -d add-soups` 拒绝执行，说这个分支没有完全合并。请确认不会丢失任何内容，然后删除这个分支。要跟着操作，请在 GitHub 上用 *Squash and merge* 合并一个拉取请求。
:::

::: solution
压缩合并会把分支的改动复制到一次新提交中，所以 `main` 永远不包含该分支自己的提交，`-d` 也就无法判断这些工作已经在 `main` 中了。请改为比较文件内容：

{{SESSION:m07-e5-solution}}

`git diff main add-soups` 什么也没有打印：文件完全相同，所以 `git branch -D` 不会丢失任何东西。请先清理：只要你的仓库中还存在 `origin/add-soups`，`-d` 就会以它为准，只给出一条警告就删除分支。
:::

::: exercise #e6 level=1 kind=conceptual minutes=5
**复刻还是分支？** 在下面每种情况下，你会向仓库推送分支，还是通过复刻工作？

1. 你是拥有这个仓库的团队的成员。
2. 你在一个流行的开源库的文档中发现了一个错字。
3. 你想在不让任何人看到的情况下试验一个项目的代码，而且可能永远不会贡献出去。
:::

::: solution
1. 推送分支：你可以向这个仓库推送，在仓库的分支之间发起拉取请求最简单。
2. 复刻：你无法向这个库的仓库推送，所以要推送到你的复刻，再从复刻发起拉取请求。
3. 复刻，或者干脆只克隆：克隆不需要账户，复刻则在 GitHub 上给你一个可以推送的副本。请记住，公开仓库的复刻也是公开的。
:::

## 自测 {#quiz}

```quiz
? 什么是拉取请求？
- [ ] 一条从服务器拉取分支的 Git 命令
- [x] GitHub 上把一个分支合并到另一个分支的提议，可以在其中进行审查
- [ ] 申请向仓库推送的权限
- [ ] 仓库的自动副本
> 拉取请求是 GitHub 上的一个页面，展示分支的改动，让别人在合并前讨论和审查。

? 审查者要求修改。你怎样更新你的拉取请求？
- [ ] 关闭它，再发起一个新的
- [x] 把修改提交到同一个分支并推送
- [ ] 在拉取请求的页面上编辑文件
- [ ] 把新的分支名发给审查者
> 拉取请求会跟随它的分支；分支上的新提交会自动出现在其中。

? `git diff main...add-soups` 显示什么？
- [ ] 两边最新提交之间的所有差异
- [x] `add-soups` 自从与 `main` 分叉以来所做的改动
- [ ] `main` 上有而 `add-soups` 没有的提交
- [ ] 什么也不显示，除非两个分支已经合并
> 三个点是与分叉点比较，这正是 GitHub 的 Files changed 标签页显示的内容。

? 一个分支已在 GitHub 上合并并删除。哪条命令会从你的仓库中删除 `origin/add-soups`？
- [ ] `git branch -d add-soups`
- [ ] `git pull`
- [x] `git fetch --prune`
- [ ] `git push origin --delete add-soups`
> `--prune` 会删除那些在远程仓库上已不存在的分支所对应的远程跟踪分支。

? 在你的功能分支上，`git status` 显示 *Your branch is up to date with 'origin/add-breads'*。这是否意味着你的分支包含 `main` 上的一切？
- [ ] 是的，Git 总是与 `main` 比较。
- [x] 不是：它是与分支自己的上游 `origin/add-breads` 比较。
- [ ] 是的，只要你运行过 `git fetch`。
- [ ] 不是：它表示这个分支已被删除。
> 要引入 `main` 的新提交，请获取并把 `origin/main` 合并到你的分支。

? 在复刻的设置中，`upstream` 通常是什么？
- [x] 原项目的仓库
- [ ] 你在 GitHub 上的复刻
- [ ] 拉取请求要进入的分支
- [ ] 你的本地克隆
> `origin` 是你的复刻，你向它推送；`upstream` 是原项目，你从它获取。

? 你的拉取请求的描述中写着 `Closes #12`。它合并到默认分支时会发生什么？
- [ ] 拉取请求 #12 被关闭。
- [ ] 十二次提交被压缩。
- [x] 议题 #12 被自动关闭。
- [ ] 什么也不会发生：这只是一条注释。
> GitHub 会把拉取请求与议题关联起来，并在合并时关闭议题。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [5.1 节：分布式工作流程](https://git-scm.com/book/zh/v2/分布式-Git-分布式工作流程)和第 [6.2 节：对项目做出贡献](https://git-scm.com/book/zh/v2/GitHub-对项目做出贡献)。
- GitHub 文档：[关于拉取请求](https://docs.github.com/zh/pull-requests/reference/pull-requests)、[关于复刻](https://docs.github.com/zh/pull-requests/reference/forks)和[关于议题](https://docs.github.com/zh/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)。
- [git fetch](https://git-scm.com/docs/git-fetch)（`--prune`）和 [git diff](https://git-scm.com/docs/git-diff)（`A...B` 形式）的参考页面。
