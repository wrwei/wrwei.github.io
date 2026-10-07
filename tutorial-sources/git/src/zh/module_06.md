## 什么是远程仓库 {#s1}

到目前为止，你的仓库只存在于一台电脑上的一个文件夹里。这足以保存历史，却无法与人共享，笔记本丢了也无法保住一份副本。为了这两件事，Git 使用**远程仓库**（remote）：同一个仓库在别处的其他副本，你的仓库可以与它们交换提交。

Git 是*分布式*的：仓库的每一份副本都是完整的，带有全部历史，对 Git 本身而言没有哪份副本是特殊的。实际工作中，团队会约定其中一份（通常放在 GitHub 这样的托管服务上）作为共享副本，大家都把工作发送到那里，也从那里取回工作。对你的仓库来说，那份副本就是一个有简短名字的远程仓库。最常用的名字是 **origin**：`git clone` 会给克隆来源的仓库起这个名字，大多数人自己添加远程仓库时也选用它。

有四条命令在你的仓库和远程仓库之间传递工作：

- `git clone` 为一个远程仓库创建新的本地副本，包含它的全部历史。
- `git push` 把你的新提交发送到远程仓库。
- `git fetch` 把远程仓库的新提交取回你的仓库，但不改变你自己的分支和文件。
- `git pull` 先获取，再把获取到的内容合并到你当前的分支。

为了记住远程仓库里有什么，你的仓库会保存一些**远程跟踪分支**（remote-tracking branch），名字类似 `origin/main`，意思是“上次查看时，`main` 在 `origin` 上的位置”。它们只在你获取、拉取或推送时移动。你自己的 `main` 只在你提交或合并时移动。

::: figure #fig-06-01
你的仓库中既有你自己的分支，也有 `origin/main` 这样的远程跟踪分支，后者记录了你上次获取时远程仓库的状态。`git push` 把提交发送到远程仓库；`git fetch` 把提交取回来。
:::

## 第一次推送 {#s2}

远程仓库不一定在另一台电脑上。只要 Git 能访问到的仓库都可以，包括你自己磁盘上的一个文件夹，而这正是最容易上手的学习方式。在本模块中，一个**裸仓库**（bare repository）充当服务器。裸仓库只有历史，没有工作区：没有人在里面编辑文件，所以别人可以安全地向它推送。按照惯例，它的文件夹名以 `.git` 结尾。

三条命令把你的仓库放到这个替身服务器上：

- `git init --bare <path>` 创建空的裸仓库。
- `git remote add origin <path>` 以 `origin` 这个名字把它告诉你的仓库。`git remote -v` 列出你的远程仓库及其地址。
- `git push -u origin main` 把 `main` 推送过去。`-u`（`--set-upstream` 的简写）还会把 `origin/main` 记录为你的 `main` 的**上游**（upstream），这样以后直接运行 `git push` 或 `git pull` 时，Git 就知道该去哪里。

在本系列页面中，服务器位于一个名为 `/srv/git` 的文件夹。你无法在自己的电脑上创建这个文件夹，所以请把替身放在你的 recipes 文件夹旁边。在 `recipes` 中运行 `git init --bare ../server/recipes.git`。Git 会创建 `server` 文件夹，并打印新仓库的完整路径，例如 `/Users/you/server/recipes.git/` 或 `C:/Users/you/server/recipes.git/`。页面上凡是出现 `/srv/git/recipes.git` 的地方，请改用这个路径。如果路径中含有空格，请给它加上引号。

{{SESSION:m06-first-push}}

`git init --bare` 报告创建了一个新的空仓库。`git remote add` 什么也不打印，随后 `git remote -v` 把 `origin` 列出两次：一次作为获取的地址，一次作为推送的地址。两者通常相同。

`git push -u origin main` 报告了推送的目的地（`To /srv/git/recipes.git`）以及推送的内容：`* [new branch] main -> main` 表示你的 `main` 在远程仓库上创建了一个名为 `main` 的分支，那里之前没有这个分支。最后一行确认了上游。从现在起，`git status` 会与上游比较，并显示 *Your branch is up to date with 'origin/main'*。提交图在 `main` 旁边显示了新标签 `origin/main`，两者位于同一次提交上。

::: pitfall
如果 `git init --bare` 打印了关于分支名 `master` 的提示，说明你的 Git 还没有设置为新仓库从 `main` 开始。请像第 1 模块那样运行 `git config --global init.defaultBranch main`，删除新建的 `server` 文件夹，然后重新运行 `git init --bare`。
:::

## 克隆 {#s3}

现在又有人加入了。Sam 还没有食谱的副本。`git clone <address>` 会创建一份：它新建一个以仓库命名的文件夹（这里由 `recipes.git` 得到 `recipes`），把所有提交复制进去，检出默认分支，并把 `origin` 设置为指回这个地址。不需要 `git init`、`git remote add` 或 `-u`；克隆会把这些都做好。

在这个动手环节中，Sam 在自己的文件夹里克隆。在本系列页面中，每个人都有一个主文件夹，即 `/home/alex` 或 `/home/sam`，动手环节可以以其中任何一人的身份操作。

::: note title="一台电脑扮演两个人"
要以 Sam 的身份跟着操作，请打开第二个终端窗口。在你自己的 recipes 旁边为 Sam 建一个文件夹，例如在主文件夹中建一个名为 `sam` 的文件夹（`cd ~`、`mkdir sam`、`cd sam`），然后在那里用你的替身服务器的路径进行克隆。接着，在 Sam 的克隆中设置 Sam 的姓名和邮箱，不加 `--global`，使它们只对这个仓库生效：`git config user.name "Sam Lee"` 和 `git config user.email "sam@example.com"`。页面以 Alex 的身份操作时使用第一个窗口，以 Sam 的身份操作时使用第二个窗口。
:::

{{SESSION:m06-clone}}

`git clone` 说明了它正在做什么：`Cloning into 'recipes'...`，然后是 `done.`。Sam 的文件夹中现在有同样的文件，`git log --oneline` 也显示同样的提交，哈希与 Alex 的完全相同：同一次提交在每份副本中都是同一次提交。

`git remote -v` 显示克隆已经知道自己的 `origin`。`git branch -a`（*a* 表示 all，全部）除了本地分支，还会列出远程跟踪分支。Sam 有一个本地分支 `main`，以及 `remotes/origin` 下的两项：分支 `origin/main`，以及记录远程仓库默认分支的 `origin/HEAD`。你可以忽略 `origin/HEAD`；本系列的提交图也不画它。Sam 的 `main` 已经把 `origin/main` 作为上游，所以 Sam 可以直接推送和拉取。

## 获取与拉取 {#s4}

Alex 加入了一份柠檬蛋糕食谱并推送了它。Sam 怎样才能拿到呢？不会自动拿到：只有当你运行需要与远程仓库通信的命令时，Git 才会与它通信。在那之前，Sam 的仓库完全不知道有什么变化。

`git fetch` 向远程仓库索要你还没有的提交。它把这些提交存进你的仓库，并移动 `origin/main` 这样的远程跟踪分支，使其与远程仓库一致。除此之外它什么也不改：不改你的分支，也不改你的文件。你可以先看看取回了什么，再决定怎么处理。

`git pull` 一次完成两步：先获取，再把上游分支（这里是 `origin/main`）合并到你当前的分支。如果你的分支没有自己的新提交，这次合并就是快进，和第 4 模块中一样。

{{SESSION:m06-fetch-pull}}

Alex 的 `git push` 显示的一行与第一次推送不同：`8bf3c2d..d5392e7  main -> main` 表示远程仓库上的 `main` 从 `8bf3c2d` 移到了 `d5392e7`。

再看 Sam 的两次 `git status`。获取之前，Git 显示 *Your branch is up to date with 'origin/main'*，尽管 Alex 的提交已经在服务器上了。Git 只会把你的分支与你的仓库所知道的情况进行比较，而 Sam 的仓库还没有去问过。运行 `git fetch`（它报告 `8bf3c2d..d5392e7  main -> origin/main`）之后，状态变成了 *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded*。

`git log --oneline main..origin/main` 列出 `origin/main` 有而 `main` 没有的提交：两个点的意思是“从右边能到达、从左边不能到达”。提交图显示了同样的情况：`origin/main` 比 `main` 领先一次提交。最后，`git pull` 快进了 `main`，`ls` 显示 Sam 的文件夹中有了 `cake.md`。

::: tip
每次开始工作时、每次推送之前都先获取一下。这总是安全的：它从不改变你的分支或文件。然后 `git status` 会告诉你，你是领先、落后，还是两者都有。
:::

## 推送被拒绝时 {#s5}

有时两个人先后推送，中间却没有获取。在下一个动手环节中，Alex 已经推送了蛋糕食谱，但 Sam 没有获取，就在旧的 `main` 之上提交了一份汤的食谱。于是 Sam 的推送失败了，因为远程仓库的 `main` 上有一次 Sam 的 `main` 所不包含的提交。接受这次推送就会丢掉 Alex 的提交，所以 Git 拒绝了它。补救办法是先把 Alex 的工作取回来并合并，然后再推送。

较新版本的 Git 还会请你做一次选择：当双方都有新提交时，`git pull` 应该怎样把你的工作与远程仓库的工作结合起来。在本系列中，你选择合并，和第 5 模块一样。这个动手环节展示了这个问题及其答案。

要跟着操作，请以 Alex 的身份提交一些内容并推送，然后在 Sam 的窗口中不先拉取就提交另外一些内容，再推送。

{{SESSION:m06-rejected}}

被拒绝的推送显示 `! [rejected] main -> main (fetch first)`，提示信息解释了原因：远程仓库中有你本地没有的工作。双方都没有丢失或改变任何东西。

接着，第一次 `git pull` 取回了 Alex 的提交（`8bf3c2d..d5392e7  main -> origin/main`），但随后停了下来，显示 *fatal: Need to specify how to reconcile divergent branches*。*Divergent*（分叉）是指两个分支都有对方所没有的提交，就像三方合并那样。提示列出了三种设置：

- `pull.rebase false` 进行合并，就是你从第 4 模块以来一直在做的。
- `pull.rebase true` 进行变基（rebase），第 8 模块会解释。
- `pull.ff only` 只在可以快进时才拉取，否则拒绝。

`git config --global pull.rebase false` 为你的所有仓库选择合并，这样 Git 就不会再问了。第二次 `git pull` 随即完成合并，`git push` 也成功了。在你的电脑上，这次合并会打开编辑器，说明是 `Merge branch 'main' of` 后面跟着远程仓库的地址；像第 4 模块那样保存并关闭即可。提交图显示了结果：一次合并提交把 Sam 的汤食谱和 Alex 的蛋糕食谱连在一起，`main` 和 `origin/main` 位于同一次提交上。

如果两个人改动了相同的行，合并就会因冲突而停下。你要完全像第 5 模块那样解决冲突、提交，然后再推送。

::: note title="Windows"
在 Windows 上，Git 安装程序会询问 `git pull` 应该怎样工作，并默认替你设置 `pull.rebase false`。因此你的第一次 `git pull` 会直接合并，不会出现 *fatal* 信息；请从第二次 `git pull` 接着看。
:::

## 把仓库放到 GitHub 上 {#s6}

替身服务器教会了你这些命令；托管服务则让仓库在任何地方都能访问。本节把你的食谱放到 GitHub 上。GitHub 的网页时有变化，所以具体的按钮请参照链接中的 GitHub 文档。Git 命令保持不变。

1. **创建账号**：在 github.com 上按照[在 GitHub 上创建账户](https://docs.github.com/zh/account-and-profile/how-tos/account-management/creating-an-account-on-github)操作。选一个你愿意公开的用户名：它会出现在你拥有的每个仓库的地址中。
2. **创建一个空仓库**，命名为 `recipes`，按照[创建新仓库](https://docs.github.com/zh/repositories/creating-and-managing-repositories/creating-a-new-repository)操作。保持它为空：不要添加 README、许可证或 `.gitignore`，因为你的本地仓库已经有要推送的历史了。如果愿意，你可以把它设为私有。
3. **为 Git 设置登录。** GitHub 不接受用你的账户密码执行 Git 命令。最简单的安全做法是使用 [GitHub CLI](https://cli.github.com/)：安装它，运行 `gh auth login`，选择 GitHub.com 和 HTTPS，并在它询问是否用你的 GitHub 凭据为 Git 登录时选择同意。Git for Windows 自带 Git Credential Manager，你第一次推送时，它会打开浏览器窗口让你登录。[在 Git 中缓存 GitHub 凭据](https://docs.github.com/zh/get-started/git-basics/caching-your-github-credentials-in-git)介绍了这两种方式。有经验的用户常常改用 [SSH 连接](https://docs.github.com/zh/authentication/connecting-to-github-with-ssh)。
4. **把 `origin` 指向 GitHub 并推送。** 先在你的 recipes 文件夹中运行 `git pull`，让它包含 Sam 在第 5 节中的工作。GitHub 在仓库页面上显示仓库的地址，形如 `https://github.com/<username>/recipes.git`。在你的 recipes 文件夹中运行：

```text
git remote set-url origin https://github.com/<username>/recipes.git
git push -u origin main
```

`git remote set-url` 修改一个已有远程仓库的地址，于是 `origin` 现在指的是 GitHub，而不再是你的替身文件夹。`git push -u` 像之前一样发送你的历史并设置上游。刷新 GitHub 上的仓库页面：你的文件和提交都在那里了。从现在起，`git push`、`git fetch` 和 `git pull` 都与 GitHub 通信。

::: note title="如果你想保留替身"
你也可以保持 `origin` 不变，把 GitHub 以另一个名字添加为第二个远程仓库：`git remote add github https://github.com/<username>/recipes.git`，然后运行 `git push -u github main`。一个仓库想要多少个远程仓库都可以。第 7 模块假定 `origin` 是 GitHub。
:::

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**哪一个移动了？** 你的仓库有 `main` 和 `origin/main`。对于下面每条命令，说出两者中哪个可能移动：`git fetch`、`git pull`、`git commit`、`git push`。
:::

::: solution
- `git fetch` 只移动 `origin/main`，使其指向远程仓库上 `main` 的位置。
- `git pull` 先移动 `origin/main`（获取），再移动 `main`（合并）。
- `git commit` 只移动 `main`。
- `git push` 移动远程仓库上的 `main`，因此也会移动记录它的 `origin/main`。你自己的 `main` 保持不动。
:::

::: exercise #e2 level=1 kind=coding minutes=4
**克隆到你选择的文件夹。** 以 Sam 的身份把食谱仓库克隆到名为 `family-recipes` 的文件夹，而不是 `recipes`。
:::

::: solution
在地址后面给 `git clone` 加上文件夹名：

{{SESSION:m06-e2-solution}}

文件夹名只在本地有意义：远程仓库仍叫 `origin`，地址也没有变。
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**读懂状态。** 下面每条信息是什么意思？接下来你会运行什么？

1. *Your branch is ahead of 'origin/main' by 2 commits.*
2. *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.*
3. *Your branch and 'origin/main' have diverged, and have 1 and 1 different commits each, respectively.*
:::

::: solution
1. 你有两次远程仓库所没有的提交（以你上次获取时为准）。运行 `git push`。
2. 远程仓库有一次你所没有的提交，而你没有自己的新提交。运行 `git pull`，它会快进。
3. 双方都有对方所没有的提交。运行 `git pull`，它会进行合并（如有冲突，像第 5 模块那样解决），然后运行 `git push`。

这三条都是与你的仓库上次看到的 `origin/main` 比较，所以要得到最新的结论，请先运行 `git fetch`。
:::

::: exercise #e4 level=1 kind=coding minutes=5
**分享一个新分支。** 以 Alex 的身份创建名为 `soups` 的分支，在上面提交一份汤的食谱，并推送这个分支，让 Sam 能够获取它。检查它是否设置了上游。要跟着操作，请换一个新的分支名，例如 `salads`：你的仓库中已经有第 4 模块留下的 `soups` 分支。
:::

::: solution
像推送 `main` 时那样，用 `-u` 推送这个分支：

{{SESSION:m06-e4-solution}}

`git branch -vv`（两个 `v`）在方括号中显示每个分支的上游：`soups` 现在跟踪 `origin/soups`。
:::

::: exercise #e5 level=1 kind=conceptual minutes=3
**获取还是拉取？** 你正在 `main` 上做一处改动，想知道同事是否推送了什么，但暂时不想改变你的文件。你会运行哪条命令？为什么？
:::

::: solution
`git fetch`。它取回同事的提交并更新 `origin/main`，但不动你的分支和文件。随后 `git status` 和 `git log --oneline main..origin/main` 会显示取回了什么。等你准备好合并时再拉取。
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**被拒绝的密码。** 你第一次向 GitHub 推送时，Git 要求输入用户名和密码。你输入了 GitHub 密码，推送却失败了，提示说已不再支持密码认证。这是怎么回事？你应该怎么做？
:::

::: solution
GitHub 从 2021 年起不再接受用账户密码执行 Git 操作。请改用安全的登录方式：用 GitHub CLI 运行 `gh auth login`，或者像第 6 节那样让 Git Credential Manager 通过浏览器为你登录。然后再次推送。其他做法还有：在要求输入密码的地方输入个人访问令牌（personal access token），或者使用 SSH。
:::

## 自测 {#quiz}

```quiz
? `origin` 是什么？
- [ ] 每个仓库都有的一个特殊分支
- [x] 仓库克隆来源的远程仓库的常用名字
- [ ] 仓库中的第一次提交
- [ ] GitHub 对你账户的称呼
> `git clone` 把远程仓库命名为 `origin`，大多数人用 `git remote add` 时也用这个名字。

? `git fetch` 会改变你仓库中的什么？
- [ ] 工作区中的文件
- [ ] 你当前的分支
- [x] 只改变 `origin/main` 这样的远程跟踪分支
- [ ] 什么都不改变：它只打印有哪些新内容
> 获取会存下新提交并移动 `origin/main`；你的分支和文件保持原样。

? 当 `pull.rebase` 设为 `false` 时，`git pull` 做什么？
- [x] 先 `git fetch`，再合并上游分支
- [ ] 先 `git push`，再 `git fetch`
- [ ] 重新复制整个仓库
- [ ] 删除你的本地提交，换成远程仓库的提交
> 拉取就是获取之后再合并（在其他设置下则是变基）。

? 推送失败并显示 `! [rejected] main -> main (fetch first)`。这是什么意思？
- [ ] 你的网络连接失败了。
- [ ] 你无权向这个仓库推送。
- [x] 远程仓库中有你的分支所不包含的提交。
- [ ] 你的提交中有冲突。
> 先拉取，让你的分支包含远程仓库的提交，然后再推送。

? `git push -u origin main` 中的 `-u` 起什么作用？
- [ ] 一次推送所有分支。
- [x] 把 `origin/main` 记录为你的 `main` 的上游。
- [ ] 撤销上一次推送。
- [ ] 推送时不要求输入密码。
> 设置了上游之后，直接运行 `git push` 或 `git pull` 时 Git 就知道去哪里，`git status` 也会与它比较。

? `git status` 显示 *Your branch is up to date with 'origin/main'*。你能确定什么？
- [ ] 自你上次拉取以来，没有人推送过任何东西。
- [x] 你的分支与你的仓库上次看到的 `origin/main` 一致。
- [ ] 你的工作已经备份到服务器上了。
- [ ] 你的工作区没有任何改动。
> Git 是与它对远程仓库的最新记录比较；运行 `git fetch` 才能更新这份记录。

? 下面哪种方式适合让 Git 登录 GitHub？
- [ ] 在 Git 要求时输入你的 GitHub 账户密码
- [ ] 把密码写进仓库地址里
- [x] 运行 `gh auth login`，或者使用 Git Credential Manager
- [ ] 把仓库设为公开，这样就不需要登录
> GitHub 不接受用账户密码执行 Git 操作；GitHub CLI 和 Git Credential Manager 会设置安全的登录方式。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [2.5 节：远程仓库的使用](https://git-scm.com/book/zh/v2/Git-基础-远程仓库的使用)。
- [git remote](https://git-scm.com/docs/git-remote)、[git fetch](https://git-scm.com/docs/git-fetch)、[git pull](https://git-scm.com/docs/git-pull) 和 [git push](https://git-scm.com/docs/git-push) 的参考页面。
- GitHub 文档：[将本地托管的代码添加到 GitHub](https://docs.github.com/zh/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) 和[关于远程仓库](https://docs.github.com/zh/get-started/git-basics/about-remote-repositories)。
