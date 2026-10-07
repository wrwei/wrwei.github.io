## 创建仓库 {#s1}

**仓库**（repository，常简称 *repo*）是 Git 为其保存历史的项目文件夹。任何文件夹都可以成为仓库：`git init` 会在当前文件夹中创建一个名为 `.git` 的隐藏文件夹，从而把它变成仓库。Git 所知道的关于项目历史的一切都保存在 `.git` 中，而你自己的文件仍留在原处。你永远不需要打开 `.git` 或修改其中的内容，也不应该这样做。

你最常用的命令是 `git status`。它告诉你当前在哪个分支上、Git 在文件夹中看到了什么，还常常提示下一步可以尝试的命令。只要你不确定工作处于什么状态，就运行 `git status`。

本系列接下来会建立一个家庭食谱集。现在就开始：

{{SESSION:m02-init}}

`git init` 报告了仓库创建的位置：`recipes` 中的一个 `.git` 文件夹。直接运行 `ls` 什么也不会打印，因为文件夹是空的，而 `.git` 是隐藏的；`ls -a`（*a* 表示 all，全部）会同时显示隐藏的条目，包括 `.`（当前文件夹）和 `..`（上一级文件夹）。`git status` 确认你位于名为 `main` 的分支上，还没有任何提交，括号中的提示说明了下一步：创建文件并使用 `git add`。

::: pitfall
要在项目文件夹中运行 `git init`，千万不要在主文件夹中运行：那会把你的所有文件都纳入版本控制。如果不小心这样做了，删除它在那里创建的 `.git` 文件夹即可，只删这一个文件夹。
:::

## 三个区域 {#s2}

Git 把你的工作保存在三个位置，它的大多数命令都是在这三者之间移动改动：

- **工作区**（working tree）是你在文件夹中看到和编辑的项目文件。
- **暂存区**（staging area，也称*索引*，index）保存将进入下一次提交的内容。你用 `git add` 把改动放进去。
- **仓库**（repository）保存所有提交：你保存过的每一个快照，存放在 `.git` 中。`git commit` 把暂存区的内容变成一次新的提交。

::: figure #fig-02-01
改动通过 `git add` 从工作区进入暂存区，再通过 `git commit` 从暂存区进入仓库。
:::

为什么不一次性提交所有内容？暂存区让你可以准确选择每次提交包含什么，并在提交前检查一遍。如果你改正了一个错别字，又开始写一份新食谱，就可以把二者分开提交，让每次提交只讲一件事。第 4 节正是这样做的。

在工作过程中，每个文件都处于几种状态之一。新文件是**未跟踪**的：Git 从未保存过它。执行 `git add` 后，它是**已暂存**的。执行 `git commit` 后，它就已提交；只要它与最近一次提交一致，Git 就不会提到它。一旦你再次修改它，它就是**已修改**的，循环重新开始。

::: analogy
暂存就像往包裹里装东西，提交就像封好包裹并写上标签。在封口之前，你可以继续往里装，也可以把东西拿出来。一旦封好，里面的内容就固定了。
:::

## 你的第一次提交 {#s3}

现在做第一次提交。用编辑器在 `recipes` 文件夹中创建一个名为 `README.md` 的文件，内容如练习所示。然后逐条运行命令，并留意每一步之后 `git status` 的说法：文件起初是未跟踪的，随后成为待提交的改动，最后被提交，工作区变得干净。

{{SESSION:m02-first-commit}}

`git commit` 的输出包含很多信息。`[main (root-commit) 2cf38b1]` 写明了提交所在的分支，说明这是根提交（仓库中的第一次提交，之前没有任何提交），并给出了提交**哈希**（hash）的开头部分 `2cf38b1`。后面几行概括了改动：一个文件，新增三行（标题、空行和那句话），新建了一个文件。

`git log` 列出历史，最新的提交在前。对于每次提交，它显示完整的哈希（一个 40 个字符、用来标识提交的名字），然后是作者、日期和说明。Git 通常只需前七个字符就能区分不同的提交，所以其他地方显示的是短哈希。

你的哈希会与 `2cf38b1` 不同。Git 根据提交的内容、作者和时间计算哈希，只有在各方面都完全相同的两次提交才会有相同的哈希。

## 暂存你想提交的内容 {#s4}

假设你在添加煎饼食谱时，顺手改写了 README。这是两项互不相关的改动，所以应该分成两次提交：一次添加食谱，一次说明 README 的改动。借助暂存区，即使两项改动是同时做的，你也可以分开提交。按练习所示创建或编辑这两个文件，然后先只暂存食谱。

{{SESSION:m02-staging}}

第一次 `git status` 列出了两类改动：`README.md` 已修改但未暂存，`pancakes.md` 未跟踪。执行 `git add pancakes.md` 之后，食谱移到了 “Changes to be committed” 部分，而 `README.md` 仍留在 “Changes not staged for commit” 之下。因此这次提交只包含食谱，下一次 `git status` 也确认 README 的改动仍在等待。把它添加并提交，就完成了第二次提交。

括号中的内容是 Git 对下一步操作的提示。其中提到的 `git restore` 用于撤销改动，第 3 模块会讲到它。

`git log --oneline` 把每次提交显示为一行，最新的在前：短哈希和说明。练习下方的图把同样的三次提交画成一条直线。最新提交上的标签 `HEAD → main` 表示你位于 `main` 分支上，下一次提交会出现在这里。分支是什么、`HEAD` 是什么意思，是第 4 模块的内容。

## 好的提交说明 {#s5}

提交说明告诉将来的你以及与你合作的人，*为什么*要做这项改动。改动本身展示了改了*什么*，而说明是唯一记录原因的地方。养成几个习惯，能让说明真正有用：

- 写一行简短的摘要，大约 50 个字符以内。
- 使用祈使语气，就像下达指令一样：写 *Add a pancake recipe*，而不是 *Added* 或 *Adds*。一个好的检验方法是：摘要能补全句子 “If applied, this commit will…”（“如果应用，这次提交将会……”）。
- 每次提交只做一项改动。如果摘要需要用到 “and”（和），它很可能描述的是两次提交。
- 原因不明显时，补充更多细节。运行不带 `-m` 的 `git commit`，Git 会打开你的编辑器：在第一行写摘要，空一行，再写解释。保存并关闭文件即可完成提交。

| 较差的说明 | 更好的说明 |
|---|---|
| `stuff` | `Add a pancake recipe` |
| `fixed it` | `Fix the oven temperature in the bread recipe` |
| `changes` | `Say what the notes are for` |
| `Fixed typo and added soup and updated README` | 三次提交，每项改动一次 |

本系列的提交说明使用英文，因为大多数开源项目都这样做；团队也可以用中文写说明，只要保持一致即可。好的提交说明在提交时只多花几秒钟，却能在别人试图理解历史时节省几分钟甚至几小时。

## 忽略文件 {#s6}

有些文件绝不应该进入历史：编辑器生成的临时文件和备份文件、操作系统添加的文件（macOS 上的 `.DS_Store`、Windows 上的 `Thumbs.db`）、可以重新生成的大文件或生成文件，尤其是密码和访问密钥之类的机密信息。

名为 `.gitignore` 的文件告诉 Git 要忽略哪些文件名，每行一个模式。它像其他文件一样被提交，因此参与项目的每个人都共享同一套规则。在练习中，保存为 `shopping.tmp` 的购物清单应当留在仓库之外。

{{SESSION:m02-ignore}}

第一次 `git status` 把 `shopping.tmp` 列为未跟踪。一旦 `.gitignore` 中写入了模式 `*.tmp`，第二次 `git status` 就不再提到它：只剩 `.gitignore` 本身等待提交。这个文件仍在你的磁盘上，Git 只是忽略了它。

几条模式规则就能满足大多数需要。`*` 匹配任意字符，所以 `*.tmp` 匹配所有以 `.tmp` 结尾的文件名。以 `/` 结尾的模式，例如 `photos/`，匹配一个文件夹及其中的所有内容。以 `#` 开头的行是注释。GitHub 在 <https://github.com/github/gitignore> 为许多语言和工具准备了现成的 `.gitignore` 文件。

`.gitignore` 只影响尚未被跟踪的文件。已经提交过的文件即使与某个模式匹配，也仍会被跟踪；第 3 模块会介绍如何停止跟踪这样的文件。

::: pitfall
永远不要提交密码或密钥。机密信息一旦进入历史，就应视为已泄露，并立即更换，即使之后删除了该文件也一样。
:::

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**在哪个区域？** 对于每一步，说出 `pancakes.md` 的最新版本位于哪里：工作区、暂存区还是仓库。

1. 你在编辑器中保存了 `pancakes.md`。
2. 你运行了 `git add pancakes.md`。
3. 你运行了 `git commit -m "Add a pancake recipe"`。
4. 你再次修改并保存了这份食谱。
:::

::: solution
1. **只在工作区**：还没有告诉 Git 这个文件。
2. **暂存区**（工作区中也有）：下一次提交会包含这个版本。
3. **仓库**：提交把它作为快照的一部分保存了下来；此时工作区和暂存区与之一致。
4. **工作区**：文件处于已修改状态；在你再次添加并提交之前，仓库中保存的仍是第 3 步的版本。
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**读懂状态。** 下面是 `git status` 输出的一部分：

```text
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   pancakes.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md
```

下一次 `git commit` 会包含哪个文件？哪个文件已修改但未暂存？用什么命令可以暂存它？
:::

::: solution
下一次提交只包含 `pancakes.md`，因为它位于 “Changes to be committed” 之下。`README.md` 已修改但未暂存，运行 `git add README.md` 即可暂存它。这正是第 4 节练习进行到一半时的情形。
:::

::: exercise #e3 level=1 kind=coding minutes=10
**两个文件，两次提交。** 在一个新仓库中创建 `soup.md` 和 `bread.md`，各写一个标题。分别提交它们，每次都写清楚说明，然后以每次提交一行的形式列出历史。
:::

::: solution
一次暂存并提交一个文件：

{{SESSION:m02-e3-solution}}

`git log --oneline` 先列出最新的提交。你的哈希值会与这里的不同。
:::

::: exercise #e4 level=1 kind=conceptual minutes=6
**改进这些说明。** 改写下列提交说明，必要时把提交拆开：`update`、`fixed typo and added new recipe and changed readme`、`WIP`。
:::

::: solution
- `update` 什么也没说明；应写出具体改动，例如 `Update the bread recipe for a smaller tin`。
- `fixed typo and added new recipe and changed readme` 描述了三项改动。应做三次提交：`Fix a typo in the soup recipe`、`Add a lemon cake recipe` 和 `Say what the notes are for`。
- `WIP`（“进行中的工作”）没有给出保留这次提交的理由。应在一项工作完成时再提交并加以描述，例如 `Add the first half of the cake recipe`。
:::

::: exercise #e5 level=1 kind=coding minutes=10
**忽略整个文件夹。** 你的食谱文件夹中有一个装满大图片的 `photos` 文件夹。请把这个文件夹排除在仓库之外，并提交这条规则。
:::

::: solution
以 `/` 结尾的模式匹配一个文件夹及其中的所有内容：

{{SESSION:m02-e5-solution}}

`git status` 只列出了 `.gitignore`：`photos` 文件夹不再显示为未跟踪。
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**忽略得太晚？** 昨天你误把 `passwords.txt` 提交了。今天你把 `passwords.txt` 加进了 `.gitignore`。这个文件现在安全吗？你应该怎么做？
:::

::: solution
不安全。`.gitignore` 只影响未跟踪的文件。`passwords.txt` 已经被跟踪，Git 会继续跟踪它，而且昨天的提交仍把这些密码保存在历史中。

立即更改文件中的每一个密码，并把旧密码视为已泄露。然后停止跟踪该文件（`git rm --cached`，见第 3 模块），让 `.gitignore` 从此生效。要把它从旧提交中删除就得改写历史（第 8 模块），而仓库一旦共享出去，这样做也无济于事。最好的防护是从不提交任何机密信息。
:::

## 自测 {#quiz}

```quiz
? `git init` 会创建什么？
- [ ] 你的第一次提交
- [x] 一个隐藏的 `.git` 文件夹，用来保存项目的历史
- [ ] GitHub 上的一个仓库
- [ ] 文件夹的一份备份
> `git init` 通过创建 `.git` 把文件夹变成仓库；第一次提交在之后才做。

? 运行 `git add pancakes.md` 之后，文件的这个版本记录在哪里？
- [ ] 只在工作区
- [ ] 在仓库中
- [x] 在暂存区
- [ ] 在 GitHub 上
> `git add` 把文件的当前内容复制到暂存区，准备进入下一次提交。

? `git status` 显示 “nothing to commit, working tree clean”。这是什么意思？
- [x] 你所做的每一项改动都已提交。
- [ ] 仓库中没有任何提交。
- [ ] Git 删除了你的文件。
- [ ] 你必须先运行 `git add`。
> 工作区、暂存区和最近一次提交三者一致。

? 下列哪条提交说明最好？
- [ ] `changes`
- [ ] `stuff for Sam`
- [ ] `Fixed things and updated README and recipes`
- [x] `Add a pancake recipe`
> 它用祈使语气说明了一项改动；第三个选项描述了多项改动。

? 为什么有时只暂存部分改动？
- [ ] Git 一次只能提交一个文件。
- [x] 为了让每次提交只包含一项改动。
- [ ] 暂存的文件会被上传到 GitHub。
- [ ] 为了让仓库变小。
> 暂存让你决定每次提交包含什么，使每次提交都只讲一件事。

? 提交的输出中出现了 `(root-commit)`。为什么？
- [ ] 这次提交是由管理员做出的。
- [ ] 这次提交修改了根文件夹。
- [x] 它是仓库中的第一次提交。
- [ ] 提交失败了，必须重做。
> 根提交没有父提交：历史从这里开始。

? 哪个文件应该写进 `.gitignore`？
- [x] 编辑器生成的临时文件
- [ ] `README.md`
- [ ] 你写的一份食谱
- [ ] `.gitignore` 本身
> 忽略那些不该共享的文件；`.gitignore` 本身要提交，这样大家共享同一套规则。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 2.2 节“记录每次更新到仓库”。
- [git status](https://git-scm.com/docs/git-status)、[git add](https://git-scm.com/docs/git-add) 和 [git commit](https://git-scm.com/docs/git-commit) 的参考文档（英文）。
- [gitignore](https://git-scm.com/docs/gitignore) 参考文档（英文），包含全部模式规则；以及 GitHub 的 [.gitignore 模板集合](https://github.com/github/gitignore)。
- Chris Beams，[How to write a Git commit message](https://cbea.ms/git-commit/)（英文），介绍如何写好提交说明。
