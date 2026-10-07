## 项目介绍 {#s1}

本模块把整个系列学到的内容用在一个小项目上，从第一次提交一直到发布一个版本。Alex 和 Sam 要共同编写一本**家庭食谱**：一个 README、一份食谱索引，以及每份食谱一个文件。用到的命令你都已经学过。新的地方在于，要按照团队的工作方式，把所有这些步骤按顺序一起完成。

这个项目有五个里程碑：

1. **共享仓库。** Alex 创建项目并共享出去；Sam 克隆它。
2. **同时开发两项功能。** Alex 加入一份汤的食谱，Sam 加入一份面包的食谱，各自在一个分支上进行，各自用一个拉取请求提出。
3. **一次冲突。** Alex 的拉取请求先被合并，于是 Sam 的拉取请求与之冲突。Sam 把 `main` 带进自己的分支并解决冲突。
4. **审查与合并。** Alex 审查并合并 Sam 的拉取请求，大家各自整理。
5. **发布版本。** Alex 把成果标记为 1.0 版并发布。

团队遵循第 7 模块中的规则：没有人直接向 `main` 提交，每项改动都经过分支和拉取请求，并由作者以外的人审查和合并。

请在 GitHub 上完成这个项目。有两种方式：

- **和朋友一起。** 你们各有一个 GitHub 账号和一台电脑。一人扮演 Alex 并拥有仓库，另一人扮演 Sam。
- **一个人完成。** 你一人分饰两角，像第 6 模块那样使用两个文件夹和两个终端窗口。在 GitHub 上，两个人都是你。GitHub 不允许任何人批准自己的拉取请求，所以项目中说到*批准*的地方，请改为留下一条审查评论，然后合并。

动手环节用第 6 模块中的替身服务器展示每一个步骤。如果某一步要在 GitHub 上进行，例如创建仓库、发起或合并拉取请求，正文会说明怎么做。

## 里程碑 1：共享仓库 {#s2}

Alex 创建项目：一个新文件夹、`git init`、三个文件和第一次提交。请从主文件夹开始（`cd ~`），不要在 `recipes` 里面创建。然后 Alex 把它放到服务器上并推送 `main`，Sam 再克隆它。

在 GitHub 上：
- Alex 像第 6 模块那样创建一个名为 `cookbook` 的空仓库，并推送到它的地址，而不是 `/srv/git/cookbook.git`。
- 和朋友一起做时，Alex 接着按照[邀请协作者访问个人仓库](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)邀请 Sam 加入仓库。Sam 接受邀请之后，就可以向它推送分支了。
- 一个人做时，不需要邀请。把仓库克隆到 Sam 的文件夹中，并像第 6 模块那样在这个克隆中设置 Sam 的姓名和邮箱。

{{SESSION:m10-start}}

这里的每一步都来自前面的模块。`git add` 一次列出三个文件。第一次提交是根提交，`git push -u` 在服务器上创建 `main` 并把它设为上游。随后 Sam 的克隆中也有了同一次提交 `db5abad`。

::: tip
团队常常让 GitHub 来强制执行这些规则。对 `main` 设置**规则集**（ruleset）或**分支保护**（branch protection），可以要求在合并任何东西之前，必须有拉取请求和一次批准的审查。[关于受保护分支](https://docs.github.com/zh/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)解释了这些选项。对本项目来说，这是可选的，而且只适合多人合作：一个人做时，要求批准会挡住每一次合并，因为没有人能批准自己的拉取请求。使用免费账号时，GitHub 只在公开仓库中强制执行这些规则。
:::

## 里程碑 2：同时开发两项功能 {#s3}

现在 Alex 和 Sam 同时工作，各自在自己的分支上。每人加入一个食谱文件，并在 `index.md` 中煎饼下面为它加上一行。然后每人推送分支，并像第 7 模块那样在 GitHub 上发起拉取请求：Alex 的成为拉取请求 #1，Sam 的成为 #2。请为每个拉取请求写一个标题和一段简短的描述。

{{SESSION:m10-parallel}}

每人的提交都涉及两个文件：新的食谱和 `index.md`。提交图显示的是 Sam 的仓库。Sam 的分支 `add-bread` 比 `main` 领先一次提交。Sam 的仓库还没有获取 Alex 的分支，所以图中没有它。

两处改动都在 `index.md` 的同一个位置，也就是紧接在煎饼之后，加了一行。两个人都还不知道，但正如第 5 模块所解释的，这注定会产生冲突。

## 里程碑 3：一次冲突 {#s4}

Sam 审查拉取请求 #1，批准后用 **Merge pull request** 合并它，再用 **Delete branch** 删除分支。现在 `main` 中有了汤，而 Sam 的拉取请求 #2 已经无法顺利合并了。GitHub 会在拉取请求的页面上显示：*This branch has conflicts that must be resolved*。

修复应该在分支上进行，所以这是 Sam 作为分支作者的工作：把新的 `main` 带进 `add-bread`，解决冲突，然后推送。这就是第 7 模块中的“让分支保持最新”，中间再加上第 5 模块的冲突解决。

一个人跟着做时，请先在 GitHub 上合并拉取请求 #1。然后在 Sam 的文件夹中，在 `add-bread` 上操作。

{{SESSION:m10-conflict}}

`git fetch` 取回了合并后的 `main`。`git merge origin/main` 因 `index.md` 中的冲突而停下。冲突标记把 Sam 的那一行（`HEAD`，即 Sam 所在的分支）与来自 `origin/main` 的汤那一行对照显示。两行都应该留在 `index.md` 中。Sam 按字母顺序保留两行，并删除标记。然后是 `git add`、`git commit`（接受现成的说明 `Merge remote-tracking branch 'origin/main' into add-bread`）和 `git push`。

提交图显示了结果：`add-bread` 现在既包含面包的提交，也包含 `main` 上的一切，其中有 Alex 已合并的拉取请求。在 GitHub 上，拉取请求会自动更新，冲突警告也随之消失。

## 里程碑 4：审查与合并 {#s5}

Alex 在 **Files changed** 标签页中审查拉取请求 #2，那里现在只显示 Sam 的改动：新的面包文件和解决冲突后的 `index.md`。Alex 批准并合并了它，再用 **Delete branch** 删除分支。然后两个人都把自己的 `main` 更新到最新，并像第 7 模块那样删除已合并的分支。

{{SESSION:m10-merge}}

Sam 切换到 `main`，拉取拉取请求 #2 的合并，删除本地分支，并清理 `origin/add-bread`。`cat index.md` 显示 `index.md` 中已有全部三份食谱。

这张提交图是本系列中最复杂的一张，所以请从下往上读：
- 第一次提交 `db5abad`；
- 两次功能提交 `0070943`（面包）和 `7c82c56`（汤）；
- 拉取请求 #1 的合并；
- Sam 把 `main` 合并进 `add-bread`；
- 最上面是拉取请求 #2 的合并。

每一条工作线都在，每一次合并都说明了来自哪里。对于使用合并的团队来说，这样的历史很正常；第 8 模块介绍了如何用变基让它更直一些。

## 里程碑 5：发布版本 {#s6}

食谱已经可以发布第一个版本了。**标签**（tag）给一次提交起一个永久的名字，例如 `v1.0`，它不会像分支那样随着新工作的到来而移动。

Git 有两种标签：
- **轻量标签**（lightweight tag），用 `git tag <name>` 创建，只是某次提交的一个名字，就像一个永远不动的分支；
- **附注标签**（annotated tag），用 `git tag -a <name> -m "<message>"` 创建，本身就是一个对象（第 9 模块）。它记录了谁创建了它、什么时候、为什么。

发布版本请使用附注标签。

`git push` 不会推送标签；请按名字逐个推送，例如 `git push origin v1.0`。许多项目用[语义化版本](https://semver.org/lang/zh-CN/)（Semantic Versioning）给发布版本编号：修正问题用 `v1.0.1`，增加不改变现有内容的新功能用 `v1.1.0`，做出破坏别人所依赖内容的改动则用 `v2.0.0`。

{{SESSION:m10-release}}

- `git log --oneline --graph` 显示即将发布的历史。`git tag -a v1.0 -m "Family cookbook 1.0"` 给最新的提交，即拉取请求 #2 的合并，打上标签。
- `git push origin v1.0` 发送这个标签：`* [new tag] v1.0 -> v1.0`。`git tag` 列出所有标签。
- `git show v1.0 --no-patch` 显示标签对象（打标签者、日期和说明），后面是它所指向的提交。
- 提交图在那次提交上用一个黄色标签显示它。
- Sam 获取时，Git 会把新标签一起带来：`* [new tag] v1.0 -> v1.0`。

要在 GitHub 上发布这个版本，请打开仓库的 **Releases** 页面，选择 **Draft a new release**，选中标签 `v1.0`，再写一个标题和一份简短的内容清单，最后选择 **Publish release**。[管理仓库中的发行版](https://docs.github.com/zh/repositories/releasing-projects-on-github/managing-releases-in-a-repository)展示了具体步骤。发行版是给项目使用者看的页面，建立在 Git 记录的标签之上。

::: keyidea
这就是完整的循环：分支、提交、推送、拉取请求、审查、合并、更新、打标签。本系列的每一部分内容都服务于其中的某一步，你将来加入的每个 Git 项目，无论多大，都是这样运作的。
:::

## 练习 {#exercises}

这些拓展任务是这个项目的延续。请在 GitHub 上你的食谱项目中完成。

::: exercise #e1 level=2 kind=coding minutes=10
**修正版本。** 煎饼食谱里没有盐。请以 Alex 的身份通过拉取请求修正它，并把这次修正发布为 `v1.0.1`。
:::

::: solution
创建分支、提交、推送并发起拉取请求。合并之后，更新 `main`，然后打标签并推送标签：

{{SESSION:m10-e1-solution}}

在动手环节中，Sam 像在 GitHub 上合并那样合并了拉取请求 #3。一个不改动其他内容的修正，得到下一个修订号 `v1.0.1`。
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**避免冲突。** 里程碑 3 中的冲突是可以预见的：每加一份新食谱，都要在 `index.md` 的同一个位置加一行。请提出两种办法，让团队今后避免这样的冲突。
:::

::: solution
以下任意两种：
- 约定每次合并之后由一个人更新 `index.md`，这样食谱分支就永远不碰它。
- 让 `index.md` 保持字母顺序，这样不同的食谱通常位于不同的行（不过相邻的行仍可能冲突）。
- 在发起拉取请求之前，先把 `main` 合并进分支，这样后提交的人就能在对方的改动还很小时看到它。
- 用脚本根据食谱文件自动生成 `index.md`，而不是手工编辑。
:::

::: exercise #e3 level=2 kind=coding minutes=8
**这是谁加的？** 一位新成员问：苏打面包是谁加进 `index.md` 的？在哪次提交中？请用 `git log` 找出答案。
:::

::: solution
`git log -S` 列出增加或删除了某段文字的提交：

{{SESSION:m10-e3-solution}}

`-S "Soda bread"` 找到了加入这段文字的提交 `0070943`。`--format` 随后打印出它的作者和说明。`git blame index.md` 能逐行给出类似的答案：它为每一行显示最后一次改动它的提交。
:::

::: exercise #e4 level=2 kind=coding minutes=8
**误推送的标签。** Alex 误打并推送了 `v2.0` 标签。请在本地和服务器上删除这个标签。要练习，请先像解答中的前两条命令那样，创建并推送 `v2.0` 标签。
:::

::: solution
用 `git tag -d` 在本地删除标签，用 `git push origin --delete` 在服务器上删除：

{{SESSION:m10-e4-solution}}

已经获取了 `v2.0` 的人会保留他们的那一份，因为获取从不删除标签。标签本应是永久的，所以当某个已发布的版本有问题时，请发布一个新版本，例如 `v1.0.2`，而不要移动或删除别人可能已经拿到的标签。
:::

::: exercise #e5 level=1 kind=conceptual minutes=6
**用哪种标签？** 为什么这个项目的发布版本使用附注标签而不是轻量标签？什么时候轻量标签就够了？
:::

::: solution
附注标签记录了是谁发布的、什么时候，以及一段说明，`git show` 等工具都会显示这些信息。它还可以被签名。轻量标签只是某次提交的一个名字：用作不打算分享的私人书签（例如 `before-big-change`）就足够了。
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**保护 `main`。** 在里程碑 3 中，没有任何东西能阻止 Sam 不看内容就合并拉取请求 #1，或者直接推送到 `main`。团队可以在 GitHub 上设置什么？设置之后，每个人的做法会有什么不同？
:::

::: solution
对 `main` 设置规则集或分支保护，要求必须有拉取请求，并且至少有一次批准的审查。这样，直接推送到 `main` 会被拒绝，而在作者以外的人批准之前，**Merge pull request** 按钮一直不可用。使用传统的分支保护时，还要勾选 *Do not allow bypassing the above settings*，否则这些规则不约束仓库所有者；规则集则约束绕过列表（bypass list）以外的所有人。每个人的工作方式与这个项目中完全一样：创建分支、推送、发起拉取请求、审查。
:::

## 自测 {#quiz}

```quiz
? GitHub 提示你的拉取请求 *has conflicts that must be resolved*。你该怎么做？
- [ ] 关闭拉取请求，从 `main` 重新开始
- [x] 把最新的 `main` 合并进你的分支，解决冲突，提交并推送
- [ ] 请审查者无论如何先合并
- [ ] 删除 `main`，把你的分支推送为 `main`
> 分支包含了 `main` 并解决冲突之后，拉取请求会自动更新。

? 拉取请求中的冲突通常由谁来解决？
- [x] 分支的作者，在分支上解决
- [ ] 审查者，在 `main` 上解决
- [ ] GitHub 自动解决
- [ ] 最后一个向 `main` 推送的人
> 解决冲突是对分支的一处改动，所以它会和分支的其他内容一起接受审查。

? 标签和分支有什么区别？
- [ ] 标签可以指向多次提交。
- [ ] 分支无法推送。
- [x] 标签停留在它的提交上，分支则随着新提交向前移动。
- [ ] 没有区别。
> 标签永久地为一次提交命名，这正是发布版本所需要的。

? 你打了 `v1.0` 标签并运行了 `git push`。为什么 GitHub 上没有这个标签？
- [ ] 标签只能在 GitHub 上创建，不能在本地创建。
- [x] `git push` 不发送标签；请用 `git push origin v1.0` 推送它。
- [ ] 只有附注标签才能推送。
- [ ] 推送标签之前必须先获取。
> 标签要逐个推送，或者用 `--tags` 一次全部推送。

? 按照语义化版本，一个只修正了 `v1.4.2` 中某个缺陷的版本编号为：
- [ ] `v2.0.0`
- [ ] `v1.5.0`
- [x] `v1.4.3`
- [ ] `v1.4.2-fix`
> 修正提高最后一位，新功能提高中间一位，破坏性改动提高第一位。

? 附注标签记录了哪些轻量标签没有记录的东西？
- [ ] 发布版本的文件
- [x] 是谁创建的、什么时候，以及一段说明
- [ ] 包含该提交的分支
- [ ] 被合并的拉取请求
> 附注标签本身是一个对象；轻量标签只是某次提交的一个名字。

? 哪种顺序符合这个项目所遵循的循环？
- [ ] 向 `main` 提交、推送、打标签、审查
- [x] 创建分支、提交、推送、拉取请求、审查、合并、打标签
- [ ] 复刻、变基、强制推送、打标签
- [ ] 打标签、创建分支、合并、推送
> 每项改动都经过分支和经审查的拉取请求；发布标签放在最后。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [2.6 节：打标签](https://git-scm.com/book/zh/v2/Git-基础-打标签)，以及 [git tag](https://git-scm.com/docs/git-tag) 的参考页面。
- GitHub 文档：[关于规则集](https://docs.github.com/zh/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)和[关于合并冲突](https://docs.github.com/zh/pull-requests/reference/merge-conflicts)。
- 需要时可以继续深入的方向：
  - [子模块](https://git-scm.com/book/zh/v2/Git-工具-子模块)，用于在一个仓库中包含另一个仓库；
  - [Git LFS](https://git-lfs.com/)，用于视频等大文件；
  - [钩子](https://git-scm.com/book/zh/v2/自定义-Git-Git-钩子)，用于在提交或推送时运行的脚本；
  - [git bisect](https://git-scm.com/book/zh/v2/Git-工具-使用-Git-调试)，用于找出引入缺陷的那次提交；
  - [git worktree](https://git-scm.com/docs/git-worktree)，用于同时检出多个分支；
  - [签署工作](https://git-scm.com/book/zh/v2/Git-工具-签署工作)，以及 GitHub 的[提交签名验证](https://docs.github.com/zh/authentication/managing-commit-signature-verification/about-commit-signature-verification)。
