## 在线性代数前准备数组记法 {#start}

NumPy 存数值数组，运算作用于项或轴。数学向量与存储数组相关但不同，三坐标向量可存平坦、行或列。读形状才能确定代码实际操作。模块 09 首次数值实验前完成；熟悉者可用结业检查。

约三十分钟，需要时这是数值分支额外准备时间，不计模块估时。列表、循环、调用、脚本来自 [Python 入门](python_primer_ZH.html)。点积、长度几何意义在模块 09 展开，此处先读和运行语法。

## 使用已测试数值环境 {#setup}

当前测试基线为 Windows CPU 的 CPython 3.11.8、NumPy 1.26.4，依赖记录在仓库 `tutorial-sources/math/requirements.txt`。01–08 仅标准库。数值实验用独立环境便于复现。

仓库根目录 PowerShell，以已安装 Python 3.11 解释器：

```powershell
python -m venv .venv-math
.\.venv-math\Scripts\python.exe -m pip install -r tutorial-sources/math/requirements.txt
.\.venv-math\Scripts\python.exe -c "import numpy as np; print(np.__version__)"
.\.venv-math\Scripts\python.exe tutorial-sources/math/labs/numpy_primer/orientation.py
```

需要时为教程构建器明确实验解释器：

```powershell
$env:MATH_PYTHON = (Resolve-Path .\.venv-math\Scripts\python.exe).Path
node tutorial-sources/math/build.mjs
```

虚拟环境本地保存，不是课程内容。导入失败表示所选解释器缺包，检查终端或编辑器的解释器。固定基线是已测组合，不声称所有后续 Python 与包版本都验证。只读已发布页面也可用同解释器直接跑下载实验。

若仅下载脚本，把[数值依赖文件](labs/requirements.txt)与 `orientation.py` 存同目录。该目录中用所选 Python 3.11 环境跑 `python -m pip install -r requirements.txt`，再 `python orientation.py`。上方仓库路径用于完整检出，单独保存的脚本无需站点构建器。

## 数组、数值与形状 {#arrays}

`import numpy as np` 给包短名。`np.array([1,2,3], dtype=float)` 建形状 `(3,)` 数组，一轴三项，明确选择浮点存储。列表 `+` 拼接，数组 `+` 加相容项。Python 同符号在不同类型不保证同数学运算。

| 表达式 | 形状或含义 |
|---|---|
| `v.shape` | 轴长元组 |
| `v.ndim` | 数组轴数 |
| `v.size` | 总项数 |
| `v[None, :]` | 添行轴，本例 `(1,3)` |
| `v[:, None]` | 添列轴，本例 `(3,1)` |
| `v.T` | 逆轴顺序，平坦 `(3,)` 仍平坦 |

`(3,)` 逗号表示单元素元组。ndim 不是数学向量空间维数或矩阵代数秩。`(100,3)` 表有两数组轴、一百行、每行三坐标，这三种数量不同。

零基 `table[1,:]` 选第二行，`table[:,0]` 选第一列，冒号表示该轴全部项。`sum(axis=1)` 约掉列轴，每行一个和；`sum(axis=0)` 约掉行轴，每列一个和。先声明哪些项属同一对象、想消去哪个轴。

## 运算符、广播与有意故障 {#operations}

`v*v` 逐项乘，本例 [1,4,9]；两相容平坦向量 `v @ v` 点积，逐对乘积和十四。矩阵与一般 @ 形状规则模块 10 再讲，`2*v` 乘所有项。根据目标数学运算选符号，不能只选能运行者。

**广播**从末轴对齐，轴长必须相等或一方为一，缺领先轴视一。因此 `(3,1)+(3,)` 对齐成 `(3,1)+(1,3)`，得到 `(3,3)` 所有两两加。它能成功运行却配对错误；要三对列加，应把第二者改 `(3,1)`。查两输入与输出，不把无异常当正确。

::: worked title="预测成功但形状错误的操作"
形状 `(3,1)` 列 [1,2,3] 加平坦 `(3,)` [1,2,3]，行结果 [2,3,4]、[3,4,5]、[4,5,6]。配对相加则 `(3,1)` 列 [2,4,6]。错误结果看似合理，每和算术都对，但轴实现另一个问题。
:::

浮点数组近似许多实数计算，`np.allclose` 可按声明容差比较，但先查形状，比较也可能广播。精确小整数恒等式与近似数值一致是不同证据。模块 28 深入浮点误差，之前实验在需要处声明局部容差。

## 运行入门实验 {#lab1}

先预测列表拼接、数组加法、形状、轴和与错误广播。脚本再查修复形状和小点积，下载源产生下方捕获输出。

{{LAB:lab1}}

## 结业检查与参考 {#summary}

解释 `(3,)`、`(1,3)`、`(3,1)` 项数相同却形状不同。预测 `(4,2)+(2,)` 为 `(4,2)`；解释 `(4,2)+(4,)` 不相容，因为末长二与四不同且均非一。说明平坦转置为何不成列。

读 [NumPy 初学者指南](https://numpy.org/doc/1.26/user/absolute_beginners.html) 数组创建与轴，以及[官方广播规则](https://numpy.org/doc/1.26/user/basics.broadcasting.html)查对齐长度。本入门例子原创，脚本实际执行。形状与运算含义明确后，回[课程总览](index_ZH.html)继续向量。
