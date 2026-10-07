## 分支是什么 {#s1}

到目前为止，每次提交都落在同一条历史线上。真实的工作很少这么整齐。你也许想试一个新食谱，又不想打扰那些已经好用的食谱；或者一项大改动做到一半时，需要先修正一个错字。**分支**（branch）让你把不同的工作线并排保存，等它们准备好时再合并到一起。

在 Git 中，分支只是一个**指向某次提交的可移动标签**。创建分支不复制任何东西：Git 只记下新的名字和它指向的提交，仅此而已。这就是分支既廉价又快速的原因，也是为什么人们习惯为每个想法（无论多小）都创建一个分支，用完再删掉。

`main` 是一个普通的分支。它没有任何特殊能力，只是仓库一开始就有的分支，也是大多数项目当作主线的分支。

让分支移动的正是这个标签。你提交时，Git 生成新的提交，并把你所在分支的标签向前移到这次新提交上。其他分支留在原处。这样，每个分支都长出自己的一条提交线，而分叉之前的历史为它们所共有。

::: analogy
分支就像书里的书签，而不是这本书的复印件。书签不花什么成本，你可以夹好几个，并随着阅读把每个书签往后移。书页本身只有一份。
:::

使用分支的大部分工作都遵循同一个简短的循环，本模块会逐步走一遍：

1. 为一项工作创建一个分支，并切换过去。
2. 在这个分支上随意提交，多少次都可以。`main` 不受影响。
3. 工作完成后，切换回 `main`，把这个分支合并进来。
4. 删除这个已经完成任务的分支。

## 创建和切换分支 {#s2}

大部分工作由两条命令完成：

- `git branch` 列出你的分支，你所在的分支旁边有一个星号（`*`）。`git branch <name>` 在你所在的提交上创建一个新分支，但不会切换过去。
- `git switch <name>` 把你带到某个分支上，并更新工作区中的文件，使其与该分支最新的提交一致。

本模块的动手环节都从一个只有两次提交（一个 README 和一份煎饼食谱）的小食谱仓库开始。你自己的仓库提交更多，哈希也不同，但这对命令的用法没有任何影响。在这个动手环节中，你为甜点创建一个分支，并在上面加入一份蛋糕食谱。

{{SESSION:m04-branches}}

刚运行完 `git branch desserts`，列表中就有了两个分支，星号表明你仍在 `main` 上。第一张提交图说明了创建分支为什么能瞬间完成：`desserts` 和 `main` 是同一次提交 `288d56b` 上的两个标签。

本系列页面中的提交图把提交画成圆圈，最新的在最上面，每次提交都有一条线连向它的父提交（parent）。标签写出指向该提交的分支名，`HEAD → main` 标出你所在的分支。在终端中，`git log --oneline --graph --all` 会用文字画出同样的图。

运行 `git switch desserts` 并提交之后，第二张图显示只有 `desserts` 标签移动了，移到新的提交 `ccf2a69` 上。`main` 仍停在 `288d56b`。

再看两次 `ls` 命令。在 `main` 上，文件夹里只有 `README.md` 和 `pancakes.md`；在 `desserts` 上，`cake.md` 又回来了。切换分支会让文件夹中的文件与你切换到的分支保持一致。蛋糕食谱从未丢失：它保存在 `desserts` 的提交中，每当你切换到这个分支，Git 就会把它放回来。

## HEAD {#s3}

你在第 3 模块和上面的提交图中都见过 HEAD。**HEAD** 是 Git 对“你现在所在位置”的称呼。通常它指向一个分支，而分支指向一次提交：图中的 `HEAD → desserts` 表示你在 `desserts` 上，而 `desserts` 指向那次提交。

这种两步式的安排解释了你见过的两种移动：

- 你**提交**时，Git 把 HEAD 所指向的分支移到新的提交上。HEAD 也随之移动，因为它指向这个分支。
- 你**切换**时，Git 把 HEAD 本身移到另一个分支，并相应地改变你的文件。没有任何分支标签移动。

`git status` 的第一行会报告 HEAD 的位置：*On branch main* 表示 HEAD 指向 `main`。

第 3 模块中分离的 HEAD 也符合同样的图景。运行 `git switch --detach` 之后，HEAD 直接指向一次提交，而不是指向分支，所以在那里做新的提交不会移动任何分支标签。这就是为什么这样的提交很容易丢失，也是为什么要在切换走之前为它们创建分支。

## 快进合并 {#s4}

迟早你会想把一个分支上的工作带到另一个分支中。`git merge <branch>` 把指定分支的工作合并（merge）到你所在的分支。所以，先切换到要接收这些工作的分支（通常是 `main`），然后再合并。

Git 如何合并，取决于两个分支之间的关系。最简单的情况是：另一个分支包含你所在分支上的全部内容，外加一些更新的提交。这时没有什么需要组合的：Git 只是把你所在分支的标签向前移到另一个分支最新的提交上。这称为**快进**（fast-forward），它不生成新的提交。

在这个动手环节中，你在 `main` 上，而 `desserts` 领先一次提交，其中有一份蛋糕食谱，如第一张图所示。要跟着操作，请先运行 `git switch main`。

{{SESSION:m04-fast-forward}}

Git 报告了 `Updating 288d56b..4d632df` 和 `Fast-forward`：它把 `main` 从 `288d56b` 移到了 `desserts` 最新的提交 `4d632df`。下面的摘要列出了这次合并带来的内容，即新文件 `cake.md`。比较合并前后的两张图。提交本身没有变化；只有 `main` 标签向前跳了过去，于是 `main` 和 `desserts` 现在指向同一次提交。

“快进”这个名字描述的正是发生的事：`main` 落在后面，Git 沿着已经存在的提交把它往前推进，就像快进一段录像。

合并完成后，`desserts` 分支就完成了任务。`git branch -d desserts` 删除它，Git 还会报告这个标签原来所在的提交（`was 4d632df`）。删掉的只是标签。提交都还在，因为 `main` 包含它们；`git branch` 现在只列出 `main`。

如果某个分支的提交不包含在你所在的分支中，Git 会拒绝用 `-d` 删除它，以免这些工作从此不在任何分支上。练习 5 会说明这时该怎么办。

## 三方合并 {#s5}

两个分支在分叉之后常常都会继续前进。你在 `soups` 分支上加入一份汤的食谱，与此同时有人在 `main` 上给煎饼加了盐。这时两个分支谁也不包含谁，Git 无法只移动一个标签。它会生成一次**合并提交**（merge commit）：一次把两个分支的工作结合起来的新提交。与之前所有的提交不同，它有两个父提交，每个分支上各一个。

这个动手环节从第一张图的状态开始：`soups` 上有一次番茄汤的提交，`main` 上有一次 `soups` 所没有的加盐提交。要跟着操作，请自己搭建这个状态：创建 `soups`，在上面提交一份汤的食谱，切换回 `main`，再提交一处对 `pancakes.md` 的改动。然后进行合并。

合并提交需要一段说明。在你的电脑上，Git 会打开编辑器，里面是现成的说明 `Merge branch 'soups'`。保存并关闭编辑器即可接受；动手环节中保留了这段说明原样。

{{SESSION:m04-three-way}}

比较两张图。合并之前，两个分支在 `288d56b` 之后分叉：`main` 走一条路，`soups` 走另一条。合并之后，合并提交 `e59bfd4` 把它们连在一起，有两条线分别连向它的两个父提交：`main` 上的 `5049848` 和 `soups` 上的 `689ed1b`。`main` 移到了合并提交上；`soups` 留在原处，现在可以用 `git branch -d soups` 删除了。

`Merge made by the 'ort' strategy.` 说明了 Git 组合改动时使用的方法，你不需要了解更多。早于 2.34 的 Git 版本默认使用一种名为 `recursive` 的方法，因此会在这里打印那个名字。

`git log --oneline --graph` 用文字画出同样的形状。合并提交在最上面，`|\` 和 `|/` 这两行表示历史分成两条线又重新汇合，每个分支的提交各占一行。

这称为**三方合并**（three-way merge），因为 Git 会比较项目的三个版本：每个分支上最新的提交，以及两个分支分叉处的提交。自分叉以来只在一侧改动过的内容，就取自那一侧。如果两侧改动了相同的行，Git 无法独自决定，这就是冲突，也是第 5 模块的主题。

::: keyidea
合并从不改变已有的提交。如果你的分支没有对方所缺少的内容，Git 就快进它：标签移动，不生成提交。如果两个分支都有新的提交，Git 就添加一次有两个父提交的合并提交。无论哪种情况，两个分支上的所有提交最终都会进入你所在分支的历史。
:::

## 整理分支 {#s6}

还有几条命令能让分支用起来更快捷：

- `git switch -c <name>` 一步完成创建分支并切换过去，这是开始新工作的常用方式。
- `git branch -v` 列出每个分支及其最新的提交。
- `git switch -` 回到你之前所在的分支。
- `git branch -m <old> <new>` 重命名一个分支。

在这个动手环节中，你开始了一个 breakfast 分支，随后决定把它改名为 brunch。

{{SESSION:m04-switch-c}}

`git branch -v` 显示新分支上的燕麦粥提交 `5ad8c30`，而 `main` 仍在 `288d56b`。`git switch -` 把你带回 `main` 之后，重命名只改变名字：`brunch` 指向的提交与原来的 `breakfast` 相同。

较早的教程用 `git checkout -b <name>` 创建分支并切换过去，用 `git checkout <name>` 切换分支。这些写法仍然可用；`git switch` 完成同样的工作，而且更不容易用错。

按用途给分支命名：简短、小写、单词之间用连字符，例如 `fix-oven-temperature`。名字中也可以使用斜杠，团队常用它给分支分组，例如 `feature/login`。

分支合并之后就删掉它。`git branch` 的列表短一些，就能一眼看出哪些工作还在进行中。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**判断对错。**

1. 创建分支会复制你的所有文件。
2. 分支是指向某次提交的标签。
3. 提交时，你所在分支的标签会移到新的提交上。
4. 删除一个已合并的分支会删除它的提交。
:::

::: solution
1. **错。**创建分支只是创建一个标签，不会复制任何文件。
2. **对。**
3. **对。**
4. **错。**只有标签被删除；提交仍然保留，因为它们已合并进的那个分支仍然包含它们。
:::

::: exercise #e2 level=1 kind=conceptual minutes=7
**快进还是合并提交？** 说出每种情况产生哪一种合并。

1. 你从 `main` 创建了 `fix-typo`，提交了两次，期间没有人修改 `main`。然后你把 `fix-typo` 合并进 `main`。
2. 你从 `main` 创建了 `soups` 并提交；与此同时，有人向 `main` 提交了。然后你把 `soups` 合并进 `main`。
3. 你位于自己的分支上，该分支没有新提交；你合并了有两次新提交的 `main`。
:::

::: solution
1. **快进。**`main` 没有移动，所以它的标签可以直接跳到 `fix-typo` 的最新提交。
2. **合并提交。**两个分支都有新提交，所以 Git 创建一次有两个父提交的提交。
3. 你的分支**快进**：它没有 `main` 所缺少的内容，所以它的标签直接移到 `main` 的最新提交。
:::

::: exercise #e3 level=1 kind=coding minutes=10
**一个功能分支。** 创建名为 `drinks` 的分支，在其上提交两次，把它合并进 `main`，然后删除它。
:::

::: solution
{{SESSION:m04-e3-solution}}

由于你在 `drinks` 上工作期间 `main` 没有移动，这次合并是快进，`git log --oneline` 显示为一条直线。
:::

::: exercise #e4 level=2 kind=conceptual minutes=7
**未提交的改动与切换分支。** 你修改了 `pancakes.md` 但没有提交，然后运行 `git switch desserts`。可能会发生什么？
:::

::: solution
如果 `pancakes.md` 在两个分支上相同，Git 会切换过去，并把你未提交的修改一起带过去。如果切换会覆盖你的修改（因为该文件在 `desserts` 上不同），Git 会拒绝，提示 “Your local changes to the following files would be overwritten by checkout”，并保持一切不变。请先提交你的改动，或者用 `git stash` 把它暂时放到一边（第 8 模块）。
:::

::: exercise #e5 level=1 kind=coding minutes=8
**删除一个从未合并的分支。** 名为 `experiment` 的分支保存着一份失败的食谱。请删除这个分支。要动手试试，请先创建 `experiment`，在上面提交一些内容，再切换回 `main`。
:::

::: solution
`git branch -d` 会拒绝，因为这个分支有其他分支都不包含的提交；`-D` 则会强制删除：

{{SESSION:m04-e5-solution}}

使用 `-D` 要小心：这次提交不再属于任何分支。在一段时间内，仍可以通过引用日志找到它（第 8 模块）。
:::

::: exercise #e6 level=2 kind=conceptual minutes=8
**读懂提交图。** `git log --oneline --graph --all` 输出：

```text
* 5049848 (HEAD -> main) Add salt to the pancakes
| * 689ed1b (soups) Add a tomato soup recipe
|/
* 288d56b Add a pancake recipe
* 02804ba Add a README
```

你位于哪个分支？哪些提交同时属于两个分支？`git merge soups` 会做什么？
:::

::: solution
你位于 `main`。提交 `288d56b` 和 `02804ba` 同时属于两个分支。两个分支各有对方没有的提交，所以 `git merge soups` 会创建一次合并提交，其父提交是 `5049848` 和 `689ed1b`，与第 5 节完全相同。
:::

## 自测 {#quiz}

```quiz
? Git 中的分支是什么？
- [ ] 项目所有文件的一份副本
- [x] 指向某次提交的可移动标签
- [ ] 仓库的备份
- [ ] 与服务器的连接
> 创建分支不复制任何东西；它是一个随提交向前移动的标签。

? 哪条命令创建分支并切换过去？
- [ ] `git branch -v`
- [ ] `git switch -`
- [x] `git switch -c <名称>`
- [ ] `git merge <名称>`
> `-c` 创建分支；`git branch <名称>` 只创建而不切换。

? 你位于 `main`，运行 `git merge desserts`。`desserts` 包含 `main` 的最新提交，另外还多两次提交。会发生什么？
- [x] 快进：`main` 的标签移到 `desserts` 的最新提交。
- [ ] Git 创建一次有两个父提交的合并提交。
- [ ] Git 报告冲突。
- [ ] `desserts` 分支被删除。
> `main` 上的内容 `desserts` 都有，所以不需要合并提交。

? 一次合并提交有几个父提交？
- [ ] 没有
- [ ] 一个
- [ ] 三个
- [x] 两个
> 它连接两条工作线，所以两边各有一个父提交。

? 提交图中的标签 `HEAD → desserts` 是什么意思？
- [ ] `desserts` 分支已被删除。
- [x] 你位于 `desserts`，下一次提交会让它向前移动。
- [ ] `desserts` 是一个分离的 HEAD。
- [ ] `desserts` 已合并进 `main`。
> HEAD 指向你所在的分支。

? `git branch -d experiment` 提示该分支没有完全合并。为什么？
- [ ] 分支名称拼错了。
- [ ] 你正位于 `experiment` 分支上。
- [x] 它有当前分支所不包含的提交。
- [ ] Git 不能删除分支。
> `-d` 保护那些删除后将不属于任何分支的工作；`-D` 会强制删除。

? `git switch -c fix` 取代了哪条旧命令？
- [x] `git checkout -b fix`
- [ ] `git branch -d fix`
- [ ] `git merge fix`
- [ ] `git commit -b fix`
> 较早的教程使用 `git checkout -b`；`git switch -c` 完成同样的工作。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 3.1 节“分支简介”和第 3.2 节“分支的新建与合并”。
- [git branch](https://git-scm.com/docs/git-branch)、[git switch](https://git-scm.com/docs/git-switch) 和 [git merge](https://git-scm.com/docs/git-merge) 的参考文档（英文）。
- [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN)：在浏览器中额外练习分支与合并。
