---
title: HOL 中的函数式编程
part: 3
lead: 把 Isabelle/HOL 当作一门带类型的函数式编程语言来使用。你将定义自己的数据类型和函数并用它们进行计算，读懂 Isabelle 打印出的类型和消息，弄清为什么每个函数都必须终止，并把你的定义转换成 Haskell 代码。
minutes: 210
needs: 模块 1–7
goals:
  - 读写 HOL 的类型和项，并用 `typ`、`term` 和 `value` 查看它们
  - 使用 λ 抽象、柯里化和部分应用
  - 定义数据类型，并用 `definition`、`fun` 和 `primrec` 定义其上的函数
  - 用列表和数进行计算，并用类型类解释重载的记号
  - 解释为什么每个函数都必须终止，读懂 Isabelle 关于终止性的消息，并在 Isabelle 找不到度量时自己提供一个
  - 用 `export_code` 从你的定义生成 Haskell 代码
imports: Main
---

## 逻辑中的程序 {#hol}

在第二部分中，你用 Isabelle 检查了关于公式的证明。第三部分转向 Isabelle/HOL 的另一面：它也是一门编程语言。HOL 包含一门小巧的、带类型的**函数式编程语言**（functional programming language），与 Haskell、OCaml 和 Standard ML（Isabelle 自身的核心就是用它写的）很接近。你用等式编写程序，由 Isabelle 运行它们；又因为程序是逻辑的一部分，你还可以证明关于它们的事实。模块 9 到模块 11 讲证明，本模块讲编程。

HOL 中的程序与 Python、Java 或 C 中的程序有三点不同。

- **没有副作用**（side effect）。HOL 函数不会修改变量，不会打印输出，也不会读文件。给定相同的参数，它总是返回相同的结果，就像数学中的函数一样。
- **没有循环**。重复要靠递归（recursion）来完成，就像模块 5 中那样。
- **每个函数都是全函数**（total）。对于参数类型中的每一个值，它都返回一个结果。第 8.7 节会解释逻辑为什么坚持这一点。

本模块一步一步地构建一个例子：一个英国交通灯的控制器。这种交通灯先亮红灯，接着红灯和黄灯一起亮，然后亮绿灯，再亮黄灯，最后又回到红灯。你将把它的状态描述为一个数据类型（datatype），用列表和数计算它的状态序列以及各个状态持续的时间，检查一个路口的安全规则，最后为它生成 Haskell 代码。一路上，你会遇到初学者常犯的错误，并看到 Isabelle 给出的真实消息。

像模块 1 中那样，为本模块新建一个理论（例如在文件 `Traffic.thy` 中写 `theory Traffic`），一边阅读，一边把各个代码块输入进去。

### 类型 {#types}

HOL 中的每个项都有一个**类型**（type），Isabelle 在做任何其他事情之前都会先检查类型。类型能排除把数加到列表上之类的无意义的东西：无法赋予类型的项会立即被拒绝。

| 类型 | 它的值 | 例子 |
|---|---|---|
| `bool` | 真值 | `True`、`False` |
| `nat` | 自然数 0、1、2…… | `0`、`Suc 0`、`42` |
| `int` | 整数……、−1、0、1…… | `-3`、`7` |
| `'a list` | 元素类型为 `'a` 的有限列表 | `[]`、`[1, 2, 3]` |
| `'a × 'b` | 由一个 `'a` 和一个 `'b` 组成的有序对 | `(3, True)` |
| `'a option` | 没有值，或者一个类型为 `'a` 的值 | `None`、`Some 5` |
| `'a ⇒ 'b` | 从 `'a` 到 `'b` 的函数 | `Suc`、`rev` |

::: definition HOL 中的类型
像 `bool`、`nat` 或 `int` 这样的**基本类型**（base type）就是一个名字。像 `list` 或 `option` 这样的**类型构造子**（type constructor）由其他类型构造出新的类型，它写在参数的**后面**：`nat list` 是自然数列表的类型，`nat list list` 是由这种列表组成的列表的类型。`'a × 'b` 是有序对的类型，`'a ⇒ 'b` 是函数的类型。**类型变量**（type variable）`'a`、`'b`……代表任意类型；如果一个函数的类型中含有类型变量，例如 `rev :: 'a list ⇒ 'a list`，那么它对这个类型的每个实例都适用，这样的函数称为**多态的**（polymorphic）。
:::

`t :: τ` 读作“t 的类型是 τ”。函数箭头 ⇒ 用 `=>` 输入，乘积符号 × 用 `<*>` 输入（也可以直接写 `*` 来代替 ×）。箭头的优先级比任何类型构造子都低，所以 `nat ⇒ bool list` 的意思是 `nat ⇒ (bool list)`。

命令 `typ` 检查一个类型是否合法，并把它打印出来：

```isabelle
typ "nat × bool"
typ "nat ⇒ bool list"
typ "(nat ⇒ bool) list"
```

```output all
"nat × bool"

"nat ⇒ bool list"

"(nat ⇒ bool) list"
```

Isabelle 打印类型时会尽量少用括号。第二个类型不需要括号，因为 ⇒ 的优先级最低；第三个类型需要括号，因为它是由函数组成的列表，而不是一个返回列表的函数。

### 项与类型推断 {#terms}

**项**（term）是 HOL 的表达式：可以是常量，例如 `True`、`0` 或 `rev`；可以是变量，例如 `x`；可以是作用于参数的函数，例如 `rev xs`；也可以是本模块将要介绍的其他形式之一。命令 `term` 读入一个项，算出它的类型，并把两者都打印出来，但不做任何求值：

```isabelle
term "Suc 0"
term "[Suc 0, 5]"
term "(Suc 0, [True])"
```

```output all
"Suc 0"
  :: "nat"

"[Suc 0, 5]"
  :: "nat list"

"(Suc 0, [True])"
  :: "nat × bool list"
```

你从来没有说过 `5` 是自然数，这是 Isabelle 自己推算出来的：一个列表的所有元素都具有同一个类型，`Suc 0` 是一个 `nat`，所以 `5` 也必须是 `nat`。在最后一个项中，有序对的左边是一个 `nat`，右边是一个 `bool list`，所以它的类型是 `nat × bool list`。

::: definition 类型推断与类型标注
**类型推断**（type inference）根据项中各个常量的类型，算出项的每一部分的类型。凡是常量没有确定类型的地方，结果中就含有类型变量。**类型标注**（type annotation）`t :: τ`（在更大的项中写作 `(t::τ)`）告诉 Isabelle：`t` 的类型是 τ。
:::

在下面这个项中，常量没有确定类型：

```isabelle
term "x + 1"
```

```output
"x + 1"
  :: "'a"
```

变量 `x` 和数 `1` 可以是自然数、整数或实数：它们都有 `+` 和 `1`。Isabelle 的回答是类型变量 `'a`，意思是“某个类型”。加一个标注就能确定下来：

```isabelle
term "x + (1::nat)"
```

```output
"x + 1"
  :: "nat"
```

由于 `+` 的两个参数类型相同，现在 `x` 也是 `nat` 了。第 8.6 节会解释 Isabelle 对 `x + 1` 中的 `'a` 知道些什么。

`x` 是一个**自由变元**（free variable）：一个不是常量的名字。Isabelle/jEdit 用蓝色显示自由变元，用黑色显示 `Suc` 这样的常量。

### 用 value 计算 {#value}

和模块 1 中一样，`value` 对一个项求值，并打印结果及其类型。它也能处理自由变元，把它们当作未知的值：

```isabelle
value "rev [a, b, c]"
```

```output
"[c, b, a]"
  :: "'a list"
```

Isabelle 把一个它一无所知的三元素列表反转了过来。要用符号输入测试一个函数，这很有用。

::: pitfall
拼错的名字也是自由变元。Isabelle 中没有名为 `lenght` 的常量，所以它在这里把 `lenght` 当作一个未知的函数，把项原封不动地交还给你，类型也是未知的：

```isabelle
value "lenght [1, 2::nat]"
```

```output
"lenght [1, 2]"
  :: "'a"
```

这里没有任何错误消息。如果 `value` 把你的项原样返回，而类型是 `'a` 这样的类型变量，就找一找有没有拼错的名字：Isabelle/jEdit 会像显示其他变量一样，用蓝色显示它。
:::

### 类型对不上时 {#type-errors}

无法确定类型的项会被拒绝，并附带一条消息。`Suc` 接受一个自然数，而 `True` 不是自然数：

```isabelle fails
value "Suc True"
```

```output
*** Type unification failed: Clash of types "bool" and "nat"
***
*** Type error in application: incompatible operand type
***
*** Operator:  Suc :: nat ⇒ nat
*** Operand:   True :: bool
***
```

从上往下读这条消息：

- **Type unification failed**（类型合一失败）。要确定 `f a`（把 `f` 应用于 `a`）的类型，Isabelle 必须使 `f` 的参数类型与 `a` 的类型相等。寻找使两个类型相等的类型，称为**类型合一**（type unification）：它和模块 7 中公式的合一（unification）是同一个思想，只是用在了类型上。在这里，类型合一失败了。
- **Clash of types "bool" and "nat"**（类型“bool”和“nat”冲突）指出了无法变得相等的两个类型。
- **Operator**（运算符）是函数 `Suc :: nat ⇒ nat`；**Operand**（操作数）是参数 `True :: bool`。

给函数太多的参数，会得到另一条消息。`rev` 只接受一个列表：

```isabelle fails
value "rev [1, 2::nat] [3]"
```

```output
*** Type unification failed: Clash of types "_ ⇒ _" and "_ list"
***
*** Type error in application: operator not of function type
***
*** Operator:  rev [1, 2] :: nat list
*** Operand:   [3::??'a] :: ??'a list
***
```

Isabelle 把 `rev [1, 2] [3]` 读作把列表 `rev [1, 2]` 应用于 `[3]`。列表不是函数，所以**运算符** `rev [1, 2]` 是“not of function type”（不是函数类型）。在冲突的两个类型中，`_ ⇒ _` 代表“某个函数类型”，`_ list` 代表“某个列表类型”。`[3]` 的类型 `??'a` 是 Isabelle 在处理这个项时临时引入的一个类型变量，它始终不需要被确定下来。

## 函数也是值 {#functions}

在 HOL 中，函数和数、列表一样是值。你可以把函数传给另一个函数，把它作为结果返回，也可以把它放在列表里。本节说明怎样写出不需要名字的函数，以及多参数函数是怎样工作的。

### λ 抽象 {#lambda}

要写一个函数而不给它起名字，就使用 **λ 抽象**（λ-abstraction）：`λx. x + 1` 是把 `x` 映射为 `x + 1` 的函数，读作“lambda x，x 加 1”。λ 用 `%` 或 `\lambda` 输入。

::: definition λ 抽象与函数应用
设 `t` 是一个类型为 τ₂ 的项，其中可以出现类型为 τ₁ 的变量 `x`，那么 `λx. t` 就是类型为 τ₁ ⇒ τ₂ 的函数，它把每个值 `x` 映射为 `t`。把函数 `f` 应用于参数 `a`，称为**函数应用**（application），写作 `f a`，不用括号，也不用逗号。把 `λx. t` 应用于 `a`，得到的是把 `t` 中的 `x` 换成 `a` 的结果；这一步称为 **β 归约**（β-reduction）。
:::

```isabelle
term "λx::nat. x + 1"
```

```output
"λx. x + 1"
  :: "nat ⇒ nat"
```

λ 后面的标注 `x::nat` 确定了约束变元（bound variable）的类型，所以这个函数的类型是 `nat ⇒ nat`。现在把一个函数应用于一个参数：

```isabelle
value "(λx::nat. x * x) 7"
```

```output
"49"
  :: "nat"
```

`term` 和 `value` 的区别在这里也看得出来。`term` 显示的是做完 β 归约这一步之后的项，但它不做算术运算：

```isabelle
term "(λx::nat. x * x) 7"
```

```output
"7 * 7"
  :: "nat"
```

### 多参数函数 {#currying}

HOL 中的每个函数都恰好接受一个参数。一个以两个数为参数的函数，先接受第一个数，然后返回一个等待第二个数的函数。它的类型是 `nat ⇒ nat ⇒ nat`，意思是 `nat ⇒ (nat ⇒ nat)`，因为 ⇒ 向右结合。函数应用则向左结合：`f x y` 的意思是 `(f x) y`。图 8.1 展示了这两个步骤。

::: figure id=fig-08-1
有两个参数的函数一次接受一个参数。把 `(+)` 应用于 3，得到一个函数 `(+) 3`，它把自己的参数加上 3；再把这个函数应用于 4，就得到数 7。
:::

::: definition 柯里化与部分应用
把一个多参数函数写成这样的形式：它接受第一个参数，并返回一个接受其余参数的函数。这种写法称为**柯里化**（currying），得名于逻辑学家哈斯凯尔·柯里（Haskell Curry）。把这样的函数应用于比它所能接受的个数更少的参数，称为**部分应用**（partial application），结果是一个函数。
:::

中缀的 `+` 是一个名为 `(+)` 的柯里化函数的记号：`x + y` 是 `(+) x y` 的简写。用 λ 写一个有两个参数的函数时，就能看到这一点：

```isabelle
term "λx y. x + (y::nat)"
```

```output
"(+)"
  :: "nat ⇒ nat ⇒ nat"
```

Isabelle 打印的是 `(+)`，而不是你写的 λ 项。两者是同一个函数：`λx y. x + y` 接受 `x` 和 `y` 并把它们相加，这正是 `(+)` 所做的事，而 Isabelle 打印的是较短的形式。`(+)` 的部分应用是一个单参数函数：

```isabelle
term "(+) (3::nat)"
```

```output
"(+) 3"
  :: "nat ⇒ nat"
```

以函数为参数的函数称为**高阶**（higher-order）函数。最常用的高阶函数是 `map`，它把一个函数应用到列表的每个元素上：

```isabelle
term "map"
```

```output
"map"
  :: "('a ⇒ 'b) ⇒ 'a list ⇒ 'b list"
```

类型说明了一切：`map` 接受一个从 `'a` 到 `'b` 的函数和一个元素类型为 `'a` 的列表，返回一个元素类型为 `'b` 的列表。把上面的部分应用交给它：

```isabelle
value "map ((+) (3::nat)) [1, 2, 3]"
```

```output
"[4, 5, 6]"
  :: "nat list"
```

HOL 之所以叫做**高阶**逻辑（higher-order logic），也是出于同样的原因：它的变元也可以代表函数，它的量词也可以取遍函数。

::: note
以两个数为参数的函数也可以写成有序对上的函数，类型为 `nat × nat ⇒ nat`。它只接受一个参数，即一个有序对。Isabelle 的库几乎总是改用柯里化的形式，因为柯里化的形式允许部分应用，例如 `map ((+) 3)`。
:::

::: pitfall
函数应用向左结合，所以 `Suc Suc 0` 的意思是 `(Suc Suc) 0`：把 `Suc` 应用于函数 `Suc`。

```isabelle fails
value "Suc Suc 0"
```

```output
*** Type unification failed: Clash of types "_ ⇒ _" and "nat"
***
*** Type error in application: incompatible operand type
***
*** Operator:  Suc :: nat ⇒ nat
*** Operand:   Suc :: nat ⇒ nat
***
```

在需要一个 `nat` 的地方，`Suc` 的操作数却是函数 `Suc :: nat ⇒ nat`。应该写成 `Suc (Suc 0)`。漏写括号是类型错误最常见的原因。
:::

## 数据类型 {#datatypes}

现在来看交通灯。在任何时刻，它都处于四种状态之一。HOL 允许你定义一个新类型，它的值恰好就是这些状态。

### 枚举类型 {#enumerations}

```isabelle
datatype light = Red | RedAmber | Green | Amber
```

这条命令引入了类型 `light`（灯）和四个**构造子**（constructor）`Red`、`RedAmber`、`Green` 和 `Amber`，它们就是这个类型的值：`Red` 是只亮红灯，`RedAmber` 是红灯和黄灯同时亮，`Green` 是绿灯，`Amber` 是黄灯（英国英语把交通灯的黄灯叫做 amber，即琥珀色）。按照惯例，构造子的名字以大写字母开头。

```isabelle
term "Green"
```

```output
"Green"
  :: "light"
```

::: definition 数据类型
声明 `datatype t = C₁ τ… | … | Cₙ τ…` 引入一个新类型 `t`，它的值由**构造子** C₁, …, Cₙ 构造。每个构造子接受的参数的类型列在它的后面（也可以没有参数）。用不同构造子构造的值互不相同；用同一个构造子构造的值，只有当它们的参数相等时才相等；并且 `t` 的每个值都是用这些构造子构造的。构造子都不带参数的数据类型称为**枚举类型**（enumeration）。
:::

`light` 上的函数要说明对每个构造子做什么。下面是交通灯的下一个状态 `next_light`：

```isabelle
fun next_light :: "light ⇒ light" where
  "next_light Red = RedAmber"
| "next_light RedAmber = Green"
| "next_light Green = Amber"
| "next_light Amber = Red"
```

```output
consts
  next_light :: "light ⇒ light"

Found termination order: "{}"
```

这就是**模式匹配**（pattern matching）：每个等式的左边都含有一个**模式**（pattern），这里是一个构造子，它说明这个等式适用于哪些参数。等式之间用 `|` 分隔。Isabelle 报告了新常量及其类型，以及一个终止序（termination order）`"{}"`；它是空的，因为 `next_light` 没有调用自身。第 8.7 节会解释这些报告。

```isabelle
value "next_light (next_light Red)"
```

```output
"Green"
  :: "light"
```

定义 8.5 中列出的那些事实随数据类型一起产生，而且 `simp` 知道它们。它能立即证明两个构造子不同：

```isabelle
lemma "Red ≠ Green"
  by simp
```

类型 `light` 的每个值都是这四个构造子之一，所以要证明一个关于所有值的断言，可以依次检查每个构造子。证明方法（proof method）`cases l` 把一个目标（goal）拆分成若干情形，每个构造子一个：

```isabelle
lemma "next_light (next_light (next_light (next_light l))) = l"
  apply (cases l)
```

```output state
proof (prove)
goal (4 subgoals):
 1. l = Red ⟹ next_light (next_light (next_light (next_light l))) = l
 2. l = RedAmber ⟹ next_light (next_light (next_light (next_light l))) = l
 3. l = Green ⟹ next_light (next_light (next_light (next_light l))) = l
 4. l = Amber ⟹ next_light (next_light (next_light (next_light l))) = l
```

每个子目标（subgoal）都为 `l` 假设了一个不同的值。`simp` 利用这个假设替换 `l`，然后进行计算：

```isabelle
  apply simp_all
  done
```

`simp_all` 把 `simp` 应用于所有子目标。用 `value` 做一次测试只能检查一个状态，而这条引理覆盖了全部四个状态。

最后是交通灯的时间安排。每个状态持续固定的秒数，由函数 `duration`（时长）给出：

```isabelle
fun duration :: "light ⇒ nat" where
  "duration Red = 30"
| "duration RedAmber = 2"
| "duration Green = 25"
| "duration Amber = 3"
```

### 递归数据类型 {#recursive}

列表可以任意长，所以任何枚举类型都无法描述所有的列表。**递归数据类型**（recursive datatype）在自己的定义中引用自身。下面把栈（stack）定义成你自己的数据类型；栈就是每门编程课程都会讲到的那种后进先出的存储结构：

```isabelle
datatype 'a stack = Empty | Push 'a "'a stack"
```

这样读：元素类型为 `'a` 的栈，要么是空栈 `Empty`，要么是 `Push x s`，即把元素 `x` 压入（push）栈 `s` 的顶部所得的栈。类型变量使这个类型成为多态的：`nat stack`、`light stack`，等等。不只是单个名字的参数类型，例如 `'a stack`，要放在引号里。

```isabelle
term "Push (1::nat) (Push 2 (Push 3 Empty))"
```

```output
"Push 1 (Push 2 (Push 3 Empty))"
  :: "nat stack"
```

图 8.2 把这个值画成了一棵树。每个 `Push` 有两个分支，即元素和栈的其余部分，而树以 `Empty` 结束。

::: figure id=fig-08-2
递归数据类型的值是一棵由构造子组成的树。左边的栈和右边的列表形状相同。
:::

Isabelle 自己的列表正是这种形状的数据类型。库理论 `List` 实质上把它们定义为 `datatype 'a list = Nil | Cons 'a "'a list"`，并用记号 `[]` 表示 `Nil`，用中缀的 `x # xs` 表示 `Cons x xs`。列表 `[1, 2, 3]` 是 `1 # 2 # 3 # []` 的记号，其中 `#` 向右结合。到目前为止，你用过的每个列表都是用这两个构造子构造的。

递归数据类型上的函数通常也是递归的：每个构造子一个等式，并在内层的栈上做递归调用。下面的 `height` 计算栈的高度，即栈中元素的个数：

```isabelle
primrec height :: "'a stack ⇒ nat" where
  "height Empty = 0"
| "height (Push x s) = Suc (height s)"

primrec to_list :: "'a stack ⇒ 'a list" where
  "to_list Empty = []"
| "to_list (Push x s) = x # to_list s"
```

```output all
consts
  height :: "'a stack ⇒ nat"

consts
  to_list :: "'a stack ⇒ 'a list"
```

`primrec` 是 `fun` 的一个变体，用于这种简单的递归；第 8.4 节会比较两者。`to_list` 把栈变成列表，栈顶元素排在最前面：

```isabelle
value "to_list (Push (1::nat) (Push 2 (Push 3 Empty)))"
```

```output
"[1, 2, 3]"
  :: "nat list"
```

### 选项与有序对 {#options}

空栈的栈顶元素是什么？在 Java 中你可能会得到一个异常，在 C 中则会得到内存里碰巧存放的东西。HOL 函数是全函数，所以类型为 `'a stack ⇒ 'a` 的函数即使对 `Empty` 也必须返回**某个**元素。干净利落的出路是改变结果的类型。HOL 的库实质上定义了

`datatype 'a option = None | Some 'a`

类型为 `'a option` 的值要么是 `None`，表示“没有结果”，要么是 `Some x`，表示结果为 `x`。可能失败的函数返回一个选项值。下面的 `top` 返回栈顶元素，`pop` 把栈顶元素弹出（pop）：

```isabelle
fun top :: "'a stack ⇒ 'a option" where
  "top Empty = None"
| "top (Push x s) = Some x"

fun pop :: "'a stack ⇒ ('a × 'a stack) option" where
  "pop Empty = None"
| "pop (Push x s) = Some (x, s)"
```

`pop` 一次返回两样东西，即栈顶元素和栈的其余部分，它们组成一个类型为 `'a × 'a stack` 的**有序对**（pair）`(x, s)`。

```isabelle
value "pop (Push Red (Push Green Empty))"
```

```output
"Some (Red, Push Green Empty)"
  :: "(light × light stack) option"
```

::: definition 有序对与选项
当 `a :: τ₁` 且 `b :: τ₂` 时，**有序对** `(a, b)` 的类型是 `τ₁ × τ₂`；函数 `fst` 和 `snd` 分别返回它的第一个和第二个分量。三元组 `(a, b, c)` 是 `(a, (b, c))` 的简写。**选项类型**（option type）`'a option` 的值是 `None`，以及对每个 `x :: 'a` 而言的 `Some x`；它是可能缺失的结果的类型。
:::

### 用 case 拆开值 {#case}

接收选项值的函数必须处理两种可能。除了在等式中做模式匹配之外，HOL 还有 **case 表达式**（case expression），它在一个项的内部把一个值与若干模式进行匹配：

```isabelle
fun top_or :: "'a ⇒ 'a stack ⇒ 'a" where
  "top_or d s = (case top s of None ⇒ d | Some x ⇒ x)"
```

`top_or d s` 是 `s` 的栈顶元素；如果 `s` 是空栈，就是默认值 `d`。`case t of p₁ ⇒ e₁ | p₂ ⇒ e₂` 这样读：计算 `t`，找出第一个与它的值匹配的模式 pᵢ，然后返回 eᵢ，其中模式中的变量代表值中与之匹配的部分。这里的箭头和函数类型中的 ⇒ 是同一个符号。和 `if … then … else …` 一样，位于更大的项中的 `case` 表达式必须放在括号里。

```isabelle
value "top_or Red (Push Green Empty)"
value "top_or Red Empty"
```

```output all
"Green"
  :: "light"

"Red"
  :: "light"
```

模式可以嵌套。`Some (x, s)` 匹配一个包含有序对的选项值，并给有序对的两个部分都起了名字：

```isabelle
value "case pop (Push Green (Push Red Empty)) of None ⇒ [] | Some (x, s) ⇒ [x, x]"
```

```output
"[Green, Green]"
  :: "light list"
```

::: tip
`fun` 的等式和 `case` 表达式是同一件事的两种写法。如果函数的行为取决于参数的形状，就用等式；如果需要拆开的是一个中间结果，例如上面的 `top s`，就用 `case`。
:::

## 定义函数的三种方式 {#definitions}

你已经用过 `fun` 和 `primrec` 了。HOL 还有第三个命令：`definition`。三者的区别在于：接受什么样的定义，替你证明什么，以及证明怎样使用它们。

### 非递归函数：definition {#definition}

这个交通灯立在一个十字路口，路口的两个灯分别控制南北和东西两个方向。一条简单而严格的安全规则规定：在每个时刻，两个灯中至少有一个处于状态 `Red`（只亮红灯，而不是红灯和黄灯同时亮）。路口的状态是由两个灯组成的有序对，而这条规则是这种有序对上的函数 `safe`（安全）：

```isabelle
definition safe :: "light × light ⇒ bool" where
  "safe p = (fst p = Red ∨ snd p = Red)"
```

```output
consts
  safe :: "light × light ⇒ bool"
```

`definition` 用单个等式 `f x₁ … xₙ = t` 引入一个常量，其中右边的 `t` 不能提到 `f`：既不能递归，也不能做模式匹配。Isabelle 把这个等式存为一个名为 `safe_def` 的定理：

```isabelle
thm safe_def
```

```output
safe ?p = (fst ?p = Red ∨ snd ?p = Red)
```

问号标出的是模块 7 中的图式变量（schematic variable）：这个等式对每个 `p` 都成立。现在证明某个特定的状态是安全的：

```isabelle fails
lemma "safe (Red, Green)"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. safe (Red, Green)
```

`simp` 根本没能开始：消息“Failed to apply initial proof method”的意思是“未能应用初始证明方法”。与 `fun` 和 `primrec` 的等式不同，`definition` 的等式不会交给化简器（simplifier），所以对 `simp` 来说，`safe` 是一个未知的函数。指明这个定义，`simp` 就会使用它：

```isabelle
lemma "safe (Red, Green)"
  by (simp add: safe_def)

lemma "¬ safe (Green, Amber)"
  by (simp add: safe_def)

lemma safe_Red: "safe (Red, l)"
  by (simp add: safe_def)
```

最后一条引理对东西方向的灯的每个状态 `l` 都成立：只要南北方向的灯是红灯，无论东西方向的灯显示什么，路口都是安全的。

::: keyidea
除非你用 `simp add: f_def` 提出要求，否则 `simp` 不会展开 `definition`。这是有意为之的。一个定义引入一个概念；一旦你证明了它的重要性质，例如 `safe_Red`，后面的证明就应该使用这些性质，而不是定义本身。这样证明就能保持简短；而如果定义改变了，也只需要修复这些性质的证明。模块 9 会介绍更多控制化简器的方法。
:::

::: pitfall
`definition` 不接受模式。如果在左边为有序对写一个模式，定义就会被拒绝：

```isabelle fails
definition safe2 :: "light × light ⇒ bool" where
  "safe2 (a, b) = (a = Red ∨ b = Red)"
```

```output
*** Bad arguments on lhs: "(a, b)"
*** The error(s) above occurred in definition:
*** "safe2 (a, b) ≡
***  a = Red ∨
***  b =
***  Red"
```

消息“Bad arguments on lhs”的意思是“左边（lhs）的参数不合法”。像上面那样使用 `fst` 和 `snd`，或者使用 `case` 表达式，或者改用接受模式的 `fun`。
:::

### 递归函数：fun 与 primrec {#fun-primrec}

`primrec` 只接受**原始递归**（primitive recursion）：每个构造子一个等式，每个等式的模式都是作用于变量的构造子，并且递归调用只作用于参数的直接组成部分，例如 `Push x s` 的等式中的 `height s`。这样的函数总会终止，所以 `primrec` 不需要证明终止性（termination）；正如你在 `height` 那里看到的，它只报告新常量。

`fun` 接受的要多得多：嵌套的模式、多个参数上的模式、相互重叠的等式，以及 Isabelle 能自己找到终止性证明的任何递归。下面这个函数把列表的元素一个接一个地压入栈中；它的递归调用同时改变了两个参数：

```isabelle
fun push_all :: "'a list ⇒ 'a stack ⇒ 'a stack" where
  "push_all [] s = s"
| "push_all (x # xs) s = push_all xs (Push x s)"
```

```output
consts
  push_all :: "'a list ⇒ 'a stack ⇒ 'a stack"

Found termination order: "(λp. length (fst p)) <*mlex*> {}"
```

`fun` 报告了它是怎样证明终止性的：第一个参数（即由参数组成的有序对 `p` 中的 `fst p`）的长度在每次递归调用中都变小。最后压入的元素位于栈顶：

```isabelle
value "to_list (push_all [1, 2, 3::nat] Empty)"
```

```output
"[3, 2, 1]"
  :: "nat list"
```

Both commands give the simplifier the defining equations under the name `f.simps`:

```isabelle
thm height.simps
```

```output
  height Empty = 0
  height (Push ?x ?s) = Suc (height ?s)
```

| | `definition` | `primrec` | `fun` |
|---|---|---|---|
| Recursion | none | primitive: on the immediate parts | general, once termination is proved |
| Patterns | none: `f x₁ … xₙ = t` | one constructor pattern per equation | any constructor patterns, also nested and overlapping |
| Used by `simp` | only with `simp add: f_def` | always (`f.simps`) | always (`f.simps`) |
| Termination | no question | guaranteed by the form | proved automatically, or the definition is rejected |

Which to choose? Use `definition` for a non-recursive concept that you want to reason about abstractly,
`fun` for recursive functions and for anything that needs patterns, and `primrec` when a function follows
the structure of a datatype exactly and you want to be sure no termination proof is involved. Many
users write `fun` almost everywhere, as Module 1 did for `double`.

### Missing and overlapping patterns {#patterns}

What if the equations do not cover every constructor? This function forgets the empty stack:

```isabelle
fun top_value :: "'a stack ⇒ 'a" where
  "top_value (Push x s) = x"
```

```output
### Missing patterns in function definition:
### top_value Empty = undefined

consts
  top_value :: "'a stack ⇒ 'a"

Found termination order: "{}"
```

Isabelle accepts the definition with a warning, and completes it with the equation
`top_value Empty = undefined`. It uses this equation to construct the function, but it does not add it
to `top_value.simps`, so `simp` cannot use it. Here `undefined` is a constant of every type about which
nothing is known:
`top_value Empty` is *some* element, but no proof can tell which. The function is total, as every HOL
function is, but on `Empty` it is **unspecified**. When you try to compute that value, the code behind
`value` has no equation to use and stops with an exception (Section 8.8 explains where this code comes
from):

```isabelle fails
value "top_value (Empty :: nat stack)"
```

```output
*** exception Match raised⌂
```

The ⌂ points into the generated program, not into your theory. The library's `hd`, the first element of a list, is unspecified for `[]` in the same way, and
`value "hd ([] :: light list)"` fails with the same exception.

::: tip
Missing patterns are often a sign of a missing case in your thinking. Prefer an option result, as in
`top`, so that the caller has to handle the empty case. `primrec` warns about a missing constructor too,
with the message `No equation for constructor "Empty"`.
:::

Equations may also **overlap**: one argument may match several patterns. `fun` then uses the first
equation that matches, as Haskell and ML do:

```isabelle
fun is_red :: "light ⇒ bool" where
  "is_red Red = True"
| "is_red l = False"
```

The variable `l` matches every light, `Red` included. `fun` resolves the overlap by turning the second
equation into one equation for each remaining constructor, as `thm` shows:

```isabelle
thm is_red.simps
```

```output
  is_red Red = True
  is_red RedAmber = False
  is_red Green = False
  is_red Amber = False
```

The order of the equations therefore matters. Put the general equation first, and the specific one can
never be used. Isabelle rejects such a definition:

```isabelle fails
fun is_red2 :: "light ⇒ bool" where
  "is_red2 l = False"
| "is_red2 Red = True"
```

```output
*** Equation is redundant (covered by preceding clauses):
*** is_red2 Red =
*** True
```

`primrec` does not accept overlapping equations at all: its patterns must be constructors applied to
variables, and the plain variable `l` is not such a pattern:

```isabelle fails
primrec is_red3 :: "light ⇒ bool" where
  "is_red3 Red = True"
| "is_red3 l = False"
```

```output
*** Constructor pattern missing in left-hand side at
***   is_red3 l =
***   False
```

### When a name is misspelt {#names}

Section 8.1 showed that a misspelt name in a term becomes a free variable. In a definition, a free
variable on the right-hand side has no value, so Isabelle rejects it:

```isabelle fails
fun cycle_time :: "light list ⇒ nat" where
  "cycle_time [] = 0"
| "cycle_time (l # ls) = duraton l + cycle_time ls"
```

```output
*** Variable "duraton" occurs on right hand side only:
*** ⋀l ls duraton.
***    cycle_time (l # ls) =
***    duraton l +
***    cycle_time
***     ls
```

The message lists `duraton` among the variables of the equation (after ⋀, "for all"): Isabelle took
the misspelt `duration` for a variable. Misspelt names of types and theorems give "Undefined" errors
instead, because Isabelle looks them up:

```isabelle fails
thm duraton.simps
```

```output
*** Undefined fact: "duraton.simps"⌂
```

The same happens for a misspelt type in a signature, such as `lights` for `light`: the message is
`Undefined type name: "lights"`.

## Lists in practice {#lists}

Back to the traffic light. A list of states describes how the light behaves over time. `trace n l` is
the list of the first `n` states, starting with `l`:

```isabelle
fun trace :: "nat ⇒ light ⇒ light list" where
  "trace 0 l = []"
| "trace (Suc n) l = l # trace n (next_light l)"
```

```output
consts
  trace :: "nat ⇒ light ⇒ light list"

Found termination order: "(λp. size (fst p)) <*mlex*> {}"
```

```isabelle
value "trace 6 Red"
```

```output
"[Red, RedAmber, Green, Amber, Red, RedAmber]"
  :: "light list"
```

::: example Evaluating trace by hand
`value` computes by rewriting with the defining equations, and you can do the same on paper. Write `3`
as `Suc (Suc (Suc 0))`:

$$
\begin{aligned}
\mathit{trace}\;3\;\mathit{Red} &= \mathit{Red} \mathbin{\#} \mathit{trace}\;2\;(\mathit{next\_light}\;\mathit{Red}) = \mathit{Red} \mathbin{\#} \mathit{trace}\;2\;\mathit{RedAmber}\\
&= \mathit{Red} \mathbin{\#} \mathit{RedAmber} \mathbin{\#} \mathit{trace}\;1\;\mathit{Green}\\
&= \mathit{Red} \mathbin{\#} \mathit{RedAmber} \mathbin{\#} \mathit{Green} \mathbin{\#} \mathit{trace}\;0\;\mathit{Amber}\\
&= [\mathit{Red}, \mathit{RedAmber}, \mathit{Green}]
\end{aligned}
$$

Each step uses an equation of `trace` or of `next_light`. Every recursive call has a smaller first
argument, so the computation reaches `trace 0` and stops.
:::

### The list library {#library}

The theory `List`, part of `Main`, defines about a hundred functions on lists and proves more than a
thousand lemmas about them. These are the ones you will use most:

| Function | What it computes | Example |
|---|---|---|
| `length xs` | the number of elements | `length [a, b] = 2` |
| `xs @ ys` | `xs` followed by `ys` | `[a] @ [b, c] = [a, b, c]` |
| `map f xs` | `f` applied to every element | `map f [a, b] = [f a, f b]` |
| `filter P xs` | the elements that satisfy `P` | `filter P [a, b] = [a]` if `P a` and `¬ P b` |
| `foldr f xs e` | the elements combined with `f`, from the right | `foldr f [a, b] e = f a (f b e)` |
| `zip xs ys` | pairs of corresponding elements | `zip [a, b] [c, d] = [(a, c), (b, d)]` |
| `take n xs`, `drop n xs` | the first `n` elements; the rest | `take 1 [a, b] = [a]` |
| `xs ! n` | element number `n`, counting from 0 | `[a, b] ! 1 = b` |
| `[m..<n]` | the numbers from `m` up to `n − 1` | `[2..<5] = [2, 3, 4]` |

Apply them to traces. How long is each state of one cycle, and how long is the whole cycle?

```isabelle
value "map duration (trace 4 Red)"
```

```output
"[30, 2, 25, 3]"
  :: "nat list"
```

```isabelle
value "sum_list (map duration (trace 4 Red))"
```

```output
"60"
  :: "nat"
```

A full cycle takes a minute. `sum_list` adds up a list of numbers. Which states in a longer trace are
green?

```isabelle
value "filter (λl. l = Green) (trace 9 Red)"
```

```output
"[Green, Green]"
  :: "light list"
```

`foldr` is the general way to combine all elements of a list into one value. `foldr f [x₁, x₂, x₃] e` is
`f x₁ (f x₂ (f x₃ e))`: start from `e` at the right end and combine each element with the result so far.
With `f` adding a state's duration to a running total, it computes the cycle time again:

```isabelle
value "foldr (λl t. duration l + t) (trace 4 Red) 0"
```

```output
"60"
  :: "nat"
```

Figure 8.3 shows `map`, `filter` and `foldr` side by side on one cycle.

::: figure id=fig-08-3
`map` transforms every element, `filter` keeps some of them, and `foldr` combines all of them into one
value. `sum_list` is `foldr (+)` with start value 0.
:::

`zip` pairs two lists element by element, and `[0..<4]` is the list of the numbers 0, 1, 2 and 3, so
together they number the states:

```isabelle
value "zip [0..<4] (trace 4 Red)"
```

```output
"[(0, Red), (1, RedAmber), (2, Green), (3, Amber)]"
  :: "(nat × light) list"
```

`length` counts elements, and `take`, `drop` and `!` cut lists and select elements. Positions count
from 0:

```isabelle
value "length (trace 6 Red)"
value "take 2 (trace 6 Red)"
value "drop 4 (trace 6 Red)"
value "trace 6 Red ! 2"
```

```output all
"6"
  :: "nat"

"[Red, RedAmber]"
  :: "light list"

"[Red, RedAmber]"
  :: "light list"

"Green"
  :: "light"
```

### List comprehension {#comprehension}

Combinations of `map` and `filter` can also be written as a **list comprehension**, as in Haskell and
Python. `[e. x ← xs, P x]` is the list of the values of `e` for the elements `x` of `xs` that satisfy
`P x`. Type ← as `<-`. Here are the short states of a cycle, with their durations:

```isabelle
value "[(l, duration l). l ← trace 4 Red, duration l < 10]"
```

```output
"[(RedAmber, 2), (Amber, 3)]"
  :: "(light × nat) list"
```

The expression `(l, duration l)` builds a pair for each element; `l ← trace 4 Red` is a **generator**,
which takes the elements `l` of the list one by one; `duration l < 10` is a condition. There can be
several generators and conditions, separated by commas.

::: pitfall
Some list functions are unspecified for some arguments: `hd []`, the first element of the empty list,
and `xs ! n` when `n` is not a position of `xs`. They return *some* value of the right type, but nothing
is known about it, and computing it with `value` stops with an exception, as for `top_value` in
Section 8.4. Before you use `hd xs` or `xs ! n` in a definition, make sure that `xs` is not empty or that
`n < length xs`.
:::

## Numbers and type classes {#numbers}

HOL has several types of numbers: `nat`, `int`, and, with the theory `Complex_Main`, `real` and
`complex`. This series needs only `nat` and `int`.

### Natural numbers and integers {#nat-int}

The type `nat` behaves like a datatype with two constructors, `0` and `Suc`: every natural number is
either `0` or `Suc n` for a smaller natural number `n`. That is why you can define functions on `nat` by
pattern matching on `0` and `Suc n`, as `trace` does. A numeral such as `3` denotes the same number as
`Suc (Suc (Suc 0))` (though the two are written differently, which matters for `simp`, as the pitfall at
the end of this section shows), and `value` prints natural numbers as numerals:

```isabelle
value "Suc (Suc 0)"
```

```output
"2"
  :: "nat"
```

The type `int` contains the negative numbers too. The two types differ most visibly in subtraction:

```isabelle
value "(2::nat) - 3"
value "(2::int) - 3"
```

```output all
"0"
  :: "nat"

"- 1"
  :: "int"
```

Isabelle prints negative numbers with a space after the minus sign.

::: definition Truncated subtraction
On `nat`, subtraction is **truncated**: `m - n` is `0` whenever `m ≤ n`, because there is no natural
number below 0. On `int`, subtraction is the usual one.
:::

::: pitfall
Truncated subtraction breaks familiar laws. On `nat`, `(m - n) + n = m` holds only if `n ≤ m`: with
`m = 5` and `n = 7`, the left side is `0 + 7 = 7`. A bank account whose balance is a `nat` cannot go
overdrawn: withdrawing too much leaves exactly 0, silently, instead of a debt. When negative values make
sense, use `int`; when they do not, check `n ≤ m` before you subtract.
:::

Division on `nat` and `int` is `div`, with remainder `mod`:

```isabelle
value "(17::nat) div 5"
value "(17::nat) mod 5"
value "(-17::int) div 5"
value "(-17::int) mod 5"
```

```output all
"3"
  :: "nat"

"2"
  :: "nat"

"- 4"
  :: "int"

"3"
  :: "int"
```

On `int`, `div` rounds down, towards minus infinity, so `-17 div 5` is −4, and `mod` is chosen to make
`(a div b) * b + a mod b = a` hold: (−4) · 5 + 3 = −17. And division by zero?

```isabelle
value "(17::nat) div 0"
```

```output
"0"
  :: "nat"
```

::: fact Division by zero
In HOL, `a div 0 = 0` and `a mod 0 = a` for every `a` (the library's lemmas `div_by_0` and `mod_by_0`).
:::

This is not a mistake. Every HOL function is total, so `17 div 0` must be some number. The library
chooses 0, a value that makes many laws hold without side conditions. A program that divides by zero is
still wrong; the logic does not stop with an error. When division by zero matters, state `b ≠ 0`
as an assumption in your lemmas.

The functions `int :: nat ⇒ int` and `nat :: int ⇒ nat` convert between the two types; `nat` maps
negative integers to 0. The operator `/` is division on fields such as the real numbers, not on `nat`
or `int`, and `x ^ n` is the power xⁿ, with `n` a natural number.

### Overloading and type classes {#classes}

You have used `+`, `0` and numerals on both `nat` and `int`. Such names are **overloaded**: one name has
several meanings, chosen by the type. And yet they do not exist for every type. A light is not a number:

```isabelle fails
value "next_light 3"
```

```output
*** Type unification failed: No type arity light :: numeral
***
*** Type error in application: incompatible operand type
***
*** Operator:  next_light :: light ⇒ light
*** Operand:   3::??'a :: ??'a
***
```

"No type arity light :: numeral" says that the type `light` is not in the class `numeral`, the class of
types that have numerals, so `3` cannot be a light. (An *arity* is Isabelle's record that a type belongs
to a class.) Isabelle organises overloading in **type classes**.

::: definition Type class and sort
A **type class** is a named collection of types that provide certain operations, sometimes with laws.
For example, the class `plus` contains the types that have an operation `+`, `zero` those with a `0`,
`numeral` those with numerals 1, 2, 3, … and an associative `+`, and `ord` those with `≤` and `<`. A type
in a class is an **instance** of it: `nat` and `int` are instances of all four. A **sort** is a set of
classes, written `{c₁, …, cₙ}`, or `c` for a single class. A type variable can be restricted to a sort:
`'a::{one, plus}` stands for any type that is an instance of both `one` and `plus`.
:::

::: analogy
Type classes play the role of interfaces in Java or traits in Rust, and Haskell's type classes are the
same idea. A sort says which interfaces an unknown type must implement.
:::

Isabelle hides sorts unless you ask for them. The option `show_sorts` makes them visible:

```isabelle
declare [[show_sorts]]
term "x + 1"
term "2 + 2"
declare [[show_sorts = false]]
```

```output all
"(x::'a::{one,plus}) + 1"
  :: "'a::{one,plus}"

"(2::'a::numeral) + (2::'a::numeral)"
  :: "'a::numeral"
```

Now you can see what Isabelle knows about the `'a` of Section 8.1: `x + 1` has *some* type that has
`1` and `+`. And `2 + 2` has some type of the class `numeral`. That is the key to the message from
Module 1, which promised that you would learn to read it here:

```isabelle fails
value "2 + 2"
```

```output
*** Wellsortedness error:
*** Type 'a not of sort term_of
*** Cannot derive subsort relation numeral < term_of
```

To print a result, `value` must turn the computed value back into a term. It does so with an overloaded
function `term_of`, which exists for the types in the class `term_of`: `nat`, `int`, lists, and the
datatypes you define, among others. Now read the message line by line.

- **Wellsortedness error**: some type is required to be in a class it is not known to be in.
- **Type 'a not of sort term_of**: the type of `2 + 2` is the unknown `'a`, and `value` needs it to be in
  the class `term_of`.
- **Cannot derive subsort relation numeral < term_of**: all Isabelle knows about `'a` is that it is in
  `numeral`. That would be enough only if every type in `numeral` were also in `term_of`, that is, if
  `numeral` were a subclass of `term_of`, written `numeral < term_of`. It is not.

The cure is the one from Module 1: say which type you mean, as in `value "2 + 2 :: nat"`. The same
missing information can make a proof fail:

```isabelle fails
lemma "x + 0 = x"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. x + 0 = x
```

The goal is about a type of sort `{plus, zero}`: a type with some `+` and some `0`. Nothing in those
classes says that `0` is neutral for `+`, so the claim cannot be proved for every such type. For natural
numbers it is a law of arithmetic:

```isabelle
lemma "x + 0 = (x::nat)"
  by simp
```

::: pitfall
`value` computes with numerals, but `simp` does not match a numeral against a `Suc` pattern. The
equations of `trace` are about `0` and `Suc n`, and `2` is neither, syntactically:

```isabelle fails
lemma "trace 2 Red = [Red, RedAmber]"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. trace 2 Red = [Red, RedAmber]
```

The library lemma `numeral_eq_Suc` rewrites a numeral into `Suc` of a smaller number, after which the
equations of `trace` apply:

```isabelle
lemma "trace 2 Red = [Red, RedAmber]"
  by (simp add: numeral_eq_Suc)
```
:::

## Why every function must terminate {#termination}

Every `fun` you have written produced a line "Found termination order". Module 5 (Section 5.7)
explained why Isabelle insists on termination, what a measure is, and how to read the message when `fun`
rejects a definition. Module 1 promised that this module would explain why termination matters, so this
section recalls the argument and connects it with the three ways of defining a function in Section 8.4.
Then it reads Isabelle's termination messages in full, and shows what to do when a function terminates
but Isabelle cannot see why.

### Total functions and consistency {#total}

When you define a function with `fun`, Isabelle makes your equations into theorems: after
`fun next_light`, the equation `next_light Red = RedAmber` is a theorem you can use in any proof. This is
only safe if some function really satisfies the equations. Module 5 showed what goes wrong otherwise,
with the "definition" `bad n = bad n + 1` of a function `bad :: nat ⇒ nat`. Suppose Isabelle accepted it:

1. The equation would be a theorem for every `n`. Take `n = 0` and write `k` for the number `bad 0`:
   the theorem says `k = k + 1`.
2. Subtract `k` from both sides. This works even with truncated subtraction: `k - k = 0` and
   `(k + 1) - k = 1`. So `0 = 1` would be a theorem.
3. But `0 ≠ 1` is a theorem too: `1` is `Suc 0`, and values built with different constructors are
   different (Definition 8.5; `nat` behaves like a datatype, Section 8.6).
4. A statement and its negation together are a contradiction, and from a contradiction every statement
   follows: the principle of explosion of Module 2, the rule (⊥E) of Module 6.

One bad equation would make every statement a theorem, and every proof would be worthless.

::: keyidea
A `definition` as in Section 8.4 is safe without any proof: its right-hand side does not mention the
constant being defined, so it cannot be circular, and it can never make the logic inconsistent. `fun`
does not take your recursive equations on trust. It first defines the function by non-recursive
definitions of this safe kind, through a construction that Isabelle carries out for you, and then
*proves* your equations from them as theorems. That proof needs a termination argument. If Isabelle
cannot find one, the definition is rejected, and nothing about the function becomes a theorem.
:::

If every chain of recursive calls ends in an equation without a recursive call, the equations determine
the function's value for every argument, one step at a time, as in Example 8.1, and the proof goes
through. Not every non-terminating equation is contradictory: Module 5 pointed out that every function
satisfies `f n = f n`. But `fun` does not try to tell harmless equations from harmful ones; it accepts
recursion only with a termination proof. A missing pattern (Section 8.4) is a different matter: it leaves
a value unspecified, which can never contradict anything, so `fun` only warns about it.

### Reading the termination messages {#termination-messages}

To prove termination, Isabelle looks for a measure, as in Module 5: a function from the arguments to the
natural numbers that becomes smaller with every recursive call. The measures it tries are built from the
sizes of the arguments.

::: definition Size
Every value of a datatype has a **size**, a natural number, written `size x`. For a natural number `n`
the size is `n` itself, and for a list its length. For a value of a datatype you define, the size counts
the constructors in it that have an argument of the same datatype, a **recursive** argument:
`size (Push 1 (Push 2 Empty))` is 2, and every `light` has size 0, because no constructor of `light`
takes an argument.
:::

When the search succeeds, `fun` prints the measure it found. You have seen three kinds of report in this
module:

| Report | Meaning |
|---|---|
| `"{}"` | no recursive calls, nothing to prove (`next_light`, `top`) |
| `"(λp. size (fst p)) <*mlex*> {}"` | the size of the first argument decreases (`trace`) |
| `"(λp. length (fst p)) <*mlex*> {}"` | the length of the first argument, a list, decreases (`push_all`) |

As in Module 5, the arguments of a function with several arguments form one tuple `p`, so `fst p` is the
first argument. `<*mlex*>` chains measures lexicographically, as for Ackermann's function in Module 5: if
the first measure stays the same, the next one must decrease. The final `{}` ends the chain.

When the search fails, Isabelle prints what it tried. Module 5 read the message for `bad`, with one call
and one measure. In general the message has four parts:

- **Calls** lists the recursive calls, named a), b), …, each with the argument before and after the call:
  `a) n ~> n div 2` says that a call with argument `n` leads to a call with argument `n div 2`.
- **Measures** lists the measures Isabelle tried, numbered 1), 2), … .
- **Result matrix** has one row for each call and one column for each measure. Each entry says what
  Isabelle could prove about the measure at that call: `<` means it decreases, `<=` that it does not grow
  (but may stay the same), `?` that Isabelle could prove neither, and `F` that it grows, so that it can
  never decrease there.
- **Unfinished subgoals** are the statements that Isabelle could not prove, each labelled with a call, a
  measure and a relation: `(b, 1, <)` is the claim that measure 1 decreases at call b).

A lexicographic order exists when Isabelle can pick measures one after another so that every call has `<`
under one of the picked measures and `<=` under all the measures picked before it. When no choice works,
the message ends with **Could not find lexicographic termination order**. Exercise 8.8 gives you three
more reports to predict and read.

::: example A function nobody has proved terminating
Module 5 ended its section on termination with the Collatz function, which counts the steps that the
famous "3n + 1" process takes from `n` to 1: halve an even number, triple an odd one and add 1. Here is
what Isabelle says about it:

```isabelle fails
fun collatz :: "nat ⇒ nat" where
  "collatz n = (if n ≤ 1 then 0
                else if n mod 2 = 0 then collatz (n div 2) + 1
                else collatz (3 * n + 1) + 1)"
```

```output
consts
  collatz :: "nat ⇒ nat"

*** Unfinished subgoals:
*** (b, 1, <):
***  1. ⋀n. ⟦¬ n ≤ Suc 0; n mod 2 = Suc 0⟧ ⟹ False
*** (b, 1, <=):
***  1. ⋀n. ⟦¬ n ≤ Suc 0; n mod 2 = Suc 0⟧ ⟹ False
*** Calls:
***   a) n ~> n div 2
***   b) n ~> 3 * n + 1
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  <
*** b:  ?
***
*** Could not find lexicographic termination order.
```

There are two calls and one measure, the size of `n`. Call a), with `n div 2`, decreases it: the entry is
`<`. For call b), with `3 * n + 1`, the two unfinished subgoals show what Isabelle was left with when it
tried to prove that the size decreases (`<`) or at least does not grow (`<=`): `False`, under the
conditions of the call, that `n` is above 1 and odd. Since `3 * n + 1` is larger than `n`, no proof is
possible. (Isabelle writes `F` only when such a goal becomes plain `False`, without conditions; here the
conditions remain, so the entry is `?`.) The row of call b) has no `<`, so there is no termination
order. No other measure is known either: as Module 5 explained, a termination proof would settle the
Collatz conjecture, which is still open.
:::

### When Isabelle needs help {#termination-help}

Some functions terminate, but not by a measure that Isabelle tries. How long must a driver wait for
green? From each state, add up the durations until the light turns green:

```isabelle fails
fun wait :: "light ⇒ nat" where
  "wait l = (if l = Green then 0 else duration l + wait (next_light l))"
```

```output
consts
  wait :: "light ⇒ nat"

*** Unfinished subgoals:
*** (a, 1, <):
***  1. ⋀l. l ≠ Green ⟹ size (next_light l) < size l
*** (a, 1, <=):
***  1. ⋀l. l ≠ Green ⟹ size (next_light l) ≤ size l
*** Calls:
***   a) l ~> next_light l
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  ?
***
*** Could not find lexicographic termination order.
```

The function does terminate: from any state, the light is green after at most three steps. But the only
measure Isabelle tries is the size of `l`, and every light has size 0 (Definition 8.9). A measure that is
always 0 never decreases, so the subgoal for `<` is false. The subgoal for `<=` is true, but Isabelle
would have to split `l` into its four cases to prove it, and it does not try; so the entry is `?`.

One fix is to write the function so that termination is evident. Here the library does the work: take
the first four states, keep those before the first green with `takeWhile`, and add up their durations.
`takeWhile P xs` is the longest initial part of `xs` whose elements all satisfy `P`. The definition is not
recursive at all:

```isabelle
definition wait :: "light ⇒ nat" where
  "wait l = sum_list (map duration (takeWhile (λx. x ≠ Green) (trace 4 l)))"

value "map wait [Red, RedAmber, Green, Amber]"
```

```output
"[32, 2, 0, 35]"
  :: "nat list"
```

A driver who arrives at amber waits 3 + 30 + 2 = 35 seconds.

When no such reformulation is natural, you can supply the measure yourself. Module 5 met an example:
`sum_from i n = (if n < i then 0 else i + sum_from (i + 1) n)` adds up the numbers from `i` to `n`. It
terminates because the distance `n + 1 - i` decreases at every call, but neither argument gets smaller,
so `fun` gives up. The command `function` separates the definition from its termination proof:

```isabelle
function sum_from :: "nat ⇒ nat ⇒ nat" where
  "sum_from i n = (if n < i then 0 else i + sum_from (i + 1) n)"
  by pat_completeness auto
termination
  by (relation "measure (λ(i, n). n + 1 - i)") auto
```

`function` takes the same equations as `fun`, but proves nothing by itself. The line
`by pat_completeness auto` proves that the patterns cover every case and do not contradict each other;
with a single equation that is a formality. `termination` then asks for the termination proof, and you
name the measure. `λ(i, n). n + 1 - i` is the function that maps the pair of arguments `(i, n)` to
`n + 1 - i`; `measure` turns it into the relation "has a smaller measure", and the method `relation`
makes Isabelle use that relation. `auto` proves the rest: that the relation is well-founded, as it is
for every measure (Module 5), and that the call decreases the measure, from `n + 1 - i` to
`n + 1 - (i + 1)`, because the call happens only when `¬ n < i`. Now `sum_from` is defined, and it computes:

```isabelle
value "sum_from 3 5"
```

```output
"12"
  :: "nat"
```

The manual *Defining Recursive Functions in Isabelle/HOL*, under **functions** in the Documentation
panel, explains `function` in depth. Every function defined with `fun` or `function` also comes with an
induction rule that follows its recursion, `f.induct`; Module 11 uses it.

## From HOL to running code {#codegen}

The functions you have defined are programs, and Isabelle can translate them into other programming
languages: Standard ML, OCaml, Haskell and Scala. This is how a function that you have proved correct
becomes part of real software, and Modules 12 and 14 use it for verified programs. Generate Haskell
code for the traffic light:

```isabelle
export_code next_light duration trace in Haskell module_name Traffic
```

```output
See theory exports
```

`export_code` takes the names of the functions to translate, and adds everything they need: here the
datatype `light` and the natural numbers. `module_name` names the Haskell module. Write `in SML`,
`in OCaml` or `in Scala` for the other languages. Only definitions that compute can be translated. A
definition that quantifies over all natural numbers, such as `all_small k = (∀n::nat. n < k)`, has no
program: `export_code` rejects it with a wellsortedness error, because `∀` can be computed only over
types whose elements can be listed, the class `enum`, and `nat` is not in it.

The code does not appear in the Output panel. In Isabelle/jEdit, the words *theory exports* in the
message are a link: click it, and jEdit's File Browser opens on the generated files, in a virtual folder
whose name begins with `isabelle-export:`. The Haskell module is the file `Traffic.hs`, in a folder
`export1` (`export_code` numbers the exports of a theory `export1`, `export2`, …). Here it is, without
its first line, an option for the Haskell compiler, and without the `import` declarations that follow
the `module` line:

```text
module Traffic(Nat, Num, Light, next_light, trace, duration) where {

data Nat = Zero_nat | Suc Nat;

data Num = One | Bit0 Num | Bit1 Num;

data Light = Red | RedAmber | Green | Amber;

plus_nat :: Nat -> Nat -> Nat;
plus_nat Zero_nat n = n;
plus_nat (Suc m) n = plus_nat m (Suc n);

one_nat :: Nat;
one_nat = Suc Zero_nat;

nat_of_num :: Num -> Nat;
nat_of_num One = one_nat;
nat_of_num (Bit0 n) = let {
                        m = nat_of_num n;
                      } in plus_nat m m;
nat_of_num (Bit1 n) = let {
                        m = nat_of_num n;
                      } in Suc (plus_nat m m);

next_light :: Light -> Light;
next_light Red = RedAmber;
next_light RedAmber = Green;
next_light Green = Amber;
next_light Amber = Red;

trace :: Nat -> Light -> [Light];
trace Zero_nat l = [];
trace (Suc n) l = l : trace n (next_light l);

duration :: Light -> Nat;
duration Red = nat_of_num (Bit0 (Bit1 (Bit1 (Bit1 One))));
duration RedAmber = nat_of_num (Bit0 One);
duration Green = nat_of_num (Bit1 (Bit0 (Bit0 (Bit1 One))));
duration Amber = nat_of_num (Bit1 One);

}
```

The translation follows your equations closely. The `module` line names the module `Traffic`, as
`module_name` asked, and lists what it exports. The datatype `light` becomes a Haskell `data` type with
the same constructors, and `next_light` and `trace` have the same equations as in Isabelle. Everything
else is the natural numbers, translated as the logic builds them: a datatype `Nat` with the constructors
`Zero_nat` and `Suc`, and numerals in binary, built from `One` with `Bit0` (append the binary digit 0)
and `Bit1` (append 1). So 30 is `Bit0 (Bit1 (Bit1 (Bit1 One)))`, binary 11110, and `nat_of_num`
converts it into `Suc` form. This representation is faithful but slow. For efficient code, import the
library theory `HOL-Library.Code_Target_Nat` in the theory header (`imports Main
"HOL-Library.Code_Target_Nat"`): the code generator then represents `nat` by Haskell's built-in
integers.

::: note
The code generator is not part of Isabelle's kernel, so the generated code is not checked by the kernel:
the code generator belongs to the trusted base (Module 1). It is designed so that every computation
step of the generated program corresponds to rewriting with equations that are theorems in the logic.
So if the program returns a result, the result agrees with your definitions; the guarantee is called
*partial correctness*. The command `value` uses the same machinery. For a term without variables it
translates the term into ML, runs it, and turns the result back into a term with `term_of`; that is why
it needs the class `term_of` (Section 8.6), and why it stopped with an exception at `top_value Empty`
(Section 8.4). For a term with variables, such as `rev [a, b, c]`, it uses a symbolic variant of the
same translation.
:::

## What you learned {#summary}

- HOL is a typed functional programming language inside a logic. Functions have no side effects, use
  recursion instead of loops, and are total. `typ` prints a type, `term` the type of a term, and `value`
  evaluates a term.
- Types are built from base types (`bool`, `nat`, `int`), type constructors written after their
  arguments (`'a list`, `'a option`), pairs `'a × 'b`, functions `'a ⇒ 'b` and type variables. Isabelle
  infers types; an annotation `t :: τ` fixes one. Misspelt names become free variables.
- `λx. t` is a function without a name. Functions of several arguments are curried: `nat ⇒ nat ⇒ nat`
  means `nat ⇒ (nat ⇒ nat)`, `f x y` means `(f x) y`, and a partial application is a function.
- `datatype` defines enumerations and recursive types such as stacks and lists. Functions take values
  apart by pattern matching in equations or with `case`. Options represent results that may be missing.
- `definition` defines non-recursive functions; `simp` uses `f_def` only when asked. `primrec` allows
  primitive recursion; `fun` allows general patterns and recursion, warns about missing patterns, and
  resolves overlapping ones in order.
- The list library offers `map`, `filter`, `foldr`, `zip`, `take`, `drop`, `!`, `[m..<n]` and list
  comprehension. Subtraction on `nat` is truncated, `div` and `mod` are total, and overloaded
  operations are organised in type classes and sorts.
- Every `fun` must terminate, or its equations could prove `0 = 1`. Isabelle searches for a decreasing
  measure, reports it, and explains its failure with a matrix of calls and measures. With `function` and
  `termination` you supply the measure yourself.
- `export_code` translates definitions into Haskell, SML, OCaml or Scala.

## Exercises {#exercises}

:::: exercise Types by hand {#ex-8-1} ★
Work out the type of each term by hand. Then check your answers with `term` in the theory of this
module, where `Red` and `next_light` are defined.

1. `[Some True, None]`
2. `(Suc, [0::nat])`
3. `λxs. Red # xs`
4. `map next_light`
5. `λf x. f (f x)`

::: solution
```isabelle
term "[Some True, None]"
term "(Suc, [0::nat])"
term "λxs. Red # xs"
term "map next_light"
term "λf x. f (f x)"
```

```output all
"[Some True, None]"
  :: "bool option list"

"(Suc, [0])"
  :: "(nat ⇒ nat) × nat list"

"(#) Red"
  :: "light list ⇒ light list"

"map next_light"
  :: "light list ⇒ light list"

"λf x. f (f x)"
  :: "('a ⇒ 'a) ⇒ 'a ⇒ 'a"
```

1. `None` has type `'a option` for every `'a`; next to `Some True` it must be a `bool option`.
2. A pair of a function `nat ⇒ nat` and a `nat list`.
3. `#` puts a light in front of `xs`, so `xs` is a list of lights, and so is the result. Isabelle
   prints the λ-term as `(#) Red`, the partial application of `#`, for the same reason as it printed
   `(+)` in Section 8.2.
4. A partial application: `map` has received its function, `light ⇒ light`, and waits for the list.
5. `f` is applied to `x` and then to the result `f x`, so its argument type and its result type must be
   the same, `'a`. The term applies a function twice.
:::
::::

:::: exercise Lists by hand {#ex-8-2} ★
Work out the value of each term on paper, then check with `value`.

1. `take 3 (drop 2 [0..<10])`
2. `zip [Red, Green] [1, 2, 3::nat]`
3. `filter (λn. n mod 3 = 0) [0..<10]`
4. `foldr (λx xs. xs @ [x]) [1, 2, 3::nat] []`
5. `[n * n. n ← [1..<5]]`

::: solution
```isabelle
value "take 3 (drop 2 [0..<10])"
value "zip [Red, Green] [1, 2, 3::nat]"
value "filter (λn. n mod 3 = 0) [0..<10]"
value "foldr (λx xs. xs @ [x]) [1, 2, 3::nat] []"
value "[n * n. n ← [1..<5]]"
```

```output all
"[2, 3, 4]"
  :: "nat list"

"[(Red, 1), (Green, 2)]"
  :: "(light × nat) list"

"[0, 3, 6, 9]"
  :: "nat list"

"[3, 2, 1]"
  :: "nat list"

"[1, 4, 9, 16]"
  :: "nat list"
```

1. `drop 2` removes 0 and 1; `take 3` keeps the next three numbers.
2. `zip` stops at the end of the shorter list, so the 3 has no partner.
3. The multiples of 3 below 10, including 0.
4. `foldr f [1, 2, 3] []` is `f 1 (f 2 (f 3 []))`. Each step appends the element at the end of the list
   built so far: first `[3]`, then `[3, 2]`, then `[3, 2, 1]`. This `foldr` reverses the list.
5. The squares of 1 to 4: `[1..<5]` stops before 5.
:::
::::

:::: exercise Natural numbers and integers {#ex-8-3} ★
Predict each value, then check it. Explain each result that surprised you.

1. `(5::nat) - 7 + 7` and `(5::int) - 7 + 7`
2. `(7::nat) div 2 * 2`
3. `(-7::int) div 2` and `(-7::int) mod 2`
4. `(7::nat) mod 0`

::: solution
```isabelle
value "(5::nat) - 7 + 7"
value "(5::int) - 7 + 7"
value "(7::nat) div 2 * 2"
value "(-7::int) div 2"
value "(-7::int) mod 2"
value "(7::nat) mod 0"
```

```output all
"7"
  :: "nat"

"5"
  :: "int"

"6"
  :: "nat"

"- 4"
  :: "int"

"1"
  :: "int"

"7"
  :: "nat"
```

1. On `nat`, `5 - 7` is truncated to 0, and `0 + 7 = 7`. On `int` the result is the expected 5.
2. `7 div 2 = 3`, and `3 * 2 = 6`: integer division throws the remainder away.
3. `div` on `int` rounds down, so `-7 div 2 = -4` (not −3), and then `-7 mod 2 = 1`, because
   `(-4) * 2 + 1 = -7`.
4. `a mod 0 = a`: `mod` is total, like every HOL function, and this is the value the library chooses
   for a remainder by 0 (Fact 8.1).
:::
::::

:::: exercise Is the junction safe? {#ex-8-4} ★★
A designer controls the east–west light of the junction from the north–south light with this function:

```isabelle
fun cross :: "light ⇒ light" where
  "cross Red = Green"
| "cross RedAmber = Amber"
| "cross Green = Red"
| "cross Amber = RedAmber"
```

The state of the junction is `(l, cross l)`. Use `value` and `map` to check `safe` for all four states
`l`. Which states break the rule of Section 8.4? Then write the cycle of a safe controller as a list of
junction states, with all-red states in between, and check with `value` that every state in it is safe.

::: solution
```isabelle
value "map (λl. safe (l, cross l)) [Red, RedAmber, Green, Amber]"
```

```output
"[True, False, True, False]"
  :: "bool list"
```

The states with `l = RedAmber` and `l = Amber` are unsafe: then neither light is in the state `Red`,
because one shows red and amber and the other amber. A safe cycle lets each direction run its sequence while the other is
red, with both red in between:

```isabelle
definition safe_cycle :: "(light × light) list" where
  "safe_cycle = [(Green, Red), (Amber, Red), (Red, Red), (Red, RedAmber),
                 (Red, Green), (Red, Amber), (Red, Red), (RedAmber, Red)]"

value "filter (λp. ¬ safe p) safe_cycle"
```

```output
"[]"
  :: "(light × light) list"
```

No state is unsafe. `value` can use `safe` and `safe_cycle` without being told: the code generator
always uses the equations of definitions, unlike `simp`.
:::
::::

:::: exercise From lists to stacks {#ex-8-5} ★★
Define `from_list :: 'a list ⇒ 'a stack` with `primrec`, so that the first element of the list ends on top
of the stack. Test it with `value`. Then prove `to_list (from_list xs) = xs` and
`height (from_list xs) = length xs` by induction, as in Module 5.

::: solution
```isabelle
primrec from_list :: "'a list ⇒ 'a stack" where
  "from_list [] = Empty"
| "from_list (x # xs) = Push x (from_list xs)"

value "from_list [Red, Green]"
```

```output
"Push Red (Push Green Empty)"
  :: "light stack"
```

```isabelle
lemma "to_list (from_list xs) = xs"
  by (induction xs) auto

lemma "height (from_list xs) = length xs"
  by (induction xs) auto
```

Both proofs follow the recursion of `from_list` over the list: the base case `[]` and the induction step
`x # xs` are computed by the equations of `from_list`, `to_list` and `height`, and the induction step
uses the induction hypothesis. Compare `from_list` with `push_all` from Section 8.4, which puts the *last* element
on top.
:::
::::

:::: exercise An average {#ex-8-6} ★★
Define `average :: nat list ⇒ nat` with `definition`, as the sum of the list divided by its length. Compute
the average duration of the states of one cycle, and `average []`. Why does `average []` not fail? Then
prove `average [] = 0` and, for every `n`, `average [n] = n`.

::: solution
```isabelle
definition average :: "nat list ⇒ nat" where
  "average xs = sum_list xs div length xs"

value "average (map duration (trace 4 Red))"
value "average []"
```

```output all
consts
  average :: "nat list ⇒ nat"

"15"
  :: "nat"

"0"
  :: "nat"
```

The four durations add up to 60, and `60 div 4 = 15`. For the empty list the sum and the length are both
0, and `0 div 0 = 0` (Fact 8.1), so `average []` is 0 rather than an error. Whether 0 is a sensible
average of nothing is a question for the specification, not for Isabelle.

```isabelle
lemma "average [] = 0"
  by (simp add: average_def)

lemma "average [n] = n"
  by (simp add: average_def)
```

Without `add: average_def`, `simp` would fail, as it did for `safe` in Section 8.4.
:::
::::

:::: exercise Sensor codes {#ex-8-7} ★★★
A sensor reports the state of the light as a number: 0 for red, 1 for red and amber, 2 for green and 3 for
amber. Define `code_of :: light ⇒ nat` and a decoder `light_of :: nat ⇒ light option` with `fun`, using
the patterns `0`, `Suc 0`, … and a final catch-all equation that returns `None` for every other number.
Check with `thm light_of.simps` how `fun` handled the overlapping last equation. Test the decoder on
`[0, 2, 7]`. Then prove that decoding undoes encoding: `light_of (code_of l) = Some l`.
(Hint: the pitfall at the end of Section 8.6.)

::: solution
```isabelle
fun code_of :: "light ⇒ nat" where
  "code_of Red = 0"
| "code_of RedAmber = 1"
| "code_of Green = 2"
| "code_of Amber = 3"

fun light_of :: "nat ⇒ light option" where
  "light_of 0 = Some Red"
| "light_of (Suc 0) = Some RedAmber"
| "light_of (Suc (Suc 0)) = Some Green"
| "light_of (Suc (Suc (Suc 0))) = Some Amber"
| "light_of n = None"

thm light_of.simps
```

```output
  light_of 0 = Some Red
  light_of (Suc 0) = Some RedAmber
  light_of (Suc (Suc 0)) = Some Green
  light_of (Suc (Suc (Suc 0))) = Some Amber
  light_of (Suc (Suc (Suc (Suc ?va)))) = None
```

`fun` replaced the catch-all equation by one for the numbers that the earlier equations do not cover:
those of the form `Suc (Suc (Suc (Suc ?va)))`, that is, 4 and above.

```isabelle
value "map light_of [0, 2, 7]"
```

```output
"[Some Red, Some Green, None]"
  :: "light option list"
```

For the proof, split on `l` with `cases`. In each case the goal is about a numeral, such as
`light_of 2 = Some Green`, and the equations of `light_of` are about `Suc` patterns. `numeral_eq_Suc`
turns the numerals into `Suc` form:

```isabelle
lemma "light_of (code_of l) = Some l"
  by (cases l) (simp_all add: numeral_eq_Suc)
```

Without `numeral_eq_Suc`, `simp` proves the cases for `Red` and `RedAmber` but gets stuck on
`light_of 2 = Some Green` and `light_of 3 = Some Amber`, as the pitfall predicts.
:::
::::

:::: exercise Termination in Isabelle's words {#ex-8-8} ★★★
For each definition, predict whether `fun` accepts it, and what it reports: the termination order, or
the entries of the result matrix. Then try it.

1. `merge`, which merges two sorted lists into one sorted list, with the type
   `'a::linorder list ⇒ 'a list ⇒ 'a list` and the equations `merge [] ys = ys`, `merge xs [] = xs` and
   `merge (x # xs) (y # ys) = (if x ≤ y then x # merge xs (y # ys) else y # merge (x # xs) ys)`. The
   class `linorder` contains the types with a linear order `≤`, such as `nat` and `int`.
2. `forever n = forever (n + 1)`, with type `nat ⇒ nat`. Is it as dangerous as `bad` in Section 8.7?
3. `count_up i n = (if i < n then count_up (i + 1) n + 1 else 0)`, with type `nat ⇒ nat ⇒ nat`, from
   Exercise 5.8, which `fun` rejects. Define it with `function`, as `sum_from` in Section 8.7, and compute
   `count_up 3 10`.

::: solution
1. Accepted:

   ```isabelle
   fun merge :: "'a::linorder list ⇒ 'a list ⇒ 'a list" where
     "merge [] ys = ys"
   | "merge xs [] = xs"
   | "merge (x # xs) (y # ys) =
        (if x ≤ y then x # merge xs (y # ys) else y # merge (x # xs) ys)"

   value "merge [1, 4, 6] [2, 3, 7::nat]"
   ```

   ```output all
   consts
     merge :: "'a list ⇒ 'a list ⇒ 'a list"

   Found termination order:
     "(λp. length (snd p)) <*mlex*> (λp. length (fst p)) <*mlex*> {}"

   "[1, 2, 3, 4, 6, 7]"
     :: "nat list"
   ```

   There are two recursive calls. The first makes the first list shorter and keeps the second; the
   second call does the opposite. So neither length decreases at both calls, and no single measure works,
   but a lexicographic order does, as for Ackermann's function in Module 5. Isabelle picked the length of
   the second list first: it decreases (`<`) at the second call and stays the same (`<=`) at the first
   call, where the length of the first list then decreases. Comparing the first lists first would work as
   well.

2. Rejected:

   ```isabelle fails
   fun forever :: "nat ⇒ nat" where
     "forever n = forever (n + 1)"
   ```

   ```output
   consts
     forever :: "nat ⇒ nat"

   *** Unfinished subgoals:
   *** (a, 1, <):
   ***  1. False
   *** Calls:
   ***   a) n ~> n + 1
   *** Measures:
   ***   1) size
   *** Result matrix:
   ***     1
   *** a:  F
   ***
   *** Could not find lexicographic termination order.
   ```

   The call goes from `n` to `n + 1`, so the size grows, and the matrix entry is `F`: the claim that the
   size does not grow, `n + 1 ≤ n`, became plain `False`. No measure can work at all: it would have to
   decrease from `n` to `n + 1` to `n + 2` and so on, an infinite descending chain of natural numbers.
   But `forever` is not dangerous in the way `bad` is: every constant function satisfies
   `forever n = forever (n + 1)`, so the equation is not contradictory. It is merely not a definition: it
   does not determine which function `forever` is, and as a program it runs forever. Like `f n = f n` in
   Module 5, it shows that `fun` rejects every recursion whose termination it cannot prove, whether the
   equations are contradictory or not.

3. The measure is `n - i`. The call happens only when `i < n`, and then `n - (i + 1) < n - i`:

   ```isabelle
   function count_up :: "nat ⇒ nat ⇒ nat" where
     "count_up i n = (if i < n then count_up (i + 1) n + 1 else 0)"
     by pat_completeness auto
   termination
     by (relation "measure (λ(i, n). n - i)") auto

   value "count_up 3 10"
   ```

   ```output
   "7"
     :: "nat"
   ```

   `count_up i n` counts the steps from `i` up to `n`, so it equals `n - i`, here 7.
:::
::::

## Check yourself {#quiz}

```quiz
? What is the difference between the commands `term` and `value`?
- [ ] `term` works only for terms without variables
- [x] `term` prints a term and its type without evaluating it; `value` evaluates it
- [ ] `value` prints only the type, `term` only the value
- [ ] There is none; they are two names for the same command
> `term "(λx::nat. x * x) 7"` prints `7 * 7`, after β-reduction but without arithmetic; `value` prints `49`.

? What is the type of `map Suc`?
- [ ] `nat ⇒ nat`
- [ ] `(nat ⇒ nat) ⇒ nat list ⇒ nat list`
- [x] `nat list ⇒ nat list`
- [ ] `nat list`
> `map :: ('a ⇒ 'b) ⇒ 'a list ⇒ 'b list` has received its first argument, `Suc :: nat ⇒ nat`. The partial application waits for a list of natural numbers.

? What does `value "(3::nat) - 5"` print?
- [ ] `- 2`
- [ ] an error, because the result is negative
- [ ] `2`
- [x] `0`
> Subtraction on `nat` is truncated: `m - n = 0` whenever `m ≤ n`.

? You define `safe` with `definition`, and `lemma "safe (Red, Green)" by simp` fails. Why?
- [x] `simp` does not use the equation of a `definition` unless you add it, as in `simp add: safe_def`
- [ ] The lemma is false
- [ ] `definition` cannot define functions on pairs
- [ ] `simp` cannot prove statements about datatypes
> Definitions are not unfolded automatically, so that proofs can use proved properties of a concept instead of its definition.

? Why does `fun` refuse a recursive definition whose termination it cannot prove?
- [ ] Because non-terminating functions would make `value` slow
- [ ] Because HOL has no type for infinite computations
- [x] Because the equations of a non-terminating "definition" can be contradictory, as `f x = f x + 1` implies `0 = 1`
- [ ] Because the code generator cannot translate such functions
> `fun` proves your equations from a construction that needs a termination argument. Without one, accepting the equations could make the logic inconsistent.

? `value "2 + 2"` reports "Cannot derive subsort relation numeral < term_of". What is the cause?
- [ ] The number 2 is too small for `value`
- [ ] Natural numbers cannot be added with `value`
- [ ] The class `numeral` is not defined in `Main`
- [x] The type of `2 + 2` is unknown; Isabelle knows only that it has numerals, which is not enough to print the result
> `value` needs the class `term_of` to print a result. A type annotation such as `:: nat` fixes the type and removes the error.
```
