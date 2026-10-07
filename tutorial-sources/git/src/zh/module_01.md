## 为什么需要版本控制？ {#s1}

几乎每个人都见过这样的文件夹：`report.docx`、`report_v2.docx`、`report_final.docx`，迟早还会出现 `report_final_really.docx`。每一份副本都有其道理，通常是为了在尝试冒险的改动之前，保留一个能用的版本。可是一周之后，谁也记不清哪个文件是最新的、两个版本之间改了什么，以及为什么要改。

副本只是麻烦的开始。有人覆盖了文件或删错了文件，工作就丢了。出了错也很难追查，因为没有任何记录说明是谁、在什么时候改了某一行。两个人同时修改同一批文件时，只能通过电子邮件来回传送副本，再手工合并，迟早会出错。

**版本控制**（version control）解决的正是这些问题。版本控制系统会记录一组文件的历史，让你能够：

- 看到曾经做过的每一项改动，以及是谁、在何时、为何做出的；
- 回到某个文件或整个项目的任意一个早期版本；
- 尝试新的想法，而不影响可用的版本；
- 安全地合并多个人的工作。

版本控制最常用于软件开发，但它适用于任何会随时间变化的文件：网站、书籍、研究论文、数据分析脚本和配置文件。例如，本网站就保存在 GitHub 上的一个 Git 仓库中，你正在阅读的每一页都有自己的历史。

::: keyidea
版本控制保存项目的每一个已保存版本，并记录是谁、在何时、为何做出的改动。你随时都可以回到过去。
:::

## 版本控制如何工作 {#s2}

其中的核心概念是**提交**（commit）：整个项目在某一时刻的已保存快照，附带一段描述改动的简短说明、作者姓名和时间。何时提交由你决定，通常是在完成一小项工作之后。项目的**历史**就是一条提交链，每一次提交都指向它的前一次提交。

::: analogy
提交就像电子游戏中的存档点：你可以回到其中任何一个。与游戏存档不同的是，每次提交还附有一段说明，记录你刚刚做了什么，因此日后阅读历史会很容易。
:::

Subversion 等较早的系统是**集中式**的：历史保存在一台服务器上，每个人的电脑上只有一份工作副本。查看历史或保存改动都需要连接服务器。Git 是**分布式**的：项目的每一份副本都包含完整的历史。你可以在没有网络的火车上提交，瞬间浏览多年的历史，而且每一份副本都是完整的备份。需要共享工作时，你与其他副本交换提交即可。

Git 由 Linux 的创建者 Linus Torvalds 于 2005 年创建，用来管理 Linux 内核的源代码。如今它是使用最广泛的版本控制系统，遥遥领先。

初学者常常把 Git 和 GitHub 混为一谈。**Git** 是运行在你电脑上、负责保存历史的程序。**GitHub** 是一个网站，它在网上保存 Git 仓库，并增加了拉取请求、代码评审和议题跟踪等协作工具；第 6 和第 7 模块会用到它。GitLab 和 Bitbucket 提供类似的服务。你可以只用 Git 而不用 GitHub，但不能离开 Git 使用 GitHub。

## 安装 Git {#s3}

在你学习本系列所用的电脑上安装 Git。它是免费的，几分钟就能装好。

**Windows。** 从 <https://git-scm.com/downloads/win> 下载 *Git for Windows* 并运行安装程序。大多数选项保持默认即可，但有两处你可能想改：当安装程序询问 Git 使用哪个编辑器时，选择一个你熟悉的，例如 Visual Studio Code；当它询问新仓库初始分支的名称时，可以选择将其改为 `main`（第 5 节无论如何都会设置）。安装程序会附带 *Git Bash*，这是一个终端，本系列的所有命令在其中的效果与页面所示完全相同。PowerShell 也可以使用，二者的细微差别会在相关之处指出。

**macOS。** 打开“终端”应用（位于“应用程序 › 实用工具”中），输入 `git --version`。如果尚未安装 Git，macOS 会提示安装包含 Git 的“命令行开发者工具”（command line developer tools）：选择安装，并等待安装完成。你也可以运行 `xcode-select --install` 开始安装；如果你已在使用 Homebrew，也可以运行 `brew install git`。

**Linux。** 使用发行版的包管理器：在 Debian 和 Ubuntu 上运行 `sudo apt install git`，在 Fedora 上运行 `sudo dnf install git`。其他发行版的命令见 <https://git-scm.com/downloads/linux>。

::: pitfall
在 Windows 上，安装 Git 之前就已打开的终端还不知道 Git 的存在。请关闭它，再打开一个新的终端。
:::

要检查 Git 是否可用，打开终端并运行：

{{SESSION:m01-version}}

Git 会回答它的版本号。本系列需要 Git 2.28 或更高版本，2020 年以来发布的安装程序都满足这一要求；如果你的 Linux 发行版提供的版本较旧，其下载页面列出了更新的软件包。页面上的输出来自上面显示的版本；在 Mac 上，括号中的部分表示这份 Git 由 Apple 构建。你的版本号很可能不同，这并不要紧。

## 终端生存工具包 {#s4}

Git 主要在**终端**中使用：终端是一个窗口，你在其中输入命令、按回车，然后阅读回复。在 Windows 上使用 Git Bash（或 PowerShell）；在 macOS 上使用“终端”应用；在 Linux 上任何终端都可以。终端准备好接收命令时会显示一个*提示符*。在本系列的页面上，命令写在 `$` 之后，这个 `$` 不需要输入。

每条命令都在某个*当前文件夹*中运行，使用终端的很大一部分工作就是在文件夹之间移动。本系列只需要五条命令：

| 命令 | 作用 |
|---|---|
| `pwd` | 打印当前文件夹（“print working directory”的缩写） |
| `ls` | 列出文件夹中的内容 |
| `cd` | 切换当前文件夹；`cd ..` 回到上一级 |
| `mkdir` | 新建一个文件夹 |
| `cat` | 显示文件的内容 |

在下面的动手环节中试一试这些命令。本系列页面上的示例都在名为 `/home/alex` 的主文件夹中运行；你的主文件夹是你自己的，例如 Windows 上的 `C:\Users\you` 或 Mac 上的 `/Users/you`。动手环节要求创建或编辑文件时，请用你的编辑器，并把文件保存在动手环节当前所在的文件夹中。

{{SESSION:m01-terminal}}

逐步对照输出。`pwd` 显示你从哪里开始；执行 `cd projects` 之后，它显示新的文件夹。第一次 `ls` 列出了你刚建的 `projects` 文件夹。`mkdir` 和 `cd` 这类命令成功时不打印任何内容，这很正常：在终端中，没有输出通常意味着成功。最后，`cat` 打印出你用编辑器保存的文件。

::: tip
按 Tab 键可以补全文件名或文件夹名，按上方向键可以调出之前的命令。在 PowerShell 中，`ls` 打印的是一张表格而不是简单的名称列表，但显示的文件相同。
:::

## 向 Git 介绍你自己 {#s5}

每一次提交都会记录作者的姓名和电子邮件地址，所以在第一次提交之前，要先告诉 Git 你是谁。`--global` 选项会把设置保存在你主文件夹中名为 `.gitconfig` 的文件里，对你以这个用户身份使用的所有仓库都有效，因此每台电脑只需设置一次。

请使用你将在 GitHub 上使用的电子邮件地址；第 6 模块会介绍如何对它保密。另外两项设置可以省去日后的麻烦：

- `init.defaultBranch main` 让新仓库从名为 `main` 的分支开始，与 GitHub 的仓库一致。如果不设置，Git 会把第一个分支命名为 `master`，并打印一段较长的提示，建议你另选名称。
- `core.editor` 指定 Git 需要你写较长说明时打开的编辑器。`"code --wait"` 会打开 Visual Studio Code，前提是已安装它的 `code` 命令：在 Mac 上，从 VS Code 的命令面板运行 *Shell Command: Install 'code' command in PATH*；Windows 安装程序会自动添加。`nano` 在任何终端中都可以使用，Windows 上也可以用 `notepad`。

如果你的电脑语言设置为中文，Git 可能会用中文打印部分提示，其含义与此处所示的英文输出相同。

运行下面的命令，换成你自己的姓名和电子邮件地址：

{{SESSION:m01-config}}

四条 `git config --global` 命令成功时都不打印任何内容。随后，`git config --global --list` 显示你所做的设置。设置名称以小写形式出现，例如 `init.defaultbranch`，这是因为 Git 不区分设置名称的大小写，并没有出错。最后，不带值的 `git config user.name` 会读出这一项设置。

## 编辑器和应用中的 Git {#s6}

使用 Git 不一定非要用终端。Visual Studio Code 有“源代码管理”视图，GitHub Desktop 是适用于 Windows 和 macOS 的免费应用，IntelliJ IDEA 和 PyCharm 等 JetBrains IDE 也内置了 Git。它们在底层运行的都是同样的 Git 命令。

本系列使用命令行，原因有三：它能准确展示 Git 每一步做了什么；它在每台电脑上的效果都相同；大多数帮助页面和同事也会告诉你输入命令。一旦掌握了命令，这些工具中的按钮也就容易理解了，包括那些组合了多条命令的按钮。例如，*Sync*（同步）按钮通常会先拉取其他人的提交，再推送你的提交。你可以使用自己喜欢的方式，但请先学会命令。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**找出问题。** 一个团队把报告存放在共享盘上：`report.docx`、`report_v2.docx`、`report_v2_Sam.docx` 和 `report_final.docx`。请说出这个团队难以回答的三个问题。
:::

::: solution
以下任意三个：

- 哪个文件是当前版本？
- `report_v2.docx` 和 `report_final.docx` 之间改了什么，为什么改？
- 某一段是谁写的，又是谁删掉的？
- Sam 的修改如何与其他人的修改合并？
- 上周被删掉的一段如何找回来？

版本控制能回答每一个问题：一个文件夹保存当前版本，历史记录则保存每一次改动及其作者、时间和原因。
:::

::: exercise #e2 level=1 kind=conceptual minutes=3
**Git 还是 GitHub？** 判断下列说法说的是 Git 还是 GitHub。

1. “我在火车上没有网络的情况下做了一次提交。”
2. “我创建了一个拉取请求，请团队评审我的改动。”
3. “我的笔记本电脑上有项目的全部历史。”
4. “我们的仓库有一个网页，大家可以在上面报告缺陷。”
:::

::: solution
1. **Git。**提交在你自己的电脑上完成，不需要网络。
2. **GitHub。**拉取请求是 GitHub 网站的功能（第 7 模块）。
3. **Git。**Git 是分布式的：每一份仓库副本都包含完整的历史。
4. **GitHub。**议题（issue）是 GitHub 网站的功能。
:::

::: exercise #e3 level=1 kind=coding minutes=4
**安装并检查。** 在你的电脑上安装 Git，并运行 `git --version`。如果终端提示找不到该命令，应该怎么办？
:::

::: solution
安装成功时会输出一行，例如 `git version 2.50.1`；2.28 及以上的版本都可以。如果找不到命令：

- 在 Windows 上，关闭终端并重新打开一个，新终端才能找到刚安装的 Git；如果仍然不行，重新运行安装程序；
- 在 macOS 上，接受系统安装“命令行开发者工具”的提示，或运行 `xcode-select --install`；
- 在 Linux 上，用发行版的包管理器安装名为 `git` 的软件包。
:::

::: exercise #e4 level=1 kind=coding minutes=4
**更换编辑器。** 把 Git 使用的编辑器改为 nano，然后检查设置是否生效。如何改回 Visual Studio Code？
:::

::: solution
先设置编辑器，再读出该设置：

{{SESSION:m01-e4-solution}}

要改回来，运行 `git config --global core.editor "code --wait"`。再次设置同一个键会替换它原来的值。
:::

::: exercise #e5 level=1 kind=coding minutes=3
**认路。** 在终端中，在你的主文件夹里新建一个名为 `git-practice` 的文件夹，进入该文件夹并打印当前位置，然后回到主文件夹。
:::

::: solution
依次运行 `mkdir git-practice`、`cd git-practice` 和 `pwd`，`pwd` 会打印你的主文件夹路径加上 `/git-practice`（在 Windows 上是 `\git-practice`）。最后运行 `cd ..` 回到上一级。这些步骤与终端生存工具包动手环节相同，只是文件夹名称换成了你自己的。
:::

::: exercise #e6 level=2 kind=conceptual minutes=3
**全局还是局部？** 你用 `--global` 设置了 `user.email`。这个设置对你明年创建的仓库也有效吗？如何只在工作项目中使用另一个电子邮件地址？
:::

::: solution
有效。`--global` 设置保存在你主文件夹中的 `.gitconfig` 文件里，对你以这个用户身份使用的所有仓库都有效，包括以后创建的仓库。

要在某个项目中使用另一个地址，在该项目的仓库中运行 `git config user.email you@work.example`，不加 `--global`。在仓库内做的设置只对该仓库有效，并且优先于全局设置。
:::

## 自测 {#quiz}

```quiz
? 一次提交记录了什么？
- [ ] 只记录自昨天以来你改过的文件
- [x] 项目的一个快照，以及说明、作者和时间
- [ ] 项目在 GitHub 上的一份备份
- [ ] 你所用电脑的名称
> 提交是整个项目的已保存快照，并标明了由谁、在何时、为何做出。

? 关于分布式版本控制，下列哪种说法正确？
- [ ] 它需要与服务器保持连接。
- [ ] 同一时间只能有一个人提交。
- [x] 仓库的每一份副本都包含完整的历史。
- [ ] 它只适用于程序代码。
> 在 Git 中，每一份克隆都是完整的仓库，所以你可以离线提交，而且每一份副本都是备份。

? Git 和 GitHub 是什么关系？
- [ ] 它们是同一个程序的两个名字。
- [x] Git 是你电脑上的程序；GitHub 是托管 Git 仓库的网站。
- [ ] GitHub 是程序，Git 是它的网站。
- [ ] 它们是相互竞争的版本控制系统。
> GitHub 在网上保存 Git 仓库并增加协作功能；Git 本身运行在你自己的电脑上。

? `cd ..` 的作用是什么？
- [ ] 列出当前文件夹中的文件
- [ ] 新建一个名为 `..` 的文件夹
- [ ] 删除当前文件夹
- [x] 回到包含当前文件夹的上一级文件夹
> `..` 表示“上一级文件夹”，`cd` 则进入它。

? 为什么应在第一次提交之前设置 `user.name` 和 `user.email`？
- [x] 每一次提交都会把它们记录为作者。
- [ ] GitHub 把它们用作你的密码。
- [ ] 它们用于加密你的仓库。
- [ ] 没有它们就无法安装 Git。
> 提交会永久保存作者的姓名和电子邮件地址，所以要在开始之前设置好。

? `git config --global --list` 显示 `init.defaultbranch=main`，全是小写。这说明什么？
- [ ] 设置失败了，必须重新设置。
- [ ] 它只对当前文件夹有效。
- [x] 没有问题：Git 不区分设置名称的大小写。
- [ ] 必须把 `defaultBranch` 中的 B 写成大写才能生效。
> Git 不区分设置名称的大小写，并以小写形式列出它们。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 1 章“起步”：版本控制、Git 简史、安装与初次设置。
- 各操作系统的 [Git 下载页](https://git-scm.com/downloads)。
- [git config 参考文档](https://git-scm.com/docs/git-config)（英文）：所有设置及其保存位置。
- GitHub 文档：[设置 Git](https://docs.github.com/zh/get-started/git-basics/set-up-git)。
- Visual Studio Code：[源代码管理](https://code.visualstudio.com/docs/sourcecontrol/overview)（英文），介绍如何在编辑器中使用 Git。
