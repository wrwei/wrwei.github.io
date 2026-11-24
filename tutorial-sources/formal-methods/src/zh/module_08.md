---
title: HOL 中的函数式编程
part: 3
lead: 把 Isabelle/HOL 用作带类型的函数式编程语言。定义数据类型和函数并用它们求值，读懂 Isabelle 输出的类型和消息，证明递归定义的终止性，再把可执行的定义导出为 Haskell 代码。
minutes: 210
needs: 模块 1–7
goals:
  - 读写 HOL 的类型和项，并用 `typ`、`term` 和 `value` 查看它们
  - 使用 λ 抽象、柯里化和部分应用
  - 定义数据类型，并用 `definition`、`fun` 和 `primrec` 定义其上的函数
  - 用列表和数进行计算，并用类型类解释重载的记号
  - 解释为什么`fun`需要终止性，阅读Isabelle的终止性消息，并在Isabelle无法找到时提供一个度量
  - 用 `export_code` 从你的定义生成 Haskell 代码
imports: Main
---

## 逻辑中的程序 {#hol}

在第二部分中，你使用 Isabelle 检查关于公式的证明。第三部分转向 Isabelle/HOL 的另一半：其可执行定义构成一种编程语言。HOL 包含一种类型化的 **函数式编程语言**，与 Haskell、OCaml 和 Standard ML（Isabelle 核心部分的编程语言）相近。你将程序写为等式，Isabelle 运行它们，并且由于程序是逻辑的一部分，你可以证明关于它们的性质。模块 9 至 11 涉及证明；本模块涉及编程。

HOL 中的程序与 Python、Java 或 C 中的程序有三点不同。

- **无副作用。** HOL 函数不修改变量、打印或读取文件。其参数
  确定其数学值。状态变化可以通过显式传递输入和输出状态来建模。
- **重复的递归。** 此处函数使用递归，如 Module 5 所示。循环也可
  在 HOL 中建模；它们在这些函数定义中不是原始构造。
- **每个函数都是全函数。**它表示其类型中每个参数对应的值。这并不意味着
  即每个 HOL 函数都具有可执行代码，或每次求值均成功。第 8.7 节解释了为何 `fun` 接受的递归方程需要终止性证明。

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
像 `bool`、`nat` 或 `int` 这样的**基本类型**（base type）就是一个名字。像 `list` 或 `option` 这样的**类型构造子**（type constructor）由其他类型构造出新的类型，它写在参数的**后面**：`nat list` 是自然数列表的类型，`nat list list` 是由这种列表组成的列表的类型。`'a × 'b` 是有序对的类型，`'a ⇒ 'b` 是函数的类型。**类型变元**（type variable）`'a`、`'b`……代表任意类型；如果一个函数的类型中含有类型变元，例如 `rev :: 'a list ⇒ 'a list`，那么它对这个类型的每个实例都适用，这样的函数称为**多态的**（polymorphic）。
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

**项**是 HOL 的表达式，可以是 `True`、`0` 或 `rev` 这样的常量，`x` 这样的变量，`rev xs` 这样的函数应用，或本模块介绍的其他形式。命令 `term` 读入项、推断其类型，并打印项及其类型，但不将它作为程序来执行：

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
**类型推断**根据常量与变量的类型以及应用与绑定施加的约束，计算项中每个部分的类型。当常量使类型保持开放时，结果包含类型变元。**类型注解** `t :: τ`（或在较大项内的 `(t::τ)`）告知 Isabelle `t` 具有类型 τ。
:::

在下面这个项中，常量没有确定类型：

```isabelle
term "x + 1"
```

```output
"x + 1"
  :: "'a"
```

变量 `x` 和数 `1` 可以是自然数、整数或实数：它们都有 `+` 和 `1`。Isabelle 的回答是类型变元 `'a`，意思是“某个类型”。加一个标注就能确定下来：

```isabelle
term "x + (1::nat)"
```

```output
"x + 1"
  :: "nat"
```

由于 `+` 的两个参数类型相同，现在 `x` 也是 `nat` 了。第 8.6 节会解释 Isabelle 对 `x + 1` 中的 `'a` 知道些什么。

`x` 是一个 **自由变元**：它既不是已声明的常量，也不是由量词或 λ 绑定的。Isabelle/jEdit 将自由变元显示为蓝色，而如 `Suc` 这样的常量显示为黑色。

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

这里没有任何错误消息。如果 `value` 把你的项原样返回，而类型是 `'a` 这样的类型变元，就找一找有没有拼错的名字：Isabelle/jEdit 会像显示其他变量一样，用蓝色显示它。
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

Isabelle 把 `rev [1, 2] [3]` 读作把列表 `rev [1, 2]` 应用于 `[3]`。列表不是函数，所以**运算符** `rev [1, 2]` 是“not of function type”（不是函数类型）。在冲突的两个类型中，`_ ⇒ _` 代表“某个函数类型”，`_ list` 代表“某个列表类型”。`[3]` 的类型 `??'a` 是 Isabelle 在处理这个项时临时引入的一个类型变元，它始终不需要被确定下来。

## 函数也是值 {#functions}

在 HOL 中，函数和数、列表一样是值。你可以把函数传给另一个函数，把它作为结果返回，也可以把它放在列表里。本节说明怎样写出不需要名字的函数，以及多参数函数是怎样工作的。

### λ 抽象 {#lambda}

要写一个函数而不给它起名字，就使用 **λ 抽象**（λ-abstraction）：`λx. x + 1` 是把 `x` 映射为 `x + 1` 的函数，读作“lambda x，x 加 1”。λ 用 `%` 或 `\lambda` 输入。

::: definition λ 抽象与函数应用
若`t`是类型为τ₂的项，其中可能包含类型为τ₁的变量`x`，则`λx. t`是类型为τ₁ ⇒ τ₂的函数，它将每个值`x`映射为`t`。函数`f`对参数`a`的**Application**记作`f a`，无需括号或逗号。将`λx. t`应用于`a`会将`t`中`x`的自由出现替换为`a`，并在必要时重命名绑定变量以避免捕获`a`中的变量（Module 3）。此步骤称为**β-reduction**。
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

`Suc`的操作数是函数`Suc :: nat ⇒ nat`，其中需要`nat`。写出`Suc (Suc 0)`。缺失括号是类型错误的常见原因。
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
声明 `datatype t = C₁ τ… | … | Cₙ τ…` 引入一个新类型 `t`，它的值由**构造子**C₁, …, Cₙ 构造。每个构造子接受的参数的类型列在它的后面（也可以没有参数）。用不同构造子构造的值互不相同；用同一个构造子构造的值，只有当它们的参数相等时才相等；并且 `t` 的每个值都是用这些构造子构造的。构造子都不带参数的数据类型称为**枚举类型**（enumeration）。
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

数据类型提供了定义8.5的构造子性质。`simp`中可用区分性与单射性；`cases`方法下方的穷尽性支持。`simp`立即证明两个构造子不同：

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

`simp_all` 将 `simp` 应用于所有子目标。在单一光源处求值方程可验证该实例；该引理覆盖全部四个实例。由于此类型有限，穷举计算亦可验证全部四个实例。

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

这样读：元素类型为 `'a` 的栈，要么是空栈 `Empty`，要么是 `Push x s`，即把元素 `x` 压入（push）栈 `s` 的顶部所得的栈。类型变元使这个类型成为多态的：`nat stack`、`light stack`，等等。不只是单个名字的参数类型，例如 `'a stack`，要放在引号里。

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

空栈的栈顶元素是什么？实现可能会抛出异常；C 语言中无效的内存访问可能具有未定义行为。类型为 `'a stack ⇒ 'a` 的 HOL 函数即使对于 `Empty` 也表示*某个*元素，而不一定提供计算它的代码。为了明确表示缺失的结果，更改结果类型。HOL 库本质上定义了

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
当 `a :: τ₁` 且 `b :: τ₂` 时，**有序对**`(a, b)` 的类型是 `τ₁ × τ₂`；函数 `fst` 和 `snd` 分别返回它的第一个和第二个分量。三元组 `(a, b, c)` 是 `(a, (b, c))` 的简写。**选项类型**（option type）`'a option` 的值是 `None`，以及对每个 `x :: 'a` 而言的 `Some x`；它是可能缺失的结果的类型。
:::

### 用 case 拆开值 {#case}

接收选项值的函数必须处理两种可能。除了在等式中做模式匹配之外，HOL 还有 **case 表达式**（case expression），它在一个项的内部把一个值与若干模式进行匹配：

```isabelle
fun top_or :: "'a ⇒ 'a stack ⇒ 'a" where
  "top_or d s = (case top s of None ⇒ d | Some x ⇒ x)"
```

`top_or d s` 是 `s` 的顶层元素，或当 `s` 为空时的默认值 `d`。将 `case t of p₁ ⇒ e₁ | p₂ ⇒ e₂` 读作：计算 `t`，找到匹配其值的第一个模式 pᵢ，并返回 eᵢ，其中模式的变量代表匹配部分。箭头与函数类型中的 ⇒ 相同。较大项中的 `case` 表达式通常需要括号来标记其范围，如 `if … then … else …`。

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
默认情况下，`definition` 不将其等式注册为化简规则。你可以使用 `simp add: f_def` 或将其注册以供后续使用（Module 9）。这是有意的。定义引入一个概念；一旦你证明了其重要性质，如 `safe_Red`，后续证明应使用这些性质而非定义。这样证明保持简短，且若定义更改，仅需修复性质证明。Module 9 展示了更多控制化简器的方法。
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

对于此处简单的数据类型，`primrec`使用**原始递归**：包含构造函数参数变量的构造函数模式，且递归调用仅针对参数的直接递归部分，例如`height s`在`Push x s`的方程中。此类函数总是终止，因此`primrec`无需终止性证明；它仅报告新常量，正如你在`height`中所见。

`fun` 接受更广泛的内容：嵌套模式、多参数模式、重叠方程以及一大类 Isabelle 自动证明终止的递归定义。该函数将列表元素逐个压入栈中；其递归调用同时改变两个参数：

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

两个命令均将定义方程以名称 `f.simps` 提供给化简器：

```isabelle
thm height.simps
```

```output
  height Empty = 0
  height (Push ?x ?s) = Suc (height ?s)
```

| | `definition` | `primrec` | `fun` |
|---|---|---|---|
| 递归 | none | 原始定义：关于直接部分 | 一般地，一旦终止性得证 |
| 模式 | none: `f x₁ … xₙ = t` | 构造器模式带有变量参数 | 构造子模式，包括嵌套和重叠的 |
| 由 `simp` 使用 | 默认未注册；添加 `f_def` | `f.simps` 默认注册 | `f.simps` 默认注册 |
| 终止性 | no question | 由形式保证 | 自动证明。若证明失败，则拒绝该定义 |

如何选择？使用 `definition` 对希望抽象推理的非递归概念进行形式化规约，使用 `fun` 处理递归函数及任何需要模式匹配的情况，并在函数完全遵循数据类型结构且希望确保不涉及终止性证明时使用 `primrec`。许多用户几乎在所有地方都使用 `fun`，正如 Module 1 对 `double` 所做的那样。

### 缺失与重叠的模式 {#patterns}

如果方程未覆盖所有构造子，此函数会忽略空栈：

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

Isabelle 接受该定义并给出警告，使用等式 `top_value Empty = undefined` 完成它。它利用该等式构造函数，但未将其添加到 `top_value.simps`，因此 `simp` 不会自动使用它。此处 `undefined` 是一个多态常量，其值除类型外未指定：`top_value Empty` 是 *某个* 元素，定义未选定特定元素。该函数是全函数，如同所有 HOL 函数一样，但在 `Empty` 上它是 **unspecified**。当你尝试计算该值时，`value` 背后的代码没有可用的等式，并以异常停止（第 8.8 节解释了该代码的来源）：

```isabelle fails
value "top_value (Empty :: nat stack)"
```

```output
*** exception Match raised⌂
```

⌂ 指向生成的程序，而非你的理论。库的 `hd`（列表的第一个元素）对于 `[]` 未指定，方式相同，且 `value "hd ([] :: light list)"` 以相同的异常失败。

::: tip
缺失的模式通常表明思维中遗漏了某个情况。优先使用选项结果，如 `top` 所示，以便调用者必须处理空情况。`primrec` 也会警告缺失的构造子，并附带消息 `No equation for constructor "Empty"`。
:::

方程也可能**重叠**：一个参数可能匹配多个模式。`fun` 然后使用第一个匹配的方程，正如 Haskell 和 ML 所做的那样：

```isabelle
fun is_red :: "light ⇒ bool" where
  "is_red Red = True"
| "is_red l = False"
```

变量`l`匹配所有灯，`Red`包含在内。`fun`通过将第二个方程转化为每个剩余构造器的一个方程来解决重叠，如`thm`所示：

```isabelle
thm is_red.simps
```

```output
  is_red Red = True
  is_red RedAmber = False
  is_red Green = False
  is_red Amber = False
```

因此方程的顺序至关重要。将一般方程置于前面，则具体方程将永远无法被使用。Isabelle 会拒绝此类定义：

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

`primrec` 完全不接受重叠方程：其模式必须是应用于变量的构造函数，而普通变量 `l` 不是此类模式：

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

### 当名称拼写错误时 {#names}

第 8.1 节表明，项中拼写错误的名称会成为自由变元。在定义中，右侧的自由变元不由参数确定，因此 Isabelle 会拒绝它：

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

消息列表 `duraton` 在等式的变量中（在 ⋀，“对于所有”之后）：Isabelle 将拼写错误的 `duration` 视为变量。类型和定理的拼写错误会给出“Undefined”错误，因为 Isabelle 会查找它们：

```isabelle fails
thm duraton.simps
```

```output
*** Undefined fact: "duraton.simps"⌂
```

签名中拼写错误的类型也会发生同样的情况，例如 `lights` 对应于 `light`：消息为 `Undefined type name: "lights"`。

## 实践中的列表 {#lists}

回到交通灯。状态列表描述了灯光随时间的行为。`trace n l` 是前 `n` 个状态的列表，从 `l` 开始：

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

::: example 通过手工评估轨迹
`value` 执行的计算遵循定义方程，你可以在纸上做同样的操作。将 `3` 写为 `Suc (Suc (Suc 0))`：

$$
\begin{aligned}
\mathit{trace}\;3\;\mathit{Red} &= \mathit{Red} \mathbin{\#} \mathit{trace}\;2\;(\mathit{next\_light}\;\mathit{Red}) = \mathit{Red} \mathbin{\#} \mathit{trace}\;2\;\mathit{RedAmber}\\
&= \mathit{Red} \mathbin{\#} \mathit{RedAmber} \mathbin{\#} \mathit{trace}\;1\;\mathit{Green}\\
&= \mathit{Red} \mathbin{\#} \mathit{RedAmber} \mathbin{\#} \mathit{Green} \mathbin{\#} \mathit{trace}\;0\;\mathit{Amber}\\
&= [\mathit{Red}, \mathit{RedAmber}, \mathit{Green}]
\end{aligned}
$$

每一步使用`trace`或`next_light`的等式。每个递归调用具有更小的第一个参数，因此计算到达`trace 0`并停止。
:::

### 列表库 {#library}

理论`List`，作为`Main`的一部分，定义了约一百个列表函数，并证明了关于它们的一千多个引理。这些是你将最常使用的：

| 函数 | 它计算什么 | 例 |
|---|---|---|
| `length xs` | 元素的数量 | `length [a, b] = 2` |
| `xs @ ys` | `xs` 后接 `ys` | `[a] @ [b, c] = [a, b, c]` |
| `map f xs` | `f` 应用于每个元素 | `map f [a, b] = [f a, f b]` |
| `filter P xs` | 满足`P`的元素 | `filter P [a, b] = [a]` 如果 `P a` 且 `¬ P b` |
| `foldr f xs e` | 与 `f` 结合的元素，从右侧 | `foldr f [a, b] e = f a (f b e)` |
| `zip xs ys` | 对应元素对 | `zip [a, b] [c, d] = [(a, c), (b, d)]` |
| `take n xs`, `drop n xs` | 前 `n` 个元素；其余 | `take 1 [a, b] = [a]` |
| `xs ! n` | 元素编号 `n`，从 0 开始计数 | `[a, b] ! 1 = b` |
| `[m..<n]` | 从 `m` 到 `n − 1` 的数字 | `[2..<5] = [2, 3, 4]` |

将它们应用于轨迹。一个周期中每个状态持续多长时间，整个周期持续多长时间？

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

一个完整周期耗时一分钟。`sum_list` 对数字列表求和。在更长的轨迹中，哪些状态是绿色的？

```isabelle
value "filter (λl. l = Green) (trace 9 Red)"
```

```output
"[Green, Green]"
  :: "light list"
```

`foldr` 是将列表所有元素合并为单个值的通用方式。`foldr f [x₁, x₂, x₃] e` 是 `f x₁ (f x₂ (f x₃ e))`：从右侧的 `e` 开始，将每个元素与迄今为止的结果进行合并。通过 `f` 将状态持续时间累加到运行总计中，它重新计算了周期时间：

```isabelle
value "foldr (λl t. duration l + t) (trace 4 Red) 0"
```

```output
"60"
  :: "nat"
```

图 8.3 展示了 `map`、`filter` 和 `foldr` 在单个周期中的并排情况。

::: figure id=fig-08-3
`map` 变换每个元素，`filter` 保留其中部分元素，`foldr` 将它们组合为一个值。`sum_list` 是带有初始值 0 的 `foldr (+)`。
:::

`zip` 按元素对两个列表进行配对，`[0..<4]` 是数字 0、1、2 和 3 的列表，因此它们共同对状态进行编号：

```isabelle
value "zip [0..<4] (trace 4 Red)"
```

```output
"[(0, Red), (1, RedAmber), (2, Green), (3, Amber)]"
  :: "(nat × light) list"
```

`length` 统计元素，`take`、`drop` 和 `!` 截断列表并选取元素。位置从 0 开始计数：

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

### 列表推导 {#comprehension}

`map` 与 `filter` 的组合也可写成 **list comprehension**，如 Haskell 和 Python 中所示。`[e. x ← xs, P x]` 是满足 `P x` 的 `xs` 的元素 `x` 对应的 `e` 值的列表。键入 `<-` 以表示 ←。以下是周期的短状态及其持续时间：

```isabelle
value "[(l, duration l). l ← trace 4 Red, duration l < 10]"
```

```output
"[(RedAmber, 2), (Amber, 3)]"
  :: "(light × nat) list"
```

表达式`(l, duration l)`为每个元素构建一对；`l ← trace 4 Red`是**生成器**，它依次取列表的`l`元素；`duration l < 10`是条件。可以有多个生成器和条件，用逗号分隔。

::: pitfall
某些列表函数对部分参数未指定：`hd []`（空列表的首元素）以及当`n`不是`xs`的位置时的`xs ! n`。它们表示右侧类型的*某个*值，而不指定具体是哪一个，使用`value`计算时会抛出异常，如第8.4节中的`top_value`所示。在定义中使用`hd xs`或`xs ! n`之前，请确保`xs`非空或满足`n < length xs`。
:::

## 数字与类型类 {#numbers}

HOL 拥有多种数字类型：`nat`、`int`，以及通过理论 `Complex_Main` 引入的 `real` 和 `complex`。本系列仅需 `nat` 和 `int`。

### 自然数与整数 {#nat-int}

类型`nat`的行为类似于具有两个构造子`0`和`Suc`的数据类型：每个自然数要么是`0`，要么是`Suc n`，其中`n`是较小的自然数。这就是为什么你可以通过对`0`和`Suc n`进行模式匹配来定义`nat`上的函数，正如`trace`所做的那样。像`3`这样的数字表示与`Suc (Suc (Suc 0))`相同的数（尽管两者的写法不同，这对`simp`很重要，正如本节末尾的陷阱所示），而`value`将自然数打印为数字：

```isabelle
value "Suc (Suc 0)"
```

```output
"2"
  :: "nat"
```

类型`int`包含负数。两种类型在减法上的差异最为显著：

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

Isabelle 打印负数时，在减号后保留一个空格。

::: definition 截断减法
在`nat`上，减法被**截断**：当`m ≤ n`时`m - n`为`0`，因为没有小于0的自然数。在`int`上，减法是通常的减法。
:::

::: pitfall
截断减法破坏了熟悉的定律。在`nat`上，`(m - n) + n = m`仅在`n ≤ m`时成立：给定`m = 5`和`n = 7`，左侧为`0 + 7 = 7`。余额为`nat`的银行账户不能透支：提取过多会静默地留下恰好0，而非债务。当负值有意义时使用`int`；当无意义时，在减法前检查`n ≤ m`。
:::

`nat` 除以 `int` 得 `div`，余数为 `mod`：

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

在`int`上，`div`向下舍入（朝向负无穷），因此`-17 div 5`为−4，且选择`mod`以使`(a div b) * b + a mod b = a`成立：(−4) · 5 + 3 = −17。那除以零呢？

```isabelle
value "(17::nat) div 0"
```

```output
"0"
  :: "nat"
```

::: fact 零除法
在 HOL 中，`a div 0 = 0` 和 `a mod 0 = a` 对于每个 `a`（库的引理 `div_by_0` 和 `mod_by_0`）。
:::

这不是错误。每个 HOL 函数都是全函数，因此 `17 div 0` 必须是某个数。库选择 0，该值使许多定律在无需附加条件的情况下成立。被要求拒绝除以零的程序需要显式检查；逻辑不会对该操作抛出错误。当除以零至关重要时，在引理中将 `b ≠ 0` 声明为假设。

函数 `int :: nat ⇒ int` 和 `nat :: int ⇒ nat` 在两种类型之间进行转换；`nat` 将负整数映射为 0。运算符 `/` 是实数域等域上的除法，而非在 `nat` 或 `int` 上，`x ^ n` 是幂 xⁿ，其中 `n` 为自然数。

### 重载与类型类 {#classes}

你已在`nat`和`int`上使用了`+`、`0`及数字。此类名称是**overloaded**：一个名称具有多个含义，由类型决定。然而它们并非对每种类型都存在。光不是数字：

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

“No type arity light :: numeral”表示类型 `light` 不属于支持数值字面量的类 `numeral`，因此 `3` 不能是该灯色类型的值。Isabelle 用 arity 记录类型属于某个类的信息，并用**类型类**管理重载。

::: definition 类型类与排序
**类型类**是一个有名称的类型集合，所含类型提供指定的运算，有时还要满足某些定律。例如，`plus` 所含的类型有运算 `+`，`zero` 要求有 `0`，`numeral` 要求有数值字面量 1、2、3 等，并且 `+` 满足结合律，`ord` 要求有 `≤` 和 `<`。属于一个类的类型称为该类的**实例**。`nat` 和 `int` 都是上述四个类的实例。**类型类约束（sort）**是一组类型类，记作 `{c₁, …, cₙ}`，单个类可以写成 `c`。给类型变元加上这样的约束时，`'a::{one, plus}` 表示同时是 `one` 和 `plus` 实例的任意类型。
:::

::: analogy
类型类扮演 Java 中接口或 Rust 中特征的角色，Haskell 的类型类也是相同的理念。排序规定了未知类型必须实现的接口。
:::

除非显式请求，否则 Isabelle 会隐藏类型类（sorts）。选项 `show_sorts` 使其可见：

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

现在你可以看到 Isabelle 对第 8.1 节中 `'a` 的了解：`x + 1` 具有 `1` 和 `+` 的*某些*类型。且 `2 + 2` 具有类 `numeral` 的某些类型。这就是来自 Module 1 消息的关键，该消息承诺你将在此处学会阅读它：

```isabelle fails
value "2 + 2"
```

```output
*** Wellsortedness error:
*** Type 'a not of sort term_of
*** Cannot derive subsort relation numeral < term_of
```

要打印结果，`value`必须将计算出的值转换回项。它通过类`term_of`中存在的重载函数`term_of`来实现，该函数适用于`nat`、`int`、列表以及您定义的数据类型等类型。现在逐行阅读消息。

- **排序良好性错误**：某些类型被要求属于其未被确知所属的类。
- **类型 'a 不属于 sort term_of**：`2 + 2` 的类型为未知 `'a`，且 `value` 需要其属于
  类 `term_of`。
- **无法推导出子类型关系 numeral < term_of**：Isabelle 对`'a`所知仅限于其属于
  `numeral`. 那将仅在 `numeral` 中的每个类型也属于 `term_of` 时成立，即若 `numeral` 是 `term_of` 的子类，记作 `numeral < term_of`。事实并非如此。

解决方案来自 Module 1：指明你意指的类型，如 `value "2 + 2 :: nat"` 所示。同样的缺失信息会导致证明失败：

```isabelle fails
lemma "x + 0 = x"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. x + 0 = x
```

目标是关于一个类型为 `{plus, zero}` 的排序：一个具有某些 `+` 和某些 `0` 的类型。这些类中没有任何内容表明 `0` 对 `+` 是中性的，因此该声明不能对每个这样的类型进行证明。对于自然数，它是算术定律：

```isabelle
lemma "x + 0 = (x::nat)"
  by simp
```

::: pitfall
`value` 对数值进行计算，但 `simp` 不会将数值与 `Suc` 模式进行匹配。`trace` 的方程涉及 `0` 和 `Suc n`，而 `2` 在语法上均非如此：

```isabelle fails
lemma "trace 2 Red = [Red, RedAmber]"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. trace 2 Red = [Red, RedAmber]
```

库引理 `numeral_eq_Suc` 将数字重写为更小的数字 `Suc`，随后 `trace` 的等式适用：

```isabelle
lemma "trace 2 Red = [Red, RedAmber]"
  by (simp add: numeral_eq_Suc)
```
:::

## 为什么 fun 需要终止性 {#termination}

此前每次使用 `fun`，你都见到过“Found termination order”（已找到终止序）。第 5.7 节解释了 Isabelle 为什么要求终止性、什么是度量，以及 `fun` 拒绝定义时如何读报错。模块 1 提过这个问题。本节先复习终止性的理由，并说明它与第 8.4 节三种定义函数的方法的关系，然后逐项读懂 Isabelle 的终止性报告，看看已知函数终止而 Isabelle 未能证明时该怎么做。

### 总函数与一致性 {#total}

当使用`fun`定义函数时，Isabelle 会将你的方程转化为定理：在`fun next_light`之后，方程`next_light Red = RedAmber`成为可在任何证明中使用的定理。仅当确实存在满足这些方程的函数时，这才是安全的。模块 5 展示了否则会发生的问题，即函数`bad :: nat ⇒ nat`的“定义”`bad n = bad n + 1`。假设 Isabelle 接受了它：

1. 该方程对于每个`n`都是定理。取`n = 0`并令`k`为数值`bad 0`：
   该定理表明 `k = k + 1`。
2. 从两边减去 `k`。即使使用截断减法也成立：`k - k = 0` 和
   `(k + 1) - k = 1`. 因此，`0 = 1` 将是一个定理。
3. 但 `0 ≠ 1` 也是一个定理：`1` 是 `Suc 0`，且由不同构造器构建的值
   不同（定义 8.5；`nat` 表现如数据类型，第 8.6 节）。
4. 一个命题与其否定共同构成矛盾，且从矛盾中可以推导出任何命题
   遵循 Module 2 的爆炸原理与 Module 6 的 (⊥E) 规则。

一个错误的等式会使每个陈述成为定理，且每个证明都毫无价值。

::: keyidea
A `definition` 如第 8.4 节所述，无需任何证明即安全：其右侧未提及所定义的常量，因此不会循环，且绝不会使逻辑不一致。`fun` 并不盲目信任你的递归方程。它首先通过 Isabelle 为你执行的构造，以这种安全类型的非递归定义定义函数，然后*证明*你的方程作为定理。该证明需要终止论证。如果 Isabelle 无法找到，`fun` 失败：它不提供作为定理的无限制定义方程。底层 `function` 包可以保留部分定义和条件事实，这超出了本介绍的范围。
:::

如果每个递归调用链都终止于不含递归调用的方程，则方程逐步确定每个参数的函数值，如例8.1所示，证明即可成立。并非所有非终止方程都是矛盾的：模块5指出每个函数都满足`f n = f n`。但`fun`并未尝试区分无害方程与有害方程；它仅在提供终止证明时才接受递归。缺失模式（第8.4节）则是另一回事：它使某个值未指定，这永远不与任何内容矛盾，因此`fun`仅对此发出警告。

### 阅读终止消息 {#termination-messages}

为证明终止性，Isabelle 寻找一个度量，如 Module 5 中所示：一个从参数到自然数的函数，在每次递归调用时都会变小。它尝试的度量由参数的大小构建。

::: definition Size
对于此处定义的数据类型，Isabelle 提供了 **size**，即一个自然数，记作 `size x`。对于自然数 `n`，其大小为 `n` 本身；对于列表，其大小为长度。对于我们的栈，`Empty` 的大小为 0，且每个 `Push` 将内部栈的大小加 1：`size (Push 1 (Push 2 Empty))` 的大小为 2。每个 `light` 都有大小
0. 其他数据类型可能具有不同的大小方程；检查其生成的 `t.size` 事实
因此，与其假设 `size` 计算每个构造子或每个存储元素，
:::

当搜索成功时，`fun` 打印它找到的度量。你在此模块中见过三种报告：

| 报告 | 含义 |
|---|---|
| `"{}"` | 无递归调用，无需证明 (`next_light`, `top`) |
| `"(λp. size (fst p)) <*mlex*> {}"` | 第一个参数的大小减小（`trace`） |
| `"(λp. length (fst p)) <*mlex*> {}"` | 第一个参数（一个列表）的长度递减（`push_all`） |

与 Module 5 类似，具有多个参数的函数的参数构成一个元组 `p`，因此 `fst p` 是第一个参数。`<*mlex*>` 对度量进行字典序链接，如同 Module 5 中 Ackermann 函数的情况：如果第一个度量保持不变，则下一个度量必须减小。最终的 `{}` 结束该链。

当搜索失败时，Isabelle 会打印它尝试过的内容。Module 5 读取了 `bad` 的消息，其中包含一次调用和一次度量。一般而言，该消息由四个部分组成：

- **Calls** 列出递归调用，命名为 a)、b)、…，每个调用均包含调用前后的参数：
  `a) n ~> n div 2` 表示带有参数 `n` 的调用会导致带有参数 `n div 2` 的调用。
- **Measures** 列出了 Isabelle 尝试的度量，编号为 1)、2)、… 。
- **结果矩阵**的每行对应一次调用，每列对应一个度量。每个单元格说明
  Isabelle 可证明该调用处的度量：`<` 表示其递减，`<=` 表示其不增长（但可能保持不变），`?` 表示 Isabelle 无法证明任何情况，`F` 表示其递增，因此在该处永远无法递减。
- **未完成子目标**是 Isabelle 无法证明的命题，每个均带有调用、一个
  度量与关系：`(b, 1, <)` 是断言在调用 b) 时度量 1 减小。

当 Isabelle 能够依次选取度量，使得每次调用在其中一个选取的度量下满足 `<`，并在所有之前选取的度量下满足 `<=` 时，存在字典序。当无选择可行时，消息以 **Could not find lexicographic termination order** 结尾。练习 8.8 提供了另外三个报告供预测和阅读。

::: example 一个无人证明终止的函数
模块 5 以 Collatz 函数结束其关于终止性的章节，该函数计算著名的“3n + 1”过程从 `n` 到 1 所需的步数：对偶数减半，对奇数乘三加一。以下是 Isabelle 对此的说明：

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

存在两次调用和一个度量，即`n`的大小。调用a)使用`n div 2`使其减小：条目为`<`。对于调用b)，使用`3 * n + 1`，两个未完成的子目标展示了Isabelle在尝试证明大小减小（`<`）或至少不增长（`<=`）时留下的内容：在调用条件下，`False`表明`n`大于1且为奇数。由于`3 * n + 1`大于`n`，无法进行证明。（Isabelle仅在目标变为无条件的`False`时才写入`F`；此处条件仍然存在，因此条目为`?`。）调用b)的行没有`<`，因此不存在终止序。也没有其他已知的度量：正如模块5所述，终止证明将解决科拉茨猜想，该猜想目前仍是开放的。
:::

### 当 Isabelle 需要帮助时 {#termination-help}

某些函数终止，但并非通过 Isabelle 尝试的度量。司机等待绿灯需多长时间？从每个状态起，累加至灯变绿的时间段：

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

这个函数确实会终止。从任意状态出发，最多三步后灯就变绿。但是 Isabelle 唯一尝试的度量是 `l` 的大小。按定义 8.9，每种灯色的大小都是 0。恒为 0 的度量无法减小，所以 `<` 的子目标为假。`<=` 的子目标为真，但证明需要把 `l` 分为四种情形，Isabelle 并未尝试这样做，所以矩阵中的条目为 `?`。

一种修复方案是编写函数使得终止性显而易见。此处由库完成工作：取前四个状态，保留第一个绿色状态 `takeWhile` 之前的状态，并累加它们的持续时间。`takeWhile P xs` 是 `xs` 的最长初始部分，其所有元素均满足 `P`。该定义完全不递归：

```isabelle
definition wait :: "light ⇒ nat" where
  "wait l = sum_list (map duration (takeWhile (λx. x ≠ Green) (trace 4 l)))"

value "map wait [Red, RedAmber, Green, Amber]"
```

```output
"[32, 2, 0, 35]"
  :: "nat list"
```

到达琥珀色交通灯的驾驶员需等待 3 + 30 + 2 = 35 秒。

当没有自然的公式化约时，你可以自行提供测度。模块 5 遇到了一个例子：`sum_from i n = (if n < i then 0 else i + sum_from (i + 1) n)` 将数字从 `i` 累加到 `n`。它终止是因为距离 `n + 1 - i` 在每次调用时都减小，但两个参数都没有变小，因此 `fun` 放弃。命令 `function` 将定义与其终止性证明分离：

```isabelle
function sum_from :: "nat ⇒ nat ⇒ nat" where
  "sum_from i n = (if n < i then 0 else i + sum_from (i + 1) n)"
  by pat_completeness auto
termination
  by (relation "measure (λ(i, n). n + 1 - i)") auto
```

`function` 接受与 `fun` 相同的方程，但将证明义务留给你。`by pat_completeness auto` 行证明模式覆盖所有情况且互不矛盾；对于单个方程，这仅是形式上的。`termination` 随后要求终止证明，你命名了度量。`λ(i, n). n + 1 - i` 是将参数对 `(i, n)` 映射到 `n + 1 - i` 的函数；`measure` 将其转化为“具有更小度量”的关系，`relation` 方法使 Isabelle 使用该关系。`auto` 证明其余部分：该关系是良基的，因为每个自然数度量都是良基的（第 5 模块），且调用使度量从 `n + 1 - i` 减小到 `n + 1 - (i + 1)`，因为调用仅发生在 `¬ n < i` 时。现在定义了 `sum_from`，它进行计算：

```isabelle
value "sum_from 3 5"
```

```output
"12"
  :: "nat"
```

手册《在 Isabelle/HOL 中定义递归函数》在 Documentation 面板的 **functions** 下深入解释了 `function`。在证明终止性后，这些定义还提供了遵循递归的归纳规则 `f.induct`；Module 11 使用了它。

## 从 HOL 到可运行代码 {#codegen}

您定义的可执行函数是程序，Isabelle 可将它们翻译为其他编程语言：Standard ML、OCaml、Haskell 和 Scala。这就是您证明正确的函数成为真实软件一部分的方式，Modules 12 和 14 利用它进行验证程序。生成交通灯的 Haskell 代码：

```isabelle
export_code next_light duration trace in Haskell module_name Traffic
```

```output
See theory exports
```

`export_code` 接受要翻译的函数名称，并添加它们所需的一切：此处为数据类型 `light` 与自然数。`module_name` 命名 Haskell 模块。对其它语言使用 `in SML`、`in OCaml` 或 `in Scala`。翻译需要所涉及操作的可执行代码方程。例如，导出原始定义 `all_small k = (∀n::nat. n < k)` 会因良构性错误而失败：`∀` 的默认代码枚举类 `enum` 中的类型，而 `nat` 不在该类中。这并不意味着 `all_small` 不可计算：它始终为 `False`（取 `n = k`），因此已证明的代码方程 `all_small k = False` 可使其可执行。在将规范转化为运行代码时（如 Module 12），这种区分至关重要。

代码未出现在 Output 面板中。在 Isabelle/jEdit 中，消息中的 *theory exports* 一词是一个链接：点击它，jEdit 的 File Browser 会在名称以 `isabelle-export:` 开头的虚拟文件夹中打开生成的文件。Haskell 模块是文件 `Traffic.hs`，位于文件夹 `export1` 中（`export_code` 对理论 `export1` 的导出进行编号，`export2`，…）。此处为去除首行、Haskell 编译器选项以及 `module` 行之后的 `import` 声明后的内容：

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

该翻译紧密遵循您的方程。`module`行命名了模块`Traffic`，如`module_name`所要求，并列出其导出内容。数据类型`light`成为具有相同构造器的Haskell`data`类型，且`next_light`和`trace`拥有与Isabelle中相同的方程。其余部分为自然数，随逻辑构建方式翻译为：具有构造器`Zero_nat`和`Suc`的数据类型`Nat`，以及基于`One`使用`Bit0`（追加二进制位0）和`Bit1`（追加1）构建的二进制数字。因此30为`Bit0 (Bit1 (Bit1 (Bit1 One)))`（二进制11110），且`nat_of_num`将其转换为`Suc`形式。此表示法忠实但缓慢。为获得高效代码，需在理论头（`imports Main "HOL-Library.Code_Target_Nat"`）中导入库理论`HOL-Library.Code_Target_Nat`：代码生成器随后使用Haskell内置整数表示`nat`。

::: note
代码生成器不属于 Isabelle 内核，因此生成的代码不由内核检查：代码生成器属于可信基础（模块 1）。其设计使得生成程序的每个计算步骤都对应于使用逻辑中定理的等式进行化简。假设生成器、其配置和目标运行时保持这种对应关系，则返回结果与逻辑定义一致；这提供了部分正确性保证。它不保证生成的代码在每个目标语言输入上终止或避免资源错误。命令 `value` 使用相同的机制。对于不含变量的项，它将该项翻译为 ML，运行它，并通过 `term_of` 将结果转换回项；这就是它需要类 `term_of`（第 8.6 节）的原因，以及为什么它在 `top_value Empty` 处因异常而停止（第 8.4 节）。对于包含变量的项，如 `rev [a, b, c]`，它使用相同翻译的符号变体。
:::

## 小结 {#summary}

- HOL 支持在逻辑内部进行类型化的函数式编程。函数表示全数学
  映射；此处可执行定义使用递归且无副作用。`typ` 打印类型，`term` 打印项及其类型，`value` 求值项。
- 类型由基类型（`bool`, `nat`, `int`）和紧随其后的类型构造器构建
  参数（`'a list`, `'a option`）、对 `'a × 'b`、函数 `'a ⇒ 'b` 及类型变元。Isabelle 推断类型；注解 `t :: τ` 固定其一。在项中，未声明的名称可能成为自由变元。
- `λx. t` 是一个无名函数。多参数函数采用柯里化：`nat ⇒ nat ⇒ nat`
  `nat ⇒ (nat ⇒ nat)` 表示含义，`f x y` 表示 `(f x) y`，且部分应用是一个函数。
- `datatype` 定义了枚举和递归类型（如栈和列表）。函数取值
  通过方程中的模式匹配或`case`进行分离。选项表示可能缺失的结果。
- `definition` 定义非递归函数；`f_def` 默认情况下不是化简规则。`primrec` 允许
  原始递归；`fun` 允许通用模式与递归，警告缺失模式，并按顺序解决重叠模式。
- 列表库提供了`map`、`filter`、`foldr`、`zip`、`take`、`drop`、`!`、`[m..<n]`和list
  理解。`nat`上的减法为截断式，`div`与`mod`为全函数，重载操作按类型类与种类组织。
- `fun` 要求在提供无限制定义方程之前终止：接受任意
  递归方程可证明`0 = 1`。Isabelle 搜索递减度量，报告其结果，并通过调用与度量矩阵解释其失败。借助`function`与`termination`，你可自行提供度量。
- `export_code` 将定义规约为 Haskell、SML、OCaml 或 Scala。

## 练习 {#exercises}

:::: exercise 手工定义类型 {#ex-8-1} ★
通过手工推导每个项的类型，然后在包含 `Red` 和 `next_light` 定义的本模块理论中，利用 `term` 验证你的答案。

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

1. `None` 对于每个 `'a` 具有类型 `'a option`；在 `Some True` 旁边它必须是一个 `bool option`。
2. 函数 `nat ⇒ nat` 与 `nat list` 的配对。
3. `#` 在 `xs` 前方放置一盏灯，因此 `xs` 是一个灯列表，且结果亦然。Isabelle
   打印 λ-项为 `(#) Red`，`#` 的部分应用，原因与在 Section 8.2 中打印 `(+)` 相同。
4. 偏应用：`map` 已接收其函数 `light ⇒ light`，并等待列表。
5. `f` 应用于 `x` 并应用于结果 `f x`，因此其参数类型和结果类型必须
   相同，`'a`。该术语将函数应用两次。
:::
::::

:::: exercise 手工定义列表 {#ex-8-2} ★
在纸上计算每个项的值，然后使用`value`进行验证。

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

1. `drop 2` 移除 0 和 1；`take 3` 保留接下来的三个数字。
2. `zip` 在较短列表的末尾停止，因此 3 没有配对。
3. 3 的倍数，小于 10，包含 0。
4. `foldr f [1, 2, 3] []` 是 `f 1 (f 2 (f 3 []))`。每一步将元素追加到列表末尾
   到目前为止构建的：首先是 `[3]`，然后是 `[3, 2]`，接着是 `[3, 2, 1]`。这个 `foldr` 反转列表。
5. 1 到 4 的平方：`[1..<5]` 在 5 之前停止。
:::
::::

:::: exercise 自然数与整数 {#ex-8-3} ★
预测每个值，然后验证。解释每个令你惊讶的结果。

1. `(5::nat) - 7 + 7` 与 `(5::int) - 7 + 7`
2. `(7::nat) div 2 * 2`
3. `(-7::int) div 2` 与 `(-7::int) mod 2`
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

1. 在`nat`上，`5 - 7`被截断为0，且`0 + 7 = 7`。在`int`上，结果是预期的5。
2. `7 div 2 = 3`, 且 `3 * 2 = 6`: 整数除法丢弃余数。
3. `div` on `int` 向下取整，因此 `-7 div 2 = -4` (not −3)，然后 `-7 mod 2 = 1`，因为
   `(-4) * 2 + 1 = -7`.
4. `a mod 0 = a`: `mod` 是全的，如同每个 HOL 函数，这是库选择的值
   对于余数除以 0（Fact 8.1）。
:::
::::

:::: exercise 交叉路口的安全性如何？ {#ex-8-4} ★★
设计者通过此函数利用南北方向交通灯控制东西方向交通灯：

```isabelle
fun cross :: "light ⇒ light" where
  "cross Red = Green"
| "cross RedAmber = Amber"
| "cross Green = Red"
| "cross Amber = RedAmber"
```

交叉路口的状态为`(l, cross l)`。使用`value`和`map`对全部四种状态`l`检查`safe`。哪些状态违反了第8.4节的规则？随后，将安全控制器的循环表示为包含所有全红状态的路径状态列表，并使用`value`验证其中的每个状态均安全。

::: solution
```isabelle
value "map (λl. safe (l, cross l)) [Red, RedAmber, Green, Amber]"
```

```output
"[True, False, True, False]"
  :: "bool list"
```

状态包含`l = RedAmber`和`l = Amber`是不安全的：此时两个灯均不处于状态`Red`，因为一个显示红灯和琥珀灯，另一个显示琥珀灯。安全循环允许每个方向运行其序列，而另一个方向为红灯，中间状态均为红灯：

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

没有状态是不安全的。`value` 可以使用 `safe` 和 `safe_cycle` 而无需被告知：代码生成器始终使用定义方程，不同于 `simp`。
:::
::::

:::: exercise 从列表到栈 {#ex-8-5} ★★
用 `primrec` 定义 `from_list :: 'a list ⇒ 'a stack`，使得列表的第一个元素位于栈顶。用 `value` 测试它。然后像 Module 5 中那样，通过归纳法证明 `to_list (from_list xs) = xs` 和 `height (from_list xs) = length xs`。

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

两个证明均遵循对列表中 `from_list` 的递归：基本情况 `[]` 和归纳步骤 `x # xs` 由 `from_list`、`to_list` 和 `height` 的方程计算得出，且归纳步骤使用了归纳假设。将 `from_list` 与第 8.4 节中的 `push_all` 进行比较，后者将最后一个元素置于顶部。
:::
::::

:::: exercise 一个平均 {#ex-8-6} ★★
用 `definition` 定义 `average :: nat list ⇒ nat`，即列表之和除以其长度。计算一个周期内状态的平均持续时间，以及 `average []`。为什么 `average []` 不会失败？然后证明 `average [] = 0`，并且对于每个 `n`，证明 `average [n] = n`。

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

四个持续时间之和为 60，且 `60 div 4 = 15`。对于空列表，其和与长度均为 0，且 `0 div 0 = 0`（Fact 8.1），因此 `average []` 为 0 而非错误。0 是否是“无”的合理平均值是规范层面的问题，而非 Isabelle 的问题。

```isabelle
lemma "average [] = 0"
  by (simp add: average_def)

lemma "average [n] = n"
  by (simp add: average_def)
```

没有`add: average_def`，`simp`会失败，正如第8.4节中`safe`的情况一样。
:::
::::

:::: exercise 传感器代码 {#ex-8-7} ★★★
传感器将灯光状态报告为一个数字：0 代表红色，1 代表红黄灯，2 代表绿灯，3 代表黄灯。定义 `code_of :: light ⇒ nat` 和解码器 `light_of :: nat ⇒ light option`，使用模式 `fun`，并采用模式 `0`、`Suc 0` 等以及一个返回 `None` 的通配方程处理其他所有数字。使用 `thm light_of.simps` 检查 `fun` 如何处理重叠的最后一个方程。在 `[0, 2, 7]` 上测试解码器。然后证明解码逆转编码：`light_of (code_of l) = Some l`。（提示：第 8.6 节末尾的陷阱。）

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

`fun` 用针对前序方程未覆盖的数字（即形如 `Suc (Suc (Suc (Suc ?va)))`，也就是 4 及以上的数）的方程替换了通配方程。

```isabelle
value "map light_of [0, 2, 7]"
```

```output
"[Some Red, Some Green, None]"
  :: "light option list"
```

对于证明，对`l`进行`cases`拆分。在每种情况下，目标都关于一个数字，如`light_of 2 = Some Green`，而`light_of`的方程关于`Suc`模式。`numeral_eq_Suc`将数字转换为`Suc`形式：

```isabelle
lemma "light_of (code_of l) = Some l"
  by (cases l) (simp_all add: numeral_eq_Suc)
```

没有`numeral_eq_Suc`，`simp`证明了`Red`和`RedAmber`的情况，但在`light_of 2 = Some Green`和`light_of 3 = Some Amber`上卡住了，正如陷阱所预测的那样。
:::
::::

:::: exercise Isabelle 中的终止性 {#ex-8-8} ★★★
对于每个定义，预测 `fun` 是否接受它，以及它报告的是终止序还是结果矩阵的条目。然后尝试执行。

1. `merge`，它将两个有序列表合并为一个有序列表，具有类型
   `'a::linorder list ⇒ 'a list ⇒ 'a list` 以及方程 `merge [] ys = ys`、`merge xs [] = xs` 和 `merge (x # xs) (y # ys) = (if x ≤ y then x # merge xs (y # ys) else y # merge (x # xs) ys)`。类 `linorder` 包含具有线性序 `≤` 的类型，例如 `nat` 和 `int`。
2. `forever n = forever (n + 1)`，类型为`nat ⇒ nat`。它是否如第8.7节中的`bad`那样危险？
3. `count_up i n = (if i < n then count_up (i + 1) n + 1 else 0)`，类型为`nat ⇒ nat ⇒ nat`，来自
   练习 5.8，其 `fun` 被拒绝。使用 `function` 定义它，如第 8.7 节中的 `sum_from`，并计算 `count_up 3 10`。

::: solution
1. 已接受：

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

   存在两个递归调用。第一个调用使第一个列表变短而保持第二个列表不变；第二个调用则相反。因此，仅凭任一参数的长度在两个调用中都不会同时减小。它们的总和可作为合适的单一度量；Isabelle 改为找到字典序，如 Module 5 中 Ackermann 函数所示。它首先选取第二个列表的长度：在第二个调用中它减小 (`<`)，在第一个调用中保持不变 (`<=`)，此时第一个列表的长度减小。优先比较第一个列表同样可行。

2. 被拒绝

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

   调用从`n`到`n + 1`，因此规模增大，且矩阵条目为`F`：规模不增的断言`n + 1 ≤ n`变为显然的`False`。任何度量均无法工作：它必须从`n`递减至`n + 1`再至`n + 2`等，构成自然数的无限下降链。但`forever`不像`bad`那样危险：每个常数函数均满足`forever n = forever (n + 1)`，因此方程并不矛盾。它仅仅不是定义：它未确定函数`forever`具体为何，且作为程序它将无限运行。如同Module 5中的`f n = f n`所示，它表明`fun`拒绝所有其终止性无法证明的递归，无论方程是否矛盾。

3. 度量为`n - i`。调用仅在`i < n`时发生，随后为`n - (i + 1) < n - i`：

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

   `count_up i n` 计算从 `i` 到 `n` 的步骤数，因此等于 `n - i`，此处为 7。
:::
::::

## 自测题 {#quiz}

```quiz
? `term`与`value`命令的区别是什么？
- [ ] `term` 仅适用于不含变量的项
- [x] `term` 打印一个项及其类型而不对其进行求值；`value` 对其求值
- [ ] `value` 仅打印类型，`term` 仅打印值
- [ ] 没有；它们是同一命令的两个名称
> `term "(λx::nat. x * x) 7"` 打印 `7 * 7`，在 β-规约之后但不进行算术运算；`value` 打印 `49`。

? `map Suc` 的类型是什么？
- [ ] `nat ⇒ nat`
- [ ] `(nat ⇒ nat) ⇒ nat list ⇒ nat list`
- [x] `nat list ⇒ nat list`
- [ ] `nat list`
> `map :: ('a ⇒ 'b) ⇒ 'a list ⇒ 'b list` 已接收其第一个参数 `Suc :: nat ⇒ nat`。部分应用等待一个自然数列表。

? `value "(3::nat) - 5"` 打印什么？
- [ ] `- 2`
- [ ] 一个错误，因为结果是负数
- [ ] `2`
- [x] `0`
> `nat` 上的减法被截断：当 `m ≤ n` 时结果为 `m - n = 0`。

? 你使用 `definition` 定义了 `safe`，但 `lemma "safe (Red, Green)" by simp` 失败了。为什么？
- [x] `simp` 不使用 `definition` 的等式，除非你像 `simp add: safe_def` 那样添加它
- [ ] 该引理为假
- [ ] `definition` 无法在二元组上定义函数
- [ ] `simp` 无法证明关于数据类型（datatypes）的语句
> `definition` 默认不通过 `simp` 注册其方程。当展开（unfolding）有用时，你可以提供或注册它。

? 为什么`fun`拒绝其无法证明终止的递归定义？
- [ ] 因为非终止函数会使 `value` 变慢
- [ ] 因为 HOL 没有表示无限计算的数据类型
- [x] 由于非终止“定义”的方程可能矛盾，如`f x = f x + 1`蕴含`0 = 1`
- [ ] 由于代码生成器无法翻译此类函数
> `fun` 从需要终止论证的构造中证明你的方程。若无终止论证，接受这些方程可能导致逻辑不一致。

? `value "2 + 2"` 报告“无法推导子类型关系 numeral < term_of”。原因是什么？
- [ ] 数字 2 对于 `value` 来说太小了
- [ ] 自然数无法与 `value` 相加
- [ ] 类`numeral`未在`Main`中定义
- [x] `2 + 2` 的类型未知；Isabelle 仅知它包含数字，这不足以打印结果
> `value` 需要类 `term_of` 才能打印结果。形如 `:: nat` 的类型注解可固定类型并消除错误。
```
