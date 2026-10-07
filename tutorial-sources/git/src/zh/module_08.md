## 唯一的规则 {#s1}

本模块介绍会改变历史的工具：把分支往回移、把提交重放到别处，或者把几次提交合成一次的命令。用在你自己的工作上，它们能帮你保持历史整洁易读。随意用在共享的工作上，就会惹出真正的麻烦。所以先说那条唯一的规则：

::: keyidea
**不要改写别人已经拿到的提交。** 一旦你把提交推送到了别人也在使用的分支（例如 `main`），就把它们当作固定不变的。要撤销它们，请使用 `git revert`（第 3 模块），它会添加一次新提交，而不是改写它们。
:::

为什么？改写历史从来不是编辑提交，而是生成带有新哈希的新提交，再把分支移过去，就像你在第 3 模块中用 `--amend` 看到的那样。每个已经拿到旧提交的人，手里的历史就与你的不再一致了。他们下一次拉取时会把新旧两个版本合并在一起，造成重复的工作。你下一次推送会被拒绝，而强制推送则会丢掉他们的工作。

在你自己的分支上，只要还没有人在它的基础上工作，改写就没有问题，而且往往是对审查者的体贴。只有你自己在开发的功能分支，即使已经为拉取请求推送过，也算是你自己的，只要你明确告诉 Git 你打算覆盖它（第 4 节）。

本模块中有两个工具不改写任何东西：`git stash`（第 2 节）把未提交的工作暂放一边，`git reflog`（第 6 节）则能找回你以为已经丢失的提交。

## 暂放工作 {#s2}

你的一项改动做到一半，突然来了更紧急的事：另一个分支上要修个问题，或者要试试同事的拉取请求。你的工作还不能提交，而带着未提交的改动切换分支是有风险的（第 4 模块练习 4）。`git stash` 能解决这个问题。它把你未提交的改动（无论是否已暂存）保存到一个叫做**贮藏**（stash）的栈中，并把工作区恢复到最近一次提交的状态。之后，`git stash pop` 会把这些改动放回来，并把它们从贮藏中移除。

在这个动手环节中，Alex 正在给煎饼加一种配料，这时 README 需要先修正一下。要跟着操作，请开始编辑任意一个已跟踪的文件，然后把改动贮藏起来。

{{SESSION:m08-stash}}

`git stash` 报告了它保存的内容 `WIP on main`（“work in progress”，进行中的工作），并给出了它所基于的提交。随后 `git status` 显示工作区是干净的，`git stash list` 显示一个条目 `stash@{0}`，也就是最新的那个。工作区干净了，Alex 提交了对 README 的修改。`git stash pop` 把写了一半的煎饼那一行作为未暂存的改动放了回来，`git diff` 显示它正等着你写完。

还有几点需要了解：

- `git stash` 只保存已跟踪的文件。要把新的未跟踪文件也包括进去，请使用 `git stash -u`。
- `git stash list` 列出所有条目，最新的在前。`git stash apply` 把最新的条目放回来，但仍把它留在贮藏中；`git stash drop` 删除它。
- 如果贮藏的改动与你之后提交的内容冲突，`git stash pop` 会停下来并留下冲突标记。像第 5 模块那样解决，然后运行 `git stash drop`，因为在这种情况下条目会被保留。
- 贮藏只存在于本地，不会被推送。不要把工作在那里放太久；用一个带有“进行中”提交的分支，更容易找回来。

## 收回提交 {#s3}

`git reset <commit>` 把你当前的分支移回到更早的一次提交，收回它之后的那些提交。与 `git revert` 不同，它会改写历史，所以只能用在你还没有推送的提交上。它的选项决定了那些提交中的改动会怎样：

- `git reset --soft <commit>` 只移动分支。改动留在暂存区，可以直接再次提交。
- `git reset <commit>`，即默认的 *mixed* 方式，还会重置暂存区。改动留在你的工作区，处于未暂存状态。
- `git reset --hard <commit>` 还会重置工作区。改动从你的文件中消失，所有未提交的工作也一样。

::: figure #fig-08-01
每种 `git reset` 各保留什么。三种方式都会把分支往回移；区别在于暂存区和工作区会怎样。
:::

和第 3 模块一样，`HEAD~1` 表示“HEAD 之前的一次提交”。在这个动手环节中，Alex 用一条含糊的说明提交了一小撮盐，先用 `--soft` 收回这次提交，再用更好的说明重新提交，然后又用默认方式收回了一次。

{{SESSION:m08-reset}}

`git reset --soft HEAD~1` 什么也不打印，但 `git status` 把盐显示为 *Changes to be committed*：提交没了，它的改动又处于暂存状态。这使 `--soft` 成为重做提交的一种方式，例如把最近几次提交合成一次：用 `--soft` 退回到它们之前，然后只提交一次。

用默认方式重置之后，Git 报告 `Unstaged changes after reset:` 并列出 `pancakes.md`。`git status` 也确认了这一点：改动现在位于工作区，处于未暂存状态。拆分一次提交就用这个办法：重置它，然后分别暂存并提交各个部分。`git log --oneline` 确认两次加盐的提交都已从 `main` 上消失。

::: pitfall
`git reset --hard` 会丢弃工作区中未提交的改动，Git 无法把它们找回来。它收回的提交通常可以从 reflog 中恢复（第 6 节），但未提交的工作不行。请先运行 `git status`，把想保留的东西贮藏起来。
:::

## 变基 {#s4}

在第 7 模块中，Alex 通过把 `origin/main` 合并到功能分支，让分支跟上了最新进展。**变基**（rebase）是另一种做法。`git rebase main` 取出你的分支上 `main` 所没有的提交，把它们逐个重放到 `main` 最新的提交之上。结果中的文件与合并相同，但历史是一条直线，没有合并提交，就好像你是从今天的 `main` 开始这个分支的。

重放会生成带有新哈希的新提交，所以变基会改写分支。对你自己的功能分支来说这没有问题，但如果分支已经推送过，就会产生一个后果，这个动手环节会展示出来。Alex 的 `soups` 分支在服务器上，而 `main` 已经向前推进了。要跟着操作，请在一个分支上提交并推送，然后向 `main` 添加一次提交。

{{SESSION:m08-rebase}}

比较两张提交图。变基之前，`soups` 和 `main` 已经分叉，就像三方合并那样。运行 `git rebase main` 之后（它报告 `Successfully rebased and updated refs/heads/soups`），汤的提交作为一次新提交 `a11c867` 位于 `main` 最新的提交之上。旧的汤提交 `968c34b` 仍然是 `origin/soups` 所指向的位置：服务器没有变化。

所以 `git push` 被拒绝，原因是 `non-fast-forward`：服务器上的 `soups` 包含 `968c34b`，而你变基后的分支已经替换了它。这里你知道这个分支是你自己的，所以用 `git push --force-with-lease` 覆盖它。Git 报告 `(forced update)`。如果服务器上的分支不在你的 `origin/soups` 所记录的位置，也就是说自你上次获取以来有人向它推送过，`--force-with-lease` 就会拒绝执行。普通的 `--force` 则不管三七二十一直接覆盖，可能毁掉同事的工作；不要用它。

什么时候该变基而不是合并？许多团队对自己的功能分支进行变基以保持历史是直线，分支完成时再合并。另一些团队则始终合并。无论哪种，那条唯一的规则都适用：永远不要对别人正在使用的分支变基。还要记住，`git pull` 也可以用变基代替合并，方法是使用 `git pull --rebase`，或者第 6 模块中提到的 `pull.rebase true` 设置。

如果重放的某次提交发生冲突，变基会停下来，与合并很像。解决文件中的冲突，`git add` 它，然后运行 `git rebase --continue`；或者运行 `git rebase --abort` 回到开始之前的状态。练习 5 展示了一次这样的冲突，以及它与合并的一个区别，每个人第一次遇到时都会吃一惊。

## 压缩修正 {#s5}

在分支接受审查之前，你可能会发现它较早的某次提交中有个错误：一个错字，一行漏掉的内容。单独的一次“修正错字”提交，会让以后每个阅读历史的人都多看一些噪音。**交互式变基**（interactive rebase），即 `git rebase -i`，让你在重放之前编辑提交列表：调整顺序、改写说明、丢弃提交，或者把几次提交**压缩**（squash）成一次。

压缩一处修正最简单的办法，是让 Git 替你写好指令：

1. 做出修正，用 `git commit --fixup <commit>` 提交它，并指明它属于哪次提交。Git 会给它的说明加上 `fixup! `，后面跟着那次提交的说明。
2. 运行 `git rebase -i --autosquash main`。Git 会打开编辑器，里面是一份**待办列表**（to-do list），分支上的每次提交占一行，而且已经排好了顺序：修正紧跟在它所修正的提交之后，并标为 `fixup`。
3. 保存并关闭编辑器。Git 重放这些提交，把修正并入较早的那次提交。

在这个动手环节中，汤食谱的标题有个错字“Tomatoe”，而且之后又提交了一份面包食谱。要跟着操作，请在一个分支上做两次提交，然后修正第一次提交中的某处内容。

{{SESSION:m08-squash}}

`git commit --fixup HEAD~1` 指的是最新提交之前的那一次，也就是汤的提交，Git 把新提交命名为 `fixup! Add a tomato soup recipe`。当你在自己的电脑上运行 `git rebase -i --autosquash main` 时，编辑器会显示这份待办列表（后面还有一大段解释各个命令的注释）：

```text
pick bc5616c # Add a tomato soup recipe
fixup 2b52993 # fixup! Add a tomato soup recipe
pick 49f29eb # Add a soda bread recipe

# Rebase 8bf3c2d..2b52993 onto 8bf3c2d (3 commands)
```

每一行是一个命令加一次提交，从上到下依次执行：`pick` 原样重放一次提交，`fixup` 把它并入上面那次提交，并保留上面那次提交的说明。不做修改直接保存，列表就会执行，动手环节中就是这样。最后的 `git log --oneline` 显示两次提交而不是三次，哈希都变了：汤的提交现在包含了改正后的标题。

你也可以自己编辑这份列表。把 `pick` 改成 `reword` 可以修改说明，改成 `squash` 可以把一次提交并入上面那次并合并两者的说明，改成 `drop` 可以删除它；移动各行可以调整提交的顺序。如果你保存的是一份空列表，变基就会停止，什么也不改变。

## reflog {#s6}

不再有任何分支指向的提交并不会被马上删除。Git 会把它们保留一段时间，而**引用日志**（reflog，即 *reference log*）记录了 HEAD 到过的每一个位置：每次提交、重置、切换、合并和变基。`git reflog` 按从新到旧的顺序列出它们，所以你能找到被硬重置、变基或删除分支带走的提交。

在这个动手环节中，Alex 不小心重置掉了两次提交，然后把它们找了回来。要跟着操作，请做两次提交，然后运行 `git reset --hard HEAD~2`。

{{SESSION:m08-reflog}}

运行 `git reset --hard HEAD~2` 之后，`git log --oneline` 不再显示蛋糕和汤的提交。`git reflog` 却仍然显示它们。每一行显示 HEAD 当时所在的位置、这个位置的名字，以及是什么让它移动的：`HEAD@{0}` 是现在（`reset: moving to HEAD~2`），`HEAD@{1}` 是紧挨着的前一个位置，即汤的提交 `ab03771` 之后。`git reset --hard ab03771` 把 `main` 移回那里，日志与原来完全一样。

如果想救回一次提交而又不移动当前分支，可以在它那里新建一个分支，例如 `git branch rescue ab03771`。用 `git branch -D` 删除的分支也能这样找回：在 reflog 中找到它的最后一次提交，然后重新创建这个分支。

::: note title="HEAD@{1} 与 PowerShell"
你也可以直接用 reflog 中的位置名，例如 `git reset --hard HEAD@{1}`。在 PowerShell 中，请给这样的名字加上引号，写成 `'HEAD@{1}'`，因为 PowerShell 对花括号另有解释。reflog 中的哈希在任何 shell 中都能用。
:::

reflog 也有局限：它只存在于你自己的仓库中，从不推送；Git 最终会删除旧的条目，默认是 90 天之后，对于已不在任何分支上的提交则是 30 天之后。而且它只记录提交，所以对于被 `git reset --hard` 或 `git restore` 丢掉的未提交改动，它也无能为力。经常提交，能彻底丢失的东西就会很少。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**可以改写吗？** 下面哪些做法是安全的？逐一说明理由。

1. 修补你最近一次尚未推送的提交。
2. 对你的功能分支变基（它为了一个只有你在做的拉取请求而推送过），然后用 `--force-with-lease` 推送。
3. 在把两次提交推送到共享仓库之后，把 `main` 重置回两次提交之前。
4. 撤销 `main` 上一次整个团队都已拿到的提交。
:::

::: solution
1. 安全：没有别人拿到过这次提交。
2. 安全：分支是你自己的，而且如果有人向它推送过，`--force-with-lease` 会停下来。请告诉审查者你改写了它。
3. 不安全：团队已经拿到了这些提交。请改用 `git revert`。
4. 安全：`git revert` 添加一次新提交，不改写任何东西。
:::

::: exercise #e2 level=1 kind=coding minutes=5
**紧急修正。** 你在 `soups` 分支上写汤的食谱写到一半，这时 `main` 上的 README 需要修正。把你的工作暂放一边，在 `main` 上完成修正，再回到你的汤食谱，并恢复你的工作。要跟着操作，请在一个分支上开始编辑，但不要提交。
:::

::: solution
贮藏、切换、提交修正、切换回来，再取回贮藏：

{{SESSION:m08-e2-solution}}

贮藏条目记录了它来自哪个分支（`WIP on soups`），但你可以在任何分支上取回它。
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**用哪种重置？** 下面这些提交都还没有推送。每种情况适合哪种形式的 `git reset HEAD~1`？

1. 你最近一次提交混杂了两处不相关的改动，你想分别提交它们。
2. 你想给最近一次提交再加一个文件，并写一条更好的说明。
3. 你最近一次提交是一次失败的试验，你既不要这次提交，也不要其中的改动。
:::

::: solution
1. 默认方式（mixed）：改动回到未暂存状态，你可以分别暂存并提交各个部分。
2. `--soft`：改动保持暂存；加上那个文件，再提交一次。（`git commit --amend` 一步就能做到同样的事。）
3. `--hard`：提交和它的改动都没了。请先查看 `git status`，免得丢失未提交的工作。
:::

::: exercise #e4 level=2 kind=conceptual minutes=5
**被删除的分支。** 昨天你用 `git branch -D` 删除了名为 `experiment` 的分支，今天你需要它上面的一次提交。怎样把这个分支找回来？
:::

::: solution
运行 `git reflog`，找到与 `experiment` 有关的最后一行，例如你在它上面做的一次提交，或者 `checkout: moving from experiment to main`。记下那次提交的哈希，然后运行 `git branch experiment <hash>`。分支就回来了，所有提交都在。
:::

::: exercise #e5 level=2 kind=coding minutes=7
**变基过程中的冲突。** 你在 `less-sugar` 上把糖改成了 30 g；与此同时，`main` 把它改成了 40 g。把 `less-sugar` 变基到 `main` 上，最终定为 35 g。要跟着操作，请像第 5 模块第 3 节那样做出这两处改动。
:::

::: solution
变基在发生冲突的那次提交处停下。解决文件中的冲突，暂存它，然后继续：

{{SESSION:m08-e5-solution}}

看看这些标记：在变基中，`<<<<<<< HEAD` 下面是 `main` 的版本 40 g，`>>>>>>> cbca0db (Use less sugar)` 上面才是你的版本。这两个标签与合并时正好相反，因为变基是把你的提交重放到 `main` 之上，所以 HEAD 是新的基础。随后 `git rebase --continue` 提交这次重放的提交（在你的电脑上，它会让你编辑说明），并完成变基。
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**用哪个工具？** 为每种情况说出对应的命令。

1. 你最近一次尚未推送的提交的说明有个错字。
2. 共享的 `main` 上有一次提交导致构建失败。
3. 你需要一个干净的工作区十分钟，但不想提交。
4. 你的拉取请求中有一次“修正错字”的提交，它本该属于更早的一次提交。
5. 你重置得太远了，需要把那些提交找回来。
:::

::: solution
1. `git commit --amend`。
2. `git revert <commit>`。
3. `git stash`，然后 `git stash pop`。
4. `git commit --fixup <commit>` 和 `git rebase -i --autosquash main`，然后 `git push --force-with-lease`。
5. `git reflog`，然后 `git reset --hard <hash>`。
:::

## 自测 {#quiz}

```quiz
? 关于改写历史的规则是什么？
- [ ] 永远不要使用 `git rebase`。
- [x] 不要改写别人已经拿到的提交。
- [ ] 只在 `main` 上改写历史。
- [ ] 改写之后总是使用 `--force`。
> 在你自己尚未推送或未与人共享的工作上，改写没有问题；共享的提交要用 `git revert` 撤销。

? `git stash` 做什么？
- [ ] 把你的改动提交到服务器上的一个隐藏分支。
- [x] 保存你未提交的改动，并把工作区恢复到最近一次提交的状态。
- [ ] 删除你未提交的改动。
- [ ] 把分支往回移一次提交。
> 之后用 `git stash pop` 把改动取回来。

? 运行 `git reset --soft HEAD~1` 之后，最近一次提交中的改动在哪里？
- [x] 在暂存区中
- [ ] 只在 reflog 中
- [ ] 没了
- [ ] 在一个新分支上
> `--soft` 只移动分支；默认方式会取消暂存这些改动，`--hard` 则会删除它们。

? 哪条命令可能彻底毁掉未提交的工作？
- [ ] `git reset --soft HEAD~1`
- [ ] `git stash`
- [ ] `git rebase main`
- [x] `git reset --hard HEAD~1`
> `--hard` 会重置工作区；未提交的改动不在 reflog 中。

? 对一个已经推送过的分支变基之后，为什么 `git push` 会被拒绝？
- [ ] 变基失败了。
- [x] 变基后的提交取代了已推送的提交，所以这次推送不是快进。
- [ ] 变基后的分支无法推送。
- [ ] 远程仓库过时了。
> 如果分支只属于你一个人，就用 `--force-with-lease` 推送。

? 在变基到 `main` 的过程中，`<<<<<<< HEAD` 和 `=======` 之间是哪个版本？
- [ ] 你的分支上的版本
- [x] `main` 的版本，即这些提交正在被重放到的基础
- [ ] 第一次提交中的版本
- [ ] Git 建议的解决方案
> 在变基中，HEAD 是新的基础；你的提交的版本位于 `=======` 之后。

? `git reflog` 显示什么？
- [ ] 远程仓库上的每一次提交
- [ ] 即将被推送的提交
- [x] HEAD 到过的位置，包括已不在任何分支上的提交
- [ ] 你还没有提交的改动
> 用 reflog 中的哈希进行重置或创建分支，就能找回丢失的提交。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [3.6 节：变基](https://git-scm.com/book/zh/v2/Git-分支-变基)、[7.3 节：贮藏与清理](https://git-scm.com/book/zh/v2/Git-工具-贮藏与清理)、[7.6 节：重写历史](https://git-scm.com/book/zh/v2/Git-工具-重写历史)和 [7.7 节：重置揭密](https://git-scm.com/book/zh/v2/Git-工具-重置揭密)。
- [git stash](https://git-scm.com/docs/git-stash)、[git reset](https://git-scm.com/docs/git-reset)、[git rebase](https://git-scm.com/docs/git-rebase) 和 [git reflog](https://git-scm.com/docs/git-reflog) 的参考页面。
