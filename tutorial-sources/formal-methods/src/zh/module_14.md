---
title: 综合项目：验证编译器
part: 4
lead: 在 Isabelle 中构建一个小型编译器，把算术表达式编译成栈机指令，先测试，再证明生成的代码对所有表达式都正确。接着验证一个优化过程，把编译器导出为 Haskell 代码，并加入减法、条件表达式和跳转。
minutes: 240
needs: 模块 1–13，尤其是模块 8（数据类型和函数）、模块 10（Isar）和模块 11（推广和辅助引理）
goals:
  - 用数据类型定义一个小型语言，用求值函数定义它的含义
  - 定义一台栈机和面向它的编译器，并在例子上比较求值与执行的结果
  - 在证明任何东西之前，先用 value 和 Quickcheck 测试编译器
  - 用归纳法证明编译器是正确的：对栈进行推广，并补上关于连接代码的引理
  - 证明一项优化是正确的，把两个定理结合起来，并把经过验证的编译器导出为代码
  - 扩展语言和机器，并判断证明的哪些部分仍然适用
imports: Main
---

## 回到起点 {#circle}

Module 1 从必须不失败的软件开始，其示例之一是编译器：CompCert，一个带有机器检查正确性证明的 C 编译器。编译器值得这种关注。你运行的许多软件都依赖于编译器，而翻译错误可能会改变正确源代码的行为。它也可能使端到端保证失效。关于 C 函数的证明针对的是 C 代码，但计算机运行的是编译器生成的任何内容。在 Exercise 1.6 中，编译器出现在已验证程序仍需信任的事物列表中。已验证的编译器将其从该列表中移除，或几乎如此（Section 14.7 说明了剩余部分）。其定理指定了在源语义和目标语义以及该定理的假设下，编译成功时保留的行为。

这个想法几乎和编译器一样古老。1967 年，约翰·麦卡锡（John McCarthy）和詹姆斯·佩因特（James Painter）在纸上证明了一个算术表达式编译器是正确的，这是此类证明中的第一个。1972 年，罗宾·米尔纳（Robin Milner）和理查德·韦劳赫（Richard Weyhrauch）在斯坦福 LCF 中用机器检查了这样一个证明，针对的是一个把算术表达式编译成栈机代码的编译器；斯坦福 LCF 是模块 1 中那个 LCF 系统的前身。如今，CompCert 能编译 C 语言的一个很大的子集，而在证明器 HOL4 中验证的 CakeML 能编译 ML 的一种方言。它们的证明长达成千上万行，但其中的核心论证，正是你将在本模块中写出的那一个，所用的语言也正是麦卡锡和佩因特当年起步时的那个语言。

每一部分都由你亲手构造：

1. 一种由算术表达式组成的源语言，以及它的含义（第 14.2 节）；
2. 一台用栈来计算的目标机器（第 14.3 节）；
3. 编译器，以及比较源语言与目标机器的测试（第 14.4 节）；
4. 编译器正确性的证明（第 14.5 节）；
5. 一项带有自己的证明的优化，以及导出为 Haskell 的经过验证的代码（第 14.6 节和第 14.7 节）；
6. 扩展：减法、条件表达式和跳转（第 14.8 节）。

对编译器来说，“正确”是什么意思？图 14.1 给出了本模块要证明的答案。从一个表达式出发，有两条路可以得到结果。你可以利用源语言的含义，直接对表达式求值（evaluate）；也可以先编译它，再在机器上运行得到的代码。如果这两条路的结果总是一致，编译器就是正确的。

::: figure id=fig-14-1
对一个表达式求值和运行它编译出的代码，结果必须一致。第 14.5 节的定理 `compile_correct` 说明它们确实一致：对每个表达式、变量的每个状态和每个栈都是如此。
:::

该机器是一个**stack machine**：它在栈上保存中间结果，算术指令从栈顶消耗值并将结果压入栈中。这是一种现实的设计。Java 虚拟机、WebAssembly 和 Python 解释器都运行这种栈机器的指令，且它们的编译器生成此类代码。

::: keyidea
编译器进行翻译，且正确的翻译保持语义。要证明这一点，你需要两种语言的语义，此处它们为数学函数：源语言的求值与目标语言的执行。其他语言可能需要关系来描述非终止或非确定性。此处“保持语义”变为一个可在示例上测试并通过归纳法证明的等式。
:::

## 表达式及其含义 {#source}

### 名字、状态和表达式 {#syntax}

程序以文本形式编写，但编译器处理的是其结构。文本 `x + (2 + y)` 是一个加法，其左操作数是变量 x，右操作数是另一个加法，由数字 2 和变量 y 组成。将文本转换为结构的程序是 **parser**。解析是一个独立的主题。该模块从语法树开始，不验证解析器或文本输入格式。

::: definition 抽象语法
一种语言的**抽象语法**（abstract syntax）把它的程序描述成树：每个结点（node）是一个运算，它的子结点是运算的操作数。括号和空格属于文本，即**具体语法**（concrete syntax），它们不出现在树中。在 Isabelle 中，抽象语法就是一个数据类型（datatype）。
:::

表达式中含有变量，所以你需要变量的名字，以及给变量赋值的办法。名字是字符串。和模块 4 中一样，字符串写在两对单引号之间，例如 `''x''`，因为双引号已经用来标记项（term）的结束了。值是整数（`int`，模块 8），这样等第 14.8 节加入减法时，减法才有意义。某一时刻所有变量的值合在一起，构成一个**状态**（state）：一个从名字到值的函数。

```isabelle
type_synonym vname = string
type_synonym state = "vname ⇒ int"
```

`type_synonym` 给一个已有的类型起一个新名字。`vname` 是 `string` 的另一个名字，而 `string` 本身就是 `char list`，即字符的列表；`state` 是 `vname ⇒ int` 的另一个名字。这里并没有创造出任何新东西：Isabelle 的输出常常显示完整的类型，而不是这些简短的名字。

一个表达式要么是一个数，要么是一个变量，要么是两个表达式之和：

```isabelle
datatype expr = Num int | Var vname | Add expr expr
```

这个数据类型是递归的，就像模块 5 中的树一样，它的值正是上面所描述的那些树：`Add` 构造一个有两个子结点的结点，`Num` 和 `Var` 构造叶结点。文本 `x + (2 + y)` 变成了树 `Add (Var ''x'') (Add (Num 2) (Var ''y''))`。本模块会一直用它作例子，所以给它起个名字：

```isabelle
definition sample :: expr where
  "sample = Add (Var ''x'') (Add (Num 2) (Var ''y''))"
```

### 求值 {#eval}

表达式的含义就是它的值，而它的值取决于状态。下面这个递归函数说明每一种结点的含义：

```isabelle
fun eval :: "expr ⇒ state ⇒ int" where
  "eval (Num n) s = n"
| "eval (Var x) s = s x"
| "eval (Add a b) s = eval a s + eval b s"
```

```output
consts
  eval :: "expr ⇒ (char list ⇒ int) ⇒ int"

Found termination order: "(λp. size (fst p)) <*mlex*> {}"
```

把这些等式读出来：一个数的含义就是它自己；一个变量的含义是它在状态 s 中的值；一个和的含义是它的各部分的含义之和。左边的 `Add` 是一段语法；右边的 `+` 是整数的加法。`eval` 把两者联系了起来。Isabelle 显示 `eval` 的类型时，把类型同义词展开了，`state` 显示成了 `char list ⇒ int`；它还报告 `eval` 会终止，因为每次递归调用都作用在一个更小的表达式上，也就是它的两个参数中的第一个（模块 8）。

::: definition 语义
一种语言的**语义**（semantics）给它的每个程序一个精确的数学含义，这是模块 1 所说的形式化方法（formal method）的第二个要素。在这里，表达式 e 在状态 s 中的含义就是整数 `eval e s`。这个定义是**组合式的**（compositional）：一个结点的含义由它的子结点的含义计算出来。
:::

要试用 `eval`，你需要一个状态。Isabelle 用 `f(a := v)` 表示这样一个函数：它把 a 映射到 v，而把其他每个参数 b 映射到 `f b`；你在模块 3 中 Nitpick 给出的反例里见过这种记号。从 `λ_. 0` 出发，它是把每个名字都映射到 0 的函数（下划线是一个名字无关紧要的变量），然后对它更新两次：

```isabelle
definition s0 :: state where
  "s0 = (λ_. 0)(''x'' := 5, ''y'' := 7)"

value "(s0 ''x'', s0 ''y'', s0 ''z'')"
```

```output result
"(5, 7, 0)"
  :: "int × int × int"
```

在状态 `s0` 中，变量 x 的值是 5，y 的值是 7，其他每个变量的值都是 0。现在对这个例子求值：

```isabelle
value "eval sample s0"
```

```output
"14"
  :: "int"
```

::: example 手工求值
`eval` 的等式一步一步地得出同样的结果。展开 `sample`，从外向内计算：

$$
\begin{aligned}
\mathit{eval}\ \mathit{sample}\ s_0
&= \mathit{eval}\ (\mathit{Var}\ x)\ s_0 + \mathit{eval}\ (\mathit{Add}\ (\mathit{Num}\ 2)\ (\mathit{Var}\ y))\ s_0\\
&= 5 + (\mathit{eval}\ (\mathit{Num}\ 2)\ s_0 + \mathit{eval}\ (\mathit{Var}\ y)\ s_0)\\
&= 5 + (2 + 7) = 14
\end{aligned}
$$
:::

## 一台栈机 {#machine}

目标机器对表达式一无所知。它有一个整数栈，像表达式一样从状态中读取变量，并且懂得三条指令：

- `PUSH n` 把数 n 放到栈顶；
- `LOAD x` 把变量 x 的值放到栈顶；
- `ADD` 从栈顶取下两个数，再把它们的和放上去。

```isabelle
datatype instr = PUSH int | LOAD vname | ADD

type_synonym stack = "int list"
```

栈是一个列表，它的头部（head）就是栈顶：在 `[2, 5]` 中，2 位于 5 的上面。把一个值放到栈上用 `#`，从栈上取下值则用对 `#` 的模式匹配（pattern matching）。

::: definition 栈机
**栈式机器**用**栈**进行运算。栈是一列值，只在一端操作，这一端称为**栈顶**。算术指令从栈顶取出操作数，并把结果压回栈中。`PUSH` 和 `LOAD` 等指令提供栈中的值。这台机器没有跳转，它的**程序**是一列从左到右依次执行的指令。
:::

函数 `exec1` 执行一条指令：

```isabelle
fun exec1 :: "instr ⇒ state ⇒ stack ⇒ stack" where
  "exec1 (PUSH n) s stk = n # stk"
| "exec1 (LOAD x) s stk = s x # stk"
| "exec1 ADD s (j # i # stk) = (i + j) # stk"
| "exec1 ADD s stk = stk"
```

第三个等式执行了`ADD`的工作：j 是栈顶元素，i 是其下方的数值，且和 i + j 替换了这两个元素。i 和 j 的顺序目前看似无关，但在第 14.8 节引入减法时将变得重要。每个 HOL 函数对每个参数都表示一个值（Module 8）；第四个等式对格式错误的`ADD`指令做出了明确选择，而不是让未指定的情况缺失。当数值少于两个时，它保持栈不变。另一台机器可能会报告**stack underflow**，意味着操作数不足。编译后的表达式在`ADD`之前提供两个操作数；Exercise 14.7 通过一台明确报告失败的机器验证了这一点。

第三个和第四个等式有重叠：一个有两个或更多个数的栈与两者都匹配。`fun` 按顺序处理这种重叠，排在前面的等式优先（模块 8）。`thm exec1.simps` 显示 `fun` 从定义中推导出的等式，也就是 `simp` 所使用的那些等式：

```isabelle
thm exec1.simps
```

```output
  exec1 (PUSH ?n) ?s ?stk = ?n # ?stk
  exec1 (LOAD ?x) ?s ?stk = ?s ?x # ?stk
  exec1 ADD ?s (?j # ?i # ?stk) = (?i + ?j) # ?stk
  exec1 ADD ?s [] = []
  exec1 ADD ?s [?v] = [?v]
```

第四个等式变成了两个，一个针对空栈，一个针对只有一个数的栈：恰好就是第三个等式没有覆盖的那些栈。

程序一条接一条地执行指令，每条指令都作用在前一条指令留下的栈上：

```isabelle
fun exec :: "instr list ⇒ state ⇒ stack ⇒ stack" where
  "exec [] s stk = stk"
| "exec (i # c) s stk = exec c s (exec1 i s stk)"
```

字母 c 代表代码（code），即一个指令列表。现在运行这台机器，先运行一条指令，再运行一整个程序：

```isabelle
value "exec1 ADD s0 [7, 5]"
```

```output
"[12]"
  :: "int list"
```

```isabelle
value "exec [LOAD ''x'', PUSH 2, LOAD ''y'', ADD, ADD] s0 []"
```

```output
"[14]"
  :: "int list"
```

图 14.2 显示了这个程序的每条指令执行之后的栈。`LOAD ''y''` 执行之后，栈增长到三个数，而每条 `ADD` 都让它少一个数。

::: figure id=fig-14-2
程序 `LOAD ''x'', PUSH 2, LOAD ''y'', ADD, ADD` 在状态 `s0` 中从空栈开始运行。每条 `ADD` 都把栈顶的两个数换成它们的和。
:::

此序列仅执行压栈操作，因此预存的栈内容仍保留在新值下方：

```isabelle
value "exec [LOAD ''x'', PUSH 2] s0 [100]"
```

```output
"[2, 5, 100]"
  :: "int list"
```

任意机器程序可以消耗预先存在的值：`ADD` 上述示例即如此。编译器定理将确立表达式的代码在压入其结果的同时保持原始栈不变。

## 编译器 {#compiler}

### 编译表达式 {#compiling}

机器怎样计算 `Add a b`？它先运行一段把 a 的值留在栈上的代码，再运行一段把 b 的值留在 a 的值上面的代码，然后执行 `ADD`。数和变量各需要一条指令。这就是整个编译器：

```isabelle
fun compile :: "expr ⇒ instr list" where
  "compile (Num n) = [PUSH n]"
| "compile (Var x) = [LOAD x]"
| "compile (Add a b) = compile a @ compile b @ [ADD]"
```

`@` 把列表连接起来（模块 1）。和 `eval` 一样，编译器对每种结点各有一个等式，而一个结点的代码由它的子结点的代码构造而成。编译这个例子：

```isabelle
value "compile sample"
```

```output
"[LOAD ''x'', PUSH 2, LOAD ''y'', ADD, ADD]"
  :: "instr list"
```

这正是图 14.2 中的程序。操作数排在它们的运算符前面：先是 x，然后是 2 和 y，然后是内层的 `ADD`，最后是外层的 `ADD`。这种顺序称为**后缀表示法**（postfix notation），也叫**逆波兰表示法**（reverse Polish notation）。

::: analogy
有些袖珍计算器使用逆波兰表示法。要计算 2 + 3，你依次按下 2、Enter、3，最后按 +。计算器把数保存在一个栈上，直到 + 把它们合在一起，这和 `ADD` 的做法完全一样。编译器把你在学校里学的写法，翻译成这种计算器上的按键顺序。
:::

现在在这个例子上比较求值和执行的结果，这次栈上已经有了 100：

```isabelle
value "(exec (compile sample) s0 [100], eval sample s0 # [100])"
```

```output
"([14, 100], [14, 100])"
  :: "int list × int list"
```

两者都在 100 的上面得到 14。

::: pitfall
为什么编译器叫 `compile`，而不叫更短的 `comp`？因为 `comp` 已经被占用了。它是函数复合（composition），写作 ∘：

```isabelle
term comp
```

```output
"(∘)"
  :: "('a ⇒ 'b) ⇒ ('c ⇒ 'a) ⇒ 'c ⇒ 'b"
```

Isabelle 会接受你自己定义的名为 `comp` 的函数，该名称随后将指向你的定义。但短名称会有两种含义，因此 Isabelle 可能需要打印如 `T.comp (Num 1)` 这样的限定名称，以在理论 `T` 中消除歧义。在命名函数之前，应询问 Isabelle 该名称是否自由。`term` 打印已存在常量的类型；一个新鲜且未声明的名称被读作自由变元（第 8 节）；在不受约束的 `term` 命令中，其类型为 `'a`。该输出并非存在常量的证据。`find_consts`（第 9 节）按类型搜索，并使用条件 `name:` 按名称搜索。
:::

### “正确”是什么意思 {#correct}

在这个例子上，两条路的结果一致。“正确”的意思是它们总是一致：

::: definition 编译器正确性
编译器是**正确的**（correct），是指对每个表达式 e、每个状态 s 和每个栈 stk，都有

$$
\mathit{exec}\ (\mathit{compile}\ e)\ s\ \mathit{stk} = \mathit{eval}\ e\ s\ \#\ \mathit{stk}
$$

用文字来说：在任意一个栈上运行 e 的代码，都会把 e 的值放到这个栈的顶上，而不改变它下面的任何东西。
:::

关于这个陈述，有三点值得注意。

- 它是模块 12 意义上的一个**规约**（specification）：`eval` 说明值必须是什么，而 `compile` 加上 `exec` 是实现（implementation）。
- 它谈论的是每一个栈，尽管用户是从空栈开始的。编译器会把代码组合起来：`Add a b` 中 b 的代码运行在一个已经存放着 a 的值的栈上。第 14.5 节会说明，证明需要这种一般的形式。
- 它描述的是整个栈。一个更弱的断言，比如“栈顶是 e 的值”，会允许代码破坏它下面的东西，而这样的代码会破坏它周围的代码。

### 先测试，再证明 {#testing}

证明要花力气，测试只需几秒钟。模块 9 建议，在尝试证明一个断言之前先测试它，所以从 Quickcheck 开始：

```isabelle
lemma "exec (compile e) s stk = eval e s # stk"
  quickcheck [size = 3]
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

Quickcheck 在其对表达式、状态和栈的有界测试值中未找到反例。`size = 3` 限制了生成器；它并不枚举从字符串到整数的所有数学函数。使用更大的默认搜索范围时，它可能会超时。错误的声明也可能需要超出边界的值，尽管 Quickcheck 在找到反例时会立即停止。

Quickcheck 最擅长对付错误的断言。下面是一个忘记了栈的正确性断言：

```isabelle
lemma "exec (compile e) s stk = [eval e s]"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  e = Num (- 1)
  s = λx. - 2
  stk = [- 1]
Evaluated terms:
  exec (compile e) s stk = [- 1, - 1]
  [eval e s] = [- 1]
```

读一读这个反例。表达式是数 −1（Isabelle 打印负数时会带一个空格，见模块 8），状态把每个名字都映射到 −2，这在这里无关紧要，而栈上已经有一个 −1。代码把 −1 压到栈顶，所以结果中有两个数，而断言期望的只有一个。错的是断言，而不是编译器。

现在来看一个有错误的编译器。按照文本 `x + y` 的顺序，把每个运算符写在它的两个操作数之间，是很自然的第一次尝试：

```isabelle
fun compile_bad :: "expr ⇒ instr list" where
  "compile_bad (Num n) = [PUSH n]"
| "compile_bad (Var x) = [LOAD x]"
| "compile_bad (Add a b) = compile_bad a @ [ADD] @ compile_bad b"

value "(compile_bad sample, exec (compile_bad sample) s0 [])"
```

```output result
"([LOAD ''x'', ADD, PUSH 2, ADD, LOAD ''y''], [7, 7])"
  :: "instr list × int list"
```

第一条 `ADD` 只找到一个数，什么也没有改变；第二条把 2 加到 5 上；而 y 的值最后落在栈上，挨着那个 7。只看一个例子，你可能会怀疑是不是自己哪里弄错了。Quickcheck 消除了这个疑虑：

```isabelle
lemma "exec (compile_bad e) s stk = eval e s # stk"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  e = Add (Num 0) (Num 0)
  s = λx. - 2
  stk = []
Evaluated terms:
  exec (compile_bad e) s stk = [0, 0]
  eval e s # stk = [0]
```

反例为 0 + 0，这是一个包含一次加法的表达式。具体数值无关紧要：指令顺序错误。单次加法是该编译器与正确编译器产生差异的最小表达式形状。

::: keyidea
证明前先测试。`value` 用于评估示例；Quickcheck 搜索有界测试用例，若找到反例则报告。二者均不确立无限制的正确性定理。真正的反例反驳了主张，而单一的未完成证明尝试并不能告诉你究竟是主张还是证明策略有误。
:::

## 正确性证明 {#proof}

### 纸上的证明 {#paper}

**断言**：对每个表达式 e、状态 s 和栈 stk，`exec (compile e) s stk = eval e s # stk`。

**证明**：对 e 用结构归纳法（structural induction，见模块 5），每个构造子（constructor）对应一种情形。

- **情形** `Num n`：代码是 `[PUSH n]`，它把 n 放到栈上，而 `eval (Num n) s = n`。
- **情形** `Var x`：代码是 `[LOAD x]`，它把 `s x` 放到栈上，而 `eval (Var x) s = s x`。
- **情形** `Add a b`，其中断言对 a 和 b 都成立，这就是两个归纳假设（induction hypothesis）。代码是 `compile a @ compile b @ [ADD]`。分三个阶段运行它（图 14.3）：
  1. `compile a` 在 stk 上运行。由 a 的归纳假设，它留下 `eval a s # stk`。
  2. `compile b` 在 `eval a s # stk` 上运行。把 b 的归纳假设用于**这个**栈，它留下 `eval b s # eval a s # stk`。
  3. `ADD` 把栈顶的两个数换成它们的和，得到 `(eval a s + eval b s) # stk`，而这就是 `eval (Add a b) s # stk`。∎

::: figure id=fig-14-3
证明中的情形 `Add a b`。a 的归纳假设用于断言中的那个栈，b 的归纳假设则用于另一个栈。
:::

这个论证中有两步用到的不只是函数的等式。

- **“分三个阶段运行它。”**运行 `c1 @ c2` 等于先运行 c1、再在 c1 留下的栈上运行 c2，这是 `exec` 的一个性质。它是对的，但需要单独证明：它是一条**辅助引理**（auxiliary lemma，见模块 11）。
- **“用于这个栈。”**第 2 阶段把 b 的归纳假设用于栈 `eval a s # stk`，而不是 stk。只有当断言，以及随之而来的归纳假设，谈论的是每一个栈时，这样做才是允许的。归纳必须对栈进行**推广**（generalise，见模块 11）。

接下来的两节让 Isabelle 从它的证明状态（proof state）中找出这两点。

### 关于连接代码的引理 {#append}

编译器的用户所关心的断言，从空栈开始，并期望最后得到一个数。试着用通常的归纳来证明它：

```isabelle
lemma "exec (compile e) s [] = [eval e s]"
  apply (induction e)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀e1 e2.
       ⟦exec (compile e1) s [] = [eval e1 s];
        exec (compile e2) s [] = [eval e2 s]⟧
       ⟹ exec (compile e1 @ compile e2 @ [ADD]) s [] =
          [eval e1 s + eval e2 s]
```

`auto` 证明了情形 `Num` 和 `Var`，并在情形 `Add` 中展开了 `compile`；Isabelle 根据类型名 `expr`，把两个子表达式叫做 e1 和 e2。然后它就停下了。按照模块 11 的做法，先找出化简器（simplifier）无法重写的子项：`exec (compile e1 @ compile e2 @ [ADD]) s []`。`exec` 的等式讲的是 `[]` 和 `i # c`，而这里的参数是用 `@` 连接起来的。放弃这次尝试：

```isabelle
  oops
```

接下来，把这个证明中特有的部分换成变量：问题就变成了，对任意的代码 c1 和 c2，`exec (c1 @ c2) s stk` 是什么。纸上的证明给出了答案：先运行 c1，再运行 c2。一个例子也与之相符：

```isabelle
value "(exec ([LOAD ''x'', PUSH 2] @ [ADD]) s0 [1],
        exec [ADD] s0 (exec [LOAD ''x'', PUSH 2] s0 [1]))"
```

```output
"([7, 1], [7, 1])"
  :: "int list × int list"
```

测试这个猜想：

```isabelle
lemma "exec (c1 @ c2) s stk = exec c2 s (exec c1 s stk)"
  quickcheck [size = 3]
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

通过对 c1 进行归纳来证明。`exec` 的递归调用接收一个新栈 `exec1 i s stk`，因此将栈泛化以赋予该归纳所需的假设，遵循 Module 11 的策略：

```isabelle
lemma exec_append [simp]: "exec (c1 @ c2) s stk = exec c2 s (exec c1 s stk)"
  apply (induction c1 arbitrary: stk)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀stk. exec ([] @ c2) s stk = exec c2 s (exec [] s stk)
 2. ⋀a c1 stk.
       (⋀stk. exec (c1 @ c2) s stk = exec c2 s (exec c1 s stk)) ⟹
       exec ((a # c1) @ c2) s stk = exec c2 s (exec (a # c1) s stk)
```

在子目标 2 中，归纳假设对每个栈都成立（⋀stk）。化简器把 `(a # c1) @ c2` 重写成 `a # (c1 @ c2)`，执行 `a`，然后需要把归纳假设用于栈 `exec1 a s stk`，而现在它可以这样用了：

```isabelle
  apply auto
  done
```

属性 `[simp]` 把这条引理加入化简器的规则（模块 9），这样从现在起，`simp` 和 `auto` 就会把连接起来的代码拆开。

### 对栈进行推广 {#generalise}

有了 `exec_append`，再试一次关于空栈的断言：

```isabelle
lemma "exec (compile e) s [] = [eval e s]"
  apply (induction e)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀e1 e2.
       ⟦exec (compile e1) s [] = [eval e1 s];
        exec (compile e2) s [] = [eval e2 s]⟧
       ⟹ exec1 ADD s (exec (compile e2) s [eval e1 s]) =
          [eval e1 s + eval e2 s]
```

进展：e1 的代码已运行，由 `exec_append` 和 e1 的假设得出，并留下 `[eval e1 s]`。现在 e2 的代码在栈 `[eval e1 s]` 上运行，但 e2 的假设仅涉及空栈。这是论文证明的第二个要点。加强归纳陈述，使其假设涵盖传递给第二个子表达式的栈。

```isabelle
  oops
```

模块 11 讲过该怎么做，分两步：

1. 把常量换成变量：对任意的栈 stk 断言这个结果。于是期望的结果变成了 `eval e s # stk`，而不再是 `[eval e s]`。这正是定义 14.4 中的陈述。
2. 在归纳中让这个变量成为任意的，这样归纳假设就对每个栈都成立，包括 e2 的代码运行时所在的栈 `eval e1 s # stk`。

两步都做了，证明就能通过：

```isabelle
lemma "exec (compile e) s stk = eval e s # stk"
  by (induction e arbitrary: stk) auto
```

只做第 1 步是不够的。没有 `arbitrary: stk`，stk 在整个归纳中都是固定的，e2 的归纳假设只谈论那一个栈，而 e2 的代码仍然在另一个栈上运行。第 14.5.4 节末尾的**如果出了问题**框展示了你会遇到的错误。

::: keyidea
按照递归的需要来陈述断言。`compile` 把 b 的代码放在 a 的代码之后，所以 b 的代码运行在一个已经存放着 a 的值的栈上。关于空栈的断言描述不了这种情况，关于每个栈的断言却可以。更强的断言反而更容易证明：这又是模块 11 中的发明者悖论（inventor's paradox）。
:::

### 用 Isar 写证明 {#isar}

一行的证明把论证藏了起来。Isar 证明一步一步地跟着纸上的证明走，而 Isabelle 会检查其中的每一步。`theorem` 和 `lemma` 的意思相同；它用来标出一个理论中的主要结果。

```isabelle
theorem compile_correct: "exec (compile e) s stk = eval e s # stk"
proof (induction e arbitrary: stk)
```

```output state
proof (state)
goal (3 subgoals):
 1. ⋀x stk. exec (compile (Num x)) s stk = eval (Num x) s # stk
 2. ⋀x stk. exec (compile (Var x)) s stk = eval (Var x) s # stk
 3. ⋀e1 e2 stk.
       ⟦⋀stk. exec (compile e1) s stk = eval e1 s # stk;
        ⋀stk. exec (compile e2) s stk = eval e2 s # stk⟧
       ⟹ exec (compile (Add e1 e2)) s stk = eval (Add e1 e2) s # stk
```

把子目标 3 读出来：“对所有的 e1、e2 和 stk：如果对每个栈，断言对 e1 成立，并且对每个栈，断言对 e2 成立，那么断言对 `Add e1 e2` 和 stk 成立”。归纳假设里面的 ⋀stk 就是 `arbitrary: stk` 的效果。情形 `Num` 和 `Var` 可以由定义推出；进入情形 `Add` 时，给两个子表达式起你自己的名字：

```isabelle
  case (Num n)
  show ?case by simp
next
  case (Var x)
  show ?case by simp
next
  case (Add a b)
```

```output state
proof (state)
this:
    exec (compile a) s ?stk = eval a s # ?stk
    exec (compile b) s ?stk = eval b s # ?stk

goal (1 subgoal):
 1. ⋀e1 e2 stk.
       ⟦⋀stk. exec (compile e1) s stk = eval e1 s # stk;
        ⋀stk. exec (compile e2) s stk = eval e2 s # stk⟧
       ⟹ exec (compile (Add e1 e2)) s stk = eval (Add e1 e2) s # stk
```

归纳假设列在 `this` 下面，其中出现了图式变量（schematic variable）`?stk`（模块 7）：它们可以用于任何栈。`Add.IH(1)` 是 a 的归纳假设，`Add.IH(2)` 是 b 的归纳假设。纸上的证明各用了它们一次：a 的用于栈 stk，b 的用于栈 `eval a s # stk`。陈述这两个事实，让 `rule` 去实例化 `?stk`：

```isabelle
  have run_a: "exec (compile a) s stk = eval a s # stk"
    by (rule Add.IH(1))
  have run_b: "exec (compile b) s (eval a s # stk)
               = eval b s # eval a s # stk"
```

```output state
proof (prove)
goal (1 subgoal):
 1. exec (compile b) s (eval a s # stk) = eval b s # eval a s # stk
```

```isabelle
    by (rule Add.IH(2))
```

现在写出模块 10 中的计算推理（calculation），按照图 14.3 的三个阶段进行：

```isabelle
  have "exec (compile (Add a b)) s stk
        = exec [ADD] s (exec (compile b) s (exec (compile a) s stk))"
    by simp
  also have "… = exec [ADD] s (exec (compile b) s (eval a s # stk))"
    by (simp only: run_a)
  also have "… = exec [ADD] s (eval b s # eval a s # stk)"
    by (simp only: run_b)
  also have "… = eval (Add a b) s # stk"
    by simp
  finally show ?case .
qed
```

第一步处理的是代码的形状：`simp` 展开 `compile`，并两次应用 `exec_append`，使得 a 的代码先运行，然后是 b 的代码，最后是 `ADD`。第二步和第三步只用 `run_a` 和 `run_b` 来重写（`simp only`，模块 9）。最后一步执行 `ADD` 并展开 `eval`。用户想要的那个关于空栈的定理，现在只是它的一个实例：

```isabelle
corollary compile_correct_empty: "exec (compile e) s [] = [eval e s]"
  by (simp add: compile_correct)
```

`corollary` 是 `lemma` 的另一个同义词，用于直接由某个定理得出的结果，即推论。

::: fact 编译器是正确的
对每个表达式 e、状态 s 和栈 stk，`exec (compile e) s stk = eval e s # stk`。特别地，`exec (compile e) s [] = [eval e s]`。（定理 `compile_correct` 和 `compile_correct_empty`。）
:::

::: trouble
去掉 `arbitrary: stk`，步骤 `run_b` 就会失败：

```isabelle fails
lemma "exec (compile e) s stk = eval e s # stk"
proof (induction e)
  case (Num n)
  show ?case by simp
next
  case (Var x)
  show ?case by simp
next
  case (Add a b)
  have run_b: "exec (compile b) s (eval a s # stk)
               = eval b s # eval a s # stk"
    by (rule Add.IH(2))
  then show ?case using Add.IH(1) by simp
qed
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. exec (compile b) s (eval a s # stk) = eval b s # eval a s # stk
```

没有 `arbitrary` 时，`Add.IH(2)` 说的是：对断言中的那一个栈 stk，`exec (compile b) s stk = eval b s # stk`。它与目标对不上，因为目标谈论的是栈 `eval a s # stk`，所以 `rule` 无法应用它。当带着归纳假设的 `rule` 像这样失败时，就去找一个本应是任意的变量（模块 11）。
:::

## 一项经过验证的优化 {#optimise}

真实编译器通过转换代码来改进它：它们 **优化** 代码。每个转换必须保留其规范所要求的行为，这产生了另一个证明义务。经过验证的优化附带一个定理，说明它保留了哪些行为。此处表达式使用总纯整数算术，保留意味着它们在每种状态下的值相等。

### 常量折叠 {#folding}

表达式的某一部分可能根本不依赖于状态。在 `(2 + 3) + (x + 0)` 中，和 2 + 3 在每个状态中都是 5，而加上 0 什么也不改变。编译器可以在编译时把这些工作一次做完，而不必在代码每次运行时都做一遍。

::: definition 常量折叠
**常量折叠**在编译时求值常量子表达式。下面的传递还执行代数化简，移除右侧的加0。优化**正确**，或**语义保持**，如果优化后的程序在每个状态下的含义与原始程序相同。
:::

这项工作一次处理一个加法，由一个函数来完成：它构造一个加法，并在可能的地方把它化简：

```isabelle
fun fold_add :: "expr ⇒ expr ⇒ expr" where
  "fold_add (Num m) (Num n) = Num (m + n)"
| "fold_add a b = (if b = Num 0 then a else Add a b)"
```

两个数会被立即相加。否则，右边加 0 的加法会被去掉，其他情况仍然是一个加法。这两个等式有重叠，第一个优先。优化器先折叠一个结点的子结点，再折叠这个结点本身：

```isabelle
fun cfold :: "expr ⇒ expr" where
  "cfold (Num n) = Num n"
| "cfold (Var x) = Var x"
| "cfold (Add a b) = fold_add (cfold a) (cfold b)"
```

在 `(2 + 3) + (x + 0)` 上试一试：

```isabelle
definition sample2 :: expr where
  "sample2 = Add (Add (Num 2) (Num 3)) (Add (Var ''x'') (Num 0))"

value "cfold sample2"
```

```output
"Add (Num 5) (Var ''x'')"
  :: "expr"
```

结果是 `5 + x`。代码从七条指令缩减到了三条：

```isabelle
value "(compile sample2, compile (cfold sample2))"
```

```output
"([PUSH 2, PUSH 3, ADD, LOAD ''x'', PUSH 0, ADD, ADD],
  [PUSH 5, LOAD ''x'', ADD])"
  :: "instr list × instr list"
```

`cfold` 只在两个数相遇的地方折叠。在 `2 + (3 + x)` 中它们没有相遇，所以什么也没有改变：

```isabelle
value "cfold (Add (Num 2) (Add (Num 3) (Var ''x'')))"
```

```output
"Add (Num 2) (Add (Num 3) (Var ''x''))"
  :: "expr"
```

要把它变成 `5 + x`，就需要用到结合律，需要一个更聪明的优化器，还需要一个与之相配的证明。

### 折叠保持含义 {#folding-correct}

要证明的断言是 `eval (cfold e) s = eval e s`。它的情形 `Add` 需要一个关于 `fold_add` 的事实：无论 `fold_add` 构造出什么，它的值都等于两个参数之和。先证明这个事实，对 `fold_add` 做计算归纳（computation induction，见模块 11）：

```isabelle
lemma eval_fold_add [simp]: "eval (fold_add a b) s = eval a s + eval b s"
  apply (induction a b rule: fold_add.induct)
```

```output state
proof (prove)
goal (5 subgoals):
 1. ⋀m n. eval (fold_add (Num m) (Num n)) s =
          eval (Num m) s + eval (Num n) s
 2. ⋀v b. eval (fold_add (Var v) b) s = eval (Var v) s + eval b s
 3. ⋀v va b. eval (fold_add (Add v va) b) s = eval (Add v va) s + eval b s
 4. ⋀a v. eval (fold_add a (Var v)) s = eval a s + eval (Var v) s
 5. ⋀a v va. eval (fold_add a (Add v va)) s = eval a s + eval (Add v va) s
```

这些情形对应于 `fold_add` 的等式，即 `fun` 消除重叠之后的那些等式，就像它对 `exec1` 所做的那样。第二个等式变成了四个：第一个等式没有覆盖的 a 和 b 的每一种形状各有一个。在每种情形中，化简器都能对 `fold_add` 求值，而 `auto` 会把 `if` 拆成两种情形：

```isabelle
  apply auto
  done
```

定理可以用结构归纳法证明：

```isabelle
theorem cfold_correct: "eval (cfold e) s = eval e s"
  by (induction e) auto
```

这次没有任意变量。`eval` 将状态不变地传递给其递归调用，因此针对相同 s 的假设正是案例 `Add` 所需要的。比较 `exec`，其递归调用接收一个新的栈：检查变化的参数是这些证明所需概括的有用指南，而非选择归纳假设的通用规则。

### 先优化，再编译 {#pipeline}

这两个定理正好可以拼在一起。先优化，再编译，得到的代码计算的仍然是原来那个表达式的值：

```isabelle
theorem compile_cfold_correct:
  "exec (compile (cfold e)) s stk = eval e s # stk"
  by (simp add: compile_correct cfold_correct)
```

`compile_correct` 把左边变成 `eval (cfold e) s # stk`，`cfold_correct` 再把它变成右边。经过验证的编译器就是这样一步步搭建起来的。CompCert 经过很长的一系列遍（pass）来翻译 C，途经好几种中间语言，而每一遍都有自己的证明，说明它保持含义；这些定理可以组合成一个定理，涵盖由各遍组成的整条链。

::: pitfall
在数学整数的语义下，优化是正确的；对于其他类型的数字，它可能是错误的。在 IEEE 浮点运算（采用向最近值舍入）中，将 +0.0 加到 −0.0 上会得到 +0.0。因此，将 `x + 0.0` 替换为 `x` 可能会改变零的符号。要求保留带符号零行为的编译器不能无条件地应用该重写；放宽浮点语义的选项可以允许它。将整数证明应用于浮点代码需要对所选语义进行单独的论证。
:::

## 从证明到程序 {#export}

编译器是 HOL 中的一个函数，而模块 8 讲过怎样把这样的函数变成其他语言的程序。把经过验证的编译器和优化器导出为 Haskell 代码：

```isabelle
export_code compile cfold in Haskell module_name StackCompiler
```

```output
See theory exports
```

和模块 8 中一样，代码不会出现在 **Output**（输出）面板中。在 Isabelle/jEdit 中，**theory exports**（理论的导出文件）这两个词是一个链接：点击它，**File Browser**（文件浏览器）就会打开生成的文件，它们位于一个名字以 `isabelle-export:` 开头的虚拟文件夹中。一个理论中的每条 `export_code` 都写入它自己的文件夹，第一条写入 `export1`，第二条写入 `export2`，依此类推；这里，`export1` 中存放着 Haskell 模块 `StackCompiler.hs`。下面是它的核心部分，与 Isabelle2026 生成的一模一样。两个数据类型：

```text
data Expr = Num Int | Var [Char] | Add Expr Expr;

data Instr = PUSH Int | LOAD [Char] | ADD;
```

以及三个函数：

```text
fold_add :: Expr -> Expr -> Expr;
fold_add (Num m) (Num n) = Num (plus_int m n);
fold_add (Var v) b =
  (if equal_expr b (Num Zero_int) then Var v else Add (Var v) b);
fold_add (Add v va) b =
  (if equal_expr b (Num Zero_int) then Add v va else Add (Add v va) b);
fold_add a (Var v) =
  (if equal_expr (Var v) (Num Zero_int) then a else Add a (Var v));
fold_add a (Add v va) =
  (if equal_expr (Add v va) (Num Zero_int) then a else Add a (Add v va));

cfold :: Expr -> Expr;
cfold (Num n) = Num n;
cfold (Var x) = Var x;
cfold (Add a b) = fold_add (cfold a) (cfold b);

compile :: Expr -> [Instr];
compile (Num n) = [PUSH n];
compile (Var x) = [LOAD x];
compile (Add a b) = compile a ++ compile b ++ [ADD];
```

`cfold` 和 `compile` 的等式和在 Isabelle 中一样，只是用 Haskell 的 `++` 代替了 `@`。`fold_add` 有五个等式，它们是 `fun` 从原来的两个等式推导出来的（第 14.6.2 节），而判断 `b = Num 0` 变成了对 `equal_expr` 的调用，这是代码生成器（code generator）为这个数据类型编写的相等性判断。省略的部分是模块头，以及类型 `Char` 和 `Int`，连同这些函数所需要的、作用于它们的运算，例如 `plus_int`。字符变成了一个带有八个布尔字段的数据类型，而整数由构造子 `Zero_int`、`Pos` 和 `Neg` 以及模块 8 中表示二进制数字的 `One`、`Bit0` 和 `Bit1` 构造而成。这样的表示忠实可靠，但很慢；库理论 `HOL-Library.Code_Target_Int` 能让代码改用 Haskell 自己的整数。

模块头列出了这个模块导出的东西：类型 `Char`、`Int`、`Expr` 和 `Instr`，以及函数 `cfold` 和 `compile`，但没有任何构造子。模块 12 解释过 `export_code` 为什么这样做。在这里，这意味着其他 Haskell 代码无法构造一个表达式交给 `compile`。写成 `export_code open compile cfold …` 就能导出所有东西，包括构造子。

该证明对此程序保证了什么？这些定理涉及 HOL 函数。代码生成器的设计使得生成程序的每一步都对应于使用作为定理的方程进行重写，但它不属于内核（Module 8）；它与将生成代码转换为机器码的 Haskell 编译器以及硬件和运行时环境一起属于可信基础，加上逻辑值的约定表示和任何手写目标适配（Module 12）。该定理涵盖了此语法树编译器和建模的栈机；它不验证解析器、汇编器或物理机器实现。CompCert 也使用 Rocq 到 OCaml 的提取，并记录了已验证和未验证组件的边界。

## 扩展编译器 ★★★ {#extensions}

本节是挑战内容，难度相当于 ★★★ 练习。它给语言加上减法和条件表达式，给机器加上减法和跳转。已有的大部分开发都能沿用；关于连接代码的引理却不行，而替代它的东西，是一堂关于推广的课。

在你自己的理论中，你会直接修改 `expr`、`instr` 和那些函数。在本页中，前面的定义必须保持原样，所以扩展后的版本用了新名字：类型和函数的名字以 2 结尾，原有的构造子也是如此（`Num2`、`Var2`、`Add2`、`PUSH2`、`LOAD2`、`ADD2`）；新的构造子则用普通的名字。

### 减法与条件表达式 {#extended-language}

```isabelle
datatype expr2 = Num2 int | Var2 vname | Add2 expr2 expr2
  | Sub expr2 expr2 | Cond expr2 expr2 expr2

fun eval2 :: "expr2 ⇒ state ⇒ int" where
  "eval2 (Num2 n) s = n"
| "eval2 (Var2 x) s = s x"
| "eval2 (Add2 a b) s = eval2 a s + eval2 b s"
| "eval2 (Sub a b) s = eval2 a s - eval2 b s"
| "eval2 (Cond t a b) s = (if eval2 t s ≠ 0 then eval2 a s else eval2 b s)"
```

`Sub a b` 表示 a − b。`Cond t a b` 是一个条件表达式（conditional expression），在 C 中写作 `t ? a : b`：如果条件 t 不为 0，它的值就是 a 的值，否则就是 b 的值。和在 C 中一样，0 算作假。

机器得到一条做减法的指令和两条**跳转**（jump）指令。`JMP n` 跳过接下来的 n 条指令。`JMPZ n` 从栈顶取下一个数，如果这个数是 0，就跳过接下来的 n 条指令；否则继续执行下一条指令。

```isabelle
datatype instr2 = PUSH2 int | LOAD2 vname | ADD2 | SUB | JMP nat | JMPZ nat

fun exec2 :: "instr2 list ⇒ state ⇒ stack ⇒ stack" where
  "exec2 [] s stk = stk"
| "exec2 (PUSH2 n # c) s stk = exec2 c s (n # stk)"
| "exec2 (LOAD2 x # c) s stk = exec2 c s (s x # stk)"
| "exec2 (ADD2 # c) s (j # i # stk) = exec2 c s ((i + j) # stk)"
| "exec2 (SUB # c) s (j # i # stk) = exec2 c s ((i - j) # stk)"
| "exec2 (JMP n # c) s stk = exec2 (drop n c) s stk"
| "exec2 (JMPZ n # c) s (v # stk) =
     (if v = 0 then exec2 (drop n c) s stk else exec2 c s stk)"
| "exec2 (_ # c) s stk = exec2 c s stk"
```

```output
consts
  exec2 :: "instr2 list ⇒ (char list ⇒ int) ⇒ int list ⇒ int list"

Found termination order: "(λp. length (fst p)) <*mlex*> {}"
```

`drop n c` 表示 c 去掉其前 n 个元素，因此向前跳转是对较短程序的递归调用。最后一个方程捕获了其他方程遗漏的情况，即短栈上的 `ADD2` 或 `SUB` 以及空栈上的 `JMPZ`，并跳过该指令。由于跳转仅向前进行，每个递归调用都作用于更短的列表，Isabelle 无需辅助即可找到终止序，即程序长度。若允许无限制的向后跳转，某些程序可能永远运行，因此此无燃料的递归解释器将不再满足 `fun`' 的终止要求（详见第 14.8.4 节）。

### 操作数的顺序 {#operand-order}

`SUB` 计算 i − j，其中 j 是栈顶，i 是它下面的数。所以编译器必须先压入 a，再压入 b，就像对加法那样：

```isabelle
fun compile2 :: "expr2 ⇒ instr2 list" where
  "compile2 (Num2 n) = [PUSH2 n]"
| "compile2 (Var2 x) = [LOAD2 x]"
| "compile2 (Add2 a b) = compile2 a @ compile2 b @ [ADD2]"
| "compile2 (Sub a b) = compile2 a @ compile2 b @ [SUB]"
| "compile2 (Cond t a b) =
     compile2 t @ [JMPZ (length (compile2 a) + 1)] @ compile2 a @
     [JMP (length (compile2 b))] @ compile2 b"
```

对加法来说，顺序无关紧要，因为加法满足交换律；对减法来说，顺序就要紧了。如果 `Sub` 的等式先压入 b，代码算出的就是 b − a。Quickcheck 立刻就能抓住这种对调：

```isabelle
lemma "exec2 (compile2 b @ compile2 a @ [SUB]) s stk
       = (eval2 a s - eval2 b s) # stk"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  b = Num2 0
  a = Num2 (- 1)
  s = λx. - 2
  stk = []
Evaluated terms:
  exec2 (compile2 b @ compile2 a @ [SUB]) s stk = [1]
  (eval2 a s - eval2 b s) # stk = [- 1]
```

当 a = −1、b = 0 时，a − b 的值是 −1，但对调后的代码算出的是 0 − (−1) = 1。这类错误可能在手工挑选的测试例子面前蒙混过关：只要 a 和 b 的值相同，对调后的代码给出的答案就是对的。

### 条件表达式与跳转 {#jumps}

`Cond t a b` 的代码先对条件求值，然后跳过它不需要的那段代码：

```text
t 的代码 | JMPZ k | a 的代码 | JMP m | b 的代码 |
          k = length (a 的代码) + 1     m = length (b 的代码)
```

如果条件为 0，`JMPZ k` 就跳过 a 的代码以及它后面的 `JMP`，从 b 的代码继续执行。否则，a 的代码运行，然后 `JMP m` 跳过 b 的代码。无论哪种情况，执行都会在 b 的代码之后继续，而栈上多了一个新的值。下面是两次运行，所在的状态 `s0` 中 x 是 5，z 是 0：

```isabelle
value "compile2 (Cond (Var2 ''x'') (Num2 1) (Num2 2))"
```

```output
"[LOAD2 ''x'', JMPZ 2, PUSH2 1, JMP 1, PUSH2 2]"
  :: "instr2 list"
```

```isabelle
value "(exec2 (compile2 (Cond (Var2 ''x'') (Num2 1) (Num2 2))) s0 [],
        exec2 (compile2 (Cond (Var2 ''z'') (Num2 1) (Num2 2))) s0 [])"
```

```output
"([1], [2])"
  :: "int list × int list"
```

现在来看证明。关于连接代码的引理是第 14.5 节的关键。它还成立吗？

```isabelle
lemma "exec2 (c1 @ c2) s stk = exec2 c2 s (exec2 c1 s stk)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  c1 = [JMP 1]
  c2 = [PUSH2 (- 1)]
  s = λx. - 3
  stk = []
Evaluated terms:
  exec2 (c1 @ c2) s stk = []
  exec2 c2 s (exec2 c1 s stk) = [- 1]
```

不成立了。当 c1 和 c2 作为一个程序一起运行时，c1 末尾的跳转会跳过 c2 中的指令；而当 c1 单独运行时，它没有东西可跳。运行 `c1 @ c2` 不再等于“先运行 c1，再运行 c2”。这条引理之所以对原来的机器成立，是因为那台机器的每条指令都只影响栈，从不影响接下来执行哪条指令。

出路是再做一次推广。不要在任意一点上拆分程序，而是描述 e 的代码放在**任意**后续代码 c 前面时做了什么：运行 `compile2 e @ c`，等同于先把 e 的值放到栈上，再运行 c。

```isabelle
theorem compile2_correct:
  "exec2 (compile2 e @ c) s stk = exec2 c s (eval2 e s # stk)"
  by (induction e arbitrary: c stk) auto
```

现在，归纳假设谈论的是一个子表达式的代码后面跟着任意代码的情况，而在每种情形中，这正是化简器遇到的形状。在情形 `Cond t a b` 中，t 的归纳假设用于 t 后面的那段代码，这段代码以 `JMPZ` 开头。如果条件为 0，跳转恰好落在 b 的代码的开头，后面跟着 c，于是 b 的归纳假设适用；否则 a 的归纳假设适用，而 `JMP` 恰好落在 c 的开头。除了跳到条件表达式代码的末尾之外，跳转从不离开这段代码，所以定理从来不需要说明跳到别处会发生什么。

第 14.5 节中的形式，就是后面什么也不跟的特例，即 c = []：

```isabelle
corollary "exec2 (compile2 e) s stk = eval2 e s # stk"
  using compile2_correct [of e "[]"] by simp
```

::: keyidea
当关于拆分程序的引理不成立时，就改为对上下文进行推广：陈述一段代码放在任意后续代码（continuation）前面时做了什么。这样，证明就只会涉及编译器生成的代码，而从不涉及任意的拆分。练习 14.6 就用这种形式证明了第 14.5 节的定理，没有用到 `exec_append`。
:::

### 进一步的方向 {#directions}

- **更多运算符。** 乘法增加了一个构造子、一条指令以及对应的等式。
  正确性证明遵循相同模式，并增加一个构造子情况。
- **`let`.** `let x = a in b`的一种实现添加了指令，将值存储到变量中。
  该代码同时改变状态与栈，且定理必须指明其可能更改的变量：将 a 的值存入 x 自身会破坏周围表达式可能需要的 x。
- **循环。** 通过向后跳转，程序可以无限运行。一种模型是归纳定义的
  配置上的执行关系（程序计数器、状态和栈），如 Modules 11 和 13 所示。另一个是带有燃料参数的总解释器，用于限制步数。耗尽燃料会报告达到了界限；它并不确立发散性。
- **其他机器。**练习 14.7 让机器在栈下溢时停止，练习 14.8 则编译到一台带寄存器的机器上。

## 回顾与展望 {#outlook}

本模块几乎用到了本系列的每一个部分。下面是每一块内容的来源。

| 模块 | 它提供了什么 | 在本模块中用在哪里 |
|---|---|---|
| 1 | `value`、`lemma`、Quickcheck；可信基中的编译器 | 测试，第 14.1 节 |
| 2–3 | 逻辑；引理中的自由变元是全称量化的 | “对每个 e、s 和 stk” |
| 4 | 函数 | 状态，一个从名字到值的函数 |
| 5 | 递归与结构归纳法 | `eval`、`exec`、`compile`，以及每一个证明 |
| 6–7 | 证明规则、`rule`、图式变量 | 带 `?stk` 的 `rule Add.IH(2)` |
| 8 | `datatype`、`fun`、列表、`export_code` | 语言、机器、导出 |
| 9 | 化简规则（simp rule）、`simp only`、Quickcheck | `exec_append [simp]`、测试 |
| 10 | Isar：情形与计算推理 | `compile_correct` 的证明 |
| 11 | `arbitrary:`、辅助引理、计算归纳 | 栈、`exec_append`、`fold_add.induct` |
| 12 | 规约与实现的对照 | 以 `eval` 对照 `compile` 和 `exec` |
| 13 | 状态机（state machine） | 栈机本身 |

在模块 2 中，你用真值表（truth table）来判定公式，办法是检查有限多种情况。真值表处理不了关于每一个表达式的陈述：表达式有无穷多个。证明却可以。一路走来，你学会了用逻辑写出这样的陈述，在纸上用规则证明它们，并让 Isabelle 检查每一步。这个编译器很小，但它的证明具备了 CompCert 和 seL4 背后那些证明的要素：每种语言的语义，对“正确”含义的精确陈述，沿着程序结构进行的归纳，以及通过阅读证明停下之处的目标而找到的引理。

接下来可以去哪里：

- Tobias Nipkow 和 Gerwin Klein 合著的 ***[Concrete Semantics](https://concrete-semantics.org/)***（Springer，
  2014 年）接着讲本模块之后的内容。第一部分是 Isabelle 教程。第二部分定义了带赋值和循环的小型命令式语言 IMP，并在 Isabelle 中研究其语义、编译器、类型系统、霍尔逻辑和程序分析。
- **[形式化证明档案库](https://www.isa-afp.org)**（Archive of Formal Proofs）收录了数百个经过检查的 Isabelle 项目，其中有经过验证的编译器、算法和数据结构；从中可以看到专家们怎样组织大型证明。
- **seL4**和**CompCert**（模块 1）展示了这些方法在工业规模上的应用；它们的论文说明了证明了什么、信任了什么，以及这些证明付出了多大的代价。
- 本系列的应用项目 **[Isabelle 模型验证](model-verification/index.html)**（英文）用一个盖子模型讲解操作、不变式和表示之间的转换。项目证明这种转换保持含义，这与 `compile_correct` 属于同一类定理。项目使用 Isabelle2025-2。

模块 1 的第一个理论以三件事收尾：用 `value` 计算，用 `lemma` 证明，用 Quickcheck 反驳。在本模块中，你把这三件事都用在了一个真正的软件上，也就是一个编译器；而你得到的，是一个关于它将来要编译的每一个程序的定理。

## 小结 {#summary}

- 此处编译器正确性是两条语义函数之间的等式：`eval` 用于表达式，`exec` 用于栈
  机器。该陈述是等式 `exec (compile e) s stk = eval e s # stk`。
- 抽象语法是一个数据类型；组合式的语义是它上面的一个递归函数。**状态**把变量名映射到值；`f(a := v)` 更新一个函数。
- **栈机**从栈顶取出它的操作数。编译器按后缀顺序生成代码：先是操作数的代码，然后是运算符。
- 测试先行。`value` 比较示例上的求值与执行；Quickcheck 搜索有界情况
  对于反例，不保证找到最小的一个或发现所有错误。当声明的变量中包含函数时，使用 `quickcheck [size = n]` 限制搜索范围。
- 证明需要模块 11 中的两个思想：从卡住的目标中找到的辅助引理 `exec_append`，以及用 `arbitrary: stk` 实现的**对栈的推广**，因为第二个操作数的代码运行在一个存放着第一个操作数的值的栈上。
- **常量折叠**的正确性用结构归纳法证明，其中用到一条用计算归纳证明的、关于 `fold_add` 的引理。关于各遍的定理可以组合，所以“先优化再编译”的正确性只需一行证明。
- `export_code` 把经过验证的函数变成 Haskell 代码；代码生成器和 Haskell 编译器仍然留在可信基中。
- 有了跳转，关于连接代码的引理就不成立了；对后面的代码进行推广，即 `exec2 (compile2 e @ c) s stk = exec2 c s (eval2 e s # stk)`，就能修复证明。

## 练习 {#exercises}

:::: exercise 手工运行机器 {#ex-14-1} ★
手工编译表达式 `(x + 1) + y`，也就是 `Add (Add (Var ''x'') (Num 1)) (Var ''y'')`。然后写出代码在状态 `s0`（x = 5，y = 7）中从空栈开始运行时，每条指令执行之后的栈。栈上最多同时有几个数？与图 14.2 中的程序比较一下，并用 `value` 检查你的答案。

::: solution
代码依次是 `x + 1` 的代码、y 的代码和 `ADD`：

```isabelle
value "compile (Add (Add (Var ''x'') (Num 1)) (Var ''y''))"
```

```output
"[LOAD ''x'', PUSH 1, ADD, LOAD ''y'', ADD]"
  :: "instr list"
```

五条指令执行之后的栈依次是 `[5]`、`[1, 5]`、`[6]`、`[7, 6]` 和 `[13]`：

```isabelle
value "exec (compile (Add (Add (Var ''x'') (Num 1)) (Var ''y''))) s0 []"
```

```output
"[13]"
  :: "int list"
```

栈上最多有两个数。图 14.2 中 `x + (2 + y)` 的代码需要三个，因为它外层加法的第二个操作数本身就是一个加法，而这个加法的操作数要放在 x 的值的上面。当嵌套在左边时，每个部分和都会在下一个操作数被压入之前算完。
:::
::::

:::: exercise 哪些断言成立？ {#ex-14-2} ★
判断下面每个断言是否对每个 e、s 和 stk 都成立。用 Quickcheck 测试每一个，并用 `simp` 和第 14.5 节的定理证明成立的那些。

1. `exec (compile e) s stk = [eval e s]`
2. `length (exec (compile e) s stk) = length stk + 1`
3. `exec (compile e @ compile e) s stk = eval e s # eval e s # stk`

::: solution
1. **不成立**，第 14.4.3 节已经说明了这一点：当 stk 不为空时，它的数会留在那个值的下面。
2. **成立**：代码恰好压入一个数。

   ```isabelle
   lemma "length (exec (compile e) s stk) = length stk + 1"
     by (simp add: compile_correct)
   ```

3. **成立**：由 `exec_append`，代码的第二份副本在第一份副本留下的栈上运行。

   ```isabelle
   lemma "exec (compile e @ compile e) s stk = eval e s # eval e s # stk"
     by (simp add: compile_correct)
   ```
:::
::::

:::: exercise 优化后的代码不会更长 {#ex-14-3} ★★
证明常量折叠从不会使代码变长：`length (compile (cfold e)) ≤ length (compile e)`。先像 `eval_fold_add` 那样，用计算归纳证明一条关于 `fold_add` 的辅助引理，再对 e 做归纳来证明这个定理；愿意的话，可以用 Isar 来写。

::: solution
`fold_add a b` 的代码从不会比“a 的代码，然后 b 的代码，再加一条 `ADD`”更长：

```isabelle
lemma length_fold_add:
  "length (compile (fold_add a b))
   ≤ length (compile a) + length (compile b) + 1"
  by (induction a b rule: fold_add.induct) auto
```

在情形 `Add a b` 中，这条引理作用于 `cfold a` 和 `cfold b`，而归纳假设给出了它们的代码长度的上界：

```isabelle
theorem cfold_shorter:
  "length (compile (cfold e)) ≤ length (compile e)"
proof (induction e)
  case (Add a b)
  have "length (compile (cfold (Add a b)))
        ≤ length (compile (cfold a)) + length (compile (cfold b)) + 1"
    using length_fold_add by simp
  also have "… ≤ length (compile (Add a b))"
    using Add.IH by simp
  finally show ?case .
qed simp_all
```

`qed simp_all` 通过 `simp` 证明了 `Num` 和 `Var` 两种情况，Isar 文本未提及这些情况。该结果对指令计数进行界定，而非编译时间、运行时间或整数值所使用的内存。
:::
::::

:::: exercise 一项错误的优化 {#ex-14-4} ★★
一位同事建议写一个更短的 `fold_add`，它会去掉加在右边的每一个数：

```isabelle
fun fold_add_bad :: "expr ⇒ expr ⇒ expr" where
  "fold_add_bad (Num m) (Num n) = Num (m + n)"
| "fold_add_bad a (Num n) = a"
| "fold_add_bad a b = Add a b"
```

1. 用 Quickcheck 说明它是错的，并解释反例。
2. 写出 `fold_add0`：它是 `fold_add` 的一个正确版本，并且还会去掉在**左边**加 0 的加法；证明它保持值不变。

::: solution
1. Quickcheck 找到了一个会丢掉一个数的表达式：

   ```isabelle
   lemma "eval (fold_add_bad a b) s = eval a s + eval b s"
     quickcheck
     oops
   ```

   ```output result
   Testing conjecture with Quickcheck-exhaustive...

   Quickcheck found a counterexample:
     a = Var []
     b = Num (- 1)
     s = λx. - 2
   Evaluated terms:
     eval (fold_add_bad a b) s = - 2
     eval a s + eval b s = - 3
   ```

   Quickcheck 给出的 a 是名字为空字符串的变量，它被打印成 `[]`，因为字符串是字符的列表。它在 s 中的值是 −2，而 `fold_add_bad` 丢掉了加在它上面的 −1。第二个等式只对 `Num 0` 才是对的：右边的任何其他数都会丢失。
2. 检查两边是否为 0；证明和 `fold_add` 的一样：

   ```isabelle
   fun fold_add0 :: "expr ⇒ expr ⇒ expr" where
     "fold_add0 (Num m) (Num n) = Num (m + n)"
   | "fold_add0 a b =
        (if a = Num 0 then b else if b = Num 0 then a else Add a b)"

   lemma "eval (fold_add0 a b) s = eval a s + eval b s"
     by (induction a b rule: fold_add0.induct) auto
   ```
:::
::::

:::: exercise 代入 {#ex-14-5} ★★
定义 `subst :: "vname ⇒ int ⇒ expr ⇒ expr"`，使得 `subst x n e` 把 e 中变量 x 的每一次出现都替换成数 n。用 `value` 检查它，然后证明

`eval (subst x n e) s = eval e (s(x := n))`

用文字来说：把 x = n 代入（substitute）e 后得到的值，就是 e 在 x 为 n 的状态中的值。当编译器把一个值已知的变量替换成这个值时，用的就是这个事实。

::: solution
```isabelle
fun subst :: "vname ⇒ int ⇒ expr ⇒ expr" where
  "subst x n (Num m) = Num m"
| "subst x n (Var y) = (if y = x then Num n else Var y)"
| "subst x n (Add a b) = Add (subst x n a) (subst x n b)"

value "subst ''x'' 3 (Add (Var ''x'') (Add (Var ''y'') (Var ''x'')))"
```

```output
"Add (Num 3) (Add (Var ''y'') (Num 3))"
  :: "expr"
```

```isabelle
lemma eval_subst: "eval (subst x n e) s = eval e (s(x := n))"
  by (induction e) auto
```

在情形 `Var y` 中，化简器会拆开 `if`：如果 y = x，两边都是 n；否则两边都是 `s y`。没有哪个变量需要是任意的，因为 x、n 和 s 在递归调用中都保持不变。
:::
::::

:::: exercise 不用连接引理的正确性证明 {#ex-14-6} ★★★
第 14.8 节用一种带有后续代码 c（也就是跟在后面的代码）的形式，证明了扩展后的编译器是正确的。用同样的形式为原来的编译器证明这个定理：

`exec (compile e @ c) s stk = exec c s (eval e s # stk)`，

要求对 e 做归纳，并且**不**使用 `exec_append`。然后由它推出 `exec (compile e) s stk = eval e s # stk`。哪些变量必须是任意的？为什么？

::: solution
c 和 stk 都必须是任意的：在情形 `Add a b` 中，a 的归纳假设用于后续代码 `compile b @ ADD # c`，b 的归纳假设用于栈 `eval a s # stk`。`exec_append` 是一条化简规则，所以即使你不要求，`auto` 也会使用它。用 `simp del:` 把它去掉（模块 9），证明才真正没有用到它：

```isabelle
lemma compile_cont:
  "exec (compile e @ c) s stk = exec c s (eval e s # stk)"
  by (induction e arbitrary: c stk) (auto simp del: exec_append)
```

在情形 `Add a b` 中，化简器把 `(compile a @ compile b @ [ADD]) @ c` 重新结合成 `compile a @ (compile b @ ADD # c)`，然后应用两个归纳假设，以及 `exec` 关于 `ADD` 的等式。原来的定理是 c = [] 时的实例：

```isabelle
lemma "exec (compile e) s stk = eval e s # stk"
  using compile_cont [of e "[]"] by simp
```

这种形式不需要关于任意拆分程序的引理，这就是它在有跳转时仍然适用的原因。
:::
::::

:::: exercise 一台会出错的机器 {#ex-14-7} ★★★
对报告栈下溢的栈机进行建模，使用选项类型（Module 8）：`exec1_opt` 在 `ADD` 发现少于两个数字时返回 `None`，且 `exec_opt` 在遇到第一个 `None` 时停止。定义两者，通过 `value` 检查 `[PUSH 1, ADD]` 在空栈上失败，并证明编译后的代码永远不会失败：

`exec_opt (compile e) s stk = Some (eval e s # stk)`。

提示：先证明练习 14.6 中那种带后续代码的形式。

::: solution
```isabelle
fun exec1_opt :: "instr ⇒ state ⇒ stack ⇒ stack option" where
  "exec1_opt (PUSH n) s stk = Some (n # stk)"
| "exec1_opt (LOAD x) s stk = Some (s x # stk)"
| "exec1_opt ADD s (j # i # stk) = Some ((i + j) # stk)"
| "exec1_opt ADD s stk = None"

fun exec_opt :: "instr list ⇒ state ⇒ stack ⇒ stack option" where
  "exec_opt [] s stk = Some stk"
| "exec_opt (i # c) s stk =
     (case exec1_opt i s stk of
        None ⇒ None
      | Some stk' ⇒ exec_opt c s stk')"

value "(exec_opt [PUSH 1, ADD] s0 [], exec_opt (compile sample) s0 [])"
```

```output
"(None, Some [14])"
  :: "int list option × int list option"
```

有了后续代码，证明就和练习 14.6 中一样。在情形 `Add a b` 中，化简器遇到 `exec1_opt ADD s (eval b s # eval a s # stk)`，它等于 `Some …`，所以 `case` 就消失了：

```isabelle
lemma exec_opt_cont:
  "exec_opt (compile e @ c) s stk = exec_opt c s (eval e s # stk)"
  by (induction e arbitrary: c stk) auto

theorem exec_opt_compile:
  "exec_opt (compile e) s stk = Some (eval e s # stk)"
  using exec_opt_cont [of e "[]"] by simp
```

这个定理比 `compile_correct` 更强：它还说明，编译出的代码在任何栈上都不会发生下溢。
:::
::::

:::: exercise 一台寄存器机 {#ex-14-8} ★★★
寄存器机（register machine）没有栈，而是有一些编了号的寄存器，用一个函数 `nat ⇒ int` 来建模；它的指令会写明自己使用哪些寄存器：

```isabelle
datatype rinstr = LDI nat int | LDV nat vname | ADDR nat nat

type_synonym regs = "nat ⇒ int"
```

`LDI r n` 把数 n 装入寄存器 r，`LDV r x` 把变量 x 的值装入寄存器 r，`ADDR r q` 把寄存器 q 的值加到寄存器 r 上。仿照 `exec1` 和 `exec` 定义 `rexec1` 和 `rexec`，再定义一个编译器 `rcompile :: "expr ⇒ nat ⇒ rinstr list"`，使得 `rcompile e r` 把 e 的值留在寄存器 r 中，并且只把寄存器 r、r + 1、r + 2 等用作临时存储空间。证明它是正确的：值最后放在寄存器 r 中，而编号小于 r 的寄存器保持原来的内容。

::: solution
```isabelle
fun rexec1 :: "rinstr ⇒ state ⇒ regs ⇒ regs" where
  "rexec1 (LDI r n) s rs = rs(r := n)"
| "rexec1 (LDV r x) s rs = rs(r := s x)"
| "rexec1 (ADDR r q) s rs = rs(r := rs r + rs q)"

fun rexec :: "rinstr list ⇒ state ⇒ regs ⇒ regs" where
  "rexec [] s rs = rs"
| "rexec (i # c) s rs = rexec c s (rexec1 i s rs)"

lemma rexec_append [simp]:
  "rexec (c1 @ c2) s rs = rexec c2 s (rexec c1 s rs)"
  by (induction c1 arbitrary: rs) auto

fun rcompile :: "expr ⇒ nat ⇒ rinstr list" where
  "rcompile (Num n) r = [LDI r n]"
| "rcompile (Var x) r = [LDV r x]"
| "rcompile (Add a b) r =
     rcompile a r @ rcompile b (r + 1) @ [ADDR r (r + 1)]"

value "rcompile sample 0"
```

```output
"[LDV 0 ''x'', LDI 1 2, LDV 2 ''y'', ADDR 1 2, ADDR 0 1]"
  :: "rinstr list"
```

寄存器编号扮演了栈高度的角色：b 的代码在高一号的寄存器上工作，这样它就不会覆盖寄存器 r 中 a 的值。断言必须同时说出这两件事，因为情形 `Add` 需要从归纳假设中得到这两者：b 的代码运行之后，a 的值之所以还在寄存器 r 中，只是因为这段代码不去动编号小于 r + 1 的寄存器。r 和寄存器的内容在递归调用之间都会改变，所以两者都是任意的：

```isabelle
theorem rcompile_correct:
  "rexec (rcompile e r) s rs r = eval e s ∧
   (∀q < r. rexec (rcompile e r) s rs q = rs q)"
  by (induction e arbitrary: r rs) auto
```

如果只证明前一半，归纳就会卡住：

```isabelle
lemma "rexec (rcompile e r) s rs r = eval e s"
  apply (induction e arbitrary: r rs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀e1 e2 r rs.
       ⟦⋀r rs. rexec (rcompile e1 r) s rs r = eval e1 s;
        ⋀r rs. rexec (rcompile e2 r) s rs r = eval e2 s⟧
       ⟹ rexec (rcompile e2 (Suc r)) s (rexec (rcompile e1 r) s rs) r =
          eval e1 s
```

剩下的目标问的是：为寄存器 r + 1（写作 `Suc r`）编译的 e2 的代码，是否不去动寄存器 r。较弱的断言的归纳假设对其他寄存器什么也没说，所以必须像模块 11 中那样加强断言。

```isabelle
  oops
```

麦卡锡和佩因特在 1967 年的证明（第 14.1 节）针对的正是这类机器：它有一个累加器和若干寄存器，而不是一个栈。
:::
::::

## 自测题 {#quiz}

```quiz
? 定理 `compile_correct` 说的是什么？
- [ ] 编译器对每个表达式都会终止
- [x] 对每个表达式、状态和栈，运行编译出的代码都会把表达式的值放到栈顶，并保持栈的其余部分不变
- [ ] 在空栈上运行编译出的代码，会得到一个只有一个元素的栈
- [ ] `eval` 和 `exec` 是同一个函数
> 这个陈述是：对所有的 e、s 和 stk，`exec (compile e) s stk = eval e s # stk`。关于空栈的版本只是一个特例。

? 为什么 `compile_correct` 的证明需要 `arbitrary: stk`？
- [ ] 因为 `eval` 在递归调用中会改变状态
- [ ] 因为 `stk` 是一个列表
- [ ] 因为断言对空栈不成立
- [x] 因为在情形 `Add a b` 中，b 的归纳假设需要用于栈 `eval a s # stk`，而不是 stk
> b 的代码在 a 的值的上面运行。没有 `arbitrary`，归纳假设就只谈论那个固定的 stk。

? `compile (Add (Num 1) (Var ''x''))` 是什么？
- [ ] `[ADD, PUSH 1, LOAD ''x'']`
- [ ] `[PUSH 1, ADD, LOAD ''x'']`
- [x] `[PUSH 1, LOAD ''x'', ADD]`
- [ ] `[LOAD ''x'', PUSH 1, ADD]`
> 后缀顺序：先是左操作数的代码，然后是右操作数的代码，最后是运算符。

? `quickcheck [size = 3]` 没有为一个断言找到反例。你能得出什么结论？
- [x] 这个断言对 Quickcheck 试过的、大小不超过 3 的值成立；它仍然可能是错的
- [ ] 这个断言是一个定理
- [ ] 这个断言对某个大于 3 的值不成立
- [ ] Quickcheck 超时了
> 测试是证据，而不是证明。只有证明才能覆盖每一个表达式。

? 对于带跳转的机器，引理 `exec2 (c1 @ c2) s stk = exec2 c2 s (exec2 c1 s stk)` 不成立。为什么？
- [ ] 因为 `SUB` 不满足交换律
- [x] 因为当两者作为一个程序运行时，c1 中的跳转可能会跳过 c2 的指令
- [ ] 因为 `exec2` 不会终止
- [ ] 因为 `drop` 对长列表没有定义
> 单独运行 c1 时，它末尾的跳转什么也跳不过。修复的办法是：针对后面跟着任意后续代码 c 的编译代码来陈述正确性。

? 当运行从 `compile` 导出的 Haskell 代码时，哪些额外的软件组件被信任？
- [ ] `compile_correct` 的证明
- [ ] 证明了那些引理的化简器
- [ ] Quickcheck
- [x] Isabelle 的代码生成器和 Haskell 编译器
> 除了推理内核和运行时/硬件假设外，执行还依赖于代码生成器和 Haskell 编译器。它们的翻译不在内核的证明检查范围内。
```
