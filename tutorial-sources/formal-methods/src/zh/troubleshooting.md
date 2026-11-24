---
title: 问题排查
lead: 初学者最常遇到的 Isabelle 消息，按你当时在做的事情分组，每条都说明它的含义、常见原因和解决办法。在本页中搜索你的消息里的几个词即可（按 Ctrl+F，Mac 上按 Cmd+F）。
---

## 先做这几件事 {#first}

1. **把光标放在带红色下划线的那一行上**，在 **Output**（输出）面板中读完整条消息。如果有好几个错误，先修正第一个：后面的错误常常是由它引起的。
2. **读一读剩下的部分。** 很多消息的结尾就是 Isabelle 没能证明的目标。把它和你预想的比较一下：它通常会指出缺少的事实、错误的断言或者出错的步骤。
3. **勾选 Output 面板中的 Proof state**（证明状态），这样移动光标时就能看到各处的目标（[第 1.6 节](module_01_ZH.html#tour)）。
4. **先测试断言。** 对一个错误的陈述，无论你怎么做，证明都会失败；`quickcheck` 和 `nitpick` 几秒钟就能找出很多错误的断言（[第 9.9 节](module_09_ZH.html#strategy)）。
5. **只有红色的消息才算数。** 失败的证明上方出现一行 `theorem …`，并不表示证明成功了（[第 1.7.5 节](module_01_ZH.html#first-refute)）。

下面的消息都摘自各个模块，是 Isabelle2026 在那里实际打印出来的。消息中的目标属于模块里的例子；你看到的会是你自己的目标。⌂ 标出一个位置：在 Isabelle/jEdit 中，它是一个链接，指向消息所涉及的那段文本。Isabelle 的消息只有英文，下文在第一次出现时给出中文翻译。如果实在卡住了，Isabelle 社区会在 isabelle-users 邮件列表、Zulip 聊天室和 Stack Overflow 上回答问题。

## 理论与文件 {#theory}

### Bad theory name（理论名不正确） {#bad-theory-name}

```text
Bad theory name "First" for file "Scratch.thy"⌂
```

意思是：对文件“Scratch.thy”来说，理论名“First”不正确。`theory` 后面的名字和文件名不一致。理论 `First` 必须放在文件 `First.thy` 中。按理论名保存文件，或者把 `theory` 后面的名字改成与文件名一致（[第 1.7.1 节](module_01_ZH.html#first-file)）。

### Bad context for command（命令的上下文不正确） {#bad-context}

```text
Bad context for command "lemma"⌂
```

一条应该位于理论顶层的命令出现时，前一个证明还没有结束。

- **apply 脚本没有 `done`。** 下一个 `lemma` 会被拒绝。在最后一个 `apply` 之后加上 `done`，或者用 `oops` 放弃这个证明（[第 7.8.4 节](module_07_ZH.html#errors-forget)）。
- **带编号的情形名没有加引号。** 在用计算归纳写的 Isar 证明中，`3.IH` 不会被当作一个名字，Isabelle 会报告一条令人困惑的错误，例如 `Bad context for command "qed"`（命令“qed”的上下文不正确）。请写成 `"3.IH"`（[第 11.5.3 节](module_11_ZH.html#f-induct)）。

如果没有结束的证明是理论中的最后一个，被拒绝的就会是 `end`，消息是 [Illegal application of proof command in "prove" mode](#illegal-prove)。

### Outer syntax error（外层语法错误） {#outer-syntax}

```text
Outer syntax error⌂: name expected,
but keyword file⌂ was found
```

意思是：需要一个名字，却遇到了关键字 file。Isabelle 在命令中期待一个名字，却遇到了它的一个关键字。有些英文单词是 Isabelle 命令语言的关键字，`file` 就是其中之一。换一个名字，例如 `doc`（[第 3.8 节](module_03_ZH.html#types)）。

## 语法与类型 {#syntax}

### Inner syntax error（内层语法错误） {#inner-syntax}

```text
Inner syntax error⌂
at "∧ C"
Failed to parse prop
```

引号之间的文本不是一个合乎语法的陈述；`at "…"` 指出 Isabelle 读到哪里停了下来，“Failed to parse prop”的意思是“未能解析 prop”。常见原因是在公式内部写了 ⟹：⟹ 属于 Pure，只能出现在陈述的最外层。在公式内部要写 ⟶（[第 7.1.3 节](module_07_ZH.html#meta-def)）。

### Clash of types：incompatible operand type（类型冲突：操作数类型不兼容） {#type-clash}

```text
Type unification failed: Clash of types "bool" and "nat"

Type error in application: incompatible operand type

Operator:  Suc :: nat ⇒ nat
Operand:   True :: bool
```

“Type unification failed”的意思是“类型合一失败”。一个函数（**Operator**，运算符）被作用于一个类型不对的参数（**Operand**，操作数）。“Clash of types”（类型冲突）列出了无法变得相同的两个类型（[第 8.1.4 节](module_08_ZH.html#type-errors)）。

- **参数的类型不对**，例如 `Suc True`；或者参数的顺序不对，例如 `owns report alice`（[第 3.8 节](module_03_ZH.html#types)）。用 `term` 查看类型。
- **缺少括号。** 函数应用向左结合，所以 `Suc Suc 0` 的意思是 `(Suc Suc) 0`。应写成 `Suc (Suc 0)`（[第 8.2.2 节](module_08_ZH.html#currying)）。
- **该用 ⊆ 的地方用了 ∈。** `{1} ∈ {1, 2 :: nat}` 问的是一个集合是不是一个数集的元素。应写成 `{1} ⊆ {1, 2}` 或 `1 ∈ {1, 2}`（[第 4.1.4 节](module_04_ZH.html#sets-isabelle)）。
- **用了教科书上的集合记法。** 在 Isabelle 中 `|` 是 ∨ 的一种输入方式，所以 `{x | x < (5::nat)}` 会让 `nat` 和 `bool` 冲突。应写成带点的 `{x. x < 5}`（[第 4.1.4 节](module_04_ZH.html#sets-isabelle)）。

### Clash of types：operator not of function type（类型冲突：运算符不是函数类型） {#not-function}

```text
Type unification failed: Clash of types "_ ⇒ _" and "_ list"

Type error in application: operator not of function type

Operator:  rev [1, 2] :: nat list
Operand:   [3::??'a] :: ??'a list
```

给一个不是函数的东西提供了参数。`_ ⇒ _` 代表“某个函数类型”，`??'a` 代表 Isabelle 还没有确定的类型（[第 8.1.4 节](module_08_ZH.html#type-errors)）。

- **参数太多**，例如 `rev [1, 2] [3]`：`rev` 只接受一个列表。
- **同一个谓词在不同地方的参数个数不同**，例如 `P x ⟶ P x y`。让每个谓词在各处的参数个数都相同（[第 3.8 节](module_03_ZH.html#types)）。

### No type arity（没有类型元数） {#no-type-arity}

```text
Type unification failed: No type arity light :: numeral

Type error in application: incompatible operand type

Operator:  next_light :: light ⇒ light
Operand:   3::??'a :: ??'a
```

类型 `light` 不属于类型类 `numeral`（拥有数字的类型组成的类），所以 `3` 不可能是一个交通灯。arity（元数）是 Isabelle 关于“某个类型属于某个类型类”的记录。给函数传入它自己类型的值，例如 `Red`（[第 8.6.2 节](module_08_ZH.html#classes)）。

### Variable not of sort（变量不属于类别） {#not-of-sort}

```text
Type unification failed: Variable 'a::type not of sort ord

Type error in application: incompatible operand type

Operator:  (≤) :: ??'a ⇒ ??'a ⇒ bool
Operand:   x :: 'a
```

一个函数在类型变元上使用了 `≤`，而这个类型变元可以代表任何类型，包括没有 `≤` 的类型。把类型变元限制到一个类型类中：线性序用 `'a::linorder`（[第 12.2.1 节](module_12_ZH.html#isort-program)）。

### Wellsortedness error（类别不符错误） {#wellsortedness}

```text
Wellsortedness error:
Type 'a not of sort term_of
Cannot derive subsort relation numeral < term_of
```

要求某个类型属于某个类型类，但 Isabelle 不知道它属于。对 `value "2 + 2"` 来说，Isabelle 对 `2 + 2` 的类型只知道它有数字，而 `value` 需要一个它能打印其值的类型（[第 8.6.2 节](module_08_ZH.html#classes)）。

- **数字没有类型。** 加上类型标注：`value "2 + 3 :: nat"`（[第 1.7.2 节](module_01_ZH.html#first-compute)）。
- **对无限集合使用 `value`**，例如 `{x. x < (5::nat)}`。这时消息里会出现 `not of sort enum`：`value` 将不得不尝试每一个自然数。从一个有限集合中取元素，例如 `{x ∈ {0..10}. x < 5}`（[第 4.1.4 节](module_04_ZH.html#sets-isabelle)）。
- **对在 `nat` 上做量化的定义使用 `export_code`。** 出于同样的原因，它没有对应的程序（[第 8.8 节](module_08_ZH.html#codegen)）。

### Undefined type name（未定义的类型名） {#undefined-type}

```text
Undefined type name: "lights"
```

签名中的某个类型名拼错了：这里把 `light` 写成了 `lights`。改正这个名字（[第 8.4.4 节](module_08_ZH.html#names)）。

### Error in record input（记录输入错误） {#record-input}

```text
exception TERM raised⌂:
  Error in record input: expecting more fields
  ??.cars = Amber::<position>
```

意思是：记录输入错误，还需要更多字段。用 `=` 时，Isabelle 把 `⦇cars = Amber⦈` 当作一个记录值，而记录值必须列出所有字段。更新要用 `:=`：写成 `start⦇cars := Amber⦈`（[第 13.4.1 节](module_13_ZH.html#records)）。

### value 原样返回了你的项 {#value-unevaluated}

```text
"lenght [1, 2]"
  :: "'a"
```

没有报错，但也没有结果。拼错的名字是一个自由变元，`value` 无法对它求值；答案中的类型变元 `'a` 就是信号。Isabelle/jEdit 用蓝色显示自由变元。改正这个名字（[第 8.1.3 节](module_08_ZH.html#value)）。

### Isabelle 对公式的理解与你不同 {#reading}

```text
proof (prove)
goal (1 subgoal):
 1. (A = B ∧ C) = (A = (B ∧ C))
```

没有报错：陈述的意思与你想的不一样。把它写成引理，然后读一读目标：Isabelle 显示目标时只保留起作用的括号。

- `=` 比 ∧ 和 ∨ 结合得更紧，而 ⟷ 和 ⟶ 一样结合得很松；Isabelle 把 ⟷ 显示为 `=`。在项之间写 `=`，在公式之间写 ⟷（[第 3.6 节](module_03_ZH.html#equality)）。
- ¬A ∧ B 是 (¬A) ∧ B；⟶ 和 ⟷ 的优先级相同，混用时请写上括号（[第 2.2.2 节](module_02_ZH.html#priorities)）。
- 量词的辖域向右延伸得尽可能远：∀x. P x ⟶ Q x 就是 ∀x. (P x ⟶ Q x)（[第 3.2.4 节](module_03_ZH.html#scope)）。

## 定义与终止性 {#definitions}

### Could not find lexicographic termination order（找不到字典序的终止序） {#termination}

```text
consts
  bad :: "nat ⇒ nat"

Unfinished subgoals:
(a, 1, <):
 1. False
Calls:
  a) x ~> x
Measures:
  1) size
Result matrix:
    1
a:  <=

Could not find lexicographic termination order.
```

`fun` 没能证明递归会终止，因此拒绝了这个定义；开头几行只是宣布这个常量，之后它并没有被定义。从下往上读这条消息：**Calls**（调用）列出递归调用（`~>` 表示“调用”），**Measures**（度量）列出尝试过的度量，**Result matrix**（结果矩阵）对每个调用和每个度量说明它是严格变小（`<`）、不增大（`<=`），还是两者都无法证明（`?`）。**Unfinished subgoals**（未完成的子目标）是 Isabelle 没能证明的命题（[第 8.7.2 节](module_08_ZH.html#termination-messages)）。

- **递归确实不会终止**，例如 `bad n = bad n + 1`。这样的等式可以证明 `0 = 1`；请重新考虑这个定义（[第 5.7.1 节](module_05_ZH.html#why-terminate)）。
- **缺少基础情形。** `sum_down n = sum_down (n - 1) + n` 在 0 处会永远调用自己，因为在 `nat` 上 `0 - 1 = 0`。用模式 `0` 和 `Suc n` 来写（[第 5.7.3 节](module_05_ZH.html#no-measure)）。
- **函数会终止，但不是靠某个参数的大小变小**，例如交通灯上的 `wait`。改写函数，使终止性一目了然，例如借助库函数；或者用 `function` 自己证明终止性（[第 8.7.3 节](module_08_ZH.html#termination-help)）。

### Missing patterns in function definition（函数定义中缺少模式） {#missing-patterns}

```text
Missing patterns in function definition:
top_value Empty = undefined
```

这是一条警告：等式没有覆盖每个构造子。Isabelle 用 `undefined` 补全了这个函数，所以函数在那里的值是未指定的，`value` 对它求值时会以 [exception Match raised](#exception-match) 停止。补上缺少的等式，或者返回一个选项值，例如 `None`（[第 8.4.3 节](module_08_ZH.html#patterns)）。`primrec` 遇到缺少的构造子时会给出警告 `No equation for constructor "Empty"`（构造子“Empty”没有等式）。

### exception Match raised（抛出了 Match 异常） {#exception-match}

```text
exception Match raised⌂
```

`value` 遇到了一个未指定的值，没有等式可以用：上面的 `top_value Empty`、`hd []`，或者 `n` 超出列表末尾的 `xs ! n`。这里的 ⌂ 指向生成的程序，而不是你的理论。处理缺少的情形，或者确保 `xs` 不为空并且 `n < length xs`（[第 8.4.3 节](module_08_ZH.html#patterns)、[第 8.5.2 节](module_08_ZH.html#comprehension)）。

### Equation is redundant（等式是多余的） {#redundant}

```text
Equation is redundant (covered by preceding clauses):
is_red2 Red =
True
```

意思是：等式是多余的（已被前面的子句覆盖）。`fun` 使用第一个匹配的等式。一般的等式写在具体的等式前面，就会把后者遮住。把具体的等式写在前面（[第 8.4.3 节](module_08_ZH.html#patterns)）。

### Constructor pattern missing（缺少构造子模式） {#constructor-pattern}

```text
Constructor pattern missing in left-hand side at
  is_red3 l =
  False
```

意思是：等式左边缺少构造子模式。`primrec` 要求每个构造子一个等式，每个等式的模式都是作用于变量的构造子；单独一个变量不算这样的模式。为每个构造子写一个等式，或者改用 `fun`（[第 8.4.3 节](module_08_ZH.html#patterns)）。

### Variable occurs on right hand side only（变量只出现在右边） {#rhs-only}

```text
Variable "duraton" occurs on right hand side only:
⋀l ls duraton.
   cycle_time (l # ls) =
   duraton l +
   cycle_time
    ls
```

右边的某个名字不是常量，所以 Isabelle 把它当作变量，而变量没有值。这通常是拼错的函数名，这里把 `duration` 写成了 `duraton`（[第 8.4.4 节](module_08_ZH.html#names)）。

### Bad arguments on lhs（左边的参数不正确） {#bad-lhs}

```text
Bad arguments on lhs: "(a, b)"
The error(s) above occurred in definition:
"safe2 (a, b) ≡
 a = Red ∨
 b =
 Red"
```

`definition` 不接受模式：它的左边是作用于变量的常量。用 `fst` 和 `snd`、`case` 表达式，或者改用接受模式的 `fun`（[第 8.4.1 节](module_08_ZH.html#definition)）。

### 归纳定义的 Proof failed（证明失败） {#inductive-mono}

```text
Proof failed.
 1. ⋀x y xa n. x (?x10 x y xa n) ⟶ y (?x10 x y xa n) ⟹ y n ⟶ x n
The error(s) above occurred for the goal statement⌂:
mono (λp x. ∃n. x = Suc n ∧ ¬ p n)
```

被定义的谓词以否定的形式出现在它自己某条规则的前提中。规则必须是单调的，这就是目标 `mono (…)` 所说的，而否定的前提破坏了这一点。你屏幕上目标的细节可能有所不同。改写规则，不要对被定义的谓词取否定（[第 11.6.4 节](module_11_ZH.html#versus)）。

### No code equations（没有代码等式） {#no-code-equations}

```text
No code equations for ev,
requested by dependencies
```

归纳谓词不是程序，所以 `value` 和 Quickcheck 无法运行它。改用它的规则来证明关于它的事实，用 Nitpick 搜索反例；如果需要计算，就定义一个递归函数（[第 11.6.4 节](module_11_ZH.html#versus)、[第 13.5.1 节](module_13_ZH.html#fails)）。

## 失败的证明 {#proofs}

### Failed to apply initial proof method（未能应用初始证明方法） {#initial-method}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. ((A ⟶ B) ⟶ A) ⟶ A
```

`by` 后面的方法对目标什么也做不了，消息原样显示了目标。对 `simp` 来说，这表示一条规则也用不上；对 `auto` 来说，表示它无法改变目标；`blast` 和 `linarith` 找不到证明时也会给出这条消息（[第 2.4 节](module_02_ZH.html#classify)、[第 9.2.4 节](module_09_ZH.html#modifiers)、[第 9.5 节](module_09_ZH.html#arith)）。

- **定义没有展开。** `definition` 的等式不是化简规则：写成 `simp add: safe_def`（[第 8.4.1 节](module_08_ZH.html#definition)）。
- **方法不对路。** 重写不能证明所有的重言式：逻辑问题试 `blast` 或 `auto`，搜索中需要重写时试 `fastforce`，算术问题试 `presburger` 或 `arith`（[第 9.4 节](module_09_ZH.html#classical)、[第 9.5 节](module_09_ZH.html#arith)）。
- **缺少一条引理。** 用 `find_theorems` 找到它，再用 `simp add:` 传进去，或者让 Sledgehammer 去找（[第 9.6 节](module_09_ZH.html#find)、[第 9.8 节](module_09_ZH.html#sledgehammer)）。
- **数字遇到 `Suc` 模式。** `simp` 不会把 `2` 与 `Suc n` 匹配；加上 `numeral_eq_Suc`（[第 8.6.2 节](module_08_ZH.html#classes)）。
- **类型没有确定。** 在 `x + 0 = x` 中，`x` 的类型只知道有 `+` 和 `0`，别的一无所知。加上标注：`x + 0 = (x::nat)`（[第 8.6.2 节](module_08_ZH.html#classes)）。
- **断言是错的。** 用 `quickcheck` 和 `nitpick` 测试它（[第 9.7 节](module_09_ZH.html#refute)）。

### Failed to finish proof（未能完成证明） {#finish-proof}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. n + n = n * n
```

方法取得了一些进展，但没有证明目标；消息显示了剩下的部分。在 `done` 处，消息写作 `Failed to finish proof:`，并列出剩下的子目标（[第 1.7.5 节](module_01_ZH.html#first-refute)、[第 7.8.3 节](module_07_ZH.html#errors-done)）。

- **断言是错的**，就像这里：`n + n = n * n` 一般并不成立。修正陈述，或者用 `oops` 放弃它。
- **没有把某个事实传给方法。** 方法只看得见你传给它的事实（[第 10.3.3 节](module_10_ZH.html#facts-visible)），另见[下面的条目](#not-passed)。
- **等式的方向反了。** 对化简器来说，`u = v` 和 `v = u` 是不同的项。按定义产生的方向来陈述引理（[第 9.2.3 节](module_09_ZH.html#simp-rules)）。
- **假设中有 `case` 或 `if`。** 用 `split: option.splits` 或 `split: if_splits` 拆分它（[第 9.3.3 节](module_09_ZH.html#splits)）。
- **递归函数作用于一个变量**，例如 `sum_upto n`：不做归纳，就没有等式可用（[第 5.4.1 节](module_05_ZH.html#simp-not-enough)）。
- **`done` 时还剩下子目标。** `done` 自己什么也不证明；补上缺少的步骤。

### 归纳留下了目标 {#induction-stuck}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ⋀a xs. sumacc xs 0 = sum_list xs ⟹ sumacc xs a = a + sum_list xs
```

基础情形或归纳步骤无法由定义和归纳假设完成。把 ⟹ 左边的归纳假设和结论比较一下：两者的差别指出了需要改动的地方（[第 11.1.2 节](module_11_ZH.html#stuck-isabelle)）。[速查表](cheatsheet_ZH.html#induction)中有一张补救办法的表。

- **对错误的变量做了归纳。** 应该对函数拆开的那个参数做归纳（[第 5.5.1 节](module_05_ZH.html#list-induction)）。
- **缺少一条引理。** 目标中有一个没有等式能重写的项，就需要一条关于它的引理，先证明它并声明为 `[simp]`（[第 5.5.3 节](module_05_ZH.html#lemmas)、[第 11.3 节](module_11_ZH.html#lemmas)）。
- **归纳假设固定了一个值，而归纳步骤需要它变化**，例如上面的 `0`。推广它：`induction xs arbitrary: acc`（[第 11.2 节](module_11_ZH.html#generalise)）。
- **归纳假设为真，但说得太少。** 证明一个更强的结论（[第 5.6 节](module_05_ZH.html#strong)、[第 11.2.3 节](module_11_ZH.html#strengthen)）。
- **函数有自己独特的递归模式。** 用计算归纳，`rule: f.induct`（[第 11.5 节](module_11_ZH.html#computation)）。

### Failed to apply proof method（未能应用证明方法） {#apply-method}

```text
Failed to apply proof method⌂:
goal (1 subgoal):
 1. A ∧ B ⟶ B ∧ A
```

一个 `apply` 步骤对子目标 1 什么也做不了；消息显示的是这一步之前的子目标（[第 7.8.1 节](module_07_ZH.html#errors-apply)）。

- **规则与结论不符。** 对 `rule` 来说，规则的结论必须与子目标结论的主联结词相同：`disjI1` 证明不了合取。用 `thm` 查看这条规则。
- **还不是假设就想拆开它。** 在 A ∧ B ⟶ B ∧ A 中，这个合取还不是假设：先用 `impI`，再用 `erule conjE`。
- **指望 `assumption` 看进公式内部。** 它只能合一整个公式；先把假设拆开。
- **数字遇到 `Suc` 模式。** `rule ev_SS` 不能应用于 `ev 4`。用 `Suc` 写出这个数，或者先用 `numeral_eq_Suc` 化简（[第 11.6.1 节](module_11_ZH.html#ev)）。

### 无法消除的未知量 {#unknowns}

```text
Failed to apply proof method⌂:
goal (1 subgoal):
 1. ⋀y x. R x (?y8 y x) ⟹ R (?x4 y) y
```

未知量 `?x4 y` 是在 `x` 被固定之前产生的，所以它永远不能变成 `x`。先固定，后猜测：先应用会固定变元的 `allI` 和 `exE`，再应用会产生未知量的 `exI`、`allE` 和 `spec`（[第 7.6.3 节](module_07_ZH.html#quantifiers-order)）。如果目标看不出未知量应该是什么，例如 `?n + ?n = 6`，就自己指定见证：`apply (rule_tac x = 3 in exI)`（[第 7.6.4 节](module_07_ZH.html#quantifiers-inst)）。

### Undefined fact（未定义的事实） {#undefined-fact}

```text
Undefined fact: "conjl"⌂
```

没有叫这个名字的定理。常见的情况是大写的 I 变成了小写的 l，例如把 `conjI` 写成 `conjl`（[第 7.8.2 节](module_07_ZH.html#errors-name)），或者函数名拼错了，例如 `duraton.simps`（[第 8.4.4 节](module_08_ZH.html#names)）。定义的等式叫 `f_def`，`fun` 的等式叫 `f.simps`。可以用 `find_theorems name:` 搜索（[第 9.6 节](module_09_ZH.html#find)）。

### SAT solver found a countermodel（SAT 求解器找到了一个反模型） {#sat-countermodel}

```text
exception THM 0 raised⌂: SAT solver found a countermodel:
A: true, B: true, C: false
```

`sat` 失败了，因为目标不是重言式。第一行是技术性的（抛出了 THM 0 异常）；第二行是一个反例（[第 2.8 节](module_02_ZH.html#sat)）。

### exception THM：infer_instantiate_types（THM 异常：类型实例化推断失败） {#thm-instantiate}

```text
exception THM 0 raised⌂:
  infer_instantiate_types: type ?'a of variable ?a
  cannot be unified with type 'a of term n
  (⋀x. (⋀y. y < x ⟹ ?P y) ⟹ ?P x) ⟹
  ?P ?a
```

规则 `less_induct` 不能用于类型未知的变量。给这个变量加上标注，例如 `0 < (n::nat)`（[第 11.8 节](module_11_ZH.html#complete)）。

### 规则归纳留下了毫无意义的目标 {#rule-induction-pattern}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. m ⟹ d = Closed
```

归纳前提中出现了模式（这里是 `lreach (d, m)`）或常量，而规则中的那个位置是变量，于是各个情形失去了意义。把性质写成整个状态的函数，例如 `lreach s ⟹ lift_ok s`（[第 13.3 节](module_13_ZH.html#invariants)），或者借助一个等式用变量代替常量（[第 11.7.2 节](module_11_ZH.html#constants)）。

### 规则归纳用错了前提 {#rule-induction-premise}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ⋀aa b c.
       ⟦r aa b; steps r b c; steps r a b ⟹ steps r a c; steps r a aa⟧
       ⟹ steps r a c
```

`induction rule: steps.induct` 总是对第一个前提做归纳。把你要做归纳的那个前提放在最前面（[第 11.7.1 节](module_11_ZH.html#closure)）。

### 不变式证明的步骤情形失败 {#invariant-step}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ⟦reach s; e = ToGreen; cars s = Red; ¬ req s; peds s = Walk⟧ ⟹ False
```

这个目标描述了一个满足该性质的状态，以及一个使系统离开它的事件：这是一个归纳反例。如果这个状态可达，设计就是错的；用 `nitpick` 搜索一条轨迹。如果不可达，就用一个在所有可达状态中都成立的事实加强不变式（[第 13.5 节](module_13_ZH.html#strengthen)、[第 13.6 节](module_13_ZH.html#traces)）。

## Isar 证明 {#isar}

### proof 处的 Failed to apply initial proof method {#proof-start}

```text
Failed to apply initial proof method:
goal (1 subgoal):
 1. False
```

不带方法的 `proof` 会应用目标的标准规则，而像 `False` 或数之间的等式这样的目标，没有规则可用。写 `proof -`，它开始证明块但不改变目标；或者指明规则：`proof (rule r)`（[第 10.2.6 节](module_10_ZH.html#shape-start)）。

### Failed to refine any pending goal（未能解决任何待证目标） {#refine}

```text
Failed to refine any pending goal
```

`show` 的断言已经证明了，但在它所在块的假设之下，它解决不了任何待证目标。在 `show` 的证明完成之前，Isabelle/jEdit 就会给出警告“Local statement fails to refine any pending goal”（局部陈述未能解决任何待证目标）（[第 10.8 节](module_10_ZH.html#errors)）。

- **断言不是目标。** 把它和证明状态中的目标比较；检查 `?thesis` 和 `?case`。把 `show` 改成 `have`，就能知道断言本身是否正确。
- **情形之间少了 `next`：** 第一个情形的假设在第二个情形中仍然有效（[第 10.5.2 节](module_10_ZH.html#cases-datatype)）。
- **`assume` 的内容不是目标的前提**（[第 10.2.1 节](module_10_ZH.html#shape-blocks)）。

### Illegal application of proof command in "prove" mode（在“prove”模式下非法使用证明命令） {#illegal-prove}

```text
Illegal application of proof command in "prove" mode
```

某个断言（`have`、`show`、`lemma`）没有证明，所以下一个命令来得太早了。给这个断言一个证明：`by …` 或 `proof … qed`（[第 10.8 节](module_10_ZH.html#errors)）。如果这条消息出现在 `end` 处，说明理论中最后一个证明没有完成（[第 7.8.4 节](module_07_ZH.html#errors-forget)）。

### Undefined case（未定义的情形） {#undefined-case}

```text
Undefined case: "Empty"⌂
```

情形名来自构造子（列表是 `Nil` 和 `Cons`，自然数是 `0` 和 `Suc`）、归纳定义的规则、函数的等式（`1`、`2`、`3`），`less_induct` 则是 `less`。Isabelle/jEdit 显示的证明大纲和 `print_cases` 都会列出正确的名字（[第 10.6.2 节](module_10_ZH.html#induction-names)）。

### 在归纳中写了 show ?thesis {#thesis-in-induction}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. mysum (xs @ ys) = mysum xs + mysum ys
```

在归纳中，`?thesis` 是针对原来变量的整条引理，而不是当前情形的断言。应写 `show ?case`（[第 10.6.2 节](module_10_ZH.html#induction-names)）。

### 没有传递事实 {#not-passed}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. hi < x ⟶ ¬ x < lo ⟶ lo ≤ hi
```

证明方法只看得见目标，以及用 `then`、`from`、`with` 或 `using` 传给它的事实。这里没有传递引理的假设 `lo ≤ hi`：应写 `using assms`（[第 10.3.3 节](module_10_ZH.html#facts-visible)）。如果剩下的目标就是归纳假设本身，说明没有传递归纳假设：应写 `then show ?case` 或 `using Cons.IH`（[第 10.6.2 节](module_10_ZH.html#induction-names)）。

### 归纳假设对不上 {#ih-not-fit}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. sumacc xs (acc + x) = acc + x + sum_list xs
```

这一步需要关于另一个值（这里是 `acc + x`）的归纳假设，但归纳假设只涉及断言中固定的 `acc`，所以 `rule Cons.IH` 对不上。推广这个变量：`induction xs arbitrary: acc`（[第 11.2.2 节](module_11_ZH.html#arbitrary)）。模块 14 的编译器证明出于同样的原因需要 `arbitrary: stk`（[第 14.5.4 节](module_14_ZH.html#isar)）。

### 计算链证明了更强的结论 {#calc-strict}

```text
Failed to apply initial proof method:
using this:
  x < z
goal (1 subgoal):
 1. x ≤ z
```

`finally` 得出的是链中最严格的关系，而 `.` 只接受恰好是这个事实的断言。要么断言 `x < z`，要么把 `.` 换成一个能把它减弱的方法，例如 `by simp`（[第 10.4.2 节](module_10_ZH.html#calc-ineq)）。

### Vacuous calculation result（空洞的计算结果） {#vacuous}

```text
Vacuous calculation result: (⋀x y. x ≤ y ⟹ a ≤ a) ⟹ b ≤ a
derived as projection (1) from:
    b ≤ a
    c ≤ a
```

计算推理中的各步接不上。Isabelle 把 a ≥ b 读作 b ≤ a，所以在用 ≥ 写的链中，`…` 代表的是错误的项。从小的一端写到大的一端，只用 `=`、`≤` 和 `<`（[第 10.4.2 节](module_10_ZH.html#calc-ineq)）。

### obtain 无法证明 {#obtain}

```text
Failed to apply initial proof method⌂:
goal (1 subgoal):
 1. (⋀a. admin a ⟹ thesis) ⟹ thesis
```

这个目标正是 `obtain` 需要证明的，而它的证明没有得到那个存在性事实。写成 `then obtain`，或者用 `using` 传入这个事实（[第 10.3.4 节](module_10_ZH.html#facts-obtain)）。

### 情形遮住了同名的规则 {#case-hides-rule}

```text
Failed to finish proof⌂:
goal (1 subgoal):
 1. ev (Suc (Suc (k + n)))
```

在 `case ev_SS` 之内，名字 `ev_SS` 指的是这个情形的事实，而不是那条规则。使用规则的全名 `ev.ev_SS`（[第 11.6.2 节](module_11_ZH.html#rule-induction)）。

## 自动工具 {#tools}

### Quickcheck found a counterexample（Quickcheck 找到了一个反例） {#quickcheck-found}

```text
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  n = 1
Evaluated terms:
  double n = 2
  n * n = 1
```

对这些值，断言不成立，所以任何证明都不可能成功。修正陈述，或者用 `oops` 放弃它。Isabelle/jEdit 会对每条新引理运行 Quickcheck，找到反例时在那一行旁边标上蓝色的 **i**（[第 1.7.5 节](module_01_ZH.html#first-refute)、[第 9.7.1 节](module_09_ZH.html#quickcheck)）。a₁、a₂ 这样的值是某个类型中的不同元素，Quickcheck 对这个类型别无所知。

### Quickcheck found no counterexample（Quickcheck 没有找到反例） {#quickcheck-none}

```text
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

这只是证据，不是证明：Quickcheck 只尝试了较小的值（[第 9.7.1 节](module_09_ZH.html#quickcheck)）。如果断言的反例很大，例如一条由五个事件组成的运行，就固定输入的大小（[第 13.6 节](module_13_ZH.html#traces)）。如果断言的变元中有函数，Quickcheck 可能会以“Quickcheck ran out of time”（Quickcheck 超时）停止：用 `quickcheck [size = 3]` 限制搜索范围（[第 14.4.3 节](module_14_ZH.html#testing)）。

### Nitpick found a counterexample（Nitpick 找到了一个反例） {#nitpick-found}

```text
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = True
    B = True
    C = False
```

Nitpick 为自由变元找到了使断言为假的值（[第 2.4 节](module_02_ZH.html#classify)）。在更大的回答中，`card 'a = 2` 给出它所用论域的大小，**Skolem constant**（斯科伦常量）下面列出它为约束变元选定的值（[第 3.4 节](module_03_ZH.html#validity)）。标为“potentially spurious”（可能是虚假的）的反例在更大的模型中可能消失：只把它当作提示（[第 9.7.2 节](module_09_ZH.html#nitpick)）。不加选项 `card` 时，Nitpick 会并行地尝试多种大小，它的回答每次运行都可能不同；`[card = 6]` 或 `[card 'a = 2]` 能让回答可以重现（[第 13.6 节](module_13_ZH.html#traces)）。

### Nitpick found no counterexample（Nitpick 没有找到反例） {#nitpick-none}

```text
Nitpicking formula...

Nitpick found no counterexample
```

Nitpick 搜索了不超过一定大小的论域，什么也没有找到。这不是证明：有些不是有效的公式，它们的反模型全都是无限的（[第 3.4 节](module_03_ZH.html#validity)、[第 3.9 节](module_03_ZH.html#decidability)）。

### Hint: Maybe you forgot a type constraint?（提示：也许你忘了加类型约束？） {#type-constraint}

```text
Hint: Maybe you forgot a type constraint?
```

这是 Nitpick 回答的最后一行，表示反例可能依赖于你没有想到的类型：在 `A - (B - C) = A - B - C` 中，`-` 除了集合之外也适用于其他类型。给一个变元加上标注，例如 `(C :: 'a set)`（[第 4.1.4 节](module_04_ZH.html#sets-isabelle)）。

### 读懂 Sledgehammer 的回答 {#sledgehammer}

```text
Sledgehammering...

metis found a proof...

metis: Try this: by (metis mult_le_mono mult_le_mono1) (82 ms)
```

每个成功的证明器都会报告“… found a proof...”（找到了一个证明），并在“Try this:”（试试这个）后面给出一个证明，括号中是检查它所用的时间。“Duplicate proof”（重复的证明）表示这个证明已经有别的证明器给出过，“Done”（完成）表示所有证明器都结束了。点击一个简短、快速的建议即可插入它，然后删掉 `sledgehammer` 这一行（[第 9.8 节](module_09_ZH.html#sledgehammer)）。

- **没有证明器找到证明。** 目标可能是错的（试试 `quickcheck` 和 `nitpick`），可能需要归纳，或者需要一条库里没有的引理。也可以给证明器更多时间：`sledgehammer [timeout = 120]`。
- **建议的 `metis` 调用失败，或者运行很长时间。** 换一个建议试试。

### Tracing paused（跟踪已暂停） {#tracing-paused}

```text
Tracing paused. Stop, or continue with next 100, 1000, 10000 messages?
```

意思是：跟踪已暂停；要停止，还是继续显示接下来的 100、1000 或 10000 条消息？Isabelle/jEdit 对一条命令最多显示 1000 条跟踪消息。如果一个很小的目标就出现了这种情况，就要怀疑有循环的规则。用完之后，删掉 `using [[simp_trace]]`（[第 9.3.5 节](module_09_ZH.html#tracing)）。

### 化简器停不下来 {#simp-loops}

没有消息：证明一直在运行。化简规则集中有会循环的规则，例如一个等式和它的镜像，或者像 `∀x. f x = g (f x)` 这样的假设，它把一个项重写成包含它自身的项。去掉那条规则；用 `simp flip: name` 在这一次调用中把规则反过来用，用 `simp (no_asm)` 忽略假设（[第 9.3.4 节](module_09_ZH.html#loops)、[第 9.3.2 节](module_09_ZH.html#assumptions)）。

### 新引理旁边的蓝色 i {#auto-tools}

```text
Auto solve_direct: the current goal can be solved directly with List.rev_rev_ident: rev (rev ?xs) = ?xs
```

Isabelle/jEdit 会对每个新陈述运行 Auto Quickcheck 和 Auto solve_direct。这条消息的意思是：自动 solve_direct 发现当前目标可以直接用 List.rev_rev_ident 解决，也就是说库里已经有这条引理，你可以直接使用库里的定理，而不必再证明一遍。消息“Auto Quickcheck found a counterexample:”（自动 Quickcheck 找到了一个反例）则说明这个陈述是错的（[第 1.7.3 节](module_01_ZH.html#first-prove)、[第 1.7.5 节](module_01_ZH.html#first-refute)）。

## 安装与编辑器 {#install}

### Windows protected your PC（Windows 已保护你的电脑） {#windows-protected}

Isabelle 没有注册开发者的签名，所以 Windows 一开始会拒绝运行它。在蓝色的“Windows protected your PC”窗口中，先点击 **More info**（更多信息），再点击 **Run anyway**（仍要运行）（[第 1.5 节](module_01_ZH.html#install)）。

### macOS：没有 Open Anyway 按钮 {#macos-open-anyway}

只有在你尝试打开过一次该应用之后，**System Settings → Privacy & Security**（系统设置 → 隐私与安全性）中才会出现 **Open Anyway**（仍要打开）按钮。再打开一次 Isabelle2026.app，点击 **Cancel**（取消），然后再去那里找（[第 1.5 节](module_01_ZH.html#install)）。

### Linux：Isabelle/jEdit 无法启动 {#linux-desktop}

Isabelle/jEdit 需要一个能运行 Java 图形界面的桌面环境。在桌面会话中用 `Isabelle2026/Isabelle2026` 启动它（[第 1.5 节](module_01_ZH.html#install)）。

### Isabelle 非常慢，或者内存不足 {#memory}

关闭其他占用内存大的程序。Isabelle 主页说明，小型实验需要 4 GB 内存和 2 个处理器核心，中等规模的应用需要 8 GB 和 4 个核心（[第 1.5 节](module_01_ZH.html#install)）。

### Windows 上的证明器无法运行 {#windows-defender}

Windows Defender 可能会阻止 Isabelle 的外部证明器，而 Sledgehammer 和 `smt` 要用到它们。按照 Isabelle 安装页面的建议，在 **Virus & threat protection**（病毒和威胁防护）中排除整个 Isabelle 文件夹，然后再试一次（[第 1.5 节](module_01_ZH.html#install)、[第 9.8 节](module_09_ZH.html#sledgehammer)）。

### 什么都还没有检查 {#prover-ready}

启动之后，Isabelle 先要加载 HOL。等到右侧的 **Theories**（理论）面板显示 **Prover: ready**（证明器：就绪）（[第 1.5 节](module_01_ZH.html#install)）。如果理论导入了 `Main` 之外的库理论，例如 `"HOL-Library.Multiset"`，每次启动 Isabelle/jEdit 时都要加载它，需要一点时间；Theories 面板会显示进度（[第 12.2.1 节](module_12_ZH.html#isort-program)）。

### 看不到证明状态 {#proof-state}

点击窗口底部的标签打开 **Output**面板，并勾选其中的**Proof state**；这个设置会被记住。然后把光标放在你想查看其状态的那一行的末尾（[第 1.6 节](module_01_ZH.html#tour)、[第 5.4.3 节](module_05_ZH.html#by-induction)）。没有勾选 **Proof state**时，目标会显示在单独的**State**（状态）面板中。

### 符号不被接受 {#symbol}

⟷ 要输入 `<-->`：较短的 `<->` 也是 ↔ 的缩写，jEdit 会先提供 ↔，而 HOL 不接受 ↔。按 <kbd>Tab</kbd> 接受补全；按 <kbd>Return</kbd>（回车）不会接受补全。速查表列出了[所有符号](cheatsheet_ZH.html#symbols)。

### 生成的代码在哪里？ {#theory-exports}

```text
See theory exports
```

意思是：见理论导出。`export_code` 把代码保存为理论导出，而不是把它打印出来。在 Isabelle/jEdit 中，消息里的 *theory exports* 是一个链接：点击它，File Browser（文件浏览器）就会打开生成的文件，它们位于一个名字以 `isabelle-export:` 开头的文件夹中（[第 8.8 节](module_08_ZH.html#codegen)、[第 12.7 节](module_12_ZH.html#export)）。
