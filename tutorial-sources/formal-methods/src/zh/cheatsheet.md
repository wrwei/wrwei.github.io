---
title: 速查表
lead: 把整个系列浓缩在一页上：符号怎样输入、怎样读，命令、证明方法、自然演绎规则、Isar、归纳和编辑器，每一项都链接到讲解它的章节。
---

遇到看不懂的消息？请看[问题排查](troubleshooting_ZH.html)。遇到不认识的术语？请看[术语表](glossary_ZH.html)。每张表最后一列的数字是各模块的章节号：7.2.2 指模块 7 的第 7.2.2 节。本页的 Isabelle 文本都摘自各模块，在那里经过了 Isabelle 的检查。Isabelle 的界面和消息只有英文，下文在英文标签后面给出中文解释。

## 输入符号 {#symbols}

在 Isabelle/jEdit 中，输入符号的缩写，或者输入反斜杠加符号的名字，然后按 <kbd>Tab</kbd> 接受补全；按 <kbd>Return</kbd>（回车）不会接受补全。窗口底部的 **Symbols**（符号）面板中点击即可插入任何符号；从这些页面复制的文本也可以直接粘贴使用。

| 符号 | 输入 | 或者 | 含义 | 章节 |
|---|---|---|---|---|
| ¬ | `~` | `\not` | 非 | [2.1](module_02_ZH.html#connectives) |
| ∧ | `&` 或 `/\` | `\and` | 并且 | [1.6](module_01_ZH.html#tour) |
| ∨ | <code>&#124;</code> 或 `\/` | `\or` | 或者 | [1.6](module_01_ZH.html#tour) |
| ⟶ | `-->` | `\longrightarrow` | 蕴涵 | [2.1](module_02_ZH.html#connectives) |
| ⟷ | `<-->` | `\longleftrightarrow` | 当且仅当 | [2.1](module_02_ZH.html#connectives) |
| ∀ | `!` | `\forall` | 对所有 | [3.2.3](module_03_ZH.html#quantifiers) |
| ∃ | `?` | `\exists` | 存在 | [3.2.3](module_03_ZH.html#quantifiers) |
| ∃! | 先 ∃ 再 `!` | | 恰好存在一个 | [3.6](module_03_ZH.html#equality) |
| ∄ | `~?` | | 不存在 | [4.4.3](module_04_ZH.html#well-founded) |
| ≠ | `~=` | `\noteq` | 不等于 | [1.6](module_01_ZH.html#tour) |
| ≤ | `<=` | | 小于或等于 | [1.6](module_01_ZH.html#tour) |
| ⇒ | `=>` | `\Rightarrow` | 函数类型；`case` 的分支 | [1.6](module_01_ZH.html#tour) |
| λ | `%` | `\lambda` | 无名函数 | [8.2.1](module_08_ZH.html#lambda) |
| ⟹ | `==>` | `\Longrightarrow` | 由……推出（Pure） | [7.1.1](module_07_ZH.html#meta-pure) |
| ⋀ | `!!` | `\And` | 对任意的……（Pure） | [7.1.1](module_07_ZH.html#meta-pure) |
| ≡ | `==` | `\equiv` | 定义为（Pure） | [7.1.1](module_07_ZH.html#meta-pure) |
| ⟦ ⟧ | `[\|` 和 `\|]` | | 规则的前提 | [7.1.1](module_07_ZH.html#meta-pure) |
| ∈ | `:` | `\in` | 是……的元素 | [4.1.4](module_04_ZH.html#sets-isabelle) |
| ∉ | `~:` | `\notin` | 不是……的元素 | [4.1.4](module_04_ZH.html#sets-isabelle) |
| ⊆ | `(=` | `\subseteq` | 是……的子集 | [4.1.4](module_04_ZH.html#sets-isabelle) |
| ∪ | `Un` | `\union` | 并集 | [4.1.4](module_04_ZH.html#sets-isabelle) |
| ∩ | `Int` | `\inter` | 交集 | [4.1.4](module_04_ZH.html#sets-isabelle) |
| × | `<*>`，或者写 `*` | `\times` | 有序对、积 | [8.1.1](module_08_ZH.html#types) |
| ∘ | | `\circ` | 函数的复合 | [4.6.3](module_04_ZH.html#inverse) |
| ¯ | `^-1` | | 关系的逆 | [4.2.4](module_04_ZH.html#rel-ops) |
| ⇧+、⇧* | `^+`、`^*` | | 传递闭包、自反传递闭包 | [4.5.1](module_04_ZH.html#closure-def) |
| ← | `<-` | | 列表推导式中的生成器 | [8.5.2](module_08_ZH.html#comprehension) |
| ⦇ ⦈ | `(\|` 和 `\|)` | | 记录的值和更新 | [13.4.1](module_13_ZH.html#records) |
| ‹ › | 输入一个反引号，再接受补全 | | 用陈述来指称一个事实 | [10.3.2](module_10_ZH.html#facts-names) |
| … | `...` | | 上一步的右边 | [10.4.1](module_10_ZH.html#calc-eq) |

::: pitfall
⟷ 要输入 `<-->`。较短的 `<->` 也是 ↔ 的缩写，jEdit 会先提供 ↔，而 HOL 不接受 ↔。
:::

## 符号的读法 {#notation}

| 记法 | 读作 | 章节 |
|---|---|---|
| ¬A | “非 A” | [2.1](module_02_ZH.html#connectives) |
| A ∧ B | “A 并且 B” | [2.1](module_02_ZH.html#connectives) |
| A ∨ B | “A 或 B” | [2.1](module_02_ZH.html#connectives) |
| A ⟶ B | “A 蕴涵 B”，“如果 A，那么 B” | [2.1](module_02_ZH.html#connectives) |
| A ⟷ B | “A 当且仅当 B”；Isabelle 把它显示为 `=` | [2.2.2](module_02_ZH.html#priorities) |
| φ ≡ ψ | “φ 与 ψ 等价” | [2.5](module_02_ZH.html#equivalence) |
| φ₁, …, φₙ ⊨ ψ | “φ₁, …, φₙ 逻辑蕴涵 ψ” | [2.6](module_02_ZH.html#consequence) |
| ∀x. φ | “对所有 x，φ 成立” | [3.2.3](module_03_ZH.html#quantifiers) |
| ∃x. φ | “存在 x，使得 φ 成立” | [3.2.3](module_03_ZH.html#quantifiers) |
| ∃!x. P x | “恰好有一个 x 使得 P x 成立” | [3.6](module_03_ZH.html#equality) |
| $\mathcal M \models \varphi$ | “φ 在 $\mathcal M$ 中为真” | [3.3](module_03_ZH.html#structures) |
| $\varphi[t/x]$ | “在 φ 中用 t 代入 x” | [3.5.2](module_03_ZH.html#substitution) |
| x ∈ A | “x 是 A 的元素”，“x 属于 A” | [4.1.1](module_04_ZH.html#sets-notation) |
| {x. P x} | “所有使 P x 成立的 x 组成的集合” | [4.1.1](module_04_ZH.html#sets-notation) |
| A ∪ B、A ∩ B、A − B、−A | “A 并 B”、“A 交 B”、“A 减 B”、“A 的补集” | [4.1.2](module_04_ZH.html#sets-ops) |
| x R y | “x 与 y 有关系 R” | [4.2.2](module_04_ZH.html#rel-def) |
| g ∘ f | “g 在 f 之后” | [4.6.3](module_04_ZH.html#inverse) |
| `Suc n` | “n 的后继” | [5.1.1](module_05_ZH.html#peano) |
| `x # xs` | “x 追加到 xs” | [5.2.1](module_05_ZH.html#lists) |
| `'a list` | “阿尔法列表” | [5.2.1](module_05_ZH.html#lists) |
| ∀m < n. P(m) | “对所有小于 n 的 m，P(m) 成立” | [5.6](module_05_ZH.html#strong) |
| Γ ⊢ A | “Γ 推导出 A”，“A 可由 Γ 推导出” | [6.2](module_06_ZH.html#systems) |
| ⊥ | “bottom”或“falsum”；Isabelle 写作 `False` | [6.4.5](module_06_ZH.html#not) |
| `A ⟹ B` | “由 A 推出 B” | [7.1.1](module_07_ZH.html#meta-pure) |
| `⟦A₁; A₂; …; Aₙ⟧ ⟹ C` | “由前提 A₁ 到 Aₙ 推出结论 C” | [7.1.1](module_07_ZH.html#meta-pure) |
| `⋀x. P x` | “对任意的 x，P x 成立” | [7.1.1](module_07_ZH.html#meta-pure) |
| `a ≡ b` | “a 定义为 b” | [7.1.1](module_07_ZH.html#meta-pure) |
| `?P` | 图式变量：可以用任何项替换它 | [7.2.1](module_07_ZH.html#rules-thm) |
| `t :: τ` | “t 的类型是 τ” | [8.1.1](module_08_ZH.html#types) |
| `λx. x + 1` | “lambda x，x 加 1” | [8.2.1](module_08_ZH.html#lambda) |
| `?thesis` | “the thesis”（论题）：正在证明的陈述 | [10.2.5](module_10_ZH.html#shape-assms) |
| `?case` | “the case”：当前情形的断言 | [10.6.1](module_10_ZH.html#induction-skeleton) |
| `‹A›` | “事实 A” | [10.3.2](module_10_ZH.html#facts-names) |
| `'a::linorder` | “类型类 linorder 中的任意类型 'a” | [12.2.1](module_12_ZH.html#isort-program) |
| `∀y∈set ys. P y` | “对 ys 中的每个 y，P y 成立” | [12.2.2](module_12_ZH.html#isort-spec) |

在 Isabelle 中，¬ 结合得最紧，其次是 ∧，再次是 ∨，然后是 ⟶ 和 ⟷，后两者都向右结合；`=` 比这些联结词都结合得更紧；量词的辖域向右延伸得尽可能远。混用 ⟶ 和 ⟷ 时，请写上括号（[2.2.2](module_02_ZH.html#priorities)、[3.2.4](module_03_ZH.html#scope)、[3.6](module_03_ZH.html#equality)）。

## 理论 {#theory}

你写的所有内容都放在一个理论（theory）中。理论 `First` 存放在文件 `First.thy` 中（[1.7.1](module_01_ZH.html#first-file)）：

```text
theory First
  imports Main
begin

end
```

需要 `Main` 之外的库理论时，在 `imports` 后面写出它的名字（[12.2.1](module_12_ZH.html#isort-program)）：

```text
theory Verify
  imports Main "HOL-Library.Multiset"
begin

end
```

- 命令写在 `begin` 和 `end` 之间，Isabelle 在你输入的同时就检查它们。
- 项和类型写在引号之间（内层语法）；`value`、`lemma` 这样的命令写在引号外面（外层语法）（[1.7.2](module_01_ZH.html#first-compute)）。
- 字符串写在两对单引号之间：`''alice''`（[4.2.4](module_04_ZH.html#rel-ops)）。
- 本系列的所有理论都在 [formal-methods-theories.zip](formal-methods-theories.zip) 中。

## 类型与项 {#hol}

### 类型 {#hol-types}

| 类型 | 值的例子 | 章节 |
|---|---|---|
| `bool` | `True`、`False` | [8.1.1](module_08_ZH.html#types) |
| `nat` | `0`、`Suc 0`、`42` | [8.1.1](module_08_ZH.html#types) |
| `int` | `-3`、`7` | [8.1.1](module_08_ZH.html#types) |
| `'a list` | `[]`、`[1, 2, 3]` | [8.1.1](module_08_ZH.html#types) |
| `'a × 'b` | `(3, True)` | [8.1.1](module_08_ZH.html#types) |
| `'a option` | `None`、`Some 5` | [8.1.1](module_08_ZH.html#types) |
| `'a ⇒ 'b` | `Suc`、`rev` | [8.1.1](module_08_ZH.html#types) |
| `'a set` | `{1, 2, 3}`、`{x. P x}`、`{}`、`UNIV` | [4.1.4](module_04_ZH.html#sets-isabelle) |
| `string` | `''x''`；`char list` 的另一个名字 | [14.2.1](module_14_ZH.html#syntax) |

- 类型标注确定一个类型：`value "2 + 3 :: nat"`（[1.7.2](module_01_ZH.html#first-compute)、[8.1.2](module_08_ZH.html#terms)）。
- `nat` 上的减法是截断的：`(2::nat) - 3` 等于 `0`（[8.6.1](module_08_ZH.html#nat-int)）。
- 对每个 `a`，都有 `a div 0 = 0` 和 `a mod 0 = a`（[8.6.1](module_08_ZH.html#nat-int)）。
- Isabelle 显示负数时，在负号后面加一个空格：`- 1`（[8.6.1](module_08_ZH.html#nat-int)）。

### 集合、关系和函数 {#hol-sets}

| 写法 | 含义 | 章节 |
|---|---|---|
| `{x ∈ {0..10}. x mod 3 = (0::nat)}` | 集合中满足某个条件的元素 | [4.1.4](module_04_ZH.html#sets-isabelle) |
| `Pow A`、`card A`、`finite A` | 幂集、元素个数、有限性 | [4.7.1](module_04_ZH.html#finite) |
| `r O s`、`r¯` | 关系的复合与逆 | [4.2.4](module_04_ZH.html#rel-ops) |
| ```r `` S``` | 集合 S 在 r 下的像 | [4.2.4](module_04_ZH.html#rel-ops) |
| `refl_on A r`、`sym r`、`trans r` | 在 A 上自反、对称、传递 | [4.2.4](module_04_ZH.html#rel-ops) |
| `equiv A r`、`A // r` | A 上的等价关系；它的等价类组成的集合 | [4.3](module_04_ZH.html#equivalence) |
| `wf r` | r 是良基的 | [4.4.3](module_04_ZH.html#well-founded) |
| `r⇧+`、`r⇧*` | 传递闭包和自反传递闭包 | [4.5.1](module_04_ZH.html#closure-def) |
| `inj f`、`surj f`、`bij f`、`inv f` | 单射、满射、双射；逆函数 | [4.6.3](module_04_ZH.html#inverse) |
| `inj_on f A`、`bij_betw f A B` | 集合上的同样性质 | [4.6.3](module_04_ZH.html#inverse) |
| `g ∘ f`、`range f` | 复合；f 的所有值组成的集合 | [4.6.3](module_04_ZH.html#inverse)、[4.7.4](module_04_ZH.html#cantor) |
| `f(a := v)` | 除了把 a 映射为 v 以外与 f 相同的函数 | [14.2.2](module_14_ZH.html#eval) |

### 列表 {#hol-lists}

| 函数 | 计算什么 | 章节 |
|---|---|---|
| `x # xs`、`xs @ ys` | 把 x 放在 xs 前面；xs 后面接上 ys | [5.2.1](module_05_ZH.html#lists) |
| `length xs`、`rev xs`、`sum_list xs` | 长度、反转、求和 | [5.2.1](module_05_ZH.html#lists) |
| `map f xs`、`filter P xs` | 对每个元素应用 f；满足 P 的元素 | [8.5.1](module_08_ZH.html#library) |
| `foldr f xs e` | 用 f 从右往左把所有元素合并起来 | [8.5.1](module_08_ZH.html#library) |
| `zip xs ys` | 把对应的元素配成有序对 | [8.5.1](module_08_ZH.html#library) |
| `take n xs`、`drop n xs` | 前 n 个元素；其余的元素 | [8.5.1](module_08_ZH.html#library) |
| `xs ! n`、`[m..<n]` | 第 n 个元素，从 0 数起；从 m 到 n − 1 的数 | [8.5.1](module_08_ZH.html#library) |
| `[e. x ← xs, P x]` | 列表推导式 | [8.5.2](module_08_ZH.html#comprehension) |
| `set xs` | xs 的元素组成的集合 | [10.6.2](module_10_ZH.html#induction-names) |
| `sorted xs`、`mset xs` | xs 是有序的；它的元素组成的多重集 | [12.2.2](module_12_ZH.html#isort-spec) |

`hd []` 以及超出列表末尾的 `xs ! n` 都是未指定的值：`value` 对它们求值时会因异常而停止（[8.5.2](module_08_ZH.html#comprehension)）。

## 命令 {#commands}

### 查看与计算 {#commands-look}

| 命令 | 例子 | 作用 | 章节 |
|---|---|---|---|
| `value` | `value "rev [1, 2, 3 :: nat]"` | 对一个项求值，并显示结果和它的类型 | [1.7.2](module_01_ZH.html#first-compute) |
| `term` | `term "x + (1::nat)"` | 显示一个项和它的类型，但不求值 | [8.1.2](module_08_ZH.html#terms) |
| `typ` | `typ "nat ⇒ bool list"` | 检查一个类型并把它显示出来 | [8.1.1](module_08_ZH.html#types) |
| `thm` | `thm conjI` | 按名字显示一个定理 | [7.2.1](module_07_ZH.html#rules-thm) |
| `of` | `thm conjI[of "door_closed" "lift_stopped"]` | 从左到右替换定理中的图式变量 | [7.2.1](module_07_ZH.html#rules-thm) |
| `find_theorems` | `find_theorems "rev (rev _)"` | 在库中搜索定理 | [9.6](module_09_ZH.html#find) |
| `find_consts` | `find_consts "'a list ⇒ 'a set"` | 按类型查找函数 | [9.6](module_09_ZH.html#find) |
| `print_cases` | `print_cases` | 在证明中列出归纳的各个情形 | [10.6.2](module_10_ZH.html#induction-names) |
| `declare` | `declare [[show_sorts]]` | 设置一个选项：这里是在输出中显示类别 | [8.6.2](module_08_ZH.html#classes) |

`find_theorems` 的搜索条件可以组合使用（[9.6](module_09_ZH.html#find)）：

| 条件 | 找出的定理 |
|---|---|
| `"pattern"` | 含有这个模式的定理；用 `_` 表示任意项 |
| `name: s` | 名字中含有 `s` 的定理 |
| `simp: "term"` | 左边与这个项匹配的等式 |
| `intro`、`elim`、`dest` | 可以作为这种规则应用于当前目标的定理 |
| 条件前加 `-` | 不满足该条件的定理 |

### 定义 {#commands-define}

| 命令 | 定义什么 | 你得到 | 章节 |
|---|---|---|---|
| `datatype` | 一个类型及其构造子 | 互异性和单射性，作为化简规则 | [5.2.2](module_05_ZH.html#trees)、[8.3.1](module_08_ZH.html#enumerations) |
| `fun` | 用带模式的等式定义函数；自动证明终止性 | `f.simps`（化简规则）、`f.induct` | [5.1.2](module_05_ZH.html#nat-functions)、[8.4.2](module_08_ZH.html#fun-primrec) |
| `primrec` | 原始递归，每个构造子一个等式 | `f.simps` | [8.4.2](module_08_ZH.html#fun-primrec) |
| `definition` | 非递归的常量，只有一个等式 | `f_def`，它不是化简规则 | [8.4.1](module_08_ZH.html#definition) |
| `inductive` | 对一组规则封闭的最小谓词 | `I.intros`、`I.induct`、`I.cases` | [11.6.1](module_11_ZH.html#ev) |
| `inductive_cases` | 针对某种形状的事实的反演规则 | 一条消去规则 | [11.6.3](module_11_ZH.html#inversion) |
| `record` | 字段有名字的元组 | 选择函数，以及 `s⦇cars := Amber⦈` 这样的更新 | [13.4.1](module_13_ZH.html#records) |
| `type_synonym` | 已有类型的新名字 | 没有新东西 | [14.2.1](module_14_ZH.html#syntax) |
| `typedecl`、`consts` | 只声明类型和常量，不给定义 | 未解释的符号 | [3.8](module_03_ZH.html#types) |

```text
datatype 'a tree2 = Tip | Node "'a tree2" 'a "'a tree2"

fun mirror :: "'a tree2 ⇒ 'a tree2" where
  "mirror Tip = Tip"
| "mirror (Node l x r) = Node (mirror r) x (mirror l)"

definition safe :: "light × light ⇒ bool" where
  "safe p = (fst p = Red ∨ snd p = Red)"

inductive ev :: "nat ⇒ bool" where
  ev_0: "ev 0"
| ev_SS: "ev n ⟹ ev (Suc (Suc n))"
```

### 陈述与证明 {#commands-prove}

| 命令 | 作用 | 章节 |
|---|---|---|
| `lemma name: "…"` | 陈述一个断言；`theorem` 和 `corollary` 的意思相同 | [1.7.3](module_01_ZH.html#first-prove) |
| `lemma name [simp]: "…"` | 同时把证明好的引理变成化简规则 | [5.5.3](module_05_ZH.html#lemmas) |
| `assumes "…"` `shows "…"` | 带有具名假设的引理，假设可以用 `assms` 引用 | [10.2.5](module_10_ZH.html#shape-assms) |
| `fixes i n :: nat` | 声明引理中的变量及其类型 | [10.4.2](module_10_ZH.html#calc-ineq) |
| `by m`、`by m₁ m₂` | 一行证明；除非没有剩下的子目标，否则失败 | [5.4.3](module_05_ZH.html#by-induction) |
| `apply m` … `done` | apply 脚本；`done` 检查是否什么都不剩了 | [5.4.2](module_05_ZH.html#induction-state) |
| `proof m` … `qed` | Isar 证明块 | [10.2.1](module_10_ZH.html#shape-blocks) |
| `oops` | 放弃一个证明 | [1.7.5](module_01_ZH.html#first-refute) |
| `sorry` | 在你工作时暂时代替尚未写出的证明；含有 `sorry` 的理论并没有被证明 | [10.5.1](module_10_ZH.html#cases-bool) |
| `declare name [simp]` | 把已证明的引理变成化简规则；`[simp del]` 则把它去掉 | [9.2.3](module_09_ZH.html#simp-rules) |
| `using [[simp_trace]] by simp` | 显示化简器的每一步重写 | [9.3.5](module_09_ZH.html#tracing) |

### 测试 {#commands-test}

在尝试证明一个断言之前，先测试它。Isabelle/jEdit 会自动对每条新引理运行 Quickcheck；Nitpick 和 Sledgehammer 则要你自己调用。

| 命令 | 选项举例 | 作用 | 章节 |
|---|---|---|---|
| `quickcheck` | `[random]`、`[size = 5]`、`[timeout = 30]`、`[expect = counterexample]` | 在许多较小的值上运行断言 | [1.7.5](module_01_ZH.html#first-refute)、[9.7.1](module_09_ZH.html#quickcheck) |
| `nitpick` | `[card 'a = 2]`、`[card = 6]`、`[show_consts]`、`[satisfy]` | 借助 SAT 求解器搜索有限的反模型 | [2.4](module_02_ZH.html#classify)、[9.7.2](module_09_ZH.html#nitpick) |
| `sledgehammer` | `[timeout = 60]` | 求助于外部证明器，并给出可以粘贴的证明 | [9.8](module_09_ZH.html#sledgehammer) |

### 代码 {#commands-code}

| 命令 | 作用 | 章节 |
|---|---|---|
| `export_code next_light duration trace in Haskell module_name Traffic` | 把函数以及它们需要的一切翻译成 Haskell | [8.8](module_08_ZH.html#codegen) |
| `in SML`、`in OCaml`、`in Scala` | 其他目标语言 | [8.8](module_08_ZH.html#codegen) |
| `export_code open …` | 同时导出类型类和构造子 | [12.7](module_12_ZH.html#export) |
| `imports Main "HOL-Library.Code_Target_Nat"` | 生成的代码使用目标语言自己的整数 | [8.8](module_08_ZH.html#codegen) |

生成的代码以 *theory exports*（理论导出）的形式保存：点击消息中的链接，就能在 File Browser（文件浏览器）中打开它。

## 证明方法 {#methods}

### 化简器 {#methods-simp}

| 方法 | 使用的规则 | 章节 |
|---|---|---|
| `simp` | 化简规则集，以及第一个子目标的假设 | [9.2.4](module_09_ZH.html#modifiers) |
| `simp add: a b` | 化简规则集，再加上定理 `a` 和 `b` | [9.2.4](module_09_ZH.html#modifiers) |
| `simp del: a` | 去掉 `a` 的化简规则集 | [9.2.4](module_09_ZH.html#modifiers) |
| `simp only: a b` | 只用 `a` 和 `b`，再加上假设 | [9.2.4](module_09_ZH.html#modifiers) |
| `simp split: option.split` | 还会拆分结论中针对 option 的 `case`；假设中的拆分用 `option.splits` 和 `if_splits` | [9.3.3](module_09_ZH.html#splits) |
| `simp flip: name` | 这一次从右往左使用规则 `name` | [9.3.4](module_09_ZH.html#loops) |
| `simp (no_asm)` | 忽略子目标的假设 | [9.3.2](module_09_ZH.html#assumptions) |
| `simp_all` | 和 `simp` 一样，但作用于每个子目标 | [9.2.4](module_09_ZH.html#modifiers) |

化简规则集包括 `fun` 和 `primrec` 的等式、`datatype` 的事实以及每条标记为 `[simp]` 的引理，但不包括定义：要用 `simp add: f_def` 展开定义（[9.2.3](module_09_ZH.html#simp-rules)）。

### 逻辑、集合与搜索 {#methods-search}

| 方法 | 作用于 | 失败时 | 章节 |
|---|---|---|---|
| `auto` | 所有子目标：化简、应用安全规则、做少量搜索 | 留下它无法证明的部分 | [9.4.2](module_09_ZH.html#auto) |
| `blast` | 第一个子目标：在一阶逻辑、集合和关系中搜索 | 失败，不给任何提示 | [9.4.1](module_09_ZH.html#blast) |
| `force`、`fastforce` | 第一个子目标：每一步都结合重写的搜索 | 失败，不给任何提示 | [9.4.3](module_09_ZH.html#force) |
| `clarsimp` | 第一个子目标：安全规则和化简器 | 不尝试完成证明；把目标整理好留下 | [9.4.4](module_09_ZH.html#clarsimp) |
| `metis` | 用你指明的事实寻找一阶证明 | 失败，或者运行很长时间 | [9.8](module_09_ZH.html#sledgehammer) |
| `sat` | 命题重言式，使用 Isabelle 自带的 SAT 求解器 | 失败，并给出一个反模型 | [2.8](module_02_ZH.html#sat) |

`auto`、`force`、`fastforce` 和 `clarsimp` 接受化简器的修饰符，写作 `simp add:`、`simp del:` 和 `split:`，也接受用于搜索的规则：`intro:`、`elim:` 和 `dest:`。模块中的例子有 `auto simp add: grant_def`、`auto split: if_splits`、`auto intro: step`、`auto elim: ev_SSE ev_1E` 和 `blast intro: move.intros step stay`（[9.4.4](module_09_ZH.html#clarsimp)）。模块 4 以及模块 11 到 13 还写成 `auto simp: trans_def`：`simp:` 是 `simp add:` 的简写。

### 算术 {#methods-arith}

| 方法 | 能证明 | 章节 |
|---|---|---|
| `linarith` | `nat`、`int` 和 `real` 上的线性算术 | [9.5](module_09_ZH.html#arith) |
| `presburger` | 带量词、整除以及按常数的 `div` 和 `mod` 的线性算术 | [9.5](module_09_ZH.html#arith) |
| `arith` | 先试 `linarith`，再试 `presburger` | [9.5](module_09_ZH.html#arith) |

变量与变量相乘，例如 `x * x ≤ y * y`，超出了这三种方法的能力：请找一条库引理（[9.6](module_09_ZH.html#find)）。

### 手工应用规则 {#methods-rules}

| 情况 | 方法 | 例子 | 章节 |
|---|---|---|---|
| 结论中有需要拆开的联结词 | `rule` | `apply (rule conjI)` | [7.3.2](module_07_ZH.html#backward-rule) |
| 结论就是某个假设 | `assumption` | `apply assumption` | [7.3.3](module_07_ZH.html#backward-assumption) |
| 某个假设中有需要拆开的联结词 | `erule` | `apply (erule disjE)` | [7.4.1](module_07_ZH.html#assumptions-erule) |
| 某个假设能给出一个新事实 | `drule`，要保留假设则用 `frule` | `apply (drule mp)` | [7.4.3](module_07_ZH.html#assumptions-drule) |
| 同一类步骤要做很多次 | `intro`、`elim` | `apply (intro impI conjI)` | [7.4.4](module_07_ZH.html#assumptions-intro) |
| 必须由你自己选择实例 | `rule_tac`，或者 `of` | `apply (rule_tac x = 3 in exI)` | [7.6.4](module_07_ZH.html#quantifiers-inst) |

先固定，后猜测：先应用会固定变元的 `allI` 和 `exE`，再应用会产生未知量的 `exI`、`allE` 和 `spec`（[7.6.3](module_07_ZH.html#quantifiers-order)）。

### 归纳与情形分析 {#methods-induction}

| 方法 | 作用 | 章节 |
|---|---|---|
| `induction n` | 按 `n` 的数据类型对 `n` 做归纳 | [5.4.2](module_05_ZH.html#induction-state) |
| `induction xs arbitrary: acc` | 同上，但同时对 `acc` 的所有值证明 | [11.2.2](module_11_ZH.html#arbitrary) |
| `induction xs ys rule: merge.induct` | 计算归纳，沿着 `merge` 的递归进行 | [11.5.3](module_11_ZH.html#f-induct) |
| `induction rule: ev.induct` | 对第一个前提做规则归纳 | [11.6.2](module_11_ZH.html#rule-induction) |
| `induction n rule: less_induct` | 完全归纳法 | [11.8](module_11_ZH.html#complete) |
| `cases l` | 每个构造子一个情形 | [8.3.1](module_08_ZH.html#enumerations) |
| `cases "x < lo"` | 条件成立或者不成立 | [10.5.1](module_10_ZH.html#cases-bool) |
| `cases` | 传给它一个事实 `I t` 时：规则反演 | [11.6.3](module_11_ZH.html#inversion) |

## 自然演绎规则 {#rules}

模块 6 的规则以及它们在 Isabelle 中的名字，陈述按 `thm` 显示的样子给出（[7.2.2](module_07_ZH.html#rules-table)）。问号标出的是图式变量。

| 规则 | 用话说 | Isabelle | 陈述 |
|---|---|---|---|
| [(∧I)](module_06_ZH.html#and) | 要证明 A ∧ B，就证明 A 并证明 B | `conjI` | `⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q` |
| [(∧E₁)](module_06_ZH.html#and) | 由 A ∧ B 得出 A | `conjunct1` | `?P ∧ ?Q ⟹ ?P` |
| [(∧E₂)](module_06_ZH.html#and) | 由 A ∧ B 得出 B | `conjunct2` | `?P ∧ ?Q ⟹ ?Q` |
| (∧E₁) 和 (∧E₂) 合在一起 | 同时使用 A ∧ B 的两个部分 | `conjE` | `⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R` |
| [(∨I₁)](module_06_ZH.html#or) | 要证明 A ∨ B，就证明 A | `disjI1` | `?P ⟹ ?P ∨ ?Q` |
| [(∨I₂)](module_06_ZH.html#or) | 要证明 A ∨ B，就证明 B | `disjI2` | `?Q ⟹ ?P ∨ ?Q` |
| [(∨E)](module_06_ZH.html#or) | 分别由 A 和由 B 证明目标 | `disjE` | `⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R` |
| [(⟶I)](module_06_ZH.html#imp) | 假设 A，证明 B | `impI` | `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q` |
| [(⟶E)](module_06_ZH.html#imp) | 肯定前件式：由 A ⟶ B 和 A 得出 B | `mp` | `⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q` |
| (⟶E) 的消去形式 | 同上，用于假设 A ⟶ B | `impE` | `⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R` |
| [(¬I)](module_06_ZH.html#not) | 假设 A，证明 ⊥ | `notI` | `(?P ⟹ False) ⟹ ¬ ?P` |
| [(¬E)](module_06_ZH.html#not) | 由 ¬A 和 A 得出 ⊥（进而得出任何公式） | `notE` | `⟦¬ ?P; ?P⟧ ⟹ ?R` |
| [(⊥E)](module_06_ZH.html#not) | 由 ⊥ 得出任何公式 | `FalseE` | `False ⟹ ?P` |
| [(∀I)](module_06_ZH.html#quantifiers) | 对一个新的 a 证明 P a | `allI` | `(⋀x. ?P x) ⟹ ∀x. ?P x` |
| [(∀E)](module_06_ZH.html#quantifiers) | 由 ∀x. P x 得出任意 t 的 P t | `spec` | `∀x. ?P x ⟹ ?P ?x` |
| (∀E) 的消去形式 | 同上，用于假设 ∀x. P x | `allE` | `⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R` |
| [(∃I)](module_06_ZH.html#quantifiers) | 由 P t 得出 ∃x. P x | `exI` | `?P ?x ⟹ ∃x. ?P x` |
| [(∃E)](module_06_ZH.html#quantifiers) | 给见证取名为 a，假设 P a，证明目标 | `exE` | `⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q` |
| [(RAA)](module_06_ZH.html#classical) | 假设 ¬A，证明 ⊥ | `ccontr` | `(¬ ?P ⟹ False) ⟹ ?P` |
| (RAA) 的变体 | 假设 ¬A，证明 A | `classical` | `(¬ ?P ⟹ ?P) ⟹ ?P` |
| [(=I)](module_06_ZH.html#equality) | 自反性：t = t | `refl` | `?t = ?t` |
| [(=E)](module_06_ZH.html#equality) | 代入：用相等的东西替换相等的东西 | `subst` | `⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t` |
| (=E)，从右往左 | 同上，等式反过来用 | `ssubst` | `⟦?t = ?s; ?P ?s⟧ ⟹ ?P ?t` |
| 无 | 由两个方向的蕴涵证明 A ⟷ B | `iffI` | `⟦?P ⟹ ?Q; ?Q ⟹ ?P⟧ ⟹ ?P = ?Q` |
| 无 | 按一个方向使用 A ⟷ B | `iffD1`、`iffD2` | `⟦?Q = ?P; ?Q⟧ ⟹ ?P`、`⟦?P = ?Q; ?Q⟧ ⟹ ?P` |

同样的规则作为 apply 脚本的步骤和 Isar 证明的步骤（[10.7.2](module_10_ZH.html#translate-rules)）。`ab`、`imp`、`a`、`b`、`na`、`all`、`pa` 和 `ex` 分别是事实 A ∧ B、A ⟶ B、A、B、¬ A、∀x. P x、P a 和 ∃x. P x 的名字。

| 规则 | apply 步骤 | Isar |
|---|---|---|
| (⟶I) | `rule impI` | `assume "A"` … `show "B"` |
| (⟶E) | `erule impE` | `from imp a have "B" by (rule mp)` |
| (∧I) | `rule conjI` | `from a b have "A ∧ B" by (rule conjI)` |
| (∧E₁)、(∧E₂) | `erule conjE` | `from ab have "A" by (rule conjunct1)` |
| (∨I₁) | `rule disjI1` | `from a have "A ∨ B" by (rule disjI1)` |
| (∨E) | `erule disjE` | `from ‹A ∨ B› show "C" proof` … `next` … `qed` |
| (¬I) | `rule notI` | `assume "A"` … `show False` |
| (¬E) | `erule notE` | `from na a show False by (rule notE)` |
| (∀I) | `rule allI` | `fix x` … `show "P x"` |
| (∀E) | `erule allE` | `from all have "P a" by (rule spec)` |
| (∃I) | `rule exI` | `from pa have "∃x. P x" by (rule exI)` |
| (∃E) | `erule exE` | `from ex obtain a where "P a" by blast` |
| (RAA) | `rule ccontr` | `proof (rule ccontr)` `assume "¬ A"` … `show False` |

## Isar {#isar}

下面是模块 10 中的两个证明：一个是正向书写的自然演绎证明，另一个是归纳证明，它的归纳步骤是一串计算推理。

```text
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  have b: "B" using ab by blast
  have a: "A" using ab by blast
  show "B ∧ A" using b a by blast
qed
```

```text
lemma "mysum (xs @ ys) = mysum xs + mysum ys"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "mysum ((x # xs) @ ys) = x + mysum (xs @ ys)" by simp
  also have "… = x + (mysum xs + mysum ys)" using Cons.IH by simp
  also have "… = mysum (x # xs) + mysum ys" by simp
  finally show ?case .
qed
```

| 元素 | 作用 | 章节 |
|---|---|---|
| `proof (rule r)` | 应用规则 r，开始一个证明块 | [10.2.6](module_10_ZH.html#shape-start) |
| `proof` | 用目标的标准规则开始一个证明块 | [10.2.6](module_10_ZH.html#shape-start) |
| `proof -` | 开始一个证明块，但不改变目标 | [10.2.5](module_10_ZH.html#shape-assms) |
| `qed` | 所有待证目标都解决后，结束证明块 | [10.2.1](module_10_ZH.html#shape-blocks) |
| `assume ab: "A ∧ B"` | 假设目标的一个前提，并给它起名 | [10.2.1](module_10_ZH.html#shape-blocks) |
| `fix x` | 取一个任意的值 x | [10.2.4](module_10_ZH.html#shape-fix) |
| `have b: "B"` | 陈述一个中间事实，它有自己的证明 | [10.2.2](module_10_ZH.html#shape-have) |
| `show "B ∧ A"` | 陈述一个能解决某个待证目标的断言 | [10.2.1](module_10_ZH.html#shape-blocks) |
| `next` | 把不同目标或不同情形的证明隔开 | [10.2.3](module_10_ZH.html#shape-nested) |
| `then` | 把上一步的事实 `this` 传给下一个断言（即 `from this`） | [10.3.1](module_10_ZH.html#facts-then) |
| `from a`、`with a`、`using a` | 传递指名的事实；`with a` 就是 `from a this` | [10.3.2](module_10_ZH.html#facts-names) |
| `note both = b a` | 把几个事实收集在一个名字下 | [10.3.2](module_10_ZH.html#facts-names) |
| `hence`、`thus` | `then have` 和 `then show` 的旧写法 | [10.3.2](module_10_ZH.html#facts-names) |
| `obtain a where "admin a"` | 为一个存在性事实引入见证（∃E） | [10.3.4](module_10_ZH.html#facts-obtain) |
| `moreover` … `ultimately` | 收集事实，然后一起传递 | [10.3.5](module_10_ZH.html#facts-moreover) |
| `also` … `finally` | 构造一串等式或不等式；`…` 代表上一步的右边 | [10.4.1](module_10_ZH.html#calc-eq) |
| `.`、`..` | 用传入的事实直接证明；用一步标准规则证明 | [10.4.1](module_10_ZH.html#calc-eq)、[10.7.1](module_10_ZH.html#translate-nd) |
| `assms`、`assms(i)` | 引理的假设 | [10.2.5](module_10_ZH.html#shape-assms) |
| `proof (cases "x < lo")` | `case True` … `next` `case False` | [10.5.1](module_10_ZH.html#cases-bool) |
| `proof (cases xs)` | `case Nil` … `next` `case (Cons z zs)` | [10.5.2](module_10_ZH.html#cases-datatype) |
| `consider (below) "x < lo"` … | 自己定义的情形，然后用 `proof cases` 和 `case below` | [10.5.4](module_10_ZH.html#cases-consider) |
| `proof (induction xs)` | `case Nil`、`case (Cons x xs)`，以及 `?case` | [10.6.1](module_10_ZH.html#induction-skeleton) |
| `Cons.IH`、`Cons.prems` | 归纳假设；断言的前提 | [10.6.2](module_10_ZH.html#induction-names) |
| `ev_SS.hyps`、`"3.IH"(1)` | 规则的前提；带编号的情形，要加引号 | [11.6.2](module_11_ZH.html#rule-induction)、[11.5.3](module_11_ZH.html#f-induct) |

不带方法的 `proof` 做什么，取决于目标（[10.2.6](module_10_ZH.html#shape-start)）：

| 目标 | 标准规则 | 证明块内 |
|---|---|---|
| `A ⟶ B` | `impI` | `assume "A"` … `show "B"` |
| `A ∧ B` | `conjI` | `show "A"` … `next` … `show "B"` |
| `A ⟷ B` | `iffI` | `assume "A"` … `show "B"` `next` `assume "B"` … `show "A"` |
| `¬ A` | `notI` | `assume "A"` … `show False` |
| `∀x. P x` | `allI` | `fix x` … `show "P x"` |
| `∃x. P x` | `exI` | 用你选定的见证 t 写 `show "P t"` |

## 归纳 {#induction}

根据目标的形状选择归纳方式（[11.9](module_11_ZH.html#choose)）：

| 目标涉及 | 方法 | 在 Isabelle 中 | 章节 |
|---|---|---|---|
| 每个构造子用一个等式定义的函数 | 结构归纳法 | `induction xs` | [5.5](module_05_ZH.html#structural) |
| 递归时会改变另一个参数的函数 | 推广后的结构归纳法 | `induction xs arbitrary: acc` | [11.2.2](module_11_ZH.html#arbitrary) |
| 有自己独特递归模式的函数 | 计算归纳 | `induction xs ys rule: f.induct` | [11.5.3](module_11_ZH.html#f-induct) |
| 一个前提 `I x`，其中 `I` 由 `inductive` 定义 | 规则归纳 | `induction rule: I.induct` | [11.6.2](module_11_ZH.html#rule-induction) |
| 单个事实 `I t` 能推出什么 | 规则反演 | `cases`、`inductive_cases` | [11.6.3](module_11_ZH.html#inversion) |
| 归纳步骤需要某个更小的值 | 完全归纳法 | `induction n rule: less_induct` | [11.8](module_11_ZH.html#complete) |

- 先试 `by (induction xs) auto`，并对函数拆开的那个参数做归纳（[5.4.3](module_05_ZH.html#by-induction)、[5.5.1](module_05_ZH.html#list-induction)）。
- 在证明状态中，把 `⋀n.` 读作“对任意的 n”；归纳假设位于 `⟹` 的左边（[5.4.2](module_05_ZH.html#induction-state)）。
- 规则归纳作用于第一个前提，而这个前提的参数必须是变量（[11.7.1](module_11_ZH.html#closure)、[11.7.2](module_11_ZH.html#constants)）。
- 各个情形以构造子（`Nil`、`Cons`、`0`、`Suc`）、规则（`ev_0`、`ev_SS`）、等式编号（`1`、`2`、`3`）命名，`less_induct` 的情形叫 `less`（[10.6.1](module_10_ZH.html#induction-skeleton)、[11.8](module_11_ZH.html#complete)）。

归纳卡住时，读一读剩下的目标，比较归纳假设和结论（[11.9](module_11_ZH.html#choose)）：

| 卡住的目标显示 | 补救办法 | 章节 |
|---|---|---|
| 一个没有等式能重写的项 | 先证明缺少的引理，并标记为 `[simp]` | [5.5.3](module_05_ZH.html#lemmas)、[11.3](module_11_ZH.html#lemmas) |
| 归纳假设固定了某个参数（`0`、`[]`、`acc`），而结论需要它取别的值 | 推广：用变量代替常量，并使用 `arbitrary:` | [11.2](module_11_ZH.html#generalise) |
| 归纳假设为真，但说得太少 | 加强结论 | [11.2.3](module_11_ZH.html#strengthen)、[5.6](module_05_ZH.html#strong) |
| 归纳假设针对的参数不对 | 对另一个变量做归纳，或者用计算归纳 | [5.5.1](module_05_ZH.html#list-induction)、[11.5](module_11_ZH.html#computation) |
| 规则归纳之后出现毫无意义的目标 | 让归纳前提中只出现变量 | [11.7.2](module_11_ZH.html#constants) |
| 一个关于由构造子构成的项的事实 | 规则反演 | [11.6.3](module_11_ZH.html#inversion) |

## Isabelle/jEdit {#jedit}

### 面板 {#jedit-panels}

| 面板 | 位置 | 显示什么 | 章节 |
|---|---|---|---|
| **Output**（输出） | 底部 | 光标所在命令的消息；勾选 **Proof state**（证明状态）后也在这里显示目标 | [1.6](module_01_ZH.html#tour) |
| **State**（状态） | 右侧 | 没有勾选 Output 面板中的 **Proof state** 时，证明状态显示在这里 | – |
| **Theories**（理论） | 右侧 | **Prover: ready**（证明器：就绪），以及每个已打开理论的进度 | [1.6](module_01_ZH.html#tour) |
| **Documentation**（文档） | 左侧 | 各种手册；**prog-prove** 是第三部分所依据的教程 | [1.6](module_01_ZH.html#tour) |
| **Symbols**（符号） | 底部 | 所有符号，点击即可插入 | [1.6](module_01_ZH.html#tour) |
| **Query**（查询） | 底部 | **Find Theorems**（查找定理）选项卡，带 **Find:**输入框和**Apply**（应用）按钮 | [9.6](module_09_ZH.html#find) |
| **Sledgehammer**| 底部 |**Apply**启动证明器，**Cancel**（取消）停止它们；点击一个证明即可插入 | [9.8](module_09_ZH.html#sledgehammer) |
| **File Browser**（文件浏览器） | 左侧 | 生成的代码，位于 `isabelle-export:` 之下 | [8.8](module_08_ZH.html#codegen) |

### 键盘与鼠标 {#jedit-keys}

| 按键 | 作用 | 章节 |
|---|---|---|
| 把鼠标悬停在带下划线的文字上 | 显示它的消息 | [1.6](module_01_ZH.html#tour) |
| 按住 <kbd>Ctrl</kbd> 并把鼠标悬停在名字上 | 显示它的类型和定义；点击则跳转过去 | [1.6](module_01_ZH.html#tour) |
| <kbd>Tab</kbd> | 接受补全，例如符号 | [1.6](module_01_ZH.html#tour) |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | 保存理论 | [1.7.5](module_01_ZH.html#first-refute) |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> | 显示光标处的提示框 | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> | 显示光标处的消息 | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> | 列出当前行的消息 | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>、<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> | 跳到第一个错误、最后一个错误 | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd>、<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> | 跳到下一个错误、上一个错误 | – |

在 macOS 上，用 <kbd>Cmd</kbd> 代替 <kbd>Ctrl</kbd>。

### 界面上的标记 {#jedit-signs}

| 你看到 | 含义 | 章节 |
|---|---|---|
| 边栏里的蓝色 **i** | 一条信息，例如来自 Auto Quickcheck 或 Auto solve_direct | [1.7.5](module_01_ZH.html#first-refute) |
| 红色的 **!** 和红色下划线 | 这条命令有错误 | [1.7.5](module_01_ZH.html#first-refute) |
| 消息中的 ⌂ | 指向消息所涉及位置的链接 | [1.7.5](module_01_ZH.html#first-refute) |
| 蓝色的名字 | 自由变元，可能是拼错的常量名 | [8.1.2](module_08_ZH.html#terms) |
| 失败的证明上方出现 `theorem …` | 不说明任何问题：要看红色的消息 | [1.7.5](module_01_ZH.html#first-refute) |
| **Proof outline with cases:**（带情形的证明大纲） | 证明的骨架；点击即可插入 | [10.5.1](module_10_ZH.html#cases-bool) |
