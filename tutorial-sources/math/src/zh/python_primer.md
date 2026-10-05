## 检查解释器并运行文件 {#setup}

准备文本编辑器、终端与 Python 3.11 或更新版本。终端运行命令，`.py` 文件包含 Python 代码。不要把 `python orientation.py` 等终端命令粘贴到 `>>>` 提示符；若已进入 Python，可输入 `exit()` 回到终端。

**Windows PowerShell** 可尝试：

```powershell
py --version
py orientation.py
```

若安装暴露 `python` 而非 `py`，使用 `python --version` 与 `python orientation.py`。**macOS/Linux** 常用：

```bash
python3 --version
python3 orientation.py
```

把下方脚本下载到已知文件夹，并在那里打开终端。PowerShell 的 `Get-Location`、macOS/Linux 的 `pwd` 显示当前文件夹。打不开脚本时先检查名称与位置；Windows 还要确认编辑器没有保存为 `orientation.py.txt`。

若未安装 Python，使用操作系统对应的官方 [下载与安装信息](https://www.python.org/downloads/)。这里的最低版本与已测试实验相符，不要求替换正常工作的解释器。首次发布仅使用标准库，学习者不需要 `pip install`。

## 理解赋值 表达式与比较 {#notation}

`x = 3` 把名称关联到值，`x + 1` 计算表达式，`x == 3` 比较并返回布尔值，`x < 0` 检查次序关系。Python 乘方写 `x ** 2`；`x ^ 2` 是整数按位操作，不是乘方。

`[0,1,2]` 等列表保存有序值，`values[0]` 读第一项。数学可能从一开始，Python 位置通常从零开始，应检查声明的下标约定。

`if` 选择分支，`for` 对连续值重复缩进体。`range(4)` 给出 `0,1,2,3`；`range(1,5)` 给出 `1,2,3,4`。终点被排除。官方 [控制流教程](https://docs.python.org/3/tutorial/controlflow.html#the-range-function) 提供更多例子。

缩进属于 Python 结构，统一用四个空格。下方循环内打印运行三次，循环后的打印只运行一次。即使算术表达式正确，缩进错误也可能改变计算。

## 函数 返回与导入 {#functions}

`def square(x):` 定义函数，缩进的 `return x * x` 把结果交给调用者。`square(-3)` 是参数为负三的调用，结果为九。打印只显示，不等同于返回值；函数走到末尾而无返回时，结果为 `None`。

`import math` 导入标准数学模块。`math.log(x)` 默认自然对数，实输入必须为正。翻译公式时，数学定义域仍由你负责检查。

`assert` 检查条件，条件为假时抛出异常。实验用它验证小型预期结果；它不是一般证明，也不应是唯一输入验证，因为 Python 的优化执行可关闭断言。数学实验使用显式条件检查约定。

## 运行入门脚本 {#lab1}

先预测三行循环、有限总和以及 `**` 与 `^` 的区别，再下载运行。下方输出由执行该文件捕获。

{{LAB:lab1}}

把列表改为 `[-2,0,3]`，先预测再运行。添加故意错误的 `assert square(3) == 6`，定位跟踪中的行并解释失败主张。之后删去或修复该断言。

## 阅读错误并继续 {#errors}

错误跟踪指出源码行与异常类型。先读最后一行了解直接失败，再检查对应表达式。`NameError` 常表示名称未定义或拼错；`SyntaxError` 表示不能解析；`ZeroDivisionError` 表示除零。有效运行也可能实现了错误数学公式，因此执行成功还不够。

例子捕获故意除零，因此整个脚本完成。`try` 尝试计算，`except` 处理指定异常。不要捕获全部可能异常来压制定义域失败；应解释输入应拒绝还是公式应修复。

能运行下载文件、解释循环范围与返回值，并定位故意失败，就已准备好。继续 [模块 01](module_01_ZH.html)，或从 [计算机科学基础](../cs/index_ZH.html) 获得更完整编程背景。官方 [Python 教程](https://docs.python.org/3/tutorial/) 可供查询，不是这一小时全部必读内容。
