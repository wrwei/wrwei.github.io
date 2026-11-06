---
title: 安装与设置
lead: 注册 GitHub 账号，安装 VS Code 和 Git，打开终端，然后告诉 Git 你是谁。每台电脑只需要做一次。
minutes: 45
needs: 一台装有 Windows 10 或 11、macOS 或 Linux 的电脑，以及网络连接
goals:
  - 注册一个免费的 GitHub 账号
  - 安装 VS Code 和 Git
  - 在 VS Code 中打开终端，输入你的第一条命令
  - 告诉 Git 你的名字和邮箱，并设置三个有用的默认选项
---

## 你要安装什么 {#what}

你需要三样东西，全都是免费的。

| 什么 | 它是什么 | 为什么需要它 |
|---|---|---|
| 一个 **GitHub 账号** | 你在 github.com 网站上的登录身份 | 用来把你的项目保存在网上，并分享出去 |
| **VS Code** | 微软出品的一个文本编辑器 | 用来编写文件，并在它内置的终端（terminal）里输入命令 |
| **Git** | 一个在你电脑上运行的程序 | 用来给你的工作拍快照（snapshot） |

如果你用的是单位或学校的电脑，可能需要获得许可才能安装软件。如果安装程序无法运行，请联系你们的 IT 部门。

::: note
VS Code 不是 Git 的一部分。你可以用任何编辑器和任何终端。我们之所以用 VS Code，是因为它把编辑器和终端放在同一个窗口里，让每一课都更容易跟着做。
:::

## 第 1 步：注册 GitHub 账号 {#account}

::: where browser
1. 打开 [github.com/signup](https://github.com/signup)。
2. 输入你的邮箱地址、一个密码和一个**用户名**（username），然后按页面上的提示操作。GitHub 会要求你验证邮箱地址：按照它发给你的邮件里的说明去做。
3. 如果 GitHub 让你选择套餐，选 **Free**（免费）。
:::

用户名要慎重选择，因为它会成为你的网址的一部分：你的个人主页地址是 `github.com/your-username`，到第 8 课，你的网页地址会是 `your-username.github.io/my-page/`。最好选一个简短、全小写、拿给雇主看也不会尴尬的名字。

::: keyidea
在本系列中，**`your-username`** 代表你的 GitHub 用户名。凡是看到它的地方，都要换成你自己的用户名。
:::

::: trouble
**没有收到 GitHub 的邮件。**看看垃圾邮件文件夹。如果那里也没有，就让 GitHub 重新发送一次，或者换一个邮箱地址试试。

**出现“This email can't be used”（此邮箱无法使用）或“We couldn't create your account”（我们无法创建你的账号）。**GitHub 建议换一个浏览器、关闭浏览器扩展，或者等一会儿再试。如果看到的是“This email can't be used”，还可以换一个邮箱地址试试。
:::

## 第 2 步：安装 VS Code {#vscode}

:::: tabs
::: tab Windows
1. 打开 [code.visualstudio.com](https://code.visualstudio.com/)，点击 Windows 版的下载按钮。
2. 打开下载好的文件，按安装程序的提示一路点下去。在 **Select Additional Tasks**（选择附加任务）这一页，保持 **Add to PATH (requires shell restart)**（添加到 PATH，重启后生效）为勾选状态。它默认就是勾选的。
3. 安装完成后，打开 VS Code。
:::
::: tab macOS
1. 打开 [code.visualstudio.com](https://code.visualstudio.com/)，点击 macOS 版的下载按钮。
2. 在访达（Finder）中打开 **Downloads**（下载）。如果那里有一个 `.zip` 文件，双击它解压。把 **Visual Studio Code** 拖到访达边栏中的 **Applications**（应用程序）上，然后从 **Applications** 中打开它。如果 macOS 问你是否确定要打开它，点击 **Open**（打开）。
3. **这一步不要跳过：**以后 Git 需要你写一条信息时，要靠它来打开 VS Code。按 <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>，窗口顶部会打开一个搜索框。输入 `shell command`，选择 **Shell Command: Install 'code' command in PATH**（Shell 命令：在 PATH 中安装“code”命令）。如果 VS Code 说它将请求管理员权限，点击 **OK**（确定），然后输入你 Mac 的密码。
:::
::: tab Linux
1. 打开 [code.visualstudio.com](https://code.visualstudio.com/)，下载 `.deb` 文件（Ubuntu、Debian）或 `.rpm` 文件（Fedora）。
2. 打开这个文件，用系统的软件中心安装它。如果这样不行，就改用终端安装：先打开一个终端（在 Ubuntu 上按 <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd>），然后输入下面两条命令，不要输入 `$`，每输入一条都按一次 <kbd>Enter</kbd>。第一条进入文件下载到的文件夹；第二条安装它。下面以 Ubuntu 为例：

   ```terminal norun
   $ cd ~/Downloads
   $ sudo apt install ./code_*.deb
   ```

   如果你的系统语言是中文，下载文件夹可能叫 `下载`，那就把第一条命令换成 `cd ~/下载`。系统要求输入密码时，输入你的密码，具体见第 3 步的说明。
3. 从应用程序菜单中打开 VS Code。
:::
::::

::: where vscode
1. VS Code 打开时会显示一个 **Welcome**（欢迎）标签页。关掉它（点击标签上的 ×），右侧如果有面板也一起关掉：你用不到它们。如果右下角弹出提示，问你要不要安装中文语言包，建议先不装，这样界面上的文字就和本系列写的一致。
2. 开启 **Auto Save**（自动保存）：打开 **File**（文件）菜单，点击 **Auto Save**，让它旁边出现一个勾。从现在起，VS Code 会在你打字的同时保存文件。如果不开启它，Git 就看不到你还没保存的修改，刚开始时谁都会被这一点弄糊涂。
:::

::: tip
如果某个文件的标签上显示的是一个圆点（●）而不是 ×，说明这个文件还没保存。按 <kbd>Ctrl</kbd>+<kbd>S</kbd>（Mac 上按 <kbd>Cmd</kbd>+<kbd>S</kbd>）保存它。
:::

## 第 3 步：安装 Git {#install-git}

:::: tabs
::: tab Windows
1. 打开 [git-scm.com/install/windows](https://git-scm.com/install/windows)，点击 **Click here to download**（点击这里下载），下载最新版的 Git for Windows。
2. 打开下载好的文件。如果 Windows 问你是否允许此应用对你的设备进行更改，点击 **Yes**（是）。安装程序有很多页。除了下面这两页，其余每一页都直接点击 **Next**（下一步）：
   - 在 **Choosing the default editor used by Git**（选择 Git 使用的默认编辑器）这一页，打开下拉列表，选择 **Use Visual Studio Code as Git's default editor**（使用 Visual Studio Code 作为 Git 的默认编辑器）。
   - 在 **Adjusting the name of the initial branch in new repositories**（调整新仓库中初始分支的名称）这一页，选择 **Override the default branch name for new repositories**（为新仓库指定默认分支名）。它下面的输入框里已经填好了 `main`，保持不动。
3. 点击 **Install**（安装），然后点击 **Finish**（完成）。

Git for Windows 还会安装 **Git Bash**，这是一个终端，它能理解的命令和 macOS、Linux 上的终端一样。下一步就会用到它。
:::
::: tab macOS
macOS 可以替你安装 Git，它包含在苹果的“命令行开发者工具”（command line developer tools）里。

1. 打开 **Terminal**（终端）应用：按 <kbd>Cmd</kbd>+<kbd>Space</kbd>，输入 `Terminal`，然后按 <kbd>Return</kbd>。
2. 输入下面这条命令（不要输入 `$`），然后按 <kbd>Return</kbd>：

   ```terminal norun
   $ xcode-select --install
   ```

3. 会弹出一个窗口，问你是否要安装这些工具。点击 **Install**（安装），同意许可协议，然后等到它提示软件已经安装好。这可能需要 10 分钟或更久。

如果终端提示命令行工具已经安装，说明你已经有 Git 了。这是好消息，即使这条消息里带有 `error` 这个词。
:::
::: tab Linux
打开一个终端：在 Ubuntu 上按 <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd>；在其他系统上，从应用程序菜单中打开 **Terminal**（终端）。然后用系统的包管理器安装 Git。每条命令都不要输入 `$`，输入后按 <kbd>Enter</kbd>。在 Ubuntu 或 Debian 上：

```terminal norun
$ sudo apt update
$ sudo apt install git
```

在 Fedora 上：

```terminal norun
$ sudo dnf install git
```

系统要求输入密码时，输入你的密码。输入时屏幕上什么都不显示，或者每输入一个字符显示一个 `*`，这都是正常的。如果 apt 问 `Do you want to continue? [Y/n]`（是否继续？），按 <kbd>Enter</kbd>。如果 dnf 问 `Is this ok [y/N]`（这样可以吗？），输入 `y` 再按 <kbd>Enter</kbd>：在这里，直接按 <kbd>Enter</kbd> 表示“不”。
:::
::::

## 第 4 步：在 VS Code 中打开终端 {#terminal}

**终端**是一个窗口，你在里面通过打字、而不是点鼠标，向电脑下达指令。每一条指令叫作一条**命令**（command）。你输入命令，按 <kbd>Enter</kbd>（Mac 上是 <kbd>Return</kbd>），电脑就会用一些文字回答你。

::: where vscode
1. 如果安装 Git 时 VS Code 是开着的，先把它关掉再重新打开，这样它才能找到 Git。
2. 打开 **Terminal**（终端）菜单，点击 **New Terminal**（新建终端）。窗口底部会打开一个面板，里面有一个闪烁的光标。
:::

:::: tabs
::: tab Windows
在 Windows 上，VS Code 默认打开的是 PowerShell。把它换成 Git Bash，这样本系列中的每条命令都会和课程里显示的完全一样：

1. 按 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>，输入 `default profile`，选择 **Terminal: Select Default Profile**（终端：选择默认配置文件）。
2. 选择 **Git Bash**。
3. 关掉现有的终端：点击终端面板右上角的垃圾桶图标。然后通过 **Terminal** > **New Terminal** 打开一个新终端。

新终端会显示类似下面的内容，只是换成了你自己的用户名和电脑名：

```terminal norun
you@LAPTOP MINGW64 ~
$
```
:::
::: tab macOS
终端会显示类似下面的内容，只是换成了你自己的用户名和电脑名：

```terminal norun
you@MacBook ~ %
```

其他系统在末尾用 `$` 的地方，macOS 用的是 `%`。两者意思相同。
:::
::: tab Linux
终端会显示类似下面的内容，只是换成了你自己的用户名和电脑名：

```terminal norun
you@laptop:~$
```
:::
::::

光标前面的这段文字叫作**提示符**（prompt）。它表示终端已经准备好接收命令了。在本系列中，每条命令都写在一个 `$` 后面，这个 `$` 就代表提示符。

试试你的第一条命令。点击终端面板，输入 `git --version`（只输入 `$` 后面的部分），然后按 <kbd>Enter</kbd>：

```terminal
$ git --version
git version 2.56.0
```

命令下面那一行就是电脑的回答。你的版本号可能不一样，这没关系：2.28 及以上的任何版本都能用于本系列。Windows 会在版本号后面加上 `.windows` 和一个数字，macOS 则会加上 `(Apple Git-...)`。如果你的版本低于 2.28，请先更新 Git 再继续（见[问题排查页](troubleshooting_ZH.html#old-git)）。

::: tip
你可以用每个框上的**复制**按钮复制命令，再粘贴到终端里。在 Windows 上，用 <kbd>Ctrl</kbd>+<kbd>V</kbd> 粘贴到 VS Code 的终端中；在 Linux 上用 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>；在 Mac 上用 <kbd>Cmd</kbd>+<kbd>V</kbd>。不过，自己动手输入命令更有助于记住它们。
:::

::: trouble
**出现 `git: command not found`（找不到命令），或“The term 'git' is not recognized”（无法将“git”项识别为……）。**终端还不知道 Git 的存在。把 VS Code 完全关闭，再重新打开。在 Windows 上，检查终端是不是 Git Bash（提示符里会显示 `MINGW64`）。如果还是不行，就重新安装 Git（第 3 步）。

**按 Enter 后什么也没发生，或者出现了一个 `>` 提示符（Mac 上是 `dquote>`）。**你可能输入了开头的引号 `"`，却没有输入结尾的引号。按 <kbd>Ctrl</kbd>+<kbd>C</kbd>（Mac 上也是 <kbd>Ctrl</kbd>）取消，然后重新输入这条命令。
:::

## 第 5 步：告诉 Git 你是谁 {#identity}

Git 拍下的每一张快照都会记录是谁做的：一个名字和一个邮箱地址。把你的名字和邮箱告诉 Git。

你在 GitHub 上的项目会是公开的，每张快照里的邮箱地址也一样。GitHub 会给你一个私密地址来代替它，这样你的真实地址就不会公开：

::: where github
1. 点击右上角你的头像，然后点击 **Settings**（设置）。
2. 在侧边栏的“Access”（访问）部分，点击 **Emails**（电子邮件）。
3. 确认 **Keep my email addresses private**（不公开我的电子邮件地址）已经勾选（如果没有，就勾上）。它下面的文字会显示你的私密地址，形如 `12345678+your-username@users.noreply.github.com`，其中的数字和用户名是你自己的。选中这个地址，把它复制下来。
:::

现在自己输入下面两条命令，换成你自己的名字和刚才复制的地址。这个框没有**复制**按钮，因为命令里必须是你自己的信息，而不是示例。保留引号。输入地址时，先输入命令的开头部分，一直到第一个 `"`（包括它），然后粘贴地址（用第 4 步提示里的按键），再输入结尾的 `"`，按 <kbd>Enter</kbd>。

```terminal nocopy
$ git config --global user.name "Your Name"
$ git config --global user.email "12345678+your-username@users.noreply.github.com"
```

这两条命令都不会输出任何内容。在终端里，没有消息就是好消息：执行成功的命令常常什么也不说。

`git config` 用来修改 Git 的设置。`--global` 的意思是“对这台电脑上的所有项目生效”，所以你只需要做一次。

::: tip
打错了？用正确的值把命令重新输入一遍，新值会替换旧值。如果想在按 <kbd>Enter</kbd> 之前修改命令的某一部分，用 <kbd>←</kbd> 和 <kbd>→</kbd> 键移动光标：用鼠标点击是移不动光标的。
:::

## 第 6 步：三个有用的默认设置 {#defaults}

再做三项设置，可以省去以后的麻烦。完全按照下面显示的内容输入：

```terminal
$ git config --global init.defaultBranch main
$ git config --global core.editor "code --wait"
$ git config --global pull.rebase false
```

它们的作用：

- **`init.defaultBranch main`** 把每个新项目的主线命名为 `main`。GitHub 用的就是这个名字，本系列后面也都用这个名字。
- **`core.editor "code --wait"`** 告诉 Git：需要你写一条信息或检查一条信息时，就用 VS Code。你会在第 5 课看到它的作用。
- **`pull.rebase false`** 为 `git pull` 选择最简单的方式，把你的工作和来自 GitHub 的工作合到一起。你会在第 9 课学到 `git pull`。

::: note
**在 Mac 上，还要多做一项设置。**macOS 会在你用访达打开过的文件夹里留下名为 `.DS_Store` 的隐藏文件。它们不属于你的项目，所以要告诉 Git 在所有项目中都忽略它们。输入下面两条命令，它们不会输出任何内容：

```terminal norun
$ mkdir -p ~/.config/git
$ echo .DS_Store >> ~/.config/git/ignore
```

第一条命令为 Git 的设置创建一个文件夹；第二条把 `.DS_Store` 写进一份列表，Git 在所有项目中都会忽略这份列表里的文件。Windows 和 Linux 不需要这样做。
:::

## 第 7 步：检查你的设置 {#check}

让 Git 列出你的设置：

```terminal
$ git config --global --list
user.name=Your Name
user.email=12345678+your-username@users.noreply.github.com
init.defaultbranch=main
core.editor=code --wait
pull.rebase=false
```

你应该能看到你自己的名字和邮箱，以及那三项默认设置。检查前两行显示的是不是**你自己的**名字和地址。如果显示的是 `Your Name` 或 `your-username`，就用你自己的信息重新输入第 5 步的命令。Git 会把 `defaultbranch` 显示成小写，这是正常的。

::: note
如果你电脑的系统语言不是英语，比如是中文，Git 可能会用这种语言显示它的部分消息。它们和本系列中显示的英文消息意思相同。
:::

::: trouble
**我看到的行比这里列出的多。**那些不是你输入的行（例如 `filter.lfs...` 或 `credential...`）来自你之前安装的程序。它们没有问题。

**出现 `fatal: unable to read config file '.../.gitconfig': No such file or directory`（无法读取配置文件：没有那个文件或目录），或者少了某一行。**你的部分或全部设置没有保存下来。按照第 5 步或第 6 步，把缺少的命令重新输入一遍。
:::

## 小结 {#summary}

- **GitHub** 是一个网站；**Git** 是你电脑上的一个程序；**VS Code** 是我们配合这两者使用的编辑器和终端。
- **终端**接收你输入的**命令**。**提示符**表示它已经准备好了。在本系列中，`$` 代表提示符：不要输入它。
- VS Code 的 **Auto Save** 会在你打字的同时保存文件。
- `git config --global` 为你的整台电脑一次性设置好 Git。
- 你的提交（commit）会带上你的名字和你在 GitHub 上的私密邮箱地址。

| 命令 | 作用 |
|---|---|
| `git --version` | 显示安装的是哪个版本的 Git |
| `git config --global user.name "..."` | 设置记录在快照中的名字 |
| `git config --global user.email "..."` | 设置记录在快照中的邮箱 |
| `git config --global --list` | 列出你的设置 |

## 自测题 {#quiz}

```quiz
? 在本系列中，命令开头的 `$` 是什么意思？
- [ ] 它是命令的一部分，必须输入
- [x] 它代表提示符；你只需要输入它后面的内容
- [ ] 它表示这条命令需要管理员权限
> `$` 代表终端的提示符。输入它后面的文字，然后按 Enter。

? 你运行了 `git config --global user.email "..."`，结果什么也没输出。这是怎么回事？
- [ ] 命令悄悄地失败了
- [x] 命令成功了；很多命令成功时什么也不输出
- [ ] Git 在等你再按一次 Enter
> 在终端里，没有消息通常就是好消息。如果想确认，可以用 `git config --global --list` 检查一下。

? 为什么要用 `...@users.noreply.github.com` 这个地址，而不用你自己的邮箱？
- [ ] GitHub 不接受其他地址
- [ ] Git 只接受 GitHub 的地址
- [x] 公开项目中的快照会显示邮箱地址，而这个地址能让你的真实地址保持私密
> 任何人都能读到公开项目历史中的邮箱地址。noreply 地址照样能把你的快照和你的 GitHub 账号关联起来。
```
