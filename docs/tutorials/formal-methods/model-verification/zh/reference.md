---
template: formal-methods-zh.html
---

# Isabelle 模型验证速查表

[用 Isabelle 学形式化方法](../../index_ZH.html) · [项目指南](index.md) · [练习](exercises.md) · [下载示例](../../../isabelle/examples/isabelle-tutorial.zip) · [English](../reference.md){ hreflang=en }

在阅读或编辑理论时可查阅本页。[项目指南](index.md)以一个完整示例介绍各个概念。

## 文件与命令 { #files-and-commands }

| 项目 | 目的 |
|---|---|
| `Name.thy` | 文件头声明为 `theory Name` 的理论 |
| `imports Main` | 标准 HOL 基础 |
| `ROOT` | 会话及其理论文件 |
| `definition` | 引入数学定义 |
| `fun` | 用定义等式引入函数，必要时证明终止性 |
| `datatype` | 通过其构造子定义类型 |
| `record` | 定义一个带有命名字段的类型 |
| `lemma`, `theorem` | 陈述一个命题并证明它 |
| `value "expression"` | 计算一个具体表达式 |
| `thm name` | 显示一个已建立的性质 |
| `term "expression"` | 检查一个项及其推断的类型 |

从包含`ROOT`的目录运行会话：

```bash
/path/to/isabelle build -D .
```

从终端打开编辑器：

```bash
/path/to/isabelle jedit Isabelle_Tutorial.thy
```

应用启动器提供不带终端的相同 IDE。将 shell 命令保留在理论缓冲区之外。

## 类型与逻辑记号 { #types-and-logical-notation }

| 符号 | 含义 |
|---|---|
| `bool` | 真值 |
| `nat` | 自然数包括零 |
| `int` | 数学整数 |
| `real` | 数学实数 |
| `'a list` | 类型为 `'a` 的列表 |
| `'a set` | 类型 `'a` 元素的集合 |
| `'a ⇒ 'b` | 从`'a`到`'b`的函数 |
| `x :: int` | 类型注解 |
| `P ∧ Q`, `P ∨ Q`, `¬ P` | 逻辑合取、析取与否定 |
| `P ⟶ Q` | HOL 蕴含，位于逻辑公式内部 |
| `P ⟹ Q` | Isabelle 规则蕴含，用于前提和结论 |
| `P ⟷ Q` | 逻辑等价 |
| `∀x. P x`, `∃x. P x` | 全称量词与存在量词 |
| `x ∈ A` | 集合成员 |
| `[]`, `x # xs`, `xs @ ys` | 空列表、列表构造子与追加 |
| `s⦇field := value⦈` | 更新记录字段 |

外层命令要求使用内层语法时，项与类型写在双引号中。数字的类型有歧义时，可以用 `(0 :: int)` 这样的注解。函数应用写作 `f x y`，相应的函数类型写作 `a ⇒ b ⇒ c`，箭头向右结合。

## 证明术语 { #proof-vocabulary }

| 命令 | 目的 |
|---|---|
| `assumes a: "P"` | 引入并可选地命名前提 |
| `shows "Q"` | 陈述结论 |
| `using a` | 提供可用事实 |
| `unfolding name_def` | 展开定义 |
| `have h: "P"` | 建立中间事实 |
| `from h show "Q"` | 使用选定的事实解决目标 |
| `show ?thesis` | 证明当前结论 |
| `proof -` … `qed` | 结构化证明 |
| `by method` | 使用证明方法完成 |

`assms` 指由 `assumes` 语句引入的假设；`?thesis` 指当前结论。定理可以包含假设且仍被完全证明：结果是条件于这些假设的。将证明替换为 `sorry` 允许结果而不完成其证明，因此不适合已检查的示例。

## 证明方法 { #proof-methods }

| 方法或工具 | 适用情况 |
|---|---|
| `simp` | 该目标通过重写与化简得出 |
| `simp add: f_def` | 需要展开一个定义 |
| `auto` | 化简与逻辑推理需要协同工作 |
| `cases x` | 布尔类型或数据类型具有互斥的分支 |
| `induction xs` | 列表或递归结构需要归纳论证 |
| `linarith` | 线性等式与不等式需要组合 |
| `sledgehammer` | 你需要帮助以找到相关事实与证明命令 |

失败的方法可能表明语句为假、假设缺失、表述不当或需要另一个引理，但它无法确定哪种解释是正确的。当 Sledgehammer 建议的命令在 Isabelle 中成功重放时，这些建议即转化为有效证明。参见 [官方的证明自动化介绍](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/prog-prove.pdf)。

## 常见问题 { #common-problems }

| 症状 | 检查 |
|---|---|
| 理论名称与文件名不匹配 | 将 `theory Name` 与 `Name.thy` 进行匹配 |
| 未知常量或类型 | 检查拼写、导入和第一个早期错误 |
| 类型合一失败 | 检查推断的类型；区分 `nat`、`int`、`real` 以及函数类型 |
| 定义保持不透明 | 将其生成的`name_def`事实添加到化简 |
| 证明仍有剩余目标 | 阅读每个目标以及在该上下文中实际可用的事实 |
| 算术行为出乎意料 | 检查数字类型，特别是自然数减法 |
| 一个命题在某个情况下为假 | 利用该案例修复模型、守卫或预期结论 |
| `value` 求值成功，但引理未能证明 | 具体求值只覆盖一个输入。请检查引理是否对全部允许的输入成立。 |

[Isar 手册](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/isar-ref.pdf)详细介绍各条命令。[练习](exercises.md)附有完整解答，其证明随教程会话一起检查。
